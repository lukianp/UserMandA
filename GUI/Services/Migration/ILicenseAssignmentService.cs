using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// License assignment service for M&A migration compliance (T-038)
    /// Manages license assignment, compliance checking, and cost optimization
    /// </summary>
    public interface ILicenseAssignmentService
    {
        /// <summary>
        /// Assign licenses to user based on role mapping and business rules
        /// </summary>
        Task<LicenseAssignmentResult> AssignLicensesAsync(string userPrincipalName, List<string> requestedLicenses, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Remove unnecessary licenses to optimize costs
        /// </summary>
        Task<LicenseRemovalResult> RemoveLicensesAsync(string userPrincipalName, List<string> licensesToRemove, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Check license compliance against business rules and requirements
        /// </summary>
        Task<LicenseComplianceResult> CheckComplianceAsync(string userPrincipalName, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Get available license inventory in target tenant
        /// </summary>
        Task<LicenseInventoryResult> GetAvailableLicensesAsync(MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Map source user role to target license SKUs using business rules
        /// </summary>
        Task<LicenseMappingResult> MapUserRoleToLicensesAsync(UserProfileItem user, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Generate compliance report for all users in wave
        /// </summary>
        Task<ComplianceReportResult> GenerateComplianceReportAsync(List<UserProfileItem> users, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Bulk license assignment for wave migration efficiency
        /// </summary>
        Task<BulkLicenseResult> BulkAssignLicensesAsync(Dictionary<string, List<string>> userLicenseMap, MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate license requirements before migration starts
        /// </summary>
        Task<LicenseValidationResult> ValidateLicenseRequirementsAsync(List<UserProfileItem> users, MigrationContext context, CancellationToken cancellationToken = default);
    }

    /// <summary>
    /// License assignment result with detailed tracking
    /// </summary>
    public class LicenseAssignmentResult
    {
        public string UserId { get; set; } = string.Empty; // Added for IdentityMigrator compatibility
        public string UserPrincipalName { get; set; }
        public List<string> AssignedLicenses { get; set; } = new List<string>();
        public List<string> FailedLicenses { get; set; } = new List<string>();
        public bool IsSuccess { get; set; }
        public string ErrorMessage { get; set; } = string.Empty; // Added for IdentityMigrator compatibility
        public List<string> Errors { get; set; } = new List<string>();
        public List<string> Warnings { get; set; } = new List<string>();
        public DateTime AssignmentDate { get; set; } = DateTime.Now;
        public decimal EstimatedMonthlyCost { get; set; }
        public Dictionary<string, object> LicenseDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// License removal result for cost optimization tracking
    /// </summary>
    public class LicenseRemovalResult
    {
        public string UserPrincipalName { get; set; }
        public List<string> RemovedLicenses { get; set; } = new List<string>();
        public List<string> RetainedLicenses { get; set; } = new List<string>();
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public DateTime RemovalDate { get; set; } = DateTime.Now;
        public decimal MonthlySavings { get; set; }
        public string RemovalReason { get; set; }
    }

    /// <summary>
    /// License compliance checking result
    /// </summary>
    public class LicenseComplianceResult
    {
        public string UserPrincipalName { get; set; }
        public bool IsCompliant { get; set; }
        public List<string> RequiredLicenses { get; set; } = new List<string>();
        public List<string> MissingLicenses { get; set; } = new List<string>();
        public List<string> ExcessLicenses { get; set; } = new List<string>();
        public List<ComplianceViolation> Violations { get; set; } = new List<ComplianceViolation>();
        public DateTime ComplianceCheckDate { get; set; } = DateTime.Now;
        public string ComplianceLevel { get; set; } // Standard, High, Enterprise
        public Dictionary<string, object> ComplianceDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// License inventory for planning and capacity management
    /// </summary>
    public class LicenseInventoryResult
    {
        public Dictionary<string, LicenseSkuInfo> AvailableLicenses { get; set; } = new Dictionary<string, LicenseSkuInfo>();
        public Dictionary<string, int> AssignedCounts { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> RemainingCapacity { get; set; } = new Dictionary<string, int>();
        public decimal TotalMonthlyCost { get; set; }
        public DateTime InventoryDate { get; set; } = DateTime.Now;
        public List<string> Warnings { get; set; } = new List<string>();
        public bool HasCapacityIssues { get; set; }
    }

    /// <summary>
    /// License SKU information with business details
    /// </summary>
    public class LicenseSkuInfo
    {
        public string SkuId { get; set; }
        public string SkuName { get; set; }
        public string DisplayName { get; set; }
        public decimal MonthlyCost { get; set; }
        public int TotalUnits { get; set; }
        public int ConsumedUnits { get; set; }
        public int AvailableUnits => TotalUnits - ConsumedUnits;
        public List<string> IncludedServices { get; set; } = new List<string>();
        public Dictionary<string, object> SkuDetails { get; set; } = new Dictionary<string, object>();
        public bool IsTrialLicense { get; set; }
        public DateTime? ExpirationDate { get; set; }
    }

    /// <summary>
    /// User role to license mapping result
    /// </summary>
    public class LicenseMappingResult
    {
        public string UserPrincipalName { get; set; }
        public string UserRole { get; set; }
        public string Department { get; set; }
        public List<string> RecommendedLicenses { get; set; } = new List<string>();
        public List<string> OptionalLicenses { get; set; } = new List<string>();
        public List<string> ProhibitedLicenses { get; set; } = new List<string>();
        public decimal EstimatedMonthlyCost { get; set; }
        public string MappingReason { get; set; }
        public Dictionary<string, object> MappingDetails { get; set; } = new Dictionary<string, object>();
        public bool RequiresManagerApproval { get; set; }
    }

    /// <summary>
    /// Compliance violation details
    /// </summary>
    public class ComplianceViolation
    {
        public string ViolationType { get; set; }
        public string ViolationLevel { get; set; } // Warning, Error, Critical
        public string Description { get; set; }
        public string RecommendedAction { get; set; }
        public List<string> AffectedLicenses { get; set; } = new List<string>();
        public Dictionary<string, object> ViolationDetails { get; set; } = new Dictionary<string, object>();
        public bool IsBlocking { get; set; }
        public DateTime DetectedDate { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// Compliance report for management oversight
    /// </summary>
    public class ComplianceReportResult
    {
        public string ReportId { get; set; } = Guid.NewGuid().ToString();
        public DateTime GeneratedDate { get; set; } = DateTime.Now;
        public int TotalUsers { get; set; }
        public int CompliantUsers { get; set; }
        public int NonCompliantUsers { get; set; }
        public double CompliancePercentage => TotalUsers > 0 ? (double)CompliantUsers / TotalUsers * 100 : 0;
        public List<ComplianceViolation> AllViolations { get; set; } = new List<ComplianceViolation>();
        public Dictionary<string, int> ViolationsByType { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> LicenseUsageCounts { get; set; } = new Dictionary<string, int>();
        public decimal TotalMonthlyCost { get; set; }
        public decimal PotentialSavings { get; set; }
        public List<string> RecommendedActions { get; set; } = new List<string>();
        public Dictionary<string, object> ReportDetails { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Bulk license operation result for efficiency
    /// </summary>
    public class BulkLicenseResult
    {
        public string OperationId { get; set; } = Guid.NewGuid().ToString();
        public int TotalUsers { get; set; }
        public int SuccessfulAssignments { get; set; }
        public int FailedAssignments { get; set; }
        public double SuccessRate => TotalUsers > 0 ? (double)SuccessfulAssignments / TotalUsers * 100 : 0;
        public List<LicenseAssignmentResult> Results { get; set; } = new List<LicenseAssignmentResult>();
        public List<string> BulkErrors { get; set; } = new List<string>();
        public DateTime OperationStartTime { get; set; }
        public DateTime OperationEndTime { get; set; }
        public TimeSpan Duration => OperationEndTime - OperationStartTime;
        public decimal TotalCostImpact { get; set; }
    }

    /// <summary>
    /// License validation result for pre-migration checks
    /// </summary>
    public class LicenseValidationResult
    {
        public string ValidationId { get; set; } = Guid.NewGuid().ToString();
        public bool IsValid { get; set; }
        public int TotalUsersValidated { get; set; }
        public int UsersWithIssues { get; set; }
        public List<LicenseValidationIssue> ValidationIssues { get; set; } = new List<LicenseValidationIssue>();
        public Dictionary<string, int> RequiredLicenseCounts { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> AvailableLicenseCounts { get; set; } = new Dictionary<string, int>();
        public List<string> InsufficientLicenses { get; set; } = new List<string>();
        public decimal EstimatedTotalCost { get; set; }
        public DateTime ValidationDate { get; set; } = DateTime.Now;
        public bool BlocksMigration { get; set; }
    }

    /// <summary>
    /// License validation issue for detailed reporting
    /// </summary>
    public class LicenseValidationIssue
    {
        public string UserPrincipalName { get; set; }
        public string IssueType { get; set; }
        public string IssueLevel { get; set; } // Warning, Error, Critical
        public string Description { get; set; }
        public List<string> AffectedLicenses { get; set; } = new List<string>();
        public string RecommendedAction { get; set; }
        public bool IsBlocking { get; set; }
        public Dictionary<string, object> IssueDetails { get; set; } = new Dictionary<string, object>();
    }
}