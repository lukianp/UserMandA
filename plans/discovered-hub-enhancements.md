# Enhancement Prompt: Discovered Hub Menu and Data Mapping Fixes

## Overview
Enhance the `/guiv2/` Electron-based GUI tool by updating the "Discovered" menu structure and fixing critical data mapping issues in discovery modules. The changes will improve navigation UX and ensure accurate data representation across the organisation map and consolidated views.

## Menu Structure Changes

### 1. Update Sidebar.tsx with Collapsible "Discovered Hub" Menu
- **File:** `guiv2/src/renderer/components/organisms/Sidebar.tsx`
- **Changes Needed:**
  - Add `discovered: false` to the `expandedSections` state
  - Make "Discovered Hub" menu item collapsible (currently it shows children but no expand/collapse toggle)
  - Add ChevronRight/ChevronDown icons to indicate collapsible state
  - Default to collapsed state
  - Ensure proper expand/collapse animation

### 2. Rename Navigation Items
- **File:** `guiv2/src/renderer/components/organisms/Sidebar.tsx`
- **Changes Needed:**
  - "Discovery" → "Discovery Hub"
  - "Consolidated" → "Consolidated Enterprise Views" (already done)

## Discovery Module Data Fixes

### 3. Fix OneDriveDiscovery.psm1 Data Output Structure
- **File:** `Modules/Discovery/OneDriveDiscovery.psm1`
- **Issue:** Currently saving `System.Collections.Hashtable+KeyCollection` instead of proper data records
- **Root Cause:** Likely improper data serialization when creating output objects
- **Fix Required:**
  - Review data collection logic (lines 354-369)
  - Ensure all hashtables/objects are properly converted to PSCustomObject
  - Verify CSV export handles nested objects correctly
  - Test output shows actual data records, not type information

### 4. Fix PhysicalServerDiscovery.psm1 Component Aggregation
- **File:** `Modules/Discovery/PhysicalServerDiscovery.psm1`
- **Issue:** Saving output as individual components rather than complete server objects with all attributes
- **Fix Required:**
  - Review current data collection logic
  - Aggregate component data into complete server objects
  - Ensure each server record contains all its components/attributes as nested properties
  - Update CSV output to reflect complete server objects

### 5. Fix PowerBIDiscovery.psm1 Data Collection and Storage
- **File:** `Modules/Discovery/PowerBIDiscovery.psm1`
- **Issue:** Storing data incorrectly
- **Fix Required:**
  - Review data collection from PowerBI API
  - Ensure proper object creation and property mapping
  - Fix any serialization issues in data storage
  - Verify CSV output contains actual PowerBI data records

### 6. Fix SharePointDiscovery.psm1 Data Mapping to Organisation Chart
- **File:** `Modules/Discovery/SharePointDiscovery.psm1`
- **Issue:** Data not properly reflected in organisation chart and consolidated infrastructure tab
- **Fix Required:**
  - Ensure data flows correctly to organisation map logic
  - Check that SharePoint sites appear in infrastructure views
  - Update organisation map hooks to include SharePoint data
  - Verify consolidated views show SharePoint components

## Data Classification and Mapping Corrections

### 7. Reclassify Backup Systems as Applications
- **Files to Modify:**
  - `guiv2/src/renderer/hooks/useOrganisationMapLogic.ts`
  - `guiv2/src/renderer/views/inventory/*.tsx`
- **Changes Needed:**
  - Move backup systems from infrastructure views to application views
  - Update organisation map logic to classify backup systems as applications
  - Ensure backup systems appear in Applications consolidated view

### 8. Ensure Entra ID Users in Consolidated Users View
- **Files to Modify:**
  - `guiv2/src/renderer/hooks/useOrganisationMapLogic.ts`
  - `guiv2/src/renderer/views/inventory/UsersInventoryView.tsx`
- **Changes Needed:**
  - Ensure all Azure AD users (Entra ID) appear in Users consolidated view
  - Update data mapping logic to include Entra ID user data
  - Verify user consolidation logic handles Azure AD users correctly

### 9. Link Exchange Mailboxes to Azure AD Users
- **Files to Modify:**
  - `guiv2/src/renderer/hooks/useOrganisationMapLogic.ts`
  - `Modules/Discovery/ExchangeDiscovery.psm1`
- **Changes Needed:**
  - Update data structure to link Exchange mailboxes to corresponding Azure AD users
  - Ensure mailbox data includes user association
  - Update organisation map to show mailbox relationships

### 10. Implement Network Infrastructure Linking
- **Files to Modify:**
  - `guiv2/src/renderer/hooks/useOrganisationMapLogic.ts`
  - `Modules/Discovery/NetworkInfrastructureDiscovery.psm1`
- **Changes Needed:**
  - Identify unique identifiers (IP, hostname, MAC, etc.) for linking
  - Enable proper relationship mapping between network infrastructure and servers/services
  - Update organisation map logic to show these relationships

### 11. Ensure Azure Infrastructure Components Display
- **Files to Modify:**
  - `guiv2/src/renderer/hooks/useOrganisationMapLogic.ts`
  - `Modules/Discovery/AzureInfraDiscovery.psm1`
- **Components:** subscriptions, resource groups, key vaults, NSGs, virtual networks, web apps
- **Changes Needed:**
  - Ensure all Azure infrastructure components appear correctly in organisation map
  - Update data mapping and display logic

### 12. Move 3 Entra ID Applications to Organisation View
- **Files to Modify:**
  - `guiv2/src/renderer/hooks/useOrganisationMapLogic.ts`
  - `guiv2/src/renderer/views/inventory/ApplicationInventoryView.tsx`
- **Changes Needed:**
  - Move 3 discovered Entra ID applications from Entra ID discovery to organisation view applications section
  - Update application classification logic
  - Ensure applications appear in Applications consolidated view

## Technical Implementation Requirements

### Files to Modify Summary:
- `guiv2/src/renderer/components/organisms/Sidebar.tsx` - Menu structure and collapsible logic
- `Modules/Discovery/OneDriveDiscovery.psm1` - Data output fix
- `Modules/Discovery/PhysicalServerDiscovery.psm1` - Data aggregation fix
- `Modules/Discovery/PowerBIDiscovery.psm1` - Data storage fix
- `Modules/Discovery/SharePointDiscovery.psm1` - Data mapping fix
- `guiv2/src/renderer/hooks/useOrganisationMapLogic.ts` - Update logic for new mappings
- `guiv2/src/renderer/views/inventory/*.tsx` - Update views for reclassified data

### Key Technical Considerations:
- **PowerShell Array Handling:** Use `@($array).Count` for all `.Count` operations
- **Data Persistence:** Ensure moduleName consistency between hooks and execution
- **State Management:** Update Zustand stores for discovery results
- **TypeScript:** Resolve any type mismatches from changes
- **Build Requirements:**
  - **Webpack:** Ensure preload bundle is rebuilt (`npx webpack --config webpack.preload.config.js --mode=production`)
  - **Dependencies:** Install any missing @types packages if TypeScript errors occur
  - **Sync:** Copy changes between workspace (`D:\Scripts\UserMandA`) and deployment (`C:\enterprisediscovery`) directories

## Acceptance Criteria
- [ ] "Discovered Hub" menu is collapsible with proper expand/collapse indicators
- [ ] All menu labels updated as specified
- [ ] OneDrive, Physical Server, PowerBI, and SharePoint discovery modules produce correct data structures
- [ ] Backup systems appear in application views, not infrastructure
- [ ] Entra ID users consolidated in Users view
- [ ] Exchange mailboxes linked to Azure AD users
- [ ] Network infrastructure properly linked to servers/services
- [ ] Azure infrastructure components visible in organisation map
- [ ] 3 Entra ID applications moved to organisation view applications
- [ ] All changes maintain existing security (keytar), performance (async ops), and compliance standards
- [ ] No TypeScript errors or build failures

## Testing Steps
1. Run discovery modules and verify correct data output
2. Check organisation map displays all components correctly
3. Verify consolidated views show properly classified data
4. Test collapsible menu functionality
5. Confirm no console errors or data loading failures

## Implementation Priority Order:
1. Menu structure changes (Sidebar.tsx)
2. Discovery module data fixes (OneDrive, Physical Server, PowerBI, SharePoint)
3. Data classification updates (organisation map logic)
4. View updates for reclassified data
5. Testing and validation

Implement these changes ensuring backward compatibility and maintaining the existing Electron/React/Node.js architecture patterns.