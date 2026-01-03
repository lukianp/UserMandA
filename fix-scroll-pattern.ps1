# Fix scroll patterns in all view files

$viewsPath = "D:\Scripts\UserMandA-1\guiv2\src\renderer\views"
$files = Get-ChildItem -Path $viewsPath -Recurse -Filter "*.tsx" | Where-Object {
    $_.FullName -notmatch '\.test\.tsx$' -and
    $_.FullName -notmatch '\.bak' -and
    $_.FullName -notmatch '_routes\.generated\.tsx' -and
    $_.FullName -notmatch '_sidebar\.generated\.tsx'
}

Write-Host "Found $($files.Count) files to process"
Write-Host ""

$hFullCount = 0
$overflowCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }

    $originalContent = $content
    $modified = $false

    # Fix 1: h-full flex flex-col -> min-h-full flex flex-col
    if ($content -match 'className="h-full flex flex-col') {
        $content = $content -replace 'className="h-full flex flex-col', 'className="min-h-full flex flex-col'
        $hFullCount++
        $modified = $true
        Write-Host "[h-full] $($file.Name)"
    }

    # Fix 2: flex-1 overflow-hidden -> flex-1 overflow-auto
    if ($content -match 'className="flex-1 overflow-hidden') {
        $content = $content -replace 'className="flex-1 overflow-hidden', 'className="flex-1 overflow-auto'
        $overflowCount++
        $modified = $true
        Write-Host "[overflow] $($file.Name)"
    }

    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}

Write-Host ""
Write-Host "========================================="
Write-Host "Summary:"
Write-Host "  h-full -> min-h-full:        $hFullCount files"
Write-Host "  overflow-hidden -> auto:     $overflowCount files"
Write-Host "========================================="
