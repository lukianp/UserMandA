using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Data;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Utilities;

namespace MandADiscoverySuite.ViewModels
{
    public class TaskSchedulerViewModel : BaseViewModel
    {
        private readonly ITaskSchedulerService _taskSchedulerService;
        private ScheduledTask _selectedTask;
        private TaskTemplate _selectedTemplate;
        private string _searchTerm;
        private bool _showOnlyDiscoveryTasks;
        private readonly ICollectionView _tasksView;
        private readonly ICollectionView _templatesView;

        public ObservableCollection<ScheduledTask> Tasks { get; }
        public ObservableCollection<TaskTemplate> Templates { get; }
        public ObservableCollection<string> TaskStatuses { get; }
        public ObservableCollection<TriggerType> TriggerTypes { get; }
        public ObservableCollection<ActionType> ActionTypes { get; }

        public ScheduledTask SelectedTask
        {
            get => _selectedTask;
            set => SetProperty(ref _selectedTask, value);
        }

        public TaskTemplate SelectedTemplate
        {
            get => _selectedTemplate;
            set => SetProperty(ref _selectedTemplate, value);
        }

        public string SearchTerm
        {
            get => _searchTerm;
            set
            {
                if (SetProperty(ref _searchTerm, value))
                {
                    _tasksView?.Refresh();
                }
            }
        }

        public bool ShowOnlyDiscoveryTasks
        {
            get => _showOnlyDiscoveryTasks;
            set
            {
                if (SetProperty(ref _showOnlyDiscoveryTasks, value))
                {
                    _tasksView?.Refresh();
                }
            }
        }

        public ICollectionView TasksView => _tasksView;
        public ICollectionView TemplatesView => _templatesView;

        public ICommand LoadTasksCommand { get; private set; }
        public ICommand CreateTaskCommand { get; private set; }
        public ICommand UpdateTaskCommand { get; private set; }
        public ICommand DeleteTaskCommand { get; private set; }
        public ICommand RunTaskCommand { get; private set; }
        public ICommand StopTaskCommand { get; private set; }
        public ICommand EnableTaskCommand { get; private set; }
        public ICommand DisableTaskCommand { get; private set; }
        public ICommand CreateFromTemplateCommand { get; private set; }
        public ICommand SaveTemplateCommand { get; private set; }
        public ICommand DeleteTemplateCommand { get; private set; }
        public ICommand CreateDiscoveryTaskCommand { get; private set; }
        public ICommand ExportTaskCommand { get; private set; }
        public ICommand ImportTaskCommand { get; private set; }
        public ICommand BackupTasksCommand { get; private set; }
        public ICommand ViewTaskHistoryCommand { get; private set; }
        public ICommand RefreshCommand { get; private set; }

        // New task creation properties
        public NewTaskModel NewTask { get; }

        public TaskSchedulerViewModel(ITaskSchedulerService taskSchedulerService)
        {
            _taskSchedulerService = taskSchedulerService ?? throw new ArgumentNullException(nameof(taskSchedulerService));

            Tasks = new ObservableCollection<ScheduledTask>();
            Templates = new ObservableCollection<TaskTemplate>();
            TaskStatuses = new ObservableCollection<string>(Enum.GetNames(typeof(ScheduledTaskStatus)));
            TriggerTypes = new ObservableCollection<TriggerType>(Enum.GetValues<TriggerType>());
            ActionTypes = new ObservableCollection<ActionType>(Enum.GetValues<ActionType>());

            NewTask = new NewTaskModel();

            _tasksView = CollectionViewSource.GetDefaultView(Tasks);
            _tasksView.Filter = TasksFilter;
            _tasksView.SortDescriptions.Add(new SortDescription(nameof(ScheduledTask.Name), ListSortDirection.Ascending));

            _templatesView = CollectionViewSource.GetDefaultView(Templates);
            _templatesView.SortDescriptions.Add(new SortDescription(nameof(TaskTemplate.Category), ListSortDirection.Ascending));
            _templatesView.SortDescriptions.Add(new SortDescription(nameof(TaskTemplate.Name), ListSortDirection.Ascending));

            InitializeCommands();
            SubscribeToServiceEvents();
            LoadData();
        }

        protected override void InitializeCommands()
        {
            base.InitializeCommands();

            LoadTasksCommand = new AsyncRelayCommand(LoadTasksAsync, () => !IsLoading);
            CreateTaskCommand = new AsyncRelayCommand(CreateTaskAsync, CanCreateTask);
            UpdateTaskCommand = new AsyncRelayCommand(UpdateTaskAsync, CanUpdateTask);
            DeleteTaskCommand = new AsyncRelayCommand(DeleteTaskAsync, CanDeleteTask);
            RunTaskCommand = new AsyncRelayCommand(RunTaskAsync, CanRunTask);
            StopTaskCommand = new AsyncRelayCommand(StopTaskAsync, CanStopTask);
            EnableTaskCommand = new AsyncRelayCommand(EnableTaskAsync, CanEnableTask);
            DisableTaskCommand = new AsyncRelayCommand(DisableTaskAsync, CanDisableTask);
            CreateFromTemplateCommand = new AsyncRelayCommand(CreateFromTemplateAsync, CanCreateFromTemplate);
            SaveTemplateCommand = new AsyncRelayCommand(SaveTemplateAsync, CanSaveTemplate);
            DeleteTemplateCommand = new AsyncRelayCommand(DeleteTemplateAsync, CanDeleteTemplate);
            CreateDiscoveryTaskCommand = new AsyncRelayCommand(CreateDiscoveryTaskAsync, CanCreateDiscoveryTask);
            ExportTaskCommand = new AsyncRelayCommand(ExportTaskAsync, CanExportTask);
            ImportTaskCommand = new AsyncRelayCommand(ImportTaskAsync, () => true);
            BackupTasksCommand = new AsyncRelayCommand(BackupTasksAsync, () => Tasks.Any());
            ViewTaskHistoryCommand = new AsyncRelayCommand(ViewTaskHistoryAsync, CanViewTaskHistory);
            RefreshCommand = new AsyncRelayCommand(RefreshAsync, () => !IsLoading);
        }

        private void SubscribeToServiceEvents()
        {
            _taskSchedulerService.TaskCreated += OnTaskCreated;
            _taskSchedulerService.TaskDeleted += OnTaskDeleted;
            _taskSchedulerService.TaskStarted += OnTaskStarted;
            _taskSchedulerService.TaskCompleted += OnTaskCompleted;
            _taskSchedulerService.TaskFailed += OnTaskFailed;
        }

        private async void LoadData()
        {
            await LoadTasksAsync();
            await LoadTemplatesAsync();
        }

        private async Task LoadTasksAsync()
        {
            try
            {
                IsLoading = true;
                var tasks = await _taskSchedulerService.GetAllTasksAsync();
                
                Tasks.Clear();
                foreach (var task in tasks)
                {
                    Tasks.Add(task);
                }

                OnPropertyChanged(nameof(TasksView));
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to load tasks: {ex.Message}";
                StatusMessage = "Failed to load tasks";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task LoadTemplatesAsync()
        {
            try
            {
                var templates = await _taskSchedulerService.GetTaskTemplatesAsync();
                
                Templates.Clear();
                foreach (var template in templates)
                {
                    Templates.Add(template);
                }

                OnPropertyChanged(nameof(TemplatesView));
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to load templates: {ex.Message}";
                StatusMessage = "Failed to load templates";
            }
        }

        private async Task CreateTaskAsync()
        {
            try
            {
                if (!ValidateNewTask())
                    return;

                IsLoading = true;

                var task = await _taskSchedulerService.CreateTaskAsync(
                    NewTask.Name,
                    NewTask.Action,
                    NewTask.Trigger,
                    NewTask.Settings
                );

                if (task != null)
                {
                    Tasks.Add(task);
                    SelectedTask = task;
                    ResetNewTask();
                    StatusMessage = $"Task '{task.Name}' created successfully";
                }
                else
                {
                    HasErrors = true;
                    ErrorMessage = "Failed to create task";
                    StatusMessage = "Task creation failed";
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to create task: {ex.Message}";
                StatusMessage = "Failed to create task";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task UpdateTaskAsync()
        {
            try
            {
                if (SelectedTask == null)
                    return;

                IsLoading = true;

                var success = await _taskSchedulerService.UpdateTaskAsync(SelectedTask);
                if (success)
                {
                    StatusMessage = $"Task '{SelectedTask.Name}' updated successfully";
                    await LoadTasksAsync(); // Refresh to get updated task data
                }
                else
                {
                    HasErrors = true;
                    ErrorMessage = "Failed to update task";
                    StatusMessage = "Task update failed";
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to update task: {ex.Message}";
                StatusMessage = "Task update failed";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task DeleteTaskAsync()
        {
            try
            {
                if (SelectedTask == null)
                    return;

                var result = MessageBox.Show(
                    $"Are you sure you want to delete the task '{SelectedTask.Name}'?",
                    "Confirm Delete",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Question
                );

                if (result != MessageBoxResult.Yes)
                    return;

                IsLoading = true;

                var success = await _taskSchedulerService.DeleteTaskAsync(SelectedTask.Name);
                if (success)
                {
                    Tasks.Remove(SelectedTask);
                    SelectedTask = null;
                    StatusMessage = "Task deleted successfully";
                }
                else
                {
                    HasErrors = true;
                    ErrorMessage = "Failed to delete task";
                    StatusMessage = "Operation failed";
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to delete task: {ex.Message}";
                StatusMessage = "Operation failed";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task RunTaskAsync()
        {
            try
            {
                if (SelectedTask == null)
                    return;

                IsLoading = true;

                var success = await _taskSchedulerService.RunTaskAsync(SelectedTask.Name);
                if (success)
                {
                    StatusMessage = $"Task '{SelectedTask.Name}' started successfully";
                    await Task.Delay(1000); // Brief delay to allow task to start
                    await LoadTasksAsync(); // Refresh to get updated status
                }
                else
                {
                    HasErrors = true;
                    ErrorMessage = "Failed to start task";
                    StatusMessage = "Operation failed";
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to start task: {ex.Message}";
                StatusMessage = "Operation failed";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task StopTaskAsync()
        {
            try
            {
                if (SelectedTask == null)
                    return;

                IsLoading = true;

                var success = await _taskSchedulerService.StopTaskAsync(SelectedTask.Name);
                if (success)
                {
                    StatusMessage = $"Task '{SelectedTask.Name}' stopped successfully";
                    await Task.Delay(1000); // Brief delay to allow task to stop
                    await LoadTasksAsync(); // Refresh to get updated status
                }
                else
                {
                    HasErrors = true;
                    ErrorMessage = "Failed to stop task";
                    StatusMessage = "Operation failed";
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to stop task: {ex.Message}";
                StatusMessage = "Operation failed";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task EnableTaskAsync()
        {
            try
            {
                if (SelectedTask == null)
                    return;

                IsLoading = true;

                var success = await _taskSchedulerService.EnableTaskAsync(SelectedTask.Name);
                if (success)
                {
                    SelectedTask.IsEnabled = true;
                    StatusMessage = $"Task '{SelectedTask.Name}' enabled successfully";
                }
                else
                {
                    HasErrors = true;
                    ErrorMessage = "Failed to enable task";
                    StatusMessage = "Operation failed";
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to enable task: {ex.Message}";
                StatusMessage = "Operation failed";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task DisableTaskAsync()
        {
            try
            {
                if (SelectedTask == null)
                    return;

                IsLoading = true;

                var success = await _taskSchedulerService.DisableTaskAsync(SelectedTask.Name);
                if (success)
                {
                    SelectedTask.IsEnabled = false;
                    StatusMessage = $"Task '{SelectedTask.Name}' disabled successfully";
                }
                else
                {
                    HasErrors = true;
                    ErrorMessage = "Failed to disable task";
                    StatusMessage = "Operation failed";
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to disable task: {ex.Message}";
                StatusMessage = "Operation failed";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task CreateFromTemplateAsync()
        {
            try
            {
                if (SelectedTemplate == null || string.IsNullOrWhiteSpace(NewTask.Name))
                    return;

                IsLoading = true;

                var parameters = new Dictionary<string, object>();
                if (!string.IsNullOrWhiteSpace(NewTask.ModuleName))
                    parameters["ModuleName"] = NewTask.ModuleName;
                if (!string.IsNullOrWhiteSpace(NewTask.CompanyProfile))
                    parameters["CompanyProfile"] = NewTask.CompanyProfile;

                var task = await _taskSchedulerService.CreateTaskFromTemplateAsync(
                    SelectedTemplate.Id,
                    NewTask.Name,
                    parameters
                );

                if (task != null)
                {
                    Tasks.Add(task);
                    SelectedTask = task;
                    ResetNewTask();
                    StatusMessage = $"Task '{task.Name}' created from template successfully";
                }
                else
                {
                    HasErrors = true;
                    ErrorMessage = "Failed to create task from template";
                    StatusMessage = "Operation failed";
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to create task from template: {ex.Message}";
                StatusMessage = "Operation failed";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task SaveTemplateAsync()
        {
            try
            {
                if (SelectedTask == null)
                    return;

                // Create a new template from the selected task
                var template = new TaskTemplate
                {
                    Name = $"{SelectedTask.Name} Template",
                    Description = $"Template based on task '{SelectedTask.Name}'",
                    Category = "Custom",
                    DefaultAction = SelectedTask.Action,
                    DefaultTrigger = SelectedTask.Trigger,
                    DefaultSettings = SelectedTask.Settings
                };

                IsLoading = true;

                var success = await _taskSchedulerService.SaveTaskTemplateAsync(template);
                if (success)
                {
                    Templates.Add(template);
                    StatusMessage = $"Template '{template.Name}' saved successfully";
                }
                else
                {
                    HasErrors = true;
                    ErrorMessage = "Failed to save template";
                    StatusMessage = "Operation failed";
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to save template: {ex.Message}";
                StatusMessage = "Operation failed";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task DeleteTemplateAsync()
        {
            try
            {
                if (SelectedTemplate == null)
                    return;

                var result = MessageBox.Show(
                    $"Are you sure you want to delete the template '{SelectedTemplate.Name}'?",
                    "Confirm Delete",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Question
                );

                if (result != MessageBoxResult.Yes)
                    return;

                IsLoading = true;

                var success = await _taskSchedulerService.DeleteTaskTemplateAsync(SelectedTemplate.Id);
                if (success)
                {
                    Templates.Remove(SelectedTemplate);
                    SelectedTemplate = null;
                    StatusMessage = "Template deleted successfully";
                }
                else
                {
                    HasErrors = true;
                    ErrorMessage = "Failed to delete template";
                    StatusMessage = "Operation failed";
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to delete template: {ex.Message}";
                StatusMessage = "Operation failed";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task CreateDiscoveryTaskAsync()
        {
            try
            {
                if (string.IsNullOrWhiteSpace(NewTask.Name) ||
                    string.IsNullOrWhiteSpace(NewTask.ModuleName) ||
                    string.IsNullOrWhiteSpace(NewTask.CompanyProfile))
                {
                    HasErrors = true;
                    ErrorMessage = "Task name, module name, and company profile are required for discovery tasks";
                    StatusMessage = "Operation failed";
                    return;
                }

                IsLoading = true;

                var task = await _taskSchedulerService.CreateDiscoveryTaskAsync(
                    NewTask.Name,
                    NewTask.ModuleName,
                    NewTask.CompanyProfile,
                    NewTask.Trigger ?? CreateDefaultTrigger()
                );

                if (task != null)
                {
                    Tasks.Add(task);
                    SelectedTask = task;
                    ResetNewTask();
                    StatusMessage = $"Discovery task '{task.Name}' created successfully";
                }
                else
                {
                    HasErrors = true;
                    ErrorMessage = "Failed to create discovery task";
                    StatusMessage = "Operation failed";
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to create discovery task: {ex.Message}";
                StatusMessage = "Operation failed";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task ExportTaskAsync()
        {
            try
            {
                if (SelectedTask == null)
                    return;

                IsLoading = true;

                var xml = await _taskSchedulerService.ExportTaskAsync(SelectedTask.Name);
                if (!string.IsNullOrEmpty(xml))
                {
                    // Save to file (this would typically involve a file dialog in a real implementation)
                    var fileName = $"{SelectedTask.Name}.xml";
                    var filePath = System.IO.Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), fileName);
                    System.IO.File.WriteAllText(filePath, xml);
                    
                    StatusMessage = $"Task exported to {filePath}";
                }
                else
                {
                    HasErrors = true;
                    ErrorMessage = "Failed to export task";
                    StatusMessage = "Operation failed";
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to export task: {ex.Message}";
                StatusMessage = "Operation failed";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task ImportTaskAsync()
        {
            try
            {
                // This would typically involve a file dialog to select the XML file
                // For now, we'll just show a message
                StatusMessage = "Import task functionality would open a file dialog to select task XML file";
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to import task: {ex.Message}";
                StatusMessage = "Operation failed";
            }
        }

        private async Task BackupTasksAsync()
        {
            try
            {
                IsLoading = true;

                var backupPath = System.IO.Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.Desktop),
                    $"TaskBackup_{DateTime.Now:yyyyMMdd_HHmmss}.json"
                );

                var success = await _taskSchedulerService.BackupTasksAsync(backupPath);
                if (success)
                {
                    StatusMessage = $"Tasks backed up to {backupPath}";
                }
                else
                {
                    HasErrors = true;
                    ErrorMessage = "Failed to backup tasks";
                    StatusMessage = "Operation failed";
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to backup tasks: {ex.Message}";
                StatusMessage = "Operation failed";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task ViewTaskHistoryAsync()
        {
            try
            {
                if (SelectedTask == null)
                    return;

                IsLoading = true;

                var history = await _taskSchedulerService.GetTaskHistoryAsync(SelectedTask.Name);
                
                // This would typically open a detailed history window
                if (history.Any())
                {
                    StatusMessage = $"Task '{SelectedTask.Name}' has {history.Count} history entries";
                }
                else
                {
                    StatusMessage = $"No history available for task '{SelectedTask.Name}'";
                }
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to load task history: {ex.Message}";
                StatusMessage = "Operation failed";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task RefreshAsync()
        {
            await LoadTasksAsync();
            await LoadTemplatesAsync();
        }

        // Command validation methods
        private bool CanCreateTask() => !IsLoading && !string.IsNullOrWhiteSpace(NewTask.Name);
        private bool CanUpdateTask() => !IsLoading && SelectedTask != null;
        private bool CanDeleteTask() => !IsLoading && SelectedTask != null;
        private bool CanRunTask() => !IsLoading && SelectedTask != null && SelectedTask.Status != ScheduledTaskStatus.Running;
        private bool CanStopTask() => !IsLoading && SelectedTask != null && SelectedTask.Status == ScheduledTaskStatus.Running;
        private bool CanEnableTask() => !IsLoading && SelectedTask != null && !SelectedTask.IsEnabled;
        private bool CanDisableTask() => !IsLoading && SelectedTask != null && SelectedTask.IsEnabled;
        private bool CanCreateFromTemplate() => !IsLoading && SelectedTemplate != null && !string.IsNullOrWhiteSpace(NewTask.Name);
        private bool CanSaveTemplate() => !IsLoading && SelectedTask != null;
        private bool CanDeleteTemplate() => !IsLoading && SelectedTemplate != null;
        private bool CanCreateDiscoveryTask() => !IsLoading && !string.IsNullOrWhiteSpace(NewTask.Name) && !string.IsNullOrWhiteSpace(NewTask.ModuleName);
        private bool CanExportTask() => !IsLoading && SelectedTask != null;
        private bool CanViewTaskHistory() => !IsLoading && SelectedTask != null;

        private bool TasksFilter(object obj)
        {
            if (!(obj is ScheduledTask task))
                return false;

            // Search term filter
            if (!string.IsNullOrWhiteSpace(SearchTerm))
            {
                var searchLower = SearchTerm.ToLower();
                if (!task.Name?.ToLower().Contains(searchLower) == true &&
                    !task.Description?.ToLower().Contains(searchLower) == true)
                {
                    return false;
                }
            }

            // Discovery tasks filter
            if (ShowOnlyDiscoveryTasks)
            {
                return task.Name?.StartsWith("MandA_") == true || 
                       task.Action?.Executable?.Contains("MandADiscoverySuite.exe") == true;
            }

            return true;
        }

        private bool ValidateNewTask()
        {
            if (string.IsNullOrWhiteSpace(NewTask.Name))
            {
                HasErrors = true;
                ErrorMessage = "Task name is required";
                StatusMessage = "Operation failed";
                return false;
            }

            if (NewTask.Action == null || string.IsNullOrWhiteSpace(NewTask.Action.Executable))
            {
                HasErrors = true;
                ErrorMessage = "Task action and executable are required";
                StatusMessage = "Operation failed";
                return false;
            }

            if (NewTask.Trigger == null)
            {
                HasErrors = true;
                ErrorMessage = "Task trigger is required";
                StatusMessage = "Operation failed";
                return false;
            }

            return true;
        }

        private void ResetNewTask()
        {
            NewTask.Reset();
        }

        private TaskTrigger CreateDefaultTrigger()
        {
            return new TaskTrigger
            {
                Type = TriggerType.Daily,
                StartDate = DateTime.Today.AddDays(1),
                TimeOfDay = new TimeSpan(2, 0, 0)
            };
        }

        // Event handlers
        private void OnTaskCreated(object sender, TaskEventArgs e)
        {
            StatusMessage = $"Task '{e.TaskName}' created: {e.Message}";
        }

        private void OnTaskDeleted(object sender, TaskEventArgs e)
        {
            StatusMessage = $"Task '{e.TaskName}' deleted: {e.Message}";
        }

        private void OnTaskStarted(object sender, TaskEventArgs e)
        {
            StatusMessage = $"Task '{e.TaskName}' started: {e.Message}";
        }

        private void OnTaskCompleted(object sender, TaskEventArgs e)
        {
            StatusMessage = $"Task '{e.TaskName}' completed: {e.Message}";
        }

        private void OnTaskFailed(object sender, TaskEventArgs e)
        {
            HasErrors = true;
            ErrorMessage = $"Task '{e.TaskName}' failed: {e.Message}";
            StatusMessage = "Operation failed";
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _taskSchedulerService.TaskCreated -= OnTaskCreated;
                _taskSchedulerService.TaskDeleted -= OnTaskDeleted;
                _taskSchedulerService.TaskStarted -= OnTaskStarted;
                _taskSchedulerService.TaskCompleted -= OnTaskCompleted;
                _taskSchedulerService.TaskFailed -= OnTaskFailed;
            }

            base.Dispose(disposing);
        }
    }

    public class NewTaskModel : INotifyPropertyChanged
    {
        private string _name;
        private string _description;
        private string _moduleName;
        private string _companyProfile;
        private TaskAction _action;
        private TaskTrigger _trigger;
        private TaskSettings _settings;

        public string Name
        {
            get => _name;
            set => SetProperty(ref _name, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public string ModuleName
        {
            get => _moduleName;
            set => SetProperty(ref _moduleName, value);
        }

        public string CompanyProfile
        {
            get => _companyProfile;
            set => SetProperty(ref _companyProfile, value);
        }

        public TaskAction Action
        {
            get => _action;
            set => SetProperty(ref _action, value);
        }

        public TaskTrigger Trigger
        {
            get => _trigger;
            set => SetProperty(ref _trigger, value);
        }

        public TaskSettings Settings
        {
            get => _settings;
            set => SetProperty(ref _settings, value);
        }

        public NewTaskModel()
        {
            Reset();
        }

        public void Reset()
        {
            Name = string.Empty;
            Description = string.Empty;
            ModuleName = string.Empty;
            CompanyProfile = string.Empty;
            Action = new TaskAction();
            Trigger = new TaskTrigger();
            Settings = new TaskSettings();
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (object.Equals(storage, value)) return false;
            storage = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }
}