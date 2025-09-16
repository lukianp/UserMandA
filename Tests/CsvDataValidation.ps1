# CSV Data Validation Test for MandADiscoverySuite
# Purpose: Validate all CSV data paths and file accessibility

[CmdletBinding()]
param()

$ErrorActionPreference = 'Continue'

function Test-CsvDataPaths {
    Write-Host "`n=== CSV Data Path Validation ===" -ForegroundColor Yellow

    $basePath = "C:\discoverydata\ljpops\RawData"
    $results = @{
        BasePath = @{
            Path = $basePath
            Exists = Test-Path $basePath
        }
        Subfolders = @{}
        CsvFiles = @{}
        Issues = @()
    }

    Write-Host "Base path: $basePath" -ForegroundColor Cyan

    if (-not (Test-Path $basePath)) {
        Write-Host "ERROR: Base data path does not exist!" -ForegroundColor Red
        $results.Issues += "Base data path missing: $basePath"

        # Try to create it
        try {
            New-Item -Path $basePath -ItemType Directory -Force | Out-Null
            Write-Host "Created base data path" -ForegroundColor Green
            $results.BasePath.Exists = $true
        }
        catch {
            Write-Host "Failed to create base data path: $_" -ForegroundColor Red
            return $results
        }
    }

    # Check for expected discovery data folders based on ModuleRegistry
    $expectedFolders = @(
        "ActiveDirectory",
        "Azure",
        "Exchange",
        "Teams",
        "SharePoint",
        "NetworkInfrastructure",
        "SQLServer",
        "FileServer",
        "VMware",
        "Applications",
        "Security",
        "Certificates",
        "Storage",
        "Licensing",
        "Compliance"
    )

    Write-Host "`nChecking discovery data folders:" -ForegroundColor Cyan

    foreach ($folder in $expectedFolders) {
        $folderPath = Join-Path $basePath $folder
        $exists = Test-Path $folderPath

        $results.Subfolders[$folder] = @{
            Path = $folderPath
            Exists = $exists
            CsvCount = 0
        }

        if ($exists) {
            $csvFiles = Get-ChildItem -Path $folderPath -Filter "*.csv" -ErrorAction SilentlyContinue
            $results.Subfolders[$folder].CsvCount = $csvFiles.Count

            Write-Host "  [OK] $folder ($($csvFiles.Count) CSV files)" -ForegroundColor Green

            # Check individual CSV files
            foreach ($csv in $csvFiles | Select-Object -First 3) {
                $csvKey = "$folder\$($csv.Name)"
                $results.CsvFiles[$csvKey] = Test-CsvFile -FilePath $csv.FullName
            }
        }
        else {
            Write-Host "  [MISSING] $folder" -ForegroundColor Yellow

            # Create empty folder for testing
            try {
                New-Item -Path $folderPath -ItemType Directory -Force | Out-Null
                Write-Host "    Created empty folder" -ForegroundColor Gray
            }
            catch {
                $results.Issues += "Cannot create folder: $folderPath"
            }
        }
    }

    return $results
}

function Test-CsvFile {
    param([string]$FilePath)

    try {
        $fileInfo = Get-Item $FilePath
        $result = @{
            Size = $fileInfo.Length
            LastModified = $fileInfo.LastWriteTime
            IsValid = $false
            RowCount = 0
            ColumnCount = 0
            Headers = @()
            Error = $null
        }

        # Try to read and validate CSV structure
        $content = Get-Content $FilePath -TotalCount 10 -ErrorAction Stop

        if ($content.Count -gt 0) {
            $headers = $content[0] -split ','
            $result.Headers = $headers
            $result.ColumnCount = $headers.Count

            # Count total rows (approximation for large files)
            if ($fileInfo.Length -lt 1MB) {
                $allContent = Get-Content $FilePath -ErrorAction Stop
                $result.RowCount = $allContent.Count - 1  # Exclude header
            }
            else {
                $result.RowCount = "Large file (estimated: $([math]::Round($fileInfo.Length / 100))+ rows)"
            }

            $result.IsValid = $true
        }

        return $result
    }
    catch {
        return @{
            Error = $_.Exception.Message
            IsValid = $false
        }
    }
}

function Test-DatabaseConnectivity {
    Write-Host "`n=== Database Connectivity Test ===" -ForegroundColor Yellow

    # Check if application uses database (based on connection strings in config)
    $configFiles = @(
        "C:\enterprisediscovery\MandADiscoverySuite.exe.config",
        "C:\enterprisediscovery\app.config",
        "C:\enterprisediscovery\appsettings.json"
    )

    $hasDatabase = $false

    foreach ($config in $configFiles) {
        if (Test-Path $config) {
            $content = Get-Content $config -Raw -ErrorAction SilentlyContinue
            if ($content -match "connectionStrings|ConnectionString|Database") {
                Write-Host "Database configuration found in: $(Split-Path $config -Leaf)" -ForegroundColor Cyan
                $hasDatabase = $true
            }
        }
    }

    if (-not $hasDatabase) {
        Write-Host "No database configuration detected - using file-based data" -ForegroundColor Green
        return @{ Status = "No database required" }
    }

    # If database config exists, this would need more specific testing
    Write-Host "Database configuration detected but connectivity test not implemented" -ForegroundColor Yellow
    return @{ Status = "Database config found but not tested" }
}

function Test-EnvironmentVariables {
    Write-Host "`n=== Environment Variables Test ===" -ForegroundColor Yellow

    $envVars = @{
        MANDA_DISCOVERY_PATH = [Environment]::GetEnvironmentVariable("MANDA_DISCOVERY_PATH")
        TEMP = [Environment]::GetEnvironmentVariable("TEMP")
        USERPROFILE = [Environment]::GetEnvironmentVariable("USERPROFILE")
    }

    foreach ($var in $envVars.GetEnumerator()) {
        if ($var.Value) {
            Write-Host "  $($var.Key) = $($var.Value)" -ForegroundColor Green
        }
        else {
            Write-Host "  $($var.Key) = Not set" -ForegroundColor Yellow
        }
    }

    return $envVars
}

function Test-PermissionsAndAccess {
    Write-Host "`n=== Permissions and Access Test ===" -ForegroundColor Yellow

    $testPaths = @(
        "C:\discoverydata",
        "C:\discoverydata\ljpops",
        "C:\discoverydata\ljpops\RawData",
        "C:\discoverydata\ljpops\Logs",
        "C:\enterprisediscovery"
    )

    $permissionResults = @{}

    foreach ($path in $testPaths) {
        $result = @{
            Exists = Test-Path $path
            CanRead = $false
            CanWrite = $false
            Error = $null
        }

        try {
            if ($result.Exists) {
                # Test read access
                $null = Get-ChildItem $path -ErrorAction Stop
                $result.CanRead = $true

                # Test write access
                $testFile = Join-Path $path "test_write_$(Get-Random).tmp"
                "test" | Out-File $testFile -ErrorAction Stop
                Remove-Item $testFile -ErrorAction SilentlyContinue
                $result.CanWrite = $true

                Write-Host "  [OK] $path (Read/Write)" -ForegroundColor Green
            }
            else {
                Write-Host "  [MISSING] $path" -ForegroundColor Yellow
            }
        }
        catch {
            $result.Error = $_.Exception.Message
            Write-Host "  [ERROR] $path - $($_.Exception.Message)" -ForegroundColor Red
        }

        $permissionResults[$path] = $result
    }

    return $permissionResults
}

function Generate-CsvValidationReport {
    param($CsvResults, $DbResults, $EnvVars, $Permissions)

    Write-Host "`n=== CSV DATA VALIDATION REPORT ===" -ForegroundColor Yellow

    $report = @"
CSV Data Validation Report
===========================
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

BASE DATA PATH
--------------
Path: $($CsvResults.BasePath.Path)
Exists: $($CsvResults.BasePath.Exists)

DISCOVERY FOLDERS
-----------------
Total Expected: $($CsvResults.Subfolders.Count)
Present: $(($CsvResults.Subfolders.Values | Where-Object { $_.Exists }).Count)
Missing: $(($CsvResults.Subfolders.Values | Where-Object { -not $_.Exists }).Count)

CSV FILES FOUND
---------------
"@

    $totalCsvFiles = ($CsvResults.Subfolders.Values | Measure-Object -Property CsvCount -Sum).Sum
    $report += "Total CSV files: $totalCsvFiles`n`n"

    foreach ($folder in $CsvResults.Subfolders.GetEnumerator()) {
        if ($folder.Value.Exists) {
            $report += "$($folder.Key): $($folder.Value.CsvCount) files`n"
        }
    }

    if ($CsvResults.Issues.Count -gt 0) {
        $report += @"

ISSUES DETECTED
---------------
$($CsvResults.Issues | ForEach-Object { "- $_" } | Out-String)
"@
    }

    $report += @"

PERMISSIONS TEST
----------------
"@

    foreach ($perm in $Permissions.GetEnumerator()) {
        $status = if ($perm.Value.CanRead -and $perm.Value.CanWrite) { "OK" }
                 elseif ($perm.Value.CanRead) { "READ-ONLY" }
                 else { "NO-ACCESS" }
        $report += "$($perm.Key): $status`n"
    }

    $report += @"

ROOT CAUSE ASSESSMENT
---------------------
"@

    if ($totalCsvFiles -eq 0) {
        $report += @"
No CSV data files found. This may cause the application to:
1. Display empty data grids
2. Show "No data" messages
3. Fail data loading operations

This is not necessarily a critical error if the application is designed
to handle empty data gracefully.
"@
    }
    else {
        $report += @"
CSV data files are present. Data loading should work correctly.
Found $totalCsvFiles CSV files across discovery categories.
"@
    }

    $criticalIssues = $CsvResults.Issues | Where-Object { $_ -match "Base data path missing|Cannot create folder" }
    if ($criticalIssues.Count -gt 0) {
        $report += @"

CRITICAL: Data path issues detected that may prevent application startup.
"@
    }

    $report | Out-File "$PSScriptRoot\csv_validation_report.txt" -Encoding UTF8
    Write-Host "`nReport saved to: $PSScriptRoot\csv_validation_report.txt" -ForegroundColor Green

    # Return validation summary
    return @{
        status = if ($CsvResults.Issues.Count -eq 0) { "PASS" } else { "PARTIAL" }
        csv_files_found = $totalCsvFiles
        folders_present = ($CsvResults.Subfolders.Values | Where-Object { $_.Exists }).Count
        critical_issues = $criticalIssues.Count
    }
}

# Main execution
Write-Host "=== MandADiscoverySuite CSV Data Validation ===" -ForegroundColor Yellow

$csvResults = Test-CsvDataPaths
$dbResults = Test-DatabaseConnectivity
$envVars = Test-EnvironmentVariables
$permissions = Test-PermissionsAndAccess

$summary = Generate-CsvValidationReport -CsvResults $csvResults -DbResults $dbResults -EnvVars $envVars -Permissions $permissions

# Output for automation
$summary | ConvertTo-Json -Depth 2 | Out-File "$PSScriptRoot\csv_validation_status.json" -Encoding UTF8

if ($summary.status -eq "PASS") {
    Write-Host "`nCSV validation PASSED" -ForegroundColor Green
}
else {
    Write-Host "`nCSV validation completed with issues - see report" -ForegroundColor Yellow
}