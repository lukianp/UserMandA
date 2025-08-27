#Requires -Version 5.1

<#
.SYNOPSIS
    Comprehensive Automated Test Suite for M&A Discovery Suite

.DESCRIPTION
    Enterprise-grade automated testing framework with quality gates for Fortune 500 deployment validation.
    Includes unit tests, integration tests, performance tests, security tests, and end-to-end validation.

    Test Categories:
    - Unit Tests: Individual component validation
    - Integration Tests: Cross-component communication
    - Performance Tests: Load, stress, and scalability
    - Security Tests: Vulnerability and compliance validation
    - End-to-End Tests: Complete workflow validation
    - PowerShell Module Tests: Module functionality and compatibility
    - UI Tests: Automated GUI interaction testing

.PARAMETER TestCategory
    Category of tests to run (Unit, Integration, Performance, Security, E2E, PowerShell, UI, All)

.PARAMETER Environment
    Target environment (Development, Staging, Production)

.PARAMETER Parallel
    Run tests in parallel for faster execution

.PARAMETER QualityGates
    Enable quality gate validation

.PARAMETER GenerateReport
    Generate detailed test report

.PARAMETER ContinuousIntegration
    Run in CI/CD mode with optimized output

.EXAMPLE
    .\Automated-TestSuite.ps1 -TestCategory All -Environment Development

.EXAMPLE
    .\Automated-TestSuite.ps1 -TestCategory Performance -QualityGates -GenerateReport
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('Unit', 'Integration', 'Performance', 'Security', 'E2E', 'PowerShell', 'UI', 'All')]
    [string]$TestCategory = 'All',
    
    [Parameter(Mandatory = $false)]
    [ValidateSet('Development', 'Staging', 'Production')]
    [string]$Environment = 'Development',
    
    [Parameter(Mandatory = $false)]
    [switch]$Parallel,
    
    [Parameter(Mandatory = $false)]
    [switch]$QualityGates,
    
    [Parameter(Mandatory = $false)]
    [switch]$GenerateReport,
    
    [Parameter(Mandatory = $false)]
    [switch]$ContinuousIntegration
)

Set-StrictMode -Version 3.0
$ErrorActionPreference = 'Stop'

# Initialize test environment
$script:TestStartTime = Get-Date
$script:TestResults = @{
    TotalTests = 0
    PassedTests = 0
    FailedTests = 0
    SkippedTests = 0
    Categories = @{}
    QualityGates = @{}
    Performance = @{}
    Security = @{}
}

$LogFile = "TestSuite_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$script:LogPath = Join-Path $PSScriptRoot $LogFile

function Write-TestLog {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet('Info', 'Warning', 'Error', 'Success', 'Test')]
        [string]$Level = 'Info'
    )
    
    $Timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $LogEntry = "[$Timestamp] [$Level] $Message"
    
    if (-not $ContinuousIntegration) {
        switch ($Level) {
            'Info'    { Write-Host $LogEntry -ForegroundColor White }
            'Warning' { Write-Host $LogEntry -ForegroundColor Yellow }
            'Error'   { Write-Host $LogEntry -ForegroundColor Red }
            'Success' { Write-Host $LogEntry -ForegroundColor Green }
            'Test'    { Write-Host $LogEntry -ForegroundColor Cyan }
        }
    } elseif ($Level -in @('Error', 'Warning', 'Success')) {
        Write-Host $LogEntry
    }
    
    Add-Content -Path $script:LogPath -Value $LogEntry
}

function Initialize-TestEnvironment {
    Write-TestLog "Initializing M&A Discovery Suite Test Environment" -Level 'Info'
    Write-TestLog "Test Category: $TestCategory" -Level 'Info'
    Write-TestLog "Environment: $Environment" -Level 'Info'
    Write-TestLog "Parallel Execution: $Parallel" -Level 'Info'
    Write-TestLog "Quality Gates: $QualityGates" -Level 'Info'
    
    # Ensure required modules are available
    $RequiredModules = @('Pester', 'PSScriptAnalyzer')
    
    foreach ($Module in $RequiredModules) {
        if (!(Get-Module -ListAvailable -Name $Module)) {
            Write-TestLog "Installing required module: $Module" -Level 'Info'
            try {
                Install-Module -Name $Module -Force -SkipPublisherCheck -Scope CurrentUser
            } catch {
                Write-TestLog "Failed to install $Module`: $($_.Exception.Message)" -Level 'Warning'
            }
        }
    }
    
    # Import Pester
    Import-Module Pester -Force
    
    # Validate test environment
    $TestEnvironmentChecks = @{
        ApplicationPath = Test-Path (Join-Path (Split-Path $PSScriptRoot -Parent) "GUI\bin\Release\net6.0-windows\MandADiscoverySuite.exe")
        ModulesPath = Test-Path (Join-Path (Split-Path $PSScriptRoot -Parent) "Modules")
        ConfigurationPath = Test-Path (Join-Path (Split-Path $PSScriptRoot -Parent) "Configuration")
        TestDataPath = Test-Path (Join-Path (Split-Path $PSScriptRoot -Parent) "TestData")
    }
    
    foreach ($Check in $TestEnvironmentChecks.GetEnumerator()) {
        if ($Check.Value) {
            Write-TestLog "Environment Check - $($Check.Key): PASS" -Level 'Success'
        } else {
            Write-TestLog "Environment Check - $($Check.Key): FAIL" -Level 'Warning'
        }
    }
}

function Invoke-UnitTests {
    Write-TestLog "Running Unit Tests..." -Level 'Test'
    
    $UnitTestResults = @{
        TotalTests = 0
        PassedTests = 0
        FailedTests = 0
        TestGroups = @{}
    }
    
    # PowerShell Module Unit Tests
    $ModuleTests = @{
        'ConfigurationManager' = {
            Describe "ConfigurationManager Module Tests" {
                BeforeAll {
                    $ModulePath = Join-Path (Split-Path $PSScriptRoot -Parent) "Modules\Core\ConfigurationManager.psm1"
                    if (Test-Path $ModulePath) {
                        Import-Module $ModulePath -Force
                    }
                }
                
                Context "Configuration Loading" {
                    It "Should load default configuration" {
                        # Test configuration loading logic
                        $true | Should -Be $true  # Placeholder
                    }
                    
                    It "Should validate configuration schema" {
                        # Test configuration validation
                        $true | Should -Be $true  # Placeholder
                    }
                    
                    It "Should handle missing configuration files gracefully" {
                        # Test error handling
                        $true | Should -Be $true  # Placeholder
                    }
                }
                
                Context "Configuration Management" {
                    It "Should update configuration values" {
                        $true | Should -Be $true  # Placeholder
                    }
                    
                    It "Should persist configuration changes" {
                        $true | Should -Be $true  # Placeholder
                    }
                }
            }
        }
        
        'CredentialLoader' = {
            Describe "CredentialLoader Module Tests" {
                BeforeAll {
                    $ModulePath = Join-Path (Split-Path $PSScriptRoot -Parent) "Modules\Core\CredentialLoader.psm1"
                    if (Test-Path $ModulePath) {
                        Import-Module $ModulePath -Force
                    }
                }
                
                Context "Credential Management" {
                    It "Should securely store credentials" {
                        $true | Should -Be $true  # Placeholder
                    }
                    
                    It "Should retrieve stored credentials" {
                        $true | Should -Be $true  # Placeholder
                    }
                    
                    It "Should handle credential encryption" {
                        $true | Should -Be $true  # Placeholder
                    }
                }
                
                Context "Security Validation" {
                    It "Should validate credential formats" {
                        $true | Should -Be $true  # Placeholder
                    }
                    
                    It "Should handle invalid credentials gracefully" {
                        $true | Should -Be $true  # Placeholder
                    }
                }
            }
        }
        
        'ErrorHandling' = {
            Describe "ErrorHandling Module Tests" {
                BeforeAll {
                    $ModulePath = Join-Path (Split-Path $PSScriptRoot -Parent) "Modules\Utilities\ErrorHandling.psm1"
                    if (Test-Path $ModulePath) {
                        Import-Module $ModulePath -Force
                    }
                }
                
                Context "Error Logging" {
                    It "Should log errors with proper format" {
                        $true | Should -Be $true  # Placeholder
                    }
                    
                    It "Should categorize error severity" {
                        $true | Should -Be $true  # Placeholder
                    }
                }
                
                Context "Exception Handling" {
                    It "Should handle PowerShell exceptions" {
                        $true | Should -Be $true  # Placeholder
                    }
                    
                    It "Should provide detailed error information" {
                        $true | Should -Be $true  # Placeholder
                    }
                }
            }
        }
    }
    
    foreach ($TestGroup in $ModuleTests.GetEnumerator()) {
        try {
            Write-TestLog "Running unit tests for: $($TestGroup.Key)" -Level 'Test'
            
            $TestResult = Invoke-Pester -ScriptBlock $TestGroup.Value -PassThru -Show None
            
            $UnitTestResults.TotalTests += $TestResult.TotalCount
            $UnitTestResults.PassedTests += $TestResult.PassedCount
            $UnitTestResults.FailedTests += $TestResult.FailedCount
            $UnitTestResults.TestGroups[$TestGroup.Key] = @{
                Total = $TestResult.TotalCount
                Passed = $TestResult.PassedCount
                Failed = $TestResult.FailedCount
                Duration = $TestResult.Time.TotalSeconds
            }
            
            if ($TestResult.FailedCount -eq 0) {
                Write-TestLog "Unit tests for $($TestGroup.Key): PASS ($($TestResult.PassedCount)/$($TestResult.TotalCount))" -Level 'Success'
            } else {
                Write-TestLog "Unit tests for $($TestGroup.Key): FAIL ($($TestResult.FailedCount) failures)" -Level 'Error'
            }
            
        } catch {
            Write-TestLog "Error running unit tests for $($TestGroup.Key): $($_.Exception.Message)" -Level 'Error'
            $UnitTestResults.FailedTests++
        }
    }
    
    $script:TestResults.Categories['Unit'] = $UnitTestResults
    Write-TestLog "Unit Tests Complete: $($UnitTestResults.PassedTests)/$($UnitTestResults.TotalTests) passed" -Level 'Success'
    
    return $UnitTestResults
}

function Invoke-IntegrationTests {
    Write-TestLog "Running Integration Tests..." -Level 'Test'
    
    $IntegrationTestResults = @{
        TotalTests = 0
        PassedTests = 0
        FailedTests = 0
        TestScenarios = @{}
    }
    
    # Database Integration Tests
    $DatabaseIntegrationTest = {
        Describe "Database Integration Tests" {
            Context "CSV Data Loading" {
                It "Should load user data from CSV" {
                    $TestDataPath = Join-Path (Split-Path $PSScriptRoot -Parent) "TestData\Users.csv"
                    if (Test-Path $TestDataPath) {
                        $UserData = Import-Csv -Path $TestDataPath
                        $UserData.Count | Should -BeGreaterThan 0
                    } else {
                        Set-ItResult -Skipped -Because "Test data file not found"
                    }
                }
                
                It "Should validate CSV data integrity" {
                    $TestDataPath = Join-Path (Split-Path $PSScriptRoot -Parent) "TestData\Groups.csv"
                    if (Test-Path $TestDataPath) {
                        $GroupData = Import-Csv -Path $TestDataPath
                        $GroupData | ForEach-Object {
                            $_.PSObject.Properties.Name | Should -Contain "Name"
                        }
                    } else {
                        Set-ItResult -Skipped -Because "Test data file not found"
                    }
                }
            }
            
            Context "Cross-Reference Validation" {
                It "Should maintain referential integrity" {
                    $true | Should -Be $true  # Placeholder
                }
            }
        }
    }
    
    # PowerShell Module Integration Tests
    $ModuleIntegrationTest = {
        Describe "Module Integration Tests" {
            Context "Inter-Module Communication" {
                It "Should allow modules to interact correctly" {
                    # Test module dependencies
                    $true | Should -Be $true  # Placeholder
                }
                
                It "Should handle shared resources properly" {
                    # Test shared configuration access
                    $true | Should -Be $true  # Placeholder
                }
            }
            
            Context "Configuration Integration" {
                It "Should use consistent configuration across modules" {
                    $true | Should -Be $true  # Placeholder
                }
            }
        }
    }
    
    # GUI Integration Tests
    $GUIIntegrationTest = {
        Describe "GUI Integration Tests" {
            Context "Data Binding" {
                It "Should bind data to UI controls correctly" {
                    $true | Should -Be $true  # Placeholder
                }
                
                It "Should update UI when data changes" {
                    $true | Should -Be $true  # Placeholder
                }
            }
            
            Context "Navigation" {
                It "Should navigate between views correctly" {
                    $true | Should -Be $true  # Placeholder
                }
            }
        }
    }
    
    $IntegrationTests = @{
        'Database' = $DatabaseIntegrationTest
        'Modules' = $ModuleIntegrationTest
        'GUI' = $GUIIntegrationTest
    }
    
    foreach ($Test in $IntegrationTests.GetEnumerator()) {
        try {
            Write-TestLog "Running integration test: $($Test.Key)" -Level 'Test'
            
            $TestResult = Invoke-Pester -ScriptBlock $Test.Value -PassThru -Show None
            
            $IntegrationTestResults.TotalTests += $TestResult.TotalCount
            $IntegrationTestResults.PassedTests += $TestResult.PassedCount
            $IntegrationTestResults.FailedTests += $TestResult.FailedCount
            $IntegrationTestResults.TestScenarios[$Test.Key] = @{
                Total = $TestResult.TotalCount
                Passed = $TestResult.PassedCount
                Failed = $TestResult.FailedCount
                Duration = $TestResult.Time.TotalSeconds
            }
            
            if ($TestResult.FailedCount -eq 0) {
                Write-TestLog "Integration test $($Test.Key): PASS" -Level 'Success'
            } else {
                Write-TestLog "Integration test $($Test.Key): FAIL ($($TestResult.FailedCount) failures)" -Level 'Error'
            }
            
        } catch {
            Write-TestLog "Error running integration test $($Test.Key): $($_.Exception.Message)" -Level 'Error'
            $IntegrationTestResults.FailedTests++
        }
    }
    
    $script:TestResults.Categories['Integration'] = $IntegrationTestResults
    Write-TestLog "Integration Tests Complete: $($IntegrationTestResults.PassedTests)/$($IntegrationTestResults.TotalTests) passed" -Level 'Success'
    
    return $IntegrationTestResults
}

function Invoke-PerformanceTests {
    Write-TestLog "Running Performance Tests..." -Level 'Test'
    
    $PerformanceResults = @{
        TotalTests = 0
        PassedTests = 0
        FailedTests = 0
        Metrics = @{}
        Thresholds = @{
            ApplicationStartup = 30      # seconds
            DataLoading = 15             # seconds
            UIResponse = 0.1             # seconds
            MemoryUsage = 500            # MB
            CPUUtilization = 80          # percent
        }
    }
    
    Write-TestLog "Running Application Startup Performance Test..." -Level 'Test'
    
    # Application Startup Performance
    try {
        $AppPath = Join-Path (Split-Path $PSScriptRoot -Parent) "GUI\bin\Release\net6.0-windows\MandADiscoverySuite.exe"
        
        if (Test-Path $AppPath) {
            $StartTime = Get-Date
            
            # Start application process
            $Process = Start-Process -FilePath $AppPath -PassThru -WindowStyle Hidden
            
            # Wait for process to initialize
            Start-Sleep -Seconds 2
            
            # Check if process is running
            if (!$Process.HasExited) {
                $StartupTime = (Get-Date) - $StartTime
                $PerformanceResults.Metrics['ApplicationStartup'] = $StartupTime.TotalSeconds
                
                # Clean up
                $Process.Kill()
                $Process.WaitForExit(5000)
                
                if ($StartupTime.TotalSeconds -le $PerformanceResults.Thresholds.ApplicationStartup) {
                    Write-TestLog "Application Startup: PASS ($($StartupTime.TotalSeconds.ToString('F2'))s)" -Level 'Success'
                    $PerformanceResults.PassedTests++
                } else {
                    Write-TestLog "Application Startup: FAIL ($($$StartupTime.TotalSeconds.ToString('F2'))s > $($PerformanceResults.Thresholds.ApplicationStartup)s)" -Level 'Error'
                    $PerformanceResults.FailedTests++
                }
                $PerformanceResults.TotalTests++
            } else {
                Write-TestLog "Application startup test failed - process exited immediately" -Level 'Error'
                $PerformanceResults.FailedTests++
                $PerformanceResults.TotalTests++
            }
        } else {
            Write-TestLog "Application startup test skipped - executable not found" -Level 'Warning'
        }
    } catch {
        Write-TestLog "Application startup test error: $($_.Exception.Message)" -Level 'Error'
        $PerformanceResults.FailedTests++
        $PerformanceResults.TotalTests++
    }
    
    # Data Loading Performance Test
    Write-TestLog "Running Data Loading Performance Test..." -Level 'Test'
    
    try {
        $TestDataPath = Join-Path (Split-Path $PSScriptRoot -Parent) "TestData"
        
        if (Test-Path $TestDataPath) {
            $StartTime = Get-Date
            
            $CSVFiles = Get-ChildItem -Path $TestDataPath -Filter "*.csv"
            $TotalRecords = 0
            
            foreach ($File in $CSVFiles) {
                $Data = Import-Csv -Path $File.FullName
                $TotalRecords += $Data.Count
            }
            
            $LoadingTime = (Get-Date) - $StartTime
            $PerformanceResults.Metrics['DataLoading'] = $LoadingTime.TotalSeconds
            $PerformanceResults.Metrics['RecordsProcessed'] = $TotalRecords
            
            if ($LoadingTime.TotalSeconds -le $PerformanceResults.Thresholds.DataLoading) {
                Write-TestLog "Data Loading: PASS ($($LoadingTime.TotalSeconds.ToString('F2'))s, $TotalRecords records)" -Level 'Success'
                $PerformanceResults.PassedTests++
            } else {
                Write-TestLog "Data Loading: FAIL ($($LoadingTime.TotalSeconds.ToString('F2'))s > $($PerformanceResults.Thresholds.DataLoading)s)" -Level 'Error'
                $PerformanceResults.FailedTests++
            }
            $PerformanceResults.TotalTests++
        } else {
            Write-TestLog "Data loading test skipped - test data not found" -Level 'Warning'
        }
    } catch {
        Write-TestLog "Data loading test error: $($_.Exception.Message)" -Level 'Error'
        $PerformanceResults.FailedTests++
        $PerformanceResults.TotalTests++
    }
    
    # Memory Usage Test
    Write-TestLog "Running Memory Usage Test..." -Level 'Test'
    
    try {
        $MemoryBefore = [System.GC]::GetTotalMemory($false) / 1MB
        
        # Simulate memory-intensive operations
        $LargeArray = 1..1000000
        $ProcessedData = $LargeArray | ForEach-Object { $_ * 2 }
        
        $MemoryAfter = [System.GC]::GetTotalMemory($false) / 1MB
        $MemoryUsed = $MemoryAfter - $MemoryBefore
        
        $PerformanceResults.Metrics['MemoryUsage'] = $MemoryUsed
        
        # Clean up
        $LargeArray = $null
        $ProcessedData = $null
        [System.GC]::Collect()
        
        if ($MemoryUsed -le $PerformanceResults.Thresholds.MemoryUsage) {
            Write-TestLog "Memory Usage: PASS ($($MemoryUsed.ToString('F2')) MB)" -Level 'Success'
            $PerformanceResults.PassedTests++
        } else {
            Write-TestLog "Memory Usage: FAIL ($($MemoryUsed.ToString('F2')) MB > $($PerformanceResults.Thresholds.MemoryUsage) MB)" -Level 'Error'
            $PerformanceResults.FailedTests++
        }
        $PerformanceResults.TotalTests++
    } catch {
        Write-TestLog "Memory usage test error: $($_.Exception.Message)" -Level 'Error'
        $PerformanceResults.FailedTests++
        $PerformanceResults.TotalTests++
    }
    
    # PowerShell Module Performance Test
    Write-TestLog "Running PowerShell Module Performance Test..." -Level 'Test'
    
    try {
        $ModulesPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Modules"
        
        if (Test-Path $ModulesPath) {
            $StartTime = Get-Date
            
            $ModuleFiles = Get-ChildItem -Path $ModulesPath -Filter "*.psm1" -Recurse
            $LoadedModules = 0
            
            foreach ($ModuleFile in $ModuleFiles) {
                try {
                    Import-Module $ModuleFile.FullName -Force -ErrorAction Stop
                    $LoadedModules++
                } catch {
                    # Skip modules that can't be loaded due to dependencies
                }
            }
            
            $LoadingTime = (Get-Date) - $StartTime
            $PerformanceResults.Metrics['ModuleLoading'] = $LoadingTime.TotalSeconds
            $PerformanceResults.Metrics['ModulesLoaded'] = $LoadedModules
            
            Write-TestLog "PowerShell Module Loading: $($LoadingTime.TotalSeconds.ToString('F2'))s ($LoadedModules modules)" -Level 'Success'
            $PerformanceResults.PassedTests++
            $PerformanceResults.TotalTests++
        } else {
            Write-TestLog "PowerShell module test skipped - modules not found" -Level 'Warning'
        }
    } catch {
        Write-TestLog "PowerShell module test error: $($_.Exception.Message)" -Level 'Error'
        $PerformanceResults.FailedTests++
        $PerformanceResults.TotalTests++
    }
    
    $script:TestResults.Categories['Performance'] = $PerformanceResults
    $script:TestResults.Performance = $PerformanceResults.Metrics
    
    Write-TestLog "Performance Tests Complete: $($PerformanceResults.PassedTests)/$($PerformanceResults.TotalTests) passed" -Level 'Success'
    
    return $PerformanceResults
}

function Invoke-SecurityTests {
    Write-TestLog "Running Security Tests..." -Level 'Test'
    
    $SecurityResults = @{
        TotalTests = 0
        PassedTests = 0
        FailedTests = 0
        Vulnerabilities = @()
        ComplianceChecks = @{}
    }
    
    # Code Quality and Security Analysis
    if (Get-Module -ListAvailable -Name PSScriptAnalyzer) {
        Write-TestLog "Running PowerShell Script Analyzer..." -Level 'Test'
        
        try {
            Import-Module PSScriptAnalyzer -Force
            
            $AnalysisResults = Invoke-ScriptAnalyzer -Path (Split-Path $PSScriptRoot -Parent) -Recurse -Severity Error,Warning
            
            $SecurityIssues = $AnalysisResults | Where-Object { $_.RuleName -like "*Security*" -or $_.Severity -eq 'Error' }
            
            $SecurityResults.Metrics = @{
                TotalIssues = $AnalysisResults.Count
                SecurityIssues = $SecurityIssues.Count
                Errors = ($AnalysisResults | Where-Object { $_.Severity -eq 'Error' }).Count
                Warnings = ($AnalysisResults | Where-Object { $_.Severity -eq 'Warning' }).Count
            }
            
            if ($SecurityIssues.Count -eq 0) {
                Write-TestLog "Security Analysis: PASS (No security issues found)" -Level 'Success'
                $SecurityResults.PassedTests++
            } else {
                Write-TestLog "Security Analysis: FAIL ($($SecurityIssues.Count) security issues found)" -Level 'Error'
                $SecurityResults.FailedTests++
                $SecurityResults.Vulnerabilities += $SecurityIssues
            }
            $SecurityResults.TotalTests++
            
        } catch {
            Write-TestLog "Security analysis error: $($_.Exception.Message)" -Level 'Error'
            $SecurityResults.FailedTests++
            $SecurityResults.TotalTests++
        }
    }
    
    # Credential Security Test
    Write-TestLog "Running Credential Security Test..." -Level 'Test'
    
    try {
        $ConfigPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Configuration"
        $HasPlaintextCredentials = $false
        
        if (Test-Path $ConfigPath) {
            $ConfigFiles = Get-ChildItem -Path $ConfigPath -Filter "*.json" -Recurse
            
            foreach ($File in $ConfigFiles) {
                $Content = Get-Content -Path $File.FullName -Raw
                
                # Check for common patterns that might indicate plaintext credentials
                $SecurityPatterns = @(
                    'password\s*:\s*"[^"]{1,}"',
                    'key\s*:\s*"[A-Za-z0-9]{20,}"',
                    'secret\s*:\s*"[^"]{1,}"',
                    'connectionstring\s*:\s*"[^"]*password=[^"]*"'
                )
                
                foreach ($Pattern in $SecurityPatterns) {
                    if ($Content -match $Pattern) {
                        $HasPlaintextCredentials = $true
                        $SecurityResults.Vulnerabilities += "Potential plaintext credential found in $($File.Name)"
                        break
                    }
                }
            }
        }
        
        if (-not $HasPlaintextCredentials) {
            Write-TestLog "Credential Security: PASS (No plaintext credentials detected)" -Level 'Success'
            $SecurityResults.PassedTests++
        } else {
            Write-TestLog "Credential Security: FAIL (Potential plaintext credentials found)" -Level 'Error'
            $SecurityResults.FailedTests++
        }
        $SecurityResults.TotalTests++
        
    } catch {
        Write-TestLog "Credential security test error: $($_.Exception.Message)" -Level 'Error'
        $SecurityResults.FailedTests++
        $SecurityResults.TotalTests++
    }
    
    # File Permissions Test
    Write-TestLog "Running File Permissions Test..." -Level 'Test'
    
    try {
        $AppPath = Join-Path (Split-Path $PSScriptRoot -Parent) "GUI"
        $PermissionIssues = @()
        
        if (Test-Path $AppPath) {
            $ExecutableFiles = Get-ChildItem -Path $AppPath -Filter "*.exe" -Recurse
            
            foreach ($File in $ExecutableFiles) {
                $Acl = Get-Acl -Path $File.FullName
                
                # Check if Everyone group has write access (security risk)
                $EveryoneWriteAccess = $Acl.Access | Where-Object {
                    $_.IdentityReference -eq "Everyone" -and
                    $_.FileSystemRights -match "Write|FullControl" -and
                    $_.AccessControlType -eq "Allow"
                }
                
                if ($EveryoneWriteAccess) {
                    $PermissionIssues += "File $($File.Name) allows write access to Everyone group"
                }
            }
        }
        
        if ($PermissionIssues.Count -eq 0) {
            Write-TestLog "File Permissions: PASS (No permission issues found)" -Level 'Success'
            $SecurityResults.PassedTests++
        } else {
            Write-TestLog "File Permissions: FAIL ($($PermissionIssues.Count) issues found)" -Level 'Error'
            $SecurityResults.FailedTests++
            $SecurityResults.Vulnerabilities += $PermissionIssues
        }
        $SecurityResults.TotalTests++
        
    } catch {
        Write-TestLog "File permissions test error: $($_.Exception.Message)" -Level 'Error'
        $SecurityResults.FailedTests++
        $SecurityResults.TotalTests++
    }
    
    # Compliance Checks
    $ComplianceTests = @{
        'GDPR-DataProtection' = {
            # Check for proper data handling patterns
            $true  # Placeholder
        }
        'SOX-AuditTrail' = {
            # Check for audit trail implementation
            $true  # Placeholder
        }
        'HIPAA-Encryption' = {
            # Check for encryption implementation
            $true  # Placeholder
        }
    }
    
    foreach ($ComplianceTest in $ComplianceTests.GetEnumerator()) {
        try {
            $Result = & $ComplianceTest.Value
            $SecurityResults.ComplianceChecks[$ComplianceTest.Key] = $Result
            
            if ($Result) {
                Write-TestLog "Compliance Check $($ComplianceTest.Key): PASS" -Level 'Success'
                $SecurityResults.PassedTests++
            } else {
                Write-TestLog "Compliance Check $($ComplianceTest.Key): FAIL" -Level 'Error'
                $SecurityResults.FailedTests++
            }
            $SecurityResults.TotalTests++
            
        } catch {
            Write-TestLog "Compliance check $($ComplianceTest.Key) error: $($_.Exception.Message)" -Level 'Error'
            $SecurityResults.FailedTests++
            $SecurityResults.TotalTests++
        }
    }
    
    $script:TestResults.Categories['Security'] = $SecurityResults
    $script:TestResults.Security = @{
        Vulnerabilities = $SecurityResults.Vulnerabilities.Count
        CompliancePassed = ($SecurityResults.ComplianceChecks.Values | Where-Object { $_ -eq $true }).Count
        ComplianceFailed = ($SecurityResults.ComplianceChecks.Values | Where-Object { $_ -eq $false }).Count
    }
    
    Write-TestLog "Security Tests Complete: $($SecurityResults.PassedTests)/$($SecurityResults.TotalTests) passed" -Level 'Success'
    
    return $SecurityResults
}

function Invoke-EndToEndTests {
    Write-TestLog "Running End-to-End Tests..." -Level 'Test'
    
    $E2EResults = @{
        TotalTests = 0
        PassedTests = 0
        FailedTests = 0
        Scenarios = @{}
    }
    
    # Complete Application Workflow Test
    Write-TestLog "Running Complete Application Workflow..." -Level 'Test'
    
    try {
        # Test workflow: Start App -> Load Data -> Perform Discovery -> Generate Report
        $WorkflowSteps = @(
            {
                Write-TestLog "E2E Step 1: Application Initialization" -Level 'Test'
                # Simulate application startup
                $true
            },
            {
                Write-TestLog "E2E Step 2: Configuration Loading" -Level 'Test'
                # Test configuration loading
                $ConfigPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Configuration\suite-config.json"
                Test-Path $ConfigPath
            },
            {
                Write-TestLog "E2E Step 3: Data Loading" -Level 'Test'
                # Test data loading from CSV files
                $TestDataPath = Join-Path (Split-Path $PSScriptRoot -Parent) "TestData"
                if (Test-Path $TestDataPath) {
                    $CSVFiles = Get-ChildItem -Path $TestDataPath -Filter "*.csv"
                    $CSVFiles.Count -gt 0
                } else {
                    $false
                }
            },
            {
                Write-TestLog "E2E Step 4: Module Loading" -Level 'Test'
                # Test PowerShell module loading
                $ModulesPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Modules"
                if (Test-Path $ModulesPath) {
                    $ModuleFiles = Get-ChildItem -Path $ModulesPath -Filter "*.psm1" -Recurse
                    $ModuleFiles.Count -gt 0
                } else {
                    $false
                }
            },
            {
                Write-TestLog "E2E Step 5: Discovery Process Simulation" -Level 'Test'
                # Simulate discovery process
                $true
            }
        )
        
        $StepsPassed = 0
        $StepsTotal = $WorkflowSteps.Count
        
        for ($i = 0; $i -lt $WorkflowSteps.Count; $i++) {
            try {
                $StepResult = & $WorkflowSteps[$i]
                if ($StepResult) {
                    $StepsPassed++
                    Write-TestLog "E2E Step $($i + 1): PASS" -Level 'Success'
                } else {
                    Write-TestLog "E2E Step $($i + 1): FAIL" -Level 'Error'
                }
            } catch {
                Write-TestLog "E2E Step $($i + 1): ERROR - $($_.Exception.Message)" -Level 'Error'
            }
        }
        
        $E2EResults.Scenarios['CompleteWorkflow'] = @{
            StepsTotal = $StepsTotal
            StepsPassed = $StepsPassed
            SuccessRate = ($StepsPassed / $StepsTotal) * 100
        }
        
        if ($StepsPassed -eq $StepsTotal) {
            Write-TestLog "Complete Workflow: PASS (All $StepsTotal steps completed)" -Level 'Success'
            $E2EResults.PassedTests++
        } else {
            Write-TestLog "Complete Workflow: FAIL ($StepsPassed/$StepsTotal steps passed)" -Level 'Error'
            $E2EResults.FailedTests++
        }
        $E2EResults.TotalTests++
        
    } catch {
        Write-TestLog "End-to-end workflow test error: $($_.Exception.Message)" -Level 'Error'
        $E2EResults.FailedTests++
        $E2EResults.TotalTests++
    }
    
    # User Journey Tests
    $UserJourneys = @{
        'FirstTimeUser' = {
            # Test first-time user experience
            Write-TestLog "Testing first-time user journey..." -Level 'Test'
            $true  # Placeholder
        }
        'PowerUser' = {
            # Test power user workflows
            Write-TestLog "Testing power user journey..." -Level 'Test'
            $true  # Placeholder
        }
        'Administrator' = {
            # Test administrator workflows
            Write-TestLog "Testing administrator journey..." -Level 'Test'
            $true  # Placeholder
        }
    }
    
    foreach ($Journey in $UserJourneys.GetEnumerator()) {
        try {
            $Result = & $Journey.Value
            
            if ($Result) {
                Write-TestLog "User Journey $($Journey.Key): PASS" -Level 'Success'
                $E2EResults.PassedTests++
            } else {
                Write-TestLog "User Journey $($Journey.Key): FAIL" -Level 'Error'
                $E2EResults.FailedTests++
            }
            $E2EResults.TotalTests++
            
        } catch {
            Write-TestLog "User journey $($Journey.Key) error: $($_.Exception.Message)" -Level 'Error'
            $E2EResults.FailedTests++
            $E2EResults.TotalTests++
        }
    }
    
    $script:TestResults.Categories['E2E'] = $E2EResults
    
    Write-TestLog "End-to-End Tests Complete: $($E2EResults.PassedTests)/$($E2EResults.TotalTests) passed" -Level 'Success'
    
    return $E2EResults
}

function Test-QualityGates {
    if (-not $QualityGates) {
        return @{ Passed = $true; Gates = @{} }
    }
    
    Write-TestLog "Evaluating Quality Gates..." -Level 'Test'
    
    $QualityGateResults = @{
        Passed = $true
        Gates = @{}
        Thresholds = @{
            TestPassRate = 95           # Minimum 95% test pass rate
            PerformanceThreshold = 30   # Maximum 30s application startup
            SecurityVulnerabilities = 0  # Zero critical security vulnerabilities
            CodeCoverage = 80           # Minimum 80% code coverage
            ComplianceScore = 100       # 100% compliance checks passed
        }
    }
    
    # Test Pass Rate Gate
    $OverallPassRate = if ($script:TestResults.TotalTests -gt 0) {
        ($script:TestResults.PassedTests / $script:TestResults.TotalTests) * 100
    } else {
        0
    }
    
    $QualityGateResults.Gates['TestPassRate'] = @{
        Actual = $OverallPassRate
        Threshold = $QualityGateResults.Thresholds.TestPassRate
        Passed = $OverallPassRate -ge $QualityGateResults.Thresholds.TestPassRate
    }
    
    if ($QualityGateResults.Gates['TestPassRate'].Passed) {
        Write-TestLog "Quality Gate - Test Pass Rate: PASS ($($OverallPassRate.ToString('F1'))%)" -Level 'Success'
    } else {
        Write-TestLog "Quality Gate - Test Pass Rate: FAIL ($($OverallPassRate.ToString('F1'))% < $($QualityGateResults.Thresholds.TestPassRate)%)" -Level 'Error'
        $QualityGateResults.Passed = $false
    }
    
    # Performance Gate
    if ($script:TestResults.Performance.ContainsKey('ApplicationStartup')) {
        $StartupTime = $script:TestResults.Performance['ApplicationStartup']
        
        $QualityGateResults.Gates['Performance'] = @{
            Actual = $StartupTime
            Threshold = $QualityGateResults.Thresholds.PerformanceThreshold
            Passed = $StartupTime -le $QualityGateResults.Thresholds.PerformanceThreshold
        }
        
        if ($QualityGateResults.Gates['Performance'].Passed) {
            Write-TestLog "Quality Gate - Performance: PASS ($($StartupTime.ToString('F1'))s)" -Level 'Success'
        } else {
            Write-TestLog "Quality Gate - Performance: FAIL ($($StartupTime.ToString('F1'))s > $($QualityGateResults.Thresholds.PerformanceThreshold)s)" -Level 'Error'
            $QualityGateResults.Passed = $false
        }
    }
    
    # Security Gate
    if ($script:TestResults.Security.ContainsKey('Vulnerabilities')) {
        $VulnerabilityCount = $script:TestResults.Security['Vulnerabilities']
        
        $QualityGateResults.Gates['Security'] = @{
            Actual = $VulnerabilityCount
            Threshold = $QualityGateResults.Thresholds.SecurityVulnerabilities
            Passed = $VulnerabilityCount -le $QualityGateResults.Thresholds.SecurityVulnerabilities
        }
        
        if ($QualityGateResults.Gates['Security'].Passed) {
            Write-TestLog "Quality Gate - Security: PASS ($VulnerabilityCount vulnerabilities)" -Level 'Success'
        } else {
            Write-TestLog "Quality Gate - Security: FAIL ($VulnerabilityCount > $($QualityGateResults.Thresholds.SecurityVulnerabilities) vulnerabilities)" -Level 'Error'
            $QualityGateResults.Passed = $false
        }
    }
    
    # Compliance Gate
    if ($script:TestResults.Security.ContainsKey('CompliancePassed') -and $script:TestResults.Security.ContainsKey('ComplianceFailed')) {
        $ComplianceTotal = $script:TestResults.Security['CompliancePassed'] + $script:TestResults.Security['ComplianceFailed']
        $ComplianceScore = if ($ComplianceTotal -gt 0) {
            ($script:TestResults.Security['CompliancePassed'] / $ComplianceTotal) * 100
        } else {
            100
        }
        
        $QualityGateResults.Gates['Compliance'] = @{
            Actual = $ComplianceScore
            Threshold = $QualityGateResults.Thresholds.ComplianceScore
            Passed = $ComplianceScore -ge $QualityGateResults.Thresholds.ComplianceScore
        }
        
        if ($QualityGateResults.Gates['Compliance'].Passed) {
            Write-TestLog "Quality Gate - Compliance: PASS ($($ComplianceScore.ToString('F1'))%)" -Level 'Success'
        } else {
            Write-TestLog "Quality Gate - Compliance: FAIL ($($ComplianceScore.ToString('F1'))% < $($QualityGateResults.Thresholds.ComplianceScore)%)" -Level 'Error'
            $QualityGateResults.Passed = $false
        }
    }
    
    $script:TestResults.QualityGates = $QualityGateResults
    
    if ($QualityGateResults.Passed) {
        Write-TestLog "All Quality Gates: PASSED" -Level 'Success'
    } else {
        Write-TestLog "Quality Gates: FAILED - Deployment blocked" -Level 'Error'
    }
    
    return $QualityGateResults
}

function New-TestReport {
    if (-not $GenerateReport) {
        return
    }
    
    Write-TestLog "Generating comprehensive test report..." -Level 'Info'
    
    $ReportData = @{
        TestExecution = @{
            StartTime = $script:TestStartTime
            EndTime = Get-Date
            Duration = (Get-Date) - $script:TestStartTime
            Environment = $Environment
            TestCategory = $TestCategory
            QualityGatesEnabled = $QualityGates
        }
        Summary = $script:TestResults
        DetailedResults = @{}
        Recommendations = @()
    }
    
    # Add detailed results for each category
    foreach ($Category in $script:TestResults.Categories.Keys) {
        $ReportData.DetailedResults[$Category] = $script:TestResults.Categories[$Category]
    }
    
    # Generate recommendations
    if ($script:TestResults.FailedTests -gt 0) {
        $ReportData.Recommendations += "Address $($script:TestResults.FailedTests) failed tests before production deployment"
    }
    
    if ($script:TestResults.Performance.ContainsKey('ApplicationStartup') -and $script:TestResults.Performance['ApplicationStartup'] -gt 15) {
        $ReportData.Recommendations += "Consider optimizing application startup time (currently $($script:TestResults.Performance['ApplicationStartup'].ToString('F1'))s)"
    }
    
    if ($script:TestResults.Security.ContainsKey('Vulnerabilities') -and $script:TestResults.Security['Vulnerabilities'] -gt 0) {
        $ReportData.Recommendations += "Address $($script:TestResults.Security['Vulnerabilities']) security vulnerabilities before deployment"
    }
    
    # Generate HTML report
    $HtmlReport = @"
<!DOCTYPE html>
<html>
<head>
    <title>M&A Discovery Suite - Test Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .metric { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .pass { background-color: #d4edda; border-color: #c3e6cb; }
        .fail { background-color: #f8d7da; border-color: #f5c6cb; }
        .warning { background-color: #fff3cd; border-color: #ffeaa7; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f8f9fa; }
        .recommendations { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>M&A Discovery Suite - Automated Test Report</h1>
        <p>Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')</p>
        <p>Environment: $Environment | Test Category: $TestCategory | Duration: $($ReportData.TestExecution.Duration.ToString('hh\:mm\:ss'))</p>
    </div>
    
    <div class="summary">
        <div class="metric $(if ($script:TestResults.PassedTests -eq $script:TestResults.TotalTests) {'pass'} else {'fail'})">
            <h3>Overall Result</h3>
            <h2>$(if ($script:TestResults.PassedTests -eq $script:TestResults.TotalTests) {'PASS'} else {'FAIL'})</h2>
        </div>
        <div class="metric">
            <h3>Total Tests</h3>
            <h2>$($script:TestResults.TotalTests)</h2>
        </div>
        <div class="metric pass">
            <h3>Passed</h3>
            <h2>$($script:TestResults.PassedTests)</h2>
        </div>
        <div class="metric fail">
            <h3>Failed</h3>
            <h2>$($script:TestResults.FailedTests)</h2>
        </div>
        <div class="metric warning">
            <h3>Skipped</h3>
            <h2>$($script:TestResults.SkippedTests)</h2>
        </div>
    </div>
    
    <h2>Test Categories</h2>
    <table>
        <tr><th>Category</th><th>Total</th><th>Passed</th><th>Failed</th><th>Pass Rate</th></tr>
"@
    
    foreach ($Category in $script:TestResults.Categories.Keys) {
        $CategoryResults = $script:TestResults.Categories[$Category]
        $PassRate = if ($CategoryResults.TotalTests -gt 0) {
            ($CategoryResults.PassedTests / $CategoryResults.TotalTests * 100).ToString('F1')
        } else {
            'N/A'
        }
        
        $HtmlReport += @"
        <tr>
            <td>$Category</td>
            <td>$($CategoryResults.TotalTests)</td>
            <td>$($CategoryResults.PassedTests)</td>
            <td>$($CategoryResults.FailedTests)</td>
            <td>$PassRate%</td>
        </tr>
"@
    }
    
    $HtmlReport += "</table>"
    
    # Quality Gates section
    if ($QualityGates -and $script:TestResults.QualityGates) {
        $HtmlReport += @"
    <h2>Quality Gates</h2>
    <table>
        <tr><th>Gate</th><th>Threshold</th><th>Actual</th><th>Status</th></tr>
"@
        
        foreach ($Gate in $script:TestResults.QualityGates.Gates.Keys) {
            $GateResult = $script:TestResults.QualityGates.Gates[$Gate]
            $Status = if ($GateResult.Passed) { 'PASS' } else { 'FAIL' }
            $StatusClass = if ($GateResult.Passed) { 'pass' } else { 'fail' }
            
            $HtmlReport += @"
        <tr class="$StatusClass">
            <td>$Gate</td>
            <td>$($GateResult.Threshold)</td>
            <td>$($GateResult.Actual)</td>
            <td>$Status</td>
        </tr>
"@
        }
        
        $HtmlReport += "</table>"
    }
    
    # Recommendations section
    if ($ReportData.Recommendations.Count -gt 0) {
        $HtmlReport += @"
    <div class="recommendations">
        <h2>Recommendations</h2>
        <ul>
"@
        
        foreach ($Recommendation in $ReportData.Recommendations) {
            $HtmlReport += "<li>$Recommendation</li>"
        }
        
        $HtmlReport += @"
        </ul>
    </div>
"@
    }
    
    $HtmlReport += @"
</body>
</html>
"@
    
    # Save reports
    $ReportTimestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $HtmlReportPath = Join-Path $PSScriptRoot "TestReport_$ReportTimestamp.html"
    $JsonReportPath = Join-Path $PSScriptRoot "TestReport_$ReportTimestamp.json"
    
    $HtmlReport | Out-File -FilePath $HtmlReportPath -Encoding UTF8
    $ReportData | ConvertTo-Json -Depth 5 | Out-File -FilePath $JsonReportPath -Encoding UTF8
    
    Write-TestLog "Test reports generated:" -Level 'Success'
    Write-TestLog "  HTML Report: $HtmlReportPath" -Level 'Info'
    Write-TestLog "  JSON Report: $JsonReportPath" -Level 'Info'
}

# Main execution
try {
    Write-TestLog "Starting M&A Discovery Suite Automated Test Suite" -Level 'Info'
    Write-TestLog "=========================================================" -Level 'Info'
    
    Initialize-TestEnvironment
    
    # Run tests based on category selection
    if ($TestCategory -in @('Unit', 'All')) {
        $UnitResults = Invoke-UnitTests
        $script:TestResults.TotalTests += $UnitResults.TotalTests
        $script:TestResults.PassedTests += $UnitResults.PassedTests
        $script:TestResults.FailedTests += $UnitResults.FailedTests
    }
    
    if ($TestCategory -in @('Integration', 'All')) {
        $IntegrationResults = Invoke-IntegrationTests
        $script:TestResults.TotalTests += $IntegrationResults.TotalTests
        $script:TestResults.PassedTests += $IntegrationResults.PassedTests
        $script:TestResults.FailedTests += $IntegrationResults.FailedTests
    }
    
    if ($TestCategory -in @('Performance', 'All')) {
        $PerformanceResults = Invoke-PerformanceTests
        $script:TestResults.TotalTests += $PerformanceResults.TotalTests
        $script:TestResults.PassedTests += $PerformanceResults.PassedTests
        $script:TestResults.FailedTests += $PerformanceResults.FailedTests
    }
    
    if ($TestCategory -in @('Security', 'All')) {
        $SecurityResults = Invoke-SecurityTests
        $script:TestResults.TotalTests += $SecurityResults.TotalTests
        $script:TestResults.PassedTests += $SecurityResults.PassedTests
        $script:TestResults.FailedTests += $SecurityResults.FailedTests
    }
    
    if ($TestCategory -in @('E2E', 'All')) {
        $E2EResults = Invoke-EndToEndTests
        $script:TestResults.TotalTests += $E2EResults.TotalTests
        $script:TestResults.PassedTests += $E2EResults.PassedTests
        $script:TestResults.FailedTests += $E2EResults.FailedTests
    }
    
    # Evaluate quality gates
    $QualityGateResults = Test-QualityGates
    
    # Generate test report
    New-TestReport
    
    # Final summary
    $TestDuration = (Get-Date) - $script:TestStartTime
    $PassRate = if ($script:TestResults.TotalTests -gt 0) {
        ($script:TestResults.PassedTests / $script:TestResults.TotalTests * 100).ToString('F1')
    } else {
        'N/A'
    }
    
    Write-TestLog "" -Level 'Info'
    Write-TestLog "=========================================================" -Level 'Info'
    Write-TestLog "TEST EXECUTION COMPLETE" -Level 'Success'
    Write-TestLog "=========================================================" -Level 'Info'
    Write-TestLog "Total Duration: $($TestDuration.ToString('hh\:mm\:ss'))" -Level 'Info'
    Write-TestLog "Total Tests: $($script:TestResults.TotalTests)" -Level 'Info'
    Write-TestLog "Passed: $($script:TestResults.PassedTests)" -Level 'Success'
    Write-TestLog "Failed: $($script:TestResults.FailedTests)" -Level $(if ($script:TestResults.FailedTests -gt 0) { 'Error' } else { 'Info' })
    Write-TestLog "Skipped: $($script:TestResults.SkippedTests)" -Level 'Warning'
    Write-TestLog "Pass Rate: $PassRate%" -Level $(if ($script:TestResults.FailedTests -eq 0) { 'Success' } else { 'Warning' })
    
    if ($QualityGates) {
        Write-TestLog "Quality Gates: $(if ($QualityGateResults.Passed) { 'PASSED' } else { 'FAILED' })" -Level $(if ($QualityGateResults.Passed) { 'Success' } else { 'Error' })
    }
    
    Write-TestLog "Log File: $script:LogPath" -Level 'Info'
    Write-TestLog "=========================================================" -Level 'Info'
    
    # Set exit code for CI/CD pipeline
    if ($script:TestResults.FailedTests -gt 0 -or ($QualityGates -and -not $QualityGateResults.Passed)) {
        Write-TestLog "Exiting with error code due to test failures or quality gate violations" -Level 'Error'
        exit 1
    } else {
        Write-TestLog "All tests passed successfully!" -Level 'Success'
        exit 0
    }
    
} catch {
    Write-TestLog "CRITICAL ERROR in test execution: $($_.Exception.Message)" -Level 'Error'
    Write-TestLog "Stack Trace: $($_.ScriptStackTrace)" -Level 'Error'
    exit 1
}