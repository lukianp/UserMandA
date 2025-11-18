import { useDiscovery } from "./useDiscovery";
export function useDataClassificationDiscovery(profileId: string){
  return useDiscovery("DataClassification", profileId);
}
