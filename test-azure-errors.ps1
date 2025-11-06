try {
    Import-Module 'C:\enterprisediscovery\Modules\Discovery\AzureDiscovery.psm1' -Force -ErrorAction Stop

    $params = @{
        CompanyName = "ljpops"
        TenantId = "test-tenant"
        ClientId = "test-client"
        ClientSecret = "test-secret"
        OutputPath = "C:\DiscoveryData\ljpops\Raw"
    }

    Write-Host "Calling Start-AzureDiscovery with test credentials..."
    $result = Start-AzureDiscovery @params

    Write-Host "Result is null: $($null -eq $result)"

    if ($result) {
        Write-Host "Result type: $($result.GetType().FullName)"

        # Try to access properties
        Write-Host "Checking for errors..."
        if ($result.PSObject.Properties['Errors']) {
            Write-Host "Errors count: $($result.Errors.Count)"
            foreach ($err in $result.Errors) {
                Write-Host "  Error: $err"
            }
        }

        if ($result.PSObject.Properties['Success']) {
            Write-Host "Success: $($result.Success)"
        }

        Write-Host "All properties:"
        $result | Get-Member -MemberType Property | ForEach-Object {
            Write-Host "  $($_.Name): $($result.($_.Name))"
        }
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    Write-Host $_.ScriptStackTrace
}
