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

function Invoke-WebRequestWithRetry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Uri,

        [hashtable]$Headers,

        [hashtable]$Body,

        [string]$ContentType,

        [int]$TimeoutSec = 5,

        [int]$MaxRetries = 3,

        [string]$Method = "GET"
    )

    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        try {
            # Build request parameters
            $params = @{
                Uri = $Uri
                Method = $Method
                TimeoutSec = $TimeoutSec
                ErrorAction = 'Stop'
            }

            if ($Headers) {
                $params['Headers'] = $Headers
            }

            if ($Body) {
                $params['Body'] = $Body
            }

            if ($ContentType) {
                $params['ContentType'] = $ContentType
            }

            return Invoke-RestMethod @params
        } catch {
            if ($attempt -lt $MaxRetries) {
                $waitTime = 500 * $attempt # Exponential backoff: 500ms, 1000ms, 1500ms
                Write-EnvironmentDetectionLog -Level "DEBUG" -Message "API call failed (attempt $attempt/$MaxRetries), retrying in ${waitTime}ms..." -Context @{}
                Start-Sleep -Milliseconds $waitTime
            } else {
                throw $_
            }
        }
    }
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

    Write-EnvironmentDetectionLog -Level "HEADER" -Message "Starting Discovery (v5.1 - Enhanced with Retry Logic & Progress Tracking)" -Context $Context
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
        $detectionStep = 0
        $totalDetections = 14

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
        $detectionStep++
        $result.RecordCount = $allDiscoveredData.Count
        $progressPercent = [math]::Round(($detectionStep / $totalDetections) * 100)
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Progress: $progressPercent% ($detectionStep/$totalDetections detections complete)" -Context $Context

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
        $detectionStep++
        $result.RecordCount = $allDiscoveredData.Count
        $progressPercent = [math]::Round(($detectionStep / $totalDetections) * 100)
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Progress: $progressPercent% ($detectionStep/$totalDetections detections complete)" -Context $Context

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
        $detectionStep++
        $result.RecordCount = $allDiscoveredData.Count
        $progressPercent = [math]::Round(($detectionStep / $totalDetections) * 100)
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Progress: $progressPercent% ($detectionStep/$totalDetections detections complete)" -Context $Context

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
        $detectionStep++
        $result.RecordCount = $allDiscoveredData.Count
        $progressPercent = [math]::Round(($detectionStep / $totalDetections) * 100)
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Progress: $progressPercent% ($detectionStep/$totalDetections detections complete)" -Context $Context

        # 5. Virtualization Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting virtualization environment..." -Context $Context
        try {
            $virtualizationData = Get-VirtualizationEnvironment
            $null = $allDiscoveredData.Add($virtualizationData)
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Virtualization environment detected: $($virtualizationData.VirtualizationType)" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Virtualization detection failed: $($_.Exception.Message)" -Context $Context
        }
        $detectionStep++
        $result.RecordCount = $allDiscoveredData.Count
        $progressPercent = [math]::Round(($detectionStep / $totalDetections) * 100)
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Progress: $progressPercent% ($detectionStep/$totalDetections detections complete)" -Context $Context

        # 6. Cloud Environment Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting cloud environment..." -Context $Context
        try {
            $cloudData = Get-CloudEnvironment
            $null = $allDiscoveredData.Add($cloudData)
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Cloud environment detected: $($cloudData.CloudProvider)" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Cloud detection failed: $($_.Exception.Message)" -Context $Context
        }
        $detectionStep++
        $result.RecordCount = $allDiscoveredData.Count
        $progressPercent = [math]::Round(($detectionStep / $totalDetections) * 100)
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Progress: $progressPercent% ($detectionStep/$totalDetections detections complete)" -Context $Context

        # 7. Security Environment Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting security environment..." -Context $Context
        try {
            $securityData = Get-SecurityEnvironment
            $null = $allDiscoveredData.Add($securityData)
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Security environment detected" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Security detection failed: $($_.Exception.Message)" -Context $Context
        }
        $detectionStep++
        $result.RecordCount = $allDiscoveredData.Count
        $progressPercent = [math]::Round(($detectionStep / $totalDetections) * 100)
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Progress: $progressPercent% ($detectionStep/$totalDetections detections complete)" -Context $Context

        # 8. Software Environment Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting software environment..." -Context $Context
        try {
            $softwareData = Get-SoftwareEnvironment
            $null = $allDiscoveredData.Add($softwareData)
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Software environment detected" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Software detection failed: $($_.Exception.Message)" -Context $Context
        }
        $detectionStep++
        $result.RecordCount = $allDiscoveredData.Count
        $progressPercent = [math]::Round(($detectionStep / $totalDetections) * 100)
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Progress: $progressPercent% ($detectionStep/$totalDetections detections complete)" -Context $Context

        # 9. Installed Applications Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting installed applications..." -Context $Context
        try {
            $installedApps = Get-InstalledApplications
            foreach ($app in $installedApps) {
                $null = $allDiscoveredData.Add($app)
            }
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Detected $($installedApps.Count) installed applications" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Installed applications detection failed: $($_.Exception.Message)" -Context $Context
        }
        $detectionStep++
        $result.RecordCount = $allDiscoveredData.Count
        $progressPercent = [math]::Round(($detectionStep / $totalDetections) * 100)
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Progress: $progressPercent% ($detectionStep/$totalDetections detections complete)" -Context $Context

        # 10. Storage Volumes Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting storage volumes..." -Context $Context
        try {
            $storageVolumes = Get-StorageVolumes
            foreach ($volume in $storageVolumes) {
                $null = $allDiscoveredData.Add($volume)
            }
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Detected $($storageVolumes.Count) storage volumes" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Storage volumes detection failed: $($_.Exception.Message)" -Context $Context
        }
        $detectionStep++
        $result.RecordCount = $allDiscoveredData.Count
        $progressPercent = [math]::Round(($detectionStep / $totalDetections) * 100)
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Progress: $progressPercent% ($detectionStep/$totalDetections detections complete)" -Context $Context

        # 11. Network Routes Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting network routes..." -Context $Context
        try {
            $networkRoutes = Get-NetworkRoutes
            foreach ($route in $networkRoutes) {
                $null = $allDiscoveredData.Add($route)
            }
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Detected $($networkRoutes.Count) network routes" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Network routes detection failed: $($_.Exception.Message)" -Context $Context
        }
        $detectionStep++
        $result.RecordCount = $allDiscoveredData.Count
        $progressPercent = [math]::Round(($detectionStep / $totalDetections) * 100)
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Progress: $progressPercent% ($detectionStep/$totalDetections detections complete)" -Context $Context

        # 12. Azure Connectivity Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Testing Azure connectivity..." -Context $Context
        $azureConnectivity = $null
        try {
            # Extract profile name from OutputPath (format: C:\DiscoveryData\{ProfileName}\Raw)
            $profileName = if ($OutputPath -match 'DiscoveryData\\([^\\]+)\\') {
                $matches[1]
            } elseif ($Context.ProfileName) {
                $Context.ProfileName
            } elseif ($Configuration.ProfileName) {
                $Configuration.ProfileName
            } else {
                "unknown"
            }
            Write-EnvironmentDetectionLog -Level "INFO" -Message "Using profile: $profileName (extracted from path: $OutputPath)" -Context $Context
            $azureConnectivity = Get-AzureConnectivityStatus -ProfileName $profileName
            # Remove AccessToken before adding to export data
            $azureForExport = $azureConnectivity | Select-Object -Property * -ExcludeProperty AccessToken
            $null = $allDiscoveredData.Add($azureForExport)
            if ($azureConnectivity.IsAzureConnected) {
                Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Azure connectivity successful - Tenant: $($azureConnectivity.TenantName)" -Context $Context
            } else {
                Write-EnvironmentDetectionLog -Level "INFO" -Message "Azure connectivity test completed - not connected: $($azureConnectivity.ErrorDetails)" -Context $Context
            }
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Azure connectivity test failed: $($_.Exception.Message)" -Context $Context
        }
        $detectionStep++
        $result.RecordCount = $allDiscoveredData.Count
        $progressPercent = [math]::Round(($detectionStep / $totalDetections) * 100)
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Progress: $progressPercent% ($detectionStep/$totalDetections detections complete)" -Context $Context

        # 13. AD Connect Sync Status Detection
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting AD Connect synchronization status..." -Context $Context
        $adConnectSync = $null
        try {
            if ($azureConnectivity -and $azureConnectivity.IsAzureConnected -and $azureConnectivity.AccessToken) {
                $adConnectSync = Get-ADConnectSyncStatus -AccessToken $azureConnectivity.AccessToken
                $null = $allDiscoveredData.Add($adConnectSync)
                if ($adConnectSync.DirSyncEnabled) {
                    Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "AD Connect sync detected - Type: $($adConnectSync.SyncType), Percentage: $($adConnectSync.SyncPercentage)%" -Context $Context
                } else {
                    Write-EnvironmentDetectionLog -Level "INFO" -Message "AD Connect sync not enabled" -Context $Context
                }
            } else {
                Write-EnvironmentDetectionLog -Level "INFO" -Message "Skipping AD Connect sync detection - Azure not connected" -Context $Context
                # Add empty record
                $adConnectSync = [PSCustomObject]@{
                    DirSyncEnabled = $false
                    LastDirSyncTime = $null
                    OnPremisesNetBiosName = $null
                    OnPremisesDomainName = $null
                    SyncedUserCount = 0
                    CloudOnlyUserCount = 0
                    TotalUserCount = 0
                    SyncPercentage = 0
                    SyncType = "None"
                    _DataType = 'ADConnectSync'
                }
                $null = $allDiscoveredData.Add($adConnectSync)
            }
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "AD Connect sync detection failed: $($_.Exception.Message)" -Context $Context
        }
        $detectionStep++
        $result.RecordCount = $allDiscoveredData.Count
        $progressPercent = [math]::Round(($detectionStep / $totalDetections) * 100)
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Progress: $progressPercent% ($detectionStep/$totalDetections detections complete)" -Context $Context

        # 14. Hybrid Environment Classification
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Classifying hybrid environment..." -Context $Context
        try {
            # Find domain environment data
            $domainEnvironment = $allDiscoveredData | Where-Object { $_._DataType -eq 'DomainEnvironment' } | Select-Object -First 1

            $isDomainJoined = $domainEnvironment.PartOfDomain -eq 'True'
            $isAzureConnected = $azureConnectivity.IsAzureConnected -eq $true
            $isDirSyncEnabled = $adConnectSync.DirSyncEnabled -eq $true

            # Classify environment
            $environmentType = "Unknown"
            $environmentDescription = ""

            if ($isDomainJoined -and $isAzureConnected) {
                if ($isDirSyncEnabled) {
                    if ($adConnectSync.SyncType -eq "Full") {
                        $environmentType = "Hybrid-FullSync"
                        $environmentDescription = "Hybrid environment with full AD Connect synchronization ($($adConnectSync.SyncPercentage)% users synced)"
                    } elseif ($adConnectSync.SyncType -eq "Partial") {
                        $environmentType = "Hybrid-PartialSync"
                        $environmentDescription = "Hybrid environment with partial AD Connect synchronization ($($adConnectSync.SyncPercentage)% users synced)"
                    } else {
                        $environmentType = "Hybrid-NoSync"
                        $environmentDescription = "Hybrid environment with no active synchronization (DirSync enabled but 0% synced)"
                    }
                } else {
                    $environmentType = "Hybrid-NoSync"
                    $environmentDescription = "Hybrid environment with separate identities (no AD Connect sync)"
                }
            } elseif ($isDomainJoined -and -not $isAzureConnected) {
                $environmentType = "PureOnPrem"
                $environmentDescription = "Pure on-premises environment (domain-joined, no Azure connectivity)"
            } elseif (-not $isDomainJoined -and $isAzureConnected) {
                $environmentType = "PureAzure"
                $environmentDescription = "Pure Azure environment (not domain-joined, Azure resources detected)"
            } else {
                $environmentType = "Unknown"
                $environmentDescription = "Environment type could not be determined (no domain or Azure detected)"
            }

            $hybridClassification = [PSCustomObject]@{
                EnvironmentType = $environmentType
                Description = $environmentDescription
                IsDomainJoined = $isDomainJoined
                IsAzureConnected = $isAzureConnected
                IsDirSyncEnabled = $isDirSyncEnabled
                SyncType = if ($adConnectSync) { $adConnectSync.SyncType } else { "None" }
                SyncPercentage = if ($adConnectSync) { $adConnectSync.SyncPercentage } else { 0 }
                OnPremDomain = if ($domainEnvironment) { $domainEnvironment.Domain } else { $null }
                AzureTenantName = if ($azureConnectivity) { $azureConnectivity.TenantName } else { $null }
                ClassificationTime = (Get-Date).ToString('o')
                _DataType = 'HybridClassification'
            }

            $null = $allDiscoveredData.Add($hybridClassification)
            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Environment classified as: $environmentType - $environmentDescription" -Context $Context
        } catch {
            Write-EnvironmentDetectionLog -Level "WARN" -Message "Hybrid classification failed: $($_.Exception.Message)" -Context $Context
        }
        $detectionStep++
        $result.RecordCount = $allDiscoveredData.Count
        $progressPercent = [math]::Round(($detectionStep / $totalDetections) * 100)
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Progress: $progressPercent% ($detectionStep/$totalDetections detections complete)" -Context $Context

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
                try {
                    $data | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                    Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Exported $($data.Count) $($group.Name) records to $fileName" -Context $Context
                } catch {
                    Write-EnvironmentDetectionLog -Level "ERROR" -Message "Failed to export ${fileName}: $($_.Exception.Message)" -Context $Context
                    $result.AddError("CSV export failed for ${fileName}", $_.Exception, $null)
                }
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
        $result.EndTime = Get-Date
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
            $azureMetadata = Invoke-WebRequestWithRetry -Uri "http://169.254.169.254/metadata/instance?api-version=2021-02-01" -Headers @{Metadata="true"} -TimeoutSec 3 -MaxRetries 3
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
                $awsToken = Invoke-WebRequestWithRetry -Uri "http://169.254.169.254/latest/api/token" -Method PUT -Headers @{"X-aws-ec2-metadata-token-ttl-seconds"="21600"} -TimeoutSec 3 -MaxRetries 3
                if ($awsToken) {
                    $awsMetadata = Invoke-WebRequestWithRetry -Uri "http://169.254.169.254/latest/meta-data/instance-id" -Headers @{"X-aws-ec2-metadata-token"=$awsToken} -TimeoutSec 3 -MaxRetries 3
                    if ($awsMetadata) {
                        $cloudProvider = "Amazon AWS"
                        $isCloudInstance = $true
                        $instanceType = Invoke-WebRequestWithRetry -Uri "http://169.254.169.254/latest/meta-data/instance-type" -Headers @{"X-aws-ec2-metadata-token"=$awsToken} -TimeoutSec 3 -MaxRetries 3
                        $availabilityZone = Invoke-WebRequestWithRetry -Uri "http://169.254.169.254/latest/meta-data/placement/availability-zone" -Headers @{"X-aws-ec2-metadata-token"=$awsToken} -TimeoutSec 3 -MaxRetries 3
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
                $gcpMetadata = Invoke-WebRequestWithRetry -Uri "http://metadata.google.internal/computeMetadata/v1/instance/id" -Headers @{"Metadata-Flavor"="Google"} -TimeoutSec 3 -MaxRetries 3
                if ($gcpMetadata) {
                    $cloudProvider = "Google Cloud Platform"
                    $isCloudInstance = $true
                    $machineType = Invoke-WebRequestWithRetry -Uri "http://metadata.google.internal/computeMetadata/v1/instance/machine-type" -Headers @{"Metadata-Flavor"="Google"} -TimeoutSec 3 -MaxRetries 3
                    $zone = Invoke-WebRequestWithRetry -Uri "http://metadata.google.internal/computeMetadata/v1/instance/zone" -Headers @{"Metadata-Flavor"="Google"} -TimeoutSec 3 -MaxRetries 3
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

function Get-AzureConnectivityStatus {
    <#
    .SYNOPSIS
    Tests Azure connectivity using saved profile credentials.

    .DESCRIPTION
    Retrieves Azure credentials from profile, tests connectivity to Microsoft Graph API,
    and retrieves tenant information to validate Azure environment presence.

    .PARAMETER ProfileName
    The profile name containing Azure credentials.

    .OUTPUTS
    PSCustomObject with Azure connectivity status and tenant information.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProfileName
    )

    Write-EnvironmentDetectionLog -Level "INFO" -Message "Testing Azure connectivity using profile credentials..."

    $result = [PSCustomObject]@{
        IsAzureConnected = $false
        TenantId = $null
        TenantName = $null
        TenantType = $null
        VerifiedDomains = ""
        SubscriptionCount = 0
        ConnectionMethod = $null
        ErrorDetails = $null
        LastTestTime = (Get-Date).ToString('o')
        _DataType = 'AzureConnectivity'
    }

    try {
        # 1. Retrieve credentials from profile
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Retrieving Azure credentials from profile: $ProfileName"

        # Path to credentials file (legacy format)
        $credPath = "C:\DiscoveryData\$ProfileName\Credentials\discoverycredentials.config"

        if (-not (Test-Path $credPath)) {
            Write-EnvironmentDetectionLog -Level "WARNING" -Message "Credentials file not found at $credPath"
            $result.ErrorDetails = "Credentials file not found"
            return $result
        }

        # Read and decrypt DPAPI-encrypted credentials
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Decrypting credentials using DPAPI..."

        Add-Type -AssemblyName System.Security
        $encryptedContent = Get-Content $credPath -Raw

        # Strip BOM if present
        if ($encryptedContent[0] -eq [char]0xFEFF) {
            $encryptedContent = $encryptedContent.Substring(1)
        }
        $encryptedContent = $encryptedContent.Trim()

        $credContent = $null
        $decryptionSuccess = $false

        # Strategy 1: Hex-encoded DPAPI (most common for discoverycredentials.config)
        if ($encryptedContent -match '^[0-9A-Fa-f]+$') {
            try {
                Write-EnvironmentDetectionLog -Level "DEBUG" -Message "Trying hex-encoded DPAPI decryption..."

                if ($encryptedContent.Length % 2 -ne 0) {
                    throw "Invalid hex string length: $($encryptedContent.Length)"
                }

                # Convert hex string to byte array
                $byteCount = $encryptedContent.Length / 2
                $bytes = New-Object byte[] $byteCount

                for ($i = 0; $i -lt $byteCount; $i++) {
                    $bytes[$i] = [Convert]::ToByte($encryptedContent.Substring($i * 2, 2), 16)
                }

                # Verify DPAPI header (should start with 01000000)
                if ($bytes[0] -ne 0x01 -or $bytes[1] -ne 0x00 -or $bytes[2] -ne 0x00 -or $bytes[3] -ne 0x00) {
                    throw "Invalid DPAPI blob header"
                }

                # Decrypt using DPAPI
                $decryptedBytes = [System.Security.Cryptography.ProtectedData]::Unprotect(
                    $bytes,
                    $null,
                    [System.Security.Cryptography.DataProtectionScope]::CurrentUser
                )

                # Try UTF-16 (Unicode) encoding first (PowerShell default), then UTF-8
                $decryptedJson = $null
                try {
                    $decryptedJson = [System.Text.Encoding]::Unicode.GetString($decryptedBytes)
                    $credContent = $decryptedJson | ConvertFrom-Json
                    Write-EnvironmentDetectionLog -Level "DEBUG" -Message "Successfully parsed as Unicode (UTF-16)"
                } catch {
                    try {
                        $decryptedJson = [System.Text.Encoding]::UTF8.GetString($decryptedBytes)
                        $credContent = $decryptedJson | ConvertFrom-Json
                        Write-EnvironmentDetectionLog -Level "DEBUG" -Message "Successfully parsed as UTF-8"
                    } catch {
                        throw "Failed to parse decrypted data as Unicode or UTF-8: $($_.Exception.Message)"
                    }
                }

                $decryptionSuccess = $true
                Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Credentials decrypted successfully (hex-encoded DPAPI)"
            } catch {
                Write-EnvironmentDetectionLog -Level "DEBUG" -Message "Hex DPAPI decryption failed: $($_.Exception.Message)"
            }
        }

        # Strategy 2: Base64-encoded DPAPI
        if (-not $decryptionSuccess) {
            try {
                Write-EnvironmentDetectionLog -Level "DEBUG" -Message "Trying Base64-encoded DPAPI decryption..."

                $encryptedBytes = [Convert]::FromBase64String($encryptedContent)
                $decryptedBytes = [System.Security.Cryptography.ProtectedData]::Unprotect(
                    $encryptedBytes,
                    $null,
                    [System.Security.Cryptography.DataProtectionScope]::CurrentUser
                )

                # Try UTF-16 (Unicode) encoding first, then UTF-8
                $decryptedJson = $null
                try {
                    $decryptedJson = [System.Text.Encoding]::Unicode.GetString($decryptedBytes)
                    $credContent = $decryptedJson | ConvertFrom-Json
                    Write-EnvironmentDetectionLog -Level "DEBUG" -Message "Successfully parsed as Unicode (UTF-16)"
                } catch {
                    try {
                        $decryptedJson = [System.Text.Encoding]::UTF8.GetString($decryptedBytes)
                        $credContent = $decryptedJson | ConvertFrom-Json
                        Write-EnvironmentDetectionLog -Level "DEBUG" -Message "Successfully parsed as UTF-8"
                    } catch {
                        throw "Failed to parse decrypted data as Unicode or UTF-8"
                    }
                }

                $decryptionSuccess = $true
                Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Credentials decrypted successfully (Base64 DPAPI)"
            } catch {
                Write-EnvironmentDetectionLog -Level "DEBUG" -Message "Base64 DPAPI decryption failed: $($_.Exception.Message)"
            }
        }

        # Strategy 3: Plain JSON (unencrypted legacy format)
        if (-not $decryptionSuccess) {
            try {
                Write-EnvironmentDetectionLog -Level "DEBUG" -Message "Trying plain JSON..."

                if ($encryptedContent -match '^\s*[{\[]') {
                    $credContent = $encryptedContent | ConvertFrom-Json
                    $decryptionSuccess = $true
                    Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Credentials loaded successfully (plain JSON)"
                }
            } catch {
                Write-EnvironmentDetectionLog -Level "DEBUG" -Message "Plain JSON parse failed: $($_.Exception.Message)"
            }
        }

        # Check if any strategy succeeded
        if (-not $decryptionSuccess -or -not $credContent) {
            Write-EnvironmentDetectionLog -Level "ERROR" -Message "All credential decryption strategies failed"
            $result.ErrorDetails = "Failed to decrypt credentials (tried hex DPAPI, Base64 DPAPI, and plain JSON)"
            return $result
        }

        # Validate required fields (use capitalized property names as per credential file format)
        if (-not $credContent.TenantId -or -not $credContent.ClientId -or -not $credContent.ClientSecret) {
            Write-EnvironmentDetectionLog -Level "WARNING" -Message "Incomplete credentials in profile"
            $result.ErrorDetails = "Incomplete credentials (missing TenantId, ClientId, or ClientSecret)"
            return $result
        }

        $tenantId = $credContent.TenantId
        $clientId = $credContent.ClientId
        $clientSecret = $credContent.ClientSecret

        Write-EnvironmentDetectionLog -Level "INFO" -Message "Tenant ID: $($tenantId.Substring(0, 8))..."
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Client ID: $($clientId.Substring(0, 8))..."
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Client Secret length: $($clientSecret.Length) characters"

        # 2. Acquire access token using client credentials flow
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Acquiring access token for tenant: $tenantId"

        $tokenUrl = "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token"
        $tokenBody = @{
            grant_type    = "client_credentials"
            client_id     = $clientId
            client_secret = $clientSecret
            scope         = "https://graph.microsoft.com/.default"
        }

        # Use Invoke-RestMethod directly (as all working Azure modules do)
        $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method POST -Body $tokenBody -ContentType "application/x-www-form-urlencoded" -ErrorAction Stop

        if (-not $tokenResponse) {
            Write-EnvironmentDetectionLog -Level "ERROR" -Message "Failed to acquire access token"
            $result.ErrorDetails = "Token acquisition failed"
            return $result
        }

        $accessToken = $tokenResponse.access_token
        Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Access token acquired successfully"
        $result.ConnectionMethod = "Service Principal (Client Credentials)"

        # 3. Test Graph API - Get Organization info
        Write-EnvironmentDetectionLog -Level "INFO" -Message "Testing Microsoft Graph API connectivity..."

        $orgUrl = "https://graph.microsoft.com/v1.0/organization"
        $headers = @{
            Authorization = "Bearer $accessToken"
        }

        $orgResponse = Invoke-RestMethod -Uri $orgUrl -Headers $headers -Method GET -ErrorAction Stop

        if ($orgResponse) {
            $orgData = $orgResponse.value[0]

            $result.IsAzureConnected = $true
            $result.TenantId = $orgData.id
            $result.TenantName = $orgData.displayName
            $result.TenantType = $orgData.tenantType
            $result.VerifiedDomains = ($orgData.verifiedDomains | ForEach-Object { $_.name }) -join '; '

            Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Azure connectivity successful - Tenant: $($orgData.displayName)"
        }

        # 4. Store access token for AD Connect sync detection
        $result | Add-Member -NotePropertyName "AccessToken" -NotePropertyValue $accessToken -Force

    } catch {
        Write-EnvironmentDetectionLog -Level "ERROR" -Message "Azure connectivity test failed: $($_.Exception.Message)"
        $result.ErrorDetails = $_.Exception.Message
        $result.IsAzureConnected = $false
    }

    return $result
}

function Get-ADConnectSyncStatus {
    <#
    .SYNOPSIS
    Detects AD Connect synchronization status.

    .DESCRIPTION
    Checks if directory synchronization is enabled and retrieves sync metadata
    including last sync time and sync percentage.

    .PARAMETER AccessToken
    Microsoft Graph API access token.

    .OUTPUTS
    PSCustomObject with AD Connect sync status.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$AccessToken
    )

    Write-EnvironmentDetectionLog -Level "INFO" -Message "Detecting AD Connect synchronization status..."

    $result = [PSCustomObject]@{
        DirSyncEnabled = $false
        LastDirSyncTime = $null
        OnPremisesNetBiosName = $null
        OnPremisesDomainName = $null
        SyncedUserCount = 0
        CloudOnlyUserCount = 0
        TotalUserCount = 0
        SyncPercentage = 0
        SyncType = "None"
        _DataType = 'ADConnectSync'
    }

    try {
        $headers = @{
            Authorization = "Bearer $AccessToken"
        }

        # 1. Get organization sync configuration
        $orgUrl = "https://graph.microsoft.com/v1.0/organization"
        $orgResponse = Invoke-RestMethod -Uri $orgUrl -Headers $headers -Method GET -ErrorAction Stop

        if ($orgResponse) {
            $orgData = $orgResponse.value[0]

            $result.DirSyncEnabled = $orgData.onPremisesSyncEnabled -eq $true
            $result.LastDirSyncTime = $orgData.onPremisesLastSyncDateTime
            $result.OnPremisesNetBiosName = $orgData.onPremisesNetBiosName
            $result.OnPremisesDomainName = $orgData.onPremisesDomainName

            if ($result.DirSyncEnabled) {
                Write-EnvironmentDetectionLog -Level "SUCCESS" -Message "Directory sync is ENABLED - Last sync: $($result.LastDirSyncTime)"
            } else {
                Write-EnvironmentDetectionLog -Level "INFO" -Message "Directory sync is NOT enabled"
                return $result
            }
        }

        # 2. Get user sync statistics (sample first 999 users for performance)
        $usersUrl = "https://graph.microsoft.com/v1.0/users?`$select=id,userPrincipalName,onPremisesSyncEnabled&`$top=999"
        $usersResponse = Invoke-RestMethod -Uri $usersUrl -Headers $headers -Method GET -ErrorAction Stop

        if ($usersResponse) {
            $userData = $usersResponse.value

            $result.TotalUserCount = $userData.Count
            $result.SyncedUserCount = ($userData | Where-Object { $_.onPremisesSyncEnabled -eq $true }).Count
            $result.CloudOnlyUserCount = $result.TotalUserCount - $result.SyncedUserCount

            if ($result.TotalUserCount -gt 0) {
                $result.SyncPercentage = [math]::Round(($result.SyncedUserCount / $result.TotalUserCount) * 100, 1)
            }

            # Classify sync type based on percentage
            if ($result.SyncPercentage -eq 0) {
                $result.SyncType = "None"
            } elseif ($result.SyncPercentage -lt 80) {
                $result.SyncType = "Partial"
            } else {
                $result.SyncType = "Full"
            }

            Write-EnvironmentDetectionLog -Level "INFO" -Message "Sync statistics: $($result.SyncedUserCount)/$($result.TotalUserCount) users synced ($($result.SyncPercentage)%) - Type: $($result.SyncType)"
        }

    } catch {
        Write-EnvironmentDetectionLog -Level "ERROR" -Message "Failed to retrieve AD Connect sync status: $($_.Exception.Message)"
    }

    return $result
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

function Get-InstalledApplications {
    [CmdletBinding()]
    param()

    try {
        $applications = @()

        # Get 64-bit applications from registry
        $registryPaths = @(
            "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
            "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
        )

        foreach ($path in $registryPaths) {
            try {
                $apps = Get-ItemProperty -Path $path -ErrorAction SilentlyContinue |
                    Where-Object { $_.DisplayName -and $_.DisplayName.Trim() -ne "" } |
                    Select-Object DisplayName, DisplayVersion, Publisher, InstallDate,
                                  EstimatedSize, InstallLocation, UninstallString,
                                  @{Name='Architecture'; Expression={ if ($path -like "*WOW6432Node*") { "x86" } else { "x64" } }}

                foreach ($app in $apps) {
                    $applications += [PSCustomObject]@{
                        ApplicationName = $app.DisplayName
                        Version = $app.DisplayVersion
                        Publisher = $app.Publisher
                        InstallDate = $app.InstallDate
                        EstimatedSizeMB = if ($app.EstimatedSize) { [math]::Round($app.EstimatedSize / 1024, 2) } else { $null }
                        InstallLocation = $app.InstallLocation
                        UninstallString = $app.UninstallString
                        Architecture = $app.Architecture
                        _DataType = 'InstalledApplication'
                    }
                }
            } catch {
                # Continue if one registry path fails
            }
        }

        # Get user-installed applications (current user)
        try {
            $userPath = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*"
            $userApps = Get-ItemProperty -Path $userPath -ErrorAction SilentlyContinue |
                Where-Object { $_.DisplayName -and $_.DisplayName.Trim() -ne "" } |
                Select-Object DisplayName, DisplayVersion, Publisher, InstallDate

            foreach ($app in $userApps) {
                $applications += [PSCustomObject]@{
                    ApplicationName = $app.DisplayName
                    Version = $app.DisplayVersion
                    Publisher = $app.Publisher
                    InstallDate = $app.InstallDate
                    EstimatedSizeMB = $null
                    InstallLocation = $null
                    UninstallString = $null
                    Architecture = "User"
                    _DataType = 'InstalledApplication'
                }
            }
        } catch {
            # Continue if user registry fails
        }

        # Remove duplicates (same name and version)
        $uniqueApps = $applications |
            Group-Object -Property ApplicationName, Version |
            ForEach-Object { $_.Group | Select-Object -First 1 }

        return $uniqueApps
    } catch {
        return @([PSCustomObject]@{
            Error = $_.Exception.Message
            _DataType = 'InstalledApplication'
        })
    }
}

function Get-StorageVolumes {
    [CmdletBinding()]
    param()

    try {
        $volumes = @()

        # Get logical disks
        $disks = Get-CimInstance -ClassName Win32_LogicalDisk

        foreach ($disk in $disks) {
            $driveType = switch ($disk.DriveType) {
                0 { "Unknown" }
                1 { "No Root Directory" }
                2 { "Removable Disk" }
                3 { "Local Disk" }
                4 { "Network Drive" }
                5 { "Compact Disc" }
                6 { "RAM Disk" }
                default { "Unknown" }
            }

            $volumes += [PSCustomObject]@{
                DriveLetter = $disk.DeviceID
                VolumeName = $disk.VolumeName
                DriveType = $driveType
                FileSystem = $disk.FileSystem
                TotalSizeGB = if ($disk.Size) { [math]::Round($disk.Size / 1GB, 2) } else { 0 }
                FreeSpaceGB = if ($disk.FreeSpace) { [math]::Round($disk.FreeSpace / 1GB, 2) } else { 0 }
                UsedSpaceGB = if ($disk.Size -and $disk.FreeSpace) { [math]::Round(($disk.Size - $disk.FreeSpace) / 1GB, 2) } else { 0 }
                PercentFree = if ($disk.Size -gt 0) { [math]::Round(($disk.FreeSpace / $disk.Size) * 100, 2) } else { 0 }
                Compressed = $disk.Compressed
                SupportsFileBasedCompression = $disk.SupportsFileBasedCompression
                _DataType = 'StorageVolume'
            }
        }

        # Get physical disk performance info
        try {
            $physicalDisks = Get-PhysicalDisk -ErrorAction SilentlyContinue
            foreach ($pDisk in $physicalDisks) {
                $volumes += [PSCustomObject]@{
                    DriveLetter = "PhysicalDisk$($pDisk.DeviceId)"
                    VolumeName = $pDisk.FriendlyName
                    DriveType = "Physical Disk"
                    FileSystem = $null
                    TotalSizeGB = [math]::Round($pDisk.Size / 1GB, 2)
                    FreeSpaceGB = $null
                    UsedSpaceGB = $null
                    PercentFree = $null
                    MediaType = $pDisk.MediaType
                    BusType = $pDisk.BusType
                    HealthStatus = $pDisk.HealthStatus
                    OperationalStatus = $pDisk.OperationalStatus
                    SpindleSpeed = $pDisk.SpindleSpeed
                    _DataType = 'StorageVolume'
                }
            }
        } catch {
            # Physical disk info not critical
        }

        return $volumes
    } catch {
        return @([PSCustomObject]@{
            Error = $_.Exception.Message
            _DataType = 'StorageVolume'
        })
    }
}

function Get-NetworkRoutes {
    [CmdletBinding()]
    param()

    try {
        $routes = @()

        # Get IPv4 routes
        $ipv4Routes = Get-NetRoute -AddressFamily IPv4 -ErrorAction SilentlyContinue

        foreach ($route in $ipv4Routes) {
            $routes += [PSCustomObject]@{
                DestinationPrefix = $route.DestinationPrefix
                NextHop = $route.NextHop
                InterfaceIndex = $route.InterfaceIndex
                InterfaceAlias = $route.InterfaceAlias
                RouteMetric = $route.RouteMetric
                Protocol = $route.Protocol
                AddressFamily = "IPv4"
                State = $route.State
                PreferredLifetime = $route.PreferredLifetime
                ValidLifetime = $route.ValidLifetime
                _DataType = 'NetworkRoute'
            }
        }

        # Get IPv6 routes (top 50 to avoid clutter)
        try {
            $ipv6Routes = Get-NetRoute -AddressFamily IPv6 -ErrorAction SilentlyContinue | Select-Object -First 50

            foreach ($route in $ipv6Routes) {
                $routes += [PSCustomObject]@{
                    DestinationPrefix = $route.DestinationPrefix
                    NextHop = $route.NextHop
                    InterfaceIndex = $route.InterfaceIndex
                    InterfaceAlias = $route.InterfaceAlias
                    RouteMetric = $route.RouteMetric
                    Protocol = $route.Protocol
                    AddressFamily = "IPv6"
                    State = $route.State
                    PreferredLifetime = $route.PreferredLifetime
                    ValidLifetime = $route.ValidLifetime
                    _DataType = 'NetworkRoute'
                }
            }
        } catch {
            # IPv6 not critical
        }

        return $routes
    } catch {
        return @([PSCustomObject]@{
            Error = $_.Exception.Message
            _DataType = 'NetworkRoute'
        })
    }
}

Export-ModuleMember -Function Invoke-EnvironmentDetectionDiscovery

