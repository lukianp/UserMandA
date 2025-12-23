# Test GUI Database Data Loading
Write-Host "Testing Database Data Loading in GUI..."

# Check if the SqlServers.csv file exists and has the right structure
$sqlServersFile = "C:\discoverydata\ljpops\Raw\SqlServers.csv"
if (Test-Path $sqlServersFile) {
    Write-Host "SqlServers.csv found - checking structure..."
    $content = Get-Content $sqlServersFile -First 2
    Write-Host "Header: $($content[0])"
    Write-Host "Sample: $($content[1])"
    
    # Parse the CSV to check if it matches expected structure
    $csv = Import-Csv $sqlServersFile
    Write-Host "Records found: $($csv.Count)"
    
    # Check for expected columns from GUI
    $expectedColumns = @('Server', 'Instance', 'Version', 'Edition', 'DatabaseCount', 'TotalSizeGB', 'LastSeen', 'Engine')
    $missingColumns = @()
    
    foreach ($column in $expectedColumns) {
        if (-not ($csv[0].PSObject.Properties.Name -contains $column)) {
            $missingColumns += $column
        }
    }
    
    if ($missingColumns.Count -eq 0) {
        Write-Host "✓ All expected columns are present"
        Write-Host "Sample record:"
        $csv[0] | Format-List Server, Instance, Version, Edition, DatabaseCount, TotalSizeGB, LastSeen, Engine
    } else {
        Write-Host "✗ Missing columns: $($missingColumns -join ', ')"
    }
} else {
    Write-Host "✗ SqlServers.csv not found at $sqlServersFile"
}

# Start the GUI and immediately check if it loads the database view
Write-Host "`nStarting GUI to test database view..."
try {
    $guiPath = "D:\Scripts\UserMandA\GUI\publish\MandADiscoverySuite.exe"
    if (Test-Path $guiPath) {
        Write-Host "Starting GUI from: $guiPath"
        Start-Process -FilePath $guiPath -WindowStyle Normal
        Write-Host "GUI started. Please navigate to the Databases view and check if data loads correctly."
        Write-Host "Look for:"
        Write-Host "  1. No red error banners"
        Write-Host "  2. Data grid populated with SQL Server instances"
        Write-Host "  3. Correct counts in header"
    } else {
        Write-Host "✗ GUI executable not found at $guiPath"
    }
} catch {
    Write-Host "✗ Error starting GUI: $($_.Exception.Message)"
}