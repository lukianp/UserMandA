using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    public class SnapshotService : ISnapshotService
    {
        private readonly ILogger<SnapshotService> _logger;
        private readonly string _snapshotsDirectory;
        private readonly JsonSerializerOptions _jsonOptions;

        public SnapshotService(ILogger<SnapshotService> logger = null)
        {
            _logger = logger;
            
            _snapshotsDirectory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
                "MandADiscoverySuite", "Snapshots");
            
            EnsureSnapshotsDirectoryExists();
            
            _jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
        }

        public async Task<Snapshot> CreateSnapshotAsync(string name = null)
        {
            try
            {
                var snapshot = new Snapshot
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = name ?? $"Snapshot_{DateTime.Now:yyyyMMdd_HHmmss}",
                    CreatedDate = DateTime.Now,
                    CreatedBy = Environment.UserName,
                    Data = new SnapshotData
                    {
                        Users = await CaptureUsersAsync(),
                        Infrastructure = await CaptureInfrastructureAsync(),
                        Groups = await CaptureGroupsAsync(),
                        Applications = await CaptureApplicationsAsync()
                    }
                };

                await SaveSnapshotAsync(snapshot);
                
                _logger?.LogInformation("Created snapshot: {SnapshotId}", snapshot.Id);
                return snapshot;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to create snapshot");
                throw;
            }
        }

        public async Task<List<Snapshot>> GetSnapshotsAsync()
        {
            try
            {
                var snapshots = new List<Snapshot>();
                var snapshotFiles = Directory.GetFiles(_snapshotsDirectory, "*.json");

                foreach (var file in snapshotFiles)
                {
                    try
                    {
                        var json = await File.ReadAllTextAsync(file);
                        var snapshot = JsonSerializer.Deserialize<Snapshot>(json, _jsonOptions);
                        if (snapshot != null)
                        {
                            snapshots.Add(snapshot);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger?.LogWarning(ex, "Failed to load snapshot from file: {File}", file);
                    }
                }

                return snapshots.OrderByDescending(s => s.CreatedDate).ToList();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to get snapshots");
                return new List<Snapshot>();
            }
        }

        public async Task<ComparisonResult> CompareSnapshotsAsync(string baselineSnapshotId, string compareSnapshotId)
        {
            try
            {
                var snapshots = await GetSnapshotsAsync();
                var baselineSnapshot = snapshots.FirstOrDefault(s => s.Id == baselineSnapshotId);
                var compareSnapshot = snapshots.FirstOrDefault(s => s.Id == compareSnapshotId);

                if (baselineSnapshot == null || compareSnapshot == null)
                {
                    throw new ArgumentException("One or both snapshots not found");
                }

                var changes = new List<ChangeItem>();

                // Compare different data types
                CompareUsers(baselineSnapshot.Data?.Users, compareSnapshot.Data?.Users, changes);
                CompareInfrastructure(baselineSnapshot.Data?.Infrastructure, compareSnapshot.Data?.Infrastructure, changes);
                CompareGroups(baselineSnapshot.Data?.Groups, compareSnapshot.Data?.Groups, changes);
                CompareApplications(baselineSnapshot.Data?.Applications, compareSnapshot.Data?.Applications, changes);

                var result = new ComparisonResult
                {
                    BaselineSnapshotId = baselineSnapshotId,
                    CompareSnapshotId = compareSnapshotId,
                    ComparisonDate = DateTime.Now,
                    Changes = changes,
                    Summary = new ComparisonSummary
                    {
                        TotalChanges = changes.Count,
                        AddedItems = changes.Count(c => c.Type == "Added"),
                        RemovedItems = changes.Count(c => c.Type == "Removed"),
                        ModifiedItems = changes.Count(c => c.Type == "Modified")
                    }
                };

                return result;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to compare snapshots");
                throw;
            }
        }

        public async Task DeleteSnapshotAsync(string snapshotId)
        {
            try
            {
                var filePath = Path.Combine(_snapshotsDirectory, $"{snapshotId}.json");
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    _logger?.LogInformation("Deleted snapshot: {SnapshotId}", snapshotId);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to delete snapshot: {SnapshotId}", snapshotId);
                throw;
            }
        }

        public async Task<Snapshot> LoadSnapshotAsync(string snapshotId)
        {
            try
            {
                var filePath = Path.Combine(_snapshotsDirectory, $"{snapshotId}.json");
                if (!File.Exists(filePath))
                {
                    throw new FileNotFoundException($"Snapshot not found: {snapshotId}");
                }

                var json = await File.ReadAllTextAsync(filePath);
                var snapshot = JsonSerializer.Deserialize<Snapshot>(json, _jsonOptions);
                return snapshot;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to load snapshot: {SnapshotId}", snapshotId);
                throw;
            }
        }

        public async Task<string> ExportSnapshotAsync(string snapshotId, string filePath)
        {
            try
            {
                var snapshot = await LoadSnapshotAsync(snapshotId);
                var json = JsonSerializer.Serialize(snapshot, _jsonOptions);
                await File.WriteAllTextAsync(filePath, json);
                _logger?.LogInformation("Exported snapshot {SnapshotId} to {FilePath}", snapshotId, filePath);
                return filePath;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to export snapshot: {SnapshotId}", snapshotId);
                throw;
            }
        }

        public async Task<Snapshot> ImportSnapshotAsync(string filePath)
        {
            try
            {
                if (!File.Exists(filePath))
                {
                    throw new FileNotFoundException($"File not found: {filePath}");
                }

                var json = await File.ReadAllTextAsync(filePath);
                var snapshot = JsonSerializer.Deserialize<Snapshot>(json, _jsonOptions);
                
                // Generate new ID to avoid conflicts
                snapshot.Id = Guid.NewGuid().ToString();
                
                await SaveSnapshotAsync(snapshot);
                _logger?.LogInformation("Imported snapshot from {FilePath}", filePath);
                return snapshot;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to import snapshot from: {FilePath}", filePath);
                throw;
            }
        }

        private void EnsureSnapshotsDirectoryExists()
        {
            try
            {
                if (!Directory.Exists(_snapshotsDirectory))
                {
                    Directory.CreateDirectory(_snapshotsDirectory);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to create snapshots directory");
            }
        }

        private async Task SaveSnapshotAsync(Snapshot snapshot)
        {
            var filePath = Path.Combine(_snapshotsDirectory, $"{snapshot.Id}.json");
            var json = JsonSerializer.Serialize(snapshot, _jsonOptions);
            await File.WriteAllTextAsync(filePath, json);
        }

        private async Task<List<UserData>> CaptureUsersAsync()
        {
            // TODO: Integrate with actual data service when available
            return await Task.FromResult(new List<UserData>());
        }

        private async Task<List<InfrastructureData>> CaptureInfrastructureAsync()
        {
            // TODO: Integrate with actual data service when available
            return await Task.FromResult(new List<InfrastructureData>());
        }

        private async Task<List<GroupData>> CaptureGroupsAsync()
        {
            // TODO: Integrate with actual data service when available
            return await Task.FromResult(new List<GroupData>());
        }

        private async Task<List<ApplicationData>> CaptureApplicationsAsync()
        {
            // TODO: Integrate with actual data service when available
            return await Task.FromResult(new List<ApplicationData>());
        }

        private void CompareUsers(List<UserData> baseline, List<UserData> compare, List<ChangeItem> changes)
        {
            // Simplified comparison - will be enhanced when real data integration is complete
            if (baseline?.Count != compare?.Count)
            {
                changes.Add(new ChangeItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Category = "Users",
                    Type = "Modified",
                    ItemName = "User Count",
                    DetectedAt = DateTime.Now,
                    Description = $"User count changed from {baseline?.Count ?? 0} to {compare?.Count ?? 0}"
                });
            }
        }

        private void CompareInfrastructure(List<InfrastructureData> baseline, List<InfrastructureData> compare, List<ChangeItem> changes)
        {
            // Simplified comparison - will be enhanced when real data integration is complete
            if (baseline?.Count != compare?.Count)
            {
                changes.Add(new ChangeItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Category = "Infrastructure",
                    Type = "Modified",
                    ItemName = "Infrastructure Count",
                    DetectedAt = DateTime.Now,
                    Description = $"Infrastructure count changed from {baseline?.Count ?? 0} to {compare?.Count ?? 0}"
                });
            }
        }

        private void CompareGroups(List<GroupData> baseline, List<GroupData> compare, List<ChangeItem> changes)
        {
            // Simplified comparison - will be enhanced when real data integration is complete
            if (baseline?.Count != compare?.Count)
            {
                changes.Add(new ChangeItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Category = "Groups",
                    Type = "Modified",
                    ItemName = "Group Count",
                    DetectedAt = DateTime.Now,
                    Description = $"Group count changed from {baseline?.Count ?? 0} to {compare?.Count ?? 0}"
                });
            }
        }

        private void CompareApplications(List<ApplicationData> baseline, List<ApplicationData> compare, List<ChangeItem> changes)
        {
            // Simplified comparison - will be enhanced when real data integration is complete
            if (baseline?.Count != compare?.Count)
            {
                changes.Add(new ChangeItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Category = "Applications",
                    Type = "Modified",
                    ItemName = "Application Count",
                    DetectedAt = DateTime.Now,
                    Description = $"Application count changed from {baseline?.Count ?? 0} to {compare?.Count ?? 0}"
                });
            }
        }
    }
}