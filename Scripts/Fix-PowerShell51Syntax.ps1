# Fix PowerShell 5.1 Syntax Issues in Processing Modules
# This script fixes .Where() method calls and Join-String cmdlet usage

param(
    [string]$ModulePath = "Modules/Processing"
)

Write-Host "Fixing PowerShell 5.1 syntax issues in processing modules..." -ForegroundColor Green

$filesToFix = Get-ChildItem -Path $ModulePath -Filter "*.psm1" -Recurse

foreach ($file in $filesToFix) {
    Write-Host "Processing: $($file.FullName)" -ForegroundColor Yellow
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Fix .Where() method calls - replace with Where-Object pipeline
    $content = $content -replace '\.Where\(\{([^}]+)\}\)', ' | Where-Object {$1}'
    
    # Fix Join-String cmdlet usage - replace with -join operator
    $content = $content -replace '\|\s*Join-String\s+-Separator\s+"([^"]+)"', ') -join "$1"'
    $content = $content -replace '\|\s*Join-String\s+-Separator\s+''([^'']+)''', ') -join ''$1'''
    
    # Add parentheses around pipeline expressions that need them for -join
    $content = $content -replace '(\$\w+\s*\|\s*Where-Object[^)]+)\s*\)\s*-join', '($1) -join'
    
    # Check if any changes were made
    if ($content -ne $originalContent) {
        Write-Host "  - Found and fixed PowerShell 5.1 syntax issues" -ForegroundColor Cyan
        
        # Write the fixed content back to the file
        $content | Set-Content -Path $file.FullName -Encoding UTF8 -NoNewline
        
        Write-Host "  - File updated successfully" -ForegroundColor Green
    } else {
        Write-Host "  - No syntax issues found" -ForegroundColor Gray
    }
}

Write-Host "PowerShell 5.1 syntax fix completed!" -ForegroundColor Green