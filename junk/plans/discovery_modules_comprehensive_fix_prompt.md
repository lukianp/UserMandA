 # 🚀 COMPREHENSIVE DISCOVERY MODULES FIX PROMPT

## 🎯 MISSION OBJECTIVE
Deeply analyze and fix the launch of ALL discovery modules to ensure each discovery tile launches a comprehensive, professional UI that streams PowerShell execution results into a nice window, using IntuneDiscoveryView as the template.

## 📊 CURRENT STATE ANALYSIS

### ✅ WORKING MODULES (Reference Implementation)
- **Active Directory Discovery** - Launches PowerShell + nice UI
- **Application Discovery** - Launches PowerShell + nice UI
- **Azure** - Launches PowerShell + nice UI
- **Azure Resources** - Launches PowerShell + nice UI

### ❌ BROKEN MODULES (Need Complete Redesign)
- **BackupRecovery** - Just start button, no UI
- **CertificateAuthority** - Minimal UI
- **Certificate** - Minimal UI
- **ConditionalAccess** - Minimal UI
- **DataClassification** - Minimal UI
- **DNSDHCP** - Minimal UI
- **EnvironmentDetection** - Minimal UI
- **FileServer** - Minimal UI
- **GPO** - Minimal UI
- **Infrastructure** - Minimal UI
- **NetworkInfrastructure** - Minimal UI
- **PhysicalServer** - Minimal UI
- **Printer** - Minimal UI
- **ScheduledTask** - Minimal UI
- **StorageArray** - Minimal UI
- **Virtualization** - Minimal UI
- **WebServerConfig** - Minimal UI
- And 17+ more modules...

### 🎨 TEMPLATE TO FOLLOW: IntuneDiscoveryView.tsx
**Key Features to Implement:**
1. **ProgressStepCard** with animated step progression
2. **Confirmation Dialog** before launch
3. **Statistics Cards** with gradient backgrounds
4. **Tabbed Interface** (Overview, Details tabs)
5. **Configuration Panel** with expandable settings
6. **Export Functionality** (CSV/Excel)
7. **PowerShellExecutionDialog** integration
8. **LoadingOverlay** with progress tracking
9. **Error Handling** with dismissible alerts
10. **Search/Filter** capabilities

## 🔧 TYPE SCRIPT ERRORS TO FIX FIRST

### Critical Errors in Hooks:
```typescript
// useAzureDiscoveryLogic.ts:162
// ❌ WRONG: data.currentItem?.toISOString()
// ✅ CORRECT: new Date(data.currentItem).toISOString()

// useAzureResourceDiscovery.ts:22-29
// ❌ WRONG: Properties don't exist on 'void'
// ✅ FIX: Proper hook return type definitions

// useFileSystemDiscoveryLogic.ts:158,219,271
// ❌ WRONG: 'toISOString' does not exist on type 'string'
// ✅ CORRECT: new Date(timestamp).toISOString()

// useNetworkDiscoveryLogic.ts:64
// ❌ WRONG: 'toISOString' does not exist on type 'string'
// ✅ CORRECT: new Date(timestamp).toISOString()

// useOneDriveDiscoveryLogic.ts:358
// ❌ WRONG: 'toISOString' does not exist on type 'string'
// ✅ CORRECT: new Date(timestamp).toISOString()

// useProfileStatistics.ts:76-80
// ❌ WRONG: Property 'success' does not exist on type 'string'
// ✅ FIX: Proper type casting

// useSecurityInfrastructureDiscoveryLogic.ts:360
// ❌ WRONG: 'toISOString' does not exist on type 'string'
// ✅ CORRECT: new Date(timestamp).toISOString()

// useSQLServerDiscoveryLogic.ts:68
// ❌ WRONG: 'toISOString' does not exist on type 'string'
// ✅ CORRECT: new Date(timestamp).toISOString()
```

## 🏗️ COMPREHENSIVE UI TEMPLATE

### 1. Main Discovery View Structure
```tsx
import React, { useState, useMemo } from 'react';
import {
  Smartphone, ChevronUp, ChevronDown, Download, FileSpreadsheet,
  Monitor, Cpu, ShieldCheck, ShieldAlert, Package, FileText, Shield
} from 'lucide-react';

import { useIntuneDiscoveryLogic } from '../../hooks/useIntuneDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const IntuneDiscoveryView: React.FC = () => {
  const {
    config, result, isDiscovering, isCancelling, progress, activeTab, filter, error, logs,
    showExecutionDialog, setShowExecutionDialog, clearLogs, columns, filteredData, stats,
    startDiscovery, cancelDiscovery, updateConfig, setActiveTab, updateFilter, clearError,
    exportToCSV, exportToExcel
  } = useIntuneDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  // Progress steps computed from hook state
  const progressSteps: ProgressStep[] = useMemo(() => {
    if (result?.success) {
      return [
        { id: 'init', label: 'Initializing', status: 'completed', percentage: 20 },
        { id: 'connect', label: 'Connecting to Intune', status: 'completed', percentage: 40 },
        { id: 'devices', label: 'Discovering Devices', status: 'completed', percentage: 60 },
        { id: 'policies', label: 'Analyzing Policies', status: 'completed', percentage: 80 },
        { id: 'complete', label: 'Discovery Complete', status: 'completed', percentage: 100 }
      ];
    }
    if (error) {
      return [
        { id: 'init', label: 'Initializing', status: 'completed', percentage: 20 },
        { id: 'error', label: 'Error Occurred', status: 'error', percentage: 100, message: error }
      ];
    }
    if (isDiscovering) {
      return [
        { id: 'init', label: 'Initializing', status: 'completed', percentage: 20 },
        { id: 'connect', label: 'Connecting to Intune', status: 'in_progress', percentage: 40, message: progress?.message },
        { id: 'devices', label: 'Discovering Devices', status: 'pending', percentage: 60 },
        { id: 'policies', label: 'Analyzing Policies', status: 'pending', percentage: 80 },
        { id: 'complete', label: 'Discovery Complete', status: 'pending', percentage: 100 }
      ];
    }
    return [
      { id: 'init', label: 'Initializing', status: 'pending', percentage: 20 },
      { id: 'connect', label: 'Connecting to Intune', status: 'pending', percentage: 40 },
      { id: 'devices', label: 'Discovering Devices', status: 'pending', percentage: 60 },
      { id: 'policies', label: 'Analyzing Policies', status: 'pending', percentage: 80 },
      { id: 'complete', label: 'Discovery Complete', status: 'pending', percentage: 100 }
    ];
  }, [result, error, isDiscovering, progress]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="intune-discovery-view">
      {/* Loading Overlay */}
      {isDiscovering && (
        <LoadingOverlay
          progress={progress?.percentage || 0}
          onCancel={cancelDiscovery}
          message={progress?.message || 'Discovering Intune resources...'}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center gap-3">
          <Smartphone className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Intune Discovery</h1>
            <p className="text-sm text-gray-500">Discover mobile device management configuration</p>
          </div>
        </div>
        <div className="flex gap-2">
          {result && (
            <>
              <Button onClick={() => exportToCSV(result.data, 'intune-devices.csv')} variant="secondary" icon={<Download />}>
                Export CSV
              </Button>
              <Button onClick={() => exportToExcel(result.data, 'intune-devices.xlsx')} variant="secondary" icon={<FileSpreadsheet />}>
                Export Excel
              </Button>
            </>
          )}
          <Button onClick={startDiscovery} disabled={isDiscovering} variant="primary">
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between">
          <span className="text-red-800">{error}</span>
          <Button onClick={clearError} variant="ghost" size="sm">Dismiss</Button>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="mx-6 mt-4 bg-white rounded-lg shadow border">
        <button
          onClick={() => setConfigExpanded(!configExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg"
        >
          <span className="font-semibold">Discovery Configuration</span>
          {configExpanded ? <ChevronUp /> : <ChevronDown />}
        </button>

        {configExpanded && (
          <div className="p-4 border-t space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Checkbox label="Include Devices" checked={config.includeDevices} onChange={(checked) => updateConfig({ includeDevices: checked })} />
              <Checkbox label="Include Applications" checked={config.includeApplications} onChange={(checked) => updateConfig({ includeApplications: checked })} />
              <Checkbox label="Include Configuration Policies" checked={config.includeConfigurationPolicies} onChange={(checked) => updateConfig({ includeConfigurationPolicies: checked })} />
              <Checkbox label="Include Compliance Policies" checked={config.includeCompliancePolicies} onChange={(checked) => updateConfig({ includeCompliancePolicies: checked })} />
              <Checkbox label="Include App Protection Policies" checked={config.includeAppProtectionPolicies} onChange={(checked) => updateConfig({ includeAppProtectionPolicies: checked })} />
            </div>
            <Input label="Timeout (ms)" type="number" value={config.timeout} onChange={(e) => updateConfig({ timeout: Number(e.target.value) })} />
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          <StatCard value={stats.totalDevices} label="Total Devices" color="blue" icon={<Monitor />} />
          <StatCard value={stats.compliantDevices} label="Compliant Devices" color="green" icon={<ShieldCheck />} />
          <StatCard value={stats.nonCompliantDevices} label="Non-Compliant" color="red" icon={<ShieldAlert />} />
          <StatCard value={`${stats.complianceRate}%`} label="Compliance Rate" color="purple" icon={<Cpu />} />
        </div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" icon={<Monitor />} />
          <TabButton active={activeTab === 'devices'} onClick={() => setActiveTab('devices')} label={`Devices (${stats?.totalDevices || 0})`} icon={<Smartphone />} />
          <TabButton active={activeTab === 'applications'} onClick={() => setActiveTab('applications')} label={`Applications (${stats?.totalApplications || 0})`} icon={<Package />} />
          <TabButton active={activeTab === 'policies'} onClick={() => setActiveTab('policies')} label={`Policies (${stats?.totalPolicies || 0})`} icon={<FileText />} />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} result={result} />
        )}

        {activeTab !== 'overview' && (
          <>
            {/* Filters */}
            <div className="mb-4 space-y-4">
              <Input value={filter.searchText} onChange={(e) => updateFilter({ searchText: e.target.value })} placeholder="Search..." />
              {activeTab === 'devices' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Filter by Platform</label>
                    <div className="flex flex-wrap gap-2">
                      {['Windows', 'iOS', 'Android', 'macOS'].map(platform => (
                        <button
                          key={platform}
                          onClick={() => togglePlatform(platform)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            filter.selectedPlatforms.includes(platform) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid
                data={filteredData}
                columns={columns}
                loading={isDiscovering}
                enableColumnReorder
                enableColumnResize
              />
            </div>
          </>
        )}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Intune Discovery"
        scriptDescription="Discovering Intune managed devices, policies, and compliance status"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? { percentage: progress.percentage, message: progress.message } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};
```

### 2. ProgressStepCard Component
```tsx
interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  percentage: number;
  message?: string;
}

const ProgressStepCard: React.FC<{
  steps: ProgressStep[];
  currentStepIndex: number;
}> = ({ steps, currentStepIndex }) => (
  <div className="space-y-3">
    {steps.map((step, index) => (
      <div
        key={step.id}
        className={`
          flex items-center gap-4 p-4 rounded-lg transition-all duration-300
          ${
            step.status === 'in_progress'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700'
              : step.status === 'completed'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : step.status === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          }
        `}
      >
        {/* Step Indicator Circle */}
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
            ${
              step.status === 'completed'
                ? 'bg-green-500 text-white'
                : step.status === 'in_progress'
                ? 'bg-blue-500 text-white'
                : step.status === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
            }
          `}
        >
          {step.status === 'completed' ? (
            <Check className="w-5 h-5" />
          ) : step.status === 'in_progress' ? (
            <LoadingSpinner size="sm" />
          ) : step.status === 'error' ? (
            <X className="w-5 h-5" />
          ) : (
            <span className="text-sm font-bold">{index + 1}</span>
          )}
        </div>

        {/* Step Label & Message */}
        <div className="flex-1">
          <p
            className={`
              font-medium
              ${
                step.status === 'completed'
                  ? 'text-green-700 dark:text-green-300'
                  : step.status === 'in_progress'
                  ? 'text-blue-700 dark:text-blue-300'
                  : step.status === 'error'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-gray-600 dark:text-gray-400'
              }
            `}
          >
            {step.label}
          </p>
          {step.message && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{step.message}</p>
          )}
        </div>

        {/* Percentage */}
        <div className="w-24 text-right">
          <span
            className={`
              text-sm font-medium
              ${
                step.status === 'completed'
                  ? 'text-green-600 dark:text-green-400'
                  : step.status === 'in_progress'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400'
              }
            `}
          >
            {step.percentage}%
          </span>
        </div>
      </div>
    ))}
  </div>
);
```

### 3. Confirmation Dialog Component
```tsx
const ConfirmationDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  config: any;
  title?: string;
}> = ({ isOpen, onClose, onConfirm, config, title = "Confirm Operation" }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Review Your Settings</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Please confirm before proceeding with the discovery.
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-500" />
              Configuration Summary
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Include Devices</span>
              <span className="font-medium text-gray-900 dark:text-white">{config.includeDevices ? 'Yes' : 'No'}</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Timeout</span>
              <span className="font-medium text-gray-900 dark:text-white">{config.timeout}ms</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            Go Back
          </Button>
          <Button variant="primary" onClick={onConfirm} icon={<Play className="w-4 h-4" />}>
            Confirm & Launch
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

## 📋 STEP-BY-STEP IMPLEMENTATION PLAN

### Phase 1: Fix TypeScript Errors (Parallel Execution)
**Can be done in parallel by multiple agents:**

1. **Fix useAzureDiscoveryLogic.ts**
   - Line 162: Change `data.currentItem?.toISOString()` to `new Date(data.currentItem).toISOString()`

2. **Fix useAzureResourceDiscovery.ts**
   - Add proper return type definitions to hook
   - Fix void property access errors

3. **Fix useFileSystemDiscoveryLogic.ts**
   - Lines 158,219,271: Change string.toISOString() to new Date(string).toISOString()

4. **Fix useNetworkDiscoveryLogic.ts**
   - Line 64: Change string.toISOString() to new Date(string).toISOString()

5. **Fix useOneDriveDiscoveryLogic.ts**
   - Line 358: Change string.toISOString() to new Date(string).toISOString()

6. **Fix useProfileStatistics.ts**
   - Lines 76-80: Add proper type casting for API response

7. **Fix useSecurityInfrastructureDiscoveryLogic.ts**
   - Line 360: Change string.toISOString() to new Date(string).toISOString()

8. **Fix useSQLServerDiscoveryLogic.ts**
   - Line 68: Change string.toISOString() to new Date(string).toISOString()

### Phase 2: Create Comprehensive UI Template (Sequential)

1. **Create Base Discovery View Template**
   - Use IntuneDiscoveryView.tsx as foundation
   - Extract common patterns into reusable components
   - Create ProgressStepCard, ConfirmationDialog, StatCard components

2. **Implement PowerShellExecutionDialog Integration**
   - Ensure all views use the PowerShellExecutionDialog component
   - Add proper progress tracking and log streaming
   - Implement cancellation support

### Phase 3: Redesign All Broken Discovery Views (Parallel Execution)

**Each discovery view can be implemented by separate agents:**

1. **BackupRecoveryDiscoveryView.tsx**
   - Replace minimal UI with full template
   - Add ProgressStepCard with backup/recovery steps
   - Add statistics for backup jobs, sizes, etc.
   - Add configuration for backup types to include

2. **CertificateAuthorityDiscoveryView.tsx**
   - Add comprehensive UI with CA hierarchy visualization
   - Add statistics for certificates issued, expired, etc.
   - Add configuration for CA discovery scope

3. **CertificateDiscoveryView.tsx**
   - Add certificate inventory with expiry tracking
   - Add statistics for expiring certificates, self-signed, etc.
   - Add configuration for certificate store locations

4. **ConditionalAccessDiscoveryView.tsx**
   - Add policy analysis and user impact assessment
   - Add statistics for policies, users affected, etc.
   - Add configuration for policy scope

5. **DataClassificationDiscoveryView.tsx**
   - Add data classification results visualization
   - Add statistics for sensitive data found, file types, etc.
   - Add configuration for scan paths and sensitivity levels

6. **DNSDHCPDiscoveryView.tsx**
   - Add DNS zone and DHCP scope analysis
   - Add statistics for records, leases, conflicts, etc.
   - Add configuration for DNS/DHCP server selection

**Continue for all remaining modules...**

### Phase 4: Testing and Validation (Sequential)

1. **Build and Deploy**
   ```powershell
   cd C:\enterprisediscovery\guiv2
   Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force
   npm run build:main
   npx webpack --config webpack.preload.config.js --mode=production
   npm run build:renderer
   npm start
   ```

2. **Test Each Discovery Module**
   - Verify PowerShell window launches
   - Verify progress steps animate correctly
   - Verify results display in nice UI
   - Verify export functionality works
   - Verify error handling

3. **Cross-Module Validation**
   - Ensure consistent UI patterns across all modules
   - Verify all TypeScript errors resolved
   - Confirm no runtime errors in console

## 🎯 SUCCESS CRITERIA

- ✅ All 43 discovery modules launch with professional UI
- ✅ Each module shows ProgressStepCard with animated steps
- ✅ PowerShell execution streams into nice dialog window
- ✅ All modules have export functionality (CSV/Excel)
- ✅ Statistics cards display relevant metrics
- ✅ Configuration panels with validation
- ✅ Error handling with dismissible alerts
- ✅ No TypeScript errors in hooks
- ✅ Consistent UI patterns across all modules
- ✅ All modules follow IntuneDiscoveryView template

## 🚀 EXECUTION STRATEGY

### Parallel Agent Assignment
- **Agent 1-2**: Fix TypeScript errors in hooks (Phase 1)
- **Agent 3**: Create comprehensive UI template components (Phase 2)
- **Agent 4-8**: Redesign discovery views (Phase 3)
  - Agent 4: Infrastructure modules (Hyper-V, VMware, Network, etc.)
  - Agent 5: Security modules (Certificates, Conditional Access, etc.)
  - Agent 6: Cloud modules (AWS, Azure, GCP, etc.)
  - Agent 7: Identity modules (Active Directory, Entra ID, etc.)
  - Agent 8: Collaboration modules (Exchange, SharePoint, Teams, etc.)

### Sequential Dependencies
1. Phase 1 (TypeScript fixes) must complete before Phase 3
2. Phase 2 (UI template) must complete before Phase 3
3. Phase 3 can run in parallel
4. Phase 4 (testing) must be done after all other phases

## 📁 FILES TO MODIFY

### Hook Files (TypeScript Fixes):
- `guiv2/src/renderer/hooks/useAzureDiscoveryLogic.ts`
- `guiv2/src/renderer/hooks/useAzureResourceDiscovery.ts`
- `guiv2/src/renderer/hooks/useFileSystemDiscoveryLogic.ts`
- `guiv2/src/renderer/hooks/useNetworkDiscoveryLogic.ts`
- `guiv2/src/renderer/hooks/useOneDriveDiscoveryLogic.ts`
- `guiv2/src/renderer/hooks/useProfileStatistics.ts`
- `guiv2/src/renderer/hooks/useSecurityInfrastructureDiscoveryLogic.ts`
- `guiv2/src/renderer/hooks/useSQLServerDiscoveryLogic.ts`

### View Files (Complete Redesign):
- `guiv2/src/renderer/views/discovery/BackupRecoveryDiscoveryView.tsx`
- `guiv2/src/renderer/views/discovery/CertificateAuthorityDiscoveryView.tsx`
- `guiv2/src/renderer/views/discovery/CertificateDiscoveryView.tsx`
- `guiv2/src/renderer/views/discovery/ConditionalAccessDiscoveryView.tsx`
- `guiv2/src/renderer/views/discovery/DataClassificationDiscoveryView.tsx`
- `guiv2/src/renderer/views/discovery/DNSDHCPDiscoveryView.tsx`
- And 35+ more discovery view files...

## 🎯 FINAL DELIVERABLE

A fully functional Enterprise Discovery Suite where every discovery module launches a professional, comprehensive UI that streams PowerShell execution results into beautiful, interactive dashboards with statistics, filtering, export capabilities, and proper error handling - all following the IntuneDiscoveryView template pattern.