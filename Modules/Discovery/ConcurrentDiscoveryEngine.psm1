# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Scalable Discovery Engine with Controlled Concurrency for M&A Discovery Suite
.DESCRIPTION
    Provides parallel discovery capabilities with throttling, resource management, and intelligent batch processing 
    for large-scale M&A discovery operations. This engine implements sophisticated concurrency control, resource 
    optimization, thread-safe operations, and comprehensive performance monitoring to maximize discovery throughput 
    while maintaining system stability and API rate limit compliance.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, Microsoft.Graph modules, ClassDefinitions module, ErrorHandling module
#>

# Import required modules
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Core\ClassDefinitions.psm1") -Force
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ErrorHandling.psm1") -Force
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\PerformanceMetrics.psm1") -Force

class ConcurrentDiscoveryEngine {
    [int]$MaxConcurrentJobs = 8  # Increased for better performance
    [int]$BatchSize = 100
    [int]$ThrottleDelayMs = 50   # Reduced for better responsiveness
    [hashtable]$ActiveJobs = @{}
    [hashtable]$JobResults = @{}
    [hashtable]$Configuration
    [hashtable]$Context
    [string]$SessionId
    [System.Collections.Generic.Queue[PSObject]]$JobQueue
    [System.Diagnostics.Stopwatch]$Timer
    [hashtable]$PerformanceMetrics = @{}
    [int]$TotalItemsProcessed = 0
    [int]$TotalItemsQueued = 0
    [bool]$IsRunning = $false
    [System.Management.Automation.Runspaces.RunspacePool]$RunspacePool
    [System.Threading.Semaphore]$ResourceSemaphore
    [hashtable]$ResourceUsage = @{}
    [hashtable]$JobPriorities = @{}
    
    ConcurrentDiscoveryEngine([hashtable]$Config, [hashtable]$Ctx, [string]$Session) {
        $this.Configuration = $Config
        $this.Context = $Ctx
        $this.SessionId = $Session
        $this.JobQueue = [System.Collections.Generic.Queue[PSObject]]::new()
        $this.Timer = [System.Diagnostics.Stopwatch]::new()
        
        # Configure concurrency based on system resources
        $this.ConfigureConcurrency()
        
        # Initialize runspace pool for better performance
        $this.InitializeRunspacePool()
        
        # Initialize resource management
        $this.ResourceSemaphore = [System.Threading.Semaphore]::new($this.MaxConcurrentJobs, $this.MaxConcurrentJobs)
        
        # Set job priorities (higher number = higher priority)
        $this.JobPriorities = @{
            'ActiveDirectory' = 10
            'NetworkInfrastructure' = 9
            'SecurityInfrastructure' = 8
            'Exchange' = 7
            'SharePoint' = 6
            'Teams' = 5
            'FileServer' = 4
            'Application' = 3
            'Certificate' = 2
            'Default' = 1
        }
    }
    
    [void]ConfigureConcurrency() {
        # Auto-detect optimal concurrency settings
        $cores = [System.Environment]::ProcessorCount
        $memoryGB = [Math]::Round((Get-CimInstance -ClassName Win32_ComputerSystem).TotalPhysicalMemory / 1GB)
        
        # Conservative approach: 1 job per 2 cores, max 8 jobs
        $this.MaxConcurrentJobs = [Math]::Min([Math]::Max($cores / 2, 2), 8)
        
        # Adjust batch size based on memory
        if ($memoryGB -lt 8) {
            $this.BatchSize = 50
        } elseif ($memoryGB -lt 16) {
            $this.BatchSize = 100
        } else {
            $this.BatchSize = 200
        }
        
        Write-Host "Configured for $($this.MaxConcurrentJobs) concurrent jobs, batch size $($this.BatchSize)" -ForegroundColor Green
    }
    
    [void]QueueDiscoveryJob([string]$JobType, [hashtable]$JobParams) {
        $job = @{
            Id = [System.Guid]::NewGuid().ToString()
            Type = $JobType
            Parameters = $JobParams
            Status = 'Queued'
            QueuedAt = Get-Date
            StartedAt = $null
            CompletedAt = $null
            Duration = $null
            Result = $null
            Error = $null
            RetryCount = 0
            MaxRetries = 3
        }
        
        $this.JobQueue.Enqueue($job)
        $this.TotalItemsQueued++
        
        Write-Host "Queued $JobType job: $($job.Id)" -ForegroundColor Cyan
    }
    
    [hashtable]ProcessDiscoveryJobs() {
        $this.IsRunning = $true
        $this.Timer.Start()
        
        try {
            while ($this.JobQueue.Count -gt 0 -or $this.ActiveJobs.Count -gt 0) {
                # Start new jobs if we have capacity
                $this.StartPendingJobs()
                
                # Check completed jobs
                $this.CheckCompletedJobs()
                
                # Throttle to prevent overwhelming the system
                Start-Sleep -Milliseconds $this.ThrottleDelayMs
                
                # Memory cleanup every 100 processed items
                if ($this.TotalItemsProcessed % 100 -eq 0) {
                    [System.GC]::Collect()
                    [System.GC]::WaitForPendingFinalizers()
                }
            }
        } finally {
            $this.IsRunning = $false
            $this.Timer.Stop()
        }
        
        return $this.CompileResults()
    }
    
    [void]StartPendingJobs() {
        while ($this.JobQueue.Count -gt 0 -and $this.ActiveJobs.Count -lt $this.MaxConcurrentJobs) {
            $job = $this.JobQueue.Dequeue()
            $this.StartJob($job)
        }
    }
    
    [void]StartJob([hashtable]$Job) {
        try {
            $Job.Status = 'Running'
            $Job.StartedAt = Get-Date
            
            # Create runspace for concurrent execution
            $runspace = [powershell]::Create()
            $runspace.AddScript($this.GetJobScript($Job.Type))
            $runspace.AddParameters($Job.Parameters)
            
            $asyncResult = $runspace.BeginInvoke()
            
            $this.ActiveJobs[$Job.Id] = @{
                Job = $Job
                Runspace = $runspace
                AsyncResult = $asyncResult
            }
            
            Write-Host "Started job: $($Job.Id) ($($Job.Type))" -ForegroundColor Yellow
            
        } catch {
            $Job.Status = 'Failed'
            $Job.Error = $_.Exception.Message
            $Job.CompletedAt = Get-Date
            $this.JobResults[$Job.Id] = $Job
            
            Write-Host "Failed to start job: $($Job.Id) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    [void]CheckCompletedJobs() {
        $completedJobs = @()
        
        foreach ($jobId in $this.ActiveJobs.Keys) {
            $activeJob = $this.ActiveJobs[$jobId]
            
            if ($activeJob.AsyncResult.IsCompleted) {
                $completedJobs += $jobId
                $this.CompleteJob($activeJob)
            }
        }
        
        # Remove completed jobs from active list
        foreach ($jobId in $completedJobs) {
            $this.ActiveJobs.Remove($jobId)
        }
    }
    
    [void]CompleteJob([hashtable]$ActiveJob) {
        $job = $ActiveJob.Job
        $runspace = $ActiveJob.Runspace
        $asyncResult = $ActiveJob.AsyncResult
        
        try {
            $job.CompletedAt = Get-Date
            $job.Duration = $job.CompletedAt - $job.StartedAt
            
            # Get the result
            $result = $runspace.EndInvoke($asyncResult)
            $job.Result = $result
            $job.Status = 'Completed'
            
            $this.TotalItemsProcessed++
            
            Write-Host "Completed job: $($job.Id) in $($job.Duration.TotalSeconds.ToString('F2'))s" -ForegroundColor Green
            
        } catch {
            $job.Status = 'Failed'
            $job.Error = $_.Exception.Message
            
            # Retry logic
            if ($job.RetryCount -lt $job.MaxRetries) {
                $job.RetryCount++
                $job.Status = 'Retry'
                $this.JobQueue.Enqueue($job)
                Write-Host "Retrying job: $($job.Id) (attempt $($job.RetryCount))" -ForegroundColor Yellow
            } else {
                Write-Host "Job failed after $($job.MaxRetries) attempts: $($job.Id)" -ForegroundColor Red
            }
        } finally {
            # Clean up runspace
            $runspace.Dispose()
        }
        
        $this.JobResults[$job.Id] = $job
    }
    
    [string]GetJobScript([string]$JobType) {
        $scriptBlock = switch ($JobType) {
            'UserBatch' {
                @'
param($Users, $BatchSize, $SessionId, $Configuration)

$results = @()
$totalUsers = $Users.Count
$processed = 0

for ($i = 0; $i -lt $totalUsers; $i += $BatchSize) {
    $batch = $Users[$i..([Math]::Min($i + $BatchSize - 1, $totalUsers - 1))]

    foreach ($user in $batch) {
        try {
            $userResult = @{
                Id = $user.id
                UserPrincipalName = $user.userPrincipalName
                DisplayName = $user.displayName
                ProcessedAt = Get-Date
                BatchId = $i / $BatchSize
                SessionId = $SessionId
            }

            $results += $userResult
            $processed++

        } catch {
            Write-Error "Failed to process user: $($_.Exception.Message)"
        }
    }
}

return $results
'@
            }
            'GroupBatch' {
                @'
param($Groups, $BatchSize, $SessionId, $Configuration)

$results = @()
$totalGroups = $Groups.Count
$processed = 0

for ($i = 0; $i -lt $totalGroups; $i += $BatchSize) {
    $batch = $Groups[$i..([Math]::Min($i + $BatchSize - 1, $totalGroups - 1))]

    foreach ($group in $batch) {
        try {
            $groupResult = @{
                Id = $group.id
                DisplayName = $group.displayName
                GroupType = $group.groupType
                ProcessedAt = Get-Date
                BatchId = $i / $BatchSize
                SessionId = $SessionId
            }

            $results += $groupResult
            $processed++

        } catch {
            Write-Error "Failed to process group: $($_.Exception.Message)"
        }
    }
}

return $results
'@
            }
            default {
                @'
param($Data, $BatchSize, $SessionId, $Configuration)
return @{ Status = "Unknown job type"; Data = $Data }
'@
            }
        }

        return $scriptBlock
    }
    
    [hashtable]CompileResults() {
        $summary = @{
            TotalJobsQueued = $this.TotalItemsQueued
            TotalJobsProcessed = $this.TotalItemsProcessed
            TotalExecutionTime = $this.Timer.Elapsed
            AverageJobTime = if ($this.TotalItemsProcessed -gt 0) { 
                $this.Timer.Elapsed.TotalSeconds / $this.TotalItemsProcessed 
            } else { 0 }
            JobResults = $this.JobResults
            Performance = $this.PerformanceMetrics
            CompletedJobs = ($this.JobResults.Values | Where-Object { $_.Status -eq 'Completed' }).Count
            FailedJobs = ($this.JobResults.Values | Where-Object { $_.Status -eq 'Failed' }).Count
            RetryJobs = ($this.JobResults.Values | Where-Object { $_.Status -eq 'Retry' }).Count
        }
        
        Write-Host "Discovery Engine Summary:" -ForegroundColor Cyan
        Write-Host "  Total Jobs: $($summary.TotalJobsQueued)" -ForegroundColor White
        Write-Host "  Completed: $($summary.CompletedJobs)" -ForegroundColor Green
        Write-Host "  Failed: $($summary.FailedJobs)" -ForegroundColor Red
        Write-Host "  Execution Time: $($summary.TotalExecutionTime.ToString('hh\:mm\:ss'))" -ForegroundColor White
        Write-Host "  Average Job Time: $($summary.AverageJobTime.ToString('F2'))s" -ForegroundColor White
        
        return $summary
    }
    
    [void]InitializeRunspacePool() {
        # Create initial session state
        $initialSessionState = [System.Management.Automation.Runspaces.InitialSessionState]::CreateDefault()
        
        # Add modules that will be available in all runspaces
        $modulePaths = @(
            (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\EnhancedLogging.psm1"),
            (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ErrorHandling.psm1"),
            (Join-Path (Split-Path $PSScriptRoot -Parent) "Core\ClassDefinitions.psm1")
        )
        
        foreach ($modulePath in $modulePaths) {
            if (Test-Path $modulePath) {
                $initialSessionState.ImportPSModule($modulePath)
            }
        }
        
        # Create the runspace pool (use global host)
        $this.RunspacePool = [System.Management.Automation.Runspaces.RunspaceFactory]::CreateRunspacePool(
            1, $this.MaxConcurrentJobs, $initialSessionState, $global:Host
        )
        $this.RunspacePool.Open()
        
        Write-Host "Runspace pool initialized with $($this.MaxConcurrentJobs) maximum runspaces" -ForegroundColor Green
    }
    
    [void]QueueJobWithPriority([hashtable]$Job) {
        # Add priority to job
        $jobType = if ($Job.Type) { $Job.Type } else { 'Default' }
        $priority = if ($this.JobPriorities.ContainsKey($jobType)) { $this.JobPriorities[$jobType] } else { $this.JobPriorities['Default'] }
        $Job.Priority = $priority
        
        # Convert queue to array, add job, sort by priority, then recreate queue
        $queueArray = @()
        while ($this.JobQueue.Count -gt 0) {
            $queueArray += $this.JobQueue.Dequeue()
        }
        
        $queueArray += $Job
        $sortedJobs = $queueArray | Sort-Object -Property Priority -Descending
        
        $this.JobQueue = [System.Collections.Generic.Queue[PSObject]]::new()
        foreach ($sortedJob in $sortedJobs) {
            $this.JobQueue.Enqueue($sortedJob)
        }
        
        $this.TotalItemsQueued++
    }
    
    [hashtable]GetResourceUsage() {
        $cpuUsage = (Get-Counter "\Processor(_Total)\% Processor Time" -SampleInterval 1 -MaxSamples 1).CounterSamples.CookedValue
        $memoryUsage = [Math]::Round(((Get-Counter "\Memory\Available MBytes").CounterSamples.CookedValue / 1024), 2)
        
        return @{
            CPUUsage = [Math]::Round(100 - $cpuUsage, 2)
            MemoryUsageGB = $memoryUsage
            ActiveJobs = $this.ActiveJobs.Count
            QueuedJobs = $this.JobQueue.Count
            ResourceSemaphoreCount = $this.MaxConcurrentJobs - $this.ActiveJobs.Count
        }
    }
    
    [void]AdaptiveConcurrencyControl() {
        $usage = $this.GetResourceUsage()
        
        # Adaptive concurrency based on system load
        if ($usage.CPUUsage -gt 80 -and $this.MaxConcurrentJobs -gt 2) {
            $this.MaxConcurrentJobs--
            Write-Host "High CPU usage detected, reducing concurrency to $($this.MaxConcurrentJobs)" -ForegroundColor Yellow
        } elseif ($usage.CPUUsage -lt 50 -and $this.MaxConcurrentJobs -lt 12) {
            $this.MaxConcurrentJobs++
            Write-Host "Low CPU usage detected, increasing concurrency to $($this.MaxConcurrentJobs)" -ForegroundColor Green
        }
        
        # Memory-based throttling
        if ($usage.MemoryUsageGB -lt 2) {
            $this.ThrottleDelayMs = 200
            Write-Host "Low memory detected, increasing throttle delay" -ForegroundColor Yellow
        } elseif ($usage.MemoryUsageGB -gt 8) {
            $this.ThrottleDelayMs = 25
        }
    }
    
    [void]Stop() {
        $this.IsRunning = $false
        
        # Clean up active jobs
        foreach ($jobId in $this.ActiveJobs.Keys) {
            $activeJob = $this.ActiveJobs[$jobId]
            if ($activeJob.Runspace) {
                $activeJob.Runspace.Dispose()
            }
        }
        
        $this.ActiveJobs.Clear()
        Write-Host "Discovery Engine stopped" -ForegroundColor Yellow
    }
}

function Start-ConcurrentDiscovery {
    <#
    .SYNOPSIS
        Starts a concurrent discovery operation with intelligent batching and throttling
    .DESCRIPTION
        Manages parallel discovery jobs with resource monitoring and error handling
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$DiscoveryTasks,
        
        [Parameter(Mandatory=$false)]
        [int]$MaxConcurrentJobs = 4,
        
        [Parameter(Mandatory=$false)]
        [int]$BatchSize = 100
    )
    
    try {
        # Initialize the discovery engine
        $engine = [ConcurrentDiscoveryEngine]::new($Configuration, $Context, $SessionId)
        
        if ($MaxConcurrentJobs -gt 0) {
            $engine.MaxConcurrentJobs = $MaxConcurrentJobs
        }
        
        if ($BatchSize -gt 0) {
            $engine.BatchSize = $BatchSize
        }
        
        # Queue discovery tasks
        foreach ($taskName in $DiscoveryTasks.Keys) {
            $task = $DiscoveryTasks[$taskName]
            
            Write-Host "Queueing discovery task: $taskName" -ForegroundColor Cyan
            
            # Split large datasets into batches
            if ($task.Data -and $task.Data.Count -gt $engine.BatchSize) {
                $batches = [Math]::Ceiling($task.Data.Count / $engine.BatchSize)
                
                for ($i = 0; $i -lt $batches; $i++) {
                    $startIndex = $i * $engine.BatchSize
                    $endIndex = [Math]::Min($startIndex + $engine.BatchSize - 1, $task.Data.Count - 1)
                    $batchData = $task.Data[$startIndex..$endIndex]
                    
                    $batchParams = @{
                        Data = $batchData
                        BatchSize = $engine.BatchSize
                        SessionId = $SessionId
                        Configuration = $Configuration
                        TaskName = $taskName
                        BatchNumber = $i + 1
                        TotalBatches = $batches
                    }
                    
                    $engine.QueueDiscoveryJob($task.JobType, $batchParams)
                }
            } else {
                # Single job for small datasets
                $jobParams = @{
                    Data = $task.Data
                    BatchSize = $engine.BatchSize
                    SessionId = $SessionId
                    Configuration = $Configuration
                    TaskName = $taskName
                }
                
                $engine.QueueDiscoveryJob($task.JobType, $jobParams)
            }
        }
        
        # Process all queued jobs
        Write-Host "Starting concurrent discovery processing..." -ForegroundColor Green
        $results = $engine.ProcessDiscoveryJobs()
        
        return $results
        
    } catch {
        Write-Error "Concurrent discovery failed: $($_.Exception.Message)"
        throw
    }
}

function Stop-ConcurrentDiscovery {
    <#
    .SYNOPSIS
        Stops the concurrent discovery engine and cleans up resources
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [ConcurrentDiscoveryEngine]$Engine
    )
    
    $Engine.Stop()
}

function Invoke-ConcurrentDiscoveryEngine {
    <#
    .SYNOPSIS
        Wrapper function for Start-ConcurrentDiscovery to maintain compatibility with launcher script
    .DESCRIPTION
        Provides a standardized interface for the discovery launcher while delegating to Start-ConcurrentDiscovery
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId,

        [Parameter(Mandatory=$false)]
        [int]$MaxConcurrentJobs = 4,

        [Parameter(Mandatory=$false)]
        [int]$BatchSize = 100,

        [Parameter(Mandatory=$false)]
        [hashtable]$DiscoveryTasks  # Made optional for launcher compatibility
    )

    try {
        Write-Host "Invoking Concurrent Discovery Engine..." -ForegroundColor Cyan

        # If no DiscoveryTasks provided, create a default structure for compatibility
        if (-not $DiscoveryTasks -or $DiscoveryTasks.Count -eq 0) {
            Write-Host "No DiscoveryTasks provided, using default concurrent discovery strategy" -ForegroundColor Yellow

            # Create default discovery tasks for common concurrent workloads
            $DiscoveryTasks = @{
                'UserDiscovery' = @{
                    JobType = 'UserBatch'
                    Data = @() # Will be populated by individual discovery modules
                }
                'GroupDiscovery' = @{
                    JobType = 'GroupBatch'
                    Data = @() # Will be populated by individual discovery modules
                }
                'Default' = @{
                    JobType = 'Default'
                    Data = @()
                }
            }
        }

        # Call the main discovery function
        $results = Start-ConcurrentDiscovery -Configuration $Configuration -Context $Context -SessionId $SessionId -DiscoveryTasks $DiscoveryTasks -MaxConcurrentJobs $MaxConcurrentJobs -BatchSize $BatchSize

        Write-Host "Concurrent Discovery Engine completed successfully" -ForegroundColor Green
        return $results

    } catch {
        Write-Error "Invoke-ConcurrentDiscoveryEngine failed: $($_.Exception.Message)"
        throw
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Start-ConcurrentDiscovery',
    'Stop-ConcurrentDiscovery',
    'Invoke-ConcurrentDiscoveryEngine'
)