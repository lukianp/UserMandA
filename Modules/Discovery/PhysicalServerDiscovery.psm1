# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Physical server discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers physical server hardware details using WMI, CIM, and SNMP protocols
    to provide comprehensive hardware inventory for M&A infrastructure assessment.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, WMI access, SNMP (optional)
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Core\ClassDefinitions.psm1") -Force

function Write-PhysicalServerLog {
    <#
    .SYNOPSIS
        Writes log entries specific to physical server discovery.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[PhysicalServer] $Message" -Level $Level -Component "PhysicalServerDiscovery" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [PhysicalServer] $Message" -ForegroundColor $color
    }
}

function Invoke-PhysicalServerDiscovery {
    <#
    .SYNOPSIS
        Main physical server discovery function.
    
    .DESCRIPTION
        Discovers physical server hardware including processors, memory, storage,
        network interfaces, and system information using WMI and CIM.
    
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

    Write-PhysicalServerLog -Level "HEADER" -Message "Starting Physical Server Discovery (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = [DiscoveryResult]::new('PhysicalServerDiscovery')

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
        
        # Discover System Information
        try {
            Write-PhysicalServerLog -Level "INFO" -Message "Discovering system information..." -Context $Context
            $systemInfo = Get-SystemInformation -SessionId $SessionId
            if ($systemInfo.Count -gt 0) {
                $systemInfo | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'SystemInfo' -Force }
                $null = $allDiscoveredData.AddRange($systemInfo)
                $result.Metadata["SystemInfoCount"] = $systemInfo.Count
            }
            Write-PhysicalServerLog -Level "SUCCESS" -Message "Discovered $($systemInfo.Count) system information objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover system information: $($_.Exception.Message)", @{Section="SystemInfo"})
        }
        
        # Discover Hardware Components
        try {
            Write-PhysicalServerLog -Level "INFO" -Message "Discovering hardware components..." -Context $Context
            $hardwareInfo = Get-HardwareComponents -SessionId $SessionId
            if ($hardwareInfo.Count -gt 0) {
                $hardwareInfo | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Hardware' -Force }
                $null = $allDiscoveredData.AddRange($hardwareInfo)
                $result.Metadata["HardwareCount"] = $hardwareInfo.Count
            }
            Write-PhysicalServerLog -Level "SUCCESS" -Message "Discovered $($hardwareInfo.Count) hardware components" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover hardware components: $($_.Exception.Message)", @{Section="Hardware"})
        }
        
        # Discover Storage Information
        try {
            Write-PhysicalServerLog -Level "INFO" -Message "Discovering storage information..." -Context $Context
            $storageInfo = Get-StorageInformation -SessionId $SessionId
            if ($storageInfo.Count -gt 0) {
                $storageInfo | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'Storage' -Force }
                $null = $allDiscoveredData.AddRange($storageInfo)
                $result.Metadata["StorageCount"] = $storageInfo.Count
            }
            Write-PhysicalServerLog -Level "SUCCESS" -Message "Discovered $($storageInfo.Count) storage objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover storage information: $($_.Exception.Message)", @{Section="Storage"})
        }
        
        # Discover Network Hardware
        try {
            Write-PhysicalServerLog -Level "INFO" -Message "Discovering network hardware..." -Context $Context
            $networkHardware = Get-NetworkHardware -SessionId $SessionId
            if ($networkHardware.Count -gt 0) {
                $networkHardware | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'NetworkHardware' -Force }
                $null = $allDiscoveredData.AddRange($networkHardware)
                $result.Metadata["NetworkHardwareCount"] = $networkHardware.Count
            }
            Write-PhysicalServerLog -Level "SUCCESS" -Message "Discovered $($networkHardware.Count) network hardware objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover network hardware: $($_.Exception.Message)", @{Section="NetworkHardware"})
        }
        
        # Discover BIOS/UEFI Information
        try {
            Write-PhysicalServerLog -Level "INFO" -Message "Discovering BIOS/UEFI information..." -Context $Context
            $biosInfo = Get-BIOSInformation -SessionId $SessionId
            if ($biosInfo.Count -gt 0) {
                $biosInfo | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'BIOS' -Force }
                $null = $allDiscoveredData.AddRange($biosInfo)
                $result.Metadata["BIOSCount"] = $biosInfo.Count
            }
            Write-PhysicalServerLog -Level "SUCCESS" -Message "Discovered $($biosInfo.Count) BIOS/UEFI objects" -Context $Context
        } catch {
            $result.AddWarning("Failed to discover BIOS/UEFI information: $($_.Exception.Message)", @{Section="BIOS"})
        }

        # Export data to CSV files
        if ($allDiscoveredData.Count -gt 0) {
            Write-PhysicalServerLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "PhysicalServer_$dataType.csv"
                $filePath = Join-Path $outputPath $fileName
                
                # Add metadata to each record
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "PhysicalServerDiscovery" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                # Export to CSV
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-PhysicalServerLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }

            # Also create a consolidated PhysicalServerDiscovery.csv with key server info
            $consolidatedServers = @()
            $systemInfoData = $allDiscoveredData | Where-Object { $_._DataType -eq 'SystemInfo' -and $_.ComponentType -eq 'ComputerSystem' }
            foreach ($server in $systemInfoData) {
                # Get related components for this server
                $serverName = $server.Name
                $biosData = $allDiscoveredData | Where-Object { $_._DataType -eq 'BIOS' -and $_.SerialNumber } | Select-Object -First 1
                $hardwareData = $allDiscoveredData | Where-Object { $_._DataType -eq 'Hardware' -and $_.ComponentType -eq 'CPU' } | Select-Object -First 1
                $storageData = $allDiscoveredData | Where-Object { $_._DataType -eq 'Storage' -and $_.ComponentType -eq 'PhysicalDisk' }
                $networkData = $allDiscoveredData | Where-Object { $_._DataType -eq 'NetworkHardware' -and $_.ComponentType -eq 'NetworkAdapter' }

                $consolidatedServer = [PSCustomObject]@{
                    Name = $serverName
                    Manufacturer = $server.Manufacturer
                    Model = $server.Model
                    TotalPhysicalMemory = $server.TotalPhysicalMemory
                    NumberOfProcessors = $server.NumberOfProcessors
                    NumberOfLogicalProcessors = $server.NumberOfLogicalProcessors
                    OperatingSystem = $server.OperatingSystem
                    OSVersion = $server.OSVersion
                    Domain = $server.Domain
                    LastBootUpTime = $server.LastBootUpTime
                    SerialNumber = if ($biosData) { $biosData.SerialNumber } else { $null }
                    BIOSVersion = if ($biosData) { $biosData.Version } else { $null }
                    ProcessorName = if ($hardwareData) { $hardwareData.Name } else { $null }
                    ProcessorSpeed = if ($hardwareData) { $hardwareData.MaxClockSpeed } else { $null }
                    TotalDiskCount = @($storageData).Count
                    TotalDiskSizeGB = ($storageData | Measure-Object -Property Size -Sum).Sum / 1GB
                    NetworkAdapterCount = @($networkData).Count
                    _DiscoveryTimestamp = $timestamp
                    _DiscoveryModule = "PhysicalServerDiscovery"
                    _SessionId = $SessionId
                }
                $consolidatedServers += $consolidatedServer
            }

            if (@($consolidatedServers).Count -gt 0) {
                $consolidatedPath = Join-Path $outputPath "PhysicalServerDiscovery.csv"
                $consolidatedServers | Export-Csv -Path $consolidatedPath -NoTypeInformation -Force -Encoding UTF8
                Write-PhysicalServerLog -Level "SUCCESS" -Message "Exported $(@($consolidatedServers).Count) consolidated server records to PhysicalServerDiscovery.csv" -Context $Context
            }
        } else {
            Write-PhysicalServerLog -Level "WARN" -Message "No physical server data discovered to export" -Context $Context
        }

        # Set the discovered data so Complete() can automatically calculate metadata
        $result.Data = $allDiscoveredData
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-PhysicalServerLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during physical server discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-PhysicalServerLog -Level "HEADER" -Message "Physical server discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

function Get-SystemInformation {
    <#
    .SYNOPSIS
        Discovers system information using WMI/CIM.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $systemInfo = @()
    
    try {
        # Get Computer System Information
        $computerSystem = Get-CimInstance -ClassName Win32_ComputerSystem
        $operatingSystem = Get-CimInstance -ClassName Win32_OperatingSystem
        $processor = Get-CimInstance -ClassName Win32_Processor | Select-Object -First 1
        
        $systemInfo += [PSCustomObject]@{
            ComponentType = "ComputerSystem"
            Name = $computerSystem.Name
            Manufacturer = $computerSystem.Manufacturer
            Model = $computerSystem.Model
            SystemType = $computerSystem.SystemType
            TotalPhysicalMemory = [math]::Round($computerSystem.TotalPhysicalMemory / 1GB, 2)
            NumberOfProcessors = $computerSystem.NumberOfProcessors
            NumberOfLogicalProcessors = $computerSystem.NumberOfLogicalProcessors
            DomainRole = $computerSystem.DomainRole
            Domain = $computerSystem.Domain
            Workgroup = $computerSystem.Workgroup
            PartOfDomain = $computerSystem.PartOfDomain
            PrimaryOwnerName = $computerSystem.PrimaryOwnerName
            OSName = $operatingSystem.Caption
            OSVersion = $operatingSystem.Version
            OSBuildNumber = $operatingSystem.BuildNumber
            OSArchitecture = $operatingSystem.OSArchitecture
            InstallDate = $operatingSystem.InstallDate
            LastBootUpTime = $operatingSystem.LastBootUpTime
            LocalDateTime = $operatingSystem.LocalDateTime
            TimeZone = $operatingSystem.CurrentTimeZone
            ProcessorName = $processor.Name
            ProcessorManufacturer = $processor.Manufacturer
            ProcessorMaxClockSpeed = $processor.MaxClockSpeed
            ProcessorCurrentClockSpeed = $processor.CurrentClockSpeed
            ProcessorCores = $processor.NumberOfCores
            ProcessorLogicalProcessors = $processor.NumberOfLogicalProcessors
            SessionId = $SessionId
        }
        
    } catch {
        Write-PhysicalServerLog -Level "ERROR" -Message "Failed to get system information: $($_.Exception.Message)"
    }
    
    return $systemInfo
}

function Get-HardwareComponents {
    <#
    .SYNOPSIS
        Discovers hardware components including CPU, memory, and motherboard.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $hardware = @()
    
    try {
        # Get Processor Information
        $processors = Get-CimInstance -ClassName Win32_Processor
        foreach ($processor in $processors) {
            $hardware += [PSCustomObject]@{
                ComponentType = "Processor"
                DeviceID = $processor.DeviceID
                Name = $processor.Name
                Manufacturer = $processor.Manufacturer
                Family = $processor.Family
                Model = $processor.Model
                Stepping = $processor.Stepping
                MaxClockSpeed = $processor.MaxClockSpeed
                CurrentClockSpeed = $processor.CurrentClockSpeed
                ExternalClock = $processor.ExternalClock
                NumberOfCores = $processor.NumberOfCores
                NumberOfLogicalProcessors = $processor.NumberOfLogicalProcessors
                L2CacheSize = $processor.L2CacheSize
                L3CacheSize = $processor.L3CacheSize
                SocketDesignation = $processor.SocketDesignation
                ProcessorType = $processor.ProcessorType
                Voltage = $processor.CurrentVoltage
                Status = $processor.Status
                Architecture = $processor.Architecture
                SessionId = $SessionId
            }
        }
        
        # Get Memory Information
        $memoryModules = Get-CimInstance -ClassName Win32_PhysicalMemory
        foreach ($memory in $memoryModules) {
            $hardware += [PSCustomObject]@{
                ComponentType = "Memory"
                Tag = $memory.Tag
                BankLabel = $memory.BankLabel
                DeviceLocator = $memory.DeviceLocator
                Capacity = [math]::Round($memory.Capacity / 1GB, 2)
                Speed = $memory.Speed
                Manufacturer = $memory.Manufacturer
                PartNumber = $memory.PartNumber
                SerialNumber = $memory.SerialNumber
                DataWidth = $memory.DataWidth
                TotalWidth = $memory.TotalWidth
                FormFactor = $memory.FormFactor
                MemoryType = $memory.MemoryType
                SMBIOSMemoryType = $memory.SMBIOSMemoryType
                ConfiguredClockSpeed = $memory.ConfiguredClockSpeed
                ConfiguredVoltage = $memory.ConfiguredVoltage
                SessionId = $SessionId
            }
        }
        
        # Get Motherboard Information
        $motherboard = Get-CimInstance -ClassName Win32_BaseBoard
        $hardware += [PSCustomObject]@{
            ComponentType = "Motherboard"
            Manufacturer = $motherboard.Manufacturer
            Product = $motherboard.Product
            SerialNumber = $motherboard.SerialNumber
            Version = $motherboard.Version
            Model = $motherboard.Model
            PartNumber = $motherboard.PartNumber
            ConfigOptions = ($motherboard.ConfigOptions -join '; ')
            SessionId = $SessionId
        }
        
    } catch {
        Write-PhysicalServerLog -Level "ERROR" -Message "Failed to get hardware components: $($_.Exception.Message)"
    }
    
    return $hardware
}

function Get-StorageInformation {
    <#
    .SYNOPSIS
        Discovers storage information including disks, volumes, and controllers.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $storage = @()
    
    try {
        # Get Physical Disks
        $physicalDisks = Get-CimInstance -ClassName Win32_DiskDrive
        foreach ($disk in $physicalDisks) {
            $storage += [PSCustomObject]@{
                ComponentType = "PhysicalDisk"
                DeviceID = $disk.DeviceID
                Model = $disk.Model
                Manufacturer = $disk.Manufacturer
                SerialNumber = $disk.SerialNumber
                Size = [math]::Round($disk.Size / 1GB, 2)
                MediaType = $disk.MediaType
                InterfaceType = $disk.InterfaceType
                Partitions = $disk.Partitions
                SectorsPerTrack = $disk.SectorsPerTrack
                TracksPerCylinder = $disk.TracksPerCylinder
                TotalCylinders = $disk.TotalCylinders
                TotalHeads = $disk.TotalHeads
                TotalSectors = $disk.TotalSectors
                TotalTracks = $disk.TotalTracks
                BytesPerSector = $disk.BytesPerSector
                FirmwareRevision = $disk.FirmwareRevision
                Status = $disk.Status
                SessionId = $SessionId
            }
        }
        
        # Get Logical Disks (Volumes)
        $logicalDisks = Get-CimInstance -ClassName Win32_LogicalDisk
        foreach ($volume in $logicalDisks) {
            $storage += [PSCustomObject]@{
                ComponentType = "LogicalDisk"
                DeviceID = $volume.DeviceID
                DriveType = $volume.DriveType
                FileSystem = $volume.FileSystem
                Size = [math]::Round($volume.Size / 1GB, 2)
                FreeSpace = [math]::Round($volume.FreeSpace / 1GB, 2)
                UsedSpace = [math]::Round(($volume.Size - $volume.FreeSpace) / 1GB, 2)
                PercentFree = [math]::Round(($volume.FreeSpace / $volume.Size) * 100, 2)
                VolumeName = $volume.VolumeName
                VolumeSerialNumber = $volume.VolumeSerialNumber
                Compressed = $volume.Compressed
                Description = $volume.Description
                SessionId = $SessionId
            }
        }
        
        # Get SCSI Controllers
        $scsiControllers = Get-CimInstance -ClassName Win32_SCSIController
        foreach ($controller in $scsiControllers) {
            $storage += [PSCustomObject]@{
                ComponentType = "SCSIController"
                DeviceID = $controller.DeviceID
                Name = $controller.Name
                Manufacturer = $controller.Manufacturer
                Description = $controller.Description
                DriverVersion = $controller.DriverVersion
                HardwareVersion = $controller.HardwareVersion
                Status = $controller.Status
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-PhysicalServerLog -Level "ERROR" -Message "Failed to get storage information: $($_.Exception.Message)"
    }
    
    return $storage
}

function Get-NetworkHardware {
    <#
    .SYNOPSIS
        Discovers network hardware including network adapters and their configurations.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $networkHardware = @()
    
    try {
        # Get Network Adapters
        $networkAdapters = Get-CimInstance -ClassName Win32_NetworkAdapter | Where-Object { $_.PhysicalAdapter -eq $true }
        foreach ($adapter in $networkAdapters) {
            $networkHardware += [PSCustomObject]@{
                ComponentType = "NetworkAdapter"
                DeviceID = $adapter.DeviceID
                Name = $adapter.Name
                Manufacturer = $adapter.Manufacturer
                Description = $adapter.Description
                MACAddress = $adapter.MACAddress
                AdapterType = $adapter.AdapterType
                Speed = $adapter.Speed
                MaxSpeed = $adapter.MaxSpeed
                NetworkAddresses = ($adapter.NetworkAddresses -join '; ')
                PermanentAddress = $adapter.PermanentAddress
                ServiceName = $adapter.ServiceName
                Status = $adapter.NetConnectionStatus
                PhysicalAdapter = $adapter.PhysicalAdapter
                SessionId = $SessionId
            }
        }
        
        # Get Network Adapter Configuration
        $adapterConfigs = Get-CimInstance -ClassName Win32_NetworkAdapterConfiguration | Where-Object { $_.IPEnabled -eq $true }
        foreach ($config in $adapterConfigs) {
            $networkHardware += [PSCustomObject]@{
                ComponentType = "NetworkConfiguration"
                Index = $config.Index
                Description = $config.Description
                DHCPEnabled = $config.DHCPEnabled
                IPAddress = ($config.IPAddress -join '; ')
                IPSubnet = ($config.IPSubnet -join '; ')
                DefaultIPGateway = ($config.DefaultIPGateway -join '; ')
                DNSServerSearchOrder = ($config.DNSServerSearchOrder -join '; ')
                DNSDomain = $config.DNSDomain
                DNSHostName = $config.DNSHostName
                WINSPrimaryServer = $config.WINSPrimaryServer
                WINSSecondaryServer = $config.WINSSecondaryServer
                SessionId = $SessionId
            }
        }
        
    } catch {
        Write-PhysicalServerLog -Level "ERROR" -Message "Failed to get network hardware: $($_.Exception.Message)"
    }
    
    return $networkHardware
}

function Get-BIOSInformation {
    <#
    .SYNOPSIS
        Discovers BIOS/UEFI information and firmware details.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $biosInfo = @()
    
    try {
        # Get BIOS Information
        $bios = Get-CimInstance -ClassName Win32_BIOS
        $biosInfo += [PSCustomObject]@{
            ComponentType = "BIOS"
            Manufacturer = $bios.Manufacturer
            Name = $bios.Name
            Description = $bios.Description
            Version = $bios.Version
            SMBIOSVersion = $bios.SMBIOSBIOSVersion
            SerialNumber = $bios.SerialNumber
            ReleaseDate = $bios.ReleaseDate
            InstallDate = $bios.InstallDate
            CurrentLanguage = $bios.CurrentLanguage
            ListOfLanguages = ($bios.ListOfLanguages -join '; ')
            PrimaryBIOS = $bios.PrimaryBIOS
            Status = $bios.Status
            SessionId = $SessionId
        }
        
        # Get System Enclosure/Chassis Information
        $systemEnclosure = Get-CimInstance -ClassName Win32_SystemEnclosure
        $biosInfo += [PSCustomObject]@{
            ComponentType = "SystemEnclosure"
            ChassisTypes = ($systemEnclosure.ChassisTypes -join '; ')
            Manufacturer = $systemEnclosure.Manufacturer
            Model = $systemEnclosure.Model
            SerialNumber = $systemEnclosure.SerialNumber
            SMBIOSAssetTag = $systemEnclosure.SMBIOSAssetTag
            SecurityStatus = $systemEnclosure.SecurityStatus
            LockPresent = $systemEnclosure.LockPresent
            BootupState = $systemEnclosure.BootupState
            PowerState = $systemEnclosure.PowerState
            ThermalState = $systemEnclosure.ThermalState
            SessionId = $SessionId
        }
        
    } catch {
        Write-PhysicalServerLog -Level "ERROR" -Message "Failed to get BIOS information: $($_.Exception.Message)"
    }
    
    return $biosInfo
}

# Export functions
Export-ModuleMember -Function Invoke-PhysicalServerDiscovery
