# Enhanced Discovery Status Monitor with Fixed Status Detection
# This script provides real-time monitoring of discovery module status

param(
    [int]$RefreshInterval = 5,
    [switch]$ShowDetails,
    [switch]$CheckCompletion
)

function Get-ModuleStatus {
    param($ModuleName, $RawDataPath)
    
    # Define expected files for each module (same as orchestrator)
    $moduleFileMapping = @{
        "ActiveDirectory" = @("ADUsers.csv", "ADGroups.csv", "ADGroupMembers.csv", "ADComputers.csv", "ADOUs.csv", "ADSites.csv", "ADSiteLinks.csv", "ADSubnets.csv")
        "Graph" = @("GraphUsers.csv", "GraphGroups.csv")
        "Azure" = @("AzureSubscriptions.csv", "AzureResources.csv")
        "Intune" = @("IntuneManagedDevices.csv", "IntuneDeviceConfigurations.csv", "IntuneCompliancePolicies.csv", "IntuneManagedApps.csv", "IntuneAppProtectionPolicies.csv", "IntuneEnrollmentRestrictions.csv")
        "Exchange" = @("ExchangeMailboxes.csv", "ExchangeDistributionGroups.csv")
        "SharePoint" = @("SharePointSites.csv", "SharePointLists.csv")
        "Teams" = @("TeamsTeams.csv", "TeamsChannels.csv", "TeamsUsers.csv")
        "GPO" = @("GPODriveMappings.csv", "GPOFolderRedirections.csv", "GPOLogonScripts.csv")
        "SQLServer" = @("SQLInstances.csv", "SQLDatabases.csv", "SQLLogins.csv")
        "FileServer" = @("FileShares.csv", "FilePermissions.csv")
        "Licensing" = @("LicenseAssignments.csv", "LicenseUsage.csv")
        "EnvironmentDetection" = @("EnvironmentSummary.csv")
        "ExternalIdentity" = @("ExternalUsers.csv", "ExternalGroups.csv")
        "NetworkInfrastructure" = @("NetworkDevices.csv", "NetworkConfiguration.csv")
    }
    
    $expectedFiles = $moduleFileMapping[$ModuleName]
    if (-not $expectedFiles) {
        return @{
            Status = "UNKNOWN"
            RecordCount = 0
            Files = @()
            Details = "No file mapping found"
        }
    }
    
    $existingFiles = @()
    $totalRecords = 0
    $validFiles = 0
    $activeFiles = 0
    
    foreach ($fileName in $expectedFiles) {
        $filePath = Join-Path $RawDataPath $fileName
        
        if (Test-Path $filePath) {
            $fileInfo = Get-Item $filePath
            $existingFiles += @{
                Name = $fileName
                Size = $fileInfo.Length
                LastWrite = $fileInfo.LastWriteTime
                Age = (Get-Date) - $fileInfo.LastWriteTime
            }
            
            # Check if file has meaningful content
            if ($fileInfo.Length -gt 100) {
                try {
                    $csvContent = Import-Csv $filePath -ErrorAction Stop
                    $recordCount = $csvContent.Count
                    $totalRecords += $recordCount
                    
                    if ($recordCount -gt 0) {
                        $validFiles++
                    }
                } catch {
                    # Invalid CSV
                }
            }
            
            # Check if file appears to be actively being written
            if ($fileInfo.Length -lt 500 -and (Get-Date) - $fileInfo.LastWriteTime -lt [TimeSpan]::FromMinutes(2)) {
                $activeFiles++
            }
        }
    }
    
    # Determine status using improved logic
    $completionPercentage = if ($expectedFiles.Count -gt 0) {
        ($validFiles / $expectedFiles.Count) * 100
    } else { 0 }
    
    $status = "PENDING"
    $details = ""
    
    if ($activeFiles -gt 0 -and $validFiles -eq 0) {
        $status = "RUNNING"
        $details = "$activeFiles active files detected"
    } elseif ($validFiles -eq $expectedFiles.Count -and $totalRecords -gt 0) {
        $status = "COMPLETE"
        $details = "$totalRecords records across $validFiles files"
    } elseif ($validFiles -gt 0 -and $totalRecords -gt 0 -and $completionPercentage -ge 50) {
        $status = "COMPLETE"
        $details = "$totalRecords records across $validFiles/$($expectedFiles.Count) files (sufficient)"
    } elseif ($validFiles -gt 0 -and $totalRecords -gt 0) {
        $status = "PARTIAL"
        $details = "$totalRecords records across $validFiles/$($expectedFiles.Count) files"
    } else {
        $status = "PENDING"
        $details = "No valid data files found"
    }
    
    return @{
        Status = $status
        RecordCount = $totalRecords
        Files = $existingFiles
        ValidFiles = $validFiles
        ExpectedFiles = $expectedFiles.Count
        CompletionPercentage = [math]::Round($completionPercentage, 1)
        Details = $details
        ActiveFiles = $activeFiles
    }
}

function Show-StatusDashboard {
    param($Modules, $RawDataPath)
    
    Clear-Host
    Write-Host "=" * 70 -ForegroundColor Cyan
    Write-Host "Discovery Module Status Dashboard (Enhanced)" -ForegroundColor Cyan
    Write-Host "=" * 70 -ForegroundColor Cyan
    Write-Host "Last Updated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host ""
    
    $totalModules = $Modules.Count
    $completeModules = 0
    $runningModules = 0
    $pendingModules = 0
    
    foreach ($module in $Modules) {
        $moduleStatus = Get-ModuleStatus -ModuleName $module -RawDataPath $RawDataPath
        
        $statusColor = switch ($moduleStatus.Status) {
            "COMPLETE" { "Green"; $completeModules++ }
            "RUNNING" { "Yellow"; $runningModules++ }
            "PARTIAL" { "DarkYellow"; $runningModules++ }
            default { "Gray"; $pendingModules++ }
        }
        
        $statusText = $moduleStatus.Status.PadRight(10)
        $recordText = "($($moduleStatus.RecordCount) records)".PadLeft(15)
        
        Write-Host "  $($module.PadRight(20)) " -NoNewline
        Write-Host "[$statusText]" -ForegroundColor $statusColor -NoNewline
        Write-Host " $recordText" -ForegroundColor Gray
        
        if ($ShowDetails -and $moduleStatus.Files.Count -gt 0) {
            foreach ($file in $moduleStatus.Files) {
                $ageText = if ($file.Age.TotalMinutes -lt 60) {
                    "$([math]::Round($file.Age.TotalMinutes, 1))m ago"
                } else {
                    "$([math]::Round($file.Age.TotalHours, 1))h ago"
                }
                Write-Host "    - $($file.Name): $([math]::Round($file.Size/1KB, 1))KB ($ageText)" -ForegroundColor DarkGray
            }
        }
    }
    
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "  Complete: $completeModules" -ForegroundColor Green
    Write-Host "  Running:  $runningModules" -ForegroundColor Yellow  
    Write-Host "  Pending:  $pendingModules" -ForegroundColor Gray
    Write-Host "  Total:    $totalModules" -ForegroundColor White
    
    if ($CheckCompletion) {
        Write-Host ""
        if ($completeModules -eq $totalModules) {
            Write-Host "All modules completed!" -ForegroundColor Green
        } elseif ($runningModules -eq 0 -and $pendingModules -gt 0) {
            Write-Host "Discovery appears to have stopped with incomplete modules" -ForegroundColor Red
        } elseif ($runningModules -gt 0) {
            Write-Host "Discovery in progress..." -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "----------------------------------------------------------------------" -ForegroundColor Gray
    Write-Host "Press Ctrl+C to exit | Auto-refresh every $RefreshInterval seconds" -ForegroundColor Gray
}

# Main execution
try {
    # Get the global context
    if (-not $global:MandA -or -not $global:MandA.Initialized) {
        Write-Host "Error: Global MandA context not initialized!" -ForegroundColor Red
        Write-Host "Please run through QuickStart.ps1 first." -ForegroundColor Yellow
        exit 1
    }
    
    $rawDataPath = $global:MandA.Paths.RawDataOutput
    if (-not (Test-Path $rawDataPath)) {
        Write-Host "Error: Raw data path not found: $rawDataPath" -ForegroundColor Red
        exit 1
    }
    
    # Get enabled sources
    $enabledSources = $global:MandA.Config.discovery.enabledSources
    if ($enabledSources -is [System.Collections.Hashtable]) {
        $enabledSources = @($enabledSources.Keys)
    } elseif ($enabledSources -is [PSCustomObject]) {
        $enabledSources = @($enabledSources.PSObject.Properties.Name)
    } elseif ($enabledSources -isnot [array]) {
        $enabledSources = @($enabledSources)
    }
    
    # Filter to valid string sources
    $modules = @($enabledSources | Where-Object { $_ -is [string] })
    
    if ($modules.Count -eq 0) {
        Write-Host "Error: No valid discovery modules found in configuration" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Monitoring $($modules.Count) discovery modules..." -ForegroundColor Green
    Write-Host "Raw data path: $rawDataPath" -ForegroundColor Gray
    Write-Host ""
    
    # Main monitoring loop
    while ($true) {
        Show-StatusDashboard -Modules $modules -RawDataPath $rawDataPath
        Start-Sleep -Seconds $RefreshInterval
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
