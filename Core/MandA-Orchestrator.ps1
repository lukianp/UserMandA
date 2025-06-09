# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk (Enhanced by M&A Team)
# Version: 7.0.0
# Created: 2025-06-05
# Last Modified: 2025-06-10
# Change Log: Complete rewrite with enhanced runspace management, thread-safe operations, and comprehensive error handling

<#
.SYNOPSIS
    M&A Discovery Suite - Enhanced Core Orchestration Engine v7.0.0
.DESCRIPTION
    Core orchestrator that manages discovery, processing, and export phases with:
    - Enterprise-grade runspace pool management
    - Thread-safe authentication and result collection
    - Comprehensive error recovery and health monitoring
    - Memory leak prevention for PowerShell 5.1
    - Structured logging with correlation IDs
.NOTES
    Version: 7.0.0
    Created: 2025-06-10
    
    Key Enhancements:
    - Proper InitialSessionState configuration with pre-loaded modules
    - Thread-safe concurrent collections for results
    - Health monitoring with stuck job detection
    - Automatic retry and recovery mechanisms
    - Memory-efficient disposal patterns
    - UTF-8 BOM encoding compliance
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$CompanyName,

    [Parameter(Mandatory=$false)]
    [string]$ConfigurationFile,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("Discovery", "Processing", "Export", "Full", "AzureOnly")]
    [string]$Mode = "Full",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force,
    
    [Parameter(Mandatory=$false)]
    [switch]$ValidateOnly,
    
    [Parameter(Mandatory=$false)]
    [int]$ParallelThrottle = 5,
    
    [Parameter(Mandatory=$false)]
    [switch]$DebugMode
)

#===============================================================================
#                       CRITICAL CLASS DEFINITIONS
#===============================================================================

# Define DiscoveryResult class in global scope immediately
if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
    Add-Type -TypeDefinition @'
public class DiscoveryResult {
    public bool Success { get; set; }
    public string ModuleName { get; set; }
    public object Data { get; set; }
    public System.Collections.ArrayList Errors { get; set; }
    public System.Collections.ArrayList Warnings { get; set; }
    public System.Collections.Hashtable Metadata { get; set; }
    public System.DateTime StartTime { get; set; }
    public System.DateTime EndTime { get; set; }
    public string ExecutionId { get; set; }
    
    public DiscoveryResult(string moduleName) {
        this.ModuleName = moduleName;
        this.Errors = new System.Collections.ArrayList();
        this.Warnings = new System.Collections.ArrayList();
        this.Metadata = new System.Collections.Hashtable();
        this.StartTime = System.DateTime.Now;
        this.ExecutionId = System.Guid.NewGuid().ToString();
        this.Success = true;
    }
    
    public void AddError(string message, System.Exception exception) {
        AddError(message, exception, new System.Collections.Hashtable());
    }
    
    public void AddError(string message, System.Exception exception, System.Collections.Hashtable context) {
        var errorEntry = new System.Collections.Hashtable();
        errorEntry["Timestamp"] = System.DateTime.Now;
        errorEntry["Message"] = message;
        
        // Safely handle exception properties
        if (exception != null) {
            errorEntry["Exception"] = exception.ToString();
            errorEntry["ExceptionType"] = exception.GetType().FullName;
            errorEntry["StackTrace"] = exception.StackTrace;
        } else {
            errorEntry["Exception"] = null;
            errorEntry["ExceptionType"] = null;
            errorEntry["StackTrace"] = System.Environment.StackTrace;
        }
        
        errorEntry["Context"] = context ?? new System.Collections.Hashtable();
        this.Errors.Add(errorEntry);
        this.Success = false;
    }
    
    public void AddWarning(string message) {
        AddWarning(message, new System.Collections.Hashtable());
    }
    
    public void AddWarning(string message, System.Collections.Hashtable context) {
        var warningEntry = new System.Collections.Hashtable();
        warningEntry["Timestamp"] = System.DateTime.Now;
        warningEntry["Message"] = message;
        warningEntry["Context"] = context;
        this.Warnings.Add(warningEntry);
    }
    
    public void Complete() {
        this.EndTime = System.DateTime.Now;
        if (this.StartTime != null && this.EndTime != null) {
            var duration = this.EndTime - this.StartTime;
            this.Metadata["Duration"] = duration;
            this.Metadata["DurationSeconds"] = duration.TotalSeconds;
        }
    }
}
'@ -Language CSharp
    Write-Host "[ORCHESTRATOR] DiscoveryResult class defined globally" -ForegroundColor Green
}

#===============================================================================
#                       INITIALIZATION
#===============================================================================

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
function Get-ModuleContext {
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return $script:ModuleContext
}

# Verify global context exists
Write-Host "[ORCHESTRATOR] Starting enhanced orchestrator v7.0.0..." -ForegroundColor Cyan
Write-Host "[ORCHESTRATOR] PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Gray
Write-Host "[ORCHESTRATOR] Parameters: CompanyName='$CompanyName', Mode='$Mode', Force=$Force" -ForegroundColor Gray

if (-not $global:MandA -or -not $global:MandA.Initialized) {
    Write-Host "[ORCHESTRATOR ERROR] Global MandA context not initialized!" -ForegroundColor Red
    throw "Global M&A context not initialized. Run through QuickStart.ps1"
}

Write-Host "[ORCHESTRATOR] Global context validated successfully" -ForegroundColor Green

# Set error handling
$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# Script variables
$script:StartTime = Get-Date
$script:DebugMode = $DebugMode -or $VerbosePreference -eq 'Continue'
$script:CorrelationId = [guid]::NewGuid().ToString()
$script:ErrorCollector = @{
    Errors = [System.Collections.ArrayList]::new()
    Warnings = [System.Collections.ArrayList]::new()
    Critical = [System.Collections.ArrayList]::new()
}
$script:AzureOnlySources = @(
    "Azure", "Graph", "Intune", "Licensing", 
    "ExternalIdentity", "SharePoint", "Teams", "Exchange"
)

# Performance tracking
$script:PerformanceMetrics = @{
    PhaseTimings = @{}
    ModuleTimings = @{}
    MemorySnapshots = [System.Collections.ArrayList]::new()
    RunspaceHealth = [System.Collections.ArrayList]::new()
}

#===============================================================================
#                       HELPER FUNCTIONS
#===============================================================================

function Write-OrchestratorLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Component = "Orchestrator",
        [switch]$DebugOnly,
        [string]$CorrelationId = ""  # Add this parameter
    )
    
    # Skip debug-only messages if not in debug mode
    if ($DebugOnly -and -not $script:DebugMode) { return }
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        # Pass CorrelationId if the underlying function supports it
        $params = @{
            Message = $Message
            Level = $Level
            Component = $Component
        }
        if ($CorrelationId) {
            $params['CorrelationId'] = $CorrelationId
        }
        Write-MandALog @params
    } else {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "DEBUG" { "Gray" }
            "HEADER" { "Cyan" }
            "CRITICAL" { "Magenta" }
            default { "White" }
        }
        
        # Add visual indicators
        $indicator = switch ($Level) {
            "ERROR" { "[!!]" }
            "WARN" { "[??]" }
            "SUCCESS" { "[OK]" }
            "DEBUG" { "[>>]" }
            "HEADER" { "[==]" }
            "CRITICAL" { "[XX]" }
            default { "[--]" }
        }
        
        Write-Host "$timestamp $indicator [$Level] [$Component] $Message" -ForegroundColor $color
    }
}

function Add-OrchestratorError {
    param(
        [string]$Source,
        [string]$Message,
        [System.Exception]$Exception,
        [string]$Severity = "Error",
        [hashtable]$Context
    )
    
    $errorEntry = @{
        Timestamp = Get-Date
        Source = $Source
        Message = $Message
        Exception = if ($Exception) { $Exception.ToString() } else { $null }
        ExceptionType = if ($Exception) { $Exception.GetType().FullName } else { $null }
        Severity = $Severity
        Context = $Context
        StackTrace = if ($Exception) { $Exception.StackTrace } else { $null }
        CorrelationId = $script:CorrelationId
    }
    
    switch ($Severity) {
        "Critical" { $null = $script:ErrorCollector.Critical.Add($errorEntry) }
        "Warning" { $null = $script:ErrorCollector.Warnings.Add($errorEntry) }
        default { $null = $script:ErrorCollector.Errors.Add($errorEntry) }
    }
    
    $logLevel = switch ($Severity.ToUpper()) {
        "WARNING" { "WARN" }
        "CRITICAL" { "CRITICAL" }
        "ERROR" { "ERROR" }
        default { "ERROR" }
    }
    
    Write-OrchestratorLog -Message "[$Source] $Message" -Level $logLevel
    
    if ($script:DebugMode -and $Exception) {
        Write-OrchestratorLog -Message "Exception Type: $($Exception.GetType().FullName)" -Level "DEBUG"
        Write-OrchestratorLog -Message "Stack Trace: $($Exception.StackTrace)" -Level "DEBUG"
    }
}

function Get-MemorySnapshot {
    $process = Get-Process -Id $PID
    return @{
        Timestamp = Get-Date
        WorkingSetMB = [Math]::Round($process.WorkingSet64 / 1MB, 2)
        PrivateMemoryMB = [Math]::Round($process.PrivateMemorySize64 / 1MB, 2)
        VirtualMemoryMB = [Math]::Round($process.VirtualMemorySize64 / 1MB, 2)
        HandleCount = $process.HandleCount
        ThreadCount = $process.Threads.Count
    }
}

function Test-ModuleCompletionStatus {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )
    
    $result = @{
        ShouldRun = $true
        Reason = "Module not yet executed"
        CompletionStatus = "NotStarted"
        DataFiles = @()
        RecordCount = 0
    }
    
    try {
        $moduleFileMapping = @{
            "ActiveDirectory" = @("ADUsers.csv", "ADGroups.csv", "ADGroupMembers.csv", "ADComputers.csv")
            "Graph" = @("GraphUsers.csv", "GraphGroups.csv")
            "Azure" = @("AzureSubscriptions.csv", "AzureResourceGroups.csv", "AzureVirtualMachines.csv")
            "Intune" = @("IntuneManagedDevices.csv", "IntuneDeviceConfigurations.csv")
            "Exchange" = @("ExchangeMailboxes.csv", "ExchangeDistributionGroups.csv")
            "SharePoint" = @("SharePointSites.csv", "SharePointLists.csv")
            "Teams" = @("TeamsTeams.csv", "TeamsChannels.csv")
            "GPO" = @("GPODriveMappings.csv", "GPOFolderRedirections.csv")
            "FileServer" = @("FileShares.csv", "FilePermissions.csv")
            "Licensing" = @("LicenseAssignments.csv", "LicenseUsage.csv")
        }
        
        $expectedFiles = $moduleFileMapping[$ModuleName]
        if (-not $expectedFiles) {
            Write-OrchestratorLog -Message "No file mapping for module: $ModuleName" -Level "WARN"
            return $result
        }
        
        $rawDataPath = $Context.Paths.RawDataOutput
        $existingFiles = @()
        $totalRecords = 0
        $validFiles = 0
        
        foreach ($fileName in $expectedFiles) {
            $filePath = Join-Path $rawDataPath $fileName
            
            if (Test-Path $filePath) {
                $fileInfo = Get-Item $filePath
                $existingFiles += $fileName
                
                if ($fileInfo.Length -gt 100) {
                    try {
                        $csvContent = Import-Csv $filePath -ErrorAction Stop
                        $recordCount = $csvContent.Count
                        $totalRecords += $recordCount
                        
                        if ($recordCount -gt 0) {
                            $validFiles++
                        }
                    } catch {
                        Write-OrchestratorLog -Message "Invalid CSV: $fileName" -Level "DEBUG" -DebugOnly
                    }
                }
            }
        }
        
        $result.DataFiles = $existingFiles
        $result.RecordCount = $totalRecords
        
        $completionPercentage = if ($expectedFiles.Count -gt 0) {
            ($validFiles / $expectedFiles.Count) * 100
        } else { 0 }
        
        if ($validFiles -eq $expectedFiles.Count -and $totalRecords -gt 0) {
            $result.CompletionStatus = "Complete"
            $result.ShouldRun = $false
            $result.Reason = "Module completed with $totalRecords records"
        } elseif ($validFiles -gt 0 -and $completionPercentage -ge 50) {
            $result.CompletionStatus = "Partial"
            $result.ShouldRun = $true
            $result.Reason = "Module partially complete - will re-run"
        } else {
            $result.CompletionStatus = "NotStarted"
            $result.ShouldRun = $true
            $result.Reason = "No valid data found - will run"
        }
        
    } catch {
        Write-OrchestratorLog -Message "Error checking module status: $_" -Level "WARN"
        $result.ShouldRun = $true
        $result.Reason = "Error checking status - will run"
    }
    
    return $result
}

function Test-OrchestratorPrerequisites {
    Write-OrchestratorLog -Message "Validating orchestrator prerequisites..." -Level "INFO"
    
    $prereqMet = $true
    
    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -lt 5 -or
        ($PSVersionTable.PSVersion.Major -eq 5 -and $PSVersionTable.PSVersion.Minor -lt 1)) {
        Add-OrchestratorError -Source "Prerequisites" `
            -Message "PowerShell 5.1 or higher required. Current: $($PSVersionTable.PSVersion)" `
            -Severity "Critical"
        $prereqMet = $false
    }
    
    # Check critical paths
    $criticalPaths = @("SuiteRoot", "Modules", "Core", "Configuration", "RawDataOutput", "ProcessedDataOutput")
    foreach ($pathKey in $criticalPaths) {
        if (-not $global:MandA.Paths.ContainsKey($pathKey)) {
            Add-OrchestratorError -Source "Prerequisites" `
                -Message "Critical path '$pathKey' not defined" `
                -Severity "Critical"
            $prereqMet = $false
        } elseif (-not (Test-Path $global:MandA.Paths[$pathKey])) {
            # Create output directories if they don't exist
            if ($pathKey -in @("RawDataOutput", "ProcessedDataOutput", "ExportOutput", "LogOutput")) {
                try {
                    New-Item -Path $global:MandA.Paths[$pathKey] -ItemType Directory -Force | Out-Null
                    Write-OrchestratorLog -Message "Created directory: $($global:MandA.Paths[$pathKey])" -Level "INFO"
                } catch {
                    Add-OrchestratorError -Source "Prerequisites" `
                        -Message "Failed to create directory: $($global:MandA.Paths[$pathKey])" `
                        -Exception $_.Exception `
                        -Severity "Critical"
                    $prereqMet = $false
                }
            } else {
                Add-OrchestratorError -Source "Prerequisites" `
                    -Message "Critical path does not exist: $($global:MandA.Paths[$pathKey])" `
                    -Severity "Critical"
                $prereqMet = $false
            }
        }
    }
    
    # Validate DiscoveryResult class
    if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        Add-OrchestratorError -Source "Prerequisites" `
            -Message "DiscoveryResult class not available" `
            -Severity "Critical"
        $prereqMet = $false
    }
    
    return $prereqMet
function Test-DiscoveryPrerequisites {
    Write-OrchestratorLog -Message "Validating discovery prerequisites..." -Level "INFO"
    
    $issues = @()
    
    # Check Exchange Online module
    if ($global:MandA.Config.discovery.enabledSources -contains "Exchange" -or
        $global:MandA.Config.discovery.enabledSources -contains "ExternalIdentity") {
        if (-not (Get-Module -Name ExchangeOnlineManagement -ListAvailable)) {
            $issues += "ExchangeOnlineManagement module not installed"
        }
    }
    
    # Check SharePoint configuration
    if ($global:MandA.Config.discovery.enabledSources -contains "SharePoint") {
        if (-not $global:MandA.Config.discovery.sharepoint -or
            -not $global:MandA.Config.discovery.sharepoint.tenantName) {
            $issues += "SharePoint tenant name not configured in discovery.sharepoint.tenantName"
        }
    }
    
    # Check Azure modules
    if ($global:MandA.Config.discovery.enabledSources -contains "Azure") {
        if (-not (Get-Module -Name Az.Accounts -ListAvailable)) {
            $issues += "Az.Accounts module not installed"
        }
    }
    
    if ($issues.Count -gt 0) {
        Write-OrchestratorLog -Message "Prerequisites validation found issues:" -Level "WARN"
        $issues | ForEach-Object { Write-OrchestratorLog -Message "  - $_" -Level "WARN" }
        
        # Don't fail, but log the issues
        return $true
    }
    
    return $true
}

function Test-ExchangeOnlineAvailable {
    $exoModule = Get-Module -Name ExchangeOnlineManagement -ListAvailable
    if (-not $exoModule) {
        Write-OrchestratorLog -Message "ExchangeOnlineManagement module not installed" -Level "WARN"
        return $false
    }
    
    # Check if we can import it
    try {
        Import-Module ExchangeOnlineManagement -ErrorAction Stop
        return $true
    } catch {
        Write-OrchestratorLog -Message "Failed to import ExchangeOnlineManagement: $_" -Level "WARN"
        return $false
    }
}
}

function Initialize-OrchestratorModules {
    param([string]$Phase)
    
    Write-OrchestratorLog -Message "Loading modules for phase: $Phase" -Level "INFO"
    
    # Verify DiscoveryResult class is available
    if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        throw "DiscoveryResult class not available. Critical initialization failure."
    }
    
    # Load in dependency order
    $loadOrder = @(
        @{Name="EnhancedLogging"; Path="Utilities\EnhancedLogging.psm1"}
        @{Name="ErrorHandling"; Path="Utilities\ErrorHandling.psm1"}
        @{Name="ValidationHelpers"; Path="Utilities\ValidationHelpers.psm1"}
        @{Name="CredentialManagement"; Path="Authentication\CredentialManagement.psm1"}
        @{Name="Authentication"; Path="Authentication\Authentication.psm1"}
        @{Name="PerformanceMetrics"; Path="Utilities\PerformanceMetrics.psm1"}
        @{Name="FileOperations"; Path="Utilities\FileOperations.psm1"}
        @{Name="ProgressDisplay"; Path="Utilities\ProgressDisplay.psm1"}
    )
    
    $totalLoaded = 0
    $totalFailed = @()
    
    foreach ($module in $loadOrder) {
        $modulePath = Join-Path $global:MandA.Paths.Modules $module.Path
        
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global -ErrorAction Stop
                $totalLoaded++
                Write-OrchestratorLog -Message "Loaded module: $($module.Name)" -Level "SUCCESS"
                
                # Initialize logging if just loaded
                if ($module.Name -eq "EnhancedLogging" -and (Get-Command "Initialize-Logging" -ErrorAction SilentlyContinue)) {
                    Initialize-Logging -Context $global:MandA
                }
            } catch {
                $totalFailed += $module.Name
                Add-OrchestratorError -Source "ModuleLoader" `
                    -Message "Failed to load module $($module.Name)" `
                    -Exception $_.Exception `
                    -Severity "Critical"
            }
        } else {
            $totalFailed += $module.Name
            Write-OrchestratorLog -Message "Module not found: $modulePath" -Level "ERROR"
        }
    }
    
    # Load connectivity modules
    $connectivityPath = Join-Path $global:MandA.Paths.Connectivity "EnhancedConnectionManager.psm1"
    if (Test-Path $connectivityPath) {
        try {
            Import-Module $connectivityPath -Force -Global
            Write-OrchestratorLog -Message "Loaded connectivity module: EnhancedConnectionManager" -Level "SUCCESS"
        } catch {
            Add-OrchestratorError -Source "ModuleLoader" `
                -Message "Failed to load connectivity module" `
                -Exception $_.Exception
        }
    } else {
        Write-OrchestratorLog -Message "Connectivity module not found at: $connectivityPath" -Level "WARN"
        Add-OrchestratorError -Source "ModuleLoader" `
            -Message "Failed to load connectivity module" `
            -Exception (New-Object System.IO.FileNotFoundException("Connectivity module not found at: $connectivityPath"))
    }
    
    # Load phase-specific modules
    switch ($Phase) {
        { $_ -in "Discovery", "Full", "AzureOnly" } {
            Load-AuthenticationModules
            Load-DiscoveryModules
        }
        { $_ -in "Processing", "Full", "AzureOnly" } {
            Load-ProcessingModules
        }
        { $_ -in "Export", "Full", "AzureOnly" } {
            Load-ExportModules
        }
    }
    
    Write-OrchestratorLog -Message "Module loading complete: $totalLoaded loaded, $($totalFailed.Count) failed" -Level "INFO"
}

function Load-AuthenticationModules {
    Write-OrchestratorLog -Message "Loading authentication modules..." -Level "INFO"
    
    $authModules = @("Authentication", "CredentialManagement")
    $loadedCount = 0
    
    foreach ($module in $authModules) {
        $modulePath = Join-Path $global:MandA.Paths.Authentication "$module.psm1"
        
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global -ErrorAction Stop
                $loadedCount++
                Write-OrchestratorLog -Message "Loaded auth module: $module" -Level "SUCCESS"
            } catch {
                Add-OrchestratorError -Source "ModuleLoader" `
                    -Message "Failed to load auth module $module" `
                    -Exception $_.Exception `
                    -Severity "Critical"
            }
        }
    }
    
    if ($loadedCount -eq 0) {
        throw "No authentication modules loaded. Cannot continue."
    }
}

function Load-DiscoveryModules {
    Write-OrchestratorLog -Message "Loading discovery modules..." -Level "INFO"
    
    $enabledSources = $global:MandA.Config.discovery.enabledSources
    if ($null -eq $enabledSources) {
        $enabledSources = @()
    } elseif ($enabledSources -isnot [array]) {
        $enabledSources = @($enabledSources)
    }
    
    Write-OrchestratorLog -Message "Enabled sources: $($enabledSources -join ', ')" -Level "INFO"
    
    $loadedCount = 0
    foreach ($source in $enabledSources) {
        if ($source -isnot [string]) { continue }
        
        $modulePath = Join-Path $global:MandA.Paths.Discovery "${source}Discovery.psm1"
        
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global -ErrorAction Stop
                $loadedCount++
                Write-OrchestratorLog -Message "Loaded discovery module: $source" -Level "DEBUG"
            } catch {
                Add-OrchestratorError -Source "ModuleLoader" `
                    -Message "Failed to load discovery module $source" `
                    -Exception $_.Exception `
                    -Severity "Warning"
            }
        }
    }
    
    Write-OrchestratorLog -Message "Discovery modules loaded: $loadedCount/$($enabledSources.Count)" -Level "INFO"
}

function Load-ProcessingModules {
    Write-OrchestratorLog -Message "Loading processing modules..." -Level "INFO"
    
    $processingModules = @("DataAggregation", "UserProfileBuilder", "WaveGeneration", "DataValidation")
    $loadedCount = 0
    
    foreach ($module in $processingModules) {
        $modulePath = Join-Path $global:MandA.Paths.Processing "$module.psm1"
        
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global
                $loadedCount++
                Write-OrchestratorLog -Message "Loaded processing module: $module" -Level "DEBUG"
            } catch {
                Add-OrchestratorError -Source "ModuleLoader" `
                    -Message "Failed to load processing module $module" `
                    -Exception $_.Exception
            }
        }
    }
    
    Write-OrchestratorLog -Message "Processing modules loaded: $loadedCount/$($processingModules.Count)" -Level "INFO"
}

function Load-ExportModules {
    Write-OrchestratorLog -Message "Loading export modules..." -Level "INFO"
    
    $enabledFormats = $global:MandA.Config.export.formats
    if ($enabledFormats -isnot [array]) {
        $enabledFormats = @($enabledFormats)
    }
    
    $formatMapping = @{
        "CSV" = "CSVExport"
        "JSON" = "JSONExport"
        "Excel" = "ExcelExport"
        "CompanyControlSheet" = "CompanyControlSheetExporter"
    }
    
    $loadedCount = 0
    foreach ($format in $enabledFormats) {
        if ($formatMapping.ContainsKey($format)) {
            $moduleName = $formatMapping[$format]
            $modulePath = Join-Path $global:MandA.Paths.Export "$moduleName.psm1"
            
            if (Test-Path $modulePath) {
                try {
                    Import-Module $modulePath -Force -Global
                    $loadedCount++
                    Write-OrchestratorLog -Message "Loaded export module: $moduleName" -Level "DEBUG"
                } catch {
                    Add-OrchestratorError -Source "ModuleLoader" `
                        -Message "Failed to load export module $moduleName" `
                        -Exception $_.Exception
                }
            }
        }
    }
    
    Write-OrchestratorLog -Message "Export modules loaded: $loadedCount/$($enabledFormats.Count)" -Level "INFO"
}

#===============================================================================
#                       PHASE EXECUTION FUNCTIONS
#===============================================================================

function Invoke-DiscoveryPhase {
    [CmdletBinding()]
    param()

    Write-OrchestratorLog -Message "STARTING DISCOVERY PHASE (Enhanced Parallel Engine v7.0)" -Level "HEADER"
    $phaseStartTime = Get-Date
    
    # Take initial memory snapshot
    $null = $script:PerformanceMetrics.MemorySnapshots.Add((Get-MemorySnapshot))
    
    # Run discovery prerequisites check
    Test-DiscoveryPrerequisites
    
    # Initialize authentication
    try {
        Write-OrchestratorLog -Message "Initializing authentication..." -Level "INFO"
        $authResult = Initialize-MandAAuthentication -Configuration $global:MandA.Config
        if (-not $authResult.Authenticated) {
            throw "Authentication failed: $($authResult.Error)"
        }
        
        $authContext = Get-AuthenticationContext
        $connections = Initialize-AllConnections -Configuration $global:MandA.Config -AuthContext $authContext
        Write-OrchestratorLog -Message "Authentication and connections successful" -Level "SUCCESS"
    } catch {
        Add-OrchestratorError -Source "DiscoveryPhase-Auth" -Message "Authentication failure" -Exception $_.Exception -Severity "Critical"
        return @{ Success = $false; ModuleResults = @{}; CriticalErrors = @($_); RecoverableErrors = @(); Warnings = @() }
    }

    # Determine modules to run
    $phaseResult = @{
        Success = $true
        ModuleResults = @{}
        CriticalErrors = [System.Collections.ArrayList]::new()
        RecoverableErrors = [System.Collections.ArrayList]::new()
        Warnings = [System.Collections.ArrayList]::new()
    }
    
    $enabledSources = $global:MandA.Config.discovery.enabledSources
    $sourcesToRun = @($enabledSources | Where-Object {
        # Validate module-specific prerequisites
        if ($_ -eq "SharePoint") {
            if (-not $global:MandA.Config.discovery.sharepoint -or
                -not $global:MandA.Config.discovery.sharepoint.tenantName) {
                Write-OrchestratorLog -Message "SharePoint tenant name not configured. Skipping module." -Level "WARN"
                return $false
            }
        }
        
        if ($Force) { return $true }
        $status = Test-ModuleCompletionStatus -ModuleName $_ -Context $global:MandA
        if ($status.ShouldRun) {
            Write-OrchestratorLog -Message "Queuing module [$_]: $($status.Reason)" -Level "INFO"
            return $true
        } else {
            Write-OrchestratorLog -Message "Skipping module [$_]: $($status.Reason)" -Level "SUCCESS"
            return $false
        }
    })
    
    if ($sourcesToRun.Count -eq 0) {
        Write-OrchestratorLog -Message "No modules to run - all completed" -Level "SUCCESS"
        return $phaseResult
    }

    # Setup enhanced runspace pool
    $maxConcurrentJobs = [Math]::Min($global:MandA.Config.discovery.maxConcurrentJobs, 4) # Cap at 4 for stability
    Write-OrchestratorLog -Message "Creating runspace pool ($maxConcurrentJobs concurrent)" -Level "INFO"
    
    # Create initial session state with modules
    $sessionState = [System.Management.Automation.Runspaces.InitialSessionState]::CreateDefault()
    
    # Add DiscoveryResult type
    $sessionState.Types.Add([System.Management.Automation.Runspaces.SessionStateTypeEntry]::new([DiscoveryResult]))
    
    # Fix for Write-ProgressStep not found error
    $progressStepDefinition = {
        function global:Write-ProgressStep {
            param(
                [string]$Message,
                [string]$Status = "Info"
            )
            $color = switch ($Status) {
                "Progress" { "Yellow" }
                "Success" { "Green" }
                "Warning" { "Yellow" }
                "Error" { "Red" }
                default { "White" }
            }
            Write-Host "  $Message" -ForegroundColor $color
        }
    }.ToString()

    # Add the function definition to session state
    $sessionState.Commands.Add(
        (New-Object System.Management.Automation.Runspaces.SessionStateFunctionEntry(
            'Write-ProgressStep',
            $progressStepDefinition
        ))
    )
    
    # Pre-load shared utility modules into every runspace thread.
    # This ensures helper functions are always available.
    $utilityModulesToLoad = @(
        "EnhancedLogging.psm1",
        "ErrorHandling.psm1",
        "ProgressDisplay.psm1"
    )

    foreach ($utilModule in $utilityModulesToLoad) {
        $utilModulePath = Join-Path $global:MandA.Paths.Utilities $utilModule
        if (Test-Path $utilModulePath) {
            $sessionState.ImportPSModule($utilModulePath)
            Write-OrchestratorLog -Message "Added '$utilModule' to runspace session state." -Level "DEBUG"
        } else {
            Write-OrchestratorLog -Message "Utility module for runspace session state not found: $utilModule" -Level "WARN"
        }
    }

    # Pre-load critical modules from Authentication folder
    $criticalModules = @(
        (Join-Path $global:MandA.Paths.Authentication "Authentication.psm1")
    )
    
    foreach ($moduleFile in $criticalModules) {
        if (Test-Path $moduleFile) {
            $sessionState.ImportPSModule($moduleFile)
            Write-OrchestratorLog -Message "Added authentication module to runspace session state." -Level "DEBUG"
        }
    }
    
    # Create thread-safe collections
    $ResultsCollection = [System.Collections.Concurrent.ConcurrentBag[DiscoveryResult]]::new()
    $ErrorCollection = [System.Collections.Concurrent.ConcurrentBag[PSObject]]::new()
    
    # Add global context to session state
    $contextVariable = New-Object System.Management.Automation.Runspaces.SessionStateVariableEntry(
        'MandAContext', $global:MandA, 'Global M&A Context'
    )
    $sessionState.Variables.Add($contextVariable)

    # Add to session state
    $ResultsVariable = New-Object System.Management.Automation.Runspaces.SessionStateVariableEntry(
        'ResultsCollection', $ResultsCollection, 'Thread-safe results'
    )
    $ErrorVariable = New-Object System.Management.Automation.Runspaces.SessionStateVariableEntry(
        'ErrorCollection', $ErrorCollection, 'Thread-safe errors'
    )
    $sessionState.Variables.Add($ResultsVariable)
    $sessionState.Variables.Add($ErrorVariable)

    # Pre-compile frequently used functions
    $commonFunctions = @'
function Write-ProgressStep {
    param([string]$Message, [string]$Status = "Info")
    $color = @{Progress="Yellow"; Success="Green"; Warning="Yellow"; Error="Red"; Info="White"}[$Status]
    Write-Host "  $Message" -ForegroundColor $color
}
'@
    $sessionState.Commands.Add([System.Management.Automation.Runspaces.SessionStateFunctionEntry]::new('Write-ProgressStep', $commonFunctions))
    
    # Create runspace pool
    $pool = [runspacefactory]::CreateRunspacePool(1, $maxConcurrentJobs, $sessionState, $Host)
    $pool.ApartmentState = 'MTA'
    $pool.ThreadOptions = 'ReuseThread'
    $pool.Open()
    
    Write-OrchestratorLog -Message "Runspace pool created successfully" -Level "SUCCESS"

    # Create jobs with enhanced error handling
    $jobs = [System.Collections.ArrayList]::new()
    $jobMonitor = @{
        StartTime = Get-Date
        TotalJobs = $sourcesToRun.Count
        CompletedJobs = 0
        FailedJobs = 0
        ActiveJobs = @{}
    }
    
    foreach ($moduleName in $sourcesToRun) {
        Write-OrchestratorLog -Message "Creating job for module: $moduleName" -Level "DEBUG"
        $powershell = [powershell]::Create()
        $powershell.RunspacePool = $pool
        
        $scriptBlock = {
            param($modName, $modConfig, $globalContext, $resultsCollection, $errorCollection)
            
            $jobStartTime = Get-Date
            $discoveryResult = [DiscoveryResult]::new($modName)

            try {
                # Set up context for this thread - CREATE A PROPER COPY
                $global:MandA = @{
                    Initialized = $true
                    CompanyName = $globalContext.CompanyName
                    Config = $globalContext.Config
                    Paths = @{}
                    Version = $globalContext.Version
                }
                
                # Deep copy paths to avoid reference issues
                foreach ($key in $globalContext.Paths.Keys) {
                    $global:MandA.Paths[$key] = $globalContext.Paths[$key]
                }
                
                # Add error handling wrapper
                trap {
                    $errorMessage = if ($_.Exception.Message) {
                        $_.Exception.Message
                    } elseif ($_.ToString) {
                        $_.ToString()
                    } else {
                        "Unknown error occurred"
                    }
                    
                    $discoveryResult.Success = $false
                    $discoveryResult.AddError("Runspace execution failed: $errorMessage", $_.Exception, @{ Module = $modName })
                    continue
                }
                
                # Load the specific discovery module for this job
                $discoveryModulePath = Join-Path $global:MandA.Paths.Discovery "${modName}Discovery.psm1"
                if (-not (Test-Path $discoveryModulePath)) {
                    throw "Discovery module file not found: $discoveryModulePath"
                }
                
                # This is a critical step, wrap it in its own try/catch
                try {
                    Import-Module -Name $discoveryModulePath -Force -Global
                } catch {
                    throw "Failed to import module '$discoveryModulePath'. Error: $($_.Exception.Message)"
                }

                # Check for the discovery function
                $functionName = "Invoke-${modName}Discovery"
                if (-not (Get-Command $functionName -ErrorAction SilentlyContinue)) {
                    throw "Discovery function '$functionName' not found after importing module."
                }
                
                # Execute discovery
                $params = @{
                    Configuration = $modConfig
                }

                # Check if the function accepts Context parameter
                $functionInfo = Get-Command $functionName -ErrorAction SilentlyContinue
                if ($functionInfo -and $functionInfo.Parameters.ContainsKey('Context')) {
                    $params['Context'] = $globalContext
                }

                $moduleOutput = & $functionName @params
                
                # Check if the module returned the correct object type
                if ($moduleOutput -is [DiscoveryResult]) {
                    $discoveryResult = $moduleOutput
                } else {
                    # If it didn't, the module is not compliant. Log this but don't lose the data.
                    $discoveryResult.AddWarning("Module did not return a compliant DiscoveryResult object. Data may be incomplete.")
                    $discoveryResult.Data = $moduleOutput
                    $discoveryResult.Success = $true # Assume success if it returned something
                }

            } catch {
                # This is the master catch block for any failure within the runspace
                $discoveryResult.Success = $false
                $discoveryResult.AddError("Runspace execution failed: $($_.Exception.Message)", $_.Exception, @{ Module = $modName })
                
                # Also add to the orchestrator's central error collection for immediate logging
                $errorCollection.Add([PSCustomObject]@{
                    Module = $modName
                    Error = $_.Exception.Message
                    Type = $_.Exception.GetType().FullName
                    Timestamp = Get-Date
                    Duration = (Get-Date) - $jobStartTime
                })
            } finally {
                $discoveryResult.Complete()
                $resultsCollection.Add($discoveryResult)
            }
            
            # Return job status for monitoring
            return @{
                Success = $discoveryResult.Success
                ModuleName = $modName
                Duration = (Get-Date) - $jobStartTime
                RecordCount = if ($discoveryResult.Metadata -and $discoveryResult.Metadata['RecordCount']) {
                    $discoveryResult.Metadata['RecordCount']
                } else { 0 }
                Error = if (-not $discoveryResult.Success -and $discoveryResult.Errors.Count -gt 0) {
                    $discoveryResult.Errors[0].Message
                } else { $null }
            }
        }
        
        $null = $powershell.AddScript($scriptBlock)
        $null = $powershell.AddArgument($moduleName)
        $null = $powershell.AddArgument($global:MandA.Config)
        $null = $powershell.AddArgument($global:MandA)
        $null = $powershell.AddArgument($ResultsCollection)
        $null = $powershell.AddArgument($ErrorCollection)
        
        $job = @{
            ModuleName = $moduleName
            PowerShell = $powershell
            Handle = $powershell.BeginInvoke()
            StartTime = Get-Date
            Completed = $false
        }
        
        $null = $jobs.Add($job)
        $jobMonitor.ActiveJobs[$moduleName] = $job
    }

    # Monitor jobs with health checks
    Write-OrchestratorLog -Message "Monitoring $($jobs.Count) discovery jobs..." -Level "INFO"
    
    $healthCheckInterval = 30
    $lastHealthCheck = Get-Date
    $stuckJobThreshold = 300 # 5 minutes
    $lastMemorySnapshot = Get-Date
    
    while ($jobs | Where-Object { -not $_.Completed }) {
        # Check completed jobs
        foreach ($job in ($jobs | Where-Object { -not $_.Completed })) {
            if ($job.Handle.IsCompleted) {
                try {
                    # Collect result
                    $jobResult = $job.PowerShell.EndInvoke($job.Handle)
                    $job.Completed = $true
                    $jobMonitor.CompletedJobs++
                    
                    # Record timing
                    $script:PerformanceMetrics.ModuleTimings[$job.ModuleName] = @{
                        StartTime = $job.StartTime
                        EndTime = Get-Date
                        Duration = (Get-Date) - $job.StartTime
                        Success = $jobResult.Success
                    }
                    
                    if ($jobResult -and $jobResult.Success) {
                        Write-OrchestratorLog -Message "Module $($job.ModuleName) completed in $([Math]::Round($jobResult.Duration.TotalSeconds, 1))s" -Level "SUCCESS"
                    } else {
                        $jobMonitor.FailedJobs++
                        $errorMessage = if ($jobResult -and $jobResult.Error) { $jobResult.Error } else { "Unknown error" }
                        Write-OrchestratorLog -Message "Module $($job.ModuleName) failed: $errorMessage" -Level "ERROR"
                        
                        # Add to phase result errors
                        $null = $phaseResult.RecoverableErrors.Add([PSCustomObject]@{
                            Module = $job.ModuleName
                            Error = $errorMessage
                            Timestamp = Get-Date
                        })
                    }
                    
                } catch {
                    $job.Completed = $true
                    $jobMonitor.FailedJobs++
                    Write-OrchestratorLog -Message "Error collecting results from $($job.ModuleName): $_" -Level "ERROR"
                } finally {
                    # Clean up immediately
                    try {
                        $job.PowerShell.Streams.ClearStreams()
                        $job.PowerShell.Dispose()
                        $job.PowerShell = $null
                        $job.Handle = $null
                    } catch {
                        Write-OrchestratorLog -Message "Cleanup error for $($job.ModuleName): $_" -Level "WARN"
                    }
                }
            }
        }
        
        # Periodic health check
        if ((Get-Date) - $lastHealthCheck -gt [TimeSpan]::FromSeconds($healthCheckInterval)) {
            $activeCount = ($jobs | Where-Object { -not $_.Completed }).Count
            Write-OrchestratorLog -Message "Progress: $($jobMonitor.CompletedJobs)/$($jobMonitor.TotalJobs) complete, $activeCount active" -Level "DEBUG"
            
            # Check for stuck jobs
            foreach ($job in ($jobs | Where-Object { -not $_.Completed })) {
                $runtime = (Get-Date) - $job.StartTime
                if ($runtime.TotalSeconds -gt $stuckJobThreshold) {
                    Write-OrchestratorLog -Message "Job $($job.ModuleName) stuck ($([Math]::Round($runtime.TotalMinutes, 1)) min)" -Level "WARN"
                    
                    try {
                        # Force stop the runspace
                        $job.PowerShell.Stop()
                        $job.Completed = $true
                        $jobMonitor.FailedJobs++
                        
                        # Create timeout result with proper error
                        $timeoutResult = [DiscoveryResult]::new($job.ModuleName)
                        $timeoutResult.Success = $false
                        $timeoutResult.AddError(
                            "Module execution timed out after $([Math]::Round($runtime.TotalMinutes, 1)) minutes",
                            [System.TimeoutException]::new("Execution timeout"),
                            @{ Module = $job.ModuleName; Runtime = $runtime.TotalSeconds }
                        )
                        $timeoutResult.Complete()
                        $ResultsCollection.Add($timeoutResult)
                        
                        # Add to phase errors
                        $null = $phaseResult.RecoverableErrors.Add([PSCustomObject]@{
                            Module = $job.ModuleName
                            Error = "Execution timeout after $([Math]::Round($runtime.TotalMinutes, 1)) minutes"
                            Type = "Timeout"
                            Timestamp = Get-Date
                        })
                        
                        # Dispose immediately to free memory
                        $job.PowerShell.Dispose()
                        $job.PowerShell = $null
                        $job.Handle = $null
                        
                        # Force garbage collection
                        [System.GC]::Collect()
                        [System.GC]::WaitForPendingFinalizers()
                        [System.GC]::Collect()
                    } catch {
                        Write-OrchestratorLog -Message "Failed to stop stuck job: $_" -Level "ERROR"
                    }
                }
            }
            
            $lastHealthCheck = Get-Date
        }
        
        # Memory monitoring
        if ((Get-Date) - $lastMemorySnapshot -gt [TimeSpan]::FromSeconds(60)) {
            $snapshot = Get-MemorySnapshot
            $null = $script:PerformanceMetrics.MemorySnapshots.Add($snapshot)
            
            if ($snapshot.WorkingSetMB -gt $global:MandA.Config.performance.memoryThresholdMB) {
                Write-OrchestratorLog -Message "Memory threshold exceeded: $($snapshot.WorkingSetMB)MB" -Level "WARN"
                
                # Force garbage collection
                [System.GC]::Collect()
                [System.GC]::WaitForPendingFinalizers()
                [System.GC]::Collect()
            }
            
            $lastMemorySnapshot = Get-Date
        }
        
        Start-Sleep -Milliseconds 500
    }

    # Cleanup
    Write-OrchestratorLog -Message "All jobs completed. Cleaning up..." -Level "INFO"
    
    foreach ($job in $jobs) {
        if ($job.PowerShell) {
            try {
                if (-not $job.Handle.IsCompleted) {
                    $job.PowerShell.Stop()
                }
                $job.PowerShell.Dispose()
            } catch {}
        }
    }
    
    try {
        $pool.Close()
        $pool.Dispose()
        Write-OrchestratorLog -Message "Runspace pool disposed" -Level "SUCCESS"
    } catch {
        Write-OrchestratorLog -Message "Error disposing pool: $_" -Level "WARN"
    }
    
    # Final garbage collection
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
    [System.GC]::Collect()
    
    # Process results
    $allResults = $ResultsCollection.ToArray()
    foreach ($result in $allResults) {
        $phaseResult.ModuleResults[$result.ModuleName] = $result
    }
    
    # Process errors
    $allErrors = $ErrorCollection.ToArray()
    foreach ($error in $allErrors) {
        $null = $phaseResult.RecoverableErrors.Add($error)
    }
    
    # Phase timing
    $script:PerformanceMetrics.PhaseTimings['Discovery'] = @{
        StartTime = $phaseStartTime
        EndTime = Get-Date
        Duration = (Get-Date) - $phaseStartTime
    }
    
    # Summary
    $totalModules = $allResults.Count
    $successfulModules = ($allResults | Where-Object { $_.Success }).Count
    $failedModules = $totalModules - $successfulModules
    
    Write-OrchestratorLog -Message "Discovery complete: $successfulModules/$totalModules successful" -Level "INFO"
    
    Export-ErrorReport -PhaseResult $phaseResult
    return $phaseResult
}

function Invoke-ProcessingPhase {
    Write-OrchestratorLog -Message "STARTING PROCESSING PHASE" -Level "HEADER"
    $phaseStartTime = Get-Date
    
    # Validate context first
    if (-not $global:MandA -or -not $global:MandA.Paths) {
        Write-OrchestratorLog -Message "Global context not available or corrupted" -Level "ERROR"
        return @{ Success = $false; ProcessedFiles = @() }
    }
    
    $phaseResult = @{
        Success = $true
        ProcessedFiles = @()
    }
    
    try {
        # Verify raw data exists
        $rawDataPath = $global:MandA.Paths.RawDataOutput
        Write-OrchestratorLog -Message "Checking raw data: $rawDataPath" -Level "DEBUG"
        
        if (-not (Test-Path $rawDataPath)) {
            throw "Raw data directory not found"
        }
        
        $csvFiles = Get-ChildItem -Path $rawDataPath -Filter "*.csv" -File
        if ($csvFiles.Count -eq 0) {
            throw "No raw data files found"
        }
        
        Write-OrchestratorLog -Message "Found $($csvFiles.Count) raw data files" -Level "INFO"
        
        # Execute data aggregation
        if (Get-Command Start-DataAggregation -ErrorAction SilentlyContinue) {
            Write-OrchestratorLog -Message "Starting data aggregation..." -Level "INFO"
            
            # Pass full context to aggregation
            $aggregationParams = @{
                Configuration = $global:MandA.Config
                Context = $global:MandA  # Pass full context
            }

            $aggregationResult = Start-DataAggregation @aggregationParams
            
            if (-not $aggregationResult) {
                throw "Data aggregation failed"
            }
            
            # Get processed files
            $processedPath = $global:MandA.Paths.ProcessedDataOutput
            $phaseResult.ProcessedFiles = Get-ChildItem -Path $processedPath -Filter "*.csv" -File
            
            Write-OrchestratorLog -Message "Processing completed: $($phaseResult.ProcessedFiles.Count) files" -Level "SUCCESS"
            
        } else {
            throw "Start-DataAggregation function not found"
        }
        
        # Phase timing
        $script:PerformanceMetrics.PhaseTimings['Processing'] = @{
            StartTime = $phaseStartTime
            EndTime = Get-Date
            Duration = (Get-Date) - $phaseStartTime
        }
        
    } catch {
        $phaseResult.Success = $false
        Add-OrchestratorError -Source "ProcessingPhase" `
            -Message "Processing failed: $_" `
            -Exception $_.Exception `
            -Severity "Critical"
    }
    
    return $phaseResult
}

function Invoke-ExportPhase {
    Write-OrchestratorLog -Message "STARTING EXPORT PHASE" -Level "HEADER"
    $phaseStartTime = Get-Date
    
    $phaseResult = @{
        Success = $true
        ExportedFormats = @()
    }
    
    try {
        # Load processed data
        $processedPath = $global:MandA.Paths.ProcessedDataOutput
        
        if (-not (Test-Path $processedPath)) {
            throw "Processed data directory not found"
        }
        
        $dataToExport = @{}
        $processedFiles = Get-ChildItem -Path $processedPath -Filter "*.csv" -File
        
        Write-OrchestratorLog -Message "Found $($processedFiles.Count) processed files" -Level "INFO"
        
        foreach ($file in $processedFiles) {
            try {
                $dataToExport[$file.BaseName] = Import-Csv -Path $file.FullName -Encoding UTF8
            } catch {
                Add-OrchestratorError -Source "ExportPhase" `
                    -Message "Failed to load $($file.Name)" `
                    -Exception $_.Exception `
                    -Severity "Warning"
            }
        }
        
        # Execute exports
        $enabledFormats = $global:MandA.Config.export.formats
        if ($enabledFormats -isnot [array]) {
            $enabledFormats = @($enabledFormats)
        }
        
        Write-OrchestratorLog -Message "Export formats: $($enabledFormats -join ', ')" -Level "INFO"
        
        foreach ($format in $enabledFormats) {
            $functionMapping = @{
                "CSV" = "Export-ToCSV"
                "JSON" = "Export-ToJSON"
                "Excel" = "Export-ToExcel"
                "CompanyControlSheet" = "Export-ToCompanyControlSheet"
            }
            
            $functionName = $functionMapping[$format]
            
            if (Get-Command $functionName -ErrorAction SilentlyContinue) {
                try {
                    Write-OrchestratorLog -Message "Exporting to: $format" -Level "INFO"
                    & $functionName -ProcessedData $dataToExport -Configuration $global:MandA.Config
                    $phaseResult.ExportedFormats += $format
                    Write-OrchestratorLog -Message "Export completed: $format" -Level "SUCCESS"
                } catch {
                    Add-OrchestratorError -Source "Export_$format" `
                        -Message "Export failed: $_" `
                        -Exception $_.Exception
                }
            }
        }
        
        if ($phaseResult.ExportedFormats.Count -eq 0) {
            throw "No formats exported successfully"
        }
        
        Write-OrchestratorLog -Message "Export completed: $($phaseResult.ExportedFormats -join ', ')" -Level "SUCCESS"
        
        # Phase timing
        $script:PerformanceMetrics.PhaseTimings['Export'] = @{
            StartTime = $phaseStartTime
            EndTime = Get-Date
            Duration = (Get-Date) - $phaseStartTime
        }
        
    } catch {
        $phaseResult.Success = $false
        Add-OrchestratorError -Source "ExportPhase" `
            -Message "Export failed: $_" `
            -Exception $_.Exception `
            -Severity "Critical"
    }
    
    return $phaseResult
}

function Export-ErrorReport {
    param([hashtable]$PhaseResult)
    
    # Collect errors from module results
    $moduleErrors = @()
    $moduleWarnings = @()
    
    foreach ($moduleName in $PhaseResult.ModuleResults.Keys) {
        $moduleResult = $PhaseResult.ModuleResults[$moduleName]
        if ($moduleResult -and -not $moduleResult.Success) {
            foreach ($error in $moduleResult.Errors) {
                $moduleErrors += [PSCustomObject]@{
                    Module = $moduleName
                    Error = $error.Message
                    Exception = $error.Exception
                    Timestamp = $error.Timestamp
                }
            }
        }
        if ($moduleResult -and $moduleResult.Warnings.Count -gt 0) {
            foreach ($warning in $moduleResult.Warnings) {
                $moduleWarnings += [PSCustomObject]@{
                    Module = $moduleName
                    Warning = $warning.Message
                    Timestamp = $warning.Timestamp
                }
            }
        }
    }
    
    # Combine with phase-level errors
    $allErrors = $PhaseResult.CriticalErrors + $PhaseResult.RecoverableErrors + $moduleErrors
    $allWarnings = $PhaseResult.Warnings + $moduleWarnings
    
    if ($allErrors.Count -eq 0 -and $allWarnings.Count -eq 0) {
        Write-OrchestratorLog -Message "No errors or warnings to report" -Level "SUCCESS"
        return
    }
    
    $actualModuleResults = $PhaseResult.ModuleResults.Values | Where-Object { $_ -ne $null }
    $successfulModules = ($actualModuleResults | Where-Object { $_.Success -eq $true }).Count
    
    $errorReport = @{
        Timestamp = Get-Date
        ExecutionId = $script:CorrelationId
        Summary = @{
            CriticalErrors = $PhaseResult.CriticalErrors.Count
            RecoverableErrors = $PhaseResult.RecoverableErrors.Count
            Warnings = $PhaseResult.Warnings.Count
            TotalModules = $actualModuleResults.Count
            SuccessfulModules = $successfulModules
        }
        CriticalErrors = $PhaseResult.CriticalErrors
        RecoverableErrors = $PhaseResult.RecoverableErrors
        Warnings = $PhaseResult.Warnings
        ModuleResults = @{}
        PerformanceMetrics = $script:PerformanceMetrics
    }
    
    # Add module results
    foreach ($moduleName in $PhaseResult.ModuleResults.Keys) {
        $moduleResult = $PhaseResult.ModuleResults[$moduleName]
        if ($moduleResult -ne $null) {
            $errorReport.ModuleResults[$moduleName] = @{
                Success = $moduleResult.Success
                ErrorCount = $moduleResult.Errors.Count
                WarningCount = $moduleResult.Warnings.Count
                Duration = $moduleResult.Metadata['Duration']
                ExecutionId = $moduleResult.ExecutionId
            }
        }
    }
    
    # Export report
    $errorReportPath = Join-Path $global:MandA.Paths.LogOutput "DiscoveryErrorReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $errorReport | ConvertTo-Json -Depth 10 | Set-Content -Path $errorReportPath -Encoding UTF8
    
    Write-OrchestratorLog -Message "Error report exported: $errorReportPath" -Level "INFO"
    
    # Log summary
    Write-OrchestratorLog -Message "--- ERROR SUMMARY ---" -Level "HEADER"
    Write-OrchestratorLog -Message "Critical Errors: $($errorReport.Summary.CriticalErrors)" -Level $(if ($errorReport.Summary.CriticalErrors -gt 0) { "ERROR" } else { "SUCCESS" })
    Write-OrchestratorLog -Message "Recoverable Errors: $($errorReport.Summary.RecoverableErrors)" -Level $(if ($errorReport.Summary.RecoverableErrors -gt 0) { "WARN" } else { "SUCCESS" })
    Write-OrchestratorLog -Message "Successful Modules: $($errorReport.Summary.SuccessfulModules)/$($errorReport.Summary.TotalModules)" -Level "INFO"
}

function Export-PerformanceReport {
    # Replace the MemoryUsage calculation with error handling:
    $memoryUsage = @{
        Snapshots = $script:PerformanceMetrics.MemorySnapshots
        PeakWorkingSetMB = if ($script:PerformanceMetrics.MemorySnapshots.Count -gt 0) {
            try {
                ($script:PerformanceMetrics.MemorySnapshots |
                 Where-Object { $_.WorkingSetMB } |
                 Measure-Object -Property WorkingSetMB -Maximum -ErrorAction SilentlyContinue).Maximum
            } catch { 0 }
        } else { 0 }
        AverageWorkingSetMB = if ($script:PerformanceMetrics.MemorySnapshots.Count -gt 0) {
            try {
                [Math]::Round(($script:PerformanceMetrics.MemorySnapshots |
                              Where-Object { $_.WorkingSetMB } |
                              Measure-Object -Property WorkingSetMB -Average -ErrorAction SilentlyContinue).Average, 2)
            } catch { 0 }
        } else { 0 }
    }

    $performanceReport = @{
        Timestamp = Get-Date
        ExecutionId = $script:CorrelationId
        TotalDuration = (Get-Date) - $script:StartTime
        PhaseTimings = $script:PerformanceMetrics.PhaseTimings
        ModuleTimings = $script:PerformanceMetrics.ModuleTimings
        MemoryUsage = $memoryUsage
        Configuration = @{
            Company = $CompanyName
            Mode = $Mode
            ParallelThrottle = $ParallelThrottle
            EnabledSources = $global:MandA.Config.discovery.enabledSources
        }
    }
    
    $reportPath = Join-Path $global:MandA.Paths.LogOutput "PerformanceReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $performanceReport | ConvertTo-Json -Depth 10 | Set-Content -Path $reportPath -Encoding UTF8
    
    Write-OrchestratorLog -Message "Performance report exported: $reportPath" -Level "INFO"
    
    # Log performance summary
    Write-OrchestratorLog -Message "--- PERFORMANCE SUMMARY ---" -Level "HEADER"
    Write-OrchestratorLog -Message "Total Duration: $([Math]::Round($performanceReport.TotalDuration.TotalMinutes, 1)) minutes" -Level "INFO"
    Write-OrchestratorLog -Message "Peak Memory: $($performanceReport.MemoryUsage.PeakWorkingSetMB)MB" -Level "INFO"
    Write-OrchestratorLog -Message "Average Memory: $($performanceReport.MemoryUsage.AverageWorkingSetMB)MB" -Level "INFO"
}

#===============================================================================
#                       MAIN EXECUTION
#===============================================================================

try {
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "M&A Discovery Suite Orchestrator v7.0.0" -Level "HEADER"
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "Company: $CompanyName | Mode: $Mode" -Level "INFO"
    Write-OrchestratorLog -Message "Correlation ID: $script:CorrelationId" -Level "INFO"
    
    # Prerequisites check
    if (-not (Test-OrchestratorPrerequisites)) {
        throw "Prerequisites validation failed"
    }
    
    # Discovery prerequisites check
    Test-DiscoveryPrerequisites
    
    # Module check
    Write-OrchestratorLog -Message "CHECKING MODULE PREREQUISITES" -Level "HEADER"
    
    $moduleCheckScript = Join-Path $global:MandA.Paths.Scripts "DiscoverySuiteModuleCheck.ps1"
    if (Test-Path $moduleCheckScript) {
        try {
            $moduleCheckOutput = & $moduleCheckScript 2>&1
            $moduleCheckExitCode = $LASTEXITCODE
            
            switch ($moduleCheckExitCode) {
                0 { Write-OrchestratorLog -Message "All modules OK" -Level "SUCCESS" }
                1 { Write-OrchestratorLog -Message "Optional modules missing" -Level "WARN" }
                2 { throw "Critical modules missing" }
            }
        } catch {
            if ($_.Exception.Message -like "*Critical modules missing*") {
                throw $_
            }
            Write-OrchestratorLog -Message "Module check error: $_" -Level "WARN"
        }
    }
    
    # Handle configuration
    if ($Force) {
        Write-OrchestratorLog -Message "Force mode enabled" -Level "INFO"
        $global:MandA.Config.discovery.forceMode = $true
    }
    
    if ($Mode -eq "AzureOnly") {
        Write-OrchestratorLog -Message "Azure-only mode selected" -Level "INFO"
        $allSources = $global:MandA.Config.discovery.enabledSources
        $filteredSources = $allSources | Where-Object { $_ -in $script:AzureOnlySources }
        $global:MandA.Config.discovery.enabledSources = $filteredSources
        Write-OrchestratorLog -Message "Filtered to: $($filteredSources -join ', ')" -Level "INFO"
        $Mode = "Full"
    }
    
    # Initialize modules
    Initialize-OrchestratorModules -Phase $Mode
    
    # Validation mode
    if ($ValidateOnly) {
        Write-OrchestratorLog -Message "VALIDATION-ONLY MODE" -Level "INFO"
        $validationPassed = $true
        
        $requiredModules = Get-Module -Name "*Discovery", "*Processing", "*Export" -ListAvailable
        Write-OrchestratorLog -Message "Available modules: $($requiredModules.Count)" -Level "INFO"
        
        $pathsToCheck = @("RawDataOutput", "ProcessedDataOutput", "ExportOutput", "LogOutput")
        foreach ($pathKey in $pathsToCheck) {
            $path = $global:MandA.Paths[$pathKey]
            if (Test-Path $path) {
                Write-OrchestratorLog -Message "Path exists: $pathKey" -Level "SUCCESS"
            } else {
                Write-OrchestratorLog -Message "Path missing: $pathKey" -Level "WARN"
                $validationPassed = $false
            }
        }
        
        $exitCode = if ($validationPassed) { 0 } else { 1 }
        Write-OrchestratorLog -Message "Validation complete. Exit code: $exitCode" -Level "INFO"
        exit $exitCode
    }
    
    # Execute phases
    $phaseResults = @{}
    
    switch ($Mode) {
        "Discovery" { 
            $phaseResults.Discovery = Invoke-DiscoveryPhase 
        }
        "Processing" { 
            $phaseResults.Processing = Invoke-ProcessingPhase 
        }
        "Export" { 
            $phaseResults.Export = Invoke-ExportPhase 
        }
        "Full" {
            $phaseResults.Discovery = Invoke-DiscoveryPhase
            if ($phaseResults.Discovery.Success) {
                $phaseResults.Processing = Invoke-ProcessingPhase
            }
            if ($phaseResults.Processing -and $phaseResults.Processing.Success) {
                $phaseResults.Export = Invoke-ExportPhase
            }
        }
    }
    
    # Generate performance report
    Export-PerformanceReport
    
    # Final summary
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "EXECUTION SUMMARY" -Level "HEADER"
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    
    $duration = (Get-Date) - $script:StartTime
    Write-OrchestratorLog -Message "Total execution time: $($duration.ToString('hh\:mm\:ss'))" -Level "INFO"
    
    foreach ($phase in $phaseResults.Keys) {
        $result = $phaseResults[$phase]
        $status = if ($result.Success) { "SUCCESS" } else { "FAILED" }
        Write-OrchestratorLog -Message "$phase Phase: $status" -Level $(if ($result.Success) { "SUCCESS" } else { "ERROR" })
    }
    
    $criticalCount = $script:ErrorCollector.Critical.Count
    $errorCount = $script:ErrorCollector.Errors.Count
    $warningCount = $script:ErrorCollector.Warnings.Count
    
    Write-OrchestratorLog -Message "Errors - Critical: $criticalCount, Errors: $errorCount, Warnings: $warningCount" -Level "INFO"
    
    # Determine exit code
    $exitCode = if ($criticalCount -gt 0) { 2 }
                elseif ($errorCount -gt 0) { 1 }
                else { 0 }
    
    Write-OrchestratorLog -Message "Orchestrator completed. Exit code: $exitCode" -Level "INFO"
    exit $exitCode
    
} catch {
    Write-OrchestratorLog -Message "FATAL ERROR: $_" -Level "CRITICAL"
    Write-OrchestratorLog -Message "Stack Trace: $($_.ScriptStackTrace)" -Level "ERROR"
    
    $crashReport = @{
        Timestamp = Get-Date
        CorrelationId = $script:CorrelationId
        Error = $_.Exception.Message
        ExceptionType = $_.Exception.GetType().FullName
        StackTrace = $_.ScriptStackTrace
        Parameters = @{
            CompanyName = $CompanyName
            Mode = $Mode
            ConfigurationFile = $ConfigurationFile
        }
        PerformanceMetrics = $script:PerformanceMetrics
    }
    
    $crashPath = Join-Path $global:MandA.Paths.LogOutput "OrchestratorCrash_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $crashReport | ConvertTo-Json -Depth 10 | Set-Content -Path $crashPath -Encoding UTF8
    
    Write-OrchestratorLog -Message "Crash report saved: $crashPath" -Level "ERROR"
    exit 99
    
} finally {
    Write-OrchestratorLog -Message "Performing cleanup..." -Level "INFO"
    
    # Disconnect services
    if (Get-Command Disconnect-AllServices -ErrorAction SilentlyContinue) {
        try {
            Disconnect-AllServices
        } catch {
            Write-OrchestratorLog -Message "Error during disconnect: $_" -Level "WARN"
        }
    }
    
    # Stop logging if available
    if (Get-Command Stop-Logging -ErrorAction SilentlyContinue) {
        try {
            Stop-Logging
        } catch {}
    }
    
    Write-OrchestratorLog -Message "Orchestrator cleanup complete" -Level "INFO"
}