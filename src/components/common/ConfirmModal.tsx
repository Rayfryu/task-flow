import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0B]/80 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="bg-[#151619] rounded-xl border border-[#27292E] shadow-2xl max-w-md w-full p-6 text-[#F3F4F6]">
        <div className="flex items-start gap-4">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/25'
                : 'bg-[#818CF8]/10 text-[#818CF8] border border-[#818CF8]/25'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 id="confirm-modal-title" className="text-sm font-semibold text-[#F3F4F6]">
              {title}
            </h3>
            <p className="mt-2 text-xs text-[#9CA3AF] leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onCancel}
            className="text-[#6B7280] hover:text-[#9CA3AF] p-1 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#27292E]">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-medium text-[#F3F4F6] bg-[#1D1F23] hover:bg-[#27292E] rounded-lg transition-colors focus-visible:outline-none"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none ${
              isDestructive
                ? 'bg-[#F87171] hover:bg-[#EF4444] text-[#0A0A0B]'
                : 'bg-[#818CF8] hover:bg-[#A5B4FC] text-[#0A0A0B]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
