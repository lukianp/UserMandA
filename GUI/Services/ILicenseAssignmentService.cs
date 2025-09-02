using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Interface for comprehensive license assignment and compliance management service.
    /// Implements T-038: License Assignment and Compliance for M&A scenarios.
    /// </summary>
    public interface ILicenseAssignmentService
    {
        #region Events
        
        /// <summary>
        /// Fired when a license operation progresses
        /// </summary>
        event EventHandler<LicenseOperationProgressEventArgs> OperationProgress;
        
        /// <summary>
        /// Fired when a compliance issue is detected
        /// </summary>
        event EventHandler<ComplianceIssueDetectedEventArgs> ComplianceIssueDetected;
        
        /// <summary>
        /// Fired when a bulk operation completes
        /// </summary>
        event EventHandler<BulkOperationCompletedEventArgs> BulkOperationCompleted;
        
        #endregion

        #region License Discovery and Management
        
        /// <summary>
        /// Retrieves all available license SKUs from the target tenant
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of available license SKUs with current utilization</returns>
        Task<List<LicenseSku>> GetAvailableLicenseSkusAsync(string tenantId, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Gets detailed information about a specific license SKU
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <param name="skuId">License SKU identifier</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Detailed license SKU information</returns>
        Task<LicenseSku> GetLicenseSkuDetailsAsync(string tenantId, string skuId, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Updates license SKU information from the tenant
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Number of SKUs updated</returns>
        Task<int> RefreshLicenseSkuDataAsync(string tenantId, CancellationToken cancellationToken = default);
        
        #endregion

        #region User License Assignment
        
        /// <summary>
        /// Gets current license assignments for a user
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <param name="userId">User identifier (UPN or Object ID)</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Current user license assignment details</returns>
        Task<UserLicenseAssignment> GetUserLicenseAssignmentAsync(string tenantId, string userId, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Assigns license SKUs to a user
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <param name="userId">User identifier</param>
        /// <param name="skuIds">License SKU IDs to assign</param>
        /// <param name="disableServicePlans">Service plans to disable (optional)</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Assignment operation result</returns>
        Task<LicenseAssignmentResult> AssignLicensesToUserAsync(
            string tenantId, 
            string userId, 
            List<string> skuIds, 
            List<string> disableServicePlans = null, 
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Removes license SKUs from a user
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <param name="userId">User identifier</param>
        /// <param name="skuIds">License SKU IDs to remove</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Removal operation result</returns>
        Task<LicenseAssignmentResult> RemoveLicensesFromUserAsync(
            string tenantId, 
            string userId, 
            List<string> skuIds, 
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Updates license assignments for a user
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <param name="userId">User identifier</param>
        /// <param name="assignSkuIds">SKU IDs to assign</param>
        /// <param name="removeSkuIds">SKU IDs to remove</param>
        /// <param name="disableServicePlans">Service plans to disable</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Update operation result</returns>
        Task<LicenseAssignmentResult> UpdateUserLicenseAssignmentAsync(
            string tenantId, 
            string userId, 
            List<string> assignSkuIds = null, 
            List<string> removeSkuIds = null, 
            List<string> disableServicePlans = null, 
            CancellationToken cancellationToken = default);
        
        #endregion

        #region Bulk Operations
        
        /// <summary>
        /// Executes a bulk license operation on multiple users
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <param name="operation">Bulk operation definition</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Bulk operation execution result</returns>
        Task<BulkLicenseOperation> ExecuteBulkLicenseOperationAsync(
            string tenantId, 
            BulkLicenseOperation operation, 
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Gets the status of a running bulk operation
        /// </summary>
        /// <param name="operationId">Bulk operation identifier</param>
        /// <returns>Current operation status</returns>
        Task<BulkLicenseOperation> GetBulkOperationStatusAsync(string operationId);
        
        /// <summary>
        /// Cancels a running bulk operation
        /// </summary>
        /// <param name="operationId">Bulk operation identifier</param>
        /// <returns>True if successfully cancelled</returns>
        Task<bool> CancelBulkOperationAsync(string operationId);
        
        #endregion

        #region License Mapping and Rules
        
        /// <summary>
        /// Creates or updates a license mapping rule
        /// </summary>
        /// <param name="rule">License mapping rule</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Created or updated rule</returns>
        Task<LicenseMappingRule> SaveLicenseMappingRuleAsync(LicenseMappingRule rule, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Gets all license mapping rules
        /// </summary>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of license mapping rules</returns>
        Task<List<LicenseMappingRule>> GetLicenseMappingRulesAsync(CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Applies license mapping rules to determine required licenses for a user
        /// </summary>
        /// <param name="user">User data from discovery</param>
        /// <param name="rules">License mapping rules to apply</param>
        /// <returns>Recommended license SKUs for the user</returns>
        Task<List<string>> ApplyLicenseMappingRulesAsync(UserData user, List<LicenseMappingRule> rules = null);
        
        /// <summary>
        /// Validates a license mapping rule
        /// </summary>
        /// <param name="rule">Rule to validate</param>
        /// <returns>Validation result with errors and warnings</returns>
        Task<LicenseRuleValidationResult> ValidateLicenseMappingRuleAsync(LicenseMappingRule rule);
        
        #endregion

        #region Migration Integration
        
        /// <summary>
        /// Processes license assignments for a migration wave
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <param name="waveId">Migration wave identifier</param>
        /// <param name="users">Users to process in the wave</param>
        /// <param name="settings">Wave-specific license settings</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Wave license processing results</returns>
        Task<WaveLicenseProcessingResult> ProcessWaveLicenseAssignmentsAsync(
            string tenantId, 
            string waveId, 
            List<UserData> users, 
            WaveLicenseSettings settings, 
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Pre-validates license requirements for a migration wave
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <param name="users">Users in the wave</param>
        /// <param name="settings">Wave license settings</param>
        /// <returns>Validation results with license requirements and availability</returns>
        Task<WaveLicenseValidationResult> ValidateWaveLicenseRequirementsAsync(
            string tenantId, 
            List<UserData> users, 
            WaveLicenseSettings settings);
        
        /// <summary>
        /// Removes source tenant licenses after successful migration
        /// </summary>
        /// <param name="sourceTenantId">Source tenant identifier</param>
        /// <param name="userIds">Users whose licenses should be removed</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Source license removal results</returns>
        Task<List<LicenseAssignmentResult>> RemoveSourceLicensesAsync(
            string sourceTenantId, 
            List<string> userIds, 
            CancellationToken cancellationToken = default);
        
        #endregion

        #region Compliance and Reporting
        
        /// <summary>
        /// Generates a comprehensive license compliance report
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <param name="includeUsers">Include detailed user assignments</param>
        /// <param name="includeIssues">Include compliance issues</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Detailed compliance report</returns>
        Task<LicenseComplianceReport> GenerateComplianceReportAsync(
            string tenantId, 
            bool includeUsers = true, 
            bool includeIssues = true, 
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Scans for license compliance issues
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <param name="userIds">Specific users to check (optional)</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of detected compliance issues</returns>
        Task<List<ComplianceIssue>> ScanForComplianceIssuesAsync(
            string tenantId, 
            List<string> userIds = null, 
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Resolves a compliance issue
        /// </summary>
        /// <param name="issueId">Compliance issue identifier</param>
        /// <param name="resolution">Resolution description</param>
        /// <param name="resolvedBy">User resolving the issue</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>True if successfully resolved</returns>
        Task<bool> ResolveComplianceIssueAsync(
            string issueId, 
            string resolution, 
            string resolvedBy, 
            CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Gets license utilization statistics
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>License utilization statistics</returns>
        Task<LicenseUtilizationStats> GetLicenseUtilizationStatsAsync(string tenantId, CancellationToken cancellationToken = default);
        
        #endregion

        #region Graph API Integration
        
        /// <summary>
        /// Tests connectivity and permissions for the target tenant
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Connectivity test result</returns>
        Task<GraphConnectivityResult> TestGraphConnectivityAsync(string tenantId, CancellationToken cancellationToken = default);
        
        /// <summary>
        /// Validates required Graph API permissions for license operations
        /// </summary>
        /// <param name="tenantId">Target tenant identifier</param>
        /// <returns>Permission validation results</returns>
        Task<GraphPermissionValidationResult> ValidateGraphPermissionsAsync(string tenantId);
        
        #endregion
    }

    #region Event Arguments and Supporting Models
    
    /// <summary>
    /// Event arguments for license operation progress
    /// </summary>
    public class LicenseOperationProgressEventArgs : EventArgs
    {
        public string OperationId { get; set; }
        public string OperationType { get; set; }
        public string CurrentUser { get; set; }
        public int ProcessedCount { get; set; }
        public int TotalCount { get; set; }
        public double ProgressPercentage => TotalCount > 0 ? (double)ProcessedCount / TotalCount * 100 : 0;
        public string Status { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public Dictionary<string, object> AdditionalData { get; set; } = new();
    }

    /// <summary>
    /// Event arguments for compliance issue detection
    /// </summary>
    public class ComplianceIssueDetectedEventArgs : EventArgs
    {
        public ComplianceIssue Issue { get; set; }
        public string TenantId { get; set; }
        public string Context { get; set; }
        public DateTime DetectedAt { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// Event arguments for bulk operation completion
    /// </summary>
    public class BulkOperationCompletedEventArgs : EventArgs
    {
        public BulkLicenseOperation Operation { get; set; }
        public bool IsSuccess => Operation?.Status == BulkOperationStatus.Completed;
        public int TotalUsers => Operation?.TotalUsers ?? 0;
        public int SuccessfulUsers => Operation?.SuccessfulUsers ?? 0;
        public int FailedUsers => Operation?.FailedUsers ?? 0;
        public TimeSpan Duration => Operation?.CompletedDate?.Subtract(Operation.StartedDate ?? DateTime.Now) ?? TimeSpan.Zero;
    }

    /// <summary>
    /// Result for license rule validation
    /// </summary>
    public class LicenseRuleValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public List<string> Suggestions { get; set; } = new();
        public int EstimatedAffectedUsers { get; set; }
        public List<string> ConflictingRules { get; set; } = new();
    }

    /// <summary>
    /// Result for wave license processing
    /// </summary>
    public class WaveLicenseProcessingResult
    {
        public string WaveId { get; set; }
        public string WaveName { get; set; }
        public int TotalUsers { get; set; }
        public int ProcessedUsers { get; set; }
        public int SuccessfulAssignments { get; set; }
        public int FailedAssignments { get; set; }
        public List<LicenseAssignmentResult> Results { get; set; } = new();
        public List<ComplianceIssue> ComplianceIssues { get; set; } = new();
        public TimeSpan ProcessingTime { get; set; }
        public DateTime ProcessedAt { get; set; } = DateTime.Now;
        public decimal TotalCost { get; set; }
        public bool IsSuccess => FailedAssignments == 0;
    }

    /// <summary>
    /// Result for wave license validation
    /// </summary>
    public class WaveLicenseValidationResult
    {
        public string WaveId { get; set; }
        public bool IsValid { get; set; }
        public List<string> ValidationErrors { get; set; } = new();
        public List<string> ValidationWarnings { get; set; } = new();
        public Dictionary<string, int> RequiredLicenses { get; set; } = new();
        public Dictionary<string, int> AvailableLicenses { get; set; } = new();
        public Dictionary<string, int> LicenseShortfall { get; set; } = new();
        public decimal EstimatedMonthlyCost { get; set; }
        public int UsersRequiringLicenses { get; set; }
        public List<UserLicenseRequirement> UserRequirements { get; set; } = new();
    }

    /// <summary>
    /// User license requirement for validation
    /// </summary>
    public class UserLicenseRequirement
    {
        public string UserId { get; set; }
        public string UserPrincipalName { get; set; }
        public string DisplayName { get; set; }
        public List<string> RequiredSkuIds { get; set; } = new();
        public List<string> RecommendedSkuIds { get; set; } = new();
        public List<string> ConflictingSkuIds { get; set; } = new();
        public decimal EstimatedMonthlyCost { get; set; }
        public bool HasAvailableLicenses { get; set; }
        public List<string> ValidationIssues { get; set; } = new();
    }

    /// <summary>
    /// License utilization statistics
    /// </summary>
    public class LicenseUtilizationStats
    {
        public string TenantId { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.Now;
        public int TotalSkus { get; set; }
        public int TotalPurchasedLicenses { get; set; }
        public int TotalAssignedLicenses { get; set; }
        public int TotalAvailableLicenses { get; set; }
        public double OverallUtilizationPercentage { get; set; }
        public decimal TotalMonthlyCost { get; set; }
        public Dictionary<string, SkuUtilizationInfo> SkuUtilization { get; set; } = new();
        public List<string> OverUtilizedSkus { get; set; } = new();
        public List<string> UnderUtilizedSkus { get; set; } = new();
    }

    /// <summary>
    /// SKU-specific utilization information
    /// </summary>
    public class SkuUtilizationInfo
    {
        public string SkuId { get; set; }
        public string DisplayName { get; set; }
        public int PurchasedUnits { get; set; }
        public int AssignedUnits { get; set; }
        public int AvailableUnits { get; set; }
        public double UtilizationPercentage { get; set; }
        public decimal MonthlyCostPerUnit { get; set; }
        public decimal TotalMonthlyCost { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    /// <summary>
    /// Graph API connectivity test result
    /// </summary>
    public class GraphConnectivityResult
    {
        public bool IsConnected { get; set; }
        public string TenantId { get; set; }
        public string AuthenticationMethod { get; set; }
        public List<string> SuccessfulEndpoints { get; set; } = new();
        public List<string> FailedEndpoints { get; set; } = new();
        public Dictionary<string, string> EndpointErrors { get; set; } = new();
        public TimeSpan ResponseTime { get; set; }
        public DateTime TestedAt { get; set; } = DateTime.Now;
        public string TenantDisplayName { get; set; }
        public string GraphVersion { get; set; }
    }

    /// <summary>
    /// Graph API permission validation result
    /// </summary>
    public class GraphPermissionValidationResult
    {
        public bool HasRequiredPermissions { get; set; }
        public List<string> RequiredPermissions { get; set; } = new();
        public List<string> GrantedPermissions { get; set; } = new();
        public List<string> MissingPermissions { get; set; } = new();
        public List<string> ExcessPermissions { get; set; } = new();
        public bool RequiresAdminConsent { get; set; }
        public DateTime ValidatedAt { get; set; } = DateTime.Now;
        public string ApplicationId { get; set; }
        public string ServicePrincipalId { get; set; }
    }

    #endregion
}