'use client';
import { useCallback, useMemo } from 'react';
import { Comment } from './Comment';
import { AnimatePresence, motion } from 'framer-motion';
import { GetComment } from '@/types/definitions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getComments } from '@/lib/client_data_fetching/getComments';
import { useSession } from 'next-auth/react';
import { CommentCreate } from './CommentCreate';
import { useShouldAnimate } from '@/hooks/useShouldAnimate';
import { commentFramerVariants } from '@/lib/framerVariants';

export function Comments({ postId }: { postId: number }) {
  const qc = useQueryClient();
  const queryKey = useMemo(() => ['posts', postId, 'comments'], [postId]);

  const { data: session } = useSession();
  const { shouldAnimate } = useShouldAnimate();

  const {
    data: comments,
    isPending,
    isError,
    error,
  } = useQuery<GetComment[], Error>({
    queryKey: queryKey,
    queryFn: () => getComments({ postId }),
    // staleTime: 60000 * 10,
  });

  const setRepliesVisibility = useCallback(
    ({ commentId, shown }: { commentId: number; shown: boolean }) => {
      qc.setQueryData<GetComment[]>(queryKey, (oldComments) => {
        if (!oldComments) return;
        // Make a shallow copy of `oldComments`
        const newComments = [...oldComments];

        // Find the index of the comment to update
        const index = newComments.findIndex(
          (comment) => comment.id === commentId,
        );

        const oldComment = newComments[index];

        newComments[index] = {
          ...oldComment,
          repliesShown: shown,
        };

        return newComments;
      });
    },
    [qc, queryKey],
  );

  return (
    <div>
      <div className="flex flex-col pt-2 ">
        {isPending ? (
          <p className="py-2 text-muted-foreground">Loading comments.</p>
        ) : isError ? (
          <p className="py-2 text-muted-foreground">{error.message}</p>
        ) : (
          <AnimatePresence>
            {comments.length > 0 ? (
              comments?.map((comment) => (
                <motion.div
                  variants={commentFramerVariants}
                  initial={shouldAnimate ? 'start' : false}
                  animate="animate"
                  exit="exit"
                  key={`posts-${postId}-comments-${comment.id}`}
                >
                  <Comment
                    {...comment}
                    {...{
                      setRepliesVisibility,
                      queryKey,
                    }}
                    isOwnComment={session?.user?.id === comment.user.id}
                  />
                </motion.div>
              ))
            ) : (
              <p className="py-2 text-muted-foreground">
                Be the first to comment.
              </p>
            )}
          </AnimatePresence>
        )}
      </div>
      <CommentCreate postId={postId} />
    </div>
  );
}
