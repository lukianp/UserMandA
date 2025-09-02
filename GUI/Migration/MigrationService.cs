using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services.Audit;
using MandADiscoverySuite.Services.Migration;
using MandADiscoverySuite.Models.Migration;

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
        public async Task<IList<MigrationResult>> MigrateWaveAsync(MigrationWave wave, MigrationSettings settings, TargetContext target, IProgress<MigrationProgress>? progress = null, WaveLicenseSettings? licenseSettings = null)
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
                    ["WaveComposition"] = $"Users:{wave.Users.Count}, Mailboxes:{wave.Mailboxes.Count}, Files:{wave.Files.Count}, Databases:{wave.Databases.Count}, Groups:{wave.Groups.Count}, GPOs:{wave.GroupPolicies.Count}, ACLs:{wave.AccessControlLists.Count}",
                    ["OverwriteExisting"] = settings.OverwriteExisting.ToString()
                }
            });

            try
            {
                // Process license assignments before migration if specified
                WaveLicenseProcessingResult? licenseProcessingResult = null;
                if (licenseSettings != null && licenseSettings.AutoAssignLicenses && wave.Users.Any())
                {
                    progress?.Report(new MigrationProgress { Message = "Processing license assignments...", Percentage = 5 });
                    
                    var userData = wave.Users.Select(u => new UserData 
                    { 
                        UserPrincipalName = u.UserPrincipalName, 
                        DisplayName = u.DisplayName,
                        Department = u.Department,
                        JobTitle = u.JobTitle,
                        Mail = u.Mail
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
                        async () => await _identityMigrator.MigrateUserAsync(u, settings, target, progress)
                    )).ToList();
                    results.AddRange(await Task.WhenAll(userTasks));
                }

                // Migrate mailboxes with audit logging
                if (wave.Mailboxes.Any())
                {
                    var mailboxTasks = wave.Mailboxes.Select(async m => await MigrateWithAuditAsync(
                        m, ObjectType.Mailbox, m.PrimarySmtpAddress, waveId, waveName,
                        async () => await _mailMigrator.MigrateMailboxAsync(m, settings, target, progress)
                    )).ToList();
                    results.AddRange(await Task.WhenAll(mailboxTasks));
                }

                // Migrate files with audit logging
                if (wave.Files.Any())
                {
                    var fileTasks = wave.Files.Select(async f => await MigrateWithAuditAsync(
                        f, ObjectType.File, f.SourcePath, waveId, waveName,
                        async () => await _fileMigrator.MigrateFileAsync(f, settings, target, progress)
                    )).ToList();
                    results.AddRange(await Task.WhenAll(fileTasks));
                }

                // Migrate databases with audit logging
                if (wave.Databases.Any())
                {
                    var dbTasks = wave.Databases.Select(async d => await MigrateWithAuditAsync(
                        d, ObjectType.Database, d.Name, waveId, waveName,
                        async () => await _sqlMigrator.MigrateDatabaseAsync(d, settings, target, progress)
                    )).ToList();
                    results.AddRange(await Task.WhenAll(dbTasks));
                }

                // Migrate groups with audit logging
                if (wave.Groups.Any())
                {
                    var groupTasks = wave.Groups.Select(async g => await MigrateWithAuditAsync(
                        g, ObjectType.Group, g.Name, waveId, waveName,
                        async () => {
                            var groupItem = ConvertToGroupItem(g);
                            var context = CreateMigrationContext(target);
                            var result = await _groupMigrator.MigrateAsync(groupItem, context);
                            return ConvertToMigrationResult(result);
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
                            var gpoItem = ConvertToGroupPolicyItem(gpo);
                            var context = CreateMigrationContext(target);
                            var result = await _gpoMigrator.MigrateAsync(gpoItem, context);
                            return ConvertToMigrationResult(result);
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
                            var aclItem = ConvertToAclItem(acl);
                            var context = CreateMigrationContext(target);
                            var result = await _aclMigrator.MigrateAsync(aclItem, context);
                            return ConvertToMigrationResult(result);
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
                                _sourceProfile, successfulUserIds);
                                
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
                            await _identityMigrator.RollbackUserAsync(new UserDto(), target, progress),
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
            return new GroupItem
            {
                Name = groupDto.Name,
                Sid = groupDto.Sid,
                DistinguishedName = groupDto.DistinguishedName,
                GroupScope = groupDto.GroupScope,
                GroupType = groupDto.GroupType,
                Description = $"Migrated group: {groupDto.Name}",
                MemberSids = new List<string>(), // Would be populated from discovery data
                MemberOfSids = new List<string>(), // Would be populated from discovery data
                CustomAttributes = new Dictionary<string, object>()
            };
        }

        /// <summary>
        /// Converts GroupPolicyDto to GroupPolicyItem for migration
        /// </summary>
        private GroupPolicyItem ConvertToGroupPolicyItem(GroupPolicyDto gpoDto)
        {
            return new GroupPolicyItem
            {
                Id = gpoDto.Id,
                DisplayName = gpoDto.DisplayName,
                Name = gpoDto.DisplayName,
                Domain = gpoDto.Domain,
                Owner = _currentUserPrincipal,
                LinkedOUs = new List<string>(), // Would be populated from discovery data
                SecurityFiltering = new List<string>(), // Would be populated from discovery data
                WmiFilters = new List<string>(), // Would be populated from discovery data
                Settings = new Dictionary<string, object>(), // Would be populated from discovery data
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
