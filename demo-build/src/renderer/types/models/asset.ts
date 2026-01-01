/**
 * Asset data model (deprecated - use infrastructure.ts instead)
 * @deprecated Use InfrastructureData instead
 */
export interface AssetData {
  name: string | null;
  type: string | null;
  owner: string | null;
  status: string | null;
  location: string | null;
  description: string | null;
  isSelected?: boolean;
  id?: string | null;
}


