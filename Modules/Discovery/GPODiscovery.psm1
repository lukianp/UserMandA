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
        $domainController = $null

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

            # Auto-discover domain controller for the domain
            if ($domainServer) {
                Write-ModuleLog -ModuleName "GPO" -Message "Auto-discovering domain controller for domain: $domainServer" -Level "INFO"

                # Try multiple methods to discover DC (ordered by reliability)
                try {
                    # Method 1: DNS SRV record lookup (most universal, works without auth/domain join)
                    # This is the Microsoft-standard method for DC location
                    if (-not $domainController) {
                        try {
                            Write-ModuleLog -ModuleName "GPO" -Message "Attempting DNS SRV lookup for DC discovery..." -Level "DEBUG"

                            # Query DNS for domain controller SRV records
                            # _ldap._tcp.dc._msdcs.DOMAIN is the standard DC locator record
                            $srvRecord = "_ldap._tcp.dc._msdcs.$domainServer"

                            # Use nslookup to query SRV records (works on all Windows versions)
                            $nslookupOutput = nslookup -type=SRV $srvRecord 2>&1 | Out-String

                            # Parse nslookup output to extract DC hostname
                            if ($nslookupOutput -match 'svr hostname\s*=\s*(\S+)') {
                                $dcFqdn = $matches[1].TrimEnd('.')
                                $domainController = $dcFqdn
                                Write-ModuleLog -ModuleName "GPO" -Message "Auto-discovered DC via DNS SRV: $domainController" -Level "SUCCESS"
                            }
                            # Alternative: Extract from "Server:" line (gets FQDN directly)
                            elseif ($nslookupOutput -match 'Server:\s+(\S+)') {
                                $dcFqdn = $matches[1]
                                # Ensure it contains the domain (not just localhost)
                                if ($dcFqdn -like "*.$domainServer*" -or $dcFqdn -like "*$domainServer") {
                                    $domainController = $dcFqdn
                                    Write-ModuleLog -ModuleName "GPO" -Message "Auto-discovered DC via DNS Server line: $domainController" -Level "SUCCESS"
                                }
                            }
                            # Fallback: Look for any FQDN matching the domain pattern
                            if (-not $domainController -and $nslookupOutput -match '(\S+\.' + [regex]::Escape($domainServer) + '\S*)') {
                                $domainController = $matches[1].TrimEnd('.')
                                Write-ModuleLog -ModuleName "GPO" -Message "Auto-discovered DC via pattern matching: $domainController" -Level "SUCCESS"
                            }
                        } catch {
                            Write-ModuleLog -ModuleName "GPO" -Message "DNS SRV lookup failed: $($_.Exception.Message)" -Level "DEBUG"
                        }
                    }

                    # Method 2: Try nltest (built-in tool, works on domain-joined machines)
                    if (-not $domainController) {
                        try {
                            Write-ModuleLog -ModuleName "GPO" -Message "Attempting nltest DC discovery..." -Level "DEBUG"
                            $nltestOutput = nltest /dsgetdc:$domainServer /force 2>&1 | Out-String

                            # Parse nltest output for DC name
                            if ($nltestOutput -match 'DC:\s*\\\\(\S+)') {
                                $domainController = $matches[1]
                                Write-ModuleLog -ModuleName "GPO" -Message "Auto-discovered DC using nltest: $domainController" -Level "SUCCESS"
                            }
                        } catch {
                            Write-ModuleLog -ModuleName "GPO" -Message "nltest failed: $($_.Exception.Message)" -Level "DEBUG"
                        }
                    }

                    # Method 3: Try Get-ADDomainController (requires AD module)
                    if (-not $domainController) {
                        try {
                            Write-ModuleLog -ModuleName "GPO" -Message "Attempting Get-ADDomainController..." -Level "DEBUG"
                            $dc = Get-ADDomainController -Discover -DomainName $domainServer -ErrorAction Stop | Select-Object -First 1
                            if ($dc) {
                                $domainController = $dc.HostName
                                Write-ModuleLog -ModuleName "GPO" -Message "Auto-discovered DC using Get-ADDomainController: $domainController" -Level "SUCCESS"
                            }
                        } catch {
                            Write-ModuleLog -ModuleName "GPO" -Message "Get-ADDomainController failed: $($_.Exception.Message)" -Level "DEBUG"
                        }
                    }

                    # Method 4: .NET System.DirectoryServices (last resort)
                    if (-not $domainController) {
                        try {
                            Write-ModuleLog -ModuleName "GPO" -Message "Attempting .NET DirectoryServices DC discovery..." -Level "DEBUG"
                            $dcInfo = [System.DirectoryServices.ActiveDirectory.Domain]::GetDomain((New-Object System.DirectoryServices.ActiveDirectory.DirectoryContext('Domain', $domainServer)))
                            $domainController = $dcInfo.PdcRoleOwner.Name
                            Write-ModuleLog -ModuleName "GPO" -Message "Auto-discovered DC using .NET DirectoryServices: $domainController" -Level "SUCCESS"
                        } catch {
                            Write-ModuleLog -ModuleName "GPO" -Message ".NET DirectoryServices failed: $($_.Exception.Message)" -Level "DEBUG"
                        }
                    }

                    if (-not $domainController) {
                        Write-ModuleLog -ModuleName "GPO" -Message "Failed to auto-discover DC after trying all methods" -Level "ERROR"
                        Write-ModuleLog -ModuleName "GPO" -Message "Ensure DNS can resolve domain: $domainServer" -Level "INFO"
                    }
                } catch {
                    Write-ModuleLog -ModuleName "GPO" -Message "Error during DC discovery: $($_.Exception.Message)" -Level "WARN"
                }
            }
        } else {
            Write-ModuleLog -ModuleName "GPO" -Message "Using integrated Windows authentication" -Level "INFO"
        }

        # Discover GPOs
        try {
            Write-ModuleLog -ModuleName "GPO" -Message "Discovering Group Policy Objects..." -Level "INFO"

            # NOTE: GroupPolicy cmdlets don't support -Credential parameter (Microsoft limitation)
            # Strategy: Try integrated auth first, fallback to Invoke-Command if it fails

            $gpos = $null
            $usedRemoting = $false

            # OPTION 1: Try using integrated Windows authentication with -Domain
            if ($domainServer) {
                Write-ModuleLog -ModuleName "GPO" -Message "Attempting integrated authentication to domain: $domainServer" -Level "INFO"
            }

            try {
                $getGPOParams = @{ All = $true; ErrorAction = 'Stop' }
                if ($domainServer) { $getGPOParams['Domain'] = $domainServer }
                $gpos = Get-GPO @getGPOParams
                Write-ModuleLog -ModuleName "GPO" -Message "Successfully retrieved GPOs using integrated authentication" -Level "SUCCESS"
            }
            catch {
                $integratedAuthError = $_.Exception.Message

                # OPTION 2: Fallback to Invoke-Command with alternate credentials
                if ($credential -and $domainController) {
                    Write-ModuleLog -ModuleName "GPO" -Message "Integrated auth failed: $integratedAuthError" -Level "WARN"
                    Write-ModuleLog -ModuleName "GPO" -Message "Attempting PSRemoting to domain controller: $domainController" -Level "INFO"

                    try {
                        # Connect to domain controller via PSRemoting with domain credentials
                        $gpos = Invoke-Command -ComputerName $domainController -Credential $credential -ErrorAction Stop -ScriptBlock {
                            param($domain)
                            Import-Module GroupPolicy -ErrorAction Stop
                            Get-GPO -All -Domain $domain -ErrorAction Stop
                        } -ArgumentList $domainServer

                        $usedRemoting = $true
                        Write-ModuleLog -ModuleName "GPO" -Message "Successfully retrieved GPOs via PSRemoting to domain controller" -Level "SUCCESS"
                    }
                    catch {
                        Write-ModuleLog -ModuleName "GPO" -Message "PSRemoting to DC failed: $($_.Exception.Message)" -Level "ERROR"
                        Write-ModuleLog -ModuleName "GPO" -Message "HINT: Ensure PSRemoting is enabled on the domain controller and credentials are correct" -Level "INFO"
                        throw
                    }
                } elseif ($credential -and $domainServer) {
                    # Fallback to localhost if no DC available
                    Write-ModuleLog -ModuleName "GPO" -Message "Integrated auth failed: $integratedAuthError" -Level "WARN"
                    Write-ModuleLog -ModuleName "GPO" -Message "No domain controller configured, attempting PSRemoting to localhost..." -Level "WARN"

                    try {
                        $gpos = Invoke-Command -ComputerName $env:COMPUTERNAME -Credential $credential -ErrorAction Stop -ScriptBlock {
                            param($domain)
                            Import-Module GroupPolicy -ErrorAction Stop
                            Get-GPO -All -Domain $domain -ErrorAction Stop
                        } -ArgumentList $domainServer

                        $usedRemoting = $true
                        Write-ModuleLog -ModuleName "GPO" -Message "Successfully retrieved GPOs using PSRemoting to localhost" -Level "SUCCESS"
                    }
                    catch {
                        Write-ModuleLog -ModuleName "GPO" -Message "PSRemoting to localhost failed: $($_.Exception.Message)" -Level "ERROR"
                        Write-ModuleLog -ModuleName "GPO" -Message "HINT: Configure DomainController in profile settings for better results" -Level "INFO"
                        throw
                    }
                } else {
                    # No credentials available for fallback
                    Write-ModuleLog -ModuleName "GPO" -Message "Integrated authentication failed and no domain credentials available" -Level "ERROR"
                    throw
                }
            }

            if (-not $gpos) {
                throw "Failed to retrieve GPOs using either integrated auth or PSRemoting"
            }

            Write-ModuleLog -ModuleName "GPO" -Message "Found $($gpos.Count) GPOs" -Level "SUCCESS"

            foreach ($gpo in $gpos) {
                try {
                    # Get GPO report for detailed settings
                    # NOTE: Get-GPOReport doesn't support -Credential
                    $reportParams = @{ Guid = $gpo.Id; ReportType = 'Xml'; ErrorAction = 'SilentlyContinue' }
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
                        # NOTE: Get-GPPermission doesn't support -Credential
                        $permParams = @{ Guid = $gpo.Id; ErrorAction = 'SilentlyContinue' }
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
                    Write-ModuleLog -ModuleName "GPO" -Message "Failed to export ${fileName}: $($_.Exception.Message)" -Level "ERROR"
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

        # Authentication method used
        if ($usedRemoting) {
            $Result.Metadata["AuthenticationMethod"] = "PSRemoting with DomainCredentials"
        } elseif ($credential) {
            $Result.Metadata["AuthenticationMethod"] = "IntegratedAuth (credentials provided but not needed)"
        } else {
            $Result.Metadata["AuthenticationMethod"] = "IntegratedAuth"
        }

        if ($domainServer) {
            $Result.Metadata["DomainName"] = $domainServer
        }
    }

    return Start-DiscoveryModule `
        -ModuleName "GPO" `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @() `
        -DiscoveryScript $discoveryScript
}

Export-ModuleMember -Function Invoke-GPODiscovery
