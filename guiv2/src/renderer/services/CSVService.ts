import Papa from 'papaparse';

import { useProfileStore } from '../stores/profileStore';

export class CSVService {
  private currentProfile: string | null = null;
  private watchers = new Map<string, () => void>();

  async loadCSVData(fileName: string): Promise<any[]> {
    const currentProfile = useProfileStore.getState().currentProfile;
    if (!currentProfile) {
      throw new Error('No active profile selected');
    }

    const filePath = await window.electron.fs.getCSVPath(currentProfile.companyName, fileName);
    const fileContent = await window.electron.fs.readFile(filePath);

    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value.trim(),
        complete: (results) => {
          if (results.errors.length > 0) {
            console.warn('CSV parsing warnings:', results.errors);
          }
          resolve(results.data);
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      });
    });
  }

  watchCSVFiles(callback: () => void): () => void {
    const currentProfile = useProfileStore.getState().currentProfile;
    if (!currentProfile) {
      return () => {};
    }

    const watchId = `${currentProfile.id}-${Date.now()}`;

    const unwatch = window.electron.fs.watchDirectory(
      await window.electron.fs.getRawDataPath(currentProfile.companyName),
      '*.csv',
      callback
    );

    this.watchers.set(watchId, unwatch);

    return () => {
      const watchFn = this.watchers.get(watchId);
      if (watchFn) {
        watchFn();
        this.watchers.delete(watchId);
      }
    };
  }

  clearAllWatchers(): void {
    this.watchers.forEach(unwatch => unwatch());
    this.watchers.clear();
  }
}

export const csvService = new CSVService();