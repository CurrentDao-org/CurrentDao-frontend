'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface TouchOptimizedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary: "bg-emerald-500 text-white border-transparent active:bg-emerald-600 shadow-md",
  secondary: "bg-blue-500 text-white border-transparent active:bg-blue-600 shadow-md",
  outline: "bg-transparent border-2 border-border text-foreground active:bg-muted/30",
  ghost: "bg-transparent text-muted-foreground active:bg-muted font-medium",
  danger: "bg-red-500 text-white border-transparent active:bg-red-600 shadow-md",
};

const sizes = {
  sm: "px-4 py-2 text-xs min-h-[36px]",
  md: "px-6 py-3 text-sm min-h-[44px]", // WCAG Standard (44px)
  lg: "px-8 py-4 text-base min-h-[52px]",
  xl: "px-10 py-5 text-lg min-h-[60px]",
};

const TouchOptimizedButton: React.FC<TouchOptimizedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  prefixIcon,
  suffixIcon,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      disabled={disabled || isLoading}
      className={`
        relative flex items-center justify-center gap-2 rounded-xl font-bold transition-all
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : 'inline-flex'}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Processing...</span>
        </div>
      ) : (
        <>
          {prefixIcon && <span className="flex-shrink-0">{prefixIcon}</span>}
          <span className="truncate">{children}</span>
          {suffixIcon && <span className="flex-shrink-0">{suffixIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default TouchOptimizedButton;
