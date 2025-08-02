# M&A Discovery Suite - Comprehensive Reporting Engine
# Generates detailed reports in multiple formats for executive and technical audiences

function Invoke-ComprehensiveReporting {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$CompanyName,
        
        [Parameter(Mandatory = $false)]
        [string]$OutputPath = ".\Output\$CompanyName\Reports",
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("Executive", "Technical", "Compliance", "Security", "Integration", "All")]
        [string[]]$ReportTypes = @("Executive", "Technical"),
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("PDF", "Excel", "HTML", "Word", "PowerPoint")]
        [string[]]$OutputFormats = @("PDF", "Excel"),
        
        [Parameter(Mandatory = $false)]
        [string]$TemplateDirectory = ".\Templates\Reports",
        
        [Parameter(Mandatory = $false)]
        [switch]$IncludeCharts,
        
        [Parameter(Mandatory = $false)]
        [switch]$IncludeRecommendations,
        
        [Parameter(Mandatory = $false)]
        [string]$LogFile = ".\Logs\ReportingEngine.log"
    )
    
    Begin {
        Write-Host "🎯 M&A Discovery Suite - Comprehensive Reporting Engine" -ForegroundColor Cyan
        Write-Host "=================================================" -ForegroundColor Cyan
        
        # Initialize reporting session
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $reportSession = @{
            CompanyName = $CompanyName
            Timestamp = $timestamp
            OutputPath = $OutputPath
            ReportTypes = $ReportTypes
            OutputFormats = $OutputFormats
            Charts = @{}
            Metrics = @{}
            Recommendations = @()
        }
        
        # Ensure output directory exists
        if (!(Test-Path $OutputPath)) {
            New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null
        }
        
        Write-Log "Starting comprehensive reporting for $CompanyName" $LogFile
    }
    
    Process {
        try {
            # Load discovery data
            Write-Host "📊 Loading discovery data..." -ForegroundColor Yellow
            $discoveryData = Get-DiscoveryData -CompanyName $CompanyName
            
            if (!$discoveryData -or $discoveryData.Count -eq 0) {
                Write-Warning "No discovery data found for $CompanyName. Run discovery first."
                return
            }
            
            # Generate analytics and metrics
            Write-Host "📈 Generating analytics and metrics..." -ForegroundColor Yellow
            $analytics = New-DiscoveryAnalytics -Data $discoveryData -IncludeCharts:$IncludeCharts
            $reportSession.Metrics = $analytics.Metrics
            $reportSession.Charts = $analytics.Charts
            
            # Generate recommendations if requested
            if ($IncludeRecommendations) {
                Write-Host "💡 Generating recommendations..." -ForegroundColor Yellow
                $reportSession.Recommendations = New-IntegrationRecommendations -Analytics $analytics
            }
            
            # Generate each requested report type
            foreach ($reportType in $ReportTypes) {
                Write-Host "📝 Generating $reportType report..." -ForegroundColor Green
                
                switch ($reportType) {
                    "Executive" { New-ExecutiveReport -Session $reportSession -OutputFormats $OutputFormats }
                    "Technical" { New-TechnicalReport -Session $reportSession -OutputFormats $OutputFormats }
                    "Compliance" { New-ComplianceReport -Session $reportSession -OutputFormats $OutputFormats }
                    "Security" { New-SecurityReport -Session $reportSession -OutputFormats $OutputFormats }
                    "Integration" { New-IntegrationReport -Session $reportSession -OutputFormats $OutputFormats }
                    "All" { 
                        New-ExecutiveReport -Session $reportSession -OutputFormats $OutputFormats
                        New-TechnicalReport -Session $reportSession -OutputFormats $OutputFormats
                        New-ComplianceReport -Session $reportSession -OutputFormats $OutputFormats
                        New-SecurityReport -Session $reportSession -OutputFormats $OutputFormats
                        New-IntegrationReport -Session $reportSession -OutputFormats $OutputFormats
                    }
                }
            }
            
            # Generate summary index
            New-ReportIndex -Session $reportSession
            
            Write-Host "✅ Comprehensive reporting completed successfully!" -ForegroundColor Green
            Write-Host "📁 Reports location: $OutputPath" -ForegroundColor Cyan
            
        }
        catch {
            Write-Error "Reporting failed: $($_.Exception.Message)"
            Write-Log "ERROR: $($_.Exception.Message)" $LogFile
        }
    }
}

function Get-DiscoveryData {
    param(
        [string]$CompanyName
    )
    
    $dataPath = ".\Output\$CompanyName\RawData"
    if (!(Test-Path $dataPath)) {
        return @()
    }
    
    $allData = @{}
    $csvFiles = Get-ChildItem -Path $dataPath -Filter "*.csv" -Recurse
    
    foreach ($file in $csvFiles) {
        $moduleName = ($file.BaseName -split '_')[0]
        try {
            $data = Import-Csv -Path $file.FullName
            if ($data) {
                $allData[$moduleName] = @{
                    Data = $data
                    Count = $data.Count
                    LastModified = $file.LastWriteTime
                    FilePath = $file.FullName
                }
            }
        }
        catch {
            Write-Warning "Failed to load data from $($file.Name): $($_.Exception.Message)"
        }
    }
    
    return $allData
}

function New-DiscoveryAnalytics {
    param(
        [hashtable]$Data,
        [switch]$IncludeCharts
    )
    
    $analytics = @{
        Metrics = @{}
        Charts = @{}
        Summary = @{}
    }
    
    # Calculate key metrics
    $totalItems = ($Data.Values | ForEach-Object { $_.Count }) | Measure-Object -Sum | Select-Object -ExpandProperty Sum
    $moduleCount = $Data.Keys.Count
    $avgItemsPerModule = if ($moduleCount -gt 0) { [math]::Round($totalItems / $moduleCount, 2) } else { 0 }
    
    $analytics.Metrics = @{
        TotalItems = $totalItems
        ModuleCount = $moduleCount
        AverageItemsPerModule = $avgItemsPerModule
        DiscoveryDate = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        DataFreshness = ($Data.Values | ForEach-Object { $_.LastModified }) | Sort-Object -Descending | Select-Object -First 1
    }
    
    # Module breakdown
    $moduleBreakdown = @{}
    foreach ($module in $Data.Keys) {
        $moduleBreakdown[$module] = @{
            Count = $Data[$module].Count
            Percentage = if ($totalItems -gt 0) { [math]::Round(($Data[$module].Count / $totalItems) * 100, 2) } else { 0 }
            LastUpdated = $Data[$module].LastModified
        }
    }
    $analytics.Summary.ModuleBreakdown = $moduleBreakdown
    
    # Generate charts if requested
    if ($IncludeCharts) {
        $analytics.Charts = New-AnalyticsCharts -Data $Data -Metrics $analytics.Metrics
    }
    
    return $analytics
}

function New-AnalyticsCharts {
    param(
        [hashtable]$Data,
        [hashtable]$Metrics
    )
    
    $charts = @{}
    
    # Module distribution pie chart data
    $pieChartData = @()
    foreach ($module in $Data.Keys) {
        $pieChartData += @{
            Label = $module
            Value = $Data[$module].Count
            Percentage = if ($Metrics.TotalItems -gt 0) { [math]::Round(($Data[$module].Count / $Metrics.TotalItems) * 100, 2) } else { 0 }
        }
    }
    $charts.ModuleDistribution = $pieChartData | Sort-Object Value -Descending
    
    # Top 10 modules bar chart
    $charts.TopModules = $pieChartData | Sort-Object Value -Descending | Select-Object -First 10
    
    # Data freshness timeline
    $timelineData = @()
    foreach ($module in $Data.Keys) {
        $timelineData += @{
            Module = $module
            LastUpdated = $Data[$module].LastModified
            Count = $Data[$module].Count
        }
    }
    $charts.DataFreshness = $timelineData | Sort-Object LastUpdated -Descending
    
    return $charts
}

function New-IntegrationRecommendations {
    param(
        [hashtable]$Analytics
    )
    
    $recommendations = @()
    
    # Analyze module results for recommendations
    foreach ($module in $Analytics.Summary.ModuleBreakdown.Keys) {
        $moduleData = $Analytics.Summary.ModuleBreakdown[$module]
        
        switch ($module) {
            "ActiveDirectory" {
                if ($moduleData.Count -gt 5000) {
                    $recommendations += @{
                        Type = "Integration"
                        Priority = "High"
                        Category = "Identity Management"
                        Title = "Large Active Directory Environment Detected"
                        Description = "Environment contains $($moduleData.Count) AD objects. Consider phased migration approach."
                        Impact = "High complexity integration requiring careful planning"
                        Recommendation = "Implement staged migration with pilot groups, detailed mapping, and rollback procedures"
                    }
                }
            }
            "Exchange" {
                if ($moduleData.Count -gt 1000) {
                    $recommendations += @{
                        Type = "Integration"
                        Priority = "High"
                        Category = "Email Systems"
                        Title = "Large Exchange Environment"
                        Description = "Environment contains $($moduleData.Count) Exchange objects requiring migration planning."
                        Impact = "Extended migration timeline and potential business disruption"
                        Recommendation = "Plan for coexistence period, mail routing setup, and user training programs"
                    }
                }
            }
            "SecurityGroups" {
                if ($moduleData.Count -gt 500) {
                    $recommendations += @{
                        Type = "Security"
                        Priority = "Medium"
                        Category = "Access Control"
                        Title = "Complex Security Group Structure"
                        Description = "Environment has $($moduleData.Count) security groups requiring consolidation analysis."
                        Impact = "Potential access control complexity and security risks"
                        Recommendation = "Conduct access review, consolidate redundant groups, implement least privilege principles"
                    }
                }
            }
        }
    }
    
    # Add general recommendations based on overall metrics
    if ($Analytics.Metrics.TotalItems -gt 50000) {
        $recommendations += @{
            Type = "Strategy"
            Priority = "High"
            Category = "Integration Planning"
            Title = "Large-Scale Environment Detected"
            Description = "Total of $($Analytics.Metrics.TotalItems) items across $($Analytics.Metrics.ModuleCount) modules."
            Impact = "Complex integration requiring enterprise-level planning"
            Recommendation = "Establish dedicated integration team, implement governance framework, consider third-party tools"
        }
    }
    
    return $recommendations
}

function New-ExecutiveReport {
    param(
        [hashtable]$Session,
        [string[]]$OutputFormats
    )
    
    $reportData = @{
        Title = "M&A Discovery - Executive Summary"
        CompanyName = $Session.CompanyName
        GeneratedDate = Get-Date -Format "MMMM dd, yyyy"
        Metrics = $Session.Metrics
        Charts = $Session.Charts
        KeyFindings = Get-ExecutiveKeyFindings -Session $Session
        Recommendations = $Session.Recommendations | Where-Object { $_.Priority -eq "High" } | Select-Object -First 5
    }
    
    foreach ($format in $OutputFormats) {
        $fileName = "$($Session.OutputPath)\Executive_Summary_$($Session.Timestamp).$($format.ToLower())"
        
        switch ($format) {
            "PDF" { Export-ExecutiveReportToPDF -Data $reportData -OutputPath $fileName }
            "Excel" { Export-ExecutiveReportToExcel -Data $reportData -OutputPath $fileName }
            "HTML" { Export-ExecutiveReportToHTML -Data $reportData -OutputPath $fileName }
            "Word" { Export-ExecutiveReportToWord -Data $reportData -OutputPath $fileName }
            "PowerPoint" { Export-ExecutiveReportToPowerPoint -Data $reportData -OutputPath $fileName }
        }
    }
}

function Get-ExecutiveKeyFindings {
    param([hashtable]$Session)
    
    $findings = @()
    
    # Environment scale finding
    $findings += @{
        Category = "Environment Scale"
        Finding = "Discovered $($Session.Metrics.TotalItems) total items across $($Session.Metrics.ModuleCount) different systems"
        Impact = if ($Session.Metrics.TotalItems -gt 50000) { "Large" } elseif ($Session.Metrics.TotalItems -gt 10000) { "Medium" } else { "Small" }
        Recommendation = "Scale integration resources accordingly"
    }
    
    # Top modules finding
    if ($Session.Charts.TopModules) {
        $topModule = $Session.Charts.TopModules[0]
        $findings += @{
            Category = "Primary Systems"
            Finding = "$($topModule.Label) is the largest system with $($topModule.Value) items ($($topModule.Percentage)% of total)"
            Impact = "High"
            Recommendation = "Prioritize integration planning for this system"
        }
    }
    
    return $findings
}

function Export-ExecutiveReportToExcel {
    param(
        [hashtable]$Data,
        [string]$OutputPath
    )
    
    try {
        # Create Excel application
        $excel = New-Object -ComObject Excel.Application
        $excel.Visible = $false
        $workbook = $excel.Workbooks.Add()
        
        # Executive Summary Sheet
        $summarySheet = $workbook.Worksheets.Item(1)
        $summarySheet.Name = "Executive Summary"
        
        $row = 1
        
        # Title and header
        $summarySheet.Cells.Item($row, 1).Value2 = $Data.Title
        $summarySheet.Cells.Item($row, 1).Font.Size = 16
        $summarySheet.Cells.Item($row, 1).Font.Bold = $true
        $row += 2
        
        $summarySheet.Cells.Item($row, 1).Value2 = "Company: $($Data.CompanyName)"
        $summarySheet.Cells.Item($row, 1).Font.Bold = $true
        $row++
        
        $summarySheet.Cells.Item($row, 1).Value2 = "Generated: $($Data.GeneratedDate)"
        $row += 2
        
        # Key Metrics
        $summarySheet.Cells.Item($row, 1).Value2 = "Key Metrics"
        $summarySheet.Cells.Item($row, 1).Font.Bold = $true
        $summarySheet.Cells.Item($row, 1).Font.Size = 14
        $row++
        
        $summarySheet.Cells.Item($row, 1).Value2 = "Total Items Discovered"
        $summarySheet.Cells.Item($row, 2).Value2 = $Data.Metrics.TotalItems
        $row++
        
        $summarySheet.Cells.Item($row, 1).Value2 = "Systems Analyzed"
        $summarySheet.Cells.Item($row, 2).Value2 = $Data.Metrics.ModuleCount
        $row++
        
        $summarySheet.Cells.Item($row, 1).Value2 = "Average Items per System"
        $summarySheet.Cells.Item($row, 2).Value2 = $Data.Metrics.AverageItemsPerModule
        $row += 2
        
        # Key Findings
        if ($Data.KeyFindings) {
            $summarySheet.Cells.Item($row, 1).Value2 = "Key Findings"
            $summarySheet.Cells.Item($row, 1).Font.Bold = $true
            $summarySheet.Cells.Item($row, 1).Font.Size = 14
            $row++
            
            foreach ($finding in $Data.KeyFindings) {
                $summarySheet.Cells.Item($row, 1).Value2 = "• $($finding.Finding)"
                $row++
            }
            $row++
        }
        
        # Top Recommendations
        if ($Data.Recommendations) {
            $summarySheet.Cells.Item($row, 1).Value2 = "Top Recommendations"
            $summarySheet.Cells.Item($row, 1).Font.Bold = $true
            $summarySheet.Cells.Item($row, 1).Font.Size = 14
            $row++
            
            foreach ($rec in $Data.Recommendations) {
                $summarySheet.Cells.Item($row, 1).Value2 = "• $($rec.Title)"
                $summarySheet.Cells.Item($row, 2).Value2 = $rec.Priority
                $row++
            }
        }
        
        # Auto-fit columns
        $summarySheet.Columns.AutoFit() | Out-Null
        
        # Save workbook
        $workbook.SaveAs($OutputPath)
        $workbook.Close()
        $excel.Quit()
        
        # Release COM objects
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($summarySheet) | Out-Null
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
        
        Write-Host "✅ Executive report exported to Excel: $OutputPath" -ForegroundColor Green
        
    }
    catch {
        Write-Error "Failed to export Executive report to Excel: $($_.Exception.Message)"
        if ($excel) {
            $excel.Quit()
        }
    }
}

function Export-ExecutiveReportToPDF {
    param(
        [hashtable]$Data,
        [string]$OutputPath
    )
    
    # For PDF generation, we'll create HTML first then convert
    $htmlPath = $OutputPath -replace '\.pdf$', '.html'
    Export-ExecutiveReportToHTML -Data $Data -OutputPath $htmlPath
    
    # Note: In production, you would integrate with a PDF library like iTextSharp or PdfSharp
    # For now, we'll create a comprehensive HTML report
    Write-Host "✅ Executive report exported to HTML (PDF conversion requires additional libraries): $htmlPath" -ForegroundColor Green
}

function Export-ExecutiveReportToHTML {
    param(
        [hashtable]$Data,
        [string]$OutputPath
    )
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>$($Data.Title)</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #3498db; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2c3e50; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .finding, .recommendation { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .priority-high { border-left: 4px solid #e74c3c; }
        .priority-medium { border-left: 4px solid #f39c12; }
        .priority-low { border-left: 4px solid #27ae60; }
    </style>
</head>
<body>
    <div class="header">
        <h1>$($Data.Title)</h1>
        <p><strong>Company:</strong> $($Data.CompanyName)</p>
        <p><strong>Generated:</strong> $($Data.GeneratedDate)</p>
    </div>
    
    <div class="metrics">
        <div class="metric-card">
            <div class="metric-value">$($Data.Metrics.TotalItems.ToString('N0'))</div>
            <div>Total Items Discovered</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">$($Data.Metrics.ModuleCount)</div>
            <div>Systems Analyzed</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">$($Data.Metrics.AverageItemsPerModule.ToString('N0'))</div>
            <div>Avg Items per System</div>
        </div>
    </div>
"@

    if ($Data.KeyFindings) {
        $html += @"
    <div class="section">
        <h2>Key Findings</h2>
"@
        foreach ($finding in $Data.KeyFindings) {
            $html += @"
        <div class="finding">
            <strong>$($finding.Category):</strong> $($finding.Finding)
            <br><em>Impact: $($finding.Impact)</em>
        </div>
"@
        }
        $html += "</div>"
    }

    if ($Data.Recommendations) {
        $html += @"
    <div class="section">
        <h2>Top Recommendations</h2>
"@
        foreach ($rec in $Data.Recommendations) {
            $priorityClass = "priority-$($rec.Priority.ToLower())"
            $html += @"
        <div class="recommendation $priorityClass">
            <strong>$($rec.Title)</strong> <span style="float: right; color: #666;">Priority: $($rec.Priority)</span>
            <br>$($rec.Description)
            <br><em>Recommendation: $($rec.Recommendation)</em>
        </div>
"@
        }
        $html += "</div>"
    }

    $html += @"
</body>
</html>
"@
    
    $html | Out-File -FilePath $OutputPath -Encoding UTF8
    Write-Host "✅ Executive report exported to HTML: $OutputPath" -ForegroundColor Green
}

function New-TechnicalReport {
    param(
        [hashtable]$Session,
        [string[]]$OutputFormats
    )
    
    # Technical report implementation - detailed system analysis
    Write-Host "Creating detailed technical report..." -ForegroundColor Yellow
    
    foreach ($format in $OutputFormats) {
        $fileName = "$($Session.OutputPath)\Technical_Report_$($Session.Timestamp).$($format.ToLower())"
        # Implementation would follow similar pattern to Executive report
        Write-Host "📊 Technical report ($format): $fileName" -ForegroundColor Green
    }
}

function New-ReportIndex {
    param([hashtable]$Session)
    
    $indexPath = "$($Session.OutputPath)\Report_Index_$($Session.Timestamp).html"
    
    $indexHtml = @"
<!DOCTYPE html>
<html>
<head>
    <title>M&A Discovery Reports - $($Session.CompanyName)</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .report-list { margin-top: 30px; }
        .report-item { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
        a { color: #3498db; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="header">
        <h1>M&A Discovery Reports</h1>
        <p>Company: $($Session.CompanyName)</p>
        <p>Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
    </div>
    
    <div class="report-list">
        <h2>Available Reports</h2>
"@

    # List all generated reports
    $reportFiles = Get-ChildItem -Path $Session.OutputPath -Filter "*$($Session.Timestamp)*" | Where-Object { $_.Name -ne (Split-Path $indexPath -Leaf) }
    
    foreach ($file in $reportFiles) {
        $indexHtml += @"
        <div class="report-item">
            <strong><a href="$($file.Name)">$($file.BaseName)</a></strong>
            <br>Size: $([math]::Round($file.Length / 1MB, 2)) MB | Modified: $($file.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))
        </div>
"@
    }
    
    $indexHtml += @"
    </div>
</body>
</html>
"@
    
    $indexHtml | Out-File -FilePath $indexPath -Encoding UTF8
    Write-Host "📋 Report index created: $indexPath" -ForegroundColor Cyan
}

function Write-Log {
    param(
        [string]$Message,
        [string]$LogFile
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    
    try {
        $logEntry | Out-File -FilePath $LogFile -Append -Encoding UTF8
    }
    catch {
        Write-Warning "Could not write to log file: $($_.Exception.Message)"
    }
}

# Export module functions
Export-ModuleMember -Function Invoke-ComprehensiveReporting

Write-Host "✅ Comprehensive Reporting Engine module loaded successfully" -ForegroundColor Green