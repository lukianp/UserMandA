/**
 * SQL instance data model
 */
export interface SqlInstanceData {
  server: string | null;
  instance: string | null;
  version: string | null;
  edition: string | null;
  databaseCount: number;
  totalSizeGB: number;
  lastSeen: Date | string | null;
  engine: string | null;
}

/**
 * Database data model from CSV files
 */
export interface DatabaseData {
  databaseName: string | null;
  owner: string | null;
  sizeGB: number;
  compatLevel: string | null;
  status: string | null;
  lastBackup: Date | string | null;
}


