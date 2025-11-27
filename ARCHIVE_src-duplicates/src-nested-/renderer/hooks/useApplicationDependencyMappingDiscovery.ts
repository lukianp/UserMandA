import { useDiscovery } from "./useDiscovery";
export function useApplicationDependencyMappingDiscovery(profileId: string){
  return useDiscovery("ApplicationDependencyMapping", profileId);
}
