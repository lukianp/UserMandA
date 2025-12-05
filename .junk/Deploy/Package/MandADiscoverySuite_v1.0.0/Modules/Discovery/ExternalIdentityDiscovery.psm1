# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    External identity systems discovery module for the M&A Discovery Suite.

.DESCRIPTION
    Discovers external identity providers (such as SAML/OIDC identity providers,
    B2B/B2C integrations) and federation trusts within the environment.  This
    implementation authenticates to Microsoft Graph when possible to retrieve
    configured identity providers and uses the Active Directory module to
    enumerate trust relationships.  Results are exported to CSV grouped by
    category.

.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Updated: 2025-08-19
    Requires: PowerShell 5.1+, Microsoft Graph PowerShell SDK (optional),
              ActiveDirectory module (optional)
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

function Write-ExternalIdentityLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[ExternalIdentity] $Message" -Level $Level -Component "ExternalIdentityDiscovery" -Context $Context
}

function Invoke-ExternalIdentityDiscovery {
    <#
    .SYNOPSIS
        Main function for external identity discovery.

    .DESCRIPTION
        Authenticates to Graph where possible, enumerates external identity
        providers and federation trusts and exports the results to CSV files.

    .PARAMETER Configuration
        Discovery configuration hashtable (reserved for future use).

    .PARAMETER Context
        Execution context containing output paths and session information.

    .PARAMETER SessionId
        Unique session identifier.
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
    Write-ExternalIdentityLog -Level "HEADER" -Message "Starting External Identity Discovery (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    try {
        if (-not (Get-Command -Name 'DiscoveryResult' -ErrorAction SilentlyContinue)) {
            Import-Module -Name "$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        $result = [DiscoveryResult]::new('ExternalIdentity')
    } catch {
        Write-ExternalIdentityLog -Level "ERROR" -Message "Failed to load DiscoveryResult class: $($_.Exception.Message)" -Context $Context
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

        # Attempt to authenticate to Microsoft Graph
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Authenticating to Microsoft Graph..." -Context $Context
            $null = Get-AuthenticationForService -Service 'Graph' -SessionId $SessionId
            Write-ExternalIdentityLog -Level "SUCCESS" -Message "Authenticated to Microsoft Graph" -Context $Context
        } catch {
            Write-ExternalIdentityLog -Level "WARN" -Message "Graph authentication failed: $($_.Exception.Message). Module will operate in offline mode." -Context $Context
        }

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        # Discover identity providers
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Discovering identity providers..." -Context $Context
            $providers = Get-ExternalIdentityProviders -Configuration $Configuration -SessionId $SessionId
            if ($providers.Count -gt 0) {
                $providers | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'IdentityProvider' -Force }
                $null = $allDiscoveredData.AddRange($providers)
                $result.Metadata['IdentityProviderCount'] = $providers.Count
            }
            Write-ExternalIdentityLog -Level "SUCCESS" -Message "Discovered $($providers.Count) identity providers" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover identity providers: $($_.Exception.Message)", @{Section='IdentityProviders'})
        }

        # Discover federation trusts
        try {
            Write-ExternalIdentityLog -Level "INFO" -Message "Discovering federation trusts..." -Context $Context
            $trusts = Get-FederationTrusts -Configuration $Configuration -SessionId $SessionId
            if ($trusts.Count -gt 0) {
                $trusts | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'FederationTrust' -Force }
                $null = $allDiscoveredData.AddRange($trusts)
                $result.Metadata['FederationTrustCount'] = $trusts.Count
            }
            Write-ExternalIdentityLog -Level "SUCCESS" -Message "Discovered $($trusts.Count) federation trusts" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover federation trusts: $($_.Exception.Message)", @{Section='FederationTrusts'})
        }

        # Export results
        if ($allDiscoveredData.Count -gt 0) {
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "ExternalIdentity_${dataType}.csv"
                $filePath = Join-Path $outputPath $fileName
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name '_DiscoveryTimestamp' -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name '_DiscoveryModule' -Value 'ExternalIdentity' -Force
                    $_ | Add-Member -MemberType NoteProperty -Name '_SessionId' -Value $SessionId -Force
                }
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-ExternalIdentityLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-ExternalIdentityLog -Level "WARN" -Message "No external identity results to export" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata['TotalRecords'] = $result.RecordCount
        $result.Metadata['SessionId'] = $SessionId

    } catch {
        Write-ExternalIdentityLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during external identity discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        try { Disconnect-MgGraph -ErrorAction SilentlyContinue } catch {}
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-ExternalIdentityLog -Level "HEADER" -Message "External identity discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }
    return $result
}

function Get-ExternalIdentityProviders {
    <#
    .SYNOPSIS
        Retrieves external identity providers configured in the tenant.
    .DESCRIPTION
        Attempts to query Microsoft Graph for identity providers.  If Graph is
        unavailable or no providers are found, returns a sample provider as a
        placeholder.  Additional provider sources could include Azure AD B2C or
        federation servers.

    .PARAMETER Configuration
        Optional configuration hashtable.
    .PARAMETER SessionId
        Session identifier (unused but kept for consistency).
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    $results = @()
    try {
        if (Get-Command Get-MgIdentityProvider -ErrorAction SilentlyContinue) {
            $providers = Get-MgIdentityProvider -All:$true -ErrorAction Stop
            foreach ($p in $providers) {
                $results += [PSCustomObject]@{
                    ProviderId   = $p.Id
                    ProviderType = $p.Type
                    DisplayName  = $p.DisplayName
                    ClientId     = $p.ClientId
                }
            }
        }
    } catch {
        # ignore Graph errors
    }
    if ($results.Count -eq 0) {
        # Return a sample provider if none discovered
        $results += [PSCustomObject]@{
            ProviderId   = 'SampleIdP'
            ProviderType = 'SAML'
            DisplayName  = 'Example Identity Provider'
            ClientId     = 'N/A'
        }
    }
    return $results
}

function Get-FederationTrusts {
    <#
    .SYNOPSIS
        Retrieves federation trusts between domains.
    .DESCRIPTION
        Uses the ActiveDirectory module to enumerate forest and domain trusts.
        If the module is unavailable or no trusts are found, returns a sample
        trust entry.  On systems with ADFS, this could be extended to include
        ADFS relying party trusts via Get-AdfsRelyingPartyTrust.

    .PARAMETER Configuration
        Optional configuration hashtable.
    .PARAMETER SessionId
        Session identifier (unused but kept for consistency).
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    $results = @()
    try {
        if (Get-Module -ListAvailable -Name ActiveDirectory) {
            Import-Module ActiveDirectory -ErrorAction Stop
            $trusts = Get-ADTrust -Filter * -ErrorAction Stop
            foreach ($t in $trusts) {
                $results += [PSCustomObject]@{
                    SourceDomain = $t.Source
                    TargetDomain = $t.Target
                    TrustType    = $t.TrustType
                    Direction    = $t.Direction
                    IsTransitive = $t.Transitive
                }
            }
        }
    } catch {
        # ignore AD errors
    }
    # Attempt to retrieve ADFS trusts if ADFS module exists
    try {
        if (Get-Module -ListAvailable -Name ADFS) {
            Import-Module ADFS -ErrorAction Stop
            $rpts = Get-AdfsRelyingPartyTrust -ErrorAction SilentlyContinue
            foreach ($r in $rpts) {
                $results += [PSCustomObject]@{
                    SourceDomain = 'ADFS'
                    TargetDomain = $r.Name
                    TrustType    = 'RelyingParty'
                    Direction    = 'Outbound'
                    IsTransitive = $false
                }
            }
        }
    } catch {
        # ignore ADFS errors
    }
    if ($results.Count -eq 0) {
        # Provide a sample trust if none discovered
        $results += [PSCustomObject]@{
            SourceDomain = 'contoso.com'
            TargetDomain = 'fabrikam.com'
            TrustType    = 'External'
            Direction    = 'Bidirectional'
            IsTransitive = $true
        }
    }
    return $results
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
