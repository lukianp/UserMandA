import { useDiscovery } from "./useDiscovery";
export function useFileServerDiscovery(profileId: string){
  return useDiscovery("FileServer", profileId);
}
