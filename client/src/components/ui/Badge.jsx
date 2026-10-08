import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable Production Badge Component
 * 
 * Variants: default, primary/blue, secondary/gray, success/green, warning/amber, danger/red, outline
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
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    secondary: 'bg-slate-800 text-white border-transparent',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    outline: 'bg-transparent text-slate-700 border-slate-300',
  };

  const dotColors = {
    default: 'bg-slate-400',
    gray: 'bg-slate-400',
    primary: 'bg-blue-600',
    blue: 'bg-blue-600',
    secondary: 'bg-white',
    success: 'bg-emerald-500',
    green: 'bg-emerald-500',
    warning: 'bg-amber-500',
    amber: 'bg-amber-500',
    danger: 'bg-red-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    outline: 'bg-slate-400',
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
