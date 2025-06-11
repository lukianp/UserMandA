# Test the new session-based orchestrator v4.0 with AzureOnly mode for BlackStones

Write-Host "=== Testing Session-Based Orchestrator v4.0 - AzureOnly Mode ===" -ForegroundColor Yellow
Write-Host "Company: BlackStones | Mode: AzureOnly" -ForegroundColor Cyan
Write-Host "This version eliminates runspaces and runs modules directly in main session" -ForegroundColor Green

# Check if we're in the right location
if (-not (Test-Path "Core\MandA-Orchestrator.ps1")) {
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

# Test with BlackStones profile and AzureOnly mode
$testCompany = "BlackStones"
Write-Host "Testing with company: $testCompany" -ForegroundColor Cyan

try {
    Write-Host "Running session-based orchestrator v4.0..." -ForegroundColor Green
    Write-Host "Command: Core\MandA-Orchestrator.ps1 -CompanyName $testCompany -Mode AzureOnly -Force -DebugMode" -ForegroundColor Gray
    
    # Run the new v4.0 orchestrator directly
    & "Core\MandA-Orchestrator.ps1" -CompanyName $testCompany -Mode AzureOnly -Force -DebugMode
    
    $exitCode = $LASTEXITCODE
    Write-Host "Orchestrator completed with exit code: $exitCode" -ForegroundColor $(if ($exitCode -eq 0) { "Green" } else { "Yellow" })
    
    if ($exitCode -eq 0) {
        Write-Host "SUCCESS: All discovery modules completed successfully!" -ForegroundColor Green
    } elseif ($exitCode -eq 1) {
        Write-Host "WARNING: Some modules had recoverable errors" -ForegroundColor Yellow
    } else {
        Write-Host "ERROR: Critical errors occurred" -ForegroundColor Red
    }
    
} catch {
    Write-Host "ERROR running orchestrator: $_" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Gray
}

Write-Host "=== Test Complete ===" -ForegroundColor Yellow