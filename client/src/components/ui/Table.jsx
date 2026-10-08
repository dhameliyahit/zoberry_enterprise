import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable Production Data Table Components
 */
export function Table({ children, className, ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
      <table className={cn('w-full text-left text-sm border-collapse', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className, ...props }) {
  return (
    <thead className={cn('bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }) {
  return (
    <tbody className={cn('divide-y divide-slate-100 bg-white text-slate-700', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, hover = true, ...props }) {
  return (
    <tr className={cn(hover && 'hover:bg-slate-50/75 transition-colors', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHeader({ children, className, ...props }) {
  return (
    <th className={cn('px-4 py-3 font-semibold text-slate-600', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }) {
  return (
    <td className={cn('px-4 py-3.5 align-middle', className)} {...props}>
      {children}
    </td>
  );
}

export default Table;
