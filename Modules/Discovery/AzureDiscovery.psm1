# -*- coding: utf-8-bom -*-
#Requires -Version 5.1
#Requires -Modules Az.Accounts, Az.Resources

<#
.SYNOPSIS
    Azure resource discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers Azure subscriptions, resource groups, and virtual machines with proper
    authentication integration and error handling
.NOTES
    Author: M&A Discovery Team
    Version: 7.2.0
    Last Modified: 2025-06-10
    Changes:
    - Fixed authentication flow to use suite credentials
    - Removed duplicate function exports
    - Added proper error handling and logging
    - Integrated with suite's authentication context
#>

# Module-scope context variable
$script:ModuleContext = $null
$script:AzureConnected = $false
$script:LastConnectionAttempt = $null

# Lazy initialization function
function Get-ModuleContext {
    if ($null -eq $script:ModuleContext) {
        if ($null -ne $global:MandA) {
            $script:ModuleContext = $global:MandA
        } else {
            throw "Module context not available"
        }
    }
    return $script:ModuleContext
}

function Invoke-SafeModuleExecution {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory=$true)]
        [string]$ModuleName,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $result = @{
        Success = $false
        Data = $null
        Error = $null
        Duration = $null
    }
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        # Validate global context
        if (-not $global:MandA -or -not $global:MandA.Initialized) {
            throw "Global M&A context not initialized"
        }
        
        # Execute the module function
        $result.Data = & $ScriptBlock
        $result.Success = $true
        
    } catch {
        $result.Error = @{
            Message = $_.Exception.Message
            Type = $_.Exception.GetType().FullName
            StackTrace = $_.ScriptStackTrace
            InnerException = if ($_.Exception.InnerException) { $_.Exception.InnerException.Message } else { $null }
        }
        
        # Log to both file and console
        if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
            Write-MandALog -Message "[$ModuleName] Error: $($_.Exception.Message)" -Level "ERROR" -Component $ModuleName -Context $Context
        } else {
            Write-Host "[$ModuleName] Error: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Don't rethrow - let caller handle based on result
    } finally {
        $stopwatch.Stop()
        $result.Duration = $stopwatch.Elapsed
    }
    
    return $result
}

function Write-AzureLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        $Context
    )
    
    if (Get-Command Write-MandALog -ErrorAction SilentlyContinue) {
        Write-MandALog -Message "[Azure] $Message" -Level $Level -Component "AzureDiscovery" -Context $Context
    } else {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "DEBUG" { "Gray" }
            default { "White" }
        }
        Write-Host "[Azure] $Message" -ForegroundColor $color
    }
}

function Connect-AzureWithServicePrincipal {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    try {
        # Check if we recently tried to connect (within 5 minutes)
        if ($script:LastConnectionAttempt -and ((Get-Date) - $script:LastConnectionAttempt).TotalMinutes -lt 5) {
            if (-not $script:AzureConnected) {
                Write-AzureLog -Message "Recent connection attempt failed, skipping retry" -Level "WARN" -Context $Context
                return $false
            }
        }
        
        $script:LastConnectionAttempt = Get-Date
        
        # Check if already connected
        $currentContext = Get-AzContext -ErrorAction SilentlyContinue
        if ($currentContext) {
            Write-AzureLog -Message "Already connected to Azure as $($currentContext.Account.Id)" -Level "INFO" -Context $Context
            $script:AzureConnected = $true
            return $true
        }
        
        # Get authentication context from the suite
        Write-AzureLog -Message "Getting authentication context..." -Level "DEBUG" -Context $Context
        
        # Try to get auth context from the Authentication module
        $authContext = $null
        if (Get-Command Get-AuthenticationContext -ErrorAction SilentlyContinue) {
            $authContext = Get-AuthenticationContext
        }
        
        if (-not $authContext) {
            Write-AzureLog -Message "No authentication context available from suite" -Level "ERROR" -Context $Context
            return $false
        }
        
        # Validate required properties
        if (-not $authContext.ClientId -or -not $authContext.ClientSecret -or -not $authContext.TenantId) {
            Write-AzureLog -Message "Authentication context missing required properties" -Level "ERROR" -Context $Context
            return $false
        }
        
        Write-AzureLog -Message "Connecting to Azure using service principal..." -Level "INFO" -Context $Context
        
        # Convert client secret to secure string
        $securePassword = ConvertTo-SecureString $authContext.ClientSecret -AsPlainText -Force
        $credential = New-Object System.Management.Automation.PSCredential($authContext.ClientId, $securePassword)
        
        # Connect to Azure
        $connectionParams = @{
            ServicePrincipal = $true
            Credential = $credential
            Tenant = $authContext.TenantId
            ErrorAction = 'Stop'
            WarningAction = 'SilentlyContinue'
        }
        
        $null = Connect-AzAccount @connectionParams
        
        # Verify connection
        $newContext = Get-AzContext -ErrorAction Stop
        if ($newContext) {
            Write-AzureLog -Message "Successfully connected to Azure tenant: $($newContext.Tenant.Id)" -Level "SUCCESS" -Context $Context
            $script:AzureConnected = $true
            return $true
        } else {
            throw "Connection succeeded but no context available"
        }
        
    } catch {
        $script:AzureConnected = $false
        Write-AzureLog -Message "Failed to connect to Azure: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        return $false
    }
}

function Test-AzureConnection {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    try {
        $azContext = Get-AzContext -ErrorAction SilentlyContinue
        if (-not $azContext) {
            # Try to connect
            Write-AzureLog -Message "No Azure context found, attempting to connect..." -Level "INFO" -Context $Context
            return Connect-AzureWithServicePrincipal -Configuration $Configuration -Context $Context
        }
        
        # Test with simple subscription query
        Write-AzureLog -Message "Testing Azure connection..." -Level "DEBUG" -Context $Context
        $testSub = Get-AzSubscription -ErrorAction Stop | Select-Object -First 1
        
        if ($testSub) {
            Write-AzureLog -Message "Azure connection verified" -Level "DEBUG" -Context $Context
            $script:AzureConnected = $true
            return $true
        } else {
            Write-AzureLog -Message "Azure connection test failed - no subscriptions accessible" -Level "WARN" -Context $Context
            # Try to reconnect
            return Connect-AzureWithServicePrincipal -Configuration $Configuration -Context $Context
        }
    } catch {
        Write-AzureLog -Message "Azure connection test failed: $($_.Exception.Message)" -Level "WARN" -Context $Context
        # Try to connect
        return Connect-AzureWithServicePrincipal -Configuration $Configuration -Context $Context
    }
}

function Get-AzureSubscriptionsData {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    $subscriptions = @()
    
    try {
        Write-AzureLog -Message "Retrieving Azure subscriptions..." -Level "INFO" -Context $Context
        
        # Get all subscriptions
        $azSubs = Get-AzSubscription -ErrorAction Stop -WarningAction SilentlyContinue
        
        if (-not $azSubs) {
            Write-AzureLog -Message "No subscriptions found or accessible" -Level "WARN" -Context $Context
            return $subscriptions
        }
        
        # Apply subscription filter if configured
        $subscriptionFilter = @()
        if ($Configuration.azure -and $Configuration.azure.subscriptionFilter) {
            $subscriptionFilter = $Configuration.azure.subscriptionFilter
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
                _DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                _DiscoveryModule = 'Azure'
            }
        }
        
        Write-AzureLog -Message "Retrieved $($subscriptions.Count) subscriptions" -Level "SUCCESS" -Context $Context
    } catch {
        Write-AzureLog -Message "Failed to retrieve subscriptions: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
    
    return $subscriptions
}

function Get-AzureResourceGroupsData {
    param(
        [hashtable]$Configuration,
        $Context,
        $Subscriptions
    )
    
    $resourceGroups = @()
    $errors = 0
    
    foreach ($sub in $Subscriptions) {
        try {
            Write-AzureLog -Message "Getting resource groups for subscription: $($sub.Name)" -Level "DEBUG" -Context $Context
            
            # Set context to subscription
            $null = Set-AzContext -SubscriptionId $sub.SubscriptionId -ErrorAction Stop
            
            # Get resource groups with filter support
            $rgs = Get-AzResourceGroup -ErrorAction Stop
            
            # Apply resource group filter if configured
            $rgFilter = @()
            if ($Configuration.azure -and $Configuration.azure.resourceGroupFilter) {
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
                    _DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                    _DiscoveryModule = 'Azure'
                }
            }
        } catch {
            $errors++
            Write-AzureLog -Message "Error getting resource groups for $($sub.Name): $($_.Exception.Message)" -Level "WARN" -Context $Context
        }
    }
    
    Write-AzureLog -Message "Retrieved $($resourceGroups.Count) resource groups (Errors: $errors)" -Level "INFO" -Context $Context
    return $resourceGroups
}

function Get-AzureVirtualMachinesData {
    param(
        [hashtable]$Configuration,
        $Context,
        $Subscriptions
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
                    _DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                    _DiscoveryModule = 'Azure'
                }
            }
        } catch {
            $errors++
            Write-AzureLog -Message "Error getting VMs for $($sub.Name): $($_.Exception.Message)" -Level "WARN" -Context $Context
        }
    }
    
    Write-AzureLog -Message "Retrieved $($virtualMachines.Count) virtual machines (Errors: $errors)" -Level "INFO" -Context $Context
    return $virtualMachines
}

function Export-AzureData {
    param(
        [string]$FilePath,
        [array]$Data,
        [string]$DataType,
        $Context
    )
    
    try {
        if ($Data.Count -gt 0) {
            # Ensure directory exists
            $directory = Split-Path -Path $FilePath -Parent
            if (-not (Test-Path $directory)) {
                New-Item -Path $directory -ItemType Directory -Force | Out-Null
            }
            
            # Export data
            $Data | Export-Csv -Path $FilePath -NoTypeInformation -Encoding UTF8
            Write-AzureLog -Message "Exported $($Data.Count) $DataType records to $([System.IO.Path]::GetFileName($FilePath))" -Level "SUCCESS" -Context $Context
        } else {
            Write-AzureLog -Message "No $DataType data to export" -Level "WARN" -Context $Context
        }
    } catch {
        Write-AzureLog -Message "Failed to export $DataType data: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

# Main discovery function called by orchestrator
function Invoke-AzureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    # Ensure DiscoveryResult is available
    if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        # Fallback to hashtable-based result
        Write-AzureLog -Message "DiscoveryResult class not available, using hashtable" -Level "WARN" -Context $Context
        return @{
            Success = $false
            ModuleName = 'Azure'
            Error = "DiscoveryResult class not available"
            Data = $null
            Errors = @()
            Warnings = @()
        }
    }
    
    # Initialize result using the globally defined DiscoveryResult class
    $result = [DiscoveryResult]::new('Azure')
    
    try {
        Write-AzureLog -Message "Starting Azure Discovery..." -Level "INFO" -Context $Context
        
        # Validate required Az modules
        $requiredModules = @('Az.Accounts', 'Az.Resources')
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -Name $module -ListAvailable)) {
                $result.AddError("Required module '$module' not installed", $null, @{
                    Component = "Prerequisites"
                    Resolution = "Install-Module -Name $module -Force -AllowClobber"
                })
                Write-AzureLog -Message "Required module '$module' not found" -Level "ERROR" -Context $Context
                return $result
            }
            
            # Import module if not already loaded
            if (-not (Get-Module -Name $module)) {
                Write-AzureLog -Message "Importing module: $module" -Level "DEBUG" -Context $Context
                Import-Module $module -ErrorAction Stop
            }
        }
        
        # Check/establish Azure connection
        if (-not (Test-AzureConnection -Configuration $Configuration -Context $Context)) {
            $result.AddError("Failed to establish Azure connection", $null, @{
                Component = "AzureConnection"
                Resolution = "Verify service principal credentials and permissions"
            })
            Write-AzureLog -Message "Azure connection could not be established" -Level "ERROR" -Context $Context
            return $result
        }
        
        # Get output path
        $outputPath = if ($Context -and $Context.Paths -and $Context.Paths.RawDataOutput) {
            $Context.Paths.RawDataOutput
        } else {
            ".\Output\RawData"
        }
        
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
            Write-AzureLog -Message "Created output directory: $outputPath" -Level "DEBUG" -Context $Context
        }
        
        # Initialize counters
        $totalItems = 0
        
        # Discover subscriptions
        $subscriptions = @()
        try {
            $subscriptions = Get-AzureSubscriptionsData -Configuration $Configuration -Context $Context
            $result.Metadata['SubscriptionCount'] = $subscriptions.Count
            $totalItems += $subscriptions.Count
            
            if ($subscriptions.Count -gt 0) {
                Export-AzureData -FilePath (Join-Path $outputPath "AzureSubscriptions.csv") `
                    -Data $subscriptions -DataType "subscriptions" -Context $Context
            } else {
                $result.AddWarning("No Azure subscriptions found or accessible", @{
                    Component = "Subscriptions"
                    PossibleCause = "Service principal may lack subscription read permissions"
                })
            }
        } catch {
            $result.AddError("Failed to discover Azure subscriptions", $_.Exception, @{
                Operation = "GetSubscriptions"
                ErrorType = $_.Exception.GetType().FullName
            })
        }
        
        # Only continue if we have subscriptions
        if ($subscriptions.Count -gt 0) {
            # Discover resource groups
            try {
                $resourceGroups = Get-AzureResourceGroupsData -Configuration $Configuration -Context $Context -Subscriptions $subscriptions
                $result.Metadata['ResourceGroupCount'] = $resourceGroups.Count
                $totalItems += $resourceGroups.Count
                
                if ($resourceGroups.Count -gt 0) {
                    Export-AzureData -FilePath (Join-Path $outputPath "AzureResourceGroups.csv") `
                        -Data $resourceGroups -DataType "resource groups" -Context $Context
                }
            } catch {
                $result.AddError("Failed to discover resource groups", $_.Exception, @{
                    Operation = "GetResourceGroups"
                    ErrorType = $_.Exception.GetType().FullName
                })
            }
            
            # Discover virtual machines
            try {
                $virtualMachines = Get-AzureVirtualMachinesData -Configuration $Configuration -Context $Context -Subscriptions $subscriptions
                $result.Metadata['VirtualMachineCount'] = $virtualMachines.Count
                $totalItems += $virtualMachines.Count
                
                if ($virtualMachines.Count -gt 0) {
                    Export-AzureData -FilePath (Join-Path $outputPath "AzureVirtualMachines.csv") `
                        -Data $virtualMachines -DataType "virtual machines" -Context $Context
                }
            } catch {
                $result.AddError("Failed to discover virtual machines", $_.Exception, @{
                    Operation = "GetVirtualMachines"
                    ErrorType = $_.Exception.GetType().FullName
                })
            }
        } else {
            $result.AddWarning("Skipping resource discovery due to no accessible subscriptions")
        }
        
        # Set metadata
        $result.Metadata['TotalItemsDiscovered'] = $totalItems
        $result.Metadata['OutputPath'] = $outputPath
        
        # Set overall success based on critical data
        $result.Success = ($subscriptions.Count -gt 0) -or ($result.Errors.Count -eq 0)
        
        # Set record count for orchestrator
        $result.RecordCount = $totalItems
        
    } catch {
        $result.AddError("Unexpected error in Azure discovery", $_.Exception, @{
            Operation = "AzureDiscovery"
            ErrorType = $_.Exception.GetType().FullName
        })
        $result.Success = $false
    } finally {
        $result.Complete()
        
        # Log summary
        $summary = "Azure Discovery completed. Success: $($result.Success), Items: $($result.RecordCount), Errors: $($result.Errors.Count), Warnings: $($result.Warnings.Count)"
        $logLevel = if ($result.Success) { "SUCCESS" } else { "ERROR" }
        Write-AzureLog -Message $summary -Level $logLevel -Context $Context
    }
    
    return $result
}

# Export only the main discovery function
Export-ModuleMember -Function Invoke-AzureDiscovery