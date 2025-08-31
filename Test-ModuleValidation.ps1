try {
    Write-Host "Testing Infrastructure Discovery Module Import..." -ForegroundColor Cyan
    $modulePath = "D:\Scripts\UserMandA\Modules\Discovery\InfrastructureDiscovery.psm1"
    
    # First, check if file exists
    if (-not (Test-Path $modulePath)) {
        throw "Module file not found: $modulePath"
    }
    
    Write-Host "Module file found. Testing syntax..." -ForegroundColor Yellow
    
    # Try to parse the module for syntax errors
    $errors = $null
    $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $modulePath -Raw), [ref]$errors)
    
    if ($errors.Count -gt 0) {
        Write-Host "Syntax errors found:" -ForegroundColor Red
        $errors | ForEach-Object {
            Write-Host "  Line $($_.StartLine): $($_.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "No syntax errors found. Attempting import..." -ForegroundColor Green
        
        # Try to import the module
        Import-Module $modulePath -Force
        
        # Test if key functions are available
        $testFunctions = @(
            'Invoke-InfrastructureDiscovery',
            'Find-SystemNmap', 
            'Get-ADSitesAndSubnets',
            'Classify-NetworkSegments',
            'Get-AdaptiveScanParameters'
        )
        
        Write-Host "Testing function availability..." -ForegroundColor Yellow
        foreach ($funcName in $testFunctions) {
            if (Get-Command $funcName -ErrorAction SilentlyContinue) {
                Write-Host "  ✅ $funcName - Available" -ForegroundColor Green
            } else {
                Write-Host "  ❌ $funcName - Not found" -ForegroundColor Red
            }
        }
        
        Write-Host "Module validation complete!" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack: $($_.ScriptStackTrace)" -ForegroundColor Red
}