import { useDiscovery } from "./useDiscovery";
export function useExternalIdentityDiscovery(profileId: string){
  return useDiscovery("ExternalIdentity", profileId);
}
