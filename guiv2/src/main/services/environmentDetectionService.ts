/**
 * Environment Detection Service
 *
 * Automatically detects the environment type (Azure, On-Premises, Hybrid, AWS, GCP)
 * and available services/capabilities for M&A discovery planning.
 */

import { EventEmitter } from 'events';
import PowerShellExecutionService from './powerShellService';
import * as path from 'path';

export type EnvironmentType = 'azure' | 'on-premises' | 'hybrid' | 'aws' | 'gcp' | 'unknown';
export type DetectionStatus = 'idle' | 'detecting' | 'completed' | 'failed' | 'cancelled';

export interface DetectedService {
  id: string;
  name: string;
  type: string;
  provider: 'azure' | 'microsoft365' | 'on-premises' | 'aws' | 'gcp';
  detected: boolean;
  version?: string;
  endpoint?: string;
  authentication?: string;
  features: string[];
  status: 'available' | 'unavailable' | 'partial';
  capabilities: ServiceCapability[];
}

export interface ServiceCapability {
  name: string;
  available: boolean;
  requiresLicense?: boolean;
  licenseType?: string;
}

export interface Recommendation {
  id: string;
  category: 'migration' | 'configuration' | 'optimization' | 'security';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  steps: string[];
  relatedServices: string[];
}

export interface DetectionError {
  timestamp: Date;
  serviceType: string;
  message: string;
}

export interface EnvironmentDetectionResult {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: DetectionStatus;
  detectedEnvironment: EnvironmentType;
  detectedServices: DetectedService[];
  recommendations: Recommendation[];
  totalServicesFound: number;
  confidence: number;
  errors: DetectionError[];
  warnings: string[];
}

export interface DetectionConfig {
  credentials?: {
    tenantId?: string;
    subscriptionId?: string;
    clientId?: string;
    clientSecret?: string;
    awsAccessKey?: string;
    awsSecretKey?: string;
    gcpProjectId?: string;
    gcpServiceAccountKey?: string;
  };
  detectAzure?: boolean;
  detectOnPremises?: boolean;
  detectAWS?: boolean;
  detectGCP?: boolean;
  timeout?: number;
}

/**
 * Environment Detection Service
 * Detects and analyzes IT environments for M&A discovery
 */
export default class EnvironmentDetectionService extends EventEmitter {
  private psService: PowerShellExecutionService;
  private activeDetections: Map<string, boolean> = new Map();

  constructor(psService: PowerShellExecutionService) {
    super();
    this.psService = psService;
  }

  /**
   * Detect environment type and available services
   */
  async detectEnvironment(config: DetectionConfig = {}): Promise<EnvironmentDetectionResult> {
    const detectionId = this.generateDetectionId();
    const startTime = new Date();

    this.activeDetections.set(detectionId, true);
    this.emit('detection:started', { detectionId, startTime });

    const result: EnvironmentDetectionResult = {
      id: detectionId,
      startTime,
      status: 'detecting',
      detectedEnvironment: 'unknown',
      detectedServices: [],
      recommendations: [],
      totalServicesFound: 0,
      confidence: 0,
      errors: [],
      warnings: [],
    };

    try {
      const detections = await Promise.allSettled([
        config.detectAzure !== false ? this.detectAzureEnvironment(config, detectionId) : null,
        config.detectOnPremises !== false ? this.detectOnPremisesEnvironment(config, detectionId) : null,
        config.detectAWS === true ? this.detectAWSEnvironment(config, detectionId) : null,
        config.detectGCP === true ? this.detectGCPEnvironment(config, detectionId) : null,
      ]);

      // Aggregate results
      const allServices: DetectedService[] = [];
      const allErrors: DetectionError[] = [];

      detections.forEach((detection, index) => {
        if (detection.status === 'fulfilled' && detection.value) {
          allServices.push(...detection.value.services);
          allErrors.push(...detection.value.errors);
        } else if (detection.status === 'rejected') {
          const provider = ['azure', 'on-premises', 'aws', 'gcp'][index];
          allErrors.push({
            timestamp: new Date(),
            serviceType: provider,
            message: detection.reason?.message || 'Detection failed',
          });
        }
      });

      result.detectedServices = allServices;
      result.errors = allErrors;
      result.totalServicesFound = allServices.filter(s => s.detected).length;

      // Determine environment type based on detected services
      result.detectedEnvironment = this.determineEnvironmentType(allServices);
      result.confidence = this.calculateConfidence(allServices, allErrors);

      // Generate recommendations
      result.recommendations = this.generateRecommendations(allServices, result.detectedEnvironment);

      result.status = 'completed';
      result.endTime = new Date();

      this.emit('detection:completed', result);
      return result;

    } catch (error: any) {
      result.status = 'failed';
      result.endTime = new Date();
      result.errors.push({
        timestamp: new Date(),
        serviceType: 'system',
        message: error.message,
      });

      this.emit('detection:failed', result);
      return result;

    } finally {
      this.activeDetections.delete(detectionId);
    }
  }

  /**
   * Detect Azure/Microsoft 365 environment
   */
  private async detectAzureEnvironment(
    config: DetectionConfig,
    detectionId: string
  ): Promise<{ services: DetectedService[]; errors: DetectionError[] }> {
    const services: DetectedService[] = [];
    const errors: DetectionError[] = [];

    this.emitProgress(detectionId, 'Detecting Azure environment...', 10);

    try {
      // Detect Azure AD
      const azureAdResult = await this.psService.executeScript(
        path.join('..', 'Modules', 'Discovery', 'AzureDiscovery.psm1'),
        ['-FunctionName', 'Test-AzureADConnection'],
        { timeout: 30000, streamOutput: false }
      );

      if (azureAdResult.success && azureAdResult.data?.Connected) {
        services.push({
          id: 'azure-ad',
          name: 'Azure Active Directory',
          type: 'Identity',
          provider: 'azure',
          detected: true,
          version: azureAdResult.data.Version,
          endpoint: azureAdResult.data.TenantId,
          authentication: 'OAuth2',
          features: ['SSO', 'MFA', 'Conditional Access', 'PIM'],
          status: 'available',
          capabilities: [
            { name: 'User Management', available: true },
            { name: 'Group Management', available: true },
            { name: 'Application Registration', available: true },
            { name: 'Conditional Access', available: azureAdResult.data.HasPremium, requiresLicense: true, licenseType: 'Azure AD Premium' },
          ],
        });
      }

      this.emitProgress(detectionId, 'Detecting Microsoft 365 services...', 30);

      // Detect Exchange Online
      const exchangeResult = await this.psService.executeScript(
        path.join('..', 'Modules', 'Discovery', 'ExchangeDiscovery.psm1'),
        ['-FunctionName', 'Test-ExchangeOnlineConnection'],
        { timeout: 30000, streamOutput: false }
      );

      if (exchangeResult.success && exchangeResult.data?.Connected) {
        services.push({
          id: 'exchange-online',
          name: 'Exchange Online',
          type: 'Email',
          provider: 'microsoft365',
          detected: true,
          version: exchangeResult.data.Version,
          endpoint: exchangeResult.data.Endpoint,
          authentication: 'Modern Auth',
          features: ['Mailboxes', 'Distribution Groups', 'Shared Mailboxes', 'Mail Flow Rules'],
          status: 'available',
          capabilities: [
            { name: 'Mailbox Management', available: true },
            { name: 'Advanced Threat Protection', available: exchangeResult.data.HasATP, requiresLicense: true, licenseType: 'Exchange Online Plan 2' },
          ],
        });
      }

      this.emitProgress(detectionId, 'Detecting SharePoint Online...', 50);

      // Detect SharePoint Online
      const sharepointResult = await this.psService.executeScript(
        path.join('..', 'Modules', 'Discovery', 'SharePointDiscovery.psm1'),
        ['-FunctionName', 'Test-SharePointOnlineConnection'],
        { timeout: 30000, streamOutput: false }
      );

      if (sharepointResult.success && sharepointResult.data?.Connected) {
        services.push({
          id: 'sharepoint-online',
          name: 'SharePoint Online',
          type: 'Collaboration',
          provider: 'microsoft365',
          detected: true,
          version: sharepointResult.data.Version,
          endpoint: sharepointResult.data.AdminUrl,
          authentication: 'OAuth2',
          features: ['Sites', 'Libraries', 'Lists', 'Content Types'],
          status: 'available',
          capabilities: [
            { name: 'Site Collection Management', available: true },
            { name: 'Advanced DLP', available: sharepointResult.data.HasAdvancedDLP, requiresLicense: true, licenseType: 'Microsoft 365 E5' },
          ],
        });
      }

      // Detect Teams
      const teamsResult = await this.psService.executeScript(
        path.join('..', 'Modules', 'Discovery', 'TeamsDiscovery.psm1'),
        ['-FunctionName', 'Test-TeamsConnection'],
        { timeout: 30000, streamOutput: false }
      );

      if (teamsResult.success && teamsResult.data?.Connected) {
        services.push({
          id: 'microsoft-teams',
          name: 'Microsoft Teams',
          type: 'Communication',
          provider: 'microsoft365',
          detected: true,
          version: teamsResult.data.Version,
          authentication: 'OAuth2',
          features: ['Teams', 'Channels', 'Calls', 'Meetings'],
          status: 'available',
          capabilities: [
            { name: 'Team Management', available: true },
            { name: 'Phone System', available: teamsResult.data.HasPhoneSystem, requiresLicense: true, licenseType: 'Teams Phone' },
          ],
        });
      }

      this.emitProgress(detectionId, 'Azure detection complete', 70);

    } catch (error: any) {
      errors.push({
        timestamp: new Date(),
        serviceType: 'azure',
        message: `Azure detection error: ${error.message}`,
      });
    }

    return { services, errors };
  }

  /**
   * Detect On-Premises environment
   */
  private async detectOnPremisesEnvironment(
    config: DetectionConfig,
    detectionId: string
  ): Promise<{ services: DetectedService[]; errors: DetectionError[] }> {
    const services: DetectedService[] = [];
    const errors: DetectionError[] = [];

    this.emitProgress(detectionId, 'Detecting on-premises environment...', 15);

    try {
      // Detect Active Directory
      const adResult = await this.psService.executeScript(
        path.join('..', 'Modules', 'Discovery', 'ActiveDirectoryDiscovery.psm1'),
        ['-FunctionName', 'Test-ActiveDirectoryConnection'],
        { timeout: 30000, streamOutput: false }
      );

      if (adResult.success && adResult.data?.Connected) {
        services.push({
          id: 'active-directory',
          name: 'Active Directory',
          type: 'Identity',
          provider: 'on-premises',
          detected: true,
          version: adResult.data.ForestFunctionalLevel,
          endpoint: adResult.data.DomainController,
          authentication: 'Kerberos/NTLM',
          features: ['Users', 'Groups', 'OUs', 'GPOs', 'Trusts'],
          status: 'available',
          capabilities: [
            { name: 'User Management', available: true },
            { name: 'Group Policy Management', available: true },
            { name: 'Fine-Grained Password Policies', available: adResult.data.SupportsFGPP },
          ],
        });
      }

      this.emitProgress(detectionId, 'Detecting Exchange Server...', 35);

      // Detect Exchange Server
      const exchangeOnPremResult = await this.psService.executeScript(
        path.join('..', 'Modules', 'Discovery', 'ExchangeDiscovery.psm1'),
        ['-FunctionName', 'Test-ExchangeServerConnection'],
        { timeout: 30000, streamOutput: false }
      );

      if (exchangeOnPremResult.success && exchangeOnPremResult.data?.Connected) {
        services.push({
          id: 'exchange-server',
          name: 'Exchange Server',
          type: 'Email',
          provider: 'on-premises',
          detected: true,
          version: exchangeOnPremResult.data.Version,
          endpoint: exchangeOnPremResult.data.Server,
          authentication: 'NTLM/Kerberos',
          features: ['Mailboxes', 'DAGs', 'Public Folders', 'Transport Rules'],
          status: 'available',
          capabilities: [
            { name: 'Mailbox Management', available: true },
            { name: 'Database Availability Groups', available: exchangeOnPremResult.data.HasDAG },
          ],
        });
      }

      this.emitProgress(detectionId, 'Detecting SharePoint Server...', 55);

      // Detect SharePoint Server
      const sharepointOnPremResult = await this.psService.executeScript(
        path.join('..', 'Modules', 'Discovery', 'SharePointDiscovery.psm1'),
        ['-FunctionName', 'Test-SharePointServerConnection'],
        { timeout: 30000, streamOutput: false }
      );

      if (sharepointOnPremResult.success && sharepointOnPremResult.data?.Connected) {
        services.push({
          id: 'sharepoint-server',
          name: 'SharePoint Server',
          type: 'Collaboration',
          provider: 'on-premises',
          detected: true,
          version: sharepointOnPremResult.data.Version,
          endpoint: sharepointOnPremResult.data.WebApplication,
          authentication: 'Windows/SAML',
          features: ['Sites', 'Service Applications', 'Search', 'Workflows'],
          status: 'available',
          capabilities: [
            { name: 'Site Collection Management', available: true },
            { name: 'Hybrid Configuration', available: sharepointOnPremResult.data.IsHybrid },
          ],
        });
      }

      this.emitProgress(detectionId, 'On-premises detection complete', 75);

    } catch (error: any) {
      errors.push({
        timestamp: new Date(),
        serviceType: 'on-premises',
        message: `On-premises detection error: ${error.message}`,
      });
    }

    return { services, errors };
  }

  /**
   * Detect AWS environment
   */
  private async detectAWSEnvironment(
    config: DetectionConfig,
    detectionId: string
  ): Promise<{ services: DetectedService[]; errors: DetectionError[] }> {
    const services: DetectedService[] = [];
    const errors: DetectionError[] = [];

    this.emitProgress(detectionId, 'Detecting AWS environment...', 20);

    try {
      const awsResult = await this.psService.executeScript(
        path.join('..', 'Modules', 'Discovery', 'AWSDiscovery.psm1'),
        [
          '-FunctionName', 'Test-AWSConnection',
          '-AccessKey', config.credentials?.awsAccessKey || '',
          '-SecretKey', config.credentials?.awsSecretKey || '',
        ],
        { timeout: 30000, streamOutput: false }
      );

      if (awsResult.success && awsResult.data?.Connected) {
        services.push({
          id: 'aws-iam',
          name: 'AWS IAM',
          type: 'Identity',
          provider: 'aws',
          detected: true,
          version: awsResult.data.Version,
          endpoint: awsResult.data.Region,
          authentication: 'AWS Signature',
          features: ['Users', 'Roles', 'Policies', 'Federation'],
          status: 'available',
          capabilities: [
            { name: 'User Management', available: true },
            { name: 'Role-Based Access', available: true },
            { name: 'SSO Integration', available: awsResult.data.HasSSO },
          ],
        });
      }

      this.emitProgress(detectionId, 'AWS detection complete', 80);

    } catch (error: any) {
      errors.push({
        timestamp: new Date(),
        serviceType: 'aws',
        message: `AWS detection error: ${error.message}`,
      });
    }

    return { services, errors };
  }

  /**
   * Detect GCP environment
   */
  private async detectGCPEnvironment(
    config: DetectionConfig,
    detectionId: string
  ): Promise<{ services: DetectedService[]; errors: DetectionError[] }> {
    const services: DetectedService[] = [];
    const errors: DetectionError[] = [];

    this.emitProgress(detectionId, 'Detecting GCP environment...', 25);

    try {
      const gcpResult = await this.psService.executeScript(
        path.join('..', 'Modules', 'Discovery', 'GCPDiscovery.psm1'),
        [
          '-FunctionName', 'Test-GCPConnection',
          '-ProjectId', config.credentials?.gcpProjectId || '',
          '-ServiceAccountKey', config.credentials?.gcpServiceAccountKey || '',
        ],
        { timeout: 30000, streamOutput: false }
      );

      if (gcpResult.success && gcpResult.data?.Connected) {
        services.push({
          id: 'gcp-iam',
          name: 'GCP IAM',
          type: 'Identity',
          provider: 'gcp',
          detected: true,
          version: gcpResult.data.Version,
          endpoint: gcpResult.data.ProjectId,
          authentication: 'OAuth 2.0',
          features: ['Service Accounts', 'Roles', 'Policies', 'Federation'],
          status: 'available',
          capabilities: [
            { name: 'Service Account Management', available: true },
            { name: 'Custom Role Creation', available: true },
          ],
        });
      }

      this.emitProgress(detectionId, 'GCP detection complete', 85);

    } catch (error: any) {
      errors.push({
        timestamp: new Date(),
        serviceType: 'gcp',
        message: `GCP detection error: ${error.message}`,
      });
    }

    return { services, errors };
  }

  /**
   * Determine overall environment type based on detected services
   */
  private determineEnvironmentType(services: DetectedService[]): EnvironmentType {
    const hasAzure = services.some(s => s.provider === 'azure' && s.detected);
    const hasOnPrem = services.some(s => s.provider === 'on-premises' && s.detected);
    const hasAWS = services.some(s => s.provider === 'aws' && s.detected);
    const hasGCP = services.some(s => s.provider === 'gcp' && s.detected);

    if (hasAzure && hasOnPrem) return 'hybrid';
    if (hasAzure) return 'azure';
    if (hasOnPrem) return 'on-premises';
    if (hasAWS) return 'aws';
    if (hasGCP) return 'gcp';

    return 'unknown';
  }

  /**
   * Calculate confidence score based on detection results
   */
  private calculateConfidence(services: DetectedService[], errors: DetectionError[]): number {
    const totalAttempted = services.length + errors.length;
    if (totalAttempted === 0) return 0;

    const successfulDetections = services.filter(s => s.detected).length;
    return Math.round((successfulDetections / totalAttempted) * 100);
  }

  /**
   * Generate recommendations based on detected environment
   */
  private generateRecommendations(
    services: DetectedService[],
    environmentType: EnvironmentType
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Hybrid environment recommendations
    if (environmentType === 'hybrid') {
      const hasAzureAD = services.some(s => s.id === 'azure-ad' && s.detected);
      const hasAD = services.some(s => s.id === 'active-directory' && s.detected);

      if (hasAzureAD && hasAD) {
        recommendations.push({
          id: 'hybrid-identity-sync',
          category: 'configuration',
          priority: 'high',
          title: 'Configure Azure AD Connect for Identity Synchronization',
          description: 'Detected both Azure AD and on-premises Active Directory. Implement Azure AD Connect for seamless identity sync.',
          impact: 'Enables single sign-on and unified identity management across cloud and on-premises resources.',
          effort: 'medium',
          steps: [
            'Install Azure AD Connect on a domain-joined server',
            'Configure synchronization settings',
            'Enable password hash synchronization or federation',
            'Validate user synchronization',
          ],
          relatedServices: ['azure-ad', 'active-directory'],
        });
      }
    }

    // Migration planning recommendations
    if (environmentType === 'on-premises') {
      recommendations.push({
        id: 'cloud-migration-assessment',
        category: 'migration',
        priority: 'critical',
        title: 'Assess Cloud Migration Readiness',
        description: 'On-premises environment detected. Evaluate workloads for cloud migration opportunities.',
        impact: 'Modernize infrastructure, reduce costs, and improve scalability.',
        effort: 'high',
        steps: [
          'Inventory all applications and dependencies',
          'Assess cloud compatibility',
          'Develop migration roadmap',
          'Pilot migration for non-critical workloads',
        ],
        relatedServices: services.filter(s => s.provider === 'on-premises').map(s => s.id),
      });
    }

    // Licensing optimization
    const hasLicenseRequirements = services.some(s =>
      s.capabilities.some(c => c.requiresLicense && !c.available)
    );

    if (hasLicenseRequirements) {
      recommendations.push({
        id: 'license-optimization',
        category: 'optimization',
        priority: 'medium',
        title: 'Optimize License Assignments',
        description: 'Some detected services have capabilities requiring additional licenses.',
        impact: 'Unlock advanced features and improve security posture.',
        effort: 'low',
        steps: [
          'Review current license inventory',
          'Identify required licenses for advanced features',
          'Optimize license assignments based on user needs',
          'Monitor license usage',
        ],
        relatedServices: services
          .filter(s => s.capabilities.some(c => c.requiresLicense))
          .map(s => s.id),
      });
    }

    // Security recommendations
    const hasConditionalAccess = services.some(
      s => s.id === 'azure-ad' && s.capabilities.some(c => c.name === 'Conditional Access' && c.available)
    );

    if (hasConditionalAccess) {
      recommendations.push({
        id: 'conditional-access-policies',
        category: 'security',
        priority: 'high',
        title: 'Implement Conditional Access Policies',
        description: 'Azure AD Premium detected with Conditional Access capability. Enhance security with policy-based access control.',
        impact: 'Improve security posture by enforcing MFA, device compliance, and location-based access.',
        effort: 'medium',
        steps: [
          'Define access policies for different user groups',
          'Configure MFA requirements',
          'Set up device compliance policies',
          'Test policies with pilot group before rollout',
        ],
        relatedServices: ['azure-ad'],
      });
    }

    return recommendations;
  }

  /**
   * Validate credentials for a specific provider
   */
  async validateCredentials(
    provider: 'azure' | 'on-premises' | 'aws' | 'gcp',
    credentials: Record<string, string>
  ): Promise<{ valid: boolean; message: string; details?: any }> {
    try {
      let result;

      switch (provider) {
        case 'azure':
          result = await this.psService.executeScript(
            path.join('..', 'Modules', 'Discovery', 'AzureDiscovery.psm1'),
            [
              '-FunctionName', 'Test-AzureCredentials',
              '-TenantId', credentials.tenantId || '',
              '-ClientId', credentials.clientId || '',
              '-ClientSecret', credentials.clientSecret || '',
            ],
            { timeout: 30000, streamOutput: false }
          );
          break;

        case 'on-premises':
          result = await this.psService.executeScript(
            path.join('..', 'Modules', 'Discovery', 'ActiveDirectoryDiscovery.psm1'),
            [
              '-FunctionName', 'Test-ADCredentials',
              '-Domain', credentials.domain || '',
              '-Username', credentials.username || '',
              '-Password', credentials.password || '',
            ],
            { timeout: 30000, streamOutput: false }
          );
          break;

        case 'aws':
          result = await this.psService.executeScript(
            path.join('..', 'Modules', 'Discovery', 'AWSDiscovery.psm1'),
            [
              '-FunctionName', 'Test-AWSCredentials',
              '-AccessKey', credentials.accessKey || '',
              '-SecretKey', credentials.secretKey || '',
            ],
            { timeout: 30000, streamOutput: false }
          );
          break;

        case 'gcp':
          result = await this.psService.executeScript(
            path.join('..', 'Modules', 'Discovery', 'GCPDiscovery.psm1'),
            [
              '-FunctionName', 'Test-GCPCredentials',
              '-ProjectId', credentials.projectId || '',
              '-ServiceAccountKey', credentials.serviceAccountKey || '',
            ],
            { timeout: 30000, streamOutput: false }
          );
          break;

        default:
          return { valid: false, message: `Unsupported provider: ${provider}` };
      }

      if (result.success && result.data?.Valid) {
        return {
          valid: true,
          message: 'Credentials validated successfully',
          details: result.data,
        };
      } else {
        return {
          valid: false,
          message: result.data?.Message || result.error || 'Credential validation failed',
        };
      }
    } catch (error: any) {
      return {
        valid: false,
        message: `Validation error: ${error.message}`,
      };
    }
  }

  /**
   * Cancel active detection
   */
  async cancelDetection(detectionId: string): Promise<boolean> {
    if (this.activeDetections.has(detectionId)) {
      this.activeDetections.delete(detectionId);
      this.emit('detection:cancelled', { detectionId });
      return true;
    }
    return false;
  }

  /**
   * Get detection statistics
   */
  getStatistics(): {
    activeDetections: number;
    totalDetectionsRun: number;
  } {
    return {
      activeDetections: this.activeDetections.size,
      totalDetectionsRun: 0, // Could be tracked with a counter
    };
  }

  // Helper methods
  private generateDetectionId(): string {
    return `detection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emitProgress(detectionId: string, message: string, percentage: number): void {
    this.emit('detection:progress', {
      detectionId,
      message,
      percentage,
      timestamp: new Date(),
    });
  }
}
