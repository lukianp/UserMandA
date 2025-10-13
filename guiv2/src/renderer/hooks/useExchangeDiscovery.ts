import { useDiscovery } from "./useDiscovery";
export function useExchangeDiscovery(profileId: string){
  return useDiscovery("Exchange", profileId);
}
