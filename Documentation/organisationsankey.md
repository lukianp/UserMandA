# Organisation Sankey - Consolidated Knowledge & Enhancement Plan

**Last Updated:** 2025-12-30
**Status:** Phase 1 Complete, Phase 2 Planned
**Version:** 2.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Original Requirements](#original-requirements)
3. [What Was Delivered](#what-was-delivered)
4. [Available Discovered Data](#available-discovered-data)
5. [Current Implementation Architecture](#current-implementation-architecture)
6. [Gap Analysis](#gap-analysis)
7. [Enhancement Plan](#enhancement-plan)
8. [Implementation Priority](#implementation-priority)

---

## Executive Summary

The Organisation Sankey is a **LeanIX-style Enterprise Architecture visualization** that displays discovered organizational data as an interactive Sankey diagram. It processes 121+ CSV files from discovery modules and creates a unified view of the enterprise showing relationships between users, applications, infrastructure, groups, and business capabilities.

### Current State (Delivered)

- **116+ CSV type mappings** with intelligent name extraction
- **8 entity types**: company, platform, application, datacenter, provider-interface, consumer-interface, business-capability, it-component
- **6 relationship types**: ownership, deployment, provides, consumes, dependency, realizes
- **Cross-file linking** via UPN, AppId, ObjectId indices
- **Performance optimized** with MAX_NODES=5000, MAX_LINKS=10000 limits
- **9-tab LeanIX Fact Sheet** modal structure (skeleton implemented)

### Key Gap

**Business Logic & User Relationships NOT fully implemented.** The current system displays entities but does NOT:
- Link users to their mailboxes, applications, or licenses
- Show which users have access to which servers
- Infer business capabilities from department data
- Create application-to-infrastructure dependency chains

---

## Original Requirements

### From Super Prompt (LeanIX-Style EA Visualization)

> "Transform the existing organisation map into a comprehensive LeanIX-style Enterprise Architecture visualization that dynamically displays the organisation structure based on all discovered data in the ljpops raw folder."

**Key Requirements:**
1. Ingest ALL CSV data from `C:\DiscoveryData\{CompanyName}\Raw\`
2. Map entities to LeanIX entity types (Application, IT Component, Platform, etc.)
3. Build intelligent relationships between entities
4. Display in Sankey diagram with layered positioning
5. Provide 9-tab Fact Sheet modal for entity details
6. Support filtering, search, and export

### From CONSOLIDATION_BRAINSTORM.md

**Entity Consolidation Requirements:**
- **Users**: Match across AzureDiscovery_Users, GraphUsers, ExchangeMailboxes, AuthenticationMethods via UPN/ObjectId/Mail
- **Groups**: Match across AzureDiscovery_Groups, GraphGroups, ExchangeDistributionGroups via ObjectId/Mail
- **Applications**: Consolidate App Registrations, Service Principals, Enterprise Apps, Web Apps

**Matching Confidence Levels:**
- EXACT (100%): Same objectId or UPN
- HIGH (90%+): Same email, different casing
- MEDIUM (70-89%): Fuzzy name match + same domain
- LOW (<70%): Flag for manual review

### From discovered-hub-enhancements.md

**Data Classification Corrections Needed:**
1. Reclassify Backup Systems as Applications (not Infrastructure)
2. Ensure Entra ID Users appear in consolidated Users view
3. Link Exchange Mailboxes to Azure AD Users
4. Implement Network Infrastructure → Server linking
5. Display ALL Azure Infrastructure components (subscriptions, resource groups, key vaults, NSGs, VNets, web apps)
6. Move Entra ID Applications to Organisation view

---

## What Was Delivered

### Type System (organisation.ts)

```typescript
// 8 Entity Types
type EntityType =
  | 'company'
  | 'platform'
  | 'application'
  | 'datacenter'
  | 'provider-interface'
  | 'consumer-interface'
  | 'business-capability'
  | 'it-component';

// 6 Relationship Types
type RelationType =
  | 'ownership'      // Company → Platform → Application
  | 'deployment'     // Application → Data Center
  | 'provides'       // Application → Provider Interface
  | 'consumes'       // Consumer Interface → Application
  | 'dependency'     // Application → Application
  | 'realizes';      // Application → Business Capability
```

### CSV Type Mappings (116+ mappings)

**Priority 1 - Infrastructure Layer (Leftmost):**
- infrastructure, azureinfrastructure, physicalserverdiscovery
- physicalserver_bios, physicalserver_hardware, physicalserver_storage
- fileservers, filesystemservers, testinfrastructure

**Priority 2 - IT Components & Applications Layer:**
- databases, sqlinventory, storage_*, network_*
- azureresourcediscovery_*, applications, applicationcatalog
- exchangemailboxes, sharepointlists, onedrivediscovery
- users, azurediscovery_users, graphusers, groups

**Priority 3 - Platforms & Services Layer:**
- exchangeaccepteddomains, exchangedistributiongroups
- sharepointsites, powerplatform_environments
- azurediscovery_microsoftteams, licensing*
- grouppolicies, conditionalaccessdiscovery

**Priority 4 - Business Capabilities (Rightmost):**
- department, capability (inferred from user data)

### Node Index System

```typescript
// Fast lookup indices for cross-file linking
interface NodeIndices {
  byId: Map<string, SankeyNode>;
  byName: Map<string, SankeyNode[]>;
  byType: Map<EntityType, SankeyNode[]>;
  byUPN: Map<string, SankeyNode>;   // UserPrincipalName → Node
  byAppId: Map<string, SankeyNode>; // AppId → Node
}
```

### 9-Tab LeanIX Fact Sheet

| Tab | Status | Description |
|-----|--------|-------------|
| 1. Overview | Skeleton | baseInfo, tags, lifecycle |
| 2. Relations | Skeleton | incoming/outgoing relations |
| 3. IT Components | Empty | Linked infrastructure |
| 4. Subscriptions | Empty | Azure subscriptions, licenses |
| 5. Comments | Empty | Collaborative annotations |
| 6. To-dos | Empty | Migration task tracking |
| 7. Resources | Empty | Documents, links, diagrams |
| 8. Metrics | Empty | Usage metrics, KPIs |
| 9. Surveys | Empty | User feedback responses |

### Performance Optimizations

- MAX_NODES = 5000 (prevents browser crash with 9000+ objects)
- MAX_LINKS = 10000
- MAX_LINKS_PER_NODE = 20
- Batch processing with BATCH_SIZE = 100
- Memoized computations with Map caching
- Processing time tracking

---

## Available Discovered Data

### CSV Files by Category (121 files in ljpops profile)

#### Identity & Users (9 files)
| File | Records | Key Fields |
|------|---------|------------|
| AzureDiscovery_Users.csv | ~10 | ObjectId, UPN, DisplayName, Department, Manager, GroupMemberships |
| GraphUsers.csv | ~10 | id, UPN, DisplayName, Department, ManagerId |
| Users.csv | ~5 | SamAccountName, DisplayName |
| ExchangeMailboxes.csv | ~5 | Id, UPN, PrimarySmtpAddress, MailboxType, TotalFolderCount |
| AuthenticationMethods.csv | ~5 | UPN, MFAState, Methods |

**Rich User Data Available:**
- `GroupMemberships` - Semicolon-separated list of group names
- `ManagerUPN` / `ManagerId` - Reporting hierarchy
- `Department` - Business capability inference
- `AssignedLicenses` - License GUIDs
- `AppRoleAssignmentCount` - Application access count

#### Groups (6 files)
| File | Records | Key Fields |
|------|---------|------------|
| AzureDiscovery_Groups.csv | ~20 | ObjectId, DisplayName, GroupTypes, MemberCount |
| GraphGroups.csv | ~20 | id, DisplayName, GroupType, isDynamic |
| ExchangeDistributionGroups.csv | ~10 | DisplayName, PrimarySmtpAddress, MemberCount |
| Groups.csv | ~5 | Name, SamAccountName |

#### Applications (15 files)
| File | Records | Key Fields |
|------|---------|------------|
| AzureDiscovery_Applications.csv | ~5 | AppId, DisplayName, PublisherDomain |
| AzureDiscovery_ServicePrincipals.csv | ~500+ | ObjectId, AppId, DisplayName, ServicePrincipalType |
| EntraIDAppRegistrations.csv | ~5 | AppId, DisplayName, ObjectId |
| EntraIDEnterpriseApps.csv | ~5 | AppId, DisplayName, ServicePrincipalType |
| ApplicationCatalog.csv | ~200 | Name, DisplayName, Vendor, InstallPath |
| AzureResourceDiscovery_WebApps.csv | ~3 | Name, ResourceGroup, Location, Kind |

#### Infrastructure (25+ files)
| File | Records | Key Fields |
|------|---------|------------|
| AzureResourceDiscovery_Subscriptions.csv | 2 | SubscriptionId, DisplayName, State |
| AzureResourceDiscovery_ResourceGroups.csv | ~10 | Name, SubscriptionId, Location |
| AzureResourceDiscovery_KeyVaults.csv | ~5 | Name, ResourceGroup, VaultUri |
| AzureResourceDiscovery_StorageAccounts.csv | ~5 | Name, ResourceGroup, Kind, Sku |
| AzureResourceDiscovery_VirtualNetworks.csv | ~5 | Name, ResourceGroup, AddressSpace |
| PhysicalServerDiscovery.csv | ~5 | ComputerName, Manufacturer, Model |
| NetworkInfrastructure_*.csv | ~200 | Various network components |
| FileSystemShares.csv | ~10 | ShareName, Path, Permissions |

#### Dependencies (5 files - CRITICAL for relationships)
| File | Records | Key Fields |
|------|---------|------------|
| Dependency_ServiceDependency.csv | ~2000 | SourceService, DependsOn, DependencyDirection |
| Dependency_ProcessDependency.csv | ~20000 | ProcessName, Dependencies |
| Dependency_NetworkConnection.csv | ~2500 | LocalAddress, RemoteAddress, State |
| Dependency_ConfigDependency.csv | ~100 | ConfigFile, Dependencies |

#### Licensing (6 files)
| File | Records | Key Fields |
|------|---------|------------|
| LicensingDiscovery_Licenses.csv | ~10 | SkuId, SkuPartNumber, ConsumedUnits |
| LicensingDiscovery_UserAssignments.csv | ~10 | UPN, DisplayName, SkuPartNumber |
| LicensingDiscovery_ServicePlans.csv | ~500 | ServicePlanName, ProvisioningStatus |

#### Security (10+ files)
| File | Records | Key Fields |
|------|---------|------------|
| ConditionalAccessDiscovery.csv | ~5 | PolicyName, State, Conditions |
| CA_Certificates.csv | ~100 | Subject, Issuer, ExpirationDate |
| Security_*.csv | Various | Security infrastructure components |

---

## Current Implementation Architecture

### Data Flow

```
CSV Files (121 files)
       ↓
getFileTypeKey() → Normalize filename to lookup key
       ↓
findBestMapping() → Match to typeMapping entry
       ↓
parseCSVToNodes() → Create SankeyNode[] with factSheet
       ↓
generateLinksForFile() → Create intra-file links
       ↓
mergeDuplicateEntities() → Deduplicate by name+type
       ↓
createNodeIndices() → Build byId, byName, byUPN, byAppId lookups
       ↓
generateCrossFileLinksOptimized() → Cross-file relationships
       ↓
enforceLinkLimits() → Apply MAX_NODES/MAX_LINKS caps
       ↓
OrganisationMapData { nodes, links }
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `getRecordProp()` | Case-insensitive property access (PascalCase/camelCase) |
| `getFileTypeKey()` | Normalize filename for type mapping lookup |
| `findBestMapping()` | Find typeMapping entry with fallbacks |
| `parseCSVToNodes()` | Parse CSV → SankeyNode[] |
| `createNodeFromRecord()` | Single record → SankeyNode |
| `createFactSheet()` | Generate LeanIX fact sheet structure |
| `mergeDuplicateEntities()` | Deduplicate nodes by name+type |
| `createNodeIndices()` | Build fast lookup indices |
| `generateCrossFileLinksOptimized()` | Create inter-file relationships |
| `removeDuplicateLinks()` | Deduplicate links |
| `enforceLinkLimits()` | Cap links per node |

---

## Gap Analysis

### What's Missing

| Feature | Status | Impact |
|---------|--------|--------|
| User → Mailbox linking | NOT DONE | Users appear separate from their mailboxes |
| User → License linking | NOT DONE | No visibility into license assignments per user |
| User → Application access | NOT DONE | No app-to-user relationship |
| User → Manager hierarchy | NOT DONE | Reporting structure not visualized |
| User → Group membership | NOT DONE | Group relationships not shown |
| Application → Infrastructure | PARTIAL | Web apps linked, on-prem apps not |
| Service dependencies | NOT DONE | Dependency_ServiceDependency.csv unused |
| Network connections | NOT DONE | Dependency_NetworkConnection.csv unused |
| Business capability inference | NOT DONE | Departments not extracted as capabilities |
| Fact sheet data population | SKELETON | All 9 tabs are empty shells |

### Data Linkage Opportunities

**User ↔ Mailbox Linking:**
```
AzureDiscovery_Users.UserPrincipalName = ExchangeMailboxes.UserPrincipalName
```

**User ↔ License Linking:**
```
AzureDiscovery_Users.AssignedLicenses (GUID list) → LicensingDiscovery_Licenses.SkuId
LicensingDiscovery_UserAssignments.UserPrincipalName → Users
```

**User ↔ Group Membership:**
```
AzureDiscovery_Users.GroupMemberships (semicolon-separated names)
AzureDiscovery_Users.GroupMembershipCount
```

**User → Manager Hierarchy:**
```
AzureDiscovery_Users.ManagerUPN → AzureDiscovery_Users.UserPrincipalName
AzureDiscovery_Users.ManagerId → AzureDiscovery_Users.Id
```

**Service Dependencies:**
```
Dependency_ServiceDependency.SourceService → DependsOn
Can create: Application → Application (dependency type)
```

**Network Connections:**
```
Dependency_NetworkConnection: LocalAddress → RemoteAddress
Can infer: Server → Server communication patterns
```

**Business Capability Inference:**
```
Extract unique Department values from AzureDiscovery_Users
Create business-capability nodes for each department
Link users to their department capability
```

---

## Enhancement Plan

### Phase 1: User Relationship Building (HIGH PRIORITY)

**Goal:** Connect users to their resources and organizational context.

#### 1.1 User ↔ Mailbox Linking
```typescript
// In generateCrossFileLinksOptimized()
// Match by UPN
const userNode = indices.byUPN.get(mailboxRecord.UserPrincipalName?.toLowerCase());
if (userNode) {
  links.push({
    source: userNode.id,
    target: mailboxNode.id,
    value: 1,
    type: 'ownership' // User owns their mailbox
  });
}
```

#### 1.2 User ↔ License Linking
```typescript
// Parse AssignedLicenses from user record
const licenseGuids = userRecord.AssignedLicenses?.split(';').filter(Boolean);
for (const guid of licenseGuids) {
  const licenseNode = indices.byId.get(`platform-${guid}-licensing`);
  if (licenseNode) {
    links.push({ source: userNode.id, target: licenseNode.id, type: 'consumes' });
  }
}
```

#### 1.3 User ↔ Group Membership
```typescript
// Parse GroupMemberships from user record
const groupNames = userRecord.GroupMemberships?.split(';').filter(Boolean);
for (const groupName of groupNames) {
  const groupNodes = indices.byName.get(groupName.toLowerCase().trim());
  if (groupNodes?.length) {
    links.push({ source: userNode.id, target: groupNodes[0].id, type: 'ownership' });
  }
}
```

#### 1.4 User → Manager Hierarchy
```typescript
// Link users to their managers
const managerNode = indices.byUPN.get(userRecord.ManagerUPN?.toLowerCase());
if (managerNode) {
  links.push({ source: managerNode.id, target: userNode.id, type: 'ownership' }); // Manager "owns" reports
}
```

### Phase 2: Application & Service Dependencies (MEDIUM PRIORITY)

**Goal:** Show application-to-application and service-to-service dependencies.

#### 2.1 Service Dependency Chain
```typescript
// Process Dependency_ServiceDependency.csv
// SourceService depends on DependsOn
links.push({
  source: sourceServiceNode.id,
  target: dependsOnNode.id,
  value: 1,
  type: 'dependency'
});
```

#### 2.2 Application ↔ Infrastructure Linking
```typescript
// Link WebApps to their Resource Groups
// Link Applications to their hosting servers (via InstallPath or process discovery)
```

### Phase 3: Business Capability Inference (MEDIUM PRIORITY)

**Goal:** Auto-generate business capability layer from department data.

#### 3.1 Extract Unique Departments
```typescript
// Collect all unique Department values from user records
const departments = new Set<string>();
for (const userNode of indices.byType.get('application') || []) {
  const dept = userNode.metadata?.record?.Department;
  if (dept && dept.trim()) {
    departments.add(dept.trim());
  }
}

// Create business-capability nodes
for (const dept of departments) {
  const capNode: SankeyNode = {
    id: `business-capability-${dept.toLowerCase().replace(/\s+/g, '-')}`,
    name: dept,
    type: 'business-capability',
    factSheet: createFactSheet({}, 'business-capability', 'Business Capability'),
    metadata: { source: 'inferred', priority: 4, category: 'Business Capability' }
  };
  nodes.push(capNode);
}
```

#### 3.2 Link Users to Departments
```typescript
// Link each user to their department capability
const deptNode = indices.byName.get(userRecord.Department?.toLowerCase());
if (deptNode) {
  links.push({ source: userNode.id, target: deptNode[0].id, type: 'realizes' });
}
```

### Phase 4: Fact Sheet Enrichment (LOW PRIORITY)

**Goal:** Populate the 9 LeanIX fact sheet tabs with real data.

#### 4.1 IT Components Tab
- Link applications to their underlying infrastructure
- Show server dependencies, database connections

#### 4.2 Subscriptions Tab
- Display Azure subscriptions linked to resources
- Show license assignments for users

#### 4.3 Relations Tab
- Populate incoming/outgoing relations from link data
- Show bidirectional relationships

### Phase 5: Advanced Features (FUTURE)

- **Export:** PNG/PDF/SVG/JSON export
- **Analytics:** Usage metrics, dependency analysis
- **Real-time:** Live discovery module updates
- **Collaboration:** Comments, todos, surveys

---

## Implementation Priority

| Priority | Phase | Feature | Effort | Business Value |
|----------|-------|---------|--------|----------------|
| 1 | Phase 1.1 | User ↔ Mailbox | Low | High - Core identity linking |
| 2 | Phase 1.3 | User ↔ Group | Low | High - Security visibility |
| 3 | Phase 1.4 | User → Manager | Low | Medium - Org structure |
| 4 | Phase 1.2 | User ↔ License | Medium | High - Cost management |
| 5 | Phase 2.1 | Service Dependencies | Medium | High - Impact analysis |
| 6 | Phase 3 | Business Capabilities | Medium | Medium - EA alignment |
| 7 | Phase 4 | Fact Sheet Enrichment | High | Medium - Detailed views |
| 8 | Phase 5 | Export/Analytics | High | Low - Power features |

---

## Files Reference

| File | Purpose |
|------|---------|
| `guiv2/src/renderer/hooks/useOrganisationMapLogic.ts` | Main hook - CSV processing, node/link generation |
| `guiv2/src/renderer/types/models/organisation.ts` | Type definitions for nodes, links, fact sheets |
| `guiv2/src/renderer/components/organisms/SankeyDiagram.tsx` | D3-based Sankey visualization |
| `guiv2/src/renderer/components/organisms/FactSheetModal.tsx` | 9-tab entity detail modal |
| `guiv2/src/renderer/views/organisation/OrganisationMapView.tsx` | Main view with modal integration |
| `guiv2/src/renderer/components/molecules/OrganisationMapFilters.tsx` | Entity type, status, search filtering |

---

## Next Steps

1. **Implement Phase 1.1-1.4** - User relationship building
2. **Test with ljpops profile data** - Verify linking works with real data
3. **Add new indices** - ObjectId index for groups, SubscriptionId index for Azure resources
4. **Benchmark performance** - Ensure linking doesn't exceed MAX_LINKS
5. **Update Fact Sheet** - Populate relations tab with new links

---

## Appendix: CSV Field Reference

### User Fields (for relationship building)
- `UserPrincipalName` - Primary key for user matching
- `ObjectId` / `Id` - Azure AD object identifier
- `Mail` - Email address (alternative matching key)
- `ManagerUPN` / `ManagerId` - Manager relationship
- `Department` - Business capability inference
- `GroupMemberships` - Semicolon-separated group names
- `GroupMembershipCount` - Number of groups
- `AssignedLicenses` - Semicolon-separated license GUIDs
- `AppRoleAssignmentCount` - Number of app role assignments

### Group Fields
- `id` / `ObjectId` - Primary key
- `displayName` - Display name for matching
- `mail` - Email address (for distribution groups)
- `groupTypes` - Array: "Unified", "DynamicMembership"
- `memberCount` - Number of members

### Application Fields
- `AppId` - Application ID (primary key)
- `ObjectId` - Azure AD object identifier
- `DisplayName` - Application name
- `ServicePrincipalType` - "Application", "ManagedIdentity", etc.

### Service Dependency Fields
- `SourceService` - Service that has the dependency
- `DependsOn` - Service that is depended upon
- `DependencyDirection` - "RequiredBy" | "Depends"
