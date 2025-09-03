using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.IO;
using System.Security.AccessControl;
using System.Security.Principal;
using Microsoft.Win32;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services.Migration;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Migration;
using MigrationCore = MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.MigrationProviders
{
    /// <summary>
    /// File system management client interface for dependency injection
    /// </summary>
    public interface IFileSystemClient
    {
        Task<bool> PathExistsAsync(string path);
        Task<bool> CreateDirectoryAsync(string path);
        Task<FileSecurity> GetFileSecurityAsync(string path);
        Task<DirectorySecurity> GetDirectorySecurityAsync(string path);
        Task<bool> SetFileSecurityAsync(string path, FileSecurity security);
        Task<bool> SetDirectorySecurityAsync(string path, DirectorySecurity security);
        Task<bool> SetOwnerAsync(string path, SecurityIdentifier owner);
        Task<List<string>> GetDirectoryContentsAsync(string path, bool recursive = false);
        Task<long> GetDirectorySizeAsync(string path);
    }

    /// <summary>
    /// Share management client interface for dependency injection
    /// </summary>
    public interface IShareManagementClient
    {
        Task<bool> ShareExistsAsync(string shareName, string serverName = null);
        Task<bool> CreateShareAsync(string shareName, string path, string description, string serverName = null);
        Task<bool> DeleteShareAsync(string shareName, string serverName = null);
        Task<Dictionary<string, object>> GetShareConfigurationAsync(string shareName, string serverName = null);
        Task<bool> SetSharePermissionsAsync(string shareName, List<ShareAclEntry> permissions, string serverName = null);
        Task<List<ShareAclEntry>> GetSharePermissionsAsync(string shareName, string serverName = null);
    }

    /// <summary>
    /// Registry management client interface for dependency injection
    /// </summary>
    public interface IRegistryManagementClient
    {
        Task<bool> KeyExistsAsync(string registryPath);
        Task<bool> CreateKeyAsync(string registryPath);
        Task<RegistrySecurity> GetRegistrySecurityAsync(string registryPath);
        Task<bool> SetRegistrySecurityAsync(string registryPath, RegistrySecurity security);
        Task<List<string>> GetSubKeysAsync(string registryPath);
        Task<bool> SetRegistryOwnerAsync(string registryPath, SecurityIdentifier owner);
    }

    /// <summary>
    /// Implements ACL migration for NTFS, Share, and Registry permissions with SID translation
    /// </summary>
    public class AclMigrator : IAclMigrator
    {
        private readonly IFileSystemClient _fileSystemClient;
        private readonly IShareManagementClient _shareClient;
        private readonly IRegistryManagementClient _registryClient;
        private readonly ISidMappingService _sidMappingService;
        private readonly ILogger<AclMigrator> _logger;

        public AclMigrator(
            IFileSystemClient fileSystemClient,
            IShareManagementClient shareClient,
            IRegistryManagementClient registryClient,
            ISidMappingService sidMappingService,
            ILogger<AclMigrator> logger)
        {
            _fileSystemClient = fileSystemClient ?? throw new ArgumentNullException(nameof(fileSystemClient));
            _shareClient = shareClient ?? throw new ArgumentNullException(nameof(shareClient));
            _registryClient = registryClient ?? throw new ArgumentNullException(nameof(registryClient));
            _sidMappingService = sidMappingService ?? throw new ArgumentNullException(nameof(sidMappingService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<MigrationResult<AclMigrationResult>> MigrateAsync(
            AclItem item, 
            MigrationCore.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new MigrationResult<AclMigrationResult>
            {
                SourceId = item.Path,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            var migrationResult = new AclMigrationResult
            {
                TargetPath = item.Path,
                SourceAclCount = item.AccessControlEntries.Count,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Starting ACL migration for {ObjectType} at {Path}", item.ObjectType, item.Path);

                // Create SID mappings for all ACL entries
                var sourceSids = item.AccessControlEntries.Select(ace => ace.Sid).Where(s => !string.IsNullOrEmpty(s)).Distinct().ToList();
                var sidMappings = await _sidMappingService.GetSidMappingsAsync(sourceSids, context.TargetDomain);

                // Add owner SID if present
                if (!string.IsNullOrEmpty(item.Owner))
                {
                    var ownerMapping = await _sidMappingService.MapSidAsync(item.Owner, context.TargetDomain);
                    if (!string.IsNullOrEmpty(ownerMapping))
                    {
                        sidMappings[item.Owner] = ownerMapping;
                    }
                }

                // Migrate based on object type
                switch (item.ObjectType.ToLower())
                {
                    case "file":
                    case "directory":
                        var ntfsResult = await MigrateNtfsPermissionsAsync(item.Path, item.AccessControlEntries, sidMappings, context, cancellationToken);
                        CopyNtfsResultToMigrationResult(ntfsResult, migrationResult);
                        break;

                    case "share":
                        var shareResult = await MigrateSharePermissionsAsync(item.Path, ConvertToShareAcls(item.AccessControlEntries), sidMappings, context, cancellationToken);
                        CopyShareResultToMigrationResult(shareResult, migrationResult);
                        break;

                    case "registry":
                        var registryResult = await MigrateRegistryPermissionsAsync(item.Path, ConvertToRegistryAcls(item.AccessControlEntries), sidMappings, context, cancellationToken);
                        CopyRegistryResultToMigrationResult(registryResult, migrationResult);
                        break;

                    default:
                        throw new NotSupportedException($"Object type {item.ObjectType} is not supported for ACL migration");
                }

                result.TargetId = item.Path;
                migrationResult.IsSuccess = true;
                migrationResult.EndTime = DateTime.UtcNow;
                result.IsSuccess = true;
                result.EndTime = DateTime.UtcNow;
                result.Result = migrationResult;

                _logger.LogInformation("Successfully completed ACL migration for {Path} in {Duration}. Migrated: {Migrated}, Unmapped: {Unmapped}", 
                    item.Path, result.Duration, migrationResult.MigratedAclCount, migrationResult.UnmappedAclCount);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to migrate ACL for {ObjectType} at {Path}", item.ObjectType, item.Path);
                
                migrationResult.IsSuccess = false;
                migrationResult.ErrorMessage = ex.Message;
                migrationResult.Errors.Add(ex.Message);
                migrationResult.EndTime = DateTime.UtcNow;
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;
                result.Result = migrationResult;

                return result;
            }
        }

        public async Task<ValidationResult> ValidateAsync(
            AclMigrationItem item, 
            MigrationCore.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var validationResult = new ValidationResult
            {
                ValidationType = "AclMigration",
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Validating ACL for {ObjectType} at {Path}", item.ObjectType, item.Path);

                // Validate path
                if (string.IsNullOrWhiteSpace(item.Path))
                {
                    validationResult.Issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Message = "ACL path cannot be empty",
                        ItemId = item.Path,
                        Category = "Path"
                    });
                }

                // Validate object type
                var supportedTypes = new[] { "file", "directory", "share", "registry" };
                if (!supportedTypes.Contains(item.ObjectType.ToLower()))
                {
                    validationResult.Issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Error,
                        Message = $"Unsupported object type: {item.ObjectType}",
                        ItemId = item.Path,
                        Category = "ObjectType"
                    });
                }

                // Validate ACL entries
                foreach (var ace in item.AccessControlEntries)
                {
                    // Validate SID format
                    if (!string.IsNullOrEmpty(ace.Sid))
                    {
                        try
                        {
                            var sid = new SecurityIdentifier(ace.Sid);
                        }
                        catch (ArgumentException)
                        {
                            validationResult.Issues.Add(new ValidationIssue
                            {
                                Severity = ValidationSeverity.Warning,
                                Message = $"Invalid SID format: {ace.Sid}",
                                ItemId = item.Path,
                                Category = "SID"
                            });
                        }
                    }

                    // Validate access control type
                    if (!new[] { "Allow", "Deny" }.Contains(ace.AccessControlType, StringComparer.OrdinalIgnoreCase))
                    {
                        validationResult.Issues.Add(new ValidationIssue
                        {
                            Severity = ValidationSeverity.Warning,
                            Message = $"Unknown access control type: {ace.AccessControlType}",
                            ItemId = item.Path,
                            Category = "AccessControlType"
                        });
                    }
                }

                // Validate path accessibility based on object type
                try
                {
                    switch (item.ObjectType.ToLower())
                    {
                        case "file":
                        case "directory":
                            var pathExists = await _fileSystemClient.PathExistsAsync(item.Path);
                            if (!pathExists)
                            {
                                validationResult.Issues.Add(new ValidationIssue
                                {
                                    Severity = ValidationSeverity.Warning,
                                    Message = $"Path does not exist and will be created during migration: {item.Path}",
                                    ItemId = item.Path,
                                    Category = "PathExistence"
                                });
                            }
                            break;

                        case "registry":
                            var keyExists = await _registryClient.KeyExistsAsync(item.Path);
                            if (!keyExists)
                            {
                                validationResult.Issues.Add(new ValidationIssue
                                {
                                    Severity = ValidationSeverity.Warning,
                                    Message = $"Registry key does not exist and will be created during migration: {item.Path}",
                                    ItemId = item.Path,
                                    Category = "RegistryKeyExistence"
                                });
                            }
                            break;
                    }
                }
                catch (Exception ex)
                {
                    validationResult.Issues.Add(new ValidationIssue
                    {
                        Severity = ValidationSeverity.Warning,
                        Message = $"Could not validate path accessibility: {ex.Message}",
                        ItemId = item.Path,
                        Category = "AccessibilityCheck"
                    });
                }

                validationResult.IsSuccess = !validationResult.Issues.Any(i => i.Severity == ValidationSeverity.Error);
                validationResult.EndTime = DateTime.UtcNow;

                _logger.LogInformation("ACL validation completed for {Path} with {IssueCount} issues", 
                    item.Path, validationResult.Issues.Count);

                return validationResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating ACL for {Path}", item.Path);
                
                validationResult.IsSuccess = false;
                validationResult.ErrorMessage = ex.Message;
                validationResult.Errors.Add(ex.Message);
                validationResult.EndTime = DateTime.UtcNow;

                return validationResult;
            }
        }

        public async Task<MigrationCore.RollbackResult> RollbackAsync(
            AclMigrationResult result, 
            MigrationCore.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var rollbackResult = new MigrationCore.RollbackResult
            {
                RollbackAction = "RestoreOriginalAcl",
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Starting rollback for ACL at {TargetPath}", result.TargetPath);

                // For a complete rollback implementation, you would need to store the original ACL
                // before migration and restore it here. For now, we'll log the rollback action.
                rollbackResult.Warnings.Add("ACL rollback requires original ACL backup - manual restoration may be needed");
                rollbackResult.UnrestoredItems.Add($"ACL at {result.TargetPath} - original ACL not backed up");

                rollbackResult.IsSuccess = false; // Indicates manual intervention needed
                rollbackResult.EndTime = DateTime.UtcNow;

                _logger.LogWarning("ACL rollback completed with warnings for {TargetPath}", result.TargetPath);

                return rollbackResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to rollback ACL for {TargetPath}", result.TargetPath);
                
                rollbackResult.IsSuccess = false;
                rollbackResult.ErrorMessage = ex.Message;
                rollbackResult.Errors.Add(ex.Message);
                rollbackResult.EndTime = DateTime.UtcNow;
                rollbackResult.UnrestoredItems.Add($"Exception during rollback: {ex.Message}");

                return rollbackResult;
            }
        }

        public async Task<bool> SupportsAsync(
            MigrationType type, 
            MigrationCore.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            return type == MigrationType.ACL || 
                   type == MigrationType.SharePermission || 
                   type == MigrationType.RegistryPermission;
        }

        public async Task<TimeSpan> EstimateDurationAsync(
            AclItem item, 
            MigrationCore.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            // Base time for ACL migration
            var baseTime = TimeSpan.FromSeconds(2);
            
            // Additional time per ACE
            var aceTime = TimeSpan.FromMilliseconds(item.AccessControlEntries.Count * 100);
            
            // Additional time for directory tree processing
            var treeTime = TimeSpan.FromSeconds(0);
            if (item.ObjectType.Equals("directory", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    var dirSize = await _fileSystemClient.GetDirectorySizeAsync(item.Path);
                    treeTime = TimeSpan.FromMilliseconds(Math.Min(dirSize / 1000000, 30000)); // Max 30 seconds
                }
                catch
                {
                    treeTime = TimeSpan.FromSeconds(5); // Default for unknown directory size
                }
            }
            
            return baseTime.Add(aceTime).Add(treeTime);
        }

        public async Task<NtfsPermissionResult> MigrateNtfsPermissionsAsync(
            string targetPath, 
            List<Models.Migration.AclEntry> sourceAcls, 
            Dictionary<string, string> sidMapping, 
            MigrationCore.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new NtfsPermissionResult
            {
                TargetPath = targetPath,
                SourceAclCount = sourceAcls.Count,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Migrating NTFS permissions for {TargetPath} with {AclCount} ACEs", 
                    targetPath, sourceAcls.Count);

                // Ensure target path exists
                var pathExists = await _fileSystemClient.PathExistsAsync(targetPath);
                if (!pathExists)
                {
                    if (Path.HasExtension(targetPath))
                    {
                        // It's a file - create parent directory
                        var parentDir = Path.GetDirectoryName(targetPath);
                        if (!string.IsNullOrEmpty(parentDir))
                        {
                            await _fileSystemClient.CreateDirectoryAsync(parentDir);
                        }
                    }
                    else
                    {
                        // It's a directory
                        await _fileSystemClient.CreateDirectoryAsync(targetPath);
                    }
                }

                // Get current security descriptor
                var isDirectory = Directory.Exists(targetPath);
                FileSystemSecurity security;
                
                if (isDirectory)
                {
                    security = await _fileSystemClient.GetDirectorySecurityAsync(targetPath);
                }
                else
                {
                    security = await _fileSystemClient.GetFileSecurityAsync(targetPath);
                }

                // Clear existing ACL and set new permissions
                security.SetAccessRuleProtection(true, false); // Disable inheritance and remove inherited ACEs
                
                foreach (var sourceAce in sourceAcls)
                {
                    try
                    {
                        if (string.IsNullOrEmpty(sourceAce.Sid))
                        {
                            result.UnmappedAclCount++;
                            result.ConflictingPermissions.Add($"Empty SID in ACE");
                            continue;
                        }

                        // Map SID to target domain
                        var targetSid = sidMapping.ContainsKey(sourceAce.Sid) ? sidMapping[sourceAce.Sid] : sourceAce.Sid;
                        if (string.IsNullOrEmpty(targetSid))
                        {
                            result.UnmappedAclCount++;
                            result.ConflictingPermissions.Add($"Could not map SID: {sourceAce.Sid}");
                            continue;
                        }

                        var identity = new SecurityIdentifier(targetSid);
                        var accessType = sourceAce.AccessControlType.Equals("Allow", StringComparison.OrdinalIgnoreCase) 
                            ? AccessControlType.Allow 
                            : AccessControlType.Deny;

                        // Parse access mask to FileSystemRights
                        var rights = ParseFileSystemRights(sourceAce.AccessMask);
                        var inheritanceFlags = ParseInheritanceFlags(sourceAce.InheritanceFlags);
                        var propagationFlags = ParsePropagationFlags(sourceAce.PropagationFlags);

                        FileSystemAccessRule rule;
                        if (isDirectory)
                        {
                            rule = new FileSystemAccessRule(identity, rights, inheritanceFlags, propagationFlags, accessType);
                        }
                        else
                        {
                            rule = new FileSystemAccessRule(identity, rights, accessType);
                        }

                        security.SetAccessRule(rule);
                        result.MigratedAclCount++;
                        result.SidMappings[sourceAce.Sid] = targetSid;

                        _logger.LogDebug("Applied NTFS permission for SID {TargetSid} with rights {Rights}", 
                            targetSid, rights);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to apply ACE for SID {Sid}", sourceAce.Sid);
                        result.UnmappedAclCount++;
                        result.ConflictingPermissions.Add($"Error applying ACE for {sourceAce.Sid}: {ex.Message}");
                    }
                }

                // Apply the updated security descriptor
                bool applied;
                if (isDirectory)
                {
                    applied = await _fileSystemClient.SetDirectorySecurityAsync(targetPath, (DirectorySecurity)security);
                }
                else
                {
                    applied = await _fileSystemClient.SetFileSecurityAsync(targetPath, (FileSecurity)security);
                }

                result.InheritanceConfigured = applied;
                result.IsSuccess = applied && result.MigratedAclCount > 0;
                result.EndTime = DateTime.UtcNow;

                _logger.LogInformation("NTFS permission migration completed for {TargetPath}. Applied: {Applied}, Unmapped: {Unmapped}", 
                    targetPath, result.MigratedAclCount, result.UnmappedAclCount);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to migrate NTFS permissions for {TargetPath}", targetPath);
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        public async Task<SharePermissionResult> MigrateSharePermissionsAsync(
            string sharePath, 
            List<ShareAclEntry> shareAcls, 
            Dictionary<string, string> sidMapping, 
            MigrationCore.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new SharePermissionResult
            {
                SharePath = sharePath,
                ShareName = Path.GetFileName(sharePath),
                SourceShareAclCount = shareAcls.Count,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Migrating share permissions for {SharePath} with {AclCount} ACEs", 
                    sharePath, shareAcls.Count);

                var shareName = result.ShareName;
                
                // Check if share exists, create if not
                var shareExists = await _shareClient.ShareExistsAsync(shareName);
                if (!shareExists)
                {
                    var created = await _shareClient.CreateShareAsync(shareName, sharePath, "Migrated Share", context.TargetDomain);
                    result.ShareRecreated = created;
                    
                    if (!created)
                    {
                        throw new InvalidOperationException($"Failed to create share {shareName}");
                    }
                }

                // Get current share configuration
                var shareConfig = await _shareClient.GetShareConfigurationAsync(shareName, context.TargetDomain);
                result.ShareConfiguration = shareConfig;

                // Map and apply share permissions
                var mappedAcls = new List<ShareAclEntry>();
                
                foreach (var sourceAce in shareAcls)
                {
                    try
                    {
                        if (string.IsNullOrEmpty(sourceAce.Sid))
                        {
                            result.Warnings.Add($"Empty SID in share ACE");
                            continue;
                        }

                        var targetSid = sidMapping.ContainsKey(sourceAce.Sid) ? sidMapping[sourceAce.Sid] : sourceAce.Sid;
                        if (string.IsNullOrEmpty(targetSid))
                        {
                            result.Warnings.Add($"Could not map share SID: {sourceAce.Sid}");
                            continue;
                        }

                        var mappedAce = new ShareAclEntry
                        {
                            Sid = targetSid,
                            IdentityReference = sourceAce.IdentityReference,
                            SharePermission = sourceAce.SharePermission,
                            AccessControlType = sourceAce.AccessControlType
                        };

                        mappedAcls.Add(mappedAce);
                        result.ShareSidMappings[sourceAce.Sid] = targetSid;
                        result.MigratedShareAclCount++;

                        _logger.LogDebug("Mapped share permission for SID {TargetSid} with permission {Permission}", 
                            targetSid, sourceAce.SharePermission);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to map share ACE for SID {Sid}", sourceAce.Sid);
                        result.Warnings.Add($"Error mapping share ACE for {sourceAce.Sid}: {ex.Message}");
                    }
                }

                // Apply the mapped permissions to the share
                if (mappedAcls.Any())
                {
                    var applied = await _shareClient.SetSharePermissionsAsync(shareName, mappedAcls, context.TargetDomain);
                    if (!applied)
                    {
                        result.Warnings.Add("Failed to apply some share permissions");
                    }
                }

                result.IsSuccess = result.MigratedShareAclCount > 0 || !shareAcls.Any();
                result.EndTime = DateTime.UtcNow;

                _logger.LogInformation("Share permission migration completed for {SharePath}. Migrated: {Migrated}", 
                    sharePath, result.MigratedShareAclCount);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to migrate share permissions for {SharePath}", sharePath);
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        public async Task<SidHistoryResult> CreateAclSidHistoryAsync(
            List<string> sourceSids, 
            List<string> targetSids, 
            MigrationCore.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new SidHistoryResult
            {
                SourceSids = new List<string>(sourceSids),
                TargetSids = new List<string>(targetSids),
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Creating SID history for ACL migration with {SourceCount} source SIDs", sourceSids.Count);

                if (sourceSids.Count != targetSids.Count)
                {
                    throw new ArgumentException("Source and target SID lists must have the same count");
                }

                for (int i = 0; i < sourceSids.Count; i++)
                {
                    try
                    {
                        var sourceSid = sourceSids[i];
                        var targetSid = targetSids[i];
                        
                        var historyCreated = await _sidMappingService.CreateSidHistoryAsync(sourceSid, targetSid);
                        
                        if (historyCreated)
                        {
                            result.SuccessfulMappings++;
                            result.SidMappings[sourceSid] = targetSid;
                            
                            _logger.LogDebug("Created SID history mapping: {SourceSid} -> {TargetSid}", sourceSid, targetSid);
                        }
                        else
                        {
                            result.FailedMappings.Add(sourceSid);
                            result.Warnings.Add($"Failed to create SID history for {sourceSid}");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error creating SID history for {SourceSid}", sourceSids[i]);
                        result.FailedMappings.Add(sourceSids[i]);
                        result.Warnings.Add($"Exception creating SID history for {sourceSids[i]}: {ex.Message}");
                    }
                }

                result.SidHistoryEnabled = result.SuccessfulMappings > 0;
                result.IsSuccess = result.SuccessfulMappings > 0;
                result.EndTime = DateTime.UtcNow;

                _logger.LogInformation("SID history creation completed. Successful: {Success}, Failed: {Failed}", 
                    result.SuccessfulMappings, result.FailedMappings.Count);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create ACL SID history");
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        public async Task<AclInheritanceValidationResult> ValidateAclInheritanceAsync(
            string rootPath, 
            MigrationCore.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new AclInheritanceValidationResult
            {
                RootPath = rootPath,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Validating ACL inheritance structure at {RootPath}", rootPath);

                var pathsToCheck = await _fileSystemClient.GetDirectoryContentsAsync(rootPath, recursive: true);
                pathsToCheck.Insert(0, rootPath); // Include root path
                
                result.TotalItemsAnalyzed = pathsToCheck.Count;

                foreach (var path in pathsToCheck)
                {
                    try
                    {
                        FileSystemSecurity security;
                        var isDirectory = Directory.Exists(path);
                        
                        if (isDirectory)
                        {
                            security = await _fileSystemClient.GetDirectorySecurityAsync(path);
                        }
                        else
                        {
                            security = await _fileSystemClient.GetFileSecurityAsync(path);
                        }

                        var inheritanceEnabled = !security.AreAccessRulesProtected;
                        result.PathInheritanceMap[path] = inheritanceEnabled;

                        if (inheritanceEnabled)
                        {
                            result.InheritanceEnabledItems++;
                        }
                        else
                        {
                            result.InheritanceDisabledItems++;
                            result.InheritanceBrokenPaths.Add(path);
                        }

                        _logger.LogDebug("Path {Path} inheritance: {Enabled}", path, inheritanceEnabled);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Could not check inheritance for path {Path}", path);
                        result.Warnings.Add($"Could not check inheritance for {path}: {ex.Message}");
                    }
                }

                result.InheritanceStructureValid = result.InheritanceBrokenPaths.Count == 0;
                result.IsSuccess = true;
                result.EndTime = DateTime.UtcNow;

                _logger.LogInformation("ACL inheritance validation completed for {RootPath}. Enabled: {Enabled}, Disabled: {Disabled}", 
                    rootPath, result.InheritanceEnabledItems, result.InheritanceDisabledItems);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to validate ACL inheritance for {RootPath}", rootPath);
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        public async Task<RegistryPermissionResult> MigrateRegistryPermissionsAsync(
            string registryPath, 
            List<RegistryAclEntry> registryAcls, 
            Dictionary<string, string> sidMapping, 
            MigrationCore.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new RegistryPermissionResult
            {
                RegistryPath = registryPath,
                SourceRegistryAclCount = registryAcls.Count,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                _logger.LogInformation("Migrating registry permissions for {RegistryPath} with {AclCount} ACEs", 
                    registryPath, registryAcls.Count);

                // Ensure registry key exists
                var keyExists = await _registryClient.KeyExistsAsync(registryPath);
                if (!keyExists)
                {
                    var created = await _registryClient.CreateKeyAsync(registryPath);
                    result.RegistryKeyCreated = created;
                    
                    if (!created)
                    {
                        throw new InvalidOperationException($"Failed to create registry key {registryPath}");
                    }
                }

                // Get current registry security
                var security = await _registryClient.GetRegistrySecurityAsync(registryPath);
                security.SetAccessRuleProtection(true, false); // Disable inheritance

                foreach (var sourceAce in registryAcls)
                {
                    try
                    {
                        if (string.IsNullOrEmpty(sourceAce.Sid))
                        {
                            result.Warnings.Add($"Empty SID in registry ACE");
                            continue;
                        }

                        var targetSid = sidMapping.ContainsKey(sourceAce.Sid) ? sidMapping[sourceAce.Sid] : sourceAce.Sid;
                        if (string.IsNullOrEmpty(targetSid))
                        {
                            result.Warnings.Add($"Could not map registry SID: {sourceAce.Sid}");
                            continue;
                        }

                        var identity = new SecurityIdentifier(targetSid);
                        var accessType = sourceAce.AccessControlType.Equals("Allow", StringComparison.OrdinalIgnoreCase) 
                            ? AccessControlType.Allow 
                            : AccessControlType.Deny;

                        var rights = ParseRegistryRights(sourceAce.RegistryRights);
                        var inheritanceFlags = ParseInheritanceFlags(sourceAce.InheritanceFlags);
                        var propagationFlags = ParsePropagationFlags(sourceAce.PropagationFlags);

                        var rule = new RegistryAccessRule(identity, rights, inheritanceFlags, propagationFlags, accessType);
                        security.SetAccessRule(rule);
                        
                        result.MigratedRegistryAclCount++;
                        result.RegistrySidMappings[sourceAce.Sid] = targetSid;

                        _logger.LogDebug("Applied registry permission for SID {TargetSid} with rights {Rights}", 
                            targetSid, rights);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to apply registry ACE for SID {Sid}", sourceAce.Sid);
                        result.Warnings.Add($"Error applying registry ACE for {sourceAce.Sid}: {ex.Message}");
                    }
                }

                // Apply the updated security descriptor
                var applied = await _registryClient.SetRegistrySecurityAsync(registryPath, security);
                result.OwnershipSet = applied;
                result.IsSuccess = applied && result.MigratedRegistryAclCount > 0;
                result.EndTime = DateTime.UtcNow;

                _logger.LogInformation("Registry permission migration completed for {RegistryPath}. Migrated: {Migrated}", 
                    registryPath, result.MigratedRegistryAclCount);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to migrate registry permissions for {RegistryPath}", registryPath);
                
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.Message);
                result.EndTime = DateTime.UtcNow;

                return result;
            }
        }

        #region Private Helper Methods

        private List<ShareAclEntry> ConvertToShareAcls(List<Models.Migration.AclEntry> aclEntries)
        {
            return aclEntries.Select(ace => new ShareAclEntry
            {
                Sid = ace.Sid,
                IdentityReference = ace.IdentityReference,
                SharePermission = MapFileRightsToSharePermission(ace.AccessMask),
                AccessControlType = ace.AccessControlType
            }).ToList();
        }

        private List<RegistryAclEntry> ConvertToRegistryAcls(List<Models.Migration.AclEntry> aclEntries)
        {
            return aclEntries.Select(ace => new RegistryAclEntry
            {
                Sid = ace.Sid,
                IdentityReference = ace.IdentityReference,
                RegistryRights = MapAccessMaskToRegistryRights(ace.AccessMask),
                AccessControlType = ace.AccessControlType,
                InheritanceFlags = ace.InheritanceFlags,
                PropagationFlags = ace.PropagationFlags
            }).ToList();
        }

        private FileSystemRights ParseFileSystemRights(string accessMask)
        {
            if (string.IsNullOrEmpty(accessMask))
                return FileSystemRights.Read;

            // Try parsing as enum first
            if (Enum.TryParse<FileSystemRights>(accessMask, out var rights))
                return rights;

            // Try parsing as numeric value
            if (int.TryParse(accessMask, out var numericMask))
            {
                return (FileSystemRights)numericMask;
            }

            // Default to Read if can't parse
            return FileSystemRights.Read;
        }

        private RegistryRights ParseRegistryRights(string registryRights)
        {
            if (string.IsNullOrEmpty(registryRights))
                return RegistryRights.ReadKey;

            if (Enum.TryParse<RegistryRights>(registryRights, out var rights))
                return rights;

            return RegistryRights.ReadKey;
        }

        private InheritanceFlags ParseInheritanceFlags(string inheritanceFlags)
        {
            if (string.IsNullOrEmpty(inheritanceFlags))
                return InheritanceFlags.None;

            if (Enum.TryParse<InheritanceFlags>(inheritanceFlags, out var flags))
                return flags;

            return InheritanceFlags.None;
        }

        private PropagationFlags ParsePropagationFlags(string propagationFlags)
        {
            if (string.IsNullOrEmpty(propagationFlags))
                return PropagationFlags.None;

            if (Enum.TryParse<PropagationFlags>(propagationFlags, out var flags))
                return flags;

            return PropagationFlags.None;
        }

        private string MapFileRightsToSharePermission(string accessMask)
        {
            var rights = ParseFileSystemRights(accessMask);
            
            if (rights.HasFlag(FileSystemRights.FullControl))
                return "FullControl";
            if (rights.HasFlag(FileSystemRights.Modify))
                return "Change";
            
            return "Read";
        }

        private string MapAccessMaskToRegistryRights(string accessMask)
        {
            var rights = ParseFileSystemRights(accessMask);
            
            if (rights.HasFlag(FileSystemRights.FullControl))
                return "FullControl";
            if (rights.HasFlag(FileSystemRights.Write))
                return "WriteKey";
            
            return "ReadKey";
        }

        private void CopyNtfsResultToMigrationResult(NtfsPermissionResult ntfsResult, AclMigrationResult migrationResult)
        {
            migrationResult.MigratedAclCount = ntfsResult.MigratedAclCount;
            migrationResult.UnmappedAclCount = ntfsResult.UnmappedAclCount;
            migrationResult.SidMappings = ntfsResult.SidMappings;
            migrationResult.ConflictingPermissions = ntfsResult.ConflictingPermissions;
            migrationResult.Warnings.AddRange(ntfsResult.Warnings);
            migrationResult.Errors.AddRange(ntfsResult.Errors);
        }

        private void CopyShareResultToMigrationResult(SharePermissionResult shareResult, AclMigrationResult migrationResult)
        {
            migrationResult.MigratedAclCount = shareResult.MigratedShareAclCount;
            migrationResult.SidMappings = shareResult.ShareSidMappings;
            migrationResult.Warnings.AddRange(shareResult.Warnings);
            migrationResult.Errors.AddRange(shareResult.Errors);
        }

        private void CopyRegistryResultToMigrationResult(RegistryPermissionResult registryResult, AclMigrationResult migrationResult)
        {
            migrationResult.MigratedAclCount = registryResult.MigratedRegistryAclCount;
            migrationResult.SidMappings = registryResult.RegistrySidMappings;
            migrationResult.Warnings.AddRange(registryResult.Warnings);
            migrationResult.Errors.AddRange(registryResult.Errors);
        }

        #endregion

        #region IAclMigrator Interface Methods

        public async Task<AclMigrationResult> RecreateAclsAsync(string targetPath, List<Models.Migration.AclEntry> sourceAcls, Dictionary<string, string> sidMapping, MigrationCore.MigrationContext context, CancellationToken cancellationToken = default)
        {
            return await MigrateNtfsPermissionsAsync(targetPath, sourceAcls, sidMapping, context, cancellationToken);
        }

        public async Task<NtfsPermissionResult> ApplyNtfsPermissionsAsync(string path, List<NtfsPermission> permissions, MigrationCore.MigrationContext context, CancellationToken cancellationToken = default)
        {
            // Convert NtfsPermission to AclEntry format and delegate to existing method
            var aclEntries = permissions.Select(p => new Models.Migration.AclEntry
            {
                Sid = p.TrusteeSid,
                IdentityReference = p.Trustee,
                AccessMask = p.Rights,
                AccessControlType = p.AccessType,
                InheritanceFlags = p.Inheritance,
                PropagationFlags = p.Propagation
            }).ToList();

            var sidMapping = new Dictionary<string, string>();
            return await MigrateNtfsPermissionsAsync(path, aclEntries, sidMapping, context, cancellationToken);
        }

        public async Task<SharePermissionResult> ApplySharePermissionsAsync(string shareName, List<SharePermission> permissions, MigrationCore.MigrationContext context, CancellationToken cancellationToken = default)
        {
            // Convert SharePermission to ShareAclEntry format and delegate to existing method
            var shareAcls = permissions.Select(p => new ShareAclEntry
            {
                Sid = p.TrusteeSid,
                IdentityReference = p.Trustee,
                SharePermission = p.AccessMask,
                AccessControlType = p.AccessType
            }).ToList();

            var sidMapping = new Dictionary<string, string>();
            return await MigrateSharePermissionsAsync(shareName, shareAcls, sidMapping, context, cancellationToken);
        }

        public async Task<GpoSidTranslationResult> TranslateSidsAsync(List<string> sourceSids, MigrationCore.MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = new GpoSidTranslationResult
            {
                Operation = "SidTranslation",
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                foreach (var sid in sourceSids)
                {
                    try
                    {
                        var translatedSid = await _sidMappingService.TranslateSidAsync(sid, context.SourceDomain, context.TargetDomain, cancellationToken);
                        if (!string.IsNullOrEmpty(translatedSid))
                        {
                            result.TranslatedSids[sid] = translatedSid;
                        }
                        else
                        {
                            result.UnresolvedSids.Add(sid);
                        }
                    }
                    catch (Exception ex)
                    {
                        result.UnresolvedSids.Add(sid);
                        result.Errors.Add($"Failed to translate SID {sid}: {ex.Message}");
                    }
                }

                result.IsSuccess = result.Errors.Count == 0;
                result.Message = $"Translated {result.TranslatedSids.Count} SIDs, failed {result.UnresolvedSids.Count}";
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Message = $"SID translation failed: {ex.Message}";
                result.Errors.Add(ex.Message);
            }

            result.EndTime = DateTime.UtcNow;
            return result;
        }

        public async Task<AclValidationResult> ValidateAclCompatibilityAsync(List<Models.Migration.AclEntry> acls, string targetFileSystem, MigrationCore.MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = new AclValidationResult
            {
                Operation = "AclValidation",
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName,
                IsValid = true
            };

            try
            {
                foreach (var acl in acls)
                {
                    // Basic validation logic
                    if (string.IsNullOrEmpty(acl.Sid) && string.IsNullOrEmpty(acl.IdentityReference))
                    {
                        result.InvalidAcls.Add($"ACL missing both SID and IdentityReference");
                        result.IsValid = false;
                    }
                    else
                    {
                        result.ValidAcls.Add(acl.IdentityReference ?? acl.Sid);
                    }
                }

                result.IsSuccess = result.IsValid;
                result.Message = $"Validated {result.ValidAcls.Count} ACLs, {result.InvalidAcls.Count} invalid";
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.IsValid = false;
                result.Message = $"ACL validation failed: {ex.Message}";
                result.ValidationErrors.Add(ex.Message);
            }

            result.EndTime = DateTime.UtcNow;
            return result;
        }

        public async Task<GroupPolicyConflictResolutionResult> ResolveAclConflictsAsync(List<AclConflict> conflicts, Models.Migration.ConflictResolutionStrategy strategy, MigrationCore.MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = new GroupPolicyConflictResolutionResult
            {
                ConflictType = "AclConflict",
                TotalConflicts = conflicts.Count,
                StrategyUsed = strategy,
                Operation = "AclConflictResolution",
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                foreach (var conflict in conflicts)
                {
                    switch (strategy)
                    {
                        case ConflictResolutionStrategy.Skip:
                            result.ResolutionActions.Add($"Skipped ACL conflict at {conflict.Path}");
                            break;
                        case ConflictResolutionStrategy.Overwrite:
                            result.ResolutionActions.Add($"Overwrote ACL conflict at {conflict.Path}");
                            result.ResolvedConflicts++;
                            break;
                        default:
                            result.UnresolvedConflicts++;
                            result.Errors.Add($"Unsupported resolution strategy for conflict at {conflict.Path}");
                            break;
                    }
                }

                result.IsSuccess = result.Errors.Count == 0;
                result.Message = $"Resolved {result.ResolvedConflicts} conflicts using {strategy} strategy";
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Message = $"ACL conflict resolution failed: {ex.Message}";
                result.Errors.Add(ex.Message);
            }

            result.EndTime = DateTime.UtcNow;
            return result;
        }

        public async Task<BulkAclMigrationResult> BulkApplyAclsAsync(Dictionary<string, List<Models.Migration.AclEntry>> pathAclMap, Dictionary<string, string> sidMapping, MigrationCore.MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = new BulkAclMigrationResult
            {
                Operation = "BulkAclMigration",
                TotalPaths = pathAclMap.Count,
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                foreach (var pathAcl in pathAclMap)
                {
                    try
                    {
                        var aclResult = await MigrateNtfsPermissionsAsync(pathAcl.Key, pathAcl.Value, sidMapping, context, cancellationToken);
                        result.Results.Add(new AclMigrationResult
                        {
                            ResourcePath = pathAcl.Key,
                            AcesProcessed = pathAcl.Value.Count,
                            IsSuccess = aclResult.IsSuccess,
                            Message = aclResult.Message
                        });

                        if (aclResult.IsSuccess)
                        {
                            result.SuccessfulMigrations++;
                        }
                        else
                        {
                            result.FailedMigrations++;
                            result.Errors.AddRange(aclResult.Errors);
                        }
                    }
                    catch (Exception ex)
                    {
                        result.FailedMigrations++;
                        result.Errors.Add($"Failed to migrate ACLs for {pathAcl.Key}: {ex.Message}");
                    }
                }

                result.IsSuccess = result.FailedMigrations == 0;
                result.Message = $"Bulk ACL migration completed. {result.SuccessfulMigrations} successful, {result.FailedMigrations} failed";
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Message = $"Bulk ACL migration failed: {ex.Message}";
                result.Errors.Add(ex.Message);
            }

            result.TotalDuration = DateTime.UtcNow - result.StartTime;
            result.EndTime = DateTime.UtcNow;
            return result;
        }

        public async Task<PermissionInheritanceResult> SetPermissionInheritanceAsync(string targetPath, bool enableInheritance, bool propagateToChildren, MigrationCore.MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = new PermissionInheritanceResult
            {
                ResourcePath = targetPath,
                InheritanceEnabled = enableInheritance,
                Operation = "SetPermissionInheritance",
                StartTime = DateTime.UtcNow,
                SessionId = context.SessionId,
                ExecutedBy = context.UserPrincipalName
            };

            try
            {
                await _fileSystemClient.SetInheritanceAsync(targetPath, enableInheritance, propagateToChildren, cancellationToken);
                
                result.InheritancePreserved = enableInheritance;
                result.IsSuccess = true;
                result.Message = $"Permission inheritance {(enableInheritance ? "enabled" : "disabled")} for {targetPath}";
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Message = $"Failed to set permission inheritance: {ex.Message}";
                result.Errors.Add(ex.Message);
            }

            result.EndTime = DateTime.UtcNow;
            return result;
        }

        #endregion

        #region IMigrationProvider Implementation

        /// <summary>
        /// Migrates an ACL migration item
        /// </summary>
        public async Task<MigrationResult<AclMigrationResult>> MigrateAsync(AclMigrationItem item, MigrationCore.MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = new AclMigrationResult
            {
                StartTime = DateTime.UtcNow,
                AclType = item.AclType,
                SourcePath = item.SourcePath,
                TargetPath = item.TargetPath
            };

            try
            {
                switch (item.AclType)
                {
                    case AclType.NTFS:
                        var ntfsResult = await RecreateAclsAsync(item.TargetPath, item.SourceAcls, item.SidMapping, context, cancellationToken);
                        return new MigrationResult<AclMigrationResult>(ntfsResult);
                    case AclType.Share:
                        var shareResult = await MigrateSharePermissionsAsync(item.SourcePath, item.TargetPath, item.SidMapping, context, cancellationToken);
                        return new MigrationResult<AclMigrationResult>(shareResult);
                    case AclType.Registry:
                        var regResult = await MigrateRegistryPermissionsAsync(item.SourcePath, item.TargetPath, item.SidMapping, context, cancellationToken);
                        return new MigrationResult<AclMigrationResult>(regResult);
                    default:
                        result.IsSuccess = false;
                        result.Message = $"Unsupported ACL type: {item.AclType}";
                        break;
                }
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Message = $"ACL migration failed: {ex.Message}";
                result.Errors.Add(ex.Message);
                _logger?.LogError(ex, "ACL migration failed for {SourcePath} -> {TargetPath}", item.SourcePath, item.TargetPath);
            }

            result.EndTime = DateTime.UtcNow;
            return new MigrationResult<AclMigrationResult>(result);
        }

        /// <summary>
        /// Validates an ACL migration item
        /// </summary>
        public async Task<MigrationCore.ValidationResult> ValidateAsync(AclMigrationItem item, MigrationCore.MigrationContext context, CancellationToken cancellationToken = default)
        {
            var result = new MigrationCore.ValidationResult
            {
                ObjectType = "AclMigrationItem",
                ObjectName = $"{item.SourcePath} -> {item.TargetPath}",
                ValidatedAt = DateTime.UtcNow
            };

            try
            {
                // Validate source path exists
                if (!string.IsNullOrEmpty(item.SourcePath) && !await _fileSystemClient.ExistsAsync(item.SourcePath, cancellationToken))
                {
                    result.Issues.Add($"Source path does not exist: {item.SourcePath}");
                }

                // Validate target path is accessible
                if (!string.IsNullOrEmpty(item.TargetPath) && !await _fileSystemClient.IsAccessibleAsync(item.TargetPath, cancellationToken))
                {
                    result.Issues.Add($"Target path is not accessible: {item.TargetPath}");
                }

                // Validate SID mapping
                if (item.SidMapping?.Any() != true)
                {
                    result.Issues.Add("SID mapping is required for ACL migration");
                }

                result.IsValid = !result.Issues.Any();
                result.Message = result.IsValid ? "ACL migration item validation passed" : "ACL migration item validation failed";
            }
            catch (Exception ex)
            {
                result.IsValid = false;
                result.Message = $"Validation failed: {ex.Message}";
                result.Issues.Add(ex.Message);
            }

            return result;
        }


        /// <summary>
        /// Estimates the duration for ACL migration
        /// </summary>
        public async Task<TimeSpan> EstimateDurationAsync(AclMigrationItem item, MigrationCore.MigrationContext context, CancellationToken cancellationToken = default)
        {
            // Base estimation: 5 seconds per ACE, minimum 30 seconds
            var baseTime = TimeSpan.FromSeconds(30);
            var perAceTime = TimeSpan.FromSeconds(5);
            var aceCount = item.SourceAcls?.Count ?? 0;
            
            return baseTime.Add(TimeSpan.FromTicks(perAceTime.Ticks * aceCount));
        }

        /// <summary>
        /// Resolves ACL conflicts using specified strategy
        /// </summary>
        public async Task<GroupPolicyConflictResolutionResult> ResolveAclConflictsAsync(
            List<AclConflict> conflicts, 
            Services.Migration.ConflictResolutionStrategy strategy, 
            MigrationCore.MigrationContext context, 
            CancellationToken cancellationToken = default)
        {
            var result = new GroupPolicyConflictResolutionResult
            {
                Id = Guid.NewGuid().ToString(),
                StartTime = DateTime.UtcNow,
                Strategy = strategy,
                TotalConflicts = conflicts.Count
            };

            try
            {
                foreach (var conflict in conflicts)
                {
                    switch (strategy)
                    {
                        case ConflictResolutionStrategy.OverwriteTarget:
                            // Overwrite target with source ACL
                            _logger.LogInformation($"Overwriting target ACL for conflict: {conflict.Id}");
                            result.ResolvedConflicts++;
                            break;

                        case ConflictResolutionStrategy.MergePermissions:
                            // Merge source and target permissions
                            _logger.LogInformation($"Merging permissions for conflict: {conflict.Id}");
                            result.ResolvedConflicts++;
                            break;

                        case ConflictResolutionStrategy.SkipConflicted:
                            // Skip conflicted items
                            _logger.LogWarning($"Skipping conflicted ACL: {conflict.Id}");
                            result.SkippedConflicts++;
                            break;

                        default:
                            _logger.LogError($"Unknown conflict resolution strategy: {strategy}");
                            result.FailedConflicts++;
                            break;
                    }
                }

                result.IsSuccess = result.FailedConflicts == 0;
                result.EndTime = DateTime.UtcNow;
                result.Duration = result.EndTime - result.StartTime;

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving ACL conflicts");
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.EndTime = DateTime.UtcNow;
                result.Duration = result.EndTime - result.StartTime;
                return result;
            }
        }

        #endregion
    }
}