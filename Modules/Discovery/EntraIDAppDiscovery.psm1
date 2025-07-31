#Requires -Version 5.1
using namespace System.Collections.Generic

Set-StrictMode -Version 3.0

class EntraIDAppDiscovery : DiscoveryModuleBase {
    [string]$DiscoveryType = 'EntraIDApp'
    [string]$DataFileName = 'EntraIDApp_DiscoveryData.csv'
    
    hidden [object]$GraphClient
    hidden [hashtable]$DiscoveredApps = @{
        EnterpriseApps = @()
        AppRegistrations = @()
        ServicePrincipals = @()
        AppRoles = @()
        OAuth2Permissions = @()
        Certificates = @()
        Secrets = @()
    }
    
    EntraIDAppDiscovery() : base('EntraIDApp') {
        $this.RequiredModules = @('Microsoft.Graph.Authentication', 'Microsoft.Graph.Applications', 'Microsoft.Graph.Identity.DirectoryManagement')
        $this.SupportedAuthTypes = @('ServicePrincipal', 'DelegatedUser', 'ManagedIdentity')
        $this.InitializeModule()
    }
    
    [void] SetParameters([hashtable]$params) {
        $this.ModuleConfig = $params
        
        if ($params.ContainsKey('TenantId')) {
            $this.ModuleConfig.TenantId = $params.TenantId
        }
        
        if ($params.ContainsKey('GraphScopes')) {
            $this.ModuleConfig.GraphScopes = $params.GraphScopes
        }
        else {
            $this.ModuleConfig.GraphScopes = @(
                'Application.Read.All',
                'Directory.Read.All',
                'Policy.Read.All',
                'IdentityProvider.Read.All',
                'Organization.Read.All',
                'User.Read.All',
                'Group.Read.All',
                'RoleManagement.Read.All'
            )
        }
    }
    
    [psobject] ExecuteDiscovery() {
        $this.LogMessage("Starting Entra ID App discovery", 'INFO')
        $discoveryData = [PSCustomObject]@{
            EnterpriseApps = @()
            AppRegistrations = @()
            ServicePrincipals = @()
            CertificateInventory = @()
            SecretInventory = @()
            AppPermissions = @()
            ConditionalAccessPolicies = @()
            TotalApps = 0
            TotalServicePrincipals = 0
            ExpiringSecrets = 0
            ExpiringCertificates = 0
            HighPrivilegeApps = 0
            DiscoveryTimestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        }
        
        try {
            $this.UpdateProgress("Connecting to Microsoft Graph", 5)
            $this.ConnectToGraph()
            
            $this.UpdateProgress("Discovering app registrations", 15)
            $this.DiscoverAppRegistrations()
            
            $this.UpdateProgress("Discovering enterprise applications", 30)
            $this.DiscoverEnterpriseApps()
            
            $this.UpdateProgress("Discovering service principals", 45)
            $this.DiscoverServicePrincipals()
            
            $this.UpdateProgress("Analyzing app permissions and roles", 60)
            $this.AnalyzeAppPermissions()
            
            $this.UpdateProgress("Discovering certificates and secrets", 75)
            $this.DiscoverCertificatesAndSecrets()
            
            $this.UpdateProgress("Analyzing conditional access policies", 85)
            $this.AnalyzeConditionalAccessPolicies()
            
            $this.UpdateProgress("Generating security insights", 95)
            $this.GenerateSecurityInsights()
            
            $discoveryData.EnterpriseApps = $this.DiscoveredApps.EnterpriseApps
            $discoveryData.AppRegistrations = $this.DiscoveredApps.AppRegistrations
            $discoveryData.ServicePrincipals = $this.DiscoveredApps.ServicePrincipals
            $discoveryData.CertificateInventory = $this.DiscoveredApps.Certificates
            $discoveryData.SecretInventory = $this.DiscoveredApps.Secrets
            $discoveryData.TotalApps = $this.DiscoveredApps.AppRegistrations.Count
            $discoveryData.TotalServicePrincipals = $this.DiscoveredApps.ServicePrincipals.Count
            $discoveryData.ExpiringSecrets = ($this.DiscoveredApps.Secrets | Where-Object { $_.DaysUntilExpiry -lt 90 -and $_.DaysUntilExpiry -gt 0 }).Count
            $discoveryData.ExpiringCertificates = ($this.DiscoveredApps.Certificates | Where-Object { $_.DaysUntilExpiry -lt 90 -and $_.DaysUntilExpiry -gt 0 }).Count
            $discoveryData.HighPrivilegeApps = ($this.DiscoveredApps.AppRegistrations | Where-Object { $_.HasHighPrivilegePermissions -eq $true }).Count
            
            $this.UpdateProgress("Discovery complete", 100)
            $this.LogMessage("Discovered $($discoveryData.TotalApps) app registrations and $($discoveryData.TotalServicePrincipals) service principals", 'INFO')
            
            return $discoveryData
        }
        catch {
            $this.LogMessage("Discovery failed: $_", 'ERROR')
            throw
        }
    }
    
    hidden [void] ConnectToGraph() {
        try {
            $authParams = @{
                TenantId = $this.ModuleConfig.TenantId
                Scopes = $this.ModuleConfig.GraphScopes
            }
            
            switch ($this.AuthMethod) {
                'ServicePrincipal' {
                    $authParams['ClientId'] = $this.ModuleConfig.ClientId
                    $authParams['CertificateThumbprint'] = $this.ModuleConfig.CertificateThumbprint
                }
                'DelegatedUser' {
                    if ($this.Credential) {
                        $authParams['Credential'] = $this.Credential
                    }
                }
                'ManagedIdentity' {
                    $authParams['Identity'] = $true
                }
            }
            
            Connect-MgGraph @authParams -NoWelcome
            $context = Get-MgContext
            
            if ($context) {
                $this.LogMessage("Connected to Microsoft Graph for tenant: $($context.TenantId)", 'INFO')
            }
            else {
                throw "Failed to establish Graph connection"
            }
        }
        catch {
            $this.LogMessage("Failed to connect to Microsoft Graph: $_", 'ERROR')
            throw
        }
    }
    
    hidden [void] DiscoverAppRegistrations() {
        $this.LogMessage("Discovering app registrations", 'INFO')
        
        try {
            $apps = Get-MgApplication -All -Property * -ExpandProperty owners
            
            foreach ($app in $apps) {
                $appInfo = @{
                    ObjectId = $app.Id
                    AppId = $app.AppId
                    DisplayName = $app.DisplayName
                    Description = $app.Description
                    SignInAudience = $app.SignInAudience
                    CreatedDateTime = $app.CreatedDateTime
                    Owners = @()
                    IdentifierUris = $app.IdentifierUris
                    ReplyUrls = $app.Web.RedirectUris
                    HomePage = $app.Web.HomePageUrl
                    LogoutUrl = $app.Web.LogoutUrl
                    RequiredResourceAccess = @()
                    AppRoles = @()
                    OAuth2Permissions = @()
                    KeyCredentials = @()
                    PasswordCredentials = @()
                    HasHighPrivilegePermissions = $false
                    Tags = $app.Tags
                    Notes = $app.Notes
                    OptionalClaims = $app.OptionalClaims
                    PublisherDomain = $app.PublisherDomain
                    VerifiedPublisher = $app.VerifiedPublisher
                    Certification = $app.Certification
                }
                
                if ($app.Owners) {
                    foreach ($owner in $app.Owners) {
                        $ownerInfo = Get-MgUser -UserId $owner.Id -Property DisplayName,UserPrincipalName,Mail -ErrorAction SilentlyContinue
                        if ($ownerInfo) {
                            $appInfo.Owners += @{
                                DisplayName = $ownerInfo.DisplayName
                                UserPrincipalName = $ownerInfo.UserPrincipalName
                                Email = $ownerInfo.Mail
                                ObjectId = $ownerInfo.Id
                            }
                        }
                    }
                }
                
                foreach ($resource in $app.RequiredResourceAccess) {
                    $resourceInfo = @{
                        ResourceAppId = $resource.ResourceAppId
                        ResourceDisplayName = $this.GetResourceDisplayName($resource.ResourceAppId)
                        Permissions = @()
                    }
                    
                    foreach ($permission in $resource.ResourceAccess) {
                        $permInfo = $this.GetPermissionDetails($resource.ResourceAppId, $permission.Id, $permission.Type)
                        $resourceInfo.Permissions += $permInfo
                        
                        if ($permInfo.IsHighPrivilege) {
                            $appInfo.HasHighPrivilegePermissions = $true
                        }
                    }
                    
                    $appInfo.RequiredResourceAccess += $resourceInfo
                }
                
                $appInfo.AppRoles = $app.AppRoles | ForEach-Object {
                    @{
                        Id = $_.Id
                        DisplayName = $_.DisplayName
                        Description = $_.Description
                        Value = $_.Value
                        IsEnabled = $_.IsEnabled
                        AllowedMemberTypes = $_.AllowedMemberTypes
                    }
                }
                
                $appInfo.OAuth2Permissions = $app.OAuth2Permissions | ForEach-Object {
                    @{
                        Id = $_.Id
                        AdminConsentDisplayName = $_.AdminConsentDisplayName
                        AdminConsentDescription = $_.AdminConsentDescription
                        UserConsentDisplayName = $_.UserConsentDisplayName
                        UserConsentDescription = $_.UserConsentDescription
                        Value = $_.Value
                        Type = $_.Type
                        IsEnabled = $_.IsEnabled
                    }
                }
                
                foreach ($keyCred in $app.KeyCredentials) {
                    $certInfo = @{
                        KeyId = $keyCred.KeyId
                        Type = 'Certificate'
                        DisplayName = $keyCred.DisplayName
                        StartDateTime = $keyCred.StartDateTime
                        EndDateTime = $keyCred.EndDateTime
                        DaysUntilExpiry = (New-TimeSpan -Start (Get-Date) -End $keyCred.EndDateTime).Days
                        Usage = $keyCred.Usage
                        CustomKeyIdentifier = [System.Convert]::ToBase64String($keyCred.CustomKeyIdentifier)
                        AppId = $app.AppId
                        AppDisplayName = $app.DisplayName
                        Status = if ((New-TimeSpan -Start (Get-Date) -End $keyCred.EndDateTime).Days -lt 0) { 'Expired' }
                                elseif ((New-TimeSpan -Start (Get-Date) -End $keyCred.EndDateTime).Days -lt 30) { 'ExpiringSoon' }
                                elseif ((New-TimeSpan -Start (Get-Date) -End $keyCred.EndDateTime).Days -lt 90) { 'ExpiringInQuarter' }
                                else { 'Valid' }
                    }
                    
                    $appInfo.KeyCredentials += $certInfo
                    $this.DiscoveredApps.Certificates += $certInfo
                }
                
                foreach ($passwordCred in $app.PasswordCredentials) {
                    $secretInfo = @{
                        KeyId = $passwordCred.KeyId
                        Type = 'Secret'
                        DisplayName = $passwordCred.DisplayName
                        Hint = $passwordCred.Hint
                        StartDateTime = $passwordCred.StartDateTime
                        EndDateTime = $passwordCred.EndDateTime
                        DaysUntilExpiry = if ($passwordCred.EndDateTime) { (New-TimeSpan -Start (Get-Date) -End $passwordCred.EndDateTime).Days } else { -1 }
                        AppId = $app.AppId
                        AppDisplayName = $app.DisplayName
                        Status = if (-not $passwordCred.EndDateTime) { 'NeverExpires' }
                                elseif ((New-TimeSpan -Start (Get-Date) -End $passwordCred.EndDateTime).Days -lt 0) { 'Expired' }
                                elseif ((New-TimeSpan -Start (Get-Date) -End $passwordCred.EndDateTime).Days -lt 30) { 'ExpiringSoon' }
                                elseif ((New-TimeSpan -Start (Get-Date) -End $passwordCred.EndDateTime).Days -lt 90) { 'ExpiringInQuarter' }
                                else { 'Valid' }
                    }
                    
                    $appInfo.PasswordCredentials += $secretInfo
                    $this.DiscoveredApps.Secrets += $secretInfo
                }
                
                $this.DiscoveredApps.AppRegistrations += $appInfo
            }
            
            $this.LogMessage("Discovered $($this.DiscoveredApps.AppRegistrations.Count) app registrations", 'INFO')
        }
        catch {
            $this.LogMessage("Failed to discover app registrations: $_", 'ERROR')
            throw
        }
    }
    
    hidden [void] DiscoverEnterpriseApps() {
        $this.LogMessage("Discovering enterprise applications", 'INFO')
        
        try {
            $enterpriseApps = Get-MgServicePrincipal -All -Filter "tags/any(t:t eq 'WindowsAzureActiveDirectoryIntegratedApp')" -Property *
            
            foreach ($app in $enterpriseApps) {
                $appInfo = @{
                    ObjectId = $app.Id
                    AppId = $app.AppId
                    DisplayName = $app.DisplayName
                    Description = $app.Description
                    Homepage = $app.Homepage
                    LoginUrl = $app.LoginUrl
                    LogoutUrl = $app.LogoutUrl
                    NotificationEmailAddresses = $app.NotificationEmailAddresses
                    PreferredSingleSignOnMode = $app.PreferredSingleSignOnMode
                    PreferredTokenSigningKeyThumbprint = $app.PreferredTokenSigningKeyThumbprint
                    ReplyUrls = $app.ReplyUrls
                    ServicePrincipalType = $app.ServicePrincipalType
                    SignInAudience = $app.SignInAudience
                    Tags = $app.Tags
                    TokenEncryptionKeyId = $app.TokenEncryptionKeyId
                    AccountEnabled = $app.AccountEnabled
                    AppRoleAssignmentRequired = $app.AppRoleAssignmentRequired
                    PublisherName = $app.PublisherName
                    AlternativeNames = $app.AlternativeNames
                    CreatedDateTime = $app.CreatedDateTime
                    AppRoles = @()
                    OAuth2PermissionScopes = @()
                    KeyCredentials = @()
                    PasswordCredentials = @()
                    Owners = @()
                    AssignedUsers = @()
                    AssignedGroups = @()
                }
                
                $owners = Get-MgServicePrincipalOwner -ServicePrincipalId $app.Id -All
                foreach ($owner in $owners) {
                    if ($owner.AdditionalProperties['@odata.type'] -eq '#microsoft.graph.user') {
                        $ownerInfo = Get-MgUser -UserId $owner.Id -Property DisplayName,UserPrincipalName,Mail -ErrorAction SilentlyContinue
                        if ($ownerInfo) {
                            $appInfo.Owners += @{
                                DisplayName = $ownerInfo.DisplayName
                                UserPrincipalName = $ownerInfo.UserPrincipalName
                                Email = $ownerInfo.Mail
                                ObjectId = $ownerInfo.Id
                            }
                        }
                    }
                }
                
                if ($app.AppRoleAssignmentRequired) {
                    $assignments = Get-MgServicePrincipalAppRoleAssignedTo -ServicePrincipalId $app.Id -All
                    
                    foreach ($assignment in $assignments) {
                        if ($assignment.PrincipalType -eq 'User') {
                            $user = Get-MgUser -UserId $assignment.PrincipalId -Property DisplayName,UserPrincipalName,Mail -ErrorAction SilentlyContinue
                            if ($user) {
                                $appInfo.AssignedUsers += @{
                                    DisplayName = $user.DisplayName
                                    UserPrincipalName = $user.UserPrincipalName
                                    Email = $user.Mail
                                    ObjectId = $user.Id
                                    AppRoleId = $assignment.AppRoleId
                                }
                            }
                        }
                        elseif ($assignment.PrincipalType -eq 'Group') {
                            $group = Get-MgGroup -GroupId $assignment.PrincipalId -Property DisplayName,Mail -ErrorAction SilentlyContinue
                            if ($group) {
                                $appInfo.AssignedGroups += @{
                                    DisplayName = $group.DisplayName
                                    Email = $group.Mail
                                    ObjectId = $group.Id
                                    AppRoleId = $assignment.AppRoleId
                                }
                            }
                        }
                    }
                }
                
                $appInfo.AppRoles = $app.AppRoles | ForEach-Object {
                    @{
                        Id = $_.Id
                        DisplayName = $_.DisplayName
                        Description = $_.Description
                        Value = $_.Value
                        IsEnabled = $_.IsEnabled
                        AllowedMemberTypes = $_.AllowedMemberTypes
                    }
                }
                
                $appInfo.OAuth2PermissionScopes = $app.OAuth2PermissionScopes | ForEach-Object {
                    @{
                        Id = $_.Id
                        AdminConsentDisplayName = $_.AdminConsentDisplayName
                        AdminConsentDescription = $_.AdminConsentDescription
                        UserConsentDisplayName = $_.UserConsentDisplayName
                        UserConsentDescription = $_.UserConsentDescription
                        Value = $_.Value
                        Type = $_.Type
                        IsEnabled = $_.IsEnabled
                    }
                }
                
                foreach ($keyCred in $app.KeyCredentials) {
                    $certInfo = @{
                        KeyId = $keyCred.KeyId
                        Type = 'Certificate'
                        DisplayName = $keyCred.DisplayName
                        StartDateTime = $keyCred.StartDateTime
                        EndDateTime = $keyCred.EndDateTime
                        DaysUntilExpiry = (New-TimeSpan -Start (Get-Date) -End $keyCred.EndDateTime).Days
                        Usage = $keyCred.Usage
                        AppId = $app.AppId
                        AppDisplayName = $app.DisplayName
                        AppType = 'EnterpriseApp'
                        Status = if ((New-TimeSpan -Start (Get-Date) -End $keyCred.EndDateTime).Days -lt 0) { 'Expired' }
                                elseif ((New-TimeSpan -Start (Get-Date) -End $keyCred.EndDateTime).Days -lt 30) { 'ExpiringSoon' }
                                elseif ((New-TimeSpan -Start (Get-Date) -End $keyCred.EndDateTime).Days -lt 90) { 'ExpiringInQuarter' }
                                else { 'Valid' }
                    }
                    
                    $appInfo.KeyCredentials += $certInfo
                    $this.DiscoveredApps.Certificates += $certInfo
                }
                
                foreach ($passwordCred in $app.PasswordCredentials) {
                    $secretInfo = @{
                        KeyId = $passwordCred.KeyId
                        Type = 'Secret'
                        DisplayName = $passwordCred.DisplayName
                        Hint = $passwordCred.Hint
                        StartDateTime = $passwordCred.StartDateTime
                        EndDateTime = $passwordCred.EndDateTime
                        DaysUntilExpiry = if ($passwordCred.EndDateTime) { (New-TimeSpan -Start (Get-Date) -End $passwordCred.EndDateTime).Days } else { -1 }
                        AppId = $app.AppId
                        AppDisplayName = $app.DisplayName
                        AppType = 'EnterpriseApp'
                        Status = if (-not $passwordCred.EndDateTime) { 'NeverExpires' }
                                elseif ((New-TimeSpan -Start (Get-Date) -End $passwordCred.EndDateTime).Days -lt 0) { 'Expired' }
                                elseif ((New-TimeSpan -Start (Get-Date) -End $passwordCred.EndDateTime).Days -lt 30) { 'ExpiringSoon' }
                                elseif ((New-TimeSpan -Start (Get-Date) -End $passwordCred.EndDateTime).Days -lt 90) { 'ExpiringInQuarter' }
                                else { 'Valid' }
                    }
                    
                    $appInfo.PasswordCredentials += $secretInfo
                    $this.DiscoveredApps.Secrets += $secretInfo
                }
                
                $this.DiscoveredApps.EnterpriseApps += $appInfo
            }
            
            $this.LogMessage("Discovered $($this.DiscoveredApps.EnterpriseApps.Count) enterprise applications", 'INFO')
        }
        catch {
            $this.LogMessage("Failed to discover enterprise applications: $_", 'ERROR')
        }
    }
    
    hidden [void] DiscoverServicePrincipals() {
        $this.LogMessage("Discovering all service principals", 'INFO')
        
        try {
            $servicePrincipals = Get-MgServicePrincipal -All -Property *
            
            foreach ($sp in $servicePrincipals) {
                if ($sp.ServicePrincipalType -eq 'Application' -or $sp.ServicePrincipalType -eq 'ManagedIdentity') {
                    $spInfo = @{
                        ObjectId = $sp.Id
                        AppId = $sp.AppId
                        DisplayName = $sp.DisplayName
                        ServicePrincipalType = $sp.ServicePrincipalType
                        AccountEnabled = $sp.AccountEnabled
                        AppOwnerOrganizationId = $sp.AppOwnerOrganizationId
                        HomePage = $sp.HomePage
                        PublisherName = $sp.PublisherName
                        SignInAudience = $sp.SignInAudience
                        Tags = $sp.Tags
                        CreatedDateTime = $sp.CreatedDateTime
                        AppRoles = $sp.AppRoles
                        OAuth2PermissionScopes = $sp.OAuth2PermissionScopes
                        DelegatedPermissions = @()
                        ApplicationPermissions = @()
                        AssignedRoles = @()
                    }
                    
                    $oauth2Grants = Get-MgServicePrincipalOauth2PermissionGrant -ServicePrincipalId $sp.Id -All
                    foreach ($grant in $oauth2Grants) {
                        $resourceSp = Get-MgServicePrincipal -ServicePrincipalId $grant.ResourceId -Property DisplayName,AppId -ErrorAction SilentlyContinue
                        
                        $grantInfo = @{
                            Id = $grant.Id
                            ClientId = $grant.ClientId
                            ConsentType = $grant.ConsentType
                            PrincipalId = $grant.PrincipalId
                            ResourceId = $grant.ResourceId
                            ResourceDisplayName = $resourceSp.DisplayName
                            ResourceAppId = $resourceSp.AppId
                            Scope = $grant.Scope
                            StartTime = $grant.StartTime
                            ExpiryTime = $grant.ExpiryTime
                        }
                        
                        $spInfo.DelegatedPermissions += $grantInfo
                    }
                    
                    $appRoleAssignments = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $sp.Id -All
                    foreach ($assignment in $appRoleAssignments) {
                        $resourceSp = Get-MgServicePrincipal -ServicePrincipalId $assignment.ResourceId -Property DisplayName,AppId,AppRoles -ErrorAction SilentlyContinue
                        
                        $appRole = $resourceSp.AppRoles | Where-Object { $_.Id -eq $assignment.AppRoleId }
                        
                        $assignmentInfo = @{
                            Id = $assignment.Id
                            AppRoleId = $assignment.AppRoleId
                            PrincipalId = $assignment.PrincipalId
                            ResourceId = $assignment.ResourceId
                            ResourceDisplayName = $resourceSp.DisplayName
                            ResourceAppId = $resourceSp.AppId
                            AppRoleDisplayName = $appRole.DisplayName
                            AppRoleValue = $appRole.Value
                            CreatedDateTime = $assignment.CreatedDateTime
                        }
                        
                        $spInfo.ApplicationPermissions += $assignmentInfo
                    }
                    
                    $this.DiscoveredApps.ServicePrincipals += $spInfo
                }
            }
            
            $this.LogMessage("Discovered $($this.DiscoveredApps.ServicePrincipals.Count) service principals", 'INFO')
        }
        catch {
            $this.LogMessage("Failed to discover service principals: $_", 'ERROR')
        }
    }
    
    hidden [void] AnalyzeAppPermissions() {
        $this.LogMessage("Analyzing app permissions and roles", 'INFO')
        
        $highPrivilegePermissions = @(
            'Application.ReadWrite.All',
            'AppRoleAssignment.ReadWrite.All',
            'Directory.ReadWrite.All',
            'RoleManagement.ReadWrite.Directory',
            'User.ReadWrite.All',
            'Group.ReadWrite.All',
            'GroupMember.ReadWrite.All',
            'Mail.ReadWrite',
            'Mail.Send',
            'Files.ReadWrite.All',
            'Sites.ReadWrite.All',
            'Exchange.ManageAsApp',
            'full_access_as_app'
        )
        
        foreach ($app in $this.DiscoveredApps.AppRegistrations) {
            $appPermissions = @{
                AppId = $app.AppId
                DisplayName = $app.DisplayName
                DelegatedPermissions = @()
                ApplicationPermissions = @()
                HighPrivilegeCount = 0
                RiskLevel = 'Low'
            }
            
            foreach ($resource in $app.RequiredResourceAccess) {
                foreach ($permission in $resource.Permissions) {
                    if ($permission.Type -eq 'Scope') {
                        $appPermissions.DelegatedPermissions += $permission
                    }
                    else {
                        $appPermissions.ApplicationPermissions += $permission
                    }
                    
                    if ($permission.Value -in $highPrivilegePermissions) {
                        $appPermissions.HighPrivilegeCount++
                        $app.HasHighPrivilegePermissions = $true
                    }
                }
            }
            
            if ($appPermissions.HighPrivilegeCount -gt 5) {
                $appPermissions.RiskLevel = 'Critical'
            }
            elseif ($appPermissions.HighPrivilegeCount -gt 2) {
                $appPermissions.RiskLevel = 'High'
            }
            elseif ($appPermissions.HighPrivilegeCount -gt 0) {
                $appPermissions.RiskLevel = 'Medium'
            }
            
            $this.DiscoveredApps.AppRoles += $appPermissions
        }
        
        $this.LogMessage("Completed permission analysis", 'INFO')
    }
    
    hidden [void] DiscoverCertificatesAndSecrets() {
        $this.LogMessage("Analyzing certificates and secrets", 'INFO')
        
        $now = Get-Date
        $expiryThresholds = @{
            Critical = 7
            Warning = 30
            Notice = 90
        }
        
        $certificateSummary = @{
            Total = $this.DiscoveredApps.Certificates.Count
            Expired = 0
            ExpiringSoon = 0
            Valid = 0
            ByApp = @{}
        }
        
        $secretSummary = @{
            Total = $this.DiscoveredApps.Secrets.Count
            Expired = 0
            ExpiringSoon = 0
            NeverExpires = 0
            Valid = 0
            ByApp = @{}
        }
        
        foreach ($cert in $this.DiscoveredApps.Certificates) {
            if ($cert.Status -eq 'Expired') {
                $certificateSummary.Expired++
            }
            elseif ($cert.Status -eq 'ExpiringSoon') {
                $certificateSummary.ExpiringSoon++
            }
            else {
                $certificateSummary.Valid++
            }
            
            if (-not $certificateSummary.ByApp.ContainsKey($cert.AppDisplayName)) {
                $certificateSummary.ByApp[$cert.AppDisplayName] = @{
                    Total = 0
                    Expired = 0
                    ExpiringSoon = 0
                    Valid = 0
                }
            }
            
            $certificateSummary.ByApp[$cert.AppDisplayName].Total++
            
            switch ($cert.Status) {
                'Expired' { $certificateSummary.ByApp[$cert.AppDisplayName].Expired++ }
                'ExpiringSoon' { $certificateSummary.ByApp[$cert.AppDisplayName].ExpiringSoon++ }
                default { $certificateSummary.ByApp[$cert.AppDisplayName].Valid++ }
            }
        }
        
        foreach ($secret in $this.DiscoveredApps.Secrets) {
            if ($secret.Status -eq 'Expired') {
                $secretSummary.Expired++
            }
            elseif ($secret.Status -eq 'ExpiringSoon') {
                $secretSummary.ExpiringSoon++
            }
            elseif ($secret.Status -eq 'NeverExpires') {
                $secretSummary.NeverExpires++
            }
            else {
                $secretSummary.Valid++
            }
            
            if (-not $secretSummary.ByApp.ContainsKey($secret.AppDisplayName)) {
                $secretSummary.ByApp[$secret.AppDisplayName] = @{
                    Total = 0
                    Expired = 0
                    ExpiringSoon = 0
                    NeverExpires = 0
                    Valid = 0
                }
            }
            
            $secretSummary.ByApp[$secret.AppDisplayName].Total++
            
            switch ($secret.Status) {
                'Expired' { $secretSummary.ByApp[$secret.AppDisplayName].Expired++ }
                'ExpiringSoon' { $secretSummary.ByApp[$secret.AppDisplayName].ExpiringSoon++ }
                'NeverExpires' { $secretSummary.ByApp[$secret.AppDisplayName].NeverExpires++ }
                default { $secretSummary.ByApp[$secret.AppDisplayName].Valid++ }
            }
        }
        
        $this.ModuleConfig['CertificateSummary'] = $certificateSummary
        $this.ModuleConfig['SecretSummary'] = $secretSummary
        
        $this.LogMessage("Certificate analysis: Total=$($certificateSummary.Total), Expired=$($certificateSummary.Expired), ExpiringSoon=$($certificateSummary.ExpiringSoon)", 'INFO')
        $this.LogMessage("Secret analysis: Total=$($secretSummary.Total), Expired=$($secretSummary.Expired), ExpiringSoon=$($secretSummary.ExpiringSoon), NeverExpires=$($secretSummary.NeverExpires)", 'INFO')
    }
    
    hidden [void] AnalyzeConditionalAccessPolicies() {
        $this.LogMessage("Analyzing conditional access policies", 'INFO')
        
        try {
            $policies = Get-MgIdentityConditionalAccessPolicy -All
            
            $appPolicies = @{}
            
            foreach ($policy in $policies) {
                if ($policy.Conditions.Applications.IncludeApplications) {
                    foreach ($appId in $policy.Conditions.Applications.IncludeApplications) {
                        if ($appId -ne 'All') {
                            if (-not $appPolicies.ContainsKey($appId)) {
                                $appPolicies[$appId] = @()
                            }
                            
                            $appPolicies[$appId] += @{
                                PolicyId = $policy.Id
                                PolicyName = $policy.DisplayName
                                State = $policy.State
                                CreatedDateTime = $policy.CreatedDateTime
                                ModifiedDateTime = $policy.ModifiedDateTime
                                Conditions = $policy.Conditions
                                GrantControls = $policy.GrantControls
                                SessionControls = $policy.SessionControls
                            }
                        }
                    }
                }
            }
            
            $this.ModuleConfig['ConditionalAccessPolicies'] = $appPolicies
            $this.LogMessage("Found $($appPolicies.Count) apps with conditional access policies", 'INFO')
        }
        catch {
            $this.LogMessage("Failed to analyze conditional access policies: $_", 'WARNING')
        }
    }
    
    hidden [void] GenerateSecurityInsights() {
        $this.LogMessage("Generating security insights", 'INFO')
        
        $insights = @{
            HighRiskApps = @()
            StaleApps = @()
            OverprivilegedApps = @()
            UnmanagedApps = @()
            ExpiredCredentials = @()
            SecurityRecommendations = @()
        }
        
        $staleThreshold = (Get-Date).AddDays(-180)
        
        foreach ($app in $this.DiscoveredApps.AppRegistrations) {
            if ($app.HasHighPrivilegePermissions -and $app.Owners.Count -eq 0) {
                $insights.HighRiskApps += @{
                    AppId = $app.AppId
                    DisplayName = $app.DisplayName
                    Reason = "High privilege app with no owners"
                    RiskLevel = "Critical"
                }
            }
            
            if ($app.CreatedDateTime -lt $staleThreshold) {
                $sp = $this.DiscoveredApps.ServicePrincipals | Where-Object { $_.AppId -eq $app.AppId }
                if ($sp -and -not $sp.DelegatedPermissions -and -not $sp.ApplicationPermissions) {
                    $insights.StaleApps += @{
                        AppId = $app.AppId
                        DisplayName = $app.DisplayName
                        CreatedDate = $app.CreatedDateTime
                        DaysSinceCreation = (New-TimeSpan -Start $app.CreatedDateTime -End (Get-Date)).Days
                    }
                }
            }
            
            $permissionCount = 0
            foreach ($resource in $app.RequiredResourceAccess) {
                $permissionCount += $resource.Permissions.Count
            }
            
            if ($permissionCount -gt 20) {
                $insights.OverprivilegedApps += @{
                    AppId = $app.AppId
                    DisplayName = $app.DisplayName
                    PermissionCount = $permissionCount
                    Recommendation = "Review and reduce permissions"
                }
            }
        }
        
        foreach ($cert in $this.DiscoveredApps.Certificates | Where-Object { $_.Status -in @('Expired', 'ExpiringSoon') }) {
            $insights.ExpiredCredentials += @{
                Type = 'Certificate'
                AppDisplayName = $cert.AppDisplayName
                Status = $cert.Status
                ExpiryDate = $cert.EndDateTime
                DaysUntilExpiry = $cert.DaysUntilExpiry
            }
        }
        
        foreach ($secret in $this.DiscoveredApps.Secrets | Where-Object { $_.Status -in @('Expired', 'ExpiringSoon') }) {
            $insights.ExpiredCredentials += @{
                Type = 'Secret'
                AppDisplayName = $secret.AppDisplayName
                Status = $secret.Status
                ExpiryDate = $secret.EndDateTime
                DaysUntilExpiry = $secret.DaysUntilExpiry
            }
        }
        
        if ($insights.HighRiskApps.Count -gt 0) {
            $insights.SecurityRecommendations += "Review and assign owners to high-privilege applications"
        }
        
        if ($insights.ExpiredCredentials.Count -gt 0) {
            $insights.SecurityRecommendations += "Rotate expired and expiring credentials immediately"
        }
        
        if ($insights.StaleApps.Count -gt 10) {
            $insights.SecurityRecommendations += "Implement app lifecycle management to remove unused applications"
        }
        
        if (($this.DiscoveredApps.Secrets | Where-Object { $_.Status -eq 'NeverExpires' }).Count -gt 0) {
            $insights.SecurityRecommendations += "Set expiration dates for all application secrets"
        }
        
        $this.ModuleConfig['SecurityInsights'] = $insights
        $this.LogMessage("Generated security insights", 'INFO')
    }
    
    hidden [string] GetResourceDisplayName([string]$resourceAppId) {
        $knownResources = @{
            '00000003-0000-0000-c000-000000000000' = 'Microsoft Graph'
            '00000002-0000-0000-c000-000000000000' = 'Azure Active Directory Graph'
            '00000002-0000-0ff1-ce00-000000000000' = 'Office 365 Exchange Online'
            '00000003-0000-0ff1-ce00-000000000000' = 'SharePoint Online'
            '00000004-0000-0ff1-ce00-000000000000' = 'Skype for Business Online'
            '00000005-0000-0ff1-ce00-000000000000' = 'Office 365 Management APIs'
            '00000006-0000-0ff1-ce00-000000000000' = 'Microsoft Forms'
            '00000007-0000-0ff1-ce00-000000000000' = 'Microsoft Teams'
        }
        
        if ($knownResources.ContainsKey($resourceAppId)) {
            return $knownResources[$resourceAppId]
        }
        
        try {
            $sp = Get-MgServicePrincipal -Filter "appId eq '$resourceAppId'" -Property DisplayName
            if ($sp) {
                return $sp.DisplayName
            }
        }
        catch {
            $this.LogMessage("Failed to get resource display name for $resourceAppId", 'VERBOSE')
        }
        
        return $resourceAppId
    }
    
    hidden [hashtable] GetPermissionDetails([string]$resourceAppId, [string]$permissionId, [string]$permissionType) {
        $permissionInfo = @{
            Id = $permissionId
            Type = $permissionType
            Value = 'Unknown'
            DisplayName = 'Unknown'
            Description = 'Unknown'
            IsHighPrivilege = $false
        }
        
        try {
            $sp = Get-MgServicePrincipal -Filter "appId eq '$resourceAppId'" -Property AppRoles,OAuth2PermissionScopes
            
            if ($sp) {
                if ($permissionType -eq 'Role') {
                    $appRole = $sp.AppRoles | Where-Object { $_.Id -eq $permissionId }
                    if ($appRole) {
                        $permissionInfo.Value = $appRole.Value
                        $permissionInfo.DisplayName = $appRole.DisplayName
                        $permissionInfo.Description = $appRole.Description
                        
                        $highPrivilegeRoles = @('.ReadWrite.All', '.Manage', 'full_access', 'Mail.Send')
                        foreach ($role in $highPrivilegeRoles) {
                            if ($appRole.Value -like "*$role*") {
                                $permissionInfo.IsHighPrivilege = $true
                                break
                            }
                        }
                    }
                }
                else {
                    $scope = $sp.OAuth2PermissionScopes | Where-Object { $_.Id -eq $permissionId }
                    if ($scope) {
                        $permissionInfo.Value = $scope.Value
                        $permissionInfo.DisplayName = $scope.AdminConsentDisplayName
                        $permissionInfo.Description = $scope.AdminConsentDescription
                        
                        $highPrivilegeScopes = @('.ReadWrite.All', '.Manage', 'full_access', 'Mail.Send')
                        foreach ($scopePattern in $highPrivilegeScopes) {
                            if ($scope.Value -like "*$scopePattern*") {
                                $permissionInfo.IsHighPrivilege = $true
                                break
                            }
                        }
                    }
                }
            }
        }
        catch {
            $this.LogMessage("Failed to get permission details for $permissionId", 'VERBOSE')
        }
        
        return $permissionInfo
    }
    
    [hashtable] ExportResults() {
        $exportData = @{
            Summary = @{
                TotalAppRegistrations = $this.DiscoveredApps.AppRegistrations.Count
                TotalEnterpriseApps = $this.DiscoveredApps.EnterpriseApps.Count
                TotalServicePrincipals = $this.DiscoveredApps.ServicePrincipals.Count
                TotalCertificates = $this.DiscoveredApps.Certificates.Count
                TotalSecrets = $this.DiscoveredApps.Secrets.Count
                ExpiredCertificates = ($this.DiscoveredApps.Certificates | Where-Object { $_.Status -eq 'Expired' }).Count
                ExpiredSecrets = ($this.DiscoveredApps.Secrets | Where-Object { $_.Status -eq 'Expired' }).Count
                HighPrivilegeApps = ($this.DiscoveredApps.AppRegistrations | Where-Object { $_.HasHighPrivilegePermissions }).Count
                CertificateSummary = $this.ModuleConfig['CertificateSummary']
                SecretSummary = $this.ModuleConfig['SecretSummary']
                SecurityInsights = $this.ModuleConfig['SecurityInsights']
            }
            AppRegistrations = $this.DiscoveredApps.AppRegistrations
            EnterpriseApps = $this.DiscoveredApps.EnterpriseApps
            ServicePrincipals = $this.DiscoveredApps.ServicePrincipals
            Certificates = $this.DiscoveredApps.Certificates
            Secrets = $this.DiscoveredApps.Secrets
            ConditionalAccessPolicies = $this.ModuleConfig['ConditionalAccessPolicies']
        }
        
        return $exportData
    }
    
    [void] ExportToFile([string]$outputPath, [string]$format = 'JSON') {
        $this.LogMessage("Exporting Entra ID app data to file", 'INFO')
        
        try {
            switch ($format.ToUpper()) {
                'JSON' {
                    $jsonData = $this.ExportResults() | ConvertTo-Json -Depth 10
                    Set-Content -Path $outputPath -Value $jsonData -Encoding UTF8
                }
                'CSV' {
                    $csvPath = [System.IO.Path]::GetDirectoryName($outputPath)
                    
                    $this.DiscoveredApps.AppRegistrations | Export-Csv -Path "$csvPath\AppRegistrations.csv" -NoTypeInformation
                    $this.DiscoveredApps.EnterpriseApps | Export-Csv -Path "$csvPath\EnterpriseApps.csv" -NoTypeInformation
                    $this.DiscoveredApps.ServicePrincipals | Export-Csv -Path "$csvPath\ServicePrincipals.csv" -NoTypeInformation
                    $this.DiscoveredApps.Certificates | Export-Csv -Path "$csvPath\Certificates.csv" -NoTypeInformation
                    $this.DiscoveredApps.Secrets | Export-Csv -Path "$csvPath\Secrets.csv" -NoTypeInformation
                }
                default {
                    throw "Unsupported export format: $format"
                }
            }
            
            $this.LogMessage("Exported Entra ID app data to: $outputPath", 'INFO')
        }
        catch {
            $this.LogMessage("Failed to export to file: $_", 'ERROR')
            throw
        }
    }
    
    [void] Cleanup() {
        try {
            Disconnect-MgGraph -ErrorAction SilentlyContinue
        }
        catch {}
        
        $this.GraphClient = $null
        $this.DiscoveredApps = @{
            EnterpriseApps = @()
            AppRegistrations = @()
            ServicePrincipals = @()
            AppRoles = @()
            OAuth2Permissions = @()
            Certificates = @()
            Secrets = @()
        }
        
        $this.LogMessage("Entra ID app discovery cleanup completed", 'INFO')
    }
}

function Get-EntraIDAppDiscovery {
    [CmdletBinding()]
    param()
    
    return [EntraIDAppDiscovery]::new()
}

Export-ModuleMember -Function Get-EntraIDAppDiscovery