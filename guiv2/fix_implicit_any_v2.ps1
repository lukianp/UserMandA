# Fix implicit any types in test files
$testFiles = Get-ChildItem -Path "src/renderer" -Filter "*.test.t*" -Recurse

$fixCount = 0
foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Pattern 1: data: [] -> data: [] as any[]
    $content = $content -replace '(\s+data:\s*)\[\]', '$1[] as any[]'
    
    # Pattern 2: selectedItems: [] -> selectedItems: [] as any[]
    $content = $content -replace '(\s+selectedItems:\s*)\[\]', '$1[] as any[]'
    
    # Pattern 3: error: null -> error: null as any
    $content = $content -replace '(\s+error:\s*)null', '$1null as any'
    
    # Pattern 4: onchange: (for themeService)
    $content = $content -replace '(\s+onchange:\s*)(\w+)', '$1$2 as any'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixCount++
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "`nComplete! Fixed $fixCount files"
