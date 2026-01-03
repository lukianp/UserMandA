# Script to add scrolling capability to all discovered views
# Applies the standard scrolling pattern to all discovered view files

$viewsPath = "D:\Scripts\UserMandA-1\guiv2\src\renderer\views\discovered"
$files = Get-ChildItem "$viewsPath\*.tsx" -Exclude "_*.tsx" | Sort-Object Name

$filesProcessed = 0
$filesSkipped = 0
$errors = @()

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content
        $changed = $false

        # Pattern 1: Main container - change h-full to h-screen and add overflow-hidden
        if ($content -match 'className="(.*?)h-full(.*?)flex(.*?)flex-col(.*?)"') {
            $content = $content -replace '(className="[^"]*?)h-full([^"]*?flex[^"]*?flex-col[^"]*?)"', '$1h-screen$2 overflow-hidden"'
            $changed = $true
        }
        if ($content -match 'className="(.*?)flex(.*?)flex-col(.*?)h-screen(.*?)"' -and $content -notmatch 'overflow-hidden') {
            $content = $content -replace '(className="[^"]*?flex[^"]*?flex-col[^"]*?h-screen[^"]*?)"', '$1 overflow-hidden"'
            $changed = $true
        }

        # Pattern 2: Header sections - add flex-shrink-0
        $content = $content -replace '({/\* Header \*/}\s*<div className="[^"]*?border-b[^"]*?)"([^>]*?>)', '$1 flex-shrink-0"$2'

        # Pattern 3: Statistics/Cards sections - add flex-shrink-0
        $content = $content -replace '({/\* Statistics[^}]*?\*/}\s*.*?<div className="[^"]*?grid[^"]*?gap-\d+[^"]*?p-\d+[^"]*?)"([^>]*?>)', '$1 flex-shrink-0"$2'
        $content = $content -replace '(<div className="p-\d+ grid grid-cols[^"]*?)"([^>]*?>)', '$1 flex-shrink-0"$2'

        # Pattern 4: Tabs sections - add flex-shrink-0
        $content = $content -replace '({/\* Tabs \*/}\s*<div className="[^"]*?px-\d+[^"]*?)"([^>]*?>)', '$1 flex-shrink-0"$2'

        # Pattern 5: Search/Actions sections - add flex-shrink-0
        $content = $content -replace '({/\* Search[^}]*?\*/}\s*.*?<div className="[^"]*?flex[^"]*?gap-\d+[^"]*?mb-\d+[^"]*?)"([^>]*?>)', '$1 flex-shrink-0"$2'

        # Pattern 6: Content Area/Tab Content - change overflow-auto to overflow-y-auto min-h-0
        $content = $content -replace '({/\* (?:Content Area|Tab Content) \*/}\s*<div className="flex-1 )overflow-auto', '$1overflow-y-auto min-h-0'

        # Pattern 7: Inner flex containers - remove h-full from data tab containers
        $content = $content -replace '(<div className=")(h-full )(flex flex-col p-\d+)', '$1$3'

        # Pattern 8: Data Grid containers - remove flex-1 and add minHeight style
        $dataGridPattern = '({/\* Data Grid \*/}\s*<div className=")flex-1 (bg-white[^"]*?rounded-lg shadow overflow-hidden)"'
        $dataGridReplace = '$1$2" style={{ minHeight: "600px" }}'
        $content = $content -replace $dataGridPattern, $dataGridReplace

        # Remove duplicate flex-shrink-0
        $content = $content -replace 'flex-shrink-0\s+flex-shrink-0', 'flex-shrink-0'

        # Check if changes were made
        if ($content -ne $originalContent) {
            Set-Content $file.FullName -Value $content -NoNewline
            Write-Host "✓ Processed: $($file.Name)" -ForegroundColor Green
            $filesProcessed++
        } else {
            Write-Host "- Skipped (no changes): $($file.Name)" -ForegroundColor Yellow
            $filesSkipped++
        }
    } catch {
        Write-Host "✗ Error processing $($file.Name): $PSItem" -ForegroundColor Red
        $errorMsg = "$($file.Name): $PSItem"
        $errors += $errorMsg
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Files processed: $filesProcessed" -ForegroundColor Green
Write-Host "  Files skipped: $filesSkipped" -ForegroundColor Yellow
if ($errors.Count -gt 0) {
    Write-Host "  Errors: $($errors.Count)" -ForegroundColor Red
} else {
    Write-Host "  Errors: $($errors.Count)" -ForegroundColor Green
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "Errors encountered:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "  $err" -ForegroundColor Red
    }
}
