import { useDiscovery } from "./useDiscovery";
export function useNetworkInfrastructureDiscovery(profileId: string){
  return useDiscovery("NetworkInfrastructure", profileId);
}
