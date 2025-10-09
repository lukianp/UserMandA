import React from 'react';
import { Shield, Lock, Cloud, FileText } from 'lucide-react';
import { Button } from '../../components/atoms/Button';

export const EDiscoveryView: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">eDiscovery</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage eDiscovery settings and policies
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <Shield className="w-12 h-12 text-blue-500 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Security Status</h3>
          <div className="text-3xl font-bold text-green-600 mb-4">Compliant</div>
          <Button variant="secondary" className="w-full">View Details</Button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <Lock className="w-12 h-12 text-purple-500 mb-4" />
          <h3 className="font-semibold text-lg mb-2">Policies Active</h3>
          <div className="text-3xl font-bold text-blue-600 mb-4">15</div>
          <Button variant="secondary" className="w-full">Manage Policies</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border flex-1">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
              <span className="text-sm">Policy update #{i}</span>
              <span className="text-xs text-gray-500">{i} hour{i>1?'s':''} ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default EDiscoveryView;
