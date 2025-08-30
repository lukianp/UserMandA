using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Graph;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.MigrationProviders;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// SharePoint migration service that integrates with the MVVM framework
    /// Provides high-level SharePoint migration operations for the GUI
    /// </summary>
    public class SharePointMigrationService
    {
        private readonly ISharePointMigrator _sharePointMigrator;
        private readonly GraphServiceClient? _graphClient;

        public SharePointMigrationService(ISharePointMigrator? sharePointMigrator = null, GraphServiceClient? graphClient = null)
        {
            _sharePointMigrator = sharePointMigrator ?? new SharePointMigrator(graphClient);
            _graphClient = graphClient;
        }

        /// <summary>
        /// Discovers SharePoint sites and converts them to MigrationItem format for the GUI
        /// </summary>
        public async Task<List<MigrationItem>> DiscoverSharePointSitesAsync(
            MandADiscoverySuite.Migration.TargetContext sourceContext,
            IProgress<MandADiscoverySuite.Migration.MigrationProgress>? progress = null)
        {
            System.Diagnostics.Debug.WriteLine($"[SharePointMigrationService] Starting SharePoint site discovery for tenant: {sourceContext.TenantId}");
            try
            {
                var sites = await _sharePointMigrator.DiscoverSitesAsync(sourceContext, progress);
                System.Diagnostics.Debug.WriteLine($"[SharePointMigrationService] Successfully discovered {sites.Count} SharePoint sites");
                return sites.Select(ConvertToMigrationItem).ToList();
            }
            catch (Exception ex)
            {
                progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress
                {
                    Message = $"SharePoint site discovery failed: {ex.Message}",
                    Percentage = 100
                });
                return new List<MigrationItem>();
            }
        }

        /// <summary>
        /// Discovers OneDrive libraries and converts them to MigrationItem format for the GUI
        /// </summary>
        public async Task<List<MigrationItem>> DiscoverOneDriveLibrariesAsync(
            MandADiscoverySuite.Migration.TargetContext sourceContext,
            IProgress<MandADiscoverySuite.Migration.MigrationProgress>? progress = null)
        {
            try
            {
                var libraries = await _sharePointMigrator.DiscoverOneDriveLibrariesAsync(sourceContext, progress);
                return libraries.Select(ConvertToMigrationItem).ToList();
            }
            catch (Exception ex)
            {
                progress?.Report(new MandADiscoverySuite.Migration.MigrationProgress
                {
                    Message = $"OneDrive discovery failed: {ex.Message}",
                    Percentage = 100
                });
                return new List<MigrationItem>();
            }
        }

        /// <summary>
        /// Validates SharePoint content and identifies migration issues
        /// </summary>
        public async Task<List<MandADiscoverySuite.Models.ValidationIssue>> ValidateSharePointContentAsync(
            List<MigrationItem> sites,
            SharePointMigrationSettings settings)
        {
            var allIssues = new List<MandADiscoverySuite.Models.ValidationIssue>();

            try
            {
                foreach (var siteItem in sites)
                {
                    var site = ConvertToSharePointSiteDto(siteItem);
                    var migrationIssues = await _sharePointMigrator.ValidateContentAsync(site, settings);
                    
                    // Convert Migration.ValidationIssue to Models.ValidationIssue
                    foreach (var migrationIssue in migrationIssues)
                    {
                        var modelIssue = new MandADiscoverySuite.Models.ValidationIssue
                        {
                            Severity = migrationIssue.Severity.ToString(), // Convert enum to string
                            Category = migrationIssue.Category,
                            ItemName = site.SiteUrl, // Use site URL as item name
                            Description = migrationIssue.Description,
                            RecommendedAction = migrationIssue.RecommendedAction
                        };
                        allIssues.Add(modelIssue);
                    }
                }
            }
            catch (Exception ex)
            {
                allIssues.Add(new MandADiscoverySuite.Models.ValidationIssue
                {
                    Severity = "Error",
                    Category = "Validation",
                    ItemName = "SharePoint Content",
                    Description = $"Content validation failed: {ex.Message}",
                    RecommendedAction = "Check source connectivity and try again"
                });
            }

            return allIssues;
        }

        /// <summary>
        /// Executes SharePoint site migration with progress reporting
        /// </summary>
        public async Task<SharePointMigrationResult> MigrateSharePointSiteAsync(
            MigrationItem siteItem,
            SharePointMigrationSettings settings,
            MandADiscoverySuite.Migration.TargetContext target,
            IProgress<MandADiscoverySuite.Migration.MigrationProgress>? progress = null)
        {
            try
            {
                var site = ConvertToSharePointSiteDto(siteItem);
                var result = await _sharePointMigrator.MigrateSiteAsync(site, settings, target, progress);
                
                // Update the MigrationItem status based on result
                siteItem.Status = result.Success ? MigrationStatus.Completed : MigrationStatus.Failed;
                
                return result;
            }
            catch (Exception ex)
            {
                siteItem.Status = MigrationStatus.Failed;
                return new SharePointMigrationResult
                {
                    Success = false,
                    Errors = { $"Site migration failed: {ex.Message}" },
                    MigrationStartTime = DateTime.UtcNow,
                    MigrationEndTime = DateTime.UtcNow
                };
            }
        }

        /// <summary>
        /// Executes OneDrive library migration with progress reporting
        /// </summary>
        public async Task<SharePointMigrationResult> MigrateOneDriveLibraryAsync(
            MigrationItem libraryItem,
            SharePointMigrationSettings settings,
            MandADiscoverySuite.Migration.TargetContext target,
            IProgress<MandADiscoverySuite.Migration.MigrationProgress>? progress = null)
        {
            try
            {
                var oneDriveLibrary = ConvertToOneDriveLibraryDto(libraryItem);
                var result = await _sharePointMigrator.MigrateOneDriveAsync(oneDriveLibrary, settings, target, progress);
                
                // Update the MigrationItem status based on result
                libraryItem.Status = result.Success ? MigrationStatus.Completed : MigrationStatus.Failed;
                
                return result;
            }
            catch (Exception ex)
            {
                libraryItem.Status = MigrationStatus.Failed;
                return new SharePointMigrationResult
                {
                    Success = false,
                    Errors = { $"OneDrive migration failed: {ex.Message}" },
                    MigrationStartTime = DateTime.UtcNow,
                    MigrationEndTime = DateTime.UtcNow
                };
            }
        }

        /// <summary>
        /// Executes delta migration for incremental sync
        /// </summary>
        public async Task<SharePointMigrationResult> MigrateDeltaAsync(
            MigrationItem siteItem,
            DateTime lastMigrationDate,
            SharePointMigrationSettings settings,
            MandADiscoverySuite.Migration.TargetContext target,
            IProgress<MandADiscoverySuite.Migration.MigrationProgress>? progress = null)
        {
            try
            {
                var site = ConvertToSharePointSiteDto(siteItem);
                var result = await _sharePointMigrator.MigrateDeltaAsync(site, lastMigrationDate, settings, target, progress);
                
                return result;
            }
            catch (Exception ex)
            {
                return new SharePointMigrationResult
                {
                    Success = false,
                    Errors = { $"Delta migration failed: {ex.Message}" },
                    MigrationStartTime = DateTime.UtcNow,
                    MigrationEndTime = DateTime.UtcNow
                };
            }
        }

        /// <summary>
        /// Creates migration batches from selected SharePoint sites
        /// </summary>
        public async Task<List<MigrationBatch>> CreateSharePointMigrationBatchesAsync(
            List<MigrationItem> selectedSites,
            SharePointMigrationSettings settings,
            int maxSitesPerBatch = 10)
        {
            var batches = new List<MigrationBatch>();

            try
            {
                var readySites = selectedSites.Where(s => s.Status == MigrationStatus.Ready || s.Status == MigrationStatus.NotStarted).ToList();
                
                if (readySites.Count == 0)
                {
                    return batches;
                }

                var batchCount = (int)Math.Ceiling((double)readySites.Count / maxSitesPerBatch);
                
                for (int i = 0; i < batchCount; i++)
                {
                    var batchSites = readySites.Skip(i * maxSitesPerBatch).Take(maxSitesPerBatch).ToList();
                    
                    var batch = new MigrationBatch
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = $"SharePoint Batch {i + 1}",
                        Description = $"SharePoint migration batch containing {batchSites.Count} sites",
                        Type = MigrationType.SharePoint,
                        Priority = DetermineBatchPriority(batchSites),
                        MaxConcurrentItems = Math.Min(settings.MaxConcurrentMigrations, batchSites.Count),
                        PlannedStartDate = DateTime.Now.AddDays(i * 2), // Stagger batches by 2 days
                        PlannedEndDate = DateTime.Now.AddDays((i * 2) + 2),
                        EstimatedDuration = EstimateBatchDuration(batchSites)
                    };

                    // Add sites to batch
                    foreach (var site in batchSites)
                    {
                        batch.Items.Add(site);
                    }

                    batches.Add(batch);
                }
            }
            catch (Exception ex)
            {
                // Log error and return empty batches
                System.Diagnostics.Debug.WriteLine($"[SharePointMigrationService] Batch creation failed: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"[SharePointMigrationService] Stack trace: {ex.StackTrace}");
            }

            return batches;
        }

        /// <summary>
        /// Tests connectivity to SharePoint environments
        /// </summary>
        public async Task<bool> TestSharePointConnectivityAsync(MandADiscoverySuite.Migration.TargetContext source, MandADiscoverySuite.Migration.TargetContext target)
        {
            try
            {
                return await _sharePointMigrator.TestConnectivityAsync(source, target);
            }
            catch (Exception)
            {
                return false;
            }
        }

        #region Private Helper Methods

        private MigrationItem ConvertToMigrationItem(SharePointSiteDto site)
        {
            var totalSizeGB = 0.0;
            var totalFiles = 0;
            
            // Calculate aggregated metrics from libraries
            foreach (var library in site.Libraries)
            {
                if (library.Metadata.ContainsKey("SizeGB"))
                {
                    totalSizeGB += Convert.ToDouble(library.Metadata["SizeGB"]);
                }
                if (library.Metadata.ContainsKey("FileCount"))
                {
                    totalFiles += Convert.ToInt32(library.Metadata["FileCount"]);
                }
            }

            return new MigrationItem
            {
                Id = site.Metadata.ContainsKey("SiteId") ? site.Metadata["SiteId"].ToString() : Guid.NewGuid().ToString(),
                SourceIdentity = site.SiteUrl,
                TargetIdentity = site.SiteUrl.Replace("sharepoint.company.com", "tenant.sharepoint.com"), // Example target mapping
                Type = MigrationType.SharePoint,
                Status = MigrationStatus.NotStarted,
                Priority = MigrationPriority.Normal,
                Properties = new Dictionary<string, object>
                {
                    ["SiteName"] = site.Title,
                    ["Template"] = site.Template,
                    ["SizeGB"] = Math.Round(totalSizeGB, 2),
                    ["LibraryCount"] = site.Libraries.Count,
                    ["FileCount"] = totalFiles,
                    ["SubsiteCount"] = site.Metadata.ContainsKey("SubsiteCount") ? site.Metadata["SubsiteCount"] : 0,
                    ["LastModified"] = site.Metadata.ContainsKey("LastModified") ? site.Metadata["LastModified"] : DateTime.MinValue,
                    ["CreatedDate"] = site.Metadata.ContainsKey("CreatedDate") ? site.Metadata["CreatedDate"] : DateTime.MinValue,
                    ["Description"] = site.Metadata.ContainsKey("Description") ? site.Metadata["Description"] : ""
                }
            };
        }

        private MigrationItem ConvertToMigrationItem(OneDriveLibraryDto library)
        {
            var quotaUsed = library.Metadata.ContainsKey("QuotaUsed") ? Convert.ToInt64(library.Metadata["QuotaUsed"]) : 0;
            var sizeGB = Math.Round(quotaUsed / (1024.0 * 1024.0 * 1024.0), 2);

            return new MigrationItem
            {
                Id = library.Metadata.ContainsKey("DriveId") ? library.Metadata["DriveId"].ToString() : Guid.NewGuid().ToString(),
                SourceIdentity = library.DriveUrl,
                TargetIdentity = library.DriveUrl.Replace("my.sharepoint.com", "tenant-my.sharepoint.com"), // Example target mapping
                Type = MigrationType.OneDrive,
                Status = MigrationStatus.NotStarted,
                Priority = MigrationPriority.Normal,
                Properties = new Dictionary<string, object>
                {
                    ["UserPrincipalName"] = library.UserPrincipalName,
                    ["Owner"] = library.Metadata.ContainsKey("Owner") ? library.Metadata["Owner"] : library.UserPrincipalName,
                    ["SizeGB"] = sizeGB,
                    ["QuotaTotal"] = library.Metadata.ContainsKey("QuotaTotal") ? library.Metadata["QuotaTotal"] : 0,
                    ["QuotaUsed"] = quotaUsed,
                    ["DriveType"] = library.Metadata.ContainsKey("DriveType") ? library.Metadata["DriveType"] : "personal",
                    ["MigrateSharedItems"] = library.MigrateSharedItems
                }
            };
        }

        private SharePointSiteDto ConvertToSharePointSiteDto(MigrationItem item)
        {
            return new SharePointSiteDto
            {
                SiteUrl = item.SourceIdentity,
                Title = item.Properties?.ContainsKey("SiteName") == true ? item.Properties["SiteName"].ToString() : "Unknown Site",
                Template = item.Properties?.ContainsKey("Template") == true ? item.Properties["Template"].ToString() : "Team Site",
                Libraries = new List<SharePointLibraryDto>(), // Would be populated from discovery
                Metadata = item.Properties?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value) ?? new Dictionary<string, object>()
            };
        }

        private OneDriveLibraryDto ConvertToOneDriveLibraryDto(MigrationItem item)
        {
            return new OneDriveLibraryDto
            {
                UserPrincipalName = item.Properties?.ContainsKey("UserPrincipalName") == true ? 
                    item.Properties["UserPrincipalName"].ToString() : "unknown@tenant.com",
                DriveUrl = item.SourceIdentity,
                FolderPath = "/",
                MigrateSharedItems = item.Properties?.ContainsKey("MigrateSharedItems") == true ? 
                    Convert.ToBoolean(item.Properties["MigrateSharedItems"]) : true,
                MigrateVersionHistory = true,
                Metadata = item.Properties?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value) ?? new Dictionary<string, object>()
            };
        }

        private MigrationPriority DetermineBatchPriority(List<MigrationItem> sites)
        {
            // Prioritize batches with larger sites or more critical sites
            var totalSizeGB = sites.Sum(s => 
                s.Properties?.ContainsKey("SizeGB") == true ? Convert.ToDouble(s.Properties["SizeGB"]) : 0);

            if (totalSizeGB > 100) return MigrationPriority.High;
            if (totalSizeGB > 50) return MigrationPriority.Normal;
            return MigrationPriority.Low;
        }

        private TimeSpan EstimateBatchDuration(List<MigrationItem> sites)
        {
            // Estimate 10GB per hour migration rate as baseline
            var totalSizeGB = sites.Sum(s => 
                s.Properties?.ContainsKey("SizeGB") == true ? Convert.ToDouble(s.Properties["SizeGB"]) : 0);
            
            var baseHours = Math.Max(1, (int)(totalSizeGB / 10.0));
            var complexityFactor = sites.Count > 5 ? 1.5 : 1.0; // More sites = more complexity
            
            return TimeSpan.FromHours(baseHours * complexityFactor);
        }

        #endregion
    }
}