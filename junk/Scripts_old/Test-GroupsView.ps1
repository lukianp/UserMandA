# Test Groups View Functionality
Write-Host "Testing Groups View Navigation..." -ForegroundColor Green

# 1. Test ViewRegistry Resolution
Write-Host "`n1. Testing ViewRegistry for Groups..." -ForegroundColor Yellow
$scriptBlock = {
    Add-Type -Path "D:\Scripts\UserMandA\GUI\publish\MandADiscoverySuite.dll"
    
    # Test ViewRegistry
    $registry = [MandADiscoverySuite.Services.ViewRegistry]::Instance
    $isRegistered = $registry.IsViewRegistered("groups")
    Write-Host "   - Groups view registered: $isRegistered"
    
    if ($isRegistered) {
        try {
            $view = $registry.CreateView("groups")
            Write-Host "   - Groups view created successfully: $($view.GetType().Name)"
        }
        catch {
            Write-Host "   - ERROR creating Groups view: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

try {
    & $scriptBlock
}
catch {
    Write-Host "   - ERROR testing ViewRegistry: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test CSV Data Loading
Write-Host "`n2. Testing Groups CSV Data..." -ForegroundColor Yellow
$groupsCsv = "C:\discoverydata\ljpops\Raw\Groups.csv"
if (Test-Path $groupsCsv) {
    $groups = Import-Csv $groupsCsv
    Write-Host "   - Groups.csv exists: $($groups.Count) records found"
    Write-Host "   - Sample group: $($groups[0].DisplayName)"
    
    # Check for expected headers
    $expectedHeaders = @("DisplayName", "GroupType", "MailEnabled", "SecurityEnabled", "Mail", "MemberCount", "OwnerCount", "Visibility", "Description")
    $csvHeaders = $groups[0].PSObject.Properties.Name
    
    foreach ($header in $expectedHeaders) {
        $exists = $header -in $csvHeaders
        $status = if ($exists) { "OK" } else { "MISSING" }
        Write-Host "   - Header '$header': $status"
    }
}
else {
    Write-Host "   - ERROR: Groups.csv not found at $groupsCsv" -ForegroundColor Red
}

# 3. Check Application Status
Write-Host "`n3. Checking Application Status..." -ForegroundColor Yellow
$process = Get-Process -Name "MandADiscoverySuite" -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "   - MA Discovery Suite is running (PID: $($process.Id))"
    Write-Host "   - Memory usage: $([math]::Round($process.WorkingSet64/1MB, 2)) MB"
}
else {
    Write-Host "   - MA Discovery Suite is not running" -ForegroundColor Red
}

# 4. Check Recent Logs
Write-Host "`n4. Checking Recent Logs..." -ForegroundColor Yellow
$logFile = "C:\discoverydata\ljpops\Logs\viewregistry-debug.log"
if (Test-Path $logFile) {
    $recentLogs = Get-Content $logFile | Select-Object -Last 5
    Write-Host "   - Recent ViewRegistry logs:"
    foreach ($log in $recentLogs) {
        Write-Host "     $log"
    }
}

Write-Host "`nGroups View Test Complete!" -ForegroundColor Green