import { Project, Task, BackupData } from '../types';
import { getTodayString } from '../utils/dateUtils';

export const STORAGE_KEYS = {
  PROJECTS: 'taskflow_projects_v1',
  TASKS: 'taskflow_tasks_v1',
} as const;

/**
 * Checks if a candidate object conforms to Project interface
 */
export function isValidProject(item: any): item is Project {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.description === 'string' &&
    typeof item.color === 'string' &&
    ['active', 'on_hold', 'completed', 'archived'].includes(item.status) &&
    (item.startDate === null || typeof item.startDate === 'string') &&
    (item.dueDate === null || typeof item.dueDate === 'string') &&
    typeof item.createdAt === 'string'
  );
}

/**
 * Checks if a candidate object conforms to Task interface
 */
export function isValidTask(item: any): item is Task {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    (item.projectId === null || typeof item.projectId === 'string') &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    ['low', 'medium', 'high', 'urgent'].includes(item.priority) &&
    ['backlog', 'todo', 'in_progress', 'done'].includes(item.status) &&
    (item.dueDate === null || typeof item.dueDate === 'string') &&
    (item.estimatedMinutes === null || typeof item.estimatedMinutes === 'number') &&
    typeof item.createdAt === 'string' &&
    (item.completedAt === null || typeof item.completedAt === 'string')
  );
}

/**
 * Safely loads projects from LocalStorage. Returns empty array if missing or malformed.
 */
export function loadStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidProject);
  } catch (error) {
    console.error('TaskFlow: Failed to read projects from storage', error);
    return [];
  }
}

/**
 * Safely saves projects to LocalStorage.
 */
export function saveStoredProjects(projects: Project[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return true;
  } catch (error) {
    console.error('TaskFlow: Failed to persist projects to storage', error);
    return false;
  }
}

/**
 * Safely loads tasks from LocalStorage. Returns empty array if missing or malformed.
 */
export function loadStoredTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTask);
  } catch (error) {
    console.error('TaskFlow: Failed to read tasks from storage', error);
    return [];
  }
}

/**
 * Safely saves tasks to LocalStorage.
 */
export function saveStoredTasks(tasks: Task[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    return true;
  } catch (error) {
    console.error('TaskFlow: Failed to persist tasks to storage', error);
    return false;
  }
}

/**
 * Checks if the user already has initialized data stored.
 */
export function hasStoredData(): boolean {
  try {
    const p = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const t = localStorage.getItem(STORAGE_KEYS.TASKS);
    return p !== null || t !== null;
  } catch {
    return false;
  }
}

/**
 * Generates initial demo data tailored for personal and engineering tasks.
 */
export function getInitialDemoData(): { projects: Project[]; tasks: Task[] } {
  const today = getTodayString();
  const d = new Date();

  const getDateOffset = (offsetDays: number) => {
    const target = new Date(d);
    target.setDate(target.getDate() + offsetDays);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const projects: Project[] = [
    {
      id: 'proj_dev_portfolio',
      name: 'Developer Portfolio & Lab',
      description: 'Modern portfolio showcase with interactive benchmarks and project highlights.',
      color: '#2563eb', // Blue
      status: 'active',
      startDate: getDateOffset(-14),
      dueDate: getDateOffset(10),
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: 'proj_fitness_marathon',
      name: 'Spring 10K Training',
      description: 'Structured endurance plan, recovery tracking, and nutrition regimen.',
      color: '#10b981', // Emerald
      status: 'active',
      startDate: getDateOffset(-20),
      dueDate: getDateOffset(30),
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 'proj_home_studio',
      name: 'Desk Setup & Acoustic Treatment',
      description: 'Cable routing, ergonomic monitor arm mounting, and acoustic wall panels.',
      color: '#8b5cf6', // Violet
      status: 'on_hold',
      startDate: getDateOffset(-10),
      dueDate: getDateOffset(18),
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: 'proj_tax_accounting',
      name: 'Annual Financial Audit',
      description: 'Expense reconciliation, receipt archiving, and tax filing documents.',
      color: '#f59e0b', // Amber
      status: 'completed',
      startDate: getDateOffset(-40),
      dueDate: getDateOffset(-5),
      createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    },
  ];

  const tasks: Task[] = [
    // Project 1: Portfolio
    {
      id: 'task_1',
      projectId: 'proj_dev_portfolio',
      title: 'Audit Lighthouse performance scores',
      description: 'Inspect Core Web Vitals, optimize image payload sizes, and minimize main-thread work.',
      priority: 'high',
      status: 'in_progress',
      dueDate: today,
      estimatedMinutes: 60,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      completedAt: null,
    },
    {
      id: 'task_2',
      projectId: 'proj_dev_portfolio',
      title: 'Draft case study for distributed cache architecture',
      description: 'Include benchmark charts, failover strategies, and architectural decisions.',
      priority: 'medium',
      status: 'todo',
      dueDate: getDateOffset(3),
      estimatedMinutes: 120,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      completedAt: null,
    },
    {
      id: 'task_3',
      projectId: 'proj_dev_portfolio',
      title: 'Review responsive navigation on mobile Safari',
      description: 'Ensure touch targets exceed 44px and eliminate subtle horizontal overflow.',
      priority: 'urgent',
      status: 'backlog',
      dueDate: getDateOffset(5),
      estimatedMinutes: 45,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      completedAt: null,
    },
    {
      id: 'task_4',
      projectId: 'proj_dev_portfolio',
      title: 'Register custom domain DNS records',
      description: 'Configure apex domain and subdomains with Cloudflare SSL certificate.',
      priority: 'medium',
      status: 'done',
      dueDate: getDateOffset(-2),
      estimatedMinutes: 30,
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },

    // Project 2: Fitness
    {
      id: 'task_5',
      projectId: 'proj_fitness_marathon',
      title: 'Complete 8km tempo threshold workout',
      description: 'Sustain 4:55/km pace across mid-section intervals with cadence monitoring.',
      priority: 'urgent',
      status: 'todo',
      dueDate: today,
      estimatedMinutes: 50,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      completedAt: null,
    },
    {
      id: 'task_6',
      projectId: 'proj_fitness_marathon',
      title: 'Order replacement running shoes',
      description: 'Current pair reached 650km. Select neutral cushioned trainers.',
      priority: 'low',
      status: 'backlog',
      dueDate: getDateOffset(7),
      estimatedMinutes: 20,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      completedAt: null,
    },
    {
      id: 'task_7',
      projectId: 'proj_fitness_marathon',
      title: 'Foam rolling and mobility routine',
      description: 'Hamstring, calf, and hip flexor dynamic release.',
      priority: 'medium',
      status: 'done',
      dueDate: getDateOffset(-1),
      estimatedMinutes: 25,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },

    // Project 3: Home studio
    {
      id: 'task_8',
      projectId: 'proj_home_studio',
      title: 'Measure corner dimensions for bass traps',
      description: 'Determine exact clearance around doorway and shelving.',
      priority: 'low',
      status: 'backlog',
      dueDate: getDateOffset(14),
      estimatedMinutes: 40,
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      completedAt: null,
    },

    // Project 4: Tax Accounting (Completed)
    {
      id: 'task_9',
      projectId: 'proj_tax_accounting',
      title: 'Consolidate contractor 1099 invoices',
      description: 'Verify quarterly revenue statements against bank ledger records.',
      priority: 'high',
      status: 'done',
      dueDate: getDateOffset(-6),
      estimatedMinutes: 90,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      completedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },

    // Personal Unassigned tasks (projectId = null)
    {
      id: 'task_10',
      projectId: null,
      title: 'Schedule dentist preventive checkup',
      description: 'Call clinic reception to book 6-month routine cleaning.',
      priority: 'medium',
      status: 'todo',
      dueDate: getDateOffset(2),
      estimatedMinutes: 15,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      completedAt: null,
    },
    {
      id: 'task_11',
      projectId: null,
      title: 'Renew vehicle registration renewal',
      description: 'Submit smog certificate compliance and payment online.',
      priority: 'urgent',
      status: 'in_progress',
      dueDate: getDateOffset(-1), // overdue to illustrate overdue handling!
      estimatedMinutes: 30,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      completedAt: null,
    },
  ];

  return { projects, tasks };
}

const ZERO_RESET_KEY = 'taskflow_reset_to_zero_v2';

/**
 * Initializes storage: defaults to 0 data (empty lists) and applies clean reset to zero out all data.
 */
export function initializeStorage(): { projects: Project[]; tasks: Task[] } {
  // Ensure existing browser session data is cleared to 0 as requested by user
  try {
    if (localStorage.getItem(ZERO_RESET_KEY) !== 'done') {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
      localStorage.setItem(ZERO_RESET_KEY, 'done');
      return { projects: [], tasks: [] };
    }
  } catch (e) {
    console.error('TaskFlow: error during zero reset', e);
  }

  const hasExisting = hasStoredData();
  if (hasExisting) {
    const projects = loadStoredProjects();
    const tasks = loadStoredTasks();
    return { projects, tasks };
  }

  // Default initial state: clean empty workspace (0 projects, 0 tasks)
  saveStoredProjects([]);
  saveStoredTasks([]);
  return { projects: [], tasks: [] };
}

/**
 * Exports data to JSON file download
 */
export function exportDataToJson(projects: Project[], tasks: Task[]): void {
  const backup: BackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    projects,
    tasks,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `taskflow-backup-${getTodayString()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Validates candidate JSON backup content
 */
export function validateBackupJson(rawJson: string): {
  valid: boolean;
  projects: Project[];
  tasks: Task[];
  error?: string;
} {
  try {
    const data = JSON.parse(rawJson);
    if (!data || typeof data !== 'object') {
      return { valid: false, projects: [], tasks: [], error: 'Invalid file format: JSON root must be an object.' };
    }

    if (!Array.isArray(data.projects)) {
      return { valid: false, projects: [], tasks: [], error: 'Backup is missing valid "projects" array.' };
    }

    if (!Array.isArray(data.tasks)) {
      return { valid: false, projects: [], tasks: [], error: 'Backup is missing valid "tasks" array.' };
    }

    const validProjects = data.projects.filter(isValidProject);
    const validTasks = data.tasks.filter(isValidTask);

    return {
      valid: true,
      projects: validProjects,
      tasks: validTasks,
    };
  } catch (err: any) {
    return { valid: false, projects: [], tasks: [], error: `Invalid JSON syntax: ${err.message || 'unknown error'}` };
  }
}

/**
 * Completely clears TaskFlow data in local storage to 0 items
 */
export function clearAllStoredData(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
  } catch (error) {
    console.error('TaskFlow: Failed to clear storage', error);
  }
}

/**
 * Calculates current storage footprint in bytes & formatted string
 */
export function getStorageUsageInfo(): { bytes: number; formatted: string } {
  try {
    const p = localStorage.getItem(STORAGE_KEYS.PROJECTS) || '';
    const t = localStorage.getItem(STORAGE_KEYS.TASKS) || '';
    const totalChars = p.length + t.length;
    // rough UTF-16 byte estimate (2 bytes per character)
    const bytes = totalChars * 2;
    if (bytes < 1024) return { bytes, formatted: `${bytes} B` };
    if (bytes < 1024 * 1024) return { bytes, formatted: `${(bytes / 1024).toFixed(1)} KB` };
    return { bytes, formatted: `${(bytes / (1024 * 1024)).toFixed(2)} MB` };
  } catch {
    return { bytes: 0, formatted: '0 KB' };
  }
}
