import React from 'react';
import { FiPackage } from 'react-icons/fi';
import { cn } from '../../utils/cn';
import { Button } from './Button';

/**
 * Reusable Production Empty State Component
 */
export function EmptyState({
  icon: Icon = FiPackage,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
  actionComponent,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white border border-dashed border-slate-200 rounded-[2px] my-4',
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionComponent ? (
        actionComponent
      ) : actionLabel && onAction ? (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default EmptyState;
