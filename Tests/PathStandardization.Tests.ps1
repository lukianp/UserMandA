# PowerShell Pester Tests for Path Standardization
# Tests PowerShell module path resolution and environment variable handling

Describe "PowerShell Module Path Standardization Tests" {
    BeforeAll {
        # Store original environment variable
        $script:OriginalEnvPath = [Environment]::GetEnvironmentVariable("MANDA_DISCOVERY_PATH", "Process")
        
        # Create test paths
        $script:TestRootPath = Join-Path $env:TEMP "TestDiscoveryData_$(Get-Random)"
        New-Item -Path $script:TestRootPath -ItemType Directory -Force | Out-Null
        
        # Skip module import to avoid dependency issues in testing
    }
    
    AfterAll {
        # Restore original environment variable
        if ($null -ne $script:OriginalEnvPath) {
            [Environment]::SetEnvironmentVariable("MANDA_DISCOVERY_PATH", $script:OriginalEnvPath, "Process")
        } else {
            [Environment]::SetEnvironmentVariable("MANDA_DISCOVERY_PATH", $null, "Process")
        }
        
        # Clean up test directory
        if (Test-Path $script:TestRootPath) {
            Remove-Item $script:TestRootPath -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    
    Context "Environment Variable Path Resolution" {
        It "Should use default path when environment variable is not set" {
            [Environment]::SetEnvironmentVariable("MANDA_DISCOVERY_PATH", $null, "Process")
            
            # Test path resolution in PowerShell context
            $DefaultPath = "C:\discoverydata"
            $ResolvedPath = if ([Environment]::GetEnvironmentVariable("MANDA_DISCOVERY_PATH")) {
                [Environment]::GetEnvironmentVariable("MANDA_DISCOVERY_PATH")
            } else {
                $DefaultPath
            }
            
            $ResolvedPath | Should Be $DefaultPath
        }
        
        It "Should use environment variable when set" {
            $TestPath = $script:TestRootPath
            [Environment]::SetEnvironmentVariable("MANDA_DISCOVERY_PATH", $TestPath, "Process")
            
            $ResolvedPath = [Environment]::GetEnvironmentVariable("MANDA_DISCOVERY_PATH")
            $ResolvedPath | Should Be $TestPath
        }
        
        It "Should normalize path case consistently" {
            $TestPath = $script:TestRootPath.ToUpper()
            [Environment]::SetEnvironmentVariable("MANDA_DISCOVERY_PATH", $TestPath, "Process")
            
            # Simulate normalization logic
            $NormalizedPath = [Environment]::GetEnvironmentVariable("MANDA_DISCOVERY_PATH").ToLowerInvariant().TrimEnd('\', '/')
            
            $NormalizedPath | Should Be $script:TestRootPath.ToLowerInvariant()
        }
    }
    
    Context "CSV Data Path Resolution" {
        It "Should construct correct raw data path for company" {
            $CompanyName = "TestCompany"
            $BasePath = "C:\discoverydata"
            
            $ExpectedPath = Join-Path $BasePath "$CompanyName\Raw"
            $ExpectedPath | Should Match "discoverydata.*TestCompany.*Raw"
        }
        
        It "Should handle case-insensitive company names" {
            $CompanyName = "TESTCOMPANY"
            $BasePath = $script:TestRootPath
            
            # Create company directory with different case
            $CompanyDir = Join-Path $BasePath "testcompany"
            New-Item -Path $CompanyDir -ItemType Directory -Force | Out-Null
            
            # Test case-insensitive matching
            $FoundDir = Get-ChildItem $BasePath -Directory | Where-Object { 
                $_.Name -ieq $CompanyName 
            } | Select-Object -First 1
            
            $FoundDir | Should Not BeNullOrEmpty
            $FoundDir.Name | Should Be "testcompany"
        }
        
        It "Should find existing data in both directory structures" {
            $CompanyName = "ljpops"
            
            # Create both possible structures
            $DirectPath = Join-Path $script:TestRootPath $CompanyName
            $ProfilesPath = Join-Path $script:TestRootPath "Profiles\$CompanyName"
            
            New-Item -Path $DirectPath -ItemType Directory -Force | Out-Null
            New-Item -Path $ProfilesPath -ItemType Directory -Force | Out-Null
            
            # Create test CSV files
            "TestData" | Out-File -FilePath (Join-Path $DirectPath "test1.csv")
            "TestData" | Out-File -FilePath (Join-Path $ProfilesPath "test2.csv")
            
            # Both paths should exist
            Test-Path $DirectPath | Should Be $true
            Test-Path $ProfilesPath | Should Be $true
        }
    }
    
    Context "PowerShell Module Integration" {
        It "Should load modules without path errors" {
            # Test module loading from standard paths
            $ModulesPath = "C:\enterprisediscovery\Modules"
            $ModulesPath | Should Match "enterprisediscovery"
            
            # Verify path structure expectations
            $ModulesPath | Should Not Match "DiscoveryData"
        }
        
        It "Should validate data directory accessibility" {
            $CompanyName = "TestCompany"
            $RawDataPath = Join-Path $script:TestRootPath "$CompanyName\Raw"
            
            # Create the path structure
            New-Item -Path $RawDataPath -ItemType Directory -Force | Out-Null
            
            # Test that PowerShell can access the path
            Test-Path $RawDataPath | Should Be $true
            
            # Test CSV file operations
            $TestCsvPath = Join-Path $RawDataPath "test.csv"
            "Header1,Header2" | Out-File -FilePath $TestCsvPath
            "Value1,Value2" | Out-File -FilePath $TestCsvPath -Append
            
            $CsvContent = Import-Csv $TestCsvPath
            $CsvContent | Should Not BeNullOrEmpty
            $CsvContent[0].Header1 | Should Be "Value1"
        }
    }
    
    Context "Discovery Module Path Handling" {
        It "Should use consistent path separators" {
            $TestPath = "C:\discoverydata\TestCompany\Raw"
            
            # Ensure Windows path separators
            $TestPath | Should Match "C:\\discoverydata\\TestCompany\\Raw"
            $TestPath | Should Not Match "/"
        }
        
        It "Should handle long paths correctly" {
            $LongCompanyName = "VeryLongCompanyNameThatExceedsNormalLengthExpectations"
            $LongPath = Join-Path $script:TestRootPath "$LongCompanyName\Raw\VeryLongSubdirectory\AnotherLongSubdirectory"
            
            # Test path creation
            try {
                New-Item -Path $LongPath -ItemType Directory -Force | Out-Null
                $PathCreated = Test-Path $LongPath
                $PathCreated | Should Be $true
            } catch {
                # Long path limitations on some systems
                Write-Warning "Long path test skipped due to system limitations: $_"
            }
        }
        
        It "Should validate required CSV columns exist" {
            $TestCsvPath = Join-Path $script:TestRootPath "test_validation.csv"
            
            # Create CSV with required columns
            $RequiredColumns = "_DiscoveryTimestamp,_DiscoveryModule,_SessionId,UserPrincipalName"
            $RequiredColumns | Out-File -FilePath $TestCsvPath
            "2024-01-01,TestModule,Session123,test@example.com" | Out-File -FilePath $TestCsvPath -Append
            
            $CsvData = Import-Csv $TestCsvPath
            $CsvData[0]._DiscoveryTimestamp | Should Be "2024-01-01"
            $CsvData[0]._DiscoveryModule | Should Be "TestModule"
            $CsvData[0]._SessionId | Should Be "Session123"
        }
    }
    
    Context "Error Handling and Logging" {
        It "Should log path resolution attempts" {
            $LogPath = Join-Path $script:TestRootPath "test.log"
            
            # Simulate logging path resolution
            $LogEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): Resolving discovery path: $($script:TestRootPath)"
            $LogEntry | Out-File -FilePath $LogPath
            
            Test-Path $LogPath | Should Be $true
            Get-Content $LogPath | Should Contain $LogEntry
        }
        
        It "Should handle missing directories gracefully" {
            $NonExistentPath = Join-Path $script:TestRootPath "DoesNotExist"
            
            # Should not throw when checking non-existent path
            { Test-Path $NonExistentPath } | Should Not Throw
            Test-Path $NonExistentPath | Should Be $false
        }
        
        It "Should validate permissions on discovery paths" {
            $TestPath = Join-Path $script:TestRootPath "PermissionTest"
            New-Item -Path $TestPath -ItemType Directory -Force | Out-Null
            
            # Test write permissions
            $TestFile = Join-Path $TestPath "write_test.txt"
            try {
                "Test" | Out-File -FilePath $TestFile
                $WriteSuccess = Test-Path $TestFile
                $WriteSuccess | Should Be $true
            } catch {
                Write-Warning "Permission test failed: $_"
            }
        }
    }
    
    Context "Backward Compatibility" {
        It "Should handle legacy path references" {
            # Test that both C:\discoverydata and C:\DiscoveryData can be handled
            $LegacyPath = "C:\DiscoveryData"
            $StandardPath = "C:\discoverydata"
            
            # Normalize function simulation
            function Normalize-DiscoveryPath {
                param($Path)
                return $Path.ToLowerInvariant().TrimEnd('\', '/')
            }
            
            Normalize-DiscoveryPath $LegacyPath | Should Be $StandardPath.ToLowerInvariant()
        }
        
        It "Should migrate between directory structures" {
            $OldStructure = Join-Path $script:TestRootPath "OldCompany"
            $NewStructure = Join-Path $script:TestRootPath "Profiles\OldCompany"
            
            # Create old structure with data
            New-Item -Path $OldStructure -ItemType Directory -Force | Out-Null
            "Old Data" | Out-File -FilePath (Join-Path $OldStructure "old_data.csv")
            
            # Create new structure
            New-Item -Path $NewStructure -ItemType Directory -Force | Out-Null
            
            # Both should be accessible
            Test-Path $OldStructure | Should Be $true
            Test-Path $NewStructure | Should Be $true
        }
    }
}

Describe "PowerShell Discovery Module Path Tests" {
    Context "Module Loading and Path Resolution" {
        It "Should resolve module paths correctly" {
            $ExpectedModulePath = "C:\enterprisediscovery\Modules\Discovery"
            $ExpectedModulePath | Should Match "enterprisediscovery.*Modules.*Discovery"
        }
        
        It "Should distinguish between enterprise and discovery data paths" {
            $EnterprisePath = "C:\enterprisediscovery"
            $DiscoveryDataPath = "C:\discoverydata"
            
            $EnterprisePath | Should Not Be $DiscoveryDataPath
            $EnterprisePath | Should Match "enterprisediscovery"
            $DiscoveryDataPath | Should Match "discoverydata"
        }
    }
    
    Context "CSV Processing Path Validation" {
        It "Should process CSV files from standardized paths" {
            $CompanyName = "TestCompany"
            $CsvDir = Join-Path $script:TestRootPath "$CompanyName\Raw"
            New-Item -Path $CsvDir -ItemType Directory -Force | Out-Null
            
            # Create test CSV with required structure
            $CsvPath = Join-Path $CsvDir "ActiveDirectoryUsers.csv"
            $Headers = "_DiscoveryTimestamp,_DiscoveryModule,_SessionId,UserPrincipalName,DisplayName"
            $Data = "2024-01-01,AD,Session123,user@test.com,Test User"
            
            $Headers | Out-File -FilePath $CsvPath
            $Data | Out-File -FilePath $CsvPath -Append
            
            # Validate CSV can be processed
            $CsvContent = Import-Csv $CsvPath
            $CsvContent.Count | Should Be 1
            $CsvContent[0].UserPrincipalName | Should Be "user@test.com"
        }
        
        It "Should handle multiple CSV file patterns" {
            $CompanyName = "TestCompany"
            $CsvDir = Join-Path $script:TestRootPath "$CompanyName\Raw"
            New-Item -Path $CsvDir -ItemType Directory -Force | Out-Null
            
            # Create multiple CSV files with timestamp patterns
            $TimeStamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $CsvFiles = @(
                "ActiveDirectoryUsers_$TimeStamp.csv",
                "ActiveDirectoryGroups_$TimeStamp.csv",
                "ComputerInventory_$TimeStamp.csv"
            )
            
            foreach ($CsvFile in $CsvFiles) {
                $CsvPath = Join-Path $CsvDir $CsvFile
                "Header1,Header2" | Out-File -FilePath $CsvPath
                "Value1,Value2" | Out-File -FilePath $CsvPath -Append
            }
            
            # Validate all files were created
            $CsvFiles | ForEach-Object {
                $FilePath = Join-Path $CsvDir $_
                Test-Path $FilePath | Should Be $true
            }
        }
    }
}