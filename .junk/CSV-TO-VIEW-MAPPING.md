# CSV-to-View Mapping Document

## Status Summary

### ✅ Working Views (Loading from LogicEngine)

1. **UsersView** → `useUsersViewLogic.ts`
   - CSV Files: `TestUsers.csv` (4 users), `OneDriveUsers.csv` (4 users)
   - Status: ✅ Fully functional - loads 4 users from LogicEngine

2. **GroupsView** → `useGroupsViewLogic.ts`
   - CSV Files: `ExchangeDistributionGroups.csv` (5 groups)
   - Status: ✅ Fully functional - loads 5 groups from LogicEngine

3. **InfrastructureView** → `useInfrastructureLogic.ts`
   - CSV Files: Multiple `PhysicalServer_*.csv`, `NetworkInfrastructure_*.csv`, `Security*.csv`, `Test*.csv`
   - Status: ✅ Fully functional - loads 11 devices from LogicEngine

---

## 📋 Available CSV Files and Corresponding Views

### Exchange & Mailboxes (4 mailboxes)
- **CSV Files:**
  - `ExchangeDiscovery.csv`
  - `ExchangeMailboxes.csv` (4 mailboxes loaded by LogicEngine)
  - `ExchangeMailContacts.csv`
  - `ExchangeDistributionGroups.csv` (already shown in GroupsView)
- **Hook:** `useExchangeDiscoveryLogic.ts`
- **View:** ExchangeDiscoveryView
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data on mount
- **IPC Handler:** ✅ `logicEngine:getAllMailboxes` - ADDED

### SharePoint (Sites & Lists)
- **CSV Files:**
  - `SharePointLists.csv`
  - `SharePointSites.csv`
- **Hook:** `useSharePointDiscoveryLogic.ts`
- **View:** SharePointDiscoveryView
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data
- **IPC Handler:** ❌ Needs `logicEngine:getSharePointSites` and `logicEngine:getSharePointLists`

### OneDrive (4 users, statistics)
- **CSV Files:**
  - `OneDriveDiscovery.csv`
  - `OneDriveStatistics.csv`
  - `OneDriveUsers.csv` (4 users - already loaded in UsersView)
- **Hook:** `useOneDriveDiscoveryLogic.ts`
- **View:** OneDriveDiscoveryView
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data
- **IPC Handler:** ❌ Needs `logicEngine:getOneDriveData`

### Environment Detection (8 files)
- **CSV Files:**
  - `EnvironmentDetection_CloudEnvironment.csv`
  - `EnvironmentDetection_DomainEnvironment.csv`
  - `EnvironmentDetection_Hardware.csv`
  - `EnvironmentDetection_NetworkAdapter.csv`
  - `EnvironmentDetection_OperatingSystem.csv`
  - `EnvironmentDetection_SecurityEnvironment.csv`
  - `EnvironmentDetection_SoftwareEnvironment.csv`
  - `EnvironmentDetection_VirtualizationEnvironment.csv`
- **Hook:** `useEnvironmentDetectionLogic.ts`
- **View:** EnvironmentDetectionView
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data
- **IPC Handler:** ❌ Needs `logicEngine:getEnvironmentData`

### Physical Servers (Multiple files)
- **CSV Files:**
  - `PhysicalServerDiscovery.csv` (7 devices loaded)
  - `PhysicalServer_BIOS.csv` (4 devices)
  - `PhysicalServer_Hardware.csv` (3 devices)
  - `PhysicalServer_NetworkHardware.csv` (2 devices)
  - `PhysicalServer_Storage.csv`
- **Hook:** `usePhysicalServerDiscovery.ts` / ServerInventoryView hook
- **View:** ServerInventoryView
- **Status:** ⚠️ Data already loaded in InfrastructureView
- **Note:** Consider creating dedicated Physical Server view or enhancing InfrastructureView

### Network Infrastructure (Multiple files - 11 devices each)
- **CSV Files:**
  - `NetworkInfrastructure_ARPEntry.csv`
  - `NetworkInfrastructure_DHCPServer.csv` (8 devices)
  - `NetworkInfrastructure_DNSInfrastructure.csv`
  - `NetworkInfrastructure_FirewallRule.csv`
  - `NetworkInfrastructure_NetworkAdapter.csv`
  - `NetworkInfrastructure_NetworkRoute.csv`
  - `NetworkInfrastructure_NetworkShare.csv`
  - `Network_DNSServers.csv` (7 devices)
  - `InfrastructureDiscovery_Subnet.csv`
  - `DNSDHCPDiscovery.csv`
- **Hook:** `useNetworkDiscoveryLogic.ts` / `useNetworkInfrastructureLogic.ts`
- **View:** NetworkDiscoveryView / NetworkDeviceInventoryView
- **Status:** ⚠️ Data already loaded in InfrastructureView
- **Note:** Consider enhancing NetworkDiscoveryView to show detailed network information

### Security Infrastructure (Multiple files)
- **CSV Files:**
  - `SecurityInfrastructureDiscovery.csv` (11 devices loaded)
  - `Security_AntivirusProducts.csv`
  - `Security_FirewallProfiles.csv`
  - `Security_SecurityServices.csv`
  - `Security_SecuritySoftware.csv`
  - `Security_VPNServices.csv`
  - `SecurityDefaults.csv`
- **Hook:** `useSecurityInfrastructureDiscoveryLogic.ts` / `useSecurityAuditLogic.ts`
- **View:** SecurityAuditView
- **Status:** ⚠️ Data already loaded in InfrastructureView
- **IPC Handler:** ❌ Needs `logicEngine:getSecurityData`

### Conditional Access
- **CSV Files:**
  - `ConditionalAccessDiscovery.csv`
  - `ConditionalAccessStatistics.csv`
- **Hook:** `useConditionalAccessDiscoveryLogic.ts`
- **View:** ConditionalAccessView (may not exist - check if view needs to be created)
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data
- **IPC Handler:** ❌ Needs `logicEngine:getConditionalAccessData`

### Data Loss Prevention (DLP)
- **CSV Files:**
  - `DLPDiscovery.csv`
  - `DLPStatistics.csv`
- **Hook:** `useDataLossPreventionDiscoveryLogic.ts`
- **View:** DLP View (may not exist - check if view needs to be created)
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data
- **IPC Handler:** ❌ Needs `logicEngine:getDLPData`

### Power Platform
- **CSV Files:**
  - `PowerPlatformDiscovery.csv`
  - `PowerPlatform_Environments.csv`
- **Hook:** `usePowerPlatformDiscoveryLogic.ts`
- **View:** PowerPlatformView (may not exist)
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data
- **IPC Handler:** ❌ Needs `logicEngine:getPowerPlatformData`

### Power BI
- **CSV Files:**
  - `PowerBIDiscovery.csv`
  - `PowerBIStatistics.csv`
- **Hook:** `usePowerBIDiscovery.ts`
- **View:** PowerBIView (may not exist)
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data
- **IPC Handler:** ❌ Needs `logicEngine:getPowerBIData`

### Certificate Authority
- **CSV Files:**
  - `CertificateAuthorityDiscovery.csv`
  - `Certificate_CertificateAuthority.csv`
  - `Certificate_LocalCertificate.csv`
  - `CA_Certificates.csv`
- **Hook:** `useCertificateAuthorityDiscovery.ts`
- **View:** CertificateView (may not exist)
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data
- **IPC Handler:** ❌ Needs `logicEngine:getCertificateData`

### Backup & Recovery
- **CSV Files:**
  - `BackupRecoveryDiscovery.csv`
  - `Backup_BackupAssessment.csv`
  - `Backup_SystemRecovery.csv`
  - `Backup_VSS.csv`
- **Hook:** `useBackupRecoveryDiscovery.ts`
- **View:** BackupRecoveryView (may not exist)
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data
- **IPC Handler:** ❌ Needs `logicEngine:getBackupData`

### Data Classification
- **CSV Files:**
  - `DataClassification_ClassificationSummary.csv`
  - `DataClassification_LocalDriveClassification.csv`
- **Hook:** `useDataClassificationLogic.ts`
- **View:** DataClassificationView (may not exist)
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data
- **IPC Handler:** ❌ Needs `logicEngine:getDataClassificationData`

### Scheduled Tasks
- **CSV Files:**
  - `ScheduledTask_ScheduledTask.csv`
  - `ScheduledTask_TaskAction.csv`
  - `ScheduledTask_TaskSummary.csv`
  - `ScheduledTask_TaskTrigger.csv`
- **Hook:** `useScheduledTaskDiscovery.ts`
- **View:** ScheduledTaskView (may not exist)
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data
- **IPC Handler:** ❌ Needs `logicEngine:getScheduledTaskData`

### Storage
- **CSV Files:**
  - `Storage_LocalStorage.csv`
  - `Storage_StorageSpaces.csv`
  - `Storage_StorageSummary.csv`
- **Hook:** Storage hook (check if exists)
- **View:** StorageView (may not exist)
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data
- **IPC Handler:** ❌ Needs `logicEngine:getStorageData`

### Web Server
- **CSV Files:**
  - `WebServer_WebFramework.csv`
- **Hook:** `useWebServerDiscoveryLogic.ts`
- **View:** WebServerView (may not exist)
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data
- **IPC Handler:** ❌ Needs `logicEngine:getWebServerData`

### Licensing
- **CSV Files:**
  - `LicensingDiscoveryLicensingSubscriptions.csv`
- **Hook:** `useLicensingDiscoveryLogic.ts`
- **View:** LicenseManagementView
- **Status:** ⚠️ Discovery execution works, but doesn't load existing CSV data
- **IPC Handler:** ❌ Needs `logicEngine:getLicensingData`

### Authentication
- **CSV Files:**
  - `AuthenticationMethods.csv`
- **Hook:** Authentication hook (check if exists)
- **View:** AuthenticationView (may not exist)
- **Status:** ⚠️ No corresponding view or hook found
- **IPC Handler:** ❌ Needs `logicEngine:getAuthenticationData`

### GPO (Placeholder)
- **CSV Files:**
  - `GPO_PlaceholderData.csv`
- **Hook:** `useGPODiscovery.ts`
- **View:** GPOView (may not exist)
- **Status:** ⚠️ Placeholder data only
- **IPC Handler:** ❌ Needs `logicEngine:getGPOData`

### Dependencies
- **CSV Files:**
  - `Dependency_ConfigDependency.csv`
  - `Dependency_DependencyAnalysis.csv`
  - `Dependency_NetworkConnection.csv`
  - `Dependency_ProcessDependency.csv`
  - `Dependency_ServiceDependency.csv`
- **Hook:** Dependency hook (check if exists)
- **View:** DependencyView (may not exist)
- **Status:** ⚠️ No corresponding view or hook found
- **IPC Handler:** ❌ Needs `logicEngine:getDependencyData`

---

## 🎯 Implementation Pattern

To enable a discovery view to load existing CSV data from LogicEngine:

### 1. Add LogicEngine Service Method (if needed)
```typescript
// In src/main/services/logicEngineService.ts
public getAllMailboxes(): MailboxDto[] {
  return Array.from(this.dataStore.mailboxes.values());
}
```

### 2. Add IPC Handler
```typescript
// In src/main/ipcHandlers.ts
ipcMain.handle('logicEngine:getAllMailboxes', async () => {
  try {
    const mailboxes = logicEngineService.getAllMailboxes();
    return { success: true, data: mailboxes };
  } catch (error: unknown) {
    console.error('logicEngine:getAllMailboxes error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});
```

### 3. Update Discovery Hook
```typescript
// Add to useExchangeDiscoveryLogic.ts
const [mailboxes, setMailboxes] = useState<ExchangeMailbox[]>([]);

useEffect(() => {
  loadMailboxesFromLogicEngine();
}, [selectedSourceProfile]);

const loadMailboxesFromLogicEngine = async () => {
  try {
    const result = await window.electronAPI.invoke('logicEngine:getAllMailboxes');
    if (result.success) {
      const mappedMailboxes = result.data.map(mapMailboxDtoToExchangeMailbox);
      setMailboxes(mappedMailboxes);
    }
  } catch (error) {
    console.error('Failed to load mailboxes:', error);
  }
};
```

### 4. Map DTO to View Model
```typescript
const mapMailboxDtoToExchangeMailbox = (dto: MailboxDto): ExchangeMailbox => ({
  id: dto.Id || dto.PrimarySmtpAddress,
  displayName: dto.DisplayName,
  userPrincipalName: dto.UserPrincipalName,
  primarySmtpAddress: dto.PrimarySmtpAddress,
  mailboxType: dto.RecipientTypeDetails,
  totalItemSize: dto.TotalItemSize || 0,
  itemCount: dto.ItemCount || 0,
  isInactive: dto.IsInactive || false,
  archiveEnabled: dto.ArchiveStatus === 'Active',
  litigationHoldEnabled: dto.LitigationHoldEnabled || false,
  // ... other fields
});
```

---

## 📊 Priority Recommendations

### High Priority (Most Common Workloads)
1. **Exchange** - 4 mailboxes available, Exchange is critical for M&A
2. **SharePoint** - Sites and lists data available
3. **OneDrive** - Statistics and discovery data available
4. **Security Infrastructure** - Multiple security CSV files available
5. **Environment Detection** - 8 different environment files

### Medium Priority
6. **Physical Servers** - Already loaded but could have dedicated detailed view
7. **Network Infrastructure** - Already loaded but could show more network-specific info
8. **Conditional Access** - Important for security posture
9. **DLP** - Data loss prevention discovery and statistics
10. **Power Platform & Power BI** - Growing importance in enterprise

### Lower Priority
11. **Certificate Authority** - Specialized use case
12. **Backup & Recovery** - Important but less frequently accessed
13. **Data Classification** - Specialized compliance feature
14. **Scheduled Tasks** - Detailed system administration
15. **Storage, Web Server, Licensing, etc.** - Specialized views

---

## ✅ Completed Actions

1. ✅ Fixed DndProvider context error in GroupsView by adding DndProvider to App.tsx
2. ✅ Added `logicEngine:getAllMailboxes` IPC handler in ipcHandlers.ts
3. ✅ Created this comprehensive CSV-to-View mapping document

---

## 🔄 Next Steps

1. Update Exchange discovery hook to load mailboxes from LogicEngine on mount
2. Update SharePoint discovery hook to load sites/lists from LogicEngine
3. Update OneDrive discovery hook to load statistics from LogicEngine
4. Add remaining IPC handlers for other discovery modules
5. Create dedicated views for modules that don't have views yet (DLP, Conditional Access, Power Platform, etc.)
6. Enhance existing views to show more detailed information from their respective CSV files

---

## 📝 Notes

- All discovery hooks are designed to **run new discoveries**, but most don't **load existing data** from LogicEngine
- LogicEngine successfully loads all CSV files on startup, but views need to be updated to display this data
- The preload script already has a generic `invoke` method that can call any IPC channel
- The pattern used by UsersView, GroupsView, and InfrastructureView can be replicated for all other views
