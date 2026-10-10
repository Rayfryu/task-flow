import React, { useState, useMemo } from 'react';
import { Task, Project } from '../../types';
import { formatDateTime } from '../../utils/dateUtils';
import { EmptyState } from '../common/EmptyState';
import {
  CheckCircle2,
  RotateCcw,
  Trash2,
  Search,
} from 'lucide-react';

interface CompletedTasksViewProps {
  tasks: Task[];
  projects: Project[];
  onTaskClick: (task: Task) => void;
  onReopenTask: (taskId: string) => void;
  onDeleteTask: (task: Task) => void;
}

export const CompletedTasksView: React.FC<CompletedTasksViewProps> = ({
  tasks,
  projects,
  onTaskClick,
  onReopenTask,
  onDeleteTask,
}) => {
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState<string | 'all' | 'unassigned'>('all');

  const completedTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'done')
      .filter((t) => {
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }

        if (projectId === 'unassigned') {
          if (t.projectId !== null) return false;
        } else if (projectId !== 'all') {
          if (t.projectId !== projectId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = a.completedAt || a.createdAt;
        const timeB = b.completedAt || b.createdAt;
        return timeB.localeCompare(timeA);
      });
  }, [tasks, search, projectId]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto text-[#F3F4F6]">
      {/* Header */}
      <div className="pb-3 border-b border-[#27292E]">
        <h1 className="text-xl font-bold text-[#F3F4F6] tracking-tight">Completed Tasks</h1>
        <p className="text-xs text-[#9CA3AF] mt-0.5">
          Review accomplishments, reopen tasks when needed, or manage completed records.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#151619] border border-[#27292E] rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search completed tasks..."
            className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#0A0A0B] text-[#F3F4F6] placeholder-[#6B7280] border border-[#27292E] rounded-lg focus:outline-none focus:border-[#818CF8] focus:ring-1 focus:ring-[#818CF8] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] text-[#6B7280]">Project:</span>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0A0A0B] border border-[#27292E] rounded-lg text-[#F3F4F6] focus:outline-none focus:border-[#818CF8] text-xs"
          >
            <option value="all" className="bg-[#151619]">All Projects</option>
            <option value="unassigned" className="bg-[#151619]">Personal (No Project)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#151619]">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List or Empty State */}
      {completedTasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={search || projectId !== 'all' ? 'No completed tasks found' : 'No completed tasks yet'}
          description={
            search || projectId !== 'all'
              ? 'Try adjusting your search query or project filter.'
              : 'Tasks marked as complete will appear here with timestamps.'
          }
        />
      ) : (
        <div className="bg-[#151619] border border-[#27292E] rounded-xl divide-y divide-[#27292E] overflow-hidden">
          {completedTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);

            return (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="flex items-center justify-between gap-4 p-3.5 hover:bg-[#1D1F23]/80 transition-colors cursor-pointer group"
              >
                {/* Left: Checkmark & Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <CheckCircle2 className="w-4 h-4 text-[#34D399] fill-[#34D399]/20 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-[#9CA3AF] line-through truncate block">
                      {task.title}
                    </span>
                    {task.description && (
                      <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Project, Completion Date, Reopen, Delete */}
                <div className="flex items-center gap-3 shrink-0 text-xs text-[#6B7280]">
                  {project && (
                    <div className="hidden sm:flex items-center gap-1.5 max-w-[130px] truncate">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="truncate text-[#9CA3AF] text-[11px]">{project.name}</span>
                    </div>
                  )}

                  <span className="hidden sm:inline text-[#27292E]" aria-hidden="true">·</span>

                  <span className="tabular-nums text-[#6B7280] text-[11px]">
                    {formatDateTime(task.completedAt || task.createdAt)}
                  </span>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-1 ml-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onReopenTask(task.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#818CF8] hover:bg-[#818CF8]/10 rounded transition-colors"
                      title="Reopen task"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reopen</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task)}
                      className="p-1 text-[#6B7280] hover:text-[#F87171] hover:bg-[#F87171]/10 rounded transition-colors"
                      title="Delete task permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
