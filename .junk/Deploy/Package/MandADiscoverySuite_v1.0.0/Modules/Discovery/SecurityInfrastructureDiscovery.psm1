# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Security Infrastructure Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Comprehensive discovery of security infrastructure including antivirus/EDR solutions, firewalls, 
    backup systems, SIEM/monitoring platforms, VPN solutions, and security policies. Provides detailed 
    visibility into the organization's security posture and infrastructure for risk assessment and 
    compliance evaluation during M&A activities.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, WMI access, Registry access, Network access
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\UnifiedErrorHandling.psm1") -Force

function Invoke-SecurityInfrastructureDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)
        
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Antivirus and EDR Solutions
        try {
            Write-ModuleLog -ModuleName "SecurityInfrastructure" -Message "Discovering antivirus and EDR solutions..." -Level "INFO"
            
            # Method 1: WMI AntivirusProduct
            try {
                $antivirusProducts = Get-WmiObject -Namespace "root\SecurityCenter2" -Class "AntivirusProduct" -ErrorAction SilentlyContinue
                
                foreach ($av in $antivirusProducts) {
                    $avObj = [PSCustomObject]@{
                        # Identity
                        DisplayName = $av.displayName
                        InstanceGuid = $av.instanceGuid
                        ProductGuid = $av.productGuid
                        
                        # Status
                        ProductState = $av.productState
                        ProductStateText = switch ($av.productState) {
                            262144 { "Up to date" }
                            262160 { "Out of date" }
                            266240 { "Up to date" }
                            266256 { "Out of date" }
                            393216 { "Up to date" }
                            393232 { "Out of date" }
                            393488 { "Out of date" }
                            default { "Unknown ($($av.productState))" }
                        }
                        
                        # Configuration
                        PathToSignedProductExe = $av.pathToSignedProductExe
                        PathToSignedReportingExe = $av.pathToSignedReportingExe
                        
                        # Discovery
                        DiscoveryMethod = "WMI-SecurityCenter2"
                        ComputerName = $env:COMPUTERNAME
                        DiscoveryDate = Get-Date
                        
                        _DataType = "AntivirusProduct"
                    }
                    
                    $null = $allDiscoveredData.Add($avObj)
                }
                
                Write-ModuleLog -ModuleName "SecurityInfrastructure" -Message "Discovered $($antivirusProducts.Count) antivirus products" -Level "SUCCESS"
                
            } catch {
                Write-ModuleLog -ModuleName "SecurityInfrastructure" -Message "WMI antivirus discovery failed: $($_.Exception.Message)" -Level "DEBUG"
            }
            
            # Method 2: Registry-based discovery
            try {
                $avRegistryPaths = @(
                    "HKLM:\SOFTWARE\Microsoft\Windows Defender",
                    "HKLM:\SOFTWARE\Symantec\Symantec Endpoint Protection",
                    "HKLM:\SOFTWARE\McAfee",
                    "HKLM:\SOFTWARE\Trend Micro",
                    "HKLM:\SOFTWARE\CrowdStrike",
                    "HKLM:\SOFTWARE\SentinelOne",
                    "HKLM:\SOFTWARE\Bitdefender",
                    "HKLM:\SOFTWARE\Kaspersky Lab",
                    "HKLM:\SOFTWARE\ESET",
                    "HKLM:\SOFTWARE\Avast",
                    "HKLM:\SOFTWARE\AVG",
                    "HKLM:\SOFTWARE\Malwarebytes"
                )
                
                foreach ($regPath in $avRegistryPaths) {
                    if (Test-Path $regPath) {
                        $regData = Get-ItemProperty -Path $regPath -ErrorAction SilentlyContinue
                        if ($regData) {
                            $vendor = ($regPath -split '\\')[-1]
                            
                            $avRegObj = [PSCustomObject]@{
                                # Identity
                                Vendor = $vendor
                                ProductName = $regData.ProductName
                                Version = $regData.Version
                                
                                # Configuration
                                InstallLocation = $regData.InstallLocation
                                RegistryPath = $regPath
                                
                                # Discovery
                                DiscoveryMethod = "Registry"
                                ComputerName = $env:COMPUTERNAME
                                DiscoveryDate = Get-Date
                                
                                _DataType = "SecuritySoftware"
                            }
                            
                            $null = $allDiscoveredData.Add($avRegObj)
                        }
                    }
                }
                
            } catch {
                Write-ModuleLog -ModuleName "SecurityInfrastructure" -Message "Registry-based antivirus discovery failed: $($_.Exception.Message)" -Level "DEBUG"
            }
            
            # Method 3: Service-based discovery
            try {
                $securityServices = @(
                    "WinDefend", "wscsvc", "Sense", "MsMpSvc", # Windows Defender
                    "SepMasterService", "SmcService", "SNAC", # Symantec
                    "McAfeeFramework", "McShield", "McTaskManager", # McAfee
                    "CSFalconService", "CSAgent", # CrowdStrike
                    "SentinelAgent", "SentinelHelperService", # SentinelOne
                    "VSSERV", "BdDesktopParental", # Bitdefender
                    "AVP", "klnagent", # Kaspersky
                    "ekrn", "EHttpSrv", # ESET
                    "AvastSvc", "aswBIDSAgent", # Avast
                    "AVGSvc", "avgbIDSAgent" # AVG
                )
                
                foreach ($serviceName in $securityServices) {
                    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
                    if ($service) {
                        $serviceObj = [PSCustomObject]@{
                            # Identity
                            ServiceName = $service.Name
                            DisplayName = $service.DisplayName
                            
                            # Status
                            Status = $service.Status
                            StartType = $service.StartType
                            
                            # Configuration
                            ServiceType = $service.ServiceType
                            
                            # Discovery
                            DiscoveryMethod = "Service"
                            ComputerName = $env:COMPUTERNAME
                            DiscoveryDate = Get-Date
                            
                            _DataType = "SecurityService"
                        }
                        
                        $null = $allDiscoveredData.Add($serviceObj)
                    }
                }
                
            } catch {
                Write-ModuleLog -ModuleName "SecurityInfrastructure" -Message "Service-based security discovery failed: $($_.Exception.Message)" -Level "DEBUG"
            }
            
        } catch {
            $Result.AddError("Failed to discover antivirus/EDR solutions: $($_.Exception.Message)", $_.Exception, @{Section="AntivirusEDR"})
        }
        
        # Discover Firewall Solutions
        try {
            Write-ModuleLog -ModuleName "SecurityInfrastructure" -Message "Discovering firewall solutions..." -Level "INFO"
            
            # Method 1: Windows Firewall
            try {
                $firewallProfiles = @("Domain", "Private", "Public")
                
                foreach ($profile in $firewallProfiles) {
                    $fwProfile = Get-NetFirewallProfile -Name $profile -ErrorAction SilentlyContinue
                    if ($fwProfile) {
                        $fwObj = [PSCustomObject]@{
                            # Identity
                            ProfileName = $fwProfile.Name
                            
                            # Configuration
                            Enabled = $fwProfile.Enabled
                            DefaultInboundAction = $fwProfile.DefaultInboundAction
                            DefaultOutboundAction = $fwProfile.DefaultOutboundAction
                            
                            # Advanced
                            AllowInboundRules = $fwProfile.AllowInboundRules
                            AllowLocalFirewallRules = $fwProfile.AllowLocalFirewallRules
                            AllowLocalIPsecRules = $fwProfile.AllowLocalIPsecRules
                            AllowUserApps = $fwProfile.AllowUserApps
                            AllowUserPorts = $fwProfile.AllowUserPorts
                            AllowUnicastResponseToMulticast = $fwProfile.AllowUnicastResponseToMulticast
                            NotifyOnListen = $fwProfile.NotifyOnListen
                            
                            # Logging
                            LogFileName = $fwProfile.LogFileName
                            LogMaxSizeKilobytes = $fwProfile.LogMaxSizeKilobytes
                            LogAllowed = $fwProfile.LogAllowed
                            LogBlocked = $fwProfile.LogBlocked
                            LogIgnored = $fwProfile.LogIgnored
                            
                            # Discovery
                            DiscoveryMethod = "NetFirewallProfile"
                            ComputerName = $env:COMPUTERNAME
                            DiscoveryDate = Get-Date
                            
                            _DataType = "FirewallProfile"
                        }
                        
                        $null = $allDiscoveredData.Add($fwObj)
                    }
                }
                
            } catch {
                Write-ModuleLog -ModuleName "SecurityInfrastructure" -Message "Windows Firewall discovery failed: $($_.Exception.Message)" -Level "DEBUG"
            }
            
            # Method 2: Network discovery for security appliances
            try {
                # Look for common firewall/security appliance web interfaces
                $securityAppliances = @()
                
                # Get current network for scanning
                $ipConfig = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.AddressState -eq "Preferred" -and $_.IPAddress -notmatch "127.0.0.1" }
                
                foreach ($ip in $ipConfig) {
                    $subnet = $ip.IPAddress -replace '\.\d+$', ''
                    
                    # Common security appliance IPs (gateway +1, +2, etc.)
                    $commonIPs = @("$subnet.1", "$subnet.2", "$subnet.10", "$subnet.254")
                    
                    foreach ($testIP in $commonIPs) {
                        try {
                            $connection = Test-NetConnection -ComputerName $testIP -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue
                            if ($connection) {
                                # Try to identify security appliance
                                try {
                                    $webRequest = Invoke-WebRequest -Uri "https://$testIP" -TimeoutSec 3 -UseBasicParsing -ErrorAction SilentlyContinue
                                    $content = $webRequest.Content.ToLower()
                                    
                                    $applianceType = "Unknown"
                                    $vendor = "Unknown"
                                    
                                    if ($content -match "pfsense|pf sense") { $applianceType = "pfSense"; $vendor = "Netgate" }
                                    elseif ($content -match "sophos") { $applianceType = "Sophos Firewall"; $vendor = "Sophos" }
                                    elseif ($content -match "fortigate|fortinet") { $applianceType = "FortiGate"; $vendor = "Fortinet" }
                                    elseif ($content -match "palo alto|panorama") { $applianceType = "Palo Alto"; $vendor = "Palo Alto Networks" }
                                    elseif ($content -match "sonicwall") { $applianceType = "SonicWall"; $vendor = "SonicWall" }
                                    elseif ($content -match "checkpoint") { $applianceType = "Check Point"; $vendor = "Check Point" }
                                    elseif ($content -match "cisco|asa") { $applianceType = "Cisco ASA"; $vendor = "Cisco" }
                                    elseif ($content -match "meraki") { $applianceType = "Cisco Meraki"; $vendor = "Cisco" }
                                    elseif ($content -match "juniper") { $applianceType = "Juniper SRX"; $vendor = "Juniper" }
                                    elseif ($content -match "watchguard") { $applianceType = "WatchGuard"; $vendor = "WatchGuard" }
                                    
                                    if ($applianceType -ne "Unknown") {
                                        $applianceObj = [PSCustomObject]@{
                                            # Identity
                                            IPAddress = $testIP
                                            Vendor = $vendor
                                            ApplianceType = $applianceType
                                            
                                            # Configuration
                                            Port = 443
                                            Protocol = "HTTPS"
                                            
                                            # Discovery
                                            DiscoveryMethod = "NetworkScan"
                                            ResponseTime = "Available"
                                            DiscoveryDate = Get-Date
                                            
                                            _DataType = "SecurityAppliance"
                                        }
                                        
                                        $null = $allDiscoveredData.Add($applianceObj)
                                    }
                                } catch {
                                    # Continue scanning
                                }
                            }
                        } catch {
                            # Continue scanning
                        }
                    }
                }
                
            } catch {
                Write-ModuleLog -ModuleName "SecurityInfrastructure" -Message "Network security appliance discovery failed: $($_.Exception.Message)" -Level "DEBUG"
            }
            
        } catch {
            $Result.AddError("Failed to discover firewall solutions: $($_.Exception.Message)", $_.Exception, @{Section="Firewalls"})
        }
        
        # Discover Backup and Recovery Solutions
        try {
            Write-ModuleLog -ModuleName "SecurityInfrastructure" -Message "Discovering backup and recovery solutions..." -Level "INFO"
            
            # Method 1: Common backup service discovery
            $backupServices = @(
                "VeeamBackupSvc", "VeeamRESTSvc", "VeeamDeploymentService", # Veeam
                "AcronisAgent", "AcrSch2Svc", "AcronisCyberProtectService", # Acronis
                "CommVault", "CVMountd", "Simpana", # CommVault
                "NetBackup", "bprd", "bpdbm", # Veritas NetBackup
                "BackupExecAgentAccelerator", "BackupExecJobEngine", # Veritas Backup Exec
                "TSMClientService", "TSMServer", # IBM Spectrum Protect
                "BackupExecAgentBrowser", "BackupExecDeviceMediaService", # Backup Exec
                "BackupExecRPCService", "BackupExecServerService", # Backup Exec
                "ArcserveUDPAgent", "ArcserveUDPEngine", # Arcserve
                "CarboniteService", "CarboniteProxy", # Carbonite
                "DPMRADisk", "DPMWriter", "DPMAC", # Microsoft DPM
                "BackupAssist", "BackupAssistMailbox", # BackupAssist
                "MSExchangeRepl", "MSExchangeTransport" # Exchange native backup
            )
            
            foreach ($serviceName in $backupServices) {
                $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
                if ($service) {
                    $backupObj = [PSCustomObject]@{
                        # Identity
                        ServiceName = $service.Name
                        DisplayName = $service.DisplayName
                        
                        # Status
                        Status = $service.Status
                        StartType = $service.StartType
                        
                        # Configuration
                        ServiceType = $service.ServiceType
                        
                        # Discovery
                        DiscoveryMethod = "Service"
                        ComputerName = $env:COMPUTERNAME
                        DiscoveryDate = Get-Date
                        
                        _DataType = "BackupService"
                    }
                    
                    $null = $allDiscoveredData.Add($backupObj)
                }
            }
            
            # Method 2: Registry-based backup discovery
            try {
                $backupRegistryPaths = @(
                    "HKLM:\SOFTWARE\Veeam\Veeam Backup and Replication",
                    "HKLM:\SOFTWARE\Acronis",
                    "HKLM:\SOFTWARE\CommVault Systems",
                    "HKLM:\SOFTWARE\Veritas\NetBackup",
                    "HKLM:\SOFTWARE\Veritas\Backup Exec",
                    "HKLM:\SOFTWARE\Microsoft\Microsoft Data Protection Manager",
                    "HKLM:\SOFTWARE\Arcserve"
                )
                
                foreach ($regPath in $backupRegistryPaths) {
                    if (Test-Path $regPath) {
                        $regData = Get-ItemProperty -Path $regPath -ErrorAction SilentlyContinue
                        if ($regData) {
                            $vendor = ($regPath -split '\\')[-1]
                            
                            $backupRegObj = [PSCustomObject]@{
                                # Identity
                                Vendor = $vendor
                                ProductName = $regData.ProductName
                                Version = $regData.Version
                                
                                # Configuration
                                InstallLocation = $regData.InstallLocation
                                RegistryPath = $regPath
                                
                                # Discovery
                                DiscoveryMethod = "Registry"
                                ComputerName = $env:COMPUTERNAME
                                DiscoveryDate = Get-Date
                                
                                _DataType = "BackupSoftware"
                            }
                            
                            $null = $allDiscoveredData.Add($backupRegObj)
                        }
                    }
                }
                
            } catch {
                Write-ModuleLog -ModuleName "SecurityInfrastructure" -Message "Registry-based backup discovery failed: $($_.Exception.Message)" -Level "DEBUG"
            }
            
        } catch {
            $Result.AddError("Failed to discover backup solutions: $($_.Exception.Message)", $_.Exception, @{Section="BackupRecovery"})
        }
        
        # Discover Monitoring and SIEM Solutions
        try {
            Write-ModuleLog -ModuleName "SecurityInfrastructure" -Message "Discovering monitoring and SIEM solutions..." -Level "INFO"
            
            # Method 1: SIEM and monitoring services
            $monitoringServices = @(
                "splunkd", "SplunkForwarder", # Splunk
                "elasticsearch", "kibana", "logstash", # Elastic Stack
                "QRadar", "QRadarWinCollect", # IBM QRadar
                "ArcSight", "ArcSightSmartConnector", # Micro Focus ArcSight
                "LogRhythmSystemMonitor", "LogRhythmMediatorServer", # LogRhythm
                "AlienVault", "OSSIM", # AlienVault/AT&T Cybersecurity
                "RSANetWitness", "RSASecurityAnalytics", # RSA NetWitness
                "SumoLogic", "SumoLogicCollector", # Sumo Logic
                "DatadogAgent", "DatadogTraceAgent", # Datadog
                "NewRelicInfraAgent", "NewRelicSvcHost", # New Relic
                "PRTG", "PRTGCoreService", # PRTG
                "SolarWinds", "SolarWindsAgent", # SolarWinds
                "SCOM", "HealthService", "AdtAgent", # Microsoft SCOM
                "NagiosService", "NRPE", # Nagios
                "ZabbixAgent", "ZabbixServer", # Zabbix
                "telegraf", "influxdb", "grafana" # TIG Stack
            )
            
            foreach ($serviceName in $monitoringServices) {
                $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
                if ($service) {
                    $monitoringObj = [PSCustomObject]@{
                        # Identity
                        ServiceName = $service.Name
                        DisplayName = $service.DisplayName
                        
                        # Status
                        Status = $service.Status
                        StartType = $service.StartType
                        
                        # Configuration
                        ServiceType = $service.ServiceType
                        
                        # Discovery
                        DiscoveryMethod = "Service"
                        ComputerName = $env:COMPUTERNAME
                        DiscoveryDate = Get-Date
                        
                        _DataType = "MonitoringService"
                    }
                    
                    $null = $allDiscoveredData.Add($monitoringObj)
                }
            }
            
        } catch {
            $Result.AddError("Failed to discover monitoring/SIEM solutions: $($_.Exception.Message)", $_.Exception, @{Section="MonitoringSIEM"})
        }
        
        # Discover VPN and Remote Access Solutions
        try {
            Write-ModuleLog -ModuleName "SecurityInfrastructure" -Message "Discovering VPN and remote access solutions..." -Level "INFO"
            
            # Method 1: VPN services
            $vpnServices = @(
                "RasMan", "RemoteAccess", "PolicyAgent", # Windows VPN
                "OpenVPNService", "OpenVPN", # OpenVPN
                "CiscoVPN", "CiscoAnyConnect", # Cisco
                "PulseSecure", "PulseSecureService", # Pulse Secure
                "FortiClient", "FortiSSLVPN", # Fortinet
                "SonicWallNetExtender", "SonicWallMobileConnect", # SonicWall
                "CheckPointVPN", "CheckPointEndpointSecurity", # Check Point
                "PaloAltoGlobalProtect", "PanGPA", # Palo Alto
                "RemoteDesktopServices", "TermService", # RDS
                "TeamViewer", "TeamViewerService", # TeamViewer
                "AnyDesk", "AnyDeskService", # AnyDesk
                "LogMeIn", "LogMeInService", # LogMeIn
                "RDPWrap", "RDPWrapService" # RDP Wrapper
            )
            
            foreach ($serviceName in $vpnServices) {
                $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
                if ($service) {
                    $vpnObj = [PSCustomObject]@{
                        # Identity
                        ServiceName = $service.Name
                        DisplayName = $service.DisplayName
                        
                        # Status
                        Status = $service.Status
                        StartType = $service.StartType
                        
                        # Configuration
                        ServiceType = $service.ServiceType
                        
                        # Discovery
                        DiscoveryMethod = "Service"
                        ComputerName = $env:COMPUTERNAME
                        DiscoveryDate = Get-Date
                        
                        _DataType = "VPNService"
                    }
                    
                    $null = $allDiscoveredData.Add($vpnObj)
                }
            }
            
        } catch {
            $Result.AddError("Failed to discover VPN/remote access solutions: $($_.Exception.Message)", $_.Exception, @{Section="VPNRemoteAccess"})
        }
        
        # Export discovered data
        if ($allDiscoveredData.Count -gt 0) {
            Write-ModuleLog -ModuleName "SecurityInfrastructure" -Message "Exporting $($allDiscoveredData.Count) security infrastructure records..." -Level "INFO"
            
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $fileName = switch ($group.Name) {
                    'AntivirusProduct' { 'Security_AntivirusProducts.csv' }
                    'SecuritySoftware' { 'Security_SecuritySoftware.csv' }
                    'SecurityService' { 'Security_SecurityServices.csv' }
                    'FirewallProfile' { 'Security_FirewallProfiles.csv' }
                    'SecurityAppliance' { 'Security_SecurityAppliances.csv' }
                    'BackupService' { 'Security_BackupServices.csv' }
                    'BackupSoftware' { 'Security_BackupSoftware.csv' }
                    'MonitoringService' { 'Security_MonitoringServices.csv' }
                    'VPNService' { 'Security_VPNServices.csv' }
                    default { "Security_$($group.Name).csv" }
                }
                
                Export-DiscoveryResults -Data $group.Group `
                    -FileName $fileName `
                    -OutputPath $Context.Paths.RawDataOutput `
                    -ModuleName "SecurityInfrastructure" `
                    -SessionId $SessionId
            }
            
            # Create summary report
            $summaryData = @{
                AntivirusProducts = ($allDiscoveredData | Where-Object { $_._DataType -eq 'AntivirusProduct' }).Count
                SecuritySoftware = ($allDiscoveredData | Where-Object { $_._DataType -eq 'SecuritySoftware' }).Count
                SecurityServices = ($allDiscoveredData | Where-Object { $_._DataType -eq 'SecurityService' }).Count
                FirewallProfiles = ($allDiscoveredData | Where-Object { $_._DataType -eq 'FirewallProfile' }).Count
                SecurityAppliances = ($allDiscoveredData | Where-Object { $_._DataType -eq 'SecurityAppliance' }).Count
                BackupServices = ($allDiscoveredData | Where-Object { $_._DataType -eq 'BackupService' }).Count
                BackupSoftware = ($allDiscoveredData | Where-Object { $_._DataType -eq 'BackupSoftware' }).Count
                MonitoringServices = ($allDiscoveredData | Where-Object { $_._DataType -eq 'MonitoringService' }).Count
                VPNServices = ($allDiscoveredData | Where-Object { $_._DataType -eq 'VPNService' }).Count
                TotalRecords = $allDiscoveredData.Count
                DiscoveryDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                SessionId = $SessionId
            }
            
            $summaryData | ConvertTo-Json -Depth 3 | Out-File (Join-Path $Context.Paths.RawDataOutput "SecurityInfrastructureDiscoverySummary.json") -Encoding UTF8
        }
        
        return $allDiscoveredData
    }
    
    # Execute using base module
    return Start-DiscoveryModule -ModuleName "SecurityInfrastructure" `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @() `
        -DiscoveryScript $discoveryScript
}

Export-ModuleMember -Function Invoke-SecurityInfrastructureDiscovery