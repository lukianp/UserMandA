import { useDiscovery } from "./useDiscovery";
export function useCertificateDiscovery(profileId: string){
  return useDiscovery("Certificate", profileId);
}
