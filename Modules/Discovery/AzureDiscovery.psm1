# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Azure Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Azure subscriptions, resources, and Azure AD information using 
    Microsoft Graph and Azure Resource Manager APIs
.NOTES
    Version: 3.1.0 (Fixed)
    Author: M&A Discovery Team
    Last Modified: 2025-06-11
    Architecture: New thread-safe session-based authentication
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)
        
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Get Graph connection from $Connections
        $graphConnection = $Connections["Graph"]
        $azureConnection = $Connections["Azure"] # Azure connection might be null if not connected
        
        # STEP 1: PERFORM DISCOVERY
        Write-ModuleLog -ModuleName "Azure" -Message "Starting data discovery" -Level "HEADER"
        
        # Get Organization and Tenant Information
        try {
            Write-ModuleLog -ModuleName "Azure" -Message "Discovering Azure organization and subscription information..." -Level "INFO"
            
            # Get organization details from Graph
            $org = Get-MgOrganization -ErrorAction Stop
            
            if ($org) {
                # Add organization info as Azure tenant information
                $tenantObj = [PSCustomObject]@{
                    TenantId = $org.Id
                    DisplayName = $org.DisplayName
                    VerifiedDomains = ($org.VerifiedDomains | Where-Object { $_.IsVerified } | ForEach-Object { $_.Name }) -join ';'
                    DefaultDomain = ($org.VerifiedDomains | Where-Object { $_.IsDefault } | Select-Object -First 1).Name
                    CountryLetterCode = $org.CountryLetterCode
                    PreferredLanguage = $org.PreferredLanguage
                    TechnicalNotificationMails = ($org.TechnicalNotificationMails -join ';')
                    CreatedDateTime = $org.CreatedDateTime
                    OnPremisesSyncEnabled = $org.OnPremisesSyncEnabled
                    City = $org.City
                    State = $org.State
                    Country = $org.Country
                    PostalCode = $org.PostalCode
                    BusinessPhones = ($org.BusinessPhones -join ';')
                    _ObjectType = 'AzureTenant'
                }
                
                $null = $allDiscoveredData.Add($tenantObj)
                Write-ModuleLog -ModuleName "Azure" -Message "Discovered Azure tenant: $($org.DisplayName)" -Level "SUCCESS"
                
                # Get subscribed SKUs (licenses) from Graph
                $subscribedSkus = Get-MgSubscribedSku -All -ErrorAction Stop
                
                # Filter for Azure-related SKUs
                $azureSkus = $subscribedSkus | Where-Object { 
                    $_.SkuPartNumber -like "*AZURE*" -or 
                    $_.SkuPartNumber -like "*INTUNE*" -or
                    $_.SkuPartNumber -like "*EMS*" -or
                    $_.SkuPartNumber -like "*AAD*" -or
                    $_.SkuPartNumber -like "*DEFENDER*" -or
                    $_.SkuPartNumber -like "*ATP*"
                }
                
                # Create subscription-like records from SKU information
                foreach ($sku in $azureSkus) {
                    $subObj = [PSCustomObject]@{
                        SubscriptionId = $sku.SkuId
                        Name = $sku.SkuPartNumber
                        State = if ($sku.PrepaidUnits.Enabled -gt 0) { "Enabled" } else { "Disabled" }
                        TenantId = $org.Id
                        CapabilityStatus = $sku.CapabilityStatus
                        ConsumedUnits = $sku.ConsumedUnits
                        PrepaidUnitsEnabled = $sku.PrepaidUnits.Enabled
                        PrepaidUnitsSuspended = $sku.PrepaidUnits.Suspended
                        PrepaidUnitsWarning = $sku.PrepaidUnits.Warning
                        AppliesTo = $sku.AppliesTo
                        ServicePlans = ($sku.ServicePlans | ForEach-Object { "$($_.ServicePlanName):$($_.ProvisioningStatus)" }) -join ';'
                        _ObjectType = 'Subscription'
                    }
                    
                    $null = $allDiscoveredData.Add($subObj)
                }
                
                Write-ModuleLog -ModuleName "Azure" -Message "Discovered $($azureSkus.Count) Azure-related subscriptions/SKUs" -Level "SUCCESS"
            }
            
        } catch {
            $Result.AddWarning("Failed to discover subscription information: $($_.Exception.Message)", @{Operation = "GetSubscriptions"})
        }
        
        # Get Azure AD Devices
        try {
            Write-ModuleLog -ModuleName "Azure" -Message "Discovering Azure AD devices..." -Level "INFO"
            
            $deviceUri = "https://graph.microsoft.com/v1.0/devices?`$top=999"
            $devices = Invoke-GraphAPIWithPaging -Uri $deviceUri -ModuleName "Azure"
            
            foreach ($device in $devices) {
                $deviceObj = [PSCustomObject]@{
                    DeviceId = $device.deviceId
                    ObjectId = $device.id
                    DisplayName = $device.displayName
                    OperatingSystem = $device.operatingSystem
                    OperatingSystemVersion = $device.operatingSystemVersion
                    TrustType = $device.trustType
                    ApproximateLastSignInDateTime = $device.approximateLastSignInDateTime
                    IsCompliant = $device.isCompliant
                    IsManaged = $device.isManaged
                    ManagementType = $device.managementType
                    Manufacturer = $device.manufacturer
                    Model = $device.model
                    ProfileType = $device.profileType
                    SystemLabels = ($device.systemLabels -join ';')
                    DeviceOwnership = $device.deviceOwnership
                    EnrollmentType = $device.enrollmentType
                    RegistrationDateTime = $device.registrationDateTime
                    DeviceVersion = $device.deviceVersion
                    PhysicalIds = ($device.physicalIds -join ';')
                    AlternativeSecurityIds = if ($device.alternativeSecurityIds) { $device.alternativeSecurityIds.Count } else { 0 }
                    AccountEnabled = $device.accountEnabled
                    _ObjectType = 'Device'
                }
                
                $null = $allDiscoveredData.Add($deviceObj)
            }
            
            Write-ModuleLog -ModuleName "Azure" -Message "Discovered $($devices.Count) Azure AD devices" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover Azure AD devices: $($_.Exception.Message)", @{Operation = "GetDevices"})
        }
        
        # Get Azure AD Applications
        try {
            Write-ModuleLog -ModuleName "Azure" -Message "Discovering Azure AD applications..." -Level "INFO"
            
            $appUri = "https://graph.microsoft.com/v1.0/applications?`$top=999"
            $apps = Invoke-GraphAPIWithPaging -Uri $appUri -ModuleName "Azure"
            
            $resourceGroups = @{} # Used to simulate resource groups for applications
            foreach ($app in $apps) {
                # Group apps by publisher domain (simulating resource groups)
                $groupName = if ($app.publisherDomain) { $app.publisherDomain } else { "Unknown" }
                
                if (-not $resourceGroups.ContainsKey($groupName)) {
                    $resourceGroups[$groupName] = @{
                        Name = $groupName
                        AppCount = 0
                        Apps = @()
                    }
                }
                
                $resourceGroups[$groupName].AppCount++
                $resourceGroups[$groupName].Apps += $app.displayName
                
                # Create app record
                $appObj = [PSCustomObject]@{
                    ApplicationId = $app.id
                    AppId = $app.appId
                    DisplayName = $app.displayName
                    PublisherDomain = $app.publisherDomain
                    SignInAudience = $app.signInAudience
                    CreatedDateTime = $app.createdDateTime
                    Description = $app.description
                    GroupName = $groupName
                    IdentifierUris = ($app.identifierUris -join ';')
                    Tags = ($app.tags -join ';')
                    AppRoleCount = if ($app.appRoles) { $app.appRoles.Count } else { 0 }
                    Oauth2PermissionCount = if ($app.api -and $app.api.oauth2PermissionScopes) { 
                        $app.api.oauth2PermissionScopes.Count 
                    } else { 0 }
                    KeyCredentialCount = if ($app.keyCredentials) { $app.keyCredentials.Count } else { 0 }
                    PasswordCredentialCount = if ($app.passwordCredentials) { $app.passwordCredentials.Count } else { 0 }
                    RequiredResourceAccess = if ($app.requiredResourceAccess) { 
                        ($app.requiredResourceAccess | ForEach-Object { $_.resourceAppId }) -join ';' 
                    } else { $null }
                    _ObjectType = 'Application'
                }
                
                $null = $allDiscoveredData.Add($appObj)
            }
            
            # Create resource group-like records
            foreach ($rgName in $resourceGroups.Keys) {
                $rg = $resourceGroups[$rgName]
                
                $rgObj = [PSCustomObject]@{
                    ResourceGroupName = $rgName
                    Location = "global"
                    ProvisioningState = "Succeeded"
                    ResourceCount = $rg.AppCount
                    ResourceTypes = "Applications"
                    Tags = $null
                    _ObjectType = 'ResourceGroup'
                }
                
                $null = $allDiscoveredData.Add($rgObj)
            }
            
            Write-ModuleLog -ModuleName "Azure" -Message "Discovered $($apps.Count) applications in $($resourceGroups.Count) groups" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover applications: $($_.Exception.Message)", @{Operation = "GetApplications"})
        }
        
        # Get Conditional Access Policies
        try {
            Write-ModuleLog -ModuleName "Azure" -Message "Discovering conditional access policies..." -Level "INFO"
            
            $caUri = "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies"
            $policies = Invoke-GraphAPIWithPaging -Uri $caUri -ModuleName "Azure"
            
            foreach ($policy in $policies) {
                $policyObj = [PSCustomObject]@{
                    PolicyId = $policy.id
                    DisplayName = $policy.displayName
                    State = $policy.state
                    CreatedDateTime = $policy.createdDateTime
                    ModifiedDateTime = $policy.modifiedDateTime
                    IncludeUsers = if ($policy.conditions.users.includeUsers) { 
                        ($policy.conditions.users.includeUsers -join ';') 
                    } else { $null }
                    ExcludeUsers = if ($policy.conditions.users.excludeUsers) { 
                        ($policy.conditions.users.excludeUsers -join ';') 
                    } else { $null }
                    IncludeGroups = if ($policy.conditions.users.includeGroups) { 
                        ($policy.conditions.users.includeGroups -join ';') 
                    } else { $null }
                    ExcludeGroups = if ($policy.conditions.users.excludeGroups) { 
                        ($policy.conditions.users.excludeGroups -join ';') 
                    } else { $null }
                    IncludeApplications = if ($policy.conditions.applications.includeApplications) { 
                        ($policy.conditions.applications.includeApplications -join ';') 
                    } else { $null }
                    ExcludeApplications = if ($policy.conditions.applications.excludeApplications) { 
                        ($policy.conditions.applications.excludeApplications -join ';') 
                    } else { $null }
                    GrantControls = if ($policy.grantControls.builtInControls) { 
                        ($policy.grantControls.builtInControls -join ';') 
                    } else { $null }
                    SessionControls = if ($policy.sessionControls) { 
                        $policy.sessionControls.PSObject.Properties.Name -join ';' 
                    } else { $null }
                    _ObjectType = 'ConditionalAccessPolicy'
                }
                
                $null = $allDiscoveredData.Add($policyObj)
            }
            
            Write-ModuleLog -ModuleName "Azure" -Message "Discovered $($policies.Count) conditional access policies" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover conditional access policies: $($_.Exception.Message)", @{Operation = "GetConditionalAccessPolicies"})
        }
        
        # Try to get Azure Resource Manager data if connected
        if ($azureConnection) {
            try {
                Write-ModuleLog -ModuleName "Azure" -Message "Discovering Azure resources..." -Level "INFO"
                
                # Get subscriptions
                $subscriptions = Get-AzSubscription -ErrorAction Stop
                
                foreach ($sub in $subscriptions) {
                    # Set context to subscription
                    Set-AzContext -SubscriptionId $sub.Id -ErrorAction Stop | Out-Null
                    
                    # Get resource groups
                    $resourceGroups = Get-AzResourceGroup -ErrorAction Stop
                    
                    foreach ($rg in $resourceGroups) {
                        $rgObj = [PSCustomObject]@{
                            SubscriptionId = $sub.Id
                            SubscriptionName = $sub.Name
                            ResourceGroupName = $rg.ResourceGroupName
                            Location = $rg.Location
                            ProvisioningState = $rg.ProvisioningState
                            Tags = if ($rg.Tags) { ($rg.Tags.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ';' } else { $null }
                            ResourceId = $rg.ResourceId
                            _ObjectType = 'AzureResourceGroup'
                        }
                        
                        $null = $allDiscoveredData.Add($rgObj)
                    }
                    
                    Write-ModuleLog -ModuleName "Azure" -Message "Discovered $($resourceGroups.Count) resource groups in subscription $($sub.Name)" -Level "SUCCESS"
                }
                
            } catch {
                $Result.AddWarning("Failed to discover Azure resources: $($_.Exception.Message)", @{Operation = "GetAzureResources"})
            }
        }
        
        # Export data
        if ($allDiscoveredData.Count -gt 0) {
            Write-ModuleLog -ModuleName "Azure" -Message "Exporting $($allDiscoveredData.Count) records..." -Level "INFO"
            
            # Group by object type and export to separate files
            $objectGroups = $allDiscoveredData | Group-Object -Property _ObjectType
            
            foreach ($group in $objectGroups) {
                $objectType = $group.Name
                $data = $group.Group
                
                # Map object types to file names
                $fileName = switch ($objectType) {
                    'Subscription' { 'AzureSubscriptions.csv' }
                    'ResourceGroup' { 'AzureResourceGroups.csv' }
                    'AzureResourceGroup' { 'AzureResourceGroups.csv' }
                    'Device' { 'AzureADDevices.csv' }
                    'AzureTenant' { 'AzureTenant.csv' }
                    'Application' { 'AzureApplications.csv' }
                    'ConditionalAccessPolicy' { 'AzureConditionalAccess.csv' }
                    default { "Azure_$objectType.csv" }
                }
                
                Export-DiscoveryResults -Data $data `
                    -FileName $fileName `
                    -OutputPath $Context.Paths.RawDataOutput `
                    -ModuleName "Azure" `
                    -SessionId $SessionId
            }
        } else {
            Write-ModuleLog -ModuleName "Azure" -Message "No data discovered to export" -Level "WARN"
        }
        
        return $allDiscoveredData
    }
    
    # Execute using base module
    return Start-DiscoveryModule -ModuleName "Azure" `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @('Graph', 'Azure') `
        -DiscoveryScript $discoveryScript
}

Export-ModuleMember -Function Invoke-AzureDiscovery