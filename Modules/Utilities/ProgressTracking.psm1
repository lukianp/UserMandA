#Requires -Version 5.1
<#
.SYNOPSIS
    Provides utility functions for displaying progress and status information in the M&A Discovery Suite.
.DESCRIPTION
    This module contains functions to render visual progress indicators, status tables,
    and section headers to the console, enhancing the user experience during suite execution.
    It integrates with EnhancedLogging for consistent output styling where appropriate.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-05

    Key Design Points:
    - Leverages Write-MandALog for standardized section headers and status messages.
    - Provides a wrapper for PowerShell's native Write-Progress for long-running tasks.
    - Offers a simple status table formatter.
    - Relies on $global:MandA or a passed -Context for logging context.
#>

Export-ModuleMember -Function Show-SectionHeader, Show-StatusTable, Update-TaskProgress, Complete-TaskProgress

# --- Public Functions ---

function Show-SectionHeader {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Title,

        [Parameter(Mandatory=$false)]
        [string]$Subtitle = "",

        [Parameter(Mandatory=$false)]
        [string]$Icon = "🚧", # Default icon for general sections, can be overridden

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For Write-MandALog
    )
    # This function uses Write-MandALog's HEADER level for consistent section display.
    # The actual formatting (emojis, colors, separators) is handled by Write-MandALog.

    # Get-OrElse should be globally defined by Set-SuiteEnvironment.ps1
    $useEmojis = $true # Default
    if ($Context -and $Context.Config -and $Context.Config.environment -and $Context.Config.environment.logging) {
        $useEmojis = $Context.Config.environment.logging.useEmojis | global:Get-OrElse $true
    } elseif ($script:LoggingConfig -and $script:LoggingConfig.DefaultContext -and $script:LoggingConfig.DefaultContext.Config -and $script:LoggingConfig.DefaultContext.Config.environment -and $script:LoggingConfig.DefaultContext.Config.environment.logging){
         $useEmojis = $script:LoggingConfig.DefaultContext.Config.environment.logging.useEmojis | global:Get-OrElse $true
    } elseif ($global:MandA -and $global:MandA.Config -and $global:MandA.Config.environment -and $global:MandA.Config.environment.logging) {
         $useEmojis = $global:MandA.Config.environment.logging.useEmojis | global:Get-OrElse $true
    }


    $displayIcon = if ($useEmojis) { "$Icon " } else { "" }
    $headerMessage = "$displayIcon$Title"
    if (-not [string]::IsNullOrWhiteSpace($Subtitle)) {
        $headerMessage += " - $Subtitle"
    }
    
    # Check if Write-MandALog is available (it should be if EnhancedLogging.psm1 is loaded)
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message $headerMessage -Level "HEADER" -Component "Display" -Context $Context
    } else {
        # Fallback to basic Write-Host if Write-MandALog is not available
        $separator = "=" * ($headerMessage.Length + 4)
        Write-Host "`n$separator" -ForegroundColor Cyan
        Write-Host "  $headerMessage  " -ForegroundColor White -BackgroundColor DarkBlue
        Write-Host $separator -ForegroundColor Cyan
    }
}

function Show-StatusTable {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$StatusData, # Hashtable of Key-Value pairs for the table

        [Parameter(Mandatory=$false)]
        [string]$TableTitle = "Current Status",

        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For Write-MandALog
    )
    # This function uses Write-MandALog's INFO level for table rows.
    # EnhancedLogging.psm1's Write-StatusTable is more advanced if complex formatting is needed.
    # This is a simpler version for direct use if that module's specific function isn't preferred.

    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message $TableTitle -Level "HEADER" -Component "Display" -Context $Context
        if ($null -eq $StatusData -or $StatusData.Keys.Count -eq 0) {
            Write-MandALog -Message "No status data to display for '$TableTitle'." -Level "INFO" -Component "Display" -Context $Context
            return
        }

        # Determine max key length for alignment
        $maxKeyLength = 0
        if ($StatusData.Keys.Count -gt 0) {
            $maxKeyLength = ($StatusData.Keys | ForEach-Object { $_.Length } | Measure-Object -Maximum).Maximum
        }
        $maxKeyLength = [Math]::Max($maxKeyLength, 20) # Ensure a minimum width

        foreach ($keyName in $StatusData.Keys | Sort-Object) {
            $valueData = $StatusData[$keyName]
            # Simple formatting for display
            $formattedLine = ("  {0,-$maxKeyLength} : {1}" -f $keyName, $valueData)
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
            Write-Host ("  {0,-30} : {1}" -f $_.Name, $_.Value)
        }
    }
}

function Update-TaskProgress {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Activity, # Main activity being performed

        [Parameter(Mandatory=$true)]
        [long]$CurrentOperation, # Current item number

        [Parameter(Mandatory=$true)]
        [long]$TotalOperations, # Total items to process

        [Parameter(Mandatory=$false)]
        [string]$StatusDescription = "Processing items...", # Status message
        
        [Parameter(Mandatory=$false)]
        [int]$ActivityId = 1, # ID for the progress bar (useful for nested progress)
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging significant progress points
    )
    # FAULT 19 FIX: This function wraps Write-Progress. It doesn't complete it;
    # Complete-TaskProgress should be called.

    if ($TotalOperations -le 0) { return } # Avoid division by zero or pointless bar

    $percent = 0
    if ($TotalOperations -gt 0) {
        $percent = [math]::Round(($CurrentOperation / $TotalOperations) * 100, 0)
    }

    Write-Progress -Activity $Activity -Id $ActivityId `
                   -Status "$StatusDescription ($CurrentOperation of $TotalOperations)" `
                   -PercentComplete $percent `
                   -CurrentOperation "Item $CurrentOperation"
    
    # Log progress at intervals (e.g., every 10% or if logging level is DEBUG)
    # Get-OrElse should be globally defined
    $logProgress = $false
    $logLevelForProgress = "DEBUG" # Default to DEBUG for progress messages to avoid flooding INFO logs

    if ($Context -and $Context.Config -and $Context.Config.advancedSettings -and $Context.Config.advancedSettings.debugMode) {
        $logProgress = $true # Log all progress in debug mode
    } elseif (($CurrentOperation % [Math]::Max(1, [Math]::Floor($TotalOperations / 10))) -eq 0 -or $CurrentOperation -eq $TotalOperations) {
        # Log at 0%, 10%, 20%... and 100%
        $logProgress = $true
        $logLevelForProgress = "PROGRESS" # Use PROGRESS level for significant updates
    }

    if ($logProgress -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
        Write-MandALog -Message "$Activity $percent% complete ($CurrentOperation/$TotalOperations). Status: $StatusDescription" -Level $logLevelForProgress -Component "TaskProgress" -Context $Context
    }
}

function Complete-TaskProgress {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Activity, # Main activity that was being performed

        [Parameter(Mandatory=$false)]
        [int]$ActivityId = 1, # ID for the progress bar
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context # For logging completion
    )
    # FAULT 19 FIX: This function explicitly calls Write-Progress with -Completed.
    Write-Progress -Activity $Activity -Id $ActivityId -Completed
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "Task progress completed for: $Activity" -Level "INFO" -Component "TaskProgress" -Context $Context
    } else {
        Write-Host "Task progress completed for: $Activity"
    }
}

Write-Host "[ProgressDisplay.psm1] Module loaded." -ForegroundColor DarkGray

