/**
 * Navigation Store
 *
 * Mirrors C# TabsService pattern from GUI/Services/TabsService.cs
 * Manages dynamic tab creation, closing, and state persistence
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Tab Item - mirrors C# TabItem class
 */
export interface TabItem {
  /** Unique tab identifier */
  id: string;
  /** Unique key for tab (prevents duplicates) */
  key: string;
  /** Tab title */
  title: string;
  /** Optional data payload */
  data?: any;
  /** Whether tab is currently active */
  isActive: boolean;
  /** Creation timestamp */
  createdAt: Date;
  /** Last accessed timestamp */
  lastAccessed: Date;
}

interface NavigationState {
  // State - mirrors C# TabsService.Tabs property
  tabs: TabItem[];
  activeTab: TabItem | null;
  hasTabs: boolean;

  // Actions - mirrors C# TabsService methods
  openTab: (key: string, title: string, data?: any) => Promise<string>;
  closeTab: (tabId: string) => Promise<void>;
  closeAllTabs: () => Promise<void>;
  setActiveTab: (tabId: string) => void;
  getTabById: (tabId: string) => TabItem | undefined;
  getTabByKey: (key: string) => TabItem | undefined;

  // Mirror C# ShowAllTabsCommand
  showAllTabs: () => void;

  // Persistence like C# session state
  persistTabs: () => void;
  restoreTabs: () => Promise<void>;
}

export const useNavigationStore = create<NavigationState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        tabs: [],
        activeTab: null,
        hasTabs: false,

        /**
         * Open a new tab or activate existing tab
         * Mirrors C# TabsService.OpenTab method
         */
        openTab: async (key, title, data) => {
          const existingTab = get().getTabByKey(key);

          if (existingTab) {
            // Mirror C# - activate existing tab instead of creating duplicate
            set({ activeTab: existingTab });
            return existingTab.id;
          }

          // Mirror C# TabItem creation
          const newTab: TabItem = {
            id: crypto.randomUUID(),
            key,
            title,
            data,
            isActive: true,
            createdAt: new Date(),
            lastAccessed: new Date(),
          };

          const updatedTabs = [...get().tabs.map((t) => ({ ...t, isActive: false })), newTab];

          set({
            tabs: updatedTabs,
            activeTab: newTab,
            hasTabs: true,
          });

          // Persist like C# session management
          get().persistTabs();

          return newTab.id;
        },

        /**
         * Close a tab by ID
         * Mirrors C# TabsService.CloseTab method
         */
        closeTab: async (tabId) => {
          const currentTabs = get().tabs;
          const tabToClose = currentTabs.find((t) => t.id === tabId);

          if (!tabToClose) return;

          const remainingTabs = currentTabs.filter((t) => t.id !== tabId);
          let newActiveTab = get().activeTab;

          // Mirror C# tab activation logic
          if (get().activeTab?.id === tabId) {
            // Activate adjacent tab or first tab
            const closedIndex = currentTabs.findIndex((t) => t.id === tabId);
            if (remainingTabs.length > 0) {
              const newActiveIndex = Math.min(closedIndex, remainingTabs.length - 1);
              newActiveTab = remainingTabs[newActiveIndex];
              newActiveTab.isActive = true;
            } else {
              newActiveTab = null;
            }
          }

          set({
            tabs: remainingTabs.map((t) => ({ ...t, isActive: t.id === newActiveTab?.id })),
            activeTab: newActiveTab,
            hasTabs: remainingTabs.length > 0,
          });

          get().persistTabs();
        },

        /**
         * Close all tabs
         * Mirrors C# TabsService.CloseAllTabs method
         */
        closeAllTabs: async () => {
          set({ tabs: [], activeTab: null, hasTabs: false });
          localStorage.removeItem('navigation-tabs');
        },

        /**
         * Set active tab
         * Mirrors C# TabsService.SetActiveTab method
         */
        setActiveTab: (tabId) => {
          const updatedTabs = get().tabs.map((t) => ({
            ...t,
            isActive: t.id === tabId,
            lastAccessed: t.id === tabId ? new Date() : t.lastAccessed,
          }));

          set({
            tabs: updatedTabs,
            activeTab: updatedTabs.find((t) => t.id === tabId) || null,
          });
        },

        /**
         * Get tab by ID
         */
        getTabById: (tabId) => {
          return get().tabs.find((t) => t.id === tabId);
        },

        /**
         * Get tab by unique key
         */
        getTabByKey: (key) => {
          return get().tabs.find((t) => t.key === key);
        },

        /**
         * Show all tabs (for command palette or tab switcher)
         * Mirrors C# ShowAllTabs implementation
         */
        showAllTabs: () => {
          console.log('All tabs:', get().tabs);
          // Could trigger a modal or command palette showing all tabs
        },

        /**
         * Persist tabs to storage
         * Mirrors C# session persistence
         */
        persistTabs: () => {
          const tabsToPersist = get().tabs.map((t) => ({
            id: t.id,
            key: t.key,
            title: t.title,
            data: t.data,
            isActive: t.isActive,
            createdAt: t.createdAt,
            lastAccessed: t.lastAccessed,
          }));

          localStorage.setItem('navigation-tabs', JSON.stringify(tabsToPersist));
        },

        /**
         * Restore tabs from storage
         * Mirrors C# session restoration
         */
        restoreTabs: async () => {
          try {
            const persisted = localStorage.getItem('navigation-tabs');
            if (persisted) {
              const restoredTabs = JSON.parse(persisted).map((t: any) => ({
                ...t,
                createdAt: new Date(t.createdAt),
                lastAccessed: new Date(t.lastAccessed),
              }));

              const activeTab = restoredTabs.find((t: TabItem) => t.isActive) || null;

              set({
                tabs: restoredTabs,
                activeTab,
                hasTabs: restoredTabs.length > 0,
              });
            }
          } catch (error) {
            console.error('Failed to restore tabs:', error);
          }
        },
      }),
      {
        name: 'navigation-storage',
        partialize: (state) => ({
          tabs: state.tabs,
          activeTab: state.activeTab,
        }),
      }
    ),
    {
      name: 'NavigationStore',
    }
  )
);
