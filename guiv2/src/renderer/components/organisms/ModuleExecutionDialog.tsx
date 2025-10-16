/**
 * Module Execution Dialog
 *
 * UI for executing PowerShell modules with parameter input
 */

import React, { useState, useMemo } from 'react';
import { useModuleDiscovery } from '../../hooks/useModuleDiscovery';
import { Modal } from './Modal';
import LoadingSpinner from '../atoms/LoadingSpinner';
import type { DiscoveredModule, ModuleParameter } from '../../hooks/useModuleDiscovery';

interface ModuleExecutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  module: DiscoveredModule;
}

export const ModuleExecutionDialog: React.FC<ModuleExecutionDialogProps> = ({
  isOpen,
  onClose,
  module
}) => {
  const { executeModule } = useModuleDiscovery();

  const [parameters, setParameters] = useState<Record<string, any>>(() => {
    // Initialize with default values
    const initial: Record<string, any> = {};
    module.parameters.forEach(param => {
      if (param.defaultValue !== undefined) {
        initial[param.name] = param.defaultValue;
      }
    });
    return initial;
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    output?: string;
    error?: string;
  } | null>(null);

  // Validate required parameters
  const missingRequired = useMemo(() => {
    return module.parameters
      .filter(p => p.required && !parameters[p.name])
      .map(p => p.name);
  }, [module.parameters, parameters]);

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters(prev => ({ ...prev, [paramName]: value }));
  };

  const handleExecute = async () => {
    if (missingRequired.length > 0) {
      alert(`Please provide values for required parameters: ${missingRequired.join(', ')}`);
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const result = await executeModule(module.id, parameters);
      setExecutionResult({
        success: result.success || result.exitCode === 0,
        output: result.output || result.stdout,
        error: result.error || result.stderr
      });
    } catch (error: any) {
      setExecutionResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClose = () => {
    setExecutionResult(null);
    onClose();
  };

  const renderParameterInput = (param: ModuleParameter) => {
    const value = parameters[param.name] ?? '';

    // Render based on parameter type
    switch (param.type.toLowerCase()) {
      case 'switch':
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={e => handleParameterChange(param.name, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-600">
              {param.description || 'Enable this option'}
            </span>
          </div>
        );

      case 'int':
      case 'int32':
      case 'int64':
        return (
          <input
            type="number"
            value={value}
            onChange={e => handleParameterChange(param.name, parseInt(e.target.value) || 0)}
            placeholder={param.defaultValue?.toString() || '0'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'string[]':
      case 'array':
        return (
          <textarea
            value={Array.isArray(value) ? value.join('\n') : value}
            onChange={e =>
              handleParameterChange(
                param.name,
                e.target.value.split('\n').filter(v => v.trim())
              )
            }
            placeholder="Enter one value per line"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={e => handleParameterChange(param.name, e.target.value)}
            placeholder={param.defaultValue?.toString() || ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Execute: ${module.name}`} size="lg">
      <div className="space-y-4">
        {/* Module Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">{module.description}</p>
          {module.dependencies.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-gray-600">Dependencies: </span>
              <span className="text-xs text-gray-700">
                {module.dependencies.join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Parameters */}
        {module.parameters.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Parameters</h3>
            {module.parameters.map(param => (
              <div key={param.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {param.name}
                  {param.required && <span className="text-red-600 ml-1">*</span>}
                  <span className="ml-2 text-xs text-gray-500">({param.type})</span>
                </label>
                {renderParameterInput(param)}
                {param.description && (
                  <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Execution Result */}
        {executionResult && (
          <div
            className={`border rounded-lg p-4 ${
              executionResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start">
              <svg
                className={`w-5 h-5 mt-0.5 ${
                  executionResult.success ? 'text-green-600' : 'text-red-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {executionResult.success ? (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
              <div className="ml-3 flex-1">
                <h3
                  className={`text-sm font-medium ${
                    executionResult.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {executionResult.success ? 'Execution Successful' : 'Execution Failed'}
                </h3>
                {executionResult.output && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-700 mb-1">Output:</p>
                    <pre className="text-xs bg-white border border-gray-300 rounded p-2 overflow-x-auto max-h-48 overflow-y-auto">
                      {executionResult.output}
                    </pre>
                  </div>
                )}
                {executionResult.error && (
                  <div className="mt-2">
                    <p className="text-xs text-red-700 mb-1">Error:</p>
                    <pre className="text-xs bg-white border border-red-300 rounded p-2 overflow-x-auto max-h-48 overflow-y-auto">
                      {executionResult.error}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Execution Progress */}
        {isExecuting && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <LoadingSpinner size="sm" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">Executing Module</p>
                <p className="text-xs text-blue-600">Please wait...</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting || missingRequired.length > 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Executing...</span>
              </div>
            ) : (
              'Execute Module'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
