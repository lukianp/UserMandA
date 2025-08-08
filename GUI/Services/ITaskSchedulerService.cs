using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Interface for Task Scheduler service operations
    /// </summary>
    public interface ITaskSchedulerService
    {
        // Task Management
        Task<List<ScheduledTask>> GetAllTasksAsync();
        Task<ScheduledTask> GetTaskAsync(string taskName);
        Task<ScheduledTask> CreateTaskAsync(string taskName, TaskAction action, TaskTrigger trigger, TaskSettings settings = null);
        Task<bool> UpdateTaskAsync(ScheduledTask task);
        Task<bool> DeleteTaskAsync(string taskName);
        Task<bool> EnableTaskAsync(string taskName);
        Task<bool> DisableTaskAsync(string taskName);

        // Task Execution
        Task<bool> RunTaskAsync(string taskName);
        Task<bool> StopTaskAsync(string taskName);
        Task<TaskResult> GetLastRunResultAsync(string taskName);
        Task<DateTime> GetNextRunTimeAsync(string taskName);

        // Task History
        Task<List<TaskHistory>> GetTaskHistoryAsync(string taskName, int maxEntries = 50);
        Task<bool> ClearTaskHistoryAsync(string taskName);

        // Task Templates
        Task<List<TaskTemplate>> GetTaskTemplatesAsync();
        Task<ScheduledTask> CreateTaskFromTemplateAsync(string templateId, string taskName, Dictionary<string, object> parameters = null);
        Task<bool> SaveTaskTemplateAsync(TaskTemplate template);
        Task<bool> DeleteTaskTemplateAsync(string templateId);

        // Discovery-specific Tasks
        Task<ScheduledTask> CreateDiscoveryTaskAsync(string taskName, string moduleName, string companyProfile, TaskTrigger trigger);
        Task<List<ScheduledTask>> GetDiscoveryTasksAsync();
        Task<bool> ScheduleRecurringDiscoveryAsync(string moduleName, string companyProfile, TriggerType triggerType, Dictionary<string, object> scheduleOptions = null);

        // Task Validation
        Task<bool> ValidateTaskAsync(ScheduledTask task);
        Task<List<string>> GetValidationErrorsAsync(ScheduledTask task);
        Task<bool> IsTaskNameAvailableAsync(string taskName);

        // System Information
        Task<bool> IsTaskSchedulerAvailableAsync();
        Task<string> GetTaskSchedulerVersionAsync();
        Task<List<string>> GetTaskFoldersAsync();

        // Import/Export
        Task<string> ExportTaskAsync(string taskName);
        Task<ScheduledTask> ImportTaskAsync(string taskXml, string newTaskName = null);
        Task<bool> BackupTasksAsync(string backupPath);
        Task<List<ScheduledTask>> RestoreTasksAsync(string backupPath);

        // Events
        event EventHandler<TaskEventArgs> TaskCreated;
        event EventHandler<TaskEventArgs> TaskDeleted;
        event EventHandler<TaskEventArgs> TaskStarted;
        event EventHandler<TaskEventArgs> TaskCompleted;
        event EventHandler<TaskEventArgs> TaskFailed;
    }

    /// <summary>
    /// Event arguments for task-related events
    /// </summary>
    public class TaskEventArgs : EventArgs
    {
        public string TaskName { get; set; }
        public ScheduledTask Task { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
        public Exception Exception { get; set; }

        public TaskEventArgs()
        {
            Timestamp = DateTime.Now;
        }

        public TaskEventArgs(string taskName, string message) : this()
        {
            TaskName = taskName;
            Message = message;
        }

        public TaskEventArgs(ScheduledTask task, string message) : this()
        {
            Task = task;
            TaskName = task?.Name;
            Message = message;
        }
    }
}