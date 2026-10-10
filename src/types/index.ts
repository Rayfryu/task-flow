export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  status: ProjectStatus;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  projectId: string | null;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  estimatedMinutes: number | null;
  createdAt: string;
  completedAt: string | null;
}

export type PageView =
  | 'dashboard'
  | 'tasks'
  | 'projects'
  | 'project-detail'
  | 'kanban'
  | 'calendar'
  | 'completed'
  | 'settings';

export type TaskDueDateFilter = 'all' | 'overdue' | 'today' | 'upcoming_7' | 'no_date';

export type TaskSortField = 'dueDate' | 'priority' | 'createdAt' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface TaskFilters {
  search: string;
  projectId: string | 'all' | 'unassigned';
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  dueDate: TaskDueDateFilter;
  sortBy: TaskSortField;
  sortOrder: SortOrder;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  projects: Project[];
  tasks: Task[];
}
