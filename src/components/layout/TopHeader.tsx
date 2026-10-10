import React, { useState, useRef, useEffect } from 'react';
import { PageView, Project } from '../../types';
import { Plus, Search, ChevronRight, LogOut, ChevronDown } from 'lucide-react';

interface TopHeaderProps {
  currentPage: PageView;
  currentProject: Project | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenNewProjectModal: () => void;
  onNavigateToProjects: () => void;
  onLogout: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentPage,
  currentProject,
  searchQuery,
  onSearchChange,
  onOpenNewTaskModal,
  onOpenNewProjectModal,
  onNavigateToProjects,
  onLogout,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'tasks':
        return 'My Tasks';
      case 'projects':
        return 'Projects';
      case 'project-detail':
        return currentProject ? currentProject.name : 'Project Details';
      case 'kanban':
        return 'Kanban Board';
      case 'calendar':
        return 'Calendar';
      case 'completed':
        return 'Completed Tasks';
      case 'settings':
        return 'Settings';
      default:
        return 'TaskFlow';
    }
  };

  return (
    <header className="h-14 px-4 sm:px-6 bg-[#0A0A0B] border-b border-[#27292E] flex items-center justify-between gap-4 shrink-0 text-[#F3F4F6]">
      {/* Zone 1: Breadcrumbs trail */}
      <div className="flex items-center gap-1.5 text-xs text-[#6B7280] whitespace-nowrap min-w-0">
        <span className="font-medium">Workspace</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#27292E] shrink-0" />
        {currentPage === 'project-detail' ? (
          <>
            <button
              onClick={onNavigateToProjects}
              className="hover:text-[#F3F4F6] transition-colors font-medium hover:underline"
            >
              Projects
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#27292E] shrink-0" />
            <span className="font-semibold text-[#F3F4F6] truncate max-w-[200px]">
              {currentProject ? currentProject.name : 'Detail'}
            </span>
          </>
        ) : (
          <span className="font-semibold text-[#F3F4F6]">{getPageTitle()}</span>
        )}
      </div>

      {/* Zone 2: Search input */}
      <div className="hidden sm:flex items-center flex-1 max-w-xs mx-auto">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks & projects... (/)"
            className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#151619] hover:bg-[#1D1F23]/80 focus:bg-[#151619] border border-[#27292E] rounded-lg text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#818CF8] focus:ring-1 focus:ring-[#818CF8] transition-colors"
          />
        </div>
      </div>

      {/* Zone 3: Primary Actions & User Menu */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenNewProjectModal}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F3F4F6] bg-[#151619] border border-[#27292E] hover:bg-[#1D1F23] rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-[#9CA3AF]" />
          <span>New Project</span>
        </button>

        <button
          type="button"
          onClick={onOpenNewTaskModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#0A0A0B] bg-[#818CF8] hover:bg-[#A5B4FC] active:bg-[#6366F1] rounded-lg transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Task</span>
        </button>

        <div className="h-5 w-[1px] bg-[#27292E] mx-0.5 hidden sm:block" />

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg hover:bg-[#1D1F23] transition-colors text-[#F3F4F6] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#818CF8]"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            {/* Avatar with letter A */}
            <div className="w-6 h-6 rounded-full bg-[#1D1F23] border border-[#27292E] text-[#818CF8] font-semibold text-xs flex items-center justify-center">
              A
            </div>
            <span className="text-xs font-medium text-[#F3F4F6] hidden sm:inline">
              Ayub
            </span>
            <ChevronDown className="w-3 h-3 text-[#6B7280] hidden sm:inline" />
          </button>

          {/* User Menu Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-[#151619] border border-[#27292E] rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-[#27292E]">
                <p className="text-xs font-medium text-[#F3F4F6]">Ayub</p>
                <p className="text-[10px] text-[#6B7280] truncate mt-0.5">ayub · Workspace</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#F87171] hover:bg-[#1D1F23] transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
