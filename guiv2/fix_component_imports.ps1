# Fix LoadingOverlay imports
$files = @(
    "src/renderer/views/computers/ComputerDetailView.tsx",
    "src/renderer/views/groups/GroupDetailView.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace "import \{ LoadingOverlay \} from", "import LoadingOverlay from"
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "Fixed LoadingOverlay in: $file"
    }
}

# Fix DataTable imports in infrastructure views
$infraFiles = Get-ChildItem -Path "src/renderer/views/infrastructure" -Filter "*.tsx" | Where-Object { $_.Name -notlike "*.test.tsx" }

foreach ($file in $infraFiles) {
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace "import \{ DataTable \} from", "import DataTable from"
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Fixed DataTable in: $($file.Name)"
}

Write-Host "Complete!"
