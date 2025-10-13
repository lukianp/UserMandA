import { useDiscovery } from "./useDiscovery";
export function usePowerPlatformDiscovery(profileId: string){
  return useDiscovery("PowerPlatform", profileId);
}
