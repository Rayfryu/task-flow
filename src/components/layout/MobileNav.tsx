import React, { useState } from 'react';
import { PageView, Project, Task } from '../../types';
import {
  Menu,
  X,
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Kanban,
  CalendarDays,
  CheckCircle,
  Settings,
  Plus,
} from 'lucide-react';

interface MobileNavProps {
  currentPage: PageView;
  selectedProjectId: string | null;
  projects: Project[];
  tasks: Task[];
  onNavigate: (page: PageView, projectId?: string | null) => void;
  onOpenNewTaskModal: () => void;
  onLogout?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  selectedProjectId,
  projects,
  tasks,
  onNavigate,
  onOpenNewTaskModal,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeTasksCount = tasks.filter((t) => t.status !== 'done').length;
  const activeProjects = projects.filter((p) => p.status === 'active');

  const navItems = [
    { id: 'dashboard' as PageView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' as PageView, label: 'My Tasks', icon: CheckSquare, count: activeTasksCount },
    { id: 'projects' as PageView, label: 'Projects', icon: FolderKanban },
    { id: 'kanban' as PageView, label: 'Kanban Board', icon: Kanban },
    { id: 'calendar' as PageView, label: 'Calendar', icon: CalendarDays },
    { id: 'completed' as PageView, label: 'Completed Tasks', icon: CheckCircle },
    { id: 'settings' as PageView, label: 'Settings', icon: Settings },
  ];

  const handleSelectPage = (page: PageView, projId: string | null = null) => {
    onNavigate(page, projId);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden border-b border-[#27292E] bg-[#0F1012] sticky top-0 z-40 text-[#F3F4F6]">
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-[#9CA3AF] hover:text-[#F3F4F6] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#818CF8] rounded-lg"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1D1F23] border border-[#27292E] flex items-center justify-center text-[#818CF8] text-[11px] font-bold font-mono">
              TF
            </div>
            <span className="font-semibold text-[#F3F4F6] text-sm">TaskFlow</span>
          </div>
        </div>

        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A0A0B] bg-[#818CF8] active:bg-[#6366F1] rounded-lg"
        >
          <Plus className="w-4 h-4" />
          <span>New</span>
        </button>
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xs flex"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-72 max-w-[80vw] h-full bg-[#0F1012] border-r border-[#27292E] flex flex-col p-4 shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#27292E]">
              <span className="font-semibold text-[#F3F4F6] text-sm">Navigation</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#6B7280] hover:text-[#F3F4F6] rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id && !selectedProjectId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPage(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#1D1F23] text-[#818CF8]'
                        : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1D1F23]/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span className="ml-auto text-xs text-[#6B7280] tabular-nums font-mono">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}

              {activeProjects.length > 0 && (
                <div className="pt-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] px-3 py-1">
                    Projects
                  </div>
                  <div className="space-y-1 mt-1">
                    {activeProjects.map((p) => {
                      const isSelected =
                        currentPage === 'project-detail' && selectedProjectId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => handleSelectPage('project-detail', p.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-[#1D1F23] text-[#F3F4F6]'
                              : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1D1F23]/60'
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: p.color }}
                          />
                          <span className="truncate text-left">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </nav>

            {/* Mobile User Profile & Logout */}
            <div className="pt-3 border-t border-[#27292E] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#1D1F23] border border-[#27292E] text-[#818CF8] font-semibold text-xs flex items-center justify-center">
                  A
                </div>
                <div>
                  <p className="text-xs font-medium text-[#F3F4F6]">Ayub</p>
                  <p className="text-[10px] text-[#6B7280]">Workspace</p>
                </div>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-[#F87171] hover:bg-[#1D1F23] rounded-lg transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
