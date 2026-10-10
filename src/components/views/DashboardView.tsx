import React from 'react';
import { Project, Task, PageView } from '../../types';
import { calculateProjectProgress } from '../../utils/statistics';
import { getTodayString, formatShortDate, formatRelativeDueDate } from '../../utils/dateUtils';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  FolderKanban,
  ArrowRight,
  Plus,
  Folder,
  Circle,
  TrendingUp,
} from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  tasks: Task[];
  onNavigate: (page: PageView, projectId?: string | null) => void;
  onNavigateToFilteredTasks?: (filterOverrides: any) => void;
  onOpenNewTaskModal: () => void;
  onOpenNewProjectModal: () => void;
  onTaskClick: (task: Task) => void;
  onToggleTaskDone: (taskId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  tasks,
  onNavigate,
  onNavigateToFilteredTasks,
  onOpenNewTaskModal,
  onOpenNewProjectModal,
  onTaskClick,
  onToggleTaskDone,
}) => {
  const todayStr = getTodayString();

  // Statistics derived dynamically from current data
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const overdueTasks = tasks.filter((t) => t.status !== 'done' && t.dueDate !== null && t.dueDate < todayStr).length;

  // Tasks due today or recently active
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);

  // Upcoming deadlines in next 7 days (not done, due after today)
  const upcomingTasks = tasks
    .filter((t) => {
      if (t.status === 'done' || !t.dueDate) return false;
      return t.dueDate > todayStr;
    })
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 5);

  // Active projects for progress display
  const activeProjects = projects.filter((p) => p.status === 'active');

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#F3F4F6]">
      {/* Header Introduction - Personalized Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27292E]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F3F4F6] flex items-center gap-2">
            <span>Hallo, Ayub</span>
            <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1 font-normal">
            Yuk, selesaikan hal penting hari ini.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A0A0B] bg-[#818CF8] hover:bg-[#A5B4FC] active:bg-[#6366F1] rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Dark surfaces, subtle borders, restrained accent colors) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Tasks */}
        <button
          type="button"
          onClick={() => {
            if (onNavigateToFilteredTasks) {
              onNavigateToFilteredTasks({ status: 'all', dueDate: 'all' });
            } else {
              onNavigate('tasks');
            }
          }}
          className="p-3.5 bg-[#151619] border border-[#27292E] rounded-xl text-left hover:border-[#374151] hover:bg-[#1D1F23]/80 transition-all group"
        >
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-xs font-medium text-[#9CA3AF]">Total Tasks</span>
            <CheckSquare className="w-4 h-4 text-[#818CF8]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#F3F4F6]">
            {totalTasks}
          </div>
          <span className="text-[11px] text-[#6B7280] group-hover:text-[#818CF8] flex items-center gap-1 mt-1 font-medium transition-colors">
            Lihat semua <ArrowRight className="w-3 h-3" />
          </span>
        </button>

        {/* In Progress */}
        <button
          type="button"
          onClick={() => {
            if (onNavigateToFilteredTasks) {
              onNavigateToFilteredTasks({ status: 'in_progress' });
            } else {
              onNavigate('tasks');
            }
          }}
          className="p-3.5 bg-[#151619] border border-[#27292E] rounded-xl text-left hover:border-[#374151] hover:bg-[#1D1F23]/80 transition-all group"
        >
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-xs font-medium text-[#9CA3AF]">In Progress</span>
            <Clock className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#F3F4F6]">
            {inProgressTasks}
          </div>
          <span className="text-[11px] text-[#6B7280] group-hover:text-[#FBBF24] flex items-center gap-1 mt-1 font-medium transition-colors">
            Sedang dikerjakan <ArrowRight className="w-3 h-3" />
          </span>
        </button>

        {/* Completed */}
        <button
          type="button"
          onClick={() => onNavigate('completed')}
          className="p-3.5 bg-[#151619] border border-[#27292E] rounded-xl text-left hover:border-[#374151] hover:bg-[#1D1F23]/80 transition-all group"
        >
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-xs font-medium text-[#9CA3AF]">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#F3F4F6]">
            {completedTasks}
          </div>
          <span className="text-[11px] text-[#6B7280] group-hover:text-[#34D399] flex items-center gap-1 mt-1 font-medium transition-colors">
            Lihat riwayat <ArrowRight className="w-3 h-3" />
          </span>
        </button>

        {/* Overdue */}
        <button
          type="button"
          onClick={() => {
            if (onNavigateToFilteredTasks) {
              onNavigateToFilteredTasks({ dueDate: 'overdue' });
            } else {
              onNavigate('tasks');
            }
          }}
          className="p-3.5 bg-[#151619] border border-[#27292E] rounded-xl text-left hover:border-[#374151] hover:bg-[#1D1F23]/80 transition-all group"
        >
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-xs font-medium text-[#9CA3AF]">Overdue</span>
            <AlertCircle className="w-4 h-4 text-[#F87171]" />
          </div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums ${
              overdueTasks > 0 ? 'text-[#F87171]' : 'text-[#F3F4F6]'
            }`}
          >
            {overdueTasks}
          </div>
          <span className="text-[11px] text-[#6B7280] group-hover:text-[#F87171] flex items-center gap-1 mt-1 font-medium transition-colors">
            {overdueTasks > 0 ? 'Perlu perhatian' : 'Semua beres'} <ArrowRight className="w-3 h-3" />
          </span>
        </button>
      </div>

      {/* Main Two-Column Content: Today's Tasks & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Today's Tasks */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                Fokus Hari Ini
              </h2>
              <span className="text-xs text-[#6B7280] tabular-nums font-mono">
                ({todayTasks.length})
              </span>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-[#818CF8] hover:text-[#A5B4FC] font-medium flex items-center gap-1 transition-colors"
            >
              Semua tugas <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-[#151619] border border-[#27292E] rounded-xl divide-y divide-[#27292E] overflow-hidden">
            {todayTasks.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-7 h-7 text-[#34D399]/60 mx-auto mb-2" />
                <p className="text-xs font-medium text-[#F3F4F6]">Tidak ada tugas jatuh tempo hari ini</p>
                <p className="text-xs text-[#6B7280] mt-1 max-w-xs mx-auto">
                  Nikmati hari yang produktif atau rencanakan agenda tugas berikutnya.
                </p>
                <button
                  onClick={onOpenNewTaskModal}
                  className="mt-3.5 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#818CF8] hover:text-[#A5B4FC] bg-[#1D1F23] border border-[#27292E] rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Jadwalkan Tugas Hari Ini</span>
                </button>
              </div>
            ) : (
              todayTasks.map((t) => {
                const project = projects.find((p) => p.id === t.projectId);
                const isDone = t.status === 'done';

                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 p-3 hover:bg-[#1D1F23]/70 transition-colors group cursor-pointer"
                    onClick={() => onTaskClick(t)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTaskDone(t.id);
                        }}
                        className="text-[#6B7280] hover:text-[#818CF8] shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-[#34D399] fill-[#34D399]/20" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#6B7280] hover:text-[#818CF8]" />
                        )}
                      </button>

                      <span
                        className={`text-xs font-medium truncate ${
                          isDone ? 'line-through text-[#6B7280]' : 'text-[#F3F4F6]'
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs shrink-0 text-[#6B7280]">
                      {project && (
                        <div className="flex items-center gap-1 max-w-[120px] truncate">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="truncate text-[#9CA3AF] text-[11px]">{project.name}</span>
                        </div>
                      )}
                      <span className="capitalize text-[11px]">· {t.priority}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Tenggat Waktu Mendatang
            </h2>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs text-[#818CF8] hover:text-[#A5B4FC] font-medium flex items-center gap-1 transition-colors"
            >
              Kalender <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-[#151619] border border-[#27292E] rounded-xl divide-y divide-[#27292E] overflow-hidden">
            {upcomingTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#6B7280]">
                Tidak ada tenggat waktu dalam 7 hari ke depan.
              </div>
            ) : (
              upcomingTasks.map((t) => {
                const project = projects.find((p) => p.id === t.projectId);
                const rel = formatRelativeDueDate(t.dueDate, t.status);

                return (
                  <div
                    key={t.id}
                    onClick={() => onTaskClick(t)}
                    className="p-3 hover:bg-[#1D1F23]/70 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-[#F3F4F6] truncate flex-1">
                        {t.title}
                      </span>
                      <span className="font-mono tabular-nums text-[#9CA3AF] text-[11px] shrink-0">
                        {rel.label}
                      </span>
                    </div>
                    {project && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6B7280]">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="truncate">{project.name}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Project Progress Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Progres Proyek Aktif
            </h2>
            <p className="text-xs text-[#6B7280]">
              Tingkat penyelesaian target dan proyek berjalan.
            </p>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs text-[#818CF8] hover:text-[#A5B4FC] font-medium flex items-center gap-1 transition-colors"
          >
            Semua proyek <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {activeProjects.length === 0 ? (
          <div className="bg-[#151619] border border-[#27292E] rounded-xl p-8 text-center">
            <Folder className="w-7 h-7 text-[#6B7280] mx-auto mb-2" />
            <p className="text-xs font-medium text-[#F3F4F6]">Belum ada proyek aktif</p>
            <p className="text-xs text-[#6B7280] mt-1">
              Buat proyek untuk mengelompokkan tugas, memantau tenggat, dan melihat progres.
            </p>
            <button
              onClick={onOpenNewProjectModal}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0A0A0B] bg-[#818CF8] hover:bg-[#A5B4FC] rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Proyek</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeProjects.map((p) => {
              const { total, completed, percentage } = calculateProjectProgress(p.id, tasks);

              return (
                <div
                  key={p.id}
                  onClick={() => onNavigate('project-detail', p.id)}
                  className="p-3.5 bg-[#151619] border border-[#27292E] hover:border-[#374151] rounded-xl cursor-pointer transition-all hover:bg-[#1D1F23]/60 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <h3 className="text-xs font-semibold text-[#F3F4F6] truncate group-hover:text-[#818CF8] transition-colors">
                        {p.name}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-medium tabular-nums text-[#9CA3AF]">
                      {percentage}%
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] text-[#6B7280] line-clamp-2 min-h-[30px] leading-relaxed">
                    {p.description || 'No description provided.'}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-[#0A0A0B] rounded-full h-1 overflow-hidden border border-[#27292E]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: p.color,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#6B7280] font-mono tabular-nums">
                    <span>
                      {completed} of {total} completed
                    </span>
                    {p.dueDate && <span>Due {formatShortDate(p.dueDate)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
