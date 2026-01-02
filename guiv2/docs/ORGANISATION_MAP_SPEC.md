# Organisation Map Technical Specification

**Author:** ljpops.com (Lukian Poleschtschuk)
**Last Updated:** 2026-01-02
**Status:** Production
**Version:** 1.0

---

## 1. Overview

The Organisation Map is a LeanIX-style enterprise architecture visualization system that transforms discovered CSV data into interactive Sankey diagrams with multi-branch relation exploration.

### 1.1 Key Capabilities

- **116+ CSV file type mappings** to entity nodes
- **16 entity types** across 7 layers
- **7 specialized linker modules** for relationship generation
- **Confidence scoring** with evidence tracking
- **9-tab Fact Sheet** modals (LeanIX-style)
- **Service principal classification** to prevent bucket inflation
- **Organizational structure inference** from user data

---

## 2. Entity Type Taxonomy

### 2.1 Complete Entity Type List

```typescript
export type EntityType =
  // Core LeanIX types
  | 'company'
  | 'platform'
  | 'application'
  | 'datacenter'
  | 'provider-interface'
  | 'consumer-interface'
  | 'business-capability'
  | 'it-component'
  // Identity & Access types
  | 'user'
  | 'group'
  | 'mailbox'
  | 'license'
  // Azure hierarchy types
  | 'subscription'
  | 'resource-group'
  // Organization hierarchy types
  | 'l3-organization'
  | 'line-of-business'
  | 'business-unit-location';
```

### 2.2 Layer Hierarchy

| Priority | Layer | Entity Types | Sankey Position |
|----------|-------|--------------|-----------------|
| 1 | Infrastructure | datacenter, it-component | Left (source) |
| 1.5 | Organization | l3-organization, line-of-business, business-unit-location | Near left |
| 2 | Applications | application | Center-left |
| 2 | Identity | user, mailbox | Center |
| 2.5 | Interfaces | provider-interface, consumer-interface | Center |
| 3 | Platform | platform, group, license, subscription, resource-group | Center-right |
| 4 | Business | business-capability | Right (target) |

### 2.3 Type Mapping Categories

The `typeMapping` in `useOrganisationMapLogic.ts` maps 116+ CSV file types to entity types:

#### Infrastructure (Priority 1)
```
infrastructure, azureinfrastructure, infrastructurediscovery_subnet,
physicalserverdiscovery, physicalserver_bios, physicalserver_hardware,
physicalserver_networkhardware, physicalserver_storage, fileservers,
filesystemservers, testinfrastructure
```

#### IT Components (Priority 2)
```
databases, sqlinventory, storage_localstorage, storage_storagespaces,
storage_storagesummary, network_dnsservers, networkinfrastructure_*,
dnsdhcpdiscovery, azureresourcediscovery_*, ca_certificates,
certificate_*, backup_*, dependency_*, scheduledtask_*,
environmentdetection_*, filesystemfileanalysis, filesystemlargefiles,
filesystempermissions, filesystemshares, dataclassification_*
```

#### Applications (Priority 2)
```
applications, applicationcatalog, softwareinventory,
azurediscovery_applications, azureresourcediscovery_webapps,
webserver_webframework, entraidappregistrations, entraidenterpriseapps,
exchangediscovery, onedrivediscovery, powerplatformdiscovery,
powerbidiscovery, azurefunctionsdiscovery, azurelogicappsdiscovery,
azureautomationdiscovery
```

#### Identity (Priority 2)
```
users, azurediscovery_users, azureusers, graphusers, exchangemailboxes
```

#### Platform (Priority 3)
```
groups, azurediscovery_groups, azuregroups, graphgroups,
exchangedistributiongroups, azureresourcediscovery_subscriptions,
azurediscovery_tenant, azureresourcediscovery_resourcegroups,
azurediscovery_directoryroles, azurediscovery_serviceprincipals,
entraidserviceprincipals, azureresourcediscovery_networksecuritygroups,
conditionalaccessdiscovery, dlpdiscovery, security_*,
adpolicies, authenticationmethods, grouppolicies,
azuremanagementgroupsdiscovery, azurepimdiscovery,
azurekeyvaultaccessdiscovery, azuremanagedidentitiesdiscovery
```

#### Licensing (Priority 3)
```
licensingdiscoverylicensingsubscriptions, licensingsubscriptions,
licensingdiscovery_licenses, licensingdiscoveryuserassignment,
licensingdiscovery_userassignments, userassignment
```

#### Organization (Priority 1)
```
organization, l3organization, businessunit, lineofbusiness,
division, location, office, site
```

#### Business Capabilities (Priority 4)
```
department, capability
```

#### Provider Interfaces (Priority 2)
```
apiendpoints, webhooks, graphapipermissions, oauth2permissions,
azurediscovery_apppermissions, entraidapppermissions,
logicappconnectors, powerautomateconnectors, azurefunctionbindings,
servicebusqueues, servicebustopics, eventhubs
```

#### Consumer Interfaces (Priority 2)
```
apiconsumers, oauthclients, integrations, dataflows,
powerbiconnections, synapsepipelines, datafactorypipelines
```

---

## 3. Relation Types

### 3.1 Complete Relation Type List

```typescript
export type RelationType =
  // Hierarchy relations
  | 'ownership'        // Company → Platform → Application
  | 'deployment'       // Application → Data Center
  | 'provides'         // Application → Provider Interface
  | 'consumes'         // Consumer Interface → Application
  | 'dependency'       // Application → Application
  | 'realizes'         // Application → Business Capability
  // Identity & Access relations
  | 'has-mailbox'      // User → Mailbox
  | 'assigned'         // User → License
  | 'member-of'        // User → Group
  | 'manages'          // Manager → Direct Report
  // Azure hierarchy relations
  | 'scoped-to';       // Resource → Resource Group, RG → Subscription
```

### 3.2 Relation Semantics

| Relation | Source Type | Target Type | Meaning |
|----------|-------------|-------------|---------|
| ownership | company, platform, subscription | platform, application, resource-group | Parent owns child |
| deployment | application | datacenter | App deployed to DC |
| provides | application, it-component | provider-interface | Exposes API/service |
| consumes | consumer-interface | application, it-component | Uses API/service |
| dependency | application | application, it-component | Runtime dependency |
| realizes | application | business-capability | Enables capability |
| has-mailbox | user | mailbox | User owns mailbox |
| assigned | user | license | License assigned to user |
| member-of | user | group | User is group member |
| manages | user | user | Manager/report hierarchy |
| scoped-to | it-component | resource-group, subscription | Azure scope hierarchy |

---

## 4. Linker System

### 4.1 Linker Architecture

Each linker receives a `LinkContext` and returns `SankeyLink[]`:

```typescript
export interface LinkContext {
  nodes: SankeyNode[];
  indices: NodeIndices;
  nodesBySource: Record<string, SankeyNode[]>;
  recordsByFileTypeKey: Record<string, any[]>;
}

export interface NodeIndices {
  byId: Map<string, SankeyNode>;
  byName: Map<string, SankeyNode[]>;
  byType: Map<EntityType, SankeyNode[]>;
  byUPN: Map<string, SankeyNode>;
  byAppId: Map<string, SankeyNode>;
  byObjectId: Map<string, SankeyNode>;
  byMail: Map<string, SankeyNode>;
  bySkuPartNumber: Map<string, SankeyNode>;
  bySkuId: Map<string, SankeyNode>;
  bySubscriptionId: Map<string, SankeyNode>;
  byResourceGroupName: Map<string, SankeyNode[]>;
  bySamAccountName: Map<string, SankeyNode>;
}
```

### 4.2 Linker Modules

#### linkTenant.ts
**Purpose:** Tenant and subscription hierarchy relationships

**Key Relations:**
- Company → Platform (ownership)
- Platform → Application (ownership)
- Tenant → Subscription (ownership)

**Matching Strategy:**
- Tenant ID matching (EXACT, 100%)
- Subscription ID matching (EXACT, 95%)
- Name fallback (MEDIUM, 70%)

#### linkIdentity.ts
**Purpose:** User, group, and mailbox relationships

**Key Relations:**
- Company → User (ownership)
- User → Mailbox (has-mailbox)
- User → Group (member-of)
- Manager → Report (manages)

**Matching Strategy:**
- UPN match (EXACT, 100%)
- ObjectId match (EXACT, 95%)
- Email match (HIGH, 90%)
- ManagerUPN/ManagerId (EXACT, 100/95%)
- GroupMemberships field parsing (MEDIUM, 75%)

#### linkLicensing.ts
**Purpose:** License assignment relationships

**Key Relations:**
- User → License (assigned)
- License Subscription → Tenant (ownership)

**Matching Strategy:**
- UPN + SkuPartNumber (EXACT, 100%)
- UPN + SkuId (EXACT, 95%)
- ObjectId + SkuPartNumber (HIGH, 90%)

#### linkAzureInfra.ts
**Purpose:** Azure resource hierarchy

**Key Relations:**
- Subscription → Resource Group (ownership)
- Resource Group → Resources (scoped-to)
- VMs → Virtual Networks (deployment)
- Storage Accounts → Resource Group (scoped-to)

**Matching Strategy:**
- SubscriptionId match (EXACT, 100%)
- ResourceGroupName match (HIGH, 90%)
- VNet/Subnet matching (MEDIUM, 80%)

#### linkApps.ts
**Purpose:** Application and service relationships

**Key Relations:**
- Application → Database (provides)
- Application → API (provides)
- Service Principal → Application (ownership)
- Web App → App Service Plan (deployment)

**Matching Strategy:**
- AppId match (EXACT, 100%)
- ConnectionString parsing (MEDIUM, 75%)
- Service endpoint matching (MEDIUM, 70%)

#### linkDependencies.ts
**Purpose:** Service and configuration dependencies

**Key Relations:**
- Application → Service (dependency)
- Process → Process (dependency)
- Config → Application (dependency)

**Matching Strategy:**
- Process name matching (HIGH, 85%)
- Service dependency field (MEDIUM, 75%)
- Config file parsing (MEDIUM, 70%)

#### linkSecurity.ts
**Purpose:** Security policy relationships

**Key Relations:**
- Conditional Access → Users/Groups (ownership)
- DLP Policy → Content Types (ownership)
- Security Software → Devices (deployment)

**Matching Strategy:**
- Policy ID matching (EXACT, 100%)
- Scope matching (HIGH, 85%)
- Name matching (MEDIUM, 70%)

---

## 5. Confidence Scoring

### 5.1 Match Rules

```typescript
export type MatchRule = 'EXACT' | 'HIGH' | 'MEDIUM' | 'LOW';
```

| Rule | Confidence Range | Matching Criteria |
|------|------------------|-------------------|
| EXACT | 95-100 | Primary key match (ObjectId, UPN, AppId, SubscriptionId) |
| HIGH | 85-94 | Secondary identifier match (Email, verified external ID) |
| MEDIUM | 70-84 | Name-based match, parsed field match |
| LOW | 50-69 | Heuristic match, inferred relationship |

### 5.2 Evidence Tracking

Each link includes evidence for provenance:

```typescript
export interface LinkEvidence {
  file: string;           // Source CSV file
  fields: string[];       // Fields used for matching
  sourceValue?: string;   // Value from source node
  targetValue?: string;   // Value from target node
}
```

### 5.3 Confidence Calculation

```typescript
function addLink(
  links: SankeyLink[],
  source: string,
  target: string,
  type: RelationType,
  confidence: number = 70,
  matchRule: MatchRule = 'MEDIUM',
  evidence: LinkEvidence[] = []
): void {
  const key = `${source}:${target}:${type}`;
  if (!links.some(l => `${l.source}:${l.target}:${l.type}` === key)) {
    links.push({
      source,
      target,
      value: 1,
      type,
      confidence,
      matchRule,
      evidence
    });
  }
}
```

---

## 6. Node Indices

### 6.1 Index Types

| Index | Key | Value | Use Case |
|-------|-----|-------|----------|
| byId | node.id | SankeyNode | Direct lookup |
| byName | name.toLowerCase() | SankeyNode[] | Name-based linking |
| byType | EntityType | SankeyNode[] | Type filtering |
| byUPN | UserPrincipalName | SankeyNode | Identity linking |
| byAppId | AppId | SankeyNode | Application linking |
| byObjectId | ObjectId/Id | SankeyNode | Cross-file matching |
| byMail | Mail/PrimarySmtpAddress | SankeyNode | Email-based linking |
| bySkuPartNumber | SkuPartNumber | SankeyNode | License linking |
| bySkuId | SkuId | SankeyNode | License linking |
| bySubscriptionId | SubscriptionId | SankeyNode | Azure hierarchy |
| byResourceGroupName | ResourceGroupName | SankeyNode[] | Azure scoping |
| bySamAccountName | SamAccountName | SankeyNode | On-prem identity |

### 6.2 Index Creation

```typescript
function createNodeIndices(nodes: SankeyNode[]): NodeIndices {
  // O(n) single pass through all nodes
  for (const node of nodes) {
    const record = node.metadata?.record || {};

    // Index by ID (always present)
    byId.set(node.id, node);

    // Index by normalized name (allows multiple nodes)
    const nameLower = node.name.toLowerCase();
    if (!byName.has(nameLower)) {
      byName.set(nameLower, []);
    }
    byName.get(nameLower)!.push(node);

    // Index by type (allows multiple nodes)
    if (!byType.has(node.type)) {
      byType.set(node.type, []);
    }
    byType.get(node.type)!.push(node);

    // Extract identifiers from record
    const upn = record.UserPrincipalName || record.userPrincipalName;
    if (upn) byUPN.set(upn.toLowerCase(), node);

    // ... additional indices
  }
}
```

---

## 7. Performance Optimization

### 7.1 Limits

```typescript
const MAX_NODES = 5000;
const MAX_LINKS = 10000;
```

### 7.2 Caching

```typescript
// Cache for processed data with version
const cacheRef = useRef<Map<string, SankeyNode[]>>(new Map());
const cacheVersionRef = useRef<string>(CACHE_VERSION);

// Cache key includes file modification date
const cacheKey = `${file.path}_${file.modifiedDate || ''}`;
let fileNodes = cacheRef.current.get(cacheKey);
if (!fileNodes) {
  const content = await window.electronAPI.invoke('read-discovery-file', file.path);
  fileNodes = parseCSVToNodes(content, fileTypeKey, file.path);
  cacheRef.current.set(cacheKey, fileNodes);
}
```

### 7.3 Lazy Link Generation

Links are generated in phases:
1. **Phase 1:** Within-file links (during CSV parsing)
2. **Phase 2:** Cross-file links (after all nodes loaded)
3. **Phase 3:** Linker modules (rule-based generation)

### 7.4 Index Complexity

| Operation | Complexity |
|-----------|------------|
| Node lookup by ID | O(1) |
| Node lookup by UPN | O(1) |
| Nodes by type | O(1) |
| Link generation per linker | O(n) |
| Total link generation | O(n × 7 linkers) |

---

## 8. Organizational Structure Inference

### 8.1 Inferred Entities

The system infers organizational structure from user data:

```typescript
const { inferredNodes, inferredLinks } = inferOrganizationalStructure(
  mergedData.nodes,
  indices,
  selectedSourceProfile?.companyName
    ? `company_${selectedSourceProfile.companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
    : undefined
);
```

### 8.2 Inference Sources

| User Field | Inferred Entity Type |
|------------|---------------------|
| Department | line-of-business |
| OfficeLocation | business-unit-location |
| City | business-unit-location |
| Country | business-unit-location |
| Division | line-of-business |
| BusinessUnit | line-of-business |

### 8.3 Company Node

If a profile has a company name, a root company node is created:

```typescript
type: 'company',
priority: 0, // Highest priority (leftmost)
category: 'Company'
```

---

## 9. Fact Sheet Modal

### 9.1 Nine Tabs (LeanIX Style)

| Tab | Content |
|-----|---------|
| **Overview** | Base info, description, owner, status, lifecycle, tags |
| **Relations** | Incoming/outgoing relations explorer |
| **IT Components** | Associated IT infrastructure |
| **Subscriptions** | Licensing and subscription info |
| **Comments** | User comments and notes |
| **To-dos** | Action items and tasks |
| **Resources** | Documents, links, diagrams |
| **Metrics** | Performance and usage metrics |
| **Surveys** | Survey responses and assessments |

### 9.2 Fact Sheet Data Structure

```typescript
export interface FactSheetData {
  baseInfo: FactSheetBaseInfo;
  relations: {
    incoming: Relation[];
    outgoing: Relation[];
  };
  itComponents: ITComponent[];
  subscriptions: Subscription[];
  comments: Comment[];
  todos: TodoItem[];
  resources: Resource[];
  metrics: Metric[];
  surveys: SurveyResponse[];
  lastUpdate: Date;
}
```

---

## 10. Service Principal Classification

### 10.1 Problem

Service principals inflate the "Applications" bucket, making the visualization cluttered.

### 10.2 Solution

Classify service principals by function:

```typescript
// In typeMapping
'azurediscovery_serviceprincipals': {
  type: 'it-component',  // Not 'application'
  getName: (r) => r.DisplayName || r.AppId || r.Name,
  priority: 3,
  category: 'Service Principal'
},
'entraidserviceprincipals': {
  type: 'it-component',  // Not 'application'
  getName: (r) => r.DisplayName || r.AppId || r.Name,
  priority: 3,
  category: 'Service Principal'
}
```

### 10.3 Classification Patterns

| Pattern | Classification |
|---------|----------------|
| Microsoft Graph, Azure AD | Platform (system) |
| Backup, Monitoring agents | IT Component (infrastructure) |
| Custom LOB apps | Application (visible) |
| Integration connectors | Provider/Consumer Interface |
| Unclassified | IT Component (default) |

---

## 11. API Reference

### 11.1 Main Hook

```typescript
export const useOrganisationMapLogic = (): UseOrganisationMapLogicReturn => {
  return {
    data: OrganisationMapData | null,
    loading: boolean,
    error: string | null,
    stats: {
      nodeCount: number,
      linkCount: number,
      nodesByType: Record<EntityType, number>,
      linksByType: Record<RelationType, number>,
      avgConfidence: number
    } | null,
    refresh: () => Promise<void>
  };
};
```

### 11.2 Linker Function

```typescript
export function run(ctx: LinkContext): SankeyLink[];
```

### 11.3 Type Mapping Entry

```typescript
interface TypeMapping {
  type: EntityType;
  getName: (record: any) => string | null;
  priority: number;
  category: string;
}
```

---

## 12. File Reference

| File | Purpose |
|------|---------|
| `hooks/useOrganisationMapLogic.ts` | Main logic hook, type mappings, indices |
| `types/models/organisation.ts` | TypeScript type definitions |
| `views/organisation/OrganisationMapView.tsx` | Main view component |
| `views/organisation/linkers/linkTenant.ts` | Tenant hierarchy linker |
| `views/organisation/linkers/linkIdentity.ts` | Identity relations linker |
| `views/organisation/linkers/linkLicensing.ts` | License assignment linker |
| `views/organisation/linkers/linkAzureInfra.ts` | Azure infrastructure linker |
| `views/organisation/linkers/linkApps.ts` | Application dependencies linker |
| `views/organisation/linkers/linkDependencies.ts` | Service dependencies linker |
| `views/organisation/linkers/linkSecurity.ts` | Security policy linker |
| `components/organisms/SankeyDiagram.tsx` | D3 Sankey visualization |
| `components/organisms/TieredExplorer.tsx` | Relation bucket browser |
| `components/organisms/FactSheetModal.tsx` | 9-tab entity details |
| `components/organisms/OrganisationMapFilters.tsx` | Filter controls |
| `components/organisms/DetailPanel.tsx` | Slide-out details |

---

## 13. Future Enhancements

### 13.1 Planned Features

- [ ] Custom linker plugins (user-defined rules)
- [ ] Relationship editing (manual link creation)
- [ ] Export to LeanIX format
- [ ] Time-travel view (historical snapshots)
- [ ] Risk scoring integration
- [ ] Cost aggregation by entity

### 13.2 Performance Improvements

- [ ] Web Worker for index building
- [ ] Incremental link generation
- [ ] Virtual rendering for large datasets
- [ ] IndexedDB caching

---

*End of Technical Specification*
