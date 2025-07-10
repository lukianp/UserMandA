# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Base module providing common functionality for all discovery modules
.DESCRIPTION
    Provides standardized interfaces, error handling, retry logic, and performance tracking
.NOTES
    Author: Enhanced M&A Discovery Suite
    Version: 2.0.1
    Last Modified: 2025-06-09
#>

# Module-scope context variable
$script:ModuleContext = $null

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
        $Context = $null
    )
    
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        
        $result.Data = & $ScriptBlock
        $result.Success = $true
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    
    return $result
}

function New-DiscoveryResult {
    param([string]$ModuleName)
    
    # Use the class if available, otherwise create PSCustomObject
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        return [DiscoveryResult]::new($ModuleName)
    } else {
        return [PSCustomObject]@{
            Success = $false
            ModuleName = $ModuleName
            RecordCount = 0
            Duration = [timespan]::Zero
            Timestamp = Get-Date
            Metadata = @{}
            Data = @()
            Errors = @()
            Warnings = @()
            ExecutionId = [guid]::NewGuid().ToString()
        }
    }
}

function Test-RetryableError {
    param([Exception]$Exception)
    
    try {
        $retryableStatusCodes = @(408, 429, 500, 502, 503, 504)
    
        if ($Exception.Response -and $Exception.Response.StatusCode) {
            return $Exception.Response.StatusCode.value__ -in $retryableStatusCodes
        }
        
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
        
        $retryableMessages = @('timeout', 'temporary', 'transient', 'throttl', 'rate limit', 'busy', 'unavailable')
        $message = $Exception.Message.ToLower()
        
        foreach ($keyword in $retryableMessages) {
            if ($message -like "*$keyword*") {
                return $true
            }
        }
        
        return $false
    } catch {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Error in function 'Test-RetryableError': $($_.Exception.Message)" -Level "ERROR"
        }
        throw
    }
}

function Calculate-BackoffDelay {
    param(
        [int]$Attempt,
        [int]$InitialDelay,
        [Exception]$Exception
    )
    
    try {
        if ($Exception -and $Exception.Response -and $Exception.Response.Headers -and $Exception.Response.Headers.RetryAfter) {
            $retryAfter = $Exception.Response.Headers.RetryAfter
            if ($retryAfter.Delta) {
                return [math]::Ceiling($retryAfter.Delta.TotalSeconds)
            }
        }
        
        $exponentialDelay = $InitialDelay * [math]::Pow(2, $Attempt - 1)
        $jitter = Get-Random -Minimum 0 -Maximum ([int]($exponentialDelay * 0.1))
        
        return [math]::Min($exponentialDelay + $jitter, 300)
    } catch {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Error in function 'Calculate-BackoffDelay': $($_.Exception.Message)" -Level "ERROR"
        }
        throw
    }
}

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
        $Context = $null
    )
    
    $attempt = 0
    $lastError = $null
    
    while ($attempt -lt $MaxRetries) {
        $attempt++
        
        try {
            if ($Context -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
                Write-MandALog -Message "Executing $OperationName (attempt $attempt of $MaxRetries)" -Level "DEBUG" -Context $Context
            }
            
            $result = & $ScriptBlock
            return $result
        } catch {
            $lastError = $_
            
            $isRetryable = Test-RetryableError -Exception $_.Exception
            
            if ($attempt -lt $MaxRetries -and $isRetryable) {
                $delay = Calculate-BackoffDelay -Attempt $attempt -InitialDelay $InitialDelaySeconds -Exception $_.Exception
                
                if ($Context -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
                    Write-MandALog -Message "Retryable error in $OperationName. Waiting $delay seconds before retry..." -Level "WARN" -Context $Context
                }
                
                Start-Sleep -Seconds $delay
            } else {
                break
            }
        }
    }
    
    throw $lastError
}

function Test-DiscoveryPrerequisites {
    param(
        [string]$ModuleName,
        [hashtable]$Configuration,
        $Context = $null,
        [string[]]$RequiredPermissions = @()
    )
    
    try {
        if ($Context -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
            Write-MandALog -Message "Validating prerequisites for $ModuleName" -Level "DEBUG" -Context $Context
        }
        
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
        
        if ($RequiredPermissions.Count -gt 0) {
            if ($Context -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
                Write-MandALog -Message "Checking required permissions: $($RequiredPermissions -join ', ')" -Level "DEBUG" -Context $Context
            }
        }
        
        return $true
    } catch {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Error in function 'Test-DiscoveryPrerequisites': $($_.Exception.Message)" -Level "ERROR"
        }
        throw
    }
}

function Get-RequiredConfiguration {
    param([string]$ModuleName)
    
    try {
        $configMap = @{
            'ExternalIdentity' = @('authentication.tenantId', 'graphAPI.pageSize')
            'FileServer' = @('discovery.fileServer.targetServers', 'discovery.fileServer.timeoutPerServerRemoteCommandSeconds')
            'GPO' = @('environment.domainController')
            'Graph' = @('authentication.tenantId', 'authentication.clientId', 'graphAPI.selectFields')
        }
        
        if ($configMap.ContainsKey($ModuleName)) {
            return $configMap[$ModuleName]
        } else {
            return @()
        }
    } catch {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Error in function 'Get-RequiredConfiguration': $($_.Exception.Message)" -Level "ERROR"
        }
        throw
    }
}

function Get-ExistingDiscoveryData {
    param(
        [string]$ModuleName,
        [string]$OutputPath,
        $Context = $null
    )
    
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
                
                if ($Context -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
                    Write-MandALog -Message "Loaded existing file: $fileName ($($data.Count) records)" -Level "DEBUG" -Context $Context
                }
            } catch {
                if ($Context -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
                    Write-MandALog -Message "Failed to load existing file $fileName : $($_.Exception.Message)" -Level "WARN" -Context $Context
                }
                $allFilesExist = $false
                break
            }
        } else {
            $allFilesExist = $false
            break
        }
    }
    
    if ($allFilesExist) {
        return $existingData
    } else {
        return $null
    }
}

function Test-DiscoveryDataQuality {
    param(
        [object[]]$Data,
        [string]$ModuleName,
        $Context = $null
    )
    
    try {
        $warnings = @()
        
        if ($null -eq $Data -or $Data.Count -eq 0) {
            $warnings += "No data returned from discovery"
            return @{ Warnings = $warnings }
        }
        
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
        
        if ($validationRules.UniqueIdField -and $Data.Count -gt 1) {
            $uniqueIds = $Data | Select-Object -ExpandProperty $validationRules.UniqueIdField -Unique -ErrorAction SilentlyContinue
            if ($uniqueIds -and $uniqueIds.Count -lt $Data.Count) {
                $duplicateCount = $Data.Count - $uniqueIds.Count
                $warnings += "Found $duplicateCount duplicate records based on $($validationRules.UniqueIdField)"
            }
        }
        
        return @{ Warnings = $warnings }
    } catch {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Error in function 'Test-DiscoveryDataQuality': $($_.Exception.Message)" -Level "ERROR"
        }
        throw
    }
}

function Get-DataValidationRules {
    param([string]$ModuleName)
    
    try {
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
        
        if ($rules.ContainsKey($ModuleName)) {
            return $rules[$ModuleName]
        } else {
            return @{}
        }
    } catch {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Error in function 'Get-DataValidationRules': $($_.Exception.Message)" -Level "ERROR"
        }
        throw
    }
}

function Export-DiscoveryData {
    param(
        [object[]]$Data,
        [string]$ModuleName,
        [string]$OutputPath,
        $Context = $null,
        [hashtable]$FileMap = $null
    )
    
    try {
        if (-not (Test-Path $OutputPath)) {
            New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
        }
        
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $enrichedData = $Data | ForEach-Object {
            $item = $_
            try {
                $item | Add-Member -NotePropertyName '_DiscoveryTimestamp' -NotePropertyValue $timestamp -PassThru -ErrorAction SilentlyContinue
            } catch {
                $item
            }
        }
        
        if ($Context -and $Context.Version) {
            $enrichedData = $enrichedData | ForEach-Object {
                $item = $_
                try {
                    $item | Add-Member -NotePropertyName '_DiscoveryVersion' -NotePropertyValue $Context.Version -PassThru -ErrorAction SilentlyContinue
                } catch {
                    $item
                }
            }
        }
        
        $enrichedData = $enrichedData | ForEach-Object {
            $item = $_
            try {
                $item | Add-Member -NotePropertyName '_DiscoveryModule' -NotePropertyValue $ModuleName -PassThru -ErrorAction SilentlyContinue
            } catch {
                $item
            }
        }
        
        if ($FileMap) {
            foreach ($key in $FileMap.Keys) {
                $fileName = $FileMap[$key]
                $filePath = Join-Path $OutputPath $fileName
                $fileData = $enrichedData | Where-Object { $_._DataType -eq $key }
                
                if ($fileData) {
                    $fileData | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                    if ($Context -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
                        Write-MandALog -Message "Exported $($fileData.Count) records to $fileName" -Level "DEBUG" -Context $Context
                    }
                }
            }
        } else {
            $fileName = "$ModuleName.csv"
            $filePath = Join-Path $OutputPath $fileName
            $enrichedData | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
            if ($Context -and (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
                Write-MandALog -Message "Exported $($enrichedData.Count) records to $fileName" -Level "DEBUG" -Context $Context
            }
        }
    } catch {
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "Error in function 'Export-DiscoveryData': $($_.Exception.Message)" -Level "ERROR"
        }
        throw
    }
}

# Export module members
Export-ModuleMember -Function @(
    'Invoke-DiscoveryWithRetry',
    'Test-RetryableError',
    'Calculate-BackoffDelay',
    'Test-DiscoveryPrerequisites',
    'Get-ExistingDiscoveryData',
    'Test-DiscoveryDataQuality',
    'Export-DiscoveryData',
    'Invoke-SafeModuleExecution',
    'Get-ModuleContext',
    'New-DiscoveryResult',
    'Get-RequiredConfiguration',
    'Get-DataValidationRules'
) -Variable @() -Alias @()