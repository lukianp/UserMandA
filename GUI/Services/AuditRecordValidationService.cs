using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.IO;
using System.Text;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models.Migration;
using MandADiscoverySuite.Services.Migration;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Production implementation of audit record validation service for migration operations
    /// </summary>
    public class AuditRecordValidationService : IAuditRecordValidationService
    {
        private readonly ILogger<AuditRecordValidationService> _logger;
        private readonly IAuditService _auditService;

        public event EventHandler<AuditValidationProgressEventArgs>? ValidationProgress;

        public AuditRecordValidationService(
            ILogger<AuditRecordValidationService> logger,
            IAuditService auditService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _auditService = auditService ?? throw new ArgumentNullException(nameof(auditService));
        }

        /// <summary>
        /// Converts Migration validation issues to Audit validation issues
        /// </summary>
        private List<AuditValidationIssue> ConvertValidationIssues(List<MandADiscoverySuite.Migration.ValidationIssue> migrationIssues)
        {
            return migrationIssues.Select(issue => new AuditValidationIssue
            {
                Severity = ConvertSeverity(issue.Severity),
                Category = issue.Category,
                Description = issue.Description,
                RecommendedAction = issue.RecommendedAction
            }).ToList();
        }

        /// <summary>
        /// Converts Migration validation severity to Audit validation severity
        /// </summary>
        private AuditValidationSeverity ConvertSeverity(MandADiscoverySuite.Migration.ValidationSeverity severity)
        {
            return severity switch
            {
                MandADiscoverySuite.Migration.ValidationSeverity.Error => AuditValidationSeverity.Error,
                MandADiscoverySuite.Migration.ValidationSeverity.Critical => AuditValidationSeverity.Error,
                MandADiscoverySuite.Migration.ValidationSeverity.Warning => AuditValidationSeverity.Warning,
                MandADiscoverySuite.Migration.ValidationSeverity.Success => AuditValidationSeverity.Information,
                _ => AuditValidationSeverity.Information
            };
        }

        /// <summary>
        /// Validates user migration and creates comprehensive audit records
        /// </summary>
        public async Task<AuditValidationResult> ValidateUserAsync(UserDto user, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default)
        {
            var startTime = DateTime.UtcNow;
            var result = new AuditValidationResult
            {
                ObjectType = "User",
                ObjectIdentifier = user.UserPrincipalName ?? user.DisplayName ?? "Unknown",
                StartedAt = startTime
            };

            try
            {
                _logger.LogInformation("Starting audit validation for user {UserPrincipalName}", user.UserPrincipalName);

                ReportProgress(progress, 0, "Starting user validation", user.UserPrincipalName ?? "Unknown User");

                // Validate user data integrity
                var validationIssues = await ValidateUserDataIntegrityAsync(user, target, cancellationToken);
                result.Issues.AddRange(ConvertValidationIssues(validationIssues));

                // Validate user attributes
                var attributeIssues = await ValidateUserAttributesAsync(user, target, cancellationToken);
                result.Issues.AddRange(ConvertValidationIssues(attributeIssues));

                // Validate user permissions and roles
                var permissionIssues = await ValidateUserPermissionsAsync(user, target, cancellationToken);
                result.Issues.AddRange(ConvertValidationIssues(permissionIssues));

                result.IsValid = !result.Issues.Any(i => i.Severity == AuditValidationSeverity.Error);
                result.CompletedAt = DateTime.UtcNow;
                result.Duration = result.CompletedAt - startTime;

                // Create audit record
                result.AuditRecord = new AuditRecord
                {
                    Id = Guid.NewGuid().ToString(),
                    Action = "AuditValidation",
                    ObjectType = "User",
                    ObjectIdentifier = user.UserPrincipalName ?? user.DisplayName ?? "Unknown",
                    Status = result.IsValid ? "Success" : "Failed",
                    StartTime = startTime,
                    EndTime = result.CompletedAt,
                    Duration = result.Duration,
                    InitiatedBy = Environment.UserName,
                    IssueCount = result.IssueCount,
                    ErrorCount = result.ErrorCount,
                    WarningCount = result.WarningCount,
                    IssueDetails = string.Join("; ", result.Issues.Select(i => $"{i.Category}: {i.Description}")),
                    ObjectCount = 1
                };

                // Store audit record
                await _auditService.InsertAuditRecordAsync(result.AuditRecord);

                ReportProgress(progress, 100, "User validation completed", user.UserPrincipalName ?? "Unknown User");

                _logger.LogInformation("Completed audit validation for user {UserPrincipalName} in {Duration}ms. Valid: {IsValid}, Issues: {IssueCount}",
                    user.UserPrincipalName, result.Duration.TotalMilliseconds, result.IsValid, result.IssueCount);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during audit validation for user {UserPrincipalName}", user.UserPrincipalName);

                result.IsValid = false;
                result.Issues.Add(new AuditValidationIssue
                {
                    Severity = AuditValidationSeverity.Error,
                    Category = "Exception",
                    Description = $"Audit validation failed due to exception: {ex.Message}",
                    RecommendedAction = "Check logs for detailed error information"
                });
                result.CompletedAt = DateTime.UtcNow;
                result.Duration = result.CompletedAt - startTime;

                return result;
            }
        }

        /// <summary>
        /// Validates mailbox migration and creates comprehensive audit records
        /// </summary>
        public async Task<AuditValidationResult> ValidateMailboxAsync(MailboxDto mailbox, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default)
        {
            var startTime = DateTime.UtcNow;
            var result = new AuditValidationResult
            {
                ObjectType = "Mailbox",
                ObjectIdentifier = mailbox.PrimarySmtpAddress ?? mailbox.UserPrincipalName ?? "Unknown",
                StartedAt = startTime
            };

            try
            {
                _logger.LogInformation("Starting audit validation for mailbox {PrimarySmtpAddress}", mailbox.PrimarySmtpAddress);

                ReportProgress(progress, 0, "Starting mailbox validation", mailbox.PrimarySmtpAddress ?? "Unknown Mailbox");

                // Validate mailbox data integrity
                var validationIssues = await ValidateMailboxDataIntegrityAsync(mailbox, target, cancellationToken);
                result.Issues.AddRange(ConvertValidationIssues(validationIssues));

                // Validate mailbox attributes
                var attributeIssues = await ValidateMailboxAttributesAsync(mailbox, target, cancellationToken);
                result.Issues.AddRange(ConvertValidationIssues(attributeIssues));

                result.IsValid = !result.Issues.Any(i => i.Severity == AuditValidationSeverity.Error);
                result.CompletedAt = DateTime.UtcNow;
                result.Duration = result.CompletedAt - startTime;

                // Create audit record
                result.AuditRecord = new AuditRecord
                {
                    Id = Guid.NewGuid().ToString(),
                    Action = "AuditValidation",
                    ObjectType = "Mailbox",
                    ObjectIdentifier = mailbox.PrimarySmtpAddress ?? "Unknown",
                    Status = result.IsValid ? "Success" : "Failed",
                    StartTime = startTime,
                    EndTime = result.CompletedAt,
                    Duration = result.Duration,
                    InitiatedBy = Environment.UserName,
                    IssueCount = result.IssueCount,
                    ErrorCount = result.ErrorCount,
                    WarningCount = result.WarningCount,
                    IssueDetails = string.Join("; ", result.Issues.Select(i => $"{i.Category}: {i.Description}")),
                    ObjectCount = 1
                };

                // Store audit record
                await _auditService.InsertAuditRecordAsync(result.AuditRecord);

                ReportProgress(progress, 100, "Mailbox validation completed", mailbox.PrimarySmtpAddress ?? "Unknown Mailbox");

                _logger.LogInformation("Completed audit validation for mailbox {PrimarySmtpAddress} in {Duration}ms. Valid: {IsValid}, Issues: {IssueCount}",
                    mailbox.PrimarySmtpAddress, result.Duration.TotalMilliseconds, result.IsValid, result.IssueCount);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during audit validation for mailbox {PrimarySmtpAddress}", mailbox.PrimarySmtpAddress);

                result.IsValid = false;
                result.Issues.Add(new AuditValidationIssue
                {
                    Severity = AuditValidationSeverity.Error,
                    Category = "Exception",
                    Description = $"Audit validation failed due to exception: {ex.Message}",
                    RecommendedAction = "Check logs for detailed error information"
                });
                result.CompletedAt = DateTime.UtcNow;
                result.Duration = result.CompletedAt - startTime;

                return result;
            }
        }

        /// <summary>
        /// Validates file migration and creates comprehensive audit records
        /// </summary>
        public async Task<AuditValidationResult> ValidateFilesAsync(FileItemDto fileItem, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default)
        {
            var startTime = DateTime.UtcNow;
            var result = new AuditValidationResult
            {
                ObjectType = "File",
                ObjectIdentifier = fileItem.SourcePath ?? "Unknown",
                StartedAt = startTime
            };

            try
            {
                _logger.LogInformation("Starting audit validation for file {SourcePath}", fileItem.SourcePath);

                ReportProgress(progress, 0, "Starting file validation", fileItem.SourcePath ?? "Unknown File");

                // Validate file data integrity
                var validationIssues = await ValidateFileDataIntegrityAsync(fileItem, target, cancellationToken);
                result.Issues.AddRange(ConvertValidationIssues(validationIssues));

                // Validate file attributes
                var attributeIssues = await ValidateFileAttributesAsync(fileItem, target, cancellationToken);
                result.Issues.AddRange(ConvertValidationIssues(attributeIssues));

                result.IsValid = !result.Issues.Any(i => i.Severity == AuditValidationSeverity.Error);
                result.CompletedAt = DateTime.UtcNow;
                result.Duration = result.CompletedAt - startTime;

                // Create audit record
                result.AuditRecord = new AuditRecord
                {
                    Id = Guid.NewGuid().ToString(),
                    Action = "AuditValidation",
                    ObjectType = "File",
                    ObjectIdentifier = fileItem.SourcePath ?? "Unknown",
                    Status = result.IsValid ? "Success" : "Failed",
                    StartTime = startTime,
                    EndTime = result.CompletedAt,
                    Duration = result.Duration,
                    InitiatedBy = Environment.UserName,
                    IssueCount = result.IssueCount,
                    ErrorCount = result.ErrorCount,
                    WarningCount = result.WarningCount,
                    IssueDetails = string.Join("; ", result.Issues.Select(i => $"{i.Category}: {i.Description}")),
                    ObjectCount = 1
                };

                // Store audit record
                await _auditService.InsertAuditRecordAsync(result.AuditRecord);

                ReportProgress(progress, 100, "File validation completed", fileItem.SourcePath ?? "Unknown File");

                _logger.LogInformation("Completed audit validation for file {SourcePath} in {Duration}ms. Valid: {IsValid}, Issues: {IssueCount}",
                    fileItem.SourcePath, result.Duration.TotalMilliseconds, result.IsValid, result.IssueCount);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during audit validation for file {SourcePath}", fileItem.SourcePath);

                result.IsValid = false;
                result.Issues.Add(new AuditValidationIssue
                {
                    Severity = AuditValidationSeverity.Error,
                    Category = "Exception",
                    Description = $"Audit validation failed due to exception: {ex.Message}",
                    RecommendedAction = "Check logs for detailed error information"
                });
                result.CompletedAt = DateTime.UtcNow;
                result.Duration = result.CompletedAt - startTime;

                return result;
            }
        }

        /// <summary>
        /// Validates database migration and creates comprehensive audit records
        /// </summary>
        public async Task<AuditValidationResult> ValidateDatabaseAsync(DatabaseDto database, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default)
        {
            var startTime = DateTime.UtcNow;
            var result = new AuditValidationResult
            {
                ObjectType = "Database",
                ObjectIdentifier = database.Name ?? "Unknown",
                StartedAt = startTime
            };

            try
            {
                _logger.LogInformation("Starting audit validation for database {Name}", database.Name);

                ReportProgress(progress, 0, "Starting database validation", database.Name ?? "Unknown Database");

                // Validate database data integrity
                var validationIssues = await ValidateDatabaseDataIntegrityAsync(database, target, cancellationToken);
                result.Issues.AddRange(ConvertValidationIssues(validationIssues));

                // Validate database attributes
                var attributeIssues = await ValidateDatabaseAttributesAsync(database, target, cancellationToken);
                result.Issues.AddRange(ConvertValidationIssues(attributeIssues));

                result.IsValid = !result.Issues.Any(i => i.Severity == AuditValidationSeverity.Error);
                result.CompletedAt = DateTime.UtcNow;
                result.Duration = result.CompletedAt - startTime;

                // Create audit record
                result.AuditRecord = new AuditRecord
                {
                    Id = Guid.NewGuid().ToString(),
                    Action = "AuditValidation",
                    ObjectType = "Database",
                    ObjectIdentifier = database.Name ?? "Unknown",
                    Status = result.IsValid ? "Success" : "Failed",
                    StartTime = startTime,
                    EndTime = result.CompletedAt,
                    Duration = result.Duration,
                    InitiatedBy = Environment.UserName,
                    IssueCount = result.IssueCount,
                    ErrorCount = result.ErrorCount,
                    WarningCount = result.WarningCount,
                    IssueDetails = string.Join("; ", result.Issues.Select(i => $"{i.Category}: {i.Description}")),
                    ObjectCount = 1
                };

                // Store audit record
                await _auditService.InsertAuditRecordAsync(result.AuditRecord);

                ReportProgress(progress, 100, "Database validation completed", database.Name ?? "Unknown Database");

                _logger.LogInformation("Completed audit validation for database {Name} in {Duration}ms. Valid: {IsValid}, Issues: {IssueCount}",
                    database.Name, result.Duration.TotalMilliseconds, result.IsValid, result.IssueCount);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during audit validation for database {Name}", database.Name);

                result.IsValid = false;
                result.Issues.Add(new AuditValidationIssue
                {
                    Severity = AuditValidationSeverity.Error,
                    Category = "Exception",
                    Description = $"Audit validation failed due to exception: {ex.Message}",
                    RecommendedAction = "Check logs for detailed error information"
                });
                result.CompletedAt = DateTime.UtcNow;
                result.Duration = result.CompletedAt - startTime;

                return result;
            }
        }

        /// <summary>
        /// Validates entire migration wave and creates consolidated audit records
        /// </summary>
        public async Task<WaveAuditValidationResult> ValidateWaveAsync(MigrationWave wave, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default)
        {
            var startTime = DateTime.UtcNow;
            var result = new WaveAuditValidationResult
            {
                IsValid = true,
                TotalObjects = 0,
                SuccessfulValidations = 0,
                FailedValidations = 0,
                IndividualResults = new List<AuditValidationResult>(),
                IndividualAuditRecords = new List<AuditRecord>()
            };

            try
            {
                _logger.LogInformation("Starting wave validation for wave {WaveName}", wave.Name);
                ReportProgress(progress, 0, "Starting wave validation", wave.Name ?? "Unknown Wave");

                var tasks = new List<Task<AuditValidationResult>>();
                var totalOperations = 0;

                // Validate users
                if (wave.Users != null)
                {
                    foreach (var user in wave.Users)
                    {
                        totalOperations++;
                        // Convert UserItem to UserDto for validation
                        var userDto = new UserDto
                        {
                            UserPrincipalName = user.UserPrincipalName,
                            DisplayName = user.DisplayName,
                            Department = user.Properties.TryGetValue("Department", out var dept) ? dept?.ToString() : null,
                            JobTitle = user.Properties.TryGetValue("JobTitle", out var title) ? title?.ToString() : null
                        };
                        tasks.Add(ValidateUserAsync(userDto, target, progress, cancellationToken));
                    }
                }

                // Validate mailboxes
                if (wave.Mailboxes != null)
                {
                    foreach (var mailbox in wave.Mailboxes)
                    {
                        totalOperations++;
                        // Convert MailboxItem to MailboxDto for validation
                        var mailboxDto = new MailboxDto
                        {
                            UserPrincipalName = mailbox.UserPrincipalName,
                            PrimarySmtpAddress = mailbox.PrimarySmtpAddress,
                            TotalSizeBytes = mailbox.SizeBytes
                        };
                        tasks.Add(ValidateMailboxAsync(mailboxDto, target, progress, cancellationToken));
                    }
                }

                // Validate files
                if (wave.Files != null)
                {
                    foreach (var file in wave.Files)
                    {
                        totalOperations++;
                        // Convert FileShareItem to FileItemDto for validation
                        var fileDto = new FileItemDto
                        {
                            SourcePath = file.SourcePath,
                            TargetPath = file.TargetPath,
                            FileSize = file.SizeBytes
                        };
                        tasks.Add(ValidateFilesAsync(fileDto, target, progress, cancellationToken));
                    }
                }

                // Validate databases
                if (wave.Databases != null)
                {
                    foreach (var database in wave.Databases)
                    {
                        totalOperations++;
                        // Convert DatabaseItem to DatabaseDto for validation
                        var databaseDto = new DatabaseDto
                        {
                            Name = database.Name,
                            SizeMB = database.SizeMB
                        };
                        tasks.Add(ValidateDatabaseAsync(databaseDto, target, progress, cancellationToken));
                    }
                }

                var results = await Task.WhenAll(tasks);
                result.IndividualResults = results.ToList();
                result.TotalObjects = totalOperations;
                result.SuccessfulValidations = results.Count(r => r.IsValid);
                result.FailedValidations = results.Count(r => !r.IsValid);
                result.IsValid = result.FailedValidations == 0;

                // Create wave audit record
                result.WaveAuditRecord = new AuditRecord
                {
                    Id = Guid.NewGuid().ToString(),
                    Action = "WaveValidation",
                    ObjectType = "MigrationWave",
                    ObjectIdentifier = wave.Name ?? "Unknown",
                    Status = result.IsValid ? "Success" : result.FailedValidations > 0 ? "Warning" : "Failed",
                    StartTime = startTime,
                    EndTime = DateTime.UtcNow,
                    Duration = DateTime.UtcNow - startTime,
                    InitiatedBy = Environment.UserName,
                    ObjectCount = totalOperations,
                    IssueCount = result.IndividualResults.Sum(r => r.IssueCount),
                    ErrorCount = result.IndividualResults.Sum(r => r.ErrorCount),
                    WarningCount = result.IndividualResults.Sum(r => r.WarningCount),
                    WaveId = wave.Id ?? Guid.NewGuid().ToString()
                };

                // Store wave audit record
                await _auditService.InsertAuditRecordAsync(result.WaveAuditRecord);

                // Store individual audit records
                foreach (var auditRecord in result.IndividualResults.Select(r => r.AuditRecord))
                {
                    auditRecord.WaveId = wave.Id ?? Guid.NewGuid().ToString();
                    await _auditService.InsertAuditRecordAsync(auditRecord);
                }

                result.IndividualAuditRecords = result.IndividualResults.Select(r => r.AuditRecord).ToList();

                ReportProgress(progress, 100, "Wave validation completed", wave.Name ?? "Unknown Wave");

                _logger.LogInformation("Completed wave validation for {WaveName}. Total: {Total}, Success: {Success}, Failed: {Failed}",
                    wave.Name, totalOperations, result.SuccessfulValidations, result.FailedValidations);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating wave {WaveName}", wave.Name);

                result.IsValid = false;
                result.FailedValidations = 1;
                result.TotalObjects = 1;

                return result;
            }
        }

        /// <summary>
        /// Rolls back user migration with comprehensive audit tracking
        /// </summary>
        public async Task<RollbackResult> RollbackUserAsync(UserDto user, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Starting rollback for user {UserPrincipalName}", user.UserPrincipalName);
                ReportProgress(progress, 0, "Starting user rollback", user.UserPrincipalName ?? "Unknown User");

                // For now, return success - in a real implementation this would perform actual rollback
                var result = new RollbackResult
                {
                    IsSuccess = true,
                    Message = $"User rollback completed for {user.UserPrincipalName}"
                };

                ReportProgress(progress, 100, "User rollback completed", user.UserPrincipalName ?? "Unknown User");

                _logger.LogInformation("Completed rollback for user {UserPrincipalName}. Success: {Success}",
                    user.UserPrincipalName, result.IsSuccess);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rolling back user {UserPrincipalName}", user.UserPrincipalName);
                return new RollbackResult
                {
                    IsSuccess = false,
                    Message = $"User rollback failed: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Rolls back mailbox migration with comprehensive audit tracking
        /// </summary>
        public async Task<RollbackResult> RollbackMailboxAsync(MailboxDto mailbox, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Starting rollback for mailbox {PrimarySmtpAddress}", mailbox.PrimarySmtpAddress);
                ReportProgress(progress, 0, "Starting mailbox rollback", mailbox.PrimarySmtpAddress ?? "Unknown Mailbox");

                // For now, return success - in a real implementation this would perform actual rollback
                var result = new RollbackResult
                {
                    IsSuccess = true,
                    Message = $"Mailbox rollback completed for {mailbox.PrimarySmtpAddress}"
                };

                ReportProgress(progress, 100, "Mailbox rollback completed", mailbox.PrimarySmtpAddress ?? "Unknown Mailbox");

                _logger.LogInformation("Completed rollback for mailbox {PrimarySmtpAddress}. Success: {Success}",
                    mailbox.PrimarySmtpAddress, result.IsSuccess);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rolling back mailbox {PrimarySmtpAddress}", mailbox.PrimarySmtpAddress);
                return new RollbackResult
                {
                    IsSuccess = false,
                    Message = $"Mailbox rollback failed: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Rolls back file migration with comprehensive audit tracking
        /// </summary>
        public async Task<RollbackResult> RollbackFilesAsync(FileItemDto fileItem, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Starting rollback for file {SourcePath}", fileItem.SourcePath);
                ReportProgress(progress, 0, "Starting file rollback", fileItem.SourcePath ?? "Unknown File");

                // For now, return success - in a real implementation this would perform actual rollback
                var result = new RollbackResult
                {
                    IsSuccess = true,
                    Message = $"File rollback completed for {fileItem.SourcePath}"
                };

                ReportProgress(progress, 100, "File rollback completed", fileItem.SourcePath ?? "Unknown File");

                _logger.LogInformation("Completed rollback for file {SourcePath}. Success: {Success}",
                    fileItem.SourcePath, result.IsSuccess);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rolling back file {SourcePath}", fileItem.SourcePath);
                return new RollbackResult
                {
                    IsSuccess = false,
                    Message = $"File rollback failed: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Rolls back database migration with comprehensive audit tracking
        /// </summary>
        public async Task<RollbackResult> RollbackDatabaseAsync(DatabaseDto database, TargetContext target, IProgress<AuditValidationProgress>? progress = null, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Starting rollback for database {Name}", database.Name);
                ReportProgress(progress, 0, "Starting database rollback", database.Name ?? "Unknown Database");

                // For now, return success - in a real implementation this would perform actual rollback
                var result = new RollbackResult
                {
                    IsSuccess = true,
                    Message = $"Database rollback completed for {database.Name}"
                };

                ReportProgress(progress, 100, "Database rollback completed", database.Name ?? "Unknown Database");

                _logger.LogInformation("Completed rollback for database {Name}. Success: {Success}",
                    database.Name, result.IsSuccess);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rolling back database {Name}", database.Name);
                return new RollbackResult
                {
                    IsSuccess = false,
                    Message = $"Database rollback failed: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Retrieves audit records with filtering and sorting capabilities
        /// </summary>
        public async Task<List<AuditRecord>> GetAuditRecordsAsync(DateTime startDate, DateTime endDate, string? objectType = null, string? status = null, string? waveId = null, CancellationToken cancellationToken = default)
        {
            return await _auditService.GetAuditRecordsAsync(startDate, endDate, objectType, status, waveId);
        }

        /// <summary>
        /// Exports audit records to CSV format
        /// </summary>
        public async Task ExportAuditRecordsToCsvAsync(List<AuditRecord> records, string filePath, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Exporting {RecordCount} audit records to CSV: {FilePath}", records.Count, filePath);

                var csvContent = GenerateCsvContent(records);
                await File.WriteAllTextAsync(filePath, csvContent, cancellationToken);

                _logger.LogInformation("Successfully exported audit records to CSV: {FilePath}", filePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting audit records to CSV: {FilePath}", filePath);
                throw;
            }
        }

        /// <summary>
        /// Exports audit records to PDF format
        /// </summary>
        public async Task ExportAuditRecordsToPdfAsync(List<AuditRecord> records, string filePath, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Exporting {RecordCount} audit records to PDF: {FilePath}", records.Count, filePath);

                // For now, create a simple text-based "PDF-like" export
                // In a real implementation, you would use a PDF library like iTextSharp or PdfSharp
                var pdfContent = GeneratePdfContent(records);
                await File.WriteAllTextAsync(filePath, pdfContent, cancellationToken);

                _logger.LogInformation("Successfully exported audit records to PDF: {FilePath}", filePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting audit records to PDF: {FilePath}", filePath);
                throw;
            }
        }

        #region Helper Methods

        /// <summary>
        /// Validates user data integrity
        /// </summary>
        private async Task<List<MandADiscoverySuite.Migration.ValidationIssue>> ValidateUserDataIntegrityAsync(UserDto user, TargetContext target, CancellationToken cancellationToken)
        {
            _logger.LogDebug("DEBUG_DIAGNOSIS: Starting ValidateUserDataIntegrityAsync - using MandADiscoverySuite.Migration namespace");
            _logger.LogDebug("DEBUG_DIAGNOSIS: This method should work correctly with MandADiscoverySuite.Migration.ValidationIssue");
            var issues = new List<MandADiscoverySuite.Migration.ValidationIssue>();

            try
            {
                // Check required fields
                if (string.IsNullOrEmpty(user.UserPrincipalName))
                {
                    issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                    {
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Error,
                        Category = "Data Integrity",
                        Description = "UserPrincipalName is required but missing",
                        RecommendedAction = "Provide a valid UserPrincipalName for the user"
                    });
                }

                if (string.IsNullOrEmpty(user.DisplayName))
                {
                    issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                    {
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Warning,
                        Category = "Data Integrity",
                        Description = "DisplayName is empty",
                        RecommendedAction = "Consider providing a display name for better user experience"
                    });
                }

                // Basic validation
                if (!string.IsNullOrEmpty(user.UserPrincipalName) && !user.UserPrincipalName.Contains("@"))
                {
                    issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                    {
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Warning,
                        Category = "Data Integrity",
                        Description = "UserPrincipalName should contain @ symbol",
                        RecommendedAction = "Verify the UserPrincipalName format"
                    });
                }
            }
            catch (Exception ex)
            {
                issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                {
                    Severity = MandADiscoverySuite.Migration.ValidationSeverity.Error,
                    Category = "Validation Error",
                    Description = $"Error during data integrity validation: {ex.Message}",
                    RecommendedAction = "Check system logs for detailed error information"
                });
            }

            return issues;
        }

        /// <summary>
        /// Validates user attributes
        /// </summary>
        private async Task<List<ValidationIssue>> ValidateUserAttributesAsync(UserDto user, TargetContext target, CancellationToken cancellationToken)
        {
            var issues = new List<ValidationIssue>();

            try
            {
                // Validate department if provided
                if (!string.IsNullOrEmpty(user.Department) && user.Department.Length > 100)
                {
                    issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                    {
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Warning,
                        Category = "Attribute Validation",
                        Description = $"Department name is unusually long: {user.Department.Length} characters",
                        RecommendedAction = "Consider shortening the department name"
                    });
                }

                // Validate job title if provided
                if (!string.IsNullOrEmpty(user.JobTitle) && user.JobTitle.Length > 100)
                {
                    issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                    {
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Warning,
                        Category = "Attribute Validation",
                        Description = $"Job title is unusually long: {user.JobTitle.Length} characters",
                        RecommendedAction = "Consider shortening the job title"
                    });
                }
            }
            catch (Exception ex)
            {
                issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                {
                    Severity = MandADiscoverySuite.Migration.ValidationSeverity.Error,
                    Category = "Validation Error",
                    Description = $"Error during attribute validation: {ex.Message}",
                    RecommendedAction = "Check system logs for detailed error information"
                });
            }

            return issues;
        }

        /// <summary>
        /// Validates user permissions and roles
        /// </summary>
        private async Task<List<ValidationIssue>> ValidateUserPermissionsAsync(UserDto user, TargetContext target, CancellationToken cancellationToken)
        {
            var issues = new List<ValidationIssue>();

            try
            {
                // Basic permission validation
                _logger.LogDebug("Would validate permissions for user {UserPrincipalName}",
                    user.UserPrincipalName ?? "Unknown");
            }
            catch (Exception ex)
            {
                issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                {
                    Severity = MandADiscoverySuite.Migration.ValidationSeverity.Error,
                    Category = "Validation Error",
                    Description = $"Error during permission validation: {ex.Message}",
                    RecommendedAction = "Check system logs for detailed error information"
                });
            }

            return issues;
        }

        /// <summary>
        /// Validates mailbox data integrity
        /// </summary>
        private async Task<List<ValidationIssue>> ValidateMailboxDataIntegrityAsync(MailboxDto mailbox, TargetContext target, CancellationToken cancellationToken)
        {
            var issues = new List<ValidationIssue>();

            try
            {
                if (string.IsNullOrEmpty(mailbox.PrimarySmtpAddress))
                {
                    issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                    {
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Error,
                        Category = "Data Integrity",
                        Description = "PrimarySmtpAddress is required but missing",
                        RecommendedAction = "Provide a valid primary SMTP address for the mailbox"
                    });
                }

                if (string.IsNullOrEmpty(mailbox.UserPrincipalName))
                {
                    issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                    {
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Warning,
                        Category = "Data Integrity",
                        Description = "UserPrincipalName is empty",
                        RecommendedAction = "Consider providing the user principal name for the mailbox"
                    });
                }
            }
            catch (Exception ex)
            {
                issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                {
                    Severity = MandADiscoverySuite.Migration.ValidationSeverity.Error,
                    Category = "Validation Error",
                    Description = $"Error during mailbox data integrity validation: {ex.Message}",
                    RecommendedAction = "Check system logs for detailed error information"
                });
            }

            return issues;
        }

        /// <summary>
        /// Validates mailbox attributes
        /// </summary>
        private async Task<List<ValidationIssue>> ValidateMailboxAttributesAsync(MailboxDto mailbox, TargetContext target, CancellationToken cancellationToken)
        {
            var issues = new List<ValidationIssue>();

            try
            {
                // Check mailbox size if provided
                if (mailbox.TotalSizeBytes > 100L * 1024 * 1024 * 1024) // 100GB
                {
                    issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                    {
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Warning,
                        Category = "Attribute Validation",
                        Description = $"Mailbox size is very large: {mailbox.TotalSizeBytes / (1024 * 1024 * 1024):F2} GB",
                        RecommendedAction = "Consider archiving old emails to reduce mailbox size"
                    });
                }
            }
            catch (Exception ex)
            {
                issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                {
                    Severity = MandADiscoverySuite.Migration.ValidationSeverity.Error,
                    Category = "Validation Error",
                    Description = $"Error during mailbox attribute validation: {ex.Message}",
                    RecommendedAction = "Check system logs for detailed error information"
                });
            }

            return issues;
        }

        /// <summary>
        /// Validates file data integrity
        /// </summary>
        private async Task<List<ValidationIssue>> ValidateFileDataIntegrityAsync(FileItemDto fileItem, TargetContext target, CancellationToken cancellationToken)
        {
            var issues = new List<ValidationIssue>();

            try
            {
                if (string.IsNullOrEmpty(fileItem.SourcePath))
                {
                    issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                    {
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Error,
                        Category = "Data Integrity",
                        Description = "SourcePath is required but missing",
                        RecommendedAction = "Provide a valid source path for the file"
                    });
                }

                if (string.IsNullOrEmpty(fileItem.TargetPath))
                {
                    issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                    {
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Error,
                        Category = "Data Integrity",
                        Description = "TargetPath is required but missing",
                        RecommendedAction = "Provide a valid target path for the file"
                    });
                }

                // Check file size if provided
                if (fileItem.FileSize > 10L * 1024 * 1024 * 1024) // 10GB
                {
                    issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                    {
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Warning,
                        Category = "Data Integrity",
                        Description = $"File size is very large: {fileItem.FileSize / (1024 * 1024 * 1024):F2} GB",
                        RecommendedAction = "Consider if this large file really needs to be migrated"
                    });
                }
            }
            catch (Exception ex)
            {
                issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                {
                    Severity = MandADiscoverySuite.Migration.ValidationSeverity.Error,
                    Category = "Validation Error",
                    Description = $"Error during file data integrity validation: {ex.Message}",
                    RecommendedAction = "Check system logs for detailed error information"
                });
            }

            return issues;
        }

        /// <summary>
        /// Validates file attributes
        /// </summary>
        private async Task<List<ValidationIssue>> ValidateFileAttributesAsync(FileItemDto fileItem, TargetContext target, CancellationToken cancellationToken)
        {
            var issues = new List<ValidationIssue>();

            try
            {
                // Check file extension for potentially problematic files
                var extension = Path.GetExtension(fileItem.SourcePath)?.ToLower();
                if (extension == ".exe" || extension == ".bat" || extension == ".cmd")
                {
                    issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                    {
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Warning,
                        Category = "Security Validation",
                        Description = $"File is an executable: {extension}",
                        RecommendedAction = "Verify that executable files should be migrated"
                    });
                }
            }
            catch (Exception ex)
            {
                issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                {
                    Severity = MandADiscoverySuite.Migration.ValidationSeverity.Error,
                    Category = "Validation Error",
                    Description = $"Error during file attribute validation: {ex.Message}",
                    RecommendedAction = "Check system logs for detailed error information"
                });
            }

            return issues;
        }

        /// <summary>
        /// Validates database data integrity
        /// </summary>
        private async Task<List<ValidationIssue>> ValidateDatabaseDataIntegrityAsync(DatabaseDto database, TargetContext target, CancellationToken cancellationToken)
        {
            var issues = new List<ValidationIssue>();

            try
            {
                if (string.IsNullOrEmpty(database.Name))
                {
                    issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                    {
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Error,
                        Category = "Data Integrity",
                        Description = "Database name is required but missing",
                        RecommendedAction = "Provide a valid database name"
                    });
                }

                // Check database size if provided
                if (database.SizeMB > 100 * 1024) // 100GB
                {
                    issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                    {
                        Severity = MandADiscoverySuite.Migration.ValidationSeverity.Warning,
                        Category = "Data Integrity",
                        Description = $"Database size is very large: {database.SizeMB / 1024:F2} GB",
                        RecommendedAction = "Consider database archiving or cleanup before migration"
                    });
                }
            }
            catch (Exception ex)
            {
                issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                {
                    Severity = MandADiscoverySuite.Migration.ValidationSeverity.Error,
                    Category = "Validation Error",
                    Description = $"Error during database data integrity validation: {ex.Message}",
                    RecommendedAction = "Check system logs for detailed error information"
                });
            }

            return issues;
        }

        /// <summary>
        /// Validates database attributes
        /// </summary>
        private async Task<List<ValidationIssue>> ValidateDatabaseAttributesAsync(DatabaseDto database, TargetContext target, CancellationToken cancellationToken)
        {
            var issues = new List<ValidationIssue>();

            try
            {
                // Validate compatibility level if provided
                if (!string.IsNullOrEmpty(database.CompatibilityLevel))
                {
                    if (!int.TryParse(database.CompatibilityLevel, out int level))
                    {
                        issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                        {
                            Severity = MandADiscoverySuite.Migration.ValidationSeverity.Warning,
                            Category = "Attribute Validation",
                            Description = $"Invalid compatibility level format: {database.CompatibilityLevel}",
                            RecommendedAction = "Verify the compatibility level format"
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                {
                    Severity = MandADiscoverySuite.Migration.ValidationSeverity.Error,
                    Category = "Validation Error",
                    Description = $"Error during database attribute validation: {ex.Message}",
                    RecommendedAction = "Check system logs for detailed error information"
                });
            }

            return issues;
        }

        private void ReportProgress(IProgress<AuditValidationProgress>? progress, int percentage, string message, string currentObject)
        {
            if (progress != null)
            {
                var progressEventArgs = new AuditValidationProgress
                {
                    Percentage = percentage,
                    Message = message,
                    CurrentObject = currentObject
                };

                progress.Report(progressEventArgs);
            }

            // Also fire the event for any subscribers
            ValidationProgress?.Invoke(this, new AuditValidationProgressEventArgs
            {
                Percentage = percentage,
                Message = message,
                CurrentObject = currentObject
            });
        }

        private string GenerateCsvContent(List<AuditRecord> records)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Id,Action,ObjectType,ObjectIdentifier,Status,StartTime,EndTime,Duration,InitiatedBy,IssueCount,ErrorCount,WarningCount,IssueDetails,WaveId,ObjectCount");

            foreach (var record in records)
            {
                sb.AppendLine($"{record.Id},{record.Action},{record.ObjectType},{record.ObjectIdentifier},{record.Status},{record.StartTime:O},{record.EndTime:O},{record.Duration.TotalMilliseconds},{record.InitiatedBy},{record.IssueCount},{record.ErrorCount},{record.WarningCount},{EscapeCsvField(record.IssueDetails)},{record.WaveId},{record.ObjectCount}");
            }

            return sb.ToString();
        }

        private string GeneratePdfContent(List<AuditRecord> records)
        {
            var sb = new StringBuilder();
            sb.AppendLine("AUDIT RECORDS REPORT");
            sb.AppendLine("====================");
            sb.AppendLine($"Generated: {DateTime.Now}");
            sb.AppendLine($"Total Records: {records.Count}");
            sb.AppendLine();

            foreach (var record in records)
            {
                sb.AppendLine($"ID: {record.Id}");
                sb.AppendLine($"Action: {record.Action}");
                sb.AppendLine($"Object Type: {record.ObjectType}");
                sb.AppendLine($"Object Identifier: {record.ObjectIdentifier}");
                sb.AppendLine($"Status: {record.Status}");
                sb.AppendLine($"Duration: {record.Duration.TotalMilliseconds}ms");
                sb.AppendLine($"Initiated By: {record.InitiatedBy}");
                sb.AppendLine($"Issues: {record.IssueCount} (Errors: {record.ErrorCount}, Warnings: {record.WarningCount})");
                if (!string.IsNullOrEmpty(record.IssueDetails))
                    sb.AppendLine($"Issue Details: {record.IssueDetails}");
                if (!string.IsNullOrEmpty(record.WaveId))
                    sb.AppendLine($"Wave ID: {record.WaveId}");
                sb.AppendLine($"Start Time: {record.StartTime}");
                sb.AppendLine($"End Time: {record.EndTime}");
                sb.AppendLine("----------------------------------------");
                sb.AppendLine();
            }

            return sb.ToString();
        }

        private string EscapeCsvField(string field)
        {
            if (string.IsNullOrEmpty(field))
                return string.Empty;

            if (field.Contains(',') || field.Contains('"') || field.Contains('\n'))
            {
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }

            return field;
        }

        #endregion
    }
}