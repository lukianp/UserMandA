using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    public interface IGanttService
    {
        Task<List<MigrationWave>> GetMigrationWavesAsync();
        Task<MigrationWave> CreateMigrationWaveAsync(MigrationWave wave);
        Task<MigrationWave> UpdateMigrationWaveAsync(MigrationWave wave);
        Task DeleteMigrationWaveAsync(string waveId);
        Task<MigrationTask> CreateTaskAsync(string waveId, MigrationTask task);
        Task<MigrationTask> UpdateTaskAsync(MigrationTask task);
        Task DeleteTaskAsync(string taskId);
        Task<List<MigrationWave>> CalculateCriticalPathAsync(List<MigrationWave> waves);
        Task<bool> ValidateDependenciesAsync(List<MigrationWave> waves);
        Task<MigrationWave> RecalculateWaveProgressAsync(string waveId);
        Task<Dictionary<string, object>> GetProjectStatisticsAsync();
        Task<List<MigrationWave>> GetWavesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<List<MigrationTask>> GetOverdueTasksAsync();
        Task<List<MigrationWave>> OptimizeScheduleAsync(List<MigrationWave> waves);
        Task<bool> ExportToProjectFileAsync(string filePath, List<MigrationWave> waves);
        Task<List<MigrationWave>> ImportFromProjectFileAsync(string filePath);
        Task SaveGanttSettingsAsync(GanttSettings settings);
        Task<GanttSettings> LoadGanttSettingsAsync();
    }
}