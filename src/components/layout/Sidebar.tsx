import React from 'react';
import { PageView, Project, Task } from '../../types';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Kanban,
  CalendarDays,
  CheckCircle,
  Settings,
  Plus,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageView;
  selectedProjectId: string | null;
  projects: Project[];
  tasks: Task[];
  onNavigate: (page: PageView, projectId?: string | null) => void;
  onOpenNewTaskModal: (defaultProjectId?: string | null) => void;
  onOpenNewProjectModal: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  selectedProjectId,
  projects,
  tasks,
  onNavigate,
  onOpenNewTaskModal,
  onOpenNewProjectModal,
  onLogout,
}) => {
  const activeTasksCount = tasks.filter((t) => t.status !== 'done').length;
  const completedTasksCount = tasks.filter((t) => t.status === 'done').length;
  const activeProjects = projects.filter((p) => p.status === 'active');

  const navItems = [
    {
      id: 'dashboard' as PageView,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'tasks' as PageView,
      label: 'My Tasks',
      icon: CheckSquare,
      count: activeTasksCount,
    },
    {
      id: 'projects' as PageView,
      label: 'Projects',
      icon: FolderKanban,
      count: projects.filter((p) => p.status !== 'archived').length,
    },
    {
      id: 'kanban' as PageView,
      label: 'Kanban Board',
      icon: Kanban,
    },
    {
      id: 'calendar' as PageView,
      label: 'Calendar',
      icon: CalendarDays,
    },
    {
      id: 'completed' as PageView,
      label: 'Completed Tasks',
      icon: CheckCircle,
      count: completedTasksCount,
    },
    {
      id: 'settings' as PageView,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-60 h-screen sticky top-0 bg-[#0F1012] border-r border-[#27292E] flex flex-col shrink-0 select-none text-[#F3F4F6]">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#27292E]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-[#1D1F23] border border-[#27292E] flex items-center justify-center text-[#818CF8]">
            <span className="text-[11px] font-bold font-mono">TF</span>
          </div>
          <span className="font-semibold text-[#F3F4F6] tracking-tight text-sm">
            TaskFlow
          </span>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => onOpenNewTaskModal()}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-[#0A0A0B] bg-[#818CF8] hover:bg-[#A5B4FC] active:bg-[#6366F1] rounded-lg transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Task</span>
          <kbd className="ml-auto text-[10px] bg-[#6366F1] text-white px-1.5 py-0.2 rounded font-mono">
            N
          </kbd>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] px-2 py-1.5">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id && !selectedProjectId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id, null)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#1D1F23] text-[#818CF8]'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1D1F23]/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 stroke-[1.75] ${
                  isActive ? 'text-[#818CF8]' : 'text-[#6B7280]'
                }`}
              />
              <span className="truncate">{item.label}</span>
              {typeof item.count === 'number' && item.count > 0 && (
                <span className="ml-auto text-[11px] tabular-nums font-mono text-[#6B7280]">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Active Projects Sub-list */}
        <div className="pt-4 pb-1">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Projects
            </span>
            <button
              type="button"
              onClick={onOpenNewProjectModal}
              className="text-[#6B7280] hover:text-[#F3F4F6] p-0.5 rounded hover:bg-[#1D1F23] transition-colors"
              title="Add Project"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5 mt-1">
            {activeProjects.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-[#6B7280] italic">
                No active projects
              </div>
            ) : (
              activeProjects.map((p) => {
                const isSelected =
                  currentPage === 'project-detail' && selectedProjectId === p.id;
                const projectTaskCount = tasks.filter(
                  (t) => t.projectId === p.id && t.status !== 'done'
                ).length;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onNavigate('project-detail', p.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors group ${
                      isSelected
                        ? 'bg-[#1D1F23] text-[#F3F4F6]'
                        : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1D1F23]/60'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="truncate text-left flex-1">{p.name}</span>
                    {projectTaskCount > 0 && (
                      <span className="text-[11px] tabular-nums font-mono text-[#6B7280]">
                        {projectTaskCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </nav>

      {/* User Profile at Bottom */}
      <div className="p-3 border-t border-[#27292E] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-full bg-[#1D1F23] border border-[#27292E] text-[#818CF8] font-semibold text-[11px] flex items-center justify-center shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#F3F4F6] truncate leading-none">Ayub</p>
            <p className="text-[10px] text-[#6B7280] truncate mt-1 leading-none">Workspace</p>
          </div>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="text-[#6B7280] hover:text-[#F87171] p-1.5 rounded hover:bg-[#1D1F23] transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
};
