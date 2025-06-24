# Simple test script to verify the logging system works
param(
    [string]$CompanyName = "Zedra"
)

Write-Host "Simple Logging Test..." -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

# Create a minimal context for testing
$testContext = [PSCustomObject]@{
    Paths = [PSCustomObject]@{
        LogOutput = "C:\MandADiscovery\Logs"
        Utilities = ".\Modules\Utilities"
    }
}

# Ensure log directory exists
$logPath = $testContext.Paths.LogOutput
if (-not (Test-Path $logPath)) {
    Write-Host "Creating log directory: $logPath" -ForegroundColor Yellow
    New-Item -Path $logPath -ItemType Directory -Force | Out-Null
}

# Load EnhancedLogging module
$loggingModulePath = Join-Path $testContext.Paths.Utilities "EnhancedLogging.psm1"
Write-Host "Loading EnhancedLogging module..." -ForegroundColor Gray

if (-not (Test-Path $loggingModulePath)) {
    Write-Host "ERROR: EnhancedLogging module not found at: $loggingModulePath" -ForegroundColor Red
    exit 1
}

try {
    Import-Module $loggingModulePath -Force -Global
    Write-Host "[OK] EnhancedLogging module loaded" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to load EnhancedLogging module: $_" -ForegroundColor Red
    exit 1
}

# Initialize logging
Write-Host "Initializing logging system..." -ForegroundColor Yellow
try {
    Initialize-Logging -Context $testContext
    Write-Host "[OK] Logging system initialized" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to initialize logging: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test logging functions
Write-Host "Testing log functions..." -ForegroundColor Yellow

$testMessages = @(
    @{ Level = "INFO"; Message = "Testing INFO level logging" }
    @{ Level = "SUCCESS"; Message = "Testing SUCCESS level logging" }
    @{ Level = "WARN"; Message = "Testing WARN level logging" }
    @{ Level = "ERROR"; Message = "Testing ERROR level logging" }
    @{ Level = "DEBUG"; Message = "Testing DEBUG level logging" }
    @{ Level = "HEADER"; Message = "Testing HEADER level logging" }
)

foreach ($test in $testMessages) {
    try {
        Write-MandALog -Message $test.Message -Level $test.Level -Component "SimpleLogTest"
        Write-Host "[OK] $($test.Level) message logged successfully" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Failed to log $($test.Level) message: $_" -ForegroundColor Red
    }
}

# Check if log file was created
Write-Host "`nChecking for log files..." -ForegroundColor Yellow
$logFiles = Get-ChildItem -Path $logPath -Filter "*.log" -File | Sort-Object LastWriteTime -Descending

if ($logFiles.Count -eq 0) {
    Write-Host "[FAIL] No log files found!" -ForegroundColor Red
} else {
    Write-Host "[OK] Found $($logFiles.Count) log file(s)" -ForegroundColor Green
    $latestLog = $logFiles[0]
    $fileSizeKB = [math]::Round($latestLog.Length/1KB, 2)
    Write-Host "Latest log file: $($latestLog.Name) ($fileSizeKB KB)" -ForegroundColor Gray
    Write-Host "Last modified: $($latestLog.LastWriteTime)" -ForegroundColor Gray
    
    # Show last few lines of the log
    Write-Host "`nLast 10 lines from log file:" -ForegroundColor Cyan
    Write-Host ("-" * 60) -ForegroundColor DarkGray
    try {
        $lastLines = Get-Content $latestLog.FullName -Tail 10 -ErrorAction Stop
        foreach ($line in $lastLines) {
            Write-Host "  $line" -ForegroundColor White
        }
    } catch {
        Write-Host "  Error reading log file: $_" -ForegroundColor Red
    }
    
    Write-Host "`n[SUCCESS] Logging system is working correctly!" -ForegroundColor Green
    Write-Host "Log file path: $($latestLog.FullName)" -ForegroundColor Gray
}

Write-Host "`nYou can now test the log monitor with:" -ForegroundColor Yellow
Write-Host "  .\Scripts\Show-LogMonitor.ps1 -CompanyName '$CompanyName' -LogPath '$logPath'" -ForegroundColor White