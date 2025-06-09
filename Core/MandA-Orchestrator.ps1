# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-05
# Last Modified: 2025-06-09
# Change Log: Corrected unclosed try/catch blocks in the user-interactive retry logic.

<#
.SYNOPSIS
    M&A Discovery Suite - Core Orchestration Engine (Enhanced Debug Version)
.DESCRIPTION
    Core orchestrator that manages discovery, processing, and export phases.
    This version includes extensive debugging output and fixes for common issues.
.NOTES
    Version: 6.1.1-FIXED
    Created: 2025-01-03
    Enhanced with verbose debugging and robustness fixes
    
    Key improvements:
    - Enhanced debug logging throughout
    - Cleaned up redundant enabledSources defensive code
    - Fixed authentication context type issues
    - Removed all non-ASCII characters
    - Added comprehensive error context
    - Improved type validation
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
        errorEntry["Exception"] = exception != null ? exception.ToString() : null;
        errorEntry["ExceptionType"] = exception != null ? exception.GetType().FullName : null;
        errorEntry["Context"] = context;
        errorEntry["StackTrace"] = exception != null ? exception.StackTrace : System.Environment.StackTrace;
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
    Write-Host "[ORCHESTRATOR DEBUG] DiscoveryResult class defined globally using Add-Type" -ForegroundColor Green
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
Write-Host "[ORCHESTRATOR DEBUG] Starting initialization..." -ForegroundColor Cyan
Write-Host "[ORCHESTRATOR DEBUG] PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Gray
Write-Host "[ORCHESTRATOR DEBUG] Script Location: $PSCommandPath" -ForegroundColor Gray
Write-Host "[ORCHESTRATOR DEBUG] Parameters: CompanyName='$CompanyName', Mode='$Mode', Force=$Force, ValidateOnly=$ValidateOnly" -ForegroundColor Gray

if (-not $global:MandA -or -not $global:MandA.Initialized) {
    Write-Host "[ORCHESTRATOR ERROR] Global MandA context not initialized!" -ForegroundColor Red
    Write-Host "[ORCHESTRATOR DEBUG] Global:MandA exists: $($null -ne $global:MandA)" -ForegroundColor Yellow
    if ($global:MandA) {
        Write-Host "[ORCHESTRATOR DEBUG] Global:MandA.Initialized: $($global:MandA.Initialized)" -ForegroundColor Yellow
    }
    throw "Global M&A context not initialized. Run through QuickStart.ps1 or ensure Set-SuiteEnvironment.ps1 has been sourced."
}

Write-Host "[ORCHESTRATOR DEBUG] Global context validated successfully" -ForegroundColor Green

# Set error handling
$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# Script variables
$script:StartTime = Get-Date
$script:DebugMode = $DebugMode -or $VerbosePreference -eq 'Continue'
$script:ErrorCollector = @{
    Errors = [System.Collections.ArrayList]::new()
    Warnings = [System.Collections.ArrayList]::new()
    Critical = [System.Collections.ArrayList]::new()
}
$script:AzureOnlySources = @(
    "Azure", "Graph", "Intune", "Licensing", 
    "ExternalIdentity", "SharePoint", "Teams", "Exchange"
)

Write-Host "[ORCHESTRATOR DEBUG] Debug mode: $($script:DebugMode)" -ForegroundColor Gray
Write-Host "[ORCHESTRATOR DEBUG] Error action preference: $ErrorActionPreference" -ForegroundColor Gray

#===============================================================================
#                       HELPER FUNCTIONS
#===============================================================================

function Write-OrchestratorLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Component = "Orchestrator",
        [switch]$DebugOnly
    )
    
    # Skip debug-only messages if not in debug mode
    if ($DebugOnly -and -not $script:DebugMode) { return }
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message $Message -Level $Level -Component $Component
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

function Test-ModuleCompletionStatus {
    <#
    .SYNOPSIS
        Tests whether a discovery module should run based on its completion status and data validity
    .DESCRIPTION
        Implements smart Force logic by checking if a module has already completed successfully
        with valid data. Returns whether the module should run and the reason.
    .PARAMETER ModuleName
        The name of the discovery module to check
    .PARAMETER Context
        The global M&A context containing paths and configuration
    #>
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
            "ActiveDirectory" = @("ADUsers.csv", "ADGroups.csv", "ADGroupMembers.csv", "ADComputers.csv", "ADOUs.csv", "ADSites.csv", "ADSiteLinks.csv", "ADSubnets.csv")
            "Graph" = @("GraphUsers.csv", "GraphGroups.csv")
            "Azure" = @("AzureSubscriptions.csv", "AzureResources.csv")
            "Intune" = @("IntuneManagedDevices.csv", "IntuneDeviceConfigurations.csv", "IntuneCompliancePolicies.csv", "IntuneManagedApps.csv", "IntuneAppProtectionPolicies.csv", "IntuneEnrollmentRestrictions.csv")
            "Exchange" = @("ExchangeMailboxes.csv", "ExchangeDistributionGroups.csv")
            "SharePoint" = @("SharePointSites.csv", "SharePointLists.csv")
            "Teams" = @("TeamsTeams.csv", "TeamsChannels.csv", "TeamsUsers.csv")
            "GPO" = @("GPODriveMappings.csv", "GPOFolderRedirections.csv", "GPOLogonScripts.csv")
            "SQLServer" = @("SQLInstances.csv", "SQLDatabases.csv", "SQLLogins.csv")
            "FileServer" = @("FileShares.csv", "FilePermissions.csv")
            "Licensing" = @("LicenseAssignments.csv", "LicenseUsage.csv")
            "EnvironmentDetection" = @("EnvironmentSummary.csv")
            "ExternalIdentity" = @("ExternalUsers.csv", "ExternalGroups.csv")
            "NetworkInfrastructure" = @("NetworkDevices.csv", "NetworkConfiguration.csv")
        }
        
        $expectedFiles = $moduleFileMapping[$ModuleName]
        if (-not $expectedFiles) {
            Write-OrchestratorLog -Message "No file mapping found for module: $ModuleName" -Level "WARN"
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
                            Write-OrchestratorLog -Message "Valid file found: $fileName ($recordCount records)" -Level "DEBUG" -DebugOnly
                        } else {
                            Write-OrchestratorLog -Message "Empty file found: $fileName" -Level "DEBUG" -DebugOnly
                        }
                    } catch {
                        Write-OrchestratorLog -Message "Invalid CSV file: $fileName - $_" -Level "DEBUG" -DebugOnly
                    }
                } else {
                    Write-OrchestratorLog -Message "File too small: $fileName ($($fileInfo.Length) bytes)" -Level "DEBUG" -DebugOnly
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
            $result.Reason = "Module completed successfully with $totalRecords records across $validFiles files"
        } elseif ($validFiles -gt 0 -and $totalRecords -gt 0 -and $completionPercentage -ge 50) {
            $result.CompletionStatus = "Complete"
            $result.ShouldRun = $false
            $result.Reason = "Module completed with $totalRecords records across $validFiles/$($expectedFiles.Count) files (sufficient data)"
        } elseif ($validFiles -gt 0 -and $totalRecords -gt 0) {
            $result.CompletionStatus = "Partial"
            $result.ShouldRun = $true
            $result.Reason = "Module partially complete ($validFiles/$($expectedFiles.Count) files, $totalRecords records) - will re-run"
        } else {
            $result.CompletionStatus = "NotStarted"
            $result.ShouldRun = $true
            $result.Reason = "No valid data files found - will run"
        }
        
        $activeFiles = Get-ChildItem -Path $rawDataPath -Filter "*.csv" -ErrorAction SilentlyContinue | Where-Object {
            $_.Name -in $expectedFiles -and
            $_.Length -lt 500 -and
            (Get-Date) - $_.LastWriteTime -lt [TimeSpan]::FromMinutes(2)
        }
        
        if ($activeFiles.Count -gt 0 -and $validFiles -eq 0) {
            $result.CompletionStatus = "Running"
            $result.ShouldRun = $false
            $result.Reason = "Module currently running (active files detected)"
        }
        
        if ($activeFiles.Count -gt 0 -and $validFiles -gt 0) {
            Write-OrchestratorLog -Message "Module $ModuleName has both active and complete files - treating as complete" -Level "DEBUG" -DebugOnly
        }
        
    } catch {
        Write-OrchestratorLog -Message "Error checking module completion status for $ModuleName`: $_" -Level "WARN"
        $result.ShouldRun = $true
        $result.Reason = "Error checking status - will run to be safe"
    }
    
    return $result
}

function Test-OrchestratorPrerequisites {
    Write-OrchestratorLog -Message "Validating orchestrator prerequisites..." -Level "INFO"
    Write-OrchestratorLog -Message "Checking PowerShell version..." -Level "DEBUG" -DebugOnly
    
    $prereqMet = $true
    
    if ($PSVersionTable.PSVersion.Major -lt 5 -or
        ($PSVersionTable.PSVersion.Major -eq 5 -and $PSVersionTable.PSVersion.Minor -lt 1)) {
        Add-OrchestratorError -Source "Prerequisites" `
            -Message "PowerShell 5.1 or higher required. Current: $($PSVersionTable.PSVersion)" `
            -Severity "Critical"
        $prereqMet = $false
    } else {
        Write-OrchestratorLog -Message "PowerShell version OK: $($PSVersionTable.PSVersion)" -Level "DEBUG" -DebugOnly
    }
    
    Write-OrchestratorLog -Message "Checking critical paths..." -Level "DEBUG" -DebugOnly
    $criticalPaths = @("SuiteRoot", "Modules", "Core", "Configuration")
    foreach ($pathKey in $criticalPaths) {
        if (-not $global:MandA.Paths.ContainsKey($pathKey)) {
            Add-OrchestratorError -Source "Prerequisites" `
                -Message "Critical path '$pathKey' not defined in global context" `
                -Severity "Critical"
            $prereqMet = $false
        } elseif (-not (Test-Path $global:MandA.Paths[$pathKey])) {
            Add-OrchestratorError -Source "Prerequisites" `
                -Message "Critical path does not exist: $($global:MandA.Paths[$pathKey])" `
                -Severity "Critical"
            $prereqMet = $false
        } else {
            Write-OrchestratorLog -Message "Path OK: $pathKey = $($global:MandA.Paths[$pathKey])" -Level "DEBUG" -DebugOnly
        }
    }
    
    Write-OrchestratorLog -Message "Validating DiscoveryResult class availability..." -Level "DEBUG"
    if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        Write-OrchestratorLog -Message "DiscoveryResult class not found, will be defined during initialization" -Level "WARN"
    } else {
        Write-OrchestratorLog -Message "DiscoveryResult class already available in current session" -Level "DEBUG" -DebugOnly
    }
    
    Write-OrchestratorLog -Message "Validating critical .NET assemblies..." -Level "DEBUG" -DebugOnly
    $requiredAssemblies = @(
        'System.Collections',
        'System.Management.Automation'
    )
    
    foreach ($assembly in $requiredAssemblies) {
        try {
            $loadedAssembly = [System.AppDomain]::CurrentDomain.GetAssemblies() |
                Where-Object { $_.GetName().Name -eq $assembly }
            if ($loadedAssembly) {
                Write-OrchestratorLog -Message "Assembly OK: $assembly" -Level "DEBUG" -DebugOnly
            } else {
                Write-OrchestratorLog -Message "Assembly not loaded: $assembly" -Level "WARN"
            }
        } catch {
            Write-OrchestratorLog -Message "Error checking assembly $assembly`: $_" -Level "WARN"
        }
    }
    
    if ($script:DebugMode) {
        Write-OrchestratorLog -Message "Configuration metadata:" -Level "DEBUG"
        Write-OrchestratorLog -Message "  Version: $($global:MandA.Config.metadata.version)" -Level "DEBUG"
        Write-OrchestratorLog -Message "  Company: $($global:MandA.Config.metadata.companyName)" -Level "DEBUG"
        Write-OrchestratorLog -Message "  Environment LogLevel: $($global:MandA.Config.environment.logLevel)" -Level "DEBUG"
    }
    
    return $prereqMet
}

function Initialize-OrchestratorModules {
    param([string]$Phase)
    
    Write-OrchestratorLog -Message "Loading modules for phase: $Phase" -Level "INFO"
    
    if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        Write-OrchestratorLog -Message "ERROR: DiscoveryResult class not found! This should have been defined at script startup." -Level "ERROR"
        throw "DiscoveryResult class not available. Critical initialization failure."
    } else {
        Write-OrchestratorLog -Message "DiscoveryResult class verified and available" -Level "DEBUG"
    }
    
    $utilityModules = @(
        "ErrorHandling",
        "EnhancedLogging",
        "PerformanceMetrics",
        "FileOperations",
        "ValidationHelpers",
        "ProgressDisplay",
        "AuthenticationMonitoring"
    )
    
    Write-OrchestratorLog -Message "Loading utility modules..." -Level "INFO"
    $loadedUtilities = 0
    $failedUtilities = @()
    
    foreach ($module in $utilityModules) {
        $modulePath = Join-Path (Get-ModuleContext).Paths.Utilities "$module.psm1"
        Write-OrchestratorLog -Message "Loading utility module: $module from $modulePath" -Level "DEBUG"
        
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global -ErrorAction Stop
                $loadedUtilities++
                Write-OrchestratorLog -Message "Successfully loaded utility module: $module" -Level "SUCCESS"
                
                if ($module -eq "EnhancedLogging") {
                    if (Get-Command "Initialize-Logging" -ErrorAction SilentlyContinue) {
                        Write-OrchestratorLog -Message "Initializing logging system..." -Level "INFO"
                        try {
                            Initialize-Logging -Context $global:MandA
                            Write-OrchestratorLog -Message "Logging system initialized successfully" -Level "SUCCESS"
                        } catch {
                            Write-OrchestratorLog -Message "Failed to initialize logging system: $_" -Level "ERROR"
                        }
                    } else {
                        Write-OrchestratorLog -Message "WARNING: Initialize-Logging function not found after loading EnhancedLogging module" -Level "ERROR"
                    }
                }
                
                if ($module -eq "ErrorHandling") {
                    if (Get-Command "Invoke-WithTimeout" -ErrorAction SilentlyContinue) {
                        Write-OrchestratorLog -Message "Verified Invoke-WithTimeout function is available" -Level "SUCCESS"
                    } else {
                        Write-OrchestratorLog -Message "WARNING: Invoke-WithTimeout function not found after loading ErrorHandling module" -Level "ERROR"
                    }
                }
            } catch {
                $failedUtilities += $module
                Add-OrchestratorError -Source "ModuleLoader" `
                    -Message "Failed to load utility module $module`: $_" `
                    -Exception $_.Exception `
                    -Severity "Critical"
                Write-OrchestratorLog -Message "FAILED to load utility module: $module - $_" -Level "ERROR"
            }
        } else {
            $failedUtilities += $module
            Write-OrchestratorLog -Message "Utility module not found: $modulePath" -Level "ERROR"
            Add-OrchestratorError -Source "ModuleLoader" `
                -Message "Utility module file not found: $modulePath" `
                -Severity "Critical"
        }
    }
    
    Write-OrchestratorLog -Message "Utility module loading complete: $loadedUtilities/$($utilityModules.Count) loaded successfully" -Level "INFO"
    if ($failedUtilities.Count -gt 0) {
        Write-OrchestratorLog -Message "Failed utility modules: $($failedUtilities -join ', ')" -Level "ERROR"
        if ("ErrorHandling" -in $failedUtilities) {
            throw "Critical utility module 'ErrorHandling' failed to load. Cannot continue without Invoke-WithTimeout function."
        }
    }
    
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
}

function Load-DiscoveryModules {
    Write-OrchestratorLog -Message "Loading discovery modules..." -Level "INFO"
    
    Write-OrchestratorLog -Message "Raw enabledSources type: $($global:MandA.Config.discovery.enabledSources.GetType().FullName)" -Level "DEBUG" -DebugOnly
    Write-OrchestratorLog -Message "Raw enabledSources content: $($global:MandA.Config.discovery.enabledSources | ConvertTo-Json -Compress)" -Level "DEBUG" -DebugOnly
    
    $enabledSources = (Get-ModuleContext).Config.discovery.enabledSources
    if ($null -eq $enabledSources) {
        Write-OrchestratorLog -Message "enabledSources is null, using empty array" -Level "WARN"
        $enabledSources = @()
    } elseif ($enabledSources -is [System.Collections.Hashtable]) {
        Write-OrchestratorLog -Message "Converting enabledSources from Hashtable to array of keys" -Level "WARN"
        $enabledSources = @($enabledSources.Keys)
    } elseif ($enabledSources -is [PSCustomObject]) {
        Write-OrchestratorLog -Message "Converting enabledSources from PSCustomObject to array of property names" -Level "WARN"
        $enabledSources = @($enabledSources.PSObject.Properties.Name)
    } elseif ($enabledSources -isnot [array]) {
        Write-OrchestratorLog -Message "Converting single enabledSource to array" -Level "DEBUG"
        $enabledSources = @($enabledSources)
    }
    
    Write-OrchestratorLog -Message "Loading discovery modules for $($enabledSources.Count) sources" -Level "INFO"
    Write-OrchestratorLog -Message "Enabled sources: $($enabledSources -join ', ')" -Level "DEBUG"
    
    $loadedCount = 0
    $failedModules = @()
    
    foreach ($source in $enabledSources) {
        if ($source -isnot [string]) {
            Write-OrchestratorLog -Message "Skipping invalid source type: $($source.GetType().Name) with value: $source" -Level "WARN"
            continue
        }
        
        $modulePath = Join-Path (Get-ModuleContext).Paths.Discovery "${source}Discovery.psm1"
        Write-OrchestratorLog -Message "Attempting to load: $modulePath" -Level "DEBUG" -DebugOnly
        
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global -ErrorAction Stop
                $loadedCount++
                Write-OrchestratorLog -Message "Successfully loaded discovery module: $source" -Level "DEBUG"
                
                Write-OrchestratorLog -Message "DiscoveryResult class should be globally available to ${source}Discovery module" -Level "DEBUG" -DebugOnly
                
                $moduleLoaded = Get-Module -Name "${source}Discovery" -ErrorAction SilentlyContinue
                if ($moduleLoaded) {
                    Write-OrchestratorLog -Message "Module verified: $source (Version: $($moduleLoaded.Version))" -Level "DEBUG" -DebugOnly
                }
            } catch {
                $failedModules += $source
                Add-OrchestratorError -Source "ModuleLoader" `
                    -Message "Failed to load discovery module $source" `
                    -Exception $_.Exception `
                    -Severity "Warning"
            }
        } else {
            $failedModules += $source
            Add-OrchestratorError -Source "ModuleLoader" `
                -Message "Discovery module not found: $modulePath" `
                -Severity "Warning"
        }
    }
    
    Write-OrchestratorLog -Message "Discovery module loading complete: $loadedCount/$($enabledSources.Count) loaded successfully" -Level "INFO"
    if ($failedModules.Count -gt 0) {
        Write-OrchestratorLog -Message "Failed modules: $($failedModules -join ', ')" -Level "WARN"
    }
}

function Load-ProcessingModules {
    Write-OrchestratorLog -Message "Loading processing modules..." -Level "INFO"
    
    $processingModules = @(
        "DataAggregation",
        "UserProfileBuilder",
        "WaveGeneration",
        "DataValidation"
    )
    
    $loadedCount = 0
    foreach ($module in $processingModules) {
        $modulePath = Join-Path (Get-ModuleContext).Paths.Processing "$module.psm1"
        Write-OrchestratorLog -Message "Checking processing module: $modulePath" -Level "DEBUG" -DebugOnly
        
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
        } else {
            Write-OrchestratorLog -Message "Processing module not found: $module" -Level "WARN"
        }
    }
    
    Write-OrchestratorLog -Message "Processing module loading complete: $loadedCount/$($processingModules.Count) loaded" -Level "INFO"
}

function Load-ExportModules {
    Write-OrchestratorLog -Message "Loading export modules..." -Level "INFO"
    
    $enabledFormats = (Get-ModuleContext).Config.export.formats
    if ($enabledFormats -isnot [array]) {
        $enabledFormats = @($enabledFormats)
    }
    
    Write-OrchestratorLog -Message "Export formats enabled: $($enabledFormats -join ', ')" -Level "DEBUG"
    
    $formatMapping = @{
        "CSV" = "CSVExport"
        "JSON" = "JSONExport"
        "Excel" = "ExcelExport"
        "CompanyControlSheet" = "CompanyControlSheetExporter"
        "PowerApps" = "PowerAppsExporter"
    }
    
    $loadedCount = 0
    foreach ($format in $enabledFormats) {
        if ($formatMapping.ContainsKey($format)) {
            $moduleName = $formatMapping[$format]
            $modulePath = Join-Path (Get-ModuleContext).Paths.Export "$moduleName.psm1"
            
            Write-OrchestratorLog -Message "Loading export module for $format`: $modulePath" -Level "DEBUG" -DebugOnly
            
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
            } else {
                Write-OrchestratorLog -Message "Export module not found: $moduleName" -Level "WARN"
            }
        } else {
            Write-OrchestratorLog -Message "No module mapping for export format: $format" -Level "WARN"
        }
    }
    
    Write-OrchestratorLog -Message "Export module loading complete: $loadedCount/$($enabledFormats.Count) loaded" -Level "INFO"
}

function Load-AuthenticationModules {
    Write-OrchestratorLog -Message "Loading authentication modules..." -Level "INFO"
    
    $authModules = @(
        "Authentication",
        "CredentialManagement"
    )
    
    $loadedCount = 0
    $failedModules = @()
    
    foreach ($module in $authModules) {
        $modulePath = Join-Path (Get-ModuleContext).Paths.Authentication "$module.psm1"
        Write-OrchestratorLog -Message "Loading authentication module: $modulePath" -Level "DEBUG" -DebugOnly
        
        if (Test-Path $modulePath) {
            try {
                Import-Module $modulePath -Force -Global -ErrorAction Stop
                $loadedCount++
                Write-OrchestratorLog -Message "Successfully loaded authentication module: $module" -Level "SUCCESS"
            } catch {
                $failedModules += $module
                Add-OrchestratorError -Source "ModuleLoader" `
                    -Message "Failed to load authentication module $module" `
                    -Exception $_.Exception `
                    -Severity "Critical"
            }
        } else {
            $failedModules += $module
            Write-OrchestratorLog -Message "Authentication module not found: $modulePath" -Level "ERROR"
        }
    }
    
    Write-OrchestratorLog -Message "Authentication module loading complete: $loadedCount/$($authModules.Count) loaded" -Level "INFO"
    if ($failedModules.Count -gt 0) {
        Write-OrchestratorLog -Message "Failed authentication modules: $($failedModules -join ', ')" -Level "ERROR"
        throw "Critical authentication modules failed to load. Cannot continue."
    }
}

function Test-ModuleLoadStatus {
    <#
    .SYNOPSIS
        Validates that all required modules have been successfully loaded
    .DESCRIPTION
        Checks for the presence of critical modules and throws an error if any are missing.
        Only validates modules that are actually needed for the current execution mode.
    #>
    param(
        [string]$Mode = "Full"
    )
    
    Write-OrchestratorLog -Message "Validating module load status for mode: $Mode..." -Level "INFO"
    
    $requiredModules = @()
    
    if ($Mode -in @("Discovery", "Full", "AzureOnly")) {
        $requiredModules += @(
            'ActiveDirectoryDiscovery',
            'GraphDiscovery'
        )
    }
    
    if ($Mode -in @("Processing", "Full", "AzureOnly")) {
        $requiredModules += @(
            'DataAggregation'
        )
    }
    
    if ($Mode -in @("Export", "Full", "AzureOnly")) {
        $requiredModules += @(
            'CSVExport'
        )
    }
    
    Write-OrchestratorLog -Message "Checking $($requiredModules.Count) required modules for mode '$Mode'" -Level "DEBUG"
    
    $failedModules = @()
    
    foreach ($module in $requiredModules) {
        $loadedModule = Get-Module -Name $module -ErrorAction SilentlyContinue
        if (-not $loadedModule) {
            $failedModules += $module
            Write-OrchestratorLog -Message "Critical module '$module' not loaded" -Level "ERROR"
        } else {
            Write-OrchestratorLog -Message "Module '$module' loaded successfully (Version: $($loadedModule.Version))" -Level "DEBUG" -DebugOnly
        }
    }
    
    if ($failedModules.Count -gt 0) {
        $errorMessage = "Critical module(s) failed to load for mode '$Mode': $($failedModules -join ', ')"
        Add-OrchestratorError -Source "ModuleValidation" `
            -Message $errorMessage `
            -Severity "Critical"
        throw $errorMessage
    }
    
    Write-OrchestratorLog -Message "All required modules for mode '$Mode' loaded successfully" -Level "SUCCESS"
}

#===============================================================================
#                       ERROR REPORTING FUNCTIONS
#===============================================================================

function Export-ErrorReport {
    param(
        [hashtable]$PhaseResult
    )

    # Fix: Count actual module results, not empty collections
    $actualModuleResults = $PhaseResult.ModuleResults.Values | Where-Object { $_ -ne $null }
    $successfulModules = ($actualModuleResults | Where-Object { $_.Success -eq $true }).Count

    if ($PhaseResult.CriticalErrors.Count -eq 0 -and $PhaseResult.RecoverableErrors.Count -eq 0 -and $PhaseResult.Warnings.Count -eq 0) {
        Write-OrchestratorLog -Message "No errors or warnings to report" -Level "SUCCESS"
        return
    }

    $errorReport = @{
        Timestamp = Get-Date
        ExecutionId = [guid]::NewGuid().ToString()
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
    }

    # Add detailed module results
    foreach ($moduleName in $PhaseResult.ModuleResults.Keys) {
        $moduleResult = $PhaseResult.ModuleResults[$moduleName]
        if ($moduleResult -ne $null) {
            $errorReport.ModuleResults[$moduleName] = @{
                Success = $moduleResult.Success
                ModuleName = $moduleResult.ModuleName
                StartTime = $moduleResult.StartTime
                EndTime = $moduleResult.EndTime
                Duration = if ($moduleResult.Metadata -and $moduleResult.Metadata.Duration) { $moduleResult.Metadata.Duration } else { $null }
                ErrorCount = $moduleResult.Errors.Count
                WarningCount = $moduleResult.Warnings.Count
                ExecutionId = $moduleResult.ExecutionId
            }
        }
    }

    # Export to file
    $errorReportPath = Join-Path $global:MandA.Paths.LogOutput "DiscoveryErrorReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $errorReport | ConvertTo-Json -Depth 10 | Set-Content -Path $errorReportPath -Encoding UTF8

    Write-OrchestratorLog -Message "Error report exported: $errorReportPath" -Level "INFO"

    # Log summary to console
    Write-OrchestratorLog -Message "--- ERROR SUMMARY ---" -Level "HEADER"
    Write-OrchestratorLog -Message "Critical Errors: $($errorReport.Summary.CriticalErrors)" -Level $(if ($errorReport.Summary.CriticalErrors -gt 0) { "ERROR" } else { "SUCCESS" })
    Write-OrchestratorLog -Message "Recoverable Errors: $($errorReport.Summary.RecoverableErrors)" -Level $(if ($errorReport.Summary.RecoverableErrors -gt 0) { "WARN" } else { "SUCCESS" })
    Write-OrchestratorLog -Message "Warnings: $($errorReport.Summary.Warnings)" -Level $(if ($errorReport.Summary.Warnings -gt 0) { "WARN" } else { "SUCCESS" })
    Write-OrchestratorLog -Message "Successful Modules: $($errorReport.Summary.SuccessfulModules)/$($errorReport.Summary.TotalModules)" -Level "INFO"

    # Add more detailed breakdown
    if ($errorReport.Summary.TotalModules -eq 0) {
        Write-OrchestratorLog -Message "Note: No modules were executed (likely due to smart completion - data already exists)" -Level "INFO"
    }
}

#===============================================================================
#                       PHASE EXECUTION FUNCTIONS
#===============================================================================

function Invoke-DiscoveryPhase {
    [CmdletBinding()]
    param()

    Write-OrchestratorLog -Message "STARTING DISCOVERY PHASE (Parallel Execution Engine v3.0 FINAL)" -Level "HEADER"
    
    # --- 1. Authentication and Connection (No changes needed here) ---
    try {
        Write-OrchestratorLog -Message "Initializing authentication and connections..." -Level "INFO"
        $authResult = Initialize-MandAAuthentication -Configuration $global:MandA.Config
        if (-not $authResult.Authenticated) { throw "Authentication failed: $($authResult.Error)" }
        $authContext = Get-AuthenticationContext
        $connections = Initialize-AllConnections -Configuration $global:MandA.Config -AuthContext $authContext
        Write-OrchestratorLog -Message "Authentication and connections successful." -Level "SUCCESS"
    } catch {
        Add-OrchestratorError -Source "DiscoveryPhase-Setup" -Message "Critical setup failure" -Exception $_.Exception -Severity "Critical"
        return @{ Success = $false; ModuleResults = @{}; CriticalErrors = @(($_)); RecoverableErrors = @(); Warnings = @() }
    }

    # --- 2. Determine which modules to run (No changes needed here) ---
    $phaseResult = @{
        Success = $true; ModuleResults = [System.Collections.Concurrent.ConcurrentDictionary[string,object]]::new()
        CriticalErrors = [System.Collections.ArrayList]::new(); RecoverableErrors = [System.Collections.ArrayList]::new(); Warnings = [System.Collections.ArrayList]::new()
    }
    $enabledSources = (Get-ModuleContext).Config.discovery.enabledSources
    $sourcesToRun = @($enabledSources | Where-Object {
        if ($Force) { return $true }
        $status = Test-ModuleCompletionStatus -ModuleName $_ -Context $global:MandA
        if ($status.ShouldRun) { Write-OrchestratorLog -Message "Queuing module [$_]: $($status.Reason)" -Level "INFO"; return $true }
        else { Write-OrchestratorLog -Message "Skipping module [$_]: $($status.Reason)" -Level "SUCCESS"; return $false }
    })
    
    if ($sourcesToRun.Count -eq 0) { Write-OrchestratorLog -Message "No modules to run (all tasks completed)." -Level "SUCCESS"; return $phaseResult }
    Write-OrchestratorLog -Message "Queuing $($sourcesToRun.Count) modules for parallel execution." -Level "INFO"

    # --- 3. Setup the Runspace Pool (CORRECTED LOGIC) ---
    $maxConcurrentJobs = (Get-ModuleContext).Config.discovery.maxConcurrentJobs
    
    # Create the session state configuration FIRST.
    $sessionState = [System.Management.Automation.Runspaces.InitialSessionState]::CreateDefault()
    $sessionState.Types.Add([System.Management.Automation.Runspaces.SessionStateTypeEntry]::new([DiscoveryResult]))
    
    $utilityModules = @(
        (Join-Path $global:MandA.Paths.Utilities "EnhancedLogging.psm1"),
        (Join-Path $global:MandA.Paths.Utilities "ProgressDisplay.psm1"),
        (Join-Path $global:MandA.Paths.Utilities "ErrorHandling.psm1")
    )
    $sessionState.ImportPSModule($utilityModules)

    # Now, create the RunspacePool and PASS the session state to the constructor.
    $pool = [runspacefactory]::CreateRunspacePool($sessionState, 1, $maxConcurrentJobs)
    $pool.Open()

    # --- 4. Create and Run Jobs in Parallel (No changes needed here) ---
    $jobs = @()
    foreach ($moduleName in $sourcesToRun) {
        $powershell = [powershell]::Create()
        $powershell.RunspacePool = $pool
        
        $scriptBlock = {
            param($modName, $modConfig, $globalContext)
            $global:MandA = $globalContext
            $discoveryModulePath = Join-Path $global:MandA.Paths.Discovery "${modName}Discovery.psm1"
            Import-Module -Name $discoveryModulePath -Force
            Invoke-Command -ScriptBlock (Get-Command "Invoke-${modName}Discovery") -ArgumentList @($modConfig, $global:MandA)
        }
        
        $null = $powershell.AddScript($scriptBlock).AddArgument($moduleName).AddArgument($global:MandA.Config).AddArgument($global:MandA)
        $jobs += @{ ModuleName = $moduleName; Instance = $powershell; Handle = $powershell.BeginInvoke() }
    }

    # --- 5. Collect Results Asynchronously (No changes needed here) ---
    Write-OrchestratorLog -Message "All jobs submitted ($($jobs.Count) total). Waiting for completion..." -Level "INFO"
    while ($jobs.Count -gt 0) {
        $completedHandle = [System.Management.Automation.Runspaces.AsyncResult]::WaitAny($jobs.Handle, 60000)
        if ($completedHandle -eq -1) { continue }

        $completedJob = $jobs[$completedHandle]
        $moduleName = $completedJob.ModuleName
        
        try {
            $moduleResult = $completedJob.Instance.EndInvoke($completedJob.Handle)[0]
            if ($moduleResult -is [DiscoveryResult]) {
                $phaseResult.ModuleResults[$moduleName] = $moduleResult
                $logLevel = if ($moduleResult.Success) { "SUCCESS" } else { "WARN" }
                Write-OrchestratorLog -Message "Completed discovery for $moduleName. Success: $($moduleResult.Success)" -Level $logLevel
            } else { throw "Module returned an invalid result object. Type: $($moduleResult.GetType().Name)" }
        } catch {
            $errorMessage = $_.Exception.Message
            Write-OrchestratorLog -Message "Catastrophic failure in $moduleName discovery: $errorMessage" -Level "ERROR"
            $failedResult = [DiscoveryResult]::new($moduleName); $failedResult.AddError($_.Exception, "Runspace Failure"); $failedResult.Complete()
            $phaseResult.ModuleResults[$moduleName] = $failedResult
        } finally {
            $completedJob.Instance.Dispose()
            $jobs = $jobs | Where-Object { $_.Handle -ne $completedJob.Handle }
        }
    }
    
    # --- 6. Cleanup and Final Report (No changes needed here) ---
    $pool.Close(); $pool.Dispose()
    Export-ErrorReport -PhaseResult $phaseResult
    return $phaseResult
}


function Invoke-ProcessingPhase {
    Write-OrchestratorLog -Message "STARTING PROCESSING PHASE" -Level "HEADER"
    
    $phaseResult = @{
        Success = $true
        ProcessedFiles = @()
    }
    
    try {
        # Verify raw data exists
        $rawDataPath = $global:MandA.Paths.RawDataOutput
        Write-OrchestratorLog -Message "Checking raw data path: $rawDataPath" -Level "DEBUG" -DebugOnly
        
        if (-not (Test-Path $rawDataPath)) {
            throw "Raw data directory not found. Run Discovery phase first."
        }
        
        $csvFiles = Get-ChildItem -Path $rawDataPath -Filter "*.csv" -File
        if ($csvFiles.Count -eq 0) {
            throw "No raw data files found. Run Discovery phase first."
        }
        
        Write-OrchestratorLog -Message "Found $($csvFiles.Count) raw data files to process" -Level "INFO"
        
        if ($script:DebugMode) {
            Write-OrchestratorLog -Message "Raw data files:" -Level "DEBUG"
            foreach ($file in $csvFiles) {
                Write-OrchestratorLog -Message "  - $($file.Name) ($([math]::Round($file.Length/1KB, 2)) KB)" -Level "DEBUG"
            }
        }
        
        # Execute data aggregation
        if (Get-Command Start-DataAggregation -ErrorAction SilentlyContinue) {
            Write-OrchestratorLog -Message "Starting data aggregation..." -Level "INFO"
            
            # FIX: Explicitly pass the full global context to the function.
            $aggregationResult = Start-DataAggregation -Configuration $global:MandA.Config -Context $global:MandA
            
            if (-not $aggregationResult) {
                throw "Data aggregation failed"
            }
            
            # Get processed files
            $processedPath = $global:MandA.Paths.ProcessedDataOutput
            $phaseResult.ProcessedFiles = Get-ChildItem -Path $processedPath -Filter "*.csv" -File
            
            Write-OrchestratorLog -Message "Processing completed: $($phaseResult.ProcessedFiles.Count) files generated" `
                -Level "SUCCESS"
            
            if ($script:DebugMode) {
                Write-OrchestratorLog -Message "Processed files:" -Level "DEBUG"
                foreach ($file in $phaseResult.ProcessedFiles) {
                    Write-OrchestratorLog -Message "  - $($file.Name) ($([math]::Round($file.Length/1KB, 2)) KB)" -Level "DEBUG"
                }
            }
            
        } else {
            throw "Start-DataAggregation function not found. Ensure DataAggregation module is loaded."
        }
        
    } catch {
        $phaseResult.Success = $false
        Add-OrchestratorError -Source "ProcessingPhase" `
            -Message "Processing phase failed: $_" `
            -Exception $_.Exception `
            -Severity "Critical"
    }
    
    return $phaseResult
}

function Invoke-ExportPhase {
    Write-OrchestratorLog -Message "STARTING EXPORT PHASE" -Level "HEADER"
    
    $phaseResult = @{
        Success = $true
        ExportedFormats = @()
    }
    
    try {
        # Load processed data
        $processedPath = $global:MandA.Paths.ProcessedDataOutput
        Write-OrchestratorLog -Message "Loading processed data from: $processedPath" -Level "DEBUG" -DebugOnly
        
        if (-not (Test-Path $processedPath)) {
            throw "Processed data directory not found. Run Processing phase first."
        }
        
        $dataToExport = @{}
        $processedFiles = Get-ChildItem -Path $processedPath -Filter "*.csv" -File
        
        Write-OrchestratorLog -Message "Found $($processedFiles.Count) processed files to export" -Level "INFO"
        
        foreach ($file in $processedFiles) {
            try {
                Write-OrchestratorLog -Message "Loading file: $($file.Name)" -Level "DEBUG" -DebugOnly
                $dataToExport[$file.BaseName] = Import-Csv -Path $file.FullName -Encoding UTF8
                
                if ($script:DebugMode) {
                    $recordCount = $dataToExport[$file.BaseName].Count
                    Write-OrchestratorLog -Message "  Loaded $recordCount records from $($file.BaseName)" -Level "DEBUG"
                }
            } catch {
                Add-OrchestratorError -Source "ExportPhase" `
                    -Message "Failed to load $($file.Name): $_" `
                    -Exception $_.Exception `
                    -Severity "Warning"
            }
        }
        
        # Execute exports
        $enabledFormats = (Get-ModuleContext).Config.export.formats
        if ($enabledFormats -isnot [array]) {
            $enabledFormats = @($enabledFormats)
        }
        
        Write-OrchestratorLog -Message "Export formats to process: $($enabledFormats -join ', ')" -Level "INFO"
        
        foreach ($format in $enabledFormats) {
            $functionMapping = @{
                "CSV" = "Export-ToCSV"
                "JSON" = "Export-ToJSON"
                "Excel" = "Export-ToExcel"
                "PowerApps" = "Export-ForPowerApps"
                "CompanyControlSheet" = "Export-ToCompanyControlSheet"
            }
            
            $functionName = $functionMapping[$format]
            Write-OrchestratorLog -Message "Looking for export function: $functionName" -Level "DEBUG" -DebugOnly
            
            if (Get-Command $functionName -ErrorAction SilentlyContinue) {
                try {
                    Write-OrchestratorLog -Message "Exporting to format: $format" -Level "INFO"
                    & $functionName -ProcessedData $dataToExport -Configuration $global:MandA.Config
                    $phaseResult.ExportedFormats += $format
                    Write-OrchestratorLog -Message "Export completed: $format" -Level "SUCCESS"
                    
                } catch {
                    Add-OrchestratorError -Source "Export_$format" `
                        -Message "Export failed: $_" `
                        -Exception $_.Exception
                }
            } else {
                Add-OrchestratorError -Source "Export_$format" `
                    -Message "Export function not found: $functionName" `
                    -Severity "Warning"
            }
        }
        
        if ($phaseResult.ExportedFormats.Count -eq 0) {
            throw "No formats were successfully exported"
        }
        
        Write-OrchestratorLog -Message "Export phase completed: $($phaseResult.ExportedFormats -join ', ')" -Level "SUCCESS"
        
        # Validate export completeness
        try {
            Write-OrchestratorLog -Message "Validating export completeness..." -Level "INFO"
            $validationResult = Test-ExportCompleteness -ProcessedData $dataToExport `
                -ExportPath $global:MandA.Paths.ExportOutput `
                -Configuration $global:MandA.Config
            
            $phaseResult.ValidationResult = $validationResult
            
            if ($validationResult.Success) {
                Write-OrchestratorLog -Message "Export validation passed: All required files present and valid" -Level "SUCCESS"
            } else {
                Write-OrchestratorLog -Message "Export validation failed: Some required files are missing" -Level "ERROR"
                $phaseResult.Success = $false
            }
            
            # Add validation summary to phase result
            $phaseResult.ValidationSummary = @{
                ValidatedFiles = $validationResult.ValidatedFiles.Count
                MissingFiles = $validationResult.MissingFiles.Count
                EmptyFiles = $validationResult.EmptyFiles.Count
                Warnings = $validationResult.Warnings.Count
            }
            
        } catch {
            Write-OrchestratorLog -Message "Export validation encountered an error: $_" -Level "WARN"
            Add-OrchestratorError -Source "ExportValidation" `
                -Message "Export validation failed: $_" `
                -Exception $_.Exception `
                -Severity "Warning"
            
            # Don't fail the entire export phase if validation fails, but log it
            $phaseResult.ValidationResult = @{
                Success = $false
                Error = $_.Exception.Message
                MissingFiles = @()
                EmptyFiles = @()
                ValidatedFiles = @()
                Warnings = @("Validation process failed: $($_.Exception.Message)")
            }
        }
        
    } catch {
        $phaseResult.Success = $false
        Add-OrchestratorError -Source "ExportPhase" `
            -Message "Export phase failed: $_" `
            -Exception $_.Exception `
            -Severity "Critical"
    }
    
    return $phaseResult
}

function Test-ExportCompleteness {
    <#
    .SYNOPSIS
        Validates that all required export files have been successfully created
    .DESCRIPTION
        Checks for the presence of critical export files and validates their content
    .PARAMETER ProcessedData
        The processed data hashtable used for export
    .PARAMETER ExportPath
        The base export path where files should be located
    .PARAMETER Configuration
        The configuration hashtable containing export settings
    #>
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ProcessedData,
        
        [Parameter(Mandatory=$true)]
        [string]$ExportPath,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )
    
    Write-OrchestratorLog -Message "Starting export completeness validation..." -Level "INFO"
    
    $validationResult = @{
        Success = $true
        MissingFiles = @()
        EmptyFiles = @()
        ValidatedFiles = @()
        Warnings = @()
    }
    
    # Define required exports based on enabled formats
    $enabledFormats = $Configuration.export.formats
    if ($enabledFormats -isnot [array]) {
        $enabledFormats = @($enabledFormats)
    }
    
    $requiredExports = @{}
    
    # CSV exports
    if ("CSV" -in $enabledFormats) {
        $csvPath = Join-Path $ExportPath "Processed"
        $requiredExports['UserProfiles.csv'] = { Test-Path (Join-Path $csvPath 'UserProfiles.csv') }
        $requiredExports['MigrationWaves.csv'] = { Test-Path (Join-Path $csvPath 'MigrationWaves.csv') }
        $requiredExports['ComplexityAnalysis.csv'] = { Test-Path (Join-Path $csvPath 'ComplexityAnalysis.csv') }
        $requiredExports['DataQualityIssues.csv'] = { Test-Path (Join-Path $csvPath 'DataQualityIssues.csv') }
    }
    
    # JSON exports
    if ("JSON" -in $enabledFormats) {
        $jsonPath = Join-Path $ExportPath "Exports\JSON"
        $requiredExports['UserProfiles.json'] = { Test-Path (Join-Path $jsonPath 'UserProfiles.json') }
        $requiredExports['MigrationWaves.json'] = { Test-Path (Join-Path $jsonPath 'MigrationWaves.json') }
        $requiredExports['ComplexityAnalysis.json'] = { Test-Path (Join-Path $jsonPath 'ComplexityAnalysis.json') }
    }
    
    # PowerApps exports
    if ("PowerApps" -in $enabledFormats) {
        $powerAppsPath = Join-Path $ExportPath "Processed\PowerApps"
        $requiredExports['powerapps_users.json'] = { Test-Path (Join-Path $powerAppsPath 'powerapps_users.json') }
        $requiredExports['powerapps_companies.json'] = { Test-Path (Join-Path $powerAppsPath 'powerapps_companies.json') }
        $requiredExports['powerapps_waves.json'] = { Test-Path (Join-Path $powerAppsPath 'powerapps_waves.json') }
        $requiredExports['powerapps_departments.json'] = { Test-Path (Join-Path $powerAppsPath 'powerapps_departments.json') }
        $requiredExports['powerapps_index.json'] = { Test-Path (Join-Path $powerAppsPath 'powerapps_index.json') }
    }
    
    # Excel exports
    if ("Excel" -in $enabledFormats) {
        $excelPath = Join-Path $ExportPath "Exports\Excel"
        $excelFiles = if (Test-Path $excelPath) { Get-ChildItem -Path $excelPath -Filter "*.xlsx" } else { @() }
        if ($excelFiles.Count -eq 0) {
            $requiredExports['MigrationReport.xlsx'] = { $false }
        } else {
            $requiredExports['MigrationReport.xlsx'] = { $true }
        }
    }
    
    # Check for missing files
    $missing = @()
    foreach ($export in $requiredExports.Keys) {
        if (-not (& $requiredExports[$export])) {
            $missing += $export
            $validationResult.MissingFiles += $export
        } else {
            $validationResult.ValidatedFiles += $export
            Write-OrchestratorLog -Message "Export file validated: $export" -Level "DEBUG" -DebugOnly
        }
    }
    
    # Check for empty files
    foreach ($validatedFile in $validationResult.ValidatedFiles) {
        try {
            $filePath = $null
            
            if ($validatedFile.EndsWith('.csv')) {
                $filePath = Join-Path (Join-Path $ExportPath "Processed") $validatedFile
            } elseif ($validatedFile.StartsWith('powerapps_')) {
                $filePath = Join-Path (Join-Path $ExportPath "Processed\PowerApps") $validatedFile
            } elseif ($validatedFile.EndsWith('.json')) {
                $filePath = Join-Path (Join-Path $ExportPath "Exports\JSON") $validatedFile
            } elseif ($validatedFile.EndsWith('.xlsx')) {
                $excelPath = Join-Path $ExportPath "Exports\Excel"
                $excelFiles = Get-ChildItem -Path $excelPath -Filter "*.xlsx" | Select-Object -First 1
                if ($excelFiles) {
                    $filePath = $excelFiles.FullName
                }
            }
            
            if ($filePath -and (Test-Path $filePath)) {
                $fileInfo = Get-Item $filePath
                
                if ($fileInfo.Length -lt 10) {
                    $validationResult.EmptyFiles += $validatedFile
                    $validationResult.Warnings += "File appears to be empty or corrupted: $validatedFile ($($fileInfo.Length) bytes)"
                    Write-OrchestratorLog -Message "Warning: Export file appears empty: $validatedFile" -Level "WARN"
                }
                
                if ($validatedFile.EndsWith('.json')) {
                    try {
                        $content = Get-Content $filePath -Raw
                        $null = $content | ConvertFrom-Json
                        Write-OrchestratorLog -Message "JSON structure validated: $validatedFile" -Level "DEBUG" -DebugOnly
                    } catch {
                        $validationResult.EmptyFiles += $validatedFile
                        $validationResult.Warnings += "Invalid JSON structure in file: $validatedFile"
                        Write-OrchestratorLog -Message "Warning: Invalid JSON in export file: $validatedFile" -Level "WARN"
                    }
                }
                
                if ($validatedFile.EndsWith('.csv')) {
                    try {
                        $csvContent = Import-Csv $filePath -ErrorAction Stop
                        if ($csvContent.Count -eq 0) {
                            $validationResult.Warnings += "CSV file has no data rows: $validatedFile"
                            Write-OrchestratorLog -Message "Warning: CSV file has no data: $validatedFile" -Level "WARN"
                        }
                    } catch {
                        $validationResult.EmptyFiles += $validatedFile
                        $validationResult.Warnings += "Invalid CSV structure in file: $validatedFile"
                        Write-OrchestratorLog -Message "Warning: Invalid CSV in export file: $validatedFile" -Level "WARN"
                    }
                }
            }
        } catch {
            $validationResult.Warnings += "Error validating file $validatedFile`: $($_.Exception.Message)"
            Write-OrchestratorLog -Message "Error validating export file $validatedFile`: $_" -Level "WARN"
        }
    }
    
    if ($missing.Count -gt 0) {
        $validationResult.Success = $false
        $errorMessage = "Missing required exports: $($missing -join ', ')"
        Write-OrchestratorLog -Message $errorMessage -Level "ERROR"
        
        Add-OrchestratorError -Source "ExportValidation" `
            -Message $errorMessage `
            -Severity "Critical" `
            -Context @{
                MissingFiles = $missing
                EnabledFormats = $enabledFormats
                ExportPath = $ExportPath
            }
        
        throw $errorMessage
    }
    
    $successCount = $validationResult.ValidatedFiles.Count
    $warningCount = $validationResult.Warnings.Count
    $emptyCount = $validationResult.EmptyFiles.Count
    
    Write-OrchestratorLog -Message "Export validation completed: $successCount files validated, $warningCount warnings, $emptyCount empty/invalid files" -Level "INFO"
    
    if ($warningCount -gt 0) {
        Write-OrchestratorLog -Message "Export validation warnings:" -Level "WARN"
        foreach ($warning in $validationResult.Warnings) {
            Write-OrchestratorLog -Message "  - $warning" -Level "WARN"
        }
    }
    
    if ($emptyCount -eq 0 -and $warningCount -eq 0) {
        Write-OrchestratorLog -Message "All export files validated successfully" -Level "SUCCESS"
    }
    
    return $validationResult
}

#===============================================================================
#                       MAIN EXECUTION
#===============================================================================

try {
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "M&A Discovery Suite Orchestrator v6.1.0-DEBUG" -Level "HEADER"
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "Company: $CompanyName | Mode: $Mode" -Level "INFO"
    
    if (-not (Test-OrchestratorPrerequisites)) {
        throw "Prerequisites validation failed"
    }

    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "CHECKING MODULE PREREQUISITES" -Level "HEADER"
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"

    $moduleCheckScript = Join-Path (Get-ModuleContext).Paths.Scripts "DiscoverySuiteModuleCheck.ps1"
    if (Test-Path $moduleCheckScript) {
        Write-OrchestratorLog -Message "Running module prerequisites check..." -Level "INFO"
        
        try {
            $moduleCheckOutput = & $moduleCheckScript 2>&1
            $moduleCheckExitCode = $LASTEXITCODE
            
            switch ($moduleCheckExitCode) {
                0 { Write-OrchestratorLog -Message "All modules OK - proceeding" -Level "SUCCESS" }
                1 {
                    Write-OrchestratorLog -Message "Some optional modules missing - proceeding with reduced functionality" -Level "WARN"
                    Write-OrchestratorLog -Message "DFS discovery will be skipped due to missing DfsMgmt module" -Level "INFO"
                }
                2 {
                    Write-OrchestratorLog -Message "CRITICAL modules missing - cannot proceed" -Level "ERROR"
                    throw "Critical module prerequisites not met"
                }
                default { Write-OrchestratorLog -Message "Unknown module check result - proceeding with caution" -Level "WARN" }
            }
            
        } catch {
            if ($_.Exception.Message -like "*Critical module prerequisites not met*") {
                throw $_
            } else {
                Write-OrchestratorLog -Message "Error running module check: $_" -Level "ERROR"
                Write-OrchestratorLog -Message "Continuing anyway (not recommended)" -Level "WARN"
            }
        }
    } else {
        Write-OrchestratorLog -Message "Module check script not found at: $moduleCheckScript" -Level "WARN"
        Write-OrchestratorLog -Message "Skipping module prerequisites validation (not recommended)" -Level "WARN"
    }

    $config = $global:MandA.Config
    if (-not [string]::IsNullOrWhiteSpace($ConfigurationFile)) {
        Write-OrchestratorLog -Message "Loading custom configuration file: $ConfigurationFile" -Level "INFO"
        
        $configPath = if ([System.IO.Path]::IsPathRooted($ConfigurationFile)) {
            $ConfigurationFile
        } else {
            Join-Path $global:MandA.Paths.Configuration $ConfigurationFile
        }
        
        if (Test-Path $configPath) {
            Write-OrchestratorLog -Message "Loading configuration: $configPath" -Level "INFO"
            try {
                $configContent = Get-Content $configPath -Raw | ConvertFrom-Json
                Write-OrchestratorLog -Message "Custom configuration loaded (merge not implemented)" -Level "WARN"
            } catch {
                Add-OrchestratorError -Source "ConfigLoader" `
                    -Message "Failed to load custom configuration" `
                    -Exception $_.Exception
            }
        } else {
            Write-OrchestratorLog -Message "Configuration file not found: $configPath" -Level "WARN"
        }
    }
    
    if ($Force) {
        Write-OrchestratorLog -Message "Force mode enabled - will re-run failed modules and skip completed ones" -Level "INFO"
        $global:MandA.Config.discovery.forceMode = $true
        $global:MandA.Config.discovery.smartForce = $true
    }
    
    if ($Mode -eq "AzureOnly") {
        Write-OrchestratorLog -Message "Azure-only mode selected" -Level "INFO"
        
        $allSources = $global:MandA.Config.discovery.enabledSources
        
        if ($allSources -is [System.Collections.Hashtable]) {
            $allSources = @($allSources.Keys)
        } elseif ($allSources -is [PSCustomObject]) {
            $allSources = @($allSources.PSObject.Properties.Name)
        } elseif ($allSources -isnot [array]) {
            $allSources = @($allSources)
        }
        
        $filteredSources = $allSources | Where-Object { $_ -in $script:AzureOnlySources }
        $global:MandA.Config.discovery.enabledSources = $filteredSources
        
        Write-OrchestratorLog -Message "Filtered to Azure sources: $($filteredSources -join ', ')" -Level "INFO"
        $Mode = "Full"
    }
    
    Initialize-OrchestratorModules -Phase $Mode
    
    Test-ModuleLoadStatus -Mode $Mode
    
    if ($ValidateOnly) {
        Write-OrchestratorLog -Message "VALIDATION-ONLY MODE" -Level "INFO"
        
        $validationPassed = $true
        
        $requiredModules = Get-Module -Name "*Discovery", "*Processing", "*Export" -ListAvailable
        Write-OrchestratorLog -Message "Available modules: $($requiredModules.Count)" -Level "INFO"
        
        $pathsToCheck = @("RawDataOutput", "ProcessedDataOutput", "ExportOutput", "LogOutput")
        foreach ($pathKey in $pathsToCheck) {
            $path = $global:MandA.Paths[$pathKey]
            if (Test-Path $path) {
                Write-OrchestratorLog -Message "Path exists: $pathKey = $path" -Level "SUCCESS"
            } else {
                Write-OrchestratorLog -Message "Path missing: $pathKey = $path" -Level "WARN"
                $validationPassed = $false
            }
        }
        
        $exitCode = if ($validationPassed) { 0 } else { 1 }
        Write-OrchestratorLog -Message "Validation complete. Exit code: $exitCode" -Level "INFO"
        exit $exitCode
    }
    
    $phaseResults = @{}
    
    $sessionId = $null
    if (Get-Command Start-PerformanceSession -ErrorAction SilentlyContinue) {
        $sessionId = Start-PerformanceSession -SessionName "MandADiscovery_$Mode" -Context $global:MandA
        Write-OrchestratorLog -Message "Started performance session: $sessionId" -Level "DEBUG"
    }
    
    try {
        switch ($Mode) {
            "Discovery" { $phaseResults.Discovery = Invoke-DiscoveryPhase }
            "Processing" { $phaseResults.Processing = Invoke-ProcessingPhase }
            "Export" { $phaseResults.Export = Invoke-ExportPhase }
            "Full" {
                $phaseResults.Discovery = Invoke-DiscoveryPhase
                if ($phaseResults.Discovery.Success) {
                    $phaseResults.Processing = Invoke-ProcessingPhase
                } else {
                    Write-OrchestratorLog -Message "Skipping Processing phase due to Discovery failure" -Level "WARN"
                }
                if ($phaseResults.Processing -and $phaseResults.Processing.Success) {
                    $phaseResults.Export = Invoke-ExportPhase
                } else {
                    Write-OrchestratorLog -Message "Skipping Export phase due to Processing failure" -Level "WARN"
                }
            }
        }
    } finally {
        if ($sessionId -and (Get-Command Stop-PerformanceSession -ErrorAction SilentlyContinue)) {
            $sessionSummary = Stop-PerformanceSession -SessionName "MandADiscovery_$Mode" -Context $global:MandA
            if ($sessionSummary) {
                Write-OrchestratorLog -Message "Performance session completed" -Level "INFO" -Data @{
                    SessionId = $sessionId
                    TotalDuration = $sessionSummary.TotalDuration
                    OperationCount = $sessionSummary.OperationCount
                    SuccessfulOperations = $sessionSummary.SuccessfulOperations
                    FailedOperations = $sessionSummary.FailedOperations
                }
                
                if (Get-Command Export-PerformanceReport -ErrorAction SilentlyContinue) {
                    try {
                        $reportPath = Export-PerformanceReport -ReportType "Summary" -Context $global:MandA
                        Write-OrchestratorLog -Message "Performance report exported: $reportPath" -Level "SUCCESS"
                    } catch {
                        Write-OrchestratorLog -Message "Failed to export performance report: $_" -Level "WARN"
                    }
                }
            }
        }
    }
    
    Write-OrchestratorLog -Message "Discovery phase completed" -Level "INFO"
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    Write-OrchestratorLog -Message "EXECUTION SUMMARY" -Level "HEADER"
    Write-OrchestratorLog -Message "========================================" -Level "HEADER"
    
    $duration = (Get-Date) - $script:StartTime
    Write-OrchestratorLog -Message "Total execution time: $($duration.ToString('hh\:mm\:ss'))" -Level "INFO"
    
    foreach ($phase in $phaseResults.Keys) {
        $result = $phaseResults[$phase]
        $status = if ($result.Success) { "SUCCESS" } else { "FAILED" }
        Write-OrchestratorLog -Message "$phase Phase: $status" -Level $(if ($result.Success) { "SUCCESS" } else { "ERROR" })
        
        if ($phase -eq "Export" -and $result.ValidationSummary) {
            $validationSummary = $result.ValidationSummary
            Write-OrchestratorLog -Message "  Export Validation: $($validationSummary.ValidatedFiles) files validated, $($validationSummary.MissingFiles) missing, $($validationSummary.EmptyFiles) empty/invalid, $($validationSummary.Warnings) warnings" -Level "INFO"
            
            if ($validationSummary.MissingFiles -gt 0) {
                Write-OrchestratorLog -Message "  WARNING: Some required export files are missing!" -Level "WARN"
            }
            if ($validationSummary.EmptyFiles -gt 0) {
                Write-OrchestratorLog -Message "  WARNING: Some export files appear to be empty or invalid!" -Level "WARN"
            }
        }
    }
    
    $criticalCount = $script:ErrorCollector.Critical.Count
    $errorCount = $script:ErrorCollector.Errors.Count
    $warningCount = $script:ErrorCollector.Warnings.Count
    
    Write-OrchestratorLog -Message "Errors - Critical: $criticalCount, Errors: $errorCount, Warnings: $warningCount" -Level "INFO"
    
    if ($criticalCount -gt 0 -or $errorCount -gt 0) {
        $errorReportPath = Join-Path $global:MandA.Paths.LogOutput "OrchestratorErrors_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        
        $errorReport = @{
            ExecutionTime = Get-Date
            Duration = $duration
            Parameters = @{
                CompanyName = $CompanyName
                Mode = $Mode
                Force = $Force.IsPresent
                ValidateOnly = $ValidateOnly.IsPresent
            }
            Environment = @{
                PowerShellVersion = $PSVersionTable.PSVersion.ToString()
                ComputerName = $env:COMPUTERNAME
                UserName = $env:USERNAME
            }
            Errors = $script:ErrorCollector
        }
        
        $errorReport | ConvertTo-Json -Depth 10 | 
            Set-Content -Path $errorReportPath -Encoding UTF8
        Write-OrchestratorLog -Message "Error report saved: $errorReportPath" -Level "INFO"
    }
    
    $shouldOfferRetry = $false
    $failedModuleCount = 0
    
    if ($phaseResults.Discovery) {
        $actualModuleResults = $phaseResults.Discovery.ModuleResults.Values | Where-Object { $_ -ne $null }
        $failedModules = $actualModuleResults | Where-Object { $_.Success -eq $false }
        $failedModuleCount = $failedModules.Count
        
        if ($failedModuleCount -gt 0 -or $criticalCount -gt 0) {
            $shouldOfferRetry = $true
        }
    }
    
    $exitCode = if ($criticalCount -gt 0) { 2 }
                elseif ($errorCount -gt 0) { 1 }
                else { 0 }
    
    Write-OrchestratorLog -Message "Orchestrator completed with exit code: $exitCode" -Level "INFO"
    
    if ($shouldOfferRetry) {
        Write-OrchestratorLog -Message "========================================" -Level "HEADER"
        Write-OrchestratorLog -Message "RETRY OPTION AVAILABLE" -Level "HEADER"
        Write-OrchestratorLog -Message "========================================" -Level "HEADER"
        
        Write-OrchestratorLog -Message "Discovery encountered $failedModuleCount failed modules and $criticalCount critical errors." -Level "WARN"
        Write-OrchestratorLog -Message "Choose retry option:" -Level "INFO"
        Write-OrchestratorLog -Message "  [1] Quick retry (reload discovery modules only, skip prerequisites)" -Level "INFO"
        Write-OrchestratorLog -Message "  [2] Full restart (reloads orchestrator + all modules from disk)" -Level "INFO"
        Write-OrchestratorLog -Message "  [N] No retry, exit with current results" -Level "INFO"
        
        Write-Host "`nRetry choice (1/2/N): " -NoNewline -ForegroundColor Yellow
        $retryChoice = Read-Host
        
        if ($retryChoice -eq "1") {
            Write-OrchestratorLog -Message "User chose quick retry. Reloading discovery modules and retrying..." -Level "INFO"
            
            try {
                Write-OrchestratorLog -Message "Quick reloading discovery modules from disk..." -Level "INFO"
                Load-DiscoveryModules
                
                Write-OrchestratorLog -Message "========================================" -Level "HEADER"
                Write-OrchestratorLog -Message "QUICK RETRY - DISCOVERY PHASE ONLY" -Level "HEADER"
                Write-OrchestratorLog -Message "========================================" -Level "HEADER"
                
                $enabledSources = (Get-ModuleContext).Config.discovery.enabledSources
                $validSources = @($enabledSources | Where-Object { $_ -is [string] })
                
                Write-OrchestratorLog -Message "Quick retry: Analyzing module completion status..." -Level "INFO"
                $sourcesToRun = @()
                
                foreach ($source in $validSources) {
                    $moduleStatus = Test-ModuleCompletionStatus -ModuleName $source -Context $global:MandA
                    
                    if ($Force -and $global:MandA.Config.discovery.forceMode) {
                        Write-OrchestratorLog -Message "Force mode: Will run $source regardless of completion status" -Level "WARN"
                        $sourcesToRun += $source
                    } elseif ($moduleStatus.ShouldRun) {
                        $sourcesToRun += $source
                        Write-OrchestratorLog -Message "Will retry $source`: $($moduleStatus.Reason)" -Level "INFO"
                    } else {
                        Write-OrchestratorLog -Message "Skipping $source`: $($moduleStatus.Reason)" -Level "SUCCESS"
                    }
                }
                
                Write-OrchestratorLog -Message "Quick retry will run $($sourcesToRun.Count) modules" -Level "INFO"
                
                $retryResult = @{
                    Success = $true
                    ModuleResults = @{}
                    CriticalErrors = [System.Collections.ArrayList]::new()
                    RecoverableErrors = [System.Collections.ArrayList]::new()
                    Warnings = [System.Collections.ArrayList]::new()
                }
                
                foreach ($source in $sourcesToRun) {
                    Write-OrchestratorLog -Message "Quick retry: Executing $source discovery..." -Level "INFO"
                    
                    try {
                        $moduleResult = Invoke-DiscoveryModule -ModuleName $source -Configuration $global:MandA.Config
                        $retryResult.ModuleResults[$source] = $moduleResult
                        
                        if (-not $moduleResult.Success) {
                            $null = $retryResult.RecoverableErrors.Add(@{
                                Source = $source
                                Errors = $moduleResult.Errors
                                Impact = "Module retry failed"
                            })
                        }
                        
                        if ($moduleResult.Warnings.Count -gt 0) {
                            $null = $retryResult.Warnings.Add(@{
                                Source = $source
                                Warnings = $moduleResult.Warnings
                            })
                        }
                    } catch {
                        Write-OrchestratorLog -Message "Quick retry failed for $source`: $_" -Level "ERROR"
                        $null = $retryResult.RecoverableErrors.Add(@{
                            Source = $source
                            Errors = @(@{
                                Message = "Module retry execution failed"
                                Exception = $_.Exception.ToString()
                            })
                            Impact = "Module could not be retried"
                        })
                    }
                }
                
                $retryActualResults = $retryResult.ModuleResults.Values | Where-Object { $_ -ne $null }
                $retrySuccessCount = ($retryActualResults | Where-Object { $_.Success -eq $true }).Count
                $retryFailCount = ($retryActualResults | Where-Object { $_.Success -eq $false }).Count
                
                Write-OrchestratorLog -Message "========================================" -Level "HEADER"
                Write-OrchestratorLog -Message "RETRY RESULTS" -Level "HEADER"
                Write-OrchestratorLog -Message "========================================" -Level "HEADER"
                
                if ($retryFailCount -eq 0) {
                    Write-OrchestratorLog -Message "Retry successful! All modules completed successfully." -Level "SUCCESS"
                    Write-OrchestratorLog -Message "Discovery retry: $retrySuccessCount successful, $retryFailCount failed" -Level "SUCCESS"
                    $exitCode = 0
                } else {
                    Write-OrchestratorLog -Message "Retry partially successful: $retrySuccessCount successful, $retryFailCount still failed" -Level "WARN"
                    $exitCode = 1
                }
                
                $phaseResults.Discovery = $retryResult
                
            } catch {
                Write-OrchestratorLog -Message "Retry attempt failed: $_" -Level "ERROR"
                Write-OrchestratorLog -Message "Original exit code will be used." -Level "WARN"
            }
        } elseif ($retryChoice -eq "2") {
            Write-OrchestratorLog -Message "User chose full restart. Restarting orchestrator to reload all files from disk..." -Level "INFO"
            
            if (Get-Command Disconnect-AllServices -ErrorAction SilentlyContinue) {
                try {
                    Write-OrchestratorLog -Message "Disconnecting services before restart..." -Level "INFO"
                    Disconnect-AllServices
                } catch {
                    Write-OrchestratorLog -Message "Error during disconnect: $_" -Level "WARN"
                }
            }
            
            $restartParams = @()
            $restartParams += "-CompanyName '$CompanyName'"
            $restartParams += "-Mode '$Mode'"
            if ($Force) { $restartParams += "-Force" }
            if ($ValidateOnly) { $restartParams += "-ValidateOnly" }
            if ($ConfigurationFile) { $restartParams += "-ConfigurationFile '$ConfigurationFile'" }
            if ($ParallelThrottle -ne 5) { $restartParams += "-ParallelThrottle $ParallelThrottle" }
            if ($DebugMode) { $restartParams += "-DebugMode" }
            
            $restartCommand = "& '$PSCommandPath' $($restartParams -join ' ')"
            
            Write-OrchestratorLog -Message "Restarting with command: $restartCommand" -Level "INFO"
            Write-OrchestratorLog -Message "========================================" -Level "HEADER"
            Write-OrchestratorLog -Message "FULL RESTART - RELOADING ALL FILES" -Level "HEADER"
            Write-OrchestratorLog -Message "========================================" -Level "HEADER"
            
            try {
                Invoke-Expression $restartCommand
                exit $LASTEXITCODE
            } catch {
                Write-OrchestratorLog -Message "Restart failed: $_" -Level "ERROR"
                Write-OrchestratorLog -Message "Continuing with original exit code." -Level "WARN"
            }
        } else {
            Write-OrchestratorLog -Message "User chose not to retry. Exiting with original results." -Level "INFO"
        }
    }
    
    Write-OrchestratorLog -Message "Final exit code: $exitCode" -Level "INFO"
    exit $exitCode
    
} catch {
    Write-OrchestratorLog -Message "FATAL ERROR: $_" -Level "CRITICAL"
    Write-OrchestratorLog -Message "Exception Type: $($_.Exception.GetType().FullName)" -Level "ERROR"
    Write-OrchestratorLog -Message "Stack Trace:" -Level "ERROR"
    Write-OrchestratorLog -Message $_.ScriptStackTrace -Level "ERROR"
    
    $crashReport = @{
        Timestamp = Get-Date
        Error = $_.Exception.Message
        ExceptionType = $_.Exception.GetType().FullName
        StackTrace = $_.ScriptStackTrace
        ScriptLineNumber = $_.InvocationInfo.ScriptLineNumber
        OffendingLine = $_.InvocationInfo.Line
        ErrorCollector = $script:ErrorCollector
        Parameters = @{
            CompanyName = $CompanyName
            Mode = $Mode
            ConfigurationFile = $ConfigurationFile
        }
    }
    
    $crashPath = Join-Path $global:MandA.Paths.LogOutput "OrchestratorCrash_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $crashReport | ConvertTo-Json -Depth 10 | 
        Set-Content -Path $crashPath -Encoding UTF8
    
    Write-OrchestratorLog -Message "Crash report saved: $crashPath" -Level "ERROR"
    
    exit 99
} finally {
    Write-OrchestratorLog -Message "Performing cleanup..." -Level "INFO"
    
    if (Get-Command Disconnect-AllServices -ErrorAction SilentlyContinue) {
        try {
            Write-OrchestratorLog -Message "Disconnecting services..." -Level "INFO"
            Disconnect-AllServices
        } catch {
            Write-OrchestratorLog -Message "Error during disconnect: $_" -Level "WARN"
        }
    }
    
    Write-OrchestratorLog -Message "Orchestrator cleanup complete" -Level "INFO"
}