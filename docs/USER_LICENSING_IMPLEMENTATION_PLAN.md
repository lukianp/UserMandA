# Enhanced Technical Implementation Plan for Licensing & Update System

## Architecture Overview

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LicenseService │    │  UpdateService  │    │  ConfigService  │
│   - Validation   │    │  - Git/GitHub   │    │  - Persistence  │
│   - Encryption   │    │  - Rollback     │    │  - IPC Bridge   │
│   - Customer ID  │    │  - Versioning   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌─────────────────┐
                    │   IPC Handlers  │
                    │ - license:*     │
                    │ - update:*      │
                    │ - config:*      │
                    └─────────────────┘
                                  │
                    ┌─────────────────┐
                    │   Preload API   │
                    │ - Secure Bridge │
                    │ - Type Safety   │
                    └─────────────────┘
                                  │
                    ┌─────────────────┐
                    │   React UI      │
                    │ - License View  │
                    │ - Update Dialog │
                    │ - Settings      │
                    └─────────────────┘
```

## Enhanced Implementation Phases

### Phase 1: Core Service Integration
**Dependencies:** None
**Estimated Effort:** 2-3 hours

#### Service Initialization
- Add LicenseService and UpdateService imports to ipcHandlers.ts
- Initialize services in initializeServices() function
- Add customer ID parameter to UpdateService initialization

#### IPC Handler Registration
- Register license:* and update:* IPC channels
- Implement proper error handling and logging
- Add service method bindings

#### Preload API Exposure
- Add license and update APIs to preload.ts
- Maintain type safety with ElectronAPI interface
- Implement event listeners for progress updates

### Phase 2: License Management
**Dependencies:** Phase 1
**Estimated Effort:** 3-4 hours

#### License Activation Flow
- Implement license:activate IPC handler
- Add license validation with server-side verification option
- Store license data using existing config system

#### License Validation & Status
- Implement license:getCustomerId handler
- Add license:validate for periodic checks
- Integrate with app startup sequence

#### UI Integration
- Wire existing LicenseActivationView to IPC calls
- Add license status display components
- Implement license expiry warnings

### Phase 3: Update Distribution
**Dependencies:** Phase 1, Phase 2
**Estimated Effort:** 4-5 hours

#### Update Check Mechanism
- Implement update:check IPC handler
- Add customer-specific branch resolution
- Implement version comparison logic

#### Update Download & Apply
- Implement update:download handler with progress tracking
- Add atomic update application with backup
- Integrate native module rebuilding

#### Rollback & Recovery
- Implement update:rollback handler
- Add automatic failure detection and recovery
- Log update history in config

### Phase 4: Advanced Features
**Dependencies:** Phase 3
**Estimated Effort:** 2-3 hours

#### Silent vs Prompt Updates
- Add update mode configuration
- Implement background update checking
- Add user notification system

#### Update Metadata Management
- Track installation history and timestamps
- Store last check times and results
- Implement update channel management

#### Error Recovery & Diagnostics
- Add comprehensive error logging
- Implement update diagnostics tools
- Add manual rollback options

## Security & Reliability Enhancements

### Security Improvements
- **License Encryption:** Use Electron safeStorage for all license data
- **Update Integrity:** Verify Git commits with GPG signatures
- **Network Security:** Enforce HTTPS for all GitHub API calls
- **Path Security:** Use app.getPath('userData') consistently
- **Input Validation:** Sanitize all license keys and update parameters

### Reliability Features
- **Atomic Updates:** Full backup/restore capability
- **Network Resilience:** Retry logic for failed downloads
- **Progress Tracking:** Real-time progress updates to UI
- **Graceful Degradation:** Continue operation with cached license during network issues
- **Audit Logging:** Comprehensive update and license event logging

## Integration Points

### Existing Systems Integration
- **Config System:** Leverage existing config:get/set for all persistence
- **PowerShell Service:** Use for Git operations if needed
- **Profile Service:** Get customer ID from active profile
- **UI Framework:** Integrate with existing React components and dialogs

### Startup Sequence Integration
```
App Startup
    ↓
Initialize Config Service
    ↓
Load License Data → Validate License
    ↓
Initialize Update Service (with customerId)
    ↓
Check for Updates (if auto-update enabled)
    ↓
Load Main Window
```

## Error Handling Strategy

### License Errors
- **Invalid License:** Show activation dialog, disable premium features
- **Expired License:** Warn user, allow grace period
- **Corrupted Data:** Attempt recovery, fall back to activation required

### Update Errors
- **Network Failure:** Retry with exponential backoff
- **Git Errors:** Clean repository state, retry operation
- **Build Failures:** Automatic rollback to previous version
- **Permission Issues:** Log detailed diagnostics, prompt user

## Testing Strategy

### Unit Tests
- Service method testing with mocked dependencies
- IPC handler validation
- License key parsing and validation
- Version comparison logic

### Integration Tests
- Full license activation flow
- Update download and application
- Rollback scenarios
- Network failure simulation

### End-to-End Tests
- Complete app startup with licensed features
- Update flow from check to restart
- License expiry handling
- Multi-customer scenarios

## Performance Considerations

### Optimization Points
- **Lazy Loading:** Initialize update service only when needed
- **Caching:** Cache license validation results
- **Background Operations:** Run updates in background threads
- **Memory Management:** Clean up temporary files after updates
- **Network Efficiency:** Use GitHub API efficiently with proper caching

### Resource Usage
- **Storage:** ~50MB for Git repository clones
- **Memory:** Minimal additional memory for services
- **Network:** GitHub API calls (rate limited)
- **CPU:** Git operations during updates

## Edge Cases & Failure Scenarios

### License Edge Cases
- **Clock Skew:** Handle system time changes affecting expiry
- **Multiple Installations:** Ensure license per installation
- **License Format Changes:** Backward compatibility
- **Offline Validation:** Allow operation during network outages

### Update Edge Cases
- **Partial Downloads:** Resume interrupted downloads
- **Concurrent Updates:** Prevent multiple update operations
- **Version Conflicts:** Handle version downgrade scenarios
- **Native Module Issues:** Detect and handle rebuild failures
- **Permission Changes:** Handle UAC elevation requirements

### System Edge Cases
- **Disk Space:** Check available space before updates
- **Antivirus Interference:** Handle file locking issues
- **Corporate Proxies:** Support proxy configurations
- **Windows Defender:** Ensure smooth integration

---

# DETAILED TECHNICAL IMPLEMENTATION PROMPT

## Instructions for Implementation

Execute the following code changes in sequence. Each block is self-contained and includes all necessary imports, error handling, and integration points. The implementation leverages existing services and follows established patterns.

## Phase 1: Service Integration

### 1.1 Update ipcHandlers.ts Imports

```typescript
// Add to existing imports in guiv2/src/main/ipcHandlers.ts
import LicenseService from './services/licenseService';
import UpdateService from './services/updateService';
```

### 1.2 Add Service Instances

```typescript
// Add to service instances section in ipcHandlers.ts
let licenseService: LicenseService;
let updateService: UpdateService;
```

### 1.3 Initialize Services in initializeServices()

```typescript
// Add to initializeServices() function after profileService.initialize()

// Initialize License Service
licenseService = new LicenseService();
await licenseService.initialize();
console.log('License Service initialized');

// Get customer ID for Update Service initialization
const customerId = await licenseService.getCustomerId();

// Initialize Update Service with customer ID
updateService = new UpdateService();
await updateService.initialize(customerId || 'default');
console.log('Update Service initialized');
```

## Phase 2: License Management IPC Handlers

### 2.1 Add License IPC Handlers

```typescript
// Add after existing IPC handlers in ipcHandlers.ts

// ========================================
// License Management Handlers
// ========================================

/**
 * IPC Handler: license:activate
 * Activate a license key and store license data
 */
ipcMain.handle('license:activate', async (_, licenseKey: string) => {
  try {
    console.log('IPC: license:activate');
    const result = await licenseService.activateLicense(licenseKey);

    // Update config with license status
    await saveConfig(); // Existing function

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('license:activate error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * IPC Handler: license:getCustomerId
 * Get the current customer ID from active license
 */
ipcMain.handle('license:getCustomerId', async () => {
  try {
    const customerId = await licenseService.getCustomerId();
    return { success: true, customerId };
  } catch (error: unknown) {
    console.error('license:getCustomerId error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      customerId: null
    };
  }
});

/**
 * IPC Handler: license:validate
 * Validate current license status
 */
ipcMain.handle('license:validate', async () => {
  try {
    const isValid = await licenseService.isLicenseValid();
    const details = await licenseService.getLicenseDetails();

    return {
      success: true,
      isValid,
      details
    };
  } catch (error: unknown) {
    console.error('license:validate error:', error);
    return {
      success: false,
      isValid: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * IPC Handler: license:getDetails
 * Get complete license information
 */
ipcMain.handle('license:getDetails', async () => {
  try {
    const details = await licenseService.getLicenseDetails();
    return { success: true, details };
  } catch (error: unknown) {
    console.error('license:getDetails error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});
```

## Phase 3: Update Management IPC Handlers

### 3.1 Add Update IPC Handlers

```typescript
// Add after license handlers in ipcHandlers.ts

// ========================================
// Update Management Handlers
// ========================================

/**
 * IPC Handler: update:check
 * Check for available updates
 */
ipcMain.handle('update:check', async () => {
  try {
    console.log('IPC: update:check');
    const result = await updateService.checkForUpdates();

    // Update last check timestamp
    appConfig.lastUpdateCheck = new Date().toISOString();
    await saveConfig();

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('update:check error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * IPC Handler: update:download
 * Download and prepare update
 */
ipcMain.handle('update:download', async (_, version: string) => {
  try {
    console.log(`IPC: update:download - ${version}`);

    // Send progress events to renderer
    const progressCallback = (progress: any) => {
      const win = getMainWindow();
      if (win) {
        win.webContents.send('update:progress', progress);
      }
    };

    // Note: UpdateService.applyUpdate includes download
    // For separate download, we'd need to modify UpdateService

    return { success: true, message: 'Update download initiated' };
  } catch (error: unknown) {
    console.error('update:download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * IPC Handler: update:apply
 * Apply downloaded update
 */
ipcMain.handle('update:apply', async (_, version: string) => {
  try {
    console.log(`IPC: update:apply - ${version}`);

    const result = await updateService.applyUpdate(version);

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('update:apply error:', error);

    // Send error event
    const win = getMainWindow();
    if (win) {
      win.webContents.send('update:error', {
        version,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * IPC Handler: update:rollback
 * Rollback to previous version
 */
ipcMain.handle('update:rollback', async () => {
  try {
    console.log('IPC: update:rollback');

    await updateService.rollback();

    return { success: true };
  } catch (error: unknown) {
    console.error('update:rollback error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * IPC Handler: update:getHistory
 * Get update history
 */
ipcMain.handle('update:getHistory', async () => {
  try {
    const history = await updateService.getUpdateHistory();
    return { success: true, history };
  } catch (error: unknown) {
    console.error('update:getHistory error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});

/**
 * IPC Handler: update:getStatus
 * Get current update status
 */
ipcMain.handle('update:getStatus', async () => {
  try {
    // This would need to be implemented in UpdateService
    // For now, return basic status
    return {
      success: true,
      status: 'idle',
      currentVersion: process.env.npm_package_version || '1.0.0',
      lastCheck: appConfig.lastUpdateCheck
    };
  } catch (error: unknown) {
    console.error('update:getStatus error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});
```

## Phase 4: Preload API Extensions

### 4.1 Add License API to preload.ts

```typescript
// Add to electronAPI object in preload.ts

// ========================================
// License Management API
// ========================================

license: {
  /**
   * Activate a license key
   */
  activate: (licenseKey: string) =>
    ipcRenderer.invoke('license:activate', licenseKey),

  /**
   * Get current customer ID
   */
  getCustomerId: () =>
    ipcRenderer.invoke('license:getCustomerId'),

  /**
   * Validate license status
   */
  validate: () =>
    ipcRenderer.invoke('license:validate'),

  /**
   * Get license details
   */
  getDetails: () =>
    ipcRenderer.invoke('license:getDetails'),
},

// ========================================
// Update Management API
// ========================================

update: {
  /**
   * Check for updates
   */
  check: () =>
    ipcRenderer.invoke('update:check'),

  /**
   * Download update
   */
  download: (version: string) =>
    ipcRenderer.invoke('update:download', version),

  /**
   * Apply update
   */
  apply: (version: string) =>
    ipcRenderer.invoke('update:apply', version),

  /**
   * Rollback to previous version
   */
  rollback: () =>
    ipcRenderer.invoke('update:rollback'),

  /**
   * Get update history
   */
  getHistory: () =>
    ipcRenderer.invoke('update:getHistory'),

  /**
   * Get update status
   */
  getStatus: () =>
    ipcRenderer.invoke('update:getStatus'),

  /**
   * Listen for update progress events
   */
  onProgress: (callback: (data: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('update:progress', handler);
    return () => ipcRenderer.removeListener('update:progress', handler);
  },

  /**
   * Listen for update error events
   */
  onError: (callback: (data: any) => void) => {
    const handler = (_: any, data: any) => callback(data);
    ipcRenderer.on('update:error', handler);
    return () => ipcRenderer.removeListener('update:error', handler);
  },
},
```

## Phase 5: Configuration Schema Extensions

### 5.1 Update Config Defaults

```typescript
// Update getDefaultConfig() in configService.ts to include license and update settings

private getDefaultConfig(): ConfigData {
  return {
    // ... existing config ...

    license: {
      activated: false,
      customerId: null,
      expiryDate: null,
      lastValidation: null,
    },

    update: {
      autoUpdate: false,
      updateChannel: 'stable',
      lastUpdateCheck: null,
      currentVersion: process.env.npm_package_version || '1.0.0',
      updateHistory: [],
    },

    // ... rest of existing config ...
  };
}
```

## Phase 6: Startup Integration

### 6.1 Add License Validation to App Startup

```typescript
// Add to main.ts or app initialization

// After services are initialized but before window creation
async function validateLicenseOnStartup() {
  try {
    const licenseValid = await licenseService.isLicenseValid();

    if (!licenseValid) {
      console.warn('License validation failed on startup');
      // Could show license dialog or limit features
    }
  } catch (error) {
    console.error('License validation error on startup:', error);
  }
}

// Call this in app.whenReady() or similar
```

## Phase 7: UI Integration Examples

### 7.1 License Activation Component Hook

```typescript
// Example React hook for license activation

import { useState, useEffect } from 'react';

export function useLicense() {
  const [licenseStatus, setLicenseStatus] = useState<{
    isValid: boolean;
    customerId: string | null;
    expiryDate: Date | null;
    loading: boolean;
  }>({
    isValid: false,
    customerId: null,
    expiryDate: null,
    loading: true,
  });

  useEffect(() => {
    checkLicenseStatus();
  }, []);

  const checkLicenseStatus = async () => {
    try {
      const result = await window.electronAPI.license.validate();
      if (result.success) {
        setLicenseStatus({
          isValid: result.isValid,
          customerId: result.details?.customerId || null,
          expiryDate: result.details?.expiryDate ? new Date(result.details.expiryDate) : null,
          loading: false,
        });
      }
    } catch (error) {
      console.error('License check failed:', error);
      setLicenseStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const activateLicense = async (licenseKey: string) => {
    try {
      const result = await window.electronAPI.license.activate(licenseKey);
      if (result.success) {
        await checkLicenseStatus(); // Refresh status
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  };

  return {
    licenseStatus,
    activateLicense,
    refreshStatus: checkLicenseStatus,
  };
}
```

### 7.2 Update Management Hook

```typescript
// Example React hook for update management

import { useState, useEffect } from 'react';

export function useUpdates() {
  const [updateStatus, setUpdateStatus] = useState<{
    checking: boolean;
    available: boolean;
    downloading: boolean;
    currentVersion: string;
    latestVersion: string;
    progress?: number;
  }>({
    checking: false,
    available: false,
    downloading: false,
    currentVersion: '1.0.0',
    latestVersion: '1.0.0',
  });

  useEffect(() => {
    // Listen for update progress
    const progressUnsubscribe = window.electronAPI.update.onProgress((data) => {
      setUpdateStatus(prev => ({
        ...prev,
        progress: data.progress,
        downloading: data.phase === 'downloading',
      }));
    });

    const errorUnsubscribe = window.electronAPI.update.onError((data) => {
      console.error('Update error:', data);
      setUpdateStatus(prev => ({
        ...prev,
        downloading: false,
        checking: false,
      }));
    });

    return () => {
      progressUnsubscribe();
      errorUnsubscribe();
    };
  }, []);

  const checkForUpdates = async () => {
    setUpdateStatus(prev => ({ ...prev, checking: true }));

    try {
      const result = await window.electronAPI.update.check();
      if (result.success) {
        setUpdateStatus(prev => ({
          ...prev,
          checking: false,
          available: result.data.hasUpdate,
          latestVersion: result.data.latestVersion,
          currentVersion: result.data.currentVersion,
        }));
      }
    } catch (error) {
      console.error('Update check failed:', error);
      setUpdateStatus(prev => ({ ...prev, checking: false }));
    }
  };

  const applyUpdate = async (version: string) => {
    try {
      setUpdateStatus(prev => ({ ...prev, downloading: true }));
      const result = await window.electronAPI.update.apply(version);

      if (result.success) {
        // App will restart automatically
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch (error) {
      setUpdateStatus(prev => ({ ...prev, downloading: false }));
      return { success: false, error: String(error) };
    }
  };

  return {
    updateStatus,
    checkForUpdates,
    applyUpdate,
  };
}
```

## Implementation Notes

- **Error Handling:** All IPC handlers include comprehensive error handling with proper logging.
- **Type Safety:** Maintains TypeScript types throughout the implementation.
- **Security:** Uses existing security patterns (safeStorage, path sanitization).
- **Integration:** Leverages existing services and IPC patterns.
- **Extensibility:** Framework supports future enhancements like server-side validation.
- **Testing:** Each handler can be unit tested independently.
- **Performance:** Lazy initialization and efficient caching where appropriate.
