using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Diagnostics;
using MandADiscoverySuite.Models;
using System.Text.Json;
using System.Text;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Implementation of Task Scheduler service using Windows schtasks.exe command line tool
    /// </summary>
    public class TaskSchedulerService : ITaskSchedulerService
    {
        private readonly string _templatesPath;
        private readonly string _backupPath;
        private readonly object _lockObject = new object();

        // Events
        public event EventHandler<TaskEventArgs> TaskCreated;
        public event EventHandler<TaskEventArgs> TaskDeleted;
        public event EventHandler<TaskEventArgs> TaskStarted;
        public event EventHandler<TaskEventArgs> TaskCompleted;
        public event EventHandler<TaskEventArgs> TaskFailed;

        public TaskSchedulerService()
        {
            var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            var appFolder = Path.Combine(appData, "MandADiscoverySuite");
            _templatesPath = Path.Combine(appFolder, "TaskTemplates");
            _backupPath = Path.Combine(appFolder, "TaskBackups");
            
            Directory.CreateDirectory(_templatesPath);
            Directory.CreateDirectory(_backupPath);
            
            InitializeDefaultTemplates();
        }

        #region Task Management

        public async Task<List<ScheduledTask>> GetAllTasksAsync()
        {
            return await Task.Run(() =>
            {
                var tasks = new List<ScheduledTask>();
                
                try
                {
                    var result = ExecuteSchTasksCommand("schtasks /query /fo csv /v");
                    if (!string.IsNullOrEmpty(result))
                    {
                        tasks = ParseTaskListFromCsv(result);
                    }
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error getting tasks: {ex.Message}");
                }

                return tasks.Where(t => t.Name.StartsWith("MandA_") || t.Name.Contains("Discovery")).OrderBy(t => t.Name).ToList();
            });
        }

        public async Task<ScheduledTask> GetTaskAsync(string taskName)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var result = ExecuteSchTasksCommand($"schtasks /query /tn \"{taskName}\" /fo csv /v");
                    if (!string.IsNullOrEmpty(result))
                    {
                        var tasks = ParseTaskListFromCsv(result);
                        return tasks.FirstOrDefault();
                    }
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error getting task '{taskName}': {ex.Message}");
                }
                return null;
            });
        }

        public async Task<ScheduledTask> CreateTaskAsync(string taskName, TaskAction action, TaskTrigger trigger, TaskSettings settings = null)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var command = BuildCreateTaskCommand(taskName, action, trigger, settings ?? new TaskSettings());
                    var result = ExecuteSchTasksCommand(command);
                    
                    if (!string.IsNullOrEmpty(result) && !result.Contains("ERROR"))
                    {
                        TaskCreated?.Invoke(this, new TaskEventArgs(taskName, "Task created successfully"));
                        return GetTaskAsync(taskName).Result;
                    }
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error creating task '{taskName}': {ex.Message}");
                    TaskFailed?.Invoke(this, new TaskEventArgs(taskName, $"Failed to create task: {ex.Message}"));
                }
                return null;
            });
        }

        public async Task<bool> UpdateTaskAsync(ScheduledTask task)
        {
            return await Task.Run(() =>
            {
                try
                {
                    // Delete existing task and recreate it
                    var deleteResult = ExecuteSchTasksCommand($"schtasks /delete /tn \"{task.Name}\" /f");
                    if (!deleteResult.Contains("ERROR"))
                    {
                        var newTask = CreateTaskAsync(task.Name, task.Action, task.Trigger, task.Settings).Result;
                        return newTask != null;
                    }
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error updating task '{task.Name}': {ex.Message}");
                }
                return false;
            });
        }

        public async Task<bool> DeleteTaskAsync(string taskName)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var result = ExecuteSchTasksCommand($"schtasks /delete /tn \"{taskName}\" /f");
                    if (!result.Contains("ERROR"))
                    {
                        TaskDeleted?.Invoke(this, new TaskEventArgs(taskName, "Task deleted successfully"));
                        return true;
                    }
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error deleting task '{taskName}': {ex.Message}");
                }
                return false;
            });
        }

        public async Task<bool> EnableTaskAsync(string taskName)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var result = ExecuteSchTasksCommand($"schtasks /change /tn \"{taskName}\" /enable");
                    return !result.Contains("ERROR");
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error enabling task '{taskName}': {ex.Message}");
                    return false;
                }
            });
        }

        public async Task<bool> DisableTaskAsync(string taskName)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var result = ExecuteSchTasksCommand($"schtasks /change /tn \"{taskName}\" /disable");
                    return !result.Contains("ERROR");
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error disabling task '{taskName}': {ex.Message}");
                    return false;
                }
            });
        }

        #endregion

        #region Task Execution

        public async Task<bool> RunTaskAsync(string taskName)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var result = ExecuteSchTasksCommand($"schtasks /run /tn \"{taskName}\"");
                    if (!result.Contains("ERROR"))
                    {
                        TaskStarted?.Invoke(this, new TaskEventArgs(taskName, "Task started"));
                        return true;
                    }
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error running task '{taskName}': {ex.Message}");
                    TaskFailed?.Invoke(this, new TaskEventArgs(taskName, $"Failed to run task: {ex.Message}"));
                }
                return false;
            });
        }

        public async Task<bool> StopTaskAsync(string taskName)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var result = ExecuteSchTasksCommand($"schtasks /end /tn \"{taskName}\"");
                    return !result.Contains("ERROR");
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error stopping task '{taskName}': {ex.Message}");
                    return false;
                }
            });
        }

        public async Task<TaskResult> GetLastRunResultAsync(string taskName)
        {
            var task = await GetTaskAsync(taskName);
            return task?.LastRunResult ?? TaskResult.None;
        }

        public async Task<DateTime> GetNextRunTimeAsync(string taskName)
        {
            var task = await GetTaskAsync(taskName);
            return task?.NextRunTime ?? DateTime.MinValue;
        }

        #endregion

        #region Task History

        public async Task<List<TaskHistory>> GetTaskHistoryAsync(string taskName, int maxEntries = 50)
        {
            return await Task.Run(() =>
            {
                var history = new List<TaskHistory>();
                // Note: Getting detailed task history via schtasks is limited
                // This would require parsing Windows Event Log for more detailed information
                return history;
            });
        }

        public async Task<bool> ClearTaskHistoryAsync(string taskName)
        {
            // Not directly supported by schtasks command
            return await Task.FromResult(false);
        }

        #endregion

        #region Discovery-specific Tasks

        public async Task<ScheduledTask> CreateDiscoveryTaskAsync(string taskName, string moduleName, string companyProfile, TaskTrigger trigger)
        {
            var action = new TaskAction
            {
                Type = ActionType.Execute,
                Executable = @"C:\enterprisediscovery\MandADiscoverySuite.exe",
                Arguments = $"--module \"{moduleName}\" --profile \"{companyProfile}\" --automated",
                WorkingDirectory = @"C:\enterprisediscovery\"
            };

            var settings = new TaskSettings
            {
                AllowDemandStart = true,
                StartWhenAvailable = true,
                RunOnlyWhenLoggedOn = false
            };

            return await CreateTaskAsync(taskName, action, trigger, settings);
        }

        public async Task<List<ScheduledTask>> GetDiscoveryTasksAsync()
        {
            var allTasks = await GetAllTasksAsync();
            return allTasks.Where(t => t.Action?.Executable?.Contains("MandADiscoverySuite.exe") == true).ToList();
        }

        public async Task<bool> ScheduleRecurringDiscoveryAsync(string moduleName, string companyProfile, TriggerType triggerType, Dictionary<string, object> scheduleOptions = null)
        {
            var taskName = $"MandA_Discovery_{moduleName}_{companyProfile}_{DateTime.Now:yyyyMMddHHmmss}";
            
            var trigger = new TaskTrigger
            {
                Type = triggerType,
                StartDate = DateTime.Today.AddDays(1),
                TimeOfDay = new TimeSpan(2, 0, 0)
            };

            if (scheduleOptions != null)
            {
                if (scheduleOptions.ContainsKey("DaysOfWeek"))
                    trigger.DaysOfWeek = (DaysOfWeek)scheduleOptions["DaysOfWeek"];
                if (scheduleOptions.ContainsKey("IntervalDays"))
                    trigger.IntervalDays = (int)scheduleOptions["IntervalDays"];
                if (scheduleOptions.ContainsKey("TimeOfDay"))
                    trigger.TimeOfDay = (TimeSpan)scheduleOptions["TimeOfDay"];
            }

            var task = await CreateDiscoveryTaskAsync(taskName, moduleName, companyProfile, trigger);
            return task != null;
        }

        #endregion

        #region Task Templates

        public async Task<List<TaskTemplate>> GetTaskTemplatesAsync()
        {
            return await Task.Run(() =>
            {
                var templates = new List<TaskTemplate>();
                
                try
                {
                    var files = Directory.GetFiles(_templatesPath, "*.json");
                    foreach (var file in files)
                    {
                        try
                        {
                            var json = File.ReadAllText(file);
                            var template = JsonSerializer.Deserialize<TaskTemplate>(json);
                            if (template != null)
                            {
                                templates.Add(template);
                            }
                        }
                        catch (Exception ex)
                        {
                            Debug.WriteLine($"Error loading template from '{file}': {ex.Message}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error getting task templates: {ex.Message}");
                }

                return templates.OrderBy(t => t.Category).ThenBy(t => t.Name).ToList();
            });
        }

        public async Task<ScheduledTask> CreateTaskFromTemplateAsync(string templateId, string taskName, Dictionary<string, object> parameters = null)
        {
            var templates = await GetTaskTemplatesAsync();
            var template = templates.FirstOrDefault(t => t.Id == templateId);
            
            if (template == null) return null;

            var action = JsonSerializer.Deserialize<TaskAction>(JsonSerializer.Serialize(template.DefaultAction));
            var trigger = JsonSerializer.Deserialize<TaskTrigger>(JsonSerializer.Serialize(template.DefaultTrigger));
            var settings = JsonSerializer.Deserialize<TaskSettings>(JsonSerializer.Serialize(template.DefaultSettings));

            if (parameters != null)
            {
                ApplyParametersToAction(action, parameters);
            }

            return await CreateTaskAsync(taskName, action, trigger, settings);
        }

        public async Task<bool> SaveTaskTemplateAsync(TaskTemplate template)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var filePath = Path.Combine(_templatesPath, $"{template.Id}.json");
                    var json = JsonSerializer.Serialize(template, new JsonSerializerOptions { WriteIndented = true });
                    File.WriteAllText(filePath, json);
                    return true;
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error saving task template: {ex.Message}");
                    return false;
                }
            });
        }

        public async Task<bool> DeleteTaskTemplateAsync(string templateId)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var filePath = Path.Combine(_templatesPath, $"{templateId}.json");
                    if (File.Exists(filePath))
                    {
                        File.Delete(filePath);
                        return true;
                    }
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error deleting task template: {ex.Message}");
                }
                return false;
            });
        }

        #endregion

        #region Task Validation

        public async Task<bool> ValidateTaskAsync(ScheduledTask task)
        {
            var errors = await GetValidationErrorsAsync(task);
            return errors.Count == 0;
        }

        public async Task<List<string>> GetValidationErrorsAsync(ScheduledTask task)
        {
            return await Task.Run(() =>
            {
                var errors = new List<string>();

                if (string.IsNullOrWhiteSpace(task.Name))
                    errors.Add("Task name is required");

                if (task.Action == null)
                    errors.Add("Task action is required");
                else if (task.Action.Type == ActionType.Execute && string.IsNullOrWhiteSpace(task.Action.Executable))
                    errors.Add("Executable path is required for execute actions");

                if (task.Trigger == null)
                    errors.Add("Task trigger is required");

                return errors;
            });
        }

        public async Task<bool> IsTaskNameAvailableAsync(string taskName)
        {
            var task = await GetTaskAsync(taskName);
            return task == null;
        }

        #endregion

        #region System Information

        public async Task<bool> IsTaskSchedulerAvailableAsync()
        {
            return await Task.Run(() =>
            {
                try
                {
                    var result = ExecuteSchTasksCommand("schtasks /?");
                    return !string.IsNullOrEmpty(result);
                }
                catch
                {
                    return false;
                }
            });
        }

        public async Task<string> GetTaskSchedulerVersionAsync()
        {
            return await Task.FromResult("Windows Task Scheduler");
        }

        public async Task<List<string>> GetTaskFoldersAsync()
        {
            return await Task.FromResult(new List<string> { "\\" });
        }

        #endregion

        #region Import/Export

        public async Task<string> ExportTaskAsync(string taskName)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var xmlPath = Path.GetTempFileName() + ".xml";
                    var result = ExecuteSchTasksCommand($"schtasks /query /tn \"{taskName}\" /xml > \"{xmlPath}\"");
                    
                    if (File.Exists(xmlPath))
                    {
                        var xml = File.ReadAllText(xmlPath);
                        File.Delete(xmlPath);
                        return xml;
                    }
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error exporting task '{taskName}': {ex.Message}");
                }
                return null;
            });
        }

        public async Task<ScheduledTask> ImportTaskAsync(string taskXml, string newTaskName = null)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var xmlPath = Path.GetTempFileName() + ".xml";
                    File.WriteAllText(xmlPath, taskXml);
                    
                    var taskName = newTaskName ?? "ImportedTask";
                    var result = ExecuteSchTasksCommand($"schtasks /create /tn \"{taskName}\" /xml \"{xmlPath}\"");
                    
                    File.Delete(xmlPath);
                    
                    if (!result.Contains("ERROR"))
                    {
                        return GetTaskAsync(taskName).Result;
                    }
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error importing task: {ex.Message}");
                }
                return null;
            });
        }

        public async Task<bool> BackupTasksAsync(string backupPath)
        {
            return await Task.Run(() =>
            {
                try
                {
                    var tasks = GetAllTasksAsync().Result;
                    var backup = tasks.Select(t => new { 
                        Task = t, 
                        Xml = ExportTaskAsync(t.Name).Result 
                    }).ToList();
                    
                    var json = JsonSerializer.Serialize(backup, new JsonSerializerOptions { WriteIndented = true });
                    File.WriteAllText(backupPath, json);
                    return true;
                }
                catch (Exception ex)
                {
                    Debug.WriteLine($"Error backing up tasks: {ex.Message}");
                    return false;
                }
            });
        }

        public async Task<List<ScheduledTask>> RestoreTasksAsync(string backupPath)
        {
            return await Task.FromResult(new List<ScheduledTask>());
        }

        #endregion

        #region Private Helper Methods

        private void InitializeDefaultTemplates()
        {
            Task.Run(async () =>
            {
                var templates = await GetTaskTemplatesAsync();
                if (templates.Count == 0)
                {
                    await CreateDefaultTemplates();
                }
            });
        }

        private async Task CreateDefaultTemplates()
        {
            var templates = new[]
            {
                new TaskTemplate
                {
                    Name = "Daily Discovery",
                    Description = "Run discovery modules daily",
                    Category = "Discovery",
                    DefaultAction = new TaskAction
                    {
                        Type = ActionType.Execute,
                        Executable = @"C:\enterprisediscovery\MandADiscoverySuite.exe",
                        Arguments = "--module {ModuleName} --profile {CompanyProfile} --automated"
                    },
                    DefaultTrigger = new TaskTrigger
                    {
                        Type = TriggerType.Daily,
                        TimeOfDay = new TimeSpan(2, 0, 0)
                    }
                },
                new TaskTemplate
                {
                    Name = "Weekly Full Discovery",
                    Description = "Run full discovery suite weekly",
                    Category = "Discovery",
                    DefaultAction = new TaskAction
                    {
                        Type = ActionType.Execute,
                        Executable = @"C:\enterprisediscovery\MandADiscoverySuite.exe",
                        Arguments = "--full-discovery --profile {CompanyProfile} --automated"
                    },
                    DefaultTrigger = new TaskTrigger
                    {
                        Type = TriggerType.Weekly,
                        DaysOfWeek = DaysOfWeek.Sunday,
                        TimeOfDay = new TimeSpan(1, 0, 0)
                    }
                }
            };

            foreach (var template in templates)
            {
                await SaveTaskTemplateAsync(template);
            }
        }

        private string ExecuteSchTasksCommand(string command)
        {
            try
            {
                var processStartInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = $"/c {command}",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (var process = Process.Start(processStartInfo))
                {
                    process.WaitForExit(30000); // 30 second timeout
                    var output = process.StandardOutput.ReadToEnd();
                    var error = process.StandardError.ReadToEnd();
                    
                    return !string.IsNullOrEmpty(error) ? $"ERROR: {error}" : output;
                }
            }
            catch (Exception ex)
            {
                return $"ERROR: {ex.Message}";
            }
        }

        private string BuildCreateTaskCommand(string taskName, TaskAction action, TaskTrigger trigger, TaskSettings settings)
        {
            var sb = new StringBuilder();
            sb.Append($"schtasks /create /tn \"{taskName}\"");
            
            // Add executable and arguments
            if (action.Type == ActionType.Execute)
            {
                sb.Append($" /tr \"\\\"{action.Executable}\\\" {action.Arguments}\"");
            }

            // Add trigger
            switch (trigger.Type)
            {
                case TriggerType.Once:
                    sb.Append($" /sc once /st {trigger.TimeOfDay:hh\\:mm} /sd {trigger.StartDate:MM/dd/yyyy}");
                    break;
                case TriggerType.Daily:
                    sb.Append($" /sc daily /st {trigger.TimeOfDay:hh\\:mm} /sd {trigger.StartDate:MM/dd/yyyy}");
                    break;
                case TriggerType.Weekly:
                    sb.Append($" /sc weekly /st {trigger.TimeOfDay:hh\\:mm} /sd {trigger.StartDate:MM/dd/yyyy}");
                    if (trigger.DaysOfWeek != DaysOfWeek.None)
                    {
                        sb.Append($" /d {FormatDaysOfWeek(trigger.DaysOfWeek)}");
                    }
                    break;
                case TriggerType.Monthly:
                    sb.Append($" /sc monthly /st {trigger.TimeOfDay:hh\\:mm} /sd {trigger.StartDate:MM/dd/yyyy}");
                    break;
            }

            // Add settings
            if (!settings.RunOnlyWhenLoggedOn)
            {
                sb.Append(" /ru SYSTEM");
            }

            sb.Append(" /f"); // Force create (overwrite if exists)

            return sb.ToString();
        }

        private string FormatDaysOfWeek(DaysOfWeek days)
        {
            var dayList = new List<string>();
            
            if (days.HasFlag(DaysOfWeek.Monday)) dayList.Add("MON");
            if (days.HasFlag(DaysOfWeek.Tuesday)) dayList.Add("TUE");
            if (days.HasFlag(DaysOfWeek.Wednesday)) dayList.Add("WED");
            if (days.HasFlag(DaysOfWeek.Thursday)) dayList.Add("THU");
            if (days.HasFlag(DaysOfWeek.Friday)) dayList.Add("FRI");
            if (days.HasFlag(DaysOfWeek.Saturday)) dayList.Add("SAT");
            if (days.HasFlag(DaysOfWeek.Sunday)) dayList.Add("SUN");

            return string.Join(",", dayList);
        }

        private List<ScheduledTask> ParseTaskListFromCsv(string csvOutput)
        {
            var tasks = new List<ScheduledTask>();
            
            try
            {
                var lines = csvOutput.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                if (lines.Length < 2) return tasks; // Need header + at least one data row

                // Skip header row
                for (int i = 1; i < lines.Length; i++)
                {
                    try
                    {
                        var columns = ParseCsvLine(lines[i]);
                        if (columns.Length >= 2)
                        {
                            var task = new ScheduledTask
                            {
                                Name = columns[0].Replace("\"", ""),
                                Status = ParseTaskStatus(columns.Length > 2 ? columns[2] : ""),
                                NextRunTime = ParseDateTime(columns.Length > 3 ? columns[3] : ""),
                                LastRunTime = ParseDateTime(columns.Length > 4 ? columns[4] : "")
                            };
                            
                            tasks.Add(task);
                        }
                    }
                    catch (Exception ex)
                    {
                        Debug.WriteLine($"Error parsing task line: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error parsing CSV output: {ex.Message}");
            }

            return tasks;
        }

        private string[] ParseCsvLine(string line)
        {
            var result = new List<string>();
            var current = new StringBuilder();
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
                    result.Add(current.ToString());
                    current.Clear();
                }
                else
                {
                    current.Append(c);
                }
            }

            result.Add(current.ToString());
            return result.ToArray();
        }

        private ScheduledTaskStatus ParseTaskStatus(string status)
        {
            return status.ToLower() switch
            {
                "ready" => ScheduledTaskStatus.Ready,
                "running" => ScheduledTaskStatus.Running,
                "disabled" => ScheduledTaskStatus.Disabled,
                "queued" => ScheduledTaskStatus.Queued,
                _ => ScheduledTaskStatus.Unknown
            };
        }

        private DateTime ParseDateTime(string dateTimeString)
        {
            if (DateTime.TryParse(dateTimeString, out DateTime result))
                return result;
            return DateTime.MinValue;
        }

        private void ApplyParametersToAction(TaskAction action, Dictionary<string, object> parameters)
        {
            if (action.Arguments != null)
            {
                foreach (var param in parameters)
                {
                    action.Arguments = action.Arguments.Replace($"{{{param.Key}}}", param.Value?.ToString());
                }
            }
        }

        #endregion
    }
}