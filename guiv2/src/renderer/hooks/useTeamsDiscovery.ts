import { useDiscovery } from "./useDiscovery";
export function useTeamsDiscovery(profileId: string){
  return useDiscovery("Teams", profileId);
}
