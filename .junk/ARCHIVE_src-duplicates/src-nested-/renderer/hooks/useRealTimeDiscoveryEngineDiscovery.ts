import { useDiscovery } from "./useDiscovery";
export function useRealTimeDiscoveryEngineDiscovery(profileId: string){
  return useDiscovery("RealTimeDiscoveryEngine", profileId);
}
