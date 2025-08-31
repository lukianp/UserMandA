# T-000: Source and Target Company Profiles & Environment Detection Architecture

## Executive Summary

This document defines the comprehensive architecture for implementing dual-profile system (Source and Target profiles) with intelligent environment detection capabilities for the M&A Discovery Suite. The design enables seamless management of both source and target company profiles while automatically detecting the operational environment (On-Premises, Azure, or Hybrid) to optimize module execution.

## 1. Enhanced TargetProfile Model

### 1.1 Extended TargetProfile Class

```csharp
namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Enhanced target profile for M&A migration scenarios with secure credential storage
    /// </summary>
    public class TargetProfile : INotifyPropertyChanged
    {
        // Existing properties
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string TenantId { get; set; } = string.Empty;
        public string ClientId { get; set; } = string.Empty;
        
        // Enhanced credential storage (DPAPI encrypted)
        public string ClientSecretEncrypted { get; set; } = string.Empty;
        public string DomainAdminCredentialEncrypted { get; set; } = string.Empty;
        public string AzureGlobalAdminCredentialEncrypted { get; set; } = string.Empty;
        
        // Graph API configuration
        public List<string> GraphApiScopes { get; set; } = new()
        {
            "User.Read.All",
            "Group.Read.All", 
            "Directory.Read.All",
            "Mail.Read",
            "Sites.Read.All",
            "Application.Read.All"
        };
        
        // Environment configuration
        public string DomainController { get; set; } = string.Empty;
        public string ExchangeServer { get; set; } = string.Empty;
        public string SharePointUrl { get; set; } = string.Empty;
        public string SqlServerInstance { get; set; } = string.Empty;
        
        // Connection settings
        public bool UseModernAuth { get; set; } = true;
        public bool UseLegacyAuth { get; set; } = false;
        public int ConnectionTimeout { get; set; } = 30; // seconds
        public int RetryCount { get; set; } = 3;
        
        // Metadata
        public DateTime Created { get; set; } = DateTime.UtcNow;
        public DateTime LastModified { get; set; } = DateTime.UtcNow;
        public DateTime? LastConnectionTest { get; set; }
        public bool LastConnectionTestSuccess { get; set; }
        public string LastConnectionTestMessage { get; set; } = string.Empty;
        
        // Profile state
        public bool IsActive { get; set; }
        public bool IsValidated { get; set; }
        
        // INotifyPropertyChanged implementation
        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
```

### 1.2 Secure Credential Storage Service

```csharp
namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Enhanced secure credential storage using Windows DPAPI with additional protection layers
    /// </summary>
    public interface ISecureCredentialService
    {
        Task<SecureCredential> StoreCredentialAsync(string profileId, CredentialType type, 
            string username, SecureString password, string domain = null);
        Task<SecureCredential> RetrieveCredentialAsync(string profileId, CredentialType type);
        Task<bool> DeleteCredentialAsync(string profileId, CredentialType type);
        Task<bool> ValidateCredentialAsync(SecureCredential credential);
    }
    
    public enum CredentialType
    {
        DomainAdmin,
        AzureGlobalAdmin,
        ServicePrincipal,
        DatabaseSA,
        SharePointAdmin
    }
    
    public class SecureCredential
    {
        public string Username { get; set; }
        public SecureString Password { get; set; }
        public string Domain { get; set; }
        public CredentialType Type { get; set; }
        public DateTime StoredAt { get; set; }
        public DateTime? LastValidated { get; set; }
    }
}
```

## 2. Environment Detection Service

### 2.1 Environment Detection Interface

```csharp
namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for detecting operational environment and capabilities
    /// </summary>
    public interface IEnvironmentDetectionService
    {
        Task<EnvironmentStatus> DetectEnvironmentAsync(CancellationToken cancellationToken = default);
        Task<EnvironmentCapabilities> GetCapabilitiesAsync();
        Task<bool> ValidateEnvironmentAsync(EnvironmentType targetType);
        void RegisterEnvironmentChangeHandler(Action<EnvironmentStatus> handler);
    }
    
    /// <summary>
    /// Defines the operational environment type
    /// </summary>
    public enum EnvironmentType
    {
        Unknown = 0,
        OnPremises = 1,
        Azure = 2,
        Hybrid = 3,
        AWS = 4,
        GCP = 5,
        MultiCloud = 6
    }
    
    /// <summary>
    /// Detailed environment status and detection signals
    /// </summary>
    public class EnvironmentStatus
    {
        public EnvironmentType Type { get; set; }
        public DateTime DetectedAt { get; set; }
        public TimeSpan DetectionDuration { get; set; }
        
        // Detection signals
        public bool IsAzureJoined { get; set; }
        public bool IsDomainJoined { get; set; }
        public bool HasAzureADConnect { get; set; }
        public bool HasExchangeHybrid { get; set; }
        
        // On-premises signals
        public string DomainName { get; set; }
        public List<string> DomainControllers { get; set; } = new();
        public string ForestName { get; set; }
        public int DomainFunctionalLevel { get; set; }
        
        // Azure signals  
        public string AzureTenantId { get; set; }
        public string AzureTenantName { get; set; }
        public string AzureSubscriptionId { get; set; }
        public bool HasAzureADPremium { get; set; }
        
        // Exchange signals
        public bool HasExchangeOnPrem { get; set; }
        public bool HasExchangeOnline { get; set; }
        public string ExchangeVersion { get; set; }
        public List<string> ExchangeServers { get; set; } = new();
        
        // Additional infrastructure
        public bool HasSharePointOnPrem { get; set; }
        public bool HasSharePointOnline { get; set; }
        public bool HasSqlServer { get; set; }
        public bool HasFileServers { get; set; }
        
        // Network information
        public List<string> DetectedSubnets { get; set; } = new();
        public List<string> DnsServers { get; set; } = new();
        public string PublicIpAddress { get; set; }
        
        // Confidence score (0-100)
        public int DetectionConfidence { get; set; }
        public Dictionary<string, string> AdditionalSignals { get; set; } = new();
    }
    
    /// <summary>
    /// Capabilities available in the detected environment
    /// </summary>
    public class EnvironmentCapabilities
    {
        public bool CanAccessActiveDirectory { get; set; }
        public bool CanAccessAzureAD { get; set; }
        public bool CanAccessExchange { get; set; }
        public bool CanAccessSharePoint { get; set; }
        public bool CanAccessTeams { get; set; }
        public bool CanAccessOneDrive { get; set; }
        public bool CanAccessFileShares { get; set; }
        public bool CanAccessSqlServer { get; set; }
        public bool CanAccessPowerBI { get; set; }
        public bool CanPerformNetworkScanning { get; set; }
        public bool HasElevatedPrivileges { get; set; }
        public List<string> AvailableModules { get; set; } = new();
        public List<string> UnavailableModules { get; set; } = new();
        public Dictionary<string, string> ModuleRequirements { get; set; } = new();
    }
}
```

### 2.2 Environment Detection Implementation

```csharp
namespace MandADiscoverySuite.Services
{
    public class EnvironmentDetectionService : IEnvironmentDetectionService
    {
        private readonly ILogger<EnvironmentDetectionService> _logger;
        private readonly IPowerShellExecutionService _psService;
        private readonly List<Action<EnvironmentStatus>> _changeHandlers = new();
        private EnvironmentStatus _cachedStatus;
        private DateTime _lastDetection;
        
        public async Task<EnvironmentStatus> DetectEnvironmentAsync(CancellationToken cancellationToken = default)
        {
            var stopwatch = Stopwatch.StartNew();
            var status = new EnvironmentStatus
            {
                DetectedAt = DateTime.UtcNow
            };
            
            // Parallel detection tasks
            var tasks = new List<Task>
            {
                DetectDomainEnvironmentAsync(status, cancellationToken),
                DetectAzureEnvironmentAsync(status, cancellationToken),
                DetectExchangeEnvironmentAsync(status, cancellationToken),
                DetectNetworkEnvironmentAsync(status, cancellationToken),
                DetectInfrastructureServicesAsync(status, cancellationToken)
            };
            
            await Task.WhenAll(tasks);
            
            // Determine environment type based on signals
            status.Type = DetermineEnvironmentType(status);
            status.DetectionConfidence = CalculateConfidence(status);
            status.DetectionDuration = stopwatch.Elapsed;
            
            _cachedStatus = status;
            _lastDetection = DateTime.UtcNow;
            
            // Notify handlers
            foreach (var handler in _changeHandlers)
            {
                handler?.Invoke(status);
            }
            
            return status;
        }
        
        private EnvironmentType DetermineEnvironmentType(EnvironmentStatus status)
        {
            if (status.IsDomainJoined && status.IsAzureJoined)
            {
                if (status.HasAzureADConnect || status.HasExchangeHybrid)
                    return EnvironmentType.Hybrid;
            }
            
            if (status.IsAzureJoined && !status.IsDomainJoined)
                return EnvironmentType.Azure;
                
            if (status.IsDomainJoined && !status.IsAzureJoined)
                return EnvironmentType.OnPremises;
                
            return EnvironmentType.Unknown;
        }
        
        private async Task DetectDomainEnvironmentAsync(EnvironmentStatus status, CancellationToken ct)
        {
            var script = @"
                $domain = Get-WmiObject Win32_ComputerSystem | Select-Object -ExpandProperty Domain
                $isDomain = (Get-WmiObject Win32_ComputerSystem).PartOfDomain
                
                if ($isDomain) {
                    $forest = [System.DirectoryServices.ActiveDirectory.Forest]::GetCurrentForest()
                    $domainObj = [System.DirectoryServices.ActiveDirectory.Domain]::GetCurrentDomain()
                    
                    @{
                        IsDomainJoined = $true
                        DomainName = $domain
                        ForestName = $forest.Name
                        DomainControllers = @($domainObj.DomainControllers | ForEach-Object { $_.Name })
                        FunctionalLevel = $domainObj.DomainMode.value__
                    }
                } else {
                    @{ IsDomainJoined = $false }
                }
            ";
            
            var result = await _psService.ExecuteScriptAsync(script, ct);
            // Parse and populate status...
        }
    }
}
```

## 3. Connection Test Service

### 3.1 Connection Test Interface

```csharp
namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for testing connectivity to source and target environments
    /// </summary>
    public interface IConnectionTestService
    {
        Task<ConnectionTestResult> TestSourceConnectionAsync(CompanyProfile source, 
            ConnectionTestOptions options = null);
        Task<ConnectionTestResult> TestTargetConnectionAsync(TargetProfile target, 
            ConnectionTestOptions options = null);
        Task<ConnectionTestResult> TestSpecificServiceAsync(string endpoint, 
            ServiceType service, SecureCredential credential = null);
        Task<ComprehensiveTestResult> RunComprehensiveTestAsync(CompanyProfile source, 
            TargetProfile target);
    }
    
    public enum ServiceType
    {
        ActiveDirectory,
        AzureAD,
        Exchange,
        ExchangeOnline,
        SharePoint,
        SharePointOnline,
        Teams,
        OneDrive,
        SqlServer,
        FileShare,
        GraphAPI,
        PowerShell
    }
    
    public class ConnectionTestOptions
    {
        public bool TestAuthentication { get; set; } = true;
        public bool TestAuthorization { get; set; } = true;
        public bool TestDataAccess { get; set; } = false;
        public int TimeoutSeconds { get; set; } = 30;
        public bool UseCache { get; set; } = true;
        public List<ServiceType> ServicesToTest { get; set; } = new();
    }
    
    public class ConnectionTestResult
    {
        public bool Success { get; set; }
        public string ProfileName { get; set; }
        public DateTime TestedAt { get; set; }
        public TimeSpan Duration { get; set; }
        
        public Dictionary<ServiceType, ServiceTestResult> ServiceResults { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        
        public int SuccessfulServices => ServiceResults.Count(r => r.Value.Success);
        public int FailedServices => ServiceResults.Count(r => !r.Value.Success);
    }
    
    public class ServiceTestResult
    {
        public ServiceType Service { get; set; }
        public bool Success { get; set; }
        public string Endpoint { get; set; }
        public string Message { get; set; }
        public TimeSpan ResponseTime { get; set; }
        public string Version { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
        public Exception Exception { get; set; }
    }
}
```

### 3.2 Connection Test Implementation

```csharp
namespace MandADiscoverySuite.Services
{
    public class ConnectionTestService : IConnectionTestService
    {
        private readonly ILogger<ConnectionTestService> _logger;
        private readonly ISecureCredentialService _credentialService;
        private readonly IPowerShellExecutionService _psService;
        private readonly IGraphApiService _graphService;
        
        public async Task<ConnectionTestResult> TestTargetConnectionAsync(
            TargetProfile target, ConnectionTestOptions options = null)
        {
            options ??= new ConnectionTestOptions();
            var result = new ConnectionTestResult
            {
                ProfileName = target.Name,
                TestedAt = DateTime.UtcNow
            };
            
            var stopwatch = Stopwatch.StartNew();
            
            // Determine which services to test based on target configuration
            var servicesToTest = DetermineServicesToTest(target, options);
            
            // Test each service in parallel with timeout
            var testTasks = servicesToTest.Select(service => 
                TestServiceWithTimeoutAsync(service, target, options.TimeoutSeconds));
            
            var serviceResults = await Task.WhenAll(testTasks);
            
            foreach (var serviceResult in serviceResults)
            {
                result.ServiceResults[serviceResult.Service] = serviceResult;
                if (!serviceResult.Success)
                {
                    result.Errors.Add($"{serviceResult.Service}: {serviceResult.Message}");
                }
            }
            
            result.Duration = stopwatch.Elapsed;
            result.Success = result.FailedServices == 0;
            
            // Update target profile with test results
            target.LastConnectionTest = result.TestedAt;
            target.LastConnectionTestSuccess = result.Success;
            target.LastConnectionTestMessage = result.Success ? 
                $"All {result.SuccessfulServices} services connected successfully" :
                $"{result.FailedServices} of {result.ServiceResults.Count} services failed";
            
            return result;
        }
        
        private async Task<ServiceTestResult> TestServiceWithTimeoutAsync(
            ServiceType service, TargetProfile target, int timeoutSeconds)
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(timeoutSeconds));
            
            try
            {
                return service switch
                {
                    ServiceType.AzureAD => await TestAzureADAsync(target, cts.Token),
                    ServiceType.GraphAPI => await TestGraphAPIAsync(target, cts.Token),
                    ServiceType.ActiveDirectory => await TestActiveDirectoryAsync(target, cts.Token),
                    ServiceType.Exchange => await TestExchangeAsync(target, cts.Token),
                    ServiceType.SharePoint => await TestSharePointAsync(target, cts.Token),
                    _ => new ServiceTestResult 
                    { 
                        Service = service, 
                        Success = false, 
                        Message = "Service test not implemented" 
                    }
                };
            }
            catch (OperationCanceledException)
            {
                return new ServiceTestResult
                {
                    Service = service,
                    Success = false,
                    Message = $"Connection test timed out after {timeoutSeconds} seconds"
                };
            }
        }
        
        private async Task<ServiceTestResult> TestGraphAPIAsync(TargetProfile target, CancellationToken ct)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = new ServiceTestResult
            {
                Service = ServiceType.GraphAPI,
                Endpoint = "https://graph.microsoft.com"
            };
            
            try
            {
                // Retrieve stored credentials
                var credential = await _credentialService.RetrieveCredentialAsync(
                    target.Id, CredentialType.ServicePrincipal);
                
                // Test Graph API connectivity
                var graphClient = _graphService.CreateClient(
                    target.TenantId, 
                    target.ClientId, 
                    credential?.Password);
                
                // Simple test query
                var user = await graphClient.Me.Request().GetAsync(ct);
                
                result.Success = true;
                result.Message = "Successfully connected to Microsoft Graph API";
                result.Metadata["UserPrincipalName"] = user.UserPrincipalName;
                result.Version = "v1.0";
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = ex.Message;
                result.Exception = ex;
            }
            
            result.ResponseTime = stopwatch.Elapsed;
            return result;
        }
    }
}
```

## 4. Profile Configuration Management

### 4.1 Configuration Structure

```csharp
namespace MandADiscoverySuite.Configuration
{
    /// <summary>
    /// Persisted configuration for dual-profile system
    /// </summary>
    public class ProfileConfiguration
    {
        public string ConfigVersion { get; set; } = "2.0";
        
        // Profile selections
        public string ActiveSourceProfileId { get; set; }
        public string ActiveTargetProfileId { get; set; }
        
        // Profile paths
        public string SourceProfilePath { get; set; }
        public string TargetProfilePath { get; set; }
        
        // Environment settings
        public EnvironmentType LastDetectedEnvironment { get; set; }
        public DateTime LastEnvironmentDetection { get; set; }
        public bool AutoDetectEnvironment { get; set; } = true;
        
        // Module configuration based on environment
        public Dictionary<EnvironmentType, List<string>> EnabledModulesByEnvironment { get; set; } = new();
        
        // Connection settings
        public bool ValidateConnectionsOnStartup { get; set; } = true;
        public int ConnectionTestIntervalMinutes { get; set; } = 60;
        
        // Security settings
        public bool RequireEncryption { get; set; } = true;
        public bool AuditCredentialAccess { get; set; } = true;
        
        // Migration defaults
        public string DefaultMigrationMode { get; set; } = "Staged";
        public bool AutoMapProfiles { get; set; } = true;
    }
}
```

### 4.2 Configuration Service Enhancement

```csharp
namespace MandADiscoverySuite.Services
{
    public interface IProfileConfigurationService
    {
        Task<ProfileConfiguration> LoadConfigurationAsync();
        Task SaveConfigurationAsync(ProfileConfiguration config);
        Task<bool> SetActiveSourceProfileAsync(string profileId);
        Task<bool> SetActiveTargetProfileAsync(string profileId);
        Task<(CompanyProfile source, TargetProfile target)> GetActiveProfilesAsync();
        void RegisterConfigurationChangeHandler(Action<ProfileConfiguration> handler);
    }
    
    public class ProfileConfigurationService : IProfileConfigurationService
    {
        private readonly string _configPath;
        private ProfileConfiguration _currentConfig;
        private readonly List<Action<ProfileConfiguration>> _changeHandlers = new();
        
        public ProfileConfigurationService()
        {
            _configPath = Path.Combine(
                ConfigurationService.Instance.DiscoveryDataRootPath,
                "Configuration",
                "profile-config.json");
        }
        
        public async Task<ProfileConfiguration> LoadConfigurationAsync()
        {
            if (File.Exists(_configPath))
            {
                var json = await File.ReadAllTextAsync(_configPath);
                _currentConfig = JsonSerializer.Deserialize<ProfileConfiguration>(json);
            }
            else
            {
                _currentConfig = CreateDefaultConfiguration();
                await SaveConfigurationAsync(_currentConfig);
            }
            
            return _currentConfig;
        }
        
        private ProfileConfiguration CreateDefaultConfiguration()
        {
            return new ProfileConfiguration
            {
                EnabledModulesByEnvironment = new Dictionary<EnvironmentType, List<string>>
                {
                    [EnvironmentType.OnPremises] = new List<string>
                    {
                        "ActiveDirectoryDiscovery",
                        "ExchangeDiscovery",
                        "FileServerDiscovery",
                        "SQLServerDiscovery",
                        "InfrastructureDiscovery",
                        "GPODiscovery"
                    },
                    [EnvironmentType.Azure] = new List<string>
                    {
                        "AzureADDiscovery",
                        "ExchangeOnlineDiscovery",
                        "SharePointOnlineDiscovery",
                        "TeamsDiscovery",
                        "OneDriveDiscovery",
                        "PowerBIDiscovery"
                    },
                    [EnvironmentType.Hybrid] = new List<string>
                    {
                        // All modules from both environments
                        "ActiveDirectoryDiscovery",
                        "AzureADDiscovery",
                        "ExchangeDiscovery",
                        "ExchangeOnlineDiscovery",
                        "FileServerDiscovery",
                        "SharePointOnlineDiscovery",
                        "TeamsDiscovery",
                        "SQLServerDiscovery",
                        "InfrastructureDiscovery"
                    }
                }
            };
        }
    }
}
```

## 5. Module Enablement Based on Environment

### 5.1 Module Compatibility Matrix

```csharp
namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Manages module availability based on environment detection
    /// </summary>
    public interface IModuleAvailabilityService
    {
        Task<List<DiscoveryModule>> GetAvailableModulesAsync(EnvironmentType environment);
        Task<bool> IsModuleAvailableAsync(string moduleName, EnvironmentType environment);
        Task<Dictionary<string, ModuleAvailability>> GetModuleAvailabilityMatrixAsync();
        Task<List<string>> GetModuleDependenciesAsync(string moduleName);
    }
    
    public class ModuleAvailability
    {
        public string ModuleName { get; set; }
        public string DisplayName { get; set; }
        public List<EnvironmentType> SupportedEnvironments { get; set; } = new();
        public List<string> RequiredServices { get; set; } = new();
        public List<string> RequiredPermissions { get; set; } = new();
        public bool RequiresElevation { get; set; }
        public string MinimumVersion { get; set; }
        public string WarningMessage { get; set; }
    }
    
    public class ModuleAvailabilityService : IModuleAvailabilityService
    {
        private readonly Dictionary<string, ModuleAvailability> _moduleMatrix = new()
        {
            ["ActiveDirectoryDiscovery"] = new ModuleAvailability
            {
                ModuleName = "ActiveDirectoryDiscovery",
                DisplayName = "Active Directory Discovery",
                SupportedEnvironments = new() { EnvironmentType.OnPremises, EnvironmentType.Hybrid },
                RequiredServices = new() { "ActiveDirectory", "LDAP" },
                RequiredPermissions = new() { "Domain.Read", "User.Read.All" },
                RequiresElevation = false
            },
            ["AzureADDiscovery"] = new ModuleAvailability
            {
                ModuleName = "AzureADDiscovery",
                DisplayName = "Azure AD Discovery",
                SupportedEnvironments = new() { EnvironmentType.Azure, EnvironmentType.Hybrid },
                RequiredServices = new() { "AzureAD", "GraphAPI" },
                RequiredPermissions = new() { "Directory.Read.All", "User.Read.All" },
                RequiresElevation = false
            },
            ["ExchangeDiscovery"] = new ModuleAvailability
            {
                ModuleName = "ExchangeDiscovery",
                DisplayName = "Exchange On-Premises Discovery",
                SupportedEnvironments = new() { EnvironmentType.OnPremises, EnvironmentType.Hybrid },
                RequiredServices = new() { "Exchange", "PowerShell" },
                RequiredPermissions = new() { "Exchange.ViewOnly" },
                RequiresElevation = false,
                MinimumVersion = "2013"
            },
            ["ExchangeOnlineDiscovery"] = new ModuleAvailability
            {
                ModuleName = "ExchangeOnlineDiscovery",
                DisplayName = "Exchange Online Discovery",
                SupportedEnvironments = new() { EnvironmentType.Azure, EnvironmentType.Hybrid },
                RequiredServices = new() { "ExchangeOnline", "GraphAPI" },
                RequiredPermissions = new() { "Mail.Read", "Calendars.Read" },
                RequiresElevation = false
            },
            ["InfrastructureDiscovery"] = new ModuleAvailability
            {
                ModuleName = "InfrastructureDiscovery",
                DisplayName = "Infrastructure Discovery",
                SupportedEnvironments = new() { EnvironmentType.OnPremises, EnvironmentType.Hybrid },
                RequiredServices = new() { "WMI", "NetworkAccess" },
                RequiredPermissions = new() { "Computer.Read", "Network.Scan" },
                RequiresElevation = true,
                WarningMessage = "Requires administrative privileges for network scanning"
            }
        };
        
        public async Task<List<DiscoveryModule>> GetAvailableModulesAsync(EnvironmentType environment)
        {
            var availableModules = new List<DiscoveryModule>();
            
            foreach (var matrix in _moduleMatrix.Values)
            {
                if (matrix.SupportedEnvironments.Contains(environment))
                {
                    // Check if required services are available
                    var servicesAvailable = await CheckRequiredServicesAsync(matrix.RequiredServices);
                    if (servicesAvailable)
                    {
                        var module = await LoadModuleMetadataAsync(matrix.ModuleName);
                        if (module != null)
                        {
                            availableModules.Add(module);
                        }
                    }
                }
            }
            
            return availableModules;
        }
    }
}
```

## 6. Integration with MainViewModel

### 6.1 Enhanced MainViewModel Properties

```csharp
public partial class MainViewModel : ViewModelBase
{
    // Profile Management
    private CompanyProfile _selectedSourceProfile;
    public CompanyProfile SelectedSourceProfile
    {
        get => _selectedSourceProfile;
        set
        {
            _selectedSourceProfile = value;
            OnPropertyChanged();
            UpdateProfileDependentProperties();
        }
    }
    
    private TargetProfile _selectedTargetProfile;
    public TargetProfile SelectedTargetProfile
    {
        get => _selectedTargetProfile;
        set
        {
            _selectedTargetProfile = value;
            OnPropertyChanged();
            UpdateTargetDependentProperties();
        }
    }
    
    // Environment Detection
    private EnvironmentStatus _currentEnvironment;
    public EnvironmentStatus CurrentEnvironment
    {
        get => _currentEnvironment;
        set
        {
            _currentEnvironment = value;
            OnPropertyChanged();
            UpdateAvailableModules();
        }
    }
    
    // Connection Status
    private ConnectionTestResult _sourceConnectionStatus;
    public ConnectionTestResult SourceConnectionStatus
    {
        get => _sourceConnectionStatus;
        set
        {
            _sourceConnectionStatus = value;
            OnPropertyChanged();
        }
    }
    
    private ConnectionTestResult _targetConnectionStatus;
    public ConnectionTestResult TargetConnectionStatus
    {
        get => _targetConnectionStatus;
        set
        {
            _targetConnectionStatus = value;
            OnPropertyChanged();
        }
    }
    
    // Commands
    public IAsyncCommand DetectEnvironmentCommand { get; }
    public IAsyncCommand TestSourceConnectionCommand { get; }
    public IAsyncCommand TestTargetConnectionCommand { get; }
    public IAsyncCommand SaveProfileConfigurationCommand { get; }
    
    // Services
    private readonly IEnvironmentDetectionService _environmentService;
    private readonly IConnectionTestService _connectionTestService;
    private readonly IProfileConfigurationService _profileConfigService;
    private readonly IModuleAvailabilityService _moduleAvailabilityService;
}
```

## 7. Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
1. Implement enhanced TargetProfile model
2. Create SecureCredentialService with DPAPI encryption
3. Update TargetProfileService with new properties
4. Create ProfileConfiguration model and service

### Phase 2: Environment Detection (Week 2)
1. Implement EnvironmentDetectionService
2. Create detection scripts for each environment type
3. Implement capability detection logic
4. Add environment caching and refresh mechanisms

### Phase 3: Connection Testing (Week 3)
1. Implement ConnectionTestService
2. Create service-specific test methods
3. Add timeout and retry logic
4. Implement result caching

### Phase 4: Module Management (Week 4)
1. Create ModuleAvailabilityService
2. Define complete module compatibility matrix
3. Implement dynamic module filtering
4. Update GUI to show/hide modules based on environment

### Phase 5: Integration & Testing (Week 5)
1. Integrate all services with MainViewModel
2. Update UI to support dual profiles
3. Add connection status indicators
4. Comprehensive testing of all scenarios

## 8. Security Considerations

1. **Credential Protection**
   - All credentials encrypted with DPAPI (CurrentUser scope)
   - SecureString usage for in-memory password handling
   - Automatic credential expiration and rotation reminders

2. **Audit Logging**
   - All credential access logged
   - Connection test attempts tracked
   - Environment detection events recorded

3. **Least Privilege**
   - Module execution with minimum required permissions
   - Credential scope limitation to necessary services
   - Regular permission validation

## 9. Error Handling & Recovery

1. **Connection Failures**
   - Automatic retry with exponential backoff
   - Fallback to cached results when appropriate
   - Clear error messages with remediation steps

2. **Environment Detection Failures**
   - Graceful degradation to manual configuration
   - Partial detection support
   - User override capabilities

3. **Credential Issues**
   - Prompt for re-authentication
   - Support for credential refresh
   - Clear expiration warnings

## 10. Success Criteria

1. Dual-profile system fully operational with source and target profiles
2. Environment detection accuracy > 95% in standard scenarios
3. Connection tests complete within 30 seconds
4. Module availability correctly filtered based on environment
5. All credentials securely stored and retrieved
6. Complete audit trail for all operations
7. Seamless integration with existing MVVM framework
8. Zero regression in existing functionality