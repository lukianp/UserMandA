# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Scheduled task discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers Windows scheduled tasks, their configurations, triggers, and actions
    to provide comprehensive automation and maintenance task inventory for M&A
    infrastructure assessment.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, ScheduledTasks module
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-ScheduledTaskLog {
    <#
    .SYNOPSIS
        Writes log entries specific to scheduled task discovery.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[ScheduledTask] $Message" -Level $Level -Component "ScheduledTaskDiscovery" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        $logMessage = "[$timestamp] [$Level] [ScheduledTask] $Message"
        switch ($Level) {
            'ERROR' { Write-Error "[ScheduledTaskDiscovery] $logMessage" }
            'WARN' { Write-Warning "[ScheduledTaskDiscovery] $logMessage" }
            'SUCCESS' { Write-Information "[ScheduledTaskDiscovery] $logMessage" -InformationAction Continue }
            'DEBUG' { Write-Verbose "[ScheduledTaskDiscovery] $logMessage" -Verbose }
            default { Write-Information "[ScheduledTaskDiscovery] $logMessage" -InformationAction Continue }
        }
    }
}

function Invoke-ScheduledTaskDiscovery {
    <#
    .SYNOPSIS
        Main scheduled task discovery function.
    
    .DESCRIPTION
        Discovers Windows scheduled tasks including their triggers, actions,
        conditions, and settings to provide comprehensive automation inventory.
    
    .PARAMETER Configuration
        Discovery configuration hashtable.
    
    .PARAMETER Context
        Execution context with paths and session information.
    
    .PARAMETER SessionId
        Unique session identifier for tracking.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ScheduledTaskLog -Level "HEADER" -Message "Starting Scheduled Task Discovery (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = @{
        Success = $true
        ModuleName = 'ScheduledTaskDiscovery'
        RecordCount = 0
        Errors = [System.Collections.ArrayList]::new()
        Warnings = [System.Collections.ArrayList]::new()
        Metadata = @{}
        StartTime = Get-Date
        EndTime = $null
        ExecutionId = [guid]::NewGuid().ToString()
        AddError = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
        AddWarning = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
        Complete = { $this.EndTime = Get-Date }.GetNewClosure()
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
        }

        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Scheduled Tasks
        try {
            Write-ScheduledTaskLog -Level "INFO" -Message "Discovering scheduled tasks..." -Context $Context
            $taskData = Get-WindowsScheduledTasks -SessionId $SessionId
            if ($taskData.Count -gt 0) {
                $taskData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'ScheduledTask' -Force }
                $null = $allDiscoveredData.AddRange($taskData)
                $result.Metadata["ScheduledTaskCount"] = $taskData.Count
            }
            Write-ScheduledTaskLog -Level "SUCCESS" -Message "Discovered $($taskData.Count) scheduled tasks" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover scheduled tasks: $($_.Exception.Message)", @{Section="ScheduledTasks"})
        }
        
        # Discover Task Triggers
        try {
            Write-ScheduledTaskLog -Level "INFO" -Message "Discovering task triggers..." -Context $Context
            $triggerData = Get-TaskTriggers -SessionId $SessionId
            if ($triggerData.Count -gt 0) {
                $triggerData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'TaskTrigger' -Force }
                $null = $allDiscoveredData.AddRange($triggerData)
                $result.Metadata["TaskTriggerCount"] = $triggerData.Count
            }
            Write-ScheduledTaskLog -Level "SUCCESS" -Message "Discovered $($triggerData.Count) task triggers" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover task triggers: $($_.Exception.Message)", @{Section="TaskTriggers"})
        }
        
        # Discover Task Actions
        try {
            Write-ScheduledTaskLog -Level "INFO" -Message "Discovering task actions..." -Context $Context
            $actionData = Get-TaskActions -SessionId $SessionId
            if ($actionData.Count -gt 0) {
                $actionData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'TaskAction' -Force }
                $null = $allDiscoveredData.AddRange($actionData)
                $result.Metadata["TaskActionCount"] = $actionData.Count
            }
            Write-ScheduledTaskLog -Level "SUCCESS" -Message "Discovered $($actionData.Count) task actions" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover task actions: $($_.Exception.Message)", @{Section="TaskActions"})
        }
        
        # Generate Task Summary
        try {
            Write-ScheduledTaskLog -Level "INFO" -Message "Generating task summary..." -Context $Context
            $summary = Get-ScheduledTaskSummary -TaskData ($allDiscoveredData | Where-Object { $_._DataType -eq 'ScheduledTask' }) -SessionId $SessionId
            if ($summary.Count -gt 0) {
                $summary | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'TaskSummary' -Force }
                $null = $allDiscoveredData.AddRange($summary)
                $result.Metadata["TaskSummaryCount"] = $summary.Count
            }
            Write-ScheduledTaskLog -Level "SUCCESS" -Message "Generated task summary" -Context $Context
        } catch {
            $result.AddWarning("Failed to generate task summary: $($_.Exception.Message)", @{Section="TaskSummary"})
        }

        # Export data to CSV files
        if ($allDiscoveredData.Count -gt 0) {
            Write-ScheduledTaskLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "ScheduledTask_$dataType.csv"
                $filePath = Join-Path $outputPath $fileName
                
                # Add metadata to each record
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "ScheduledTaskDiscovery" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                # Export to CSV
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-ScheduledTaskLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-ScheduledTaskLog -Level "WARN" -Message "No scheduled task data discovered to export" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-ScheduledTaskLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during scheduled task discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-ScheduledTaskLog -Level "HEADER" -Message "Scheduled task discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

function Get-WindowsScheduledTasks {
    <#
    .SYNOPSIS
        Discovers Windows scheduled tasks and their basic information.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $tasks = @()
    
    try {
        # Check if ScheduledTasks module is available
        if (-not (Get-Module -Name ScheduledTasks -ListAvailable)) {
            Write-ScheduledTaskLog -Level "WARN" -Message "ScheduledTasks module not available, using COM interface"
            
            # Fallback to COM interface
            $taskScheduler = New-Object -ComObject Schedule.Service
            $taskScheduler.Connect()
            $rootFolder = $taskScheduler.GetFolder("\")
            $allTasks = $rootFolder.GetTasks(0)
            
            foreach ($task in $allTasks) {
                $tasks += [PSCustomObject]@{
                    TaskName = $task.Name
                    TaskPath = $task.Path
                    State = $task.State
                    LastRunTime = $task.LastRunTime
                    NextRunTime = $task.NextRunTime
                    LastTaskResult = $task.LastTaskResult
                    NumberOfMissedRuns = $task.NumberOfMissedRuns
                    Enabled = $task.Enabled
                    Hidden = $task.Definition.Settings.Hidden
                    Author = $task.Definition.RegistrationInfo.Author
                    Description = $task.Definition.RegistrationInfo.Description
                    Date = $task.Definition.RegistrationInfo.Date
                    Version = $task.Definition.RegistrationInfo.Version
                    Source = "COM"
                    SessionId = $SessionId
                }
            }
            
            return $tasks
        }
        
        Import-Module ScheduledTasks -ErrorAction Stop
        
        # Get all scheduled tasks
        $scheduledTasks = Get-ScheduledTask -ErrorAction Stop
        
        foreach ($task in $scheduledTasks) {
            try {
                $taskInfo = Get-ScheduledTaskInfo -TaskName $task.TaskName -TaskPath $task.TaskPath -ErrorAction SilentlyContinue
                
                $tasks += [PSCustomObject]@{
                    TaskName = $task.TaskName
                    TaskPath = $task.TaskPath
                    State = $task.State
                    Author = $task.Author
                    Description = $task.Description
                    Date = $task.Date
                    Version = $task.Version
                    Source = $task.Source
                    URI = $task.URI
                    SecurityDescriptor = $task.SecurityDescriptor
                    Principal = $task.Principal.UserId
                    PrincipalLogonType = $task.Principal.LogonType
                    PrincipalRunLevel = $task.Principal.RunLevel
                    LastRunTime = if ($taskInfo) { $taskInfo.LastRunTime } else { $null }
                    NextRunTime = if ($taskInfo) { $taskInfo.NextRunTime } else { $null }
                    LastTaskResult = if ($taskInfo) { $taskInfo.LastTaskResult } else { $null }
                    NumberOfMissedRuns = if ($taskInfo) { $taskInfo.NumberOfMissedRuns } else { 0 }
                    TaskResult = if ($taskInfo) { $taskInfo.TaskResult } else { $null }
                    SettingsEnabled = $task.Settings.Enabled
                    SettingsHidden = $task.Settings.Hidden
                    SettingsAllowDemandStart = $task.Settings.AllowDemandStart
                    SettingsAllowHardTerminate = $task.Settings.AllowHardTerminate
                    SettingsCompatibility = $task.Settings.Compatibility
                    SettingsDeleteExpiredTaskAfter = $task.Settings.DeleteExpiredTaskAfter
                    SettingsDisallowStartIfOnBatteries = $task.Settings.DisallowStartIfOnBatteries
                    SettingsExecutionTimeLimit = $task.Settings.ExecutionTimeLimit
                    SettingsIdleSettings = $task.Settings.IdleSettings
                    SettingsMultipleInstances = $task.Settings.MultipleInstances
                    SettingsNetworkSettings = $task.Settings.NetworkSettings
                    SettingsPriority = $task.Settings.Priority
                    SettingsRestartCount = $task.Settings.RestartCount
                    SettingsRestartInterval = $task.Settings.RestartInterval
                    SettingsRunOnlyIfIdle = $task.Settings.RunOnlyIfIdle
                    SettingsRunOnlyIfNetworkAvailable = $task.Settings.RunOnlyIfNetworkAvailable
                    SettingsStartWhenAvailable = $task.Settings.StartWhenAvailable
                    SettingsStopIfGoingOnBatteries = $task.Settings.StopIfGoingOnBatteries
                    SettingsWakeToRun = $task.Settings.WakeToRun
                    TriggerCount = $task.Triggers.Count
                    ActionCount = $task.Actions.Count
                    SessionId = $SessionId
                }
            } catch {
                Write-ScheduledTaskLog -Level "DEBUG" -Message "Failed to get details for task $($task.TaskName): $($_.Exception.Message)"
            }
        }
        
    } catch {
        Write-ScheduledTaskLog -Level "ERROR" -Message "Failed to discover scheduled tasks: $($_.Exception.Message)"
    }
    
    return $tasks
}

function Get-TaskTriggers {
    <#
    .SYNOPSIS
        Discovers triggers for all scheduled tasks.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $triggers = @()
    
    try {
        if (-not (Get-Module -Name ScheduledTasks -ListAvailable)) {
            Write-ScheduledTaskLog -Level "WARN" -Message "ScheduledTasks module not available for trigger discovery"
            return $triggers
        }
        
        Import-Module ScheduledTasks -ErrorAction Stop
        
        $scheduledTasks = Get-ScheduledTask -ErrorAction Stop
        
        foreach ($task in $scheduledTasks) {
            try {
                foreach ($trigger in $task.Triggers) {
                    $triggers += [PSCustomObject]@{
                        TaskName = $task.TaskName
                        TaskPath = $task.TaskPath
                        TriggerId = $trigger.Id
                        TriggerType = $trigger.CimClass.CimClassName
                        Enabled = $trigger.Enabled
                        StartBoundary = $trigger.StartBoundary
                        EndBoundary = $trigger.EndBoundary
                        ExecutionTimeLimit = $trigger.ExecutionTimeLimit
                        Repetition = if ($trigger.Repetition) { 
                            "Duration: $($trigger.Repetition.Duration), Interval: $($trigger.Repetition.Interval), StopAtDurationEnd: $($trigger.Repetition.StopAtDurationEnd)"
                        } else { "" }
                        RandomDelay = $trigger.RandomDelay
                        # Type-specific properties
                        DaysInterval = if ($trigger.DaysInterval) { $trigger.DaysInterval } else { $null }
                        WeeksInterval = if ($trigger.WeeksInterval) { $trigger.WeeksInterval } else { $null }
                        DaysOfWeek = if ($trigger.DaysOfWeek) { $trigger.DaysOfWeek } else { $null }
                        MonthsOfYear = if ($trigger.MonthsOfYear) { $trigger.MonthsOfYear } else { $null }
                        DaysOfMonth = if ($trigger.DaysOfMonth) { $trigger.DaysOfMonth } else { $null }
                        WeeksOfMonth = if ($trigger.WeeksOfMonth) { $trigger.WeeksOfMonth } else { $null }
                        UserId = if ($trigger.UserId) { $trigger.UserId } else { $null }
                        Delay = if ($trigger.Delay) { $trigger.Delay } else { $null }
                        SessionId = $SessionId
                    }
                }
            } catch {
                Write-ScheduledTaskLog -Level "DEBUG" -Message "Failed to get triggers for task $($task.TaskName): $($_.Exception.Message)"
            }
        }
        
    } catch {
        Write-ScheduledTaskLog -Level "ERROR" -Message "Failed to discover task triggers: $($_.Exception.Message)"
    }
    
    return $triggers
}

function Get-TaskActions {
    <#
    .SYNOPSIS
        Discovers actions for all scheduled tasks.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $actions = @()
    
    try {
        if (-not (Get-Module -Name ScheduledTasks -ListAvailable)) {
            Write-ScheduledTaskLog -Level "WARN" -Message "ScheduledTasks module not available for action discovery"
            return $actions
        }
        
        Import-Module ScheduledTasks -ErrorAction Stop
        
        $scheduledTasks = Get-ScheduledTask -ErrorAction Stop
        
        foreach ($task in $scheduledTasks) {
            try {
                foreach ($action in $task.Actions) {
                    $actions += [PSCustomObject]@{
                        TaskName = $task.TaskName
                        TaskPath = $task.TaskPath
                        ActionId = $action.Id
                        ActionType = $action.CimClass.CimClassName
                        # Exec Action properties
                        Execute = if ($action.Execute) { $action.Execute } else { $null }
                        Arguments = if ($action.Arguments) { $action.Arguments } else { $null }
                        WorkingDirectory = if ($action.WorkingDirectory) { $action.WorkingDirectory } else { $null }
                        # Email Action properties (if applicable)
                        From = if ($action.From) { $action.From } else { $null }
                        To = if ($action.To) { $action.To } else { $null }
                        Subject = if ($action.Subject) { $action.Subject } else { $null }
                        Body = if ($action.Body) { $action.Body } else { $null }
                        Server = if ($action.Server) { $action.Server } else { $null }
                        # Show Message Action properties (if applicable)
                        Title = if ($action.Title) { $action.Title } else { $null }
                        MessageBody = if ($action.MessageBody) { $action.MessageBody } else { $null }
                        SessionId = $SessionId
                    }
                }
            } catch {
                Write-ScheduledTaskLog -Level "DEBUG" -Message "Failed to get actions for task $($task.TaskName): $($_.Exception.Message)"
            }
        }
        
    } catch {
        Write-ScheduledTaskLog -Level "ERROR" -Message "Failed to discover task actions: $($_.Exception.Message)"
    }
    
    return $actions
}

function Get-ScheduledTaskSummary {
    <#
    .SYNOPSIS
        Generates a summary of scheduled task discovery results.
    #>
    [CmdletBinding()]
    param(
        [array]$TaskData,
        [string]$SessionId
    )
    
    $summary = @()
    
    try {
        # Overall summary
        $totalTasks = $TaskData.Count
        $enabledTasks = ($TaskData | Where-Object { $_.SettingsEnabled -eq $true }).Count
        $disabledTasks = $totalTasks - $enabledTasks
        $hiddenTasks = ($TaskData | Where-Object { $_.SettingsHidden -eq $true }).Count
        $runningTasks = ($TaskData | Where-Object { $_.State -eq 'Running' }).Count
        $readyTasks = ($TaskData | Where-Object { $_.State -eq 'Ready' }).Count
        
        # State distribution
        $stateDistribution = $TaskData | Group-Object State | Select-Object @{Name="State";Expression={$_.Name}}, @{Name="Count";Expression={$_.Count}}
        
        # Author distribution
        $authorDistribution = $TaskData | Group-Object Author | Select-Object @{Name="Author";Expression={$_.Name}}, @{Name="Count";Expression={$_.Count}} | Sort-Object Count -Descending | Select-Object -First 10
        
        $summary += [PSCustomObject]@{
            SummaryType = "Overall"
            TotalTasks = $totalTasks
            EnabledTasks = $enabledTasks
            DisabledTasks = $disabledTasks
            HiddenTasks = $hiddenTasks
            RunningTasks = $runningTasks
            ReadyTasks = $readyTasks
            MicrosoftTasks = ($TaskData | Where-Object { $_.Author -like "*Microsoft*" }).Count
            CustomTasks = ($TaskData | Where-Object { $_.Author -notlike "*Microsoft*" -and $_.Author -ne $null -and $_.Author -ne "" }).Count
            SystemTasks = ($TaskData | Where-Object { $_.TaskPath -like "\Microsoft\*" }).Count
            RootTasks = ($TaskData | Where-Object { $_.TaskPath -eq "\" }).Count
            RecentlyRunTasks = ($TaskData | Where-Object { $_.LastRunTime -and $_.LastRunTime -gt (Get-Date).AddDays(-7) }).Count
            FailedTasks = ($TaskData | Where-Object { $_.LastTaskResult -and $_.LastTaskResult -ne 0 }).Count
            ScanDate = Get-Date
            SessionId = $SessionId
        }
        
        # State-specific summaries
        foreach ($state in ($stateDistribution | Where-Object { $_.Count -gt 0 })) {
            $summary += [PSCustomObject]@{
                SummaryType = "StateBreakdown"
                State = $state.State
                Count = $state.Count
                Percentage = [math]::Round(($state.Count / $totalTasks) * 100, 2)
                ScanDate = Get-Date
                SessionId = $SessionId
            }
        }
        
        # Top authors summary
        foreach ($author in ($authorDistribution | Where-Object { $_.Count -gt 1 })) {
            $summary += [PSCustomObject]@{
                SummaryType = "AuthorBreakdown"
                Author = if ($author.Author) { $author.Author } else { "Unknown" }
                TaskCount = $author.Count
                Percentage = [math]::Round(($author.Count / $totalTasks) * 100, 2)
                ScanDate = Get-Date
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-ScheduledTaskLog -Level "ERROR" -Message "Failed to generate task summary: $($_.Exception.Message)"
    }
    
    return $summary
}

# Export functions
Export-ModuleMember -Function Invoke-ScheduledTaskDiscovery
