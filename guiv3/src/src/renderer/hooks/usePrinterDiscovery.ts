import { useDiscovery } from "./useDiscovery";
export function usePrinterDiscovery(profileId: string){
  return useDiscovery("Printer", profileId);
}
