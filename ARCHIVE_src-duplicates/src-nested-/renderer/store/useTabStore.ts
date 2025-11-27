/**
 * Tab Store
 *
 * Manages the tabbed interface navigation.
 * Tracks open tabs, selected tab, and provides tab lifecycle operations.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Tab {
  /** Unique tab identifier */
  id: string;
  /** Display title shown in tab header */
  title: string;
  /** Component name to render (maps to view component) */
  component: string;
  /** Icon identifier (Lucide icon name) */
  icon?: string;
  /** Whether tab can be closed */
  closable: boolean;
  /** Optional data to pass to component */
  data?: any;
  /** Timestamp when tab was opened */
  openedAt: number;
}

interface TabState {
  // State
  tabs: Tab[];
  selectedTabId: string | null;

  // Actions
  openTab: (tab: Omit<Tab, 'id' | 'openedAt'>) => void;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (tabId: string) => void;
  setSelectedTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  getTab: (tabId: string) => Tab | undefined;
  getSelectedTab: () => Tab | undefined;
}

export const useTabStore = create<TabState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        tabs: [
          // Always start with Overview tab
          {
            id: 'overview',
            title: 'Overview',
            component: 'OverviewView',
            icon: 'LayoutDashboard',
            closable: false,
            openedAt: Date.now(),
          },
        ],
        selectedTabId: 'overview',

        // Actions

        /**
         * Open a new tab or switch to existing tab with same component
         */
        openTab: (tabInfo) => {
          const { tabs } = get();

          // Check if tab with same component already exists
          const existingTab = tabs.find(t => t.component === tabInfo.component);

          if (existingTab) {
            // Switch to existing tab
            set({ selectedTabId: existingTab.id });
          } else {
            // Create new tab
            const newTab: Tab = {
              ...tabInfo,
              id: crypto.randomUUID(),
              openedAt: Date.now(),
            };

            set({
              tabs: [...tabs, newTab],
              selectedTabId: newTab.id,
            });
          }
        },

        /**
         * Close a tab by ID
         */
        closeTab: (tabId) => {
          const { tabs, selectedTabId } = get();

          const tab = tabs.find(t => t.id === tabId);
          if (!tab) return;

          // Don't close non-closable tabs
          if (!tab.closable) {
            console.warn(`Cannot close non-closable tab: ${tabId}`);
            return;
          }

          const newTabs = tabs.filter(t => t.id !== tabId);

          // If closing the selected tab, select the previous tab or first tab
          let newSelectedTabId = selectedTabId;
          if (selectedTabId === tabId) {
            const closedIndex = tabs.findIndex(t => t.id === tabId);
            if (closedIndex > 0) {
              newSelectedTabId = tabs[closedIndex - 1].id;
            } else if (newTabs.length > 0) {
              newSelectedTabId = newTabs[0].id;
            } else {
              newSelectedTabId = null;
            }
          }

          set({
            tabs: newTabs,
            selectedTabId: newSelectedTabId,
          });
        },

        /**
         * Close all closable tabs
         */
        closeAllTabs: () => {
          const { tabs } = get();
          const nonClosableTabs = tabs.filter(t => !t.closable);

          set({
            tabs: nonClosableTabs,
            selectedTabId: nonClosableTabs.length > 0 ? nonClosableTabs[0].id : null,
          });
        },

        /**
         * Close all tabs except the specified one
         */
        closeOtherTabs: (tabId) => {
          const { tabs } = get();
          const tab = tabs.find(t => t.id === tabId);

          if (!tab) return;

          // Keep non-closable tabs and the specified tab
          const newTabs = tabs.filter(t => !t.closable || t.id === tabId);

          set({
            tabs: newTabs,
            selectedTabId: tabId,
          });
        },

        /**
         * Set the currently selected tab
         */
        setSelectedTab: (tabId) => {
          const { tabs } = get();

          if (tabs.some(t => t.id === tabId)) {
            set({ selectedTabId: tabId });
          } else {
            console.warn(`Tab ${tabId} not found`);
          }
        },

        /**
         * Update tab properties
         */
        updateTab: (tabId, updates) => {
          const { tabs } = get();

          const newTabs = tabs.map(t =>
            t.id === tabId ? { ...t, ...updates } : t
          );

          set({ tabs: newTabs });
        },

        /**
         * Get a tab by ID
         */
        getTab: (tabId) => {
          return get().tabs.find(t => t.id === tabId);
        },

        /**
         * Get the currently selected tab
         */
        getSelectedTab: () => {
          const { tabs, selectedTabId } = get();
          if (!selectedTabId) return undefined;
          return tabs.find(t => t.id === selectedTabId);
        },
      }),
      {
        name: 'tab-storage',
        // Persist tabs and selected tab
        partialize: (state) => ({
          tabs: state.tabs,
          selectedTabId: state.selectedTabId,
        }),
      }
    ),
    {
      name: 'TabStore',
    }
  )
);
