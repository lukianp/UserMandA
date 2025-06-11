# Test the new session-based orchestrator (v4.0) that eliminates runspaces

Write-Host "=== Testing Session-Based Orchestrator v4.0 ===" -ForegroundColor Yellow
Write-Host "This version eliminates runspaces and runs modules directly in main session" -ForegroundColor Cyan

# Check if we're in the right location
if (-not (Test-Path "Core\MandA-Orchestrator-v4.ps1")) {
    Write-Host "ERROR: Please run this script from the M&A Discovery Suite root directory" -ForegroundColor Red
    exit 1
}

# Initialize the environment first
Write-Host "Initializing M&A environment..." -ForegroundColor Green
try {
    . "Scripts\Set-SuiteEnvironment.ps1"
    Write-Host "Environment initialized successfully" -ForegroundColor Green
} catch {
    Write-Host "Failed to initialize environment: $_" -ForegroundColor Red
    exit 1
}

# Test with BlackStones profile
$testCompany = "BlackStones"
Write-Host "Testing with company: $testCompany" -ForegroundColor Cyan

try {
    Write-Host "Running session-based orchestrator..." -ForegroundColor Green
    
    # Run the new v4.0 orchestrator
    & "Core\MandA-Orchestrator-v4.ps1" -CompanyName $testCompany -Mode Discovery -Force -DebugMode
    
    $exitCode = $LASTEXITCODE
    Write-Host "Orchestrator completed with exit code: $exitCode" -ForegroundColor $(if ($exitCode -eq 0) { "Green" } else { "Yellow" })
    
} catch {
    Write-Host "ERROR running orchestrator: $_" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Gray
}

Write-Host "=== Test Complete ===" -ForegroundColor Yellow