/**
 * Device Migration View
 *
 * Device management transfer with:
 * - Device inventory (Azure AD joined, Hybrid, Intune managed)
 * - Device join/unjoin operations
 * - Intune enrollment transfer
 * - Compliance policy mapping
 * - Device wipe and re-enrollment options
 */

import React, { useState } from 'react';
import { Monitor, Smartphone, CheckCircle, AlertTriangle, PlayCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../components/atoms/Button';

export const DeviceMigrationView: React.FC = () => {
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [migrationStrategy, setMigrationStrategy] = useState<'reenroll' | 'transfer'>('transfer');

  const mockDevices = [
    {
      id: '1',
      name: 'DESKTOP-JD-001',
      type: 'Windows 10',
      user: 'jdoe@contoso.com',
      joinType: 'Azure AD',
      managed: true,
      compliant: true,
    },
    {
      id: '2',
      name: 'LAPTOP-JS-002',
      type: 'Windows 11',
      user: 'jsmith@contoso.com',
      joinType: 'Hybrid',
      managed: true,
      compliant: false,
    },
    {
      id: '3',
      name: 'iPhone - Mike J',
      type: 'iOS 17',
      user: 'mjohnson@contoso.com',
      joinType: 'Registered',
      managed: true,
      compliant: true,
    },
  ];

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
            <Monitor size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Device Migration</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Transfer device management and enrollment
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={<PlayCircle size={18} />}
          disabled={selectedDevices.length === 0}
        >
          Start Migration
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Devices List */}
          <div className="lg:col-span-2">
            {selectedDevices.length > 0 && (
              <div className="mb-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedDevices.length} device{selectedDevices.length > 1 ? 's' : ''} selected
                </p>
              </div>
            )}
            <div className="space-y-3">
              {mockDevices.map((device) => (
                <div
                  key={device.id}
                  onClick={() => handleDeviceSelect(device.id)}
                  className={clsx(
                    'p-4 rounded-lg border cursor-pointer transition-all',
                    selectedDevices.includes(device.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {device.type.includes('iOS') || device.type.includes('Android') ? (
                        <Smartphone className="h-5 w-5 text-orange-600 mt-0.5" />
                      ) : (
                        <Monitor className="h-5 w-5 text-orange-600 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{device.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{device.type}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{device.user}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span
                        className={clsx(
                          'text-xs px-2 py-1 rounded-full',
                          device.compliant
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        )}
                      >
                        {device.compliant ? 'Compliant' : 'Non-Compliant'}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {device.joinType}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options Panel */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Migration Strategy
            </h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="strategy"
                  checked={migrationStrategy === 'transfer'}
                  onChange={() => setMigrationStrategy('transfer')}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Direct Transfer</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Transfer management without device reset
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="strategy"
                  checked={migrationStrategy === 'reenroll'}
                  onChange={() => setMigrationStrategy('reenroll')}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Re-enrollment</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Wipe and re-enroll in target tenant
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceMigrationView;


