import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Reusable Production Button Component
 * 
 * Variants: primary, secondary, outline, ghost, danger, link
 * Sizes: sm, md, lg
 */
export const Button = forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99]';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm border border-transparent',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200',
    outline: 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 hover:border-slate-400 shadow-sm',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm border border-transparent',
    dangerOutline: 'bg-white text-red-600 border border-red-300 hover:bg-red-50 hover:border-red-400',
    link: 'bg-transparent text-primary hover:underline p-0 h-auto border-none shadow-none font-normal',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-6 py-2.5 gap-2.5 h-12',
    icon: 'p-2 h-10 w-10 justify-center',
    iconSm: 'p-1.5 h-8 w-8 justify-center',
  };

  const isLinkVariant = variant === 'link';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        variants[variant] || variants.primary,
        !isLinkVariant && (sizes[size] || sizes.md),
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
