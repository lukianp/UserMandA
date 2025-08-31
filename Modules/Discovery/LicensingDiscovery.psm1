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
        Write-Host "[$timestamp] [$Level] [$Component] $Message" -ForegroundColor $(
            switch ($Level) {
                'ERROR' { 'Red' }
                'WARN' { 'Yellow' }
                'SUCCESS' { 'Green' }
                'HEADER' { 'Cyan' }
                'DEBUG' { 'Gray' }
                default { 'White' }
            }
        )
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

        # Stage data for generic export and optionally export directly
        if ($allDiscoveredData.Count -gt 0) {
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $grouped = $allDiscoveredData | Group-Object -Property _DataType

            # Build standardized Data groups for launcher export
            $result.Data = @()
            foreach ($g in $grouped) {
                $data = $g.Group
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Licensing" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }

                $exportBaseName = switch ($g.Name) {
                    'Subscription' { 'LicensingSubscriptions' }
                    default { "Licensing_$($g.Name)" }
                }

                # Add to standardized result for the launcher
                $result.Data += ,([PSCustomObject]@{
                    Name = $exportBaseName
                    Group = $data
                })

                # Optional direct export (skip if launcher will handle it)
                $disableInternal = ($Context -is [hashtable]) -and $Context.ContainsKey('DisableInternalExport') -and $Context.DisableInternalExport
                if (-not $disableInternal) {
                    $fileName = "$exportBaseName.csv"
                    $filePath = Join-Path $outputPath $fileName
                    $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                    Write-LicensingLog -Level "SUCCESS" -Message "Exported $($data.Count) $($g.Name) records to $fileName" -Context $Context
                } else {
                    Write-LicensingLog -Level "INFO" -Message "Internal export disabled; launcher will export $exportBaseName" -Context $Context
                }
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
        $result.Complete()
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
