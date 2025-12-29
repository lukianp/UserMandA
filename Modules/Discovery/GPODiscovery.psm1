# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 2.0.0
# Created: 2025-01-18
# Last Modified: 2025-12-29

<#
.SYNOPSIS
    Group Policy Object Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Group Policy Objects, settings, and configurations from Active Directory environments. This module provides
    comprehensive GPO discovery including policy settings, security configurations, and organizational unit linkages
    essential for M&A Active Directory policy assessment and migration planning.
.NOTES
    Version: 2.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, ActiveDirectory module, GroupPolicy module
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-GPODiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        Write-ModuleLog -ModuleName "GPO" -Message "Starting Group Policy Object Discovery" -Level "HEADER"
        Write-ModuleLog -ModuleName "GPO" -Message "Session ID: $SessionId" -Level "INFO"

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        # Check and import required modules
        try {
            if (-not (Get-Module -Name ActiveDirectory -ErrorAction SilentlyContinue)) {
                Import-Module ActiveDirectory -ErrorAction Stop
                Write-ModuleLog -ModuleName "GPO" -Message "ActiveDirectory module imported successfully" -Level "SUCCESS"
            }

            if (-not (Get-Module -Name GroupPolicy -ErrorAction SilentlyContinue)) {
                Import-Module GroupPolicy -ErrorAction Stop
                Write-ModuleLog -ModuleName "GPO" -Message "GroupPolicy module imported successfully" -Level "SUCCESS"
            }
        } catch {
            Write-ModuleLog -ModuleName "GPO" -Message "Failed to import required modules: $($_.Exception.Message)" -Level "ERROR"
            $Result.AddError("Required PowerShell modules not available", $_.Exception, $null)
            return
        }

        # Prepare credentials if provided
        $credential = $null
        $domainServer = $null

        if ($Configuration.domainCredentials -and
            $Configuration.domainCredentials.username -and
            $Configuration.domainCredentials.password) {

            Write-ModuleLog -ModuleName "GPO" -Message "Using provided domain credentials: $($Configuration.domainCredentials.username -replace '\\.*','\\***')" -Level "INFO"

            # Create PSCredential object
            $securePassword = ConvertTo-SecureString $Configuration.domainCredentials.password -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential($Configuration.domainCredentials.username, $securePassword)

            # Extract domain from username (DOMAIN\username format)
            if ($Configuration.domainCredentials.username -match '^([^\\]+)\\') {
                $domainServer = $matches[1]
                Write-ModuleLog -ModuleName "GPO" -Message "Auto-detected domain from credentials: $domainServer" -Level "INFO"
            }
        } else {
            Write-ModuleLog -ModuleName "GPO" -Message "Using integrated Windows authentication" -Level "INFO"
        }

        # Discover GPOs
        try {
            Write-ModuleLog -ModuleName "GPO" -Message "Discovering Group Policy Objects..." -Level "INFO"

            $getGPOParams = @{ All = $true; ErrorAction = 'Stop' }
            if ($credential) { $getGPOParams['Credential'] = $credential }
            if ($domainServer) { $getGPOParams['Domain'] = $domainServer }

            $gpos = Get-GPO @getGPOParams

            Write-ModuleLog -ModuleName "GPO" -Message "Found $($gpos.Count) GPOs" -Level "SUCCESS"

            foreach ($gpo in $gpos) {
                try {
                    # Get GPO report for detailed settings
                    $reportParams = @{ Guid = $gpo.Id; ReportType = 'Xml'; ErrorAction = 'SilentlyContinue' }
                    if ($credential) { $reportParams['Credential'] = $credential }
                    if ($domainServer) { $reportParams['Domain'] = $domainServer }

                    $gpoReport = Get-GPOReport @reportParams

                    # Parse XML for additional details
                    $settingsCount = 0
                    if ($gpoReport) {
                        try {
                            $xmlReport = [xml]$gpoReport
                            $computerSettings = $xmlReport.GPO.Computer.ExtensionData.Extension
                            $userSettings = $xmlReport.GPO.User.ExtensionData.Extension
                            $settingsCount = ($computerSettings | Measure-Object).Count + ($userSettings | Measure-Object).Count
                        } catch {
                            Write-ModuleLog -ModuleName "GPO" -Message "Could not parse GPO report for $($gpo.DisplayName)" -Level "DEBUG"
                        }
                    }

                    # Get GPO permissions
                    $permissions = $null
                    try {
                        $permParams = @{ Guid = $gpo.Id; ErrorAction = 'SilentlyContinue' }
                        if ($credential) { $permParams['Credential'] = $credential }
                        if ($domainServer) { $permParams['Domain'] = $domainServer }

                        $permissions = Get-GPPermission @permParams -All
                    } catch {
                        Write-ModuleLog -ModuleName "GPO" -Message "Could not get permissions for GPO $($gpo.DisplayName)" -Level "DEBUG"
                    }

                    $gpoData = [PSCustomObject]@{
                        GPOName = $gpo.DisplayName
                        GPOID = $gpo.Id
                        GPOStatus = $gpo.GpoStatus
                        CreationTime = $gpo.CreationTime
                        ModificationTime = $gpo.ModificationTime
                        Owner = $gpo.Owner
                        DomainName = $gpo.DomainName
                        Description = $gpo.Description
                        UserVersionDS = $gpo.User.DSVersion
                        UserVersionSysvol = $gpo.User.SysvolVersion
                        ComputerVersionDS = $gpo.Computer.DSVersion
                        ComputerVersionSysvol = $gpo.Computer.SysvolVersion
                        WmiFilterName = if ($gpo.WmiFilter) { $gpo.WmiFilter.Name } else { $null }
                        WmiFilterDescription = if ($gpo.WmiFilter) { $gpo.WmiFilter.Description } else { $null }
                        SettingsCount = $settingsCount
                        PermissionCount = if ($permissions) { ($permissions | Measure-Object).Count } else { 0 }
                        Path = $gpo.Path
                        SessionId = $SessionId
                        _DataType = 'GPO'
                    }

                    $null = $allDiscoveredData.Add($gpoData)

                    # Get GPO links
                    try {
                        # Query AD for OUs/domains that link to this GPO
                        $getDomainParams = @{ ErrorAction = 'SilentlyContinue' }
                        if ($credential) { $getDomainParams['Credential'] = $credential }
                        if ($domainServer) { $getDomainParams['Server'] = $domainServer }

                        $domain = Get-ADDomain @getDomainParams

                        if ($domain) {
                            # Search for GPO links in domain and OUs
                            $searchParams = @{
                                Filter = { gpLink -like "*$($gpo.Id)*" }
                                Properties = @('gpLink', 'gpOptions', 'distinguishedName', 'name')
                                ErrorAction = 'SilentlyContinue'
                            }
                            if ($credential) { $searchParams['Credential'] = $credential }
                            if ($domainServer) { $searchParams['Server'] = $domainServer }

                            $linkedObjects = Get-ADObject @searchParams

                            foreach ($linkedObj in $linkedObjects) {
                                # Parse gpLink attribute
                                $gpLinkAttr = $linkedObj.gpLink
                                if ($gpLinkAttr -match "\[LDAP://.*?CN=$($gpo.Id).*?\;(\d+)\]") {
                                    $linkOrder = $matches[1]
                                    $linkEnabled = ($linkOrder -band 1) -eq 0
                                    $enforced = ($linkOrder -band 2) -ne 0

                                    $linkData = [PSCustomObject]@{
                                        GPOName = $gpo.DisplayName
                                        GPOID = $gpo.Id
                                        LinkedTo = $linkedObj.distinguishedName
                                        LinkedToName = $linkedObj.name
                                        LinkEnabled = $linkEnabled
                                        Enforced = $enforced
                                        LinkOrder = $linkOrder
                                        SessionId = $SessionId
                                        _DataType = 'GPOLink'
                                    }

                                    $null = $allDiscoveredData.Add($linkData)
                                }
                            }
                        }
                    } catch {
                        Write-ModuleLog -ModuleName "GPO" -Message "Could not get links for GPO $($gpo.DisplayName): $($_.Exception.Message)" -Level "DEBUG"
                    }

                } catch {
                    Write-ModuleLog -ModuleName "GPO" -Message "Error processing GPO $($gpo.DisplayName): $($_.Exception.Message)" -Level "WARN"
                }
            }

            Write-ModuleLog -ModuleName "GPO" -Message "Discovered $($allDiscoveredData.Count) total records (GPOs + Links)" -Level "SUCCESS"

        } catch {
            Write-ModuleLog -ModuleName "GPO" -Message "Failed to discover GPOs: $($_.Exception.Message)" -Level "ERROR"
            $Result.AddError("GPO discovery failed", $_.Exception, $null)
            return
        }

        # Export data
        if ($allDiscoveredData.Count -gt 0) {
            $outputPath = $Context.Paths.RawDataOutput
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType

            foreach ($group in $dataGroups) {
                $data = $group.Group
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "GPO" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }

                $fileName = "GPO_$($group.Name).csv"
                $filePath = Join-Path $outputPath $fileName

                try {
                    $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                    Write-ModuleLog -ModuleName "GPO" -Message "Exported $($data.Count) $($group.Name) records to $fileName" -Level "SUCCESS"
                } catch {
                    Write-ModuleLog -ModuleName "GPO" -Message "Failed to export $fileName: $($_.Exception.Message)" -Level "ERROR"
                }
            }
        } else {
            Write-ModuleLog -ModuleName "GPO" -Message "No GPO data discovered to export" -Level "WARN"
        }

        # Set metadata
        $gpoCount = ($allDiscoveredData | Where-Object { $_._DataType -eq 'GPO' }).Count
        $linkCount = ($allDiscoveredData | Where-Object { $_._DataType -eq 'GPOLink' }).Count

        $Result.RecordCount = $allDiscoveredData.Count
        $Result.Metadata["GPOCount"] = $gpoCount
        $Result.Metadata["GPOLinkCount"] = $linkCount
        $Result.Metadata["TotalRecords"] = $Result.RecordCount
        $Result.Metadata["SessionId"] = $SessionId
        $Result.Metadata["AuthenticationMethod"] = if ($credential) { "DomainCredentials" } else { "IntegratedAuth" }
        if ($domainServer) {
            $Result.Metadata["DomainName"] = $domainServer
        }
    }

    return Invoke-DiscoveryBase -ModuleName "GPO" -Configuration $Configuration -Context $Context -SessionId $SessionId -DiscoveryScript $discoveryScript
}

Export-ModuleMember -Function Invoke-GPODiscovery
