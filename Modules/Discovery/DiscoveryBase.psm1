# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Base module for all discovery operations with standardized patterns and throttling
.DESCRIPTION
    Provides consistent initialization, validation, and error handling for all discovery modules. This module includes 
    standardized patterns for discovery operations including batching, throttling, retry logic, and efficient data 
    retrieval with `Invoke-GraphAPIWithPaging`. It serves as the foundation for all discovery modules ensuring 
    consistent behavior, error handling, and performance optimization across the entire discovery suite.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, ClassDefinitions module, AuthenticationService module
#>

# Import required modules
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Core\ClassDefinitions.psm1") -Force
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Authentication\SessionManager.psm1") -Force
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Authentication\AuthenticationService.psm1") -Force

function Start-DiscoveryModule {
    <#
    .SYNOPSIS
        Standardized discovery module initialization
    .DESCRIPTION
        Provides consistent initialization, validation, and error handling for all discovery modules
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId,
        
        [Parameter(Mandatory=$false)]
        [string[]]$RequiredServices = @('Graph'),
        
        [Parameter(Mandatory=$false)]
        [scriptblock]$DiscoveryScript
    )
    
    # Initialize result
    $result = [DiscoveryResult]::new($ModuleName)
    
    try {
        # Validate prerequisites
        $validation = Test-DiscoveryPrerequisites -ModuleName $ModuleName -Context $Context -SessionId $SessionId
        if (-not $validation.Success) {
            foreach ($validationError in $validation.Errors) {
                $result.AddError($validationError.Message, $null, $validationError.Context)
            }
            return $result
        }
        
        # Connect to required services
        $connections = @{}
        foreach ($service in $RequiredServices) {
            try {
                Write-ModuleLog -ModuleName $ModuleName -Message "Connecting to $service service..." -Level "INFO"
                
                # Try session-based auth first
                $authSuccess = $false
                try {
                    $connections[$service] = Get-AuthenticationForService -Service $service -SessionId $SessionId
                    $authSuccess = $true
                    Write-ModuleLog -ModuleName $ModuleName -Message "Connected to $service via session successfully" -Level "SUCCESS"
                } catch {
                    Write-ModuleLog -ModuleName $ModuleName -Message "Session auth failed for $service`: $($_.Exception.Message). Trying direct credential auth..." -Level "WARN"
                }
                
                # Fallback to direct credential authentication for Graph service
                if (-not $authSuccess -and $service -eq 'Graph') {
                    # Extract credentials from Configuration
                    $tenantId = $Configuration.TenantId
                    $clientId = $Configuration.ClientId
                    $clientSecret = $Configuration.ClientSecret
                    
                    if ($tenantId -and $clientId -and $clientSecret) {
                        Write-ModuleLog -ModuleName $ModuleName -Message "Attempting direct Graph authentication with ClientId: $clientId" -Level "INFO"
                        
                        # Import Microsoft Graph module if needed
                        if (-not (Get-Module -Name Microsoft.Graph.Authentication)) {
                            Import-Module Microsoft.Graph.Authentication -ErrorAction Stop
                        }
                        
                        # Create credential and connect
                        $secureSecret = ConvertTo-SecureString $clientSecret -AsPlainText -Force
                        $credential = New-Object System.Management.Automation.PSCredential($clientId, $secureSecret)
                        
                        Connect-MgGraph -ClientSecretCredential $credential -TenantId $tenantId -NoWelcome -ErrorAction Stop
                        
                        $connections[$service] = @{
                            AuthType = 'DirectCredential'
                            TenantId = $tenantId
                            ClientId = $clientId
                            Connected = $true
                        }
                        $authSuccess = $true
                        Write-ModuleLog -ModuleName $ModuleName -Message "Connected to Graph via direct credentials successfully" -Level "SUCCESS"
                    } else {
                        Write-ModuleLog -ModuleName $ModuleName -Message "Direct auth failed - missing credentials. TenantId: $($null -ne $tenantId), ClientId: $($null -ne $clientId), ClientSecret: $($null -ne $clientSecret)" -Level "ERROR"
                    }
                }
                
                if (-not $authSuccess) {
                    throw "Failed to authenticate to $service service using both session and direct methods"
                }
            } catch {
                $result.AddError("Failed to connect to $service service", $_.Exception, @{Service = $service})
                return $result
            }
        }
        
        # Execute discovery
        if ($DiscoveryScript) {
            $discoveryParams = @{
                Configuration = $Configuration
                Context = $Context
                SessionId = $SessionId
                Connections = $connections
                Result = $result
            }
            
            $discoveryData = & $DiscoveryScript @discoveryParams
            $result.Data = $discoveryData
        }
        
    } catch {
        $result.AddError("Critical error during $ModuleName discovery", $_.Exception, @{
            Phase = "Discovery"
            SessionId = $SessionId
        })
    } finally {
        $result.EndTime = Get-Date
    }
    
    return $result
}

function Test-DiscoveryPrerequisites {
    param(
        [string]$ModuleName,
        [hashtable]$Context,
        [string]$SessionId
    )
    
    $validation = @{
        Success = $true
        Errors = @()
    }
    
    # Check output path
    if (-not $Context.Paths.RawDataOutput) {
        $validation.Success = $false
        $validation.Errors += @{
            Message = "Output path not configured"
            Context = @{ Path = "RawDataOutput" }
        }
    } elseif (-not (Test-Path $Context.Paths.RawDataOutput)) {
        try {
            New-Item -Path $Context.Paths.RawDataOutput -ItemType Directory -Force | Out-Null
        } catch {
            $validation.Success = $false
            $validation.Errors += @{
                Message = "Cannot create output directory"
                Context = @{ Path = $Context.Paths.RawDataOutput; Error = $_.Exception.Message }
            }
        }
    }
    
    # Validate session
    if ([string]::IsNullOrEmpty($SessionId)) {
        $validation.Success = $false
        $validation.Errors += @{
            Message = "SessionId is required but was not provided"
            Context = @{ SessionId = $SessionId }
        }
    }
    
    return $validation
}

function Write-ModuleLog {
    param(
        [string]$ModuleName,
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "[$ModuleName] $Message" -Level $Level -Component "$($ModuleName)Discovery" -Context $Context
    } else {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "DEBUG" { "Gray" }
            "HEADER" { "Cyan" }
            default { "White" }
        }
        Write-Host "[$ModuleName] $Message" -ForegroundColor $color
    }
}

function Export-DiscoveryResults {
    param(
        [object[]]$Data,
        [string]$FileName,
        [string]$OutputPath,
        [string]$ModuleName,
        [string]$SessionId
    )
    
    if (-not $Data -or $Data.Count -eq 0) {
        Write-ModuleLog -ModuleName $ModuleName -Message "No data to export" -Level "WARN"
        return $false
    }
    
    try {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        
        # Add metadata to each record
        $exportData = $Data | ForEach-Object {
            $record = $_.PSObject.Copy()
            $record | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
            $record | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value $ModuleName -Force
            $record | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
            $record
        }
        
        $filePath = Join-Path $OutputPath $FileName
        $exportData | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
        
        # Verify export
        $verifyCount = (Import-Csv -Path $filePath).Count
        if ($verifyCount -ne $exportData.Count) {
            throw "Export verification failed: expected $($exportData.Count) records, found $verifyCount"
        }
        
        Write-ModuleLog -ModuleName $ModuleName -Message "Exported $($exportData.Count) records to $FileName" -Level "SUCCESS"
        return $true
        
    } catch {
        Write-ModuleLog -ModuleName $ModuleName -Message "Export failed: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Invoke-GraphAPIWithPaging {
    param(
        [string]$Uri,
        [string]$ModuleName,
        [int]$MaxRetries = 3,
        [hashtable]$Headers = @{ 'ConsistencyLevel' = 'eventual' }
    )

    $allResults = @()
    $currentUri = $Uri
    $pageCount = 0

    do {
        $pageCount++
        $retryCount = 0
        $response = $null

        while ($retryCount -lt $MaxRetries -and -not $response) {
            $retryCount++
            try {
                # Only log fetching for first page or when retrying
                if ($pageCount -eq 1 -or $retryCount -gt 1) {
                    Write-ModuleLog -ModuleName $ModuleName -Message "Fetching page $pageCount (attempt $retryCount)" -Level "DEBUG"
                }
                $response = Invoke-MgGraphRequest -Uri $currentUri -Method GET -Headers $Headers -ErrorAction Stop

                if ($response.value -and $response.value.Count -gt 0) {
                    $allResults += $response.value
                    # Only log if we got actual data
                    Write-ModuleLog -ModuleName $ModuleName -Message "Retrieved $($response.value.Count) records from page $pageCount" -Level "DEBUG"
                }

            } catch {
                if ($retryCount -lt $MaxRetries) {
                    $delay = [Math]::Pow(2, $retryCount)
                    Write-ModuleLog -ModuleName $ModuleName -Message "Request failed, retrying in $delay seconds: $($_.Exception.Message)" -Level "WARN"
                    Start-Sleep -Seconds $delay
                } else {
                    throw
                }
            }
        }

        $currentUri = $response.'@odata.nextLink'

    } while ($currentUri)

    # Only log summary if we got data or multiple pages
    if ($allResults.Count -gt 0 -or $pageCount -gt 1) {
        Write-ModuleLog -ModuleName $ModuleName -Message "Retrieved total of $($allResults.Count) records across $pageCount pages" -Level "INFO"
    }
    return $allResults
}

Export-ModuleMember -Function @(
    'Start-DiscoveryModule',
    'Test-DiscoveryPrerequisites',
    'Write-ModuleLog',
    'Export-DiscoveryResults',
    'Invoke-GraphAPIWithPaging'
)
