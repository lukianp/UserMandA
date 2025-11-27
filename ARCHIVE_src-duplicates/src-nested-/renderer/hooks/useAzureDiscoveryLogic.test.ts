import { renderHook, act } from '@testing-library/react';

import { useAzureDiscoveryLogic } from './useAzureDiscoveryLogic';

jest.mock('../store/useProfileStore', () => ({
  useProfileStore: jest.fn(),
}));

jest.mock('../store/useDiscoveryStore', () => ({
  useDiscoveryStore: jest.fn(),
}));

jest.mock('../lib/electron-api-fallback', () => ({
  getElectronAPI: jest.fn(),
}));

type DiscoveryCallback = (data: any) => void;

describe('useAzureDiscoveryLogic', () => {
  const mockProfile = { id: 'profile-1', name: 'Test Profile', tenantId: 'tenant-1' };
  const mockDiscoveryStore = {
    addResult: jest.fn(),
    setProgress: jest.fn(),
  };
  const writeFileMock = jest.fn();

  let progressCallback: DiscoveryCallback | undefined;
  let completeCallback: DiscoveryCallback | undefined;

  beforeEach(() => {
    jest.resetAllMocks();
    progressCallback = undefined;
    completeCallback = undefined;

    const electronMock: any = {
      executeDiscovery: jest.fn().mockResolvedValue(undefined),
      cancelDiscovery: jest.fn(),
      onDiscoveryProgress: jest.fn((cb: DiscoveryCallback) => {
        progressCallback = cb;
        return jest.fn();
      }),
      onDiscoveryOutput: jest.fn(() => jest.fn()),
      onDiscoveryComplete: jest.fn((cb: DiscoveryCallback) => {
        completeCallback = cb;
        return jest.fn();
      }),
      onDiscoveryError: jest.fn(() => jest.fn()),
    };

    Object.defineProperty(window, 'electron', {
      configurable: true,
      value: electronMock,
    });

    const profileStoreModule = jest.requireMock('../store/useProfileStore') as { useProfileStore: jest.Mock };
    const discoveryStoreModule = jest.requireMock('../store/useDiscoveryStore') as { useDiscoveryStore: jest.Mock };
    const electronFallbackModule = jest.requireMock('../lib/electron-api-fallback') as { getElectronAPI: jest.Mock };

    profileStoreModule.useProfileStore.mockReturnValue({ selectedTargetProfile: mockProfile });
    discoveryStoreModule.useDiscoveryStore.mockReturnValue(mockDiscoveryStore);
    electronFallbackModule.getElectronAPI.mockReturnValue({ writeFile: writeFileMock });
  });

  afterEach(() => {
    delete (window as any).electron;
  });

  it('initializes with default form state', () => {
    const { result } = renderHook(() => useAzureDiscoveryLogic());

    expect(result.current.formData).toMatchObject({
      tenantId: '',
      includeUsers: true,
      includeGroups: true,
    });
    expect(result.current.selectedProfile).toEqual(mockProfile);
  });

  it('starts discovery when form is valid and processes completion', async () => {
    const { result } = renderHook(() => useAzureDiscoveryLogic());

    act(() => {
      result.current.updateFormField('tenantId', 'example-tenant');
    });
    expect(result.current.isFormValid).toBe(true);

    await act(async () => {
      await result.current.startDiscovery();
    });

    const executeArgs = ((window as any).electron.executeDiscovery as jest.Mock).mock.calls[0][0];

    expect(((window as any).electron).executeDiscovery).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleName: 'AzureDiscovery',
        executionId: expect.stringMatching(/^azure-discovery-/),
      }),
    );

    act(() => {
      progressCallback?.({
        executionId: executeArgs.executionId,
        percentage: 50,
        currentPhase: 'Processing',
        itemsProcessed: 10,
        totalItems: 20,
      });
    });

    expect(mockDiscoveryStore.setProgress).toHaveBeenCalled();

    act(() => {
      completeCallback?.({
        executionId: executeArgs.executionId,
        result: { totalItems: 5, outputPath: 'results.json' },
        duration: 1000,
      });
    });

    expect(result.current.results).toHaveLength(1);
    expect(mockDiscoveryStore.addResult).toHaveBeenCalled();
  });

  it('exports results using the electron API helper', async () => {
    const { result } = renderHook(() => useAzureDiscoveryLogic());

    act(() => {
      result.current.updateFormField('tenantId', 'tenant');
    });

    await act(async () => {
      await result.current.startDiscovery();
    });

    const executionId = ((window as any).electron.executeDiscovery as jest.Mock).mock.calls[0][0].executionId;

    act(() => {
      completeCallback?.({
        executionId,
        result: { totalItems: 3, outputPath: 'azure.json' },
        duration: 500,
      });
    });

    act(() => {
      result.current.exportResults();
    });

    expect(writeFileMock).toHaveBeenCalledWith(
      expect.stringContaining('azure-discovery-'),
      expect.any(String),
    );
  });
});
