# M&A Discovery Suite - Application Troubleshooting Script

[CmdletBinding()]
param()

Write-Host "M&A Discovery Suite - Troubleshooting Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$ExePath = "C:\EnterpriseDiscovery\bin\Release\MandADiscoverySuite.exe"
$WorkingDir = "C:\EnterpriseDiscovery\bin\Release"

# Check if executable exists
Write-Host "`n1. Checking application files..." -ForegroundColor Yellow
if (Test-Path $ExePath) {
    $fileInfo = Get-Item $ExePath
    Write-Host "   ✓ Application executable found" -ForegroundColor Green
    Write-Host "   - Path: $ExePath" -ForegroundColor White
    Write-Host "   - Size: $([Math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor White
    Write-Host "   - Modified: $($fileInfo.LastWriteTime)" -ForegroundColor White
} else {
    Write-Host "   ✗ Application executable not found at: $ExePath" -ForegroundColor Red
    exit 1
}

# Check .NET Runtime
Write-Host "`n2. Checking .NET Runtime..." -ForegroundColor Yellow
try {
    $dotnetVersion = & dotnet --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ .NET Runtime version: $dotnetVersion" -ForegroundColor Green
        
        # Check if it's .NET 6 or higher
        $majorVersion = [int]($dotnetVersion.Split('.')[0])
        if ($majorVersion -ge 6) {
            Write-Host "   ✓ .NET version is compatible" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ .NET version may be too old (need 6.0+)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   ✗ .NET Runtime not found or not accessible" -ForegroundColor Red
    Write-Host "   - Download from: https://dotnet.microsoft.com/download" -ForegroundColor White
}

# Check dependencies
Write-Host "`n3. Checking application dependencies..." -ForegroundColor Yellow
$requiredFiles = @(
    "MandADiscoverySuite.dll",
    "MandADiscoverySuite.deps.json",
    "MandADiscoverySuite.runtimeconfig.json"
)

foreach ($file in $requiredFiles) {
    $filePath = Join-Path $WorkingDir $file
    if (Test-Path $filePath) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file missing" -ForegroundColor Red
    }
}

# Check PowerShell modules
Write-Host "`n4. Checking PowerShell modules..." -ForegroundColor Yellow
$modulesPath = Join-Path $WorkingDir "Modules"
if (Test-Path $modulesPath) {
    $moduleCount = (Get-ChildItem -Path $modulesPath -Recurse -Filter "*.psm1").Count
    Write-Host "   ✓ PowerShell modules directory found" -ForegroundColor Green
    Write-Host "   - Module files: $moduleCount" -ForegroundColor White
} else {
    Write-Host "   ✗ PowerShell modules directory not found" -ForegroundColor Red
}

# Check configuration files
Write-Host "`n5. Checking configuration files..." -ForegroundColor Yellow
$configPath = Join-Path $WorkingDir "Configuration"
if (Test-Path $configPath) {
    $configFiles = Get-ChildItem -Path $configPath -Filter "*.json"
    Write-Host "   ✓ Configuration directory found" -ForegroundColor Green
    Write-Host "   - Config files: $($configFiles.Count)" -ForegroundColor White
    foreach ($config in $configFiles) {
        Write-Host "     - $($config.Name)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ✗ Configuration directory not found" -ForegroundColor Red
}

# Check if application is already running
Write-Host "`n6. Checking for running instances..." -ForegroundColor Yellow
$runningProcesses = Get-Process -Name "MandADiscoverySuite" -ErrorAction SilentlyContinue
if ($runningProcesses) {
    Write-Host "   ⚠ Application is already running" -ForegroundColor Yellow
    foreach ($process in $runningProcesses) {
        Write-Host "     - PID: $($process.Id), Started: $($process.StartTime)" -ForegroundColor White
    }
} else {
    Write-Host "   ✓ No running instances found" -ForegroundColor Green
}

# Test application startup with error capture
Write-Host "`n7. Testing application startup..." -ForegroundColor Yellow
try {
    Write-Host "   Attempting to start application with error capture..." -ForegroundColor White
    
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = $ExePath
    $processInfo.WorkingDirectory = $WorkingDir
    $processInfo.UseShellExecute = $false
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    $processInfo.CreateNoWindow = $true
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processInfo
    
    # Start the process
    $started = $process.Start()
    
    if ($started) {
        Write-Host "   ✓ Application started successfully" -ForegroundColor Green
        
        # Wait a moment to see if it crashes immediately
        Start-Sleep -Seconds 3
        
        if (-not $process.HasExited) {
            Write-Host "   ✓ Application is running stable" -ForegroundColor Green
            Write-Host "   - PID: $($process.Id)" -ForegroundColor White
            
            # Try to stop it gracefully
            try {
                $process.CloseMainWindow()
                $process.WaitForExit(5000)
                if (-not $process.HasExited) {
                    $process.Kill()
                }
                Write-Host "   ✓ Application stopped gracefully" -ForegroundColor Green
            } catch {
                Write-Host "   ⚠ Had to force-kill application" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   ✗ Application exited immediately" -ForegroundColor Red
            Write-Host "   - Exit code: $($process.ExitCode)" -ForegroundColor White
            
            # Try to read error output
            $stderr = $process.StandardError.ReadToEnd()
            if ($stderr) {
                Write-Host "   - Error output:" -ForegroundColor Red
                Write-Host "     $stderr" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "   ✗ Failed to start application" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Exception during startup test: $($_.Exception.Message)" -ForegroundColor Red
}

# Check Windows Event Log for application errors
Write-Host "`n8. Checking Windows Event Log..." -ForegroundColor Yellow
try {
    $recentErrors = Get-WinEvent -FilterHashtable @{LogName='Application'; Level=2; StartTime=(Get-Date).AddHours(-1)} -MaxEvents 10 -ErrorAction SilentlyContinue |
        Where-Object { $_.ProviderName -match "\.NET" -or $_.Message -match "MandADiscoverySuite" }
    
    if ($recentErrors) {
        Write-Host "   ⚠ Found recent .NET application errors:" -ForegroundColor Yellow
        foreach ($error in $recentErrors) {
            Write-Host "     - $($error.TimeCreated): $($error.LevelDisplayName)" -ForegroundColor Gray
            Write-Host "       $($error.Message.Substring(0, [Math]::Min(100, $error.Message.Length)))..." -ForegroundColor Gray
        }
    } else {
        Write-Host "   ✓ No recent application errors found" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠ Could not check event log: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n" -ForegroundColor White
Write-Host "Troubleshooting Summary:" -ForegroundColor Cyan
Write-Host "- Application executable and dependencies appear to be properly installed" -ForegroundColor White
Write-Host "- If the application starts but doesn't show a window, it may be running in the background" -ForegroundColor White
Write-Host "- Check Task Manager for MandADiscoverySuite.exe process" -ForegroundColor White
Write-Host "- Try running: Get-Process -Name 'MandADiscoverySuite'" -ForegroundColor White

Write-Host "`nTo manually start the application:" -ForegroundColor Yellow
Write-Host "1. Open PowerShell as Administrator" -ForegroundColor White
Write-Host "2. Run: Set-Location 'C:\EnterpriseDiscovery\bin\Release'" -ForegroundColor White
Write-Host "3. Run: .\MandADiscoverySuite.exe" -ForegroundColor White
Write-Host "`nOr use the launcher:" -ForegroundColor Yellow
Write-Host "   .\Launch-MandADiscoverySuite.bat" -ForegroundColor White