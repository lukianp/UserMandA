# -*- coding: utf-8-bom -*-
<#
.SYNOPSIS
    Manages connections to Azure services
#>

function Initialize-AllConnections {
    param(
        [hashtable]$Configuration,
        $AuthContext
    )
    
    $connections = @{}
    
    # Connect to Microsoft Graph
    try {
        Connect-MgGraph -ClientId $AuthContext.ClientId `
            -TenantId $AuthContext.TenantId `
            -ClientSecretCredential $AuthContext.ClientSecret `
            -NoWelcome -ErrorAction Stop
        $connections['MicrosoftGraph'] = $true
    } catch {
        $connections['MicrosoftGraph'] = @{Connected = $false; Error = $_.Exception.Message}
    }
    
    # Add other service connections as needed
    
    return $connections
}

function Disconnect-AllServices {
    try {
        if (Get-Command Disconnect-MgGraph -ErrorAction SilentlyContinue) {
            Disconnect-MgGraph -ErrorAction SilentlyContinue
        }
    } catch {
        # Ignore disconnect errors
    }
}

Export-ModuleMember -Function Initialize-AllConnections, Disconnect-AllServices