import React, { useState, useEffect } from 'react';
import { Project, Task, TaskPriority, TaskStatus } from '../../types';
import { X } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  projects: Project[];
  taskToEdit?: Task | null;
  defaultProjectId?: string | null;
  defaultStatus?: TaskStatus;
  defaultDueDate?: string | null;
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => void;
  onClose: () => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  projects,
  taskToEdit,
  defaultProjectId = null,
  defaultStatus = 'todo',
  defaultDueDate = null,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setProjectId(taskToEdit.projectId);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setDueDate(taskToEdit.dueDate || '');
      setEstimatedMinutes(
        taskToEdit.estimatedMinutes !== null ? String(taskToEdit.estimatedMinutes) : ''
      );
    } else {
      setTitle('');
      setDescription('');
      setProjectId(defaultProjectId !== undefined ? defaultProjectId : null);
      setPriority('medium');
      setStatus(defaultStatus || 'todo');
      setDueDate(defaultDueDate || '');
      setEstimatedMinutes('');
    }
    setError('');
  }, [taskToEdit, defaultProjectId, defaultStatus, defaultDueDate, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    let parsedMinutes: number | null = null;
    if (estimatedMinutes.trim() !== '') {
      const parsed = parseInt(estimatedMinutes, 10);
      if (isNaN(parsed) || parsed < 0) {
        setError('Estimated duration must be a positive number');
        return;
      }
      parsedMinutes = parsed;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      projectId: projectId || null,
      priority,
      status,
      dueDate: dueDate || null,
      estimatedMinutes: parsedMinutes,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0B]/80 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div className="bg-[#151619] rounded-xl border border-[#27292E] shadow-2xl max-w-lg w-full p-6 text-[#F3F4F6] max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#27292E]">
          <h2 id="task-modal-title" className="text-sm font-semibold text-[#F3F4F6]">
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#9CA3AF] p-1 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-[#F87171] bg-[#F87171]/10 border border-[#F87171]/25 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
              Task Title <span className="text-[#F87171]">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Implement search indexing, Schedule dentist appointment"
              className="w-full px-3 py-2 text-sm bg-[#0A0A0B] text-[#F3F4F6] border border-[#27292E] rounded-lg placeholder-[#6B7280] focus:border-[#818CF8] focus:outline-none focus:ring-1 focus:ring-[#818CF8] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="task-desc" className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
              Description & Notes
            </label>
            <textarea
              id="task-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add subtasks, links, prerequisites, or implementation notes..."
              className="w-full px-3 py-2 text-sm bg-[#0A0A0B] text-[#F3F4F6] border border-[#27292E] rounded-lg placeholder-[#6B7280] focus:border-[#818CF8] focus:outline-none focus:ring-1 focus:ring-[#818CF8] transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-project" className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                Project
              </label>
              <select
                id="task-project"
                value={projectId || ''}
                onChange={(e) => setProjectId(e.target.value ? e.target.value : null)}
                className="w-full px-3 py-2 text-sm bg-[#0A0A0B] text-[#F3F4F6] border border-[#27292E] rounded-lg focus:border-[#818CF8] focus:outline-none focus:ring-1 focus:ring-[#818CF8] transition-colors"
              >
                <option value="" className="bg-[#151619]">No Project (Personal Task)</option>
                {projects
                  .filter((p) => p.status !== 'archived')
                  .map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#151619]">
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-status" className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                Status
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm bg-[#0A0A0B] text-[#F3F4F6] border border-[#27292E] rounded-lg focus:border-[#818CF8] focus:outline-none focus:ring-1 focus:ring-[#818CF8] transition-colors"
              >
                <option value="backlog" className="bg-[#151619]">Backlog</option>
                <option value="todo" className="bg-[#151619]">To Do</option>
                <option value="in_progress" className="bg-[#151619]">In Progress</option>
                <option value="done" className="bg-[#151619]">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority" className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm bg-[#0A0A0B] text-[#F3F4F6] border border-[#27292E] rounded-lg focus:border-[#818CF8] focus:outline-none focus:ring-1 focus:ring-[#818CF8] transition-colors"
              >
                <option value="low" className="bg-[#151619]">Low</option>
                <option value="medium" className="bg-[#151619]">Medium</option>
                <option value="high" className="bg-[#151619]">High</option>
                <option value="urgent" className="bg-[#151619]">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-due" className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                Due Date
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-[#0A0A0B] text-[#F3F4F6] border border-[#27292E] rounded-lg focus:border-[#818CF8] focus:outline-none focus:ring-1 focus:ring-[#818CF8] transition-colors"
                />
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="text-xs text-[#9CA3AF] hover:text-[#F3F4F6] px-2 py-2 rounded border border-[#27292E] bg-[#1D1F23] hover:bg-[#27292E] shrink-0"
                    title="Clear date"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="task-est" className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
              Estimated Duration (Minutes)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="task-est"
                type="number"
                min="0"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="e.g. 30, 60, 120"
                className="w-full px-3 py-2 text-sm bg-[#0A0A0B] text-[#F3F4F6] border border-[#27292E] rounded-lg placeholder-[#6B7280] focus:border-[#818CF8] focus:outline-none focus:ring-1 focus:ring-[#818CF8] transition-colors"
              />
              {estimatedMinutes && (
                <button
                  type="button"
                  onClick={() => setEstimatedMinutes('')}
                  className="text-xs text-[#9CA3AF] hover:text-[#F3F4F6] px-2 py-2 rounded border border-[#27292E] bg-[#1D1F23] hover:bg-[#27292E] shrink-0"
                  title="Clear estimate"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-[#27292E] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#F3F4F6] bg-[#1D1F23] hover:bg-[#27292E] rounded-lg transition-colors focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-[#0A0A0B] bg-[#818CF8] hover:bg-[#A5B4FC] rounded-lg transition-colors focus-visible:outline-none"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
