# Test script to verify PowerShell 5.1 compatibility fix
# This script tests the Convert-ObjectToHashtable function

# Import the helper function from the orchestrator
$orchestratorPath = Join-Path $PSScriptRoot "..\Core\MandA-Orchestrator.ps1"

# Extract just the helper function for testing
$orchestratorContent = Get-Content $orchestratorPath -Raw
$functionStart = $orchestratorContent.IndexOf("function Convert-ObjectToHashtable {")
$functionEnd = $orchestratorContent.IndexOf("function Test-ModuleCompletionStatus {")
$functionCode = $orchestratorContent.Substring($functionStart, $functionEnd - $functionStart).Trim()

# Execute the function definition
Invoke-Expression $functionCode

Write-Host "Testing PowerShell 5.1 compatibility fix..." -ForegroundColor Cyan

# Test 1: Simple object conversion
Write-Host "`nTest 1: Simple PSCustomObject to Hashtable conversion" -ForegroundColor Yellow
$testConfig = @{
    discovery = @{
        enabledSources = @("Azure", "Graph")
        maxConcurrentJobs = 4
    }
    export = @{
        formats = @("CSV", "JSON")
    }
} | ConvertTo-Json -Depth 10 | ConvertFrom-Json

Write-Host "Original object type: $($testConfig.GetType().FullName)"
$convertedConfig = Convert-ObjectToHashtable -InputObject $testConfig
Write-Host "Converted object type: $($convertedConfig.GetType().FullName)"

if ($convertedConfig -is [hashtable]) {
    Write-Host "✓ Successfully converted to hashtable" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to convert to hashtable" -ForegroundColor Red
}

# Test 2: Nested object conversion
Write-Host "`nTest 2: Nested object conversion" -ForegroundColor Yellow
if ($convertedConfig.discovery -is [hashtable]) {
    Write-Host "✓ Nested objects properly converted to hashtables" -ForegroundColor Green
} else {
    Write-Host "✗ Nested objects not properly converted" -ForegroundColor Red
}

# Test 3: Array handling
Write-Host "`nTest 3: Array handling" -ForegroundColor Yellow
if ($convertedConfig.discovery.enabledSources -is [array]) {
    Write-Host "✓ Arrays preserved correctly" -ForegroundColor Green
    Write-Host "  EnabledSources: $($convertedConfig.discovery.enabledSources -join ', ')"
} else {
    Write-Host "✗ Arrays not preserved correctly" -ForegroundColor Red
}

# Test 4: Simulate the original failing scenario
Write-Host "`nTest 4: Simulating original failing scenario" -ForegroundColor Yellow
try {
    # This would fail in PowerShell 5.1
    # $failingConfig = $testConfig | ConvertTo-Json -Depth 10 | ConvertFrom-Json -AsHashtable
    
    # Our working solution
    $workingConfig = $testConfig | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $finalConfig = Convert-ObjectToHashtable -InputObject $workingConfig
    
    # Test adding auth context (simulating the orchestrator behavior)
    $finalConfig['_AuthContext'] = @{ TestAuth = "MockAuthContext" }
    
    Write-Host "✓ Successfully created thread-safe config with auth context" -ForegroundColor Green
    Write-Host "  Auth context added: $($finalConfig.ContainsKey('_AuthContext'))"
    
} catch {
    Write-Host "✗ Failed to create thread-safe config: $_" -ForegroundColor Red
}

Write-Host "`nPowerShell 5.1 compatibility test completed!" -ForegroundColor Cyan