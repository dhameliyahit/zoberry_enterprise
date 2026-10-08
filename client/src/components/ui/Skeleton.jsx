import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable Loading Skeleton Component
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'bg-slate-200/80 rounded-md animate-skeleton select-none pointer-events-none',
        className
      )}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col gap-3">
      <Skeleton className="w-full aspect-square rounded-md" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-1/2 h-3" />
      </div>
      <div className="flex items-center justify-between mt-auto pt-2">
        <Skeleton className="w-20 h-5" />
        <Skeleton className="w-16 h-8 rounded-md" />
      </div>
    </div>
  );
}

export default Skeleton;
