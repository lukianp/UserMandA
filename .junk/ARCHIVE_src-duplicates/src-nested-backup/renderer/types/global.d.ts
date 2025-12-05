/**
 * Global Type Definitions
 * Augments global interfaces for backward compatibility
 */

import { ElectronAPI } from './electron';

/**
 * Augment the global Window interface with Electron API
 * Provides backward compatibility for window.electron vs window.electronAPI
 */
declare global {
  interface Window {
    /** Modern Electron API interface */
    electronAPI: ElectronAPI;
    /** Back-compat alias: some code references window.electron */
    electron: ElectronAPI;
  }
}

export {};