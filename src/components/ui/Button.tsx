// @ts-nocheck
import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  pill?: boolean;
  glow?: boolean;
}

const buttonVariants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-lg shadow-primary-500/25',
  secondary: 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:ring-neutral-500',
  ghost: 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:ring-neutral-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-500/25',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-lg shadow-green-500/25',
  gradient: 'bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white hover:shadow-xl focus:ring-primary-500 shadow-lg',
};

const sizeVariants = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      pill = false,
      glow = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          buttonVariants[variant],
          sizeVariants[size],
          pill ? 'rounded-full' : 'rounded-xl',
          fullWidth && 'w-full',
          glow && variant === 'gradient' && 'glow',
          className
        )}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {/* Gradient animation overlay */}
        {variant === 'gradient' && (
          <motion.div
            className="absolute inset-0 rounded-inherit bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-400 opacity-0"
            initial={false}
            animate={{ opacity: 0 }}
            whileHover={{ opacity: 0.3 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Loading spinner */}
        {/* @ts-ignore */}
        {isLoading && (
          <Loader2
            className={cn(
              'animate-spin',
              size === 'sm'
                ? 'h-3 w-3'
                : size === 'md'
                ? 'h-4 w-4'
                : size === 'lg'
                ? 'h-5 w-5'
                : 'h-6 w-6'
            )}
          />
        )}

        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className={cn('inline-flex', children ? 'mr-2' : undefined)}>{leftIcon}</span>
        )}

        {/* Button text */}
        {isLoading ? loadingText || children : children}

        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className={cn('inline-flex', children ? 'ml-2' : undefined)}>{rightIcon}</span>
        )}

        {/* Shimmer effect for gradient button */}
        {variant === 'gradient' && !disabled && !isLoading && (
          <div className="absolute inset-0 -top-px rounded-inherit">
            <div className="absolute inset-0 rounded-inherit overflow-hidden">
              <div className="absolute inset-0 rounded-inherit shimmer" />
            </div>
          </div>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button variant
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'loadingText' | 'fullWidth'> {
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const iconSizeClasses = {
      sm: 'p-1.5',
      md: 'p-2.5',
      lg: 'p-3',
      xl: 'p-4',
    };

    return (
      <Button
        ref={ref}
        className={cn(iconSizeClasses[size], 'aspect-square', className)}
        size={size}
        {...props}
      />
    );
  }
);

IconButton.displayName = 'IconButton';
