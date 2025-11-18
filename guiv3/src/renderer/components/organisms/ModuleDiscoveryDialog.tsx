/**
 * Module Discovery Dialog
 *
 * UI for browsing and executing discovered PowerShell modules
 */

import React, { useState, useMemo, useEffect } from 'react';

import { useModuleDiscovery } from '../../hooks/useModuleDiscovery';
import LoadingSpinner from '../atoms/LoadingSpinner';
import type { DiscoveredModule } from '../../hooks/useModuleDiscovery';

import { Modal } from './Modal';
import { ModuleExecutionDialog } from './ModuleExecutionDialog';


interface ModuleDiscoveryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModuleDiscoveryDialog: React.FC<ModuleDiscoveryDialogProps> = ({
  isOpen,
  onClose
}) => {
  const { state, discoverModules, searchModules, getModulesByCategory } = useModuleDiscovery();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<DiscoveredModule | null>(null);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  // Refresh on mount
  useEffect(() => {
    if (isOpen) {
      discoverModules();
    }
  }, [isOpen, discoverModules]);

  // Get filtered modules
  const filteredModules = useMemo(() => {
    if (searchQuery) {
      return searchModules(searchQuery);
    } else if (selectedCategory) {
      return getModulesByCategory(selectedCategory);
    } else {
      return state.modules;
    }
  }, [searchQuery, selectedCategory, state.modules, searchModules, getModulesByCategory]);

  // Group modules by category
  const modulesByCategory = useMemo(() => {
    const grouped = new Map<string, DiscoveredModule[]>();
    filteredModules.forEach(module => {
      const modules = grouped.get(module.category) || [];
      modules.push(module);
      grouped.set(module.category, modules);
    });
    return grouped;
  }, [filteredModules]);

  const handleExecuteModule = (module: DiscoveredModule) => {
    setSelectedModule(module);
    setShowExecutionDialog(true);
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setSelectedCategory('');
    discoverModules();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="PowerShell Module Discovery" size="xl">
        <div className="space-y-4">
          {/* Header Stats */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="text-gray-700">Total Modules:</span>{' '}
                  <span className="font-medium text-blue-800">{state.modules.length}</span>
                </div>
                <div>
                  <span className="text-gray-700">Categories:</span>{' '}
                  <span className="font-medium text-blue-800">{state.categories.length}</span>
                </div>
                {state.lastScanTime && (
                  <div>
                    <span className="text-gray-700">Last Scan:</span>{' '}
                    <span className="font-medium text-blue-800">
                      {new Date(state.lastScanTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={handleRefresh}
                disabled={state.isDiscovering}
                className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {state.isDiscovering ? 'Scanning...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {state.isDiscovering && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
              <span className="ml-3 text-gray-600">Discovering PowerShell modules...</span>
            </div>
          )}

          {/* Error Display */}
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{state.error}</p>
                </div>
              </div>
            </div>
          )}

          {!state.isDiscovering && (
            <>
              {/* Search and Filter */}
              <div className="flex space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setSelectedCategory('');
                    }}
                    placeholder="Search modules by name or description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="w-64">
                  <select
                    value={selectedCategory}
                    onChange={e => {
                      setSelectedCategory(e.target.value);
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {state.categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Module List */}
              <div className="max-h-[500px] overflow-y-auto">
                {filteredModules.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <p className="text-lg font-medium">No modules found</p>
                    <p className="text-sm">
                      {searchQuery || selectedCategory
                        ? 'Try adjusting your search or filters'
                        : 'Click Refresh to scan for modules'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Array.from(modulesByCategory.entries()).map(([category, modules]) => (
                      <div key={category}>
                        <h3 className="text-sm font-medium text-gray-700 mb-2 sticky top-0 bg-white py-2">
                          {category} ({modules.length})
                        </h3>
                        <div className="space-y-2">
                          {modules.map(module => (
                            <div
                              key={module.id}
                              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium text-gray-900">{module.name}</h4>
                                    {module.version && (
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                        v{module.version}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>{module.parameters.length} parameters</span>
                                    {module.dependencies.length > 0 && (
                                      <span>{module.dependencies.length} dependencies</span>
                                    )}
                                    {module.author && <span>by {module.author}</span>}
                                  </div>
                                  {module.parameters.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {module.parameters.slice(0, 5).map(param => (
                                        <span
                                          key={param.name}
                                          className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded"
                                        >
                                          {param.required && '* '}
                                          {param.name}
                                        </span>
                                      ))}
                                      {module.parameters.length > 5 && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                          +{module.parameters.length - 5} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleExecuteModule(module)}
                                  className="ml-4 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                                >
                                  Execute
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Module Execution Dialog */}
      {showExecutionDialog && selectedModule && (
        <ModuleExecutionDialog
          isOpen={showExecutionDialog}
          onClose={() => {
            setShowExecutionDialog(false);
            setSelectedModule(null);
          }}
          module={selectedModule}
        />
      )}
    </>
  );
};
