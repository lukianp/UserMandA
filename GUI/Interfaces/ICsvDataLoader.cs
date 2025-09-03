using System.Threading.Tasks;
using System.Threading;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Interface for CSV data loading services
    /// Provides standardized methods for loading discovery CSV data
    /// </summary>
    public interface ICsvDataLoader
    {
        /// <summary>
        /// Load user account data from CSV files
        /// </summary>
        Task<DataLoaderResult<UserData>> LoadUsersAsync(string profileName);

        /// <summary>
        /// Load group data from CSV files
        /// </summary>
        Task<DataLoaderResult<GroupData>> LoadGroupsAsync(string profileName);

        /// <summary>
        /// Load infrastructure data from CSV files
        /// </summary>
        Task<DataLoaderResult<InfrastructureData>> LoadInfrastructureAsync(string profileName);

        /// <summary>
        /// Load applications data from CSV files
        /// </summary>
        Task<DataLoaderResult<ApplicationData>> LoadApplicationsAsync(string profileName);

        /// <summary>
        /// Load file server data from CSV files
        /// </summary>
        Task<DataLoaderResult<FileServerData>> LoadFileServersAsync(string profileName);

        /// <summary>
        /// Load SQL Server instance data from CSV files
        /// </summary>
        Task<DataLoaderResult<SqlInstanceData>> LoadDatabasesAsync(string profileName);

        /// <summary>
        /// Load group policy data from CSV files
        /// </summary>
        Task<DataLoaderResult<PolicyData>> LoadGroupPoliciesAsync(string profileName);

        /// <summary>
        /// Load migration items data from CSV files with enhanced error handling
        /// </summary>
        Task<DataLoaderResult<MigrationItem>> LoadMigrationItemsAsync(string profileName, System.Threading.CancellationToken cancellationToken = default);

        /// <summary>
        /// Load migration batches data from CSV files
        /// </summary>
        Task<DataLoaderResult<MigrationBatch>> LoadMigrationBatchesAsync(string profileName, System.Threading.CancellationToken cancellationToken = default);
    }
}