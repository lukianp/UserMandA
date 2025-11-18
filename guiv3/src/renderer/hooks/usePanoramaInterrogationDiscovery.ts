import { useDiscovery } from "./useDiscovery";
export function usePanoramaInterrogationDiscovery(profileId: string){
  return useDiscovery("PanoramaInterrogation", profileId);
}
