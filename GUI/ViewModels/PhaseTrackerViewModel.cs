using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Input;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Phase Tracker view using unified MVVM pipeline
    /// </summary>
    public class PhaseTrackerViewModel : BaseViewModel
    {
        private string _currentPhase = "Discovery";
        private double _overallProgress = 0.0;
        private string _estimatedCompletion = "TBD";

        public PhaseTrackerViewModel(ILogger<PhaseTrackerViewModel> logger) : base(logger)
        {
            Phases = new ObservableCollection<PhaseItem>();
            RefreshCommand = new AsyncRelayCommand(LoadAsync);
        }

        /// <summary>
        /// Collection of project phases
        /// </summary>
        public ObservableCollection<PhaseItem> Phases { get; }

        /// <summary>
        /// Current active phase
        /// </summary>
        public string CurrentPhase
        {
            get => _currentPhase;
            set => SetProperty(ref _currentPhase, value);
        }

        /// <summary>
        /// Overall project progress percentage
        /// </summary>
        public double OverallProgress
        {
            get => _overallProgress;
            set => SetProperty(ref _overallProgress, value);
        }

        /// <summary>
        /// Estimated completion date
        /// </summary>
        public string EstimatedCompletion
        {
            get => _estimatedCompletion;
            set => SetProperty(ref _estimatedCompletion, value);
        }

        /// <summary>
        /// Command to refresh phase data
        /// </summary>
        public ICommand RefreshCommand { get; }

        /// <summary>
        /// Whether the view has data to display
        /// </summary>
        public override bool HasData => Phases?.Count > 0;

        /// <summary>
        /// Loads phase tracking data using unified pipeline
        /// </summary>
        public override async Task LoadAsync()
        {
            IsLoading = true;
            HasData = false;
            LastError = null;
            HeaderWarnings.Clear();

            try
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "phase_tracker" }, "Phase tracking data loading started");

                // Clear existing data
                System.Windows.Application.Current.Dispatcher.Invoke(() => Phases.Clear());

                // Simulate loading delay
                await Task.Delay(800);

                // Load project phases - in a real implementation this would come from a project management system
                var phaseData = new[]
                {
                    new PhaseItem { Name = "Discovery", Status = "Completed", Progress = 100, StartDate = "2025-01-01", EndDate = "2025-02-15", Duration = "45 days" },
                    new PhaseItem { Name = "Assessment", Status = "Completed", Progress = 100, StartDate = "2025-02-16", EndDate = "2025-03-15", Duration = "28 days" },
                    new PhaseItem { Name = "Planning", Status = "In Progress", Progress = 75, StartDate = "2025-03-01", EndDate = "2025-04-01", Duration = "31 days" },
                    new PhaseItem { Name = "Migration Wave 1", Status = "Pending", Progress = 0, StartDate = "2025-04-01", EndDate = "2025-05-15", Duration = "44 days" },
                    new PhaseItem { Name = "Migration Wave 2", Status = "Pending", Progress = 0, StartDate = "2025-05-15", EndDate = "2025-06-30", Duration = "46 days" },
                    new PhaseItem { Name = "Testing & Validation", Status = "Pending", Progress = 0, StartDate = "2025-06-15", EndDate = "2025-07-15", Duration = "30 days" },
                    new PhaseItem { Name = "Go-Live", Status = "Pending", Progress = 0, StartDate = "2025-07-15", EndDate = "2025-08-01", Duration = "17 days" },
                    new PhaseItem { Name = "Post-Migration", Status = "Pending", Progress = 0, StartDate = "2025-08-01", EndDate = "2025-09-01", Duration = "31 days" }
                };

                // Add phases to collection
                System.Windows.Application.Current.Dispatcher.Invoke(() =>
                {
                    foreach (var phase in phaseData)
                    {
                        Phases.Add(phase);
                    }
                });

                // Calculate overall progress
                var totalPhases = phaseData.Length;
                var completedPhases = 0;
                var totalProgress = 0.0;

                foreach (var phase in phaseData)
                {
                    if (phase.Status == "Completed") completedPhases++;
                    totalProgress += phase.Progress;
                }

                OverallProgress = totalProgress / totalPhases;
                CurrentPhase = phaseData[2].Name; // Planning phase is current
                EstimatedCompletion = "September 1, 2025";

                HasData = Phases.Count > 0;

                StructuredLogger?.LogInfo(LogSourceName, new { 
                    action = "load_complete", 
                    component = "phase_tracker",
                    phases = Phases.Count,
                    overall_progress = OverallProgress,
                    current_phase = CurrentPhase
                }, "Phase tracking data loaded successfully");
            }
            catch (Exception ex)
            {
                LastError = $"Failed to load phase data: {ex.Message}";
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "phase_tracker" }, "Failed to load phase tracking data");
            }
            finally
            {
                IsLoading = false;
            }
        }
    }

    /// <summary>
    /// Represents a project phase item
    /// </summary>
    public class PhaseItem
    {
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double Progress { get; set; }
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
    }
}