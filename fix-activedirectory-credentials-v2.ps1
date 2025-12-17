# Fix ActiveDirectoryDiscovery.psm1 to use credentials from $Configuration - Version 2

$sourcePath = "C:\enterprisediscovery\Modules\Discovery\ActiveDirectoryDiscovery.psm1"
$backupPath = "C:\enterprisediscovery\Modules\Discovery\ActiveDirectoryDiscovery.psm1.backup2"

# Create backup
Write-Host "[INFO] Creating backup..." -ForegroundColor Cyan
Copy-Item -Path $sourcePath -Destination $backupPath -Force

# Read the file as lines
Write-Host "[INFO] Reading source file..." -ForegroundColor Cyan
$lines = Get-Content -Path $sourcePath -Encoding UTF8

# Find and replace the authentication section (lines around "# 4. AUTHENTICATE & CONNECT")
Write-Host "[INFO] Finding authentication section..." -ForegroundColor Yellow
$startLine = -1
$endLine = -1

for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "# 4\. AUTHENTICATE & CONNECT") {
        $startLine = $i
    }
    if ($startLine -ge 0 -and $lines[$i] -match "# 5\. PERFORM DISCOVERY") {
        $endLine = $i - 1
        break
    }
}

if ($startLine -ge 0 -and $endLine -ge 0) {
    Write-Host "[INFO] Found authentication section at lines $startLine to $endLine" -ForegroundColor Green

    # Create the new authentication section
    $newAuthSection = @'
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

        # Test AD connectivity
        try {
            $serverParams = Get-ServerParameters -Configuration $Configuration
            $testDomain = Get-ADDomain @serverParams -ErrorAction Stop
            Write-ActiveDirectoryLog -Level "SUCCESS" -Message "Connected to domain: $($testDomain.DNSRoot)" -Context $Context
            $result.Metadata['DomainDNSRoot'] = $testDomain.DNSRoot
            $result.Metadata['DomainNetBIOSName'] = $testDomain.NetBIOSName
        } catch {
            $result.AddError("Failed to connect to Active Directory: $($_.Exception.Message)", $_.Exception, $null)
            return $result
        }
'@

    # Replace the lines
    $newLines = @()
    $newLines += $lines[0..($startLine - 1)]
    $newLines += $newAuthSection -split "`n"
    $newLines += $lines[($endLine + 1)..($lines.Count - 1)]

    # Write back
    Write-Host "[INFO] Writing updated file..." -ForegroundColor Cyan
    $newLines | Set-Content -Path $sourcePath -Encoding UTF8

    Write-Host "[SUCCESS] Authentication section updated!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Could not find authentication section boundaries" -ForegroundColor Red
    exit 1
}

# Now add Graph disconnection to cleanup section
Write-Host "[INFO] Adding Graph disconnection to cleanup section..." -ForegroundColor Yellow
$content = Get-Content -Path $sourcePath -Raw -Encoding UTF8

$oldCleanup = '        # 8. CLEANUP & COMPLETE
        Write-ActiveDirectoryLog -Level "INFO" -Message "Cleaning up..." -Context $Context

        $stopwatch.Stop()'

$newCleanup = '        # 8. CLEANUP & COMPLETE
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

        $stopwatch.Stop()'

$content = $content -replace [regex]::Escape($oldCleanup), $newCleanup
Set-Content -Path $sourcePath -Value $content -Encoding UTF8 -NoNewline

Write-Host "[SUCCESS] Cleanup section updated!" -ForegroundColor Green

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
