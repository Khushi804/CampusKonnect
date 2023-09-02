'use client';

import { cn } from '@/lib/cn';
import { useObjectRef } from '@react-aria/utils';
import { forwardRef } from 'react';
import {
  AriaButtonProps,
  mergeProps,
  useButton,
  useFocusRing,
} from 'react-aria';

interface ButtonProps extends AriaButtonProps {
  children: React.ReactNode;
  className?: string;
}

export const ButtonNaked = forwardRef<HTMLButtonElement, ButtonProps>(
  function ButtonNaked({ className, children, ...rest }, forwardedRef) {
    const ref = useObjectRef(forwardedRef);
    const { buttonProps } = useButton({ ...rest }, ref);
    const { isFocusVisible, focusProps } = useFocusRing();

    return (
      <button
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        className={cn(
          'rounded-sm focus:outline-none',
          className,
          isFocusVisible && 'ring ring-violet-500 ring-offset-2',
        )}
      >
        {children}
      </button>
    );
  },
);
