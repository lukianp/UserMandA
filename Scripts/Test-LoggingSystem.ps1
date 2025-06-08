# Test script to verify the logging system is working correctly
param(
    [string]$CompanyName = "TestCompany"
)

Write-Host "Testing M&A Discovery Suite Logging System..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check if global context exists
if (-not $global:MandA -or -not $global:MandA.Initialized) {
    Write-Host "ERROR: Global M&A context not initialized!" -ForegroundColor Red
    Write-Host "Please run QuickStart.ps1 first or ensure Set-SuiteEnvironment.ps1 has been sourced." -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Global context verified" -ForegroundColor Green

# Check log output path
$logPath = $global:MandA.Paths.LogOutput
Write-Host "Log output path: $logPath" -ForegroundColor Gray

if (-not (Test-Path $logPath)) {
    Write-Host "Creating log directory..." -ForegroundColor Yellow
    try {
        New-Item -Path $logPath -ItemType Directory -Force | Out-Null
        Write-Host "[OK] Log directory created" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Failed to create log directory: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] Log directory exists" -ForegroundColor Green
}

# Load EnhancedLogging module
$loggingModulePath = Join-Path $global:MandA.Paths.Utilities "EnhancedLogging.psm1"
Write-Host "Loading EnhancedLogging module from: $loggingModulePath" -ForegroundColor Gray

if (-not (Test-Path $loggingModulePath)) {
    Write-Host "ERROR: EnhancedLogging module not found!" -ForegroundColor Red
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
    Initialize-Logging -Context $global:MandA
    Write-Host "[OK] Logging system initialized" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to initialize logging: $_" -ForegroundColor Red
    exit 1
}

# Test logging functions
Write-Host "Testing log functions..." -ForegroundColor Yellow

$testMessages = @(
    @{ Level = "INFO"; Message = "This is an info message" }
    @{ Level = "SUCCESS"; Message = "This is a success message" }
    @{ Level = "WARN"; Message = "This is a warning message" }
    @{ Level = "ERROR"; Message = "This is an error message" }
    @{ Level = "DEBUG"; Message = "This is a debug message" }
    @{ Level = "HEADER"; Message = "This is a header message" }
)

foreach ($test in $testMessages) {
    try {
        Write-MandALog -Message $test.Message -Level $test.Level -Component "LogTest"
        Write-Host "[OK] $($test.Level) message logged" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] Failed to log $($test.Level) message: $_" -ForegroundColor Red
    }
}

# Check if log file was created
Write-Host "Checking for log files..." -ForegroundColor Yellow
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
    Write-Host "`nLast 5 lines from log file:" -ForegroundColor Cyan
    Write-Host ("-" * 50) -ForegroundColor DarkGray
    try {
        $lastLines = Get-Content $latestLog.FullName -Tail 5 -ErrorAction Stop
        foreach ($line in $lastLines) {
            Write-Host "  $line" -ForegroundColor White
        }
    } catch {
        Write-Host "  Error reading log file: $_" -ForegroundColor Red
    }
}

Write-Host "`nLogging system test completed!" -ForegroundColor Cyan
Write-Host "You can now run the log monitor with:" -ForegroundColor Yellow
Write-Host "  .\Scripts\Show-LogMonitor.ps1 -CompanyName '$CompanyName' -LogPath '$logPath'" -ForegroundColor White