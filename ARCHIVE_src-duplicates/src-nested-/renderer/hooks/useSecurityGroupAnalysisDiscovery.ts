import { useDiscovery } from "./useDiscovery";
export function useSecurityGroupAnalysisDiscovery(profileId: string){
  return useDiscovery("SecurityGroupAnalysis", profileId);
}
