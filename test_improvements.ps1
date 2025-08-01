# Test script to validate the improvements to DiscoveryCreateAppRegistration.ps1
param(
    [switch]$TestOS,
    [switch]$TestModules,
    [switch]$TestPaths
)

Write-Host "Testing PowerShell script improvements..." -ForegroundColor Cyan

# Test 1: OS Detection
if ($TestOS) {
    Write-Host "`n=== Testing OS Detection ===" -ForegroundColor Yellow
    
    # Source the improved script to get the OS detection logic
    $scriptPath = "D:\Scripts\UserMandA\GUI\bin\Release\net6.0-windows\Scripts\DiscoveryCreateAppRegistration.ps1"
    $scriptContent = Get-Content $scriptPath -Raw
    
    # Extract just the OS detection part
    $osDetectionStart = $scriptContent.IndexOf("# Enhanced cross-platform OS detection")
    $osDetectionEnd = $scriptContent.IndexOf("# Script metadata and validation")
    
    if ($osDetectionStart -gt 0 -and $osDetectionEnd -gt $osDetectionStart) {
        $osDetectionCode = $scriptContent.Substring($osDetectionStart, $osDetectionEnd - $osDetectionStart)
        
        # Execute the OS detection code
        try {
            Invoke-Expression $osDetectionCode
            
            Write-Host "OS Detection Results:" -ForegroundColor Green
            Write-Host "  Platform: $($script:OSInfo.Platform)" -ForegroundColor White
            Write-Host "  Is Windows: $($script:OSInfo.IsWindows)" -ForegroundColor White
            Write-Host "  Is Linux: $($script:OSInfo.IsLinux)" -ForegroundColor White
            Write-Host "  Is macOS: $($script:OSInfo.IsMacOS)" -ForegroundColor White
            Write-Host "  Architecture: $($script:OSInfo.Architecture)" -ForegroundColor White
            Write-Host "  Version: $($script:OSInfo.Version)" -ForegroundColor White
        } catch {
            Write-Host "OS Detection failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Test 2: Module resilience (without actually installing)
if ($TestModules) {
    Write-Host "`n=== Testing Module Import Resilience ===" -ForegroundColor Yellow
    
    # Test if the required modules are available
    $requiredModules = @("Az.Accounts", "Az.Resources", "Microsoft.Graph.Applications", "Microsoft.Graph.Authentication", "Microsoft.Graph.Identity.DirectoryManagement")
    
    foreach ($module in $requiredModules) {
        $installed = Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue
        if ($installed) {
            Write-Host "  ✓ $module v$($installed[0].Version) - Available" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $module - Not installed" -ForegroundColor Red
        }
    }
}

# Test 3: Cross-platform path handling
if ($TestPaths) {
    Write-Host "`n=== Testing Cross-Platform Path Handling ===" -ForegroundColor Yellow
    
    # Test the default path logic
    $defaultPath = if ($IsWindows -or $PSVersionTable.Platform -eq 'Win32NT' -or [System.Environment]::OSVersion.Platform -eq 'Win32NT') {
        "C:\DiscoveryData\discoverycredentials.config"
    } elseif ($IsLinux -or $PSVersionTable.Platform -eq 'Unix') {
        "$HOME/.discoverydata/discoverycredentials.config"
    } elseif ($IsMacOS -or $PSVersionTable.Platform -eq 'MacOSX') {
        "$HOME/.discoverydata/discoverycredentials.config"
    } else {
        Join-Path $HOME ".discoverydata" "discoverycredentials.config"
    }
    
    Write-Host "  Default credential path: $defaultPath" -ForegroundColor White
    
    # Test if parent directory can be created
    $parentDir = Split-Path $defaultPath -Parent
    try {
        if (-not (Test-Path $parentDir)) {
            Write-Host "  Parent directory would be created: $parentDir" -ForegroundColor Yellow
        } else {
            Write-Host "  ✓ Parent directory exists: $parentDir" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ✗ Path validation failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTest completed!" -ForegroundColor Cyan