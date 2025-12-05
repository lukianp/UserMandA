/**
 * Environment Detection Types
 */

export type DetectionStatus = 'idle' | 'detecting' | 'completed' | 'failed' | 'cancelled';
export type EnvironmentType = 'azure' | 'on-premises' | 'hybrid' | 'aws' | 'gcp' | 'unknown';

export interface EnvironmentDetectionConfig {
  id: string;
  name: string;
  credentials?: { tenantId?: string; subscriptionId?: string; };
  detectAzure: boolean;
  detectOnPremises: boolean;
  detectAWS: boolean;
  detectGCP: boolean;
  timeout: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnvironmentDetectionResult {
  id: string;
  configId: string;
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

export interface EnvironmentStats {
  totalServicesDetected: number;
  servicesByProvider: Record<string, number>;
  criticalRecommendations: number;
  environmentConfidence: number;
}

export interface DetectionFilterState {
  searchText: string;
  selectedProviders: string[];
  selectedStatuses: string[];
  showOnlyAvailable: boolean;
}
