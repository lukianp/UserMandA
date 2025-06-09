# Test script to verify DiscoveryResult class scope fix
# This script tests that discovery modules can now properly access and use the DiscoveryResult class

param(
    [switch]$Verbose
)

Write-Host "Testing DiscoveryResult Class Scope Fix" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

try {
    # Import the ErrorHandling module
    Write-Host "1. Importing ErrorHandling module..." -ForegroundColor Yellow
    Import-Module ".\Modules\Utilities\ErrorHandling.psm1" -Force
    Write-Host "   [+] Module imported successfully" -ForegroundColor Green

    # Test 1: Create DiscoveryResult using New-DiscoveryResult function
    Write-Host "2. Testing New-DiscoveryResult function..." -ForegroundColor Yellow
    $result1 = New-DiscoveryResult -ModuleName "TestModule1"
    if ($result1 -and $result1.ModuleName -eq "TestModule1" -and $result1.Success -eq $true) {
        Write-Host "   [+] New-DiscoveryResult function works correctly" -ForegroundColor Green
    } else {
        Write-Host "   [-] New-DiscoveryResult function failed" -ForegroundColor Red
        throw "New-DiscoveryResult function test failed"
    }

    # Test 2: Test error handling
    Write-Host "3. Testing error handling..." -ForegroundColor Yellow
    $result1.AddError("Test error message", $null, @{TestContext = "Value"})
    if ($result1.Success -eq $false -and $result1.Errors.Count -eq 1) {
        Write-Host "   [+] Error handling works correctly" -ForegroundColor Green
    } else {
        Write-Host "   [-] Error handling failed" -ForegroundColor Red
        throw "Error handling test failed"
    }

    # Test 3: Test warning handling
    Write-Host "4. Testing warning handling..." -ForegroundColor Yellow
    $result1.AddWarning("Test warning message", @{WarningContext = "TestValue"})
    if ($result1.Warnings.Count -eq 1) {
        Write-Host "   [+] Warning handling works correctly" -ForegroundColor Green
    } else {
        Write-Host "   [-] Warning handling failed" -ForegroundColor Red
        throw "Warning handling test failed"
    }

    # Test 4: Test completion
    Write-Host "5. Testing completion..." -ForegroundColor Yellow
    $result1.Complete()
    if ($result1.EndTime -and $result1.Metadata.ContainsKey('Duration')) {
        Write-Host "   [+] Completion works correctly" -ForegroundColor Green
    } else {
        Write-Host "   [-] Completion failed" -ForegroundColor Red
        throw "Completion test failed"
    }

    # Test 5: Simulate discovery module usage
    Write-Host "6. Simulating discovery module usage..." -ForegroundColor Yellow
    $discoveryResult = New-DiscoveryResult -ModuleName "ActiveDirectoryDiscovery"
    $discoveryResult.Data = @{
        Users = @("user1@domain.com", "user2@domain.com")
        Groups = @("Group1", "Group2")
        DomainControllers = @("DC01", "DC02")
    }
    $discoveryResult.AddWarning("Some users may have expired passwords")
    $discoveryResult.Complete()
    
    if ($discoveryResult.Success -eq $true -and $discoveryResult.Data.Users.Count -eq 2) {
        Write-Host "   [+] Discovery module simulation successful" -ForegroundColor Green
    } else {
        Write-Host "   [-] Discovery module simulation failed" -ForegroundColor Red
        throw "Discovery module simulation test failed"
    }

    Write-Host ""
    Write-Host "All tests passed! DiscoveryResult class scope fix is working correctly." -ForegroundColor Green
    Write-Host ""
    
    if ($Verbose) {
        Write-Host "Test Results Summary:" -ForegroundColor Cyan
        Write-Host "Module: $($result1.ModuleName)"
        Write-Host "Success: $($result1.Success)"
        Write-Host "Errors: $($result1.Errors.Count)"
        Write-Host "Warnings: $($result1.Warnings.Count)"
        Write-Host "Duration: $($result1.Metadata.DurationSeconds) seconds"
        Write-Host "ExecutionId: $($result1.ExecutionId)"
        Write-Host ""
        Write-Host "Discovery Result Summary:" -ForegroundColor Cyan
        Write-Host "Module: $($discoveryResult.ModuleName)"
        Write-Host "Success: $($discoveryResult.Success)"
        Write-Host "Users found: $($discoveryResult.Data.Users.Count)"
        Write-Host "Groups found: $($discoveryResult.Data.Groups.Count)"
        Write-Host "Warnings: $($discoveryResult.Warnings.Count)"
    }

} catch {
    Write-Host "Test failed with error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
}