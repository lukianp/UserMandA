# Fix XAML issues caused by virtualization script
$viewsPath = "D:\Scripts\UserMandA\GUI\Views"

# Fix duplicate VirtualizingStackPanel.IsVirtualizing
$files = Get-ChildItem -Path $viewsPath -Filter "*.xaml" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content

    # Remove duplicate VirtualizingStackPanel.IsVirtualizing properties
    $content = $content -replace ' VirtualizingStackPanel\.IsVirtualizing="True"\s+VirtualizingStackPanel\.IsVirtualizing="True"', ' VirtualizingStackPanel.IsVirtualizing="True"'

    # Fix malformed tags with extra spaces before closing >
    $content = $content -replace '>\s+>', '>'

    # Fix malformed attributes with trailing spaces
    $content = $content -replace '\s+>', '>'

    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "XAML fixes completed" -ForegroundColor Cyan