import React, { useState } from 'react';
import { Key, Check, AlertCircle, Calendar, Shield, Loader2, X, Info } from 'lucide-react';

import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Badge } from '../../components/atoms/Badge';
import { useLicense } from '../../hooks/useLicense';

export const LicenseActivationView: React.FC = () => {
  const [licenseKey, setLicenseKey] = useState('');
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState(false);

  const {
    licenseInfo,
    isLoading,
    error,
    isValid,
    activateLicense,
    deactivateLicense,
    hasFeature,
    getDaysRemaining,
    isExpiringSoon,
  } = useLicense();

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setActivationError('Please enter a license key');
      return;
    }

    setActivationError(null);
    setActivationSuccess(false);

    const result = await activateLicense(licenseKey.trim());

    if (result.success) {
      setActivationSuccess(true);
      setLicenseKey('');
      setTimeout(() => setActivationSuccess(false), 5000);
    } else {
      setActivationError(result.error || 'Activation failed');
    }
  };

  const handleDeactivate = async () => {
    if (confirm('Are you sure you want to deactivate this license? You will need a new license key to reactivate.')) {
      await deactivateLicense();
    }
  };

  const daysRemaining = getDaysRemaining();
  const isExpiring = isExpiringSoon(30);

  // Map license types to display names
  const licenseTypeDisplay = {
    trial: 'Trial',
    standard: 'Standard',
    enterprise: 'Enterprise',
  };

  // Map status to colors
  const statusColors = {
    active: 'bg-green-500',
    expired: 'bg-red-500',
    invalid: 'bg-gray-500',
    not_activated: 'bg-yellow-500',
  };

  // Feature display names
  const featureNames: Record<string, string> = {
    'discovery': 'All Discovery Modules',
    'migration': 'Migration Tools',
    'analytics': 'Advanced Analytics',
    'reporting': 'Reporting & Export',
    'api-access': 'API Access',
    'priority-support': 'Priority Support',
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6" data-testid="license-activation-view" data-cy="license-activation-view">
      <div>
        <h1 className="text-2xl font-bold">License Activation</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your software license and activation
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading license information...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200">Error Loading License</h3>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* License Info Display */}
      {!isLoading && licenseInfo && licenseInfo.status === 'active' && (
        <>
          <div className={`bg-gradient-to-r ${isExpiring ? 'from-orange-600 to-red-600' : 'from-blue-600 to-purple-600'} text-white p-6 rounded-lg`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{licenseTypeDisplay[licenseInfo.type]} License</h2>
                <p className="text-blue-100">Enterprise Discovery & Migration Suite v2.0</p>
                <p className="text-sm text-blue-100 mt-1">Customer ID: {licenseInfo.customerId}</p>
              </div>
              <Badge variant="default" className={`${statusColors[licenseInfo.status]} text-white`}>
                <Check className="w-4 h-4 mr-1" />
                {licenseInfo.status}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <div className="text-sm text-blue-100">Expires</div>
                <div className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {licenseInfo.expiresAt ? new Date(licenseInfo.expiresAt).toLocaleDateString() : 'Never'}
                </div>
              </div>
              <div>
                <div className="text-sm text-blue-100">Machine ID</div>
                <div className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {licenseInfo.machineId.substring(0, 8)}...
                </div>
              </div>
              <div>
                <div className="text-sm text-blue-100">Days Remaining</div>
                <div className={`text-lg font-semibold ${isExpiring ? 'text-yellow-200' : ''}`}>
                  {daysRemaining ?? '∞'}
                </div>
              </div>
            </div>

            {isExpiring && (
              <div className="mt-4 bg-yellow-500/20 border border-yellow-300 rounded p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  Your license is expiring soon! Contact your administrator to renew.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Included Features</h3>
            <div className="grid grid-cols-2 gap-3">
              {licenseInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{featureNames[feature] || feature}</span>
                </div>
              ))}
              {licenseInfo.features.length === 0 && (
                <div className="col-span-2 text-sm text-gray-500">No features enabled</div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDeactivate}>
              Deactivate License
            </Button>
          </div>
        </>
      )}

      {/* Not Activated State */}
      {!isLoading && (!licenseInfo || licenseInfo.status === 'not_activated') && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">No Active License</h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                Please activate a license to use the full features of Enterprise Discovery Suite.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expired License State */}
      {!isLoading && licenseInfo && licenseInfo.status === 'expired' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <X className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">License Expired</h3>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                Your license expired on {licenseInfo.expiresAt ? new Date(licenseInfo.expiresAt).toLocaleDateString() : 'unknown date'}.
                Please activate a new license to continue using the software.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* License Activation Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          {licenseInfo && isValid ? 'Replace License' : 'Activate License'}
        </h3>

        {activationSuccess && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-600 dark:text-green-300">
              License activated successfully!
            </p>
          </div>
        )}

        {activationError && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-300">
              {activationError}
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <Input
            label="License Key"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
            placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
            className="flex-1 font-mono"
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
        <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            {licenseInfo && isValid
              ? 'Activating a new license will replace your current license. Make sure to backup any important data before proceeding.'
              : 'Enter your license key in the format XXXX-XXXX-XXXX-XXXX-XXXX to activate the software.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LicenseActivationView;
