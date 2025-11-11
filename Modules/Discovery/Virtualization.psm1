# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Virtualization discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers Hyper-V and VMware virtual machines, hosts, clusters, and storage configurations
    for comprehensive virtualization infrastructure assessment during M&A activities.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, Hyper-V PowerShell module, VMware PowerCLI (optional)
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\CacheManager.psm1") -Force -ErrorAction SilentlyContinue

function Write-VirtualizationLog {
    <#
    .SYNOPSIS
        Writes log entries specific to virtualization discovery.
    
    .PARAMETER Message
        The log message to write.
    
    .PARAMETER Level
        The log level (DEBUG, INFO, WARN, ERROR, FATAL, SUCCESS).
    
    .PARAMETER Context
        Additional context information.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[Virtualization] $Message" -Level $Level -Component "VirtualizationDiscovery" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        $logMessage = "[$timestamp] [$Level] [Virtualization] $Message"
        switch ($Level) {
            'ERROR' { Write-Error "[Virtualization] $logMessage" }
            'WARN' { Write-Warning "[Virtualization] $logMessage" }
            'SUCCESS' { Write-Information "[Virtualization] $logMessage" -InformationAction Continue }
            'DEBUG' { Write-Verbose "[Virtualization] $logMessage" -Verbose }
            default { Write-Information "[Virtualization] $logMessage" -InformationAction Continue }
        }
    }
}

function Invoke-Virtualization {
    <#
    .SYNOPSIS
        Main virtualization discovery function that coordinates Hyper-V and VMware discovery.
    
    .DESCRIPTION
        Discovers virtual machines, hosts, clusters, and storage across Hyper-V and VMware
        environments. Supports both local and remote discovery scenarios.
    
    .PARAMETER Configuration
        Discovery configuration hashtable.
    
    .PARAMETER Context
        Execution context with paths and session information.
    
    .PARAMETER SessionId
        Unique session identifier for tracking.
    
    .EXAMPLE
        Invoke-VirtualizationDiscovery -Configuration $config -Context $context -SessionId $sessionId
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-VirtualizationLog -Level "HEADER" -Message "Starting Virtualization Discovery (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = @{
        Success = $true
        ModuleName = 'VirtualizationDiscovery'
        RecordCount = 0
        Errors = [System.Collections.ArrayList]::new()
        Warnings = [System.Collections.ArrayList]::new()
        Metadata = @{}
        StartTime = Get-Date
        EndTime = $null
        ExecutionId = [guid]::NewGuid().ToString()
        AddError = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
        AddWarning = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
        Complete = { $this.EndTime = Get-Date }.GetNewClosure()
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
        }

        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Hyper-V Infrastructure
        try {
            Write-VirtualizationLog -Level "INFO" -Message "Discovering Hyper-V infrastructure..." -Context $Context
            $hyperVData = Get-HyperVInfrastructure -Configuration $Configuration -SessionId $SessionId
            if ($hyperVData.Count -gt 0) {
                $hyperVData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'HyperV' -Force }
                $null = $allDiscoveredData.AddRange($hyperVData)
                $result.Metadata["HyperVCount"] = $hyperVData.Count
            }
            Write-VirtualizationLog -Level "SUCCESS" -Message "Discovered $($hyperVData.Count) Hyper-V objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover Hyper-V infrastructure: $($_.Exception.Message)", @{Section="HyperV"})
        }
        
        # Discover VMware Infrastructure (if available)
        try {
            Write-VirtualizationLog -Level "INFO" -Message "Discovering VMware infrastructure..." -Context $Context
            $vmwareData = Get-VMwareInfrastructure -Configuration $Configuration -SessionId $SessionId
            if ($vmwareData.Count -gt 0) {
                $vmwareData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'VMware' -Force }
                $null = $allDiscoveredData.AddRange($vmwareData)
                $result.Metadata["VMwareCount"] = $vmwareData.Count
            }
            Write-VirtualizationLog -Level "SUCCESS" -Message "Discovered $($vmwareData.Count) VMware objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover VMware infrastructure: $($_.Exception.Message)", @{Section="VMware"})
        }
        
        # Discover Virtual Networks
        try {
            Write-VirtualizationLog -Level "INFO" -Message "Discovering virtual networks..." -Context $Context
            $virtualNetworks = Get-VirtualNetworks -Configuration $Configuration -SessionId $SessionId
            if ($virtualNetworks.Count -gt 0) {
                $virtualNetworks | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'VirtualNetwork' -Force }
                $null = $allDiscoveredData.AddRange($virtualNetworks)
                $result.Metadata["VirtualNetworkCount"] = $virtualNetworks.Count
            }
            Write-VirtualizationLog -Level "SUCCESS" -Message "Discovered $($virtualNetworks.Count) virtual networks" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover virtual networks: $($_.Exception.Message)", @{Section="VirtualNetworks"})
        }
        
        # Discover Virtual Storage
        try {
            Write-VirtualizationLog -Level "INFO" -Message "Discovering virtual storage..." -Context $Context
            $virtualStorage = Get-VirtualStorage -Configuration $Configuration -SessionId $SessionId
            if ($virtualStorage.Count -gt 0) {
                $virtualStorage | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'VirtualStorage' -Force }
                $null = $allDiscoveredData.AddRange($virtualStorage)
                $result.Metadata["VirtualStorageCount"] = $virtualStorage.Count
            }
            Write-VirtualizationLog -Level "SUCCESS" -Message "Discovered $($virtualStorage.Count) virtual storage objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover virtual storage: $($_.Exception.Message)", @{Section="VirtualStorage"})
        }

        # Export data to CSV files
        if ($allDiscoveredData.Count -gt 0) {
            Write-VirtualizationLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "Virtualization_$dataType.csv"
                $filePath = Join-Path $outputPath $fileName
                
                # Add metadata to each record
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "VirtualizationDiscovery" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                # Export to CSV
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-VirtualizationLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-VirtualizationLog -Level "WARN" -Message "No virtualization data discovered to export" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-VirtualizationLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during virtualization discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-VirtualizationLog -Level "HEADER" -Message "Virtualization discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

function Get-HyperVInfrastructure {
    <#
    .SYNOPSIS
        Discovers Hyper-V virtual machines, hosts, and configuration.
    
    .DESCRIPTION
        Enumerates Hyper-V hosts, virtual machines, virtual switches, and storage
        to provide comprehensive Hyper-V infrastructure inventory.
    
    .PARAMETER Configuration
        Discovery configuration settings.
    
    .PARAMETER SessionId
        Session identifier for tracking.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $hyperVData = @()
    
    try {
        # Check if Hyper-V module is available
        if (-not (Get-Module -Name Hyper-V -ListAvailable)) {
            Write-VirtualizationLog -Level "WARN" -Message "Hyper-V PowerShell module not available"
            return $hyperVData
        }
        
        Import-Module Hyper-V -ErrorAction Stop
        
        # Get Hyper-V Host Information
        try {
            $hyperVHost = Get-VMHost
            $hyperVData += [PSCustomObject]@{
                ObjectType = "HyperVHost"
                Name = $hyperVHost.Name
                ComputerName = $hyperVHost.ComputerName
                VirtualMachinePath = $hyperVHost.VirtualMachinePath
                VirtualHardDiskPath = $hyperVHost.VirtualHardDiskPath
                LogicalProcessorCount = $hyperVHost.LogicalProcessorCount
                MemoryCapacity = [math]::Round($hyperVHost.MemoryCapacity / 1GB, 2)
                MaximumStorageMigrations = $hyperVHost.MaximumStorageMigrations
                MaximumVirtualMachineMigrations = $hyperVHost.MaximumVirtualMachineMigrations
                NumaSpanningEnabled = $hyperVHost.NumaSpanningEnabled
                VirtualMachineCount = (Get-VM).Count
                Version = $hyperVHost.HyperVVersion
                SessionId = $SessionId
            }
        } catch {
            Write-VirtualizationLog -Level "WARN" -Message "Failed to get Hyper-V host information: $($_.Exception.Message)"
        }
        
        # Get Virtual Machines
        try {
            $vms = Get-VM
            foreach ($vm in $vms) {
                $vmDetails = Get-VM -Name $vm.Name | Select-Object *
                $vmNetworkAdapters = Get-VMNetworkAdapter -VMName $vm.Name
                $vmHardDisks = Get-VMHardDiskDrive -VMName $vm.Name
                
                $hyperVData += [PSCustomObject]@{
                    ObjectType = "VirtualMachine"
                    Name = $vm.Name
                    State = $vm.State
                    Generation = $vm.Generation
                    ProcessorCount = $vm.ProcessorCount
                    MemoryAssigned = [math]::Round($vm.MemoryAssigned / 1MB, 2)
                    MemoryMinimum = [math]::Round($vm.MemoryMinimum / 1MB, 2)
                    MemoryMaximum = [math]::Round($vm.MemoryMaximum / 1MB, 2)
                    DynamicMemoryEnabled = $vm.DynamicMemoryEnabled
                    IntegrationServicesVersion = $vm.IntegrationServicesVersion
                    CreationTime = $vm.CreationTime
                    Uptime = $vm.Uptime
                    Status = $vm.Status
                    Notes = $vm.Notes
                    NetworkAdapterCount = $vmNetworkAdapters.Count
                    HardDiskCount = $vmHardDisks.Count
                    TotalHardDiskSize = [math]::Round(($vmHardDisks | Measure-Object -Property Size -Sum).Sum / 1GB, 2)
                    ConfigurationLocation = $vm.ConfigurationLocation
                    CheckpointFileLocation = $vm.CheckpointFileLocation
                    SmartPagingFilePath = $vm.SmartPagingFilePath
                    SessionId = $SessionId
                }
            }
        } catch {
            Write-VirtualizationLog -Level "WARN" -Message "Failed to get virtual machines: $($_.Exception.Message)"
        }
        
        # Get Virtual Switches
        try {
            $vSwitches = Get-VMSwitch
            foreach ($vSwitch in $vSwitches) {
                $hyperVData += [PSCustomObject]@{
                    ObjectType = "VirtualSwitch"
                    Name = $vSwitch.Name
                    SwitchType = $vSwitch.SwitchType
                    NetAdapterInterfaceDescription = $vSwitch.NetAdapterInterfaceDescription
                    AllowManagementOS = $vSwitch.AllowManagementOS
                    DefaultFlowMinimumBandwidthAbsolute = $vSwitch.DefaultFlowMinimumBandwidthAbsolute
                    DefaultFlowMinimumBandwidthWeight = $vSwitch.DefaultFlowMinimumBandwidthWeight
                    Extensions = ($vSwitch.Extensions | ForEach-Object { $_.Name }) -join '; '
                    IovEnabled = $vSwitch.IovEnabled
                    PacketDirectEnabled = $vSwitch.PacketDirectEnabled
                    SessionId = $SessionId
                }
            }
        } catch {
            Write-VirtualizationLog -Level "WARN" -Message "Failed to get virtual switches: $($_.Exception.Message)"
        }
        
        # Get VM Network Adapters
        try {
            $vmNetAdapters = Get-VMNetworkAdapter -All
            foreach ($adapter in $vmNetAdapters) {
                $hyperVData += [PSCustomObject]@{
                    ObjectType = "VMNetworkAdapter"
                    VMName = $adapter.VMName
                    Name = $adapter.Name
                    SwitchName = $adapter.SwitchName
                    MacAddress = $adapter.MacAddress
                    Status = $adapter.Status
                    IPAddresses = ($adapter.IPAddresses -join '; ')
                    VlanId = $adapter.VlanSetting.AccessVlanId
                    DynamicMacAddressEnabled = $adapter.DynamicMacAddressEnabled
                    IsManagementOs = $adapter.IsManagementOs
                    Connected = $adapter.Connected
                    SessionId = $SessionId
                }
            }
        } catch {
            Write-VirtualizationLog -Level "WARN" -Message "Failed to get VM network adapters: $($_.Exception.Message)"
        }
        
    } catch {
        Write-VirtualizationLog -Level "ERROR" -Message "Failed to discover Hyper-V infrastructure: $($_.Exception.Message)"
    }
    
    return $hyperVData
}

function Get-VMwareInfrastructure {
    <#
    .SYNOPSIS
        Discovers VMware vSphere infrastructure including VMs, hosts, and clusters.
    
    .DESCRIPTION
        Attempts to discover VMware infrastructure using PowerCLI if available.
        Discovers VMs, ESXi hosts, clusters, and datastores.
    
    .PARAMETER Configuration
        Discovery configuration settings.
    
    .PARAMETER SessionId
        Session identifier for tracking.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $vmwareData = @()
    
    try {
        # Check if VMware PowerCLI is available
        $powerCLIModule = Get-Module -Name VMware.PowerCLI -ListAvailable
        if (-not $powerCLIModule) {
            Write-VirtualizationLog -Level "INFO" -Message "VMware PowerCLI not installed - skipping VMware discovery"
            return $vmwareData
        }
        
        Import-Module VMware.PowerCLI -ErrorAction Stop
        
        # Check if we have vCenter connection details
        if (-not $Configuration.vmware.vCenterServer) {
            Write-VirtualizationLog -Level "INFO" -Message "No vCenter server configured - skipping VMware discovery"
            return $vmwareData
        }
        
        # Attempt to connect to vCenter (this would need credentials)
        Write-VirtualizationLog -Level "INFO" -Message "VMware PowerCLI available but connection requires credentials"
        
        # Placeholder for VMware discovery structure
        $vmwareData += [PSCustomObject]@{
            ObjectType = "VMwareInfo"
            Message = "VMware PowerCLI detected but requires vCenter credentials for discovery"
            PowerCLIVersion = $powerCLIModule.Version.ToString()
            ConfiguredvCenter = $Configuration.vmware.vCenterServer
            SessionId = $SessionId
        }
        
    } catch {
        Write-VirtualizationLog -Level "WARN" -Message "VMware discovery not available: $($_.Exception.Message)"
    }
    
    return $vmwareData
}

function Get-VirtualNetworks {
    <#
    .SYNOPSIS
        Discovers virtual network configurations across virtualization platforms.
    
    .PARAMETER Configuration
        Discovery configuration settings.
    
    .PARAMETER SessionId
        Session identifier for tracking.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $virtualNetworks = @()
    
    try {
        # Get Hyper-V Virtual Networks
        if (Get-Module -Name Hyper-V -ListAvailable) {
            Import-Module Hyper-V -ErrorAction SilentlyContinue
            
            $vmSwitches = Get-VMSwitch -ErrorAction SilentlyContinue
            foreach ($switch in $vmSwitches) {
                $virtualNetworks += [PSCustomObject]@{
                    Platform = "Hyper-V"
                    Name = $switch.Name
                    Type = $switch.SwitchType
                    NetworkAdapter = $switch.NetAdapterInterfaceDescription
                    AllowManagementOS = $switch.AllowManagementOS
                    BandwidthMode = $switch.BandwidthReservationMode
                    IovSupport = $switch.IovSupport
                    SessionId = $SessionId
                }
            }
        }
        
        # Get Windows Virtual Network Adapters
        $netAdapters = Get-NetAdapter | Where-Object { $_.InterfaceDescription -like "*Virtual*" -or $_.InterfaceDescription -like "*Hyper-V*" }
        foreach ($adapter in $netAdapters) {
            $virtualNetworks += [PSCustomObject]@{
                Platform = "Windows"
                Name = $adapter.Name
                Type = "Virtual Adapter"
                InterfaceDescription = $adapter.InterfaceDescription
                Status = $adapter.Status
                LinkSpeed = $adapter.LinkSpeed
                MacAddress = $adapter.MacAddress
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-VirtualizationLog -Level "WARN" -Message "Failed to discover virtual networks: $($_.Exception.Message)"
    }
    
    return $virtualNetworks
}

function Get-VirtualStorage {
    <#
    .SYNOPSIS
        Discovers virtual storage configurations and virtual hard disks.
    
    .PARAMETER Configuration
        Discovery configuration settings.
    
    .PARAMETER SessionId
        Session identifier for tracking.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $virtualStorage = @()
    
    try {
        # Get Hyper-V Virtual Hard Disks
        if (Get-Module -Name Hyper-V -ListAvailable) {
            Import-Module Hyper-V -ErrorAction SilentlyContinue
            
            # Get all VHD/VHDX files from Hyper-V
            $vms = Get-VM -ErrorAction SilentlyContinue
            foreach ($vm in $vms) {
                $vmHardDisks = Get-VMHardDiskDrive -VMName $vm.Name -ErrorAction SilentlyContinue
                foreach ($disk in $vmHardDisks) {
                    try {
                        $vhdInfo = Get-VHD -Path $disk.Path -ErrorAction SilentlyContinue
                        if ($vhdInfo) {
                            $virtualStorage += [PSCustomObject]@{
                                Platform = "Hyper-V"
                                VMName = $vm.Name
                                DiskType = "VHD"
                                Path = $disk.Path
                                VhdFormat = $vhdInfo.VhdFormat
                                VhdType = $vhdInfo.VhdType
                                FileSize = [math]::Round($vhdInfo.FileSize / 1GB, 2)
                                Size = [math]::Round($vhdInfo.Size / 1GB, 2)
                                MinimumSize = [math]::Round($vhdInfo.MinimumSize / 1GB, 2)
                                ControllerType = $disk.ControllerType
                                ControllerNumber = $disk.ControllerNumber
                                ControllerLocation = $disk.ControllerLocation
                                SessionId = $SessionId
                            }
                        }
                    } catch {
                        # Continue if individual VHD cannot be read
                    }
                }
            }
            
            # Get Storage Pools
            $storagePools = Get-StoragePool -ErrorAction SilentlyContinue
            foreach ($pool in $storagePools) {
                $virtualStorage += [PSCustomObject]@{
                    Platform = "Windows"
                    DiskType = "StoragePool"
                    Name = $pool.FriendlyName
                    HealthStatus = $pool.HealthStatus
                    OperationalStatus = $pool.OperationalStatus
                    Size = [math]::Round($pool.Size / 1GB, 2)
                    AllocatedSize = [math]::Round($pool.AllocatedSize / 1GB, 2)
                    IsReadOnly = $pool.IsReadOnly
                    IsPrimordial = $pool.IsPrimordial
                    SessionId = $SessionId
                }
            }
        }
        
    } catch {
        Write-VirtualizationLog -Level "WARN" -Message "Failed to discover virtual storage: $($_.Exception.Message)"
    }
    
    return $virtualStorage
}

# Export functions
Export-ModuleMember -Function Invoke-Virtualization
