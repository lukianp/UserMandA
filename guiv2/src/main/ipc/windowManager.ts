import { BrowserWindow } from 'electron';

/**
 * Window management utilities
 * Provides secure window lifecycle management with proper event cleanup
 */
export class WindowManager {
  private window: BrowserWindow | null = null;
  private eventListeners: Map<string, () => void> = new Map();

  setWindow(window: BrowserWindow | null): void {
    this.cleanup();
    this.window = window;

    if (window) {
      const onClosed = () => {
        this.window = null;
        this.cleanup();
      };
      window.on('closed', onClosed);
      this.eventListeners.set('closed', onClosed);
    }
  }

  getWindow(): BrowserWindow | null {
    return this.window && !this.window.isDestroyed() ? this.window : null;
  }

  hasWindow(): boolean {
    return this.window !== null && !this.window.isDestroyed();
  }

  private cleanup(): void {
    this.eventListeners.forEach((listener, event) => {
      if (this.window && !this.window.isDestroyed()) {
        this.window.removeListener(event as any, listener);
      }
    });
    this.eventListeners.clear();
  }
}

export const windowManager = new WindowManager();
