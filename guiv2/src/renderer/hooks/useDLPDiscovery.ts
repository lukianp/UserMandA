import { useDiscovery } from "./useDiscovery";
export function useDLPDiscovery(profileId: string){
  return useDiscovery("DLP", profileId);
}
