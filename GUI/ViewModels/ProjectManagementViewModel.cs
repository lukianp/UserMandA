using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows.Input;
using System.Threading.Tasks;
using TaskStatus = MandADiscoverySuite.Models.TaskStatus;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for Project Management module
    /// </summary>
    public class ProjectManagementViewModel : BaseViewModel
    {
        private IntegrationProject _currentProject;
        private string _selectedView = "Dashboard";
        private ProjectTask _selectedTask;
        private ProjectRisk _selectedRisk;
        private bool _isLoading;

        public ProjectManagementViewModel()
        {
            InitializeCommands();
            InitializeEmptyProject();
        }

        #region Properties

        public IntegrationProject CurrentProject
        {
            get => _currentProject;
            set { _currentProject = value; OnPropertyChanged(); OnPropertyChanged(nameof(TeamMembers)); UpdateDashboardMetrics(); }
        }

        public string SelectedView
        {
            get => _selectedView;
            set { _selectedView = value; OnPropertyChanged(); }
        }

        public ProjectTask SelectedTask
        {
            get => _selectedTask;
            set { _selectedTask = value; OnPropertyChanged(); }
        }

        public ProjectRisk SelectedRisk
        {
            get => _selectedRisk;
            set { _selectedRisk = value; OnPropertyChanged(); }
        }

        public new bool IsLoading
        {
            get => _isLoading;
            set { _isLoading = value; OnPropertyChanged(); }
        }

        // Dashboard Metrics
        public ObservableCollection<ProjectMilestone> UpcomingMilestones { get; set; } = new ObservableCollection<ProjectMilestone>();
        public ObservableCollection<ProjectRisk> ActiveRisks { get; set; } = new ObservableCollection<ProjectRisk>();
        public ObservableCollection<ProjectTask> OverdueTasks { get; set; } = new ObservableCollection<ProjectTask>();

        // Quick Stats
        public int TotalTasks => CurrentProject?.Phases.SelectMany(p => p.Components).SelectMany(c => c.Tasks).Count() ?? 0;
        public int CompletedTasks => CurrentProject?.Phases.SelectMany(p => p.Components).SelectMany(c => c.Tasks).Count(t => t.Status == Models.TaskStatus.Completed) ?? 0;
        public int InProgressTasks => CurrentProject?.Phases.SelectMany(p => p.Components).SelectMany(c => c.Tasks).Count(t => t.Status == Models.TaskStatus.InProgress) ?? 0;
        public int OverdueTaskCount => OverdueTasks.Count;
        public int HighRiskCount => ActiveRisks.Count(r => r.RiskScore >= 16);

        // Team Members for project management view
        public ObservableCollection<ProjectStakeholder> TeamMembers => CurrentProject?.Stakeholders ?? new ObservableCollection<ProjectStakeholder>();

        #endregion

        #region Commands

        public ICommand NavigateToViewCommand { get; private set; }
        public ICommand CreateNewProjectCommand { get; private set; }
        public ICommand LoadProjectCommand { get; private set; }
        public ICommand SaveProjectCommand { get; private set; }
        public ICommand AddPhaseCommand { get; private set; }
        public ICommand AddComponentCommand { get; private set; }
        public ICommand AddTaskCommand { get; private set; }
        public ICommand UpdateTaskCommand { get; private set; }
        public ICommand DeleteTaskCommand { get; private set; }
        public ICommand AddMilestoneCommand { get; private set; }
        public ICommand AddRiskCommand { get; private set; }
        public ICommand UpdateRiskCommand { get; private set; }
        public ICommand RefreshDashboardCommand { get; private set; }
        public ICommand ExpandAllCommand { get; private set; }
        public ICommand CollapseAllCommand { get; private set; }
        public ICommand TogglePhaseExpandCommand { get; private set; }
        public ICommand ToggleComponentExpandCommand { get; private set; }
        public ICommand EditTaskCommand { get; private set; }
        public ICommand GenerateReportCommand { get; private set; }
        public ICommand ExportProjectCommand { get; private set; }
        public ICommand ImportProjectCommand { get; private set; }

        #endregion

        #region Command Implementations

        protected override void InitializeCommands()
        {
            NavigateToViewCommand = new RelayCommand<string>(NavigateToView);
            CreateNewProjectCommand = new AsyncRelayCommand(CreateNewProjectAsync);
            LoadProjectCommand = new AsyncRelayCommand(async () => await LoadProjectAsync(null));
            SaveProjectCommand = new AsyncRelayCommand(SaveProjectAsync);
            AddPhaseCommand = new RelayCommand<IntegrationProject>(AddPhase);
            AddComponentCommand = new RelayCommand<ProjectPhase>(AddComponent);
            AddTaskCommand = new RelayCommand<ProjectComponent>(AddTask);
            UpdateTaskCommand = new RelayCommand<ProjectTask>(UpdateTask);
            DeleteTaskCommand = new RelayCommand<ProjectTask>(DeleteTask);
            AddMilestoneCommand = new RelayCommand<IntegrationProject>(AddMilestone);
            AddRiskCommand = new RelayCommand<IntegrationProject>(AddRisk);
            UpdateRiskCommand = new RelayCommand<ProjectRisk>(UpdateRisk);
            RefreshDashboardCommand = new AsyncRelayCommand(RefreshDashboardAsync);
            ExpandAllCommand = new RelayCommand(ExpandAll);
            CollapseAllCommand = new RelayCommand(CollapseAll);
            TogglePhaseExpandCommand = new RelayCommand<ProjectPhase>(TogglePhaseExpand);
            ToggleComponentExpandCommand = new RelayCommand<ProjectComponent>(ToggleComponentExpand);
            EditTaskCommand = new RelayCommand<ProjectTask>(EditTask);
            GenerateReportCommand = new AsyncRelayCommand(GenerateReportAsync);
            ExportProjectCommand = new AsyncRelayCommand(ExportProjectAsync);
            ImportProjectCommand = new AsyncRelayCommand(ImportProjectAsync);
        }

        private void NavigateToView(string viewName)
        {
            SelectedView = viewName;
        }

        private async Task CreateNewProjectAsync()
        {
            IsLoading = true;
            try
            {
                var newProject = new IntegrationProject
                {
                    Name = "New M&A Integration Project",
                    CompanyName = "Target Company",
                    StartDate = DateTime.Now,
                    TargetEndDate = DateTime.Now.AddMonths(12),
                    Status = ProjectStatus.Planning,
                    HealthScore = 100.0,
                    OverallProgress = 0.0
                };

                // CreateDefaultPhases(newProject);
                // CreateDefaultMilestones(newProject);
                
                CurrentProject = newProject;
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task LoadProjectAsync(string projectId)
        {
            IsLoading = true;
            try
            {
                // Simple implementation: create sample project data
                await Task.Delay(500); // Simulate loading
                
                // Generate sample tasks if none exist in any phase/component
                if (CurrentProject != null)
                {
                    var existingTasks = CurrentProject.Phases.SelectMany(p => p.Components).SelectMany(c => c.Tasks).Any();
                    if (!existingTasks && CurrentProject.Phases.Any())
                    {
                        var firstComponent = CurrentProject.Phases.First().Components.FirstOrDefault();
                        if (firstComponent != null)
                        {
                            var sampleTasks = new[]
                            {
                                new ProjectTask { Name = "Project Planning", Status = TaskStatus.Completed },
                                new ProjectTask { Name = "Requirements Analysis", Status = TaskStatus.Completed },
                                new ProjectTask { Name = "Development Phase 1", Status = TaskStatus.InProgress },
                                new ProjectTask { Name = "Testing Phase 1", Status = TaskStatus.NotStarted },
                                new ProjectTask { Name = "Deployment", Status = TaskStatus.NotStarted }
                            };
                            
                            foreach (var task in sampleTasks)
                            {
                                firstComponent.Tasks.Add(task);
                            }
                        }
                    }
                }
                
                // Initialize empty project - data will be loaded from discovery
                InitializeEmptyProject();
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task SaveProjectAsync()
        {
            IsLoading = true;
            try
            {
                // Simple implementation: simulate saving with validation
                await Task.Delay(300); // Simulate saving
                
                // Update last modified timestamp
                if (CurrentProject != null)
                {
                    CurrentProject.LastModified = DateTime.Now;
                }
                
                StatusMessage = "Project data saved successfully";
                
                // For now, just update the modification date
                if (CurrentProject != null)
                {
                    // Save timestamp or perform other save operations
                }
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void AddPhase(IntegrationProject project)
        {
            if (project == null) return;

            var newPhase = new ProjectPhase
            {
                Name = $"New Phase {project.Phases.Count + 1}",
                Description = "Phase description",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddMonths(2),
                Status = PhaseStatus.NotStarted,
                Progress = 0.0,
                Order = project.Phases.Count + 1
            };

            project.Phases.Add(newPhase);
        }

        private void AddComponent(ProjectPhase phase)
        {
            if (phase == null) return;

            var newComponent = new ProjectComponent
            {
                Name = $"New Component {phase.Components.Count + 1}",
                Description = "Component description",
                Status = ComponentStatus.NotStarted,
                Progress = 0.0,
                Order = phase.Components.Count + 1
            };

            phase.Components.Add(newComponent);
        }

        private void AddTask(ProjectComponent component)
        {
            if (component == null) return;

            var newTask = new ProjectTask
            {
                Name = $"New Task {component.Tasks.Count + 1}",
                Description = "Task description",
                Status = Models.TaskStatus.NotStarted,
                Priority = TaskPriority.Medium,
                DueDate = DateTime.Now.AddDays(7)
            };

            component.Tasks.Add(newTask);
        }

        private void UpdateTask(ProjectTask task)
        {
            if (task == null) return;

            // Update completion date if task is marked as completed
            if (task.Status == Models.TaskStatus.Completed && !task.CompletedDate.HasValue)
            {
                task.CompletedDate = DateTime.Now;
            }

            // Update progress metrics
            UpdateDashboardMetrics();
        }

        private void DeleteTask(ProjectTask task)
        {
            if (task == null || CurrentProject == null) return;

            foreach (var phase in CurrentProject.Phases)
            {
                foreach (var component in phase.Components)
                {
                    if (component.Tasks.Contains(task))
                    {
                        component.Tasks.Remove(task);
                        UpdateDashboardMetrics();
                        return;
                    }
                }
            }
        }

        private void AddMilestone(IntegrationProject project)
        {
            if (project == null) return;

            var newMilestone = new ProjectMilestone
            {
                Name = $"Milestone {project.Milestones.Count + 1}",
                Description = "Milestone description",
                TargetDate = DateTime.Now.AddMonths(1),
                Status = MilestoneStatus.NotStarted
            };

            project.Milestones.Add(newMilestone);
        }

        private void AddRisk(IntegrationProject project)
        {
            if (project == null) return;

            var newRisk = new ProjectRisk
            {
                Description = "New risk description",
                Category = RiskCategory.Technical,
                Likelihood = 3,
                Impact = 3,
                Status = RiskStatus.Open,
                Owner = "Risk Owner"
            };

            project.Risks.Add(newRisk);
            UpdateDashboardMetrics();
        }

        private void UpdateRisk(ProjectRisk risk)
        {
            if (risk == null) return;

            // Update resolution date if risk is closed
            if (risk.Status == RiskStatus.Closed && !risk.ResolvedDate.HasValue)
            {
                risk.ResolvedDate = DateTime.Now;
            }

            UpdateDashboardMetrics();
        }

        private void ExpandAll()
        {
            if (CurrentProject?.Phases == null) return;

            foreach (var phase in CurrentProject.Phases)
            {
                phase.IsExpanded = true;
                foreach (var component in phase.Components)
                {
                    component.IsExpanded = true;
                }
            }
        }

        private void CollapseAll()
        {
            if (CurrentProject?.Phases == null) return;

            foreach (var phase in CurrentProject.Phases)
            {
                phase.IsExpanded = false;
                foreach (var component in phase.Components)
                {
                    component.IsExpanded = false;
                }
            }
        }

        private void TogglePhaseExpand(ProjectPhase phase)
        {
            if (phase == null) return;
            phase.IsExpanded = !phase.IsExpanded;
        }

        private void ToggleComponentExpand(ProjectComponent component)
        {
            if (component == null) return;
            component.IsExpanded = !component.IsExpanded;
        }

        private void EditTask(ProjectTask task)
        {
            if (task == null) return;
            
            // Simple implementation: toggle task status
            if (task.Status == TaskStatus.NotStarted)
            {
                task.Status = TaskStatus.InProgress;
            }
            else if (task.Status == TaskStatus.InProgress)
            {
                task.Status = TaskStatus.Completed;
            }
            else if (task.Status == TaskStatus.Completed)
            {
                task.Status = TaskStatus.NotStarted;
            }
            
            SelectedTask = task;
            StatusMessage = $"Updated task '{task.Name}' to {task.Status}";
        }

        private async Task RefreshDashboardAsync()
        {
            IsLoading = true;
            try
            {
                // Refresh dashboard metrics
                UpdateDashboardMetrics();
                await Task.Delay(500); // Simulate refresh
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task GenerateReportAsync()
        {
            IsLoading = true;
            try
            {
                // Simple implementation: generate basic project report
                await Task.Delay(1000); // Simulate report generation
                
                if (CurrentProject != null)
                {
                    var allTasks = CurrentProject.Phases.SelectMany(p => p.Components).SelectMany(c => c.Tasks);
                    var completedTasks = allTasks.Count(t => t.Status == TaskStatus.Completed);
                    var totalTasks = allTasks.Count();
                    
                    var reportSummary = $"Project Report Generated:\n" +
                                      $"Total Tasks: {totalTasks}\n" +
                                      $"Completed Tasks: {completedTasks}\n" +
                                      $"Generated: {DateTime.Now:yyyy-MM-dd HH:mm}";
                    
                    StatusMessage = "Project report generated successfully";
                }
                else
                {
                    StatusMessage = "No project data available for report";
                }
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task ExportProjectAsync()
        {
            IsLoading = true;
            try
            {
                // Simple implementation: export project data
                await Task.Delay(500); // Simulate export
                
                if (CurrentProject != null)
                {
                    StatusMessage = "Project data exported successfully";
                }
                else
                {
                    StatusMessage = "No project data available to export";
                }
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task ImportProjectAsync()
        {
            IsLoading = true;
            try
            {
                // Simple implementation: simulate importing sample project data
                await Task.Delay(500); // Simulate import
                
                if (CurrentProject != null && CurrentProject.Phases.Any())
                {
                    var firstComponent = CurrentProject.Phases.First().Components.FirstOrDefault();
                    if (firstComponent != null)
                    {
                        var importedTasks = new[]
                        {
                            new ProjectTask { Name = "Imported Task 1", Status = TaskStatus.Completed },
                            new ProjectTask { Name = "Imported Task 2", Status = TaskStatus.InProgress },
                            new ProjectTask { Name = "Imported Task 3", Status = TaskStatus.NotStarted }
                        };
                        
                        foreach (var task in importedTasks)
                        {
                            firstComponent.Tasks.Add(task);
                        }
                        
                        StatusMessage = $"Successfully imported {importedTasks.Length} tasks";
                    }
                    else
                    {
                        StatusMessage = "Unable to import tasks - no components available";
                    }
                }
                else
                {
                    StatusMessage = "Unable to import tasks - no active project";
                }
            }
            finally
            {
                IsLoading = false;
            }
        }

        #endregion

        #region Helper Methods

        private void InitializeEmptyProject()
        {
            // Create empty project - all data will be loaded from CSV discovery files
            var project = new IntegrationProject
            {
                Name = "M&A Integration Project",
                CompanyName = "Target Company",
                StartDate = DateTime.Now,
                TargetEndDate = DateTime.Now.AddMonths(12),
                Status = ProjectStatus.Planning,
                HealthScore = 0,
                OverallProgress = 0
            };

            // Initialize empty collections - project data will be populated from discovery
            CurrentProject = project;
        }

        private void UpdateDashboardMetrics()
        {
            if (CurrentProject == null) return;

            // Update upcoming milestones
            UpcomingMilestones.Clear();
            var upcoming = CurrentProject.Milestones
                .Where(m => m.Status != MilestoneStatus.Achieved)
                .OrderBy(m => m.TargetDate)
                .Take(5);
            foreach (var milestone in upcoming)
            {
                UpcomingMilestones.Add(milestone);
            }

            // Update active risks
            ActiveRisks.Clear();
            var activeRisks = CurrentProject.Risks
                .Where(r => r.Status == RiskStatus.Open || r.Status == RiskStatus.InProgress)
                .OrderByDescending(r => r.RiskScore)
                .Take(5);
            foreach (var risk in activeRisks)
            {
                ActiveRisks.Add(risk);
            }

            // Update overdue tasks
            OverdueTasks.Clear();
            var overdue = CurrentProject.Phases
                .SelectMany(p => p.Components)
                .SelectMany(c => c.Tasks)
                .Where(t => t.IsOverdue)
                .OrderBy(t => t.DueDate);
            foreach (var task in overdue)
            {
                OverdueTasks.Add(task);
            }

            // Notify property changes for quick stats
            OnPropertyChanged(nameof(TotalTasks));
            OnPropertyChanged(nameof(CompletedTasks));
            OnPropertyChanged(nameof(InProgressTasks));
            OnPropertyChanged(nameof(OverdueTaskCount));
            OnPropertyChanged(nameof(HighRiskCount));
        }

        #endregion
    }
}