import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-[#27292E] rounded-xl bg-[#151619]/30 text-[#F3F4F6]">
      <div className="w-10 h-10 rounded-lg bg-[#151619] border border-[#27292E] flex items-center justify-center text-[#6B7280] mb-3.5">
        <Icon className="w-5 h-5 stroke-[1.75]" />
      </div>
      <h3 className="text-sm font-semibold text-[#F3F4F6]">{title}</h3>
      <p className="mt-1 text-xs text-[#9CA3AF] max-w-sm leading-relaxed">
        {description}
      </p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-5 flex items-center gap-2.5">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0A0A0B] bg-[#818CF8] hover:bg-[#A5B4FC] rounded-lg transition-colors focus-visible:outline-none"
            >
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-3.5 py-1.5 text-xs font-medium text-[#F3F4F6] bg-[#1D1F23] hover:bg-[#27292E] border border-[#27292E] rounded-lg transition-colors"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
