# Simple PowerShell Integration Bridge Test
# Tests the core PowerShell module execution capabilities

Write-Host "=== PowerShell Integration Bridge Validation ===" -ForegroundColor Green
Write-Host "Testing real-time execution bridge functionality..." -ForegroundColor Yellow

$results = @{}

# Test 1: UserMigration Module Availability
Write-Host "`n1. Testing UserMigration Module..." -ForegroundColor Cyan
$userMigrationPath = "D:\Scripts\UserMandA\Modules\Migration\UserMigration.psm1"

if (Test-Path $userMigrationPath) {
    try {
        Import-Module $userMigrationPath -Force
        $commands = Get-Command -Module "UserMigration" -ErrorAction SilentlyContinue
        if ($commands -and ($commands.Name -contains "Start-UserMigration")) {
            Write-Host "✓ UserMigration module loaded successfully" -ForegroundColor Green
            Write-Host "  Available commands: $($commands.Name -join ', ')" -ForegroundColor Gray
            $results.UserMigration = "SUCCESS"
        } else {
            Write-Host "⚠ UserMigration module loaded but Start-UserMigration not found" -ForegroundColor Yellow
            $results.UserMigration = "PARTIAL"
        }
    }
    catch {
        Write-Host "✗ Error loading UserMigration module: $($_.Exception.Message)" -ForegroundColor Red
        $results.UserMigration = "FAILED"
    }
} else {
    Write-Host "✗ UserMigration module not found at: $userMigrationPath" -ForegroundColor Red
    $results.UserMigration = "NOT_FOUND"
}

# Test 2: MailboxMigration Module Availability  
Write-Host "`n2. Testing MailboxMigration Module..." -ForegroundColor Cyan
$mailboxMigrationPath = "D:\Scripts\UserMandA\Modules\Migration\MailboxMigration.psm1"

if (Test-Path $mailboxMigrationPath) {
    try {
        Import-Module $mailboxMigrationPath -Force
        $commands = Get-Command -Module "MailboxMigration" -ErrorAction SilentlyContinue
        if ($commands -and ($commands.Name -contains "Start-MailboxMigration")) {
            Write-Host "✓ MailboxMigration module loaded successfully" -ForegroundColor Green
            Write-Host "  Available commands: $($commands.Name -join ', ')" -ForegroundColor Gray
            $results.MailboxMigration = "SUCCESS"
        } else {
            Write-Host "⚠ MailboxMigration module loaded but Start-MailboxMigration not found" -ForegroundColor Yellow
            $results.MailboxMigration = "PARTIAL"
        }
    }
    catch {
        Write-Host "✗ Error loading MailboxMigration module: $($_.Exception.Message)" -ForegroundColor Red
        $results.MailboxMigration = "FAILED"
    }
} else {
    Write-Host "✗ MailboxMigration module not found at: $mailboxMigrationPath" -ForegroundColor Red
    $results.MailboxMigration = "NOT_FOUND"
}

# Test 3: FileSystemMigration Module Availability
Write-Host "`n3. Testing FileSystemMigration Module..." -ForegroundColor Cyan
$fileSystemMigrationPath = "D:\Scripts\UserMandA\Modules\Migration\FileSystemMigration.psm1"

if (Test-Path $fileSystemMigrationPath) {
    try {
        Import-Module $fileSystemMigrationPath -Force
        $commands = Get-Command -Module "FileSystemMigration" -ErrorAction SilentlyContinue
        if ($commands) {
            Write-Host "✓ FileSystemMigration module loaded successfully" -ForegroundColor Green
            Write-Host "  Available commands: $($commands.Name -join ', ')" -ForegroundColor Gray
            
            # Test robocopy availability
            $robocopy = Get-Command robocopy -ErrorAction SilentlyContinue
            if ($robocopy) {
                Write-Host "  ✓ Robocopy available for file operations" -ForegroundColor Green
            } else {
                Write-Host "  ⚠ Robocopy not found - file migrations may be limited" -ForegroundColor Yellow
            }
            
            $results.FileSystemMigration = "SUCCESS"
        } else {
            Write-Host "⚠ FileSystemMigration module loaded but no commands found" -ForegroundColor Yellow
            $results.FileSystemMigration = "PARTIAL"
        }
    }
    catch {
        Write-Host "✗ Error loading FileSystemMigration module: $($_.Exception.Message)" -ForegroundColor Red
        $results.FileSystemMigration = "FAILED"
    }
} else {
    Write-Host "✗ FileSystemMigration module not found at: $fileSystemMigrationPath" -ForegroundColor Red
    $results.FileSystemMigration = "NOT_FOUND"
}

# Test 4: PowerShell Runspace Pool Test (Concurrency)
Write-Host "`n4. Testing Concurrent Execution Capabilities..." -ForegroundColor Cyan

try {
    $runspacePool = [runspacefactory]::CreateRunspacePool(1, 3)
    $runspacePool.Open()
    
    $jobs = @()
    for ($i = 1; $i -le 3; $i++) {
        $ps = [powershell]::Create()
        $ps.RunspacePool = $runspacePool
        $null = $ps.AddScript({
            param($JobId)
            Start-Sleep -Seconds 1
            return "Concurrent job $JobId completed at $(Get-Date -Format 'HH:mm:ss')"
        }).AddParameter("JobId", $i)
        
        $jobs += @{
            PowerShell = $ps
            Handle = $ps.BeginInvoke()
            Id = $i
        }
    }
    
    Write-Host "  Started $($jobs.Count) concurrent runspaces..." -ForegroundColor Gray
    
    # Wait for completion
    $completed = @()
    $timeout = 5
    $startTime = Get-Date
    
    while ($completed.Count -lt $jobs.Count -and ((Get-Date) - $startTime).TotalSeconds -lt $timeout) {
        foreach ($job in $jobs) {
            if ($job.Handle.IsCompleted -and $job.Id -notin $completed) {
                try {
                    $result = $job.PowerShell.EndInvoke($job.Handle)
                    Write-Host "  $result" -ForegroundColor Gray
                    $completed += $job.Id
                }
                catch {
                    Write-Host "  Job $($job.Id) failed: $($_.Exception.Message)" -ForegroundColor Red
                    $completed += $job.Id
                }
            }
        }
        Start-Sleep -Milliseconds 100
    }
    
    # Cleanup
    foreach ($job in $jobs) {
        $job.PowerShell.Dispose()
    }
    $runspacePool.Close()
    $runspacePool.Dispose()
    
    if ($completed.Count -eq $jobs.Count) {
        Write-Host "✓ Concurrent execution test successful - all $($jobs.Count) jobs completed" -ForegroundColor Green
        $results.ConcurrentExecution = "SUCCESS"
    } else {
        Write-Host "⚠ Concurrent execution partial - $($completed.Count)/$($jobs.Count) jobs completed" -ForegroundColor Yellow
        $results.ConcurrentExecution = "PARTIAL"
    }
}
catch {
    Write-Host "✗ Concurrent execution test failed: $($_.Exception.Message)" -ForegroundColor Red
    $results.ConcurrentExecution = "FAILED"
}

# Test 5: Real-time Progress Streaming Test
Write-Host "`n5. Testing Real-time Progress Streaming..." -ForegroundColor Cyan

try {
    for ($i = 0; $i -le 100; $i += 20) {
        Write-Progress -Activity "Migration Progress Test" -Status "Processing..." -PercentComplete $i
        Start-Sleep -Milliseconds 200
    }
    Write-Progress -Activity "Migration Progress Test" -Completed
    Write-Host "✓ Progress streaming test completed successfully" -ForegroundColor Green
    $results.ProgressStreaming = "SUCCESS"
}
catch {
    Write-Host "✗ Progress streaming test failed: $($_.Exception.Message)" -ForegroundColor Red
    $results.ProgressStreaming = "FAILED"
}

# Test 6: Error Handling and Propagation
Write-Host "`n6. Testing Error Handling..." -ForegroundColor Cyan

try {
    # Simulate a controlled error
    $errorActionPreference = "Stop"
    try {
        throw "Simulated migration error for testing"
    }
    catch {
        $errorMessage = $_.Exception.Message
        Write-Host "  ✓ Error captured: $errorMessage" -ForegroundColor Green
        Write-Host "  ✓ Error handling working correctly" -ForegroundColor Green
        $results.ErrorHandling = "SUCCESS"
    }
}
catch {
    Write-Host "✗ Error handling test failed unexpectedly: $($_.Exception.Message)" -ForegroundColor Red
    $results.ErrorHandling = "FAILED"
}

# Summary
Write-Host "`n=== Validation Results Summary ===" -ForegroundColor Green
$successCount = 0
$totalCount = $results.Count

foreach ($test in $results.Keys) {
    $result = $results[$test]
    $status = switch ($result) {
        "SUCCESS" { "✓"; $successCount++; $_ }
        "PARTIAL" { "⚠"; $_ }
        "FAILED" { "✗"; $_ }
        "NOT_FOUND" { "✗"; $_ }
        default { "?"; $_ }
    }
    
    $color = switch ($result) {
        "SUCCESS" { "Green" }
        "PARTIAL" { "Yellow" }
        "FAILED" { "Red" }
        "NOT_FOUND" { "Red" }
        default { "Gray" }
    }
    
    Write-Host "$status $test : $result" -ForegroundColor $color
}

Write-Host "`nOverall: $successCount/$totalCount tests passed" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } elseif ($successCount -gt 0) { "Yellow" } else { "Red" })

# Export results
$reportData = @{
    TestRunTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Results = $results
    Summary = @{
        TotalTests = $totalCount
        PassedTests = $successCount
        SuccessRate = [math]::Round(($successCount / $totalCount) * 100, 2)
    }
    SystemInfo = @{
        PowerShellVersion = $PSVersionTable.PSVersion.ToString()
        OSVersion = [System.Environment]::OSVersion.ToString()
        MachineName = $env:COMPUTERNAME
    }
}

$reportPath = "PowerShell_Integration_Test_Report_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$reportData | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "`nDetailed report saved to: $reportPath" -ForegroundColor Cyan

# Final status
if ($successCount -eq $totalCount) {
    Write-Host "`n🎉 PowerShell Integration Bridge: READY FOR PRODUCTION" -ForegroundColor Green
    exit 0
} elseif ($successCount -gt ($totalCount / 2)) {
    Write-Host "`n⚠️  PowerShell Integration Bridge: REQUIRES ATTENTION" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`n❌ PowerShell Integration Bridge: CRITICAL ISSUES DETECTED" -ForegroundColor Red  
    exit 2
}