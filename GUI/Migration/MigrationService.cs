using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services.Audit;
using MandADiscoverySuite.Services.Migration;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Models;
// Fully qualify ambiguous migration types
using MigrationWave = MandADiscoverySuite.Models.Migration.MigrationWave;
using MigrationSettings = MandADiscoverySuite.Models.Migration.MigrationSettings;
using GroupDto = MandADiscoverySuite.Models.Migration.GroupDto;
using UserDto = MandADiscoverySuite.Models.Migration.UserDto;
using MailboxDto = MandADiscoverySuite.Models.Migration.MailboxDto;
using FileItemDto = MandADiscoverySuite.Models.Migration.FileItemDto;
using DatabaseDto = MandADiscoverySuite.Models.Migration.DatabaseDto;
using GroupPolicyDto = MandADiscoverySuite.Models.Migration.GroupPolicyDto;
using AclDto = MandADiscoverySuite.Models.Migration.AclDto;
using AclEntry = MandADiscoverySuite.Models.Migration.AclEntry;
// Correct license service interface
using ILicenseAssignmentService = MandADiscoverySuite.Services.ILicenseAssignmentService;
// Add Services namespace for WaveLicenseProcessingResult
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Orchestrates migration waves by delegating to specific migrators and integrates with post-migration validation.
    /// </summary>
    public class MigrationService
    {
        private readonly IIdentityMigrator _identityMigrator;
        private readonly IMailMigrator _mailMigrator;
        private readonly IFileMigrator _fileMigrator;
        private readonly ISqlMigrator _sqlMigrator;
        private readonly IGroupMigrator _groupMigrator;
        private readonly IGroupPolicyMigrator _gpoMigrator;
        private readonly IAclMigrator _aclMigrator;
        private readonly PostMigrationValidationService? _validationService;
        private readonly IAuditService _auditService;
        private readonly ILicenseAssignmentService _licenseService;
        private readonly ILogger<MigrationService> _logger;

        // Current migration context for audit logging
        private string _currentSessionId;
        private string _currentUserPrincipal;
        private string _sourceProfile;
        private string _targetProfile;

        public MigrationService(
            IIdentityMigrator identityMigrator, 
            IMailMigrator mailMigrator, 
            IFileMigrator fileMigrator, 
            ISqlMigrator sqlMigrator,
            IGroupMigrator groupMigrator,
            IGroupPolicyMigrator gpoMigrator,
            IAclMigrator aclMigrator,
            IAuditService auditService,
            ILicenseAssignmentService licenseService,
            ILogger<MigrationService> logger,
            PostMigrationValidationService? validationService = null)
        {
            _identityMigrator = identityMigrator ?? throw new ArgumentNullException(nameof(identityMigrator));
            _mailMigrator = mailMigrator ?? throw new ArgumentNullException(nameof(mailMigrator));
            _fileMigrator = fileMigrator ?? throw new ArgumentNullException(nameof(fileMigrator));
            _sqlMigrator = sqlMigrator ?? throw new ArgumentNullException(nameof(sqlMigrator));
            _groupMigrator = groupMigrator ?? throw new ArgumentNullException(nameof(groupMigrator));
            _gpoMigrator = gpoMigrator ?? throw new ArgumentNullException(nameof(gpoMigrator));
            _aclMigrator = aclMigrator ?? throw new ArgumentNullException(nameof(aclMigrator));
            _auditService = auditService ?? throw new ArgumentNullException(nameof(auditService));
            _licenseService = licenseService ?? throw new ArgumentNullException(nameof(licenseService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _validationService = validationService;
        }

        /// <summary>
        /// Sets the current migration context for audit logging
        /// </summary>
        public void SetAuditContext(string sessionId, string userPrincipal, string sourceProfile, string targetProfile)
        {
            _currentSessionId = sessionId;
            _currentUserPrincipal = userPrincipal;
            _sourceProfile = sourceProfile;
            _targetProfile = targetProfile;
        }

        /// <summary>
        /// Migrates all items in the provided wave using the injected migrators, including license assignment.
        /// </summary>
        public async Task<IList<MigrationResult>> MigrateWaveAsync(MandADiscoverySuite.Models.Migration.MigrationWave wave, MandADiscoverySuite.Models.Migration.MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null, MandADiscoverySuite.Models.WaveLicenseSettings? licenseSettings = null)
        {
            var waveId = Guid.NewGuid().ToString();
            var waveName = $"Wave-{DateTime.UtcNow:yyyyMMdd-HHmmss}";
            var results = new List<MigrationResult>();
            var startTime = DateTime.UtcNow;

            _logger.LogInformation("Starting migration wave {WaveId} with {TotalItems} items", waveId, 
                wave.Users.Count + wave.Mailboxes.Count + wave.Files.Count + wave.Databases.Count + 
                wave.Groups.Count + wave.GroupPolicies.Count + wave.AccessControlLists.Count);

            // Log wave start
            await LogAuditEventAsync(new AuditEvent
            {
                Action = AuditAction.Started,
                ObjectType = ObjectType.Other,
                WaveId = waveId,
                WaveName = waveName,
                Status = AuditStatus.InProgress,
                StatusMessage = "Migration wave started",
                ItemsProcessed = wave.Users.Count + wave.Mailboxes.Count + wave.Files.Count + wave.Databases.Count + 
                                wave.Groups.Count + wave.GroupPolicies.Count + wave.AccessControlLists.Count,
                Metadata = new Dictionary<string, string>
                {
                    ["WaveComposition"] = $"Users:{wave.Users.Count}, Mailboxes:{wave.Mailboxes.Count}, Files:{wave.Files.Count}, Databases:{wave.Databases.Count}, Groups:{wave.Groups.Count}, GPOs:{wave.GroupPolicies.Count}, ACLs:{wave.AccessControlLists.Count}"
                }
            });

            try
            {
                // Process license assignments before migration if specified
                WaveLicenseProcessingResult? licenseProcessingResult = null;
                if (licenseSettings != null && licenseSettings.AutoAssignLicenses && wave.Users.Any())
                {
                    progress?.Report(new MigrationProgress { Message = "Processing license assignments...", Percentage = 5 });
                    
                    var userData = wave.Users.Select(u => new MandADiscoverySuite.Models.UserData(
                        DisplayName: u.DisplayName ?? "Unknown",
                        UserPrincipalName: u.UserPrincipalName,
                        Mail: u.Properties.TryGetValue("Email", out var email) ? email?.ToString() : null,
                        JobTitle: u.Properties.TryGetValue("JobTitle", out var title) ? title?.ToString() : null,
                        Department: u.Properties.TryGetValue("Department", out var department) ? department?.ToString() : null,
                        AccountEnabled: u.Properties.TryGetValue("Enabled", out var enabled) && bool.TryParse(enabled?.ToString(), out var isEnabled) ? isEnabled : true,
                        SamAccountName: u.UserPrincipalName, // Use UPN as fallback for SamAccountName
                        CompanyName: u.Properties.TryGetValue("OfficeLocation", out var office) ? office?.ToString() : null,
                        ManagerDisplayName: u.Properties.TryGetValue("Manager", out var manager) ? manager?.ToString() : null,
                        CreatedDateTime: DateTimeOffset.UtcNow)
                    {
                        // Set additional properties if they exist
                    }).ToList();
                    
                    try
                    {
                        licenseProcessingResult = await _licenseService.ProcessWaveLicenseAssignmentsAsync(
                            target.TenantId, waveId, userData, licenseSettings);
                        
                        _logger.LogInformation("License processing completed for wave {WaveId}: {SuccessfulAssignments} successful, {FailedAssignments} failed", 
                            waveId, licenseProcessingResult.SuccessfulAssignments, licenseProcessingResult.FailedAssignments);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to process license assignments for wave {WaveId}", waveId);
                        // Continue with migration even if license assignment fails
                    }
                }

                // Migrate users with audit logging
                if (wave.Users.Any())
                {
                    var userTasks = wave.Users.Select(async u => await MigrateWithAuditAsync(
                        u, ObjectType.User, u.UserPrincipalName, waveId, waveName,
                        async () => await _identityMigrator.MigrateUserAsync(ToUserData(u), settings, target, progress)
                    )).ToList();
                    results.AddRange(await Task.WhenAll(userTasks));
                }

                // Migrate mailboxes with audit logging
                if (wave.Mailboxes.Any())
                {
                    var mailboxTasks = wave.Mailboxes.Select(async m => await MigrateWithAuditAsync(
                        m, ObjectType.Mailbox, m.PrimarySmtpAddress, waveId, waveName,
                        async () => await _mailMigrator.MigrateMailboxAsync(ToMailboxDto(m), settings, target, progress)
                    )).ToList();
                    results.AddRange(await Task.WhenAll(mailboxTasks));
                }

                // Migrate files with audit logging
                if (wave.Files.Any())
                {
                    var fileTasks = wave.Files.Select(async f => await MigrateWithAuditAsync(
                        f, ObjectType.File, f.SourcePath, waveId, waveName,
                        async () => await _fileMigrator.MigrateFileAsync(ToFileItemDto(f), settings, target, progress)
                    )).ToList();
                    results.AddRange(await Task.WhenAll(fileTasks));
                }

                // Migrate databases with audit logging
                if (wave.Databases.Any())
                {
                    var dbTasks = wave.Databases.Select(async d => await MigrateWithAuditAsync(
                        d, ObjectType.Database, d.Name, waveId, waveName,
                        async () => await _sqlMigrator.MigrateDatabaseAsync(ToDatabaseDto(d), settings, target, progress)
                    )).ToList();
                    results.AddRange(await Task.WhenAll(dbTasks));
                }

                // Migrate groups with audit logging
                if (wave.Groups.Any())
                {
                    var groupTasks = wave.Groups.Select(async g => await MigrateWithAuditAsync(
                        g, ObjectType.Group, g.Name, waveId, waveName,
                        async () => {
                            var groupItem = ConvertToGroupItem(ToGroupDto(g));
                            var context = CreateMigrationContext(target);
                            var result = await _groupMigrator.MigrateAsync(groupItem, context);
                            var groupResult = result as GroupMigrationResult;
                            if (groupResult == null) {
                                return MigrationResult.Failed($"Invalid migration result type for group {g.Name}");
                            }
                            var migrationResult = new MigrationResult<GroupMigrationResult> {
                                IsSuccess = groupResult.IsSuccess,
                                Warnings = groupResult.Warnings,
                                Errors = groupResult.Errors,
                                Result = groupResult
                            };
                            return ConvertToMigrationResult<GroupMigrationResult>(migrationResult);
                        }
                    )).ToList();
                    results.AddRange(await Task.WhenAll(groupTasks));
                }

                // Migrate Group Policy Objects with audit logging
                if (wave.GroupPolicies.Any())
                {
                    var gpoTasks = wave.GroupPolicies.Select(async gpo => await MigrateWithAuditAsync(
                        gpo, ObjectType.GroupPolicy, gpo.DisplayName, waveId, waveName,
                        async () => {
                            var gpoItem = ConvertToGroupPolicyItem(ToGroupPolicyDto(gpo));
                            var context = CreateMigrationContext(target);
                            var result = await _gpoMigrator.MigrateAsync(gpoItem, context);
                            return ConvertToMigrationResult<GpoMigrationResult>(result);
                        }
                    )).ToList();
                    results.AddRange(await Task.WhenAll(gpoTasks));
                }

                // Migrate Access Control Lists with audit logging
                if (wave.AccessControlLists.Any())
                {
                    var aclTasks = wave.AccessControlLists.Select(async acl => await MigrateWithAuditAsync(
                        acl, ObjectType.ACL, acl.Path, waveId, waveName,
                        async () => {
                            var aclItem = ConvertToAclItem(ToAclDto(acl));
                            var context = CreateMigrationContext(target);
                            var result = await _aclMigrator.MigrateAsync(aclItem, context);
                            var aclResult = result as AclMigrationResult;
                            if (aclResult == null) {
                                return MigrationResult.Failed($"Invalid migration result type for ACL {acl.Path}");
                            }
                            var migrationResult = new MigrationResult<AclMigrationResult> {
                                IsSuccess = aclResult.IsSuccess,
                                Warnings = aclResult.Warnings,
                                Errors = aclResult.Errors,
                                Result = aclResult
                            };
                            return ConvertToMigrationResult<AclMigrationResult>(migrationResult);
                        }
                    )).ToList();
                    results.AddRange(await Task.WhenAll(aclTasks));
                }

                // Calculate success metrics before source license cleanup
                var successCount = results.Count(r => r.Success);
                var failureCount = results.Count(r => !r.Success);

                // Remove source licenses after successful migration if specified
                if (licenseSettings?.RemoveSourceLicenses == true && successCount > 0)
                {
                    progress?.Report(new MigrationProgress { Message = "Removing source licenses...", Percentage = 95 });
                    
                    try
                    {
                        var successfulUserIds = results
                            .Where(r => r.Success && r.GetType().Name.Contains("User"))
                            .Select(r => r.GetType().GetProperty("UserId")?.GetValue(r)?.ToString())
                            .Where(id => !string.IsNullOrEmpty(id))
                            .ToList();

                        if (successfulUserIds.Any() && !string.IsNullOrEmpty(_sourceProfile))
                        {
                            var sourceCleanupResults = await _licenseService.RemoveSourceLicensesAsync(
                                _sourceProfile, successfulUserIds.Where(id => id != null).Select(id => id!).ToList());

                            _logger.LogInformation("Source license cleanup completed: {SuccessfulRemovals} successful, {FailedRemovals} failed",
                                sourceCleanupResults.Count(r => r.IsSuccess), sourceCleanupResults.Count(r => !r.IsSuccess));
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to remove source licenses for wave {WaveId}", waveId);
                        // Don't fail the migration for source license cleanup issues
                    }
                }

                // Log wave completion
                var duration = DateTime.UtcNow - startTime;

                var metadata = new Dictionary<string, string>
                {
                    ["SuccessfulMigrations"] = successCount.ToString(),
                    ["FailedMigrations"] = failureCount.ToString(),
                    ["AverageItemDuration"] = results.Count > 0 ? TimeSpan.FromTicks(duration.Ticks / results.Count).ToString() : "0"
                };

                // Add license processing metadata if applicable
                if (licenseProcessingResult != null)
                {
                    metadata["LicenseAssignments_Successful"] = licenseProcessingResult.SuccessfulAssignments.ToString();
                    metadata["LicenseAssignments_Failed"] = licenseProcessingResult.FailedAssignments.ToString();
                    metadata["LicenseAssignments_TotalCost"] = licenseProcessingResult.TotalCost.ToString("F2");
                }

                await LogAuditEventAsync(new AuditEvent
                {
                    Action = AuditAction.Completed,
                    ObjectType = ObjectType.Other,
                    WaveId = waveId,
                    WaveName = waveName,
                    Duration = duration,
                    Status = failureCount == 0 ? AuditStatus.Success : AuditStatus.Warning,
                    StatusMessage = $"Migration wave completed: {successCount} successful, {failureCount} failed",
                    ItemsProcessed = results.Count,
                    Metadata = metadata
                });

                _logger.LogInformation("Completed migration wave {WaveId} in {Duration}. Success: {SuccessCount}, Failed: {FailureCount}", 
                    waveId, duration, successCount, failureCount);

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Migration wave {WaveId} failed with exception", waveId);

                // Log wave failure
                await LogAuditEventAsync(new AuditEvent
                {
                    Action = AuditAction.Failed,
                    ObjectType = ObjectType.Other,
                    WaveId = waveId,
                    WaveName = waveName,
                    Duration = DateTime.UtcNow - startTime,
                    Status = AuditStatus.Error,
                    StatusMessage = "Migration wave failed with exception",
                    ErrorMessage = ex.Message,
                    ErrorCode = ex.GetType().Name
                });

                throw;
            }
        }

        /// <summary>
        /// Migrates all items in a wave and automatically validates the results.
        /// </summary>
        public async Task<MigrationWithValidationResult> MigrateAndValidateWaveAsync(MigrationWave wave, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null)
        {
            // Perform migration
            var migrationResults = await MigrateWaveAsync(wave, settings, target, progress);

            // Perform validation if service is available
            IList<ValidationResult>? validationResults = null;
            if (_validationService != null)
            {
                validationResults = await _validationService.ValidateWaveAsync(wave, target, null);
            }

            return new MigrationWithValidationResult
            {
                MigrationResults = migrationResults,
                ValidationResults = validationResults ?? new List<ValidationResult>(),
                Wave = wave,
                Target = target,
                CompletedAt = DateTime.Now
            };
        }

        /// <summary>
        /// Rolls back migration results using the appropriate migrators.
        /// </summary>
        public async Task<IList<RollbackResult>> RollbackMigrationResultsAsync(IList<MigrationResult> migrationResults, TargetContext target, IProgress<MigrationProgress>? progress = null)
        {
            var rollbackResults = new List<RollbackResult>();
            var totalItems = migrationResults.Count;
            var currentItem = 0;

            foreach (var result in migrationResults)
            {
                currentItem++;
                progress?.Report(new MigrationProgress
                {
                    Message = $"Rolling back {result.GetType().Name}",
                    Percentage = (currentItem * 100) / totalItems
                });

                try
                {
                    RollbackResult rollbackResult = result switch
                    {
                        _ when result.GetType().Name.Contains("User") => 
                            await _identityMigrator.RollbackUserAsync(new Models.UserData("Rollback User", "test@test.com", "test@test.com", null, null, false, "test", null, null, null, null), target, progress),
                        _ when result.GetType().Name.Contains("Mailbox") => 
                            await _mailMigrator.RollbackMailboxAsync(new MailboxDto(), target, progress),
                        _ when result.GetType().Name.Contains("File") => 
                            await _fileMigrator.RollbackFileAsync(new FileItemDto(), target, progress),
                        _ when result.GetType().Name.Contains("Database") => 
                            await _sqlMigrator.RollbackDatabaseAsync(new DatabaseDto(), target, progress),
                        _ => RollbackResult.Failed($"Unknown migration result type: {result.GetType().Name}")
                    };

                    rollbackResults.Add(rollbackResult);
                }
                catch (Exception ex)
                {
                    rollbackResults.Add(RollbackResult.Failed($"Rollback failed: {ex.Message}"));
                }
            }

            return rollbackResults;
        }

        /// <summary>
        /// Gets the validation service if available.
        /// </summary>
        public PostMigrationValidationService? ValidationService => _validationService;

        /// <summary>
        /// Generic method to migrate an item with comprehensive audit logging
        /// </summary>
        private async Task<MigrationResult> MigrateWithAuditAsync<T>(
            T item, 
            ObjectType objectType, 
            string objectName, 
            string waveId, 
            string waveName,
            Func<Task<MigrationResult>> migrationAction)
        {
            var auditId = Guid.NewGuid();
            var startTime = DateTime.UtcNow;
            var correlationId = $"{waveId}-{objectType}-{Guid.NewGuid():N}";

            // Log migration start
            await LogAuditEventAsync(new AuditEvent
            {
                AuditId = auditId,
                CorrelationId = correlationId,
                Action = AuditAction.Started,
                ObjectType = objectType,
                SourceObjectName = objectName,
                WaveId = waveId,
                WaveName = waveName,
                Status = AuditStatus.InProgress,
                StatusMessage = $"Starting {objectType} migration",
                Metadata = new Dictionary<string, string>
                {
                    ["ItemType"] = typeof(T).Name,
                    ["MigrationStarted"] = startTime.ToString("O")
                }
            });

            try
            {
                // Execute the migration
                var result = await migrationAction();
                var duration = DateTime.UtcNow - startTime;

                // Log migration result
                await LogAuditEventAsync(new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    ParentAuditId = auditId,
                    CorrelationId = correlationId,
                    Action = result.Success ? AuditAction.Completed : AuditAction.Failed,
                    ObjectType = objectType,
                    SourceObjectName = objectName,
                    WaveId = waveId,
                    WaveName = waveName,
                    Duration = duration,
                    Status = result.Success ? AuditStatus.Success : AuditStatus.Error,
                    StatusMessage = result.Success ? $"{objectType} migration completed successfully" : $"{objectType} migration failed",
                    ErrorMessage = result.Errors.Any() ? string.Join("; ", result.Errors) : null,
                    Warnings = result.Warnings.Any() ? result.Warnings : null,
                    MigrationResultData = JsonSerializer.Serialize(new
                    {
                        Success = result.Success,
                        Errors = result.Errors,
                        Warnings = result.Warnings
                    }),
                    TransferRate = duration.TotalSeconds > 0 ? 1 / duration.TotalSeconds : null,
                    Metadata = new Dictionary<string, string>
                    {
                        ["MigrationCompleted"] = DateTime.UtcNow.ToString("O"),
                        ["DurationSeconds"] = duration.TotalSeconds.ToString("F2"),
                        ["ErrorCount"] = result.Errors.Count.ToString(),
                        ["WarningCount"] = result.Warnings.Count.ToString()
                    }
                });

                return result;
            }
            catch (Exception ex)
            {
                var duration = DateTime.UtcNow - startTime;

                // Log migration exception
                await LogAuditEventAsync(new AuditEvent
                {
                    AuditId = Guid.NewGuid(),
                    ParentAuditId = auditId,
                    CorrelationId = correlationId,
                    Action = AuditAction.Failed,
                    ObjectType = objectType,
                    SourceObjectName = objectName,
                    WaveId = waveId,
                    WaveName = waveName,
                    Duration = duration,
                    Status = AuditStatus.Error,
                    StatusMessage = $"{objectType} migration failed with exception",
                    ErrorMessage = ex.Message,
                    ErrorCode = ex.GetType().Name,
                    Metadata = new Dictionary<string, string>
                    {
                        ["ExceptionType"] = ex.GetType().FullName,
                        ["StackTrace"] = ex.StackTrace?.Substring(0, Math.Min(ex.StackTrace.Length, 1000)) // Truncate for storage
                    }
                });

                return MigrationResult.Failed($"Exception during {objectType} migration: {ex.Message}");
            }
        }

        /// <summary>
        /// Helper method to log audit events with context
        /// </summary>
        private async Task LogAuditEventAsync(AuditEvent auditEvent)
        {
            // Add context information
            auditEvent.SessionId = _currentSessionId;
            auditEvent.UserPrincipalName = _currentUserPrincipal;
            auditEvent.SourceProfile = _sourceProfile;
            auditEvent.TargetProfile = _targetProfile;

            // Add environment detection if available
            if (string.IsNullOrEmpty(auditEvent.SourceEnvironment))
            {
                auditEvent.SourceEnvironment = DetectSourceEnvironment();
            }

            if (string.IsNullOrEmpty(auditEvent.TargetEnvironment))
            {
                auditEvent.TargetEnvironment = DetectTargetEnvironment();
            }

            try
            {
                var success = await _auditService.LogAuditEventAsync(auditEvent);
                if (!success)
                {
                    _logger.LogWarning("Failed to log audit event {AuditId} for {Action} {ObjectType}", 
                        auditEvent.AuditId, auditEvent.Action, auditEvent.ObjectType);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception logging audit event {AuditId}", auditEvent.AuditId);
                // Don't re-throw as audit logging should not break migrations
            }
        }

        /// <summary>
        /// Detects source environment type
        /// </summary>
        private string DetectSourceEnvironment()
        {
            // This would integrate with the environment detection service from T-000
            // For now, return a placeholder
            return "On-Premises"; // Could be "Azure", "Hybrid", etc.
        }

        /// <summary>
        /// Detects target environment type
        /// </summary>
        private string DetectTargetEnvironment()
        {
            // This would integrate with the environment detection service from T-000
            // For now, return a placeholder
            return "Azure"; // Could be "On-Premises", "Hybrid", etc.
        }

        #region Helper Methods for New Migrators

        /// <summary>
        /// Creates a migration context from the target context
        /// </summary>
        private MigrationContext CreateMigrationContext(TargetContext target)
        {
            return new MigrationContext
            {
                SessionId = _currentSessionId,
                UserPrincipalName = _currentUserPrincipal,
                SourceDomain = _sourceProfile,
                TargetDomain = target.TenantId,
                Properties = new Dictionary<string, object>
                {
                    ["TargetContext"] = target
                }
            };
        }

        /// <summary>
        /// Converts GroupDto to GroupItem for migration
        /// </summary>
        private GroupItem ConvertToGroupItem(GroupDto groupDto)
        {
            var groupItem = new GroupItem
            {
                Name = groupDto.Name,
                Sid = groupDto.Sid,
                GroupScope = groupDto.GroupScope,
                GroupType = groupDto.GroupType,
                Description = $"Migrated group: {groupDto.Name}",
                MemberSids = new List<string>(), // Would be populated from discovery data
                MemberOfSids = new List<string>(), // Would be populated from discovery data
                CustomAttributes = new Dictionary<string, object>()
            };

            // Store DN separately in properties since GroupItem doesn't have DistinguishedName property
            if (!string.IsNullOrEmpty(groupDto.DistinguishedName))
            {
                groupItem.Properties["DistinguishedName"] = groupDto.DistinguishedName;
            }

            return groupItem;
        }

        /// <summary>
        /// Converts GroupPolicyDto to GroupPolicyItem for migration
        /// </summary>
        private GroupPolicyItem ConvertToGroupPolicyItem(GroupPolicyDto gpoDto)
        {
            return new GroupPolicyItem
            {
                Id = gpoDto.GpoGuid, // replacing .Id with GpoGuid
                DisplayName = gpoDto.DisplayName,
                Name = gpoDto.DisplayName,
                Domain = gpoDto.Domain,
                Owner = _currentUserPrincipal,
                LinkedOUs = gpoDto.LinkedOUs,
                SecurityFiltering = gpoDto.SecurityFiltering,
                WmiFilters = gpoDto.WmiFilters,
                Settings = gpoDto.Settings,
                CreationTime = DateTime.UtcNow,
                ModificationTime = DateTime.UtcNow,
                Version = 1,
                Enabled = true
            };
        }

        /// <summary>
        /// Converts AclDto to AclItem for migration
        /// </summary>
        private AclItem ConvertToAclItem(AclDto aclDto)
        {
            return new AclItem
            {
                Path = aclDto.Path,
                ObjectType = aclDto.ObjectType,
                AccessControlEntries = new List<AclEntry>(), // Would be populated from discovery data
                Owner = string.Empty, // Would be populated from discovery data
                PrimaryGroup = string.Empty, // Would be populated from discovery data
                InheritanceEnabled = true,
                ExtendedAttributes = new Dictionary<string, object>()
            };
        }

        /// <summary>
        /// Converts typed migration result to generic MigrationResult
        /// </summary>
        private MigrationResult ConvertToMigrationResult<T>(MigrationResult<T> typedResult) where T : MigrationResultBase
        {
            var result = new MigrationResult
            {
                Success = typedResult.IsSuccess
            };

            result.Warnings.AddRange(typedResult.Warnings);
            result.Errors.AddRange(typedResult.Errors);

            return result;
        }

        #endregion

        #region Conversion Helpers (Domain Items to DTOs)

        /// <summary>
        /// Converts UserItem to UserData before service calls
        /// </summary>
        private UserData ToUserData(UserItem user)
        {
            return new Models.UserData(
                DisplayName: user.DisplayName ?? "Unknown",
                UserPrincipalName: user.UserPrincipalName,
                Mail: user.Properties.TryGetValue("Email", out var email) ? email?.ToString() : null,
                Department: user.Properties.TryGetValue("Department", out var department) ? department?.ToString() : null,
                JobTitle: user.Properties.TryGetValue("JobTitle", out var jobTitle) ? jobTitle?.ToString() : null,
                AccountEnabled: user.Properties.TryGetValue("Enabled", out var enabled) && bool.TryParse(enabled?.ToString(), out var isEnabled) ? isEnabled : true,
                SamAccountName: user.UserPrincipalName, // Use UPN as fallback for SamAccountName
                CompanyName: user.Properties.TryGetValue("OfficeLocation", out var office) ? office?.ToString() : null,
                ManagerDisplayName: user.Properties.TryGetValue("Manager", out var manager) ? manager?.ToString() : null,
                CreatedDateTime: DateTimeOffset.UtcNow,
                UserSource: null
            )
            {
                FirstName = user.Properties.TryGetValue("FirstName", out var firstName) ? firstName?.ToString() : null,
                LastName = user.Properties.TryGetValue("LastName", out var lastName) ? lastName?.ToString() : null,
                Country = user.Properties.TryGetValue("Country", out var country) ? country?.ToString() : null
            };
        }

        /// <summary>
        /// Converts MailboxItem to MailboxDto before service calls
        /// </summary>
        private MailboxDto ToMailboxDto(MandADiscoverySuite.Models.Migration.MailboxItem mailbox)
        {
            bool isArchiveEnabled = false;
            bool isArchiveEnabledParsed = mailbox.Properties.TryGetValue("IsArchiveEnabled", out var archiveEnabled) && bool.TryParse(archiveEnabled?.ToString(), out isArchiveEnabled);
            return new MailboxDto
            {
                UserPrincipalName = mailbox.UserPrincipalName,
                DisplayName = mailbox.Properties.TryGetValue("DisplayName", out var displayName) ? displayName?.ToString() : null,
                PrimarySmtpAddress = mailbox.PrimarySmtpAddress,
                TotalSizeBytes = mailbox.SizeBytes,
                MailboxType = mailbox.Properties.TryGetValue("MailboxType", out var type) ? type?.ToString() : null,
                DiscoveryTimestamp = DateTime.UtcNow,
                DiscoveryModule = mailbox.Properties.TryGetValue("DiscoveryModule", out var module) ? module?.ToString() : null,
                SessionId = mailbox.Properties.TryGetValue("SessionId", out var sessionId) ? sessionId?.ToString() : null,
                ItemCount = mailbox.Properties.TryGetValue("ItemCount", out var itemCount) && int.TryParse(itemCount?.ToString(), out var count) ? count : 0,
                ProhibitSendQuota = mailbox.Properties.TryGetValue("ProhibitSendQuota", out var sendQuota) ? sendQuota?.ToString() : null,
                ProhibitSendReceiveQuota = mailbox.Properties.TryGetValue("ProhibitSendReceiveQuota", out var receiveQuota) ? receiveQuota?.ToString() : null,
                IssueWarningQuota = mailbox.Properties.TryGetValue("IssueWarningQuota", out var warningQuota) ? warningQuota?.ToString() : null,
                IsArchiveEnabled = isArchiveEnabledParsed ? isArchiveEnabled : false,
                ArchiveSizeBytes = mailbox.Properties.TryGetValue("ArchiveSizeBytes", out var archiveSize) && long.TryParse(archiveSize?.ToString(), out var archSize) ? archSize : 0,
                EmailAddresses = mailbox.Properties.TryGetValue("EmailAddresses", out var emails) ? emails as List<string> ?? new List<string>() : new List<string>(),
                Properties = mailbox.Properties
            };
        }

        /// <summary>
        /// Converts GroupItem to GroupDto before service calls
        /// </summary>
        private GroupDto ToGroupDto(GroupItem group)
        {
            return new GroupDto
            {
                Id = group.Properties.TryGetValue("Id", out var id) ? id?.ToString() : Guid.NewGuid().ToString(),
                Sid = group.Sid,
                Name = group.Name,
                DisplayName = group.Name,
                Description = group.Description,
                GroupType = group.GroupType,
                GroupScope = group.GroupScope,
                DistinguishedName = group.Properties.TryGetValue("DistinguishedName", out var dn) ? dn?.ToString() : $"{group.Name}@{group.Sid}",
                Members = group.Members ?? new List<string>(),
                MemberSids = group.MemberSids,
                MemberOf = group.Properties.TryGetValue("MemberOf", out var memberOf) ? memberOf as List<string> ?? new List<string>() : new List<string>(),
                MemberOfSids = group.MemberOfSids,
                Created = group.Properties.TryGetValue("Created", out var created) && DateTime.TryParse(created?.ToString(), out var createdDate) ? createdDate : DateTime.UtcNow,
                Modified = group.Properties.TryGetValue("Modified", out var modified) && DateTime.TryParse(modified?.ToString(), out var modifiedDate) ? modifiedDate : DateTime.UtcNow,
                Properties = group.Properties,
                CustomAttributes = group.CustomAttributes
            };
        }

        /// <summary>
        /// Converts FileShareItem to FileItemDto before service calls
        /// </summary>
        private FileItemDto ToFileItemDto(MandADiscoverySuite.Models.Migration.FileShareItem file)
        {
            bool isEncrypted = false;
            bool.TryParse(file.Properties.TryGetValue("IsEncrypted", out var encrypted) ? encrypted?.ToString() : null, out isEncrypted);
            return new FileItemDto
            {
                SourcePath = file.SourcePath,
                TargetPath = file.TargetPath,
                FilePath = file.SourcePath,
                FileName = System.IO.Path.GetFileName(file.SourcePath),
                Directory = System.IO.Path.GetDirectoryName(file.SourcePath),
                FileSize = file.SizeBytes,
                LastModified = file.Properties.TryGetValue("LastModified", out var lastModified) && DateTime.TryParse(lastModified?.ToString(), out var lastModDate) ? lastModDate : DateTime.UtcNow,
                Created = file.Properties.TryGetValue("Created", out var created) && DateTime.TryParse(created?.ToString(), out var createdDate) ? createdDate : DateTime.UtcNow,
                FileExtension = System.IO.Path.GetExtension(file.SourcePath),
                MimeType = file.Properties.TryGetValue("MimeType", out var mimeType) ? mimeType?.ToString() : null,
                Hash = file.Properties.TryGetValue("Hash", out var hash) ? hash?.ToString() : null,
                Owner = file.Properties.TryGetValue("Owner", out var owner) ? owner?.ToString() : null,
                Permissions = file.Properties.TryGetValue("Permissions", out var permissions) ? permissions as List<string> ?? new List<string>() : new List<string>(),
                IsEncrypted = isEncrypted,
                Source = file.SourcePath,
                Target = file.TargetPath,
                Metadata = file.Properties
            };
        }

        /// <summary>
        /// Converts DatabaseItem to DatabaseDto before service calls
        /// </summary>
        private DatabaseDto ToDatabaseDto(MandADiscoverySuite.Models.Migration.DatabaseItem database)
        {
            return new DatabaseDto
            {
                DatabaseName = database.Name,
                Name = database.Name,
                ServerName = "",
                InstanceName = "",
                SizeMB = database.SizeMB,
                CompatibilityLevel = database.Properties.TryGetValue("CompatibilityLevel", out var compat) ? compat?.ToString() : null,
                CollationName = database.Properties.TryGetValue("CollationName", out var collation) ? collation?.ToString() : null,
                LastBackup = database.Properties.TryGetValue("LastBackup", out var backup) && DateTime.TryParse(backup?.ToString(), out var backupDate) ? backupDate : DateTime.MinValue,
                RecoveryModel = database.Properties.TryGetValue("RecoveryModel", out var recovery) ? recovery?.ToString() : null,
                Owner = database.Properties.TryGetValue("Owner", out var owner) ? owner?.ToString() : null,
                Users = database.Properties.TryGetValue("Users", out var users) ? users as List<string> ?? new List<string>() : new List<string>(),
                Schemas = database.Properties.TryGetValue("Schemas", out var schemas) ? schemas as List<string> ?? new List<string>() : new List<string>(),
                TableCount = database.Properties.TryGetValue("TableCount", out var tableCount) && int.TryParse(tableCount?.ToString(), out var tCount) ? tCount : 0,
                ViewCount = database.Properties.TryGetValue("ViewCount", out var viewCount) && int.TryParse(viewCount?.ToString(), out var vCount) ? vCount : 0,
                StoredProcedureCount = database.Properties.TryGetValue("StoredProcedureCount", out var spCount) && int.TryParse(spCount?.ToString(), out var procCount) ? procCount : 0,
                Properties = database.Properties,
                SourceServer = database.SourceServer,
                TargetServer = database.TargetServer,
                CustomProperties = database.Properties
            };
        }

        /// <summary>
        /// Converts GroupPolicyItem to GroupPolicyDto before service calls
        /// </summary>
        private GroupPolicyDto ToGroupPolicyDto(GroupPolicyItem gpo)
        {
            return new GroupPolicyDto
            {
                GpoGuid = gpo.GpoGuid,
                GpoName = gpo.GpoName,
                DisplayName = gpo.DisplayName,
                Description = gpo.Description,
                Domain = gpo.Domain,
                Owner = gpo.Owner,
                CreatedDate = gpo.CreatedDate,
                ModifiedDate = gpo.ModifiedDate,
                LinkedOUs = gpo.LinkedOUs,
                SecurityFiltering = gpo.SecurityFiltering,
                WmiFilters = gpo.WmiFilters,
                IsEnabled = gpo.IsEnabled,
                Version = gpo.Version,
                Settings = gpo.Settings,
                CustomProperties = gpo.CustomProperties
            };
        }

        /// <summary>
        /// Converts AclItem to AclDto before service calls
        /// </summary>
        private AclDto ToAclDto(AclItem acl)
        {
            return new AclDto
            {
                Path = acl.Path,
                ObjectType = acl.ObjectType,
                Owner = acl.Owner,
                PrimaryGroup = acl.PrimaryGroup,
                InheritanceEnabled = acl.InheritanceEnabled,
                AccessControlEntries = acl.AccessControlEntries?.Select(entry => new MandADiscoverySuite.Models.Migration.AclEntryDto
                {
                    Sid = entry.Sid,
                    IdentityReference = entry.IdentityReference,
                    AccessMask = entry.AccessMask,
                    AccessControlType = entry.AccessControlType,
                    InheritanceFlags = entry.InheritanceFlags,
                    PropagationFlags = entry.PropagationFlags,
                    IsInherited = entry.IsInherited
                }).ToList() ?? new List<MandADiscoverySuite.Models.Migration.AclEntryDto>(),
                ExtendedAttributes = acl.ExtendedAttributes
            };
        }

        #endregion
    }

    /// <summary>
    /// Combined result of migration and validation operations.
    /// </summary>
    public class MigrationWithValidationResult
    {
        public IList<MigrationResult> MigrationResults { get; set; } = new List<MigrationResult>();
        public IList<ValidationResult> ValidationResults { get; set; } = new List<ValidationResult>();
        public MigrationWave Wave { get; set; } = new();
        public TargetContext Target { get; set; } = new();
        public DateTime CompletedAt { get; set; }

        public bool HasMigrationErrors => MigrationResults.Any(r => !r.Success);
        public bool HasValidationErrors => ValidationResults.Any(r => r.Severity == ValidationSeverity.Error || r.Severity == ValidationSeverity.Critical);
        public bool IsFullySuccessful => !HasMigrationErrors && !HasValidationErrors;
    }
}
