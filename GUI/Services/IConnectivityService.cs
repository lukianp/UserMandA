using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service interface for verifying target tenant connectivity across all M&A migration services
    /// Provides comprehensive pre-migration validation to ensure all target endpoints are accessible
    /// </summary>
    public interface IConnectivityService
    {
        /// <summary>
        /// Test all configured target services for comprehensive connectivity validation
        /// </summary>
        /// <param name="profile">Target company profile with connection configuration</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Dictionary of service names to connectivity test results</returns>
        Task<Dictionary<string, ConnectivityResult>> TestAllServicesAsync(
            TargetProfile profile, 
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Test Microsoft Graph API connectivity and permissions
        /// </summary>
        /// <param name="profile">Target company profile with Azure AD configuration</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Graph API connectivity result with detailed permission validation</returns>
        Task<ConnectivityResult> TestGraphApiAsync(
            TargetProfile profile, 
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Test Exchange Online PowerShell connectivity and mailbox access
        /// </summary>
        /// <param name="profile">Target company profile with Exchange configuration</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Exchange Online connectivity result with service verification</returns>
        Task<ConnectivityResult> TestExchangeOnlineAsync(
            TargetProfile profile, 
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Test SharePoint Online API connectivity and site access
        /// </summary>
        /// <param name="profile">Target company profile with SharePoint configuration</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>SharePoint Online connectivity result with API validation</returns>
        Task<ConnectivityResult> TestSharePointOnlineAsync(
            TargetProfile profile, 
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Test Azure SQL Database connectivity and query execution
        /// </summary>
        /// <param name="profile">Target company profile with SQL configuration</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>SQL Database connectivity result with query validation</returns>
        Task<ConnectivityResult> TestAzureSqlAsync(
            TargetProfile profile, 
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Test on-premises Active Directory connectivity (for hybrid scenarios)
        /// </summary>
        /// <param name="profile">Target company profile with AD configuration</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Active Directory connectivity result with domain validation</returns>
        Task<ConnectivityResult> TestActiveDirectoryAsync(
            TargetProfile profile, 
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Validate that all required permissions and scopes are available
        /// </summary>
        /// <param name="profile">Target company profile with service configurations</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Permission validation results with missing scope identification</returns>
        Task<PermissionValidationResult> ValidatePermissionsAsync(
            TargetProfile profile, 
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Determine if migration can proceed based on connectivity test results
        /// </summary>
        /// <param name="connectivityResults">Results from connectivity tests</param>
        /// <returns>Migration readiness assessment with blocking issues</returns>
        MigrationReadinessResult EvaluateMigrationReadiness(
            Dictionary<string, ConnectivityResult> connectivityResults);

        /// <summary>
        /// Get detailed remediation guidance for failed connectivity tests
        /// </summary>
        /// <param name="connectivityResult">Failed connectivity result</param>
        /// <returns>Actionable remediation steps and guidance</returns>
        ConnectivityRemediationGuide GetRemediationGuidance(ConnectivityResult connectivityResult);
    }

    /// <summary>
    /// Comprehensive connectivity test result with detailed diagnostics
    /// </summary>
    public class ConnectivityResult
    {
        public string ServiceName { get; set; }
        public string ServiceType { get; set; }
        public bool IsSuccessful { get; set; }
        public DateTime TestTimestamp { get; set; } = DateTime.UtcNow;
        public TimeSpan ResponseTime { get; set; }
        public string ErrorMessage { get; set; }
        public string ErrorCode { get; set; }
        public ConnectivityErrorCategory ErrorCategory { get; set; }
        public List<string> Warnings { get; set; } = new List<string>();
        public List<string> Recommendations { get; set; } = new List<string>();
        public Dictionary<string, object> TestDetails { get; set; } = new Dictionary<string, object>();

        // Endpoint Information
        public string TestedEndpoint { get; set; }
        public string ActualEndpoint { get; set; }
        public bool EndpointReachable { get; set; }

        // Authentication Information
        public bool AuthenticationSuccessful { get; set; }
        public string AuthenticationMethod { get; set; }
        public List<string> RequiredScopes { get; set; } = new List<string>();
        public List<string> GrantedScopes { get; set; } = new List<string>();
        public List<string> MissingScopes { get; set; } = new List<string>();

        // Service-Specific Information
        public Dictionary<string, bool> ServiceCapabilities { get; set; } = new Dictionary<string, bool>();
        public string ServiceVersion { get; set; }
        public bool ServiceHealthy { get; set; }

        // Quick Status Properties
        public string StatusText => IsSuccessful ? "Connected" : "Failed";
        public string StatusIcon => IsSuccessful ? "✓" : "✗";
        public ConnectivityStatus Status => GetConnectivityStatus();

        private ConnectivityStatus GetConnectivityStatus()
        {
            if (IsSuccessful) return ConnectivityStatus.Connected;
            if (ErrorCategory == ConnectivityErrorCategory.Authentication) return ConnectivityStatus.AuthenticationFailed;
            if (ErrorCategory == ConnectivityErrorCategory.Permissions) return ConnectivityStatus.PermissionDenied;
            if (ErrorCategory == ConnectivityErrorCategory.Network) return ConnectivityStatus.NetworkError;
            if (ErrorCategory == ConnectivityErrorCategory.Service) return ConnectivityStatus.ServiceUnavailable;
            return ConnectivityStatus.Unknown;
        }
    }

    /// <summary>
    /// Permission validation result with detailed scope analysis
    /// </summary>
    public class PermissionValidationResult
    {
        public bool AllPermissionsValid { get; set; }
        public DateTime ValidationTimestamp { get; set; } = DateTime.UtcNow;
        public Dictionary<string, ServicePermissionStatus> ServicePermissions { get; set; } = new Dictionary<string, ServicePermissionStatus>();
        public List<string> MissingCriticalPermissions { get; set; } = new List<string>();
        public List<string> MissingOptionalPermissions { get; set; } = new List<string>();
        public List<string> ExcessPermissions { get; set; } = new List<string>();
        public string RecommendedAction { get; set; }
    }

    /// <summary>
    /// Service-specific permission status
    /// </summary>
    public class ServicePermissionStatus
    {
        public string ServiceName { get; set; }
        public bool HasRequiredPermissions { get; set; }
        public List<string> RequiredScopes { get; set; } = new List<string>();
        public List<string> GrantedScopes { get; set; } = new List<string>();
        public List<string> MissingScopes { get; set; } = new List<string>();
        public PermissionLevel PermissionLevel { get; set; }
    }

    /// <summary>
    /// Migration readiness assessment result
    /// </summary>
    public class MigrationReadinessResult
    {
        public bool CanProceedWithMigration { get; set; }
        public MigrationReadinessLevel ReadinessLevel { get; set; }
        public DateTime AssessmentTimestamp { get; set; } = DateTime.UtcNow;
        public int TotalServices { get; set; }
        public int ConnectedServices { get; set; }
        public int FailedServices { get; set; }
        public int ServicesWithWarnings { get; set; }
        public List<string> BlockingIssues { get; set; } = new List<string>();
        public List<string> WarningIssues { get; set; } = new List<string>();
        public List<string> RecommendedActions { get; set; } = new List<string>();
        public Dictionary<string, ConnectivityResult> ServiceResults { get; set; } = new Dictionary<string, ConnectivityResult>();

        // Calculated Properties
        public double SuccessPercentage => TotalServices > 0 ? (double)ConnectedServices / TotalServices * 100 : 0;
        public string ReadinessText => GetReadinessText();

        private string GetReadinessText()
        {
            return ReadinessLevel switch
            {
                MigrationReadinessLevel.Ready => "Ready for Migration",
                MigrationReadinessLevel.ReadyWithWarnings => "Ready with Warnings",
                MigrationReadinessLevel.RequiresAttention => "Requires Attention",
                MigrationReadinessLevel.NotReady => "Not Ready for Migration",
                _ => "Unknown Status"
            };
        }
    }

    /// <summary>
    /// Connectivity remediation guidance
    /// </summary>
    public class ConnectivityRemediationGuide
    {
        public string ServiceName { get; set; }
        public ConnectivityErrorCategory ErrorCategory { get; set; }
        public string PrimaryIssue { get; set; }
        public List<RemediationStep> RemediationSteps { get; set; } = new List<RemediationStep>();
        public List<string> PrerequisiteActions { get; set; } = new List<string>();
        public List<string> ValidationSteps { get; set; } = new List<string>();
        public List<string> DocumentationLinks { get; set; } = new List<string>();
        public string EstimatedResolutionTime { get; set; }
        public RemediationComplexity Complexity { get; set; }
    }

    /// <summary>
    /// Individual remediation step
    /// </summary>
    public class RemediationStep
    {
        public int StepNumber { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Action { get; set; }
        public List<string> Examples { get; set; } = new List<string>();
        public string DocumentationUrl { get; set; }
        public bool IsOptional { get; set; }
        public RemediationStepType StepType { get; set; }
    }

    /// <summary>
    /// Service configuration requirement
    /// </summary>
    public static class ServiceRequirements
    {
        public static class GraphApi
        {
            public const string BaseUrl = "https://graph.microsoft.com";
            public const string TestEndpoint = "/v1.0/me";
            public const string UsersEndpoint = "/v1.0/users";
            
            public static readonly string[] RequiredScopes = new[]
            {
                "User.Read.All",
                "Group.Read.All",
                "Directory.Read.All",
                "Application.Read.All"
            };

            public static readonly string[] OptionalScopes = new[]
            {
                "User.ReadWrite.All",
                "Group.ReadWrite.All",
                "Directory.ReadWrite.All"
            };
        }

        public static class ExchangeOnline
        {
            public const string PowerShellEndpoint = "https://outlook.office365.com";
            public const string TestCommand = "Get-Mailbox -ResultSize 1";
            
            public static readonly string[] RequiredScopes = new[]
            {
                "https://outlook.office365.com/.default",
                "Exchange.ManageAsApp"
            };

            public static readonly string[] RequiredRoles = new[]
            {
                "Exchange Administrator",
                "Global Administrator"
            };
        }

        public static class SharePointOnline
        {
            public const string ApiEndpoint = "/_api/web";
            public const string TestEndpoint = "/_api/web/title";
            
            public static readonly string[] RequiredScopes = new[]
            {
                "Sites.Read.All",
                "Sites.ReadWrite.All"
            };

            public static readonly string[] RequiredPermissions = new[]
            {
                "SharePoint Administrator",
                "Global Administrator"
            };
        }

        public static class AzureSql
        {
            public const string TestQuery = "SELECT 1 as TestConnection";
            public const string DefaultPort = "1433";
            
            public static readonly string[] RequiredRoles = new[]
            {
                "SQL DB Contributor",
                "SQL Server Contributor",
                "Contributor"
            };
        }
    }

    #region Enumerations

    /// <summary>
    /// Connectivity error categories for targeted remediation
    /// </summary>
    public enum ConnectivityErrorCategory
    {
        None = 0,
        Authentication = 1,
        Permissions = 2,
        Network = 3,
        Service = 4,
        Configuration = 5,
        Timeout = 6,
        Unknown = 99
    }

    /// <summary>
    /// Connectivity status enumeration
    /// </summary>
    public enum ConnectivityStatus
    {
        Unknown = 0,
        Connected = 1,
        AuthenticationFailed = 2,
        PermissionDenied = 3,
        NetworkError = 4,
        ServiceUnavailable = 5,
        ConfigurationError = 6,
        Timeout = 7
    }

    /// <summary>
    /// Permission level classification
    /// </summary>
    public enum PermissionLevel
    {
        None = 0,
        Read = 1,
        Write = 2,
        Admin = 3,
        Full = 4
    }

    /// <summary>
    /// Migration readiness assessment levels
    /// </summary>
    public enum MigrationReadinessLevel
    {
        NotReady = 0,
        RequiresAttention = 1,
        ReadyWithWarnings = 2,
        Ready = 3
    }

    /// <summary>
    /// Remediation complexity levels
    /// </summary>
    public enum RemediationComplexity
    {
        Simple = 1,    // Can be fixed in minutes
        Moderate = 2,  // Requires configuration changes
        Complex = 3,   // Requires admin privileges or external coordination
        Advanced = 4   // May require architectural changes
    }

    /// <summary>
    /// Remediation step types
    /// </summary>
    public enum RemediationStepType
    {
        Configuration = 1,
        Permission = 2,
        NetworkConfig = 3,
        ServiceConfig = 4,
        Verification = 5,
        Documentation = 6
    }

    #endregion
}