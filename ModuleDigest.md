<!--
Author: Lukian Poleschtschuk
Version: 1.0.0
Created: 2025-06-05
Last Modified: 2025-06-06
Change Log: Updated version control header
-->
<!--
Author: Lukian Poleschtschuk
Version: 1.0.0
Created: 2025-06-05
Last Modified: 2025-06-06
Change Log: Initial version - any future changes require version increment
-->
### MODULE: Authentication.psm1  
ðŸ“ Path: `Modules/Authentication/Authentication.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION | .SYNOPSIS  
ðŸ“Œ Declared Functions:
- function Initialize-MandAAuthentication {
- function Test-AuthenticationStatus {
- function Update-AuthenticationTokens {
- function Get-AuthenticationContext {
- function Clear-AuthenticationContext {
- function Get-AuthenticationStatus {
ðŸ“¦ Variables Used:
- $script:AuthContext = $null
- $script:LastAuthAttempt = $null
- $script:AuthContext = $null
- $script:LastAuthAttempt = Get-Date
- $credentials = Get-SecureCredentials -Configuration $Configuration
- $errorMsg = if ($credentials.Error) { $credentials.Error } else { "Unknown error in credential retrieval" }
- $requiredProps = @('ClientId', 'ClientSecret', 'TenantId')
- $missingProps = @()
- $missingProps += $prop
- $validationResult = Test-CredentialValidity -Credentials $credentials -Configuration $Configuration
- $script:AuthContext = @{
- $authResult = @{
- $errorDetails = @{
- $script:AuthContext = $null
- $refreshResult = Initialize-MandAAuthentication -Configuration $Configuration
- $errorMsg = if ($refreshResult.Error) { $refreshResult.Error } else { "Unknown error" }
- $requiredProps = @('ClientId', 'ClientSecret', 'TenantId')
- $missingProps = @()
- $missingProps += $prop
- $script:AuthContext = $null
- $script:LastAuthAttempt = $null
- $status = @{
- $status.ContextKeys = $script:AuthContext.Keys
- $status.TokenExpiry = $script:AuthContext.TokenExpiry
- $requiredProps = @('ClientId', 'ClientSecret', 'TenantId')
- $hasAllProps = $true
- $hasAllProps = $false
- $status.HasValidContext = $hasAllProps
- $timeRemaining = $script:AuthContext.TokenExpiry - (Get-Date)
- $status.TimeRemaining = $timeRemaining
- $status.IsExpired = $timeRemaining.TotalSeconds -le 0


### MODULE: CredentialManagement.psm1  
ðŸ“ Path: `Modules/Authentication/CredentialManagement.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Get-SecureCredentials {
- function Get-InteractiveCredentials {
- function Set-SecureCredentials {
- function Test-CredentialValidity {
- function Remove-StoredCredentials {
ðŸ“¦ Variables Used:
- $formatHandlerPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Utilities\CredentialFormatHandler.psm1"
- $credentialPath = $Configuration.authentication.credentialStorePath
- $credentialData = Read-CredentialFile -Path $credentialPath
- $clientId = Read-Host "Client ID (App ID)"
- $clientId = $clientId.Trim()
- $clientId = $null
- $tenantId = Read-Host "Tenant ID"
- $tenantId = $tenantId.Trim()
- $tenantId = $null
- $clientSecretSecure = Read-Host "Client Secret" -AsSecureString
- $clientSecret = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
- $saveChoice = Read-Host "Save credentials securely for future use? (y/N)"
- $saved = Set-SecureCredentials -ClientId $clientId -ClientSecret $clientSecret -TenantId $tenantId -Configuration $Configuration
- $credentialData = @{
- $credentialPath = $Configuration.authentication.credentialStorePath
- $result = Save-CredentialFile -Path $credentialPath -CredentialData $credentialData
- $verifyData = Read-CredentialFile -Path $credentialPath
- $credData = $null
- $credData = @{
- $credData = $Credentials
- $credentialPath = $Configuration.authentication.credentialStorePath


### MODULE: EnhancedConnectionManager.psm1  
ðŸ“ Path: `Modules/Connectivity/EnhancedConnectionManager.psm1`  
ðŸ”§ Purpose: No synopsis found.  
ðŸ“Œ Declared Functions:
- function Initialize-AllConnections {
- function Connect-MandAGraphEnhanced {
- function Connect-MandAAzureEnhanced {
- function Connect-MandAExchangeEnhanced {
- function Connect-MandAActiveDirectory {
- function Get-ConnectionStatus {
- function Disconnect-AllServices {
ðŸ“¦ Variables Used:
- $script:ConnectionStatus = @{
- $workingAuthContext = $null
- $workingAuthContext = $AuthContext.Context
- $workingAuthContext = $AuthContext
- $workingAuthContext = Get-AuthenticationContext
- $requiredProps = @('ClientId', 'TenantId', 'ClientSecret')
- $missingProps = @()
- $missingProps += $prop
- $connectionResults = @{}
- $enabledSources = $Configuration.discovery.enabledSources
- $connectionResults.Graph = Connect-MandAGraphEnhanced -AuthContext $workingAuthContext -Configuration $Configuration
- $connectionResults.Azure = Connect-MandAAzureEnhanced -AuthContext $workingAuthContext -Configuration $Configuration
- $connectionResults.ExchangeOnline = Connect-MandAExchangeEnhanced -AuthContext $workingAuthContext -Configuration $Configuration
- $connectionResults.ActiveDirectory = Connect-MandAActiveDirectory -Configuration $Configuration
- $connectedServices = ($connectionResults.Values | Where-Object { $_ -eq $true }).Count
- $totalServices = $connectionResults.Count
- $status = $script:ConnectionStatus[$service.Key]
- $connectTime = if ($status.ConnectedTime) { $status.ConnectedTime.ToString("HH:mm:ss") } else { "Unknown" }
- $method = if ($status.Method) { " via $($status.Method)" } else { "" }
- $lastError = if ($status.LastError) { " - $($status.LastError)" } else { "" }
- $script:ConnectionStatus.Graph.LastError = "Missing required authentication properties"
- $modulesToImport = @(
- $maxRetries = $Configuration.environment.maxRetries
- $retryDelay = 5
- $existingContext = $null
- $existingContext = Get-MgContext -ErrorAction SilentlyContinue
- $org = Get-MgOrganization -Top 1 -ErrorAction Stop
- $script:ConnectionStatus.Graph.Connected = $true
- $script:ConnectionStatus.Graph.Context = $existingContext
- $script:ConnectionStatus.Graph.ConnectedTime = Get-Date
- $script:ConnectionStatus.Graph.Method = "Existing Session"
- $script:ConnectionStatus.Graph.LastError = $null
- $secureSecret = ConvertTo-SecureString $AuthContext.ClientSecret -AsPlainText -Force
- $clientCredential = New-Object System.Management.Automation.PSCredential ($AuthContext.ClientId, $secureSecret)
- $context = Get-MgContext -ErrorAction Stop
- $org = Get-MgOrganization -Top 1 -ErrorAction Stop
- $script:ConnectionStatus.Graph.Connected = $true
- $script:ConnectionStatus.Graph.Context = $context
- $script:ConnectionStatus.Graph.LastError = $null
- $script:ConnectionStatus.Graph.ConnectedTime = Get-Date
- $script:ConnectionStatus.Graph.Method = "Client Secret"
- $errorMessage = $_.Exception.Message
- $script:ConnectionStatus.Graph.LastError = $errorMessage
- $retryDelay += 2
- $script:ConnectionStatus.Graph.Connected = $false
- $script:ConnectionStatus.Graph.Connected = $false
- $script:ConnectionStatus.Graph.LastError = $_.Exception.Message
- $script:ConnectionStatus.Azure.LastError = "Missing required authentication properties"
- $maxRetries = $Configuration.environment.maxRetries
- $currentContext = Get-AzContext -ErrorAction SilentlyContinue
- $testSub = Get-AzSubscription -ErrorAction Stop | Select-Object -First 1
- $script:ConnectionStatus.Azure.Connected = $true
- $script:ConnectionStatus.Azure.Context = $currentContext
- $script:ConnectionStatus.Azure.ConnectedTime = Get-Date
- $script:ConnectionStatus.Azure.Method = "Existing Session"
- $script:ConnectionStatus.Azure.LastError = $null
- $secureSecret = ConvertTo-SecureString $AuthContext.ClientSecret -AsPlainText -Force
- $credential = New-Object System.Management.Automation.PSCredential ($AuthContext.ClientId, $secureSecret)
- $azContext = Connect-AzAccount -ServicePrincipal -Credential $credential -TenantId $AuthContext.TenantId -ErrorAction Stop
- $subscriptions = Get-AzSubscription -ErrorAction SilentlyContinue
- $totalSubs = $subscriptions.Count
- $activeSubs = ($subscriptions | Where-Object { $_.State -eq "Enabled" }).Count
- $script:ConnectionStatus.Azure.Connected = $true
- $script:ConnectionStatus.Azure.Context = $azContext
- $script:ConnectionStatus.Azure.LastError = $null
- $script:ConnectionStatus.Azure.ConnectedTime = Get-Date
- $script:ConnectionStatus.Azure.Method = "Service Principal"
- $errorMessage = $_.Exception.Message
- $script:ConnectionStatus.Azure.LastError = $errorMessage
- $script:ConnectionStatus.Azure.Connected = $false
- $script:ConnectionStatus.Azure.Connected = $false
- $script:ConnectionStatus.Azure.LastError = $_.Exception.Message
- $script:ConnectionStatus.ExchangeOnline.LastError = "Missing required authentication properties"
- $script:ConnectionStatus.ExchangeOnline.LastError = "ExchangeOnlineManagement module not available"
- $maxRetries = $Configuration.environment.maxRetries
- $certificateThumbprint = $Configuration.authentication.certificateThumbprint
- $connectParams = @{
- $script:ConnectionStatus.ExchangeOnline.Method = "Certificate (App-Only)"
- $connectParams = @{
- $script:ConnectionStatus.ExchangeOnline.Method = "Delegated (Interactive)"
- $mailbox = Get-Mailbox -ResultSize 1 -ErrorAction Stop
- $script:ConnectionStatus.ExchangeOnline.Connected = $true
- $script:ConnectionStatus.ExchangeOnline.LastError = $null
- $script:ConnectionStatus.ExchangeOnline.ConnectedTime = Get-Date
- $errorMessage = $_.Exception.Message
- $script:ConnectionStatus.ExchangeOnline.LastError = $errorMessage
- $script:ConnectionStatus.ExchangeOnline.Connected = $false
- $script:ConnectionStatus.ExchangeOnline.Connected = $false
- $script:ConnectionStatus.ExchangeOnline.LastError = $_.Exception.Message
- $domainController = $Configuration.environment.domainController
- $adTest = Get-ADDomain -Server $domainController -ErrorAction Stop
- $script:ConnectionStatus.ActiveDirectory.Connected = $true
- $script:ConnectionStatus.ActiveDirectory.Context = $adTest
- $script:ConnectionStatus.ActiveDirectory.LastError = $null
- $script:ConnectionStatus.ActiveDirectory.ConnectedTime = Get-Date
- $script:ConnectionStatus.ActiveDirectory.Method = "Direct"
- $script:ConnectionStatus.ActiveDirectory.Connected = $false
- $script:ConnectionStatus.ActiveDirectory.LastError = $_.Exception.Message
- $script:ConnectionStatus.ActiveDirectory.Connected = $false
- $script:ConnectionStatus.ActiveDirectory.LastError = $_.Exception.Message
- $status = $script:ConnectionStatus[$service]
- $script:ConnectionStatus[$service].Connected = $false
- $script:ConnectionStatus[$service].Context = $null
- $script:ConnectionStatus[$service].ConnectedTime = $null
- $script:ConnectionStatus[$service].Method = $null


### MODULE: ActiveDirectoryDiscovery.psm1  
ðŸ“ Path: `Modules/Discovery/ActiveDirectoryDiscovery.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Export-MandAData {
- function Get-ADUsersDataInternal {
- function Get-ADGroupsDataInternal {
- function Get-ADComputersDataInternal {
- function Get-ADOUsDataInternal {
- function Get-ADSitesAndServicesDataInternal {
- function Get-ADDNSZoneDataInternal {
- function Invoke-ActiveDirectoryDiscovery {
ðŸ“¦ Variables Used:
- $baseOutputPath = $Configuration.environment.outputPath
- $outputPath = Join-Path $baseOutputPath $SubFolder
- $fullPath = Join-Path $outputPath "$($FileName).csv"
- $allUsers = [System.Collections.Generic.List[PSObject]]::new()
- $globalCatalog = $Configuration.environment.globalCatalog
- $serverParams = if ($globalCatalog) { @{ Server = $globalCatalog } } else { @{} }
- $userProperties = @(
- $filter = "*" # Add OU filtering logic here if needed from $Configuration.discovery.discoveryScope
- $adUsers = Get-ADUser -Filter $filter -Properties $userProperties @serverParams -ErrorAction Stop
- $lastLogonDate = $null
- $lastLogonDate = [datetime]::FromFileTime($user.LastLogonTimestamp)
- $passwordExpiryDateValue = "Not Set/Error"
- $expiryTimeComputed = $user.'msDS-UserPasswordExpiryTimeComputed'
- $passwordExpiryDateValue = "PasswordNeverExpires (User Flag)"
- $passwordExpiryDateValue = "UserMustChangePasswordAtNextLogon (pwdLastSet=0)"
- $passwordExpiryDateValue = "Never (Calculated as MaxValue)"
- $passwordExpiryDateValue = "SpecialCondition (e.g., Negative FileTime)"
- $passwordExpiryDateValue = [datetime]::FromFileTime($expiryTimeComputed)
- $passwordExpiryDateValue = "Invalid FileTime Value: $expiryTimeComputed"
- $userObj = [PSCustomObject]@{
- $allGroups = [System.Collections.Generic.List[PSObject]]::new()
- $allGroupMembers = [System.Collections.Generic.List[PSObject]]::new()
- $globalCatalog = $Configuration.environment.globalCatalog
- $serverParams = if ($globalCatalog) { @{ Server = $globalCatalog } } else { @{} }
- $groupProperties = @('SamAccountName', 'Name', 'GroupCategory', 'GroupScope', 'Description', 'DistinguishedName', 'whenCreated', 'whenChanged', 'mail', 'ManagedBy', 'member')
- $adGroups = Get-ADGroup -Filter * -Properties $groupProperties @serverParams -ErrorAction Stop
- $memberObj = Get-ADObject -Identity $memberDN -Properties SamAccountName, ObjectClass @serverParams -ErrorAction Stop
- $allComputers = [System.Collections.Generic.List[PSObject]]::new()
- $globalCatalog = $Configuration.environment.globalCatalog
- $serverParams = if ($globalCatalog) { @{ Server = $globalCatalog } } else { @{} }
- $computerProperties = @('Name', 'DNSHostName', 'OperatingSystem', 'OperatingSystemVersion', 'OperatingSystemServicePack', 'Enabled', 'DistinguishedName', 'whenCreated', 'whenChanged', 'LastLogonTimestamp', 'Description', 'ManagedBy', 'MemberOf')
- $adComputers = Get-ADComputer -Filter * -Properties $computerProperties @serverParams -ErrorAction Stop
- $lastLogon = $null
- $lastLogon = [datetime]::FromFileTime($computer.LastLogonTimestamp)
- $allOUs = [System.Collections.Generic.List[PSObject]]::new()
- $globalCatalog = $Configuration.environment.globalCatalog
- $serverParams = if ($globalCatalog) { @{ Server = $globalCatalog } } else { @{} }
- $ouPropertiesToSelect = @('Name', 'DistinguishedName', 'Description', 'ManagedBy', 'ProtectedFromAccidentalDeletion', 'whenCreated', 'whenChanged')
- $adOUs = Get-ADOrganizationalUnit -Filter * -Properties $ouPropertiesToSelect @serverParams -ErrorAction Stop
- $ouData = @{}
- $allSiteData = [System.Collections.Generic.List[PSObject]]::new()
- $allSiteLinkData = [System.Collections.Generic.List[PSObject]]::new()
- $allSubnetData = [System.Collections.Generic.List[PSObject]]::new()
- $globalCatalog = $Configuration.environment.globalCatalog
- $serverParams = if ($globalCatalog) { @{ Server = $globalCatalog } } else { @{} }
- $sites = Get-ADReplicationSite -Filter * -Properties Options @serverParams -ErrorAction Stop
- $serversInSite = @()
- $dcInSite = @()
- $serversInSite = Get-ADComputer -Filter '(!(userAccountControl:1.2.840.113556.1.4.803:=8192))' -SearchBase $site.DistinguishedName @serverParams -ErrorAction SilentlyContinue
- $dcInSite = Get-ADDomainController -Filter * -Site $site.Name @serverParams -ErrorAction SilentlyContinue
- $siteOptions = $site.Options
- $siteLinks = Get-ADReplicationSiteLink -Filter * @serverParams -ErrorAction Stop
- $subnets = Get-ADReplicationSubnet -Filter * -Properties Site @serverParams -ErrorAction Stop
- $allDNSZoneData = [System.Collections.Generic.List[PSObject]]::new()
- $allDNSRecordData = [System.Collections.Generic.List[PSObject]]::new()
- $dnsServerParams = @{}
- $targetDnsServer = $Configuration.discovery.adDns.dnsServer
- $dnsServerParams.ComputerName = $targetDnsServer
- $zonesToDetail = @($Configuration.discovery.adDns.detailedZones)
- $zones = Get-DnsServerZone @dnsServerParams -ErrorAction Stop
- $replicationScopeValue = "N/A"
- $records = Get-DnsServerResourceRecord -ZoneName $zone.ZoneName @dnsServerParams -RRType All -ErrorAction SilentlyContinue
- $overallStatus = $true
- $discoveredData = @{}
- $globalCatalog = $Configuration.environment.globalCatalog
- $globalCatalog = $Configuration.environment.domainController
- $discoveredData.Users             = Get-ADUsersDataInternal -Configuration $Configuration
- $discoveredData.GroupsAndMembers  = Get-ADGroupsDataInternal -Configuration $Configuration
- $discoveredData.Computers         = Get-ADComputersDataInternal -Configuration $Configuration
- $discoveredData.OUs               = Get-ADOUsDataInternal -Configuration $Configuration
- $discoveredData.SitesAndServices  = Get-ADSitesAndServicesDataInternal -Configuration $Configuration
- $discoveredData.DNSInfo           = Get-ADDNSZoneDataInternal -Configuration $Configuration
- $overallStatus = $false


### MODULE: AzureDiscovery.psm1  
ðŸ“ Path: `Modules/Discovery/AzureDiscovery.psm1`  
ðŸ”§ Purpose: No synopsis found.  
ðŸ“Œ Declared Functions:
- function Get-AzureSubscriptionsInternal {
- function Get-AzureResourceGroupsInternal {
- function Get-AzureVMsDataInternal {
- function Get-AzureADApplicationsInternal {
- function Get-AzureServicePrincipalsInternal {
- function Invoke-AzureDiscovery {
ðŸ“¦ Variables Used:
- $allSubscriptions = [System.Collections.Generic.List[PSObject]]::new()
- $subscriptions = Get-AzSubscription -ErrorAction SilentlyContinue
- $allRGs = [System.Collections.Generic.List[PSObject]]::new()
- $rgs = Get-AzResourceGroup -ErrorAction SilentlyContinue
- $allVMs = [System.Collections.Generic.List[PSObject]]::new()
- $vms = Get-AzVM -Status -ErrorAction SilentlyContinue
- $ipConfigs = ($vm.NetworkProfile.NetworkInterfaces | ForEach-Object {
- $nic = Get-AzNetworkInterface -ResourceId $_.Id -ErrorAction SilentlyContinue
- $allADApps = [System.Collections.Generic.List[PSObject]]::new()
- $allAppOwners = [System.Collections.Generic.List[PSObject]]::new()
- $apps = Get-AzADApplication -First 10000 -ErrorAction SilentlyContinue
- $owners = Get-AzADAppOwner -ApplicationObjectId $app.Id -ErrorAction SilentlyContinue
- $allSPs = [System.Collections.Generic.List[PSObject]]::new()
- $allSPOwners = [System.Collections.Generic.List[PSObject]]::new()
- $sps = Get-AzADServicePrincipal -First 10000 -ErrorAction SilentlyContinue
- $owners = Get-AzADServicePrincipalOwner -ServicePrincipalObjectId $sp.Id -ErrorAction SilentlyContinue
- $overallStatus = $true
- $allDiscoveredAzureData = @{ Subscriptions = [System.Collections.Generic.List[PSObject]]::new(); ResourceGroups = [System.Collections.Generic.List[PSObject]]::new(); VirtualMachines = [System.Collections.Generic.List[PSObject]]::new(); ADApplications = [System.Collections.Generic.List[PSObject]]::new(); ADApplicationOwners = [System.Collections.Generic.List[PSObject]]::new(); ServicePrincipals = [System.Collections.Generic.List[PSObject]]::new(); ServicePrincipalOwners = [System.Collections.Generic.List[PSObject]]::new(); PolicyAssignments = [System.Collections.Generic.List[PSObject]]::new(); PolicyComplianceStates = [System.Collections.Generic.List[PSObject]]::new(); NetworkSecurityGroups = [System.Collections.Generic.List[PSObject]]::new(); NSGRules = [System.Collections.Generic.List[PSObject]]::new(); Firewalls = [System.Collections.Generic.List[PSObject]]::new(); FirewallPolicies = [System.Collections.Generic.List[PSObject]]::new(); FirewallRuleCollectionGroups = [System.Collections.Generic.List[PSObject]]::new(); RecoveryServicesVaults = [System.Collections.Generic.List[PSObject]]::new(); BackupPolicies = [System.Collections.Generic.List[PSObject]]::new(); BackupItems = [System.Collections.Generic.List[PSObject]]::new(); ASRFabrics = [System.Collections.Generic.List[PSObject]]::new(); ASRReplicatedItems = [System.Collections.Generic.List[PSObject]]::new(); ASRRecoveryPlans = [System.Collections.Generic.List[PSObject]]::new() }
- $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
- $currentAzContext = Get-AzContext -ErrorAction SilentlyContinue
- $subscriptions = Get-AzureSubscriptionsInternal -Configuration $Configuration
- $processedTenantsForADObjects = @{} # To process each tenant only once for AD objects
- $tenantId = $subEntry.TenantId
- $adAppsData = Get-AzureADApplicationsInternal -Configuration $Configuration -TenantIdForContext $tenantId
- $spData = Get-AzureServicePrincipalsInternal -Configuration $Configuration -TenantIdForContext $tenantId
- $processedTenantsForADObjects[$tenantId] = $true
- $currentSubscriptionContext = Get-AzContext # Get the full context object for passing
- $rgs = Get-AzureResourceGroupsInternal -Configuration $Configuration -SubscriptionContext $currentSubscriptionContext
- $vms = Get-AzureVMsDataInternal -Configuration $Configuration -SubscriptionContext $currentSubscriptionContext
- $policyData = Get-AzurePolicyDataInternal -Configuration $Configuration -SubscriptionContext $currentSubscriptionContext
- $netSecData = Get-AzureNetworkSecurityDataInternal -Configuration $Configuration -SubscriptionContext $currentSubscriptionContext
- $backupData = Get-AzureBackupAndRecoveryDataInternal -Configuration $Configuration -SubscriptionContext $currentSubscriptionContext
- $dataList = $allDiscoveredAzureData[$key]


### MODULE: EnvironmentDetectionDiscovery.psm1  
ðŸ“ Path: `Modules/Discovery/EnvironmentDetectionDiscovery.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Export-DataToCSV {
- function Get-EnvironmentType {
- function Invoke-EnvironmentDetectionDiscovery {
ðŸ“¦ Variables Used:
- $environmentInfo = @{
- $adDomain = Get-ADDomain -ErrorAction Stop
- $adForest = Get-ADForest -ErrorAction Stop
- $environmentInfo.HasOnPremAD = $true
- $environmentInfo.OnPremDomains += $adDomain.DNSRoot
- $environmentInfo.EnvironmentDetails.ADForestName = $adForest.Name
- $environmentInfo.EnvironmentDetails.ADForestMode = $adForest.ForestMode
- $environmentInfo.EnvironmentDetails.ADDomainCount = ($adForest.Domains | Measure-Object).Count
- $adUsers = Get-ADUser -Filter * -ErrorAction Stop
- $environmentInfo.UserCorrelation.TotalOnPremUsers = ($adUsers | Measure-Object).Count
- $mgContext = Get-MgContext -ErrorAction SilentlyContinue
- $environmentInfo.HasAzureAD = $true
- $environmentInfo.EnvironmentDetails.GraphAPIConnected = $true
- $environmentInfo.EnvironmentDetails.AzureTenantId = $mgContext.TenantId
- $org = Get-MgOrganization -ErrorAction Stop
- $environmentInfo.EnvironmentDetails.AzureTenantName = $org.DisplayName
- $environmentInfo.HasADConnect = $true
- $environmentInfo.ADConnectStatus = "Enabled"
- $environmentInfo.LastSyncTime = $org.OnPremisesLastSyncDateTime
- $domains = Get-MgDomain -ErrorAction Stop
- $environmentInfo.SyncedDomains += $domain.Id
- $environmentInfo.CloudOnlyDomains += $domain.Id
- $cloudUsers = Get-MgUser -All -Property OnPremisesSyncEnabled,UserPrincipalName -ErrorAction Stop
- $environmentInfo.UserCorrelation.TotalCloudUsers = ($cloudUsers | Measure-Object).Count
- $environmentInfo.UserCorrelation.SyncedUsers = ($cloudUsers | Where-Object { $_.OnPremisesSyncEnabled -eq $true } | Measure-Object).Count
- $environmentInfo.UserCorrelation.CloudOnlyUsers = ($cloudUsers | Where-Object { $_.OnPremisesSyncEnabled -ne $true } | Measure-Object).Count
- $adConnectServers = Get-ADComputer -Filter {ServicePrincipalName -like "*ADSync*"} -Properties OperatingSystem,Description -ErrorAction SilentlyContinue
- $environmentInfo.ADConnectServers += [PSCustomObject]@{
- $exoConnection = Get-PSSession | Where-Object { $_.ConfigurationName -eq "Microsoft.Exchange" -and $_.State -eq "Opened" }
- $environmentInfo.EnvironmentDetails.ExchangeOnlineConnected = $true
- $spoConnection = Get-Command Get-SPOSite -ErrorAction SilentlyContinue
- $environmentInfo.EnvironmentDetails.SharePointOnlineConnected = $true
- $teamsConnection = Get-Command Get-Team -ErrorAction SilentlyContinue
- $environmentInfo.EnvironmentDetails.TeamsConnected = $true
- $environmentInfo.Type = "CloudOnly"
- $environmentInfo.UserCorrelation.Method = "CloudOnly"
- $environmentInfo.Type = "HybridSynced"
- $environmentInfo.UserCorrelation.Method = "ADConnect"
- $environmentInfo.UserCorrelation.OnPremOnlyUsers = $environmentInfo.UserCorrelation.TotalOnPremUsers - $environmentInfo.UserCorrelation.SyncedUsers
- $environmentInfo.Type = "HybridDisconnected"
- $environmentInfo.UserCorrelation.Method = "Manual"
- $environmentInfo.Type = "OnPremOnly"
- $environmentInfo.UserCorrelation.Method = "NotApplicable"
- $environmentInfo = Get-EnvironmentType -Configuration $Configuration
- $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
- $outputFile = Join-Path $outputPath "EnvironmentDetection.csv"
- $envData = [PSCustomObject]@{
- $adcOutputFile = Join-Path $outputPath "ADConnectServers.csv"
- $global:MandA.EnvironmentType = $environmentInfo.Type
- $global:MandA.EnvironmentInfo = $environmentInfo


### MODULE: ExchangeDiscovery.psm1  
ðŸ“ Path: `Modules/Discovery/ExchangeDiscovery.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
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
ðŸ“¦ Variables Used:
- $outputPath = $Configuration.environment.outputPath
- $rawPath = Join-Path $outputPath "Raw"
- $discoveryResults = @{}
- $testCmd = Get-Command Get-Mailbox -ErrorAction Stop
- $discoveryResults.Mailboxes = Get-ExchangeMailboxes -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.MailboxStats = Get-ExchangeMailboxStatistics -OutputPath $rawPath -Configuration $Configuration -Mailboxes $discoveryResults.Mailboxes
- $discoveryResults.DistributionGroups = Get-ExchangeDistributionGroups -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.MailSecurityGroups = Get-ExchangeMailSecurityGroups -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.MailboxPermissions = Get-ExchangeMailboxPermissions -OutputPath $rawPath -Configuration $Configuration -Mailboxes $discoveryResults.Mailboxes
- $discoveryResults.SendAsPermissions = Get-ExchangeSendAsPermissions -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.SendOnBehalfPermissions = Get-ExchangeSendOnBehalfPermissions -OutputPath $rawPath -Configuration $Configuration -Mailboxes $discoveryResults.Mailboxes
- $discoveryResults.MailFlowRules = Get-ExchangeMailFlowRules -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.RetentionPolicies = Get-ExchangeRetentionPolicies -OutputPath $rawPath -Configuration $Configuration
- $outputFile = Join-Path $OutputPath "ExchangeMailboxes.csv"
- $mailboxData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $mailboxes = @()
- $resultSize = 1000
- $resultPage = 1
- $results = Get-Mailbox -ResultSize $resultSize -IncludeInactiveMailbox:$($Configuration.exchangeOnline.includeSoftDeletedMailboxes) |
- $mailboxes += $results
- $processedCount = 0
- $outputFile = Join-Path $OutputPath "ExchangeMailboxStatistics.csv"
- $statsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $batchSize = $Configuration.exchangeOnline.mailboxStatsBatchSize
- $batches = [Math]::Ceiling($Mailboxes.Count / $batchSize)
- $startIndex = $i * $batchSize
- $endIndex = [Math]::Min((($i + 1) * $batchSize) - 1, $Mailboxes.Count - 1)
- $batchMailboxes = $Mailboxes[$startIndex..$endIndex]
- $stats = Get-MailboxStatistics -Identity $mailbox.Identity -ErrorAction Stop
- $outputFile = Join-Path $OutputPath "ExchangeDistributionGroups.csv"
- $dgData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $distributionGroups = Get-DistributionGroup -ResultSize Unlimited
- $members = Get-DistributionGroupMember -Identity $dg.Identity -ResultSize Unlimited
- $memberCount = ($members | Measure-Object).Count
- $outputFile = Join-Path $OutputPath "ExchangeMailSecurityGroups.csv"
- $msgData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $mailSecurityGroups = Get-DistributionGroup -RecipientTypeDetails MailUniversalSecurityGroup -ResultSize Unlimited
- $members = Get-DistributionGroupMember -Identity $msg.Identity -ResultSize Unlimited
- $memberCount = ($members | Measure-Object).Count
- $outputFile = Join-Path $OutputPath "ExchangeMailboxPermissions.csv"
- $permData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $processedCount = 0
- $permissions = Get-MailboxPermission -Identity $mailbox.Identity |
- $outputFile = Join-Path $OutputPath "ExchangeSendAsPermissions.csv"
- $sendAsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $sendAsPerms = Get-RecipientPermission -ResultSize Unlimited |
- $outputFile = Join-Path $OutputPath "ExchangeSendOnBehalfPermissions.csv"
- $sobData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $mailboxesWithSOB = $Mailboxes | Where-Object { $_.GrantSendOnBehalfTo }
- $delegates = $mailbox.GrantSendOnBehalfTo -split ";"
- $outputFile = Join-Path $OutputPath "ExchangeMailFlowRules.csv"
- $rulesData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $rules = Get-TransportRule
- $outputFile = Join-Path $OutputPath "ExchangeRetentionPolicies.csv"
- $policyData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $policies = Get-RetentionPolicy
- $tags = Get-RetentionPolicyTag -Policy $policy.Identity


### MODULE: ExternalIdentityDiscovery.psm1  
ðŸ“ Path: `Modules/Discovery/ExternalIdentityDiscovery.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Export-DataToCSV {
- function Import-DataFromCSV {
- function Get-B2BGuestUsersDataInternal {
- function Get-ExternalCollaborationSettingsDataInternal {
- function Get-GuestUserActivityDataInternal {
- function Get-PartnerOrganizationsDataInternal {
- function Get-ExternalIdentityProvidersDataInternal {
- function Get-GuestInvitationsDataInternal {
- function Get-CrossTenantAccessDataInternal {
- function Invoke-ExternalIdentityDiscovery {
ðŸ“¦ Variables Used:
- $fullPath = Join-Path $OutputPath $FileName
- $data = Import-Csv -Path $FilePath -Encoding UTF8 -ErrorAction Stop
- $outputFile = Join-Path $OutputPath "B2BGuestUsers.csv"
- $guestDataList = [System.Collections.Generic.List[PSObject]]::new()
- $propertiesToSelect = @(
- $guestUsers = Get-MgUser -All -Filter "userType eq 'Guest'" -Property $propertiesToSelect -ExpandProperty "signInActivity" -ErrorAction Stop
- $processedCount = 0
- $guestDomain = "Unknown"
- $guestDomain = $guest.Mail.Split('@')[1]
- $guestDomain = $guest.UserPrincipalName.Split('#EXT#@')[1]
- $appRoleAssignmentsCount = 0
- $getAppRolesFlag = $false
- $getAppRolesFlag = $Configuration.discovery.externalIdentity.getGuestAppRoleAssignments -as [bool]
- $appRoleAssignments = Get-MgUserAppRoleAssignment -UserId $guest.Id -All -ErrorAction SilentlyContinue
- $appRoleAssignmentsCount = ($appRoleAssignments | Measure-Object).Count
- $outputFile = Join-Path $OutputPath "ExternalCollaborationSettings.csv"
- $settingsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $policiesModuleAvailable = $null -ne (Get-Module -ListAvailable -Name Microsoft.Graph.Policies)
- $authPolicy = Get-MgPolicyAuthorizationPolicy -ErrorAction Stop
- $collectSPOSettings = $false
- $collectSPOSettings = $Configuration.discovery.externalIdentity.collectSharePointSettings -as [bool]
- $spoTenant = Get-SPOTenant -ErrorAction Stop
- $collectTeamsSettings = $false
- $collectTeamsSettings = $Configuration.discovery.externalIdentity.collectTeamsSettings -as [bool]
- $teamsConfig = Get-CsTenantFederationConfiguration -ErrorAction Stop
- $outputFile = Join-Path $OutputPath "GuestUserActivityAnalysis.csv"
- $activityDataList = [System.Collections.Generic.List[PSObject]]::new()
- $activeGuests = $GuestUsers | Where-Object {
- $inactiveGuests = $GuestUsers | Where-Object {
- $disabledGuests = $GuestUsers | Where-Object { -not $_.AccountEnabled }
- $neverSignedInGuests = $GuestUsers | Where-Object { $_.AccountEnabled -and ($null -eq $_.LastSignInDateTime) }
- $topPartnerDomainsCount = 10
- $topPartnerDomainsCount = [int]$Configuration.discovery.externalIdentity.topPartnerDomainsToAnalyze
- $guestDomains = $GuestUsers | Where-Object { $_.GuestDomain -ne "Unknown" } |
- $domainActiveCount = ($domain.Group | Where-Object {
- $guestsByAge = @{
- $ageDays = ((Get-Date) - [DateTime]$guest.CreatedDateTime).TotalDays
- $outputFile = Join-Path $OutputPath "PartnerOrganizationsAnalysis.csv"
- $partnerDataList = [System.Collections.Generic.List[PSObject]]::new()
- $partnerDomains = $GuestUsers | Where-Object { $null -ne $_.GuestDomain -and $_.GuestDomain -ne "Unknown" } |
- $partnerGuests = $partner.Group
- $activeCount = ($partnerGuests | Where-Object {
- $inactiveCount = ($partnerGuests | Where-Object {
- $disabledCount = ($partnerGuests | Where-Object { -not $_.AccountEnabled }).Count
- $departments = $partnerGuests | Where-Object { $null -ne $_.Department -and $_.Department -ne ""} |
- $jobTitles = $partnerGuests | Where-Object { $null -ne $_.JobTitle -and $_.JobTitle -ne ""} |
- $partnerType = "External Partner"
- $partnerType = "Consumer Email Provider"
- $riskLevel = "Low"
- $riskFactors = @()
- $riskLevel = "Medium"
- $riskFactors += "Consumer email domain"
- $riskLevel = "Medium"
- $riskFactors += "High percentage of inactive users (>75%)"
- $riskFactors += "Single user from this partner organization"
- $outputFile = Join-Path $OutputPath "ExternalIdentityProviders.csv"
- $providerDataList = [System.Collections.Generic.List[PSObject]]::new()
- $identityProviders = $null
- $identityProviders = Get-MgIdentityProvider -All -ErrorAction Stop
- $providerType = "Unknown"
- $providerType = $provider.AdditionalProperties["@odata.type"].Replace("#microsoft.graph.","")
- $outputFile = Join-Path $OutputPath "GuestInvitationsSummary.csv"
- $invitationSummaryList = [System.Collections.Generic.List[PSObject]]::new()
- $invitations = $null
- $invitations = Get-MgInvitation -All -ErrorAction SilentlyContinue
- $recentGuestCount = 100
- $recentGuestCount = [int]$Configuration.discovery.externalIdentity.recentGuestCountForInvitationFallback
- $recentGuestUsers = Get-MgUser -Filter "userType eq 'Guest'" -Top $recentGuestCount `
- $outputFileDefault = Join-Path $OutputPath "CrossTenantAccessPolicy_Defaults.csv"
- $outputFilePartners = Join-Path $OutputPath "CrossTenantAccessPolicy_Partners.csv"
- $defaultAccessDataList = [System.Collections.Generic.List[PSObject]]::new()
- $partnerAccessDataList = [System.Collections.Generic.List[PSObject]]::new()
- $defaults = Import-DataFromCSV -FilePath $outputFileDefault
- $partners = Import-DataFromCSV -FilePath $outputFilePartners
- $policiesModuleAvailable = $null -ne (Get-Module -ListAvailable -Name Microsoft.Graph.Policies)
- $policy = $null
- $policy = Get-MgPolicyCrossTenantAccessPolicy -ErrorAction Stop
- $partners = $null
- $partners = Get-MgPolicyCrossTenantAccessPolicyPartner -CrossTenantAccessPolicyId $policy.Id -All -ErrorAction Stop
- $rawPath = Join-Path $Configuration.environment.outputPath "Raw"
- $discoveryResults = @{}
- $context = Get-MgContext -ErrorAction SilentlyContinue
- $script:ExecutionMetrics.Phase = "External Identity Discovery"
- $b2bGuests = Get-B2BGuestUsersDataInternal -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.B2BGuests = $b2bGuests
- $discoveryResults.CollaborationSettings = Get-ExternalCollaborationSettingsDataInternal `
- $discoveryResults.GuestActivity = Get-GuestUserActivityDataInternal `
- $discoveryResults.PartnerOrganizations = Get-PartnerOrganizationsDataInternal `
- $discoveryResults.IdentityProviders = Get-ExternalIdentityProvidersDataInternal `
- $discoveryResults.GuestInvitations = Get-GuestInvitationsDataInternal `
- $discoveryResults.CrossTenantAccess = Get-CrossTenantAccessDataInternal `


### MODULE: FileServerDiscovery.psm1  
ðŸ“ Path: `Modules/Discovery/FileServerDiscovery.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Invoke-FileServerDiscovery {
- function Get-FileServersDataInternal {
- function Get-FileSharesDataInternal {
- function Get-DFSNamespacesDataInternal {
- function Get-DFSFoldersDataInternal {
- function Get-StorageAnalysisDataInternal {
- function Get-ShadowCopyDataInternal {
- function Get-FileServerClustersDataInternal {
ðŸ“¦ Variables Used:
- $Configuration.discovery.fileServer = @{
- $rawOutputPath = Join-Path $Configuration.environment.outputPath "Raw"
- $discoveryResults = @{
- $fileServerConfig = $Configuration.discovery.fileServer
- $discoveryResults.FileServers = Get-FileServersDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration
- $serverListForShares = if ($discoveryResults.FileServers.Count -gt 0) { $discoveryResults.FileServers } else { Get-FileServersDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration }
- $discoveryResults.FileShares = Get-FileSharesDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration -ServerList $serverListForShares
- $discoveryResults.DFSNamespaces = Get-DFSNamespacesDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration
- $discoveryResults.DFSFolders = Get-DFSFoldersDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration -DfsNamespaces $discoveryResults.DFSNamespaces
- $serverListForStorage = if ($discoveryResults.FileServers.Count -gt 0) { $discoveryResults.FileServers } else { Get-FileServersDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration }
- $discoveryResults.StorageAnalysis = Get-StorageAnalysisDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration -ServerList $serverListForStorage
- $serverListForShadow = if ($discoveryResults.FileServers.Count -gt 0) { $discoveryResults.FileServers } else { Get-FileServersDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration }
- $discoveryResults.ShadowCopies = Get-ShadowCopyDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration -ServerList $serverListForShadow
- $discoveryResults.FileServerClusters = Get-FileServerClustersDataInternal -RawOutputPath $rawOutputPath -Configuration $Configuration
- $outputFileName = "FileServers"
- $fileServerConfig = $Configuration.discovery.fileServer
- $fileServers = [System.Collections.Generic.List[PSCustomObject]]::new()
- $targetServers = @()
- $targetServers = $fileServerConfig.targetServers | ForEach-Object { Get-ADComputer -Identity $_ -Properties OperatingSystem, Description, DNSHostName -ErrorAction SilentlyContinue } | Where-Object {$null -ne $_}
- $targetServers = Get-ADComputer -Filter { OperatingSystem -like "*Server*" -and Enabled -eq $true } -Properties OperatingSystem, Description, DNSHostName -ErrorAction Stop
- $excludedServers = [System.Collections.Generic.HashSet[string]]::new([string[]]$fileServerConfig.excludedServers, [System.StringComparer]::OrdinalIgnoreCase)
- $sessionOption = New-PSSessionOption -OperationTimeout ($fileServerConfig.timeoutPerServerRemoteCommandSeconds * 1000) -ErrorAction SilentlyContinue
- $serverName = $serverADInfo.DNSHostName # Prefer FQDN
- $fileFeatures = $null; $shares = $null; $disks = $null
- $fileFeatures = Invoke-Command -ComputerName $serverName -SessionOption $sessionOption -ScriptBlock {
- $shares = Get-SmbShare -CimSession $serverName -ErrorAction SilentlyContinue |
- $shares = Get-CimInstance -ClassName Win32_Share -ComputerName $serverName -ErrorAction SilentlyContinue |
- $disks = Get-CimInstance -ClassName Win32_LogicalDisk -ComputerName $serverName -Filter "DriveType = 3" -ErrorAction SilentlyContinue
- $totalDiskSpace = if($null -ne $disks){($disks | Measure-Object -Property Size -Sum -ErrorAction SilentlyContinue).Sum}else{0}
- $freeDiskSpace = if($null -ne $disks){($disks | Measure-Object -Property FreeSpace -Sum -ErrorAction SilentlyContinue).Sum}else{0}
- $outputFileName = "FileShares"
- $fileServerConfig = $Configuration.discovery.fileServer
- $fileSharesResult = [System.Collections.Generic.List[PSCustomObject]]::new()
- $collectDetailsLevel = $fileServerConfig.collectShareDetailsLevel
- $sessionOption = New-PSSessionOption -OperationTimeout ($fileServerConfig.timeoutPerServerRemoteCommandSeconds * 1000) -ErrorAction SilentlyContinue
- $aclTimeoutSeconds = $fileServerConfig.timeoutPerShareAclSeconds
- $sizeTimeoutSeconds = $fileServerConfig.timeoutPerShareSizeSeconds
- $totalServers = $ServerList.Count
- $currentServerIdx = 0
- $serverName = $serverEntry.ServerName # Assuming ServerList contains objects with ServerName property
- $shares = @()
- $shares = Get-SmbShare -CimSession $serverName -ErrorAction Stop |
- $shares = Get-CimInstance -ClassName Win32_Share -ComputerName $serverName -ErrorAction Stop |
- $sharePath = $share.Path # Local path on the server
- $uncPath = "\\$serverName\$($share.Name)"
- $shareDetails = @{
- $aclJob = Start-Job -ScriptBlock {
- $shareDetails.ACLs = Receive-Job $aclJob
- $shareDetails.ACLs = "ACL_TIMEOUT"
- $sizeJob = Start-Job -ScriptBlock {
- $fileCount = 0; $folderCount = 0; $sizeBytes = 0; $errorMsg = $null
- $pathDepth = ($RemotePath -split '[\\/]').Count
- $errorMsg = "Path_Depth_Exceeded_Threshold_($PathDepthExceedThreshold)"
- $items = Get-ChildItem -Path $RemotePath -Recurse -Force -Depth $MaxDepth -ErrorAction SilentlyContinue
- $fileItems = $items | Where-Object {-not $_.PSIsContainer}
- $folderItems = $items | Where-Object {$_.PSIsContainer}
- $fileCount = $fileItems.Count
- $folderCount = $folderItems.Count
- $sizeBytes = ($fileItems | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
- $folderInfo = Receive-Job $sizeJob
- $shareDetails.FileCount = $folderInfo.FileCount
- $shareDetails.FolderCount = $folderInfo.FolderCount
- $shareDetails.SizeBytes = $folderInfo.SizeBytes
- $shareDetails.SizeMB = if ($null -ne $folderInfo.SizeBytes) { [math]::Round($folderInfo.SizeBytes / 1MB, 2) } else { 0 }
- $shareDetails.SizeCollectionError = "SIZE_CALCULATION_TIMEOUT"
- $outputFileName = "DFSNamespaces"
- $dfsNamespaces = [System.Collections.Generic.List[PSCustomObject]]::new()
- $dfsRoots = Get-DfsnRoot -ErrorAction SilentlyContinue
- $namespaceServers = @()
- $outputFileName = "DFSFolders"
- $dfsFoldersResult = [System.Collections.Generic.List[PSCustomObject]]::new()
- $rootPath = $namespaceInfo.NamespacePath
- $folders = Get-DfsnFolder -Path "$rootPath\*" -Recurse -ErrorAction SilentlyContinue # Added -Recurse
- $targets = @()
- $outputFileName = "StorageAnalysis"
- $storageAnalysis = [System.Collections.Generic.List[PSCustomObject]]::new()
- $fileServerConfig = $Configuration.discovery.fileServer
- $serverName = $serverEntry.ServerName
- $disks = Get-CimInstance -ClassName Win32_LogicalDisk -ComputerName $serverName -Filter "DriveType = 3" -ErrorAction Stop
- $volume = Get-CimInstance -ClassName Win32_Volume -ComputerName $serverName -Filter "DriveLetter = '$($disk.DeviceID)'" -ErrorAction SilentlyContinue
- $outputFileName = "ShadowCopies"
- $shadowCopiesResult = [System.Collections.Generic.List[PSCustomObject]]::new()
- $serverName = $serverEntry.ServerName
- $shadows = Get-CimInstance -ClassName Win32_ShadowCopy -ComputerName $serverName -ErrorAction Stop
- $shadowStorage = Get-CimInstance -ClassName Win32_ShadowStorage -ComputerName $serverName -Filter "Volume='$($shadow.VolumeName)'" -ErrorAction SilentlyContinue
- $outputFileName = "FileServerClusters"
- $fsClustersResult = [System.Collections.Generic.List[PSCustomObject]]::new()
- $clusterADObjects = Get-ADComputer -Filter { ServicePrincipalName -like "*MSClusterVirtualServer*" } -Properties * -ErrorAction SilentlyContinue
- $clusterADObjects = Get-ADObject -LDAPFilter "(&(objectClass=msCluster-VirtualServer)(servicePrincipalName=MSClusterVirtualServer/*))" -Properties * -ErrorAction SilentlyContinue
- $clusterName = $adClusterObj.Name -replace '\$$', '' # Remove trailing $ if present
- $clusterInfo = Get-Cluster -Name $clusterName -ErrorAction Stop
- $clusterNodes = Get-ClusterNode -Cluster $clusterInfo -ErrorAction SilentlyContinue
- $fileServerResources = Get-ClusterResource -Cluster $clusterInfo -ErrorAction SilentlyContinue |


### MODULE: GPODiscovery.psm1  
ðŸ“ Path: `Modules/Discovery/GPODiscovery.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Export-DataToCSV {
- function Get-GPOData {
- function Get-GPOLinks {
- function Get-GPOPermissions {
- function Parse-GPOReport {
- function Export-GPODataToCSV {
- function Invoke-GPODiscovery {
ðŸ“¦ Variables Used:
- $allGPOs = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allDriveMappings = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allPrinterMappings = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allFolderRedirections = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allLogonScripts = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allGPOLinks = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allGPOPermissions = [System.Collections.Generic.List[PSCustomObject]]::new()
- $gpoReportsPath = Join-Path $OutputPath "GPOReports"
- $gpoParams = @{
- $gpoParams.Server = $DomainController
- $gpos = Get-GPO @gpoParams
- $processedCount = 0
- $successfullyProcessed = 0
- $failedProcessing = 0
- $gpoObject = [PSCustomObject]@{
- $gpoLinks = Get-GPOLinks -GPO $gpo -DomainController $DomainController
- $gpoPermissions = Get-GPOPermissions -GPO $gpo
- $reportPath = Join-Path $gpoReportsPath "$($gpo.Id)_$($gpo.DisplayName -replace '[\\/:*?"<>|]', '_').xml"
- $gpoSettings = Parse-GPOReport -ReportPath $reportPath -GPO $gpo
- $links = [System.Collections.Generic.List[PSCustomObject]]::new()
- $domain = Get-ADDomain -Server $DomainController -ErrorAction Stop
- $searcher = [ADSISearcher]"(&(objectClass=organizationalUnit)(gPLink=*$($GPO.Id)*))"
- $searcher.SearchRoot = [ADSI]"LDAP://$($domain.DistinguishedName)"
- $searcher.PageSize = 1000
- $results = $searcher.FindAll()
- $ou = $result.Properties
- $domainObj = Get-ADObject -Identity $domain.DistinguishedName -Properties gPLink -Server $DomainController
- $permissions = [System.Collections.Generic.List[PSCustomObject]]::new()
- $gpoSecurity = $GPO.GetSecurityInfo()
- $result = @{
- $driveMappings = $xmlReport.GPO.User.ExtensionData.Extension |
- $printerMappings = $xmlReport.GPO.User.ExtensionData.Extension |
- $folderRedirections = $xmlReport.GPO.User.ExtensionData.Extension |
- $scripts = $xmlReport.GPO.User.ExtensionData.Extension |
- $gpoOutputFile = Join-Path $OutputPath "GroupPolicies.csv"
- $linksOutputFile = Join-Path $OutputPath "GroupPolicyLinks.csv"
- $permsOutputFile = Join-Path $OutputPath "GroupPolicyPermissions.csv"
- $driveOutputFile = Join-Path $OutputPath "GPODriveMappings.csv"
- $printerOutputFile = Join-Path $OutputPath "GPOPrinterMappings.csv"
- $folderOutputFile = Join-Path $OutputPath "GPOFolderRedirections.csv"
- $scriptOutputFile = Join-Path $OutputPath "GPOLogonScripts.csv"
- $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
- $domainController = $Configuration.environment.domainController
- $domainController = (Get-ADDomainController -Discover -NextClosestSite).HostName
- $gpoData = Get-GPOData -OutputPath $outputPath -DomainController $domainController


### MODULE: GraphDiscovery.psm1  
ðŸ“ Path: `Modules/Discovery/GraphDiscovery.psm1`  
ðŸ”§ Purpose: No synopsis found.  
ðŸ“Œ Declared Functions:
- function Get-GraphUsersDataInternal {
- function Get-GraphGroupsDataInternal {
- function Invoke-GraphDiscovery {
ðŸ“¦ Variables Used:
- $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
- $allGraphUsers = [System.Collections.Generic.List[PSObject]]::new()
- $selectFields = $Configuration.graphAPI.selectFields.users
- $selectFields = @("id", "userPrincipalName", "displayName", "mail", "accountEnabled", "createdDateTime", "lastSignInDateTime", "department", "jobTitle", "companyName", "onPremisesSyncEnabled", "assignedLicenses", "memberOf")
- $graphUsers = Get-MgUser -Select $selectFields -All -ConsistencyLevel eventual -ErrorAction SilentlyContinue
- $userProps = @{}
- $userProps[$field] = $user.PSObject.Properties[$field].Value
- $userProps[$field] = $null
- $userProps["assignedLicenses"] = ($user.AssignedLicenses | ForEach-Object { $_.SkuId }) -join ";"
- $userProps["memberOf_Count"] = ($user.MemberOf | Measure-Object).Count
- $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
- $allGraphGroups = [System.Collections.Generic.List[PSObject]]::new()
- $allGraphGroupMembers = [System.Collections.Generic.List[PSObject]]::new()
- $selectFields = $Configuration.graphAPI.selectFields.groups
- $selectFields = @("id", "displayName", "mailEnabled", "securityEnabled", "groupTypes", "description", "visibility", "createdDateTime")
- $graphGroups = Get-MgGroup -Select $selectFields -All -ConsistencyLevel eventual -ErrorAction SilentlyContinue
- $groupProps = @{}
- $getGroupMembersFlag = $false
- $getGroupMembersFlag = [System.Convert]::ToBoolean($Configuration.discovery.graph.getGroupMembers)
- $members = Get-MgGroupMember -GroupId $group.Id -All -ErrorAction SilentlyContinue
- $overallStatus = $true; $discoveredData = @{}
- $discoveredData.Users = Get-GraphUsersDataInternal -Configuration $Configuration
- $discoveredData.GroupsAndMembers = Get-GraphGroupsDataInternal -Configuration $Configuration


### MODULE: IntuneDiscovery.psm1  
ðŸ“ Path: `Modules/Discovery/IntuneDiscovery.psm1`  
ðŸ”§ Purpose: No synopsis found.  
ðŸ“Œ Declared Functions:
- function Get-IntuneManagedDevicesInternal {
- function Get-IntuneDeviceSoftwareInternal {
- function Get-IntuneDeviceConfigurationsInternal {
- function Get-IntuneDeviceCompliancePoliciesInternal {
- function Get-IntuneManagedAppsInternal {
- function Invoke-IntuneDiscovery {
ðŸ“¦ Variables Used:
- $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
- $allManagedDevices = [System.Collections.Generic.List[PSObject]]::new()
- $selectFields = $Configuration.discovery.intune.selectFields.managedDevices
- $selectFields = @("id", "deviceName", "userPrincipalName", "managedDeviceOwnerType", "operatingSystem", "osVersion", "complianceState", "lastSyncDateTime", "enrolledDateTime", "model", "manufacturer", "serialNumber", "userId", "azureADDeviceId", "managementAgent")
- $devices = Get-MgDeviceManagementManagedDevice -Select $selectFields -All -ErrorAction SilentlyContinue
- $deviceProps = @{}
- $outputPath = Join-Path $Configuration.environment.outputPath "Raw"
- $allDeviceSoftware = [System.Collections.Generic.List[PSObject]]::new()
- $totalDevices = $ManagedDevices.Count
- $currentDeviceNum = 0
- $detectedApps = Get-MgDeviceManagementManagedDeviceDetectedApp -ManagedDeviceId $device.Id -All -ErrorAction SilentlyContinue
- $overallStatus = $true
- $discoveredData = @{}
- $script:ExecutionMetrics.Phase = "Intune Discovery"
- $managedDevices = Get-IntuneManagedDevicesInternal -Configuration $Configuration
- $discoveredData.ManagedDevices = $managedDevices
- $collectSoftwareFlag = $true # Default to true
- $discoveredData.DeviceSoftware = Get-IntuneDeviceSoftwareInternal -ManagedDevices $managedDevices -Configuration $Configuration
- $discoveredData.DeviceConfigurations = Get-IntuneDeviceConfigurationsInternal -Configuration $Configuration
- $discoveredData.DeviceCompliancePolicies = Get-IntuneDeviceCompliancePoliciesInternal -Configuration $Configuration
- $discoveredData.ManagedApps = Get-IntuneManagedAppsInternal -Configuration $Configuration
- $overallStatus = $false


### MODULE: LicensingDiscovery.psm1  
ðŸ“ Path: `Modules/Discovery/LicensingDiscovery.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
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
ðŸ“¦ Variables Used:
- $outputPath = $Configuration.environment.outputPath
- $rawPath = Join-Path $outputPath "Raw"
- $discoveryResults = @{}
- $context = Get-MgContext -ErrorAction SilentlyContinue
- $discoveryResults.LicenseSKUs = Get-LicenseSKUsData -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.UserLicenses = Get-UserLicenseAssignmentsData -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.LicenseUsage = Get-LicenseUsageAnalysisData -OutputPath $rawPath -Configuration $Configuration -SKUs $discoveryResults.LicenseSKUs
- $discoveryResults.ServicePlanUsage = Get-ServicePlanUsageData -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.LicenseCosts = Get-LicenseCostAnalysisData -OutputPath $rawPath -Configuration $Configuration -SKUs $discoveryResults.LicenseSKUs
- $discoveryResults.LicenseCompliance = Get-LicenseComplianceData -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.GroupLicensing = Get-GroupBasedLicensingData -OutputPath $rawPath -Configuration $Configuration
- $outputFile = Join-Path $OutputPath "LicenseSKUs.csv"
- $skuData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $subscribedSkus = Get-MgSubscribedSku -All
- $totalLicenses = $sku.PrepaidUnits.Enabled + $sku.PrepaidUnits.Warning + $sku.PrepaidUnits.Suspended
- $usagePercentage = if ($totalLicenses -gt 0) {
- $servicePlans = $sku.ServicePlans | ForEach-Object {
- $outputFile = Join-Path $OutputPath "UserLicenseAssignments.csv"
- $licenseData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allUsers = Get-MgUser -All -Property Id,UserPrincipalName,DisplayName,Department,UsageLocation,AccountEnabled,AssignedLicenses,CreatedDateTime -ErrorAction Stop
- $licensedUsers = $allUsers | Where-Object { $_.AssignedLicenses -and $_.AssignedLicenses.Count -gt 0 }
- $licensedUserCount = ($licensedUsers | Measure-Object).Count
- $processedCount = 0
- $sku = Get-MgSubscribedSku | Where-Object { $_.SkuId -eq $license.SkuId }
- $disabledPlans = @()
- $disabledPlans = $sku.ServicePlans | Where-Object { $_.ServicePlanId -in $license.DisabledPlans } |
- $outputFile = Join-Path $OutputPath "LicenseUsageAnalysis.csv"
- $usageData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $analysis = @{
- $analysis.Status = "FullyUtilized"
- $analysis.Recommendation = "Consider purchasing additional licenses"
- $analysis.RiskLevel = "High"
- $analysis.Status = "NearCapacity"
- $analysis.Recommendation = "Monitor usage closely, may need additional licenses soon"
- $analysis.RiskLevel = "Medium"
- $analysis.Status = "Underutilized"
- $unusedLicenses = $sku.AvailableLicenses
- $analysis.Recommendation = "Consider reducing licenses by $unusedLicenses"
- $analysis.PotentialSavings = Get-EstimatedLicenseCost -SkuPartNumber $sku.SkuPartNumber -Count $unusedLicenses
- $analysis.RiskLevel = "Low"
- $analysis.Status = "HasWarnings"
- $analysis.Recommendation = "Address $($sku.WarningLicenses) licenses in warning state"
- $analysis.RiskLevel = "High"
- $analysis.Status = "HasSuspensions"
- $analysis.Recommendation = "Resolve $($sku.SuspendedLicenses) suspended licenses"
- $analysis.RiskLevel = "Critical"
- $outputFile = Join-Path $OutputPath "ServicePlanUsage.csv"
- $servicePlanData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allSkus = Get-MgSubscribedSku -All
- $servicePlanUsage = @{}
- $planKey = $servicePlan.ServicePlanId
- $servicePlanUsage[$planKey] = @{
- $servicePlanUsage[$planKey].TotalAvailable += $sku.ConsumedUnits
- $servicePlanUsage[$planKey].IncludedInSKUs += $sku.SkuPartNumber
- $sampleUsers = Get-MgUser -Top 100 -Property Id,AssignedLicenses -ErrorAction Stop
- $sampleLicensedUsers = $sampleUsers | Where-Object { $_.AssignedLicenses -and $_.AssignedLicenses.Count -gt 0 }
- $sku = $allSkus | Where-Object { $_.SkuId -eq $license.SkuId }
- $utilizationRate = if ($planUsage.TotalAvailable -gt 0) {
- $outputFile = Join-Path $OutputPath "LicenseCostAnalysis.csv"
- $costData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $totalMonthlyCost = 0
- $totalAnnualCost = 0
- $totalUnusedCost = 0
- $estimatedMonthlyPrice = Get-EstimatedLicensePrice -SkuPartNumber $sku.SkuPartNumber
- $monthlyCost = $estimatedMonthlyPrice * $sku.ConsumedLicenses
- $annualCost = $monthlyCost * 12
- $unusedMonthlyCost = $estimatedMonthlyPrice * $sku.AvailableLicenses
- $unusedAnnualCost = $unusedMonthlyCost * 12
- $totalMonthlyCost += $monthlyCost
- $totalAnnualCost += $annualCost
- $totalUnusedCost += $unusedAnnualCost
- $outputFile = Join-Path $OutputPath "LicenseCompliance.csv"
- $complianceData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allUsers = Get-MgUser -All -Property Id,UserPrincipalName,AssignedLicenses,AccountEnabled,UsageLocation -ErrorAction Stop
- $unlicensedActiveUsers = $allUsers | Where-Object {
- $unlicensedCount = ($unlicensedActiveUsers | Measure-Object).Count
- $usersWithoutLocation = $allUsers | Where-Object {
- $noLocationCount = ($usersWithoutLocation | Measure-Object).Count
- $allUserLicenses = $allUsers | Where-Object { $_.AssignedLicenses -and $_.AssignedLicenses.Count -gt 0 }
- $complianceChecks = @(
- $e3SkuId = "05e9a617-0261-4cee-bb44-138d3ef5d965"
- $e5SkuId = "06ebc4ee-1bb5-47dd-8120-11324bc54e06"
- $businessStandardSkuId = "6fd2c87f-b296-42f0-b197-1e91e994b900"
- $businessPremiumSkuId = "cbdc14ab-d96c-4c30-b9f4-6ada7cdc1d46"
- $e3e5Users = $allUserLicenses | Where-Object {
- $licenses = $_.AssignedLicenses | ForEach-Object { $_.SkuId }
- $duplicateLicenseCount = ($e3e5Users | Measure-Object).Count
- $complianceChecks += @{
- $sampleUnlicensed = $unlicensedActiveUsers | Select-Object -First 10
- $outputFile = Join-Path $OutputPath "GroupBasedLicensing.csv"
- $groupLicenseData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $allGroups = Get-MgGroup -All -Property Id,DisplayName,GroupTypes,MailEnabled,SecurityEnabled,AssignedLicenses,CreatedDateTime -ErrorAction Stop
- $groupsWithLicenses = $allGroups | Where-Object { $_.AssignedLicenses -and $_.AssignedLicenses.Count -gt 0 }
- $members = Get-MgGroupMember -GroupId $group.Id -All -ErrorAction Stop
- $memberCount = ($members | Measure-Object).Count
- $memberCount = 0
- $sku = Get-MgSubscribedSku | Where-Object { $_.SkuId -eq $license.SkuId }
- $licenseNames = @{
- $servicePlanNames = @{
- $prices = @{
- $monthlyPrice = Get-EstimatedLicensePrice -SkuPartNumber $SkuPartNumber
- $data = Import-Csv -Path $FilePath -Encoding UTF8


### MODULE: NetworkInfrastructureDiscovery.psm1  
ðŸ“ Path: `Modules/Discovery/NetworkInfrastructureDiscovery.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
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
ðŸ“¦ Variables Used:
- $outputPath = $Configuration.environment.outputPath
- $discoveryResults = @{}
- $discoveryResults.DHCPServers = Get-DHCPServersData -OutputPath $outputPath -Configuration $Configuration
- $discoveryResults.DHCPScopes = Get-DHCPScopesData -OutputPath $outputPath -Configuration $Configuration
- $discoveryResults.DHCPReservations = Get-DHCPReservationsData -OutputPath $outputPath -Configuration $Configuration
- $discoveryResults.DHCPOptions = Get-DHCPOptionsData -OutputPath $outputPath -Configuration $Configuration
- $discoveryResults.DNSServers = Get-DNSServersData -OutputPath $outputPath -Configuration $Configuration
- $discoveryResults.DNSZones = Get-DNSZonesData -OutputPath $outputPath -Configuration $Configuration
- $discoveryResults.DNSRecords = Get-DNSRecordsData -OutputPath $outputPath -Configuration $Configuration
- $discoveryResults.Subnets = Get-ADSubnetsData -OutputPath $outputPath -Configuration $Configuration
- $discoveryResults.Sites = Get-ADSitesData -OutputPath $outputPath -Configuration $Configuration
- $outputFile = Join-Path $OutputPath "DHCPServers.csv"
- $dhcpServers = [System.Collections.Generic.List[PSCustomObject]]::new()
- $domain = [System.DirectoryServices.ActiveDirectory.Domain]::GetCurrentDomain()
- $forest = $domain.Forest
- $dhcpServerList = Get-DhcpServerInDC -ErrorAction Stop
- $serverStats = Get-DhcpServerv4Statistics -ComputerName $server.DnsName -ErrorAction Stop
- $serverVersion = Get-DhcpServerVersion -ComputerName $server.DnsName -ErrorAction Stop
- $headers = [PSCustomObject]@{
- $outputFile = Join-Path $OutputPath "DHCPScopes.csv"
- $dhcpScopes = [System.Collections.Generic.List[PSCustomObject]]::new()
- $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
- $scopes = Get-DhcpServerv4Scope -ComputerName $server.DnsName -ErrorAction Stop
- $scopeStats = Get-DhcpServerv4ScopeStatistics -ComputerName $server.DnsName -ScopeId $scope.ScopeId -ErrorAction SilentlyContinue
- $headers = [PSCustomObject]@{
- $outputFile = Join-Path $OutputPath "DHCPReservations.csv"
- $dhcpReservations = [System.Collections.Generic.List[PSCustomObject]]::new()
- $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
- $scopes = Get-DhcpServerv4Scope -ComputerName $server.DnsName -ErrorAction Stop
- $reservations = Get-DhcpServerv4Reservation -ComputerName $server.DnsName -ScopeId $scope.ScopeId -ErrorAction Stop
- $headers = [PSCustomObject]@{
- $outputFile = Join-Path $OutputPath "DHCPOptions.csv"
- $dhcpOptions = [System.Collections.Generic.List[PSCustomObject]]::new()
- $dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
- $serverOptions = Get-DhcpServerv4OptionValue -ComputerName $server.DnsName -All -ErrorAction Stop
- $scopes = Get-DhcpServerv4Scope -ComputerName $server.DnsName -ErrorAction Stop
- $scopeOptions = Get-DhcpServerv4OptionValue -ComputerName $server.DnsName -ScopeId $scope.ScopeId -All -ErrorAction Stop
- $headers = [PSCustomObject]@{
- $outputFile = Join-Path $OutputPath "DNSServers.csv"
- $dnsServers = [System.Collections.Generic.List[PSCustomObject]]::new()
- $domainControllers = Get-ADDomainController -Filter * -ErrorAction Stop
- $dnsService = Get-Service -ComputerName $dc.HostName -Name "DNS" -ErrorAction Stop
- $dnsServerConfig = Get-DnsServer -ComputerName $dc.HostName -ErrorAction Stop
- $headers = [PSCustomObject]@{
- $outputFile = Join-Path $OutputPath "DNSZones.csv"
- $dnsZones = [System.Collections.Generic.List[PSCustomObject]]::new()
- $primaryDC = Get-ADDomainController -Discover -Service "PrimaryDC" -ErrorAction SilentlyContinue
- $dnsServer = if ($primaryDC) { $primaryDC.HostName } else { $env:COMPUTERNAME }
- $zones = Get-DnsServerZone -ComputerName $dnsServer -ErrorAction Stop
- $headers = [PSCustomObject]@{
- $outputFile = Join-Path $OutputPath "DNSRecords.csv"
- $dnsRecords = [System.Collections.Generic.List[PSCustomObject]]::new()
- $primaryDC = Get-ADDomainController -Discover -Service "PrimaryDC" -ErrorAction SilentlyContinue
- $dnsServer = if ($primaryDC) { $primaryDC.HostName } else { $env:COMPUTERNAME }
- $zones = Get-DnsServerZone -ComputerName $dnsServer -ErrorAction Stop | Where-Object { -not $_.IsReverseLookupZone }
- $importantRecordTypes = @("A", "AAAA", "CNAME", "MX", "SRV", "TXT")
- $records = Get-DnsServerResourceRecord -ComputerName $dnsServer -ZoneName $zone.ZoneName -ErrorAction Stop |
- $processedCount = 0
- $recordData = switch ($record.RecordType) {
- $headers = [PSCustomObject]@{
- $outputFile = Join-Path $OutputPath "ADSubnets.csv"
- $subnets = [System.Collections.Generic.List[PSCustomObject]]::new()
- $configNC = ([ADSI]"LDAP://RootDSE").configurationNamingContext
- $subnetContainer = [ADSI]"LDAP://CN=Subnets,CN=Sites,$configNC"
- $searcher = New-Object System.DirectoryServices.DirectorySearcher($subnetContainer)
- $searcher.Filter = "(objectClass=subnet)"
- $results = $searcher.FindAll()
- $subnet = $result.Properties
- $siteDN = $subnet["siteobject"][0]
- $siteName = if ($siteDN) {
- $headers = [PSCustomObject]@{
- $outputFile = Join-Path $OutputPath "ADSites.csv"
- $sites = [System.Collections.Generic.List[PSCustomObject]]::new()
- $adSites = Get-ADReplicationSite -Filter * -Properties * -ErrorAction Stop
- $subnetCount = (Get-ADReplicationSubnet -Filter "Site -eq '$($site.DistinguishedName)'" -ErrorAction SilentlyContinue | Measure-Object).Count
- $siteLinks = Get-ADReplicationSiteLink -Filter * -ErrorAction SilentlyContinue |
- $siteDCs = Get-ADDomainController -Filter "Site -eq '$($site.Name)'" -ErrorAction SilentlyContinue
- $headers = [PSCustomObject]@{


### MODULE: SQLServerDiscoveryNoUse.psm1  
ðŸ“ Path: `Modules/Discovery/SQLServerDiscoveryNoUse.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Invoke-SQLServerDiscovery {
- function Get-SQLServerInstances {
- function Get-SQLInstancesFromSPN {
- function Get-SQLInstancesFromPortScan {
- function Get-SQLInstancesFromRegistry {
- function Get-SQLInstanceDetails {
- function Get-SQLDatabases {
- function Get-LastBackupDate {
- function Get-DatabaseOwner {
- function Get-SQLAgentJobs {
- function Get-ScheduleDescription {
- function Get-JobLastRunDate {
- function Get-JobLastRunStatus {
- function Get-SQLLogins {
- function Get-LoginServerRoles {
- function Get-LoginDatabaseAccess {
- function Get-SQLLinkedServers {
- function Get-LinkedServerLogins {
- function Get-SQLMaintenancePlans {
- function Get-MaintenanceSubPlans {
- function Get-SQLServerConfigurations {
- function Export-DataToCSV {
- function Import-DataFromCSV {
ðŸ“¦ Variables Used:
- $outputPath = $Configuration.environment.outputPath
- $discoveryResults = @{}
- $discoveryResults.Instances = Get-SQLServerInstances -OutputPath $outputPath -Configuration $Configuration
- $discoveryResults.Databases = Get-SQLDatabases -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
- $discoveryResults.AgentJobs = Get-SQLAgentJobs -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
- $discoveryResults.Logins = Get-SQLLogins -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
- $discoveryResults.LinkedServers = Get-SQLLinkedServers -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
- $discoveryResults.MaintenancePlans = Get-SQLMaintenancePlans -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
- $discoveryResults.Configurations = Get-SQLServerConfigurations -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
- $outputFile = Join-Path $OutputPath "SQLInstances.csv"
- $instancesData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $spnInstances = Get-SQLInstancesFromSPN -Configuration $Configuration
- $portInstances = Get-SQLInstancesFromPortScan -Configuration $Configuration
- $registryInstances = Get-SQLInstancesFromRegistry -Configuration $Configuration
- $allInstances = @()
- $allInstances += $spnInstances
- $allInstances += $portInstances
- $allInstances += $registryInstances
- $uniqueInstances = $allInstances | Sort-Object ServerName, InstanceName -Unique
- $processedCount = 0
- $instanceDetails = Get-SQLInstanceDetails -Instance $instance
- $headers = [PSCustomObject]@{
- $instances = @()
- $spnFilter = "(servicePrincipalName=MSSQLSvc/*)"
- $computers = Get-ADComputer -LDAPFilter $spnFilter -Properties servicePrincipalName -ErrorAction Stop
- $serverName = $matches[1].Split('.')[0]  # Get just the hostname
- $port = if ($matches[2]) { $matches[2] } else { "1433" }
- $instanceName = if ($port -eq "1433") { "MSSQLSERVER" } else { "UNKNOWN" }
- $instances += [PSCustomObject]@{
- $users = Get-ADUser -LDAPFilter $spnFilter -Properties servicePrincipalName -ErrorAction Stop
- $serverName = $matches[1].Split('.')[0]
- $port = if ($matches[2]) { $matches[2] } else { "1433" }
- $instanceName = if ($port -eq "1433") { "MSSQLSERVER" } else { "UNKNOWN" }
- $instances += [PSCustomObject]@{
- $instances = @()
- $servers = Get-ADComputer -Filter {OperatingSystem -like "*Server*"} -Properties DNSHostName -ErrorAction SilentlyContinue |
- $portsToCheck = @(1433, 1434)  # Default SQL ports
- $result = Test-NetConnection -ComputerName $server.DNSHostName -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
- $instanceName = if ($port -eq 1433) { "MSSQLSERVER" } else { "UNKNOWN" }
- $instances += [PSCustomObject]@{
- $instances = @()
- $regPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL"
- $instanceKeys = Get-ItemProperty $regPath -ErrorAction SilentlyContinue
- $instances += [PSCustomObject]@{
- $details = @{
- $connectionString = if ($Instance.InstanceName -eq "MSSQLSERVER") {
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $versionQuery = "SELECT
- $command = New-Object System.Data.SqlClient.SqlCommand($versionQuery, $connection)
- $reader = $command.ExecuteReader()
- $details.Version = $reader["Version"]
- $details.Edition = $reader["Edition"]
- $details.ProductLevel = $reader["ProductLevel"]
- $details.Collation = $reader["Collation"]
- $details.IsClustered = [bool]$reader["IsClustered"]
- $details.IsAlwaysOn = [bool]$reader["IsAlwaysOn"]
- $resourceQuery = "SELECT
- $command = New-Object System.Data.SqlClient.SqlCommand($resourceQuery, $connection)
- $reader = $command.ExecuteReader()
- $details.MaxMemoryMB = $reader["MaxMemory"]
- $details.CPUCount = $reader["CPUCount"]
- $serviceName = if ($Instance.InstanceName -eq "MSSQLSERVER") {
- $service = Get-WmiObject -ComputerName $Instance.ServerName -Class Win32_Service -Filter "Name='$serviceName'" -ErrorAction SilentlyContinue
- $details.Status = $service.State
- $details.StartupType = $service.StartMode
- $details.ServiceAccount = $service.StartName
- $outputFile = Join-Path $OutputPath "SQLDatabases.csv"
- $databasesData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $instanceName = if ($instance.InstanceName -eq "MSSQLSERVER") {
- $connectionString = "Server=$instanceName;Database=master;Integrated Security=True;Connect Timeout=5"
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $query = "SELECT
- $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
- $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
- $dataset = New-Object System.Data.DataSet
- $headers = [PSCustomObject]@{
- $query = "SELECT MAX(backup_finish_date) AS LastBackup
- $connectionString = "Server=$InstanceName;Database=msdb;Integrated Security=True;Connect Timeout=2"
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
- $result = $command.ExecuteScalar()
- $query = "SELECT SUSER_SNAME(owner_sid) AS Owner FROM sys.databases WHERE name = @DatabaseName"
- $connectionString = "Server=$InstanceName;Database=master;Integrated Security=True;Connect Timeout=2"
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
- $result = $command.ExecuteScalar()
- $outputFile = Join-Path $OutputPath "SQLAgentJobs.csv"
- $jobsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $instanceName = if ($instance.InstanceName -eq "MSSQLSERVER") {
- $connectionString = "Server=$instanceName;Database=msdb;Integrated Security=True;Connect Timeout=5"
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $query = "SELECT
- $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
- $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
- $dataset = New-Object System.Data.DataSet
- $headers = [PSCustomObject]@{
- $freqType = [int]$Row["freq_type"]
- $query = "SELECT MAX(run_date) AS LastRun FROM msdb.dbo.sysjobhistory WHERE job_id = @JobId AND step_id = 0"
- $connectionString = "Server=$InstanceName;Database=msdb;Integrated Security=True;Connect Timeout=2"
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
- $result = $command.ExecuteScalar()
- $query = "SELECT TOP 1 run_status FROM msdb.dbo.sysjobhistory
- $connectionString = "Server=$InstanceName;Database=msdb;Integrated Security=True;Connect Timeout=2"
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
- $result = $command.ExecuteScalar()
- $outputFile = Join-Path $OutputPath "SQLLogins.csv"
- $loginsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $instanceName = if ($instance.InstanceName -eq "MSSQLSERVER") {
- $connectionString = "Server=$instanceName;Database=master;Integrated Security=True;Connect Timeout=5"
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $query = "SELECT
- $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
- $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
- $dataset = New-Object System.Data.DataSet
- $headers = [PSCustomObject]@{
- $query = "SELECT r.name
- $connectionString = "Server=$InstanceName;Database=master;Integrated Security=True;Connect Timeout=2"
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
- $reader = $command.ExecuteReader()
- $roles = @()
- $roles += $reader["name"]
- $query = "SELECT COUNT(DISTINCT database_id) AS DatabaseCount
- $connectionString = "Server=$InstanceName;Database=master;Integrated Security=True;Connect Timeout=2"
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
- $result = $command.ExecuteScalar()
- $outputFile = Join-Path $OutputPath "SQLLinkedServers.csv"
- $linkedServersData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $instanceName = if ($instance.InstanceName -eq "MSSQLSERVER") {
- $connectionString = "Server=$instanceName;Database=master;Integrated Security=True;Connect Timeout=5"
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $query = "SELECT
- $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
- $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
- $dataset = New-Object System.Data.DataSet
- $query = "SELECT COUNT(*) FROM sys.linked_logins WHERE server_id = @ServerId"
- $connectionString = "Server=$InstanceName;Database=master;Integrated Security=True;Connect Timeout=2"
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
- $result = $command.ExecuteScalar()
- $outputFile = Join-Path $OutputPath "SQLMaintenancePlans.csv"
- $maintenancePlansData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $instanceName = if ($instance.InstanceName -eq "MSSQLSERVER") {
- $connectionString = "Server=$instanceName;Database=msdb;Integrated Security=True;Connect Timeout=5"
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $checkQuery = "SELECT COUNT(*) FROM sys.tables WHERE name = 'sysssispackages'"
- $command = New-Object System.Data.SqlClient.SqlCommand($checkQuery, $connection)
- $tableExists = [int]$command.ExecuteScalar() -gt 0
- $query = "SELECT
- $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
- $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
- $dataset = New-Object System.Data.DataSet
- $query = "SELECT COUNT(*) FROM msdb.dbo.sysmaintplan_subplans WHERE plan_id = @PlanId"
- $connectionString = "Server=$InstanceName;Database=msdb;Integrated Security=True;Connect Timeout=2"
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
- $result = $command.ExecuteScalar()
- $outputFile = Join-Path $OutputPath "SQLConfigurations.csv"
- $configurationsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $instanceName = if ($instance.InstanceName -eq "MSSQLSERVER") {
- $connectionString = "Server=$instanceName;Database=master;Integrated Security=True;Connect Timeout=5"
- $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
- $configItems = @(
- $command = New-Object System.Data.SqlClient.SqlCommand($configQuery, $connection)
- $reader = $command.ExecuteReader()
- $headers = [PSCustomObject]@{
- $data = Import-Csv -Path $FilePath -Encoding UTF8


### MODULE: SharePointDiscovery.psm1  
ðŸ“ Path: `Modules/Discovery/SharePointDiscovery.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Invoke-SharePointDiscovery {
- function Get-SharePointSitesData {
- function Get-SharePointHubSitesData {
- function Get-SharePointExternalUsersData {
- function Get-SharePointSharingLinksData {
- function Get-SharePointSitePermissionsData {
- function Get-SharePointStorageMetricsData {
- function Get-SharePointContentTypesData {
- function Get-SPOAdminUrl {
ðŸ“¦ Variables Used:
- $outputPath = $Configuration.environment.outputPath
- $rawPath = Join-Path $outputPath "Raw"
- $discoveryResults = @{}
- $adminUrl = Get-SPOAdminUrl -TenantDomain $Configuration.sharepoint.tenantName
- $discoveryResults.SiteCollections = Get-SharePointSitesData -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.HubSites = Get-SharePointHubSitesData -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.ExternalUsers = Get-SharePointExternalUsersData -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.SharingLinks = Get-SharePointSharingLinksData -OutputPath $rawPath -Configuration $Configuration -Sites $discoveryResults.SiteCollections
- $discoveryResults.SitePermissions = Get-SharePointSitePermissionsData -OutputPath $rawPath -Configuration $Configuration -Sites $discoveryResults.SiteCollections
- $discoveryResults.StorageMetrics = Get-SharePointStorageMetricsData -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.ContentTypes = Get-SharePointContentTypesData -OutputPath $rawPath -Configuration $Configuration -Sites $discoveryResults.SiteCollections
- $outputFile = Join-Path $OutputPath "SharePointSites.csv"
- $sitesData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $includeOneDrive = $Configuration.sharepoint.includeOneDriveSites
- $sites = Get-SPOSite -Limit All -IncludePersonalSite:$includeOneDrive -ErrorAction Stop
- $processedCount = 0
- $siteDetails = Get-SPOSite -Identity $site.Url -Detailed -ErrorAction Stop
- $siteType = "TeamSite"
- $siteType = "OneDrive"
- $siteType = "CommunicationSite"
- $siteType = "Microsoft365Group"
- $siteType = "TeamChannelSite"
- $outputFile = Join-Path $OutputPath "SharePointHubSites.csv"
- $hubSitesData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $hubSites = Get-SPOHubSite -ErrorAction Stop
- $associatedSites = Get-SPOSite -Limit All | Where-Object { $_.HubSiteId -eq $hub.HubSiteId }
- $outputFile = Join-Path $OutputPath "SharePointExternalUsers.csv"
- $externalUsersData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $position = 0
- $pageSize = 50
- $hasMore = $true
- $users = Get-SPOExternalUser -Position $position -PageSize $pageSize -ErrorAction Stop
- $hasMore = $false
- $position += $pageSize
- $outputFile = Join-Path $OutputPath "SharePointSharingLinks.csv"
- $sharingLinksData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $sitesWithExternalSharing = $Sites | Where-Object { $_.ExternalSharingEnabled }
- $outputFile = Join-Path $OutputPath "SharePointSitePermissions.csv"
- $permissionsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $siteSample = $Sites | Select-Object -First 50
- $processedCount = 0
- $siteAdmins = Get-SPOUser -Site $site.Url -Limit All | Where-Object { $_.IsSiteAdmin }
- $outputFile = Join-Path $OutputPath "SharePointStorageMetrics.csv"
- $storageData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $tenant = Get-SPOTenant
- $tenantStorage = @{
- $allSites = Get-SPOSite -Limit All | Sort-Object StorageUsageCurrent -Descending | Select-Object -First 100
- $outputFile = Join-Path $OutputPath "SharePointContentTypes.csv"
- $contentTypesData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $tenantName = $TenantDomain -replace "\.onmicrosoft\.com$", ""
- $tenantName = $TenantDomain


### MODULE: TeamsDiscovery.psm1  
ðŸ“ Path: `Modules/Discovery/TeamsDiscovery.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
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
ðŸ“¦ Variables Used:
- $outputPath = $Configuration.environment.outputPath
- $rawPath = Join-Path $outputPath "Raw"
- $discoveryResults = @{}
- $isConnected = $false
- $testTeams = Get-Team -ErrorAction Stop | Select-Object -First 1
- $isConnected = $true
- $credPath = $Configuration.authentication.credentialStorePath
- $credData = Get-Content $credPath | ConvertFrom-Json
- $securePassword = ConvertTo-SecureString $credData.ClientSecret -AsPlainText -Force
- $credential = New-Object System.Management.Automation.PSCredential($credData.AppId, $securePassword)
- $isConnected = $true
- $isConnected = $true
- $testTeams = Get-Team -ErrorAction Stop | Select-Object -First 1
- $discoveryResults.Teams = Get-TeamsData -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.TeamChannels = Get-TeamChannelsData -OutputPath $rawPath -Configuration $Configuration -Teams $discoveryResults.Teams
- $discoveryResults.TeamMembers = Get-TeamMembersData -OutputPath $rawPath -Configuration $Configuration -Teams $discoveryResults.Teams
- $discoveryResults.TeamApps = Get-TeamAppsData -OutputPath $rawPath -Configuration $Configuration -Teams $discoveryResults.Teams
- $discoveryResults.GuestUsers = Get-TeamsGuestUsersData -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.TeamsPolicies = Get-TeamsPoliciesData -OutputPath $rawPath -Configuration $Configuration
- $discoveryResults.TeamsPhone = Get-TeamsPhoneData -OutputPath $rawPath -Configuration $Configuration
- $outputFile = Join-Path $OutputPath "Teams.csv"
- $teamsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $teams = @()
- $teams = Get-Team -ErrorAction Stop
- $processedCount = 0
- $teamDetails = Get-Team -GroupId $team.GroupId -ErrorAction Stop
- $teamSettings = @{
- $owners = @()
- $members = @()
- $guests = @()
- $owners = @(Get-TeamUser -GroupId $team.GroupId -Role Owner -ErrorAction SilentlyContinue)
- $members = @(Get-TeamUser -GroupId $team.GroupId -Role Member -ErrorAction SilentlyContinue)
- $guests = @(Get-TeamUser -GroupId $team.GroupId -Role Guest -ErrorAction SilentlyContinue)
- $outputFile = Join-Path $OutputPath "TeamChannels.csv"
- $channelsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $processedCount = 0
- $channels = Get-TeamChannel -GroupId $team.GroupId -ErrorAction Stop
- $channelDetails = $null
- $channelDetails = Get-TeamChannel -GroupId $team.GroupId -DisplayName $channel.DisplayName -ErrorAction SilentlyContinue
- $outputFile = Join-Path $OutputPath "TeamMembers.csv"
- $membersData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $processedCount = 0
- $teamUsers = Get-TeamUser -GroupId $team.GroupId -ErrorAction Stop
- $outputFile = Join-Path $OutputPath "TeamApps.csv"
- $appsData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $processedCount = 0
- $teamApps = Get-TeamsApp -TeamId $team.GroupId -ErrorAction Stop
- $outputFile = Join-Path $OutputPath "TeamsGuestUsers.csv"
- $guestData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $graphContext = Get-MgContext -ErrorAction SilentlyContinue
- $guestUsers = @()
- $guestUsers = Get-MgUser -Filter "userType eq 'Guest'" -All -ErrorAction Stop
- $processedCount = 0
- $teamMemberships = @()
- $groupMemberships = Get-MgUserMemberOf -UserId $guest.Id -ErrorAction SilentlyContinue
- $team = Get-Team -GroupId $membership.Id -ErrorAction Stop
- $teamMemberships += $team.DisplayName
- $outputFile = Join-Path $OutputPath "TeamsPolicies.csv"
- $policiesData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $policyTypes = @(
- $policies = & $policyType.Command -ErrorAction Stop
- $policyProperties = @{}
- $policyProperties[$_.Name] = $_.Value
- $outputFile = Join-Path $OutputPath "TeamsPhone.csv"
- $phoneData = [System.Collections.Generic.List[PSCustomObject]]::new()
- $phoneNumbers = Get-CsPhoneNumberAssignment -ErrorAction Stop
- $voiceRoutes = Get-CsOnlineVoiceRoute -ErrorAction Stop
- $data = Import-Csv -Path $FilePath -Encoding UTF8


### MODULE: CSVExport.psm1  
ðŸ“ Path: `Modules/Export/CSVExport.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Export-ToCSV {
- function Get-DataForExport {
ðŸ“¦ Variables Used:
- $processedOutputPath = Join-Path $Configuration.environment.outputPath "Processed" # Standard location for processed outputs
- $exportItems = @(
- $dataToExport = $null
- $expectedFilePath = Join-Path $processedOutputPath $item.FileName
- $mainData = Get-DataForExport -KeyName $item.Key -DirectInputData $ProcessedData -ExpectedFilePath $expectedFilePath # Path here is for the main object
- $dataToExport = $mainData.PSObject.Properties[$item.DataPath].Value
- $dataToExport = Get-DataForExport -KeyName $item.Key -DirectInputData $ProcessedData -ExpectedFilePath $expectedFilePath
- $filePath = Join-Path $processedOutputPath $item.FileName # Output to Processed folder


### MODULE: CompanyControlSheetExporter.psm1  
ðŸ“ Path: `Modules/Export/CompanyControlSheetExporter.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Export-ToCompanyControlSheet {
- function Ensure-DirectoryExistsInternal {
ðŸ“¦ Variables Used:
- $baseSuiteOutputPath = $Configuration.environment.outputPath
- $baseSuiteOutputPath = Join-Path $global:MandASuiteRoot $baseSuiteOutputPath
- $baseSuiteOutputPath = Resolve-Path -Path $baseSuiteOutputPath -ErrorAction SilentlyContinue
- $baseSuiteOutputPath = ".\Output"
- $outputCsvPath = Join-Path $baseSuiteOutputPath "CompanyControlSheetCSVs"
- $userListData = $ProcessedData.UserProfiles | ForEach-Object {
- $ipDetailsData = $ProcessedData.AggregatedDataStore.Devices | Where-Object { $_.IPAddress -or $_.IPv6Address } | ForEach-Object {
- $hardwareData = $ProcessedData.AggregatedDataStore.Devices | ForEach-Object {
- $allSoftware = $ProcessedData.AggregatedDataStore.InstalledSoftware | ForEach-Object {
- $laptopApps = $allSoftware | Where-Object { $_.InstallType -eq 'Laptop' -or ($_.DeviceName -match "LAPTOP" -or $_.DeviceName -match "LT-") } # Example filter
- $vdiApps = $allSoftware | Where-Object { $_.InstallType -eq 'VDI' -or ($_.DeviceName -match "VDI" -or $_.DeviceName -match "CITRIX") } # Example filter
- $serverSpecData = $ProcessedData.AggregatedDataStore.Devices | Where-Object { $_.DeviceType -eq 'Server' -or $_.OperatingSystem -like "*Server*" } | ForEach-Object {
- $serverAppData = $ProcessedData.AggregatedDataStore.ServerApplications | ForEach-Object {
- $serverDataSourceData = $ProcessedData.AggregatedDataStore.ServerDataSources | ForEach-Object {
- $fwRulesData = $ProcessedData.AggregatedDataStore.FirewallRules | ForEach-Object {
- $uatGroupData = $ProcessedData.AggregatedDataStore.Groups | Where-Object {
- $exchangeDiscoveryData = $ProcessedData.AggregatedDataStore.ExchangeMailboxes | ForEach-Object {
- $exchangePermData = $ProcessedData.AggregatedDataStore.ExchangePermissions | ForEach-Object {
- $mobileDeviceData = $ProcessedData.AggregatedDataStore.MobileDevices | Where-Object { $_.ClientType -eq 'ExchangeActiveSync' -or $_.ManagementType -like '*EAS*' -or $_.IsEmailClient } | ForEach-Object {
- $masterGroupData = $ProcessedData.AggregatedDataStore.Groups | ForEach-Object {
- $groupMembershipData = [System.Collections.Generic.List[PSObject]]::new()
- $userPrincipalName = $null
- $memberType = "Unknown"
- $user = $ProcessedData.AggregatedDataStore.Users | Where-Object { $_.Id -eq $member -or $_.AD_ObjectGUID -eq $member } | Select-Object -First 1
- $memberType = "User" # Assumption
- $userPrincipalName = $member.UserPrincipalName
- $memberType = "User"
- $userPrincipalName = "NestedGroup: $($member.DisplayName)" # Indicate nested group
- $memberType = "Group"
- $userPrincipalName = $member.DisplayName
- $memberType = $member.ObjectType # If available
- $vendorData = $ProcessedData.AggregatedDataStore.Users | Where-Object { $_.UserType -eq 'Guest' } | ForEach-Object {


### MODULE: ExcelExport.psm1  
ðŸ“ Path: `Modules/Export/ExcelExport.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Get-ProcessedDataForExcelExport {
- function Export-ToExcel {
ðŸ“¦ Variables Used:
- $expectedFilePath = Join-Path $ProcessedOutputPath $DefaultSourceCsvFileName
- $exportOutputPath = Join-Path $Configuration.environment.outputPath "Exports\Excel"
- $excelFilePath = Join-Path $exportOutputPath "MandA_Discovery_Report_$(Get-Date -Format 'yyyyMMddHHmmss').xlsx"
- $processedDataPath = Join-Path $Configuration.environment.outputPath "Processed"
- $exportParams = @{ Path = $excelFilePath; Show = $false }
- $userProfiles = Get-ProcessedDataForExcelExport -KeyName "UserProfiles" -DirectInputData $ProcessedData -ProcessedOutputPath $processedDataPath -DefaultSourceCsvFileName "UserProfiles.csv"
- $migrationWaves = Get-ProcessedDataForExcelExport -KeyName "MigrationWaves" -DirectInputData $ProcessedData -ProcessedOutputPath $processedDataPath -DefaultSourceCsvFileName "MigrationWaves.csv"
- $migrationWavesForExcel = $migrationWaves | Select-Object WaveName, WaveID, TotalUsers, UserPrincipalNames, Criteria, AverageComplexity


### MODULE: JSONExport.psm1  
ðŸ“ Path: `Modules/Export/JSONExport.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Get-ProcessedDataForJSONExport {
- function Export-ToJSON {
ðŸ“¦ Variables Used:
- $expectedFilePath = Join-Path $ProcessedOutputPath $DefaultFileName
- $exportOutputPath = Join-Path $Configuration.environment.outputPath "Exports\JSON" # Specific subfolder for JSON exports
- $exportItems = @(
- $processedDataPath = Join-Path $Configuration.environment.outputPath "Processed"
- $jsonExportDepth = 5 # Default depth
- $jsonExportDepth = [int]$Configuration.export.jsonExportDepth
- $dataToExport = $null
- $dataToExport = Get-ProcessedDataForJSONExport -KeyName $item.Key -DirectInputData $ProcessedData -ProcessedOutputPath $processedDataPath -DefaultFileName $item.SourceCsv
- $dataToExport = $ProcessedData[$item.Key]
- $canExport = $false
- $canExport = $true
- $filePath = Join-Path $exportOutputPath $item.OutputFileName
- $userProfilesForPowerApps = Get-ProcessedDataForJSONExport -KeyName "UserProfiles" -DirectInputData $ProcessedData -ProcessedOutputPath $processedDataPath -DefaultFileName "UserProfiles.csv"
- $powerAppsData = $userProfilesForPowerApps | Select-Object UserPrincipalName, DisplayName, Department, MigrationCategory, ComplexityScore # Example subset
- $filePath = Join-Path $exportOutputPath "PowerApps_UserProfiles.json"
- $powerAppsJsonDepth = 3


### MODULE: PowerAppsExporter.psm1  
ðŸ“ Path: `Modules/Export/PowerAppsExporter.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Get-ProcessedDataFileFromInput {
- function Export-DataObjectToJson {
- function Export-ForPowerApps {
ðŸ“¦ Variables Used:
- $data = $ProcessedData[$KeyName]
- $baseOutputPath = $Configuration.environment.outputPath
- $baseOutputPath = $global:MandA.Paths.CompanyProfileRoot
- $powerAppsOutputPath = Join-Path -Path $baseOutputPath -ChildPath "Processed\PowerApps"
- $jsonDepth = if ($Configuration.export.powerAppsJsonDepth) { [int]$Configuration.export.powerAppsJsonDepth } else { 7 }
- $exportTimestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
- $metadata = @{
- $UserProfiles           = Get-ProcessedDataFileFromInput -KeyName "UserProfiles" -ProcessedData $ProcessedData
- $MigrationWaves         = Get-ProcessedDataFileFromInput -KeyName "MigrationWaves" -ProcessedData $ProcessedData
- $Applications           = Get-ProcessedDataFileFromInput -KeyName "Applications" -ProcessedData $ProcessedData
- $Groups                 = Get-ProcessedDataFileFromInput -KeyName "Groups" -ProcessedData $ProcessedData
- $Devices                = Get-ProcessedDataFileFromInput -KeyName "Devices" -ProcessedData $ProcessedData
- $companiesData = @()
- $profilesBasePath = $Configuration.environment.profilesBasePath
- $profilesBasePath = Split-Path $global:MandA.Paths.CompanyProfileRoot -Parent
- $dir = $_
- $companyNameFromDir = $dir.Name
- $currentCompanyStats = @{
- $currentCompanyStats.TotalUsers = $UserProfiles.Count
- $currentCompanyStats.TotalWaves = $MigrationWaves.Count
- $currentCompanyStats.TotalDepartments = ($UserProfiles | Where-Object { $_.PSObject.Properties['Department'] -and $_.Department } | Select-Object -ExpandProperty Department -Unique).Count
- $currentCompanyStats.AverageComplexity = [math]::Round(($UserProfiles | Measure-Object -Property ComplexityScore -Average).Average, 2)
- $readyUsersCount = ($UserProfiles | Where-Object { $_.PSObject.Properties['ReadinessStatus'] -and $_.ReadinessStatus -eq "Ready" }).Count
- $currentCompanyStats.ReadinessPercentage = if ($currentCompanyStats.TotalUsers -gt 0) {
- $companiesData += $currentCompanyStats
- $currentCompanyStats = @{
- $readyUsersCount = ($UserProfiles | Where-Object { $_.PSObject.Properties['ReadinessStatus'] -and $_.ReadinessStatus -eq "Ready" }).Count
- $companiesData += $currentCompanyStats
- $metadata.DataCounts.Companies = $companiesData.Count
- $powerAppsUsers = @()
- $powerAppsUsers = foreach ($userProfile in $UserProfiles) {
- $metadata.DataCounts.Users = $powerAppsUsers.Count
- $powerAppsWaves = @()
- $waveOrder = 1
- $powerAppsWaves = foreach ($wave in $MigrationWaves) {
- $waveUserUPNs = if ($wave.PSObject.Properties['UserPrincipalNames'] -and $wave.UserPrincipalNames -is [string]) { $wave.UserPrincipalNames -split ';' | Where-Object {$_} | ForEach-Object {$_.Trim()} } elseif($wave.PSObject.Properties['UserPrincipalNames']) { @($wave.UserPrincipalNames) } else { @() }
- $currentWaveUsers = $powerAppsUsers | Where-Object { $_.UPN -in $waveUserUPNs }
- $metadata.DataCounts.Waves = $powerAppsWaves.Count
- $powerAppsDepartments = @()
- $powerAppsDepartments = $powerAppsUsers | Where-Object { -not [string]::IsNullOrWhiteSpace($_.Department) } | Group-Object Department | ForEach-Object {
- $deptGroup = $_
- $deptUsersInGroup = $deptGroup.Group
- $metadata.DataCounts.Departments = $powerAppsDepartments.Count
- $powerAppsApplications = @()
- $powerAppsApplications = foreach ($app in $Applications) {
- $metadata.DataCounts.Applications = $powerAppsApplications.Count
- $powerAppsGroups = @()
- $powerAppsGroups = foreach ($group in $Groups) {
- $metadata.DataCounts.Groups = $powerAppsGroups.Count
- $powerAppsDevices = @()
- $powerAppsDevices = foreach ($device in $Devices) {
- $ownerUPN = ($powerAppsUsers | Where-Object {$_.RegisteredDevices -contains ($device.PSObject.Properties['DeviceId']|Select -First 1) -or $_.RegisteredDevices -contains ($device.PSObject.Properties['DisplayName']|Select -First 1)} | Select-Object -First 1).UPN
- $metadata.DataCounts.Devices = $powerAppsDevices.Count
- $powerAppsRelationships = @{
- $groupNameOrId = $_
- $matchedGroup = $powerAppsGroups | Where-Object {$_.DisplayName -eq $groupNameOrId -or $_.Mail -eq $groupNameOrId -or $_.GroupId -eq $groupNameOrId} | Select-Object -First 1
- $powerAppsRelationships.UserGroupMemberships.Add(@{ UserId = $user.Id; UserUPN = $user.UPN; GroupId = $matchedGroup.GroupId; GroupName = $matchedGroup.DisplayName })
- $deviceNameOrId = $_
- $matchedDevice = $powerAppsDevices | Where-Object {$_.DeviceName -eq $deviceNameOrId -or $_.DeviceId -eq $deviceNameOrId} | Select-Object -First 1
- $powerAppsRelationships.UserDeviceAssociations.Add(@{ UserId = $user.Id; UserUPN = $user.UPN; DeviceId = $matchedDevice.DeviceId; DeviceName = $matchedDevice.DeviceName })
- $appNameOrId = $_
- $matchedApp = $powerAppsApplications | Where-Object {$_.DisplayName -eq $appNameOrId -or $_.ApplicationId -eq $appNameOrId} | Select-Object -First 1
- $powerAppsRelationships.UserApplicationAccess.Add(@{ UserId = $user.Id; UserUPN = $user.UPN; ApplicationId = $matchedApp.ApplicationId; ApplicationName = $matchedApp.DisplayName })
- $managerUser = $powerAppsUsers | Where-Object {$_.UPN -eq $user.ManagerUPN} | Select-Object -First 1
- $powerAppsRelationships.ManagerDirectReports.Add(@{ ManagerId = $managerUser.Id; ManagerUPN = $managerUser.UPN; DirectReportId = $user.Id; DirectReportUPN = $user.UPN })
- $metadata.DataCounts.Relationships = @{ UserGroup = $powerAppsRelationships.UserGroupMemberships.Count; UserDevice = $powerAppsRelationships.UserDeviceAssociations.Count; UserApp = $powerAppsRelationships.UserApplicationAccess.Count; ManagerReport = $powerAppsRelationships.ManagerDirectReports.Count }
- $summaryStats = @{
- $indexData = @{


### MODULE: DataAggregation.psm1  
ðŸ“ Path: `Modules/Processing/DataAggregation.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Import-RawDataSources {
- function Merge-UserProfiles {
- function Merge-DeviceProfiles {
- function New-RelationshipGraph {
- function Start-DataAggregation {
ðŸ“¦ Variables Used:
- $dataSources = @{}
- $csvFiles = Get-ChildItem -Path $RawDataPath -Filter "*.csv" -File
- $sourceName = $file.BaseName
- $content = Import-Csv -Path $file.FullName -ErrorAction Stop
- $dataSources[$sourceName] = $content
- $canonicalUsers = @{}
- $userSourcePrecedence = @(
- $users = $DataSources[$sourceName]
- $upn = $null
- $upn = $user.UserPrincipalName.ToLower().Trim()
- $canonicalUsers[$upn] = [PSCustomObject]@{
- $protectedProperties = @('SamAccountName', 'SID')
- $canonicalDevices = @{}
- $deviceSources = @(
- $devices = $DataSources[$sourceName]
- $deviceId = $device.PSObject.Properties['id'] | Select-Object -First 1
- $canonicalDevices[$deviceId] = [PSCustomObject]@{
- $deviceLookup = @{}
- $deviceLookup[$device.DeviceId] = $device
- $userUPN = $user.UserPrincipalName
- $userDevices = [System.Collections.Generic.List[PSObject]]::new()
- $registeredDevices = $Devices | Where-Object { $_.registeredUsers -match $userUPN }
- $processedDataPath = $global:MandA.Paths.ProcessedDataOutput
- $rawDataPath = $global:MandA.Paths.RawDataOutput
- $dataSources = Import-RawDataSources -RawDataPath $rawDataPath
- $mergedUsers = Merge-UserProfiles -DataSources $dataSources
- $mergedDevices = Merge-DeviceProfiles -DataSources $dataSources
- $finalUsers = New-RelationshipGraph -Users $mergedUsers -Devices $mergedDevices -DataSources $dataSources


### MODULE: DataValidation.psm1  
ðŸ“ Path: `Modules/Processing/DataValidation.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Test-DataQuality {
- function New-QualityReport {
ðŸ“¦ Variables Used:
- $issuesFound = [System.Collections.Generic.List[object]]::new()
- $validRecords = 0
- $invalidRecords = 0 # Tracks profiles with at least one issue
- $processedCount = 0
- $currentProfileIssueCount = 0
- $lastLogonDate = [datetime]$profile.LastLogon
- $totalRecords = $Profiles.Count
- $qualityScore = 100.0 # Default to 100 if no records
- $qualityScore = [math]::Round(($validRecords / $totalRecords) * 100, 2)
- $reportFilePath = Join-Path $OutputPath $ReportFileName
- $outputDir = Split-Path $reportFilePath -Resolve # Use -Resolve to get full path if $OutputPath is relative
- $reportContent = @"
- $groupedIssues = $ValidationResults.Issues | Group-Object IssueType | Sort-Object Name
- $reportContent += "`nIssue Type: $($group.Name) ($($group.Count) occurrences)`n"
- $reportContent += ("-" * ($group.Name.Length + 23)) + "`n" # Dynamic underline
- $reportContent += @"
- $reportContent += "`nNo specific data quality issues found."


### MODULE: UserProfileBuilder.psm1  
ðŸ“ Path: `Modules/Processing/UserProfileBuilder.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Convert-MailboxSizeToMB {
- function Get-Percentile {
- function New-UserProfiles {
- function Measure-MigrationComplexity {
ðŸ“¦ Variables Used:
- $size = [double]$matches[1]
- $unit = $matches[2].ToUpper()
- $bytesString = $matches[1] -replace ',', ''
- $bytes = [long]$bytesString
- $SortedValues = $Values | Sort-Object
- $rawIndex = ($Percentile / 100.0) * $SortedValues.Count
- $index = [Math]::Min([Math]::Max([Math]::Ceiling($rawIndex) - 1, 0), $SortedValues.Count - 1)
- $userProfiles = [System.Collections.Generic.List[object]]::new()
- $allAggregatedUsers = @()
- $allAggregatedUsers = $AggregatedDataStore.Users
- $processedCount = 0
- $userProfile = [PSCustomObject]@{
- $currentUserIdForGraph = $userProfile.GraphId # Prefer GraphId for lookups in RelationshipGraph
- $userProfile.GroupMembershipsText = $RelationshipGraph.UserToGroupMembership[$currentUserIdForGraph] -join "; "
- $userProfile.GroupMembershipCount = $RelationshipGraph.UserToGroupMembership[$currentUserIdForGraph].Count
- $appAssignmentsDetails = $RelationshipGraph.UserToAppRoleAssignment[$currentUserIdForGraph] | ForEach-Object { "$($_.ResourceDisplayName) ($($_.AppRoleDisplayName))" }
- $userProfile.ApplicationAssignmentsText = $appAssignmentsDetails -join "; "
- $userProfile.ApplicationAccessCount = $RelationshipGraph.UserToAppRoleAssignment[$currentUserIdForGraph].Count
- $ownedObjects = $RelationshipGraph.UserToOwnedObject[$currentUserIdForGraph]
- $userProfile.OwnedObjectsCount = $ownedObjects.Count
- $userProfile.OwnedApplicationsText = $ownedObjects | Where-Object {$_.ObjectType -eq "Application"} | ForEach-Object {$_.DisplayName} | Join-String -Separator "; "
- $userProfile.OwnedServicePrincipalsText = $ownedObjects | Where-Object {$_.ObjectType -eq "ServicePrincipal"} | ForEach-Object {$_.DisplayName} | Join-String -Separator "; "
- $userProfile.OwnedGroupsText = $ownedObjects | Where-Object {$_.ObjectType -eq "Group"} | ForEach-Object {$_.DisplayName} | Join-String -Separator "; "
- $userProfile.RegisteredDevicesText = $RelationshipGraph.UserToDeviceLink[$currentUserIdForGraph] -join "; "
- $userProfile.DirectReportsCount = $RelationshipGraph.ManagerToDirectReport[$userProfile.UserPrincipalName].Count
- $complexityAnalysisSummary = [System.Collections.Generic.List[object]]::new() # For the summary report
- $thresholds = $Configuration.processing.complexityThresholds
- $thresholds = @{ low = 3; medium = 7; high = 10 } # Default fallback
- $processedCount = 0
- $currentComplexityScore = 0
- $currentComplexityFactors = [System.Collections.Generic.List[string]]::new()
- $accountAge = (Get-Date) - [DateTime]$profile.AccountCreated
- $daysSinceLogon = (Get-Date) - [DateTime]$profile.LastLogon
- $profile.ComplexityFactors = $currentComplexityFactors.ToArray()
- $profile.ComplexityScore = $currentComplexityScore
- $currentReadinessScore = 100
- $currentBlockingIssues = [System.Collections.Generic.List[string]]::new()
- $currentRiskFactors = [System.Collections.Generic.List[string]]::new()
- $daysSinceLogon = (Get-Date) - [DateTime]$profile.LastLogon
- $profile.ReadinessScore = [Math]::Max(0, $currentReadinessScore)
- $profile.ReadinessStatus = switch ($profile.ReadinessScore) {
- $profile.BlockingIssues = $currentBlockingIssues.ToArray()
- $profile.RiskFactors = ($profile.ComplexityFactors + $currentRiskFactors.ToArray()) | Select-Object -Unique
- $profile.RiskLevel = if ($profile.RiskFactors.Count -eq 0) { "Low" }
- $allComplexityScores = $Profiles | ForEach-Object { $_.ComplexityScore }
- $p25Complexity = Get-Percentile -Values $allComplexityScores -Percentile 25
- $p75Complexity = Get-Percentile -Values $allComplexityScores -Percentile 75
- $userProfileToPrioritize.MigrationPriority = "High"
- $userProfileToPrioritize.MigrationPriority = "Low"
- $userProfileToPrioritize.MigrationPriority = "Medium" # Default
- $baseTime = $Configuration.processing.baseMigrationTimeMinutes | Get-OrElse 30 # Example: Get from config or default
- $complexityMultiplier = 1 + ($userProfileToPrioritize.ComplexityScore * ($Configuration.processing.complexityTimeFactor | Get-OrElse 0.1) )
- $sizeMultiplier = 1 + (($userProfileToPrioritize.MailboxSizeMB / 1024) * ($Configuration.processing.mailboxSizeTimeFactorGB | Get-OrElse 0.1) ) # 10% per GB
- $userProfileToPrioritize.EstimatedMigrationTime = [Math]::Round($baseTime * $complexityMultiplier * $sizeMultiplier, 0)
- $totalUsers = $Profiles.Count
- $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Overall Statistics"; Metric = "Total Users"; Value = $totalUsers; Percentage = 100 })
- $categoryName = $_
- $count = ($Profiles | Where-Object { $_.MigrationCategory -eq $categoryName }).Count
- $statusName = $_
- $count = ($Profiles | Where-Object { $_.ReadinessStatus -eq $statusName }).Count
- $totalEstimatedTime = ($Profiles | Measure-Object -Property EstimatedMigrationTime -Sum).Sum
- $totalEstimatedTimeHours = if ($totalEstimatedTime) {[math]::Round($totalEstimatedTime / 60, 1)} else {0}
- $averageTimePerUser = if ($totalUsers -gt 0 -and $totalEstimatedTime) { [math]::Round($totalEstimatedTime / $totalUsers, 0) } else { 0 }
- $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Time Estimates"; Metric = "Total Estimated Time (hours)"; Value = $totalEstimatedTimeHours; Percentage = $null })
- $complexityAnalysisSummary.Add([PSCustomObject]@{ Category = "Time Estimates"; Metric = "Average Time per User (minutes)"; Value = $averageTimePerUser; Percentage = $null })


### MODULE: WaveGeneration.psm1  
ðŸ“ Path: `Modules/Processing/WaveGeneration.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function New-MigrationWaves {
- function New-WaveObject {
- function Test-WaveDependencies {
- function Optimize-SharedMailboxWaves {
ðŸ“¦ Variables Used:
- $migrationWaves = [System.Collections.Generic.List[object]]::new()
- $generateByDepartment = $false
- $generateByDepartment = $Configuration.processing.generateWavesByDepartment
- $maxWaveSize = 50
- $maxWaveSize = $Configuration.processing.maxWaveSize
- $respectDependencies = $true # New setting to respect Exchange dependencies
- $respectDependencies = $Configuration.processing.respectExchangeDependencies
- $dependencyClusters = @{}
- $processedUsers = @{} # Tracks users already assigned to a cluster to avoid reprocessing
- $upn = $userProfile.UserPrincipalName
- $clusterId = [guid]::NewGuid().ToString()
- $currentClusterUsers = [System.Collections.Generic.List[string]]::new()
- $clusterComplexityScore = 0
- $usersToProcessQueue = [System.Collections.Queue]::new()
- $processedUsers[$upn] = $clusterId # Mark initial user as processed for this cluster
- $currentUserUPN = $usersToProcessQueue.Dequeue()
- $currentUserProfile = $Profiles | Where-Object { $_.UserPrincipalName -eq $currentUserUPN } | Select-Object -First 1
- $clusterComplexityScore += $currentUserProfile.ComplexityScore
- $processedUsers[$coUserUPN] = $clusterId # Mark for this cluster
- $trusteeUPN = $permissionEntry.Trustee
- $processedUsers[$trusteeUPN] = $clusterId # Mark for this cluster
- $dependencyClusters[$clusterId] = @{
- $sharedMailboxGroups = @{}
- $mbxEmail = $sharedMbx.SharedMailbox
- $sharedMailboxGroups[$mbxEmail] = @{
- $group = $sharedMailboxGroups[$mbxEmail]
- $waveCounter = 1
- $assignedUsersToWaves = @{} # Tracks UPN to WaveID to prevent double assignment
- $avgComplexity = 0
- $avgComplexity = [math]::Round(($WaveUserProfiles | Measure-Object -Property ComplexityScore -Average).Average, 2)
- $usersByDepartment = $Profiles | Group-Object -Property @{
- $departmentName = $deptGroup.Name
- $deptUsersProfiles = [System.Collections.Generic.List[object]]::new($deptGroup.Group)
- $deptWaveNumber = 1
- $unassignedDeptUsers = $deptUsersProfiles | Where-Object { -not $assignedUsersToWaves.ContainsKey($_.UserPrincipalName) }
- $cluster = $dependencyClusters[$clusterId]
- $clusterUsersInCurrentDept = $cluster.Users | Where-Object {
- $allClusterUserUPNsToWave = $cluster.Users | Where-Object { -not $assignedUsersToWaves.ContainsKey($_) }
- $clusterUserProfilesToWave = $Profiles | Where-Object { $allClusterUserUPNsToWave -contains $_.UserPrincipalName }
- $wave = New-WaveObject -WaveName "Dept-$departmentName-Wave$deptWaveNumber-Cluster" -CurrentWaveCounter $waveCounter `
- $allClusterUserUPNsToWave | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }
- $unassignedDeptUsers = $unassignedDeptUsers | Where-Object { -not $assignedUsersToWaves.ContainsKey($_.UserPrincipalName) }
- $remainingDeptUsersToWave = $unassignedDeptUsers | Sort-Object ComplexityScore, DisplayName
- $waveUserBatch = $remainingDeptUsersToWave[$i..[System.Math]::Min($i + $maxWaveSize - 1, $remainingDeptUsersToWave.Count - 1)]
- $wave = New-WaveObject -WaveName "Dept-$departmentName-Wave$deptWaveNumber" -CurrentWaveCounter $waveCounter `
- $waveUserBatch.UserPrincipalName | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }
- $sortedClusterIds = $dependencyClusters.Keys | Sort-Object { $dependencyClusters[$_].ComplexityScore }
- $cluster = $dependencyClusters[$clusterId]
- $clusterUserUPNsToWave = $cluster.Users | Where-Object { -not $assignedUsersToWaves.ContainsKey($_) }
- $clusterUserProfiles = $Profiles | Where-Object { $clusterUserUPNsToWave -contains $_.UserPrincipalName }
- $sortedClusterUsersForSplitting = $clusterUserProfiles | Sort-Object ComplexityScore, DisplayName
- $subWaveUsers = $sortedClusterUsersForSplitting[$i..[System.Math]::Min($i + $maxWaveSize - 1, $sortedClusterUsersForSplitting.Count - 1)]
- $wave = New-WaveObject -WaveName "Dependency-Wave$waveCounter-Split" -CurrentWaveCounter $waveCounter `
- $subWaveUsers.UserPrincipalName | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }
- $wave = New-WaveObject -WaveName "Dependency-Wave$waveCounter" -CurrentWaveCounter $waveCounter `
- $clusterUserProfiles.UserPrincipalName | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }
- $usersNotYetWaved = $Profiles | Where-Object { -not $assignedUsersToWaves.ContainsKey($_.UserPrincipalName) }
- $sortedRemainingUsers = $usersNotYetWaved | Sort-Object ComplexityScore, DisplayName
- $waveUserBatch = $sortedRemainingUsers[$i..[System.Math]::Min($i + $maxWaveSize - 1, $sortedRemainingUsers.Count - 1)]
- $wave = New-WaveObject -WaveName "Complexity-Wave$waveCounter" -CurrentWaveCounter $waveCounter `
- $waveUserBatch.UserPrincipalName | ForEach-Object { $assignedUsersToWaves[$_] = $wave.WaveID }
- $originalProfile = $Profiles | Where-Object { $_.UserPrincipalName -eq $userProfileInWave.UserPrincipalName } | Select-Object -First 1
- $currentNotes = if ($originalProfile.PSObject.Properties["Notes"]) { $originalProfile.Notes } else { "" }
- $newNote = "Part of Exchange dependency cluster $($wave.ClusterId)."
- $originalProfile.PSObject.Properties["Notes"].Value = "$currentNotes $newNote"
- $waveSummary = @{
- $issues = [System.Collections.Generic.List[object]]::new()
- $userWaveOrderLookup = @{}
- $waveUPNs = $wave.UserPrincipalNames -split ';' | Where-Object { $_.Trim() }
- $userWaveOrderLookup[$upn.Trim()] = $wave.WaveOrder
- $currentUserUPN = $userProfile.UserPrincipalName
- $currentUserWaveOrder = $userWaveOrderLookup[$currentUserUPN]
- $dependentUserWaveOrder = $userWaveOrderLookup[$dependentUserUPN]
- $sharedMailboxStats = @{} # Key: SharedMailboxEmail, Value: { Mailbox, Users (list of UPNs), WaveIDs (list of unique wave IDs) }
- $userToWaveIDLookup = @{}
- $waveUPNs = $wave.UserPrincipalNames -split ';' | Where-Object { $_.Trim() }
- $userToWaveIDLookup[$upn.Trim()] = $wave.WaveID
- $userUPN = $userProfile.UserPrincipalName
- $userWaveID = $userToWaveIDLookup[$userUPN]
- $mbxEmail = $sharedMbxAccessInfo.SharedMailbox
- $sharedMailboxStats[$mbxEmail] = @{
- $sharedMailboxStats[$mbxEmail].UserWaveMapping[$userUPN] = $userWaveID
- $optimizationCandidates = [System.Collections.Generic.List[object]]::new()
- $stats = $sharedMailboxStats[$mbxEmail]


### MODULE: ConfigurationValidation.psm1  
ðŸ“ Path: `Modules/Utilities/ConfigurationValidation.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Test-SuiteConfigurationAgainstSchema {
- function Test-ConfigurationNodeInternal {
ðŸ“¦ Variables Used:
- $validationErrors = [System.Collections.Generic.List[string]]::new()
- $validationWarnings = [System.Collections.Generic.List[string]]::new()
- $schemaJson = $null # This will be a PSCustomObject after ConvertFrom-Json
- $schemaJson = Get-Content $SchemaPath -Raw | ConvertFrom-Json -ErrorAction Stop
- $propPath = "$CurrentPath.$propKey"
- $allowAdditional = $false
- $allowAdditional = $true
- $allowAdditional = $true # For simplicity, assume if it's a schema, it's allowed (or validate against it)
- $allowAdditional = $true # Tentatively allow, or implement $ref resolution
- $expectedSchemaType = $NodeSchema.type # This can be a string or an array of strings (e.g. ["string", "null"])
- $actualDataType = $NodeData.GetType().Name.ToLower()
- $typeMatch = $false
- $typeMatch = $true
- $typeMatch = $true
- $typeMatch = $true
- $typeMatch = $true
- $isValid = $validationErrors.Count -eq 0


### MODULE: CredentialFormatHandler.psm1  
ðŸ“ Path: `Modules/Utilities/CredentialFormatHandler.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function ConvertTo-StandardCredentialFormat {
- function Test-CredentialFormat {
- function Save-CredentialFile {
- function Read-CredentialFile {
ðŸ“¦ Variables Used:
- $script:CREDENTIAL_FORMAT_VERSION = "2.0"
- $requiredFields = @('ClientId', 'ClientSecret', 'TenantId')
- $CredentialData['_FormatVersion'] = $script:CREDENTIAL_FORMAT_VERSION
- $hasBasicFields = $CredentialData.ContainsKey('ClientId') -and
- $standardData = ConvertTo-StandardCredentialFormat -CredentialData $CredentialData
- $jsonData = $standardData | ConvertTo-Json -Depth 10 -Compress
- $secureString = ConvertTo-SecureString -String $jsonData -AsPlainText -Force
- $encryptedString = ConvertFrom-SecureString -SecureString $secureString
- $directory = Split-Path $Path -Parent
- $verifyContent = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::ASCII)
- $encryptedContent = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::ASCII)
- $secureString = ConvertTo-SecureString -String $encryptedContent -ErrorAction Stop
- $jsonData = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
- $credentialData = $jsonData | ConvertFrom-Json -ErrorAction Stop
- $hashtable = @{}
- $hashtable[$_.Name] = $_.Value


### MODULE: EnhancedLogging.psm1  
ðŸ“ Path: `Modules/Utilities/EnhancedLogging.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Initialize-Logging {
- function Write-MandALog {
- function Test-LogMessage {
- function Get-LogColor {
- function Get-LogEmoji {
- function Write-ProgressBar {
- function Write-StatusTable {
- function Write-SectionHeader {
- function Write-CompletionSummary {
- function Move-LogFile {
- function Clear-OldLogFiles {
- function Get-LoggingConfiguration {
- function Set-LogLevel {
- function Set-LoggingOptions {
ðŸ“¦ Variables Used:
- $script:LoggingConfig = @{
- $script:LoggingConfig.LogLevel = $Configuration.environment.logLevel
- $logPath = if ($global:MandA.Paths.LogOutput) {
- $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
- $logFileName = "MandA_Discovery_$timestamp.log"
- $script:LoggingConfig.LogFile = Join-Path $logPath $logFileName
- $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
- $logEntry = "[$timestamp] [$Level] [$Component] $Message"
- $color = Get-LogColor -Level $Level
- $emoji = Get-LogEmoji -Level $Level
- $progressMessage = if ($script:LoggingConfig.UseEmojis) { "$emoji $Message" } else { $Message }
- $importantMessage = if ($script:LoggingConfig.UseEmojis) { "$emoji $Message" } else { "! $Message" }
- $displayMessage = if ($script:LoggingConfig.UseEmojis) { "$emoji $Message" } else { $Message }
- $displayMessage = "[$timestamp] $displayMessage"
- $fileMessage = $Message -replace '[\uD83C-\uDBFF\uDC00-\uDFFF]+', ''
- $fileLogEntry = "[$timestamp] [$Level] [$Component] $fileMessage"
- $logFile = Get-Item $script:LoggingConfig.LogFile -ErrorAction SilentlyContinue
- $levelHierarchy = @{
- $currentLevel = $levelHierarchy[$script:LoggingConfig.LogLevel]
- $messageLevel = $levelHierarchy[$Level]
- $percentComplete = [math]::Round(($Current / $Total) * 100, 1)
- $completed = [math]::Floor(($Current / $Total) * $Width)
- $remaining = $Width - $completed
- $progressBar = "#" * $completed + "-" * $remaining
- $progressText = "$Activity [$progressBar] $percentComplete% $Status"
- $maxKeyLength = ($StatusData.Keys | Measure-Object -Property Length -Maximum).Maximum
- $tableWidth = [math]::Max($maxKeyLength + 20, 60)
- $key = $item.Key.PadRight($maxKeyLength)
- $value = $item.Value
- $statusColor = "White"
- $padding = $tableWidth - $key.Length - $value.ToString().Length - 7
- $headerText = if ($Subtitle) { "$Icon $Title - $Subtitle" } else { "$Icon $Title" }
- $logDir = Split-Path $script:LoggingConfig.LogFile -Parent
- $logName = Split-Path $script:LoggingConfig.LogFile -LeafBase
- $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
- $rotatedLogFile = Join-Path $logDir "$logName`_$timestamp.log"
- $cutoffDate = (Get-Date).AddDays(-$script:LoggingConfig.LogRetentionDays)
- $oldLogFiles = Get-ChildItem -Path $LogPath -Filter "*.log" | Where-Object { $_.LastWriteTime -lt $cutoffDate }
- $script:LoggingConfig.LogLevel = $Level
- $script:LoggingConfig.UseEmojis = $UseEmojis
- $script:LoggingConfig.UseColors = $UseColors
- $script:LoggingConfig.ShowTimestamp = $ShowTimestamp
- $script:LoggingConfig.ShowComponent = $ShowComponent


### MODULE: ErrorHandling.psm1  
ðŸ“ Path: `Modules/Utilities/ErrorHandling.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Invoke-WithRetry {
- function Test-CriticalError {
- function Get-FriendlyErrorMessage {
- function Write-ErrorSummary {
- function Test-Prerequisites {
- function Initialize-OutputDirectories {
- function Test-DirectoryWriteAccess {
ðŸ“¦ Variables Used:
- $attempt = 0
- $lastError = $null
- $result = & $ScriptBlock
- $lastError = $_
- $errorType = $_.Exception.GetType().Name
- $isRetryable = $RetryableErrors -contains $errorType -or
- $waitTime = $DelaySeconds * $attempt
- $criticalErrors = @(
- $errorType = $ErrorRecord.Exception.GetType().Name
- $errorType = $ErrorRecord.Exception.GetType().Name
- $errorMessage = $ErrorRecord.Exception.Message
- $errorGroups = $Errors | Group-Object { $_.Exception.GetType().Name }
- $examples = $group.Group | Select-Object -First 3
- $friendlyMessage = Get-FriendlyErrorMessage -ErrorRecord $example
- $validationErrors = @()
- $validationErrors += "PowerShell 5.1 or higher is required"
- $requiredModules = @(
- $validationErrors += "Required module not installed: $module"
- $outputPath = if ($global:MandA.Paths.CompanyProfileRoot) {
- $validationErrors += "No output path configured"
- $validationErrors += "Cannot create output directory: $outputPath - $($_.Exception.Message)"
- $drive = Split-Path $outputPath -Qualifier
- $freeSpace = (Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='$drive'" -ErrorAction Stop).FreeSpace / 1GB
- $requiredSpace = if ($Configuration.performance.diskSpaceThresholdGB) {
- $validationErrors += "Insufficient disk space. Required: ${requiredSpace}GB, Available: $([math]::Round($freeSpace, 2))GB"
- $totalMemory = (Get-WmiObject -Class Win32_ComputerSystem -ErrorAction Stop).TotalPhysicalMemory / 1MB
- $requiredMemory = if ($Configuration.performance.memoryThresholdMB) {
- $endpoints = @("graph.microsoft.com", "login.microsoftonline.com")
- $result = Test-NetConnection -ComputerName $endpoint -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue
- $validationErrors += "Cannot reach required endpoint: $endpoint"
- $validationErrors += "Network connectivity test failed for: $endpoint"
- $directories = @(
- $archivePath = Join-Path $global:MandA.Paths.CompanyProfileRoot "Archive"
- $tempPath = Join-Path $global:MandA.Paths.CompanyProfileRoot "Temp"
- $directories += @($archivePath, $tempPath)
- $global:MandA.Paths['Archive'] = $archivePath
- $global:MandA.Paths['Temp'] = $tempPath
- $outputPath = $Configuration.environment.outputPath
- $outputPath = Join-Path $Configuration.environment.profilesBasePath "DefaultOutput"
- $directories = @(
- $accessErrors = @()
- $accessErrors += $dir
- $testFile = Join-Path $DirectoryPath "write_test_$(Get-Random).tmp"


### MODULE: FileOperations.psm1  
ðŸ“ Path: `Modules/Utilities/FileOperations.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Import-DataFromCSV {
- function Export-DataToCSV {
- function Test-FileWriteAccess {
- function Backup-File {
ðŸ“¦ Variables Used:
- $data = Import-Csv -Path $FilePath -Delimiter $Delimiter -ErrorAction Stop
- $directory = Split-Path $FilePath -Parent
- $params = @{
- $params.Append = $true
- $testFile = Join-Path $Path "write_test_$(Get-Random).tmp"
- $backupPath = "$FilePath.$(Get-Date -Format 'yyyyMMddHHmmss').bak"


### MODULE: ProgressTracking.psm1  
ðŸ“ Path: `Modules/Utilities/ProgressTracking.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Initialize-ProgressTracker {
- function Update-Progress {
- function Complete-Progress {
- function Start-OperationTimer {
- function Stop-OperationTimer {
- function Get-ProgressMetrics {
- function Export-ProgressMetrics {
- function Show-ProgressSummary {
- function Reset-ProgressTracker {
- function Clear-TempFiles {
ðŸ“¦ Variables Used:
- $script:ProgressState = @{
- $script:ProgressState.CurrentPhase = $Phase
- $script:ProgressState.TotalSteps = $TotalSteps
- $script:ProgressState.CurrentStep = 0
- $script:ProgressState.StartTime = Get-Date
- $script:ProgressState.LastUpdateTime = Get-Date
- $script:ProgressState.CurrentStep = $Step
- $script:ProgressState.LastUpdateTime = Get-Date
- $percentComplete = if ($script:ProgressState.TotalSteps -gt 0) {
- $elapsed = (Get-Date) - $script:ProgressState.StartTime
- $eta = if ($percentComplete -gt 0) {
- $totalEstimated = $elapsed.TotalSeconds * (100 / $percentComplete)
- $remaining = $totalEstimated - $elapsed.TotalSeconds
- $statusMessage = $Status
- $statusMessage += " ($ItemsProcessed of $TotalItems items)"
- $etaString = if ($eta.TotalHours -ge 1) {
- $statusMessage += " - ETA: $etaString"
- $script:ProgressState.Metrics[$Step] = @{
- $script:ProgressState.CurrentStep = $script:ProgressState.TotalSteps
- $elapsed = (Get-Date) - $script:ProgressState.StartTime
- $script:ProgressState.Metrics["Final"] = @{
- $script:ProgressState.Operations[$OperationName] = @{
- $operation = $script:ProgressState.Operations[$OperationName]
- $operation.EndTime = Get-Date
- $operation.Duration = $operation.EndTime - $operation.StartTime
- $operation.Status = $Status
- $outputPath = $Configuration.environment.outputPath
- $metricsFile = Join-Path $outputPath "Logs\ProgressMetrics_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
- $metrics = Get-ProgressMetrics
- $metrics = Get-ProgressMetrics
- $elapsed = (Get-Date) - $metrics.StartTime
- $duration = if ($op.Value.Duration) { $op.Value.Duration.ToString('hh\:mm\:ss') } else { "Running" }
- $script:ProgressState = @{
- $tempPath = $Configuration.environment.tempPath
- $tempFiles = Get-ChildItem -Path $tempPath -Recurse -File | Where-Object { $_.LastWriteTime -lt (Get-Date).AddHours(-24) }


### MODULE: ValidationHelpers.psm1  
ðŸ“ Path: `Modules/Utilities/ValidationHelpers.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Test-Prerequisites {
- function Get-RequiredModules {
- function Test-GuidFormat {
- function Test-EmailFormat {
- function Test-UPNFormat {
- function Test-ConfigurationFile {
- function Test-DirectoryWriteAccess {
- function Test-ModuleAvailability {
- function Test-NetworkConnectivity {
- function Test-DataQuality {
- function Export-ValidationReport {
ðŸ“¦ Variables Used:
- $allChecksPass = $true
- $allChecksPass = $false
- $allChecksPass = $false
- $outputPathToCheck = $Configuration.environment.outputPath
- $outputPathToCheck = Join-Path $global:MandASuiteRoot $outputPathToCheck
- $allChecksPass = $false
- $modulesToLoad = [System.Collections.Generic.List[string]]::new()
- $discoveryModuleMapping = @{
- $processingModuleMapping = @{
- $exportModuleMapping = @{
- $moduleFileName = $discoveryModuleMapping[$sourceName]
- $modulePath = Join-Path $global:MandAModulesPath "Discovery\$moduleFileName"
- $moduleFileName = $processingModuleMapping[$key]
- $modulePath = Join-Path $global:MandAModulesPath "Processing\$moduleFileName"
- $moduleFileName = $exportModuleMapping[$formatName]
- $modulePath = Join-Path $global:MandAModulesPath "Export\$moduleFileName"
- $modulePath = Join-Path $global:MandAModulesPath "Export\$($exportModuleMapping['PowerApps'])"
- $guidPattern = '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
- $emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
- $configObject = Get-Content $ConfigurationPath -Raw | ConvertFrom-Json -ErrorAction Stop
- $requiredSections = @("metadata", "environment", "authentication", "discovery", "processing", "export")
- $testFile = Join-Path $DirectoryPath "write_test_$(Get-Random).tmp"
- $missingModules = @()
- $missingModules += $moduleName
- $failedEndpoints = @()
- $failedEndpoints += $endpoint
- $validRecords = 0; $invalidRecords = 0; $issues = [System.Collections.Generic.List[object]]::new()
- $recordValid = $true; $recordIssues = [System.Collections.Generic.List[string]]::new()
- $recordValid = $false; $recordIssues.Add("Missing required field: $field")
- $recordValid = $false; $recordIssues.Add("Invalid UPN format: $($record.UserPrincipalName)")
- $recordValid = $false; $recordIssues.Add("Invalid email format: $($record.Mail)")
- $qualityScore = if ($Data.Count -gt 0) { [math]::Round(($validRecords / $Data.Count) * 100, 2) } else { 100 }
- $reportFile = Join-Path $OutputPath "$ReportName`_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv"
- $reportData = [System.Collections.Generic.List[PSObject]]::new()
- $recordIdentifier = "Unknown"


### MODULE: logging.psm1  
ðŸ“ Path: `Modules/Utilities/logging.psm1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Initialize-Logging {
- function Write-MandALog {
- function Test-LogMessage {
- function Get-LogColor {
- function Get-LogEmoji {
- function Write-ProgressBar {
- function Write-StatusTable {
- function Write-SectionHeader {
- function Write-CompletionSummary {
- function Move-LogFile {
- function Clear-OldLogFiles {
- function Get-LoggingConfiguration {
- function Set-LogLevel {
- function Set-LoggingOptions {
ðŸ“¦ Variables Used:
- $script:LoggingConfig = @{
- $script:LoggingConfig.LogLevel = $Configuration.environment.logLevel
- $logPath = Join-Path $Configuration.environment.outputPath "Logs"
- $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
- $logFileName = "MandA_Discovery_$timestamp.log"
- $script:LoggingConfig.LogFile = Join-Path $logPath $logFileName
- $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
- $logEntry = "[$timestamp] [$Level] [$Component] $Message"
- $color = Get-LogColor -Level $Level
- $emoji = Get-LogEmoji -Level $Level
- $progressMessage = if ($script:LoggingConfig.UseEmojis) { "$emoji $Message" } else { $Message }
- $importantMessage = if ($script:LoggingConfig.UseEmojis) { "$emoji $Message" } else { "! $Message" }
- $displayMessage = if ($script:LoggingConfig.UseEmojis) { "$emoji $Message" } else { $Message }
- $displayMessage = "[$timestamp] $displayMessage"
- $fileMessage = $Message -replace '[\uD83C-\uDBFF\uDC00-\uDFFF]+', ''
- $fileLogEntry = "[$timestamp] [$Level] [$Component] $fileMessage"
- $logFile = Get-Item $script:LoggingConfig.LogFile -ErrorAction SilentlyContinue
- $levelHierarchy = @{
- $currentLevel = $levelHierarchy[$script:LoggingConfig.LogLevel]
- $messageLevel = $levelHierarchy[$Level]
- $percentComplete = [math]::Round(($Current / $Total) * 100, 1)
- $completed = [math]::Floor(($Current / $Total) * $Width)
- $remaining = $Width - $completed
- $progressBar = "#" * $completed + "-" * $remaining
- $progressText = "$Activity [$progressBar] $percentComplete% $Status"
- $maxKeyLength = ($StatusData.Keys | Measure-Object -Property Length -Maximum).Maximum
- $tableWidth = [math]::Max($maxKeyLength + 20, 60)
- $key = $item.Key.PadRight($maxKeyLength)
- $value = $item.Value
- $statusColor = "White"
- $padding = $tableWidth - $key.Length - $value.ToString().Length - 7
- $headerText = if ($Subtitle) { "$Icon $Title - $Subtitle" } else { "$Icon $Title" }
- $logDir = Split-Path $script:LoggingConfig.LogFile -Parent
- $logName = Split-Path $script:LoggingConfig.LogFile -LeafBase
- $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
- $rotatedLogFile = Join-Path $logDir "$logName`_$timestamp.log"
- $cutoffDate = (Get-Date).AddDays(-$script:LoggingConfig.LogRetentionDays)
- $oldLogFiles = Get-ChildItem -Path $LogPath -Filter "*.log" | Where-Object { $_.LastWriteTime -lt $cutoffDate }
- $script:LoggingConfig.LogLevel = $Level
- $script:LoggingConfig.UseEmojis = $UseEmojis
- $script:LoggingConfig.UseColors = $UseColors
- $script:LoggingConfig.ShowTimestamp = $ShowTimestamp
- $script:LoggingConfig.ShowComponent = $ShowComponent


### SCRIPT: MandA-Orchestrator.ps1  
ðŸ“ Path: `Core/MandA-Orchestrator.ps1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Initialize-MandAEnvironmentInternal {
- function Invoke-DiscoveryPhaseInternal {
- function Invoke-ProcessingPhaseInternal {
- function Invoke-ExportPhaseInternal {
- function Complete-MandADiscoveryInternal {
ðŸ“¦ Variables Used:
- $OriginalErrorActionPreferenceOrchestrator = $ErrorActionPreference
- $ErrorActionPreference = "Stop"
- $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
- $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
- $utilityModulesToImport = @(
- $modulePath_util = Join-Path $global:MandA.Paths.Utilities $moduleName_util
- $coreInfraModules = @(
- $modulePath_item = Join-Path $global:MandA.Paths.Modules $moduleRelPath_item
- $Configuration.environment['outputPath'] = $global:MandA.Paths.CompanyProfileRoot
- $moduleCheckScriptPath = $global:MandA.Paths.ModuleCheckScript
- $discoveryModulePathBase = Join-Path $global:MandA.Paths.Modules "Discovery"
- $enabledSources = @($Configuration.discovery.enabledSources)
- $loadedCount = 0
- $moduleFileName = "$($sourceName)Discovery.psm1"
- $fullModulePath = Join-Path $discoveryModulePathBase $moduleFileName
- $processingModulePathBase = Join-Path $global:MandA.Paths.Modules "Processing"
- $processingModulesToLoad = @("DataAggregation.psm1") # Primary processing module
- $fullModulePath = Join-Path $processingModulePathBase $moduleFile
- $exportModulePathBase = Join-Path $global:MandA.Paths.Modules "Export"
- $enabledFormats = @($Configuration.export.formats)
- $loadedCount = 0
- $moduleFileName = "$($formatName)Exporter.psm1"
- $fullModulePath = Join-Path $exportModulePathBase $moduleFileName
- $discoveryResults = @{}
- $enabledSources = @($Configuration.discovery.enabledSources)
- $invokeFunctionName = "Invoke-$($sourceName)Discovery"
- $processingSuccess = Start-DataAggregation -Configuration $Configuration
- $processedDataPath = $global:MandA.Paths.ProcessedDataOutput
- $dataToExport = @{}
- $processedFiles = Get-ChildItem -Path $processedDataPath -Filter "*.csv" -File -ErrorAction SilentlyContinue
- $dataKey = $file.BaseName # e.g., "Users", "Devices", "MigrationWaves"
- $dataToExport[$dataKey] = Import-Csv -Path $file.FullName -ErrorAction Stop
- $enabledFormats = @($Configuration.export.formats)
- $exportFunctionName = ""
- $configPathToLoad = if ([System.IO.Path]::IsPathRooted($ConfigurationFile)) { $ConfigurationFile } else { Join-Path $global:MandA.Paths.SuiteRoot $ConfigurationFile }
- $script:CurrentConfig = Get-Content -Path $configPathToLoad -Raw | ConvertFrom-Json
- $script:CurrentConfig = $global:MandA.Config # This is pre-loaded by Set-SuiteEnvironment.ps1
- $script:CurrentConfig.metadata.companyName = $CompanyName
- $script:CurrentConfig.discovery.skipExistingFiles = $false
- $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator
- $authContext = $null
- $script:CurrentConfig.authentication.credentialStorePath = Split-Path $global:MandA.Paths.CredentialFile -Parent
- $script:CurrentConfig.authentication.credentialFileName = Split-Path $global:MandA.Paths.CredentialFile -Leaf
- $authResult = Initialize-MandAAuthentication -Configuration $script:CurrentConfig
- $authError = if($authResult -is [hashtable] -and $authResult.Error){$authResult.Error}else{"Unknown auth error"}
- $authContext = if ($authResult.Context) { $authResult.Context } else { $authResult }
- $connectionStatus = Initialize-AllConnections -Configuration $script:CurrentConfig -AuthContext $authContext
- $criticalFailure = $false
- $serviceName = $_
- $isConnected = $false
- $serviceStat = $connectionStatus.$serviceName
- $isConnected = if ($serviceStat -is [bool]) { $serviceStat } elseif ($serviceStat -is [hashtable] -and $serviceStat.ContainsKey('Connected')) { $serviceStat.Connected } else { $false }
- $ErrorActionPreference = $OriginalErrorActionPreferenceOrchestrator


### SCRIPT: Diagnose-CredentialFile.ps1  
ðŸ“ Path: `Scripts/Diagnose-CredentialFile.ps1`  
ðŸ”§ Purpose: No synopsis found.  
ðŸ“Œ Declared Functions:

ðŸ“¦ Variables Used:
- $fileInfo = Get-Item $CredentialFile
- $rawContent = Get-Content $CredentialFile -Raw
- $utf8Content = Get-Content $CredentialFile -Raw -Encoding UTF8
- $secureString = ConvertTo-SecureString -String $utf8Content -ErrorAction Stop
- $plainText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
- $asciiContent = Get-Content $CredentialFile -Raw -Encoding ASCII
- $secureString = ConvertTo-SecureString -String $asciiContent -ErrorAction Stop
- $plainText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
- $sysContent = [System.IO.File]::ReadAllText($CredentialFile, [System.Text.Encoding]::UTF8)
- $sysContentAscii = [System.IO.File]::ReadAllText($CredentialFile, [System.Text.Encoding]::ASCII)
- $sysContentDefault = [System.IO.File]::ReadAllText($CredentialFile)


### SCRIPT: DiscoverySuiteModuleCheck.ps1  
ðŸ“ Path: `Scripts/DiscoverySuiteModuleCheck.ps1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Test-IsAdministrator {
- Function Get-ModuleDefinition {
- function Write-SectionHeader {
- function Write-StatusIcon {
- function Write-ModuleStatus {
- function Install-OrUpdateModuleViaPSGallery {
- function Install-RSATModuleTool {
- function Test-SingleModule {
- function Write-ModuleTable {
ðŸ“¦ Variables Used:
- $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
- $script:IsAdmin = Test-IsAdministrator
- $script:GlobalMandAConfig = $null
- $script:GlobalMandAConfig = $global:MandA.Config
- $PSScriptRootDiscoveryModuleCheck = $PSScriptRoot
- $PSScriptRootDiscoveryModuleCheck = Split-Path $MyInvocation.MyCommand.Definition -Parent
- $standaloneConfigPath = Join-Path $PSScriptRootDiscoveryModuleCheck "..\Configuration\default-config.json"
- $script:GlobalMandAConfig = Get-Content $standaloneConfigPath | ConvertFrom-Json
- $script:GlobalMandAConfig = $null
- $script:GlobalMandAConfig = $null
- $configModules = $null
- $enabledDiscoverySources = @() # This variable is not used in v2.0.8 for criticality change
- $configModules = $script:GlobalMandAConfig.discovery.powershellModules
- $reqVersion = $DefaultVersion
- $effectiveNotes = $Notes
- $moduleConfigEntry = $configModules.$Name
- $reqVersion = $moduleConfigEntry.RequiredVersion
- $effectiveNotes = $moduleConfigEntry.Notes
- $ModulesToCheck = @(
- $ModulesToCheck = $ModulesToCheck | Where-Object { $_.Name -in $ModuleName }
- $Results = [System.Collections.Generic.List[PSObject]]::new()
- $installModuleParams = @{
- $installModuleParams.Force = $true
- $shouldProceedWithInstall = $false
- $shouldProcessMessage = "Install/Update module '$ModuleNameForInstall' to minimum version $($ReqVersion.ToString()) from PowerShell Gallery?"
- $shouldProceedWithInstall = $true
- $shouldProceedWithInstall = $true
- $ModuleResultToUpdateRef.Value.Notes += " User skipped PSGallery install/update."
- $ModuleResultToUpdateRef.Value.Notes += " AutoFix not enabled for PSGallery modules."
- $ModuleResultToUpdateRef.Value.Status = "Install Failed (PowerShellGet Missing)"
- $ModuleResultToUpdateRef.Value.Notes = "Install-Module command not found. PowerShellGet module might be missing."
- $psGallery = Get-PSRepository -Name PSGallery -ErrorAction SilentlyContinue
- $psGallery = Get-PSRepository -Name PSGallery -ErrorAction SilentlyContinue
- $ModuleResultToUpdateRef.Value.Notes += " PSGallery registration failed."
- $ModuleResultToUpdateRef.Value.Notes += " Error registering PSGallery: $($_.Exception.Message)"
- $ModuleResultToUpdateRef.Value.Notes += " PSGallery Install/update attempted."
- $ModuleResultToUpdateRef.Value.Status = "PSGallery Install/Update Failed"
- $ModuleResultToUpdateRef.Value.Notes = "PSGallery Error: Module '$ModuleNameForInstall' not found in any registered repository. Verify module name."
- $ModuleResultToUpdateRef.Value.Notes = "PSGallery Error: $($_.Exception.Message)"
- $ModuleResultToUpdateRef.Value.Notes += " RSAT install requires Administrator privileges."
- $ModuleResultToUpdateRef.Value.Notes += " No Windows Capability Name defined for $RSATModuleName."
- $shouldProcessMessage = "Install RSAT tool '$RSATModuleName' (Windows Capability: '$CapabilityName')?"
- $shouldProceedWithInstall = $false
- $shouldProceedWithInstall = $true
- $shouldProceedWithInstall = $true
- $ModuleResultToUpdateRef.Value.Notes += " User skipped RSAT tool install."
- $capability = Get-WindowsCapability -Online -Name $CapabilityName -ErrorAction Stop
- $ModuleResultToUpdateRef.Value.Notes += " RSAT Capability '$CapabilityName' already installed."
- $capability = Get-WindowsCapability -Online -Name $CapabilityName -ErrorAction SilentlyContinue
- $ModuleResultToUpdateRef.Value.Notes += " RSAT Capability '$CapabilityName' installed successfully."
- $errorMessageDetail = "Capability '$CapabilityName' not in 'Installed' state after Add-WindowsCapability. Current state: $($capability.State)."
- $errorMessageDetail += " This often means the system could not download the payload. Ensure Administrator rights, check Internet connectivity, Windows Update service status, and for restrictive Group Policies. Try manual installation via Windows Settings (Optional Features) or DISM using 'DISM.exe /Online /Add-Capability /CapabilityName:$CapabilityName'."
- $ModuleResultToUpdateRef.Value.Status = "RSAT Install Failed"
- $ModuleResultToUpdateRef.Value.Notes += " RSAT Install Error for '$CapabilityName': $($_.Exception.Message)."
- $moduleNameToCheck = $ModuleInfo.Name
- $effectiveCategory = $ModuleInfo.Category # Use original category from definition
- $reqVersion = [version]$ModuleInfo.RequiredVersion
- $isRSATTool = [bool]$ModuleInfo.IsRSAT
- $rsatCapabilityName = $ModuleInfo.RSATCapabilityName
- $categoryColor = switch ($effectiveCategory) {
- $moduleResult = [PSCustomObject]@{
- $attemptedFixThisRun = $false
- $availableModule = Get-Module -ListAvailable -Name $moduleNameToCheck -ErrorAction SilentlyContinue | Sort-Object Version -Descending | Select-Object -First 1
- $moduleResult.Status = "Not Found"
- $moduleResult.Notes = "Module not installed/discoverable."
- $attemptedFixThisRun = $true
- $moduleResult.Notes += " Install via Windows Features/Capabilities or use -AutoFix (as Admin)."
- $attemptedFixThisRun = $true
- $moduleResult.Path = $availableModule.Path
- $installedVersion = $availableModule.Version
- $moduleResult.InstalledVersion = $installedVersion.ToString()
- $statusText = if ($attemptedFixThisRun) { "Found (after fix attempt)" } else { "Found" }
- $moduleResult.Status = "Version Mismatch"
- $moduleResult.Notes = "Installed version older than expected."
- $moduleResult.Notes += " Update via Windows Features if issues persist or version is critical."
- $attemptedFixThisRun = $true
- $moduleResult.Status = "Version OK"
- $importedModule = $null
- $importedModule = Import-Module -Name $moduleNameToCheck -RequiredVersion $installedVersion -Force -PassThru -ErrorAction Stop
- $moduleResult.Status = "Imported Successfully (Version OK)"
- $moduleResult.Status = "Import Attempted (No Object Returned, Version OK)"
- $moduleResult.Notes += " Import did not return object."
- $moduleResult.Status = "Import Failed (Version OK)"
- $moduleResult.Notes += " Import Error: $($_.Exception.Message)."
- $moduleResult.Status = "Check Incomplete"
- $moduleResult.Notes += " Status not fully determined."
- $criticalModules    = $Results | Where-Object { $_.Category -eq "CRITICAL REQUIRED" }
- $conditionalModules = $Results | Where-Object { $_.Category -eq "CONDITIONALLY REQUIRED" }
- $recommendedModules = $Results | Where-Object { $_.Category -eq "RECOMMENDED" }
- $optionalModules    = $Results | Where-Object { $_.Category -eq "OPTIONAL" }
- $statusColor = switch ($module.Status) {
- $statusIcon = switch ($module.Status) {
- $criticalIssues = $Results | Where-Object {
- $otherIssues = $Results | Where-Object {
- $overallSuccess = $true
- $overallSuccess = $false


### SCRIPT: Set-SuiteEnvironment.ps1  
ðŸ“ Path: `Scripts/Set-SuiteEnvironment.ps1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Test-MandASuiteStructureInternal {
- function ConvertTo-HashtableRecursiveInternal {
ðŸ“¦ Variables Used:
- $OriginalErrorActionPreference = $ErrorActionPreference
- $ErrorActionPreference = "Stop"
- $requiredSubDirs = @("Core", "Modules", "Scripts", "Configuration")
- $SuiteRoot = $null
- $determinedBy = ""
- $SuiteRoot = Resolve-Path $ProvidedSuiteRoot | Select-Object -ExpandProperty Path
- $determinedBy = "parameter input ('$ProvidedSuiteRoot')"
- $defaultPath = "C:\UserMigration"
- $SuiteRoot = Resolve-Path $defaultPath | Select-Object -ExpandProperty Path
- $determinedBy = "default path ('$defaultPath')"
- $scriptBeingProcessedPath = $MyInvocation.MyCommand.Path
- $scriptBeingProcessedPath = Join-Path $PSScriptRoot $MyInvocation.MyCommand.Name
- $scriptsDirCandidate = Split-Path $scriptBeingProcessedPath -Parent
- $autoDetectedPath = Split-Path $scriptsDirCandidate -Parent
- $SuiteRoot = Resolve-Path $autoDetectedPath | Select-Object -ExpandProperty Path
- $determinedBy = "auto-detection relative to script location ('$autoDetectedPath' from '$scriptBeingProcessedPath')"
- $ErrorActionPreference = $OriginalErrorActionPreference
- $configFilePath = Join-Path $SuiteRoot "Configuration/default-config.json"
- $configSchemaPath = Join-Path $SuiteRoot "Configuration/config.schema.json"
- $errorMessage = "CRITICAL: Configuration file 'default-config.json' not found at expected location: '$configFilePath'"
- $ErrorActionPreference = $OriginalErrorActionPreference
- $loadedConfig = $null
- $loadedConfig = Get-Content $configFilePath -Raw | ConvertFrom-Json -ErrorAction Stop
- $errorMessage = "CRITICAL: Failed to parse 'default-config.json': $($_.Exception.Message)"
- $ErrorActionPreference = $OriginalErrorActionPreference
- $hash = @{}
- $hash[$prop.Name] = ConvertTo-HashtableRecursiveInternal $prop.Value
- $configHashtable = ConvertTo-HashtableRecursiveInternal $loadedConfig
- $profilesBasePath = $configHashtable.environment.profilesBasePath
- $credentialFileName = $configHashtable.authentication.credentialFileName
- $companyProfileRootPath = Join-Path $profilesBasePath $CompanyName
- $dynamicPaths = @{
- $staticPaths = @{
- $global:MandA = @{
- $dynamicPaths.GetEnumerator() | ForEach-Object { $global:MandA.Paths[$_.Name] = $_.Value }
- $configValidationModulePath = Join-Path $global:MandA.Paths.Utilities "ConfigurationValidation.psm1"
- $validationResult = Test-SuiteConfigurationAgainstSchema -ConfigurationObject $global:MandA.Config -SchemaPath $global:MandA.Paths.ConfigSchema
- $ErrorActionPreference = $OriginalErrorActionPreference


### SCRIPT: Setup-AppRegistration.ps1  
ðŸ“ Path: `Scripts/Setup-AppRegistration.ps1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Write-EnhancedLog {
- function Write-ProgressHeader {
- function Write-OperationResult {
- function Start-OperationTimer {
- function Stop-OperationTimer {
- function Test-Prerequisites {
- function Initialize-RequiredModules {
- function Connect-EnhancedGraph {
- function Connect-EnhancedAzure {
- function Connect-EnhancedExchange {
- function New-EnhancedAppRegistration {
- function Use-ExistingAppRegistration {
- function Grant-EnhancedAdminConsent {
- function New-EnhancedClientSecret {
- function Get-InteractiveClientSecret {
- function Save-EnhancedCredentials {
- function Set-EnhancedRoleAssignments {
- function Set-ExchangeRoleAssignment {
ðŸ“¦ Variables Used:
- $envSetupScriptPath = Join-Path $PSScriptRoot "Set-SuiteEnvironment.ps1"
- $envSetupScriptPath = Join-Path $PSScriptRoot "Set-SuiteEnvironment.ps1"
- $LogPath = Join-Path $global:MandA.Paths.LogOutput "Setup-AppRegistration_$(Get-Date -Format 'yyyyMMddHHmmss').log"
- $EncryptedOutputPath = $global:MandA.Paths.CredentialFile
- $script:ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
- $script:SuiteRoot = Split-Path $script:ScriptDir -Parent
- $ModulePaths = @(
- $moduleLoadErrors = @()
- $moduleLoadErrors += "Failed to import $ModulePath_item $($_.Exception.Message)"
- $moduleLoadErrors += "Module not found: $ModulePath_item"
- $ErrorActionPreference = "Stop"
- $VerbosePreference = "SilentlyContinue"
- $ProgressPreference = "Continue"
- $script:ScriptInfo = @{
- $script:AppConfig = @{
- $script:ColorScheme = @{
- $script:ConnectionStatus = @{
- $script:Metrics = @{
- $timestamp = if (-not $NoTimestamp) { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] " } else { "" }
- $cleanedMessage = $Message -replace "[\r\n]+", " "
- $logMessage = "$timestamp[$Level] $cleanedMessage"
- $colorParams = if ($script:ColorScheme.ContainsKey($Level)) { $script:ColorScheme[$Level] } else { $script:ColorScheme["Info"] }
- $icon = switch ($Level) {
- $displayMessage = "$icon $logMessage"
- $separator = "=" * 90
- $icon = if ($Success) { "[OK]" } else { "[ERR]" }
- $level = if ($Success) { "SUCCESS" } else { "ERROR" }
- $durationText = if ($Duration) { " ($('{0:F2}' -f $Duration.TotalSeconds)s)" } else { "" }
- $message = "$Operation$durationText"
- $message += " - $Details"
- $script:Metrics.Operations[$OperationName].StartTime = Get-Date
- $endTime = Get-Date
- $duration = $endTime - $script:Metrics.Operations[$OperationName].StartTime
- $script:Metrics.Operations[$OperationName].Duration = $duration
- $script:Metrics.Operations[$OperationName].Success = $Success
- $issues = @(); $warnings = @()
- $psVersion = $PSVersionTable.PSVersion
- $requiredVersion = [version]$script:ScriptInfo.RequiredPSVersion
- $currentUserIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
- $principal = New-Object Security.Principal.WindowsPrincipal($currentUserIdentity)
- $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
- $warnings += "Not running as administrator. Some operations may require elevation"
- $connectivityTests = @(
- $connectionResults = @()
- $connection = Test-NetConnection -ComputerName $test_item.Host -Port $test_item.Port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction Stop
- $connectionResults += $true
- $issues += "Cannot connect to $($test_item.Service) ($($test_item.Host) port $($test_item.Port))"
- $connectionResults += $false
- $issues += "Network test failed for $($test_item.Service): $($_.Exception.Message)"
- $connectionResults += $false
- $successfulConnections = ($connectionResults | Where-Object { $_ }).Count
- $encryptedDir = Split-Path $EncryptedOutputPath -Parent
- $testFile_local = Join-Path $encryptedDir "write_test_$(Get-Random).tmp" # Renamed $testFile
- $installedModule = Get-Module -ListAvailable -Name $module_item -ErrorAction SilentlyContinue |
- $issues += "Required module '$module_item' not found. Install with: Install-Module $module_item -Scope CurrentUser"
- $OriginalWarningPreference = $WarningPreference
- $WarningPreference = 'SilentlyContinue'
- $loadedModules = Get-Module -Name "Az.*", "Microsoft.Graph.*" -ErrorAction SilentlyContinue
- $unloadCount = 0
- $totalModules = $script:ScriptInfo.Dependencies.Count; $processedModules = 0
- $installedModule = Get-Module -ListAvailable -Name $moduleName_local -ErrorAction SilentlyContinue |
- $installedModule = Get-Module -ListAvailable -Name $moduleName_local -ErrorAction SilentlyContinue |
- $latestInstalled = Get-Module -ListAvailable -Name $moduleName_local -ErrorAction SilentlyContinue |
- $WarningPreference = $OriginalWarningPreference
- $WarningPreference = $OriginalWarningPreference
- $maxRetries = 3; $retryDelay = 5
- $requiredScopes = @("Application.ReadWrite.All", "Directory.ReadWrite.All", "AppRoleAssignment.ReadWrite.All", "RoleManagement.ReadWrite.Directory", "Policy.Read.All")
- $existingContext = Get-MgContext -ErrorAction SilentlyContinue
- $script:ConnectionStatus.Graph.Connected = $true; $script:ConnectionStatus.Graph.Context = $existingContext
- $context = Get-MgContext -ErrorAction Stop
- $org = Get-MgOrganization -Top 1 -ErrorAction Stop
- $testApps = Get-MgApplication -Top 1 -ErrorAction Stop
- $script:ConnectionStatus.Graph.Connected = $true
- $script:ConnectionStatus.Graph.Context = $context
- $script:ConnectionStatus.Graph.LastError = $null
- $script:ConnectionStatus.Graph.RetryCount = $attempt
- $errorMessage = $_.Exception.Message
- $script:ConnectionStatus.Graph.LastError = $errorMessage
- $script:ConnectionStatus.Graph.RetryCount = $attempt
- $retryDelay += 2
- $maxRetries = 3; $retryDelay = 5
- $existingAzContext = Get-AzContext -ErrorAction SilentlyContinue # Renamed to avoid conflict
- $currentAzContext = Get-AzContext -ErrorAction Stop # Renamed
- $subscriptions = Get-AzSubscription -ErrorAction Stop
- $activeSubscriptions = $subscriptions | Where-Object { $_.State -eq "Enabled" }
- $disabledSubscriptions = $subscriptions | Where-Object { $_.State -ne "Enabled" }
- $script:ConnectionStatus.Azure.Connected = $true
- $script:ConnectionStatus.Azure.Context = $currentAzContext
- $script:ConnectionStatus.Azure.LastError = $null
- $script:ConnectionStatus.Azure.RetryCount = $attempt
- $errorMessage = $_.Exception.Message; Write-EnhancedLog "Azure connection attempt $attempt failed: $errorMessage" -Level ERROR
- $script:ConnectionStatus.Azure.LastError = $errorMessage
- $maxRetries = 3
- $retryDelay = 5
- $existingSession = Get-PSSession | Where-Object {
- $script:ConnectionStatus.Exchange.Connected = $true
- $script:ConnectionStatus.Exchange.Session = $existingSession
- $connectionParams = @{
- $connectionParams['ConnectionUri'] = $ExchangeConnectionUri
- $orgConfig = Get-OrganizationConfig -ErrorAction Stop
- $script:ConnectionStatus.Exchange.Connected = $true
- $script:ConnectionStatus.Exchange.LastError = $null
- $script:ConnectionStatus.Exchange.RetryCount = $attempt
- $errorMessage = $_.Exception.Message
- $script:ConnectionStatus.Exchange.LastError = $errorMessage
- $script:ConnectionStatus.Exchange.RetryCount = $attempt
- $retryDelay += 2
- $appName = $script:AppConfig.DisplayName
- $existingApp = Get-MgApplication -Filter "displayName eq '$appName'" -ErrorAction SilentlyContinue
- $graphSp = Get-MgServicePrincipal -Filter "AppId eq '00000003-0000-0000-c000-000000000000'" -ErrorAction Stop
- $resourceAccess = @(); $foundPermissions = @(); $missingPermissions = @()
- $totalPermissions = $script:AppConfig.RequiredGraphPermissions.Count; $processedPermissions = 0
- $permissionName = $permission_item.Key
- $appRole = $graphSp.AppRoles | Where-Object { $_.Value -eq $permissionName }
- $resourceAccess += @{
- $foundPermissions += $permissionName
- $missingPermissions += $permissionName
- $requiredResourceAccess = @( @{ ResourceAppId = "00000003-0000-0000-c000-000000000000"; ResourceAccess = $resourceAccess } )
- $appRegistration = New-MgApplication -DisplayName $appName -Description $script:AppConfig.Description -RequiredResourceAccess $requiredResourceAccess -ErrorAction Stop
- $app = Get-MgApplication -Filter "AppId eq '$ClientIdParam'" -ErrorAction Stop
- $servicePrincipal = New-MgServicePrincipal -AppId $AppRegistration.AppId -ErrorAction Stop
- $graphSp = Get-MgServicePrincipal -Filter "AppId eq '00000003-0000-0000-c000-000000000000'" -ErrorAction Stop
- $appSp = Get-MgServicePrincipal -Filter "AppId eq '$($AppRegistration.AppId)'" -ErrorAction Stop
- $grantedCount = 0
- $skippedCount = 0
- $failedCount = 0
- $totalPermissions = 0
- $totalPermissions = $AppRegistration.RequiredResourceAccess[0].ResourceAccess.Count
- $currentPermission = 0
- $permissionId = $access_item.Id
- $permissionName = $null
- $matchingRole = $graphSp.AppRoles | Where-Object { $_.Id -eq $permissionId }
- $permissionName = $matchingRole.Value
- $permissionName = "Unknown Permission ID: $permissionId"
- $existingAssignment = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $appSp.Id -ErrorAction SilentlyContinue |
- $clientSecretObj = $null # Initialize to ensure scope
- $secretDescription = "M&A Discovery Secret - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
- $secretEndDate = (Get-Date).AddYears($SecretValidityYears)
- $secretParams = @{
- $clientSecretObj = Add-MgApplicationPassword @secretParams -ErrorAction Stop
- $daysUntilExpiry = ($clientSecretObj.EndDateTime - (Get-Date)).Days
- $clientSecretSecure = Read-Host "Client Secret" -AsSecureString
- $clientSecretText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
- $mockSecret = [PSCustomObject]@{
- $credMgmtPath = Join-Path $script:SuiteRoot "Modules\Authentication\CredentialManagement.psm1"
- $configParam = @{
- $daysUntilExpiry = if ($ClientSecret.EndDateTime) {
- $saveResult = Set-SecureCredentials `
- $fileInfo = Get-Item $EncryptedOutputPath
- $testRead = Get-SecureCredentials -Configuration $configParam
- $azureRoleDetails = @{ AssignedCount = 0; SkippedCount = 0; FailedCount = 0; FailedSubscriptions = @(); SuccessfulSubscriptions = @() }
- $enabledSubscriptions = @() # Initialize $enabledSubscriptions
- $adRoleResults = @{ Assigned = 0; Skipped = 0; Failed = 0 }
- $roleDefinition = Get-MgDirectoryRole -Filter "DisplayName eq '$roleName_item'" -ErrorAction SilentlyContinue
- $roleTemplate = Get-MgDirectoryRoleTemplate -Filter "DisplayName eq '$roleName_item'" -ErrorAction Stop
- $originalWarning = $WarningPreference; $WarningPreference = "SilentlyContinue"
- $subscriptions = Get-AzSubscription -ErrorAction Stop
- $enabledSubscriptions = $subscriptions | Where-Object { $_.State -eq "Enabled" }
- $disabledSubscriptions = $subscriptions | Where-Object { $_.State -ne "Enabled" }
- $subscription_item = $enabledSubscriptions[$i] # Renamed $subscription
- $subscriptionName = $subscription_item.Name
- $subscriptionId = $subscription_item.Id
- $scope = "/subscriptions/$subscriptionId"
- $contextResult = Set-AzContext -SubscriptionId $subscriptionId -ErrorAction Stop
- $existingRoles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope $scope -ErrorAction SilentlyContinue
- $hasRole = $existingRoles | Where-Object { $_.RoleDefinitionName -eq $roleName_sub }
- $roleAssignmentParams = @{
- $roleAssignment = New-AzRoleAssignment @roleAssignmentParams
- $errorMsg = $_.Exception.Message
- $azureRoleDetails.FailedSubscriptions += "$subscriptionName ($roleName_sub): $errorMsg"
- $finalRoles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope $scope -ErrorAction SilentlyContinue
- $readerRole = $finalRoles | Where-Object { $_.RoleDefinitionName -eq "Reader" }
- $azureRoleDetails.SuccessfulSubscriptions += $subscriptionName
- $errorMsg = $_.Exception.Message
- $azureRoleDetails.FailedSubscriptions += "$subscriptionName (Access Error): $errorMsg"
- $WarningPreference = $originalWarning
- $script:ConnectionStatus.Azure.RoleAssignmentDetails = $azureRoleDetails
- $exchangeRoleResults = @{
- $role = Get-RoleGroup -Identity $roleName_exch -ErrorAction SilentlyContinue
- $currentMembers = Get-RoleGroupMember -Identity $roleName_exch -ErrorAction SilentlyContinue
- $isAssigned = $currentMembers | Where-Object { $_.Identity -eq $AppId -or $_.Identity -eq $ServicePrincipalId }
- $verifyMembers = Get-RoleGroupMember -Identity $roleName_exch -ErrorAction SilentlyContinue
- $verified = $verifyMembers | Where-Object { $_.Identity -eq $AppId -or $_.Identity -eq $ServicePrincipalId }
- $script:ConnectionStatus.Exchange.RoleAssignmentSuccess = ($exchangeRoleResults.Assigned -gt 0) -or ($exchangeRoleResults.Skipped -gt 0)
- $script:ConnectionStatus.Exchange.RoleAssignmentDetails = $exchangeRoleResults
- $script:Metrics.StartTime = Get-Date
- $logDir = Split-Path $LogPath -Parent
- $headerContent = @"
- $GlobalTenantId = $null # Use a specific variable for tenant ID in this script
- $mgContext = Get-MgContext # Get context after successful connection
- $GlobalTenantId = $mgContext.TenantId
- $tenantInfo = Get-MgOrganization | Select-Object -First 1
- $appRegistration = $null
- $appRegistration = Use-ExistingAppRegistration -ClientIdParam $ExistingClientId -TenantIdParam $GlobalTenantId
- $appRegistration = New-EnhancedAppRegistration
- $servicePrincipal = Grant-EnhancedAdminConsent -AppRegistration $appRegistration
- $clientSecretObj = $null # Renamed to avoid confusion with $ClientSecret parameter in Save-EnhancedCredentials
- $clientSecretObj = Get-InteractiveClientSecret -AppRegistration $appRegistration
- $clientSecretObj = New-EnhancedClientSecret -AppRegistration $appRegistration
- $script:Metrics.EndTime = Get-Date
- $totalDuration = $script:Metrics.EndTime - $script:Metrics.StartTime
- $successfulOperations = ($script:Metrics.Operations.Values | Where-Object { $_.Success }).Count
- $totalOperations = $script:Metrics.Operations.Count
- $roleDetails = $script:ConnectionStatus.Azure.RoleAssignmentDetails
- $service_item = $_ # Renamed $service
- $metricsFile = $LogPath -replace '\.log$', '_metrics.json'


### SCRIPT: Setup-AppRegistrationOnce.ps1  
ðŸ“ Path: `Scripts/Setup-AppRegistrationOnce.ps1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION | .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Write-EnhancedLog {
- function Write-ProgressHeader {
- function Write-OperationResult {
- function Start-OperationTimer {
- function Stop-OperationTimer {
- function Test-Prerequisites {
- function Initialize-RequiredModules {
- function Connect-EnhancedGraph {
- function Connect-EnhancedAzure {
- function Connect-EnhancedExchange {
- function New-EnhancedAppRegistration {
- function Grant-EnhancedAdminConsent {
- function Set-EnhancedRoleAssignments {
- function Set-ExchangeRoleAssignment {
- function New-EnhancedClientSecret {
- function Save-EnhancedCredentials {
ðŸ“¦ Variables Used:
- $ErrorActionPreference = "Stop"
- $VerbosePreference = "SilentlyContinue"
- $ProgressPreference = "Continue"
- $script:ScriptInfo = @{
- $script:AppConfig = @{
- $script:ColorScheme = @{
- $script:ConnectionStatus = @{
- $script:Metrics = @{
- $timestamp = if (-not $NoTimestamp) { "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] " } else { "" }
- $cleanedMessage = $Message -replace "[\r\n]+", " "
- $logMessage = "$timestamp[$Level] $cleanedMessage"
- $colorParams = switch ($Level) {
- $icon = switch ($Level) {
- $displayMessage = "$icon $logMessage"
- $separator = "â•" * 90
- $icon = if ($Success) { "[OK]" } else { "[X]" }
- $level = if ($Success) { "SUCCESS" } else { "ERROR" }
- $durationText = if ($Duration) { " ([TIME] $('{0:F2}' -f $Duration.TotalSeconds)s)" } else { "" }
- $message = "$Operation$durationText"
- $message += " - $Details"
- $script:Metrics.Operations[$OperationName] = @{
- $script:Metrics.Operations[$OperationName].StartTime = Get-Date
- $endTime = Get-Date
- $duration = $endTime - $script:Metrics.Operations[$OperationName].StartTime
- $script:Metrics.Operations[$OperationName].Duration = $duration
- $script:Metrics.Operations[$OperationName].Success = $Success
- $issues = @()
- $warnings = @()
- $psVersion = $PSVersionTable.PSVersion
- $requiredVersion = [version]$script:ScriptInfo.RequiredPSVersion
- $issues += "PowerShell $($script:ScriptInfo.RequiredPSVersion)+ required. Current: $psVersion"
- $warnings += "PowerShell 5.1 detected. PowerShell 7+ recommended for enhanced performance and compatibility"
- $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
- $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
- $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
- $warnings += "Not running as administrator. Some operations may require elevation"
- $connectivityTests = @(
- $connectionResults = @()
- $connection = Test-NetConnection -ComputerName $test.Host -Port $test.Port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction Stop
- $connectionResults += $true
- $issues += "Cannot connect to $($test.Service) ($($test.Host):$($test.Port))"
- $connectionResults += $false
- $issues += "Network test failed for $($test.Service): $($_.Exception.Message)"
- $connectionResults += $false
- $successfulConnections = ($connectionResults | Where-Object { $_ }).Count
- $availableMemory = [math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB, 2)
- $minMemoryGB = 2
- $warnings += "Low available memory: $($availableMemory)GB. Minimum recommended: $($minMemoryGB)GB"
- $encryptedDir = Split-Path $EncryptedOutputPath -Parent
- $drive = if (Test-Path $encryptedDir -ErrorAction SilentlyContinue) {
- $freeSpace = [math]::Round((Get-CimInstance Win32_LogicalDisk | Where-Object DeviceID -eq $drive.Root.Name.TrimEnd('\')).FreeSpace / 1GB, 2)
- $minSpaceGB = 0.5
- $issues += "Insufficient disk space on $($drive.Root.Name). Available: $($freeSpace)GB, Required: $($minSpaceGB)GB"
- $issues += "Cannot create output directory '$encryptedDir': $($_.Exception.Message)"
- $testFile = Join-Path $encryptedDir "write_test_$(Get-Random).tmp"
- $issues += "Output directory exists but lacks write permissions: $encryptedDir"
- $installedModule = Get-Module -ListAvailable -Name $module -ErrorAction SilentlyContinue |
- $issues += "Required module '$module' not found. Install with: Install-Module $module -Scope CurrentUser"
- $loadedModules = Get-Module -Name "Az.*", "Microsoft.Graph.*", "ExchangeOnlineManagement" -ErrorAction SilentlyContinue
- $unloadCount = 0
- $totalModules = $script:ScriptInfo.Dependencies.Count
- $processedModules = 0
- $installedModule = Get-Module -ListAvailable -Name $moduleName -ErrorAction SilentlyContinue |
- $minVersion = $script:ScriptInfo.MinimumModuleVersions[$moduleName]
- $installedVersion = $installedModule.Version.ToString()
- $minVersion = $script:ScriptInfo.MinimumModuleVersions[$moduleName]
- $latestModule = Find-Module -Name $moduleName -Repository PSGallery -ErrorAction Stop
- $latestVersion = $latestModule.Version.ToString()
- $latestInstalled = Get-Module -ListAvailable -Name $moduleName -ErrorAction SilentlyContinue |
- $maxRetries = 3
- $retryDelay = 5
- $requiredScopes = @(
- $existingContext = Get-MgContext -ErrorAction SilentlyContinue
- $hasAllScopes = $requiredScopes | ForEach-Object { $_ -in $existingContext.Scopes } | Where-Object { $_ -eq $false } | Measure-Object | Select-Object -ExpandProperty Count
- $script:ConnectionStatus.Graph.Connected = $true
- $script:ConnectionStatus.Graph.Context = $existingContext
- $connectParams = @{
- $connectParams['TenantId'] = $TenantId
- $connectParams['UseDeviceCode'] = $true
- $errorMessage = $_.Exception.Message
- $connectParams['UseDeviceCode'] = $true
- $context = Get-MgContext -ErrorAction Stop
- $org = Get-MgOrganization -Top 1 -ErrorAction Stop
- $testApps = Get-MgApplication -Top 1 -ErrorAction Stop
- $script:ConnectionStatus.Graph.Connected = $true
- $script:ConnectionStatus.Graph.Context = $context
- $script:ConnectionStatus.Graph.LastError = $null
- $script:ConnectionStatus.Graph.RetryCount = $attempt
- $errorMessage = $_.Exception.Message
- $errorMessage = "Browser authentication failed. This typically occurs due to browser pop-up blockers, expired sessions, or MFA issues."
- $errorCode = $matches[1]
- $script:ConnectionStatus.Graph.LastError = $errorMessage
- $script:ConnectionStatus.Graph.RetryCount = $attempt
- $retryDelay += 2  # Exponential backoff
- $maxRetries = 3
- $retryDelay = 5
- $existingContext = Get-AzContext -ErrorAction SilentlyContinue
- $subscriptions = Get-AzSubscription -ErrorAction Stop
- $script:ConnectionStatus.Azure.Connected = $true
- $script:ConnectionStatus.Azure.Context = $existingContext
- $result = Connect-AzAccount -Scope CurrentUser -ErrorAction Stop
- $result = Connect-AzAccount -ErrorAction Stop
- $context = Get-AzContext -ErrorAction Stop
- $subscriptions = Get-AzSubscription -ErrorAction Stop
- $activeSubscriptions = $subscriptions | Where-Object { $_.State -eq "Enabled" }
- $disabledSubscriptions = $subscriptions | Where-Object { $_.State -ne "Enabled" }
- $script:ConnectionStatus.Azure.Connected = $true
- $script:ConnectionStatus.Azure.Context = $context
- $script:ConnectionStatus.Azure.LastError = $null
- $script:ConnectionStatus.Azure.RetryCount = $attempt
- $errorMessage = $_.Exception.Message
- $script:ConnectionStatus.Azure.LastError = $errorMessage
- $script:ConnectionStatus.Azure.RetryCount = $attempt
- $retryDelay += 2
- $maxRetries = 3
- $retryDelay = 5
- $existingSession = Get-PSSession | Where-Object {
- $script:ConnectionStatus.Exchange.Connected = $true
- $script:ConnectionStatus.Exchange.Session = $existingSession
- $connectionParams = @{
- $connectionParams['ConnectionUri'] = $ExchangeConnectionUri
- $orgConfig = Get-OrganizationConfig -ErrorAction Stop
- $script:ConnectionStatus.Exchange.Connected = $true
- $script:ConnectionStatus.Exchange.LastError = $null
- $script:ConnectionStatus.Exchange.RetryCount = $attempt
- $errorMessage = $_.Exception.Message
- $script:ConnectionStatus.Exchange.LastError = $errorMessage
- $script:ConnectionStatus.Exchange.RetryCount = $attempt
- $retryDelay += 2
- $existingApp = Get-MgApplication -Filter "displayName eq '$appName'" -ErrorAction SilentlyContinue
- $graphSp = Get-MgServicePrincipal -Filter "AppId eq '00000003-0000-0000-c000-000000000000'" -ErrorAction Stop
- $resourceAccess = @()
- $foundPermissions = @()
- $missingPermissions = @()
- $totalPermissions = $script:AppConfig.RequiredGraphPermissions.Count
- $processedPermissions = 0
- $permissionName = $permission.Key
- $appRole = $graphSp.AppRoles | Where-Object { $_.Value -eq $permissionName }
- $resourceAccess += @{
- $foundPermissions += $permissionName
- $missingPermissions += $permissionName
- $requiredResourceAccess = @(
- $appParams = @{
- $appRegistration = New-MgApplication @appParams -ErrorAction Stop
- $servicePrincipal = New-MgServicePrincipal -AppId $AppRegistration.AppId -ErrorAction Stop
- $graphSp = Get-MgServicePrincipal -Filter "AppId eq '00000003-0000-0000-c000-000000000000'" -ErrorAction Stop
- $appSp = Get-MgServicePrincipal -Filter "AppId eq '$($AppRegistration.AppId)'" -ErrorAction Stop
- $grantedCount = 0
- $skippedCount = 0
- $failedCount = 0
- $totalPermissions = $AppRegistration.RequiredResourceAccess[0].ResourceAccess.Count
- $currentPermission = 0
- $permissionId = $resourceAccess.Id
- $permissionName = $null
- $matchingRole = $graphSp.AppRoles | Where-Object { $_.Id -eq $permissionId }
- $permissionName = $matchingRole.Value
- $permissionName = "Unknown Permission"
- $existingAssignment = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $appSp.Id -ErrorAction SilentlyContinue |
- $assignmentParams = @{
- $azureRoleAssignmentSuccess = $false
- $azureRoleDetails = @{
- $adRoleResults = @{
- $roleDefinition = Get-MgDirectoryRole -Filter "DisplayName eq '$roleName'" -ErrorAction SilentlyContinue
- $roleTemplate = Get-MgDirectoryRoleTemplate -Filter "DisplayName eq '$roleName'" -ErrorAction Stop
- $roleDefinition = New-MgDirectoryRole -RoleTemplateId $roleTemplate.Id -ErrorAction Stop
- $existingAssignment = Get-MgDirectoryRoleMember -DirectoryRoleId $roleDefinition.Id -ErrorAction SilentlyContinue |
- $memberRef = "https://graph.microsoft.com/v1.0/directoryObjects/$($ServicePrincipal.Id)"
- $originalWarning = $WarningPreference
- $WarningPreference = "SilentlyContinue"
- $subscriptions = Get-AzSubscription -ErrorAction Stop
- $azureRoleAssignmentSuccess = $false
- $enabledSubscriptions = $subscriptions | Where-Object { $_.State -eq "Enabled" }
- $disabledSubscriptions = $subscriptions | Where-Object { $_.State -ne "Enabled" }
- $sub = $enabledSubscriptions[$i]
- $subscription = $enabledSubscriptions[$i]
- $subscriptionName = $subscription.Name
- $subscriptionId = $subscription.Id
- $scope = "/subscriptions/$subscriptionId"
- $contextResult = Set-AzContext -SubscriptionId $subscriptionId -ErrorAction Stop
- $existingRoles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope $scope -ErrorAction SilentlyContinue
- $hasRole = $existingRoles | Where-Object { $_.RoleDefinitionName -eq $roleName }
- $roleAssignmentParams = @{
- $roleAssignment = New-AzRoleAssignment @roleAssignmentParams
- $errorMsg = $_.Exception.Message
- $azureRoleDetails.FailedSubscriptions += "$subscriptionName ($roleName): $errorMsg"
- $finalRoles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope $scope -ErrorAction SilentlyContinue
- $readerRole = $finalRoles | Where-Object { $_.RoleDefinitionName -eq "Reader" }
- $azureRoleDetails.SuccessfulSubscriptions += $subscriptionName
- $errorMsg = $_.Exception.Message
- $azureRoleDetails.FailedSubscriptions += "$subscriptionName (Access Error): $errorMsg"
- $totalVerified = 0
- $subscription = $enabledSubscriptions | Where-Object { $_.Name -eq $subscriptionName }
- $roles = Get-AzRoleAssignment -ObjectId $ServicePrincipal.Id -Scope "/subscriptions/$($subscription.Id)" -ErrorAction SilentlyContinue
- $readerRole = $roles | Where-Object { $_.RoleDefinitionName -eq "Reader" }
- $azureRoleAssignmentSuccess = ($totalVerified -gt 0) -or (($azureRoleDetails.AssignedCount + $azureRoleDetails.SkippedCount) -gt 0)
- $azureRoleAssignmentSuccess = $false
- $WarningPreference = $originalWarning
- $script:ConnectionStatus.Azure.RoleAssignmentSuccess = $azureRoleAssignmentSuccess
- $script:ConnectionStatus.Azure.RoleAssignmentDetails = $azureRoleDetails
- $exchangeRoleResults = @{
- $role = Get-RoleGroup -Identity $roleName -ErrorAction SilentlyContinue
- $currentMembers = Get-RoleGroupMember -Identity $roleName -ErrorAction SilentlyContinue
- $isAssigned = $currentMembers | Where-Object { $_.Identity -eq $AppId -or $_.Identity -eq $ServicePrincipalId }
- $verifyMembers = Get-RoleGroupMember -Identity $roleName -ErrorAction SilentlyContinue
- $verified = $verifyMembers | Where-Object { $_.Identity -eq $AppId -or $_.Identity -eq $ServicePrincipalId }
- $script:ConnectionStatus.Exchange.RoleAssignmentSuccess = ($exchangeRoleResults.Assigned -gt 0) -or ($exchangeRoleResults.Skipped -gt 0)
- $script:ConnectionStatus.Exchange.RoleAssignmentDetails = $exchangeRoleResults
- $secretDescription = "M&A Discovery Secret - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
- $secretEndDate = (Get-Date).AddYears($SecretValidityYears)
- $secretParams = @{
- $clientSecret = Add-MgApplicationPassword @secretParams -ErrorAction Stop
- $daysUntilExpiry = ($secretEndDate - (Get-Date)).Days
- $credentialData = @{
- $jsonData = $credentialData | ConvertTo-Json -Depth 4
- $secureString = ConvertTo-SecureString -String $jsonData -AsPlainText -Force
- $encryptedData = $secureString | ConvertFrom-SecureString
- $encryptedDir = Split-Path $EncryptedOutputPath -Parent
- $fileSize = [math]::Round((Get-Item $EncryptedOutputPath).Length / 1KB, 2)
- $acl = Get-Acl $EncryptedOutputPath
- $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
- $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
- $systemRule = New-Object System.Security.AccessControl.FileSystemAccessRule(
- $backupPath = $null
- $backupDir = Join-Path $encryptedDir "Backups"
- $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
- $backupPath = Join-Path $backupDir "credentials_backup_$timestamp.config"
- $backupFiles = Get-ChildItem -Path $backupDir -Filter "credentials_backup_*.config" | Sort-Object CreationTime -Descending
- $summaryData = @{
- $summaryPath = Join-Path $encryptedDir "credential_summary.json"
- $script:Metrics.StartTime = Get-Date
- $logDir = Split-Path $LogPath -Parent
- $headerContent = @"
- $azureConnected = $false
- $azureConnected = Connect-EnhancedAzure
- $context = Get-MgContext
- $tenantId = $context.TenantId
- $tenantInfo = Get-MgOrganization | Select-Object -First 1
- $appRegistration = New-EnhancedAppRegistration
- $servicePrincipal = Grant-EnhancedAdminConsent -AppRegistration $appRegistration
- $clientSecret = New-EnhancedClientSecret -AppRegistration $appRegistration
- $script:Metrics.EndTime = Get-Date
- $totalDuration = $script:Metrics.EndTime - $script:Metrics.StartTime
- $successfulOperations = ($script:Metrics.Operations.Values | Where-Object { $_.Success }).Count
- $totalOperations = $script:Metrics.Operations.Count
- $roleDetails = $script:ConnectionStatus.Azure.RoleAssignmentDetails
- $service = $_
- $metricsPath = $LogPath -replace '\.txt$', '_metrics.json'


### SCRIPT: Test-AppRegistrationSyntax.ps1  
ðŸ“ Path: `Scripts/Test-AppRegistrationSyntax.ps1`  
ðŸ”§ Purpose: No synopsis found.  
ðŸ“Œ Declared Functions:

ðŸ“¦ Variables Used:
- $errors = $null
- $tokens = $null
- $ast = [System.Management.Automation.Language.Parser]::ParseFile("$PSScriptRoot\Setup-AppRegistration.ps1", [ref]$tokens, [ref]$errors)
- $scriptContent = Get-Content "$PSScriptRoot\Setup-AppRegistration.ps1" -Raw
- $functionMatches = [regex]::Matches($scriptContent, 'function\s+([A-Za-z0-9-_]+)')


### SCRIPT: Test-Credentials.ps1  
ðŸ“ Path: `Scripts/Test-Credentials.ps1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:

ðŸ“¦ Variables Used:
- $scriptRoot = Split-Path $PSScriptRoot -Parent
- $testData = @{
- $data = Read-CredentialFile -Path $CredentialFile
- $fileInfo = Get-Item $CredentialFile
- $content = Get-Content $CredentialFile -Raw
- $secureString = ConvertTo-SecureString -String $content.Trim() -ErrorAction Stop
- $plainText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
- $data = $plainText | ConvertFrom-Json
- $hashtable = @{}
- $hashtable[$_.Name] = $_.Value


### SCRIPT: Validate-Installation.ps1  
ðŸ“ Path: `Scripts/Validate-Installation.ps1`  
ðŸ”§ Purpose: .SYNOPSIS | .DESCRIPTION  
ðŸ“Œ Declared Functions:
- function Write-ValidationMessage {
- function Write-ValidationResult {
- function Test-SuiteFileStructure {
- function Test-PowerShellVersionCheck { # Renamed to avoid conflict
- function Test-RequiredModulesCheck { # Renamed
- function Test-ConfigurationValues {
- function Test-NetworkConnectivityEndpoints {
ðŸ“¦ Variables Used:
- $envSetupScript = Join-Path $PSScriptRoot "Set-SuiteEnvironment.ps1"
- $status = if ($Passed) { "PASS" } else { "FAIL" }
- $color = if ($Passed) { "Green" } else { "Red" }
- $Global:ValidationOverallSuccess = $true # Used to track overall status
- $allExist = $true
- $requiredPaths = @(
- $pathValue = $pathKey # If it's already a path string
- $isDir = ($pathKey -in $global:MandA.Paths.SuiteRoot, $global:MandA.Paths.Core, $global:MandA.Paths.Modules, $global:MandA.Paths.Utilities, $global:MandA.Paths.Scripts, $global:MandA.Paths.Configuration)
- $pathType = if ($isDir) { "Container" } else { "Leaf" }
- $currentTestPassed = Test-Path $pathValue -PathType $pathType
- $allExist = $false
- $version = $PSVersionTable.PSVersion
- $minMajor = 5
- $minMinor = 1
- $isValid = ($version.Major -gt $minMajor) -or ($version.Major -eq $minMajor -and $version.Minor -ge $minMinor)
- $Global:ValidationOverallSuccess = $false
- $moduleCheckScript = $global:MandA.Paths.ModuleCheckScript
- $Global:ValidationOverallSuccess = $false
- $Global:ValidationOverallSuccess = $false
- $Global:ValidationOverallSuccess = $false
- $config = $global:MandA.Config
- $allValid = $true
- $outputPath = $global:MandA.Paths.RawDataOutput # Use the resolved path
- $testFile = Join-Path $outputPath "validation_write_test.tmp"
- $canWrite = $false
- $canWrite = $true
- $allValid = $false
- $dc = $config.environment.domainController
- $dcReachable = Test-NetConnection -ComputerName $dc -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
- $allValid = $false
- $gc = $config.environment.globalCatalog
- $gcReachable = Test-NetConnection -ComputerName $gc -Port 3268 -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
- $allValid = $false
- $validLogLevels = @("DEBUG", "INFO", "WARN", "ERROR", "SUCCESS", "HEADER", "PROGRESS")
- $logLevel = $config.environment.logLevel
- $allValid = $false
- $credPath = $global:MandA.Paths.CredentialFile
- $credDir = Split-Path $credPath
- $allValid = $false
- $schemaResult = Test-SuiteConfigurationAgainstSchema -ConfigurationObject $config -SchemaPath $global:MandA.Paths.ConfigSchema
- $allValid = $false
- $allConnected = $true
- $endpoints = @(
- $isConnected = Test-NetConnection -ComputerName $endpoint.Host -Port $endpoint.Port -InformationLevel Quiet -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
- $allConnected = $false


MODULE: DiscoveryModuleBase.psm1
ðŸ“ Path: Modules/Discovery/DiscoveryModuleBase.psm1
ðŸ”§ Purpose: Base module providing common functionality for all discovery modules | Provides standardized interfaces, error handling, retry logic, and performance tracking
ðŸ“Œ Declared Functions:

function Invoke-DiscoveryWithRetry {
function Test-RetryableError {
function Calculate-BackoffDelay {
function Invoke-BaseDiscovery {
function Invoke-ProgressAwareBatch {
function Test-DiscoveryPrerequisites {
function Get-RequiredConfiguration {
function Get-ExistingDiscoveryData {
function Test-DiscoveryDataQuality {
function Get-DataValidationRules {
function Export-DiscoveryData {
ðŸ“¦ Variables Used:
result=[DiscoveryResult]::new(result = [DiscoveryResult]::new(
result=[DiscoveryResult]::new(ModuleName)

$performanceTracker = [DiscoveryPerformanceTracker]::new()
$progressWrapper = {
$originalWriteLog = Get-Command Write-MandALog -ErrorAction SilentlyContinue
$discoveryData = & $progressWrapper -Script $DiscoveryScript -ModName $ModuleName -Ctx $Context
$total = $Items.Count
$processed = 0
$results = @()
$requiredConfigs = Get-RequiredConfiguration -ModuleName $ModuleName
$value = $Configuration
$pathParts = $configPath.Split('.')
$configMap = @{
$fileMap = @{
expectedFiles = $fileMap[
ModuleName]

$existingData = @{}
$allFilesExist = $true
$filePath = Join-Path $OutputPath $fileName
$data = Import-Csv -Path $filePath -ErrorAction Stop
$warnings = @()
$validationRules = Get-DataValidationRules -ModuleName $ModuleName
$sampleSize = [math]::Min(100, $Data.Count)
$sample = $Data | Select-Object -First $sampleSize
$uniqueIds = $Data | Select-Object -ExpandProperty $validationRules.UniqueIdField -Unique
$duplicateCount = $Data.Count - $uniqueIds.Count
$rules = @{
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$enrichedData = $Data | ForEach-Object {
fileName = $FileMap[
key]

$filePath = Join-Path $OutputPath $fileName
$fileData = $enrichedData | Where-Object { $_._DataType -eq $key }
fileName="fileName = "
fileName="ModuleName.csv"

$filePath = Join-Path $OutputPath $fileName
$attempt = 0
$lastError = $null
$result = & $ScriptBlock
$isRetryable = Test-RetryableError -Exception $_.Exception
$delay = Calculate-BackoffDelay -Attempt $attempt -InitialDelay $InitialDelaySeconds -Exception $_.Exception
$retryableStatusCodes = @(408, 429, 500, 502, 503, 504)
$retryableTypes = @(
$exceptionType = $Exception.GetType().FullName
$retryableMessages = @('timeout', 'temporary', 'transient', 'throttl', 'rate limit', 'busy', 'unavailable')
$message = $Exception.Message.ToLower()
$retryAfter = $Exception.Response.Headers.RetryAfter
$exponentialDelay = $InitialDelay * [math]::Pow(2, $Attempt - 1)
jitter=Getâˆ’Randomâˆ’Minimum0âˆ’Maximum(jitter = Get-Random -Minimum 0 -Maximum (
jitter=Getâˆ’Randomâˆ’Minimum0âˆ’Maximum(exponentialDelay * 0.1)


MODULE: ExchangeDiscovery.psm1
ðŸ“ Path: Modules/Discovery/ExchangeDiscovery.psm1
ðŸ”§ Purpose: Exchange Online discovery for M&A Discovery Suite | Discovers Exchange Online mailboxes, distribution groups, permissions, and configurations
ðŸ“Œ Declared Functions:

function Invoke-ExchangeDiscovery {
function Get-ExchangeMailboxes {
function Get-ExchangeMailboxStatistics {
function Get-ExchangeDistributionGroups {
function Get-ExchangeMailSecurityGroups {
function Get-ExchangeMailboxPermissions {
function Get-ExchangeSendAsPermissions {
function Get-ExchangeSendOnBehalfPermissions {
function Get-ExchangeMailFlowRules {
function Get-ExchangeRetentionPolicies {
ðŸ“¦ Variables Used:
$outputPath = $Configuration.environment.outputPath
$rawPath = Join-Path $outputPath "Raw"
$discoveryResults = @{}
$testCmd = Get-Command Get-Mailbox -ErrorAction Stop
$discoveryResults.Mailboxes = Get-ExchangeMailboxes -OutputPath $rawPath -Configuration $Configuration
$discoveryResults.MailboxStats = Get-ExchangeMailboxStatistics -OutputPath $rawPath -Configuration $Configuration -Mailboxes $discoveryResults.Mailboxes
$discoveryResults.DistributionGroups = Get-ExchangeDistributionGroups -OutputPath $rawPath -Configuration $Configuration
$discoveryResults.MailSecurityGroups = Get-ExchangeMailSecurityGroups -OutputPath $rawPath -Configuration $Configuration
$discoveryResults.MailboxPermissions = Get-ExchangeMailboxPermissions -OutputPath $rawPath -Configuration $Configuration -Mailboxes $discoveryResults.Mailboxes
$discoveryResults.SendAsPermissions = Get-ExchangeSendAsPermissions -OutputPath $rawPath -Configuration $Configuration
$discoveryResults.SendOnBehalfPermissions = Get-ExchangeSendOnBehalfPermissions -OutputPath $rawPath -Configuration $Configuration -Mailboxes $discoveryResults.Mailboxes
$discoveryResults.MailFlowRules = Get-ExchangeMailFlowRules -OutputPath $rawPath -Configuration $Configuration
$discoveryResults.RetentionPolicies = Get-ExchangeRetentionPolicies -OutputPath $rawPath -Configuration $Configuration
$outputFile = Join-Path $OutputPath "ExchangeMailboxes.csv"
$mailboxData = [System.Collections.Generic.List[PSCustomObject]]::new()
$mailboxes = @()
$resultSize = 1000
$resultPage = 1
results = Get-Mailbox -ResultSize $resultSize -IncludeInactiveMailbox:
($Configuration.exchangeOnline.includeSoftDeletedMailboxes)

$processedCount = 0
$statsData = [System.Collections.Generic.List[PSCustomObject]]::new()
$batchSize = $Configuration.exchangeOnline.mailboxStatsBatchSize
batches=[Math]::Ceiling(batches = [Math]::Ceiling(
batches=[Math]::Ceiling(Mailboxes.Count / $batchSize)

$startIndex = $i * $batchSize
endIndex=[Math]::Min(((endIndex = [Math]::Min(((
endIndex=[Math]::Min(((i + 1) * $batchSize) - 1, $Mailboxes.Count - 1)

batchMailboxes = $Mailboxes[
startIndex..$endIndex]

$stats = Get-MailboxStatistics -Identity $mailbox.Identity -ErrorAction Stop
$scopeStats = Get-DhcpServerv4ScopeStatistics -ComputerName $server.DnsName -ScopeId $scope.ScopeId -ErrorAction SilentlyContinue
$dgData = [System.Collections.Generic.List[PSCustomObject]]::new()
$distributionGroups = Get-DistributionGroup -ResultSize Unlimited
$members = Get-DistributionGroupMember -Identity $dg.Identity -ResultSize Unlimited
memberCount=(memberCount = (
memberCount=(members | Measure-Object).Count

$msgData = [System.Collections.Generic.List[PSCustomObject]]::new()
$mailSecurityGroups = Get-DistributionGroup -RecipientTypeDetails MailUniversalSecurityGroup -ResultSize Unlimited
$permData = [System.Collections.Generic.List[PSCustomObject]]::new()
$permissions = Get-MailboxPermission -Identity $mailbox.Identity
$sendAsData = [System.Collections.Generic.List[PSCustomObject]]::new()
$sendAsPerms = Get-RecipientPermission -ResultSize Unlimited
$sobData = [System.Collections.Generic.List[PSCustomObject]]::new()
$mailboxesWithSOB = $Mailboxes | Where-Object { $_.GrantSendOnBehalfTo }
$delegates = $mailbox.GrantSendOnBehalfTo -split ";"
$rulesData = [System.Collections.Generic.List[PSCustomObject]]::new()
$rules = Get-TransportRule
$policyData = [System.Collections.Generic.List[PSCustomObject]]::new()
$policies = Get-RetentionPolicy
$tags = Get-RetentionPolicyTag -Policy $policy.Identity

MODULE: GPODiscovery.psm1
ðŸ“ Path: Modules/Discovery/GPODiscovery.psm1
ðŸ”§ Purpose: Enhanced GPO discovery module with robust XML parsing and namespace handling | Handles Group Policy Object discovery with improved XML parsing, namespace resolution, and error handling
ðŸ“Œ Declared Functions:

function Export-DataToCSV {
function Get-GPOData {
function Get-GPOLinks {
function Get-GPOPermissions {
function Parse-GPOReport {
function Export-GPODataToCSV {
function Invoke-GPODiscovery {
ðŸ“¦ Variables Used:
$allGPOs = [System.Collections.Generic.List[PSCustomObject]]::new()
$allDriveMappings = [System.Collections.Generic.List[PSCustomObject]]::new()
$allPrinterMappings = [System.Collections.Generic.List[PSCustomObject]]::new()
$allFolderRedirections = [System.Collections.Generic.List[PSCustomObject]]::new()
$allLogonScripts = [System.Collections.Generic.List[PSCustomObject]]::new()
$allGPOLinks = [System.Collections.Generic.List[PSCustomObject]]::new()
$allGPOPermissions = [System.Collections.Generic.List[PSCustomObject]]::new()
$gpoReportsPath = Join-Path $OutputPath "GPOReports"
$configNC = ([ADSI]"LDAP://RootDSE").configurationNamingContext
subnetContainer=[ADSI]"LDAP://CN=Subnets,CN=Sites,subnetContainer = [ADSI]"LDAP://CN=Subnets,CN=Sites,
subnetContainer=[ADSI]"LDAP://CN=Subnets,CN=Sites,configNC"

searcher=Newâˆ’ObjectSystem.DirectoryServices.DirectorySearcher(searcher = New-Object System.DirectoryServices.DirectorySearcher(
searcher=Newâˆ’ObjectSystem.DirectoryServices.DirectorySearcher(subnetContainer)

$searcher.Filter = "(objectClass=subnet)"
$gpoParams = @{
$gpoParams.Server = $DomainController
$gpos = Get-GPO @gpoParams
$totalGPOs = $gpos.Count
$processedCount = 0
$successfullyProcessed = 0
$failedProcessing = 0
$gpoObject = [PSCustomObject]@{
$gpoLinks = Get-GPOLinks -GPO $gpo -DomainController $DomainController
$gpoPermissions = Get-GPOPermissions -GPO $gpo
reportPath = Join-Path $gpoReportsPath "
(gpo.Id)_
($gpo.DisplayName -replace '[\\/:*?"<>|]', '_').xml"

$gpoSettings = Parse-GPOReport -ReportPath $reportPath -GPO $gpo
$links = [System.Collections.Generic.List[PSCustomObject]]::new()
$domain = Get-ADDomain -Server $DomainController -ErrorAction Stop
searcher = [ADSISearcher]"(&(objectClass=organizationalUnit)(gPLink=*
($GPO.Id)*))"

searcher.SearchRoot=[ADSI]"LDAP://searcher.SearchRoot = [ADSI]"LDAP://
searcher.SearchRoot=[ADSI]"LDAP://($domain.DistinguishedName)"

$searcher.PageSize = 1000
$results = $searcher.FindAll()
$ou = $result.Properties
$domainObj = Get-ADObject -Identity $domain.DistinguishedName -Properties gPLink -Server $DomainController
$permissions = [System.Collections.Generic.List[PSCustomObject]]::new()
$gpoSecurity = $GPO.GetSecurityInfo()
$result = @{
$xmlReport = Get-Content $ReportPath -Raw
$driveMappings = $xmlReport.GPO.User.ExtensionData.Extension
$printerMappings = $xmlReport.GPO.User.ExtensionData.Extension
$folderRedirections = $xmlReport.GPO.User.ExtensionData.Extension
$scripts = $xmlReport.GPO.User.ExtensionData.Extension
$gpoOutputFile = Join-Path $OutputPath "GroupPolicies.csv"
$linksOutputFile = Join-Path $OutputPath "GroupPolicyLinks.csv"
$permsOutputFile = Join-Path $OutputPath "GroupPolicyPermissions.csv"
$driveOutputFile = Join-Path $OutputPath "GPODriveMappings.csv"
$printerOutputFile = Join-Path $OutputPath "GPOPrinterMappings.csv"
$folderOutputFile = Join-Path $OutputPath "GPOFolderRedirections.csv"
$scriptOutputFile = Join-Path $OutputPath "GPOLogonScripts.csv"
$domainController = $Configuration.environment.domainController
$domainController = (Get-ADDomainController -Discover -NextClosestSite).HostName
$gpoData = Get-GPOData -OutputPath $outputPath -DomainController $domainController

MODULE: NetworkInfrastructureDiscovery.psm1
ðŸ“ Path: Modules/Discovery/NetworkInfrastructureDiscovery.psm1
ðŸ”§ Purpose: Network Infrastructure discovery for M&A Discovery Suite | Discovers DHCP, DNS, and network configuration information
ðŸ“Œ Declared Functions:

function Invoke-NetworkInfrastructureDiscovery {
function Get-DHCPServersData {
function Get-DHCPScopesData {
function Get-DHCPReservationsData {
function Get-DHCPOptionsData {
function Get-DNSServersData {
function Get-DNSZonesData {
function Get-DNSRecordsData {
function Get-ADSubnetsData {
function Get-ADSitesData {
ðŸ“¦ Variables Used:
$discoveryResults = @{}
$discoveryResults.DHCPServers = Get-DHCPServersData -OutputPath $outputPath -Configuration $Configuration
$discoveryResults.DHCPScopes = Get-DHCPScopesData -OutputPath $outputPath -Configuration $Configuration
$discoveryResults.DHCPReservations = Get-DHCPReservationsData -OutputPath $outputPath -Configuration $Configuration
$discoveryResults.DHCPOptions = Get-DHCPOptionsData -OutputPath $outputPath -Configuration $Configuration
$discoveryResults.DNSServers = Get-DNSServersData -OutputPath $outputPath -Configuration $Configuration
$discoveryResults.DNSZones = Get-DNSZonesData -OutputPath $outputPath -Configuration $Configuration
$discoveryResults.DNSRecords = Get-DNSRecordsData -OutputPath $outputPath -Configuration $Configuration
$discoveryResults.Subnets = Get-ADSubnetsData -OutputPath $outputPath -Configuration $Configuration
$discoveryResults.Sites = Get-ADSitesData -OutputPath $outputPath -Configuration $Configuration
$outputFile = Join-Path $OutputPath "DHCPServers.csv"
$dhcpServers = [System.Collections.Generic.List[PSCustomObject]]::new()
$domain = [System.DirectoryServices.ActiveDirectory.Domain]::GetCurrentDomain()
$forest = $domain.Forest
$dhcpServerList = Get-DhcpServerInDC -ErrorAction Stop
$serverStats = Get-DhcpServerv4Statistics -ComputerName $server.DnsName -ErrorAction Stop
$serverVersion = Get-DhcpServerVersion -ComputerName $server.DnsName -ErrorAction Stop
$headers = [PSCustomObject]@{
$dhcpScopes = [System.Collections.Generic.List[PSCustomObject]]::new()
$dhcpServers = Get-DhcpServerInDC -ErrorAction SilentlyContinue
$scopes = Get-DhcpServerv4Scope -ComputerName $server.DnsName -ErrorAction Stop
$scopeStats = Get-DhcpServerv4ScopeStatistics -ComputerName $server.DnsName -ScopeId $scope.ScopeId -ErrorAction SilentlyContinue
$dhcpReservations = [System.Collections.Generic.List[PSCustomObject]]::new()
$reservations = Get-DhcpServerv4Reservation -ComputerName $server.DnsName -ScopeId $scope.ScopeId -ErrorAction Stop
$dhcpOptions = [System.Collections.Generic.List[PSCustomObject]]::new()
$serverOptions = Get-DhcpServerv4OptionValue -ComputerName $server.DnsName -All -ErrorAction Stop
$scopeOptions = Get-DhcpServerv4OptionValue -ComputerName $server.DnsName -ScopeId $scope.ScopeId -All -ErrorAction Stop
$dnsServers = [System.Collections.Generic.List[PSCustomObject]]::new()
$domainControllers = Get-ADDomainController -Filter * -ErrorAction Stop
$dnsService = Get-Service -ComputerName $dc.HostName -Name "DNS" -ErrorAction Stop
$dnsServerConfig = Get-DnsServer -ComputerName $dc.HostName -ErrorAction Stop
$dnsZones = [System.Collections.Generic.List[PSCustomObject]]::new()
$primaryDC = Get-ADDomainController -Discover -Service "PrimaryDC" -ErrorAction SilentlyContinue
dnsServer=if(dnsServer = if (
dnsServer=if(primaryDC) { $primaryDC.HostName } else { $env
:COMPUTERNAME }
$zones = Get-DnsServerZone -ComputerName $dnsServer -ErrorAction Stop
$dnsRecords = [System.Collections.Generic.List[PSCustomObject]]::new()
$importantRecordTypes = @("A", "AAAA", "CNAME", "MX", "SRV", "TXT")
$records = Get-DnsServerResourceRecord -ComputerName $dnsServer -ZoneName $zone.ZoneName -ErrorAction Stop
recordData=switch(recordData = switch (
recordData=switch(record.RecordType) {

$subnets = [System.Collections.Generic.List[PSCustomObject]]::new()
$configNC = ([ADSI]"LDAP://RootDSE").configurationNamingContext
subnetContainer=[ADSI]"LDAP://CN=Subnets,CN=Sites,subnetContainer = [ADSI]"LDAP://CN=Subnets,CN=Sites,
subnetContainer=[ADSI]"LDAP://CN=Subnets,CN=Sites,configNC"

searcher=Newâˆ’ObjectSystem.DirectoryServices.DirectorySearcher(searcher = New-Object System.DirectoryServices.DirectorySearcher(
searcher=Newâˆ’ObjectSystem.DirectoryServices.DirectorySearcher(subnetContainer)

$subnet = $result.Properties
$siteDN = $subnet["siteobject"][0]
siteName=if(siteName = if (
siteName=if(siteDN) {

$sites = [System.Collections.Generic.List[PSCustomObject]]::new()
$adSites = Get-ADReplicationSite -Filter * -Properties * -ErrorAction Stop
subnetCount=(Getâˆ’ADReplicationSubnetâˆ’Filter"Siteâˆ’eqâ€²subnetCount = (Get-ADReplicationSubnet -Filter "Site -eq '
subnetCount=(Getâˆ’ADReplicationSubnetâˆ’Filter"Siteâˆ’eqâ€²($site.DistinguishedName)'" -ErrorAction SilentlyContinue | Measure-Object).Count

$siteLinks = Get-ADReplicationSiteLink -Filter * -ErrorAction SilentlyContinue
siteDCs=Getâˆ’ADDomainControllerâˆ’Filter"Siteâˆ’eqâ€²siteDCs = Get-ADDomainController -Filter "Site -eq '
siteDCs=Getâˆ’ADDomainControllerâˆ’Filter"Siteâˆ’eqâ€²($site.Name)'" -ErrorAction SilentlyContinue


MODULE: SQLServerDiscoveryNoUse.psm1
ðŸ“ Path: Modules/Discovery/SQLServerDiscoveryNoUse.psm1
ðŸ”§ Purpose: SQL Server infrastructure discovery for M&A Discovery Suite | Discovers SQL Server instances, databases, configurations, and dependencies
ðŸ“Œ Declared Functions:

function Invoke-SQLServerDiscovery {
function Get-SQLServerInstances {
function Get-SQLInstancesFromSPN {
function Get-SQLInstancesFromPortScan {
function Get-SQLInstancesFromRegistry {
function Get-SQLInstanceDetails {
function Get-SQLDatabases {
function Get-LastBackupDate {
function Get-DatabaseOwner {
function Get-SQLAgentJobs {
function Get-ScheduleDescription {
function Get-JobLastRunDate {
function Get-JobLastRunStatus {
function Get-SQLLogins {
function Get-LoginServerRoles {
function Get-LoginDatabaseAccess {
function Get-SQLLinkedServers {
function Get-LinkedServerLogins {
function Get-SQLMaintenancePlans {
function Get-MaintenanceSubPlans {
function Get-SQLServerConfigurations {
function Export-DataToCSV {
function Import-DataFromCSV {
ðŸ“¦ Variables Used:
$outputPath = $Configuration.environment.outputPath
$discoveryResults = @{}
$discoveryResults.Instances = Get-SQLServerInstances -OutputPath $outputPath -Configuration $Configuration
$discoveryResults.Databases = Get-SQLDatabases -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
$discoveryResults.AgentJobs = Get-SQLAgentJobs -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
$discoveryResults.Logins = Get-SQLLogins -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
$discoveryResults.LinkedServers = Get-SQLLinkedServers -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
$discoveryResults.MaintenancePlans = Get-SQLMaintenancePlans -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
$discoveryResults.Configurations = Get-SQLServerConfigurations -OutputPath $outputPath -Configuration $Configuration -Instances $discoveryResults.Instances
$outputFile = Join-Path $OutputPath "SQLInstances.csv"
$instancesData = [System.Collections.Generic.List[PSCustomObject]]::new()
$spnInstances = Get-SQLInstancesFromSPN -Configuration $Configuration
$portInstances = Get-SQLInstancesFromPortScan -Configuration $Configuration
$registryInstances = Get-SQLInstancesFromRegistry -Configuration $Configuration
$allInstances = @()
$uniqueInstances = $allInstances | Sort-Object ServerName, InstanceName -Unique
$processedCount = 0
$instanceDetails = Get-SQLInstanceDetails -Instance $instance
$headers = [PSCustomObject]@{
$instances = @()
$spnFilter = "(servicePrincipalName=MSSQLSvc/*)"
$computers = Get-ADComputer -LDAPFilter $spnFilter -Properties servicePrincipalName -ErrorAction Stop
$serverName = $matches[1].Split('.')[0]
port=if(port = if (
port=if(matches[2]) { $matches[2] } else { "1433" }

instanceName=if(instanceName = if (
instanceName=if(port -eq "1433") { "MSSQLSERVER" } else { "UNKNOWN" }

$users = Get-ADUser -LDAPFilter $spnFilter -Properties servicePrincipalName -ErrorAction Stop
$servers = Get-ADComputer -Filter {OperatingSystem -like "Server"} -Properties DNSHostName -ErrorAction SilentlyContinue
$portsToCheck = @(1433, 1434)
$result = Test-NetConnection -ComputerName $server.DNSHostName -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
$regPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\Instance Names\SQL"
$instanceKeys = Get-ItemProperty $regPath -ErrorAction SilentlyContinue
$details = @{
connectionString=if(connectionString = if (
connectionString=if(Instance.InstanceName -eq "MSSQLSERVER") {

connection=Newâˆ’ObjectSystem.Data.SqlClient.SqlConnection(connection = New-Object System.Data.SqlClient.SqlConnection(
connection=Newâˆ’ObjectSystem.Data.SqlClient.SqlConnection(connectionString)

$versionQuery = "SELECT
command=Newâˆ’ObjectSystem.Data.SqlClient.SqlCommand(command = New-Object System.Data.SqlClient.SqlCommand(
command=Newâˆ’ObjectSystem.Data.SqlClient.SqlCommand(versionQuery, $connection)

$reader = $command.ExecuteReader()
$details.Version = $reader["Version"]
$details.Edition = $reader["Edition"]
$details.ProductLevel = $reader["ProductLevel"]
$details.Collation = $reader["Collation"]
details.IsClustered=[bool]details.IsClustered = [bool]
details.IsClustered=[bool]reader["IsClustered"]

details.IsAlwaysOn=[bool]details.IsAlwaysOn = [bool]
details.IsAlwaysOn=[bool]reader["IsAlwaysOn"]

$resourceQuery = "SELECT
$details.MaxMemoryMB = $reader["MaxMemory"]
$details.CPUCount = $reader["CPUCount"]
serviceName=if(serviceName = if (
serviceName=if(Instance.InstanceName -eq "MSSQLSERVER") {

service = Get-WmiObject -ComputerName $Instance.ServerName -Class Win32_Service -Filter "Name='
serviceName'" -ErrorAction SilentlyContinue

$details.Status = $service.State
$details.StartupType = $service.StartMode
$details.ServiceAccount = $service.StartName
$databasesData = [System.Collections.Generic.List[PSCustomObject]]::new()
instanceName=if(instanceName = if (
instanceName=if(instance.InstanceName -eq "MSSQLSERVER") {

$query = "SELECT
adapter=Newâˆ’ObjectSystem.Data.SqlClient.SqlDataAdapter(adapter = New-Object System.Data.SqlClient.SqlDataAdapter(
adapter=Newâˆ’ObjectSystem.Data.SqlClient.SqlDataAdapter(command)

$dataset = New-Object System.Data.DataSet
$jobsData = [System.Collections.Generic.List[PSCustomObject]]::new()
$loginsData = [System.Collections.Generic.List[PSCustomObject]]::new()
$linkedServersData = [System.Collections.Generic.List[PSCustomObject]]::new()
$maintenancePlansData = [System.Collections.Generic.List[PSCustomObject]]::new()
$checkQuery = "SELECT COUNT(*) FROM sys.tables WHERE name = 'sysssispackages'"
tableExists=[int]tableExists = [int]
tableExists=[int]command.ExecuteScalar() -gt 0

$configurationsData = [System.Collections.Generic.List[PSCustomObject]]::new()
$configItems = @(
$data = Import-Csv -Path $FilePath -Encoding UTF8