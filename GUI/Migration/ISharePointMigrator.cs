using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.Models.Migration;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// SharePoint site and library object for migrations
    /// </summary>
    public class SharePointSiteDto
    {
        public string SiteUrl { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Template { get; set; } = string.Empty;
        public List<SharePointLibraryDto> Libraries { get; set; } = new();
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    /// <summary>
    /// SharePoint document library object for migrations
    /// </summary>
    public class SharePointLibraryDto
    {
        public string LibraryUrl { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string LibraryType { get; set; } = "DocumentLibrary";
        public bool MigratePermissions { get; set; } = true;
        public bool MigrateVersionHistory { get; set; } = true;
        public int VersionHistoryLimit { get; set; } = 10;
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    /// <summary>
    /// OneDrive personal library object for migrations
    /// </summary>
    public class OneDriveLibraryDto
    {
        public string UserPrincipalName { get; set; } = string.Empty;
        public string DriveUrl { get; set; } = string.Empty;
        public string FolderPath { get; set; } = "/";
        public bool MigrateSharedItems { get; set; } = true;
        public bool MigrateVersionHistory { get; set; } = true;
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    /// <summary>
    /// SharePoint migration settings with comprehensive configuration options
    /// </summary>
    public class SharePointMigrationSettings : MigrationSettings
    {
        public bool MigratePermissions { get; set; } = true;
        public bool MigrateVersionHistory { get; set; } = true;
        public bool MigrateWorkflows { get; set; } = false;
        public bool MigrateCustomizations { get; set; } = false;
        public bool PreserveMetadata { get; set; } = true;
        public bool EnableIncrementalMigration { get; set; } = true;
        public int MaxConcurrentMigrations { get; set; } = 5;
        public int VersionHistoryLimit { get; set; } = 10;
        public List<string> ExcludedFileTypes { get; set; } = new();
        public long MaxFileSizeBytes { get; set; } = 15L * 1024 * 1024 * 1024; // 15GB limit for SharePoint Online
        public bool PreserveTaxonomy { get; set; } = true;
        public bool MigrateWebParts { get; set; } = false;
        public SharePointMigrationMode MigrationMode { get; set; } = SharePointMigrationMode.FullMigration;
    }

    /// <summary>
    /// SharePoint migration execution modes
    /// </summary>
    public enum SharePointMigrationMode
    {
        FullMigration,
        ContentOnly,
        StructureOnly,
        IncrementalSync,
        DeltaMigration
    }

    /// <summary>
    /// SharePoint migration result with detailed progress and metadata information
    /// </summary>
    public class SharePointMigrationResult : MigrationResult
    {
        public int MigratedSites { get; set; }
        public int MigratedLibraries { get; set; }
        public int MigratedFiles { get; set; }
        public long MigratedSizeBytes { get; set; }
        public int PreservedVersions { get; set; }
        public int MigratedPermissions { get; set; }
        public List<string> UnsupportedFeatures { get; set; } = new();
        public Dictionary<string, object> MigrationMetadata { get; set; } = new();
        public TimeSpan ActualDuration { get; set; }
        public DateTime MigrationStartTime { get; set; }
        public DateTime MigrationEndTime { get; set; }
    }

    /// <summary>
    /// SharePoint migration provider interface supporting sites, libraries, and OneDrive migrations
    /// Uses Microsoft's SharePoint Migration API or ShareGate API for comprehensive migration capabilities
    /// </summary>
    public interface ISharePointMigrator
    {
        /// <summary>
        /// Migrates a complete SharePoint site including subsites, libraries, and content
        /// </summary>
        Task<SharePointMigrationResult> MigrateSiteAsync(
            SharePointSiteDto site, 
            SharePointMigrationSettings settings, 
            TargetContext target, 
            IProgress<MigrationProgress>? progress = null);

        /// <summary>
        /// Migrates a specific SharePoint document library with all content and metadata
        /// </summary>
        Task<SharePointMigrationResult> MigrateLibraryAsync(
            SharePointLibraryDto library, 
            SharePointMigrationSettings settings, 
            TargetContext target, 
            IProgress<MigrationProgress>? progress = null);

        /// <summary>
        /// Migrates OneDrive for Business content for a specific user
        /// </summary>
        Task<SharePointMigrationResult> MigrateOneDriveAsync(
            OneDriveLibraryDto oneDrive, 
            SharePointMigrationSettings settings, 
            TargetContext target, 
            IProgress<MigrationProgress>? progress = null);

        /// <summary>
        /// Performs incremental/delta migration to sync only changed content
        /// </summary>
        Task<SharePointMigrationResult> MigrateDeltaAsync(
            SharePointSiteDto site, 
            DateTime lastMigrationDate,
            SharePointMigrationSettings settings, 
            TargetContext target, 
            IProgress<MigrationProgress>? progress = null);

        /// <summary>
        /// Validates SharePoint content and identifies potential migration issues
        /// </summary>
        Task<List<ValidationIssue>> ValidateContentAsync(
            SharePointSiteDto site, 
            SharePointMigrationSettings settings);

        /// <summary>
        /// Enumerates SharePoint sites available for migration from source environment
        /// </summary>
        Task<List<SharePointSiteDto>> DiscoverSitesAsync(
            TargetContext sourceContext,
            IProgress<MigrationProgress>? progress = null);

        /// <summary>
        /// Enumerates OneDrive libraries available for migration
        /// </summary>
        Task<List<OneDriveLibraryDto>> DiscoverOneDriveLibrariesAsync(
            TargetContext sourceContext,
            IProgress<MigrationProgress>? progress = null);

        /// <summary>
        /// Tests connectivity to both source and target SharePoint environments
        /// </summary>
        Task<bool> TestConnectivityAsync(TargetContext source, TargetContext target);

        /// <summary>
        /// Rolls back SharePoint migration by removing target content
        /// </summary>
        Task<RollbackResult> RollbackMigrationAsync(
            SharePointSiteDto site, 
            TargetContext target, 
            IProgress<MigrationProgress>? progress = null);
    }
}