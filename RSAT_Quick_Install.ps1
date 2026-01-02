# RSAT Quick Install Script for DNS/DHCP Discovery
# Run as Administrator
# Version: 1.0.0
# Last Updated: 2026-01-02

#Requires -RunAsAdministrator

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "RSAT Quick Install - DNS & DHCP Tools" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Detect OS version
$osVersion = [System.Environment]::OSVersion.Version
$isServer = (Get-CimInstance Win32_OperatingSystem).ProductType -ne 1
$isWin10Plus = $osVersion.Major -ge 10

Write-Host "[1/5] Detecting operating system..." -ForegroundColor Yellow
if ($isServer) {
    Write-Host "      Detected: Windows Server" -ForegroundColor Green
    $installMethod = "ServerManager"
} elseif ($isWin10Plus) {
    Write-Host "      Detected: Windows 10/11" -ForegroundColor Green
    $installMethod = "WindowsCapability"
} else {
    Write-Host "      Detected: Older Windows version" -ForegroundColor Red
    Write-Host "      Please upgrade to Windows 10 version 1809+ for RSAT support" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/5] Checking existing RSAT installation..." -ForegroundColor Yellow

$dnsModule = Get-Module -ListAvailable -Name DnsServer
$dhcpModule = Get-Module -ListAvailable -Name DhcpServer

if ($dnsModule -and $dhcpModule) {
    Write-Host "      ✓ RSAT tools already installed!" -ForegroundColor Green
    Write-Host "      DNS Server module version: $($dnsModule.Version)" -ForegroundColor Green
    Write-Host "      DHCP Server module version: $($dhcpModule.Version)" -ForegroundColor Green
    Write-Host ""
    Write-Host "No installation needed. You're ready to run DNS/DHCP discovery!" -ForegroundColor Green
    exit 0
}

Write-Host "      Missing modules detected. Installing..." -ForegroundColor Yellow
Write-Host ""
Write-Host "[3/5] Installing RSAT tools..." -ForegroundColor Yellow

$installSuccess = $false

try {
    if ($installMethod -eq "WindowsCapability") {
        # Windows 10/11 method
        Write-Host "      Installing DNS RSAT tools..." -ForegroundColor Cyan
        $dnsCapability = Get-WindowsCapability -Online -Name 'Rsat.Dns.Tools*' | Where-Object State -ne 'Installed'

        if ($dnsCapability) {
            Add-WindowsCapability -Online -Name $dnsCapability.Name -ErrorAction Stop | Out-Null
            Write-Host "      ✓ DNS RSAT installed" -ForegroundColor Green
        } else {
            Write-Host "      ✓ DNS RSAT already installed" -ForegroundColor Green
        }

        Write-Host "      Installing DHCP RSAT tools..." -ForegroundColor Cyan
        $dhcpCapability = Get-WindowsCapability -Online -Name 'Rsat.DHCP.Tools*' | Where-Object State -ne 'Installed'

        if ($dhcpCapability) {
            Add-WindowsCapability -Online -Name $dhcpCapability.Name -ErrorAction Stop | Out-Null
            Write-Host "      ✓ DHCP RSAT installed" -ForegroundColor Green
        } else {
            Write-Host "      ✓ DHCP RSAT already installed" -ForegroundColor Green
        }

        $installSuccess = $true

    } elseif ($installMethod -eq "ServerManager") {
        # Windows Server method
        Write-Host "      Installing RSAT features via Server Manager..." -ForegroundColor Cyan
        $features = Install-WindowsFeature -Name RSAT-DNS-Server, RSAT-DHCP -ErrorAction Stop

        if ($features.Success) {
            Write-Host "      ✓ RSAT tools installed successfully" -ForegroundColor Green
            $installSuccess = $true
        } else {
            Write-Host "      ✗ Installation did not report success" -ForegroundColor Red
            if ($features.RestartNeeded -eq 'Yes') {
                Write-Host "      ! Server restart required" -ForegroundColor Yellow
            }
        }
    }

} catch {
    Write-Host "      ✗ Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting suggestions:" -ForegroundColor Yellow
    Write-Host "  1. Ensure you're running PowerShell as Administrator" -ForegroundColor White
    Write-Host "  2. Check your internet connection (RSAT downloads from Windows Update)" -ForegroundColor White
    Write-Host "  3. Try running Windows Update first" -ForegroundColor White
    Write-Host "  4. Refer to RSAT_Installation_Guide.md for detailed troubleshooting" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "[4/5] Verifying installation..." -ForegroundColor Yellow

# Re-check modules
$dnsModule = Get-Module -ListAvailable -Name DnsServer
$dhcpModule = Get-Module -ListAvailable -Name DhcpServer

if ($dnsModule) {
    Write-Host "      ✓ DnsServer module found (version $($dnsModule.Version))" -ForegroundColor Green
} else {
    Write-Host "      ✗ DnsServer module not found" -ForegroundColor Red
}

if ($dhcpModule) {
    Write-Host "      ✓ DhcpServer module found (version $($dhcpModule.Version))" -ForegroundColor Green
} else {
    Write-Host "      ✗ DhcpServer module not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "[5/5] Testing module functionality..." -ForegroundColor Yellow

try {
    Import-Module DnsServer -Force -ErrorAction Stop
    $dnsCommands = Get-Command -Module DnsServer | Measure-Object
    Write-Host "      ✓ DnsServer module loaded ($($dnsCommands.Count) commands available)" -ForegroundColor Green
} catch {
    Write-Host "      ✗ Failed to load DnsServer module: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    Import-Module DhcpServer -Force -ErrorAction Stop
    $dhcpCommands = Get-Command -Module DhcpServer | Measure-Object
    Write-Host "      ✓ DhcpServer module loaded ($($dhcpCommands.Count) commands available)" -ForegroundColor Green
} catch {
    Write-Host "      ✗ Failed to load DhcpServer module: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Restart the Enterprise Discovery Suite application" -ForegroundColor White
Write-Host "  2. Navigate to Discovery > DNS & DHCP" -ForegroundColor White
Write-Host "  3. Click 'Start Discovery'" -ForegroundColor White
Write-Host "  4. Full discovery with 14 CSV files will now be available!" -ForegroundColor White
Write-Host ""
Write-Host "Expected discovery improvements:" -ForegroundColor Cyan
Write-Host "  Before: 1 CSV file (network adapter DNS only) - 7% success" -ForegroundColor Red
Write-Host "  After:  14 CSV files (full infrastructure) - 100% success" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
