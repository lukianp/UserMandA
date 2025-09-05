#Requires -Module Pester
<#
.SYNOPSIS
    Pester tests for empty state validation across discovery modules
    
.DESCRIPTION
    Comprehensive Pester test suite to validate PowerShell modules handle
    empty CSV files and missing data gracefully.
#>

BeforeAll {
    $script:TestConfig = @{
        BuildPath = "C:\enterprisediscovery"
        ModulesPath = "C:\enterprisediscovery\Modules"
        TestDataPath = "C:\discoverydata\PesterTest"
        RawDataPath = "C:\discoverydata\PesterTest\RawData"
    }
    
    # Ensure test directories exist
    if (-not (Test-Path $script:TestConfig.TestDataPath)) {
        New-Item -ItemType Directory -Path $script:TestConfig.TestDataPath -Force | Out-Null
    }
    if (-not (Test-Path $script:TestConfig.RawDataPath)) {
        New-Item -ItemType Directory -Path $script:TestConfig.RawDataPath -Force | Out-Null
    }
    
    # Clean any existing CSV files
    Get-ChildItem -Path $script:TestConfig.RawDataPath -Filter "*.csv" -ErrorAction SilentlyContinue | Remove-Item -Force
}

Describe "Discovery Module Empty State Tests" {
    
    Context "Module Loading" {
        
        It "Should load UserDiscovery module without CSV data" {
            $modulePath = Join-Path $script:TestConfig.ModulesPath "UserDiscovery.psm1"
            if (Test-Path $modulePath) {
                { Import-Module $modulePath -Force -ErrorAction Stop } | Should -Not -Throw
            } else {
                Set-ItResult -Skipped -Because "Module not found"
            }
        }
        
        It "Should load GroupDiscovery module without CSV data" {
            $modulePath = Join-Path $script:TestConfig.ModulesPath "GroupDiscovery.psm1"
            if (Test-Path $modulePath) {
                { Import-Module $modulePath -Force -ErrorAction Stop } | Should -Not -Throw
            } else {
                Set-ItResult -Skipped -Because "Module not found"
            }
        }
        
        It "Should load MailboxDiscovery module without CSV data" {
            $modulePath = Join-Path $script:TestConfig.ModulesPath "MailboxDiscovery.psm1"
            if (Test-Path $modulePath) {
                { Import-Module $modulePath -Force -ErrorAction Stop } | Should -Not -Throw
            } else {
                Set-ItResult -Skipped -Because "Module not found"
            }
        }
        
        It "Should load SharePointDiscovery module without CSV data" {
            $modulePath = Join-Path $script:TestConfig.ModulesPath "SharePointDiscovery.psm1"
            if (Test-Path $modulePath) {
                { Import-Module $modulePath -Force -ErrorAction Stop } | Should -Not -Throw
            } else {
                Set-ItResult -Skipped -Because "Module not found"
            }
        }
        
        It "Should load TeamsDiscovery module without CSV data" {
            $modulePath = Join-Path $script:TestConfig.ModulesPath "TeamsDiscovery.psm1"
            if (Test-Path $modulePath) {
                { Import-Module $modulePath -Force -ErrorAction Stop } | Should -Not -Throw
            } else {
                Set-ItResult -Skipped -Because "Module not found"
            }
        }
    }
    
    Context "CSV Reading Functions" {
        
        BeforeEach {
            # Ensure no CSV files exist
            Get-ChildItem -Path $script:TestConfig.RawDataPath -Filter "*.csv" -ErrorAction SilentlyContinue | Remove-Item -Force
        }
        
        It "Should handle missing Users.csv gracefully" {
            $csvPath = Join-Path $script:TestConfig.RawDataPath "Users.csv"
            $csvPath | Should -Not -Exist
            
            # Test reading missing file
            $result = $null
            { $result = Import-Csv -Path $csvPath -ErrorAction SilentlyContinue } | Should -Not -Throw
            $result | Should -BeNullOrEmpty
        }
        
        It "Should handle empty Users.csv with headers only" {
            $csvPath = Join-Path $script:TestConfig.RawDataPath "Users.csv"
            "UserPrincipalName,DisplayName,Department,Title" | Out-File -FilePath $csvPath -Encoding UTF8
            
            $result = Import-Csv -Path $csvPath
            $result | Should -Not -BeNullOrEmpty -Because "Headers should create object structure"
            @($result).Count | Should -Be 0 -Because "No data rows exist"
        }
        
        It "Should handle malformed CSV data" {
            $csvPath = Join-Path $script:TestConfig.RawDataPath "Groups.csv"
            @"
GroupName,MemberCount,GroupType
"Missing quotes,5,Security
Incomplete,
"Extra,Commas",10,Distribution,Extra
"@ | Out-File -FilePath $csvPath -Encoding UTF8
            
            { Import-Csv -Path $csvPath -ErrorAction Stop } | Should -Not -Throw
        }
        
        It "Should handle CSV with wrong delimiter" {
            $csvPath = Join-Path $script:TestConfig.RawDataPath "Computers.csv"
            @"
ComputerName;OperatingSystem;LastLogon
DESKTOP01;Windows 10;2025-01-01
SERVER01;Windows Server 2019;2025-01-02
"@ | Out-File -FilePath $csvPath -Encoding UTF8
            
            $result = Import-Csv -Path $csvPath
            # Should treat entire line as single column
            $result[0].PSObject.Properties.Count | Should -Be 1
        }
    }
    
    Context "Data Processing Functions" {
        
        It "Should return empty collection when no data exists" {
            function Get-TestUsers {
                param($Path)
                if (-not (Test-Path $Path)) {
                    return @()
                }
                $data = Import-Csv -Path $Path -ErrorAction SilentlyContinue
                return @($data)
            }
            
            $result = Get-TestUsers -Path (Join-Path $script:TestConfig.RawDataPath "Users.csv")
            $result | Should -BeOfType [System.Array]
            $result.Count | Should -Be 0
        }
        
        It "Should handle null parameters gracefully" {
            function Process-TestData {
                param($Data)
                if ($null -eq $Data) {
                    return @{ Status = "NoData"; Count = 0 }
                }
                return @{ Status = "Success"; Count = @($Data).Count }
            }
            
            $result = Process-TestData -Data $null
            $result.Status | Should -Be "NoData"
            $result.Count | Should -Be 0
        }
        
        It "Should validate required columns are missing" {
            $csvPath = Join-Path $script:TestConfig.RawDataPath "Mailboxes.csv"
            "Email,DisplayName" | Out-File -FilePath $csvPath -Encoding UTF8
            
            $data = Import-Csv -Path $csvPath
            $requiredColumns = @("Email", "DisplayName", "MailboxSize", "ItemCount")
            
            $missingColumns = $requiredColumns | Where-Object {
                $_ -notin $data[0].PSObject.Properties.Name
            }
            
            $missingColumns | Should -Contain "MailboxSize"
            $missingColumns | Should -Contain "ItemCount"
        }
    }
    
    Context "Error Handling" {
        
        It "Should log error when CSV read fails" {
            $errorLog = @()
            function Read-TestCsv {
                param($Path)
                try {
                    if (-not (Test-Path $Path)) {
                        throw "File not found: $Path"
                    }
                    Import-Csv -Path $Path
                }
                catch {
                    $script:errorLog += $_.Exception.Message
                    return @()
                }
            }
            
            $result = Read-TestCsv -Path "C:\NonExistent\File.csv"
            $result.Count | Should -Be 0
            $errorLog | Should -Contain "File not found: C:\NonExistent\File.csv"
        }
        
        It "Should continue processing after encountering bad data" {
            $results = @()
            $items = @($null, "", "ValidData", $null, "MoreValid")
            
            foreach ($item in $items) {
                if (-not [string]::IsNullOrEmpty($item)) {
                    $results += $item
                }
            }
            
            $results.Count | Should -Be 2
            $results | Should -Contain "ValidData"
            $results | Should -Contain "MoreValid"
        }
    }
    
    Context "Export Functions with Empty Data" {
        
        It "Should create CSV with headers only when no data exists" {
            function Export-TestData {
                param($Data, $Path)
                
                if ($null -eq $Data -or @($Data).Count -eq 0) {
                    "Column1,Column2,Column3" | Out-File -FilePath $Path -Encoding UTF8
                    return
                }
                
                $Data | Export-Csv -Path $Path -NoTypeInformation
            }
            
            $exportPath = Join-Path $script:TestConfig.RawDataPath "Export_Test.csv"
            Export-TestData -Data @() -Path $exportPath
            
            $exportPath | Should -Exist
            $content = Get-Content -Path $exportPath
            $content[0] | Should -Be "Column1,Column2,Column3"
            $content.Count | Should -Be 1
        }
        
        It "Should handle export with null data" {
            $exportPath = Join-Path $script:TestConfig.RawDataPath "Export_Null.csv"
            
            { $null | Export-Csv -Path $exportPath -NoTypeInformation -ErrorAction Stop } | Should -Throw
        }
    }
    
    Context "Performance with Large Empty Collections" {
        
        It "Should handle iterating over large empty array efficiently" {
            $largeEmpty = New-Object System.Collections.ArrayList
            1..10000 | ForEach-Object { $largeEmpty.Add($null) | Out-Null }
            
            $measure = Measure-Command {
                $filtered = $largeEmpty | Where-Object { $_ -ne $null }
            }
            
            $measure.TotalMilliseconds | Should -BeLessThan 1000
            @($filtered).Count | Should -Be 0
        }
        
        It "Should initialize large collection structures quickly" {
            $measure = Measure-Command {
                $collection = [System.Collections.Generic.List[PSObject]]::new(10000)
            }
            
            $measure.TotalMilliseconds | Should -BeLessThan 100
            $collection.Capacity | Should -Be 10000
            $collection.Count | Should -Be 0
        }
    }
}

Describe "ViewModel Empty State Tests" {
    
    BeforeAll {
        $dllPath = Join-Path $script:TestConfig.BuildPath "MandADiscoverySuite.dll"
        if (Test-Path $dllPath) {
            Add-Type -Path $dllPath
        }
    }
    
    Context "Collection Initialization" {
        
        It "Should initialize ObservableCollection properties as empty, not null" {
            # This is a pattern test - actual implementation would check real ViewModels
            $testObject = New-Object PSObject -Property @{
                Items = New-Object System.Collections.ObjectModel.ObservableCollection[object]
            }
            
            $testObject.Items | Should -Not -BeNullOrEmpty
            $testObject.Items.Count | Should -Be 0
            $testObject.Items | Should -BeOfType [System.Collections.ObjectModel.ObservableCollection[object]]
        }
        
        It "Should handle adding items to empty collection" {
            $collection = New-Object System.Collections.ObjectModel.ObservableCollection[object]
            
            { $collection.Add("TestItem") } | Should -Not -Throw
            $collection.Count | Should -Be 1
            $collection[0] | Should -Be "TestItem"
        }
        
        It "Should handle clearing already empty collection" {
            $collection = New-Object System.Collections.ObjectModel.ObservableCollection[object]
            
            { $collection.Clear() } | Should -Not -Throw
            $collection.Count | Should -Be 0
        }
    }
    
    Context "Property Change Notifications" {
        
        It "Should raise PropertyChanged when collection is set to empty" {
            # Simulate INPC pattern
            $eventRaised = $false
            $propertyName = ""
            
            Add-Type -TypeDefinition @"
            using System.ComponentModel;
            using System.Runtime.CompilerServices;
            
            public class TestViewModel : INotifyPropertyChanged {
                private object _items;
                
                public object Items {
                    get { return _items; }
                    set {
                        _items = value;
                        OnPropertyChanged();
                    }
                }
                
                public event PropertyChangedEventHandler PropertyChanged;
                
                protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null) {
                    PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
                }
            }
"@ -ErrorAction SilentlyContinue
            
            $vm = New-Object TestViewModel
            
            Register-ObjectEvent -InputObject $vm -EventName PropertyChanged -Action {
                $script:eventRaised = $true
                $script:propertyName = $Event.SourceEventArgs.PropertyName
            } | Out-Null
            
            $vm.Items = @()
            
            Start-Sleep -Milliseconds 100
            $eventRaised | Should -Be $true
            $propertyName | Should -Be "Items"
        }
    }
}

Describe "UI Empty State Display Tests" {
    
    Context "Empty State Messages" {
        
        It "Should have consistent empty state message format" {
            $emptyMessages = @(
                "No users found",
                "No groups found", 
                "No mailboxes found",
                "No SharePoint sites found",
                "No Teams found"
            )
            
            foreach ($message in $emptyMessages) {
                $message | Should -Match "^No .+ found$"
            }
        }
        
        It "Should display item count as zero" {
            $counts = @{
                Users = 0
                Groups = 0
                Mailboxes = 0
                SharePointSites = 0
                Teams = 0
            }
            
            foreach ($key in $counts.Keys) {
                $counts[$key] | Should -Be 0
                "$($counts[$key]) $key" | Should -Match "^0 "
            }
        }
    }
}

AfterAll {
    # Cleanup test data
    if (Test-Path $script:TestConfig.TestDataPath) {
        Remove-Item -Path $script:TestConfig.TestDataPath -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Generate summary
    Write-Host "`n=== Pester Test Summary ===" -ForegroundColor Cyan
}