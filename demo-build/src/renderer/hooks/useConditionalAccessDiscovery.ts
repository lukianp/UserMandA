import { useDiscovery } from "./useDiscovery";
export function useConditionalAccessDiscovery(profileId: string){
  return useDiscovery("ConditionalAccess", profileId);
}
