using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Dashboard metrics for migration overview
    /// </summary>
    public class MigrationMetrics : INotifyPropertyChanged
    {
        private int _totalProjects;
        private int _activeMigrations;
        private int _completedMigrations;
        private double _overallCompletionPercentage;

        public int TotalProjects
        {
            get => _totalProjects;
            set => SetProperty(ref _totalProjects, value);
        }

        public int ActiveMigrations
        {
            get => _activeMigrations;
            set => SetProperty(ref _activeMigrations, value);
        }

        public int CompletedMigrations
        {
            get => _completedMigrations;
            set => SetProperty(ref _completedMigrations, value);
        }

        public double OverallCompletionPercentage
        {
            get => _overallCompletionPercentage;
            set => SetProperty(ref _overallCompletionPercentage, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Model for active migration display in dashboard
    /// </summary>
    public class ActiveMigrationModel : INotifyPropertyChanged
    {
        private string _projectName;
        private string _waveName;
        private string _migrationType;
        private string _status;
        private double _completionPercentage;
        private DateTime _startTime;
        private DateTime _estimatedCompletion;

        public string ProjectName
        {
            get => _projectName;
            set => SetProperty(ref _projectName, value);
        }

        public string WaveName
        {
            get => _waveName;
            set => SetProperty(ref _waveName, value);
        }

        public string MigrationType
        {
            get => _migrationType;
            set => SetProperty(ref _migrationType, value);
        }

        public string Status
        {
            get => _status;
            set => SetProperty(ref _status, value);
        }

        public double CompletionPercentage
        {
            get => _completionPercentage;
            set => SetProperty(ref _completionPercentage, value);
        }

        public DateTime StartTime
        {
            get => _startTime;
            set => SetProperty(ref _startTime, value);
        }

        public DateTime EstimatedCompletion
        {
            get => _estimatedCompletion;
            set => SetProperty(ref _estimatedCompletion, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Migration orchestrator project container
    /// </summary>
    public class MigrationOrchestratorProject
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public MigrationStatus Status { get; set; } = MigrationStatus.NotStarted;
        public List<MigrationOrchestratorWave> Waves { get; set; } = new List<MigrationOrchestratorWave>();
        public MigrationEnvironment SourceEnvironment { get; set; }
        public MigrationEnvironment TargetEnvironment { get; set; }
        public MigrationSettings Settings { get; set; } = new MigrationSettings();
        public List<string> Tags { get; set; } = new List<string>();
    }

    /// <summary>
    /// Migration orchestrator wave for batching
    /// </summary>
    public class MigrationOrchestratorWave
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string Description { get; set; }
        public int Order { get; set; }
        public MigrationPriority Priority { get; set; } = MigrationPriority.Normal;
        public DateTime PlannedStartDate { get; set; }
        public DateTime? PlannedEndDate { get; set; }
        public DateTime? ActualStartDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public TimeSpan? EstimatedDuration { get; set; }
        public List<MigrationTask> Tasks { get; set; } = new List<MigrationTask>();
        public MigrationStatus Status { get; set; } = MigrationStatus.NotStarted;
        public List<MigrationBatch> Batches { get; set; } = new List<MigrationBatch>();
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
        public string Notes { get; set; }
        public List<string> Prerequisites { get; set; } = new List<string>();
    }


    /// <summary>
    /// T-027 Migration Engine compatibility alias
    /// </summary>
    public class MigrationWave : MigrationOrchestratorWave { }

    /// <summary>
    /// Migration batch for specific migration types - Enhanced for enterprise batch processing
    /// </summary>
    public class MigrationBatch
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string Description { get; set; }
        public MigrationType Type { get; set; }
        public MigrationPriority Priority { get; set; } = MigrationPriority.Normal;
        public MigrationComplexity Complexity { get; set; } = MigrationComplexity.Simple;
        public List<MigrationItem> Items { get; set; } = new List<MigrationItem>();
        public MigrationStatus Status { get; set; } = MigrationStatus.NotStarted;
        public string StatusMessage { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DateTime? PlannedStartDate { get; set; }
        public DateTime? PlannedEndDate { get; set; }
        public TimeSpan? EstimatedDuration { get; set; }
        public TimeSpan? ActualDuration => StartTime.HasValue && EndTime.HasValue ? EndTime.Value - StartTime.Value : null;
        public string AssignedTechnician { get; set; }
        public string BusinessOwner { get; set; }
        public int MaxConcurrentItems { get; set; } = 5;
        public bool EnableAutoRetry { get; set; } = true;
        public int MaxRetryAttempts { get; set; } = 3;
        public TimeSpan RetryDelay { get; set; } = TimeSpan.FromMinutes(5);
        
        // Statistics and progress tracking
        public int TotalItems => Items?.Count ?? 0;
        public int CompletedItems => Items?.Count(i => i.IsCompleted) ?? 0;
        public int FailedItems => Items?.Count(i => i.Status == MigrationStatus.Failed) ?? 0;
        public int ItemsWithWarnings => Items?.Count(i => i.HasWarnings) ?? 0;
        public int InProgressItems => Items?.Count(i => i.Status == MigrationStatus.InProgress) ?? 0;
        public int PendingItems => Items?.Count(i => i.Status == MigrationStatus.NotStarted) ?? 0;
        public double ProgressPercentage => TotalItems > 0 ? (double)CompletedItems / TotalItems * 100 : 0;
        public double SuccessRate => TotalItems > 0 ? (double)(CompletedItems - FailedItems) / TotalItems * 100 : 0;
        
        // Size and data transfer tracking
        public long TotalSizeBytes => Items?.Sum(i => i.SizeBytes ?? 0) ?? 0;
        public long TransferredBytes => Items?.Sum(i => i.TransferredBytes ?? 0) ?? 0;
        public double AverageTransferRateMBps => Items?.Where(i => i.TransferRateMBps > 0).Average(i => i.TransferRateMBps) ?? 0;
        public string FormattedTotalSize => FormatBytes(TotalSizeBytes);
        
        // Dependencies and prerequisites
        public List<string> Prerequisites { get; set; } = new List<string>();
        public List<string> PostMigrationTasks { get; set; } = new List<string>();
        public List<string> DependentBatches { get; set; } = new List<string>();
        
        // Configuration and settings
        public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();
        public Dictionary<string, string> EnvironmentSettings { get; set; } = new Dictionary<string, string>();
        public bool EnableThrottling { get; set; }
        public int ThrottlingLimitMBps { get; set; }
        
        // Quality assurance and validation
        public List<string> PreMigrationChecklist { get; set; } = new List<string>();
        public List<string> PostMigrationValidation { get; set; } = new List<string>();
        public List<string> QualityGates { get; set; } = new List<string>();
        public bool RequiresApproval { get; set; }
        public string ApprovedBy { get; set; }
        public DateTime? ApprovalDate { get; set; }
        
        // Error handling and logging
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public string LogFilePath { get; set; }
        public List<string> DetailedLogs { get; set; } = new List<string>();
        
        // Business and operational data
        public string BusinessJustification { get; set; }
        public decimal? EstimatedCost { get; set; }
        public decimal? ActualCost { get; set; }
        public List<string> Tags { get; set; } = new List<string>();
        public Dictionary<string, object> CustomProperties { get; set; } = new Dictionary<string, object>();
        
        // Rollback support
        public bool SupportsRollback { get; set; } = true;
        public string RollbackPlan { get; set; }
        public List<string> RollbackInstructions { get; set; } = new List<string>();
        
        // Calculated properties for UI binding
        public bool IsCompleted => Status == MigrationStatus.Completed || Status == MigrationStatus.CompletedWithWarnings;
        public bool HasErrors => Errors?.Count > 0 || Items?.Any(i => i.HasErrors) == true;
        public bool HasWarnings => Warnings?.Count > 0 || Items?.Any(i => i.HasWarnings) == true;
        public bool IsHighRisk => Complexity == MigrationComplexity.HighRisk || Priority == MigrationPriority.Critical || Items?.Any(i => i.IsHighRisk) == true;
        public bool CanStart => Status == MigrationStatus.NotStarted || Status == MigrationStatus.Ready;
        public bool CanPause => Status == MigrationStatus.InProgress;
        public bool CanResume => Status == MigrationStatus.Paused;
        public bool IsRunning => Status == MigrationStatus.InProgress;
        
        // Utility methods
        private static string FormatBytes(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
        }
        
        // Methods for batch operations
        public void UpdateProgress()
        {
            // Recalculate progress based on current item statuses
            var completed = Items.Count(i => i.IsCompleted);
            var total = Items.Count;
            // Progress calculation is handled by the property getter
        }
        
        public List<MigrationItem> GetHighRiskItems()
        {
            return Items?.Where(i => i.IsHighRisk).ToList() ?? new List<MigrationItem>();
        }
        
        public List<MigrationItem> GetItemsByStatus(MigrationStatus status)
        {
            return Items?.Where(i => i.Status == status).ToList() ?? new List<MigrationItem>();
        }
        
        public TimeSpan? GetEstimatedTimeRemaining()
        {
            if (!StartTime.HasValue || ProgressPercentage <= 0) return null;
            
            var elapsed = DateTime.Now - StartTime.Value;
            var totalEstimated = TimeSpan.FromTicks((long)(elapsed.Ticks / (ProgressPercentage / 100.0)));
            return totalEstimated - elapsed;
        }
    }

    /// <summary>
    /// T-027 Migration Engine compatibility extension
    /// </summary>
    public class MigrationBatchExtended : MigrationBatch { }

    /// <summary>
    /// Individual migration item - Enhanced for enterprise migration tracking
    /// </summary>
    public class MigrationItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string WaveId { get; set; }
        public string Wave { get; set; }
        public string SourceIdentity { get; set; }
        public string TargetIdentity { get; set; }
        public string SourcePath { get; set; }
        public string TargetPath { get; set; }
        public MigrationType Type { get; set; }
        public MigrationStatus Status { get; set; } = MigrationStatus.NotStarted;
        public MigrationPriority Priority { get; set; } = MigrationPriority.Normal;
        public MigrationComplexity Complexity { get; set; } = MigrationComplexity.Simple;
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DateTime? ValidationTime { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public TimeSpan? EstimatedDuration { get; set; }
        public TimeSpan? ActualDuration => StartTime.HasValue && EndTime.HasValue ? EndTime.Value - StartTime.Value : null;
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public List<string> ValidationResults { get; set; } = new List<string>();
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
        public Dictionary<string, string> PermissionMappings { get; set; } = new Dictionary<string, string>();
        public long? SizeBytes { get; set; }
        public long? TransferredBytes { get; set; }
        public double ProgressPercentage { get; set; }
        public string DisplayName { get; set; }
        public string Description { get; set; }
        public string Output { get; set; }
        public List<string> Dependencies { get; set; } = new List<string>();
        public List<string> DependentItems { get; set; } = new List<string>();
        public int RetryCount { get; set; }
        public int MaxRetryAttempts { get; set; } = 3;
        public DateTime? LastRetryTime { get; set; }
        public List<string> PreMigrationChecklist { get; set; } = new List<string>();
        public List<string> PostMigrationValidation { get; set; } = new List<string>();
        public bool RequiresUserInteraction { get; set; }
        public bool AllowConcurrentMigration { get; set; } = true;
        public string AssignedTechnician { get; set; }
        public string BusinessJustification { get; set; }
        public Dictionary<string, object> CustomFields { get; set; } = new Dictionary<string, object>();
        public List<string> Tags { get; set; } = new List<string>();
        
        // Performance and throttling
        public double TransferRateMBps { get; set; }
        public int MaxConcurrentStreams { get; set; } = 4;
        public bool EnableThrottling { get; set; }
        
        // Rollback support
        public bool SupportsRollback { get; set; } = true;
        public string RollbackPlan { get; set; }
        public List<string> RollbackInstructions { get; set; } = new List<string>();
        
        // Validation and quality
        public bool IsValidationRequired { get; set; } = true;
        public bool IsValidationPassed { get; set; }
        public List<string> QualityChecks { get; set; } = new List<string>();
        
        // Calculated properties
        public bool IsCompleted => Status == MigrationStatus.Completed || Status == MigrationStatus.CompletedWithWarnings;
        public bool HasErrors => Errors?.Count > 0;
        public bool HasWarnings => Warnings?.Count > 0;
        public bool IsHighRisk => Complexity == MigrationComplexity.HighRisk || Priority == MigrationPriority.Critical;
        public double CompletionPercentage => ProgressPercentage;
        
        // Size formatting for UI display
        public string FormattedSize => SizeBytes.HasValue ? FormatBytes(SizeBytes.Value) : "Unknown";
        
        private static string FormatBytes(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }
            return $"{len:0.##} {sizes[order]}";
        }
    }

    /// <summary>
    /// Migration environment configuration
    /// </summary>
    public class MigrationEnvironment
    {
        public string Name { get; set; }
        public string Type { get; set; } // Azure, OnPremises, Hybrid
        public Dictionary<string, string> ConnectionStrings { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, object> Configuration { get; set; } = new Dictionary<string, object>();
        public bool IsConnected { get; set; }
        public bool IsHealthy { get; set; } = true;
        public string HealthStatus { get; set; }
        public DateTime LastHealthCheck { get; set; }
        public List<string> Capabilities { get; set; } = new List<string>();
        public Dictionary<string, string> Credentials { get; set; } = new Dictionary<string, string>();
    }


    /// <summary>
    /// Migration settings and configuration
    /// </summary>
    public class MigrationSettings
    {
        public bool EnableRollback { get; set; } = true;
        public bool ValidateBeforeMigration { get; set; } = true;
        public int MaxConcurrentMigrations { get; set; } = 5;
        public int RetryAttempts { get; set; } = 3;
        public TimeSpan RetryDelay { get; set; } = TimeSpan.FromMinutes(5);
        public bool PreservePermissions { get; set; } = true;
        public bool CreateMissingTargetContainers { get; set; } = true;
        public string NotificationEmail { get; set; }
        public Dictionary<string, object> TypeSpecificSettings { get; set; } = new Dictionary<string, object>();
        public List<string> ExcludedItems { get; set; } = new List<string>();
        public bool PauseOnError { get; set; } = false;
        public bool GenerateDetailedLogs { get; set; } = true;
    }

    /// <summary>
    /// Security group mapping for user migrations
    /// </summary>
    public class SecurityGroupMapping
    {
        public string SourceGroupName { get; set; }
        public string TargetGroupName { get; set; }
        public string MappingType { get; set; } // Auto, Manual, Created
        public bool IsConfirmed { get; set; }
        public string Description { get; set; }
        public List<string> ConflictingGroups { get; set; } = new List<string>();
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Migration result summary
    /// </summary>
    public class MigrationResult
    {
        public string BatchId { get; set; }
        public MigrationStatus OverallStatus { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeSpan Duration => EndTime?.Subtract(StartTime) ?? TimeSpan.Zero;
        public int TotalItems { get; set; }
        public int SuccessfulItems { get; set; }
        public int FailedItems { get; set; }
        public int WarningItems { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public Dictionary<string, object> Metrics { get; set; } = new Dictionary<string, object>();
        public string LogFilePath { get; set; }
        public double SuccessRate => TotalItems > 0 ? (double)SuccessfulItems / TotalItems * 100 : 0;
    }

    /// <summary>
    /// Migration types enumeration - Enhanced for ShareGate-quality enterprise migration
    /// </summary>
    public enum MigrationType
    {
        User,                    // User profile and account migration
        UserProfile,             // User profile migration with re-ACLing
        Mailbox,                 // Exchange mailbox migration
        FileShare,               // File server to SharePoint/OneDrive migration
        SharePoint,              // SharePoint site/library migration
        VirtualMachine,          // VM migration (Azure to Azure, On-prem to Azure)
        Application,             // Application migration and deployment
        Database,                // Database migration and conversion
        SecurityGroup,           // Active Directory security group migration
        GroupPolicy,             // Group Policy Object migration
        OrganizationalUnit,      // AD OU structure migration
        Certificate,             // Certificate store migration
        GPO,                     // Group Policy Object migration
        OneDrive,                // OneDrive for Business migration
        Teams,                   // Microsoft Teams migration
        DistributionList,        // Exchange distribution lists
        PublicFolder,            // Exchange public folder migration
        MailEnabledSecurityGroup, // Mail-enabled security groups
        NetworkDrive,            // Network drive mapping migration
        PrintQueue,              // Printer queue migration
        Registry,                // Registry settings migration
        ACL                      // Access Control List migration
    }

    /// <summary>
    /// Migration status enumeration
    /// </summary>
    public enum MigrationStatus
    {
        NotStarted,
        Planning,
        Planned,
        Validating,
        Ready,
        InProgress,
        Paused,
        Completed,
        CompletedWithWarnings,
        Failed,
        Cancelled,
        RolledBack,
        Skipped
    }

    /// <summary>
    /// Migration priority levels
    /// </summary>
    public enum MigrationPriority
    {
        Low,
        Normal,
        High,
        Critical
    }

    /// <summary>
    /// Migration complexity assessment
    /// </summary>
    public enum MigrationComplexity
    {
        Simple,
        Moderate,
        Complex,
        HighRisk
    }

    /// <summary>
    /// Discovery metrics for environment scanning
    /// </summary>
    public class DiscoveryMetrics : INotifyPropertyChanged
    {
        private int _userCount;
        private int _mailboxCount;
        private int _fileShareCount;
        private int _dependencyCount;
        private int _applicationCount;
        private int _securityGroupCount;

        public int UserCount
        {
            get => _userCount;
            set => SetProperty(ref _userCount, value);
        }

        public int MailboxCount
        {
            get => _mailboxCount;
            set => SetProperty(ref _mailboxCount, value);
        }

        public int FileShareCount
        {
            get => _fileShareCount;
            set => SetProperty(ref _fileShareCount, value);
        }

        public int DependencyCount
        {
            get => _dependencyCount;
            set => SetProperty(ref _dependencyCount, value);
        }

        public int ApplicationCount
        {
            get => _applicationCount;
            set => SetProperty(ref _applicationCount, value);
        }

        public int SecurityGroupCount
        {
            get => _securityGroupCount;
            set => SetProperty(ref _securityGroupCount, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Dependency relationship discovered during analysis
    /// </summary>
    public class DependencyRelationship : INotifyPropertyChanged
    {
        private string _source;
        private string _target;
        private string _dependencyType;
        private string _complexity;
        private string _riskLevel;
        private string _description;

        public string Source
        {
            get => _source;
            set => SetProperty(ref _source, value);
        }

        public string Target
        {
            get => _target;
            set => SetProperty(ref _target, value);
        }

        public string DependencyType
        {
            get => _dependencyType;
            set => SetProperty(ref _dependencyType, value);
        }

        public string Complexity
        {
            get => _complexity;
            set => SetProperty(ref _complexity, value);
        }

        public string RiskLevel
        {
            get => _riskLevel;
            set => SetProperty(ref _riskLevel, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Planning metrics for wave and batch management
    /// </summary>
    public class PlanningMetrics : INotifyPropertyChanged
    {
        private int _totalWaves;
        private int _totalItems;
        private TimeSpan _estimatedDuration;
        private double _complexityScore;

        public int TotalWaves
        {
            get => _totalWaves;
            set => SetProperty(ref _totalWaves, value);
        }

        public int TotalItems
        {
            get => _totalItems;
            set => SetProperty(ref _totalItems, value);
        }

        public TimeSpan EstimatedDuration
        {
            get => _estimatedDuration;
            set => SetProperty(ref _estimatedDuration, value);
        }

        public double ComplexityScore
        {
            get => _complexityScore;
            set => SetProperty(ref _complexityScore, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Extended migration wave for orchestrator
    /// </summary>
    public class MigrationWaveExtended : MigrationOrchestratorWave, INotifyPropertyChanged
    {
        private double _progressPercentage;
        
        public int TotalItems => Batches?.Sum(b => b.TotalItems) ?? 0;
        
        public double ProgressPercentage
        {
            get => _progressPercentage;
            set => SetProperty(ref _progressPercentage, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Execution metrics for real-time monitoring
    /// </summary>
    public class ExecutionMetrics : INotifyPropertyChanged
    {
        private int _activeStreams;
        private double _itemsPerMinute;
        private double _dataThroughputMBps;
        private int _errorCount;
        private double _etaMinutes;

        public int ActiveStreams
        {
            get => _activeStreams;
            set => SetProperty(ref _activeStreams, value);
        }

        public double ItemsPerMinute
        {
            get => _itemsPerMinute;
            set => SetProperty(ref _itemsPerMinute, value);
        }

        public double DataThroughputMBps
        {
            get => _dataThroughputMBps;
            set => SetProperty(ref _dataThroughputMBps, value);
        }

        public int ErrorCount
        {
            get => _errorCount;
            set => SetProperty(ref _errorCount, value);
        }

        public double EtaMinutes
        {
            get => _etaMinutes;
            set => SetProperty(ref _etaMinutes, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Active migration stream for execution monitoring
    /// </summary>
    public class MigrationStream : INotifyPropertyChanged
    {
        private string _streamId;
        private string _waveName;
        private string _batchName;
        private string _migrationType;
        private string _currentItem;
        private string _status;
        private double _progressPercentage;
        private double _itemsPerMinute;
        private DateTime _estimatedCompletion;

        public string StreamId
        {
            get => _streamId;
            set => SetProperty(ref _streamId, value);
        }

        public string WaveName
        {
            get => _waveName;
            set => SetProperty(ref _waveName, value);
        }

        public string BatchName
        {
            get => _batchName;
            set => SetProperty(ref _batchName, value);
        }

        public string MigrationType
        {
            get => _migrationType;
            set => SetProperty(ref _migrationType, value);
        }

        public string CurrentItem
        {
            get => _currentItem;
            set => SetProperty(ref _currentItem, value);
        }

        public string Status
        {
            get => _status;
            set => SetProperty(ref _status, value);
        }

        public double ProgressPercentage
        {
            get => _progressPercentage;
            set => SetProperty(ref _progressPercentage, value);
        }

        public double ItemsPerMinute
        {
            get => _itemsPerMinute;
            set => SetProperty(ref _itemsPerMinute, value);
        }

        public DateTime EstimatedCompletion
        {
            get => _estimatedCompletion;
            set => SetProperty(ref _estimatedCompletion, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Execution event for real-time logging
    /// </summary>
    public class ExecutionEvent : INotifyPropertyChanged
    {
        private string _eventType;
        private string _message;
        private DateTime _timestamp;
        private string _eventColor;

        public string EventType
        {
            get => _eventType;
            set => SetProperty(ref _eventType, value);
        }

        public string Message
        {
            get => _message;
            set => SetProperty(ref _message, value);
        }

        public DateTime Timestamp
        {
            get => _timestamp;
            set => SetProperty(ref _timestamp, value);
        }

        public string EventColor
        {
            get => _eventColor;
            set => SetProperty(ref _eventColor, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Validation metrics summary
    /// </summary>
    public class ValidationMetrics : INotifyPropertyChanged
    {
        private int _totalChecks;
        private int _passedChecks;
        private int _failedChecks;
        private double _successRate;

        public int TotalChecks
        {
            get => _totalChecks;
            set => SetProperty(ref _totalChecks, value);
        }

        public int PassedChecks
        {
            get => _passedChecks;
            set => SetProperty(ref _passedChecks, value);
        }

        public int FailedChecks
        {
            get => _failedChecks;
            set => SetProperty(ref _failedChecks, value);
        }

        public double SuccessRate
        {
            get => _successRate;
            set => SetProperty(ref _successRate, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Validation test definition and results
    /// </summary>
    public class ValidationTest : INotifyPropertyChanged
    {
        private string _category;
        private string _name;
        private string _testType;
        private string _status;
        private string _statusColor;
        private int _itemsTested;
        private int _issuesFound;
        private DateTime? _lastRun;

        public string Category
        {
            get => _category;
            set => SetProperty(ref _category, value);
        }

        public string Name
        {
            get => _name;
            set => SetProperty(ref _name, value);
        }

        public string TestType
        {
            get => _testType;
            set => SetProperty(ref _testType, value);
        }

        public string Status
        {
            get => _status;
            set => SetProperty(ref _status, value);
        }

        public string StatusColor
        {
            get => _statusColor;
            set => SetProperty(ref _statusColor, value);
        }

        public int ItemsTested
        {
            get => _itemsTested;
            set => SetProperty(ref _itemsTested, value);
        }

        public int IssuesFound
        {
            get => _issuesFound;
            set => SetProperty(ref _issuesFound, value);
        }

        public DateTime? LastRun
        {
            get => _lastRun;
            set => SetProperty(ref _lastRun, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Validation issue found during testing
    /// </summary>
    public class ValidationIssue : INotifyPropertyChanged
    {
        private string _severity;
        private string _severityColor;
        private string _category;
        private string _itemName;
        private string _description;
        private string _recommendedAction;

        public string Severity
        {
            get => _severity;
            set => SetProperty(ref _severity, value);
        }

        public string SeverityColor
        {
            get => _severityColor;
            set => SetProperty(ref _severityColor, value);
        }

        public string Category
        {
            get => _category;
            set => SetProperty(ref _category, value);
        }

        public string ItemName
        {
            get => _itemName;
            set => SetProperty(ref _itemName, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public string RecommendedAction
        {
            get => _recommendedAction;
            set => SetProperty(ref _recommendedAction, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Pre-migration checklist item
    /// </summary>
    public class ChecklistItem : INotifyPropertyChanged
    {
        private string _title;
        private string _description;
        private bool _isCompleted;
        private string _priority;
        private string _priorityColor;

        public string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public bool IsCompleted
        {
            get => _isCompleted;
            set => SetProperty(ref _isCompleted, value);
        }

        public string Priority
        {
            get => _priority;
            set => SetProperty(ref _priority, value);
        }

        public string PriorityColor
        {
            get => _priorityColor;
            set => SetProperty(ref _priorityColor, value);
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Realistic migration data generator for dashboard
    /// </summary>
    public class MigrationDataGenerator
    {
        private static readonly Random _random = new Random();
        private static readonly List<string> _projectNames = new List<string>
        {
            "Finance Department Migration",
            "HR Systems Consolidation",
            "Sales CRM Migration",
            "Engineering Platform Move",
            "Legal Document Migration",
            "Marketing Asset Transfer",
            "IT Infrastructure Upgrade",
            "Customer Service Portal",
            "Operations Dashboard",
            "Executive Communications"
        };

        private static readonly List<string> _migrationTypes = new List<string>
        {
            "User Accounts", "Exchange Mailboxes", "SharePoint Sites", "File Shares",
            "Security Groups", "Applications", "Virtual Machines", "Databases"
        };

        private static readonly List<string> _statuses = new List<string>
        {
            "Running", "In Progress", "Completing", "Validating", "Starting"
        };

        public static MigrationMetrics GenerateRealtimeMetrics()
        {
            var baseProjects = 5 + _random.Next(3);
            var activeCount = 1 + _random.Next(4);
            var completedCount = 15 + _random.Next(10);
            
            return new MigrationMetrics
            {
                TotalProjects = baseProjects,
                ActiveMigrations = activeCount,
                CompletedMigrations = completedCount,
                OverallCompletionPercentage = 65.0 + _random.NextDouble() * 15.0
            };
        }

        public static List<ActiveMigrationModel> GenerateActiveMigrations(int count = 3)
        {
            var migrations = new List<ActiveMigrationModel>();
            
            for (int i = 0; i < count; i++)
            {
                var startTime = DateTime.Now.AddHours(-_random.Next(1, 8));
                var progress = 5.0 + _random.NextDouble() * 90.0;
                
                migrations.Add(new ActiveMigrationModel
                {
                    ProjectName = _projectNames[_random.Next(_projectNames.Count)],
                    WaveName = $"Wave {_random.Next(1, 5)}",
                    MigrationType = _migrationTypes[_random.Next(_migrationTypes.Count)],
                    Status = _statuses[_random.Next(_statuses.Count)],
                    CompletionPercentage = progress,
                    StartTime = startTime,
                    EstimatedCompletion = startTime.AddHours(_random.Next(2, 12))
                });
            }
            
            return migrations;
        }

        public static void UpdateMigrationProgress(ActiveMigrationModel migration)
        {
            if (migration.Status == "Completed") return;
            
            // Realistic progress increments
            var increment = _random.NextDouble() * 3.0;
            migration.CompletionPercentage = Math.Min(100.0, migration.CompletionPercentage + increment);
            
            if (migration.CompletionPercentage >= 100.0)
            {
                migration.Status = "Completed";
                migration.CompletionPercentage = 100.0;
            }
            else if (migration.CompletionPercentage > 95.0)
            {
                migration.Status = "Completing";
            }
        }
    }

    /// <summary>
    /// Realistic discovery data generator
    /// </summary>
    public class DiscoveryDataGenerator
    {
        private static readonly Random _random = new Random();
        private static int _baseUserCount = 1250;
        private static int _baseMailboxCount = 980;
        private static int _baseFileShareCount = 45;
        
        public static DiscoveryMetrics GenerateRealtimeDiscoveryMetrics()
        {
            // Simulate discovery finding new items
            _baseUserCount += _random.Next(0, 5);
            _baseMailboxCount += _random.Next(0, 3);
            _baseFileShareCount += _random.Next(0, 2);
            
            return new DiscoveryMetrics
            {
                UserCount = _baseUserCount,
                MailboxCount = _baseMailboxCount,
                FileShareCount = _baseFileShareCount,
                DependencyCount = 127 + _random.Next(0, 15),
                ApplicationCount = 78 + _random.Next(0, 8),
                SecurityGroupCount = 156 + _random.Next(0, 12)
            };
        }

        public static List<DependencyRelationship> GenerateDependencies(int count = 5)
        {
            var dependencies = new List<DependencyRelationship>();
            var sources = new[] { "Finance-Users", "HR-Department", "Sales-Team", "IT-Admins", "Marketing-Group" };
            var targets = new[] { "SharePoint-Sites", "Exchange-Resources", "File-Servers", "Applications", "Shared-Calendars" };
            var types = new[] { "Permission", "Resource", "Application", "Data", "Configuration" };
            var complexities = new[] { "Simple", "Moderate", "High", "Complex" };
            var risks = new[] { "Low", "Medium", "High", "Critical" };
            
            for (int i = 0; i < count; i++)
            {
                dependencies.Add(new DependencyRelationship
                {
                    Source = sources[_random.Next(sources.Length)],
                    Target = targets[_random.Next(targets.Length)],
                    DependencyType = types[_random.Next(types.Length)],
                    Complexity = complexities[_random.Next(complexities.Length)],
                    RiskLevel = risks[_random.Next(risks.Length)],
                    Description = "Auto-discovered dependency relationship"
                });
            }
            
            return dependencies;
        }
    }

    /// <summary>
    /// Planning data generator for waves and batches
    /// </summary>
    public class PlanningDataGenerator
    {
        private static readonly Random _random = new Random();
        
        public static PlanningMetrics GeneratePlanningMetrics(int waveCount)
        {
            return new PlanningMetrics
            {
                TotalWaves = waveCount,
                TotalItems = 2000 + _random.Next(500, 1500),
                EstimatedDuration = TimeSpan.FromDays(10 + _random.Next(5, 15)),
                ComplexityScore = 5.0 + _random.NextDouble() * 5.0
            };
        }

        public static List<MigrationWaveExtended> GenerateWaves(int count = 4)
        {
            var waves = new List<MigrationWaveExtended>();
            var waveNames = new[] { "Pilot Users", "Finance Department", "Sales & Marketing", "Engineering Teams", "Support & Operations" };
            
            for (int i = 0; i < count; i++)
            {
                var wave = new MigrationWaveExtended
                {
                    Name = $"Wave {i + 1} - {waveNames[Math.Min(i, waveNames.Length - 1)]}",
                    Order = i + 1,
                    PlannedStartDate = DateTime.Now.AddDays(7 * (i + 1)),
                    Status = i == 0 ? MigrationStatus.Ready : 
                             i == 1 ? MigrationStatus.Planning : MigrationStatus.NotStarted
                };
                
                // Add batches to each wave
                var batchCount = _random.Next(2, 5);
                for (int j = 0; j < batchCount; j++)
                {
                    wave.Batches.Add(new MigrationBatch
                    {
                        Name = $"Batch {j + 1} - {GetRandomBatchType()}",
                        Type = (MigrationType)_random.Next(0, 8),
                        Status = wave.Status
                    });
                }
                
                waves.Add(wave);
            }
            
            return waves;
        }
        
        private static string GetRandomBatchType()
        {
            var types = new[] { "User Accounts", "Mailboxes", "File Shares", "Applications", "Security Groups" };
            return types[_random.Next(types.Length)];
        }
    }

    /// <summary>
    /// Execution data generator for real-time monitoring
    /// </summary>
    public class ExecutionDataGenerator
    {
        private static readonly Random _random = new Random();
        private static double _baseItemsPerMinute = 8.5;
        private static double _baseThroughput = 45.2;
        
        public static ExecutionMetrics GenerateRealtimeExecutionMetrics(int activeStreams)
        {
            // Simulate fluctuating performance
            _baseItemsPerMinute += (_random.NextDouble() - 0.5) * 2.0;
            _baseItemsPerMinute = Math.Max(5.0, Math.Min(25.0, _baseItemsPerMinute));
            
            _baseThroughput += (_random.NextDouble() - 0.5) * 10.0;
            _baseThroughput = Math.Max(20.0, Math.Min(80.0, _baseThroughput));
            
            return new ExecutionMetrics
            {
                ActiveStreams = activeStreams,
                ItemsPerMinute = _baseItemsPerMinute,
                DataThroughputMBps = _baseThroughput,
                ErrorCount = _random.Next(0, 5),
                EtaMinutes = 60 + _random.Next(30, 180)
            };
        }

        public static List<MigrationStream> GenerateActiveStreams(int count = 3)
        {
            var streams = new List<MigrationStream>();
            var users = new[] { "john.doe@company.com", "jane.smith@company.com", "mike.johnson@company.com", "sarah.wilson@company.com" };
            var types = new[] { "Mailbox", "FileShare", "User", "SecurityGroup" };
            var statuses = new[] { "Running", "Processing", "Transferring", "Validating" };
            
            for (int i = 0; i < count; i++)
            {
                streams.Add(new MigrationStream
                {
                    StreamId = $"STR-{DateTime.Now.Ticks.ToString().Substring(10, 6)}",
                    WaveName = $"Wave {_random.Next(1, 4)}",
                    BatchName = $"Batch {_random.Next(1, 3)}",
                    MigrationType = types[_random.Next(types.Length)],
                    CurrentItem = users[_random.Next(users.Length)],
                    Status = statuses[_random.Next(statuses.Length)],
                    ProgressPercentage = 15.0 + _random.NextDouble() * 70.0,
                    ItemsPerMinute = 5.0 + _random.NextDouble() * 15.0,
                    EstimatedCompletion = DateTime.Now.AddHours(_random.Next(1, 6))
                });
            }
            
            return streams;
        }

        public static void UpdateStreamProgress(MigrationStream stream)
        {
            if (stream.Status == "Completed") return;
            
            // Update progress
            var increment = _random.NextDouble() * 5.0;
            stream.ProgressPercentage = Math.Min(100.0, stream.ProgressPercentage + increment);
            
            // Update throughput
            stream.ItemsPerMinute += (_random.NextDouble() - 0.5) * 2.0;
            stream.ItemsPerMinute = Math.Max(2.0, Math.Min(20.0, stream.ItemsPerMinute));
            
            if (stream.ProgressPercentage >= 100.0)
            {
                stream.Status = "Completed";
                stream.ProgressPercentage = 100.0;
            }
        }
        
        public static List<ExecutionEvent> GenerateRecentEvents(int count = 10)
        {
            var events = new List<ExecutionEvent>();
            var eventTypes = new[] { "Info", "Warning", "Success", "Error" };
            var messages = new[]
            {
                "Migration stream started successfully",
                "User account migration completed",
                "Network connectivity restored",
                "Batch processing initiated",
                "Validation check passed",
                "Permission mapping updated",
                "Data transfer resumed",
                "Checkpoint created"
            };
            
            var colors = new Dictionary<string, string>
            {
                { "Info", "#FF3B82F6" },
                { "Warning", "#FFF59E0B" },
                { "Success", "#FF10B981" },
                { "Error", "#FFEF4444" }
            };
            
            for (int i = 0; i < count; i++)
            {
                var eventType = eventTypes[_random.Next(eventTypes.Length)];
                events.Add(new ExecutionEvent
                {
                    EventType = eventType,
                    Message = messages[_random.Next(messages.Length)],
                    Timestamp = DateTime.Now.AddMinutes(-_random.Next(0, 120)),
                    EventColor = colors[eventType]
                });
            }
            
            return events.OrderByDescending(e => e.Timestamp).ToList();
        }
    }

    /// <summary>
    /// Validation data generator
    /// </summary>
    public class ValidationDataGenerator
    {
        private static readonly Random _random = new Random();
        
        public static ValidationMetrics GenerateValidationMetrics()
        {
            var totalChecks = 25 + _random.Next(0, 10);
            var passedChecks = (int)(totalChecks * (0.75 + _random.NextDouble() * 0.2));
            var failedChecks = totalChecks - passedChecks;
            
            return new ValidationMetrics
            {
                TotalChecks = totalChecks,
                PassedChecks = passedChecks,
                FailedChecks = failedChecks,
                SuccessRate = (double)passedChecks / totalChecks * 100
            };
        }
        
        public static List<ValidationTest> GenerateValidationTests()
        {
            var tests = new List<ValidationTest>();
            var categories = new[] { "Connectivity", "Permissions", "Data Integrity", "Configuration", "Performance" };
            var testNames = new Dictionary<string, string[]>
            {
                { "Connectivity", new[] { "Source Environment Connection", "Target Environment Connection", "Network Bandwidth Test" } },
                { "Permissions", new[] { "User Access Rights Validation", "Security Group Permissions", "Admin Rights Check" } },
                { "Data Integrity", new[] { "Mailbox Consistency Check", "File Corruption Scan", "Database Validation" } },
                { "Configuration", new[] { "DNS Resolution Test", "Certificate Validation", "Service Account Check" } },
                { "Performance", new[] { "Migration Speed Test", "Resource Utilization Check", "Throughput Analysis" } }
            };
            
            foreach (var category in categories)
            {
                foreach (var testName in testNames[category])
                {
                    var status = _random.NextDouble() > 0.2 ? "Passed" : "Failed";
                    tests.Add(new ValidationTest
                    {
                        Category = category,
                        Name = testName,
                        TestType = "Pre-Migration",
                        Status = status,
                        StatusColor = status == "Passed" ? "#FF10B981" : "#FFEF4444",
                        ItemsTested = _random.Next(1, 1500),
                        IssuesFound = status == "Passed" ? 0 : _random.Next(1, 20),
                        LastRun = DateTime.Now.AddMinutes(-_random.Next(5, 180))
                    });
                }
            }
            
            return tests;
        }
        
        public static List<ValidationIssue> GenerateValidationIssues()
        {
            var issues = new List<ValidationIssue>();
            var severities = new[] { "High", "Medium", "Low", "Critical" };
            var categories = new[] { "Permissions", "Configuration", "Data", "Security", "Performance" };
            var issueTemplates = new[]
            {
                "User has conflicting group memberships",
                "Missing required permissions for target environment",
                "Mailbox size exceeds migration limits",
                "Invalid characters in folder names",
                "Duplicate security group detected",
                "Network latency above threshold",
                "Certificate expiring within migration window"
            };
            
            var users = new[] { "john.doe@company.com", "jane.smith@company.com", "admin@company.com", "test.user@company.com" };
            
            var severityColors = new Dictionary<string, string>
            {
                { "Critical", "#FF991B1B" },
                { "High", "#FFEF4444" },
                { "Medium", "#FFF59E0B" },
                { "Low", "#FF3B82F6" }
            };
            
            for (int i = 0; i < _random.Next(3, 8); i++)
            {
                var severity = severities[_random.Next(severities.Length)];
                issues.Add(new ValidationIssue
                {
                    Severity = severity,
                    SeverityColor = severityColors[severity],
                    Category = categories[_random.Next(categories.Length)],
                    ItemName = users[_random.Next(users.Length)],
                    Description = issueTemplates[_random.Next(issueTemplates.Length)],
                    RecommendedAction = "Review and resolve before migration"
                });
            }
            
            return issues;
        }
        
        public static List<ChecklistItem> GeneratePreMigrationChecklist()
        {
            var items = new List<ChecklistItem>();
            var checklistItems = new[]
            {
                ("Backup Source Environment", "Create full backup of source Active Directory and Exchange", "Critical"),
                ("Validate Network Connectivity", "Ensure stable network connection between source and target", "High"),
                ("Test Migration Tools", "Verify all migration utilities are working correctly", "High"),
                ("User Communication", "Notify users about upcoming migration schedule", "Medium"),
                ("Security Review", "Complete security assessment of migration plan", "High"),
                ("DNS Configuration", "Update DNS records for target environment", "Medium"),
                ("Certificate Installation", "Install required certificates for secure communication", "High"),
                ("Rollback Planning", "Develop and test rollback procedures", "Critical")
            };
            
            var priorityColors = new Dictionary<string, string>
            {
                { "Critical", "#FFEF4444" },
                { "High", "#FFF59E0B" },
                { "Medium", "#FF3B82F6" },
                { "Low", "#FF6B7280" }
            };
            
            foreach (var (title, description, priority) in checklistItems)
            {
                items.Add(new ChecklistItem
                {
                    Title = title,
                    Description = description,
                    Priority = priority,
                    PriorityColor = priorityColors[priority],
                    IsCompleted = _random.NextDouble() > 0.4
                });
            }
            
            return items;
        }
    }

    /// <summary>
    /// Resource allocation for migration operations
    /// </summary>
    public class ResourceAllocation
    {
        public string ResourceType { get; set; }
        public string ResourceId { get; set; }
        public string AllocatedTo { get; set; }
        public DateTime AllocatedAt { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new();
    }

    public enum MappingStatus
    {
        Pending,
        Valid,
        Invalid,
        Conflicted,
        Resolved,
        Mapped,
        Skipped
    }

    /// <summary>
    /// Migration configuration for execution
    /// </summary>
    public class MigrationConfiguration
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string Description { get; set; }
        public MigrationType Type { get; set; }
        public Dictionary<string, object> Settings { get; set; } = new Dictionary<string, object>();
        public bool PreservePermissions { get; set; } = true;
        public bool ValidateAfterMigration { get; set; } = true;
        public int MaxRetryAttempts { get; set; } = 3;
        public TimeSpan RetryDelay { get; set; } = TimeSpan.FromMinutes(5);
        public string SourceEnvironment { get; set; }
        public string TargetEnvironment { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// SharePoint site item for migration
    /// </summary>
    public class SharePointSiteItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string SiteUrl { get; set; }
        public string SiteName { get; set; }
        public string SiteTemplate { get; set; }
        public long SizeMB { get; set; }
        public int DocumentCount { get; set; }
        public int ListCount { get; set; }
        public string Owner { get; set; }
        public DateTime LastModified { get; set; }
        public List<string> ContentTypes { get; set; } = new List<string>();
        public MigrationStatus Status { get; set; } = MigrationStatus.NotStarted;
        public string TargetUrl { get; set; }
        public bool PreservePermissions { get; set; } = true;
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
    }

    /// <summary>
    /// User profile item for migration
    /// </summary>
    public class UserProfileItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserPrincipalName { get; set; }
        public string DisplayName { get; set; }
        public string SamAccountName { get; set; }
        public string SourceDomain { get; set; }
        public string TargetDomain { get; set; }
        public string ProfilePath { get; set; }
        public string HomeDirectory { get; set; }
        public long ProfileSizeMB { get; set; }
        public List<string> SecurityGroups { get; set; } = new List<string>();
        public Dictionary<string, string> Attributes { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, object> CustomProperties { get; set; } = new Dictionary<string, object>(); // T-027 Migration Engine compatibility
        public MigrationStatus Status { get; set; } = MigrationStatus.NotStarted;
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public DateTime LastLogon { get; set; }
        public bool IsEnabled { get; set; } = true;
        public string Username => SamAccountName ?? UserPrincipalName;
        public string Domain => SourceDomain;
    }

    /// <summary>
    /// Domain mapping for cross-domain migrations
    /// </summary>
    public class DomainMapping
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string SourceDomain { get; set; }
        public string TargetDomain { get; set; }
        public string SourceDomainController { get; set; }
        public string TargetDomainController { get; set; }
        public MappingStatus Status { get; set; } = MappingStatus.Pending;
        public Dictionary<string, string> TrustRelationships { get; set; } = new Dictionary<string, string>();
        public bool IsValidated { get; set; }
        public DateTime LastValidated { get; set; }
        public List<string> ValidationErrors { get; set; } = new List<string>();
        
        // Additional properties referenced in ViewModels
        public static bool IsDefault { get; set; }
        public static string Description { get; set; }
    }

    /// <summary>
    /// ACL translation rule for permission migration
    /// </summary>
    public class ACLTranslationRule
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string SourceIdentity { get; set; }
        public string TargetIdentity { get; set; }
        public string SourceDomain { get; set; }
        public string TargetDomain { get; set; }
        public string PermissionType { get; set; }
        public MappingStatus Status { get; set; } = MappingStatus.Pending;
        public bool IsAutoGenerated { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public string CreatedBy { get; set; }
        public List<string> AppliedToResources { get; set; } = new List<string>();
        
        // Additional properties referenced in ViewModels
        public static string SourceSID { get; set; }
        public static string TargetSID { get; set; }
        public static ACLRuleType RuleType { get; set; }
        public static string Description { get; set; }
    }

    /// <summary>
    /// Content type mapping for SharePoint migration
    /// </summary>
    public class ContentTypeMapping
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string SourceContentType { get; set; }
        public string TargetContentType { get; set; }
        public string SourceContentTypeId { get; set; }
        public string TargetContentTypeId { get; set; }
        public Dictionary<string, string> FieldMappings { get; set; } = new Dictionary<string, string>();
        public MappingStatus Status { get; set; } = MappingStatus.Pending;
        public bool PreserveMetadata { get; set; } = true;
        public List<string> ConflictingFields { get; set; } = new List<string>();
        public bool IsCustomContentType { get; set; }
    }

    /// <summary>
    /// Event arguments for wave started events
    /// </summary>
    public class WaveStartedEventArgs : EventArgs
    {
        public string WaveId { get; set; }
        public string WaveName { get; set; }
        public DateTime StartTime { get; set; }
        public int TotalBatches { get; set; }
        public int TotalItems { get; set; }
        public TimeSpan EstimatedDuration { get; set; }
    }

    /// <summary>
    /// Event arguments for wave completed events
    /// </summary>
    public class WaveCompletedEventArgs : EventArgs
    {
        public string WaveId { get; set; }
        public string WaveName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public TimeSpan Duration { get; set; }
        public MigrationStatus Status { get; set; }
        public int TotalItems { get; set; }
        public int CompletedItems { get; set; }
        public int FailedItems { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public double SuccessRate => TotalItems > 0 ? (double)CompletedItems / TotalItems * 100 : 0;
    }

    /// <summary>
    /// Mailbox item for Exchange migration
    /// </summary>
    public class MailboxItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string UserPrincipalName { get; set; }
        public string DisplayName { get; set; }
        public string EmailAddress { get; set; }
        public string MailboxType { get; set; } // User, Shared, Room, Equipment
        public long MailboxSizeMB { get; set; }
        public int ItemCount { get; set; }
        public string Database { get; set; }
        public string Server { get; set; }
        public DateTime LastLogonTime { get; set; }
        public bool IsArchiveEnabled { get; set; }
        public long ArchiveSizeMB { get; set; }
        public MigrationStatus Status { get; set; } = MigrationStatus.NotStarted;
        public string TargetAddress { get; set; }
        public List<string> Aliases { get; set; } = new List<string>();
        public Dictionary<string, string> CustomAttributes { get; set; } = new Dictionary<string, string>();
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public DateTime? MigrationStartTime { get; set; }
        public DateTime? MigrationEndTime { get; set; }
        public bool PreserveRetentionPolicy { get; set; } = true;
    }

    /// <summary>
    /// Column mapping for SharePoint migration
    /// </summary>
    public class ColumnMapping
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string SourceColumnName { get; set; }
        public string TargetColumnName { get; set; }
        public string SourceColumnType { get; set; }
        public string TargetColumnType { get; set; }
        public bool IsRequired { get; set; }
        public string DefaultValue { get; set; }
        public MappingStatus Status { get; set; } = MappingStatus.Pending;
        public bool PreserveData { get; set; } = true;
        public Dictionary<string, string> ValueMappings { get; set; } = new Dictionary<string, string>();
        public List<string> ConflictReasons { get; set; } = new List<string>();
    }

    /// <summary>
    /// SharePoint validation result
    /// </summary>
    public class SharePointValidationResult
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string SiteUrl { get; set; }
        public string ListName { get; set; }
        public string ValidationCategory { get; set; }
        public string ValidationMessage { get; set; }
        public string Severity { get; set; } // Info, Warning, Error, Critical
        public DateTime ValidationDate { get; set; } = DateTime.Now;
        public bool IsBlocking { get; set; }
        public string RecommendedAction { get; set; }
        public Dictionary<string, object> ValidationDetails { get; set; } = new Dictionary<string, object>();
        public bool IsResolved { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public string ResolvedBy { get; set; }
    }

    /// <summary>
    /// File share item for migration - Extended version
    /// </summary>
    public class FileShareItem : MigrationItem
    {
        public string ShareName { get; set; }
        public string SharePath { get; set; }
        public string UncPath { get; set; }
        public long SizeMB { get; set; }
        public int FileCount { get; set; }
        public int FolderCount { get; set; }
        public List<AclEntry> AclEntries { get; set; } = new List<AclEntry>();
        public Dictionary<string, object> ShareProperties { get; set; } = new Dictionary<string, object>();
        public bool IsHidden { get; set; }
        public string FileSystemType { get; set; } // NTFS, ReFS, etc.
        public string ShareType { get; set; } // Standard, Administrative, etc.
        public DateTime CreatedDate { get; set; }
        public DateTime LastAccessTime { get; set; }
        public DateTime LastWriteTime { get; set; }
        public string Owner { get; set; }
        public List<string> SharePermissions { get; set; } = new List<string>();
        public bool IsOnline { get; set; } = true;
        public string TargetSharePath { get; set; }
        
        // Migration-specific properties
        public bool PreserveTimestamps { get; set; } = true;
        public bool VerifyIntegrity { get; set; } = true;
        public bool CreateShadowCopy { get; set; } = false;
        public int MaxRetryCount { get; set; } = 3;
        public TimeSpan RetryDelay { get; set; } = TimeSpan.FromMinutes(1);
    }

    /// <summary>
    /// Database item for migration - Extended version
    /// </summary>
    public class DatabaseItem : MigrationItem
    {
        public string DatabaseName { get; set; }
        public string ServerName { get; set; }
        public string InstanceName { get; set; }
        public string DatabaseEngine { get; set; } // MSSQL, MySQL, PostgreSQL, Oracle
        public string EngineVersion { get; set; }
        public long SizeMB { get; set; }
        public int TableCount { get; set; }
        public int ViewCount { get; set; }
        public int StoredProcedureCount { get; set; }
        public int FunctionCount { get; set; }
        public List<string> Owners { get; set; } = new List<string>();
        public List<string> Users { get; set; } = new List<string>();
        public Dictionary<string, object> DatabaseProperties { get; set; } = new Dictionary<string, object>();
        public string CompatibilityLevel { get; set; }
        public bool IsSystemDatabase { get; set; }
        public string CollationName { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastBackupDate { get; set; }
        public string RecoveryModel { get; set; } // Full, Simple, Bulk-logged
        public bool IsOnline { get; set; } = true;
        public string TargetServerName { get; set; }
        public string TargetDatabaseName { get; set; }
        
        // Connection strings
        public string SourceConnectionString { get; set; }
        public string TargetConnectionString { get; set; }
        
        // Migration-specific properties
        public bool MigrateData { get; set; } = true;
        public bool MigrateSchema { get; set; } = true;
        public bool MigrateUsers { get; set; } = true;
        public bool MigratePermissions { get; set; } = true;
        public bool VerifyDataIntegrity { get; set; } = true;
        public bool CreateFullBackup { get; set; } = true;
        public List<string> ExcludedTables { get; set; } = new List<string>();
        public List<string> ExcludedSchemas { get; set; } = new List<string>();
        
        // Performance settings
        public int BatchSize { get; set; } = 1000;
        public int CommandTimeout { get; set; } = 300;
        public bool UseParallelProcessing { get; set; } = true;
        public int MaxDegreeOfParallelism { get; set; } = Environment.ProcessorCount;
    }



    /// <summary>
    /// ACL rule type enumeration
    /// </summary>
    public enum ACLRuleType
    {
        Allow,
        Deny,
        Inherit,
        Replace,
        Remove
    }


    /// <summary>
    /// Log level enumeration
    /// </summary>
    public enum LogLevel
    {
        Debug,
        Information,
        Warning,
        Error,
        Critical
    }

    /// <summary>
    /// Profile validation result
    /// </summary>
    public class ProfileValidationResult
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string SourcePath { get; set; }
        public string TargetPath { get; set; }
        public bool IsValid { get; set; }
        public List<string> ValidationMessages { get; set; } = new List<string>();
        public DateTime ValidationDate { get; set; } = DateTime.Now;
        public string Severity { get; set; }
        public Dictionary<string, object> ValidationDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Session progress event arguments
    /// </summary>
    public class SessionProgressEventArgs : EventArgs
    {
        public string SessionId { get; set; }
        public string CurrentOperation { get; set; }
        public double ProgressPercentage { get; set; }
        public TimeSpan EstimatedTimeRemaining { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public Dictionary<string, object> AdditionalData { get; set; } = new Dictionary<string, object>();
    }

}
