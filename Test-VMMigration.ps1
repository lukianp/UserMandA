#!/usr/bin/env powershell
<#
.SYNOPSIS
    Test script for Virtual Machine Migration module
    
.DESCRIPTION
    Comprehensive test suite for validating VirtualMachineMigration module functionality
    including unit tests, integration tests, and scenario validation.
    
.NOTES
    Author: M&A Discovery Suite
    Version: 1.0
    Requires: VirtualMachineMigration module
#>

#Requires -Version 5.1

param(
    [Parameter()]
    [ValidateSet("Unit", "Integration", "Performance", "All")]
    [string]$TestType = "All",
    
    [Parameter()]
    [switch]$Verbose
)

# Import the module
Import-Module "$PSScriptRoot\Modules\Migration\VirtualMachineMigration.psm1" -Force

# Test result tracking
$script:TestResults = @{
    Passed = 0
    Failed = 0
    Skipped = 0
    Details = @()
}

function Write-TestHeader {
    param([string]$Title)
    
    Write-Host "`n" + "="*80 -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Yellow
    Write-Host "="*80 -ForegroundColor Cyan
}

function Test-Assert {
    param(
        [string]$TestName,
        [bool]$Condition,
        [string]$ErrorMessage = "Test failed"
    )
    
    if ($Condition) {
        Write-Host "  ✓ PASS: $TestName" -ForegroundColor Green
        $script:TestResults.Passed++
        $script:TestResults.Details += @{
            Name = $TestName
            Result = "PASS"
            Message = ""
        }
    } else {
        Write-Host "  ✗ FAIL: $TestName - $ErrorMessage" -ForegroundColor Red
        $script:TestResults.Failed++
        $script:TestResults.Details += @{
            Name = $TestName
            Result = "FAIL"
            Message = $ErrorMessage
        }
    }
}

function Test-Skip {
    param([string]$TestName, [string]$Reason)
    
    Write-Host "  ⚠ SKIP: $TestName - $Reason" -ForegroundColor Yellow
    $script:TestResults.Skipped++
    $script:TestResults.Details += @{
        Name = $TestName
        Result = "SKIP"
        Message = $Reason
    }
}

function Test-UnitTests {
    Write-TestHeader "Unit Tests - VirtualMachineMigration Module"
    
    try {
        # Test 1: Module loading
        Test-Assert "Module can be imported" $true
        
        # Test 2: Class instantiation
        try {
            $vmMigration = New-VirtualMachineMigration -CompanyName "TestCompany"
            Test-Assert "VirtualMachineMigration class instantiation" ($vmMigration -ne $null)
            Test-Assert "Company name set correctly" ($vmMigration.CompanyName -eq "TestCompany")
        } catch {
            Test-Assert "VirtualMachineMigration class instantiation" $false $_.Exception.Message
        }
        
        # Test 3: Environment creation
        try {
            $azureEnv = New-VMEnvironment -Name "TestAzure" -Type "Azure" -SubscriptionId "test-sub" -Location "East US"
            Test-Assert "Azure environment creation" ($azureEnv -ne $null)
            Test-Assert "Environment name set correctly" ($azureEnv.Name -eq "TestAzure")
            Test-Assert "Environment type set correctly" ($azureEnv.Type -eq "Azure")
            Test-Assert "Supported migration types populated" ($azureEnv.SupportedMigrationTypes.Count -gt 0)
        } catch {
            Test-Assert "Azure environment creation" $false $_.Exception.Message
        }
        
        # Test 4: VMware environment creation
        try {
            $vmwareEnv = New-VMEnvironment -Name "TestVMware" -Type "VMware" -ConnectionConfig @{ vCenterServer = "test.local" }
            Test-Assert "VMware environment creation" ($vmwareEnv -ne $null)
            Test-Assert "VMware environment type" ($vmwareEnv.Type -eq "VMware")
            Test-Assert "VMware supported migrations" ($vmwareEnv.SupportedMigrationTypes -contains [VMMigrationType]::VMwareToAzure)
        } catch {
            Test-Assert "VMware environment creation" $false $_.Exception.Message
        }
        
        # Test 5: Hyper-V environment creation
        try {
            $hypervEnv = New-VMEnvironment -Name "TestHyperV" -Type "HyperV" -ConnectionConfig @{ ComputerName = "hyperv.local" }
            Test-Assert "Hyper-V environment creation" ($hypervEnv -ne $null)
            Test-Assert "Hyper-V environment type" ($hypervEnv.Type -eq "HyperV")
            Test-Assert "Hyper-V supported migrations" ($hypervEnv.SupportedMigrationTypes -contains [VMMigrationType]::HyperVToAzure)
        } catch {
            Test-Assert "Hyper-V environment creation" $false $_.Exception.Message
        }
        
        # Test 6: Environment addition to migration manager
        try {
            $vmMigration.AddEnvironment($azureEnv)
            Test-Assert "Environment added to migration manager" ($vmMigration.Environments.ContainsKey("TestAzure"))
            Test-Assert "Environment count" ($vmMigration.Environments.Count -eq 1)
        } catch {
            Test-Assert "Environment addition" $false $_.Exception.Message
        }
        
        # Test 7: Migration configuration validation
        try {
            $validConfig = @{
                VMName = "TestVM"
                MigrationType = [VMMigrationType]::AzureToAzure
                Source = @{
                    ResourceGroupName = "source-rg"
                }
                Target = @{
                    ResourceGroupName = "target-rg"
                }
            }
            
            $isValid = $vmMigration.ValidateMigrationConfig($validConfig)
            Test-Assert "Valid migration configuration" $isValid
        } catch {
            Test-Assert "Migration configuration validation" $false $_.Exception.Message
        }
        
        # Test 8: Invalid migration configuration
        try {
            $invalidConfig = @{
                # Missing required fields
                VMName = ""
            }
            
            $isValid = $vmMigration.ValidateMigrationConfig($invalidConfig)
            Test-Assert "Invalid migration configuration rejected" (!$isValid)
        } catch {
            Test-Assert "Invalid configuration handling" $false $_.Exception.Message
        }
        
        # Test 9: Migration job creation
        try {
            $job = [VMReplicationJob]::new("TestVM", [VMMigrationType]::AzureToAzure)
            Test-Assert "Migration job creation" ($job -ne $null)
            Test-Assert "Job ID generated" (![string]::IsNullOrEmpty($job.JobId))
            Test-Assert "Job status initialized" ($job.Status -eq [VMMigrationStatus]::NotStarted)
            Test-Assert "Job health initialized" ($job.Health -eq [VMReplicationHealth]::Unknown)
        } catch {
            Test-Assert "Migration job creation" $false $_.Exception.Message
        }
        
        # Test 10: Migration statistics
        try {
            $stats = $vmMigration.GetMigrationStatistics()
            Test-Assert "Migration statistics generation" ($stats -ne $null)
            Test-Assert "Statistics has TotalJobs" ($stats.ContainsKey("TotalJobs"))
            Test-Assert "Statistics has CompletedJobs" ($stats.ContainsKey("CompletedJobs"))
            Test-Assert "Statistics has FailedJobs" ($stats.ContainsKey("FailedJobs"))
        } catch {
            Test-Assert "Migration statistics" $false $_.Exception.Message
        }
        
    } catch {
        Write-Host "Unit test suite failed with error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-IntegrationTests {
    Write-TestHeader "Integration Tests - End-to-End Scenarios"
    
    try {
        # Integration Test 1: Complete Azure to Azure migration workflow
        Write-Host "`n--- Azure to Azure Migration Workflow ---" -ForegroundColor Cyan
        
        try {
            $vmMigration = New-VirtualMachineMigration -CompanyName "IntegrationTest"
            
            # Add source and target environments
            $sourceEnv = New-VMEnvironment -Name "SourceAzure" -Type "Azure" -SubscriptionId "source-sub" -ResourceGroupName "source-rg" -Location "East US"
            $targetEnv = New-VMEnvironment -Name "TargetAzure" -Type "Azure" -SubscriptionId "target-sub" -ResourceGroupName "target-rg" -Location "West US 2"
            
            $vmMigration.AddEnvironment($sourceEnv)
            $vmMigration.AddEnvironment($targetEnv)
            
            Test-Assert "Both environments added" ($vmMigration.Environments.Count -eq 2)
            
            # Create migration configuration
            $migrationConfig = @{
                VMName = "IntegrationTestVM"
                MigrationType = [VMMigrationType]::AzureToAzure
                Source = @{
                    Environment = "SourceAzure"
                    ResourceGroupName = "source-rg"
                    VNetName = "source-vnet"
                }
                Target = @{
                    Environment = "TargetAzure"
                    ResourceGroupName = "target-rg"
                    VNetName = "target-vnet"
                    Location = "West US 2"
                }
            }
            
            # Validate configuration
            $isValid = $vmMigration.ValidateMigrationConfig($migrationConfig)
            Test-Assert "Migration configuration is valid" $isValid
            
            # Start migration (simulation)
            $job = $vmMigration.StartVMMigration($migrationConfig)
            Test-Assert "Migration job started successfully" ($job -ne $null)
            Test-Assert "Job has correct VM name" ($job.VMName -eq "IntegrationTestVM")
            Test-Assert "Job added to active jobs" ($vmMigration.ActiveJobs.ContainsKey($job.JobId))
            
            # Test job retrieval
            $retrievedJob = $vmMigration.GetMigrationJob($job.JobId)
            Test-Assert "Job can be retrieved by ID" ($retrievedJob -ne $null)
            Test-Assert "Retrieved job matches original" ($retrievedJob.JobId -eq $job.JobId)
            
            # Test progress update
            $vmMigration.UpdateJobProgress($job.JobId, 50.0, @{ DataTransferredBytes = 1073741824 })
            $updatedJob = $vmMigration.GetMigrationJob($job.JobId)
            Test-Assert "Job progress updated" ($updatedJob.ProgressPercentage -eq 50.0)
            Test-Assert "Data transfer metrics updated" ($updatedJob.DataTransferredBytes -eq 1073741824)
            
        } catch {
            Test-Assert "Azure to Azure integration workflow" $false $_.Exception.Message
        }
        
        # Integration Test 2: Multi-environment bulk migration
        Write-Host "`n--- Multi-Environment Bulk Migration ---" -ForegroundColor Cyan
        
        try {
            $vmMigration = New-VirtualMachineMigration -CompanyName "BulkMigrationTest"
            
            # Add multiple source environments
            $vmwareEnv = New-VMEnvironment -Name "VMwareSource" -Type "VMware" -ConnectionConfig @{ vCenterServer = "vcenter.test.local" }
            $hypervEnv = New-VMEnvironment -Name "HyperVSource" -Type "HyperV" -ConnectionConfig @{ ComputerName = "hyperv.test.local" }
            $azureTarget = New-VMEnvironment -Name "AzureTarget" -Type "Azure" -SubscriptionId "target-sub" -ResourceGroupName "migration-rg" -Location "Central US"
            
            $vmMigration.AddEnvironment($vmwareEnv)
            $vmMigration.AddEnvironment($hypervEnv)
            $vmMigration.AddEnvironment($azureTarget)
            
            Test-Assert "Multiple environments added" ($vmMigration.Environments.Count -eq 3)
            
            # Create bulk migration configurations
            $bulkConfigs = @(
                @{
                    VMName = "VMwareVM01"
                    MigrationType = [VMMigrationType]::VMwareToAzure
                    Source = @{ Environment = "VMwareSource"; ServerName = "VMwareVM01" }
                    Target = @{ Environment = "AzureTarget"; ResourceGroupName = "migration-rg" }
                },
                @{
                    VMName = "HyperVVM01"
                    MigrationType = [VMMigrationType]::HyperVToAzure
                    Source = @{ Environment = "HyperVSource"; ServerName = "HyperVVM01" }
                    Target = @{ Environment = "AzureTarget"; ResourceGroupName = "migration-rg" }
                }
            )
            
            # Validate all configurations
            $allValid = $true
            foreach ($config in $bulkConfigs) {
                if (!$vmMigration.ValidateMigrationConfig($config)) {
                    $allValid = $false
                    break
                }
            }
            Test-Assert "All bulk migration configurations valid" $allValid
            
            # Start bulk migration using the function
            $bulkResults = Start-VMBulkMigration -VMManager $vmMigration -MigrationConfigs $bulkConfigs -MaxConcurrent 2 -ValidateOnly
            Test-Assert "Bulk migration validation completed" ($bulkResults.Count -eq $bulkConfigs.Count)
            
        } catch {
            Test-Assert "Multi-environment bulk migration" $false $_.Exception.Message
        }
        
        # Integration Test 3: Migration monitoring and statistics
        Write-Host "`n--- Migration Monitoring and Statistics ---" -ForegroundColor Cyan
        
        try {
            $vmMigration = New-VirtualMachineMigration -CompanyName "MonitoringTest"
            
            # Create multiple test jobs
            $job1 = [VMReplicationJob]::new("MonitorVM01", [VMMigrationType]::AzureToAzure)
            $job1.Status = [VMMigrationStatus]::Completed
            $job1.ProgressPercentage = 100.0
            
            $job2 = [VMReplicationJob]::new("MonitorVM02", [VMMigrationType]::VMwareToAzure)
            $job2.Status = [VMMigrationStatus]::Replicating
            $job2.ProgressPercentage = 75.0
            
            $job3 = [VMReplicationJob]::new("MonitorVM03", [VMMigrationType]::HyperVToAzure)
            $job3.Status = [VMMigrationStatus]::Failed
            $job3.ProgressPercentage = 25.0
            $job3.Errors += "Test error message"
            
            $vmMigration.ActiveJobs[$job1.JobId] = $job1
            $vmMigration.ActiveJobs[$job2.JobId] = $job2
            $vmMigration.ActiveJobs[$job3.JobId] = $job3
            
            # Test statistics calculation
            $stats = $vmMigration.GetMigrationStatistics()
            Test-Assert "Statistics calculated correctly" ($stats.TotalJobs -eq 3)
            Test-Assert "Completed jobs counted" ($stats.CompletedJobs -eq 1)
            Test-Assert "Failed jobs counted" ($stats.FailedJobs -eq 1)
            Test-Assert "Active jobs counted" ($stats.ActiveJobs -eq 1)
            
            # Test average progress calculation
            $expectedAverage = (100.0 + 75.0 + 25.0) / 3
            Test-Assert "Average progress calculated correctly" ([math]::Abs($stats.AverageProgressPercentage - $expectedAverage) -lt 0.1)
            
            # Test all jobs retrieval
            $allJobs = $vmMigration.GetAllMigrationJobs()
            Test-Assert "All jobs retrieved" ($allJobs.Count -eq 3)
            
        } catch {
            Test-Assert "Migration monitoring and statistics" $false $_.Exception.Message
        }
        
        # Integration Test 4: Report generation
        Write-Host "`n--- Report Generation ---" -ForegroundColor Cyan
        
        try {
            $vmMigration = New-VirtualMachineMigration -CompanyName "ReportingTest"
            
            # Add some test data
            $job = [VMReplicationJob]::new("ReportVM01", [VMMigrationType]::AzureToAzure)
            $job.Status = [VMMigrationStatus]::Completed
            $vmMigration.ActiveJobs[$job.JobId] = $job
            
            $env = New-VMEnvironment -Name "ReportEnv" -Type "Azure"
            $env.IsConnected = $true
            $env.HealthStatus = "Connected"
            $vmMigration.AddEnvironment($env)
            
            # Generate report
            $report = $vmMigration.GenerateReport()
            Test-Assert "Report generated successfully" ($report -ne $null)
            Test-Assert "Report has company name" ($report.CompanyName -eq "ReportingTest")
            Test-Assert "Report has generated date" ($report.GeneratedDate -ne $null)
            Test-Assert "Report has summary section" ($report.Summary -ne $null)
            Test-Assert "Report has environments section" ($report.Environments.Count -eq 1)
            Test-Assert "Report has jobs section" ($report.Jobs.Count -eq 1)
            Test-Assert "Report has recommendations" ($report.Recommendations.Count -gt 0)
            
        } catch {
            Test-Assert "Report generation" $false $_.Exception.Message
        }
        
    } catch {
        Write-Host "Integration test suite failed with error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-PerformanceTests {
    Write-TestHeader "Performance Tests - Scalability and Resource Usage"
    
    try {
        # Performance Test 1: Large number of migration jobs
        Write-Host "`n--- Large Scale Migration Job Management ---" -ForegroundColor Cyan
        
        try {
            $vmMigration = New-VirtualMachineMigration -CompanyName "PerformanceTest"
            
            $startTime = Get-Date
            
            # Create 100 test migration jobs
            for ($i = 1; $i -le 100; $i++) {
                $job = [VMReplicationJob]::new("PerfTestVM$i", [VMMigrationType]::AzureToAzure)
                $job.Status = [VMMigrationStatus]::Replicating
                $job.ProgressPercentage = Get-Random -Minimum 1 -Maximum 100
                $vmMigration.ActiveJobs[$job.JobId] = $job
            }
            
            $jobCreationTime = (Get-Date) - $startTime
            Test-Assert "100 jobs created in reasonable time" ($jobCreationTime.TotalSeconds -lt 5)
            
            # Test statistics calculation performance
            $startTime = Get-Date
            $stats = $vmMigration.GetMigrationStatistics()
            $statsTime = (Get-Date) - $startTime
            
            Test-Assert "Statistics calculated quickly for 100 jobs" ($statsTime.TotalSeconds -lt 1)
            Test-Assert "Statistics are accurate" ($stats.TotalJobs -eq 100)
            
            # Test job retrieval performance
            $startTime = Get-Date
            $allJobs = $vmMigration.GetAllMigrationJobs()
            $retrievalTime = (Get-Date) - $startTime
            
            Test-Assert "Job retrieval is fast" ($retrievalTime.TotalSeconds -lt 1)
            Test-Assert "All jobs retrieved correctly" ($allJobs.Count -eq 100)
            
        } catch {
            Test-Assert "Large scale job management performance" $false $_.Exception.Message
        }
        
        # Performance Test 2: Memory usage validation
        Write-Host "`n--- Memory Usage Validation ---" -ForegroundColor Cyan
        
        try {
            $initialMemory = [System.GC]::GetTotalMemory($false)
            
            $vmMigration = New-VirtualMachineMigration -CompanyName "MemoryTest"
            
            # Create multiple environments and jobs
            for ($i = 1; $i -le 10; $i++) {
                $env = New-VMEnvironment -Name "Env$i" -Type "Azure" -SubscriptionId "test-sub-$i"
                $vmMigration.AddEnvironment($env)
                
                for ($j = 1; $j -le 10; $j++) {
                    $job = [VMReplicationJob]::new("VM$i-$j", [VMMigrationType]::AzureToAzure)
                    $vmMigration.ActiveJobs[$job.JobId] = $job
                }
            }
            
            [System.GC]::Collect()
            [System.GC]::WaitForPendingFinalizers()
            [System.GC]::Collect()
            
            $finalMemory = [System.GC]::GetTotalMemory($false)
            $memoryUsed = ($finalMemory - $initialMemory) / 1MB
            
            Test-Assert "Memory usage is reasonable" ($memoryUsed -lt 50)  # Less than 50 MB
            Test-Assert "Objects created successfully" ($vmMigration.Environments.Count -eq 10)
            Test-Assert "Jobs created successfully" ($vmMigration.ActiveJobs.Count -eq 100)
            
            if ($Verbose) {
                Write-Host "    Memory used: $([math]::Round($memoryUsed, 2)) MB" -ForegroundColor Gray
            }
            
        } catch {
            Test-Assert "Memory usage validation" $false $_.Exception.Message
        }
        
        # Performance Test 3: Configuration validation performance
        Write-Host "`n--- Configuration Validation Performance ---" -ForegroundColor Cyan
        
        try {
            $vmMigration = New-VirtualMachineMigration -CompanyName "ValidationPerfTest"
            
            # Create 50 different migration configurations
            $configs = @()
            for ($i = 1; $i -le 50; $i++) {
                $configs += @{
                    VMName = "ValidationVM$i"
                    MigrationType = [VMMigrationType]::AzureToAzure
                    Source = @{
                        ResourceGroupName = "source-rg-$i"
                        VNetName = "source-vnet-$i"
                    }
                    Target = @{
                        ResourceGroupName = "target-rg-$i"
                        VNetName = "target-vnet-$i"
                        Location = "West US 2"
                    }
                }
            }
            
            # Time validation of all configurations
            $startTime = Get-Date
            $validCount = 0
            foreach ($config in $configs) {
                if ($vmMigration.ValidateMigrationConfig($config)) {
                    $validCount++
                }
            }
            $validationTime = (Get-Date) - $startTime
            
            Test-Assert "All configurations validated quickly" ($validationTime.TotalSeconds -lt 2)
            Test-Assert "All configurations are valid" ($validCount -eq 50)
            
            if ($Verbose) {
                Write-Host "    Validation time: $([math]::Round($validationTime.TotalMilliseconds, 2)) ms" -ForegroundColor Gray
                Write-Host "    Average per config: $([math]::Round($validationTime.TotalMilliseconds / 50, 2)) ms" -ForegroundColor Gray
            }
            
        } catch {
            Test-Assert "Configuration validation performance" $false $_.Exception.Message
        }
        
    } catch {
        Write-Host "Performance test suite failed with error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Test-ErrorHandling {
    Write-TestHeader "Error Handling Tests"
    
    try {
        # Error Test 1: Invalid parameters
        Write-Host "`n--- Invalid Parameter Handling ---" -ForegroundColor Cyan
        
        try {
            # Test invalid company name
            try {
                $vmMigration = New-VirtualMachineMigration -CompanyName ""
                Test-Assert "Empty company name handled" $false "Should have failed with empty company name"
            } catch {
                Test-Assert "Empty company name rejected" $true
            }
            
            # Test invalid environment type
            try {
                $invalidEnv = New-VMEnvironment -Name "Invalid" -Type "InvalidType"
                Test-Assert "Invalid environment type handled" $false "Should have failed with invalid type"
            } catch {
                Test-Assert "Invalid environment type rejected" $true
            }
            
        } catch {
            Test-Assert "Invalid parameter handling" $false $_.Exception.Message
        }
        
        # Error Test 2: Missing configuration properties
        Write-Host "`n--- Missing Configuration Handling ---" -ForegroundColor Cyan
        
        try {
            $vmMigration = New-VirtualMachineMigration -CompanyName "ErrorTest"
            
            # Test configuration with missing VMName
            $missingVMNameConfig = @{
                MigrationType = [VMMigrationType]::AzureToAzure
                Source = @{ ResourceGroupName = "source" }
                Target = @{ ResourceGroupName = "target" }
            }
            
            $isValid = $vmMigration.ValidateMigrationConfig($missingVMNameConfig)
            Test-Assert "Missing VM name detected" (!$isValid)
            
            # Test configuration with missing migration type
            $missingTypeConfig = @{
                VMName = "TestVM"
                Source = @{ ResourceGroupName = "source" }
                Target = @{ ResourceGroupName = "target" }
            }
            
            $isValid = $vmMigration.ValidateMigrationConfig($missingTypeConfig)
            Test-Assert "Missing migration type detected" (!$isValid)
            
        } catch {
            Test-Assert "Missing configuration handling" $false $_.Exception.Message
        }
        
        # Error Test 3: Non-existent job operations
        Write-Host "`n--- Non-existent Job Operations ---" -ForegroundColor Cyan
        
        try {
            $vmMigration = New-VirtualMachineMigration -CompanyName "JobErrorTest"
            
            # Test operations on non-existent job
            $fakeJobId = [System.Guid]::NewGuid().ToString()
            
            $result = $vmMigration.GetMigrationJob($fakeJobId)
            Test-Assert "Non-existent job returns null" ($result -eq $null)
            
            $pauseResult = $vmMigration.PauseMigration($fakeJobId)
            Test-Assert "Pause non-existent job returns false" (!$pauseResult)
            
            $resumeResult = $vmMigration.ResumeMigration($fakeJobId)
            Test-Assert "Resume non-existent job returns false" (!$resumeResult)
            
            $cancelResult = $vmMigration.CancelMigration($fakeJobId)
            Test-Assert "Cancel non-existent job returns false" (!$cancelResult)
            
        } catch {
            Test-Assert "Non-existent job operations" $false $_.Exception.Message
        }
        
    } catch {
        Write-Host "Error handling test suite failed with error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Show-TestSummary {
    Write-TestHeader "Test Summary Report"
    
    $total = $script:TestResults.Passed + $script:TestResults.Failed + $script:TestResults.Skipped
    $passRate = if ($total -gt 0) { [math]::Round(($script:TestResults.Passed / $total) * 100, 1) } else { 0 }
    
    Write-Host "Total Tests: $total" -ForegroundColor White
    Write-Host "Passed: $($script:TestResults.Passed)" -ForegroundColor Green
    Write-Host "Failed: $($script:TestResults.Failed)" -ForegroundColor Red
    Write-Host "Skipped: $($script:TestResults.Skipped)" -ForegroundColor Yellow
    Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })
    
    if ($script:TestResults.Failed -gt 0) {
        Write-Host "`nFailed Tests:" -ForegroundColor Red
        $failedTests = $script:TestResults.Details | Where-Object { $_.Result -eq "FAIL" }
        foreach ($test in $failedTests) {
            Write-Host "  - $($test.Name): $($test.Message)" -ForegroundColor Red
        }
    }
    
    if ($script:TestResults.Skipped -gt 0) {
        Write-Host "`nSkipped Tests:" -ForegroundColor Yellow
        $skippedTests = $script:TestResults.Details | Where-Object { $_.Result -eq "SKIP" }
        foreach ($test in $skippedTests) {
            Write-Host "  - $($test.Name): $($test.Message)" -ForegroundColor Yellow
        }
    }
    
    # Export test results
    $reportPath = "C:\EnterpriseDiscovery\TestResults"
    if (!(Test-Path $reportPath)) {
        New-Item -ItemType Directory -Path $reportPath -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $resultFile = Join-Path $reportPath "VMMigrationTestResults_$timestamp.json"
    
    $fullReport = @{
        TestRun = @{
            Timestamp = Get-Date
            TestType = $TestType
            Environment = @{
                PowerShellVersion = $PSVersionTable.PSVersion.ToString()
                OS = [System.Environment]::OSVersion.ToString()
                MachineName = $env:COMPUTERNAME
            }
        }
        Summary = @{
            Total = $total
            Passed = $script:TestResults.Passed
            Failed = $script:TestResults.Failed
            Skipped = $script:TestResults.Skipped
            PassRate = $passRate
        }
        Details = $script:TestResults.Details
    }
    
    $fullReport | ConvertTo-Json -Depth 10 | Set-Content -Path $resultFile -Encoding UTF8
    Write-Host "`nTest results exported to: $resultFile" -ForegroundColor Cyan
    
    return $passRate -ge 90
}

# Main execution
try {
    Write-Host "VirtualMachineMigration Module Test Suite" -ForegroundColor Cyan
    Write-Host "Test Type: $TestType" -ForegroundColor White
    Write-Host "Verbose: $Verbose" -ForegroundColor White
    Write-Host "Start Time: $(Get-Date)" -ForegroundColor White
    
    switch ($TestType) {
        "Unit" { 
            Test-UnitTests
            Test-ErrorHandling
        }
        "Integration" { 
            Test-IntegrationTests 
        }
        "Performance" { 
            Test-PerformanceTests 
        }
        "All" { 
            Test-UnitTests
            Test-IntegrationTests
            Test-PerformanceTests
            Test-ErrorHandling
        }
    }
    
    $success = Show-TestSummary
    
    if ($success) {
        Write-Host "`n✅ All tests passed! VM Migration module is ready for production use." -ForegroundColor Green
    } else {
        Write-Host "`n❌ Some tests failed. Please review and fix issues before production use." -ForegroundColor Red
    }
    
    exit $(if ($success) { 0 } else { 1 })
    
} catch {
    Write-Error "Test execution failed: $($_.Exception.Message)"
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}