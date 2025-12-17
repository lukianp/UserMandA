# Fix ActiveDirectoryDiscovery.psm1 to use credentials from $Configuration

$sourcePath = "C:\enterprisediscovery\Modules\Discovery\ActiveDirectoryDiscovery.psm1"
$backupPath = "C:\enterprisediscovery\Modules\Discovery\ActiveDirectoryDiscovery.psm1.backup"

# Create backup
Write-Host "[INFO] Creating backup..." -ForegroundColor Cyan
Copy-Item -Path $sourcePath -Destination $backupPath -Force

# Read the file
Write-Host "[INFO] Reading source file..." -ForegroundColor Cyan
$content = Get-Content -Path $sourcePath -Raw -Encoding UTF8

# Fix 1: Replace Get-AuthInfoFromConfiguration function
Write-Host "[INFO] Fixing Get-AuthInfoFromConfiguration function..." -ForegroundColor Yellow
$oldAuthFunction = @'
function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # For on-premises AD, we don't need cloud authentication
    # Return a dummy auth object to satisfy the template
    Write-ActiveDirectoryLog -Message "ActiveDirectory module uses Windows authentication, no cloud credentials needed" -Level "DEBUG"
    return @{
        AuthType = "WindowsIntegrated"
        Domain = $Configuration.environment.domainController
    }
}
'@

$newAuthFunction = @'
function Get-AuthInfoFromConfiguration {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration
    )

    # Extract credentials from Configuration
    $TenantId = $Configuration.TenantId
    $ClientId = $Configuration.ClientId
    $ClientSecret = $Configuration.ClientSecret

    if (-not $TenantId -or -not $ClientId -or -not $ClientSecret) {
        Write-ActiveDirectoryLog -Message "Missing Graph API credentials in configuration. TenantId: $($null -ne $TenantId), ClientId: $($null -ne $ClientId), ClientSecret: $($null -ne $ClientSecret)" -Level "WARN"
        # Fallback to Windows integrated authentication for on-premises
        Write-ActiveDirectoryLog -Message "Falling back to Windows authentication for on-premises AD" -Level "DEBUG"
        return @{
            AuthType = "WindowsIntegrated"
            Domain = $Configuration.environment.domainController
        }
    }

    Write-ActiveDirectoryLog -Message "Auth - Using Graph API credentials. Tenant: $TenantId, Client: $ClientId" -Level "INFO"

    return @{
        AuthType = "GraphAPI"
        TenantId = $TenantId
        ClientId = $ClientId
        ClientSecret = $ClientSecret
    }
}
'@

$content = $content -replace [regex]::Escape($oldAuthFunction), $newAuthFunction

# Fix 2: Add Graph authentication in the main discovery function
Write-Host "[INFO] Adding Graph authentication to Invoke-ActiveDirectoryDiscovery..." -ForegroundColor Yellow

$oldConnectSection = @'
        # 4. AUTHENTICATE & CONNECT
        Write-ActiveDirectoryLog -Level "INFO" -Message "Checking Active Directory module..." -Context $Context

        # Check if Active Directory module is available
        if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) {
            $result.AddError("ActiveDirectory PowerShell module is not available. Install RSAT or ActiveDirectory module.", $null, $null)
            return $result
        }

        # Import the module if not already loaded
        if (-not (Get-Module -Name ActiveDirectory)) {
            Import-Module ActiveDirectory -ErrorAction Stop
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "ActiveDirectory module imported successfully" -Context $Context
        }
'@

$newConnectSection = @'
        # 4. AUTHENTICATE & CONNECT
        Write-ActiveDirectoryLog -Level "INFO" -Message "Checking authentication method..." -Context $Context

        # Get authentication info
        $authInfo = Get-AuthInfoFromConfiguration -Configuration $Configuration

        # If Graph API credentials are available, connect to Microsoft Graph
        if ($authInfo.AuthType -eq "GraphAPI") {
            try {
                Write-ActiveDirectoryLog -Level "INFO" -Message "Connecting to Microsoft Graph with provided credentials..." -Context $Context

                # Check if Microsoft.Graph.Authentication module is available
                if (-not (Get-Module -Name Microsoft.Graph.Authentication -ListAvailable)) {
                    Write-ActiveDirectoryLog -Level "WARN" -Message "Microsoft.Graph.Authentication module not available, falling back to AD module" -Context $Context
                } else {
                    # Import the module
                    Import-Module Microsoft.Graph.Authentication -ErrorAction Stop

                    # Connect to Microsoft Graph
                    $secureSecret = ConvertTo-SecureString $authInfo.ClientSecret -AsPlainText -Force
                    $credential = New-Object System.Management.Automation.PSCredential($authInfo.ClientId, $secureSecret)

                    Connect-MgGraph -ClientSecretCredential $credential -TenantId $authInfo.TenantId -NoWelcome -ErrorAction Stop

                    Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Connected to Microsoft Graph successfully" -Context $Context
                    $result.Metadata['AuthenticationMethod'] = 'GraphAPI'
                    $result.Metadata['TenantId'] = $authInfo.TenantId
                }
            } catch {
                Write-ActiveDirectoryLog -Level "WARN" -Message "Failed to connect to Graph API: $($_.Exception.Message). Falling back to AD module." -Context $Context
            }
        }

        Write-ActiveDirectoryLog -Level "INFO" -Message "Checking Active Directory module..." -Context $Context

        # Check if Active Directory module is available
        if (-not (Get-Module -Name ActiveDirectory -ListAvailable)) {
            $result.AddError("ActiveDirectory PowerShell module is not available. Install RSAT or ActiveDirectory module.", $null, $null)
            return $result
        }

        # Import the module if not already loaded
        if (-not (Get-Module -Name ActiveDirectory)) {
            Import-Module ActiveDirectory -ErrorAction Stop
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "ActiveDirectory module imported successfully" -Context $Context
        }
'@

$content = $content -replace [regex]::Escape($oldConnectSection), $newConnectSection

# Fix 3: Add Graph disconnection in cleanup section
Write-Host "[INFO] Adding Graph disconnection in cleanup..." -ForegroundColor Yellow

$oldCleanup = @'
        # 8. CLEANUP & COMPLETE
        Write-ActiveDirectoryLog -Level "INFO" -Message "Cleaning up..." -Context $Context

        $stopwatch.Stop()
'@

$newCleanup = @'
        # 8. CLEANUP & COMPLETE
        Write-ActiveDirectoryLog -Level "INFO" -Message "Cleaning up..." -Context $Context

        # Disconnect from Microsoft Graph if connected
        try {
            if (Get-Command -Name Disconnect-MgGraph -ErrorAction SilentlyContinue) {
                Disconnect-MgGraph -ErrorAction SilentlyContinue | Out-Null
                Write-ActiveDirectoryLog -Level "DEBUG" -Message "Disconnected from Microsoft Graph" -Context $Context
            }
        } catch {
            # Ignore disconnection errors
        }

        $stopwatch.Stop()
'@

$content = $content -replace [regex]::Escape($oldCleanup), $newCleanup

# Write the updated content
Write-Host "[INFO] Writing updated file..." -ForegroundColor Cyan
Set-Content -Path $sourcePath -Value $content -Encoding UTF8 -NoNewline

Write-Host "[SUCCESS] File updated successfully!" -ForegroundColor Green
Write-Host "[INFO] Backup saved to: $backupPath" -ForegroundColor Cyan

# Copy to workspace
$workspacePath = "D:\Scripts\UserMandA\Modules\Discovery\ActiveDirectoryDiscovery.psm1"
$workspaceDir = Split-Path -Parent $workspacePath

if (-not (Test-Path $workspaceDir)) {
    New-Item -Path $workspaceDir -ItemType Directory -Force | Out-Null
}

Write-Host "[INFO] Copying to workspace..." -ForegroundColor Cyan
Copy-Item -Path $sourcePath -Destination $workspacePath -Force
Write-Host "[SUCCESS] Copied to: $workspacePath" -ForegroundColor Green

Write-Host ""
Write-Host "[SUMMARY] Changes applied:" -ForegroundColor Cyan
Write-Host "  1. Updated Get-AuthInfoFromConfiguration to extract TenantId, ClientId, ClientSecret" -ForegroundColor White
Write-Host "  2. Added Graph API authentication in Invoke-ActiveDirectoryDiscovery" -ForegroundColor White
Write-Host "  3. Added Graph API disconnection in cleanup section" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Files updated:" -ForegroundColor Cyan
Write-Host "  - C:\enterprisediscovery\Modules\Discovery\ActiveDirectoryDiscovery.psm1" -ForegroundColor White
Write-Host "  - D:\Scripts\UserMandA\Modules\Discovery\ActiveDirectoryDiscovery.psm1" -ForegroundColor White
