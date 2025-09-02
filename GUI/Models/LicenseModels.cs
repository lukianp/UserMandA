using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Enterprise license assignment and compliance models for T-038 implementation.
    /// Supports comprehensive license management for M&A scenarios with dual tenant operations.
    /// </summary>
    
    /// <summary>
    /// Represents a Microsoft 365 license SKU with capabilities and requirements
    /// </summary>
    public class LicenseSku : INotifyPropertyChanged
    {
        private string _skuId;
        private string _skuPartNumber;
        private string _displayName;
        private int _availableUnits;
        private int _assignedUnits;
        private bool _isEnabled;
        private decimal _monthlyCost;

        public string SkuId
        {
            get => _skuId;
            set => SetProperty(ref _skuId, value);
        }

        public string SkuPartNumber
        {
            get => _skuPartNumber;
            set => SetProperty(ref _skuPartNumber, value);
        }

        public string DisplayName
        {
            get => _displayName;
            set => SetProperty(ref _displayName, value);
        }

        public int AvailableUnits
        {
            get => _availableUnits;
            set => SetProperty(ref _availableUnits, value);
        }

        public int AssignedUnits
        {
            get => _assignedUnits;
            set => SetProperty(ref _assignedUnits, value);
        }

        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }

        public decimal MonthlyCost
        {
            get => _monthlyCost;
            set => SetProperty(ref _monthlyCost, value);
        }

        // Calculated properties
        public int RemainingUnits => AvailableUnits - AssignedUnits;
        public bool HasAvailableUnits => RemainingUnits > 0;
        public double UtilizationPercentage => AvailableUnits > 0 ? (double)AssignedUnits / AvailableUnits * 100 : 0;

        // Service Plans included in this SKU
        public List<ServicePlan> ServicePlans { get; set; } = new();
        
        // Features and capabilities
        public List<string> Features { get; set; } = new();
        public List<string> Applications { get; set; } = new();
        public Dictionary<string, object> Properties { get; set; } = new();

        // Metadata
        public DateTime LastUpdated { get; set; } = DateTime.Now;
        public string Category { get; set; } // Enterprise, Business, Frontline, etc.
        public LicenseTier Tier { get; set; } = LicenseTier.Standard;
        public bool RequiresAzureAD { get; set; }
        public bool RequiresExchange { get; set; }
        public bool RequiresSharePoint { get; set; }

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
    /// Service plan within a license SKU (e.g., Exchange Online, SharePoint Online)
    /// </summary>
    public class ServicePlan
    {
        public string ServicePlanId { get; set; }
        public string ServicePlanName { get; set; }
        public string DisplayName { get; set; }
        public string ProvisioningStatus { get; set; } // Success, Disabled, PendingInput, etc.
        public bool IsEnabled { get; set; }
        public string ServiceType { get; set; } // Exchange, SharePoint, Teams, etc.
        public Dictionary<string, object> Properties { get; set; } = new();
    }

    /// <summary>
    /// User license assignment with compliance tracking
    /// </summary>
    public class UserLicenseAssignment : INotifyPropertyChanged
    {
        private string _userId;
        private string _userPrincipalName;
        private string _displayName;
        private LicenseAssignmentStatus _status;
        private DateTime _assignedDate;
        private DateTime? _lastModified;

        public string UserId
        {
            get => _userId;
            set => SetProperty(ref _userId, value);
        }

        public string UserPrincipalName
        {
            get => _userPrincipalName;
            set => SetProperty(ref _userPrincipalName, value);
        }

        public string DisplayName
        {
            get => _displayName;
            set => SetProperty(ref _displayName, value);
        }

        public LicenseAssignmentStatus Status
        {
            get => _status;
            set => SetProperty(ref _status, value);
        }

        public DateTime AssignedDate
        {
            get => _assignedDate;
            set => SetProperty(ref _assignedDate, value);
        }

        public DateTime? LastModified
        {
            get => _lastModified;
            set => SetProperty(ref _lastModified, value);
        }

        // License details
        public List<LicenseSku> AssignedSkus { get; set; } = new();
        public List<LicenseSku> RequiredSkus { get; set; } = new();
        public List<LicenseSku> RecommendedSkus { get; set; } = new();
        
        // User context information
        public string Department { get; set; }
        public string JobTitle { get; set; }
        public string EmployeeType { get; set; }
        public string Country { get; set; }
        public string UsageLocation { get; set; }
        public bool IsEnabled { get; set; } = true;
        
        // Migration context
        public string SourceTenant { get; set; }
        public string TargetTenant { get; set; }
        public string WaveId { get; set; }
        public string BatchId { get; set; }
        public MigrationPriority Priority { get; set; } = MigrationPriority.Normal;
        
        // Compliance and validation
        public List<ComplianceIssue> ComplianceIssues { get; set; } = new();
        public List<string> ValidationErrors { get; set; } = new();
        public List<string> ValidationWarnings { get; set; } = new();
        public bool IsCompliant => ComplianceIssues.All(i => i.IsResolved);
        
        // Cost tracking
        public decimal MonthlyCost => AssignedSkus.Sum(s => s.MonthlyCost);
        public decimal ProjectedMonthlyCost => RequiredSkus.Sum(s => s.MonthlyCost);
        
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
    /// License mapping rule for automated assignment
    /// </summary>
    public class LicenseMappingRule
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string Description { get; set; }
        public int Priority { get; set; } = 1;
        public bool IsEnabled { get; set; } = true;
        
        // Rule conditions
        public List<LicenseRuleCondition> Conditions { get; set; } = new();
        
        // Assignment actions
        public List<string> AssignSkuIds { get; set; } = new();
        public List<string> RemoveSkuIds { get; set; } = new();
        public List<string> DisableServicePlans { get; set; } = new();
        
        // Rule metadata
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public string CreatedBy { get; set; }
        public DateTime? LastModified { get; set; }
        public string ModifiedBy { get; set; }
        
        // Usage tracking
        public int TimesApplied { get; set; }
        public DateTime? LastApplied { get; set; }
        public List<string> AffectedUsers { get; set; } = new();
        
        // Validation
        public bool IsValid { get; set; } = true;
        public List<string> ValidationErrors { get; set; } = new();
    }

    /// <summary>
    /// Condition for license mapping rules
    /// </summary>
    public class LicenseRuleCondition
    {
        public string Property { get; set; } // Department, JobTitle, Country, etc.
        public LicenseRuleOperator Operator { get; set; }
        public string Value { get; set; }
        public bool IsCaseSensitive { get; set; }
        public LicenseRuleLogic Logic { get; set; } = LicenseRuleLogic.And;
    }

    /// <summary>
    /// Compliance issue for license assignments
    /// </summary>
    public class ComplianceIssue : INotifyPropertyChanged
    {
        private string _issueType;
        private string _severity;
        private string _description;
        private bool _isResolved;
        private DateTime _detectedDate;
        private DateTime? _resolvedDate;

        public string Id { get; set; } = Guid.NewGuid().ToString();

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

        public bool IsResolved
        {
            get => _isResolved;
            set => SetProperty(ref _isResolved, value);
        }

        public DateTime DetectedDate
        {
            get => _detectedDate;
            set => SetProperty(ref _detectedDate, value);
        }

        public DateTime? ResolvedDate
        {
            get => _resolvedDate;
            set => SetProperty(ref _resolvedDate, value);
        }

        public string UserId { get; set; }
        public string UserPrincipalName { get; set; }
        public string RecommendedAction { get; set; }
        public string ResolvedBy { get; set; }
        public string Resolution { get; set; }
        public Dictionary<string, object> IssueDetails { get; set; } = new();

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
    /// License assignment operation result
    /// </summary>
    public class LicenseAssignmentResult
    {
        public string UserId { get; set; }
        public string UserPrincipalName { get; set; }
        public bool IsSuccess { get; set; }
        public string Operation { get; set; } // Assign, Remove, Update
        public List<string> AssignedSkus { get; set; } = new();
        public List<string> RemovedSkus { get; set; } = new();
        public List<string> FailedSkus { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public DateTime ProcessedDate { get; set; } = DateTime.Now;
        public TimeSpan ProcessingTime { get; set; }
        public Dictionary<string, object> Details { get; set; } = new();
    }

    /// <summary>
    /// Bulk license operation request
    /// </summary>
    public class BulkLicenseOperation
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string Description { get; set; }
        public BulkLicenseOperationType OperationType { get; set; }
        public List<string> UserIds { get; set; } = new();
        public List<string> SkuIds { get; set; } = new();
        public List<string> ServicePlansToDisable { get; set; } = new();
        public BulkOperationStatus Status { get; set; } = BulkOperationStatus.NotStarted;
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? StartedDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string CreatedBy { get; set; }
        public List<LicenseAssignmentResult> Results { get; set; } = new();
        public int TotalUsers => UserIds.Count;
        public int ProcessedUsers => Results.Count;
        public int SuccessfulUsers => Results.Count(r => r.IsSuccess);
        public int FailedUsers => Results.Count(r => !r.IsSuccess);
        public double ProgressPercentage => TotalUsers > 0 ? (double)ProcessedUsers / TotalUsers * 100 : 0;
    }

    /// <summary>
    /// License compliance report
    /// </summary>
    public class LicenseComplianceReport : INotifyPropertyChanged
    {
        private DateTime _generatedDate;
        private int _totalUsers;
        private int _compliantUsers;
        private int _nonCompliantUsers;
        private int _unlicensedUsers;

        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string Description { get; set; }

        public DateTime GeneratedDate
        {
            get => _generatedDate;
            set => SetProperty(ref _generatedDate, value);
        }

        public int TotalUsers
        {
            get => _totalUsers;
            set => SetProperty(ref _totalUsers, value);
        }

        public int CompliantUsers
        {
            get => _compliantUsers;
            set => SetProperty(ref _compliantUsers, value);
        }

        public int NonCompliantUsers
        {
            get => _nonCompliantUsers;
            set => SetProperty(ref _nonCompliantUsers, value);
        }

        public int UnlicensedUsers
        {
            get => _unlicensedUsers;
            set => SetProperty(ref _unlicensedUsers, value);
        }

        // Calculated properties
        public double CompliancePercentage => TotalUsers > 0 ? (double)CompliantUsers / TotalUsers * 100 : 0;
        public double NonCompliancePercentage => TotalUsers > 0 ? (double)NonCompliantUsers / TotalUsers * 100 : 0;

        // Report data
        public List<UserLicenseAssignment> UserAssignments { get; set; } = new();
        public List<ComplianceIssue> ComplianceIssues { get; set; } = new();
        public List<LicenseSku> AvailableSkus { get; set; } = new();
        public Dictionary<string, int> SkuUtilization { get; set; } = new();
        public Dictionary<string, decimal> CostBreakdown { get; set; } = new();
        
        // Summary statistics
        public decimal TotalMonthlyCost => UserAssignments.Sum(u => u.MonthlyCost);
        public int TotalAssignedLicenses => UserAssignments.SelectMany(u => u.AssignedSkus).Count();
        public int TotalComplianceIssues => ComplianceIssues.Count;
        public int CriticalIssues => ComplianceIssues.Count(i => i.Severity == "Critical");
        public int HighIssues => ComplianceIssues.Count(i => i.Severity == "High");
        
        // Metadata
        public string GeneratedBy { get; set; }
        public TimeSpan GenerationTime { get; set; }
        public Dictionary<string, object> ReportParameters { get; set; } = new();

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
    /// License assignment settings for migration waves
    /// </summary>
    public class WaveLicenseSettings
    {
        public string WaveId { get; set; }
        public string WaveName { get; set; }
        public List<string> DefaultSkuIds { get; set; } = new();
        public List<LicenseMappingRule> CustomMappingRules { get; set; } = new();
        public bool AutoAssignLicenses { get; set; } = true;
        public bool RemoveSourceLicenses { get; set; } = false;
        public bool ValidateBeforeAssignment { get; set; } = true;
        public bool RequireApproval { get; set; } = false;
        public string ApproverEmail { get; set; }
        public Dictionary<string, object> Settings { get; set; } = new();
    }

    /// <summary>
    /// Enumerations for license management
    /// </summary>
    public enum LicenseTier
    {
        Frontline,
        Standard,
        Premium,
        Enterprise,
        Developer
    }

    public enum LicenseAssignmentStatus
    {
        NotAssigned,
        Assigned,
        PendingAssignment,
        Failed,
        Expired,
        Suspended,
        PendingRemoval
    }

    public enum LicenseRuleOperator
    {
        Equals,
        NotEquals,
        Contains,
        NotContains,
        StartsWith,
        EndsWith,
        In,
        NotIn,
        GreaterThan,
        LessThan,
        IsEmpty,
        IsNotEmpty
    }

    public enum LicenseRuleLogic
    {
        And,
        Or
    }

    public enum BulkLicenseOperationType
    {
        Assign,
        Remove,
        Update,
        Sync
    }

    public enum BulkOperationStatus
    {
        NotStarted,
        InProgress,
        Completed,
        CompletedWithErrors,
        Failed,
        Cancelled
    }

    /// <summary>
    /// Static data for common Microsoft 365 SKUs and service plans
    /// </summary>
    public static class CommonLicenseSkus
    {
        public static readonly Dictionary<string, string> SkuDisplayNames = new()
        {
            { "SPE_E3", "Microsoft 365 E3" },
            { "SPE_E5", "Microsoft 365 E5" },
            { "O365_BUSINESS_ESSENTIALS", "Microsoft 365 Business Basic" },
            { "O365_BUSINESS_PREMIUM", "Microsoft 365 Business Standard" },
            { "SPB", "Microsoft 365 Business Premium" },
            { "EXCHANGESTANDARD", "Exchange Online Plan 1" },
            { "EXCHANGEENTERPRISE", "Exchange Online Plan 2" },
            { "SHAREPOINTSTANDARD", "SharePoint Online Plan 1" },
            { "SHAREPOINTENTERPRISE", "SharePoint Online Plan 2" },
            { "TEAMS1", "Microsoft Teams (Free)" },
            { "MCOMEETADV", "Microsoft 365 Audio Conferencing" },
            { "AAD_PREMIUM", "Azure Active Directory Premium P1" },
            { "AAD_PREMIUM_P2", "Azure Active Directory Premium P2" },
            { "INTUNE_A", "Microsoft Intune" },
            { "POWER_BI_PRO", "Power BI Pro" },
            { "FLOW_FREE", "Power Automate (Free)" },
            { "POWERAPPS_VIRAL", "Power Apps Plan 1" }
        };

        public static readonly Dictionary<string, List<string>> SkuServicePlans = new()
        {
            { "SPE_E3", new List<string> { "EXCHANGE_S_ENTERPRISE", "SHAREPOINTENTERPRISE", "OFFICESUBSCRIPTION", "MCOSTANDARD", "AAD_PREMIUM" } },
            { "SPE_E5", new List<string> { "EXCHANGE_S_ENTERPRISE", "SHAREPOINTENTERPRISE", "OFFICESUBSCRIPTION", "MCOSTANDARD", "AAD_PREMIUM_P2", "THREAT_INTELLIGENCE", "LOCKBOX_ENTERPRISE" } },
            { "O365_BUSINESS_PREMIUM", new List<string> { "EXCHANGE_S_STANDARD", "SHAREPOINTSTANDARD", "OFFICESUBSCRIPTION", "MCOSTANDARD" } }
        };

        public static readonly Dictionary<string, decimal> SkuMonthlyCosts = new()
        {
            { "SPE_E3", 32.00m },
            { "SPE_E5", 57.00m },
            { "O365_BUSINESS_ESSENTIALS", 6.00m },
            { "O365_BUSINESS_PREMIUM", 22.00m },
            { "SPB", 22.00m },
            { "EXCHANGESTANDARD", 4.00m },
            { "EXCHANGEENTERPRISE", 8.00m },
            { "AAD_PREMIUM", 6.00m },
            { "AAD_PREMIUM_P2", 9.00m },
            { "INTUNE_A", 6.00m }
        };

        public static readonly Dictionary<string, LicenseTier> SkuTiers = new()
        {
            { "SPE_E3", LicenseTier.Enterprise },
            { "SPE_E5", LicenseTier.Enterprise },
            { "O365_BUSINESS_ESSENTIALS", LicenseTier.Standard },
            { "O365_BUSINESS_PREMIUM", LicenseTier.Premium },
            { "SPB", LicenseTier.Premium }
        };
    }
}