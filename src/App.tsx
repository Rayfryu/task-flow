/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Project,
  Task,
  PageView,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  ToastMessage,
  TaskFilters,
} from './types';
import {
  initializeStorage,
  saveStoredProjects,
  saveStoredTasks,
  getInitialDemoData,
  clearAllStoredData,
} from './services/storage';
import { isAuthenticated, logout } from './services/auth';

// Auth
import { LoginPage } from './components/auth/LoginPage';

// Layout
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { TopHeader } from './components/layout/TopHeader';
import { ToastContainer } from './components/common/ToastContainer';
import { ConfirmModal } from './components/common/ConfirmModal';

// Modals
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { TaskDetailModal } from './components/tasks/TaskDetailModal';
import { ProjectFormModal } from './components/projects/ProjectFormModal';
import { ProjectDeleteModal } from './components/projects/ProjectDeleteModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { MyTasksView } from './components/views/MyTasksView';
import { ProjectsView } from './components/views/ProjectsView';
import { ProjectDetailView } from './components/views/ProjectDetailView';
import { KanbanBoardView } from './components/views/KanbanBoardView';
import { CalendarView } from './components/views/CalendarView';
import { CompletedTasksView } from './components/views/CompletedTasksView';
import { SettingsView } from './components/views/SettingsView';

export default function App() {
  // Primary persistent state
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuth, setIsAuth] = useState<boolean>(() => isAuthenticated());

  // Navigation state
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTaskFilters, setActiveTaskFilters] = useState<Partial<TaskFilters>>({});

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskModalDefaultProjectId, setTaskModalDefaultProjectId] = useState<string | null>(null);
  const [taskModalDefaultStatus, setTaskModalDefaultStatus] = useState<TaskStatus>('todo');
  const [taskModalDefaultDueDate, setTaskModalDefaultDueDate] = useState<string | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeDetailTask, setActiveDetailTask] = useState<Task | null>(null);

  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Toast feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Safe initialization
  useEffect(() => {
    const data = initializeStorage();
    setProjects(data.projects);
    setTasks(data.tasks);
    setIsLoaded(true);
  }, []);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in form field
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement;

      if (isInput) return;

      if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setTaskToEdit(null);
        setTaskModalDefaultProjectId(
          currentPage === 'project-detail' && selectedProjectId ? selectedProjectId : null
        );
        setTaskModalDefaultStatus('todo');
        setTaskModalDefaultDueDate(null);
        setIsTaskModalOpen(true);
      } else if ((e.key === 'p' || e.key === 'P') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setProjectToEdit(null);
        setIsProjectModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, selectedProjectId]);

  // Keep activeDetailTask updated if its backing task changes in state
  useEffect(() => {
    if (activeDetailTask) {
      const updated = tasks.find((t) => t.id === activeDetailTask.id);
      if (updated) {
        setActiveDetailTask(updated);
      } else {
        setIsDetailModalOpen(false);
      }
    }
  }, [tasks]);

  // Navigation helper
  const navigate = (page: PageView, projId: string | null = null) => {
    setCurrentPage(page);
    setSelectedProjectId(projId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToFilteredTasks = (filters: Partial<TaskFilters>) => {
    setActiveTaskFilters(filters);
    navigate('tasks');
  };

  // --- TASK CRUD & STATUS OPERATIONS ---

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => {
    const now = new Date().toISOString();

    if (taskToEdit) {
      // Edit existing task
      const isNowDone = taskData.status === 'done';
      const wasDone = taskToEdit.status === 'done';
      let completedAt = taskToEdit.completedAt;

      if (isNowDone && !wasDone) {
        completedAt = now;
      } else if (!isNowDone && wasDone) {
        completedAt = null;
      }

      const updatedTask: Task = {
        ...taskToEdit,
        ...taskData,
        completedAt,
      };

      const updatedTasks = tasks.map((t) => (t.id === taskToEdit.id ? updatedTask : t));
      setTasks(updatedTasks);
      saveStoredTasks(updatedTasks);
      addToast('Task updated successfully');
    } else {
      // Create new task
      const newTask: Task = {
        ...taskData,
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        completedAt: taskData.status === 'done' ? now : null,
      };

      const updatedTasks = [newTask, ...tasks];
      setTasks(updatedTasks);
      saveStoredTasks(updatedTasks);
      addToast('New task added');
    }

    setIsTaskModalOpen(false);
    setTaskToEdit(null);
  };

  const handleToggleTaskDone = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const isDone = target.status === 'done';
    const newStatus: TaskStatus = isDone ? 'todo' : 'done';
    const completedAt = isDone ? null : new Date().toISOString();

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus, completedAt } : t
    );

    setTasks(updatedTasks);
    saveStoredTasks(updatedTasks);
    addToast(isDone ? 'Task marked as todo' : 'Task marked as completed');
  };

  const handleStatusChangeTask = (taskId: string, newStatus: TaskStatus) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const isNowDone = newStatus === 'done';
    const wasDone = target.status === 'done';
    let completedAt = target.completedAt;

    if (isNowDone && !wasDone) {
      completedAt = new Date().toISOString();
    } else if (!isNowDone && wasDone) {
      completedAt = null;
    }

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus, completedAt } : t
    );

    setTasks(updatedTasks);
    saveStoredTasks(updatedTasks);
  };

  const handlePriorityChangeTask = (taskId: string, newPriority: TaskPriority) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, priority: newPriority } : t
    );
    setTasks(updatedTasks);
    saveStoredTasks(updatedTasks);
  };

  const handleConfirmDeleteTask = () => {
    if (!taskToDelete) return;
    const updatedTasks = tasks.filter((t) => t.id !== taskToDelete.id);
    setTasks(updatedTasks);
    saveStoredTasks(updatedTasks);
    addToast('Task deleted');
    setTaskToDelete(null);
    if (activeDetailTask?.id === taskToDelete.id) {
      setIsDetailModalOpen(false);
    }
  };

  // --- PROJECT CRUD OPERATIONS ---

  const handleSaveProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    if (projectToEdit) {
      // Edit existing project
      const updatedProject: Project = {
        ...projectToEdit,
        ...projectData,
      };

      const updatedProjects = projects.map((p) =>
        p.id === projectToEdit.id ? updatedProject : p
      );
      setProjects(updatedProjects);
      saveStoredProjects(updatedProjects);
      addToast('Project updated successfully');
    } else {
      // Create new project
      const newProject: Project = {
        ...projectData,
        id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };

      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      saveStoredProjects(updatedProjects);
      addToast('New project created');
    }

    setIsProjectModalOpen(false);
    setProjectToEdit(null);
  };

  const handleUpdateProjectStatus = (projectId: string, newStatus: ProjectStatus) => {
    const updatedProjects = projects.map((p) =>
      p.id === projectId ? { ...p, status: newStatus } : p
    );
    setProjects(updatedProjects);
    saveStoredProjects(updatedProjects);
    addToast(`Project status set to ${newStatus.replace('_', ' ')}`);
  };

  const handleConfirmDeleteProject = (deleteTasks: boolean) => {
    if (!projectToDelete) return;

    const projectId = projectToDelete.id;
    const updatedProjects = projects.filter((p) => p.id !== projectId);

    let updatedTasks: Task[];
    if (deleteTasks) {
      updatedTasks = tasks.filter((t) => t.projectId !== projectId);
    } else {
      updatedTasks = tasks.map((t) =>
        t.projectId === projectId ? { ...t, projectId: null } : t
      );
    }

    setProjects(updatedProjects);
    setTasks(updatedTasks);
    saveStoredProjects(updatedProjects);
    saveStoredTasks(updatedTasks);

    setProjectToDelete(null);
    if (selectedProjectId === projectId) {
      navigate('projects');
    }
    addToast('Project deleted successfully');
  };

  // --- SETTINGS ACTIONS ---

  const handleLoadSampleData = () => {
    const initial = getInitialDemoData();
    setProjects(initial.projects);
    setTasks(initial.tasks);
    saveStoredProjects(initial.projects);
    saveStoredTasks(initial.tasks);
    addToast('Sample workspace data loaded');
    navigate('dashboard');
  };

  const handleImportData = (importedProjects: Project[], importedTasks: Task[]) => {
    setProjects(importedProjects);
    setTasks(importedTasks);
    saveStoredProjects(importedProjects);
    saveStoredTasks(importedTasks);
    addToast(`Restored ${importedProjects.length} projects and ${importedTasks.length} tasks`);
  };

  const handleClearAllData = () => {
    clearAllStoredData();
    setProjects([]);
    setTasks([]);
    addToast('Workspace data cleared', 'info');
    navigate('dashboard');
  };

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    addToast('Berhasil keluar dari sesi.', 'info');
  };

  // Active project for project-detail page
  const currentProject = projects.find((p) => p.id === selectedProjectId) || null;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-xs text-[#6B7280] font-mono">
        Loading TaskFlow...
      </div>
    );
  }

  // Route Protection: If not authenticated, show Login Page only
  if (!isAuth) {
    return (
      <>
        <LoginPage
          onLoginSuccess={() => {
            setIsAuth(true);
            setCurrentPage('dashboard');
            addToast('Selamat datang kembali, Ayub!');
          }}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="h-screen bg-[#0A0A0B] text-[#F3F4F6] flex flex-col md:flex-row overflow-hidden antialiased">
      {/* Desktop Sidebar (Fixed / Sticky) */}
      <div className="hidden md:flex shrink-0 h-screen sticky top-0">
        <Sidebar
          currentPage={currentPage}
          selectedProjectId={selectedProjectId}
          projects={projects}
          tasks={tasks}
          onNavigate={navigate}
          onOpenNewTaskModal={(defaultProj) => {
            setTaskToEdit(null);
            setTaskModalDefaultProjectId(defaultProj || null);
            setTaskModalDefaultStatus('todo');
            setTaskModalDefaultDueDate(null);
            setIsTaskModalOpen(true);
          }}
          onOpenNewProjectModal={() => {
            setProjectToEdit(null);
            setIsProjectModalOpen(true);
          }}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Navigation */}
        <MobileNav
          currentPage={currentPage}
          selectedProjectId={selectedProjectId}
          projects={projects}
          tasks={tasks}
          onNavigate={navigate}
          onOpenNewTaskModal={() => {
            setTaskToEdit(null);
            setTaskModalDefaultProjectId(
              currentPage === 'project-detail' && selectedProjectId ? selectedProjectId : null
            );
            setTaskModalDefaultStatus('todo');
            setTaskModalDefaultDueDate(null);
            setIsTaskModalOpen(true);
          }}
          onLogout={handleLogout}
        />

        {/* Top Header */}
        <TopHeader
          currentPage={currentPage}
          currentProject={currentProject}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewTaskModal={() => {
            setTaskToEdit(null);
            setTaskModalDefaultProjectId(
              currentPage === 'project-detail' && selectedProjectId ? selectedProjectId : null
            );
            setTaskModalDefaultStatus('todo');
            setTaskModalDefaultDueDate(null);
            setIsTaskModalOpen(true);
          }}
          onOpenNewProjectModal={() => {
            setProjectToEdit(null);
            setIsProjectModalOpen(true);
          }}
          onNavigateToProjects={() => navigate('projects')}
          onLogout={handleLogout}
        />

        {/* Dynamic Page Content (Scrollable Container) */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto min-h-0">
          {currentPage === 'dashboard' && (
            <DashboardView
              projects={projects}
              tasks={tasks}
              onNavigate={navigate}
              onNavigateToFilteredTasks={navigateToFilteredTasks}
              onOpenNewTaskModal={() => {
                setTaskToEdit(null);
                setTaskModalDefaultProjectId(null);
                setTaskModalDefaultStatus('todo');
                setTaskModalDefaultDueDate(null);
                setIsTaskModalOpen(true);
              }}
              onOpenNewProjectModal={() => {
                setProjectToEdit(null);
                setIsProjectModalOpen(true);
              }}
              onTaskClick={(t) => {
                setActiveDetailTask(t);
                setIsDetailModalOpen(true);
              }}
              onToggleTaskDone={handleToggleTaskDone}
            />
          )}

          {currentPage === 'tasks' && (
            <MyTasksView
              tasks={tasks}
              projects={projects}
              initialFilters={activeTaskFilters}
              onTaskClick={(t) => {
                setActiveDetailTask(t);
                setIsDetailModalOpen(true);
              }}
              onEditTask={(t) => {
                setTaskToEdit(t);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={(t) => setTaskToDelete(t)}
              onToggleTaskDone={handleToggleTaskDone}
              onOpenNewTaskModal={(defaultProj) => {
                setTaskToEdit(null);
                setTaskModalDefaultProjectId(defaultProj || null);
                setTaskModalDefaultStatus('todo');
                setTaskModalDefaultDueDate(null);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {currentPage === 'projects' && (
            <ProjectsView
              projects={projects}
              tasks={tasks}
              onOpenProjectDetail={(projId) => navigate('project-detail', projId)}
              onOpenNewProjectModal={() => {
                setProjectToEdit(null);
                setIsProjectModalOpen(true);
              }}
              onEditProject={(p) => {
                setProjectToEdit(p);
                setIsProjectModalOpen(true);
              }}
              onDeleteProject={(p) => setProjectToDelete(p)}
              onUpdateProjectStatus={handleUpdateProjectStatus}
            />
          )}

          {currentPage === 'project-detail' && currentProject && (
            <ProjectDetailView
              project={currentProject}
              tasks={tasks}
              projects={projects}
              onBackToProjects={() => navigate('projects')}
              onEditProject={(p) => {
                setProjectToEdit(p);
                setIsProjectModalOpen(true);
              }}
              onDeleteProject={(p) => setProjectToDelete(p)}
              onUpdateProjectStatus={handleUpdateProjectStatus}
              onOpenNewTaskModal={(defaultProj) => {
                setTaskToEdit(null);
                setTaskModalDefaultProjectId(defaultProj || currentProject.id);
                setTaskModalDefaultStatus('todo');
                setTaskModalDefaultDueDate(null);
                setIsTaskModalOpen(true);
              }}
              onTaskClick={(t) => {
                setActiveDetailTask(t);
                setIsDetailModalOpen(true);
              }}
              onEditTask={(t) => {
                setTaskToEdit(t);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={(t) => setTaskToDelete(t)}
              onToggleTaskDone={handleToggleTaskDone}
              onStatusChangeTask={handleStatusChangeTask}
            />
          )}

          {currentPage === 'kanban' && (
            <KanbanBoardView
              tasks={tasks}
              projects={projects}
              onTaskClick={(t) => {
                setActiveDetailTask(t);
                setIsDetailModalOpen(true);
              }}
              onStatusChange={handleStatusChangeTask}
              onOpenNewTaskModal={(defaultProj, defaultStatus) => {
                setTaskToEdit(null);
                setTaskModalDefaultProjectId(defaultProj || null);
                setTaskModalDefaultStatus(defaultStatus || 'todo');
                setTaskModalDefaultDueDate(null);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {currentPage === 'calendar' && (
            <CalendarView
              tasks={tasks}
              projects={projects}
              onTaskClick={(t) => {
                setActiveDetailTask(t);
                setIsDetailModalOpen(true);
              }}
              onOpenNewTaskModal={(defaultProj, defaultStatus, defaultDueDate) => {
                setTaskToEdit(null);
                setTaskModalDefaultProjectId(defaultProj || null);
                setTaskModalDefaultStatus(defaultStatus || 'todo');
                setTaskModalDefaultDueDate(defaultDueDate || null);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {currentPage === 'completed' && (
            <CompletedTasksView
              tasks={tasks}
              projects={projects}
              onTaskClick={(t) => {
                setActiveDetailTask(t);
                setIsDetailModalOpen(true);
              }}
              onReopenTask={(taskId) => handleToggleTaskDone(taskId)}
              onDeleteTask={(t) => setTaskToDelete(t)}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              projects={projects}
              tasks={tasks}
              onLoadSampleData={handleLoadSampleData}
              onImportData={handleImportData}
              onClearAllData={handleClearAllData}
            />
          )}
        </main>
      </div>

      {/* Task Creation / Editing Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        projects={projects}
        taskToEdit={taskToEdit}
        defaultProjectId={taskModalDefaultProjectId}
        defaultStatus={taskModalDefaultStatus}
        defaultDueDate={taskModalDefaultDueDate}
        onSave={handleSaveTask}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
      />

      {/* Task Inspection & Detail Modal */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        task={activeDetailTask}
        projects={projects}
        onClose={() => {
          setIsDetailModalOpen(false);
          setActiveDetailTask(null);
        }}
        onEdit={(task) => {
          setIsDetailModalOpen(false);
          setTaskToEdit(task);
          setIsTaskModalOpen(true);
        }}
        onDelete={(task) => {
          setTaskToDelete(task);
        }}
        onStatusChange={(taskId, newStatus) => {
          handleStatusChangeTask(taskId, newStatus);
        }}
        onPriorityChange={(taskId, newPriority) => {
          handlePriorityChangeTask(taskId, newPriority);
        }}
        onNavigateToProject={(projectId) => {
          navigate('project-detail', projectId);
        }}
      />

      {/* Project Creation / Editing Modal */}
      <ProjectFormModal
        isOpen={isProjectModalOpen}
        projectToEdit={projectToEdit}
        onSave={handleSaveProject}
        onClose={() => {
          setIsProjectModalOpen(false);
          setProjectToEdit(null);
        }}
      />

      {/* Project Deletion Confirmation Dialog with task handling options */}
      <ProjectDeleteModal
        isOpen={projectToDelete !== null}
        project={projectToDelete}
        taskCount={
          projectToDelete ? tasks.filter((t) => t.projectId === projectToDelete.id).length : 0
        }
        onConfirm={handleConfirmDeleteProject}
        onCancel={() => setProjectToDelete(null)}
      />

      {/* Task Deletion Confirmation Dialog */}
      <ConfirmModal
        isOpen={taskToDelete !== null}
        title="Delete Task?"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* Toast Notifications Feedback */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
