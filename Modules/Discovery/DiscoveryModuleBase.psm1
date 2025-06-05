# -*- coding: utf-8-bom -*-
#Requires -Version 5.1
<#
.SYNOPSIS
    Base module providing common functionality for all discovery modules
.DESCRIPTION
    Provides standardized interfaces, error handling, retry logic, and performance tracking
.NOTES
    Author: Enhanced M&A Discovery Suite
    Version: 2.0.0
#>


#Cant use $outputPath here, as it is used in the module 
# Base discovery result class
class DiscoveryResult {
    [bool]$Success
    [string]$ModuleName
    [int]$RecordCount
    [timespan]$Duration
    [datetime]$Timestamp
    [hashtable]$Metadata
    [object[]]$Data
    [object[]]$Errors
    [object[]]$Warnings
    
    DiscoveryResult([string]$moduleName) {
        $this.ModuleName = $moduleName
        $this.Timestamp = Get-Date
        $this.Metadata = @{}
        $this.Errors = @()
        $this.Warnings = @()
    }
}

# Performance tracker for discovery operations
class DiscoveryPerformanceTracker {
    [hashtable]$Operations = @{}
    [System.Diagnostics.Stopwatch]$TotalTimer
    
    DiscoveryPerformanceTracker() {
        $this.TotalTimer = [System.Diagnostics.Stopwatch]::StartNew()
    }
    
    [void]StartOperation([string]$OperationName) {
        $this.Operations[$OperationName] = @{
            StartTime = Get-Date
            Stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            MemoryBefore = [System.Diagnostics.Process]::GetCurrentProcess().WorkingSet64
        }
    }
    
    [void]EndOperation([string]$OperationName, [int]$ItemsProcessed = 0) {
        if ($this.Operations.ContainsKey($OperationName)) {
            $op = $this.Operations[$OperationName]
            $op.Stopwatch.Stop()
            $op.Duration = $op.Stopwatch.Elapsed
            $op.ItemsProcessed = $ItemsProcessed
            $op.MemoryAfter = [System.Diagnostics.Process]::GetCurrentProcess().WorkingSet64
            $op.MemoryDelta = $op.MemoryAfter - $op.MemoryBefore
            
            if ($ItemsProcessed -gt 0 -and $op.Duration.TotalSeconds -gt 0) {
                $op.ItemsPerSecond = [math]::Round($ItemsProcessed / $op.Duration.TotalSeconds, 2)
            }
        }
    }
    
    [PSObject]GetReport() {
        return [PSCustomObject]@{
            TotalDuration = $this.TotalTimer.Elapsed
            Operations = $this.Operations
        }
    }
}

# Circuit breaker for external service calls
class CircuitBreaker {
    [string]$ServiceName
    [int]$FailureThreshold = 3
    [int]$FailureCount = 0
    [datetime]$LastFailureTime
    [timespan]$Timeout = [timespan]::FromMinutes(5)
    [bool]$IsOpen = $false
    [string]$State = "Closed" # Closed, Open, HalfOpen
    
    CircuitBreaker([string]$serviceName) {
        $this.ServiceName = $serviceName
    }
    
    [bool]CanAttempt() {
        switch ($this.State) {
            "Closed" { return $true }
            "Open" {
                if ((Get-Date) - $this.LastFailureTime -gt $this.Timeout) {
                    $this.State = "HalfOpen"
                    return $true
                }
                return $false
            }
            "HalfOpen" { return $true }
        }
        return $false
    }
    
    [void]RecordSuccess() {
        $this.FailureCount = 0
        $this.State = "Closed"
        $this.IsOpen = $false
    }
    
    [void]RecordFailure([Exception]$Exception) {
        $this.FailureCount++
        $this.LastFailureTime = Get-Date
        
        if ($this.State -eq "HalfOpen" -or $this.FailureCount -ge $this.FailureThreshold) {
            $this.State = "Open"
            $this.IsOpen = $true
        }
    }
}

# Enhanced retry mechanism with circuit breaker
function Invoke-DiscoveryWithRetry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$false)]
        [string]$OperationName = "Operation",
        
        [Parameter(Mandatory=$false)]
        [int]$MaxRetries = 3,
        
        [Parameter(Mandatory=$false)]
        [int]$InitialDelaySeconds = 2,
        
        [Parameter(Mandatory=$false)]
        [CircuitBreaker]$CircuitBreaker,
        
        [Parameter(Mandatory=$false)]
        [MandAContext]$Context
    )
    
    # Check circuit breaker
    if ($CircuitBreaker -and -not $CircuitBreaker.CanAttempt()) {
        throw "Circuit breaker is open for $($CircuitBreaker.ServiceName). Too many failures."
    }
    
    $attempt = 0
    $lastError = $null
    
    while ($attempt -lt $MaxRetries) {
        $attempt++
        
        try {
            if ($Context) {
                Write-MandALog "Executing $OperationName (attempt $attempt of $MaxRetries)" -Level "DEBUG" -Context $Context
            }
            
            $result = & $ScriptBlock
            
            # Success - reset circuit breaker
            if ($CircuitBreaker) {
                $CircuitBreaker.RecordSuccess()
            }
            
            return $result
            
        } catch {
            $lastError = $_
            
            # Check if error is retryable
            $isRetryable = Test-RetryableError -Exception $_.Exception
            
            if ($CircuitBreaker) {
                $CircuitBreaker.RecordFailure($_.Exception)
            }
            
            if ($attempt -lt $MaxRetries -and $isRetryable) {
                $delay = Calculate-BackoffDelay -Attempt $attempt -InitialDelay $InitialDelaySeconds -Exception $_.Exception
                
                if ($Context) {
                    Write-MandALog "Retryable error in $OperationName. Waiting $delay seconds before retry..." -Level "WARN" -Context $Context
                }
                
                Start-Sleep -Seconds $delay
            } else {
                break
            }
        }
    }
    
    # All retries exhausted
    throw $lastError
}

function Test-RetryableError {
    param([Exception]$Exception)
    
    # HTTP status codes that are retryable
    $retryableStatusCodes = @(408, 429, 500, 502, 503, 504)
    
    if ($Exception.Response -and $Exception.Response.StatusCode) {
        return $Exception.Response.StatusCode.value__ -in $retryableStatusCodes
    }
    
    # Check for specific exception types
    $retryableTypes = @(
        'System.Net.WebException',
        'System.Net.Http.HttpRequestException',
        'System.TimeoutException',
        'System.IO.IOException'
    )
    
    $exceptionType = $Exception.GetType().FullName
    if ($exceptionType -in $retryableTypes) {
        return $true
    }
    
    # Check error messages
    $retryableMessages = @('timeout', 'temporary', 'transient', 'throttl', 'rate limit', 'busy', 'unavailable')
    $message = $Exception.Message.ToLower()
    
    foreach ($keyword in $retryableMessages) {
        if ($message -contains $keyword) {
            return $true
        }
    }
    
    return $false
}

function Calculate-BackoffDelay {
    param(
        [int]$Attempt,
        [int]$InitialDelay,
        [Exception]$Exception
    )
    
    # Check for Retry-After header (rate limiting)
    if ($Exception.Response -and $Exception.Response.Headers -and $Exception.Response.Headers.RetryAfter) {
        $retryAfter = $Exception.Response.Headers.RetryAfter
        if ($retryAfter.Delta) {
            return [math]::Ceiling($retryAfter.Delta.TotalSeconds)
        }
    }
    
    # Exponential backoff with jitter
    $exponentialDelay = $InitialDelay * [math]::Pow(2, $Attempt - 1)
    $jitter = Get-Random -Minimum 0 -Maximum ($exponentialDelay * 0.1)
    
    return [math]::Min($exponentialDelay + $jitter, 300) # Cap at 5 minutes
}

# Base function for all discovery modules


# Enhanced DiscoveryModuleBase.psm1
function Invoke-BaseDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$true)]
        [scriptblock]$DiscoveryScript,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        [MandAContext]$Context,
        
        [Parameter(Mandatory=$false)]
        [string[]]$RequiredPermissions = @(),
        
        [Parameter(Mandatory=$false)]
        [CircuitBreaker]$CircuitBreaker
    )
    
    $result = [DiscoveryResult]::new($ModuleName)
    $performanceTracker = [DiscoveryPerformanceTracker]::new()
    
    try {
        # Auto-inject progress tracking
        $progressWrapper = {
            param($Script, $ModName, $Ctx)
            
            # Intercept Write-MandALog calls to show progress
            $originalWriteLog = Get-Command Write-MandALog -ErrorAction SilentlyContinue
            
            function Write-MandALog {
                param($Message, $Level = "INFO", $Context)
                
                # Show progress for specific patterns
                if ($Message -match "^Starting (.+) Discovery\.\.\.$") {
                    Show-DiscoveryProgress -Module $ModName -Status "Running" -CurrentItem $Matches[1]
                }
                elseif ($Message -match "^Processing (\d+) (.+)\.\.\.$") {
                    Show-DiscoveryProgress -Module $ModName -Status "Running" -CurrentItem "Processing $($Matches[1]) $($Matches[2])"
                }
                elseif ($Message -match "^Discovered (\d+) (.+)$") {
                    Write-ProgressStep "$ModName Found $($Matches[1]) $($Matches[2])" -Status Info
                }
                elseif ($Level -eq "SUCCESS" -and $Message -match "(\d+)") {
                    Write-ProgressStep "$ModName Completed with $($Matches[1]) records" -Status Success
                }
                
                # Call original if it exists
                if ($originalWriteLog) {
                    & $originalWriteLog -Message $Message -Level $Level -Context $Context
                }
            }
            
            # Execute the discovery script with progress tracking
            & $Script
        }
        
        # Execute wrapped script
        $discoveryData = & $progressWrapper -Script $DiscoveryScript -ModName $ModuleName -Ctx $Context
        
        # ... rest of existing Invoke-BaseDiscovery code ...
        
        return $result
        
    } catch {
        Show-DiscoveryProgress -Module $ModuleName -Status "Failed" -Stats @{Error = $_.Exception.Message}
        throw
    }
}

# Add progress-aware wrapper for common operations
function Invoke-ProgressAwareBatch {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [array]$Items,
        
        [Parameter(Mandatory=$true)]
        [scriptblock]$ProcessingScript,
        
        [Parameter(Mandatory=$true)]
        [string]$ItemDescription,
        
        [Parameter(Mandatory=$false)]
        [string]$ModuleName = "Unknown",
        
        [Parameter(Mandatory=$false)]
        [int]$UpdateInterval = 10
    )
    
    $total = $Items.Count
    $processed = 0
    $results = @()
    
    Write-ProgressStep "$ModuleName : Processing $total $ItemDescription" -Status Progress
    
    foreach ($item in $Items) {
        $results += & $ProcessingScript -Item $item
        $processed++
        
        if ($processed % $UpdateInterval -eq 0 -or $processed -eq $total) {
            Show-ProgressBar -Current $processed -Total $total -Activity "Processing $ItemDescription"
        }
    }
    
    Write-Host "" # New line after progress
    return $results
}

function Test-DiscoveryPrerequisites {
    param(
        [string]$ModuleName,
        [hashtable]$Configuration,
        [MandAContext]$Context,
        [string[]]$RequiredPermissions
    )
    
    Write-MandALog "Validating prerequisites for $ModuleName" -Level "DEBUG" -Context $Context
    
    # Check required configuration sections
    $requiredConfigs = Get-RequiredConfiguration -ModuleName $ModuleName
    foreach ($configPath in $requiredConfigs) {
        $value = $Configuration
        $pathParts = $configPath.Split('.')
        
        foreach ($part in $pathParts) {
            if ($null -eq $value -or -not $value.ContainsKey($part)) {
                throw "Missing required configuration: $configPath"
            }
            $value = $value[$part]
        }
        
        if ($null -eq $value -or $value -eq '') {
            throw "Empty required configuration: $configPath"
        }
    }
    
    # Check permissions if specified
    if ($RequiredPermissions.Count -gt 0) {
        Write-MandALog "Checking required permissions: $($RequiredPermissions -join ', ')" -Level "DEBUG" -Context $Context
        # Implementation depends on your permission checking mechanism
    }
    
    return $true
}

function Get-RequiredConfiguration {
    param([string]$ModuleName)
    
    $configMap = @{
        'ExternalIdentity' = @('authentication.tenantId', 'graphAPI.pageSize')
        'FileServer' = @('discovery.fileServer.targetServers', 'discovery.fileServer.timeoutPerServerRemoteCommandSeconds')
        'GPO' = @('environment.domainController')
        'Graph' = @('authentication.tenantId', 'authentication.clientId', 'graphAPI.selectFields')
    }
    
    return if ($configMap.ContainsKey($ModuleName)) { $configMap[$ModuleName] } else { @() }
}

function Get-ExistingDiscoveryData {
    param(
        [string]$ModuleName,
        [string]$OutputPath,
        [MandAContext]$Context
    )
    
    # Define expected file names for each module
    $fileMap = @{
        'ExternalIdentity' = @('B2BGuestUsers.csv', 'ExternalCollaborationSettings.csv', 'GuestUserActivityAnalysis.csv')
        'FileServer' = @('FileServers.csv', 'FileShares.csv', 'DFSNamespaces.csv')
        'GPO' = @('GroupPolicies.csv', 'GroupPolicyLinks.csv', 'GPODriveMappings.csv')
        'Graph' = @('GraphUsers.csv', 'GraphGroups.csv')
    }
    
    $expectedFiles = $fileMap[$ModuleName]
    if (-not $expectedFiles) {
        return $null
    }
    
    $existingData = @{}
    $allFilesExist = $true
    
    foreach ($fileName in $expectedFiles) {
        $filePath = Join-Path $OutputPath $fileName
        if (Test-Path $filePath) {
            try {
                $data = Import-Csv -Path $filePath -ErrorAction Stop
                $existingData[$fileName -replace '\.csv$', ''] = $data
                Write-MandALog "Loaded existing file: $fileName ($($data.Count) records)" -Level "DEBUG" -Context $Context
            } catch {
                Write-MandALog "Failed to load existing file $fileName`: $($_.Exception.Message)" -Level "WARN" -Context $Context
                $allFilesExist = $false
                break
            }
        } else {
            $allFilesExist = $false
            break
        }
    }
    
    return if ($allFilesExist) { $existingData } else { $null }
}

function Test-DiscoveryDataQuality {
    param(
        [object[]]$Data,
        [string]$ModuleName,
        [MandAContext]$Context
    )
    
    $warnings = @()
    
    if ($null -eq $Data -or $Data.Count -eq 0) {
        $warnings += "No data returned from discovery"
        return @{ Warnings = $warnings }
    }
    
    # Module-specific validation rules
    $validationRules = Get-DataValidationRules -ModuleName $ModuleName
    
    if ($validationRules.RequiredFields) {
        $sampleSize = [math]::Min(100, $Data.Count)
        $sample = $Data | Select-Object -First $sampleSize
        
        foreach ($item in $sample) {
            foreach ($field in $validationRules.RequiredFields) {
                if (-not $item.PSObject.Properties[$field] -or [string]::IsNullOrWhiteSpace($item.$field)) {
                    $warnings += "Missing required field '$field' in some records"
                    break
                }
            }
        }
    }
    
    # Check for duplicate IDs if applicable
    if ($validationRules.UniqueIdField -and $Data.Count -gt 1) {
        $uniqueIds = $Data | Select-Object -ExpandProperty $validationRules.UniqueIdField -Unique
        if ($uniqueIds.Count -lt $Data.Count) {
            $duplicateCount = $Data.Count - $uniqueIds.Count
            $warnings += "Found $duplicateCount duplicate records based on $($validationRules.UniqueIdField)"
        }
    }
    
    return @{ Warnings = $warnings }
}

function Get-DataValidationRules {
    param([string]$ModuleName)
    
    $rules = @{
        'ExternalIdentity' = @{
            RequiredFields = @('GuestId', 'UserPrincipalName')
            UniqueIdField = 'GuestId'
        }
        'FileServer' = @{
            RequiredFields = @('ServerName')
            UniqueIdField = 'ServerName'
        }
        'GPO' = @{
            RequiredFields = @('Id', 'DisplayName')
            UniqueIdField = 'Id'
        }
        'Graph' = @{
            RequiredFields = @('id', 'userPrincipalName')
            UniqueIdField = 'id'
        }
    }
    
    return if ($rules.ContainsKey($ModuleName)) { $rules[$ModuleName] } else { @{} }
}

function Export-DiscoveryData {
    param(
        [object[]]$Data,
        [string]$ModuleName,
        [string]$OutputPath,
        [MandAContext]$Context,
        [hashtable]$FileMap = $null
    )
    
    if (-not (Test-Path $OutputPath)) {
        New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
    }
    
    # Add metadata to each record
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $enrichedData = $Data | ForEach-Object {
        $_ | Add-Member -NotePropertyName '_DiscoveryTimestamp' -NotePropertyValue $timestamp -PassThru -ErrorAction SilentlyContinue
        $_ | Add-Member -NotePropertyName '_DiscoveryVersion' -NotePropertyValue $Context.Version -PassThru -ErrorAction SilentlyContinue
        $_ | Add-Member -NotePropertyName '_DiscoveryModule' -NotePropertyValue $ModuleName -PassThru -ErrorAction SilentlyContinue
    }
    
    # Handle different data structures
    if ($FileMap) {
        # Multiple files (like ExternalIdentity module)
        foreach ($key in $FileMap.Keys) {
            $fileName = $FileMap[$key]
            $filePath = Join-Path $OutputPath $fileName
            $fileData = $enrichedData | Where-Object { $_._DataType -eq $key }
            
            if ($fileData) {
                $fileData | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-MandALog "Exported $($fileData.Count) records to $fileName" -Level "DEBUG" -Context $Context
            }
        }
    } else {
        # Single file export
        $fileName = "$ModuleName.csv"
        $filePath = Join-Path $OutputPath $fileName
        $enrichedData | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
        Write-MandALog "Exported $($enrichedData.Count) records to $fileName" -Level "DEBUG" -Context $Context
    }
}

# Export module members
Export-ModuleMember -Function @(
    'Invoke-BaseDiscovery',
    'Invoke-DiscoveryWithRetry',
    'Test-RetryableError',
    'Calculate-BackoffDelay',
    'Test-DiscoveryPrerequisites',
    'Get-ExistingDiscoveryData',
    'Test-DiscoveryDataQuality',
    'Export-DiscoveryData'
) -Variable @() -Alias @()

# Export classes
Export-ModuleMember -Function * -Variable * -Alias * -Cmdlet *
