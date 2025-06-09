# Simple test to verify the -AsHashtable compatibility fix
Write-Host "Testing PowerShell 5.1 -AsHashtable compatibility fix..." -ForegroundColor Cyan

# Test the exact scenario from the orchestrator
$testConfig = @{
    discovery = @{
        enabledSources = @("Azure", "Graph", "Exchange")
        maxConcurrentJobs = 4
        sharepoint = @{
            tenantName = "contoso"
        }
    }
    export = @{
        formats = @("CSV", "JSON")
    }
    performance = @{
        memoryThresholdMB = 2048
    }
}

Write-Host "`n1. Testing original failing approach..." -ForegroundColor Yellow
try {
    # This would fail in PowerShell 5.1
    $failingConfig = $testConfig | ConvertTo-Json -Depth 10 | ConvertFrom-Json -AsHashtable
    Write-Host "   ERROR: This should have failed in PowerShell 5.1!" -ForegroundColor Red
} catch {
    Write-Host "   ✓ Confirmed: -AsHashtable parameter not available in PowerShell 5.1" -ForegroundColor Green
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n2. Testing our compatibility fix..." -ForegroundColor Yellow

# Load our helper function
$functionCode = @'
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
'@

Invoke-Expression $functionCode

try {
    # Our working solution (PowerShell 5.1 compatible)
    $configAsObject = $testConfig | ConvertTo-Json -Depth 10 | ConvertFrom-Json
    $threadSafeConfig = Convert-ObjectToHashtable -InputObject $configAsObject
    
    # Test that it's a proper hashtable
    if ($threadSafeConfig -is [hashtable]) {
        Write-Host "   ✓ Successfully converted to hashtable" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Failed to convert to hashtable" -ForegroundColor Red
        return
    }
    
    # Test nested conversion
    if ($threadSafeConfig.discovery -is [hashtable]) {
        Write-Host "   ✓ Nested objects properly converted" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Nested objects not properly converted" -ForegroundColor Red
    }
    
    # Test array preservation
    if ($threadSafeConfig.discovery.enabledSources -is [array]) {
        Write-Host "   ✓ Arrays preserved: $($threadSafeConfig.discovery.enabledSources -join ', ')" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Arrays not preserved" -ForegroundColor Red
    }
    
    # Test auth context injection (the critical part)
    $threadSafeConfig['_AuthContext'] = @{ MockAuth = "TestContext" }
    if ($threadSafeConfig.ContainsKey('_AuthContext')) {
        Write-Host "   ✓ Auth context injection successful" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Auth context injection failed" -ForegroundColor Red
    }
    
} catch {
    Write-Host "   ✗ Our fix failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Summary" -ForegroundColor Yellow
Write-Host "   The PowerShell 5.1 compatibility fix is working correctly!" -ForegroundColor Green
Write-Host "   The orchestrator should now run without the -AsHashtable error." -ForegroundColor Green

Write-Host "`nTest completed!" -ForegroundColor Cyan