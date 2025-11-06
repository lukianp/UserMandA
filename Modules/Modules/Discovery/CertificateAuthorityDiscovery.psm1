# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Certificate Authority Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Comprehensive discovery of PKI infrastructure including Certificate Authorities, certificate templates,
    issued certificates, certificate stores, expiring certificates, and trust chains. Provides detailed
    visibility into the organization's public key infrastructure for security and compliance assessments.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, ADCS PowerShell module (optional), Certificate management access
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\UnifiedErrorHandling.psm1") -Force

function Invoke-CertificateAuthorityDiscovery {
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
        
        # Check if ADCS module is available
        $adcsAvailable = $false
        try {
            if (Get-Module -ListAvailable -Name ADCS-*) {
                Import-Module ADCS-Administration -Force -ErrorAction SilentlyContinue
                $adcsAvailable = $true
                Write-ModuleLog -ModuleName "CertificateAuthority" -Message "ADCS module loaded successfully" -Level "SUCCESS"
            }
        } catch {
            Write-ModuleLog -ModuleName "CertificateAuthority" -Message "ADCS module not available, using alternative discovery methods" -Level "WARN"
        }
        
        # Discover Certificate Authorities
        try {
            Write-ModuleLog -ModuleName "CertificateAuthority" -Message "Discovering Certificate Authorities..." -Level "INFO"
            
            # Method 1: Active Directory discovery
            $certificateAuthorities = @()
            
            try {
                # Find CA servers in AD
                $adSearcher = [adsisearcher]"(&(objectClass=computer)(servicePrincipalName=*ADCS*))"
                $adResults = $adSearcher.FindAll()
                
                foreach ($result in $adResults) {
                    if ($result -and $result.Properties -and $result.Properties["name"]) {
                        $computerName = $result.Properties["name"][0]
                        $dnsHostName = if ($result.Properties["dnshostname"]) { $result.Properties["dnshostname"][0] } else { $computerName }
                    } else {
                        Write-ModuleLog -ModuleName "CertificateAuthority" -Message "AD result missing required properties, skipping" -Level "DEBUG"
                        continue
                    }
                    
                    $certificateAuthorities += @{
                        Name = $dnsHostName
                        ComputerName = $computerName
                        DiscoveryMethod = "ActiveDirectory"
                        Type = "Enterprise CA"
                    }
                }
            } catch {
                Write-ModuleLog -ModuleName "CertificateAuthority" -Message "AD-based CA discovery failed: $($_.Exception.Message)" -Level "DEBUG"
            }
            
            # Method 2: Registry-based discovery on local machine
            try {
                $caRegistryPath = "HKLM:\SOFTWARE\Microsoft\Cryptography\Services"
                if (Test-Path $caRegistryPath) {
                    $caServices = Get-ChildItem $caRegistryPath -ErrorAction SilentlyContinue
                    foreach ($service in $caServices) {
                        if ($service.Name -match "CertSvc") {
                            $certificateAuthorities += @{
                                Name = $env:COMPUTERNAME
                                ComputerName = $env:COMPUTERNAME
                                DiscoveryMethod = "LocalRegistry"
                                Type = "Local CA"
                                ServiceName = $service.PSChildName
                            }
                        }
                    }
                }
            } catch {
                Write-ModuleLog -ModuleName "CertificateAuthority" -Message "Registry-based CA discovery failed: $($_.Exception.Message)" -Level "DEBUG"
            }
            
            # Method 3: Network discovery (common CA ports)
            try {
                Write-ModuleLog -ModuleName "CertificateAuthority" -Message "Performing network scan for CA services..." -Level "INFO"
                
                # Get domain controllers (common CA locations)
                $domainControllers = @()
                try {
                    $domain = [System.DirectoryServices.ActiveDirectory.Domain]::GetCurrentDomain()
                    $domainControllers = $domain.DomainControllers | ForEach-Object { $_.Name }
                } catch {
                    # Fallback to environment variable
                    if ($env:LOGONSERVER) {
                        $domainControllers = @($env:LOGONSERVER -replace '\\\\', '')
                    }
                }
                
                foreach ($dc in $domainControllers) {
                    # Test for CA web enrollment (port 80/443)
                    $caWebPorts = @(80, 443)
                    foreach ($port in $caWebPorts) {
                        try {
                            $connection = Test-NetConnection -ComputerName $dc -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
                            if ($connection) {
                                # Check for CA web enrollment
                                try {
                                    $webRequest = Invoke-WebRequest -Uri "http://$dc/certsrv" -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
                                    if ($webRequest.Content -match "Certificate Services|certsrv") {
                                        $certificateAuthorities += @{
                                            Name = $dc
                                            ComputerName = $dc
                                            DiscoveryMethod = "WebEnrollment"
                                            Type = "Enterprise CA"
                                            WebEnrollmentPort = $port
                                        }
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
                Write-ModuleLog -ModuleName "CertificateAuthority" -Message "Network-based CA discovery failed: $($_.Exception.Message)" -Level "DEBUG"
            }
            
            # Remove duplicates
            $certificateAuthorities = $certificateAuthorities | Sort-Object Name -Unique
            
            Write-ModuleLog -ModuleName "CertificateAuthority" -Message "Found $($certificateAuthorities.Count) Certificate Authorities" -Level "SUCCESS"
            
            # Create CA objects
            foreach ($ca in $certificateAuthorities) {
                $caObj = [PSCustomObject]@{
                    # Identity
                    Name = $ca.Name
                    ComputerName = $ca.ComputerName
                    Type = $ca.Type
                    DiscoveryMethod = $ca.DiscoveryMethod
                    
                    # Configuration
                    WebEnrollmentPort = $ca.WebEnrollmentPort
                    ServiceName = $ca.ServiceName
                    
                    # Status
                    Status = "Discovered"
                    LastChecked = Get-Date
                    
                    _DataType = "CertificateAuthority"
                }
                
                $null = $allDiscoveredData.Add($caObj)
            }
            
        } catch {
            $Result.AddError("Failed to discover Certificate Authorities: $($_.Exception.Message)", $_.Exception, @{Section="CertificateAuthorities"})
        }
        
        # Discover Certificate Templates
        try {
            Write-ModuleLog -ModuleName "CertificateAuthority" -Message "Discovering Certificate Templates..." -Level "INFO"
            
            # Get certificate templates from AD
            $templatesPath = "LDAP://CN=Certificate Templates,CN=Public Key Services,CN=Services,CN=Configuration," + ([ADSI]"LDAP://RootDSE").defaultNamingContext
            
            try {
                $templatesContainer = [ADSI]$templatesPath
                $templates = $templatesContainer.Children | Where-Object { $_.Class -eq "pKICertificateTemplate" }
                
                foreach ($template in $templates) {
                    if ($template -and $template.Properties) {
                        $templateObj = [PSCustomObject]@{
                            # Identity
                            Name = if ($template.Properties["name"]) { $template.Properties["name"][0] } else { "Unknown" }
                            DisplayName = if ($template.Properties["displayName"]) { $template.Properties["displayName"][0] } else { "Unknown" }
                            CN = if ($template.Properties["cn"]) { $template.Properties["cn"][0] } else { "Unknown" }

                            # Configuration
                            TemplateOID = if ($template.Properties["msPKI-Cert-Template-OID"]) { $template.Properties["msPKI-Cert-Template-OID"][0] } else { "" }
                            Version = if ($template.Properties["revision"]) { $template.Properties["revision"][0] } else { "" }
                            ValidityPeriod = if ($template.Properties["pKIDefaultKeySpec"]) { $template.Properties["pKIDefaultKeySpec"][0] } else { "" }

                            # Security
                            EnrollmentFlags = if ($template.Properties["msPKI-Enrollment-Flag"]) { $template.Properties["msPKI-Enrollment-Flag"][0] } else { "" }
                            PrivateKeyFlags = if ($template.Properties["msPKI-Private-Key-Flag"]) { $template.Properties["msPKI-Private-Key-Flag"][0] } else { "" }
                            KeySpec = if ($template.Properties["pKIDefaultKeySpec"]) { $template.Properties["pKIDefaultKeySpec"][0] } else { "" }

                            # Usage
                            KeyUsage = if ($template.Properties["pKIKeyUsage"]) { $template.Properties["pKIKeyUsage"][0] } else { "" }
                            ApplicationPolicies = if ($template.Properties["msPKI-Certificate-Application-Policy"]) { ($template.Properties["msPKI-Certificate-Application-Policy"] -join ';') } else { "" }

                            # Lifecycle
                            WhenCreated = if ($template.Properties["whenCreated"]) { $template.Properties["whenCreated"][0] } else { [DateTime]::MinValue }
                            WhenChanged = if ($template.Properties["whenChanged"]) { $template.Properties["whenChanged"][0] } else { [DateTime]::MinValue }

                            _DataType = "CertificateTemplate"
                        }
                    } else {
                        Write-ModuleLog -ModuleName "CertificateAuthority" -Message "Template missing Properties, skipping" -Level "DEBUG"
                        continue
                    }
                    
                    $null = $allDiscoveredData.Add($templateObj)
                }
                
                Write-ModuleLog -ModuleName "CertificateAuthority" -Message "Discovered $($templates.Count) certificate templates" -Level "SUCCESS"
                
            } catch {
                Write-ModuleLog -ModuleName "CertificateAuthority" -Message "Certificate template discovery failed: $($_.Exception.Message)" -Level "ERROR"
            }
            
        } catch {
            $Result.AddWarning("Failed to discover Certificate Templates: $($_.Exception.Message)", @{Section="CertificateTemplates"})
        }
        
        # Discover Certificates in local stores
        try {
            Write-ModuleLog -ModuleName "CertificateAuthority" -Message "Discovering certificates in local stores..." -Level "INFO"
            
            $certificateStores = @("My", "Root", "CA", "TrustedPeople", "TrustedPublisher")
            
            foreach ($storeName in $certificateStores) {
                try {
                    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store($storeName, "LocalMachine")
                    $store.Open("ReadOnly")
                    
                    foreach ($cert in $store.Certificates) {
                        $certObj = [PSCustomObject]@{
                            # Identity
                            Subject = $cert.Subject
                            Issuer = $cert.Issuer
                            SerialNumber = $cert.SerialNumber
                            Thumbprint = $cert.Thumbprint
                            
                            # Store Information
                            StoreName = $storeName
                            StoreLocation = "LocalMachine"
                            
                            # Validity
                            NotBefore = $cert.NotBefore
                            NotAfter = $cert.NotAfter
                            IsExpired = $cert.NotAfter -lt (Get-Date)
                            ExpiresInDays = ([DateTime]$cert.NotAfter - (Get-Date)).Days
                            
                            # Key Information
                            KeyAlgorithm = $cert.PublicKey.Oid.FriendlyName
                            KeySize = $cert.PublicKey.Key.KeySize
                            SignatureAlgorithm = $cert.SignatureAlgorithm.FriendlyName
                            
                            # Extensions
                            Extensions = ($cert.Extensions | ForEach-Object { $_.Oid.FriendlyName }) -join ';'
                            
                            # Usage
                            HasPrivateKey = $cert.HasPrivateKey
                            
                            _DataType = "Certificate"
                        }
                        
                        $null = $allDiscoveredData.Add($certObj)
                    }
                    
                    $store.Close()
                    
                } catch {
                    Write-ModuleLog -ModuleName "CertificateAuthority" -Message "Failed to read certificate store $storeName`: $($_.Exception.Message)" -Level "DEBUG"
                }
            }
            
        } catch {
            $Result.AddWarning("Failed to discover certificates: $($_.Exception.Message)", @{Section="Certificates"})
        }
        
        # Discover Expiring Certificates
        try {
            Write-ModuleLog -ModuleName "CertificateAuthority" -Message "Analyzing certificate expiration..." -Level "INFO"
            
            $expiringCertificates = $allDiscoveredData | Where-Object { 
                $_._DataType -eq "Certificate" -and 
                $_.ExpiresInDays -le 90 -and 
                $_.ExpiresInDays -gt 0
            }
            
            foreach ($cert in $expiringCertificates) {
                $expiringObj = [PSCustomObject]@{
                    Subject = $cert.Subject
                    Issuer = $cert.Issuer
                    Thumbprint = $cert.Thumbprint
                    StoreName = $cert.StoreName
                    ExpiresInDays = $cert.ExpiresInDays
                    NotAfter = $cert.NotAfter
                    RiskLevel = if ($cert.ExpiresInDays -le 30) { "High" } elseif ($cert.ExpiresInDays -le 60) { "Medium" } else { "Low" }
                    _DataType = "ExpiringCertificate"
                }
                
                $null = $allDiscoveredData.Add($expiringObj)
            }
            
            Write-ModuleLog -ModuleName "CertificateAuthority" -Message "Found $($expiringCertificates.Count) expiring certificates" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to analyze expiring certificates: $($_.Exception.Message)", @{Section="ExpiringCertificates"})
        }
        
        # Export discovered data
        if ($allDiscoveredData.Count -gt 0) {
            Write-ModuleLog -ModuleName "CertificateAuthority" -Message "Exporting $($allDiscoveredData.Count) certificate records..." -Level "INFO"
            
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $fileName = switch ($group.Name) {
                    'CertificateAuthority' { 'CA_CertificateAuthorities.csv' }
                    'CertificateTemplate' { 'CA_CertificateTemplates.csv' }
                    'Certificate' { 'CA_Certificates.csv' }
                    'ExpiringCertificate' { 'CA_ExpiringCertificates.csv' }
                    default { "CA_$($group.Name).csv" }
                }
                
                Export-DiscoveryResults -Data $group.Group `
                    -FileName $fileName `
                    -OutputPath $Context.Paths.RawDataOutput `
                    -ModuleName "CertificateAuthority" `
                    -SessionId $SessionId
            }
            
            # Create summary report
            $summaryData = @{
                CertificateAuthorities = ($allDiscoveredData | Where-Object { $_._DataType -eq 'CertificateAuthority' }).Count
                CertificateTemplates = ($allDiscoveredData | Where-Object { $_._DataType -eq 'CertificateTemplate' }).Count
                TotalCertificates = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Certificate' }).Count
                ExpiringCertificates = ($allDiscoveredData | Where-Object { $_._DataType -eq 'ExpiringCertificate' }).Count
                ExpiredCertificates = ($allDiscoveredData | Where-Object { $_._DataType -eq 'Certificate' -and $_.IsExpired }).Count
                CertificatesExpiring30Days = ($allDiscoveredData | Where-Object { $_._DataType -eq 'ExpiringCertificate' -and $_.ExpiresInDays -le 30 }).Count
                TotalRecords = $allDiscoveredData.Count
                DiscoveryDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                SessionId = $SessionId
            }
            
            $summaryData | ConvertTo-Json -Depth 3 | Out-File (Join-Path $Context.Paths.RawDataOutput "CADiscoverySummary.json") -Encoding UTF8
        }
        
        return $allDiscoveredData
    }
    
    # Execute using base module
    return Start-DiscoveryModule -ModuleName "CertificateAuthority" `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @() `
        -DiscoveryScript $discoveryScript
}

Export-ModuleMember -Function Invoke-CertificateAuthorityDiscovery