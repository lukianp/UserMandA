# Fix Error Variable Conflicts in Processing Modules
# This script replaces 'Error = $null' and '$result.Error =' with 'ErrorInfo' equivalents

param(
    [string]$ModulePath = "Modules/Processing"
)

Write-Host "Fixing Error variable conflicts in processing modules..." -ForegroundColor Green

$filesToFix = Get-ChildItem -Path $ModulePath -Filter "*.psm1" -Recurse

foreach ($file in $filesToFix) {
    Write-Host "Processing: $($file.FullName)" -ForegroundColor Yellow
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    
    # Fix Error = $null in hashtable definitions
    $content = $content -replace '\s+Error\s*=\s*\$null', '        ErrorInfo = $null'
    
    # Fix $result.Error = assignments
    $content = $content -replace '\$result\.Error\s*=', '$result.ErrorInfo ='
    
    # Check if any changes were made
    if ($content -ne $originalContent) {
        Write-Host "  - Found and fixed Error variable conflicts" -ForegroundColor Cyan
        
        # Write the fixed content back to the file
        $content | Set-Content -Path $file.FullName -Encoding UTF8 -NoNewline
        
        Write-Host "  - File updated successfully" -ForegroundColor Green
    } else {
        Write-Host "  - No Error variable conflicts found" -ForegroundColor Gray
    }
}

Write-Host "Error variable conflict fix completed!" -ForegroundColor Green