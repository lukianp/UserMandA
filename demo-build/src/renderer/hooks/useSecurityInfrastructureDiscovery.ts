import { useDiscovery } from "./useDiscovery";
export function useSecurityInfrastructureDiscovery(profileId: string){
  return useDiscovery("SecurityInfrastructure", profileId);
}
