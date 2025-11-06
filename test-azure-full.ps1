try {
    Write-Host "===== Testing Azure Discovery Import and Execution ====="
    Write-Host "Step 1: Importing AzureDiscovery module..."
    Import-Module 'C:\enterprisediscovery\Modules\Discovery\AzureDiscovery.psm1' -Force -ErrorAction Stop
    Write-Host "[OK] Module imported successfully"

    Write-Host ""
    Write-Host "Step 2: Creating test parameters..."
    $params = @{
        CompanyName = "ljpops"
        TenantId = "test-tenant"
        ClientId = "test-client"
        ClientSecret = "test-secret"
        OutputPath = "C:\DiscoveryData\ljpops\Raw"
        IncludeUsers = $true
        IncludeGroups = $true
        IncludeLicenses = $true
    }
    Write-Host "[OK] Parameters created"

    Write-Host ""
    Write-Host "Step 3: Calling Start-AzureDiscovery..."
    $ErrorActionPreference = 'Stop'
    $result = Start-AzureDiscovery @params

    Write-Host ""
    Write-Host "Step 4: Checking result..."
    if ($null -eq $result) {
        Write-Host "[ERROR] Result is NULL"
    } else {
        Write-Host "[OK] Result type: $($result.GetType().FullName)"
        Write-Host "Result content:"
        $result | ConvertTo-Json -Depth 3
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] ERROR OCCURRED:"
    Write-Host "Message: $($_.Exception.Message)"
    Write-Host "FullyQualifiedErrorId: $($_.FullyQualifiedErrorId)"
    Write-Host "ScriptStackTrace:"
    Write-Host $_.ScriptStackTrace
}
