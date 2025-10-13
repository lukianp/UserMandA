import { useDiscovery } from "./useDiscovery";
export function useGraphDiscovery(profileId: string){
  return useDiscovery("Graph", profileId);
}
