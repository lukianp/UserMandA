using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Management Dashboard
    /// </summary>
    public class ManagementDashboardViewModel : BaseViewModel
    {
        private MigrationProject _currentProject;
        private double _overallProgress;
        private int _tasksAtRisk;
        private ObservableCollection<MigrationProjectTask> _upcomingDeadlines;
        private ObservableCollection<WaveStatusItem> _waveCompletionStatus;

        public ManagementDashboardViewModel(MigrationProject project)
        {
            // Initialize collections BEFORE setting CurrentProject to avoid null reference in UpdateKPIs
            UpcomingDeadlines = new ObservableCollection<MigrationProjectTask>();
            WaveCompletionStatus = new ObservableCollection<WaveStatusItem>();
            
            // Setting CurrentProject will trigger UpdateKPIs() via the setter
            CurrentProject = project;
        }

        #region Properties

        public MigrationProject CurrentProject
        {
            get => _currentProject;
            set
            {
                if (SetProperty(ref _currentProject, value))
                {
                    UpdateKPIs();
                }
            }
        }

        public double OverallProgress
        {
            get => _overallProgress;
            set => SetProperty(ref _overallProgress, value);
        }

        public int TasksAtRisk
        {
            get => _tasksAtRisk;
            set => SetProperty(ref _tasksAtRisk, value);
        }

        public ObservableCollection<MigrationProjectTask> UpcomingDeadlines
        {
            get => _upcomingDeadlines;
            set => SetProperty(ref _upcomingDeadlines, value);
        }

        public ObservableCollection<WaveStatusItem> WaveCompletionStatus
        {
            get => _waveCompletionStatus;
            set => SetProperty(ref _waveCompletionStatus, value);
        }

        // Dashboard metrics for display
        public int TotalTasks => GetAllTasks().Count();
        public int CompletedTasks => GetAllTasks().Count(t => t.Status == MigrationProjectTaskStatus.Completed);
        public int InProgressTasks => GetAllTasks().Count(t => t.Status == MigrationProjectTaskStatus.InProgress);
        public int BlockedTasks => GetAllTasks().Count(t => t.Status == MigrationProjectTaskStatus.Blocked);

        public string OverallProgressText => $"{OverallProgress:F1}%";
        public string ProjectDuration => $"{(CurrentProject?.EndDate - CurrentProject?.StartDate)?.Days ?? 0} days";
        public string DaysRemaining => $"{Math.Max(0, (CurrentProject?.EndDate - DateTime.Today)?.Days ?? 0)} days";

        // Risk summary
        public int HighRiskItems => CurrentProject?.Risks?.Count(r => r.Severity == RiskSeverity.High) ?? 0;
        public int MediumRiskItems => CurrentProject?.Risks?.Count(r => r.Severity == RiskSeverity.Medium) ?? 0;
        public int LowRiskItems => CurrentProject?.Risks?.Count(r => r.Severity == RiskSeverity.Low) ?? 0;

        // Phase summary
        public string CurrentPhase
        {
            get
            {
                var activePhase = CurrentProject?.Phases?
                    .Where(p => p.StartDate <= DateTime.Today && p.EndDate >= DateTime.Today)
                    .OrderBy(p => p.StartDate)
                    .FirstOrDefault();
                    
                return activePhase?.Name ?? "Not Started";
            }
        }

        #endregion

        #region Methods

        /// <summary>
        /// Updates all KPIs and dashboard data
        /// </summary>
        public void UpdateKPIs()
        {
            try
            {
                if (CurrentProject == null) return;
                if (UpcomingDeadlines == null || WaveCompletionStatus == null) return;

                // Update overall progress
                CurrentProject.CalculateOverallProgress();
                OverallProgress = CurrentProject.OverallProgress;

                // Count tasks at risk or blocked
                var allTasks = GetAllTasks();
                TasksAtRisk = allTasks.Count(t => t.Status == MigrationProjectTaskStatus.AtRisk || t.Status == MigrationProjectTaskStatus.Blocked);

                // Update upcoming deadlines (tasks due within 7 days and not completed)
                UpcomingDeadlines.Clear();
                var upcomingTasks = allTasks
                    .Where(t => t.EndDate <= DateTime.Today.AddDays(7) && 
                               t.Status != MigrationProjectTaskStatus.Completed &&
                               t.EndDate >= DateTime.Today)
                    .OrderBy(t => t.EndDate)
                    .Take(10); // Limit to top 10

                foreach (var task in upcomingTasks)
                {
                    UpcomingDeadlines.Add(task);
                }

                // Update wave completion status for chart
                WaveCompletionStatus.Clear();
                if (CurrentProject.Waves != null)
                {
                    foreach (var wave in CurrentProject.Waves)
                    {
                        WaveCompletionStatus.Add(new WaveStatusItem
                        {
                            WaveName = wave.Name,
                            Completion = wave.Progress
                        });
                    }
                }

                // Notify UI of changes
                OnPropertyChanged(nameof(TotalTasks));
                OnPropertyChanged(nameof(CompletedTasks));
                OnPropertyChanged(nameof(InProgressTasks));
                OnPropertyChanged(nameof(BlockedTasks));
                OnPropertyChanged(nameof(OverallProgressText));
                OnPropertyChanged(nameof(ProjectDuration));
                OnPropertyChanged(nameof(DaysRemaining));
                OnPropertyChanged(nameof(HighRiskItems));
                OnPropertyChanged(nameof(MediumRiskItems));
                OnPropertyChanged(nameof(LowRiskItems));
                OnPropertyChanged(nameof(CurrentPhase));
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"ManagementDashboardViewModel.UpdateKPIs failed: {ex.Message}");
                // Reset to safe defaults on error
                OverallProgress = 0;
                TasksAtRisk = 0;
                if (UpcomingDeadlines != null) UpcomingDeadlines.Clear();
                if (WaveCompletionStatus != null) WaveCompletionStatus.Clear();
            }
        }

        /// <summary>
        /// Gets all tasks from all phases
        /// </summary>
        private IEnumerable<MigrationProjectTask> GetAllTasks()
        {
            if (CurrentProject?.Phases == null) return Enumerable.Empty<MigrationProjectTask>();

            return CurrentProject.Phases.SelectMany(p => p.Tasks ?? Enumerable.Empty<MigrationProjectTask>());
        }

        /// <summary>
        /// Gets phase completion percentage
        /// </summary>
        public double GetPhaseCompletion(string phaseName)
        {
            var phase = CurrentProject?.Phases?.FirstOrDefault(p => p.Name == phaseName);
            return phase?.Progress ?? 0;
        }

        /// <summary>
        /// Gets the status color for a phase
        /// </summary>
        public string GetPhaseStatusColor(string phaseName)
        {
            var phase = CurrentProject?.Phases?.FirstOrDefault(p => p.Name == phaseName);
            if (phase == null) return "#FF6B7280";

            var completion = phase.Progress;
            if (completion >= 100) return "#FF10B981"; // Green - Complete
            if (completion >= 75) return "#FF3B82F6";  // Blue - On track
            if (completion >= 50) return "#FFF59E0B";  // Yellow - Progressing
            if (completion > 0) return "#FFEF4444";    // Orange - At risk
            return "#FF6B7280"; // Gray - Not started
        }

        /// <summary>
        /// Gets overdue tasks count
        /// </summary>
        public int GetOverdueTasksCount()
        {
            return GetAllTasks().Count(t => 
                t.EndDate < DateTime.Today && 
                t.Status != MigrationProjectTaskStatus.Completed);
        }

        /// <summary>
        /// Gets critical tasks (high priority or critical path)
        /// </summary>
        public IEnumerable<MigrationProjectTask> GetCriticalTasks()
        {
            return GetAllTasks().Where(t => 
                t.IsCriticalPath || 
                t.Status == MigrationProjectTaskStatus.Blocked ||
                (t.EndDate <= DateTime.Today.AddDays(3) && t.Status != MigrationProjectTaskStatus.Completed));
        }

        #endregion
    }
}