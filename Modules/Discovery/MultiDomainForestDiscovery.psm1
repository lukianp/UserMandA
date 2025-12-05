# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Multi-Domain Forest Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Extends Active Directory discovery to support multiple domains and forests.
    Discovers trust relationships, cross-forest configurations, global catalogs,
    and provides comprehensive multi-domain environment assessment for complex
    M&A scenarios involving multiple AD infrastructures.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, ActiveDirectory module, appropriate permissions across domains/forests
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Core\ClassDefinitions.psm1") -Force

function Write-MultiDomainLog {
    <#
    .SYNOPSIS
        Writes log entries specific to multi-domain discovery.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[MultiDomainForest] $Message" -Level $Level -Component "MultiDomainForestDiscovery" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [MultiDomainForest] $Message" -ForegroundColor $color
    }
}

function Invoke-MultiDomainForestDiscovery {
    <#
    .SYNOPSIS
        Main multi-domain forest discovery function.
    
    .DESCRIPTION
        Discovers and maps multiple Active Directory domains and forests including
        trust relationships, replication topology, and cross-domain configurations.
    
    .PARAMETER Configuration
        Discovery configuration including target domains and forests.
    
    .PARAMETER Context
        Execution context with paths and session information.
    
    .PARAMETER SessionId
        Unique session identifier for tracking.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-MultiDomainLog -Level "HEADER" -Message "Starting Multi-Domain Forest Discovery (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object using standardized DiscoveryResult class
    $result = [DiscoveryResult]::new('MultiDomainForestDiscovery')

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-MultiDomainLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context

        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
        }

        # Enhanced ActiveDirectory module check with installation guidance
        if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) {
            Write-MultiDomainLog -Level "ERROR" -Message "ActiveDirectory PowerShell module is not available" -Context $Context

            # Provide helpful installation guidance
            $errorMessage = @"
ActiveDirectory PowerShell module is required but not available.
To install the required RSAT tools:

For Windows 10:
1. Go to Settings > Apps > Optional Features > Add a feature
2. Search for "RSAT: Active Directory Domain Services and Lightweight Directory Services Tools"
3. Install the feature
4. Restart PowerShell and try again

For Windows 11:
1. Go to Settings > Apps > Optional Features > View features
2. Search for "RSAT: Active Directory Domain Services Tools"
3. Check the box and click Install
4. Wait for installation to complete
5. Restart PowerShell and try again

Alternative (Command Line):
- Run PowerShell as Administrator
- Execute: dism /online /Get-CapabilityInfo /CapabilityName:Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0
- Execute: dism /online /Add-Capability /CapabilityName:Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0

If RSAT is not available in this Windows build, consider using a domain-joined machine or manual discovery methods.
"@

            $result.AddError($errorMessage, $null, $null)
            Write-MultiDomainLog -Level "WARN" -Message "Discovery cannot proceed without ActiveDirectory module. See error details above." -Context $Context
            return $result
        }

        # Try to import ActiveDirectory module
        try {
            Import-Module ActiveDirectory -ErrorAction Stop
            Write-MultiDomainLog -Level "SUCCESS" -Message "ActiveDirectory module loaded successfully" -Context $Context
        } catch {
            $importErrorMessage = "Failed to import ActiveDirectory module: $($_.Exception.Message). Ensure you have appropriate permissions and the RSAT tools are properly installed."
            $result.AddError($importErrorMessage, $_.Exception, $null)
            Write-MultiDomainLog -Level "ERROR" -Message $importErrorMessage -Context $Context
            return $result
        }

        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Current Forest
        try {
            Write-MultiDomainLog -Level "INFO" -Message "Discovering current forest topology..." -Context $Context
            $forestData = Get-ForestTopology -Configuration $Configuration -SessionId $SessionId
            if ($forestData.Count -gt 0) {
                $forestData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Forest' -Force }
                $null = $allDiscoveredData.AddRange($forestData)
                $result.Metadata["ForestCount"] = ($forestData | Group-Object ForestName).Count
                $result.Metadata["RecordCount"] = $result.Metadata["RecordCount"] + ($forestData | Group-Object ForestName).Count
            }
            Write-MultiDomainLog -Level "SUCCESS" -Message "Discovered $($forestData.Count) forest objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover forest topology: $($_.Exception.Message)", @{Section="Forest"})
        }
        
        # Discover All Domains in Forest
        try {
            Write-MultiDomainLog -Level "INFO" -Message "Discovering domains in forest..." -Context $Context
            $domainData = Get-MultiDomainTopology -Configuration $Configuration -SessionId $SessionId
            if ($domainData.Count -gt 0) {
                $domainData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Domain' -Force }
                $null = $allDiscoveredData.AddRange($domainData)
                $result.Metadata["DomainCount"] = ($domainData | Group-Object DomainName).Count
                $currentCount = if ($result.Metadata.ContainsKey("RecordCount")) { $result.Metadata["RecordCount"] } else { 0 }
                $result.Metadata["RecordCount"] = $currentCount + ($domainData | Group-Object DomainName).Count
            }
            Write-MultiDomainLog -Level "SUCCESS" -Message "Discovered $($domainData.Count) domain objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover domain topology: $($_.Exception.Message)", @{Section="Domains"})
        }
        
        # Discover Trust Relationships
        try {
            Write-MultiDomainLog -Level "INFO" -Message "Discovering trust relationships..." -Context $Context
            $trustData = Get-TrustRelationships -Configuration $Configuration -SessionId $SessionId
            if ($trustData.Count -gt 0) {
                $trustData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Trust' -Force }
                $null = $allDiscoveredData.AddRange($trustData)
                $result.Metadata["TrustCount"] = $trustData.Count
            }
            Write-MultiDomainLog -Level "SUCCESS" -Message "Discovered $($trustData.Count) trust relationships" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover trust relationships: $($_.Exception.Message)", @{Section="Trusts"})
        }
        
        # Discover Global Catalogs
        try {
            Write-MultiDomainLog -Level "INFO" -Message "Discovering global catalogs..." -Context $Context
            $gcData = Get-GlobalCatalogServers -Configuration $Configuration -SessionId $SessionId
            if ($gcData.Count -gt 0) {
                $gcData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'GlobalCatalog' -Force }
                $null = $allDiscoveredData.AddRange($gcData)
                $result.Metadata["GlobalCatalogCount"] = $gcData.Count
            }
            Write-MultiDomainLog -Level "SUCCESS" -Message "Discovered $($gcData.Count) global catalog servers" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover global catalogs: $($_.Exception.Message)", @{Section="GlobalCatalogs"})
        }
        
        # Discover Sites and Replication
        try {
            Write-MultiDomainLog -Level "INFO" -Message "Discovering sites and replication topology..." -Context $Context
            $siteData = Get-SiteReplicationTopology -Configuration $Configuration -SessionId $SessionId
            if ($siteData.Count -gt 0) {
                $siteData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Site' -Force }
                $null = $allDiscoveredData.AddRange($siteData)
                $result.Metadata["SiteCount"] = ($siteData | Where-Object { $_.ObjectType -eq 'Site' }).Count
                $result.Metadata["SiteLinkCount"] = ($siteData | Where-Object { $_.ObjectType -eq 'SiteLink' }).Count
            }
            Write-MultiDomainLog -Level "SUCCESS" -Message "Discovered $($siteData.Count) site and replication objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover sites and replication: $($_.Exception.Message)", @{Section="Sites"})
        }
        
        # Discover Cross-Domain Objects (if specified)
        if ($Configuration.multiDomain -and $Configuration.multiDomain.discoverCrossDomainObjects -eq $true) {
            try {
                Write-MultiDomainLog -Level "INFO" -Message "Discovering cross-domain objects..." -Context $Context
                $crossDomainData = Get-CrossDomainObjects -Configuration $Configuration -SessionId $SessionId
                if ($crossDomainData.Count -gt 0) {
                    $crossDomainData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'CrossDomain' -Force }
                    $null = $allDiscoveredData.AddRange($crossDomainData)
                    $result.Metadata["CrossDomainObjectCount"] = $crossDomainData.Count
                }
                Write-MultiDomainLog -Level "SUCCESS" -Message "Discovered $($crossDomainData.Count) cross-domain objects" -Context $Context
            } catch {
                $result.AddWarning("Failed to discover cross-domain objects: $($_.Exception.Message)", @{Section="CrossDomain"})
            }
        }

        # Generate Multi-Domain Assessment
        try {
            Write-MultiDomainLog -Level "INFO" -Message "Generating multi-domain assessment..." -Context $Context
            $assessment = Get-MultiDomainAssessment -DiscoveredData $allDiscoveredData -SessionId $SessionId
            if ($assessment.Count -gt 0) {
                $assessment | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Assessment' -Force }
                $null = $allDiscoveredData.AddRange($assessment)
                $result.Metadata["AssessmentCount"] = $assessment.Count
            }
            Write-MultiDomainLog -Level "SUCCESS" -Message "Generated multi-domain assessment" -Context $Context
        } catch {
            $result.AddWarning("Failed to generate assessment: $($_.Exception.Message)", @{Section="Assessment"})
        }

        # Export data to CSV files
        if ($allDiscoveredData.Count -gt 0) {
            Write-MultiDomainLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "MultiDomain_$dataType.csv"
                $filePath = Join-Path $outputPath $fileName
                
                # Add metadata to each record
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "MultiDomainForestDiscovery" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                # Export to CSV
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-MultiDomainLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-MultiDomainLog -Level "WARN" -Message "No multi-domain data discovered to export" -Context $Context
        }

        $result.Data = $allDiscoveredData
        $result.Metadata["RecordCount"] = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
        $result.Metadata["SessionId"] = $SessionId

     } catch {
        Write-MultiDomainLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during multi-domain discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-MultiDomainLog -Level "HEADER" -Message "Multi-domain discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.Metadata['RecordCount'])." -Context $Context
    }

    return $result
}

function Get-ForestTopology {
    <#
    .SYNOPSIS
        Discovers forest-level topology and configuration.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $forestData = @()
    
    try {
        # Get current forest
        $currentForest = Get-ADForest -ErrorAction Stop
        
        # Forest-level information
        $forestData += [PSCustomObject]@{
            ObjectType = "Forest"
            ForestName = $currentForest.Name
            RootDomain = $currentForest.RootDomain
            ForestMode = $currentForest.ForestMode
            DomainNamingMaster = $currentForest.DomainNamingMaster
            SchemaMaster = $currentForest.SchemaMaster
            GlobalCatalogs = ($currentForest.GlobalCatalogs -join ';')
            Sites = ($currentForest.Sites -join ';')
            Domains = ($currentForest.Domains -join ';')
            DomainCount = $currentForest.Domains.Count
            UPNSuffixes = ($currentForest.UPNSuffixes -join ';')
            SPNSuffixes = ($currentForest.SPNSuffixes -join ';')
            ForestDnsZones = ($currentForest.PartitionsContainer -like "*ForestDnsZones*")
            DomainDnsZones = ($currentForest.PartitionsContainer -like "*DomainDnsZones*")
            PartitionsContainer = $currentForest.PartitionsContainer
            ConfigurationNamingContext = $currentForest.ConfigurationNamingContext
            SchemaNamingContext = $currentForest.SchemaNamingContext
            SessionId = $SessionId
        }
        
        # If configuration specifies additional forests to discover
        if ($Configuration.multiDomain -and $Configuration.multiDomain.additionalForests) {
            foreach ($forestName in $Configuration.multiDomain.additionalForests) {
                try {
                    Write-MultiDomainLog -Level "INFO" -Message "Discovering external forest: $forestName"
                    
                    # Try to connect to the external forest
                    $externalForest = Get-ADForest -Identity $forestName -ErrorAction Stop
                    
                    $forestData += [PSCustomObject]@{
                        ObjectType = "ExternalForest"
                        ForestName = $externalForest.Name
                        RootDomain = $externalForest.RootDomain
                        ForestMode = $externalForest.ForestMode
                        DomainNamingMaster = $externalForest.DomainNamingMaster
                        SchemaMaster = $externalForest.SchemaMaster
                        GlobalCatalogs = ($externalForest.GlobalCatalogs -join ';')
                        Sites = ($externalForest.Sites -join ';')
                        Domains = ($externalForest.Domains -join ';')
                        DomainCount = $externalForest.Domains.Count
                        UPNSuffixes = ($externalForest.UPNSuffixes -join ';')
                        SPNSuffixes = ($externalForest.SPNSuffixes -join ';')
                        PartitionsContainer = $externalForest.PartitionsContainer
                        ConfigurationNamingContext = $externalForest.ConfigurationNamingContext
                        SchemaNamingContext = $externalForest.SchemaNamingContext
                        IsExternal = $true
                        SessionId = $SessionId
                    }
                    
                } catch {
                    Write-MultiDomainLog -Level "WARN" -Message "Failed to connect to external forest ${forestName}: $($_.Exception.Message)"

                    # Add placeholder entry for inaccessible forest
                    $forestData += [PSCustomObject]@{
                        ObjectType = "ExternalForest"
                        ForestName = $forestName
                        Status = "Inaccessible"
                        Error = $_.Exception.Message
                        IsExternal = $true
                        SessionId = $SessionId
                    }
                }
            }
        }
        
    } catch {
        Write-MultiDomainLog -Level "ERROR" -Message "Failed to discover forest topology: $($_.Exception.Message)"
    }
    
    return $forestData
}

function Get-MultiDomainTopology {
    <#
    .SYNOPSIS
        Discovers all domains in the current forest and any accessible external domains.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $domainData = @()
    
    try {
        # Get all domains in current forest
        $currentForest = Get-ADForest -ErrorAction Stop
        
        foreach ($domainName in $currentForest.Domains) {
            try {
                Write-MultiDomainLog -Level "DEBUG" -Message "Discovering domain: $domainName"
                
                $domain = Get-ADDomain -Identity $domainName -ErrorAction Stop
                $domainControllers = Get-ADDomainController -Domain $domainName -Filter * -ErrorAction SilentlyContinue
                
                $domainData += [PSCustomObject]@{
                    ObjectType = "Domain"
                    DomainName = $domain.DNSRoot
                    NetBIOSName = $domain.NetBIOSName
                    DomainSID = $domain.DomainSID.Value
                    ForestName = $domain.Forest
                    ParentDomain = $domain.ParentDomain
                    ChildDomains = ($domain.ChildDomains -join ';')
                    DomainMode = $domain.DomainMode
                    DistinguishedName = $domain.DistinguishedName
                    PDCEmulator = $domain.PDCEmulator
                    RIDMaster = $domain.RIDMaster
                    InfrastructureMaster = $domain.InfrastructureMaster
                    DomainControllerCount = $domainControllers.Count
                    ReadOnlyDCCount = ($domainControllers | Where-Object { $_.IsReadOnly -eq $true }).Count
                    GlobalCatalogCount = ($domainControllers | Where-Object { $_.IsGlobalCatalog -eq $true }).Count
                    DomainControllers = ($domainControllers.Name -join ';')
                    DefaultPasswordPolicy = @{
                        MinPasswordLength = $domain.MinPasswordLength
                        PasswordHistoryCount = $domain.PasswordHistoryCount
                        LockoutDuration = $domain.LockoutDuration.TotalMinutes
                        LockoutObservationWindow = $domain.LockoutObservationWindow.TotalMinutes
                        LockoutThreshold = $domain.LockoutThreshold
                        MaxPasswordAge = $domain.MaxPasswordAge.TotalDays
                        MinPasswordAge = $domain.MinPasswordAge.TotalDays
                    } | ConvertTo-Json -Compress
                    LastLogonReplicationInterval = $domain.LastLogonReplicationInterval
                    LinkedGroupPolicyObjects = ($domain.LinkedGroupPolicyObjects -join ';')
                    ComputersContainer = $domain.ComputersContainer
                    UsersContainer = $domain.UsersContainer
                    SystemsContainer = $domain.SystemsContainer
                    DeletedObjectsContainer = $domain.DeletedObjectsContainer
                    ForeignSecurityPrincipalsContainer = $domain.ForeignSecurityPrincipalsContainer
                    IsCurrentDomain = ($domain.DNSRoot -eq (Get-ADDomain).DNSRoot)
                    SessionId = $SessionId
                }
                
                # Add domain controller details
                foreach ($dc in $domainControllers) {
                    $domainData += [PSCustomObject]@{
                        ObjectType = "DomainController"
                        DomainName = $domainName
                        DCName = $dc.Name
                        HostName = $dc.HostName
                        IPv4Address = $dc.IPv4Address
                        IPv6Address = $dc.IPv6Address
                        Site = $dc.Site
                        IsGlobalCatalog = $dc.IsGlobalCatalog
                        IsReadOnly = $dc.IsReadOnly
                        Enabled = $dc.Enabled
                        OperatingSystem = $dc.OperatingSystem
                        OperatingSystemVersion = $dc.OperatingSystemVersion
                        OperatingSystemServicePack = $dc.OperatingSystemServicePack
                        LdapPort = $dc.LdapPort
                        SslPort = $dc.SslPort
                        Roles = ($dc.OperationMasterRoles -join ';')
                        Partitions = ($dc.Partitions -join ';')
                        SessionId = $SessionId
                    }
                }
                
            } catch {
                Write-MultiDomainLog -Level "WARN" -Message "Failed to discover domain ${domainName}: $($_.Exception.Message)"
                
                # Add placeholder for inaccessible domain
                $domainData += [PSCustomObject]@{
                    ObjectType = "Domain"
                    DomainName = $domainName
                    Status = "Inaccessible"
                    Error = $_.Exception.Message
                    SessionId = $SessionId
                }
            }
        }
        
        # Discover external domains if specified
        if ($Configuration.multiDomain -and $Configuration.multiDomain.externalDomains) {
            foreach ($externalDomain in $Configuration.multiDomain.externalDomains) {
                try {
                    Write-MultiDomainLog -Level "INFO" -Message "Discovering external domain: $externalDomain"
                    
                    $domain = Get-ADDomain -Identity $externalDomain -ErrorAction Stop
                    
                    $domainData += [PSCustomObject]@{
                        ObjectType = "ExternalDomain"
                        DomainName = $domain.DNSRoot
                        NetBIOSName = $domain.NetBIOSName
                        DomainSID = $domain.DomainSID.Value
                        ForestName = $domain.Forest
                        ParentDomain = $domain.ParentDomain
                        DomainMode = $domain.DomainMode
                        DistinguishedName = $domain.DistinguishedName
                        PDCEmulator = $domain.PDCEmulator
                        IsExternal = $true
                        SessionId = $SessionId
                    }
                    
                } catch {
                    Write-MultiDomainLog -Level "WARN" -Message "Failed to discover external domain ${externalDomain}: $($_.Exception.Message)"
                    
                    $domainData += [PSCustomObject]@{
                        ObjectType = "ExternalDomain"
                        DomainName = $externalDomain
                        Status = "Inaccessible"
                        Error = $_.Exception.Message
                        IsExternal = $true
                        SessionId = $SessionId
                    }
                }
            }
        }
        
    } catch {
        Write-MultiDomainLog -Level "ERROR" -Message "Failed to discover domain topology: $($_.Exception.Message)"
    }
    
    return $domainData
}

function Get-TrustRelationships {
    <#
    .SYNOPSIS
        Discovers trust relationships within and between forests.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $trustData = @()
    
    try {
        # Get all domains in current forest
        $currentForest = Get-ADForest -ErrorAction SilentlyContinue
        
        if ($currentForest) {
            foreach ($domainName in $currentForest.Domains) {
                try {
                    Write-MultiDomainLog -Level "DEBUG" -Message "Discovering trusts for domain: $domainName"
                    
                    # Get domain trusts
                    $trusts = Get-ADTrust -Filter * -Server $domainName -ErrorAction SilentlyContinue
                    
                    foreach ($trust in $trusts) {
                        $trustData += [PSCustomObject]@{
                            ObjectType = "Trust"
                            SourceDomain = $domainName
                            TargetDomain = $trust.Target
                            TrustType = $trust.TrustType
                            TrustDirection = $trust.Direction
                            TrustAttributes = $trust.TrustAttributes
                            SelectiveAuthentication = $trust.SelectiveAuthentication
                            SIDFilteringForestAware = $trust.SIDFilteringForestAware
                            SIDFilteringQuarantined = $trust.SIDFilteringQuarantined
                            DisallowTransivity = $trust.DisallowTransivity
                            UplevelOnly = $trust.UplevelOnly
                            UsesAESKeys = $trust.UsesAESKeys
                            UsesRC4Encryption = $trust.UsesRC4Encryption
                            Created = $trust.Created
                            Modified = $trust.Modified
                            DistinguishedName = $trust.DistinguishedName
                            IntraForest = $trust.IntraForest
                            IsTreeParent = $trust.IsTreeParent
                            IsTreeRoot = $trust.IsTreeRoot
                            SessionId = $SessionId
                        }
                    }
                    
                } catch {
                    Write-MultiDomainLog -Level "WARN" -Message "Failed to discover trusts for domain ${domainName}: $($_.Exception.Message)"
                }
            }
        }
        
        # If external forests/domains are specified, try to discover their trusts too
        if ($Configuration.multiDomain) {
            $externalDomains = @()
            
            if ($Configuration.multiDomain.externalDomains) {
                $externalDomains += $Configuration.multiDomain.externalDomains
            }
            
            if ($Configuration.multiDomain.additionalForests) {
                foreach ($forestName in $Configuration.multiDomain.additionalForests) {
                    try {
                        $externalForest = Get-ADForest -Identity $forestName -ErrorAction SilentlyContinue
                        if ($externalForest) {
                            $externalDomains += $externalForest.Domains
                        }
                    } catch {
                        Write-MultiDomainLog -Level "DEBUG" -Message "Could not enumerate domains in external forest $forestName"
                    }
                }
            }
            
            foreach ($externalDomain in $externalDomains) {
                try {
                    Write-MultiDomainLog -Level "DEBUG" -Message "Discovering trusts for external domain: $externalDomain"
                    
                    $trusts = Get-ADTrust -Filter * -Server $externalDomain -ErrorAction SilentlyContinue
                    
                    foreach ($trust in $trusts) {
                        $trustData += [PSCustomObject]@{
                            ObjectType = "ExternalTrust"
                            SourceDomain = $externalDomain
                            TargetDomain = $trust.Target
                            TrustType = $trust.TrustType
                            TrustDirection = $trust.Direction
                            TrustAttributes = $trust.TrustAttributes
                            SelectiveAuthentication = $trust.SelectiveAuthentication
                            Created = $trust.Created
                            Modified = $trust.Modified
                            IsExternal = $true
                            SessionId = $SessionId
                        }
                    }
                    
                } catch {
                    Write-MultiDomainLog -Level "DEBUG" -Message "Could not discover trusts for external domain $externalDomain"
                }
            }
        }
        
    } catch {
        Write-MultiDomainLog -Level "ERROR" -Message "Failed to discover trust relationships: $($_.Exception.Message)"
    }
    
    return $trustData
}

function Get-GlobalCatalogServers {
    <#
    .SYNOPSIS
        Discovers global catalog servers across domains and forests.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $gcData = @()
    
    try {
        # Get current forest GCs
        $currentForest = Get-ADForest -ErrorAction SilentlyContinue
        
        if ($currentForest) {
            foreach ($gcName in $currentForest.GlobalCatalogs) {
                try {
                    $gc = Get-ADDomainController -Identity $gcName -ErrorAction SilentlyContinue
                    
                    if ($gc) {
                        $gcData += [PSCustomObject]@{
                            ObjectType = "GlobalCatalog"
                            ServerName = $gc.Name
                            HostName = $gc.HostName
                            Domain = $gc.Domain
                            Forest = $gc.Forest
                            Site = $gc.Site
                            IPv4Address = $gc.IPv4Address
                            IPv6Address = $gc.IPv6Address
                            IsGlobalCatalog = $gc.IsGlobalCatalog
                            IsReadOnly = $gc.IsReadOnly
                            Enabled = $gc.Enabled
                            OperatingSystem = $gc.OperatingSystem
                            OperatingSystemVersion = $gc.OperatingSystemVersion
                            LdapPort = $gc.LdapPort
                            SslPort = $gc.SslPort
                            GlobalCatalogPort = 3268
                            GlobalCatalogSslPort = 3269
                            Roles = ($gc.OperationMasterRoles -join ';')
                            Partitions = ($gc.Partitions -join ';')
                            SessionId = $SessionId
                        }
                        
                        # Test GC connectivity
                        try {
                            $gcTest = Test-NetConnection -ComputerName $gc.HostName -Port 3268 -ErrorAction SilentlyContinue
                            $gcData[-1] | Add-Member -NotePropertyName 'GCPortAccessible' -NotePropertyValue $gcTest.TcpTestSucceeded
                            
                            $gcSslTest = Test-NetConnection -ComputerName $gc.HostName -Port 3269 -ErrorAction SilentlyContinue
                            $gcData[-1] | Add-Member -NotePropertyName 'GCSslPortAccessible' -NotePropertyValue $gcSslTest.TcpTestSucceeded
                        } catch {
                            # Network connectivity test failed
                            $gcData[-1] | Add-Member -NotePropertyName 'GCPortAccessible' -NotePropertyValue $null
                            $gcData[-1] | Add-Member -NotePropertyName 'GCSslPortAccessible' -NotePropertyValue $null
                        }
                    }
                    
                } catch {
                    Write-MultiDomainLog -Level "WARN" -Message "Failed to get details for GC ${gcName}: $($_.Exception.Message)"
                    
                    # Add basic entry for inaccessible GC
                    $gcData += [PSCustomObject]@{
                        ObjectType = "GlobalCatalog"
                        ServerName = $gcName
                        Status = "Inaccessible"
                        Error = $_.Exception.Message
                        SessionId = $SessionId
                    }
                }
            }
        }
        
        # Try to discover GCs in external forests
        if ($Configuration.multiDomain -and $Configuration.multiDomain.additionalForests) {
            foreach ($forestName in $Configuration.multiDomain.additionalForests) {
                try {
                    $externalForest = Get-ADForest -Identity $forestName -ErrorAction SilentlyContinue
                    
                    if ($externalForest) {
                        foreach ($gcName in $externalForest.GlobalCatalogs) {
                            try {
                                $gc = Get-ADDomainController -Identity $gcName -Server $forestName -ErrorAction SilentlyContinue
                                
                                if ($gc) {
                                    $gcData += [PSCustomObject]@{
                                        ObjectType = "ExternalGlobalCatalog"
                                        ServerName = $gc.Name
                                        HostName = $gc.HostName
                                        Domain = $gc.Domain
                                        Forest = $gc.Forest
                                        Site = $gc.Site
                                        IPv4Address = $gc.IPv4Address
                                        IsGlobalCatalog = $gc.IsGlobalCatalog
                                        IsReadOnly = $gc.IsReadOnly
                                        Enabled = $gc.Enabled
                                        OperatingSystem = $gc.OperatingSystem
                                        IsExternal = $true
                                        SessionId = $SessionId
                                    }
                                }
                                
                            } catch {
                                Write-MultiDomainLog -Level "DEBUG" -Message "Could not get details for external GC $gcName in forest $forestName"
                            }
                        }
                    }
                    
                } catch {
                    Write-MultiDomainLog -Level "DEBUG" -Message "Could not discover GCs in external forest $forestName"
                }
            }
        }
        
    } catch {
        Write-MultiDomainLog -Level "ERROR" -Message "Failed to discover global catalog servers: $($_.Exception.Message)"
    }
    
    return $gcData
}

function Get-SiteReplicationTopology {
    <#
    .SYNOPSIS
        Discovers Active Directory sites and replication topology.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $siteData = @()
    
    try {
        # Get all sites
        $sites = Get-ADReplicationSite -Filter * -ErrorAction SilentlyContinue
        
        foreach ($site in $sites) {
            $siteData += [PSCustomObject]@{
                ObjectType = "Site"
                SiteName = $site.Name
                Description = $site.Description
                Location = $site.Location
                ManagedBy = $site.ManagedBy
                DistinguishedName = $site.DistinguishedName
                Created = $site.Created
                Modified = $site.Modified
                ObjectGUID = $site.ObjectGUID
                SessionId = $SessionId
            }
            
            # Get subnets for this site
            try {
                $subnets = Get-ADReplicationSubnet -Filter "Site -eq '$($site.DistinguishedName)'" -ErrorAction SilentlyContinue
                
                foreach ($subnet in $subnets) {
                    $siteData += [PSCustomObject]@{
                        ObjectType = "Subnet"
                        SiteName = $site.Name
                        SubnetName = $subnet.Name
                        Description = $subnet.Description
                        Location = $subnet.Location
                        Site = $subnet.Site
                        DistinguishedName = $subnet.DistinguishedName
                        Created = $subnet.Created
                        Modified = $subnet.Modified
                        SessionId = $SessionId
                    }
                }
            } catch {
                Write-MultiDomainLog -Level "DEBUG" -Message "Could not get subnets for site $($site.Name)"
            }
        }
        
        # Get site links
        try {
            $siteLinks = Get-ADReplicationSiteLink -Filter * -ErrorAction SilentlyContinue
            
            foreach ($siteLink in $siteLinks) {
                $siteData += [PSCustomObject]@{
                    ObjectType = "SiteLink"
                    SiteLinkName = $siteLink.Name
                    Description = $siteLink.Description
                    Cost = $siteLink.Cost
                    ReplicationFrequencyInMinutes = $siteLink.ReplicationFrequencyInMinutes
                    InterSiteTransportProtocol = $siteLink.InterSiteTransportProtocol
                    SitesIncluded = ($siteLink.SitesIncluded -join ';')
                    ReplInterval = $siteLink.ReplInterval
                    Schedule = if ($siteLink.Schedule) { $siteLink.Schedule.ToString() } else { $null }
                    DistinguishedName = $siteLink.DistinguishedName
                    Created = $siteLink.Created
                    Modified = $siteLink.Modified
                    SessionId = $SessionId
                }
            }
        } catch {
            Write-MultiDomainLog -Level "WARN" -Message "Failed to discover site links: $($_.Exception.Message)"
        }
        
        # Get replication connections
        try {
            $connections = Get-ADReplicationConnection -Filter * -ErrorAction SilentlyContinue
            
            foreach ($connection in $connections) {
                $siteData += [PSCustomObject]@{
                    ObjectType = "ReplicationConnection"
                    ConnectionName = $connection.Name
                    FromServer = $connection.FromServer
                    ToServer = $connection.ToServer
                    AutoGenerated = $connection.AutoGenerated
                    Enabled = $connection.Enabled
                    GeneratedByKCC = $connection.GeneratedByKCC
                    ReplicatedNamingContexts = ($connection.ReplicatedNamingContexts -join ';')
                    ReplicationSchedule = if ($connection.ReplicationSchedule) { $connection.ReplicationSchedule.ToString() } else { $null }
                    TransportType = $connection.TransportType
                    DistinguishedName = $connection.DistinguishedName
                    Created = $connection.Created
                    Modified = $connection.Modified
                    SessionId = $SessionId
                }
            }
        } catch {
            Write-MultiDomainLog -Level "WARN" -Message "Failed to discover replication connections: $($_.Exception.Message)"
        }
        
    } catch {
        Write-MultiDomainLog -Level "ERROR" -Message "Failed to discover site topology: $($_.Exception.Message)"
    }
    
    return $siteData
}

function Get-CrossDomainObjects {
    <#
    .SYNOPSIS
        Discovers objects that span multiple domains (like universal groups).
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $crossDomainData = @()
    
    try {
        # Get universal groups from GC
        $currentForest = Get-ADForest -ErrorAction SilentlyContinue
        
        if ($currentForest -and $currentForest.GlobalCatalogs.Count -gt 0) {
            $gcServer = $currentForest.GlobalCatalogs[0]
            
            try {
                # Get universal groups
                $universalGroups = Get-ADGroup -Filter "GroupScope -eq 'Universal'" -Server "$gcServer`:3268" -ErrorAction SilentlyContinue
                
                foreach ($group in $universalGroups) {
                    $members = Get-ADGroupMember -Identity $group -Server "$gcServer`:3268" -ErrorAction SilentlyContinue
                    
                    # Analyze cross-domain membership
                    $memberDomains = @()
                    foreach ($member in $members) {
                        if ($member.DistinguishedName -match 'DC=([^,]+)') {
                            $memberDomain = $matches[1]
                            if ($memberDomains -notcontains $memberDomain) {
                                $memberDomains += $memberDomain
                            }
                        }
                    }
                    
                    $crossDomainData += [PSCustomObject]@{
                        ObjectType = "UniversalGroup"
                        GroupName = $group.Name
                        GroupDomain = ($group.DistinguishedName -replace '^.+?DC=([^,]+).+$', '$1')
                        GroupScope = $group.GroupScope
                        GroupCategory = $group.GroupCategory
                        MemberCount = $members.Count
                        CrossDomainMembers = $memberDomains.Count -gt 1
                        MemberDomains = ($memberDomains -join ';')
                        MemberDomainCount = $memberDomains.Count
                        DistinguishedName = $group.DistinguishedName
                        Created = $group.Created
                        Modified = $group.Modified
                        SessionId = $SessionId
                    }
                }
                
                # Get domain local groups with cross-domain members
                foreach ($domainName in $currentForest.Domains) {
                    try {
                        $domainLocalGroups = Get-ADGroup -Filter "GroupScope -eq 'DomainLocal'" -Server $domainName -ErrorAction SilentlyContinue
                        
                        foreach ($group in $domainLocalGroups) {
                            $members = Get-ADGroupMember -Identity $group -Server $domainName -ErrorAction SilentlyContinue
                            
                            # Check for cross-domain members
                            $crossDomainMembers = @($members | Where-Object { 
                                $_.DistinguishedName -notlike "*DC=$($domainName.Split('.')[0])*" 
                            })
                            
                            if ($crossDomainMembers.Count -gt 0) {
                                $crossDomainData += [PSCustomObject]@{
                                    ObjectType = "DomainLocalGroupWithCrossDomainMembers"
                                    GroupName = $group.Name
                                    GroupDomain = $domainName
                                    GroupScope = $group.GroupScope
                                    GroupCategory = $group.GroupCategory
                                    TotalMemberCount = $members.Count
                                    CrossDomainMemberCount = $crossDomainMembers.Count
                                    DistinguishedName = $group.DistinguishedName
                                    SessionId = $SessionId
                                }
                            }
                        }
                    } catch {
                        Write-MultiDomainLog -Level "DEBUG" -Message "Could not analyze domain local groups in $domainName"
                    }
                }
                
            } catch {
                Write-MultiDomainLog -Level "WARN" -Message "Failed to query global catalog for cross-domain objects: $($_.Exception.Message)"
            }
        }
        
    } catch {
        Write-MultiDomainLog -Level "ERROR" -Message "Failed to discover cross-domain objects: $($_.Exception.Message)"
    }
    
    return $crossDomainData
}

function Get-MultiDomainAssessment {
    <#
    .SYNOPSIS
        Generates assessment of multi-domain environment complexity and risks.
    #>
    [CmdletBinding()]
    param(
        [array]$DiscoveredData,
        [string]$SessionId
    )
    
    $assessment = @()
    
    try {
        # Analyze forest structure
        $forests = @($DiscoveredData | Where-Object { $_.ObjectType -eq 'Forest' })
        $domains = @($DiscoveredData | Where-Object { $_.ObjectType -eq 'Domain' })
        $trusts = @($DiscoveredData | Where-Object { $_.ObjectType -eq 'Trust' })
        $globalCatalogs = @($DiscoveredData | Where-Object { $_.ObjectType -eq 'GlobalCatalog' })
        $sites = @($DiscoveredData | Where-Object { $_.ObjectType -eq 'Site' })
        
        # Overall complexity assessment
        $complexityScore = 0
        $maxComplexityScore = 100
        $complexityFactors = @()
        
        # Domain count factor
        $domainCount = $domains.Count
        if ($domainCount -eq 1) {
            $complexityScore += 20  # Single domain is simpler
        } elseif ($domainCount -le 5) {
            $complexityScore += 10  # Few domains
            $complexityFactors += "Multiple domains ($domainCount)"
        } else {
            $complexityFactors += "High domain count ($domainCount)"
            $complexityScore -= 10
        }
        
        # Forest count factor
        $forestCount = $forests.Count
        if ($forestCount -gt 1) {
            $complexityFactors += "Multiple forests ($forestCount)"
            $complexityScore -= 20
        } else {
            $complexityScore += 15
        }
        
        # Trust complexity
        $trustCount = $trusts.Count
        $externalTrusts = @($trusts | Where-Object { $_.ObjectType -eq 'ExternalTrust' }).Count
        
        if ($trustCount -eq 0) {
            $complexityScore += 10  # Simple if no trusts
        } elseif ($trustCount -le 3) {
            $complexityFactors += "Few trust relationships ($trustCount)"
        } else {
            $complexityFactors += "Many trust relationships ($trustCount)"
            $complexityScore -= 15
        }
        
        if ($externalTrusts -gt 0) {
            $complexityFactors += "External trust relationships ($externalTrusts)"
            $complexityScore -= 10
        }
        
        # Global catalog distribution
        $gcCount = $globalCatalogs.Count
        if ($gcCount -eq 0) {
            $complexityFactors += "No accessible global catalogs"
            $complexityScore -= 25
        } elseif ($gcCount -eq 1) {
            $complexityFactors += "Single global catalog (potential bottleneck)"
            $complexityScore -= 10
        } else {
            $complexityScore += 10
        }
        
        # Site complexity
        $siteCount = $sites.Count
        if ($siteCount -gt 5) {
            $complexityFactors += "Many AD sites ($siteCount)"
            $complexityScore -= 5
        } elseif ($siteCount -eq 1) {
            $complexityScore += 10  # Single site is simpler
        }
        
        # Determine complexity level
        $complexityLevel = "Unknown"
        $migrationImpact = "Unknown"
        
        if ($complexityScore -ge 60) {
            $complexityLevel = "Low"
            $migrationImpact = "Minimal additional complexity"
        } elseif ($complexityScore -ge 30) {
            $complexityLevel = "Medium"
            $migrationImpact = "Moderate migration planning required"
        } elseif ($complexityScore -ge 0) {
            $complexityLevel = "High"
            $migrationImpact = "Significant migration complexity"
        } else {
            $complexityLevel = "Very High"
            $migrationImpact = "Extensive planning and expertise required"
        }
        
        $assessment += [PSCustomObject]@{
            AssessmentType = "EnvironmentComplexity"
            ComplexityLevel = $complexityLevel
            ComplexityScore = [math]::Max(0, [math]::Min($maxComplexityScore, $complexityScore + 40)) # Normalize
            ForestCount = $forestCount
            DomainCount = $domainCount
            TrustCount = $trustCount
            ExternalTrustCount = $externalTrusts
            GlobalCatalogCount = $gcCount
            SiteCount = $siteCount
            ComplexityFactors = ($complexityFactors -join '; ')
            MigrationImpact = $migrationImpact
            Recommendations = @(
                "Map all trust relationships and dependencies"
                "Identify critical cross-domain resources"
                "Plan migration phases by domain priority"
                "Ensure global catalog availability during migration"
                "Document replication topology changes"
            ) -join '; '
            SessionId = $SessionId
        }
        
        # Trust relationship analysis
        if ($trusts.Count -gt 0) {
            $trustAnalysis = @()
            $bidirectionalTrusts = @($trusts | Where-Object { $_.TrustDirection -eq 'Bidirectional' }).Count
            $inboundTrusts = @($trusts | Where-Object { $_.TrustDirection -eq 'Inbound' }).Count
            $outboundTrusts = @($trusts | Where-Object { $_.TrustDirection -eq 'Outbound' }).Count
            
            $assessment += [PSCustomObject]@{
                AssessmentType = "TrustRelationshipAnalysis"
                TotalTrusts = $trusts.Count
                BidirectionalTrusts = $bidirectionalTrusts
                InboundTrusts = $inboundTrusts
                OutboundTrusts = $outboundTrusts
                ExternalTrusts = $externalTrusts
                TrustRiskLevel = if ($externalTrusts -gt 0) { "High" } elseif ($trusts.Count -gt 3) { "Medium" } else { "Low" }
                SecurityConsiderations = "Review trust relationships for security implications during migration"
                SessionId = $SessionId
            }
        }
        
        # Replication health assessment
        $siteLinks = @($DiscoveredData | Where-Object { $_.ObjectType -eq 'SiteLink' })
        $replicationConnections = @($DiscoveredData | Where-Object { $_.ObjectType -eq 'ReplicationConnection' })
        
        if ($sites.Count -gt 0) {
            $assessment += [PSCustomObject]@{
                AssessmentType = "ReplicationTopology"
                SiteCount = $sites.Count
                SiteLinkCount = $siteLinks.Count
                ReplicationConnectionCount = $replicationConnections.Count
                AverageReplicationFrequency = if ($siteLinks.Count -gt 0) { 
                    [math]::Round(($siteLinks | Measure-Object -Property ReplicationFrequencyInMinutes -Average).Average, 0) 
                } else { $null }
                ReplicationHealth = if ($replicationConnections.Count -gt 0) { "Connections present" } else { "No connections discovered" }
                MigrationConsiderations = "Monitor replication during migration to prevent data inconsistency"
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-MultiDomainLog -Level "ERROR" -Message "Failed to generate multi-domain assessment: $($_.Exception.Message)"
    }
    
    return $assessment
}

# Export functions
Export-ModuleMember -Function Invoke-MultiDomainForestDiscovery
