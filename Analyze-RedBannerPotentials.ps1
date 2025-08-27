
param(
    [string]$OutputFile = "red_banner_analysis.txt"
)

# Red Banner Potential Analysis Script
# Analyzes XAML files and ViewModels to predict binding errors and red banner issues

Write-Host "Analyzing potential red banner issues in M&A Discovery Suite..." -ForegroundColor Green

$results = @()
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

function Add-Analysis {
    param($ComponentType, $ComponentName, $IssueType, $Description, $Severity = "Medium", $RecommendedFix = "")
    
    $analysis = [PSCustomObject]@{
        Timestamp = $timestamp
        ComponentType = $ComponentType
        ComponentName = $ComponentName
        IssueType = $IssueType
        Description = $Description
        Severity = $Severity
        RecommendedFix = $RecommendedFix
    }
    $script:results += $analysis
    
    $severityColor = switch ($Severity) {
        "High" { "Red" }
        "Medium" { "Yellow" }
        "Low" { "Green" }
        default { "White" }
    }
    
    Write-Host "[$ComponentName] $IssueType - $Severity" -ForegroundColor $severityColor
}

# Analyze XAML Files for Binding Issues
Write-Host "`nAnalyzing XAML Files for Binding Issues:" -ForegroundColor Cyan

$xamlFiles = Get-ChildItem -Path "D:\Scripts\UserMandA\GUI\Views" -Filter "*.xaml" -Recurse

foreach ($xamlFile in $xamlFiles) {
    $xamlContent = Get-Content $xamlFile.FullName -Raw
    $viewName = $xamlFile.BaseName
    
    # Check for common binding patterns that might cause red banners
    
    # Check for Binding without Path or incorrect syntax
    if ($xamlContent -match 'Binding\s*=\s*"[^"]*"' -and $xamlContent -match 'Binding\s*=\s*""') {
        Add-Analysis "XAML" $viewName "Empty Binding" "Empty binding expression found" "High" "Specify proper binding path"
    }
    
    # Check for DataGrid column bindings to potentially missing properties
    $dataGridMatches = [regex]::Matches($xamlContent, '<DataGridTextColumn[^>]*Binding="{Binding ([^}]*)}')
    foreach ($match in $dataGridMatches) {
        $bindingPath = $match.Groups[1].Value
        if ($bindingPath -match '(Id|Name|Status|Type|Count|Date|Description)$') {
            # These are common property names that might not exist in data models
            Add-Analysis "XAML" $viewName "DataGrid Binding" "Potential missing property: $bindingPath" "Medium" "Verify property exists in data model"
        }
    }
    
    # Check for ItemsSource bindings to collections
    $itemsSourceMatches = [regex]::Matches($xamlContent, 'ItemsSource="{Binding ([^}]*)}')
    foreach ($match in $itemsSourceMatches) {
        $collectionName = $match.Groups[1].Value
        if ($collectionName -notmatch 'Collection$' -and $collectionName -ne 'Items') {
            Add-Analysis "XAML" $viewName "ItemsSource Binding" "Non-standard collection binding: $collectionName" "Low" "Consider using ObservableCollection naming"
        }
    }
}

# Analyze ViewModels for potential issues
Write-Host "`nAnalyzing ViewModels for Potential Issues:" -ForegroundColor Cyan

$viewModelFiles = Get-ChildItem -Path "D:\Scripts\UserMandA\GUI\ViewModels" -Filter "*ViewModel*.cs" -Recurse

foreach ($vmFile in $viewModelFiles) {
    $vmContent = Get-Content $vmFile.FullName -Raw
    $vmName = $vmFile.BaseName
    
    # Check for ObservableCollection usage
    if ($vmContent -match 'ObservableCollection<' -and $vmContent -notmatch 'OnPropertyChanged') {
        Add-Analysis "ViewModel" $vmName "ObservableCollection" "ObservableCollection used but PropertyChanged might not be implemented properly" "Medium" "Ensure INotifyPropertyChanged is implemented"
    }
    
    # Check for async methods that might not handle exceptions
    $asyncMatches = [regex]::Matches($vmContent, 'public\s+async\s+Task\s+(\w+)')
    foreach ($match in $asyncMatches) {
        $methodName = $match.Groups[1].Value
        if ($vmContent -notmatch "try\s*{[\s\S]*?$methodName" -and $vmContent -notmatch "catch") {
            Add-Analysis "ViewModel" $vmName "Async Exception Handling" "Async method $methodName may lack exception handling" "High" "Add try-catch blocks to async methods"
        }
    }
    
    # Check for potential null reference issues
    if ($vmContent -match '\.Where\(' -and $vmContent -notmatch 'null') {
        Add-Analysis "ViewModel" $vmName "Null Reference" "LINQ operations without null checks detected" "Medium" "Add null checks before LINQ operations"
    }
}

# Check CSV Data Service for common file path issues
Write-Host "`nAnalyzing CSV Data Service:" -ForegroundColor Cyan

$csvServicePath = "D:\Scripts\UserMandA\GUI\Services\CsvDataServiceNew.cs"
if (Test-Path $csvServicePath) {
    $csvContent = Get-Content $csvServicePath -Raw
    
    # Check for hardcoded paths
    if ($csvContent -match '@"([C-Z]:\\[^"]*)"') {
        Add-Analysis "Service" "CsvDataServiceNew" "Hardcoded Paths" "Hardcoded file paths detected - may cause file not found errors" "High" "Use configurable paths or environment variables"
    }
    
    # Check for file existence validation
    if ($csvContent -notmatch 'File\.Exists' -and $csvContent -match 'StreamReader') {
        Add-Analysis "Service" "CsvDataServiceNew" "File Validation" "Files opened without existence check" "Medium" "Add File.Exists validation before opening"
    }
}

# Analyze test data availability
Write-Host "`nAnalyzing Test Data Availability:" -ForegroundColor Cyan

$dataPath = "C:\discoverydata\ljpops\Raw"
$testDataFiles = @(
    "Users.csv",
    "Groups.csv", 
    "Applications.csv",
    "Infrastructure.csv",
    "FileServers.csv",
    "Databases.csv",
    "Reports.csv",
    "GPO_GroupPolicies.csv"
)

foreach ($file in $testDataFiles) {
    $filePath = Join-Path $dataPath $file
    if (-not (Test-Path $filePath)) {
        Add-Analysis "Data" $file "Missing File" "Required data file not found at expected location" "High" "Create or copy test data file"
    } else {
        # Check if file has content
        $content = Get-Content $filePath -TotalCount 2
        if ($content.Count -lt 2) {
            Add-Analysis "Data" $file "Empty File" "Data file exists but appears empty or has no data rows" "Medium" "Populate file with test data"
        }
    }
}

# Check for Views that might reference non-existent ViewModels
Write-Host "`nAnalyzing View-ViewModel Relationships:" -ForegroundColor Cyan

$viewFiles = Get-ChildItem -Path "D:\Scripts\UserMandA\GUI\Views" -Filter "*.xaml.cs" -Recurse

foreach ($viewFile in $viewFiles) {
    $viewContent = Get-Content $viewFile.FullName -Raw
    $viewName = $viewFile.BaseName -replace '\.xaml$', ''
    
    # Look for ViewModel instantiation
    $vmMatches = [regex]::Matches($viewContent, 'new\s+(\w+ViewModel)\s*\(')
    foreach ($match in $vmMatches) {
        $vmName = $match.Groups[1].Value
        $vmPath = "D:\Scripts\UserMandA\GUI\ViewModels\$vmName.cs"
        if (-not (Test-Path $vmPath)) {
            Add-Analysis "View" $viewName "Missing ViewModel" "References ViewModel $vmName which doesn't exist" "High" "Create missing ViewModel or fix reference"
        }
    }
    
    # Check for SimpleServiceLocator usage (which is obsolete)
    if ($viewContent -match 'SimpleServiceLocator') {
        Add-Analysis "View" $viewName "Obsolete Service" "Uses obsolete SimpleServiceLocator" "Medium" "Replace with proper dependency injection"
    }
}

# Generate comprehensive report
$reportContent = @"
M&A DISCOVERY SUITE - RED BANNER POTENTIAL ANALYSIS
==================================================
Generated: $timestamp

ANALYSIS METHODOLOGY:
--------------------
1. Static analysis of XAML files for binding issues
2. Code analysis of ViewModels for common error patterns
3. Data availability verification
4. Service configuration validation
5. View-ViewModel relationship verification

FINDINGS SUMMARY:
----------------
"@

$severityGroups = $results | Group-Object Severity
foreach ($group in $severityGroups) {
    $reportContent += "`n$($group.Name) Severity Issues: $($group.Count)"
}

$reportContent += "`n`nDETAILED FINDINGS:"
$reportContent += "`n" + ("=" * 50)

foreach ($result in $results | Sort-Object Severity, ComponentName) {
    $reportContent += "`n`n[$($result.Severity)] $($result.ComponentType) - $($result.ComponentName)"
    $reportContent += "`nIssue: $($result.IssueType)"
    $reportContent += "`nDescription: $($result.Description)"
    if ($result.RecommendedFix) {
        $reportContent += "`nRecommended Fix: $($result.RecommendedFix)"
    }
}

$reportContent += "`n`nPRIORITIZED ACTION ITEMS:"
$reportContent += "`n" + ("=" * 50)

$highPriorityItems = $results | Where-Object { $_.Severity -eq "High" }
$reportContent += "`n`nHIGH PRIORITY (Fix Immediately):"
foreach ($item in $highPriorityItems) {
    $reportContent += "`n• $($item.ComponentName): $($item.IssueType) - $($item.Description)"
}

$mediumPriorityItems = $results | Where-Object { $_.Severity -eq "Medium" }
$reportContent += "`n`nMEDIUM PRIORITY (Address Soon):"
foreach ($item in $mediumPriorityItems) {
    $reportContent += "`n• $($item.ComponentName): $($item.IssueType) - $($item.Description)"
}

$reportContent += "`n`nTESTING RECOMMENDATIONS:"
$reportContent += "`n" + ("=" * 50)
$reportContent += "`n1. Focus manual testing on components with HIGH severity issues"
$reportContent += "`n2. Pay special attention to DataGrid bindings and missing properties"
$reportContent += "`n3. Verify ObservableCollection updates trigger UI changes"
$reportContent += "`n4. Test async operations for proper error handling"
$reportContent += "`n5. Check file loading operations for proper error messages"

# Save the report
$reportContent | Out-File -FilePath $OutputFile -Encoding UTF8

Write-Host "`nAnalysis complete. Report saved to: $OutputFile" -ForegroundColor Green
Write-Host "`nSummary of findings:" -ForegroundColor Cyan
$results | Group-Object Severity | Sort-Object Name | ForEach-Object {
    $color = switch ($_.Name) {
        "High" { "Red" }
        "Medium" { "Yellow" }
        "Low" { "Green" }
        default { "White" }
    }
    Write-Host "  $($_.Name): $($_.Count) issues" -ForegroundColor $color
}

Write-Host "`nNext steps: Use this analysis to focus manual testing efforts on high-risk areas." -ForegroundColor Yellowm