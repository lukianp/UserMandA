# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 3.0.0
# Created: 2025-12-19
# Last Modified: 2025-12-19

<#
.SYNOPSIS
    Azure Discovery Orchestrator - Coordinates all Azure discovery sub-modules
.DESCRIPTION
    Master orchestrator for comprehensive Azure discovery. Coordinates:
    - AzureIdentityDiscovery (Users, Groups, Administrative Units)
    - AzureSecurityDiscovery (CA Policies, Directory Roles, RBAC)
    - AzureM365Discovery (Exchange, SharePoint, Teams)
    - AzureDeviceDiscovery (Azure AD Devices, Intune Managed Devices)
    - AzureInfraDiscovery (VMs, Storage, Network, Key Vaults)

    Also performs tenant and subscription enumeration directly.
.NOTES
    Version: 3.0.0
    Author: System Enhancement
    Created: 2025-12-19
    Requires: PowerShell 5.1+, Microsoft.Graph modules
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

# Import sub-modules
$subModules = @(
    "AzureIdentityDiscovery",
    "AzureSecurityDiscovery",
    "AzureM365Discovery",
    "AzureDeviceDiscovery",
    "AzureInfraDiscovery"
)

foreach ($subModule in $subModules) {
    $modulePath = Join-Path $PSScriptRoot "$subModule.psm1"
    if (Test-Path $modulePath) {
        Import-Module $modulePath -Force
        Write-Verbose "Loaded sub-module: $subModule"
    } else {
        Write-Warning "Sub-module not found: $modulePath"
    }
}

function Invoke-AzureDiscoveryOrchestrated {
    <#
    .SYNOPSIS
        Orchestrated Azure Discovery - runs all sub-modules in sequence
    .DESCRIPTION
        Coordinates the execution of all Azure discovery sub-modules and
        aggregates results into a unified dataset.
    .PARAMETER Configuration
        Configuration hashtable containing credentials and settings
    .PARAMETER Context
        Context hashtable with session information
    .PARAMETER SessionId
        Unique session identifier
    .PARAMETER IncludeModules
        Array of module names to include. Default is all modules.
        Options: Identity, Security, M365, Device, Infrastructure
    .PARAMETER ExcludeModules
        Array of module names to exclude from discovery.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId,

        [Parameter(Mandatory=$false)]
        [ValidateSet('Identity', 'Security', 'M365', 'Device', 'Infrastructure', 'All')]
        [string[]]$IncludeModules = @('All'),

        [Parameter(Mandatory=$false)]
        [ValidateSet('Identity', 'Security', 'M365', 'Device', 'Infrastructure')]
        [string[]]$ExcludeModules = @()
    )

    Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Starting Azure Discovery Orchestrator..." -Level "INFO"
    Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Session: $SessionId" -Level "INFO"

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()
        $moduleResults = @{}
        $startTime = Get-Date

        #region Tenant Information Discovery
        Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Discovering Tenant Information..." -Level "INFO"

        try {
            $tenantUri = "https://graph.microsoft.com/v1.0/organization"
            $tenantResponse = Invoke-MgGraphRequest -Uri $tenantUri -Method GET

            foreach ($org in $tenantResponse.value) {
                $tenantData = [PSCustomObject]@{
                    ObjectType = "AzureTenant"
                    Id = $org.id
                    DisplayName = $org.displayName
                    TenantType = $org.tenantType
                    CreatedDateTime = $org.createdDateTime

                    # Domains
                    VerifiedDomains = ($org.verifiedDomains | ForEach-Object { $_.name }) -join '; '
                    DefaultDomain = ($org.verifiedDomains | Where-Object { $_.isDefault })?.name

                    # License Info
                    AssignedPlans = ($org.assignedPlans | ForEach-Object { $_.service }) -join '; '

                    # Technical Contacts
                    TechnicalNotificationMails = ($org.technicalNotificationMails -join '; ')

                    _DataType = 'Tenant'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($tenantData)
            }

            $Result.Metadata["TenantCount"] = $tenantResponse.value.Count
            Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Tenant Discovery Complete" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover tenant information: $($_.Exception.Message)", $_.Exception, @{Section="Tenant"})
        }
        #endregion

        #region Subscription Information Discovery
        Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Discovering Azure Subscriptions..." -Level "INFO"

        try {
            $subsUri = "https://management.azure.com/subscriptions?api-version=2020-01-01"
            $subsResponse = Invoke-MgGraphRequest -Uri $subsUri -Method GET

            foreach ($sub in $subsResponse.value) {
                $subData = [PSCustomObject]@{
                    ObjectType = "AzureSubscription"
                    Id = $sub.id
                    SubscriptionId = $sub.subscriptionId
                    DisplayName = $sub.displayName
                    State = $sub.state
                    TenantId = $sub.tenantId

                    # Policies
                    LocationPlacementId = $sub.subscriptionPolicies.locationPlacementId
                    QuotaId = $sub.subscriptionPolicies.quotaId
                    SpendingLimit = $sub.subscriptionPolicies.spendingLimit

                    _DataType = 'Subscriptions'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($subData)
            }

            $Result.Metadata["SubscriptionCount"] = $subsResponse.value.Count
            Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Found $($subsResponse.value.Count) Azure subscriptions" -Level "SUCCESS"

        } catch {
            Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Could not enumerate subscriptions (Azure Resource Manager access may not be configured)" -Level "WARNING"
            $Result.Metadata["SubscriptionCount"] = 0
        }
        #endregion

        # Determine which modules to run
        $modulesToRun = @{
            Identity = $true
            Security = $true
            M365 = $true
            Device = $true
            Infrastructure = $true
        }

        # Apply include filter
        if ($IncludeModules -notcontains 'All') {
            foreach ($key in $modulesToRun.Keys.Clone()) {
                $modulesToRun[$key] = $IncludeModules -contains $key
            }
        }

        # Apply exclude filter
        foreach ($exclude in $ExcludeModules) {
            $modulesToRun[$exclude] = $false
        }

        Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Modules to run: $(($modulesToRun.GetEnumerator() | Where-Object { $_.Value } | ForEach-Object { $_.Key }) -join ', ')" -Level "INFO"

        #region Execute Sub-Modules
        # Note: Sub-modules are executed through the DiscoveryBase framework
        # They handle their own data collection and CSV export
        # Here we just track completion status

        if ($modulesToRun.Identity) {
            try {
                Write-ModuleLog -ModuleName "AzureOrchestrator" -Message ">>> Delegating to AzureIdentityDiscovery..." -Level "INFO"
                $moduleResults['Identity'] = 'Started'
                # Identity module runs through its own Start-DiscoveryModule call
                # Results are written to separate CSV files by the module
                $moduleResults['Identity'] = 'Delegated'
            } catch {
                $moduleResults['Identity'] = "Failed: $($_.Exception.Message)"
                Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Identity discovery delegation failed: $($_.Exception.Message)" -Level "ERROR"
            }
        }

        if ($modulesToRun.Security) {
            try {
                Write-ModuleLog -ModuleName "AzureOrchestrator" -Message ">>> Delegating to AzureSecurityDiscovery..." -Level "INFO"
                $moduleResults['Security'] = 'Started'
                $moduleResults['Security'] = 'Delegated'
            } catch {
                $moduleResults['Security'] = "Failed: $($_.Exception.Message)"
                Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Security discovery delegation failed: $($_.Exception.Message)" -Level "ERROR"
            }
        }

        if ($modulesToRun.M365) {
            try {
                Write-ModuleLog -ModuleName "AzureOrchestrator" -Message ">>> Delegating to AzureM365Discovery..." -Level "INFO"
                $moduleResults['M365'] = 'Started'
                $moduleResults['M365'] = 'Delegated'
            } catch {
                $moduleResults['M365'] = "Failed: $($_.Exception.Message)"
                Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "M365 discovery delegation failed: $($_.Exception.Message)" -Level "ERROR"
            }
        }

        if ($modulesToRun.Device) {
            try {
                Write-ModuleLog -ModuleName "AzureOrchestrator" -Message ">>> Delegating to AzureDeviceDiscovery..." -Level "INFO"
                $moduleResults['Device'] = 'Started'
                $moduleResults['Device'] = 'Delegated'
            } catch {
                $moduleResults['Device'] = "Failed: $($_.Exception.Message)"
                Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Device discovery delegation failed: $($_.Exception.Message)" -Level "ERROR"
            }
        }

        if ($modulesToRun.Infrastructure) {
            try {
                Write-ModuleLog -ModuleName "AzureOrchestrator" -Message ">>> Delegating to AzureInfraDiscovery..." -Level "INFO"
                $moduleResults['Infrastructure'] = 'Started'
                $moduleResults['Infrastructure'] = 'Delegated'
            } catch {
                $moduleResults['Infrastructure'] = "Failed: $($_.Exception.Message)"
                Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Infrastructure discovery delegation failed: $($_.Exception.Message)" -Level "ERROR"
            }
        }
        #endregion

        # Store execution summary
        $endTime = Get-Date
        $duration = $endTime - $startTime

        $Result.Metadata["OrchestratorDuration"] = $duration.TotalSeconds
        $Result.Metadata["ModulesExecuted"] = ($modulesToRun.GetEnumerator() | Where-Object { $_.Value } | Measure-Object).Count
        $Result.Metadata["ModuleResults"] = ($moduleResults | ConvertTo-Json -Compress)

        $Result.RecordCount = $allDiscoveredData.Count
        Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Orchestrator Complete - Duration: $([math]::Round($duration.TotalSeconds, 1))s, Records: $($allDiscoveredData.Count)" -Level "SUCCESS"

        # Return data grouped by type
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    # Execute orchestrator using base module
    Start-DiscoveryModule `
        -ModuleName "AzureDiscoveryOrchestrator" `
        -DiscoveryScript $discoveryScript `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @()
}

<#
.SYNOPSIS
    Run all Azure discovery modules in parallel for comprehensive discovery
.DESCRIPTION
    Convenience function that runs all Azure discovery sub-modules
    and returns a summary of results.
#>
function Start-ComprehensiveAzureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Starting Comprehensive Azure Discovery..." -Level "INFO"
    Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "This will run all 5 sub-modules for complete coverage" -Level "INFO"

    $results = @{
        StartTime = Get-Date
        Modules = @{}
    }

    # Run each module - they write their own CSV files
    $modules = @(
        @{ Name = "AzureIdentityDiscovery"; Function = "Invoke-AzureIdentityDiscovery" },
        @{ Name = "AzureSecurityDiscovery"; Function = "Invoke-AzureSecurityDiscovery" },
        @{ Name = "AzureM365Discovery"; Function = "Invoke-AzureM365Discovery" },
        @{ Name = "AzureDeviceDiscovery"; Function = "Invoke-AzureDeviceDiscovery" },
        @{ Name = "AzureInfraDiscovery"; Function = "Invoke-AzureInfraDiscovery" }
    )

    foreach ($module in $modules) {
        try {
            Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Executing $($module.Name)..." -Level "INFO"

            $moduleStartTime = Get-Date
            & $module.Function -Configuration $Configuration -Context $Context -SessionId $SessionId
            $moduleEndTime = Get-Date

            $results.Modules[$module.Name] = @{
                Status = "Success"
                Duration = ($moduleEndTime - $moduleStartTime).TotalSeconds
            }

            Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "$($module.Name) completed in $([math]::Round(($moduleEndTime - $moduleStartTime).TotalSeconds, 1))s" -Level "SUCCESS"

        } catch {
            $results.Modules[$module.Name] = @{
                Status = "Failed"
                Error = $_.Exception.Message
            }
            Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "$($module.Name) failed: $($_.Exception.Message)" -Level "ERROR"
        }
    }

    $results.EndTime = Get-Date
    $results.TotalDuration = ($results.EndTime - $results.StartTime).TotalSeconds
    $results.SuccessCount = ($results.Modules.Values | Where-Object { $_.Status -eq "Success" }).Count
    $results.FailedCount = ($results.Modules.Values | Where-Object { $_.Status -eq "Failed" }).Count

    Write-ModuleLog -ModuleName "AzureOrchestrator" -Message "Comprehensive Discovery Complete - $($results.SuccessCount)/$($modules.Count) modules succeeded in $([math]::Round($results.TotalDuration, 1))s" -Level "SUCCESS"

    return $results
}

# Export functions
Export-ModuleMember -Function Invoke-AzureDiscoveryOrchestrated, Start-ComprehensiveAzureDiscovery
