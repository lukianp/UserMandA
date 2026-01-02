/**
 * Application Relations Linker
 *
 * Generates relations for application ownership and business alignment:
 * - company → application (ownership)
 * - application → line-of-business (realizes) via BU/LOB fields
 * - application → business-unit-location via region/location
 * - application → it-component (provides/consumes)
 */

import { SankeyNode, SankeyLink, RelationType, MatchRule, LinkEvidence, EntityType } from '../../../types/models/organisation';

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

export interface LinkContext {
  nodes: SankeyNode[];
  indices: NodeIndices;
  nodesBySource: Record<string, SankeyNode[]>;
  recordsByFileTypeKey: Record<string, any[]>;
}

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

/**
 * Generate application relations
 */
export function run(ctx: LinkContext): SankeyLink[] {
  const links: SankeyLink[] = [];
  const { indices } = ctx;

  console.log('[linkApps] Linking applications to business structure...', {
    companies: indices.byType.get('company')?.length || 0,
    applications: indices.byType.get('application')?.length || 0,
    linesOfBusiness: indices.byType.get('line-of-business')?.length || 0,
    locations: indices.byType.get('business-unit-location')?.length || 0,
    itComponents: indices.byType.get('it-component')?.length || 0
  });

  const companies = indices.byType.get('company') || [];
  const applications = indices.byType.get('application') || [];
  const linesOfBusiness = indices.byType.get('line-of-business') || [];
  const locations = indices.byType.get('business-unit-location') || [];
  const itComponents = indices.byType.get('it-component') || [];

  // Build LOB index by name (case-insensitive)
  const lobIndex = new Map<string, SankeyNode>();
  for (const lob of linesOfBusiness) {
    lobIndex.set(lob.name.toLowerCase(), lob);
    const record = lob.metadata.record;
    if (record.BusinessUnit) lobIndex.set(record.BusinessUnit.toLowerCase(), lob);
    if (record.Division) lobIndex.set(record.Division.toLowerCase(), lob);
    if (record.Department) lobIndex.set(record.Department.toLowerCase(), lob);
  }

  // Build location index by name (case-insensitive)
  const locationIndex = new Map<string, SankeyNode>();
  for (const loc of locations) {
    locationIndex.set(loc.name.toLowerCase(), loc);
    const record = loc.metadata.record;
    if (record.Office) locationIndex.set(record.Office.toLowerCase(), loc);
    if (record.City) locationIndex.set(record.City.toLowerCase(), loc);
    if (record.Site) locationIndex.set(record.Site.toLowerCase(), loc);
  }

  // 1. Company → Application (ownership)
  for (const company of companies) {
    for (const app of applications) {
      addLink(links, company.id, app.id, 'ownership', 80, 'HIGH', [{
        file: 'app-ownership',
        fields: ['company', 'application'],
        sourceValue: company.name,
        targetValue: app.name
      }]);
    }
  }

  // 2. Application → Line of Business (realizes) via BU/LOB/Department fields
  for (const app of applications) {
    const record = app.metadata.record;
    const buFields = [
      record.BusinessUnit,
      record.LOB,
      record.LineOfBusiness,
      record.Division,
      record.Department,
      record.Owner // Sometimes owner indicates the business unit
    ].filter(Boolean);

    for (const buValue of buFields) {
      const lobNode = lobIndex.get(buValue.toLowerCase());
      if (lobNode && lobNode.id !== app.id) {
        addLink(links, app.id, lobNode.id, 'realizes', 75, 'MEDIUM', [{
          file: app.metadata.source,
          fields: ['BusinessUnit', 'LOB', 'Division', 'Department'],
          sourceValue: app.name,
          targetValue: buValue
        }]);
        break; // Only link to first matching LOB
      }
    }
  }

  // 3. Application → Business Unit Location via region/location fields
  for (const app of applications) {
    const record = app.metadata.record;
    const locationFields = [
      record.Office,
      record.Site,
      record.City,
      record.BusinessLocation
    ].filter(Boolean);

    for (const locValue of locationFields) {
      const locNode = locationIndex.get(locValue.toLowerCase());
      if (locNode && locNode.id !== app.id) {
        addLink(links, app.id, locNode.id, 'deployment', 70, 'MEDIUM', [{
          file: app.metadata.source,
          fields: ['Office', 'Site', 'City', 'BusinessLocation'],
          sourceValue: app.name,
          targetValue: locValue
        }]);
        break; // Only link to first matching location
      }
    }
  }

  // 4. Application → IT Component (provides) via database/service references
  const dbComponents = itComponents.filter(c =>
    c.metadata.source?.includes('database') ||
    c.metadata.source?.includes('sql') ||
    c.metadata.category?.toLowerCase().includes('database')
  );

  // Build database index
  const dbIndex = new Map<string, SankeyNode>();
  for (const db of dbComponents) {
    dbIndex.set(db.name.toLowerCase(), db);
    const record = db.metadata.record;
    if (record.DatabaseName) dbIndex.set(record.DatabaseName.toLowerCase(), db);
    if (record.ServerName) dbIndex.set(record.ServerName.toLowerCase(), db);
  }

  for (const app of applications) {
    const record = app.metadata.record;
    const dbRefs = [
      record.DatabaseName,
      record.Database,
      record.DataSource
    ].filter(Boolean);

    for (const dbRef of dbRefs) {
      const dbNode = dbIndex.get(dbRef.toLowerCase());
      if (dbNode && dbNode.id !== app.id) {
        addLink(links, dbNode.id, app.id, 'provides', 80, 'HIGH', [{
          file: app.metadata.source,
          fields: ['DatabaseName', 'Database', 'DataSource'],
          sourceValue: dbRef,
          targetValue: app.name
        }]);
      }
    }
  }

  // 5. Service Principal → Application (IT component to application link)
  const servicePrincipals = itComponents.filter(c =>
    c.metadata.category === 'Service Principal' ||
    c.metadata.source?.includes('serviceprincipal')
  );

  for (const sp of servicePrincipals) {
    const record = sp.metadata.record;
    const appId = record.AppId?.toLowerCase();

    if (appId) {
      const appNode = indices.byAppId.get(appId);
      if (appNode && appNode.id !== sp.id) {
        addLink(links, sp.id, appNode.id, 'provides', 95, 'EXACT', [{
          file: sp.metadata.source,
          fields: ['AppId'],
          sourceValue: appId,
          targetValue: appNode.name
        }]);
      }
    }
  }

  // 6. IT Component → Application via RequiredResourceAppIds (API dependencies)
  // When an Application requires an API (e.g., Microsoft Graph), link the IT Component
  // (Service Principal) that provides that API to the Application that consumes it
  const spByAppId = new Map<string, SankeyNode>();
  for (const sp of servicePrincipals) {
    const record = sp.metadata.record;
    const appId = record.AppId?.toLowerCase();
    if (appId) {
      spByAppId.set(appId, sp);
    }
  }

  for (const app of applications) {
    const record = app.metadata.record;
    const requiredApiAppIds = record.RequiredResourceAppIds;

    if (requiredApiAppIds && requiredApiAppIds.trim() !== '') {
      const apiAppIds = requiredApiAppIds.split(';').filter((id: string) => id.trim() !== '');

      for (const apiAppId of apiAppIds) {
        const normalizedApiAppId = apiAppId.toLowerCase().trim();
        const spNode = spByAppId.get(normalizedApiAppId);

        if (spNode && spNode.id !== app.id) {
          addLink(links, spNode.id, app.id, 'provides', 85, 'HIGH', [{
            file: app.metadata.source,
            fields: ['RequiredResourceAppIds'],
            sourceValue: spNode.name,
            targetValue: app.name
          }]);
        }
      }
    }
  }

  console.log(`[linkApps] Generated ${links.length} application links`);
  return links;
}
