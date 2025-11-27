import { useDiscovery } from "./useDiscovery";
export function useAzureResourceDiscovery(profileId: string){
  return useDiscovery("AzureResource", profileId);
}
