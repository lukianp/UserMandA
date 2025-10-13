import { useDiscovery } from "./useDiscovery";
export function useActiveDirectoryDiscovery(profileId: string){
  return useDiscovery("ActiveDirectory", profileId);
}
