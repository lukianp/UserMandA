import { useDiscovery } from "./useDiscovery";
export function useLicensingDiscovery(profileId: string){
  return useDiscovery("Licensing", profileId);
}
