# Test syntax of AzureDiscovery.psm1
$errors = $null
$content = Get-Content 'C:\enterprisediscovery\Modules\Discovery\AzureDiscovery.psm1' -Raw
$null = [System.Management.Automation.PSParser]::Tokenize($content, [ref]$errors)

if ($errors) {
    Write-Host "SYNTAX ERRORS FOUND:" -ForegroundColor Red
    $errors | ForEach-Object {
        Write-Host "  Line $($_.Token.StartLine): $($_.Message)" -ForegroundColor Yellow
    }
    exit 1
} else {
    Write-Host "No syntax errors found! File is valid." -ForegroundColor Green
    exit 0
}
