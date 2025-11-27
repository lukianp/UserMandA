import { useDiscovery } from "./useDiscovery";
export function useExternalIdentityDiscoveryDiscovery(profileId: string){
  return useDiscovery("ExternalIdentityDiscovery", profileId);
}
