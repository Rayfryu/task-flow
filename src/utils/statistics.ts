import { Project, Task } from '../types';
import { getTodayString } from './dateUtils';

export interface DashboardStats {
  totalActiveTasks: number;
  tasksDueToday: number;
  overdueTasks: number;
  completedTasks: number;
  activeProjectsCount: number;
  upcomingDeadlinesCount: number;
}

export function calculateProjectProgress(projectId: string, tasks: Task[]): {
  total: number;
  completed: number;
  percentage: number;
} {
  const projectTasks = tasks.filter(t => t.projectId === projectId);
  const total = projectTasks.length;
  if (total === 0) {
    return { total: 0, completed: 0, percentage: 0 };
  }
  const completed = projectTasks.filter(t => t.status === 'done').length;
  const percentage = Math.round((completed / total) * 100);
  return { total, completed, percentage };
}

export function calculateDashboardStats(projects: Project[], tasks: Task[]): DashboardStats {
  const today = getTodayString();

  const totalActiveTasks = tasks.filter(t => t.status !== 'done').length;
  const tasksDueToday = tasks.filter(t => t.status !== 'done' && t.dueDate === today).length;
  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.dueDate !== null && t.dueDate < today).length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const activeProjectsCount = projects.filter(p => p.status === 'active').length;

  // Next 7 days deadline
  const now = new Date();
  const next7Date = new Date();
  next7Date.setDate(now.getDate() + 7);
  const next7Year = next7Date.getFullYear();
  const next7Month = String(next7Date.getMonth() + 1).padStart(2, '0');
  const next7Day = String(next7Date.getDate()).padStart(2, '0');
  const next7Str = `${next7Year}-${next7Month}-${next7Day}`;

  const upcomingDeadlinesCount = tasks.filter(
    t => t.status !== 'done' && t.dueDate !== null && t.dueDate >= today && t.dueDate <= next7Str
  ).length;

  return {
    totalActiveTasks,
    tasksDueToday,
    overdueTasks,
    completedTasks,
    activeProjectsCount,
    upcomingDeadlinesCount
  };
}
