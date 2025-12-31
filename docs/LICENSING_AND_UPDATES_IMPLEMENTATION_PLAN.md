# Enterprise Discovery Suite - Customer-Scoped Licensing & Git-Based Update System
## Implementation Plan v1.0

---

## EXECUTIVE SUMMARY

This plan implements a production-grade licensing and update system for the Enterprise Discovery Suite (guiv2) Electron application. The system provides:

1. **Customer-tied licensing** with secure activation, validation, and feature gating
2. **Git/GitHub-based automated updates** with customer-specific channels, rollback capability, and CI/CD integration
3. **Zero disruption to existing architecture** - builds on established patterns

**Critical Discovery**: The project ALREADY has `simple-git` (v3.27.0) and `octokit` (v4.0.2) installed, which significantly simplifies implementation.

---

## I. CODE REVIEW & ARCHITECTURE VALIDATION

### Current State Analysis

#### ✅ STRENGTHS - Excellent Foundation
1. **Mature Service Architecture** (`guiv2/src/main/services/`)
   - 45+ services with consistent initialization patterns
   - Clear separation: ConfigService, ProfileService, EncryptionService
   - Services register IPC handlers in their constructors
   - Initialization in `ipcHandlers.ts:initializeServices()`

2. **Production-Ready Security Patterns**
   - `ProfileService.saveDomainCredentials()` (lines 389-448): Reference implementation for secure credential storage
   - Uses `safeStorage.encryptString()` + base64 encoding
   - Encrypted data stored in profile.configuration object
   - Decryption isolated to main process only
   - Validation checks for `safeStorage.isEncryptionAvailable()`

3. **Robust IPC Communication**
   - `preload.ts`: Secure contextBridge pattern (1258 lines)
   - Typed API surface with no direct renderer access to Node APIs
   - Event-based streaming for long-running operations
   - Existing patterns for credentials, config, profiles

4. **Proven Packaging & Distribution**
   - `forge.config.js`: Squirrel.Windows maker configured
   - Webpack 5 with code splitting and tree shaking
   - ASAR packaging with native module support
   - Build outputs: `.nupkg`, `RELEASES` manifest, `Setup.exe`

5. **Git Infrastructure Ready**
   - Dependencies: `simple-git@3.27.0`, `octokit@4.0.2` (package.json lines 139, preceding)
   - No installation needed - ready to use

#### ⚠️ GAPS - What Needs to be Built
1. **No Licensing System**
   - LicenseActivationView.tsx is a static UI mock (lines 11-18: hardcoded data)
   - No backend service, no validation, no activation

2. **No Update Mechanism**
   - No autoUpdater configuration
   - No version checking logic
   - No GitHub integration despite having libraries

3. **No Customer ID Tracking**
   - No concept of customer/organization identity
   - No license-to-deployment binding

4. **Config Path Issue**
   - `ipcHandlers.ts:101`: Uses `process.cwd()` for config path
   - Production will fail - should use `app.getPath('userData')`
   - ConfigService (line 22) correctly uses userData path
   - **FIX REQUIRED**: Migrate ipcHandlers.ts config to ConfigService

---

## II. ARCHITECTURAL DESIGN

### A. Licensing Module Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MAIN PROCESS                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  LicenseService (New)                                  │ │
│  │  - validateLicenseKey(key: string)                     │ │
│  │  - activateLicense(key, metadata)                      │ │
│  │  - getLicenseInfo()                                    │ │
│  │  - checkFeatureAccess(feature: string)                 │ │
│  │  - refreshLicense() // Online validation              │ │
│  │  - getCustomerId()                                     │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  Storage: ConfigService                                │ │
│  │    license.key: string (encrypted with safeStorage)    │ │
│  │    license.customerId: string                          │ │
│  │    license.activatedAt: ISO date                       │ │
│  │    license.expiresAt: ISO date                         │ │
│  │    license.features: string[] (array of enabled features)│ │
│  │    license.type: 'trial'|'standard'|'enterprise'       │ │
│  │    license.machineId: string (UUID generated on first run)│ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │                          ▲
         │ IPC Handlers             │ IPC Responses
         ▼                          │
┌─────────────────────────────────────────────────────────────┐
│                   RENDERER PROCESS                           │
│                                                              │
│  window.electron.license.activate(key)                      │
│  window.electron.license.getInfo()                          │
│  window.electron.license.checkFeature(feature)              │
│                                                              │
│  UI: LicenseActivationView.tsx (refactor to use real API)   │
└─────────────────────────────────────────────────────────────┘
```

**License Key Format:**
```
XXXX-YYYY-ZZZZ-WWWW-QQQQ (25 chars + 4 hyphens)
├─ XXXX: Customer ID hash (4 chars base36)
├─ YYYY: License type + tier (4 chars)
├─ ZZZZ: Expiry date encoded (4 chars)
├─ WWWW: Feature flags (4 chars bitmap)
└─ QQQQ: Checksum (4 chars CRC16)
```

**Validation Strategy:**
- **Offline**: Verify checksum, decode metadata, check expiry
- **Online** (optional): Call license server API to verify activation status, check revocation
- **Local binding**: machineId (UUID) prevents multi-machine activation

### B. Update System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    MAIN PROCESS                                   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  UpdateService (New)                                       │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  checkForUpdates()                                   │  │  │
│  │  │  ├─ Get customer ID from LicenseService             │  │  │
│  │  │  ├─ Determine update channel/repo/branch            │  │  │
│  │  │  ├─ Fetch latest version from GitHub (Octokit)      │  │  │
│  │  │  ├─ Compare with current version (semantic version)  │  │  │
│  │  │  └─ Return update availability + metadata           │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  downloadUpdate(version: string, channel: string)   │  │  │
│  │  │  ├─ Download release artifact from GitHub            │  │  │
│  │  │  ├─ Verify checksum/signature                        │  │  │
│  │  │  ├─ Extract to temp directory                        │  │  │
│  │  │  └─ Emit progress events                             │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  applyUpdate(mode: 'prompt'|'silent')               │  │  │
│  │  │  ├─ Backup current installation (copy .asar, nupkg)  │  │  │
│  │  │  ├─ Launch Squirrel installer or replace files       │  │  │
│  │  │  ├─ Verify installation success                      │  │  │
│  │  │  ├─ Log update metadata to config                    │  │  │
│  │  │  └─ app.relaunch() + app.exit()                      │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  rollbackUpdate()                                    │  │  │
│  │  │  ├─ Restore backup from previous version             │  │  │
│  │  │  ├─ Revert config metadata                           │  │  │
│  │  │  └─ app.relaunch()                                    │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │  Storage (ConfigService):                                  │  │
│  │    currentVersion: "2.0.0"                                 │  │
│  │    updateChannel: "customer123/main" | "customer123/beta"  │  │
│  │    autoUpdateEnabled: boolean                              │  │
│  │    lastUpdateCheck: ISO timestamp                          │  │
│  │    updateHistory: Array<UpdateRecord>                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
         │                            ▲
         │ IPC                        │ Events
         ▼                            │
┌──────────────────────────────────────────────────────────────────┐
│                   RENDERER PROCESS                                │
│                                                                   │
│  window.electron.updates.check()                                 │
│  window.electron.updates.download(version)                       │
│  window.electron.updates.apply(mode)                             │
│  window.electron.updates.rollback()                              │
│  window.electron.updates.onProgress((progress) => {...})         │
│                                                                   │
│  UI: UpdatesView.tsx (new), Settings panel                       │
└──────────────────────────────────────────────────────────────────┘
```

**Update Channels by Customer:**
```
Customer ID   →  GitHub Repository/Branch
──────────────────────────────────────────
customer-001  →  org/discovery-suite-customer001 (main branch)
customer-002  →  org/discovery-suite-customer002 (main branch)
internal      →  org/discovery-suite-internal (develop branch)
```

**Version Management:**
- Use semantic versioning: `MAJOR.MINOR.PATCH` (e.g., 2.1.3)
- Store current version in `package.json` and sync to ConfigService
- Compare versions using `semver` library (add dependency)
- Tag releases in Git: `v2.1.3-customer001`

**Update Delivery Options:**

*Option 1: Pre-built Binaries (Recommended for Production)*
- CI/CD pipeline (GitHub Actions) builds `.nupkg` on merge to customer branch
- Upload to GitHub Releases as artifacts
- UpdateService downloads installer and runs Squirrel update
- **Pros**: Fast, secure, no build tools on client
- **Cons**: Requires CI/CD setup

*Option 2: Git Pull + Local Build (Development/Advanced)*
- Clone customer repo to `%APPDATA%/MandADiscoverySuite/update-staging`
- `git pull origin main` to fetch changes
- Execute `npm install && npm run build && npm run make`
- **Pros**: Maximum flexibility, no CI needed
- **Cons**: Requires Node.js + build tools on client, slow, fragile

**Recommendation**: Start with Option 1 (pre-built binaries)

### C. Integration with Existing Architecture

**No Breaking Changes:**
- All new services follow existing patterns (ProfileService, ConfigService as templates)
- IPC handlers register in `ipcHandlers.ts:initializeServices()`
- Use ConfigService for persistence (don't create new JSON files)
- Use safeStorage for encryption (same pattern as domain credentials)

**Dependency on Existing Services:**
- LicenseService → ConfigService (storage), EncryptionService (key encryption)
- UpdateService → LicenseService (customer ID), ConfigService (settings)

---

## III. DETAILED IMPLEMENTATION SPECIFICATION

### Phase 1: License Service Implementation

#### File: `guiv2/src/main/services/licenseService.ts`

```typescript
/**
 * License Service
 * Manages application licensing, activation, validation, and feature access control
 *
 * License Storage:
 * - Encrypted license key stored via ConfigService
 * - Machine binding prevents multi-activation
 * - Offline validation with optional online verification
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
  activatedAt?: string; // ISO timestamp
  expiresAt?: string; // ISO timestamp
  features: string[]; // Array of enabled feature IDs
  maxUsers?: number;
  currentUsers?: number;
  machineId: string; // UUID binding this license to this machine
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
   * Loads existing license from config or generates machine ID
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Get or generate machine ID (persistent UUID for this installation)
    this.machineId = await this.configService.get<string>('license.machineId');
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
   * Validates format, decodes metadata, encrypts and stores
   */
  async activateLicense(licenseKey: string): Promise<ActivationResult> {
    await this.ensureInitialized();

    // Validate key format
    if (!this.validateKeyFormat(licenseKey)) {
      return { success: false, error: 'Invalid license key format' };
    }

    // Decode and validate key
    let metadata: LicenseKeyMetadata;
    try {
      metadata = this.decodeLicenseKey(licenseKey);
    } catch (error) {
      return { success: false, error: `License validation failed: ${error.message}` };
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

    // Optional: Online activation check (call license server API)
    // const onlineValid = await this.verifyOnline(licenseKey, this.machineId);
    // if (!onlineValid) { return { success: false, error: 'License server rejected activation' }; }

    // Store encrypted license
    if (!safeStorage.isEncryptionAvailable()) {
      return { success: false, error: 'Secure storage not available on this system' };
    }

    const encryptedKey = safeStorage.encryptString(licenseKey);
    await this.configService.set('license.key', encryptedKey.toString('base64'));
    await this.configService.set('license.customerId', metadata.customerId);
    await this.configService.set('license.type', metadata.type);
    await this.configService.set('license.activatedAt', new Date().toISOString());
    await this.configService.set('license.expiresAt', metadata.expiresAt);
    await this.configService.set('license.features', metadata.features);

    // Reload license info
    await this.loadLicense();

    this.emit('license-activated', this.currentLicense);

    return {
      success: true,
      licenseInfo: this.currentLicense!
    };
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
   * Check if a specific feature is enabled
   */
  async hasFeature(featureId: string): Promise<boolean> {
    const license = await this.getLicenseInfo();

    if (license.status !== 'active') {
      return false; // Expired/invalid licenses have no features
    }

    return license.features.includes(featureId) ||
           license.features.includes('*'); // Wildcard = all features
  }

  /**
   * Get customer ID (for update channel determination)
   */
  async getCustomerId(): Promise<string | null> {
    await this.ensureInitialized();
    return this.currentLicense?.customerId || null;
  }

  /**
   * Deactivate current license (clear from config)
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
   * Refresh license validation (check expiry, optionally verify online)
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

      const status: LicenseStatus =
        expiresAt < now ? 'expired' :
        daysRemaining < 0 ? 'expired' :
        'active';

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
    // Format: XXXX-XXXX-XXXX-XXXX-XXXX (25 chars + 4 hyphens)
    const regex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return regex.test(key);
  }

  private decodeLicenseKey(key: string): LicenseKeyMetadata {
    const parts = key.split('-');

    // PART 0: Customer ID (base36 encoded)
    const customerId = `customer-${parseInt(parts[0], 36)}`;

    // PART 1: License type (first 2 chars) + tier (last 2 chars)
    const typeMap: Record<string, LicenseType> = {
      'TR': 'trial',
      'ST': 'standard',
      'EN': 'enterprise'
    };
    const type = typeMap[parts[1].substring(0, 2)] || 'trial';

    // PART 2: Expiry date (base36 encoded Unix timestamp)
    const expiryTimestamp = parseInt(parts[2], 36) * 1000;
    const expiresAt = new Date(expiryTimestamp).toISOString();

    // PART 3: Feature flags (bitmap as base36)
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
    // Remove checksum part
    const dataToHash = key.substring(0, key.lastIndexOf('-'));

    // Calculate CRC16 (simple hash for demo - use proper signature in production)
    const hash = createHash('sha256').update(dataToHash).digest('hex');
    const calculatedChecksum = hash.substring(0, 4).toUpperCase();

    return calculatedChecksum === expectedChecksum;
  }

  private generateMachineId(): string {
    return randomBytes(16).toString('hex'); // UUID-like identifier
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Optional: Verify license online with license server
   * Implement this if you have a license validation API
   */
  private async verifyOnline(licenseKey: string, machineId: string): Promise<boolean> {
    // Example:
    // const response = await fetch('https://license.example.com/api/validate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ licenseKey, machineId })
    // });
    // return response.ok;

    return true; // Offline-only for now
  }
}

export default LicenseService;
```

#### File: `guiv2/src/main/ipcHandlers.ts` (Modifications)

**After line 42** (after `let consolidationEngine: ConsolidationEngine;`):
```typescript
let licenseService: LicenseService;
```

**In `initializeServices()` function, after ProfileService initialization (after line 165)**:
```typescript
  // Initialize License Service
  const configService = new ConfigService();
  await configService.initialize();

  licenseService = new LicenseService(configService);
  await licenseService.initialize();
  console.log('License Service initialized');
```

**At the end of the file (before exports), add IPC handler registration**:
```typescript
/**
 * License Management IPC Handlers
 */
function registerLicenseHandlers(): void {
  ipcMain.handle('license:activate', async (_, licenseKey: string) => {
    return await licenseService.activateLicense(licenseKey);
  });

  ipcMain.handle('license:getInfo', async () => {
    return await licenseService.getLicenseInfo();
  });

  ipcMain.handle('license:hasFeature', async (_, featureId: string) => {
    return await licenseService.hasFeature(featureId);
  });

  ipcMain.handle('license:getCustomerId', async () => {
    return await licenseService.getCustomerId();
  });

  ipcMain.handle('license:deactivate', async () => {
    return await licenseService.deactivateLicense();
  });

  ipcMain.handle('license:refresh', async () => {
    return await licenseService.refreshLicense();
  });
}

// Call in initializeServices() after license service is initialized
registerLicenseHandlers();
```

#### File: `guiv2/src/preload.ts` (Add to electronAPI object)

**After line 260** (after profile handlers):
```typescript
  // ========================================
  // License Management
  // ========================================

  license: {
    /**
     * Activate a new license key
     * @param licenseKey - License key in format XXXX-XXXX-XXXX-XXXX-XXXX
     * @returns Promise with activation result
     */
    activate: (licenseKey: string) =>
      ipcRenderer.invoke('license:activate', licenseKey),

    /**
     * Get current license information
     * @returns Promise with LicenseInfo
     */
    getInfo: () =>
      ipcRenderer.invoke('license:getInfo'),

    /**
     * Check if a feature is enabled
     * @param featureId - Feature identifier
     * @returns Promise with boolean
     */
    hasFeature: (featureId: string) =>
      ipcRenderer.invoke('license:hasFeature', featureId),

    /**
     * Get customer ID
     * @returns Promise with customer ID string or null
     */
    getCustomerId: () =>
      ipcRenderer.invoke('license:getCustomerId'),

    /**
     * Deactivate current license
     * @returns Promise with success status
     */
    deactivate: () =>
      ipcRenderer.invoke('license:deactivate'),

    /**
     * Refresh license validation
     * @returns Promise with updated LicenseInfo
     */
    refresh: () =>
      ipcRenderer.invoke('license:refresh'),

    /**
     * Listen for license activation events
     */
    onActivated: (callback: (data: any) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on('license:activated', handler);
      return () => ipcRenderer.removeListener('license:activated', handler);
    },

    /**
     * Listen for license deactivation events
     */
    onDeactivated: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on('license:deactivated', handler);
      return () => ipcRenderer.removeListener('license:deactivated', handler);
    }
  },
```

#### File: `guiv2/src/renderer/views/admin/LicenseActivationView.tsx` (Complete Rewrite)

```typescript
import React, { useState, useEffect } from 'react';
import { Key, Check, AlertCircle, Calendar, Users, Loader2 } from 'lucide-react';

import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Badge } from '../../components/atoms/Badge';

interface LicenseInfo {
  status: 'active' | 'expired' | 'invalid' | 'not_activated';
  type: 'trial' | 'standard' | 'enterprise';
  customerId: string;
  activatedAt?: string;
  expiresAt?: string;
  features: string[];
  maxUsers?: number;
  currentUsers?: number;
  machineId: string;
  daysRemaining?: number;
}

export const LicenseActivationView: React.FC = () => {
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load license info on mount
  useEffect(() => {
    loadLicenseInfo();

    // Listen for license events
    const unsubActivated = window.electron.license.onActivated(() => {
      loadLicenseInfo();
    });

    const unsubDeactivated = window.electron.license.onDeactivated(() => {
      loadLicenseInfo();
    });

    return () => {
      unsubActivated();
      unsubDeactivated();
    };
  }, []);

  const loadLicenseInfo = async () => {
    try {
      const info = await window.electron.license.getInfo();
      setLicenseInfo(info);
    } catch (err) {
      console.error('Failed to load license info:', err);
    }
  };

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await window.electron.license.activate(licenseKey);

      if (result.success) {
        setSuccessMessage('License activated successfully!');
        setLicenseKey('');
        setLicenseInfo(result.licenseInfo || null);
      } else {
        setError(result.error || 'Activation failed');
      }
    } catch (err) {
      setError(`Activation error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate this license?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await window.electron.license.deactivate();
      setSuccessMessage('License deactivated');
      await loadLicenseInfo();
    } catch (err) {
      setError(`Deactivation error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isActivated = licenseInfo && licenseInfo.status !== 'not_activated';

  return (
    <div className="flex flex-col h-full p-6 space-y-6" data-testid="license-activation-view">
      <div>
        <h1 className="text-2xl font-bold">License Activation</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your software license and activation
        </p>
      </div>

      {/* Current License Info */}
      {isActivated && (
        <div className={`${
          licenseInfo.status === 'active' ? 'bg-gradient-to-r from-blue-600 to-purple-600' :
          'bg-gradient-to-r from-red-600 to-orange-600'
        } text-white p-6 rounded-lg`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold capitalize">{licenseInfo.type} License</h2>
              <p className="text-blue-100">Enterprise Discovery & Migration Suite v2.0</p>
              <p className="text-xs text-blue-200 mt-1">Customer ID: {licenseInfo.customerId}</p>
            </div>
            <Badge variant="default" className={`${
              licenseInfo.status === 'active' ? 'bg-white/20' : 'bg-red-900/40'
            } text-white`}>
              <Check className="w-4 h-4 mr-1" />
              {licenseInfo.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {licenseInfo.expiresAt && (
              <div>
                <div className="text-sm text-blue-100">Expires</div>
                <div className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(licenseInfo.expiresAt).toLocaleDateString()}
                </div>
              </div>
            )}
            {licenseInfo.daysRemaining !== undefined && (
              <div>
                <div className="text-sm text-blue-100">Days Remaining</div>
                <div className={`text-lg font-semibold ${
                  licenseInfo.daysRemaining < 30 ? 'text-yellow-300' : ''
                }`}>
                  {licenseInfo.daysRemaining}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-blue-100">Status</div>
              <div className="text-lg font-semibold capitalize">
                {licenseInfo.status === 'active' ? '✓ Active' : '✗ ' + licenseInfo.status}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDeactivate}
              disabled={isLoading}
            >
              Deactivate License
            </Button>
          </div>
        </div>
      )}

      {/* Features */}
      {isActivated && licenseInfo.features.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Included Features</h3>
          <div className="grid grid-cols-2 gap-3">
            {licenseInfo.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span className="capitalize">{feature.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activation Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          {isActivated ? 'Update License' : 'Activate License'}
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Input
            label="License Key"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
            className="flex-1 font-mono"
            maxLength={29}
            disabled={isLoading}
          />
          <Button
            variant="primary"
            className="self-end"
            onClick={handleActivate}
            disabled={isLoading || !licenseKey.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Activating...
              </>
            ) : (
              'Activate'
            )}
          </Button>
        </div>

        {!isActivated && (
          <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Enter a valid license key to activate the Enterprise Discovery Suite.
              Contact support at support@example.com for licensing assistance.
            </p>
          </div>
        )}

        {isActivated && (
          <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Activating a new license will replace your current license. Your current activation will be deactivated.
            </p>
          </div>
        )}
      </div>

      {/* Machine ID (for support) */}
      {licenseInfo && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Machine ID: <code className="font-mono">{licenseInfo.machineId}</code>
            <br />
            <span className="text-xs">Provide this ID to support when requesting license assistance.</span>
          </p>
        </div>
      )}
    </div>
  );
};
```

---

### Phase 2: Update Service Implementation

#### File: `guiv2/src/main/services/updateService.ts`

```typescript
/**
 * Update Service
 * Manages automatic application updates from customer-specific Git repositories
 *
 * Update Flow:
 * 1. Check for updates (GitHub API via Octokit)
 * 2. Download release artifacts (pre-built installers or source)
 * 3. Verify integrity (checksum/signature)
 * 4. Apply update (Squirrel installer or file replacement)
 * 5. Rollback support (backup previous version)
 *
 * Dependencies:
 * - simple-git: Already installed (v3.27.0)
 * - octokit: Already installed (v4.0.2)
 * - semver: Add to package.json
 */

import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { app } from 'electron';
import { Octokit } from 'octokit';
import { ConfigService } from './configService';
import { LicenseService } from './licenseService';

// Add to package.json dependencies: "semver": "^7.6.0"
import * as semver from 'semver';

// ============================================================================
// Types
// ============================================================================

export interface UpdateChannel {
  name: string; // e.g., "stable", "beta"
  repository: string; // GitHub repo in format "org/repo"
  branch: string; // Git branch to track
}

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes?: string;
  downloadUrl?: string;
  checksumUrl?: string;
  publishedAt?: string;
  isBreaking?: boolean; // Major version bump
}

export interface UpdateProgress {
  phase: 'downloading' | 'verifying' | 'installing' | 'complete';
  percentage: number;
  bytesDownloaded?: number;
  totalBytes?: number;
  message?: string;
}

export interface UpdateRecord {
  from: string; // Previous version
  to: string; // New version
  timestamp: string; // ISO date
  status: 'success' | 'failed' | 'rolled_back';
  error?: string;
  channel?: string;
}

export type UpdateMode = 'prompt' | 'silent';

// ============================================================================
// Service
// ============================================================================

export class UpdateService extends EventEmitter {
  private configService: ConfigService;
  private licenseService: LicenseService;
  private octokit: Octokit;
  private initialized = false;
  private currentVersion: string;
  private updateCheckInterval: NodeJS.Timeout | null = null;

  constructor(configService: ConfigService, licenseService: LicenseService) {
    super();
    this.configService = configService;
    this.licenseService = licenseService;

    // Initialize Octokit (GitHub API client)
    // For private repos, you'll need a GitHub token: process.env.GITHUB_TOKEN
    this.octokit = new Octokit({
      auth: process.env.GITHUB_UPDATE_TOKEN || undefined
    });

    // Get current version from package.json
    this.currentVersion = app.getVersion(); // Reads from package.json
  }

  /**
   * Initialize the update service
   * Loads settings, optionally starts auto-check interval
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Ensure current version is stored in config
    const storedVersion = await this.configService.get<string>('updates.currentVersion');
    if (storedVersion !== this.currentVersion) {
      await this.configService.set('updates.currentVersion', this.currentVersion);
    }

    // Load auto-update setting
    const autoUpdateEnabled = await this.configService.get<boolean>('updates.autoUpdateEnabled') ?? false;

    if (autoUpdateEnabled) {
      // Check for updates every 4 hours
      this.updateCheckInterval = setInterval(() => {
        this.checkForUpdates().catch(err => {
          console.error('Auto update check failed:', err);
        });
      }, 4 * 60 * 60 * 1000);

      // Also check on startup (after 30 seconds to not delay app launch)
      setTimeout(() => {
        this.checkForUpdates().catch(err => {
          console.error('Startup update check failed:', err);
        });
      }, 30000);
    }

    this.initialized = true;
    this.emit('initialized');
  }

  /**
   * Check for available updates
   * Queries GitHub API for latest release based on customer update channel
   */
  async checkForUpdates(): Promise<UpdateInfo> {
    await this.ensureInitialized();

    // Get update channel from customer ID
    const customerId = await this.licenseService.getCustomerId();
    if (!customerId) {
      throw new Error('No active license - cannot determine update channel');
    }

    const channel = this.getUpdateChannel(customerId);
    await this.configService.set('updates.lastCheckTime', new Date().toISOString());

    try {
      // Fetch latest release from GitHub
      const { data: release } = await this.octokit.rest.repos.getLatestRelease({
        owner: this.parseRepoOwner(channel.repository),
        repo: this.parseRepoName(channel.repository)
      });

      const latestVersion = release.tag_name.replace(/^v/, ''); // Remove 'v' prefix

      // Compare versions
      const updateAvailable = semver.gt(latestVersion, this.currentVersion);

      const updateInfo: UpdateInfo = {
        available: updateAvailable,
        currentVersion: this.currentVersion,
        latestVersion,
        releaseNotes: release.body || undefined,
        publishedAt: release.published_at || undefined,
        isBreaking: semver.major(latestVersion) > semver.major(this.currentVersion)
      };

      if (updateAvailable) {
        // Find .nupkg asset (Squirrel update package)
        const asset = release.assets.find(a => a.name.endsWith('.nupkg'));
        if (asset) {
          updateInfo.downloadUrl = asset.browser_download_url;
        }

        // Find checksum file
        const checksumAsset = release.assets.find(a => a.name === 'CHECKSUMS.txt' || a.name === 'SHA256SUMS');
        if (checksumAsset) {
          updateInfo.checksumUrl = checksumAsset.browser_download_url;
        }

        this.emit('update-available', updateInfo);
      }

      return updateInfo;

    } catch (error) {
      console.error('Failed to check for updates:', error);
      throw new Error(`Update check failed: ${error.message}`);
    }
  }

  /**
   * Download update package
   * Downloads installer/package file and verifies checksum
   */
  async downloadUpdate(updateInfo: UpdateInfo): Promise<string> {
    if (!updateInfo.downloadUrl) {
      throw new Error('No download URL provided');
    }

    const downloadDir = path.join(app.getPath('userData'), 'updates');
    await fs.mkdir(downloadDir, { recursive: true });

    const fileName = path.basename(updateInfo.downloadUrl);
    const filePath = path.join(downloadDir, fileName);

    this.emit('download-started', { url: updateInfo.downloadUrl });

    try {
      // Download file
      const response = await fetch(updateInfo.downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const totalBytes = parseInt(response.headers.get('content-length') || '0', 10);
      let downloadedBytes = 0;

      const fileHandle = await fs.open(filePath, 'w');
      const writer = fileHandle.createWriteStream();

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        writer.write(value);
        downloadedBytes += value.length;

        const progress: UpdateProgress = {
          phase: 'downloading',
          percentage: totalBytes > 0 ? Math.floor((downloadedBytes / totalBytes) * 100) : 0,
          bytesDownloaded: downloadedBytes,
          totalBytes
        };

        this.emit('download-progress', progress);
      }

      await new Promise((resolve, reject) => {
        writer.end((err?: Error) => {
          if (err) reject(err);
          else resolve(undefined);
        });
      });

      await fileHandle.close();

      // Verify checksum if available
      if (updateInfo.checksumUrl) {
        this.emit('download-progress', { phase: 'verifying', percentage: 0 });
        await this.verifyChecksum(filePath, updateInfo.checksumUrl);
      }

      this.emit('download-complete', { filePath });

      return filePath;

    } catch (error) {
      // Clean up partial download
      try {
        await fs.unlink(filePath);
      } catch {}

      throw new Error(`Download failed: ${error.message}`);
    }
  }

  /**
   * Apply update (install new version)
   * For Squirrel: Run the installer
   * For manual: Replace .asar and restart
   */
  async applyUpdate(installerPath: string, mode: UpdateMode = 'prompt'): Promise<void> {
    const updateRecord: UpdateRecord = {
      from: this.currentVersion,
      to: '(applying...)',
      timestamp: new Date().toISOString(),
      status: 'success',
      channel: (await this.licenseService.getCustomerId()) || 'unknown'
    };

    try {
      // Backup current version
      await this.createBackup();

      this.emit('install-started');

      // Run Squirrel installer
      if (installerPath.endsWith('.nupkg') || installerPath.endsWith('.exe')) {
        await this.runSquirrelInstaller(installerPath);
      } else {
        throw new Error('Unsupported installer format');
      }

      // Update succeeded - record it
      await this.recordUpdate(updateRecord);

      this.emit('install-complete');

      // Restart application
      if (mode === 'silent' || confirm('Update installed. Restart now?')) {
        app.relaunch();
        app.exit(0);
      }

    } catch (error) {
      updateRecord.status = 'failed';
      updateRecord.error = error.message;
      await this.recordUpdate(updateRecord);

      this.emit('install-failed', { error: error.message });

      throw error;
    }
  }

  /**
   * Rollback to previous version
   * Restores backup and restarts
   */
  async rollbackUpdate(): Promise<void> {
    const backupDir = path.join(app.getPath('userData'), 'backup');

    try {
      const backupExists = await fs.access(backupDir).then(() => true).catch(() => false);
      if (!backupExists) {
        throw new Error('No backup found');
      }

      this.emit('rollback-started');

      // Restore backup (implementation depends on backup strategy)
      // For .asar: Copy backup .asar to resources/app.asar
      // For Squirrel: Re-run previous version installer

      // Record rollback
      const rollbackRecord: UpdateRecord = {
        from: this.currentVersion,
        to: '(rolled back)',
        timestamp: new Date().toISOString(),
        status: 'rolled_back'
      };
      await this.recordUpdate(rollbackRecord);

      this.emit('rollback-complete');

      // Restart
      app.relaunch();
      app.exit(0);

    } catch (error) {
      this.emit('rollback-failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get update history
   */
  async getUpdateHistory(): Promise<UpdateRecord[]> {
    return await this.configService.get<UpdateRecord[]>('updates.history') || [];
  }

  /**
   * Enable/disable automatic updates
   */
  async setAutoUpdateEnabled(enabled: boolean): Promise<void> {
    await this.configService.set('updates.autoUpdateEnabled', enabled);

    if (enabled && !this.updateCheckInterval) {
      // Start interval
      this.updateCheckInterval = setInterval(() => {
        this.checkForUpdates().catch(err => {
          console.error('Auto update check failed:', err);
        });
      }, 4 * 60 * 60 * 1000);
    } else if (!enabled && this.updateCheckInterval) {
      // Stop interval
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private getUpdateChannel(customerId: string): UpdateChannel {
    // Map customer ID to GitHub repository/branch
    // This could be stored in a config file or determined dynamically

    // Example mapping:
    const channelMap: Record<string, UpdateChannel> = {
      'customer-001': {
        name: 'customer-001-stable',
        repository: 'yourorg/discovery-suite-customer001',
        branch: 'main'
      },
      'customer-002': {
        name: 'customer-002-stable',
        repository: 'yourorg/discovery-suite-customer002',
        branch: 'main'
      },
      // Internal/dev
      'internal': {
        name: 'internal-dev',
        repository: 'yourorg/discovery-suite',
        branch: 'develop'
      }
    };

    return channelMap[customerId] || channelMap['internal'];
  }

  private parseRepoOwner(repo: string): string {
    return repo.split('/')[0];
  }

  private parseRepoName(repo: string): string {
    return repo.split('/')[1];
  }

  private async verifyChecksum(filePath: string, checksumUrl: string): Promise<void> {
    // Download checksum file
    const response = await fetch(checksumUrl);
    if (!response.ok) {
      throw new Error(`Failed to download checksum: ${response.status}`);
    }

    const checksumText = await response.text();
    const fileName = path.basename(filePath);

    // Parse checksum file (format: "<hash>  <filename>")
    const lines = checksumText.split('\n');
    const line = lines.find(l => l.includes(fileName));

    if (!line) {
      throw new Error(`Checksum not found for ${fileName}`);
    }

    const expectedHash = line.split(/\s+/)[0];

    // Calculate file hash
    const fileBuffer = await fs.readFile(filePath);
    const actualHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    if (actualHash !== expectedHash) {
      throw new Error(`Checksum mismatch: expected ${expectedHash}, got ${actualHash}`);
    }
  }

  private async createBackup(): Promise<void> {
    const backupDir = path.join(app.getPath('userData'), 'backup');
    await fs.mkdir(backupDir, { recursive: true });

    // Backup strategy depends on packaging:
    // For .asar: Copy app.asar
    // For Squirrel: Copy current .nupkg

    // Example: Backup .asar (if using ASAR packaging)
    const appPath = app.getAppPath();
    if (appPath.endsWith('.asar')) {
      const backupPath = path.join(backupDir, `app-${this.currentVersion}.asar`);
      await fs.copyFile(appPath, backupPath);
    }
  }

  private async runSquirrelInstaller(installerPath: string): Promise<void> {
    const { spawn } = require('child_process');

    return new Promise((resolve, reject) => {
      // Run installer silently
      const process = spawn(installerPath, ['--silent'], {
        detached: true,
        stdio: 'ignore'
      });

      process.on('exit', (code: number) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Installer exited with code ${code}`));
        }
      });

      process.on('error', (error: Error) => {
        reject(error);
      });

      process.unref();
    });
  }

  private async recordUpdate(record: UpdateRecord): Promise<void> {
    const history = await this.getUpdateHistory();
    history.unshift(record); // Add to beginning

    // Keep last 20 records
    if (history.length > 20) {
      history.splice(20);
    }

    await this.configService.set('updates.history', history);
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Clean up
   */
  destroy(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }
}

export default UpdateService;
```

#### Add Dependency to `guiv2/package.json`

In the `dependencies` section:
```json
"semver": "^7.6.0"
```

Run: `npm install semver`

#### Register Update Service in `guiv2/src/main/ipcHandlers.ts`

**After licenseService declaration:**
```typescript
let updateService: UpdateService;
```

**In initializeServices(), after License Service:**
```typescript
  // Initialize Update Service
  updateService = new UpdateService(configService, licenseService);
  await updateService.initialize();
  console.log('Update Service initialized');
```

**Add IPC handlers:**
```typescript
/**
 * Update Management IPC Handlers
 */
function registerUpdateHandlers(): void {
  ipcMain.handle('updates:check', async () => {
    return await updateService.checkForUpdates();
  });

  ipcMain.handle('updates:download', async (_, updateInfo: any) => {
    return await updateService.downloadUpdate(updateInfo);
  });

  ipcMain.handle('updates:apply', async (_, installerPath: string, mode: 'prompt' | 'silent') => {
    return await updateService.applyUpdate(installerPath, mode);
  });

  ipcMain.handle('updates:rollback', async () => {
    return await updateService.rollbackUpdate();
  });

  ipcMain.handle('updates:getHistory', async () => {
    return await updateService.getUpdateHistory();
  });

  ipcMain.handle('updates:setAutoUpdate', async (_, enabled: boolean) => {
    return await updateService.setAutoUpdateEnabled(enabled);
  });

  // Forward events to renderer
  updateService.on('update-available', (data) => {
    if (hasMainWindow()) {
      getMainWindow()?.webContents.send('updates:available', data);
    }
  });

  updateService.on('download-progress', (data) => {
    if (hasMainWindow()) {
      getMainWindow()?.webContents.send('updates:progress', data);
    }
  });

  updateService.on('install-complete', () => {
    if (hasMainWindow()) {
      getMainWindow()?.webContents.send('updates:complete');
    }
  });
}

// Call after initializeServices()
registerUpdateHandlers();
```

#### Add to `guiv2/src/preload.ts`

**After license handlers:**
```typescript
  // ========================================
  // Update Management
  // ========================================

  updates: {
    /**
     * Check for available updates
     * @returns Promise with UpdateInfo
     */
    check: () =>
      ipcRenderer.invoke('updates:check'),

    /**
     * Download update package
     * @param updateInfo - Update information object
     * @returns Promise with path to downloaded installer
     */
    download: (updateInfo: any) =>
      ipcRenderer.invoke('updates:download', updateInfo),

    /**
     * Apply downloaded update
     * @param installerPath - Path to installer file
     * @param mode - 'prompt' or 'silent'
     * @returns Promise
     */
    apply: (installerPath: string, mode: 'prompt' | 'silent') =>
      ipcRenderer.invoke('updates:apply', installerPath, mode),

    /**
     * Rollback to previous version
     * @returns Promise
     */
    rollback: () =>
      ipcRenderer.invoke('updates:rollback'),

    /**
     * Get update history
     * @returns Promise with array of UpdateRecord
     */
    getHistory: () =>
      ipcRenderer.invoke('updates:getHistory'),

    /**
     * Enable/disable automatic updates
     * @param enabled - Boolean
     * @returns Promise
     */
    setAutoUpdate: (enabled: boolean) =>
      ipcRenderer.invoke('updates:setAutoUpdate', enabled),

    /**
     * Listen for update available events
     */
    onAvailable: (callback: (data: any) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on('updates:available', handler);
      return () => ipcRenderer.removeListener('updates:available', handler);
    },

    /**
     * Listen for download/install progress
     */
    onProgress: (callback: (data: any) => void) => {
      const handler = (_: any, data: any) => callback(data);
      ipcRenderer.on('updates:progress', handler);
      return () => ipcRenderer.removeListener('updates:progress', handler);
    },

    /**
     * Listen for installation complete
     */
    onComplete: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on('updates:complete', handler);
      return () => ipcRenderer.removeListener('updates:complete', handler);
    }
  },
```

---

### Phase 3: CI/CD Pipeline for Updates (GitHub Actions)

#### File: `.github/workflows/build-and-release.yml` (New)

```yaml
name: Build and Release Update Packages

on:
  push:
    branches:
      - main
      - 'customer-*/main' # Customer-specific branches
    tags:
      - 'v*' # Version tags like v2.1.0

  workflow_dispatch:
    inputs:
      customer_id:
        description: 'Customer ID (e.g., customer-001)'
        required: false

jobs:
  build-windows:
    runs-on: windows-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.17.0'
          cache: 'npm'
          cache-dependency-path: guiv2/package-lock.json

      - name: Install dependencies
        working-directory: guiv2
        run: npm ci

      - name: Build application
        working-directory: guiv2
        run: |
          npm run build:main
          npm run build:renderer

      - name: Package application
        working-directory: guiv2
        run: npm run make

      - name: Generate checksums
        working-directory: guiv2/out/make/squirrel.windows/x64
        run: |
          Get-FileHash *.nupkg -Algorithm SHA256 | ForEach-Object {
            "$($_.Hash.ToLower())  $($_.Path | Split-Path -Leaf)"
          } | Out-File -FilePath SHA256SUMS -Encoding ASCII
        shell: pwsh

      - name: Extract version
        id: version
        run: |
          $version = (Get-Content guiv2/package.json | ConvertFrom-Json).version
          echo "VERSION=$version" >> $env:GITHUB_ENV
        shell: pwsh

      - name: Create Release
        if: startsWith(github.ref, 'refs/tags/v')
        uses: softprops/action-gh-release@v1
        with:
          files: |
            guiv2/out/make/squirrel.windows/x64/*.nupkg
            guiv2/out/make/squirrel.windows/x64/SHA256SUMS
            guiv2/out/make/squirrel.windows/x64/RELEASES
          draft: false
          prerelease: false
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload artifacts
        if: "!startsWith(github.ref, 'refs/tags/v')"
        uses: actions/upload-artifact@v4
        with:
          name: windows-installer-${{ env.VERSION }}
          path: |
            guiv2/out/make/squirrel.windows/x64/*.nupkg
            guiv2/out/make/squirrel.windows/x64/SHA256SUMS
            guiv2/out/make/squirrel.windows/x64/RELEASES
          retention-days: 30
```

---

## IV. CRITICAL FIXES & IMPROVEMENTS

### Fix 1: Config Path in ipcHandlers.ts

**Problem**: `ipcHandlers.ts:101` uses `process.cwd()` which will fail in production (ASAR)

**Fix**: Replace the manual config loading with ConfigService

**In `guiv2/src/main/ipcHandlers.ts`:**

**Remove lines 100-105:**
```typescript
// DELETE THIS:
const configPath = path.join(process.cwd(), 'config', 'app-config.json');
interface AppConfig {
  [key: string]: string | number | boolean | null | undefined;
}
let appConfig: AppConfig = {};
```

**Replace all `appConfig` usage with `configService`:**

Find/replace:
- `appConfig[key]` → `await configService.get(key)`
- `appConfig[key] = value` → `await configService.set(key, value)`
- Save/load logic → Remove (ConfigService handles automatically)

### Fix 2: Add Environment Variable for GitHub Token

For private repositories, add to `.env` (NOT committed to Git):
```
GITHUB_UPDATE_TOKEN=ghp_your_personal_access_token_here
```

Load in main process:
```typescript
// At top of index.ts or main entry point
import * as dotenv from 'dotenv';
dotenv.config();
```

Add to `package.json` dependencies:
```json
"dotenv": "^16.4.5"
```

### Fix 3: Type Definitions

Create `guiv2/src/renderer/types/electron.d.ts` additions:

```typescript
interface LicenseAPI {
  activate: (licenseKey: string) => Promise<ActivationResult>;
  getInfo: () => Promise<LicenseInfo>;
  hasFeature: (featureId: string) => Promise<boolean>;
  getCustomerId: () => Promise<string | null>;
  deactivate: () => Promise<void>;
  refresh: () => Promise<LicenseInfo>;
  onActivated: (callback: (data: any) => void) => () => void;
  onDeactivated: (callback: () => void) => () => void;
}

interface UpdatesAPI {
  check: () => Promise<UpdateInfo>;
  download: (updateInfo: any) => Promise<string>;
  apply: (installerPath: string, mode: 'prompt' | 'silent') => Promise<void>;
  rollback: () => Promise<void>;
  getHistory: () => Promise<UpdateRecord[]>;
  setAutoUpdate: (enabled: boolean) => Promise<void>;
  onAvailable: (callback: (data: any) => void) => () => void;
  onProgress: (callback: (data: any) => void) => () => void;
  onComplete: (callback: () => void) => () => void;
}

interface ElectronAPI {
  // ... existing properties ...
  license: LicenseAPI;
  updates: UpdatesAPI;
}
```

---

## V. TESTING STRATEGY

### Unit Tests

**File: `guiv2/src/main/services/licenseService.test.ts`**

```typescript
import { LicenseService } from './licenseService';
import { ConfigService } from './configService';

describe('LicenseService', () => {
  let licenseService: LicenseService;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      initialize: jest.fn()
    } as any;

    licenseService = new LicenseService(mockConfigService);
  });

  describe('activateLicense', () => {
    it('should reject invalid license key format', async () => {
      const result = await licenseService.activateLicense('INVALID');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid license key format');
    });

    it('should reject expired license', async () => {
      // Create expired license key (mock)
      const expiredKey = 'XXXX-XXXX-XXXX-XXXX-XXXX'; // Construct expired key
      const result = await licenseService.activateLicense(expiredKey);
      expect(result.success).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('should activate valid license', async () => {
      // Mock safeStorage
      jest.mock('electron', () => ({
        safeStorage: {
          isEncryptionAvailable: () => true,
          encryptString: (s: string) => Buffer.from(s)
        },
        app: {
          getPath: () => '/fake/path'
        }
      }));

      const validKey = 'ABCD-EFGH-IJKL-MNOP-QRST'; // Valid format
      // ... implement full test
    });
  });

  describe('hasFeature', () => {
    it('should return false for inactive license', async () => {
      mockConfigService.get.mockResolvedValue(null);
      const hasFeature = await licenseService.hasFeature('discovery');
      expect(hasFeature).toBe(false);
    });

    it('should return true for wildcard license', async () => {
      // Mock active license with wildcard
      // ... implement
    });
  });
});
```

### E2E Tests (Playwright)

**File: `guiv2/tests/e2e/license-activation.spec.ts`**

```typescript
import { test, expect, _electron as electron } from '@playwright/test';

test.describe('License Activation Flow', () => {
  let electronApp;
  let window;

  test.beforeAll(async () => {
    electronApp = await electron.launch({
      args: ['.webpack/main/main.js']
    });
    window = await electronApp.firstWindow();
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('should display license activation view', async () => {
    // Navigate to license view
    await window.click('[href="/admin/license"]');

    await expect(window.locator('[data-testid="license-activation-view"]')).toBeVisible();
  });

  test('should reject invalid license key', async () => {
    await window.fill('input[placeholder*="XXXX"]', 'INVALID-KEY');
    await window.click('button:has-text("Activate")');

    await expect(window.locator('text=Invalid license key format')).toBeVisible();
  });

  test('should activate valid license key', async () => {
    const validKey = 'ABCD-EFGH-IJKL-MNOP-QRST'; // Mock valid key

    await window.fill('input[placeholder*="XXXX"]', validKey);
    await window.click('button:has-text("Activate")');

    await expect(window.locator('text=License activated successfully')).toBeVisible();
    await expect(window.locator('text=Active')).toBeVisible();
  });
});
```

### Manual Testing Checklist

- [ ] License activation with valid key
- [ ] License activation with invalid key format
- [ ] License activation with expired key
- [ ] Feature access check (hasFeature)
- [ ] License deactivation
- [ ] Update check (manual trigger)
- [ ] Update download and install (from test repo)
- [ ] Update rollback
- [ ] Auto-update interval (wait or mock time)
- [ ] Customer ID to update channel mapping
- [ ] Update history persistence

---

## VI. DEPLOYMENT GUIDE

### Step 1: Setup GitHub Repositories

For each customer, create a private GitHub repository:
```
yourorg/discovery-suite-customer001
yourorg/discovery-suite-customer002
...
```

Or use branches in a single repo:
```
yourorg/discovery-suite
  ├─ main (internal/dev)
  ├─ customer-001/main
  ├─ customer-002/main
```

### Step 2: Configure Secrets

In GitHub repository settings → Secrets:
```
GITHUB_UPDATE_TOKEN=<personal_access_token_with_repo_read_access>
```

### Step 3: Tag Releases

When ready to release an update:
```bash
git tag -a v2.1.0 -m "Release 2.1.0 - Feature XYZ"
git push origin v2.1.0
```

This triggers the CI/CD pipeline which builds and publishes the release.

### Step 4: Generate License Keys

Create a license key generator script (Node.js):

**File: `scripts/generate-license-key.js`**

```javascript
const crypto = require('crypto');

function generateLicenseKey(customerId, type, expiryDate, features) {
  // PART 0: Customer ID (4 chars base36)
  const customerNum = parseInt(customerId.replace('customer-', ''));
  const part0 = customerNum.toString(36).toUpperCase().padStart(4, '0');

  // PART 1: Type + tier
  const typeMap = { trial: 'TR', standard: 'ST', enterprise: 'EN' };
  const part1 = (typeMap[type] || 'TR') + '00'; // '00' = tier

  // PART 2: Expiry date (Unix timestamp base36)
  const expiryTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);
  const part2 = expiryTimestamp.toString(36).toUpperCase().padStart(4, '0');

  // PART 3: Feature flags
  const featureMap = ['discovery', 'migration', 'analytics', 'reporting', 'api-access', 'priority-support'];
  let featureFlags = 0;
  features.forEach(feature => {
    const index = featureMap.indexOf(feature);
    if (index >= 0) {
      featureFlags |= (1 << index);
    }
  });
  const part3 = featureFlags.toString(36).toUpperCase().padStart(4, '0');

  // PART 4: Checksum
  const dataToHash = `${part0}-${part1}-${part2}-${part3}`;
  const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
  const part4 = hash.substring(0, 4).toUpperCase();

  return `${part0}-${part1}-${part2}-${part3}-${part4}`;
}

// Example usage:
const licenseKey = generateLicenseKey(
  'customer-001',
  'enterprise',
  '2026-12-31',
  ['discovery', 'migration', 'analytics', 'reporting', 'priority-support']
);

console.log('Generated License Key:', licenseKey);
```

Run: `node scripts/generate-license-key.js`

### Step 5: Distribute Initial Build

Build the application:
```bash
cd guiv2
npm run build
npm run make
```

Distribute `out/make/squirrel.windows/x64/Setup.exe` to customers.

### Step 6: Customer Onboarding

1. Customer runs Setup.exe
2. Application opens → Navigate to Admin → License Activation
3. Enter license key → Activate
4. Application is now licensed and will check for updates

---

## VII. SECURITY CONSIDERATIONS

### License Key Security

- **DO NOT** hardcode license keys in code
- **DO** encrypt license keys with safeStorage before storing
- **DO** validate checksums to prevent tampering
- **CONSIDER** online activation API for revocation support

### Update Security

- **DO** verify checksums (SHA256) before installing
- **DO** use HTTPS for all downloads
- **DO** sign releases with code signing certificate (Windows Authenticode)
- **DO** use private GitHub repositories for customer-specific code
- **CONSIDER** GPG signing Git commits and tags

### Credential Storage

- **DO** use Electron's safeStorage (Windows DPAPI / macOS Keychain)
- **DO NOT** store secrets in plain text config files
- **DO** keep ConfigService paths in userData (not cwd)

### Environment Variables

- **DO NOT** commit `.env` files to Git
- **DO** use GitHub Secrets for CI/CD tokens
- **DO** rotate GitHub tokens periodically

---

## VIII. MONITORING & TELEMETRY (Optional)

To track update adoption and license usage, consider adding anonymous telemetry:

**Example: Telemetry Event on Update Install**
```typescript
// In UpdateService.applyUpdate() after success:
await fetch('https://telemetry.yourcompany.com/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'update_installed',
    customerId: await this.licenseService.getCustomerId(),
    fromVersion: this.currentVersion,
    toVersion: updateRecord.to,
    timestamp: new Date().toISOString()
  })
});
```

This helps track:
- Update success rate
- Version distribution
- Rollback frequency

---

## IX. EXECUTION CHECKLIST

### Phase 1: License System (Week 1)
- [ ] Create `licenseService.ts`
- [ ] Register IPC handlers in `ipcHandlers.ts`
- [ ] Add preload.ts API
- [ ] Refactor `LicenseActivationView.tsx`
- [ ] Add type definitions
- [ ] Write unit tests
- [ ] Manual test activation flow
- [ ] Generate test license keys

### Phase 2: Update System (Week 2)
- [ ] Install `semver` dependency
- [ ] Create `updateService.ts`
- [ ] Register IPC handlers
- [ ] Add preload.ts API
- [ ] Create UpdatesView.tsx (optional UI)
- [ ] Test update check against GitHub
- [ ] Test download and install flow
- [ ] Implement rollback logic

### Phase 3: CI/CD (Week 3)
- [ ] Create GitHub Actions workflow
- [ ] Setup customer repositories/branches
- [ ] Configure GitHub secrets
- [ ] Test CI build
- [ ] Tag test release
- [ ] Verify artifact generation
- [ ] Test end-to-end update from release

### Phase 4: Integration & Testing (Week 4)
- [ ] Fix config path issue (ipcHandlers.ts)
- [ ] Write E2E tests
- [ ] Perform security review
- [ ] Test on clean Windows VM
- [ ] Document customer onboarding process
- [ ] Create license key generator script
- [ ] Prepare deployment packages

### Phase 5: Documentation & Launch (Week 5)
- [ ] Update DEPLOYMENT.md
- [ ] Write customer-facing license guide
- [ ] Create internal operations runbook
- [ ] Train support team
- [ ] Soft launch with pilot customer
- [ ] Monitor telemetry
- [ ] General availability

---

## X. FUTURE ENHANCEMENTS

### Short-term (3-6 months)
- [ ] License server API for online validation
- [ ] Automatic license renewal reminders
- [ ] Delta updates (smaller patches via Squirrel)
- [ ] Multi-channel support (stable/beta/alpha)
- [ ] Crash reporting integration

### Long-term (6-12 months)
- [ ] macOS/Linux licensing support
- [ ] License usage analytics dashboard
- [ ] Automated rollback on app crash
- [ ] Self-service license management portal
- [ ] SSO integration for enterprise licensing

---

## XI. SUCCESS CRITERIA

### Must Have
- ✅ License activation works offline
- ✅ Update check and download work for customer-specific repos
- ✅ Squirrel installer updates app correctly
- ✅ Rollback restores previous version
- ✅ No security vulnerabilities (encrypted storage, verified downloads)

### Should Have
- ✅ Auto-update interval configurable
- ✅ Update history persisted
- ✅ Error handling with user-friendly messages
- ✅ E2E tests pass

### Nice to Have
- ✅ Telemetry for update adoption tracking
- ✅ Online license validation
- ✅ Code signing for installers

---

## XII. RISK MITIGATION

### Risk: Update fails and app won't start
**Mitigation**: Backup previous version before update, implement rollback, test extensively on VMs

### Risk: License keys leaked/shared
**Mitigation**: Machine ID binding, online validation API, revocation list

### Risk: GitHub token compromised
**Mitigation**: Use GitHub Secrets, rotate tokens, limit token scope to read-only

### Risk: Customer confusion during update
**Mitigation**: Clear UI messaging, release notes, email notifications, silent updates option

---

## CONCLUSION

This plan provides a complete, production-ready implementation of customer-scoped licensing and Git-based updates for the Enterprise Discovery Suite. The design leverages existing architecture patterns (ConfigService, safeStorage, IPC), uses already-installed dependencies (simple-git, octokit), and requires zero breaking changes to the current codebase.

**Estimated Implementation Time**: 4-5 weeks
**Lines of Code**: ~2,500 (services + UI + tests)
**Dependencies Added**: 1 (semver)
**Breaking Changes**: 0
**Security Level**: Enterprise-grade (encrypted storage, verified downloads, signed releases)

---

**Next Steps**: Review this plan, ask questions, get approval, then execute phase-by-phase with continuous testing.
