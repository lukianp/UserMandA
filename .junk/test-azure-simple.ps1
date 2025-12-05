# Simple Azure Discovery Test
$ProfileName = "ljpops"
$modulePath = "C:\enterprisediscovery\Modules"
$outputPath = "C:\discoverydata\$ProfileName\Raw"
$logsPath = "C:\discoverydata\$ProfileName\Logs"

# Ensure paths exist
if (-not (Test-Path $outputPath)) { New-Item -Path $outputPath -ItemType Directory -Force | Out-Null }
if (-not (Test-Path $logsPath)) { New-Item -Path $logsPath -ItemType Directory -Force | Out-Null }

Write-Host "Azure Discovery Test" -ForegroundColor Cyan

# Import modules
Write-Host "Importing modules..." -ForegroundColor Yellow
try {
    Import-Module "$modulePath\Core\ClassDefinitions.psm1" -Force
    Import-Module "$modulePath\Authentication\SessionManager.psm1" -Force
    Import-Module "$modulePath\Authentication\AuthenticationService.psm1" -Force
    Import-Module "$modulePath\Discovery\DiscoveryBase.psm1" -Force
    Import-Module "$modulePath\Discovery\AzureDiscovery.psm1" -Force
    Write-Host "Modules imported" -ForegroundColor Green
} catch {
    Write-Host "Failed to import modules: $_" -ForegroundColor Red
    exit 1
}

# Create session
$sessionId = [guid]::NewGuid().ToString()
Write-Host "Session ID: $sessionId" -ForegroundColor Green

# Set up configuration
$config = @{
    TenantId = "1761861053003-z0qqa6atm"
    ProfileName = $ProfileName
    Services = @("Users", "Groups", "Licenses")
}

$context = @{
    Paths = @{
        RawDataOutput = $outputPath
        Logs = $logsPath
    }
}

Write-Host "Running Azure Discovery..." -ForegroundColor Yellow
Write-Host "Tenant: $($config.TenantId)" -ForegroundColor Gray
Write-Host "Services: $($config.Services -join ', ')" -ForegroundColor Gray
Write-Host "--------------------" -ForegroundColor Gray

try {
    $result = Invoke-AzureDiscovery -Configuration $config -Context $context -SessionId $sessionId

    Write-Host "--------------------" -ForegroundColor Gray
    Write-Host "Discovery completed" -ForegroundColor Yellow

    if ($result) {
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
    Write-Host "Discovery failed with exception:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Stack Trace:" -ForegroundColor Yellow
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
}
