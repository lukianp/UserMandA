# -*- coding: utf-8-bom -*-

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Updated version control header


# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-06-04
# Last Modified: 2025-06-06
# Change Log: Initial version - any future changes require version increment

<#
.SYNOPSIS
    Network Infrastructure discovery for M&A Discovery Suite
.DESCRIPTION
    Discovers DHCP, DNS, and network configuration information

#cant use outputpath globalupdate here because its used heavily inside. 

#>

$authModulePathFromGlobal = Join-Path $global:MandA.Paths.Authentication "DiscoveryModuleBase.psm1"
Import-Module $authModulePathFromGlobal -Force

# Prerequisites validation function
function Test-NetworkInfrastructureDiscoveryPrerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context,
        [Parameter(Mandatory=$false)]
        [PSCredential]$Credential
    )
    
    $prerequisites = @{
        IsValid = $true
        MissingRequirements = @()
        Warnings = @()
    }
    
    try {
        Write-ProgressStep "Validating Network Infrastructure Discovery prerequisites..." -Status Progress
        
        # Check for required modules
        $requiredModules = @('ActiveDirectory')
        $optionalModules = @('DhcpServer', 'DnsServer')
        
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -ListAvailable -Name $module)) {
                $prerequisites.IsValid = $false
                $prerequisites.MissingRequirements += "Required module '$module' not available"
            }
        }
        
        foreach ($module in $optionalModules) {
            if (-not (Get-Module -ListAvailable -Name $module)) {
                $prerequisites.Warnings += "Optional module '$module' not available - some features will be limited"
            }
        }
        
        # Check Active Directory connectivity
        try {
            $null = Get-ADDomain -ErrorAction Stop
        } catch {
            $prerequisites.IsValid = $false
            $prerequisites.MissingRequirements += "Cannot connect to Active Directory: $($_.Exception.Message)"
        }
        
        # Check DHCP server availability
        try {
            $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
            if (-not $dhcpServers) {
                $prerequisites.Warnings += "No DHCP servers found in Active Directory"
            }
        } catch {
            $prerequisites.Warnings += "Cannot query DHCP servers: $($_.Exception.Message)"
        }
        
        # Check DNS server availability
        try {
            $dnsServers = Get-ADDomainController -Filter * -ErrorAction SilentlyContinue
            if (-not $dnsServers) {
                $prerequisites.Warnings += "No domain controllers found for DNS discovery"
            }
        } catch {
            $prerequisites.Warnings += "Cannot query domain controllers: $($_.Exception.Message)"
        }
        
        Write-ProgressStep "Prerequisites validation completed" -Status Success
        
    } catch {
        $prerequisites.IsValid = $false
        $prerequisites.MissingRequirements += "Prerequisites validation failed: $($_.Exception.Message)"
        Write-ProgressStep "Prerequisites validation failed: $($_.Exception.Message)" -Status Error
    }
    
    return $prerequisites
}

# Enhanced main function with comprehensive error handling
function Invoke-NetworkInfrastructureDiscovery {
    [CmdletBinding()]
    [OutputType([hashtable])]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        
        [Parameter(Mandatory=$true)]
        [MandAContext]$Context,
        
        [Parameter(Mandatory=$false)]
        [PSCredential]$Credential
    )
    
    # Initialize result object
    $result = [DiscoveryResult]::new("NetworkInfrastructure")
    
    try {
        Write-ProgressStep "Starting Network Infrastructure Discovery" -Status Progress
        
        # Validate prerequisites
        $prerequisites = Test-NetworkInfrastructureDiscoveryPrerequisites -Configuration $Configuration -Context $Context -Credential $Credential
        if (-not $prerequisites.IsValid) {
            throw "Prerequisites validation failed: $($prerequisites.MissingRequirements -join '; ')"
        }
        
        # Log warnings
        foreach ($warning in $prerequisites.Warnings) {
            Write-ProgressStep $warning -Status Warning
            $Context.ErrorCollector.AddWarning("NetworkInfrastructure", $warning)
        }
        
        $results = @{}
        
        # 1. DHCP Discovery with error handling
        try {
            Write-ProgressStep "Discovering DHCP Infrastructure..." -Status Progress
            $results.DHCPServers = Get-DHCPServersDataWithErrorHandling -Configuration $Configuration -Context $Context -Credential $Credential
            $results.DHCPScopes = Get-DHCPScopesDataWithErrorHandling -Configuration $Configuration -Context $Context -Credential $Credential
            $results.DHCPReservations = Get-DHCPReservationsDataWithErrorHandling -Configuration $Configuration -Context $Context -Credential $Credential
            $results.DHCPOptions = Get-DHCPOptionsDataWithErrorHandling -Configuration $Configuration -Context $Context -Credential $Credential
            $result.Metadata.SectionsProcessed++
            
        } catch {
            $errorMsg = "Failed to discover DHCP infrastructure: $($_.Exception.Message)"
            Write-ProgressStep $errorMsg -Status Error
            $Context.ErrorCollector.AddError("NetworkInfrastructure", $errorMsg, $_.Exception)
            $result.Metadata.SectionErrors++
            $results.DHCPServers = @()
            $results.DHCPScopes = @()
            $results.DHCPReservations = @()
            $results.DHCPOptions = @()
        }
        
        # 2. DNS Discovery with error handling
        try {
            Write-ProgressStep "Discovering DNS Infrastructure..." -Status Progress
            $results.DNSServers = Get-DNSServersDataWithErrorHandling -Configuration $Configuration -Context $Context -Credential $Credential
            $results.DNSZones = Get-DNSZonesDataWithErrorHandling -Configuration $Configuration -Context $Context -Credential $Credential
            $results.DNSRecords = Get-DNSRecordsDataWithErrorHandling -Configuration $Configuration -Context $Context -Credential $Credential
            $result.Metadata.SectionsProcessed++
            
        } catch {
            $errorMsg = "Failed to discover DNS infrastructure: $($_.Exception.Message)"
            Write-ProgressStep $errorMsg -Status Error
            $Context.ErrorCollector.AddError("NetworkInfrastructure", $errorMsg, $_.Exception)
            $result.Metadata.SectionErrors++
            $results.DNSServers = @()
            $results.DNSZones = @()
            $results.DNSRecords = @()
        }
        
        # 3. Network Configuration Discovery with error handling
        try {
            Write-ProgressStep "Discovering Network Configuration..." -Status Progress
            $results.Subnets = Get-ADSubnetsDataWithErrorHandling -Configuration $Configuration -Context $Context -Credential $Credential
            $results.Sites = Get-ADSitesDataWithErrorHandling -Configuration $Configuration -Context $Context -Credential $Credential
            $result.Metadata.SectionsProcessed++
            
        } catch {
            $errorMsg = "Failed to discover network configuration: $($_.Exception.Message)"
            Write-ProgressStep $errorMsg -Status Error
            $Context.ErrorCollector.AddError("NetworkInfrastructure", $errorMsg, $_.Exception)
            $result.Metadata.SectionErrors++
            $results.Subnets = @()
            $results.Sites = @()
        }
        
        # Update result
        $result.Data = Convert-ToFlattenedNetworkData -Results $results
        $result.Success = $true
        $result.Metadata.TotalSections = 3
        $result.Metadata.EndTime = Get-Date
        $result.Metadata.Duration = $result.Metadata.EndTime - $result.Metadata.StartTime
        
        Write-ProgressStep "Network Infrastructure Discovery completed" -Status Success
        return $result
        
    } catch {
        $result.Success = $false
        $result.ErrorMessage = $_.Exception.Message
        $result.Metadata.EndTime = Get-Date
        $result.Metadata.Duration = $result.Metadata.EndTime - $result.Metadata.StartTime
        
        Write-ProgressStep "Network Infrastructure Discovery failed: $($_.Exception.Message)" -Status Error
        $Context.ErrorCollector.AddError("NetworkInfrastructure", "Discovery failed", $_.Exception)
        
        return $result
        
    } finally {
        # Cleanup resources
        Write-ProgressStep "Network Infrastructure Discovery cleanup completed" -Status Info
    }
}

# Enhanced wrapper functions with retry logic
function Get-DHCPServersDataWithErrorHandling {
    param($Configuration, $Context, $Credential)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-DHCPServersData -OutputPath $null -Configuration $Configuration
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "DHCP servers discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-DHCPScopesDataWithErrorHandling {
    param($Configuration, $Context, $Credential)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-DHCPScopesData -OutputPath $null -Configuration $Configuration
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "DHCP scopes discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-DHCPReservationsDataWithErrorHandling {
    param($Configuration, $Context, $Credential)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-DHCPReservationsData -OutputPath $null -Configuration $Configuration
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "DHCP reservations discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-DHCPOptionsDataWithErrorHandling {
    param($Configuration, $Context, $Credential)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-DHCPOptionsData -OutputPath $null -Configuration $Configuration
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "DHCP options discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-DNSServersDataWithErrorHandling {
    param($Configuration, $Context, $Credential)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-DNSServersData -OutputPath $null -Configuration $Configuration
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "DNS servers discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-DNSZonesDataWithErrorHandling {
    param($Configuration, $Context, $Credential)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-DNSZonesData -OutputPath $null -Configuration $Configuration
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "DNS zones discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-DNSRecordsDataWithErrorHandling {
    param($Configuration, $Context, $Credential)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-DNSRecordsData -OutputPath $null -Configuration $Configuration
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "DNS records discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-ADSubnetsDataWithErrorHandling {
    param($Configuration, $Context, $Credential)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-ADSubnetsData -OutputPath $null -Configuration $Configuration
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "AD subnets discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-ADSitesDataWithErrorHandling {
    param($Configuration, $Context, $Credential)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-ADSitesData -OutputPath $null -Configuration $Configuration
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "AD sites discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Convert-ToFlattenedNetworkData {
    param([hashtable]$Results)
    
    $flatData = [System.Collections.Generic.List[PSObject]]::new()
    
    # Map of result keys to data types
    $dataTypeMap = @{
        'DHCPServers' = 'DHCPServers'
        'DHCPScopes' = 'DHCPScopes'
        'DHCPReservations' = 'DHCPReservations'
        'DHCPOptions' = 'DHCPOptions'
        'DNSServers' = 'DNSServers'
        'DNSZones' = 'DNSZones'
        'DNSRecords' = 'DNSRecords'
        'Subnets' = 'ADSubnets'
        'Sites' = 'ADSites'
    }
    
    foreach ($key in $Results.Keys) {
        if ($Results[$key] -is [array] -or $Results[$key] -is [System.Collections.Generic.List[PSObject]]) {
            if ($Results[$key].Count -gt 0) {
                $dataType = $dataTypeMap[$key]
                foreach ($item in $Results[$key]) {
                    $item | Add-Member -NotePropertyName '_DataType' -NotePropertyValue $dataType -Force
                    $flatData.Add($item)
                }
            }
        }
    }
    
    return $flatData
}

function Get-DHCPServersData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DHCPServers.csv"
    $dhcpServers = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DHCP Servers CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving DHCP servers from Active Directory" -Level "INFO"
        
        # Get DHCP servers from AD
        $domain = [System.DirectoryServices.ActiveDirectory.Domain]::GetCurrentDomain()
        $forest = $domain.Forest
        
        # Try to get authorized DHCP servers
        try {
            $dhcpServerList = Get-DhcpServerInDC -ErrorAction Stop
            
            foreach ($server in $dhcpServerList) {
                Write-MandALog "Querying DHCP server: $($server.DnsName)" -Level "INFO"
                
                try {
                    # Get server statistics
                    $serverStats = Get-DhcpServerv4Statistics -ComputerName $server.DnsName -ErrorAction Stop
                    $serverVersion = Get-DhcpServerVersion -ComputerName $server.DnsName -ErrorAction Stop
                    
                    $dhcpServers.Add([PSCustomObject]@{
                        ServerName = $server.DnsName
                        IPAddress = $server.IPAddress
                        ServerVersion = $serverVersion.MinorVersion
                        IsAuthorized = $true
                        TotalScopes = $serverStats.ScopesTotal
                        ActiveScopes = $serverStats.ScopesWithDelayConfigured
                        TotalAddresses = $serverStats.AddressesTotal
                        AddressesInUse = $serverStats.AddressesInUse
                        AddressesFree = $serverStats.AddressesFree
                        PercentInUse = $serverStats.PercentageInUse
                        TotalReservations = $serverStats.ReservationsTotal
                        LastDiscovered = Get-Date
                    })
                } catch {
                    Write-MandALog "Error querying DHCP server $($server.DnsName): $($_.Exception.Message)" -Level "WARN"
                    
                    # Add basic info if detailed query fails
                    $dhcpServers.Add([PSCustomObject]@{
                        ServerName = $server.DnsName
                        IPAddress = $server.IPAddress
                        ServerVersion = "Unknown"
                        IsAuthorized = $true
                        TotalScopes = 0
                        ActiveScopes = 0
                        TotalAddresses = 0
                        AddressesInUse = 0
                        AddressesFree = 0
                        PercentInUse = 0
                        TotalReservations = 0
                        LastDiscovered = Get-Date
                        Error = $_.Exception.Message
                    })
                }
            }
        } catch {
            Write-MandALog "Unable to retrieve DHCP servers from AD: $($_.Exception.Message)" -Level "ERROR"
        }
        
        Write-MandALog "Found $($dhcpServers.Count) DHCP servers" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dhcpServers -FilePath $outputFile
        return $dhcpServers
        
    } catch {
        Write-MandALog "Error retrieving DHCP Servers: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; IPAddress = $null; ServerVersion = $null
            IsAuthorized = $null; TotalScopes = $null; ActiveScopes = $null
            TotalAddresses = $null; AddressesInUse = $null; AddressesFree = $null
            PercentInUse = $null; TotalReservations = $null; LastDiscovered = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-DHCPScopesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DHCPScopes.csv"
    $dhcpScopes = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DHCP Scopes CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        # Get DHCP servers first
        $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
        
        foreach ($server in $dhcpServers) {
            Write-MandALog "Retrieving scopes from DHCP server: $($server.DnsName)" -Level "INFO"
            
            try {
                $scopes = Get-DhcpServerv4Scope -ComputerName $server.DnsName -ErrorAction Stop
                
                foreach ($scope in $scopes) {
                    # Get scope statistics
                    $scopeStats = Get-DhcpServerv4ScopeStatistics -ComputerName $server.DnsName -ScopeId $scope.ScopeId -ErrorAction SilentlyContinue
                    
                    $dhcpScopes.Add([PSCustomObject]@{
                        ServerName = $server.DnsName
                        ScopeId = $scope.ScopeId
                        ScopeName = $scope.Name
                        SubnetMask = $scope.SubnetMask
                        StartRange = $scope.StartRange
                        EndRange = $scope.EndRange
                        LeaseDuration = $scope.LeaseDuration
                        State = $scope.State
                        Type = $scope.Type
                        TotalAddresses = if ($scopeStats) { $scopeStats.AddressesFree + $scopeStats.AddressesInUse } else { 0 }
                        AddressesInUse = if ($scopeStats) { $scopeStats.AddressesInUse } else { 0 }
                        AddressesFree = if ($scopeStats) { $scopeStats.AddressesFree } else { 0 }
                        PercentInUse = if ($scopeStats) { $scopeStats.PercentageInUse } else { 0 }
                        ReservedAddresses = if ($scopeStats) { $scopeStats.ReservedAddress } else { 0 }
                        Description = $scope.Description
                    })
                }
            } catch {
                Write-MandALog "Error retrieving scopes from $($server.DnsName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Found $($dhcpScopes.Count) DHCP scopes" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dhcpScopes -FilePath $outputFile
        return $dhcpScopes
        
    } catch {
        Write-MandALog "Error retrieving DHCP Scopes: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; ScopeId = $null; ScopeName = $null; SubnetMask = $null
            StartRange = $null; EndRange = $null; LeaseDuration = $null; State = $null
            Type = $null; TotalAddresses = $null; AddressesInUse = $null; AddressesFree = $null
            PercentInUse = $null; ReservedAddresses = $null; Description = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-DHCPReservationsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DHCPReservations.csv"
    $dhcpReservations = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DHCP Reservations CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
        
        foreach ($server in $dhcpServers) {
            try {
                $scopes = Get-DhcpServerv4Scope -ComputerName $server.DnsName -ErrorAction Stop
                
                foreach ($scope in $scopes) {
                    try {
                        $reservations = Get-DhcpServerv4Reservation -ComputerName $server.DnsName -ScopeId $scope.ScopeId -ErrorAction Stop
                        
                        foreach ($reservation in $reservations) {
                            $dhcpReservations.Add([PSCustomObject]@{
                                ServerName = $server.DnsName
                                ScopeId = $scope.ScopeId
                                ScopeName = $scope.Name
                                IPAddress = $reservation.IPAddress
                                ClientId = $reservation.ClientId
                                Name = $reservation.Name
                                Description = $reservation.Description
                                Type = $reservation.Type
                            })
                        }
                    } catch {
                        # Scope might not have reservations
                    }
                }
            } catch {
                Write-MandALog "Error retrieving reservations from $($server.DnsName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Found $($dhcpReservations.Count) DHCP reservations" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dhcpReservations -FilePath $outputFile
        return $dhcpReservations
        
    } catch {
        Write-MandALog "Error retrieving DHCP Reservations: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; ScopeId = $null; ScopeName = $null
            IPAddress = $null; ClientId = $null; Name = $null
            Description = $null; Type = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-DHCPOptionsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DHCPOptions.csv"
    $dhcpOptions = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DHCP Options CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
        
        foreach ($server in $dhcpServers) {
            try {
                # Get server-level options
                $serverOptions = Get-DhcpServerv4OptionValue -ComputerName $server.DnsName -All -ErrorAction Stop
                
                foreach ($option in $serverOptions) {
                    $dhcpOptions.Add([PSCustomObject]@{
                        ServerName = $server.DnsName
                        Scope = "Server"
                        OptionId = $option.OptionId
                        Name = $option.Name
                        Value = ($option.Value -join "; ")
                        VendorClass = $option.VendorClass
                        UserClass = $option.UserClass
                    })
                }
                
                # Get scope-level options
                $scopes = Get-DhcpServerv4Scope -ComputerName $server.DnsName -ErrorAction Stop
                
                foreach ($scope in $scopes) {
                    try {
                        $scopeOptions = Get-DhcpServerv4OptionValue -ComputerName $server.DnsName -ScopeId $scope.ScopeId -All -ErrorAction Stop
                        
                        foreach ($option in $scopeOptions) {
                            $dhcpOptions.Add([PSCustomObject]@{
                                ServerName = $server.DnsName
                                Scope = $scope.ScopeId.ToString()
                                OptionId = $option.OptionId
                                Name = $option.Name
                                Value = ($option.Value -join "; ")
                                VendorClass = $option.VendorClass
                                UserClass = $option.UserClass
                            })
                        }
                    } catch {
                        # Scope might not have options
                    }
                }
            } catch {
                Write-MandALog "Error retrieving options from $($server.DnsName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Found $($dhcpOptions.Count) DHCP options" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dhcpOptions -FilePath $outputFile
        return $dhcpOptions
        
    } catch {
        Write-MandALog "Error retrieving DHCP Options: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; Scope = $null; OptionId = $null
            Name = $null; Value = $null; VendorClass = $null; UserClass = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-DNSServersData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DNSServers.csv"
    $dnsServers = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DNS Servers CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving DNS servers from Active Directory" -Level "INFO"
        
        # Get all DCs (they typically run DNS)
        $domainControllers = Get-ADDomainController -Filter * -ErrorAction Stop
        
        foreach ($dc in $domainControllers) {
            try {
                # Test if DNS service is running
                $dnsService = Get-Service -ComputerName $dc.HostName -Name "DNS" -ErrorAction Stop
                
                if ($dnsService) {
                    # Get DNS server configuration
                    $dnsServerConfig = Get-DnsServer -ComputerName $dc.HostName -ErrorAction Stop
                    
                    $dnsServers.Add([PSCustomObject]@{
                        ServerName = $dc.HostName
                        IPAddress = $dc.IPv4Address
                        OperatingSystem = $dc.OperatingSystem
                        IsGlobalCatalog = $dc.IsGlobalCatalog
                        IsReadOnly = $dc.IsReadOnly
                        Site = $dc.Site
                        DNSServiceStatus = $dnsService.Status
                        ServerVersion = $dnsServerConfig.ServerSetting.Version
                        RoundRobin = $dnsServerConfig.ServerSetting.RoundRobin
                        LocalNetPriority = $dnsServerConfig.ServerSetting.LocalNetPriority
                        SecureResponse = $dnsServerConfig.ServerSetting.SecureResponse
                        RecursionEnabled = $dnsServerConfig.ServerRecursion.Enable
                        Forwarders = ($dnsServerConfig.ServerForwarder.IPAddress.IPAddressToString -join "; ")
                        RootHints = $dnsServerConfig.ServerRootHint.Count
                        CacheSize = $dnsServerConfig.ServerCache.MaxKBSize
                    })
                }
            } catch {
                Write-MandALog "Error querying DNS on $($dc.HostName): $($_.Exception.Message)" -Level "WARN"
                
                # Add basic info if detailed query fails
                $dnsServers.Add([PSCustomObject]@{
                    ServerName = $dc.HostName
                    IPAddress = $dc.IPv4Address
                    OperatingSystem = $dc.OperatingSystem
                    IsGlobalCatalog = $dc.IsGlobalCatalog
                    IsReadOnly = $dc.IsReadOnly
                    Site = $dc.Site
                    DNSServiceStatus = "Unknown"
                    Error = $_.Exception.Message
                })
            }
        }
        
        Write-MandALog "Found $($dnsServers.Count) DNS servers" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dnsServers -FilePath $outputFile
        return $dnsServers
        
    } catch {
        Write-MandALog "Error retrieving DNS Servers: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ServerName = $null; IPAddress = $null; OperatingSystem = $null
            IsGlobalCatalog = $null; IsReadOnly = $null; Site = $null
            DNSServiceStatus = $null; ServerVersion = $null; RoundRobin = $null
            LocalNetPriority = $null; SecureResponse = $null; RecursionEnabled = $null
            Forwarders = $null; RootHints = $null; CacheSize = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-DNSZonesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DNSZones.csv"
    $dnsZones = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DNS Zones CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        # Get primary DNS server
        $primaryDC = Get-ADDomainController -Discover -Service "PrimaryDC" -ErrorAction SilentlyContinue
        $dnsServer = if ($primaryDC) { $primaryDC.HostName } else { $env:COMPUTERNAME }
        
        Write-MandALog "Retrieving DNS zones from server: $dnsServer" -Level "INFO"
        
        $zones = Get-DnsServerZone -ComputerName $dnsServer -ErrorAction Stop
        
        foreach ($zone in $zones) {
            $dnsZones.Add([PSCustomObject]@{
                ZoneName = $zone.ZoneName
                ZoneType = $zone.ZoneType
                IsDsIntegrated = $zone.IsDsIntegrated
                IsReverseLookupZone = $zone.IsReverseLookupZone
                IsSigned = $zone.IsSigned
                DynamicUpdate = $zone.DynamicUpdate
                ReplicationScope = $zone.ReplicationScope
                DirectoryPartitionName = $zone.DirectoryPartitionName
                IsAutoCreated = $zone.IsAutoCreated
                IsPaused = $zone.IsPaused
                IsShutdown = $zone.IsShutdown
                SecureSecondaries = $zone.SecureSecondaries
                NotifyServers = ($zone.NotifyServers -join "; ")
                MasterServers = ($zone.MasterServers -join "; ")
                LastZoneTransfer = $zone.LastZoneTransferResult
                RecordCount = (Get-DnsServerResourceRecord -ComputerName $dnsServer -ZoneName $zone.ZoneName -ErrorAction SilentlyContinue | Measure-Object).Count
            })
        }
        
        Write-MandALog "Found $($dnsZones.Count) DNS zones" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dnsZones -FilePath $outputFile
        return $dnsZones
        
    } catch {
        Write-MandALog "Error retrieving DNS Zones: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ZoneName = $null; ZoneType = $null; IsDsIntegrated = $null
            IsReverseLookupZone = $null; IsSigned = $null; DynamicUpdate = $null
            ReplicationScope = $null; DirectoryPartitionName = $null; IsAutoCreated = $null
            IsPaused = $null; IsShutdown = $null; SecureSecondaries = $null
            NotifyServers = $null; MasterServers = $null; LastZoneTransfer = $null; RecordCount = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-DNSRecordsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "DNSRecords.csv"
    $dnsRecords = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "DNS Records CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        # Get primary DNS server
        $primaryDC = Get-ADDomainController -Discover -Service "PrimaryDC" -ErrorAction SilentlyContinue
        $dnsServer = if ($primaryDC) { $primaryDC.HostName } else { $env:COMPUTERNAME }
        
        # Get all zones
        $zones = Get-DnsServerZone -ComputerName $dnsServer -ErrorAction Stop | Where-Object { -not $_.IsReverseLookupZone }
        
        # Focus on important record types to avoid overwhelming data
        $importantRecordTypes = @("A", "AAAA", "CNAME", "MX", "SRV", "TXT")
        
        foreach ($zone in $zones) {
            Write-MandALog "Processing DNS records for zone: $($zone.ZoneName)" -Level "INFO"
            
            try {
                $records = Get-DnsServerResourceRecord -ComputerName $dnsServer -ZoneName $zone.ZoneName -ErrorAction Stop |
                    Where-Object { $_.RecordType -in $importantRecordTypes }
                
                $processedCount = 0
                foreach ($record in $records) {
                    $processedCount++
                    if ($processedCount % 100 -eq 0) {
                        Write-Progress -Activity "Processing DNS Records" -Status "Zone: $($zone.ZoneName)" -PercentComplete (($processedCount / $records.Count) * 100)
                    }
                    
                    $recordData = switch ($record.RecordType) {
                        "A" { $record.RecordData.IPv4Address.IPAddressToString }
                        "AAAA" { $record.RecordData.IPv6Address.IPAddressToString }
                        "CNAME" { $record.RecordData.HostNameAlias }
                        "MX" { "$($record.RecordData.Preference) $($record.RecordData.MailExchange)" }
                        "SRV" { "$($record.RecordData.Priority) $($record.RecordData.Weight) $($record.RecordData.Port) $($record.RecordData.DomainName)" }
                        "TXT" { $record.RecordData.DescriptiveText -join " " }
                        default { "Unknown" }
                    }
                    
                    $dnsRecords.Add([PSCustomObject]@{
                        ZoneName = $zone.ZoneName
                        HostName = $record.HostName
                        RecordType = $record.RecordType
                        RecordData = $recordData
                        TimeToLive = $record.TimeToLive
                        Timestamp = $record.Timestamp
                        RecordClass = $record.RecordClass
                    })
                }
                
                Write-Progress -Activity "Processing DNS Records" -Completed
                
            } catch {
                Write-MandALog "Error retrieving records from zone $($zone.ZoneName): $($_.Exception.Message)" -Level "WARN"
            }
        }
        
        Write-MandALog "Found $($dnsRecords.Count) DNS records" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $dnsRecords -FilePath $outputFile
        return $dnsRecords
        
    } catch {
        Write-MandALog "Error retrieving DNS Records: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            ZoneName = $null; HostName = $null; RecordType = $null
            RecordData = $null; TimeToLive = $null; Timestamp = $null; RecordClass = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-ADSubnetsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ADSubnets.csv"
    $subnets = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "AD Subnets CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving AD Sites and Services subnet information" -Level "INFO"
        
        # Get AD subnets from Sites and Services
        $configNC = ([ADSI]"LDAP://RootDSE").configurationNamingContext
        $subnetContainer = [ADSI]"LDAP://CN=Subnets,CN=Sites,$configNC"
        
        $searcher = New-Object System.DirectoryServices.DirectorySearcher($subnetContainer)
        $searcher.Filter = "(objectClass=subnet)"
        $searcher.PropertiesToLoad.AddRange(@("name", "siteObject", "description", "location", "whenCreated", "whenChanged"))
        
        $results = $searcher.FindAll()
        
        foreach ($result in $results) {
            $subnet = $result.Properties
            
            # Extract site name from DN
            $siteDN = $subnet["siteobject"][0]
            $siteName = if ($siteDN) {
                if ($siteDN -match "CN=([^,]+),") { $matches[1] } else { "Unknown" }
            } else { "Not Assigned" }
            
            $subnets.Add([PSCustomObject]@{
                SubnetName = $subnet["name"][0]
                Site = $siteName
                Description = if ($subnet["description"]) { $subnet["description"][0] } else { "" }
                Location = if ($subnet["location"]) { $subnet["location"][0] } else { "" }
                Created = if ($subnet["whencreated"]) { $subnet["whencreated"][0] } else { $null }
                Modified = if ($subnet["whenchanged"]) { $subnet["whenchanged"][0] } else { $null }
            })
        }
        
        Write-MandALog "Found $($subnets.Count) AD subnets" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $subnets -FilePath $outputFile
        return $subnets
        
    } catch {
        Write-MandALog "Error retrieving AD Subnets: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            SubnetName = $null; Site = $null; Description = $null
            Location = $null; Created = $null; Modified = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

function Get-ADSitesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ADSites.csv"
    $sites = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "AD Sites CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving AD Sites information" -Level "INFO"
        
        # Get all AD sites
        $adSites = Get-ADReplicationSite -Filter * -Properties * -ErrorAction Stop
        
        foreach ($site in $adSites) {
            # Count subnets for this site
            $subnetCount = (Get-ADReplicationSubnet -Filter "Site -eq '$($site.DistinguishedName)'" -ErrorAction SilentlyContinue | Measure-Object).Count
            
            # Get site links
            $siteLinks = Get-ADReplicationSiteLink -Filter * -ErrorAction SilentlyContinue | 
                Where-Object { $_.SitesIncluded -contains $site.DistinguishedName }
            
            # Get DCs in site
            $siteDCs = Get-ADDomainController -Filter "Site -eq '$($site.Name)'" -ErrorAction SilentlyContinue
            
            $sites.Add([PSCustomObject]@{
                SiteName = $site.Name
                Description = $site.Description
                Location = $site.Location
                SubnetCount = $subnetCount
                DCCount = ($siteDCs | Measure-Object).Count
                DomainControllers = ($siteDCs.HostName -join "; ")
                SiteLinks = ($siteLinks.Name -join "; ")
                InterSiteTopologyGenerator = $site.InterSiteTopologyGenerator
                Options = $site.Options
                Created = $site.Created
                Modified = $site.Modified
                ProtectedFromAccidentalDeletion = $site.ProtectedFromAccidentalDeletion
            })
        }
        
        Write-MandALog "Found $($sites.Count) AD sites" -Level "SUCCESS"
        
        # Export to CSV
        Export-DataToCSV -Data $sites -FilePath $outputFile
        return $sites
        
    } catch {
        Write-MandALog "Error retrieving AD Sites: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            SiteName = $null; Description = $null; Location = $null
            SubnetCount = $null; DCCount = $null; DomainControllers = $null
            SiteLinks = $null; InterSiteTopologyGenerator = $null; Options = $null
            Created = $null; Modified = $null; ProtectedFromAccidentalDeletion = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        return @()
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Invoke-NetworkInfrastructureDiscovery',
    'Get-DHCPServersData',
    'Get-DHCPScopesData',
    'Get-DHCPReservationsData',
    'Get-DHCPOptionsData',
    'Get-DNSServersData',
    'Get-DNSZonesData',
    'Get-DNSRecordsData',
    'Get-ADSubnetsData',
    'Get-ADSitesData'
)
