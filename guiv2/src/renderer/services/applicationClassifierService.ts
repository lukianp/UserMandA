/**
 * Application Classifier Service
 *
 * Intelligent classification of Entra ID applications using scoring-based
 * classification to distinguish Microsoft defaults from customer-managed apps.
 *
 * Categories:
 * - MicrosoftDefault: Built-in Azure/Microsoft services
 * - CustomerManaged: Apps created/owned by the tenant
 * - ThirdParty: External vendor applications
 * - Unknown: Unclassified applications
 */

export type ApplicationCategory = 'MicrosoftDefault' | 'CustomerManaged' | 'ThirdParty' | 'Unknown';

export interface ClassificationResult {
  category: ApplicationCategory;
  confidence: number; // 0-1
  reasons: string[]; // Evidence array
  tenantDomains: string[]; // Verified domains used for classification
}

export interface ApplicationClassification {
  appId: string;
  category: ApplicationCategory;
  confidence: number;
  reasons: string[];
  classifiedAt: Date;
  tenantId: string;
}

export interface ApplicationRecord {
  'App Id': string;
  'Object Id'?: string;
  'Name': string;
  'App Type'?: string;
  'Publisher'?: string;
  'Vendor'?: string;
  'Homepage'?: string;
  'Reply Urls'?: string;
  'Sign In Audience'?: string;
  'Created Date Time'?: string;
  'Owner Count'?: string;
  'Assigned Users'?: string;
  'Tags'?: string;
  // Classification fields (if pre-classified in CSV)
  'Classification_Category'?: string;
  'Classification_Confidence'?: string;
  'Classification_Reasons'?: string;
  'Tenant_Domains_Used'?: string;
  [key: string]: string | undefined;
}

interface PatternRule {
  pattern: RegExp;
  weight: number;
  reason: string;
}

export class ApplicationClassifierService {
  // Known Microsoft App IDs (expanded list from Azure AD)
  private microsoftAppIds = new Set([
    // Core Azure AD / Identity
    '00000002-0000-0000-c000-000000000000', // Windows Azure Active Directory
    '00000003-0000-0000-c000-000000000000', // Microsoft Graph
    '00000001-0000-0000-c000-000000000000', // Azure ESTS Service

    // Office 365 Services
    '00000003-0000-0ff1-ce00-000000000000', // Office 365 SharePoint Online
    '00000004-0000-0ff1-ce00-000000000000', // Skype for Business Online
    '00000005-0000-0000-c000-000000000000', // Azure Workflow
    '00000006-0000-0ff1-ce00-000000000000', // Microsoft Office 365 Portal
    '00000007-0000-0ff1-ce00-000000000000', // Microsoft Exchange Online Protection
    '00000007-0000-0000-c000-000000000000', // Common Data Service

    // Azure Services
    '797f4846-ba00-4fd7-ba43-dac1f8f63013', // Azure Service Management
    'c44b4083-3bb0-49c1-b47d-974e53cbdf3c', // Azure Portal
    'abfa0a7c-a6b6-4736-8310-5855508787cd', // Microsoft Azure CLI
    '04b07795-8ddb-461a-bbee-02f9e1bf7b46', // Microsoft Azure CLI
    '1950a258-227b-4e31-a9cf-717495945fc2', // Microsoft Azure PowerShell
    '18fbca16-2224-45f6-85b0-f7bf2b39b3f3', // Azure Storage

    // Microsoft 365 Apps
    'd3590ed6-52b3-4102-aeff-aad2292ab01c', // Microsoft Office
    '57fb890c-0dab-4253-a5e0-7188c88b2bb4', // SharePoint Online Client
    '66a88757-258c-4c72-893c-3e8bed4d6899', // Microsoft Whiteboard
    '4765445b-32c6-49b0-83e6-1d93765276ca', // OfficeHome
    '89bee1f7-5e6e-4d8a-9f3d-ecd601259da7', // Office Online

    // Teams & Communication
    '1fec8e78-bce4-4aaf-ab1b-5451cc387264', // Microsoft Teams
    'cc15fd57-2c6c-4117-a88c-83b1d56b4bbe', // Microsoft Teams Services
    '5e3ce6c0-2b1f-4285-8d4b-75ee78787346', // Teams

    // Security & Compliance
    'fc780465-2017-40d4-a0c5-307022471b92', // Microsoft Intune
    '0000000a-0000-0000-c000-000000000000', // Microsoft Intune API
    'd4ebce55-015a-49b5-a083-c84d1797ae8c', // Microsoft Cloud App Security
    '05a65629-4c1b-48c1-a78b-804c4abdd4af', // Microsoft Defender for Endpoint

    // Power Platform
    '871c010f-5e61-4fb1-83ac-98610a7e9110', // Power BI Service
    'a672d62c-fc7b-4e81-a576-e60dc46e951d', // Power Apps
    '7df0a125-d3be-4c96-aa54-591f83ff541c', // Common Data Service

    // Dynamics
    '00000015-0000-0000-c000-000000000000', // Dynamics CRM Online
    '2db8cb1d-fb6c-450b-ab09-49b6ae35186b', // Dynamics 365

    // Service Communications
    'cb1bda4c-1213-4e8b-911a-0a8c83c5d3b7', // o365.servicecommunications.microsoft.com

    // Azure Infrastructure
    'd66e9e8e-53a4-420c-866d-5bb39aaea675', // networkcopilotRP
    'a2e5d98b-c0e5-4191-b4ae-f6aa7e469ede', // commerce-copilot-firstpartyappid

    // Additional Microsoft services
    '00000009-0000-0000-c000-000000000000', // Power BI
    '0000000c-0000-0000-c000-000000000000', // Microsoft App Access Panel
    '00000014-0000-0000-c000-000000000000', // Microsoft Scheduling Service
    'c5393580-f805-4401-95e8-94b7a6ef2fc2', // Office 365 Management
    '9ea1ad79-fdb6-4f9a-8bc3-2b70f96e34c7', // Bing
    'e9f49c6b-5ce5-44c8-925d-015017e9f7ad', // My Apps
    '2793995e-0a7d-40d7-bd35-6968ba142197', // Signup
    'f8d98a96-0999-43f5-8af3-69971c7bb423', // iOS Accounts
    '29d9ed98-a469-4536-ade2-f981bc1d605e', // Microsoft Authentication Broker
  ]);

  // Microsoft service name patterns with confidence weights
  private microsoftPatterns: PatternRule[] = [
    // Strong Microsoft indicators
    { pattern: /^Microsoft\s/i, weight: 0.95, reason: 'MS_MICROSOFT_NAME_PREFIX' },
    { pattern: /^Azure\s/i, weight: 0.9, reason: 'MS_AZURE_NAME_PREFIX' },
    { pattern: /^Office\s*365/i, weight: 0.9, reason: 'MS_O365_NAME' },
    { pattern: /^o365\./i, weight: 0.9, reason: 'MS_O365_PREFIX' },
    { pattern: /^Windows\s/i, weight: 0.85, reason: 'MS_WINDOWS_NAME_PREFIX' },

    // Service-specific patterns
    { pattern: /servicecommunications/i, weight: 0.9, reason: 'MS_SERVICECOMMS' },
    { pattern: /networkcopilot/i, weight: 0.85, reason: 'MS_NETWORKCOPILOT' },
    { pattern: /commerce-copilot/i, weight: 0.85, reason: 'MS_COMMERCE_COPILOT' },
    { pattern: /devtestlab/i, weight: 0.8, reason: 'MS_DEVTESTLAB' },

    // Product patterns
    { pattern: /\bSharePoint\b/i, weight: 0.7, reason: 'MS_SHAREPOINT' },
    { pattern: /\bExchange\b/i, weight: 0.7, reason: 'MS_EXCHANGE' },
    { pattern: /\bTeams\b/i, weight: 0.6, reason: 'MS_TEAMS' },
    { pattern: /\bOneDrive\b/i, weight: 0.7, reason: 'MS_ONEDRIVE' },
    { pattern: /\bIntune\b/i, weight: 0.75, reason: 'MS_INTUNE' },
    { pattern: /\bDynamics\b/i, weight: 0.7, reason: 'MS_DYNAMICS' },
    { pattern: /\bPower\s*BI\b/i, weight: 0.7, reason: 'MS_POWERBI' },
    { pattern: /\bPower\s*Apps?\b/i, weight: 0.65, reason: 'MS_POWERAPPS' },
    { pattern: /\bPower\s*Automate\b/i, weight: 0.65, reason: 'MS_POWERAUTOMATE' },
    { pattern: /\bDataverse\b/i, weight: 0.7, reason: 'MS_DATAVERSE' },
    { pattern: /\bDefender\b/i, weight: 0.7, reason: 'MS_DEFENDER' },
    { pattern: /\bSentinel\b/i, weight: 0.7, reason: 'MS_SENTINEL' },

    // Azure service patterns
    { pattern: /\bACI\s*API\b/i, weight: 0.7, reason: 'MS_ACI_API' },
    { pattern: /\bAKS\b/i, weight: 0.6, reason: 'MS_AKS' },
    { pattern: /\bKey\s*Vault\b/i, weight: 0.65, reason: 'MS_KEYVAULT' },
    { pattern: /\bApp\s*Service\b/i, weight: 0.6, reason: 'MS_APPSERVICE' },
    { pattern: /\bStorage\s*Account\b/i, weight: 0.6, reason: 'MS_STORAGE' },
    { pattern: /\bResource\s*Manager\b/i, weight: 0.65, reason: 'MS_ARM' },

    // Security patterns
    { pattern: /\bConditional\s*Access\b/i, weight: 0.7, reason: 'MS_CONDITIONAL_ACCESS' },
    { pattern: /\bIdentity\s*Protection\b/i, weight: 0.7, reason: 'MS_IDENTITY_PROTECTION' },
    { pattern: /\bPIM\b/i, weight: 0.6, reason: 'MS_PIM' },
    { pattern: /\bMFA\b/i, weight: 0.5, reason: 'MS_MFA' },

    // Weaker patterns (need additional evidence)
    { pattern: /\bGraph\b/i, weight: 0.5, reason: 'MS_GRAPH' },
    { pattern: /\bPortal\b/i, weight: 0.4, reason: 'MS_PORTAL' },
    { pattern: /\b365\b/i, weight: 0.45, reason: 'MS_365_NUMBER' },
    { pattern: /\bCloud\b/i, weight: 0.3, reason: 'MS_CLOUD' },
    { pattern: /\bCompliance\b/i, weight: 0.4, reason: 'MS_COMPLIANCE' },
  ];

  // Microsoft domains (strong evidence)
  private microsoftDomains = [
    'microsoft.com',
    'azure.com',
    'azure-api.net',
    'windows.net',
    'microsoftonline.com',
    'microsoftonline-p.com',
    'microsoftonline-p.net',
    'office365.us',
    'office.com',
    'sharepoint.com',
    'outlook.com',
    'live.com',
    'msidentity.com',
    'microsoftazuread-sso.com',
    'azurewebsites.net',
    'cloudapp.azure.com',
    'trafficmanager.net',
    'azureedge.net',
    'msauth.net',
    'msftauth.net',
    'msauthimages.net',
    'msftauthimages.net',
  ];

  // Known third-party vendors
  private thirdPartyVendors = [
    'salesforce',
    'servicenow',
    'workday',
    'zoom',
    'slack',
    'dropbox',
    'box.com',
    'docusign',
    'adobe',
    'sap',
    'oracle',
    'aws',
    'google',
    'okta',
    'auth0',
    'ping',
    'duo',
    'crowdstrike',
    'paloalto',
    'splunk',
    'datadog',
    'snowflake',
    'atlassian',
    'jira',
    'confluence',
    'github',
    'gitlab',
    'circleci',
    'jenkins',
  ];

  /**
   * Classify a single application
   */
  classifyApplication(app: ApplicationRecord, tenantDomains: string[] = []): ClassificationResult {
    const reasons: string[] = [];
    let microsoftScore = 0;
    let customerScore = 0;
    let thirdPartyScore = 0;

    const appId = app['App Id'] || '';
    const appName = (app.Name || '').toLowerCase();
    const publisher = (app.Publisher || '').toLowerCase();
    const vendor = (app.Vendor || '').toLowerCase();
    const replyUrls = (app['Reply Urls'] || '').toLowerCase();
    const homepage = (app.Homepage || '').toLowerCase();
    const allUrls = `${replyUrls} ${homepage}`;
    const appType = app['App Type'] || '';

    // 1. Check known Microsoft App ID (strongest evidence)
    if (appId && this.microsoftAppIds.has(appId)) {
      reasons.push('KNOWN_MS_APPID');
      microsoftScore += 1.0;
    }

    // 2. Check publisher domain
    if (publisher) {
      if (this.microsoftDomains.some(domain => publisher.includes(domain))) {
        reasons.push('MS_DOMAIN_PUBLISHER');
        microsoftScore += 0.9;
      } else if (tenantDomains.some(domain => publisher.includes(domain.toLowerCase()))) {
        reasons.push('TENANT_DOMAIN_PUBLISHER');
        customerScore += 0.85;
      } else if (this.thirdPartyVendors.some(v => publisher.includes(v))) {
        reasons.push('KNOWN_THIRD_PARTY_VENDOR');
        thirdPartyScore += 0.8;
      } else if (publisher !== 'unknown' && publisher.length > 0) {
        reasons.push('EXTERNAL_PUBLISHER');
        thirdPartyScore += 0.4;
      }
    }

    // 3. Check vendor field
    if (vendor && vendor !== 'unknown') {
      if (vendor.includes('microsoft')) {
        reasons.push('MS_VENDOR');
        microsoftScore += 0.7;
      } else if (this.thirdPartyVendors.some(v => vendor.includes(v))) {
        reasons.push('THIRD_PARTY_VENDOR');
        thirdPartyScore += 0.6;
      }
    }

    // 4. Check reply URLs and homepage
    if (allUrls) {
      if (this.microsoftDomains.some(domain => allUrls.includes(domain))) {
        reasons.push('MS_DOMAIN_URLS');
        microsoftScore += 0.75;
      } else if (tenantDomains.some(domain => allUrls.includes(domain.toLowerCase()))) {
        reasons.push('TENANT_DOMAIN_URLS');
        customerScore += 0.7;
      }
    }

    // 5. Check name patterns
    let patternMatched = false;
    for (const { pattern, weight, reason } of this.microsoftPatterns) {
      if (pattern.test(appName) || pattern.test(app.Name || '')) {
        reasons.push(reason);
        microsoftScore += weight;
        patternMatched = true;
        // Only count top 2 matching patterns to avoid over-scoring
        if (reasons.filter(r => r.startsWith('MS_')).length >= 2) break;
      }
    }

    // 6. Check for third-party patterns in name
    if (!patternMatched) {
      for (const vendor of this.thirdPartyVendors) {
        if (appName.includes(vendor)) {
          reasons.push('THIRD_PARTY_NAME_PATTERN');
          thirdPartyScore += 0.6;
          break;
        }
      }
    }

    // 7. App Type consideration
    if (appType === 'AppRegistration') {
      // App Registrations are typically customer-managed unless proven otherwise
      if (microsoftScore < 0.5) {
        reasons.push('APP_REGISTRATION_TYPE');
        customerScore += 0.4;
      }
    } else if (appType === 'EnterpriseApplication' || appType === 'ServicePrincipal') {
      // Enterprise Apps could be any category
      if (microsoftScore < 0.3 && thirdPartyScore < 0.3) {
        reasons.push('ENTERPRISE_APP_TYPE');
        // Slight bias towards customer-managed if no other evidence
        customerScore += 0.2;
      }
    }

    // 8. Customer naming patterns (dev/test/prod indicators)
    const customerPatterns = [
      /\b(dev|test|staging|prod|uat|qa)\b/i,
      /\b(internal|corp|company)\b/i,
      /\b(api|service|app|portal)\b/i,
      /^[a-z]+-[a-z]+-/i, // company-project-env pattern
    ];

    if (microsoftScore < 0.6) {
      for (const pattern of customerPatterns) {
        if (pattern.test(appName)) {
          reasons.push('CUSTOMER_NAMING_PATTERN');
          customerScore += 0.3;
          break;
        }
      }
    }

    // 9. Creation date consideration
    if (app['Created Date Time']) {
      try {
        const createdDate = new Date(app['Created Date Time']);
        const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

        // Recent apps (< 1 year) more likely customer-managed
        if (daysSinceCreation < 365 && microsoftScore < 0.7) {
          reasons.push('RECENT_CREATION');
          customerScore += 0.2;
        }
      } catch {
        // Ignore date parsing errors
      }
    }

    // 10. Owner/user assignment (indicates active management)
    const ownerCount = parseInt(app['Owner Count'] || '0');
    const assignedUsers = parseInt(app['Assigned Users'] || '0');

    if ((ownerCount > 0 || assignedUsers > 0) && microsoftScore < 0.6) {
      reasons.push('HAS_OWNERS_OR_USERS');
      customerScore += 0.25;
    }

    // Determine final category and confidence
    let category: ApplicationCategory;
    let confidence: number;

    // Normalize scores
    const maxScore = Math.max(microsoftScore, customerScore, thirdPartyScore, 0.1);

    if (microsoftScore >= 0.7 && microsoftScore > customerScore && microsoftScore > thirdPartyScore) {
      category = 'MicrosoftDefault';
      confidence = Math.min(microsoftScore / maxScore, 1.0);
    } else if (customerScore >= 0.5 && customerScore > thirdPartyScore) {
      category = 'CustomerManaged';
      confidence = Math.min(customerScore / maxScore, 1.0);
    } else if (thirdPartyScore >= 0.4) {
      category = 'ThirdParty';
      confidence = Math.min(thirdPartyScore / maxScore, 1.0);
    } else if (microsoftScore >= 0.5) {
      // Lower threshold for Microsoft if nothing else matches
      category = 'MicrosoftDefault';
      confidence = Math.min(microsoftScore / maxScore, 1.0);
    } else {
      category = 'Unknown';
      confidence = 0.3; // Low confidence for unknown
    }

    // Ensure reasons array is populated
    if (reasons.length === 0) {
      reasons.push('NO_CLASSIFICATION_EVIDENCE');
    }

    return {
      category,
      confidence: Math.round(confidence * 100) / 100,
      reasons: [...new Set(reasons)], // Deduplicate
      tenantDomains
    };
  }

  /**
   * Classify multiple applications
   */
  classifyApplications(apps: ApplicationRecord[], tenantDomains: string[] = []): Map<string, ClassificationResult> {
    const results = new Map<string, ClassificationResult>();

    for (const app of apps) {
      const appId = app['App Id'];
      if (appId) {
        const result = this.classifyApplication(app, tenantDomains);
        results.set(appId, result);
      }
    }

    return results;
  }

  /**
   * Get classification statistics
   */
  getClassificationStats(classifications: Map<string, ClassificationResult>): {
    total: number;
    byCategory: Record<ApplicationCategory, number>;
    highConfidence: number;
    lowConfidence: number;
    topReasons: { reason: string; count: number }[];
  } {
    const stats = {
      total: classifications.size,
      byCategory: {
        MicrosoftDefault: 0,
        CustomerManaged: 0,
        ThirdParty: 0,
        Unknown: 0
      } as Record<ApplicationCategory, number>,
      highConfidence: 0,
      lowConfidence: 0,
      topReasons: [] as { reason: string; count: number }[]
    };

    const reasonCounts = new Map<string, number>();

    classifications.forEach(result => {
      stats.byCategory[result.category]++;

      if (result.confidence >= 0.7) {
        stats.highConfidence++;
      } else {
        stats.lowConfidence++;
      }

      result.reasons.forEach(reason => {
        reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
      });
    });

    // Sort reasons by count
    stats.topReasons = Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  /**
   * Filter applications based on category
   */
  filterApplications(
    apps: ApplicationRecord[],
    classifications: Map<string, ClassificationResult>,
    options: {
      hideMicrosoftDefaults?: boolean;
      hideThirdParty?: boolean;
      hideUnknown?: boolean;
      minConfidence?: number;
    } = {}
  ): ApplicationRecord[] {
    const {
      hideMicrosoftDefaults = true,
      hideThirdParty = false,
      hideUnknown = false,
      minConfidence = 0.7
    } = options;

    return apps.filter(app => {
      const appId = app['App Id'];
      const classification = classifications.get(appId);

      if (!classification) return true; // Show if not classified

      // Only hide MicrosoftDefault if confidence is high enough
      if (hideMicrosoftDefaults &&
          classification.category === 'MicrosoftDefault' &&
          classification.confidence >= minConfidence) {
        return false;
      }

      if (hideThirdParty && classification.category === 'ThirdParty') {
        return false;
      }

      if (hideUnknown && classification.category === 'Unknown') {
        return false;
      }

      return true;
    });
  }

  /**
   * Check if an App ID is a known Microsoft service
   */
  isKnownMicrosoftAppId(appId: string): boolean {
    return this.microsoftAppIds.has(appId);
  }

  /**
   * Add a custom Microsoft App ID
   */
  addMicrosoftAppId(appId: string): void {
    this.microsoftAppIds.add(appId);
  }

  /**
   * Get all known Microsoft App IDs
   */
  getKnownMicrosoftAppIds(): string[] {
    return Array.from(this.microsoftAppIds);
  }
}

// Export singleton instance
export const applicationClassifier = new ApplicationClassifierService();

export default ApplicationClassifierService;
