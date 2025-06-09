function Get-TenantNameFromGraph {
    param($Context)

    try {
        Write-MandALog -Level "INFO" -Component "AutoDiscovery" -Message "Attempting to discover SharePoint tenant name from Graph API..."
        
        # Get organization details from Graph
        $orgDetails = Get-MgOrganization -Property VerifiedDomains
        if (-not $orgDetails) {
            Write-MandALog -Level "WARN" -Component "AutoDiscovery" -Message "Could not retrieve organization details from Graph."
            return $null
        }

        # Find the .onmicrosoft.com domain
        $onMicrosoftDomain = $orgDetails.VerifiedDomains | Where-Object { $_.Name -like '*.onmicrosoft.com' -and $_.IsInitial -eq $true } | Select-Object -First 1

        if ($onMicrosoftDomain) {
            # Extract the tenant name
            $tenantName = $onMicrosoftDomain.Name.Split('.')[0]
            Write-MandALog -Level "SUCCESS" -Component "AutoDiscovery" -Message "Successfully discovered tenant name: $tenantName"
            return $tenantName
        } else {
            Write-MandALog -Level "WARN" -Component "AutoDiscovery" -Message "Could not find a '.onmicrosoft.com' initial domain."
            return $null
        }
    }
    catch {
        Write-MandALog -Level "ERROR" -Component "AutoDiscovery" -Message "An error occurred while discovering tenant name: $($_.Exception.Message)"
        return $null
    }
}