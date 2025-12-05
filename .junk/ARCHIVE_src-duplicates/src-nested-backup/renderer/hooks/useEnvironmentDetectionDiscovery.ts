import { useDiscovery } from "./useDiscovery";
export function useEnvironmentDetectionDiscovery(profileId: string){
  return useDiscovery("EnvironmentDetection", profileId);
}
