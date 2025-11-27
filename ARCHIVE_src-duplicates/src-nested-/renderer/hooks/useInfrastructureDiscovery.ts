import { useDiscovery } from "./useDiscovery";
export function useInfrastructureDiscovery(profileId: string){
  return useDiscovery("Infrastructure", profileId);
}
