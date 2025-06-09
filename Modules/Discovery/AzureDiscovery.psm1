# -*- coding: utf-8-bom -*-
#Requires -Version 5.1
#Requires -Modules Az.Accounts, Az.Resources

<#
.SYNOPSIS
    Azure resource discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers Azure subscriptions, resource groups, and virtual machines
.NOTES
    Author: M&A Discovery Team
    Version: 7.1.0
    Last Modified: 2025-06-09
#>

# Module-scope context variable
$script:ModuleContext = $null

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

function Test-AzureConnection {
    param($Context)
    
    try {
        $azContext = Get-AzContext -ErrorAction Stop
        if (-not $azContext) {
            return $false
        }
        
        # Test with simple subscription query
        $null = Get-AzSubscription -ErrorAction Stop | Select-Object -First 1
        return $true
    } catch {
        Write-AzureLog -Message "Azure connection test failed: $_" -Level "ERROR" -Context $Context
        return $false
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
        
        $azSubs = Get-AzSubscription -ErrorAction Stop
        
        foreach ($sub in $azSubs) {
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
        Write-AzureLog -Message "Failed to retrieve subscriptions: $_" -Level "ERROR" -Context $Context
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
    
    foreach ($sub in $Subscriptions) {
        try {
            Write-AzureLog -Message "Getting resource groups for subscription: $($sub.Name)" -Level "DEBUG" -Context $Context
            
            # Set context to subscription
            $null = Set-AzContext -SubscriptionId $sub.SubscriptionId -ErrorAction Stop
            
            $rgs = Get-AzResourceGroup -ErrorAction Stop
            
            foreach ($rg in $rgs) {
                $resourceGroups += [PSCustomObject]@{
                    SubscriptionId = $sub.SubscriptionId
                    SubscriptionName = $sub.Name
                    ResourceGroupName = $rg.ResourceGroupName
                    Location = $rg.Location
                    ProvisioningState = $rg.ProvisioningState
                    Tags = if ($rg.Tags) { ($rg.Tags.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ';' } else { $null }
                    _DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                    _DiscoveryModule = 'Azure'
                }
            }
        } catch {
            Write-AzureLog -Message "Error getting resource groups for $($sub.Name): $_" -Level "WARN" -Context $Context
        }
    }
    
    Write-AzureLog -Message "Retrieved $($resourceGroups.Count) resource groups" -Level "INFO" -Context $Context
    return $resourceGroups
}

function Get-AzureVirtualMachinesData {
    param(
        [hashtable]$Configuration,
        $Context,
        $Subscriptions
    )
    
    $virtualMachines = @()
    
    foreach ($sub in $Subscriptions) {
        try {
            Write-AzureLog -Message "Getting VMs for subscription: $($sub.Name)" -Level "DEBUG" -Context $Context
            
            # Set context to subscription
            $null = Set-AzContext -SubscriptionId $sub.SubscriptionId -ErrorAction Stop
            
            $vms = Get-AzVM -Status -ErrorAction Stop
            
            foreach ($vm in $vms) {
                $virtualMachines += [PSCustomObject]@{
                    SubscriptionId = $sub.SubscriptionId
                    SubscriptionName = $sub.Name
                    ResourceGroupName = $vm.ResourceGroupName
                    Name = $vm.Name
                    Location = $vm.Location
                    VmSize = $vm.HardwareProfile.VmSize
                    ProvisioningState = $vm.ProvisioningState
                    PowerState = ($vm.Statuses | Where-Object { $_.Code -like 'PowerState/*' } | Select-Object -First 1).DisplayStatus
                    OsType = $vm.StorageProfile.OsDisk.OsType
                    OsName = $vm.StorageProfile.ImageReference.Offer
                    OsSku = $vm.StorageProfile.ImageReference.Sku
                    Tags = if ($vm.Tags) { ($vm.Tags.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ';' } else { $null }
                    _DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                    _DiscoveryModule = 'Azure'
                }
            }
        } catch {
            Write-AzureLog -Message "Error getting VMs for $($sub.Name): $_" -Level "WARN" -Context $Context
        }
    }
    
    Write-AzureLog -Message "Retrieved $($virtualMachines.Count) virtual machines" -Level "INFO" -Context $Context
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
            $Data | Export-Csv -Path $FilePath -NoTypeInformation -Encoding UTF8
            Write-AzureLog -Message "Exported $($Data.Count) $DataType records to $([System.IO.Path]::GetFileName($FilePath))" -Level "SUCCESS" -Context $Context
        } else {
            Write-AzureLog -Message "No $DataType data to export" -Level "WARN" -Context $Context
        }
    } catch {
        Write-AzureLog -Message "Failed to export $DataType data: $_" -Level "ERROR" -Context $Context
        throw
    }
}

# Main discovery function - matches orchestrator expectations
function Invoke-AzureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        $Context
    )
    
    # Initialize result using the globally defined DiscoveryResult class
    $result = [DiscoveryResult]::new('Azure')
    
    try {
        Write-AzureLog -Message "Starting Azure Discovery..." -Level "INFO" -Context $Context
        
        # Check prerequisites
        if (-not (Test-AzureConnection -Context $Context)) {
            $result.AddError("Azure connection not available", $null, @{
                Component = "AzureConnection"
                Resolution = "Ensure Azure PowerShell is connected using Connect-AzAccount"
            })
            return $result
        }
        
        # Get output path
        $outputPath = Join-Path $Context.Paths.RawDataOutput ""
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
        }
        
        # Discover subscriptions
        $subscriptions = @()
        try {
            $subscriptions = Get-AzureSubscriptionsData -Configuration $Configuration -Context $Context
            $result.Metadata['SubscriptionCount'] = $subscriptions.Count
            
            if ($subscriptions.Count -gt 0) {
                Export-AzureData -FilePath (Join-Path $outputPath "AzureSubscriptions.csv") `
                    -Data $subscriptions -DataType "subscriptions" -Context $Context
            }
        } catch {
            $result.AddError("Failed to discover Azure subscriptions", $_.Exception, @{
                Operation = "GetSubscriptions"
            })
        }
        
        # Only continue if we have subscriptions
        if ($subscriptions.Count -gt 0) {
            # Discover resource groups
            try {
                $resourceGroups = Get-AzureResourceGroupsData -Configuration $Configuration -Context $Context -Subscriptions $subscriptions
                $result.Metadata['ResourceGroupCount'] = $resourceGroups.Count
                
                if ($resourceGroups.Count -gt 0) {
                    Export-AzureData -FilePath (Join-Path $outputPath "AzureResourceGroups.csv") `
                        -Data $resourceGroups -DataType "resource groups" -Context $Context
                }
            } catch {
                $result.AddError("Failed to discover resource groups", $_.Exception, @{
                    Operation = "GetResourceGroups"
                })
            }
            
            # Discover virtual machines
            try {
                $virtualMachines = Get-AzureVirtualMachinesData -Configuration $Configuration -Context $Context -Subscriptions $subscriptions
                $result.Metadata['VirtualMachineCount'] = $virtualMachines.Count
                
                if ($virtualMachines.Count -gt 0) {
                    Export-AzureData -FilePath (Join-Path $outputPath "AzureVirtualMachines.csv") `
                        -Data $virtualMachines -DataType "virtual machines" -Context $Context
                }
            } catch {
                $result.AddError("Failed to discover virtual machines", $_.Exception, @{
                    Operation = "GetVirtualMachines"
                })
            }
        } else {
            $result.AddWarning("No Azure subscriptions found or accessible")
        }
        
        # Set overall success based on critical data
        $result.Success = ($subscriptions.Count -gt 0)
        
    } catch {
        $result.AddError("Unexpected error in Azure discovery", $_.Exception, @{
            Operation = "AzureDiscovery"
        })
    } finally {
        $result.Complete()
        Write-AzureLog -Message "Azure Discovery completed. Success: $($result.Success), Errors: $($result.Errors.Count)" -Level "INFO" -Context $Context
    }
    
    return $result
}

# Export the required function
Export-ModuleMember -Function Invoke-AzureDiscovery