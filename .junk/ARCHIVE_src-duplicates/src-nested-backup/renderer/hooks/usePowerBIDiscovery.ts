import { useDiscovery } from "./useDiscovery";
export function usePowerBIDiscovery(profileId: string){
  return useDiscovery("PowerBI", profileId);
}
