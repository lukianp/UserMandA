import { useDiscovery } from "./useDiscovery";
export function useEntraIDAppDiscovery(profileId: string){
  return useDiscovery("EntraIDApp", profileId);
}
