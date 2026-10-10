import React from 'react';
import { Task, Project, TaskPriority, TaskStatus } from '../../types';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  isDateOverdue,
  formatRelativeDueDate,
} from '../../utils/dateUtils';

interface TaskItemProps {
  task: Task;
  project?: Project;
  onToggleDone: (taskId: string) => void;
  onClick: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  project,
  onToggleDone,
  onClick,
  onEdit,
  onDelete,
}) => {
  const isDone = task.status === 'done';
  const isOverdue = isDateOverdue(task.dueDate, task.status);
  const relativeDate = formatRelativeDueDate(task.dueDate, task.status);

  const getPriorityLabel = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[#F87171] font-medium">Urgent</span>;
      case 'high':
        return <span className="text-[#FBBF24] font-medium">High</span>;
      case 'medium':
        return <span className="text-[#818CF8] font-medium">Med</span>;
      case 'low':
        return <span className="text-[#6B7280] font-medium">Low</span>;
    }
  };

  return (
    <div
      className={`group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border transition-all ${
        isDone
          ? 'bg-[#0F1012] border-[#27292E]/60 opacity-60'
          : 'bg-[#151619] border-[#27292E] hover:border-[#374151] hover:bg-[#1D1F23]/80'
      }`}
    >
      {/* Left: Checkbox & Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleDone(task.id);
          }}
          className="text-[#6B7280] hover:text-[#818CF8] transition-colors shrink-0 focus-visible:outline-none rounded"
          title={isDone ? 'Mark as todo' : 'Mark as done'}
          aria-label={isDone ? 'Mark task as todo' : 'Mark task as completed'}
        >
          {isDone ? (
            <CheckCircle2 className="w-4 h-4 text-[#34D399] fill-[#34D399]/20" />
          ) : (
            <Circle className="w-4 h-4 text-[#6B7280] hover:text-[#818CF8]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onClick(task)}
          className="text-left min-w-0 flex-1 group/title focus-visible:outline-none"
        >
          <span
            className={`text-xs truncate block font-medium transition-colors ${
              isDone
                ? 'line-through text-[#6B7280]'
                : 'text-[#F3F4F6] group-hover/title:text-[#818CF8]'
            }`}
          >
            {task.title}
          </span>
        </button>
      </div>

      {/* Middle/Right: Unboxed Metadata */}
      <div className="flex items-center gap-3 shrink-0 text-xs text-[#9CA3AF]">
        {/* Project Name indicator */}
        {project ? (
          <div className="hidden sm:flex items-center gap-1.5 max-w-[130px] truncate">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <span className="truncate text-[#9CA3AF] text-[11px]">{project.name}</span>
          </div>
        ) : (
          <span className="hidden sm:inline text-[#6B7280] text-[11px] italic">Personal</span>
        )}

        <span className="hidden sm:inline text-[#27292E]" aria-hidden="true">·</span>

        {/* Priority */}
        <div className="hidden md:flex items-center text-[11px]">
          {getPriorityLabel(task.priority)}
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <>
            <span className="hidden md:inline text-[#27292E]" aria-hidden="true">·</span>
            <div
              className={`flex items-center gap-1 tabular-nums text-[11px] ${
                isOverdue
                  ? 'text-[#F87171] font-medium'
                  : relativeDate.tone === 'today'
                  ? 'text-[#FBBF24] font-medium'
                  : 'text-[#9CA3AF]'
              }`}
            >
              <Calendar className="w-3 h-3 text-[#6B7280]" />
              <span>{relativeDate.label}</span>
            </div>
          </>
        )}

        {/* Estimated duration */}
        {task.estimatedMinutes !== null && (
          <div className="hidden lg:flex items-center gap-1 text-[#6B7280] tabular-nums text-[11px]">
            <Clock className="w-3 h-3" />
            <span>{task.estimatedMinutes}m</span>
          </div>
        )}

        {/* Action buttons on hover */}
        <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1 text-[#6B7280] hover:text-[#F3F4F6] hover:bg-[#1D1F23] rounded transition-colors"
            title="Edit task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
            className="p-1 text-[#6B7280] hover:text-[#F87171] hover:bg-[#1D1F23] rounded transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
