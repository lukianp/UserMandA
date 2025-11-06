# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: System Enhancement
# Version: 1.0.0
# Created: 2025-08-02
# Last Modified: 2025-08-02

<#
.SYNOPSIS
    Certificate discovery module for M&A Discovery Suite
.DESCRIPTION
    Discovers SSL/TLS certificates across the network infrastructure including
    web servers, certificate stores, and certificate authorities for security
    and compliance assessment during M&A activities.
.NOTES
    Version: 1.0.0
    Author: System Enhancement
    Created: 2025-08-02
    Requires: PowerShell 5.1+, Windows Management Framework
#>

Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\ComprehensiveErrorHandling.psm1") -Force -ErrorAction SilentlyContinue

function Write-CertificateLog {
    <#
    .SYNOPSIS
        Writes log entries specific to certificate discovery.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context = @{}
    )
    
    if (Get-Command Write-ComprehensiveLog -ErrorAction SilentlyContinue) {
        Write-ComprehensiveLog -Message "[Certificate] $Message" -Level $Level -Component "CertificateDiscovery" -Context $Context
    } else {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        $color = switch ($Level) {
            'ERROR' { 'Red' }
            'WARN' { 'Yellow' }
            'SUCCESS' { 'Green' }
            'DEBUG' { 'Gray' }
            default { 'White' }
        }
        Write-Host "[$timestamp] [$Level] [Certificate] $Message" -ForegroundColor $color
    }
}

function Invoke-CertificateDiscovery {
    <#
    .SYNOPSIS
        Main certificate discovery function.
    
    .DESCRIPTION
        Discovers certificates from local and remote certificate stores,
        web servers, and certificate authorities to assess security posture
        and compliance requirements.
    
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

    Write-CertificateLog -Level "HEADER" -Message "Starting Certificate Discovery (v1.0)" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = @{
        Success = $true
        ModuleName = 'CertificateDiscovery'
        RecordCount = 0
        Errors = [System.Collections.ArrayList]::new()
        Warnings = [System.Collections.ArrayList]::new()
        Metadata = @{}
        StartTime = Get-Date
        EndTime = $null
        ExecutionId = [guid]::NewGuid().ToString()
        AddError = { param($m, $e, $c, $ht) $ht.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $ht.Success = $false }.GetNewClosure()
        AddWarning = { param($m, $c, $ht) $ht.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
    }

    try {
        # Validate context
        if (-not $Context.Paths.RawDataOutput) {
            & $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null, $result)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        
        if (-not (Test-Path $outputPath)) {
            New-Item -Path $outputPath -ItemType Directory -Force | Out-Null
        }

        $allDiscoveredData = [System.Collections.ArrayList]::new()
        
        # Discover Local Certificate Stores
        try {
            Write-CertificateLog -Level "INFO" -Message "Discovering local certificate stores..." -Context $Context
            $localCerts = Get-LocalCertificateStores -SessionId $SessionId
            if ($localCerts.Count -gt 0) {
                $localCerts | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'LocalCertificate' -Force }
                $null = $allDiscoveredData.AddRange($localCerts)
                $result.Metadata["LocalCertificateCount"] = $localCerts.Count
            }
            Write-CertificateLog -Level "SUCCESS" -Message "Discovered $($localCerts.Count) local certificates" -Context $Context
        } catch {
            & $result.AddWarning("Failed to discover local certificates: $($_.Exception.Message)", @{Section="LocalCertificates"}, $result)
        }
        
        # Discover Web Server Certificates
        try {
            Write-CertificateLog -Level "INFO" -Message "Discovering web server certificates..." -Context $Context
            $webCerts = Get-WebServerCertificates -Configuration $Configuration -SessionId $SessionId
            if ($webCerts.Count -gt 0) {
                $webCerts | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'WebServerCertificate' -Force }
                $null = $allDiscoveredData.AddRange($webCerts)
                $result.Metadata["WebServerCertificateCount"] = $webCerts.Count
            }
            Write-CertificateLog -Level "SUCCESS" -Message "Discovered $($webCerts.Count) web server certificates" -Context $Context
        } catch {
            & $result.AddWarning("Failed to discover web server certificates: $($_.Exception.Message)", @{Section="WebServerCertificates"}, $result)
        }
        
        # Discover Certificate Authority Information
        try {
            Write-CertificateLog -Level "INFO" -Message "Discovering certificate authorities..." -Context $Context
            $caInfo = Get-CertificateAuthorityInfo -SessionId $SessionId
            if ($caInfo.Count -gt 0) {
                $caInfo | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'CertificateAuthority' -Force }
                $null = $allDiscoveredData.AddRange($caInfo)
                $result.Metadata["CertificateAuthorityCount"] = $caInfo.Count
            }
            Write-CertificateLog -Level "SUCCESS" -Message "Discovered $($caInfo.Count) certificate authorities" -Context $Context
        } catch {
            & $result.AddWarning("Failed to discover certificate authorities: $($_.Exception.Message)", @{Section="CertificateAuthorities"}, $result)
        }
        
        # Discover Certificate Templates (if available)
        try {
            Write-CertificateLog -Level "INFO" -Message "Discovering certificate templates..." -Context $Context
            $templates = Get-CertificateTemplates -SessionId $SessionId
            if ($templates.Count -gt 0) {
                $templates | ForEach-Object { $_ | Add-Member -NotePropertyName '_DataType' -NotePropertyValue 'CertificateTemplate' -Force }
                $null = $allDiscoveredData.AddRange($templates)
                $result.Metadata["CertificateTemplateCount"] = $templates.Count
            }
            Write-CertificateLog -Level "SUCCESS" -Message "Discovered $($templates.Count) certificate templates" -Context $Context
        } catch {
            & $result.AddWarning("Failed to discover certificate templates: $($_.Exception.Message)", @{Section="CertificateTemplates"}, $result)
        }

        # Export data to CSV files
        if ($allDiscoveredData.Count -gt 0) {
            Write-CertificateLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $fileName = "Certificate_$dataType.csv"
                $filePath = Join-Path $outputPath $fileName
                
                # Add metadata to each record
                $group.Group | ForEach-Object {
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "CertificateDiscovery" -Force
                    $_ | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                }
                
                # Export to CSV
                $group.Group | Export-Csv -Path $filePath -NoTypeInformation -Force -Encoding UTF8
                Write-CertificateLog -Level "SUCCESS" -Message "Exported $($group.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-CertificateLog -Level "WARN" -Message "No certificate data discovered to export" -Context $Context
        }

        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $result.RecordCount
        $result.Metadata["SessionId"] = $SessionId

    } catch {
        Write-CertificateLog -Level "ERROR" -Message "Critical error: $($_.Exception.Message)" -Context $Context
        & $result.AddError("A critical error occurred during certificate discovery: $($_.Exception.Message)", $_.Exception, $null, $result)
    } finally {
        $stopwatch.Stop()
        $result.EndTime = Get-Date
        Write-CertificateLog -Level "HEADER" -Message "Certificate discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

function Get-LocalCertificateStores {
    <#
    .SYNOPSIS
        Discovers certificates from local certificate stores.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $certificates = @()
    
    try {
        # Define certificate store locations to scan
        $storeLocations = @(
            @{Location = "CurrentUser"; Name = "Personal"},
            @{Location = "CurrentUser"; Name = "TrustedPeople"},
            @{Location = "CurrentUser"; Name = "CA"},
            @{Location = "CurrentUser"; Name = "Root"},
            @{Location = "LocalMachine"; Name = "Personal"},
            @{Location = "LocalMachine"; Name = "TrustedPeople"},
            @{Location = "LocalMachine"; Name = "CA"},
            @{Location = "LocalMachine"; Name = "Root"},
            @{Location = "LocalMachine"; Name = "WebHosting"}
        )
        
        foreach ($storeInfo in $storeLocations) {
            try {
                $store = Get-ChildItem -Path "Cert:\$($storeInfo.Location)\$($storeInfo.Name)" -ErrorAction SilentlyContinue
                
                foreach ($cert in $store) {
                    $daysToExpiry = ($cert.NotAfter - (Get-Date)).Days
                    $keyUsage = if ($cert.Extensions["2.5.29.15"]) { $cert.Extensions["2.5.29.15"].KeyUsages } else { "Unknown" }
                    $enhancedKeyUsage = if ($cert.Extensions["2.5.29.37"]) { 
                        ($cert.Extensions["2.5.29.37"].EnhancedKeyUsages | ForEach-Object { $_.FriendlyName }) -join '; '
                    } else { "Unknown" }
                    
                    $certificates += [PSCustomObject]@{
                        StoreLocation = $storeInfo.Location
                        StoreName = $storeInfo.Name
                        Subject = $cert.Subject
                        Issuer = $cert.Issuer
                        SerialNumber = $cert.SerialNumber
                        Thumbprint = $cert.Thumbprint
                        NotBefore = $cert.NotBefore
                        NotAfter = $cert.NotAfter
                        DaysToExpiry = $daysToExpiry
                        IsExpired = $daysToExpiry -lt 0
                        IsExpiringSoon = $daysToExpiry -lt 30 -and $daysToExpiry -gt 0
                        SignatureAlgorithm = $cert.SignatureAlgorithm.FriendlyName
                        KeyAlgorithm = $cert.PublicKey.Oid.FriendlyName
                        KeySize = $cert.PublicKey.Key.KeySize
                        Version = $cert.Version
                        HasPrivateKey = $cert.HasPrivateKey
                        KeyUsage = $keyUsage
                        EnhancedKeyUsage = $enhancedKeyUsage
                        FriendlyName = $cert.FriendlyName
                        Archived = $cert.Archived
                        SubjectAlternativeNames = if ($cert.Extensions["2.5.29.17"]) {
                            ($cert.Extensions["2.5.29.17"].Format($false) -split "`n" | ForEach-Object { $_.Trim() }) -join '; '
                        } else { "" }
                        SessionId = $SessionId
                    }
                }
            } catch {
                Write-CertificateLog -Level "WARN" -Message "Failed to read certificate store $($storeInfo.Location)\$($storeInfo.Name): $($_.Exception.Message)"
            }
        }
        
    } catch {
        Write-CertificateLog -Level "ERROR" -Message "Failed to discover local certificate stores: $($_.Exception.Message)"
    }
    
    return $certificates
}

function Get-WebServerCertificates {
    <#
    .SYNOPSIS
        Discovers SSL/TLS certificates from web servers.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Configuration,
        [string]$SessionId
    )
    
    $webCertificates = @()
    
    try {
        # Get list of web servers/URLs to check
        $webServers = @()
        
        # Check IIS bindings if available
        if (Get-Module -Name IISAdministration -ListAvailable) {
            Import-Module IISAdministration -ErrorAction SilentlyContinue
            try {
                $bindings = Get-IISSiteBinding | Where-Object { $_.Protocol -eq "https" }
                foreach ($binding in $bindings) {
                    $webServers += @{
                        Server = "$($binding.bindingInformation.Split(':')[0]):$($binding.bindingInformation.Split(':')[1])"
                        Port = $binding.bindingInformation.Split(':')[1]
                        SiteName = $binding.ItemXPath.Split("'")[1]
                        Source = "IIS"
                    }
                }
            } catch {
                Write-CertificateLog -Level "WARN" -Message "Failed to get IIS bindings: $($_.Exception.Message)"
            }
        }
        
        # Add configured web servers from configuration
        if ($Configuration.certificateDiscovery.webServers) {
            foreach ($server in $Configuration.certificateDiscovery.webServers) {
                $webServers += @{
                    Server = $server.hostname
                    Port = $server.port
                    SiteName = $server.name
                    Source = "Configuration"
                }
            }
        }
        
        # Default common web servers to check
        $defaultServers = @(
            @{Server = "localhost"; Port = 443; SiteName = "localhost"; Source = "Default"},
            @{Server = $env:COMPUTERNAME; Port = 443; SiteName = $env:COMPUTERNAME; Source = "Default"}
        )
        $webServers += $defaultServers
        
        foreach ($webServer in $webServers) {
            try {
                $cert = Get-WebServerCertificate -Server $webServer.Server -Port $webServer.Port
                if ($cert) {
                    $daysToExpiry = ($cert.NotAfter - (Get-Date)).Days
                    
                    $webCertificates += [PSCustomObject]@{
                        Server = $webServer.Server
                        Port = $webServer.Port
                        SiteName = $webServer.SiteName
                        Source = $webServer.Source
                        Subject = $cert.Subject
                        Issuer = $cert.Issuer
                        SerialNumber = $cert.SerialNumber
                        Thumbprint = $cert.Thumbprint
                        NotBefore = $cert.NotBefore
                        NotAfter = $cert.NotAfter
                        DaysToExpiry = $daysToExpiry
                        IsExpired = $daysToExpiry -lt 0
                        IsExpiringSoon = $daysToExpiry -lt 30 -and $daysToExpiry -gt 0
                        SignatureAlgorithm = $cert.SignatureAlgorithm.FriendlyName
                        KeyAlgorithm = $cert.PublicKey.Oid.FriendlyName
                        KeySize = $cert.PublicKey.Key.KeySize
                        Version = $cert.Version
                        SubjectAlternativeNames = if ($cert.Extensions["2.5.29.17"]) {
                            ($cert.Extensions["2.5.29.17"].Format($false) -split "`n" | ForEach-Object { $_.Trim() }) -join '; '
                        } else { "" }
                        SessionId = $SessionId
                    }
                }
            } catch {
                Write-CertificateLog -Level "DEBUG" -Message "Could not retrieve certificate from $($webServer.Server):$($webServer.Port): $($_.Exception.Message)"
            }
        }
        
    } catch {
        Write-CertificateLog -Level "ERROR" -Message "Failed to discover web server certificates: $($_.Exception.Message)"
    }
    
    return $webCertificates
}

function Get-WebServerCertificate {
    <#
    .SYNOPSIS
        Retrieves SSL certificate from a specific web server.
    #>
    [CmdletBinding()]
    param(
        [string]$Server,
        [int]$Port = 443
    )
    
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.ReceiveTimeout = 5000
        $tcpClient.SendTimeout = 5000
        
        $tcpClient.Connect($Server, $Port)
        $tcpStream = $tcpClient.GetStream()
        
        $sslStream = New-Object System.Net.Security.SslStream($tcpStream, $false, {$true})
        $sslStream.AuthenticateAsClient($Server)
        
        $certificate = $sslStream.RemoteCertificate
        $cert2 = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certificate)
        
        $sslStream.Close()
        $tcpStream.Close()
        $tcpClient.Close()
        
        return $cert2
        
    } catch {
        # Return null if certificate cannot be retrieved
        return $null
    }
}

function Get-CertificateAuthorityInfo {
    <#
    .SYNOPSIS
        Discovers certificate authority information.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $caInfo = @()
    
    try {
        # Get Enterprise CA information if available
        if (Get-Module -Name ADCS-Administration -ListAvailable) {
            Import-Module ADCS-Administration -ErrorAction SilentlyContinue
            try {
                $cas = Get-CertificationAuthority -ErrorAction SilentlyContinue
                foreach ($ca in $cas) {
                    $caInfo += [PSCustomObject]@{
                        Name = $ca.Name
                        Type = "Enterprise CA"
                        ConfigString = $ca.ConfigString
                        DisplayName = $ca.DisplayName
                        ComputerName = $ca.ComputerName
                        Status = $ca.Status
                        Version = $ca.Version
                        SessionId = $SessionId
                    }
                }
            } catch {
                Write-CertificateLog -Level "DEBUG" -Message "ADCS module available but no Enterprise CAs found"
            }
        }
        
        # Get trusted root CAs
        $rootCAs = Get-ChildItem -Path "Cert:\LocalMachine\Root"
        $caInfo += [PSCustomObject]@{
            Name = "Trusted Root Certification Authorities"
            Type = "Root CA Store"
            CertificateCount = $rootCAs.Count
            ExpiringWithin30Days = ($rootCAs | Where-Object { ($_.NotAfter - (Get-Date)).Days -lt 30 -and ($_.NotAfter - (Get-Date)).Days -gt 0 }).Count
            ExpiredCertificates = ($rootCAs | Where-Object { $_.NotAfter -lt (Get-Date) }).Count
            SessionId = $SessionId
        }
        
        # Get intermediate CAs
        $intermediateCAs = Get-ChildItem -Path "Cert:\LocalMachine\CA"
        $caInfo += [PSCustomObject]@{
            Name = "Intermediate Certification Authorities"
            Type = "Intermediate CA Store"
            CertificateCount = $intermediateCAs.Count
            ExpiringWithin30Days = ($intermediateCAs | Where-Object { ($_.NotAfter - (Get-Date)).Days -lt 30 -and ($_.NotAfter - (Get-Date)).Days -gt 0 }).Count
            ExpiredCertificates = ($intermediateCAs | Where-Object { $_.NotAfter -lt (Get-Date) }).Count
            SessionId = $SessionId
        }
        
    } catch {
        Write-CertificateLog -Level "ERROR" -Message "Failed to discover certificate authority information: $($_.Exception.Message)"
    }
    
    return $caInfo
}

function Get-CertificateTemplates {
    <#
    .SYNOPSIS
        Discovers certificate templates from Active Directory.
    #>
    [CmdletBinding()]
    param([string]$SessionId)
    
    $templates = @()
    
    try {
        # Check if we can access AD certificate templates
        if (Get-Module -Name ActiveDirectory -ListAvailable) {
            Import-Module ActiveDirectory -ErrorAction SilentlyContinue
            try {
                $domain = Get-ADDomain -ErrorAction Stop
                $configNC = (Get-ADRootDSE).configurationNamingContext
                $templatePath = "CN=Certificate Templates,CN=Public Key Services,CN=Services,$configNC"
                
                $adTemplates = Get-ADObject -SearchBase $templatePath -Filter "objectClass -eq 'pKICertificateTemplate'" -Properties *
                
                foreach ($template in $adTemplates) {
                    $templates += [PSCustomObject]@{
                        Name = $template.Name
                        DisplayName = $template.DisplayName
                        TemplateOID = $template.'msPKI-Cert-Template-OID'
                        Version = $template.Revision
                        ValidityPeriod = $template.'pKIDefaultKeySpec'
                        KeyUsage = $template.'pKIKeyUsage'
                        ExtendedKeyUsage = ($template.'pKIExtendedKeyUsage' -join '; ')
                        EnrollmentFlags = $template.'msPKI-Enrollment-Flag'
                        SubjectNameFlags = $template.'msPKI-Subject-Name-Flag'
                        PrivateKeyFlags = $template.'msPKI-Private-Key-Flag'
                        MinimalKeySize = $template.'msPKI-Minimal-Key-Size'
                        Created = $template.whenCreated
                        Modified = $template.whenChanged
                        SessionId = $SessionId
                    }
                }
            } catch {
                Write-CertificateLog -Level "DEBUG" -Message "Cannot access certificate templates: $($_.Exception.Message)"
            }
        }
        
    } catch {
        Write-CertificateLog -Level "ERROR" -Message "Failed to discover certificate templates: $($_.Exception.Message)"
    }
    
    return $templates
}

# Export functions
Export-ModuleMember -Function Invoke-CertificateDiscovery