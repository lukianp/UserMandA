using System;
using System.Collections.Generic;
using System.Security.AccessControl;

namespace MandADiscoverySuite.Models
{
    #region Enums
    public enum FileSystemMigrationStatus
    {
        Pending,
        InProgress,
        Completed,
        Failed,
        Cancelled,
        Paused
    }

    public enum MigrationPhase
    {
        Unknown,
        Discovery,
        DirectoryCreation,
        FileMigration,
        PermissionApplication,
        Verification,
        Completed
    }

    public enum FileConflictResolution
    {
        Overwrite,
        Skip,
        Rename
    }

    public enum FileSystemErrorType
    {
        AccessDenied,
        FileNotFound,
        DirectoryNotFound,
        FileCopyFailure,
        PermissionFailure,
        IntegrityFailure,
        Unknown
    }

    public enum MigrationItemType
    {
        File,
        Directory
    }
    #endregion

    #region Request Models
    public class FileSystemMigrationRequest
    {
        public string RequestId { get; set; } = Guid.NewGuid().ToString();
        public string SourcePath { get; set; }
        public string DestinationPath { get; set; }
        public bool PreservePermissions { get; set; } = true;
        public bool PreserveTimestamps { get; set; } = true;
        public bool PreserveAttributes { get; set; } = true;
        public bool OverwriteExisting { get; set; } = false;
        public bool SkipExistingFiles { get; set; } = false;
        public bool VerifyIntegrity { get; set; } = true;
        public FileConflictResolution ConflictResolution { get; set; } = FileConflictResolution.Rename;
        
        public List<string> ExcludePatterns { get; set; } = new List<string>();
        public List<string> ExcludedExtensions { get; set; } = new List<string>();
        public long? MaxFileSizeBytes { get; set; }
        public int? MaxConcurrency { get; set; } = 10;
        
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
        public DateTime CreatedTime { get; set; } = DateTime.Now;
        public string CreatedBy { get; set; }
    }
    #endregion

    #region Result Models
    public class FileSystemMigrationResult
    {
        public string RequestId { get; set; }
        public FileSystemMigrationStatus Status { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public TimeSpan Duration { get; set; }
        
        public int TotalFiles { get; set; }
        public int TotalDirectories { get; set; }
        public long TotalSizeBytes { get; set; }
        
        public int SuccessfulFiles { get; set; }
        public int FailedFiles { get; set; }
        public long MigratedSizeBytes { get; set; }
        
        public bool IntegrityVerified { get; set; }
        public string ErrorMessage { get; set; }
        public List<FileSystemMigrationError> Errors { get; set; } = new List<FileSystemMigrationError>();
        
        public Dictionary<string, object> Statistics { get; set; } = new Dictionary<string, object>();
    }

    public class FileSystemMigrationProgress
    {
        public string RequestId { get; set; }
        public FileSystemMigrationStatus Status { get; set; }
        public MigrationPhase CurrentPhase { get; set; }
        public int ProgressPercentage { get; set; }
        public string CurrentMessage { get; set; }
        public int ProcessedItems { get; set; }
        public int TotalItems { get; set; }
        public long ProcessedBytes { get; set; }
        public long TotalBytes { get; set; }
        public double TransferRateMBps { get; set; }
        public TimeSpan? EstimatedTimeRemaining { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.Now;
    }

    public class FileSystemMigrationError
    {
        public string Path { get; set; }
        public string ErrorMessage { get; set; }
        public FileSystemErrorType ErrorType { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public string StackTrace { get; set; }
        public Dictionary<string, object> AdditionalData { get; set; } = new Dictionary<string, object>();
    }
    #endregion

    #region Discovery Models
    public class FileSystemDiscoveryResult
    {
        public int TotalFiles { get; set; }
        public int TotalDirectories { get; set; }
        public long TotalSizeBytes { get; set; }
        
        public List<DirectoryMigrationItem> DirectoryStructure { get; set; } = new List<DirectoryMigrationItem>();
        public List<FileMigrationItem> FileItems { get; set; } = new List<FileMigrationItem>();
        
        public List<string> AccessDeniedDirectories { get; set; } = new List<string>();
        public List<string> ErrorDirectories { get; set; } = new List<string>();
    }

    public class DirectoryMigrationItem
    {
        public string SourcePath { get; set; }
        public string DestinationPath { get; set; }
        public string Name { get; set; }
        public DateTime CreatedTime { get; set; }
        public DateTime ModifiedTime { get; set; }
        public DirectorySecurity SecurityDescriptor { get; set; }
        public Dictionary<string, object> Attributes { get; set; } = new Dictionary<string, object>();
    }

    public class FileMigrationItem
    {
        public string SourcePath { get; set; }
        public string DestinationPath { get; set; }
        public string Name { get; set; }
        public string Extension { get; set; }
        public long SizeBytes { get; set; }
        public DateTime CreatedTime { get; set; }
        public DateTime ModifiedTime { get; set; }
        public FileSecurity SecurityDescriptor { get; set; }
        public string Checksum { get; set; }
        public Dictionary<string, object> Attributes { get; set; } = new Dictionary<string, object>();
    }
    #endregion

    #region Event Args
    public class FileSystemMigrationProgressEventArgs : EventArgs
    {
        public string RequestId { get; set; }
        public MigrationPhase Phase { get; set; }
        public int ProgressPercentage { get; set; }
        public string Message { get; set; }
        public int ProcessedItems { get; set; }
        public int TotalItems { get; set; }
        public long ProcessedBytes { get; set; }
        public long TotalBytes { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }

    public class FileSystemMigrationErrorEventArgs : EventArgs
    {
        public string RequestId { get; set; }
        public Exception Error { get; set; }
        public MigrationPhase Phase { get; set; }
        public string ItemPath { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }

    public class FileSystemMigrationItemCompleteEventArgs : EventArgs
    {
        public string RequestId { get; set; }
        public MigrationItemType ItemType { get; set; }
        public string SourcePath { get; set; }
        public string DestinationPath { get; set; }
        public long SizeBytes { get; set; }
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }
    #endregion

    #region Integration Models
    /// <summary>
    /// Extended migration item that includes file system migration capabilities
    /// </summary>
    public class FileSystemMigrationItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string DisplayName { get; set; }
        public MigrationStatus Status { get; set; } = MigrationStatus.NotStarted;
        public FileSystemMigrationRequest MigrationRequest { get; set; }
        public FileSystemMigrationResult MigrationResult { get; set; }
        public string SourcePath { get; set; }
        public string DestinationPath { get; set; }
        public long SizeBytes { get; set; }
        public bool PreservePermissions { get; set; } = true;
        public bool PreserveTimestamps { get; set; } = true;
        public FileConflictResolution ConflictResolution { get; set; } = FileConflictResolution.Rename;
        
        public string GetDisplayText()
        {
            return $"File System Migration: {System.IO.Path.GetFileName(SourcePath)} → {System.IO.Path.GetFileName(DestinationPath)}";
        }
        
        public Dictionary<string, object> GetMigrationMetadata()
        {
            var metadata = new Dictionary<string, object>
            {
                ["SourcePath"] = SourcePath,
                ["DestinationPath"] = DestinationPath,
                ["SizeBytes"] = SizeBytes,
                ["PreservePermissions"] = PreservePermissions,
                ["PreserveTimestamps"] = PreserveTimestamps,
                ["ConflictResolution"] = ConflictResolution.ToString()
            };
            
            if (MigrationResult != null)
            {
                metadata["Status"] = MigrationResult.Status.ToString();
                metadata["Duration"] = MigrationResult.Duration.ToString();
                metadata["SuccessfulFiles"] = MigrationResult.SuccessfulFiles;
                metadata["FailedFiles"] = MigrationResult.FailedFiles;
                metadata["MigratedSizeBytes"] = MigrationResult.MigratedSizeBytes;
            }
            
            return metadata;
        }
    }
    #endregion
}