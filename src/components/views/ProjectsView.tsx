import React, { useState, useMemo } from 'react';
import { Project, Task, ProjectStatus } from '../../types';
import { calculateProjectProgress } from '../../utils/statistics';
import { formatShortDate } from '../../utils/dateUtils';
import { EmptyState } from '../common/EmptyState';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  onOpenProjectDetail: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onUpdateProjectStatus: (projectId: string, newStatus: ProjectStatus) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  tasks,
  onOpenProjectDetail,
  onOpenNewProjectModal,
  onEditProject,
  onDeleteProject,
  onUpdateProjectStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('active');
  const [search, setSearch] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== 'all') {
        if (p.status !== statusFilter) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [projects, statusFilter, search]);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return <span className="text-[#34D399] font-medium">Active</span>;
      case 'on_hold':
        return <span className="text-[#FBBF24] font-medium">On Hold</span>;
      case 'completed':
        return <span className="text-[#818CF8] font-medium">Completed</span>;
      case 'archived':
        return <span className="text-[#6B7280] font-medium">Archived</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#F3F4F6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27292E]">
        <div>
          <h1 className="text-xl font-bold text-[#F3F4F6] tracking-tight">Projects</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Manage long-term initiatives, personal goals, and technical projects.
          </p>
        </div>

        <button
          onClick={onOpenNewProjectModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A0A0B] bg-[#818CF8] hover:bg-[#A5B4FC] rounded-lg transition-colors self-start sm:self-auto shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Control bar: Status tabs & search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#151619] rounded-lg border border-[#27292E] overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'all'
                ? 'bg-[#1D1F23] text-[#F3F4F6] border border-[#27292E]'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            All ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'active'
                ? 'bg-[#1D1F23] text-[#F3F4F6] border border-[#27292E]'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            Active ({projects.filter((p) => p.status === 'active').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('on_hold')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'on_hold'
                ? 'bg-[#1D1F23] text-[#F3F4F6] border border-[#27292E]'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            On Hold ({projects.filter((p) => p.status === 'on_hold').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'completed'
                ? 'bg-[#1D1F23] text-[#F3F4F6] border border-[#27292E]'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            Completed ({projects.filter((p) => p.status === 'completed').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('archived')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === 'archived'
                ? 'bg-[#1D1F23] text-[#F3F4F6] border border-[#27292E]'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            Archived ({projects.filter((p) => p.status === 'archived').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#151619] border border-[#27292E] rounded-lg text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#818CF8] focus:ring-1 focus:ring-[#818CF8] transition-colors"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={
            search || statusFilter !== 'all'
              ? 'No projects match your filter'
              : 'No projects added yet'
          }
          description={
            search || statusFilter !== 'all'
              ? 'Try changing the status tab or clearing your search term.'
              : 'Create a project to bundle related tasks, track velocity, and set deadlines.'
          }
          actionLabel="Create Project"
          onAction={onOpenNewProjectModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProjects.map((project) => {
            const { total, completed, percentage } = calculateProjectProgress(
              project.id,
              tasks
            );

            return (
              <div
                key={project.id}
                className="bg-[#151619] border border-[#27292E] rounded-xl p-4 hover:border-[#374151] transition-all hover:bg-[#1D1F23]/60 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Color, Name, Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <button
                        onClick={() => onOpenProjectDetail(project.id)}
                        className="text-left font-semibold text-xs text-[#F3F4F6] group-hover:text-[#818CF8] truncate transition-colors"
                      >
                        {project.name}
                      </button>
                    </div>

                    <div className="text-xs shrink-0 flex items-center gap-1.5">
                      {getStatusBadge(project.status)}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-xs text-[#9CA3AF] line-clamp-2 min-h-[32px] leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-mono text-[#6B7280] mb-1.5">
                      <span className="tabular-nums">
                        {completed} / {total} tasks ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#0A0A0B] rounded-full h-1 overflow-hidden border border-[#27292E]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  {(project.startDate || project.dueDate) && (
                    <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-[#6B7280] tabular-nums">
                      <Calendar className="w-3 h-3 text-[#6B7280]" />
                      <span>
                        {project.startDate ? formatShortDate(project.startDate) : 'Start'}
                        {' → '}
                        {project.dueDate ? formatShortDate(project.dueDate) : 'No deadline'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-3 border-t border-[#27292E] flex items-center justify-between">
                  <button
                    onClick={() => onOpenProjectDetail(project.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#818CF8] hover:text-[#A5B4FC] transition-colors"
                  >
                    <span>View Tasks</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditProject(project)}
                      className="p-1 text-[#6B7280] hover:text-[#F3F4F6] hover:bg-[#1D1F23] rounded transition-colors"
                      title="Edit project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {project.status === 'archived' ? (
                      <button
                        onClick={() => onUpdateProjectStatus(project.id, 'active')}
                        className="p-1 text-[#6B7280] hover:text-[#34D399] hover:bg-[#1D1F23] rounded transition-colors"
                        title="Restore project to active"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateProjectStatus(project.id, 'archived')}
                        className="p-1 text-[#6B7280] hover:text-[#F3F4F6] hover:bg-[#1D1F23] rounded transition-colors"
                        title="Archive project"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteProject(project)}
                      className="p-1 text-[#6B7280] hover:text-[#F87171] hover:bg-[#1D1F23] rounded transition-colors"
                      title="Delete project"
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
