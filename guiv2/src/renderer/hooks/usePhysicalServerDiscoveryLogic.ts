import { useState, useCallback, useEffect, useRef } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';

export const usePhysicalServerDiscoveryLogic = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);
  const { addResult, getResultsByModuleName } = useDiscoveryStore();
  const currentTokenRef = useRef<string | null>(null);

  const [state, setState] = useState<{
    config: { timeout: number };
    result: any;
    isDiscovering: boolean;
    progress: { current: number; total: number; message: string; percentage: number };
    error: string | null;
  }>({
    config: { timeout: 300000 },
    result: null,
    isDiscovering: false,
    progress: { current: 0, total: 100, message: '', percentage: 0 },
    error: null,
  });

  // Load previous results
  useEffect(() => {
    const previousResults = getResultsByModuleName('PhysicalServerDiscovery');
    if (previousResults && previousResults.length > 0) {
      setState(prev => ({ ...prev, result: previousResults[previousResults.length - 1].additionalData }));
    }
  }, [getResultsByModuleName]);

  // Event listeners with EMPTY dependency array
  useEffect(() => {
    const unsubscribeComplete = window.electron?.onDiscoveryComplete?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        const discoveryResult = {
          id: `physicalserver-discovery-${Date.now()}`,
          name: 'Physical Server Discovery',
          moduleName: 'PhysicalServerDiscovery',
          displayName: 'Physical Server Discovery',
          itemCount: data?.result?.totalItems || 0,
          discoveryTime: new Date().toISOString(),
          duration: data.duration || 0,
          status: 'Completed',
          filePath: data?.result?.outputPath || '',
          success: true,
          summary: `Discovered ${data?.result?.totalItems || 0} items`,
          errorMessage: '',
          additionalData: data.result,
          createdAt: new Date().toISOString(),
        };
        setState(prev => ({ ...prev, result: data.result, isDiscovering: false }));
        addResult(discoveryResult);
      }
    });

    const unsubscribeError = window.electron?.onDiscoveryError?.((data) => {
      if (data.executionId === currentTokenRef.current) {
        setState(prev => ({ ...prev, isDiscovering: false, error: data.error }));
      }
    });

    return () => { unsubscribeComplete?.(); unsubscribeError?.(); };
  }, []);

  const startDiscovery = useCallback(async () => {
    if (!selectedSourceProfile) {
      setState(prev => ({ ...prev, error: 'No profile selected' }));
      return;
    }

    const token = `physicalserver-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    currentTokenRef.current = token;
    setState(prev => ({ ...prev, isDiscovering: true, error: null }));

    try {
      await window.electron.executeDiscovery({
        moduleName: 'PhysicalServer',
        parameters: { IncludeHardware: true, IncludeBIOS: true },
        executionOptions: { timeout: 300000, showWindow: false },
        executionId: token,
      });
    } catch (error: any) {
      setState(prev => ({ ...prev, isDiscovering: false, error: error.message }));
    }
  }, [selectedSourceProfile]);

  const cancelDiscovery = useCallback(async () => {
    if (currentTokenRef.current) {
      await window.electron.cancelDiscovery(currentTokenRef.current);
    }
  }, []);

  return { ...state, startDiscovery, cancelDiscovery };
};
