# Fix named imports to default imports in test files
$testFiles = Get-ChildItem -Path "src/renderer/views" -Filter "*.test.tsx" -Recurse

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Pattern: import { ViewName } from './ViewName';
    # Replace with: import ViewName from './ViewName';
    $content = $content -replace "import \{ (\w+View) \} from '(\.\/\w+View)';", "import `$1 from '`$2';"
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Fixed: $($file.Name)"
}

Write-Host "Complete! Fixed $($testFiles.Count) test files"
