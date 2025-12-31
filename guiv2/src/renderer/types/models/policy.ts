/**
 * Group Policy Object data model from CSV files
 */
export interface PolicyData {
  name: string | null;
  path: string | null;
  scope: string | null;
  linkedOUs: string | null;
  enabled: boolean;
  computerSettingsEnabled: boolean;
  userSettingsEnabled: boolean;
  createdTime: Date | string | null;
  modifiedTime: Date | string | null;
  description: string | null;
}


