import { useDiscovery } from "./useDiscovery";
export function useDiscoveryBaseDiscovery(profileId: string){
  return useDiscovery("DiscoveryBase", profileId);
}
