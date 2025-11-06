#Requires -Version 5.1
using namespace System.Collections.Generic

Set-StrictMode -Version 3.0

class PanoramaInterrogation {
    [string]$DiscoveryType = 'PanoramaInterrogation'
    [string]$DataFileName = 'Panorama_ConfigExport.json'
    
    hidden [string]$PanoramaHost
    hidden [string]$ApiKey
    hidden [pscredential]$Credential
    hidden [string]$AuthMethod
    hidden [hashtable]$ExportedData
    
    PanoramaInterrogation() {
        $this.ExportedData = @{
            Devices = @()
            DeviceGroups = @()
            Templates = @()
            Policies = @{
                Security = @()
                NAT = @()
                QoS = @()
                PolicyBasedForwarding = @()
                Decryption = @()
                Application = @()
                Authentication = @()
                DoS = @()
            }
            Objects = @{
                Addresses = @()
                AddressGroups = @()
                Services = @()
                ServiceGroups = @()
                Applications = @()
                ApplicationGroups = @()
                Users = @()
                UserGroups = @()
                Zones = @()
                Tags = @()
                Profiles = @{
                    AntiVirus = @()
                    AntiSpyware = @()
                    Vulnerability = @()
                    URLFiltering = @()
                    FileBlocking = @()
                    WildFireAnalysis = @()
                    DataFiltering = @()
                }
            }
            Network = @{
                Interfaces = @()
                VirtualRouters = @()
                VirtualWires = @()
                VLANs = @()
                Tunnels = @()
            }
            GlobalProtect = @{
                Portals = @()
                Gateways = @()
                HIPObjects = @()
                HIPProfiles = @()
            }
            Certificates = @()
            Schedules = @()
            LogForwardingProfiles = @()
        }
    }
    
    [void] SetParameters([hashtable]$params) {
        $this.ModuleConfig = $params
        
        if ($params.ContainsKey('PanoramaHost')) {
            $this.PanoramaHost = $params.PanoramaHost
        }
        
        if ($params.ContainsKey('ApiKey')) {
            $this.ApiKey = $params.ApiKey
            $this.AuthMethod = 'APIKey'
        }
        elseif ($params.ContainsKey('Credential')) {
            $this.Credential = $params.Credential
            $this.AuthMethod = 'Credential'
        }
    }
    
    [psobject] ExecuteDiscovery() {
        $this.LogMessage("Starting Panorama interrogation", 'INFO')
        
        try {
            $this.UpdateProgress("Authenticating with Panorama", 5)
            if ($this.AuthMethod -eq 'Credential' -and -not $this.ApiKey) {
                $this.GenerateApiKey()
            }
            
            $this.UpdateProgress("Exporting managed devices", 10)
            $this.ExportManagedDevices()
            
            $this.UpdateProgress("Exporting device groups", 20)
            $this.ExportDeviceGroups()
            
            $this.UpdateProgress("Exporting templates", 30)
            $this.ExportTemplates()
            
            $this.UpdateProgress("Exporting security policies", 40)
            $this.ExportSecurityPolicies()
            
            $this.UpdateProgress("Exporting NAT policies", 45)
            $this.ExportNATPolicies()
            
            $this.UpdateProgress("Exporting address objects", 50)
            $this.ExportAddressObjects()
            
            $this.UpdateProgress("Exporting service objects", 60)
            $this.ExportServiceObjects()
            
            $this.UpdateProgress("Exporting application objects", 65)
            $this.ExportApplicationObjects()
            
            $this.UpdateProgress("Exporting security profiles", 70)
            $this.ExportSecurityProfiles()
            
            $this.UpdateProgress("Exporting network configuration", 80)
            $this.ExportNetworkConfiguration()
            
            $this.UpdateProgress("Exporting GlobalProtect configuration", 85)
            $this.ExportGlobalProtectConfiguration()
            
            $this.UpdateProgress("Exporting certificates", 90)
            $this.ExportCertificates()
            
            $this.UpdateProgress("Exporting schedules", 95)
            $this.ExportSchedules()
            
            $this.UpdateProgress("Export complete", 100)
            
            $summary = [PSCustomObject]@{
                PanoramaHost = $this.PanoramaHost
                ExportTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                DeviceCount = $this.ExportedData.Devices.Count
                DeviceGroupCount = $this.ExportedData.DeviceGroups.Count
                TemplateCount = $this.ExportedData.Templates.Count
                SecurityPolicyCount = $this.ExportedData.Policies.Security.Count
                AddressObjectCount = $this.ExportedData.Objects.Addresses.Count
                ServiceObjectCount = $this.ExportedData.Objects.Services.Count
                ExportedData = $this.ExportedData
            }
            
            $this.LogMessage("Panorama export completed successfully", 'INFO')
            return $summary
        }
        catch {
            $this.LogMessage("Panorama interrogation failed: $_", 'ERROR')
            throw
        }
    }
    
    hidden [void] GenerateApiKey() {
        $this.LogMessage("Generating API key from credentials", 'INFO')
        
        $uri = "https://$($this.PanoramaHost)/api/?type=keygen&user=$($this.Credential.UserName)&password=$($this.Credential.GetNetworkCredential().Password)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
            
            if ($response.response.status -eq 'success') {
                $this.ApiKey = $response.response.result.key
                $this.LogMessage("API key generated successfully", 'INFO')
            }
            else {
                throw "Failed to generate API key: $($response.response.msg)"
            }
        }
        catch {
            $this.LogMessage("Failed to generate API key: $_", 'ERROR')
            throw
        }
    }
    
    hidden [void] ExportManagedDevices() {
        $this.LogMessage("Exporting managed devices", 'INFO')
        
        $uri = "https://$($this.PanoramaHost)/api/?type=op&cmd=<show><devices><all></all></devices></show>&key=$($this.ApiKey)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
            
            if ($response.response.status -eq 'success') {
                $devices = $response.response.result.devices.entry
                
                foreach ($device in $devices) {
                    $deviceInfo = @{
                        Name = $device.name
                        Serial = $device.serial
                        Model = $device.model
                        SoftwareVersion = $device.'sw-version'
                        IPAddress = $device.'ip-address'
                        Hostname = $device.hostname
                        State = $device.connected
                        HAState = $device.'ha-state'
                        VirtualSystems = $device.vsys
                        DeviceGroup = $device.'device-group'
                        Template = $device.template
                        LastCommit = $device.'last-commit-timestamp'
                    }
                    
                    $this.ExportedData.Devices += $deviceInfo
                }
                
                $this.LogMessage("Exported $($this.ExportedData.Devices.Count) devices", 'INFO')
            }
        }
        catch {
            $this.LogMessage("Failed to export devices: $_", 'ERROR')
        }
    }
    
    hidden [void] ExportDeviceGroups() {
        $this.LogMessage("Exporting device groups", 'INFO')
        
        $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=/config/devices/entry[@name='localhost.localdomain']/device-group&key=$($this.ApiKey)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
            
            if ($response.response.status -eq 'success' -and $response.response.result.'device-group') {
                $deviceGroups = $response.response.result.'device-group'.entry
                
                foreach ($dg in $deviceGroups) {
                    $dgInfo = @{
                        Name = $dg.name
                        Description = $dg.description
                        Devices = @()
                        ParentDeviceGroup = $dg.'parent-dg'
                    }
                    
                    if ($dg.devices) {
                        $dgInfo.Devices = $dg.devices.entry.name
                    }
                    
                    $this.ExportedData.DeviceGroups += $dgInfo
                }
                
                $this.LogMessage("Exported $($this.ExportedData.DeviceGroups.Count) device groups", 'INFO')
            }
        }
        catch {
            $this.LogMessage("Failed to export device groups: $_", 'ERROR')
        }
    }
    
    hidden [void] ExportTemplates() {
        $this.LogMessage("Exporting templates", 'INFO')
        
        $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=/config/devices/entry[@name='localhost.localdomain']/template&key=$($this.ApiKey)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
            
            if ($response.response.status -eq 'success' -and $response.response.result.template) {
                $templates = $response.response.result.template.entry
                
                foreach ($template in $templates) {
                    $templateInfo = @{
                        Name = $template.name
                        Description = $template.description
                        Devices = @()
                    }
                    
                    if ($template.devices) {
                        $templateInfo.Devices = $template.devices.entry.name
                    }
                    
                    $this.ExportedData.Templates += $templateInfo
                }
                
                $this.LogMessage("Exported $($this.ExportedData.Templates.Count) templates", 'INFO')
            }
        }
        catch {
            $this.LogMessage("Failed to export templates: $_", 'ERROR')
        }
    }
    
    hidden [void] ExportSecurityPolicies() {
        $this.LogMessage("Exporting security policies", 'INFO')
        
        foreach ($dg in $this.ExportedData.DeviceGroups) {
            $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=/config/devices/entry[@name='localhost.localdomain']/device-group/entry[@name='$($dg.Name)']/pre-rulebase/security/rules&key=$($this.ApiKey)"
            
            try {
                $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
                
                if ($response.response.status -eq 'success' -and $response.response.result.rules) {
                    $rules = $response.response.result.rules.entry
                    
                    foreach ($rule in $rules) {
                        $ruleInfo = @{
                            Name = $rule.name
                            DeviceGroup = $dg.Name
                            Type = 'Pre-Rule'
                            Description = $rule.description
                            SourceZones = $rule.from.member
                            DestinationZones = $rule.to.member
                            SourceAddresses = $rule.source.member
                            DestinationAddresses = $rule.destination.member
                            Applications = $rule.application.member
                            Services = $rule.service.member
                            Action = $rule.action
                            LogSetting = $rule.'log-setting'
                            ProfileSetting = $rule.'profile-setting'
                            Disabled = $rule.disabled
                            Tags = $rule.tag.member
                        }
                        
                        $this.ExportedData.Policies.Security += $ruleInfo
                    }
                }
            }
            catch {
                $this.LogMessage("Failed to export security policies for device group $($dg.Name): $_", 'WARNING')
            }
        }
        
        $this.LogMessage("Exported $($this.ExportedData.Policies.Security.Count) security policies", 'INFO')
    }
    
    hidden [void] ExportNATPolicies() {
        $this.LogMessage("Exporting NAT policies", 'INFO')
        
        foreach ($dg in $this.ExportedData.DeviceGroups) {
            $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=/config/devices/entry[@name='localhost.localdomain']/device-group/entry[@name='$($dg.Name)']/pre-rulebase/nat/rules&key=$($this.ApiKey)"
            
            try {
                $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
                
                if ($response.response.status -eq 'success' -and $response.response.result.rules) {
                    $rules = $response.response.result.rules.entry
                    
                    foreach ($rule in $rules) {
                        $ruleInfo = @{
                            Name = $rule.name
                            DeviceGroup = $dg.Name
                            Type = 'Pre-Rule'
                            Description = $rule.description
                            SourceZones = $rule.from.member
                            DestinationZones = $rule.to.member
                            SourceAddresses = $rule.source.member
                            DestinationAddresses = $rule.destination.member
                            Service = $rule.service
                            SourceTranslation = $rule.'source-translation'
                            DestinationTranslation = $rule.'destination-translation'
                            Disabled = $rule.disabled
                            Tags = $rule.tag.member
                        }
                        
                        $this.ExportedData.Policies.NAT += $ruleInfo
                    }
                }
            }
            catch {
                $this.LogMessage("Failed to export NAT policies for device group $($dg.Name): $_", 'WARNING')
            }
        }
        
        $this.LogMessage("Exported $($this.ExportedData.Policies.NAT.Count) NAT policies", 'INFO')
    }
    
    hidden [void] ExportAddressObjects() {
        $this.LogMessage("Exporting address objects", 'INFO')
        
        $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=/config/shared/address&key=$($this.ApiKey)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
            
            if ($response.response.status -eq 'success' -and $response.response.result.address) {
                $addresses = $response.response.result.address.entry
                
                foreach ($addr in $addresses) {
                    $addrInfo = @{
                        Name = $addr.name
                        Type = if ($addr.'ip-netmask') { 'IP-Netmask' } 
                               elseif ($addr.'ip-range') { 'IP-Range' }
                               elseif ($addr.fqdn) { 'FQDN' }
                               else { 'Unknown' }
                        Value = if ($addr.'ip-netmask') { $addr.'ip-netmask' } elseif ($addr.'ip-range') { $addr.'ip-range' } elseif ($addr.fqdn) { $addr.fqdn } else { 'N/A' }
                        Description = $addr.description
                        Tags = $addr.tag.member
                    }
                    
                    $this.ExportedData.Objects.Addresses += $addrInfo
                }
                
                $this.LogMessage("Exported $($this.ExportedData.Objects.Addresses.Count) address objects", 'INFO')
            }
        }
        catch {
            $this.LogMessage("Failed to export address objects: $_", 'ERROR')
        }
        
        $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=/config/shared/address-group&key=$($this.ApiKey)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
            
            if ($response.response.status -eq 'success' -and $response.response.result.'address-group') {
                $groups = $response.response.result.'address-group'.entry
                
                foreach ($group in $groups) {
                    $groupInfo = @{
                        Name = $group.name
                        Type = if ($group.static) { 'Static' } else { 'Dynamic' }
                        Members = if ($group.static.member) { $group.static.member } else { @() }
                        Description = $group.description
                        Tags = $group.tag.member
                    }
                    
                    $this.ExportedData.Objects.AddressGroups += $groupInfo
                }
                
                $this.LogMessage("Exported $($this.ExportedData.Objects.AddressGroups.Count) address groups", 'INFO')
            }
        }
        catch {
            $this.LogMessage("Failed to export address groups: $_", 'ERROR')
        }
    }
    
    hidden [void] ExportServiceObjects() {
        $this.LogMessage("Exporting service objects", 'INFO')
        
        $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=/config/shared/service&key=$($this.ApiKey)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
            
            if ($response.response.status -eq 'success' -and $response.response.result.service) {
                $services = $response.response.result.service.entry
                
                foreach ($svc in $services) {
                    $svcInfo = @{
                        Name = $svc.name
                        Protocol = if ($svc.protocol.tcp) { 'TCP' }
                                  elseif ($svc.protocol.udp) { 'UDP' }
                                  else { 'Other' }
                        Port = if ($svc.protocol.tcp.port) { $svc.protocol.tcp.port } elseif ($svc.protocol.udp.port) { $svc.protocol.udp.port } else { 'N/A' }
                        Description = $svc.description
                        Tags = $svc.tag.member
                    }
                    
                    $this.ExportedData.Objects.Services += $svcInfo
                }
                
                $this.LogMessage("Exported $($this.ExportedData.Objects.Services.Count) service objects", 'INFO')
            }
        }
        catch {
            $this.LogMessage("Failed to export service objects: $_", 'ERROR')
        }
        
        $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=/config/shared/service-group&key=$($this.ApiKey)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
            
            if ($response.response.status -eq 'success' -and $response.response.result.'service-group') {
                $groups = $response.response.result.'service-group'.entry
                
                foreach ($group in $groups) {
                    $groupInfo = @{
                        Name = $group.name
                        Members = $group.members.member
                        Description = $group.description
                        Tags = $group.tag.member
                    }
                    
                    $this.ExportedData.Objects.ServiceGroups += $groupInfo
                }
                
                $this.LogMessage("Exported $($this.ExportedData.Objects.ServiceGroups.Count) service groups", 'INFO')
            }
        }
        catch {
            $this.LogMessage("Failed to export service groups: $_", 'ERROR')
        }
    }
    
    hidden [void] ExportApplicationObjects() {
        $this.LogMessage("Exporting application objects", 'INFO')
        
        $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=/config/shared/application&key=$($this.ApiKey)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
            
            if ($response.response.status -eq 'success' -and $response.response.result.application) {
                $apps = $response.response.result.application.entry
                
                foreach ($app in $apps) {
                    $appInfo = @{
                        Name = $app.name
                        Category = $app.category
                        Subcategory = $app.subcategory
                        Technology = $app.technology
                        Risk = $app.risk
                        Description = $app.description
                    }
                    
                    $this.ExportedData.Objects.Applications += $appInfo
                }
                
                $this.LogMessage("Exported $($this.ExportedData.Objects.Applications.Count) application objects", 'INFO')
            }
        }
        catch {
            $this.LogMessage("Failed to export application objects: $_", 'ERROR')
        }
    }
    
    hidden [void] ExportSecurityProfiles() {
        $this.LogMessage("Exporting security profiles", 'INFO')
        
        $profileTypes = @{
            'AntiVirus' = 'virus'
            'AntiSpyware' = 'spyware'
            'Vulnerability' = 'vulnerability'
            'URLFiltering' = 'url-filtering'
            'FileBlocking' = 'file-blocking'
            'WildFireAnalysis' = 'wildfire-analysis'
            'DataFiltering' = 'data-filtering'
        }
        
        foreach ($profileType in $profileTypes.GetEnumerator()) {
            $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=/config/shared/profiles/$($profileType.Value)&key=$($this.ApiKey)"
            
            try {
                $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
                
                if ($response.response.status -eq 'success') {
                    $profiles = $response.response.result.($profileType.Value).entry
                    
                    foreach ($profile in $profiles) {
                        $profileInfo = @{
                            Name = $profile.name
                            Type = $profileType.Key
                            Description = $profile.description
                            Configuration = $profile
                        }
                        
                        $this.ExportedData.Objects.Profiles.($profileType.Key) += $profileInfo
                    }
                    
                    $this.LogMessage("Exported $($this.ExportedData.Objects.Profiles.($profileType.Key).Count) $($profileType.Key) profiles", 'INFO')
                }
            }
            catch {
                $this.LogMessage("Failed to export $($profileType.Key) profiles: $_", 'WARNING')
            }
        }
    }
    
    hidden [void] ExportNetworkConfiguration() {
        $this.LogMessage("Exporting network configuration", 'INFO')
        
        foreach ($template in $this.ExportedData.Templates) {
            $basePath = "/config/devices/entry[@name='localhost.localdomain']/template/entry[@name='$($template.Name)']/config/devices/entry[@name='localhost.localdomain']"
            
            $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=$basePath/network/interface&key=$($this.ApiKey)"
            
            try {
                $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
                
                if ($response.response.status -eq 'success' -and $response.response.result.interface) {
                    $interfaces = $response.response.result.interface
                    
                    $interfaceInfo = @{
                        Template = $template.Name
                        Ethernet = $interfaces.ethernet.entry
                        Aggregate = $interfaces.'aggregate-ethernet'.entry
                        Loopback = $interfaces.loopback.entry
                        Tunnel = $interfaces.tunnel.entry
                        VLAN = $interfaces.vlan.entry
                    }
                    
                    $this.ExportedData.Network.Interfaces += $interfaceInfo
                }
            }
            catch {
                $this.LogMessage("Failed to export interfaces for template $($template.Name): $_", 'WARNING')
            }
            
            $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=$basePath/network/virtual-router&key=$($this.ApiKey)"
            
            try {
                $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
                
                if ($response.response.status -eq 'success' -and $response.response.result.'virtual-router') {
                    $vRouters = $response.response.result.'virtual-router'.entry
                    
                    foreach ($vr in $vRouters) {
                        $vrInfo = @{
                            Name = $vr.name
                            Template = $template.Name
                            Interfaces = $vr.interface.member
                            StaticRoutes = $vr.'routing-table'.ip.'static-route'.entry
                            BGP = $vr.protocol.bgp
                            OSPF = $vr.protocol.ospf
                        }
                        
                        $this.ExportedData.Network.VirtualRouters += $vrInfo
                    }
                }
            }
            catch {
                $this.LogMessage("Failed to export virtual routers for template $($template.Name): $_", 'WARNING')
            }
        }
        
        $this.LogMessage("Exported network configuration", 'INFO')
    }
    
    hidden [void] ExportGlobalProtectConfiguration() {
        $this.LogMessage("Exporting GlobalProtect configuration", 'INFO')
        
        $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=/config/shared/global-protect/global-protect-portal&key=$($this.ApiKey)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
            
            if ($response.response.status -eq 'success' -and $response.response.result.'global-protect-portal') {
                $portals = $response.response.result.'global-protect-portal'.entry
                
                foreach ($portal in $portals) {
                    $portalInfo = @{
                        Name = $portal.name
                        Description = $portal.description
                        ClientConfig = $portal.'client-config'
                        Authentication = $portal.'portal-config'.authentication
                    }
                    
                    $this.ExportedData.GlobalProtect.Portals += $portalInfo
                }
                
                $this.LogMessage("Exported $($this.ExportedData.GlobalProtect.Portals.Count) GlobalProtect portals", 'INFO')
            }
        }
        catch {
            $this.LogMessage("Failed to export GlobalProtect portals: $_", 'WARNING')
        }
        
        $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=/config/shared/global-protect/global-protect-gateway&key=$($this.ApiKey)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
            
            if ($response.response.status -eq 'success' -and $response.response.result.'global-protect-gateway') {
                $gateways = $response.response.result.'global-protect-gateway'.entry
                
                foreach ($gateway in $gateways) {
                    $gatewayInfo = @{
                        Name = $gateway.name
                        Description = $gateway.description
                        TunnelMode = $gateway.'tunnel-mode'
                        Authentication = $gateway.authentication
                        IPPools = $gateway.'ip-pool'
                    }
                    
                    $this.ExportedData.GlobalProtect.Gateways += $gatewayInfo
                }
                
                $this.LogMessage("Exported $($this.ExportedData.GlobalProtect.Gateways.Count) GlobalProtect gateways", 'INFO')
            }
        }
        catch {
            $this.LogMessage("Failed to export GlobalProtect gateways: $_", 'WARNING')
        }
        
        $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=/config/shared/global-protect/global-protect-hip-objects&key=$($this.ApiKey)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
            
            if ($response.response.status -eq 'success' -and $response.response.result.'global-protect-hip-objects') {
                $hipObjects = $response.response.result.'global-protect-hip-objects'.entry
                
                foreach ($hip in $hipObjects) {
                    $hipInfo = @{
                        Name = $hip.name
                        Description = $hip.description
                        Criteria = $hip
                    }
                    
                    $this.ExportedData.GlobalProtect.HIPObjects += $hipInfo
                }
                
                $this.LogMessage("Exported $($this.ExportedData.GlobalProtect.HIPObjects.Count) HIP objects", 'INFO')
            }
        }
        catch {
            $this.LogMessage("Failed to export HIP objects: $_", 'WARNING')
        }
    }
    
    hidden [void] ExportCertificates() {
        $this.LogMessage("Exporting certificates", 'INFO')
        
        $uri = "https://$($this.PanoramaHost)/api/?type=op&cmd=<show><config><shared><certificate></certificate></shared></config></show>&key=$($this.ApiKey)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
            
            if ($response.response.status -eq 'success' -and $response.response.result.certificate) {
                $certificates = $response.response.result.certificate.entry
                
                foreach ($cert in $certificates) {
                    $certInfo = @{
                        Name = $cert.name
                        Subject = $cert.subject
                        Issuer = $cert.issuer
                        NotValidBefore = $cert.'not-valid-before'
                        NotValidAfter = $cert.'not-valid-after'
                        SerialNumber = $cert.'serial-number'
                        PublicKey = $cert.'public-key'
                        Algorithm = $cert.algorithm
                    }
                    
                    $this.ExportedData.Certificates += $certInfo
                }
                
                $this.LogMessage("Exported $($this.ExportedData.Certificates.Count) certificates", 'INFO')
            }
        }
        catch {
            $this.LogMessage("Failed to export certificates: $_", 'WARNING')
        }
    }
    
    hidden [void] ExportSchedules() {
        $this.LogMessage("Exporting schedules", 'INFO')
        
        $uri = "https://$($this.PanoramaHost)/api/?type=config&action=get&xpath=/config/shared/schedules&key=$($this.ApiKey)"
        
        try {
            $response = Invoke-RestMethod -Uri $uri -Method Get -SkipCertificateCheck
            
            if ($response.response.status -eq 'success' -and $response.response.result.schedules) {
                $schedules = $response.response.result.schedules.entry
                
                foreach ($schedule in $schedules) {
                    $scheduleInfo = @{
                        Name = $schedule.name
                        Type = if ($schedule.'schedule-type'.recurring) { $schedule.'schedule-type'.recurring } elseif ($schedule.'schedule-type'.'non-recurring') { $schedule.'schedule-type'.'non-recurring' } else { 'Unknown' }
                        Configuration = $schedule
                    }
                    
                    $this.ExportedData.Schedules += $scheduleInfo
                }
                
                $this.LogMessage("Exported $($this.ExportedData.Schedules.Count) schedules", 'INFO')
            }
        }
        catch {
            $this.LogMessage("Failed to export schedules: $_", 'WARNING')
        }
    }
    
    [hashtable] ExportResults() {
        return $this.ExportedData
    }
    
    [void] ExportToFile([string]$outputPath) {
        $this.LogMessage("Exporting Panorama configuration to file", 'INFO')
        
        try {
            $jsonData = $this.ExportedData | ConvertTo-Json -Depth 10
            Set-Content -Path $outputPath -Value $jsonData -Encoding UTF8
            $this.LogMessage("Exported Panorama configuration to: $outputPath", 'INFO')
        }
        catch {
            $this.LogMessage("Failed to export to file: $_", 'ERROR')
            throw
        }
    }
    
    [void] Cleanup() {
        $this.PanoramaHost = $null
        $this.ApiKey = $null
        $this.Credential = $null
        $this.ExportedData = @{}
        $this.LogMessage("Panorama interrogation cleanup completed", 'INFO')
    }
}

function Invoke-PanoramaInterrogation {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    # Define discovery script
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        try {
            # Create PanoramaInterrogation instance
            $panoramaDiscovery = [PanoramaInterrogation]::new()

            # Set parameters from configuration
            $params = @{}
            if ($Configuration.ContainsKey('PanoramaHost')) {
                $params.PanoramaHost = $Configuration.PanoramaHost
            }
            if ($Configuration.ContainsKey('ApiKey')) {
                $params.ApiKey = $Configuration.ApiKey
            }
            if ($Configuration.ContainsKey('Credential')) {
                $params.Credential = $Configuration.Credential
            }

            if ($params.Count -gt 0) {
                $panoramaDiscovery.SetParameters($params)
            }

            # Execute discovery
            $summary = $panoramaDiscovery.ExecuteDiscovery()

            if ($summary) {
                # Convert the exported data to normalized format for output
                $exData = $summary.ExportedData

                # Process devices
                if ($exData.Devices -and $exData.Devices.Count -gt 0) {
                    foreach ($device in $exData.Devices) {
                        $deviceData = [PSCustomObject]@{
                            ObjectType = "PanoramaDevice"
                            Name = $device.Name
                            Serial = $device.Serial
                            Model = $device.Model
                            SoftwareVersion = $device.SoftwareVersion
                            IPAddress = $device.IPAddress
                            Hostname = $device.Hostname
                            State = $device.State
                            HAState = $device.HAState
                            VirtualSystems = $device.VirtualSystems
                            DeviceGroup = $device.DeviceGroup
                            Template = $device.Template
                            LastCommit = $device.LastCommit
                            _DataType = 'PanoramaDevices'
                            SessionId = $SessionId
                        }
                        $null = $allDiscoveredData.Add($deviceData)
                    }
                }

                # Process device groups
                if ($exData.DeviceGroups -and $exData.DeviceGroups.Count -gt 0) {
                    foreach ($dg in $exData.DeviceGroups) {
                        $dgData = [PSCustomObject]@{
                            ObjectType = "PanoramaDeviceGroup"
                            Name = $dg.Name
                            Description = $dg.Description
                            Devices = $dg.Devices
                            ParentDeviceGroup = $dg.ParentDeviceGroup
                            _DataType = 'PanoramaDeviceGroups'
                            SessionId = $SessionId
                        }
                        $null = $allDiscoveredData.Add($dgData)
                    }
                }

                # Process templates
                if ($exData.Templates -and $exData.Templates.Count -gt 0) {
                    foreach ($template in $exData.Templates) {
                        $templateData = [PSCustomObject]@{
                            ObjectType = "PanoramaTemplate"
                            Name = $template.Name
                            Description = $template.Description
                            Devices = $template.Devices
                            _DataType = 'PanoramaTemplates'
                            SessionId = $SessionId
                        }
                        $null = $allDiscoveredData.Add($templateData)
                    }
                }

                # Process security policies
                if ($exData.Policies.Security -and $exData.Policies.Security.Count -gt 0) {
                    foreach ($policy in $exData.Policies.Security) {
                        $policyData = [PSCustomObject]@{
                            ObjectType = "PanoramaSecurityPolicy"
                            Name = $policy.Name
                            DeviceGroup = $policy.DeviceGroup
                            Type = $policy.Type
                            Description = $policy.Description
                            SourceZones = $policy.SourceZones
                            DestinationZones = $policy.DestinationZones
                            SourceAddresses = $policy.SourceAddresses
                            DestinationAddresses = $policy.DestinationAddresses
                            Applications = $policy.Applications
                            Services = $policy.Services
                            Action = $policy.Action
                            LogSetting = $policy.LogSetting
                            ProfileSetting = $policy.ProfileSetting
                            Disabled = $policy.Disabled
                            Tags = $policy.Tags
                            _DataType = 'PanoramaSecurityPolicies'
                            SessionId = $SessionId
                        }
                        $null = $allDiscoveredData.Add($policyData)
                    }
                }

                # Process NAT policies
                if ($exData.Policies.NAT -and $exData.Policies.NAT.Count -gt 0) {
                    foreach ($policy in $exData.Policies.NAT) {
                        $policyData = [PSCustomObject]@{
                            ObjectType = "PanoramaNATPolicy"
                            Name = $policy.Name
                            DeviceGroup = $policy.DeviceGroup
                            Type = $policy.Type
                            Description = $policy.Description
                            SourceZones = $policy.SourceZones
                            DestinationZones = $policy.DestinationZones
                            SourceAddresses = $policy.SourceAddresses
                            DestinationAddresses = $policy.DestinationAddresses
                            Service = $policy.Service
                            SourceTranslation = $policy.SourceTranslation
                            DestinationTranslation = $policy.DestinationTranslation
                            Disabled = $policy.Disabled
                            Tags = $policy.Tags
                            _DataType = 'PanoramaNATPolicies'
                            SessionId = $SessionId
                        }
                        $null = $allDiscoveredData.Add($policyData)
                    }
                }

                # Process addresses
                if ($exData.Objects.Addresses -and $exData.Objects.Addresses.Count -gt 0) {
                    foreach ($addr in $exData.Objects.Addresses) {
                        $addrData = [PSCustomObject]@{
                            ObjectType = "PanoramaAddress"
                            Name = $addr.Name
                            Type = $addr.Type
                            Value = $addr.Value
                            Description = $addr.Description
                            Tags = $addr.Tags
                            _DataType = 'PanoramaAddresses'
                            SessionId = $SessionId
                        }
                        $null = $allDiscoveredData.Add($addrData)
                    }
                }

                # Process services
                if ($exData.Objects.Services -and $exData.Objects.Services.Count -gt 0) {
                    foreach ($svc in $exData.Objects.Services) {
                        $svcData = [PSCustomObject]@{
                            ObjectType = "PanoramaService"
                            Name = $svc.Name
                            Protocol = $svc.Protocol
                            Port = $svc.Port
                            Description = $svc.Description
                            Tags = $svc.Tags
                            _DataType = 'PanoramaServices'
                            SessionId = $SessionId
                        }
                        $null = $allDiscoveredData.Add($svcData)
                    }
                }

                # Process GlobalProtect portals
                if ($exData.GlobalProtect.Portals -and $exData.GlobalProtect.Portals.Count -gt 0) {
                    foreach ($portal in $exData.GlobalProtect.Portals) {
                        $portalData = [PSCustomObject]@{
                            ObjectType = "PanoramaGlobalProtectPortal"
                            Name = $portal.Name
                            Description = $portal.Description
                            ClientConfig = $portal.ClientConfig
                            Authentication = $portal.Authentication
                            _DataType = 'PanoramaGlobalProtect'
                            SessionId = $SessionId
                        }
                        $null = $allDiscoveredData.Add($portalData)
                    }
                }

                # Set success and metadata
                $Result.Success = $true
                $Result.Metadata = @{
                    DiscoveryTime = Get-Date
                    PanoramaHost = $summary.PanoramaHost
                    TotalDevices = $summary.DeviceCount
                    TotalDeviceGroups = $summary.DeviceGroupCount
                    TotalTemplates = $summary.TemplateCount
                    TotalSecurityPolicies = $summary.SecurityPolicyCount
                    TotalAddresses = $summary.AddressObjectCount
                    TotalServices = $summary.ServiceObjectCount
                }

                Write-ModuleLog -ModuleName "PanoramaInterrogation" -Message "Panorama discovery completed successfully" -Level "SUCCESS"
            } else {
                $Result.AddError("Panorama discovery execution failed - no summary returned", $null, @{Section="Discovery"})
            }

        } catch {
            $Result.AddError("Panorama interrogation failed: $($_.Exception.Message)", $_.Exception, @{Section="Discovery"})
        }

        # Return data grouped by type
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    # Execute discovery using the base module
    Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force
    Start-DiscoveryModule `
        -ModuleName "PanoramaInterrogation" `
        -DiscoveryScript $discoveryScript `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @()
}

function Get-PanoramaInterrogation {
    [CmdletBinding()]
    param()

    return [PanoramaInterrogation]::new()
}

Export-ModuleMember -Function Get-PanoramaInterrogation
Export-ModuleMember -Function Invoke-PanoramaInterrogation