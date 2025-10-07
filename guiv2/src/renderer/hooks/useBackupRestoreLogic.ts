import { useState } from 'react';

export interface BackupRestoreLogic {
  error: string | null;
  isLoading: boolean;
}

export const useBackupRestoreLogic = (): BackupRestoreLogic => {
  const [error] = useState<string | null>(null);
  const [isLoading] = useState<boolean>(false);

  return {
    error,
    isLoading,
  };
};