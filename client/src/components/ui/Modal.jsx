import React, { useEffect } from 'react';
import ReactModal from 'react-modal';
import { FiX } from 'react-icons/fi';
import { cn } from '../../utils/cn';

// Set app element for accessibility
if (typeof window !== 'undefined') {
  const appRoot = document.getElementById('root') || document.body;
  if (appRoot) {
    ReactModal.setAppElement(appRoot);
  }
}

/**
 * Reusable Production Modal Dialog powered by react-modal
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  size,
  className,
  showClose = true,
  shouldCloseOnOverlayClick = true,
}) {
  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  const resolvedMaxWidth = size ? (sizeMap[size] || maxWidth) : maxWidth;

  return (
    <ReactModal
      isOpen={Boolean(isOpen)}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
      closeTimeoutMS={200}
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200"
      className="outline-none focus:outline-none w-full flex justify-center"
    >
      <div
        className={cn(
          'relative w-full bg-white rounded-[2px] shadow-2xl border border-slate-200 z-10 my-auto overflow-hidden flex flex-col animate-fade-in text-slate-900',
          resolvedMaxWidth,
          className
        )}
      >
        {/* Modal Header */}
        {(title || showClose) && (
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4 bg-[#f8fafc]">
            <div>
              {title && (
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              )}
            </div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-[2px] transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {children}
        </div>
      </div>
    </ReactModal>
  );
}

export default Modal;
