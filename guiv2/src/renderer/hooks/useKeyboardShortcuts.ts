/**
 * Keyboard Shortcuts Hook
 *
 * Global keyboard shortcuts for the application.
 * Handles common actions like opening command palette, closing tabs, etc.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTabStore } from '../store/useTabStore';
import { useModalStore } from '../store/useModalStore';

/**
 * Keyboard shortcuts configuration
 */
export interface KeyboardShortcut {
  /** Key combination (e.g., 'k', 's', 'f') */
  key: string;
  /** Require Ctrl key */
  ctrl?: boolean;
  /** Require Alt key */
  alt?: boolean;
  /** Require Shift key */
  shift?: boolean;
  /** Handler function */
  handler: () => void;
  /** Description for command palette */
  description: string;
  /** Prevent default browser behavior */
  preventDefault?: boolean;
}

/**
 * Global keyboard shortcuts hook
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { selectedTabId, openTab, closeTab, closeAllTabs } = useTabStore();
  const { openCommandPalette, closeAllModals } = useModalStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette (Ctrl+K or Ctrl+P)
      if ((e.ctrlKey && e.key === 'k') || (e.ctrlKey && e.key === 'p' && !e.shiftKey)) {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      // Escape - close modals/dialogs
      if (e.key === 'Escape') {
        closeAllModals();
        return;
      }

      // Close Current Tab (Ctrl+W)
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        if (selectedTabId) {
          closeTab(selectedTabId);
        }
        return;
      }

      // New Tab (Ctrl+T)
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        openTab({
          title: 'New Tab',
          component: 'OverviewView',
          closable: true,
        });
        return;
      }

      // Save (Ctrl+S)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        // Trigger save event for current view
        const saveEvent = new CustomEvent('app:save');
        window.dispatchEvent(saveEvent);
        return;
      }

      // Focus Search (Ctrl+F)
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        // Focus the first search input on the page
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="text"][placeholder*="Search" i], input[type="search"]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Refresh (F5 or Ctrl+R)
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r' && !e.shiftKey)) {
        if (process.env.NODE_ENV !== 'development') {
          e.preventDefault();
          // Trigger refresh event for current view
          const refreshEvent = new CustomEvent('app:refresh');
          window.dispatchEvent(refreshEvent);
        }
        return;
      }

      // Export (Ctrl+E)
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        // Trigger export event for current view
        const exportEvent = new CustomEvent('app:export');
        window.dispatchEvent(exportEvent);
        return;
      }

      // New Profile (Ctrl+N)
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        // Trigger new profile event
        const newProfileEvent = new CustomEvent('app:new-profile');
        window.dispatchEvent(newProfileEvent);
        return;
      }

      // Open Settings (Ctrl+O)
      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        navigate('/settings');
        return;
      }

      // Close All Tabs (Ctrl+Shift+W)
      if (e.ctrlKey && e.shiftKey && e.key === 'W') {
        e.preventDefault();
        if (confirm('Close all tabs?')) {
          closeAllTabs();
        }
        return;
      }

      // Navigate to Overview (Ctrl+Shift+H)
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        navigate('/');
        return;
      }

      // Navigate to Discovery (Ctrl+Shift+D)
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        navigate('/discovery');
        return;
      }

      // Navigate to Users (Ctrl+Shift+U)
      if (e.ctrlKey && e.shiftKey && e.key === 'U') {
        e.preventDefault();
        navigate('/users');
        return;
      }

      // Navigate to Groups (Ctrl+Shift+G)
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        navigate('/groups');
        return;
      }

      // Navigate to Migration (Ctrl+Shift+M)
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        navigate('/migration');
        return;
      }

      // Navigate to Reports (Ctrl+Shift+R)
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        navigate('/reports');
        return;
      }

      // Navigate to Settings (Ctrl+,)
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        navigate('/settings');
        return;
      }

      // Toggle DevTools (Ctrl+Shift+I) - only in development
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        if (process.env.NODE_ENV === 'development') {
          e.preventDefault();
          // DevTools toggle is handled by Electron
        }
        return;
      }

      // Reload App (Ctrl+Shift+R) - only in development
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        if (process.env.NODE_ENV === 'development') {
          e.preventDefault();
          window.location.reload();
        }
        return;
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, selectedTabId, openTab, closeTab, closeAllTabs, openCommandPalette, closeAllModals]);
};

/**
 * Get list of all keyboard shortcuts (for command palette)
 */
export const getKeyboardShortcuts = (): KeyboardShortcut[] => [
  {
    key: 'k',
    ctrl: true,
    handler: () => {
      const event = new CustomEvent('app:open-command-palette');
      window.dispatchEvent(event);
    },
    description: 'Open Command Palette',
    preventDefault: true,
  },
  {
    key: 'w',
    ctrl: true,
    handler: () => {
      const event = new CustomEvent('app:close-tab');
      window.dispatchEvent(event);
    },
    description: 'Close Current Tab',
    preventDefault: true,
  },
  {
    key: 't',
    ctrl: true,
    handler: () => {
      const event = new CustomEvent('app:new-tab');
      window.dispatchEvent(event);
    },
    description: 'New Tab',
    preventDefault: true,
  },
  {
    key: 's',
    ctrl: true,
    handler: () => {
      const event = new CustomEvent('app:save');
      window.dispatchEvent(event);
    },
    description: 'Save',
    preventDefault: true,
  },
  {
    key: 'f',
    ctrl: true,
    handler: () => {
      const event = new CustomEvent('app:focus-search');
      window.dispatchEvent(event);
    },
    description: 'Focus Search',
    preventDefault: true,
  },
  {
    key: 'p',
    ctrl: true,
    handler: () => {
      const event = new CustomEvent('app:print');
      window.dispatchEvent(event);
    },
    description: 'Print',
    preventDefault: true,
  },
  {
    key: 'w',
    ctrl: true,
    shift: true,
    handler: () => {
      const event = new CustomEvent('app:close-all-tabs');
      window.dispatchEvent(event);
    },
    description: 'Close All Tabs',
    preventDefault: true,
  },
  {
    key: 'h',
    ctrl: true,
    shift: true,
    handler: () => {
      const event = new CustomEvent('app:goto-overview');
      window.dispatchEvent(event);
    },
    description: 'Go to Overview',
    preventDefault: true,
  },
  {
    key: 'd',
    ctrl: true,
    shift: true,
    handler: () => {
      const event = new CustomEvent('app:goto-discovery');
      window.dispatchEvent(event);
    },
    description: 'Go to Discovery',
    preventDefault: true,
  },
  {
    key: 'u',
    ctrl: true,
    shift: true,
    handler: () => {
      const event = new CustomEvent('app:goto-users');
      window.dispatchEvent(event);
    },
    description: 'Go to Users',
    preventDefault: true,
  },
  {
    key: 'g',
    ctrl: true,
    shift: true,
    handler: () => {
      const event = new CustomEvent('app:goto-groups');
      window.dispatchEvent(event);
    },
    description: 'Go to Groups',
    preventDefault: true,
  },
  {
    key: 'm',
    ctrl: true,
    shift: true,
    handler: () => {
      const event = new CustomEvent('app:goto-migration');
      window.dispatchEvent(event);
    },
    description: 'Go to Migration',
    preventDefault: true,
  },
  {
    key: 'r',
    ctrl: true,
    shift: true,
    handler: () => {
      const event = new CustomEvent('app:goto-reports');
      window.dispatchEvent(event);
    },
    description: 'Go to Reports',
    preventDefault: true,
  },
  {
    key: ',',
    ctrl: true,
    handler: () => {
      const event = new CustomEvent('app:open-settings');
      window.dispatchEvent(event);
    },
    description: 'Open Settings',
    preventDefault: true,
  },
];

/**
 * Format keyboard shortcut for display
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
};

export default useKeyboardShortcuts;
