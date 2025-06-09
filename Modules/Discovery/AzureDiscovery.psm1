# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

#================================================================================
# M&A Discovery Module: Azure
# Description: Discovers Azure subscriptions, resource groups, and virtual machines.
#================================================================================

function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Standardized pattern to extract credentials passed by the orchestrator.
    if ($Configuration._AuthContext) { return $Configuration._AuthContext }
    if ($Configuration._Credentials) { return $Configuration._Credentials }
    if ($Configuration.authentication -and $Configuration.authentication._Credentials) { return $Configuration.authentication._Credentials }
    if ($Configuration.ClientId -and $Configuration.ClientSecret -and $Configuration.TenantId) {
        return @{
            ClientId     = $Configuration.ClientId
            ClientSecret = $Configuration.ClientSecret
            TenantId     = $Configuration.TenantId
        }
    }
    # Return null if no credentials found
    return $null
}

function Write-AzureLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    # Module-specific wrapper for consistent logging component name.
    # The global Write-MandALog function is guaranteed to exist.
    Write-MandALog -Message "[Azure] $Message" -Level $Level -Component "AzureDiscovery" -Context $Context
}

# --- Main Discovery Function ---

function Invoke-AzureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context
    )

    Write-AzureLog -Level "HEADER" -Message "Starting Discovery" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # 1. INITIALIZE RESULT OBJECT
    # The DiscoveryResult class is loaded by the orchestrator.
    # This fallback provides resilience in case the class definition fails to load.
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Azure')
    } else {
        # Fallback to a hashtable that mimics the class structure and methods.
        $result = @{
            Success      = $true; ModuleName = 'Azure'; RecordCount = 0;
            Errors       = [System.Collections.ArrayList]::new(); Warnings = [System.Collections.ArrayList]::new(); Metadata = @{};
            StartTime    = Get-Date; EndTime = $null; ExecutionId = [guid]::NewGuid().ToString();
            AddError     = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
            AddWarning   = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
            Complete     = { $this.EndTime = Get-Date }.GetNewClosure()
        }
    }

    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Ensure-Path -Path $outputPath

        # Validate Az modules
        $requiredModules = @('Az.Accounts', 'Az.Resources')
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -Name $module -ListAvailable)) {
                $result.AddError("Required module '$module' not installed. Run: Install-Module -Name $module -Force", $null, @{Component = "Prerequisites"})
                return $result
            }
            # Import module if not already loaded
            if (-not (Get-Module -Name $module)) {
                Import-Module $module -ErrorAction Stop
                Write-AzureLog -Level "DEBUG" -Message "Imported module: $module" -Context $Context
            }
        }

        # 3. AUTHENTICATE & CONNECT
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        if (-not $authInfo) {
            $result.AddError("Authentication information could not be found in the provided configuration.", $null, $null)
            return $result
        }

        # Connect to Azure
        $connected = Connect-ToAzure -AuthInfo $authInfo -Context $Context
        if (-not $connected) {
            $result.AddError("Failed to connect to Azure. Verify service principal credentials and permissions.", $null, @{Component = "Authentication"})
            return $result
        }
        Write-AzureLog -Level "SUCCESS" -Message "Successfully connected to Azure." -Context $Context

        # 4. PERFORM DISCOVERY
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Get Subscriptions
        $subscriptions = @()
        try {
            Write-AzureLog -Level "INFO" -Message "Discovering Azure subscriptions..." -Context $Context
            $subscriptions = Get-AzureSubscriptionsInternal -Configuration $Configuration -Context $Context
            $null = $allDiscoveredData.AddRange($subscriptions)
            Write-AzureLog -Level "INFO" -Message "Discovered $($subscriptions.Count) subscriptions." -Context $Context
            
            # 5. EXPORT DATA TO CSV
            if ($subscriptions.Count -gt 0) {
                Export-DiscoveryData -Data $subscriptions -OutputPath $outputPath -FileName "Azure_Subscriptions.csv" -ModuleName "Azure"
                Write-AzureLog -Level "SUCCESS" -Message "Exported subscriptions to CSV." -Context $Context
            }

            $result.Metadata["SubscriptionCount"] = $subscriptions.Count

        } catch {
            $result.AddWarning("Failed to discover subscriptions. Error: $($_.Exception.Message)", @{Operation = "GetSubscriptions"})
        }
        
        # Get Resource Groups (only if we have subscriptions)
        if ($subscriptions.Count -gt 0) {
            try {
                Write-AzureLog -Level "INFO" -Message "Discovering Azure resource groups..." -Context $Context
                $resourceGroups = Get-AzureResourceGroupsInternal -Configuration $Configuration -Context $Context -Subscriptions $subscriptions
                $null = $allDiscoveredData.AddRange($resourceGroups)
                Write-AzureLog -Level "INFO" -Message "Discovered $($resourceGroups.Count) resource groups." -Context $Context
                
                if ($resourceGroups.Count -gt 0) {
                    Export-DiscoveryData -Data $resourceGroups -OutputPath $outputPath -FileName "Azure_ResourceGroups.csv" -ModuleName "Azure"
                    Write-AzureLog -Level "SUCCESS" -Message "Exported resource groups to CSV." -Context $Context
                }

                $result.Metadata["ResourceGroupCount"] = $resourceGroups.Count

            } catch {
                $result.AddWarning("Failed to discover resource groups. Error: $($_.Exception.Message)", @{Operation = "GetResourceGroups"})
            }

            # Get Virtual Machines
            try {
                Write-AzureLog -Level "INFO" -Message "Discovering Azure virtual machines..." -Context $Context
                $virtualMachines = Get-AzureVirtualMachinesInternal -Configuration $Configuration -Context $Context -Subscriptions $subscriptions
                $null = $allDiscoveredData.AddRange($virtualMachines)
                Write-AzureLog -Level "INFO" -Message "Discovered $($virtualMachines.Count) virtual machines." -Context $Context
                
                if ($virtualMachines.Count -gt 0) {
                    Export-DiscoveryData -Data $virtualMachines -OutputPath $outputPath -FileName "Azure_VirtualMachines.csv" -ModuleName "Azure"
                    Write-AzureLog -Level "SUCCESS" -Message "Exported virtual machines to CSV." -Context $Context
                }

                $result.Metadata["VirtualMachineCount"] = $virtualMachines.Count

            } catch {
                $result.AddWarning("Failed to discover virtual machines. Error: $($_.Exception.Message)", @{Operation = "GetVirtualMachines"})
            }
        }

        # 6. FINALIZE & UPDATE METADATA
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["OutputPath"] = $outputPath

    } catch {
        # This is the top-level catch for critical, unrecoverable errors.
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, @{Operation = "AzureDiscovery"})
    } finally {
        # 7. CLEANUP & COMPLETE
        # Disconnect from Azure if connected
        try {
            $azContext = Get-AzContext -ErrorAction SilentlyContinue
            if ($azContext) {
                Disconnect-AzAccount -ErrorAction SilentlyContinue | Out-Null
                Write-AzureLog -Level "DEBUG" -Message "Disconnected from Azure." -Context $Context
            }
        } catch {
            # Ignore disconnect errors
        }
        
        $stopwatch.Stop()
        $result.Complete() # Sets EndTime
        
        # Log summary
        $errorCount = if ($result.Errors -is [System.Collections.ArrayList]) { $result.Errors.Count } else { 0 }
        $warningCount = if ($result.Warnings -is [System.Collections.ArrayList]) { $result.Warnings.Count } else { 0 }
        
        Write-AzureLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount), Errors: $errorCount, Warnings: $warningCount." -Context $Context
    }

    return $result
}

# --- Helper Functions ---

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

function Connect-ToAzure {
    param(
        [hashtable]$AuthInfo,
        [hashtable]$Context
    )
    
    try {
        # Check if already connected
        $currentContext = Get-AzContext -ErrorAction SilentlyContinue
        if ($currentContext) {
            Write-AzureLog -Message "Already connected to Azure as $($currentContext.Account.Id)" -Level "DEBUG" -Context $Context
            return $true
        }
        
        # Connect using service principal
        $securePassword = ConvertTo-SecureString $AuthInfo.ClientSecret -AsPlainText -Force
        $credential = New-Object System.Management.Automation.PSCredential($AuthInfo.ClientId, $securePassword)
        
        $connectionParams = @{
            ServicePrincipal = $true
            Credential = $credential
            Tenant = $AuthInfo.TenantId
            ErrorAction = 'Stop'
            WarningAction = 'SilentlyContinue'
        }
        
        $null = Connect-AzAccount @connectionParams
        
        # Verify connection
        $newContext = Get-AzContext -ErrorAction Stop
        if ($newContext) {
            Write-AzureLog -Message "Connected to Azure tenant: $($newContext.Tenant.Id)" -Level "DEBUG" -Context $Context
            return $true
        }
        
        return $false
    } catch {
        Write-AzureLog -Message "Failed to connect to Azure: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        return $false
    }
}

function Get-AzureSubscriptionsInternal {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context
    )
    
    $subscriptions = @()
    
    # Get all subscriptions
    $azSubs = Get-AzSubscription -ErrorAction Stop -WarningAction SilentlyContinue
    
    if (-not $azSubs) {
        Write-AzureLog -Message "No subscriptions found or accessible" -Level "WARN" -Context $Context
        return $subscriptions
    }
    
    # Apply subscription filter if configured
    $subscriptionFilter = @()
    if ($Configuration.azure -and $Configuration.azure.subscriptionFilter -and $Configuration.azure.subscriptionFilter.Count -gt 0) {
        $subscriptionFilter = $Configuration.azure.subscriptionFilter
        Write-AzureLog -Message "Applying subscription filter: $($subscriptionFilter -join ', ')" -Level "DEBUG" -Context $Context
    }
    
    foreach ($sub in $azSubs) {
        # Skip if filter is configured and subscription not in filter
        if ($subscriptionFilter.Count -gt 0) {
            if ($sub.Name -notin $subscriptionFilter -and $sub.Id -notin $subscriptionFilter) {
                Write-AzureLog -Message "Skipping filtered subscription: $($sub.Name)" -Level "DEBUG" -Context $Context
                continue
            }
        }
        
        $subscriptions += [PSCustomObject]@{
            SubscriptionId = $sub.Id
            Name = $sub.Name
            State = $sub.State
            TenantId = $sub.TenantId
        }
    }
    
    return $subscriptions
}

function Get-AzureResourceGroupsInternal {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context,
        [array]$Subscriptions
    )
    
    $resourceGroups = @()
    $errors = 0
    
    foreach ($sub in $Subscriptions) {
        try {
            Write-AzureLog -Message "Getting resource groups for subscription: $($sub.Name)" -Level "DEBUG" -Context $Context
            
            # Set context to subscription
            $null = Set-AzContext -SubscriptionId $sub.SubscriptionId -ErrorAction Stop
            
            # Get resource groups
            $rgs = Get-AzResourceGroup -ErrorAction Stop
            
            # Apply resource group filter if configured
            $rgFilter = @()
            if ($Configuration.azure -and $Configuration.azure.resourceGroupFilter -and $Configuration.azure.resourceGroupFilter.Count -gt 0) {
                $rgFilter = $Configuration.azure.resourceGroupFilter
            }
            
            foreach ($rg in $rgs) {
                # Skip if filter is configured and RG not in filter
                if ($rgFilter.Count -gt 0 -and $rg.ResourceGroupName -notin $rgFilter) {
                    Write-AzureLog -Message "Skipping filtered resource group: $($rg.ResourceGroupName)" -Level "DEBUG" -Context $Context
                    continue
                }
                
                $resourceGroups += [PSCustomObject]@{
                    SubscriptionId = $sub.SubscriptionId
                    SubscriptionName = $sub.Name
                    ResourceGroupName = $rg.ResourceGroupName
                    Location = $rg.Location
                    ProvisioningState = $rg.ProvisioningState
                    Tags = if ($rg.Tags -and $rg.Tags.Count -gt 0) { 
                        ($rg.Tags.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ';' 
                    } else { 
                        $null 
                    }
                    ResourceId = $rg.ResourceId
                }
            }
        } catch {
            $errors++
            Write-AzureLog -Message "Error getting resource groups for $($sub.Name): $($_.Exception.Message)" -Level "WARN" -Context $Context
        }
    }
    
    if ($errors -gt 0) {
        Write-AzureLog -Message "Completed with $errors errors" -Level "WARN" -Context $Context
    }
    
    return $resourceGroups
}

function Get-AzureVirtualMachinesInternal {
    param(
        [hashtable]$Configuration,
        [hashtable]$Context,
        [array]$Subscriptions
    )
    
    $virtualMachines = @()
    $errors = 0
    
    foreach ($sub in $Subscriptions) {
        try {
            Write-AzureLog -Message "Getting VMs for subscription: $($sub.Name)" -Level "DEBUG" -Context $Context
            
            # Set context to subscription
            $null = Set-AzContext -SubscriptionId $sub.SubscriptionId -ErrorAction Stop
            
            # Get VMs with status
            $vms = Get-AzVM -Status -ErrorAction Stop
            
            foreach ($vm in $vms) {
                # Get power state from statuses
                $powerState = 'Unknown'
                if ($vm.Statuses) {
                    $powerStateStatus = $vm.Statuses | Where-Object { $_.Code -like 'PowerState/*' } | Select-Object -First 1
                    if ($powerStateStatus) {
                        $powerState = $powerStateStatus.DisplayStatus
                    }
                }
                
                $virtualMachines += [PSCustomObject]@{
                    SubscriptionId = $sub.SubscriptionId
                    SubscriptionName = $sub.Name
                    ResourceGroupName = $vm.ResourceGroupName
                    Name = $vm.Name
                    Location = $vm.Location
                    VmSize = $vm.HardwareProfile.VmSize
                    ProvisioningState = $vm.ProvisioningState
                    PowerState = $powerState
                    OsType = $vm.StorageProfile.OsDisk.OsType
                    OsPublisher = $vm.StorageProfile.ImageReference.Publisher
                    OsOffer = $vm.StorageProfile.ImageReference.Offer
                    OsSku = $vm.StorageProfile.ImageReference.Sku
                    OsVersion = $vm.StorageProfile.ImageReference.Version
                    VmId = $vm.VmId
                    Tags = if ($vm.Tags -and $vm.Tags.Count -gt 0) { 
                        ($vm.Tags.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ';' 
                    } else { 
                        $null 
                    }
                }
            }
        } catch {
            $errors++
            Write-AzureLog -Message "Error getting VMs for $($sub.Name): $($_.Exception.Message)" -Level "WARN" -Context $Context
        }
    }
    
    if ($errors -gt 0) {
        Write-AzureLog -Message "Completed with $errors errors" -Level "WARN" -Context $Context
    }
    
    return $virtualMachines
}

function Export-DiscoveryData {
    param(
        [array]$Data,
        [string]$OutputPath,
        [string]$FileName,
        [string]$ModuleName
    )
    
    if ($Data.Count -eq 0) {
        return
    }
    
    # Add metadata to each record
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $Data | ForEach-Object {
        $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
        $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value $ModuleName -Force
    }
    
    # Export to CSV
    $filePath = Join-Path $OutputPath $FileName
    $Data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
}

# --- Module Export ---
Export-ModuleMember -Function Invoke-AzureDiscovery