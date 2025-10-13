import { useDiscovery } from "./useDiscovery";
export function useApplicationDiscovery(profileId: string){
  return useDiscovery("Application", profileId);
}
