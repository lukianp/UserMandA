using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Gantt Chart view with critical path calculation
    /// </summary>
    public class GanttViewModel : BaseViewModel
    {
        private MigrationProject _project;
        private ObservableCollection<MigrationProjectTask> _flattenedTasks;
        private DateTime _timelineStart;
        private DateTime _timelineEnd;
        private List<MigrationProjectTask> _criticalPath;

        public GanttViewModel(MigrationProject project)
        {
            // Initialize collections BEFORE setting Project to avoid null reference in UpdateGantt
            FlattenedTasks = new ObservableCollection<MigrationProjectTask>();
            _criticalPath = new List<MigrationProjectTask>();
            
            // Setting Project will trigger UpdateGantt() via the setter
            Project = project;
        }

        #region Properties

        public MigrationProject Project
        {
            get => _project;
            set
            {
                if (SetProperty(ref _project, value))
                {
                    UpdateGantt();
                }
            }
        }

        public ObservableCollection<MigrationProjectTask> FlattenedTasks
        {
            get => _flattenedTasks;
            set => SetProperty(ref _flattenedTasks, value);
        }

        public DateTime TimelineStart
        {
            get => _timelineStart;
            set => SetProperty(ref _timelineStart, value);
        }

        public DateTime TimelineEnd
        {
            get => _timelineEnd;
            set => SetProperty(ref _timelineEnd, value);
        }

        public int TimelineDays => (TimelineEnd - TimelineStart).Days;

        #endregion

        #region Methods

        /// <summary>
        /// Updates the Gantt chart data
        /// </summary>
        public void UpdateGantt()
        {
            if (FlattenedTasks == null) return;

            // Clear existing tasks
            FlattenedTasks.Clear();
            var allTasks = new List<MigrationProjectTask>();

            // First try to load from CSV test data
            try
            {
                var csvPath = System.IO.Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "TestData", "GanttTasks.csv");
                if (System.IO.File.Exists(csvPath))
                {
                    allTasks = LoadTasksFromCsv(csvPath);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load CSV tasks: {ex.Message}");
            }

            // Fallback to project phases if CSV loading failed or no tasks found
            if (allTasks.Count == 0 && Project?.Phases != null)
            {
                foreach (var phase in Project.Phases)
                {
                    if (phase.Tasks != null)
                    {
                        allTasks.AddRange(phase.Tasks);
                    }
                }
            }

            // If still no tasks, use empty list - UI will show empty state
            // No sample data fallback needed

            // Calculate timeline bounds
            if (allTasks.Any())
            {
                TimelineStart = allTasks.Min(t => t.StartDate).Date;
                TimelineEnd = allTasks.Max(t => t.EndDate).Date.AddDays(1);
            }
            else
            {
                TimelineStart = DateTime.Today;
                TimelineEnd = DateTime.Today.AddDays(30);
            }

            // Calculate critical path
            CalculateCriticalPath();

            // Add tasks to observable collection and calculate positions
            var rowHeight = 32; // Height of each task row
            var currentRow = 0;
            
            foreach (var task in allTasks.OrderBy(t => t.StartDate))
            {
                // Calculate visual properties for Gantt chart
                CalculateTaskVisualProperties(task, currentRow, rowHeight);
                FlattenedTasks.Add(task);
                currentRow++;
            }
        }

        /// <summary>
        /// Loads tasks from CSV file
        /// </summary>
        private List<MigrationProjectTask> LoadTasksFromCsv(string csvPath)
        {
            var tasks = new List<MigrationProjectTask>();
            
            try
            {
                var lines = System.IO.File.ReadAllLines(csvPath);
                if (lines.Length <= 1) return tasks; // No data rows

                for (int i = 1; i < lines.Length; i++) // Skip header
                {
                    var fields = ParseCsvLine(lines[i]);
                    if (fields.Length >= 11)
                    {
                        var task = new MigrationProjectTask
                        {
                            Id = int.TryParse(fields[0], out int id) ? id : i,
                            Name = fields[1],
                            Description = fields[2],
                            Owner = fields[3],
                            StartDate = DateTime.TryParse(fields[4], out DateTime start) ? start : DateTime.Today,
                            EndDate = DateTime.TryParse(fields[5], out DateTime end) ? end : DateTime.Today.AddDays(1),
                            Status = Enum.TryParse<MigrationProjectTaskStatus>(fields[6].Replace(" ", ""), out var status) ? status : MigrationProjectTaskStatus.NotStarted,
                            Progress = double.TryParse(fields[7], out double progress) ? progress : 0,
                            IsCriticalPath = bool.TryParse(fields[8], out bool critical) ? critical : false
                        };

                        // Parse dependencies
                        if (fields.Length > 9 && !string.IsNullOrEmpty(fields[9]))
                        {
                            var deps = fields[9].Split(',');
                            foreach (var dep in deps)
                            {
                                if (int.TryParse(dep.Trim(), out int depId))
                                {
                                    task.Dependencies.Add(depId);
                                }
                            }
                        }

                        tasks.Add(task);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading CSV tasks: {ex.Message}");
            }

            return tasks;
        }

        /// <summary>
        /// Parses a CSV line handling quoted fields
        /// </summary>
        private string[] ParseCsvLine(string line)
        {
            var fields = new List<string>();
            var currentField = new System.Text.StringBuilder();
            bool inQuotes = false;

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];
                
                if (c == '"')
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    fields.Add(currentField.ToString());
                    currentField.Clear();
                }
                else
                {
                    currentField.Append(c);
                }
            }
            
            fields.Add(currentField.ToString());
            return fields.ToArray();
        }


        /// <summary>
        /// Calculates the critical path using network analysis
        /// </summary>
        public void CalculateCriticalPath()
        {
            if (FlattenedTasks == null || FlattenedTasks.Count == 0) return;

            try
            {
                // Reset critical path flags
                foreach (var task in FlattenedTasks)
                {
                    task.IsCriticalPath = false;
                }

                // Create a mapping of task IDs to tasks for quick lookup
                var taskMap = FlattenedTasks.ToDictionary(t => t.Id, t => t);

                // Calculate Early Start (ES) and Early Finish (EF) - Forward Pass
                var visited = new HashSet<int>();
                var earlyStart = new Dictionary<int, DateTime>();
                var earlyFinish = new Dictionary<int, DateTime>();

                foreach (var task in FlattenedTasks.OrderBy(t => t.StartDate))
                {
                    CalculateEarlyTimes(task, taskMap, earlyStart, earlyFinish, visited);
                }

                // Calculate Late Start (LS) and Late Finish (LF) - Backward Pass
                var lateStart = new Dictionary<int, DateTime>();
                var lateFinish = new Dictionary<int, DateTime>();
                
                // Initialize late finish times with project end date for tasks with no successors
                foreach (var task in FlattenedTasks)
                {
                    var hasSuccessors = FlattenedTasks.Any(t => t.Dependencies.Contains(task.Id));
                    if (!hasSuccessors)
                    {
                        lateFinish[task.Id] = earlyFinish[task.Id];
                    }
                }

                visited.Clear();
                foreach (var task in FlattenedTasks.OrderByDescending(t => t.EndDate))
                {
                    CalculateLateTimes(task, taskMap, lateStart, lateFinish, visited);
                }

                // Identify critical path tasks (ES = LS and EF = LF)
                _criticalPath.Clear();
                foreach (var task in FlattenedTasks)
                {
                    if (earlyStart.ContainsKey(task.Id) && lateStart.ContainsKey(task.Id))
                    {
                        var esEqualsLs = Math.Abs((earlyStart[task.Id] - lateStart[task.Id]).TotalDays) < 1;
                        var efEqualsLf = Math.Abs((earlyFinish[task.Id] - lateFinish[task.Id]).TotalDays) < 1;
                        
                        if (esEqualsLs && efEqualsLf)
                        {
                            task.IsCriticalPath = true;
                            _criticalPath.Add(task);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error but don't crash the application
                System.Diagnostics.Debug.WriteLine($"Error calculating critical path: {ex.Message}");
            }
        }

        private void CalculateEarlyTimes(MigrationProjectTask task, Dictionary<int, MigrationProjectTask> taskMap, 
            Dictionary<int, DateTime> earlyStart, Dictionary<int, DateTime> earlyFinish, HashSet<int> visited)
        {
            if (visited.Contains(task.Id)) return;
            visited.Add(task.Id);

            DateTime maxEarlyFinish = task.StartDate;

            // Calculate based on dependencies
            foreach (var depId in task.Dependencies)
            {
                if (taskMap.ContainsKey(depId))
                {
                    var dependency = taskMap[depId];
                    CalculateEarlyTimes(dependency, taskMap, earlyStart, earlyFinish, visited);
                    
                    if (earlyFinish.ContainsKey(depId))
                    {
                        maxEarlyFinish = new[] { maxEarlyFinish, earlyFinish[depId] }.Max();
                    }
                }
            }

            earlyStart[task.Id] = maxEarlyFinish;
            earlyFinish[task.Id] = maxEarlyFinish.Add(task.EndDate - task.StartDate);
        }

        private void CalculateLateTimes(MigrationProjectTask task, Dictionary<int, MigrationProjectTask> taskMap,
            Dictionary<int, DateTime> lateStart, Dictionary<int, DateTime> lateFinish, HashSet<int> visited)
        {
            if (visited.Contains(task.Id)) return;
            visited.Add(task.Id);

            // Find successors (tasks that depend on this task)
            var successors = FlattenedTasks.Where(t => t.Dependencies.Contains(task.Id)).ToList();

            DateTime minLateStart = lateFinish.ContainsKey(task.Id) ? lateFinish[task.Id] : task.EndDate;

            foreach (var successor in successors)
            {
                CalculateLateTimes(successor, taskMap, lateStart, lateFinish, visited);
                
                if (lateStart.ContainsKey(successor.Id))
                {
                    minLateStart = new[] { minLateStart, lateStart[successor.Id] }.Min();
                }
            }

            lateFinish[task.Id] = minLateStart;
            lateStart[task.Id] = minLateStart.Subtract(task.EndDate - task.StartDate);
        }

        /// <summary>
        /// Calculates visual properties for a task in the Gantt chart
        /// </summary>
        private void CalculateTaskVisualProperties(MigrationProjectTask task, int row, int rowHeight)
        {
            if (TimelineDays <= 0) return;

            // Calculate width based on task duration
            var taskDuration = (task.EndDate - task.StartDate).TotalDays;
            var timelineWidth = 2000; // Total canvas width
            task.Width = Math.Max(10, (taskDuration / TimelineDays) * timelineWidth);

            // Calculate left position based on start date offset
            var offsetDays = (task.StartDate - TimelineStart).TotalDays;
            task.LeftPosition = Math.Max(0, (offsetDays / TimelineDays) * timelineWidth);

            // Calculate top position based on row
            task.TopPosition = row * (rowHeight + 2) + 6; // 2px margin between rows, 6px top margin
        }

        /// <summary>
        /// Gets the width percentage for a task bar in the timeline
        /// </summary>
        public double GetTaskWidthPercentage(MigrationProjectTask task)
        {
            if (TimelineDays <= 0) return 0;
            
            var taskDuration = (task.EndDate - task.StartDate).TotalDays;
            return (taskDuration / TimelineDays) * 100;
        }

        /// <summary>
        /// Gets the left margin percentage for positioning a task bar
        /// </summary>
        public double GetTaskLeftPercentage(MigrationProjectTask task)
        {
            if (TimelineDays <= 0) return 0;
            
            var offsetDays = (task.StartDate - TimelineStart).TotalDays;
            return (offsetDays / TimelineDays) * 100;
        }

        /// <summary>
        /// Gets tasks that are on the critical path
        /// </summary>
        public IEnumerable<MigrationProjectTask> GetCriticalPathTasks()
        {
            return _criticalPath;
        }

        /// <summary>
        /// Gets the timeline header dates for display
        /// </summary>
        public IEnumerable<DateTime> GetTimelineHeaderDates()
        {
            var dates = new List<DateTime>();
            var current = TimelineStart;
            
            while (current <= TimelineEnd)
            {
                dates.Add(current);
                current = current.AddDays(7); // Weekly intervals
            }
            
            return dates;
        }

        /// <summary>
        /// Gets the phase that contains a specific task
        /// </summary>
        public string GetTaskPhase(MigrationProjectTask task)
        {
            if (Project?.Phases == null) return "Unknown";
            
            foreach (var phase in Project.Phases)
            {
                if (phase.Tasks?.Contains(task) == true)
                {
                    return phase.Name;
                }
            }
            
            return "Unknown";
        }

        #endregion
    }
}