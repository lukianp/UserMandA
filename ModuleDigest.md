Based on the discovery modules provided, here are the ModuleDigest entries for each discovery module:

### MODULE: ActiveDirectoryDiscovery.psm1
📁 Path: `Modules/Discovery/ActiveDirectoryDiscovery.psm1`  
🔧 Purpose: Enhanced Active Directory Discovery Module for M&A Discovery Suite | Provides comprehensive Active Directory discovery with improved error handling, simplified null checks, and context-based operations.  
📌 Declared Functions:
- function Get-ADUsersDataInternal {
- function ConvertTo-UserObject {
- function Get-PasswordExpiryDate {
- function Get-ADGroupsDataInternal {
- function Process-GroupMembers {
- function Get-ADComputersDataInternal {
- function ConvertTo-ComputerObject {
- function Get-ADSitesAndServicesDataInternal {
- function Process-ADSite {
- function Get-ADDNSZoneDataInternal {
- function Get-ServerParameters {
- function BuildADFilter {
- function Test-SiteOption {
- function Get-TargetDNSServer {
- function Should-CollectZoneDetails {
- function ConvertTo-DNSZoneObject {
- function Collect-DNSRecords {
- function ConvertTo-DNSRecordObject {
- function Invoke-ActiveDirectoryDiscovery {
📦 Variables Used:
- $allUsers = [System.Collections.Generic.List[PSObject]]::new()
- $serverParams = @{}
- $userProperties = @(...)
- $filter = BuildADFilter -Configuration $Configuration -ObjectType "User"
- $allGroups = [System.Collections.Generic.List[PSObject]]::new()
- $allGroupMembers = [System.Collections.Generic.List[PSObject]]::new()
- $allComputers = [System.Collections.Generic.List[PSObject]]::new()
- $result = @{Sites = ...; SiteLinks = ...; Subnets = ...}
- $result = @{Zones = ...; Records = ...}
- $discoveredData = @{}

### MODULE: AzureDiscovery.psm1
📁 Path: `Modules/Discovery/AzureDiscovery.psm1`  
🔧 Purpose: Enhanced Azure Discovery Module with API Throttling Support | Provides comprehensive Azure resource discovery with improved error handling, API throttling, and context-based operations.  
📌 Declared Functions:
- function Get-AzureSubscriptionsInternal {
- function Get-AzureResourceGroupsInternal {
- function Get-AzureStorageAccountsInternal {
- function Get-AzureSQLDatabasesInternal {
- function Get-AzureWebAppsInternal {
- function Get-AzureKeyVaultsInternal {
- function Get-AzureNSGsInternal {
- function Get-AzureVMsDataInternal {
- function ConvertTo-VMObject {
- function Get-AzureADApplicationsInternal {
- function ConvertTo-ADApplicationObject {
- function Process-ADApplicationOwners {
- function Get-AzureServicePrincipalsInternal {
- function ConvertTo-ServicePrincipalObject {
- function Process-ServicePrincipalOwners {
- function Invoke-AzureDiscovery {
- function Initialize-AzureDiscoveryResults {
- function Process-TenantLevelResources {
- function Process-SubscriptionLevelResources {
- function Export-AzureDiscoveryData {
- function Invoke-AzureOperationWithThrottling {
📦 Variables Used:
- $script:ThrottleConfig = @{DefaultDelay = 1; ThrottleDelay = 60; MaxRetries = 3; RetryableErrors = @(...)}
- $progressModulePath = if ($global:MandA -and $global:MandA.Paths) {...}
- $allDiscoveredData = Initialize-AzureDiscoveryResults
- $allSubscriptions = [System.Collections.Generic.List[PSObject]]::new()
- $allRGs = [System.Collections.Generic.List[PSObject]]::new()
- $allStorage = [System.Collections.Generic.List[PSObject]]::new()
- $allDatabases = [System.Collections.Generic.List[PSObject]]::new()
- $allWebApps = [System.Collections.Generic.List[PSObject]]::new()
- $allKeyVaults = [System.Collections.Generic.List[PSObject]]::new()
- $allNSGs = [System.Collections.Generic.List[PSObject]]::new()
- $allVMs = [System.Collections.Generic.List[PSObject]]::new()
- $processedTenants = @{}
- $result = @{Applications = ...; Owners = ...}
- $result = @{ServicePrincipals = ...; Owners = ...}

### MODULE: EnvironmentDetectionDiscovery.psm1
📁 Path: `Modules/Discovery/EnvironmentDetectionDiscovery.psm1`  
🔧 Purpose: Enhanced Environment Detection Discovery Module | Detects the type of environment (Cloud-only, Hybrid, On-prem only) with improved structure and context-based operations.  
📌 Declared Functions:
- function Test-OnPremisesAD {
- function Test-AzureAD {
- function Get-CloudUserStatistics {
- function Invoke-EnvironmentDetectionDiscovery {
- function Get-EnvironmentType {
- function Initialize-EnvironmentInfo {
- function Get-OrganizationDetails {
- function Get-DomainInformation {
- function Test-ADConnect {
- function Find-ADConnectServers {
- function Test-Microsoft365Services {
- function Determine-EnvironmentType {
- function Write-EnvironmentSummary {
- function ConvertTo-EnvironmentDataObject {
📦 Variables Used:
- $progressModulePath = if ($global:MandA -and $global:MandA.Paths) {...}
- $environmentInfo = Initialize-EnvironmentInfo
- $adDomain = Get-ADDomain -ErrorAction Stop
- $adForest = Get-ADForest -ErrorAction Stop
- $mgContext = Get-MgContext -ErrorAction SilentlyContinue
- $cloudUsers = @()
- $pageSize = 999
- $ageGroups = @{...}
- $servers = @()
- $adConnectServers = Find-ADConnectServers -Context $Context
- $exoConnection = Get-PSSession | Where-Object {...}

### MODULE: ExchangeDiscovery.psm1
📁 Path: `Modules/Discovery/ExchangeDiscovery.psm1`  
🔧 Purpose: Exchange Online discovery for M&A Discovery Suite | Discovers Exchange Online mailboxes, distribution groups, permissions, and configurations  
📌 Declared Functions:
- function Invoke-ExchangeDiscovery {
- function Get-ExchangeMailboxes {
- function Get-ExchangeMailboxStatistics {
- function Get-ExchangeDistributionGroups {
- function Get-ExchangeMailSecurityGroups {
- function Get-ExchangeMailboxPermissions {
- function Get-ExchangeSendAsPermissions {
- function Get-ExchangeSendOnBehalfPermissions {
- function Get-ExchangeMailFlowRules {
- function Get-ExchangeRetentionPolicies {
📦 Variables Used:
- $outputPath = $Configuration.environment.outputPath
- $rawPath = Join-Path $outputPath "Raw"
- $discoveryResults = @{}
- $mailboxData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $mailboxes = @()
- $resultSize = 1000
- $resultPage = 1
- $statsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $batchSize = $Configuration.exchangeOnline.mailboxStatsBatchSize
- $dgData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $msgData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $permData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $sendAsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $sobData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $rulesData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $policyData = [System.Collections.Generic.List[PSCustomObject]]::new()

### MODULE: ExternalIdentityDiscovery.psm1
📁 Path: `Modules/Discovery/ExternalIdentityDiscovery.psm1`  
🔧 Purpose: Enhanced External Identity Discovery Module for M&A Discovery Suite | Discovers B2B guest users, collaboration settings, external identity providers, and partner organizations with improved performance and error handling  
📌 Declared Functions:
- function Get-B2BGuestUsersEnhanced {
- function Invoke-ExternalIdentityDiscovery {
- function Get-GraphDataInBatches {
- function Get-ExternalIdentityConfig {
- function Get-ExternalCollaborationSettingsEnhanced {
- function Get-GuestUserActivityEnhanced {
- function Get-PartnerOrganizationsEnhanced {
- function Get-ExternalIdentityProvidersEnhanced {
- function Get-GuestInvitationsEnhanced {
- function Get-CrossTenantAccessEnhanced {
- function Get-GuestDomain {
- function Get-PartnerType {
- function Get-PartnerRiskAssessment {
- function Split-ArrayIntoBatches {
- function Convert-ToFlattenedData {
- function Write-MandALog {
- function Invoke-DiscoveryWithRetry {
📦 Variables Used:
- $script:GraphCircuitBreaker = [CircuitBreaker]::new("MicrosoftGraph")
- $script:PerformanceTracker = $null
- $authModulePathFromGlobal = Join-Path $global:MandA.Paths.Authentication "DiscoveryModuleBase.psm1"
- $progressModulePath = if ($global:MandA -and $global:MandA.Paths) {...}
- $guestDataList = [System.Collections.Generic.List[PSObject]]::new()
- $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
- $propertiesToSelect = @(...)
- $guestBatches = Split-ArrayIntoBatches -Array $guests -BatchSize 50
- $settingsData = [System.Collections.Generic.List[PSObject]]::new()
- $activityDataList = [System.Collections.Generic.List[PSObject]]::new()
- $partnerDataList = [System.Collections.Generic.List[PSObject]]::new()
- $providerDataList = [System.Collections.Generic.List[PSObject]]::new()
- $invitationDataList = [System.Collections.Generic.List[PSObject]]::new()
- $results = @{Defaults = ...; Partners = ...}
- $config = Get-ExternalIdentityConfig -Configuration $Configuration

### MODULE: GPODiscovery.psm1
📁 Path: `Modules/Discovery/GPODiscovery.psm1`  
🔧 Purpose: Enhanced GPO discovery module with robust XML parsing and namespace handling | Handles Group Policy Object discovery with improved XML parsing, namespace resolution, and error handling  
📌 Declared Functions:
- function Export-DataToCSV {
- function Get-GPOData {
- function Get-GPOLinks {
- function Get-GPOPermissions {
- function Parse-GPOReport {
- function Export-GPODataToCSV {
- function Invoke-GPODiscovery {
📦 Variables Used:
- $allGPOs = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allDriveMappings = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allPrinterMappings = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allFolderRedirections = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allLogonScripts = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allGPOLinks = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allGPOPermissions = [System.Collections.Generic.List[PSCustomObject]]::new()
- $gpoReportsPath = Join-Path $OutputPath "GPOReports"
- $gpoParams = @{All = $true; ErrorAction = 'Stop'}
- $totalGPOs = $gpos.Count
- $processedCount = 0
- $successfullyProcessed = 0
- $failedProcessing = 0
- $domainController = $Configuration.environment.domainController
- $result = @{DriveMappings = ...; PrinterMappings = ...; FolderRedirections = ...; LogonScripts = ...}

### MODULE: GraphDiscovery.psm1
📁 Path: `Modules/Discovery/GraphDiscovery.psm1`  
🔧 Purpose: Handles discovery of Microsoft Graph entities for M&A Discovery Suite | This module provides comprehensive Microsoft Graph discovery capabilities including users, groups, applications, and other Graph entities.  
📌 Declared Functions:
- function Get-GraphUsersDataInternal {
- function Get-GraphGroupsDataInternal {
- function Invoke-GraphDiscovery {
📦 Variables Used:
- $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
- $allGraphUsers = [System.Collections.Generic.List[PSObject]]::new()
- $selectFields = $Configuration.graphAPI.selectFields.users
- $firstBatch = Get-MgUser -Select $selectFields -Top 100 -ConsistencyLevel eventual -ErrorAction Stop
- $countParams = @{ConsistencyLevel = 'eventual'; Count = $true}
- $totalUsers = $userCount.Count
- $processedCount = 0
- $pageSize = 999
- $allGraphGroups = [System.Collections.Generic.List[PSObject]]::new()
- $allGraphGroupMembers = [System.Collections.Generic.List[PSObject]]::new()
- $overallStatus = $true
- $discoveredData = @{}
- $getGroupMembersFlag = $false

### MODULE: IntuneDiscovery.psm1
📁 Path: `Modules/Discovery/IntuneDiscovery.psm1`  
🔧 Purpose: Enhanced Intune Discovery Module for M&A Discovery Suite | Discovers Intune managed devices, configurations, policies, apps, and user associations  
📌 Declared Functions:
- function Initialize-IntuneDiscovery {
- function Get-IntuneManagedDevicesInternal {
- function Get-IntuneDeviceSoftwareInternal {
- function Get-IntuneDeviceConfigurationsInternal {
- function Get-IntuneDeviceCompliancePoliciesInternal {
- function Get-IntuneManagedAppsInternal {
- function Get-IntuneAppProtectionPoliciesInternal {
- function Get-IntuneEnrollmentRestrictionsInternal {
- function Invoke-IntuneDiscovery {
- function Write-MandALog {
- function Export-DataToCSV {
📦 Variables Used:
- $script:outputPath = $null
- $script:outputPath = $Context.Paths.RawDataOutput
- $script:outputPath = $global:MandA.Paths.RawDataOutput
- $script:outputPath = ".\Raw"
- $allManagedDevices = [System.Collections.Generic.List[PSObject]]::new()
- $countQuery = Get-MgDeviceManagementManagedDevice -Top 1 -Count
- $totalDevices = $countQuery.Count
- $processedCount = 0
- $allDeviceSoftware = [System.Collections.Generic.List[PSObject]]::new()
- $useBeta = $false
- $currentDeviceNum = 0
- $batchSize = 10
- $allConfigs = [System.Collections.Generic.List[PSObject]]::new()
- $allPolicies = [System.Collections.Generic.List[PSObject]]::new()
- $allApps = [System.Collections.Generic.List[PSObject]]::new()
- $allRestrictions = [System.Collections.Generic.List[PSObject]]::new()
- $overallStatus = $true
- $discoveredData = @{}

### MODULE: LicensingDiscovery.psm1
📁 Path: `Modules/Discovery/LicensingDiscovery.psm1`  
🔧 Purpose: Microsoft 365 Licensing discovery for M&A Discovery Suite | Discovers license inventory, assignments, costs, and compliance  
📌 Declared Functions:
- function Invoke-LicensingDiscovery {
- function Get-LicenseSKUsData {
- function Get-UserLicenseAssignmentsData {
- function Get-LicenseUsageAnalysisData {
- function Get-ServicePlanUsageData {
- function Get-LicenseCostAnalysisData {
- function Get-LicenseComplianceData {
- function Get-GroupBasedLicensingData {
- function Get-FriendlyLicenseName {
- function Get-FriendlyServicePlanName {
- function Get-EstimatedLicensePrice {
- function Get-EstimatedLicenseCost {
- function Export-DataToCSV {
- function Import-DataFromCSV {
📦 Variables Used:
- $outputPath = $Configuration.environment.outputPath
- $rawPath = Join-Path $outputPath "Raw"
- $discoveryResults = @{}
- $skuData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $licenseData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $servicePlanData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $usageData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $costData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $complianceData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $groupLicenseData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $totalMonthlyCost = 0
- $totalAnnualCost = 0
- $totalUnusedCost = 0
- $servicePlanUsage = @{}
- $sampleUsers = Get-MgUser -Top 100 -Property Id,AssignedLicenses -ErrorAction Stop
- $licenseNames = @{...}
- $servicePlanNames = @{...}
- $prices = @{...}

### MODULE: NetworkInfrastructureDiscovery.psm1
📁 Path: `Modules/Discovery/NetworkInfrastructureDiscovery.psm1`  
🔧 Purpose: Network Infrastructure discovery for M&A Discovery Suite | Discovers DHCP, DNS, and network configuration information  
📌 Declared Functions:
- function Invoke-NetworkInfrastructureDiscovery {
- function Get-DHCPServersData {
- function Get-DHCPScopesData {
- function Get-DHCPReservationsData {
- function Get-DHCPOptionsData {
- function Get-DNSServersData {
- function Get-DNSZonesData {
- function Get-DNSRecordsData {
- function Get-ADSubnetsData {
- function Get-ADSitesData {
📦 Variables Used:
- $outputPath = $Configuration.environment.outputPath
- $discoveryResults = @{}
- $dhcpServers = [System.Collections.Generic.List[PSCustomObject]]::new()
- $dhcpScopes = [System.Collections.Generic.List[PSCustomObject]]::new()
- $dhcpReservations = [System.Collections.Generic.List[PSCustomObject]]::new()
- $dhcpOptions = [System.Collections.Generic.List[PSCustomObject]]::new()
- $dnsServers = [System.Collections.Generic.List[PSCustomObject]]::new()
- $dnsZones = [System.Collections.Generic.List[PSCustomObject]]::new()
- $dnsRecords = [System.Collections.Generic.List[PSCustomObject]]::new()
- $subnets = [System.Collections.Generic.List[PSCustomObject]]::new()
- $sites = [System.Collections.Generic.List[PSCustomObject]]::new()
- $domain = [System.DirectoryServices.ActiveDirectory.Domain]::GetCurrentDomain()
- $forest = $domain.Forest
- $servicePlanUsage = @{}
- $importantRecordTypes = @("A", "AAAA", "CNAME", "MX", "SRV", "TXT")
- $configNC = ([ADSI]"LDAP://RootDSE").configurationNamingContext
- $subnetContainer = [ADSI]"LDAP://CN=Subnets,CN=Sites,$configNC"

### MODULE: SharePointDiscovery.psm1
📁 Path: `Modules/Discovery/SharePointDiscovery.psm1`  
🔧 Purpose: SharePoint Online discovery for M&A Discovery Suite | Discovers SharePoint sites, permissions, storage, external sharing, and content  
📌 Declared Functions:
- function Invoke-SharePointDiscovery {
- function Get-SharePointSitesData {
- function Get-SharePointHubSitesData {
- function Get-SharePointExternalUsersData {
- function Get-SharePointSharingLinksData {
- function Get-SharePointSitePermissionsData {
- function Get-SharePointStorageMetricsData {
- function Get-SharePointContentTypesData {
- function Get-SPOAdminUrl {
📦 Variables Used:
- $outputPath = $Configuration.environment.outputPath
- $rawPath = Join-Path $outputPath "Raw"
- $discoveryResults = @{}
- $sitesData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $includeOneDrive = $Configuration.sharepoint.includeOneDriveSites
- $processedCount = 0
- $siteType = "TeamSite"
- $hubSitesData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $associatedSites = Get-SPOSite -Limit All | Where-Object { $_.HubSiteId -eq $hub.HubSiteId }
- $externalUsersData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $position = 0
- $pageSize = 50
- $hasMore = $true
- $sharingLinksData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $permissionsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $storageData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $contentTypesData = [System.Collections.Generic.List[PSCustomObject]]::new()

### MODULE: TeamsDiscovery.psm1
📁 Path: `Modules/Discovery/TeamsDiscovery.psm1`  
🔧 Purpose: Microsoft Teams discovery for M&A Discovery Suite | Discovers Teams, channels, members, apps, policies, and phone configurations  
📌 Declared Functions:
- function Invoke-TeamsDiscovery {
- function Get-TeamsData {
- function Get-TeamChannelsData {
- function Get-TeamMembersData {
- function Get-TeamAppsData {
- function Get-TeamsGuestUsersData {
- function Get-TeamsPoliciesData {
- function Get-TeamsPhoneData {
- function Export-DataToCSV {
- function Import-DataFromCSV {
📦 Variables Used:
- $outputPath = $Configuration.environment.outputPath
- $rawPath = Join-Path $outputPath "Raw"
- $discoveryResults = @{}
- $isConnected = $false
- $testTeams = Get-Team -ErrorAction Stop | Select-Object -First 1
- $teamsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $processedCount = 0
- $teamSettings = @{...}
- $owners = @()
- $members = @()
- $guests = @()
- $channelsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $membersData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $appsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $guestData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $guestUsers = @()
- $teamMemberships = @()
- $policiesData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $policyTypes = @(...)
- $phoneData = [System.Collections.Generic.List[PSCustomObject]]::new()
