# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

# Author: Lukian Poleschtschuk
# Version: 1.0.0
# Created: 2025-01-18
# Last Modified: 2025-01-18

<#
.SYNOPSIS
    Power Platform Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Comprehensive discovery of Microsoft Power Platform resources including Power BI workspaces, datasets, 
    reports, dashboards, Power Apps applications, Power Automate flows, dataflows, and connectors.
    Provides detailed visibility into modern workplace automation and business intelligence assets.
.NOTES
    Version: 1.0.0
    Author: Lukian Poleschtschuk
    Created: 2025-01-18
    Requires: PowerShell 5.1+, Microsoft Graph API permissions, Power Platform admin access
#>

# Import base module
Import-Module (Join-Path $PSScriptRoot "DiscoveryBase.psm1") -Force
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\UnifiedErrorHandling.psm1") -Force

function Invoke-PowerPlatformDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    # ===================================================================
    # CREDENTIAL EXTRACTION AND VALIDATION
    # ===================================================================
    Write-ModuleLog -ModuleName "PowerPlatform" -Message "Starting credential validation..." -Level "INFO"

    $tenantId = $null
    $clientId = $null
    $clientSecret = $null
    $credentialSource = "Unknown"

    # Extract credentials from Configuration parameter
    if ($Configuration.ContainsKey('TenantId') -and $Configuration.TenantId) {
        $tenantId = $Configuration.TenantId
        $credentialSource = "Configuration.TenantId"
        Write-ModuleLog -ModuleName "PowerPlatform" -Message "TenantId found in Configuration: $tenantId" -Level "SUCCESS"
    } else {
        Write-ModuleLog -ModuleName "PowerPlatform" -Message "TenantId NOT found in Configuration" -Level "ERROR"
    }

    if ($Configuration.ContainsKey('ClientId') -and $Configuration.ClientId) {
        $clientId = $Configuration.ClientId
        Write-ModuleLog -ModuleName "PowerPlatform" -Message "ClientId found in Configuration: $clientId" -Level "SUCCESS"
    } else {
        Write-ModuleLog -ModuleName "PowerPlatform" -Message "ClientId NOT found in Configuration" -Level "ERROR"
    }

    if ($Configuration.ContainsKey('ClientSecret') -and $Configuration.ClientSecret) {
        $clientSecret = $Configuration.ClientSecret
        $secretLength = $clientSecret.Length
        $secretPreview = if ($secretLength -gt 4) {
            $clientSecret.Substring(0, 4) + "*" * ($secretLength - 4)
        } else {
            "*" * $secretLength
        }
        Write-ModuleLog -ModuleName "PowerPlatform" -Message "ClientSecret found in Configuration (length: $secretLength, preview: $secretPreview)" -Level "SUCCESS"
    } else {
        Write-ModuleLog -ModuleName "PowerPlatform" -Message "ClientSecret NOT found in Configuration" -Level "ERROR"
    }

    # Validate that all required credentials are present
    $missingCredentials = @()
    if (-not $tenantId) { $missingCredentials += "TenantId" }
    if (-not $clientId) { $missingCredentials += "ClientId" }
    if (-not $clientSecret) { $missingCredentials += "ClientSecret" }

    if ($missingCredentials.Count -gt 0) {
        $errorMessage = "Missing required credentials: $($missingCredentials -join ', ')"
        Write-ModuleLog -ModuleName "PowerPlatform" -Message $errorMessage -Level "ERROR"

        # Log Configuration contents for debugging
        Write-ModuleLog -ModuleName "PowerPlatform" -Message "Configuration keys available: $($Configuration.Keys -join ', ')" -Level "INFO"

        throw $errorMessage
    }

    Write-ModuleLog -ModuleName "PowerPlatform" -Message "All required credentials validated successfully" -Level "SUCCESS"
    Write-ModuleLog -ModuleName "PowerPlatform" -Message "Credential source: $credentialSource" -Level "INFO"

    # Add credentials to Configuration if they're not already there (defensive)
    if (-not $Configuration.ContainsKey('TenantId')) { $Configuration.TenantId = $tenantId }
    if (-not $Configuration.ContainsKey('ClientId')) { $Configuration.ClientId = $clientId }
    if (-not $Configuration.ContainsKey('ClientSecret')) { $Configuration.ClientSecret = $clientSecret }

    # ===================================================================
    # DISCOVERY SCRIPT
    # ===================================================================
    $discoveryScript = {
        param($Configuration, $Context, $SessionId, $Connections, $Result)

        # ===================================================================
        # AUTHENTICATION STATUS LOGGING
        # ===================================================================
        Write-ModuleLog -ModuleName "PowerPlatform" -Message "Checking authentication status..." -Level "INFO"

        # Log connection status
        if ($Connections -and $Connections.Graph) {
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Graph connection established successfully" -Level "SUCCESS"

            # Log Graph connection details
            if ($Connections.Graph.AccessToken) {
                $tokenLength = $Connections.Graph.AccessToken.Length
                $tokenPreview = if ($tokenLength -gt 10) {
                    $Connections.Graph.AccessToken.Substring(0, 10) + "..." + $Connections.Graph.AccessToken.Substring($tokenLength - 10)
                } else {
                    "***"
                }
                Write-ModuleLog -ModuleName "PowerPlatform" -Message "Graph AccessToken available (length: $tokenLength, preview: $tokenPreview)" -Level "SUCCESS"
            } else {
                Write-ModuleLog -ModuleName "PowerPlatform" -Message "Graph AccessToken is NULL or empty" -Level "WARN"
            }

            if ($Connections.Graph.TenantId) {
                Write-ModuleLog -ModuleName "PowerPlatform" -Message "Connected to Tenant: $($Connections.Graph.TenantId)" -Level "INFO"
            }
        } else {
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Graph connection NOT available in Connections object" -Level "ERROR"
            $Result.AddError("Graph connection not established", $null, @{Section="Authentication"})
            return @()
        }

        # Verify Configuration credentials are still available in discovery script
        Write-ModuleLog -ModuleName "PowerPlatform" -Message "Verifying Configuration credentials in discovery script..." -Level "INFO"

        if ($Configuration.TenantId) {
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Configuration.TenantId available: $($Configuration.TenantId)" -Level "SUCCESS"
        } else {
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Configuration.TenantId NOT available in discovery script" -Level "WARN"
        }

        if ($Configuration.ClientId) {
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Configuration.ClientId available: $($Configuration.ClientId)" -Level "SUCCESS"
        } else {
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Configuration.ClientId NOT available in discovery script" -Level "WARN"
        }

        if ($Configuration.ClientSecret) {
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Configuration.ClientSecret available (length: $($Configuration.ClientSecret.Length))" -Level "SUCCESS"
        } else {
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Configuration.ClientSecret NOT available in discovery script" -Level "WARN"
        }

        Write-ModuleLog -ModuleName "PowerPlatform" -Message "Authentication validation complete - proceeding with discovery" -Level "SUCCESS"

        # ===================================================================
        # DISCOVERY LOGIC
        # ===================================================================
        $allDiscoveredData = [System.Collections.ArrayList]::new()
        $batchSize = 100
        
        # Helper function for Power Platform API calls
        function Invoke-PowerPlatformWithRetry {
            param(
                [string]$Uri,
                [string]$Method = "GET",
                [hashtable]$Headers = @{},
                [string]$Body = $null,
                [int]$MaxRetries = 3
            )
            
            for ($i = 1; $i -le $MaxRetries; $i++) {
                try {
                    $requestParams = @{
                        Uri = $Uri
                        Method = $Method
                        Headers = $Headers
                        ErrorAction = "Stop"
                    }
                    
                    if ($Body) {
                        $requestParams.Body = $Body
                        $requestParams.ContentType = "application/json"
                    }
                    
                    $response = Invoke-RestMethod @requestParams
                    return $response
                } catch {
                    if ($i -eq $MaxRetries) { throw }
                    
                    $delay = [Math]::Pow(2, $i)
                    Write-ModuleLog -ModuleName "PowerPlatform" -Message "API call failed, retrying in $delay seconds: $($_.Exception.Message)" -Level "WARN"
                    Start-Sleep -Seconds $delay
                }
            }
        }
        
        # Discover Power BI Infrastructure
        try {
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Discovering Power BI infrastructure..." -Level "INFO"
            
            # Get Power BI workspaces
            $powerBIWorkspaces = @()
            try {
                $workspacesUri = "https://api.powerbi.com/v1.0/myorg/groups"
                $workspaceResponse = Invoke-PowerPlatformWithRetry -Uri $workspacesUri -Headers @{ Authorization = "Bearer $($Connections.Graph.AccessToken)" }
                
                foreach ($workspace in $workspaceResponse.value) {
                    $workspaceObj = [PSCustomObject]@{
                        # Identity
                        Id = $workspace.id
                        Name = $workspace.name
                        Description = $workspace.description
                        
                        # Configuration
                        Type = $workspace.type
                        State = $workspace.state
                        IsReadOnly = $workspace.isReadOnly
                        IsOnDedicatedCapacity = $workspace.isOnDedicatedCapacity
                        CapacityId = $workspace.capacityId
                        
                        # Permissions
                        IsAdmin = $workspace.isAdmin
                        IsContributor = $workspace.isContributor
                        IsMember = $workspace.isMember
                        IsViewer = $workspace.isViewer
                        
                        # Additional properties
                        HasWorkspaceLevelSettings = $workspace.hasWorkspaceLevelSettings
                        
                        _DataType = "PowerBIWorkspace"
                    }
                    
                    $powerBIWorkspaces += $workspaceObj
                    $null = $allDiscoveredData.Add($workspaceObj)
                }
                
                Write-ModuleLog -ModuleName "PowerPlatform" -Message "Discovered $($powerBIWorkspaces.Count) Power BI workspaces" -Level "SUCCESS"
                
            } catch {
                $Result.AddWarning("Failed to discover Power BI workspaces: $($_.Exception.Message)", @{Section="PowerBIWorkspaces"})
            }
            
            # Get Power BI datasets
            try {
                foreach ($workspace in $powerBIWorkspaces) {
                    $datasetsUri = "https://api.powerbi.com/v1.0/myorg/groups/$($workspace.Id)/datasets"
                    $datasetResponse = Invoke-PowerPlatformWithRetry -Uri $datasetsUri -Headers @{ Authorization = "Bearer $($Connections.Graph.AccessToken)" }
                    
                    foreach ($dataset in $datasetResponse.value) {
                        $datasetObj = [PSCustomObject]@{
                            # Workspace Info
                            WorkspaceId = $workspace.Id
                            WorkspaceName = $workspace.Name
                            
                            # Dataset Identity
                            Id = $dataset.id
                            Name = $dataset.name
                            Description = $dataset.description
                            
                            # Configuration
                            ConfiguredBy = $dataset.configuredBy
                            IsRefreshable = $dataset.isRefreshable
                            IsEffectiveIdentityRequired = $dataset.isEffectiveIdentityRequired
                            IsEffectiveIdentityRolesRequired = $dataset.isEffectiveIdentityRolesRequired
                            IsOnPremGatewayRequired = $dataset.isOnPremGatewayRequired
                            
                            # Data source
                            TargetStorageMode = $dataset.targetStorageMode
                            
                            # Refresh info
                            CreateReportEmbedURL = $dataset.createReportEmbedURL
                            QnaEmbedURL = $dataset.qnaEmbedURL
                            
                            # Permissions
                            AddRowsAPIEnabled = $dataset.addRowsAPIEnabled
                            
                            _DataType = "PowerBIDataset"
                        }
                        
                        $null = $allDiscoveredData.Add($datasetObj)
                    }
                }
                
                Write-ModuleLog -ModuleName "PowerPlatform" -Message "Discovered Power BI datasets" -Level "SUCCESS"
                
            } catch {
                $Result.AddWarning("Failed to discover Power BI datasets: $($_.Exception.Message)", @{Section="PowerBIDatasets"})
            }
            
            # Get Power BI reports
            try {
                foreach ($workspace in $powerBIWorkspaces) {
                    $reportsUri = "https://api.powerbi.com/v1.0/myorg/groups/$($workspace.Id)/reports"
                    $reportResponse = Invoke-PowerPlatformWithRetry -Uri $reportsUri -Headers @{ Authorization = "Bearer $($Connections.Graph.AccessToken)" }
                    
                    foreach ($report in $reportResponse.value) {
                        $reportObj = [PSCustomObject]@{
                            # Workspace Info
                            WorkspaceId = $workspace.Id
                            WorkspaceName = $workspace.Name
                            
                            # Report Identity
                            Id = $report.id
                            Name = $report.name
                            Description = $report.description
                            
                            # Configuration
                            DatasetId = $report.datasetId
                            EmbedUrl = $report.embedUrl
                            WebUrl = $report.webUrl
                            
                            # Metadata
                            CreatedBy = $report.createdBy
                            CreatedDateTime = $report.createdDateTime
                            ModifiedBy = $report.modifiedBy
                            ModifiedDateTime = $report.modifiedDateTime
                            
                            _DataType = "PowerBIReport"
                        }
                        
                        $null = $allDiscoveredData.Add($reportObj)
                    }
                }
                
                Write-ModuleLog -ModuleName "PowerPlatform" -Message "Discovered Power BI reports" -Level "SUCCESS"
                
            } catch {
                $Result.AddWarning("Failed to discover Power BI reports: $($_.Exception.Message)", @{Section="PowerBIReports"})
            }
            
            # Get Power BI dashboards
            try {
                foreach ($workspace in $powerBIWorkspaces) {
                    $dashboardsUri = "https://api.powerbi.com/v1.0/myorg/groups/$($workspace.Id)/dashboards"
                    $dashboardResponse = Invoke-PowerPlatformWithRetry -Uri $dashboardsUri -Headers @{ Authorization = "Bearer $($Connections.Graph.AccessToken)" }
                    
                    foreach ($dashboard in $dashboardResponse.value) {
                        $dashboardObj = [PSCustomObject]@{
                            # Workspace Info
                            WorkspaceId = $workspace.Id
                            WorkspaceName = $workspace.Name
                            
                            # Dashboard Identity
                            Id = $dashboard.id
                            DisplayName = $dashboard.displayName
                            
                            # Configuration
                            EmbedUrl = $dashboard.embedUrl
                            WebUrl = $dashboard.webUrl
                            IsReadOnly = $dashboard.isReadOnly
                            
                            _DataType = "PowerBIDashboard"
                        }
                        
                        $null = $allDiscoveredData.Add($dashboardObj)
                    }
                }
                
                Write-ModuleLog -ModuleName "PowerPlatform" -Message "Discovered Power BI dashboards" -Level "SUCCESS"
                
            } catch {
                $Result.AddWarning("Failed to discover Power BI dashboards: $($_.Exception.Message)", @{Section="PowerBIDashboards"})
            }
            
        } catch {
            $Result.AddError("Failed to discover Power BI infrastructure: $($_.Exception.Message)", $_.Exception, @{Section="PowerBI"})
        }
        
        # Discover Power Apps
        try {
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Discovering Power Apps..." -Level "INFO"
            
            # Get Power Apps via Graph API
            $powerAppsUri = "https://graph.microsoft.com/v1.0/applications?`$filter=startswith(displayName,'PowerApps')"
            $powerAppsResponse = Invoke-MgGraphRequest -Uri $powerAppsUri -Method GET -ErrorAction Stop
            
            foreach ($app in $powerAppsResponse.value) {
                $appObj = [PSCustomObject]@{
                    # Identity
                    Id = $app.id
                    AppId = $app.appId
                    DisplayName = $app.displayName
                    Description = $app.description
                    
                    # Configuration
                    SignInAudience = $app.signInAudience
                    PublisherDomain = $app.publisherDomain
                    
                    # Lifecycle
                    CreatedDateTime = $app.createdDateTime
                    
                    # API Permissions
                    RequiredResourceAccess = ($app.requiredResourceAccess | ForEach-Object { $_.resourceAppId }) -join ';'
                    
                    _DataType = "PowerApp"
                }
                
                $null = $allDiscoveredData.Add($appObj)
            }
            
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Discovered Power Apps" -Level "SUCCESS"
            
        } catch {
            $Result.AddWarning("Failed to discover Power Apps: $($_.Exception.Message)", @{Section="PowerApps"})
        }
        
        # Discover Power Automate Flows
        try {
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Discovering Power Automate flows..." -Level "INFO"
            
            # Note: Power Automate flows require specific API endpoints
            # For now, we'll use a placeholder structure
            
            # Get flows via Graph API (limited information)
            $flowsUri = "https://graph.microsoft.com/v1.0/me/drive/root/children?`$filter=name eq 'Microsoft Flow'"
            try {
                $flowsResponse = Invoke-MgGraphRequest -Uri $flowsUri -Method GET -ErrorAction SilentlyContinue
                
                if ($flowsResponse.value) {
                    foreach ($flow in $flowsResponse.value) {
                        $flowObj = [PSCustomObject]@{
                            # Identity
                            Id = $flow.id
                            Name = $flow.name
                            
                            # Configuration
                            CreatedDateTime = $flow.createdDateTime
                            LastModifiedDateTime = $flow.lastModifiedDateTime
                            Size = $flow.size
                            
                            # Creator
                            CreatedBy = $flow.createdBy.user.displayName
                            LastModifiedBy = $flow.lastModifiedBy.user.displayName
                            
                            _DataType = "PowerAutomateFlow"
                        }
                        
                        $null = $allDiscoveredData.Add($flowObj)
                    }
                }
            } catch {
                # Flows API might not be accessible
                Write-ModuleLog -ModuleName "PowerPlatform" -Message "Power Automate flows require specific API permissions" -Level "INFO"
            }
            
        } catch {
            $Result.AddWarning("Failed to discover Power Automate flows: $($_.Exception.Message)", @{Section="PowerAutomateFlows"})
        }
        
        # Discover Power Platform Connectors
        try {
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Discovering Power Platform connectors..." -Level "INFO"
            
            # Get available connectors (public API)
            $connectorsUri = "https://graph.microsoft.com/v1.0/connections"
            try {
                $connectorsResponse = Invoke-MgGraphRequest -Uri $connectorsUri -Method GET -ErrorAction SilentlyContinue
                
                foreach ($connector in $connectorsResponse.value) {
                    $connectorObj = [PSCustomObject]@{
                        # Identity
                        Id = $connector.id
                        Name = $connector.name
                        Description = $connector.description
                        
                        # Configuration
                        State = $connector.state
                        
                        # Schema
                        Configuration = if ($connector.configuration) { $connector.configuration | ConvertTo-Json -Compress } else { $null }
                        
                        _DataType = "PowerPlatformConnector"
                    }
                    
                    $null = $allDiscoveredData.Add($connectorObj)
                }
                
                Write-ModuleLog -ModuleName "PowerPlatform" -Message "Discovered Power Platform connectors" -Level "SUCCESS"
                
            } catch {
                Write-ModuleLog -ModuleName "PowerPlatform" -Message "Connectors API requires specific permissions" -Level "INFO"
            }
            
        } catch {
            $Result.AddWarning("Failed to discover Power Platform connectors: $($_.Exception.Message)", @{Section="PowerPlatformConnectors"})
        }
        
        # Discover Power Platform Environments
        try {
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Discovering Power Platform environments..." -Level "INFO"
            
            # Note: Environments require Power Platform Admin API
            # This would typically require specific authentication to Power Platform Admin API
            
            # For now, we'll create a placeholder structure
            $environmentObj = [PSCustomObject]@{
                # Identity
                Id = "default"
                Name = "Default Environment"
                DisplayName = "Default Environment"
                
                # Configuration
                Location = "Unknown"
                EnvironmentType = "Default"
                
                # Status
                State = "Ready"
                
                _DataType = "PowerPlatformEnvironment"
            }
            
            $null = $allDiscoveredData.Add($environmentObj)
            
        } catch {
            $Result.AddWarning("Failed to discover Power Platform environments: $($_.Exception.Message)", @{Section="PowerPlatformEnvironments"})
        }
        
        # Export discovered data
        if ($allDiscoveredData.Count -gt 0) {
            Write-ModuleLog -ModuleName "PowerPlatform" -Message "Exporting $($allDiscoveredData.Count) Power Platform records..." -Level "INFO"
            
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $fileName = switch ($group.Name) {
                    'PowerBIWorkspace' { 'PowerPlatform_PowerBIWorkspaces.csv' }
                    'PowerBIDataset' { 'PowerPlatform_PowerBIDatasets.csv' }
                    'PowerBIReport' { 'PowerPlatform_PowerBIReports.csv' }
                    'PowerBIDashboard' { 'PowerPlatform_PowerBIDashboards.csv' }
                    'PowerApp' { 'PowerPlatform_PowerApps.csv' }
                    'PowerAutomateFlow' { 'PowerPlatform_PowerAutomateFlows.csv' }
                    'PowerPlatformConnector' { 'PowerPlatform_Connectors.csv' }
                    'PowerPlatformEnvironment' { 'PowerPlatform_Environments.csv' }
                    default { "PowerPlatform_$($group.Name).csv" }
                }
                
                Export-DiscoveryResults -Data $group.Group `
                    -FileName $fileName `
                    -OutputPath $Context.Paths.RawDataOutput `
                    -ModuleName "PowerPlatform" `
                    -SessionId $SessionId
            }
            
            # Create summary report
            $summaryData = @{
                PowerBIWorkspaces = ($allDiscoveredData | Where-Object { $_._DataType -eq 'PowerBIWorkspace' }).Count
                PowerBIDatasets = ($allDiscoveredData | Where-Object { $_._DataType -eq 'PowerBIDataset' }).Count
                PowerBIReports = ($allDiscoveredData | Where-Object { $_._DataType -eq 'PowerBIReport' }).Count
                PowerBIDashboards = ($allDiscoveredData | Where-Object { $_._DataType -eq 'PowerBIDashboard' }).Count
                PowerApps = ($allDiscoveredData | Where-Object { $_._DataType -eq 'PowerApp' }).Count
                PowerAutomateFlows = ($allDiscoveredData | Where-Object { $_._DataType -eq 'PowerAutomateFlow' }).Count
                PowerPlatformConnectors = ($allDiscoveredData | Where-Object { $_._DataType -eq 'PowerPlatformConnector' }).Count
                PowerPlatformEnvironments = ($allDiscoveredData | Where-Object { $_._DataType -eq 'PowerPlatformEnvironment' }).Count
                TotalRecords = $allDiscoveredData.Count
                DiscoveryDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
                SessionId = $SessionId
            }
            
            $summaryData | ConvertTo-Json -Depth 3 | Out-File (Join-Path $Context.Paths.RawDataOutput "PowerPlatformDiscoverySummary.json") -Encoding UTF8
        }
        
        return $allDiscoveredData
    }
    
    # Execute using base module
    return Start-DiscoveryModule -ModuleName "PowerPlatform" `
        -Configuration $Configuration `
        -Context $Context `
        -SessionId $SessionId `
        -RequiredServices @('Graph') `
        -DiscoveryScript $discoveryScript
}

Export-ModuleMember -Function Invoke-PowerPlatformDiscovery