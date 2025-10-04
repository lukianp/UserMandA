/**
 * OverviewView Component
 *
 * Dashboard overview of the M&A Discovery Suite
 */

import React from 'react';
import { Users, UserCheck, Server, Database, Shield, Activity } from 'lucide-react';

/**
 * Overview dashboard view
 */
const OverviewView: React.FC = () => {
  // Mock statistics
  const stats = [
    { label: 'Total Users', value: '12,543', icon: <Users size={24} />, change: '+12%' },
    { label: 'Total Groups', value: '1,234', icon: <UserCheck size={24} />, change: '+5%' },
    { label: 'Servers', value: '456', icon: <Server size={24} />, change: '+8%' },
    { label: 'Databases', value: '89', icon: <Database size={24} />, change: '+2%' },
    { label: 'Security Score', value: '92%', icon: <Shield size={24} />, change: '+3%' },
    { label: 'Active Sessions', value: '234', icon: <Activity size={24} />, change: '-1%' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome to the M&A Discovery Suite
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {stat.change} from last month
                </p>
              </div>
              <div className="text-gray-400">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Discovery completed for domain: contoso.com
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 hours ago</p>
          </div>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Migration wave 1 validation completed successfully
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">4 hours ago</p>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              245 new users discovered in Azure AD
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Yesterday</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;