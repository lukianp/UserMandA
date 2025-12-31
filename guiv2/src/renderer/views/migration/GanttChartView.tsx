/**
 * GanttChartView Component
 *
 * Interactive Gantt chart visualization for migration project management.
 * Displays project timeline, waves, tasks with progress, dependencies,
 * and critical path highlighting.
 *
 * Epic 0: Migration Control Plane - Phase 3: Gantt Chart
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
  AlertTriangle,
  Users,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Download,
  ChevronLeft,
  Layers,
  Target,
  ArrowRight,
} from 'lucide-react';

import { useMigrationStore } from '../../store/useMigrationStore';
import type { GanttTask } from '../../types/models/migration';

// Time scale options
type TimeScale = 'day' | 'week' | 'month';

// Calculate the difference in days between two dates
const daysDiff = (start: Date, end: Date): number => {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

// Parse date string or Date to Date object
const parseDate = (date: Date | string): Date => {
  if (date instanceof Date) return date;
  return new Date(date);
};

// Format date for display
const formatDate = (date: Date | string): string => {
  const d = parseDate(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Get color for task type
const getTaskColor = (task: GanttTask): string => {
  if (task.color) return task.color;
  if (task.isCriticalPath) return 'bg-red-500';
  switch (task.type) {
    case 'project':
      return 'bg-blue-600';
    case 'milestone':
      return 'bg-purple-500';
    default:
      return 'bg-emerald-500';
  }
};

// Get progress color based on percentage
const getProgressColor = (progress: number): string => {
  if (progress >= 100) return 'bg-green-400';
  if (progress >= 75) return 'bg-emerald-400';
  if (progress >= 50) return 'bg-yellow-400';
  if (progress >= 25) return 'bg-orange-400';
  return 'bg-gray-400';
};

/**
 * GanttChartView - Main component
 */
export const GanttChartView: React.FC = () => {
  const {
    ganttTasks,
    selectedProject,
    selectedProjectId,
    projects,
    isLoading,
    loadGanttTasks,
    updateGanttTask,
    rescheduleGanttTask,
    selectProject,
  } = useMigrationStore();

  // State
  const [timeScale, setTimeScale] = useState<TimeScale>('week');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCriticalPathOnly, setShowCriticalPathOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Load Gantt tasks when project changes
  useEffect(() => {
    if (selectedProjectId) {
      loadGanttTasks(selectedProjectId);
    }
  }, [selectedProjectId, loadGanttTasks]);

  // Calculate timeline boundaries
  const { startDate, endDate, totalDays } = useMemo(() => {
    if (ganttTasks.length === 0) {
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + 3);
      return { startDate: now, endDate: end, totalDays: 90 };
    }

    let minDate = new Date(parseDate(ganttTasks[0].start));
    let maxDate = new Date(parseDate(ganttTasks[0].end));

    ganttTasks.forEach((task) => {
      const taskStart = parseDate(task.start);
      const taskEnd = parseDate(task.end);
      if (taskStart < minDate) minDate = new Date(taskStart);
      if (taskEnd > maxDate) maxDate = new Date(taskEnd);
    });

    // Add padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    return {
      startDate: minDate,
      endDate: maxDate,
      totalDays: daysDiff(minDate, maxDate),
    };
  }, [ganttTasks]);

  // Generate timeline markers based on scale
  const timelineMarkers = useMemo(() => {
    const markers: { date: Date; label: string; isWeekend: boolean }[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;

      if (timeScale === 'day') {
        markers.push({
          date: new Date(current),
          label: formatDate(current),
          isWeekend,
        });
        current.setDate(current.getDate() + 1);
      } else if (timeScale === 'week') {
        if (current.getDay() === 1 || markers.length === 0) {
          markers.push({
            date: new Date(current),
            label: formatDate(current),
            isWeekend: false,
          });
        }
        current.setDate(current.getDate() + 1);
      } else {
        if (current.getDate() === 1 || markers.length === 0) {
          markers.push({
            date: new Date(current),
            label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            isWeekend: false,
          });
        }
        current.setDate(current.getDate() + 1);
      }
    }

    return markers;
  }, [startDate, endDate, timeScale]);

  // Filter and organize tasks
  const visibleTasks = useMemo(() => {
    let tasks = [...ganttTasks];

    // Filter critical path only
    if (showCriticalPathOnly) {
      tasks = tasks.filter((t) => t.isCriticalPath || t.type === 'project');
    }

    // Sort by start date and hierarchy
    tasks.sort((a, b) => {
      // Projects first
      if (a.type === 'project' && b.type !== 'project') return -1;
      if (b.type === 'project' && a.type !== 'project') return 1;

      // Then by parent
      if (a.parentId && !b.parentId) return 1;
      if (b.parentId && !a.parentId) return -1;

      // Then by start date
      return parseDate(a.start).getTime() - parseDate(b.start).getTime();
    });

    // Filter out collapsed children
    return tasks.filter((task) => {
      if (!task.parentId) return true;
      return expandedTasks.has(task.parentId);
    });
  }, [ganttTasks, showCriticalPathOnly, expandedTasks]);

  // Calculate task position and width
  const getTaskPosition = useCallback(
    (task: GanttTask) => {
      const taskStart = parseDate(task.start);
      const taskEnd = parseDate(task.end);
      const offsetDays = daysDiff(startDate, taskStart);
      const durationDays = Math.max(1, daysDiff(taskStart, taskEnd));

      const left = (offsetDays / totalDays) * 100;
      const width = (durationDays / totalDays) * 100;

      return { left: `${Math.max(0, left)}%`, width: `${Math.min(100 - left, width)}%` };
    },
    [startDate, totalDays]
  );

  // Toggle task expansion
  const toggleExpand = useCallback((taskId: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!selectedProjectId) return;
    setIsRefreshing(true);
    await loadGanttTasks(selectedProjectId);
    setTimeout(() => setIsRefreshing(false), 500);
  }, [selectedProjectId, loadGanttTasks]);

  // Get task dependencies (for drawing lines)
  const getDependencyLines = useCallback(() => {
    const lines: { from: GanttTask; to: GanttTask }[] = [];

    visibleTasks.forEach((task) => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((depId) => {
          const depTask = visibleTasks.find((t) => t.id === depId);
          if (depTask) {
            lines.push({ from: depTask, to: task });
          }
        });
      }
    });

    return lines;
  }, [visibleTasks]);

  // Check if task has children
  const hasChildren = useCallback(
    (taskId: string) => {
      return ganttTasks.some((t) => t.parentId === taskId);
    },
    [ganttTasks]
  );

  // Get task depth (for indentation)
  const getTaskDepth = useCallback(
    (task: GanttTask): number => {
      if (!task.parentId) return 0;
      const parent = ganttTasks.find((t) => t.id === task.parentId);
      return parent ? 1 + getTaskDepth(parent) : 1;
    },
    [ganttTasks]
  );

  // Render task row
  const renderTaskRow = (task: GanttTask, index: number) => {
    const depth = getTaskDepth(task);
    const hasChildTasks = hasChildren(task.id);
    const isExpanded = expandedTasks.has(task.id);
    const isSelected = selectedTaskId === task.id;
    const isHovered = hoveredTaskId === task.id;
    const position = getTaskPosition(task);

    return (
      <div
        key={task.id}
        className={clsx(
          'flex border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors',
          isSelected && 'bg-blue-900/20',
          isHovered && 'bg-gray-800/30'
        )}
        onMouseEnter={() => setHoveredTaskId(task.id)}
        onMouseLeave={() => setHoveredTaskId(null)}
        onClick={() => setSelectedTaskId(task.id)}
      >
        {/* Task Name Column */}
        <div
          className="w-72 min-w-72 flex items-center px-2 py-2 border-r border-gray-700/50"
          style={{ paddingLeft: `${8 + depth * 20}px` }}
        >
          {hasChildTasks ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(task.id);
              }}
              className="p-0.5 hover:bg-gray-700 rounded mr-1"
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-gray-400" />
              ) : (
                <ChevronRight size={14} className="text-gray-400" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}

          {/* Task type icon */}
          {task.type === 'project' && <Layers size={14} className="text-blue-400 mr-1.5" />}
          {task.type === 'milestone' && <Target size={14} className="text-purple-400 mr-1.5" />}
          {task.type === 'task' && <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-2" />}

          <span
            className={clsx(
              'text-sm truncate',
              task.type === 'project' && 'font-semibold text-white',
              task.type === 'milestone' && 'font-medium text-purple-300',
              task.type === 'task' && 'text-gray-300',
              task.isCriticalPath && 'text-red-400'
            )}
            title={task.name}
          >
            {task.name}
          </span>

          {task.isCriticalPath && (
            <AlertTriangle size={12} className="text-red-400 ml-1.5 flex-shrink-0" />
          )}
        </div>

        {/* Progress Column */}
        <div className="w-20 min-w-20 flex items-center justify-center px-2 border-r border-gray-700/50">
          <div className="w-full">
            <div className="text-xs text-center text-gray-400 mb-0.5">{task.progress}%</div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={clsx('h-full rounded-full transition-all', getProgressColor(task.progress))}
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Start Date Column */}
        <div className="w-24 min-w-24 flex items-center justify-center px-2 border-r border-gray-700/50 text-xs text-gray-400">
          {formatDate(task.start)}
        </div>

        {/* End Date Column */}
        <div className="w-24 min-w-24 flex items-center justify-center px-2 border-r border-gray-700/50 text-xs text-gray-400">
          {formatDate(task.end)}
        </div>

        {/* Gantt Bar Area */}
        <div className="flex-1 relative h-10">
          {/* Task bar */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-6 rounded group cursor-pointer"
            style={{
              left: position.left,
              width: position.width,
              minWidth: '8px',
            }}
          >
            {/* Background bar */}
            <div
              className={clsx(
                'absolute inset-0 rounded opacity-30',
                getTaskColor(task)
              )}
            />

            {/* Progress fill */}
            <div
              className={clsx('absolute top-0 left-0 h-full rounded', getTaskColor(task))}
              style={{ width: `${task.progress}%` }}
            />

            {/* Task label on bar */}
            <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
              <span className="text-xs text-white truncate font-medium drop-shadow">
                {task.type === 'milestone' ? '◆' : task.name}
              </span>
            </div>

            {/* Hover tooltip */}
            <div
              className={clsx(
                'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded shadow-lg z-10',
                'opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap'
              )}
            >
              <div className="text-xs font-medium text-white">{task.name}</div>
              <div className="text-xs text-gray-400">
                {formatDate(task.start)} - {formatDate(task.end)}
              </div>
              <div className="text-xs text-gray-400">Progress: {task.progress}%</div>
              {task.assignedTo && (
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Users size={10} /> {task.assignedTo}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render today marker
  const renderTodayMarker = () => {
    const today = new Date();
    if (today < startDate || today > endDate) return null;

    const position = (daysDiff(startDate, today) / totalDays) * 100;

    return (
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
        style={{ left: `${position}%` }}
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-1 py-0.5 bg-red-500 rounded text-xs text-white whitespace-nowrap">
          Today
        </div>
      </div>
    );
  };

  if (!selectedProject && projects.length > 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Select a Project</h2>
          <p className="text-gray-400 mb-4">Choose a migration project to view its Gantt chart</p>
          <select
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            onChange={(e) => selectProject(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Select project...
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Projects Found</h2>
          <p className="text-gray-400">Create a migration project to get started with the Gantt chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar size={24} className="text-blue-400" />
            Gantt Chart
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {selectedProject.name} - Project Timeline
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Time Scale */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            {(['day', 'week', 'month'] as TimeScale[]).map((scale) => (
              <button
                key={scale}
                onClick={() => setTimeScale(scale)}
                className={clsx(
                  'px-3 py-1 text-sm rounded capitalize transition-colors',
                  timeScale === scale
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                )}
              >
                {scale}
              </button>
            ))}
          </div>

          {/* Critical Path Toggle */}
          <button
            onClick={() => setShowCriticalPathOnly(!showCriticalPathOnly)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
              showCriticalPathOnly
                ? 'bg-red-600/20 text-red-400 border border-red-600/50'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            )}
            title="Show critical path only"
          >
            <AlertTriangle size={16} />
            <span className="text-sm">Critical Path</span>
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={clsx(isRefreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="flex bg-gray-800/50 border-b border-gray-700">
          <div className="w-72 min-w-72 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-r border-gray-700/50">
            Task Name
          </div>
          <div className="w-20 min-w-20 px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center border-r border-gray-700/50">
            Progress
          </div>
          <div className="w-24 min-w-24 px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center border-r border-gray-700/50">
            Start
          </div>
          <div className="w-24 min-w-24 px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center border-r border-gray-700/50">
            End
          </div>
          <div className="flex-1 relative overflow-hidden">
            {/* Timeline header */}
            <div className="flex h-full">
              {timelineMarkers.map((marker, i) => (
                <div
                  key={i}
                  className={clsx(
                    'flex-shrink-0 px-1 py-2 text-xs text-center border-r border-gray-700/30',
                    marker.isWeekend && 'bg-gray-800/30'
                  )}
                  style={{
                    width: `${100 / timelineMarkers.length}%`,
                    minWidth: timeScale === 'day' ? '40px' : timeScale === 'week' ? '80px' : '100px',
                  }}
                >
                  <span className="text-gray-400">{marker.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div ref={chartRef} className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw size={32} className="animate-spin text-blue-400" />
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                <p>No tasks to display</p>
                <p className="text-sm mt-1">Add waves and tasks to your project to see the timeline</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Task rows */}
              {visibleTasks.map((task, index) => renderTaskRow(task, index))}

              {/* Today marker overlay */}
              <div className="absolute top-0 left-[440px] right-0 bottom-0 pointer-events-none overflow-hidden">
                {renderTodayMarker()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 px-6 py-3 bg-gray-800/50 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 bg-blue-600 rounded" />
          <span className="text-xs text-gray-400">Project</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 bg-emerald-500 rounded" />
          <span className="text-xs text-gray-400">Task</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 bg-purple-500 rounded" />
          <span className="text-xs text-gray-400">Milestone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 bg-red-500 rounded" />
          <span className="text-xs text-gray-400">Critical Path</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Clock size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400">
            {formatDate(startDate)} - {formatDate(endDate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GanttChartView;


