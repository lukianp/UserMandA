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
        public bool InvitationSent => true; // Always true when invitation exists
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

    #region Additional T-041 Models

    /// <summary>
    /// Comprehensive user migration settings for T-041 implementation
    /// </summary>
    public class UserMigrationSettings : INotifyPropertyChanged
    {
        private MigrationStrategy _migrationStrategy = MigrationStrategy.DirectCreation;
        private bool _enableConflictResolution = true;
        private bool _enableAttributeMapping = true;
        private bool _enablePasswordProvisioning = true;
        private bool _enableMfaConfiguration = false;
        private bool _enableLicenseAssignment = true;
        private bool _enableGroupMigration = false;
        private int _batchSize = 10;
        private TimeSpan _timeout = TimeSpan.FromMinutes(5);

        public MigrationStrategy MigrationStrategy
        {
            get => _migrationStrategy;
            set => SetProperty(ref _migrationStrategy, value);
        }

        public bool EnableConflictResolution
        {
            get => _enableConflictResolution;
            set => SetProperty(ref _enableConflictResolution, value);
        }

        public bool EnableAttributeMapping
        {
            get => _enableAttributeMapping;
            set => SetProperty(ref _enableAttributeMapping, value);
        }

        public bool EnablePasswordProvisioning
        {
            get => _enablePasswordProvisioning;
            set => SetProperty(ref _enablePasswordProvisioning, value);
        }

        public bool EnableMfaConfiguration
        {
            get => _enableMfaConfiguration;
            set => SetProperty(ref _enableMfaConfiguration, value);
        }

        public bool EnableLicenseAssignment
        {
            get => _enableLicenseAssignment;
            set => SetProperty(ref _enableLicenseAssignment, value);
        }

        public bool EnableGroupMigration
        {
            get => _enableGroupMigration;
            set => SetProperty(ref _enableGroupMigration, value);
        }

        public int BatchSize
        {
            get => _batchSize;
            set => SetProperty(ref _batchSize, value);
        }

        public TimeSpan Timeout
        {
            get => _timeout;
            set => SetProperty(ref _timeout, value);
        }

        public UserAttributeMapping AttributeMapping { get; set; } = new UserAttributeMapping();
        public ConflictResolutionStrategy ConflictResolution { get; set; } = new ConflictResolutionStrategy();
        public PasswordRequirements PasswordRequirements { get; set; } = new PasswordRequirements();
        public MfaSettings MfaSettings { get; set; } = new MfaSettings();
        public List<string> DefaultLicenseSkus { get; set; } = new List<string>();
        public Dictionary<string, object> CustomSettings { get; set; } = new Dictionary<string, object>();

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
    /// Migration strategy enumeration
    /// </summary>
    public enum MigrationStrategy
    {
        DirectCreation,
        B2BInvitation,
        HybridSync,
        UseExisting
    }

    /// <summary>
    /// User attribute mapping configuration
    /// </summary>
    public class UserAttributeMapping : INotifyPropertyChanged
    {
        private Dictionary<string, string> _attributeMap = new Dictionary<string, string>();
        private Dictionary<string, string> _transformationRules = new Dictionary<string, string>();
        private List<string> _requiredAttributes = new List<string>();
        private List<string> _optionalAttributes = new List<string>();

        public Dictionary<string, string> AttributeMap
        {
            get => _attributeMap;
            set => SetProperty(ref _attributeMap, value);
        }

        public Dictionary<string, string> TransformationRules
        {
            get => _transformationRules;
            set => SetProperty(ref _transformationRules, value);
        }

        public List<string> RequiredAttributes
        {
            get => _requiredAttributes;
            set => SetProperty(ref _requiredAttributes, value);
        }

        public List<string> OptionalAttributes
        {
            get => _optionalAttributes;
            set => SetProperty(ref _optionalAttributes, value);
        }

        public bool ValidateMappedAttributes { get; set; } = true;
        public bool SkipMissingAttributes { get; set; } = true;
        public string DefaultDomain { get; set; }
        public Dictionary<string, object> CustomMappings { get; set; } = new Dictionary<string, object>();

        // Default attribute mappings
        public static UserAttributeMapping CreateDefaultMapping()
        {
            return new UserAttributeMapping
            {
                AttributeMap = new Dictionary<string, string>
                {
                    ["samAccountName"] = "mailNickname",
                    ["userPrincipalName"] = "userPrincipalName",
                    ["mail"] = "mail",
                    ["displayName"] = "displayName",
                    ["givenName"] = "givenName",
                    ["surname"] = "surname",
                    ["department"] = "department",
                    ["title"] = "jobTitle",
                    ["telephoneNumber"] = "mobilePhone",
                    ["physicalDeliveryOfficeName"] = "officeLocation",
                    ["manager"] = "manager",
                    ["company"] = "companyName",
                    ["country"] = "country",
                    ["streetAddress"] = "streetAddress",
                    ["city"] = "city",
                    ["state"] = "state",
                    ["postalCode"] = "postalCode"
                },
                RequiredAttributes = new List<string>
                {
                    "userPrincipalName", "displayName", "mailNickname"
                },
                OptionalAttributes = new List<string>
                {
                    "givenName", "surname", "department", "jobTitle", "mobilePhone", 
                    "officeLocation", "manager", "companyName", "country"
                }
            };
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
    /// Conflict resolution strategy configuration
    /// </summary>
    public class ConflictResolutionStrategy : INotifyPropertyChanged
    {
        private ConflictResolutionMode _upnConflictResolution = ConflictResolutionMode.Rename;
        private ConflictResolutionMode _emailConflictResolution = ConflictResolutionMode.Skip;
        private ConflictResolutionMode _displayNameConflictResolution = ConflictResolutionMode.Append;
        private bool _enableAutomaticResolution = true;

        public ConflictResolutionMode UpnConflictResolution
        {
            get => _upnConflictResolution;
            set => SetProperty(ref _upnConflictResolution, value);
        }

        public ConflictResolutionMode EmailConflictResolution
        {
            get => _emailConflictResolution;
            set => SetProperty(ref _emailConflictResolution, value);
        }

        public ConflictResolutionMode DisplayNameConflictResolution
        {
            get => _displayNameConflictResolution;
            set => SetProperty(ref _displayNameConflictResolution, value);
        }

        public bool EnableAutomaticResolution
        {
            get => _enableAutomaticResolution;
            set => SetProperty(ref _enableAutomaticResolution, value);
        }

        public string RenamingPattern { get; set; } = "{original}_{increment}";
        public string AppendPattern { get; set; } = "{original} ({increment})";
        public int MaxRenameAttempts { get; set; } = 10;
        public Dictionary<string, ConflictResolutionMode> CustomResolutions { get; set; } = new Dictionary<string, ConflictResolutionMode>();

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
    /// Conflict resolution mode enumeration
    /// </summary>
    public enum ConflictResolutionMode
    {
        Skip,
        Rename,
        Append,
        Overwrite,
        UseExisting,
        PromptUser
    }

    /// <summary>
    /// Password requirements configuration
    /// </summary>
    public class PasswordRequirements : INotifyPropertyChanged
    {
        private int _minimumLength = 12;
        private bool _requireUppercase = true;
        private bool _requireLowercase = true;
        private bool _requireNumbers = true;
        private bool _requireSpecialCharacters = true;
        private bool _forceChangeOnFirstLogin = true;
        private TimeSpan _expirationPeriod = TimeSpan.FromDays(90);

        public int MinimumLength
        {
            get => _minimumLength;
            set => SetProperty(ref _minimumLength, value);
        }

        public bool RequireUppercase
        {
            get => _requireUppercase;
            set => SetProperty(ref _requireUppercase, value);
        }

        public bool RequireLowercase
        {
            get => _requireLowercase;
            set => SetProperty(ref _requireLowercase, value);
        }

        public bool RequireNumbers
        {
            get => _requireNumbers;
            set => SetProperty(ref _requireNumbers, value);
        }

        public bool RequireSpecialCharacters
        {
            get => _requireSpecialCharacters;
            set => SetProperty(ref _requireSpecialCharacters, value);
        }

        public bool ForceChangeOnFirstLogin
        {
            get => _forceChangeOnFirstLogin;
            set => SetProperty(ref _forceChangeOnFirstLogin, value);
        }

        public TimeSpan ExpirationPeriod
        {
            get => _expirationPeriod;
            set => SetProperty(ref _expirationPeriod, value);
        }

        public List<string> ExcludedCharacters { get; set; } = new List<string>();
        public List<string> ExcludedWords { get; set; } = new List<string>();
        public bool PreventPasswordReuse { get; set; } = true;
        public int PasswordHistoryCount { get; set; } = 12;

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
    /// MFA settings configuration
    /// </summary>
    public class MfaSettings : INotifyPropertyChanged
    {
        private bool _enableMfa = false;
        private MfaEnforcementMode _enforcementMode = MfaEnforcementMode.Optional;
        private List<MfaMethod> _allowedMethods = new List<MfaMethod> { MfaMethod.PhoneCall, MfaMethod.TextMessage, MfaMethod.MobileApp };

        public bool EnableMfa
        {
            get => _enableMfa;
            set => SetProperty(ref _enableMfa, value);
        }

        public MfaEnforcementMode EnforcementMode
        {
            get => _enforcementMode;
            set => SetProperty(ref _enforcementMode, value);
        }

        public List<MfaMethod> AllowedMethods
        {
            get => _allowedMethods;
            set => SetProperty(ref _allowedMethods, value);
        }

        public bool RequireMfaRegistration { get; set; } = true;
        public TimeSpan GracePeriod { get; set; } = TimeSpan.FromDays(7);
        public Dictionary<string, object> CustomMfaSettings { get; set; } = new Dictionary<string, object>();

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
    /// MFA enforcement mode enumeration
    /// </summary>
    public enum MfaEnforcementMode
    {
        Disabled,
        Optional,
        Required,
        RequiredForAdmins
    }

    /// <summary>
    /// MFA method enumeration
    /// </summary>
    public enum MfaMethod
    {
        PhoneCall,
        TextMessage,
        MobileApp,
        HardwareToken,
        Email
    }

    #endregion

    #region Result Models

    /// <summary>
    /// Comprehensive user migration result
    /// </summary>
    public class UserMigrationResult : MigrationResultBase
    {
        public string SourceUserPrincipalName { get; set; }
        public string TargetUserPrincipalName { get; set; }
        public string TargetUserId { get; set; }
        public MigrationStrategy StrategyUsed { get; set; }
        public AttributeMappingResult AttributeMapping { get; set; }
        public ConflictResolutionResult ConflictResolution { get; set; }
        public PasswordProvisioningResult PasswordProvisioning { get; set; }
        public B2BInvitationResult B2BInvitation { get; set; }
        public UserSyncRegistrationResult SyncRegistration { get; set; }
        public LicenseAssignmentResult LicenseAssignment { get; set; }
        public List<MfaConfigurationResult> MfaConfiguration { get; set; } = new List<MfaConfigurationResult>();
        public List<string> CreatedGroups { get; set; } = new List<string>();
        public Dictionary<string, object> ExtendedProperties { get; set; } = new Dictionary<string, object>();

        // Calculated properties
        public bool IsFullyMigrated => !string.IsNullOrEmpty(TargetUserId) && AttributeMapping?.IsSuccess == true;
        public bool HasLicenses => LicenseAssignment?.AssignedLicenses?.Count > 0;
        public bool RequiresUserAction => B2BInvitation?.InvitationSent == true || PasswordProvisioning?.IsTemporary == true;
        public string MigrationSummary => $"{StrategyUsed}: {TargetUserPrincipalName} ({(IsFullyMigrated ? "Success" : "Partial")})";
    }

    /// <summary>
    /// User account creation result
    /// </summary>
    public class UserAccountCreationResult : MigrationResultBase
    {
        public string TargetUserId { get; set; }
        public string TargetUserPrincipalName { get; set; }
        public string GeneratedPassword { get; set; }
        public bool PasswordIsTemporary { get; set; }
        public DateTime AccountCreatedDate { get; set; } = DateTime.Now;
        public bool AccountEnabled { get; set; } = true;
        public Dictionary<string, string> CreatedAttributes { get; set; } = new Dictionary<string, string>();
        public List<string> ValidationWarnings { get; set; } = new List<string>();
    }

    /// <summary>
    /// User invitation result  
    /// </summary>
    public class UserInvitationResult : MigrationResultBase
    {
        public string InvitationId { get; set; }
        public string InvitedUserEmail { get; set; }
        public string InvitationUrl { get; set; }
        public DateTime InvitationSentDate { get; set; } = DateTime.Now;
        public DateTime InvitationExpiryDate { get; set; }
        public string InvitationMessage { get; set; }
        public bool RedirectUrlProvided { get; set; }
        public string InvitationStatus { get; set; } = "Pending";
    }

    /// <summary>
    /// User update result
    /// </summary>
    public class UserUpdateResult : MigrationResultBase
    {
        public string TargetUserId { get; set; }
        public Dictionary<string, string> UpdatedAttributes { get; set; } = new Dictionary<string, string>();
        public List<string> FailedAttributes { get; set; } = new List<string>();
        public DateTime UpdatedDate { get; set; } = DateTime.Now;
        public int AttributesUpdated => UpdatedAttributes?.Count ?? 0;
        public int AttributesFailed => FailedAttributes?.Count ?? 0;
        public bool IsPartialUpdate => AttributesFailed > 0;
    }

    /// <summary>
    /// User synchronization result
    /// </summary>
    public class UserSynchronizationResult : MigrationResultBase
    {
        public int TotalUsers { get; set; }
        public int SuccessfulUsers { get; set; }
        public int FailedUsers { get; set; }
        public int SkippedUsers { get; set; }
        public List<UserSyncResult> UserResults { get; set; } = new List<UserSyncResult>();
        public DateTime SyncStartTime { get; set; }
        public DateTime SyncEndTime { get; set; }
        public TimeSpan TotalSyncTime => SyncEndTime - SyncStartTime;
        public double SuccessRate => TotalUsers > 0 ? (double)SuccessfulUsers / TotalUsers * 100 : 0;
    }

    /// <summary>
    /// User migration conflict
    /// </summary>
    public class UserMigrationConflict : INotifyPropertyChanged
    {
        private string _conflictType;
        private string _sourceValue;
        private string _conflictingValue;
        private string _severity;
        private string _recommendedAction;

        public string SourceUserPrincipalName { get; set; }
        public string ConflictType
        {
            get => _conflictType;
            set => SetProperty(ref _conflictType, value);
        }

        public string SourceValue
        {
            get => _sourceValue;
            set => SetProperty(ref _sourceValue, value);
        }

        public string ConflictingValue
        {
            get => _conflictingValue;
            set => SetProperty(ref _conflictingValue, value);
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

        public string ExistingUserId { get; set; }
        public string Description { get; set; }
        public DateTime DetectedDate { get; set; } = DateTime.Now;
        public List<string> ResolutionOptions { get; set; } = new List<string>();
        public Dictionary<string, object> ConflictMetadata { get; set; } = new Dictionary<string, object>();
        public bool IsBlocking => Severity == "Critical" || Severity == "High";

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
    /// Conflict resolution
    /// </summary>
    public class ConflictResolution : INotifyPropertyChanged
    {
        private ConflictResolutionMode _resolutionMode;
        private string _resolvedValue;

        public string ConflictId { get; set; }
        public ConflictResolutionMode ResolutionMode
        {
            get => _resolutionMode;
            set => SetProperty(ref _resolutionMode, value);
        }

        public string ResolvedValue
        {
            get => _resolvedValue;
            set => SetProperty(ref _resolvedValue, value);
        }

        public string ResolvedBy { get; set; }
        public DateTime ResolvedDate { get; set; } = DateTime.Now;
        public Dictionary<string, object> ResolutionMetadata { get; set; } = new Dictionary<string, object>();

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
    /// MFA configuration result
    /// </summary>
    public class MfaConfigurationResult : MigrationResultBase
    {
        public string TargetUserId { get; set; }
        public string UserPrincipalName { get; set; }
        public bool MfaEnabled { get; set; }
        public List<MfaMethod> ConfiguredMethods { get; set; } = new List<MfaMethod>();
        public bool RequiresUserRegistration { get; set; }
        public DateTime ConfiguredDate { get; set; } = DateTime.Now;
        public List<string> ConfigurationErrors { get; set; } = new List<string>();
    }

    /// <summary>
    /// User validation result
    /// </summary>
    public class UserValidationResult : MigrationResultBase
    {
        public string TargetUserId { get; set; }
        public string UserPrincipalName { get; set; }
        public bool CanAuthenticate { get; set; }
        public bool CanAccessResources { get; set; }
        public bool LicensesAssigned { get; set; }
        public bool MfaConfigured { get; set; }
        public DateTime ValidationDate { get; set; } = DateTime.Now;
        public List<string> ValidationTests { get; set; } = new List<string>();
        public List<string> FailedTests { get; set; } = new List<string>();
        public Dictionary<string, object> ValidationMetadata { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Identity connectivity result
    /// </summary>
    public class IdentityConnectivityResult : MigrationResultBase
    {
        public bool SourceConnectivity { get; set; }
        public bool TargetConnectivity { get; set; }
        public string SourceConnectionDetails { get; set; }
        public string TargetConnectionDetails { get; set; }
        public DateTime TestedDate { get; set; } = DateTime.Now;
        public List<string> SourceTests { get; set; } = new List<string>();
        public List<string> TargetTests { get; set; } = new List<string>();
        public List<string> FailedTests { get; set; } = new List<string>();
        public Dictionary<string, TimeSpan> ResponseTimes { get; set; } = new Dictionary<string, TimeSpan>();
    }

    /// <summary>
    /// Attribute mapping validation result
    /// </summary>
    public class AttributeMappingValidationResult : MigrationResultBase
    {
        public bool IsValid { get; set; }
        public int ValidMappings { get; set; }
        public int InvalidMappings { get; set; }
        public List<AttributeMappingIssue> ValidationIssues { get; set; } = new List<AttributeMappingIssue>();
        public List<string> MissingRequiredMappings { get; set; } = new List<string>();
        public DateTime ValidatedDate { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// User sync status
    /// </summary>
    public class UserSyncStatus : INotifyPropertyChanged
    {
        private string _status;
        private DateTime _lastSyncTime;
        private DateTime _nextSyncTime;

        public string SourceUserPrincipalName { get; set; }
        public string TargetUserPrincipalName { get; set; }
        public string Status
        {
            get => _status;
            set => SetProperty(ref _status, value);
        }

        public DateTime LastSyncTime
        {
            get => _lastSyncTime;
            set => SetProperty(ref _lastSyncTime, value);
        }

        public DateTime NextSyncTime
        {
            get => _nextSyncTime;
            set => SetProperty(ref _nextSyncTime, value);
        }

        public string SyncJobId { get; set; }
        public bool IsActive { get; set; }
        public List<string> LastSyncedAttributes { get; set; } = new List<string>();
        public Dictionary<string, string> SyncedAttributes { get; set; } = new Dictionary<string, string>();
        public List<string> SyncErrors { get; set; } = new List<string>();
        public Dictionary<string, object> SyncMetadata { get; set; } = new Dictionary<string, object>();

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

    #endregion

    #region Event Args and Settings Models

    /// <summary>
    /// User migration progress event args
    /// </summary>
    public class UserMigrationProgressEventArgs : EventArgs
    {
        public string UserPrincipalName { get; set; }
        public string CurrentStep { get; set; }
        public int ProgressPercentage { get; set; }
        public string StatusMessage { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public Dictionary<string, object> ExtendedData { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// User migration conflict event args
    /// </summary>
    public class UserMigrationConflictEventArgs : EventArgs
    {
        public UserMigrationConflict Conflict { get; set; }
        public string UserPrincipalName { get; set; }
        public bool RequiresUserInput { get; set; }
        public DateTime DetectedAt { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// User sync status event args
    /// </summary>
    public class UserSyncStatusEventArgs : EventArgs
    {
        public UserSyncStatus SyncStatus { get; set; }
        public string EventType { get; set; } // Started, Completed, Failed, Cancelled
        public string Details { get; set; }
        public DateTime EventTime { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// Batch migration progress event args
    /// </summary>
    public class BatchMigrationProgress : EventArgs
    {
        public int TotalUsers { get; set; }
        public int ProcessedUsers { get; set; }
        public int SuccessfulUsers { get; set; }
        public int FailedUsers { get; set; }
        public int SkippedUsers { get; set; }
        public string CurrentUserPrincipalName { get; set; }
        public int ProgressPercentage => TotalUsers > 0 ? (ProcessedUsers * 100) / TotalUsers : 0;
        public DateTime ProgressTime { get; set; } = DateTime.Now;
        public TimeSpan EstimatedTimeRemaining { get; set; }
    }

    /// <summary>
    /// User account creation settings
    /// </summary>
    public class UserAccountCreationSettings : INotifyPropertyChanged
    {
        private bool _generatePassword = true;
        private bool _sendWelcomeEmail = false;
        private bool _enableAccount = true;
        private string _defaultDomain;

        public bool GeneratePassword
        {
            get => _generatePassword;
            set => SetProperty(ref _generatePassword, value);
        }

        public bool SendWelcomeEmail
        {
            get => _sendWelcomeEmail;
            set => SetProperty(ref _sendWelcomeEmail, value);
        }

        public bool EnableAccount
        {
            get => _enableAccount;
            set => SetProperty(ref _enableAccount, value);
        }

        public string DefaultDomain
        {
            get => _defaultDomain;
            set => SetProperty(ref _defaultDomain, value);
        }

        public PasswordRequirements PasswordRequirements { get; set; } = new PasswordRequirements();
        public List<string> DefaultGroups { get; set; } = new List<string>();
        public Dictionary<string, object> DefaultAttributes { get; set; } = new Dictionary<string, object>();
        public string WelcomeEmailTemplate { get; set; }

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
    /// User invitation settings
    /// </summary>
    public class UserInvitationSettings : INotifyPropertyChanged
    {
        private bool _sendInvitationEmail = true;
        private TimeSpan _invitationExpiry = TimeSpan.FromDays(7);
        private string _redirectUrl;

        public bool SendInvitationEmail
        {
            get => _sendInvitationEmail;
            set => SetProperty(ref _sendInvitationEmail, value);
        }

        public TimeSpan InvitationExpiry
        {
            get => _invitationExpiry;
            set => SetProperty(ref _invitationExpiry, value);
        }

        public string RedirectUrl
        {
            get => _redirectUrl;
            set => SetProperty(ref _redirectUrl, value);
        }

        public string CustomMessage { get; set; }
        public string InvitationTemplate { get; set; }
        public List<string> DefaultGroups { get; set; } = new List<string>();
        public Dictionary<string, object> CustomProperties { get; set; } = new Dictionary<string, object>();

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
    /// User update settings
    /// </summary>
    public class UserUpdateSettings : INotifyPropertyChanged
    {
        private bool _updateOnlyChangedAttributes = true;
        private bool _preserveTargetOnlyAttributes = true;
        private bool _validateUpdates = true;

        public bool UpdateOnlyChangedAttributes
        {
            get => _updateOnlyChangedAttributes;
            set => SetProperty(ref _updateOnlyChangedAttributes, value);
        }

        public bool PreserveTargetOnlyAttributes
        {
            get => _preserveTargetOnlyAttributes;
            set => SetProperty(ref _preserveTargetOnlyAttributes, value);
        }

        public bool ValidateUpdates
        {
            get => _validateUpdates;
            set => SetProperty(ref _validateUpdates, value);
        }

        public List<string> ExcludedAttributes { get; set; } = new List<string>();
        public Dictionary<string, object> ForceUpdateAttributes { get; set; } = new Dictionary<string, object>();
        
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
    /// User synchronization settings
    /// </summary>
    public class UserSynchronizationSettings : INotifyPropertyChanged
    {
        private TimeSpan _syncInterval = TimeSpan.FromHours(24);
        private bool _enableBidirectionalSync = false;
        private bool _resolveConflictsAutomatically = true;

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

        public bool ResolveConflictsAutomatically
        {
            get => _resolveConflictsAutomatically;
            set => SetProperty(ref _resolveConflictsAutomatically, value);
        }

        public List<string> AttributesToSync { get; set; } = new List<string>();
        public List<string> ExcludedAttributes { get; set; } = new List<string>();
        public Dictionary<string, string> ConflictResolutionRules { get; set; } = new Dictionary<string, string>();
        public bool EnableScheduledSync { get; set; } = true;
        public bool EnableDeltaSync { get; set; } = true;

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
    /// Periodic sync settings
    /// </summary>
    public class PeriodicSyncSettings : INotifyPropertyChanged
    {
        private TimeSpan _syncInterval = TimeSpan.FromDays(1);
        private bool _enableScheduler = true;
        private DateTime _firstSyncTime = DateTime.Now.AddHours(1);

        public TimeSpan SyncInterval
        {
            get => _syncInterval;
            set => SetProperty(ref _syncInterval, value);
        }

        public bool EnableScheduler
        {
            get => _enableScheduler;
            set => SetProperty(ref _enableScheduler, value);
        }

        public DateTime FirstSyncTime
        {
            get => _firstSyncTime;
            set => SetProperty(ref _firstSyncTime, value);
        }

        public List<DayOfWeek> SyncDays { get; set; } = new List<DayOfWeek>();
        public List<int> SyncHours { get; set; } = new List<int>();
        public UserSynchronizationSettings SyncSettings { get; set; } = new UserSynchronizationSettings();
        public int MaxConcurrentSyncs { get; set; } = 5;
        public bool EnableRetryOnFailure { get; set; } = true;
        public int MaxRetryAttempts { get; set; } = 3;

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

    #endregion
}