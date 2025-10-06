# PowerShell script to fix common TypeScript errors across view files

$guiv2Path = "D:\Scripts\UserMandA\guiv2\src\renderer\views"

Write-Host "Starting TypeScript error fixes..." -ForegroundColor Green

# Get all .tsx and .ts files in views directory
$files = Get-ChildItem -Path $guiv2Path -Recurse -Include *.tsx,*.ts

$totalFiles = $files.Count
$currentFile = 0

foreach ($file in $files) {
    $currentFile++
    $percentComplete = [math]::Round(($currentFile / $totalFiles) * 100, 2)
    Write-Progress -Activity "Fixing TypeScript errors" -Status "Processing $($file.Name)" -PercentComplete $percentComplete

    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $changed = $false

    # Fix 1: addNotification with 2 arguments -> object with type and message
    if ($content -match "addNotification\('(success|error|warning|info)', '([^']+)'\)") {
        $content = $content -replace "addNotification\('(success|error|warning|info)', '([^']+)'\)", "addNotification({ type: '`$1', message: '`$2' })"
        $changed = $true
    }

    # Fix 2: addNotification with template literal
    if ($content -match 'addNotification\(''(success|error|warning|info)'', `([^`]+)`\)') {
        $content = $content -replace 'addNotification\(''(success|error|warning|info)'', `([^`]+)`\)', 'addNotification({ type: ''$1'', message: `$2` })'
        $changed = $true
    }

    # Fix 3: Select onChange with e.target.value -> value directly
    $content = $content -replace 'onChange=\{e => ([^\}]+)\(e\.target\.value\)\}', 'onChange={(value) => $1(value)}'
    if ($content -ne $originalContent) { $changed = $true; $originalContent = $content }

    # Fix 4: Remove icon prop from Input components (if it's a JSX element)
    $content = $content -replace '\s+icon=\{<[^>]+>\}', ''
    if ($content -ne $originalContent) { $changed = $true; $originalContent = $content }

    # Fix 5: Remove enableExport prop from VirtualizedDataGrid
    $content = $content -replace '\s+enableExport(?:=\{true\})?', ''
    if ($content -ne $originalContent) { $changed = $true; $originalContent = $content }

    # Fix 6: Remove data-cy prop from VirtualizedDataGrid
    $content = $content -replace '\s+data-cy="[^"]*"', ''
    if ($content -ne $originalContent) { $changed = $true }

    # Save if changed
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Yellow
    }
}

Write-Progress -Activity "Fixing TypeScript errors" -Completed
Write-Host "Completed! Processed $totalFiles files." -ForegroundColor Green
