import React, { useState, useEffect } from 'react';
import { Project } from '../../types';
import { AlertTriangle, X, Check } from 'lucide-react';

interface ProjectDeleteModalProps {
  isOpen: boolean;
  project: Project | null;
  taskCount: number;
  onConfirm: (deleteTasks: boolean) => void;
  onCancel: () => void;
}

export const ProjectDeleteModal: React.FC<ProjectDeleteModalProps> = ({
  isOpen,
  project,
  taskCount,
  onConfirm,
  onCancel,
}) => {
  const [deleteTasks, setDeleteTasks] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setDeleteTasks(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || !project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0B]/80 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-project-title"
    >
      <div className="bg-[#151619] rounded-xl border border-[#27292E] shadow-2xl max-w-md w-full p-6 text-[#F3F4F6]">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-lg bg-[#F87171]/10 border border-[#F87171]/25 text-[#F87171] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 id="delete-project-title" className="text-sm font-semibold text-[#F3F4F6]">
              Delete Project
            </h3>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Are you sure you want to delete <strong className="text-[#F3F4F6] font-semibold">{project.name}</strong>?
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

        {taskCount > 0 ? (
          <div className="mt-5 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
              This project contains {taskCount} {taskCount === 1 ? 'task' : 'tasks'}:
            </p>

            <div
              onClick={() => setDeleteTasks(false)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                !deleteTasks
                  ? 'border-[#818CF8] bg-[#818CF8]/10'
                  : 'border-[#27292E] bg-[#0A0A0B] hover:border-[#374151]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center border transition-colors ${
                    !deleteTasks ? 'border-[#818CF8] bg-[#818CF8] text-[#0A0A0B]' : 'border-[#27292E] bg-[#151619]'
                  }`}
                >
                  {!deleteTasks && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="text-xs">
                  <p className="font-medium text-[#F3F4F6]">Keep tasks as personal tasks</p>
                  <p className="text-[#9CA3AF] mt-0.5">Tasks will stay in your task list with no project assigned.</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setDeleteTasks(true)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                deleteTasks
                  ? 'border-[#F87171] bg-[#F87171]/10'
                  : 'border-[#27292E] bg-[#0A0A0B] hover:border-[#374151]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center border transition-colors ${
                    deleteTasks ? 'border-[#F87171] bg-[#F87171] text-[#0A0A0B]' : 'border-[#27292E] bg-[#151619]'
                  }`}
                >
                  {deleteTasks && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="text-xs">
                  <p className="font-medium text-[#F87171]">Delete project and all {taskCount} tasks</p>
                  <p className="text-[#9CA3AF] mt-0.5">Associated tasks will be permanently removed.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-xs text-[#6B7280]">
            This project has no associated tasks. This action cannot be undone.
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#27292E]">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-medium text-[#F3F4F6] bg-[#1D1F23] hover:bg-[#27292E] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(deleteTasks)}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#0A0A0B] bg-[#F87171] hover:bg-[#EF4444] rounded-lg transition-colors"
          >
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
};
