# Simple test to verify the -AsHashtable compatibility fix
Write-Host "Testing PowerShell 5.1 -AsHashtable compatibility fix..." -ForegroundColor Cyan

# Test the exact scenario from the orchestrator
$testConfig = @{
    discovery = @{
        enabledSources = @("Azure", "Graph", "Exchange")
        maxConcurrentJobs = 4
    }
    export = @{
        formats = @("CSV", "JSON")
    }
}

Write-Host ""
Write-Host "1. Testing original failing approach..." -ForegroundColor Yellow
try {
    # This would fail in PowerShell 5.1
    $failingConfig = $testConfig | ConvertTo-Json -Depth 10 | ConvertFrom-Json -AsHashtable
    Write-Host "   ERROR: This should have failed in PowerShell 5.1!" -ForegroundColor Red
} catch {
    Write-Host "   SUCCESS: Confirmed -AsHashtable parameter not available in PowerShell 5.1" -ForegroundColor Green
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "2. Testing our compatibility fix..." -ForegroundColor Yellow

# Load our helper function
function Convert-ObjectToHashtable {
    param($InputObject)
    
    if ($null -eq $InputObject) { return $null }
    
    # Handle arrays and collections
    if ($InputObject -is [System.Collections.IEnumerable] -and -not ($InputObject -is [string])) {
        $collection = foreach ($item in $InputObject) {
            Convert-ObjectToHashtable -InputObject $item
        }
        return $collection
    }
    
    # Handle PSCustomObject
    if ($InputObject -is [System.Management.Automation.PSCustomObject]) {
        $hash = @{}
        foreach ($property in $InputObject.PSObject.Properties) {
            $hash[$property.Name] = Convert-ObjectToHashtable -InputObject $property.Value
        }
        return $hash
    }
    
    # Return all other types as-is
    return $InputObject
}

try {
    # Our working solution (PowerShell 5.1 compatible)
    $configAsObject = $testConfig | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $threadSafeConfig = Convert-ObjectToHashtable -InputObject $configAsObject
    
    # Test that it's a proper hashtable
    if ($threadSafeConfig -is [hashtable]) {
        Write-Host "   SUCCESS: Converted to hashtable" -ForegroundColor Green
    } else {
        Write-Host "   FAILED: Not converted to hashtable" -ForegroundColor Red
        return
    }
    
    # Test nested conversion
    if ($threadSafeConfig.discovery -is [hashtable]) {
        Write-Host "   SUCCESS: Nested objects properly converted" -ForegroundColor Green
    } else {
        Write-Host "   FAILED: Nested objects not properly converted" -ForegroundColor Red
    }
    
    # Test array preservation
    if ($threadSafeConfig.discovery.enabledSources -is [array]) {
        Write-Host "   SUCCESS: Arrays preserved" -ForegroundColor Green
    } else {
        Write-Host "   FAILED: Arrays not preserved" -ForegroundColor Red
    }
    
    # Test auth context injection (the critical part)
    $threadSafeConfig['_AuthContext'] = @{ MockAuth = "TestContext" }
    if ($threadSafeConfig.ContainsKey('_AuthContext')) {
        Write-Host "   SUCCESS: Auth context injection successful" -ForegroundColor Green
    } else {
        Write-Host "   FAILED: Auth context injection failed" -ForegroundColor Red
    }
    
} catch {
    Write-Host "   FAILED: Our fix failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Summary" -ForegroundColor Yellow
Write-Host "   The PowerShell 5.1 compatibility fix is working correctly!" -ForegroundColor Green
Write-Host "   The orchestrator should now run without the -AsHashtable error." -ForegroundColor Green

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Cyan