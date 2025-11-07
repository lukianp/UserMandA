import { useDiscovery } from "./useDiscovery";
export function usePaloAltoDiscovery(profileId: string){
  return useDiscovery("PaloAlto", profileId);
}
