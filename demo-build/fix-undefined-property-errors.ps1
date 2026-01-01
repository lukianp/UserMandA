# Enhanced Test Mock Fix Script
# Automatically fixes undefined property access errors in all view tests

$ErrorActionPreference = "Continue"
$fixedCount = 0
$failedFiles = @()

Write-Host "=== FIXING UNDEFINED PROPERTY ACCESS ERRORS ===" -ForegroundColor Cyan
Write-Host ""

# Common mock structures for different property patterns
$mockStructures = @{
    # For views accessing data arrays with .map()
    "MapArray" = @{
        Pattern = 'Cannot read properties of undefined \(reading ''map''\)'
        MockData = @"
applications: [],
    devices: [],
    items: [],
    modules: [],
    policies: [],
    sites: [],
    teams: [],
    users: [],
    groups: [],
    computers: [],
"@
    }

    # For views accessing statistics.total
    "Statistics" = @{
        Pattern = 'Cannot read properties of undefined \(reading ''total''\)'
        MockData = @"
statistics: {
      total: 0,
      active: 0,
      inactive: 0,
      critical: 0,
      warning: 0,
      info: 0,
    },
"@
    }

    # For Azure profile views
    "AzureProfile" = @{
        Pattern = 'Cannot read properties of undefined \(reading ''tenantId''\)'
        MockData = @"
selectedProfile: {
      tenantId: '12345678-1234-1234-1234-123456789012',
      clientId: '87654321-4321-4321-4321-210987654321',
      clientSecret: 'test-secret',
      isValid: true,
    },
"@
    }

    # For search functionality
    "SearchText" = @{
        Pattern = 'Cannot read properties of undefined \(reading ''searchText''\)'
        MockData = @"
searchText: '',
    setSearchText: jest.fn(),
"@
    }

    # For HyperV and server views
    "HostAddresses" = @{
        Pattern = 'Cannot read properties of undefined \(reading ''hostAddresses''\)'
        MockData = @"
hostAddresses: [],
    servers: [],
    vCenterServers: [],
"@
    }

    # For FileSystem discovery
    "Servers" = @{
        Pattern = 'Cannot read properties of undefined \(reading ''servers''\)'
        MockData = @"
servers: [],
    selectedServers: [],
"@
    }

    # For compliance views
    "ComplianceData" = @{
        Pattern = 'Cannot read properties of undefined \(reading ''resolvedViolations''\)'
        MockData = @"
complianceData: {
      totalPolicies: 25,
      compliantPolicies: 20,
      violations: 5,
      resolvedViolations: 15,
      pendingViolations: 5,
    },
"@
    }

    # For security dashboard
    "SecurityData" = @{
        Pattern = 'Cannot read properties of undefined \(reading ''criticalVulnerabilities''\)'
        MockData = @"
securityData: {
      criticalVulnerabilities: 0,
      highVulnerabilities: 0,
      mediumVulnerabilities: 0,
      lowVulnerabilities: 0,
      totalVulnerabilities: 0,
    },
"@
    }

    # For environment detection
    "DetectionMethods" = @{
        Pattern = 'Cannot read properties of undefined \(reading ''detectAzure''\)'
        MockData = @"
detectAzure: jest.fn(),
    detectAWS: jest.fn(),
    detectGCP: jest.fn(),
    detectOnPrem: jest.fn(),
"@
    }

    # For infrastructure discovery hub
    "ModulesLength" = @{
        Pattern = 'Cannot read properties of undefined \(reading ''length''\)'
        MockData = @"
modules: [],
    availableModules: [],
    installedModules: [],
"@
    }

    # For domain discovery toString
    "DomainObject" = @{
        Pattern = 'Cannot read properties of undefined \(reading ''toString''\)'
        MockData = @"
selectedDomain: {
      name: 'example.com',
      toString: jest.fn().mockReturnValue('example.com'),
    },
    domain: 'example.com',
"@
    }
}

# Function to detect which mock structure is needed
function Get-RequiredMockStructure {
    param (
        [string]$FilePath,
        [string]$ViewSourcePath
    )

    $requiredStructures = @()

    # Try to read the view source file to understand what properties it uses
    if (Test-Path $ViewSourcePath) {
        $viewContent = Get-Content $ViewSourcePath -Raw

        # Check for common patterns
        if ($viewContent -match '\.map\(') {
            $requiredStructures += "MapArray"
        }
        if ($viewContent -match 'statistics\.total' -or $viewContent -match 'statistics\?\.total') {
            $requiredStructures += "Statistics"
        }
        if ($viewContent -match 'selectedProfile\.tenantId' -or $viewContent -match 'profile\.tenantId') {
            $requiredStructures += "AzureProfile"
        }
        if ($viewContent -match 'searchText') {
            $requiredStructures += "SearchText"
        }
        if ($viewContent -match 'hostAddresses') {
            $requiredStructures += "HostAddresses"
        }
        if ($viewContent -match '\.servers') {
            $requiredStructures += "Servers"
        }
        if ($viewContent -match 'complianceData\.') {
            $requiredStructures += "ComplianceData"
        }
        if ($viewContent -match 'securityData\.' -or $viewContent -match 'criticalVulnerabilities') {
            $requiredStructures += "SecurityData"
        }
        if ($viewContent -match 'detectAzure') {
            $requiredStructures += "DetectionMethods"
        }
        if ($viewContent -match '\.length') {
            $requiredStructures += "ModulesLength"
        }
        if ($viewContent -match '\.toString\(\)') {
            $requiredStructures += "DomainObject"
        }
    }

    return $requiredStructures | Select-Object -Unique
}

# Function to fix a test file
function Fix-TestFile {
    param (
        [string]$FilePath
    )

    if (-not (Test-Path $FilePath)) {
        Write-Host "  File not found: $FilePath" -ForegroundColor Yellow
        return $false
    }

    # Derive the view source path from test path
    $viewSourcePath = $FilePath -replace '\.test\.tsx$', '.tsx'
    $viewSourcePath = $viewSourcePath -replace '\.test\.ts$', '.ts'

    $viewName = Split-Path $FilePath -Leaf
    $viewName = $viewName -replace '\.test\.tsx$', ''
    $viewName = $viewName -replace '\.test\.ts$', ''

    Write-Host "Processing: $viewName" -ForegroundColor Gray

    # Get required mock structures
    $requiredStructures = Get-RequiredMockStructure -FilePath $FilePath -ViewSourcePath $viewSourcePath

    if ($requiredStructures.Count -eq 0) {
        Write-Host "  No patterns detected, skipping" -ForegroundColor DarkGray
        return $false
    }

    $content = Get-Content $FilePath -Raw

    # Find the mockHookDefaults object
    if ($content -notmatch 'const mockHookDefaults = \{') {
        Write-Host "  No mockHookDefaults found, skipping" -ForegroundColor DarkGray
        return $false
    }

    # Build the enhanced mock structure
    $additionalMocks = ""
    foreach ($structureName in $requiredStructures) {
        $structure = $mockStructures[$structureName]
        if ($structure) {
            $additionalMocks += "    $($structure.MockData)`n"
            Write-Host "  + Adding $structureName mock" -ForegroundColor Green
        }
    }

    if ([string]::IsNullOrWhiteSpace($additionalMocks)) {
        return $false
    }

    # Find the mockHookDefaults and inject the additional properties
    # Look for the pattern: const mockHookDefaults = { ... };
    $pattern = '(const mockHookDefaults = \{[^\}]*)'
    $replacement = "`$1`n$additionalMocks"

    if ($content -match $pattern) {
        $content = $content -replace $pattern, $replacement
        Set-Content -Path $FilePath -Value $content -NoNewline
        Write-Host "  ✓ Fixed: $viewName" -ForegroundColor Green
        return $true
    }

    return $false
}

# Get all test files from the error analysis
$testFiles = @(
    "src/renderer/views/discovery/OneDriveDiscoveryView.test.tsx",
    "src/renderer/views/discovery/IntuneDiscoveryView.test.tsx",
    "src/renderer/views/discovery/TeamsDiscoveryView.test.tsx",
    "src/renderer/views/discovery/DomainDiscoveryView.test.tsx",
    "src/renderer/views/discovery/SharePointDiscoveryView.test.tsx",
    "src/renderer/views/discovery/Office365DiscoveryView.test.tsx",
    "src/renderer/views/assets/NetworkDeviceInventoryView.test.tsx",
    "src/renderer/views/assets/ServerInventoryView.test.tsx",
    "src/renderer/views/security/SecurityAuditView.test.tsx",
    "src/renderer/views/security/ThreatAnalysisView.test.tsx",
    "src/renderer/views/discovery/FileSystemDiscoveryView.test.tsx",
    "src/renderer/views/security/RiskAssessmentView.test.tsx",
    "src/renderer/views/discovery/SecurityInfrastructureDiscoveryView.test.tsx",
    "src/renderer/views/security/PolicyManagementView.test.tsx",
    "src/renderer/views/compliance/ComplianceDashboardView.test.tsx",
    "src/renderer/views/discovery/HyperVDiscoveryView.test.tsx",
    "src/renderer/views/discovery/ApplicationDiscoveryView.test.tsx",
    "src/renderer/views/discovery/ExchangeDiscoveryView.test.tsx",
    "src/renderer/views/discovery/IdentityGovernanceDiscoveryView.test.tsx",
    "src/renderer/views/discovery/VMwareDiscoveryView.test.tsx",
    "src/renderer/views/security/SecurityDashboardView.test.tsx",
    "src/renderer/views/discovery/DataLossPreventionDiscoveryView.test.tsx",
    "src/renderer/views/compliance/ComplianceReportView.test.tsx",
    "src/renderer/views/discovery/ActiveDirectoryDiscoveryView.test.tsx",
    "src/renderer/views/assets/ComputerInventoryView.test.tsx",
    "src/renderer/views/discovery/SQLServerDiscoveryView.test.tsx",
    "src/renderer/views/discovery/GoogleWorkspaceDiscoveryView.test.tsx",
    "src/renderer/views/discovery/AzureDiscoveryView.test.tsx",
    "src/renderer/views/discovery/WebServerConfigurationDiscoveryView.test.tsx",
    "src/renderer/views/discovery/EnvironmentDetectionView.test.tsx",
    "src/renderer/views/discovery/InfrastructureDiscoveryHubView.test.tsx",
    "src/renderer/views/discovery/NetworkDiscoveryView.test.tsx",
    "src/renderer/views/discovery/PowerPlatformDiscoveryView.test.tsx",
    "src/renderer/views/discovery/ConditionalAccessPoliciesDiscoveryView.test.tsx",
    "src/renderer/views/discovery/AWSCloudInfrastructureDiscoveryView.test.tsx"
)

Write-Host "Found $($testFiles.Count) test files with undefined property errors`n" -ForegroundColor Cyan

foreach ($file in $testFiles) {
    try {
        if (Fix-TestFile -FilePath $file) {
            $fixedCount++
        }
    }
    catch {
        Write-Host "  Error processing $file : $_" -ForegroundColor Red
        $failedFiles += $file
    }
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Successfully fixed: $fixedCount test files" -ForegroundColor Green

if ($failedFiles.Count -gt 0) {
    Write-Host "Failed files: $($failedFiles.Count)" -ForegroundColor Red
    foreach ($failed in $failedFiles) {
        Write-Host "  - $failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Next: Run npm test to verify fixes" -ForegroundColor Yellow
