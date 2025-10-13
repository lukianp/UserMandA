import { useDiscovery } from "./useDiscovery";
export function useGCPDiscovery(profileId: string){
  return useDiscovery("GCP", profileId);
}
