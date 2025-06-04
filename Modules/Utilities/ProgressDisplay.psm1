#Requires -Version 5.1
<#
.SYNOPSIS
    Enhanced Progress Display for M&A Discovery Suite
.DESCRIPTION
    Provides visual progress tracking with ASCII-only characters
#>

# Module-level variables
$script:CurrentOperation = ""
$script:ProgressHistory = @()

function Start-ProgressDisplay {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Operation,
        
        [Parameter(Mandatory=$false)]
        [int]$TotalSteps = 0,
        
        [Parameter(Mandatory=$false)]
        [switch]$ShowTimer
    )
    
    $script:CurrentOperation = @{
        Name = $Operation
        StartTime = Get-Date
        TotalSteps = $TotalSteps
        CurrentStep = 0
        ShowTimer = $ShowTimer
        SubOperations = @()
    }
    
    Write-ProgressHeader -Title $Operation
}

function Write-ProgressHeader {
    param([string]$Title)
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $width = 100
    $titleLength = $Title.Length + $timestamp.Length + 6  # Account for brackets and spaces
    $padding = [Math]::Max(0, ($width - $titleLength) / 2)
    
    Write-Host ""
    Write-Host ("=" * $width) -ForegroundColor Cyan
    Write-Host ("=" + " " * ($width - 2) + "=") -ForegroundColor Cyan
    Write-Host ("=" + " " * $padding + "[$timestamp] $Title" + " " * ($width - $padding - $titleLength - 1) + "=") -ForegroundColor Cyan
    Write-Host ("=" + " " * ($width - 2) + "=") -ForegroundColor Cyan
    Write-Host ("=" * $width) -ForegroundColor Cyan
    Write-Host ""
}

function Write-ProgressStep {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet('Info', 'Success', 'Warning', 'Error', 'Progress')]
        [string]$Status = 'Info',
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Details = @{},
        
        [Parameter(Mandatory=$false)]
        [switch]$NoNewLine
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss.fff"
    $elapsed = if ($script:CurrentOperation.StartTime) {
        " +" + ((Get-Date) - $script:CurrentOperation.StartTime).ToString("mm\:ss")
    } else { "" }
    
    # Status indicators (ASCII only)
    $statusIndicator = switch ($Status) {
        'Info'     { "[i]"; $color = "Cyan" }
        'Success'  { "[+]"; $color = "Green" }
        'Warning'  { "[!]"; $color = "Yellow" }
        'Error'    { "[X]"; $color = "Red" }
        'Progress' { "[>]"; $color = "Blue" }
    }
    
    # Build output
    $output = "[$timestamp]$elapsed $statusIndicator $Message"
    
    # Add details if provided
    if ($Details.Count -gt 0) {
        $detailString = ($Details.GetEnumerator() | ForEach-Object { "$($_.Key): $($_.Value)" }) -join " | "
        $output += " ($detailString)"
    }
    
    if ($NoNewLine) {
        Write-Host $output -ForegroundColor $color -NoNewline
    } else {
        Write-Host $output -ForegroundColor $color
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
        [string]$Activity = "",
        
        [Parameter(Mandatory=$false)]
        [int]$Width = 50
    )
    
    if ($Total -eq 0) { return }
    
    $percent = [Math]::Min(100, [Math]::Round(($Current / $Total) * 100))
    $completed = [Math]::Round(($percent / 100) * $Width)
    $remaining = $Width - $completed
    
    # Build progress bar with ASCII characters
    $progressBar = "[" + ("#" * $completed) + ("-" * $remaining) + "]"
    
    # Calculate ETA
    if ($script:CurrentOperation.StartTime -and $Current -gt 0) {
        $elapsed = (Get-Date) - $script:CurrentOperation.StartTime
        $rate = $Current / $elapsed.TotalSeconds
        if ($rate -gt 0) {
            $eta = [TimeSpan]::FromSeconds(($Total - $Current) / $rate)
            $etaString = " ETA: " + $eta.ToString("mm\:ss")
        } else {
            $etaString = ""
        }
    } else {
        $etaString = ""
    }
    
    # Clear line and write progress
    Write-Host "`r$progressBar $percent% | $Current/$Total | $Activity$etaString" -NoNewline
}

function Write-AnimatedProgress {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [int]$AnimationDelay = 100
    )
    
    $spinChars = @('|', '/', '-', '\')
    $spinIndex = 0
    
    # Store cursor position
    $cursorTop = [Console]::CursorTop
    
    # Return a scriptblock that can be called to update the animation
    return {
        [Console]::SetCursorPosition(0, $cursorTop)
        Write-Host "[$($spinChars[$spinIndex])] $Message" -NoNewline
        $spinIndex = ($spinIndex + 1) % $spinChars.Length
        Start-Sleep -Milliseconds $AnimationDelay
    }.GetNewClosure()
}

function Show-DiscoveryProgress {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Module,
        
        [Parameter(Mandatory=$true)]
        [string]$Status,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Stats = @{},
        
        [Parameter(Mandatory=$false)]
        [string]$CurrentItem = "",
        
        [Parameter(Mandatory=$false)]
        [int]$ItemsProcessed = 0,
        
        [Parameter(Mandatory=$false)]
        [int]$TotalItems = 0
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    # Module name formatting (fixed width for alignment)
    $moduleDisplay = $Module.PadRight(25)
    
    # Status with color
    $statusColor = switch ($Status) {
        'Running'    { 'Yellow' }
        'Completed'  { 'Green' }
        'Failed'     { 'Red' }
        'Skipped'    { 'Gray' }
        default      { 'White' }
    }
    
    # Build status line
    $statusLine = "[$timestamp] $moduleDisplay : $Status"
    
    # Add progress if available
    if ($TotalItems -gt 0) {
        $percent = [Math]::Round(($ItemsProcessed / $TotalItems) * 100)
        $statusLine += " [$ItemsProcessed/$TotalItems - $percent%]"
    }
    
    # Add current item if processing
    if ($CurrentItem -and $Status -eq 'Running') {
        $statusLine += " -> $CurrentItem"
    }
    
    # Add stats if completed
    if ($Stats.Count -gt 0 -and $Status -eq 'Completed') {
        $statString = ($Stats.GetEnumerator() | ForEach-Object { "$($_.Key): $($_.Value)" }) -join ", "
        $statusLine += " [$statString]"
    }
    
    Write-Host $statusLine -ForegroundColor $statusColor
}

function Show-ConnectionStatus {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Service,
        
        [Parameter(Mandatory=$true)]
        [string]$Status,
        
        [Parameter(Mandatory=$false)]
        [string]$Details = ""
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $serviceDisplay = $Service.PadRight(20)
    
    $statusDisplay = switch ($Status) {
        'Connecting'    { "[...]"; $color = "Yellow" }
        'Connected'     { "[OK]"; $color = "Green" }
        'Failed'        { "[FAIL]"; $color = "Red" }
        'Retrying'      { "[RETRY]"; $color = "Magenta" }
        'Skipped'       { "[SKIP]"; $color = "Gray" }
        default         { "[$Status]"; $color = "White" }
    }
    
    $output = "[$timestamp] $serviceDisplay $statusDisplay"
    if ($Details) {
        $output += " - $Details"
    }
    
    Write-Host $output -ForegroundColor $color
}

function Show-DiscoverySummary {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Results
    )
    
    Write-Host ""
    Write-Host ("=" * 100) -ForegroundColor Green
    Write-Host "DISCOVERY SUMMARY" -ForegroundColor Green
    Write-Host ("=" * 100) -ForegroundColor Green
    Write-Host ""
    
    $totalRecords = 0
    $successModules = 0
    $failedModules = 0
    
    foreach ($module in $Results.Keys | Sort-Object) {
        $result = $Results[$module]
        
        if ($result.Success) {
            $successModules++
            $recordCount = $result.RecordCount
            $totalRecords += $recordCount
            
            Write-Host ("  [+] {0,-25} : {1,8} records" -f $module, $recordCount) -ForegroundColor Green
        } else {
            $failedModules++
            Write-Host ("  [X] {0,-25} : FAILED - {1}" -f $module, $result.Error) -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "  Total Records Discovered : $totalRecords" -ForegroundColor Cyan
    Write-Host "  Successful Modules       : $successModules" -ForegroundColor Green
    Write-Host "  Failed Modules           : $failedModules" -ForegroundColor $(if ($failedModules -gt 0) { 'Red' } else { 'Gray' })
    Write-Host ""
    Write-Host ("=" * 100) -ForegroundColor Green
}

Export-ModuleMember -Function @(
    'Start-ProgressDisplay',
    'Write-ProgressStep',
    'Show-ProgressBar',
    'Write-AnimatedProgress',
    'Show-DiscoveryProgress',
    'Show-ConnectionStatus',
    'Show-DiscoverySummary',
    'Write-ProgressHeader'
)
