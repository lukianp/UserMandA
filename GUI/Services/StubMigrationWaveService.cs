using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Stub implementation of IMigrationWaveService for development/testing
    /// </summary>
    public class StubMigrationWaveService : IMigrationWaveService
    {
        private readonly ILogger _logger;

        public StubMigrationWaveService(ILogger logger)
        {
            _logger = logger;
        }

        public async Task AddAssetToWaveAsync(DeviceDto asset)
        {
            await Task.Delay(100); // Simulate async operation
            _logger?.LogInformation($"[StubMigrationWaveService] Added asset {asset?.Name ?? "Unknown"} to migration wave");
        }

        public async Task RemoveAssetFromWaveAsync(DeviceDto asset)
        {
            await Task.Delay(50);
            _logger?.LogInformation($"[StubMigrationWaveService] Removed asset {asset?.Name ?? "Unknown"} from migration wave");
        }

        public async Task CreateWaveAsync(string waveName)
        {
            await Task.Delay(200);
            _logger?.LogInformation($"[StubMigrationWaveService] Created migration wave: {waveName}");
        }

        public async Task DeleteWaveAsync(string waveId)
        {
            await Task.Delay(100);
            _logger?.LogInformation($"[StubMigrationWaveService] Deleted migration wave: {waveId}");
        }

        public async Task UpdateWaveAsync(string waveId, MigrationBatch updatedWave)
        {
            await Task.Delay(150);
            _logger?.LogInformation($"[StubMigrationWaveService] Updated migration wave: {waveId}");
        }
    }
}