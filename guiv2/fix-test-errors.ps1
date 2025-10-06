# Fix TypeScript test errors script
$testFile = "src/main/services/powerShellService.test.ts"

# Read the file
$content = Get-Content $testFile -Raw

# Pattern 1: Fix users: [] to users: [] as any[]
$content = $content -replace 'users: \[\]', 'users: [] as any[]'

# Pattern 2: Fix executeScript object calls to separate parameters
# Replace: service.executeScript({ scriptPath: 'X', args: Y, options: Z })
# With: service.executeScript('X', Y, Z)
$content = $content -replace 'service\.executeScript\(\s*\{\s*scriptPath:\s*([''"])([^''"]+)\1\s*,\s*args:\s*(\[[^\]]*\])\s*,\s*options:\s*(\{[^\}]*\})\s*\}\s*\)', 'service.executeScript($1$2$1, $3, $4)'

# Pattern 3: Fix executeModule object calls to separate parameters
# Replace: service.executeModule({ modulePath: 'X', functionName: 'Y', parameters: Z, options: W })
# With: service.executeModule('X', 'Y', Z, W)
$content = $content -replace 'service\.executeModule\(\s*\{\s*modulePath:\s*([''"])([^''"]+)\1\s*,\s*functionName:\s*([''"])([^''"]+)\3\s*,\s*parameters:\s*(\{[^\}]*\})\s*,\s*options:\s*(\{[^\}]*\})\s*\}\s*\)', 'service.executeModule($1$2$1, $3$4$3, $5, $6)'

# Pattern 4: Fix discoverModules('path') to discoverModules()
$content = $content -replace 'service\.discoverModules\([^)]+\)', 'service.discoverModules()'

# Save the file
$content | Set-Content $testFile -NoNewline

Write-Host "Fixed $testFile" -ForegroundColor Green
