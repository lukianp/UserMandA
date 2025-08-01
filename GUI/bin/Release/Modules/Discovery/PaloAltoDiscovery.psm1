#Requires -Version 5.1
using namespace System.Collections.Generic

Set-StrictMode -Version 3.0

class PaloAltoDiscovery {
    [string]$DiscoveryType = 'PaloAlto'
    [string]$DataFileName = 'PaloAlto_DiscoveryData.csv'
    
    hidden [array]$PaloAltoDevices = @()
    hidden [array]$PanoramaServers = @()
    hidden [hashtable]$NetworkRanges = @{}
    
    PaloAltoDiscovery() : base('PaloAlto') {
        $this.RequiredModules = @('NetTCPIP', 'DnsClient')
        $this.SupportedAuthTypes = @('Local', 'Certificate', 'APIKey')
        $this.InitializeModule()
    }
    
    [void] SetParameters([hashtable]$params) {
        $this.ModuleConfig = $params
        
        if ($params.ContainsKey('NetworkRanges')) {
            $this.NetworkRanges = $params.NetworkRanges
        }
        else {
            $this.NetworkRanges = @{
                'Default' = @('10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16')
            }
        }
    }
    
    [psobject] ExecuteDiscovery() {
        $this.LogMessage("Starting Palo Alto Networks discovery", 'INFO')
        $discoveryData = [PSCustomObject]@{
            PaloAltoDevices = @()
            PanoramaServers = @()
            TotalDevices = 0
            TotalPanoramas = 0
            DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        }
        
        try {
            $this.UpdateProgress("Scanning network for Palo Alto devices", 10)
            $this.DiscoverPaloAltoDevices()
            
            $this.UpdateProgress("Identifying Panorama management servers", 40)
            $this.IdentifyPanoramaServers()
            
            $this.UpdateProgress("Collecting device information", 70)
            $deviceInfo = $this.CollectDeviceInformation()
            
            $discoveryData.PaloAltoDevices = $this.PaloAltoDevices
            $discoveryData.PanoramaServers = $this.PanoramaServers
            $discoveryData.TotalDevices = $this.PaloAltoDevices.Count
            $discoveryData.TotalPanoramas = $this.PanoramaServers.Count
            
            $this.UpdateProgress("Discovery complete", 100)
            $this.LogMessage("Discovered $($discoveryData.TotalDevices) Palo Alto devices and $($discoveryData.TotalPanoramas) Panorama servers", 'INFO')
            
            return $discoveryData
        }
        catch {
            $this.LogMessage("Discovery failed: $_", 'ERROR')
            throw
        }
    }
    
    hidden [void] DiscoverPaloAltoDevices() {
        $this.LogMessage("Scanning for Palo Alto devices on network", 'INFO')
        
        $commonPorts = @(443, 3978, 28443, 22, 25, 993, 995)
        $discoveredDevices = @()
        
        foreach ($range in $this.NetworkRanges.Values) {
            foreach ($subnet in $range) {
                $this.LogMessage("Scanning subnet: $subnet", 'VERBOSE')
                
                $scanJobs = @()
                $ipRange = $this.ExpandIPRange($subnet)
                
                foreach ($ip in $ipRange) {
                    $scanJobs += Start-Job -ScriptBlock {
                        param($ip, $ports)
                        
                        $result = @{
                            IP = $ip
                            IsAlive = $false
                            OpenPorts = @()
                            IsPaloAlto = $false
                            SSLCertificate = $null
                            WebContent = $null
                            SSHBanner = $null
                            HAStatus = 'Unknown'
                            DeviceInfo = @{}
                        }
                        
                        if (Test-Connection -ComputerName $ip -Count 1 -Quiet) {
                            $result.IsAlive = $true
                            
                            foreach ($port in $ports) {
                                $tcpClient = New-Object System.Net.Sockets.TcpClient
                                try {
                                    $connect = $tcpClient.BeginConnect($ip, $port, $null, $null)
                                    $wait = $connect.AsyncWaitHandle.WaitOne(2000, $false)
                                    
                                    if ($wait -and $tcpClient.Connected) {
                                        $result.OpenPorts += $port
                                        
                                        if ($port -eq 443) {
                                            try {
                                                [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
                                                [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
                                                
                                                $webRequest = [System.Net.WebRequest]::Create("https://$ip")
                                                $webRequest.Method = "GET"
                                                $webRequest.Timeout = 5000
                                                $webRequest.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                                                
                                                $response = $webRequest.GetResponse()
                                                $responseStream = $response.GetResponseStream()
                                                $reader = New-Object System.IO.StreamReader($responseStream)
                                                $content = $reader.ReadToEnd()
                                                $result.WebContent = $content.Substring(0, [Math]::Min(1000, $content.Length))
                                                
                                                if ($content -match 'Palo Alto Networks|GlobalProtect|PAN-OS|panos|pan-os') {
                                                    $result.IsPaloAlto = $true
                                                }
                                                
                                                if ($response.Headers["Server"] -match 'Palo Alto|PAN-OS') {
                                                    $result.IsPaloAlto = $true
                                                }
                                                
                                                try {
                                                    $sslStream = New-Object System.Net.Security.SslStream($tcpClient.GetStream())
                                                    $sslStream.AuthenticateAsClient($ip)
                                                    $cert = $sslStream.RemoteCertificate
                                                    if ($cert) {
                                                        $x509Cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($cert)
                                                        $result.SSLCertificate = @{
                                                            Subject = $x509Cert.Subject
                                                            Issuer = $x509Cert.Issuer
                                                            NotBefore = $x509Cert.NotBefore
                                                            NotAfter = $x509Cert.NotAfter
                                                            SerialNumber = $x509Cert.SerialNumber
                                                            Thumbprint = $x509Cert.Thumbprint
                                                        }
                                                        
                                                        if ($x509Cert.Subject -match 'Palo Alto|PAN-OS|GlobalProtect') {
                                                            $result.IsPaloAlto = $true
                                                        }
                                                    }
                                                }
                                                catch {}
                                                
                                                $reader.Close()
                                                $response.Close()
                                            }
                                            catch {
                                                if ($_.Exception.Message -match 'Palo Alto Networks|GlobalProtect|PAN-OS') {
                                                    $result.IsPaloAlto = $true
                                                }
                                            }
                                        }
                                        elseif ($port -eq 22) {
                                            try {
                                                $stream = $tcpClient.GetStream()
                                                $buffer = New-Object byte[] 1024
                                                $bytesRead = $stream.Read($buffer, 0, 1024)
                                                if ($bytesRead -gt 0) {
                                                    $banner = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $bytesRead)
                                                    $result.SSHBanner = $banner.Trim()
                                                    
                                                    if ($banner -match 'Palo Alto|PAN-OS') {
                                                        $result.IsPaloAlto = $true
                                                    }
                                                }
                                            }
                                            catch {}
                                        }
                                    }
                                }
                                catch {}
                                finally {
                                    $tcpClient.Close()
                                }
                            }
                        }
                        
                        return $result
                    } -ArgumentList $ip, $commonPorts
                }
                
                $scanResults = $scanJobs | Wait-Job | Receive-Job
                $scanJobs | Remove-Job
                
                foreach ($result in $scanResults) {
                    if ($result.IsPaloAlto -or ($result.OpenPorts.Count -gt 0 -and ($result.OpenPorts -contains 3978 -or $result.OpenPorts -contains 28443))) {
                        $device = [PSCustomObject]@{
                            IPAddress = $result.IP
                            Hostname = $this.ResolveHostname($result.IP)
                            DeviceType = 'Unknown'
                            Model = 'Unknown'
                            SerialNumber = 'Unknown'
                            SoftwareVersion = 'Unknown'
                            ManagementIP = $result.IP
                            DiscoveredPorts = $result.OpenPorts
                            DiscoveryMethod = 'Advanced Network Scan'
                            DiscoveryTime = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                            SSLCertificate = $result.SSLCertificate
                            WebContent = $result.WebContent
                            SSHBanner = $result.SSHBanner
                            HAStatus = $result.HAStatus
                            DeviceInfo = $result.DeviceInfo
                            ConfidenceScore = $this.CalculateConfidenceScore($result)
                        }
                        
                        $this.PaloAltoDevices += $device
                        $this.LogMessage("Discovered Palo Alto device at $($result.IP) (Confidence: $($device.ConfidenceScore)%)", 'INFO')
                    }
                }
            }
        }
    }
    
    hidden [void] IdentifyPanoramaServers() {
        $this.LogMessage("Identifying Panorama management servers and collecting device details", 'INFO')
        
        foreach ($device in $this.PaloAltoDevices) {
            try {
                $isPanorama = $false
                $deviceInfo = @{}
                
                $webRequest = [System.Net.WebRequest]::Create("https://$($device.IPAddress)/api/")
                $webRequest.Method = "GET"
                $webRequest.Timeout = 8000
                $webRequest.ServerCertificateValidationCallback = {$true}
                
                try {
                    $response = $webRequest.GetResponse()
                    $headers = $response.Headers
                    $responseStream = $response.GetResponseStream()
                    $reader = New-Object System.IO.StreamReader($responseStream)
                    $apiContent = $reader.ReadToEnd()
                    
                    if ($headers["Server"] -match 'Panorama|pan-os') {
                        $isPanorama = $true
                    }
                    
                    if ($apiContent -match 'Panorama|<type>panorama</type>') {
                        $isPanorama = $true
                    }
                    
                    $reader.Close()
                    $response.Close()
                }
                catch {
                    if ($_.Exception.Response -and $_.Exception.Response.StatusCode -eq 403) {
                        $errorStream = $_.Exception.Response.GetResponseStream()
                        if ($errorStream) {
                            $errorReader = New-Object System.IO.StreamReader($errorStream)
                            $errorContent = $errorReader.ReadToEnd()
                            if ($errorContent -match 'Panorama|<type>panorama</type>') {
                                $isPanorama = $true
                            }
                            $errorReader.Close()
                        }
                    }
                }
                
                $this.CheckHighAvailabilityStatus($device)
                $this.GetDeviceSystemInfo($device)
                
                if ($isPanorama) {
                    $device.DeviceType = 'Panorama'
                    $this.PanoramaServers += $device
                    $this.LogMessage("Identified Panorama server at $($device.IPAddress)", 'INFO')
                    
                    $this.GetPanoramaManagedDevices($device)
                }
                else {
                    $device.DeviceType = if ($device.WebContent -match 'firewall|PA-\d+') { 'Firewall' } else { 'Unknown' }
                }
            }
            catch {
                $this.LogMessage("Failed to identify device type for $($device.IPAddress): $_", 'WARNING')
                $device.DeviceType = 'Unknown'
            }
        }
    }
    
    hidden [int] CalculateConfidenceScore([hashtable]$result) {
        $score = 0
        
        if ($result.IsPaloAlto) { $score += 40 }
        if ($result.OpenPorts -contains 443) { $score += 15 }
        if ($result.OpenPorts -contains 3978) { $score += 20 }
        if ($result.OpenPorts -contains 28443) { $score += 15 }
        if ($result.SSLCertificate -and $result.SSLCertificate.Subject -match 'Palo Alto|PAN-OS|GlobalProtect') { $score += 20 }
        if ($result.SSHBanner -match 'Palo Alto|PAN-OS') { $score += 15 }
        if ($result.WebContent -match 'Palo Alto Networks|GlobalProtect|PAN-OS') { $score += 25 }
        
        return [Math]::Min(100, $score)
    }
    
    hidden [void] CheckHighAvailabilityStatus([PSCustomObject]$device) {
        try {
            $haRequest = [System.Net.WebRequest]::Create("https://$($device.IPAddress)/api/?type=op&cmd=<show><high-availability><all></all></high-availability></show>")
            $haRequest.Method = "GET"
            $haRequest.Timeout = 5000
            $haRequest.ServerCertificateValidationCallback = {$true}
            
            $haResponse = $haRequest.GetResponse()
            $haStream = $haResponse.GetResponseStream()
            $haReader = New-Object System.IO.StreamReader($haStream)
            $haContent = $haReader.ReadToEnd()
            
            if ($haContent -match '<enabled>yes</enabled>') {
                if ($haContent -match '<state>active</state>') {
                    $device.HAStatus = 'Active'
                }
                elseif ($haContent -match '<state>passive</state>') {
                    $device.HAStatus = 'Passive'
                }
                else {
                    $device.HAStatus = 'HA Enabled'
                }
            }
            else {
                $device.HAStatus = 'Standalone'
            }
            
            $haReader.Close()
            $haResponse.Close()
        }
        catch {
            $device.HAStatus = 'Unknown'
        }
    }
    
    hidden [void] GetDeviceSystemInfo([PSCustomObject]$device) {
        try {
            $sysRequest = [System.Net.WebRequest]::Create("https://$($device.IPAddress)/api/?type=op&cmd=<show><system><info></info></system></show>")
            $sysRequest.Method = "GET"
            $sysRequest.Timeout = 5000
            $sysRequest.ServerCertificateValidationCallback = {$true}
            
            $sysResponse = $sysRequest.GetResponse()
            $sysStream = $sysResponse.GetResponseStream()
            $sysReader = New-Object System.IO.StreamReader($sysStream)
            $sysContent = $sysReader.ReadToEnd()
            
            if ($sysContent -match '<model>([^<]+)</model>') {
                $device.Model = $matches[1]
            }
            
            if ($sysContent -match '<serial>([^<]+)</serial>') {
                $device.SerialNumber = $matches[1]
            }
            
            if ($sysContent -match '<sw-version>([^<]+)</sw-version>') {
                $device.SoftwareVersion = $matches[1]
            }
            
            if ($sysContent -match '<hostname>([^<]+)</hostname>') {
                $device.Hostname = $matches[1]
            }
            
            $sysReader.Close()
            $sysResponse.Close()
        }
        catch {
            $this.LogMessage("Could not retrieve system info for $($device.IPAddress)", 'VERBOSE')
        }
    }
    
    hidden [void] GetPanoramaManagedDevices([PSCustomObject]$panorama) {
        try {
            $devRequest = [System.Net.WebRequest]::Create("https://$($panorama.IPAddress)/api/?type=op&cmd=<show><devices><all></all></devices></show>")
            $devRequest.Method = "GET"
            $devRequest.Timeout = 10000
            $devRequest.ServerCertificateValidationCallback = {$true}
            
            $devResponse = $devRequest.GetResponse()
            $devStream = $devResponse.GetResponseStream()
            $devReader = New-Object System.IO.StreamReader($devStream)
            $devContent = $devReader.ReadToEnd()
            
            $panorama.DeviceInfo['ManagedDeviceCount'] = ($devContent | Select-String -Pattern '<entry name=' -AllMatches).Matches.Count
            $panorama.DeviceInfo['ManagedDevicesXML'] = $devContent
            
            $devReader.Close()
            $devResponse.Close()
            
            $this.LogMessage("Panorama at $($panorama.IPAddress) manages $($panorama.DeviceInfo.ManagedDeviceCount) devices", 'INFO')
        }
        catch {
            $this.LogMessage("Could not retrieve managed devices for Panorama $($panorama.IPAddress)", 'VERBOSE')
        }
    }
    
    hidden [PSCustomObject[]] CollectDeviceInformation() {
        $deviceInfo = @()
        
        foreach ($device in $this.PaloAltoDevices) {
            $info = [PSCustomObject]@{
                IPAddress = $device.IPAddress
                Hostname = $device.Hostname
                DeviceType = $device.DeviceType
                Model = $device.Model
                SerialNumber = $device.SerialNumber
                SoftwareVersion = $device.SoftwareVersion
                ManagementIP = $device.ManagementIP
                IsPanoramaManaged = $false
                PanoramaIP = 'N/A'
                DeviceGroup = 'N/A'
                Template = 'N/A'
                Zones = @()
                Interfaces = @()
                VirtualSystems = @()
                HighAvailability = 'Standalone'
                DiscoveryTime = $device.DiscoveryTime
            }
            
            $deviceInfo += $info
        }
        
        return $deviceInfo
    }
    
    hidden [string[]] ExpandIPRange([string]$cidr) {
        $ipRange = @()
        
        if ($cidr -match '(\d+\.\d+\.\d+\.\d+)/(\d+)') {
            $baseIP = $matches[1]
            $prefixLength = [int]$matches[2]
            
            $ipBytes = [System.Net.IPAddress]::Parse($baseIP).GetAddressBytes()
            [Array]::Reverse($ipBytes)
            $ipInt = [System.BitConverter]::ToUInt32($ipBytes, 0)
            
            $maskInt = (-bnot ([uint32]0)) -shl (32 - $prefixLength)
            $networkInt = $ipInt -band $maskInt
            $broadcastInt = $networkInt -bor (-bnot $maskInt)
            
            for ($i = $networkInt + 1; $i -lt $broadcastInt; $i++) {
                $bytes = [System.BitConverter]::GetBytes([uint32]$i)
                [Array]::Reverse($bytes)
                $ipRange += [System.Net.IPAddress]::new($bytes).ToString()
            }
        }
        
        return $ipRange | Select-Object -First 254
    }
    
    hidden [string] ResolveHostname([string]$ipAddress) {
        try {
            $result = [System.Net.Dns]::GetHostEntry($ipAddress)
            return $result.HostName
        }
        catch {
            return $ipAddress
        }
    }
    
    [hashtable] ExportResults() {
        $exportData = @{
            Devices = @()
            Panoramas = @()
            Summary = @{}
        }
        
        foreach ($device in $this.PaloAltoDevices) {
            $exportData.Devices += @{
                IPAddress = $device.IPAddress
                Hostname = $device.Hostname
                DeviceType = $device.DeviceType
                Model = $device.Model
                SerialNumber = $device.SerialNumber
                SoftwareVersion = $device.SoftwareVersion
                ManagementIP = $device.ManagementIP
                DiscoveryTime = $device.DiscoveryTime
            }
        }
        
        foreach ($panorama in $this.PanoramaServers) {
            $exportData.Panoramas += @{
                IPAddress = $panorama.IPAddress
                Hostname = $panorama.Hostname
                Model = $panorama.Model
                SoftwareVersion = $panorama.SoftwareVersion
                ManagedDevices = @()
                DeviceGroups = @()
                Templates = @()
            }
        }
        
        $exportData.Summary = @{
            TotalDevices = $this.PaloAltoDevices.Count
            TotalPanoramas = $this.PanoramaServers.Count
            TotalFirewalls = ($this.PaloAltoDevices | Where-Object { $_.DeviceType -eq 'Firewall' }).Count
            DiscoveryCompleted = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        }
        
        return $exportData
    }
    
    [void] Cleanup() {
        $this.PaloAltoDevices = @()
        $this.PanoramaServers = @()
        $this.NetworkRanges = @{}
        $this.LogMessage("PaloAlto discovery cleanup completed", 'INFO')
    }
}

function Get-PaloAltoDiscovery {
    [CmdletBinding()]
    param()
    
    return [PaloAltoDiscovery]::new()
}

Export-ModuleMember -Function Get-PaloAltoDiscovery