$viewsPath = "D:\Scripts\UserMandA-1\guiv2\src\renderer\views\discovered"
$files = Get-ChildItem "$viewsPath\*.tsx" -Exclude "_*.tsx"

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content

    # Fix main container
    $content = $content -replace 'className="([^"]*?)h-full([^"]*?flex[^"]*?flex-col[^"]*?)"', 'className="$1h-screen$2 overflow-hidden"'
    $content = $content -replace '(className="[^"]*?flex[^"]*?flex-col[^"]*?h-screen[^"]*?)"([^o]|$)', '$1 overflow-hidden"$2'

    # Fix header
    $content = $content -replace '(\{/\* Header \*/\}\s*<div className="[^"]*?border-b[^"]*?)"([^>]*?>)', '$1 flex-shrink-0"$2'

    # Fix statistics cards
    $content = $content -replace '(\{/\* Statistics[^}]*?\*/\}[^<]*<div className="[^"]*?grid[^"]*?gap-\d+[^"]*?p-\d+[^"]*?)"([^>]*?>)', '$1 flex-shrink-0"$2'
    $content = $content -replace '(<div className="p-\d+ grid grid-cols[^"]*?)"([^f>])', '$1 flex-shrink-0"$2'

    # Fix tabs
    $content = $content -replace '(\{/\* Tabs \*/\}\s*<div className="[^"]*?px-\d+[^"]*?)"([^>]*?>)', '$1 flex-shrink-0"$2'

    # Fix search/actions
    $content = $content -replace '(\{/\* Search[^}]*?\*/\}[^<]*<div className="[^"]*?flex[^"]*?gap-\d+[^"]*?mb-\d+[^"]*?)"([^>]*?>)', '$1 flex-shrink-0"$2'

    # Fix content area
    $content = $content -replace '(\{/\* (?:Content Area|Tab Content) \*/\}\s*<div className="flex-1 )overflow-auto', '$1overflow-y-auto min-h-0'

    # Fix inner containers
    $content = $content -replace '(<div className=")h-full (flex flex-col p-\d+)', '$1$2'

    # Fix data grids
    $content = $content -replace '(\{/\* Data Grid \*/\}\s*<div className=")flex-1 (bg-white[^"]*?rounded-lg shadow overflow-hidden)"', '$1$2" style={{ minHeight: "600px" }}'

    # Remove duplicates
    $content = $content -replace 'flex-shrink-0\s+flex-shrink-0', 'flex-shrink-0'

    if ($content -ne $original) {
        Set-Content $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.Name)"
        $count++
    }
}

Write-Host ""
Write-Host "Total files processed: $count"
