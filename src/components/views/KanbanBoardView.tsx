import React, { useState } from 'react';
import { Project, Task, TaskStatus, TaskPriority } from '../../types';
import {
  formatRelativeDueDate,
  isDateOverdue,
} from '../../utils/dateUtils';
import {
  Plus,
} from 'lucide-react';

interface KanbanBoardViewProps {
  tasks: Task[];
  projects: Project[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onOpenNewTaskModal: (defaultProjectId?: string | null, defaultStatus?: TaskStatus) => void;
}

const COLUMNS: { id: TaskStatus; label: string; dotColor: string }[] = [
  { id: 'backlog', label: 'Backlog', dotColor: 'bg-[#6B7280]' },
  { id: 'todo', label: 'To Do', dotColor: 'bg-[#818CF8]' },
  { id: 'in_progress', label: 'In Progress', dotColor: 'bg-[#FBBF24]' },
  { id: 'done', label: 'Done', dotColor: 'bg-[#34D399]' },
];

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  tasks,
  projects,
  onTaskClick,
  onStatusChange,
  onOpenNewTaskModal,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedProjectId !== 'all') {
      if (selectedProjectId === 'unassigned') {
        if (t.projectId !== null) return false;
      } else {
        if (t.projectId !== selectedProjectId) return false;
      }
    }
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) {
      return false;
    }
    return true;
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onStatusChange(taskId, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'text-[#F87171] border-[#F87171]/30 bg-[#F87171]/10';
      case 'high':
        return 'text-[#FBBF24] border-[#FBBF24]/30 bg-[#FBBF24]/10';
      case 'medium':
        return 'text-[#818CF8] border-[#818CF8]/30 bg-[#818CF8]/10';
      case 'low':
        return 'text-[#6B7280] border-[#6B7280]/30 bg-[#6B7280]/10';
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto flex flex-col h-[calc(100vh-6.5rem)] text-[#F3F4F6]">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 pb-3 border-b border-[#27292E]">
        <div>
          <h1 className="text-xl font-bold text-[#F3F4F6] tracking-tight">Kanban Board</h1>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Visualize flow, drag tasks across execution stages, or use quick status selectors.
          </p>
        </div>

        {/* Filter selectors */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 bg-[#151619] border border-[#27292E] rounded-lg px-2.5 py-1.5">
            <span className="text-[11px] text-[#6B7280]">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-[#F3F4F6] text-xs focus:outline-none"
            >
              <option value="all" className="bg-[#151619]">All Projects</option>
              <option value="unassigned" className="bg-[#151619]">Personal (No Project)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#151619]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#151619] border border-[#27292E] rounded-lg px-2.5 py-1.5">
            <span className="text-[11px] text-[#6B7280]">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | 'all')}
              className="bg-transparent text-[#F3F4F6] text-xs focus:outline-none"
            >
              <option value="all" className="bg-[#151619]">All Priorities</option>
              <option value="urgent" className="bg-[#151619]">Urgent</option>
              <option value="high" className="bg-[#151619]">High</option>
              <option value="medium" className="bg-[#151619]">Medium</option>
              <option value="low" className="bg-[#151619]">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4 Columns Board Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 flex-1 min-h-0 items-start overflow-x-auto pb-4">
        {COLUMNS.map((column) => {
          const colTasks = filteredTasks.filter((t) => t.status === column.id);
          const isOver = dragOverCol === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col bg-[#0F1012] border rounded-xl p-3 h-full max-h-[calc(100vh-11.5rem)] transition-colors ${
                isOver
                  ? 'border-[#818CF8] bg-[#151619]'
                  : 'border-[#27292E]'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#27292E] shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                  <span className="text-xs font-semibold text-[#9CA3AF] tracking-tight">
                    {column.label}
                  </span>
                  <span className="text-[11px] font-mono text-[#6B7280] tabular-nums">
                    {colTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpenNewTaskModal(
                      selectedProjectId !== 'all' && selectedProjectId !== 'unassigned'
                        ? selectedProjectId
                        : null,
                      column.id
                    )
                  }
                  className="p-1 text-[#6B7280] hover:text-[#F3F4F6] hover:bg-[#1D1F23] rounded transition-colors"
                  title={`Add task to ${column.label}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks List within Column */}
              <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                {colTasks.length === 0 ? (
                  <div
                    className={`h-24 border border-dashed rounded-lg flex items-center justify-center text-xs text-[#6B7280] italic transition-colors ${
                      isOver ? 'border-[#818CF8] bg-[#151619]' : 'border-[#27292E]/70'
                    }`}
                  >
                    Drop tasks here
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const project = projects.find((p) => p.id === task.projectId);
                    const isOverdue = isDateOverdue(task.dueDate, task.status);
                    const relativeDate = formatRelativeDueDate(task.dueDate, task.status);
                    const isBeingDragged = draggedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onTaskClick(task)}
                        className={`bg-[#151619] border rounded-lg p-3 hover:border-[#374151] hover:bg-[#1D1F23]/80 transition-all cursor-grab active:cursor-grabbing group ${
                          isBeingDragged
                            ? 'opacity-30 border-dashed border-[#818CF8]'
                            : 'border-[#27292E]'
                        }`}
                      >
                        {/* Title */}
                        <h4 className="text-xs font-medium text-[#F3F4F6] group-hover:text-[#818CF8] transition-colors leading-snug">
                          {task.title}
                        </h4>

                        {/* Description excerpt */}
                        {task.description && (
                          <p className="mt-1 text-[11px] text-[#9CA3AF] line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Card Metadata */}
                        <div className="mt-3 pt-2 border-t border-[#27292E] flex items-center justify-between text-[11px] text-[#6B7280]">
                          {/* Left: Project & Due Date */}
                          <div className="flex items-center gap-1.5 truncate">
                            {project ? (
                              <div className="flex items-center gap-1 truncate max-w-[90px]">
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: project.color }}
                                />
                                <span className="truncate text-[#9CA3AF] text-[10px]">{project.name}</span>
                              </div>
                            ) : (
                              <span className="text-[#6B7280] text-[10px] italic">Personal</span>
                            )}

                            {task.dueDate && (
                              <span
                                className={`tabular-nums font-mono text-[10px] ${
                                  isOverdue
                                    ? 'text-[#F87171] font-semibold'
                                    : relativeDate.tone === 'today'
                                    ? 'text-[#FBBF24] font-medium'
                                    : 'text-[#6B7280]'
                                }`}
                              >
                                · {relativeDate.label}
                              </span>
                            )}
                          </div>

                          {/* Right: Accessible Status Move & Priority */}
                          <div
                            className="flex items-center gap-1.5 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-semibold tracking-wider border ${getPriorityStyle(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>

                            {/* Accessible Column Selector */}
                            <select
                              value={task.status}
                              onChange={(e) =>
                                onStatusChange(task.id, e.target.value as TaskStatus)
                              }
                              className="text-[10px] bg-[#0A0A0B] border border-[#27292E] rounded px-1 py-0.5 text-[#9CA3AF] focus:outline-none"
                              title="Move to stage"
                            >
                              <option value="backlog" className="bg-[#151619]">Backlog</option>
                              <option value="todo" className="bg-[#151619]">To Do</option>
                              <option value="in_progress" className="bg-[#151619]">In Progress</option>
                              <option value="done" className="bg-[#151619]">Done</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Quick Add Action */}
              <button
                type="button"
                onClick={() =>
                  onOpenNewTaskModal(
                    selectedProjectId !== 'all' && selectedProjectId !== 'unassigned'
                      ? selectedProjectId
                      : null,
                    column.id
                  )
                }
                className="mt-2 py-1 px-2 w-full text-center text-xs font-medium text-[#6B7280] hover:text-[#F3F4F6] hover:bg-[#1D1F23] rounded-lg transition-colors flex items-center justify-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add task</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
