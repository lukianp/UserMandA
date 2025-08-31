# GUI Data Integration Validation Script
# Validates that CSV data is properly displayed in GUI views

$ErrorActionPreference = "Continue"

Write-Host "=== M&A DISCOVERY SUITE - GUI DATA INTEGRATION VALIDATION ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray

# Initialize results
$validationResults = @{
    CSVFiles = @()
    GUIViews = @()
    DataIntegration = @()
    OrphanedData = @()
    MissingViews = @()
}

function Get-CSVFileInfo {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        return $null
    }
    
    $content = Import-Csv $FilePath -ErrorAction SilentlyContinue
    
    return [PSCustomObject]@{
        Path = $FilePath
        Name = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
        RecordCount = if ($content) { $content.Count } else { 0 }
        Columns = if ($content) { $content[0].PSObject.Properties.Name } else { @() }
        Size = (Get-Item $FilePath).Length
        LastWrite = (Get-Item $FilePath).LastWriteTime
    }
}

# Analyze current active CSV files
Write-Host "`n=== ANALYZING CURRENT DISCOVERY DATA ===" -ForegroundColor Cyan
$currentCSVDir = "C:\discoverydata\ljpops\Raw"
$currentCSVFiles = Get-ChildItem "$currentCSVDir\*.csv" -ErrorAction SilentlyContinue

Write-Host "Found $($currentCSVFiles.Count) current CSV files" -ForegroundColor Green

foreach ($csvFile in $currentCSVFiles) {
    $csvInfo = Get-CSVFileInfo -FilePath $csvFile.FullName
    if ($csvInfo) {
        $validationResults.CSVFiles += $csvInfo
        Write-Host "  ✓ $($csvInfo.Name): $($csvInfo.RecordCount) records, $([math]::Round($csvInfo.Size/1KB, 2)) KB" -ForegroundColor Green
    }
}

# Check GUI ViewModels and Views for data binding
Write-Host "`n=== ANALYZING GUI DATA INTEGRATION ===" -ForegroundColor Cyan
$guiViewModels = Get-ChildItem "C:\enterprisediscovery\GUI\ViewModels\*ViewModel.cs" -ErrorAction SilentlyContinue
$guiViews = Get-ChildItem "C:\enterprisediscovery\GUI\Views\*.xaml" -ErrorAction SilentlyContinue

Write-Host "Found $($guiViewModels.Count) ViewModels and $($guiViews.Count) Views" -ForegroundColor Green

# Common data binding patterns to look for
$dataBindingPatterns = @(
    "ObservableCollection",
    "DataGrid",
    "ItemsSource",
    "Import-Csv",
    "\.csv",
    "RawData",
    "discoverydata"
)

# Check ViewModels for CSV data integration
foreach ($viewModel in $guiViewModels) {
    $vmName = [System.IO.Path]::GetFileNameWithoutExtension($viewModel.Name)
    $vmContent = Get-Content $viewModel.FullName -Raw -ErrorAction SilentlyContinue
    
    $dataBindings = @()
    foreach ($pattern in $dataBindingPatterns) {
        if ($vmContent -match $pattern) {
            $dataBindings += $pattern
        }
    }
    
    $validationResults.GUIViews += [PSCustomObject]@{
        Name = $vmName
        Type = "ViewModel"
        Path = $viewModel.FullName
        HasDataBinding = $dataBindings.Count -gt 0
        DataBindingPatterns = $dataBindings
    }
}

# Check Views for data presentation
foreach ($view in $guiViews) {
    $viewName = [System.IO.Path]::GetFileNameWithoutExtension($view.Name)
    $viewContent = Get-Content $view.FullName -Raw -ErrorAction SilentlyContinue
    
    $dataControls = @()
    if ($viewContent -match "DataGrid") { $dataControls += "DataGrid" }
    if ($viewContent -match "ListView") { $dataControls += "ListView" }
    if ($viewContent -match "ItemsSource") { $dataControls += "ItemsSource" }
    if ($viewContent -match "Binding") { $dataControls += "Binding" }
    
    $validationResults.GUIViews += [PSCustomObject]@{
        Name = $viewName
        Type = "View"
        Path = $view.FullName
        HasDataBinding = $dataControls.Count -gt 0
        DataBindingPatterns = $dataControls
    }
}

# Cross-reference CSV files with GUI components
Write-Host "`n=== CROSS-REFERENCING CSV DATA WITH GUI VIEWS ===" -ForegroundColor Cyan
foreach ($csvInfo in $validationResults.CSVFiles) {
    $csvBaseName = $csvInfo.Name.ToLower()
    
    # Look for corresponding ViewModels/Views
    $relatedViews = $validationResults.GUIViews | Where-Object { 
        $_.Name.ToLower() -match $csvBaseName -or 
        $csvBaseName -match $_.Name.ToLower().Replace("viewmodel", "").Replace("view", "")
    }
    
    $integration = [PSCustomObject]@{
        CSVFile = $csvInfo.Name
        CSVPath = $csvInfo.Path
        RecordCount = $csvInfo.RecordCount
        RelatedViews = $relatedViews
        HasGUIIntegration = $relatedViews.Count -gt 0
        IntegrationStatus = if ($relatedViews.Count -gt 0) { "INTEGRATED" } else { "ORPHANED" }
    }
    
    $validationResults.DataIntegration += $integration
    
    if ($integration.HasGUIIntegration) {
        Write-Host "  ✅ $($csvInfo.Name) → $($relatedViews.Count) GUI component(s)" -ForegroundColor Green
    } else {
        Write-Host "  📊 $($csvInfo.Name) → No GUI integration found" -ForegroundColor Yellow
        $validationResults.OrphanedData += $csvInfo
    }
}

# Check for GUI views without corresponding data
foreach ($guiView in $validationResults.GUIViews) {
    if ($guiView.HasDataBinding) {
        $hasCorrespondingData = $validationResults.CSVFiles | Where-Object { 
            $_.Name.ToLower() -match $guiView.Name.ToLower().Replace("viewmodel", "").Replace("view", "")
        }
        
        if (-not $hasCorrespondingData) {
            $validationResults.MissingViews += $guiView
        }
    }
}

# Generate summary report
Write-Host "`n=== VALIDATION SUMMARY ===" -ForegroundColor Cyan
Write-Host "📊 Total CSV Files: $($validationResults.CSVFiles.Count)" -ForegroundColor White
Write-Host "🖥️ GUI Components: $($validationResults.GUIViews.Count)" -ForegroundColor White
Write-Host "✅ Integrated Data: $($validationResults.DataIntegration | Where-Object { $_.HasGUIIntegration }).Count" -ForegroundColor Green
Write-Host "📊 Orphaned Data: $($validationResults.OrphanedData.Count)" -ForegroundColor Yellow
Write-Host "🔍 Views Missing Data: $($validationResults.MissingViews.Count)" -ForegroundColor Yellow

# Calculate data utilization rate
$totalRecords = ($validationResults.CSVFiles | Measure-Object -Property RecordCount -Sum).Sum
$integratedRecords = ($validationResults.DataIntegration | Where-Object { $_.HasGUIIntegration } | Measure-Object -Property RecordCount -Sum).Sum
$utilizationRate = if ($totalRecords -gt 0) { [math]::Round(($integratedRecords / $totalRecords) * 100, 1) } else { 0 }

Write-Host "📈 Total Data Records: $totalRecords" -ForegroundColor Cyan
Write-Host "🎯 Data Utilization Rate: $utilizationRate%" -ForegroundColor $(if ($utilizationRate -ge 80) { "Green" } elseif ($utilizationRate -ge 50) { "Yellow" } else { "Red" })

# Detailed findings
if ($validationResults.OrphanedData.Count -gt 0) {
    Write-Host "`n📊 ORPHANED DATA FILES (No GUI Integration):" -ForegroundColor Yellow
    foreach ($orphan in $validationResults.OrphanedData) {
        Write-Host "  • $($orphan.Name) ($($orphan.RecordCount) records)" -ForegroundColor Yellow
    }
}

if ($validationResults.MissingViews.Count -gt 0) {
    Write-Host "`n🔍 GUI VIEWS WITHOUT DATA:" -ForegroundColor Yellow
    foreach ($missing in $validationResults.MissingViews) {
        Write-Host "  • $($missing.Name) ($($missing.Type))" -ForegroundColor Yellow
    }
}

# Top data sources by record count
Write-Host "`n📈 TOP DATA SOURCES BY RECORD COUNT:" -ForegroundColor Cyan
$topSources = $validationResults.CSVFiles | Sort-Object RecordCount -Descending | Select-Object -First 10
foreach ($source in $topSources) {
    $status = if ($validationResults.DataIntegration | Where-Object { $_.CSVFile -eq $source.Name -and $_.HasGUIIntegration }) { "✅" } else { "📊" }
    Write-Host "  $status $($source.Name): $($source.RecordCount) records" -ForegroundColor White
}

# Export detailed report
$reportPath = "C:\enterprisediscovery\GUI_Data_Integration_Report.json"
$validationResults | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding UTF8
Write-Host "`nDetailed report saved: $reportPath" -ForegroundColor Gray

return $validationResults