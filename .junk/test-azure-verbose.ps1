$VerbosePreference = 'Continue'
$ErrorActionPreference = 'Continue'

Write-Host "========== Testing Azure Discovery with Verbose Output =========="

try {
    Write-Host "`n[1] Importing AzureDiscovery module..."
    Import-Module 'C:\enterprisediscovery\Modules\Discovery\AzureDiscovery.psm1' -Force -ErrorAction Stop -Verbose
    Write-Host "[OK] Module imported"

    Write-Host "`n[2] Checking if Start-AzureDiscovery exists..."
    $cmd = Get-Command Start-AzureDiscovery -ErrorAction SilentlyContinue
    if ($cmd) {
        Write-Host "[OK] Start-AzureDiscovery found"
    } else {
        Write-Host "[ERROR] Start-AzureDiscovery NOT FOUND!"
        exit 1
    }

    Write-Host "`n[3] Checking if Invoke-AzureDiscovery exists..."
    $cmd2 = Get-Command Invoke-AzureDiscovery -ErrorAction SilentlyContinue
    if ($cmd2) {
        Write-Host "[OK] Invoke-AzureDiscovery found"
    } else {
        Write-Host "[ERROR] Invoke-AzureDiscovery NOT FOUND!"
        exit 1
    }

    Write-Host "`n[4] Creating parameters..."
    $params = @{
        CompanyName = "ljpops"
        TenantId = "test-tenant"
        ClientId = "test-client"
        ClientSecret = "test-secret"
        OutputPath = "C:\DiscoveryData\ljpops\Raw"
    }
    Write-Host "[OK] Parameters created"

    Write-Host "`n[5] Calling Start-AzureDiscovery..."
    Write-Host "About to call function..."
    $result = Start-AzureDiscovery @params -Verbose
    Write-Host "Function returned"

    Write-Host "`n[6] Examining result..."
    Write-Host "Result is null: $($null -eq $result)"
    Write-Host "Result is empty string: $($result -eq '')"
    Write-Host "Result type: $($result.GetType().FullName)"

} catch {
    Write-Host "`n[ERROR] Exception occurred:"
    Write-Host "Message: $($_.Exception.Message)"
    Write-Host "Type: $($_.Exception.GetType().FullName)"
    Write-Host "ScriptStackTrace:"
    Write-Host $_.ScriptStackTrace
}

Write-Host "`n========== Test Complete =========="
