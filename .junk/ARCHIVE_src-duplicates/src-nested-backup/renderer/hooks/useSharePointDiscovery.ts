import { useDiscovery } from "./useDiscovery";
export function useSharePointDiscovery(profileId: string){
  return useDiscovery("SharePoint", profileId);
}
