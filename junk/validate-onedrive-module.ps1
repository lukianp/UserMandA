# Validate OneDriveDiscovery.psm1 syntax
$modulePath = 'D:\Scripts\UserMandA\Modules\Discovery\OneDriveDiscovery.psm1'

Write-Host "Validating module: $modulePath" -ForegroundColor Cyan

try {
    $errors = @()
    $content = Get-Content $modulePath -Raw -Encoding UTF8
    $null = [System.Management.Automation.PSParser]::Tokenize($content, [ref]$errors)

    if ($errors.Count -gt 0) {
        Write-Host "`nSYNTAX ERRORS FOUND:" -ForegroundColor Red
        $errors | ForEach-Object {
            Write-Host "  Line $($_.Token.StartLine): $($_.Message)" -ForegroundColor Yellow
        }
        exit 1
    } else {
        Write-Host "`nNo syntax errors found. Module is valid." -ForegroundColor Green

        # Try to import the module
        Write-Host "`nAttempting to import module..." -ForegroundColor Cyan
        Import-Module $modulePath -Force -ErrorAction Stop

        # Check exported functions
        $exportedFunctions = Get-Command -Module OneDriveDiscovery -CommandType Function
        Write-Host "Exported functions: $($exportedFunctions.Name -join ', ')" -ForegroundColor Green

        # Remove module
        Remove-Module OneDriveDiscovery -ErrorAction SilentlyContinue

        Write-Host "`nModule validation successful!" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "`nERROR during validation: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
