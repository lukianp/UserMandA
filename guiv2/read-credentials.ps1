Add-Type -AssemblyName System.Security

$configPath = "C:\DiscoveryData\ljpops\Credentials\discoverycredentials.config"

Write-Host "Reading encrypted credentials from: $configPath"

$encryptedContent = Get-Content $configPath -Raw
$encryptedBytes = [Convert]::FromBase64String($encryptedContent)
$decryptedBytes = [System.Security.Cryptography.ProtectedData]::Unprotect($encryptedBytes, $null, [System.Security.Cryptography.DataProtectionScope]::CurrentUser)
$decryptedJson = [System.Text.Encoding]::UTF8.GetString($decryptedBytes)

Write-Host ""
Write-Host "Decrypted credentials:"
Write-Host $decryptedJson
