# Fix-DiscoveryModules-v2.ps1
$discoveryPath = "C:\UserMigration\Modules\Discovery"

# Get all discovery modules
$modules = Get-ChildItem -Path $discoveryPath -Filter "*Discovery.psm1" -Exclude "*.backup"

foreach ($module in $modules) {
    Write-Host "Processing $($module.Name)..."
    
    # Read content
    $content = Get-Content $module.FullName -Raw
    
    # Check if it has the problematic if statement
    if ($content -match 'if\s*\(\s*-not\s*\(\[System\.Management\.Automation\.PSTypeName\].*?\)\s*\)\s*\{\s*class\s+DiscoveryResult') {
        Write-Host "  Found wrapped class definition, fixing..." -ForegroundColor Yellow
        
        # Remove the if wrapper but keep the class definition
        $content = $content -replace 'if\s*\(\s*-not\s*\(\[System\.Management\.Automation\.PSTypeName\].*?\)\s*\)\s*\{\s*(class\s+DiscoveryResult\s*\{[^}]+\})\s*\}', '$1'
        
        # The regex might not work perfectly, so let's try a simpler approach
        # Remove the specific if line and its closing brace
        $content = $content -replace '# DiscoveryResult class definition\r?\nif \(-not \(\[System\.Management\.Automation\.PSTypeName\]''DiscoveryResult''\)\.Type\) \{\r?\n', '# DiscoveryResult class definition'+ "`n"
        
        # Find and remove the extra closing brace after the class
        $lines = $content -split "`n"
        $classStart = -1
        $braceCount = 0
        $classEnd = -1
        
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match 'class\s+DiscoveryResult\s*\{') {
                $classStart = $i
                $braceCount = 1
            } elseif ($classStart -ge 0) {
                $braceCount += ($lines[$i] -split '{').Count - 1
                $braceCount -= ($lines[$i] -split '}').Count - 1
                
                if ($braceCount -eq 0) {
                    $classEnd = $i
                    # Check if the next non-empty line is a closing brace
                    for ($j = $i + 1; $j -lt $lines.Count; $j++) {
                        if ($lines[$j].Trim() -ne '') {
                            if ($lines[$j].Trim() -eq '}') {
                                # Remove this extra brace
                                $lines[$j] = ''
                            }
                            break
                        }
                    }
                    break
                }
            }
        }
        
        $content = $lines -join "`n"
        
        # Write updated content
        Set-Content $module.FullName -Value $content -Encoding UTF8
        
        Write-Host "  Fixed $($module.Name)" -ForegroundColor Green
    } else {
        Write-Host "  $($module.Name) doesn't have the wrapped pattern" -ForegroundColor Gray
    }
}

Write-Host "`nFix complete! Please run QuickStart.ps1 again." -ForegroundColor Green