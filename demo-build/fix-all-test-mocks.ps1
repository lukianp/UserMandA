# Comprehensive Test Mock Fix Script
# Automatically adds proper mock structures to all view tests

$ErrorActionPreference = "Continue"
$fixedCount = 0
$failedFiles = @()

# Import mock fixtures reference
$mockFixturesPath = "src/test-utils/mockFixtures.ts"
if (-not (Test-Path $mockFixturesPath)) {
    Write-Host "Error: mockFixtures.ts not found!" -ForegroundColor Red
    exit 1
}

# Common mock structures for different view types
$commonMocks = @{
    "InfrastructureView" = @"
const mockInfrastructure = {
  servers: [
    { name: 'SRV-DC-01', role: 'Domain Controller', status: 'Online', cpu: 45, memory: 60 },
    { name: 'SRV-SQL-01', role: 'Database', status: 'Online', cpu: 70, memory: 85 },
  ],
  networkDevices: [
    { name: 'RTR-CORE-01', type: 'Router', status: 'Online', uptime: 99.9 },
  ],
  storage: [],
};

  const mockHookDefaults = {
    infrastructure: mockInfrastructure,
    statistics: { servers: 2, networkDevices: 1, storage: 0 },
    isLoading: false,
    error: null,
    refreshData: jest.fn(),
    exportData: jest.fn(),
  };
"@

    "CostAnalysisView" = @"
const mockCostData = {
  totalCost: 125000,
  monthlyCost: 10416.67,
  costByCategory: [
    { category: 'Licensing', amount: 75000 },
    { category: 'Infrastructure', amount: 35000 },
  ],
};

  const mockHookDefaults = {
    costData: mockCostData,
    chartData: [{ name: 'Jan', value: 400 }],
    isLoading: false,
    error: null,
    refreshData: jest.fn(),
    exportData: jest.fn(),
  };
"@

    "ApplicationDiscoveryView" = @"
const mockApplications = [
  { id: 'app-1', name: 'Microsoft Office', version: '2021', installs: 98 },
  { id: 'app-2', name: 'Adobe Acrobat', version: 'DC', installs: 45 },
];

  const mockHookDefaults = {
    applications: mockApplications,
    isRunning: false,
    progress: { current: 0, total: 100, percentage: 0, message: '' },
    startDiscovery: jest.fn(),
    cancelDiscovery: jest.fn(),
    exportResults: jest.fn(),
  };
"@

    "ComplianceDashboardView" = @"
const mockComplianceData = {
  totalPolicies: 25,
  compliantPolicies: 20,
  violations: 5,
  resolvedViolations: 15,
  pendingViolations: 5,
  policies: [
    { id: 'pol-1', name: 'Password Policy', status: 'Compliant' },
  ],
};

  const mockHookDefaults = {
    complianceData: mockComplianceData,
    isLoading: false,
    error: null,
    refreshData: jest.fn(),
    exportData: jest.fn(),
  };
"@

    "IdentityGovernanceDiscoveryView" = @"
const mockAzureProfile = {
  tenantId: '12345678-1234-1234-1234-123456789012',
  clientId: '87654321-4321-4321-4321-210987654321',
  isValid: true,
};

  const mockHookDefaults = {
    selectedProfile: mockAzureProfile,
    isRunning: false,
    progress: { current: 0, total: 100, percentage: 0, message: '' },
    startDiscovery: jest.fn(),
    cancelDiscovery: jest.fn(),
    exportResults: jest.fn(),
  };
"@

    "ActiveDirectoryDiscoveryView" = @"
const mockADData = {
  domainControllers: [
    { name: 'DC01', site: 'Default-First-Site', ipAddress: '192.168.1.10' },
  ],
  organizationalUnits: [
    { name: 'Users', path: 'OU=Users,DC=example,DC=com', objectCount: 150 },
  ],
  users: [],
  groups: [],
  computers: [],
};

  const mockHookDefaults = {
    adData: mockADData,
    isRunning: false,
    progress: { current: 0, total: 100, percentage: 0, message: '' },
    startDiscovery: jest.fn(),
    cancelDiscovery: jest.fn(),
    exportResults: jest.fn(),
  };
"@
}

# Function to fix a specific view test
function Fix-ViewTest {
    param (
        [string]$FilePath,
        [string]$ViewName
    )

    if (-not (Test-Path $FilePath)) {
        Write-Host "  File not found: $FilePath" -ForegroundColor Yellow
        return $false
    }

    $content = Get-Content $FilePath -Raw

    # Check if mock structure needs updating
    $needsUpdate = $false

    # Look for common patterns that indicate missing mocks
    if ($content -match 'const mockHookDefaults = \{[^}]*data: \[\][^}]*\}') {
        $needsUpdate = $true
    }

    if (-not $needsUpdate) {
        Write-Host "  $ViewName already has proper mocks" -ForegroundColor Gray
        return $true
    }

    # Replace generic mock with specific one if available
    if ($commonMocks.ContainsKey($ViewName)) {
        $mockStructure = $commonMocks[$ViewName]

        # Find and replace the mock defaults section
        $pattern = 'const mockHookDefaults = \{[^}]*\};'
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $mockStructure
            Set-Content -Path $FilePath -Value $content -NoNewline
            Write-Host "  Fixed: $ViewName" -ForegroundColor Green
            return $true
        }
    }

    return $false
}

# Get all view test files
$testFiles = Get-ChildItem -Path "src/renderer/views" -Filter "*.test.tsx" -Recurse

Write-Host "Found $($testFiles.Count) view test files to process`n" -ForegroundColor Cyan

foreach ($file in $testFiles) {
    $viewName = $file.BaseName -replace '\.test$', ''
    Write-Host "Processing: $viewName"

    try {
        if (Fix-ViewTest -FilePath $file.FullName -ViewName $viewName) {
            $fixedCount++
        }
    }
    catch {
        Write-Host "  Error processing $viewName : $_" -ForegroundColor Red
        $failedFiles += $file.FullName
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
