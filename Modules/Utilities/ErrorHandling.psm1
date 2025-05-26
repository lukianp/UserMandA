<#
.SYNOPSIS
    Standardized error handling for M&A Discovery Suite
.DESCRIPTION
    Provides consistent error handling, retry logic, and recovery mechanisms
#>

function Invoke-WithRetry {
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$false)]
        [int]$MaxRetries = 3,
        
        [Parameter(Mandatory=$false)]
        [int]$DelaySeconds = 5,
        
        [Parameter(Mandatory=$false)]
        [string]$OperationName = "Operation",
        
        [Parameter(Mandatory=$false)]
        [array]$RetryableErrors = @("TimeoutException", "HttpRequestException", "WebException")
    )
    
    $attempt = 0
    $lastError = $null
    
    while ($attempt -lt $MaxRetries) {
        $attempt++
        
        try {
            Write-MandALog "Executing $OperationName (attempt $attempt of $MaxRetries)" -Level "DEBUG"
            $result = & $ScriptBlock
            Write-MandALog "$OperationName completed successfully on attempt $attempt" -Level "SUCCESS"
            return $result
            
        } catch {
            $lastError = $_
            $errorType = $_.Exception.GetType().Name
            
            Write-MandALog "$OperationName failed on attempt $attempt`: $($_.Exception.Message)" -Level "WARN"
            
            # Check if error is retryable
            $isRetryable = $RetryableErrors -contains $errorType -or 
                          $_.Exception.Message -match "timeout|connection|network|temporary"
            
            if ($attempt -lt $MaxRetries -and $isRetryable) {
                $waitTime = $DelaySeconds * $attempt
                Write-MandALog "Retrying $OperationName in $waitTime seconds..." -Level "INFO"
                Start-Sleep -Seconds $waitTime
            } else {
                break
            }
        }
    }
    
    # All retries exhausted
    Write-MandALog "$OperationName failed after $MaxRetries attempts" -Level "ERROR"
    throw $lastError
}

function Test-CriticalError {
    param(
        [Parameter(Mandatory=$true)]
        [System.Management.Automation.ErrorRecord]$ErrorRecord
    )
    
    $criticalErrors = @(
        "OutOfMemoryException",
        "StackOverflowException",
        "AccessViolationException",
        "InvalidOperationException"
    )
    
    $errorType = $ErrorRecord.Exception.GetType().Name
    return $criticalErrors -contains $errorType
}

function Get-FriendlyErrorMessage {
    param(
        [Parameter(Mandatory=$true)]
        [System.Management.Automation.ErrorRecord]$ErrorRecord
    )
    
    $errorType = $ErrorRecord.Exception.GetType().Name
    $errorMessage = $ErrorRecord.Exception.Message
    
    switch ($errorType) {
        "UnauthorizedAccessException" {
            return "Access denied. Please check permissions and credentials."
        }
        "FileNotFoundException" {
            return "Required file not found: $($ErrorRecord.Exception.FileName)"
        }
        "DirectoryNotFoundException" {
            return "Required directory not found. Please check the path configuration."
        }
        "TimeoutException" {
            return "Operation timed out. Consider increasing timeout values in configuration."
        }
        "HttpRequestException" {
            return "Network request failed. Please check internet connectivity and service availability."
        }
        "ArgumentException" {
            return "Invalid parameter provided: $errorMessage"
        }
        default {
            return $errorMessage
        }
    }
}

function Write-ErrorSummary {
    param(
        [Parameter(Mandatory=$true)]
        [array]$Errors,
        
        [Parameter(Mandatory=$false)]
        [string]$Context = "Operation"
    )
    
    if ($Errors.Count -eq 0) {
        return
    }
    
    Write-MandALog "$Context Error Summary" -Level "HEADER"
    Write-MandALog "Total Errors: $($Errors.Count)" -Level "ERROR"
    
    # Group errors by type
    $errorGroups = $Errors | Group-Object { $_.Exception.GetType().Name }
    
    foreach ($group in $errorGroups) {
        Write-MandALog "$($group.Name): $($group.Count) occurrences" -Level "ERROR"
        
        # Show first few examples
        $examples = $group.Group | Select-Object -First 3
        foreach ($example in $examples) {
            $friendlyMessage = Get-FriendlyErrorMessage -ErrorRecord $example
            Write-MandALog "  - $friendlyMessage" -Level "ERROR"
        }
        
        if ($group.Count -gt 3) {
            Write-MandALog "  ... and $($group.Count - 3) more" -Level "ERROR"
        }
    }
}

function Test-Prerequisites {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Validating system prerequisites" -Level "INFO"
        
        $validationErrors = @()
        
        # Check PowerShell version
        if ($PSVersionTable.PSVersion.Major -lt 5) {
            $validationErrors += "PowerShell 5.1 or higher is required"
        }
        
        # Check required modules
        $requiredModules = @(
            "Microsoft.Graph",
            "Microsoft.Graph.Authentication",
            "ExchangeOnlineManagement"
        )
        
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -ListAvailable -Name $module)) {
                $validationErrors += "Required module not installed: $module"
            }
        }
        
        # Check output directory
        $outputPath = $Configuration.environment.outputPath
        if (-not (Test-Path $outputPath)) {
            try {
                New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
                Write-MandALog "Created output directory: $outputPath" -Level "SUCCESS"
            } catch {
                $validationErrors += "Cannot create output directory: $outputPath"
            }
        }
        
        # Check disk space
        $drive = Split-Path $outputPath -Qualifier
        $freeSpace = (Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='$drive'").FreeSpace / 1GB
        $requiredSpace = $Configuration.performance.diskSpaceThresholdGB
        
        if ($freeSpace -lt $requiredSpace) {
            $validationErrors += "Insufficient disk space. Required: ${requiredSpace}GB, Available: $([math]::Round($freeSpace, 2))GB"
        }
        
        # Check memory
        $totalMemory = (Get-WmiObject -Class Win32_ComputerSystem).TotalPhysicalMemory / 1MB
        $requiredMemory = $Configuration.performance.memoryThresholdMB
        
        if ($totalMemory -lt $requiredMemory) {
            Write-MandALog "Warning: System memory ($([math]::Round($totalMemory, 0))MB) is below recommended ($requiredMemory MB)" -Level "WARN"
        }
        
        # Check network connectivity
        $endpoints = @("graph.microsoft.com", "login.microsoftonline.com")
        foreach ($endpoint in $endpoints) {
            try {
                $result = Test-NetConnection -ComputerName $endpoint -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue
                if (-not $result) {
                    $validationErrors += "Cannot reach required endpoint: $endpoint"
                }
            } catch {
                $validationErrors += "Network connectivity test failed for: $endpoint"
            }
        }
        
        if ($validationErrors.Count -gt 0) {
            Write-MandALog "Prerequisite validation failed:" -Level "ERROR"
            foreach ($error in $validationErrors) {
                Write-MandALog "  - $error" -Level "ERROR"
            }
            return $false
        }
        
        Write-MandALog "All prerequisites validated successfully" -Level "SUCCESS"
        return $true
        
    } catch {
        Write-MandALog "Prerequisite validation error: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Initialize-OutputDirectories {
    param([hashtable]$Configuration)
    
    try {
        $outputPath = $Configuration.environment.outputPath
        $directories = @(
            $outputPath,
            (Join-Path $outputPath "Logs"),
            (Join-Path $outputPath "Raw"),
            (Join-Path $outputPath "Processed"),
            (Join-Path $outputPath "Archive")
        )
        
        foreach ($dir in $directories) {
            if (-not (Test-Path $dir)) {
                New-Item -Path $dir -ItemType Directory -Force | Out-Null
                Write-MandALog "Created directory: $dir" -Level "SUCCESS"
            }
        }
        
        return $true
        
    } catch {
        Write-MandALog "Failed to initialize output directories: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Invoke-WithRetry',
    'Test-CriticalError',
    'Get-FriendlyErrorMessage',
    'Write-ErrorSummary',
    'Test-Prerequisites',
    'Initialize-OutputDirectories'
)