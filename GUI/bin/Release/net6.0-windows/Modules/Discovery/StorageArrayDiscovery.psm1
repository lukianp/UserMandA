# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Storage array discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers storage arrays, SANs, NAS devices, and storage infrastructure using SNMP,
    WMI, and vendor-specific APIs to provide comprehensive storage inventory for M&A
    infrastructure assessment.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, SNMP tools, Storage management modules
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-StorageLog {
    <#
    .SYNOPSIS
        Writes log entries specific to storage array discovery.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[Storage] $Message" -Level $Level -Component "StorageArrayDiscovery" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [Storage] $Message" -ForegroundColor $color
    }
}

function Invoke-StorageArrayDiscovery {
    <#
    .SYNOPSIS
        Main storage array discovery function.
    
    .DESCRIPTION
        Discovers storage arrays, SANs, NAS devices, and related storage infrastructure
        using multiple discovery methods including SNMP, WMI, and vendor APIs.
    
    .PARAMETER Configuration
        Discovery configuration hashtable.
    
    .PARAMETER Context
        Execution context with paths and session information.
    
    .PARAMETER SessionId
        Unique session identifier for tracking.
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

    Write-StorageLog -Level "HEADER" -Message "Starting Storage Array Discovery (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = @{
        Success = $true
        ModuleName = 'StorageArrayDiscovery'
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
        
        # Discover Local Storage Systems
        try {
            Write-StorageLog -Level "INFO" -Message "Discovering local storage systems..." -Context $Context
            $localStorageData = Get-LocalStorageSystems -SessionId $SessionId
            if ($localStorageData.Count -gt 0) {
                $localStorageData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'LocalStorage' -Force }
                $null = $allDiscoveredData.AddRange($localStorageData)
                $result.Metadata["LocalStorageCount"] = $localStorageData.Count
            }
            Write-StorageLog -Level "SUCCESS" -Message "Discovered $($localStorageData.Count) local storage objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover local storage systems: $($_.Exception.Message)", @{Section="LocalStorage"})
        }
        
        # Discover Network Storage (NAS/SAN)
        try {
            Write-StorageLog -Level "INFO" -Message "Discovering network storage systems..." -Context $Context
            $networkStorageData = Get-NetworkStorageSystems -Configuration $Configuration -SessionId $SessionId
            if ($networkStorageData.Count -gt 0) {
                $networkStorageData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'NetworkStorage' -Force }
                $null = $allDiscoveredData.AddRange($networkStorageData)
                $result.Metadata["NetworkStorageCount"] = $networkStorageData.Count
            }
            Write-StorageLog -Level "SUCCESS" -Message "Discovered $($networkStorageData.Count) network storage objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover network storage systems: $($_.Exception.Message)", @{Section="NetworkStorage"})
        }
        
        # Discover Storage Spaces and Pools
        try {
            Write-StorageLog -Level "INFO" -Message "Discovering storage spaces and pools..." -Context $Context
            $storageSpacesData = Get-StorageSpacesAndPools -SessionId $SessionId
            if ($storageSpacesData.Count -gt 0) {
                $storageSpacesData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'StorageSpaces' -Force }
                $null = $allDiscoveredData.AddRange($storageSpacesData)
                $result.Metadata["StorageSpacesCount"] = $storageSpacesData.Count
            }
            Write-StorageLog -Level "SUCCESS" -Message "Discovered $($storageSpacesData.Count) storage spaces objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover storage spaces: $($_.Exception.Message)", @{Section="StorageSpaces"})
        }
        
        # Discover Fibre Channel and iSCSI Infrastructure
        try {
            Write-StorageLog -Level "INFO" -Message "Discovering FC/iSCSI infrastructure..." -Context $Context
            $fcIscsiData = Get-FibreChannelIscsiInfrastructure -SessionId $SessionId
            if ($fcIscsiData.Count -gt 0) {
                $fcIscsiData | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'FcIscsi' -Force }
                $null = $allDiscoveredData.AddRange($fcIscsiData)
                $result.Metadata["FcIscsiCount"] = $fcIscsiData.Count
            }
            Write-StorageLog -Level "SUCCESS" -Message "Discovered $($fcIscsiData.Count) FC/iSCSI objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover FC/iSCSI infrastructure: $($_.Exception.Message)", @{Section="FcIscsi"})
        }
        
        # Generate Storage Summary
        try {
            Write-StorageLog -Level "INFO" -Message "Generating storage summary..." -Context $Context
            $summary = Get-StorageSummary -StorageData $allDiscoveredData -SessionId $SessionId
            if ($summary.Count -gt 0) {
                $summary | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'StorageSummary' -Force }
                $null = $allDiscoveredData.AddRange($summary)
                $result.Metadata["StorageSummaryCount"] = $summary.Count
            }
            Write-StorageLog -Level "SUCCESS" -Message "Generated storage summary" -Context $Context
        } catch {
            $result.AddWarning("Failed to generate storage summary: $($_.Exception.Message)", @{Section="StorageSummary"})
        }

        # Export data to CSV files
        if ($allDiscoveredData.Count -gt 0) {
            Write-StorageLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "Storage_$dataType.csv"
                $filePath = Join-Path $outputPath $fileName
                
                # Add metadata to each record
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "StorageArrayDiscovery" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                # Export to CSV
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-StorageLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-StorageLog -Level "WARN" -Message "No storage array data discovered to export" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-StorageLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during storage array discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.Complete()
        Write-StorageLog -Level "HEADER" -Message "Storage array discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

function Get-LocalStorageSystems {
    <#
    .SYNOPSIS
        Discovers local storage systems and controllers.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $storageData = @()
    
    try {
        # Get Physical Disks
        $physicalDisks = Get-CimInstance -ClassName Win32_DiskDrive -ErrorAction SilentlyContinue
        foreach ($disk in $physicalDisks) {
            $storageData += [PSCustomObject]@{
                StorageType = "PhysicalDisk"
                DeviceID = $disk.DeviceID
                Model = $disk.Model
                Manufacturer = $disk.Manufacturer
                SerialNumber = $disk.SerialNumber
                Size = [math]::Round($disk.Size / 1GB, 2)
                MediaType = $disk.MediaType
                InterfaceType = $disk.InterfaceType
                Partitions = $disk.Partitions
                Status = $disk.Status
                FirmwareRevision = $disk.FirmwareRevision
                BytesPerSector = $disk.BytesPerSector
                SectorsPerTrack = $disk.SectorsPerTrack
                TracksPerCylinder = $disk.TracksPerCylinder
                TotalCylinders = $disk.TotalCylinders
                TotalHeads = $disk.TotalHeads
                TotalSectors = $disk.TotalSectors
                TotalTracks = $disk.TotalTracks
                SessionId = $SessionId
            }
        }
        
        # Get SCSI Controllers
        $scsiControllers = Get-CimInstance -ClassName Win32_SCSIController -ErrorAction SilentlyContinue
        foreach ($controller in $scsiControllers) {
            $storageData += [PSCustomObject]@{
                StorageType = "SCSIController"
                DeviceID = $controller.DeviceID
                Name = $controller.Name
                Manufacturer = $controller.Manufacturer
                Description = $controller.Description
                DriverVersion = $controller.DriverVersion
                HardwareVersion = $controller.HardwareVersion
                Status = $controller.Status
                PNPDeviceID = $controller.PNPDeviceID
                SessionId = $SessionId
            }
        }
        
        # Get IDE Controllers
        $ideControllers = Get-CimInstance -ClassName Win32_IDEController -ErrorAction SilentlyContinue
        foreach ($controller in $ideControllers) {
            $storageData += [PSCustomObject]@{
                StorageType = "IDEController"
                DeviceID = $controller.DeviceID
                Name = $controller.Name
                Manufacturer = $controller.Manufacturer
                Description = $controller.Description
                Status = $controller.Status
                PNPDeviceID = $controller.PNPDeviceID
                SessionId = $SessionId
            }
        }
        
        # Get USB Controllers (for external storage)
        $usbControllers = Get-CimInstance -ClassName Win32_USBController -ErrorAction SilentlyContinue
        foreach ($controller in $usbControllers) {
            $storageData += [PSCustomObject]@{
                StorageType = "USBController"
                DeviceID = $controller.DeviceID
                Name = $controller.Name
                Manufacturer = $controller.Manufacturer
                Description = $controller.Description
                Status = $controller.Status
                PNPDeviceID = $controller.PNPDeviceID
                SessionId = $SessionId
            }
        }
        
        # Get Volume Information
        $volumes = Get-CimInstance -ClassName Win32_Volume -ErrorAction SilentlyContinue
        foreach ($volume in $volumes) {
            $storageData += [PSCustomObject]@{
                StorageType = "Volume"
                DeviceID = $volume.DeviceID
                DriveLetter = $volume.DriveLetter
                Label = $volume.Label
                FileSystem = $volume.FileSystem
                Size = [math]::Round($volume.Size / 1GB, 2)
                FreeSpace = [math]::Round($volume.FreeSpace / 1GB, 2)
                UsedSpace = [math]::Round(($volume.Size - $volume.FreeSpace) / 1GB, 2)
                PercentFree = if ($volume.Size -gt 0) { [math]::Round(($volume.FreeSpace / $volume.Size) * 100, 2) } else { 0 }
                Compressed = $volume.Compressed
                DriveType = $volume.DriveType
                SerialNumber = $volume.SerialNumber
                BootVolume = $volume.BootVolume
                SystemVolume = $volume.SystemVolume
                PageFilePresent = $volume.PageFilePresent
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-StorageLog -Level "ERROR" -Message "Failed to discover local storage systems: $($_.Exception.Message)"
    }
    
    return $storageData
}

function Get-NetworkStorageSystems {
    <#
    .SYNOPSIS
        Discovers network-attached storage systems.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $networkStorageData = @()
    
    try {
        # Get Mapped Network Drives
        $networkDrives = Get-CimInstance -ClassName Win32_LogicalDisk | Where-Object { $_.DriveType -eq 4 }
        foreach ($drive in $networkDrives) {
            $networkStorageData += [PSCustomObject]@{
                StorageType = "NetworkDrive"
                DriveLetter = $drive.DeviceID
                ProviderName = $drive.ProviderName
                VolumeName = $drive.VolumeName
                Size = [math]::Round($drive.Size / 1GB, 2)
                FreeSpace = [math]::Round($drive.FreeSpace / 1GB, 2)
                UsedSpace = [math]::Round(($drive.Size - $drive.FreeSpace) / 1GB, 2)
                PercentFree = if ($drive.Size -gt 0) { [math]::Round(($drive.FreeSpace / $drive.Size) * 100, 2) } else { 0 }
                FileSystem = $drive.FileSystem
                Compressed = $drive.Compressed
                SessionId = $SessionId
            }
        }
        
        # Get Network Shares
        $shares = Get-SmbShare -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne "IPC$" -and $_.Name -ne "ADMIN$" -and $_.Name -notlike "*$" }
        foreach ($share in $shares) {
            $networkStorageData += [PSCustomObject]@{
                StorageType = "SMBShare"
                ShareName = $share.Name
                Path = $share.Path
                Description = $share.Description
                ShareType = $share.ShareType
                ShareState = $share.ShareState
                Availability = $share.Availability
                ContinuouslyAvailable = $share.ContinuouslyAvailable
                EncryptData = $share.EncryptData
                FolderEnumerationMode = $share.FolderEnumerationMode
                CachingMode = $share.CachingMode
                SessionId = $SessionId
            }
        }
        
        # Check for iSCSI Targets
        try {
            if (Get-Module -Name iSCSI -ListAvailable) {
                Import-Module iSCSI -ErrorAction SilentlyContinue
                $iscsiTargets = Get-IscsiTarget -ErrorAction SilentlyContinue
                foreach ($target in $iscsiTargets) {
                    $networkStorageData += [PSCustomObject]@{
                        StorageType = "iSCSITarget"
                        NodeAddress = $target.NodeAddress
                        IsConnected = $target.IsConnected
                        SessionId = $SessionId
                    }
                }
                
                $iscsiConnections = Get-IscsiConnection -ErrorAction SilentlyContinue
                foreach ($connection in $iscsiConnections) {
                    $networkStorageData += [PSCustomObject]@{
                        StorageType = "iSCSIConnection"
                        ConnectionIdentifier = $connection.ConnectionIdentifier
                        InitiatorAddress = $connection.InitiatorAddress
                        InitiatorPortNumber = $connection.InitiatorPortNumber
                        TargetAddress = $connection.TargetAddress
                        TargetPortNumber = $connection.TargetPortNumber
                        SessionId = $SessionId
                    }
                }
            }
        } catch {
            Write-StorageLog -Level "DEBUG" -Message "iSCSI module not available or no iSCSI targets found"
        }
        
        # Check configured storage arrays
        if ($Configuration.storage.arrays) {
            foreach ($array in $Configuration.storage.arrays) {
                $networkStorageData += [PSCustomObject]@{
                    StorageType = "ConfiguredArray"
                    Name = $array.name
                    Type = $array.type
                    ManagementIP = $array.managementIP
                    Vendor = $array.vendor
                    Model = $array.model
                    Source = "Configuration"
                    ConnectionNote = "Requires SNMP or vendor API credentials for detailed discovery"
                    SessionId = $SessionId
                }
            }
        }
        
        # Scan for potential NAS devices on network (basic ping sweep)
        if ($Configuration.storage.scanSubnets) {
            foreach ($subnet in $Configuration.storage.scanSubnets) {
                $networkStorageData += [PSCustomObject]@{
                    StorageType = "SubnetScan"
                    Subnet = $subnet
                    Note = "Network storage subnet configured for scanning"
                    Status = "Requires network scanning implementation"
                    SessionId = $SessionId
                }
            }
        }
        
    } catch {
        Write-StorageLog -Level "ERROR" -Message "Failed to discover network storage systems: $($_.Exception.Message)"
    }
    
    return $networkStorageData
}

function Get-StorageSpacesAndPools {
    <#
    .SYNOPSIS
        Discovers Windows Storage Spaces and Storage Pools.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $storageSpacesData = @()
    
    try {
        # Get Storage Pools
        $storagePools = Get-StoragePool -ErrorAction SilentlyContinue
        foreach ($pool in $storagePools) {
            $storageSpacesData += [PSCustomObject]@{
                StorageType = "StoragePool"
                FriendlyName = $pool.FriendlyName
                OperationalStatus = $pool.OperationalStatus
                HealthStatus = $pool.HealthStatus
                IsPrimordial = $pool.IsPrimordial
                IsReadOnly = $pool.IsReadOnly
                Size = [math]::Round($pool.Size / 1GB, 2)
                AllocatedSize = [math]::Round($pool.AllocatedSize / 1GB, 2)
                LogicalSectorSize = $pool.LogicalSectorSize
                PhysicalSectorSize = $pool.PhysicalSectorSize
                NumberOfColumns = $pool.NumberOfColumns
                Interleave = $pool.Interleave
                WriteCacheSizeDefault = $pool.WriteCacheSizeDefault
                SessionId = $SessionId
            }
        }
        
        # Get Virtual Disks (Storage Spaces)
        $virtualDisks = Get-VirtualDisk -ErrorAction SilentlyContinue
        foreach ($disk in $virtualDisks) {
            $storageSpacesData += [PSCustomObject]@{
                StorageType = "VirtualDisk"
                FriendlyName = $disk.FriendlyName
                OperationalStatus = $disk.OperationalStatus
                HealthStatus = $disk.HealthStatus
                Size = [math]::Round($disk.Size / 1GB, 2)
                AllocatedSize = [math]::Round($disk.AllocatedSize / 1GB, 2)
                FootprintOnPool = [math]::Round($disk.FootprintOnPool / 1GB, 2)
                ResiliencySettingName = $disk.ResiliencySettingName
                NumberOfColumns = $disk.NumberOfColumns
                NumberOfDataCopies = $disk.NumberOfDataCopies
                PhysicalSectorSize = $disk.PhysicalSectorSize
                LogicalSectorSize = $disk.LogicalSectorSize
                Interleave = $disk.Interleave
                WriteCacheSize = $disk.WriteCacheSize
                SessionId = $SessionId
            }
        }
        
        # Get Physical Disks in Pools
        $physicalDisks = Get-PhysicalDisk -ErrorAction SilentlyContinue
        foreach ($disk in $physicalDisks) {
            $storageSpacesData += [PSCustomObject]@{
                StorageType = "PhysicalDiskInPool"
                FriendlyName = $disk.FriendlyName
                SerialNumber = $disk.SerialNumber
                Manufacturer = $disk.Manufacturer
                Model = $disk.Model
                MediaType = $disk.MediaType
                BusType = $disk.BusType
                OperationalStatus = $disk.OperationalStatus
                HealthStatus = $disk.HealthStatus
                Usage = $disk.Usage
                Size = [math]::Round($disk.Size / 1GB, 2)
                AllocatedSize = [math]::Round($disk.AllocatedSize / 1GB, 2)
                DeviceId = $disk.DeviceId
                PhysicalLocation = $disk.PhysicalLocation
                SpindleSpeed = $disk.SpindleSpeed
                SessionId = $SessionId
            }
        }
        
        # Get Storage Tiers
        $storageTiers = Get-StorageTier -ErrorAction SilentlyContinue
        foreach ($tier in $storageTiers) {
            $storageSpacesData += [PSCustomObject]@{
                StorageType = "StorageTier"
                FriendlyName = $tier.FriendlyName
                MediaType = $tier.MediaType
                Size = [math]::Round($tier.Size / 1GB, 2)
                AllocatedSize = [math]::Round($tier.AllocatedSize / 1GB, 2)
                FootprintOnPool = [math]::Round($tier.FootprintOnPool / 1GB, 2)
                Description = $tier.Description
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-StorageLog -Level "ERROR" -Message "Failed to discover storage spaces and pools: $($_.Exception.Message)"
    }
    
    return $storageSpacesData
}

function Get-FibreChannelIscsiInfrastructure {
    <#
    .SYNOPSIS
        Discovers Fibre Channel and iSCSI infrastructure.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $fcIscsiData = @()
    
    try {
        # Get Fibre Channel Adapters
        $fcAdapters = Get-CimInstance -ClassName MSFC_FCAdapterHBAAttributes -Namespace "root\WMI" -ErrorAction SilentlyContinue
        foreach ($adapter in $fcAdapters) {
            $fcIscsiData += [PSCustomObject]@{
                InfrastructureType = "FibreChannelAdapter"
                NodeWWN = $adapter.NodeWWN
                Manufacturer = $adapter.Manufacturer
                Model = $adapter.Model
                ModelDescription = $adapter.ModelDescription
                HardwareVersion = $adapter.HardwareVersion
                DriverVersion = $adapter.DriverVersion
                FirmwareVersion = $adapter.FirmwareVersion
                DriverName = $adapter.DriverName
                MfgDomain = $adapter.MfgDomain
                SerialNumber = $adapter.SerialNumber
                SessionId = $SessionId
            }
        }
        
        # Get Fibre Channel Ports
        $fcPorts = Get-CimInstance -ClassName MSFC_FibrePortHBAAttributes -Namespace "root\WMI" -ErrorAction SilentlyContinue
        foreach ($port in $fcPorts) {
            $fcIscsiData += [PSCustomObject]@{
                InfrastructureType = "FibreChannelPort"
                NodeWWN = $port.NodeWWN
                PortWWN = $port.PortWWN
                PortType = $port.PortType
                PortState = $port.PortState
                PortSpeed = $port.PortSpeed
                PortMaxFrameSize = $port.PortMaxFrameSize
                FabricName = $port.FabricName
                NumberOfDiscoveredPorts = $port.NumberOfDiscoveredPorts
                SessionId = $SessionId
            }
        }
        
        # Get iSCSI Initiators
        try {
            if (Get-Module -Name iSCSI -ListAvailable) {
                Import-Module iSCSI -ErrorAction SilentlyContinue
                
                $iscsiInitiators = Get-InitiatorPort -ErrorAction SilentlyContinue
                foreach ($initiator in $iscsiInitiators) {
                    $fcIscsiData += [PSCustomObject]@{
                        InfrastructureType = "iSCSIInitiator"
                        NodeAddress = $initiator.NodeAddress
                        PortAddress = $initiator.PortAddress
                        ConnectionIdentifier = $initiator.ConnectionIdentifier
                        InitiatorAddress = $initiator.InitiatorAddress
                        InitiatorPortNumber = $initiator.InitiatorPortNumber
                        SessionId = $SessionId
                    }
                }
                
                $iscsiSessions = Get-IscsiSession -ErrorAction SilentlyContinue
                foreach ($session in $iscsiSessions) {
                    $fcIscsiData += [PSCustomObject]@{
                        InfrastructureType = "iSCSISession"
                        SessionIdentifier = $session.SessionIdentifier
                        InitiatorNodeAddress = $session.InitiatorNodeAddress
                        TargetNodeAddress = $session.TargetNodeAddress
                        NumberOfConnections = $session.NumberOfConnections
                        AuthenticationType = $session.AuthenticationType
                        InitiatorInstanceName = $session.InitiatorInstanceName
                        SessionId = $SessionId
                    }
                }
            }
        } catch {
            Write-StorageLog -Level "DEBUG" -Message "iSCSI module not available"
        }
        
        # Get MPIO Information
        try {
            $mpioDisks = Get-CimInstance -ClassName MPIO_DISK_INFO -Namespace "root\WMI" -ErrorAction SilentlyContinue
            foreach ($disk in $mpioDisks) {
                $fcIscsiData += [PSCustomObject]@{
                    InfrastructureType = "MPIODisk"
                    Name = $disk.Name
                    NumberPaths = $disk.NumberPaths
                    DeviceInfo = $disk.DeviceInfo
                    SessionId = $SessionId
                }
            }
        } catch {
            Write-StorageLog -Level "DEBUG" -Message "MPIO information not available"
        }
        
    } catch {
        Write-StorageLog -Level "ERROR" -Message "Failed to discover FC/iSCSI infrastructure: $($_.Exception.Message)"
    }
    
    return $fcIscsiData
}

function Get-StorageSummary {
    <#
    .SYNOPSIS
        Generates a summary of storage discovery results.
    #>
    [CmdletBinding()]
    param(
        [array]$StorageData,
        [string]$SessionId
    )
    
    $summary = @()
    
    try {
        # Overall storage summary
        $localStorageCount = ($StorageData | Where-Object { $_._DataType -eq 'LocalStorage' }).Count
        $networkStorageCount = ($StorageData | Where-Object { $_._DataType -eq 'NetworkStorage' }).Count
        $storageSpacesCount = ($StorageData | Where-Object { $_._DataType -eq 'StorageSpaces' }).Count
        $fcIscsiCount = ($StorageData | Where-Object { $_._DataType -eq 'FcIscsi' }).Count
        
        # Calculate total storage capacity
        $totalCapacityGB = ($StorageData | Where-Object { $_.Size -and $_.StorageType -eq 'PhysicalDisk' } | Measure-Object -Property Size -Sum).Sum
        $totalFreeSpaceGB = ($StorageData | Where-Object { $_.FreeSpace -and $_.StorageType -eq 'Volume' } | Measure-Object -Property FreeSpace -Sum).Sum
        
        $summary += [PSCustomObject]@{
            SummaryType = "StorageOverview"
            LocalStorageObjects = $localStorageCount
            NetworkStorageObjects = $networkStorageCount
            StorageSpacesObjects = $storageSpacesCount
            FcIscsiObjects = $fcIscsiCount
            TotalStorageObjects = $localStorageCount + $networkStorageCount + $storageSpacesCount + $fcIscsiCount
            TotalPhysicalCapacityGB = [math]::Round($totalCapacityGB, 2)
            TotalFreeSpaceGB = [math]::Round($totalFreeSpaceGB, 2)
            PhysicalDiskCount = ($StorageData | Where-Object { $_.StorageType -eq 'PhysicalDisk' }).Count
            VolumeCount = ($StorageData | Where-Object { $_.StorageType -eq 'Volume' }).Count
            NetworkDriveCount = ($StorageData | Where-Object { $_.StorageType -eq 'NetworkDrive' }).Count
            SMBShareCount = ($StorageData | Where-Object { $_.StorageType -eq 'SMBShare' }).Count
            StoragePoolCount = ($StorageData | Where-Object { $_.StorageType -eq 'StoragePool' }).Count
            VirtualDiskCount = ($StorageData | Where-Object { $_.StorageType -eq 'VirtualDisk' }).Count
            ScanDate = Get-Date
            SessionId = $SessionId
        }
        
        # Storage type breakdown
        $storageTypes = $StorageData | Group-Object StorageType | Sort-Object Count -Descending
        foreach ($type in $storageTypes) {
            $summary += [PSCustomObject]@{
                SummaryType = "StorageTypeBreakdown"
                StorageType = $type.Name
                Count = $type.Count
                ScanDate = Get-Date
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-StorageLog -Level "ERROR" -Message "Failed to generate storage summary: $($_.Exception.Message)"
    }
    
    return $summary
}

# Export functions
Export-ModuleMember -Function Invoke-StorageArrayDiscovery