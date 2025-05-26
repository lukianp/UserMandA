<#
.SYNOPSIS
    Microsoft Graph discovery for M&A Discovery Suite
.DESCRIPTION
    Handles Microsoft Graph data collection for users, groups, and applications
#>

function Invoke-GraphDiscovery {
    param([hashtable]$Configuration)
    
    try {
        Write-MandALog "Starting Microsoft Graph discovery" -Level "HEADER"
        
        if (-not (Test-GraphConnection)) {
            throw "Microsoft Graph connection not available"
        }
        
        $outputPath = $Configuration.environment.outputPath
        $discoveryResults = @{}
        
        # Graph Users
        Write-MandALog "Discovering Graph Users..." -Level "INFO"
        $discoveryResults.Users = Get-GraphUsersData -OutputPath $outputPath -Configuration $Configuration
        
        # Graph Groups
        Write-MandALog "Discovering Graph Groups..." -Level "INFO"
        $discoveryResults.Groups = Get-GraphGroupsData -OutputPath $outputPath -Configuration $Configuration
        
        # Graph Applications
        Write-MandALog "Discovering Graph Applications..." -Level "INFO"
        $discoveryResults.Applications = Get-GraphApplicationsData -OutputPath $outputPath -Configuration $Configuration
        
        # Graph Devices
        Write-MandALog "Discovering Graph Devices..." -Level "INFO"
        $discoveryResults.Devices = Get-GraphDevicesData -OutputPath $outputPath -Configuration $Configuration
        
        # Graph Licenses
        Write-MandALog "Discovering Graph Licenses..." -Level "INFO"
        $discoveryResults.Licenses = Get-GraphLicensesData -OutputPath $outputPath -Configuration $Configuration
        
        # OneDrive Usage
        Write-MandALog "Discovering OneDrive Usage..." -Level "INFO"
        $discoveryResults.OneDriveUsage = Get-OneDriveUsageData -OutputPath $outputPath -Configuration $Configuration
        
        # Application Proxies
        Write-MandALog "Discovering Application Proxies..." -Level "INFO"
        $discoveryResults.ApplicationProxies = Get-ApplicationProxiesData -OutputPath $outputPath -Configuration $Configuration
        
        Write-MandALog "Microsoft Graph discovery completed successfully" -Level "SUCCESS"
        return $discoveryResults
        
    } catch {
        Write-MandALog "Microsoft Graph discovery failed: $($_.Exception.Message)" -Level "ERROR"
        throw
    }
}

function Test-GraphConnection {
    try {
        $context = Get-MgContext -ErrorAction SilentlyContinue
        if (-not $context) {
            return $false
        }
        
        # Test basic Graph access
        $org = Get-MgOrganization -Top 1 -ErrorAction SilentlyContinue
        return ($org -ne $null)
        
    } catch {
        Write-MandALog "Graph connection test failed: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Get-GraphUsersData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "GraphUsers.csv"
    $usersData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Graph Users CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Graph users" -Level "INFO"
        
        $properties = @(
            'id', 'userPrincipalName', 'displayName', 'givenName', 'surname', 'mail',
            'jobTitle', 'department', 'companyName', 'officeLocation', 'mobilePhone',
            'businessPhones', 'accountEnabled', 'createdDateTime', 'lastSignInDateTime',
            'assignedLicenses', 'usageLocation', 'preferredLanguage', 'employeeId',
            'onPremisesSyncEnabled', 'onPremisesDistinguishedName', 'onPremisesSamAccountName'
        )
        
        $users = Get-MgUser -All -Property $properties -ErrorAction Stop
        Write-MandALog "Retrieved $($users.Count) Graph users" -Level "SUCCESS"
        
        $processedCount = 0
        foreach ($user in $users) {
            $processedCount++
            if ($processedCount % 100 -eq 0) {
                Write-Progress -Activity "Processing Graph Users" -Status "User $processedCount of $($users.Count)" -PercentComplete (($processedCount / $users.Count) * 100)
            }
            
            $usersData.Add([PSCustomObject]@{
                Id = $user.Id
                UserPrincipalName = $user.UserPrincipalName
                DisplayName = $user.DisplayName
                GivenName = $user.GivenName
                Surname = $user.Surname
                Mail = $user.Mail
                JobTitle = $user.JobTitle
                Department = $user.Department
                CompanyName = $user.CompanyName
                OfficeLocation = $user.OfficeLocation
                MobilePhone = $user.MobilePhone
                BusinessPhones = ($user.BusinessPhones -join ';')
                AccountEnabled = $user.AccountEnabled
                CreatedDateTime = $user.CreatedDateTime
                LastSignInDateTime = $user.LastSignInDateTime
                AssignedLicenses = ($user.AssignedLicenses.SkuId -join ';')
                UsageLocation = $user.UsageLocation
                PreferredLanguage = $user.PreferredLanguage
                EmployeeId = $user.EmployeeId
                OnPremisesSyncEnabled = $user.OnPremisesSyncEnabled
                OnPremisesDistinguishedName = $user.OnPremisesDistinguishedName
                OnPremisesSamAccountName = $user.OnPremisesSamAccountName
            })
        }
        
        Write-Progress -Activity "Processing Graph Users" -Completed
        
        # Export to CSV
        Export-DataToCSV -Data $usersData -FilePath $outputFile
        Write-MandALog "Exported $($usersData.Count) Graph users to CSV" -Level "SUCCESS"
        
        return $usersData
        
    } catch {
        Write-MandALog "Error retrieving Graph Users: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            Id = $null; UserPrincipalName = $null; DisplayName = $null; GivenName = $null
            Surname = $null; Mail = $null; JobTitle = $null; Department = $null
            CompanyName = $null; OfficeLocation = $null; MobilePhone = $null
            BusinessPhones = $null; AccountEnabled = $null; CreatedDateTime = $null
            LastSignInDateTime = $null; AssignedLicenses = $null; UsageLocation = $null
            PreferredLanguage = $null; EmployeeId = $null; OnPremisesSyncEnabled = $null
            OnPremisesDistinguishedName = $null; OnPremisesSamAccountName = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

function Get-GraphGroupsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "GraphGroups.csv"
    $groupsData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Graph Groups CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Graph groups" -Level "INFO"
        
        $properties = @(
            'id', 'displayName', 'description', 'groupTypes', 'securityEnabled',
            'mailEnabled', 'mail', 'createdDateTime', 'onPremisesSyncEnabled',
            'onPremisesDistinguishedName', 'onPremisesSamAccountName'
        )
        
        $groups = Get-MgGroup -All -Property $properties -ErrorAction Stop
        Write-MandALog "Retrieved $($groups.Count) Graph groups" -Level "SUCCESS"
        
        $processedCount = 0
        foreach ($group in $groups) {
            $processedCount++
            if ($processedCount % 50 -eq 0) {
                Write-Progress -Activity "Processing Graph Groups" -Status "Group $processedCount of $($groups.Count)" -PercentComplete (($processedCount / $groups.Count) * 100)
            }
            
            # Get member count
            $memberCount = 0
            try {
                $members = Get-MgGroupMember -GroupId $group.Id -All -ErrorAction SilentlyContinue
                $memberCount = $members.Count
            } catch {
                # Ignore errors for member count
            }
            
            $groupsData.Add([PSCustomObject]@{
                Id = $group.Id
                DisplayName = $group.DisplayName
                Description = $group.Description
                GroupTypes = ($group.GroupTypes -join ';')
                SecurityEnabled = $group.SecurityEnabled
                MailEnabled = $group.MailEnabled
                Mail = $group.Mail
                CreatedDateTime = $group.CreatedDateTime
                OnPremisesSyncEnabled = $group.OnPremisesSyncEnabled
                OnPremisesDistinguishedName = $group.OnPremisesDistinguishedName
                OnPremisesSamAccountName = $group.OnPremisesSamAccountName
                MemberCount = $memberCount
            })
        }
        
        Write-Progress -Activity "Processing Graph Groups" -Completed
        
        # Export to CSV
        Export-DataToCSV -Data $groupsData -FilePath $outputFile
        Write-MandALog "Exported $($groupsData.Count) Graph groups to CSV" -Level "SUCCESS"
        
        return $groupsData
        
    } catch {
        Write-MandALog "Error retrieving Graph Groups: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            Id = $null; DisplayName = $null; Description = $null; GroupTypes = $null
            SecurityEnabled = $null; MailEnabled = $null; Mail = $null
            CreatedDateTime = $null; OnPremisesSyncEnabled = $null
            OnPremisesDistinguishedName = $null; OnPremisesSamAccountName = $null
            MemberCount = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

function Get-GraphApplicationsData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "GraphApplications.csv"
    $appsData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Graph Applications CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Graph applications" -Level "INFO"
        
        $properties = @(
            'id', 'appId', 'displayName', 'description', 'createdDateTime',
            'publisherDomain', 'signInAudience', 'tags'
        )
        
        $applications = Get-MgApplication -All -Property $properties -ErrorAction Stop
        Write-MandALog "Retrieved $($applications.Count) Graph applications" -Level "SUCCESS"
        
        foreach ($app in $applications) {
            $appsData.Add([PSCustomObject]@{
                Id = $app.Id
                AppId = $app.AppId
                DisplayName = $app.DisplayName
                Description = $app.Description
                CreatedDateTime = $app.CreatedDateTime
                PublisherDomain = $app.PublisherDomain
                SignInAudience = $app.SignInAudience
                Tags = ($app.Tags -join ';')
            })
        }
        
        # Export to CSV
        Export-DataToCSV -Data $appsData -FilePath $outputFile
        Write-MandALog "Exported $($appsData.Count) Graph applications to CSV" -Level "SUCCESS"
        
        return $appsData
        
    } catch {
        Write-MandALog "Error retrieving Graph Applications: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            Id = $null; AppId = $null; DisplayName = $null; Description = $null
            CreatedDateTime = $null; PublisherDomain = $null; SignInAudience = $null
            Tags = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

function Get-GraphDevicesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "GraphDevices.csv"
    $devicesData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Graph Devices CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Graph devices" -Level "INFO"
        
        $properties = @(
            'id', 'displayName', 'deviceId', 'operatingSystem', 'operatingSystemVersion',
            'trustType', 'isCompliant', 'isManaged', 'registrationDateTime',
            'approximateLastSignInDateTime', 'deviceOwnership', 'enrollmentType'
        )
        
        $devices = Get-MgDevice -All -Property $properties -ErrorAction Stop
        Write-MandALog "Retrieved $($devices.Count) Graph devices" -Level "SUCCESS"
        
        foreach ($device in $devices) {
            $devicesData.Add([PSCustomObject]@{
                Id = $device.Id
                DisplayName = $device.DisplayName
                DeviceId = $device.DeviceId
                OperatingSystem = $device.OperatingSystem
                OperatingSystemVersion = $device.OperatingSystemVersion
                TrustType = $device.TrustType
                IsCompliant = $device.IsCompliant
                IsManaged = $device.IsManaged
                RegistrationDateTime = $device.RegistrationDateTime
                ApproximateLastSignInDateTime = $device.ApproximateLastSignInDateTime
                DeviceOwnership = $device.DeviceOwnership
                EnrollmentType = $device.EnrollmentType
            })
        }
        
        # Export to CSV
        Export-DataToCSV -Data $devicesData -FilePath $outputFile
        Write-MandALog "Exported $($devicesData.Count) Graph devices to CSV" -Level "SUCCESS"
        
        return $devicesData
        
    } catch {
        Write-MandALog "Error retrieving Graph Devices: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            Id = $null; DisplayName = $null; DeviceId = $null; OperatingSystem = $null
            OperatingSystemVersion = $null; TrustType = $null; IsCompliant = $null
            IsManaged = $null; RegistrationDateTime = $null; ApproximateLastSignInDateTime = $null
            DeviceOwnership = $null; EnrollmentType = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

function Get-GraphLicensesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "GraphLicenses.csv"
    $licensesData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Graph Licenses CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving Graph licenses" -Level "INFO"
        
        $subscribedSkus = Get-MgSubscribedSku -All -ErrorAction Stop
        Write-MandALog "Retrieved $($subscribedSkus.Count) Graph licenses" -Level "SUCCESS"
        
        foreach ($sku in $subscribedSkus) {
            $licensesData.Add([PSCustomObject]@{
                SkuId = $sku.SkuId
                SkuPartNumber = $sku.SkuPartNumber
                ConsumedUnits = $sku.ConsumedUnits
                PrepaidUnits = $sku.PrepaidUnits.Enabled
                ServicePlans = ($sku.ServicePlans.ServicePlanName -join ';')
                CapabilityStatus = $sku.CapabilityStatus
                AppliesTo = $sku.AppliesTo
            })
        }
        
        # Export to CSV
        Export-DataToCSV -Data $licensesData -FilePath $outputFile
        Write-MandALog "Exported $($licensesData.Count) Graph licenses to CSV" -Level "SUCCESS"
        
        return $licensesData
        
    } catch {
        Write-MandALog "Error retrieving Graph Licenses: $($_.Exception.Message)" -Level "ERROR"
        
        # Create empty CSV with headers
        $headers = [PSCustomObject]@{
            SkuId = $null; SkuPartNumber = $null; ConsumedUnits = $null
            PrepaidUnits = $null; ServicePlans = $null; CapabilityStatus = $null
            AppliesTo = $null
        }
        Export-DataToCSV -Data @($headers) -FilePath $outputFile
        
        return @()
    }
}

function Get-OneDriveUsageData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "OneDriveUsage.csv"
    $oneDriveData = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "OneDrive Usage CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving OneDrive usage report..." -Level "INFO"
        
        # Create temp file path
        $tempFile = Join-Path $env:TEMP "onedrive_report_$(Get-Date -Format 'yyyyMMddHHmmss').csv"
        
        try {
            # Get the report data using HttpResponseMessage
            Write-MandALog "Fetching OneDrive usage report for past 30 days..." -Level "INFO"
            $response = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/v1.0/reports/getOneDriveUsageAccountDetail(period='D30')" -OutputType HttpResponseMessage
            
            if ($response -and $response.Content) {
                # Read the content from the HTTP response
                $reportContent = $response.Content.ReadAsStringAsync().Result
                # Save to temp file
                $reportContent | Out-File -FilePath $tempFile -Encoding UTF8
                
                # Import and process
                $reportData = Import-Csv -Path $tempFile -ErrorAction Stop
                
                Write-MandALog "Processing $($reportData.Count) OneDrive accounts" -Level "INFO"
                
                foreach ($row in $reportData) {
                    if ($row.'Owner Principal Name' -and $row.'Owner Principal Name' -ne "") {
                        # Parse storage values
                        $totalBytes = if ($row.'Storage Allocated (Byte)') { [double]$row.'Storage Allocated (Byte)' } else { 0 }
                        $usedBytes = if ($row.'Storage Used (Byte)') { [double]$row.'Storage Used (Byte)' } else { 0 }
                        
                        $oneDriveData.Add([PSCustomObject]@{
                            UserPrincipalName = $row.'Owner Principal Name'
                            DisplayName       = $row.'Owner Display Name'
                            TotalMB           = [math]::Round($totalBytes / 1MB, 2)
                            UsedMB            = [math]::Round($usedBytes / 1MB, 2)
                            AvailableMB       = [math]::Round(($totalBytes - $usedBytes) / 1MB, 2)
                            FileCount         = if ($row.'File Count') { $row.'File Count' } else { "0" }
                            ActiveFileCount   = if ($row.'Active File Count') { $row.'Active File Count' } else { "0" }
                            LastActivityDate  = $row.'Last Activity Date'
                            ReportDate        = $row.'Report Refresh Date'
                        })
                    }
                }
                
                # Clean up temp file
                Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
            }
            
            Write-MandALog "Found $($oneDriveData.Count) OneDrive accounts with usage data" -Level "SUCCESS"
            
        } catch {
            Write-MandALog "Primary method failed: $($_.Exception.Message)" -Level "ERROR"
            Write-MandALog "Attempting alternate Graph API approach..." -Level "INFO"
            
            # Fallback: Try beta endpoint
            try {
                $betaResponse = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/beta/reports/getOneDriveUsageAccountDetail(period='D30')" -OutputType HttpResponseMessage
                
                if ($betaResponse -and $betaResponse.Content) {
                    # Read the content from the HTTP response
                    $betaReportContent = $betaResponse.Content.ReadAsStringAsync().Result
                    $betaReportContent | Out-File -FilePath $tempFile -Encoding UTF8
                    $reportData = Import-Csv -Path $tempFile -ErrorAction Stop
                    
                    foreach ($row in $reportData) {
                        if ($row.'Owner Principal Name' -and $row.'Owner Principal Name' -ne "") {
                            $totalBytes = if ($row.'Storage Allocated (Byte)') { [double]$row.'Storage Allocated (Byte)' } else { 0 }
                            $usedBytes = if ($row.'Storage Used (Byte)') { [double]$row.'Storage Used (Byte)' } else { 0 }
                            
                            $oneDriveData.Add([PSCustomObject]@{
                                UserPrincipalName = $row.'Owner Principal Name'
                                DisplayName       = $row.'Owner Display Name'
                                TotalMB           = [math]::Round($totalBytes / 1MB, 2)
                                UsedMB            = [math]::Round($usedBytes / 1MB, 2)
                                AvailableMB       = [math]::Round(($totalBytes - $usedBytes) / 1MB, 2)
                                FileCount         = if ($row.'File Count') { $row.'File Count' } else { "0" }
                                ActiveFileCount   = if ($row.'Active File Count') { $row.'Active File Count' } else { "0" }
                                LastActivityDate  = $row.'Last Activity Date'
                                ReportDate        = $row.'Report Refresh Date'
                            })
                        }
                    }
                    
                    Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
                }
            } catch {
                Write-MandALog "Beta endpoint also failed: $($_.Exception.Message)" -Level "ERROR"
            }
        }
        
    } catch {
        Write-MandALog "Error retrieving OneDrive Usage: $($_.Exception.Message)" -Level "ERROR"
    } finally {
        # Clean up any temp files
        if (Test-Path $tempFile) {
            Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
        }
    }
    
    # Export to CSV
    Export-DataToCSV -Data $oneDriveData -FilePath $outputFile
    Write-MandALog "Exported $($oneDriveData.Count) OneDrive usage records to CSV" -Level "SUCCESS"
    
    return $oneDriveData
}

function Get-ApplicationProxiesData {
    param(
        [string]$OutputPath,
        [hashtable]$Configuration
    )
    
    $outputFile = Join-Path $OutputPath "ApplicationProxies.csv"
    $appProxies = [System.Collections.Generic.List[PSCustomObject]]::new()
    
    if ($Configuration.discovery.skipExistingFiles -and (Test-Path $outputFile)) {
        Write-MandALog "Application Proxies CSV already exists. Skipping." -Level "INFO"
        return Import-DataFromCSV -FilePath $outputFile
    }
    
    try {
        Write-MandALog "Retrieving application proxy applications..." -Level "INFO"
        
        $applications = Get-MgApplication -All -Property Id,DisplayName,AppId,OnPremisesPublishing -ErrorAction Stop
        $proxyApps = $applications | Where-Object { $_.OnPremisesPublishing }
        
        Write-MandALog "Found $($proxyApps.Count) application proxy applications" -Level "INFO"
        
        foreach ($app in $proxyApps) {
            $publishing = $app.OnPremisesPublishing
            $assignments = try {
                $sp = Get-MgServicePrincipal -Filter "AppId eq '$($app.AppId)'" -ErrorAction SilentlyContinue
                if ($sp) {
                    (Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $sp.Id -ErrorAction SilentlyContinue |
                     Select-Object -ExpandProperty PrincipalId) -join ';'
                } else { "No assignments" }
            } catch { "Error retrieving assignments" }
            
            $appProxies.Add([PSCustomObject]@{
                AppId          = $app.AppId
                DisplayName    = $app.DisplayName
                InternalUrl    = $publishing.InternalUrl
                ExternalUrl    = $publishing.ExternalUrl
                Assignments    = $assignments
                ConnectorGroup = if ($publishing.OnPremisesApplicationSegments -and $publishing.OnPremisesApplicationSegments[0]) {
                    $publishing.OnPremisesApplicationSegments[0].AlternateUrl
                } else { "N/A" }
            })
        }
        
        Write-MandALog "Processed $($appProxies.Count) application proxy applications" -Level "SUCCESS"
        
    } catch {
        Write-MandALog "Error retrieving Application Proxies: $($_.Exception.Message)" -Level "ERROR"
    }
    
    # Export to CSV
    Export-DataToCSV -Data $appProxies -FilePath $outputFile
    Write-MandALog "Exported $($appProxies.Count) application proxy applications to CSV" -Level "SUCCESS"
    
    return $appProxies
}

# Export functions
Export-ModuleMember -Function @(
    'Invoke-GraphDiscovery',
    'Test-GraphConnection',
    'Get-GraphUsersData',
    'Get-GraphGroupsData',
    'Get-GraphApplicationsData',
    'Get-GraphDevicesData',
    'Get-GraphLicensesData',
    'Get-OneDriveUsageData',
    'Get-ApplicationProxiesData'
)