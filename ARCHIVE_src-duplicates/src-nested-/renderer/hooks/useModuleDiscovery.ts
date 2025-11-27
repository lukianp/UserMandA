/**
 * Module Discovery Hook
 *
 * React hook for discovering and managing PowerShell modules
 */

import { useState, useCallback, useEffect } from 'react';

export interface ModuleParameter {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface DiscoveredModule {
  id: string;
  name: string;
  path: string;
  category: string;
  description: string;
  parameters: ModuleParameter[];
  dependencies: string[];
  version?: string;
  author?: string;
}

export interface ModuleDiscoveryState {
  modules: DiscoveredModule[];
  categories: string[];
  isDiscovering: boolean;
  lastScanTime: Date | null;
  error: string | null;
}

/**
 * Hook for managing PowerShell module discovery
 */
export function useModuleDiscovery() {
  const [state, setState] = useState<ModuleDiscoveryState>({
    modules: [],
    categories: [],
    isDiscovering: false,
    lastScanTime: null,
    error: null
  });

  /**
   * Discover all PowerShell modules
   */
  const discoverModules = useCallback(async () => {
    setState(prev => ({ ...prev, isDiscovering: true, error: null }));

    try {
      const result = await window.electronAPI.invoke('module-discovery:discover');

      if (result.success) {
        const categories = Array.from(new Set(result.modules.map((m: DiscoveredModule) => m.category))) as string[];

        setState(prev => ({
          ...prev,
          modules: result.modules,
          categories,
          isDiscovering: false,
          lastScanTime: new Date()
        }));
      } else {
        throw new Error(result.error || 'Failed to discover modules');
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isDiscovering: false,
        error: error.message
      }));
    }
  }, []);

  /**
   * Get modules by category
   */
  const getModulesByCategory = useCallback(
    (category: string): DiscoveredModule[] => {
      return state.modules.filter(m => m.category === category);
    },
    [state.modules]
  );

  /**
   * Search modules by name or description
   */
  const searchModules = useCallback(
    (query: string): DiscoveredModule[] => {
      const lowerQuery = query.toLowerCase();
      return state.modules.filter(
        m =>
          (m.name ?? '').toLowerCase().includes(lowerQuery) ||
          (m.description ?? '').toLowerCase().includes(lowerQuery)
      );
    },
    [state.modules]
  );

  /**
   * Get module by ID
   */
  const getModuleById = useCallback(
    (moduleId: string): DiscoveredModule | undefined => {
      return state.modules.find(m => m.id === moduleId);
    },
    [state.modules]
  );

  /**
   * Execute a discovered module
   */
  const executeModule = useCallback(async (moduleId: string, parameters: Record<string, any>) => {
    const module = state.modules.find(m => m.id === moduleId);
    if (!module) {
      throw new Error(`Module not found: ${moduleId}`);
    }

    try {
      const result = await window.electronAPI.executeScript({
        scriptPath: module.path,
        args: Object.entries(parameters).map(([key, value]) => `-${key} ${JSON.stringify(value)}`),
        options: { streamOutput: true }
      });

      return result;
    } catch (error: any) {
      console.error(`Failed to execute module ${moduleId}:`, error);
      throw error;
    }
  }, [state.modules]);

  /**
   * Refresh module list on mount
   */
  useEffect(() => {
    discoverModules();
  }, [discoverModules]);

  return {
    state,
    discoverModules,
    getModulesByCategory,
    searchModules,
    getModuleById,
    executeModule
  };
}
