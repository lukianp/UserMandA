import { useDiscovery } from "./useDiscovery";
export function useDatabaseSchemaDiscovery(profileId: string){
  return useDiscovery("DatabaseSchema", profileId);
}
