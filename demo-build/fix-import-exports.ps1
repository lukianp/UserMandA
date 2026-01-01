# Fix import/export mismatches in test files
$testFiles = Get-ChildItem -Path "src" -Filter "*.test.tsx" -Recurse

Write-Host "Found $($testFiles.Count) test files"
$fixedCount = 0

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $modified = $false

    # Pattern: import { ComponentName } from './ComponentName'
    # Check if the actual file exports default
    if ($content -match 'import\s+\{\s*(\w+)\s*\}\s+from\s+[\''"]\.\/(\w+)[\''"]') {
        $componentName = $Matches[1]
        $fileName = $Matches[2]

        # Check if the component file exists and uses default export
        $componentPath = Join-Path (Split-Path $file.FullName) "$fileName.tsx"
        if (Test-Path $componentPath) {
            $componentContent = Get-Content $componentPath -Raw
            if ($componentContent -match "export\s+default\s+$componentName") {
                Write-Host "Fixing import in $($file.Name): $componentName" -ForegroundColor Yellow
                # Replace named import with default import
                $pattern = "import\s+\{\s*$componentName\s*\}\s+from\s+(['""]\./$fileName['""])"
                $replacement = "import $componentName from `$1"
                $content = $content -replace $pattern, $replacement
                $modified = $true
            }
        }
    }

    # Save if modified
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $fixedCount++
        Write-Host "  Fixed: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`nFixed $fixedCount test files" -ForegroundColor Cyan
