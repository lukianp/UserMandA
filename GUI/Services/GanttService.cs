using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    public class GanttService : IGanttService
    {
        private readonly ILogger<GanttService> _logger;
        private readonly string _dataDirectory;
        private readonly string _settingsPath;
        private readonly JsonSerializerOptions _jsonOptions;

        public GanttService(ILogger<GanttService> logger = null)
        {
            _logger = logger;
            _dataDirectory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
                "MandADiscoverySuite", "Gantt");
            _settingsPath = Path.Combine(_dataDirectory, "gantt-settings.json");
            
            EnsureDirectoryExists();
            
            _jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
        }

        public async Task<List<MigrationWave>> GetMigrationWavesAsync()
        {
            try
            {
                var wavesPath = Path.Combine(_dataDirectory, "migration-waves.json");
                if (!File.Exists(wavesPath))
                {
                    return GetSampleMigrationWaves();
                }

                var json = await File.ReadAllTextAsync(wavesPath);
                var waves = JsonSerializer.Deserialize<List<MigrationWave>>(json, _jsonOptions);
                return waves ?? GetSampleMigrationWaves();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading migration waves");
                return GetSampleMigrationWaves();
            }
        }

        public async Task<MigrationWave> CreateMigrationWaveAsync(MigrationWave wave)
        {
            try
            {
                var waves = await GetMigrationWavesAsync();
                wave.Id = Guid.NewGuid().ToString();
                waves.Add(wave);
                
                await SaveMigrationWavesAsync(waves);
                _logger?.LogInformation("Created migration wave: {WaveName}", wave.Name);
                return wave;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating migration wave: {WaveName}", wave.Name);
                throw;
            }
        }

        public async Task<MigrationWave> UpdateMigrationWaveAsync(MigrationWave wave)
        {
            try
            {
                var waves = await GetMigrationWavesAsync();
                var existing = waves.FirstOrDefault(w => w.Id == wave.Id);
                
                if (existing != null)
                {
                    var wavesList = waves.ToList();
                    var index = wavesList.IndexOf(existing);
                    if (index >= 0)
                    {
                        wavesList[index] = wave;
                        waves = wavesList;
                    }
                    
                    await SaveMigrationWavesAsync(waves);
                    _logger?.LogInformation("Updated migration wave: {WaveName}", wave.Name);
                }
                
                return wave;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error updating migration wave: {WaveId}", wave.Id);
                throw;
            }
        }

        public async Task DeleteMigrationWaveAsync(string waveId)
        {
            try
            {
                var waves = await GetMigrationWavesAsync();
                waves.RemoveAll(w => w.Id == waveId);
                
                await SaveMigrationWavesAsync(waves);
                _logger?.LogInformation("Deleted migration wave: {WaveId}", waveId);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error deleting migration wave: {WaveId}", waveId);
                throw;
            }
        }

        public async Task<MigrationTask> CreateTaskAsync(string waveId, MigrationTask task)
        {
            try
            {
                var waves = await GetMigrationWavesAsync();
                var wave = waves.FirstOrDefault(w => w.Id == waveId);
                
                if (wave != null)
                {
                    task.Id = Guid.NewGuid().ToString();
                    wave.Tasks.Add(task);
                    
                    await SaveMigrationWavesAsync(waves);
                    await RecalculateWaveProgressAsync(waveId);
                    
                    _logger?.LogInformation("Created task: {TaskName} in wave: {WaveId}", task.Name, waveId);
                }
                
                return task;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating task: {TaskName}", task.Name);
                throw;
            }
        }

        public async Task<MigrationTask> UpdateTaskAsync(MigrationTask task)
        {
            try
            {
                var waves = await GetMigrationWavesAsync();
                
                foreach (var wave in waves)
                {
                    var existingTask = wave.Tasks.FirstOrDefault(t => t.Id == task.Id);
                    if (existingTask != null)
                    {
                        wave.Tasks.Remove(existingTask);
                        wave.Tasks.Add(task);
                        
                        await SaveMigrationWavesAsync(waves);
                        await RecalculateWaveProgressAsync(wave.Id);
                        
                        _logger?.LogInformation("Updated task: {TaskName}", task.Name);
                        break;
                    }
                }
                
                return task;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error updating task: {TaskId}", task.Id);
                throw;
            }
        }

        public async Task DeleteTaskAsync(string taskId)
        {
            try
            {
                var waves = await GetMigrationWavesAsync();
                
                foreach (var wave in waves)
                {
                    var task = wave.Tasks.FirstOrDefault(t => t.Id == taskId);
                    if (task != null)
                    {
                        wave.Tasks.Remove(task);
                        await SaveMigrationWavesAsync(waves);
                        await RecalculateWaveProgressAsync(wave.Id);
                        
                        _logger?.LogInformation("Deleted task: {TaskId}", taskId);
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error deleting task: {TaskId}", taskId);
                throw;
            }
        }

        public async Task<List<MigrationWave>> CalculateCriticalPathAsync(List<MigrationWave> waves)
        {
            try
            {
                await Task.Delay(100);
                
                return waves.OrderBy(w => w.PlannedStartDate).ToList();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error calculating critical path");
                return waves;
            }
        }

        public async Task<bool> ValidateDependenciesAsync(List<MigrationWave> waves)
        {
            try
            {
                await Task.Delay(50);
                
                var waveIds = waves.Select(w => w.Id).ToHashSet();
                
                foreach (var wave in waves)
                {
                    if (!string.IsNullOrEmpty(wave.Dependencies))
                    {
                        try
                        {
                            var dependencies = JsonSerializer.Deserialize<string[]>(wave.Dependencies);
                            foreach (var dependency in dependencies)
                            {
                                if (!waveIds.Contains(dependency))
                                {
                                    _logger?.LogWarning("Invalid dependency found: {Dependency} in wave: {WaveId}", 
                                        dependency, wave.Id);
                                    return false;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger?.LogWarning(ex, "Failed to parse dependencies for wave: {WaveId}", wave.Id);
                        }
                    }
                }
                
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error validating dependencies");
                return false;
            }
        }

        public async Task<MigrationWave> RecalculateWaveProgressAsync(string waveId)
        {
            try
            {
                var waves = await GetMigrationWavesAsync();
                var wave = waves.FirstOrDefault(w => w.Id == waveId);
                
                if (wave != null && wave.Tasks.Any())
                {
                    var completedTasks = wave.Tasks.Count(t => t.Status == "Completed");
                    var totalTasks = wave.Tasks.Count;
                    
                    if (completedTasks == totalTasks)
                        wave.Status = "Completed";
                    else if (wave.Tasks.Any(t => t.Status == "InProgress"))
                        wave.Status = "InProgress";
                    else if (wave.Tasks.Any(t => t.Status == "Failed"))
                        wave.Status = "Failed";
                    
                    await SaveMigrationWavesAsync(waves);
                }
                
                return wave;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error recalculating wave progress: {WaveId}", waveId);
                throw;
            }
        }

        public async Task<Dictionary<string, object>> GetProjectStatisticsAsync()
        {
            try
            {
                var waves = await GetMigrationWavesAsync();
                var allTasks = waves.SelectMany(w => w.Tasks).ToList();
                
                return new Dictionary<string, object>
                {
                    ["TotalWaves"] = waves.Count,
                    ["CompletedWaves"] = waves.Count(w => w.Status == "Completed"),
                    ["InProgressWaves"] = waves.Count(w => w.Status == "InProgress"),
                    ["TotalTasks"] = allTasks.Count,
                    ["CompletedTasks"] = allTasks.Count(t => t.Status == "Completed"),
                    ["OverdueTasks"] = allTasks.Count(t => t.IsOverdue()),
                    ["AverageProgress"] = waves.Any() ? waves.Average(w => w.GetCompletionPercentage()) : 0,
                    ["ProjectStartDate"] = waves.Any() ? waves.Min(w => w.PlannedStartDate) : DateTime.Now,
                    ["ProjectEndDate"] = waves.Any() ? waves.Max(w => w.PlannedEndDate) : DateTime.Now.AddMonths(6)
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error calculating project statistics");
                return new Dictionary<string, object>();
            }
        }

        public async Task<List<MigrationWave>> GetWavesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                var waves = await GetMigrationWavesAsync();
                return waves.Where(w => w.PlannedStartDate >= startDate && w.PlannedEndDate <= endDate).ToList();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting waves by date range");
                return new List<MigrationWave>();
            }
        }

        public async Task<List<MigrationTask>> GetOverdueTasksAsync()
        {
            try
            {
                var waves = await GetMigrationWavesAsync();
                return waves.SelectMany(w => w.Tasks)
                           .Where(t => t.IsOverdue())
                           .OrderBy(t => t.PlannedEndDate)
                           .ToList();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting overdue tasks");
                return new List<MigrationTask>();
            }
        }

        public async Task<List<MigrationWave>> OptimizeScheduleAsync(List<MigrationWave> waves)
        {
            try
            {
                await Task.Delay(200);
                
                var optimizedWaves = waves.OrderBy(w => w.Priority).ToList();
                
                for (int i = 0; i < optimizedWaves.Count; i++)
                {
                    var wave = optimizedWaves[i];
                    if (i > 0)
                    {
                        var previousWave = optimizedWaves[i - 1];
                        if (wave.PlannedStartDate < previousWave.PlannedEndDate)
                        {
                            var delay = (previousWave.PlannedEndDate - wave.PlannedStartDate).Days;
                            wave.PlannedStartDate = previousWave.PlannedEndDate.AddDays(1);
                            wave.PlannedEndDate = wave.PlannedEndDate.AddDays(delay + 1);
                        }
                    }
                }
                
                return optimizedWaves;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error optimizing schedule");
                return waves;
            }
        }

        public async Task<bool> ExportToProjectFileAsync(string filePath, List<MigrationWave> waves)
        {
            try
            {
                var json = JsonSerializer.Serialize(waves, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(filePath, json);
                
                _logger?.LogInformation("Exported project to: {FilePath}", filePath);
                return true;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error exporting project to: {FilePath}", filePath);
                return false;
            }
        }

        public async Task<List<MigrationWave>> ImportFromProjectFileAsync(string filePath)
        {
            try
            {
                var json = await File.ReadAllTextAsync(filePath);
                var waves = JsonSerializer.Deserialize<List<MigrationWave>>(json, _jsonOptions);
                
                if (waves != null)
                {
                    await SaveMigrationWavesAsync(waves);
                    _logger?.LogInformation("Imported project from: {FilePath}", filePath);
                }
                
                return waves ?? new List<MigrationWave>();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error importing project from: {FilePath}", filePath);
                return new List<MigrationWave>();
            }
        }

        public async Task SaveGanttSettingsAsync(GanttSettings settings)
        {
            try
            {
                var json = JsonSerializer.Serialize(settings, _jsonOptions);
                await File.WriteAllTextAsync(_settingsPath, json);
                
                _logger?.LogInformation("Saved Gantt settings");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving Gantt settings");
                throw;
            }
        }

        public async Task<GanttSettings> LoadGanttSettingsAsync()
        {
            try
            {
                if (!File.Exists(_settingsPath))
                {
                    return new GanttSettings();
                }

                var json = await File.ReadAllTextAsync(_settingsPath);
                var settings = JsonSerializer.Deserialize<GanttSettings>(json, _jsonOptions);
                
                return settings ?? new GanttSettings();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading Gantt settings");
                return new GanttSettings();
            }
        }

        private async Task SaveMigrationWavesAsync(List<MigrationWave> waves)
        {
            var wavesPath = Path.Combine(_dataDirectory, "migration-waves.json");
            var json = JsonSerializer.Serialize(waves, _jsonOptions);
            await File.WriteAllTextAsync(wavesPath, json);
        }

        private List<MigrationWave> GetSampleMigrationWaves()
        {
            var today = DateTime.Today;
            
            var wave1 = new MigrationWave
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Wave 1: Discovery & Assessment",
                Description = "Initial discovery and assessment phase",
                PlannedStartDate = today,
                PlannedEndDate = today.AddDays(30),
                Status = "InProgress",
                Priority = 1,
                AssignedTo = "Migration Team"
            };

            var wave2 = new MigrationWave
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Wave 2: Core Infrastructure",
                Description = "Migrate core infrastructure components",
                PlannedStartDate = today.AddDays(30),
                PlannedEndDate = today.AddDays(75),
                Status = "Planned",
                Priority = 2,
                AssignedTo = "Infrastructure Team"
            };

            var wave3 = new MigrationWave
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Wave 3: Applications",
                Description = "Migrate business applications",
                PlannedStartDate = today.AddDays(60),
                PlannedEndDate = today.AddDays(120),
                Status = "Planned",
                Priority = 3,
                AssignedTo = "Application Team"
            };

            // Add sample tasks
            wave1.Tasks.Add(new MigrationTask
            {
                Id = Guid.NewGuid().ToString(),
                WaveId = wave1.Id,
                Name = "Infrastructure Assessment",
                Description = "Assess current infrastructure",
                PlannedStartDate = today,
                PlannedEndDate = today.AddDays(10),
                Status = "Completed",
                AssignedTo = "John Doe",
                CompletionPercentage = 100,
                EstimatedHours = 80,
                ActualHours = 75
            });

            wave1.Tasks.Add(new MigrationTask
            {
                Id = Guid.NewGuid().ToString(),
                WaveId = wave1.Id,
                Name = "Application Discovery",
                Description = "Discover all applications",
                PlannedStartDate = today.AddDays(5),
                PlannedEndDate = today.AddDays(20),
                Status = "InProgress",
                AssignedTo = "Jane Smith",
                CompletionPercentage = 60,
                EstimatedHours = 120,
                ActualHours = 80
            });

            wave2.Tasks.Add(new MigrationTask
            {
                Id = Guid.NewGuid().ToString(),
                WaveId = wave2.Id,
                Name = "Network Migration",
                Description = "Migrate network infrastructure",
                PlannedStartDate = today.AddDays(30),
                PlannedEndDate = today.AddDays(50),
                Status = "NotStarted",
                AssignedTo = "Network Team",
                CompletionPercentage = 0,
                EstimatedHours = 200
            });

            return new List<MigrationWave> { wave1, wave2, wave3 };
        }

        private void EnsureDirectoryExists()
        {
            try
            {
                if (!Directory.Exists(_dataDirectory))
                {
                    Directory.CreateDirectory(_dataDirectory);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to create Gantt data directory");
            }
        }
    }
}