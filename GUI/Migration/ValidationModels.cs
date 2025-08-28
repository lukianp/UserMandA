using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Validation severity levels for migration validation results.
    /// </summary>
    public enum ValidationSeverity
    {
        Success,
        Warning, 
        Error,
        Critical
    }

    /// <summary>
    /// Represents the result of a validation operation.
    /// </summary>
    public class ValidationResult
    {
        /// <summary>
        /// Unique identifier for the validation result.
        /// </summary>
        public string Id { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// The object that was validated (user, mailbox, file, database).
        /// </summary>
        public object ValidatedObject { get; set; } = new();

        /// <summary>
        /// Type of object that was validated.
        /// </summary>
        public string ObjectType { get; set; } = string.Empty;

        /// <summary>
        /// Display name or identifier of the validated object.
        /// </summary>
        public string ObjectName { get; set; } = string.Empty;

        /// <summary>
        /// Overall validation status.
        /// </summary>
        public ValidationSeverity Severity { get; set; }

        /// <summary>
        /// Summary message of the validation result.
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Detailed validation findings.
        /// </summary>
        public List<ValidationIssue> Issues { get; } = new();

        /// <summary>
        /// When the validation was performed.
        /// </summary>
        public DateTime ValidatedAt { get; set; } = DateTime.Now;

        /// <summary>
        /// Whether this object can be rolled back.
        /// </summary>
        public bool CanRollback { get; set; } = true;

        /// <summary>
        /// Whether rollback is currently in progress.
        /// </summary>
        public bool RollbackInProgress { get; set; }

        /// <summary>
        /// Creates a successful validation result.
        /// </summary>
        public static ValidationResult Success(object obj, string objectType, string objectName, string message = "Validation passed")
        {
            return new ValidationResult
            {
                ValidatedObject = obj,
                ObjectType = objectType,
                ObjectName = objectName,
                Severity = ValidationSeverity.Success,
                Message = message
            };
        }

        /// <summary>
        /// Creates a failed validation result with issues.
        /// </summary>
        public static ValidationResult Failed(object obj, string objectType, string objectName, string message, IEnumerable<ValidationIssue> issues)
        {
            var result = new ValidationResult
            {
                ValidatedObject = obj,
                ObjectType = objectType,
                ObjectName = objectName,
                Severity = ValidationSeverity.Error,
                Message = message
            };
            result.Issues.AddRange(issues);
            return result;
        }
    }

    /// <summary>
    /// Represents a specific validation issue found during post-migration validation.
    /// </summary>
    public class ValidationIssue
    {
        /// <summary>
        /// Severity of this specific issue.
        /// </summary>
        public ValidationSeverity Severity { get; set; }

        /// <summary>
        /// Category of the validation check.
        /// </summary>
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// Description of the issue.
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Recommended action to resolve the issue.
        /// </summary>
        public string RecommendedAction { get; set; } = string.Empty;

        /// <summary>
        /// Technical details about the issue.
        /// </summary>
        public string TechnicalDetails { get; set; } = string.Empty;
    }

    /// <summary>
    /// Represents the result of a rollback operation.
    /// </summary>
    public class RollbackResult
    {
        /// <summary>
        /// Whether the rollback was successful.
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Message describing the rollback result.
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Any errors that occurred during rollback.
        /// </summary>
        public List<string> Errors { get; } = new();

        /// <summary>
        /// Any warnings that occurred during rollback.
        /// </summary>
        public List<string> Warnings { get; } = new();

        /// <summary>
        /// When the rollback was performed.
        /// </summary>
        public DateTime RolledBackAt { get; set; } = DateTime.Now;

        /// <summary>
        /// Creates a successful rollback result.
        /// </summary>
        public static RollbackResult Succeeded(string message = "Rollback completed successfully")
        {
            return new RollbackResult { Success = true, Message = message };
        }

        /// <summary>
        /// Creates a failed rollback result.
        /// </summary>
        public static RollbackResult Failed(string message, IEnumerable<string>? errors = null)
        {
            var result = new RollbackResult { Success = false, Message = message };
            if (errors != null)
                result.Errors.AddRange(errors);
            return result;
        }
    }

    /// <summary>
    /// Progress information for validation operations.
    /// </summary>
    public class ValidationProgress
    {
        /// <summary>
        /// Current step being validated.
        /// </summary>
        public string CurrentStep { get; set; } = string.Empty;

        /// <summary>
        /// Percentage complete (0-100).
        /// </summary>
        public int PercentageComplete { get; set; }

        /// <summary>
        /// Number of objects validated so far.
        /// </summary>
        public int ObjectsValidated { get; set; }

        /// <summary>
        /// Total number of objects to validate.
        /// </summary>
        public int TotalObjects { get; set; }

        /// <summary>
        /// Any status message for the current operation.
        /// </summary>
        public string StatusMessage { get; set; } = string.Empty;
    }
}