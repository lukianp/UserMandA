# Simple GUI Data Integration Validation
$ErrorActionPreference = "Continue"

Write-Host "=== GUI DATA INTEGRATION VALIDATION ===" -ForegroundColor Cyan

# Count current CSV files
$csvDir = "C:\discoverydata\ljpops\Raw"
$csvFiles = Get-ChildItem "$csvDir\*.csv" -ErrorAction SilentlyContinue
$totalRecords = 0

Write-Host "Found $($csvFiles.Count) current CSV files" -ForegroundColor Green

# Analyze each CSV file
foreach ($csv in $csvFiles) {
    try {
        $data = Import-Csv $csv.FullName
        $recordCount = if ($data) { $data.Count } else { 0 }
        $totalRecords += $recordCount
        $sizeKB = [math]::Round($csv.Length / 1KB, 2)
        
        Write-Host "  $($csv.BaseName): $recordCount records, $sizeKB KB" -ForegroundColor White
    }
    catch {
        Write-Host "  $($csv.BaseName): ERROR reading file" -ForegroundColor Red
    }
}

Write-Host "`nTotal Data Records: $totalRecords" -ForegroundColor Cyan

# Check GUI components
$viewModels = Get-ChildItem "C:\enterprisediscovery\GUI\ViewModels\*.cs" -ErrorAction SilentlyContinue
$views = Get-ChildItem "C:\enterprisediscovery\GUI\Views\*.xaml" -ErrorAction SilentlyContinue

Write-Host "GUI Components: $($viewModels.Count) ViewModels, $($views.Count) Views" -ForegroundColor Green

# Simple data utilization assessment
$dataFiles = @(
    "Applications", "Groups", "Users", "Tenant", "SharePointSites", 
    "MicrosoftTeams", "ServicePrincipals", "DirectoryRoles"
)

$utilizedData = 0
foreach ($dataFile in $dataFiles) {
    $csvExists = $csvFiles | Where-Object { $_.BaseName -eq $dataFile }
    if ($csvExists) {
        $utilizedData++
        Write-Host "  FOUND: $dataFile" -ForegroundColor Green
    } else {
        Write-Host "  MISSING: $dataFile" -ForegroundColor Yellow
    }
}

$utilizationRate = [math]::Round(($utilizedData / $dataFiles.Count) * 100, 1)
Write-Host "`nCore Data Utilization: $utilizationRate%" -ForegroundColor $(if ($utilizationRate -ge 80) { "Green" } else { "Yellow" })

# Overall assessment
if ($totalRecords -gt 0 -and $utilizationRate -ge 50) {
    Write-Host "`nOVERALL STATUS: DATA AVAILABLE FOR GUI INTEGRATION" -ForegroundColor Green
} elseif ($totalRecords -gt 0) {
    Write-Host "`nOVERALL STATUS: PARTIAL DATA UTILIZATION" -ForegroundColor Yellow
} else {
    Write-Host "`nOVERALL STATUS: NO DATA DETECTED" -ForegroundColor Red
}