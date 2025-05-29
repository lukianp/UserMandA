<#
.SYNOPSIS
    Azure infrastructure discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers Azure subscriptions, resources, role assignments, and configurations
    Inspired by AzureHound collection methodology
#>

function Invoke-AzureDiscovery {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting Azure infrastructure discovery" -Level "HEADER"
        
        $outputPath = $Configuration.environment.outputPath
        $rawPath = Join-Path $outputPath "Raw"
        
        $discoveryResults = @{}
        
        # Verify Azure connection
        try {
            $context = Get-AzContext -ErrorAction Stop
            if (-not $context) {
                throw "No Azure context found"
            }
            Write-MandALog "Azure connection verified. Tenant: $($context.Tenant.Id)" -Level "SUCCESS"
        } catch {
            Write-MandALog "Azure not connected. Skipping Azure discovery." -Level "WARN"
            return @{}
        }
        
        # Subscriptions
        Write-MandALog "Discovering Azure subscriptions..." -Level "INFO"
        $discoveryResults.Subscriptions = Get-AzureSubscriptions -OutputPath $rawPath -Configuration $Configuration
        
        # Resource Groups
        Write-MandALog "Discovering resource groups..." -Level "INFO"
        $discoveryResults.ResourceGroups = Get-AzureResourceGroups -OutputPath $rawPath -Configuration $Configuration
        
        # Virtual Machines
        Write-MandALog "Discovering virtual machines..." -Level "INFO"
        $discoveryResults.VirtualMachines = Get-AzureVirtualMachines -OutputPath $rawPath -Configuration $Configuration
        
        # Storage Accounts
        Write-MandALog "Discovering storage accounts..." -Level "INFO"
        $discoveryResults.StorageAccounts = Get-AzureStorageAccounts -OutputPath $rawPath -Configuration $Configuration
        
        # Key Vaults
        Write-MandALog "Discovering key vaults..." -Level "INFO"
        $discoveryResults.KeyVaults = Get-AzureKeyVaults -OutputPath $rawPath -Configuration $Configuration
        
        # Role Assignments (RBAC)
        Write-MandALog "Discovering role assignments..." -Level "INFO"
        $discoveryResults.RoleAssignments = Get-AzureRoleAssignments -OutputPath $rawPath -Configuration $Configuration
        
        # Azure AD Applications
        Write-MandALog "Discovering Azure AD applications..." -Level "INFO"
        $discoveryResults.Applications = Get-AzureADApplications -OutputPath $rawPath -Configuration $Configuration
        
        # Service Principals
        Write-MandALog "Discovering service principals..." -Level "INFO"
        $discoveryResults.ServicePrincipals = Get-AzureServicePrincipals -OutputPath $rawPath -Configuration $Configuration
        
        # Managed Identities
        Write-MandALog "Discovering managed identities..." -Level "INFO"
        $discoveryResults.ManagedIdentities = Get-AzureManagedIdentities -OutputPath $rawPath -Configuration $Configuration
        
        # Network Security Groups
        Write-MandALog "Discovering network security groups..." -Level "INFO"
        $discoveryResults.NetworkSecurityGroups = Get-AzureNSGs -OutputPath $rawPath -Configuration $Configuration
        
        Write-MandALog "Azure infrastructure discovery completed successfully" -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "Azure infrastructure discovery failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Get-AzureSubscriptions {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "AzureSubscriptions.csv"
    $subData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Azure subscriptions CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Azure subscriptions..." -Level "INFO"
        
        $subscriptions = Get-AzSubscription
        
        # Apply subscription filter if configured
        if ($Configuration.azure.subscriptionFilter -and $Configuration.azure.subscriptionFilter.Count -gt 0) {
            $subscriptions = $subscriptions | Where-Object { $_.Name -in $Configuration.azure.subscriptionFilter -or $_.Id -in $Configuration.azure.subscriptionFilter }
        }
        
        foreach ($sub in $subscriptions) {
            # Set context to subscription
            Set-AzContext -SubscriptionId $sub.Id -ErrorAction Continue
            
            # Get subscription details
            $subDetails = Get-AzSubscription -SubscriptionId $sub.Id
            
            # Get subscription spending limit
            $spendingLimit = "NotAvailable"
            try {
                $billing = Get-AzBillingAccount -ErrorAction SilentlyContinue
                if ($billing) {
                    $spendingLimit = "Available"
                }
            } catch {
                # Ignore billing API errors
            }
            
            $subData.Add([PSCustomObject]@{
                SubscriptionId = $sub.Id
                SubscriptionName = $sub.Name
                TenantId = $sub.TenantId
                State = $sub.State
                Environment = $sub.ExtendedProperties.Environment
                Account = $sub.ExtendedProperties.Account
                IsDefault = $sub.ExtendedProperties.IsDefault
                RegisteredProviders = (Get-AzResourceProvider -ListAvailable | Where-Object { $_.RegistrationState -eq "Registered" }).Count
                ResourceGroupCount = (Get-AzResourceGroup).Count
                SpendingLimit = $spendingLimit
                Tags = ($subDetails.Tags.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ";"
            })
        }
        
        Write-MandALog "Retrieved $($subData.Count) Azure subscriptions" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $subData -FilePath $outputFile
        
        return $subData
        
    } catch {
        Write-MandALog "Error retrieving Azure subscriptions: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-AzureResourceGroups {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "AzureResourceGroups.csv"
    $rgData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Resource groups CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Azure resource groups..." -Level "INFO"
        
        $subscriptions = Get-AzSubscription
        
        foreach ($sub in $subscriptions) {
            Set-AzContext -SubscriptionId $sub.Id -ErrorAction Continue
            
            $resourceGroups = Get-AzResourceGroup
            
            # Apply resource group filter if configured
            if ($Configuration.azure.resourceGroupFilter -and $Configuration.azure.resourceGroupFilter.Count -gt 0) {
                $resourceGroups = $resourceGroups | Where-Object { $_.ResourceGroupName -in $Configuration.azure.resourceGroupFilter }
            }
            
            foreach ($rg in $resourceGroups) {
                # Get resource count
                $resources = Get-AzResource -ResourceGroupName $rg.ResourceGroupName
                
                # Get locks
                $locks = Get-AzResourceLock -ResourceGroupName $rg.ResourceGroupName -ErrorAction SilentlyContinue
                
                $rgData.Add([PSCustomObject]@{
                    SubscriptionId = $sub.Id
                    SubscriptionName = $sub.Name
                    ResourceGroupName = $rg.ResourceGroupName
                    Location = $rg.Location
                    ResourceId = $rg.ResourceId
                    ProvisioningState = $rg.ProvisioningState
                    ManagedBy = $rg.ManagedBy
                    ResourceCount = $resources.Count
                    HasReadOnlyLock = ($locks | Where-Object { $_.Properties.level -eq "ReadOnly" }).Count -gt 0
                    HasDeleteLock = ($locks | Where-Object { $_.Properties.level -eq "CanNotDelete" }).Count -gt 0
                    Tags = ($rg.Tags.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ";"
                    CreatedTime = if ($rg.Tags.ContainsKey("CreatedTime")) { $rg.Tags["CreatedTime"] } else { "Unknown" }
                })
            }
        }
        
        Write-MandALog "Retrieved $($rgData.Count) resource groups" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $rgData -FilePath $outputFile
        
        return $rgData
        
    } catch {
        Write-MandALog "Error retrieving resource groups: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-AzureVirtualMachines {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "AzureVirtualMachines.csv"
    $vmData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Virtual machines CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Azure virtual machines..." -Level "INFO"
        
        $subscriptions = Get-AzSubscription
        
        foreach ($sub in $subscriptions) {
            Set-AzContext -SubscriptionId $sub.Id -ErrorAction Continue
            
            $vms = Get-AzVM -Status
            
            foreach ($vm in $vms) {
                # Get network interfaces
                $nics = $vm.NetworkProfile.NetworkInterfaces
                $primaryNic = $nics | Where-Object { $_.Primary } | Select-Object -First 1
                $ipAddress = "N/A"
                
                if ($primaryNic) {
                    $nic = Get-AzNetworkInterface -ResourceId $primaryNic.Id -ErrorAction SilentlyContinue
                    if ($nic) {
                        $ipAddress = $nic.IpConfigurations[0].PrivateIpAddress
                    }
                }
                
                # Get managed identity status
                $hasManagedIdentity = $false
                $identityType = "None"
                if ($vm.Identity) {
                    $hasManagedIdentity = $true
                    $identityType = $vm.Identity.Type
                }
                
                $vmData.Add([PSCustomObject]@{
                    SubscriptionId = $sub.Id
                    SubscriptionName = $sub.Name
                    ResourceGroupName = $vm.ResourceGroupName
                    VMName = $vm.Name
                    VMId = $vm.VmId
                    Location = $vm.Location
                    VMSize = $vm.HardwareProfile.VmSize
                    OSType = $vm.StorageProfile.OsDisk.OsType
                    OSName = $vm.StorageProfile.ImageReference.Offer
                    OSVersion = $vm.StorageProfile.ImageReference.Sku
                    ProvisioningState = $vm.ProvisioningState
                    PowerState = ($vm.PowerState -split '/')[-1]
                    LicenseType = $vm.LicenseType
                    PrimaryPrivateIP = $ipAddress
                    AvailabilitySetId = $vm.AvailabilitySetReference.Id
                    HasManagedIdentity = $hasManagedIdentity
                    IdentityType = $identityType
                    IdentityPrincipalId = if ($vm.Identity.PrincipalId) { $vm.Identity.PrincipalId } else { "" }
                    BootDiagnosticsEnabled = $vm.DiagnosticsProfile.BootDiagnostics.Enabled
                    DataDiskCount = $vm.StorageProfile.DataDisks.Count
                    Tags = ($vm.Tags.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ";"
                })
            }
        }
        
        Write-MandALog "Retrieved $($vmData.Count) virtual machines" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $vmData -FilePath $outputFile
        
        return $vmData
        
    } catch {
        Write-MandALog "Error retrieving virtual machines: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-AzureStorageAccounts {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "AzureStorageAccounts.csv"
    $storageData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Storage accounts CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Azure storage accounts..." -Level "INFO"
        
        $subscriptions = Get-AzSubscription
        
        foreach ($sub in $subscriptions) {
            Set-AzContext -SubscriptionId $sub.Id -ErrorAction Continue
            
            $storageAccounts = Get-AzStorageAccount
            
            foreach ($sa in $storageAccounts) {
                # Get storage account keys to check access
                $hasListKeysAccess = $false
                try {
                    $keys = Get-AzStorageAccountKey -ResourceGroupName $sa.ResourceGroupName -Name $sa.StorageAccountName -ErrorAction Stop
                    $hasListKeysAccess = $true
                } catch {
                    # No access to list keys
                }
                
                # Check network access rules
                $networkRules = $sa.NetworkRuleSet
                $publicAccess = "Enabled"
                if ($networkRules.DefaultAction -eq "Deny") {
                    $publicAccess = "Disabled"
                }
                
                $storageData.Add([PSCustomObject]@{
                    SubscriptionId = $sub.Id
                    SubscriptionName = $sub.Name
                    ResourceGroupName = $sa.ResourceGroupName
                    StorageAccountName = $sa.StorageAccountName
                    ResourceId = $sa.Id
                    Location = $sa.Location
                    Kind = $sa.Kind
                    SkuName = $sa.Sku.Name
                    SkuTier = $sa.Sku.Tier
                    CreationTime = $sa.CreationTime
                    ProvisioningState = $sa.ProvisioningState
                    PrimaryLocation = $sa.PrimaryLocation
                    SecondaryLocation = $sa.SecondaryLocation
                    StatusOfPrimary = $sa.StatusOfPrimary
                    StatusOfSecondary = $sa.StatusOfSecondary
                    EnableHttpsTrafficOnly = $sa.EnableHttpsTrafficOnly
                    MinimumTlsVersion = $sa.MinimumTlsVersion
                    AllowBlobPublicAccess = $sa.AllowBlobPublicAccess
                    PublicNetworkAccess = $publicAccess
                    NetworkRuleBypassOptions = $networkRules.Bypass
                    HasListKeysAccess = $hasListKeysAccess
                    BlobEncryptionEnabled = $sa.Encryption.Services.Blob.Enabled
                    FileEncryptionEnabled = $sa.Encryption.Services.File.Enabled
                    EncryptionKeySource = $sa.Encryption.KeySource
                    AccessTier = $sa.AccessTier
                    Tags = ($sa.Tags.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ";"
                })
            }
        }
        
        Write-MandALog "Retrieved $($storageData.Count) storage accounts" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $storageData -FilePath $outputFile
        
        return $storageData
        
    } catch {
        Write-MandALog "Error retrieving storage accounts: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-AzureKeyVaults {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "AzureKeyVaults.csv"
    $kvData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Key vaults CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Azure key vaults..." -Level "INFO"
        
        $subscriptions = Get-AzSubscription
        
        foreach ($sub in $subscriptions) {
            Set-AzContext -SubscriptionId $sub.Id -ErrorAction Continue
            
            $keyVaults = Get-AzKeyVault
            
            foreach ($kv in $keyVaults) {
                # Get detailed key vault info
                $kvDetails = Get-AzKeyVault -VaultName $kv.VaultName -ResourceGroupName $kv.ResourceGroupName
                
                # Check access policies
                $accessPolicyCount = ($kvDetails.AccessPolicies | Measure-Object).Count
                
                # Check if RBAC is enabled
                $rbacEnabled = $kvDetails.EnableRbacAuthorization
                
                # Get network rules
                $networkRules = $kvDetails.NetworkAcls
                $publicAccess = "Enabled"
                if ($networkRules.DefaultAction -eq "Deny") {
                    $publicAccess = "Restricted"
                }
                
                $kvData.Add([PSCustomObject]@{
                    SubscriptionId = $sub.Id
                    SubscriptionName = $sub.Name
                    ResourceGroupName = $kv.ResourceGroupName
                    VaultName = $kv.VaultName
                    VaultUri = $kvDetails.VaultUri
                    ResourceId = $kvDetails.ResourceId
                    Location = $kv.Location
                    TenantId = $kvDetails.TenantId
                    Sku = $kvDetails.Sku
                    EnabledForDeployment = $kvDetails.EnabledForDeployment
                    EnabledForDiskEncryption = $kvDetails.EnabledForDiskEncryption
                    EnabledForTemplateDeployment = $kvDetails.EnabledForTemplateDeployment
                    EnableSoftDelete = $kvDetails.EnableSoftDelete
                    SoftDeleteRetentionInDays = $kvDetails.SoftDeleteRetentionInDays
                    EnablePurgeProtection = $kvDetails.EnablePurgeProtection
                    EnableRbacAuthorization = $rbacEnabled
                    AccessPolicyCount = $accessPolicyCount
                    PublicNetworkAccess = $publicAccess
                    NetworkRuleBypassOptions = $networkRules.Bypass
                    ProvisioningState = $kvDetails.ProvisioningState
                    Tags = ($kv.Tags.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ";"
                })
            }
        }
        
        Write-MandALog "Retrieved $($kvData.Count) key vaults" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $kvData -FilePath $outputFile
        
        return $kvData
        
    } catch {
        Write-MandALog "Error retrieving key vaults: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-AzureRoleAssignments {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "AzureRoleAssignments.csv"
    $roleData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Role assignments CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Azure role assignments..." -Level "INFO"
        
        $subscriptions = Get-AzSubscription
        
        foreach ($sub in $subscriptions) {
            Set-AzContext -SubscriptionId $sub.Id -ErrorAction Continue
            
            # Get role assignments at subscription level
            $roleAssignments = Get-AzRoleAssignment
            
            foreach ($ra in $roleAssignments) {
                # Determine principal type and get details
                $principalDetails = @{
                    Type = $ra.ObjectType
                    DisplayName = $ra.DisplayName
                    SignInName = $ra.SignInName
                    ApplicationId = ""
                }
                
                if ($ra.ObjectType -eq "ServicePrincipal") {
                    try {
                        $sp = Get-AzADServicePrincipal -ObjectId $ra.ObjectId -ErrorAction SilentlyContinue
                        if ($sp) {
                            $principalDetails.ApplicationId = $sp.AppId
                        }
                    } catch {
                        # Ignore errors getting SP details
                    }
                }
                
                $roleData.Add([PSCustomObject]@{
                    SubscriptionId = $sub.Id
                    SubscriptionName = $sub.Name
                    RoleAssignmentId = $ra.RoleAssignmentId
                    RoleDefinitionName = $ra.RoleDefinitionName
                    RoleDefinitionId = $ra.RoleDefinitionId
                    Scope = $ra.Scope
                    ScopeType = Get-ScopeType -Scope $ra.Scope
                    PrincipalId = $ra.ObjectId
                    PrincipalType = $principalDetails.Type
                    PrincipalDisplayName = $principalDetails.DisplayName
                    PrincipalSignInName = $principalDetails.SignInName
                    PrincipalApplicationId = $principalDetails.ApplicationId
                    CanDelegate = $ra.CanDelegate
                    Description = $ra.Description
                    ConditionVersion = $ra.ConditionVersion
                    Condition = $ra.Condition
                })
            }
        }
        
        Write-MandALog "Retrieved $($roleData.Count) role assignments" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $roleData -FilePath $outputFile
        
        return $roleData
        
    } catch {
        Write-MandALog "Error retrieving role assignments: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-AzureADApplications {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "AzureApplications.csv"
    $appData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Azure AD applications CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Azure AD applications..." -Level "INFO"
        
        $applications = Get-AzADApplication
        
        foreach ($app in $applications) {
            # Get credential info
            $passwordCreds = Get-AzADAppCredential -ApplicationId $app.AppId | Where-Object { $_.Type -eq "Password" }
            $certCreds = Get-AzADAppCredential -ApplicationId $app.AppId | Where-Object { $_.Type -eq "AsymmetricX509Cert" }
            
            # Get owners
            $owners = Get-AzADApplicationOwner -ApplicationId $app.AppId -ErrorAction SilentlyContinue
            
            # Analyze API permissions
            $graphPermissions = @()
            $otherApiPermissions = @()
            
            foreach ($permission in $app.RequiredResourceAccess) {
                if ($permission.ResourceAppId -eq "00000003-0000-0000-c000-000000000000") { # Microsoft Graph
                    $graphPermissions += $permission.ResourceAccess | ForEach-Object { $_.Id }
                } else {
                    $otherApiPermissions += $permission.ResourceAppId
                }
            }
            
            $appData.Add([PSCustomObject]@{
                ApplicationId = $app.AppId
                ObjectId = $app.Id
                DisplayName = $app.DisplayName
                AppType = if ($app.PublicClient) { "PublicClient" } else { "ConfidentialClient" }
                SignInAudience = $app.SignInAudience
                IdentifierUris = ($app.IdentifierUri -join ";")
                HomePage = $app.HomePage
                ReplyUrls = ($app.ReplyUrl -join ";")
                PasswordCredentialCount = $passwordCreds.Count
                CertificateCredentialCount = $certCreds.Count
                HasExpiredCredentials = ($passwordCreds | Where-Object { $_.EndDateTime -lt (Get-Date) }).Count -gt 0
                OwnerCount = $owners.Count
                Owners = ($owners | ForEach-Object { $_.DisplayName }) -join ";"
                GraphPermissionCount = $graphPermissions.Count
                OtherApiPermissionCount = $otherApiPermissions.Count
                CreatedDateTime = $app.CreatedDateTime
                AvailableToOtherTenants = $app.AvailableToOtherTenants
                Tags = ($app.Tag -join ";")
            })
        }
        
        Write-MandALog "Retrieved $($appData.Count) Azure AD applications" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $appData -FilePath $outputFile
        
        return $appData
        
    } catch {
        Write-MandALog "Error retrieving Azure AD applications: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-AzureServicePrincipals {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "AzureServicePrincipals.csv"
    $spData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Service principals CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Azure service principals..." -Level "INFO"
        
        $servicePrincipals = Get-AzADServicePrincipal
        
        foreach ($sp in $servicePrincipals) {
            # Get credential info
            $passwordCreds = Get-AzADServicePrincipalCredential -ServicePrincipalId $sp.Id | Where-Object { $_.Type -eq "Password" }
            $certCreds = Get-AzADServicePrincipalCredential -ServicePrincipalId $sp.Id | Where-Object { $_.Type -eq "AsymmetricX509Cert" }
            
            # Determine SP type
            $spType = "Application"
            if ($sp.ServicePrincipalType -eq "ManagedIdentity") {
                $spType = "ManagedIdentity"
            } elseif ($sp.Tag -contains "WindowsAzureActiveDirectoryIntegratedApp") {
                $spType = "FirstParty"
            }
            
            # Get owners
            $owners = Get-AzADServicePrincipalOwner -ServicePrincipalId $sp.Id -ErrorAction SilentlyContinue
            
            $spData.Add([PSCustomObject]@{
                ServicePrincipalId = $sp.Id
                ApplicationId = $sp.AppId
                DisplayName = $sp.DisplayName
                ServicePrincipalType = $spType
                AccountEnabled = $sp.AccountEnabled
                AppRoleAssignmentRequired = $sp.AppRoleAssignmentRequired
                PasswordCredentialCount = $passwordCreds.Count
                CertificateCredentialCount = $certCreds.Count
                HasExpiredCredentials = ($passwordCreds | Where-Object { $_.EndDateTime -lt (Get-Date) }).Count -gt 0
                OwnerCount = $owners.Count
                Owners = ($owners | ForEach-Object { $_.DisplayName }) -join ";"
                ServicePrincipalNames = ($sp.ServicePrincipalName -join ";")
                ReplyUrls = ($sp.ReplyUrl -join ";")
                Homepage = $sp.Homepage
                PublisherName = $sp.PublisherName
                AlternativeNames = ($sp.AlternativeName -join ";")
                Tags = ($sp.Tag -join ";")
                Notes = $sp.Note
            })
        }
        
        Write-MandALog "Retrieved $($spData.Count) service principals" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $spData -FilePath $outputFile
        
        return $spData
        
    } catch {
        Write-MandALog "Error retrieving service principals: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-AzureManagedIdentities {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "AzureManagedIdentities.csv"
    $miData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Managed identities CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Azure managed identities..." -Level "INFO"
        
        $subscriptions = Get-AzSubscription
        
        foreach ($sub in $subscriptions) {
            Set-AzContext -SubscriptionId $sub.Id -ErrorAction Continue
            
            # Get user-assigned managed identities
            $userAssignedMIs = Get-AzUserAssignedIdentity
            
            foreach ($mi in $userAssignedMIs) {
                # Get role assignments for this identity
                $roleAssignments = Get-AzRoleAssignment -ObjectId $mi.PrincipalId -ErrorAction SilentlyContinue
                
                $miData.Add([PSCustomObject]@{
                    SubscriptionId = $sub.Id
                    SubscriptionName = $sub.Name
                    ResourceGroupName = $mi.ResourceGroupName
                    IdentityName = $mi.Name
                    ResourceId = $mi.Id
                    Location = $mi.Location
                    PrincipalId = $mi.PrincipalId
                    ClientId = $mi.ClientId
                    TenantId = $mi.TenantId
                    Type = "UserAssigned"
                    RoleAssignmentCount = ($roleAssignments | Measure-Object).Count
                    RoleAssignments = ($roleAssignments | ForEach-Object { "$($_.RoleDefinitionName)@$($_.Scope)" }) -join ";"
                    Tags = ($mi.Tags.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ";"
                })
            }
            
            # Get system-assigned managed identities from VMs
            $vms = Get-AzVM
            foreach ($vm in $vms | Where-Object { $_.Identity.Type -in @("SystemAssigned", "SystemAssigned, UserAssigned") }) {
                $roleAssignments = Get-AzRoleAssignment -ObjectId $vm.Identity.PrincipalId -ErrorAction SilentlyContinue
                
                $miData.Add([PSCustomObject]@{
                    SubscriptionId = $sub.Id
                    SubscriptionName = $sub.Name
                    ResourceGroupName = $vm.ResourceGroupName
                    IdentityName = "$($vm.Name)-SystemAssigned"
                    ResourceId = $vm.Id
                    Location = $vm.Location
                    PrincipalId = $vm.Identity.PrincipalId
                    ClientId = "N/A"
                    TenantId = $vm.Identity.TenantId
                    Type = "SystemAssigned"
                    RoleAssignmentCount = ($roleAssignments | Measure-Object).Count
                    RoleAssignments = ($roleAssignments | ForEach-Object { "$($_.RoleDefinitionName)@$($_.Scope)" }) -join ";"
                    Tags = "ParentResource=VM;ParentName=$($vm.Name)"
                })
            }
        }
        
        Write-MandALog "Retrieved $($miData.Count) managed identities" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $miData -FilePath $outputFile
        
        return $miData
        
    } catch {
        Write-MandALog "Error retrieving managed identities: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-AzureNSGs {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "AzureNetworkSecurityGroups.csv"
    $nsgData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Network security groups CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving network security groups..." -Level "INFO"
        
        $subscriptions = Get-AzSubscription
        
        foreach ($sub in $subscriptions) {
            Set-AzContext -SubscriptionId $sub.Id -ErrorAction Continue
            
            $nsgs = Get-AzNetworkSecurityGroup
            
            foreach ($nsg in $nsgs) {
                # Count inbound and outbound rules
                $inboundRules = $nsg.SecurityRules | Where-Object { $_.Direction -eq "Inbound" }
                $outboundRules = $nsg.SecurityRules | Where-Object { $_.Direction -eq "Outbound" }
                
                # Check for risky rules
                $riskyInboundRules = $inboundRules | Where-Object {
                    $_.SourceAddressPrefix -in @("*", "Internet", "0.0.0.0/0") -and
                    $_.Access -eq "Allow" -and
                    $_.DestinationPortRange -in @("*", "22", "3389", "445", "1433", "3306")
                }
                
                # Get associated resources
                $associatedNics = $nsg.NetworkInterfaces.Count
                $associatedSubnets = $nsg.Subnets.Count
                
                $nsgData.Add([PSCustomObject]@{
                    SubscriptionId = $sub.Id
                    SubscriptionName = $sub.Name
                    ResourceGroupName = $nsg.ResourceGroupName
                    NSGName = $nsg.Name
                    ResourceId = $nsg.Id
                    Location = $nsg.Location
                    ProvisioningState = $nsg.ProvisioningState
                    TotalRules = $nsg.SecurityRules.Count
                    InboundRules = $inboundRules.Count
                    OutboundRules = $outboundRules.Count
                    RiskyInboundRules = $riskyInboundRules.Count
                    AssociatedNICs = $associatedNics
                    AssociatedSubnets = $associatedSubnets
                    FlowLogsEnabled = $false # Would need additional check
                    Tags = ($nsg.Tags.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ";"
                })
            }
        }
        
        Write-MandALog "Retrieved $($nsgData.Count) network security groups" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $nsgData -FilePath $outputFile
        
        return $nsgData
        
    } catch {
        Write-MandALog "Error retrieving network security groups: $($_.Exception.Message)" -Level "ERROR"
        return @()
    }
}

function Get-ScopeType {
    param([string]$Scope)
    
    if ($Scope -match "^/subscriptions/[^/]+$") {
        return "Subscription"
    } elseif ($Scope -match "^/subscriptions/[^/]+/resourceGroups/[^/]+$") {
        return "ResourceGroup"
    } elseif ($Scope -match "^/subscriptions/[^/]+/resourceGroups/[^/]+/providers/") {
        return "Resource"
    } elseif ($Scope -eq "/") {
        return "Root"
    } elseif ($Scope -match "^/providers/Microsoft.Management/managementGroups/") {
        return "ManagementGroup"
    } else {
        return "Unknown"
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Invoke-AzureDiscovery',
    'Get-AzureSubscriptions',
    'Get-AzureResourceGroups',
    'Get-AzureVirtualMachines',
    'Get-AzureStorageAccounts',
    'Get-AzureKeyVaults',
    'Get-AzureRoleAssignments',
    'Get-AzureADApplications',
    'Get-AzureServicePrincipals',
    'Get-AzureManagedIdentities',
    'Get-AzureNSGs'
)