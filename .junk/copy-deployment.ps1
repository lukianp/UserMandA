# Copy all worked-on files from deployment to workspace

$source = "C:\enterprisediscovery"
$dest = "D:\Scripts\UserMandA"

Write-Host "Copying all worked-on files from deployment to workspace..." -ForegroundColor Cyan
Write-Host "Source: $source" -ForegroundColor Gray
Write-Host "Destination: $dest" -ForegroundColor Gray

# Copy Modules directory
Write-Host "Copying Modules directory..." -ForegroundColor Yellow
Copy-Item -Path "$source\Modules\*" -Destination "$dest\Modules\" -Recurse -Force
Write-Host "Modules copied" -ForegroundColor Green

# Copy src directory
Write-Host "Copying src directory..." -ForegroundColor Yellow
Get-ChildItem -Path "$source\src" -Recurse -File | Where-Object { $_.Name -ne 'nul' } | ForEach-Object {
    $relativePath = $_.FullName.Replace($source, "")
    $destPath = Join-Path $dest $relativePath
    $destDir = Split-Path $destPath -Parent

    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }

    Copy-Item -Path $_.FullName -Destination $destPath -Force
}
Write-Host "src directory copied" -ForegroundColor Green

# Copy config directory
Write-Host "Copying config directory..." -ForegroundColor Yellow
Copy-Item -Path "$source\config" -Destination "$dest\" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "config copied" -ForegroundColor Green

# Copy PowerShell scripts
Write-Host "Copying PowerShell scripts..." -ForegroundColor Yellow
Copy-Item -Path "$source\*.ps1" -Destination "$dest\" -Force -ErrorAction SilentlyContinue
Write-Host "PowerShell scripts copied" -ForegroundColor Green

# Copy markdown documentation
Write-Host "Copying documentation..." -ForegroundColor Yellow
Copy-Item -Path "$source\*.md" -Destination "$dest\" -Force -ErrorAction SilentlyContinue
Write-Host "Documentation copied" -ForegroundColor Green

Write-Host "All files copied successfully!" -ForegroundColor Green
