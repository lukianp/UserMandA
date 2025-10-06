#!/usr/bin/env pwsh
# Fix TypeScript Errors Systematically

Write-Host "Fixing TypeScript errors..." -ForegroundColor Cyan

# Pattern 1: Fix default exports in test files
Write-Host "`n1. Fixing test file imports..." -ForegroundColor Yellow
Get-ChildItem -Path "src/renderer/views" -Filter "*.test.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'import\s+(\w+)\s+from\s+[''"](.+?)[''"]') {
        $componentName = $matches[1]
        $path = $matches[2]
        $newContent = $content -replace "import\s+$componentName\s+from\s+[''"]$path[''"]", "import { $componentName } from '$path'"
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "  Fixed: $($_.Name)" -ForegroundColor Green
    }
}

# Pattern 2: Fix Badge variant errors (error -> danger)
Write-Host "`n2. Fixing Badge variants..." -ForegroundColor Yellow
Get-ChildItem -Path "src/renderer/views" -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'variant="error"') {
        $newContent = $content -replace 'variant="error"', 'variant="danger"'
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "  Fixed: $($_.Name)" -ForegroundColor Green
    }
}

# Pattern 3: Fix Lucide icon usage (pass as JSX element, not component reference)
Write-Host "`n3. Fixing Lucide icon usage..." -ForegroundColor Yellow
Get-ChildItem -Path "src/renderer/views" -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $modified = $false

    # Fix pattern: icon={IconName} -> icon={<IconName className="h-4 w-4" />}
    if ($content -match 'icon=\{(\w+)\}') {
        $newContent = $content -replace 'icon=\{(\w+)\}', 'icon={<$1 className="h-4 w-4" />}'
        $content = $newContent
        $modified = $true
    }

    if ($modified) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "  Fixed: $($_.Name)" -ForegroundColor Green
    }
}

# Pattern 4: Fix Select component children prop (use options instead)
Write-Host "`n4. Fixing Select component props..." -ForegroundColor Yellow
# This is complex - will need manual intervention for each file

# Pattern 5: Fix onChange handlers for Select (should receive value directly)
Write-Host "`n5. Fixing Select onChange handlers..." -ForegroundColor Yellow
Get-ChildItem -Path "src/renderer/views" -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'onChange=\{[^}]*e\.target\.value[^}]*\}') {
        # This needs manual fix - Select receives value directly, not event
        Write-Host "  MANUAL FIX NEEDED: $($_.Name)" -ForegroundColor Red
    }
}

# Pattern 6: Fix VirtualizedDataGrid rowSelection prop (should be selectionMode)
Write-Host "`n6. Fixing VirtualizedDataGrid props..." -ForegroundColor Yellow
Get-ChildItem -Path "src/renderer/views" -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'rowSelection="') {
        $newContent = $content -replace 'rowSelection="', 'selectionMode="'
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "  Fixed: $($_.Name)" -ForegroundColor Green
    }
}

# Pattern 7: Fix Checkbox onChange handlers (should receive boolean, not event)
Write-Host "`n7. Fixing Checkbox onChange handlers..." -ForegroundColor Yellow
Get-ChildItem -Path "src/renderer/views" -Filter "*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'Checkbox[^>]+onChange=\{[^}]*e\.target\.checked[^}]*\}') {
        Write-Host "  MANUAL FIX NEEDED: $($_.Name)" -ForegroundColor Red
    }
}

Write-Host "`nAutomatic fixes complete. Running TypeScript check..." -ForegroundColor Cyan
npm run type-check 2>&1 | Select-Object -First 50

Write-Host "`nDone! Review the output above for remaining errors." -ForegroundColor Green
