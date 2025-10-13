import { useDiscovery } from "./useDiscovery";
export function useAzureDiscovery(profileId: string){
  return useDiscovery("Azure", profileId);
}
