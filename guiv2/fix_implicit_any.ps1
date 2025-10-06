# Fix implicit any types in test files
$testFiles = Get-ChildItem -Path "src/renderer" -Filter "*.test.tsx" -Recurse

$fixCount = 0
foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Pattern 1: data: [] -> data: [] as any[]
    if ($content -match "\s+data:\s*\[\],?\s*$") {
        $content = $content -replace "(\s+)data:\s*\[\],", "`$1data: [] as any[],"
        $modified = $true
    }
    
    # Pattern 2: selectedItems: [] -> selectedItems: [] as any[]
    if ($content -match "\s+selectedItems:\s*\[\],?\s*$") {
        $content = $content -replace "(\s+)selectedItems:\s*\[\],", "`$1selectedItems: [] as any[],"
        $modified = $true
    }
    
    # Pattern 3: error: null -> error: null as any
    if ($content -match "\s+error:\s*null,?\s*$") {
        $content = $content -replace "(\s+)error:\s*null,", "`$1error: null as any,"
        $modified = $true
    }
    
    # Pattern 4: onchange: ... -> onchange: ... (for themeService)
    if ($content -match "\s+onchange:\s*") {
        $content = $content -replace "(\s+)onchange:\s*(.*?),", "`$1onchange: `$2 as any,"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixCount++
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "`nComplete! Fixed $fixCount test files"
