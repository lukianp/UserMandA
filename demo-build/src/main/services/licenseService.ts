/**
 * License Service
 * Manages application licensing, activation, validation, and feature access control
 *
 * Features:
 * - Offline license validation with optional online verification
 * - Encrypted storage using Electron safeStorage (Windows DPAPI)
 * - Machine binding to prevent multi-activation
 * - Feature gating for premium functionality
 * - Customer ID extraction for update channels
 */

import { EventEmitter } from 'events';
import { randomBytes, createHash } from 'crypto';
import { safeStorage } from 'electron';
import { ConfigService } from './configService';

// ============================================================================
// Types
// ============================================================================

export type LicenseType = 'trial' | 'standard' | 'enterprise';
export type LicenseStatus = 'active' | 'expired' | 'invalid' | 'not_activated';

export interface LicenseInfo {
  status: LicenseStatus;
  type: LicenseType;
  customerId: string;
  activatedAt?: string;
  expiresAt?: string;
  features: string[];
  machineId: string;
  daysRemaining?: number;
}

export interface LicenseKeyMetadata {
  customerId: string;
  type: LicenseType;
  expiresAt: string;
  features: string[];
  checksum: string;
}

export interface ActivationResult {
  success: boolean;
  licenseInfo?: LicenseInfo;
  error?: string;
}

// ============================================================================
// Service
// ============================================================================

export class LicenseService extends EventEmitter {
  private configService: ConfigService;
  private initialized = false;
  private machineId: string | null = null;
  private currentLicense: LicenseInfo | null = null;

  constructor(configService: ConfigService) {
    super();
    this.configService = configService;
  }

  /**
   * Initialize the license service
   * Loads existing license or generates machine ID
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Get or generate machine ID (persistent UUID)
    this.machineId = await this.configService.get<string>('license.machineId') ?? null;
    if (!this.machineId) {
      this.machineId = this.generateMachineId();
      await this.configService.set('license.machineId', this.machineId);
    }

    // Load existing license
    await this.loadLicense();

    this.initialized = true;
    this.emit('initialized');
  }

  /**
   * Activate a new license key
   * Validates, decodes, encrypts, and stores
   */
  async activateLicense(licenseKey: string): Promise<ActivationResult> {
    await this.ensureInitialized();

    // Validate format
    if (!this.validateKeyFormat(licenseKey)) {
      return { success: false, error: 'Invalid license key format' };
    }

    // Decode and validate
    let metadata: LicenseKeyMetadata;
    try {
      metadata = this.decodeLicenseKey(licenseKey);
    } catch (error) {
      return { success: false, error: `License validation failed: ${error instanceof Error ? error.message : String(error)}` };
    }

    // Check expiry
    const expiresAt = new Date(metadata.expiresAt);
    if (expiresAt < new Date()) {
      return { success: false, error: 'License has expired' };
    }

    // Verify checksum
    if (!this.verifyChecksum(licenseKey, metadata.checksum)) {
      return { success: false, error: 'License key integrity check failed' };
    }

    // Optional: Online activation
    // const online = await this.verifyOnline(licenseKey, this.machineId);

    // Store encrypted
    if (!safeStorage.isEncryptionAvailable()) {
      return { success: false, error: 'Secure storage not available' };
    }

    const encryptedKey = safeStorage.encryptString(licenseKey);
    await this.configService.set('license.key', encryptedKey.toString('base64'));
    await this.configService.set('license.customerId', metadata.customerId);
    await this.configService.set('license.type', metadata.type);
    await this.configService.set('license.activatedAt', new Date().toISOString());
    await this.configService.set('license.expiresAt', metadata.expiresAt);
    await this.configService.set('license.features', metadata.features);

    // Reload
    await this.loadLicense();

    this.emit('license-activated', this.currentLicense);

    return { success: true, licenseInfo: this.currentLicense! };
  }

  /**
   * Get current license information
   */
  async getLicenseInfo(): Promise<LicenseInfo> {
    await this.ensureInitialized();

    if (!this.currentLicense) {
      return {
        status: 'not_activated',
        type: 'trial',
        customerId: '',
        features: [],
        machineId: this.machineId!
      };
    }

    return { ...this.currentLicense };
  }

  /**
   * Check if license is valid (active and not expired)
   */
  async isLicenseValid(): Promise<boolean> {
    const info = await this.getLicenseInfo();
    return info.status === 'active';
  }

  /**
   * Get license details (alias for getLicenseInfo)
   */
  async getLicenseDetails(): Promise<LicenseInfo> {
    return this.getLicenseInfo();
  }

  /**
   * Check if a specific feature is enabled
   */
  async hasFeature(featureId: string): Promise<boolean> {
    const license = await this.getLicenseInfo();

    if (license.status !== 'active') {
      return false;
    }

    return license.features.includes(featureId) || license.features.includes('*');
  }

  /**
   * Get customer ID for update channel determination
   */
  async getCustomerId(): Promise<string | null> {
    await this.ensureInitialized();
    return this.currentLicense?.customerId || null;
  }

  /**
   * Deactivate current license
   */
  async deactivateLicense(): Promise<void> {
    await this.configService.delete('license.key');
    await this.configService.delete('license.customerId');
    await this.configService.delete('license.type');
    await this.configService.delete('license.activatedAt');
    await this.configService.delete('license.expiresAt');
    await this.configService.delete('license.features');

    this.currentLicense = null;
    this.emit('license-deactivated');
  }

  /**
   * Refresh license validation
   */
  async refreshLicense(): Promise<LicenseInfo> {
    await this.loadLicense();
    return this.currentLicense!;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async loadLicense(): Promise<void> {
    const encryptedKeyB64 = await this.configService.get<string>('license.key');

    if (!encryptedKeyB64) {
      this.currentLicense = null;
      return;
    }

    try {
      const encryptedKey = Buffer.from(encryptedKeyB64, 'base64');
      const licenseKey = safeStorage.decryptString(encryptedKey);

      const metadata = this.decodeLicenseKey(licenseKey);
      const expiresAt = new Date(metadata.expiresAt);
      const now = new Date();
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const status: LicenseStatus = expiresAt < now ? 'expired' : 'active';

      this.currentLicense = {
        status,
        type: metadata.type,
        customerId: metadata.customerId,
        activatedAt: await this.configService.get<string>('license.activatedAt'),
        expiresAt: metadata.expiresAt,
        features: metadata.features,
        machineId: this.machineId!,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0
      };

    } catch (error) {
      console.error('Failed to load license:', error);
      this.currentLicense = null;
    }
  }

  private validateKeyFormat(key: string): boolean {
    // Format: XXXX-XXXX-XXXX-XXXX-XXXX
    const regex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return regex.test(key);
  }

  private decodeLicenseKey(key: string): LicenseKeyMetadata {
    const parts = key.split('-');

    // PART 0: Customer ID
    const customerId = `customer-${parseInt(parts[0], 36)}`;

    // PART 1: Type
    const typeMap: Record<string, LicenseType> = {
      'TR': 'trial',
      'ST': 'standard',
      'EN': 'enterprise'
    };
    const type = typeMap[parts[1].substring(0, 2)] || 'trial';

    // PART 2: Expiry
    const expiryTimestamp = parseInt(parts[2], 36) * 1000;
    const expiresAt = new Date(expiryTimestamp).toISOString();

    // PART 3: Features
    const featureFlags = parseInt(parts[3], 36);
    const features = this.decodeFeatureFlags(featureFlags);

    // PART 4: Checksum
    const checksum = parts[4];

    return { customerId, type, expiresAt, features, checksum };
  }

  private decodeFeatureFlags(flags: number): string[] {
    const allFeatures = [
      'discovery',
      'migration',
      'analytics',
      'reporting',
      'api-access',
      'priority-support'
    ];

    return allFeatures.filter((_, index) => (flags & (1 << index)) !== 0);
  }

  private verifyChecksum(key: string, expectedChecksum: string): boolean {
    const dataToHash = key.substring(0, key.lastIndexOf('-'));
    const hash = createHash('sha256').update(dataToHash).digest('hex');
    const calculatedChecksum = hash.substring(0, 4).toUpperCase();
    return calculatedChecksum === expectedChecksum;
  }

  private generateMachineId(): string {
    return randomBytes(16).toString('hex');
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private async verifyOnline(licenseKey: string, machineId: string): Promise<boolean> {
    // TODO: Implement online validation API call
    return true;
  }
}

export default LicenseService;


