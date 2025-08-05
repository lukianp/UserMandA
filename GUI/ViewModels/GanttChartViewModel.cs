using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Messages;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Gantt Chart functionality
    /// </summary>
    public class GanttChartViewModel : BaseViewModel
    {
        private readonly IDataService _dataService;
        private readonly IProfileService _profileService;
        
        private string _projectTitle = "M&A Integration Timeline";
        private string _projectDescription = "Migration and integration project timeline with dependencies and milestones";
        private DateTime _projectStartDate = DateTime.Today;
        private DateTime _projectEndDate = DateTime.Today.AddMonths(12);
        private string _selectedTimeScale = "Months";
        private bool _showCriticalPath = true;
        private bool _showDependencies = true;
        private bool _showMilestones = true;
        private bool _showTodayLine = true;
        private double _zoomLevel = 1.0;
        private double _dayWidth = 20.0;
        private GanttTask _selectedTask;
        private GanttMilestone _selectedMilestone;

        public GanttChartViewModel(
            ILogger<GanttChartViewModel> logger,
            IMessenger messenger,
            IDataService dataService,
            IProfileService profileService) : base(logger, messenger)
        {
            _dataService = dataService ?? throw new ArgumentNullException(nameof(dataService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));

            Tasks = new ObservableCollection<GanttTask>();
            TaskBars = new ObservableCollection<GanttTaskBar>();
            Milestones = new ObservableCollection<GanttMilestone>();
            Dependencies = new ObservableCollection<GanttDependency>();
            TimeGridLines = new ObservableCollection<TimeGridLine>();
            RowBackgrounds = new ObservableCollection<RowBackground>();

            TimeScaleOptions = new[] { "Days", "Weeks", "Months", "Quarters" };

            InitializeCommands();
            LoadSampleProject();
        }

        #region Properties

        public ObservableCollection<GanttTask> Tasks { get; }
        public ObservableCollection<GanttTaskBar> TaskBars { get; }
        public ObservableCollection<GanttMilestone> Milestones { get; }
        public ObservableCollection<GanttDependency> Dependencies { get; }
        public ObservableCollection<TimeGridLine> TimeGridLines { get; }
        public ObservableCollection<RowBackground> RowBackgrounds { get; }

        public string[] TimeScaleOptions { get; }

        public string ProjectTitle
        {
            get => _projectTitle;
            set => SetProperty(ref _projectTitle, value);
        }

        public string ProjectDescription
        {
            get => _projectDescription;
            set => SetProperty(ref _projectDescription, value);
        }

        public DateTime ProjectStartDate
        {
            get => _projectStartDate;
            set
            {
                if (SetProperty(ref _projectStartDate, value))
                {
                    OnPropertyChanged(nameof(ProjectDuration));
                    UpdateTimeline();
                }
            }
        }

        public DateTime ProjectEndDate
        {
            get => _projectEndDate;
            set
            {
                if (SetProperty(ref _projectEndDate, value))
                {
                    OnPropertyChanged(nameof(ProjectDuration));
                    UpdateTimeline();
                }
            }
        }

        public int ProjectDuration => (ProjectEndDate - ProjectStartDate).Days;

        public string SelectedTimeScale
        {
            get => _selectedTimeScale;
            set
            {
                if (SetProperty(ref _selectedTimeScale, value))
                {
                    UpdateTimeline();
                }
            }
        }

        public bool ShowCriticalPath
        {
            get => _showCriticalPath;
            set
            {
                if (SetProperty(ref _showCriticalPath, value))
                {
                    UpdateTaskBars();
                }
            }
        }

        public bool ShowDependencies
        {
            get => _showDependencies;
            set => SetProperty(ref _showDependencies, value);
        }

        public bool ShowMilestones
        {
            get => _showMilestones;
            set => SetProperty(ref _showMilestones, value);
        }

        public bool ShowTodayLine
        {
            get => _showTodayLine;
            set => SetProperty(ref _showTodayLine, value);
        }

        public double ZoomLevel
        {
            get => _zoomLevel;
            set
            {
                if (SetProperty(ref _zoomLevel, Math.Max(0.1, Math.Min(5.0, value))))
                {
                    OnPropertyChanged(nameof(TimelineWidth));
                    UpdateTimeline();
                }
            }
        }

        public double DayWidth
        {
            get => _dayWidth;
            set => SetProperty(ref _dayWidth, value);
        }

        public double TimelineWidth => ProjectDuration * DayWidth * ZoomLevel;
        public double TimelineHeight => Tasks.Count * 40;

        public double TodayPosition
        {
            get
            {
                var daysSinceStart = (DateTime.Today - ProjectStartDate).Days;
                return Math.Max(0, daysSinceStart * DayWidth * ZoomLevel);
            }
        }

        public GanttTask SelectedTask
        {
            get => _selectedTask;
            set
            {
                if (SetProperty(ref _selectedTask, value))
                {
                    OnPropertyChanged(nameof(HasSelectedTask));
                }
            }
        }

        public GanttMilestone SelectedMilestone
        {
            get => _selectedMilestone;
            set => SetProperty(ref _selectedMilestone, value);
        }

        public bool HasSelectedTask => SelectedTask != null;

        // Summary Statistics
        public int TotalTasks => Tasks.Count;
        public int CompletedTasks => Tasks.Count(t => t.Progress >= 1.0);
        public double OverallProgress => Tasks.Any() ? Tasks.Average(t => t.Progress) : 0;
        public int CriticalPathDuration => CalculateCriticalPathDuration();

        #endregion

        #region Commands

        public ICommand AddTaskCommand { get; private set; }
        public ICommand AddMilestoneCommand { get; private set; }
        public ICommand RefreshCommand { get; private set; }
        public ICommand ExportCommand { get; private set; }
        public ICommand GoToTodayCommand { get; private set; }
        public ICommand ZoomInCommand { get; private set; }
        public ICommand ZoomOutCommand { get; private set; }

        protected override void InitializeCommands()
        {
            base.InitializeCommands();
            
            AddTaskCommand = new RelayCommand(AddTask);
            AddMilestoneCommand = new RelayCommand(AddMilestone);
            RefreshCommand = new AsyncRelayCommand(RefreshAsync);
            ExportCommand = new AsyncRelayCommand(ExportAsync);
            GoToTodayCommand = new RelayCommand(GoToToday);
            ZoomInCommand = new RelayCommand(ZoomIn);
            ZoomOutCommand = new RelayCommand(ZoomOut);
        }

        #endregion

        #region Public Methods

        public void SelectTask(GanttTaskBar taskBar)
        {
            var task = Tasks.FirstOrDefault(t => t.Id == taskBar.TaskId);
            SelectedTask = task;
            
            Logger?.LogInformation("Selected task: {TaskName}", task?.TaskName);
        }

        public void SelectMilestone(GanttMilestone milestone)
        {
            SelectedMilestone = milestone;
            
            Logger?.LogInformation("Selected milestone: {MilestoneName}", milestone?.MilestoneName);
        }

        public void MoveTask(GanttTaskBar taskBar, int daysDelta)
        {
            var task = Tasks.FirstOrDefault(t => t.Id == taskBar.TaskId);
            if (task != null)
            {
                task.StartDate = task.StartDate.AddDays(daysDelta);
                task.EndDate = task.EndDate.AddDays(daysDelta);
                
                UpdateTaskBars();
                UpdateDependencies();
                
                Logger?.LogInformation("Moved task {TaskName} by {Days} days", task.TaskName, daysDelta);
            }
        }

        #endregion

        #region Private Methods

        private void LoadSampleProject()
        {
            Tasks.Clear();
            
            // Phase 1: Discovery & Planning
            var phase1 = new GanttTask
            {
                Id = Guid.NewGuid().ToString(),
                TaskName = "Phase 1: Discovery & Planning",
                StartDate = ProjectStartDate,
                EndDate = ProjectStartDate.AddDays(60),
                Progress = 0.8,
                TaskLevel = 0,
                TaskType = GanttTaskType.Phase,
                IsExpanded = true,
                IsCriticalPath = true
            };
            Tasks.Add(phase1);

            // Discovery subtasks
            Tasks.Add(new GanttTask
            {
                Id = Guid.NewGuid().ToString(),
                ParentId = phase1.Id,
                TaskName = "Environment Discovery",
                StartDate = ProjectStartDate,
                EndDate = ProjectStartDate.AddDays(30),
                Progress = 1.0,
                TaskLevel = 1,
                TaskType = GanttTaskType.Task,
                IsCriticalPath = true
            });

            Tasks.Add(new GanttTask
            {
                Id = Guid.NewGuid().ToString(),
                ParentId = phase1.Id,
                TaskName = "Application Assessment",
                StartDate = ProjectStartDate.AddDays(15),
                EndDate = ProjectStartDate.AddDays(45),
                Progress = 0.7,
                TaskLevel = 1,
                TaskType = GanttTaskType.Task
            });

            Tasks.Add(new GanttTask
            {
                Id = Guid.NewGuid().ToString(),
                ParentId = phase1.Id,
                TaskName = "Migration Planning",
                StartDate = ProjectStartDate.AddDays(30),
                EndDate = ProjectStartDate.AddDays(60),
                Progress = 0.6,
                TaskLevel = 1,
                TaskType = GanttTaskType.Task,
                IsCriticalPath = true
            });

            // Phase 2: Infrastructure Migration
            var phase2 = new GanttTask
            {
                Id = Guid.NewGuid().ToString(),
                TaskName = "Phase 2: Infrastructure Migration",
                StartDate = ProjectStartDate.AddDays(45),
                EndDate = ProjectStartDate.AddDays(150),
                Progress = 0.3,
                TaskLevel = 0,
                TaskType = GanttTaskType.Phase,
                IsExpanded = true,
                IsCriticalPath = true
            };
            Tasks.Add(phase2);

            // Infrastructure subtasks
            Tasks.Add(new GanttTask
            {
                Id = Guid.NewGuid().ToString(),
                ParentId = phase2.Id,
                TaskName = "Network Infrastructure",
                StartDate = ProjectStartDate.AddDays(45),
                EndDate = ProjectStartDate.AddDays(90),
                Progress = 0.4,
                TaskLevel = 1,
                TaskType = GanttTaskType.Task,
                IsCriticalPath = true
            });

            Tasks.Add(new GanttTask
            {
                Id = Guid.NewGuid().ToString(),
                ParentId = phase2.Id,
                TaskName = "Server Migration Wave 1",
                StartDate = ProjectStartDate.AddDays(75),
                EndDate = ProjectStartDate.AddDays(120),
                Progress = 0.2,
                TaskLevel = 1,
                TaskType = GanttTaskType.Task,
                IsCriticalPath = true
            });

            Tasks.Add(new GanttTask
            {
                Id = Guid.NewGuid().ToString(),
                ParentId = phase2.Id,
                TaskName = "Server Migration Wave 2",
                StartDate = ProjectStartDate.AddDays(105),
                EndDate = ProjectStartDate.AddDays(150),
                Progress = 0.0,
                TaskLevel = 1,
                TaskType = GanttTaskType.Task
            });

            // Phase 3: Application Migration
            var phase3 = new GanttTask
            {
                Id = Guid.NewGuid().ToString(),
                TaskName = "Phase 3: Application Migration",
                StartDate = ProjectStartDate.AddDays(120),
                EndDate = ProjectStartDate.AddDays(240),
                Progress = 0.1,
                TaskLevel = 0,
                TaskType = GanttTaskType.Phase,
                IsExpanded = true
            };
            Tasks.Add(phase3);

            // Application subtasks
            Tasks.Add(new GanttTask
            {
                Id = Guid.NewGuid().ToString(),
                ParentId = phase3.Id,
                TaskName = "Business Applications",
                StartDate = ProjectStartDate.AddDays(120),
                EndDate = ProjectStartDate.AddDays(180),
                Progress = 0.0,
                TaskLevel = 1,
                TaskType = GanttTaskType.Task
            });

            Tasks.Add(new GanttTask
            {
                Id = Guid.NewGuid().ToString(),
                ParentId = phase3.Id,
                TaskName = "Database Migration",
                StartDate = ProjectStartDate.AddDays(150),
                EndDate = ProjectStartDate.AddDays(210),
                Progress = 0.0,
                TaskLevel = 1,
                TaskType = GanttTaskType.Task,
                IsCriticalPath = true
            });

            Tasks.Add(new GanttTask
            {
                Id = Guid.NewGuid().ToString(),
                ParentId = phase3.Id,
                TaskName = "User Migration",
                StartDate = ProjectStartDate.AddDays(180),
                EndDate = ProjectStartDate.AddDays(240),
                Progress = 0.0,
                TaskLevel = 1,
                TaskType = GanttTaskType.Task,
                IsCriticalPath = true
            });

            // Phase 4: Testing & Validation
            var phase4 = new GanttTask
            {
                Id = Guid.NewGuid().ToString(),
                TaskName = "Phase 4: Testing & Validation",
                StartDate = ProjectStartDate.AddDays(210),
                EndDate = ProjectStartDate.AddDays(300),
                Progress = 0.0,
                TaskLevel = 0,
                TaskType = GanttTaskType.Phase,
                IsExpanded = true
            };
            Tasks.Add(phase4);

            // Add milestones
            Milestones.Add(new GanttMilestone
            {
                Id = Guid.NewGuid().ToString(),
                MilestoneName = "Discovery Complete",
                Date = ProjectStartDate.AddDays(60),
                MilestoneColor = "#FF4F46E5",
                BorderColor = "#FF3730A3",
                IsCompleted = false
            });

            Milestones.Add(new GanttMilestone
            {
                Id = Guid.NewGuid().ToString(),
                MilestoneName = "Infrastructure Ready",
                Date = ProjectStartDate.AddDays(150),
                MilestoneColor = "#FF059669",
                BorderColor = "#FF047857",
                IsCompleted = false
            });

            Milestones.Add(new GanttMilestone
            {
                Id = Guid.NewGuid().ToString(),
                MilestoneName = "Go-Live",
                Date = ProjectStartDate.AddDays(300),
                MilestoneColor = "#FFDC2626",
                BorderColor = "#FFB91C1C",
                IsCompleted = false
            });

            UpdateTimeline();
        }

        private void UpdateTimeline()
        {
            UpdateTaskBars();
            UpdateTimeGridLines();
            UpdateRowBackgrounds();
            UpdateDependencies();
            UpdateMilestonePositions();
            
            OnPropertyChanged(nameof(TimelineWidth));
            OnPropertyChanged(nameof(TimelineHeight));
            OnPropertyChanged(nameof(TodayPosition));
        }

        private void UpdateTaskBars()
        {
            TaskBars.Clear();
            
            for (int i = 0; i < Tasks.Count; i++)
            {
                var task = Tasks[i];
                if (task.TaskType == GanttTaskType.Phase) continue;

                var startX = (task.StartDate - ProjectStartDate).Days * DayWidth * ZoomLevel;
                var width = (task.EndDate - task.StartDate).Days * DayWidth * ZoomLevel;
                var y = i * 40 + 8; // Row height with padding

                var taskBar = new GanttTaskBar
                {
                    TaskId = task.Id,
                    TaskName = task.TaskName,
                    X = startX,
                    Y = y,
                    Width = Math.Max(width, 10), // Minimum width
                    TaskColor = GetTaskColor(task),
                    BorderColor = GetTaskBorderColor(task),
                    ProgressColor = GetProgressColor(task),
                    ProgressWidth = width * task.Progress,
                    IsCriticalPath = task.IsCriticalPath && ShowCriticalPath,
                    ToolTip = $"{task.TaskName}\n{task.StartDate:MMM dd} - {task.EndDate:MMM dd}\nProgress: {task.Progress:P0}"
                };

                TaskBars.Add(taskBar);
            }
        }

        private void UpdateTimeGridLines()
        {
            TimeGridLines.Clear();
            
            var currentDate = ProjectStartDate;
            var x = 0.0;
            var dayWidth = DayWidth * ZoomLevel;

            while (currentDate <= ProjectEndDate)
            {
                // Add grid lines based on time scale
                bool addLine = false;
                switch (SelectedTimeScale)
                {
                    case "Days":
                        addLine = true;
                        break;
                    case "Weeks":
                        addLine = currentDate.DayOfWeek == DayOfWeek.Monday;
                        break;
                    case "Months":
                        addLine = currentDate.Day == 1;
                        break;
                    case "Quarters":
                        addLine = currentDate.Day == 1 && (currentDate.Month - 1) % 3 == 0;
                        break;
                }

                if (addLine)
                {
                    TimeGridLines.Add(new TimeGridLine { X = x });
                }

                currentDate = currentDate.AddDays(1);
                x += dayWidth;
            }
        }

        private void UpdateRowBackgrounds()
        {
            RowBackgrounds.Clear();
            
            for (int i = 0; i < Tasks.Count; i++)
            {
                RowBackgrounds.Add(new RowBackground
                {
                    Y = i * 40,
                    BackgroundColor = i % 2 == 0 ? "#FF6B7280" : "#FF9CA3AF"
                });
            }
        }

        private void UpdateDependencies()
        {
            Dependencies.Clear();
            
            // Add sample dependencies
            var tasks = Tasks.Where(t => t.TaskType == GanttTaskType.Task).ToList();
            for (int i = 1; i < Math.Min(tasks.Count, 5); i++)
            {
                var predecessor = tasks[i - 1];
                var successor = tasks[i];
                
                if (predecessor != null && successor != null)
                {
                    Dependencies.Add(CreateDependencyArrow(predecessor, successor));
                }
            }
        }

        private void UpdateMilestonePositions()
        {
            foreach (var milestone in Milestones)
            {
                var daysSinceStart = (milestone.Date - ProjectStartDate).Days;
                milestone.X = daysSinceStart * DayWidth * ZoomLevel - 15; // Center the diamond
                milestone.Y = -5; // Position above task bars
            }
        }

        private GanttDependency CreateDependencyArrow(GanttTask predecessor, GanttTask successor)
        {
            // Calculate arrow path from end of predecessor to start of successor
            var predEndX = (predecessor.EndDate - ProjectStartDate).Days * DayWidth * ZoomLevel;
            var succStartX = (successor.StartDate - ProjectStartDate).Days * DayWidth * ZoomLevel;
            var predY = Tasks.IndexOf(predecessor) * 40 + 20;
            var succY = Tasks.IndexOf(successor) * 40 + 20;

            return new GanttDependency
            {
                PredecessorId = predecessor.Id,
                SuccessorId = successor.Id,
                DependencyColor = "#FF6B7280",
                PathGeometry = $"M {predEndX},{predY} L {succStartX},{succY}",
                DependencyDescription = $"{predecessor.TaskName} → {successor.TaskName}"
            };
        }

        private string GetTaskColor(GanttTask task)
        {
            if (task.IsCriticalPath && ShowCriticalPath)
                return "#FFDC2626"; // Red for critical path
            
            return task.TaskType switch
            {
                GanttTaskType.Phase => "#FF4F46E5", // Blue
                GanttTaskType.Task => "#FF059669",  // Green
                GanttTaskType.Milestone => "#FFEA580C", // Orange
                _ => "#FF6B7280" // Gray
            };
        }

        private string GetTaskBorderColor(GanttTask task)
        {
            return task.IsCriticalPath && ShowCriticalPath ? "#FFB91C1C" : "#FF374151";
        }

        private string GetProgressColor(GanttTask task)
        {
            return task.Progress >= 1.0 ? "#FF10B981" : "#FF3B82F6";
        }

        private int CalculateCriticalPathDuration()
        {
            var criticalTasks = Tasks.Where(t => t.IsCriticalPath).ToList();
            if (!criticalTasks.Any()) return 0;

            var earliestStart = criticalTasks.Min(t => t.StartDate);
            var latestEnd = criticalTasks.Max(t => t.EndDate);
            return (latestEnd - earliestStart).Days;
        }

        private void AddTask()
        {
            var newTask = new GanttTask
            {
                Id = Guid.NewGuid().ToString(),
                TaskName = "New Task",
                StartDate = DateTime.Today,
                EndDate = DateTime.Today.AddDays(7),
                Progress = 0.0,
                TaskLevel = 0,
                TaskType = GanttTaskType.Task
            };

            Tasks.Add(newTask);
            UpdateTimeline();
            
            Logger?.LogInformation("Added new task: {TaskName}", newTask.TaskName);
        }

        private void AddMilestone()
        {
            var newMilestone = new GanttMilestone
            {
                Id = Guid.NewGuid().ToString(),
                MilestoneName = "New Milestone",
                Date = DateTime.Today,
                MilestoneColor = "#FF7C3AED",
                BorderColor = "#FF6D28D9"
            };

            Milestones.Add(newMilestone);
            UpdateMilestonePositions();
            
            Logger?.LogInformation("Added new milestone: {MilestoneName}", newMilestone.MilestoneName);
        }

        private async Task RefreshAsync()
        {
            await ExecuteAsync(async () =>
            {
                // Refresh project data
                LoadSampleProject();
                
            }, "Refreshing timeline");
        }

        private async Task ExportAsync()
        {
            await ExecuteAsync(async () =>
            {
                // Export timeline data
                Logger?.LogInformation("Exporting timeline data");
                SendMessage(new StatusMessage("Export functionality not yet implemented", Messages.StatusType.Information));
                
            }, "Exporting timeline");
        }

        private void GoToToday()
        {
            // This would scroll the timeline to today's position
            Logger?.LogInformation("Scrolling to today's date");
        }

        private void ZoomIn()
        {
            ZoomLevel = Math.Min(5.0, ZoomLevel * 1.2);
        }

        private void ZoomOut()
        {
            ZoomLevel = Math.Max(0.1, ZoomLevel / 1.2);
        }

        #endregion
    }

    #region Supporting Classes

    public class GanttTask
    {
        public string Id { get; set; }
        public string ParentId { get; set; }
        public string TaskName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public double Progress { get; set; }
        public int TaskLevel { get; set; }
        public GanttTaskType TaskType { get; set; }
        public bool IsExpanded { get; set; } = true;
        public bool IsCriticalPath { get; set; }
        public bool HasSubTasks => !string.IsNullOrEmpty(ParentId);
        public Thickness IndentMargin => new(TaskLevel * 20, 0, 0, 0);
        public string ProgressColor => Progress >= 1.0 ? "#FF10B981" : "#FF3B82F6";
        
        public ICommand ToggleExpandCommand { get; set; }
    }

    public class GanttTaskBar
    {
        public string TaskId { get; set; }
        public string TaskName { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
        public double Width { get; set; }
        public string TaskColor { get; set; }
        public string BorderColor { get; set; }
        public string ProgressColor { get; set; }
        public double ProgressWidth { get; set; }
        public bool IsCriticalPath { get; set; }
        public string ToolTip { get; set; }
    }

    public class GanttMilestone
    {
        public string Id { get; set; }
        public string MilestoneName { get; set; }
        public DateTime Date { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
        public string MilestoneColor { get; set; }
        public string BorderColor { get; set; }
        public bool IsCompleted { get; set; }
        public string ToolTip => $"{MilestoneName}\n{Date:MMM dd, yyyy}";
    }

    public class GanttDependency
    {
        public string PredecessorId { get; set; }
        public string SuccessorId { get; set; }
        public string DependencyColor { get; set; }
        public string PathGeometry { get; set; }
        public string DependencyDescription { get; set; }
    }

    public class TimeGridLine
    {
        public double X { get; set; }
    }

    public class RowBackground
    {
        public double Y { get; set; }
        public string BackgroundColor { get; set; }
    }

    public enum GanttTaskType
    {
        Phase,
        Task,
        Milestone
    }

    #endregion
}