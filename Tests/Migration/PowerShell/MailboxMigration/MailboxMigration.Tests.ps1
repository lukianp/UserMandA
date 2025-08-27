# Pester tests for MailboxMigration.psm1
BeforeAll {
    # Import the module under test
    $ModulePath = Join-Path $PSScriptRoot "..\..\..\..\Modules\Migration\MailboxMigration.psm1"
    Import-Module $ModulePath -Force

    # Mock credentials for testing
    $TestCredential = New-Object System.Management.Automation.PSCredential("testuser", (ConvertTo-SecureString "testpassword" -AsPlainText -Force))
    
    # Test data
    $TestLogDir = Join-Path $TestDrive "TestLogs"
    $TestUsers = @(
        @{ 
            UserPrincipalName = "user1@source.com"
            DisplayName = "Test User 1"
            PrimarySmtpAddress = "user1@source.com"
            Alias = "user1"
        },
        @{ 
            UserPrincipalName = "user2@source.com"
            DisplayName = "Test User 2"
            PrimarySmtpAddress = "user2@source.com"
            Alias = "user2"
        }
    )
}

Describe "MailboxMigration Class" {
    Context "Constructor and Initialization" {
        It "Should create instance with valid migration type" {
            $migration = [MailboxMigration]::new("CloudToCloud")
            
            $migration | Should -Not -BeNullOrEmpty
            $migration.MigrationType | Should -Be "CloudToCloud"
            $migration.MigrationConfig | Should -Not -BeNullOrEmpty
            $migration.MigrationBatches | Should -Not -BeNullOrEmpty
            $migration.MigrationStatus | Should -Not -BeNullOrEmpty
        }

        It "Should initialize with default configuration" {
            $migration = [MailboxMigration]::new("OnPremToCloud")
            
            $migration.MigrationConfig.BatchSize | Should -Be 20
            $migration.MigrationConfig.UseCutoverMigration | Should -Be $false
            $migration.MigrationConfig.UseHybridMigration | Should -Be $true
            $migration.MigrationConfig.PreserveEmailAddresses | Should -Be $true
            $migration.MigrationConfig.MaxConcurrentMigrations | Should -Be 5
        }

        It "Should create log file path with timestamp" {
            $migration = [MailboxMigration]::new("CloudToOnPrem")
            
            $migration.LogPath | Should -Match "MailboxMigration_\d{8}_\d{6}\.log"
        }

        It "Should initialize empty collections" {
            $migration = [MailboxMigration]::new("OnPremToOnPrem")
            
            $migration.MigrationBatches.Count | Should -Be 0
            $migration.MigrationStatus.Count | Should -Be 0
        }
    }

    Context "Environment Configuration" {
        BeforeEach {
            $migration = [MailboxMigration]::new("CloudToCloud")
        }

        It "Should set source environment correctly" {
            $migration.SetSourceEnvironment("https://outlook.office365.com/powershell-liveid/", $TestCredential, "tenant1-id")
            
            $migration.SourceExchangeUri | Should -Be "https://outlook.office365.com/powershell-liveid/"
            $migration.SourceCredential | Should -Be $TestCredential
            $migration.SourceTenantId | Should -Be "tenant1-id"
        }

        It "Should set target environment correctly" {
            $migration.SetTargetEnvironment("https://outlook.office365.com/powershell-liveid/", $TestCredential, "tenant2-id")
            
            $migration.TargetExchangeUri | Should -Be "https://outlook.office365.com/powershell-liveid/"
            $migration.TargetCredential | Should -Be $TestCredential
            $migration.TargetTenantId | Should -Be "tenant2-id"
        }

        It "Should handle null tenant ID" {
            $migration.SetSourceEnvironment("https://exchange.contoso.com/powershell/", $TestCredential)
            
            $migration.SourceExchangeUri | Should -Be "https://exchange.contoso.com/powershell/"
            $migration.SourceTenantId | Should -BeNullOrEmpty
        }
    }

    Context "Logging Functionality" {
        BeforeEach {
            $migration = [MailboxMigration]::new("CloudToCloud")
            # Override log path to test directory
            $migration.LogPath = Join-Path $TestDrive "test_migration.log"
        }

        It "Should create log directory if it doesn't exist" {
            $testLogPath = Join-Path $TestDrive "NewLogDir\test.log"
            $migration.LogPath = $testLogPath
            
            # Force log initialization
            $migration.InitializeLogging()
            
            Split-Path $testLogPath -Parent | Should -Exist
        }

        It "Should write log entries with correct format" {
            $migration.WriteLog("Test message", "INFO")
            
            $logContent = Get-Content $migration.LogPath
            $logContent | Should -Match "\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] \[INFO\] Test message"
        }

        It "Should handle different log levels" {
            $migration.WriteLog("Error message", "ERROR")
            $migration.WriteLog("Warning message", "WARNING")
            $migration.WriteLog("Success message", "SUCCESS")
            $migration.WriteLog("Info message", "INFO")
            
            $logContent = Get-Content $migration.LogPath
            $logContent | Should -Contain "*ERROR* Error message"
            $logContent | Should -Contain "*WARNING* Warning message"
            $logContent | Should -Contain "*SUCCESS* Success message"
            $logContent | Should -Contain "*INFO* Info message"
        }
    }

    Context "Migration Configuration" {
        BeforeEach {
            $migration = [MailboxMigration]::new("CloudToCloud")
        }

        It "Should allow updating batch size" {
            $migration.MigrationConfig.BatchSize = 50
            
            $migration.MigrationConfig.BatchSize | Should -Be 50
        }

        It "Should allow updating concurrent migrations limit" {
            $migration.MigrationConfig.MaxConcurrentMigrations = 10
            
            $migration.MigrationConfig.MaxConcurrentMigrations | Should -Be 10
        }

        It "Should allow updating item limits" {
            $migration.MigrationConfig.LargeItemLimit = 200
            $migration.MigrationConfig.BadItemLimit = 100
            
            $migration.MigrationConfig.LargeItemLimit | Should -Be 200
            $migration.MigrationConfig.BadItemLimit | Should -Be 100
        }

        It "Should support notification email configuration" {
            $migration.MigrationConfig.NotificationEmails = @("admin@company.com", "it@company.com")
            
            $migration.MigrationConfig.NotificationEmails.Count | Should -Be 2
            $migration.MigrationConfig.NotificationEmails | Should -Contain "admin@company.com"
        }
    }
}

Describe "MailboxMigration Functions" {
    Context "New-MailboxMigrationBatch" {
        BeforeEach {
            $migration = [MailboxMigration]::new("CloudToCloud")
        }

        It "Should create migration batch with valid parameters" {
            # Mock the function if it exists in the module
            Mock Get-Mailbox { return $TestUsers } -ModuleName MailboxMigration
            
            $batch = $migration | New-MailboxMigrationBatch -BatchName "Batch1" -UserList $TestUsers
            
            $batch | Should -Not -BeNullOrEmpty
            $batch.Name | Should -Be "Batch1"
            $batch.UserCount | Should -Be 2
        }

        It "Should validate user list is not empty" {
            { $migration | New-MailboxMigrationBatch -BatchName "EmptyBatch" -UserList @() } |
                Should -Throw "*User list cannot be empty*"
        }

        It "Should validate batch name is provided" {
            { $migration | New-MailboxMigrationBatch -BatchName "" -UserList $TestUsers } |
                Should -Throw "*Batch name cannot be empty*"
        }
    }

    Context "Start-MailboxMigrationBatch" {
        BeforeEach {
            $migration = [MailboxMigration]::new("CloudToCloud")
            Mock Get-MigrationBatch { return @{ Status = "Created"; Identity = "TestBatch" } } -ModuleName MailboxMigration
            Mock Start-MigrationBatch { return @{ Status = "InProgress" } } -ModuleName MailboxMigration
        }

        It "Should start migration batch successfully" {
            $result = $migration | Start-MailboxMigrationBatch -BatchName "TestBatch"
            
            $result | Should -Not -BeNullOrEmpty
            $result.Status | Should -Be "InProgress"
            
            Assert-MockCalled Start-MigrationBatch -ModuleName MailboxMigration -Times 1
        }

        It "Should handle batch not found error" {
            Mock Get-MigrationBatch { throw "Batch not found" } -ModuleName MailboxMigration
            
            { $migration | Start-MailboxMigrationBatch -BatchName "NonExistentBatch" } |
                Should -Throw "*Batch not found*"
        }
    }

    Context "Get-MailboxMigrationStatus" {
        BeforeEach {
            $migration = [MailboxMigration]::new("CloudToCloud")
            Mock Get-MigrationBatch { 
                return @(
                    @{ Identity = "Batch1"; Status = "InProgress"; TotalCount = 10; CompletedCount = 5 },
                    @{ Identity = "Batch2"; Status = "Completed"; TotalCount = 15; CompletedCount = 15 }
                )
            } -ModuleName MailboxMigration
        }

        It "Should return status for all batches" {
            $status = $migration | Get-MailboxMigrationStatus
            
            $status | Should -Not -BeNullOrEmpty
            $status.Count | Should -Be 2
            $status[0].Identity | Should -Be "Batch1"
            $status[1].Status | Should -Be "Completed"
        }

        It "Should calculate completion percentage" {
            $status = $migration | Get-MailboxMigrationStatus
            
            $batch1 = $status | Where-Object { $_.Identity -eq "Batch1" }
            $batch1.CompletionPercentage | Should -Be 50
        }
    }

    Context "Stop-MailboxMigrationBatch" {
        BeforeEach {
            $migration = [MailboxMigration]::new("CloudToCloud")
            Mock Get-MigrationBatch { return @{ Status = "InProgress"; Identity = "TestBatch" } } -ModuleName MailboxMigration
            Mock Stop-MigrationBatch { return @{ Status = "Stopped" } } -ModuleName MailboxMigration
        }

        It "Should stop migration batch successfully" {
            $result = $migration | Stop-MailboxMigrationBatch -BatchName "TestBatch"
            
            $result.Status | Should -Be "Stopped"
            Assert-MockCalled Stop-MigrationBatch -ModuleName MailboxMigration -Times 1
        }

        It "Should handle already stopped batch" {
            Mock Get-MigrationBatch { return @{ Status = "Stopped"; Identity = "TestBatch" } } -ModuleName MailboxMigration
            
            $result = $migration | Stop-MailboxMigrationBatch -BatchName "TestBatch"
            
            $result.Status | Should -Be "Stopped"
            Assert-MockCalled Stop-MigrationBatch -ModuleName MailboxMigration -Times 0
        }
    }

    Context "Test-MailboxMigrationConnectivity" {
        BeforeEach {
            $migration = [MailboxMigration]::new("CloudToCloud")
            $migration.SetSourceEnvironment("https://outlook.office365.com/powershell-liveid/", $TestCredential, "source-tenant")
            $migration.SetTargetEnvironment("https://outlook.office365.com/powershell-liveid/", $TestCredential, "target-tenant")
        }

        It "Should test source connectivity" {
            Mock New-PSSession { return @{ State = "Opened" } } -ModuleName MailboxMigration
            Mock Test-Connection { return $true } -ModuleName MailboxMigration
            
            $result = $migration | Test-MailboxMigrationConnectivity -TestSource
            
            $result.SourceConnectivity | Should -Be $true
        }

        It "Should test target connectivity" {
            Mock New-PSSession { return @{ State = "Opened" } } -ModuleName MailboxMigration
            Mock Test-Connection { return $true } -ModuleName MailboxMigration
            
            $result = $migration | Test-MailboxMigrationConnectivity -TestTarget
            
            $result.TargetConnectivity | Should -Be $true
        }

        It "Should handle connection failures" {
            Mock New-PSSession { throw "Connection failed" } -ModuleName MailboxMigration
            
            $result = $migration | Test-MailboxMigrationConnectivity -TestSource
            
            $result.SourceConnectivity | Should -Be $false
            $result.SourceError | Should -Match "*Connection failed*"
        }
    }

    Context "Export-MailboxMigrationReport" {
        BeforeEach {
            $migration = [MailboxMigration]::new("CloudToCloud")
            Mock Get-MigrationBatch { 
                return @(
                    @{ 
                        Identity = "Batch1"
                        Status = "Completed"
                        TotalCount = 10
                        CompletedCount = 10
                        FailedCount = 0
                        StartTime = (Get-Date).AddHours(-2)
                        EndTime = Get-Date
                    }
                )
            } -ModuleName MailboxMigration
        }

        It "Should export report to CSV" {
            $reportPath = Join-Path $TestDrive "migration_report.csv"
            
            $migration | Export-MailboxMigrationReport -OutputPath $reportPath -Format CSV
            
            $reportPath | Should -Exist
            $csvContent = Import-Csv $reportPath
            $csvContent[0].Identity | Should -Be "Batch1"
        }

        It "Should export report to JSON" {
            $reportPath = Join-Path $TestDrive "migration_report.json"
            
            $migration | Export-MailboxMigrationReport -OutputPath $reportPath -Format JSON
            
            $reportPath | Should -Exist
            $jsonContent = Get-Content $reportPath | ConvertFrom-Json
            $jsonContent[0].Identity | Should -Be "Batch1"
        }

        It "Should include summary statistics" {
            $reportPath = Join-Path $TestDrive "migration_report.csv"
            
            $result = $migration | Export-MailboxMigrationReport -OutputPath $reportPath -Format CSV -IncludeSummary
            
            $result.Summary | Should -Not -BeNullOrEmpty
            $result.Summary.TotalBatches | Should -Be 1
            $result.Summary.TotalMailboxes | Should -Be 10
            $result.Summary.SuccessfulMigrations | Should -Be 10
        }
    }
}

Describe "MailboxMigration Integration Tests" {
    Context "End-to-End Migration Workflow" {
        BeforeEach {
            $migration = [MailboxMigration]::new("CloudToCloud")
            $migration.SetSourceEnvironment("https://outlook.office365.com/powershell-liveid/", $TestCredential, "source-tenant")
            $migration.SetTargetEnvironment("https://outlook.office365.com/powershell-liveid/", $TestCredential, "target-tenant")
            
            # Mock all Exchange cmdlets
            Mock New-PSSession { return @{ State = "Opened" } } -ModuleName MailboxMigration
            Mock Get-Mailbox { return $TestUsers } -ModuleName MailboxMigration
            Mock New-MigrationBatch { return @{ Identity = "TestBatch"; Status = "Created" } } -ModuleName MailboxMigration
            Mock Start-MigrationBatch { return @{ Status = "InProgress" } } -ModuleName MailboxMigration
            Mock Get-MigrationBatch { return @{ Status = "Completed"; CompletedCount = 2; TotalCount = 2 } } -ModuleName MailboxMigration
        }

        It "Should complete full migration workflow" {
            # Test connectivity
            $connectivityResult = $migration | Test-MailboxMigrationConnectivity -TestSource -TestTarget
            $connectivityResult.SourceConnectivity | Should -Be $true
            $connectivityResult.TargetConnectivity | Should -Be $true
            
            # Create batch
            $batch = $migration | New-MailboxMigrationBatch -BatchName "E2ETestBatch" -UserList $TestUsers
            $batch | Should -Not -BeNullOrEmpty
            
            # Start migration
            $startResult = $migration | Start-MailboxMigrationBatch -BatchName "E2ETestBatch"
            $startResult.Status | Should -Be "InProgress"
            
            # Check status
            $status = $migration | Get-MailboxMigrationStatus
            $status | Should -Not -BeNullOrEmpty
            
            # Export report
            $reportPath = Join-Path $TestDrive "e2e_report.csv"
            $reportResult = $migration | Export-MailboxMigrationReport -OutputPath $reportPath -Format CSV
            $reportPath | Should -Exist
        }
    }

    Context "Error Handling and Recovery" {
        BeforeEach {
            $migration = [MailboxMigration]::new("CloudToCloud")
        }

        It "Should handle invalid credentials gracefully" {
            $invalidCredential = New-Object System.Management.Automation.PSCredential("invalid", (ConvertTo-SecureString "invalid" -AsPlainText -Force))
            $migration.SetSourceEnvironment("https://outlook.office365.com/powershell-liveid/", $invalidCredential)
            
            Mock New-PSSession { throw "Access denied" } -ModuleName MailboxMigration
            
            $result = $migration | Test-MailboxMigrationConnectivity -TestSource
            
            $result.SourceConnectivity | Should -Be $false
            $result.SourceError | Should -Match "*Access denied*"
        }

        It "Should handle network connectivity issues" {
            Mock New-PSSession { throw "Network timeout" } -ModuleName MailboxMigration
            
            $result = $migration | Test-MailboxMigrationConnectivity -TestTarget
            
            $result.TargetConnectivity | Should -Be $false
            $result.TargetError | Should -Match "*Network timeout*"
        }

        It "Should validate required properties before migration" {
            # Empty source environment
            { $migration | New-MailboxMigrationBatch -BatchName "TestBatch" -UserList $TestUsers } |
                Should -Throw "*Source environment not configured*"
        }
    }
}

Describe "MailboxMigration Performance Tests" {
    Context "Batch Processing Performance" {
        BeforeEach {
            $migration = [MailboxMigration]::new("CloudToCloud")
            
            # Create large user list for performance testing
            $largeUserList = 1..100 | ForEach-Object {
                @{
                    UserPrincipalName = "user$_@source.com"
                    DisplayName = "Test User $_"
                    PrimarySmtpAddress = "user$_@source.com"
                    Alias = "user$_"
                }
            }
            
            Mock Get-Mailbox { return $largeUserList } -ModuleName MailboxMigration
        }

        It "Should handle large batch creation within reasonable time" {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            
            $batch = $migration | New-MailboxMigrationBatch -BatchName "LargeBatch" -UserList $largeUserList
            
            $stopwatch.Stop()
            $stopwatch.ElapsedMilliseconds | Should -BeLessThan 5000  # Should complete in under 5 seconds
            $batch.UserCount | Should -Be 100
        }

        It "Should respect batch size limits" {
            $migration.MigrationConfig.BatchSize = 25
            
            $batches = $migration | New-MailboxMigrationBatch -BatchName "SplitBatch" -UserList $largeUserList -SplitIntoBatches
            
            $batches.Count | Should -Be 4  # 100 users / 25 batch size = 4 batches
            $batches[0].UserCount | Should -BeLessOrEqual 25
        }
    }

    Context "Memory Usage Tests" {
        It "Should not leak memory during repeated operations" {
            $migration = [MailboxMigration]::new("CloudToCloud")
            
            $initialMemory = [System.GC]::GetTotalMemory($false)
            
            # Perform multiple operations
            1..10 | ForEach-Object {
                $migration | Get-MailboxMigrationStatus
                $migration.MigrationStatus.Clear()
            }
            
            [System.GC]::Collect()
            [System.GC]::WaitForPendingFinalizers()
            
            $finalMemory = [System.GC]::GetTotalMemory($false)
            $memoryIncrease = $finalMemory - $initialMemory
            
            # Memory increase should be minimal (less than 1MB)
            $memoryIncrease | Should -BeLessThan 1048576
        }
    }
}

AfterAll {
    # Clean up test files
    if (Test-Path $TestLogDir) {
        Remove-Item $TestLogDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Remove imported module
    Remove-Module MailboxMigration -Force -ErrorAction SilentlyContinue
}