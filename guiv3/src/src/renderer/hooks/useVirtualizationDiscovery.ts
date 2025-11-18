import { useDiscovery } from "./useDiscovery";
export function useVirtualizationDiscovery(profileId: string){
  return useDiscovery("Virtualization", profileId);
}
