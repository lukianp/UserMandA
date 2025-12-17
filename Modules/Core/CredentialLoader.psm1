# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 2.0.0
# Created: 2025-08-03
# Last Modified: 2025-12-17

<#
.SYNOPSIS
    Credential loader for M&A Discovery Suite
.DESCRIPTION
    Loads credentials from the company profile's credentials configuration file.
    Supports the credential_summary.json + DPAPI-encrypted discoverycredentials.config format.
.NOTES
    Version: 2.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-08-03
    Updated: 2025-12-17 - Fixed to correctly handle DPAPI-encrypted credentials
    Requires: PowerShell 5.1+
#>

function Get-CompanyCredentials {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$CompanyName,

        [Parameter(Mandatory=$false)]
        [string]$CredentialsPath
    )

    try {
        Write-Verbose "[Get-CompanyCredentials] Loading credentials for company: $CompanyName"

        # Import security module for encrypted credential support
        Import-Module -Name "$PSScriptRoot\CredentialSecurity.psm1" -Force -ErrorAction SilentlyContinue

        # Use secure credential loading if available, fallback to basic loading
        if (Get-Command Get-SecureCompanyCredentials -ErrorAction SilentlyContinue) {
            Write-Verbose "[Get-CompanyCredentials] Using Get-SecureCompanyCredentials"
            return Get-SecureCompanyCredentials -CompanyName $CompanyName -CredentialsPath $CredentialsPath
        }

        # Fallback to basic credential loading
        # If no path provided, use default company profile path
        if (-not $CredentialsPath) {
            # Try both possible path structures for credential_summary.json
            $primarySummaryPath = "c:\discoverydata\$CompanyName\Credentials\credential_summary.json"
            $fallbackSummaryPath = "c:\discoverydata\Profiles\$CompanyName\Credentials\credential_summary.json"

            if (Test-Path $primarySummaryPath) {
                $summaryPath = $primarySummaryPath
            } elseif (Test-Path $fallbackSummaryPath) {
                $summaryPath = $fallbackSummaryPath
            } else {
                throw "Credential summary file not found at: $primarySummaryPath or $fallbackSummaryPath"
            }
        } else {
            # If path provided, assume it's the directory containing credential files
            $summaryPath = Join-Path $CredentialsPath "credential_summary.json"
            if (-not (Test-Path $summaryPath)) {
                throw "Credential summary file not found: $summaryPath"
            }
        }

        Write-Verbose "[Get-CompanyCredentials] Loading credential summary from: $summaryPath"

        # Load credential summary JSON
        $summary = Get-Content -Path $summaryPath -Raw | ConvertFrom-Json

        # Validate required fields in summary
        if (-not $summary.TenantId) {
            throw "TenantId not found in credential summary"
        }

        if (-not $summary.ClientId) {
            throw "ClientId not found in credential summary"
        }

        if (-not $summary.CredentialFile) {
            throw "CredentialFile path not found in credential summary"
        }

        # Check if encrypted credential file exists
        if (-not (Test-Path $summary.CredentialFile)) {
            throw "Encrypted credential file not found: $($summary.CredentialFile)"
        }

        Write-Verbose "[Get-CompanyCredentials] Loading DPAPI-encrypted secret from: $($summary.CredentialFile)"

        # Read the DPAPI-encrypted client secret
        try {
            # The file contains a DPAPI-encrypted string (created with ConvertFrom-SecureString)
            $encryptedSecret = Get-Content -Path $summary.CredentialFile -Raw

            # Decrypt using DPAPI (ConvertTo-SecureString decrypts DPAPI-protected strings)
            $secureSecret = $encryptedSecret | ConvertTo-SecureString

            # Convert SecureString to plain text for use in API calls
            $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureSecret)
            $clientSecret = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
            [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

            Write-Verbose "[Get-CompanyCredentials] Successfully decrypted client secret"
        }
        catch {
            throw "Failed to decrypt client secret: $($_.Exception.Message). The credential may have been encrypted by a different user or machine."
        }

        # Return standardized credential object
        $credentialObject = @{
            TenantId = $summary.TenantId
            ClientId = $summary.ClientId
            ClientSecret = $clientSecret
            Domain = $summary.Domain
            Created = $summary.Created
            CredentialFile = $summary.CredentialFile
            IsEncrypted = $true
        }

        Write-Verbose "[Get-CompanyCredentials] Credentials loaded successfully"
        Write-Verbose "[Get-CompanyCredentials] TenantId: $($summary.TenantId)"
        Write-Verbose "[Get-CompanyCredentials] ClientId: $($summary.ClientId)"
        Write-Verbose "[Get-CompanyCredentials] Domain: $($summary.Domain)"

        return $credentialObject
    }
    catch {
        Write-Error "Failed to load credentials for company '$CompanyName': $($_.Exception.Message)"
        throw
    }
}

function Test-CredentialExpiry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Credentials
    )

    try {
        if (-not $Credentials.ExpiryDate) {
            return @{ Valid = $true; Message = "No expiry date specified" }
        }

        $expiryDate = [DateTime]::Parse($Credentials.ExpiryDate)
        $daysUntilExpiry = ($expiryDate - [DateTime]::Now).TotalDays

        if ($daysUntilExpiry -le 0) {
            return @{ Valid = $false; Message = "Credentials expired on $($Credentials.ExpiryDate)" }
        }

        if ($daysUntilExpiry -le 30) {
            return @{ Valid = $true; Warning = $true; Message = "Credentials expire in $([Math]::Round($daysUntilExpiry)) days" }
        }

        return @{ Valid = $true; Message = "Credentials valid for $([Math]::Round($daysUntilExpiry)) days" }
    }
    catch {
        return @{ Valid = $false; Message = "Failed to validate expiry: $($_.Exception.Message)" }
    }
}

function ConvertTo-SecureCredentials {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Credentials
    )

    try {
        return @{
            TenantId = $Credentials.TenantId
            ClientId = $Credentials.ClientId
            ClientSecret = ConvertTo-SecureString -String $Credentials.ClientSecret -AsPlainText -Force
            ApplicationName = $Credentials.ApplicationName
            ExpiryDate = $Credentials.ExpiryDate
        }
    }
    catch {
        Write-Error "Failed to convert credentials to secure format: $($_.Exception.Message)"
        throw
    }
}

Export-ModuleMember -Function Get-CompanyCredentials, Test-CredentialExpiry, ConvertTo-SecureCredentials

Write-Host "[CredentialLoader.psm1] Credential loader module loaded (v2.0.0 - DPAPI support)" -ForegroundColor Green
