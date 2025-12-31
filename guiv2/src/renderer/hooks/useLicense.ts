/**
 * useLicense Hook
 * React hook for license management and validation
 */

import { useState, useEffect, useCallback } from 'react';

export interface LicenseInfo {
  status: 'active' | 'expired' | 'invalid' | 'not_activated';
  type: 'trial' | 'standard' | 'enterprise';
  customerId: string;
  activatedAt?: string;
  expiresAt?: string;
  features: string[];
  machineId: string;
  daysRemaining?: number;
}

export interface ActivationResult {
  success: boolean;
  licenseInfo?: LicenseInfo;
  error?: string;
}

export interface UseLicenseReturn {
  // State
  licenseInfo: LicenseInfo | null;
  isLoading: boolean;
  error: string | null;
  isValid: boolean;

  // Actions
  activateLicense: (licenseKey: string) => Promise<ActivationResult>;
  deactivateLicense: () => Promise<void>;
  refreshLicense: () => Promise<void>;
  hasFeature: (featureId: string) => boolean;

  // Utilities
  getCustomerId: () => string | null;
  getDaysRemaining: () => number | null;
  isExpiringSoon: (daysThreshold?: number) => boolean;
}

export function useLicense(): UseLicenseReturn {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);

  /**
   * Load license information on mount
   */
  const loadLicenseInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.license.getInfo();

      if (result.success && result.licenseInfo) {
        setLicenseInfo(result.licenseInfo);
        setIsValid(result.licenseInfo.status === 'active');
      } else {
        setError(result.error || 'Failed to load license information');
        setLicenseInfo(null);
        setIsValid(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      setLicenseInfo(null);
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Activate a new license key
   */
  const activateLicense = useCallback(async (licenseKey: string): Promise<ActivationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.license.activate(licenseKey);

      if (result.success && result.licenseInfo) {
        setLicenseInfo(result.licenseInfo);
        setIsValid(result.licenseInfo.status === 'active');
        return result;
      } else {
        setError(result.error || 'License activation failed');
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Deactivate current license
   */
  const deactivateLicense = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.license.deactivate();

      if (result.success) {
        setLicenseInfo(null);
        setIsValid(false);
      } else {
        setError(result.error || 'License deactivation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh license validation
   */
  const refreshLicense = useCallback(async (): Promise<void> => {
    await loadLicenseInfo();
  }, [loadLicenseInfo]);

  /**
   * Check if a specific feature is enabled
   */
  const hasFeature = useCallback((featureId: string): boolean => {
    if (!licenseInfo || licenseInfo.status !== 'active') {
      return false;
    }

    return licenseInfo.features.includes(featureId) || licenseInfo.features.includes('*');
  }, [licenseInfo]);

  /**
   * Get customer ID
   */
  const getCustomerId = useCallback((): string | null => {
    return licenseInfo?.customerId || null;
  }, [licenseInfo]);

  /**
   * Get days remaining until expiration
   */
  const getDaysRemaining = useCallback((): number | null => {
    return licenseInfo?.daysRemaining ?? null;
  }, [licenseInfo]);

  /**
   * Check if license is expiring soon
   */
  const isExpiringSoon = useCallback((daysThreshold: number = 30): boolean => {
    if (!licenseInfo || !licenseInfo.daysRemaining) {
      return false;
    }

    return licenseInfo.daysRemaining <= daysThreshold && licenseInfo.daysRemaining > 0;
  }, [licenseInfo]);

  /**
   * Set up event listeners for license events
   */
  useEffect(() => {
    // Initial load
    loadLicenseInfo();

    // Listen for license activation events
    const unsubscribeActivated = window.electronAPI.license.onActivated((info: LicenseInfo) => {
      setLicenseInfo(info);
      setIsValid(info.status === 'active');
      setError(null);
    });

    // Listen for license deactivation events
    const unsubscribeDeactivated = window.electronAPI.license.onDeactivated(() => {
      setLicenseInfo(null);
      setIsValid(false);
      setError(null);
    });

    // Cleanup
    return () => {
      unsubscribeActivated();
      unsubscribeDeactivated();
    };
  }, [loadLicenseInfo]);

  return {
    // State
    licenseInfo,
    isLoading,
    error,
    isValid,

    // Actions
    activateLicense,
    deactivateLicense,
    refreshLicense,
    hasFeature,

    // Utilities
    getCustomerId,
    getDaysRemaining,
    isExpiringSoon,
  };
}

export default useLicense;


