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

    # Check all possible locations for auth info
    if ($Configuration._AuthContext) { return $Configuration._AuthContext }
    if ($Configuration._Credentials) { return $Configuration._Credentials }
    if ($Configuration.authentication) {
        if ($Configuration.authentication._Credentials) { 
            return $Configuration.authentication._Credentials 
        }
        if ($Configuration.authentication.ClientId -and 
            $Configuration.authentication.ClientSecret -and 
            $Configuration.authentication.TenantId) {
            return @{
                ClientId     = $Configuration.authentication.ClientId
                ClientSecret = $Configuration.authentication.ClientSecret
                TenantId     = $Configuration.authentication.TenantId
            }
        }
    }
    if ($Configuration.ClientId -and $Configuration.ClientSecret -and $Configuration.TenantId) {
        return @{
            ClientId     = $Configuration.ClientId
            ClientSecret = $Configuration.ClientSecret
            TenantId     = $Configuration.TenantId
        }
    }
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
    $result = $null
    $isHashtableResult = $false
    
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Azure')
    } else {
        # Fallback to hashtable
        $isHashtableResult = $true
        $result = @{
            Success      = $true
            ModuleName   = 'Azure'
            Data         = $null
            Errors       = [System.Collections.ArrayList]::new()
            Warnings     = [System.Collections.ArrayList]::new()
            Metadata     = @{}
            StartTime    = Get-Date
            EndTime      = $null
            ExecutionId  = [guid]::NewGuid().ToString()
        }
        
        # Add methods for hashtable
        $result.AddError = {
            param($m, $e, $c)
            $errorEntry = @{
                Timestamp = Get-Date
                Message = $m
                Exception = if ($e) { $e.ToString() } else { $null }
                ExceptionType = if ($e) { $e.GetType().FullName } else { $null }
                Context = $c
            }
            $null = $this.Errors.Add($errorEntry)
            $this.Success = $false
        }.GetNewClosure()
        
        $result.AddWarning = {
            param($m, $c)
            $warningEntry = @{
                Timestamp = Get-Date
                Message = $m
                Context = $c
            }
            $null = $this.Warnings.Add($warningEntry)
        }.GetNewClosure()
        
        $result.Complete = {
            $this.EndTime = Get-Date
            if ($this.StartTime -and $this.EndTime) {
                $duration = $this.EndTime - $this.StartTime
                $this.Metadata['Duration'] = $duration
                $this.Metadata['DurationSeconds'] = $duration.TotalSeconds
            }
        }.GetNewClosure()
    }

    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-AzureLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-AzureLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 4. AUTHENTICATE & CONNECT
        Write-AzureLog -Level "INFO" -Message "Extracting authentication information..." -Context $Context
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration
        
        if (-not $authInfo) {
            Write-AzureLog -Level "ERROR" -Message "No authentication found in configuration" -Context $Context
            $result.AddError("Authentication information could not be found in the provided configuration.", $null, $null)
            return $result
        }
        
        Write-AzureLog -Level "DEBUG" -Message "Auth info found. ClientId: $($authInfo.ClientId.Substring(0,8))..." -Context $Context

        # Validate Az modules are available
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

        # Connect to Azure
        try {
            Write-AzureLog -Level "INFO" -Message "Connecting to Azure..." -Context $Context
            
            # Check if already connected
            $currentContext = Get-AzContext -ErrorAction SilentlyContinue
            if ($currentContext) {
                Write-AzureLog -Level "DEBUG" -Message "Disconnecting existing Azure session" -Context $Context
                Disconnect-AzAccount -ErrorAction SilentlyContinue | Out-Null
            }
            
            # Connect using service principal - FIXED: Use -Tenant parameter instead of -TenantId
            $securePassword = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
            $credential = New-Object System.Management.Automation.PSCredential($authInfo.ClientId, $securePassword)
            
            # CRITICAL FIX: Use -Tenant parameter for Connect-AzAccount
            $connectionParams = @{
                ServicePrincipal = $true
                Credential = $credential
                Tenant = $authInfo.TenantId  # FIXED: Use -Tenant for Connect-AzAccount
                ErrorAction = 'Stop'
                WarningAction = 'SilentlyContinue'
            }
            
            $null = Connect-AzAccount @connectionParams
            Write-AzureLog -Level "SUCCESS" -Message "Connected to Azure" -Context $Context
            
            # Verify connection
            $newContext = Get-AzContext -ErrorAction Stop
            if (-not $newContext) {
                throw "Failed to establish Azure context after connection"
            }
            Write-AzureLog -Level "DEBUG" -Message "Connected to Azure tenant: $($newContext.Tenant.Id)" -Context $Context
            
        } catch {
            $result.AddError("Failed to connect to Azure: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }

        # 5. PERFORM DISCOVERY
        Write-AzureLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Get Subscriptions
        $subscriptions = @()
        try {
            Write-AzureLog -Level "INFO" -Message "Discovering Azure subscriptions..." -Context $Context
            
            # Get all subscriptions
            $azSubs = Get-AzSubscription -ErrorAction Stop -WarningAction SilentlyContinue
            
            if (-not $azSubs) {
                Write-AzureLog -Level "WARN" -Message "No subscriptions found or accessible" -Context $Context
            } else {
                # Apply subscription filter if configured
                $subscriptionFilter = @()
                if ($Configuration.azure -and $Configuration.azure.subscriptionFilter -and $Configuration.azure.subscriptionFilter.Count -gt 0) {
                    $subscriptionFilter = $Configuration.azure.subscriptionFilter
                    Write-AzureLog -Level "DEBUG" -Message "Applying subscription filter: $($subscriptionFilter -join ', ')" -Context $Context
                }
                
                foreach ($sub in $azSubs) {
                    # Skip if filter is configured and subscription not in filter
                    if ($subscriptionFilter.Count -gt 0) {
                        if ($sub.Name -notin $subscriptionFilter -and $sub.Id -notin $subscriptionFilter) {
                            Write-AzureLog -Level "DEBUG" -Message "Skipping filtered subscription: $($sub.Name)" -Context $Context
                            continue
                        }
                    }
                    
                    $subscriptions += [PSCustomObject]@{
                        SubscriptionId = $sub.Id
                        Name = $sub.Name
                        State = $sub.State
                        TenantId = $sub.TenantId
                    }
                    
                    $null = $allDiscoveredData.Add([PSCustomObject]@{
                        SubscriptionId = $sub.Id
                        Name = $sub.Name
                        State = $sub.State
                        TenantId = $sub.TenantId
                        _ObjectType = 'Subscription'
                    })
                }
                
                Write-AzureLog -Level "SUCCESS" -Message "Discovered $($subscriptions.Count) subscriptions" -Context $Context
            }
            
            $result.Metadata["SubscriptionCount"] = $subscriptions.Count
            
        } catch {
            $result.AddWarning("Failed to discover subscriptions: $($_.Exception.Message)", @{Operation = "GetSubscriptions"})
        }
        
        # Get Resource Groups (only if we have subscriptions)
        if ($subscriptions.Count -gt 0) {
            try {
                Write-AzureLog -Level "INFO" -Message "Discovering Azure resource groups..." -Context $Context
                $resourceGroupCount = 0
                $errors = 0
                
                # Apply resource group filter if configured
                $rgFilter = @()
                if ($Configuration.azure -and $Configuration.azure.resourceGroupFilter -and $Configuration.azure.resourceGroupFilter.Count -gt 0) {
                    $rgFilter = $Configuration.azure.resourceGroupFilter
                }
                
                foreach ($sub in $subscriptions) {
                    try {
                        Write-AzureLog -Level "DEBUG" -Message "Getting resource groups for subscription: $($sub.Name)" -Context $Context
                        
                        # Set context to subscription
                        $null = Set-AzContext -SubscriptionId $sub.SubscriptionId -ErrorAction Stop
                        
                        # Get resource groups
                        $rgs = Get-AzResourceGroup -ErrorAction Stop
                        
                        foreach ($rg in $rgs) {
                            # Skip if filter is configured and RG not in filter
                            if ($rgFilter.Count -gt 0 -and $rg.ResourceGroupName -notin $rgFilter) {
                                Write-AzureLog -Level "DEBUG" -Message "Skipping filtered resource group: $($rg.ResourceGroupName)" -Context $Context
                                continue
                            }
                            
                            $resourceGroupCount++
                            $null = $allDiscoveredData.Add([PSCustomObject]@{
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
                                _ObjectType = 'ResourceGroup'
                            })
                            
                            # Report progress
                            if ($resourceGroupCount % 10 -eq 0) {
                                Write-AzureLog -Level "DEBUG" -Message "Processed $resourceGroupCount resource groups so far..." -Context $Context
                            }
                        }
                    } catch {
                        $errors++
                        Write-AzureLog -Level "WARN" -Message "Error getting resource groups for $($sub.Name): $($_.Exception.Message)" -Context $Context
                    }
                }
                
                Write-AzureLog -Level "SUCCESS" -Message "Discovered $resourceGroupCount resource groups" -Context $Context
                
                $result.Metadata["ResourceGroupCount"] = $resourceGroupCount
                
                if ($errors -gt 0) {
                    $result.AddWarning("Completed with $errors subscription errors", @{Operation = "GetResourceGroups"})
                }
                
            } catch {
                $result.AddWarning("Failed to discover resource groups: $($_.Exception.Message)", @{Operation = "GetResourceGroups"})
            }

            # Get Virtual Machines
            try {
                Write-AzureLog -Level "INFO" -Message "Discovering Azure virtual machines..." -Context $Context
                $vmCount = 0
                $errors = 0
                
                foreach ($sub in $subscriptions) {
                    try {
                        Write-AzureLog -Level "DEBUG" -Message "Getting VMs for subscription: $($sub.Name)" -Context $Context
                        
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
                            
                            $vmCount++
                            $null = $allDiscoveredData.Add([PSCustomObject]@{
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
                                _ObjectType = 'VirtualMachine'
                            })
                            
                            # Report progress
                            if ($vmCount % 10 -eq 0) {
                                Write-AzureLog -Level "DEBUG" -Message "Processed $vmCount virtual machines so far..." -Context $Context
                            }
                        }
                    } catch {
                        $errors++
                        Write-AzureLog -Level "WARN" -Message "Error getting VMs for $($sub.Name): $($_.Exception.Message)" -Context $Context
                    }
                }
                
                Write-AzureLog -Level "SUCCESS" -Message "Discovered $vmCount virtual machines" -Context $Context
                
                $result.Metadata["VirtualMachineCount"] = $vmCount
                
                if ($errors -gt 0) {
                    $result.AddWarning("Completed with $errors subscription errors", @{Operation = "GetVirtualMachines"})
                }
                
            } catch {
                $result.AddWarning("Failed to discover virtual machines: $($_.Exception.Message)", @{Operation = "GetVirtualMachines"})
            }
        }

        # 6. EXPORT DATA TO CSV
        if ($allDiscoveredData.Count -gt 0) {
            Write-AzureLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Group by object type and export to separate files
            $objectGroups = $allDiscoveredData | Group-Object -Property _ObjectType
            
            foreach ($group in $objectGroups) {
                $objectType = $group.Name
                $objects = $group.Group
                
                # Remove the _ObjectType property before export
                $exportData = $objects | ForEach-Object {
                    $obj = $_.PSObject.Copy()
                    $obj.PSObject.Properties.Remove('_ObjectType')
                    $obj | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $obj | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Azure" -Force
                    $obj
                }
                
                # Map object types to file names (MUST match orchestrator expectations)
                $fileName = switch ($objectType) {
                    'Subscription' { 'AzureSubscriptions.csv' }
                    'ResourceGroup' { 'AzureResourceGroups.csv' }
                    'VirtualMachine' { 'AzureVirtualMachines.csv' }
                    default { "Azure_$objectType.csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $exportData | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                
                Write-AzureLog -Level "SUCCESS" -Message "Exported $($exportData.Count) $objectType records to $fileName" -Context $Context
            }
        } else {
            Write-AzureLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # 7. FINALIZE METADATA - FIXED RecordCount handling
        # Store the collected data
        $result.Data = $allDiscoveredData
        
        # Store RecordCount in Metadata (this is where orchestrator expects it)
        $result.Metadata["RecordCount"] = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds

    } catch {
        # Top-level error handler
        Write-AzureLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        
        # Handle error based on result type
        if ($isHashtableResult) {
            & $result.AddError "A critical error occurred during discovery: $($_.Exception.Message)" $_.Exception $null
        } else {
            $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
        }
    } finally {
        # 8. CLEANUP & COMPLETE
        Write-AzureLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        # Disconnect from Azure
        try {
            $azContext = Get-AzContext -ErrorAction SilentlyContinue
            if ($azContext) {
                Disconnect-AzAccount -ErrorAction SilentlyContinue | Out-Null
                Write-AzureLog -Level "DEBUG" -Message "Disconnected from Azure" -Context $Context
            }
        } catch {
            # Ignore disconnect errors
        }
        
        $stopwatch.Stop()
        
        # Call Complete method
        if ($isHashtableResult) {
            & $result.Complete
        } else {
            $result.Complete()
        }
        
        # Get final record count for logging - from Metadata
        $finalRecordCount = 0
        if ($result.Metadata -and $result.Metadata.ContainsKey('RecordCount')) {
            $finalRecordCount = $result.Metadata['RecordCount']
        }
        
        Write-AzureLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $finalRecordCount." -Context $Context
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

# --- Module Export ---
Export-ModuleMember -Function Invoke-AzureDiscovery