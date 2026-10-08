import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Shopify Warehouse Theme Badge Primitive
 * Crisp rectangular tags with high contrast.
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
    default: 'bg-slate-100 text-slate-800 border-slate-300',
    gray: 'bg-slate-100 text-slate-800 border-slate-300',
    primary: 'bg-[#1863dc] text-white border-[#1863dc]',
    blue: 'bg-[#1863dc] text-white border-[#1863dc]',
    secondary: 'bg-[#111827] text-white border-[#111827]',
    success: 'bg-[#059669] text-white border-[#059669]',
    green: 'bg-[#059669] text-white border-[#059669]',
    warning: 'bg-[#d97706] text-white border-[#d97706]',
    amber: 'bg-[#d97706] text-white border-[#d97706]',
    danger: 'bg-[#dc2626] text-white border-[#dc2626]',
    red: 'bg-[#dc2626] text-white border-[#dc2626]',
    outline: 'bg-transparent text-slate-800 border-slate-300',
  };

  const dotColors = {
    default: 'bg-slate-400',
    gray: 'bg-slate-400',
    primary: 'bg-white',
    blue: 'bg-white',
    secondary: 'bg-white',
    success: 'bg-white',
    green: 'bg-white',
    warning: 'bg-white',
    amber: 'bg-white',
    danger: 'bg-white',
    red: 'bg-white',
    outline: 'bg-slate-500',
  };

  const sizes = {
    sm: 'text-[10px] font-bold px-1.5 py-0.5 gap-1 uppercase tracking-wider',
    md: 'text-[11px] font-bold px-2 py-0.5 gap-1.5 uppercase tracking-wider',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[2px] border leading-none transition-colors select-none whitespace-nowrap',
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
