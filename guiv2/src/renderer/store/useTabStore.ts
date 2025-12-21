import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TabInfo {
  id: string;
  title: string;
  type: string;
  data?: any;
  isActive?: boolean;
  isDirty?: boolean;
}

export interface TabStore {
  tabs: TabInfo[];
  activeTabId: string | null;
  addTab: (tabInfo: TabInfo) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<TabInfo>) => void;
  closeAllTabs: () => void;
  getTabById: (tabId: string) => TabInfo | undefined;
}

export const useTabStore = create<TabStore>()(
  persist(
    (set: any, get: any) => ({
      tabs: [] as TabInfo[],
      activeTabId: null as string | null,

      addTab: (tabInfo: TabInfo) => {
        set((state: any) => {
          const newTabs = [...state.tabs, { ...tabInfo, isActive: true }];
          return {
            tabs: newTabs,
            activeTabId: tabInfo.id,
          };
        });
      },

      removeTab: (tabId: string) => {
        set((state: any) => {
          const newTabs = state.tabs.filter((t: TabInfo) => t.id !== tabId);
          let newActiveTabId = state.activeTabId;

          if (state.activeTabId === tabId) {
            const removedIndex = state.tabs.findIndex((t: TabInfo) => t.id === tabId);
            if (newTabs.length > 0) {
              newActiveTabId = newTabs[Math.min(removedIndex, newTabs.length - 1)].id;
            } else {
              newActiveTabId = null;
            }
          }

          return {
            tabs: newTabs,
            activeTabId: newActiveTabId,
          };
        });
      },

      setActiveTab: (tabId: string) => {
        set((state: any) => ({
          activeTabId: tabId,
          tabs: state.tabs.map((t: TabInfo) => ({
            ...t,
            isActive: t.id === tabId,
          })),
        }));
      },

      updateTab: (tabId: string, updates: Partial<TabInfo>) => {
        set((state: any) => ({
          tabs: state.tabs.map((t: TabInfo) =>
            t.id === tabId ? { ...t, ...updates } : t
          ),
        }));
      },

      closeAllTabs: () => {
        set(() => ({
          tabs: [],
          activeTabId: null,
        }));
      },

      getTabById: (tabId: string) => {
        return get().tabs.find((t: TabInfo) => t.id === tabId);
      },
    }),
    {
      name: 'tab-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
