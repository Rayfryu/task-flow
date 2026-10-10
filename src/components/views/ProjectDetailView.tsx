import React, { useState } from 'react';
import { Project, Task, ProjectStatus, TaskStatus } from '../../types';
import { calculateProjectProgress } from '../../utils/statistics';
import { formatShortDate } from '../../utils/dateUtils';
import { TaskItem } from '../tasks/TaskItem';
import { EmptyState } from '../common/EmptyState';
import {
  ArrowLeft,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  CheckSquare,
  Kanban,
  List,
  Search,
} from 'lucide-react';

interface ProjectDetailViewProps {
  project: Project;
  tasks: Task[];
  projects: Project[];
  onBackToProjects: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onUpdateProjectStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onOpenNewTaskModal: (defaultProjectId?: string | null) => void;
  onTaskClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onToggleTaskDone: (taskId: string) => void;
  onStatusChangeTask: (taskId: string, newStatus: TaskStatus) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  tasks,
  onBackToProjects,
  onEditProject,
  onDeleteProject,
  onUpdateProjectStatus,
  onOpenNewTaskModal,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  onToggleTaskDone,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  // Project tasks
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const { total, completed, percentage } = calculateProjectProgress(project.id, tasks);

  const filteredTasks = projectTasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const columns: { id: TaskStatus; label: string }[] = [
    { id: 'backlog', label: 'Backlog' },
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'done', label: 'Done' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#F3F4F6]">
      {/* Top back navigation */}
      <button
        onClick={onBackToProjects}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Projects</span>
      </button>

      {/* Project Header Card */}
      <div className="bg-[#151619] border border-[#27292E] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-xl font-bold text-[#F3F4F6] tracking-tight truncate">
                {project.name}
              </h1>
              {/* Status Selector */}
              <select
                value={project.status}
                onChange={(e) => onUpdateProjectStatus(project.id, e.target.value as ProjectStatus)}
                className="ml-2 text-xs font-medium bg-[#0A0A0B] border border-[#27292E] rounded-md px-2 py-1 text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
              >
                <option value="active" className="bg-[#151619]">Active</option>
                <option value="on_hold" className="bg-[#151619]">On Hold</option>
                <option value="completed" className="bg-[#151619]">Completed</option>
                <option value="archived" className="bg-[#151619]">Archived</option>
              </select>
            </div>

            <p className="text-xs text-[#9CA3AF] leading-relaxed max-w-2xl">
              {project.description || 'No description provided for this project.'}
            </p>

            {/* Dates & Timeline */}
            <div className="flex items-center gap-4 text-xs text-[#6B7280] tabular-nums pt-1">
              {(project.startDate || project.dueDate) && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span>
                    {project.startDate ? formatShortDate(project.startDate) : 'Start'}
                    {' → '}
                    {project.dueDate ? formatShortDate(project.dueDate) : 'No due date'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start">
            <button
              onClick={() => onEditProject(project)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F3F4F6] bg-[#1D1F23] border border-[#27292E] hover:bg-[#27292E] rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>Edit</span>
            </button>

            {project.status === 'archived' ? (
              <button
                onClick={() => onUpdateProjectStatus(project.id, 'active')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#34D399] bg-[#1D1F23] border border-[#27292E] hover:bg-[#27292E] rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore</span>
              </button>
            ) : (
              <button
                onClick={() => onUpdateProjectStatus(project.id, 'archived')}
                className="p-1.5 text-[#6B7280] hover:text-[#F3F4F6] border border-[#27292E] bg-[#1D1F23] hover:bg-[#27292E] rounded-lg transition-colors"
                title="Archive project"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onDeleteProject(project)}
              className="p-1.5 text-[#F87171] hover:bg-[#F87171]/10 border border-[#27292E] rounded-lg transition-colors"
              title="Delete project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar inside project header */}
        <div className="mt-5 pt-4 border-t border-[#27292E]">
          <div className="flex items-center justify-between text-xs font-mono text-[#6B7280] mb-1.5">
            <span>Overall Progress</span>
            <span className="font-semibold text-[#F3F4F6] tabular-nums">
              {completed} of {total} completed ({percentage}%)
            </span>
          </div>
          <div className="w-full bg-[#0A0A0B] rounded-full h-1.5 overflow-hidden border border-[#27292E]">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${percentage}%`,
                backgroundColor: project.color,
              }}
            />
          </div>
        </div>
      </div>

      {/* Task Controls: View Switcher, Filter, Search, + Add Task */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* List vs Board Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#151619] rounded-lg border border-[#27292E] text-xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#1D1F23] text-[#F3F4F6] border border-[#27292E]'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-2.5 py-1 font-medium rounded-md transition-colors ${
                viewMode === 'board'
                  ? 'bg-[#1D1F23] text-[#F3F4F6] border border-[#27292E]'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
          </div>

          {/* Status filter (for list view) */}
          {viewMode === 'list' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
              className="text-xs bg-[#151619] border border-[#27292E] rounded-lg px-2.5 py-1.5 text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
            >
              <option value="all" className="bg-[#151619]">All Statuses ({projectTasks.length})</option>
              <option value="backlog" className="bg-[#151619]">Backlog</option>
              <option value="todo" className="bg-[#151619]">To Do</option>
              <option value="in_progress" className="bg-[#151619]">In Progress</option>
              <option value="done" className="bg-[#151619]">Done</option>
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tasks..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#151619] border border-[#27292E] rounded-lg text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#818CF8] focus:ring-1 focus:ring-[#818CF8] transition-colors"
            />
          </div>

          <button
            onClick={() => onOpenNewTaskModal(project.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A0A0B] bg-[#818CF8] hover:bg-[#A5B4FC] rounded-lg transition-colors shrink-0 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task Content: List View or Board View */}
      {viewMode === 'list' ? (
        filteredTasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title={
              search || statusFilter !== 'all'
                ? 'No matching tasks'
                : 'No tasks in this project yet'
            }
            description={
              search || statusFilter !== 'all'
                ? 'Try modifying your filter or search query.'
                : 'Create tasks to define milestones and execute on this project.'
            }
            actionLabel="Add Task to Project"
            onAction={() => onOpenNewTaskModal(project.id)}
          />
        ) : (
          <div className="space-y-1.5">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                project={project}
                onToggleDone={onToggleTaskDone}
                onClick={onTaskClick}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )
      ) : (
        /* Board View for Project */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-[#0F1012] border border-[#27292E] rounded-xl p-3 flex flex-col min-h-[350px]"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#27292E]">
                  <span className="text-xs font-semibold text-[#9CA3AF]">{col.label}</span>
                  <span className="text-[11px] font-mono text-[#6B7280] tabular-nums">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-[11px] text-[#6B7280] italic">
                      Empty
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => onTaskClick(t)}
                        className="bg-[#151619] border border-[#27292E] rounded-lg p-2.5 hover:border-[#374151] hover:bg-[#1D1F23]/80 cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="text-xs font-medium text-[#F3F4F6] group-hover:text-[#818CF8] transition-colors">
                          {t.title}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1 border-t border-[#27292E]">
                          <span className="capitalize">{t.priority}</span>
                          {t.dueDate && (
                            <span className="tabular-nums font-mono text-[#9CA3AF]">
                              {formatShortDate(t.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => onOpenNewTaskModal(project.id)}
                  className="mt-2 w-full py-1 text-center text-xs text-[#6B7280] hover:text-[#F3F4F6] hover:bg-[#1D1F23] rounded transition-colors"
                >
                  + Add task
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
