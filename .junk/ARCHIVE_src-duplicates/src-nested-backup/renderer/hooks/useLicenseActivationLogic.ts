/**
 * License Activation Logic Hook
 *
 * Manages license activation and validation.
 */

import { useState } from 'react';

export interface LicenseInfo {
  licenseKey: string;
  activationStatus: 'active' | 'inactive' | 'expired' | 'invalid';
  activatedDate?: string;
  expiryDate?: string;
  licensedTo?: string;
  licenseType?: 'trial' | 'standard' | 'enterprise';
  features?: string[];
}

export function useLicenseActivationLogic() {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateLicenseKey = (key: string): boolean => {
    // Basic validation - should be format: XXXX-XXXX-XXXX-XXXX
    const regex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return regex.test(key);
  };

  const activateLicense = async () => {
    setError(null);
    setSuccess(null);

    if (!validateLicenseKey(licenseKey)) {
      setError('Invalid license key format. Expected: XXXX-XXXX-XXXX-XXXX');
      return;
    }

    setIsActivating(true);

    try {
      // TODO: Implement actual license activation via IPC
      // For now, simulate activation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const info: LicenseInfo = {
        licenseKey,
        activationStatus: 'active',
        activatedDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        licensedTo: 'Enterprise Customer',
        licenseType: 'enterprise',
        features: [
          'Active Directory Discovery',
          'Azure AD Discovery',
          'Exchange Discovery',
          'Migration Planning',
          'Advanced Analytics',
        ],
      };

      setLicenseInfo(info);
      setSuccess('License activated successfully!');
      setLicenseKey('');
      setActivationCode('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'License activation failed');
    } finally {
      setIsActivating(false);
    }
  };

  const deactivateLicense = async () => {
    setError(null);
    setSuccess(null);
    setIsValidating(true);

    try {
      // TODO: Implement actual license deactivation via IPC
      await new Promise(resolve => setTimeout(resolve, 1000));

      setLicenseInfo(null);
      setSuccess('License deactivated successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'License deactivation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const validateLicense = async () => {
    setError(null);
    setIsValidating(true);

    try {
      // TODO: Implement actual license validation via IPC
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (licenseInfo) {
        setSuccess('License is valid and active');
      } else {
        setError('No license activated');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'License validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const checkLicenseExpiry = (): boolean => {
    if (!licenseInfo?.expiryDate) return false;
    return new Date(licenseInfo.expiryDate) < new Date();
  };

  const getDaysUntilExpiry = (): number => {
    if (!licenseInfo?.expiryDate) return 0;
    const diff = new Date(licenseInfo.expiryDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return {
    licenseInfo,
    licenseKey,
    activationCode,
    isActivating,
    isValidating,
    error,
    success,
    setLicenseKey,
    setActivationCode,
    activateLicense,
    deactivateLicense,
    validateLicense,
    checkLicenseExpiry,
    getDaysUntilExpiry,
  };
}
