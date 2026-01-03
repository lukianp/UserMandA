$viewsPath = "D:\Scripts\UserMandA-1\guiv2\src\renderer\views\discovered"
$files = Get-ChildItem "$viewsPath\*.tsx" -Exclude "_*.tsx"

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    $changed = $false

    # Skip if already has scrolling pattern
    if ($content -match 'overflow-y-auto min-h-0' -and $content -match 'h-screen.*overflow-hidden') {
        continue
    }

    # Pattern 1: Fix main container - various patterns
    if ($content -match 'className="[^"]*h-full[^"]*flex[^"]*flex-col[^"]*"') {
        $content = $content -replace '(className="[^"]*?)h-full([^"]*?flex[^"]*?flex-col[^"]*?)"', '$1h-screen$2 overflow-hidden"'
        $changed = $true
    }
    if ($content -match 'className="[^"]*flex[^"]*flex-col[^"]*h-full[^"]*"') {
        $content = $content -replace '(className="[^"]*?flex[^"]*?flex-col[^"]*?)h-full([^"]*?)"', '$1h-screen$2 overflow-hidden"'
        $changed = $true
    }
    if ($content -match 'className="[^"]*flex[^"]*flex-col[^"]*h-screen[^"]*"' -and $content -notmatch 'overflow-hidden') {
        $content = $content -replace '(className="[^"]*?flex[^"]*?flex-col[^"]*?h-screen[^"]*?)"', '$1 overflow-hidden"'
        $changed = $true
    }

    # Pattern 2: Add flex-shrink-0 to headers with border-b
    $content = $content -replace '(<div className="[^"]*border-b[^"]*)"([^f>])', '$1 flex-shrink-0"$2'

    # Pattern 3: Add flex-shrink-0 to grid containers (statistics cards)
    $content = $content -replace '(<div className="[^"]*grid[^"]*gap-\d+[^"]*p-\d+[^"]*)"([^f>])', '$1 flex-shrink-0"$2'
    $content = $content -replace '(<div className="p-\d+[^"]*grid[^"]*gap-\d+[^"]*)"([^f>])', '$1 flex-shrink-0"$2'

    # Pattern 4: Add flex-shrink-0 to px-6 containers (usually tabs)
    $content = $content -replace '(<div className="px-6[^"]*)"([^>]*?border-b)', '$1 flex-shrink-0"$2'

    # Pattern 5: Fix content area - overflow-auto to overflow-y-auto min-h-0
    $content = $content -replace '(className="flex-1 )overflow-auto', '$1overflow-y-auto min-h-0'
    $content = $content -replace '(className="[^"]*flex-1[^"]*?)overflow-auto', '$1overflow-y-auto min-h-0'

    # Pattern 6: Remove h-full from inner flex containers
    $content = $content -replace '(<div className=")h-full (flex flex-col)', '$1$2'

    # Pattern 7: Fix data grid containers
    $content = $content -replace '(className=")flex-1 (bg-white[^"]*rounded-lg shadow[^"]*)"', '$1$2" style={{ minHeight: "600px" }}'

    # Remove duplicates
    $content = $content -replace 'overflow-hidden\s+overflow-hidden', 'overflow-hidden'
    $content = $content -replace 'flex-shrink-0\s+flex-shrink-0', 'flex-shrink-0'
    $content = $content -replace '\s+flex-shrink-0"', ' flex-shrink-0"'

    if ($content -ne $original) {
        Set-Content $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
        $count++
    }
}

Write-Host "`nTotal files processed: $count" -ForegroundColor Cyan
