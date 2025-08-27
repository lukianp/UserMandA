# M&A Discovery Suite - Comprehensive Technical Validation Script
# This script performs systematic testing of all major components

param(
    [string]$ProcessId = "48224"
)

$testResults = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    ProcessStatus = @{}
    UIComponents = @{}
    PowerShellModules = @{}
    DataIntegration = @{}
    OrchestrationFeatures = @{}
    PerformanceMetrics = @{}
    Issues = @()
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "M&A Discovery Suite Technical Validation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. PROCESS VALIDATION
Write-Host "[1/5] Validating Application Process..." -ForegroundColor Yellow
try {
    $process = Get-Process -Id $ProcessId -ErrorAction Stop
    $testResults.ProcessStatus = @{
        Found = $true
        ProcessName = $process.ProcessName
        ProcessId = $process.Id
        WorkingSetMB = [math]::Round($process.WorkingSet64 / 1MB, 2)
        PrivateMemoryMB = [math]::Round($process.PrivateMemorySize64 / 1MB, 2)
        CPU = [math]::Round($process.CPU, 2)
        Responding = $process.Responding
        StartTime = $process.StartTime
        Runtime = ((Get-Date) - $process.StartTime).ToString()
    }
    Write-Host "  [OK] Process found and responding: PID $ProcessId" -ForegroundColor Green
    Write-Host "  Memory: $($testResults.ProcessStatus.WorkingSetMB) MB | CPU: $($testResults.ProcessStatus.CPU)" -ForegroundColor Gray
} catch {
    $testResults.ProcessStatus.Found = $false
    $testResults.Issues += "Process $ProcessId not found or not accessible"
    Write-Host "  [FAIL] Process validation failed: $_" -ForegroundColor Red
}

# 2. UI COMPONENT VALIDATION
Write-Host ""
Write-Host "[2/5] Testing UI Components..." -ForegroundColor Yellow

# Check for key ViewModels
$viewModels = @(
    'DashboardViewModel',
    'MigrationExecutionViewModel', 
    'MigrationPlanningViewModel',
    'MigrationMappingViewModel',
    'ExchangeMigrationViewModel',
    'SharePointMigrationViewModel',
    'UserMigrationViewModel'
)

$guiPath = "C:\enterprisediscovery\GUI"
if (Test-Path $guiPath) {
    foreach ($vm in $viewModels) {
        $vmFile = Get-ChildItem -Path "$guiPath\ViewModels" -Filter "*$vm*.cs" -ErrorAction SilentlyContinue
        if ($vmFile) {
            $testResults.UIComponents[$vm] = @{
                Found = $true
                FilePath = $vmFile.FullName
                FileSize = $vmFile.Length
                LastModified = $vmFile.LastWriteTime
            }
            Write-Host "  [OK] $vm found" -ForegroundColor Green
        } else {
            $testResults.UIComponents[$vm] = @{ Found = $false }
            Write-Host "  [FAIL] $vm not found" -ForegroundColor Red
        }
    }
} else {
    $testResults.Issues += "GUI path not accessible: $guiPath"
    Write-Host "  [FAIL] GUI path not accessible" -ForegroundColor Red
}

# 3. POWERSHELL MODULE VALIDATION
Write-Host ""
Write-Host "[3/5] Validating PowerShell Modules..." -ForegroundColor Yellow

$modules = @(
    'UserMigration.psm1',
    'MailboxMigration.psm1',
    'SharePointMigration.psm1',
    'FileSystemMigration.psm1',
    'VirtualMachineMigration.psm1',
    'UserProfileMigration.psm1'
)

$modulePath = "D:\Scripts\UserMandA\Modules\Migration"
foreach ($module in $modules) {
    $moduleFile = Join-Path $modulePath $module
    if (Test-Path $moduleFile) {
        try {
            # Test module can be imported
            Import-Module $moduleFile -Force -ErrorAction Stop
            
            # Get exported functions
            $exportedFunctions = Get-Command -Module ([System.IO.Path]::GetFileNameWithoutExtension($module)) -ErrorAction SilentlyContinue
            
            $testResults.PowerShellModules[$module] = @{
                Found = $true
                Path = $moduleFile
                FileSize = (Get-Item $moduleFile).Length
                ExportedFunctions = $exportedFunctions.Count
                LoadSuccess = $true
            }
            Write-Host "  [OK] $module loaded successfully - $($exportedFunctions.Count) functions" -ForegroundColor Green
            
            # Remove module after test
            Remove-Module ([System.IO.Path]::GetFileNameWithoutExtension($module)) -ErrorAction SilentlyContinue
        } catch {
            $testResults.PowerShellModules[$module] = @{
                Found = $true
                Path = $moduleFile
                LoadSuccess = $false
                Error = $_.Exception.Message
            }
            $testResults.Issues += "Module $module failed to load: $_"
            Write-Host "  [WARN] $module found but failed to load" -ForegroundColor Yellow
        }
    } else {
        $testResults.PowerShellModules[$module] = @{ Found = $false }
        Write-Host "  [FAIL] $module not found" -ForegroundColor Red
    }
}

# 4. DATA INTEGRATION VALIDATION
Write-Host ""
Write-Host "[4/5] Checking Data Integration..." -ForegroundColor Yellow

$dataPath = "C:\discoverydata\ljpops\Raw"
if (Test-Path $dataPath) {
    $csvFiles = Get-ChildItem -Path $dataPath -Filter "*.csv" -ErrorAction SilentlyContinue
    
    $testResults.DataIntegration.CSVFileCount = $csvFiles.Count
    $testResults.DataIntegration.Files = @()
    
    Write-Host "  Found $($csvFiles.Count) CSV files" -ForegroundColor Cyan
    
    # Check key discovery files
    $expectedFiles = @(
        'ActiveDirectory_Users.csv',
        'Exchange_Mailboxes.csv',
        'SharePoint_Sites.csv',
        'Groups_Security.csv',
        'FileShares_Analysis.csv'
    )
    
    foreach ($expected in $expectedFiles) {
        $file = $csvFiles | Where-Object { $_.Name -like "*$($expected.Replace('.csv',''))*" }
        if ($file) {
            try {
                $data = Import-Csv $file.FullName -ErrorAction Stop | Select-Object -First 5
                $testResults.DataIntegration.Files += @{
                    Name = $file.Name
                    Found = $true
                    RecordCount = (Import-Csv $file.FullName).Count
                    SizeMB = [math]::Round($file.Length / 1MB, 2)
                    LastModified = $file.LastWriteTime
                }
                Write-Host "  [OK] $($file.Name) - $(($data | Measure-Object).Count) records sampled" -ForegroundColor Green
            } catch {
                $testResults.Issues += "Failed to read CSV: $($file.Name)"
                Write-Host "  [WARN] $($file.Name) - found but could not read" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  [FAIL] $expected - not found" -ForegroundColor Red
        }
    }
} else {
    $testResults.Issues += "Data path not accessible: $dataPath"
    Write-Host "  [FAIL] Data path not accessible" -ForegroundColor Red
}

# 5. ORCHESTRATION FEATURES
Write-Host ""
Write-Host "[5/5] Testing Orchestration Features..." -ForegroundColor Yellow

# Check for key orchestration services
$orchestrationFiles = @(
    @{ Name = 'MigrationOrchestrationEngine'; Path = 'C:\enterprisediscovery\GUI\Services\MigrationOrchestrationEngine.cs' },
    @{ Name = 'MigrationWaveOrchestrator'; Path = 'C:\enterprisediscovery\GUI\Services\MigrationWaveOrchestrator.cs' },
    @{ Name = 'PowerShellExecutionService'; Path = 'C:\enterprisediscovery\GUI\Services\PowerShellExecutionService.cs' },
    @{ Name = 'MigrationErrorHandler'; Path = 'C:\enterprisediscovery\GUI\Services\MigrationErrorHandler.cs' }
)

foreach ($orchFile in $orchestrationFiles) {
    if (Test-Path $orchFile.Path) {
        $fileInfo = Get-Item $orchFile.Path
        $lineCount = (Get-Content $orchFile.Path | Measure-Object -Line).Lines
        
        $testResults.OrchestrationFeatures[$orchFile.Name] = @{
            Found = $true
            Path = $orchFile.Path
            Lines = $lineCount
            SizeKB = [math]::Round($fileInfo.Length / 1KB, 2)
        }
        Write-Host "  [OK] $($orchFile.Name) - $lineCount lines" -ForegroundColor Green
    } else {
        $testResults.OrchestrationFeatures[$orchFile.Name] = @{ Found = $false }
        Write-Host "  [FAIL] $($orchFile.Name) not found" -ForegroundColor Red
    }
}

# PERFORMANCE METRICS
Write-Host ""
Write-Host "Performance Metrics:" -ForegroundColor Cyan
if ($testResults.ProcessStatus.Found) {
    $testResults.PerformanceMetrics = @{
        MemoryUsageMB = $testResults.ProcessStatus.WorkingSetMB
        MemoryStatus = if ($testResults.ProcessStatus.WorkingSetMB -lt 500) { "Optimal" } 
                      elseif ($testResults.ProcessStatus.WorkingSetMB -lt 1000) { "Acceptable" } 
                      else { "High" }
        ProcessResponding = $testResults.ProcessStatus.Responding
        Runtime = $testResults.ProcessStatus.Runtime
        ThreadSafety = "Not directly testable - requires runtime observation"
    }
    
    Write-Host "  Memory: $($testResults.PerformanceMetrics.MemoryUsageMB) MB - $($testResults.PerformanceMetrics.MemoryStatus)" -ForegroundColor $(if($testResults.PerformanceMetrics.MemoryStatus -eq "Optimal"){"Green"}else{"Yellow"})
    Write-Host "  Runtime: $($testResults.PerformanceMetrics.Runtime)" -ForegroundColor Gray
    Write-Host "  Responding: $($testResults.PerformanceMetrics.ProcessResponding)" -ForegroundColor $(if($testResults.PerformanceMetrics.ProcessResponding){"Green"}else{"Red"})
}

# SUMMARY
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Validation Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$uiCount = ($testResults.UIComponents.Values | Where-Object { $_.Found }).Count
$moduleCount = ($testResults.PowerShellModules.Values | Where-Object { $_.Found }).Count
$orchCount = ($testResults.OrchestrationFeatures.Values | Where-Object { $_.Found }).Count

Write-Host "[OK] UI Components: $uiCount/$($testResults.UIComponents.Count) found" -ForegroundColor $(if($uiCount -eq $testResults.UIComponents.Count){"Green"}else{"Yellow"})
Write-Host "[OK] PowerShell Modules: $moduleCount/$($testResults.PowerShellModules.Count) found" -ForegroundColor $(if($moduleCount -eq $testResults.PowerShellModules.Count){"Green"}else{"Yellow"})
Write-Host "[OK] Data Files: $($testResults.DataIntegration.CSVFileCount) CSV files available" -ForegroundColor Green
Write-Host "[OK] Orchestration: $orchCount/$($testResults.OrchestrationFeatures.Count) services found" -ForegroundColor $(if($orchCount -eq $testResults.OrchestrationFeatures.Count){"Green"}else{"Yellow"})

if ($testResults.Issues.Count -gt 0) {
    Write-Host ""
    Write-Host "Issues Detected:" -ForegroundColor Yellow
    foreach ($issue in $testResults.Issues) {
        Write-Host "  - $issue" -ForegroundColor Yellow
    }
}

# Export results
$outputPath = "D:\Scripts\UserMandA\TechnicalValidation_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$testResults | ConvertTo-Json -Depth 5 | Out-File $outputPath
Write-Host ""
Write-Host "Full results exported to: $outputPath" -ForegroundColor Cyan

return $testResults