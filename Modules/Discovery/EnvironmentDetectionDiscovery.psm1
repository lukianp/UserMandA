# -*- coding: utf-8-bom -*-
#Requires -Version 5.1


# Fallback logging function if Write-MandALog is not available
if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
    function Write-MandALog {
        param(
            [string]$Message,
            [string]$Level = "INFO",
            [string]$Component = "Discovery",
            [hashtable]$Context = @{}
        )
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Write-Host "[$timestamp] [$Level] [$Component] $Message" -ForegroundColor $(
            switch ($Level) {
                'ERROR' { 'Red' }
                'WARN' { 'Yellow' }
                'SUCCESS' { 'Green' }
                'HEADER' { 'Cyan' }
                'DEBUG' { 'Gray' }
                default { 'White' }
            }
        )
    }
}

function Write-EnvironmentDetectionLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[EnvironmentDetection] $Message" -Level $Level -Component "EnvironmentDetectionDiscovery" -Context $Context
}

function Invoke-EnvironmentDetectionDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-EnvironmentDetectionLog -Level "HEADER" -Message "Starting Discovery (v4.0 - Clean Session Auth)" -Context $Context
    Write-EnvironmentDetectionLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    # Ensure ClassDefinitions module is loaded
    try {
        if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
            Import-Module -Name "$PSScriptRoot\..\Core\ClassDefinitions.psm1" -Force -ErrorAction Stop
        }
        $result = [DiscoveryResult]::new('EnvironmentDetection')
    } catch {
        Write-EnvironmentDetectionLog -Level "ERROR" -Message "Failed to load DiscoveryResult class: $($_.Exception.Message)" -Context $Context
        throw "Critical error: Cannot load required DiscoveryResult class. Discovery cannot proceed."
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Ensure-Path -Path $outputPath

        # Authenticate using session (if needed for this service type)
        if ("Network" -eq "Graph") {
            Write-EnvironmentDetectionLog -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
            try {
                $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
                Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Connected to Microsoft Graph via session authentication" -Context $Context
            } catch {
                $result.AddError("Failed to authenticate with Graph service: $($_.Exception.Message)", $_.Exception, $null)
                return $result
            }
        } else {
            Write-EnvironmentDetectionLog -Level "INFO" -Message "Using session-based authentication for Network service" -Context $Context
        }

        # Perform comprehensive environment detection
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Starting comprehensive environment detection..." -Context $Context
        
        # 1. Operating System Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting operating system information..." -Context $Context
        try {
            $osInfo = Get-CimInstance -ClassName Win32_OperatingSystem
            $computerInfo = Get-ComputerInfo -ErrorAction SilentlyContinue
            
            $osData = [PSCustomObject]@{
                OSName = $osInfo.Caption
                OSVersion = $osInfo.Version
                OSBuildNumber = $osInfo.BuildNumber
                OSArchitecture = $osInfo.OSArchitecture
                ServicePackMajorVersion = $osInfo.ServicePackMajorVersion
                ServicePackMinorVersion = $osInfo.ServicePackMinorVersion
                InstallDate = $osInfo.InstallDate
                LastBootUpTime = $osInfo.LastBootUpTime
                SystemDirectory = $osInfo.SystemDirectory
                WindowsDirectory = $osInfo.WindowsDirectory
                TotalPhysicalMemoryGB = [math]::Round($osInfo.TotalVisibleMemorySize / 1MB, 2)
                FreePhysicalMemoryGB = [math]::Round($osInfo.FreePhysicalMemory / 1MB, 2)
                VirtualMemoryMaxSizeGB = [math]::Round($osInfo.MaxProcessMemorySize / 1MB, 2)
                Manufacturer = $osInfo.Manufacturer
                RegisteredUser = $osInfo.RegisteredUser
                Organization = $osInfo.Organization
                SerialNumber = $osInfo.SerialNumber
                SystemDrive = $osInfo.SystemDrive
                PowerShellVersion = $PSVersionTable.PSVersion.ToString()
                DotNetFrameworkVersion = if ($computerInfo) { $computerInfo.WindowsVersion } else { "Unknown" }
                _DataType = 'OperatingSystem'
            }
            $null = $allDiscoveredData.Add($osData)
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Operating system information detected" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "OS detection failed: $($_.Exception.Message)" -Context $Context
        }

        # 2. Hardware Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting hardware information..." -Context $Context
        try {
            $computerSystem = Get-CimInstance -ClassName Win32_ComputerSystem
            $processor = Get-CimInstance -ClassName Win32_Processor | Select-Object -First 1
            $bios = Get-CimInstance -ClassName Win32_BIOS
            
            $hardwareData = [PSCustomObject]@{
                Manufacturer = $computerSystem.Manufacturer
                Model = $computerSystem.Model
                SystemType = $computerSystem.SystemType
                TotalPhysicalMemoryGB = [math]::Round($computerSystem.TotalPhysicalMemory / 1GB, 2)
                NumberOfProcessors = $computerSystem.NumberOfProcessors
                NumberOfLogicalProcessors = $computerSystem.NumberOfLogicalProcessors
                ProcessorName = $processor.Name
                ProcessorManufacturer = $processor.Manufacturer
                ProcessorArchitecture = $processor.Architecture
                ProcessorMaxClockSpeed = $processor.MaxClockSpeed
                ProcessorCurrentClockSpeed = $processor.CurrentClockSpeed
                ProcessorCores = $processor.NumberOfCores
                ProcessorLogicalProcessors = $processor.NumberOfLogicalProcessors
                BIOSVersion = $bios.SMBIOSBIOSVersion
                BIOSManufacturer = $bios.Manufacturer
                BIOSReleaseDate = $bios.ReleaseDate
                SerialNumber = $bios.SerialNumber
                SystemFamily = $computerSystem.SystemFamily
                SystemSKUNumber = $computerSystem.SystemSKUNumber
                _DataType = 'Hardware'
            }
            $null = $allDiscoveredData.Add($hardwareData)
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Hardware information detected" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Hardware detection failed: $($_.Exception.Message)" -Context $Context
        }

        # 3. Network Environment Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting network environment..." -Context $Context
        try {
            $networkAdapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }
            $ipConfig = Get-NetIPConfiguration
            
            foreach ($adapter in $networkAdapters) {
                $adapterConfig = $ipConfig | Where-Object { $_.InterfaceIndex -eq $adapter.InterfaceIndex }
                
                $networkData = [PSCustomObject]@{
                    AdapterName = $adapter.Name
                    InterfaceDescription = $adapter.InterfaceDescription
                    InterfaceIndex = $adapter.InterfaceIndex
                    MACAddress = $adapter.MacAddress
                    LinkSpeed = $adapter.LinkSpeed
                    FullDuplex = $adapter.FullDuplex
                    MediaType = $adapter.MediaType
                    PhysicalMediaType = $adapter.PhysicalMediaType
                    IPAddress = ($adapterConfig.IPv4Address.IPAddress -join ';')
                    SubnetMask = ($adapterConfig.IPv4Address.PrefixLength -join ';')
                    DefaultGateway = ($adapterConfig.IPv4DefaultGateway.NextHop -join ';')
                    DNSServers = ((Get-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex).ServerAddresses -join ';')
                    DHCPEnabled = $adapterConfig.NetProfile.NetworkCategory
                    ConnectionSpecificSuffix = $adapterConfig.NetProfile.Name
                    Status = $adapter.Status
                    AdminStatus = $adapter.AdminStatus
                    OperationalStatus = $adapter.OperationalStatus
                    _DataType = 'NetworkAdapter'
                }
                $null = $allDiscoveredData.Add($networkData)
            }
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Detected $($networkAdapters.Count) network adapters" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Network detection failed: $($_.Exception.Message)" -Context $Context
        }

        # 4. Domain and Authentication Environment
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting domain and authentication environment..." -Context $Context
        try {
            $computerSystem = Get-CimInstance -ClassName Win32_ComputerSystem
            
            $domainData = [PSCustomObject]@{
                ComputerName = $env:COMPUTERNAME
                Domain = $computerSystem.Domain
                Workgroup = $computerSystem.Workgroup
                PartOfDomain = $computerSystem.PartOfDomain
                DomainRole = switch ($computerSystem.DomainRole) {
                    0 { "Standalone Workstation" }
                    1 { "Member Workstation" }
                    2 { "Standalone Server" }
                    3 { "Member Server" }
                    4 { "Backup Domain Controller" }
                    5 { "Primary Domain Controller" }
                    default { "Unknown" }
                }
                PrimaryOwnerName = $computerSystem.PrimaryOwnerName
                UserName = $computerSystem.UserName
                LogonServer = $env:LOGONSERVER
                UserDomain = $env:USERDOMAIN
                UserDNSDomain = $env:USERDNSDOMAIN
                _DataType = 'DomainEnvironment'
            }
            $null = $allDiscoveredData.Add($domainData)
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Domain environment detected" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Domain detection failed: $($_.Exception.Message)" -Context $Context
        }

        # 5. Virtualization Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting virtualization environment..." -Context $Context
        try {
            $virtualizationData = Get-VirtualizationEnvironment
            $null = $allDiscoveredData.Add($virtualizationData)
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Virtualization environment detected: $($virtualizationData.VirtualizationType)" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Virtualization detection failed: $($_.Exception.Message)" -Context $Context
        }

        # 6. Cloud Environment Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting cloud environment..." -Context $Context
        try {
            $cloudData = Get-CloudEnvironment
            $null = $allDiscoveredData.Add($cloudData)
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Cloud environment detected: $($cloudData.CloudProvider)" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Cloud detection failed: $($_.Exception.Message)" -Context $Context
        }

        # 7. Security Environment Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting security environment..." -Context $Context
        try {
            $securityData = Get-SecurityEnvironment
            $null = $allDiscoveredData.Add($securityData)
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Security environment detected" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Security detection failed: $($_.Exception.Message)" -Context $Context
        }

        # 8. Software Environment Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting software environment..." -Context $Context
        try {
            $softwareData = Get-SoftwareEnvironment
            $null = $allDiscoveredData.Add($softwareData)
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Software environment detected" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Software detection failed: $($_.Exception.Message)" -Context $Context
        }

        # Export data
        if ($allDiscoveredData.Count -gt 0) {
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $data = $group.Group
                $data | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "EnvironmentDetection" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                $fileName = "EnvironmentDetection_$($group.Name).csv"
                $filePath = Join-Path $outputPath $fileName
                $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Exported $($data.Count) $($group.Name) records to $fileName" -Context $Context
            }
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-EnvironmentDetectionLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        $result.AddError("A critical error occurred during discovery: $($_.Exception.Message)", $_.Exception, $null)
    } finally {
        if ("Network" -eq "Graph") {
            Disconnect-MgGraph -ErrorAction SilentlyContinue
        }
        $stopwatch.Stop()
        $result.Complete()
        Write-EnvironmentDetectionLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

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

function Get-VirtualizationEnvironment {
    [CmdletBinding()]
    param()
    
    try {
        $computerSystem = Get-CimInstance -ClassName Win32_ComputerSystem
        $isVirtual = $false
        $virtualizationType = "Physical"
        $hypervisorVendor = "None"
        
        # Check common virtualization indicators
        $virtualIndicators = @{
            "VMware" = @("VMware", "VMware Virtual", "VMware, Inc.")
            "VirtualBox" = @("VirtualBox", "Oracle Corporation")
            "Hyper-V" = @("Microsoft Corporation", "Virtual Machine")
            "Xen" = @("Xen", "Citrix")
            "KVM" = @("QEMU", "Red Hat")
            "Parallels" = @("Parallels")
        }
        
        foreach ($vendor in $virtualIndicators.Keys) {
            foreach ($indicator in $virtualIndicators[$vendor]) {
                if ($computerSystem.Manufacturer -like "*$indicator*" -or $computerSystem.Model -like "*$indicator*") {
                    $isVirtual = $true
                    $virtualizationType = $vendor
                    $hypervisorVendor = $indicator
                    break
                }
            }
            if ($isVirtual) { break }
        }
        
        # Additional checks
        $biosInfo = Get-CimInstance -ClassName Win32_BIOS
        if ($biosInfo.Manufacturer -like "*VMware*" -or $biosInfo.Version -like "*VMware*") {
            $isVirtual = $true
            $virtualizationType = "VMware"
            $hypervisorVendor = "VMware"
        }
        
        return [PSCustomObject]@{
            IsVirtual = $isVirtual
            VirtualizationType = $virtualizationType
            HypervisorVendor = $hypervisorVendor
            Manufacturer = $computerSystem.Manufacturer
            Model = $computerSystem.Model
            BIOSManufacturer = $biosInfo.Manufacturer
            BIOSVersion = $biosInfo.Version
            _DataType = 'VirtualizationEnvironment'
        }
    } catch {
        return [PSCustomObject]@{
            IsVirtual = $false
            VirtualizationType = "Unknown"
            HypervisorVendor = "Unknown"
            Error = $_.Exception.Message
            _DataType = 'VirtualizationEnvironment'
        }
    }
}

function Get-CloudEnvironment {
    [CmdletBinding()]
    param()
    
    try {
        $cloudProvider = "None"
        $isCloudInstance = $false
        $instanceMetadata = @{}
        
        # Check for Azure
        try {
            $azureMetadata = Invoke-RestMethod -Uri "http://169.254.169.254/metadata/instance?api-version=2021-02-01" -Headers @{Metadata="true"} -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($azureMetadata) {
                $cloudProvider = "Microsoft Azure"
                $isCloudInstance = $true
                $instanceMetadata = @{
                    InstanceId = $azureMetadata.compute.vmId
                    InstanceType = $azureMetadata.compute.vmSize
                    Location = $azureMetadata.compute.location
                    ResourceGroup = $azureMetadata.compute.resourceGroupName
                    SubscriptionId = $azureMetadata.compute.subscriptionId
                }
            }
        } catch { }
        
        # Check for AWS
        if (-not $isCloudInstance) {
            try {
                $awsToken = Invoke-RestMethod -Uri "http://169.254.169.254/latest/api/token" -Method PUT -Headers @{"X-aws-ec2-metadata-token-ttl-seconds"="21600"} -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($awsToken) {
                    $awsMetadata = Invoke-RestMethod -Uri "http://169.254.169.254/latest/meta-data/instance-id" -Headers @{"X-aws-ec2-metadata-token"=$awsToken} -TimeoutSec 5 -ErrorAction SilentlyContinue
                    if ($awsMetadata) {
                        $cloudProvider = "Amazon AWS"
                        $isCloudInstance = $true
                        $instanceType = Invoke-RestMethod -Uri "http://169.254.169.254/latest/meta-data/instance-type" -Headers @{"X-aws-ec2-metadata-token"=$awsToken} -TimeoutSec 5 -ErrorAction SilentlyContinue
                        $availabilityZone = Invoke-RestMethod -Uri "http://169.254.169.254/latest/meta-data/placement/availability-zone" -Headers @{"X-aws-ec2-metadata-token"=$awsToken} -TimeoutSec 5 -ErrorAction SilentlyContinue
                        $instanceMetadata = @{
                            InstanceId = $awsMetadata
                            InstanceType = $instanceType
                            AvailabilityZone = $availabilityZone
                        }
                    }
                }
            } catch { }
        }
        
        # Check for Google Cloud
        if (-not $isCloudInstance) {
            try {
                $gcpMetadata = Invoke-RestMethod -Uri "http://metadata.google.internal/computeMetadata/v1/instance/id" -Headers @{"Metadata-Flavor"="Google"} -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($gcpMetadata) {
                    $cloudProvider = "Google Cloud Platform"
                    $isCloudInstance = $true
                    $machineType = Invoke-RestMethod -Uri "http://metadata.google.internal/computeMetadata/v1/instance/machine-type" -Headers @{"Metadata-Flavor"="Google"} -TimeoutSec 5 -ErrorAction SilentlyContinue
                    $zone = Invoke-RestMethod -Uri "http://metadata.google.internal/computeMetadata/v1/instance/zone" -Headers @{"Metadata-Flavor"="Google"} -TimeoutSec 5 -ErrorAction SilentlyContinue
                    $instanceMetadata = @{
                        InstanceId = $gcpMetadata
                        MachineType = ($machineType -split '/')[-1]
                        Zone = ($zone -split '/')[-1]
                    }
                }
            } catch { }
        }
        
        return [PSCustomObject]@{
            IsCloudInstance = $isCloudInstance
            CloudProvider = $cloudProvider
            InstanceId = $instanceMetadata.InstanceId
            InstanceType = $instanceMetadata.InstanceType
            Location = $instanceMetadata.Location
            Zone = $instanceMetadata.Zone
            AvailabilityZone = $instanceMetadata.AvailabilityZone
            ResourceGroup = $instanceMetadata.ResourceGroup
            SubscriptionId = $instanceMetadata.SubscriptionId
            MachineType = $instanceMetadata.MachineType
            _DataType = 'CloudEnvironment'
        }
    } catch {
        return [PSCustomObject]@{
            IsCloudInstance = $false
            CloudProvider = "Unknown"
            Error = $_.Exception.Message
            _DataType = 'CloudEnvironment'
        }
    }
}

function Get-SecurityEnvironment {
    [CmdletBinding()]
    param()
    
    try {
        # Windows Defender status
        $defenderStatus = "Unknown"
        $antivirusProducts = @()
        try {
            $defender = Get-MpComputerStatus -ErrorAction SilentlyContinue
            if ($defender) {
                $defenderStatus = if ($defender.AntivirusEnabled) { "Enabled" } else { "Disabled" }
            }
        } catch { }
        
        # Get all antivirus products
        try {
            $avProducts = Get-CimInstance -Namespace "root\SecurityCenter2" -ClassName "AntiVirusProduct" -ErrorAction SilentlyContinue
            foreach ($av in $avProducts) {
                $antivirusProducts += @{
                    Name = $av.displayName
                    State = $av.productState
                    UpdateStatus = $av.productUptoDate
                }
            }
        } catch { }
        
        # Firewall status
        $firewallProfiles = @{}
        try {
            $firewallProfiles = @{
                Domain = (Get-NetFirewallProfile -Name Domain).Enabled
                Private = (Get-NetFirewallProfile -Name Private).Enabled
                Public = (Get-NetFirewallProfile -Name Public).Enabled
            }
        } catch { }
        
        # UAC status
        $uacEnabled = $false
        try {
            $uacSetting = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" -Name "EnableLUA" -ErrorAction SilentlyContinue
            $uacEnabled = $uacSetting.EnableLUA -eq 1
        } catch { }
        
        # BitLocker status
        $bitLockerStatus = @()
        try {
            $bitLockerVolumes = Get-BitLockerVolume -ErrorAction SilentlyContinue
            foreach ($volume in $bitLockerVolumes) {
                $bitLockerStatus += @{
                    Drive = $volume.MountPoint
                    EncryptionPercentage = $volume.EncryptionPercentage
                    VolumeStatus = $volume.VolumeStatus
                    ProtectionStatus = $volume.ProtectionStatus
                }
            }
        } catch { }
        
        return [PSCustomObject]@{
            WindowsDefenderStatus = $defenderStatus
            AntivirusProducts = ($antivirusProducts | ConvertTo-Json -Compress)
            FirewallDomainEnabled = $firewallProfiles.Domain
            FirewallPrivateEnabled = $firewallProfiles.Private
            FirewallPublicEnabled = $firewallProfiles.Public
            UACEnabled = $uacEnabled
            BitLockerVolumes = ($bitLockerStatus | ConvertTo-Json -Compress)
            _DataType = 'SecurityEnvironment'
        }
    } catch {
        return [PSCustomObject]@{
            Error = $_.Exception.Message
            _DataType = 'SecurityEnvironment'
        }
    }
}

function Get-SoftwareEnvironment {
    [CmdletBinding()]
    param()
    
    try {
        # PowerShell modules
        $installedModules = @()
        try {
            $modules = Get-Module -ListAvailable | Group-Object Name | ForEach-Object { $_.Group | Sort-Object Version -Descending | Select-Object -First 1 }
            $installedModules = $modules | Select-Object Name, Version, ModuleType, Path | Sort-Object Name
        } catch { }
        
        # .NET Framework versions
        $dotNetVersions = @()
        try {
            $dotNetKey = "HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP"
            if (Test-Path $dotNetKey) {
                $dotNetVersions = Get-ChildItem $dotNetKey | Where-Object { $_.Name -match "v\d+\.\d+" } | ForEach-Object {
                    $version = $_.Name -replace ".*\\v", "v"
                    $install = Get-ItemProperty -Path $_.PSPath -Name "Install" -ErrorAction SilentlyContinue
                    if ($install.Install -eq 1) { $version }
                }
            }
        } catch { }
        
        # Windows features
        $windowsFeatures = @()
        try {
            $features = Get-WindowsOptionalFeature -Online | Where-Object { $_.State -eq "Enabled" } | Select-Object FeatureName, State
            $windowsFeatures = $features | Sort-Object FeatureName
        } catch { }
        
        # IIS information
        $iisInfo = @{}
        try {
            if (Get-WindowsFeature -Name "IIS-WebServerRole" -ErrorAction SilentlyContinue | Where-Object { $_.InstallState -eq "Installed" }) {
                Import-Module WebAdministration -ErrorAction SilentlyContinue
                $sites = Get-Website -ErrorAction SilentlyContinue
                $iisInfo = @{
                    IsInstalled = $true
                    SiteCount = $sites.Count
                    Sites = ($sites | Select-Object Name, State, PhysicalPath | ConvertTo-Json -Compress)
                }
            } else {
                $iisInfo = @{ IsInstalled = $false }
            }
        } catch {
            $iisInfo = @{ IsInstalled = $false; Error = $_.Exception.Message }
        }
        
        # SQL Server information
        $sqlServerInfo = @{}
        try {
            $sqlServices = Get-Service | Where-Object { $_.Name -like "*SQL*" -and $_.Status -eq "Running" }
            $sqlServerInfo = @{
                ServicesRunning = $sqlServices.Count
                Services = ($sqlServices | Select-Object Name, DisplayName, Status | ConvertTo-Json -Compress)
            }
        } catch {
            $sqlServerInfo = @{ ServicesRunning = 0 }
        }
        
        return [PSCustomObject]@{
            PowerShellVersion = $PSVersionTable.PSVersion.ToString()
            PowerShellModuleCount = $installedModules.Count
            DotNetFrameworkVersions = ($dotNetVersions -join ';')
            WindowsFeaturesEnabled = $windowsFeatures.Count
            IISInstalled = $iisInfo.IsInstalled
            IISSiteCount = $iisInfo.SiteCount
            SQLServerServicesRunning = $sqlServerInfo.ServicesRunning
            _DataType = 'SoftwareEnvironment'
        }
    } catch {
        return [PSCustomObject]@{
            Error = $_.Exception.Message
            _DataType = 'SoftwareEnvironment'
        }
    }
}

Export-ModuleMember -Function Invoke-EnvironmentDetectionDiscovery
