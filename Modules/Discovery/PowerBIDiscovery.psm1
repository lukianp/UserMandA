# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-08-30
# Last Modified: 2025-08-30

<#
.SYNOPSIS
    Power BI Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers Power BI workspaces, reports, datasets, dashboards, and configurations using Microsoft Graph API 
    and Power BI REST API. This module provides comprehensive Power BI environment discovery including content 
    inventory, permissions, data sources, and usage metrics essential for M&A business intelligence assessment.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-08-30
    Requires: PowerShell 5.1+, Microsoft.Graph modules, Power BI Management modules
#>

# Fallback logging function if Write-MandALog is not available
if (-not (Get-Command Write-MandALog -ErrorAction SilentlyContinue)) {
    function Write-MandALog {
        param(
            [string]$Message,
            [string]$Level = "INFO",
            [string]$Component = "Discovery",
            [hashtable]$Context = @{}
        )
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Write-Host "[$timestamp] [$Level] [$Component] $Message" -ForegroundColor $(
            switch ($Level) {
                'ERROR' { 'Red' }
                'WARN' { 'Yellow' }
                'SUCCESS' { 'Green' }
                'HEADER' { 'Cyan' }
                'DEBUG' { 'Gray' }
                default { 'White' }
            }
        )
    }
}

function Write-PowerBILog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter()]
        [string]$Level = "INFO",
        
        [Parameter()]
        [hashtable]$Context = @{}
    )
    
    Write-MandALog -Message $Message -Level $Level -Component "PowerBIDiscovery" -Context $Context
}

function Test-PowerBIModule {
    try {
        if (-not (Get-Module -Name MicrosoftPowerBIMgmt -ListAvailable)) {
            throw "Power BI Management module is not installed. Please install using: Install-Module MicrosoftPowerBIMgmt -Force"
        }
        
        Import-Module MicrosoftPowerBIMgmt -Force -ErrorAction Stop
        return $true
    } catch {
        throw "Failed to import Power BI Management module: $($_.Exception.Message)"
    }
}

function Invoke-PowerBIDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    # START: Initialize session-based authentication (match other discovery modules)
    Write-PowerBILog -Level "HEADER" -Message "=== M&A Power BI Discovery Module Starting ===" -Context $Context
    
    # START: Enhanced discovery context validation and initialization
    Write-PowerBILog -Level "HEADER" -Message "=== M&A Power BI Discovery Module Starting ===" -Context $Context
    
    $result = [PSCustomObject]@{
        Success = $true
        Message = "Power BI discovery completed successfully"
        Data = @{}
        Errors = @()
        Warnings = @()
        Context = $Context
    }
    
    # Helper to add errors with proper context
    $result | Add-Member -MemberType ScriptMethod -Name "AddError" -Value {
        param($message, $exception, $location)
        $this.Success = $false
        $this.Errors += [PSCustomObject]@{
            Message = $message
            Exception = $exception
            Location = $location
            Timestamp = Get-Date
        }
        Write-PowerBILog -Level "ERROR" -Message $message -Context $this.Context
    }
    
    # Helper to add warnings
    $result | Add-Member -MemberType ScriptMethod -Name "AddWarning" -Value {
        param($message)
        $this.Warnings += [PSCustomObject]@{
            Message = $message
            Timestamp = Get-Date
        }
        Write-PowerBILog -Level "WARN" -Message $message -Context $this.Context
    }
    
    try {
        # 2. VALIDATE PREREQUISITES & CONTEXT
        Write-PowerBILog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-PowerBILog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        Ensure-Path -Path $outputPath

        # 3. VALIDATE POWER BI MODULE AND CONNECTION
        Write-PowerBILog -Level "INFO" -Message "Validating Power BI Management module..." -Context $Context
        
        try {
            Test-PowerBIModule
            Write-PowerBILog -Level "SUCCESS" -Message "Power BI Management module validated successfully" -Context $Context
        } catch {
            $result.AddWarning("Power BI Management module not available: $($_.Exception.Message)")
            Write-PowerBILog -Level "WARN" -Message "Power BI Management module not available, some features may be limited" -Context $Context
        }
        
        # 4. AUTHENTICATE & CONNECT - Use session-based authentication like other discovery modules
        Write-PowerBILog -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
        try {
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId

            # Validate the connection by making a test Graph API call
            $testUri = "https://graph.microsoft.com/v1.0/organization"
            $testResponse = Invoke-MgGraphRequest -Uri $testUri -Method GET -ErrorAction Stop

            if (-not $testResponse) {
                throw "Graph connection test failed - no response"
            }

            Write-PowerBILog -Level "SUCCESS" -Message "Graph connection validated via session authentication" -Context $Context
        } catch {
            $result.AddError("Graph authentication validation failed: $($_.Exception.Message)", $_.Exception, "Connection Validation")
            return $result
        }

        # 5. CHECK POWER BI MANAGEMENT MODULE AND CONNECTION
        $usePowerBI = $false
        $useGraph = $true  # We now have Graph connection via session

        try {
            # First check if MicrosoftPowerBIMgmt module is available
            if (Get-Module -Name MicrosoftPowerBIMgmt -ListAvailable -ErrorAction SilentlyContinue) {
                Write-PowerBILog -Level "INFO" -Message "MicrosoftPowerBIMgmt module found, attempting Power BI service connection..." -Context $Context

                # Try to get Power BI access token
                $powerBIToken = Get-PowerBIAccessToken -AsString -ErrorAction SilentlyContinue
                if ($powerBIToken) {
                    $usePowerBI = $true
                    Write-PowerBILog -Level "SUCCESS" -Message "Power BI service connection available via management module" -Context $Context
                } else {
                    Write-PowerBILog -Level "WARN" -Message "Power BI Management module found but no active connection, will use Graph fallback" -Context $Context
                }
            } else {
                Write-PowerBILog -Level "INFO" -Message "MicrosoftPowerBIMgmt module not available, using Graph-only discovery mode" -Context $Context
                $result.AddWarning("Power BI Management module not available, using Graph-only Power BI discovery which may have limited functionality. Consider installing MicrosoftPowerBIMgmt module for full discovery capabilities.")
            }
        } catch {
            Write-PowerBILog -Level "WARN" -Message "Power BI Management module connection failed, falling back to Graph: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Power BI Management module connection failed, falling back to Graph-only discovery.")
        }

        # 4. DISCOVERY EXECUTION
        Write-PowerBILog -Level "HEADER" -Message "Starting Power BI Discovery Process" -Context $Context
        
        $discoveryData = @{
            Workspaces = @()
            Reports = @()
            Datasets = @()
            Dashboards = @()
            Dataflows = @()
            Apps = @()
            Gateways = @()
            TenantSettings = @()
            Statistics = @{
                TotalWorkspaces = 0
                PersonalWorkspaces = 0
                GroupWorkspaces = 0
                TotalReports = 0
                TotalDatasets = 0
                TotalDashboards = 0
                TotalDataflows = 0
                TotalApps = 0
                TotalGateways = 0
            }
        }

        # 4a. Discover Power BI Workspaces
        if ($usePowerBI) {
            Write-PowerBILog -Level "INFO" -Message "Discovering Power BI workspaces..." -Context $Context
            try {
                $workspaces = Get-PowerBIWorkspace -Scope Organization -All -ErrorAction Stop
                
                foreach ($workspace in $workspaces) {
                    $discoveryData.Statistics.TotalWorkspaces++
                    
                    if ($workspace.Type -eq 'PersonalGroup') {
                        $discoveryData.Statistics.PersonalWorkspaces++
                    } else {
                        $discoveryData.Statistics.GroupWorkspaces++
                    }
                    
                    $workspaceInfo = @{
                        WorkspaceId = $workspace.Id
                        Name = $workspace.Name
                        Description = $workspace.Description
                        Type = $workspace.Type
                        State = $workspace.State
                        IsReadOnly = $workspace.IsReadOnly
                        IsOrphaned = $workspace.IsOrphaned
                        IsOnDedicatedCapacity = $workspace.IsOnDedicatedCapacity
                        CapacityId = $workspace.CapacityId
                        DefaultDatasetStorageFormat = $workspace.DefaultDatasetStorageFormat
                    }
                    
                    $discoveryData.Workspaces += $workspaceInfo
                    
                    # Get workspace users/permissions
                    try {
                        $workspaceUsers = Get-PowerBIWorkspaceUser -Scope Organization -Id $workspace.Id -ErrorAction SilentlyContinue
                        $workspaceInfo.Users = if ($workspaceUsers) { ($workspaceUsers | ForEach-Object { "$($_.UserPrincipalName):$($_.AccessRight)" }) -join ';' } else { '' }
                    } catch {
                        Write-PowerBILog -Level "DEBUG" -Message "Could not get users for workspace $($workspace.Name): $($_.Exception.Message)" -Context $Context
                    }
                }
                
                Write-PowerBILog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.TotalWorkspaces) workspaces ($($discoveryData.Statistics.PersonalWorkspaces) personal, $($discoveryData.Statistics.GroupWorkspaces) group)" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover Power BI workspaces: $($_.Exception.Message)")
            }

            # 4b. Discover Power BI Reports
            Write-PowerBILog -Level "INFO" -Message "Discovering Power BI reports..." -Context $Context
            try {
                $reports = Get-PowerBIReport -Scope Organization -ErrorAction Stop
                
                foreach ($report in $reports) {
                    $discoveryData.Statistics.TotalReports++
                    
                    $reportInfo = @{
                        ReportId = $report.Id
                        Name = $report.Name
                        Description = $report.Description
                        WebUrl = $report.WebUrl
                        EmbedUrl = $report.EmbedUrl
                        DatasetId = $report.DatasetId
                        WorkspaceId = $report.WorkspaceId
                        CreatedBy = $report.CreatedBy
                        CreatedDateTime = $report.CreatedDateTime
                        ModifiedBy = $report.ModifiedBy
                        ModifiedDateTime = $report.ModifiedDateTime
                        ReportType = $report.ReportType
                        AppId = $report.AppId
                    }
                    
                    $discoveryData.Reports += $reportInfo
                }
                
                Write-PowerBILog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.TotalReports) reports" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover Power BI reports: $($_.Exception.Message)")
            }

            # 4c. Discover Power BI Datasets
            Write-PowerBILog -Level "INFO" -Message "Discovering Power BI datasets..." -Context $Context
            try {
                $datasets = Get-PowerBIDataset -Scope Organization -ErrorAction Stop
                
                foreach ($dataset in $datasets) {
                    $discoveryData.Statistics.TotalDatasets++
                    
                    $datasetInfo = @{
                        DatasetId = $dataset.Id
                        Name = $dataset.Name
                        Description = $dataset.Description
                        WebUrl = $dataset.WebUrl
                        WorkspaceId = $dataset.WorkspaceId
                        ConfiguredBy = $dataset.ConfiguredBy
                        CreatedDate = $dataset.CreatedDate
                        ContentProviderType = $dataset.ContentProviderType
                        CreateReportEmbedURL = $dataset.CreateReportEmbedURL
                        QnaEmbedURL = $dataset.QnaEmbedURL
                        UpstreamDatasets = if ($dataset.UpstreamDatasets) { ($dataset.UpstreamDatasets | ForEach-Object { $_.targetDatasetId }) -join ';' } else { '' }
                        IsRefreshable = $dataset.IsRefreshable
                        IsEffectiveIdentityRequired = $dataset.IsEffectiveIdentityRequired
                        IsEffectiveIdentityRolesRequired = $dataset.IsEffectiveIdentityRolesRequired
                        IsOnPremGatewayRequired = $dataset.IsOnPremGatewayRequired
                    }
                    
                    # Get dataset data sources
                    try {
                        $dataSources = Get-PowerBIDataSource -DatasetId $dataset.Id -WorkspaceId $dataset.WorkspaceId -ErrorAction SilentlyContinue
                        if ($dataSources) {
                            $datasetInfo.DataSources = ($dataSources | ForEach-Object { "$($_.DatasourceType):$($_.ConnectionDetails.Server):$($_.ConnectionDetails.Database)" }) -join ';'
                        }
                    } catch {
                        Write-PowerBILog -Level "DEBUG" -Message "Could not get data sources for dataset $($dataset.Name): $($_.Exception.Message)" -Context $Context
                    }
                    
                    $discoveryData.Datasets += $datasetInfo
                }
                
                Write-PowerBILog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.TotalDatasets) datasets" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover Power BI datasets: $($_.Exception.Message)")
            }

            # 4d. Discover Power BI Dashboards
            Write-PowerBILog -Level "INFO" -Message "Discovering Power BI dashboards..." -Context $Context
            try {
                $dashboards = Get-PowerBIDashboard -Scope Organization -ErrorAction Stop
                
                foreach ($dashboard in $dashboards) {
                    $discoveryData.Statistics.TotalDashboards++
                    
                    $dashboardInfo = @{
                        DashboardId = $dashboard.Id
                        DisplayName = $dashboard.DisplayName
                        WebUrl = $dashboard.WebUrl
                        EmbedUrl = $dashboard.EmbedUrl
                        WorkspaceId = $dashboard.WorkspaceId
                        AppId = $dashboard.AppId
                        IsReadOnly = $dashboard.IsReadOnly
                    }
                    
                    # Get dashboard tiles
                    try {
                        $tiles = Get-PowerBITile -DashboardId $dashboard.Id -WorkspaceId $dashboard.WorkspaceId -ErrorAction SilentlyContinue
                        if ($tiles) {
                            $dashboardInfo.TileCount = $tiles.Count
                            $dashboardInfo.Tiles = ($tiles | ForEach-Object { "$($_.Title):$($_.SubTitle):$($_.DatasetId)" }) -join ';'
                        } else {
                            $dashboardInfo.TileCount = 0
                            $dashboardInfo.Tiles = ''
                        }
                    } catch {
                        Write-PowerBILog -Level "DEBUG" -Message "Could not get tiles for dashboard $($dashboard.DisplayName): $($_.Exception.Message)" -Context $Context
                        $dashboardInfo.TileCount = 0
                        $dashboardInfo.Tiles = ''
                    }
                    
                    $discoveryData.Dashboards += $dashboardInfo
                }
                
                Write-PowerBILog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.TotalDashboards) dashboards" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover Power BI dashboards: $($_.Exception.Message)")
            }

            # 4e. Discover Power BI Apps
            Write-PowerBILog -Level "INFO" -Message "Discovering Power BI apps..." -Context $Context
            try {
                $apps = Get-PowerBIApp -Scope Organization -ErrorAction Stop
                
                foreach ($app in $apps) {
                    $discoveryData.Statistics.TotalApps++
                    
                    $appInfo = @{
                        AppId = $app.Id
                        Name = $app.Name
                        Description = $app.Description
                        PublishedBy = $app.PublishedBy
                        LastUpdate = $app.LastUpdate
                        WorkspaceId = $app.WorkspaceId
                    }
                    
                    $discoveryData.Apps += $appInfo
                }
                
                Write-PowerBILog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.TotalApps) apps" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover Power BI apps: $($_.Exception.Message)")
            }

            # 4f. Discover Power BI Gateways
            Write-PowerBILog -Level "INFO" -Message "Discovering Power BI gateways..." -Context $Context
            try {
                $gateways = Get-PowerBIGateway -Scope Organization -ErrorAction Stop
                
                foreach ($gateway in $gateways) {
                    $discoveryData.Statistics.TotalGateways++
                    
                    $gatewayInfo = @{
                        GatewayId = $gateway.Id
                        Name = $gateway.Name
                        Description = $gateway.Description
                        GatewayStatus = $gateway.GatewayStatus
                        PublicKey = $gateway.PublicKey
                        Type = $gateway.Type
                        GatewayAnnotation = $gateway.GatewayAnnotation
                        ContactInformation = if ($gateway.ContactInformation) { $gateway.ContactInformation -join ';' } else { '' }
                        LoadBalancingSetting = $gateway.LoadBalancingSetting
                    }
                    
                    # Get gateway data sources
                    try {
                        $gatewayDataSources = Get-PowerBIGatewayDataSource -GatewayId $gateway.Id -ErrorAction SilentlyContinue
                        if ($gatewayDataSources) {
                            $gatewayInfo.DataSourceCount = $gatewayDataSources.Count
                            $gatewayInfo.DataSources = ($gatewayDataSources | ForEach-Object { "$($_.DataSourceName):$($_.DataSourceType)" }) -join ';'
                        } else {
                            $gatewayInfo.DataSourceCount = 0
                            $gatewayInfo.DataSources = ''
                        }
                    } catch {
                        Write-PowerBILog -Level "DEBUG" -Message "Could not get data sources for gateway $($gateway.Name): $($_.Exception.Message)" -Context $Context
                        $gatewayInfo.DataSourceCount = 0
                        $gatewayInfo.DataSources = ''
                    }
                    
                    $discoveryData.Gateways += $gatewayInfo
                }
                
                Write-PowerBILog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.TotalGateways) gateways" -Context $Context
                
            } catch {
                $result.AddWarning("Failed to discover Power BI gateways: $($_.Exception.Message)")
            }
        }

        # 4g. Enhanced Graph API Power BI discoveries (fallback when PowerBI service not available)
        if ($useGraph -and -not $usePowerBI) {
            Write-PowerBILog -Level "INFO" -Message "Starting Graph API Power BI discovery fallback..." -Context $Context

            # Discover Power BI Workspaces (Groups with PowerBI resource provisioning)
            try {
                Write-PowerBILog -Level "DEBUG" -Message "Discovering Power BI workspaces via Graph API..." -Context $Context
                $graphGroups = Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/v1.0/groups?`$filter=groupTypes/any(c:c eq 'Unified') and resourceProvisioningOptions/any(c:c eq 'PowerBI')&`$top=1000" -Method GET -ErrorAction Stop

                if ($graphGroups -and $graphGroups.value) {
                    foreach ($group in $graphGroups.value) {
                        $discoveryData.Statistics.TotalWorkspaces++
                        $discoveryData.Statistics.GroupWorkspaces++

                        $workspaceInfo = @{
                            WorkspaceId = $group.id
                            Name = $group.displayName
                            Description = $group.description
                            Type = 'Graph-Fallback'
                            CreatedDateTime = $group.createdDateTime
                            Mail = $group.mail
                            MailEnabled = $group.mailEnabled
                            SecurityEnabled = $group.securityEnabled
                            Visibility = $group.visibility
                            GraphSource = $true
                        }

                        $discoveryData.Workspaces += $workspaceInfo
                        Write-PowerBILog -Level "DEBUG" -Message "Discovered workspace via Graph: $($workspaceInfo.Name)" -Context $Context
                    }

                    Write-PowerBILog -Level "SUCCESS" -Message "Discovered $($discoveryData.Statistics.TotalWorkspaces) workspaces via Graph API" -Context $Context

                    # Try to get additional metadata for each workspace
                    foreach ($workspace in $discoveryData.Workspaces.Where({$_.GraphSource})) {
                        try {
                            # Get group members (basic user information)
                            $members = Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/v1.0/groups/$($workspace.WorkspaceId)/members?`$top=50" -Method GET -ErrorAction SilentlyContinue
                            if ($members -and $members.value) {
                                $memberList = $members.value | ForEach-Object {
                                    switch ($_.PSObject.TypeNames[0]) {
                                        "Microsoft.Graph.PowerShell.Models.MicrosoftGraphUser" { "$($_.displayName) (User):$($_.userPrincipalName)" }
                                        "Microsoft.Graph.PowerShell.Models.MicrosoftGraphGroup" { "$($_.displayName) (Group)" }
                                        default { "$($_.displayName) ($($_.PSObject.TypeNames[0]))" }
                                    }
                                }
                                $workspace.Users = ($memberList -join ';').Substring(0, [Math]::Min($memberList.Length, 1000))
                            }
                        } catch {
                            Write-PowerBILog -Level "DEBUG" -Message "Could not get members for workspace $($workspace.Name): $($_.Exception.Message)" -Context $Context
                        }
                    }
                }

            } catch {
                Write-PowerBILog -Level "WARN" -Message "Graph API Power BI workspace discovery failed: $($_.Exception.Message)" -Context $Context
                $result.AddWarning("Graph API workspace discovery failed, limited workspace information available.")
            }

            # Discover Power BI administrator information via organization API
            try {
                Write-PowerBILog -Level "DEBUG" -Message "Discovering Power BI tenant settings via Graph API..." -Context $Context
                $organization = Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/v1.0/organization" -Method GET -ErrorAction Stop

                if ($organization -and $organization.value -and $organization.value.Count -gt 0) {
                    $tenantInfo = $organization.value[0]

                    # Try to get settings (Power BI root directory info)
                    try {
                        $settings = Invoke-MgGraphRequest -Uri "https://graph.microsoft.com/v1.0/groups/$($tenantInfo.id)/settings" -Method GET -ErrorAction SilentlyContinue
                        if ($settings -and $settings.value) {
                            # Look for Power BI-related settings
                            $tenantSettings = $settings.value | Where-Object { $_.displayName -like "*Power*" -or $_.templateId -like "*Power*" } | Select-Object -First 5

                            if ($tenantSettings) {
                                foreach ($setting in $tenantSettings) {
                                    $settingInfo = @{
                                        SettingName = $setting.displayName
                                        SettingId = $setting.id
                                        TemplateId = $setting.templateId
                                        TenantId = $tenantInfo.id
                                        TenantDisplayName = $tenantInfo.displayName
                                        GraphSource = $true
                                    }
                                    $discoveryData.TenantSettings += $settingInfo
                                }
                                Write-PowerBILog -Level "SUCCESS" -Message "Discovered $($discoveryData.TenantSettings.Count) tenant settings via Graph API" -Context $Context
                            }
                        }
                    } catch {
                        Write-PowerBILog -Level "DEBUG" -Message "Could not get Power BI tenant settings: $($_.Exception.Message)" -Context $Context
                    }
                }

            } catch {
                Write-PowerBILog -Level "DEBUG" -Message "Graph API tenant settings discovery failed: $($_.Exception.Message)" -Context $Context
            }

            # Add fallback statistics and summary
            Write-PowerBILog -Level "INFO" -Message "Graph API Power BI discovery completed. Statistics: $($discoveryData.Statistics.TotalWorkspaces) workspaces ($($discoveryData.Statistics.GroupWorkspaces) via Graph), $($discoveryData.TenantSettings.Count) settings" -Context $Context
            Write-PowerBILog -Level "WARN" -Message "Graph-only discovery provides limited information. Install MicrosoftPowerBIMgmt module for comprehensive discovery." -Context $Context
        }

        Write-PowerBILog -Level "SUCCESS" -Message "Completed Power BI discovery" -Context $Context
        Write-PowerBILog -Level "INFO" -Message "Statistics: $($discoveryData.Statistics.TotalWorkspaces) workspaces, $($discoveryData.Statistics.TotalReports) reports, $($discoveryData.Statistics.TotalDatasets) datasets, $($discoveryData.Statistics.TotalDashboards) dashboards" -Context $Context

        # 5. SAVE DISCOVERY DATA TO CSV FILES
        Write-PowerBILog -Level "INFO" -Message "Saving discovery data to CSV files..." -Context $Context
        
        try {
            # Save Workspaces
            if ($discoveryData.Workspaces.Count -gt 0) {
                $csvPath = Join-Path $outputPath "PowerBIWorkspaces.csv"
                $discoveryData.Workspaces | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-PowerBILog -Level "SUCCESS" -Message "Saved $($discoveryData.Workspaces.Count) workspaces to $csvPath" -Context $Context
            }
            
            # Save Reports
            if ($discoveryData.Reports.Count -gt 0) {
                $csvPath = Join-Path $outputPath "PowerBIReports.csv"
                $discoveryData.Reports | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-PowerBILog -Level "SUCCESS" -Message "Saved $($discoveryData.Reports.Count) reports to $csvPath" -Context $Context
            }
            
            # Save Datasets
            if ($discoveryData.Datasets.Count -gt 0) {
                $csvPath = Join-Path $outputPath "PowerBIDatasets.csv"
                $discoveryData.Datasets | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-PowerBILog -Level "SUCCESS" -Message "Saved $($discoveryData.Datasets.Count) datasets to $csvPath" -Context $Context
            }
            
            # Save Dashboards
            if ($discoveryData.Dashboards.Count -gt 0) {
                $csvPath = Join-Path $outputPath "PowerBIDashboards.csv"
                $discoveryData.Dashboards | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-PowerBILog -Level "SUCCESS" -Message "Saved $($discoveryData.Dashboards.Count) dashboards to $csvPath" -Context $Context
            }
            
            # Save Apps
            if ($discoveryData.Apps.Count -gt 0) {
                $csvPath = Join-Path $outputPath "PowerBIApps.csv"
                $discoveryData.Apps | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-PowerBILog -Level "SUCCESS" -Message "Saved $($discoveryData.Apps.Count) apps to $csvPath" -Context $Context
            }
            
            # Save Gateways
            if ($discoveryData.Gateways.Count -gt 0) {
                $csvPath = Join-Path $outputPath "PowerBIGateways.csv"
                $discoveryData.Gateways | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
                Write-PowerBILog -Level "SUCCESS" -Message "Saved $($discoveryData.Gateways.Count) gateways to $csvPath" -Context $Context
            }
            
            # Save Statistics summary
            $statsPath = Join-Path $outputPath "PowerBIStatistics.csv"
            @($discoveryData.Statistics) | Export-Csv -Path $statsPath -NoTypeInformation -Encoding UTF8
            Write-PowerBILog -Level "SUCCESS" -Message "Saved Power BI statistics to $statsPath" -Context $Context
            
        } catch {
            $result.AddError("Failed to save discovery data: $($_.Exception.Message)", $_.Exception, "Data Export")
        }

        # 6. SET RESULT DATA
        $result.Data = $discoveryData
        
        Write-PowerBILog -Level "HEADER" -Message "=== M&A Power BI Discovery Module Completed ===" -Context $Context
        Write-PowerBILog -Level "SUCCESS" -Message "Power BI discovery completed successfully" -Context $Context
        
    } catch {
        $result.AddError("Unexpected error in Power BI discovery: $($_.Exception.Message)", $_.Exception, "Main Function")
    }
    
    return $result
}

# Helper function to ensure path exists
function Ensure-Path {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -Path $Path -ItemType Directory -Force | Out-Null
    }
}

Export-ModuleMember -Function Invoke-PowerBIDiscovery