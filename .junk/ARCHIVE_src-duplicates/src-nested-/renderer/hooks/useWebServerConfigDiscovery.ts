import { useDiscovery } from "./useDiscovery";
export function useWebServerConfigDiscovery(profileId: string){
  return useDiscovery("WebServerConfig", profileId);
}
