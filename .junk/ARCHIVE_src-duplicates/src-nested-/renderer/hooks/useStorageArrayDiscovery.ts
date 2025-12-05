import { useDiscovery } from "./useDiscovery";
export function useStorageArrayDiscovery(profileId: string){
  return useDiscovery("StorageArray", profileId);
}
