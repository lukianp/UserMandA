/**
 * File server data model from CSV files
 */
export interface FileServerData {
  serverName: string | null;
  os: string | null;
  version: string | null;
  location: string | null;
  shareCount: number;
  totalSizeGB: number;
  lastScan: Date | string | null;
  operatingSystem?: string | null;
  domain?: string | null;
  ipAddress?: string | null;
  totalSizeBytes?: number;
  status?: string | null;
  type?: string | null;
}

/**
 * File share data model from CSV files
 */
export interface ShareData {
  shareName: string | null;
  path: string | null;
  sizeGB: number;
  files: number;
  lastAccess: Date | string | null;
}
