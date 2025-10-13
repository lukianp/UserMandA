import { useDiscovery } from "./useDiscovery";
export function useAWSDiscovery(profileId: string){
  return useDiscovery("AWS", profileId);
}
