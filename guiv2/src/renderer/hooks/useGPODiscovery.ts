import { useDiscovery } from "./useDiscovery";
export function useGPODiscovery(profileId: string){
  return useDiscovery("GPO", profileId);
}
