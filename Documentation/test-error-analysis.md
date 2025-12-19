# Jest Test Error Analysis Report
Generated: 2025-10-16 08:01:54

## Summary
- Total Test Suites: 112
- Failed Test Suites: 112
- Passed Test Suites: 0
- Total Tests: 1483
- Failed Tests: 1050
- Passed Tests: 417
- Pending Tests: 16

## Error Categories
- **Other**: 637 occurrences
- **Missing Element (Test Assertion)**: 251 occurrences
- **Undefined Property Access**: 213 occurrences
- **Function Not Found**: 6 occurrences

## Failed Test Suites

### .\src\main\services\powerShellService.test.ts
- Failed: 
- Passed: 
- First Error: should create minimum pool size on initialization
  ```n  Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 2
Received:    0
    at Object.<anonymous> (D:\Scripts\UserMandA\guiv2\src\main\services\powerShellService.test.ts:91:30)
  ```n
### .\src\renderer\hooks\useDiscoveryLogic.test.ts
- Failed: 
- Passed: 
- First Error: should initialize with default state
  ```n  Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: {"current": 0, "message": "", "percentage": 0, "total": 100}
    at Object.<anonymous> (D:\Scripts\UserMandA\guiv2\s...
  ```n
### .\src\renderer\views\analytics\CustomReportBuilderView.test.tsx
- Failed: 
- Passed: 
- First Error: displays the view description
  ```n  TestingLibraryElementError: Unable to find an element with the text: /Build custom reports/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function...
  ```n
### .\src\renderer\views\discovery\Office365DiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="office365-discovery-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33m...
  ```n
### .\src\renderer\views\analytics\UserAnalyticsView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="user-analytics-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33mclass...
  ```n
### .\src\renderer\views\discovery\InfrastructureDiscoveryHubView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of null (reading 'length')
    at InfrastructureDiscoveryHubView (D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\InfrastructureDiscoveryHubView.tsx:161:34)
 ...
  ```n
### .\src\renderer\views\analytics\BenchmarkingView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="benchmarking-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33mclass[...
  ```n
### .\src\renderer\views\analytics\ExecutiveDashboardView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="executive-dashboard-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33m...
  ```n
### .\src\renderer\views\discovery\ExchangeDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: displays the view description
  ```n  TestingLibraryElementError: Unable to find an element with the text: /Exchange server discovery/i. This could be because the text is broken up by multiple elements. In this case, you can provide a fun...
  ```n
### .\src\renderer\views\analytics\TrendAnalysisView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="trend-analysis-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33mclass...
  ```n
### .\src\renderer\views\discovery\SecurityInfrastructureDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="security-infrastructure-discovery-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[3...
  ```n
### .\src\renderer\views\discovery\ApplicationDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="application-discovery-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [3...
  ```n
### .\src\renderer\views\discovery\DomainDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of undefined (reading 'toString')
    at DomainDiscoveryView (D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\DomainDiscoveryView.tsx:127:46)
    at renderWit...
  ```n
### .\src\renderer\views\settings\SettingsView.test.tsx
- Failed: 
- Passed: 
- First Error: displays the view description
  ```n  TestingLibraryElementError: Unable to find an element with the text: /Application settings/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function...
  ```n
### .\src\renderer\views\assets\NetworkDeviceInventoryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of null (reading 'total')
    at NetworkDeviceInventoryView (D:\Scripts\UserMandA\guiv2\src\renderer\views\assets\NetworkDeviceInventoryView.tsx:67:91)
    at renderW...
  ```n
### .\src\renderer\views\discovery\TeamsDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: displays the view description
  ```n  TestingLibraryElementError: Unable to find an element with the text: /Microsoft Teams discovery/i. This could be because the text is broken up by multiple elements. In this case, you can provide a fun...
  ```n
### .\src\renderer\views\security\SecurityAuditView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of null (reading 'total')
    at SecurityAuditView (D:\Scripts\UserMandA\guiv2\src\renderer\views\security\SecurityAuditView.tsx:71:89)
    at renderWithHooks (D:\Scr...
  ```n
### .\src\renderer\views\assets\ServerInventoryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of null (reading 'total')
    at ServerInventoryView (D:\Scripts\UserMandA\guiv2\src\renderer\views\assets\ServerInventoryView.tsx:63:93)
    at renderWithHooks (D:\S...
  ```n
### .\src\renderer\views\discovery\AWSCloudInfrastructureDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="a-w-s-cloud-infrastructure-discovery-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div...
  ```n
### .\src\renderer\views\licensing\LicenseManagementView.test.tsx
- Failed: 
- Passed: 
- First Error: displays the view description
  ```n  TestingLibraryElementError: Unable to find an element with the text: /Manage licenses/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function for ...
  ```n
### .\src\renderer\views\analytics\MigrationReportView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="migration-report-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33mcla...
  ```n
### .\src\renderer\views\analytics\DataVisualizationView.test.tsx
- Failed: 
- Passed: 
- First Error: displays the view description
  ```n  TestingLibraryElementError: Unable to find an element with the text: /Visualize discovery data/i. This could be because the text is broken up by multiple elements. In this case, you can provide a func...
  ```n
### .\src\renderer\views\discovery\OneDriveDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="one-drive-discovery-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33m...
  ```n
### .\src\renderer\views\discovery\SharePointDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="share-point-discovery-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [3...
  ```n
### .\src\renderer\views\discovery\IntuneDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: displays the view description
  ```n  TestingLibraryElementError: Unable to find an element with the text: /Intune device discovery/i. This could be because the text is broken up by multiple elements. In this case, you can provide a funct...
  ```n
### .\src\renderer\views\discovery\EnvironmentDetectionView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of null (reading 'searchText')
    at EnvironmentDetectionView (D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\EnvironmentDetectionView.tsx:254:29)
    at re...
  ```n
### .\src\renderer\views\discovery\IdentityGovernanceDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of null (reading 'searchText')
    at IdentityGovernanceDiscoveryView (D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\IdentityGovernanceDiscoveryView.tsx:292...
  ```n
### .\src\renderer\views\discovery\HyperVDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of null (reading 'searchText')
    at HyperVDiscoveryView (D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\HyperVDiscoveryView.tsx:261:29)
    at renderWithHo...
  ```n
### .\src\renderer\views\discovery\GoogleWorkspaceDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of null (reading 'searchText')
    at GoogleWorkspaceDiscoveryView (D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\GoogleWorkspaceDiscoveryView.tsx:270:29)
 ...
  ```n
### .\src\renderer\views\discovery\ActiveDirectoryDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="active-directory-discovery-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
    ...
  ```n
### .\src\renderer\views\assets\AssetInventoryView.test.tsx
- Failed: 
- Passed: 
- First Error: displays the view description
  ```n  TestingLibraryElementError: Unable to find an element with the text: /View asset inventory/i. This could be because the text is broken up by multiple elements. In this case, you can provide a function...
  ```n
### .\src\renderer\views\advanced\PrivilegedAccessView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="privileged-access-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33mcl...
  ```n
### .\src\renderer\views\security\PolicyManagementView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of null (reading 'total')
    at PolicyManagementView (D:\Scripts\UserMandA\guiv2\src\renderer\views\security\PolicyManagementView.tsx:51:93)
    at renderWithHooks (...
  ```n
### .\src\renderer\views\compliance\ComplianceDashboardView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of null (reading 'resolvedViolations')
    at ComplianceDashboardView (D:\Scripts\UserMandA\guiv2\src\renderer\views\compliance\ComplianceDashboardView.tsx:38:20)
   ...
  ```n
### .\src\renderer\views\security\RiskAssessmentView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of null (reading 'total')
    at RiskAssessmentView (D:\Scripts\UserMandA\guiv2\src\renderer\views\security\RiskAssessmentView.tsx:49:89)
    at renderWithHooks (D:\S...
  ```n
### .\src\renderer\views\analytics\ReportTemplatesView.test.tsx
- Failed: 
- Passed: 
- First Error: displays the view description
  ```n  TestingLibraryElementError: Unable to find an element with the text: /Manage report templates/i. This could be because the text is broken up by multiple elements. In this case, you can provide a funct...
  ```n
### .\src\main\services\logicEngineService.test.ts
- Failed: 
- Passed: 
- First Error: should load users from CSV
  ```n  Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
    at Object.<anonymous> (D:\Scripts\UserMandA\guiv2\src\main\services\logicEngineService.test.ts:51:28)
  ```n
### .\src\renderer\views\analytics\ScheduledReportsView.test.tsx
- Failed: 
- Passed: 
- First Error: displays the view description
  ```n  TestingLibraryElementError: Unable to find an element with the text: /Schedule automated reports/i. This could be because the text is broken up by multiple elements. In this case, you can provide a fu...
  ```n
### .\src\renderer\components\organisms\VirtualizedDataGrid.test.tsx
- Failed: 
- Passed: 
- First Error: should render grid with data
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="ag-grid-mock"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33mclass[39m=...
  ```n
### .\src\renderer\views\discovery\FileSystemDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of undefined (reading 'length')
    at FileSystemDiscoveryView (D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\FileSystemDiscoveryView.tsx:88:42)
    at rend...
  ```n
### .\src\renderer\views\admin\BackupRestoreView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="backup-restore-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33mclass...
  ```n
### .\src\renderer\views\advanced\CloudMigrationPlannerView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="cloud-migration-planner-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      ...
  ```n
### .\src\renderer\views\discovery\DataLossPreventionDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of null (reading 'searchText')
    at DataLossPreventionDiscoveryView (D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\DataLossPreventionDiscoveryView.tsx:175...
  ```n
### .\src\renderer\views\discovery\SQLServerDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="s-q-l-server-discovery-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [...
  ```n
### .\src\renderer\views\discovery\NetworkDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: displays the view description
  ```n  TestingLibraryElementError: Unable to find an element with the text: /Network infrastructure discovery/i. This could be because the text is broken up by multiple elements. In this case, you can provid...
  ```n
### .\src\renderer\views\reports\ReportsView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of undefined (reading 'map')
    at ReportsView (D:\Scripts\UserMandA\guiv2\src\renderer\views\reports\ReportsView.tsx:75:24)
    at renderWithHooks (D:\Scripts\UserM...
  ```n
### .\src\renderer\views\discovery\VMwareDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="v-mware-discovery-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33mcl...
  ```n
### .\src\renderer\views\advanced\CapacityPlanningView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TestingLibraryElementError: Unable to find an element by: [data-cy="capacity-planning-view"]

Ignored nodes: comments, script, style
[36m<body>[39m
  [36m<div>[39m
    [36m<div[39m
      [33mcl...
  ```n
### .\src\renderer\views\compliance\ComplianceReportView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of null (reading 'total')
    at ComplianceReportView (D:\Scripts\UserMandA\guiv2\src\renderer\views\compliance\ComplianceReportView.tsx:50:89)
    at renderWithHooks...
  ```n
### .\src\renderer\views\discovery\AzureDiscoveryView.test.tsx
- Failed: 
- Passed: 
- First Error: renders without crashing
  ```n  TypeError: Cannot read properties of null (reading 'tenantId')
    at AzureDiscoveryView (D:\Scripts\UserMandA\guiv2\src\renderer\views\discovery\AzureDiscoveryView.tsx:84:35)
    at renderWithHooks (...
  ```n

