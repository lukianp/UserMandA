# -*- coding: utf-8-bom -*-
#Requires -Version 5.1

<#
.SYNOPSIS
    Microsoft Graph Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers users, groups, and organizational data using Microsoft Graph API
.NOTES
    Version: 4.1.0 (Fixed)
    Author: M&A Discovery Team
    Last Modified: 2025-06-11
#>

# Import authentication service
Import-Module (Join-Path (Split-Path $PSScriptRoot -Parent) "Authentication\AuthenticationService.psm1") -Force

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

function Write-GraphLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [string]$Level = "INFO",
        [hashtable]$Context
    )
    Write-MandALog -Message "[Graph] $Message" -Level $Level -Component "GraphDiscovery" -Context $Context
}

function Invoke-GraphDiscovery {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,

        [Parameter(Mandatory=$true)]
        [hashtable]$Context,

        [Parameter(Mandatory=$true)]
        [string]$SessionId
    )

    Write-GraphLog -Level "HEADER" -Message "Starting Discovery (v4.1.0 - Fixed)" -Context $Context
    Write-GraphLog -Level "INFO" -Message "Using authentication session: $SessionId" -Context $Context
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    # Initialize result object
    $result = $null
    if (([System.Management.Automation.PSTypeName]'DiscoveryResult').Type) {
        $result = [DiscoveryResult]::new('Graph')
    } else {
        # Fallback to hashtable
        $result = @{
            Success      = $true
            ModuleName   = 'Graph'
            RecordCount  = 0
            Errors       = [System.Collections.ArrayList]::new()
            Warnings     = [System.Collections.ArrayList]::new()
            Metadata     = @{}
            StartTime    = Get-Date
            EndTime      = $null
            ExecutionId  = [guid]::NewGuid().ToString()
            AddError     = { param($m, $e, $c) $this.Errors.Add(@{Message=$m; Exception=$e; Context=$c}); $this.Success = $false }.GetNewClosure()
            AddWarning   = { param($m, $c) $this.Warnings.Add(@{Message=$m; Context=$c}) }.GetNewClosure()
            Complete     = { $this.EndTime = Get-Date }.GetNewClosure()
        }
    }

    # Initialize variables
    $allDiscoveredData = [System.Collections.ArrayList]::new()
    $graphConnected = $false

    try {
        # STEP 1: Validate prerequisites
        Write-GraphLog -Level "INFO" -Message "Validating prerequisites..." -Context $Context
        
        if (-not $Context.Paths.RawDataOutput) {
            $result.AddError("Context is missing required 'Paths.RawDataOutput' property.", $null, $null)
            return $result
        }
        $outputPath = $Context.Paths.RawDataOutput
        Write-GraphLog -Level "DEBUG" -Message "Output path: $outputPath" -Context $Context
        
        # Ensure output directory exists
        if (-not (Test-Path -Path $outputPath -PathType Container)) {
            try {
                New-Item -Path $outputPath -ItemType Directory -Force -ErrorAction Stop | Out-Null
            } catch {
                $result.AddError("Failed to create output directory: $outputPath", $_.Exception, $null)
                return $result
            }
        }

        # STEP 2: Get module configuration
        $pageSize = 999
        $includeSignInActivity = $false
        $includeManager = $true
        
        if ($Configuration.graphAPI -and $Configuration.graphAPI.pageSize) {
            $pageSize = $Configuration.graphAPI.pageSize
        }
        
        if ($Configuration.discovery -and $Configuration.discovery.graph) {
            $graphConfig = $Configuration.discovery.graph
            if ($null -ne $graphConfig.includeSignInActivity) { 
                $includeSignInActivity = $graphConfig.includeSignInActivity 
            }
            if ($null -ne $graphConfig.includeManager) { 
                $includeManager = $graphConfig.includeManager 
            }
        }

        # STEP 3: Authenticate
        Write-GraphLog -Level "INFO" -Message "Getting authentication for Graph service..." -Context $Context
        try {
            $graphAuth = Get-AuthenticationForService -Service "Graph" -SessionId $SessionId
            $graphConnected = $true
            Write-GraphLog -Level "SUCCESS" -Message "Connected to Microsoft Graph via session authentication" -Context $Context
            
            # Validate connection with a simple test
            Write-GraphLog -Level "DEBUG" -Message "Validating Graph connection..." -Context $Context
            $testUri = "https://graph.microsoft.com/v1.0/organization"
            $testResponse = Invoke-MgGraphRequest -Uri $testUri -Method GET -ErrorAction Stop
            
            if ($testResponse -and $testResponse.value) {
                Write-GraphLog -Level "DEBUG" -Message "Graph connection validated successfully" -Context $Context
            } else {
                throw "Graph connection test returned no data"
            }
            
        } catch {
            $result.AddError("Failed to authenticate with Graph service: $($_.Exception.Message)", $_.Exception, @{SessionId = $SessionId})
            return $result
        }

        # STEP 4: PERFORM DISCOVERY
        Write-GraphLog -Level "HEADER" -Message "Starting data discovery" -Context $Context
        
        # Discover Organization Details
        try {
            Write-GraphLog -Level "INFO" -Message "Discovering organization details..." -Context $Context
            $orgUri = "https://graph.microsoft.com/v1.0/organization"
            $orgResponse = Invoke-MgGraphRequest -Uri $orgUri -Method GET -ErrorAction Stop
            
            if ($orgResponse -and $orgResponse.value) {
                foreach ($org in $orgResponse.value) {
                    $orgData = [PSCustomObject]@{
                        TenantId = $org.id
                        DisplayName = $org.displayName
                        VerifiedDomains = ($org.verifiedDomains | Where-Object { $_.isVerified } | ForEach-Object { $_.name }) -join ';'
                        DefaultDomain = ($org.verifiedDomains | Where-Object { $_.isDefault } | Select-Object -First 1).name
                        TechnicalNotificationMails = ($org.technicalNotificationMails -join ';')
                        PreferredLanguage = $org.preferredLanguage
                        City = $org.city
                        State = $org.state
                        Country = $org.country
                        PostalCode = $org.postalCode
                        BusinessPhones = ($org.businessPhones -join ';')
                        CreatedDateTime = $org.createdDateTime
                        OnPremisesSyncEnabled = $org.onPremisesSyncEnabled
                        _DataType = 'Organization'
                    }
                    $null = $allDiscoveredData.Add($orgData)
                    Write-GraphLog -Level "SUCCESS" -Message "Discovered organization: $($org.displayName)" -Context $Context
                }
            }
        } catch {
            Write-GraphLog -Level "WARN" -Message "Failed to discover organization details: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover organization details: $($_.Exception.Message)", @{Section="Organization"})
        }

        # Discover Users
        try {
            Write-GraphLog -Level "INFO" -Message "Discovering users..." -Context $Context
            
            $userSelectFields = @(
                'id', 'userPrincipalName', 'displayName', 'mail', 'mailNickname',
                'givenName', 'surname', 'jobTitle', 'department', 'companyName',
                'officeLocation', 'businessPhones', 'mobilePhone', 'preferredLanguage',
                'employeeId', 'employeeType', 'createdDateTime', 'accountEnabled',
                'assignedLicenses', 'assignedPlans', 'onPremisesSyncEnabled',
                'onPremisesImmutableId', 'onPremisesSamAccountName', 'proxyAddresses',
                'userType', 'usageLocation', 'city', 'state', 'country', 'postalCode'
            )
            
            if ($includeSignInActivity) {
                $userSelectFields += 'signInActivity'
            }
            
            $expandFields = @()
            if ($includeManager) {
                $expandFields += 'manager($select=id,displayName,userPrincipalName)'
            }
            
            $uri = "https://graph.microsoft.com/v1.0/users?`$select=$($userSelectFields -join ',')&`$top=$pageSize"
            if ($expandFields.Count -gt 0) {
                $uri += "&`$expand=$($expandFields -join ',')"
            }
            
            $headers = @{
                'ConsistencyLevel' = 'eventual'
                'Prefer' = 'outlook.body-content-type="text"'
            }
            
            $userCount = 0
            do {
                Write-GraphLog -Level "DEBUG" -Message "Fetching users from: $uri" -Context $Context
                $response = Invoke-MgGraphRequest -Uri $uri -Method GET -Headers $headers -ErrorAction Stop
                
                if ($response -and $response.value) {
                    foreach ($user in $response.value) {
                        $userCount++
                        
                        # Process licenses
                        $licenses = @()
                        $plans = @()
                        if ($user.assignedLicenses) {
                            $licenses = $user.assignedLicenses | ForEach-Object { $_.skuId }
                        }
                        if ($user.assignedPlans) {
                            $plans = $user.assignedPlans | Where-Object { $_.capabilityStatus -eq 'Enabled' } | ForEach-Object { $_.servicePlanId }
                        }
                        
                        $userObj = [PSCustomObject]@{
                            id = $user.id
                            userPrincipalName = $user.userPrincipalName
                            displayName = $user.displayName
                            mail = $user.mail
                            mailNickname = $user.mailNickname
                            givenName = $user.givenName
                            surname = $user.surname
                            jobTitle = $user.jobTitle
                            department = $user.department
                            companyName = $user.companyName
                            officeLocation = $user.officeLocation
                            businessPhones = ($user.businessPhones -join ';')
                            mobilePhone = $user.mobilePhone
                            preferredLanguage = $user.preferredLanguage
                            employeeId = $user.employeeId
                            employeeType = $user.employeeType
                            createdDateTime = $user.createdDateTime
                            accountEnabled = $user.accountEnabled
                            assignedLicenses = ($licenses -join ';')
                            assignedPlans = ($plans -join ';')
                            licenseCount = $licenses.Count
                            onPremisesSyncEnabled = $user.onPremisesSyncEnabled
                            onPremisesImmutableId = $user.onPremisesImmutableId
                            onPremisesSamAccountName = $user.onPremisesSamAccountName
                            proxyAddresses = (($user.proxyAddresses | Where-Object { $_ -like 'SMTP:*' -or $_ -like 'smtp:*' }) -join ';')
                            userType = $user.userType
                            usageLocation = $user.usageLocation
                            city = $user.city
                            state = $user.state
                            country = $user.country
                            postalCode = $user.postalCode
                            managerUPN = if ($user.manager) { $user.manager.userPrincipalName } else { $null }
                            managerId = if ($user.manager) { $user.manager.id } else { $null }
                            lastSignInDateTime = if ($user.signInActivity) { $user.signInActivity.lastSignInDateTime } else { $null }
                            _DataType = 'User'
                        }
                        
                        $null = $allDiscoveredData.Add($userObj)
                        
                        if ($userCount % 100 -eq 0) {
                            Write-GraphLog -Level "DEBUG" -Message "Processed $userCount users..." -Context $Context
                        }
                    }
                } else {
                    Write-GraphLog -Level "DEBUG" -Message "No users in response" -Context $Context
                }
                
                $uri = $response.'@odata.nextLink'
            } while ($uri)
            
            Write-GraphLog -Level "SUCCESS" -Message "Discovered $userCount users" -Context $Context
            
        } catch {
            Write-GraphLog -Level "ERROR" -Message "Failed to discover users: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover users: $($_.Exception.Message)", @{Section="Users"})
        }
        
        # Discover Groups
        try {
            Write-GraphLog -Level "INFO" -Message "Discovering groups..." -Context $Context
            
            $groupSelectFields = @(
                'id', 'displayName', 'mailEnabled', 'mailNickname', 'mail',
                'securityEnabled', 'groupTypes', 'description', 'visibility',
                'createdDateTime', 'renewedDateTime', 'membershipRule',
                'membershipRuleProcessingState', 'proxyAddresses',
                'onPremisesSyncEnabled', 'onPremisesSamAccountName', 'classification'
            )
            
            $uri = "https://graph.microsoft.com/v1.0/groups?`$select=$($groupSelectFields -join ',')&`$top=$pageSize"
            
            $groupCount = 0
            do {
                Write-GraphLog -Level "DEBUG" -Message "Fetching groups from: $uri" -Context $Context
                $response = Invoke-MgGraphRequest -Uri $uri -Method GET -Headers $headers -ErrorAction Stop
                
                if ($response -and $response.value) {
                    foreach ($group in $response.value) {
                        $groupCount++
                        
                        # Determine group type
                        $groupType = 'SecurityGroup'
                        if ($group.groupTypes -contains 'Unified') {
                            $groupType = 'Microsoft365Group'
                        } elseif ($group.mailEnabled -and -not $group.securityEnabled) {
                            $groupType = 'DistributionList'
                        } elseif ($group.mailEnabled -and $group.securityEnabled) {
                            $groupType = 'MailEnabledSecurityGroup'
                        } elseif ($group.groupTypes -contains 'DynamicMembership') {
                            $groupType = 'DynamicGroup'
                        }
                        
                        $groupObj = [PSCustomObject]@{
                            id = $group.id
                            displayName = $group.displayName
                            mail = $group.mail
                            mailNickname = $group.mailNickname
                            mailEnabled = $group.mailEnabled
                            securityEnabled = $group.securityEnabled
                            groupType = $groupType
                            groupTypes = ($group.groupTypes -join ';')
                            description = $group.description
                            visibility = $group.visibility
                            createdDateTime = $group.createdDateTime
                            renewedDateTime = $group.renewedDateTime
                            membershipRule = $group.membershipRule
                            membershipRuleProcessingState = $group.membershipRuleProcessingState
                            isDynamic = ($null -ne $group.membershipRule)
                            proxyAddresses = (($group.proxyAddresses | Where-Object { $_ -like 'SMTP:*' -or $_ -like 'smtp:*' }) -join ';')
                            onPremisesSyncEnabled = $group.onPremisesSyncEnabled
                            onPremisesSamAccountName = $group.onPremisesSamAccountName
                            classification = $group.classification
                            _DataType = 'Group'
                        }
                        
                        $null = $allDiscoveredData.Add($groupObj)
                        
                        if ($groupCount % 100 -eq 0) {
                            Write-GraphLog -Level "DEBUG" -Message "Processed $groupCount groups..." -Context $Context
                        }
                    }
                } else {
                    Write-GraphLog -Level "DEBUG" -Message "No groups in response" -Context $Context
                }
                
                $uri = $response.'@odata.nextLink'
            } while ($uri)
            
            Write-GraphLog -Level "SUCCESS" -Message "Discovered $groupCount groups" -Context $Context
            
        } catch {
            Write-GraphLog -Level "ERROR" -Message "Failed to discover groups: $($_.Exception.Message)" -Context $Context
            $result.AddWarning("Failed to discover groups: $($_.Exception.Message)", @{Section="Groups"})
        }

        # STEP 5: Export data
        if ($allDiscoveredData.Count -gt 0) {
            Write-GraphLog -Level "INFO" -Message "Exporting $($allDiscoveredData.Count) records..." -Context $Context
            
            $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
            
            # Group by data type and export
            $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
            
            foreach ($group in $dataGroups) {
                $dataType = $group.Name
                $data = $group.Group
                
                # Remove _DataType property and add metadata
                $exportData = $data | ForEach-Object {
                    $obj = $_.PSObject.Copy()
                    $obj.PSObject.Properties.Remove('_DataType')
                    $obj | Add-Member -MemberType NoteProperty -Name "_DiscoveryTimestamp" -Value $timestamp -Force
                    $obj | Add-Member -MemberType NoteProperty -Name "_DiscoveryModule" -Value "Graph" -Force
                    $obj | Add-Member -MemberType NoteProperty -Name "_SessionId" -Value $SessionId -Force
                    $obj
                }
                
                # Determine filename
                $fileName = switch ($dataType) {
                    'User' { 'GraphUsers.csv' }
                    'Group' { 'GraphGroups.csv' }
                    'Organization' { 'GraphOrganization.csv' }
                    default { "Graph_$dataType.csv" }
                }
                
                $filePath = Join-Path $outputPath $fileName
                $exportData | Export-Csv -Path $filePath -NoTypeInformation -Encoding UTF8
                
                Write-GraphLog -Level "SUCCESS" -Message "Exported $($exportData.Count) $dataType records to $fileName" -Context $Context
            }
        } else {
            Write-GraphLog -Level "WARN" -Message "No data discovered to export" -Context $Context
        }

        # STEP 6: Update result metadata
        $result.RecordCount = $allDiscoveredData.Count
        $result.Metadata["RecordCount"] = $allDiscoveredData.Count
        $result.Metadata["TotalRecords"] = $allDiscoveredData.Count
        $result.Metadata["ElapsedTimeSeconds"] = $stopwatch.Elapsed.TotalSeconds
        $result.Metadata["SessionId"] = $SessionId
        
        # Add counts by type
        $dataGroups = $allDiscoveredData | Group-Object -Property _DataType
        foreach ($group in $dataGroups) {
            $result.Metadata["$($group.Name)Count"] = $group.Count
        }

    } catch {
        # Catch any unexpected errors
        Write-GraphLog -Level "ERROR" -Message "Critical error during discovery: $($_.Exception.Message)" -Context $Context
        Write-GraphLog -Level "DEBUG" -Message "Stack trace: $($_.ScriptStackTrace)" -Context $Context
        $result.AddError("Critical error during discovery: $($_.Exception.Message)", $_.Exception, @{
            ErrorType = "General"
            StackTrace = $_.ScriptStackTrace
        })
    } finally {
        # STEP 7: Cleanup
        Write-GraphLog -Level "INFO" -Message "Cleaning up..." -Context $Context
        
        if ($graphConnected) {
            try {
                Disconnect-MgGraph -ErrorAction SilentlyContinue
                Write-GraphLog -Level "DEBUG" -Message "Disconnected from Microsoft Graph" -Context $Context
            } catch {
                Write-GraphLog -Level "DEBUG" -Message "Error disconnecting from Graph: $_" -Context $Context
            }
        }
        
        $stopwatch.Stop()
        $result.Complete()
        
        # Ensure RecordCount is properly set in hashtable result
        if ($result -is [hashtable]) {
            $result['RecordCount'] = $allDiscoveredData.Count
        }
        
        $finalStatus = if($result.Success){"SUCCESS"}else{"ERROR"}
        Write-GraphLog -Level $finalStatus -Message "Discovery completed with $($result.RecordCount) records" -Context $Context
        Write-GraphLog -Level "HEADER" -Message "Discovery finished in $($stopwatch.Elapsed.ToString('hh\:mm\:ss')). Records: $($result.RecordCount)." -Context $Context
    }

    return $result
}

# Export module function
Export-ModuleMember -Function Invoke-GraphDiscovery