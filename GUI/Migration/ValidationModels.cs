using System;
using System.Collections.Generic;
using System.Linq;

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
        /// Start time of the validation operation.
        /// </summary>
        public DateTime StartTime { get; set; } = DateTime.Now;

        /// <summary>
        /// Main error message if validation failed.
        /// </summary>
        public string ErrorMessage { get; set; } = string.Empty;

        /// <summary>
        /// Collection of validation errors.
        /// </summary>
        public List<string> Errors { get; set; } = new List<string>();
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
        /// Whether the validation is considered successful overall.
        /// </summary>
        public bool IsValid => Severity == ValidationSeverity.Success || Severity == ValidationSeverity.Warning;

        /// <summary>
        /// Collection of validation warnings.
        /// </summary>
        public List<ValidationIssue> Warnings => Issues.Where(i => i.Severity == ValidationSeverity.Warning).ToList();

        /// <summary>
        /// Whether this object can be rolled back.
        /// </summary>
        public bool CanRollback { get; set; } = true;

        /// <summary>
        /// Whether rollback is currently in progress.
        /// </summary>
        public bool RollbackInProgress { get; set; }

        /// <summary>
        /// Properties required by GpoMigrator.
        /// </summary>
        public string ValidationType { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
        public string ExecutedBy { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public DateTime? EndTime { get; set; }

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

        /// <summary>
        /// Creates a failed validation result with error message.
        /// </summary>
        public static ValidationResult Failed(string message, string errors)
        {
            return new ValidationResult
            {
                Severity = ValidationSeverity.Error,
                Message = message,
                ErrorMessage = errors,
                IsSuccess = false
            };
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
        /// Name of the item that has this validation issue.
        /// </summary>
        public string ItemName { get; set; } = string.Empty;

        /// <summary>
        /// Technical details about the issue.
        /// </summary>
        public string TechnicalDetails { get; set; } = string.Empty;

        /// <summary>
        /// Message describing the issue (alias for Description for compatibility).
        /// </summary>
        public string Message 
        { 
            get => Description; 
            set => Description = value; 
        }

        /// <summary>
        /// ID of the item that has this issue.
        /// </summary>
        public string ItemId { get; set; } = string.Empty;
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