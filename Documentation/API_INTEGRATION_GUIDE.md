# M&A Migration Platform - API & Integration Guide
**Technical Integration Documentation for Developers and System Integrators**

Generated: 2025-08-22
Platform Version: 1.0 Production Ready
Documentation Type: API & Integration Reference
Audience: Developers, System Integrators, DevOps Engineers

---

## TABLE OF CONTENTS

1. [Integration Overview](#integration-overview)
2. [PowerShell Module API](#powershell-module-api)
3. [C# Application Integration](#c-application-integration)
4. [Data Exchange Formats](#data-exchange-formats)
5. [Event System and Callbacks](#event-system-and-callbacks)
6. [REST API Endpoints](#rest-api-endpoints)
7. [Custom Module Development](#custom-module-development)
8. [Third-Party Integrations](#third-party-integrations)
9. [Security and Authentication](#security-and-authentication)
10. [Error Handling and Diagnostics](#error-handling-and-diagnostics)

---

## INTEGRATION OVERVIEW

### Architecture Components

```
M&A Migration Platform Integration Architecture:
├── GUI Layer (WPF/C#)
│   ├── ViewModels: Business logic and state management
│   ├── Services: Integration bridge services
│   └── Models: Data transfer objects
├── PowerShell Integration Layer
│   ├── Module Bridge: PS ↔ C# communication
│   ├── Execution Engine: Async PS execution
│   └── Progress Reporting: Real-time status updates
├── PowerShell Modules (8 Core Modules)
│   ├── UserMigration.psm1: User account migration
│   ├── MailboxMigration.psm1: Exchange migration
│   ├── SharePointMigration.psm1: SharePoint content migration
│   ├── FileSystemMigration.psm1: File share migration
│   ├── VirtualMachineMigration.psm1: VM migration
│   ├── ApplicationMigration.psm1: Application migration
│   ├── UserProfileMigration.psm1: Profile migration
│   └── ServerMigration.psm1: Server migration
└── Data Layer
    ├── CSV Processing: Bulk data operations
    ├── Configuration Management: Settings persistence
    └── Logging System: Structured activity logging
```

### Integration Patterns

#### 1. PowerShell-First Architecture
- **Primary Logic**: Core migration logic implemented in PowerShell
- **C# Orchestration**: GUI and workflow orchestration in C#
- **Async Communication**: Non-blocking communication between layers
- **Progress Streaming**: Real-time progress and status updates

#### 2. Event-Driven Design
- **Event Publishing**: PowerShell modules publish events to C# layer
- **State Management**: C# layer maintains overall state and coordination
- **Progress Callbacks**: Real-time progress reporting through events
- **Error Propagation**: Structured error handling across boundaries

#### 3. Data Contract Standards
- **Structured Data**: Consistent data formats across all integrations
- **Serialization**: JSON-based data exchange format
- **Validation**: Schema validation for all data exchanges
- **Versioning**: API versioning for backward compatibility

---

## POWERSHELL MODULE API

### Core Module Interface

#### Standard Module Structure
```powershell
# Module Template Structure
class MigrationModule {
    # Core Properties
    [string]$ModuleName
    [string]$ModuleVersion  
    [hashtable]$Configuration
    [hashtable]$Status
    [string]$LogPath
    
    # Core Methods
    [void] Initialize($config)
    [object] StartMigration($parameters)
    [object] GetStatus()
    [void] PauseMigration()
    [void] ResumeMigration()
    [void] StopMigration()
    [object] ValidateMigration()
    [object] GetProgress()
}
```

### UserMigration Module API

#### Initialize User Migration
```powershell
# Import the module
Import-Module ".\Modules\Migration\UserMigration.psm1"

# Create migration instance
$userMigration = [UserMigration]::new("source.domain.com", "target.domain.com")

# Configure credentials
$sourceCred = Get-Credential -Message "Source Domain Credentials"
$targetCred = Get-Credential -Message "Target Domain Credentials"
$userMigration.SetCredentials($sourceCred, $targetCred)

# Configure migration settings
$userMigration.MigrationConfig.BatchSize = 50
$userMigration.MigrationConfig.CreateOUStructure = $true
$userMigration.MigrationConfig.PreserveUserPrincipalName = $true
```

#### Execute User Migration
```powershell
# Add users to migration queue
$users = Import-Csv "users.csv"
foreach ($user in $users) {
    $userMigration.AddUserToQueue($user.SamAccountName, $user.TargetOU)
}

# Configure advanced group mapping
$userMigration.SetGroupNamingConvention("Prefix", "MIGRATED_")
$userMigration.SetGroupNamingConvention("ConflictStrategy", "Append")

# Start migration with progress callback
$result = $userMigration.StartMigrationAsync({
    param($progressData)
    Write-Progress -Activity "User Migration" -Status $progressData.Status -PercentComplete $progressData.Percentage
})
```

#### Monitor Migration Progress
```powershell
# Get real-time status
do {
    $status = $userMigration.GetMigrationStatus()
    Write-Host "Progress: $($status.PercentComplete)% - $($status.CurrentItem)"
    
    if ($status.ErrorCount -gt 0) {
        $errors = $userMigration.GetErrors()
        foreach ($error in $errors) {
            Write-Warning "Error: $($error.Message) - Item: $($error.ItemName)"
        }
    }
    
    Start-Sleep -Seconds 5
} while ($status.Status -eq "InProgress")

# Get final results
$results = $userMigration.GetMigrationResults()
Write-Host "Migration completed: $($results.SuccessfulItems) successful, $($results.FailedItems) failed"
```

### MailboxMigration Module API

#### Exchange Migration Configuration
```powershell
# Import and initialize
Import-Module ".\Modules\Migration\MailboxMigration.psm1"
$mailboxMigration = [MailboxMigration]::new("CloudToCloud")

# Configure environments
$mailboxMigration.SetSourceEnvironment(
    "https://outlook.office365.com/powershell-liveid/",
    $sourceCredential,
    "source-tenant-id"
)

$mailboxMigration.SetTargetEnvironment(
    "https://outlook.office365.com/powershell-liveid/",
    $targetCredential,
    "target-tenant-id"
)

# Configure migration settings
$mailboxMigration.MigrationConfig.BatchSize = 20
$mailboxMigration.MigrationConfig.UseCutoverMigration = $false
$mailboxMigration.MigrationConfig.MigrateArchives = $true
$mailboxMigration.MigrationConfig.PreserveEmailAddresses = $true
```

#### Execute Mailbox Migration
```powershell
# Connect to Exchange environments
$mailboxMigration.ConnectToExchange()

# Create migration batches
$users = Import-Csv "mailboxes.csv"
$batchSize = $mailboxMigration.MigrationConfig.BatchSize
$batches = @()

for ($i = 0; $i -lt $users.Count; $i += $batchSize) {
    $batchUsers = $users[$i..([Math]::Min($i + $batchSize - 1, $users.Count - 1))]
    $batchName = "MailboxBatch_$(Get-Date -Format 'yyyyMMdd_HHmmss')_$([Math]::Floor($i / $batchSize) + 1)"
    
    $batch = $mailboxMigration.CreateMigrationBatch($batchName, $batchUsers)
    $batches += $batch
}

# Execute batches with monitoring
foreach ($batch in $batches) {
    Write-Host "Starting batch: $($batch.Name)"
    $result = $mailboxMigration.StartMigrationBatch($batch.Name)
    
    # Monitor batch progress
    do {
        $batchStatus = $mailboxMigration.GetBatchStatus($batch.Name)
        Write-Progress -Activity "Mailbox Migration" -Status "Batch: $($batch.Name)" -PercentComplete $batchStatus.PercentComplete
        Start-Sleep -Seconds 30
    } while ($batchStatus.Status -eq "InProgress")
    
    Write-Host "Batch $($batch.Name) completed with status: $($batchStatus.Status)"
}
```

### SharePointMigration Module API

#### SharePoint Migration Setup
```powershell
Import-Module ".\Modules\Migration\SharePointMigration.psm1"
$spMigration = [SharePointMigration]::new()

# Configure SharePoint environments
$spMigration.SetSourceEnvironment(
    "https://source-tenant.sharepoint.com",
    $sourceCredential,
    "OnPremises"  # or "SharePointOnline"
)

$spMigration.SetTargetEnvironment(
    "https://target-tenant.sharepoint.com",
    $targetCredential,
    "SharePointOnline"
)

# Configure migration settings
$spMigration.MigrationConfig.PreservePermissions = $true
$spMigration.MigrationConfig.MigrateVersionHistory = $true
$spMigration.MigrationConfig.MaxFileSize = 100MB
$spMigration.MigrationConfig.IncludeSubsites = $true
```

### FileSystemMigration Module API

#### File Share Migration
```powershell
Import-Module ".\Modules\Migration\FileSystemMigration.psm1"
$fsMigration = [FileSystemMigration]::new()

# Configure source and target
$fsMigration.SetSourcePath("\\source-server\shares\")
$fsMigration.SetTargetPath("\\target-server\shares\")

# Configure migration settings
$fsMigration.MigrationConfig.PreserveACLs = $true
$fsMigration.MigrationConfig.PreserveTimestamps = $true  
$fsMigration.MigrationConfig.MaxThreads = 8
$fsMigration.MigrationConfig.RetryCount = 3

# Add shares to migration
$shares = Get-Content "shares.txt"
foreach ($share in $shares) {
    $fsMigration.AddShareToMigration($share)
}

# Execute with progress monitoring
$result = $fsMigration.StartMigrationAsync({
    param($progress)
    Write-Progress -Activity "File Migration" -Status $progress.CurrentFile -PercentComplete $progress.Percentage
})
```

---

## C# APPLICATION INTEGRATION

### PowerShell Integration Bridge

#### PowerShell Execution Service
```csharp
public interface IPowerShellExecutionService
{
    Task<PowerShellResult> ExecuteScriptAsync(string scriptPath, Dictionary<string, object> parameters);
    Task<PowerShellResult> ExecuteCommandAsync(string command, Dictionary<string, object> parameters);
    void RegisterProgressCallback(Action<ProgressData> callback);
    void RegisterErrorCallback(Action<ErrorData> callback);
    Task CancelExecutionAsync();
}

public class PowerShellExecutionService : IPowerShellExecutionService
{
    private readonly ILogger<PowerShellExecutionService> _logger;
    private PowerShell _powerShell;
    private CancellationTokenSource _cancellationTokenSource;
    
    public async Task<PowerShellResult> ExecuteScriptAsync(string scriptPath, Dictionary<string, object> parameters)
    {
        try
        {
            _cancellationTokenSource = new CancellationTokenSource();
            _powerShell = PowerShell.Create();
            
            // Add script and parameters
            _powerShell.AddScript(File.ReadAllText(scriptPath));
            foreach (var param in parameters)
            {
                _powerShell.AddParameter(param.Key, param.Value);
            }
            
            // Execute with progress monitoring
            var results = await Task.Run(() =>
            {
                var psResults = new List<PSObject>();
                var progressData = new ProgressData();
                
                _powerShell.Streams.Progress.DataAdded += (sender, e) =>
                {
                    var progress = _powerShell.Streams.Progress[e.Index];
                    progressData.PercentComplete = progress.PercentComplete;
                    progressData.Activity = progress.Activity;
                    progressData.StatusDescription = progress.StatusDescription;
                    OnProgressUpdate?.Invoke(progressData);
                };
                
                _powerShell.Streams.Error.DataAdded += (sender, e) =>
                {
                    var error = _powerShell.Streams.Error[e.Index];
                    var errorData = new ErrorData
                    {
                        Message = error.ToString(),
                        Exception = error.Exception,
                        CategoryInfo = error.CategoryInfo.ToString()
                    };
                    OnErrorOccurred?.Invoke(errorData);
                };
                
                return _powerShell.Invoke();
            }, _cancellationTokenSource.Token);
            
            return new PowerShellResult
            {
                Success = !_powerShell.Streams.Error.Any(),
                Results = results,
                Errors = _powerShell.Streams.Error.ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PowerShell execution failed");
            throw;
        }
        finally
        {
            _powerShell?.Dispose();
        }
    }
}
```

#### Migration Orchestration Service
```csharp
public class MigrationOrchestrationService
{
    private readonly IPowerShellExecutionService _psService;
    private readonly ILogger<MigrationOrchestrationService> _logger;
    
    public async Task<MigrationResult> ExecuteUserMigrationAsync(UserMigrationRequest request)
    {
        try
        {
            // Prepare PowerShell parameters
            var parameters = new Dictionary<string, object>
            {
                ["SourceDomain"] = request.SourceDomain,
                ["TargetDomain"] = request.TargetDomain,
                ["Users"] = request.Users,
                ["BatchSize"] = request.BatchSize,
                ["CreateOUStructure"] = request.CreateOUStructure
            };
            
            // Register progress callback
            _psService.RegisterProgressCallback(progress =>
            {
                OnMigrationProgress?.Invoke(new MigrationProgress
                {
                    PercentComplete = progress.PercentComplete,
                    CurrentItem = progress.StatusDescription,
                    Activity = progress.Activity
                });
            });
            
            // Execute migration
            var scriptPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, 
                "Modules", "Migration", "UserMigration.psm1");
                
            var result = await _psService.ExecuteScriptAsync(scriptPath, parameters);
            
            return new MigrationResult
            {
                Success = result.Success,
                ProcessedItems = ExtractProcessedItems(result),
                Errors = result.Errors.Select(e => e.ToString()).ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "User migration execution failed");
            throw;
        }
    }
}
```

### Data Transfer Objects

#### Migration Request Models
```csharp
public class MigrationRequest
{
    public string MigrationId { get; set; } = Guid.NewGuid().ToString();
    public string ProjectName { get; set; }
    public string WaveName { get; set; }
    public MigrationType Type { get; set; }
    public Dictionary<string, object> Configuration { get; set; } = new();
    public List<MigrationItem> Items { get; set; } = new();
    public DateTime RequestTime { get; set; } = DateTime.UtcNow;
}

public class UserMigrationRequest : MigrationRequest
{
    public string SourceDomain { get; set; }
    public string TargetDomain { get; set; }
    public int BatchSize { get; set; } = 50;
    public bool CreateOUStructure { get; set; } = true;
    public bool PreserveUserPrincipalName { get; set; } = false;
    public Dictionary<string, string> GroupMappings { get; set; } = new();
}

public class MailboxMigrationRequest : MigrationRequest
{
    public string SourceTenantId { get; set; }
    public string TargetTenantId { get; set; }
    public string MigrationEndpoint { get; set; }
    public bool MigrateArchives { get; set; } = true;
    public bool PreserveEmailAddresses { get; set; } = true;
    public int LargeItemLimit { get; set; } = 100;
    public int BadItemLimit { get; set; } = 50;
}
```

#### Progress and Status Models
```csharp
public class MigrationProgress
{
    public string MigrationId { get; set; }
    public double PercentComplete { get; set; }
    public string CurrentItem { get; set; }
    public string Activity { get; set; }
    public string Status { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public Dictionary<string, object> Metrics { get; set; } = new();
}

public class MigrationStatus
{
    public string MigrationId { get; set; }
    public MigrationStatusEnum Status { get; set; }
    public double PercentComplete { get; set; }
    public int TotalItems { get; set; }
    public int ProcessedItems { get; set; }
    public int SuccessfulItems { get; set; }
    public int FailedItems { get; set; }
    public List<string> CurrentErrors { get; set; } = new();
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public TimeSpan ElapsedTime => DateTime.UtcNow - StartTime;
}
```

---

## DATA EXCHANGE FORMATS

### JSON Schema Standards

#### Migration Configuration Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "MigrationConfiguration",
  "type": "object",
  "properties": {
    "migrationId": {
      "type": "string",
      "format": "uuid"
    },
    "projectName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "migrationType": {
      "type": "string",
      "enum": ["User", "Mailbox", "FileShare", "SharePoint", "VirtualMachine", "Application"]
    },
    "sourceEnvironment": {
      "$ref": "#/definitions/Environment"
    },
    "targetEnvironment": {
      "$ref": "#/definitions/Environment"
    },
    "settings": {
      "type": "object",
      "properties": {
        "batchSize": {
          "type": "integer",
          "minimum": 1,
          "maximum": 1000
        },
        "retryAttempts": {
          "type": "integer",
          "minimum": 0,
          "maximum": 10
        },
        "preservePermissions": {
          "type": "boolean"
        }
      }
    }
  },
  "definitions": {
    "Environment": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["OnPremises", "Cloud", "Hybrid"]
        },
        "connectionString": {
          "type": "string"
        },
        "credentials": {
          "$ref": "#/definitions/Credentials"
        }
      }
    }
  }
}
```

#### Progress Data Schema
```json
{
  "migrationId": "uuid",
  "timestamp": "2025-08-22T10:30:00Z",
  "status": "InProgress",
  "percentComplete": 67.5,
  "currentItem": "john.doe@company.com",
  "activity": "Migrating user accounts",
  "metrics": {
    "itemsPerMinute": 12.5,
    "totalItems": 1000,
    "processedItems": 675,
    "successfulItems": 670,
    "failedItems": 5,
    "estimatedCompletion": "2025-08-22T11:15:00Z"
  },
  "errors": [
    {
      "itemName": "jane.smith@company.com",
      "errorCode": "PERMISSION_DENIED",
      "message": "Insufficient permissions to create user account",
      "severity": "High",
      "timestamp": "2025-08-22T10:25:00Z"
    }
  ]
}
```

### CSV Data Formats

#### User Migration CSV Format
```csv
SamAccountName,DisplayName,UserPrincipalName,TargetOU,SecurityGroups,MailboxType,Department
john.doe,John Doe,john.doe@source.com,OU=Users;OU=Finance;DC=target;DC=com,"Finance Users;All Employees",UserMailbox,Finance
jane.smith,Jane Smith,jane.smith@source.com,OU=Users;OU=IT;DC=target;DC=com,"IT Staff;Domain Admins",UserMailbox,IT
```

#### Mailbox Migration CSV Format
```csv
SourceEmailAddress,TargetEmailAddress,MailboxType,ArchiveEnabled,ForwardingAddress,Department,BatchName
john.doe@source.com,john.doe@target.com,UserMailbox,true,,Finance,Finance_Batch_1
jane.smith@source.com,jane.smith@target.com,UserMailbox,true,,IT,IT_Batch_1
```

---

## EVENT SYSTEM AND CALLBACKS

### Event Publishing System

#### PowerShell Event Publisher
```powershell
class EventPublisher {
    [hashtable]$Subscribers = @{}
    
    [void] Subscribe([string]$eventType, [scriptblock]$callback) {
        if (-not $this.Subscribers.ContainsKey($eventType)) {
            $this.Subscribers[$eventType] = @()
        }
        $this.Subscribers[$eventType] += $callback
    }
    
    [void] Publish([string]$eventType, [object]$eventData) {
        if ($this.Subscribers.ContainsKey($eventType)) {
            foreach ($callback in $this.Subscribers[$eventType]) {
                try {
                    & $callback $eventData
                }
                catch {
                    Write-Warning "Event callback failed: $($_.Exception.Message)"
                }
            }
        }
    }
}

# Global event publisher instance
$Global:EventPublisher = [EventPublisher]::new()

# Example usage in migration modules
function PublishProgress {
    param(
        [string]$MigrationId,
        [double]$PercentComplete,
        [string]$CurrentItem,
        [string]$Status
    )
    
    $progressData = @{
        MigrationId = $MigrationId
        PercentComplete = $PercentComplete
        CurrentItem = $CurrentItem
        Status = $Status
        Timestamp = Get-Date
    }
    
    $Global:EventPublisher.Publish("MigrationProgress", $progressData)
}
```

#### C# Event Subscription
```csharp
public class PowerShellEventService
{
    private readonly IPowerShellExecutionService _psService;
    private readonly ILogger<PowerShellEventService> _logger;
    
    public event EventHandler<MigrationProgressEventArgs> MigrationProgressReceived;
    public event EventHandler<MigrationErrorEventArgs> MigrationErrorReceived;
    public event EventHandler<MigrationCompletedEventArgs> MigrationCompleted;
    
    public async Task SubscribeToEventsAsync()
    {
        // Subscribe to PowerShell events
        await _psService.ExecuteCommandAsync(@"
            $Global:EventPublisher.Subscribe('MigrationProgress', {
                param($eventData)
                # Send to C# layer via named pipe or other IPC mechanism
                Send-EventToHost -EventType 'MigrationProgress' -Data $eventData
            })
            
            $Global:EventPublisher.Subscribe('MigrationError', {
                param($eventData)
                Send-EventToHost -EventType 'MigrationError' -Data $eventData
            })
        ", null);
    }
    
    private void OnEventReceived(string eventType, object eventData)
    {
        switch (eventType)
        {
            case "MigrationProgress":
                MigrationProgressReceived?.Invoke(this, 
                    new MigrationProgressEventArgs(DeserializeProgress(eventData)));
                break;
                
            case "MigrationError":
                MigrationErrorReceived?.Invoke(this,
                    new MigrationErrorEventArgs(DeserializeError(eventData)));
                break;
        }
    }
}
```

### Real-Time Progress Updates

#### Progress Streaming Implementation
```csharp
public class ProgressStreamingService
{
    private readonly ConcurrentDictionary<string, MigrationProgress> _activeProgresses = new();
    private readonly Timer _progressUpdateTimer;
    
    public event EventHandler<ProgressUpdateEventArgs> ProgressUpdated;
    
    public ProgressStreamingService()
    {
        _progressUpdateTimer = new Timer(BroadcastProgressUpdates, null, 
            TimeSpan.FromMilliseconds(500), TimeSpan.FromMilliseconds(500));
    }
    
    public void UpdateProgress(string migrationId, MigrationProgress progress)
    {
        _activeProgresses.AddOrUpdate(migrationId, progress, (key, existing) => progress);
    }
    
    private void BroadcastProgressUpdates(object state)
    {
        foreach (var kvp in _activeProgresses)
        {
            ProgressUpdated?.Invoke(this, new ProgressUpdateEventArgs
            {
                MigrationId = kvp.Key,
                Progress = kvp.Value
            });
        }
    }
}
```

---

## REST API ENDPOINTS

### API Controller Implementation

#### Migration Controller
```csharp
[ApiController]
[Route("api/[controller]")]
public class MigrationController : ControllerBase
{
    private readonly IMigrationOrchestrationService _orchestrationService;
    private readonly ILogger<MigrationController> _logger;
    
    [HttpPost("user")]
    public async Task<ActionResult<MigrationResult>> StartUserMigration(
        [FromBody] UserMigrationRequest request)
    {
        try
        {
            var result = await _orchestrationService.ExecuteUserMigrationAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "User migration failed");
            return BadRequest(new { error = ex.Message });
        }
    }
    
    [HttpPost("mailbox")]
    public async Task<ActionResult<MigrationResult>> StartMailboxMigration(
        [FromBody] MailboxMigrationRequest request)
    {
        try
        {
            var result = await _orchestrationService.ExecuteMailboxMigrationAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Mailbox migration failed");
            return BadRequest(new { error = ex.Message });
        }
    }
    
    [HttpGet("{migrationId}/status")]
    public async Task<ActionResult<MigrationStatus>> GetMigrationStatus(string migrationId)
    {
        try
        {
            var status = await _orchestrationService.GetMigrationStatusAsync(migrationId);
            if (status == null)
                return NotFound();
                
            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get migration status for {MigrationId}", migrationId);
            return BadRequest(new { error = ex.Message });
        }
    }
    
    [HttpPost("{migrationId}/pause")]
    public async Task<ActionResult> PauseMigration(string migrationId)
    {
        try
        {
            await _orchestrationService.PauseMigrationAsync(migrationId);
            return Ok(new { message = "Migration paused successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to pause migration {MigrationId}", migrationId);
            return BadRequest(new { error = ex.Message });
        }
    }
    
    [HttpPost("{migrationId}/resume")]
    public async Task<ActionResult> ResumeMigration(string migrationId)
    {
        try
        {
            await _orchestrationService.ResumeMigrationAsync(migrationId);
            return Ok(new { message = "Migration resumed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to resume migration {MigrationId}", migrationId);
            return BadRequest(new { error = ex.Message });
        }
    }
}
```

#### Configuration Controller
```csharp
[ApiController]
[Route("api/[controller]")]
public class ConfigurationController : ControllerBase
{
    [HttpGet("migration-types")]
    public ActionResult<IEnumerable<string>> GetSupportedMigrationTypes()
    {
        return Ok(Enum.GetNames(typeof(MigrationType)));
    }
    
    [HttpGet("validation/{migrationType}")]
    public async Task<ActionResult<ValidationResult>> ValidateConfiguration(
        string migrationType, [FromQuery] Dictionary<string, object> configuration)
    {
        try
        {
            var result = await _validationService.ValidateConfigurationAsync(migrationType, configuration);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
```

### WebSocket Support for Real-Time Updates

#### SignalR Hub Implementation
```csharp
public class MigrationHub : Hub
{
    public async Task JoinMigrationGroup(string migrationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Migration_{migrationId}");
    }
    
    public async Task LeaveMigrationGroup(string migrationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Migration_{migrationId}");
    }
}

public class MigrationProgressService
{
    private readonly IHubContext<MigrationHub> _hubContext;
    
    public async Task BroadcastProgress(string migrationId, MigrationProgress progress)
    {
        await _hubContext.Clients.Group($"Migration_{migrationId}")
            .SendAsync("ProgressUpdate", progress);
    }
    
    public async Task BroadcastError(string migrationId, MigrationError error)
    {
        await _hubContext.Clients.Group($"Migration_{migrationId}")
            .SendAsync("ErrorOccurred", error);
    }
}
```

---

## CUSTOM MODULE DEVELOPMENT

### Module Development Framework

#### Base Migration Module Template
```powershell
#Requires -Version 5.1
using namespace System.Collections.Generic

Set-StrictMode -Version 3.0

class CustomMigrationModule {
    [string]$ModuleName
    [string]$ModuleVersion = "1.0.0"
    [hashtable]$Configuration
    [hashtable]$Status
    [string]$LogPath
    [object]$EventPublisher
    
    # Constructor
    CustomMigrationModule([string]$moduleName) {
        $this.ModuleName = $moduleName
        $this.Configuration = $this.GetDefaultConfiguration()
        $this.Status = @{
            State = "Initialized"
            Progress = 0
            StartTime = $null
            EndTime = $null
            Errors = @()
        }
        $this.LogPath = ".\Logs\$($moduleName)_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
        $this.EventPublisher = $Global:EventPublisher
        $this.InitializeLogging()
    }
    
    # Abstract methods to be implemented by derived classes
    [hashtable] GetDefaultConfiguration() { throw "Must be implemented by derived class" }
    [void] ValidateConfiguration() { throw "Must be implemented by derived class" }
    [object] StartMigration([hashtable]$parameters) { throw "Must be implemented by derived class" }
    [void] PauseMigration() { throw "Must be implemented by derived class" }
    [void] ResumeMigration() { throw "Must be implemented by derived class" }
    [void] StopMigration() { throw "Must be implemented by derived class" }
    
    # Common functionality
    [void] InitializeLogging() {
        $logDir = Split-Path $this.LogPath -Parent
        if (!(Test-Path $logDir)) {
            New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        }
        $this.WriteLog("Module $($this.ModuleName) initialized", "INFO")
    }
    
    [void] WriteLog([string]$message, [string]$level = "INFO") {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $logEntry = "[$timestamp] [$level] $message"
        Add-Content -Path $this.LogPath -Value $logEntry
        
        # Publish log event
        if ($this.EventPublisher) {
            $this.EventPublisher.Publish("ModuleLog", @{
                Module = $this.ModuleName
                Level = $level
                Message = $message
                Timestamp = $timestamp
            })
        }
    }
    
    [void] PublishProgress([double]$percentComplete, [string]$currentItem, [string]$status) {
        $this.Status.Progress = $percentComplete
        
        if ($this.EventPublisher) {
            $this.EventPublisher.Publish("MigrationProgress", @{
                Module = $this.ModuleName
                PercentComplete = $percentComplete
                CurrentItem = $currentItem
                Status = $status
                Timestamp = Get-Date
            })
        }
    }
    
    [object] GetStatus() {
        return $this.Status.Clone()
    }
}
```

#### Example Custom Module Implementation
```powershell
class DatabaseMigrationModule : CustomMigrationModule {
    [string]$SourceConnectionString
    [string]$TargetConnectionString
    [array]$Databases
    
    DatabaseMigrationModule() : base("DatabaseMigration") {
        $this.Databases = @()
    }
    
    [hashtable] GetDefaultConfiguration() {
        return @{
            MigrationMode = "BackupRestore"  # or "Replication", "LogShipping"
            PreserveLogins = $true
            MigrateJobs = $true
            MigrateLinkedServers = $false
            VerifyDataIntegrity = $true
            ParallelOperations = 2
            BackupLocation = "\\backup-server\sql-backups\"
            CompressBackups = $true
        }
    }
    
    [void] ValidateConfiguration() {
        if ([string]::IsNullOrEmpty($this.SourceConnectionString)) {
            throw "Source connection string is required"
        }
        if ([string]::IsNullOrEmpty($this.TargetConnectionString)) {
            throw "Target connection string is required"
        }
        
        # Test connections
        if (-not $this.TestConnection($this.SourceConnectionString)) {
            throw "Cannot connect to source SQL Server"
        }
        if (-not $this.TestConnection($this.TargetConnectionString)) {
            throw "Cannot connect to target SQL Server"
        }
    }
    
    [object] StartMigration([hashtable]$parameters) {
        try {
            $this.Status.State = "InProgress"
            $this.Status.StartTime = Get-Date
            
            $this.WriteLog("Starting database migration", "INFO")
            $this.PublishProgress(0, "Initializing", "Starting")
            
            # Discover databases
            $this.DiscoverDatabases()
            $this.PublishProgress(10, "Discovery complete", "Discovered $($this.Databases.Count) databases")
            
            # Create migration plan
            $migrationPlan = $this.CreateMigrationPlan()
            $this.PublishProgress(20, "Planning complete", "Migration plan created")
            
            # Execute migration
            $results = @()
            for ($i = 0; $i -lt $this.Databases.Count; $i++) {
                $database = $this.Databases[$i]
                $progress = 20 + (($i + 1) / $this.Databases.Count * 70)
                
                $this.PublishProgress($progress, $database.Name, "Migrating database")
                $result = $this.MigrateDatabase($database)
                $results += $result
            }
            
            $this.Status.State = "Completed"
            $this.Status.EndTime = Get-Date
            $this.PublishProgress(100, "Migration complete", "All databases migrated")
            
            return @{
                Success = $true
                Results = $results
                Duration = $this.Status.EndTime - $this.Status.StartTime
            }
        }
        catch {
            $this.Status.State = "Failed"
            $this.Status.Errors += $_.Exception.Message
            $this.WriteLog("Migration failed: $($_.Exception.Message)", "ERROR")
            throw
        }
    }
    
    [void] DiscoverDatabases() {
        # Implementation for database discovery
        $this.WriteLog("Discovering databases on source server", "INFO")
        # ... database discovery logic ...
    }
    
    [object] CreateMigrationPlan() {
        # Implementation for migration planning
        $this.WriteLog("Creating migration plan", "INFO")
        # ... migration planning logic ...
    }
    
    [object] MigrateDatabase([object]$database) {
        # Implementation for individual database migration
        $this.WriteLog("Migrating database: $($database.Name)", "INFO")
        # ... database migration logic ...
    }
}
```

### Module Registration and Discovery

#### Module Registry Service
```csharp
public interface IModuleRegistryService
{
    Task<IEnumerable<ModuleInfo>> DiscoverModulesAsync();
    Task<ModuleInfo> RegisterModuleAsync(string modulePath);
    Task<bool> ValidateModuleAsync(string modulePath);
    Task<ModuleExecutionContext> CreateExecutionContextAsync(string moduleId);
}

public class ModuleRegistryService : IModuleRegistryService
{
    private readonly ILogger<ModuleRegistryService> _logger;
    private readonly string _modulesPath;
    
    public async Task<IEnumerable<ModuleInfo>> DiscoverModulesAsync()
    {
        var modules = new List<ModuleInfo>();
        var moduleFiles = Directory.GetFiles(_modulesPath, "*.psm1", SearchOption.AllDirectories);
        
        foreach (var moduleFile in moduleFiles)
        {
            try
            {
                var moduleInfo = await AnalyzeModuleAsync(moduleFile);
                modules.Add(moduleInfo);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to analyze module: {ModuleFile}", moduleFile);
            }
        }
        
        return modules;
    }
    
    private async Task<ModuleInfo> AnalyzeModuleAsync(string modulePath)
    {
        // PowerShell script to analyze module metadata
        var analysisScript = @"
            param($ModulePath)
            
            try {
                Import-Module $ModulePath -Force
                $module = Get-Module (Split-Path $ModulePath -LeafBase)
                
                return @{
                    Name = $module.Name
                    Version = $module.Version.ToString()
                    Description = $module.Description
                    Author = $module.Author
                    CompanyName = $module.CompanyName
                    ExportedFunctions = @($module.ExportedFunctions.Keys)
                    ExportedClasses = @($module.ExportedClasses.Keys)
                    RequiredModules = @($module.RequiredModules | ForEach-Object { $_.Name })
                    PowerShellVersion = $module.PowerShellVersion.ToString()
                    Path = $ModulePath
                }
            }
            catch {
                throw ""Failed to analyze module: $($_.Exception.Message)""
            }
        ";
        
        using var powerShell = PowerShell.Create();
        powerShell.AddScript(analysisScript);
        powerShell.AddParameter("ModulePath", modulePath);
        
        var results = await Task.Run(() => powerShell.Invoke());
        
        if (powerShell.Streams.Error.Any())
        {
            throw new Exception($"Module analysis failed: {powerShell.Streams.Error.First()}");
        }
        
        var moduleData = results.First().BaseObject as Hashtable;
        return new ModuleInfo
        {
            Name = moduleData["Name"].ToString(),
            Version = moduleData["Version"].ToString(),
            Description = moduleData["Description"]?.ToString(),
            Author = moduleData["Author"]?.ToString(),
            Path = modulePath,
            ExportedFunctions = ((object[])moduleData["ExportedFunctions"]).Cast<string>().ToList(),
            ExportedClasses = ((object[])moduleData["ExportedClasses"]).Cast<string>().ToList()
        };
    }
}
```

---

## SECURITY AND AUTHENTICATION

### Credential Management

#### Secure Credential Storage
```csharp
public interface ICredentialManager
{
    Task StoreCredentialAsync(string key, PSCredential credential);
    Task<PSCredential> RetrieveCredentialAsync(string key);
    Task DeleteCredentialAsync(string key);
    Task<bool> CredentialExistsAsync(string key);
}

public class CredentialManager : ICredentialManager
{
    private readonly string _credentialStorePath;
    private readonly IDataProtectionProvider _dataProtection;
    
    public async Task StoreCredentialAsync(string key, PSCredential credential)
    {
        var credentialData = new CredentialData
        {
            Username = credential.UserName,
            Password = credential.Password.ConvertToUnsecureString(),
            Domain = ExtractDomain(credential.UserName),
            CreatedDate = DateTime.UtcNow
        };
        
        var json = JsonSerializer.Serialize(credentialData);
        var protectedJson = _dataProtection.CreateProtector("Credentials").Protect(json);
        
        var filePath = Path.Combine(_credentialStorePath, $"{key}.cred");
        await File.WriteAllTextAsync(filePath, protectedJson);
    }
    
    public async Task<PSCredential> RetrieveCredentialAsync(string key)
    {
        var filePath = Path.Combine(_credentialStorePath, $"{key}.cred");
        if (!File.Exists(filePath))
            return null;
            
        var protectedJson = await File.ReadAllTextAsync(filePath);
        var json = _dataProtection.CreateProtector("Credentials").Unprotect(protectedJson);
        var credentialData = JsonSerializer.Deserialize<CredentialData>(json);
        
        var securePassword = credentialData.Password.ConvertToSecureString();
        return new PSCredential(credentialData.Username, securePassword);
    }
}
```

#### Authentication Integration
```powershell
class AuthenticationManager {
    [hashtable]$AuthenticationCache = @{}
    [string]$KeyVaultName
    
    AuthenticationManager([string]$keyVaultName) {
        $this.KeyVaultName = $keyVaultName
    }
    
    [pscredential] GetCredential([string]$key) {
        # Check cache first
        if ($this.AuthenticationCache.ContainsKey($key)) {
            return $this.AuthenticationCache[$key]
        }
        
        # Retrieve from secure storage
        try {
            if ($this.KeyVaultName) {
                # Azure Key Vault integration
                $secret = Get-AzKeyVaultSecret -VaultName $this.KeyVaultName -Name $key
                $credential = [pscredential]::new($secret.Name, $secret.SecretValue)
            }
            else {
                # Windows Credential Manager
                $credential = Get-StoredCredential -Target $key
            }
            
            # Cache for session
            $this.AuthenticationCache[$key] = $credential
            return $credential
        }
        catch {
            throw "Failed to retrieve credential for key: $key. Error: $($_.Exception.Message)"
        }
    }
    
    [void] StoreCredential([string]$key, [pscredential]$credential) {
        try {
            if ($this.KeyVaultName) {
                # Store in Azure Key Vault
                $secretValue = ConvertTo-SecureString $credential.GetNetworkCredential().Password -AsPlainText -Force
                Set-AzKeyVaultSecret -VaultName $this.KeyVaultName -Name $key -SecretValue $secretValue
            }
            else {
                # Store in Windows Credential Manager
                New-StoredCredential -Target $key -UserName $credential.UserName -Password $credential.Password
            }
            
            # Update cache
            $this.AuthenticationCache[$key] = $credential
        }
        catch {
            throw "Failed to store credential for key: $key. Error: $($_.Exception.Message)"
        }
    }
}
```

### Audit and Compliance

#### Audit Logging Service
```csharp
public class AuditLoggingService
{
    private readonly ILogger<AuditLoggingService> _logger;
    private readonly string _auditLogPath;
    
    public async Task LogMigrationEventAsync(MigrationAuditEvent auditEvent)
    {
        var auditEntry = new AuditLogEntry
        {
            EventId = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            EventType = auditEvent.EventType,
            UserId = auditEvent.UserId,
            MigrationId = auditEvent.MigrationId,
            Details = auditEvent.Details,
            SourceIP = auditEvent.SourceIP,
            UserAgent = auditEvent.UserAgent,
            Success = auditEvent.Success,
            ErrorMessage = auditEvent.ErrorMessage
        };
        
        // Log to structured logging system
        _logger.LogInformation("Migration audit event: {@AuditEntry}", auditEntry);
        
        // Write to dedicated audit log file
        var auditJson = JsonSerializer.Serialize(auditEntry, new JsonSerializerOptions
        {
            WriteIndented = true
        });
        
        var auditFilePath = Path.Combine(_auditLogPath, 
            $"migration_audit_{DateTime.UtcNow:yyyyMMdd}.log");
            
        await File.AppendAllTextAsync(auditFilePath, auditJson + Environment.NewLine);
        
        // Send to SIEM/audit system if configured
        await SendToAuditSystemAsync(auditEntry);
    }
}
```

---

## ERROR HANDLING AND DIAGNOSTICS

### Comprehensive Error Handling

#### Error Classification and Recovery
```csharp
public enum ErrorCategory
{
    Transient,      // Temporary network issues, resource contention
    Configuration,  // Invalid settings, missing credentials
    Permission,     // Access denied, insufficient privileges  
    Data,          // Corrupt data, invalid formats
    System,        // System failures, resource exhaustion
    Business       // Business rule violations
}

public class ErrorHandler
{
    private readonly ILogger<ErrorHandler> _logger;
    private readonly Dictionary<ErrorCategory, IErrorRecoveryStrategy> _recoveryStrategies;
    
    public async Task<ErrorHandlingResult> HandleErrorAsync(Exception exception, MigrationContext context)
    {
        var errorCategory = ClassifyError(exception);
        var errorDetails = new ErrorDetails
        {
            Exception = exception,
            Category = errorCategory,
            Context = context,
            Timestamp = DateTime.UtcNow,
            AttemptNumber = context.RetryAttempt
        };
        
        _logger.LogError(exception, "Migration error occurred: Category={Category}, Context={@Context}", 
            errorCategory, context);
        
        // Apply recovery strategy
        if (_recoveryStrategies.TryGetValue(errorCategory, out var strategy))
        {
            return await strategy.HandleErrorAsync(errorDetails);
        }
        
        // Default handling
        return new ErrorHandlingResult
        {
            ShouldRetry = errorCategory == ErrorCategory.Transient && context.RetryAttempt < 3,
            DelayBeforeRetry = TimeSpan.FromMinutes(Math.Pow(2, context.RetryAttempt)), // Exponential backoff
            ShouldTerminate = errorCategory == ErrorCategory.Configuration,
            ErrorMessage = exception.Message
        };
    }
    
    private ErrorCategory ClassifyError(Exception exception)
    {
        return exception switch
        {
            UnauthorizedAccessException => ErrorCategory.Permission,
            DirectoryServiceException => ErrorCategory.Permission,
            TimeoutException => ErrorCategory.Transient,
            HttpRequestException => ErrorCategory.Transient,
            ArgumentException => ErrorCategory.Configuration,
            InvalidOperationException => ErrorCategory.Configuration,
            DirectoryNotFoundException => ErrorCategory.Configuration,
            FormatException => ErrorCategory.Data,
            CorruptDataException => ErrorCategory.Data,
            OutOfMemoryException => ErrorCategory.System,
            _ => ErrorCategory.System
        };
    }
}
```

#### PowerShell Error Handling
```powershell
class ErrorHandler {
    [hashtable]$ErrorCategories = @{
        Transient = @("OperationTimeout", "NetworkError", "TemporaryFailure")
        Configuration = @("InvalidArgument", "MissingParameter", "InvalidConfiguration")  
        Permission = @("UnauthorizedAccess", "InsufficientPrivileges")
        Data = @("InvalidData", "CorruptData", "DataFormatError")
        System = @("SystemError", "ResourceUnavailable")
    }
    
    [object] HandleError([System.Management.Automation.ErrorRecord]$error, [hashtable]$context) {
        $errorCategory = $this.ClassifyError($error)
        $errorDetails = @{
            Exception = $error.Exception
            Category = $errorCategory
            Context = $context
            Timestamp = Get-Date
            AttemptNumber = $context.RetryAttempt
        }
        
        # Log error details
        $this.LogError($errorDetails)
        
        # Determine recovery strategy
        $recoveryStrategy = $this.GetRecoveryStrategy($errorCategory, $context)
        
        return $recoveryStrategy
    }
    
    [string] ClassifyError([System.Management.Automation.ErrorRecord]$error) {
        $errorType = $error.Exception.GetType().Name
        $errorMessage = $error.Exception.Message
        
        foreach ($category in $this.ErrorCategories.Keys) {
            foreach ($pattern in $this.ErrorCategories[$category]) {
                if ($errorType -like "*$pattern*" -or $errorMessage -like "*$pattern*") {
                    return $category
                }
            }
        }
        
        return "System"  # Default category
    }
    
    [hashtable] GetRecoveryStrategy([string]$category, [hashtable]$context) {
        switch ($category) {
            "Transient" {
                return @{
                    ShouldRetry = $context.RetryAttempt -lt 3
                    DelaySeconds = [Math]::Pow(2, $context.RetryAttempt) * 60  # Exponential backoff
                    ShouldTerminate = $false
                }
            }
            "Configuration" {
                return @{
                    ShouldRetry = $false
                    ShouldTerminate = $true
                    RequiresUserIntervention = $true
                }
            }
            "Permission" {
                return @{
                    ShouldRetry = $false
                    ShouldTerminate = $true
                    RequiresUserIntervention = $true
                    RecommendedAction = "Verify credentials and permissions"
                }
            }
            default {
                return @{
                    ShouldRetry = $context.RetryAttempt -lt 2
                    DelaySeconds = 30
                    ShouldTerminate = $false
                }
            }
        }
    }
}
```

### Diagnostic Tools

#### System Diagnostics Service
```csharp
public class SystemDiagnosticsService
{
    public async Task<DiagnosticsReport> GenerateReportAsync()
    {
        var report = new DiagnosticsReport
        {
            Timestamp = DateTime.UtcNow,
            SystemInfo = await GatherSystemInfoAsync(),
            PowerShellInfo = await GatherPowerShellInfoAsync(),
            ModuleInfo = await GatherModuleInfoAsync(),
            ConfigurationInfo = await GatherConfigurationInfoAsync(),
            PerformanceMetrics = await GatherPerformanceMetricsAsync(),
            HealthChecks = await RunHealthChecksAsync()
        };
        
        return report;
    }
    
    private async Task<SystemInfo> GatherSystemInfoAsync()
    {
        return new SystemInfo
        {
            OSVersion = Environment.OSVersion.ToString(),
            MachineName = Environment.MachineName,
            UserName = Environment.UserName,
            ProcessorCount = Environment.ProcessorCount,
            TotalMemoryMB = GC.GetTotalMemory(false) / 1024 / 1024,
            DotNetVersion = Environment.Version.ToString(),
            CurrentDirectory = Environment.CurrentDirectory
        };
    }
    
    private async Task<PowerShellInfo> GatherPowerShellInfoAsync()
    {
        using var powerShell = PowerShell.Create();
        powerShell.AddScript(@"
            @{
                Version = $PSVersionTable.PSVersion.ToString()
                Edition = $PSVersionTable.PSEdition
                BuildVersion = $PSVersionTable.BuildVersion.ToString()
                ExecutionPolicy = Get-ExecutionPolicy
                Modules = @(Get-Module -ListAvailable | Where-Object { $_.Name -like '*Migration*' } | 
                           Select-Object Name, Version, Path)
            }
        ");
        
        var results = await Task.Run(() => powerShell.Invoke());
        var psInfo = results.First().BaseObject as Hashtable;
        
        return new PowerShellInfo
        {
            Version = psInfo["Version"].ToString(),
            Edition = psInfo["Edition"].ToString(),
            ExecutionPolicy = psInfo["ExecutionPolicy"].ToString(),
            AvailableModules = ExtractModuleInfo((object[])psInfo["Modules"])
        };
    }
}
```

This comprehensive API and integration guide provides complete technical documentation for developers and system integrators working with the M&A Migration Platform. The documentation covers all integration patterns, API endpoints, custom module development, security considerations, and diagnostic tools needed for successful enterprise integration.

---

*API Documentation Version*: 1.0 Production Ready  
*Last Updated*: 2025-08-22  
*Platform Version*: M&A Migration Platform v1.0

For additional technical support and advanced integration scenarios, please refer to the comprehensive troubleshooting guide or contact the development team.