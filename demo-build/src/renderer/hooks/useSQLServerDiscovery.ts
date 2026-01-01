import { useDiscovery } from "./useDiscovery";
export function useSQLServerDiscovery(profileId: string){
  return useDiscovery("SQLServer", profileId);
}
