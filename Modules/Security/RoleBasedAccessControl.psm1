# M&A Discovery Suite - Role-Based Access Control and Audit Logging System
# Enterprise-grade security and governance framework

function Initialize-RBACSystem {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [string]$ConfigPath = ".\Config\Security\RBAC.json",
        
        [Parameter(Mandatory = $false)]
        [string]$AuditLogPath = ".\Logs\Audit",
        
        [Parameter(Mandatory = $false)]
        [switch]$EnableWindowsIntegration,
        
        [Parameter(Mandatory = $false)]
        [switch]$EnableActiveDirectorySync,
        
        [Parameter(Mandatory = $false)]
        [string]$LogFile = ".\Logs\RBAC.log"
    )
    
    Begin {
        Write-Host "🔐 M&A Discovery Suite - Role-Based Access Control System" -ForegroundColor Cyan
        Write-Host "========================================================" -ForegroundColor Cyan
        
        # Initialize RBAC session
        $global:RBACSession = @{
            ConfigPath = $ConfigPath
            AuditLogPath = $AuditLogPath
            StartTime = Get-Date
            CurrentUser = $env:USERNAME
            CurrentUserSID = ([System.Security.Principal.WindowsIdentity]::GetCurrent()).User.Value
            Roles = @{}
            Permissions = @{}
            Users = @{}
            AuditEvents = @()
        }
        
        # Ensure directories exist
        @($AuditLogPath, (Split-Path $ConfigPath -Parent)) | ForEach-Object {
            if (!(Test-Path $_)) {
                New-Item -Path $_ -ItemType Directory -Force | Out-Null
            }
        }
        
        Write-Log "Initializing RBAC system for user: $($global:RBACSession.CurrentUser)" $LogFile
    }
    
    Process {
        try {
            # Load or create RBAC configuration
            Write-Host "📋 Loading RBAC configuration..." -ForegroundColor Yellow
            Initialize-RBACConfiguration -ConfigPath $ConfigPath
            
            # Initialize default roles if not exist
            Write-Host "👥 Setting up default roles..." -ForegroundColor Yellow
            Initialize-DefaultRoles
            
            # Sync with Active Directory if enabled
            if ($EnableActiveDirectorySync) {
                Write-Host "🔄 Syncing with Active Directory..." -ForegroundColor Yellow
                Sync-WithActiveDirectory
            }
            
            # Setup Windows authentication integration
            if ($EnableWindowsIntegration) {
                Write-Host "🔗 Configuring Windows integration..." -ForegroundColor Yellow
                Initialize-WindowsIntegration
            }
            
            # Initialize audit logging
            Write-Host "📝 Initializing audit logging..." -ForegroundColor Yellow
            Initialize-AuditLogging -AuditLogPath $AuditLogPath
            
            # Log system initialization
            Write-AuditEvent -EventType "SystemInitialization" -Description "RBAC system initialized" -Severity "Information"
            
            Write-Host "✅ RBAC system initialized successfully!" -ForegroundColor Green
            
        } catch {
            Write-Error "RBAC initialization failed: $($_.Exception.Message)"
            Write-Log "CRITICAL ERROR: $($_.Exception.Message)" $LogFile
        }
    }
}

function Initialize-RBACConfiguration {
    param([string]$ConfigPath)
    
    if (Test-Path $ConfigPath) {
        $config = Get-Content $ConfigPath | ConvertFrom-Json
        $global:RBACSession.Roles = $config.Roles
        $global:RBACSession.Permissions = $config.Permissions
        $global:RBACSession.Users = $config.Users
    } else {
        # Create default configuration
        $defaultConfig = @{
            Roles = @{}
            Permissions = @{}
            Users = @{}
            Settings = @{
                SessionTimeout = 480  # 8 hours in minutes
                MaxFailedAttempts = 3
                LockoutDuration = 30  # minutes
                AuditRetention = 365  # days
                RequireMFA = $false
            }
        }
        
        $defaultConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $ConfigPath
        $global:RBACSession.Roles = @{}
        $global:RBACSession.Permissions = @{}
        $global:RBACSession.Users = @{}
    }
}

function Initialize-DefaultRoles {
    # Define default roles and permissions
    $defaultRoles = @{
        "SystemAdministrator" = @{
            Name = "System Administrator"
            Description = "Full system access with all permissions"
            Permissions = @(
                "System.FullControl",
                "Discovery.Execute",
                "Discovery.ViewAll",
                "Reports.Generate",
                "Reports.ViewAll",
                "Users.Manage",
                "Roles.Manage",
                "Audit.ViewAll",
                "Configuration.Manage"
            )
            IsBuiltIn = $true
            CreatedDate = Get-Date
        }
        
        "DiscoveryOperator" = @{
            Name = "Discovery Operator"
            Description = "Can execute discovery operations and view results"
            Permissions = @(
                "Discovery.Execute",
                "Discovery.ViewOwn",
                "Reports.Generate",
                "Reports.ViewOwn"
            )
            IsBuiltIn = $true
            CreatedDate = Get-Date
        }
        
        "ReportsAnalyst" = @{
            Name = "Reports Analyst"
            Description = "Can view and generate reports but not execute discovery"
            Permissions = @(
                "Discovery.ViewAll",
                "Reports.Generate",
                "Reports.ViewAll",
                "Analytics.ViewAll"
            )
            IsBuiltIn = $true
            CreatedDate = Get-Date
        }
        
        "AuditViewer" = @{
            Name = "Audit Viewer"
            Description = "Read-only access to audit logs and compliance reports"
            Permissions = @(
                "Audit.ViewAll",
                "Compliance.ViewAll",
                "Reports.ViewCompliance"
            )
            IsBuiltIn = $true
            CreatedDate = Get-Date
        }
        
        "ReadOnlyUser" = @{
            Name = "Read-Only User"
            Description = "View-only access to discovery results and reports"
            Permissions = @(
                "Discovery.ViewOwn",
                "Reports.ViewOwn"
            )
            IsBuiltIn = $true
            CreatedDate = Get-Date
        }
    }
    
    # Define permission catalog
    $permissionCatalog = @{
        "System.FullControl" = @{
            Name = "Full System Control"
            Description = "Complete administrative access to all system functions"
            Category = "System"
            RiskLevel = "Critical"
        }
        
        "Discovery.Execute" = @{
            Name = "Execute Discovery"
            Description = "Permission to run discovery operations"
            Category = "Discovery"
            RiskLevel = "Medium"
        }
        
        "Discovery.ViewAll" = @{
            Name = "View All Discovery Results"
            Description = "Access to view all discovery results across all companies"
            Category = "Discovery"
            RiskLevel = "Medium"
        }
        
        "Discovery.ViewOwn" = @{
            Name = "View Own Discovery Results"
            Description = "Access to view only own discovery results"
            Category = "Discovery"
            RiskLevel = "Low"
        }
        
        "Reports.Generate" = @{
            Name = "Generate Reports"
            Description = "Permission to create and generate reports"
            Category = "Reports"
            RiskLevel = "Low"
        }
        
        "Reports.ViewAll" = @{
            Name = "View All Reports"
            Description = "Access to view all reports across all companies"
            Category = "Reports"
            RiskLevel = "Medium"
        }
        
        "Reports.ViewOwn" = @{
            Name = "View Own Reports"
            Description = "Access to view only own reports"
            Category = "Reports"
            RiskLevel = "Low"
        }
        
        "Users.Manage" = @{
            Name = "Manage Users"
            Description = "Create, modify, and delete user accounts"
            Category = "Administration"
            RiskLevel = "High"
        }
        
        "Roles.Manage" = @{
            Name = "Manage Roles"
            Description = "Create, modify, and delete roles and permissions"
            Category = "Administration"
            RiskLevel = "Critical"
        }
        
        "Audit.ViewAll" = @{
            Name = "View Audit Logs"
            Description = "Access to view all audit logs and security events"
            Category = "Security"
            RiskLevel = "High"
        }
        
        "Configuration.Manage" = @{
            Name = "Manage Configuration"
            Description = "Modify system configuration and settings"
            Category = "Administration"
            RiskLevel = "High"
        }
        
        "Compliance.ViewAll" = @{
            Name = "View Compliance Reports"
            Description = "Access to view compliance assessment results"
            Category = "Compliance"
            RiskLevel = "Medium"
        }
        
        "Analytics.ViewAll" = @{
            Name = "View Analytics"
            Description = "Access to view analytics dashboards and insights"
            Category = "Analytics"
            RiskLevel = "Low"
        }
        
        "Reports.ViewCompliance" = @{
            Name = "View Compliance Reports"
            Description = "Specific access to compliance-related reports"
            Category = "Compliance"
            RiskLevel = "Medium"
        }
    }
    
    # Add roles and permissions to session if they don't exist
    foreach ($roleKey in $defaultRoles.Keys) {
        if (!$global:RBACSession.Roles.ContainsKey($roleKey)) {
            $global:RBACSession.Roles[$roleKey] = $defaultRoles[$roleKey]
        }
    }
    
    foreach ($permissionKey in $permissionCatalog.Keys) {
        if (!$global:RBACSession.Permissions.ContainsKey($permissionKey)) {
            $global:RBACSession.Permissions[$permissionKey] = $permissionCatalog[$permissionKey]
        }
    }
    
    # Auto-assign current user as System Administrator if no users exist
    if ($global:RBACSession.Users.Keys.Count -eq 0) {
        Add-RBACUser -Username $global:RBACSession.CurrentUser -Roles @("SystemAdministrator") -AutoCreate
        Write-Host "   👤 Auto-assigned System Administrator role to current user" -ForegroundColor Green
    }
}

function Add-RBACUser {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Username,
        
        [Parameter(Mandatory = $true)]
        [string[]]$Roles,
        
        [Parameter(Mandatory = $false)]
        [string]$FullName,
        
        [Parameter(Mandatory = $false)]
        [string]$Email,
        
        [Parameter(Mandatory = $false)]
        [string]$Department,
        
        [Parameter(Mandatory = $false)]
        [switch]$AutoCreate
    )
    
    # Check if current user has permission to manage users
    if (!$AutoCreate -and !(Test-RBACPermission -Permission "Users.Manage")) {
        throw "Access denied: User management permission required"
    }
    
    # Validate roles exist
    foreach ($role in $Roles) {
        if (!$global:RBACSession.Roles.ContainsKey($role)) {
            throw "Role '$role' does not exist"
        }
    }
    
    $newUser = @{
        Username = $Username
        FullName = $FullName ?? $Username
        Email = $Email ?? ""
        Department = $Department ?? ""
        Roles = $Roles
        CreatedDate = Get-Date
        CreatedBy = $global:RBACSession.CurrentUser
        LastLogin = $null
        FailedAttempts = 0
        IsLocked = $false
        IsEnabled = $true
    }
    
    # Try to get additional info from Active Directory
    try {
        $adUser = Get-ADUser -Identity $Username -Properties DisplayName, EmailAddress, Department -ErrorAction SilentlyContinue
        if ($adUser) {
            $newUser.FullName = $adUser.DisplayName ?? $newUser.FullName
            $newUser.Email = $adUser.EmailAddress ?? $newUser.Email
            $newUser.Department = $adUser.Department ?? $newUser.Department
        }
    } catch {
        # AD lookup failed, continue with provided info
    }
    
    $global:RBACSession.Users[$Username] = $newUser
    Save-RBACConfiguration
    
    Write-AuditEvent -EventType "UserCreated" -Description "User '$Username' created with roles: $($Roles -join ', ')" -Severity "Information"
    Write-Host "✅ User '$Username' added successfully" -ForegroundColor Green
}

function Test-RBACPermission {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Permission,
        
        [Parameter(Mandatory = $false)]
        [string]$Username = $global:RBACSession.CurrentUser
    )
    
    if (!$global:RBACSession.Users.ContainsKey($Username)) {
        Write-AuditEvent -EventType "UnauthorizedAccess" -Description "Permission check failed: User '$Username' not found in RBAC system" -Severity "Warning"
        return $false
    }
    
    $user = $global:RBACSession.Users[$Username]
    
    # Check if user is enabled and not locked
    if (!$user.IsEnabled -or $user.IsLocked) {
        Write-AuditEvent -EventType "UnauthorizedAccess" -Description "Permission check failed: User '$Username' is disabled or locked" -Severity "Warning"
        return $false
    }
    
    # Check each role for the permission
    foreach ($roleName in $user.Roles) {
        $role = $global:RBACSession.Roles[$roleName]
        if ($role.Permissions -contains $Permission -or $role.Permissions -contains "System.FullControl") {
            return $true
        }
    }
    
    Write-AuditEvent -EventType "PermissionDenied" -Description "Permission '$Permission' denied for user '$Username'" -Severity "Information"
    return $false
}

function Invoke-RBACOperation {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Operation,
        
        [Parameter(Mandatory = $true)]
        [string]$RequiredPermission,
        
        [Parameter(Mandatory = $true)]
        [scriptblock]$ScriptBlock,
        
        [Parameter(Mandatory = $false)]
        [hashtable]$Parameters = @{},
        
        [Parameter(Mandatory = $false)]
        [string]$Description
    )
    
    $startTime = Get-Date
    $operationId = [guid]::NewGuid().ToString("N").Substring(0, 8)
    
    try {
        # Check permission
        if (!(Test-RBACPermission -Permission $RequiredPermission)) {
            throw "Access denied: Missing required permission '$RequiredPermission'"
        }
        
        # Log operation start
        Write-AuditEvent -EventType "OperationStarted" -Description "Operation '$Operation' started (ID: $operationId)" -Severity "Information" -AdditionalData @{
            OperationId = $operationId
            RequiredPermission = $RequiredPermission
            Parameters = ($Parameters.Keys -join ', ')
        }
        
        # Execute operation
        $result = & $ScriptBlock @Parameters
        
        # Log successful completion
        $duration = (Get-Date) - $startTime
        Write-AuditEvent -EventType "OperationCompleted" -Description "Operation '$Operation' completed successfully (ID: $operationId, Duration: $($duration.TotalSeconds)s)" -Severity "Information" -AdditionalData @{
            OperationId = $operationId
            Duration = $duration.TotalSeconds
            Success = $true
        }
        
        return $result
        
    } catch {
        # Log failure
        $duration = (Get-Date) - $startTime
        Write-AuditEvent -EventType "OperationFailed" -Description "Operation '$Operation' failed (ID: $operationId): $($_.Exception.Message)" -Severity "Error" -AdditionalData @{
            OperationId = $operationId
            Duration = $duration.TotalSeconds
            Success = $false
            ErrorMessage = $_.Exception.Message
        }
        
        throw
    }
}

function Write-AuditEvent {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet("SystemInitialization", "UserCreated", "UserModified", "UserDeleted", "RoleAssigned", "RoleRevoked", 
                     "PermissionGranted", "PermissionDenied", "LoginSuccess", "LoginFailure", "LogoutSuccess", 
                     "OperationStarted", "OperationCompleted", "OperationFailed", "UnauthorizedAccess", 
                     "ConfigurationChanged", "DataAccessed", "DataModified", "SecurityViolation")]
        [string]$EventType,
        
        [Parameter(Mandatory = $true)]
        [string]$Description,
        
        [Parameter(Mandatory = $true)]
        [ValidateSet("Information", "Warning", "Error", "Critical")]
        [string]$Severity,
        
        [Parameter(Mandatory = $false)]
        [hashtable]$AdditionalData = @{}
    )
    
    $auditEvent = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
        EventType = $EventType
        Severity = $Severity
        Username = $global:RBACSession.CurrentUser
        UserSID = $global:RBACSession.CurrentUserSID
        ComputerName = $env:COMPUTERNAME
        ProcessId = $PID
        Description = $Description
        AdditionalData = $AdditionalData
        EventId = [guid]::NewGuid().ToString()
    }
    
    # Add to session events
    $global:RBACSession.AuditEvents += $auditEvent
    
    # Write to audit log file
    $logEntry = $auditEvent | ConvertTo-Json -Compress
    $auditLogFile = Join-Path $global:RBACSession.AuditLogPath "Audit_$(Get-Date -Format 'yyyyMMdd').json"
    
    try {
        $logEntry | Out-File -FilePath $auditLogFile -Append -Encoding UTF8
    } catch {
        Write-Warning "Failed to write audit event: $($_.Exception.Message)"
    }
    
    # Write to Windows Event Log if available
    try {
        $eventId = switch ($EventType) {
            "LoginSuccess" { 4624 }
            "LoginFailure" { 4625 }
            "UnauthorizedAccess" { 4656 }
            "SecurityViolation" { 4657 }
            default { 1000 }
        }
        
        $eventLogLevel = switch ($Severity) {
            "Information" { "Information" }
            "Warning" { "Warning" }
            "Error" { "Error" }
            "Critical" { "Error" }
        }
        
        Write-EventLog -LogName "Application" -Source "M&A Discovery Suite" -EventId $eventId -EntryType $eventLogLevel -Message $Description -ErrorAction SilentlyContinue
    } catch {
        # Event log writing failed, continue silently
    }
}

function Get-RBACUserInfo {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [string]$Username = $global:RBACSession.CurrentUser
    )
    
    if (!$global:RBACSession.Users.ContainsKey($Username)) {
        return $null
    }
    
    $user = $global:RBACSession.Users[$Username]
    $effectivePermissions = @()
    
    # Collect all permissions from all roles
    foreach ($roleName in $user.Roles) {
        $role = $global:RBACSession.Roles[$roleName]
        $effectivePermissions += $role.Permissions
    }
    
    $effectivePermissions = $effectivePermissions | Sort-Object -Unique
    
    return @{
        Username = $user.Username
        FullName = $user.FullName
        Email = $user.Email
        Department = $user.Department
        Roles = $user.Roles
        EffectivePermissions = $effectivePermissions
        IsEnabled = $user.IsEnabled
        IsLocked = $user.IsLocked
        LastLogin = $user.LastLogin
        CreatedDate = $user.CreatedDate
    }
}

function Get-AuditEvents {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $false)]
        [DateTime]$StartDate = (Get-Date).AddDays(-7),
        
        [Parameter(Mandatory = $false)]
        [DateTime]$EndDate = (Get-Date),
        
        [Parameter(Mandatory = $false)]
        [string]$EventType,
        
        [Parameter(Mandatory = $false)]
        [string]$Username,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("Information", "Warning", "Error", "Critical")]
        [string]$Severity,
        
        [Parameter(Mandatory = $false)]
        [int]$MaxResults = 1000
    )
    
    # Check permission
    if (!(Test-RBACPermission -Permission "Audit.ViewAll")) {
        throw "Access denied: Audit viewing permission required"
    }
    
    $events = @()
    
    # Load events from audit log files
    $logFiles = Get-ChildItem -Path $global:RBACSession.AuditLogPath -Filter "Audit_*.json" | 
                Where-Object { $_.LastWriteTime -ge $StartDate -and $_.LastWriteTime -le $EndDate } |
                Sort-Object LastWriteTime -Descending
    
    foreach ($logFile in $logFiles) {
        try {
            $fileContent = Get-Content $logFile.FullName
            foreach ($line in $fileContent) {
                try {
                    $event = $line | ConvertFrom-Json
                    $eventDate = [DateTime]::Parse($event.Timestamp)
                    
                    # Apply filters
                    if ($eventDate -lt $StartDate -or $eventDate -gt $EndDate) { continue }
                    if ($EventType -and $event.EventType -ne $EventType) { continue }
                    if ($Username -and $event.Username -ne $Username) { continue }
                    if ($Severity -and $event.Severity -ne $Severity) { continue }
                    
                    $events += $event
                    
                    if ($events.Count -ge $MaxResults) { break }
                } catch {
                    # Skip malformed JSON lines
                    continue
                }
            }
            
            if ($events.Count -ge $MaxResults) { break }
        } catch {
            Write-Warning "Failed to read audit log file $($logFile.Name): $($_.Exception.Message)"
        }
    }
    
    Write-AuditEvent -EventType "DataAccessed" -Description "Audit events queried (Count: $($events.Count))" -Severity "Information"
    
    return $events | Sort-Object { [DateTime]::Parse($_.Timestamp) } -Descending
}

function Export-AuditReport {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$OutputPath,
        
        [Parameter(Mandatory = $false)]
        [DateTime]$StartDate = (Get-Date).AddDays(-30),
        
        [Parameter(Mandatory = $false)]
        [DateTime]$EndDate = (Get-Date),
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("HTML", "CSV", "JSON")]
        [string]$Format = "HTML"
    )
    
    # Check permission
    if (!(Test-RBACPermission -Permission "Audit.ViewAll")) {
        throw "Access denied: Audit viewing permission required"
    }
    
    $events = Get-AuditEvents -StartDate $StartDate -EndDate $EndDate
    
    switch ($Format) {
        "HTML" {
            $html = Generate-AuditReportHTML -Events $events -StartDate $StartDate -EndDate $EndDate
            $html | Out-File -FilePath $OutputPath -Encoding UTF8
        }
        "CSV" {
            $csvData = $events | Select-Object Timestamp, EventType, Severity, Username, ComputerName, Description
            $csvData | Export-Csv -Path $OutputPath -NoTypeInformation
        }
        "JSON" {
            $events | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputPath -Encoding UTF8
        }
    }
    
    Write-AuditEvent -EventType "DataAccessed" -Description "Audit report exported to $OutputPath" -Severity "Information"
    Write-Host "📊 Audit report exported: $OutputPath" -ForegroundColor Green
}

function Generate-AuditReportHTML {
    param(
        [array]$Events,
        [DateTime]$StartDate,
        [DateTime]$EndDate
    )
    
    $eventStats = $Events | Group-Object EventType | ForEach-Object {
        @{
            EventType = $_.Name
            Count = $_.Count
            Percentage = [math]::Round(($_.Count / $Events.Count) * 100, 2)
        }
    } | Sort-Object Count -Descending
    
    $severityStats = $Events | Group-Object Severity | ForEach-Object {
        @{
            Severity = $_.Name
            Count = $_.Count
            Percentage = [math]::Round(($_.Count / $Events.Count) * 100, 2)
        }
    } | Sort-Object Count -Descending
    
    $html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Security Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2c3e50; }
        .events-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .events-table th, .events-table td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
        .events-table th { background: #f8f9fa; }
        .severity-critical { color: #dc3545; font-weight: bold; }
        .severity-error { color: #fd7e14; }
        .severity-warning { color: #ffc107; }
        .severity-information { color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Security Audit Report</h1>
        <p>Period: $($StartDate.ToString('yyyy-MM-dd')) to $($EndDate.ToString('yyyy-MM-dd'))</p>
        <p>Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
    </div>
    
    <div class="summary">
        <div class="metric-card">
            <div class="metric-value">$($Events.Count)</div>
            <div>Total Events</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">$(($Events | Where-Object { $_.Severity -eq 'Critical' }).Count)</div>
            <div>Critical Events</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">$(($Events | Where-Object { $_.Severity -eq 'Error' }).Count)</div>
            <div>Error Events</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">$(($Events | Select-Object Username -Unique).Count)</div>
            <div>Unique Users</div>
        </div>
    </div>
    
    <h2>Recent Events</h2>
    <table class="events-table">
        <thead>
            <tr>
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>Severity</th>
                <th>User</th>
                <th>Computer</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
"@

    foreach ($event in ($Events | Select-Object -First 50)) {
        $severityClass = "severity-$($event.Severity.ToLower())"
        $html += @"
            <tr>
                <td>$($event.Timestamp)</td>
                <td>$($event.EventType)</td>
                <td class="$severityClass">$($event.Severity)</td>
                <td>$($event.Username)</td>
                <td>$($event.ComputerName)</td>
                <td>$($event.Description)</td>
            </tr>
"@
    }

    $html += @"
        </tbody>
    </table>
</body>
</html>
"@
    
    return $html
}

function Sync-WithActiveDirectory {
    try {
        Import-Module ActiveDirectory -ErrorAction Stop
        
        # Get all AD users
        $adUsers = Get-ADUser -Filter * -Properties DisplayName, EmailAddress, Department, MemberOf
        
        foreach ($adUser in $adUsers) {
            $username = $adUser.SamAccountName
            
            # Check if user already exists in RBAC
            if ($global:RBACSession.Users.ContainsKey($username)) {
                # Update existing user info
                $rbacUser = $global:RBACSession.Users[$username]
                $rbacUser.FullName = $adUser.DisplayName ?? $rbacUser.FullName
                $rbacUser.Email = $adUser.EmailAddress ?? $rbacUser.Email
                $rbacUser.Department = $adUser.Department ?? $rbacUser.Department
            }
        }
        
        Write-Host "   ✅ Active Directory sync completed" -ForegroundColor Green
        
    } catch {
        Write-Warning "Active Directory sync failed: $($_.Exception.Message)"
    }
}

function Initialize-WindowsIntegration {
    # Setup Windows authentication integration
    $global:RBACSession.WindowsIntegration = @{
        Enabled = $true
        UseWindowsGroups = $true
        GroupMappings = @{
            "Domain Admins" = "SystemAdministrator"
            "Enterprise Admins" = "SystemAdministrator"
            "M&A Discovery Operators" = "DiscoveryOperator"
            "M&A Reports Analysts" = "ReportsAnalyst"
        }
    }
    
    Write-Host "   ✅ Windows integration configured" -ForegroundColor Green
}

function Initialize-AuditLogging {
    param([string]$AuditLogPath)
    
    # Setup audit log rotation
    $global:RBACSession.AuditSettings = @{
        LogPath = $AuditLogPath
        RotationSize = 50MB
        RetentionDays = 365
        CompressionEnabled = $true
    }
    
    # Clean up old audit files
    $cutoffDate = (Get-Date).AddDays(-$global:RBACSession.AuditSettings.RetentionDays)
    Get-ChildItem -Path $AuditLogPath -Filter "Audit_*.json" | 
        Where-Object { $_.LastWriteTime -lt $cutoffDate } | 
        Remove-Item -Force
    
    Write-Host "   ✅ Audit logging initialized" -ForegroundColor Green
}

function Save-RBACConfiguration {
    $config = @{
        Roles = $global:RBACSession.Roles
        Permissions = $global:RBACSession.Permissions
        Users = $global:RBACSession.Users
        LastModified = Get-Date
        ModifiedBy = $global:RBACSession.CurrentUser
    }
    
    try {
        $config | ConvertTo-Json -Depth 10 | Out-File -FilePath $global:RBACSession.ConfigPath -Encoding UTF8
        Write-AuditEvent -EventType "ConfigurationChanged" -Description "RBAC configuration saved" -Severity "Information"
    } catch {
        Write-Error "Failed to save RBAC configuration: $($_.Exception.Message)"
    }
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
Export-ModuleMember -Function Initialize-RBACSystem, Add-RBACUser, Test-RBACPermission, Invoke-RBACOperation, 
                              Write-AuditEvent, Get-RBACUserInfo, Get-AuditEvents, Export-AuditReport

Write-Host "✅ Role-Based Access Control and Audit Logging module loaded successfully" -ForegroundColor Green