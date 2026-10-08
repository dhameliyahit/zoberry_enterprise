import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Reusable Production Quantity Selector Component
 */
export function QuantitySelector({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  className,
}) {
  const handleDecrement = () => {
    if (disabled || value <= min) return;
    onChange?.(value - 1);
  };

  const handleIncrement = () => {
    if (disabled || value >= max) return;
    onChange?.(value + 1);
  };

  const handleInputChange = (e) => {
    const parsed = parseInt(e.target.value, 10);
    if (isNaN(parsed)) return;
    const clamped = Math.min(Math.max(parsed, min), max);
    onChange?.(clamped);
  };

  const sizes = {
    sm: {
      btn: 'w-7 h-7',
      input: 'w-8 h-7 text-xs',
      icon: 'w-3 h-3',
    },
    md: {
      btn: 'w-9 h-9',
      input: 'w-12 h-9 text-sm',
      icon: 'w-3.5 h-3.5',
    },
    lg: {
      btn: 'w-11 h-11',
      input: 'w-14 h-11 text-base',
      icon: 'w-4 h-4',
    },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div
      className={cn(
        'inline-flex items-center border border-slate-200 rounded-md bg-white overflow-hidden shadow-2xs select-none',
        disabled && 'opacity-50 pointer-events-none bg-slate-50',
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className={cn(
          'flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent',
          currentSize.btn
        )}
      >
        <Minus className={currentSize.icon} />
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        aria-label="Item quantity"
        className={cn(
          'text-center font-semibold text-slate-800 bg-transparent border-x border-slate-200 focus:outline-none focus:bg-blue-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          currentSize.input
        )}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={cn(
          'flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent',
          currentSize.btn
        )}
      >
        <Plus className={currentSize.icon} />
      </button>
    </div>
  );
}

export default QuantitySelector;
