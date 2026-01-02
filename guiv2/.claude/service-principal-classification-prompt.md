# Service Principal Classification Fix Prompt

## Context
The Organisation Map "Applications" bucket is being polluted by Microsoft built-in service principals and app registrations that should be classified as "IT Components" instead of "Applications".

## Current State
- `azurediscovery_serviceprincipals` → correctly mapped to `it-component`
- `entraidappregistrations` → incorrectly mapped to `application` (needs classification)
- `entraidenterpriseapps` → incorrectly mapped to `application` (needs classification)

## Required Implementation

### Phase 1: Classification Logic
Implement intelligent classification that distinguishes Microsoft first-party apps from true enterprise applications.

#### 1.1 Add Classification Function
```typescript
function isMicrosoftFirstParty(record: any): boolean {
  // Check publisher domain
  const publisherDomain = getRecordProp(record, 'PublisherDomain')?.toLowerCase();
  if (publisherDomain && (
    publisherDomain.includes('microsoft') ||
    publisherDomain.includes('windows') ||
    publisherDomain.includes('office') ||
    publisherDomain === 'microsoft.com'
  )) return true;

  // Check publisher name
  const publisherName = getRecordProp(record, 'PublisherName')?.toLowerCase();
  if (publisherName && (
    publisherName.includes('microsoft') ||
    publisherName.includes('windows') ||
    publisherName.includes('office')
  )) return true;

  // Check app owner organization ID (known Microsoft org IDs)
  const ownerOrgId = getRecordProp(record, 'AppOwnerOrganizationId');
  const knownMicrosoftOrgIds = [
    'f8cdef31-a31e-4b4a-93e4-5f571e91255a', // Microsoft
    // Add other known Microsoft org IDs as discovered
  ];
  if (ownerOrgId && knownMicrosoftOrgIds.includes(ownerOrgId)) return true;

  // Check for built-in Microsoft app patterns
  const displayName = getRecordProp(record, 'DisplayName')?.toLowerCase();
  const appId = getRecordProp(record, 'AppId')?.toLowerCase();

  // Common Microsoft built-in apps
  const microsoftAppPatterns = [
    /^microsoft/i,
    /^windows/i,
    /^office/i,
    /^azure/i,
    /^exchange/i,
    /^sharepoint/i,
    /^teams/i,
    /^onedrive/i,
    /^power/i,
    /^dynamics/i
  ];

  if (displayName && microsoftAppPatterns.some(pattern => pattern.test(displayName))) {
    // Additional check: if it has assignments or grants, it might be a real enterprise app
    const assignedToUsers = getRecordProp(record, 'AssignedToUsers');
    const oauthGrants = getRecordProp(record, 'OauthGrants');
    const hasRealUsage = (assignedToUsers && assignedToUsers > 0) ||
                        (oauthGrants && oauthGrants.length > 0);

    // If no real usage evidence, classify as Microsoft
    if (!hasRealUsage) return true;
  }

  return false;
}
```

#### 1.2 Add Promotion Criteria Function
```typescript
function shouldPromoteToApplication(record: any, isServicePrincipal: boolean): boolean {
  // Must be an Application-type service principal (not just ServicePrincipal)
  if (isServicePrincipal) {
    const spType = getRecordProp(record, 'ServicePrincipalType');
    if (spType !== 'Application') return false;
  }

  // Must NOT be Microsoft first-party
  if (isMicrosoftFirstParty(record)) return false;

  // Must have evidence of real enterprise usage
  const assignedUsers = getRecordProp(record, 'AssignedUsers') || getRecordProp(record, 'UsersAssigned');
  const oauthGrants = getRecordProp(record, 'OauthGrants') || getRecordProp(record, 'Grants');
  const ownerCount = getRecordProp(record, 'OwnerCount') || getRecordProp(record, 'Owners')?.length;
  const vendorName = getRecordProp(record, 'VendorName') || getRecordProp(record, 'PublisherName');

  const hasAssignments = assignedUsers && assignedUsers > 0;
  const hasGrants = oauthGrants && (
    Array.isArray(oauthGrants) ? oauthGrants.length > 0 : oauthGrants > 0
  );
  const hasOwners = ownerCount && ownerCount > 0;
  const hasVendor = vendorName && !isMicrosoftFirstParty({ PublisherName: vendorName });

  // Require at least one strong signal of enterprise usage
  return hasAssignments || hasGrants || hasOwners || hasVendor;
}
```

#### 1.3 Modify Node Creation Logic
Update `createNodeFromRecord` to apply classification overrides:

```typescript
function createNodeFromRecord(
  record: Record<string, string>,
  mapping: typeof typeMapping[string],
  fileTypeKey: string,
  index: number
): SankeyNode | null {
  const name = mapping.getName(record);
  if (!name || name.trim() === '') return null;

  const cleanName = name.trim();
  let finalType = mapping.type;

  // Apply classification overrides for service principals and app registrations
  if (fileTypeKey === 'entraidappregistrations' ||
      fileTypeKey === 'entraidenterpriseapps' ||
      fileTypeKey === 'azurediscovery_serviceprincipals') {

    const isSP = fileTypeKey.includes('serviceprincipal');
    const shouldPromote = shouldPromoteToApplication(record, isSP);

    if (!shouldPromote) {
      finalType = 'it-component';
    }
    // If shouldPromote is true, keep as 'application'
  }

  // Create stable ID based on final type
  const uniqueId = `${finalType}-${cleanName.replace(/[^a-zA-Z0-9]/g, '_')}-${fileTypeKey}`;

  return {
    id: uniqueId,
    name: cleanName,
    type: finalType,
    factSheet: createFactSheet(record, finalType, mapping.category),
    metadata: {
      source: fileTypeKey,
      record,
      originalType: mapping.type, // Track original mapping
      finalType, // Track final classification
      classificationReason: finalType !== mapping.type ? 'classification-override' : 'default-mapping',
      priority: mapping.priority,
      category: mapping.category
    }
  };
}
```

#### 1.4 Update FactSheet to Show Classification Info
Modify `createFactSheet` to include classification metadata:

```typescript
function createFactSheet(
  record: Record<string, string>,
  type: EntityType,
  category: string
): FactSheetData {
  // ... existing code ...

  // Add classification tags
  const tags: string[] = [];
  if (record.Tags) {
    tags.push(...record.Tags.split(/[;,]/).map(t => t.trim()).filter(Boolean));
  }
  if (category) {
    tags.push(category);
  }

  // Add classification metadata
  const isSP = record.ServicePrincipalType || record.servicePrincipalType;
  const publisher = record.PublisherDomain || record.PublisherName;
  if (isSP) {
    tags.push('service-principal');
    if (publisher) {
      tags.push(`publisher:${publisher.toLowerCase()}`);
    }
  }

  return {
    baseInfo: {
      name: record.Name || record.DisplayName || record.ApplicationName || 'Unknown',
      type,
      description,
      owner,
      status,
      tags
    },
    relations: { incoming: [], outgoing: [] },
    itComponents: [],
    subscriptions: [],
    comments: [],
    todos: [],
    resources: [],
    metrics: [],
    surveys: [],
    lastUpdate: new Date(record.LastModified || record.CreatedDateTime || record.ModifiedDateTime || Date.now())
  };
}
```

### Phase 2: Testing and Validation

#### 2.1 Add Classification Tests
```typescript
describe('Service Principal Classification', () => {
  test('Microsoft Graph API should be classified as it-component', () => {
    const record = {
      DisplayName: 'Microsoft Graph',
      PublisherDomain: 'microsoft.com',
      ServicePrincipalType: 'Application'
    };
    expect(isMicrosoftFirstParty(record)).toBe(true);
    expect(shouldPromoteToApplication(record, true)).toBe(false);
  });

  test('Custom enterprise app should be promoted to application', () => {
    const record = {
      DisplayName: 'My Custom App',
      PublisherDomain: 'contoso.com',
      ServicePrincipalType: 'Application',
      AssignedUsers: 5,
      OauthGrants: ['grant1', 'grant2']
    };
    expect(isMicrosoftFirstParty(record)).toBe(false);
    expect(shouldPromoteToApplication(record, true)).toBe(true);
  });

  test('Microsoft app with enterprise usage should still be it-component', () => {
    const record = {
      DisplayName: 'Office 365',
      PublisherDomain: 'microsoft.com',
      ServicePrincipalType: 'Application',
      AssignedUsers: 1000 // Even with usage, it's still Microsoft
    };
    expect(isMicrosoftFirstParty(record)).toBe(true);
    expect(shouldPromoteToApplication(record, true)).toBe(false);
  });
});
```

#### 2.2 Add Dev Reporting
Add classification statistics to the dev console:

```typescript
// In useOrganisationMapLogic.ts
console.log('[Classification Report]', {
  totalNodes: finalData.nodes.length,
  applications: finalData.nodes.filter(n => n.type === 'application').length,
  itComponents: finalData.nodes.filter(n => n.type === 'it-component').length,
  servicePrincipals: finalData.nodes.filter(n =>
    n.metadata?.classificationReason === 'classification-override' &&
    n.metadata?.originalType === 'application' &&
    n.type === 'it-component'
  ).length,
  promotedApps: finalData.nodes.filter(n =>
    n.metadata?.classificationReason === 'classification-override' &&
    n.metadata?.originalType !== 'application' &&
    n.type === 'application'
  ).length
});
```

### Phase 3: Implementation Deliverables

1. **Classification functions** in `useOrganisationMapLogic.ts`
2. **Updated node creation logic** with classification overrides
3. **Enhanced metadata tracking** for original vs final types
4. **Unit tests** for classification logic
5. **Dev reporting** for classification statistics
6. **Fact sheet updates** to show classification info

### Expected Outcome

- **Applications bucket** should contain only true enterprise/custom applications
- **IT Components bucket** should contain Microsoft service principals and infrastructure components
- **Clear classification metadata** showing why each entity was classified as it was
- **Testable classification logic** that can be maintained and extended

This implementation ensures that the "257 Applications" problem becomes "25 Real Applications + 232 IT Components" where the IT Components bucket properly contains the Microsoft infrastructure that shouldn't clutter the enterprise applications view.