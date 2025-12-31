# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement  
# Version: 1.0.0
# Created: 2025-08-03

<#
.SYNOPSIS
    Enhanced Azure Resource Discovery Module with Multiple Authentication Methods
.DESCRIPTION
    Provides comprehensive Azure resource discovery using multiple authentication strategies:
    - Service Principal (Client Credentials)
    - Managed Identity
    - Azure CLI token
    - Interactive authentication
    - Certificate-based authentication
    
    Discovers critical migration resources including:
    - Azure Subscriptions and Resource Groups
    - Virtual Machines with configurations
    - Storage Accounts with access policies
    - Key Vaults and secrets
    - Network infrastructure (NSGs, Load Balancers, Virtual Networks)
    - Database services (SQL, MySQL, Cosmos DB)
    - App Services and Functions
    - Container instances and AKS clusters
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-03
    Requires: PowerShell 5.1+, Az modules
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Test-AzureModules {
    [CmdletBinding()]
    param()

    # Only check/install the specific Az sub-modules actually used in this module
    # This is MUCH faster than installing the full Az umbrella module
    $requiredModules = @(
        'Az.Accounts',    # Connect-AzAccount, Get-AzSubscription
        'Az.Resources',   # Get-AzResourceGroup
        'Az.Compute',     # Get-AzVM, Get-AzVMExtension
        'Az.Network',     # Get-AzNetworkInterface, Get-AzNetworkSecurityGroup, Get-AzVirtualNetwork, Get-AzPublicIpAddress
        'Az.Storage',     # Get-AzStorageAccount, Get-AzStorageAccountKey, Get-AzStorageContainer
        'Az.KeyVault',    # Get-AzKeyVault, Get-AzKeyVaultSecret, Get-AzKeyVaultKey, Get-AzKeyVaultCertificate
        'Az.Websites',    # Get-AzWebApp, Get-AzAppServicePlan
        'Az.Sql',         # Get-AzSqlServer, Get-AzSqlDatabase
        'Az.Automation',  # Get-AzAutomationAccount, Get-AzAutomationRunbook
        'Az.LogicApp'     # Get-AzLogicApp
    )

    $missingModules = @()
    foreach ($module in $requiredModules) {
        if (-not (Get-Module -ListAvailable -Name $module)) {
            $missingModules += $module
        }
    }

    if ($missingModules.Count -gt 0) {
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Missing Azure modules: $($missingModules -join ', '). Installing..." -Level "INFO"

        foreach ($module in $missingModules) {
            try {
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Installing $module..." -Level "INFO"
                Install-Module -Name $module -Scope CurrentUser -Force -AllowClobber -SkipPublisherCheck -ErrorAction Stop
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "$module installed successfully" -Level "SUCCESS"
            } catch {
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Failed to install $module : $($_.Exception.Message)" -Level "ERROR"
                return $false
            }
        }
    }

    # Import Az.Accounts first (required for other Az modules)
    try {
        Import-Module Az.Accounts -Force -ErrorAction Stop
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Az modules verified and loaded" -Level "INFO"
    } catch {
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Failed to import Az.Accounts: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }

    return $true
}

function Connect-AzureWithMultipleStrategies {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        [object]$Result
    )
    
    Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Attempting Azure authentication with multiple strategies..." -Level "INFO"
    
    # Strategy 1: Service Principal with Client Secret
    if ($Configuration.TenantId -and $Configuration.ClientId -and $Configuration.ClientSecret) {
        try {
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Attempting Service Principal authentication..." -Level "INFO"
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "  Client ID: $($Configuration.ClientId)" -Level "INFO"
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "  Tenant ID: $($Configuration.TenantId)" -Level "INFO"

            $secureSecret = ConvertTo-SecureString $Configuration.ClientSecret -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential($Configuration.ClientId, $secureSecret)

            $context = Connect-AzAccount -ServicePrincipal -Credential $credential -Tenant $Configuration.TenantId -WarningAction SilentlyContinue -ErrorAction Stop

            # Log successful connection details
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Service Principal authentication successful" -Level "SUCCESS"
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "  Connected Account: $($context.Context.Account.Id)" -Level "SUCCESS"
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "  Connected Tenant: $($context.Context.Tenant.Id)" -Level "SUCCESS"
            if ($context.Context.Subscription) {
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "  Default Subscription: $($context.Context.Subscription.Name) ($($context.Context.Subscription.Id))" -Level "SUCCESS"
            } else {
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "  Default Subscription: None (may indicate no subscription access)" -Level "WARN"
            }

            return $context

        } catch {
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Service Principal authentication failed: $($_.Exception.Message)" -Level "WARN"
            $Result.AddWarning("Service Principal authentication failed", @{Error=$_.Exception.Message})
        }
    }
    
    # Strategy 2: Azure CLI Token
    try {
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Attempting Azure CLI token authentication..." -Level "INFO"
        
        # Check if Azure CLI is logged in
        $cliAccount = az account show 2>$null | ConvertFrom-Json
        if ($cliAccount) {
            # Get CLI token and use it
            $token = az account get-access-token --resource https://management.azure.com/ 2>$null | ConvertFrom-Json
            if ($token) {
                $accessToken = ConvertTo-SecureString $token.accessToken -AsPlainText -Force
                $context = Connect-AzAccount -AccessToken $accessToken -AccountId $cliAccount.user.name -TenantId $cliAccount.tenantId -WarningAction SilentlyContinue -ErrorAction Stop
                
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Azure CLI token authentication successful" -Level "SUCCESS"
                return $context
            }
        }
        
    } catch {
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Azure CLI token authentication failed: $($_.Exception.Message)" -Level "WARN"
    }

    # Strategy 3: Microsoft Graph API with Device Code (alternative auth path)
    try {
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Attempting Microsoft Graph API authentication..." -Level "INFO"

        # Check if Microsoft.Graph module is available
        if (Get-Module -ListAvailable -Name Microsoft.Graph.Authentication) {
            Import-Module Microsoft.Graph.Authentication -ErrorAction Stop

            # Use device code flow for Graph, then bridge to Azure
            if ($Configuration.TenantId) {
                Connect-MgGraph -TenantId $Configuration.TenantId -Scopes "https://management.azure.com/.default" -UseDeviceCode -ErrorAction Stop | Out-Null
            } else {
                Connect-MgGraph -Scopes "https://management.azure.com/.default" -UseDeviceCode -ErrorAction Stop | Out-Null
            }

            # Get access token from Graph session and use for Azure
            $graphToken = Get-MgContext | Select-Object -ExpandProperty AccessToken
            if ($graphToken) {
                $accessToken = ConvertTo-SecureString $graphToken -AsPlainText -Force
                $accountId = (Get-MgContext).Account
                $tenantId = (Get-MgContext).TenantId

                $context = Connect-AzAccount -AccessToken $accessToken -AccountId $accountId -TenantId $tenantId -WarningAction SilentlyContinue -ErrorAction Stop

                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Microsoft Graph API authentication successful" -Level "SUCCESS"
                return $context
            }
        }

    } catch {
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Microsoft Graph API authentication failed: $($_.Exception.Message)" -Level "WARN"
        $Result.AddWarning("Microsoft Graph API authentication failed", @{Error=$_.Exception.Message})
    }

    # Strategy 4: Managed Identity (if running on Azure VM/Function/etc.)
    try {
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Attempting Managed Identity authentication..." -Level "INFO"
        
        $context = Connect-AzAccount -Identity -WarningAction SilentlyContinue -ErrorAction Stop
        
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Managed Identity authentication successful" -Level "SUCCESS"
        return $context
        
    } catch {
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Managed Identity authentication failed: $($_.Exception.Message)" -Level "WARN"
    }
    
    # Strategy 4: Device Code Authentication (headless-friendly)
    try {
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Attempting device code authentication..." -Level "INFO"

        if ($Configuration.TenantId) {
            $context = Connect-AzAccount -Tenant $Configuration.TenantId -DeviceCode -WarningAction SilentlyContinue -ErrorAction Stop
        } else {
            $context = Connect-AzAccount -DeviceCode -WarningAction SilentlyContinue -ErrorAction Stop
        }

        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Device code authentication successful" -Level "SUCCESS"
        return $context

    } catch {
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Device code authentication failed: $($_.Exception.Message)" -Level "WARN"
        $Result.AddWarning("Device code authentication failed", @{Error=$_.Exception.Message})
    }

    # Strategy 5: Interactive Browser Authentication (last resort - requires GUI)
    try {
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Attempting interactive browser authentication..." -Level "INFO"

        if ($Configuration.TenantId) {
            $context = Connect-AzAccount -Tenant $Configuration.TenantId -WarningAction SilentlyContinue -ErrorAction Stop
        } else {
            $context = Connect-AzAccount -WarningAction SilentlyContinue -ErrorAction Stop
        }

        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Interactive browser authentication successful" -Level "SUCCESS"
        return $context

    } catch {
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Interactive browser authentication failed: $($_.Exception.Message)" -Level "ERROR"
        $Result.AddError("All authentication strategies failed (Service Principal, Azure CLI, Microsoft Graph API, Managed Identity, Device Code, Interactive Browser)", $_.Exception, @{Section="Authentication"})
    }
    
    return $null
}

function Invoke-AzureResourceDiscovery {
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
        
        # Test and install required Azure modules
        if (-not (Test-AzureModules)) {
            $Result.AddError("Failed to install required Azure modules", $null, @{Section="Prerequisites"})
            return $allDiscoveredData
        }
        
        # Establish Azure connection
        $azureContext = Connect-AzureWithMultipleStrategies -Configuration $Configuration -Result $Result
        if (-not $azureContext) {
            $Result.AddError("Failed to authenticate to Azure", $null, @{Section="Authentication"})
            return $allDiscoveredData
        }
        
        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Azure authentication successful, starting resource discovery..." -Level "SUCCESS"

        # CRITICAL: Log authenticated context details for diagnostics
        try {
            $currentContext = Get-AzContext
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "=== AUTHENTICATED CONTEXT DETAILS ===" -Level "INFO"
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Account: $($currentContext.Account.Id)" -Level "INFO"
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Account Type: $($currentContext.Account.Type)" -Level "INFO"
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Tenant ID: $($currentContext.Tenant.Id)" -Level "INFO"
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Subscription ID: $($currentContext.Subscription.Id)" -Level "INFO"
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Subscription Name: $($currentContext.Subscription.Name)" -Level "INFO"
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Environment: $($currentContext.Environment.Name)" -Level "INFO"

            # Store context info in metadata
            $Result.Metadata["AuthenticatedAccount"] = $currentContext.Account.Id
            $Result.Metadata["AuthenticatedAccountType"] = $currentContext.Account.Type
            $Result.Metadata["TenantId"] = $currentContext.Tenant.Id

        } catch {
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Failed to retrieve context details: $($_.Exception.Message)" -Level "WARN"
        }

        try {
            #region Azure Subscriptions Discovery
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Discovering Azure Subscriptions..." -Level "INFO"

            # Get subscriptions with explicit error handling
            $subscriptions = @()
            try {
                $subscriptions = @(Get-AzSubscription -ErrorAction Stop)
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Get-AzSubscription returned $($subscriptions.Count) subscriptions" -Level "INFO"
            } catch {
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Get-AzSubscription failed: $($_.Exception.Message)" -Level "ERROR"
                $Result.AddError("Failed to retrieve subscriptions", $_.Exception, @{Section="Subscriptions"})
            }

            # CRITICAL: If no subscriptions found, provide detailed diagnostics
            if ($subscriptions.Count -eq 0) {
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "=== NO SUBSCRIPTIONS FOUND - DIAGNOSTIC INFORMATION ===" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "This Service Principal/Account has no accessible Azure subscriptions." -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Common Causes:" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "1. Service Principal not assigned 'Reader' role on target subscriptions" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "2. Service Principal exists in wrong tenant (check TenantId configuration)" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "3. Subscription access restrictions or policies blocking SP access" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "4. Service Principal not granted 'Microsoft.ResourceGraph/resources/read' permission" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Remediation Steps:" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "1. In Azure Portal, navigate to: Subscriptions > Access Control (IAM)" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "2. Click 'Add role assignment'" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "3. Select 'Reader' role" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "4. Assign to Service Principal: $($currentContext.Account.Id)" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "5. Wait 5-10 minutes for permissions to propagate" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Verify with Azure CLI: az account list --output table" -Level "ERROR"
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Verify with PowerShell: Get-AzSubscription | Format-Table" -Level "ERROR"

                $Result.AddError(
                    "No Azure subscriptions accessible. Service Principal may need 'Reader' role assigned at subscription scope.",
                    $null,
                    @{
                        Section="Subscriptions"
                        ServicePrincipal=$currentContext.Account.Id
                        TenantId=$currentContext.Tenant.Id
                        Remediation="Assign 'Reader' role to Service Principal in Azure Portal: Subscriptions > Access Control (IAM) > Add role assignment"
                    }
                )

                # Return empty data but don't crash
                return $allDiscoveredData
            }

            # Log all discovered subscriptions
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "=== DISCOVERED SUBSCRIPTIONS ===" -Level "INFO"
            foreach ($sub in $subscriptions) {
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "  - $($sub.Name) (ID: $($sub.Id), State: $($sub.State), Tenant: $($sub.TenantId))" -Level "INFO"
            }

            $subscriptionCount = 0
            
            foreach ($subscription in $subscriptions) {
                # Set context to this subscription
                try {
                    Set-AzContext -SubscriptionId $subscription.Id -Force | Out-Null
                    $subscriptionCount++
                    
                    $subData = [PSCustomObject]@{
                        ObjectType = "AzureSubscription"
                        Name = $subscription.Name  # CONSISTENT NAME FIELD FOR UI
                        SubscriptionId = $subscription.Id
                        SubscriptionName = $subscription.Name
                        State = $subscription.State
                        TenantId = $subscription.TenantId
                        SubscriptionPolicies = ($subscription.SubscriptionPolicies | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                        AuthorizationSource = $subscription.AuthorizationSource
                        ManagedByTenants = ($subscription.ManagedByTenants | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                        Tags = ($subscription.Tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                        _DataType = 'Subscriptions'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($subData)
                    
                    Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Processing subscription: $($subscription.Name)" -Level "INFO"
                    
                    #region Resource Groups Discovery
                    try {
                        $resourceGroups = Get-AzResourceGroup -ErrorAction Stop
                        
                        foreach ($rg in $resourceGroups) {
                            $rgData = [PSCustomObject]@{
                                ObjectType = "AzureResourceGroup"
                                Name = $rg.ResourceGroupName  # CONSISTENT NAME FIELD FOR UI
                                SubscriptionId = $subscription.Id
                                ResourceGroupName = $rg.ResourceGroupName
                                Location = $rg.Location
                                ProvisioningState = $rg.ProvisioningState
                                ResourceId = $rg.ResourceId
                                ManagedBy = $rg.ManagedBy
                                Tags = ($rg.Tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                _DataType = 'ResourceGroups'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($rgData)
                        }
                        
                        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Discovered $($resourceGroups.Count) resource groups in subscription $($subscription.Name)" -Level "SUCCESS"
                        
                    } catch {
                        $Result.AddWarning("Failed to discover resource groups in subscription $($subscription.Name): $($_.Exception.Message)", @{Subscription=$subscription.Name})
                    }
                    #endregion
                    
                    #region Virtual Machines Discovery
                    try {
                        $vms = Get-AzVM -Status -ErrorAction Stop
                        
                        foreach ($vm in $vms) {
                            # Get VM network details
                            $networkInterfaces = @()
                            foreach ($nicRef in $vm.NetworkProfile.NetworkInterfaces) {
                                try {
                                    $nic = Get-AzNetworkInterface -ResourceId $nicRef.Id -ErrorAction SilentlyContinue
                                    if ($nic) {
                                        $publicIp = $null
                                        if ($nic.IpConfigurations[0].PublicIpAddress) {
                                            $publicIpResource = Get-AzPublicIpAddress -ResourceId $nic.IpConfigurations[0].PublicIpAddress.Id -ErrorAction SilentlyContinue
                                            $publicIp = $publicIpResource.IpAddress
                                        }
                                        
                                        $networkInterfaces += @{
                                            Name = $nic.Name
                                            PrivateIpAddress = $nic.IpConfigurations[0].PrivateIpAddress
                                            PublicIpAddress = $publicIp
                                            SubnetId = $nic.IpConfigurations[0].Subnet.Id
                                        }
                                    }
                                } catch {
                                    # Skip if network interface can't be retrieved
                                }
                            }
                            
                            # Get VM extensions
                            $extensions = @()
                            try {
                                $vmExtensions = Get-AzVMExtension -ResourceGroupName $vm.ResourceGroupName -VMName $vm.Name -ErrorAction SilentlyContinue
                                $extensions = $vmExtensions | ForEach-Object { @{Name=$_.Name; Publisher=$_.Publisher; Type=$_.ExtensionType; Version=$_.TypeHandlerVersion} }
                            } catch {}
                            
                            $vmData = [PSCustomObject]@{
                                ObjectType = "AzureVirtualMachine"
                                Name = $vm.Name  # CONSISTENT NAME FIELD FOR UI
                                SubscriptionId = $subscription.Id
                                ResourceGroupName = $vm.ResourceGroupName
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
                                VmId = $vm.VmId
                                AvailabilitySetId = $vm.AvailabilitySetReference.Id
                                NetworkInterfaces = ($networkInterfaces | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                DataDiskCount = $vm.StorageProfile.DataDisks.Count
                                OSDiskSizeGB = $vm.StorageProfile.OsDisk.DiskSizeGB
                                OSDiskCaching = $vm.StorageProfile.OsDisk.Caching
                                Extensions = ($extensions | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                Tags = ($vm.Tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                _DataType = 'VirtualMachines'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($vmData)
                        }
                        
                        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Discovered $($vms.Count) virtual machines in subscription $($subscription.Name)" -Level "SUCCESS"
                        
                    } catch {
                        $Result.AddWarning("Failed to discover VMs in subscription $($subscription.Name): $($_.Exception.Message)", @{Subscription=$subscription.Name})
                    }
                    #endregion
                    
                    #region Storage Accounts Discovery
                    try {
                        $storageAccounts = Get-AzStorageAccount -ErrorAction Stop
                        
                        foreach ($sa in $storageAccounts) {
                            # Get storage account access keys
                            $keys = @()
                            try {
                                $storageKeys = Get-AzStorageAccountKey -ResourceGroupName $sa.ResourceGroupName -Name $sa.StorageAccountName -ErrorAction SilentlyContinue
                                $keys = $storageKeys | ForEach-Object { @{KeyName=$_.KeyName; Permissions=$_.Permissions} }
                            } catch {}
                            
                            # Get blob containers
                            $containers = @()
                            try {
                                $ctx = New-AzStorageContext -StorageAccountName $sa.StorageAccountName -UseConnectedAccount -ErrorAction SilentlyContinue
                                if ($ctx) {
                                    $blobContainers = Get-AzStorageContainer -Context $ctx -ErrorAction SilentlyContinue
                                    $containers = $blobContainers | ForEach-Object { @{Name=$_.Name; PublicAccess=$_.PublicAccess; LastModified=$_.LastModified} }
                                }
                            } catch {}
                            
                            $saData = [PSCustomObject]@{
                                ObjectType = "AzureStorageAccount"
                                Name = $sa.StorageAccountName  # CONSISTENT NAME FIELD FOR UI
                                SubscriptionId = $subscription.Id
                                ResourceGroupName = $sa.ResourceGroupName
                                StorageAccountName = $sa.StorageAccountName
                                Location = $sa.Location
                                SkuName = $sa.Sku.Name
                                Kind = $sa.Kind
                                AccessTier = $sa.AccessTier
                                CreationTime = $sa.CreationTime
                                ProvisioningState = $sa.ProvisioningState
                                StatusOfPrimary = $sa.StatusOfPrimary
                                StatusOfSecondary = $sa.StatusOfSecondary
                                EnableHttpsTrafficOnly = $sa.EnableHttpsTrafficOnly
                                MinimumTlsVersion = $sa.MinimumTlsVersion
                                AllowBlobPublicAccess = $sa.AllowBlobPublicAccess
                                NetworkRuleSet = ($sa.NetworkRuleSet | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                BlobEndpoint = $sa.PrimaryEndpoints.Blob
                                FileEndpoint = $sa.PrimaryEndpoints.File
                                QueueEndpoint = $sa.PrimaryEndpoints.Queue
                                TableEndpoint = $sa.PrimaryEndpoints.Table
                                KeyCount = $keys.Count
                                ContainerCount = $containers.Count
                                Containers = ($containers | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                Tags = ($sa.Tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                _DataType = 'StorageAccounts'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($saData)
                        }
                        
                        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Discovered $($storageAccounts.Count) storage accounts in subscription $($subscription.Name)" -Level "SUCCESS"
                        
                    } catch {
                        $Result.AddWarning("Failed to discover storage accounts in subscription $($subscription.Name): $($_.Exception.Message)", @{Subscription=$subscription.Name})
                    }
                    #endregion
                    
                    #region Key Vaults Discovery
                    try {
                        $keyVaults = Get-AzKeyVault -ErrorAction Stop
                        
                        foreach ($kv in $keyVaults) {
                            # Get detailed key vault info
                            $kvDetail = Get-AzKeyVault -VaultName $kv.VaultName -ResourceGroupName $kv.ResourceGroupName -ErrorAction SilentlyContinue
                            
                            # Get secrets, keys, and certificates count
                            $secretCount = 0
                            $keyCount = 0 
                            $certCount = 0
                            
                            try {
                                $secrets = Get-AzKeyVaultSecret -VaultName $kv.VaultName -ErrorAction SilentlyContinue
                                $secretCount = $secrets.Count
                            } catch {}
                            
                            try {
                                $keys = Get-AzKeyVaultKey -VaultName $kv.VaultName -ErrorAction SilentlyContinue
                                $keyCount = $keys.Count
                            } catch {}
                            
                            try {
                                $certs = Get-AzKeyVaultCertificate -VaultName $kv.VaultName -ErrorAction SilentlyContinue
                                $certCount = $certs.Count
                            } catch {}
                            
                            # Get access policies
                            $accessPolicies = @()
                            if ($kvDetail -and $kvDetail.AccessPolicies) {
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
                            }
                            
                            $kvData = [PSCustomObject]@{
                                ObjectType = "AzureKeyVault"
                                Name = $kv.VaultName  # CONSISTENT NAME FIELD FOR UI
                                SubscriptionId = $subscription.Id
                                ResourceGroupName = $kv.ResourceGroupName
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
                                SecretCount = $secretCount
                                KeyCount = $keyCount
                                CertificateCount = $certCount
                                AccessPolicyCount = $accessPolicies.Count
                                AccessPolicies = ($accessPolicies | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                NetworkAcls = ($kvDetail.NetworkAcls | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                Tags = ($kv.Tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                _DataType = 'KeyVaults'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($kvData)
                        }
                        
                        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Discovered $($keyVaults.Count) key vaults in subscription $($subscription.Name)" -Level "SUCCESS"
                        
                    } catch {
                        $Result.AddWarning("Failed to discover key vaults in subscription $($subscription.Name): $($_.Exception.Message)", @{Subscription=$subscription.Name})
                    }
                    #endregion
                    
                    #region Network Security Groups Discovery
                    try {
                        $nsgs = Get-AzNetworkSecurityGroup -ErrorAction Stop
                        
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
                                ObjectType = "AzureNetworkSecurityGroup"
                                Name = $nsg.Name  # CONSISTENT NAME FIELD FOR UI
                                SubscriptionId = $subscription.Id
                                ResourceGroupName = $nsg.ResourceGroupName
                                NSGName = $nsg.Name
                                Location = $nsg.Location
                                ProvisioningState = $nsg.ProvisioningState
                                InboundRuleCount = $inboundRules.Count
                                OutboundRuleCount = $outboundRules.Count
                                InboundRules = ($inboundRules | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                OutboundRules = ($outboundRules | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                NetworkInterfaceCount = $nsg.NetworkInterfaces.Count
                                SubnetCount = $nsg.Subnets.Count
                                AttachedTo = ($nsg.NetworkInterfaces.Id + $nsg.Subnets.Id | ForEach-Object { ($_ -split '/')[-1] }) -join '; '
                                Tags = ($nsg.Tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                _DataType = 'NetworkSecurityGroups'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($nsgData)
                        }
                        
                        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Discovered $($nsgs.Count) network security groups in subscription $($subscription.Name)" -Level "SUCCESS"
                        
                    } catch {
                        $Result.AddWarning("Failed to discover NSGs in subscription $($subscription.Name): $($_.Exception.Message)", @{Subscription=$subscription.Name})
                    }
                    #endregion
                    
                    #region Virtual Networks Discovery
                    try {
                        $vnets = Get-AzVirtualNetwork -ErrorAction Stop
                        
                        foreach ($vnet in $vnets) {
                            # Get subnet details
                            $subnets = @()
                            foreach ($subnet in $vnet.Subnets) {
                                $subnets += @{
                                    Name = $subnet.Name
                                    AddressPrefix = $subnet.AddressPrefix -join '; '
                                    ProvisioningState = $subnet.ProvisioningState
                                    NetworkSecurityGroup = if ($subnet.NetworkSecurityGroup) { ($subnet.NetworkSecurityGroup.Id -split '/')[-1] } else { $null }
                                    RouteTable = if ($subnet.RouteTable) { ($subnet.RouteTable.Id -split '/')[-1] } else { $null }
                                }
                            }
                            
                            $vnetData = [PSCustomObject]@{
                                ObjectType = "AzureVirtualNetwork"
                                Name = $vnet.Name  # CONSISTENT NAME FIELD FOR UI
                                SubscriptionId = $subscription.Id
                                ResourceGroupName = $vnet.ResourceGroupName
                                VNetName = $vnet.Name
                                Location = $vnet.Location
                                ProvisioningState = $vnet.ProvisioningState
                                AddressSpaces = ($vnet.AddressSpace.AddressPrefixes -join '; ')
                                SubnetCount = $vnet.Subnets.Count
                                Subnets = ($subnets | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                EnableVmProtection = $vnet.EnableVmProtection
                                EnableDdosProtection = $vnet.EnableDdosProtection
                                DnsServers = ($vnet.DhcpOptions.DnsServers -join '; ')
                                Tags = ($vnet.Tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                _DataType = 'VirtualNetworks'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($vnetData)
                        }
                        
                        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Discovered $($vnets.Count) virtual networks in subscription $($subscription.Name)" -Level "SUCCESS"
                        
                    } catch {
                        $Result.AddWarning("Failed to discover VNets in subscription $($subscription.Name): $($_.Exception.Message)", @{Subscription=$subscription.Name})
                    }
                    #endregion
                    
                    #region App Services Discovery
                    try {
                        $webApps = Get-AzWebApp -ErrorAction Stop
                        
                        foreach ($app in $webApps) {
                            # Get app service plan details
                            $appServicePlan = $null
                            try {
                                $appServicePlan = Get-AzAppServicePlan -ResourceGroupName $app.ResourceGroup -Name $app.ServerFarmId.Split('/')[-1] -ErrorAction SilentlyContinue
                            } catch {}
                            
                            $appData = [PSCustomObject]@{
                                ObjectType = "AzureWebApp"
                                Name = $app.Name  # CONSISTENT NAME FIELD FOR UI
                                SubscriptionId = $subscription.Id
                                ResourceGroupName = $app.ResourceGroup
                                WebAppName = $app.Name
                                Location = $app.Location
                                Kind = $app.Kind
                                State = $app.State
                                DefaultHostName = $app.DefaultHostName
                                EnabledHostNames = ($app.EnabledHostNames -join '; ')
                                AppServicePlanName = if ($appServicePlan) { $appServicePlan.Name } else { ($app.ServerFarmId -split '/')[-1] }
                                AppServicePlanTier = if ($appServicePlan) { $appServicePlan.Sku.Tier } else { $null }
                                AppServicePlanSize = if ($appServicePlan) { $appServicePlan.Sku.Size } else { $null }
                                RuntimeStack = $app.SiteConfig.LinuxFxVersion + $app.SiteConfig.WindowsFxVersion
                                HttpsOnly = $app.HttpsOnly
                                ClientAffinityEnabled = $app.ClientAffinityEnabled
                                Tags = ($app.Tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                _DataType = 'WebApps'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($appData)
                        }
                        
                        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Discovered $($webApps.Count) web apps in subscription $($subscription.Name)" -Level "SUCCESS"
                        
                    } catch {
                        $Result.AddWarning("Failed to discover web apps in subscription $($subscription.Name): $($_.Exception.Message)", @{Subscription=$subscription.Name})
                    }
                    #endregion
                    
                    #region SQL Databases Discovery
                    try {
                        $sqlServers = Get-AzSqlServer -ErrorAction Stop
                        
                        foreach ($server in $sqlServers) {
                            # Get databases for this server
                            $databases = @()
                            try {
                                $serverDatabases = Get-AzSqlDatabase -ServerName $server.ServerName -ResourceGroupName $server.ResourceGroupName -ErrorAction SilentlyContinue
                                $databases = $serverDatabases | ForEach-Object { 
                                    @{
                                        Name = $_.DatabaseName
                                        Edition = $_.Edition
                                        ServiceObjective = $_.CurrentServiceObjectiveName
                                        Status = $_.Status
                                        CreationDate = $_.CreationDate
                                        CollationName = $_.CollationName
                                    }
                                }
                            } catch {}
                            
                            $sqlData = [PSCustomObject]@{
                                ObjectType = "AzureSQLServer"
                                Name = $server.ServerName  # CONSISTENT NAME FIELD FOR UI
                                SubscriptionId = $subscription.Id
                                ResourceGroupName = $server.ResourceGroupName
                                ServerName = $server.ServerName
                                Location = $server.Location
                                ServerVersion = $server.ServerVersion
                                SqlAdministratorLogin = $server.SqlAdministratorLogin
                                FullyQualifiedDomainName = $server.FullyQualifiedDomainName
                                DatabaseCount = $databases.Count
                                Databases = ($databases | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                Tags = ($server.Tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                _DataType = 'SQLServers'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($sqlData)
                        }
                        
                        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Discovered $($sqlServers.Count) SQL servers in subscription $($subscription.Name)" -Level "SUCCESS"
                        
                    } catch {
                        $Result.AddWarning("Failed to discover SQL servers in subscription $($subscription.Name): $($_.Exception.Message)", @{Subscription=$subscription.Name})
                    }
                    #endregion

                    #region VM Scale Sets Discovery (AzureHound-inspired)
                    try {
                        $vmScaleSets = Get-AzVmss -ErrorAction Stop

                        foreach ($vmss in $vmScaleSets) {
                            # Get instance count
                            $instanceCount = 0
                            try {
                                $instances = Get-AzVmssVM -ResourceGroupName $vmss.ResourceGroupName -VMScaleSetName $vmss.Name -ErrorAction SilentlyContinue
                                $instanceCount = @($instances).Count
                            } catch {}

                            # Extract VNet/Subnet info from network profile
                            $vnetName = ""
                            $subnetName = ""
                            try {
                                $nicConfig = $vmss.VirtualMachineProfile.NetworkProfile.NetworkInterfaceConfigurations | Select-Object -First 1
                                if ($nicConfig -and $nicConfig.IpConfigurations) {
                                    $subnetId = $nicConfig.IpConfigurations[0].Subnet.Id
                                    if ($subnetId) {
                                        $subnetParts = $subnetId -split '/'
                                        $vnetName = $subnetParts[-3]
                                        $subnetName = $subnetParts[-1]
                                    }
                                }
                            } catch {}

                            $vmssData = [PSCustomObject]@{
                                ObjectType = "VMScaleSet"
                                Name = $vmss.Name
                                SubscriptionId = $subscription.Id
                                ResourceGroupName = $vmss.ResourceGroupName
                                Location = $vmss.Location
                                Sku = $vmss.Sku.Name
                                Tier = $vmss.Sku.Tier
                                Capacity = $vmss.Sku.Capacity
                                InstanceCount = $instanceCount
                                UpgradePolicy = $vmss.UpgradePolicy.Mode
                                VirtualNetworkName = $vnetName
                                SubnetName = $subnetName
                                ProvisioningState = $vmss.ProvisioningState
                                UniqueId = $vmss.UniqueId
                                Tags = ($vmss.Tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                _DataType = 'VMScaleSets'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($vmssData)
                        }

                        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Discovered $(@($vmScaleSets).Count) VM Scale Sets in subscription $($subscription.Name)" -Level "SUCCESS"

                    } catch {
                        $Result.AddWarning("Failed to discover VM Scale Sets in subscription $($subscription.Name): $($_.Exception.Message)", @{Subscription=$subscription.Name})
                    }
                    #endregion

                    #region Function Apps Discovery (AzureHound-inspired)
                    try {
                        $functionApps = Get-AzFunctionApp -ErrorAction Stop

                        foreach ($func in $functionApps) {
                            $funcData = [PSCustomObject]@{
                                ObjectType = "FunctionApp"
                                Name = $func.Name
                                SubscriptionId = $subscription.Id
                                ResourceGroupName = $func.ResourceGroup
                                Location = $func.Location
                                Runtime = $func.Runtime
                                RuntimeVersion = $func.RuntimeVersion
                                State = $func.State
                                Kind = $func.Kind
                                HostNames = ($func.HostNames -join '; ')
                                HttpsOnly = $func.HttpsOnly
                                AppServicePlan = $func.AppServicePlan
                                DefaultHostName = $func.DefaultHostName
                                OSType = $func.OSType
                                ContainerSize = $func.ContainerSize
                                DailyMemoryTimeQuota = $func.DailyMemoryTimeQuota
                                Enabled = $func.Enabled
                                Tags = ($func.Tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                _DataType = 'FunctionApps'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($funcData)
                        }

                        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Discovered $(@($functionApps).Count) Function Apps in subscription $($subscription.Name)" -Level "SUCCESS"

                    } catch {
                        if ($_.Exception.Message -notlike "*'Az.Functions' is not installed*" -and $_.Exception.Message -notlike "*CommandNotFoundException*") {
                            $Result.AddWarning("Failed to discover Function Apps in subscription $($subscription.Name): $($_.Exception.Message)", @{Subscription=$subscription.Name})
                        } else {
                            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Az.Functions module not installed, skipping Function Apps discovery" -Level "WARNING"
                        }
                    }
                    #endregion

                    #region Container Registries Discovery (AzureHound-inspired)
                    try {
                        $registries = Get-AzContainerRegistry -ErrorAction Stop

                        foreach ($acr in $registries) {
                            $acrData = [PSCustomObject]@{
                                ObjectType = "ContainerRegistry"
                                Name = $acr.Name
                                SubscriptionId = $subscription.Id
                                ResourceGroupName = $acr.ResourceGroupName
                                Location = $acr.Location
                                Sku = $acr.SkuName
                                LoginServer = $acr.LoginServer
                                AdminUserEnabled = $acr.AdminUserEnabled
                                CreationDate = $acr.CreationDate
                                ProvisioningState = $acr.ProvisioningState
                                PublicNetworkAccess = $acr.PublicNetworkAccess
                                NetworkRuleBypassOptions = $acr.NetworkRuleBypassOptions
                                ZoneRedundancy = $acr.ZoneRedundancy
                                Tags = ($acr.Tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                _DataType = 'ContainerRegistries'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($acrData)
                        }

                        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Discovered $(@($registries).Count) Container Registries in subscription $($subscription.Name)" -Level "SUCCESS"

                    } catch {
                        if ($_.Exception.Message -notlike "*'Az.ContainerRegistry' is not installed*" -and $_.Exception.Message -notlike "*CommandNotFoundException*") {
                            $Result.AddWarning("Failed to discover Container Registries in subscription $($subscription.Name): $($_.Exception.Message)", @{Subscription=$subscription.Name})
                        } else {
                            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Az.ContainerRegistry module not installed, skipping Container Registry discovery" -Level "WARNING"
                        }
                    }
                    #endregion

                    #region Automation Accounts Discovery (AzureHound-inspired Phase 2)
                    try {
                        $automationAccounts = Get-AzAutomationAccount -ErrorAction Stop

                        foreach ($aa in $automationAccounts) {
                            # Get runbook count
                            $runbookCount = 0
                            $runbooks = @()
                            try {
                                $runbookList = Get-AzAutomationRunbook -ResourceGroupName $aa.ResourceGroupName -AutomationAccountName $aa.AutomationAccountName -ErrorAction SilentlyContinue
                                $runbookCount = @($runbookList).Count
                                $runbooks = $runbookList | Select-Object -First 10 | ForEach-Object {
                                    @{
                                        Name = $_.Name
                                        RunbookType = $_.RunbookType
                                        State = $_.State
                                        LastModifiedTime = $_.LastModifiedTime
                                    }
                                }
                            } catch {}

                            # Get variable count
                            $variableCount = 0
                            try {
                                $variables = Get-AzAutomationVariable -ResourceGroupName $aa.ResourceGroupName -AutomationAccountName $aa.AutomationAccountName -ErrorAction SilentlyContinue
                                $variableCount = @($variables).Count
                            } catch {}

                            # Get schedule count
                            $scheduleCount = 0
                            try {
                                $schedules = Get-AzAutomationSchedule -ResourceGroupName $aa.ResourceGroupName -AutomationAccountName $aa.AutomationAccountName -ErrorAction SilentlyContinue
                                $scheduleCount = @($schedules).Count
                            } catch {}

                            # Get credential count
                            $credentialCount = 0
                            try {
                                $credentials = Get-AzAutomationCredential -ResourceGroupName $aa.ResourceGroupName -AutomationAccountName $aa.AutomationAccountName -ErrorAction SilentlyContinue
                                $credentialCount = @($credentials).Count
                            } catch {}

                            $aaData = [PSCustomObject]@{
                                ObjectType = "AutomationAccount"
                                Name = $aa.AutomationAccountName
                                SubscriptionId = $subscription.Id
                                ResourceGroupName = $aa.ResourceGroupName
                                Location = $aa.Location
                                State = $aa.State
                                CreationTime = $aa.CreationTime
                                LastModifiedTime = $aa.LastModifiedTime
                                RunbookCount = $runbookCount
                                VariableCount = $variableCount
                                ScheduleCount = $scheduleCount
                                CredentialCount = $credentialCount
                                Runbooks = ($runbooks | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                Tags = ($aa.Tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                _DataType = 'AutomationAccounts'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($aaData)
                        }

                        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Discovered $(@($automationAccounts).Count) Automation Accounts in subscription $($subscription.Name)" -Level "SUCCESS"

                    } catch {
                        if ($_.Exception.Message -notlike "*'Az.Automation' is not installed*" -and $_.Exception.Message -notlike "*CommandNotFoundException*") {
                            $Result.AddWarning("Failed to discover Automation Accounts in subscription $($subscription.Name): $($_.Exception.Message)", @{Subscription=$subscription.Name})
                        } else {
                            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Az.Automation module not installed, skipping Automation Account discovery" -Level "WARNING"
                        }
                    }
                    #endregion

                    #region Logic Apps Discovery (AzureHound-inspired Phase 2)
                    try {
                        $logicApps = Get-AzLogicApp -ErrorAction Stop

                        foreach ($la in $logicApps) {
                            # Get workflow runs count (last 30 days)
                            $runCount = 0
                            $lastRunTime = $null
                            $lastRunStatus = $null
                            try {
                                $runs = Get-AzLogicAppRunHistory -ResourceGroupName $la.ResourceGroupName -Name $la.Name -ErrorAction SilentlyContinue | Select-Object -First 100
                                $runCount = @($runs).Count
                                if ($runs) {
                                    $lastRun = $runs | Select-Object -First 1
                                    $lastRunTime = $lastRun.StartTime
                                    $lastRunStatus = $lastRun.Status
                                }
                            } catch {}

                            # Get trigger info
                            $triggerCount = 0
                            $triggers = @()
                            try {
                                $triggerList = Get-AzLogicAppTrigger -ResourceGroupName $la.ResourceGroupName -Name $la.Name -ErrorAction SilentlyContinue
                                $triggerCount = @($triggerList).Count
                                $triggers = $triggerList | ForEach-Object {
                                    @{
                                        Name = $_.Name
                                        State = $_.State
                                        Type = $_.TypeName
                                    }
                                }
                            } catch {}

                            $laData = [PSCustomObject]@{
                                ObjectType = "LogicApp"
                                Name = $la.Name
                                SubscriptionId = $subscription.Id
                                ResourceGroupName = $la.ResourceGroupName
                                Location = $la.Location
                                State = $la.State
                                Sku = $la.Sku.Name
                                Version = $la.Version
                                CreatedTime = $la.CreatedTime
                                ChangedTime = $la.ChangedTime
                                AccessEndpoint = $la.AccessEndpoint
                                TriggerCount = $triggerCount
                                Triggers = ($triggers | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                RecentRunCount = $runCount
                                LastRunTime = $lastRunTime
                                LastRunStatus = $lastRunStatus
                                Tags = ($la.Tags | ConvertTo-Json -Compress -ErrorAction SilentlyContinue)
                                _DataType = 'LogicApps'
                                SessionId = $SessionId
                            }
                            $null = $allDiscoveredData.Add($laData)
                        }

                        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Discovered $(@($logicApps).Count) Logic Apps in subscription $($subscription.Name)" -Level "SUCCESS"

                    } catch {
                        if ($_.Exception.Message -notlike "*'Az.LogicApp' is not installed*" -and $_.Exception.Message -notlike "*CommandNotFoundException*") {
                            $Result.AddWarning("Failed to discover Logic Apps in subscription $($subscription.Name): $($_.Exception.Message)", @{Subscription=$subscription.Name})
                        } else {
                            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Az.LogicApp module not installed, skipping Logic App discovery" -Level "WARNING"
                        }
                    }
                    #endregion

                } catch {
                    $Result.AddWarning("Failed to process subscription $($subscription.Name): $($_.Exception.Message)", @{Subscription=$subscription.Name})
                    continue
                }
            }
            
            $Result.Metadata["SubscriptionCount"] = $subscriptionCount
            $Result.Metadata["TotalResourcesDiscovered"] = $allDiscoveredData.Count
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Completed discovery across $subscriptionCount subscriptions, found $($allDiscoveredData.Count) total resources" -Level "SUCCESS"
            
        } catch {
            $Result.AddError("Failed to discover Azure subscriptions: $($_.Exception.Message)", $_.Exception, @{Section="Subscriptions"})
        }
        #endregion
        
        # Store all discovered data
        $Result.RecordCount = $allDiscoveredData.Count

        #region Export to CSV for discovered views
        try {
            $outputPath = $Context.Paths.RawDataOutput
            if ($outputPath -and (Test-Path $outputPath -IsValid)) {
                # Ensure directory exists
                if (-not (Test-Path $outputPath)) {
                    $null = New-Item -Path $outputPath -ItemType Directory -Force
                }

                # Export combined CSV (this is what the UI looks for)
                if ($allDiscoveredData.Count -gt 0) {
                    $combinedCsvPath = Join-Path $outputPath "AzureResourceDiscovery.csv"
                    $null = $allDiscoveredData | Export-Csv -Path $combinedCsvPath -NoTypeInformation -Force -Encoding UTF8
                    Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Exported $($allDiscoveredData.Count) resources to $combinedCsvPath" -Level "SUCCESS"

                    # Also export per-type CSV files for detailed views
                    $groupedData = $allDiscoveredData | Group-Object -Property _DataType
                    foreach ($group in $groupedData) {
                        $dataType = if ($group.Name) { $group.Name } else { 'Unknown' }
                        $fileName = "AzureResourceDiscovery_$dataType.csv"
                        $filePath = Join-Path $outputPath $fileName
                        $null = $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                        Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Exported $($group.Count) $dataType records to $fileName" -Level "SUCCESS"
                    }
                } else {
                    Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "No data to export to CSV" -Level "WARNING"
                }
            } else {
                Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Output path not available in Context, skipping CSV export" -Level "WARNING"
            }
        } catch {
            Write-ModuleLog -ModuleName "AzureResourceDiscovery" -Message "Failed to export CSV: $($_.Exception.Message)" -Level "ERROR"
        }
        #endregion

        # Return data grouped by type
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    # Execute discovery using the base module
    Start-DiscoveryModule `
        -ModuleName "AzureResourceDiscovery" `
        -DiscoveryScript $discoveryScript `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @()
}

# Export the module function
Export-ModuleMember -Function Invoke-AzureResourceDiscovery