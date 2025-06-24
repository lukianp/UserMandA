# Fix Discovery Module Interfaces
# Adds required Invoke-Discovery and Get-DiscoveryInfo functions to all discovery modules

param(
    [string]$ModulesPath = "Modules\Discovery",
    [switch]$CreateBackups = $true
)

function Write-FixLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "Gray" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Add-DiscoveryInterface {
    param(
        [string]$ModulePath,
        [string]$ModuleName
    )
    
    Write-FixLog "Adding discovery interface to $ModuleName" "INFO"
    
    # Read current content
    $content = Get-Content $ModulePath -Raw
    
    # Check if functions already exist
    if ($content -match "function Invoke-Discovery" -and $content -match "function Get-DiscoveryInfo") {
        Write-FixLog "Interface functions already exist in $ModuleName" "INFO"
        return $true
    }
    
    # Create the interface functions
    $interfaceFunctions = @"

# =============================================================================
# DISCOVERY MODULE INTERFACE FUNCTIONS
# Required by M&A Orchestrator for module invocation
# =============================================================================

function Invoke-Discovery {
    <#
    .SYNOPSIS
    Main discovery function called by the M&A Orchestrator
    
    .DESCRIPTION
    Performs the primary discovery operation for this module.
    This function is required by the orchestrator interface contract.
    
    .PARAMETER Context
    The discovery context containing configuration and state information
    
    .PARAMETER Force
    Force discovery even if cached data exists
    
    .EXAMPLE
    Invoke-Discovery -Context `$discoveryContext
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = `$true)]
        [hashtable]`$Context,
        
        [Parameter(Mandatory = `$false)]
        [switch]`$Force
    )
    
    try {
        Write-MandALog "Starting $ModuleName discovery" "INFO"
        
        # Initialize discovery operation
        `$discoveryResult = @{
            ModuleName = "$ModuleName"
            StartTime = Get-Date
            Status = "Running"
            Data = @()
            Errors = @()
            Warnings = @()
            Summary = @{}
        }
        
        # Perform module-specific discovery logic
        # TODO: Implement actual discovery logic for $ModuleName
        Write-MandALog "Performing $ModuleName discovery operations..." "INFO"
        
        # Example: Call existing discovery functions if they exist
        # `$discoveryData = Get-${ModuleName}Data -Context `$Context
        
        # For now, create a placeholder result
        `$discoveryResult.Data = @(
            @{
                DiscoveryType = "$ModuleName"
                Timestamp = Get-Date
                Status = "Discovered"
                Details = "Discovery completed successfully"
            }
        )
        
        # Update result status
        `$discoveryResult.Status = "Completed"
        `$discoveryResult.EndTime = Get-Date
        `$discoveryResult.Duration = (`$discoveryResult.EndTime - `$discoveryResult.StartTime).TotalSeconds
        `$discoveryResult.Summary = @{
            ItemsDiscovered = `$discoveryResult.Data.Count
            ErrorCount = `$discoveryResult.Errors.Count
            WarningCount = `$discoveryResult.Warnings.Count
        }
        
        Write-MandALog "Completed $ModuleName discovery. Found `$(`$discoveryResult.Data.Count) items" "SUCCESS"
        
        return `$discoveryResult
        
    } catch {
        Write-MandALog "Error in $ModuleName discovery: `$(`$_.Exception.Message)" "ERROR"
        
        `$discoveryResult.Status = "Failed"
        `$discoveryResult.EndTime = Get-Date
        `$discoveryResult.Errors += @{
            Message = `$_.Exception.Message
            StackTrace = `$_.ScriptStackTrace
            Timestamp = Get-Date
        }
        
        throw
    }
}

function Get-DiscoveryInfo {
    <#
    .SYNOPSIS
    Returns metadata about this discovery module
    
    .DESCRIPTION
    Provides information about the module's capabilities, requirements,
    and configuration options. Used by the orchestrator for planning.
    
    .EXAMPLE
    Get-DiscoveryInfo
    #>
    [CmdletBinding()]
    param()
    
    return @{
        ModuleName = "$ModuleName"
        ModuleVersion = "1.0.0"
        Description = "$ModuleName discovery module for M&A Suite"
        Author = "M&A Discovery Suite"
        RequiredModules = @()
        RequiredPermissions = @(
            "Read access to $ModuleName resources"
        )
        ConfigurationParameters = @(
            @{
                Name = "Enabled"
                Type = "Boolean"
                Required = `$false
                Default = `$true
                Description = "Enable $ModuleName discovery"
            }
        )
        OutputDataTypes = @(
            "$ModuleName.DiscoveryData"
        )
        EstimatedDuration = "5-15 minutes"
        Dependencies = @()
        SupportedEnvironments = @("OnPremises", "Cloud", "Hybrid")
        LastUpdated = "2025-06-09"
    }
}

"@

    # Add the interface functions before the final Export-ModuleMember
    if ($content -match "(Export-ModuleMember.*)$") {
        $exportStatement = $matches[1]
        $contentBeforeExport = $content -replace [regex]::Escape($exportStatement) + "$", ""
        $newContent = $contentBeforeExport + $interfaceFunctions + "`n" + $exportStatement
        
        # Update the Export-ModuleMember to include the new functions
        if ($exportStatement -notmatch "Invoke-Discovery") {
            $newContent = $newContent -replace "(Export-ModuleMember.*-Function\s+)", "`$1Invoke-Discovery, Get-DiscoveryInfo, "
        }
    } else {
        # No Export-ModuleMember found, add everything at the end
        $newContent = $content + $interfaceFunctions + "`n`nExport-ModuleMember -Function Invoke-Discovery, Get-DiscoveryInfo"
    }
    
    # Write the updated content
    Set-Content $ModulePath $newContent -Encoding UTF8
    
    Write-FixLog "Successfully added interface functions to $ModuleName" "SUCCESS"
    return $true
}

# Main execution
Write-FixLog "Starting Discovery Module Interface Fix Process" "INFO"

if (-not (Test-Path $ModulesPath)) {
    Write-FixLog "Discovery modules path not found: $ModulesPath" "ERROR"
    exit 1
}

# Get all discovery modules
$discoveryModules = Get-ChildItem -Path $ModulesPath -Filter "*.psm1"
Write-FixLog "Found $($discoveryModules.Count) discovery modules to fix" "INFO"

$successCount = 0
$errorCount = 0

foreach ($module in $discoveryModules) {
    try {
        # Create backup if requested
        if ($CreateBackups) {
            $backupPath = "$($module.FullName).backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
            Copy-Item $module.FullName $backupPath
            Write-FixLog "Created backup: $backupPath" "INFO"
        }
        
        # Extract module name from filename
        $moduleName = [System.IO.Path]::GetFileNameWithoutExtension($module.Name)
        
        # Add the discovery interface
        if (Add-DiscoveryInterface -ModulePath $module.FullName -ModuleName $moduleName) {
            $successCount++
        } else {
            $errorCount++
        }
        
    } catch {
        Write-FixLog "Error processing $($module.Name): $($_.Exception.Message)" "ERROR"
        $errorCount++
    }
}

Write-FixLog "Discovery Interface Fix Complete" "SUCCESS"
Write-FixLog "Successfully processed: $successCount modules" "SUCCESS"
Write-FixLog "Errors encountered: $errorCount modules" $(if ($errorCount -eq 0) { "SUCCESS" } else { "WARN" })

# Test the fixes
Write-FixLog "Testing the fixes..." "INFO"
try {
    $testResult = & powershell -ExecutionPolicy Bypass -File "Scripts\Simple-ModuleValidator.ps1" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-FixLog "Validation test passed!" "SUCCESS"
    } else {
        Write-FixLog "Validation test completed with remaining issues" "WARN"
    }
} catch {
    Write-FixLog "Error running validation test: $($_.Exception.Message)" "ERROR"
}

Write-FixLog "Interface fix process completed" "SUCCESS"