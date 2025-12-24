# Consolidated Inventory Brainstorm

## Problem Statement
The discovery process generates multiple CSV files from different sources (Entra ID, Active Directory, Exchange, Azure, etc.). Each source has its own view of Users, Groups, and Applications. We need to **consolidate** these multiple records into **single canonical entities** with full traceability back to the source data.

## Current State
- ✅ Views exist for: Users, Groups, Applications, Infrastructure
- ✅ Basic `InventoryService` framework exists
- ⚠️ **NO consolidation logic implemented yet** - views are empty
- ⚠️ **NO matching/merging strategy defined**

## Goal
Create a **single source of truth** for each entity type by:
1. **Matching** records across different discovery sources
2. **Merging** attributes from multiple sources
3. **Preserving evidence** of where each piece of data came from
4. **Building relationships** between consolidated entities

---

## 1. CONSOLIDATED USERS

### Data Sources to Join

Based on available CSV files:

1. **AzureDiscovery_Users.csv** (Entra ID / Azure AD)
   - Primary identity source for cloud-first orgs
   - Fields: `userPrincipalName`, `objectId`, `displayName`, `mail`, `jobTitle`, `department`, `accountEnabled`

2. **GraphUsers.csv** (Microsoft Graph API)
   - Similar to AzureDiscovery but via Graph API
   - May have additional fields or fresher data

3. **ExchangeMailboxes.csv** (Exchange Online/On-Prem)
   - Mailbox-specific attributes
   - Fields: `PrimarySmtpAddress`, `UserPrincipalName`, `MailboxType`, `RecipientTypeDetails`

4. **Active Directory Users** (if on-prem sync)
   - Would come from `ActiveDirectoryUsers.csv` (if exists)
   - Fields: `sAMAccountName`, `distinguishedName`, `userPrincipalName`, `objectGUID`, `objectSID`

5. **Authentication Methods** (AuthenticationMethods.csv)
   - MFA status, auth methods registered
   - Fields: `UserPrincipalName`, `MFAState`, `Methods`

6. **License Information** (from various sources)
   - User licenses, SKUs assigned
   - From Office 365 discovery outputs

### Matching Strategy (How to identify same user across sources)

**Primary Keys for Matching:**
1. **userPrincipalName** (most reliable cross-cloud identifier)
2. **objectId** (Azure AD object ID - unique in tenant)
3. **mail** / **PrimarySmtpAddress** (email address)
4. **objectSID** (for AD-synced users)

**Matching Rules:**
```
IF record1.userPrincipalName == record2.userPrincipalName THEN MATCH
ELSE IF record1.objectId == record2.objectId THEN MATCH
ELSE IF record1.mail == record2.PrimarySmtpAddress THEN MATCH
ELSE IF record1.objectSID == record2.objectSID THEN MATCH
ELSE NO MATCH (create separate entities)
```

### Consolidation Logic

**For each discovered user record:**

1. **Calculate match key** (normalize UPN/email to lowercase)
2. **Search existing consolidated users** for match
3. **If match found:**
   - Merge attributes (keep most complete/recent data)
   - Add evidence record linking to source CSV + row
   - Update `lastSeen` timestamp
4. **If no match:**
   - Create new consolidated user entity
   - Add initial evidence record

**Attribute Merge Strategy:**

| Attribute | Strategy | Rationale |
|-----------|----------|-----------|
| `displayName` | Prefer Entra ID | Most authoritative |
| `mail` | Prefer Exchange | Exchange is email authority |
| `jobTitle` | Prefer Entra ID | HR system sync |
| `department` | Prefer Entra ID | HR system sync |
| `accountEnabled` | Latest timestamp | Status can change |
| `mfaEnabled` | From AuthenticationMethods | Specific source |
| `licenses` | Union all | User may have multiple |
| `mailboxSize` | From Exchange | Specific source |

### Evidence Structure

Each consolidated user should track:
```typescript
{
  inventoryEntityId: "user-12345",
  sourceType: "CSV_DISCOVERY",
  sourceIdentifier: "AzureDiscovery_Users.csv:row-42",
  discoveredAt: "2025-12-23T10:00:00Z",
  attributes: {
    userPrincipalName: "john.doe@company.com",
    displayName: "John Doe",
    mail: "john.doe@company.com",
    objectId: "abc-123-def-456"
  }
}
```

**Multiple evidence records per user** = traceability to every source

### Example Consolidation Scenario

**Input Data:**

AzureDiscovery_Users.csv:
```
userPrincipalName,objectId,displayName,mail,department
john.doe@company.com,aaa-111,John Doe,john.doe@company.com,Engineering
```

ExchangeMailboxes.csv:
```
UserPrincipalName,PrimarySmtpAddress,MailboxType,TotalItemSize
john.doe@company.com,john.doe@company.com,UserMailbox,5GB
```

AuthenticationMethods.csv:
```
UserPrincipalName,MFAState,Methods
john.doe@company.com,Enabled,"PhoneApp,SMS"
```

**Consolidated Output:**

```json
{
  "id": "user-12345",
  "entityType": "USER",
  "displayName": "John Doe",
  "externalIds": {
    "userPrincipalName": "john.doe@company.com",
    "objectId": "aaa-111",
    "primarySmtpAddress": "john.doe@company.com"
  },
  "attributes": {
    "department": "Engineering",
    "mailboxType": "UserMailbox",
    "mailboxSize": "5GB",
    "mfaEnabled": true,
    "mfaMethods": ["PhoneApp", "SMS"]
  },
  "evidenceCount": 3,
  "status": "DISCOVERED"
}
```

**Evidence Records:**
1. Source: AzureDiscovery_Users.csv:row-1
2. Source: ExchangeMailboxes.csv:row-1
3. Source: AuthenticationMethods.csv:row-1

---

## 2. CONSOLIDATED GROUPS

### Data Sources to Join

1. **AzureDiscovery_Groups.csv** (Entra ID Groups)
   - Security groups, Microsoft 365 groups
   - Fields: `objectId`, `displayName`, `mailEnabled`, `securityEnabled`, `groupTypes`

2. **GraphGroups.csv** (Microsoft Graph API)
   - Similar to AzureDiscovery
   - May include dynamic membership rules

3. **ExchangeDistributionGroups.csv** (Exchange Distribution Lists)
   - Email-enabled groups
   - Fields: `PrimarySmtpAddress`, `DisplayName`, `GroupType`, `MemberCount`

4. **Active Directory Groups** (if on-prem)
   - Would come from `ActiveDirectoryGroups.csv`
   - Fields: `sAMAccountName`, `distinguishedName`, `objectGUID`, `objectSID`, `groupScope`

5. **AzureResourceDiscovery_ResourceGroups.csv** (Azure Resource Groups)
   - **NOT the same as security groups!**
   - These are infrastructure organizational units
   - Should probably be in INFRASTRUCTURE category, not here

6. **AzureDiscovery_MicrosoftTeams.csv** (Teams)
   - Each Team is backed by an M365 Group
   - Can link Team ↔ Group via objectId

### Matching Strategy

**Primary Keys:**
1. **objectId** (Azure AD Group ID)
2. **mail** / **PrimarySmtpAddress** (for email-enabled groups)
3. **objectSID** (for AD-synced groups)

**Matching Rules:**
```
IF record1.objectId == record2.objectId THEN MATCH
ELSE IF record1.mail == record2.PrimarySmtpAddress THEN MATCH
ELSE IF record1.objectSID == record2.objectSID THEN MATCH
ELSE IF fuzzy_match(record1.displayName, record2.displayName) > 0.95 THEN POSSIBLE_MATCH (flag for review)
ELSE NO MATCH
```

### Consolidation Logic

**Group Types to Handle:**
- Security Groups (Entra ID)
- Microsoft 365 Groups (Entra ID + Exchange)
- Distribution Lists (Exchange)
- Dynamic Groups (Entra ID)
- Teams-backed Groups (special M365 groups)
- Active Directory Groups (on-prem synced)

**Attribute Merge Strategy:**

| Attribute | Strategy | Rationale |
|-----------|----------|-----------|
| `displayName` | Prefer Entra ID | Authoritative |
| `mail` | Prefer Exchange | Email authority |
| `memberCount` | Sum (with dedup) | May differ across sources |
| `groupType` | Union | Group can be security + mail-enabled |
| `isTeamBacked` | From Teams discovery | Specific source |
| `dynamicMembershipRule` | From Entra ID | Specific to Entra |

### Relations to Build

From consolidated groups:
- **GROUP_MEMBER** → USER (extract from membership CSVs)
- **GROUP_MEMBER** → GROUP (nested groups)
- **GROUP_OWNER** → USER (group owners)
- **TEAM_BACKED_BY** → GROUP (Teams to Groups)

### Example Consolidation Scenario

**Input:**

AzureDiscovery_Groups.csv:
```
objectId,displayName,mailEnabled,securityEnabled,groupTypes
bbb-222,Engineering Team,true,true,"Unified"
```

ExchangeDistributionGroups.csv:
```
PrimarySmtpAddress,DisplayName,GroupType,MemberCount
engineering@company.com,Engineering Team,Distribution,25
```

AzureDiscovery_MicrosoftTeams.csv:
```
teamId,displayName,groupId,memberCount
team-999,Engineering Team,bbb-222,25
```

**Consolidated Output:**

```json
{
  "id": "group-67890",
  "entityType": "GROUP",
  "displayName": "Engineering Team",
  "externalIds": {
    "objectId": "bbb-222",
    "primarySmtpAddress": "engineering@company.com",
    "teamId": "team-999"
  },
  "attributes": {
    "mailEnabled": true,
    "securityEnabled": true,
    "groupTypes": ["Unified"],
    "memberCount": 25,
    "isTeamBacked": true
  },
  "evidenceCount": 3,
  "status": "DISCOVERED"
}
```

---

## 3. CONSOLIDATED APPLICATIONS

### Data Sources to Join

1. **ApplicationCatalog.csv** (Custom application inventory)
   - Manually curated or script-discovered apps
   - Fields: `ApplicationName`, `Version`, `Publisher`, `InstallPath`

2. **AzureDiscovery_Applications.csv** (Entra ID App Registrations)
   - Cloud app registrations
   - Fields: `appId`, `displayName`, `publisherDomain`, `signInAudience`

3. **AzureDiscovery_ServicePrincipals.csv** (Enterprise Apps)
   - Service principals in tenant
   - Fields: `objectId`, `appId`, `displayName`, `servicePrincipalType`

4. **EntraIDAppRegistrations.csv** (App registrations detailed)
   - More detailed app reg data
   - May overlap with AzureDiscovery_Applications

5. **EntraIDEnterpriseApps.csv** (Enterprise apps)
   - May overlap with ServicePrincipals

6. **EntraIDApplicationSecrets.csv** (App secrets/credentials)
   - Secret expiry, key vault refs
   - Fields: `appId`, `keyId`, `endDateTime`

7. **AzureResourceDiscovery_WebApps.csv** (Azure Web Apps/App Services)
   - Hosted web applications
   - Fields: `name`, `resourceGroup`, `location`, `kind`, `state`

### Matching Strategy

**This is COMPLEX** because "application" means different things:

1. **Entra ID App Registration** = OAuth2/OIDC identity provider definition
2. **Enterprise Application** = Service principal (instance of an app in tenant)
3. **Azure Web App** = Hosting infrastructure (PaaS)
4. **Application Catalog Entry** = Business application (e.g., "Salesforce", "SAP")

**Matching Approach:**

**Type 1: Cloud Identity Apps (App Regs + Enterprise Apps)**
```
Match by appId (App Registration ↔ Service Principal)
```

**Type 2: Azure Hosted Apps (Web Apps)**
```
Match by azure resource ID
May RELATE to App Registration (via managed identity or app settings)
```

**Type 3: Business Applications (Catalog)**
```
Fuzzy name matching + manual confirmation
E.g., "Salesforce" in catalog might link to "Salesforce.com" enterprise app
```

### Consolidation Logic

**Strategy A: Keep Separate Entity Types**
- `APPLICATION_IDENTITY` (App Regs + Service Principals)
- `APPLICATION_INFRASTRUCTURE` (Web Apps, Function Apps)
- `APPLICATION_BUSINESS` (Catalog entries, SaaS apps)
- Build **RELATES_TO** relationships between them

**Strategy B: Single Consolidated Application**
- Harder to implement
- Would need complex type field: "identity", "infrastructure", "business"

**Recommendation: Strategy A** (separate but related)

### Relations to Build

- **APP_REG_HAS_PRINCIPAL** → Enterprise App
- **APP_HOSTED_ON** → Web App
- **APP_USES_SECRET** → Application Secret
- **APP_ACCESSED_BY** → USER (from sign-in logs)
- **APP_OWNED_BY** → USER (app owner)

### Example Consolidation Scenario

**Input:**

ApplicationCatalog.csv:
```
ApplicationName,Vendor,Category,BusinessOwner
Customer Portal,Acme Corp,Web Application,jane.doe@company.com
```

AzureDiscovery_Applications.csv:
```
appId,displayName,publisherDomain,identifierUris
app-aaa-111,Customer Portal API,company.com,"https://api.company.com"
```

AzureDiscovery_ServicePrincipals.csv:
```
objectId,appId,displayName,servicePrincipalType
sp-bbb-222,app-aaa-111,Customer Portal API,Application
```

AzureResourceDiscovery_WebApps.csv:
```
name,resourceGroup,location,kind,httpsOnly
customer-portal-app,prod-apps,eastus,app,true
```

**Consolidated Output (Strategy A - Separate Entities):**

**Application Identity:**
```json
{
  "id": "app-identity-12345",
  "entityType": "APPLICATION_IDENTITY",
  "displayName": "Customer Portal API",
  "externalIds": {
    "appId": "app-aaa-111",
    "servicePrincipalObjectId": "sp-bbb-222"
  },
  "evidenceCount": 2
}
```

**Application Infrastructure:**
```json
{
  "id": "app-infra-67890",
  "entityType": "APPLICATION_INFRASTRUCTURE",
  "displayName": "customer-portal-app",
  "externalIds": {
    "azureResourceId": "/subscriptions/.../customer-portal-app"
  },
  "evidenceCount": 1
}
```

**Application Business:**
```json
{
  "id": "app-business-99999",
  "entityType": "APPLICATION_BUSINESS",
  "displayName": "Customer Portal",
  "attributes": {
    "vendor": "Acme Corp",
    "category": "Web Application",
    "businessOwner": "jane.doe@company.com"
  },
  "evidenceCount": 1
}
```

**Relations:**
- app-business-99999 **USES_IDENTITY** → app-identity-12345
- app-business-99999 **HOSTED_ON** → app-infra-67890

---

## 4. IMPLEMENTATION PLAN

### Phase 1: USER Consolidation (Start Here)
1. Implement matching logic for Users
2. Build consolidation pipeline:
   - Read AzureDiscovery_Users.csv
   - Read GraphUsers.csv
   - Read ExchangeMailboxes.csv
   - Match + merge + create evidence
3. Test with real data
4. Display in ConsolidatedUsersView

### Phase 2: GROUP Consolidation
1. Implement matching logic for Groups
2. Build consolidation pipeline
3. Handle nested groups
4. Link Teams ↔ Groups
5. Display in ConsolidatedGroupsView

### Phase 3: APPLICATION Consolidation
1. Decide on entity type strategy (A or B)
2. Implement App Identity consolidation
3. Implement App Infrastructure consolidation
4. Build relationships between them
5. Display in ConsolidatedApplicationsView

### Phase 4: Relations Building
1. Extract membership data (User ↔ Group)
2. Extract ownership data
3. Extract app access data (sign-in logs)
4. Build bidirectional relation index

### Phase 5: UI Enhancements
1. Add fact sheet panel (detailed entity view)
2. Add evidence drill-down (show all source records)
3. Add conflict resolution UI (when attributes differ)
4. Add manual merge/split tools

---

## 5. TECHNICAL CONSIDERATIONS

### Matching Confidence Levels
- **EXACT** (100%): Same objectId or UPN
- **HIGH** (90%+): Same email, different casing
- **MEDIUM** (70-89%): Fuzzy name match + same domain
- **LOW** (<70%): Flag for manual review

### Handling Conflicts
When same user has different `displayName` across sources:
- **Option 1:** Pick most authoritative source (Entra ID wins)
- **Option 2:** Store all variants and flag conflict
- **Option 3:** Most recent timestamp wins

**Recommendation:** Option 1 with conflict logging

### Performance
- Use in-memory index for matching (Map<matchKey, entityId>)
- Batch processing (process 1000 records at a time)
- Incremental updates (only process changed CSVs)

### Data Quality
- Log match quality metrics
- Flag low-confidence matches for review
- Track orphaned records (in source but not matched)
- Track ghosts (deleted from source but still in inventory)

---

## 6. OPEN QUESTIONS

1. **Should we auto-merge or require confirmation for medium-confidence matches?**
   - Recommendation: Auto-merge HIGH+, flag MEDIUM for review

2. **How to handle deleted entities?**
   - Keep in inventory with status "DELETED"
   - Or: Remove from inventory but keep evidence history

3. **Should we sync back to sources?**
   - No - inventory is read-only view of sources
   - Changes happen in source systems

4. **What about on-premises AD users?**
   - Need AD discovery CSV files
   - Match via objectSID or synced attributes

5. **How to handle contractors/guests?**
   - Same consolidation logic
   - Add attribute: userType = "Guest" | "Member" | "External"

---

## 7. SUCCESS CRITERIA

✅ **User Consolidation Success:**
- Single view of each user across Entra ID + Exchange + Graph
- Evidence traceability to every source CSV
- Accurate match rate >95%

✅ **Group Consolidation Success:**
- Single view of each group across sources
- Correct Teams ↔ Group linkage
- Membership relationships built

✅ **Application Consolidation Success:**
- Clear separation of identity/infrastructure/business apps
- Relationships between app facets
- Owner and access linkage

✅ **Overall Success:**
- ConsolidatedUsersView shows real data
- ConsolidatedGroupsView shows real data
- ConsolidatedApplicationsView shows real data
- Evidence drill-down works
- Fact sheets display consolidated attributes

---

## NEXT STEPS

1. **Review this document** - validate assumptions
2. **Choose Phase 1 approach** - Users first
3. **Implement matching logic** - start with exact UPN matches
4. **Test with sample data** - use ljpops profile CSVs
5. **Iterate and expand** - add more sources, refine matching

**Start small, validate, expand!**
