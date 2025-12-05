# Test Start-AzureDiscovery function (the one PowerShellService calls)
$ProfileName = "ljpops"
$modulePath = "C:\enterprisediscovery\Modules"
$outputPath = "C:\discoverydata\$ProfileName\Raw"

# Ensure paths exist
if (-not (Test-Path $outputPath)) { New-Item -Path $outputPath -ItemType Directory -Force | Out-Null }

Write-Host "Testing Start-AzureDiscovery function" -ForegroundColor Cyan

# Import the module
Import-Module "$modulePath\Discovery\AzureDiscovery.psm1" -Force -Verbose

# Get the credentials (simulating what PowerShellService does)
$TenantId = "1761861053003-z0qqa6atm"
$ClientId = "your-client-id-here"  # Replace with actual if available
$ClientSecret = "your-client-secret-here"  # Replace with actual if available

Write-Host "Calling Start-AzureDiscovery..." -ForegroundColor Yellow
Write-Host "Company: $ProfileName" -ForegroundColor Gray
Write-Host "Tenant: $TenantId" -ForegroundColor Gray
Write-Host "Output: $outputPath" -ForegroundColor Gray
Write-Host "--------------------" -ForegroundColor Gray

try {
    # Call Start-AzureDiscovery with the same parameters PowerShellService would use
    $result = Start-AzureDiscovery `
        -CompanyName $ProfileName `
        -TenantId $TenantId `
        -ClientId $ClientId `
        -ClientSecret $ClientSecret `
        -OutputPath $outputPath

    Write-Host "--------------------" -ForegroundColor Gray
    Write-Host "Function call completed" -ForegroundColor Yellow

    if ($result) {
        Write-Host "Result object returned: $($result.GetType().Name)" -ForegroundColor Cyan
        Write-Host "Success: $($result.Success)" -ForegroundColor $(if ($result.Success) { "Green" } else { "Red" })
        Write-Host "Records: $($result.RecordCount)" -ForegroundColor White
        Write-Host "Errors: $($result.Errors.Count)" -ForegroundColor $(if ($result.Errors.Count -gt 0) { "Red" } else { "Green" })
        Write-Host "Warnings: $($result.Warnings.Count)" -ForegroundColor $(if ($result.Warnings.Count -gt 0) { "Yellow" } else { "Green" })
        Write-Host "Duration: $($result.Duration)" -ForegroundColor White

        if ($result.Errors.Count -gt 0) {
            Write-Host "Errors found:" -ForegroundColor Red
            $result.Errors | ForEach-Object { Write-Host "  - $($_.Message)" -ForegroundColor Red }
        }

        if ($result.Warnings.Count -gt 0) {
            Write-Host "Warnings found:" -ForegroundColor Yellow
            $result.Warnings | ForEach-Object { Write-Host "  - $($_.Message)" -ForegroundColor Yellow }
        }

        if ($result.Metadata) {
            Write-Host "Metadata:" -ForegroundColor Cyan
            $result.Metadata.GetEnumerator() | ForEach-Object {
                Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Gray
            }
        }

        if ($result.Data) {
            Write-Host "Data Groups:" -ForegroundColor Cyan
            $result.Data | ForEach-Object {
                Write-Host "  $($_.Name): $($_.Count) items" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "No result returned" -ForegroundColor Red
    }

} catch {
    Write-Host "Function call failed with exception:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Stack Trace:" -ForegroundColor Yellow
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
}
