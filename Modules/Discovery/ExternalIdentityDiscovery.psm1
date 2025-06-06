# -*- coding: utf-8-bom -*-
#Requires -Modules Microsoft.Graph.Authentication, Microsoft.Graph.Identity.SignIns, Microsoft.Graph.Identity.DirectoryManagement, Microsoft.Graph.Applications
<#
.SYNOPSIS
    Enhanced External Identity Discovery Module for M&A Discovery Suite
.DESCRIPTION
    Discovers B2B guest users, collaboration settings, external identity providers, 
    and partner organizations with improved performance and error handling
.NOTES
    Author: M&A Discovery Suite
    Version: 2.0.0
    Last Modified: 2024-01-20
#>





# Import base module

$authModulePathFromGlobal = Join-Path $global:MandA.Paths.Authentication "DiscoveryModuleBase.psm1"
Import-Module $authModulePathFromGlobal -Force


# Add progress module import after other imports
$progressModulePath = if ($global:MandA -and $global:MandA.Paths) {
    Join-Path $global:MandA.Paths.Utilities "ProgressDisplay.psm1"
} else {
    Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "Utilities\ProgressDisplay.psm1"
}
if (Test-Path $progressModulePath) {
    Import-Module $progressModulePath -Force -Global
}

# Enhanced Get-B2BGuestUsersEnhanced
function Get-B2BGuestUsersEnhanced {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory = $true)]
        [MandAContext]$Context
    )
    
    $guestDataList = [System.Collections.Generic.List[PSObject]]::new()
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        Write-ProgressStep "Retrieving B2B guest users with batch size $($Configuration.BatchSize)..." -Status Progress
        
        $propertiesToSelect = @(
            "id", "userPrincipalName", "displayName", "mail", "userType", "externalUserState",
            "externalUserStateChangeDateTime", "createdDateTime", "creationType", "accountEnabled",
            "companyName", "department", "jobTitle", "usageLocation", "preferredLanguage",
            "refreshTokensValidFromDateTime", "onPremisesSyncEnabled", "proxyAddresses"
        )
        
        Write-ProgressStep "Fetching guest users from Microsoft Graph..." -Status Progress
        
        $guests = Get-GraphDataInBatches -Entity "users" `
                                        -Filter "userType eq 'Guest'" `
                                        -Select $propertiesToSelect `
                                        -ExpandProperty "signInActivity" `
                                        -BatchSize $Configuration.BatchSize `
                                        -Context $Context
        
        if ($null -eq $guests -or $guests.Count -eq 0) {
            Write-ProgressStep "No guest users found in the tenant." -Status Info
            return $guestDataList
        }
        
        Write-ProgressStep "Found $($guests.Count) guest users to process" -Status Info
        
        $guestBatches = Split-ArrayIntoBatches -Array $guests -BatchSize 50
        $batchCount = 0
        
        foreach ($batch in $guestBatches) {
            $batchCount++
            
            Show-ProgressBar -Current $batchCount -Total $guestBatches.Count `
                -Activity "Processing guest user batch $batchCount of $($guestBatches.Count)"
            
            $batchResults = $batch | ForEach-Object -Parallel {
                $guest = $_
                $config = $using:Configuration
                $context = $using:Context
                
                $guestDomain = Get-GuestDomain -Guest $guest
                
                $appRoleAssignmentsCount = 0
                $appRoleDetails = @()
                
                if ($config.GetGuestAppRoleAssignments) {
                    try {
                        $appRoles = Invoke-MgGraphRequest -Method GET `
                                                         -Uri "v1.0/users/$($guest.Id)/appRoleAssignments" `
                                                         -ErrorAction SilentlyContinue
                        
                        if ($appRoles.value) {
                            $appRoleAssignmentsCount = $appRoles.value.Count
                            $appRoleDetails = $appRoles.value | Select-Object -First 5 | ForEach-Object {
                                $_.resourceDisplayName
                            }
                        }
                    }
                    catch {
                        # Log at debug level to avoid noise
                    }
                }
                
                # Return guest object (existing code)
                [PSCustomObject]@{
                    GuestId                         = $guest.Id
                    UserPrincipalName               = $guest.UserPrincipalName
                    DisplayName                     = $guest.DisplayName
                    Mail                            = $guest.Mail
                    GuestDomain                     = $guestDomain
                    CreationType                    = $guest.CreationType
                    UserType                        = $guest.UserType
                    AccountEnabled                  = $guest.AccountEnabled
                    ExternalUserState               = if ($null -ne $guest.ExternalUserState) { $guest.ExternalUserState } else { "Unknown" }
                    ExternalUserStateChangeDateTime = $guest.ExternalUserStateChangeDateTime
                    CreatedDateTime                 = $guest.CreatedDateTime
                    CompanyName                     = $guest.CompanyName
                    Department                      = $guest.Department
                    JobTitle                        = $guest.JobTitle
                    UsageLocation                   = $guest.UsageLocation
                    PreferredLanguage               = $guest.PreferredLanguage
                    AppRoleAssignmentCount          = $appRoleAssignmentsCount
                    TopAppAssignments               = ($appRoleDetails -join '; ')
                    LastSignInDateTime              = if ($null -ne $guest.SignInActivity) { $guest.SignInActivity.LastSignInDateTime } else { $null }
                    LastNonInteractiveSignInDateTime= if ($null -ne $guest.SignInActivity) { $guest.SignInActivity.LastNonInteractiveSignInDateTime } else { $null }
                    RefreshTokensValidFromDateTime  = $guest.RefreshTokensValidFromDateTime
                    OnPremisesSyncEnabled           = $guest.OnPremisesSyncEnabled
                    ProxyAddresses                  = ($guest.ProxyAddresses -join '; ')
                    DaysSinceLastSignIn             = if ($null -ne $guest.SignInActivity -and $null -ne $guest.SignInActivity.LastSignInDateTime) {
                        [Math]::Round(((Get-Date) - [DateTime]$guest.SignInActivity.LastSignInDateTime).TotalDays, 0)
                    } else { $null }
                    IsActive90Days                  = if ($null -ne $guest.SignInActivity -and $null -ne $guest.SignInActivity.LastSignInDateTime) {
                        [DateTime]$guest.SignInActivity.LastSignInDateTime -gt (Get-Date).AddDays(-90)
                    } else { $false }
                    _DataType                       = 'B2BGuestUsers'
                }
            } -ThrottleLimit $Configuration.MaxDegreeOfParallelism
            
            $guestDataList.AddRange($batchResults)
        }
        
        Write-Host "" # New line after progress
        
        $stopwatch.Stop()
        Write-ProgressStep "Processed $($guestDataList.Count) guest users in $([Math]::Round($stopwatch.Elapsed.TotalSeconds, 2)) seconds" -Status Success
        
        if ($guestDataList.Count -gt 0) {
            $avgProcessingTime = $stopwatch.Elapsed.TotalMilliseconds / $guestDataList.Count
            Write-ProgressStep "Average processing time per guest: $([Math]::Round($avgProcessingTime, 2))ms" -Status Info
        }
        
        return $guestDataList
    }
    catch {
        Write-ProgressStep "Error retrieving B2B guest users: $($_.Exception.Message)" -Status Error
        Write-MandALog -Message "Error retrieving B2B guest users: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

# Prerequisites validation function
function Test-ExternalIdentityDiscoveryPrerequisites {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory=$false)]
        $Context
    )
    
    $prerequisites = @{
        IsValid = $true
        MissingRequirements = @()
        Warnings = @()
    }
    
    try {
        Write-ProgressStep "Validating External Identity Discovery prerequisites..." -Status Progress
        
        # Check for Microsoft Graph connection
        $graphContext = Get-MgContext -ErrorAction SilentlyContinue
        if ($null -eq $graphContext) {
            $prerequisites.IsValid = $false
            $prerequisites.MissingRequirements += "Microsoft Graph not connected. Please authenticate first."
        } else {
            Write-ProgressStep "Graph context active. Tenant: $($graphContext.TenantId)" -Status Info
        }
        
        # Check for required Graph modules
        $requiredModules = @(
            'Microsoft.Graph.Authentication',
            'Microsoft.Graph.Identity.SignIns',
            'Microsoft.Graph.Identity.DirectoryManagement',
            'Microsoft.Graph.Applications'
        )
        
        foreach ($module in $requiredModules) {
            if (-not (Get-Module -ListAvailable -Name $module)) {
                $prerequisites.IsValid = $false
                $prerequisites.MissingRequirements += "Required module '$module' not available"
            }
        }
        
        # Check required permissions
        $requiredPermissions = @('User.Read.All', 'Policy.Read.All', 'IdentityProvider.Read.All')
        if ($graphContext) {
            $currentScopes = $graphContext.Scopes
            foreach ($permission in $requiredPermissions) {
                if ($permission -notin $currentScopes) {
                    $prerequisites.Warnings += "Permission '$permission' may not be available - some features may be limited"
                }
            }
        }
        
        Write-ProgressStep "Prerequisites validation completed" -Status Success
        
    } catch {
        $prerequisites.IsValid = $false
        $prerequisites.MissingRequirements += "Prerequisites validation failed: $($_.Exception.Message)"
        Write-ProgressStep "Prerequisites validation failed: $($_.Exception.Message)" -Status Error
    }
    
    return $prerequisites
}

# Enhanced main function with comprehensive error handling
function Invoke-ExternalIdentityDiscovery {
    [CmdletBinding()]
    [OutputType([hashtable])]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory = $true)]
        [MandAContext]$Context
    )
    
    # Initialize result object
    $result = [DiscoveryResult]::new("ExternalIdentity")
    
    try {
        Write-ProgressStep "Starting External Identity Discovery" -Status Progress
        
        # Validate prerequisites
        $prerequisites = Test-ExternalIdentityDiscoveryPrerequisites -Configuration $Configuration -Context $Context
        if (-not $prerequisites.IsValid) {
            throw "Prerequisites validation failed: $($prerequisites.MissingRequirements -join '; ')"
        }
        
        # Log warnings
        foreach ($warning in $prerequisites.Warnings) {
            Write-ProgressStep $warning -Status Warning
            $Context.ErrorCollector.AddWarning("ExternalIdentity", $warning)
        }
        
        $script:PerformanceTracker = [DiscoveryPerformanceTracker]::new()
        $config = Get-ExternalIdentityConfig -Configuration $Configuration
        $results = @{}
        
        # Define discovery tasks with error handling
        $discoveryTasks = @(
            @{Name="B2B Guest Users"; Key="B2BGuests"; Function="Get-B2BGuestUsersWithErrorHandling"},
            @{Name="External Collaboration Settings"; Key="CollaborationSettings"; Function="Get-ExternalCollaborationSettingsWithErrorHandling"},
            @{Name="Guest User Activity"; Key="GuestActivity"; Function="Get-GuestUserActivityWithErrorHandling"; RequiresGuests=$true},
            @{Name="Partner Organizations"; Key="PartnerOrganizations"; Function="Get-PartnerOrganizationsWithErrorHandling"; RequiresGuests=$true},
            @{Name="External Identity Providers"; Key="IdentityProviders"; Function="Get-ExternalIdentityProvidersWithErrorHandling"},
            @{Name="Guest Invitations"; Key="GuestInvitations"; Function="Get-GuestInvitationsWithErrorHandling"; RequiresGuests=$true},
            @{Name="Cross-Tenant Access Policy"; Key="CrossTenantAccess"; Function="Get-CrossTenantAccessWithErrorHandling"}
        )
        
        $taskCount = 0
        foreach ($task in $discoveryTasks) {
            $taskCount++
            
            try {
                Show-DiscoveryProgress -Module "ExternalIdentity" -Status "Running" `
                    -CurrentItem $task.Name -ItemsProcessed $taskCount -TotalItems $discoveryTasks.Count
                
                Write-ProgressStep "Discovering $($task.Name)..." -Status Progress
                $script:PerformanceTracker.StartOperation($task.Key)
                
                if ($task.RequiresGuests -and (-not $results.B2BGuests -or $results.B2BGuests.Count -eq 0)) {
                    Write-ProgressStep "Skipping $($task.Name) - no guest users found" -Status Info
                    $script:PerformanceTracker.EndOperation($task.Key, 0)
                    continue
                }
                
                if ($task.RequiresGuests) {
                    $results[$task.Key] = & $task.Function -GuestUsers $results.B2BGuests -Configuration $config -Context $Context
                } else {
                    $results[$task.Key] = & $task.Function -Configuration $config -Context $Context
                }
                
                $itemCount = if ($results[$task.Key] -is [array]) { $results[$task.Key].Count } else { 1 }
                $script:PerformanceTracker.EndOperation($task.Key, $itemCount)
                $result.Metadata.SectionsProcessed++
                
                Write-ProgressStep "Completed $($task.Name): $itemCount items" -Status Success
                
            } catch {
                $errorMsg = "Failed to discover $($task.Name): $($_.Exception.Message)"
                Write-ProgressStep $errorMsg -Status Error
                $Context.ErrorCollector.AddError("ExternalIdentity", $errorMsg, $_.Exception)
                $result.Metadata.SectionErrors++
                $script:PerformanceTracker.EndOperation($task.Key, 0)
            }
        }
        
        # Update result
        $result.Data = Convert-ToFlattenedData -Results $results
        $result.Success = $true
        $result.Metadata.TotalSections = $discoveryTasks.Count
        $result.Metadata.EndTime = Get-Date
        $result.Metadata.Duration = $result.Metadata.EndTime - $result.Metadata.StartTime
        
        Write-ProgressStep "External Identity Discovery completed" -Status Success
        return $result
        
    } catch {
        $result.Success = $false
        $result.ErrorMessage = $_.Exception.Message
        $result.Metadata.EndTime = Get-Date
        $result.Metadata.Duration = $result.Metadata.EndTime - $result.Metadata.StartTime
        
        Write-ProgressStep "External Identity Discovery failed: $($_.Exception.Message)" -Status Error
        $Context.ErrorCollector.AddError("ExternalIdentity", "Discovery failed", $_.Exception)
        
        return $result
        
    } finally {
        # Cleanup any resources if needed
        Write-ProgressStep "External Identity Discovery cleanup completed" -Status Info
    }
}

# Enhanced wrapper functions with retry logic
function Get-B2BGuestUsersWithErrorHandling {
    param($Configuration, $Context)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-B2BGuestUsersEnhanced -Configuration $Configuration -Context $Context
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "B2B Guest Users discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-ExternalCollaborationSettingsWithErrorHandling {
    param($Configuration, $Context)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-ExternalCollaborationSettingsEnhanced -Configuration $Configuration -Context $Context
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "External Collaboration Settings discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-GuestUserActivityWithErrorHandling {
    param($GuestUsers, $Configuration, $Context)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-GuestUserActivityEnhanced -GuestUsers $GuestUsers -Configuration $Configuration -Context $Context
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "Guest User Activity discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-PartnerOrganizationsWithErrorHandling {
    param($GuestUsers, $Configuration, $Context)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-PartnerOrganizationsEnhanced -GuestUsers $GuestUsers -Configuration $Configuration -Context $Context
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "Partner Organizations discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-ExternalIdentityProvidersWithErrorHandling {
    param($Configuration, $Context)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-ExternalIdentityProvidersEnhanced -Configuration $Configuration -Context $Context
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "External Identity Providers discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-GuestInvitationsWithErrorHandling {
    param($Configuration, $Context, $GuestUsers)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-GuestInvitationsEnhanced -Configuration $Configuration -Context $Context -GuestUsers $GuestUsers
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "Guest Invitations discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

function Get-CrossTenantAccessWithErrorHandling {
    param($Configuration, $Context)
    
    $maxRetries = 3
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            return Get-CrossTenantAccessEnhanced -Configuration $Configuration -Context $Context
        } catch {
            $retryCount++
            if ($retryCount -eq $maxRetries) {
                throw
            }
            
            $waitTime = [Math]::Pow(2, $retryCount)
            Write-ProgressStep "Cross-Tenant Access discovery failed, retrying in $waitTime seconds... (attempt $retryCount/$maxRetries)" -Status Warning
            Start-Sleep -Seconds $waitTime
        }
    }
}

# Enhanced Get-GraphDataInBatches with progress
function Get-GraphDataInBatches {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Entity,
        [string]$Filter,
        [string[]]$Select,
        [string]$ExpandProperty,
        [int]$BatchSize = 999,
        [Parameter(Mandatory = $true)]
        [MandAContext]$Context
    )
    
    $allData = [System.Collections.Generic.List[PSObject]]::new()
    $uri = "v1.0/$Entity"
    $queryParams = @{
        '$top'   = $BatchSize
        '$count' = 'true'
    }
    
    if ($Filter) { $queryParams['$filter'] = $Filter }
    if ($Select) { $queryParams['$select'] = $Select -join ',' }
    if ($ExpandProperty) { $queryParams['$expand'] = $ExpandProperty }
    
    $headers = @{
        'ConsistencyLevel' = 'eventual'
    }
    
    $pageCount = 0
    do {
        try {
            $pageCount++
            Write-ProgressStep "Fetching $Entity page $pageCount..." -Status Progress
            
            $response = Invoke-DiscoveryWithRetry -ScriptBlock {
                Invoke-MgGraphRequest -Method GET -Uri $uri -Headers $headers -Body $queryParams -ErrorAction Stop
            } -OperationName "GraphBatch_$Entity" -Context $Context -CircuitBreaker $script:GraphCircuitBreaker
            
            if ($response.value) {
                $allData.AddRange($response.value)
                Show-ProgressBar -Current $allData.Count -Total ($allData.Count + 1) `
                    -Activity "Retrieved $($allData.Count) $Entity"
            }
            
            $uri = $response.'@odata.nextLink'
            $queryParams = @{}
        }
        catch {
            Write-MandALog -Message "Error in batch retrieval: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            throw
        }
    } while ($uri)
    
    Write-Host "" # New line after progress
    Write-ProgressStep "Retrieved total of $($allData.Count) $Entity" -Status Info
    
    return $allData
}

# Module-specific circuit breakers
$script:GraphCircuitBreaker = [CircuitBreaker]::new("MicrosoftGraph")
$script:PerformanceTracker = $null

class CircuitBreaker {
    [string]$Name
    [bool]$IsOpen
    [datetime]$LastFailure
    [int]$FailureCount
    [int]$FailureThreshold
    [timespan]$ResetInterval

    CircuitBreaker([string]$name) {
        $this.Name = $name
        $this.IsOpen = $false
        $this.FailureCount = 0
        $this.FailureThreshold = 5
        $this.ResetInterval = New-TimeSpan -Minutes 5
    }
}

class DiscoveryPerformanceTracker {
    [hashtable]$Operations

    DiscoveryPerformanceTracker() {
        $this.Operations = @{}
    }

    [void]StartOperation([string]$operationName) {
        $this.Operations[$operationName] = [System.Diagnostics.Stopwatch]::StartNew()
    }

    [void]EndOperation([string]$operationName, [int]$itemCount) {
        if ($this.Operations.ContainsKey($operationName)) {
            $this.Operations[$operationName].Stop()
        }
    }
}

class MandAContext {
    [string]$TenantId
    [string]$CorrelationId
    [hashtable]$Metadata
}

function Write-MandALog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        [Parameter(Mandatory = $true)]
        [string]$Level,
        [Parameter(Mandatory = $true)]
        [MandAContext]$Context
    )
    Write-Verbose -Message "[$Level] $Message"
}

function Invoke-DiscoveryWithRetry {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [scriptblock]$ScriptBlock,
        [Parameter(Mandatory = $true)]
        [string]$OperationName,
        [Parameter(Mandatory = $true)]
        [MandAContext]$Context,
        [Parameter(Mandatory = $true)]
        [CircuitBreaker]$CircuitBreaker
    )

    $maxRetries = 3
    $retryCount = 0

    while ($retryCount -lt $maxRetries) {
        try {
            if ($CircuitBreaker.IsOpen) {
                if (((Get-Date) - $CircuitBreaker.LastFailure) -gt $CircuitBreaker.ResetInterval) {
                    $CircuitBreaker.IsOpen = $false
                    $CircuitBreaker.FailureCount = 0
                }
                else {
                    throw "Circuit breaker is open for $OperationName"
                }
            }

            return & $ScriptBlock
        }
        catch {
            $retryCount++
            $CircuitBreaker.FailureCount++
            $CircuitBreaker.LastFailure = Get-Date

            if ($CircuitBreaker.FailureCount -ge $CircuitBreaker.FailureThreshold) {
                $CircuitBreaker.IsOpen = $true
            }

            if ($retryCount -eq $maxRetries) {
                Write-MandALog -Message "Failed $OperationName after $maxRetries retries: $($_.Exception.Message)" -Level "ERROR" -Context $Context
                throw
            }

            Start-Sleep -Milliseconds (100 * [math]::Pow(2, $retryCount))
        }
    }
}


function Get-ExternalIdentityConfig {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration
    )
    
    $config = @{
        GetGuestAppRoleAssignments = $true
        CollectSharePointSettings  = $false
        CollectTeamsSettings       = $false
        TopPartnerDomainsToAnalyze = 10
        RecentGuestCountForInvitationFallback = 50
        BatchSize                  = 999
        MaxDegreeOfParallelism     = 5
        GuestActivityDays          = 90
        IncludeDetailedPermissions = $true
    }
    
    if ($Configuration.ContainsKey('discovery') -and $Configuration.discovery.ContainsKey('externalIdentity')) {
        $extConfig = $Configuration.discovery.externalIdentity
        foreach ($key in $config.Keys) {
            if ($extConfig.ContainsKey($key)) {
                $config[$key] = $extConfig[$key]
            }
        }
    }
    
    if ($Configuration.ContainsKey('graphAPI') -and $Configuration.graphAPI.ContainsKey('pageSize')) {
        $config.BatchSize = [Math]::Min($Configuration.graphAPI.pageSize, 999)
    }
    
    return $config
}

function Get-B2BGuestUsersEnhanced {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory = $true)]
        [MandAContext]$Context
    )
    
    $guestDataList = [System.Collections.Generic.List[PSObject]]::new()
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        Write-MandALog -Message "Retrieving B2B guest users with batch size $($Configuration.BatchSize)..." -Level "INFO" -Context $Context
        
        $propertiesToSelect = @(
            "id", "userPrincipalName", "displayName", "mail", "userType", "externalUserState",
            "externalUserStateChangeDateTime", "createdDateTime", "creationType", "accountEnabled",
            "companyName", "department", "jobTitle", "usageLocation", "preferredLanguage",
            "refreshTokensValidFromDateTime", "onPremisesSyncEnabled", "proxyAddresses"
        )
        
        $guests = Get-GraphDataInBatches -Entity "users" `
                                        -Filter "userType eq 'Guest'" `
                                        -Select $propertiesToSelect `
                                        -ExpandProperty "signInActivity" `
                                        -BatchSize $Configuration.BatchSize `
                                        -Context $Context
        
        if ($null -eq $guests -or $guests.Count -eq 0) {
            Write-MandALog -Message "No guest users found in the tenant." -Level "INFO" -Context $Context
            return $guestDataList
        }
        
        Write-MandALog -Message "Processing $($guests.Count) guest users..." -Level "INFO" -Context $Context
        
        $guestBatches = Split-ArrayIntoBatches -Array $guests -BatchSize 50
        $batchCount = 0
        
        foreach ($batch in $guestBatches) {
            $batchCount++
            Write-Progress -Activity "Processing Guest Users" `
                          -Status "Batch $batchCount of $($guestBatches.Count)" `
                          -PercentComplete (($batchCount / $guestBatches.Count) * 100) `
                          -Id 1
            
            $batchResults = $batch | ForEach-Object -Parallel {
                $guest = $_
                $config = $using:Configuration
                $context = $using:Context
                
                $guestDomain = Get-GuestDomain -Guest $guest
                
                $appRoleAssignmentsCount = 0
                $appRoleDetails = @()
                
                if ($config.GetGuestAppRoleAssignments) {
                    try {
                        $appRoles = Invoke-MgGraphRequest -Method GET `
                                                         -Uri "v1.0/users/$($guest.Id)/appRoleAssignments" `
                                                         -ErrorAction SilentlyContinue
                        
                        if ($appRoles.value) {
                            $appRoleAssignmentsCount = $appRoles.value.Count
                            $appRoleDetails = $appRoles.value | Select-Object -First 5 | ForEach-Object {
                                $_.resourceDisplayName
                            }
                        }
                    }
                    catch {
                        # Log at debug level to avoid noise
                    }
                }
                
                [PSCustomObject]@{
                    GuestId                         = $guest.Id
                    UserPrincipalName               = $guest.UserPrincipalName
                    DisplayName                     = $guest.DisplayName
                    Mail                            = $guest.Mail
                    GuestDomain                     = $guestDomain
                    CreationType                    = $guest.CreationType
                    UserType                        = $guest.UserType
                    AccountEnabled                  = $guest.AccountEnabled
                    ExternalUserState               = if ($null -ne $guest.ExternalUserState) { $guest.ExternalUserState } else { "Unknown" }
                    ExternalUserStateChangeDateTime = $guest.ExternalUserStateChangeDateTime
                    CreatedDateTime                 = $guest.CreatedDateTime
                    CompanyName                     = $guest.CompanyName
                    Department                      = $guest.Department
                    JobTitle                        = $guest.JobTitle
                    UsageLocation                   = $guest.UsageLocation
                    PreferredLanguage               = $guest.PreferredLanguage
                    AppRoleAssignmentCount          = $appRoleAssignmentsCount
                    TopAppAssignments               = ($appRoleDetails -join '; ')
                    LastSignInDateTime              = if ($null -ne $guest.SignInActivity) { $guest.SignInActivity.LastSignInDateTime } else { $null }
                    LastNonInteractiveSignInDateTime= if ($null -ne $guest.SignInActivity) { $guest.SignInActivity.LastNonInteractiveSignInDateTime } else { $null }
                    RefreshTokensValidFromDateTime  = $guest.RefreshTokensValidFromDateTime
                    OnPremisesSyncEnabled           = $guest.OnPremisesSyncEnabled
                    ProxyAddresses                  = ($guest.ProxyAddresses -join '; ')
                    DaysSinceLastSignIn             = if ($null -ne $guest.SignInActivity -and $null -ne $guest.SignInActivity.LastSignInDateTime) {
                        [Math]::Round(((Get-Date) - [DateTime]$guest.SignInActivity.LastSignInDateTime).TotalDays, 0)
                    } else { $null }
                    IsActive90Days                  = if ($null -ne $guest.SignInActivity -and $null -ne $guest.SignInActivity.LastSignInDateTime) {
                        [DateTime]$guest.SignInActivity.LastSignInDateTime -gt (Get-Date).AddDays(-90)
                    } else { $false }
                    _DataType                       = 'B2BGuestUsers'
                }
            } -ThrottleLimit $Configuration.MaxDegreeOfParallelism
            
            $guestDataList.AddRange($batchResults)
        }
        
        Write-Progress -Activity "Processing Guest Users" -Completed -Id 1
        
        $stopwatch.Stop()
        Write-MandALog -Message "Processed $($guestDataList.Count) guest users in $($stopwatch.Elapsed.TotalSeconds) seconds" -Level "SUCCESS" -Context $Context
        
        if ($guestDataList.Count -gt 0) {
            $avgProcessingTime = $stopwatch.Elapsed.TotalMilliseconds / $guestDataList.Count
            Write-MandALog -Message "Average processing time per guest: $([Math]::Round($avgProcessingTime, 2))ms" -Level "DEBUG" -Context $Context
        }
        
        return $guestDataList
    }
    catch {
        Write-MandALog -Message "Error retrieving B2B guest users: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-ExternalCollaborationSettingsEnhanced {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory = $true)]
        [MandAContext]$Context
    )
    
    $settingsData = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        Write-MandALog -Message "Retrieving external collaboration settings..." -Level "INFO" -Context $Context
        
        if (Get-Command -Name Get-MgPolicyAuthorizationPolicy -ErrorAction SilentlyContinue) {
            try {
                $authPolicy = Invoke-DiscoveryWithRetry -ScriptBlock {
                    Get-MgPolicyAuthorizationPolicy -ErrorAction Stop
                } -OperationName "GetAuthorizationPolicy" -Context $Context -CircuitBreaker $script:GraphCircuitBreaker
                
                if ($authPolicy) {
                    $settingsData.Add([PSCustomObject]@{
                        SettingCategory = "Guest Permissions"
                        SettingName     = "GuestUserRoleId"
                        SettingValue    = $authPolicy.GuestUserRoleId
                        Description     = "Default role assigned to guest users"
                        Source          = "AuthorizationPolicy"
                        RetrievedAt     = Get-Date
                        _DataType       = 'ExternalCollaborationSettings'
                    })
                    
                    if ($authPolicy.DefaultUserRolePermissions) {
                        $perms = $authPolicy.DefaultUserRolePermissions
                        
                        $settingsData.Add([PSCustomObject]@{
                            SettingCategory = "Guest Permissions"
                            SettingName     = "GuestsCanInvite"
                            SettingValue    = $perms.AllowedToCreateApps
                            Description     = "Whether guests can invite other guests"
                            Source          = "AuthorizationPolicy"
                            RetrievedAt     = Get-Date
                            _DataType       = 'ExternalCollaborationSettings'
                        })
                    }
                }
            }
            catch {
                Write-MandALog -Message "Could not retrieve authorization policy: $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        try {
            $b2bPolicy = Invoke-MgGraphRequest -Method GET -Uri "v1.0/policies/b2bCollaborationPolicy" -ErrorAction SilentlyContinue
            if ($b2bPolicy) {
                $settingsData.Add([PSCustomObject]@{
                    SettingCategory = "B2B Collaboration"
                    SettingName     = "AllowedDomains"
                    SettingValue    = ($b2bPolicy.allowedDomains -join '; ')
                    Description     = "Domains allowed for B2B collaboration"
                    Source          = "B2BCollaborationPolicy"
                    RetrievedAt     = Get-Date
                    _DataType       = 'ExternalCollaborationSettings'
                })
            }
        }
        catch {
            Write-MandALog -Message "Could not retrieve B2B collaboration policy: $($_.Exception.Message)" -Level "DEBUG" -Context $Context
        }
        
        try {
            $caPolicies = Invoke-MgGraphRequest -Method GET -Uri "v1.0/identity/conditionalAccess/policies" -ErrorAction SilentlyContinue
            $guestPolicies = $caPolicies.value | Where-Object {
                $_.conditions.users.includeGuestsOrExternalUsers -or
                $_.conditions.users.includeUsers -contains 'GuestsOrExternalUsers'
            }
            
            if ($guestPolicies) {
                $settingsData.Add([PSCustomObject]@{
                    SettingCategory = "Conditional Access"
                    SettingName     = "PoliciesTargetingGuests"
                    SettingValue    = $guestPolicies.Count
                    Description     = "Number of conditional access policies targeting guest users"
                    Source          = "ConditionalAccessPolicies"
                    RetrievedAt     = Get-Date
                    _DataType       = 'ExternalCollaborationSettings'
                })
            }
        }
        catch {
            Write-MandALog -Message "Could not retrieve conditional access policies: $($_.Exception.Message)" -Level "DEBUG" -Context $Context
        }
        
        if ($Configuration.CollectSharePointSettings -and (Get-Command -Name Get-SPOTenant -ErrorAction SilentlyContinue)) {
            try {
                $spoTenant = Get-SPOTenant -ErrorAction Stop
                
                $spoSettings = @(
                    @{ Name = "SharingCapability"; Value = $spoTenant.SharingCapability; Desc = "Overall external sharing level" },
                    @{ Name = "RequireAcceptingUserToMatchInvitedUser"; Value = $spoTenant.RequireAcceptingUserToMatchInvitedUser; Desc = "Require email match for sharing" },
                    @{ Name = "DefaultSharingLinkType"; Value = $spoTenant.DefaultSharingLinkType; Desc = "Default link type for sharing" },
                    @{ Name = "PreventExternalUsersFromResharing"; Value = $spoTenant.PreventExternalUsersFromResharing; Desc = "Prevent guests from resharing" }
                )
                
                foreach ($setting in $spoSettings) {
                    $settingsData.Add([PSCustomObject]@{
                        SettingCategory = "SharePoint External Sharing"
                        SettingName     = $setting.Name
                        SettingValue    = $setting.Value
                        Description     = $setting.Desc
                        Source          = "SharePointOnline"
                        RetrievedAt     = Get-Date
                        _DataType       = 'ExternalCollaborationSettings'
                    })
                }
            }
            catch {
                Write-MandALog -Message "Could not retrieve SharePoint settings: $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        if ($Configuration.CollectTeamsSettings -and (Get-Command -Name Get-CsTenantFederationConfiguration -ErrorAction SilentlyContinue)) {
            try {
                $teamsConfig = Get-CsTenantFederationConfiguration -ErrorAction Stop
                
                $teamsSettings = @(
                    @{ Name = "AllowFederatedUsers"; Value = $teamsConfig.AllowFederatedUsers; Desc = "Allow Teams federation" },
                    @{ Name = "AllowPublicUsers"; Value = $teamsConfig.AllowPublicUsers; Desc = "Allow Skype consumer users" },
                    @{ Name = "AllowTeamsConsumer"; Value = $teamsConfig.AllowTeamsConsumer; Desc = "Allow Teams consumer users" }
                )
                
                foreach ($setting in $teamsSettings) {
                    $settingsData.Add([PSCustomObject]@{
                        SettingCategory = "Teams External Access"
                        SettingName     = $setting.Name
                        SettingValue    = $setting.Value
                        Description     = $setting.Desc
                        Source          = "TeamsOnline"
                        RetrievedAt     = Get-Date
                        _DataType       = 'ExternalCollaborationSettings'
                    })
                }
            }
            catch {
                Write-MandALog -Message "Could not retrieve Teams settings: $($_.Exception.Message)" -Level "WARN" -Context $Context
            }
        }
        
        Write-MandALog -Message "Retrieved $($settingsData.Count) external collaboration settings" -Level "SUCCESS" -Context $Context
        return $settingsData
    }
    catch {
        Write-MandALog -Message "Error retrieving external collaboration settings: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-GuestUserActivityEnhanced {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [array]$GuestUsers,
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory = $true)]
        [MandAContext]$Context
    )
    
    $activityDataList = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        Write-MandALog -Message "Analyzing activity for $($GuestUsers.Count) guest users..." -Level "INFO" -Context $Context
        
        $activityDays = $Configuration.GuestActivityDays
        $cutoffDate = (Get-Date).AddDays(-$activityDays)
        
        $activeGuests = @($GuestUsers | Where-Object { 
            $_.AccountEnabled -and $_.LastSignInDateTime -and [DateTime]$_.LastSignInDateTime -gt $cutoffDate 
        })
        
        $inactiveGuests = @($GuestUsers | Where-Object { 
            $_.AccountEnabled -and ((-not $_.LastSignInDateTime) -or [DateTime]$_.LastSignInDateTime -le $cutoffDate)
        })
        
        $disabledGuests = @($GuestUsers | Where-Object { -not $_.AccountEnabled })
        $neverSignedInGuests = @($GuestUsers | Where-Object { $_.AccountEnabled -and -not $_.LastSignInDateTime })
        
        $summaryMetrics = @(
            @{ Category = "Summary"; Metric = "Total Guest Users"; Count = $GuestUsers.Count; Percentage = 100 },
            @{ Category = "Summary"; Metric = "Active Guests ($($activityDays)d)"; Count = $activeGuests.Count; 
               Percentage = if ($GuestUsers.Count -gt 0) { [Math]::Round(($activeGuests.Count / $GuestUsers.Count) * 100, 2) } else { 0 } },
            @{ Category = "Summary"; Metric = "Inactive Guests"; Count = $inactiveGuests.Count; 
               Percentage = if ($GuestUsers.Count -gt 0) { [Math]::Round(($inactiveGuests.Count / $GuestUsers.Count) * 100, 2) } else { 0 } },
            @{ Category = "Summary"; Metric = "Never Signed In"; Count = $neverSignedInGuests.Count; 
               Percentage = if ($GuestUsers.Count -gt 0) { [Math]::Round(($neverSignedInGuests.Count / $GuestUsers.Count) * 100, 2) } else { 0 } },
            @{ Category = "Summary"; Metric = "Disabled Guests"; Count = $disabledGuests.Count; 
               Percentage = if ($GuestUsers.Count -gt 0) { [Math]::Round(($disabledGuests.Count / $GuestUsers.Count) * 100, 2) } else { 0 } }
        )
        
        foreach ($metric in $summaryMetrics) {
            $activityDataList.Add([PSCustomObject]@{
                Category     = $metric.Category
                Metric       = $metric.Metric
                Count        = $metric.Count
                Percentage   = $metric.Percentage
                Details      = ""
                AnalysisDate = Get-Date
                _DataType    = 'GuestUserActivityAnalysis'
            })
        }
        
        $topDomainCount = $Configuration.TopPartnerDomainsToAnalyze
        $guestDomains = $GuestUsers | Where-Object { $_.GuestDomain -ne "Unknown" } | 
                        Group-Object -Property GuestDomain | 
                        Sort-Object -Property Count -Descending | 
                        Select-Object -First $topDomainCount
        
        foreach ($domain in $guestDomains) {
            $domainGuests = $domain.Group
            $domainActiveCount = @($domainGuests | Where-Object { 
                $_.AccountEnabled -and $_.LastSignInDateTime -and [DateTime]$_.LastSignInDateTime -gt $cutoffDate 
            }).Count
            
            $activityDataList.Add([PSCustomObject]@{
                Category     = "By Domain"
                Metric       = $domain.Name
                Count        = $domain.Count
                Percentage   = if ($GuestUsers.Count -gt 0) { [Math]::Round(($domain.Count / $GuestUsers.Count) * 100, 2) } else { 0 }
                Details      = "Active: $domainActiveCount of $($domain.Count) ($ | [Math]::Round(($domainActiveCount / $domain.Count) * 100, 2))%)"
                AnalysisDate = Get-Date
                _DataType    = 'GuestUserActivityAnalysis'
            })
        }
        
        $ageGroups = @{
            "Last30Days"  = @{ Min = 0; Max = 30; Count = 0 }
            "Last90Days"  = @{ Min = 31; Max = 90; Count = 0 }
            "Last180Days" = @{ Min = 91; Max = 180; Count = 0 }
            "LastYear"    = @{ Min = 181; Max = 365; Count = 0 }
            "OverYear"    = @{ Min = 366; Max = [int]::MaxValue; Count = 0 }
        }
        
        foreach ($guest in $GuestUsers) {
            if ($guest.CreatedDateTime) {
                $ageDays = ((Get-Date) - [DateTime]$guest.CreatedDateTime).TotalDays
                
                foreach ($groupName in $ageGroups.Keys) {
                    $group = $ageGroups[$groupName]
                    if ($ageDays -ge $group.Min -and $ageDays -le $group.Max) {
                        $group.Count++
                        break
                    }
                }
            }
        }
        
        foreach ($groupName in $ageGroups.Keys) {
            $group = $ageGroups[$groupName]
            $activityDataList.Add([PSCustomObject]@{
                Category     = "By Invitation Age"
                Metric       = "Invited$groupName"
                Count        = $group.Count
                Percentage   = if ($GuestUsers.Count -gt 0) { [Math]::Round(($group.Count / $GuestUsers.Count) * 100, 2) } else { 0 }
                Details      = "Guests invited in this time period"
                AnalysisDate = Get-Date
                _DataType    = 'GuestUserActivityAnalysis'
            })
        }
        
        Write-MandALog -Message "Generated $($activityDataList.Count) activity analysis records" -Level "SUCCESS" -Context $Context
        return $activityDataList
    }
    catch {
        Write-MandALog -Message "Error analyzing guest user activity: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-PartnerOrganizationsEnhanced {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [array]$GuestUsers,
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory = $true)]
        [MandAContext]$Context
    )
    
    $partnerDataList = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        Write-MandALog -Message "Analyzing partner organizations from $($GuestUsers.Count) guest users..." -Level "INFO" -Context $Context
        
        $activityDays = $Configuration.GuestActivityDays
        $cutoffDate = (Get-Date).AddDays(-$activityDays)
        
        $partnerDomains = $GuestUsers | 
                         Where-Object { $_.GuestDomain -and $_.GuestDomain -ne "Unknown" } | 
                         Group-Object -Property GuestDomain | 
                         Sort-Object -Property Count -Descending
        
        foreach ($partner in $partnerDomains) {
            $partnerGuests = $partner.Group
            
            $activeCount = @($partnerGuests | Where-Object { 
                $_.AccountEnabled -and $_.LastSignInDateTime -and [DateTime]$_.LastSignInDateTime -gt $cutoffDate 
            }).Count
            
            $inactiveCount = @($partnerGuests | Where-Object { 
                $_.AccountEnabled -and ((-not $_.LastSignInDateTime) -or [DateTime]$_.LastSignInDateTime -le $cutoffDate)
            }).Count
            
            $disabledCount = @($partnerGuests | Where-Object { -not $_.AccountEnabled }).Count
            
            $departments = @($partnerGuests | Where-Object { $_.Department } | Select-Object -ExpandProperty Department -Unique)
            $jobTitles = @($partnerGuests | Where-Object { $_.JobTitle } | Select-Object -ExpandProperty JobTitle -Unique)
            $companies = @($partnerGuests | Where-Object { $_.CompanyName } | Select-Object -ExpandProperty CompanyName -Unique)
            
            $partnerType = Get-PartnerType -Domain $partner.Name
            
            $riskAssessment = Get-PartnerRiskAssessment -PartnerData @{
                Domain       = $partner.Name
                Type         = $partnerType
                TotalGuests  = $partnerGuests.Count
                ActiveCount  = $activeCount
                InactiveCount= $inactiveCount
                DisabledCount= $disabledCount
            }
            
            $creationDates = $partnerGuests | Where-Object { $_.CreatedDateTime } | ForEach-Object { [DateTime]$_.CreatedDateTime }
            $oldestGuest = if ($creationDates) { ($creationDates | Measure-Object -Minimum).Minimum } else { $null }
            $newestGuest = if ($creationDates) { ($creationDates | Measure-Object -Maximum).Maximum } else { $null }
            
            $collaborationDays = if ($oldestGuest) { ((Get-Date) - $oldestGuest).TotalDays } else { 0 }
            
            $partnerDataList.Add([PSCustomObject]@{
                PartnerDomain           = $partner.Name
                PartnerType             = $partnerType
                PrimaryCompany          = if ($companies.Count -eq 1) { $companies[0] } else { "Multiple ($($companies.Count))" }
                TotalGuests             = $partnerGuests.Count
                ActiveGuests            = $activeCount
                InactiveGuests          = $inactiveCount
                DisabledGuests          = $disabledCount
                ActivityRate            = if ($partnerGuests.Count -gt 0) { [Math]::Round(($activeCount / $partnerGuests.Count) * 100, 2) } else { 0 }
                UniqueDepartments       = $departments.Count
                DepartmentsList         = ($departments | Select-Object -First 10) -join "; "
                UniqueJobTitles         = $jobTitles.Count
                TopJobTitles            = ($jobTitles | Select-Object -First 10) -join "; "
                OldestGuestDate         = $oldestGuest
                NewestGuestDate         = $newestGuest
                CollaborationDurationDays = [Math]::Round($collaborationDays, 0)
                RiskLevel               = $riskAssessment.Level
                RiskScore               = $riskAssessment.Score
                RiskFactors             = $riskAssessment.Factors -join "; "
                LastAssessment          = Get-Date
                _DataType               = 'PartnerOrganizationsAnalysis'
            })
        }
        
        Write-MandALog -Message "Analyzed $($partnerDataList.Count) partner organizations" -Level "SUCCESS" -Context $Context
        return $partnerDataList
    }
    catch {
        Write-MandALog -Message "Error analyzing partner organizations: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-ExternalIdentityProvidersEnhanced {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory = $true)]
        [MandAContext]$Context
    )
    
$providerDataList = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        Write-MandALog -Message "Retrieving external identity providers..." -Level "INFO" -Context $Context
        
        $identityProviders = Invoke-DiscoveryWithRetry -ScriptBlock {
            Get-MgIdentityProvider -All -ErrorAction Stop
        } -OperationName "GetIdentityProviders" -Context $Context -CircuitBreaker $script:GraphCircuitBreaker
        
        if ($identityProviders) {
            foreach ($provider in $identityProviders) {
                $providerType = "Unknown"
                $additionalInfo = @{}
                
                if ($provider.AdditionalProperties -and $provider.AdditionalProperties.'@odata.type') {
                    $providerType = $provider.AdditionalProperties.'@odata.type' -replace '#microsoft.graph.', ''
                    
                    switch -Wildcard ($providerType) {
                        "*Google*" {
                            $additionalInfo.Scope = $provider.AdditionalProperties.scope -join "; "
                        }
                        "*Facebook*" {
                            $additionalInfo.GraphApiVersion = $provider.AdditionalProperties.graphApiVersion
                        }
                        "*SAML*" {
                            $additionalInfo.MetadataUrl = $provider.AdditionalProperties.metadataUrl
                            $additionalInfo.IssuerUri = $provider.AdditionalProperties.issuerUri
                        }
                    }
                }
                
                $providerDataList.Add([PSCustomObject]@{
                    ProviderId         = $provider.Id
                    ProviderType       = $providerType
                    DisplayName        = $provider.DisplayName
                    ClientId           = $provider.ClientId
                    ClientSecret       = if ($provider.ClientSecret) { "Configured" } else { "Not Configured" }
                    IsEnabled          = $true
                    ConfiguredDate     = $null
                    AdditionalProperties = ($additionalInfo | ConvertTo-Json -Compress)
                    DiscoveredAt       = Get-Date
                    _DataType          = 'ExternalIdentityProviders'
                })
            }
        }
        
        $providerDataList.Add([PSCustomObject]@{
            ProviderId         = "AzureAD-B2B-Default"
            ProviderType       = "AzureActiveDirectory"
            DisplayName        = "Azure AD B2B (Default)"
            ClientId           = "N/A"
            ClientSecret       = "N/A"
            IsEnabled          = $true
            ConfiguredDate     = $null
            AdditionalProperties = "{}"
            DiscoveredAt       = Get-Date
            _DataType          = 'ExternalIdentityProviders'
        })
        
        Write-MandALog -Message "Retrieved $($providerDataList.Count) identity providers" -Level "SUCCESS" -Context $Context
        return $providerDataList
    }
    catch {
        Write-MandALog -Message "Error retrieving external identity providers: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-GuestInvitationsEnhanced {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory = $true)]
        [MandAContext]$Context,
        [Parameter(Mandatory = $true)]
        [array]$GuestUsers
    )
    
    $invitationDataList = [System.Collections.Generic.List[PSObject]]::new()
    
    try {
        Write-MandALog -Message "Analyzing guest invitations..." -Level "INFO" -Context $Context
        
        try {
            $invitations = Invoke-DiscoveryWithRetry -ScriptBlock {
                Get-MgInvitation -All -ErrorAction Stop
            } -OperationName "GetInvitations" -Context $Context -CircuitBreaker $script:GraphCircuitBreaker
            
            if ($invitations -and $invitations.Count -gt 0) {
                Write-MandALog -Message "Found $($invitations.Count) direct invitation objects" -Level "INFO" -Context $Context
                
                foreach ($inv in $invitations) {
                    $invitationDataList.Add([PSCustomObject]@{
                        InvitationId        = $inv.Id
                        InvitedUserEmail    = $inv.InvitedUserEmailAddress
                        InvitedUserDisplayName = $inv.InvitedUserDisplayName
                        InvitedUserType     = $inv.InvitedUserType
                        InviteRedeemUrl     = if ($inv.InviteRedeemUrl) { "Present" } else { "Not Present" }
                        InviteRedirectUrl   = $inv.InviteRedirectUrl
                        Status              = $inv.Status
                        SendInvitationMessage = $inv.SendInvitationMessage
                        InvitedByUserId     = if ($inv.InvitedByUser) { $inv.InvitedByUser.Id } else { $null }
                        InvitedByUserUPN    = if ($inv.InvitedByUser) { $inv.InvitedByUser.UserPrincipalName } else { $null }
                        CreatedDateTime     = $inv.CreatedDateTime
                        MessageLanguage     = $inv.InvitationMessage.MessageLanguage
                        CustomizedMessage   = if ($inv.InvitationMessage.CustomizedMessageBody) { "Yes" } else { "No" }
                        _DataType           = 'GuestInvitationsSummary'
                    })
                }
            }
        }
        catch {
            Write-MandALog -Message "Could not retrieve invitation objects: $($_.Exception.Message)" -Level "WARN" -Context $Context
        }
        
        if ($invitationDataList.Count -eq 0 -and $GuestUsers -and $GuestUsers.Count -gt 0) {
            Write-MandALog -Message "Using guest user data for invitation analysis" -Level "INFO" -Context $Context
            
            $recentGuestCount = $Configuration.RecentGuestCountForInvitationFallback
            $recentGuests = $GuestUsers | 
                           Where-Object { $_.CreatedDateTime } | 
                           Sort-Object -Property CreatedDateTime -Descending | 
                           Select-Object -First $recentGuestCount
            
            foreach ($guest in $recentGuests) {
                $invitationDataList.Add([PSCustomObject]@{
                    InvitationId        = "N/A"
                    InvitedUserEmail    = if ($null -ne $guest.Mail) { $guest.Mail } else { $guest.UserPrincipalName }
                    InvitedUserDisplayName = $guest.DisplayName
                    InvitedUserType     = $guest.UserType
                    InviteRedeemUrl     = "N/A"
                    InviteRedirectUrl   = "N/A"
                    Status              = $guest.ExternalUserState
                    SendInvitationMessage = "Unknown"
                    InvitedByUserId     = "Unknown"
                    InvitedByUserUPN    = "Unknown"
                    CreatedDateTime     = $guest.CreatedDateTime
                    MessageLanguage     = "Unknown"
                    CustomizedMessage   = "Unknown"
                    DataSource          = "GuestUserFallback"
                    _DataType           = 'GuestInvitationsSummary'
                })
            }
        }
        
        Write-MandALog -Message "Processed $($invitationDataList.Count) invitation records" -Level "SUCCESS" -Context $Context
        return $invitationDataList
    }
    catch {
        Write-MandALog -Message "Error analyzing guest invitations: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-CrossTenantAccessEnhanced {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Configuration,
        [Parameter(Mandatory = $true)]
        [MandAContext]$Context
    )
    
    $results = @{
        Defaults = [System.Collections.Generic.List[PSObject]]::new()
        Partners = [System.Collections.Generic.List[PSObject]]::new()
    }
    
    try {
        Write-MandALog -Message "Retrieving cross-tenant access policy..." -Level "INFO" -Context $Context
        
        if (-not (Get-Command -Name Get-MgPolicyCrossTenantAccessPolicy -ErrorAction SilentlyContinue)) {
            Write-MandALog -Message "Cross-tenant access policy cmdlets not available. Module may not be loaded." -Level "WARN" -Context $Context
            
            $results.Defaults.Add([PSCustomObject]@{
                PolicyId    = "N/A"
                PolicyType  = "ModuleNotAvailable"
                TargetTenantId = "N/A"
                Notes       = "Install Microsoft.Graph.Identity.SignIns module for cross-tenant access policy"
                _DataType   = 'CrossTenantAccessPolicy_Defaults'
            })
            
            return $results
        }
        
        $policy = Invoke-DiscoveryWithRetry -ScriptBlock {
            Get-MgPolicyCrossTenantAccessPolicy -ErrorAction Stop
        } -OperationName "GetCrossTenantAccessPolicy" -Context $Context -CircuitBreaker $script:GraphCircuitBreaker
        
        if ($policy) {
            if ($policy.Default) {
                $default = $policy.Default
                
                $results.Defaults.Add([PSCustomObject]@{
                    PolicyId        = $policy.Id
                    PolicyType      = "Default"
                    TargetTenantId  = "All Tenants"
                    B2BCollabInbound_UsersAndGroups = $default.B2BCollaborationInbound.UsersAndGroups.AccessType
                    B2BCollabInbound_Applications = $default.B2BCollaborationInbound.Applications.AccessType
                    B2BCollabOutbound_UsersAndGroups = $default.B2BCollaborationOutbound.UsersAndGroups.AccessType
                    B2BCollabOutbound_Applications = $default.B2BCollaborationOutbound.Applications.AccessType
                    B2BDirectConnectInbound_Enabled = if ($default.B2BDirectConnectInbound) { $default.B2BDirectConnectInbound.IsEnabled } else { $false }
                    B2BDirectConnectOutbound_Enabled = if ($default.B2BDirectConnectOutbound) { $default.B2BDirectConnectOutbound.IsEnabled } else { $false }
                    InboundTrust_MfaAccepted = $default.InboundTrust.IsMfaAccepted
                    InboundTrust_CompliantDeviceAccepted = $default.InboundTrust.IsCompliantDeviceAccepted
                    InboundTrust_HybridJoinedDeviceAccepted = $default.InboundTrust.IsHybridAzureADJoinedDeviceAccepted
                    AutomaticUserConsent_InboundAllowed = $default.AutomaticUserConsentSettings.InboundAllowed
                    AutomaticUserConsent_OutboundAllowed = $default.AutomaticUserConsentSettings.OutboundAllowed
                    LastModified    = Get-Date
                    _DataType       = 'CrossTenantAccessPolicy_Defaults'
                })
            }
            
            $partners = Invoke-DiscoveryWithRetry -ScriptBlock {
                Get-MgPolicyCrossTenantAccessPolicyPartner -CrossTenantAccessPolicyId $policy.Id -All -ErrorAction Stop
            } -OperationName "GetCrossTenantAccessPolicyPartners" -Context $Context -CircuitBreaker $script:GraphCircuitBreaker
            
            if ($partners) {
                foreach ($partner in $partners) {
                    $results.Partners.Add([PSCustomObject]@{
                        PolicyId        = $policy.Id
                        PolicyType      = "Partner"
                        PartnerTenantId = $partner.TenantId
                        PartnerName     = $partner.TenantId
                        IsServiceProvider = $partner.IsServiceProvider
                        B2BCollabInbound_Enabled = if ($partner.B2BCollaborationInbound) { $true } else { $false }
                        B2BCollabOutbound_Enabled = if ($partner.B2BCollaborationOutbound) { $true } else { $false }
                        B2BDirectConnectInbound_Enabled = if ($partner.B2BDirectConnectInbound) { $true } else { $false }
                        B2BDirectConnectOutbound_Enabled = if ($partner.B2BDirectConnectOutbound) { $true } else { $false }
                        InboundTrust_MfaAccepted = if ($partner.InboundTrust) { $partner.InboundTrust.IsMfaAccepted } else { $false }
                        InboundTrust_CompliantDeviceAccepted = if ($partner.InboundTrust) { $partner.InboundTrust.IsCompliantDeviceAccepted } else { $false }
                        AutomaticUserConsent_InboundAllowed = if ($partner.AutomaticUserConsentSettings) { $partner.AutomaticUserConsentSettings.InboundAllowed } else { $false }
                        AutomaticUserConsent_OutboundAllowed = if ($partner.AutomaticUserConsentSettings) { $partner.AutomaticUserConsentSettings.OutboundAllowed } else { $false }
                        ConfiguredApplications = if ($partner.B2BCollaborationInbound.Applications.Targets) { $partner.B2BCollaborationInbound.Applications.Targets.Count } else { 0 }
                        LastModified    = Get-Date
                        _DataType       = 'CrossTenantAccessPolicy_Partners'
                    })
                }
            }
        }
        
        Write-MandALog -Message "Retrieved cross-tenant access policy: $($results.Defaults.Count) defaults, $($results.Partners.Count) partners" -Level "SUCCESS" -Context $Context
        return $results
    }
    catch {
        Write-MandALog -Message "Error retrieving cross-tenant access policy: $($_.Exception.Message)" -Level "ERROR" -Context $Context
        throw
    }
}

function Get-GraphDataInBatches {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Entity,
        [string]$Filter,
        [string[]]$Select,
        [string]$ExpandProperty,
        [int]$BatchSize = 999,
        [Parameter(Mandatory = $true)]
        [MandAContext]$Context
    )
    
    $allData = [System.Collections.Generic.List[PSObject]]::new()
    $uri = "v1.0/$Entity"
    $queryParams = @{
        '$top'   = $BatchSize
        '$count' = 'true'
    }
    
    if ($Filter) { $queryParams['$filter'] = $Filter }
    if ($Select) { $queryParams['$select'] = $Select -join ',' }
    if ($ExpandProperty) { $queryParams['$expand'] = $ExpandProperty }
    
    $headers = @{
        'ConsistencyLevel' = 'eventual'
    }
    
    do {
        try {
            $response = Invoke-DiscoveryWithRetry -ScriptBlock {
                Invoke-MgGraphRequest -Method GET -Uri $uri -Headers $headers -Body $queryParams -ErrorAction Stop
            } -OperationName "GraphBatch_$Entity" -Context $Context -CircuitBreaker $script:GraphCircuitBreaker
            
            if ($response.value) {
                $allData.AddRange($response.value)
                Write-Progress -Activity "Fetching $Entity" -Status "$($allData.Count) retrieved" -Id 2
            }
            
            $uri = $response.'@odata.nextLink'
            $queryParams = @{}
        }
        catch {
            Write-MandALog -Message "Error in batch retrieval: $($_.Exception.Message)" -Level "ERROR" -Context $Context
            throw
        }
    } while ($uri)
    
    Write-Progress -Activity "Fetching $Entity" -Completed -Id 2
    return $allData
}

function Get-GuestDomain {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        $Guest
    )
    
    if ($Guest.Mail) {
        return ($Guest.Mail -split '@')[1]
    }
    elseif ($Guest.UserPrincipalName -match '#EXT#@') {
        $parts = $Guest.UserPrincipalName -split '_'
        if ($parts.Count -ge 2) {
            $emailPart = $parts[-2]
            if ($emailPart -match '@') {
                return ($emailPart -split '@')[1]
            }
        }
    }
    elseif ($Guest.UserPrincipalName -match '@') {
        return ($Guest.UserPrincipalName -split '@')[1]
    }
    
    return "Unknown"
}

function Get-PartnerType {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Domain
    )
    
    switch -Regex ($Domain) {
        '\.(edu|ac\.|university\.)' { return "Educational Institution" }
        '\.(gov|mil)$' { return "Government" }
        '(gmail|yahoo|hotmail|outlook|live|aol|icloud|protonmail|yandex|mail|zoho)\.(com|net|org|me|ch|de|fr|uk|ca|ru|in)$' { 
            return "Consumer Email Provider" 
        }
        'onmicrosoft\.com$' { return "Microsoft Tenant" }
        '\.(io|app|cloud|saas)$' { return "Technology Company" }
        '\.(ngo|org)$' { return "Non-Profit Organization" }
        default { 
            if ($Domain -match '\.(com|biz|corp|inc|llc|ltd)$') {
                return "Commercial Organization"
            }
            return "External Partner"
        }
    }
}

function Get-PartnerRiskAssessment {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$PartnerData
    )
    
    $riskScore = 0
    $riskFactors = [System.Collections.Generic.List[string]]::new()
    
    switch ($PartnerData.Type) {
        "Consumer Email Provider" { 
            $riskScore += 30
            $riskFactors.Add("Consumer email domain")
        }
        "External Partner" {
            $riskScore += 10
            $riskFactors.Add("Unclassified external domain")
        }
        "Government" { $riskScore += 0 }
        "Educational Institution" { $riskScore += 5 }
        default { $riskScore += 5 }
    }
    
    $activityRate = if ($PartnerData.TotalGuests -gt 0) { 
        ($PartnerData.ActiveCount / $PartnerData.TotalGuests) * 100 
    } else { 0 }
    
    if ($activityRate -lt 10) {
        $riskScore += 25
        $riskFactors.Add("

Very low activity rate (<10%)")
    }
    elseif ($activityRate -lt 25) {
        $riskScore += 15
        $riskFactors.Add("Low activity rate (<25%)")
    }
    elseif ($activityRate -lt 50) {
        $riskScore += 5
        $riskFactors.Add("Moderate activity rate (<50%)")
    }
    
    $disabledRate = if ($PartnerData.TotalGuests -gt 0) { 
        ($PartnerData.DisabledCount / $PartnerData.TotalGuests) * 100 
    } else { 0 }
    
    if ($disabledRate -gt 50) {
        $riskScore += 20
        $riskFactors.Add("High disabled account rate (>50%)")
    }
    elseif ($disabledRate -gt 25) {
        $riskScore += 10
        $riskFactors.Add("Elevated disabled account rate (>25%)")
    }
    
    if ($PartnerData.TotalGuests -eq 1 -and $PartnerData.Type -ne "Consumer Email Provider") {
        $riskScore += 15
        $riskFactors.Add("Single user from partner organization")
    }
    
    if ($PartnerData.InactiveCount -gt ($PartnerData.TotalGuests * 0.75)) {
        $riskScore += 10
        $riskFactors.Add("Majority of users inactive (>75%)")
    }
    
    $riskLevel = switch ($riskScore) {
        { $_ -ge 60 } { "High" }
        { $_ -ge 30 } { "Medium" }
        { $_ -ge 15 } { "Low" }
        default { "Minimal" }
    }
    
    return @{
        Score   = $riskScore
        Level   = $riskLevel
        Factors = $riskFactors
    }
}

function Split-ArrayIntoBatches {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [array]$Array,
        [Parameter(Mandatory = $true)]
        [int]$BatchSize
    )
    
    $batches = [System.Collections.Generic.List[array]]::new()
    
    for ($i = 0; $i -lt $Array.Count; $i += $BatchSize) {
        $batch = $Array[$i..[Math]::Min($i + $BatchSize - 1, $Array.Count - 1)]
        $batches.Add($batch)
    }
    
    return $batches
}

function Convert-ToFlattenedData {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Results
    )
    
    $flatData = [System.Collections.Generic.List[PSObject]]::new()
    
    foreach ($key in $Results.Keys) {
        if ($Results[$key] -is [array] -or $Results[$key] -is [System.Collections.Generic.List[PSObject]]) {
            $flatData.AddRange($Results[$key])
        }
        elseif ($Results[$key] -is [hashtable]) {
            foreach ($subKey in $Results[$key].Keys) {
                if ($Results[$key][$subKey] -is [array] -or $Results[$key][$subKey] -is [System.Collections.Generic.List[PSObject]]) {
                    $flatData.AddRange($Results[$key][$subKey])
                }
            }
        }
    }
    
    return $flatData
}

Export-ModuleMember -Function 'Invoke-ExternalIdentityDiscovery'
