import { useState, useEffect, useCallback, useMemo } from 'react';
import { useProfileStore } from '../../../store/useProfileStore';
import { LicensingHubState, LicensingAlert, EffectiveLicensePosition } from '../../../../shared/types/licensing';
import { licensingHubStore } from '../services/licensingHubStore';
import { detectDiscoveryFiles, ingestEntraUsers, ingestM365Assignments, ingestExchangeMailboxes, mergeIngestedData } from '../ingest';
import { computeEffectivePositions, generateAlerts, dashboardMetrics, DashboardMetrics } from '../compute';

interface LicensingHubHookState {
  state: LicensingHubState | null;
  isLoading: boolean;
  error: string | null;
  metrics: DashboardMetrics | null;
  lastIngestedAt: Date | null;
}

export interface LicensingHubActions {
  // Data operations
  reloadData: () => Promise<void>;
  runIngestion: () => Promise<void>;
  saveState: () => Promise<void>;

  // CRUD operations
  addAgreement: (agreement: Omit<import('../../../../shared/types/licensing').LicensingAgreement, 'agreementId'>) => Promise<void>;
  addEntitlement: (entitlement: Omit<import('../../../../shared/types/licensing').LicenseEntitlement, 'entitlementId'>) => Promise<void>;
  addProduct: (product: Omit<import('../../../../shared/types/licensing').LicensingProduct, 'productId'>) => Promise<void>;
  addVendor: (vendor: Omit<import('../../../../shared/types/licensing').LicensingVendor, 'vendorId'>) => Promise<void>;

  // Computed data
  recomputeAll: () => void;
}

export const useLicensingHub = () => {
  const selectedSourceProfile = useProfileStore((state) => state.selectedSourceProfile);

  const [hookState, setHookState] = useState<LicensingHubHookState>({
    state: null,
    isLoading: true,
    error: null,
    metrics: null,
    lastIngestedAt: null,
  });

  // Load initial data
  const loadData = useCallback(async () => {
    if (!selectedSourceProfile?.companyName) {
      setHookState(prev => ({
        ...prev,
        isLoading: false,
        error: 'No profile selected'
      }));
      return;
    }

    setHookState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const state = await licensingHubStore.loadLicensingHubState(selectedSourceProfile.companyName);
      setHookState(prev => ({
        ...prev,
        state,
        isLoading: false,
      }));
    } catch (error) {
      console.error('[useLicensingHub] Failed to load data:', error);
      setHookState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load licensing data',
      }));
    }
  }, [selectedSourceProfile?.companyName]);

  // Run ingestion from discovery files
  const runIngestion = useCallback(async () => {
    if (!selectedSourceProfile?.companyName || !hookState.state) return;

    setHookState(prev => ({ ...prev, isLoading: true }));

    try {
      const basePath = selectedSourceProfile.dataPath || `C:\\DiscoveryData\\${selectedSourceProfile.companyName}`;
      const discoveryFiles = await detectDiscoveryFiles(basePath);

      let users: any[] = [];
      let assignments: any[] = [];
      let products: any[] = [];
      let consumptions: any[] = [];

      // Process each discovered file
      for (const file of discoveryFiles) {
        try {
          switch (file.kind) {
            case 'user':
              if (file.module === 'AzureADUsers') {
                users = await ingestEntraUsers(file.filePath);
              }
              break;
            case 'license':
              if (file.module === 'LicensingDiscovery') {
                const result = await ingestM365Assignments(file.filePath);
                assignments.push(...result.assignments);
                products.push(...result.products);
              }
              break;
            case 'consumption':
              if (file.module === 'ExchangeDiscovery') {
                const result = await ingestExchangeMailboxes(file.filePath);
                consumptions.push(...result.consumption);
                products.push(...result.products);
              }
              break;
          }
        } catch (fileError) {
          console.warn(`Failed to ingest ${file.filePath}:`, fileError);
        }
      }

      // Merge into state
      const updatedState = mergeIngestedData(
        hookState.state,
        users,
        [], // devices not implemented yet
        assignments,
        products,
        consumptions
      );

      // Save updated state
      await licensingHubStore.saveLicensingHubState(selectedSourceProfile.companyName, updatedState);

      setHookState(prev => ({
        ...prev,
        state: updatedState,
        lastIngestedAt: new Date(),
        isLoading: false,
      }));

    } catch (error) {
      console.error('[useLicensingHub] Ingestion failed:', error);
      setHookState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ingestion failed',
      }));
    }
  }, [selectedSourceProfile?.companyName, hookState.state]);

  // Save current state
  const saveState = useCallback(async () => {
    if (!selectedSourceProfile?.companyName || !hookState.state) return;

    try {
      await licensingHubStore.saveLicensingHubState(selectedSourceProfile.companyName, hookState.state);
    } catch (error) {
      console.error('[useLicensingHub] Save failed:', error);
      setHookState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Save failed',
      }));
    }
  }, [selectedSourceProfile?.companyName, hookState.state]);

  // Recompute effective positions, alerts, and metrics
  const recomputeAll = useCallback(() => {
    if (!hookState.state) return;

    setHookState(prev => {
      const state = prev.state!;
      const effectivePositions = computeEffectivePositions(state);
      const alerts = generateAlerts(state);
      const metrics = dashboardMetrics(state);

      return {
        ...prev,
        state: {
          ...state,
          effectivePositions,
          alerts,
        },
        metrics,
      };
    });
  }, [hookState.state]);

  // Add agreement
  const addAgreement = useCallback(async (agreementData: Omit<import('../../../../shared/types/licensing').LicensingAgreement, 'agreementId'>) => {
    if (!hookState.state) return;

    const newAgreement = {
      ...agreementData,
      agreementId: `agreement-${Date.now()}`,
    };

    setHookState(prev => ({
      ...prev,
      state: {
        ...prev.state!,
        agreements: [...prev.state!.agreements, newAgreement],
      },
    }));

    await saveState();
    recomputeAll();
  }, [hookState.state, saveState, recomputeAll]);

  // Add entitlement
  const addEntitlement = useCallback(async (entitlementData: Omit<import('../../../../shared/types/licensing').LicenseEntitlement, 'entitlementId'>) => {
    if (!hookState.state) return;

    const newEntitlement = {
      ...entitlementData,
      entitlementId: `entitlement-${Date.now()}`,
    };

    setHookState(prev => ({
      ...prev,
      state: {
        ...prev.state!,
        entitlements: [...prev.state!.entitlements, newEntitlement],
      },
    }));

    await saveState();
    recomputeAll();
  }, [hookState.state, saveState, recomputeAll]);

  // Add product
  const addProduct = useCallback(async (productData: Omit<import('../../../../shared/types/licensing').LicensingProduct, 'productId'>) => {
    if (!hookState.state) return;

    const newProduct = {
      ...productData,
      productId: `product-${Date.now()}`,
    };

    setHookState(prev => ({
      ...prev,
      state: {
        ...prev.state!,
        products: [...prev.state!.products, newProduct],
      },
    }));

    await saveState();
  }, [hookState.state, saveState]);

  // Add vendor
  const addVendor = useCallback(async (vendorData: Omit<import('../../../../shared/types/licensing').LicensingVendor, 'vendorId'>) => {
    if (!hookState.state) return;

    const newVendor = {
      ...vendorData,
      vendorId: `vendor-${Date.now()}`,
    };

    setHookState(prev => ({
      ...prev,
      state: {
        ...prev.state!,
        vendors: [...prev.state!.vendors, newVendor],
      },
    }));

    await saveState();
  }, [hookState.state, saveState]);

  // Load data on mount and profile change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Recompute when state changes
  useEffect(() => {
    if (hookState.state) {
      recomputeAll();
    }
  }, [hookState.state?.lastUpdatedAt, recomputeAll]);

  // Actions object
  const actions: LicensingHubActions = useMemo(() => ({
    reloadData: loadData,
    runIngestion,
    saveState,
    addAgreement,
    addEntitlement,
    addProduct,
    addVendor,
    recomputeAll,
  }), [loadData, runIngestion, saveState, addAgreement, addEntitlement, addProduct, addVendor, recomputeAll]);

  return {
    // State
    state: hookState.state,
    isLoading: hookState.isLoading,
    error: hookState.error,
    metrics: hookState.metrics,
    lastIngestedAt: hookState.lastIngestedAt,

    // Computed data
    effectivePositions: hookState.state?.effectivePositions || [],
    alerts: hookState.state?.alerts || [],

    // Actions
    ...actions,
  };
};