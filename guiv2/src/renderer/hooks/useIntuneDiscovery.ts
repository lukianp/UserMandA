import { useDiscovery } from "./useDiscovery";
export function useIntuneDiscovery(profileId: string){
  return useDiscovery("Intune", profileId);
}
