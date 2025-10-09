import React from 'react';
import { Activity, TrendingUp, DollarSign, Shield } from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Advanced Knowledge Base capabilities for enterprise management
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <Activity className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="font-semibold mb-2">Active Monitoring</h3>
          <p className="text-3xl font-bold">24/7</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="font-semibold mb-2">Performance</h3>
          <p className="text-3xl font-bold">98.5%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <DollarSign className="w-8 h-8 text-yellow-500 mb-3" />
          <h3 className="font-semibold mb-2">Cost Savings</h3>
          <p className="text-3xl font-bold">$125K</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border flex-1">
        <h3 className="font-semibold mb-4">Knowledge Base Dashboard</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive Knowledge Base features and analytics will be displayed here.
        </p>
      </div>
    </div>
  );
};


export default KnowledgeBaseView;
