# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Azure Service Principal Credentials Discovery Module
.DESCRIPTION
    Focused module for discovering Service Principal Credentials (secrets and certificates).
    Extracted from monolithic AzureSecurityDiscovery.psm1.
#>

Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force

function Invoke-AzureServicePrincipalCredentialsDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$true)]
        [hashtable]$Context,
        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-ModuleLog -ModuleName "AzureServicePrincipalCredentialsDiscovery" -Message "Starting Service Principal Credentials Discovery..." -Level "INFO"

    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        $allDiscoveredData = [System.Collections.ArrayList]::new()

        try {
            $appRegistrations = @()
            $appsUri = "https://graph.microsoft.com/v1.0/applications?`$select=id,appId,displayName,passwordCredentials,keyCredentials,createdDateTime,signInAudience"

            try {
                do {
                    $response = Invoke-MgGraphRequest -Uri $appsUri -Method GET
                    $appRegistrations += $response.value
                    $appsUri = $response.'@odata.nextLink'
                } while ($appsUri)
            } catch {
                Write-ModuleLog -ModuleName "AzureServicePrincipalCredentialsDiscovery" -Message "Could not enumerate App Registrations - may require Application.Read.All permission" -Level "WARNING"
                $appRegistrations = @()
            }

            foreach ($app in $appRegistrations) {
                # Process password credentials (secrets)
                foreach ($secret in $app.passwordCredentials) {
                    $expiryDate = if ($secret.endDateTime) { [DateTime]$secret.endDateTime } else { $null }
                    $startDate = if ($secret.startDateTime) { [DateTime]$secret.startDateTime } else { $null }
                    $isExpired = if ($expiryDate) { $expiryDate -lt (Get-Date) } else { $false }
                    $daysUntilExpiry = if ($expiryDate -and -not $isExpired) { ($expiryDate - (Get-Date)).Days } else { 0 }
                    $isExpiringSoon = $daysUntilExpiry -gt 0 -and $daysUntilExpiry -le 30

                    $credentialAge = if ($startDate) { ((Get-Date) - $startDate).Days } else { $null }
                    $isLongLived = $credentialAge -and $credentialAge -gt 365

                    $credData = [PSCustomObject]@{
                        ObjectType = "ServicePrincipalCredential"
                        ApplicationId = $app.id
                        AppId = $app.appId
                        ApplicationName = $app.displayName
                        CredentialType = "Secret"
                        CredentialId = $secret.keyId
                        DisplayName = $secret.displayName
                        Hint = $secret.hint
                        CertificateType = $null
                        CertificateUsage = $null
                        StartDateTime = $startDate
                        EndDateTime = $expiryDate
                        IsExpired = $isExpired
                        IsExpiringSoon = $isExpiringSoon
                        DaysUntilExpiry = $daysUntilExpiry
                        CredentialAgeDays = $credentialAge
                        IsLongLived = $isLongLived
                        SignInAudience = $app.signInAudience
                        ApplicationCreatedDateTime = $app.createdDateTime
                        _DataType = 'ServicePrincipalCredentials'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($credData)
                }

                # Process key credentials (certificates)
                foreach ($cert in $app.keyCredentials) {
                    $expiryDate = if ($cert.endDateTime) { [DateTime]$cert.endDateTime } else { $null }
                    $startDate = if ($cert.startDateTime) { [DateTime]$cert.startDateTime } else { $null }
                    $isExpired = if ($expiryDate) { $expiryDate -lt (Get-Date) } else { $false }
                    $daysUntilExpiry = if ($expiryDate -and -not $isExpired) { ($expiryDate - (Get-Date)).Days } else { 0 }
                    $isExpiringSoon = $daysUntilExpiry -gt 0 -and $daysUntilExpiry -le 30

                    $credentialAge = if ($startDate) { ((Get-Date) - $startDate).Days } else { $null }
                    $isLongLived = $credentialAge -and $credentialAge -gt 365

                    $credData = [PSCustomObject]@{
                        ObjectType = "ServicePrincipalCredential"
                        ApplicationId = $app.id
                        AppId = $app.appId
                        ApplicationName = $app.displayName
                        CredentialType = "Certificate"
                        CredentialId = $cert.keyId
                        DisplayName = $cert.displayName
                        Hint = $null
                        CertificateType = $cert.type
                        CertificateUsage = $cert.usage
                        StartDateTime = $startDate
                        EndDateTime = $expiryDate
                        IsExpired = $isExpired
                        IsExpiringSoon = $isExpiringSoon
                        DaysUntilExpiry = $daysUntilExpiry
                        CredentialAgeDays = $credentialAge
                        IsLongLived = $isLongLived
                        SignInAudience = $app.signInAudience
                        ApplicationCreatedDateTime = $app.createdDateTime
                        _DataType = 'ServicePrincipalCredentials'
                        SessionId = $SessionId
                    }
                    $null = $allDiscoveredData.Add($credData)
                }
            }

            $spCredCount = @($allDiscoveredData).Count
            $expiredCount = @($allDiscoveredData | Where-Object { $_.IsExpired }).Count
            $expiringSoonCount = @($allDiscoveredData | Where-Object { $_.IsExpiringSoon }).Count
            $Result.Metadata["ServicePrincipalCredentialCount"] = $spCredCount
            $Result.Metadata["ExpiredCredentialCount"] = $expiredCount
            $Result.Metadata["ExpiringSoonCredentialCount"] = $expiringSoonCount
            $Result.Metadata["ApplicationCount"] = @($appRegistrations).Count
            Write-ModuleLog -ModuleName "AzureServicePrincipalCredentialsDiscovery" -Message "Found $spCredCount credentials ($expiredCount expired, $expiringSoonCount expiring soon)" -Level "SUCCESS"

        } catch {
            $Result.AddError("Failed to discover Service Principal Credentials: $($_.Exception.Message)", $_.Exception, @{Section="ServicePrincipalCredentials"})
        }

        $Result.RecordCount = @($allDiscoveredData).Count
        return $allDiscoveredData | Group-Object -Property _DataType
    }

    $params = @{
        ModuleName = "AzureServicePrincipalCredentialsDiscovery"
        Configuration = $Configuration
        Context = $Context
        SessionId = $SessionId
        DiscoveryScript = $discoveryScript
        RequiredConnections = @('Graph')
    }

    return Invoke-StandardDiscovery @params
}

Export-ModuleMember -Function Invoke-AzureServicePrincipalCredentialsDiscovery
