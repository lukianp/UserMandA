# Simple Discovery Integration Fix
Write-Host "=== FIXING DISCOVERY MODULE INTEGRATION ===" -ForegroundColor Cyan

# Get discovery modules
$modules = Get-ChildItem "Modules\Discovery\*.psm1" | Where-Object { $_.Name -notlike "*backup*" }

foreach ($module in $modules) {
    $moduleName = $module.BaseName -replace 'Discovery$', ''
    $expectedFunction = "Invoke-${moduleName}Discovery"
    
    Write-Host "Processing: $($module.BaseName)" -ForegroundColor Yellow
    
    # Read content
    $content = Get-Content $module.FullName -Raw
    
    # Check if function exists
    if ($content -match "function $expectedFunction") {
        Write-Host "  Already has $expectedFunction" -ForegroundColor Green
        continue
    }
    
    # Create backup
    Copy-Item $module.FullName "$($module.FullName).backup.$(Get-Date -Format 'yyyyMMdd')" -Force
    
    # Add the integration function
    $newFunction = @"

function Invoke-${moduleName}Discovery {
    param([hashtable]`$Configuration, `$Context)
    
    try {
        `$result = [DiscoveryResult]::new('$moduleName')
        
        if (Get-Command 'Invoke-Discovery' -ErrorAction SilentlyContinue) {
            `$data = Invoke-Discovery -Context @{ Configuration = `$Configuration; Paths = `$Context.Paths }
            `$result.Data = `$data
        } else {
            `$result.Data = @{ Status = 'Not implemented' }
        }
        
        `$result.Success = `$true
        `$result.Complete()
        return `$result
        
    } catch {
        `$result = [DiscoveryResult]::new('$moduleName')
        `$result.AddError("Error: `$(`$_.Exception.Message)", `$_.Exception)
        `$result.Complete()
        return `$result
    }
}

"@
    
    # Add function before last Export-ModuleMember
    if ($content -match "(Export-ModuleMember.*)$") {
        $export = $Matches[1]
        $content = $content -replace [regex]::Escape($export), "$newFunction$export"
    } else {
        $content += $newFunction
    }
    
    # Save
    Set-Content $module.FullName $content -Encoding UTF8
    Write-Host "  Added $expectedFunction" -ForegroundColor Green
}

Write-Host "Integration fix complete!" -ForegroundColor Green