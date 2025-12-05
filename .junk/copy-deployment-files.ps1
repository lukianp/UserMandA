# Copy deployment files to workspace

$source = "C:\enterprisediscovery"
$dest = "D:\Scripts\UserMandA"

# Copy src directory, excluding nul files
Write-Host "Copying src directory..."
Get-ChildItem -Path "$source\src" -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne 'nul' } |
    ForEach-Object {
        $relativePath = $_.FullName.Replace($source, "")
        $destPath = Join-Path $dest $relativePath
        $destDir = Split-Path $destPath -Parent

        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }

        Copy-Item -Path $_.FullName -Destination $destPath -Force
        Write-Host "  Copied: $relativePath"
    }

Write-Host "`nCopy complete!"
