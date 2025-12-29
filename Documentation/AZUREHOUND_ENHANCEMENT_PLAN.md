# Azure Discovery Enhancement Plan (Complete)
## Inspired by AzureHound Methodology

**Created:** 2025-12-29
**Author:** Architecture Review
**Status:** PLANNED

---

## Executive Summary

Enhance Azure discovery capabilities by incorporating collection techniques from AzureHound. This plan covers:
- 11 new discovery types across 4 PowerShell modules
- 11 new Discovery Views (run discovery)
- 11 new Discovered Views (view results)
- CSV output schemas
- Organisation Sankey integration with entity mapping and relationships

---

## Part 1: Discovery Architecture

### Module Assignment

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AZURE DISCOVERY MODULE MAP                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  AzureResourceDiscovery.psm1         AzureInfraDiscovery.psm1           │
│  ├── VM Scale Sets                   ├── Automation Accounts            │
│  ├── Function Apps                   └── Logic Apps                     │
│  └── Container Registries                                               │
│                                                                          │
│  AzureSecurityDiscovery.psm1         EntraIDAppDiscovery.psm1           │
│  ├── Management Groups               ├── Service Principal Owners       │
│  ├── PIM Eligible Roles              ├── Device Owners                  │
│  └── Subscription Owners             └── App Role Assignments           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 2: File Structure

### New Files to Create

```
guiv2/src/renderer/
├── hooks/
│   ├── useAzureVMSSDiscoveryLogic.ts
│   ├── useAzureFunctionsDiscoveryLogic.ts
│   ├── useAzureACRDiscoveryLogic.ts
│   ├── useAzureAutomationDiscoveryLogic.ts
│   ├── useAzureLogicAppsDiscoveryLogic.ts
│   ├── useAzureManagementGroupsDiscoveryLogic.ts
│   ├── useAzurePIMDiscoveryLogic.ts
│   ├── useAzureSubscriptionOwnersDiscoveryLogic.ts
│   ├── useServicePrincipalOwnersDiscoveryLogic.ts
│   ├── useDeviceOwnersDiscoveryLogic.ts
│   └── useAppRoleAssignmentsDiscoveryLogic.ts
│
├── views/discovery/
│   ├── AzureVMSSDiscoveryView.tsx
│   ├── AzureFunctionsDiscoveryView.tsx
│   ├── AzureACRDiscoveryView.tsx
│   ├── AzureAutomationDiscoveryView.tsx
│   ├── AzureLogicAppsDiscoveryView.tsx
│   ├── AzureManagementGroupsDiscoveryView.tsx
│   ├── AzurePIMDiscoveryView.tsx
│   ├── AzureSubscriptionOwnersDiscoveryView.tsx
│   ├── ServicePrincipalOwnersDiscoveryView.tsx
│   ├── DeviceOwnersDiscoveryView.tsx
│   └── AppRoleAssignmentsDiscoveryView.tsx
│
└── views/discovered/
    ├── AzureVMSSDiscoveredView.tsx
    ├── AzureFunctionsDiscoveredView.tsx
    ├── AzureACRDiscoveredView.tsx
    ├── AzureAutomationDiscoveredView.tsx
    ├── AzureLogicAppsDiscoveredView.tsx
    ├── AzureManagementGroupsDiscoveredView.tsx
    ├── AzurePIMDiscoveredView.tsx
    ├── AzureSubscriptionOwnersDiscoveredView.tsx
    ├── ServicePrincipalOwnersDiscoveredView.tsx
    ├── DeviceOwnersDiscoveredView.tsx
    └── AppRoleAssignmentsDiscoveredView.tsx
```

---

## Part 3: CSV Output Specifications

### Storage Location
```
C:\DiscoveryData\{CompanyName}\Raw\
```

### CSV File Schemas

#### 3.1 VMScaleSets.csv
| Column | Type | Description |
|--------|------|-------------|
| Name | string | Scale set name |
| ResourceGroup | string | Resource group |
| Location | string | Azure region |
| Sku | string | VM size (Standard_DS2_v2) |
| Capacity | int | Current instance count |
| InstanceCount | int | Running instances |
| UpgradePolicy | string | Manual/Automatic/Rolling |
| VirtualNetworkName | string | Connected VNet |
| SubnetName | string | Connected subnet |
| SubscriptionId | string | Azure subscription |

#### 3.2 FunctionApps.csv
| Column | Type | Description |
|--------|------|-------------|
| Name | string | Function app name |
| ResourceGroup | string | Resource group |
| Location | string | Azure region |
| Runtime | string | dotnet/node/python/java |
| RuntimeVersion | string | Version (e.g., "~4") |
| State | string | Running/Stopped |
| Kind | string | functionapp/functionapp,linux |
| HostNames | string | Semicolon-separated URLs |
| HttpsOnly | bool | HTTPS enforcement |
| AppServicePlan | string | Associated plan |

#### 3.3 ContainerRegistries.csv
| Column | Type | Description |
|--------|------|-------------|
| Name | string | Registry name |
| ResourceGroup | string | Resource group |
| Location | string | Azure region |
| Sku | string | Basic/Standard/Premium |
| LoginServer | string | {name}.azurecr.io |
| AdminUserEnabled | bool | Admin access enabled |
| CreationDate | datetime | Registry creation date |
| PublicNetworkAccess | string | Enabled/Disabled |
| NetworkRuleSet | string | Allow/Deny rules |

#### 3.4 AutomationAccounts.csv
| Column | Type | Description |
|--------|------|-------------|
| Name | string | Automation account name |
| ResourceGroup | string | Resource group |
| Location | string | Azure region |
| State | string | Account state |
| RunbookCount | int | Number of runbooks |
| ScheduleCount | int | Number of schedules |
| VariableCount | int | Number of variables |
| CreationTime | datetime | Creation timestamp |
| LastModifiedTime | datetime | Last modified |
| SubscriptionId | string | Azure subscription |

#### 3.5 LogicApps.csv
| Column | Type | Description |
|--------|------|-------------|
| Name | string | Logic app name |
| ResourceGroup | string | Resource group |
| Location | string | Azure region |
| State | string | Enabled/Disabled |
| Sku | string | Consumption/Standard |
| Version | string | Workflow version |
| CreatedTime | datetime | Creation timestamp |
| ChangedTime | datetime | Last modified |
| TriggerType | string | HTTP/Schedule/Event |
| ActionCount | int | Number of actions |

#### 3.6 ManagementGroups.csv
| Column | Type | Description |
|--------|------|-------------|
| Name | string | Management group ID |
| DisplayName | string | Friendly name |
| TenantId | string | Azure tenant |
| ParentId | string | Parent MG ID |
| ParentDisplayName | string | Parent MG name |
| ChildCount | int | Direct children |
| SubscriptionCount | int | Direct subscriptions |
| Level | int | Hierarchy depth |

#### 3.7 PIMEligibleRoles.csv
| Column | Type | Description |
|--------|------|-------------|
| PrincipalId | string | User/Group/SP ID |
| PrincipalName | string | Display name |
| PrincipalType | string | User/Group/ServicePrincipal |
| RoleDefinitionId | string | Role ID |
| RoleName | string | Global Administrator, etc. |
| DirectoryScopeId | string | Scope (/ or /admin units) |
| StartDateTime | datetime | Eligibility start |
| EndDateTime | datetime | Eligibility end |
| MemberType | string | Direct/Group |
| AssignmentState | string | Eligible/Active |

#### 3.8 SubscriptionOwners.csv
| Column | Type | Description |
|--------|------|-------------|
| SubscriptionId | string | Azure subscription ID |
| SubscriptionName | string | Subscription name |
| PrincipalId | string | Owner object ID |
| PrincipalName | string | Owner display name |
| PrincipalType | string | User/Group/ServicePrincipal |
| Scope | string | /subscriptions/{id} |
| RoleDefinitionId | string | Owner role ID |

#### 3.9 ServicePrincipalOwners.csv
| Column | Type | Description |
|--------|------|-------------|
| ServicePrincipalId | string | SP object ID |
| ServicePrincipalName | string | SP display name |
| ServicePrincipalAppId | string | Application ID |
| OwnerId | string | Owner object ID |
| OwnerName | string | Owner display name |
| OwnerType | string | User/ServicePrincipal |
| OwnerUPN | string | User principal name |

#### 3.10 DeviceOwners.csv
| Column | Type | Description |
|--------|------|-------------|
| DeviceId | string | Device object ID |
| DeviceName | string | Device display name |
| DeviceOS | string | Windows/iOS/Android |
| DeviceOSVersion | string | OS version |
| TrustType | string | AzureAd/Hybrid/Workplace |
| OwnerId | string | Owner object ID |
| OwnerName | string | Owner display name |
| OwnerUPN | string | Owner UPN |
| IsManaged | bool | MDM managed |
| IsCompliant | bool | Compliance state |

#### 3.11 AppRoleAssignments.csv
| Column | Type | Description |
|--------|------|-------------|
| AppRoleId | string | Role ID (GUID) |
| AppRoleName | string | Role display name |
| PrincipalId | string | Assigned principal |
| PrincipalDisplayName | string | Principal name |
| PrincipalType | string | User/Group/ServicePrincipal |
| ResourceId | string | Target app SP ID |
| ResourceDisplayName | string | Target app name |
| CreatedDateTime | datetime | Assignment date |

---

## Part 4: Organisation Sankey Integration

### Entity Type Mapping (useOrganisationMapLogic.ts)

Add these mappings to the `typeMapping` object:

```typescript
// ===== AZURE SCALE & SERVERLESS (Priority 2 - IT Components) =====
'vmscalesets': {
  type: 'it-component',
  getName: (r) => r.Name || r.ResourceGroup,
  priority: 2,
  category: 'Azure Resource'
},
'functionapps': {
  type: 'application',
  getName: (r) => r.Name,
  priority: 2,
  category: 'Azure Resource'
},
'containerregistries': {
  type: 'it-component',
  getName: (r) => r.Name || r.LoginServer,
  priority: 2,
  category: 'Azure Resource'
},

// ===== AZURE AUTOMATION (Priority 2 - IT Components) =====
'automationaccounts': {
  type: 'it-component',
  getName: (r) => r.Name,
  priority: 2,
  category: 'Azure Resource'
},
'logicapps': {
  type: 'application',
  getName: (r) => r.Name,
  priority: 2,
  category: 'Azure Resource'
},

// ===== AZURE GOVERNANCE (Priority 3 - Platforms) =====
'managementgroups': {
  type: 'platform',
  getName: (r) => r.DisplayName || r.Name,
  priority: 3,
  category: 'Subscription'
},
'pimeligibleroles': {
  type: 'provider-interface',
  getName: (r) => `${r.PrincipalName} → ${r.RoleName}`,
  priority: 3,
  category: 'Directory Role'
},
'subscriptionowners': {
  type: 'provider-interface',
  getName: (r) => `${r.PrincipalName} (Owner: ${r.SubscriptionName})`,
  priority: 3,
  category: 'Subscription'
},

// ===== IDENTITY OWNERSHIP (Priority 3 - Platforms) =====
'serviceprincipalowners': {
  type: 'provider-interface',
  getName: (r) => `${r.ServicePrincipalName} → ${r.OwnerName}`,
  priority: 3,
  category: 'Service Principal'
},
'deviceowners': {
  type: 'consumer-interface',
  getName: (r) => `${r.DeviceName} → ${r.OwnerName}`,
  priority: 3,
  category: 'User'
},
'approleassignments': {
  type: 'provider-interface',
  getName: (r) => `${r.PrincipalDisplayName} → ${r.ResourceDisplayName}`,
  priority: 3,
  category: 'EntraID App'
},
```

### Relationship Inference Rules

Add to `buildRelationships()` function:

```typescript
// Management Group → Subscription relationships
if (sourceFile.includes('managementgroups') && record.SubscriptionCount > 0) {
  // Link to any subscriptions discovered in Azure Resource Discovery
  const subscriptionNodes = nodes.filter(n =>
    n.metadata?.category === 'Subscription' &&
    n.metadata?.parentManagementGroup === record.Name
  );
  subscriptionNodes.forEach(subNode => {
    links.push({
      source: nodeId,
      target: subNode.id,
      value: 1,
      type: 'contains'
    });
  });
}

// PIM Eligible Role → Principal relationships
if (sourceFile.includes('pimeligibleroles')) {
  const principalNode = findNodeByName(record.PrincipalName, nodes);
  if (principalNode) {
    links.push({
      source: nodeId,
      target: principalNode.id,
      value: 1,
      type: 'eligible-for'
    });
  }
}

// Service Principal → Owner relationships
if (sourceFile.includes('serviceprincipalowners')) {
  const ownerNode = findNodeByName(record.OwnerName, nodes);
  if (ownerNode) {
    links.push({
      source: nodeId,
      target: ownerNode.id,
      value: 1,
      type: 'owned-by'
    });
  }
}

// Device → Owner relationships
if (sourceFile.includes('deviceowners')) {
  const ownerNode = findNodeByName(record.OwnerName, nodes);
  if (ownerNode) {
    links.push({
      source: nodeId,
      target: ownerNode.id,
      value: 1,
      type: 'owned-by'
    });
  }
}

// App Role Assignment → Resource relationships
if (sourceFile.includes('approleassignments')) {
  const resourceNode = findNodeByName(record.ResourceDisplayName, nodes);
  if (resourceNode) {
    links.push({
      source: nodeId,
      target: resourceNode.id,
      value: 1,
      type: 'assigned-to'
    });
  }
}

// VM Scale Set → VNet relationships
if (sourceFile.includes('vmscalesets') && record.VirtualNetworkName) {
  const vnetNode = findNodeByName(record.VirtualNetworkName, nodes);
  if (vnetNode) {
    links.push({
      source: nodeId,
      target: vnetNode.id,
      value: 1,
      type: 'connected-to'
    });
  }
}

// Function App → App Service Plan relationships
if (sourceFile.includes('functionapps') && record.AppServicePlan) {
  const planNode = findNodeByName(record.AppServicePlan, nodes);
  if (planNode) {
    links.push({
      source: nodeId,
      target: planNode.id,
      value: 1,
      type: 'hosted-on'
    });
  }
}
```

### Sankey Category Colors (SankeyDiagram.tsx)

Already defined categories that will be used:
- `'Azure Resource': '#0ea5e9'` (sky-500)
- `'Subscription': '#f97316'` (orange-500)
- `'Directory Role': '#dc2626'` (red-600)
- `'Service Principal': '#0284c7'` (sky-600)
- `'User': '#22d3ee'` (cyan-400)
- `'EntraID App': '#3b82f6'` (blue-500)

---

## Part 5: Sankey Visualization Flow

### How New Data Appears in Organisation Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SANKEY LAYER FLOW                                │
│                                                                          │
│  Layer 1              Layer 2              Layer 3              Layer 4  │
│  Infrastructure       IT Components        Platforms/Services   Business │
│                                                                          │
│  ┌──────────┐        ┌──────────┐         ┌──────────┐                  │
│  │ Management│───────→│ VM Scale │────────→│ VNet     │                  │
│  │ Groups    │        │ Sets     │         │          │                  │
│  └──────────┘        └──────────┘         └──────────┘                  │
│       │                                                                  │
│       │              ┌──────────┐         ┌──────────┐                  │
│       └─────────────→│ Function │────────→│ App Svc  │                  │
│                      │ Apps     │         │ Plan     │                  │
│                      └──────────┘         └──────────┘                  │
│                                                                          │
│                      ┌──────────┐         ┌──────────┐                  │
│                      │ Container│         │ PIM      │                  │
│                      │ Registry │         │ Roles    │───→ Users        │
│                      └──────────┘         └──────────┘                  │
│                                                                          │
│                      ┌──────────┐         ┌──────────┐                  │
│                      │ Automation│        │ SP       │                  │
│                      │ Accounts │         │ Owners   │───→ Users        │
│                      └──────────┘         └──────────┘                  │
│                                                                          │
│                      ┌──────────┐         ┌──────────┐                  │
│                      │ Logic    │         │ Device   │                  │
│                      │ Apps     │         │ Owners   │───→ Users        │
│                      └──────────┘         └──────────┘                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Relationships Visualized

| Source Entity | Relationship | Target Entity | Value |
|---------------|--------------|---------------|-------|
| Management Group | contains | Subscription | Child count |
| VM Scale Set | connected-to | VNet | 1 |
| Function App | hosted-on | App Service Plan | 1 |
| PIM Role | eligible-for | User/Group | 1 |
| Service Principal | owned-by | User | 1 |
| Device | owned-by | User | 1 |
| App Role | assigned-to | Application | 1 |
| Subscription | has-owner | User/Group | 1 |

---

## Part 6: Discovery Hub Tiles

### Add to useInfrastructureDiscoveryHubLogic.ts

```typescript
// Azure Compute & Serverless Section
{
  id: 'azure-vmss',
  name: 'VM Scale Sets',
  icon: 'Layers',
  description: 'Discover Azure Virtual Machine Scale Sets',
  route: '/discovery/azure-vmss',
  status: 'idle',
},
{
  id: 'azure-functions',
  name: 'Function Apps',
  icon: 'Zap',
  description: 'Discover Azure Function Apps',
  route: '/discovery/azure-functions',
  status: 'idle',
},
{
  id: 'azure-acr',
  name: 'Container Registries',
  icon: 'Package',
  description: 'Discover Azure Container Registries',
  route: '/discovery/azure-acr',
  status: 'idle',
},

// Azure Automation Section
{
  id: 'azure-automation',
  name: 'Automation Accounts',
  icon: 'Cog',
  description: 'Discover Azure Automation Accounts and Runbooks',
  route: '/discovery/azure-automation',
  status: 'idle',
},
{
  id: 'azure-logic-apps',
  name: 'Logic Apps',
  icon: 'GitBranch',
  description: 'Discover Azure Logic Apps workflows',
  route: '/discovery/azure-logic-apps',
  status: 'idle',
},

// Azure Governance Section
{
  id: 'azure-mgmt-groups',
  name: 'Management Groups',
  icon: 'FolderTree',
  description: 'Discover Azure Management Group hierarchy',
  route: '/discovery/azure-mgmt-groups',
  status: 'idle',
},
{
  id: 'azure-pim',
  name: 'PIM Eligible Roles',
  icon: 'Shield',
  description: 'Discover Privileged Identity Management eligible roles',
  route: '/discovery/azure-pim',
  status: 'idle',
},
{
  id: 'azure-sub-owners',
  name: 'Subscription Owners',
  icon: 'UserCog',
  description: 'Discover Azure Subscription owner assignments',
  route: '/discovery/azure-sub-owners',
  status: 'idle',
},

// Identity Ownership Section
{
  id: 'sp-owners',
  name: 'Service Principal Owners',
  icon: 'Users',
  description: 'Discover Service Principal ownership',
  route: '/discovery/sp-owners',
  status: 'idle',
},
{
  id: 'device-owners',
  name: 'Device Owners',
  icon: 'Smartphone',
  description: 'Discover Entra ID device ownership',
  route: '/discovery/device-owners',
  status: 'idle',
},
{
  id: 'app-role-assignments',
  name: 'App Role Assignments',
  icon: 'Key',
  description: 'Discover application role assignments',
  route: '/discovery/app-role-assignments',
  status: 'idle',
},
```

---

## Part 7: Routes Configuration

### Add to routes.tsx

```typescript
// Azure Compute & Serverless
{ path: '/discovery/azure-vmss', element: lazyLoad(() => import('./views/discovery/AzureVMSSDiscoveryView')) },
{ path: '/discovery/azure-functions', element: lazyLoad(() => import('./views/discovery/AzureFunctionsDiscoveryView')) },
{ path: '/discovery/azure-acr', element: lazyLoad(() => import('./views/discovery/AzureACRDiscoveryView')) },

// Azure Automation
{ path: '/discovery/azure-automation', element: lazyLoad(() => import('./views/discovery/AzureAutomationDiscoveryView')) },
{ path: '/discovery/azure-logic-apps', element: lazyLoad(() => import('./views/discovery/AzureLogicAppsDiscoveryView')) },

// Azure Governance
{ path: '/discovery/azure-mgmt-groups', element: lazyLoad(() => import('./views/discovery/AzureManagementGroupsDiscoveryView')) },
{ path: '/discovery/azure-pim', element: lazyLoad(() => import('./views/discovery/AzurePIMDiscoveryView')) },
{ path: '/discovery/azure-sub-owners', element: lazyLoad(() => import('./views/discovery/AzureSubscriptionOwnersDiscoveryView')) },

// Identity Ownership
{ path: '/discovery/sp-owners', element: lazyLoad(() => import('./views/discovery/ServicePrincipalOwnersDiscoveryView')) },
{ path: '/discovery/device-owners', element: lazyLoad(() => import('./views/discovery/DeviceOwnersDiscoveryView')) },
{ path: '/discovery/app-role-assignments', element: lazyLoad(() => import('./views/discovery/AppRoleAssignmentsDiscoveryView')) },

// Discovered Views
{ path: '/discovered/azure-vmss', element: lazyLoad(() => import('./views/discovered/AzureVMSSDiscoveredView')) },
{ path: '/discovered/azure-functions', element: lazyLoad(() => import('./views/discovered/AzureFunctionsDiscoveredView')) },
{ path: '/discovered/azure-acr', element: lazyLoad(() => import('./views/discovered/AzureACRDiscoveredView')) },
{ path: '/discovered/azure-automation', element: lazyLoad(() => import('./views/discovered/AzureAutomationDiscoveredView')) },
{ path: '/discovered/azure-logic-apps', element: lazyLoad(() => import('./views/discovered/AzureLogicAppsDiscoveredView')) },
{ path: '/discovered/azure-mgmt-groups', element: lazyLoad(() => import('./views/discovered/AzureManagementGroupsDiscoveredView')) },
{ path: '/discovered/azure-pim', element: lazyLoad(() => import('./views/discovered/AzurePIMDiscoveredView')) },
{ path: '/discovered/azure-sub-owners', element: lazyLoad(() => import('./views/discovered/AzureSubscriptionOwnersDiscoveredView')) },
{ path: '/discovered/sp-owners', element: lazyLoad(() => import('./views/discovered/ServicePrincipalOwnersDiscoveredView')) },
{ path: '/discovered/device-owners', element: lazyLoad(() => import('./views/discovered/DeviceOwnersDiscoveredView')) },
{ path: '/discovered/app-role-assignments', element: lazyLoad(() => import('./views/discovered/AppRoleAssignmentsDiscoveredView')) },
```

---

## Part 8: Sidebar Updates

### Discovery Sidebar (_sidebar.generated.tsx)

```typescript
// Azure Compute & Serverless
{ path: '/discovery/azure-vmss', label: 'VM Scale Sets', icon: <Layers size={16} /> },
{ path: '/discovery/azure-functions', label: 'Function Apps', icon: <Zap size={16} /> },
{ path: '/discovery/azure-acr', label: 'Container Registries', icon: <Package size={16} /> },

// Azure Automation
{ path: '/discovery/azure-automation', label: 'Automation Accounts', icon: <Cog size={16} /> },
{ path: '/discovery/azure-logic-apps', label: 'Logic Apps', icon: <GitBranch size={16} /> },

// Azure Governance
{ path: '/discovery/azure-mgmt-groups', label: 'Management Groups', icon: <FolderTree size={16} /> },
{ path: '/discovery/azure-pim', label: 'PIM Eligible Roles', icon: <Shield size={16} /> },
{ path: '/discovery/azure-sub-owners', label: 'Subscription Owners', icon: <UserCog size={16} /> },

// Identity Ownership
{ path: '/discovery/sp-owners', label: 'SP Owners', icon: <Users size={16} /> },
{ path: '/discovery/device-owners', label: 'Device Owners', icon: <Smartphone size={16} /> },
{ path: '/discovery/app-role-assignments', label: 'App Role Assignments', icon: <Key size={16} /> },
```

### Discovered Sidebar

```typescript
// New Azure discovered views
{ path: '/discovered/azure-vmss', label: 'VM Scale Sets', icon: <Layers size={16} /> },
{ path: '/discovered/azure-functions', label: 'Function Apps', icon: <Zap size={16} /> },
{ path: '/discovered/azure-acr', label: 'Container Registries', icon: <Package size={16} /> },
{ path: '/discovered/azure-automation', label: 'Automation Accounts', icon: <Cog size={16} /> },
{ path: '/discovered/azure-logic-apps', label: 'Logic Apps', icon: <GitBranch size={16} /> },
{ path: '/discovered/azure-mgmt-groups', label: 'Management Groups', icon: <FolderTree size={16} /> },
{ path: '/discovered/azure-pim', label: 'PIM Eligible Roles', icon: <Shield size={16} /> },
{ path: '/discovered/azure-sub-owners', label: 'Subscription Owners', icon: <UserCog size={16} /> },
{ path: '/discovered/sp-owners', label: 'SP Owners', icon: <Users size={16} /> },
{ path: '/discovered/device-owners', label: 'Device Owners', icon: <Smartphone size={16} /> },
{ path: '/discovered/app-role-assignments', label: 'App Role Assignments', icon: <Key size={16} /> },
```

---

## Part 9: Implementation Phases

### Phase 1: Azure Resource Discovery Enhancements (3 items)
**Priority:** HIGH | **Effort:** 3-4 hours

1. Add to `AzureResourceDiscovery.psm1`:
   - VM Scale Sets enumeration
   - Function Apps enumeration
   - Container Registries enumeration

2. Create hooks and views for each

3. Update sidebars and routes

### Phase 2: Azure Infrastructure Discovery (2 items)
**Priority:** MEDIUM | **Effort:** 2-3 hours

1. Add to `AzureInfraDiscovery.psm1`:
   - Automation Accounts enumeration
   - Logic Apps enumeration

2. Create hooks and views

### Phase 3: Azure Security Discovery (3 items)
**Priority:** HIGH | **Effort:** 4-5 hours

1. Add to `AzureSecurityDiscovery.psm1`:
   - Management Groups enumeration
   - PIM Eligible Roles enumeration
   - Subscription Owners enumeration

2. Create hooks and views

### Phase 4: EntraID Identity Discovery (3 items)
**Priority:** MEDIUM | **Effort:** 3-4 hours

1. Add to `EntraIDAppDiscovery.psm1`:
   - Service Principal Owners enumeration
   - Device Owners enumeration
   - App Role Assignments enumeration

2. Create hooks and views

### Phase 5: Organisation Map Integration
**Priority:** HIGH | **Effort:** 2-3 hours

1. Add type mappings to `useOrganisationMapLogic.ts`
2. Add relationship inference rules
3. Test Sankey visualization with new data

---

## Part 10: Reflection - Sankey Integration Value

### How New Data Enriches the Organisation Map

| Discovery Type | Sankey Value | Relationships Created |
|----------------|--------------|----------------------|
| **VM Scale Sets** | Shows compute infrastructure at scale | VMSS → VNet, VMSS → Subnet |
| **Function Apps** | Visualizes serverless architecture | FunctionApp → AppServicePlan |
| **Container Registries** | Maps container infrastructure | ACR → Subscription |
| **Automation Accounts** | Shows automation dependencies | AutomationAccount → Runbooks |
| **Logic Apps** | Visualizes integration workflows | LogicApp → Connectors |
| **Management Groups** | **CRITICAL** - Shows governance hierarchy | MG → Subscriptions → Resources |
| **PIM Eligible Roles** | **SECURITY** - Privileged access paths | User → PIM Role → Resources |
| **Subscription Owners** | **SECURITY** - Control plane access | Owner → Subscription |
| **SP Owners** | **SECURITY** - App ownership chains | SP → Owner → User |
| **Device Owners** | User-to-device mapping | Device → Owner |
| **App Role Assignments** | Application permission flows | User → AppRole → Application |

### Critical Security Insights (BloodHound-style)

The new data enables security-focused visualizations:

1. **Privileged Access Paths**: PIM eligible roles show who CAN become privileged
2. **Ownership Chains**: SP Owners + Subscription Owners show control paths
3. **Attack Surface**: VM Scale Sets + Function Apps show exposed compute
4. **Governance Gaps**: Management Groups show hierarchy and control boundaries

### Entity Count Impact

| Current Sankey | After Enhancement |
|----------------|-------------------|
| ~116 CSV types | ~127 CSV types (+11) |
| Infrastructure focus | + Governance/Security focus |
| Resource inventory | + Relationship mapping |

---

## Appendix: Required PowerShell Modules

```powershell
# Verify/install all required modules
$requiredModules = @(
    'Az.Accounts',
    'Az.Compute',           # VM Scale Sets
    'Az.Functions',         # Function Apps
    'Az.ContainerRegistry', # Container Registries
    'Az.Automation',        # Automation Accounts
    'Az.LogicApp',          # Logic Apps
    'Az.Resources',         # Management Groups
    'Microsoft.Graph.Applications',
    'Microsoft.Graph.Identity.Governance',
    'Microsoft.Graph.Identity.DirectoryManagement'
)

foreach ($module in $requiredModules) {
    if (-not (Get-Module -ListAvailable -Name $module)) {
        Write-Host "Installing $module..."
        Install-Module -Name $module -Force -AllowClobber -Scope CurrentUser
    }
}
```

---

## Summary

This enhancement adds **11 new discovery types** that will:
- Create **11 new CSV files** in the Raw folder
- Display in **11 new Discovery Views** (run discovery)
- Display in **11 new Discovered Views** (view results in data grid)
- Flow into the **Organisation Sankey** with proper entity types and relationships
- Enable **security-focused** visualizations similar to BloodHound/AzureHound

**Total Files to Create:** 44 files (11 hooks + 11 discovery views + 11 discovered views + updates to 11 existing files)

**Ready to begin implementation?**
