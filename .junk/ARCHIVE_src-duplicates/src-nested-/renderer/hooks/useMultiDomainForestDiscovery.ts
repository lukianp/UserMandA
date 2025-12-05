import { useDiscovery } from "./useDiscovery";
export function useMultiDomainForestDiscovery(profileId: string){
  return useDiscovery("MultiDomainForest", profileId);
}
