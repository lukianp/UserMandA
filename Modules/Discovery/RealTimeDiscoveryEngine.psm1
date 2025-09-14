# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Real-time discovery engine with background watchers for M&A Discovery Suite
.DESCRIPTION
    Provides continuous monitoring and discovery capabilities with file system watchers, 
    scheduled background tasks, and real-time change detection for dynamic environment assessment.
    This engine implements automated discovery scheduling, change detection, and event-driven 
    discovery triggers to maintain up-to-date infrastructure inventory.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, Windows Management Framework
#>

# Import required modules
$ErrorActionPreference = 'SilentlyContinue'
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\EnhancedLogging.psm1") -Force
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\PerformanceMetrics.psm1") -Force
$ErrorActionPreference = 'Stop'

class RealTimeDiscoveryEngine {
    [hashtable]$Configuration
    [hashtable]$Context
    [string]$SessionId
    [hashtable]$ActiveWatchers = @{}
    [hashtable]$ScheduledTasks = @{}
    [System.Threading.Timer]$BackgroundTimer
    [bool]$IsRunning = $false
    [hashtable]$ChangeQueue = @{}
    [int]$DiscoveryInterval = 300 # 5 minutes default
    [datetime]$LastFullDiscovery
    [hashtable]$WatchedPaths = @{}
    
    RealTimeDiscoveryEngine([hashtable]$Config, [hashtable]$Ctx, [string]$Session) {
        $this.Configuration = $Config
        $this.Context = $Ctx
        $this.SessionId = $Session
        $this.LastFullDiscovery = [datetime]::MinValue
        $this.ChangeQueue = @{}
        
        # Initialize discovery interval from configuration
        $typeName = if ($Config.intervalMinutes) { $Config.intervalMinutes.GetType().Name } else { "null" }
        Write-RealTimeLog -Message "Config intervalMinutes: $($Config.intervalMinutes) (Type: $typeName)" -Level "DEBUG"
        if ($Config.intervalMinutes) {
            $intervalValue = $Config.intervalMinutes
            if ($intervalValue -is [array]) {
                $intervalValue = $intervalValue[0]
                Write-RealTimeLog -Message "intervalMinutes was array, using first value: $intervalValue" -Level "WARN"
            }
            $this.DiscoveryInterval = [int]$intervalValue * 60
            Write-RealTimeLog -Message "DiscoveryInterval set to: $($this.DiscoveryInterval) (Type: $($this.DiscoveryInterval.GetType().Name))" -Level "DEBUG"
        }
    }
    
    [void] StartRealTimeDiscovery() {
        if ($this.IsRunning) {
            Write-RealTimeLog -Message "Real-time discovery is already running" -Level "WARN"
            return
        }
        
        Write-RealTimeLog -Message "Starting real-time discovery engine" -Level "INFO"
        $this.IsRunning = $true
        
        # Start file system watchers
        $this.StartFileSystemWatchers()
        
        # Start scheduled background discovery
        $this.StartBackgroundTimer()
        
        # Start event log monitoring
        $this.StartEventLogMonitoring()
        
        Write-RealTimeLog -Message "Real-time discovery engine started successfully" -Level "SUCCESS"
    }
    
    [void] StopRealTimeDiscovery() {
        if (-not $this.IsRunning) {
            return
        }
        
        Write-RealTimeLog -Message "Stopping real-time discovery engine" -Level "INFO"
        $this.IsRunning = $false
        
        # Stop all file system watchers
        foreach ($watcher in $this.ActiveWatchers.Values) {
            if ($watcher -and $watcher.EnableRaisingEvents) {
                $watcher.EnableRaisingEvents = $false
                $watcher.Dispose()
            }
        }
        $this.ActiveWatchers.Clear()
        
        # Stop background timer
        if ($this.BackgroundTimer) {
            $this.BackgroundTimer.Dispose()
            $this.BackgroundTimer = $null
        }
        
        Write-RealTimeLog -Message "Real-time discovery engine stopped" -Level "SUCCESS"
    }
    
    [void] StartFileSystemWatchers() {
        Write-RealTimeLog -Message "Starting file system watchers" -Level "INFO"
        
        # Watch for Active Directory changes
        $this.CreateFileSystemWatcher("AD_Changes", "C:\Windows\NTDS", "ntds.dit", "Changed")
        
        # Watch for Group Policy changes
        $this.CreateFileSystemWatcher("GPO_Changes", "C:\Windows\SYSVOL", "*.pol", "All")
        
        # Watch for certificate store changes
        $this.CreateFileSystemWatcher("Cert_Changes", "C:\ProgramData\Microsoft\Crypto", "*.*", "All")
        
        # Watch for registry changes (via file monitoring)
        $this.CreateFileSystemWatcher("Registry_Changes", "C:\Windows\System32\config", "*", "Changed")
        
        # Watch for software installation changes
        $this.CreateFileSystemWatcher("Software_Changes", "C:\Program Files", "*", "Created,Deleted")
        $this.CreateFileSystemWatcher("Software_Changes_x86", "C:\Program Files (x86)", "*", "Created,Deleted")
    }
    
    [void] CreateFileSystemWatcher([string]$WatcherName, [string]$Path, [string]$Filter, [string]$NotifyFilters) {
        try {
            if (-not (Test-Path $Path)) {
                Write-RealTimeLog -Message "Path does not exist for watcher $WatcherName`: $Path" -Level "WARN"
                return
            }
            
            $watcher = New-Object System.IO.FileSystemWatcher
            $watcher.Path = $Path
            $watcher.Filter = $Filter
            $watcher.IncludeSubdirectories = $true
            
            # Set notify filters based on string parameter
            $notifyFilterEnum = [System.IO.NotifyFilters]::LastWrite
            if ($NotifyFilters -match "Created") { $notifyFilterEnum = $notifyFilterEnum -bor [System.IO.NotifyFilters]::CreationTime }
            if ($NotifyFilters -match "Deleted") { $notifyFilterEnum = $notifyFilterEnum -bor [System.IO.NotifyFilters]::FileName }
            if ($NotifyFilters -match "Changed") { $notifyFilterEnum = $notifyFilterEnum -bor [System.IO.NotifyFilters]::LastWrite }
            if ($NotifyFilters -match "All") {
                $notifyFilterEnum = [System.IO.NotifyFilters]::FileName -bor [System.IO.NotifyFilters]::DirectoryName -bor [System.IO.NotifyFilters]::Attributes -bor [System.IO.NotifyFilters]::Size -bor [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::LastAccess -bor [System.IO.NotifyFilters]::CreationTime -bor [System.IO.NotifyFilters]::Security
            }
            
            $watcher.NotifyFilter = $notifyFilterEnum
            
            # Register event handlers
            $action = {
                param($eventSender, $e)
                $this.HandleFileSystemChange($WatcherName, $e)
            }.GetNewClosure()
            
            Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action | Out-Null
            Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action | Out-Null
            Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action $action | Out-Null
            
            $watcher.EnableRaisingEvents = $true
            $this.ActiveWatchers[$WatcherName] = $watcher
            
            Write-RealTimeLog -Message "File system watcher '$WatcherName' started for path: $Path" -Level "SUCCESS"
        } catch {
            Write-RealTimeLog -Message "Failed to create file system watcher '$WatcherName': $($_.Exception.Message)" -Level "ERROR"
        }
    }
    
    # Justification: $EventArgs is an explicit parameter in the method signature, not an automatic variable
    [System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("PSAvoidAssignmentToAutomaticVariable", "")]
    [void] HandleFileSystemChange([string]$WatcherName, [System.IO.FileSystemEventArgs]$EventArgs) {
        try {
            $changeInfo = @{
                WatcherName = $WatcherName
                ChangeType = $EventArgs.ChangeType
                FullPath = $EventArgs.FullPath
                Name = $EventArgs.Name
                Timestamp = Get-Date
            }
            
            # Add to change queue
            $changeKey = "$WatcherName-$($EventArgs.FullPath)"
            $this.ChangeQueue[$changeKey] = $changeInfo
            
            Write-RealTimeLog -Message "File system change detected - $WatcherName`: $($EventArgs.ChangeType) - $($EventArgs.Name)" -Level "DEBUG"
            
            # Trigger immediate discovery for critical changes
            if ($WatcherName -eq "AD_Changes" -or $WatcherName -eq "GPO_Changes") {
                $this.TriggerImmediateDiscovery($WatcherName)
            }
        } catch {
            Write-RealTimeLog -Message "Error handling file system change: $($_.Exception.Message)" -Level "ERROR"
        }
    }
    
    [void] StartBackgroundTimer() {
        Write-RealTimeLog -Message "Starting background discovery timer (interval: $($this.DiscoveryInterval) seconds)" -Level "INFO"

        $timerCallback = {
            param($state)
            try {
                $this.ExecuteScheduledDiscovery()
            } catch {
                Write-RealTimeLog -Message "Error in background timer: $($_.Exception.Message)" -Level "ERROR"
            }
        }.GetNewClosure()

        $dueTime = $this.DiscoveryInterval * 1000
        Write-RealTimeLog -Message "Creating timer with dueTime: $dueTime (Type: $($dueTime.GetType().Name))" -Level "DEBUG"
        $this.BackgroundTimer = New-Object System.Threading.Timer($timerCallback, $null, $dueTime, $dueTime)
    }
    
    [void] StartEventLogMonitoring() {
        Write-RealTimeLog -Message "Starting event log monitoring" -Level "INFO"
        
        try {
            # Monitor Security event log for authentication events
            $this.StartEventLogWatcher("Security", @(4624, 4625, 4648, 4672))
            
            # Monitor System event log for service and hardware changes
            $this.StartEventLogWatcher("System", @(7034, 7035, 7036, 7040))
            
            # Monitor Application event log for software events
            $this.StartEventLogWatcher("Application", @(1000, 1001, 1002))
        } catch {
            Write-RealTimeLog -Message "Failed to start event log monitoring: $($_.Exception.Message)" -Level "ERROR"
        }
    }
    
    [void] StartEventLogWatcher([string]$LogName, [int[]]$EventIDs) {
        try {
            $query = "*[System[("
            for ($i = 0; $i -lt $EventIDs.Count; $i++) {
                if ($i -gt 0) { $query += " or " }
                $query += "EventID=$($EventIDs[$i])"
            }
            $query += ")]]"
            
            $watcher = New-Object System.Diagnostics.Eventing.Reader.EventLogWatcher($query, $LogName)
            
            $action = {
                param($eventSender, $e)
                $this.HandleEventLogChange($LogName, $e.EventRecord)
            }.GetNewClosure()
            
            $watcher.add_EventRecordWritten($action)
            $watcher.Enabled = $true
            
            $this.ActiveWatchers["EventLog_$LogName"] = $watcher
            Write-RealTimeLog -Message "Event log watcher started for $LogName" -Level "SUCCESS"
        } catch {
            Write-RealTimeLog -Message "Failed to start event log watcher for $LogName`: $($_.Exception.Message)" -Level "ERROR"
        }
    }
    
    [void] HandleEventLogChange([string]$LogName, [System.Diagnostics.Eventing.Reader.EventRecord]$EventRecord) {
        try {
            $changeInfo = @{
                LogName = $LogName
                EventID = $EventRecord.Id
                TimeCreated = $EventRecord.TimeCreated
                LevelDisplayName = $EventRecord.LevelDisplayName
                TaskDisplayName = $EventRecord.TaskDisplayName
                MachineName = $EventRecord.MachineName
            }
            
            # Add to change queue
            $changeKey = "EventLog-$LogName-$($EventRecord.Id)-$($EventRecord.TimeCreated.Ticks)"
            $this.ChangeQueue[$changeKey] = $changeInfo
            
            Write-RealTimeLog -Message "Event log change detected - $LogName`: EventID $($EventRecord.Id)" -Level "DEBUG"
            
            # Trigger discovery for security-related events
            if ($LogName -eq "Security" -and $EventRecord.Id -in @(4624, 4625, 4672)) {
                $this.TriggerImmediateDiscovery("SecurityEvent")
            }
        } catch {
            Write-RealTimeLog -Message "Error handling event log change: $($_.Exception.Message)" -Level "ERROR"
        }
    }
    
    [void] ExecuteScheduledDiscovery() {
        if (-not $this.IsRunning) {
            return
        }
        
        Write-RealTimeLog -Message "Executing scheduled background discovery" -Level "INFO"
        
        try {
            # Check if enough time has passed since last full discovery
            $timeSinceLastDiscovery = (Get-Date) - $this.LastFullDiscovery
            if ($timeSinceLastDiscovery.TotalMinutes -lt ($this.DiscoveryInterval / 60)) {
                Write-RealTimeLog -Message "Skipping discovery - too soon since last run" -Level "DEBUG"
                return
            }
            
            # Process accumulated changes
            $this.ProcessChangeQueue()
            
            # Execute incremental discovery
            $this.ExecuteIncrementalDiscovery()
            
            $this.LastFullDiscovery = Get-Date
        } catch {
            Write-RealTimeLog -Message "Error in scheduled discovery: $($_.Exception.Message)" -Level "ERROR"
        }
    }
    
    [void] ProcessChangeQueue() {
        if ($this.ChangeQueue.Count -eq 0) {
            return
        }
        
        Write-RealTimeLog -Message "Processing $($this.ChangeQueue.Count) accumulated changes" -Level "INFO"
        
        try {
            # Group changes by type
            $changesByType = @{}
            foreach ($change in $this.ChangeQueue.Values) {
                $type = $change.WatcherName -replace "_Changes", ""
                if (-not $changesByType.ContainsKey($type)) {
                    $changesByType[$type] = @()
                }
                $changesByType[$type] += $change
            }
            
            # Process each type of change
            foreach ($type in $changesByType.Keys) {
                $changes = $changesByType[$type]
                Write-RealTimeLog -Message "Processing $($changes.Count) changes for type: $type" -Level "DEBUG"
                
                # Trigger specific discovery modules based on change type
                switch ($type) {
                    "AD" { $this.TriggerModuleDiscovery("ActiveDirectoryDiscovery") }
                    "GPO" { $this.TriggerModuleDiscovery("GPODiscovery") }
                    "Cert" { $this.TriggerModuleDiscovery("CertificateAuthorityDiscovery") }
                    "Software" { $this.TriggerModuleDiscovery("ApplicationDiscovery") }
                    default { Write-RealTimeLog -Message "Unknown change type: $type" -Level "WARN" }
                }
            }
            
            # Clear processed changes
            $this.ChangeQueue.Clear()
        } catch {
            Write-RealTimeLog -Message "Error processing change queue: $($_.Exception.Message)" -Level "ERROR"
        }
    }
    
    [void] ExecuteIncrementalDiscovery() {
        Write-RealTimeLog -Message "Executing incremental discovery" -Level "INFO"
        
        try {
            # Run lightweight discovery modules
            $modulesToRun = @(
                "NetworkInfrastructureDiscovery",
                "DNSDHCPDiscovery",
                "SecurityInfrastructureDiscovery"
            )
            
            foreach ($module in $modulesToRun) {
                $this.TriggerModuleDiscovery($module)
            }
        } catch {
            Write-RealTimeLog -Message "Error in incremental discovery: $($_.Exception.Message)" -Level "ERROR"
        }
    }
    
    [void] TriggerImmediateDiscovery([string]$TriggerType) {
        Write-RealTimeLog -Message "Triggering immediate discovery for: $TriggerType" -Level "INFO"
        
        # This would integrate with the main discovery orchestrator
        # For now, just log the trigger
        Write-RealTimeLog -Message "Immediate discovery triggered by: $TriggerType at $(Get-Date)" -Level "SUCCESS"
    }
    
    [void] TriggerModuleDiscovery([string]$ModuleName) {
        Write-RealTimeLog -Message "Triggering discovery for module: $ModuleName" -Level "DEBUG"
        
        # This would integrate with the main discovery orchestrator
        # For now, just log the module trigger
        Write-RealTimeLog -Message "Module discovery triggered: $ModuleName at $(Get-Date)" -Level "DEBUG"
    }
    
    [hashtable] GetRealTimeStatus() {
        return @{
            IsRunning = $this.IsRunning
            ActiveWatchers = $this.ActiveWatchers.Keys -join ', '
            ChangeQueueSize = $this.ChangeQueue.Count
            LastFullDiscovery = $this.LastFullDiscovery
            DiscoveryInterval = $this.DiscoveryInterval
            SessionId = $this.SessionId
        }
    }
}

function Write-RealTimeLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "[RealTime] $Message" -Level $Level -Component "RealTimeDiscoveryEngine" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Write-Host "[$timestamp] [$Level] [RealTime] $Message" -ForegroundColor $(
            switch ($Level) {
                'ERROR' { 'Red' }
                'WARN' { 'Yellow' }
                'SUCCESS' { 'Green' }
                'DEBUG' { 'Gray' }
                default { 'White' }
            }
        )
    }
}

function Start-RealTimeDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )
    
    Write-RealTimeLog -Message "Initializing real-time discovery engine" -Level "INFO"
    
    try {
        $global:RealTimeEngine = [RealTimeDiscoveryEngine]::new($Configuration, $Context, $SessionId)
        $global:RealTimeEngine.StartRealTimeDiscovery()
        
        return $global:RealTimeEngine.GetRealTimeStatus()
    } catch {
        Write-RealTimeLog -Message "Failed to start real-time discovery: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Stop-RealTimeDiscovery {
    [CmdletBinding()]
    param()
    
    if ($global:RealTimeEngine) {
        $global:RealTimeEngine.StopRealTimeDiscovery()
        $global:RealTimeEngine = $null
        Write-RealTimeLog -Message "Real-time discovery engine stopped" -Level "SUCCESS"
    } else {
        Write-RealTimeLog -Message "No real-time discovery engine is currently running" -Level "WARN"
    }
}

function Get-RealTimeDiscoveryStatus {
    [CmdletBinding()]
    param()
    
    if ($global:RealTimeEngine) {
        return $global:RealTimeEngine.GetRealTimeStatus()
    } else {
        return @{
            IsRunning = $false
            Status = "Not Started"
        }
    }
}

# Diagnostic: Adding Invoke wrapper for discovery launcher compatibility
function Invoke-RealTimeDiscoveryEngine {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    try {
        Write-RealTimeLog -Message "Invoked via DiscoveryLauncher - delegating to Start-RealTimeDiscovery" -Level "INFO"
        return Start-RealTimeDiscovery -Configuration $Configuration -Context $Context -SessionId $SessionId
    } catch {
        Write-RealTimeLog -Message "Invoke wrapper failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

Export-ModuleMember -Function Start-RealTimeDiscovery, Stop-RealTimeDiscovery, Get-RealTimeDiscoveryStatus, Invoke-RealTimeDiscoveryEngine