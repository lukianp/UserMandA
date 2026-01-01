# Fix profiles.json with the NEW Azure credentials from latest app registration
$profilePath = "$env:APPDATA\MandADiscoverySuite\profiles.json"

# Read and remove BOM if present
$content = [System.IO.File]::ReadAllText($profilePath)
$content = $content.TrimStart([char]0xFEFF)

# Parse JSON
$json = $content | ConvertFrom-Json

# Update with CORRECT credentials from Azure portal
$json.profiles[0].tenantId = "4c54e13b-5380-483b-a9af-32e1f265f614"
$json.profiles[0].clientId = "6479e4ae-f36c-454c-b528-f29eb2985580"
$json.profiles[0].lastModified = (Get-Date).ToString("o")

# Convert back to JSON
$newContent = $json | ConvertTo-Json -Depth 10

# Write WITHOUT BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($profilePath, $newContent, $utf8NoBom)

Write-Host "Updated profiles.json with NEW credentials:"
Write-Host "  TenantId: 4c54e13b-5380-483b-a9af-32e1f265f614"
Write-Host "  ClientId: 6479e4ae-f36c-454c-b528-f29eb2985580"
Write-Host ""
Write-Host "File content:"
Get-Content $profilePath
