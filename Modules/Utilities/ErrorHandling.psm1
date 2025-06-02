<#
.SYNOPSIS
    Standardized error handling for M&A Discovery Suite
.DESCRIPTION
    Provides consistent error handling, retry logic, and recovery mechanisms
.NOTES
    Version: 1.1.0
    Updated to support company-specific directory structures
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
    param($Configuration, [switch]$ValidateOnly)
    
    try {
        Write-MandALog "Validating system prerequisites" -Level "INFO"
        
        $validationErrors = @()
        
        # Check PowerShell version
        if ($PSVersionTable.PSVersion.Major -lt 5) {
            $validationErrors += "PowerShell 5.1 or higher is required"
        }
        
        # Check required modules (skip in validate-only mode)
        if (-not $ValidateOnly) {
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
        }
        
        # Check output directory - UPDATED to use company-specific paths
        $outputPath = if ($global:MandA.Paths.CompanyProfileRoot) {
            $global:MandA.Paths.CompanyProfileRoot
        } elseif ($Configuration.environment.outputPath) {
            $Configuration.environment.outputPath
        } elseif ($Configuration.environment.profilesBasePath) {
            # Fallback: create a temp directory if we only have profilesBasePath
            Join-Path $Configuration.environment.profilesBasePath "TempValidation"
        } else {
            $null
        }
        
        if (-not $outputPath) {
            $validationErrors += "No output path configured"
        } elseif (-not (Test-Path $outputPath)) {
            try {
                New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
                Write-MandALog "Created output directory: $outputPath" -Level "SUCCESS"
            } catch {
                $validationErrors += "Cannot create output directory: $outputPath - $($_.Exception.Message)"
            }
        }
        
        # Check disk space
        if ($outputPath -and (Test-Path $outputPath)) {
            $drive = Split-Path $outputPath -Qualifier
            if ($drive) {
                try {
                    $freeSpace = (Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='$drive'" -ErrorAction Stop).FreeSpace / 1GB
                    $requiredSpace = if ($Configuration.performance.diskSpaceThresholdGB) { 
                        $Configuration.performance.diskSpaceThresholdGB 
                    } else { 
                        10 
                    }
                    
                    if ($freeSpace -lt $requiredSpace) {
                        $validationErrors += "Insufficient disk space. Required: ${requiredSpace}GB, Available: $([math]::Round($freeSpace, 2))GB"
                    }
                } catch {
                    Write-MandALog "Warning: Could not check disk space for drive $drive" -Level "WARN"
                }
            }
        }
        
        # Check memory
        try {
            $totalMemory = (Get-WmiObject -Class Win32_ComputerSystem -ErrorAction Stop).TotalPhysicalMemory / 1MB
            $requiredMemory = if ($Configuration.performance.memoryThresholdMB) { 
                $Configuration.performance.memoryThresholdMB 
            } else { 
                4096 
            }
            
            if ($totalMemory -lt $requiredMemory) {
                Write-MandALog "Warning: System memory ($([math]::Round($totalMemory, 0))MB) is below recommended ($requiredMemory MB)" -Level "WARN"
            }
        } catch {
            Write-MandALog "Warning: Could not check system memory" -Level "WARN"
        }
        
        # Check network connectivity (skip in validate-only mode)
        if (-not $ValidateOnly) {
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
        }
        
        if ($validationErrors.Count -gt 0) {
            Write-MandALog "Prerequisite validation failed:" -Level "ERROR"
            foreach ($errorMessage in $validationErrors) {
                Write-MandALog "  - $errorMessage" -Level "ERROR"
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
    param($Configuration)
    
    try {
        # UPDATED: Use company-specific paths if available
        if ($global:MandA.Paths.CompanyProfileRoot) {
            Write-MandALog "Using company-specific directory structure" -Level "INFO"
            
            $directories = @(
                $global:MandA.Paths.CompanyProfileRoot,
                $global:MandA.Paths.LogOutput,
                $global:MandA.Paths.RawDataOutput,
                $global:MandA.Paths.ProcessedDataOutput
            )
            
            # Also create Archive and Temp directories
            $archivePath = Join-Path $global:MandA.Paths.CompanyProfileRoot "Archive"
            $tempPath = Join-Path $global:MandA.Paths.CompanyProfileRoot "Temp"
            $directories += @($archivePath, $tempPath)
            
            # Store these paths back in global context for other modules
            $global:MandA.Paths['Archive'] = $archivePath
            $global:MandA.Paths['Temp'] = $tempPath
            
        } else {
            # Fallback to configuration-based paths
            Write-MandALog "Using configuration-based directory structure" -Level "INFO"
            
            $outputPath = $Configuration.environment.outputPath
            if (-not $outputPath) {
                # Try to construct from profilesBasePath if available
                if ($Configuration.environment.profilesBasePath) {
                    $outputPath = Join-Path $Configuration.environment.profilesBasePath "DefaultOutput"
                    Write-MandALog "No outputPath configured, using fallback: $outputPath" -Level "WARN"
                } else {
                    throw "No output path found in configuration and no company-specific paths available"
                }
            }
            
            $directories = @(
                $outputPath,
                (Join-Path $outputPath "Logs"),
                (Join-Path $outputPath "Raw"),
                (Join-Path $outputPath "Processed"),
                (Join-Path $outputPath "Archive"),
                (Join-Path $outputPath "Temp")
            )
        }
        
        # Create all directories
        foreach ($dir in $directories) {
            if (-not (Test-Path $dir)) {
                New-Item -Path $dir -ItemType Directory -Force | Out-Null
                Write-MandALog "Created directory: $dir" -Level "SUCCESS"
            } else {
                Write-MandALog "Directory already exists: $dir" -Level "DEBUG"
            }
        }
        
        # Verify write access to all directories
        $accessErrors = @()
        foreach ($dir in $directories) {
            if (-not (Test-DirectoryWriteAccess -DirectoryPath $dir)) {
                $accessErrors += $dir
            }
        }
        
        if ($accessErrors.Count -gt 0) {
            Write-MandALog "Write access denied for directories:" -Level "ERROR"
            foreach ($dir in $accessErrors) {
                Write-MandALog "  - $dir" -Level "ERROR"
            }
            return $false
        }
        
        Write-MandALog "All output directories initialized successfully" -Level "SUCCESS"
        return $true
        
    } catch {
        Write-MandALog "Failed to initialize output directories: $($_.Exception.Message)" -Level "ERROR"
        Write-MandALog "Stack trace: $($_.ScriptStackTrace)" -Level "DEBUG"
        return $false
    }
}

function Test-DirectoryWriteAccess {
    param(
        [Parameter(Mandatory=$true)]
        [string]$DirectoryPath
    )
    
    try {
        $testFile = Join-Path $DirectoryPath "write_test_$(Get-Random).tmp"
        "test" | Out-File -FilePath $testFile -ErrorAction Stop
        Remove-Item $testFile -Force -ErrorAction SilentlyContinue
        return $true
    } catch {
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
    'Initialize-OutputDirectories',
    'Test-DirectoryWriteAccess'
)
