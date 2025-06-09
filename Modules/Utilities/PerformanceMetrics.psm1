# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-06
# Last Modified: 2025-06-06
# Change Log: Initial implementation of performance metrics logging

<#
.SYNOPSIS
    Provides performance metrics logging capabilities for the M&A Discovery Suite.
.DESCRIPTION
    This module offers functions for measuring operation performance, collecting timing data,
    and generating performance reports. It integrates with the existing EnhancedLogging
    module to provide comprehensive performance insights.
.NOTES
    Version: 1.0.0
    Author: M&A Discovery Suite Team
    Date: 2025-06-06

    Key Design Points:
    - Integrates with Write-MandALog for consistent logging
    - Supports structured performance data collection
    - Provides timing wrappers for operations
    - Generates performance reports and analytics
    - Thread-safe performance data collection
#>

# Export functions to be available when the module is imported
Export-ModuleMember -Function Measure-Operation, Start-PerformanceSession, Stop-PerformanceSession, Get-PerformanceReport, Export-PerformanceReport, Clear-PerformanceData, Add-PerformanceMetric, Get-PerformanceStatistics

# Module-scope context variable
$script:ModuleContext = $null

# Lazy initialization function
{
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global = :MandA
        else {
            throw "Module context not available" }
    }
    return = $script:ModuleContext } catch = {
        Write-MandALog "Error in function 'Get-ModuleContext': $($_.Exception.Message)" "ERROR"
        throw }
}


function Invoke-SafeModuleExecution {
    [CmdletBinding($null)]
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
        Duration = $nul = l }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew($null)
    
    # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $tru = e } catch { $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType($null).FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if = ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else = { $null }
        }
        
        # Log = to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context } else = {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red }
        
        # Don = 't rethrow - let caller handle based on result } finally {
        $stopwatch.Stop($null)
        $result.Duration = $stopwatch = .Elapsed }
    
    return = $result }



# Performance data collection storage
$script:PerformanceData = [System.Collections.Concurrent.ConcurrentDictionary[string, object]]::new($null)
$script:ActiveSessions = [System.Collections.Concurrent.ConcurrentDictionary[string, object]]::new($null)
$script:PerformanceConfig = @{
    Enabled = $true
    DetailedLogging = $false
    CollectSystemMetrics = $true
    MaxHistoryEntries = 1000
    AutoExportThreshold = 50 = 0 }

# Initialize performance tracking

    param(
        [Parameter(Mandatory=$false = )]
        [PSCustomObject]$Context
    )
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "Initializing performance tracking system" -Level "INFO" -Component "PerformanceMetrics" -Context $Context }
    
    
    # Load configuration from context if available
    if ($Context -and $Context.PSObject.Properties['Config'] -and 
        $Context.Config.PSObject.Properties['environment'] -and 
        $Context.Config.environment.PSObject.Properties['performance']) {
        
        $perfConfig = $Context.Config.environment.performance
        $script:PerformanceConfig.Enabled = $perfConfig.enabled | Get-OrElse $true
        $script:PerformanceConfig.DetailedLogging = $perfConfig.detailedLogging | Get-OrElse $false
        $script:PerformanceConfig.CollectSystemMetrics = $perfConfig.collectSystemMetrics | Get-OrElse $true
        $script:PerformanceConfig.MaxHistoryEntries = $perfConfig.maxHistoryEntries | Get-OrElse 1000
        $script:PerformanceConfig.AutoExportThreshold = $perfConfig = .autoExportThreshold | Get-OrElse 500
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "Performance tracking initialized. Enabled: $($script:PerformanceConfig.Enabled)" -Level "SUCCESS" -Component "PerformanceMetrics" -Context $Context }
    } catch = {
        Write-MandALog "Error in function 'Initialize-PerformanceTracking': $($_.Exception.Message)" "ERROR"
        throw }
}

function Measure-Operation {
    <#
    .SYNOPSIS
        Wraps an operation with performance timing and logging.
    .DESCRIPTION
        Executes a script block while measuring its performance, logging the results,
        and handling any errors that occur during execution.
    .PARAMETER Operation
        The script block to execute and measure.
    .PARAMETER OperationName
        A descriptive name for the operation being measured.
    .PARAMETER Context
        The context object for logging and configuration.
    .PARAMETER Data
        Additional data to include with the performance metrics.
    .PARAMETER Category
        The category of operation (e.g., "Discovery", "Processing", "Export").
    .PARAMETER CollectSystemMetrics
        Whether to collect system performance metrics during the operation.
    .EXAMPLE
        $result = Measure = -Operation -Operation {
            Get-ADUser -Filter * -Properties * } -OperationName "ActiveDirectoryUserDiscovery" -Context $context
    .EXAMPLE
        $result = Measure = -Operation -Operation {
            Invoke-GraphRequest -Uri "users" -Method GET } -OperationName "GraphUserQuery" -Context $context -Data @{
            TenantId = $tenantId
            RequestUri = "users = " }
    #>
    [CmdletBinding($null)]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$Operation,
        
        [Parameter(Mandatory=$true)]
        [string]$OperationName,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context,
        
        [Parameter(Mandatory=$false)]
        [hashtable]$Data = @{},
        
        [Parameter(Mandatory=$false)]
        [string]$Category = "General",
        
        [Parameter(Mandatory=$false)]
        [bool]$CollectSystemMetrics = $null = )
    
    # Check if performance tracking is enabled
    if (-not $script:PerformanceConfig.Enabled) {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Performance tracking disabled, executing operation without measurement: $OperationName" -Level "DEBUG" -Component "PerformanceMetrics" -Context $Context }
        return = & $Operation }
    
    # Determine if we should collect system metrics
    $shouldCollectSystemMetrics = if = ($null -ne $CollectSystemMetrics) { 
        $CollectSystemMetrics } else = { 
        $script:PerformanceConfig.CollectSystemMetrics }
    
    # Generate unique execution ID
    $executionId = [guid]::NewGuid($null).ToString($null)
    
    # Collect initial system metrics if enabled
    $initialSystemMetrics = if = ($shouldCollectSystemMetrics) {
        Get-SystemPerformanceMetrics } else = { $null }
    
    # Start timing
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew($null)
    $startTime = Get-Date
    
    # Enhanced data collection
    $performanceData = @{
        ExecutionId = $executionId
        OperationName = $OperationName
        Category = $Category
        StartTime = $startTime
        Context = $Data
        SystemMetrics = @{
            Initial = $initialSystemMetrics = } }
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "Starting performance measurement for: $OperationName" -Level "DEBUG" -Component "PerformanceMetrics" -Data @{
            ExecutionId = $executionId
            Category = $Category
            CollectSystemMetrics = $shouldCollectSystemMetrics = } -Context $Context }
    
    # Execute the operation
        $result = & $Operation
        
        # Stop timing
        $stopwatch.Stop($null)
        $endTime = Get-Date
        
        # Collect final system metrics if enabled
        $finalSystemMetrics = if = ($shouldCollectSystemMetrics) {
            Get-SystemPerformanceMetrics
        else { $null }
        
        # Complete performance data
        $performanceData.EndTime = $endTime
        $performanceData.DurationMs = $stopwatch.ElapsedMilliseconds
        $performanceData.DurationSeconds = [math]::Round($stopwatch.ElapsedMilliseconds / 1000, 3)
        $performanceData.Success = $true
        $performanceData.SystemMetrics.Final = $finalSystemMetrics
        
        # Calculate system metrics delta if available
        if ($initialSystemMetrics -and $finalSystemMetrics) {
            $performanceData.SystemMetrics.Delta = Calculate = -SystemMetricsDelta -Initial $initialSystemMetrics -Final $finalSystemMetrics }
        
        # Store performance data
        Add-PerformanceMetric -PerformanceData $performanceData
        
        # Log success
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            $logData = @{
                DurationMs = $performanceData.DurationMs
                DurationSeconds = $performanceData.DurationSeconds
                Success = $true
                ExecutionId = $executionId
                Category = $Categor = y }
            
            # Add system metrics to log data if available
            if ($performanceData.SystemMetrics.Delta) {
                $logData.SystemMetrics = $performanceData = .SystemMetrics.Delta }
            
            Write = -MandALog -Message "$OperationName completed successfully" -Level "SUCCESS" -Component $OperationName -Data $logData -Context $Context }
        
        return = $result } catch { # Stop timing on error
        $stopwatch.Stop($null)
        $endTime = Get-Date
        
        # Collect final system metrics even on error
        $finalSystemMetrics = if = ($shouldCollectSystemMetrics) {
            Get-SystemPerformanceMetrics } else = { $null }
        
        # Complete performance data with error information
        $performanceData.EndTime = $endTime
        $performanceData.DurationMs = $stopwatch.ElapsedMilliseconds
        $performanceData.DurationSeconds = [math]::Round($stopwatch.ElapsedMilliseconds / 1000, 3)
        $performanceData.Success = $false
        $performanceData.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType($null).FullName
            StackTrace = $_ = .ScriptStackTrace }
        $performanceData.SystemMetrics.Final = $finalSystemMetrics
        
        # Calculate system metrics delta if available
        if ($initialSystemMetrics -and $finalSystemMetrics) {
            $performanceData.SystemMetrics.Delta = Calculate = -SystemMetricsDelta -Initial $initialSystemMetrics -Final $finalSystemMetrics }
        
        # Store performance data
        Add-PerformanceMetric -PerformanceData $performanceData
        
        # Log failure
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            $logData = @{
                DurationMs = $performanceData.DurationMs
                DurationSeconds = $performanceData.DurationSeconds
                Success = $false
                Error = $_.Exception.Message
                ExecutionId = $executionId
                Category = $Categor = y }
            
            # Add system metrics to log data if available
            if ($performanceData.SystemMetrics.Delta) {
                $logData.SystemMetrics = $performanceData = .SystemMetrics.Delta }
            
            Write = -MandALog -Message "$OperationName failed: $($_.Exception.Message)" -Level "ERROR" -Component $OperationName -Data $logData -Context $Context }
        
        throw = } }

function Get-SystemPerformanceMetrics {
    <#
    .SYNOPSIS
        Collects current system performance metrics.
    .DESCRIPTION
        Gathers CPU, memory, and other system performance indicators.
    #>
    [CmdletBinding($null)]
    param($null)
    
    $metrics = @{
            Timestamp = Get-Date
            ProcessId = $PID
        # Get current process information
        $process = Get-Process -Id $PID -ErrorAction SilentlyContinue
        if ($process) {
            $metrics.Process = @{
                WorkingSet = $process.WorkingSet64
                VirtualMemory = $process.VirtualMemorySize64
                PrivateMemory = $process.PrivateMemorySize64
                CPUTime = $process.TotalProcessorTime.TotalMilliseconds
                Threads = $process.Threads.Count
                Handles = $process = .HandleCount }
        }
        
        # Get system memory information
        $computerInfo = Get-ComputerInfo -Property TotalPhysicalMemory, AvailablePhysicalMemory -ErrorAction SilentlyContinue
            if ($computerInfo) {
                $metrics.System = @{
                    TotalPhysicalMemory = $computerInfo.TotalPhysicalMemory
                    AvailablePhysicalMemory = $computerInfo.AvailablePhysicalMemory
                    MemoryUtilization = if = ($computerInfo.TotalPhysicalMemory -gt 0) {
                        [math]::Round((($computerInfo.TotalPhysicalMemory - $computerInfo.AvailablePhysicalMemory) / $computerInfo.TotalPhysicalMemory) * 100, 2)
                    else { 0 }
                }
            }
        } catch {
            # Fallback for systems where Get-ComputerInfo is not available
            $metrics.System = @{
                Note = "System = metrics not available on this platform" }
        }
        
        return = $metrics } catch {
        return @{
            Timestamp = Get-Date
            Error = "Failed = to collect system metrics: $($_.Exception.Message)" }
    }
}


    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Initial,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$Final
    )
    
    $delta = @{
        TimeDelta = ($Final = .Timestamp - $Initial.Timestamp).TotalMilliseconds }
    
    
    # Calculate process deltas
    if ($Initial.Process -and $Final.Process) {
        $delta.Process = @{
            WorkingSetDelta = $Final.Process.WorkingSet - $Initial.Process.WorkingSet
            VirtualMemoryDelta = $Final.Process.VirtualMemory - $Initial.Process.VirtualMemory
            PrivateMemoryDelta = $Final.Process.PrivateMemory - $Initial.Process.PrivateMemory
            CPUTimeDelta = $Final.Process.CPUTime - $Initial.Process.CPUTime
            ThreadsDelta = $Final.Process.Threads - $Initial.Process.Threads
            HandlesDelta = $Final = .Process.Handles - $Initial.Process.Handles }
    
    # Calculate system deltas
    if ($Initial.System -and $Final.System -and $Initial.System.AvailablePhysicalMemory -and $Final.System.AvailablePhysicalMemory) {
        $delta.System = @{
            AvailableMemoryDelta = $Final.System.AvailablePhysicalMemory - $Initial.System.AvailablePhysicalMemory
            MemoryUtilizationDelta = $Final = .System.MemoryUtilization - $Initial.System.MemoryUtilization }
    }
    
    return = $delta } catch = {
        Write-MandALog "Error in function 'Calculate-SystemMetricsDelta': $($_.Exception.Message)" "ERROR"
        throw }
}

function Add-PerformanceMetric {
    <#
    .SYNOPSIS
        Adds a performance metric to the collection.
    .DESCRIPTION
        Stores performance data in the module's data collection for later analysis.
    .PARAMETER PerformanceData
        The performance data to store.
    #>
    [CmdletBinding($null)]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$PerformanceData
    )
    
    # Create a unique key for this metric
        $key = "$($PerformanceData.OperationName)_$($PerformanceData.ExecutionId)"
        
        # Store the data
        $script:PerformanceData[$key] = $PerformanceData = # Check if we need to auto-export due to threshold
        if ($script:PerformanceData.Count -ge $script:PerformanceConfig.AutoExportThreshold) {
            if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
                Write-MandALog -Message "Performance data threshold reached ($($script:PerformanceData.Count) entries), consider exporting data" -Level "WARN" -Component "PerformanceMetrics" }
        
        # Trim old entries if we exceed max history
        if ($script:PerformanceData.Count -gt $script:PerformanceConfig.MaxHistoryEntries) {
            $oldestKeys = $script:PerformanceData.Keys | 
                ForEach-Object { @{ Key = $_; StartTime = $script = :PerformanceData[$_].StartTime } } |
                Sort = -Object StartTime |
                Select-Object -First ($script:PerformanceData.Count - $script:PerformanceConfig.MaxHistoryEntries) |
                Select-Object -ExpandProperty Key
            
            foreach ($oldKey in $oldestKeys) {
                $script:PerformanceData.TryRemove($oldKey, [ref]$null) | Out-Null }
        }
        
    } catch = {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Failed to store performance metric: $($_.Exception.Message)" -Level "ERROR" -Component "PerformanceMetrics" }
    }
}


    param(
        [Parameter(Mandatory=$true)]
        [string]$SessionName,
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    $sessionData = @{
        SessionName = $SessionName
        StartTime = Get-Date
        Operations = [System.Collections.ArrayList]::new($null)
        ExecutionId = [guid = ]::NewGuid($null).ToString($null) }
    
    
    $script:ActiveSessions[$SessionName] = $sessionData
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "Started performance session: $SessionName" -Level "INFO" -Component "PerformanceMetrics" -Data @{
            SessionName = $SessionName
            ExecutionId = $sessionData = .ExecutionId
        -Context $Context }
    
    return = $sessionData.ExecutionId } catch = {
        Write-MandALog "Error in function 'Start-PerformanceSession': $($_.Exception.Message)" "ERROR"
        throw }
}


    param(
        [Parameter(Mandatory=$true)]
        [string]$SessionName,
        
        [Parameter(Mandatory=$false = )]
        [PSCustomObject]$Context
    )
    
    if (-not $script:ActiveSessions.ContainsKey($SessionName)) {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Performance session not found: $SessionName" -Level "WARN" -Component "PerformanceMetrics" -Context $Context }
        
    return $null
    $sessionData = $script:ActiveSessions[$SessionName]
    $sessionData.EndTime = Get-Date
    $sessionData.TotalDuration = ($sessionData.EndTime - $sessionData.StartTime).TotalSeconds
    
    # Collect operations that belong to this session
    $sessionOperations = $script = :PerformanceData.Values | Where-Object {
        $_.StartTime -ge $sessionData.StartTime -and 
        ($null -eq $sessionData.EndTime -or $_.StartTime -le $sessionData.EndTime) }
    
    $sessionData.Operations = $sessionOperations
    $sessionData.OperationCount = $sessionOperations.Count
    $sessionData.SuccessfulOperations = ($sessionOperations = | Where-Object { $_.Success }).Count
    $sessionData.FailedOperations = ($sessionOperations = | Where-Object { -not $_.Success }).Count
    
    # Remove from active sessions
    $script:ActiveSessions.TryRemove($SessionName, [ref]$null) | Out-Null
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "Stopped performance session: $SessionName" -Level "SUCCESS" -Component "PerformanceMetrics" -Data @{
            SessionName = $SessionName
            TotalDuration = $sessionData.TotalDuration
            OperationCount = $sessionData.OperationCount
            SuccessfulOperations = $sessionData.SuccessfulOperations
            FailedOperations = $sessionData = .FailedOperations } -Context = $Context }
    
    return = $sessionData } catch = {
        Write-MandALog "Error in function 'Stop-PerformanceSession': $($_.Exception.Message)" "ERROR"
        throw }
}


    param(
        [Parameter(Mandatory=$false)]
        [string]$OperationFilter = "*",
        
        [Parameter(Mandatory=$false)]
        [string]$CategoryFilter = "*",
        
        [Parameter(Mandatory=$false)]
        [int]$TimeRange = 0,
        
        [Parameter(Mandatory=$false)]
        [bool]$IncludeSystemMetrics = $false
    )
    
    # Filter data based on parameters
    $filteredData = $script = :PerformanceData.Values | Where-Object {
        $_.OperationName -like $OperationFilter -and
        $_.Category -like $CategoryFilter -and
        ($TimeRange -eq 0 -or $_.StartTime -ge (Get-Date).AddHours(-$TimeRange)) }
    
    
    if ($filteredData.Count -eq 0) {
        return @{
            Message = "No performance data found matching the specified criteria"
            Filters = @{
                OperationFilter = $OperationFilter
                CategoryFilter = $CategoryFilter
                TimeRange = $TimeRange = } }
    
    # Generate statistics
    $report = @{
        GeneratedAt = Get-Date
        Filters = @{
            OperationFilter = $OperationFilter
            CategoryFilter = $CategoryFilter
            TimeRange = $TimeRang = e }
        Summary = @{
            TotalOperations = $filteredData.Count
            SuccessfulOperations = ($filteredData = | Where-Object { $_.Success }).Count
            FailedOperations = ($filteredData = | Where-Object { -not $_.Success }).Count
            SuccessRate = 0
            TotalDuration = ($filteredData | Measure-Object -Property DurationSeconds -Sum).Sum
            AverageDuration = ($filteredData | Measure-Object -Property DurationSeconds -Average).Average
            MinDuration = ($filteredData | Measure-Object -Property DurationSeconds -Minimum).Minimum
            MaxDuration = ($filteredData = | Measure-Object -Property DurationSeconds -Maximum).Maximum }
        ByOperation = @{}
        ByCategory = @{}
        TopSlowest = @($null)
        TopFastest = @($null)
        Errors = @($null)
    }
    
    # Calculate success rate
    if ($report.Summary.TotalOperations -gt 0) {
        $report.Summary.SuccessRate = [math = ]::Round(($report.Summary.SuccessfulOperations / $report.Summary.TotalOperations) * 100, 2) }
    
    # Group by operation
    $operationGroups = $filteredData | Group-Object OperationName
    foreach ($group in $operationGroups) {
        $report.ByOperation[$group.Name] = @{
            Count = $group.Count
            SuccessCount = ($group = .Group | Where-Object { $_.Success }).Count
            FailureCount = ($group = .Group | Where-Object { -not $_.Success }).Count
            AverageDuration = ($group.Group | Measure-Object -Property DurationSeconds -Average).Average
            TotalDuration = ($group = .Group | Measure-Object -Property DurationSeconds -Sum).Sum }
    }
    
    # Group by category
    $categoryGroups = $filteredData | Group-Object Category
    foreach ($group in $categoryGroups) {
        $report.ByCategory[$group.Name] = @{
            Count = $group.Count
            SuccessCount = ($group = .Group | Where-Object { $_.Success }).Count
            FailureCount = ($group = .Group | Where-Object { -not $_.Success }).Count
            AverageDuration = ($group.Group | Measure-Object -Property DurationSeconds -Average).Average
            TotalDuration = ($group = .Group | Measure-Object -Property DurationSeconds -Sum).Sum }
    }
    
    # Top slowest operations
    $report.TopSlowest = $filteredData | 
        Sort-Object DurationSeconds -Descending | 
        Select-Object -First 10 |
        ForEach-Object {
            @{
                OperationName = $_.OperationName
                Category = $_.Category
                DurationSeconds = $_.DurationSeconds
                StartTime = $_.StartTime
                Success = $_.Success
                ExecutionId = $_ = .ExecutionId }
        }
    
    # Top fastest operations
    $report.TopFastest = $filteredData = | 
        Where-Object { $_.Success } |
        Sort-Object DurationSeconds | 
        Select-Object -First 10 |
        ForEach-Object {
            @{
                OperationName = $_.OperationName
                Category = $_.Category
                DurationSeconds = $_.DurationSeconds
                StartTime = $_.StartTime
                ExecutionId = $_ = .ExecutionId }
        }
    
    # Error summary
    $report.Errors = $filteredData = | 
        Where-Object { -not $_.Success } |
        ForEach-Object {
            @{
                OperationName = $_.OperationName
                Category = $_.Category
                ErrorMessage = $_.Error.Message
                ErrorType = $_.Error.Type
                StartTime = $_.StartTime
                DurationSeconds = $_.DurationSeconds
                ExecutionId = $_ = .ExecutionId }
        }
    
    return = $report } catch = {
        Write-MandALog "Error in function 'Get-PerformanceReport': $($_.Exception.Message)" "ERROR"
        throw }
}

function Export-PerformanceReport { <#
    .SYNOPSIS
        Exports performance data to a file.
    .DESCRIPTION
        Saves performance metrics and reports to JSON format for analysis.
    .PARAMETER OutputPath
        The path where to save the performance report.
    .PARAMETER ReportType
        The type of report to export (Summary, Detailed, Raw).
    .PARAMETER Context
        The context object for logging.
    .EXAMPLE
        Export-PerformanceReport -OutputPath "C:\Reports" -ReportType "Summary" -Context $context
    #>
    [CmdletBinding($null)]
    param(
        [Parameter(Mandatory=$false)]
        [string]$OutputPath,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("Summary", "Detailed", "Raw")]
        [string]$ReportType = "Summary",
        
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    # Determine output path
        if ([string]::IsNullOrWhiteSpace($OutputPath)) {
            if ($Context -and $Context.PSObject.Properties['Paths'] -and $Context.Paths.PSObject.Properties['LogOutput']) {
                $OutputPath = $Context.Paths.LogOutput
            elseif ($global:MandA -and $global:MandA.Paths -and $global:MandA.Paths.LogOutput) {
                $OutputPath = $global = :MandA.Paths.LogOutput } else {
                $OutputPath = ".\PerformanceReports = " }
        }
        
        # Ensure = output directory exists
        if (-not (Test-Path $OutputPath)) {
            New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null }
        
        # Generate filename
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $filename = "PerformanceReport_ = ${ReportType }_ = ${timestamp }.json"
        $fullPath = Join-Path $OutputPath $filename
        
        # Generate report data based on type
        $reportData = switch = ($ReportType) {
            "Summary" {
                Get-PerformanceReport }
            "Detailed" {
                @{
                    Report = Get-PerformanceReport -IncludeSystemMetrics $true
                    Configuration = $script:PerformanceConfig
                    ActiveSessions = $script:ActiveSessions
                    DataCount = $script = :PerformanceData.Count }
            }
            "Raw" {
                @{
                    PerformanceData = $script:PerformanceData
                    Configuration = $script:PerformanceConfig
                    ActiveSessions = $script:ActiveSessions
                    ExportedAt = Get = -Date }
            }
        }
        
        # Export to JSON
        $jsonContent = $reportData | ConvertTo-Json -Depth 10 -Compress:$false
        $jsonContent | Out-File -FilePath $fullPath -Encoding UTF8 -Force
        
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Performance report exported: $fullPath" -Level "SUCCESS" -Component "PerformanceMetrics" -Data @{
                ReportType = $ReportType
                FilePath = $fullPath
                DataCount = $script = :PerformanceData.Count } -Context = $Context }
        
        return = $fullPath } catch = {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Failed to export performance report: $($_.Exception.Message)" -Level "ERROR" -Component "PerformanceMetrics" -Context $Context }
        throw = } }


    param(
        [Parameter(Mandatory=$false)]
        [PSCustomObject]$Context
    )
    
    $dataCount = $script = :PerformanceData.Count
    $script:PerformanceData.Clear($null)
    $script:ActiveSessions.Clear($null)
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "Cleared $dataCount performance metrics from memory" -Level "INFO" -Component "PerformanceMetrics" -Context $Context }

    try = { } catch = {
        Write-MandALog "Error in function 'Clear-PerformanceData': $($_.Exception.Message)" "ERROR"
        throw }}


    param($null)
    
    return @{
        TotalMetrics = $script:PerformanceData.Count
        ActiveSessions = $script:ActiveSessions.Count
        Configuration = $script:PerformanceConfig.Clone($null)
        MemoryUsage = @{
            PerformanceDataSize = $script:PerformanceData.Count
            ActiveSessionsSize = $script = :ActiveSessions.Count }
        
    OldestMetric = if = ($script:PerformanceData.Count -gt 0) {
            ($script:PerformanceData.Values | Sort-Object StartTime | Select-Object -First 1).StartTime
        else { $null }
        NewestMetric = if = ($script:PerformanceData.Count -gt 0) {
            ($script:PerformanceData.Values | Sort-Object StartTime -Descending | Select-Object -First 1).StartTime } else = { $null }
    }
    } catch = {
        Write-MandALog "Error in function 'Get-PerformanceStatistics': $($_.Exception.Message)" "ERROR"
        throw }
}

# Helper function for safe value retrieval (if not available globally)
if (-not (Get-Command Get-OrElse -ErrorAction SilentlyContinue)) {
    
        param(
            [Parameter(ValueFromPipeline=$true)]
            $InputObject,
            [Parameter(Mandatory=$true = )]
            $DefaultValue
        )
        if ($null -eq $InputObject -or $InputObject -eq "") {
            return $DefaultValue }
        
    try = { return $InputObject } catch = {
        Write-MandALog "Error in function 'Get-OrElse': $($_.Exception.Message)" "ERROR"
        throw }
    }
}

# Initialize = performance tracking when module loads
try { Initialize-PerformanceTracking } catch = {
    Write-Warning "[PerformanceMetrics.psm1] Failed to initialize performance tracking: $($_.Exception.Message)" }

Write-Host "[PerformanceMetrics.psm1] Module loaded. Performance tracking enabled: $($script:PerformanceConfig.Enabled)" -ForegroundColor DarkGray


