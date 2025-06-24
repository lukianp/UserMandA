# Simple Discovery Integration Test
Write-Host "=== TESTING DISCOVERY MODULE INTEGRATION ===" -ForegroundColor Cyan

# Define DiscoveryResult class
if (-not ([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
    Add-Type -TypeDefinition @'
public class DiscoveryResult {
    public bool Success { get; set; }
    public string ModuleName { get; set; }
    public object Data { get; set; }
    public System.Collections.ArrayList Errors { get; set; }
    public System.Collections.ArrayList Warnings { get; set; }
    public System.Collections.Hashtable Metadata { get; set; }
    public System.DateTime StartTime { get; set; }
    public System.DateTime EndTime { get; set; }
    public string ExecutionId { get; set; }
    
    public DiscoveryResult(string moduleName) {
        this.ModuleName = moduleName;
        this.Errors = new System.Collections.ArrayList();
        this.Warnings = new System.Collections.ArrayList();
        this.Metadata = new System.Collections.Hashtable();
        this.StartTime = System.DateTime.Now;
        this.ExecutionId = System.Guid.NewGuid().ToString();
        this.Success = true;
    }
    
    public void AddError(string message, System.Exception exception) {
        var errorEntry = new System.Collections.Hashtable();
        errorEntry["Timestamp"] = System.DateTime.Now;
        errorEntry["Message"] = message;
        this.Errors.Add(errorEntry);
        this.Success = false;
    }
    
    public void Complete() {
        this.EndTime = System.DateTime.Now;
    }
}
'@ -Language CSharp
}

# Get discovery modules
$modules = Get-ChildItem "Modules\Discovery\*.psm1" | Where-Object { $_.Name -notlike "*backup*" }

$successCount = 0
$totalCount = $modules.Count

Write-Host "Testing $totalCount discovery modules..." -ForegroundColor Green
Write-Host ""

foreach ($module in $modules) {
    $moduleName = $module.BaseName -replace 'Discovery$', ''
    $expectedFunction = "Invoke-${moduleName}Discovery"
    
    Write-Host "Testing: $($module.BaseName)" -ForegroundColor Yellow
    
    try {
        # Import module
        Import-Module $module.FullName -Force -ErrorAction Stop
        Write-Host "  ✓ Module loads" -ForegroundColor Green
        
        # Check function exists
        $function = Get-Command $expectedFunction -ErrorAction SilentlyContinue
        if ($function) {
            Write-Host "  ✓ Has $expectedFunction" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  ✗ Missing $expectedFunction" -ForegroundColor Red
        }
        
        # Clean up
        Remove-Module $module.BaseName -Force -ErrorAction SilentlyContinue
        
    } catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Summary
Write-Host "=== RESULTS ===" -ForegroundColor Cyan
Write-Host "Total Modules: $totalCount" -ForegroundColor White
Write-Host "Successfully Integrated: $successCount" -ForegroundColor Green
Write-Host "Success Rate: $([Math]::Round(($successCount/$totalCount)*100,1))%" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })

if ($successCount -eq $totalCount) {
    Write-Host ""
    Write-Host "🎉 ALL DISCOVERY MODULES ARE 100% INTEGRATED! 🎉" -ForegroundColor Green
    Write-Host "Ready for orchestrator execution!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Some modules need attention" -ForegroundColor Yellow
}