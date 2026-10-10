import React from 'react';
import { ToastMessage } from '../../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl bg-[#151619] text-[#F3F4F6] transition-all transform translate-y-0 ${
              isSuccess
                ? 'border-[#34D399]/40'
                : isError
                ? 'border-[#F87171]/40'
                : 'border-[#27292E]'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-4 h-4 text-[#F87171] shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-4 h-4 text-[#818CF8] shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs leading-relaxed font-medium text-[#F3F4F6]">
              {toast.message}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#6B7280] hover:text-[#9CA3AF] p-0.5 rounded transition-colors focus-visible:outline-none"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
