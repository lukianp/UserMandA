using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Main service for post-migration validation and rollback operations.
    /// Orchestrates validation across all object types and coordinates rollback activities.
    /// </summary>
    public class PostMigrationValidationService
    {
        private readonly IUserValidationProvider _userValidator;
        private readonly IMailboxValidationProvider _mailboxValidator;
        private readonly IFileValidationProvider _fileValidator;
        private readonly ISqlValidationProvider _sqlValidator;

        public PostMigrationValidationService(
            IUserValidationProvider userValidator,
            IMailboxValidationProvider mailboxValidator,
            IFileValidationProvider fileValidator,
            ISqlValidationProvider sqlValidator)
        {
            _userValidator = userValidator;
            _mailboxValidator = mailboxValidator;
            _fileValidator = fileValidator;
            _sqlValidator = sqlValidator;
        }

        /// <summary>
        /// Validates a single user migration.
        /// </summary>
        public async Task<ValidationResult> ValidateUserAsync(UserDto user, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            try
            {
                return await _userValidator.ValidateUserAsync(user, target, progress);
            }
            catch (Exception ex)
            {
                var issues = new List<ValidationIssue>
                {
                    new ValidationIssue
                    {
                        Severity = ValidationSeverity.Critical,
                        Category = "Service Error",
                        Description = $"User validation service failed: {ex.Message}",
                        RecommendedAction = "Check service configuration and try again",
                        TechnicalDetails = ex.ToString()
                    }
                };

                return ValidationResult.Failed(user, "User", user.DisplayName, 
                    "User validation failed", issues);
            }
        }

        /// <summary>
        /// Validates a single mailbox migration.
        /// </summary>
        public async Task<ValidationResult> ValidateMailboxAsync(MailboxDto mailbox, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            try
            {
                return await _mailboxValidator.ValidateMailboxAsync(mailbox, target, progress);
            }
            catch (Exception ex)
            {
                var issues = new List<ValidationIssue>
                {
                    new ValidationIssue
                    {
                        Severity = ValidationSeverity.Critical,
                        Category = "Service Error",
                        Description = $"Mailbox validation service failed: {ex.Message}",
                        RecommendedAction = "Check service configuration and try again",
                        TechnicalDetails = ex.ToString()
                    }
                };

                return ValidationResult.Failed(mailbox, "Mailbox", mailbox.PrimarySmtpAddress, 
                    "Mailbox validation failed", issues);
            }
        }

        /// <summary>
        /// Validates a single file migration.
        /// </summary>
        public async Task<ValidationResult> ValidateFilesAsync(FileItemDto fileItem, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            try
            {
                return await _fileValidator.ValidateFilesAsync(fileItem, target, progress);
            }
            catch (Exception ex)
            {
                var issues = new List<ValidationIssue>
                {
                    new ValidationIssue
                    {
                        Severity = ValidationSeverity.Critical,
                        Category = "Service Error",
                        Description = $"File validation service failed: {ex.Message}",
                        RecommendedAction = "Check service configuration and try again",
                        TechnicalDetails = ex.ToString()
                    }
                };

                return ValidationResult.Failed(fileItem, "File", fileItem.SourcePath, 
                    "File validation failed", issues);
            }
        }

        /// <summary>
        /// Validates a single SQL database migration.
        /// </summary>
        public async Task<ValidationResult> ValidateSqlAsync(DatabaseDto database, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            try
            {
                return await _sqlValidator.ValidateSqlAsync(database, target, progress);
            }
            catch (Exception ex)
            {
                var issues = new List<ValidationIssue>
                {
                    new ValidationIssue
                    {
                        Severity = ValidationSeverity.Critical,
                        Category = "Service Error",
                        Description = $"SQL validation service failed: {ex.Message}",
                        RecommendedAction = "Check service configuration and try again",
                        TechnicalDetails = ex.ToString()
                    }
                };

                return ValidationResult.Failed(database, "Database", database.Name, 
                    "Database validation failed", issues);
            }
        }

        /// <summary>
        /// Validates all objects in a migration wave.
        /// </summary>
        public async Task<IList<ValidationResult>> ValidateWaveAsync(MigrationWave wave, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            var results = new List<ValidationResult>();
            var totalObjects = wave.Users.Count + wave.Mailboxes.Count + wave.Files.Count + wave.Databases.Count;
            var currentObject = 0;

            try
            {
                // Create a progress reporter that updates the main progress
                var individualProgress = new Progress<ValidationProgress>(p =>
                {
                    var overallProgress = new ValidationProgress
                    {
                        CurrentStep = p.CurrentStep,
                        StatusMessage = p.StatusMessage,
                        ObjectsValidated = currentObject,
                        TotalObjects = totalObjects,
                        PercentageComplete = totalObjects > 0 ? (currentObject * 100) / totalObjects : 100
                    };
                    progress?.Report(overallProgress);
                });

                // Validate users
                foreach (var user in wave.Users)
                {
                    currentObject++;
                    progress?.Report(new ValidationProgress
                    {
                        CurrentStep = $"Validating user {user.DisplayName}",
                        StatusMessage = $"Processing user {currentObject} of {totalObjects}",
                        ObjectsValidated = currentObject,
                        TotalObjects = totalObjects,
                        PercentageComplete = (currentObject * 100) / totalObjects
                    });

                    var result = await ValidateUserAsync(user, target, individualProgress);
                    results.Add(result);
                }

                // Validate mailboxes
                foreach (var mailbox in wave.Mailboxes)
                {
                    currentObject++;
                    progress?.Report(new ValidationProgress
                    {
                        CurrentStep = $"Validating mailbox {mailbox.PrimarySmtpAddress}",
                        StatusMessage = $"Processing mailbox {currentObject} of {totalObjects}",
                        ObjectsValidated = currentObject,
                        TotalObjects = totalObjects,
                        PercentageComplete = (currentObject * 100) / totalObjects
                    });

                    var result = await ValidateMailboxAsync(mailbox, target, individualProgress);
                    results.Add(result);
                }

                // Validate files
                foreach (var file in wave.Files)
                {
                    currentObject++;
                    progress?.Report(new ValidationProgress
                    {
                        CurrentStep = $"Validating files {file.SourcePath}",
                        StatusMessage = $"Processing file {currentObject} of {totalObjects}",
                        ObjectsValidated = currentObject,
                        TotalObjects = totalObjects,
                        PercentageComplete = (currentObject * 100) / totalObjects
                    });

                    var result = await ValidateFilesAsync(file, target, individualProgress);
                    results.Add(result);
                }

                // Validate databases
                foreach (var database in wave.Databases)
                {
                    currentObject++;
                    progress?.Report(new ValidationProgress
                    {
                        CurrentStep = $"Validating database {database.Name}",
                        StatusMessage = $"Processing database {currentObject} of {totalObjects}",
                        ObjectsValidated = currentObject,
                        TotalObjects = totalObjects,
                        PercentageComplete = (currentObject * 100) / totalObjects
                    });

                    var result = await ValidateSqlAsync(database, target, individualProgress);
                    results.Add(result);
                }

                progress?.Report(new ValidationProgress
                {
                    CurrentStep = "Wave validation complete",
                    StatusMessage = $"Validated {results.Count} objects",
                    ObjectsValidated = totalObjects,
                    TotalObjects = totalObjects,
                    PercentageComplete = 100
                });

                return results;
            }
            catch (Exception ex)
            {
                // Add a general error result if wave validation fails
                var errorResult = new ValidationResult
                {
                    Id = Guid.NewGuid().ToString(),
                    ValidatedObject = wave,
                    ObjectType = "Wave",
                    ObjectName = "Migration Wave",
                    Severity = ValidationSeverity.Critical,
                    Message = "Wave validation failed due to system error",
                    Issues = 
                    {
                        new ValidationIssue
                        {
                            Severity = ValidationSeverity.Critical,
                            Category = "System Error",
                            Description = $"Wave validation failed: {ex.Message}",
                            RecommendedAction = "Check system status and retry validation",
                            TechnicalDetails = ex.ToString()
                        }
                    }
                };

                results.Add(errorResult);
                return results;
            }
        }

        /// <summary>
        /// Rolls back a user migration.
        /// </summary>
        public async Task<RollbackResult> RollbackUserAsync(UserDto user, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            try
            {
                return await _userValidator.RollbackUserAsync(user, target, progress);
            }
            catch (Exception ex)
            {
                return RollbackResult.Failed($"User rollback failed: {ex.Message}", new[] { ex.ToString() });
            }
        }

        /// <summary>
        /// Rolls back a mailbox migration.
        /// </summary>
        public async Task<RollbackResult> RollbackMailboxAsync(MailboxDto mailbox, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            try
            {
                return await _mailboxValidator.RollbackMailboxAsync(mailbox, target, progress);
            }
            catch (Exception ex)
            {
                return RollbackResult.Failed($"Mailbox rollback failed: {ex.Message}", new[] { ex.ToString() });
            }
        }

        /// <summary>
        /// Rolls back a file migration.
        /// </summary>
        public async Task<RollbackResult> RollbackFilesAsync(FileItemDto fileItem, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            try
            {
                return await _fileValidator.RollbackFilesAsync(fileItem, target, progress);
            }
            catch (Exception ex)
            {
                return RollbackResult.Failed($"File rollback failed: {ex.Message}", new[] { ex.ToString() });
            }
        }

        /// <summary>
        /// Rolls back a SQL database migration.
        /// </summary>
        public async Task<RollbackResult> RollbackSqlAsync(DatabaseDto database, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            try
            {
                return await _sqlValidator.RollbackSqlAsync(database, target, progress);
            }
            catch (Exception ex)
            {
                return RollbackResult.Failed($"Database rollback failed: {ex.Message}", new[] { ex.ToString() });
            }
        }

        /// <summary>
        /// Rolls back a specific validation result based on its object type.
        /// </summary>
        public async Task<RollbackResult> RollbackValidationResultAsync(ValidationResult validationResult, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            try
            {
                return validationResult.ObjectType.ToLowerInvariant() switch
                {
                    "user" => await RollbackUserAsync((UserDto)validationResult.ValidatedObject, target, progress),
                    "mailbox" => await RollbackMailboxAsync((MailboxDto)validationResult.ValidatedObject, target, progress),
                    "file" => await RollbackFilesAsync((FileItemDto)validationResult.ValidatedObject, target, progress),
                    "database" => await RollbackSqlAsync((DatabaseDto)validationResult.ValidatedObject, target, progress),
                    _ => RollbackResult.Failed($"Unknown object type for rollback: {validationResult.ObjectType}")
                };
            }
            catch (Exception ex)
            {
                return RollbackResult.Failed($"Rollback failed: {ex.Message}", new[] { ex.ToString() });
            }
        }

        /// <summary>
        /// Rolls back multiple validation results.
        /// </summary>
        public async Task<IList<RollbackResult>> RollbackMultipleAsync(IList<ValidationResult> validationResults, TargetContext target, IProgress<ValidationProgress>? progress = null)
        {
            var rollbackResults = new List<RollbackResult>();
            var totalObjects = validationResults.Count;
            var currentObject = 0;

            foreach (var validationResult in validationResults)
            {
                currentObject++;
                progress?.Report(new ValidationProgress
                {
                    CurrentStep = $"Rolling back {validationResult.ObjectType} {validationResult.ObjectName}",
                    StatusMessage = $"Processing rollback {currentObject} of {totalObjects}",
                    ObjectsValidated = currentObject,
                    TotalObjects = totalObjects,
                    PercentageComplete = (currentObject * 100) / totalObjects
                });

                var rollbackResult = await RollbackValidationResultAsync(validationResult, target, progress);
                rollbackResults.Add(rollbackResult);
            }

            progress?.Report(new ValidationProgress
            {
                CurrentStep = "Rollback operations complete",
                StatusMessage = $"Completed {rollbackResults.Count} rollback operations",
                ObjectsValidated = totalObjects,
                TotalObjects = totalObjects,
                PercentageComplete = 100
            });

            return rollbackResults;
        }

        /// <summary>
        /// Gets summary statistics for a collection of validation results.
        /// </summary>
        public ValidationSummary GetValidationSummary(IList<ValidationResult> validationResults)
        {
            return new ValidationSummary
            {
                TotalObjects = validationResults.Count,
                SuccessfulObjects = validationResults.Count(r => r.Severity == ValidationSeverity.Success),
                WarningObjects = validationResults.Count(r => r.Severity == ValidationSeverity.Warning),
                ErrorObjects = validationResults.Count(r => r.Severity == ValidationSeverity.Error),
                CriticalObjects = validationResults.Count(r => r.Severity == ValidationSeverity.Critical),
                TotalIssues = validationResults.Sum(r => r.Issues.Count),
                ObjectTypes = validationResults.GroupBy(r => r.ObjectType)
                    .ToDictionary(g => g.Key, g => g.Count())
            };
        }
    }

    /// <summary>
    /// Summary statistics for validation results.
    /// </summary>
    public class ValidationSummary
    {
        public int TotalObjects { get; set; }
        public int SuccessfulObjects { get; set; }
        public int WarningObjects { get; set; }
        public int ErrorObjects { get; set; }
        public int CriticalObjects { get; set; }
        public int TotalIssues { get; set; }
        public Dictionary<string, int> ObjectTypes { get; set; } = new();

        public double SuccessRate => TotalObjects > 0 ? (SuccessfulObjects * 100.0) / TotalObjects : 100.0;
        public bool HasErrors => ErrorObjects > 0 || CriticalObjects > 0;
        public bool HasWarnings => WarningObjects > 0;
    }
}