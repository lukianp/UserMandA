import { useDiscovery } from "./useDiscovery";
export function useVMwareDiscovery(profileId: string){
  return useDiscovery("VMware", profileId);
}
