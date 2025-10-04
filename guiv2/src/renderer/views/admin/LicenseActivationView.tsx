import React from 'react';
import { Key, Check, AlertCircle, Calendar, Users } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Badge } from '../../components/atoms/Badge';

export const LicenseActivationView: React.FC = () => {
  const [licenseKey, setLicenseKey] = React.useState('');
  
  const licenseInfo = {
    type: 'Enterprise',
    status: 'Active',
    expirationDate: new Date('2026-10-04'),
    maxUsers: 500,
    currentUsers: 123,
    features: ['All Discovery Modules', 'Migration Tools', 'Advanced Analytics', 'Priority Support'],
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">License Activation</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your software license and activation
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{licenseInfo.type} License</h2>
            <p className="text-blue-100">M&A Discovery Suite v2.0</p>
          </div>
          <Badge variant="default" className="bg-white/20 text-white">
            <Check className="w-4 h-4 mr-1" />
            {licenseInfo.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div>
            <div className="text-sm text-blue-100">Expires</div>
            <div className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {licenseInfo.expirationDate.toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-blue-100">Users</div>
            <div className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              {licenseInfo.currentUsers} / {licenseInfo.maxUsers}
            </div>
          </div>
          <div>
            <div className="text-sm text-blue-100">Days Remaining</div>
            <div className="text-lg font-semibold">
              {Math.ceil((licenseInfo.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <h3 className="font-semibold mb-4">Included Features</h3>
        <div className="grid grid-cols-2 gap-3">
          {licenseInfo.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Activate New License
        </h3>
        <div className="flex gap-4">
          <Input
            label="License Key"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
            className="flex-1"
          />
          <Button variant="primary" className="self-end">
            Activate
          </Button>
        </div>
        <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Activating a new license will replace your current license. Make sure to backup any important data before proceeding.
          </p>
        </div>
      </div>
    </div>
  );
};
