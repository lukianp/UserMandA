#Requires -Version 5.1
using namespace System.Collections.Generic

Set-StrictMode -Version 3.0

class PaloAltoDiscovery : DiscoveryModuleBase {
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
        
        $commonPorts = @(443, 3978, 28443)
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
                        }
                        
                        if (Test-Connection -ComputerName $ip -Count 1 -Quiet) {
                            $result.IsAlive = $true
                            
                            foreach ($port in $ports) {
                                $tcpClient = New-Object System.Net.Sockets.TcpClient
                                try {
                                    $connect = $tcpClient.BeginConnect($ip, $port, $null, $null)
                                    $wait = $connect.AsyncWaitHandle.WaitOne(1000, $false)
                                    
                                    if ($wait -and $tcpClient.Connected) {
                                        $result.OpenPorts += $port
                                        
                                        if ($port -eq 443) {
                                            try {
                                                $webRequest = [System.Net.WebRequest]::Create("https://$ip")
                                                $webRequest.Method = "GET"
                                                $webRequest.Timeout = 5000
                                                $webRequest.ServerCertificateValidationCallback = {$true}
                                                
                                                $response = $webRequest.GetResponse()
                                                $responseStream = $response.GetResponseStream()
                                                $reader = New-Object System.IO.StreamReader($responseStream)
                                                $content = $reader.ReadToEnd()
                                                
                                                if ($content -match 'Palo Alto Networks|GlobalProtect|PAN-OS') {
                                                    $result.IsPaloAlto = $true
                                                }
                                                
                                                $reader.Close()
                                                $response.Close()
                                            }
                                            catch {
                                                if ($_.Exception.Message -match 'Palo Alto Networks|GlobalProtect') {
                                                    $result.IsPaloAlto = $true
                                                }
                                            }
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
                    if ($result.IsPaloAlto -or ($result.OpenPorts.Count -gt 0 -and $result.OpenPorts -contains 3978)) {
                        $device = [PSCustomObject]@{
                            IPAddress = $result.IP
                            Hostname = $this.ResolveHostname($result.IP)
                            DeviceType = 'Unknown'
                            Model = 'Unknown'
                            SerialNumber = 'Unknown'
                            SoftwareVersion = 'Unknown'
                            ManagementIP = $result.IP
                            DiscoveredPorts = $result.OpenPorts
                            DiscoveryMethod = 'Network Scan'
                            DiscoveryTime = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                        }
                        
                        $this.PaloAltoDevices += $device
                        $this.LogMessage("Discovered potential Palo Alto device at $($result.IP)", 'INFO')
                    }
                }
            }
        }
    }
    
    hidden [void] IdentifyPanoramaServers() {
        $this.LogMessage("Identifying Panorama management servers", 'INFO')
        
        foreach ($device in $this.PaloAltoDevices) {
            try {
                $isPanorama = $false
                
                $webRequest = [System.Net.WebRequest]::Create("https://$($device.IPAddress)/api/")
                $webRequest.Method = "GET"
                $webRequest.Timeout = 5000
                $webRequest.ServerCertificateValidationCallback = {$true}
                
                try {
                    $response = $webRequest.GetResponse()
                    $headers = $response.Headers
                    
                    if ($headers["Server"] -match 'Panorama') {
                        $isPanorama = $true
                    }
                    
                    $response.Close()
                }
                catch {
                    if ($_.Exception.Response.StatusCode -eq 403 -and $_.Exception.Message -match 'Panorama') {
                        $isPanorama = $true
                    }
                }
                
                if ($isPanorama) {
                    $device.DeviceType = 'Panorama'
                    $this.PanoramaServers += $device
                    $this.LogMessage("Identified Panorama server at $($device.IPAddress)", 'INFO')
                }
                else {
                    $device.DeviceType = 'Firewall'
                }
            }
            catch {
                $this.LogMessage("Failed to identify device type for $($device.IPAddress): $_", 'WARNING')
            }
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