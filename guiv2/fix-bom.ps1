# Fix profiles.json - Remove BOM and update with correct Azure credentials
$profilePath = "$env:APPDATA\MandADiscoverySuite\profiles.json"

# Read file content and remove BOM
$content = [System.IO.File]::ReadAllText($profilePath)
$content = $content.TrimStart([char]0xFEFF)

# Parse JSON
$json = $content | ConvertFrom-Json

# Update with correct Azure credentials
$json.profiles[0].tenantId = "4c54e13b-5380-483b-a9af-32e1f265f614"
if (-not ($json.profiles[0].PSObject.Properties.Name -contains "clientId")) {
    $json.profiles[0] | Add-Member -NotePropertyName "clientId" -NotePropertyValue "4277e7fc-7db6-4ae8-9dc5-9efe84e1f5da"
} else {
    $json.profiles[0].clientId = "4277e7fc-7db6-4ae8-9dc5-9efe84e1f5da"
}
$json.profiles[0].lastModified = (Get-Date).ToString("o")

# Convert back to JSON
$newContent = $json | ConvertTo-Json -Depth 10

# Write without BOM using .NET method
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($profilePath, $newContent, $utf8NoBom)

Write-Host "Fixed profiles.json (BOM removed, credentials updated):"
Write-Host $newContent
