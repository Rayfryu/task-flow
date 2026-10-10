import React, { useState, useMemo } from 'react';
import {
  Task,
  Project,
  TaskFilters,
  TaskStatus,
  TaskPriority,
  TaskDueDateFilter,
  TaskSortField,
  SortOrder,
} from '../../types';
import { TaskItem } from '../tasks/TaskItem';
import { EmptyState } from '../common/EmptyState';
import {
  Search,
  ArrowUpDown,
  X,
  Plus,
  CheckSquare,
} from 'lucide-react';
import { getTodayString, isDateOverdue, isDateWithinDays } from '../../utils/dateUtils';

interface MyTasksViewProps {
  tasks: Task[];
  projects: Project[];
  initialFilters?: Partial<TaskFilters>;
  onTaskClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onToggleTaskDone: (taskId: string) => void;
  onOpenNewTaskModal: (defaultProjectId?: string | null) => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  projects,
  initialFilters,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  onToggleTaskDone,
  onOpenNewTaskModal,
}) => {
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [projectId, setProjectId] = useState<string | 'all' | 'unassigned'>(
    initialFilters?.projectId || 'all'
  );
  const [status, setStatus] = useState<TaskStatus | 'all'>(
    initialFilters?.status || 'all'
  );
  const [priority, setPriority] = useState<TaskPriority | 'all'>(
    initialFilters?.priority || 'all'
  );
  const [dueDateFilter, setDueDateFilter] = useState<TaskDueDateFilter>(
    initialFilters?.dueDate || 'all'
  );
  const [sortBy, setSortBy] = useState<TaskSortField>(
    initialFilters?.sortBy || 'dueDate'
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    initialFilters?.sortOrder || 'asc'
  );

  const isAnyFilterActive =
    search.trim() !== '' ||
    projectId !== 'all' ||
    status !== 'all' ||
    priority !== 'all' ||
    dueDateFilter !== 'all';

  const handleClearFilters = () => {
    setSearch('');
    setProjectId('all');
    setStatus('all');
    setPriority('all');
    setDueDateFilter('all');
  };

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    const today = getTodayString();

    return tasks
      .filter((task) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }

        // Project
        if (projectId === 'unassigned') {
          if (task.projectId !== null) return false;
        } else if (projectId !== 'all') {
          if (task.projectId !== projectId) return false;
        }

        // Status
        if (status !== 'all') {
          if (task.status !== status) return false;
        }

        // Priority
        if (priority !== 'all') {
          if (task.priority !== priority) return false;
        }

        // Due date filter
        if (dueDateFilter === 'overdue') {
          if (!isDateOverdue(task.dueDate, task.status)) return false;
        } else if (dueDateFilter === 'today') {
          if (task.dueDate !== today) return false;
        } else if (dueDateFilter === 'upcoming_7') {
          if (!isDateWithinDays(task.dueDate, 7) || task.status === 'done') return false;
        } else if (dueDateFilter === 'no_date') {
          if (task.dueDate !== null) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'title') {
          comp = a.title.localeCompare(b.title);
        } else if (sortBy === 'priority') {
          const priorityWeight: Record<TaskPriority, number> = {
            urgent: 4,
            high: 3,
            medium: 2,
            low: 1,
          };
          comp = priorityWeight[a.priority] - priorityWeight[b.priority];
        } else if (sortBy === 'dueDate') {
          if (!a.dueDate && !b.dueDate) comp = 0;
          else if (!a.dueDate) comp = 1;
          else if (!b.dueDate) comp = -1;
          else comp = a.dueDate.localeCompare(b.dueDate);
        } else if (sortBy === 'createdAt') {
          comp = a.createdAt.localeCompare(b.createdAt);
        }

        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [tasks, search, projectId, status, priority, dueDateFilter, sortBy, sortOrder]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto text-[#F3F4F6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27292E]">
        <div>
          <h1 className="text-xl font-bold text-[#F3F4F6] tracking-tight">My Tasks</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Organize, prioritize, and track all personal tasks and project items.
          </p>
        </div>

        <button
          onClick={() => onOpenNewTaskModal(projectId !== 'all' && projectId !== 'unassigned' ? projectId : null)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A0A0B] bg-[#818CF8] hover:bg-[#A5B4FC] rounded-lg transition-colors self-start sm:self-auto shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-[#151619] border border-[#27292E] rounded-xl p-3 space-y-3">
        {/* Top row: Search and sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tasks by title or description..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#0A0A0B] text-[#F3F4F6] placeholder-[#6B7280] border border-[#27292E] rounded-lg focus:outline-none focus:border-[#818CF8] focus:ring-1 focus:ring-[#818CF8] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[#6B7280] font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as TaskSortField)}
              className="px-2.5 py-1.5 text-xs bg-[#0A0A0B] border border-[#27292E] rounded-lg text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
            >
              <option value="dueDate" className="bg-[#151619]">Due Date</option>
              <option value="priority" className="bg-[#151619]">Priority</option>
              <option value="createdAt" className="bg-[#151619]">Date Created</option>
              <option value="title" className="bg-[#151619]">Title (A-Z)</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 text-[#9CA3AF] hover:text-[#F3F4F6] bg-[#0A0A0B] border border-[#27292E] rounded-lg transition-colors"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom row: Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#27292E] text-xs">
          {/* Project Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#6B7280]">Project:</span>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="px-2 py-1 bg-[#0A0A0B] border border-[#27292E] rounded-md text-xs text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
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

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#6B7280]">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus | 'all')}
              className="px-2 py-1 bg-[#0A0A0B] border border-[#27292E] rounded-md text-xs text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
            >
              <option value="all" className="bg-[#151619]">All Statuses</option>
              <option value="backlog" className="bg-[#151619]">Backlog</option>
              <option value="todo" className="bg-[#151619]">To Do</option>
              <option value="in_progress" className="bg-[#151619]">In Progress</option>
              <option value="done" className="bg-[#151619]">Done</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#6B7280]">Priority:</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority | 'all')}
              className="px-2 py-1 bg-[#0A0A0B] border border-[#27292E] rounded-md text-xs text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
            >
              <option value="all" className="bg-[#151619]">All Priorities</option>
              <option value="urgent" className="bg-[#151619]">Urgent</option>
              <option value="high" className="bg-[#151619]">High</option>
              <option value="medium" className="bg-[#151619]">Medium</option>
              <option value="low" className="bg-[#151619]">Low</option>
            </select>
          </div>

          {/* Due Date Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#6B7280]">Due Date:</span>
            <select
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value as TaskDueDateFilter)}
              className="px-2 py-1 bg-[#0A0A0B] border border-[#27292E] rounded-md text-xs text-[#F3F4F6] focus:outline-none focus:border-[#818CF8]"
            >
              <option value="all" className="bg-[#151619]">All Dates</option>
              <option value="overdue" className="bg-[#151619]">Overdue</option>
              <option value="today" className="bg-[#151619]">Due Today</option>
              <option value="upcoming_7" className="bg-[#151619]">Next 7 Days</option>
              <option value="no_date" className="bg-[#151619]">No Due Date</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {isAnyFilterActive && (
            <button
              onClick={handleClearFilters}
              className="ml-auto flex items-center gap-1 text-[11px] font-medium text-[#9CA3AF] hover:text-[#F3F4F6] px-2 py-1 rounded hover:bg-[#1D1F23] transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count & Metadata */}
      <div className="flex items-center justify-between px-1 text-xs text-[#6B7280]">
        <span>
          Showing <strong className="font-mono text-[#F3F4F6]">{filteredTasks.length}</strong> {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={isAnyFilterActive ? 'No tasks match your filters' : 'No tasks created yet'}
          description={
            isAnyFilterActive
              ? 'Try adjusting your search query, priority, or date filters to find what you need.'
              : 'Add your first task to start organizing your personal priorities and coding projects.'
          }
          actionLabel={isAnyFilterActive ? 'Clear Filters' : 'Create First Task'}
          onAction={
            isAnyFilterActive
              ? handleClearFilters
              : () => onOpenNewTaskModal(projectId !== 'all' && projectId !== 'unassigned' ? projectId : null)
          }
        />
      ) : (
        <div className="space-y-1.5">
          {filteredTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            return (
              <TaskItem
                key={task.id}
                task={task}
                project={project}
                onToggleDone={onToggleTaskDone}
                onClick={onTaskClick}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
