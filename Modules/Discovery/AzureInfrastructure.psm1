# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 2.0.0
# Created: 2025-08-03
# Last Modified: 2025-08-03

<#
.SYNOPSIS
    Comprehensive Azure Infrastructure Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Performs deep Azure infrastructure discovery inspired by AzureHound methodology.
    Extracts maximum data for user migration and infrastructure assessment including:
    - Azure AD Users with full attributes for migration planning
    - Virtual Machines with configurations
    - Network Security Groups and rules
    - Load Balancers and configurations
    - Storage Accounts with access policies
    - Key Vaults with access policies
    - Azure Database for MySQL flexible servers
    - Network infrastructure
    - RBAC assignments
.NOTES
    Version: 2.0.0
    Author: System Enhancement
    Created: 2025-08-03
    Requires: PowerShell 5.1+, Az modules, Microsoft.Graph modules
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureInfrastructure {
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
        
        # Get connections
        $graphConnection = $Connections["Graph"]
        $azureConnection = $null
        
        try {
            # Try to get Azure connection
            if ($Connections.ContainsKey("Azure")) {
                $azureConnection = $Connections["Azure"]
            } else {
                # Try to connect to Azure using Graph credentials
                $azureConnection = Connect-AzAccount -AccessToken $graphConnection.AccessToken -AccountId $graphConnection.Account -Tenant $Configuration.azure.tenantId -WarningAction SilentlyContinue
            }
        } catch {
            $Result.AddWarning("Could not establish Azure connection, will use Graph API where possible", @{Error=$_.Exception.Message})
        }
        
        #region User Discovery - Foundation for Migration Planning
        Write-DiscoveryProgress -Activity "Discovering Azure AD Users" -Status "Extracting comprehensive user data..."
        
        try {
            # Get all users with expanded properties for migration planning
            $users = @()
            $userUri = "https://graph.microsoft.com/v1.0/users?`$select=*&`$expand=manager,memberOf,ownedDevices,registeredDevices,licenseDetails,authentication"
            
            do {
                $response = Invoke-MgGraphRequest -Uri $userUri -Method GET
                $users += $response.value
                $userUri = $response.'@odata.nextLink'
            } while ($userUri)
            
            foreach ($user in $users) {
                # Get additional user details
                $userId = $user.id
                
                # Get user's group memberships
                $groupMemberships = @()
                try {
                    $groupsUri = "https://graph.microsoft.com/v1.0/users/$userId/memberOf"
                    $groupsResponse = Invoke-MgGraphRequest -Uri $groupsUri -Method GET
                    $groupMemberships = $groupsResponse.value | Where-Object { $_.'@odata.type' -eq '#microsoft.graph.group' }
                } catch {}
                
                # Get user's app role assignments
                $appRoleAssignments = @()
                try {
                    $appRolesUri = "https://graph.microsoft.com/v1.0/users/$userId/appRoleAssignments"
                    $appRolesResponse = Invoke-MgGraphRequest -Uri $appRolesUri -Method GET
                    $appRoleAssignments = $appRolesResponse.value
                } catch {}
                
                # Get authentication methods
                $authMethods = @()
                try {
                    $authUri = "https://graph.microsoft.com/v1.0/users/$userId/authentication/methods"
                    $authResponse = Invoke-MgGraphRequest -Uri $authUri -Method GET
                    $authMethods = $authResponse.value
                } catch {}
                
                # Create comprehensive user object
                $userData = [PSCustomObject]@{
                    ObjectType = "AzureADUser"
                    Id = $user.id
                    UserPrincipalName = $user.userPrincipalName
                    DisplayName = $user.displayName
                    GivenName = $user.givenName
                    Surname = $user.surname
                    Mail = $user.mail
                    OtherMails = ($user.otherMails -join '; ')
                    ProxyAddresses = ($user.proxyAddresses -join '; ')
                    AccountEnabled = $user.accountEnabled
                    UserType = $user.userType
                    CreationType = $user.creationType
                    CreatedDateTime = $user.createdDateTime
                    LastSignInDateTime = $user.signInActivity.lastSignInDateTime
                    JobTitle = $user.jobTitle
                    Department = $user.department
                    CompanyName = $user.companyName
                    OfficeLocation = $user.officeLocation
                    StreetAddress = $user.streetAddress
                    City = $user.city
                    State = $user.state
                    Country = $user.country
                    PostalCode = $user.postalCode
                    MobilePhone = $user.mobilePhone
                    BusinessPhones = ($user.businessPhones -join '; ')
                    EmployeeId = $user.employeeId
                    EmployeeType = $user.employeeType
                    OnPremisesSamAccountName = $user.onPremisesSamAccountName
                    OnPremisesDistinguishedName = $user.onPremisesDistinguishedName
                    OnPremisesUserPrincipalName = $user.onPremisesUserPrincipalName
                    OnPremisesSyncEnabled = $user.onPremisesSyncEnabled
                    OnPremisesLastSyncDateTime = $user.onPremisesLastSyncDateTime
                    PreferredLanguage = $user.preferredLanguage
                    UsageLocation = $user.usageLocation
                    ManagerId = $user.manager.id
                    ManagerDisplayName = $user.manager.displayName
                    GroupMembershipCount = $groupMemberships.Count
                    GroupMemberships = ($groupMemberships | ForEach-Object { $_.displayName }) -join '; '
                    AppRoleAssignmentCount = $appRoleAssignments.Count
                    AuthenticationMethodCount = $authMethods.Count
                    AuthenticationMethods = ($authMethods | ForEach-Object { $_.'@odata.type' -replace '#microsoft.graph.', '' }) -join '; '
                    AssignedLicenses = ($user.assignedLicenses | ForEach-Object { $_.skuId }) -join '; '
                    _DataType = 'Users'
                    SessionId = $SessionId
                }
                $null = $allDiscoveredData.Add($userData)
            }
            
            $Result.Metadata["UserCount"] = $users.Count
            Write-DiscoveryProgress -Activity "User Discovery" -Status "Discovered $($users.Count) users"
            
        } catch {
            $Result.AddError("Failed to discover users: $($_.Exception.Message)", $_.Exception, @{Section="Users"})
        }
        #endregion
        
        #region Azure Subscription Discovery
        if ($azureConnection) {
            Write-DiscoveryProgress -Activity "Discovering Azure Subscriptions" -Status "Enumerating subscriptions..."
            
            try {
                $subscriptions = Get-AzSubscription
                
                foreach ($sub in $subscriptions) {
                    Set-AzContext -SubscriptionId $sub.Id | Out-Null
                    
                    $subData = [PSCustomObject]@{
                        ObjectType = "AzureSubscription"
                        SubscriptionId = $sub.Id
                        SubscriptionName = $sub.Name
                        State = $sub.State
                        TenantId = $sub.TenantId
                        _DataType = 'Subscriptions'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($subData)
                    
                    #region Virtual Machines
                    Write-DiscoveryProgress -Activity "Discovering Virtual Machines" -Status "Processing subscription: $($sub.Name)"
                    
                    try {
                        $vms = Get-AzVM -Status
                        
                        foreach ($vm in $vms) {
                            # Get VM network interfaces
                            $nicDetails = @()
                            foreach ($nicRef in $vm.NetworkProfile.NetworkInterfaces) {
                                $nic = Get-AzNetworkInterface -ResourceId $nicRef.Id
                                $nicDetails += @{
                                    Name = $nic.Name
                                    PrivateIpAddress = $nic.IpConfigurations[0].PrivateIpAddress
                                    PublicIpAddress = if ($nic.IpConfigurations[0].PublicIpAddress) {
                                        (Get-AzPublicIpAddress -ResourceId $nic.IpConfigurations[0].PublicIpAddress.Id).IpAddress
                                    } else { $null }
                                }
                            }
                            
                            $vmData = [PSCustomObject]@{
                                ObjectType = "AzureVM"
                                SubscriptionId = $sub.Id
                                ResourceGroup = $vm.ResourceGroupName
                                VMName = $vm.Name
                                Location = $vm.Location
                                VMSize = $vm.HardwareProfile.VmSize
                                OSType = $vm.StorageProfile.OsDisk.OsType
                                OSPublisher = $vm.StorageProfile.ImageReference.Publisher
                                OSOffer = $vm.StorageProfile.ImageReference.Offer
                                OSSku = $vm.StorageProfile.ImageReference.Sku
                                OSVersion = $vm.StorageProfile.ImageReference.Version
                                ProvisioningState = $vm.ProvisioningState
                                PowerState = ($vm.PowerState -split '/')[-1]
                                LicenseType = $vm.LicenseType
                                AvailabilitySetId = $vm.AvailabilitySetReference.Id
                                VmId = $vm.VmId
                                NetworkInterfaces = ($nicDetails | ConvertTo-Json -Compress)
                                DataDiskCount = $vm.StorageProfile.DataDisks.Count
                                Tags = ($vm.Tags | ConvertTo-Json -Compress)
                                _DataType = 'VirtualMachines'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($vmData)
                        }
                        
                        $Result.Metadata["VM_$($sub.Name)"] = $vms.Count
                        
                    } catch {
                        $Result.AddWarning("Failed to discover VMs in subscription $($sub.Name): $($_.Exception.Message)", @{Subscription=$sub.Name})
                    }
                    #endregion
                    
                    #region Network Security Groups
                    Write-DiscoveryProgress -Activity "Discovering Network Security Groups" -Status "Processing subscription: $($sub.Name)"
                    
                    try {
                        $nsgs = Get-AzNetworkSecurityGroup
                        
                        foreach ($nsg in $nsgs) {
                            # Extract security rules
                            $inboundRules = @()
                            $outboundRules = @()
                            
                            foreach ($rule in $nsg.SecurityRules) {
                                $ruleData = @{
                                    Name = $rule.Name
                                    Priority = $rule.Priority
                                    Direction = $rule.Direction
                                    Access = $rule.Access
                                    Protocol = $rule.Protocol
                                    SourcePortRange = ($rule.SourcePortRange -join ',')
                                    DestinationPortRange = ($rule.DestinationPortRange -join ',')
                                    SourceAddressPrefix = ($rule.SourceAddressPrefix -join ',')
                                    DestinationAddressPrefix = ($rule.DestinationAddressPrefix -join ',')
                                }
                                
                                if ($rule.Direction -eq 'Inbound') {
                                    $inboundRules += $ruleData
                                } else {
                                    $outboundRules += $ruleData
                                }
                            }
                            
                            $nsgData = [PSCustomObject]@{
                                ObjectType = "AzureNSG"
                                SubscriptionId = $sub.Id
                                ResourceGroup = $nsg.ResourceGroupName
                                NSGName = $nsg.Name
                                Location = $nsg.Location
                                ProvisioningState = $nsg.ProvisioningState
                                InboundRuleCount = $inboundRules.Count
                                OutboundRuleCount = $outboundRules.Count
                                InboundRules = ($inboundRules | ConvertTo-Json -Compress)
                                OutboundRules = ($outboundRules | ConvertTo-Json -Compress)
                                NetworkInterfaceCount = $nsg.NetworkInterfaces.Count
                                SubnetCount = $nsg.Subnets.Count
                                Tags = ($nsg.Tags | ConvertTo-Json -Compress)
                                _DataType = 'NetworkSecurityGroups'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($nsgData)
                        }
                        
                        $Result.Metadata["NSG_$($sub.Name)"] = $nsgs.Count
                        
                    } catch {
                        $Result.AddWarning("Failed to discover NSGs in subscription $($sub.Name): $($_.Exception.Message)", @{Subscription=$sub.Name})
                    }
                    #endregion
                    
                    #region Load Balancers
                    Write-DiscoveryProgress -Activity "Discovering Load Balancers" -Status "Processing subscription: $($sub.Name)"
                    
                    try {
                        $loadBalancers = Get-AzLoadBalancer
                        
                        foreach ($lb in $loadBalancers) {
                            $lbData = [PSCustomObject]@{
                                ObjectType = "AzureLoadBalancer"
                                SubscriptionId = $sub.Id
                                ResourceGroup = $lb.ResourceGroupName
                                LoadBalancerName = $lb.Name
                                Location = $lb.Location
                                Sku = $lb.Sku.Name
                                Type = if ($lb.FrontendIpConfigurations[0].PublicIpAddress) { "Public" } else { "Internal" }
                                ProvisioningState = $lb.ProvisioningState
                                FrontendIPCount = $lb.FrontendIpConfigurations.Count
                                BackendPoolCount = $lb.BackendAddressPools.Count
                                LoadBalancingRuleCount = $lb.LoadBalancingRules.Count
                                ProbeCount = $lb.Probes.Count
                                InboundNatRuleCount = $lb.InboundNatRules.Count
                                OutboundRuleCount = $lb.OutboundRules.Count
                                Tags = ($lb.Tags | ConvertTo-Json -Compress)
                                _DataType = 'LoadBalancers'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($lbData)
                        }
                        
                        $Result.Metadata["LB_$($sub.Name)"] = $loadBalancers.Count
                        
                    } catch {
                        $Result.AddWarning("Failed to discover Load Balancers in subscription $($sub.Name): $($_.Exception.Message)", @{Subscription=$sub.Name})
                    }
                    #endregion
                    
                    #region Storage Accounts
                    Write-DiscoveryProgress -Activity "Discovering Storage Accounts" -Status "Processing subscription: $($sub.Name)"
                    
                    try {
                        $storageAccounts = Get-AzStorageAccount
                        
                        foreach ($sa in $storageAccounts) {
                            # Get storage account keys and access policies
                            $keys = Get-AzStorageAccountKey -ResourceGroupName $sa.ResourceGroupName -Name $sa.StorageAccountName
                            
                            $saData = [PSCustomObject]@{
                                ObjectType = "AzureStorageAccount"
                                SubscriptionId = $sub.Id
                                ResourceGroup = $sa.ResourceGroupName
                                StorageAccountName = $sa.StorageAccountName
                                Location = $sa.Location
                                SkuName = $sa.Sku.Name
                                Kind = $sa.Kind
                                AccessTier = $sa.AccessTier
                                CreationTime = $sa.CreationTime
                                ProvisioningState = $sa.ProvisioningState
                                StatusPrimary = $sa.StatusOfPrimary
                                StatusSecondary = $sa.StatusOfSecondary
                                EnableHttpsTrafficOnly = $sa.EnableHttpsTrafficOnly
                                MinimumTlsVersion = $sa.MinimumTlsVersion
                                AllowBlobPublicAccess = $sa.AllowBlobPublicAccess
                                NetworkRuleSet = ($sa.NetworkRuleSet | ConvertTo-Json -Compress)
                                BlobServiceEnabled = $sa.PrimaryEndpoints.Blob -ne $null
                                FileServiceEnabled = $sa.PrimaryEndpoints.File -ne $null
                                QueueServiceEnabled = $sa.PrimaryEndpoints.Queue -ne $null
                                TableServiceEnabled = $sa.PrimaryEndpoints.Table -ne $null
                                Tags = ($sa.Tags | ConvertTo-Json -Compress)
                                _DataType = 'StorageAccounts'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($saData)
                        }
                        
                        $Result.Metadata["Storage_$($sub.Name)"] = $storageAccounts.Count
                        
                    } catch {
                        $Result.AddWarning("Failed to discover Storage Accounts in subscription $($sub.Name): $($_.Exception.Message)", @{Subscription=$sub.Name})
                    }
                    #endregion
                    
                    #region Key Vaults
                    Write-DiscoveryProgress -Activity "Discovering Key Vaults" -Status "Processing subscription: $($sub.Name)"
                    
                    try {
                        $keyVaults = Get-AzKeyVault
                        
                        foreach ($kv in $keyVaults) {
                            # Get detailed key vault info
                            $kvDetail = Get-AzKeyVault -VaultName $kv.VaultName -ResourceGroupName $kv.ResourceGroupName
                            
                            # Get access policies
                            $accessPolicies = @()
                            foreach ($policy in $kvDetail.AccessPolicies) {
                                $accessPolicies += @{
                                    TenantId = $policy.TenantId
                                    ObjectId = $policy.ObjectId
                                    ApplicationId = $policy.ApplicationId
                                    PermissionsToKeys = ($policy.PermissionsToKeys -join ',')
                                    PermissionsToSecrets = ($policy.PermissionsToSecrets -join ',')
                                    PermissionsToCertificates = ($policy.PermissionsToCertificates -join ',')
                                }
                            }
                            
                            $kvData = [PSCustomObject]@{
                                ObjectType = "AzureKeyVault"
                                SubscriptionId = $sub.Id
                                ResourceGroup = $kv.ResourceGroupName
                                VaultName = $kv.VaultName
                                Location = $kv.Location
                                VaultUri = $kvDetail.VaultUri
                                TenantId = $kvDetail.TenantId
                                Sku = $kvDetail.Sku
                                EnabledForDeployment = $kvDetail.EnabledForDeployment
                                EnabledForDiskEncryption = $kvDetail.EnabledForDiskEncryption
                                EnabledForTemplateDeployment = $kvDetail.EnabledForTemplateDeployment
                                EnableSoftDelete = $kvDetail.EnableSoftDelete
                                SoftDeleteRetentionInDays = $kvDetail.SoftDeleteRetentionInDays
                                EnableRbacAuthorization = $kvDetail.EnableRbacAuthorization
                                EnablePurgeProtection = $kvDetail.EnablePurgeProtection
                                AccessPolicyCount = $accessPolicies.Count
                                AccessPolicies = ($accessPolicies | ConvertTo-Json -Compress)
                                NetworkRuleSet = ($kvDetail.NetworkAcls | ConvertTo-Json -Compress)
                                Tags = ($kv.Tags | ConvertTo-Json -Compress)
                                _DataType = 'KeyVaults'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($kvData)
                        }
                        
                        $Result.Metadata["KeyVault_$($sub.Name)"] = $keyVaults.Count
                        
                    } catch {
                        $Result.AddWarning("Failed to discover Key Vaults in subscription $($sub.Name): $($_.Exception.Message)", @{Subscription=$sub.Name})
                    }
                    #endregion
                    
                    #region Azure Database for MySQL Flexible Servers
                    Write-DiscoveryProgress -Activity "Discovering MySQL Flexible Servers" -Status "Processing subscription: $($sub.Name)"
                    
                    try {
                        # Get MySQL flexible servers
                        $mySqlServers = Get-AzResource -ResourceType "Microsoft.DBforMySQL/flexibleServers" -ExpandProperties
                        
                        foreach ($mysql in $mySqlServers) {
                            $mysqlData = [PSCustomObject]@{
                                ObjectType = "AzureMySQLFlexible"
                                SubscriptionId = $sub.Id
                                ResourceGroup = $mysql.ResourceGroupName
                                ServerName = $mysql.Name
                                Location = $mysql.Location
                                Version = $mysql.Properties.version
                                State = $mysql.Properties.state
                                SkuName = $mysql.Properties.sku.name
                                SkuTier = $mysql.Properties.sku.tier
                                StorageSizeGB = $mysql.Properties.storage.storageSizeGB
                                BackupRetentionDays = $mysql.Properties.backup.backupRetentionDays
                                GeoRedundantBackup = $mysql.Properties.backup.geoRedundantBackup
                                HighAvailabilityMode = $mysql.Properties.highAvailability.mode
                                HighAvailabilityState = $mysql.Properties.highAvailability.state
                                PublicNetworkAccess = $mysql.Properties.publicNetworkAccess
                                SslEnforcement = $mysql.Properties.sslEnforcement
                                MinimalTlsVersion = $mysql.Properties.minimalTlsVersion
                                AdministratorLogin = $mysql.Properties.administratorLogin
                                FullyQualifiedDomainName = $mysql.Properties.fullyQualifiedDomainName
                                Tags = ($mysql.Tags | ConvertTo-Json -Compress)
                                _DataType = 'MySQLFlexibleServers'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($mysqlData)
                        }
                        
                        $Result.Metadata["MySQL_$($sub.Name)"] = $mySqlServers.Count
                        
                    } catch {
                        $Result.AddWarning("Failed to discover MySQL Flexible Servers in subscription $($sub.Name): $($_.Exception.Message)", @{Subscription=$sub.Name})
                    }
                    #endregion
                    
                    #region RBAC Role Assignments
                    Write-DiscoveryProgress -Activity "Discovering RBAC Assignments" -Status "Processing subscription: $($sub.Name)"
                    
                    try {
                        $roleAssignments = Get-AzRoleAssignment
                        
                        foreach ($ra in $roleAssignments) {
                            $raData = [PSCustomObject]@{
                                ObjectType = "AzureRBACAssignment"
                                SubscriptionId = $sub.Id
                                RoleAssignmentId = $ra.RoleAssignmentId
                                Scope = $ra.Scope
                                DisplayName = $ra.DisplayName
                                SignInName = $ra.SignInName
                                RoleDefinitionName = $ra.RoleDefinitionName
                                RoleDefinitionId = $ra.RoleDefinitionId
                                ObjectId = $ra.ObjectId
                                ObjectType = $ra.ObjectType
                                CanDelegate = $ra.CanDelegate
                                Description = $ra.Description
                                ConditionVersion = $ra.ConditionVersion
                                Condition = $ra.Condition
                                _DataType = 'RBACAssignments'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($raData)
                        }
                        
                        $Result.Metadata["RBAC_$($sub.Name)"] = $roleAssignments.Count
                        
                    } catch {
                        $Result.AddWarning("Failed to discover RBAC assignments in subscription $($sub.Name): $($_.Exception.Message)", @{Subscription=$sub.Name})
                    }
                    #endregion
                }
                
            } catch {
                $Result.AddError("Failed to enumerate Azure subscriptions: $($_.Exception.Message)", $_.Exception, @{Section="Subscriptions"})
            }
        }
        #endregion
        
        # Store all discovered data
        $Result.RecordCount = $allDiscoveredData.Count
        
        # Return data grouped by type
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    # Execute discovery using the base module
    Start-DiscoveryModule `
        -ModuleName "AzureInfrastructure" `
        -DiscoveryScript $discoveryScript `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredConnections @("Graph") `
        -OptionalConnections @("Azure")
}

# Export the module function
Export-ModuleMember -Function Invoke-AzureInfrastructure