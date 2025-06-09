# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    Provides utility functions for displaying progress and status information in the M&A Discovery Suite.
.DESCRIPTION
    This module contains functions to render visual progress indicators, status tables,
    and section headers to the console, enhancing the user experience during suite execution.
    It integrates with EnhancedLogging for consistent output styling where appropriate.
    This version incorporates fixes and considerations based on the provided fault list,
    particularly ensuring FAULT 19 (Write-Progress Not Cleared) is handled.
.NOTES
    Version: 1.0.1
    Author: M&A Discovery Suite Team
    Date: 2025-06-05

    Key Design Points:
    - Leverages Write-MandALog for standardized section headers and status messages (addresses FAULT 16 via context).
    - Provides wrappers for PowerShell's native Write-Progress for long-running tasks, ensuring completion (addresses FAULT 19).
    - Offers a simple status table formatter.
    - Relies on $global:MandA or a passed -Context for logging context and config (addresses FAULT 2 for Get-OrElse, FAULT 10 principle for context use).
    - PowerShell 5.1 compatible, UTF-8 considerations are for text output handled by Write-MandALog.
#>

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


function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        
        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $true
        
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        
        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Don't rethrow - let caller handle based on result
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    
    return $result
}



Export-ModuleMember -Function Show-SectionHeader, Show-StatusTable, Update-TaskProgress, Complete-TaskProgress, Write-ProgressStep, Show-DiscoveryProgress, Show-ProgressBar

# --- Public Functions ---

function Show-SectionHeader {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Title,

        [Parameter(Mandatory=$false)]
        [string]$Subtitle = "",

        [Parameter(Mandatory=$false)]
        [string]$Icon = "[PROGRESS]", # Default icon for general sections

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For Write-MandALog, expected to contain .Config.environment.logging
    )
    # This function uses Write-MandALog's HEADER level for consistent section display.
    # Assumes EnhancedLogging.psm1 is loaded and Write-MandALog is available.
    # FAULT 16: Standardizes on -Context for logging.

    # Get-OrElse should be globally defined by Set-SuiteEnvironment.ps1 (addresses FAULT 2 by relying on prior setup)
    $useEmojis = $true # Default
    # FAULT 10 principle: Validate/use context properties carefully.
    if ($Context -and $Context.PSObject.Properties['Config'] -and $Context.Config.PSObject.Properties['environment'] -and $Context.Config.environment.PSObject.Properties['logging'] -and $Context.Config.environment.logging.PSObject.Properties['useEmojis']) {
        $useEmojis = $Context.Config.environment.logging.useEmojis | global:Get-OrElse $true
    } elseif ($global:MandA -and $global:MandA.Config -and $global:MandA.Config.environment -and $global:MandA.Config.environment.logging) { # Fallback to global if context piece is missing
         $useEmojis = $global:MandA.Config.environment.logging.useEmojis | global:Get-OrElse $true
    } # Else, keeps default $true

    $displayIcon = if ($useEmojis) { "$Icon " } else { "" }
    $headerMessage = "$displayIcon$Title"
    if (-not [string]::IsNullOrWhiteSpace($Subtitle)) {
        $headerMessage += " - $Subtitle"
    }
    
    # FAULT 7 principle: Check if Write-MandALog is available.
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message $headerMessage -Level "HEADER" -Component "Display" -Context $Context
    } else {
        # Fallback to basic Write-Host if Write-MandALog is not available
        # This indicates a problem with EnhancedLogging.psm1 loading.
        $separator = "=" * ($headerMessage.Length + 4 | Out-String | Select-Object -First 1).Trim().Length # Dynamic separator length
        Write-Host "`n$separator" -ForegroundColor Cyan
        Write-Host "  $headerMessage  " -ForegroundColor White -BackgroundColor DarkBlue
        Write-Host $separator -ForegroundColor Cyan
        Write-Warning "[ProgressDisplay.Show-SectionHeader] Write-MandALog not found. Using basic Write-Host. Ensure EnhancedLogging.psm1 is loaded."
    }
}

function Show-StatusTable {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$StatusData, 

        [Parameter(Mandatory=$false)]
        [string]$TableTitle = "Current Status",

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For Write-MandALog
    )
    # FAULT 16: Standardizes on -Context.
    # FAULT 7 principle: Check for Write-MandALog.
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        # Use Show-SectionHeader for the title for consistency, or Write-MandALog directly
        Show-SectionHeader -Title $TableTitle -Icon "[TABLE]" -Context $Context 
        
        if ($null -eq $StatusData -or $StatusData.Keys.Count -eq 0) {
            Write-MandALog -Message "  No status data to display for '$TableTitle'." -Level "INFO" -Component "Display" -Context $Context
            return
        }

        $maxKeyLength = 0
        if ($StatusData.Keys.Count -gt 0) {
            try { # Handle potential error if Keys is empty or not strings
                $maxKeyLength = ($StatusData.Keys | ForEach-Object { $_.ToString().Length } | Measure-Object -Maximum).Maximum
            } catch {
                $maxKeyLength = 20 # Fallback
            }
        }
        $maxKeyLength = [Math]::Max($maxKeyLength, 20) # Ensure a minimum width

        foreach ($keyNameOrder in $StatusData.Keys | Sort-Object) {
            $valueData = $StatusData[$keyNameOrder]
            $displayValue = if ($null -eq $valueData) { "<null>" } elseif ($valueData -is [array]) { ($valueData | Out-String).Trim() } else { $valueData.ToString() }
            
            # Simple formatting for display using Write-MandALog INFO level
            $formattedLine = ("  {0,-$maxKeyLength} : {1}" -f $keyNameOrder, $displayValue)
            Write-MandALog -Message $formattedLine -Level "INFO" -Component "StatusTable" -Context $Context
        }
    } else {
        # Fallback if Write-MandALog isn't available
        Write-Host "`n$TableTitle" -ForegroundColor Cyan
        Write-Host $("-" * $TableTitle.Length) -ForegroundColor Cyan
        if ($null -eq $StatusData -or $StatusData.Keys.Count -eq 0) {
            Write-Host "  No status data."
            return
        }
        $StatusData.GetEnumerator() | Sort-Object Name | ForEach-Object {
            Write-Host ("  {0,-30} : {1}" -f $_.Name, $_.Value) # Basic fallback format
        }
        Write-Warning "[ProgressDisplay.Show-StatusTable] Write-MandALog not found. Using basic Write-Host."
    }
}

function Update-TaskProgress {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Activity, 

        [Parameter(Mandatory=$true)]
        [long]$CurrentOperation, 

        [Parameter(Mandatory=$true)]
        [long]$TotalOperations, 

        [Parameter(Mandatory=$false)]
        [string]$StatusDescription = "Processing items...", 
        
        [Parameter(Mandatory=$false)]
        [int]$ActivityId = 1, 
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging significant progress points
    )
    # FAULT 19: This function wraps Write-Progress. Complete-TaskProgress must be called later.

    if ($TotalOperations -le 0) { 
        # If total is 0, perhaps log once and complete, or just return.
        # For now, just return to avoid division by zero or invalid progress bar.
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Update-TaskProgress for '$Activity': TotalOperations is $TotalOperations. No progress to show." -Level "DEBUG" -Component "TaskProgress" -Context $Context
        }
        return 
    }

    $percent = 0
    if ($TotalOperations -gt 0) { # Redundant check, but safe
        $percent = [math]::Round(($CurrentOperation / $TotalOperations) * 100, 0)
    }

    # Use PowerShell's native progress bar
    Write-Progress -Activity $Activity -Id $ActivityId `
                   -Status "$StatusDescription ($CurrentOperation of $TotalOperations)"
                   -PercentComplete $percent `
                   -CurrentOperation "Item $CurrentOperation of $TotalOperations" # More descriptive CurrentOperation
    
    # Log progress to file/console at intervals (e.g., every 10% or if logging level is DEBUG)
    # Relies on Get-OrElse being globally defined
    $logProgress = $false
    $logLevelForProgress = "DEBUG" # Default to DEBUG to avoid flooding INFO logs
    $logInterval = 10 # Log every 10%

    # FAULT 10 principle: Check context and config properties carefully.
    if ($Context -and $Context.PSObject.Properties['Config'] -and `
        $Context.Config.PSObject.Properties['advancedSettings'] -and `
        $Context.Config.advancedSettings.PSObject.Properties['debugMode']) {
        if($Context.Config.advancedSettings.debugMode | global:Get-OrElse $false) {
            $logProgress = $true # Log all progress steps in debug mode
        }
    }
    
    if (-not $logProgress) { # If not in debug mode, check for interval logging
        $progressPoint = [Math]::Max(1, [Math]::Floor($TotalOperations / (100 / $logInterval))) # Calculate items per interval tick
        if (($CurrentOperation % $progressPoint) -eq 0 -or $CurrentOperation -eq $TotalOperations) {
            $logProgress = $true
            $logLevelForProgress = "PROGRESS" # Use PROGRESS level for significant updates
        }
    }

    if ($logProgress -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
        Write-MandALog -Message "$Activity $percent% complete ($CurrentOperation/$TotalOperations). Status: $StatusDescription" -Level $logLevelForProgress -Component "TaskProgress" -Context $Context
    }
}

function Complete-TaskProgress {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Activity, 

        [Parameter(Mandatory=$false)]
        [int]$ActivityId = 1, 
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging completion
    )
    # FAULT 19 FIX: This function explicitly calls Write-Progress with -Completed.
    Write-Progress -Activity $Activity -Id $ActivityId -Completed
    
    # FAULT 7 principle: Check for Write-MandALog.
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "Task progress visualization completed for: $Activity" -Level "INFO" -Component "TaskProgress" -Context $Context
    } else {
        # Fallback if Write-MandALog isn't available
        Write-Host "[ProgressDisplay.Complete-TaskProgress] Task progress completed for: $Activity"
        Write-Warning "[ProgressDisplay.Complete-TaskProgress] Write-MandALog not found. Ensure EnhancedLogging.psm1 is loaded."
    }
}

function Write-ProgressStep {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("Progress", "Info", "Success", "Warning", "Error")]
        [string]$Status = "Info",
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    # Map status to appropriate log level and color
    $logLevel = switch ($Status) {
        "Progress" { "INFO" }
        "Info" { "INFO" }
        "Success" { "SUCCESS" }
        "Warning" { "WARN" }
        "Error" { "ERROR" }
        default { "INFO" }
    }
    
    $color = switch ($Status) {
        "Progress" { "Cyan" }
        "Info" { "White" }
        "Success" { "Green" }
        "Warning" { "Yellow" }
        "Error" { "Red" }
        default { "White" }
    }
    
    # Add status indicator
    $indicator = switch ($Status) {
        "Progress" { "[...]" }
        "Info" { "[i]" }
        "Success" { "[✓]" }
        "Warning" { "[!]" }
        "Error" { "[✗]" }
        default { "[i]" }
    }
    
    # Try to use Write-MandALog if available, otherwise fallback to Write-Host
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "$indicator $Message" -Level $logLevel -Component "ProgressStep" -Context $Context
    } else {
        # Fallback to Write-Host with timestamp
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$timestamp] $indicator $Message" -ForegroundColor $color
    }
}

function Show-DiscoveryProgress {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Module,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("Starting", "Running", "Completed", "Failed")]
        [string]$Status = "Running",
        
        [Parameter(Mandatory=$false)]
        [string]$CurrentItem = "",
        
        [Parameter(Mandatory=$false)]
        [int]$ItemsProcessed = 0,
        
        [Parameter(Mandatory=$false)]
        [int]$TotalItems = 0,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Stats = @{},
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    # Build progress message
    $progressMessage = "[$Module]"
    
    if ($CurrentItem) {
        $progressMessage += " $CurrentItem"
    }
    
    if ($TotalItems -gt 0 -and $ItemsProcessed -ge 0) {
        $percentage = [math]::Round(($ItemsProcessed / $TotalItems) * 100, 1)
        $progressMessage += " ($ItemsProcessed/$TotalItems - $percentage%)"
    }
    
    # Add stats if provided
    if ($Stats.Count -gt 0) {
        $statsText = ($Stats.GetEnumerator() | ForEach-Object { "$($_.Key): $($_.Value)" }) -join ", "
        $progressMessage += " [$statsText]"
    }
    
    # Map status to appropriate log level and Write-ProgressStep status
    $logLevel = switch ($Status) {
        "Starting" { "INFO" }
        "Running" { "INFO" }
        "Completed" { "SUCCESS" }
        "Failed" { "ERROR" }
        default { "INFO" }
    }
    
    $progressStatus = switch ($Status) {
        "Starting" { "Progress" }
        "Running" { "Progress" }
        "Completed" { "Success" }
        "Failed" { "Error" }
        default { "Info" }
    }
    
    # Use Write-ProgressStep for consistent formatting
    Write-ProgressStep -Message $progressMessage -Status $progressStatus -Context $Context
    
    # Also use native Write-Progress if we have numeric progress
    if ($TotalItems -gt 0 -and $ItemsProcessed -ge 0) {
        $percentage = [math]::Round(($ItemsProcessed / $TotalItems) * 100, 0)
        $activity = "$Module Discovery"
        $statusText = if ($CurrentItem) { $CurrentItem } else { "Processing..." }
        
        if ($Status -eq "Completed") {
            Write-Progress -Activity $activity -Completed
        } elseif ($Status -eq "Failed") {
            Write-Progress -Activity $activity -Completed
        } else {
            Write-Progress -Activity $activity -Status $statusText -PercentComplete $percentage -CurrentOperation "Item $ItemsProcessed of $TotalItems"
        }
    }
}

function Show-ProgressBar {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [int]$Current,
        
        [Parameter(Mandatory=$true)]
        [int]$Total,
        
        [Parameter(Mandatory=$false)]
        [string]$Activity = "Processing",
        
        [Parameter(Mandatory=$false)]
        [string]$Status = "",
        
        [Parameter(Mandatory=$false)]
        [int]$Id = 1,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    if ($Total -le 0) {
        return
    }
    
    $percentage = [math]::Round(($Current / $Total) * 100, 0)
    
    # Build status text
    $statusText = if ($Status) {
        "$Status ($Current of $Total)"
    } else {
        "Processing $Current of $Total"
    }
    
    # Use native PowerShell progress bar
    Write-Progress -Activity $Activity -Id $Id -Status $statusText -PercentComplete $percentage -CurrentOperation "Item $Current of $Total"
    
    # Also show a simple text progress bar for console output
    $barLength = 40
    $filledLength = [math]::Floor(($Current / $Total) * $barLength)
    $emptyLength = $barLength - $filledLength
    
    $progressBar = "[" + ("█" * $filledLength) + ("░" * $emptyLength) + "]"
    $progressText = "$progressBar $percentage% ($Current/$Total)"
    
    # Write to console without newline (overwrite previous line)
    Write-Host "`r$progressText" -NoNewline -ForegroundColor Cyan
    
    # If completed, add a newline
    if ($Current -eq $Total) {
        Write-Host ""
        Write-Progress -Activity $Activity -Id $Id -Completed
    }
}

Write-Host "[ProgressDisplay.psm1] Module loaded. (v1.0.1)" -ForegroundColor DarkGray


