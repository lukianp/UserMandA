$errors = @()
$content = Get-Content 'D:\Scripts\UserMandA\Modules\Discovery\AzureDiscovery.psm1' -Raw
$tokens = [System.Management.Automation.PSParser]::Tokenize($content, [ref]$errors)

if ($errors.Count -gt 0) {
    Write-Host "Parse Errors Found:"
    foreach ($err in $errors) {
        Write-Host "Line $($err.Token.StartLine), Column $($err.Token.StartColumn): $($err.Message)"
    }
} else {
    Write-Host "No parse errors - file is syntactically valid!"
}
