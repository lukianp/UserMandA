$profilePath = "$env:APPDATA\MandADiscoverySuite\profiles.json"
$json = Get-Content $profilePath -Raw | ConvertFrom-Json

# Update tenant ID with the real Azure tenant ID
$json.profiles[0].tenantId = "4c54e13b-5380-483b-a9af-32e1f265f614"

# Add client ID
$json.profiles[0] | Add-Member -NotePropertyName "clientId" -NotePropertyValue "4277e7fc-7db6-4ae8-9dc5-9efe84e1f5da" -Force

# Update lastModified
$json.profiles[0].lastModified = (Get-Date).ToString("o")

# Save
$json | ConvertTo-Json -Depth 10 | Set-Content $profilePath -Encoding UTF8

Write-Host "Updated profiles.json:"
Get-Content $profilePath
