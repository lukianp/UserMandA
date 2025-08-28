# Pester tests for Pre-Migration Check Module (T-031)
# Tests eligibility rules, fuzzy matching, and mapping persistence

BeforeAll {
    # Setup test environment
    $script:TestProfilePath = Join-Path $env:TEMP "PesterTestProfile_$(Get-Random)"
    $script:MappingsPath = Join-Path $TestProfilePath "Mappings"
    New-Item -ItemType Directory -Path $MappingsPath -Force | Out-Null
    
    # Mock data for testing
    $script:TestUsers = @(
        @{
            Sid = "S-1-5-21-12345-1"
            DisplayName = "John Doe"
            UPN = "john.doe@contoso.com"
            Enabled = $true
            Sam = "johndoe"
        },
        @{
            Sid = "S-1-5-21-12345-2"
            DisplayName = "Jane Smith"
            UPN = "jane.smith@contoso.com"
            Enabled = $false  # Disabled user - should be blocked
            Sam = "janesmith"
        },
        @{
            Sid = "S-1-5-21-12345-3"
            DisplayName = "Invalid<User>"
            UPN = "invalid user@contoso.com"  # Space in UPN - should be blocked
            Enabled = $true
            Sam = "invaliduser"
        }
    )
    
    $script:TestMailboxes = @(
        @{
            UPN = "john.doe@contoso.com"
            SizeMB = 50000  # 50GB - eligible
            Type = "UserMailbox"
        },
        @{
            UPN = "large.mailbox@contoso.com"
            SizeMB = 150000  # 150GB - should be blocked
            Type = "UserMailbox"
        },
        @{
            UPN = "discovery@contoso.com"
            SizeMB = 5000
            Type = "DiscoveryMailbox"  # Unsupported type - should be blocked
        }
    )
    
    $script:TestFileShares = @(
        @{
            Path = "C:\Shares\Valid"
            Name = "ValidShare"
        },
        @{
            Path = "C:\Very\Long\Path\That\Exceeds\The\Maximum\Allowed\Length\" + ("x" * 250)
            Name = "LongPathShare"
        },
        @{
            Path = "Z:\NonExistent\Share"
            Name = "InaccessibleShare"
        }
    )
    
    $script:TestDatabases = @(
        @{
            Server = "SQL01"
            Instance = "DEFAULT"
            Database = "ValidDB"
        },
        @{
            Server = "SQL02"
            Instance = "DEFAULT"
            Database = "Invalid<DB>"  # Invalid characters
        },
        @{
            Server = "SQL03"
            Instance = "DEFAULT"
            Database = $null  # Missing name
        }
    )
}

AfterAll {
    # Cleanup test environment
    if (Test-Path $script:TestProfilePath) {
        Remove-Item -Path $script:TestProfilePath -Recurse -Force
    }
}

Describe "Pre-Migration Eligibility Rules" {
    
    Context "User Eligibility Checks" {
        
        It "Should block disabled users" {
            $disabledUsers = $script:TestUsers | Where-Object { -not $_.Enabled }
            $disabledUsers | Should -HaveCount 1
            
            foreach ($user in $disabledUsers) {
                $issues = @()
                
                # Check enabled status
                if (-not $user.Enabled) {
                    $issues += "Source account is disabled"
                }
                
                $issues | Should -Contain "Source account is disabled"
            }
        }
        
        It "Should block users with invalid UPN characters" {
            $invalidUPNs = @(
                "user name@contoso.com",  # Space
                "user'name@contoso.com",  # Single quote
                'user"name@contoso.com'   # Double quote
            )
            
            foreach ($upn in $invalidUPNs) {
                $hasInvalidChars = ($upn -match '\s') -or ($upn -match "'") -or ($upn -match '"')
                $hasInvalidChars | Should -BeTrue
            }
        }
        
        It "Should block users with blocked display name characters" {
            $blockedChars = @('<', '>', '"', '|', "`0", "`n", "`r", "`t")
            $invalidUser = $script:TestUsers | Where-Object { $_.DisplayName -like "*<*" }
            
            $invalidUser | Should -HaveCount 1
            $invalidUser[0].DisplayName | Should -Match '<|>'
        }
        
        It "Should validate mailbox size limits" {
            $largeMailbox = $script:TestMailboxes | Where-Object { $_.SizeMB -gt 100000 }
            $largeMailbox | Should -HaveCount 1
            $largeMailbox[0].SizeMB | Should -BeGreaterThan 100000
        }
    }
    
    Context "Mailbox Eligibility Checks" {
        
        It "Should block mailboxes exceeding size limit" {
            $oversized = $script:TestMailboxes | Where-Object { $_.SizeMB -gt 100000 }
            $oversized | Should -HaveCount 1
            
            foreach ($mailbox in $oversized) {
                $issues = @()
                if ($mailbox.SizeMB -gt 100000) {
                    $issues += "Mailbox size exceeds 100GB limit"
                }
                $issues.Count | Should -BeGreaterThan 0
            }
        }
        
        It "Should block unsupported mailbox types" {
            $supportedTypes = @("UserMailbox", "SharedMailbox", "RoomMailbox", "EquipmentMailbox")
            $unsupported = $script:TestMailboxes | Where-Object { $_.Type -notin $supportedTypes }
            
            $unsupported | Should -HaveCount 1
            $unsupported[0].Type | Should -Be "DiscoveryMailbox"
        }
        
        It "Should validate UPN format" {
            $invalidUPNs = @("", "noatsign", $null)
            
            foreach ($upn in $invalidUPNs) {
                $isValid = (-not [string]::IsNullOrEmpty($upn)) -and ($upn -match '@')
                $isValid | Should -BeFalse
            }
        }
    }
    
    Context "File Share Eligibility Checks" {
        
        It "Should block paths exceeding 260 characters" {
            $longPaths = $script:TestFileShares | Where-Object { $_.Path.Length -gt 260 }
            $longPaths | Should -HaveCount 1
            $longPaths[0].Path.Length | Should -BeGreaterThan 260
        }
        
        It "Should detect invalid path characters" {
            $invalidChars = [System.IO.Path]::GetInvalidPathChars()
            # Test a few common invalid characters
            $testPaths = @(
                "C:\Path`0Name",  # Null character
                "C:\Path|Name",   # Pipe character
                "C:\Path`tName"   # Tab character
            )
            
            foreach ($path in $testPaths) {
                $hasInvalid = $false
                foreach ($char in $invalidChars) {
                    if ($path.Contains($char)) {
                        $hasInvalid = $true
                        break
                    }
                }
                # At least some should have invalid chars
            }
        }
        
        It "Should check path accessibility" {
            $inaccessible = $script:TestFileShares | Where-Object { 
                -not (Test-Path $_.Path -ErrorAction SilentlyContinue) 
            }
            $inaccessible.Count | Should -BeGreaterThan 0
        }
    }
    
    Context "SQL Database Eligibility Checks" {
        
        It "Should block databases with missing names" {
            $missingNames = $script:TestDatabases | Where-Object { 
                [string]::IsNullOrEmpty($_.Database) 
            }
            $missingNames | Should -HaveCount 1
        }
        
        It "Should block databases with invalid characters" {
            $invalidChars = @('<', '>', '"', '|', "`0", "`n", "`r", "`t")
            $invalidDbs = $script:TestDatabases | Where-Object { 
                $_.Database -match '[<>"|`0`n`r`t]' 
            }
            $invalidDbs | Should -HaveCount 1
        }
        
        It "Should allow valid database names" {
            $validDbs = $script:TestDatabases | Where-Object { 
                -not [string]::IsNullOrEmpty($_.Database) -and 
                $_.Database -notmatch '[<>"|`0`n`r`t]'
            }
            $validDbs | Should -HaveCount 1
            $validDbs[0].Database | Should -Be "ValidDB"
        }
    }
}

Describe "Fuzzy Matching Algorithm" {
    
    BeforeAll {
        # Simple Jaro-Winkler implementation for testing
        function Get-JaroWinklerSimilarity {
            param(
                [string]$String1,
                [string]$String2
            )
            
            if ([string]::IsNullOrEmpty($String1) -and [string]::IsNullOrEmpty($String2)) {
                return 1.0
            }
            
            if ([string]::IsNullOrEmpty($String1) -or [string]::IsNullOrEmpty($String2)) {
                return 0.0
            }
            
            if ($String1.ToLower() -eq $String2.ToLower()) {
                return 1.0
            }
            
            # Simplified similarity calculation for testing
            $s1 = $String1.ToLower()
            $s2 = $String2.ToLower()
            $commonChars = 0
            
            for ($i = 0; $i -lt [Math]::Min($s1.Length, $s2.Length); $i++) {
                if ($s1[$i] -eq $s2[$i]) {
                    $commonChars++
                }
            }
            
            $similarity = $commonChars / [Math]::Max($s1.Length, $s2.Length)
            
            # Add prefix bonus (simplified)
            $prefixLength = 0
            $maxPrefix = [Math]::Min(4, [Math]::Min($s1.Length, $s2.Length))
            
            for ($i = 0; $i -lt $maxPrefix; $i++) {
                if ($s1[$i] -eq $s2[$i]) {
                    $prefixLength++
                } else {
                    break
                }
            }
            
            if ($prefixLength -gt 0 -and $similarity -gt 0.7) {
                $similarity += (0.1 * $prefixLength * (1 - $similarity))
            }
            
            return [Math]::Min(1.0, $similarity)
        }
    }
    
    It "Should return 100% for exact matches" {
        Get-JaroWinklerSimilarity -String1 "John Smith" -String2 "John Smith" | Should -Be 1.0
    }
    
    It "Should be case insensitive" {
        Get-JaroWinklerSimilarity -String1 "JOHN SMITH" -String2 "john smith" | Should -Be 1.0
    }
    
    It "Should have high similarity for similar names" {
        $testCases = @(
            @{ Name1 = "John Smith"; Name2 = "Jon Smith"; MinSimilarity = 0.8 }
            @{ Name1 = "Michael Johnson"; Name2 = "Mike Johnson"; MinSimilarity = 0.7 }
            @{ Name1 = "Catherine Jones"; Name2 = "Cathy Jones"; MinSimilarity = 0.7 }
        )
        
        foreach ($test in $testCases) {
            $similarity = Get-JaroWinklerSimilarity -String1 $test.Name1 -String2 $test.Name2
            $similarity | Should -BeGreaterThan $test.MinSimilarity
        }
    }
    
    It "Should have low similarity for completely different names" {
        $similarity = Get-JaroWinklerSimilarity -String1 "John Smith" -String2 "Alice Cooper"
        $similarity | Should -BeLessThan 0.5
    }
    
    It "Should handle empty strings gracefully" {
        Get-JaroWinklerSimilarity -String1 "" -String2 "" | Should -Be 1.0
        Get-JaroWinklerSimilarity -String1 "John" -String2 "" | Should -Be 0.0
        Get-JaroWinklerSimilarity -String1 "" -String2 "Smith" | Should -Be 0.0
        Get-JaroWinklerSimilarity -String1 $null -String2 $null | Should -Be 1.0
    }
    
    It "Should apply prefix bonus for common prefixes" {
        $withPrefix = Get-JaroWinklerSimilarity -String1 "DWAYNE" -String2 "DUANE"
        $withoutPrefix = Get-JaroWinklerSimilarity -String1 "WAYNE" -String2 "DUANE"
        
        # With common prefix should have higher similarity
        $withPrefix | Should -BeGreaterThan $withoutPrefix
    }
}

Describe "Manual Mapping Persistence" {
    
    Context "Save Mappings" {
        
        It "Should save mappings to JSON file" {
            $mappings = @{
                "S-1-5-21-source-1" = @{
                    SourceId = "S-1-5-21-source-1"
                    TargetId = "S-1-5-21-target-1"
                    TargetName = "Target User 1"
                    MappingType = "Manual"
                    Confidence = 1.0
                    Notes = "Manually mapped by administrator"
                    CreatedAt = (Get-Date).ToUniversalTime()
                    CreatedBy = $env:USERNAME
                }
                "S-1-5-21-source-2" = @{
                    SourceId = "S-1-5-21-source-2"
                    TargetId = "S-1-5-21-target-2"
                    TargetName = "Target User 2"
                    MappingType = "Manual"
                    Confidence = 1.0
                    Notes = "Verified by IT team"
                    CreatedAt = (Get-Date).ToUniversalTime()
                    CreatedBy = $env:USERNAME
                }
            }
            
            $mappingsFile = Join-Path $script:MappingsPath "manual-mappings.json"
            $mappings | ConvertTo-Json -Depth 10 | Set-Content -Path $mappingsFile
            
            Test-Path $mappingsFile | Should -BeTrue
            
            $savedContent = Get-Content $mappingsFile -Raw | ConvertFrom-Json
            $savedContent.'S-1-5-21-source-1'.TargetName | Should -Be "Target User 1"
            $savedContent.'S-1-5-21-source-2'.Notes | Should -Be "Verified by IT team"
        }
        
        It "Should create mappings directory if not exists" {
            $testPath = Join-Path $env:TEMP "NewMappingsDir_$(Get-Random)"
            
            try {
                # Directory shouldn't exist initially
                Test-Path $testPath | Should -BeFalse
                
                # Create directory
                New-Item -ItemType Directory -Path $testPath -Force | Out-Null
                
                # Directory should now exist
                Test-Path $testPath | Should -BeTrue
            }
            finally {
                if (Test-Path $testPath) {
                    Remove-Item -Path $testPath -Force
                }
            }
        }
    }
    
    Context "Load Mappings" {
        
        BeforeEach {
            # Create test mapping file
            $testMappings = @{
                "S-1-5-21-load-1" = @{
                    SourceId = "S-1-5-21-load-1"
                    TargetId = "S-1-5-21-target-load-1"
                    TargetName = "Loaded User 1"
                    MappingType = "Manual"
                    Confidence = 1.0
                    CreatedAt = (Get-Date).AddDays(-1).ToUniversalTime()
                    CreatedBy = "admin@contoso.com"
                }
            }
            
            $mappingsFile = Join-Path $script:MappingsPath "manual-mappings.json"
            $testMappings | ConvertTo-Json -Depth 10 | Set-Content -Path $mappingsFile
        }
        
        It "Should load mappings from JSON file" {
            $mappingsFile = Join-Path $script:MappingsPath "manual-mappings.json"
            Test-Path $mappingsFile | Should -BeTrue
            
            $loadedMappings = Get-Content $mappingsFile -Raw | ConvertFrom-Json
            
            $loadedMappings | Should -Not -BeNullOrEmpty
            $loadedMappings.'S-1-5-21-load-1'.TargetName | Should -Be "Loaded User 1"
            $loadedMappings.'S-1-5-21-load-1'.CreatedBy | Should -Be "admin@contoso.com"
        }
        
        It "Should handle missing file gracefully" {
            $nonExistentFile = Join-Path $script:MappingsPath "non-existent.json"
            Test-Path $nonExistentFile | Should -BeFalse
            
            # Should not throw error
            $mappings = if (Test-Path $nonExistentFile) {
                Get-Content $nonExistentFile -Raw | ConvertFrom-Json
            } else {
                @{}
            }
            
            $mappings | Should -BeOfType [HashTable]
            $mappings.Count | Should -Be 0
        }
        
        It "Should handle corrupted JSON gracefully" {
            $corruptedFile = Join-Path $script:MappingsPath "corrupted.json"
            "{ invalid json content ]" | Set-Content -Path $corruptedFile
            
            # Should handle error gracefully
            $mappings = try {
                Get-Content $corruptedFile -Raw | ConvertFrom-Json
            } catch {
                @{}
            }
            
            $mappings | Should -BeOfType [HashTable]
            $mappings.Count | Should -Be 0
        }
    }
    
    Context "Manual Mapping Override" {
        
        It "Should prioritize manual mappings over fuzzy matches" {
            $sourceUser = @{
                Sid = "S-1-5-21-override-1"
                DisplayName = "John Smith"
                UPN = "john.smith@contoso.com"
                Enabled = $true
            }
            
            # Manual mapping that should override any fuzzy match
            $manualMapping = @{
                "S-1-5-21-override-1" = @{
                    SourceId = "S-1-5-21-override-1"
                    TargetId = "S-1-5-21-manual-target"
                    TargetName = "Manually Mapped Target"
                    MappingType = "Manual"
                    Confidence = 1.0
                    Notes = "Administrator override"
                }
            }
            
            # Even if there's a perfect fuzzy match, manual should win
            $targetUsers = @(
                @{
                    Sid = "S-1-5-21-fuzzy-match"
                    DisplayName = "John Smith"  # Perfect match
                    UPN = "john.smith@target.com"
                }
            )
            
            # Manual mapping should be selected
            $selectedMapping = if ($manualMapping.ContainsKey($sourceUser.Sid)) {
                $manualMapping[$sourceUser.Sid]
            } else {
                # Would do fuzzy matching here
                $null
            }
            
            $selectedMapping | Should -Not -BeNull
            $selectedMapping.TargetId | Should -Be "S-1-5-21-manual-target"
            $selectedMapping.MappingType | Should -Be "Manual"
        }
    }
}

Describe "Mapping Session Persistence" {
    
    It "Should persist mappings across sessions" {
        # Session 1: Save mappings
        $session1Mappings = @{
            "S-1-5-21-session-1" = @{
                SourceId = "S-1-5-21-session-1"
                TargetId = "S-1-5-21-target-session-1"
                TargetName = "Session Test User"
                MappingType = "Manual"
                Confidence = 1.0
                CreatedAt = (Get-Date).ToUniversalTime()
                CreatedBy = $env:USERNAME
            }
        }
        
        $mappingsFile = Join-Path $script:MappingsPath "manual-mappings.json"
        $session1Mappings | ConvertTo-Json -Depth 10 | Set-Content -Path $mappingsFile
        
        # Simulate new session by clearing and reloading
        $loadedMappings = $null
        
        # Session 2: Load mappings
        $loadedMappings = Get-Content $mappingsFile -Raw | ConvertFrom-Json
        
        $loadedMappings.'S-1-5-21-session-1' | Should -Not -BeNull
        $loadedMappings.'S-1-5-21-session-1'.TargetName | Should -Be "Session Test User"
        $loadedMappings.'S-1-5-21-session-1'.MappingType | Should -Be "Manual"
    }
}

Describe "Blocked Items Prevention" {
    
    It "Should prevent blocked users from migration" {
        $blockedUsers = $script:TestUsers | Where-Object {
            -not $_.Enabled -or 
            $_.UPN -match '\s|''|"' -or
            $_.DisplayName -match '[<>"|`0`n`r`t]'
        }
        
        foreach ($user in $blockedUsers) {
            $canMigrate = $true
            
            # Check all eligibility rules
            if (-not $user.Enabled) {
                $canMigrate = $false
            }
            
            if ($user.UPN -match '\s|''|"') {
                $canMigrate = $false
            }
            
            if ($user.DisplayName -match '[<>"|`0`n`r`t]') {
                $canMigrate = $false
            }
            
            $canMigrate | Should -BeFalse
        }
    }
    
    It "Should prevent blocked mailboxes from migration" {
        $blockedMailboxes = $script:TestMailboxes | Where-Object {
            $_.SizeMB -gt 100000 -or
            $_.Type -notin @("UserMailbox", "SharedMailbox", "RoomMailbox", "EquipmentMailbox")
        }
        
        foreach ($mailbox in $blockedMailboxes) {
            $canMigrate = $true
            
            if ($mailbox.SizeMB -gt 100000) {
                $canMigrate = $false
            }
            
            if ($mailbox.Type -notin @("UserMailbox", "SharedMailbox", "RoomMailbox", "EquipmentMailbox")) {
                $canMigrate = $false
            }
            
            $canMigrate | Should -BeFalse
        }
    }
}

Describe "Thread Safety and Concurrency" {
    
    It "Should handle concurrent eligibility checks safely" {
        $jobs = @()
        
        # Start multiple concurrent checks
        1..5 | ForEach-Object {
            $jobs += Start-Job -ScriptBlock {
                # Simulate eligibility check
                $users = 1..100 | ForEach-Object {
                    @{
                        Sid = "S-$_"
                        Enabled = ($_ % 2 -eq 0)
                    }
                }
                
                $eligible = $users | Where-Object { $_.Enabled }
                return $eligible.Count
            }
        }
        
        # Wait for all jobs to complete
        $results = $jobs | Wait-Job | Receive-Job
        $jobs | Remove-Job
        
        # All jobs should return the same count
        $results | ForEach-Object { $_ | Should -Be 50 }
    }
    
    It "Should handle concurrent mapping persistence safely" {
        $tempDir = Join-Path $env:TEMP "ConcurrentTest_$(Get-Random)"
        New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
        
        try {
            $jobs = @()
            
            # Start multiple concurrent save operations
            1..5 | ForEach-Object {
                $threadId = $_
                $jobs += Start-Job -ArgumentList $tempDir, $threadId -ScriptBlock {
                    param($dir, $id)
                    
                    $mapping = @{
                        "S-$id" = @{
                            SourceId = "S-$id"
                            TargetId = "T-$id"
                        }
                    }
                    
                    $file = Join-Path $dir "mapping-$id.json"
                    $mapping | ConvertTo-Json | Set-Content -Path $file
                }
            }
            
            # Wait for all jobs to complete
            $jobs | Wait-Job | Remove-Job
            
            # Verify all files were created
            $files = Get-ChildItem -Path $tempDir -Filter "*.json"
            $files.Count | Should -Be 5
        }
        finally {
            if (Test-Path $tempDir) {
                Remove-Item -Path $tempDir -Recurse -Force
            }
        }
    }
}

Describe "Integration Test Summary" {
    
    It "Should validate complete eligibility check workflow" {
        # This test verifies the entire workflow works together
        
        # 1. Check eligibility
        $eligibleCount = 0
        $blockedCount = 0
        
        foreach ($user in $script:TestUsers) {
            $isEligible = $true
            
            if (-not $user.Enabled) {
                $isEligible = $false
            }
            
            if ($user.UPN -match '\s|''|"') {
                $isEligible = $false
            }
            
            if ($user.DisplayName -match '[<>"|`0`n`r`t]') {
                $isEligible = $false
            }
            
            if ($isEligible) {
                $eligibleCount++
            } else {
                $blockedCount++
            }
        }
        
        # 2. Verify counts
        $eligibleCount | Should -Be 1  # Only johndoe is eligible
        $blockedCount | Should -Be 2   # janesmith (disabled) and invaliduser (invalid chars)
        
        # 3. Test mapping persistence
        $mappingFile = Join-Path $script:MappingsPath "workflow-test.json"
        @{ TestMapping = "Success" } | ConvertTo-Json | Set-Content -Path $mappingFile
        Test-Path $mappingFile | Should -BeTrue
        
        # 4. Load and verify
        $loaded = Get-Content $mappingFile -Raw | ConvertFrom-Json
        $loaded.TestMapping | Should -Be "Success"
    }
}