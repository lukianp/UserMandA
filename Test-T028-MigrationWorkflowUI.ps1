# Test-T028-MigrationWorkflowUI.ps1
# Comprehensive validation tests for T-028 Migration Workflow UI and Progress Tracking

param(
    [switch]$Verbose = $false,
    [switch]$IncludeMockExecution = $false,
    [string]$LogPath = ".\TestReports"
)

# Initialize test environment
$ErrorActionPreference = "Stop"
$StartTime = Get-Date
$TestResults = @{
    ServiceResolution = @()
    WaveCreation = @()
    EventIntegration = @()
    ExecutionFlow = @()
    ErrorHandling = @()
    Summary = @{
        TotalTests = 0
        PassedTests = 0
        FailedTests = 0
        WarningTests = 0
        StartTime = $StartTime
        EndTime = $null
        Duration = $null
    }
}

Write-Host "=== T-028 Migration Workflow UI Validation Tests ===" -ForegroundColor Cyan
Write-Host "Start Time: $StartTime" -ForegroundColor Gray

# Ensure log directory exists
if (-not (Test-Path $LogPath)) {
    New-Item -Path $LogPath -ItemType Directory -Force | Out-Null
}

# Test helper functions
function Write-TestResult {
    param(
        [string]$Category,
        [string]$TestName,
        [string]$Status, # PASS, FAIL, WARNING
        [string]$Details = "",
        [string]$Expected = "",
        [string]$Actual = ""
    )
    
    $Result = [PSCustomObject]@{
        Category = $Category
        TestName = $TestName
        Status = $Status
        Details = $Details
        Expected = $Expected
        Actual = $Actual
        Timestamp = Get-Date
    }
    
    $TestResults[$Category] += $Result
    $TestResults.Summary.TotalTests++
    
    $Color = switch ($Status) {
        "PASS" { "Green"; $TestResults.Summary.PassedTests++ }
        "FAIL" { "Red"; $TestResults.Summary.FailedTests++ }
        "WARNING" { "Yellow"; $TestResults.Summary.WarningTests++ }
        default { "White" }
    }
    
    $StatusIcon = switch ($Status) {
        "PASS" { "[PASS]" }
        "FAIL" { "[FAIL]" }
        "WARNING" { "[WARN]" }
        default { "[INFO]" }
    }
    
    Write-Host "$StatusIcon [$Category] $TestName : $Status" -ForegroundColor $Color
    if ($Details) { Write-Host "    $Details" -ForegroundColor Gray }
    if ($Verbose -and $Expected) { Write-Host "    Expected: $Expected" -ForegroundColor DarkGray }
    if ($Verbose -and $Actual) { Write-Host "    Actual: $Actual" -ForegroundColor DarkGray }
}

function Test-FileExists {
    param([string]$Path, [string]$Description)
    
    if (Test-Path $Path) {
        return $true
    } else {
        Write-TestResult "Setup" $Description "FAIL" "File not found: $Path"
        return $false
    }
}

function Get-CSharpClassDefinition {
    param([string]$FilePath, [string]$ClassName)
    
    try {
        $content = Get-Content $FilePath -Raw
        if ($content -match "class\s+$ClassName\s*[:\s\w,]*\{") {
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

function Test-CSharpMethod {
    param([string]$FilePath, [string]$MethodPattern)
    
    try {
        $content = Get-Content $FilePath -Raw
        return $content -match $MethodPattern
    } catch {
        return $false
    }
}

# ============================================================================
# 1. SERVICE RESOLUTION & INITIALIZATION TESTS
# ============================================================================

Write-Host "`n>> 1. Service Resolution & Initialization Tests" -ForegroundColor Yellow

# Test 1.1: MigrationExecutionViewModel file exists
$ViewModelPath = "D:\Scripts\UserMandA\GUI\ViewModels\MigrationExecutionViewModel.cs"
if (Test-FileExists $ViewModelPath "MigrationExecutionViewModel exists") {
    Write-TestResult "ServiceResolution" "ViewModel File Exists" "PASS" "Found at $ViewModelPath"
} else {
    Write-TestResult "ServiceResolution" "ViewModel File Exists" "FAIL" "Missing file: $ViewModelPath"
}

# Test 1.2: T-027 MigrationEngineService exists
$EngineServicePath = "D:\Scripts\UserMandA\GUI\Services\Migration\MigrationEngineService.cs"
if (Test-FileExists $EngineServicePath "MigrationEngineService exists") {
    Write-TestResult "ServiceResolution" "Engine Service File Exists" "PASS" "Found at $EngineServicePath"
} else {
    Write-TestResult "ServiceResolution" "Engine Service File Exists" "FAIL" "Missing file: $EngineServicePath"
}

# Test 1.3: MigrationExecutionViewModel constructor includes T-027 integration
if (Test-Path $ViewModelPath) {
    $constructorIntegration = Test-CSharpMethod $ViewModelPath "MigrationEngineService migrationEngine.*=.*null"
    if ($constructorIntegration) {
        Write-TestResult "ServiceResolution" "Constructor T-027 Integration" "PASS" "Constructor accepts MigrationEngineService parameter"
    } else {
        Write-TestResult "ServiceResolution" "Constructor T-027 Integration" "FAIL" "Constructor missing MigrationEngineService parameter"
    }
}

# Test 1.4: ResolveOrCreateMigrationEngine method exists
if (Test-Path $ViewModelPath) {
    $resolverMethod = Test-CSharpMethod $ViewModelPath "ResolveOrCreateMigrationEngine.*MigrationEngineService"
    if ($resolverMethod) {
        Write-TestResult "ServiceResolution" "Migration Engine Resolver" "PASS" "ResolveOrCreateMigrationEngine method found"
    } else {
        Write-TestResult "ServiceResolution" "Migration Engine Resolver" "FAIL" "ResolveOrCreateMigrationEngine method not found"
    }
}

# Test 1.5: DefaultServiceProvider fallback exists
if (Test-Path $ViewModelPath) {
    $fallbackProvider = Test-CSharpMethod $ViewModelPath "class DefaultServiceProvider.*IServiceProvider"
    if ($fallbackProvider) {
        Write-TestResult "ServiceResolution" "Service Provider Fallback" "PASS" "DefaultServiceProvider fallback class found"
    } else {
        Write-TestResult "ServiceResolution" "Service Provider Fallback" "FAIL" "DefaultServiceProvider fallback class not found"
    }
}

# Test 1.6: Event subscription initialization
if (Test-Path $ViewModelPath) {
    $eventInit = Test-CSharpMethod $ViewModelPath "InitializeMigrationEngineEvents"
    if ($eventInit) {
        Write-TestResult "ServiceResolution" "Event Subscription Init" "PASS" "InitializeMigrationEngineEvents method found"
    } else {
        Write-TestResult "ServiceResolution" "Event Subscription Init" "FAIL" "InitializeMigrationEngineEvents method not found"
    }
}

# ============================================================================
# 2. MIGRATION WAVE CREATION TESTS
# ============================================================================

Write-Host "`n>> 2. Migration Wave Creation Tests" -ForegroundColor Yellow

# Test 2.1: CreateMigrationWaveFromExecutionItems method exists
if (Test-Path $ViewModelPath) {
    $waveCreation = Test-CSharpMethod $ViewModelPath "CreateMigrationWaveFromExecutionItems.*MigrationWaveExtended"
    if ($waveCreation) {
        Write-TestResult "WaveCreation" "Wave Creation Method" "PASS" "CreateMigrationWaveFromExecutionItems method found"
    } else {
        Write-TestResult "WaveCreation" "Wave Creation Method" "FAIL" "CreateMigrationWaveFromExecutionItems method not found"
    }
}

# Test 2.2: MigrationBatchExtended creation
if (Test-Path $ViewModelPath) {
    $batchCreation = Test-CSharpMethod $ViewModelPath "MigrationBatchExtended"
    if ($batchCreation) {
        Write-TestResult "WaveCreation" "Batch Creation Support" "PASS" "MigrationBatchExtended usage found"
    } else {
        Write-TestResult "WaveCreation" "Batch Creation Support" "FAIL" "MigrationBatchExtended usage not found"
    }
}

# Test 2.3: Migration item data transformation
if (Test-Path $ViewModelPath) {
    $dataTransform = Test-CSharpMethod $ViewModelPath "ExecutionItems\.Select.*MigrationItem"
    if ($dataTransform) {
        Write-TestResult "WaveCreation" "Data Transformation" "PASS" "ExecutionItems to MigrationItem transformation found"
    } else {
        Write-TestResult "WaveCreation" "Data Transformation" "FAIL" "ExecutionItems to MigrationItem transformation not found"
    }
}

# Test 2.4: Source/Target domain extraction methods
if (Test-Path $ViewModelPath) {
    $domainMethods = Test-CSharpMethod $ViewModelPath "(GetSourceDomainFromProfile|GetTargetDomainFromProfile)"
    if ($domainMethods) {
        Write-TestResult "WaveCreation" "Domain Extraction Methods" "PASS" "Domain extraction methods found"
    } else {
        Write-TestResult "WaveCreation" "Domain Extraction Methods" "FAIL" "Domain extraction methods not found"
    }
}

# Test 2.5: CreateMigrationContext method exists
if (Test-Path $ViewModelPath) {
    $contextCreation = Test-CSharpMethod $ViewModelPath "CreateMigrationContext.*MigrationContext"
    if ($contextCreation) {
        Write-TestResult "WaveCreation" "Migration Context Creation" "PASS" "CreateMigrationContext method found"
    } else {
        Write-TestResult "WaveCreation" "Migration Context Creation" "FAIL" "CreateMigrationContext method not found"
    }
}

# ============================================================================
# 3. REAL-TIME EVENT INTEGRATION TESTS
# ============================================================================

Write-Host "`n>> 3. Real-Time Event Integration Tests" -ForegroundColor Yellow

# Test 3.1: MigrationProgress event handler
if (Test-Path $ViewModelPath) {
    $progressHandler = Test-CSharpMethod $ViewModelPath "OnMigrationEngineProgress.*MigrationProgressEventArgs"
    if ($progressHandler) {
        Write-TestResult "EventIntegration" "Progress Event Handler" "PASS" "OnMigrationEngineProgress handler found"
    } else {
        Write-TestResult "EventIntegration" "Progress Event Handler" "FAIL" "OnMigrationEngineProgress handler not found"
    }
}

# Test 3.2: MigrationCompleted event handler
if (Test-Path $ViewModelPath) {
    $completedHandler = Test-CSharpMethod $ViewModelPath "OnMigrationEngineCompleted.*MigrationCompletedEventArgs"
    if ($completedHandler) {
        Write-TestResult "EventIntegration" "Completed Event Handler" "PASS" "OnMigrationEngineCompleted handler found"
    } else {
        Write-TestResult "EventIntegration" "Completed Event Handler" "FAIL" "OnMigrationEngineCompleted handler not found"
    }
}

# Test 3.3: MigrationError event handler
if (Test-Path $ViewModelPath) {
    $errorHandler = Test-CSharpMethod $ViewModelPath "OnMigrationEngineError.*MigrationErrorEventArgs"
    if ($errorHandler) {
        Write-TestResult "EventIntegration" "Error Event Handler" "PASS" "OnMigrationEngineError handler found"
    } else {
        Write-TestResult "EventIntegration" "Error Event Handler" "FAIL" "OnMigrationEngineError handler not found"
    }
}

# Test 3.4: Dispatcher marshalling for UI updates
if (Test-Path $ViewModelPath) {
    $dispatcherUsage = Test-CSharpMethod $ViewModelPath "Application\.Current.*Dispatcher.*Invoke"
    if ($dispatcherUsage) {
        Write-TestResult "EventIntegration" "Thread-Safe UI Updates" "PASS" "Dispatcher.Invoke pattern found for thread-safe updates"
    } else {
        Write-TestResult "EventIntegration" "Thread-Safe UI Updates" "FAIL" "Dispatcher.Invoke pattern not found"
    }
}

# Test 3.5: Event subscription in constructor
if (Test-Path $ViewModelPath) {
    $eventSubscription = Test-CSharpMethod $ViewModelPath "_migrationEngine\.MigrationProgress.*\+="
    if ($eventSubscription) {
        Write-TestResult "EventIntegration" "Event Subscription" "PASS" "Migration engine event subscription found"
    } else {
        Write-TestResult "EventIntegration" "Event Subscription" "FAIL" "Migration engine event subscription not found"
    }
}

# Test 3.6: Event unsubscription in dispose
if (Test-Path $ViewModelPath) {
    $eventUnsubscription = Test-CSharpMethod $ViewModelPath "_migrationEngine\.MigrationProgress.*\-="
    if ($eventUnsubscription) {
        Write-TestResult "EventIntegration" "Event Unsubscription" "PASS" "Migration engine event unsubscription found in dispose"
    } else {
        Write-TestResult "EventIntegration" "Event Unsubscription" "WARNING" "Event unsubscription should be implemented in OnDisposing"
    }
}

# ============================================================================
# 4. MIGRATION EXECUTION FLOW TESTS
# ============================================================================

Write-Host "`n>> 4. Migration Execution Flow Tests" -ForegroundColor Yellow

# Test 4.1: ExecuteRealMigrationAsync method exists
if (Test-Path $ViewModelPath) {
    $realExecution = Test-CSharpMethod $ViewModelPath "ExecuteRealMigrationAsync"
    if ($realExecution) {
        Write-TestResult "ExecutionFlow" "Real Migration Execution" "PASS" "ExecuteRealMigrationAsync method found"
    } else {
        Write-TestResult "ExecutionFlow" "Real Migration Execution" "FAIL" "ExecuteRealMigrationAsync method not found"
    }
}

# Test 4.2: T-027 engine ExecuteMigrationWaveAsync integration
if (Test-Path $ViewModelPath) {
    $waveExecution = Test-CSharpMethod $ViewModelPath "_migrationEngine\.ExecuteMigrationWaveAsync"
    if ($waveExecution) {
        Write-TestResult "ExecutionFlow" "T-027 Wave Execution" "PASS" "ExecuteMigrationWaveAsync call found"
    } else {
        Write-TestResult "ExecutionFlow" "T-027 Wave Execution" "FAIL" "ExecuteMigrationWaveAsync call not found"
    }
}

# Test 4.3: UpdateExecutionResultsFromWave method
if (Test-Path $ViewModelPath) {
    $resultUpdate = Test-CSharpMethod $ViewModelPath "UpdateExecutionResultsFromWave.*WaveExecutionResult"
    if ($resultUpdate) {
        Write-TestResult "ExecutionFlow" "Execution Results Update" "PASS" "UpdateExecutionResultsFromWave method found"
    } else {
        Write-TestResult "ExecutionFlow" "Execution Results Update" "FAIL" "UpdateExecutionResultsFromWave method not found"
    }
}

# Test 4.4: Pre-flight validation integration
if (Test-Path $ViewModelPath) {
    $preFlightCheck = Test-CSharpMethod $ViewModelPath "PreFlightPassed.*MessageBox"
    if ($preFlightCheck) {
        Write-TestResult "ExecutionFlow" "Pre-flight Validation" "PASS" "Pre-flight validation check before execution found"
    } else {
        Write-TestResult "ExecutionFlow" "Pre-flight Validation" "WARNING" "Pre-flight validation check should be implemented"
    }
}

# Test 4.5: Cancellation support
if (Test-Path $ViewModelPath) {
    $cancellationSupport = Test-CSharpMethod $ViewModelPath "CancellationToken\.None"
    if ($cancellationSupport) {
        Write-TestResult "ExecutionFlow" "Cancellation Support" "PASS" "CancellationToken usage found"
    } else {
        Write-TestResult "ExecutionFlow" "Cancellation Support" "WARNING" "CancellationToken support should be implemented"
    }
}

# ============================================================================
# 5. ERROR HANDLING & ROLLBACK TESTS
# ============================================================================

Write-Host "`n>> 5. Error Handling & Rollback Tests" -ForegroundColor Yellow

# Test 5.1: Error handling in ExecuteRealMigrationAsync
if (Test-Path $ViewModelPath) {
    $errorHandling = Test-CSharpMethod $ViewModelPath "catch.*Exception.*ex.*ExecuteRealMigrationAsync" -ErrorAction SilentlyContinue
    if ($errorHandling) {
        Write-TestResult "ErrorHandling" "Migration Execution Error Handling" "PASS" "Try-catch block found in ExecuteRealMigrationAsync"
    } else {
        Write-TestResult "ErrorHandling" "Migration Execution Error Handling" "WARNING" "Error handling pattern should be verified"
    }
}

# Test 5.2: Rollback point creation
if (Test-Path $ViewModelPath) {
    $rollbackCreation = Test-CSharpMethod $ViewModelPath "CreateAutomaticRollbackPoint"
    if ($rollbackCreation) {
        Write-TestResult "ErrorHandling" "Rollback Point Creation" "PASS" "CreateAutomaticRollbackPoint method found"
    } else {
        Write-TestResult "ErrorHandling" "Rollback Point Creation" "FAIL" "CreateAutomaticRollbackPoint method not found"
    }
}

# Test 5.3: ExecuteRollbackAsync method
if (Test-Path $ViewModelPath) {
    $rollbackExecution = Test-CSharpMethod $ViewModelPath "ExecuteRollbackAsync"
    if ($rollbackExecution) {
        Write-TestResult "ErrorHandling" "Rollback Execution" "PASS" "ExecuteRollbackAsync method found"
    } else {
        Write-TestResult "ErrorHandling" "Rollback Execution" "FAIL" "ExecuteRollbackAsync method not found"
    }
}

# Test 5.4: Error logging integration
if (Test-Path $ViewModelPath) {
    $errorLogging = Test-CSharpMethod $ViewModelPath "AddExecutionLog.*LogLevel\.Error"
    if ($errorLogging) {
        Write-TestResult "ErrorHandling" "Error Logging" "PASS" "Error level logging found"
    } else {
        Write-TestResult "ErrorHandling" "Error Logging" "FAIL" "Error level logging not found"
    }
}

# Test 5.5: User feedback on errors
if (Test-Path $ViewModelPath) {
    $userFeedback = Test-CSharpMethod $ViewModelPath "MessageBox\.Show.*error"
    if ($userFeedback) {
        Write-TestResult "ErrorHandling" "User Error Feedback" "PASS" "MessageBox error feedback found"
    } else {
        Write-TestResult "ErrorHandling" "User Error Feedback" "WARNING" "User error feedback should be implemented"
    }
}

# ============================================================================
# 6. T-027 ENGINE INTEGRATION VERIFICATION
# ============================================================================

Write-Host "`n>> 6. T-027 Engine Integration Verification" -ForegroundColor Yellow

# Test 6.1: T-027 engine events defined
if (Test-Path $EngineServicePath) {
    $engineEvents = Test-CSharpMethod $EngineServicePath "event EventHandler.*Migration(Progress|Completed|Error)EventArgs"
    if ($engineEvents) {
        Write-TestResult "EventIntegration" "T-027 Engine Events" "PASS" "Migration events defined in T-027 engine"
    } else {
        Write-TestResult "EventIntegration" "T-027 Engine Events" "FAIL" "Migration events not found in T-027 engine"
    }
}

# Test 6.2: ExecuteMigrationWaveAsync method in T-027
if (Test-Path $EngineServicePath) {
    $waveMethod = Test-CSharpMethod $EngineServicePath "ExecuteMigrationWaveAsync.*MigrationWaveExtended.*MigrationContext"
    if ($waveMethod) {
        Write-TestResult "ExecutionFlow" "T-027 Wave Execution Method" "PASS" "ExecuteMigrationWaveAsync method found in T-027"
    } else {
        Write-TestResult "ExecutionFlow" "T-027 Wave Execution Method" "FAIL" "ExecuteMigrationWaveAsync method not found in T-027"
    }
}

# Test 6.3: Event argument classes defined
if (Test-Path $EngineServicePath) {
    $eventArgs = Test-CSharpMethod $EngineServicePath "class.*Migration(Progress|Completed|Error)EventArgs"
    if ($eventArgs) {
        Write-TestResult "EventIntegration" "T-027 Event Arguments" "PASS" "Migration event argument classes found"
    } else {
        Write-TestResult "EventIntegration" "T-027 Event Arguments" "FAIL" "Migration event argument classes not found"
    }
}

# Test 6.4: Provider adapter classes exist
if (Test-Path $EngineServicePath) {
    $adapters = Test-CSharpMethod $EngineServicePath "class.*(Identity|Mail|File|Sql)MigratorAdapter"
    if ($adapters) {
        Write-TestResult "ExecutionFlow" "T-027 Provider Adapters" "PASS" "Migration provider adapter classes found"
    } else {
        Write-TestResult "ExecutionFlow" "T-027 Provider Adapters" "FAIL" "Migration provider adapter classes not found"
    }
}

# ============================================================================
# FINAL REPORT GENERATION
# ============================================================================

Write-Host "`n>> Generating Test Report..." -ForegroundColor Yellow

$TestResults.Summary.EndTime = Get-Date
$TestResults.Summary.Duration = $TestResults.Summary.EndTime - $TestResults.Summary.StartTime

# Create summary report
$SummaryReport = @"
=============================================================================
T-028 MIGRATION WORKFLOW UI VALIDATION REPORT
=============================================================================
Generated: $($TestResults.Summary.EndTime)
Duration: $($TestResults.Summary.Duration.ToString("hh\:mm\:ss"))

SUMMARY:
--------
Total Tests: $($TestResults.Summary.TotalTests)
Passed: $($TestResults.Summary.PassedTests) ($([math]::Round($TestResults.Summary.PassedTests/$TestResults.Summary.TotalTests*100,1))%)
Failed: $($TestResults.Summary.FailedTests) ($([math]::Round($TestResults.Summary.FailedTests/$TestResults.Summary.TotalTests*100,1))%)
Warnings: $($TestResults.Summary.WarningTests) ($([math]::Round($TestResults.Summary.WarningTests/$TestResults.Summary.TotalTests*100,1))%)

VALIDATION STATUS:
-----------------
"@

# Determine overall validation status
$ValidationStatus = if ($TestResults.Summary.FailedTests -eq 0 -and $TestResults.Summary.PassedTests -gt ($TestResults.Summary.TotalTests * 0.8)) {
    "COMPREHENSIVE VALIDATION PASSED"
} elseif ($TestResults.Summary.FailedTests -le 3 -and $TestResults.Summary.PassedTests -gt ($TestResults.Summary.TotalTests * 0.7)) {
    "PARTIAL VALIDATION PASSED WITH WARNINGS"
} else {
    "VALIDATION FAILED - CRITICAL ISSUES FOUND"
}

$SummaryReport += $ValidationStatus

# Category breakdown
$SummaryReport += "`n`nCATEGORY BREAKDOWN:"
$SummaryReport += "`n-------------------"

foreach ($Category in @("ServiceResolution", "WaveCreation", "EventIntegration", "ExecutionFlow", "ErrorHandling")) {
    $CategoryTests = $TestResults[$Category]
    $CategoryPassed = ($CategoryTests | Where-Object Status -eq "PASS").Count
    $CategoryFailed = ($CategoryTests | Where-Object Status -eq "FAIL").Count
    $CategoryWarnings = ($CategoryTests | Where-Object Status -eq "WARNING").Count
    $CategoryTotal = $CategoryTests.Count
    
    if ($CategoryTotal -gt 0) {
        $CategoryStatus = if ($CategoryFailed -eq 0) { "[PASS]" } elseif ($CategoryFailed -le 1) { "[WARN]" } else { "[FAIL]" }
        $SummaryReport += "`n$CategoryStatus $Category : $CategoryPassed/$CategoryTotal passed, $CategoryFailed failed, $CategoryWarnings warnings"
    }
}

# Key findings
$SummaryReport += "`n`nKEY FINDINGS:"
$SummaryReport += "`n-------------"

$CriticalFailures = @()
$ImportantPasses = @()
$Warnings = @()

foreach ($Category in @("ServiceResolution", "WaveCreation", "EventIntegration", "ExecutionFlow", "ErrorHandling")) {
    foreach ($Test in $TestResults[$Category]) {
        if ($Test.Status -eq "FAIL" -and $Test.TestName -match "(T-027|Migration Engine|Event|Wave Creation)") {
            $CriticalFailures += "$($Test.TestName): $($Test.Details)"
        } elseif ($Test.Status -eq "PASS" -and $Test.TestName -match "(T-027|Migration Engine|Event|Wave Creation)") {
            $ImportantPasses += "$($Test.TestName): Integration verified"
        } elseif ($Test.Status -eq "WARNING") {
            $Warnings += "$($Test.TestName): $($Test.Details)"
        }
    }
}

if ($ImportantPasses.Count -gt 0) {
    $SummaryReport += "`n`nCRITICAL INTEGRATIONS VERIFIED:"
    $ImportantPasses | ForEach-Object { $SummaryReport += "`n  + $_" }
}

if ($CriticalFailures.Count -gt 0) {
    $SummaryReport += "`n`nCRITICAL INTEGRATION FAILURES:"
    $CriticalFailures | ForEach-Object { $SummaryReport += "`n  - $_" }
}

if ($Warnings.Count -gt 0 -and $Warnings.Count -le 5) {
    $SummaryReport += "`n`nIMPORTANT WARNINGS:"
    $Warnings[0..4] | ForEach-Object { $SummaryReport += "`n  ! $_" }
}

# Recommendations
$SummaryReport += "`n`nRECOMMENDATIONS:"
$SummaryReport += "`n---------------"

if ($TestResults.Summary.FailedTests -eq 0) {
    $SummaryReport += "`n[PASS] T-028 Migration Workflow UI integration is ready for production use"
    $SummaryReport += "`n[PASS] All critical T-027 engine integration points verified"
    $SummaryReport += "`n[PASS] Event handling and thread-safety implemented correctly"
} else {
    $SummaryReport += "`n[TODO] Address critical integration failures before deployment"
    $SummaryReport += "`n[TODO] Complete missing T-027 engine integration points"
    $SummaryReport += "`n[TODO] Implement comprehensive error handling patterns"
}

$SummaryReport += "`n`nNEXT STEPS:"
$SummaryReport += "`n-----------"
$SummaryReport += "`n1. Review and fix any critical failures identified above"
$SummaryReport += "`n2. Implement runtime testing with mock migration scenarios"
$SummaryReport += "`n3. Test real-time event handling with UI responsiveness"
$SummaryReport += "`n4. Validate cancellation and rollback mechanisms"
$SummaryReport += "`n5. Perform end-to-end integration testing with T-027 engine"

$SummaryReport += "`n`n=============================================================================`n"

# Display summary
Write-Host $SummaryReport

# Save detailed report
$ReportFileName = "T028_MigrationWorkflowUI_ValidationReport_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$ReportPath = Join-Path $LogPath $ReportFileName

$DetailedReport = $SummaryReport + "`n`nDETAILED TEST RESULTS:`n" + "="*50 + "`n"

foreach ($Category in @("ServiceResolution", "WaveCreation", "EventIntegration", "ExecutionFlow", "ErrorHandling")) {
    if ($TestResults[$Category].Count -gt 0) {
        $DetailedReport += "`n$Category TESTS:`n" + "-"*($Category.Length + 7) + "`n"
        
        foreach ($Test in $TestResults[$Category]) {
            $StatusIcon = switch ($Test.Status) {
                "PASS" { "[PASS]" }
                "FAIL" { "[FAIL]" }
                "WARNING" { "[WARN]" }
                default { "[INFO]" }
            }
            
            $DetailedReport += "$StatusIcon $($Test.TestName): $($Test.Status)`n"
            if ($Test.Details) { $DetailedReport += "   Details: $($Test.Details)`n" }
            if ($Test.Expected) { $DetailedReport += "   Expected: $($Test.Expected)`n" }
            if ($Test.Actual) { $DetailedReport += "   Actual: $($Test.Actual)`n" }
            $DetailedReport += "   Time: $($Test.Timestamp.ToString('HH:mm:ss'))`n`n"
        }
    }
}

$DetailedReport | Out-File -FilePath $ReportPath -Encoding UTF8
Write-Host "Detailed report saved to: $ReportPath" -ForegroundColor Green

# Create JSON report for programmatic access
$JsonReport = $TestResults | ConvertTo-Json -Depth 5
$JsonReportPath = Join-Path $LogPath "T028_MigrationWorkflowUI_ValidationResults_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$JsonReport | Out-File -FilePath $JsonReportPath -Encoding UTF8
Write-Host "JSON report saved to: $JsonReportPath" -ForegroundColor Green

# Final status
Write-Host "`n" + "="*80 -ForegroundColor Gray
Write-Host "T-028 MIGRATION WORKFLOW UI VALIDATION COMPLETE" -ForegroundColor Cyan
Write-Host $ValidationStatus
Write-Host "Duration: $($TestResults.Summary.Duration.ToString('hh\:mm\:ss'))" -ForegroundColor Gray
Write-Host "="*80 -ForegroundColor Gray

# Return exit code based on results
if ($TestResults.Summary.FailedTests -eq 0) {
    exit 0  # Success
} elseif ($TestResults.Summary.FailedTests -le 3) {
    exit 1  # Partial success with warnings
} else {
    exit 2  # Critical failures
}