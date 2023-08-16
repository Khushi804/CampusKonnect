/**
 * GET /api/users/:userId/activity
 * - Returns the activity logs of the authenticated user.
 */

import { getServerUser } from '@/lib/getServerUser';
import prisma from '@/lib/prisma/prisma';
import { NextResponse } from 'next/server';
import { GetActivity } from 'types';

export async function GET(request: Request) {
  const [user] = await getServerUser();
  if (!user) return NextResponse.json({}, { status: 401 });
  const userId = user.id;

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '5');
  const cursor = parseInt(searchParams.get('cursor') || '0');

  const selectUser = {
    select: {
      id: true,
      username: true,
      name: true,
      profilePhoto: true,
    },
  };
  const activities: GetActivity[] = await prisma.activity.findMany({
    where: {
      sourceUserId: userId,
    },
    select: {
      id: true,
      type: true,
      sourceId: true,
      targetId: true,
      createdAt: true,
      sourceUser: selectUser,
      targetUser: selectUser,
    },
    take: limit,
    skip: cursor ? 1 : undefined,
    cursor: cursor
      ? {
          id: cursor,
        }
      : undefined,
    orderBy: {
      id: 'desc',
    },
  });

  return NextResponse.json(activities);
}
