import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable Production Card Component
 */
export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-lg shadow-sm',
        hover && 'hover:border-slate-300 hover:shadow-md transition-all duration-150',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, title, description, action, ...props }) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4',
        className
      )}
      {...props}
    >
      <div>
        {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'px-6 py-3 bg-slate-50/75 border-t border-slate-100 rounded-b-lg flex items-center justify-between gap-3 text-xs text-slate-600',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
