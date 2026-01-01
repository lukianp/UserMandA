import { useDiscovery } from "./useDiscovery";
export function useDiscoveryModuleBaseDiscovery(profileId: string){
  return useDiscovery("DiscoveryModuleBase", profileId);
}
