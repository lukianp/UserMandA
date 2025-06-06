# -*- coding: utf-8-bom -*-
#Requires -Modules Az.Accounts, Az.Resources, Az.Compute, Az.Network, Az.PolicyInsights, Az.RecoveryServices

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header

<#
.SYNOPSIS
    Enhanced Azure Discovery Module with API Throttling Support
.DESCRIPTION
    Provides comprehensive Azure resource discovery with improved error handling,
    API throttling, and context-based operations.
.NOTES
    Version: 2.0.0
    Enhanced: 2025-01-03
#>

# Import shared utilities
# Add at the top after imports
# Import progress display module
$progressModulePath = if ($global:MandA -and $global:MandA.Paths) {
    Join-Path $global:MandA.Paths.Utilities "ProgressDisplay.psm1"
} else {
    Join-Path (Split-Path $PSScriptRoot -Parent) "..\Utilities\ProgressDisplay.psm1"
}
if (Test-Path $progressModulePath) {
    Import-Module $progressModulePath -Force -Global
}

# Enhanced Get-AzureSubscriptionsInternal with progress
function Get-AzureSubscriptionsInternal {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    Write-ProgressStep "Discovering Azure Subscriptions..." -Status Progress
    $allSubscriptions = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $subscriptions = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzSubscription -ErrorAction Stop
        } -OperationName "GetSubscriptions" -Context $Context
        
        if ($subscriptions) {
            Write-ProgressStep "Found $($subscriptions.Count) subscriptions to process" -Status Info
            
            $processedCount = 0
            foreach ($sub in $subscriptions) {
                $processedCount++
                Show-ProgressBar -Current $processedCount -Total $subscriptions.Count `
                    -Activity "Processing subscription: $($sub.Name)"
                
                $allSubscriptions.Add([PSCustomObject]@{
                    SubscriptionId = $sub.Id
                    SubscriptionName = $sub.Name
                    TenantId = $sub.TenantId
                    State = $sub.State.ToString()
                })
            }
            
            Write-Host "" # New line after progress
            Write-ProgressStep "Retrieved $($allSubscriptions.Count) Azure Subscriptions" -Status Success
        }
    }
    catch {
        Write-ProgressStep "Error retrieving subscriptions: $($_.Exception.Message)" -Status Error
        $Context.ErrorCollector.AddError("Azure_Subscriptions", "Failed to retrieve subscriptions", $_.Exception)
        throw
    }
    
    return $allSubscriptions
}

# Enhanced Get-AzureVMsDataInternal with progress
function Get-AzureVMsDataInternal {
    param(
        [hashtable]$Configuration,
        $SubscriptionContext,
        $Context
    )
    
    Write-ProgressStep "Discovering VMs in subscription '$($SubscriptionContext.Name)'..." -Status Progress
    $allVMs = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $vms = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzVM -Status -ErrorAction Stop
        } -OperationName "GetVMs_$($SubscriptionContext.Name)" -Context $Context
        
        if ($vms) {
            Write-ProgressStep "Found $($vms.Count) VMs to process" -Status Info
            
            $processedCount = 0
            foreach ($vm in $vms) {
                $processedCount++
                
                # Update progress every 5 VMs or at the end
                if ($processedCount % 5 -eq 0 -or $processedCount -eq $vms.Count) {
                    Show-ProgressBar -Current $processedCount -Total $vms.Count `
                        -Activity "Processing VM: $($vm.Name)"
                }
                
                $vmObj = ConvertTo-VMObject -VM $vm -SubscriptionContext $SubscriptionContext -Context $Context
                $allVMs.Add($vmObj)
            }
            
            Write-Host "" # New line after progress
            Write-ProgressStep "Processed $($allVMs.Count) VMs successfully" -Status Success
        }
    }
    catch {
        Write-ProgressStep "Error retrieving VMs: $($_.Exception.Message)" -Status Error
        $Context.ErrorCollector.AddError("Azure_VMs", "Failed to retrieve VMs from '$($SubscriptionContext.Name)'", $_.Exception)
        throw
    }
    
    return $allVMs
}

# Azure Discovery Prerequisites Function
function Test-AzureDiscoveryPrerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [DiscoveryResult]$Result,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    Write-MandALog "Validating Azure Discovery prerequisites..." -Level "INFO" -Context $Context
    
    try {
        # Validate Azure PowerShell modules
        $requiredModules = @('Az.Accounts', 'Az.Resources', 'Az.Compute', 'Az.Network')
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -Name $module -ListAvailable)) {
                $Result.AddError("$module PowerShell module is not available", $null, @{
                    Prerequisite = "$module Module"
                    Resolution = "Install $module PowerShell module using 'Install-Module $module'"
                })
                return
            }
        }
        
        # Check Azure connection
        $currentAzContext = Get-AzContext -ErrorAction SilentlyContinue
        if (-not $currentAzContext) {
            $Result.AddError("Not connected to Azure", $null, @{
                Prerequisite = 'Azure Authentication'
                Resolution = 'Connect to Azure using Connect-AzAccount'
            })
            return
        }
        
        Write-MandALog "Successfully authenticated to Azure. Context: $($currentAzContext.Name) | Tenant: $($currentAzContext.Tenant.Id)" -Level "SUCCESS" -Context $Context
        $Result.Metadata['TenantId'] = $currentAzContext.Tenant.Id
        $Result.Metadata['AccountId'] = $currentAzContext.Account.Id
        
        Write-MandALog "All Azure Discovery prerequisites validated successfully" -Level "SUCCESS" -Context $Context
        
    }
    catch {
        $Result.AddError("Unexpected error during prerequisites validation", $_.Exception, @{
            Prerequisite = 'General Validation'
        })
    }
}

function Get-AzureSubscriptionsWithErrorHandling {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    $subscriptions = [System.Collections.ArrayList]::new()
    $retryCount = 0
    $maxRetries = 3
    
    while ($retryCount -lt $maxRetries) {
        try {
            $azSubscriptions = Invoke-AzureOperationWithThrottling -Operation {
                Get-AzSubscription -ErrorAction Stop
            } -OperationName "GetSubscriptions" -Context $Context
            
            if ($azSubscriptions) {
                foreach ($sub in $azSubscriptions) {
                    $null = $subscriptions.Add([PSCustomObject]@{
                        SubscriptionId = $sub.Id
                        SubscriptionName = $sub.Name
                        TenantId = $sub.TenantId
                        State = $sub.State.ToString()
                    })
                }
                
                Write-MandALog "Retrieved $($subscriptions.Count) Azure Subscriptions" -Level "INFO" -Context $Context
            }
            
            # Success - exit retry loop
            break
        }
        catch {
            $retryCount++
            if ($retryCount -ge $maxRetries) {
                throw "Failed to retrieve Azure subscriptions after $maxRetries attempts: $_"
            }
            
            $waitTime = [Math]::Pow(2, $retryCount) * 2  # Exponential backoff
            Write-MandALog "Azure subscription query failed (attempt $retryCount/$maxRetries). Waiting $waitTime seconds..." -Level "WARN" -Context $Context
            Start-Sleep -Seconds $waitTime
        }
    }
    
    return $subscriptions.ToArray()
}

function Process-TenantLevelResourcesWithErrorHandling {
    param($TenantId, $SubscriptionContext, $Configuration, $Context)
    
    $tenantData = @{
        ADApplications = @()
        ADApplicationOwners = @()
        ServicePrincipals = @()
        ServicePrincipalOwners = @()
    }
    
    try {
        # Set context to the subscription
        Invoke-AzureOperationWithThrottling -Operation {
            Set-AzContext -SubscriptionId $SubscriptionContext.SubscriptionId -TenantId $TenantId -ErrorAction Stop | Out-Null
        } -OperationName "SetContext_Tenant_$TenantId" -Context $Context
        
        # Get AD Applications with error handling
        try {
            $adAppsData = Get-AzureADApplicationsInternal -Configuration $Configuration -TenantId $TenantId -Context $Context
            if ($adAppsData.Applications) { $tenantData.ADApplications = $adAppsData.Applications }
            if ($adAppsData.Owners) { $tenantData.ADApplicationOwners = $adAppsData.Owners }
        }
        catch {
            Write-MandALog "Error retrieving AD Applications for tenant $TenantId`: $($_.Exception.Message)" -Level "WARN" -Context $Context
        }
        
        # Get Service Principals with error handling
        try {
            $spData = Get-AzureServicePrincipalsInternal -Configuration $Configuration -TenantId $TenantId -Context $Context
            if ($spData.ServicePrincipals) { $tenantData.ServicePrincipals = $spData.ServicePrincipals }
            if ($spData.Owners) { $tenantData.ServicePrincipalOwners = $spData.Owners }
        }
        catch {
            Write-MandALog "Error retrieving Service Principals for tenant $TenantId`: $($_.Exception.Message)" -Level "WARN" -Context $Context
        }
    }
    catch {
        Write-MandALog "Error processing tenant-level resources for $TenantId`: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
    
    return $tenantData
}

function Process-SubscriptionLevelResourcesWithErrorHandling {
    param($Subscription, $Configuration, $Context)
    
    $subscriptionData = @{
        ResourceGroups = @()
        VirtualMachines = @()
        StorageAccounts = @()
        SQLDatabases = @()
        WebApps = @()
        KeyVaults = @()
        NetworkSecurityGroups = @()
    }
    
    try {
        # Set subscription context
        Invoke-AzureOperationWithThrottling -Operation {
            Set-AzContext -SubscriptionId $Subscription.SubscriptionId -TenantId $Subscription.TenantId -ErrorAction Stop | Out-Null
        } -OperationName "SetContext_Sub_$($Subscription.SubscriptionName)" -Context $Context
        
        # Get each resource type with individual error handling
        $resourceTypes = @(
            @{Name="Resource Groups"; Function="Get-AzureResourceGroupsInternal"; Property="ResourceGroups"},
            @{Name="Virtual Machines"; Function="Get-AzureVMsDataInternal"; Property="VirtualMachines"},
            @{Name="Storage Accounts"; Function="Get-AzureStorageAccountsInternal"; Property="StorageAccounts"},
            @{Name="SQL Databases"; Function="Get-AzureSQLDatabasesInternal"; Property="SQLDatabases"},
            @{Name="Web Apps"; Function="Get-AzureWebAppsInternal"; Property="WebApps"},
            @{Name="Key Vaults"; Function="Get-AzureKeyVaultsInternal"; Property="KeyVaults"},
            @{Name="Network Security Groups"; Function="Get-AzureNSGsInternal"; Property="NetworkSecurityGroups"}
        )
        
        foreach ($resType in $resourceTypes) {
            try {
                Write-MandALog "Discovering $($resType.Name) in subscription $($Subscription.SubscriptionName)..." -Level "INFO" -Context $Context
                $resources = & $resType.Function -Configuration $Configuration -SubscriptionContext $Subscription -Context $Context
                if ($resources) {
                    $subscriptionData[$resType.Property] = $resources
                    Write-MandALog "Successfully discovered $($resources.Count) $($resType.Name)" -Level "SUCCESS" -Context $Context
                }
            }
            catch {
                Write-MandALog "Error discovering $($resType.Name) in subscription $($Subscription.SubscriptionName): $($_.Exception.Message)" -Level "WARN" -Context $Context
                # Continue with other resource types
            }
        }
    }
    catch {
        Write-MandALog "Error processing subscription-level resources for $($Subscription.SubscriptionName): $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
    
    return $subscriptionData
}

# Enhanced main Invoke-AzureDiscovery function
function Invoke-AzureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    # Initialize result object
    $result = [DiscoveryResult]::new('Azure')
    
    # Set up error handling preferences
    $originalErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Stop'
    
    try {
        # Create minimal context if not provided
        if (-not $Context) {
            $Context = @{
                ErrorCollector = [PSCustomObject]@{
                    AddError = { param($s,$m,$e) Write-Warning "Error in $s`: $m" }
                    AddWarning = { param($s,$m) Write-Warning "Warning in $s`: $m" }
                }
                Paths = @{
                    RawDataOutput = Join-Path $Configuration.environment.outputPath "Raw"
                }
            }
        }
        
        Write-MandALog "--- Starting Azure Discovery Phase (v2.0.0) ---" -Level "HEADER" -Context $Context
        
        # Validate prerequisites
        Test-AzureDiscoveryPrerequisites -Configuration $Configuration -Result $result -Context $Context
        
        if (-not $result.Success) {
            Write-MandALog "Prerequisites check failed, aborting Azure discovery" -Level "ERROR" -Context $Context
            return $result
        }
        
        # Main discovery logic with nested error handling
        $azureData = @{
            Subscriptions = @()
            ResourceGroups = @()
            VirtualMachines = @()
            ADApplications = @()
            ADApplicationOwners = @()
            ServicePrincipals = @()
            ServicePrincipalOwners = @()
            StorageAccounts = @()
            SQLDatabases = @()
            WebApps = @()
            KeyVaults = @()
            NetworkSecurityGroups = @()
        }
        
        # Discover Subscriptions with specific error handling
        try {
            Write-MandALog "Discovering Azure Subscriptions..." -Level "INFO" -Context $Context
            $azureData.Subscriptions = Get-AzureSubscriptionsWithErrorHandling -Configuration $Configuration -Context $Context
            $result.Metadata['SubscriptionCount'] = $azureData.Subscriptions.Count
            Write-MandALog "Successfully discovered $($azureData.Subscriptions.Count) Azure subscriptions" -Level "SUCCESS" -Context $Context
        }
        catch {
            $result.AddError(
                "Failed to discover Azure subscriptions",
                $_.Exception,
                @{
                    Operation = 'Get-AzSubscription'
                    TenantId = if ($azContext = Get-AzContext) { $azContext.Tenant.Id } else { $null }
                }
            )
            Write-MandALog "Error discovering Azure subscriptions: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            # Continue with other discoveries even if subscriptions fail
        }
        
        # Process each subscription
        if ($azureData.Subscriptions -and $azureData.Subscriptions.Count -gt 0) {
            $processedTenants = @{}
            $subProcessedCount = 0
            
            foreach ($sub in $azureData.Subscriptions) {
                $subProcessedCount++
                Write-MandALog "Processing subscription $subProcessedCount/$($azureData.Subscriptions.Count): $($sub.SubscriptionName)" -Level "INFO" -Context $Context
                
                # Process tenant-level resources once per tenant
                if (-not $processedTenants.ContainsKey($sub.TenantId)) {
                    try {
                        Write-MandALog "Processing tenant-level resources for: $($sub.TenantId)" -Level "INFO" -Context $Context
                        $tenantData = Process-TenantLevelResourcesWithErrorHandling -TenantId $sub.TenantId -SubscriptionContext $sub -Configuration $Configuration -Context $Context
                        
                        if ($tenantData.ADApplications) { $azureData.ADApplications += $tenantData.ADApplications }
                        if ($tenantData.ADApplicationOwners) { $azureData.ADApplicationOwners += $tenantData.ADApplicationOwners }
                        if ($tenantData.ServicePrincipals) { $azureData.ServicePrincipals += $tenantData.ServicePrincipals }
                        if ($tenantData.ServicePrincipalOwners) { $azureData.ServicePrincipalOwners += $tenantData.ServicePrincipalOwners }
                        
                        $processedTenants[$sub.TenantId] = $true
                    }
                    catch {
                        $result.AddError(
                            "Failed to process tenant-level resources",
                            $_.Exception,
                            @{
                                Operation = 'Process-TenantLevelResources'
                                TenantId = $sub.TenantId
                            }
                        )
                        Write-MandALog "Error processing tenant resources for $($sub.TenantId): $($_.Exception.Message)" -Level "ERROR" -Context $Context
                    }
                }
                
                # Process subscription-level resources
                try {
                    Write-MandALog "Processing subscription-level resources for: $($sub.SubscriptionName)" -Level "INFO" -Context $Context
                    $subscriptionData = Process-SubscriptionLevelResourcesWithErrorHandling -Subscription $sub -Configuration $Configuration -Context $Context
                    
                    if ($subscriptionData.ResourceGroups) { $azureData.ResourceGroups += $subscriptionData.ResourceGroups }
                    if ($subscriptionData.VirtualMachines) { $azureData.VirtualMachines += $subscriptionData.VirtualMachines }
                    if ($subscriptionData.StorageAccounts) { $azureData.StorageAccounts += $subscriptionData.StorageAccounts }
                    if ($subscriptionData.SQLDatabases) { $azureData.SQLDatabases += $subscriptionData.SQLDatabases }
                    if ($subscriptionData.WebApps) { $azureData.WebApps += $subscriptionData.WebApps }
                    if ($subscriptionData.KeyVaults) { $azureData.KeyVaults += $subscriptionData.KeyVaults }
                    if ($subscriptionData.NetworkSecurityGroups) { $azureData.NetworkSecurityGroups += $subscriptionData.NetworkSecurityGroups }
                }
                catch {
                    $result.AddError(
                        "Failed to process subscription-level resources",
                        $_.Exception,
                        @{
                            Operation = 'Process-SubscriptionLevelResources'
                            SubscriptionId = $sub.SubscriptionId
                            SubscriptionName = $sub.SubscriptionName
                        }
                    )
                    Write-MandALog "Error processing subscription resources for $($sub.SubscriptionName): $($_.Exception.Message)" -Level "ERROR" -Context $Context
                }
            }
        }
        
        # Set the data even if partially successful
        $result.Data = $azureData
        
        # Update metadata with counts
        $result.Metadata['ResourceGroupCount'] = $azureData.ResourceGroups.Count
        $result.Metadata['VirtualMachineCount'] = $azureData.VirtualMachines.Count
        $result.Metadata['StorageAccountCount'] = $azureData.StorageAccounts.Count
        $result.Metadata['SQLDatabaseCount'] = $azureData.SQLDatabases.Count
        $result.Metadata['WebAppCount'] = $azureData.WebApps.Count
        $result.Metadata['KeyVaultCount'] = $azureData.KeyVaults.Count
        $result.Metadata['NetworkSecurityGroupCount'] = $azureData.NetworkSecurityGroups.Count
        $result.Metadata['ADApplicationCount'] = $azureData.ADApplications.Count
        $result.Metadata['ServicePrincipalCount'] = $azureData.ServicePrincipals.Count
        
        # Determine overall success based on critical data
        if ($azureData.Subscriptions.Count -eq 0) {
            $result.Success = $false
            $result.AddError("No Azure subscriptions retrieved")
            Write-MandALog "Azure Discovery failed - no subscriptions retrieved" -Level "ERROR" -Context $Context
        } else {
            Write-MandALog "--- Azure Discovery Phase Completed Successfully ---" -Level "SUCCESS" -Context $Context
        }
        
    }
    catch {
        # Catch-all for unexpected errors
        $result.AddError(
            "Unexpected error in Azure discovery",
            $_.Exception,
            @{
                ErrorPoint = 'Main Discovery Block'
                LastOperation = $MyInvocation.MyCommand.Name
            }
        )
        Write-MandALog "Unexpected error in Azure Discovery: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    finally {
        # Always execute cleanup
        $ErrorActionPreference = $originalErrorActionPreference
        $result.Complete()
        
        # Log summary
        Write-MandALog "Azure Discovery completed. Success: $($result.Success), Errors: $($result.Errors.Count), Warnings: $($result.Warnings.Count)" -Level "INFO" -Context $Context
        
        # Clean up connections if needed
        try {
            # Clear any cached Azure contexts if needed
            if (Get-Variable -Name 'AzureSession' -ErrorAction SilentlyContinue) {
                Remove-Variable -Name 'AzureSession' -Force
            }
        }
        catch {
            Write-MandALog "Cleanup warning: $_" -Level "WARN" -Context $Context
        }
    }
    
    return $result
}

# Enhanced Process-SubscriptionLevelResources
function Process-SubscriptionLevelResources {
    param($Subscription, $DiscoveredData, $Configuration, $Context)
    
    Write-ProgressStep "Processing subscription: $($Subscription.SubscriptionName)" -Status Progress
    
    try {
        # Set subscription context
        Write-ProgressStep "Setting subscription context..." -Status Progress
        Invoke-AzureOperationWithThrottling -Operation {
            Set-AzContext -SubscriptionId $Subscription.SubscriptionId -TenantId $Subscription.TenantId -ErrorAction Stop | Out-Null
        } -OperationName "SetContext_Sub_$($Subscription.SubscriptionName)" -Context $Context
        
        # Track progress through resource types
        $resourceTypes = @(
            @{Name="Resource Groups"; Function="Get-AzureResourceGroupsInternal"; Collection="ResourceGroups"},
            @{Name="Virtual Machines"; Function="Get-AzureVMsDataInternal"; Collection="VirtualMachines"},
            @{Name="Storage Accounts"; Function="Get-AzureStorageAccountsInternal"; Collection="StorageAccounts"},
            @{Name="SQL Databases"; Function="Get-AzureSQLDatabasesInternal"; Collection="SQLDatabases"},
            @{Name="Web Apps"; Function="Get-AzureWebAppsInternal"; Collection="WebApps"},
            @{Name="Key Vaults"; Function="Get-AzureKeyVaultsInternal"; Collection="KeyVaults"},
            @{Name="Network Security Groups"; Function="Get-AzureNSGsInternal"; Collection="NetworkSecurityGroups"}
        )
        
        $typeProcessed = 0
        foreach ($resType in $resourceTypes) {
            $typeProcessed++
            Show-ProgressBar -Current $typeProcessed -Total $resourceTypes.Count `
                -Activity "Discovering $($resType.Name)"
            
            $resources = & $resType.Function -Configuration $Configuration -SubscriptionContext $Subscription -Context $Context
            if ($resources) { 
                $DiscoveredData[$resType.Collection].AddRange($resources) 
            }
        }
        
        Write-Host "" # New line after progress
        Write-ProgressStep "Completed processing subscription: $($Subscription.SubscriptionName)" -Status Success
    }
    catch {
        Write-ProgressStep "Failed to process subscription: $($Subscription.SubscriptionName)" -Status Error
        $Context.ErrorCollector.AddError("Azure_Subscription", "Failed to process subscription: $($Subscription.SubscriptionName)", $_.Exception)
        throw
    }
}


# API Throttling Configuration
$script:ThrottleConfig = @{
    DefaultDelay = 1
    ThrottleDelay = 60
    MaxRetries = 3
    RetryableErrors = @(
        "TooManyRequests",
        "429",
        "Throttled",
        "RequestThrottled",
        "OperationThrottled"
    )
}

# Core throttling function
function Invoke-AzureOperationWithThrottling {
    param(
        [scriptblock]$Operation,
        [string]$OperationName,
        $Context,
        [int]$MaxRetries = $script:ThrottleConfig.MaxRetries
    )
    
    $retryCount = 0
    $lastError = $null
    
    while ($retryCount -lt $MaxRetries) {
        try {
            # Add small delay to prevent hitting rate limits
            if ($retryCount -gt 0) {
                Start-Sleep -Seconds $script:ThrottleConfig.DefaultDelay
            }
            
            # Execute the operation
            $result = & $Operation
            return $result
        }
        catch {
            $lastError = $_
            
            # Check if error is throttling-related
            $isThrottled = $false
            foreach ($errorPattern in $script:ThrottleConfig.RetryableErrors) {
                if ($_.Exception.Message -match $errorPattern) {
                    $isThrottled = $true
                    break
                }
            }
            
            if ($isThrottled) {
                $retryCount++
                $waitTime = $script:ThrottleConfig.ThrottleDelay * $retryCount
                
                Write-MandALog "API throttled for $OperationName. Waiting $waitTime seconds (Retry $retryCount/$MaxRetries)" -Level "WARN" -Context $Context
                $Context.ErrorCollector.AddWarning("Azure_$OperationName", "API throttled, retry $retryCount")
                
                Start-Sleep -Seconds $waitTime
            }
            else {
                # Non-throttling error, throw immediately
                throw
            }
        }
    }
    
    # Max retries exceeded
    $Context.ErrorCollector.AddError("Azure_$OperationName", "Max retries exceeded after throttling", $lastError.Exception)
    throw "Max retries exceeded for $OperationName`: $($lastError.Exception.Message)"
}

# Discovery Functions
function Get-AzureSubscriptionsInternal {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    Write-MandALog "Discovering Azure Subscriptions..." -Level "INFO" -Context $Context
    $allSubscriptions = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $subscriptions = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzSubscription -ErrorAction Stop
        } -OperationName "GetSubscriptions" -Context $Context
        
        if ($subscriptions) {
            foreach ($sub in $subscriptions) {
                $allSubscriptions.Add([PSCustomObject]@{
                    SubscriptionId = $sub.Id
                    SubscriptionName = $sub.Name
                    TenantId = $sub.TenantId
                    State = $sub.State.ToString()
                })
            }
            
            Write-MandALog "Retrieved $($allSubscriptions.Count) Azure Subscriptions" -Level "INFO" -Context $Context
        }
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_Subscriptions", "Failed to retrieve subscriptions", $_.Exception)
        Write-MandALog "Error retrieving Azure Subscriptions: $($_.Exception.Message)" -Level "ERROR" -Context $Context
    }
    
    return $allSubscriptions
}

function Get-AzureResourceGroupsInternal {
    param(
        [hashtable]$Configuration,
        $SubscriptionContext,
        $Context
    )
    
    Write-MandALog "Discovering Resource Groups in subscription '$($SubscriptionContext.Name)'..." -Level "INFO" -Context $Context
    $allRGs = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $rgs = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzResourceGroup -ErrorAction Stop
        } -OperationName "GetResourceGroups_$($SubscriptionContext.Name)" -Context $Context
        
        if ($rgs) {
            foreach ($rg in $rgs) {
                $allRGs.Add([PSCustomObject]@{
                    SubscriptionId = $SubscriptionContext.Id
                    SubscriptionName = $SubscriptionContext.Name
                    ResourceGroupName = $rg.ResourceGroupName
                    Location = $rg.Location
                    ProvisioningState = $rg.ProvisioningState
                    Tags = if ($rg.Tags) { $rg.Tags | ConvertTo-Json -Compress -Depth 3 } else { $null }
                })
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_ResourceGroups", "Failed to retrieve RGs from '$($SubscriptionContext.Name)'", $_.Exception)
    }
    
    return $allRGs
}

#adding extra modules

function Get-AzureStorageAccountsInternal {
    param(
        [hashtable]$Configuration,
        $SubscriptionContext,
        $Context
    )
    
    Write-MandALog "Discovering Storage Accounts in subscription '$($SubscriptionContext.Name)'..." -Level "INFO" -Context $Context
    $allStorage = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $storageAccounts = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzStorageAccount -ErrorAction Stop
        } -OperationName "GetStorageAccounts_$($SubscriptionContext.Name)" -Context $Context
        
        if ($storageAccounts) {
            foreach ($sa in $storageAccounts) {
                $allStorage.Add([PSCustomObject]@{
                    SubscriptionId = $SubscriptionContext.Id
                    SubscriptionName = $SubscriptionContext.Name
                    StorageAccountName = $sa.StorageAccountName
                    ResourceGroupName = $sa.ResourceGroupName
                    Location = $sa.Location
                    Kind = $sa.Kind
                    SkuName = $sa.Sku.Name
                    SkuTier = $sa.Sku.Tier
                    AccessTier = $sa.AccessTier
                    CreationTime = $sa.CreationTime
                    EnableHttpsTrafficOnly = $sa.EnableHttpsTrafficOnly
                    MinimumTlsVersion = $sa.MinimumTlsVersion
                    PrimaryLocation = $sa.PrimaryLocation
                    SecondaryLocation = $sa.SecondaryLocation
                    StatusOfPrimary = $sa.StatusOfPrimary
                    Tags = if ($sa.Tags) { $sa.Tags | ConvertTo-Json -Compress } else { $null }
                })
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_StorageAccounts", "Failed to retrieve storage accounts from '$($SubscriptionContext.Name)'", $_.Exception)
    }
    
    return $allStorage
}


function Get-AzureSQLDatabasesInternal {
    param(
        [hashtable]$Configuration,
        $SubscriptionContext,
        $Context
    )
    
    Write-MandALog "Discovering SQL Databases in subscription '$($SubscriptionContext.Name)'..." -Level "INFO" -Context $Context
    $allDatabases = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        # First get SQL servers
        $sqlServers = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzSqlServer -ErrorAction Stop
        } -OperationName "GetSqlServers_$($SubscriptionContext.Name)" -Context $Context
        
        if ($sqlServers) {
            foreach ($server in $sqlServers) {
                # Get databases for each server
                $databases = Invoke-AzureOperationWithThrottling -Operation {
                    Get-AzSqlDatabase -ServerName $server.ServerName -ResourceGroupName $server.ResourceGroupName -ErrorAction Stop
                } -OperationName "GetSqlDatabases_$($server.ServerName)" -Context $Context
                
                foreach ($db in $databases | Where-Object { $_.DatabaseName -ne "master" }) {
                    $allDatabases.Add([PSCustomObject]@{
                        SubscriptionId = $SubscriptionContext.Id
                        SubscriptionName = $SubscriptionContext.Name
                        ServerName = $server.ServerName
                        DatabaseName = $db.DatabaseName
                        ResourceGroupName = $db.ResourceGroupName
                        Location = $db.Location
                        DatabaseId = $db.DatabaseId
                        Edition = $db.Edition
                        ServiceObjectiveName = $db.CurrentServiceObjectiveName
                        MaxSizeBytes = $db.MaxSizeBytes
                        Status = $db.Status
                        CreationDate = $db.CreationDate
                        EarliestRestoreDate = $db.EarliestRestoreDate
                        Tags = if ($db.Tags) { $db.Tags | ConvertTo-Json -Compress } else { $null }
                    })
                }
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_SQLDatabases", "Failed to retrieve SQL databases from '$($SubscriptionContext.Name)'", $_.Exception)
    }
    
    return $allDatabases
}


function Get-AzureWebAppsInternal {
    param(
        [hashtable]$Configuration,
        $SubscriptionContext,
        $Context
    )
    
    Write-MandALog "Discovering Web Apps in subscription '$($SubscriptionContext.Name)'..." -Level "INFO" -Context $Context
    $allWebApps = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $webApps = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzWebApp -ErrorAction Stop
        } -OperationName "GetWebApps_$($SubscriptionContext.Name)" -Context $Context
        
        if ($webApps) {
            foreach ($app in $webApps) {
                $allWebApps.Add([PSCustomObject]@{
                    SubscriptionId = $SubscriptionContext.Id
                    SubscriptionName = $SubscriptionContext.Name
                    Name = $app.Name
                    ResourceGroup = $app.ResourceGroup
                    Location = $app.Location
                    State = $app.State
                    HostNames = $app.HostNames -join ";"
                    AppServicePlan = $app.ServerFarmId
                    Kind = $app.Kind
                    HttpsOnly = $app.HttpsOnly
                    ClientCertEnabled = $app.ClientCertEnabled
                    Enabled = $app.Enabled
                    AvailabilityState = $app.AvailabilityState
                    RuntimeStack = if ($app.SiteConfig.LinuxFxVersion) { $app.SiteConfig.LinuxFxVersion } else { $app.SiteConfig.WindowsFxVersion }
                    Tags = if ($app.Tags) { $app.Tags | ConvertTo-Json -Compress } else { $null }
                })
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_WebApps", "Failed to retrieve web apps from '$($SubscriptionContext.Name)'", $_.Exception)
    }
    
    return $allWebApps
}



function Get-AzureKeyVaultsInternal {
    param(
        [hashtable]$Configuration,
        $SubscriptionContext,
        $Context
    )
    
    Write-MandALog "Discovering Key Vaults in subscription '$($SubscriptionContext.Name)'..." -Level "INFO" -Context $Context
    $allKeyVaults = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $keyVaults = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzKeyVault -ErrorAction Stop
        } -OperationName "GetKeyVaults_$($SubscriptionContext.Name)" -Context $Context
        
        if ($keyVaults) {
            foreach ($kv in $keyVaults) {
                # Get detailed info for each vault
                $kvDetail = Invoke-AzureOperationWithThrottling -Operation {
                    Get-AzKeyVault -VaultName $kv.VaultName -ResourceGroupName $kv.ResourceGroupName -ErrorAction Stop
                } -OperationName "GetKeyVaultDetail_$($kv.VaultName)" -Context $Context
                
                $allKeyVaults.Add([PSCustomObject]@{
                    SubscriptionId = $SubscriptionContext.Id
                    SubscriptionName = $SubscriptionContext.Name
                    VaultName = $kvDetail.VaultName
                    ResourceGroupName = $kvDetail.ResourceGroupName
                    Location = $kvDetail.Location
                    VaultUri = $kvDetail.VaultUri
                    EnabledForDeployment = $kvDetail.EnabledForDeployment
                    EnabledForTemplateDeployment = $kvDetail.EnabledForTemplateDeployment
                    EnabledForDiskEncryption = $kvDetail.EnabledForDiskEncryption
                    EnableSoftDelete = $kvDetail.EnableSoftDelete
                    EnablePurgeProtection = $kvDetail.EnablePurgeProtection
                    Sku = $kvDetail.Sku
                    TenantId = $kvDetail.TenantId
                    Tags = if ($kvDetail.Tags) { $kvDetail.Tags | ConvertTo-Json -Compress } else { $null }
                })
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_KeyVaults", "Failed to retrieve key vaults from '$($SubscriptionContext.Name)'", $_.Exception)
    }
    
    return $allKeyVaults
}


function Get-AzureNSGsInternal {
    param(
        [hashtable]$Configuration,
        $SubscriptionContext,
        $Context
    )
    
    Write-MandALog "Discovering Network Security Groups in subscription '$($SubscriptionContext.Name)'..." -Level "INFO" -Context $Context
    $allNSGs = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $nsgs = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzNetworkSecurityGroup -ErrorAction Stop
        } -OperationName "GetNSGs_$($SubscriptionContext.Name)" -Context $Context
        
        if ($nsgs) {
            foreach ($nsg in $nsgs) {
                $allNSGs.Add([PSCustomObject]@{
                    SubscriptionId = $SubscriptionContext.Id
                    SubscriptionName = $SubscriptionContext.Name
                    Name = $nsg.Name
                    ResourceGroupName = $nsg.ResourceGroupName
                    Location = $nsg.Location
                    SecurityRuleCount = $nsg.SecurityRules.Count
                    DefaultSecurityRuleCount = $nsg.DefaultSecurityRules.Count
                    NetworkInterfaceCount = $nsg.NetworkInterfaces.Count
                    SubnetCount = $nsg.Subnets.Count
                    Tags = if ($nsg.Tags) { $nsg.Tags | ConvertTo-Json -Compress } else { $null }
                })
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_NSGs", "Failed to retrieve NSGs from '$($SubscriptionContext.Name)'", $_.Exception)
    }
    
    return $allNSGs
}



#end of extras

function Get-AzureVMsDataInternal {
    param(
        [hashtable]$Configuration,
        $SubscriptionContext,
        $Context
    )
    
    Write-MandALog "Discovering VMs in subscription '$($SubscriptionContext.Name)'..." -Level "INFO" -Context $Context
    $allVMs = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        $vms = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzVM -Status -ErrorAction Stop
        } -OperationName "GetVMs_$($SubscriptionContext.Name)" -Context $Context
        
        if ($vms) {
            foreach ($vm in $vms) {
                $vmObj = ConvertTo-VMObject -VM $vm -SubscriptionContext $SubscriptionContext -Context $Context
                $allVMs.Add($vmObj)
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_VMs", "Failed to retrieve VMs from '$($SubscriptionContext.Name)'", $_.Exception)
    }
    
    return $allVMs
}

function ConvertTo-VMObject {
    param($VM, $SubscriptionContext, $Context)
    
    # Get IP configurations with throttling
    $ipConfigs = @()
    
    if ($VM.NetworkProfile.NetworkInterfaces) {
        foreach ($nicRef in $VM.NetworkProfile.NetworkInterfaces) {
            try {
                $nic = Invoke-AzureOperationWithThrottling -Operation {
                    Get-AzNetworkInterface -ResourceId $nicRef.Id -ErrorAction Stop
                } -OperationName "GetNIC_$($VM.Name)" -Context $Context
                
                if ($nic.IpConfigurations) {
                    $ipConfigs += $nic.IpConfigurations | Select-Object Name, PrivateIpAddress, 
                        @{N='PublicIpAddressId';E={$_.PublicIpAddress.Id}}, 
                        @{N='SubnetId';E={$_.Subnet.Id}}
                }
            }
            catch {
                $Context.ErrorCollector.AddWarning("Azure_VMs", "Failed to get NIC for VM: $($VM.Name)")
            }
        }
    }
    
    return [PSCustomObject]@{
        SubscriptionId = $SubscriptionContext.Id
        SubscriptionName = $SubscriptionContext.Name
        VMName = $VM.Name
        ResourceGroupName = $VM.ResourceGroupName
        Location = $VM.Location
        VMId = $VM.Id
        VMSize = $VM.HardwareProfile.VmSize
        OSType = $VM.StorageProfile.OsDisk.OsType
        ProvisioningState = $VM.ProvisioningState
        PowerState = ($VM.Statuses | Where-Object Code -like 'PowerState/*' | Select-Object -ExpandProperty DisplayStatus -First 1)
        Tags = if ($VM.Tags) { $VM.Tags | ConvertTo-Json -Compress } else { $null }
        IPConfigurations = if ($ipConfigs) { $ipConfigs | ConvertTo-Json -Compress -Depth 3 } else { $null }
    }
}

function Get-AzureADApplicationsInternal {
    param(
        [hashtable]$Configuration,
        [string]$TenantId,
        $Context
    )
    
    Write-MandALog "Discovering Azure AD Applications in tenant '$TenantId'..." -Level "INFO" -Context $Context
    
    $result = @{
        Applications = [System.Collections.Generic.List[PSObject]]::new()
        Owners = [System.Collections.Generic.List[PSObject]]::new()
    }
    
    try {
        # Get applications with pagination support
        $skip = 0
        $batchSize = 1000
        $hasMore = $true
        
        while ($hasMore) {
            $apps = Invoke-AzureOperationWithThrottling -Operation {
                Get-AzADApplication -First $batchSize -Skip $skip -ErrorAction Stop
            } -OperationName "GetADApplications_$skip" -Context $Context
            
            if ($apps -and $apps.Count -gt 0) {
                foreach ($app in $apps) {
                    $appObj = ConvertTo-ADApplicationObject -Application $app -TenantId $TenantId
                    $result.Applications.Add($appObj)
                    
                    # Get owners
                    Process-ADApplicationOwners -Application $app -OwnersList $result.Owners -Context $Context
                }
                
                $skip += $apps.Count
                $hasMore = ($apps.Count -eq $batchSize)
            }
            else {
                $hasMore = $false
            }
        }
        
        Write-MandALog "Discovered $($result.Applications.Count) AD Applications" -Level "INFO" -Context $Context
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_ADApplications", "Failed to retrieve AD applications", $_.Exception)
    }
    
    return $result
}

function ConvertTo-ADApplicationObject {
    param($Application, [string]$TenantId)
    
    return [PSCustomObject]@{
        TenantId = $TenantId
        ApplicationId = $Application.AppId
        ObjectId = $Application.Id
        DisplayName = $Application.DisplayName
        SignInAudience = $Application.SignInAudience
        CreatedDateTime = $Application.CreatedDateTime
        IdentifierUris = if ($Application.IdentifierUris) { $Application.IdentifierUris -join ';' } else { $null }
        PublisherDomain = $Application.PublisherDomain
        IsDeviceOnlyAuthSupported = $Application.IsDeviceOnlyAuthSupported
    }
}

function Process-ADApplicationOwners {
    param($Application, $OwnersList, $Context)
    
    try {
        $owners = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzADAppOwner -ApplicationObjectId $Application.Id -ErrorAction Stop
        } -OperationName "GetAppOwners_$($Application.DisplayName)" -Context $Context
        
        if ($owners) {
            foreach ($owner in $owners) {
                $OwnersList.Add([PSCustomObject]@{
                    ApplicationObjectId = $Application.Id
                    ApplicationDisplayName = $Application.DisplayName
                    OwnerObjectId = $owner.Id
                    OwnerType = $owner.GetType().Name
                    OwnerDisplayName = $owner.DisplayName
                    OwnerUserPrincipalName = if ($owner.PSObject.Properties['UserPrincipalName']) { $owner.UserPrincipalName } else { $null }
                })
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("Azure_ADApplications", "Failed to get owners for app: $($Application.DisplayName)")
    }
}

function Get-AzureServicePrincipalsInternal {
    param(
        [hashtable]$Configuration,
        [string]$TenantId,
        $Context
    )
    
    Write-MandALog "Discovering Azure Service Principals in tenant '$TenantId'..." -Level "INFO" -Context $Context
    
    $result = @{
        ServicePrincipals = [System.Collections.Generic.List[PSObject]]::new()
        Owners = [System.Collections.Generic.List[PSObject]]::new()
    }
    
    try {
        # Get service principals with pagination
        $skip = 0
        $batchSize = 1000
        $hasMore = $true
        
        while ($hasMore) {
            $sps = Invoke-AzureOperationWithThrottling -Operation {
                Get-AzADServicePrincipal -First $batchSize -Skip $skip -ErrorAction Stop
            } -OperationName "GetServicePrincipals_$skip" -Context $Context
            
            if ($sps -and $sps.Count -gt 0) {
                foreach ($sp in $sps) {
                    $spObj = ConvertTo-ServicePrincipalObject -ServicePrincipal $sp -TenantId $TenantId
                    $result.ServicePrincipals.Add($spObj)
                    
                    # Get owners
                    Process-ServicePrincipalOwners -ServicePrincipal $sp -OwnersList $result.Owners -Context $Context
                }
                
                $skip += $sps.Count
                $hasMore = ($sps.Count -eq $batchSize)
            }
            else {
                $hasMore = $false
            }
        }
        
        Write-MandALog "Discovered $($result.ServicePrincipals.Count) Service Principals" -Level "INFO" -Context $Context
    }
    catch {
        $Context.ErrorCollector.AddError("Azure_ServicePrincipals", "Failed to retrieve service principals", $_.Exception)
    }
    
    return $result
}

function ConvertTo-ServicePrincipalObject {
    param($ServicePrincipal, [string]$TenantId)
    
    return [PSCustomObject]@{
        TenantId = $TenantId
        ServicePrincipalId = $ServicePrincipal.Id
        ApplicationId = $ServicePrincipal.AppId
        DisplayName = $ServicePrincipal.DisplayName
        ServicePrincipalType = $ServicePrincipal.ServicePrincipalType
        AccountEnabled = $ServicePrincipal.AccountEnabled
        AppOwnerOrganizationId = $ServicePrincipal.AppOwnerOrganizationId
        CreatedDateTime = $ServicePrincipal.CreatedDateTime
    }
}

function Process-ServicePrincipalOwners {
    param($ServicePrincipal, $OwnersList, $Context)
    
    try {
        $owners = Invoke-AzureOperationWithThrottling -Operation {
            Get-AzADServicePrincipalOwner -ServicePrincipalObjectId $ServicePrincipal.Id -ErrorAction Stop
        } -OperationName "GetSPOwners_$($ServicePrincipal.DisplayName)" -Context $Context
        
        if ($owners) {
            foreach ($owner in $owners) {
                $OwnersList.Add([PSCustomObject]@{
                    ServicePrincipalObjectId = $ServicePrincipal.Id
                    ServicePrincipalDisplayName = $ServicePrincipal.DisplayName
                    OwnerObjectId = $owner.Id
                    OwnerType = $owner.GetType().Name
                    OwnerDisplayName = $owner.DisplayName
                    OwnerUserPrincipalName = if ($owner.PSObject.Properties['UserPrincipalName']) { $owner.UserPrincipalName } else { $null }
                })
            }
        }
    }
    catch {
        $Context.ErrorCollector.AddWarning("Azure_ServicePrincipals", "Failed to get owners for SP: $($ServicePrincipal.DisplayName)")
    }
}

function Export-AzureDiscoveryData {
    param($DiscoveredData, $Context)
    
    $outputPath = $Context.Paths.RawDataOutput
    
    foreach ($key in $DiscoveredData.Keys) {
        $dataList = $DiscoveredData[$key]
        
        if ($dataList -and $dataList.Count -gt 0) {
            $fileName = "Azure$key.csv"
            $filePath = Join-Path $outputPath $fileName
            
            Export-DataToCSV -Data $dataList -FilePath $filePath -Context $Context
            Write-MandALog "Exported $($dataList.Count) items for Azure $key" -Level "SUCCESS" -Context $Context
        }
    }
}

# Export module members
Export-ModuleMember -Function @('Invoke-AzureDiscovery')
