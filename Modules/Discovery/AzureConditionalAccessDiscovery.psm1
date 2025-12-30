# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-12-30
# Last Modified: 2025-12-30

<#
.SYNOPSIS
    Azure Conditional Access Discovery Module
.DESCRIPTION
    Focused module for discovering Azure Conditional Access Policies.
    Extracted from monolithic AzureSecurityDiscovery.psm1 for better
    performance and maintainability.

    Discovers:
    - Conditional Access Policies with migration assessment
    - Policy complexity analysis for migration planning
    - User/group/application targeting
    - Grant and session controls
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-12-30
    Requires: PowerShell 5.1+, Microsoft.Graph modules
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureConditionalAccessDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureConditionalAccessDiscovery" -Message "Starting Conditional Access Policy Discovery..." -Level "INFO"

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        Write-ModuleLog -ModuleName "AzureConditionalAccessDiscovery" -Message "Discovering Conditional Access Policies..." -Level "INFO"

        try {
            $caPolicies = @()
            $caUri = "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies"

            do {
                $response = Invoke-MgGraphRequest -Uri $caUri -Method GET
                $caPolicies += $response.value
                $caUri = $response.'@odata.nextLink'
            } while ($caUri)

            foreach ($policy in $caPolicies) {
                # Analyze policy complexity for migration
                $migrationNotes = @()
                $migrationComplexity = 'Low'

                # Check conditions complexity
                $conditions = $policy.conditions
                if ($conditions.users.includeUsers -contains 'All' -or $conditions.users.excludeUsers.Count -gt 0) {
                    $migrationNotes += 'Uses user conditions - verify user mapping in target tenant'
                }
                if ($conditions.users.includeGroups.Count -gt 0 -or $conditions.users.excludeGroups.Count -gt 0) {
                    $migrationNotes += "References $(@($conditions.users.includeGroups).Count + @($conditions.users.excludeGroups).Count) groups - ensure groups are migrated first"
                    $migrationComplexity = 'Medium'
                }
                if ($conditions.applications.includeApplications -and $conditions.applications.includeApplications -notcontains 'All') {
                    $migrationNotes += "Targets specific applications - verify app registration in target tenant"
                    $migrationComplexity = 'Medium'
                }
                if ($conditions.locations) {
                    $migrationNotes += 'Uses named locations - recreate location definitions in target tenant'
                    $migrationComplexity = 'High'
                }
                if ($conditions.platforms) {
                    $migrationNotes += 'Has platform conditions - verify platform support in target tenant'
                }
                if ($conditions.clientAppTypes -and $conditions.clientAppTypes.Count -gt 0) {
                    $migrationNotes += "Filters by client app types: $($conditions.clientAppTypes -join ', ')"
                }

                # Check grant controls
                $grantControls = $policy.grantControls
                $grantControlsList = @()
                if ($grantControls) {
                    if ($grantControls.builtInControls) {
                        $grantControlsList += $grantControls.builtInControls
                    }
                    if ($grantControls.customAuthenticationFactors) {
                        $migrationNotes += 'Uses custom authentication factors - requires manual configuration in target'
                        $migrationComplexity = 'High'
                    }
                    if ($grantControls.termsOfUse) {
                        $migrationNotes += 'References Terms of Use - recreate ToU in target tenant'
                        $migrationComplexity = 'High'
                    }
                }

                # Check session controls
                $sessionControls = $policy.sessionControls
                $sessionControlsList = @()
                if ($sessionControls) {
                    if ($sessionControls.applicationEnforcedRestrictions) {
                        $sessionControlsList += 'applicationEnforcedRestrictions'
                    }
                    if ($sessionControls.cloudAppSecurity) {
                        $sessionControlsList += 'cloudAppSecurity'
                        $migrationNotes += 'Uses Cloud App Security - configure MCAS integration in target'
                        $migrationComplexity = 'High'
                    }
                    if ($sessionControls.signInFrequency) {
                        $sessionControlsList += 'signInFrequency'
                    }
                    if ($sessionControls.persistentBrowser) {
                        $sessionControlsList += 'persistentBrowser'
                    }
                }

                $caData = [PSCustomObject]@{
                    ObjectType = "ConditionalAccessPolicy"
                    Id = $policy.id
                    DisplayName = $policy.displayName
                    Description = $policy.description
                    State = $policy.state
                    CreatedDateTime = $policy.createdDateTime
                    ModifiedDateTime = $policy.modifiedDateTime

                    # User Conditions
                    IncludeUsers = ($conditions.users.includeUsers -join '; ')
                    ExcludeUsers = ($conditions.users.excludeUsers -join '; ')
                    IncludeGroups = ($conditions.users.includeGroups -join '; ')
                    ExcludeGroups = ($conditions.users.excludeGroups -join '; ')
                    IncludeRoles = ($conditions.users.includeRoles -join '; ')
                    ExcludeRoles = ($conditions.users.excludeRoles -join '; ')

                    # Application Conditions
                    IncludeApplications = ($conditions.applications.includeApplications -join '; ')
                    ExcludeApplications = ($conditions.applications.excludeApplications -join '; ')

                    # Other Conditions
                    ClientAppTypes = ($conditions.clientAppTypes -join '; ')
                    Platforms = if ($conditions.platforms) { ($conditions.platforms.includePlatforms -join '; ') } else { $null }
                    Locations = if ($conditions.locations) { ($conditions.locations.includeLocations -join '; ') } else { $null }
                    DeviceStates = if ($conditions.devices) { "Configured" } else { "Not Configured" }
                    SignInRiskLevels = if ($conditions.signInRiskLevels) { ($conditions.signInRiskLevels -join '; ') } else { $null }
                    UserRiskLevels = if ($conditions.userRiskLevels) { ($conditions.userRiskLevels -join '; ') } else { $null }

                    # Controls
                    GrantControls = ($grantControlsList -join '; ')
                    GrantOperator = if ($grantControls) { $grantControls.operator } else { $null }
                    SessionControls = ($sessionControlsList -join '; ')

                    # Migration Assessment
                    MigrationComplexity = $migrationComplexity
                    MigrationNotes = ($migrationNotes -join '; ')

                    _DataType = 'ConditionalAccessPolicies'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($caData)
            }

            $Result.Metadata["ConditionalAccessPolicyCount"] = @($caPolicies).Count
            $Result.Metadata["EnabledCAPolicies"] = @($caPolicies | Where-Object { $_.state -eq 'enabled' }).Count
            $Result.Metadata["ReportOnlyCAPolicies"] = @($caPolicies | Where-Object { $_.state -eq 'enabledForReportingButNotEnforced' }).Count
            $Result.Metadata["DisabledCAPolicies"] = @($caPolicies | Where-Object { $_.state -eq 'disabled' }).Count

            Write-ModuleLog -ModuleName "AzureConditionalAccessDiscovery" -Message "Found $(@($caPolicies).Count) policies (Enabled: $($Result.Metadata['EnabledCAPolicies']), Report-Only: $($Result.Metadata['ReportOnlyCAPolicies']), Disabled: $($Result.Metadata['DisabledCAPolicies']))" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Conditional Access Policies: $($_.Exception.Message)", $_.Exception, @{Section="ConditionalAccess"})
        }

        $Result.RecordCount = @($allDiscoveredData).Count
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    # Execute using base module pattern
    $params = @{
        ModuleName = "AzureConditionalAccessDiscovery"
        Configuration = $Configuration
        Context = $Context
        SessionId = $SessionId
        DiscoveryScript = $discoveryScript
        RequiredConnections = @('Graph')
    }

    return Invoke-StandardDiscovery @params
}

Export-ModuleMember -Function Invoke-AzureConditionalAccessDiscovery
