import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable Production Badge Component
 * 
 * Variants: default, primary, secondary, success, warning, danger, outline, neutral
 * Sizes: sm, md
 */
export function Badge({
  children,
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  ...props
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-primary border-blue-200',
    secondary: 'bg-slate-800 text-white border-transparent',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    outline: 'bg-transparent text-slate-700 border-slate-300',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const dotColors = {
    default: 'bg-slate-400',
    primary: 'bg-primary',
    secondary: 'bg-white',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    outline: 'bg-slate-400',
    neutral: 'bg-gray-400',
  };

  const sizes = {
    sm: 'text-[11px] font-medium px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border leading-none transition-colors select-none whitespace-nowrap',
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColors[variant] || dotColors.default
          )}
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
