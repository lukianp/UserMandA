/**
 * Infrastructure/computer data model from CSV files
 */
export interface InfrastructureData {
  name: string | null;
  type: string | null;
  description: string | null;
  ipAddress: string | null;
  operatingSystem: string | null;
  version: string | null;
  location: string | null;
  status: string | null;
  manufacturer: string | null;
  model: string | null;
  lastSeen: Date | string | null;
  isSelected?: boolean;
  id?: string | null;
  domain?: string | null;
}


