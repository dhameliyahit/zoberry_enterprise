import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Shopify Warehouse Theme Button Primitive
 * Crisp micro-radius, high-contrast, structured e-commerce styling.
 */
export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight transition-all select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer rounded-[2px] uppercase';

  const variants = {
    primary: 'bg-[#1863dc] hover:bg-[#104fba] text-white shadow-xs active:bg-[#0c3e94]',
    secondary: 'bg-[#111827] hover:bg-black text-white active:bg-slate-900',
    outline: 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white active:bg-red-800',
    dangerOutline: 'bg-white border border-red-200 text-red-600 hover:bg-red-50 active:bg-red-100',
    link: 'bg-transparent text-[#1863dc] hover:underline p-0 h-auto font-semibold normal-case',
  };

  const sizes = {
    sm: 'text-[11px] px-3 py-1.5 gap-1.5 min-h-[32px]',
    md: 'text-xs px-4 py-2.5 gap-2 min-h-[38px]',
    lg: 'text-xs sm:text-sm px-6 py-3 gap-2 min-h-[44px]',
    icon: 'p-2 min-h-[36px] min-w-[36px]',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>{children}</span>
        </span>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

export default Button;
