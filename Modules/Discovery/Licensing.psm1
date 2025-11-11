# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Licensing Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Microsoft 365 licensing information including subscriptions, user licenses, and service plans using 
    Microsoft Graph API. This module provides comprehensive licensing discovery including subscription details, 
    user license assignments, service plan utilization, and licensing compliance essential for M&A licensing 
    assessment and cost optimization planning.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, Microsoft.Graph modules, DiscoveryBase module
#>


# Fallback logging function if Write-MandALog is not available
if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
    function Write-MandALog {
        param(
            [string]$Message,
            [string]$Level = "INFO",
            [string]$Component = "Discovery",
            [hashtable]$Context = @{}
        )
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $logMessage = "[$timestamp] [$Level] [$Component] $Message"
        switch ($Level) {
            'ERROR' { Write-Error "[Licensing] $logMessage" }
            'WARN' { Write-Warning "[Licensing] $logMessage" }
            'SUCCESS' { Write-Information "[Licensing] $logMessage" -InformationAction Continue }
            'HEADER' { Write-Verbose "[Licensing] $logMessage" -Verbose }
            'DEBUG' { Write-Verbose "[Licensing] $logMessage" -Verbose }
            default { Write-Information "[Licensing] $logMessage" -InformationAction Continue }
        }
    }
}

function Write-LicensingLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[Licensing] $Message" -Level $Level -Component "LicensingDiscovery" -Context $Context
}

function Invoke-LicensingDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-LicensingLog -Level "HEADER" -Message "Starting Discovery (v4.0 - Clean Session Auth)" -Context $Context
    Write-LicensingLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    # Ensure ClassDefinitions module is loaded
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        $result = [DiscoveryResult]::new('Licensing')
    } catch {
        Write-LicensingLog -Level "ERROR" -Message "Failed to load DiscoveryResult class: $($_.Exception.Message)" -Context $Context
        throw "Critical error: Cannot load required DiscoveryResult class. Discovery cannot proceed."
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Ensure-Path -Path $outputPath

        # Authenticate using session
        Write-LicensingLog -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
        try {
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
            Write-LicensingLog -Level "SUCCESS" -Message "Connected to Microsoft Graph via session authentication" -Context $Context
        } catch {
            $result.AddError("Failed to authenticate with Graph service: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # Perform discovery
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover subscriptions
        try {
            Write-LicensingLog -Level "INFO" -Message "Discovering subscriptions..." -Context $Context
            $subscriptions = Get-MgSubscribedSku -ErrorAction Stop
            
            foreach ($sub in $subscriptions) {
                $subObj = [PSCustomObject]@{
                    SkuId = $sub.SkuId
                    SkuPartNumber = $sub.SkuPartNumber
                    ConsumedUnits = $sub.ConsumedUnits
                    PrepaidUnits = $sub.PrepaidUnits.Enabled
                    ServicePlans = ($sub.ServicePlans | ForEach-Object { "$($_.ServicePlanName):$($_.ProvisioningStatus)" }) -join ';'
                    _DataType = 'Subscription'
                }
                $null = $allDiscoveredData.Add($subObj)
            }
            
            Write-LicensingLog -Level "SUCCESS" -Message "Discovered $($subscriptions.Count) subscriptions" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover subscriptions: $($_.Exception.Message)", @{Section="Subscriptions"})
        }

        # Export data
        if ($allDiscoveredData.Count -gt 0) {
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $data = $group.Group
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Licensing" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                $fileName = switch ($group.Name) {
                    'Subscription' { 'LicensingSubscriptions.csv' }
                    default { "Licensing_$($group.Name).csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                Write-LicensingLog -Level "SUCCESS" -Message "Exported $($data.Count) $($group.Name) records to $fileName" -Context $Context
            }
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-LicensingLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        Disconnect-MgGraph -ErrorAction SilentlyContinue
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-LicensingLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

function Ensure-Path {
    param($Path)
    if (-not (Test-Path -Path $Path -PathType Container)) {
        try {
            New-Item -Path $Path -ItemType Directory -Force -ErrorAction Stop | Out-Null
        } catch {
            throw "Failed to create output directory: $Path. Error: $($_.Exception.Message)"
        }
    }
}

Export-ModuleMember -Function Invoke-LicensingDiscovery

