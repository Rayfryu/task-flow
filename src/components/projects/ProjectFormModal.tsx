import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../../types';
import { X } from 'lucide-react';

interface ProjectFormModalProps {
  isOpen: boolean;
  projectToEdit?: Project | null;
  onSave: (data: Omit<Project, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const PROJECT_COLORS = [
  { name: 'Indigo', hex: '#818CF8' },
  { name: 'Blue', hex: '#60A5FA' },
  { name: 'Violet', hex: '#A78BFA' },
  { name: 'Rose', hex: '#F87171' },
  { name: 'Amber', hex: '#FBBF24' },
  { name: 'Emerald', hex: '#34D399' },
  { name: 'Teal', hex: '#2DD4BF' },
  { name: 'Slate', hex: '#94A3B8' },
];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  projectToEdit,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0].hex);
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setColor(projectToEdit.color);
      setStatus(projectToEdit.status);
      setStartDate(projectToEdit.startDate || '');
      setDueDate(projectToEdit.dueDate || '');
    } else {
      setName('');
      setDescription('');
      setColor(PROJECT_COLORS[0].hex);
      setStatus('active');
      setStartDate('');
      setDueDate('');
    }
    setError('');
  }, [projectToEdit, isOpen]);

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
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    if (startDate && dueDate && startDate > dueDate) {
      setError('Start date cannot be after due date');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      color,
      status,
      startDate: startDate || null,
      dueDate: dueDate || null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0B]/80 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div className="bg-[#151619] rounded-xl border border-[#27292E] shadow-2xl max-w-lg w-full p-6 text-[#F3F4F6] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#27292E]">
          <h2 id="project-modal-title" className="text-sm font-semibold text-[#F3F4F6]">
            {projectToEdit ? 'Edit Project' : 'Create New Project'}
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
            <label htmlFor="project-name" className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
              Project Name <span className="text-[#F87171]">*</span>
            </label>
            <input
              id="project-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Developer Portfolio, Marathon Training"
              className="w-full px-3 py-2 text-sm bg-[#0A0A0B] text-[#F3F4F6] border border-[#27292E] rounded-lg placeholder-[#6B7280] focus:border-[#818CF8] focus:outline-none focus:ring-1 focus:ring-[#818CF8] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="project-desc" className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
              Description
            </label>
            <textarea
              id="project-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are the goals, constraints, or milestones of this project?"
              className="w-full px-3 py-2 text-sm bg-[#0A0A0B] text-[#F3F4F6] border border-[#27292E] rounded-lg placeholder-[#6B7280] focus:border-[#818CF8] focus:outline-none focus:ring-1 focus:ring-[#818CF8] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  title={c.name}
                  className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                    color === c.hex ? 'ring-2 ring-offset-2 ring-offset-[#151619] ring-[#F3F4F6] scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="project-status" className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                Status
              </label>
              <select
                id="project-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 text-sm bg-[#0A0A0B] text-[#F3F4F6] border border-[#27292E] rounded-lg focus:border-[#818CF8] focus:outline-none focus:ring-1 focus:ring-[#818CF8] transition-colors"
              >
                <option value="active" className="bg-[#151619]">Active</option>
                <option value="on_hold" className="bg-[#151619]">On Hold</option>
                <option value="completed" className="bg-[#151619]">Completed</option>
                <option value="archived" className="bg-[#151619]">Archived</option>
              </select>
            </div>

            <div>
              <label htmlFor="project-start-date" className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                Start Date
              </label>
              <input
                id="project-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#0A0A0B] text-[#F3F4F6] border border-[#27292E] rounded-lg focus:border-[#818CF8] focus:outline-none focus:ring-1 focus:ring-[#818CF8] transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="project-due-date" className="block text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
              Due Date / Target Deadline
            </label>
            <input
              id="project-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#0A0A0B] text-[#F3F4F6] border border-[#27292E] rounded-lg focus:border-[#818CF8] focus:outline-none focus:ring-1 focus:ring-[#818CF8] transition-colors"
            />
          </div>

          <div className="pt-4 mt-6 border-t border-[#27292E] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-[#F3F4F6] bg-[#1D1F23] hover:bg-[#27292E] rounded-lg transition-colors focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-[#0A0A0B] bg-[#818CF8] hover:bg-[#A5B4FC] rounded-lg transition-colors focus-visible:outline-none"
            >
              {projectToEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
