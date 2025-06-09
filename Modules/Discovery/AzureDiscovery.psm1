# -*- coding: utf-8-bom -*-
#Requires -Version 5.1
#Requires -Modules Az.Accounts, Az.Resources

<#
.SYNOPSIS
    Azure resource discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers Azure subscriptions, resource groups, and virtual machines.
    Designed to run in isolated runspaces with dependency injection.
.NOTES
    Author: M&A Discovery Team
    Version: 8.0.0
    Last Modified: 2025-06-10
    Changes:
    - Complete rewrite for runspace isolation
    - Authentication via Configuration parameter
    - Self-contained with fallback functions
    - Mandatory Context parameter
#>

# Module-scope variables
$script:AzureConnected = $false
$script:LastConnectionAttempt = $null

# Fallback logging function for runspace isolation
if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
    function Write-MandALog {
        param(
            [string]$Message,
            [string]$Level = "INFO",
            [string]$Component = "General",
            $Context
        )
        
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $color = switch ($Level.ToUpper()) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            "DEBUG" { "Gray" }
            "CRITICAL" { "Magenta" }
            default { "White" }
        }
        
        Write-Host "$timestamp [$Level] [$Component] $Message" -ForegroundColor $color
        
        # Try to write to log file if context provides path
        if ($Context -and $Context.Paths -and $Context.Paths.LogOutput) {
            try {
                $logFile = Join-Path $Context.Paths.LogOutput "discovery_$(Get-Date -Format 'yyyyMMdd').log"
                $logEntry = "$timestamp [$Level] [$Component] $Message"
                Add-Content -Path $logFile -Value $logEntry -Encoding UTF8 -ErrorAction SilentlyContinue
            } catch {
                # Silently ignore log file errors in isolated runspace
            }
        }
    }
}

# Wrapper for consistent Azure logging
function Write-AzureLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        $Context
    )
    
    Write-MandALog -Message "[Azure] $Message" -Level $Level -Component "AzureDiscovery" -Context $Context
}

# Connect to Azure using credentials from Configuration
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
        try {
            $currentContext = Get-AzContext -ErrorAction Stop
            if ($currentContext) {
                Write-AzureLog -Message "Already connected to Azure as $($currentContext.Account.Id)" -Level "INFO" -Context $Context
                $script:AzureConnected = $true
                return $true
            }
        } catch {
            # No context, need to connect
        }
        
        # Extract authentication information from Configuration
        $authInfo = $null
        
        # Check multiple possible locations for auth info
        if ($Configuration.ContainsKey('_AuthContext')) {
            # Orchestrator might inject auth context directly
            $authInfo = $Configuration._AuthContext
            Write-AzureLog -Message "Found auth context in Configuration._AuthContext" -Level "DEBUG" -Context $Context
        }
        elseif ($Configuration.ContainsKey('_Credentials')) {
            # Or directly as credentials
            $authInfo = $Configuration._Credentials
            Write-AzureLog -Message "Found credentials in Configuration._Credentials" -Level "DEBUG" -Context $Context
        }
        elseif ($Configuration.authentication -and $Configuration.authentication.ContainsKey('_Credentials')) {
            # Or nested in authentication section
            $authInfo = $Configuration.authentication._Credentials
            Write-AzureLog -Message "Found credentials in Configuration.authentication._Credentials" -Level "DEBUG" -Context $Context
        }
        elseif ($Configuration.ContainsKey('ClientId') -and $Configuration.ContainsKey('ClientSecret') -and $Configuration.ContainsKey('TenantId')) {
            # Or directly in Configuration
            $authInfo = @{
                ClientId = $Configuration.ClientId
                ClientSecret = $Configuration.ClientSecret
                TenantId = $Configuration.TenantId
            }
            Write-AzureLog -Message "Found credentials directly in Configuration" -Level "DEBUG" -Context $Context
        }
        else {
            Write-AzureLog -Message "No authentication information found in Configuration" -Level "ERROR" -Context $Context
            Write-AzureLog -Message "Configuration keys: $($Configuration.Keys -join ', ')" -Level "DEBUG" -Context $Context
            return $false
        }
        
        # Validate required properties
        if (-not $authInfo.ClientId -or -not $authInfo.ClientSecret -or -not $authInfo.TenantId) {
            Write-AzureLog -Message "Authentication info missing required properties (ClientId, ClientSecret, or TenantId)" -Level "ERROR" -Context $Context
            return $false
        }
        
        Write-AzureLog -Message "Connecting to Azure using service principal..." -Level "INFO" -Context $Context
        
        # Convert client secret to secure string
        $securePassword = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
        $credential = New-Object System.Management.Automation.PSCredential($authInfo.ClientId, $securePassword)
        
        # Connect to Azure
        $connectionParams = @{
            ServicePrincipal = $true
            Credential = $credential
            Tenant = $authInfo.TenantId
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

# Test Azure connection
function Test-AzureConnection {
    param(
        [hashtable]$Configuration,
        $Context
    )
    
    try {
        # Try to get current context
        $azContext = Get-AzContext -ErrorAction SilentlyContinue
        
        if (-not $azContext) {
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

# Get Azure subscriptions
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

# Get Azure resource groups
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

# Get Azure virtual machines
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

# Export data to CSV
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
        
        [Parameter(Mandatory=$true)]  # Made mandatory as per fix
        $Context
    )
    
    # Debug output for troubleshooting
    Write-AzureLog -Message "Starting Azure Discovery (v8.0.0)" -Level "INFO" -Context $Context
    Write-AzureLog -Message "Configuration keys: $($Configuration.Keys -join ', ')" -Level "DEBUG" -Context $Context
    Write-AzureLog -Message "Context type: $($Context.GetType().Name)" -Level "DEBUG" -Context $Context
    
    # Initialize result - handle missing DiscoveryResult class
    $result = $null
    
    try {
        # Check if DiscoveryResult class is available
        if ([System.Management.Automation.PSTypeName]'DiscoveryResult' -and 
            ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            $result = [DiscoveryResult]::new('Azure')
            Write-AzureLog -Message "Using DiscoveryResult class" -Level "DEBUG" -Context $Context
        } else {
            # Fallback to hashtable that mimics DiscoveryResult
            Write-AzureLog -Message "DiscoveryResult class not available, using hashtable fallback" -Level "WARN" -Context $Context
            $result = @{
                Success = $true
                ModuleName = 'Azure'
                Data = $null
                Errors = [System.Collections.ArrayList]::new()
                Warnings = [System.Collections.ArrayList]::new()
                Metadata = @{}
                StartTime = Get-Date
                EndTime = $null
                ExecutionId = [guid]::NewGuid().ToString()
                RecordCount = 0
                
                # Methods
                AddError = {
                    param($Message, $Exception, $Context)
                    $this.Errors.Add(@{
                        Timestamp = Get-Date
                        Message = $Message
                        Exception = if ($Exception) { $Exception.ToString() } else { $null }
                        ExceptionType = if ($Exception) { $Exception.GetType().FullName } else { $null }
                        Context = $Context
                    }) | Out-Null
                    $this.Success = $false
                }.GetNewClosure()
                
                AddWarning = {
                    param($Message, $Context)
                    $this.Warnings.Add(@{
                        Timestamp = Get-Date
                        Message = $Message
                        Context = $Context
                    }) | Out-Null
                }.GetNewClosure()
                
                Complete = {
                    $this.EndTime = Get-Date
                    if ($this.StartTime -and $this.EndTime) {
                        $duration = $this.EndTime - $this.StartTime
                        $this.Metadata['Duration'] = $duration
                        $this.Metadata['DurationSeconds'] = $duration.TotalSeconds
                    }
                }.GetNewClosure()
            }
        }
    } catch {
        Write-AzureLog -Message "Error initializing result object: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        # Create minimal result object
        return @{
            Success = $false
            ModuleName = 'Azure'
            Error = "Failed to initialize result object: $($_.Exception.Message)"
            Data = $null
            Errors = @(@{ Message = $_.Exception.Message; Timestamp = Get-Date })
            Warnings = @()
        }
    }
    
    try {
        # Validate required Az modules
        $requiredModules = @('Az.Accounts', 'Az.Resources')
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -Name $module -ListAvailable)) {
                if ($result.AddError) {
                    $result.AddError("Required module '$module' not installed", $null, @{
                        Component = "Prerequisites"
                        Resolution = "Install-Module -Name $module -Force -AllowClobber"
                    })
                } else {
                    $result.Errors.Add(@{
                        Message = "Required module '$module' not installed"
                        Component = "Prerequisites"
                    }) | Out-Null
                    $result.Success = $false
                }
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
            if ($result.AddError) {
                $result.AddError("Failed to establish Azure connection", $null, @{
                    Component = "AzureConnection"
                    Resolution = "Verify service principal credentials and permissions"
                })
            } else {
                $result.Errors.Add(@{
                    Message = "Failed to establish Azure connection"
                    Component = "AzureConnection"
                }) | Out-Null
                $result.Success = $false
            }
            Write-AzureLog -Message "Azure connection could not be established" -Level "ERROR" -Context $Context
            return $result
        }
        
        # Get output path from Context
        $outputPath = if ($Context.Paths -and $Context.Paths.RawDataOutput) {
            $Context.Paths.RawDataOutput
        } else {
            Write-AzureLog -Message "Warning: Context.Paths.RawDataOutput not found, using fallback" -Level "WARN" -Context $Context
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
                if ($result.AddWarning) {
                    $result.AddWarning("No Azure subscriptions found or accessible", @{
                        Component = "Subscriptions"
                        PossibleCause = "Service principal may lack subscription read permissions"
                    })
                } else {
                    $result.Warnings.Add(@{
                        Message = "No Azure subscriptions found or accessible"
                        Component = "Subscriptions"
                    }) | Out-Null
                }
            }
        } catch {
            if ($result.AddError) {
                $result.AddError("Failed to discover Azure subscriptions", $_.Exception, @{
                    Operation = "GetSubscriptions"
                    ErrorType = $_.Exception.GetType().FullName
                })
            } else {
                $result.Errors.Add(@{
                    Message = "Failed to discover Azure subscriptions: $($_.Exception.Message)"
                    Operation = "GetSubscriptions"
                }) | Out-Null
                $result.Success = $false
            }
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
                if ($result.AddError) {
                    $result.AddError("Failed to discover resource groups", $_.Exception, @{
                        Operation = "GetResourceGroups"
                        ErrorType = $_.Exception.GetType().FullName
                    })
                } else {
                    $result.Errors.Add(@{
                        Message = "Failed to discover resource groups: $($_.Exception.Message)"
                        Operation = "GetResourceGroups"
                    }) | Out-Null
                }
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
                if ($result.AddError) {
                    $result.AddError("Failed to discover virtual machines", $_.Exception, @{
                        Operation = "GetVirtualMachines"
                        ErrorType = $_.Exception.GetType().FullName
                    })
                } else {
                    $result.Errors.Add(@{
                        Message = "Failed to discover virtual machines: $($_.Exception.Message)"
                        Operation = "GetVirtualMachines"
                    }) | Out-Null
                }
            }
        } else {
            if ($result.AddWarning) {
                $result.AddWarning("Skipping resource discovery due to no accessible subscriptions")
            } else {
                $result.Warnings.Add(@{
                    Message = "Skipping resource discovery due to no accessible subscriptions"
                }) | Out-Null
            }
        }
        
        # Set metadata
        $result.Metadata['TotalItemsDiscovered'] = $totalItems
        $result.Metadata['OutputPath'] = $outputPath
        
        # Set overall success based on critical data
        if ($result.Success -ne $false) {
            $result.Success = ($subscriptions.Count -gt 0) -or ($result.Errors.Count -eq 0)
        }
        
        # Set record count for orchestrator
        $result.RecordCount = $totalItems
        
    } catch {
        if ($result.AddError) {
            $result.AddError("Unexpected error in Azure discovery", $_.Exception, @{
                Operation = "AzureDiscovery"
                ErrorType = $_.Exception.GetType().FullName
            })
        } else {
            $result.Errors.Add(@{
                Message = "Unexpected error in Azure discovery: $($_.Exception.Message)"
                Operation = "AzureDiscovery"
            }) | Out-Null
        }
        $result.Success = $false
    } finally {
        # Complete the result
        if ($result.Complete) {
            $result.Complete()
        } else {
            $result.EndTime = Get-Date
        }
        
        # Log summary
        $errorCount = if ($result.Errors -is [System.Collections.ArrayList]) { $result.Errors.Count } else { $result.Errors.Length }
        $warningCount = if ($result.Warnings -is [System.Collections.ArrayList]) { $result.Warnings.Count } else { $result.Warnings.Length }
        
        $summary = "Azure Discovery completed. Success: $($result.Success), Items: $($result.RecordCount), Errors: $errorCount, Warnings: $warningCount"
        $logLevel = if ($result.Success) { "SUCCESS" } else { "ERROR" }
        Write-AzureLog -Message $summary -Level $logLevel -Context $Context
    }
    
    return $result
}

# Export only the main discovery function that the orchestrator expects
Export-ModuleMember -Function Invoke-AzureDiscovery