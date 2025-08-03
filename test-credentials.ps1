Import-Module 'C:\enterprisediscovery\net6.0-windows\Modules\Core\CredentialLoader.psm1' -Force
$credentials = Get-CompanyCredentials -CompanyName 'ljpops'
Write-Host "ExpiryDate: $($credentials.ExpiryDate)"
$expiryCheck = Test-CredentialExpiry -Credentials $credentials
Write-Host "Valid: $($expiryCheck.Valid)"
Write-Host "Message: $($expiryCheck.Message)"
if ($expiryCheck.Warning) { 
    Write-Host "Warning: $($expiryCheck.Warning)" 
}