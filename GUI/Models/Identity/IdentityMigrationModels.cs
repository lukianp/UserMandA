using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using MandADiscoverySuite.Services.Migration;

namespace MandADiscoverySuite.Models.Identity
{
    /// <summary>
    /// Enhanced Identity Migration Result for T-041: User Account Migration and Synchronization
    /// </summary>
    public class IdentityMigrationResult : INotifyPropertyChanged
    {
        private string _sourceUserSid;
        private string _targetUserSid;
        private string _targetUserUpn;
        private Dictionary<string, string> _attributeMappings = new Dictionary<string, string>();
        private List<string> _migratedGroups = new List<string>();
        private List<string> _unmappedGroups = new List<string>();
        private bool _sidHistoryCreated;
        private bool _conflictResolutionApplied;
        private string _creationMethod;
        private bool _syncRegistered;

        public string SourceUserSid
        {
            get => _sourceUserSid;
            set => SetProperty(ref _sourceUserSid, value);
        }

        public string TargetUserSid
        {
            get => _targetUserSid;
            set => SetProperty(ref _targetUserSid, value);
        }

        public string TargetUserUpn
        {
            get => _targetUserUpn;
            set => SetProperty(ref _targetUserUpn, value);
        }

        public Dictionary<string, string> AttributeMappings
        {
            get => _attributeMappings;
            set => SetProperty(ref _attributeMappings, value);
        }

        public List<string> MigratedGroups
        {
            get => _migratedGroups;
            set => SetProperty(ref _migratedGroups, value);
        }

        public List<string> UnmappedGroups
        {
            get => _unmappedGroups;
            set => SetProperty(ref _unmappedGroups, value);
        }

        public bool SidHistoryCreated
        {
            get => _sidHistoryCreated;
            set => SetProperty(ref _sidHistoryCreated, value);
        }

        public bool ConflictResolutionApplied
        {
            get => _conflictResolutionApplied;
            set => SetProperty(ref _conflictResolutionApplied, value);
        }

        public string CreationMethod
        {
            get => _creationMethod;
            set => SetProperty(ref _creationMethod, value);
        }

        public bool SyncRegistered
        {
            get => _syncRegistered;
            set => SetProperty(ref _syncRegistered, value);
        }

        public LicenseAssignmentResult LicenseAssignmentResult { get; set; }
        public Dictionary<string, object> CustomProperties { get; set; } = new Dictionary<string, object>();

        // Calculated properties for UI binding
        public bool IsSuccessful => !string.IsNullOrEmpty(TargetUserUpn) && !string.IsNullOrEmpty(TargetUserSid);
        public int TotalAttributesMapped => AttributeMappings?.Count ?? 0;
        public int TotalGroupsMigrated => MigratedGroups?.Count ?? 0;
        public bool HasLicenses => LicenseAssignmentResult?.AssignedLicenses?.Count > 0;
        public string MigrationSummary => $"Created: {CreationMethod}, Groups: {TotalGroupsMigrated}, Licenses: {LicenseAssignmentResult?.AssignedLicenses?.Count ?? 0}";

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
    /// Conflict resolution result for T-041
    /// </summary>
    public class ConflictResolutionResult : MigrationResultBase
    {
        public string RecommendedAction { get; set; } // DirectCreation, B2BInvitation, UseExisting, RenameAndCreate
        public string ResolutionStrategy { get; set; }
        public bool ConflictResolutionApplied { get; set; }
        public string ResolvedUserPrincipalName { get; set; }
        public string ResolvedSamAccountName { get; set; }
        public string ResolvedEmailAddress { get; set; }
        public string ExistingUserId { get; set; }
        public string ConflictType { get; set; }
        public List<UserConflict> DetectedConflicts { get; set; } = new List<UserConflict>();
        public Dictionary<string, object> ResolutionMetadata { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// User conflict detection and resolution information
    /// </summary>
    public class UserConflict : INotifyPropertyChanged
    {
        private string _conflictType;
        private string _conflictingValue;
        private string _existingUserId;
        private string _existingUserPrincipalName;
        private string _severity;
        private string _recommendedAction;

        public string ConflictType
        {
            get => _conflictType;
            set => SetProperty(ref _conflictType, value);
        }

        public string ConflictingValue
        {
            get => _conflictingValue;
            set => SetProperty(ref _conflictingValue, value);
        }

        public string ExistingUserId
        {
            get => _existingUserId;
            set => SetProperty(ref _existingUserId, value);
        }

        public string ExistingUserPrincipalName
        {
            get => _existingUserPrincipalName;
            set => SetProperty(ref _existingUserPrincipalName, value);
        }

        public string Severity
        {
            get => _severity;
            set => SetProperty(ref _severity, value);
        }

        public string RecommendedAction
        {
            get => _recommendedAction;
            set => SetProperty(ref _recommendedAction, value);
        }

        public DateTime DetectedDate { get; set; } = DateTime.Now;
        public string Description { get; set; }
        public List<string> ResolutionOptions { get; set; } = new List<string>();
        public bool IsBlocking => Severity == "Critical" || Severity == "High";
        public Dictionary<string, object> ConflictMetadata { get; set; } = new Dictionary<string, object>();

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
    /// Attribute mapping result for T-041
    /// </summary>
    public class AttributeMappingResult : MigrationResultBase
    {
        public string UserUpn { get; set; }
        public Dictionary<string, string> SourceAttributes { get; set; } = new Dictionary<string, string>();
        public Dictionary<string, string> MappedAttributes { get; set; } = new Dictionary<string, string>();
        public List<string> UnmappedAttributes { get; set; } = new List<string>();
        public Dictionary<string, string> AttributeTransformations { get; set; } = new Dictionary<string, string>();
        public DateTime MappingDate { get; set; } = DateTime.Now;
        public new string SessionId { get; set; }
        public List<AttributeMappingIssue> MappingIssues { get; set; } = new List<AttributeMappingIssue>();
        public bool HasTransformations => AttributeTransformations.Count > 0;
        public bool HasIssues => MappingIssues.Count > 0;
    }

    /// <summary>
    /// Attribute mapping issue
    /// </summary>
    public class AttributeMappingIssue : INotifyPropertyChanged
    {
        private string _sourceAttribute;
        private string _targetAttribute;
        private string _issueType;
        private string _severity;
        private string _description;

        public string SourceAttribute
        {
            get => _sourceAttribute;
            set => SetProperty(ref _sourceAttribute, value);
        }

        public string TargetAttribute
        {
            get => _targetAttribute;
            set => SetProperty(ref _targetAttribute, value);
        }

        public string IssueType
        {
            get => _issueType;
            set => SetProperty(ref _issueType, value);
        }

        public string Severity
        {
            get => _severity;
            set => SetProperty(ref _severity, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public string RecommendedAction { get; set; }
        public DateTime DetectedDate { get; set; } = DateTime.Now;
        public bool IsBlocking => Severity == "Critical";

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
    /// Advanced user creation result with enhanced metadata
    /// </summary>
    public class AdvancedUserCreationResult : MigrationResultBase
    {
        public string CreationMethod { get; set; } // DirectCreation, B2BInvitation, UseExisting, RenameAndCreate
        public string TargetUserUpn { get; set; }
        public string TargetUserId { get; set; }
        public bool PasswordProvisioned { get; set; }
        public bool TemporaryPassword { get; set; }
        public bool InvitationSent { get; set; }
        public string InvitationId { get; set; }
        public bool ExistingUserUsed { get; set; }
        public Dictionary<string, object> CreationMetadata { get; set; } = new Dictionary<string, object>();
        
        // Calculated properties
        public bool RequiresUserAction => InvitationSent || TemporaryPassword;
        public string CreationSummary => $"{CreationMethod}: {TargetUserUpn}";
    }

    /// <summary>
    /// B2B invitation result
    /// </summary>
    public class B2BInvitationResult : MigrationResultBase
    {
        public string InvitationId { get; set; }
        public string InvitedUserPrincipalName { get; set; }
        public string InvitedUserId { get; set; }
        public string InvitationUrl { get; set; }
        public DateTime InvitationSentDate { get; set; } = DateTime.Now;
        public bool InvitationAccepted { get; set; }
        public DateTime? InvitationAcceptedDate { get; set; }
        public string InvitationStatus { get; set; } = "Pending";
        public TimeSpan? InvitationExpiry { get; set; }
        public bool IsExpired => InvitationExpiry.HasValue && DateTime.Now > InvitationSentDate.Add(InvitationExpiry.Value);
    }

    /// <summary>
    /// User sync registration result
    /// </summary>
    public class UserSyncRegistrationResult : MigrationResultBase
    {
        public string SourceUserPrincipalName { get; set; }
        public string TargetUserPrincipalName { get; set; }
        public string SyncSchedule { get; set; }
        public DateTime NextSyncTime { get; set; }
        public List<string> AttributesToSync { get; set; } = new List<string>();
        public bool EnableBidirectionalSync { get; set; }
        public string SyncConfiguration { get; set; }
        public bool IsSyncActive => NextSyncTime > DateTime.Now;
    }

    /// <summary>
    /// User sync result
    /// </summary>
    public class UserSyncResult : MigrationResultBase
    {
        public string UserPrincipalName { get; set; }
        public int AttributesSynced { get; set; }
        public int AttributesFailed { get; set; }
        public DateTime LastSyncTime { get; set; } = DateTime.Now;
        public DateTime NextSyncTime { get; set; }
        public Dictionary<string, string> SyncedAttributes { get; set; } = new Dictionary<string, string>();
        public List<string> FailedAttributes { get; set; } = new List<string>();
        public List<SyncConflict> SyncConflicts { get; set; } = new List<SyncConflict>();
        public double SyncSuccessRate => AttributesSynced + AttributesFailed > 0 ? 
            (double)AttributesSynced / (AttributesSynced + AttributesFailed) * 100 : 0;
        public bool HasConflicts => SyncConflicts.Count > 0;
    }

    /// <summary>
    /// Synchronization conflict information
    /// </summary>
    public class SyncConflict : INotifyPropertyChanged
    {
        private string _attributeName;
        private string _sourceValue;
        private string _targetValue;
        private string _conflictType;
        private string _resolution;

        public string AttributeName
        {
            get => _attributeName;
            set => SetProperty(ref _attributeName, value);
        }

        public string SourceValue
        {
            get => _sourceValue;
            set => SetProperty(ref _sourceValue, value);
        }

        public string TargetValue
        {
            get => _targetValue;
            set => SetProperty(ref _targetValue, value);
        }

        public string ConflictType
        {
            get => _conflictType;
            set => SetProperty(ref _conflictType, value);
        }

        public string Resolution
        {
            get => _resolution;
            set => SetProperty(ref _resolution, value);
        }

        public DateTime DetectedDate { get; set; } = DateTime.Now;
        public bool IsResolved => !string.IsNullOrEmpty(Resolution);
        public List<string> ResolutionOptions { get; set; } = new List<string> { "Use Source", "Use Target", "Manual Merge", "Skip" };

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
    /// Password provisioning result
    /// </summary>
    public class PasswordProvisioningResult : MigrationResultBase
    {
        public string Password { get; set; }
        public bool IsTemporary { get; set; }
        public DateTime ExpirationDate { get; set; }
        public bool ForceChangeOnFirstLogin { get; set; }
        public string PasswordComplexity { get; set; }
        public List<string> PasswordRequirements { get; set; } = new List<string>();
        public bool MeetsComplexityRequirements { get; set; }
    }

    /// <summary>
    /// User synchronization configuration
    /// </summary>
    public class UserSyncConfiguration : INotifyPropertyChanged
    {
        private string _sourceUserPrincipalName;
        private string _targetUserPrincipalName;
        private List<string> _attributesToSync = new List<string>();
        private TimeSpan _syncInterval;
        private bool _enableBidirectionalSync;
        private bool _isActive;

        public string SourceUserPrincipalName
        {
            get => _sourceUserPrincipalName;
            set => SetProperty(ref _sourceUserPrincipalName, value);
        }

        public string TargetUserPrincipalName
        {
            get => _targetUserPrincipalName;
            set => SetProperty(ref _targetUserPrincipalName, value);
        }

        public List<string> AttributesToSync
        {
            get => _attributesToSync;
            set => SetProperty(ref _attributesToSync, value);
        }

        public TimeSpan SyncInterval
        {
            get => _syncInterval;
            set => SetProperty(ref _syncInterval, value);
        }

        public bool EnableBidirectionalSync
        {
            get => _enableBidirectionalSync;
            set => SetProperty(ref _enableBidirectionalSync, value);
        }

        public bool IsActive
        {
            get => _isActive;
            set => SetProperty(ref _isActive, value);
        }

        public DateTime LastSyncTime { get; set; }
        public DateTime NextSyncTime { get; set; }
        public Dictionary<string, string> ConflictResolutionStrategy { get; set; } = new Dictionary<string, string>();
        public List<string> ExcludedAttributes { get; set; } = new List<string>();
        public string SyncJobId { get; set; }

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
}