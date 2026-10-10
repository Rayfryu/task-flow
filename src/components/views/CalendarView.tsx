import React, { useState, useMemo } from 'react';
import { Project, Task } from '../../types';
import { getTodayString, isDateOverdue, formatDisplayDate } from '../../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  onTaskClick: (task: Task) => void;
  onOpenNewTaskModal: (defaultProjectId?: string | null, defaultStatus?: any, defaultDueDate?: string | null) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  projects,
  onTaskClick,
  onOpenNewTaskModal,
}) => {
  const todayStr = getTodayString();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(getTodayString());
  };

  const monthName = currentDate.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayIndex = firstDayOfMonth.getDay();
    const startOffset = (startingDayIndex + 6) % 7;

    const daysInMonth = lastDayOfMonth.getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, pDay);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const d = String(pDay).padStart(2, '0');
      days.push({
        dateStr: `${y}-${m}-${d}`,
        dayNumber: pDay,
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      const y = year;
      const m = String(month + 1).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      days.push({
        dateStr: `${y}-${m}-${d}`,
        dayNumber: day,
        isCurrentMonth: true,
      });
    }

    // Next month padding
    const remaining = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const nextDate = new Date(year, month + 1, day);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      days.push({
        dateStr: `${y}-${m}-${d}`,
        dayNumber: day,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((t) => {
      if (t.dueDate) {
        const list = map.get(t.dueDate) || [];
        list.push(t);
        map.set(t.dueDate, list);
      }
    });
    return map;
  }, [tasks]);

  const selectedDateTasks = selectedDateStr ? tasksByDate.get(selectedDateStr) || [] : [];
  const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-4 max-w-5xl mx-auto text-[#F3F4F6]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27292E]">
        <div>
          <h1 className="text-xl font-bold text-[#F3F4F6] tracking-tight">Calendar</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            View deadlines and scheduled commitments across your monthly timeline.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-medium text-[#F3F4F6] bg-[#151619] border border-[#27292E] hover:bg-[#1D1F23] rounded-lg transition-colors"
          >
            Today
          </button>

          <div className="flex items-center gap-1 bg-[#151619] border border-[#27292E] rounded-lg p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-[#6B7280] hover:text-[#F3F4F6] hover:bg-[#1D1F23] rounded transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-[#F3F4F6] px-2 min-w-[120px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-[#6B7280] hover:text-[#F3F4F6] hover:bg-[#1D1F23] rounded transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid + Selected Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Calendar Grid (3 columns on desktop) */}
        <div className="lg:col-span-3 bg-[#151619] border border-[#27292E] rounded-xl overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-[#27292E] bg-[#0F1012] text-center py-2">
            {weekDayNames.map((name) => (
              <span
                key={name}
                className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider"
              >
                {name}
              </span>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#27292E]">
            {calendarDays.map((cell) => {
              const dayTasks = tasksByDate.get(cell.dateStr) || [];
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedDateStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[88px] p-1.5 transition-colors cursor-pointer flex flex-col justify-between group ${
                    !cell.isCurrentMonth
                      ? 'bg-[#0A0A0B]/40 text-[#6B7280]'
                      : isSelected
                      ? 'bg-[#1D1F23] ring-1 ring-[#818CF8] inset-0 z-10'
                      : 'hover:bg-[#1D1F23]/50'
                  }`}
                >
                  {/* Top: Day Number and Task Count Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-medium inline-flex items-center justify-center w-5 h-5 rounded-full ${
                        isToday
                          ? 'bg-[#818CF8] text-[#0A0A0B] font-bold'
                          : cell.isCurrentMonth
                          ? 'text-[#F3F4F6]'
                          : 'text-[#6B7280]'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-mono tabular-nums text-[#6B7280]">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Tasks on this day */}
                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => {
                      const isDone = t.status === 'done';
                      const isOverdue = isDateOverdue(t.dueDate, t.status);
                      const project = projects.find((p) => p.id === t.projectId);

                      return (
                        <div
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskClick(t);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] truncate leading-tight flex items-center gap-1 border ${
                            isDone
                              ? 'bg-[#1D1F23] border-[#27292E] text-[#6B7280] line-through'
                              : isOverdue
                              ? 'bg-[#F87171]/10 border-[#F87171]/25 text-[#F87171]'
                              : 'bg-[#818CF8]/10 border-[#818CF8]/25 text-[#818CF8]'
                          }`}
                        >
                          {project && (
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: project.color }}
                            />
                          )}
                          <span className="truncate">{t.title}</span>
                        </div>
                      );
                    })}

                    {dayTasks.length > 2 && (
                      <span className="text-[10px] text-[#6B7280] font-mono block pl-1">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector Side-Panel */}
        <div className="bg-[#151619] border border-[#27292E] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#27292E]">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#6B7280] block">
                Selected Day
              </span>
              <h3 className="text-xs font-semibold text-[#F3F4F6] mt-0.5">
                {formatDisplayDate(selectedDateStr)}
              </h3>
            </div>

            <button
              onClick={() => onOpenNewTaskModal(null, 'todo', selectedDateStr)}
              className="p-1.5 text-[#818CF8] hover:bg-[#1D1F23] rounded-lg transition-colors"
              title="Add task on this date"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="space-y-2">
            {selectedDateTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6B7280]">
                <CalendarIcon className="w-5 h-5 text-[#6B7280] mx-auto mb-2" />
                <span>No tasks scheduled.</span>
                <button
                  onClick={() => onOpenNewTaskModal(null, 'todo', selectedDateStr)}
                  className="mt-2.5 block mx-auto text-xs font-medium text-[#818CF8] hover:underline"
                >
                  + Add task for this day
                </button>
              </div>
            ) : (
              selectedDateTasks.map((t) => {
                const project = projects.find((p) => p.id === t.projectId);
                const isDone = t.status === 'done';

                return (
                  <div
                    key={t.id}
                    onClick={() => onTaskClick(t)}
                    className="p-2.5 rounded-lg border border-[#27292E] bg-[#0A0A0B] hover:border-[#374151] hover:bg-[#1D1F23]/60 cursor-pointer transition-all space-y-1.5 group"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium truncate flex-1 ${
                          isDone ? 'line-through text-[#6B7280]' : 'text-[#F3F4F6] group-hover:text-[#818CF8]'
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1 border-t border-[#27292E]">
                      {project ? (
                        <div className="flex items-center gap-1 truncate max-w-[120px]">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="truncate text-[#9CA3AF] text-[10px]">{project.name}</span>
                        </div>
                      ) : (
                        <span className="text-[10px]">Personal</span>
                      )}

                      <span className="capitalize text-[10px]">{t.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
