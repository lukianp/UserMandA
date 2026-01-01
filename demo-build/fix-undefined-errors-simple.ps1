# Simple script to fix undefined property errors in test files
$ErrorActionPreference = "Continue"
$fixedCount = 0

Write-Host "=== FIXING UNDEFINED PROPERTY ACCESS ERRORS ===" -ForegroundColor Cyan

# Function to add properties to mockHookDefaults
function Add-MockProperties {
    param (
        [string]$FilePath,
        [string[]]$Properties
    )

    if (-not (Test-Path $FilePath)) {
        return $false
    }

    $content = Get-Content $FilePath -Raw

    # Check if mockHookDefaults exists
    if ($content -notmatch 'const mockHookDefaults = \{') {
        return $false
    }

    # Build the properties to add
    $propsText = ""
    foreach ($prop in $Properties) {
        $propsText += "    $prop,`n"
    }

    # Find and inject properties after mockHookDefaults = {
    $pattern = '(const mockHookDefaults = \{)'
    $replacement = "`$1`n$propsText"

    $content = $content -replace $pattern, $replacement
    Set-Content -Path $FilePath -Value $content -NoNewline

    return $true
}

# Fix OneDriveDiscoveryView - needs items array
Write-Host "Fixing OneDriveDiscoveryView..." -ForegroundColor Gray
if (Add-MockProperties "src/renderer/views/discovery/OneDriveDiscoveryView.test.tsx" @("items: []", "applications: []")) {
    Write-Host "  ✓ Fixed" -ForegroundColor Green
    $fixedCount++
}

# Fix IntuneDiscoveryView - needs searchText
Write-Host "Fixing IntuneDiscoveryView..." -ForegroundColor Gray
$intuneProps = @("searchText: ''", "setSearchText: jest.fn``(``)")
if (Add-MockProperties "src/renderer/views/discovery/IntuneDiscoveryView.test.tsx" $intuneProps) {
    Write-Host "  ✓ Fixed" -ForegroundColor Green
    $fixedCount++
}

# Fix TeamsDiscoveryView - needs teams array
Write-Host "Fixing TeamsDiscoveryView..." -ForegroundColor Gray
if (Add-MockProperties "src/renderer/views/discovery/TeamsDiscoveryView.test.tsx" @("teams: []")) {
    Write-Host "  ✓ Fixed" -ForegroundColor Green
    $fixedCount++
}

# Fix DomainDiscoveryView - needs domain object
Write-Host "Fixing DomainDiscoveryView..." -ForegroundColor Gray
if (Add-MockProperties "src/renderer/views/discovery/DomainDiscoveryView.test.tsx" @("selectedDomain: { name: 'example.com', toString: jest.fn() }", "domain: 'example.com'")) {
    Write-Host "  ✓ Fixed" -ForegroundColor Green
    $fixedCount++
}

# Fix SharePointDiscoveryView - needs sites array
Write-Host "Fixing SharePointDiscoveryView..." -ForegroundColor Gray
if (Add-MockProperties "src/renderer/views/discovery/SharePointDiscoveryView.test.tsx" @("sites: []")) {
    Write-Host "  ✓ Fixed" -ForegroundColor Green
    $fixedCount++
}

# Fix Office365DiscoveryView - needs modules array
Write-Host "Fixing Office365DiscoveryView..." -ForegroundColor Gray
if (Add-MockProperties "src/renderer/views/discovery/Office365DiscoveryView.test.tsx" @("modules: []")) {
    Write-Host "  ✓ Fixed" -ForegroundColor Green
    $fixedCount++
}

# Fix Network/Server/Security inventory views - need statistics
$statsProps = @("statistics: { total: 0, active: 0, inactive: 0, critical: 0, warning: 0, info: 0 }")

$inventoryViews = @(
    "src/renderer/views/assets/NetworkDeviceInventoryView.test.tsx",
    "src/renderer/views/assets/ServerInventoryView.test.tsx",
    "src/renderer/views/security/SecurityAuditView.test.tsx",
    "src/renderer/views/security/ThreatAnalysisView.test.tsx",
    "src/renderer/views/security/RiskAssessmentView.test.tsx",
    "src/renderer/views/security/PolicyManagementView.test.tsx",
    "src/renderer/views/assets/ComputerInventoryView.test.tsx",
    "src/renderer/views/compliance/ComplianceReportView.test.tsx"
)

foreach ($view in $inventoryViews) {
    $viewName = Split-Path $view -Leaf
    Write-Host "Fixing $viewName..." -ForegroundColor Gray
    if (Add-MockProperties $view $statsProps) {
        Write-Host "  ✓ Fixed" -ForegroundColor Green
        $fixedCount++
    }
}

# Fix FileSystemDiscoveryView - needs servers
Write-Host "Fixing FileSystemDiscoveryView..." -ForegroundColor Gray
if (Add-MockProperties "src/renderer/views/discovery/FileSystemDiscoveryView.test.tsx" @("servers: []", "selectedServers: []")) {
    Write-Host "  ✓ Fixed" -ForegroundColor Green
    $fixedCount++
}

# Fix HyperVDiscoveryView - needs hostAddresses
Write-Host "Fixing HyperVDiscoveryView..." -ForegroundColor Gray
if (Add-MockProperties "src/renderer/views/discovery/HyperVDiscoveryView.test.tsx" @("hostAddresses: []", "servers: []")) {
    Write-Host "  ✓ Fixed" -ForegroundColor Green
    $fixedCount++
}

# Fix Azure/Cloud views - need profile
$azureProps = @("selectedProfile: { tenantId: '12345678-1234-1234-1234-123456789012', clientId: '87654321-4321-4321-4321-210987654321', isValid: true }")

$azureViews = @(
    "src/renderer/views/discovery/IdentityGovernanceDiscoveryView.test.tsx",
    "src/renderer/views/discovery/DataLossPreventionDiscoveryView.test.tsx"
)

foreach ($view in $azureViews) {
    $viewName = Split-Path $view -Leaf
    Write-Host "Fixing $viewName..." -ForegroundColor Gray
    if (Add-MockProperties $view $azureProps) {
        Write-Host "  ✓ Fixed" -ForegroundColor Green
        $fixedCount++
    }
}

# Fix discovery views with array properties
$arrayViews = @{
    "src/renderer/views/discovery/ApplicationDiscoveryView.test.tsx" = @("applications: []")
    "src/renderer/views/discovery/ExchangeDiscoveryView.test.tsx" = @("mailboxes: []")
    "src/renderer/views/discovery/VMwareDiscoveryView.test.tsx" = @("virtualMachines: []", "vCenterServers: []")
    "src/renderer/views/discovery/SecurityInfrastructureDiscoveryView.test.tsx" = @("devices: []")
    "src/renderer/views/discovery/ActiveDirectoryDiscoveryView.test.tsx" = @("domains: []", "users: []", "groups: []")
    "src/renderer/views/discovery/SQLServerDiscoveryView.test.tsx" = @("servers: []", "databases: []")
    "src/renderer/views/discovery/GoogleWorkspaceDiscoveryView.test.tsx" = @("users: []", "groups: []")
    "src/renderer/views/discovery/AzureDiscoveryView.test.tsx" = @("resources: []", "subscriptions: []")
    "src/renderer/views/discovery/WebServerConfigurationDiscoveryView.test.tsx" = @("servers: []")
    "src/renderer/views/discovery/NetworkDiscoveryView.test.tsx" = @("devices: []")
    "src/renderer/views/discovery/PowerPlatformDiscoveryView.test.tsx" = @("apps: []", "flows: []")
    "src/renderer/views/discovery/ConditionalAccessPoliciesDiscoveryView.test.tsx" = @("policies: []")
    "src/renderer/views/discovery/AWSCloudInfrastructureDiscoveryView.test.tsx" = @("resources: []", "instances: []")
}

foreach ($view in $arrayViews.Keys) {
    $viewName = Split-Path $view -Leaf
    Write-Host "Fixing $viewName..." -ForegroundColor Gray
    if (Add-MockProperties $view $arrayViews[$view]) {
        Write-Host "  ✓ Fixed" -ForegroundColor Green
        $fixedCount++
    }
}

# Fix ComplianceDashboardView - needs compliance data
Write-Host "Fixing ComplianceDashboardView..." -ForegroundColor Gray
if (Add-MockProperties "src/renderer/views/compliance/ComplianceDashboardView.test.tsx" @("complianceData: { totalPolicies: 25, compliantPolicies: 20, violations: 5, resolvedViolations: 15, pendingViolations: 5 }")) {
    Write-Host "  ✓ Fixed" -ForegroundColor Green
    $fixedCount++
}

# Fix SecurityDashboardView - needs security data
Write-Host "Fixing SecurityDashboardView..." -ForegroundColor Gray
if (Add-MockProperties "src/renderer/views/security/SecurityDashboardView.test.tsx" @("securityData: { criticalVulnerabilities: 0, highVulnerabilities: 0, mediumVulnerabilities: 0, lowVulnerabilities: 0, totalVulnerabilities: 0 }")) {
    Write-Host "  ✓ Fixed" -ForegroundColor Green
    $fixedCount++
}

# Fix EnvironmentDetectionView - needs detection methods
Write-Host "Fixing EnvironmentDetectionView..." -ForegroundColor Gray
if (Add-MockProperties "src/renderer/views/discovery/EnvironmentDetectionView.test.tsx" @("detectAzure: jest.fn()", "detectAWS: jest.fn()", "detectGCP: jest.fn()", "detectOnPrem: jest.fn()")) {
    Write-Host "  ✓ Fixed" -ForegroundColor Green
    $fixedCount++
}

# Fix InfrastructureDiscoveryHubView - needs modules
Write-Host "Fixing InfrastructureDiscoveryHubView..." -ForegroundColor Gray
if (Add-MockProperties "src/renderer/views/discovery/InfrastructureDiscoveryHubView.test.tsx" @("modules: []", "availableModules: []")) {
    Write-Host "  ✓ Fixed" -ForegroundColor Green
    $fixedCount++
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Successfully fixed: $fixedCount test files" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Run npm test to verify fixes" -ForegroundColor Yellow
