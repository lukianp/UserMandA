import { CanonicalUserRef, CanonicalDeviceRef, LicenseAssignment, LicensingProduct, LicenseConsumption, LicensingHubState } from '../../../../shared/types/licensing';

export interface DiscoveryFileInfo {
  module: string;
  filePath: string;
  kind: 'user' | 'device' | 'license' | 'consumption' | 'unknown';
}

/**
 * Detects available discovery files in the Raw data directory
 */
export async function detectDiscoveryFiles(basePath: string): Promise<DiscoveryFileInfo[]> {
  const files: DiscoveryFileInfo[] = [];

  try {
    // List all CSV files in Raw directory
    const csvFiles = await window.electronAPI.listFiles(`${basePath}\\Raw`, '*.csv');

    for (const file of csvFiles) {
      const filePath = `${basePath}\\Raw\\${file}`;

      // Determine file kind based on filename patterns
      let kind: DiscoveryFileInfo['kind'] = 'unknown';
      let module = 'unknown';

      if (file.includes('AzureADUsers') || file.includes('EntraUsers')) {
        kind = 'user';
        module = 'AzureADUsers';
      } else if (file.includes('ActiveDirectoryUsers')) {
        kind = 'user';
        module = 'ActiveDirectoryUsers';
      } else if (file.includes('AzureDevice') || file.includes('IntuneDevice')) {
        kind = 'device';
        module = 'AzureDevice';
      } else if (file.includes('LicensingDiscovery_UserAssignments')) {
        kind = 'license';
        module = 'LicensingDiscovery';
      } else if (file.includes('LicensingDiscovery_Licenses')) {
        kind = 'license';
        module = 'LicensingDiscovery';
      } else if (file.includes('ExchangeMailbox')) {
        kind = 'consumption';
        module = 'ExchangeDiscovery';
      } else if (file.includes('SharePointSite') || file.includes('OneDriveUsage')) {
        kind = 'consumption';
        module = 'SharePointDiscovery';
      } else if (file.includes('PowerBIWorkspace') || file.includes('PowerBIUsage')) {
        kind = 'consumption';
        module = 'PowerBIDiscovery';
      } else if (file.includes('TeamsUsage')) {
        kind = 'consumption';
        module = 'TeamsDiscovery';
      } else if (file.includes('ApplicationDiscovery')) {
        kind = 'consumption';
        module = 'ApplicationDiscovery';
      }

      if (kind !== 'unknown') {
        files.push({ module, filePath, kind });
      }
    }
  } catch (error) {
    console.warn('Failed to detect discovery files:', error);
  }

  return files;
}

/**
 * Ingests Entra/Azure AD users from discovery CSV
 */
export async function ingestEntraUsers(filePath: string): Promise<CanonicalUserRef[]> {
  try {
    const csvText = await window.electronAPI.fs.readFile(filePath, 'utf8');
    const users: CanonicalUserRef[] = [];

    // Parse CSV (simple implementation - could use papaparse)
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return users;

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const userIdIndex = headers.indexOf('Id') !== -1 ? headers.indexOf('Id') :
                       headers.indexOf('ObjectId') !== -1 ? headers.indexOf('ObjectId') : -1;
    const displayNameIndex = headers.findIndex(h => h.toLowerCase().includes('displayname'));
    const upnIndex = headers.findIndex(h => h.toLowerCase().includes('userprincipalname'));
    const samIndex = headers.findIndex(h => h.toLowerCase().includes('samaccountname'));

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length > userIdIndex && userIdIndex !== -1) {
        const userId = values[userIdIndex];
        if (userId) {
          users.push({
            userId,
            displayName: displayNameIndex !== -1 ? values[displayNameIndex] : undefined,
            upn: upnIndex !== -1 ? values[upnIndex] : undefined,
            samAccountName: samIndex !== -1 ? values[samIndex] : undefined,
            source: 'Entra'
          });
        }
      }
    }

    return users;
  } catch (error) {
    console.error('Failed to ingest Entra users:', error);
    return [];
  }
}

/**
 * Ingests M365 license assignments from discovery CSV
 */
export async function ingestM365Assignments(filePath: string): Promise<{
  assignments: LicenseAssignment[];
  products: LicensingProduct[];
}> {
  try {
    const csvText = await window.electronAPI.fs.readFile(filePath, 'utf8');
    const assignments: LicenseAssignment[] = [];
    const productMap = new Map<string, LicensingProduct>();

    // Parse CSV
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return { assignments, products: [] };

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const userIdIndex = headers.findIndex(h => h.toLowerCase().includes('userid'));
    const skuIdIndex = headers.findIndex(h => h.toLowerCase().includes('skuid'));
    const skuPartNumberIndex = headers.findIndex(h => h.toLowerCase().includes('skupartnumber'));
    const assignedDateTimeIndex = headers.findIndex(h => h.toLowerCase().includes('assigneddatetime'));
    const assignmentSourceIndex = headers.findIndex(h => h.toLowerCase().includes('assignmentsource'));

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));

      const userId = userIdIndex !== -1 ? values[userIdIndex] : '';
      const skuId = skuIdIndex !== -1 ? values[skuIdIndex] : '';
      const skuPartNumber = skuPartNumberIndex !== -1 ? values[skuPartNumberIndex] : '';
      const assignedDateTime = assignedDateTimeIndex !== -1 ? values[assignedDateTimeIndex] : '';
      const assignmentSource = assignmentSourceIndex !== -1 ? values[assignmentSourceIndex] : 'Direct';

      if (userId && skuId) {
        const assignmentId = `assignment-${userId}-${skuId}-${Date.now()}`;
        const productId = `product-${skuPartNumber || skuId}`;

        assignments.push({
          assignmentId,
          productId,
          assigneeType: 'user',
          assigneeId: userId,
          assignedOn: assignedDateTime || new Date().toISOString(),
          source: 'discovery',
          evidence: [{
            source: 'discovery',
            sourceModule: 'LicensingDiscovery',
            sourceFile: filePath.split('\\').pop() || 'unknown',
            capturedAt: new Date().toISOString()
          }]
        });

        // Create product if not exists
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            productId,
            vendorId: 'microsoft', // Simplified
            name: skuPartNumber || skuId,
            category: 'SaaS',
            normalizedKey: `microsoft-${skuPartNumber || skuId}`.toLowerCase(),
            evidence: [{
              source: 'discovery',
              sourceModule: 'LicensingDiscovery',
              sourceFile: filePath.split('\\').pop() || 'unknown',
              capturedAt: new Date().toISOString()
            }]
          });
        }
      }
    }

    return { assignments, products: Array.from(productMap.values()) };
  } catch (error) {
    console.error('Failed to ingest M365 assignments:', error);
    return { assignments: [], products: [] };
  }
}

/**
 * Ingests Exchange mailboxes as SaaS consumption
 */
export async function ingestExchangeMailboxes(filePath: string): Promise<{
  consumption: LicenseConsumption[];
  products: LicensingProduct[];
}> {
  try {
    const csvText = await window.electronAPI.fs.readFile(filePath, 'utf8');
    const consumption: LicenseConsumption[] = [];
    const products: LicensingProduct[] = [];

    // Create Exchange Online product
    const exchangeProductId = 'product-exchange-online';
    products.push({
      productId: exchangeProductId,
      vendorId: 'microsoft',
      name: 'Exchange Online',
      category: 'SaaS',
      normalizedKey: 'microsoft-exchangeonline',
      evidence: [{
        source: 'discovery',
        sourceModule: 'ExchangeDiscovery',
        sourceFile: filePath.split('\\').pop() || 'unknown',
        capturedAt: new Date().toISOString()
      }]
    });

    // Parse CSV to count mailboxes
    const lines = csvText.split('\n').filter(line => line.trim());
    const mailboxCount = Math.max(0, lines.length - 1); // Subtract header row

    if (mailboxCount > 0) {
      consumption.push({
        consumptionId: `consumption-exchange-${Date.now()}`,
        productId: exchangeProductId,
        metric: 'user',
        quantity: mailboxCount,
        measuredAt: new Date().toISOString(),
        source: 'discovery',
        evidence: [{
          source: 'discovery',
          sourceModule: 'ExchangeDiscovery',
          sourceFile: filePath.split('\\').pop() || 'unknown',
          capturedAt: new Date().toISOString()
        }]
      });
    }

    return { consumption, products };
  } catch (error) {
    console.error('Failed to ingest Exchange mailboxes:', error);
    return { consumption: [], products: [] };
  }
}

/**
 * Merges ingested data into the licensing hub state
 */
export function mergeIngestedData(
  state: LicensingHubState,
  users: CanonicalUserRef[],
  devices: CanonicalDeviceRef[],
  assignments: LicenseAssignment[],
  products: LicensingProduct[],
  consumptions: LicenseConsumption[]
): LicensingHubState {
  const updatedState = { ...state };

  // Merge canonical users (avoid duplicates)
  const existingUserIds = new Set(updatedState.canonicalUsers.map(u => u.userId));
  const newUsers = users.filter(u => !existingUserIds.has(u.userId));
  updatedState.canonicalUsers = [...updatedState.canonicalUsers, ...newUsers];

  // Merge canonical devices
  const existingDeviceIds = new Set(updatedState.canonicalDevices.map(d => d.deviceId));
  const newDevices = devices.filter(d => !existingDeviceIds.has(d.deviceId));
  updatedState.canonicalDevices = [...updatedState.canonicalDevices, ...newDevices];

  // Merge products
  const existingProductIds = new Set(updatedState.products.map(p => p.productId));
  const newProducts = products.filter(p => !existingProductIds.has(p.productId));
  updatedState.products = [...updatedState.products, ...newProducts];

  // Merge assignments
  const existingAssignmentIds = new Set(updatedState.assignments.map(a => a.assignmentId));
  const newAssignments = assignments.filter(a => !existingAssignmentIds.has(a.assignmentId));
  updatedState.assignments = [...updatedState.assignments, ...newAssignments];

  // Merge consumptions
  const existingConsumptionIds = new Set(updatedState.consumptions.map(c => c.consumptionId));
  const newConsumptions = consumptions.filter(c => !existingConsumptionIds.has(c.consumptionId));
  updatedState.consumptions = [...updatedState.consumptions, ...newConsumptions];

  // Add Microsoft vendor if not exists
  if (!updatedState.vendors.find(v => v.vendorId === 'microsoft')) {
    updatedState.vendors.push({
      vendorId: 'microsoft',
      name: 'Microsoft',
      website: 'https://www.microsoft.com'
    });
  }

  return updatedState;
}