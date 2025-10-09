import React from 'react';
import { Settings, AlertCircle } from 'lucide-react';
import { Button } from '../../components/atoms/Button';

export const WorkflowAutomationView: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">WorkflowAutomation</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Advanced WorkflowAutomation functionality
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
        <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">WorkflowAutomation Module</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This advanced feature provides comprehensive WorkflowAutomation capabilities.
        </p>
        <Button variant="primary" icon={<Settings />}>
          Configure WorkflowAutomation
        </Button>
      </div>
    </div>
  );
};


export default WorkflowAutomationView;
