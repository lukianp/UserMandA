import { useDiscovery } from "./useDiscovery";
export function useDNSDHCPDiscovery(profileId: string){
  return useDiscovery("DNSDHCP", profileId);
}
