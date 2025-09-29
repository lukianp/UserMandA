# PowerShell script to add VirtualizingStackPanel.IsVirtualizing="True" to all DataGrid and ListBox controls
# This improves UI performance for large datasets

$viewsPath = "D:\Scripts\UserMandA\GUI\Views"
$modifiedFiles = @()

# Get all XAML files
$xamlFiles = Get-ChildItem -Path $viewsPath -Filter "*.xaml" -Recurse

foreach ($file in $xamlFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $modified = $false

    # Add virtualization to DataGrid controls that don't already have it
    if ($content -match '<DataGrid' -and $content -notmatch 'VirtualizingStackPanel\.IsVirtualizing') {
        # Match DataGrid opening tags and add virtualization property
        $content = $content -replace '(<DataGrid\s+[^>]*?)(?<!VirtualizingStackPanel\.IsVirtualizing="True"\s*)>', '$1 VirtualizingStackPanel.IsVirtualizing="True">'
        $modified = $true
    }

    # Add virtualization to ListBox controls that don't already have it
    if ($content -match '<ListBox' -and $content -notmatch 'VirtualizingStackPanel\.IsVirtualizing') {
        # Match ListBox opening tags and add virtualization property
        $content = $content -replace '(<ListBox\s+[^>]*?)(?<!VirtualizingStackPanel\.IsVirtualizing="True"\s*)>', '$1 VirtualizingStackPanel.IsVirtualizing="True">'
        $modified = $true
    }

    # Only write if changes were made
    if ($modified -and $content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $modifiedFiles += $file.FullName
        Write-Host "Modified: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`nTotal files modified: $($modifiedFiles.Count)" -ForegroundColor Cyan
Write-Host "`nModified files:"
$modifiedFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }