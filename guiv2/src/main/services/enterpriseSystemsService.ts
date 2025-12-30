/**
 * Enterprise Systems Service
 *
 * Backend service for connecting to and extracting data from enterprise systems:
 * - ServiceNow (ITSM, CMDB)
 * - Jira/Atlassian
 * - Workday (HCM)
 * - LeanIX (Enterprise Architecture)
 *
 * Phase 10: Enterprise Systems Integration
 */

import { ipcMain } from 'electron';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

// ===== TYPE DEFINITIONS =====

interface ServiceNowConfig {
  instanceUrl: string;
  username: string;
  password: string;
  clientId?: string;
  clientSecret?: string;
  useOAuth: boolean;
}

interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  cloudId?: string;
}

interface WorkdayConfig {
  tenantUrl: string;
  username: string;
  password: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

interface LeanIXConfig {
  instanceUrl: string;
  apiToken: string;
  workspaceId?: string;
}

interface ConnectionTestResult {
  success: boolean;
  error?: string;
  details?: any;
}

interface ExtractionResult {
  success: boolean;
  data?: any[];
  error?: string;
  recordCount?: number;
}

// ===== SERVICENOW API =====

class ServiceNowClient {
  private config: ServiceNowConfig;
  private accessToken: string | null = null;

  constructor(config: ServiceNowConfig) {
    this.config = config;
  }

  private async getAuthHeader(): Promise<string> {
    if (this.config.useOAuth && this.config.clientId && this.config.clientSecret) {
      // OAuth flow
      if (!this.accessToken) {
        this.accessToken = await this.getOAuthToken();
      }
      return `Bearer ${this.accessToken}`;
    } else {
      // Basic auth
      const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
      return `Basic ${credentials}`;
    }
  }

  private async getOAuthToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const tokenUrl = new URL('/oauth_token.do', this.config.instanceUrl);
      const postData = new URLSearchParams({
        grant_type: 'password',
        client_id: this.config.clientId!,
        client_secret: this.config.clientSecret!,
        username: this.config.username,
        password: this.config.password,
      }).toString();

      const options = {
        hostname: tokenUrl.hostname,
        path: tokenUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.access_token) {
              resolve(response.access_token);
            } else {
              reject(new Error(response.error_description || 'OAuth failed'));
            }
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const authHeader = await this.getAuthHeader();
      const url = new URL('/api/now/table/sys_user?sysparm_limit=1', this.config.instanceUrl);

      return new Promise((resolve) => {
        const req = https.request(
          {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
              Authorization: authHeader,
              Accept: 'application/json',
            },
          },
          (res) => {
            if (res.statusCode === 200) {
              resolve({ success: true });
            } else {
              resolve({ success: false, error: `HTTP ${res.statusCode}` });
            }
          }
        );

        req.on('error', (err) => resolve({ success: false, error: err.message }));
        req.end();
      });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async extractData(dataType: string): Promise<ExtractionResult> {
    const tableMap: Record<string, string> = {
      cmdb: 'cmdb_ci',
      incidents: 'incident',
      users: 'sys_user',
      requests: 'sc_request',
      changes: 'change_request',
    };

    const table = tableMap[dataType];
    if (!table) {
      return { success: false, error: `Unknown data type: ${dataType}` };
    }

    try {
      const authHeader = await this.getAuthHeader();
      const allRecords: any[] = [];
      let offset = 0;
      const limit = 1000;
      let hasMore = true;

      while (hasMore) {
        const url = new URL(
          `/api/now/table/${table}?sysparm_limit=${limit}&sysparm_offset=${offset}`,
          this.config.instanceUrl
        );

        const records = await new Promise<any[]>((resolve, reject) => {
          const req = https.request(
            {
              hostname: url.hostname,
              path: url.pathname + url.search,
              method: 'GET',
              headers: {
                Authorization: authHeader,
                Accept: 'application/json',
              },
            },
            (res) => {
              let data = '';
              res.on('data', (chunk) => (data += chunk));
              res.on('end', () => {
                try {
                  const response = JSON.parse(data);
                  resolve(response.result || []);
                } catch (err) {
                  reject(err);
                }
              });
            }
          );

          req.on('error', reject);
          req.end();
        });

        allRecords.push(...records);
        hasMore = records.length === limit;
        offset += limit;
      }

      return { success: true, data: allRecords, recordCount: allRecords.length };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

// ===== JIRA API =====

class JiraClient {
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.config = config;
  }

  private getAuthHeader(): string {
    const credentials = Buffer.from(`${this.config.email}:${this.config.apiToken}`).toString('base64');
    return `Basic ${credentials}`;
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const url = new URL('/rest/api/3/myself', this.config.baseUrl);

      return new Promise((resolve) => {
        const req = https.request(
          {
            hostname: url.hostname,
            path: url.pathname,
            method: 'GET',
            headers: {
              Authorization: this.getAuthHeader(),
              Accept: 'application/json',
            },
          },
          (res) => {
            if (res.statusCode === 200) {
              resolve({ success: true });
            } else {
              resolve({ success: false, error: `HTTP ${res.statusCode}` });
            }
          }
        );

        req.on('error', (err) => resolve({ success: false, error: err.message }));
        req.end();
      });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async extractData(dataType: string): Promise<ExtractionResult> {
    const endpoints: Record<string, string> = {
      projects: '/rest/api/3/project',
      issues: '/rest/api/3/search?maxResults=1000',
      users: '/rest/api/3/users/search?maxResults=1000',
      boards: '/rest/agile/1.0/board',
    };

    const endpoint = endpoints[dataType];
    if (!endpoint) {
      return { success: false, error: `Unknown data type: ${dataType}` };
    }

    try {
      const url = new URL(endpoint, this.config.baseUrl);

      const data = await new Promise<any>((resolve, reject) => {
        const req = https.request(
          {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'GET',
            headers: {
              Authorization: this.getAuthHeader(),
              Accept: 'application/json',
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (err) {
                reject(err);
              }
            });
          }
        );

        req.on('error', reject);
        req.end();
      });

      // Normalize response based on data type
      const records = dataType === 'issues' ? data.issues : Array.isArray(data) ? data : data.values || [];

      return { success: true, data: records, recordCount: records.length };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

// ===== WORKDAY API =====

class WorkdayClient {
  private config: WorkdayConfig;
  private accessToken: string | null = null;

  constructor(config: WorkdayConfig) {
    this.config = config;
  }

  async testConnection(): Promise<ConnectionTestResult> {
    // Workday requires OAuth2 - simplified test
    try {
      if (!this.config.clientId || !this.config.clientSecret) {
        return { success: false, error: 'OAuth credentials required for Workday' };
      }

      // Note: Actual Workday implementation requires proper OAuth2 flow
      // This is a placeholder that would need to be customized per tenant
      return { success: true, details: 'Workday connection test (placeholder)' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async extractData(dataType: string): Promise<ExtractionResult> {
    // Workday uses SOAP/REST APIs with complex authentication
    // This is a placeholder structure
    const dataTypeEndpoints: Record<string, string> = {
      employees: '/ccx/service/tenant/Human_Resources/v40.0/Get_Workers',
      costCenters: '/ccx/service/tenant/Financial_Management/v40.0/Get_Cost_Centers',
      organizations: '/ccx/service/tenant/Human_Resources/v40.0/Get_Organizations',
      positions: '/ccx/service/tenant/Human_Resources/v40.0/Get_Positions',
    };

    if (!dataTypeEndpoints[dataType]) {
      return { success: false, error: `Unknown data type: ${dataType}` };
    }

    // Placeholder - actual implementation requires SOAP/REST calls with proper auth
    return {
      success: true,
      data: [],
      recordCount: 0,
      error: 'Workday extraction requires custom implementation per tenant',
    };
  }
}

// ===== LEANIX API =====

class LeanIXClient {
  private config: LeanIXConfig;
  private accessToken: string | null = null;

  constructor(config: LeanIXConfig) {
    this.config = config;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    return new Promise((resolve, reject) => {
      const url = new URL('/services/mtm/v1/oauth2/token', this.config.instanceUrl);
      const postData = new URLSearchParams({
        grant_type: 'client_credentials',
      }).toString();

      const req = https.request(
        {
          hostname: url.hostname,
          path: url.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`apitoken:${this.config.apiToken}`).toString('base64')}`,
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              if (response.access_token) {
                this.accessToken = response.access_token;
                resolve(response.access_token);
              } else {
                reject(new Error('Failed to get LeanIX access token'));
              }
            } catch (err) {
              reject(err);
            }
          });
        }
      );

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const token = await this.getAccessToken();
      return { success: true, details: { tokenObtained: !!token } };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async extractData(factSheetType: string): Promise<ExtractionResult> {
    try {
      const token = await this.getAccessToken();

      const graphqlQuery = {
        query: `
          query {
            allFactSheets(filter: {factSheetType: ${factSheetType}}) {
              edges {
                node {
                  id
                  name
                  type
                  description
                  ... on ${factSheetType} {
                    lifecycle {
                      asString
                    }
                    businessCriticality
                    technicalFit
                    functionalFit
                  }
                }
              }
            }
          }
        `,
      };

      const url = new URL('/services/pathfinder/v1/graphql', this.config.instanceUrl);

      const data = await new Promise<any>((resolve, reject) => {
        const postData = JSON.stringify(graphqlQuery);

        const req = https.request(
          {
            hostname: url.hostname,
            path: url.pathname,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'Content-Length': Buffer.byteLength(postData),
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (err) {
                reject(err);
              }
            });
          }
        );

        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      const factSheets = data?.data?.allFactSheets?.edges?.map((e: any) => e.node) || [];

      return { success: true, data: factSheets, recordCount: factSheets.length };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

// ===== IPC HANDLERS =====

export function registerEnterpriseSystemsHandlers(): void {
  // Test connection handler
  ipcMain.handle('enterprise-test-connection', async (_event, args) => {
    const { system, config } = args;

    switch (system) {
      case 'serviceNow': {
        const client = new ServiceNowClient(config);
        return await client.testConnection();
      }
      case 'jira': {
        const client = new JiraClient(config);
        return await client.testConnection();
      }
      case 'workday': {
        const client = new WorkdayClient(config);
        return await client.testConnection();
      }
      case 'leanIX': {
        const client = new LeanIXClient(config);
        return await client.testConnection();
      }
      default:
        return { success: false, error: `Unknown system: ${system}` };
    }
  });

  // Data extraction handler
  ipcMain.handle('enterprise-extract-data', async (_event, args) => {
    const { system, config, dataType, companyName } = args;

    let result: ExtractionResult;

    switch (system) {
      case 'serviceNow': {
        const client = new ServiceNowClient(config);
        result = await client.extractData(dataType);
        break;
      }
      case 'jira': {
        const client = new JiraClient(config);
        result = await client.extractData(dataType);
        break;
      }
      case 'workday': {
        const client = new WorkdayClient(config);
        result = await client.extractData(dataType);
        break;
      }
      case 'leanIX': {
        const client = new LeanIXClient(config);
        result = await client.extractData(dataType);
        break;
      }
      default:
        result = { success: false, error: `Unknown system: ${system}` };
    }

    // Save to discovery data if successful
    if (result.success && result.data && result.data.length > 0 && companyName) {
      try {
        const discoveryDataPath = path.join(
          process.env.DISCOVERY_DATA_PATH || 'C:\\DiscoveryData',
          companyName,
          'Raw'
        );

        if (!fs.existsSync(discoveryDataPath)) {
          fs.mkdirSync(discoveryDataPath, { recursive: true });
        }

        const filename = `${system}_${dataType}.csv`;
        const filePath = path.join(discoveryDataPath, filename);

        // Convert to CSV
        if (result.data.length > 0) {
          const headers = Object.keys(result.data[0]);
          const csvContent = [
            headers.join(','),
            ...result.data.map((row) =>
              headers.map((h) => {
                const value = row[h];
                if (value === null || value === undefined) return '';
                const str = String(value);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                  return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
              }).join(',')
            ),
          ].join('\n');

          fs.writeFileSync(filePath, csvContent, 'utf8');
        }
      } catch (err) {
        console.error('Failed to save enterprise data to CSV:', err);
      }
    }

    return result;
  });

  console.log('[EnterpriseSystemsService] IPC handlers registered');
}

export default { registerEnterpriseSystemsHandlers };
