#nullable enable
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Interface for the Logic Engine Service that provides unified data access
    /// and inference capabilities for the M&A Discovery Suite
    /// </summary>
    public interface ILogicEngineService
    {
        /// <summary>
        /// Loads all CSV data from the discovery data root and builds in-memory indices
        /// </summary>
        Task<bool> LoadAllAsync();

        /// <summary>
        /// Gets comprehensive user detail projection including all related entities
        /// </summary>
        Task<UserDetailProjection?> GetUserDetailAsync(string sidOrUpn);

        /// <summary>
        /// Gets comprehensive asset detail projection including all related entities  
        /// </summary>
        Task<AssetDetailProjection?> GetAssetDetailAsync(string deviceName);

        /// <summary>
        /// Gets comprehensive database detail projection including dependencies and users
        /// </summary>
        Task<SqlDbDto?> GetDatabaseDetailAsync(string databaseName);

        /// <summary>
        /// Suggests entitlements that need to be recreated for a user in target domain
        /// </summary>
        Task<List<MigrationHint>> SuggestEntitlementsForUserAsync(string sid);

        /// <summary>
        /// Gets all users with basic filtering capabilities
        /// </summary>
        Task<List<UserDto>> GetUsersAsync(string? filter = null, int skip = 0, int take = 100);

        /// <summary>
        /// Gets all devices with basic filtering capabilities
        /// </summary>
        Task<List<DeviceDto>> GetDevicesAsync(string? filter = null, int skip = 0, int take = 100);

        /// <summary>
        /// Gets inference rules that were applied during last load
        /// </summary>
        List<string> GetAppliedInferenceRules();

        /// <summary>
        /// Gets statistics about the loaded data
        /// </summary>
        DataLoadStatistics GetLoadStatistics();

        /// <summary>
        /// Event raised when data loading is complete
        /// </summary>
        event EventHandler<DataLoadedEventArgs>? DataLoaded;

        /// <summary>
        /// Event raised when data loading fails
        /// </summary>
        event EventHandler<DataLoadErrorEventArgs>? DataLoadError;

        /// <summary>
        /// Gets the current loading state
        /// </summary>
        bool IsLoading { get; }

        /// <summary>
        /// Gets the timestamp of the last successful data load
        /// </summary>
        DateTime? LastLoadTime { get; }

        // T-029: New risk analysis and projection methods
        
        /// <summary>
        /// Generates comprehensive risk dashboard projection with cross-module insights
        /// </summary>
        Task<RiskDashboardProjection> GenerateRiskDashboardProjectionAsync();
        
        /// <summary>
        /// Generates detailed threat analysis projection with correlations
        /// </summary>
        Task<ThreatAnalysisProjection> GenerateThreatAnalysisProjectionAsync();
        
        /// <summary>
        /// Gets threats affecting a specific asset
        /// </summary>
        Task<List<ThreatDetectionDTO>> GetThreatsForAssetAsync(string assetId);
        
        /// <summary>
        /// Gets governance information for a specific asset
        /// </summary>
        Task<DataGovernanceDTO?> GetGovernanceForAssetAsync(string assetId);
        
        /// <summary>
        /// Gets lineage flows involving a specific asset
        /// </summary>
        Task<List<DataLineageDTO>> GetLineageForAssetAsync(string assetId);
        
        /// <summary>
        /// Gets external identity mapping for internal user
        /// </summary>
        Task<List<ExternalIdentityDTO>> GetExternalIdentitiesForUserAsync(string userSid);
        
        /// <summary>
        /// Gets comprehensive group detail projection including all related entities
        /// </summary>
        Task<GroupDto?> GetGroupDetailAsync(string groupName);
        
        /// <summary>
        /// Gets comprehensive file share detail projection including permissions and usage
        /// </summary>
        Task<FileShareDto?> GetFileShareDetailAsync(string shareName);
        
        /// <summary>
        /// Gets comprehensive mailbox detail projection including size and permissions
        /// </summary>
        Task<MailboxDto?> GetMailboxDetailAsync(string mailboxName);
    }

    /// <summary>
    /// Statistics about loaded data for monitoring and diagnostics
    /// </summary>
    public record DataLoadStatistics(
        int UserCount,
        int GroupCount,
        int DeviceCount,
        int AppCount,
        int GpoCount,
        int AclEntryCount,
        int MappedDriveCount,
        int MailboxCount,
        int AzureRoleCount,
        int SqlDbCount,
        // T-029: New module counts
        int ThreatCount,
        int GovernanceAssetCount,
        int LineageFlowCount,
        int ExternalIdentityCount,
        int InferenceRulesApplied,
        int FuzzyMatchesFound,
        TimeSpan LoadDuration,
        DateTime LoadTimestamp
    );

    /// <summary>
    /// Event arguments for successful data loading
    /// </summary>
    public record DataLoadedEventArgs(
        DataLoadStatistics Statistics,
        List<string> AppliedRules
    );

    /// <summary>
    /// Event arguments for data loading errors
    /// </summary>
    public record DataLoadErrorEventArgs(
        Exception Exception,
        string ErrorMessage,
        string? FailedFilePath = null
    );
}