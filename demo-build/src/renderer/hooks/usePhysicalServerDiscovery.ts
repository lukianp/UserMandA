import { useDiscovery } from "./useDiscovery";
export function usePhysicalServerDiscovery(profileId: string){
  return useDiscovery("PhysicalServer", profileId);
}
