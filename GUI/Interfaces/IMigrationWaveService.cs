using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Interface for migration wave management services
    /// </summary>
    public interface IMigrationWaveService
    {
        Task AddAssetToWaveAsync(DeviceDto asset);
        Task RemoveAssetFromWaveAsync(DeviceDto asset);
        Task CreateWaveAsync(string waveName);
        Task DeleteWaveAsync(string waveId);
        Task UpdateWaveAsync(string waveId, MigrationBatch updatedWave);
    }
}