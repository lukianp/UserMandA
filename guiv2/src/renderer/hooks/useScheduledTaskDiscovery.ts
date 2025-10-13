import { useDiscovery } from "./useDiscovery";
export function useScheduledTaskDiscovery(profileId: string){
  return useDiscovery("ScheduledTask", profileId);
}
