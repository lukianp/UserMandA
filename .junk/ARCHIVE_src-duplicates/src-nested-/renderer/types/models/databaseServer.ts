/**
 * Database server data model from CSV files
 */
export interface DatabaseServerData {
  serverName: string;
  instanceName: string;
  databaseName: string;
  version: string;
  edition: string;
  servicePack: string;
  collationName: string;
  owner: string;
  createdDate: string;
  lastBackup: string;
  sizeBytes: number;
  recoveryModel: string;
  status: string;
  port: string;
  ipAddress: string;
  domain: string;
  location: string;
  lastScan: Date | null;
  lastSeen: Date | null;
  sizeFormatted: string;
  statusIcon: string;
  typeIcon: string;
}
