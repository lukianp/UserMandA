import { useDiscovery } from "./useDiscovery";
export function useBackupRecoveryDiscovery(profileId: string){
  return useDiscovery("BackupRecovery", profileId);
}
