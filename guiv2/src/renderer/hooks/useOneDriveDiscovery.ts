import { useDiscovery } from "./useDiscovery";
export function useOneDriveDiscovery(profileId: string){
  return useDiscovery("OneDrive", profileId);
}
