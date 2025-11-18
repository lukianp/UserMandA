import { useDiscovery } from "./useDiscovery";
export function useCertificateAuthorityDiscovery(profileId: string){
  return useDiscovery("CertificateAuthority", profileId);
}
