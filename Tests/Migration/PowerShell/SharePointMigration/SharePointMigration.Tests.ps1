# Pester tests for SharePointMigration.psm1
BeforeAll {
    # Import the module under test
    $ModulePath = Join-Path $PSScriptRoot "..\..\..\..\Modules\Migration\SharePointMigration.psm1"
    Import-Module $ModulePath -Force

    # Mock credentials for testing
    $TestCredential = New-Object System.Management.Automation.PSCredential("testuser", (ConvertTo-SecureString "testpassword" -AsPlainText -Force))
    
    # Test data
    $TestLogDir = Join-Path $TestDrive "TestLogs"
    $TestSites = @(
        @{
            Url = "https://contoso.sharepoint.com/sites/site1"
            Title = "Test Site 1"
            Template = "STS#0"
            StorageUsed = 512  # MB
            Owner = "admin@contoso.com"
        },
        @{
            Url = "https://contoso.sharepoint.com/sites/site2"
            Title = "Test Site 2"
            Template = "BLOG#0"
            StorageUsed = 1024  # MB
            Owner = "user@contoso.com"
        }
    )
    
    $TestLists = @(
        @{
            Title = "Documents"
            BaseTemplate = 101
            ItemCount = 50
            Url = "Documents"
        },
        @{
            Title = "Custom List"
            BaseTemplate = 100
            ItemCount = 25
            Url = "Lists/CustomList"
        }
    )
}

Describe "SharePointMigration Class" {
    Context "Constructor and Initialization" {
        It "Should create instance with valid migration type" {
            $migration = [SharePointMigration]::new("OnPremToOnline")
            
            $migration | Should -Not -BeNullOrEmpty
            $migration.MigrationType | Should -Be "OnPremToOnline"
            $migration.MigrationConfig | Should -Not -BeNullOrEmpty
            $migration.MigrationBatches | Should -Not -BeNullOrEmpty
            $migration.MigrationStatus | Should -Not -BeNullOrEmpty
            $migration.SiteMap | Should -Not -BeNullOrEmpty
            $migration.ContentAnalysis | Should -Not -BeNullOrEmpty
        }

        It "Should initialize with comprehensive default configuration" {
            $migration = [SharePointMigration]::new("OnlineToOnline")
            
            $migration.MigrationConfig.BatchSize | Should -Be 10
            $migration.MigrationConfig.MaxSiteCollectionSize | Should -Be 100
            $migration.MigrationConfig.PreserveVersionHistory | Should -Be $true
            $migration.MigrationConfig.PreservePermissions | Should -Be $true
            $migration.MigrationConfig.MigrateDocumentLibraries | Should -Be $true
            $migration.MigrationConfig.MaxFileSize | Should -Be 15
            $migration.MigrationConfig.ConcurrentConnections | Should -Be 5
            $migration.MigrationConfig.WorkflowMigrationStrategy | Should -Be "PowerAutomate"
        }

        It "Should create log file path with timestamp" {
            $migration = [SharePointMigration]::new("HybridMigration")
            
            $migration.LogPath | Should -Match "SharePointMigration_\d{8}_\d{6}\.log"
        }

        It "Should initialize mapping collections" {
            $migration = [SharePointMigration]::new("OnPremToOnPrem")
            
            $migration.MigrationConfig.ContentTypeMapping | Should -Not -BeNullOrEmpty
            $migration.MigrationConfig.FieldMapping | Should -Not -BeNullOrEmpty
            $migration.MigrationConfig.PermissionMapping | Should -Not -BeNullOrEmpty
        }
    }

    Context "Environment Configuration" {
        BeforeEach {
            $migration = [SharePointMigration]::new("OnPremToOnline")
        }

        It "Should set source environment correctly" {
            $migration.SetSourceEnvironment("https://sharepoint.contoso.com", $TestCredential, "")
            
            $migration.SourceEnvironment | Should -Be "https://sharepoint.contoso.com"
            $migration.SourceCredential | Should -Be $TestCredential
            $migration.SourceTenantId | Should -Be ""
        }

        It "Should set target environment correctly" {
            $migration.SetTargetEnvironment("https://contoso.sharepoint.com", $TestCredential, "contoso-tenant-id")
            
            $migration.TargetEnvironment | Should -Be "https://contoso.sharepoint.com"
            $migration.TargetCredential | Should -Be $TestCredential
            $migration.TargetTenantId | Should -Be "contoso-tenant-id"
        }

        It "Should handle both on-premises and online environments" {
            $migration.SetSourceEnvironment("http://sharepoint2019.contoso.local", $TestCredential)
            $migration.SetTargetEnvironment("https://contoso.sharepoint.com", $TestCredential, "tenant-id")
            
            $migration.SourceEnvironment | Should -Match "sharepoint2019\.contoso\.local"
            $migration.TargetEnvironment | Should -Match "contoso\.sharepoint\.com"
        }
    }

    Context "Logging Functionality" {
        BeforeEach {
            $migration = [SharePointMigration]::new("OnPremToOnline")
            # Override log path to test directory
            $migration.LogPath = Join-Path $TestDrive "test_sp_migration.log"
        }

        It "Should create log directory if it doesn't exist" {
            $testLogPath = Join-Path $TestDrive "NewSPLogDir\test.log"
            $migration.LogPath = $testLogPath
            
            # Force log initialization
            $migration.InitializeLogging()
            
            Split-Path $testLogPath -Parent | Should -Exist
        }

        It "Should write detailed configuration to log" {
            $migration.InitializeLogging()
            
            $logContent = Get-Content $migration.LogPath -Raw
            $logContent | Should -Match "SharePointMigration module initialized"
            $logContent | Should -Match "Migration Type: OnPremToOnline"
            $logContent | Should -Match "Configuration:"
        }

        It "Should handle verbose logging level" {
            $migration.MigrationConfig.LogLevel = 'Verbose'
            $migration.WriteLog("Verbose test message", "VERBOSE")
            
            $logContent = Get-Content $migration.LogPath
            $logContent | Should -Contain "*VERBOSE* Verbose test message"
        }

        It "Should skip verbose messages when not in verbose mode" {
            $migration.MigrationConfig.LogLevel = 'Normal'
            $migration.WriteLog("Verbose test message", "VERBOSE")
            
            $logContent = Get-Content $migration.LogPath -ErrorAction SilentlyContinue
            if ($logContent) {
                $logContent | Should -Not -Contain "*VERBOSE* Verbose test message"
            }
        }
    }

    Context "Migration Configuration Management" {
        BeforeEach {
            $migration = [SharePointMigration]::new("OnPremToOnline")
        }

        It "Should allow updating content migration settings" {
            $migration.MigrationConfig.MigrateSubsites = $false
            $migration.MigrationConfig.MigrateWorkflows = $true
            $migration.MigrationConfig.PreserveWorkflows = $true
            
            $migration.MigrationConfig.MigrateSubsites | Should -Be $false
            $migration.MigrationConfig.MigrateWorkflows | Should -Be $true
            $migration.MigrationConfig.PreserveWorkflows | Should -Be $true
        }

        It "Should allow updating size and throttling limits" {
            $migration.MigrationConfig.MaxSiteCollectionSize = 200
            $migration.MigrationConfig.MaxFileSize = 25
            $migration.MigrationConfig.ThrottlingDelay = 2000
            $migration.MigrationConfig.ConcurrentConnections = 10
            
            $migration.MigrationConfig.MaxSiteCollectionSize | Should -Be 200
            $migration.MigrationConfig.MaxFileSize | Should -Be 25
            $migration.MigrationConfig.ThrottlingDelay | Should -Be 2000
            $migration.MigrationConfig.ConcurrentConnections | Should -Be 10
        }

        It "Should support content type and field mappings" {
            $migration.MigrationConfig.ContentTypeMapping["0x0101"] = "0x010100A14F30F026744B71A08077B9ACA0F020"
            $migration.MigrationConfig.FieldMapping["OldFieldName"] = "NewFieldName"
            
            $migration.MigrationConfig.ContentTypeMapping["0x0101"] | Should -Be "0x010100A14F30F026744B71A08077B9ACA0F020"
            $migration.MigrationConfig.FieldMapping["OldFieldName"] | Should -Be "NewFieldName"
        }

        It "Should support permission mapping configuration" {
            $migration.MigrationConfig.PermissionMapping["DOMAIN\OldGroup"] = "AzureAD\NewGroup"
            $migration.MigrationConfig.MapUserAccounts = $true
            
            $migration.MigrationConfig.PermissionMapping["DOMAIN\OldGroup"] | Should -Be "AzureAD\NewGroup"
            $migration.MigrationConfig.MapUserAccounts | Should -Be $true
        }
    }
}

Describe "SharePointMigration Functions" {
    Context "Start-SharePointSiteAnalysis" {
        BeforeEach {
            $migration = [SharePointMigration]::new("OnPremToOnline")
            Mock Get-SPSite { return $TestSites } -ModuleName SharePointMigration
            Mock Get-SPWeb { return @{ Title = "Test Web"; Url = "/"; Lists = $TestLists } } -ModuleName SharePointMigration
        }

        It "Should analyze site collection structure" {
            $analysis = $migration | Start-SharePointSiteAnalysis -SiteUrl $TestSites[0].Url
            
            $analysis | Should -Not -BeNullOrEmpty
            $analysis.SiteUrl | Should -Be $TestSites[0].Url
            $analysis.SiteCollectionSize | Should -BeGreaterThan 0
            $analysis.WebCount | Should -BeGreaterThan 0
        }

        It "Should identify content types and fields" {
            Mock Get-SPContentType { 
                return @(
                    @{ Id = "0x0101"; Name = "Document"; Group = "Document Content Types" },
                    @{ Id = "0x0120"; Name = "Folder"; Group = "Folder Content Types" }
                )
            } -ModuleName SharePointMigration
            
            $analysis = $migration | Start-SharePointSiteAnalysis -SiteUrl $TestSites[0].Url -AnalyzeContentTypes
            
            $analysis.ContentTypes | Should -Not -BeNullOrEmpty
            $analysis.ContentTypes.Count | Should -BeGreaterThan 0
        }

        It "Should analyze storage usage and item counts" {
            $analysis = $migration | Start-SharePointSiteAnalysis -SiteUrl $TestSites[0].Url -AnalyzeStorage
            
            $analysis.StorageUsage | Should -BeGreaterThan 0
            $analysis.TotalItems | Should -BeGreaterThan 0
            $analysis.LargeFiles | Should -Not -BeNullOrEmpty
        }

        It "Should identify migration complexity factors" {
            Mock Get-SPFeature { 
                return @(
                    @{ DisplayName = "Custom Feature 1"; Id = [Guid]::NewGuid() },
                    @{ DisplayName = "Workflow Feature"; Id = [Guid]::NewGuid() }
                )
            } -ModuleName SharePointMigration
            
            $analysis = $migration | Start-SharePointSiteAnalysis -SiteUrl $TestSites[0].Url -AnalyzeComplexity
            
            $analysis.ComplexityScore | Should -BeGreaterThan 0
            $analysis.MigrationIssues | Should -Not -BeNullOrEmpty
            $analysis.Recommendations | Should -Not -BeNullOrEmpty
        }
    }

    Context "New-SharePointMigrationBatch" {
        BeforeEach {
            $migration = [SharePointMigration]::new("OnPremToOnline")
            Mock Get-SPSite { return $TestSites } -ModuleName SharePointMigration
        }

        It "Should create migration batch with valid parameters" {
            $batch = $migration | New-SharePointMigrationBatch -BatchName "SPBatch1" -SiteCollections $TestSites
            
            $batch | Should -Not -BeNullOrEmpty
            $batch.Name | Should -Be "SPBatch1"
            $batch.SiteCount | Should -Be 2
            $batch.EstimatedSize | Should -BeGreaterThan 0
        }

        It "Should validate site collection size limits" {
            $largeSite = @{
                Url = "https://contoso.sharepoint.com/sites/large"
                StorageUsed = 150000  # 150 GB, exceeds default limit
            }
            
            { $migration | New-SharePointMigrationBatch -BatchName "LargeBatch" -SiteCollections @($largeSite) } |
                Should -Throw "*exceeds maximum size limit*"
        }

        It "Should respect batch size configuration" {
            $migration.MigrationConfig.BatchSize = 1
            
            $batches = $migration | New-SharePointMigrationBatch -BatchName "SmallBatch" -SiteCollections $TestSites -SplitIntoBatches
            
            $batches.Count | Should -Be 2
            $batches[0].SiteCount | Should -Be 1
        }

        It "Should calculate migration complexity" {
            Mock Start-SharePointSiteAnalysis { 
                return @{ ComplexityScore = 75; MigrationIssues = @("Custom workflows", "Third-party web parts") }
            } -ModuleName SharePointMigration
            
            $batch = $migration | New-SharePointMigrationBatch -BatchName "ComplexBatch" -SiteCollections $TestSites -AnalyzeComplexity
            
            $batch.ComplexityScore | Should -BeGreaterThan 0
            $batch.MigrationIssues | Should -Not -BeNullOrEmpty
        }
    }

    Context "Start-SharePointMigrationBatch" {
        BeforeEach {
            $migration = [SharePointMigration]::new("OnPremToOnline")
            Mock Start-SPMigrationJob { 
                return @{ 
                    JobId = [Guid]::NewGuid()
                    Status = "InProgress"
                    TargetUrl = "https://contoso.sharepoint.com/sites/migrated1"
                }
            } -ModuleName SharePointMigration
        }

        It "Should start migration batch successfully" {
            $result = $migration | Start-SharePointMigrationBatch -BatchName "TestBatch"
            
            $result | Should -Not -BeNullOrEmpty
            $result.Status | Should -Be "InProgress"
            $result.JobId | Should -Not -BeNullOrEmpty
            
            Assert-MockCalled Start-SPMigrationJob -ModuleName SharePointMigration -Times 1
        }

        It "Should handle pre-migration validation" {
            $migration.MigrationConfig.PreMigrationValidation = $true
            Mock Test-SharePointConnectivity { return @{ SourceConnected = $true; TargetConnected = $true } } -ModuleName SharePointMigration
            
            $result = $migration | Start-SharePointMigrationBatch -BatchName "ValidatedBatch"
            
            $result.ValidationPassed | Should -Be $true
            Assert-MockCalled Test-SharePointConnectivity -ModuleName SharePointMigration -Times 1
        }

        It "Should create target site structure when configured" {
            $migration.MigrationConfig.CreateTargetStructure = $true
            Mock New-SPSite { return @{ Url = "https://contoso.sharepoint.com/sites/new" } } -ModuleName SharePointMigration
            
            $result = $migration | Start-SharePointMigrationBatch -BatchName "StructureBatch"
            
            Assert-MockCalled New-SPSite -ModuleName SharePointMigration -Times 1
        }
    }

    Context "Get-SharePointMigrationStatus" {
        BeforeEach {
            $migration = [SharePointMigration]::new("OnPremToOnline")
            Mock Get-SPMigrationJobStatus { 
                return @(
                    @{ 
                        JobId = [Guid]::NewGuid()
                        BatchName = "Batch1"
                        Status = "InProgress"
                        SourceUrl = "https://sharepoint.contoso.com/sites/site1"
                        TargetUrl = "https://contoso.sharepoint.com/sites/site1"
                        ProgressPercentage = 45
                        ItemsProcessed = 225
                        TotalItems = 500
                        Errors = @()
                        Warnings = @("Large file detected")
                    },
                    @{ 
                        JobId = [Guid]::NewGuid()
                        BatchName = "Batch2"
                        Status = "Completed"
                        ProgressPercentage = 100
                        ItemsProcessed = 150
                        TotalItems = 150
                        Errors = @()
                        Warnings = @()
                    }
                )
            } -ModuleName SharePointMigration
        }

        It "Should return status for all migration jobs" {
            $status = $migration | Get-SharePointMigrationStatus
            
            $status | Should -Not -BeNullOrEmpty
            $status.Count | Should -Be 2
            $status[0].BatchName | Should -Be "Batch1"
            $status[1].Status | Should -Be "Completed"
        }

        It "Should calculate overall progress correctly" {
            $status = $migration | Get-SharePointMigrationStatus -IncludeOverallProgress
            
            $status.OverallProgress | Should -Not -BeNullOrEmpty
            $status.OverallProgress.CompletionPercentage | Should -BeGreaterThan 0
            $status.OverallProgress.TotalSites | Should -Be 2
        }

        It "Should include detailed error information" {
            Mock Get-SPMigrationJobStatus { 
                return @(
                    @{ 
                        Status = "Failed"
                        Errors = @(
                            @{ Message = "Permission denied"; SourceItem = "/Documents/file1.docx" },
                            @{ Message = "File too large"; SourceItem = "/Documents/large.zip" }
                        )
                    }
                )
            } -ModuleName SharePointMigration
            
            $status = $migration | Get-SharePointMigrationStatus -IncludeErrors
            
            $status[0].Errors.Count | Should -Be 2
            $status[0].Errors[0].Message | Should -Be "Permission denied"
        }
    }

    Context "Test-SharePointConnectivity" {
        BeforeEach {
            $migration = [SharePointMigration]::new("OnPremToOnline")
            $migration.SetSourceEnvironment("https://sharepoint.contoso.com", $TestCredential)
            $migration.SetTargetEnvironment("https://contoso.sharepoint.com", $TestCredential, "tenant-id")
        }

        It "Should test source SharePoint connectivity" {
            Mock Connect-PnPOnline { return $true } -ModuleName SharePointMigration
            Mock Get-PnPWeb { return @{ Title = "Test Web"; Url = "/" } } -ModuleName SharePointMigration
            
            $result = $migration | Test-SharePointConnectivity -TestSource
            
            $result.SourceConnectivity | Should -Be $true
            Assert-MockCalled Connect-PnPOnline -ModuleName SharePointMigration -Times 1
        }

        It "Should test target SharePoint connectivity" {
            Mock Connect-PnPOnline { return $true } -ModuleName SharePointMigration
            Mock Get-PnPTenantSite { return @{ Url = "https://contoso.sharepoint.com" } } -ModuleName SharePointMigration
            
            $result = $migration | Test-SharePointConnectivity -TestTarget
            
            $result.TargetConnectivity | Should -Be $true
        }

        It "Should handle authentication failures" {
            Mock Connect-PnPOnline { throw "Authentication failed" } -ModuleName SharePointMigration
            
            $result = $migration | Test-SharePointConnectivity -TestSource
            
            $result.SourceConnectivity | Should -Be $false
            $result.SourceError | Should -Match "*Authentication failed*"
        }

        It "Should test both environments simultaneously" {
            Mock Connect-PnPOnline { return $true } -ModuleName SharePointMigration
            Mock Get-PnPWeb { return @{ Title = "Test Web" } } -ModuleName SharePointMigration
            Mock Get-PnPTenantSite { return @{ Url = "https://contoso.sharepoint.com" } } -ModuleName SharePointMigration
            
            $result = $migration | Test-SharePointConnectivity -TestSource -TestTarget
            
            $result.SourceConnectivity | Should -Be $true
            $result.TargetConnectivity | Should -Be $true
        }
    }

    Context "Export-SharePointMigrationReport" {
        BeforeEach {
            $migration = [SharePointMigration]::new("OnPremToOnline")
            Mock Get-SharePointMigrationStatus { 
                return @(
                    @{
                        BatchName = "Batch1"
                        Status = "Completed"
                        SourceUrl = "https://sharepoint.contoso.com/sites/site1"
                        TargetUrl = "https://contoso.sharepoint.com/sites/site1"
                        ItemsProcessed = 500
                        TotalItems = 500
                        SizeTransferred = "2.5 GB"
                        StartTime = (Get-Date).AddHours(-3)
                        EndTime = Get-Date
                        Errors = @()
                        Warnings = @("Version limit exceeded for 5 files")
                    }
                )
            } -ModuleName SharePointMigration
        }

        It "Should export comprehensive report to CSV" {
            $reportPath = Join-Path $TestDrive "sharepoint_migration_report.csv"
            
            $migration | Export-SharePointMigrationReport -OutputPath $reportPath -Format CSV
            
            $reportPath | Should -Exist
            $csvContent = Import-Csv $reportPath
            $csvContent[0].BatchName | Should -Be "Batch1"
            $csvContent[0].Status | Should -Be "Completed"
        }

        It "Should export detailed report to JSON" {
            $reportPath = Join-Path $TestDrive "sharepoint_migration_report.json"
            
            $migration | Export-SharePointMigrationReport -OutputPath $reportPath -Format JSON -IncludeDetails
            
            $reportPath | Should -Exist
            $jsonContent = Get-Content $reportPath | ConvertFrom-Json
            $jsonContent[0].BatchName | Should -Be "Batch1"
            $jsonContent[0].Warnings | Should -Not -BeNullOrEmpty
        }

        It "Should include site analysis in report" {
            Mock Get-SharePointSiteAnalysis { 
                return @{
                    SiteUrl = "https://sharepoint.contoso.com/sites/site1"
                    ContentTypes = @("Document", "List Item")
                    CustomSolutions = @("Feature1.wsp")
                    ComplexityScore = 65
                }
            } -ModuleName SharePointMigration
            
            $reportPath = Join-Path $TestDrive "detailed_report.json"
            $result = $migration | Export-SharePointMigrationReport -OutputPath $reportPath -Format JSON -IncludeSiteAnalysis
            
            $result.SiteAnalysis | Should -Not -BeNullOrEmpty
        }

        It "Should generate executive summary" {
            $reportPath = Join-Path $TestDrive "exec_summary.csv"
            
            $result = $migration | Export-SharePointMigrationReport -OutputPath $reportPath -Format CSV -IncludeSummary
            
            $result.Summary | Should -Not -BeNullOrEmpty
            $result.Summary.TotalSitesMigrated | Should -BeGreaterThan 0
            $result.Summary.TotalDataTransferred | Should -Not -BeNullOrEmpty
            $result.Summary.MigrationSuccessRate | Should -BeGreaterThan 0
        }
    }
}

Describe "SharePointMigration Integration Tests" {
    Context "End-to-End Migration Workflow" {
        BeforeEach {
            $migration = [SharePointMigration]::new("OnPremToOnline")
            $migration.SetSourceEnvironment("https://sharepoint.contoso.com", $TestCredential)
            $migration.SetTargetEnvironment("https://contoso.sharepoint.com", $TestCredential, "tenant-id")
            
            # Mock all SharePoint cmdlets and functions
            Mock Connect-PnPOnline { return $true } -ModuleName SharePointMigration
            Mock Get-PnPWeb { return @{ Title = "Test Web"; Url = "/" } } -ModuleName SharePointMigration
            Mock Get-SPSite { return $TestSites } -ModuleName SharePointMigration
            Mock Start-SPMigrationJob { return @{ JobId = [Guid]::NewGuid(); Status = "InProgress" } } -ModuleName SharePointMigration
            Mock Get-SPMigrationJobStatus { return @{ Status = "Completed"; ProgressPercentage = 100 } } -ModuleName SharePointMigration
        }

        It "Should complete full SharePoint migration workflow" {
            # Test connectivity
            $connectivityResult = $migration | Test-SharePointConnectivity -TestSource -TestTarget
            $connectivityResult.SourceConnectivity | Should -Be $true
            $connectivityResult.TargetConnectivity | Should -Be $true
            
            # Analyze sites
            $analysis = $migration | Start-SharePointSiteAnalysis -SiteUrl $TestSites[0].Url
            $analysis | Should -Not -BeNullOrEmpty
            
            # Create migration batch
            $batch = $migration | New-SharePointMigrationBatch -BatchName "E2ETestBatch" -SiteCollections $TestSites
            $batch | Should -Not -BeNullOrEmpty
            
            # Start migration
            $startResult = $migration | Start-SharePointMigrationBatch -BatchName "E2ETestBatch"
            $startResult.Status | Should -Be "InProgress"
            
            # Monitor progress
            $status = $migration | Get-SharePointMigrationStatus
            $status | Should -Not -BeNullOrEmpty
            
            # Export final report
            $reportPath = Join-Path $TestDrive "e2e_sharepoint_report.csv"
            $reportResult = $migration | Export-SharePointMigrationReport -OutputPath $reportPath -Format CSV
            $reportPath | Should -Exist
        }
    }

    Context "Complex Migration Scenarios" {
        BeforeEach {
            $migration = [SharePointMigration]::new("OnPremToOnline")
        }

        It "Should handle large site collections with multiple webs" {
            $largeSiteCollection = @{
                Url = "https://sharepoint.contoso.com/sites/large"
                Webs = 1..50 | ForEach-Object { @{ Title = "Web $_"; Url = "/web$_" } }
                StorageUsed = 95000  # Close to limit but within
            }
            
            Mock Get-SPSite { return $largeSiteCollection } -ModuleName SharePointMigration
            Mock Get-SPWeb { return $largeSiteCollection.Webs } -ModuleName SharePointMigration
            
            $analysis = $migration | Start-SharePointSiteAnalysis -SiteUrl $largeSiteCollection.Url
            
            $analysis.WebCount | Should -Be 50
            $analysis.ComplexityScore | Should -BeGreaterThan 50
        }

        It "Should handle content type and field mapping" {
            $migration.MigrationConfig.ContentTypeMapping["0x0101"] = "0x010100A14F30F026744B71A08077B9ACA0F020"
            $migration.MigrationConfig.FieldMapping["Old_Field"] = "New_Field"
            
            Mock Get-SPContentType { 
                return @{ Id = "0x0101"; Name = "Document"; Fields = @(@{ InternalName = "Old_Field" }) }
            } -ModuleName SharePointMigration
            
            $batch = $migration | New-SharePointMigrationBatch -BatchName "MappedBatch" -SiteCollections $TestSites -ApplyMappings
            
            $batch.ContentTypeMappings | Should -Not -BeNullOrEmpty
            $batch.FieldMappings | Should -Not -BeNullOrEmpty
        }

        It "Should handle incremental migration scenarios" {
            $migration.MigrationConfig.UseIncrementalMigration = $true
            
            Mock Get-SPMigrationHistory { 
                return @{
                    LastMigrationDate = (Get-Date).AddDays(-7)
                    ItemsChanged = 25
                    ItemsAdded = 10
                    ItemsDeleted = 5
                }
            } -ModuleName SharePointMigration
            
            $incrementalBatch = $migration | New-SharePointMigrationBatch -BatchName "IncrementalBatch" -SiteCollections $TestSites -IncrementalOnly
            
            $incrementalBatch.MigrationType | Should -Be "Incremental"
            $incrementalBatch.ItemsToMigrate | Should -Be 35  # Changed + Added
        }
    }

    Context "Error Handling and Recovery" {
        BeforeEach {
            $migration = [SharePointMigration]::new("OnPremToOnline")
        }

        It "Should handle SharePoint throttling gracefully" {
            Mock Start-SPMigrationJob { throw "Request rate exceeded" } -ModuleName SharePointMigration
            
            $result = $migration | Start-SharePointMigrationBatch -BatchName "ThrottledBatch"
            
            $result.Status | Should -Be "ThrottledRetry"
            $result.RetryAfter | Should -BeGreaterThan 0
        }

        It "Should handle large file migration failures" {
            $migration.MigrationConfig.MaxFileSize = 10  # 10 GB limit
            
            Mock Get-SPFile { 
                return @{ 
                    Name = "huge_file.zip"
                    Length = 15GB  # Exceeds limit
                    Url = "/Documents/huge_file.zip"
                }
            } -ModuleName SharePointMigration
            
            $result = $migration | Start-SharePointMigrationBatch -BatchName "LargeFileBatch"
            
            $result.Warnings | Should -Contain "*File size exceeds limit*"
        }

        It "Should validate permissions before migration" {
            Mock Get-SPUser { throw "Access denied" } -ModuleName SharePointMigration
            
            $result = $migration | Test-SharePointConnectivity -TestSource -ValidatePermissions
            
            $result.SourceConnectivity | Should -Be $false
            $result.PermissionIssues | Should -Not -BeNullOrEmpty
        }
    }
}

Describe "SharePointMigration Performance Tests" {
    Context "Batch Processing Performance" {
        BeforeEach {
            $migration = [SharePointMigration]::new("OnPremToOnline")
            
            # Create large site collection list for performance testing
            $largeSiteList = 1..100 | ForEach-Object {
                @{
                    Url = "https://contoso.sharepoint.com/sites/site$_"
                    Title = "Test Site $_"
                    StorageUsed = Get-Random -Minimum 100 -Maximum 5000  # Random size between 100MB and 5GB
                    Owner = "user$_@contoso.com"
                }
            }
            
            Mock Get-SPSite { return $largeSiteList } -ModuleName SharePointMigration
        }

        It "Should handle large site collection analysis within reasonable time" {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            
            $analysis = $migration | Start-SharePointSiteAnalysis -SiteUrl $largeSiteList[0].Url -BulkAnalysis
            
            $stopwatch.Stop()
            $stopwatch.ElapsedMilliseconds | Should -BeLessThan 10000  # Should complete in under 10 seconds
        }

        It "Should optimize batch creation for large datasets" {
            $migration.MigrationConfig.BatchSize = 20
            
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            $batches = $migration | New-SharePointMigrationBatch -BatchName "OptimizedBatch" -SiteCollections $largeSiteList -SplitIntoBatches
            $stopwatch.Stop()
            
            $batches.Count | Should -Be 5  # 100 sites / 20 batch size = 5 batches
            $stopwatch.ElapsedMilliseconds | Should -BeLessThan 15000  # Should complete in under 15 seconds
        }

        It "Should handle concurrent migration streams efficiently" {
            $migration.MigrationConfig.ConcurrentConnections = 10
            
            Mock Start-SPMigrationJob { 
                Start-Sleep -Milliseconds 100  # Simulate processing time
                return @{ JobId = [Guid]::NewGuid(); Status = "InProgress" }
            } -ModuleName SharePointMigration
            
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            $results = 1..10 | ForEach-Object -Parallel {
                $migration | Start-SharePointMigrationBatch -BatchName "ConcurrentBatch$_"
            }
            $stopwatch.Stop()
            
            # Concurrent execution should be faster than sequential
            $stopwatch.ElapsedMilliseconds | Should -BeLessThan 5000
        }
    }

    Context "Memory Management Tests" {
        It "Should efficiently manage memory during large migrations" {
            $migration = [SharePointMigration]::new("OnPremToOnline")
            
            $initialMemory = [System.GC]::GetTotalMemory($false)
            
            # Simulate processing large amounts of data
            1..100 | ForEach-Object {
                $largeSiteData = @{
                    Url = "https://contoso.sharepoint.com/sites/site$_"
                    Data = "x" * 1000000  # 1MB of data per site
                }
                $migration.SiteMap["site$_"] = $largeSiteData
            }
            
            # Clear data and force garbage collection
            $migration.SiteMap.Clear()
            [System.GC]::Collect()
            [System.GC]::WaitForPendingFinalizers()
            
            $finalMemory = [System.GC]::GetTotalMemory($false)
            $memoryIncrease = $finalMemory - $initialMemory
            
            # Memory increase should be minimal after cleanup
            $memoryIncrease | Should -BeLessThan 5242880  # Less than 5MB
        }
    }
}

AfterAll {
    # Clean up test files
    if (Test-Path $TestLogDir) {
        Remove-Item $TestLogDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Remove imported module
    Remove-Module SharePointMigration -Force -ErrorAction SilentlyContinue
}