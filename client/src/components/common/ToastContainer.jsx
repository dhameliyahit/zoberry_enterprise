import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { useUIStore } from '../../store/uiStore';

const ToastContainer = () => {
  const { toasts, removeToast } = useUIStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 md:px-0">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded shadow-lg border text-sm font-medium transition-all transform animate-slide-up ${
              isError
                ? 'bg-red-50 text-red-800 border-red-200'
                : isSuccess
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-gray-800 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isError ? (
                <FiAlertCircle className="text-red-500 shrink-0" size={18} />
              ) : isSuccess ? (
                <FiCheckCircle className="text-emerald-600 shrink-0" size={18} />
              ) : (
                <FiInfo className="text-primary shrink-0" size={18} />
              )}
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-gray-400 hover:text-gray-600 ml-2"
              title="Close"
            >
              <FiX size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
