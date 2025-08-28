using System;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Migration
{
    /// <summary>
    /// Base interface for all validation providers.
    /// </summary>
    public interface IValidationProvider
    {
        /// <summary>
        /// The type of object this validator handles.
        /// </summary>
        string ObjectType { get; }

        /// <summary>
        /// Whether this provider supports rollback operations.
        /// </summary>
        bool SupportsRollback { get; }
    }

    /// <summary>
    /// Validates migrated user objects and can roll them back.
    /// </summary>
    public interface IUserValidationProvider : IValidationProvider
    {
        /// <summary>
        /// Validates that a user was migrated correctly.
        /// </summary>
        Task<ValidationResult> ValidateUserAsync(UserDto user, TargetContext target, IProgress<ValidationProgress>? progress = null);

        /// <summary>
        /// Rolls back a failed user migration.
        /// </summary>
        Task<RollbackResult> RollbackUserAsync(UserDto user, TargetContext target, IProgress<ValidationProgress>? progress = null);
    }

    /// <summary>
    /// Validates migrated mailbox objects and can roll them back.
    /// </summary>
    public interface IMailboxValidationProvider : IValidationProvider
    {
        /// <summary>
        /// Validates that a mailbox was migrated correctly.
        /// </summary>
        Task<ValidationResult> ValidateMailboxAsync(MailboxDto mailbox, TargetContext target, IProgress<ValidationProgress>? progress = null);

        /// <summary>
        /// Rolls back a failed mailbox migration.
        /// </summary>
        Task<RollbackResult> RollbackMailboxAsync(MailboxDto mailbox, TargetContext target, IProgress<ValidationProgress>? progress = null);
    }

    /// <summary>
    /// Validates migrated file objects and can roll them back.
    /// </summary>
    public interface IFileValidationProvider : IValidationProvider
    {
        /// <summary>
        /// Validates that files were migrated correctly.
        /// </summary>
        Task<ValidationResult> ValidateFilesAsync(FileItemDto fileItem, TargetContext target, IProgress<ValidationProgress>? progress = null);

        /// <summary>
        /// Rolls back a failed file migration.
        /// </summary>
        Task<RollbackResult> RollbackFilesAsync(FileItemDto fileItem, TargetContext target, IProgress<ValidationProgress>? progress = null);
    }

    /// <summary>
    /// Validates migrated SQL database objects and can roll them back.
    /// </summary>
    public interface ISqlValidationProvider : IValidationProvider
    {
        /// <summary>
        /// Validates that a SQL database was migrated correctly.
        /// </summary>
        Task<ValidationResult> ValidateSqlAsync(DatabaseDto database, TargetContext target, IProgress<ValidationProgress>? progress = null);

        /// <summary>
        /// Rolls back a failed SQL database migration.
        /// </summary>
        Task<RollbackResult> RollbackSqlAsync(DatabaseDto database, TargetContext target, IProgress<ValidationProgress>? progress = null);
    }
}