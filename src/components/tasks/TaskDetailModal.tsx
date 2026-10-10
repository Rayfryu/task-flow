import React, { useEffect } from 'react';
import { Task, Project, TaskStatus, TaskPriority } from '../../types';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import {
  formatDisplayDate,
  formatDateTime,
  isDateOverdue,
  formatRelativeDueDate,
} from '../../utils/dateUtils';

interface TaskDetailModalProps {
  isOpen: boolean;
  task: Task | null;
  projects: Project[];
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onPriorityChange: (taskId: string, newPriority: TaskPriority) => void;
  onNavigateToProject?: (projectId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  task,
  projects,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  onNavigateToProject,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const project = projects.find((p) => p.id === task.projectId);
  const isDone = task.status === 'done';
  const isOverdue = isDateOverdue(task.dueDate, task.status);
  const relativeDate = formatRelativeDueDate(task.dueDate, task.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0B]/80 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <div className="bg-[#151619] rounded-xl border border-[#27292E] shadow-2xl max-w-lg w-full p-6 text-[#F3F4F6] max-h-[90vh] overflow-y-auto">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-[#27292E]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStatusChange(task.id, isDone ? 'todo' : 'done')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isDone
                  ? 'bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/30 hover:bg-[#34D399]/20'
                  : 'bg-[#818CF8]/10 text-[#818CF8] border border-[#818CF8]/30 hover:bg-[#818CF8]/20'
              }`}
            >
              {isDone ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen Task</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Complete</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1D1F23] rounded-lg transition-colors"
              title="Edit Task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task)}
              className="p-1.5 text-[#F87171] hover:bg-[#F87171]/10 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#6B7280] hover:text-[#9CA3AF] rounded-lg transition-colors ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => onStatusChange(task.id, isDone ? 'todo' : 'done')}
              className="mt-1 text-[#6B7280] hover:text-[#818CF8] transition-colors shrink-0"
              title={isDone ? 'Mark uncompleted' : 'Mark done'}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-[#34D399] fill-[#34D399]/20" />
              ) : (
                <Circle className="w-5 h-5 text-[#6B7280] hover:text-[#818CF8]" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h2
                id="task-detail-title"
                className={`text-base font-semibold leading-snug ${
                  isDone ? 'line-through text-[#6B7280]' : 'text-[#F3F4F6]'
                }`}
              >
                {task.title}
              </h2>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="mt-5 grid grid-cols-2 gap-3.5 p-3.5 bg-[#0F1012] border border-[#27292E] rounded-lg text-xs">
            <div>
              <span className="text-[#6B7280] block mb-1">Status</span>
              <select
                value={task.status}
                onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                className="w-full bg-[#0A0A0B] border border-[#27292E] rounded-md px-2 py-1 text-xs font-medium text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <span className="text-[#6B7280] block mb-1">Priority</span>
              <select
                value={task.priority}
                onChange={(e) => onPriorityChange(task.id, e.target.value as TaskPriority)}
                className="w-full bg-[#0A0A0B] border border-[#27292E] rounded-md px-2 py-1 text-xs font-medium text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <span className="text-[#6B7280] block mb-1">Due Date</span>
              <div className="flex items-center gap-1.5 font-medium text-[#F3F4F6]">
                <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                <span className={isOverdue ? 'text-[#F87171] font-semibold' : ''}>
                  {formatDisplayDate(task.dueDate)}
                </span>
                {task.dueDate && !isDone && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-normal ${
                      isOverdue
                        ? 'bg-[#F87171]/20 text-[#F87171]'
                        : 'bg-[#1D1F23] text-[#9CA3AF]'
                    }`}
                  >
                    {relativeDate.label}
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[#6B7280] block mb-1">Project</span>
              {project ? (
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  {onNavigateToProject ? (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToProject(project.id);
                      }}
                      className="font-medium text-[#818CF8] hover:underline flex items-center gap-1 truncate text-left"
                    >
                      <span className="truncate">{project.name}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </button>
                  ) : (
                    <span className="font-medium text-[#F3F4F6] truncate">{project.name}</span>
                  )}
                </div>
              ) : (
                <span className="text-[#6B7280] italic">Personal (No Project)</span>
              )}
            </div>

            <div>
              <span className="text-[#6B7280] block mb-1">Estimated Duration</span>
              <div className="flex items-center gap-1.5 text-[#F3F4F6]">
                <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
                <span>
                  {task.estimatedMinutes !== null ? `${task.estimatedMinutes} mins` : '—'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[#6B7280] block mb-1">Created At</span>
              <span className="text-[#9CA3AF] tabular-nums">
                {formatDateTime(task.createdAt)}
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
              Description & Notes
            </h3>
            {task.description ? (
              <div className="p-3 bg-[#0A0A0B] border border-[#27292E] rounded-lg text-xs text-[#9CA3AF] whitespace-pre-wrap leading-relaxed">
                {task.description}
              </div>
            ) : (
              <p className="text-xs text-[#6B7280] italic">No notes provided for this task.</p>
            )}
          </div>

          {/* Completion audit info if completed */}
          {task.completedAt && (
            <div className="mt-4 p-3 bg-[#34D399]/10 border border-[#34D399]/25 rounded-lg text-xs text-[#34D399] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
              <span>
                Completed on <strong className="tabular-nums font-semibold">{formatDateTime(task.completedAt)}</strong>
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-3 border-t border-[#27292E] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-[#F3F4F6] bg-[#1D1F23] hover:bg-[#27292E] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
