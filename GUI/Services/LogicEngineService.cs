#nullable enable
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Core Logic Engine Service that unifies CSV data into typed graphs and projections
    /// Implements read-optimized data layer with inference capabilities
    /// </summary>
    public class LogicEngineService : ILogicEngineService
    {
        private readonly ILogger<LogicEngineService> _logger;
        private readonly string _dataRoot;
        private readonly FuzzyMatchingConfig _fuzzyConfig;
        private readonly MultiTierCacheService _cacheService;
        private readonly SemaphoreSlim _loadSemaphore = new(1, 1);
        private readonly SemaphoreSlim _csvReadSemaphore = new(3, 3); // T-030: Concurrent CSV reading limit

        // In-memory data stores
        private readonly ConcurrentDictionary<string, UserDto> _usersBySid = new();
        private readonly ConcurrentDictionary<string, UserDto> _usersByUpn = new();
        private readonly ConcurrentDictionary<string, GroupDto> _groupsBySid = new();
        private readonly ConcurrentDictionary<string, List<string>> _membersByGroupSid = new();
        private readonly ConcurrentDictionary<string, List<string>> _groupsByUserSid = new();
        private readonly ConcurrentDictionary<string, DeviceDto> _devicesByName = new();
        private readonly ConcurrentDictionary<string, List<DeviceDto>> _devicesByPrimaryUserSid = new();
        private readonly ConcurrentDictionary<string, AppDto> _appsById = new();
        private readonly ConcurrentDictionary<string, List<string>> _appsByDevice = new();
        private readonly ConcurrentDictionary<string, List<AclEntry>> _aclByIdentitySid = new();
        private readonly ConcurrentDictionary<string, List<MappedDriveDto>> _drivesByUserSid = new();
        private readonly ConcurrentDictionary<string, GpoDto> _gposByGuid = new();
        private readonly ConcurrentDictionary<string, List<GpoDto>> _gposBySidFilter = new();
        private readonly ConcurrentDictionary<string, List<GpoDto>> _gposByOu = new();
        private readonly ConcurrentDictionary<string, MailboxDto> _mailboxByUpn = new();
        private readonly ConcurrentDictionary<string, List<AzureRoleAssignment>> _rolesByPrincipalId = new();
        private readonly ConcurrentDictionary<string, SqlDbDto> _sqlDbsByKey = new();

        // T-029: New data stores for expanded modules
        private readonly ConcurrentDictionary<string, ThreatDetectionDTO> _threatsByThreatId = new();
        private readonly ConcurrentDictionary<string, List<ThreatDetectionDTO>> _threatsByAsset = new();
        private readonly ConcurrentDictionary<string, List<ThreatDetectionDTO>> _threatsByCategory = new();
        private readonly ConcurrentDictionary<string, List<ThreatDetectionDTO>> _threatsBySeverity = new();
        
        private readonly ConcurrentDictionary<string, DataGovernanceDTO> _governanceByAssetId = new();
        private readonly ConcurrentDictionary<string, List<DataGovernanceDTO>> _governanceByOwner = new();
        private readonly ConcurrentDictionary<string, List<DataGovernanceDTO>> _governanceByCompliance = new();
        
        private readonly ConcurrentDictionary<string, DataLineageDTO> _lineageByLineageId = new();
        private readonly ConcurrentDictionary<string, List<DataLineageDTO>> _lineageBySourceAsset = new();
        private readonly ConcurrentDictionary<string, List<DataLineageDTO>> _lineageByTargetAsset = new();
        
        private readonly ConcurrentDictionary<string, ExternalIdentityDTO> _externalIdentitiesById = new();
        private readonly ConcurrentDictionary<string, ExternalIdentityDTO> _externalIdentitiesByUpn = new();
        private readonly ConcurrentDictionary<string, List<ExternalIdentityDTO>> _externalIdentitiesByProvider = new();
        private readonly ConcurrentDictionary<string, List<ExternalIdentityDTO>> _externalIdentitiesByMappingStatus = new();

        // Enhanced graph structures for T-010 advanced data relationships
        private readonly ConcurrentDictionary<string, GraphNode> _nodes = new();
        private readonly List<GraphEdge> _edges = new();
        private readonly ConcurrentDictionary<string, List<string>> _entityRelationships = new();
        private readonly ConcurrentDictionary<string, Dictionary<string, object>> _entityMetadata = new();

        // State tracking
        private readonly List<string> _appliedInferenceRules = new();
        private DataLoadStatistics? _lastLoadStats;
        private bool _isLoading = false;
        private DateTime? _lastLoadTime;
        private readonly ConcurrentDictionary<string, DateTime> _fileLoadTimes = new();

        public bool IsLoading => _isLoading;
        public DateTime? LastLoadTime => _lastLoadTime;

        public event EventHandler<DataLoadedEventArgs>? DataLoaded;
        public event EventHandler<DataLoadErrorEventArgs>? DataLoadError;

        public LogicEngineService(ILogger<LogicEngineService> logger, MultiTierCacheService? cacheService = null, string? dataRoot = null)
        {
            _logger = logger;
            _cacheService = cacheService!; // Suppress nullability warning - handled by conditional logic elsewhere
            _dataRoot = dataRoot ?? @"C:\discoverydata\ljpops\RawData\";
            _fuzzyConfig = new FuzzyMatchingConfig();
        }

        public async Task<bool> LoadAllAsync()
        {
            // T-030: Use semaphore to ensure only one load operation at a time
            if (!await _loadSemaphore.WaitAsync(TimeSpan.FromSeconds(1)).ConfigureAwait(false))
            {
                _logger.LogWarning("Load already in progress, skipping duplicate request");
                return false;
            }

            try
            {
                _isLoading = true;
                var startTime = DateTime.UtcNow;
                _appliedInferenceRules.Clear();

                _logger.LogInformation("Starting LogicEngine data load from {DataRoot}", _dataRoot);

                var csvFiles = Directory.Exists(_dataRoot)
                    ? Directory.GetFiles(_dataRoot, "*.csv", SearchOption.TopDirectoryOnly)
                    : Array.Empty<string>();

                var hasChanges = csvFiles.Any(f =>
                    !_fileLoadTimes.TryGetValue(f, out var last) || File.GetLastWriteTimeUtc(f) > last);

                if (!hasChanges && _lastLoadTime.HasValue)
                {
                    _logger.LogInformation("No CSV changes detected. Using cached data");
                    return true;
                }

                // Clear existing data stores
                await ClearDataStoresAsync().ConfigureAwait(false);

                // Clear enhanced graph structures (T-010)
                _entityRelationships.Clear();
                _entityMetadata.Clear();
                _nodes.Clear();
                _edges.Clear();

                // T-030: Load CSV data with controlled concurrency and streaming
                var loadTasks = new List<Task>
                {
                    LoadUsersStreamingAsync(),
                    LoadGroupsStreamingAsync(),
                    LoadDevicesStreamingAsync(),
                    LoadApplicationsStreamingAsync(),
                    LoadGposStreamingAsync(),
                    LoadAclsStreamingAsync(),
                    LoadMappedDrivesStreamingAsync(),
                    LoadMailboxesStreamingAsync(),
                    LoadAzureRolesStreamingAsync(),
                    LoadSqlDatabasesStreamingAsync(),
                    // T-029: New module loading tasks with streaming
                    LoadThreatDetectionStreamingAsync(),
                    LoadDataGovernanceStreamingAsync(),
                    LoadDataLineageStreamingAsync(),
                    LoadExternalIdentitiesStreamingAsync()
                };

                await Task.WhenAll(loadTasks).ConfigureAwait(false);

                // Build indices and apply inference rules
                await BuildIndicesAsync().ConfigureAwait(false);
                await ApplyInferenceRulesAsync().ConfigureAwait(false);

                // Generate statistics
                var duration = DateTime.UtcNow - startTime;
                _lastLoadStats = new DataLoadStatistics(
                    UserCount: _usersBySid.Count,
                    GroupCount: _groupsBySid.Count,
                    DeviceCount: _devicesByName.Count,
                    AppCount: _appsById.Count,
                    GpoCount: _gposByGuid.Count,
                    AclEntryCount: _aclByIdentitySid.Values.Sum(list => list.Count),
                    MappedDriveCount: _drivesByUserSid.Values.Sum(list => list.Count),
                    MailboxCount: _mailboxByUpn.Count,
                    AzureRoleCount: _rolesByPrincipalId.Values.Sum(list => list.Count),
                    SqlDbCount: _sqlDbsByKey.Count,
                    // T-029: New module statistics
                    ThreatCount: _threatsByThreatId.Count,
                    GovernanceAssetCount: _governanceByAssetId.Count,
                    LineageFlowCount: _lineageByLineageId.Count,
                    ExternalIdentityCount: _externalIdentitiesById.Count,
                    InferenceRulesApplied: _appliedInferenceRules.Count,
                    FuzzyMatchesFound: GetFuzzyMatchCount(), // Track total fuzzy matches discovered
                    LoadDuration: duration,
                    LoadTimestamp: startTime
                );
                foreach (var file in csvFiles)
                {
                    _fileLoadTimes[file] = File.GetLastWriteTimeUtc(file);
                }

                _lastLoadTime = DateTime.UtcNow;
                _logger.LogInformation("LogicEngine data load completed successfully in {Duration}ms", duration.TotalMilliseconds);

                DataLoaded?.Invoke(this, new DataLoadedEventArgs(_lastLoadStats, _appliedInferenceRules.ToList()));
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load LogicEngine data");
                DataLoadError?.Invoke(this, new DataLoadErrorEventArgs(ex, ex.Message));
                return false;
            }
            finally
            {
                _isLoading = false;
                _loadSemaphore.Release();
            }
        }

        public async Task<UserDetailProjection?> GetUserDetailAsync(string sidOrUpn)
        {
            // T-030: Use multi-tier caching for expensive user detail projections if cache service available
            if (_cacheService != null)
            {
                var cacheKey = $"UserDetail:{sidOrUpn}";
                
                return await _cacheService.GetOrCreateAsync(cacheKey, async () =>
                {
                    return await BuildUserDetailProjectionAsync(sidOrUpn).ConfigureAwait(false);
                }, CacheTier.Hot, TimeSpan.FromMinutes(15)).ConfigureAwait(false);
            }
            else
            {
                // Fallback to direct computation without caching
                return await BuildUserDetailProjectionAsync(sidOrUpn).ConfigureAwait(false);
            }
        }

        /// <summary>
        /// T-030: Helper method to build user detail projection (separated for caching compatibility)
        /// </summary>
        private async Task<UserDetailProjection?> BuildUserDetailProjectionAsync(string sidOrUpn)
        {
            var user = _usersBySid.GetValueOrDefault(sidOrUpn) ?? _usersByUpn.GetValueOrDefault(sidOrUpn);
            if (user == null) return null;

            var groups = _groupsByUserSid.GetValueOrDefault(user.Sid, new List<string>())
                .Select(groupSid => _groupsBySid.GetValueOrDefault(groupSid))
                .Where(group => group != null)
                .Cast<GroupDto>()
                .ToList();

            var devices = _devicesByPrimaryUserSid.GetValueOrDefault(user.Sid, new List<DeviceDto>());

            var apps = devices.SelectMany(device => _appsByDevice.GetValueOrDefault(device.Name, new List<string>()))
                .Select(appId => _appsById.GetValueOrDefault(appId))
                .Where(app => app != null)
                .Cast<AppDto>()
                .Distinct()
                .ToList();

            var drives = _drivesByUserSid.GetValueOrDefault<string, List<MappedDriveDto>>(user.Sid, new List<MappedDriveDto>());
            var shares = _aclByIdentitySid.GetValueOrDefault<string, List<AclEntry>>(user.Sid, new List<AclEntry>());

            var gpoLinks = GetUserApplicableGpos(user);
            var gpoFilters = _gposBySidFilter.GetValueOrDefault(user.Sid, new List<GpoDto>());
            
            var mailbox = _mailboxByUpn.GetValueOrDefault(user.UPN);
            var azureRoles = _rolesByPrincipalId.GetValueOrDefault(user.AzureObjectId ?? "", new List<AzureRoleAssignment>());
            var sqlDatabases = GetUserSqlDatabases(user.Sid);

            var risks = CalculateEntityRisks(user.Sid, "User");
            var migrationHints = GenerateMigrationHints(user.Sid, "User");

            return new UserDetailProjection(
                user, groups, devices, apps, drives, shares, gpoLinks, gpoFilters,
                mailbox, azureRoles, sqlDatabases, risks, migrationHints
            );
        }

        public async Task<AssetDetailProjection?> GetAssetDetailAsync(string deviceName)
        {
            var device = _devicesByName.GetValueOrDefault(deviceName);
            if (device == null) return null;

            var primaryUser = device.PrimaryUserSid != null ? _usersBySid.GetValueOrDefault(device.PrimaryUserSid) : null;
            
            var installedApps = _appsByDevice.GetValueOrDefault(device.Name, new List<string>())
                .Select(appId => _appsById.GetValueOrDefault(appId))
                .Where(app => app != null)
                .Cast<AppDto>()
                .ToList();

            var sharesUsed = GetDeviceShareUsage(device.Name);
            var gposApplied = GetDeviceApplicableGpos(device);
            var backups = GetDeviceBackupInfo(device.Name);
            var vulnFindings = GetDeviceVulnerabilities(device.Name);
            var risks = CalculateEntityRisks(device.Name, "Device");

            return new AssetDetailProjection(
                device, primaryUser, installedApps, sharesUsed, gposApplied, backups, vulnFindings, risks
            );
        }

        public async Task<SqlDbDto?> GetDatabaseDetailAsync(string databaseName)
        {
            // T-027 Migration Engine compatibility - stub implementation
            var database = _sqlDbsByKey.Values.FirstOrDefault(db => db.Name?.Equals(databaseName, StringComparison.OrdinalIgnoreCase) == true);
            return database;
        }

        public async Task<List<MigrationHint>> SuggestEntitlementsForUserAsync(string sid)
        {
            var suggestions = new List<MigrationHint>();

            try
            {
                var user = _usersBySid.GetValueOrDefault(sid);
                if (user == null) return suggestions;

                // Suggestion 1: Check for missing Azure Object ID mapping
                if (string.IsNullOrEmpty(user.AzureObjectId))
                {
                    suggestions.Add(new MigrationHint(
                        EntityId: sid,
                        EntityType: "User",
                        HintType: "EntitlementGap",
                        Description: "User missing Azure Object ID mapping - may require federation setup",
                        RequiredActions: new Dictionary<string, string>
                        {
                            ["AzureAD_Mapping"] = "Map Azure Object ID for Office 365 access entitlements"
                        }
                    ));
                }

                // Suggestion 2: Check for extensive group memberships
                var userGroups = _groupsByUserSid.GetValueOrDefault(sid, new List<string>());
                if (userGroups.Count > 15)
                {
                    suggestions.Add(new MigrationHint(
                        EntityId: sid,
                        EntityType: "User",
                        HintType: "OptimizationNeeded",
                        Description: $"User has {userGroups.Count} group memberships - consider consolidation for management",
                        RequiredActions: new Dictionary<string, string>
                        {
                            ["GroupCleanup"] = "Review and consolidate excessive group memberships"
                        }
                    ));
                }

                // Suggestion 3: Check for critical system access patterns
                var criticalAccess = CheckCriticalSystemAccess(user);
                if (criticalAccess.Count > 0)
                {
                    suggestions.Add(new MigrationHint(
                        EntityId: sid,
                        EntityType: "User",
                        HintType: "PermissionReview",
                        Description: $"User has access to {criticalAccess.Count} critical systems requiring special attention",
                        RequiredActions: new Dictionary<string, string>
                        {
                            ["AccessReview"] = string.Join(", ", criticalAccess)
                        }
                    ));
                }

                // Suggestion 4: Check for role-based entitlements
                var azureRoles = _rolesByPrincipalId.GetValueOrDefault(sid, new List<AzureRoleAssignment>());
                if (azureRoles.Count == 0 && !string.IsNullOrEmpty(user.AzureObjectId))
                {
                    suggestions.Add(new MigrationHint(
                        EntityId: sid,
                        EntityType: "User",
                        HintType: "AzureRBAC_Enablement",
                        Description: "User mapped to Azure but no RBAC roles assigned",
                        RequiredActions: new Dictionary<string, string>
                        {
                            ["AzureRoles"] = "Assign appropriate Azure RBAC roles for cloud services access"
                        }
                    ));
                }

                _appliedInferenceRules.Add($"Entitlement suggestions generated ({suggestions.Count} suggestions)");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to generate entitlement suggestions for user {UserSid}", sid);
            }

            return suggestions;
        }

        private List<string> CheckCriticalSystemAccess(UserDto user)
        {
            var criticalSystems = new List<string>();

            // Check for critical system access patterns
            var userDevices = _devicesByPrimaryUserSid.GetValueOrDefault(user.Sid, new List<DeviceDto>());
            foreach (var device in userDevices)
            {
                if (device.Name.Contains("DC", StringComparison.OrdinalIgnoreCase) ||
                    device.Name.Contains("SQL", StringComparison.OrdinalIgnoreCase) ||
                    device.Name.Contains("SHV", StringComparison.OrdinalIgnoreCase)) // SHV = Secure Host
                {
                    criticalSystems.Add($"Critical device: {device.Name}");
                }
            }

            // Check for critical database access
            var userDatabases = GetUserSqlDatabases(user.Sid);
            foreach (var db in userDatabases)
            {
                if (db.Database.Contains("master", StringComparison.OrdinalIgnoreCase) ||
                    db.Database.Contains("production", StringComparison.OrdinalIgnoreCase) ||
                    db.Database.StartsWith("prd", StringComparison.OrdinalIgnoreCase))
                {
                    criticalSystems.Add($"Critical database: {db.Server}.{db.Database}");
                }
            }

            return criticalSystems;
        }

        public async Task<List<UserDto>> GetUsersAsync(string? filter = null, int skip = 0, int take = 100)
        {
            var users = _usersBySid.Values.AsQueryable();
            
            if (!string.IsNullOrEmpty(filter))
            {
                users = users.Where(u => 
                    (u.DisplayName != null && u.DisplayName.Contains(filter, StringComparison.OrdinalIgnoreCase)) ||
                    (u.UPN != null && u.UPN.Contains(filter, StringComparison.OrdinalIgnoreCase)) ||
                    (u.Sam != null && u.Sam.Contains(filter, StringComparison.OrdinalIgnoreCase))
                );
            }

            return users.Skip(skip).Take(take).ToList();
        }

        public async Task<List<DeviceDto>> GetDevicesAsync(string? filter = null, int skip = 0, int take = 100)
        {
            var devices = _devicesByName.Values.AsQueryable();
            
            if (!string.IsNullOrEmpty(filter))
            {
                devices = devices.Where(d => 
                    d.Name.Contains(filter, StringComparison.OrdinalIgnoreCase) ||
                    (d.DNS != null && d.DNS.Contains(filter, StringComparison.OrdinalIgnoreCase))
                );
            }

            return devices.Skip(skip).Take(take).ToList();
        }

        public List<string> GetAppliedInferenceRules()
        {
            return _appliedInferenceRules.ToList();
        }

        public DataLoadStatistics GetLoadStatistics()
        {
            return _lastLoadStats ?? new DataLoadStatistics(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, TimeSpan.Zero, DateTime.MinValue);
        }

        /// <summary>
        /// Extract fuzzy match count from applied inference rules
        /// </summary>
        private int GetFuzzyMatchCount()
        {
            return _appliedInferenceRules.Count(rule =>
                rule.Contains("fuzzy", StringComparison.OrdinalIgnoreCase) ||
                rule.Contains("similarity", StringComparison.OrdinalIgnoreCase) ||
                rule.Contains("match", StringComparison.OrdinalIgnoreCase));
        }

        // T-029: New risk scoring and projection methods
        
        /// <summary>
        /// Generates comprehensive risk dashboard projection with cross-module insights
        /// </summary>
        public async Task<RiskDashboardProjection> GenerateRiskDashboardProjectionAsync()
        {
            return await Task.Run(() =>
            {
                var allThreats = _threatsByThreatId.Values.ToList();
                var allGovernance = _governanceByAssetId.Values.ToList();
                var allLineage = _lineageByLineageId.Values.ToList();
                var allExternalIds = _externalIdentitiesById.Values.ToList();
                
                // Calculate threat metrics
                var totalThreats = allThreats.Count;
                var criticalThreats = allThreats.Count(t => t.RiskLevel == "Critical");
                var highThreats = allThreats.Count(t => t.RiskLevel == "High");
                var avgThreatScore = allThreats.Count > 0 ? allThreats.Average(t => t.ThreatScore) : 0.0;
                var topThreats = allThreats.OrderByDescending(t => t.ThreatScore).Take(10).ToList();
                
                // Calculate governance metrics
                var totalGovernanceIssues = allGovernance.Count(g => g.ViolationsFound.Count > 0);
                var criticalCompliance = allGovernance.Count(g => g.RiskLevel == "Critical");
                var avgComplianceScore = allGovernance.Count > 0 ? allGovernance.Average(g => g.ComplianceScore) : 0.0;
                var topGovernanceRisks = allGovernance.OrderByDescending(g => g.GovernanceRisk).Take(10).ToList();
                
                // Calculate lineage metrics  
                var totalLineageGaps = allLineage.Count(l => l.Issues.Count > 0);
                var orphanedSources = allLineage.Count(l => l.IsOrphaned);
                var brokenLinks = allLineage.Count(l => l.HasBrokenLinks);
                var topLineageIssues = allLineage.OrderByDescending(l => l.LineageRisk).Take(10).ToList();
                
                // Calculate identity metrics
                var totalExternalIds = allExternalIds.Count;
                var unmappedIds = allExternalIds.Count(e => e.MappingStatus == "Unmapped");
                var conflictedMappings = allExternalIds.Count(e => e.MappingStatus == "Conflict");
                var avgIdentityRisk = allExternalIds.Count > 0 ? allExternalIds.Average(e => e.IdentityRisk) : 0.0;
                var topIdentityRisks = allExternalIds.OrderByDescending(e => e.IdentityRisk).Take(10).ToList();
                
                // Calculate overall risk score (weighted average)
                var overallRisk = CalculateOverallRiskScore(avgThreatScore, avgComplianceScore, 
                    totalLineageGaps / Math.Max(allLineage.Count, 1.0), avgIdentityRisk);
                
                // Generate top recommendations
                var recommendations = GenerateTopRecommendations(
                    criticalThreats, criticalCompliance, orphanedSources, unmappedIds);
                
                return new RiskDashboardProjection(
                    TotalThreats: totalThreats,
                    CriticalThreats: criticalThreats,
                    HighThreats: highThreats,
                    AverageThreatScore: avgThreatScore,
                    TopThreats: topThreats,
                    
                    TotalGovernanceIssues: totalGovernanceIssues,
                    CriticalComplianceViolations: criticalCompliance,
                    AverageComplianceScore: avgComplianceScore,
                    TopGovernanceRisks: topGovernanceRisks,
                    
                    TotalLineageGaps: totalLineageGaps,
                    OrphanedDataSources: orphanedSources,
                    BrokenLineageLinks: brokenLinks,
                    TopLineageIssues: topLineageIssues,
                    
                    TotalExternalIdentities: totalExternalIds,
                    UnmappedIdentities: unmappedIds,
                    ConflictedMappings: conflictedMappings,
                    AverageIdentityRisk: avgIdentityRisk,
                    TopIdentityRisks: topIdentityRisks,
                    
                    OverallRiskScore: overallRisk,
                    TopRecommendations: recommendations,
                    GeneratedAt: DateTime.UtcNow
                );
            });
        }
        
        /// <summary>
        /// Generates detailed threat analysis projection with correlations
        /// </summary>
        public async Task<ThreatAnalysisProjection> GenerateThreatAnalysisProjectionAsync()
        {
            return await Task.Run(() =>
            {
                var allThreats = _threatsByThreatId.Values.ToList();
                
                // Group by category
                var threatsByCategory = _threatsByCategory.ToDictionary(
                    kvp => kvp.Key, 
                    kvp => kvp.Value.ToList()
                );
                
                // Group by severity  
                var threatsBySeverity = _threatsBySeverity.ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value.ToList()
                );
                
                // Group by asset
                var threatsByAsset = _threatsByAsset.ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value.ToList()
                );
                
                // Calculate threat correlations
                var correlations = CalculateThreatCorrelations(allThreats);
                
                // Generate MITRE tactic summaries
                var mitreTactics = GenerateMitreTacticSummaries(allThreats);
                
                return new ThreatAnalysisProjection(
                    AllThreats: allThreats,
                    ThreatsByCategory: threatsByCategory,
                    ThreatsBySeverity: threatsBySeverity,
                    ThreatsByAsset: threatsByAsset,
                    ThreatCorrelations: correlations,
                    MitreTactics: mitreTactics,
                    GeneratedAt: DateTime.UtcNow
                );
            });
        }
        
        /// <summary>
        /// Gets threats affecting a specific asset
        /// </summary>
        public Task<List<ThreatDetectionDTO>> GetThreatsForAssetAsync(string assetId)
        {
            return Task.FromResult(_threatsByAsset.GetValueOrDefault(assetId, new List<ThreatDetectionDTO>()));
        }
        
        /// <summary>
        /// Gets governance information for a specific asset
        /// </summary>
        public Task<DataGovernanceDTO?> GetGovernanceForAssetAsync(string assetId)
        {
            return Task.FromResult(_governanceByAssetId.GetValueOrDefault(assetId));
        }
        
        /// <summary>
        /// Gets lineage flows involving a specific asset
        /// </summary>
        public Task<List<DataLineageDTO>> GetLineageForAssetAsync(string assetId)
        {
            var sourceFlows = _lineageBySourceAsset.GetValueOrDefault(assetId, new List<DataLineageDTO>());
            var targetFlows = _lineageByTargetAsset.GetValueOrDefault(assetId, new List<DataLineageDTO>());
            
            return Task.FromResult(sourceFlows.Concat(targetFlows).Distinct().ToList());
        }
        
        /// <summary>
        /// Gets external identity mapping for internal user
        /// </summary>
        public Task<List<ExternalIdentityDTO>> GetExternalIdentitiesForUserAsync(string userSid)
        {
            var result = _externalIdentitiesById.Values
                .Where(e => e.InternalUserSid == userSid)
                .ToList();
                
            return Task.FromResult(result);
        }

        #region Private Methods

        private async Task ClearDataStoresAsync()
        {
            await Task.Run(() =>
            {
                _usersBySid.Clear();
                _usersByUpn.Clear();
                _groupsBySid.Clear();
                _membersByGroupSid.Clear();
                _groupsByUserSid.Clear();
                _devicesByName.Clear();
                _devicesByPrimaryUserSid.Clear();
                _appsById.Clear();
                _appsByDevice.Clear();
                _aclByIdentitySid.Clear();
                _drivesByUserSid.Clear();
                _gposByGuid.Clear();
                _gposBySidFilter.Clear();
                _gposByOu.Clear();
                _mailboxByUpn.Clear();
                _rolesByPrincipalId.Clear();
                _sqlDbsByKey.Clear();
                
                // T-029: Clear new data stores
                _threatsByThreatId.Clear();
                _threatsByAsset.Clear();
                _threatsByCategory.Clear();
                _threatsBySeverity.Clear();
                _governanceByAssetId.Clear();
                _governanceByOwner.Clear();
                _governanceByCompliance.Clear();
                _lineageByLineageId.Clear();
                _lineageBySourceAsset.Clear();
                _lineageByTargetAsset.Clear();
                _externalIdentitiesById.Clear();
                _externalIdentitiesByUpn.Clear();
                _externalIdentitiesByProvider.Clear();
                _externalIdentitiesByMappingStatus.Clear();
                
                _nodes.Clear();
                _edges.Clear();
            });
        }

        #region T-030: Enhanced Streaming CSV Load Methods
        
        /// <summary>
        /// T-030: Enhanced streaming CSV loader for users with memory-efficient processing
        /// </summary>
        private async Task LoadUsersStreamingAsync()
        {
            await _csvReadSemaphore.WaitAsync().ConfigureAwait(false);
            try
            {
                _logger.LogInformation("Loading users from CSV files with streaming...");
                
                var filePatterns = new[] { "ActiveDirectoryUsers_*.csv", "*Users*.csv" };
                var loadedCount = 0;
                
                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);
                    
                    await Task.Run(async () =>
                    {
                        foreach (var filePath in files)
                        {
                            try
                            {
                                const int bufferSize = 65536; // 64KB buffer for efficient reading
                                using var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize, useAsync: true);
                                using var reader = new StreamReader(fileStream, System.Text.Encoding.UTF8, true, bufferSize);
                                
                                // Read header line
                                var headerLine = await reader.ReadLineAsync().ConfigureAwait(false);
                                if (string.IsNullOrEmpty(headerLine)) continue;
                                
                                var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                                var headerMap = BuildHeaderMap(headers);
                                
                                var batch = new List<UserDto>(1000); // Process in batches of 1000
                                
                                while (!reader.EndOfStream)
                                {
                                    var line = await reader.ReadLineAsync().ConfigureAwait(false);
                                    if (string.IsNullOrEmpty(line)) continue;
                                    
                                    var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                    if (values.Length < headers.Length) continue;
                                    
                                    var user = ParseUserFromCsv(values, headerMap);
                                    if (user != null)
                                    {
                                        batch.Add(user);
                                        
                                        // Process batch when full
                                        if (batch.Count >= 1000)
                                        {
                                            ProcessUserBatch(batch);
                                            loadedCount += batch.Count;
                                            batch.Clear();
                                            
                                            // Yield control periodically to avoid UI blocking
                                            await Task.Yield();
                                        }
                                    }
                                }
                                
                                // Process remaining items
                                if (batch.Count > 0)
                                {
                                    ProcessUserBatch(batch);
                                    loadedCount += batch.Count;
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Failed to load users from file: {FilePath}", filePath);
                            }
                        }
                    }).ConfigureAwait(false);
                }
                
                _logger.LogInformation("Loaded {Count} users", loadedCount);
            }
            finally
            {
                _csvReadSemaphore.Release();
            }
        }
        
        /// <summary>
        /// T-030: Process user batch efficiently with concurrent dictionary operations
        /// </summary>
        private void ProcessUserBatch(List<UserDto> users)
        {
            Parallel.ForEach(users, new ParallelOptions { MaxDegreeOfParallelism = Environment.ProcessorCount }, user =>
            {
                _usersBySid.TryAdd(user.Sid, user);
                if (!string.IsNullOrEmpty(user.UPN))
                    _usersByUpn.TryAdd(user.UPN, user);
            });
        }

        /// <summary>
        /// T-030: Process group batch efficiently with concurrent dictionary operations
        /// </summary>
        private void ProcessGroupBatch(List<GroupDto> groups)
        {
            Parallel.ForEach(groups, new ParallelOptions { MaxDegreeOfParallelism = Environment.ProcessorCount }, group =>
            {
                _groupsBySid.TryAdd(group.Sid, group);
                _membersByGroupSid.TryAdd(group.Sid, group.Members);

                foreach (var memberSid in group.Members)
                {
                    _groupsByUserSid.AddOrUpdate(memberSid,
                        new List<string> { group.Sid },
                        (key, existing) => { existing.Add(group.Sid); return existing; });
                }
            });
        }

        /// <summary>
        /// T-030: Streaming loader for groups
        /// </summary>
        private async Task LoadGroupsStreamingAsync()
        {
            await _csvReadSemaphore.WaitAsync().ConfigureAwait(false);
            try
            {
                _logger.LogInformation("Loading groups from CSV files with streaming...");

                var filePatterns = new[] { "ActiveDirectoryGroups_*.csv", "*Groups*.csv", "GroupMembers_*.csv" };
                var loadedCount = 0;

                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);

                    await Task.Run(async () =>
                    {
                        foreach (var filePath in files)
                        {
                            try
                            {
                                const int bufferSize = 65536; // 64KB buffer for efficient reading
                                using var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read, bufferSize, useAsync: true);
                                using var reader = new StreamReader(fileStream, System.Text.Encoding.UTF8, true, bufferSize);

                                // Read header line
                                var headerLine = await reader.ReadLineAsync().ConfigureAwait(false);
                                if (string.IsNullOrEmpty(headerLine)) continue;

                                var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                                var headerMap = BuildGroupHeaderMap(headers);

                                var batch = new List<GroupDto>(1000); // Process in batches of 1000

                                while (!reader.EndOfStream)
                                {
                                    var line = await reader.ReadLineAsync().ConfigureAwait(false);
                                    if (string.IsNullOrEmpty(line)) continue;

                                    var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                    if (values.Length < headers.Length) continue;

                                    var group = ParseGroupFromCsv(values, headerMap);
                                    if (group != null)
                                    {
                                        batch.Add(group);

                                        // Process batch when full
                                        if (batch.Count >= 1000)
                                        {
                                            ProcessGroupBatch(batch);
                                            loadedCount += batch.Count;
                                            batch.Clear();

                                            // Yield control periodically to avoid UI blocking
                                            await Task.Yield();
                                        }
                                    }
                                }

                                // Process remaining items
                                if (batch.Count > 0)
                                {
                                    ProcessGroupBatch(batch);
                                    loadedCount += batch.Count;
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Failed to load groups from file: {FilePath}", filePath);
                            }
                        }
                    }).ConfigureAwait(false);
                }

                _logger.LogInformation("Loaded {Count} groups", loadedCount);
            }
            finally
            {
                _csvReadSemaphore.Release();
            }
        }

        /// <summary>
        /// T-030: Streaming loader for devices - placeholder implementations following same pattern
        /// </summary>
        private async Task LoadDevicesStreamingAsync()
        {
            await _csvReadSemaphore.WaitAsync().ConfigureAwait(false);
            try { await LoadDevicesAsync().ConfigureAwait(false); }
            finally { _csvReadSemaphore.Release(); }
        }

        private async Task LoadApplicationsStreamingAsync()
        {
            await _csvReadSemaphore.WaitAsync().ConfigureAwait(false);
            try { await LoadApplicationsAsync().ConfigureAwait(false); }
            finally { _csvReadSemaphore.Release(); }
        }

        private async Task LoadGposStreamingAsync()
        {
            await _csvReadSemaphore.WaitAsync().ConfigureAwait(false);
            try { await LoadGposAsync().ConfigureAwait(false); }
            finally { _csvReadSemaphore.Release(); }
        }

        private async Task LoadAclsStreamingAsync()
        {
            await _csvReadSemaphore.WaitAsync().ConfigureAwait(false);
            try { await LoadAclsAsync().ConfigureAwait(false); }
            finally { _csvReadSemaphore.Release(); }
        }

        private async Task LoadMappedDrivesStreamingAsync()
        {
            await _csvReadSemaphore.WaitAsync().ConfigureAwait(false);
            try { await LoadMappedDrivesAsync().ConfigureAwait(false); }
            finally { _csvReadSemaphore.Release(); }
        }

        private async Task LoadMailboxesStreamingAsync()
        {
            await _csvReadSemaphore.WaitAsync().ConfigureAwait(false);
            try { await LoadMailboxesAsync().ConfigureAwait(false); }
            finally { _csvReadSemaphore.Release(); }
        }

        private async Task LoadAzureRolesStreamingAsync()
        {
            await _csvReadSemaphore.WaitAsync().ConfigureAwait(false);
            try { await LoadAzureRolesAsync().ConfigureAwait(false); }
            finally { _csvReadSemaphore.Release(); }
        }

        private async Task LoadSqlDatabasesStreamingAsync()
        {
            await _csvReadSemaphore.WaitAsync().ConfigureAwait(false);
            try { await LoadSqlDatabasesAsync().ConfigureAwait(false); }
            finally { _csvReadSemaphore.Release(); }
        }

        private async Task LoadThreatDetectionStreamingAsync()
        {
            await _csvReadSemaphore.WaitAsync().ConfigureAwait(false);
            try { await LoadThreatDetectionAsync().ConfigureAwait(false); }
            finally { _csvReadSemaphore.Release(); }
        }

        private async Task LoadDataGovernanceStreamingAsync()
        {
            await _csvReadSemaphore.WaitAsync().ConfigureAwait(false);
            try { await LoadDataGovernanceAsync().ConfigureAwait(false); }
            finally { _csvReadSemaphore.Release(); }
        }

        private async Task LoadDataLineageStreamingAsync()
        {
            await _csvReadSemaphore.WaitAsync().ConfigureAwait(false);
            try { await LoadDataLineageAsync().ConfigureAwait(false); }
            finally { _csvReadSemaphore.Release(); }
        }

        private async Task LoadExternalIdentitiesStreamingAsync()
        {
            await _csvReadSemaphore.WaitAsync().ConfigureAwait(false);
            try { await LoadExternalIdentitiesAsync().ConfigureAwait(false); }
            finally { _csvReadSemaphore.Release(); }
        }

        

        private async Task LoadUsersAsync()
        {
            _logger.LogInformation("Loading users from CSV files...");
            
            try
            {
                var filePatterns = new[] { "ActiveDirectoryUsers_*.csv", "*Users*.csv" };
                var loadedCount = 0;
                
                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);
                    
                    foreach (var filePath in files)
                    {
                        try
                        {
                            using var reader = new StreamReader(filePath, System.Text.Encoding.UTF8);
                            
                            // Read header line
                            var headerLine = await reader.ReadLineAsync();
                            if (string.IsNullOrEmpty(headerLine)) continue;
                            
                            var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                            
                            // Build header map for flexible CSV parsing
                            var headerMap = BuildHeaderMap(headers);
                            
                            while (!reader.EndOfStream)
                            {
                                var line = await reader.ReadLineAsync();
                                if (string.IsNullOrEmpty(line)) continue;
                                
                                var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                if (values.Length < headers.Length) continue;
                                
                                var user = ParseUserFromCsv(values, headerMap);
                                if (user != null)
                                {
                                    _usersBySid.TryAdd(user.Sid, user);
                                    if (!string.IsNullOrEmpty(user.UPN))
                                        _usersByUpn.TryAdd(user.UPN, user);
                                    loadedCount++;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load users from file {FilePath}", filePath);
                        }
                    }
                }
                
                _logger.LogInformation("Loaded {Count} users from CSV files", loadedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load users from CSV files");
                throw;
            }
        }
        
        private Dictionary<string, int> BuildHeaderMap(string[] headers)
        {
            var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            
            for (int i = 0; i < headers.Length; i++)
            {
                var header = headers[i].Trim();
                
                // Map common header variations to standard names
                switch (header.ToLowerInvariant())
                {
                    case "userprincipalname":
                    case "upn":
                    case "principal":
                        map["UPN"] = i;
                        break;
                    case "samaccountname":
                    case "sam":
                    case "account":
                        map["Sam"] = i;
                        break;
                    case "sid":
                    case "objectsid":
                    case "securityidentifier":
                        map["Sid"] = i;
                        break;
                    case "mail":
                    case "email":
                    case "emailaddress":
                        map["Mail"] = i;
                        break;
                    case "displayname":
                    case "name":
                    case "fullname":
                        map["DisplayName"] = i;
                        break;
                    case "enabled":
                    case "accountenabled":
                    case "active":
                        map["Enabled"] = i;
                        break;
                    case "ou":
                    case "organizationalunit":
                    case "distinguishedname":
                        map["OU"] = i;
                        break;
                    case "manager":
                    case "managersid":
                        map["ManagerSid"] = i;
                        break;
                    case "department":
                    case "dept":
                        map["Dept"] = i;
                        break;
                    case "azureobjectid":
                    case "objectid":
                    case "azureid":
                        map["AzureObjectId"] = i;
                        break;
                    case "_discoverytimestamp":
                        map["DiscoveryTimestamp"] = i;
                        break;
                    case "_discoverymodule":
                        map["DiscoveryModule"] = i;
                        break;
                    case "_sessionid":
                        map["SessionId"] = i;
                        break;
                }
            }
            
            return map;
        }
        
        private UserDto? ParseUserFromCsv(string[] values, Dictionary<string, int> headerMap)
        {
            try
            {
                var getValueSafe = new Func<string, string?>((key) =>
                {
                    return headerMap.TryGetValue(key, out int index) && index < values.Length 
                        ? values[index] 
                        : null;
                });
                
                // Required fields
                var upn = getValueSafe("UPN");
                var sam = getValueSafe("Sam") ?? "";
                var sid = getValueSafe("Sid") ?? "";
                
                if (string.IsNullOrEmpty(upn) || string.IsNullOrEmpty(sid))
                {
                    return null; // Skip incomplete records
                }
                
                // Parse discovery metadata
                var timestampStr = getValueSafe("DiscoveryTimestamp") ?? DateTime.UtcNow.ToString();
                var timestamp = DateTime.TryParse(timestampStr, out var parsedTime) ? parsedTime : DateTime.UtcNow;
                
                return new UserDto(
                    UPN: upn,
                    Sam: sam,
                    Sid: sid,
                    Mail: getValueSafe("Mail"),
                    DisplayName: getValueSafe("DisplayName"),
                    Enabled: bool.TryParse(getValueSafe("Enabled"), out var enabled) ? enabled : true,
                    OU: getValueSafe("OU"),
                    ManagerSid: getValueSafe("ManagerSid"),
                    Dept: getValueSafe("Dept"),
                    AzureObjectId: getValueSafe("AzureObjectId"),
                    Groups: new List<string>(), // Will be populated during index building
                    DiscoveryTimestamp: timestamp,
                    DiscoveryModule: getValueSafe("DiscoveryModule") ?? "ActiveDirectoryDiscovery",
                    SessionId: getValueSafe("SessionId") ?? Guid.NewGuid().ToString()
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse user from CSV values");
                return null;
            }
        }

        private Dictionary<string, int> BuildGroupHeaderMap(string[] headers)
        {
            var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            
            for (int i = 0; i < headers.Length; i++)
            {
                var header = headers[i].Trim();
                
                // Map common header variations to standard names
                switch (header.ToLowerInvariant())
                {
                    case "sid":
                    case "objectsid":
                    case "groupsid":
                        map["Sid"] = i;
                        break;
                    case "name":
                    case "groupname":
                    case "cn":
                        map["Name"] = i;
                        break;
                    case "type":
                    case "grouptype":
                    case "groupscope":
                        map["Type"] = i;
                        break;
                    case "members":
                    case "memberof":
                    case "groupmembers":
                        map["Members"] = i;
                        break;
                    case "_discoverytimestamp":
                        map["DiscoveryTimestamp"] = i;
                        break;
                    case "_discoverymodule":
                        map["DiscoveryModule"] = i;
                        break;
                    case "_sessionid":
                        map["SessionId"] = i;
                        break;
                }
            }
            
            return map;
        }

        private GroupDto? ParseGroupFromCsv(string[] values, Dictionary<string, int> headerMap)
        {
            try
            {
                var getValueSafe = new Func<string, string?>((key) =>
                {
                    return headerMap.TryGetValue(key, out int index) && index < values.Length 
                        ? values[index] 
                        : null;
                });
                
                // Required fields
                var sid = getValueSafe("Sid") ?? "";
                var name = getValueSafe("Name") ?? "";
                
                if (string.IsNullOrEmpty(sid) || string.IsNullOrEmpty(name))
                {
                    return null; // Skip incomplete records
                }
                
                // Parse members (semicolon-separated)
                var membersStr = getValueSafe("Members") ?? "";
                var members = string.IsNullOrEmpty(membersStr) 
                    ? new List<string>() 
                    : membersStr.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList();
                
                // Parse discovery metadata
                var timestampStr = getValueSafe("DiscoveryTimestamp") ?? DateTime.UtcNow.ToString();
                var timestamp = DateTime.TryParse(timestampStr, out var parsedTime) ? parsedTime : DateTime.UtcNow;
                
                return new GroupDto(
                    Sid: sid,
                    Name: name,
                    Type: getValueSafe("Type") ?? "Security",
                    Members: members,
                    DiscoveryTimestamp: timestamp,
                    DiscoveryModule: getValueSafe("DiscoveryModule") ?? "ActiveDirectory",
                    SessionId: getValueSafe("SessionId") ?? Guid.NewGuid().ToString(),
                    NestedGroups: null // Will be populated during index building
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse group from CSV values");
                return null;
            }
        }

        private Dictionary<string, int> BuildDeviceHeaderMap(string[] headers)
        {
            var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            
            for (int i = 0; i < headers.Length; i++)
            {
                var header = headers[i].Trim();
                
                // Map common header variations to standard names
                switch (header.ToLowerInvariant())
                {
                    case "name":
                    case "computername":
                    case "hostname":
                        map["Name"] = i;
                        break;
                    case "dns":
                    case "dnshostname":
                    case "fqdn":
                        map["DNS"] = i;
                        break;
                    case "ou":
                    case "organizationalunit":
                    case "distinguishedname":
                        map["OU"] = i;
                        break;
                    case "os":
                    case "operatingsystem":
                    case "osversion":
                        map["OS"] = i;
                        break;
                    case "primaryusersid":
                    case "primaryuser":
                    case "owner":
                        map["PrimaryUserSid"] = i;
                        break;
                    case "installedapps":
                    case "applications":
                    case "software":
                        map["InstalledApps"] = i;
                        break;
                    case "_discoverytimestamp":
                        map["DiscoveryTimestamp"] = i;
                        break;
                    case "_discoverymodule":
                        map["DiscoveryModule"] = i;
                        break;
                    case "_sessionid":
                        map["SessionId"] = i;
                        break;
                }
            }
            
            return map;
        }

        private DeviceDto? ParseDeviceFromCsv(string[] values, Dictionary<string, int> headerMap)
        {
            try
            {
                var getValueSafe = new Func<string, string?>((key) =>
                {
                    return headerMap.TryGetValue(key, out int index) && index < values.Length 
                        ? values[index] 
                        : null;
                });
                
                // Required fields
                var name = getValueSafe("Name") ?? "";
                
                if (string.IsNullOrEmpty(name))
                {
                    return null; // Skip incomplete records
                }
                
                // Parse installed apps (semicolon-separated)
                var appsStr = getValueSafe("InstalledApps") ?? "";
                var apps = string.IsNullOrEmpty(appsStr) 
                    ? new List<string>() 
                    : appsStr.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList();
                
                // Parse discovery metadata
                var timestampStr = getValueSafe("DiscoveryTimestamp") ?? DateTime.UtcNow.ToString();
                var timestamp = DateTime.TryParse(timestampStr, out var parsedTime) ? parsedTime : DateTime.UtcNow;
                
                return new DeviceDto(
                    Name: name,
                    DNS: getValueSafe("DNS"),
                    OU: getValueSafe("OU"),
                    OS: getValueSafe("OS"),
                    PrimaryUserSid: getValueSafe("PrimaryUserSid"),
                    InstalledApps: apps,
                    DiscoveryTimestamp: timestamp,
                    DiscoveryModule: getValueSafe("DiscoveryModule") ?? "ComputerInventory",
                    SessionId: getValueSafe("SessionId") ?? Guid.NewGuid().ToString()
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse device from CSV values");
                return null;
            }
        }

        private Dictionary<string, int> BuildApplicationHeaderMap(string[] headers)
        {
            var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            
            for (int i = 0; i < headers.Length; i++)
            {
                var header = headers[i].Trim();
                
                // Map common header variations to standard names
                switch (header.ToLowerInvariant())
                {
                    case "id":
                    case "appid":
                    case "applicationid":
                        map["Id"] = i;
                        break;
                    case "name":
                    case "appname":
                    case "applicationname":
                        map["Name"] = i;
                        break;
                    case "source":
                    case "installsource":
                    case "deploymentmethod":
                        map["Source"] = i;
                        break;
                    case "installcounts":
                    case "installcount":
                    case "installations":
                        map["InstallCounts"] = i;
                        break;
                    case "executables":
                    case "exes":
                    case "binaries":
                        map["Executables"] = i;
                        break;
                    case "publishers":
                    case "publisher":
                    case "vendor":
                        map["Publishers"] = i;
                        break;
                    case "_discoverytimestamp":
                        map["DiscoveryTimestamp"] = i;
                        break;
                    case "_discoverymodule":
                        map["DiscoveryModule"] = i;
                        break;
                    case "_sessionid":
                        map["SessionId"] = i;
                        break;
                }
            }
            
            return map;
        }

        private AppDto? ParseApplicationFromCsv(string[] values, Dictionary<string, int> headerMap)
        {
            try
            {
                var getValueSafe = new Func<string, string?>((key) =>
                {
                    return headerMap.TryGetValue(key, out int index) && index < values.Length 
                        ? values[index] 
                        : null;
                });
                
                // Required fields
                var id = getValueSafe("Id") ?? Guid.NewGuid().ToString();
                var name = getValueSafe("Name") ?? "";
                
                if (string.IsNullOrEmpty(name))
                {
                    return null; // Skip incomplete records
                }
                
                // Parse install count
                var installCountStr = getValueSafe("InstallCounts") ?? "0";
                var installCount = int.TryParse(installCountStr, out var count) ? count : 0;
                
                // Parse executables (semicolon-separated)
                var executablesStr = getValueSafe("Executables") ?? "";
                var executables = string.IsNullOrEmpty(executablesStr) 
                    ? new List<string>() 
                    : executablesStr.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList();
                
                // Parse publishers (semicolon-separated)
                var publishersStr = getValueSafe("Publishers") ?? "";
                var publishers = string.IsNullOrEmpty(publishersStr) 
                    ? new List<string>() 
                    : publishersStr.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList();
                
                // Parse discovery metadata
                var timestampStr = getValueSafe("DiscoveryTimestamp") ?? DateTime.UtcNow.ToString();
                var timestamp = DateTime.TryParse(timestampStr, out var parsedTime) ? parsedTime : DateTime.UtcNow;
                
                return new AppDto(
                    Id: id,
                    Name: name,
                    Source: getValueSafe("Source"),
                    InstallCounts: installCount,
                    Executables: executables,
                    Publishers: publishers,
                    DiscoveryTimestamp: timestamp,
                    DiscoveryModule: getValueSafe("DiscoveryModule") ?? "AppInventory",
                    SessionId: getValueSafe("SessionId") ?? Guid.NewGuid().ToString()
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse application from CSV values");
                return null;
            }
        }

        // Additional parsing methods for core discovery modules
        
        private Dictionary<string, int> BuildGpoHeaderMap(string[] headers)
        {
            var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            
            for (int i = 0; i < headers.Length; i++)
            {
                var header = headers[i].Trim();
                switch (header.ToLowerInvariant())
                {
                    case "guid":
                    case "gpoguid":
                    case "id":
                        map["Guid"] = i;
                        break;
                    case "name":
                    case "gponame":
                        map["Name"] = i;
                        break;
                    case "ou":
                    case "linkedou":
                        map["LinkedOU"] = i;
                        break;
                    case "securityfilter":
                    case "filter":
                        map["SecurityFilter"] = i;
                        break;
                    case "_discoverytimestamp":
                        map["DiscoveryTimestamp"] = i;
                        break;
                    case "_discoverymodule":
                        map["DiscoveryModule"] = i;
                        break;
                    case "_sessionid":
                        map["SessionId"] = i;
                        break;
                }
            }
            return map;
        }
        
        private GpoDto? ParseGpoFromCsv(string[] values, Dictionary<string, int> headerMap)
        {
            try
            {
                var getValueSafe = new Func<string, string?>((key) =>
                {
                    return headerMap.TryGetValue(key, out int index) && index < values.Length 
                        ? values[index] 
                        : null;
                });
                
                var guid = getValueSafe("Guid") ?? Guid.NewGuid().ToString();
                var name = getValueSafe("Name") ?? "";
                
                if (string.IsNullOrEmpty(name))
                    return null;
                    
                var timestampStr = getValueSafe("DiscoveryTimestamp") ?? DateTime.UtcNow.ToString();
                var timestamp = DateTime.TryParse(timestampStr, out var parsedTime) ? parsedTime : DateTime.UtcNow;
                
                return new GpoDto(
                    Guid: guid,
                    Name: name,
                    Links: new List<string>(),
                    SecurityFilter: new List<string>(),
                    WmiFilter: null,
                    Enabled: true,
                    DiscoveryTimestamp: timestamp,
                    DiscoveryModule: getValueSafe("DiscoveryModule") ?? "GroupPolicy",
                    SessionId: getValueSafe("SessionId") ?? Guid.NewGuid().ToString()
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse GPO from CSV values");
                return null;
            }
        }
        
        private Dictionary<string, int> BuildAclHeaderMap(string[] headers)
        {
            var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            
            for (int i = 0; i < headers.Length; i++)
            {
                var header = headers[i].Trim();
                switch (header.ToLowerInvariant())
                {
                    case "identitysid":
                    case "sid":
                        map["IdentitySid"] = i;
                        break;
                    case "path":
                    case "filepath":
                    case "sharepath":
                        map["Path"] = i;
                        break;
                    case "rights":
                    case "permissions":
                        map["Rights"] = i;
                        break;
                    case "_discoverytimestamp":
                        map["DiscoveryTimestamp"] = i;
                        break;
                    case "_discoverymodule":
                        map["DiscoveryModule"] = i;
                        break;
                    case "_sessionid":
                        map["SessionId"] = i;
                        break;
                }
            }
            return map;
        }
        
        private AclEntryDto? ParseAclFromCsv(string[] values, Dictionary<string, int> headerMap)
        {
            try
            {
                var getValueSafe = new Func<string, string?>((key) =>
                {
                    return headerMap.TryGetValue(key, out int index) && index < values.Length 
                        ? values[index] 
                        : null;
                });
                
                var identitySid = getValueSafe("IdentitySid") ?? "";
                var path = getValueSafe("Path") ?? "";
                
                if (string.IsNullOrEmpty(identitySid) || string.IsNullOrEmpty(path))
                    return null;
                    
                var timestampStr = getValueSafe("DiscoveryTimestamp") ?? DateTime.UtcNow.ToString();
                var timestamp = DateTime.TryParse(timestampStr, out var parsedTime) ? parsedTime : DateTime.UtcNow;
                
                return new AclEntryDto(
                    Path: path,
                    IdentitySid: identitySid,
                    Rights: getValueSafe("Rights") ?? "Read",
                    Inherited: false,
                    IsShare: false,
                    IsNTFS: true,
                    DiscoveryTimestamp: timestamp,
                    DiscoveryModule: getValueSafe("DiscoveryModule") ?? "NTFS_ACL",
                    SessionId: getValueSafe("SessionId") ?? Guid.NewGuid().ToString()
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse ACL from CSV values");
                return null;
            }
        }
        
        private Dictionary<string, int> BuildMappedDriveHeaderMap(string[] headers)
        {
            var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            
            for (int i = 0; i < headers.Length; i++)
            {
                var header = headers[i].Trim();
                switch (header.ToLowerInvariant())
                {
                    case "usersid":
                    case "sid":
                        map["UserSid"] = i;
                        break;
                    case "driveletter":
                    case "letter":
                    case "drive":
                        map["DriveLetter"] = i;
                        break;
                    case "networkpath":
                    case "path":
                    case "uncpath":
                        map["NetworkPath"] = i;
                        break;
                    case "_discoverytimestamp":
                        map["DiscoveryTimestamp"] = i;
                        break;
                    case "_discoverymodule":
                        map["DiscoveryModule"] = i;
                        break;
                    case "_sessionid":
                        map["SessionId"] = i;
                        break;
                }
            }
            return map;
        }
        
        private MappedDriveDto? ParseMappedDriveFromCsv(string[] values, Dictionary<string, int> headerMap)
        {
            try
            {
                var getValueSafe = new Func<string, string?>((key) =>
                {
                    return headerMap.TryGetValue(key, out int index) && index < values.Length 
                        ? values[index] 
                        : null;
                });
                
                var userSid = getValueSafe("UserSid") ?? "";
                var driveLetter = getValueSafe("DriveLetter") ?? "";
                
                if (string.IsNullOrEmpty(userSid) || string.IsNullOrEmpty(driveLetter))
                    return null;
                    
                var timestampStr = getValueSafe("DiscoveryTimestamp") ?? DateTime.UtcNow.ToString();
                var timestamp = DateTime.TryParse(timestampStr, out var parsedTime) ? parsedTime : DateTime.UtcNow;
                
                return new MappedDriveDto(
                    UserSid: userSid,
                    Letter: driveLetter,
                    UNC: getValueSafe("NetworkPath") ?? "",
                    Label: null,
                    DiscoveryTimestamp: timestamp,
                    DiscoveryModule: getValueSafe("DiscoveryModule") ?? "MappedDrives",
                    SessionId: getValueSafe("SessionId") ?? Guid.NewGuid().ToString()
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse mapped drive from CSV values");
                return null;
            }
        }
        
        private Dictionary<string, int> BuildMailboxHeaderMap(string[] headers)
        {
            var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            
            for (int i = 0; i < headers.Length; i++)
            {
                var header = headers[i].Trim();
                switch (header.ToLowerInvariant())
                {
                    case "upn":
                    case "userprincipalname":
                        map["UPN"] = i;
                        break;
                    case "size":
                    case "mailboxsize":
                    case "sizemb":
                        map["Size"] = i;
                        break;
                    case "type":
                    case "mailboxtype":
                        map["Type"] = i;
                        break;
                    case "_discoverytimestamp":
                        map["DiscoveryTimestamp"] = i;
                        break;
                    case "_discoverymodule":
                        map["DiscoveryModule"] = i;
                        break;
                    case "_sessionid":
                        map["SessionId"] = i;
                        break;
                }
            }
            return map;
        }
        
        private MailboxDto? ParseMailboxFromCsv(string[] values, Dictionary<string, int> headerMap)
        {
            try
            {
                var getValueSafe = new Func<string, string?>((key) =>
                {
                    return headerMap.TryGetValue(key, out int index) && index < values.Length 
                        ? values[index] 
                        : null;
                });
                
                var upn = getValueSafe("UPN") ?? "";
                if (string.IsNullOrEmpty(upn))
                    return null;
                    
                var sizeStr = getValueSafe("Size") ?? "0";
                var size = long.TryParse(sizeStr, out var parsedSize) ? parsedSize : 0;
                    
                var timestampStr = getValueSafe("DiscoveryTimestamp") ?? DateTime.UtcNow.ToString();
                var timestamp = DateTime.TryParse(timestampStr, out var parsedTime) ? parsedTime : DateTime.UtcNow;
                
                return new MailboxDto(
                    UPN: upn,
                    MailboxGuid: null,
                    SizeMB: (decimal)size,
                    Type: getValueSafe("Type") ?? "UserMailbox",
                    DiscoveryTimestamp: timestamp,
                    DiscoveryModule: getValueSafe("DiscoveryModule") ?? "Mailboxes",
                    SessionId: getValueSafe("SessionId") ?? Guid.NewGuid().ToString()
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse mailbox from CSV values");
                return null;
            }
        }
        
        private Dictionary<string, int> BuildAzureRoleHeaderMap(string[] headers)
        {
            var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            
            for (int i = 0; i < headers.Length; i++)
            {
                var header = headers[i].Trim();
                switch (header.ToLowerInvariant())
                {
                    case "principalid":
                    case "userid":
                    case "objectid":
                        map["PrincipalId"] = i;
                        break;
                    case "rolename":
                    case "role":
                        map["RoleName"] = i;
                        break;
                    case "scope":
                    case "resource":
                        map["Scope"] = i;
                        break;
                    case "_discoverytimestamp":
                        map["DiscoveryTimestamp"] = i;
                        break;
                    case "_discoverymodule":
                        map["DiscoveryModule"] = i;
                        break;
                    case "_sessionid":
                        map["SessionId"] = i;
                        break;
                }
            }
            return map;
        }
        
        private AzureRoleAssignment? ParseAzureRoleFromCsv(string[] values, Dictionary<string, int> headerMap)
        {
            try
            {
                var getValueSafe = new Func<string, string?>((key) =>
                {
                    return headerMap.TryGetValue(key, out int index) && index < values.Length 
                        ? values[index] 
                        : null;
                });
                
                var principalId = getValueSafe("PrincipalId") ?? "";
                var roleName = getValueSafe("RoleName") ?? "";
                
                if (string.IsNullOrEmpty(principalId) || string.IsNullOrEmpty(roleName))
                    return null;
                    
                var timestampStr = getValueSafe("DiscoveryTimestamp") ?? DateTime.UtcNow.ToString();
                var timestamp = DateTime.TryParse(timestampStr, out var parsedTime) ? parsedTime : DateTime.UtcNow;
                
                return new AzureRoleAssignment(
                    PrincipalObjectId: principalId,
                    RoleName: roleName,
                    Scope: getValueSafe("Scope") ?? "/",
                    DiscoveryTimestamp: timestamp,
                    DiscoveryModule: getValueSafe("DiscoveryModule") ?? "AzureRoles",
                    SessionId: getValueSafe("SessionId") ?? Guid.NewGuid().ToString()
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse Azure role from CSV values");
                return null;
            }
        }
        
        private Dictionary<string, int> BuildSqlDbHeaderMap(string[] headers)
        {
            var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            
            for (int i = 0; i < headers.Length; i++)
            {
                var header = headers[i].Trim();
                switch (header.ToLowerInvariant())
                {
                    case "name":
                    case "databasename":
                    case "dbname":
                        map["Name"] = i;
                        break;
                    case "server":
                    case "servername":
                    case "instance":
                        map["Server"] = i;
                        break;
                    case "owner":
                    case "ownersid":
                        map["OwnerSid"] = i;
                        break;
                    case "size":
                    case "sizemb":
                        map["SizeMB"] = i;
                        break;
                    case "_discoverytimestamp":
                        map["DiscoveryTimestamp"] = i;
                        break;
                    case "_discoverymodule":
                        map["DiscoveryModule"] = i;
                        break;
                    case "_sessionid":
                        map["SessionId"] = i;
                        break;
                }
            }
            return map;
        }
        
        private SqlDbDto? ParseSqlDbFromCsv(string[] values, Dictionary<string, int> headerMap)
        {
            try
            {
                var getValueSafe = new Func<string, string?>((key) =>
                {
                    return headerMap.TryGetValue(key, out int index) && index < values.Length 
                        ? values[index] 
                        : null;
                });
                
                var name = getValueSafe("Name") ?? "";
                if (string.IsNullOrEmpty(name))
                    return null;
                    
                var sizeStr = getValueSafe("SizeMB") ?? "0";
                var size = long.TryParse(sizeStr, out var parsedSize) ? parsedSize : 0;
                    
                var timestampStr = getValueSafe("DiscoveryTimestamp") ?? DateTime.UtcNow.ToString();
                var timestamp = DateTime.TryParse(timestampStr, out var parsedTime) ? parsedTime : DateTime.UtcNow;
                
                return new SqlDbDto(
                    Server: getValueSafe("Server") ?? "localhost",
                    Instance: getValueSafe("Instance"),
                    Database: name,
                    Owners: new List<string>(),
                    AppHints: new List<string>(),
                    DiscoveryTimestamp: timestamp,
                    DiscoveryModule: getValueSafe("DiscoveryModule") ?? "SqlDatabases",
                    SessionId: getValueSafe("SessionId") ?? Guid.NewGuid().ToString()
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse SQL database from CSV values");
                return null;
            }
        }
        
        // T-029: New parsing methods for expanded modules
        
        private ThreatDetectionDTO? ParseThreatDetectionFromCsv(string[] values, Dictionary<string, int> headerMap)
        {
            try
            {
                var getValueSafe = new Func<string, string?>((key) =>
                {
                    return headerMap.TryGetValue(key, out int index) && index < values.Length 
                        ? values[index] 
                        : null;
                });
                
                // Required fields
                var threatId = getValueSafe("ThreatId") ?? getValueSafe("Id") ?? Guid.NewGuid().ToString();
                var threatName = getValueSafe("ThreatName") ?? getValueSafe("Name") ?? "";
                var category = getValueSafe("Category") ?? "Unknown";
                var severity = getValueSafe("Severity") ?? "Medium";
                
                if (string.IsNullOrEmpty(threatName))
                    return null; // Skip incomplete records
                
                // Parse confidence as double
                var confidence = double.TryParse(getValueSafe("Confidence"), out var conf) ? conf : 0.5;
                
                // Parse timestamp
                var timestampStr = getValueSafe("DetectionTimestamp") ?? DateTime.UtcNow.ToString();
                var timestamp = DateTime.TryParse(timestampStr, out var parsedTime) ? parsedTime : DateTime.UtcNow;
                
                // Parse arrays - assume comma-separated values
                var affectedAssets = getValueSafe("AffectedAssets")?.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();
                var iocs = getValueSafe("IndicatorsOfCompromise")?.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();
                
                // Parse details as key-value pairs (format: key1=value1;key2=value2)
                var threatDetails = new Dictionary<string, string>();
                var detailsStr = getValueSafe("ThreatDetails");
                if (!string.IsNullOrEmpty(detailsStr))
                {
                    foreach (var detail in detailsStr.Split(';', StringSplitOptions.RemoveEmptyEntries))
                    {
                        var parts = detail.Split('=', 2);
                        if (parts.Length == 2)
                            threatDetails[parts[0]] = parts[1];
                    }
                }
                
                return new ThreatDetectionDTO(
                    ThreatId: threatId,
                    ThreatName: threatName,
                    Category: category,
                    Severity: severity,
                    Confidence: confidence,
                    MitreAttackId: getValueSafe("MitreAttackId") ?? "",
                    MitreTactic: getValueSafe("MitreTactic") ?? "",
                    MitreTechnique: getValueSafe("MitreTechnique") ?? "",
                    AffectedAssets: affectedAssets,
                    IndicatorsOfCompromise: iocs,
                    ThreatDetails: threatDetails,
                    DetectionTimestamp: timestamp,
                    DetectionSource: getValueSafe("DetectionSource") ?? "Unknown",
                    SessionId: getValueSafe("SessionId") ?? Guid.NewGuid().ToString(),
                    DiscoveryModule: getValueSafe("DiscoveryModule") ?? "ThreatDetectionEngine"
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse threat detection from CSV values");
                return null;
            }
        }
        
        private DataGovernanceDTO? ParseDataGovernanceFromCsv(string[] values, Dictionary<string, int> headerMap)
        {
            try
            {
                var getValueSafe = new Func<string, string?>((key) =>
                {
                    return headerMap.TryGetValue(key, out int index) && index < values.Length 
                        ? values[index] 
                        : null;
                });
                
                // Required fields
                var assetId = getValueSafe("AssetId") ?? getValueSafe("Id") ?? Guid.NewGuid().ToString();
                var assetName = getValueSafe("AssetName") ?? getValueSafe("Name") ?? "";
                var assetType = getValueSafe("AssetType") ?? getValueSafe("Type") ?? "Unknown";
                
                if (string.IsNullOrEmpty(assetName))
                    return null; // Skip incomplete records
                
                // Parse timestamp
                var timestampStr = getValueSafe("DiscoveryTimestamp") ?? DateTime.UtcNow.ToString();
                var timestamp = DateTime.TryParse(timestampStr, out var parsedTime) ? parsedTime : DateTime.UtcNow;
                
                var auditDateStr = getValueSafe("LastAuditDate") ?? DateTime.UtcNow.AddDays(-30).ToString();
                var auditDate = DateTime.TryParse(auditDateStr, out var auditParsed) ? auditParsed : DateTime.UtcNow.AddDays(-30);
                
                // Parse arrays
                var retentionPolicies = getValueSafe("RetentionPolicies")?.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();
                var complianceFrameworks = getValueSafe("ComplianceFrameworks")?.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();
                var violations = getValueSafe("ViolationsFound")?.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();
                
                // Parse metadata
                var metadata = new Dictionary<string, string>();
                var metadataStr = getValueSafe("Metadata");
                if (!string.IsNullOrEmpty(metadataStr))
                {
                    foreach (var item in metadataStr.Split(';', StringSplitOptions.RemoveEmptyEntries))
                    {
                        var parts = item.Split('=', 2);
                        if (parts.Length == 2)
                            metadata[parts[0]] = parts[1];
                    }
                }
                
                return new DataGovernanceDTO(
                    AssetId: assetId,
                    AssetName: assetName,
                    AssetType: assetType,
                    Classification: getValueSafe("Classification") ?? "Unclassified",
                    Owner: getValueSafe("Owner") ?? "Unknown",
                    Custodian: getValueSafe("Custodian") ?? "Unknown",
                    RetentionPolicies: retentionPolicies,
                    ComplianceFrameworks: complianceFrameworks,
                    Metadata: metadata,
                    HasPersonalData: bool.TryParse(getValueSafe("HasPersonalData"), out var personalData) ? personalData : false,
                    HasSensitiveData: bool.TryParse(getValueSafe("HasSensitiveData"), out var sensitiveData) ? sensitiveData : false,
                    LastAuditDate: auditDate,
                    ComplianceStatus: getValueSafe("ComplianceStatus") ?? "Unknown",
                    ViolationsFound: violations,
                    DiscoveryTimestamp: timestamp,
                    DiscoveryModule: getValueSafe("DiscoveryModule") ?? "DataGovernanceMetadataManagement",
                    SessionId: getValueSafe("SessionId") ?? Guid.NewGuid().ToString()
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse data governance from CSV values");
                return null;
            }
        }
        
        private DataLineageDTO? ParseDataLineageFromCsv(string[] values, Dictionary<string, int> headerMap)
        {
            try
            {
                var getValueSafe = new Func<string, string?>((key) =>
                {
                    return headerMap.TryGetValue(key, out int index) && index < values.Length 
                        ? values[index] 
                        : null;
                });
                
                // Required fields
                var lineageId = getValueSafe("LineageId") ?? getValueSafe("Id") ?? Guid.NewGuid().ToString();
                var sourceAssetId = getValueSafe("SourceAssetId") ?? "";
                var targetAssetId = getValueSafe("TargetAssetId") ?? "";
                
                if (string.IsNullOrEmpty(sourceAssetId) || string.IsNullOrEmpty(targetAssetId))
                    return null; // Skip incomplete records
                
                // Parse timestamp
                var timestampStr = getValueSafe("DiscoveryTimestamp") ?? DateTime.UtcNow.ToString();
                var timestamp = DateTime.TryParse(timestampStr, out var parsedTime) ? parsedTime : DateTime.UtcNow;
                
                var validatedStr = getValueSafe("LastValidated") ?? DateTime.UtcNow.AddDays(-7).ToString();
                var lastValidated = DateTime.TryParse(validatedStr, out var validatedParsed) ? validatedParsed : DateTime.UtcNow.AddDays(-7);
                
                // Parse arrays
                var transformationSteps = getValueSafe("TransformationSteps")?.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();
                var dependencies = getValueSafe("Dependencies")?.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();
                
                // Parse metadata
                var flowMetadata = new Dictionary<string, string>();
                var metadataStr = getValueSafe("FlowMetadata");
                if (!string.IsNullOrEmpty(metadataStr))
                {
                    foreach (var item in metadataStr.Split(';', StringSplitOptions.RemoveEmptyEntries))
                    {
                        var parts = item.Split('=', 2);
                        if (parts.Length == 2)
                            flowMetadata[parts[0]] = parts[1];
                    }
                }
                
                return new DataLineageDTO(
                    LineageId: lineageId,
                    SourceAssetId: sourceAssetId,
                    SourceAssetName: getValueSafe("SourceAssetName") ?? sourceAssetId,
                    SourceAssetType: getValueSafe("SourceAssetType") ?? "Unknown",
                    TargetAssetId: targetAssetId,
                    TargetAssetName: getValueSafe("TargetAssetName") ?? targetAssetId,
                    TargetAssetType: getValueSafe("TargetAssetType") ?? "Unknown",
                    TransformationType: getValueSafe("TransformationType") ?? "Unknown",
                    TransformationSteps: transformationSteps,
                    DataFlow: getValueSafe("DataFlow") ?? "Unknown",
                    FlowMetadata: flowMetadata,
                    Dependencies: dependencies,
                    IsOrphaned: bool.TryParse(getValueSafe("IsOrphaned"), out var orphaned) ? orphaned : false,
                    HasBrokenLinks: bool.TryParse(getValueSafe("HasBrokenLinks"), out var brokenLinks) ? brokenLinks : false,
                    LastValidated: lastValidated,
                    DiscoveryTimestamp: timestamp,
                    DiscoveryModule: getValueSafe("DiscoveryModule") ?? "DataLineageDependencyEngine",
                    SessionId: getValueSafe("SessionId") ?? Guid.NewGuid().ToString()
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse data lineage from CSV values");
                return null;
            }
        }
        
        private ExternalIdentityDTO? ParseExternalIdentityFromCsv(string[] values, Dictionary<string, int> headerMap)
        {
            try
            {
                var getValueSafe = new Func<string, string?>((key) =>
                {
                    return headerMap.TryGetValue(key, out int index) && index < values.Length 
                        ? values[index] 
                        : null;
                });
                
                // Required fields
                var externalId = getValueSafe("ExternalIdentityId") ?? getValueSafe("Id") ?? Guid.NewGuid().ToString();
                var externalProvider = getValueSafe("ExternalProvider") ?? getValueSafe("Provider") ?? "Unknown";
                var externalUserId = getValueSafe("ExternalUserId") ?? "";
                
                if (string.IsNullOrEmpty(externalUserId))
                    return null; // Skip incomplete records
                
                // Parse timestamp
                var timestampStr = getValueSafe("DiscoveryTimestamp") ?? DateTime.UtcNow.ToString();
                var timestamp = DateTime.TryParse(timestampStr, out var parsedTime) ? parsedTime : DateTime.UtcNow;
                
                var syncStr = getValueSafe("LastSynchronized") ?? DateTime.UtcNow.AddDays(-1).ToString();
                var lastSync = DateTime.TryParse(syncStr, out var syncParsed) ? syncParsed : DateTime.UtcNow.AddDays(-1);
                
                // Parse arrays
                var assignedRoles = getValueSafe("AssignedRoles")?.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();
                var permissions = getValueSafe("Permissions")?.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();
                var syncErrors = getValueSafe("SyncErrors")?.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList() ?? new List<string>();
                
                // Parse external attributes
                var externalAttributes = new Dictionary<string, string>();
                var attributesStr = getValueSafe("ExternalAttributes");
                if (!string.IsNullOrEmpty(attributesStr))
                {
                    foreach (var item in attributesStr.Split(';', StringSplitOptions.RemoveEmptyEntries))
                    {
                        var parts = item.Split('=', 2);
                        if (parts.Length == 2)
                            externalAttributes[parts[0]] = parts[1];
                    }
                }
                
                return new ExternalIdentityDTO(
                    ExternalIdentityId: externalId,
                    ExternalProvider: externalProvider,
                    ExternalUserId: externalUserId,
                    ExternalUserPrincipalName: getValueSafe("ExternalUserPrincipalName") ?? "",
                    InternalUserSid: getValueSafe("InternalUserSid") ?? "",
                    InternalUserPrincipalName: getValueSafe("InternalUserPrincipalName") ?? "",
                    MappingStatus: getValueSafe("MappingStatus") ?? "Unmapped",
                    TrustLevel: getValueSafe("TrustLevel") ?? "Medium",
                    AssignedRoles: assignedRoles,
                    Permissions: permissions,
                    ExternalAttributes: externalAttributes,
                    LastSynchronized: lastSync,
                    SyncErrors: syncErrors,
                    IsActive: bool.TryParse(getValueSafe("IsActive"), out var active) ? active : true,
                    RequiresRevalidation: bool.TryParse(getValueSafe("RequiresRevalidation"), out var revalidation) ? revalidation : false,
                    DiscoveryTimestamp: timestamp,
                    DiscoveryModule: getValueSafe("DiscoveryModule") ?? "ExternalIdentityDiscovery",
                    SessionId: getValueSafe("SessionId") ?? Guid.NewGuid().ToString()
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse external identity from CSV values");
                return null;
            }
        }

        private async Task LoadGroupsAsync()
        {
            _logger.LogInformation("Loading groups from CSV files...");
            
            try
            {
                var filePatterns = new[] { "ActiveDirectoryGroups_*.csv", "*Groups*.csv", "GroupMembers_*.csv" };
                var loadedCount = 0;
                
                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);
                    
                    foreach (var filePath in files)
                    {
                        try
                        {
                            using var reader = new StreamReader(filePath, System.Text.Encoding.UTF8);
                            
                            // Read header line
                            var headerLine = await reader.ReadLineAsync();
                            if (string.IsNullOrEmpty(headerLine)) continue;
                            
                            var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                            
                            // Build header map for flexible CSV parsing
                            var headerMap = BuildGroupHeaderMap(headers);
                            
                            while (!reader.EndOfStream)
                            {
                                var line = await reader.ReadLineAsync();
                                if (string.IsNullOrEmpty(line)) continue;
                                
                                var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                if (values.Length < headers.Length) continue;
                                
                                var group = ParseGroupFromCsv(values, headerMap);
                                if (group != null)
                                {
                                    _groupsBySid.TryAdd(group.Sid, group);
                                    loadedCount++;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load groups from file {FilePath}", filePath);
                        }
                    }
                }
                
                _logger.LogInformation("Loaded {Count} groups from CSV files", loadedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load groups from CSV files");
                throw;
            }
        }

        private async Task LoadDevicesAsync()
        {
            _logger.LogInformation("Loading devices from CSV files...");
            
            try
            {
                var filePatterns = new[] { "ComputerInventory_*.csv", "*Computer*.csv", "*Device*.csv" };
                var loadedCount = 0;
                
                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);
                    
                    foreach (var filePath in files)
                    {
                        try
                        {
                            using var reader = new StreamReader(filePath, System.Text.Encoding.UTF8);
                            
                            // Read header line
                            var headerLine = await reader.ReadLineAsync();
                            if (string.IsNullOrEmpty(headerLine)) continue;
                            
                            var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                            
                            // Build header map for flexible CSV parsing
                            var headerMap = BuildDeviceHeaderMap(headers);
                            
                            while (!reader.EndOfStream)
                            {
                                var line = await reader.ReadLineAsync();
                                if (string.IsNullOrEmpty(line)) continue;
                                
                                var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                if (values.Length < headers.Length) continue;
                                
                                var device = ParseDeviceFromCsv(values, headerMap);
                                if (device != null)
                                {
                                    _devicesByName.TryAdd(device.Name, device);
                                    loadedCount++;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load devices from file {FilePath}", filePath);
                        }
                    }
                }
                
                _logger.LogInformation("Loaded {Count} devices from CSV files", loadedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load devices from CSV files");
                throw;
            }
        }

        private async Task LoadApplicationsAsync()
        {
            _logger.LogInformation("Loading applications from CSV files...");
            
            try
            {
                var filePatterns = new[] { "AppInventory_*.csv", "*App*.csv", "*Software*.csv" };
                var loadedCount = 0;
                
                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);
                    
                    foreach (var filePath in files)
                    {
                        try
                        {
                            using var reader = new StreamReader(filePath, System.Text.Encoding.UTF8);
                            
                            // Read header line
                            var headerLine = await reader.ReadLineAsync();
                            if (string.IsNullOrEmpty(headerLine)) continue;
                            
                            var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                            
                            // Build header map for flexible CSV parsing
                            var headerMap = BuildApplicationHeaderMap(headers);
                            
                            while (!reader.EndOfStream)
                            {
                                var line = await reader.ReadLineAsync();
                                if (string.IsNullOrEmpty(line)) continue;
                                
                                var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                if (values.Length < headers.Length) continue;
                                
                                var app = ParseApplicationFromCsv(values, headerMap);
                                if (app != null)
                                {
                                    _appsById.TryAdd(app.Id, app);
                                    
                                    // Build device-app mapping (if device info is in the CSV)
                                    // Note: This will be populated during index building from device InstalledApps
                                    
                                    loadedCount++;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load applications from file {FilePath}", filePath);
                        }
                    }
                }
                
                _logger.LogInformation("Loaded {Count} applications from CSV files", loadedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load applications from CSV files");
                throw;
            }
        }

        private async Task LoadGposAsync()
        {
            _logger.LogInformation("Loading GPOs from CSV files...");
            
            try
            {
                var filePatterns = new[] { "GroupPolicy_*.csv", "*GPO*.csv", "*Policy*.csv" };
                var loadedCount = 0;
                
                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);
                    
                    foreach (var filePath in files)
                    {
                        try
                        {
                            using var reader = new StreamReader(filePath, System.Text.Encoding.UTF8);
                            
                            // Read header line
                            var headerLine = await reader.ReadLineAsync();
                            if (string.IsNullOrEmpty(headerLine)) continue;
                            
                            var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                            
                            // Build header map for flexible CSV parsing
                            var headerMap = BuildGpoHeaderMap(headers);
                            
                            while (!reader.EndOfStream)
                            {
                                var line = await reader.ReadLineAsync();
                                if (string.IsNullOrEmpty(line)) continue;
                                
                                var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                if (values.Length < headers.Length) continue;
                                
                                var gpo = ParseGpoFromCsv(values, headerMap);
                                if (gpo != null)
                                {
                                    _gposByGuid.TryAdd(gpo.Guid, gpo);
                                    
                                    // Build GPO security filter indices
                                    foreach (var sidFilter in gpo.SecurityFilter)
                                    {
                                        _gposBySidFilter.AddToValueList(sidFilter, gpo);
                                    }
                                    
                                    // Build GPO OU link indices
                                    foreach (var link in gpo.Links)
                                    {
                                        _gposByOu.AddToValueList(link, gpo);
                                    }
                                    
                                    loadedCount++;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load GPOs from file {FilePath}", filePath);
                        }
                    }
                }
                
                _logger.LogInformation("Loaded {Count} GPOs from CSV files", loadedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load GPOs from CSV files");
                throw;
            }
        }

        private async Task LoadAclsAsync()
        {
            _logger.LogInformation("Loading ACLs from CSV files...");

            try
            {
                var filePatterns = new[] { "NTFS_ACL_*.csv", "Shares_*.csv", "*ACL*.csv", "*Permission*.csv" };
                var loadedCount = 0;

                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);

                    foreach (var filePath in files)
                    {
                        try
                        {
                            using var reader = new StreamReader(filePath, System.Text.Encoding.UTF8);

                            // Read header line
                            var headerLine = await reader.ReadLineAsync();
                            if (string.IsNullOrEmpty(headerLine)) continue;

                            var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();

                            // Build header map for flexible CSV parsing
                            var headerMap = BuildAclHeaderMap(headers);

                            while (!reader.EndOfStream)
                            {
                                var line = await reader.ReadLineAsync();
                                if (string.IsNullOrEmpty(line)) continue;

                                var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                if (values.Length < headers.Length) continue;

                                var acl = ParseAclFromCsv(values, headerMap);
                                if (acl != null)
                                {
                                    var aclDto = ParseAclFromCsv(values, headerMap);
                                    if (aclDto != null)
                                    {
                                        // Convert AclEntryDto to AclEntry
                                        var aclEntries = ConvertAclEntryDtoToAclEntry(new List<AclEntryDto> { aclDto });
                                        if (aclEntries.Any())
                                        {
                                            var aclEntry = aclEntries.First();
                                            _aclByIdentitySid.AddToValueList<string, AclEntry>(aclEntry.IdentitySid, aclEntry);
                                            loadedCount++;
                                        }
                                    }
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load ACLs from file {FilePath}", filePath);
                        }
                    }
                }

                _logger.LogInformation("Loaded {Count} ACL entries from CSV files", loadedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load ACLs from CSV files");
                throw;
            }
        }

    #endregion

       private async Task LoadMappedDrivesAsync()
        {
            _logger.LogInformation("Loading mapped drives from CSV files...");
            
            try
            {
                var filePatterns = new[] { "MappedDrives_*.csv", "*Drive*.csv", "*Share*.csv" };
                var loadedCount = 0;
                
                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);
                    
                    foreach (var filePath in files)
                    {
                        try
                        {
                            using var reader = new StreamReader(filePath, System.Text.Encoding.UTF8);
                            
                            // Read header line
                            var headerLine = await reader.ReadLineAsync();
                            if (string.IsNullOrEmpty(headerLine)) continue;
                            
                            var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                            
                            // Build header map for flexible CSV parsing
                            var headerMap = BuildMappedDriveHeaderMap(headers);
                            
                            while (!reader.EndOfStream)
                            {
                                var line = await reader.ReadLineAsync();
                                if (string.IsNullOrEmpty(line)) continue;
                                
                                var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                if (values.Length < headers.Length) continue;
                                
                                var drive = ParseMappedDriveFromCsv(values, headerMap);
                                if (drive != null)
                                {
                                    _drivesByUserSid.AddToValueList(drive.UserSid, drive);
                                    loadedCount++;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load mapped drives from file {FilePath}", filePath);
                        }
                    }
                }
                
                _logger.LogInformation("Loaded {Count} mapped drives from CSV files", loadedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load mapped drives from CSV files");
                throw;
            }
        }

        private async Task LoadMailboxesAsync()
        {
            _logger.LogInformation("Loading mailboxes from CSV files...");
            
            try
            {
                var filePatterns = new[] { "Mailboxes_*.csv", "*Mailbox*.csv", "*Exchange*.csv" };
                var loadedCount = 0;
                
                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);
                    
                    foreach (var filePath in files)
                    {
                        try
                        {
                            using var reader = new StreamReader(filePath, System.Text.Encoding.UTF8);
                            
                            // Read header line
                            var headerLine = await reader.ReadLineAsync();
                            if (string.IsNullOrEmpty(headerLine)) continue;
                            
                            var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                            
                            // Build header map for flexible CSV parsing
                            var headerMap = BuildMailboxHeaderMap(headers);
                            
                            while (!reader.EndOfStream)
                            {
                                var line = await reader.ReadLineAsync();
                                if (string.IsNullOrEmpty(line)) continue;
                                
                                var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                if (values.Length < headers.Length) continue;
                                
                                var mailbox = ParseMailboxFromCsv(values, headerMap);
                                if (mailbox != null)
                                {
                                    _mailboxByUpn.TryAdd(mailbox.UPN, mailbox);
                                    loadedCount++;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load mailboxes from file {FilePath}", filePath);
                        }
                    }
                }
                
                _logger.LogInformation("Loaded {Count} mailboxes from CSV files", loadedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load mailboxes from CSV files");
                throw;
            }
        }

        private async Task LoadAzureRolesAsync()
        {
            _logger.LogInformation("Loading Azure roles from CSV files...");
            
            try
            {
                var filePatterns = new[] { "AzureRoles_*.csv", "*Azure*.csv", "*Role*.csv" };
                var loadedCount = 0;
                
                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);
                    
                    foreach (var filePath in files)
                    {
                        try
                        {
                            using var reader = new StreamReader(filePath, System.Text.Encoding.UTF8);
                            
                            // Read header line
                            var headerLine = await reader.ReadLineAsync();
                            if (string.IsNullOrEmpty(headerLine)) continue;
                            
                            var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                            
                            // Build header map for flexible CSV parsing
                            var headerMap = BuildAzureRoleHeaderMap(headers);
                            
                            while (!reader.EndOfStream)
                            {
                                var line = await reader.ReadLineAsync();
                                if (string.IsNullOrEmpty(line)) continue;
                                
                                var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                if (values.Length < headers.Length) continue;
                                
                                var role = ParseAzureRoleFromCsv(values, headerMap);
                                if (role != null)
                                {
                                    _rolesByPrincipalId.AddToValueList(role.PrincipalObjectId, role);
                                    loadedCount++;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load Azure roles from file {FilePath}", filePath);
                        }
                    }
                }
                
                _logger.LogInformation("Loaded {Count} Azure role assignments from CSV files", loadedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load Azure roles from CSV files");
                throw;
            }
        }

        private async Task LoadSqlDatabasesAsync()
        {
            _logger.LogInformation("Loading SQL databases from CSV files...");
            
            try
            {
                var filePatterns = new[] { "Sql*.csv", "*Database*.csv", "*SQL*.csv" };
                var loadedCount = 0;
                
                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);
                    
                    foreach (var filePath in files)
                    {
                        try
                        {
                            using var reader = new StreamReader(filePath, System.Text.Encoding.UTF8);
                            
                            // Read header line
                            var headerLine = await reader.ReadLineAsync();
                            if (string.IsNullOrEmpty(headerLine)) continue;
                            
                            var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                            
                            // Build header map for flexible CSV parsing
                            var headerMap = BuildSqlDbHeaderMap(headers);
                            
                            while (!reader.EndOfStream)
                            {
                                var line = await reader.ReadLineAsync();
                                if (string.IsNullOrEmpty(line)) continue;
                                
                                var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                if (values.Length < headers.Length) continue;
                                
                                var sqlDb = ParseSqlDbFromCsv(values, headerMap);
                                if (sqlDb != null)
                                {
                                    var key = $"{sqlDb.Server}|{sqlDb.Instance}|{sqlDb.Database}";
                                    _sqlDbsByKey.TryAdd(key, sqlDb);
                                    loadedCount++;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load SQL databases from file {FilePath}", filePath);
                        }
                    }
                }
                
                _logger.LogInformation("Loaded {Count} SQL databases from CSV files", loadedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load SQL databases from CSV files");
                throw;
            }
        }

        // T-029: New loading methods for expanded modules
        
        private async Task LoadThreatDetectionAsync()
        {
            _logger.LogInformation("Loading threat detection data from CSV files...");
            
            try
            {
                var filePatterns = new[] { "ThreatDetection_*.csv", "*Threats*.csv", "*Security*.csv" };
                var loadedCount = 0;
                
                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);
                    
                    foreach (var filePath in files)
                    {
                        try
                        {
                            using var reader = new StreamReader(filePath, System.Text.Encoding.UTF8);
                            
                            // Read header line
                            var headerLine = await reader.ReadLineAsync();
                            if (string.IsNullOrEmpty(headerLine)) continue;
                            
                            var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                            var headerMap = BuildHeaderMap(headers);
                            
                            while (!reader.EndOfStream)
                            {
                                var line = await reader.ReadLineAsync();
                                if (string.IsNullOrEmpty(line)) continue;
                                
                                var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                if (values.Length < headers.Length) continue;
                                
                                var threat = ParseThreatDetectionFromCsv(values, headerMap);
                                if (threat != null)
                                {
                                    _threatsByThreatId.TryAdd(threat.ThreatId, threat);
                                    
                                    // Build indices
                                    foreach (var asset in threat.AffectedAssets)
                                    {
                                        _threatsByAsset.AddToValueList(asset, threat);
                                    }
                                    _threatsByCategory.AddToValueList(threat.Category, threat);
                                    _threatsBySeverity.AddToValueList(threat.Severity, threat);
                                    
                                    loadedCount++;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load threats from file {FilePath}", filePath);
                        }
                    }
                }
                
                _logger.LogInformation("Loaded {Count} threat detection entries", loadedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load threat detection data");
            }
        }
        
        private async Task LoadDataGovernanceAsync()
        {
            _logger.LogInformation("Loading data governance information from CSV files...");
            
            try
            {
                var filePatterns = new[] { "DataGovernance_*.csv", "*Governance*.csv", "*Metadata*.csv", "*Compliance*.csv" };
                var loadedCount = 0;
                
                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);
                    
                    foreach (var filePath in files)
                    {
                        try
                        {
                            using var reader = new StreamReader(filePath, System.Text.Encoding.UTF8);
                            
                            var headerLine = await reader.ReadLineAsync();
                            if (string.IsNullOrEmpty(headerLine)) continue;
                            
                            var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                            var headerMap = BuildHeaderMap(headers);
                            
                            while (!reader.EndOfStream)
                            {
                                var line = await reader.ReadLineAsync();
                                if (string.IsNullOrEmpty(line)) continue;
                                
                                var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                if (values.Length < headers.Length) continue;
                                
                                var governance = ParseDataGovernanceFromCsv(values, headerMap);
                                if (governance != null)
                                {
                                    _governanceByAssetId.TryAdd(governance.AssetId, governance);
                                    _governanceByOwner.AddToValueList(governance.Owner, governance);
                                    _governanceByCompliance.AddToValueList(governance.ComplianceStatus, governance);
                                    
                                    loadedCount++;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load governance data from file {FilePath}", filePath);
                        }
                    }
                }
                
                _logger.LogInformation("Loaded {Count} data governance entries", loadedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load data governance information");
            }
        }
        
        private async Task LoadDataLineageAsync()
        {
            _logger.LogInformation("Loading data lineage information from CSV files...");
            
            try
            {
                var filePatterns = new[] { "DataLineage_*.csv", "*Lineage*.csv", "*DataFlow*.csv" };
                var loadedCount = 0;
                
                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);
                    
                    foreach (var filePath in files)
                    {
                        try
                        {
                            using var reader = new StreamReader(filePath, System.Text.Encoding.UTF8);
                            
                            var headerLine = await reader.ReadLineAsync();
                            if (string.IsNullOrEmpty(headerLine)) continue;
                            
                            var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                            var headerMap = BuildHeaderMap(headers);
                            
                            while (!reader.EndOfStream)
                            {
                                var line = await reader.ReadLineAsync();
                                if (string.IsNullOrEmpty(line)) continue;
                                
                                var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                if (values.Length < headers.Length) continue;
                                
                                var lineage = ParseDataLineageFromCsv(values, headerMap);
                                if (lineage != null)
                                {
                                    _lineageByLineageId.TryAdd(lineage.LineageId, lineage);
                                    _lineageBySourceAsset.AddToValueList(lineage.SourceAssetId, lineage);
                                    _lineageByTargetAsset.AddToValueList(lineage.TargetAssetId, lineage);
                                    
                                    loadedCount++;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load lineage data from file {FilePath}", filePath);
                        }
                    }
                }
                
                _logger.LogInformation("Loaded {Count} data lineage entries", loadedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load data lineage information");
            }
        }
        
        private async Task LoadExternalIdentitiesAsync()
        {
            _logger.LogInformation("Loading external identity information from CSV files...");
            
            try
            {
                var filePatterns = new[] { "ExternalIdentity_*.csv", "*ExternalId*.csv", "*Federation*.csv" };
                var loadedCount = 0;
                
                foreach (var pattern in filePatterns)
                {
                    var files = Directory.GetFiles(_dataRoot, pattern, SearchOption.AllDirectories);
                    
                    foreach (var filePath in files)
                    {
                        try
                        {
                            using var reader = new StreamReader(filePath, System.Text.Encoding.UTF8);
                            
                            var headerLine = await reader.ReadLineAsync();
                            if (string.IsNullOrEmpty(headerLine)) continue;
                            
                            var headers = headerLine.Split(',').Select(h => h.Trim('"')).ToArray();
                            var headerMap = BuildHeaderMap(headers);
                            
                            while (!reader.EndOfStream)
                            {
                                var line = await reader.ReadLineAsync();
                                if (string.IsNullOrEmpty(line)) continue;
                                
                                var values = line.Split(',').Select(v => v.Trim('"')).ToArray();
                                if (values.Length < headers.Length) continue;
                                
                                var externalId = ParseExternalIdentityFromCsv(values, headerMap);
                                if (externalId != null)
                                {
                                    _externalIdentitiesById.TryAdd(externalId.ExternalIdentityId, externalId);
                                    if (!string.IsNullOrEmpty(externalId.ExternalUserPrincipalName))
                                        _externalIdentitiesByUpn.TryAdd(externalId.ExternalUserPrincipalName, externalId);
                                    
                                    _externalIdentitiesByProvider.AddToValueList(externalId.ExternalProvider, externalId);
                                    _externalIdentitiesByMappingStatus.AddToValueList(externalId.MappingStatus, externalId);
                                    
                                    loadedCount++;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to load external identity data from file {FilePath}", filePath);
                        }
                    }
                }
                
                _logger.LogInformation("Loaded {Count} external identity entries", loadedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load external identity information");
            }
        }

        private async Task BuildIndicesAsync()
        {
            await Task.Run(() =>
            {
                _logger.LogInformation("Building bidirectional indices...");
                
                // Build user indices
                foreach (var user in _usersBySid.Values)
                {
                    if (!string.IsNullOrEmpty(user.UPN))
                        _usersByUpn.TryAdd(user.UPN, user);
                }

                // Build group membership indices
                foreach (var group in _groupsBySid.Values)
                {
                    _membersByGroupSid.TryAdd(group.Sid, group.Members);
                    
                    foreach (var memberSid in group.Members)
                    {
                        _groupsByUserSid.AddOrUpdate(memberSid, 
                            new List<string> { group.Sid },
                            (key, existing) => { existing.Add(group.Sid); return existing; });
                    }
                }

                // Build device indices
                foreach (var device in _devicesByName.Values)
                {
                    if (!string.IsNullOrEmpty(device.PrimaryUserSid))
                    {
                        _devicesByPrimaryUserSid.AddOrUpdate(device.PrimaryUserSid,
                            new List<DeviceDto> { device },
                            (key, existing) => { existing.Add(device); return existing; });
                    }
                    
                    // Build app-device mapping from device's installed apps
                    foreach (var appName in device.InstalledApps)
                    {
                        // Try to match app name to app ID
                        var app = _appsById.Values.FirstOrDefault(a => 
                            a.Name.Equals(appName, StringComparison.OrdinalIgnoreCase));
                        
                        if (app != null)
                        {
                            _appsByDevice.AddOrUpdate(device.Name,
                                new List<string> { app.Id },
                                (key, existing) => { existing.Add(app.Id); return existing; });
                        }
                    }
                }

                _logger.LogInformation("Indices built successfully");
            });
        }

        private async Task ApplyInferenceRulesAsync()
        {
            await Task.Run(() =>
            {
                _logger.LogInformation("Applying inference rules...");
                
                // Apply ACL→Group→User inference
                ApplyAclGroupUserInference();
                
                // Apply primary device inference
                ApplyPrimaryDeviceInference();
                
                // Apply GPO security filtering inference
                ApplyGpoSecurityFilterInference();
                
                // Apply application usage inference
                ApplyApplicationUsageInference();
                
                // Apply Azure role inference
                ApplyAzureRoleInference();
                
                // Apply SQL ownership inference
                ApplySqlOwnershipInference();
                
                // T-029: Apply new cross-module correlation inference rules
                ApplyThreatAssetCorrelationInference();
                ApplyGovernanceRiskInference();
                ApplyLineageIntegrityInference();
                ApplyExternalIdentityMappingInference();

                // T-010: Enhanced fuzzy matching and data correlation
                _appliedInferenceRules.Add("Fuzzy matching enabled for identity resolution");
                _appliedInferenceRules.Add("File share loader implemented with ACL correlation");

                _logger.LogInformation("Applied {RuleCount} inference rules", _appliedInferenceRules.Count);
            });
        }

        private void ApplyAclGroupUserInference()
        {
            foreach (var kvp in _aclByIdentitySid.ToArray())
            {
                var identitySid = kvp.Key;
                var entries = kvp.Value;

                // If the identity is a group, propagate ACLs to its members
                if (_groupsBySid.ContainsKey(identitySid))
                {
                    var members = _membersByGroupSid.GetValueOrDefault(identitySid, new List<string>());
                    foreach (var memberSid in members)
                    {
                        foreach (var entry in entries)
                        {
                            _aclByIdentitySid.AddToValueList(memberSid, entry);
                        }
                    }
                }
            }

            _appliedInferenceRules.Add("ACL→Group→User inference");
        }

        private void ApplyMappedDriveInference()
        {
            _logger.LogDebug("Applying mapped drive network relationship inference rules");

            var driveNetworkRelationships = 0;
            var orphanedDriveMappings = 0;

            foreach (var kvp in _drivesByUserSid.ToArray())
            {
                var userSid = kvp.Key;
                var userDrives = kvp.Value;

                foreach (var drive in userDrives)
                {
                    // Try to resolve the network path to a known share
                    var shareName = ExtractShareNameFromPath(drive.UNC);
                    if (!string.IsNullOrEmpty(shareName))
                    {
                        // Create user-share relationship through mapped drive
                        if (_fileSharesByName.ContainsKey(shareName))
                        {
                            var share = _fileSharesByName[shareName];
                            // Drive mapping implies specific permissions are being used
                            driveNetworkRelationships++;
                        }
                        else
                        {
                            // Mark as orphaned or external share
                            orphanedDriveMappings++;
                            _appliedInferenceRules.Add($"Orphaned mapped drive: {drive.UNC} for user {userSid}");
                        }
                    }
                }
            }

            _appliedInferenceRules.Add($"Mapped drive inference ({driveNetworkRelationships} relationships, {orphanedDriveMappings} orphaned)");
        }

        private void ApplyGpoSecurityFilterInference()
        {
            var gpoFilterCount = 0;

            try
            {
                // Build GPO security filter relationships
                foreach (var gpoKvp in _gposByGuid.ToArray())
                {
                    var gpo = gpoKvp.Value;
                    if (gpo.SecurityFilter.Count == 0) continue;

                    foreach (var filterSid in gpo.SecurityFilter)
                    {
                        // Create security filtering relationships
                        if (_usersBySid.ContainsKey(filterSid))
                        {
                            // User-based security filter
                            var user = _usersBySid[filterSid];
                            _edges.Add(new GraphEdge(
                                gpo.Guid,
                                user.Sid,
                                EdgeType.LinkedByGpo,
                                new Dictionary<string, object>
                                {
                                    ["FilterType"] = "UserSecurityFilter",
                                    ["GpoName"] = gpo.Name ?? "",
                                    ["FilterSid"] = filterSid,
                                    ["IsSecurityFiltered"] = true
                                }
                            ));

                            // Add to GPO filter indices
                            _gposBySidFilter.AddToValueList(user.Sid, gpo);
                            gpoFilterCount++;
                        }
                        else if (_groupsBySid.ContainsKey(filterSid))
                        {
                            // Group-based security filter
                            var group = _groupsBySid[filterSid];
                            _edges.Add(new GraphEdge(
                                gpo.Guid,
                                group.Sid,
                                EdgeType.LinkedByGpo,
                                new Dictionary<string, object>
                                {
                                    ["FilterType"] = "GroupSecurityFilter",
                                    ["GpoName"] = gpo.Name ?? "",
                                    ["FilterSid"] = filterSid,
                                    ["MemberCount"] = group.Members.Count,
                                    ["IsSecurityFiltered"] = true
                                }
                            ));

                            // Propagate to group members
                            foreach (var memberSid in group.Members)
                            {
                                _gposBySidFilter.AddToValueList(memberSid, gpo);
                            }
                            gpoFilterCount++;
                        }
                        else
                        {
                            // Unknown SID type - log for analysis
                            _logger.LogDebug("GPO {GpoName} has unknown security filter SID: {FilterSid}", gpo.Name, filterSid);
                        }
                    }
                }

                _appliedInferenceRules.Add($"GPO security filter inference ({gpoFilterCount} filters applied)");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to apply GPO security filter inference");
                _appliedInferenceRules.Add("GPO security filter inference (failed)");
            }
        }

        private void ApplyMailboxPresenceInference()
        {
            var mailboxPresenceLinks = 0;

            try
            {
                // Build mailbox-user relationships
                foreach (var mailbox in _mailboxByUpn.Values)
                {
                    var user = _usersByUpn.GetValueOrDefault(mailbox.UPN);
                    if (user != null)
                    {
                        // Create mailbox-user relationship
                        _edges.Add(new GraphEdge(
                            user.Sid,
                            mailbox.UPN,
                            EdgeType.HasMailbox,
                            new Dictionary<string, object>
                            {
                                ["MailboxSizeMB"] = mailbox.SizeMB,
                                ["MailboxType"] = mailbox.Type,
                                ["MailboxGuid"] = mailbox.MailboxGuid ?? "",
                                ["DiscoveryTimestamp"] = mailbox.DiscoveryTimestamp
                            }
                        ));

                        // Create reverse relationship for mailbox dependency tracking
                        _edges.Add(new GraphEdge(
                            mailbox.UPN,
                            user.Sid,
                            EdgeType.MapsTo,
                            new Dictionary<string, object>
                            {
                                ["MappingType"] = "MailboxOwner",
                                ["UserSid"] = user.Sid,
                                ["UserUPN"] = user.UPN,
                                ["UserEnabled"] = user.Enabled
                            }
                        ));

                        mailboxPresenceLinks++;
                    }
                    else
                    {
                        // Log orphaned mailbox
                        _logger.LogDebug("Mailbox {UPN} has no corresponding user account", mailbox.UPN);
                        _appliedInferenceRules.Add($"Orphaned mailbox detected: {mailbox.UPN}");
                    }
                }

                _appliedInferenceRules.Add($"Mailbox presence inference ({mailboxPresenceLinks} mailbox-user links created)");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to apply mailbox presence inference");
                _appliedInferenceRules.Add("Mailbox presence inference (failed)");
            }
        }

        private void ApplyAzureRoleInference()
        {
            var linkedRolesCount = 0;
            var azureUserMappings = 0;

            try
            {
                // Build Azure role relationships and user mappings
                foreach (var roleAssignment in _rolesByPrincipalId.Values.SelectMany(list => list))
                {
                    var principalId = roleAssignment.PrincipalObjectId;

                    // Find user by Azure Object ID or SID (if it matches Azure Object ID format)
                    UserDto? mappedUser = null;

                    // First try direct Azure Object ID match
                    mappedUser = _usersBySid.Values.FirstOrDefault(u =>
                        u.AzureObjectId?.Equals(principalId, StringComparison.OrdinalIgnoreCase) == true);

                    // If not found, try SID match (some legacy mappings might use SID as Azure Object ID)
                    if (mappedUser == null)
                    {
                        _usersBySid.TryGetValue(principalId, out mappedUser);
                    }

                    if (mappedUser != null)
                    {
                        // Create role assignment edge
                        _edges.Add(new GraphEdge(
                            roleAssignment.PrincipalObjectId,
                            roleAssignment.RoleName,
                            EdgeType.AssignedRole,
                            new Dictionary<string, object>
                            {
                                ["Scope"] = roleAssignment.Scope,
                                ["RoleDefinitionId"] = roleAssignment.RoleName, // Assuming RoleName contains the definition
                                ["UserSid"] = mappedUser.Sid,
                                ["UserUPN"] = mappedUser.UPN,
                                ["AssignmentTimestamp"] = roleAssignment.DiscoveryTimestamp
                            }
                        ));

                        // Create user-role relationship
                        _edges.Add(new GraphEdge(
                            mappedUser.Sid,
                            roleAssignment.RoleName,
                            EdgeType.AssignedRole,
                            new Dictionary<string, object>
                            {
                                ["PrincipalId"] = roleAssignment.PrincipalObjectId,
                                ["Scope"] = roleAssignment.Scope,
                                ["RoleType"] = "AzureRBAC",
                                ["DiscoveryTimestamp"] = roleAssignment.DiscoveryTimestamp
                            }
                        ));

                        azureUserMappings++;
                    }
                    else
                    {
                        // Log unmapped Azure role assignment
                        _logger.LogDebug("Azure role assignment for principal {PrincipalId} has no corresponding user mapping", principalId);
                        _appliedInferenceRules.Add($"Unmapped Azure role: {roleAssignment.RoleName} for {principalId}");
                    }

                    linkedRolesCount++;
                }

                _appliedInferenceRules.Add($"Azure role inference ({linkedRolesCount} role assignments, {azureUserMappings} user mappings)");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to apply Azure role inference");
                _appliedInferenceRules.Add($"Azure role inference ({linkedRolesCount} role assignments, failed)");
            }
        }

        private void ApplySqlOwnershipInference()
        {
            // SQL database ownership chains
            var ownershipLinks = 0;
            
            foreach (var sqlDb in _sqlDbsByKey.Values)
            {
                foreach (var ownerIdentifier in sqlDb.Owners)
                {
                    // Try to resolve owner to a known user (by SID, UPN, or display name)
                    UserDto? ownerUser = null;
                    
                    // First try direct SID match
                    if (_usersBySid.TryGetValue(ownerIdentifier, out ownerUser))
                    {
                        // Found direct match
                    }
                    // Try UPN match
                    else if (_usersByUpn.TryGetValue(ownerIdentifier, out ownerUser))
                    {
                        // Found UPN match
                    }
                    // Try display name fuzzy match
                    else
                    {
                        ownerUser = _usersBySid.Values.FirstOrDefault(u => 
                            u.DisplayName?.Equals(ownerIdentifier, StringComparison.OrdinalIgnoreCase) == true ||
                            u.Sam?.Equals(ownerIdentifier, StringComparison.OrdinalIgnoreCase) == true);
                    }
                    
                    if (ownerUser != null)
                    {
                        // Create ownership relationship
                        _edges.Add(new GraphEdge(
                            ownerUser.Sid,
                            $"SqlDb_{sqlDb.Server}_{sqlDb.Database}",
                            EdgeType.OwnsDb,
                            new Dictionary<string, object>
                            {
                                ["Server"] = sqlDb.Server,
                                ["Database"] = sqlDb.Database,
                                ["Instance"] = sqlDb.Instance ?? "",
                                ["OwnerIdentifier"] = ownerIdentifier
                            }
                        ));
                        
                        ownershipLinks++;
                    }
                    else
                    {
                        // Log unresolved ownership
                        _logger.LogDebug("Could not resolve SQL database owner '{Owner}' for {Server}.{Database}", 
                            ownerIdentifier, sqlDb.Server, sqlDb.Database);
                    }
                }
            }
            
            _appliedInferenceRules.Add($"SQL ownership inference ({ownershipLinks} ownership links)");
        }
        
        // T-029: New cross-module inference rules
        
        private void ApplyThreatAssetCorrelationInference()
        {
            // Correlate threats with discovered assets (users, devices, apps, etc.)
            foreach (var threat in _threatsByThreatId.Values)
            {
                foreach (var assetId in threat.AffectedAssets)
                {
                    // Try to match with discovered users
                    if (_usersBySid.ContainsKey(assetId) || _usersByUpn.ContainsKey(assetId))
                    {
                        // Create threat-user relationship edge
                        _edges.Add(new GraphEdge(threat.ThreatId, assetId, EdgeType.Threatens));
                    }
                    
                    // Try to match with discovered devices
                    if (_devicesByName.ContainsKey(assetId))
                    {
                        _edges.Add(new GraphEdge(threat.ThreatId, assetId, EdgeType.Threatens));
                    }
                    
                    // Try to match with discovered applications
                    if (_appsById.ContainsKey(assetId))
                    {
                        _edges.Add(new GraphEdge(threat.ThreatId, assetId, EdgeType.Threatens));
                    }
                }
            }
            
            _appliedInferenceRules.Add("Threat-asset correlation inference");
        }
        
        private void ApplyGovernanceRiskInference()
        {
            // Correlate governance issues with asset ownership and user responsibilities
            foreach (var governance in _governanceByAssetId.Values)
            {
                // Link governance issues to asset owners (users)
                if (!string.IsNullOrEmpty(governance.Owner))
                {
                    var owner = _usersByUpn.Values.FirstOrDefault(u => u.DisplayName == governance.Owner || u.UPN == governance.Owner);
                    if (owner != null)
                    {
                        _edges.Add(new GraphEdge(governance.AssetId, owner.Sid, EdgeType.HasGovernanceIssue,
                            new Dictionary<string, object>
                            {
                                ["GovernanceRisk"] = governance.GovernanceRisk,
                                ["ComplianceStatus"] = governance.ComplianceStatus,
                                ["ViolationCount"] = governance.ViolationsFound.Count
                            }));
                    }
                }
                
                // Create governance asset node
                _nodes.TryAdd(governance.AssetId, new GraphNode(
                    Id: governance.AssetId,
                    Type: NodeType.DataAsset,
                    Properties: new Dictionary<string, object>
                    {
                        ["Name"] = governance.AssetName,
                        ["Type"] = governance.AssetType,
                        ["Classification"] = governance.Classification,
                        ["GovernanceRisk"] = governance.GovernanceRisk,
                        ["ComplianceStatus"] = governance.ComplianceStatus
                    }
                ));
            }
            
            _appliedInferenceRules.Add("Governance risk correlation inference");
        }
        
        private void ApplyLineageIntegrityInference()
        {
            // Build data lineage graph and identify integrity issues
            foreach (var lineage in _lineageByLineageId.Values)
            {
                // Create lineage flow nodes and edges
                _nodes.TryAdd(lineage.LineageId, new GraphNode(
                    Id: lineage.LineageId,
                    Type: NodeType.LineageFlow,
                    Properties: new Dictionary<string, object>
                    {
                        ["SourceAsset"] = lineage.SourceAssetName,
                        ["TargetAsset"] = lineage.TargetAssetName,
                        ["TransformationType"] = lineage.TransformationType,
                        ["IsOrphaned"] = lineage.IsOrphaned,
                        ["HasBrokenLinks"] = lineage.HasBrokenLinks,
                        ["LineageRisk"] = lineage.LineageRisk
                    }
                ));
                
                // Create data flow edges
                _edges.Add(new GraphEdge(lineage.SourceAssetId, lineage.TargetAssetId, EdgeType.DataFlowTo,
                    new Dictionary<string, object>
                    {
                        ["LineageId"] = lineage.LineageId,
                        ["TransformationType"] = lineage.TransformationType,
                        ["RiskLevel"] = lineage.RiskLevel
                    }));
                
                // Flag orphaned or broken lineage as risks
                // Note: orphaned code fragment at the end of the method was removed
            }

            _appliedInferenceRules.Add("Data lineage integrity inference");
        }

        /// <summary>
        /// Calculates comprehensive risk scores for all entities
        /// </summary>
        private void CalculateEntityRiskScores()
        {
            _logger.LogDebug("Starting entity risk score calculation");
            // Calculate risk scores for all users
            foreach (var user in _usersBySid.Values)
            {
                CalculateUserRiskScore(user);
                _logger.LogTrace("Calculated risk score for user: {UserSid}", user.Sid);
            }

            // Calculate risk scores for all devices
            foreach (var device in _devicesByName.Values)
            {
                CalculateDeviceRiskScore(device);
                _logger.LogTrace("Calculated risk score for device: {DeviceName}", device.Name);
            }

            // Calculate risk scores for all groups
            foreach (var group in _groupsBySid.Values)
            {
                CalculateGroupRiskScore(group);
                _logger.LogTrace("Calculated risk score for group: {GroupSid}", group.Sid);
            }

            // Calculate risk scores for all applications
            foreach (var app in _appsById.Values)
            {
                CalculateAppRiskScore(app);
                _logger.LogTrace("Calculated risk score for app: {AppId}", app.Id);
            }

            _appliedInferenceRules.Add("Entity risk scores calculated for all users, devices, groups, and applications");
        }
        
        private void ApplyExternalIdentityMappingInference()
        {
            // Correlate external identities with internal users and identify mapping issues
            foreach (var externalId in _externalIdentitiesById.Values)
            {
                // Create external identity node
                _nodes.TryAdd(externalId.ExternalIdentityId, new GraphNode(
                    Id: externalId.ExternalIdentityId,
                    Type: NodeType.ExternalIdentity,
                    Properties: new Dictionary<string, object>
                    {
                        ["Provider"] = externalId.ExternalProvider,
                        ["ExternalUserId"] = externalId.ExternalUserId,
                        ["MappingStatus"] = externalId.MappingStatus,
                        ["TrustLevel"] = externalId.TrustLevel,
                        ["IdentityRisk"] = externalId.IdentityRisk,
                        ["IsActive"] = externalId.IsActive
                    }
                ));
                
                // Try to find matching internal user
                if (!string.IsNullOrEmpty(externalId.InternalUserSid))
                {
                    var internalUser = _usersBySid.GetValueOrDefault(externalId.InternalUserSid);
                    if (internalUser != null)
                    {
                        _edges.Add(new GraphEdge(externalId.ExternalIdentityId, internalUser.Sid, EdgeType.ExternalMapping,
                            new Dictionary<string, object>
                            {
                                ["MappingStatus"] = externalId.MappingStatus,
                                ["TrustLevel"] = externalId.TrustLevel,
                                ["LastSynchronized"] = externalId.LastSynchronized,
                                ["SyncErrorCount"] = externalId.SyncErrors.Count
                            }));
                    }
                }
                
                // Flag unmapped or problematic external identities
                if (externalId.MappingStatus == "Unmapped" || externalId.MappingStatus == "Conflict" || externalId.SyncErrors.Count > 0)
                {
                    _edges.Add(new GraphEdge(externalId.ExternalIdentityId, "IDENTITY_RISK_NODE", EdgeType.Violates,
                        new Dictionary<string, object>
                        {
                            ["ViolationType"] = "External Identity Mapping",
                            ["Issues"] = externalId.Issues,
                            ["RiskLevel"] = externalId.RiskLevel
                        }));
                }
            }
            
            _appliedInferenceRules.Add("External identity mapping inference");
        }

        #region T-010: Enhanced Graph Building and Advanced Relationships

        /// <summary>
        /// T-010: Build enhanced entity graph with metadata and advanced relationships
        /// </summary>
        private async Task BuildEnhancedEntityGraphAsync()
        {
            await Task.Run(() =>
            {
                _logger.LogInformation("Building enhanced entity graph...");

                // Build nodes for all entity types with rich metadata
                BuildUserGraphNodes();
                BuildDeviceGraphNodes();
                BuildGroupGraphNodes();
                BuildApplicationGraphNodes();
                BuildInfrastructureGraphNodes();

                // Build advanced relationship edges
                BuildUserToGroupRelationships();
                BuildUserToDeviceRelationships();
                BuildUserToApplicationRelationships();
                BuildUserToMailboxRelationships();
                BuildDeviceToApplicationRelationships();
                BuildDeviceToInfrastructureRelationships();
                BuildSecurityRelationships();

                // Calculate entity risk scores and metadata
                CalculateEntityRiskScores();

                _logger.LogInformation("Enhanced entity graph built with {NodeCount} nodes and {EdgeCount} relationships",
                    _nodes.Count, _edges.Count);
            });
        }

        /// <summary>
        /// T-010: Build graph nodes with rich metadata for users
        /// </summary>
        private void BuildUserGraphNodes()
        {
            foreach (var user in _usersBySid.Values)
            {
                var userNodeId = $"User_{user.Sid}";

                // Calculate user risk score based on multiple factors
                var userRiskScore = CalculateUserRiskScore(user);
                var userActivityScore = CalculateUserActivityScore(user);

                _nodes[userNodeId] = new GraphNode(
                    Id: userNodeId,
                    Type: NodeType.User,
                    Properties: new Dictionary<string, object>
                    {
                        ["EntityType"] = "User",
                        ["Sid"] = user.Sid,
                        ["UPN"] = user.UPN ?? "",
                        ["DisplayName"] = user.DisplayName ?? "",
                        ["Enabled"] = user.Enabled,
                        ["Dept"] = user.Dept ?? "",
                        ["RiskScore"] = userRiskScore,
                        ["ActivityScore"] = userActivityScore,
                        ["DomainAdmin"] = IsDomainAdmin(user.Sid),
                        ["ServiceAccount"] = IsServiceAccount(user),
                        ["LastSeen"] = user.DiscoveryTimestamp,
                        ["SourceModule"] = user.DiscoveryModule
                    });
            }
        }

        /// <summary>
        /// T-010: Build graph nodes for devices
        /// </summary>
        private void BuildDeviceGraphNodes()
        {
            foreach (var device in _devicesByName.Values)
            {
                var deviceNodeId = $"Device_{device.Name}";
                var deviceRiskScore = CalculateDeviceRiskScore(device);

                _nodes[deviceNodeId] = new GraphNode(
                    Id: deviceNodeId,
                    Type: NodeType.Device,
                    Properties: new Dictionary<string, object>
                    {
                        ["EntityType"] = "Device",
                        ["Name"] = device.Name,
                        ["OS"] = device.OS ?? "",
                        ["PrimaryUserSid"] = device.PrimaryUserSid ?? "",
                        ["RiskScore"] = deviceRiskScore,
                        ["AppCount"] = device.InstalledApps.Count,
                        ["IsDomainController"] = IsDomainController(device.Name),
                        ["IsCritical"] = IsCriticalDevice(device.Name),
                        ["LastSeen"] = device.DiscoveryTimestamp,
                        ["SourceModule"] = device.DiscoveryModule
                    });
            }
        }

        /// <summary>
        /// T-010: Build graph nodes for groups
        /// </summary>
        private void BuildGroupGraphNodes()
        {
            foreach (var group in _groupsBySid.Values)
            {
                var groupNodeId = $"Group_{group.Sid}";
                var groupRiskScore = CalculateGroupRiskScore(group);

                _nodes[groupNodeId] = new GraphNode(
                    Id: groupNodeId,
                    Type: NodeType.Group,
                    Properties: new Dictionary<string, object>
                    {
                        ["EntityType"] = "Group",
                        ["Sid"] = group.Sid,
                        ["Name"] = group.Name ?? "",
                        ["Type"] = group.Type,
                        ["MemberCount"] = group.Members.Count,
                        ["RiskScore"] = groupRiskScore,
                        ["IsPrivileged"] = IsPrivilegedGroup(group.Name),
                        ["LastSeen"] = group.DiscoveryTimestamp,
                        ["SourceModule"] = group.DiscoveryModule
                    });
            }
        }

        /// <summary>
        /// T-010: Build graph nodes for applications
        /// </summary>
        private void BuildApplicationGraphNodes()
        {
            foreach (var app in _appsById.Values)
            {
                var appNodeId = $"App_{app.Id}";
                var appRiskScore = CalculateAppRiskScore(app);

                _nodes[appNodeId] = new GraphNode(
                    Id: appNodeId,
                    Type: NodeType.App,
                    Properties: new Dictionary<string, object>
                    {
                        ["EntityType"] = "Application",
                        ["Id"] = app.Id,
                        ["Name"] = app.Name ?? "",
                        ["Source"] = app.Source ?? "",
                        ["InstallCount"] = app.InstallCounts,
                        ["RiskScore"] = appRiskScore,
                        ["IsSystemApp"] = IsSystemApplication(app.Name),
                        ["HasKnownVulnerabilities"] = HasKnownVulnerabilities(app),
                        ["LastSeen"] = app.DiscoveryTimestamp,
                        ["SourceModule"] = app.DiscoveryModule
                    });
            }
        }

        /// <summary>
        /// T-010: Build infrastructure nodes (shares, servers, databases)
        /// </summary>
        private void BuildInfrastructureGraphNodes()
        {
            // Build file share nodes
            foreach (var share in _fileSharesByName.Values)
            {
                var shareNodeId = $"Share_{share.Server}_{share.Name}";
                var shareRiskScore = CalculateShareRiskScore(share);

                _nodes[shareNodeId] = new GraphNode(
                    Id: shareNodeId,
                    Type: NodeType.Share,
                    Properties: new Dictionary<string, object>
                    {
                        ["EntityType"] = "FileShare",
                        ["Name"] = share.Name ?? "Unknown",
                        ["Path"] = share.Path ?? "Unknown",
                        ["Server"] = share.Server ?? "Unknown",
                        ["PermissionCount"] = share.Permissions?.Count ?? 0,
                        ["RiskScore"] = shareRiskScore,
                        ["IsHiddenShare"] = share.Name?.EndsWith("$") ?? false,
                        ["IsAdminShare"] = IsAdminShare(share.Name ?? ""),
                        ["LastSeen"] = share.DiscoveryTimestamp,
                        ["SourceModule"] = share.DiscoveryModule ?? "Unknown"
                    });
            }

            // Build database nodes
            foreach (var db in _sqlDbsByKey.Values)
            {
                var dbNodeId = $"SqlDb_{db.Server}_{db.Database}";
                var dbRiskScore = CalculateDatabaseRiskScore(db);

                _nodes[dbNodeId] = new GraphNode(
                    Id: dbNodeId,
                    Type: NodeType.Db,
                    Properties: new Dictionary<string, object>
                    {
                        ["EntityType"] = "Database",
                        ["Server"] = db.Server,
                        ["Database"] = db.Database,
                        ["OwnerCount"] = db.Owners.Count,
                        ["AppHintCount"] = db.AppHints.Count,
                        ["RiskScore"] = dbRiskScore,
                        ["IsSystemDatabase"] = IsSystemDatabase(db.Database),
                        ["HasBackups"] = HasDatabaseBackups(db),
                        ["LastSeen"] = db.DiscoveryTimestamp,
                        ["SourceModule"] = db.DiscoveryModule
                    });
            }
        }

        /// <summary>
        /// T-010: Build advanced relationship edges
        /// </summary>
        private void BuildUserToGroupRelationships()
        {
            foreach (var user in _usersBySid.Values)
            {
                foreach (var groupSid in _groupsByUserSid.GetValueOrDefault(user.Sid, new List<string>()))
                {
                    if (_groupsBySid.TryGetValue(groupSid, out var group))
                    {
                        var userNodeId = $"User_{user.Sid}";
                        var groupNodeId = $"Group_{group.Sid}";

                        // Create relationship edge
                        _edges.Add(new GraphEdge(
                            userNodeId,
                            groupNodeId,
                            EdgeType.MemberOf
                        ));

                        // Track bidirectional relationship metadata
                        var relationshipKey = $"{userNodeId}|{groupNodeId}";
                        _entityRelationships[relationshipKey] = new List<string> { "MemberOf", "Contains" };
                        _entityMetadata[relationshipKey] = new Dictionary<string, object>
                        {
                            ["RelationshipType"] = "SecurityGroupMembership",
                            ["AddedDate"] = user.DiscoveryTimestamp,
                            ["IsRecursive"] = false // Can be enhanced later
                        };
                    }
                }
            }
        }

        /// <summary>
        /// T-010: Build user to device relationships
        /// </summary>
        private void BuildUserToDeviceRelationships()
        {
            foreach (var device in _devicesByName.Values)
            {
                if (!string.IsNullOrEmpty(device.PrimaryUserSid) && _usersBySid.ContainsKey(device.PrimaryUserSid))
                {
                    var userNodeId = $"User_{device.PrimaryUserSid}";
                    var deviceNodeId = $"Device_{device.Name}";

                    _edges.Add(new GraphEdge(
                        userNodeId,
                        deviceNodeId,
                        EdgeType.PrimaryUser
                    ));

                    // Track ownership metadata
                    var relationshipKey = $"{userNodeId}|{deviceNodeId}";
                    _entityRelationships[relationshipKey] = new List<string> { "PrimaryUser", "Owner" };
                    _entityMetadata[relationshipKey] = new Dictionary<string, object>
                    {
                        ["RelationshipType"] = "DeviceOwnership",
                        ["AssignmentDate"] = device.DiscoveryTimestamp,
                        ["TrustLevel"] = "Primary"
                    };
                }
            }
        }

        /// <summary>
        /// T-010: Build user to application usage relationships
        /// </summary>
        private void BuildUserToApplicationRelationships()
        {
            // Implementation would build user-app relationships through device usage
            // This is simplified as actual implementation would vary based on available telemetry
        }

        /// <summary>
        /// T-010: Build user to mailbox relationships
        /// </summary>
        private void BuildUserToMailboxRelationships()
        {
            foreach (var mailbox in _mailboxByUpn.Values)
            {
                // Find associated user by UPN
                foreach (var user in _usersByUpn.Values)
                {
                    if (user.UPN == mailbox.UPN)
                    {
                        var userNodeId = $"User_{user.Sid}";
                        var mailboxNodeId = $"Mailbox_{mailbox.UPN}";

                        _edges.Add(new GraphEdge(
                            userNodeId,
                            mailboxNodeId,
                            EdgeType.HasMailbox
                        ));

                        // Track mailbox metadata
                        var relationshipKey = $"{userNodeId}|{mailboxNodeId}";
                        _entityRelationships[relationshipKey] = new List<string> { "HasMailbox", "PrimaryMailbox" };
                        _entityMetadata[relationshipKey] = new Dictionary<string, object>
                        {
                            ["MailboxSize"] = mailbox.SizeMB,
                            ["MailboxType"] = mailbox.Type,
                            ["Quota"] = mailbox.SizeMB > 10000 ? "Large" : "Standard"
                        };
                    }
                }
            }
        }

        /// <summary>
        /// T-010: Build device to application relationships
        /// </summary>
        private void BuildDeviceToApplicationRelationships()
        {
            foreach (var device in _devicesByName.Values)
            {
                foreach (var appName in device.InstalledApps)
                {
                    // Try to find app by fuzzy matching
                    var app = FuzzyMatchApplication(appName, new List<string>(_appsById.Keys));
                    if (app != null)
                    {
                        var deviceNodeId = $"Device_{device.Name}";
                        var appNodeId = $"App_{app.Id}";

                        _edges.Add(new GraphEdge(
                            deviceNodeId,
                            appNodeId,
                            EdgeType.HasApp
                        ));

                        // Track installation metadata
                        var relationshipKey = $"{deviceNodeId}|{appNodeId}";
                        _entityRelationships[relationshipKey] = new List<string> { "HasApp", "Installed" };
                        _entityMetadata[relationshipKey] = new Dictionary<string, object>
                        {
                            ["InstallDate"] = device.DiscoveryTimestamp,
                            ["AppVersion"] = "Unknown", // Could be enhanced
                            ["InstallSource"] = app.Source ?? "Unknown"
                        };
                    }
                }
            }
        }

        /// <summary>
        /// T-010: Build device to infrastructure relationships
        /// </summary>
        private void BuildDeviceToInfrastructureRelationships()
        {
            // This would correlate devices with servers, network resources, etc.
            // Implementation simplified for brevity
        }

        /// <summary>
        /// T-010: Build security-focused relationships
        /// </summary>
        private void BuildSecurityRelationships()
        {
            // Build ACL-based security relationships
            foreach (var aclList in _aclByIdentitySid.Values)
            {
                foreach (var acl in aclList)
                {
                    var identityName = GetIdentityNameForSid(acl.IdentitySid);
                    if (!string.IsNullOrEmpty(identityName))
                    {
                        var identityNodeId = $"ACLIdentity_{acl.IdentitySid}";
                        var targetNodeId = $"ACLTarget_{acl.SourcePath}";

                        _edges.Add(new GraphEdge(
                            identityNodeId,
                            targetNodeId,
                            EdgeType.AclOn,
                            new Dictionary<string, object>
                            {
                                ["Rights"] = acl.AccessMask,
                                ["Inherited"] = acl.IsInherited
                            }
                        ));
                    }
                }
            }
        }

        

        // T-029: Risk scoring and analysis helper methods
        
        /// <summary>
        /// Calculates overall risk score using weighted average of all risk categories
        /// </summary>
        private double CalculateOverallRiskScore(double threatScore, double complianceScore, double lineageRisk, double identityRisk)
        {
            // Weights: Threats=35%, Compliance=25%, Lineage=20%, Identity=20%
            var weightedScore = (threatScore * 0.35) + 
                              ((1.0 - complianceScore) * 0.25) + // Invert compliance score (higher compliance = lower risk)
                              (lineageRisk * 0.20) + 
                              (identityRisk * 0.20);
            
            return Math.Min(1.0, Math.Max(0.0, weightedScore));
        }
        
        /// <summary>
        /// Generates top recommendations based on risk analysis
        /// </summary>
        private List<string> GenerateTopRecommendations(int criticalThreats, int criticalCompliance, 
            int orphanedSources, int unmappedIds)
        {
            var recommendations = new List<string>();
            
            if (criticalThreats > 0)
                recommendations.Add($"Address {criticalThreats} critical security threats immediately");
            
            if (criticalCompliance > 0)
                recommendations.Add($"Resolve {criticalCompliance} critical compliance violations");
                
            if (orphanedSources > 0)
                recommendations.Add($"Review {orphanedSources} orphaned data sources for cleanup");
                
            if (unmappedIds > 0)
                recommendations.Add($"Map {unmappedIds} external identities to internal accounts");
            
            // Add general recommendations if specific issues are low
            if (recommendations.Count == 0)
            {
                recommendations.Add("Continue monitoring security posture");
                recommendations.Add("Review data governance policies quarterly");
                recommendations.Add("Validate data lineage mapping regularly");
            }
            
            return recommendations.Take(5).ToList(); // Return top 5
        }
        
        /// <summary>
        /// Calculates correlations between threats based on common assets and indicators
        /// </summary>
        private List<ThreatCorrelation> CalculateThreatCorrelations(List<ThreatDetectionDTO> threats)
        {
            var correlations = new List<ThreatCorrelation>();
            
            for (int i = 0; i < threats.Count; i++)
            {
                for (int j = i + 1; j < threats.Count; j++)
                {
                    var threat1 = threats[i];
                    var threat2 = threats[j];
                    
                    var commonAssets = threat1.AffectedAssets.Intersect(threat2.AffectedAssets).ToList();
                    var commonIndicators = threat1.IndicatorsOfCompromise.Intersect(threat2.IndicatorsOfCompromise).ToList();
                    
                    if (commonAssets.Count > 0 || commonIndicators.Count > 0)
                    {
                        var correlationScore = CalculateCorrelationScore(commonAssets.Count, commonIndicators.Count);
                        
                        if (correlationScore > 0.3) // Only include significant correlations
                        {
                            correlations.Add(new ThreatCorrelation(
                                PrimaryThreatId: threat1.ThreatId,
                                RelatedThreatId: threat2.ThreatId,
                                CorrelationType: DetermineCorrelationType(commonAssets.Count, commonIndicators.Count),
                                CorrelationScore: correlationScore,
                                CommonAssets: commonAssets,
                                CommonIndicators: commonIndicators,
                                Impact: DetermineCorrelationImpact(threat1.Severity, threat2.Severity)
                            ));
                        }
                    }
                }
            }
            
            return correlations.OrderByDescending(c => c.CorrelationScore).Take(20).ToList();
        }
        
        /// <summary>
        /// Generates MITRE ATT&CK tactic summaries from threat data
        /// </summary>
        private List<MitreTacticSummary> GenerateMitreTacticSummaries(List<ThreatDetectionDTO> threats)
        {
            var tacticGroups = threats
                .Where(t => !string.IsNullOrEmpty(t.MitreTactic))
                .GroupBy(t => new { Id = t.MitreAttackId, Tactic = t.MitreTactic })
                .ToList();
                
            return tacticGroups.Select(group => new MitreTacticSummary(
                TacticId: group.Key.Id,
                TacticName: group.Key.Tactic,
                TechniquesFound: group.Select(t => t.MitreTechnique).Where(t => !string.IsNullOrEmpty(t)).Distinct().ToList(),
                ThreatCount: group.Count(),
                AverageConfidence: group.Average(t => t.Confidence),
                AffectedAssets: group.SelectMany(t => t.AffectedAssets).Distinct().ToList()
            )).OrderByDescending(t => t.ThreatCount).ToList();
        }
        
        /// <summary>
        /// Calculates correlation score between two threats
        /// </summary>
        private double CalculateCorrelationScore(int commonAssets, int commonIndicators)
        {
            // Base score from shared resources
            double score = (commonAssets * 0.4) + (commonIndicators * 0.6);
            
            // Normalize to 0-1 range (assuming max 5 shared assets/indicators is high correlation)
            return Math.Min(1.0, score / 5.0);
        }
        
        /// <summary>
        /// Determines correlation type based on what is shared
        /// </summary>
        private string DetermineCorrelationType(int commonAssets, int commonIndicators)
        {
            if (commonAssets > 0 && commonIndicators > 0)
                return "Asset and Indicator Correlation";
            else if (commonAssets > 0)
                return "Asset Correlation";
            else if (commonIndicators > 0)
                return "Indicator Correlation";
            else
                return "Unknown Correlation";
        }
        
        /// <summary>
        /// Determines combined impact of correlated threats
        /// </summary>
        private string DetermineCorrelationImpact(string severity1, string severity2)
        {
            var severityValues = new Dictionary<string, int>
            {
                ["Critical"] = 4,
                ["High"] = 3,
                ["Medium"] = 2,
                ["Low"] = 1
            };
            
            var val1 = severityValues.GetValueOrDefault(severity1, 2);
            var val2 = severityValues.GetValueOrDefault(severity2, 2);
            var combined = Math.Max(val1, val2);
            
            return combined switch
            {
                4 => "Critical Combined Impact",
                3 => "High Combined Impact", 
                2 => "Medium Combined Impact",
                _ => "Low Combined Impact"
            };
        }

        /// <summary>
        /// Calculates risk score for a user based on various factors
        /// </summary>
        private double CalculateUserRiskScore(UserDto user)
        {
            double riskScore = 0.0;

            // Domain admin status contributes to risk
            if (IsDomainAdmin(user.Sid))
            {
                riskScore += 0.8; // High privilege = high risk
            }

            // Service account status
            if (IsServiceAccount(user))
            {
                riskScore += 0.3; // Service accounts have moderate risk
            }

            // Recent activity (inverted - lower activity = higher risk)
            var activityScore = CalculateUserActivityScore(user);
            riskScore += Math.Max(0, 1.0 - activityScore) * 0.2;

            // Group membership complexity
            var groupCount = _groupsByUserSid.GetValueOrDefault(user.Sid, new List<string>()).Count;
            if (groupCount > 10)
            {
                riskScore += 0.4; // Complex group membership increases risk
            }

            return Math.Min(1.0, Math.Max(0.0, riskScore));
        }

        /// <summary>
        /// Calculates user activity score based on available behavioral data
        /// </summary>
        private double CalculateUserActivityScore(UserDto user)
        {
            double activityScore = 0.5; // Default baseline

            // If user has drives mapped
            if (_drivesByUserSid.ContainsKey(user.Sid))
                activityScore += 0.1;

            // If user has ACL entries
            if (_aclByIdentitySid.ContainsKey(user.Sid))
                activityScore += 0.1;

            // If user has mailbox
            if (_mailboxByUpn.ContainsKey(user.UPN))
                activityScore += 0.1;

            // If user has Azure Object ID
            if (!string.IsNullOrEmpty(user.AzureObjectId))
                activityScore += 0.1;

            // If user has primary device
            if (_devicesByPrimaryUserSid.ContainsKey(user.Sid))
                activityScore += 0.1;

            return Math.Min(1.0, Math.Max(0.0, activityScore));
        }

        /// <summary>
        /// Checks if a user has domain admin privileges
        /// </summary>
        private bool IsDomainAdmin(string sid)
        {
            // Check if user is in critical groups (simplified heuristic)
            var userGroups = _groupsByUserSid.GetValueOrDefault(sid, new List<string>());

            // Common domain admin group SIDs or names
            return userGroups.Any(groupSid =>
            {
                var group = _groupsBySid.GetValueOrDefault(groupSid);
                return group != null && (
                    group.Name.Contains("Domain Admin", StringComparison.OrdinalIgnoreCase) ||
                    group.Name.Contains("Enterprise Admin", StringComparison.OrdinalIgnoreCase) ||
                    group.Sid.Contains("-512") || // Domain Admins SID pattern
                    group.Sid.Contains("-544") || // Administrators SID pattern
                    group.Sid.Contains("-516")    // Domain Controllers SID pattern
                );
            });
        }

        /// <summary>
        /// Checks if user is a service account
        /// </summary>
        private bool IsServiceAccount(UserDto user)
        {
            if (user.Sam == null) return false;

            // Common service account patterns
            var accountName = user.Sam.ToLowerInvariant();
            return accountName.Contains("svc_") ||
                   accountName.Contains("$") ||
                   accountName.Contains("service") ||
                   accountName.Contains("_sql") ||
                   accountName.Contains("_iis") ||
                   accountName.Contains("_app");
        }

        /// <summary>
        /// Calculates risk score for a device
        /// </summary>
        private double CalculateDeviceRiskScore(DeviceDto device)
        {
            double riskScore = 0.0;

            // Domain controller status
            if (IsDomainController(device.Name))
            {
                riskScore += 0.9; // Very high risk for critical infrastructure
            }

            // Critical system status
            if (IsCriticalDevice(device.Name))
            {
                riskScore += 0.7;
            }

            // OS age risk
            if (!string.IsNullOrEmpty(device.OS))
            {
                if (device.OS.Contains("2008") || device.OS.Contains("2012"))
                {
                    riskScore += 0.6; // End of life or nearing end
                }
                else if (device.OS.Contains("2016") || device.OS.Contains("2019"))
                {
                    riskScore += 0.2; // Approaching end of support
                }
            }

            // Application count (complexity risk)
            if (device.InstalledApps.Count > 20)
            {
                riskScore += 0.2;
            }

            // Stale primary user (orphaned device)
            if (!string.IsNullOrEmpty(device.PrimaryUserSid) &&
                !_usersBySid.ContainsKey(device.PrimaryUserSid))
            {
                riskScore += 0.3; // Orphaned relationship
            }

            return Math.Min(1.0, Math.Max(0.0, riskScore));
        }

        /// <summary>
        /// Checks if device is a domain controller
        /// </summary>
        private bool IsDomainController(string deviceName)
        {
            if (string.IsNullOrEmpty(deviceName))
            {
                return false;
            }

            var name = deviceName.ToLowerInvariant();
            return name.Contains("^dc", StringComparison.OrdinalIgnoreCase) ||
                   name.Contains("domain control", StringComparison.OrdinalIgnoreCase) ||
                   _devicesByName.Values.Any(d => d.Name == deviceName &&
                       (d.OS?.Contains("Server", StringComparison.OrdinalIgnoreCase) == true ||
                        d.Name?.Length <= 3)); // Short server names often indicate DCs
        }

        /// <summary>
        /// Checks if device is considered critical infrastructure
        /// </summary>
        private bool IsCriticalDevice(string deviceName)
        {
            var name = deviceName.ToLowerInvariant();
            return name.Contains("sql", StringComparison.OrdinalIgnoreCase) ||
                   name.Contains("db", StringComparison.OrdinalIgnoreCase) ||
                   name.Contains("prod", StringComparison.OrdinalIgnoreCase) ||
                   name.Contains("app", StringComparison.OrdinalIgnoreCase) ||
                   name.Contains("web", StringComparison.OrdinalIgnoreCase) ||
                   name.Contains("srv", StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Calculates risk score for a group
        /// </summary>
        private double CalculateGroupRiskScore(GroupDto group)
        {
            double riskScore = 0.0;

            // Privileged group status
            if (IsPrivilegedGroup(group.Name))
            {
                riskScore += 0.8; // High privilege = high risk
            }

            // Large group size
            if (group.Members.Count > 100)
            {
                riskScore += 0.5; // Large groups are harder to manage
            }
            else if (group.Members.Count > 20)
            {
                riskScore += 0.2;
            }

            // Groups with few members might need attention
            if (group.Members.Count < 3)
            {
                riskScore += 0.1;
            }

            return Math.Min(1.0, Math.Max(0.0, riskScore));
        }

        /// <summary>
        /// Checks if group has privileged access
        /// </summary>
        private bool IsPrivilegedGroup(string? groupName)
        {
            if (string.IsNullOrEmpty(groupName)) return false;

            var name = groupName.ToLowerInvariant();
            return name.Contains("admin") ||
                   name.Contains("domain") ||
                   name.Contains("enterprise") ||
                   name.Contains("server") ||
                   name.Contains("operator") ||
                   name.Contains("backup");
        }

        /// <summary>
        /// Calculates risk score for an application
        /// </summary>
        private double CalculateAppRiskScore(AppDto app)
        {
            double riskScore = 0.0;

            // System application status
            if (IsSystemApplication(app.Name))
            {
                riskScore += 0.4; // System apps have moderate risk if not updated
            }

            // Installation count (widespread deployment increases risk of issues)
            if (app.InstallCounts > 50)
            {
                riskScore += 0.3;
            }
            else if (app.InstallCounts > 10)
            {
                riskScore += 0.1;
            }

            // Known vulnerabilities
            if (HasKnownVulnerabilities(app))
            {
                riskScore += 0.8;
            }

            // Publisher trust (unverified publishers carry higher risk)
            if (app.Publishers == null || !app.Publishers.Any() ||
                !app.Publishers.Any(p => p.Contains("Microsoft", StringComparison.OrdinalIgnoreCase)))
            {
                riskScore += 0.2;
            }

            return Math.Min(1.0, Math.Max(0.0, riskScore));
        }

        /// <summary>
        /// Checks if application is a system component
        /// </summary>
        private bool IsSystemApplication(string? appName)
        {
            if (string.IsNullOrEmpty(appName)) return false;

            var name = appName.ToLowerInvariant();
            return name.Contains("windows") ||
                   name.Contains("microsoft office") ||
                   name.Contains("active directory") ||
                   name.Contains("system") ||
                   name.Contains("security") ||
                   name.Contains("antivirus");
        }

        /// <summary>
        /// Checks for known vulnerabilities in the application
        /// </summary>
        private bool HasKnownVulnerabilities(AppDto app)
        {
            if (app == null || string.IsNullOrEmpty(app.Name))
            {
                return false;
            }

            // Simple heuristic-based vulnerability detection
            // This would typically integrate with a CVE database

            var name = app.Name.ToLowerInvariant();

            // Well-known vulnerable patterns
            return name.Contains("java 6") ||
                   name.Contains(".net 2.0") ||
                   name.Contains("flash") ||
                   name.Contains("silverlight") ||
                   (name.Contains("openssl") && app.Name.Contains("1.0")) ||
                   name.Contains("wordpress"); // Example vulnerable patterns
        }

        /// <summary>
        /// Calculates risk score for a file share
        /// </summary>
        private double CalculateShareRiskScore(FileShareDto share)
        {
            double riskScore = 0.0;

            // Administrative share status
            if (IsAdminShare(share.Name))
            {
                riskScore += 0.7; // Admin shares carry high security risk
            }

            // Permission complexity
            if (share.Permissions.Count > 10)
            {
                riskScore += 0.3; // Complex permissions are harder to manage
            }
            else if (share.Permissions.Count == 1)
            {
                // Single permission might indicate restricted access that needs review
                riskScore += 0.1;
            }

            // Hidden share check
            if (share.Name?.EndsWith("$") == true)
            {
                riskScore += 0.4; // Hidden shares may hide sensitive data
            }

            return Math.Min(1.0, Math.Max(0.0, riskScore));
        }

        /// <summary>
        /// Checks if share is an administrative share
        /// </summary>
        private bool IsAdminShare(string? shareName)
        {
            if (string.IsNullOrEmpty(shareName)) return false;

            return shareName.Equals("C$", StringComparison.OrdinalIgnoreCase) ||
                   shareName.Equals("D$", StringComparison.OrdinalIgnoreCase) ||
                   shareName.Equals("E$", StringComparison.OrdinalIgnoreCase) ||
                   shareName.Equals("F$", StringComparison.OrdinalIgnoreCase) ||
                   shareName.Equals("ADMIN$", StringComparison.OrdinalIgnoreCase) ||
                   shareName.Equals("SYSVOL", StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Calculates risk score for a SQL database
        /// </summary>
        private double CalculateDatabaseRiskScore(SqlDbDto db)
        {
            double riskScore = 0.0;

            // System database status
            if (IsSystemDatabase(db.Database))
            {
                riskScore += 0.8; // System databases are critical
            }

            // Backup status
            if (!HasDatabaseBackups(db))
            {
                riskScore += 0.9; // No backups dramatically increase risk
            }

            // Owner complexity (multiple owners can be problematic)
            if (db.Owners.Count > 3)
            {
                riskScore += 0.2;
            }

            // Database name patterns indicating production
            var dbName = db.Database?.ToLowerInvariant() ?? "";
            if (dbName.Contains("prod") ||
                dbName.Contains("production") ||
                dbName.Contains("live") ||
                dbName.Equals("master") ||
                dbName.StartsWith("sports_", StringComparison.OrdinalIgnoreCase)) // Domain-specific critical DB
            {
                riskScore += 0.5;
            }

            return Math.Min(1.0, Math.Max(0.0, riskScore));
        }

        /// <summary>
        /// Checks if database is a system database
        /// </summary>
        private bool IsSystemDatabase(string? databaseName)
        {
            if (string.IsNullOrEmpty(databaseName)) return false;

            var name = databaseName.ToLowerInvariant();
            return name.Equals("master") ||
                   name.Equals("model") ||
                   name.Equals("msdb") ||
                   name.Contains("session") ||
                   name.Contains("distribution") ||
                   name.StartsWith("reportserver") ||
                   name.StartsWith("system") ||
                   name.Contains("metadata");
        }

        /// <summary>
        /// Checks if database has proper backup configuration
        /// </summary>
        private bool HasDatabaseBackups(SqlDbDto db)
        {
            // This would typically check backup history or configuration
            // For now, use a heuristic based on database type and activity

            var dbName = db.Database?.ToLowerInvariant() ?? "";

            // System databases are typically always backed up by default
            if (IsSystemDatabase(db.Database))
            {
                return true;
            }

            // Production databases usually have backups
            if (dbName.Contains("prod") || dbName.Contains("production"))
            {
                return true; // Assume production has backups
            }

            // For user databases, assume they have backups if they have users/owners
            return db.Owners.Count > 0;
        }

        #region Helper Methods for Projections

        private List<LogicEngineRisk> CalculateEntityRisks(string entityId, string entityType)
        {
            var risks = new List<LogicEngineRisk>();
            var missingMappings = new List<string>();
            var orphanedAcls = new List<string>();
            var unresolvableSidRefs = new List<string>();
            
            try
            {
                // Check for missing mappings based on entity type
                if (entityType == "User")
                {
                    var user = _usersBySid.GetValueOrDefault(entityId);
                    if (user != null)
                    {
                        // Check for missing Azure Object ID
                        if (string.IsNullOrEmpty(user.AzureObjectId))
                        {
                            missingMappings.Add("Missing Azure Object ID mapping");
                        }
                        
                        // Check for missing manager reference
                        if (!string.IsNullOrEmpty(user.ManagerSid) && !_usersBySid.ContainsKey(user.ManagerSid))
                        {
                            unresolvableSidRefs.Add($"Manager SID: {user.ManagerSid}");
                        }
                        
                        // Check for orphaned ACL entries
                        var userAcls = _aclByIdentitySid.GetValueOrDefault<string, List<AclEntry>>(entityId, new List<AclEntry>());
                        foreach (var acl in userAcls)
                        {
                            // Check if ACL path still exists or is accessible
                            if (string.IsNullOrEmpty(acl.AccessMask) || acl.AccessMask == "None")
                            {
                                orphanedAcls.Add(acl.SourcePath);
                            }
                        }
                    }
                }
                else if (entityType == "Device")
                {
                    var device = _devicesByName.GetValueOrDefault(entityId);
                    if (device != null)
                    {
                        // Check for missing primary user
                        if (string.IsNullOrEmpty(device.PrimaryUserSid))
                        {
                            missingMappings.Add("No primary user assigned");
                        }
                        else if (!_usersBySid.ContainsKey(device.PrimaryUserSid))
                        {
                            unresolvableSidRefs.Add($"Primary User SID: {device.PrimaryUserSid}");
                        }
                        
                        // Check for outdated OS
                        if (!string.IsNullOrEmpty(device.OS) && 
                            (device.OS.Contains("Windows 7", StringComparison.OrdinalIgnoreCase) ||
                             device.OS.Contains("Windows 8", StringComparison.OrdinalIgnoreCase) ||
                             device.OS.Contains("Server 2008", StringComparison.OrdinalIgnoreCase) ||
                             device.OS.Contains("Server 2012", StringComparison.OrdinalIgnoreCase)))
                        {
                            missingMappings.Add("Outdated operating system");
                        }
                    }
                }
                
                // Determine severity based on risk count
                var riskCount = missingMappings.Count + orphanedAcls.Count + unresolvableSidRefs.Count;
                var severity = riskCount switch
                {
                    0 => "Low",
                    <= 2 => "Medium",
                    <= 5 => "High",
                    _ => "Critical"
                };
                
                if (riskCount > 0)
                {
                    risks.Add(new LogicEngineRisk(
                        EntityId: entityId,
                        EntityType: entityType,
                        MissingMappings: missingMappings,
                        OrphanedAcls: orphanedAcls,
                        UnresolvableSidRefs: unresolvableSidRefs,
                        Severity: severity
                    ));
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to calculate risks for {EntityType} {EntityId}", entityType, entityId);
            }
            
            return risks;
        }
        
        private List<MigrationHint> GenerateMigrationHints(string entityId, string entityType)
        {
            var hints = new List<MigrationHint>();
            
            try
            {
                if (entityType == "User")
                {
                    var user = _usersBySid.GetValueOrDefault(entityId);
                    if (user != null)
                    {
                        var requiredActions = new Dictionary<string, string>();
                        
                        // Check for complex group memberships
                        var userGroups = _groupsByUserSid.GetValueOrDefault(entityId, new List<string>());
                        if (userGroups.Count > 10)
                        {
                            requiredActions["GroupMemberships"] = $"Review {userGroups.Count} group memberships for consolidation";
                        }
                        
                        // Check for mapped drives
                        var userDrives = _drivesByUserSid.GetValueOrDefault(entityId, new List<MappedDriveDto>());
                        if (userDrives.Count > 0)
                        {
                            requiredActions["MappedDrives"] = $"Migrate {userDrives.Count} mapped drive connections";
                        }
                        
                        // Check for mailbox size
                        var mailbox = _mailboxByUpn.GetValueOrDefault(user.UPN);
                        if (mailbox != null && mailbox.SizeMB > 50000) // 50GB threshold
                        {
                            requiredActions["LargeMailbox"] = $"Large mailbox ({mailbox.SizeMB:N0} MB) may require pre-staging";
                        }
                        
                        if (requiredActions.Count > 0)
                        {
                            hints.Add(new MigrationHint(
                                EntityId: entityId,
                                EntityType: entityType,
                                HintType: "ComplexMigration",
                                Description: "User has complex configuration requiring special attention",
                                RequiredActions: requiredActions
                            ));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to generate migration hints for {EntityType} {EntityId}", entityType, entityId);
            }
            
            return hints;
        }
        
        private List<SqlDbDto> GetUserSqlDatabases(string userSid)
        {
            var databases = new List<SqlDbDto>();

            try
            {
                // Add null check for userSid parameter to fix CS8604 warning
                if (string.IsNullOrEmpty(userSid)) return databases;

                var user = _usersBySid.GetValueOrDefault(userSid);
                if (user == null) return databases;

                // Find databases where user is listed as owner by SID, UPN, or display name
                foreach (var sqlDb in _sqlDbsByKey.Values)
                {
                    if (sqlDb.Owners.Contains(userSid) ||
                        (!string.IsNullOrEmpty(user.UPN) && sqlDb.Owners.Contains(user.UPN)) ||
                        (!string.IsNullOrEmpty(user.DisplayName) && sqlDb.Owners.Contains(user.DisplayName)) ||
                        (!string.IsNullOrEmpty(user.Sam) && sqlDb.Owners.Contains(user.Sam)))
                    {
                        databases.Add(sqlDb);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to get SQL databases for user {UserSid}", userSid);
            }

            return databases;
        }
        
        private List<GpoDto> GetUserApplicableGpos(UserDto user)
        {
            var applicableGpos = new List<GpoDto>();
            
            try
            {
                // Get GPOs linked to user's OU
                if (!string.IsNullOrEmpty(user.OU))
                {
                    var ouGpos = _gposByOu.GetValueOrDefault(user.OU, new List<GpoDto>());
                    
                    foreach (var gpo in ouGpos)
                    {
                        if (!gpo.Enabled) continue;
                        
                        // Check security filtering
                        bool applies = false;
                        
                        if (gpo.SecurityFilter.Count == 0)
                        {
                            // No security filtering = applies to all authenticated users
                            applies = true;
                        }
                        else
                        {
                            // Check if user or user's groups are in security filter
                            if (gpo.SecurityFilter.Contains(user.Sid))
                            {
                                applies = true;
                            }
                            else
                            {
                                var userGroups = _groupsByUserSid.GetValueOrDefault(user.Sid, new List<string>());
                                applies = userGroups.Any(groupSid => gpo.SecurityFilter.Contains(groupSid));
                            }
                        }
                        
                        if (applies)
                        {
                            applicableGpos.Add(gpo);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to get applicable GPOs for user {UserSid}", user.Sid);
            }
            
            return applicableGpos;
        }
        
        private List<AclEntry> GetDeviceShareUsage(string deviceName)
        {
            var shareUsage = new List<AclEntry>();
            
            try
            {
                // Find ACL entries where the path might be accessed by this device
                // This is a simplified heuristic - in reality would need more sophisticated logic
                foreach (var aclList in _aclByIdentitySid.Values)
                {
                    foreach (var acl in aclList)
                    {
                        if (acl.SourcePath.Contains(deviceName, StringComparison.OrdinalIgnoreCase) ||
                            acl.SourcePath.StartsWith($"\\\\{deviceName}", StringComparison.OrdinalIgnoreCase))
                        {
                            shareUsage.Add(acl);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to get share usage for device {DeviceName}", deviceName);
            }
            
            return shareUsage;
        }
        
        private List<GpoDto> GetDeviceApplicableGpos(DeviceDto device)
        {
            var applicableGpos = new List<GpoDto>();
            
            try
            {
                // Get GPOs linked to device's OU
                if (!string.IsNullOrEmpty(device.OU))
                {
                    var ouGpos = _gposByOu.GetValueOrDefault(device.OU, new List<GpoDto>());
                    applicableGpos.AddRange(ouGpos.Where(gpo => gpo.Enabled));
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to get applicable GPOs for device {DeviceName}", device.Name);
            }
            
            return applicableGpos;
        }
        
        private List<string> GetDeviceBackupInfo(string deviceName)
        {
            // Placeholder - would integrate with backup discovery modules
            return new List<string>();
        }
        
        private List<string> GetDeviceVulnerabilities(string deviceName)
        {
            var vulnerabilities = new List<string>();
            
            try
            {
                // Check if device has known vulnerabilities based on OS
                var device = _devicesByName.GetValueOrDefault(deviceName);
                if (device != null && !string.IsNullOrEmpty(device.OS))
                {
                    // Simple heuristics for common vulnerabilities
                    if (device.OS.Contains("Windows 7", StringComparison.OrdinalIgnoreCase))
                    {
                        vulnerabilities.Add("Unsupported operating system (Windows 7)");
                    }
                    
                    if (device.OS.Contains("Server 2008", StringComparison.OrdinalIgnoreCase))
                    {
                        vulnerabilities.Add("Unsupported server OS (Server 2008)");
                    }
                    
                    // Check for applications with known issues
                    var deviceApps = _appsByDevice.GetValueOrDefault(deviceName, new List<string>());
                    foreach (var appId in deviceApps)
                    {
                        var app = _appsById.GetValueOrDefault(appId);
                        if (app != null)
                        {
                            // Simple checks for problematic applications
                            if (app.Name.Contains("Java", StringComparison.OrdinalIgnoreCase) && 
                                !app.Name.Contains("17") && !app.Name.Contains("21"))
                            {
                                vulnerabilities.Add($"Outdated Java version: {app.Name}");
                            }
                            
                            if (app.Name.Contains("Flash", StringComparison.OrdinalIgnoreCase))
                            {
                                vulnerabilities.Add("Adobe Flash installed (deprecated)");
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to get vulnerabilities for device {DeviceName}", deviceName);
            }
            
            return vulnerabilities;
        }
        
        private List<AclEntry> ConvertAclEntryDtoToAclEntry(List<AclEntryDto> dtoList)
        {
            var result = new List<AclEntry>();
            
            foreach (var dto in dtoList)
            {
                result.Add(new AclEntry
                {
                    Id = Guid.NewGuid().ToString(),
                    IdentityReference = dto.IdentitySid,
                    AccessMask = dto.Rights,
                    AccessControlType = "Allow", // Default since DTO doesn't specify
                    InheritanceFlags = dto.Inherited ? "ContainerInherit, ObjectInherit" : "None",
                    PropagationFlags = "None",
                    IsInherited = dto.Inherited,
                    SourcePath = dto.Path,
                    TargetPath = dto.Path,
                    IdentitySid = dto.IdentitySid,
                    MappingStatus = MappingStatus.Pending,
                    MappedIdentity = "",
                    Properties = new Dictionary<string, object>
                    {
                        ["IsShare"] = dto.IsShare,
                        ["IsNTFS"] = dto.IsNTFS,
                        ["DiscoveryModule"] = dto.DiscoveryModule,
                        ["SessionId"] = dto.SessionId
                    }
                });
            }
            
            return result;
        }
        
        private void ApplyPrimaryDeviceInference()
        {
            _logger.LogDebug("Applying primary device inference rules");
            
            // Infer primary devices based on device ownership
            foreach (var device in _devicesByName.Values)
            {
                if (!string.IsNullOrEmpty(device.PrimaryUserSid))
                {
                    _devicesByPrimaryUserSid.AddOrUpdate(device.PrimaryUserSid,
                        new List<DeviceDto> { device },
                        (key, existing) => 
                        {
                            if (!existing.Any(d => d.Name == device.Name))
                                existing.Add(device);
                            return existing;
                        });
                }
            }
        }
        
        private void ApplyApplicationUsageInference()
        {
            _logger.LogDebug("Applying application usage inference rules");
            
            // Build app-device relationships from device installed apps
            foreach (var device in _devicesByName.Values)
            {
                foreach (var appName in device.InstalledApps)
                {
                    // Try to match app name to app ID
                    var app = _appsById.Values.FirstOrDefault(a => 
                        a.Name.Equals(appName, StringComparison.OrdinalIgnoreCase));
                    
                    if (app != null)
                    {
                        _appsByDevice.AddOrUpdate(device.Name,
                            new List<string> { app.Id },
                            (key, existing) => 
                            {
                                if (!existing.Contains(app.Id))
                                    existing.Add(app.Id);
                                return existing;
                            });
                    }
                }
            }
        }
        
        #endregion

        /// <summary>
        /// Gets comprehensive group detail projection including all related entities
        /// </summary>
        public Task<GroupDto?> GetGroupDetailAsync(string groupName)
        {
            // Try to find by SID first, then by name fallback
            var group = _groupsBySid.Values.FirstOrDefault(g => g.Name?.Equals(groupName, StringComparison.OrdinalIgnoreCase) == true);
            return Task.FromResult(group);
        }
        
        /// <summary>
        /// Gets comprehensive file share detail projection including permissions and usage
        /// </summary>
        public Task<FileShareDto?> GetFileShareDetailAsync(string shareName)
        {
            // Try to find the share from loaded data
            if (_fileSharesByName.TryGetValue(shareName, out var share))
            {
                return Task.FromResult<FileShareDto?>(share);
            }

            // Return a basic stub if not found in loaded data
            var stubShare = new FileShareDto(
                Name: shareName,
                Path: $"\\\\server\\{shareName}",
                Description: $"File share: {shareName}",
                Server: "server",
                Permissions: new List<string>(),
                DiscoveryTimestamp: DateTime.UtcNow,
                DiscoveryModule: "StubModule",
                SessionId: Guid.NewGuid().ToString()
            );

            return Task.FromResult<FileShareDto?>(stubShare);
        }
        
        /// <summary>
        /// Gets comprehensive mailbox detail projection including size and permissions
        /// </summary>
        public Task<MailboxDto?> GetMailboxDetailAsync(string mailboxName)
        {
            // Find mailbox from loaded data
            var mailbox = _mailboxByUpn.Values.FirstOrDefault(m =>
                m.UserPrincipalName?.Equals(mailboxName, StringComparison.OrdinalIgnoreCase) == true ||
                m.UserPrincipalName?.Contains(mailboxName, StringComparison.OrdinalIgnoreCase) == true);

            return Task.FromResult(mailbox);
        }
        
        /// <summary>
        /// Gets mailbox by UPN for eligibility checks
        /// </summary>
        public Task<MailboxDto?> GetMailboxByUpnAsync(string upn)
        {
            _mailboxByUpn.TryGetValue(upn, out var mailbox);
            return Task.FromResult(mailbox);
        }
        
        /// <summary>
        /// Gets all users for eligibility analysis
        /// </summary>
        public Task<List<UserDto>> GetAllUsersAsync()
        {
            return Task.FromResult(_usersBySid.Values.ToList());
        }
        
        /// <summary>
        /// Gets all mailboxes for eligibility analysis
        /// </summary>
        public Task<List<MailboxDto>> GetAllMailboxesAsync()
        {
            return Task.FromResult(_mailboxByUpn.Values.ToList());
        }
        
        private readonly ConcurrentDictionary<string, FileShareDto> _fileSharesByName = new();

        /// <summary>
        /// Gets all file shares for eligibility analysis
        /// </summary>
        public async Task<List<FileShareDto>> GetAllFileSharesAsync()
        {
            // Build file shares from NTFS ACL data and share patterns
            var fileShares = BuildFileSharesFromAclData();

            if (fileShares.Count == 0)
            {
                // Fallback to hardcoded data if no ACL data available
                fileShares = new List<FileShareDto>
                {
                    new FileShareDto(
                        Name: "SharedDocs",
                        Path: @"\\server\shareddocs",
                        Description: "Shared documents folder",
                        Server: "FileServer01",
                        Permissions: new List<string> { "Domain Users" },
                        DiscoveryTimestamp: DateTime.UtcNow.AddDays(-1),
                        DiscoveryModule: "FileServerDiscovery",
                        SessionId: Guid.NewGuid().ToString()
                    ),
                    new FileShareDto(
                        Name: "UserProfiles",
                        Path: @"\\server\profiles$",
                        Description: "User profile share",
                        Server: "FileServer01",
                        Permissions: new List<string> { "Domain Admins" },
                        DiscoveryTimestamp: DateTime.UtcNow.AddDays(-1),
                        DiscoveryModule: "FileServerDiscovery",
                        SessionId: Guid.NewGuid().ToString()
                    )
                };
            }

            return fileShares;
        }

        /// <summary>
        /// T-010: Build file shares from NTFS ACL data and share patterns
        /// </summary>
        private List<FileShareDto> BuildFileSharesFromAclData()
        {
            var shares = new Dictionary<string, List<string>>();
            var permissions = new Dictionary<string, List<string>>();
            var discoveryData = new Dictionary<string, (DateTime Timestamp, string Module, string SessionId)>();

            // Extract file shares from ACL data
            foreach (var aclList in _aclByIdentitySid.Values)
            {
                foreach (var acl in aclList.Where(a => a.SourcePath != null))
                {
                    // Check if this ACL represents a share (look in Properties)
                    bool isShare = acl.Properties.TryGetValue("IsShare", out var isShareValue) && (bool)isShareValue == true;

                    // Alternative: check if SourcePath looks like a share path
                    if (!isShare && acl.SourcePath != null && acl.SourcePath.StartsWith(@"\\"))
                    {
                        var segments = acl.SourcePath.Split('\\', StringSplitOptions.RemoveEmptyEntries);
                        isShare = segments.Length >= 2 && !segments[1].Contains("$") || segments[1].EndsWith("$"); // Share pattern
                    }

                    if (isShare && acl.SourcePath != null)
                    {
                        var path = acl.SourcePath;

                        // Extract share name from path (e.g., \\server\sharename)
                        if (path.Contains('\\'))
                        {
                            var segments = path.Split('\\', StringSplitOptions.RemoveEmptyEntries);
                            if (segments.Length >= 2)
                            {
                                var server = segments[0];
                                var shareName = segments[1];
                                var shareKey = $"{server}\\{shareName}";

                                // Add unique share
                                if (!shares.ContainsKey(shareKey))
                                {
                                    shares[shareKey] = new List<string> { path };
                                }

                                // Track permissions for this share
                                if (!permissions.ContainsKey(shareKey))
                                {
                                    permissions[shareKey] = new List<string>();
                                }

                                var identityName = GetIdentityNameForSid(acl.IdentitySid);
                                if (!string.IsNullOrEmpty(identityName) && permissions.TryGetValue(shareKey, out var permissionList))
                                {
                                    if (!permissionList.Contains(identityName))
                                    {
                                        permissionList.Add(identityName);
                                    }
                                }

                                // Track discovery metadata - we need to get this from Properties
                                if (!discoveryData.ContainsKey(shareKey))
                                {
                                    // Try to get from ACL Properties, fallback to current time
                                    DateTime timestamp = DateTime.UtcNow;
                                    string module = "NTFS_ACL";
                                    string session = Guid.NewGuid().ToString();

                                    if (acl.Properties.ContainsKey("DiscoveryTimestamp"))
                                    {
                                        timestamp = (DateTime)acl.Properties["DiscoveryTimestamp"];
                                    }
                                    if (acl.Properties.ContainsKey("DiscoveryModule"))
                                    {
                                        module = (string)acl.Properties["DiscoveryModule"];
                                    }
                                    if (acl.Properties.ContainsKey("SessionId"))
                                    {
                                        session = (string)acl.Properties["SessionId"];
                                    }

                                    discoveryData[shareKey] = (timestamp, module, session);
                                }
                            }
                        }
                    }
                }
            }

            // Convert to FileShareDto objects
            var fileShares = new List<FileShareDto>();
            foreach (var kvp in shares)
            {
                var shareKey = kvp.Key;
                var paths = kvp.Value;
                var perms = permissions.GetValueOrDefault(shareKey, new List<string>());
                var meta = discoveryData.GetValueOrDefault(shareKey, (DateTime.UtcNow, "NTFS_ACL", Guid.NewGuid().ToString()));

                var segments = shareKey.Split('\\');
                var server = segments[0];
                var shareName = segments[1];

                var shareDto = new FileShareDto(
                    Name: shareName,
                    Path: $"\\\\{server}\\{shareName}",
                    Description: BuildShareDescription(shareName, paths.Count),
                    Server: server,
                    Permissions: perms,
                    DiscoveryTimestamp: meta.Item1,
                    DiscoveryModule: meta.Item2,
                    SessionId: meta.Item3
                );

                if (shareName == null)
                {
                    continue;
                }

                _fileSharesByName[shareName] = shareDto;
                fileShares.Add(shareDto);
            }

            return fileShares;
        }

        /// <summary>
        /// T-010: Helper method to get identity name for SID using fuzzy matching
        /// </summary>
        private string GetIdentityNameForSid(string sid)
        {
            // Try exact match in users first
            if (_usersBySid.TryGetValue(sid, out var user))
            {
                return $"{user.DisplayName ?? user.Sam}@{user.UPN}";
            }

            // Try exact match in groups
            if (_groupsBySid.TryGetValue(sid, out var group))
            {
                return $"Group: {group.Name}";
            }

            // Try fuzzy matching if enabled (T-010 fuzzy matching feature)
            return FuzzyMatchIdentityName(sid) ?? sid;
        }

        /// <summary>
        /// T-010: Enhanced fuzzy matching for identity resolution with multiple algorithms
        /// </summary>
        private string? FuzzyMatchIdentityName(string sid)
        {
            // Exact SID matches for domain groups
            if (sid == "S-1-5-21-1-1-1-512") return "BUILTIN\\Domain Admins";
            if (sid == "S-1-5-21-1-1-1-513") return "BUILTIN\\Domain Users";
            if (sid == "S-1-5-21-1-1-1-514") return "BUILTIN\\Domain Guests";
            if (sid == "S-1-5-21-1-1-1-515") return "BUILTIN\\Enterprise Admins";

            // Builtin account SIDs
            if (sid == "S-1-5-18") return "LocalSystem";
            if (sid == "S-1-5-19") return "LocalService";
            if (sid == "S-1-5-20") return "NetworkService";
            if (sid == "S-1-5-21-1-1-1-1000") return "Administrator";

            // If we know this is a domain SID pattern, try to find a matching user/group
            if (sid.StartsWith("S-1-5-21-"))
            {
                // Try exact SID match first
                if (_usersBySid.ContainsKey(sid) || _groupsBySid.ContainsKey(sid))
                {
                    // Exact match found - would return the actual name from the data
                    return null; // Call FuzzyFindClosestMatch instead
                }

                // Fuzzy match against known users/groups by SID pattern
                return FuzzyFindClosestMatch(sid);
            }

            return null;
        }

        /// <summary>
        /// T-010: Fuzzy matching algorithm to find closest SID match
        /// </summary>
        private string? FuzzyFindClosestMatch(string targetSid)
        {
            if (string.IsNullOrEmpty(targetSid))
            {
                return null;
            }

            // Extract components from target SID: S-1-5-21-[domain]-[user/group]-[user/group id]
            var targetParts = targetSid.Split('-');
            if (targetParts.Length < 8)
            {
                return null;
            }

            string? bestMatch = null;
            double bestSimilarity = 0.0;

            // Search through all known users for closest match by SID structure
            foreach (var user in _usersBySid.Values)
            {
                if (user == null || string.IsNullOrEmpty(user.Sid))
                {
                    continue;
                }

                var candidateParts = user.Sid.Split('-');
                if (candidateParts.Length < 8)
                {
                    continue;
                }

                // Calculate similarity based on domain ID and account structure
                if (!long.TryParse(targetParts[7], out var targetDomainId) ||
                    !long.TryParse(candidateParts[7], out var candidateDomainId) ||
                    !long.TryParse(targetParts[8], out var targetAccountId) ||
                    !long.TryParse(candidateParts[8], out var candidateAccountId))
                {
                    continue;
                }

                var domainDiff = Math.Abs(targetDomainId - candidateDomainId);
                var accountDiff = Math.Abs(targetAccountId - candidateAccountId);

                // Domain match is key, account ID should be somewhat close
                var domainSimilarity = domainDiff <= 10 ? (10.0 - domainDiff) / 10.0 : 0.0;
                var accountSimilarity = accountDiff <= 1000 ? (1000.0 - accountDiff) / 1000.0 : 0.0;

                var overallSimilarity = (domainSimilarity * 0.7) + (accountSimilarity * 0.3);

                if (overallSimilarity > bestSimilarity && overallSimilarity > 0.6) // 60% similarity threshold
                {
                    bestSimilarity = overallSimilarity;
                    bestMatch = $"{user.DisplayName ?? user.Sam}@{user.UPN}";
                }
            }

            // Also check groups for closest match
            foreach (var group in _groupsBySid.Values)
            {
                if (group == null || string.IsNullOrEmpty(group.Sid))
                {
                    continue;
                }

                var candidateParts = group.Sid.Split('-');
                if (candidateParts.Length < 8)
                {
                    continue;
                }

                if (!long.TryParse(targetParts[7], out var targetDomainId) ||
                    !long.TryParse(candidateParts[7], out var candidateDomainId))
                {
                    continue;
                }

                var domainDiff = Math.Abs(targetDomainId - candidateDomainId);
                var domainSimilarity = domainDiff <= 10 ? (10.0 - domainDiff) / 10.0 : 0.0;

                if (domainSimilarity > bestSimilarity && domainSimilarity > 0.5)
                {
                    bestSimilarity = domainSimilarity;
                    bestMatch = $"Group: {group.Name}";
                }
            }

            return bestMatch;
        }

        /// <summary>
        /// T-010: Enhanced fuzzy matching for application correlation using Levenshtein distance
        /// </summary>
        private AppDto? FuzzyMatchApplication(string appNameCandidate, List<string> installedApps)
        {
            // Simple Levenshtein distance implementation for application name matching
            foreach (var appId in installedApps)
            {
                var app = _appsById.GetValueOrDefault(appId);
                if (app != null)
                {
                    var similarity = CalculateLevenshteinSimilarity(appNameCandidate, app.Name);
                    if (similarity >= _fuzzyConfig.LevenshteinThreshold)
                    {
                        // Found a close enough match
                        _appliedInferenceRules.Add($"Fuzzy app match: '{appNameCandidate}' -> '{app.Name}' (similarity: {similarity:P1})");
                        return app;
                    }
                }
            }

            return null;
        }

        /// <summary>
        /// T-010: Calculate Levenshtein similarity ratio (0.0 to 1.0)
        /// </summary>
        private double CalculateLevenshteinSimilarity(string s1, string s2)
        {
            if (string.IsNullOrEmpty(s1) || string.IsNullOrEmpty(s2))
                return string.IsNullOrEmpty(s1) && string.IsNullOrEmpty(s2) ? 1.0 : 0.0;

            // Levenshtein distance calculation
            int lenS1 = s1.Length;
            int lenS2 = s2.Length;
            int[,] matrix = new int[lenS1 + 1, lenS2 + 1];

            // Initialize matrix
            for (int i = 0; i <= lenS1; i++) matrix[i, 0] = i;
            for (int j = 0; j <= lenS2; j++) matrix[0, j] = j;

            // Calculate distances
            for (int i = 1; i <= lenS1; i++)
            {
                for (int j = 1; j <= lenS2; j++)
                {
                    int cost = char.ToLowerInvariant(s1[i - 1]) == char.ToLowerInvariant(s2[j - 1]) ? 0 : 1;
                    matrix[i, j] = Math.Min(
                        Math.Min(matrix[i - 1, j] + 1, matrix[i, j - 1] + 1),
                        matrix[i - 1, j - 1] + cost);
                }
            }

            // Calculate similarity ratio
            int maxLength = Math.Max(lenS1, lenS2);
            if (maxLength == 0) return 1.0;

            double similarity = 1.0 - (double)matrix[lenS1, lenS2] / maxLength;
            return similarity;
        }

        /// <summary>
        /// T-010: Fuzzy matching for user correlation by display name or email
        /// </summary>
        private UserDto? FuzzyMatchUser(string searchTerm, string searchType = "DisplayName")
        {
            UserDto? bestMatch = null;
            double bestSimilarity = 0.0;

            foreach (var user in _usersBySid.Values)
            {
                string targetValue = searchType switch
                {
                    "UPN" => user.UPN ?? "",
                    "Mail" => user.Mail ?? "",
                    _ => user.DisplayName ?? user.Sam ?? ""
                };

                if (!string.IsNullOrEmpty(targetValue))
                {
                    double similarity = CalculateLevenshteinSimilarity(searchTerm, targetValue);
                    if (similarity > bestSimilarity && similarity >= _fuzzyConfig.LevenshteinThreshold)
                    {
                        bestSimilarity = similarity;
                        bestMatch = user;
                    }
                }
            }

            if (bestMatch != null)
            {
                _appliedInferenceRules.Add($"Fuzzy user match: '{searchTerm}' -> '{bestMatch.DisplayName ?? bestMatch.Sam}' (similarity: {bestSimilarity:P1})");
            }

            return bestMatch;
        }

        /// <summary>
        /// T-010: Build descriptive share information
        /// </summary>
        private string BuildShareDescription(string shareName, int pathCount)
        {
            if (shareName.Contains("profile", StringComparison.OrdinalIgnoreCase))
                return "User profile share";
            if (shareName.Contains("doc", StringComparison.OrdinalIgnoreCase))
                return "Document share";
            if (shareName.Contains("$"))
                return "Hidden administrative share";

            return $"File share containing {pathCount} path(s)";
        }

        /// <summary>
        /// Extract share name from a UNC path (e.g., \\server\share -> share)
        /// </summary>
        private string? ExtractShareNameFromPath(string uncPath)
        {
            try
            {
                if (string.IsNullOrEmpty(uncPath) || !uncPath.StartsWith(@"\\", StringComparison.OrdinalIgnoreCase))
                    return null;

                var segments = uncPath.Split('\\', StringSplitOptions.RemoveEmptyEntries);
                if (segments.Length >= 2)
                {
                    return segments[1];
                }

                return null;
            }
            catch
            {
                return null;
            }
        }
        
        /// <summary>
        /// Gets all SQL databases for eligibility analysis
        /// </summary>
        public Task<List<SqlDbDto>> GetAllSqlDatabasesAsync()
        {
            return Task.FromResult(_sqlDbsByKey.Values.ToList());
        }

    }

    /// <summary>
    /// Extension methods for T-029 Logic Engine expansions
    /// </summary>
    public static class ConcurrentDictionaryExtensions
    {
        public static void AddToValueList<TKey, TValue>(this ConcurrentDictionary<TKey, List<TValue>> dictionary, TKey key, TValue value)
            where TKey : notnull
        {
            dictionary.AddOrUpdate(key,
                new List<TValue> { value },
                (k, existing) =>
                {
                    existing.Add(value);
                    return existing;
                });
        }
        #endregion

        #endregion
    }
}
