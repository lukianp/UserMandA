/**
 * Logic Engine CSV Loaders
 * Implementation of all CSV parsing and loading methods
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as Papa from 'papaparse';
import {
  DeviceDto, AppDto, GpoDto, AclEntry, MappedDriveDto,
  MailboxDto, AzureRoleAssignment, SqlDbDto, ThreatDetectionDTO,
  DataGovernanceDTO, DataLineageDTO, ExternalIdentityDTO
} from '../../renderer/types/models/logicEngine';

/**
 * Mixin class containing all CSV loading implementations
 */
export class CsvLoadersMixin {
  // These properties will be available from the main class
  protected devicesByName!: Map<string, DeviceDto>;
  protected appsById!: Map<string, AppDto>;
  protected gposByGuid!: Map<string, GpoDto>;
  protected aclByIdentitySid!: Map<string, AclEntry[]>;
  protected drivesByUserSid!: Map<string, MappedDriveDto[]>;
  protected mailboxByUpn!: Map<string, MailboxDto>;
  protected rolesByPrincipalId!: Map<string, AzureRoleAssignment[]>;
  protected sqlDbsByKey!: Map<string, SqlDbDto>;
  protected threatsByThreatId!: Map<string, ThreatDetectionDTO>;
  protected governanceByAssetId!: Map<string, DataGovernanceDTO>;
  protected lineageByLineageId!: Map<string, DataLineageDTO>;
  protected externalIdentitiesById!: Map<string, ExternalIdentityDTO>;
  protected externalIdentitiesByUpn!: Map<string, ExternalIdentityDTO>;

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load devices/computers from CSV
   */
  public async loadDevicesStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'Computers.csv'),
      path.join(dataPath, 'Devices.csv'),
      path.join(dataPath, 'ADComputers.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const device = this.parseDeviceFromCsv(row);
              if (device) {
                this.devicesByName.set(device.Name, device);
              }
            });
          }
        });

        console.log(`Loaded ${this.devicesByName.size} devices from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseDeviceFromCsv(row: any): DeviceDto | null {
    try {
      const name = row.Name || row.ComputerName || row.DNSHostName || '';
      if (!name) return null;

      // Parse installed apps array
      const installedApps = row.InstalledApps ?
        row.InstalledApps.split(';').filter((a: string) => a) :
        row.InstalledSoftware ?
          row.InstalledSoftware.split(';').filter((a: string) => a) : [];

      return {
        Name: name,
        DNS: row.DNS || row.DNSHostName || row.FQDN,
        OU: row.OU || row.OrganizationalUnit,
        OS: row.OS || row.OperatingSystem || row.OSVersion,
        PrimaryUserSid: row.PrimaryUserSid || row.PrimaryUser || row.LastLoggedOnUser,
        InstalledApps: installedApps,
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'ComputerDiscovery',
        SessionId: row.SessionId || this.generateSessionId()
      };
    } catch (error) {
      console.warn('Failed to parse device from CSV:', error);
      return null;
    }
  }

  /**
   * Load applications from CSV
   */
  public async loadApplicationsStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'Applications.csv'),
      path.join(dataPath, 'Software.csv'),
      path.join(dataPath, 'InstalledSoftware.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const app = this.parseApplicationFromCsv(row);
              if (app) {
                this.appsById.set(app.Id, app);
              }
            });
          }
        });

        console.log(`Loaded ${this.appsById.size} applications from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseApplicationFromCsv(row: any): AppDto | null {
    try {
      const id = row.Id || row.AppId || row.Name || '';
      const name = row.Name || row.ApplicationName || row.DisplayName || '';

      if (!id || !name) return null;

      // Parse arrays
      const executables = row.Executables ?
        row.Executables.split(';').filter((e: string) => e) : [];
      const publishers = row.Publishers ?
        row.Publishers.split(';').filter((p: string) => p) : [];

      return {
        Id: id,
        Name: name,
        Source: row.Source || row.InstallSource,
        InstallCounts: parseInt(row.InstallCounts || row.InstallCount || '0'),
        Executables: executables,
        Publishers: publishers,
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'ApplicationDiscovery',
        SessionId: row.SessionId || this.generateSessionId()
      };
    } catch (error) {
      console.warn('Failed to parse application from CSV:', error);
      return null;
    }
  }

  /**
   * Load Group Policy Objects from CSV
   */
  public async loadGposStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'GroupPolicies.csv'),
      path.join(dataPath, 'GPOs.csv'),
      path.join(dataPath, 'GroupPolicyObjects.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const gpo = this.parseGpoFromCsv(row);
              if (gpo) {
                this.gposByGuid.set(gpo.Guid, gpo);
              }
            });
          }
        });

        console.log(`Loaded ${this.gposByGuid.size} GPOs from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseGpoFromCsv(row: any): GpoDto | null {
    try {
      const guid = row.Guid || row.GUID || row.Id || '';
      const name = row.Name || row.DisplayName || '';

      if (!guid || !name) return null;

      // Parse arrays
      const links = row.Links ?
        row.Links.split(';').filter((l: string) => l) : [];
      const securityFilter = row.SecurityFilter ?
        row.SecurityFilter.split(';').filter((f: string) => f) : [];

      return {
        Guid: guid,
        Name: name,
        Links: links,
        SecurityFilter: securityFilter,
        WmiFilter: row.WmiFilter || row.WMIFilter,
        Enabled: row.Enabled === 'true' || row.Enabled === 'True' || row.Enabled === '1',
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'GPODiscovery',
        SessionId: row.SessionId || this.generateSessionId()
      };
    } catch (error) {
      console.warn('Failed to parse GPO from CSV:', error);
      return null;
    }
  }

  /**
   * Load ACL entries from CSV
   */
  public async loadAclsStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'ACLs.csv'),
      path.join(dataPath, 'FilePermissions.csv'),
      path.join(dataPath, 'SharePermissions.csv'),
      path.join(dataPath, 'NTFSPermissions.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const acl = this.parseAclFromCsv(row);
              if (acl) {
                const identityAcls = this.aclByIdentitySid.get(acl.IdentitySid) || [];
                identityAcls.push(acl);
                this.aclByIdentitySid.set(acl.IdentitySid, identityAcls);
              }
            });
          }
        });

        console.log(`Loaded ACL entries from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseAclFromCsv(row: any): AclEntry | null {
    try {
      const path = row.Path || row.FilePath || row.SharePath || '';
      const identitySid = row.IdentitySid || row.Identity || row.UserSid || '';

      if (!path || !identitySid) return null;

      return {
        Path: path,
        IdentitySid: identitySid,
        Rights: row.Rights || row.Permissions || row.AccessRights || '',
        Inherited: row.Inherited === 'true' || row.Inherited === 'True' || row.Inherited === '1',
        IsShare: row.IsShare === 'true' || row.Type === 'Share',
        IsNTFS: row.IsNTFS === 'true' || row.Type === 'NTFS',
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'ACLDiscovery',
        SessionId: row.SessionId || this.generateSessionId()
      };
    } catch (error) {
      console.warn('Failed to parse ACL from CSV:', error);
      return null;
    }
  }

  /**
   * Load mapped drives from CSV
   */
  public async loadMappedDrivesStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'MappedDrives.csv'),
      path.join(dataPath, 'NetworkDrives.csv'),
      path.join(dataPath, 'UserDrives.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const drive = this.parseMappedDriveFromCsv(row);
              if (drive) {
                const userDrives = this.drivesByUserSid.get(drive.UserSid) || [];
                userDrives.push(drive);
                this.drivesByUserSid.set(drive.UserSid, userDrives);
              }
            });
          }
        });

        console.log(`Loaded mapped drives from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseMappedDriveFromCsv(row: any): MappedDriveDto | null {
    try {
      const userSid = row.UserSid || row.UserSID || row.User || '';
      const letter = row.Letter || row.DriveLetter || '';
      const unc = row.UNC || row.UNCPath || row.NetworkPath || '';

      if (!userSid || !letter || !unc) return null;

      return {
        UserSid: userSid,
        Letter: letter,
        UNC: unc,
        Label: row.Label || row.DriveLabel,
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'DriveDiscovery',
        SessionId: row.SessionId || this.generateSessionId()
      };
    } catch (error) {
      console.warn('Failed to parse mapped drive from CSV:', error);
      return null;
    }
  }

  /**
   * Load mailboxes from CSV
   */
  public async loadMailboxesStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'Mailboxes.csv'),
      path.join(dataPath, 'ExchangeMailboxes.csv'),
      path.join(dataPath, 'UserMailboxes.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const mailbox = this.parseMailboxFromCsv(row);
              if (mailbox) {
                this.mailboxByUpn.set(mailbox.UPN, mailbox);
                if (mailbox.UserPrincipalName && mailbox.UserPrincipalName !== mailbox.UPN) {
                  this.mailboxByUpn.set(mailbox.UserPrincipalName, mailbox);
                }
              }
            });
          }
        });

        console.log(`Loaded ${this.mailboxByUpn.size} mailboxes from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseMailboxFromCsv(row: any): MailboxDto | null {
    try {
      const upn = row.UPN || row.UserPrincipalName || row.Email || '';

      if (!upn) return null;

      // Parse permissions array
      const permissions = row.Permissions ?
        row.Permissions.split(';').filter((p: string) => p) : [];

      return {
        UPN: upn,
        MailboxGuid: row.MailboxGuid || row.MailboxGUID || row.Guid,
        SizeMB: parseFloat(row.SizeMB || row.MailboxSize || '0'),
        Type: row.Type || row.MailboxType || 'UserMailbox',
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'MailboxDiscovery',
        SessionId: row.SessionId || this.generateSessionId(),
        Permissions: permissions,
        UserPrincipalName: row.UserPrincipalName,
        EffectiveUPN: row.UserPrincipalName || upn
      };
    } catch (error) {
      console.warn('Failed to parse mailbox from CSV:', error);
      return null;
    }
  }

  /**
   * Load Azure role assignments from CSV
   */
  public async loadAzureRolesStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'AzureRoles.csv'),
      path.join(dataPath, 'AzureRoleAssignments.csv'),
      path.join(dataPath, 'RoleAssignments.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const role = this.parseAzureRoleFromCsv(row);
              if (role) {
                const principalRoles = this.rolesByPrincipalId.get(role.PrincipalObjectId) || [];
                principalRoles.push(role);
                this.rolesByPrincipalId.set(role.PrincipalObjectId, principalRoles);
              }
            });
          }
        });

        console.log(`Loaded Azure roles from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseAzureRoleFromCsv(row: any): AzureRoleAssignment | null {
    try {
      const principalObjectId = row.PrincipalObjectId || row.PrincipalId || row.ObjectId || '';
      const roleName = row.RoleName || row.Role || '';

      if (!principalObjectId || !roleName) return null;

      return {
        PrincipalObjectId: principalObjectId,
        RoleName: roleName,
        Scope: row.Scope || row.RoleScope || '/',
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'AzureRoleDiscovery',
        SessionId: row.SessionId || this.generateSessionId()
      };
    } catch (error) {
      console.warn('Failed to parse Azure role from CSV:', error);
      return null;
    }
  }

  /**
   * Load SQL databases from CSV
   */
  public async loadSqlDatabasesStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'SqlDatabases.csv'),
      path.join(dataPath, 'Databases.csv'),
      path.join(dataPath, 'SQLServers.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const db = this.parseSqlDbFromCsv(row);
              if (db) {
                const key = `${db.Server}_${db.Database}`;
                this.sqlDbsByKey.set(key, db);
              }
            });
          }
        });

        console.log(`Loaded ${this.sqlDbsByKey.size} SQL databases from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseSqlDbFromCsv(row: any): SqlDbDto | null {
    try {
      const server = row.Server || row.ServerName || '';
      const database = row.Database || row.DatabaseName || row.DB || '';

      if (!server || !database) return null;

      // Parse arrays
      const owners = row.Owners ?
        row.Owners.split(';').filter((o: string) => o) : [];
      const appHints = row.AppHints ?
        row.AppHints.split(';').filter((a: string) => a) : [];

      return {
        Server: server,
        Instance: row.Instance || row.InstanceName,
        Database: database,
        Owners: owners,
        AppHints: appHints,
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'SqlDiscovery',
        SessionId: row.SessionId || this.generateSessionId(),
        Name: database
      };
    } catch (error) {
      console.warn('Failed to parse SQL database from CSV:', error);
      return null;
    }
  }

  /**
   * Load threat detection data from CSV
   */
  public async loadThreatDetectionStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'ThreatDetection.csv'),
      path.join(dataPath, 'Threats.csv'),
      path.join(dataPath, 'SecurityThreats.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const threat = this.parseThreatFromCsv(row);
              if (threat) {
                this.threatsByThreatId.set(threat.ThreatId, threat);
              }
            });
          }
        });

        console.log(`Loaded ${this.threatsByThreatId.size} threats from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseThreatFromCsv(row: any): ThreatDetectionDTO | null {
    try {
      const threatId = row.ThreatId || row.Id || this.generateSessionId();
      const threatName = row.ThreatName || row.Name || '';

      if (!threatName) return null;

      // Parse arrays
      const affectedAssets = row.AffectedAssets ?
        row.AffectedAssets.split(';').filter((a: string) => a) : [];
      const iocs = row.IndicatorsOfCompromise ?
        row.IndicatorsOfCompromise.split(';').filter((i: string) => i) : [];

      // Parse threat details JSON
      let threatDetails = {};
      if (row.ThreatDetails) {
        try {
          threatDetails = JSON.parse(row.ThreatDetails);
        } catch {
          threatDetails = { raw: row.ThreatDetails };
        }
      }

      return {
        ThreatId: threatId,
        ThreatName: threatName,
        Category: row.Category || 'Unknown',
        Severity: row.Severity as 'Critical' | 'High' | 'Medium' | 'Low' || 'Medium',
        Confidence: parseFloat(row.Confidence || '0.5'),
        MitreAttackId: row.MitreAttackId,
        MitreTactic: row.MitreTactic,
        MitreTechnique: row.MitreTechnique,
        AffectedAssets: affectedAssets,
        IndicatorsOfCompromise: iocs,
        ThreatDetails: threatDetails,
        DetectionTimestamp: new Date(row.DetectionTimestamp || Date.now()),
        DetectionSource: row.DetectionSource || 'Unknown',
        SessionId: row.SessionId || this.generateSessionId(),
        DiscoveryModule: row.DiscoveryModule || 'ThreatDetectionEngine',
        ThreatScore: parseFloat(row.ThreatScore || '50')
      };
    } catch (error) {
      console.warn('Failed to parse threat from CSV:', error);
      return null;
    }
  }

  /**
   * Load data governance information from CSV
   */
  public async loadDataGovernanceStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'DataGovernance.csv'),
      path.join(dataPath, 'GovernanceAssets.csv'),
      path.join(dataPath, 'Compliance.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const governance = this.parseGovernanceFromCsv(row);
              if (governance) {
                this.governanceByAssetId.set(governance.AssetId, governance);
              }
            });
          }
        });

        console.log(`Loaded ${this.governanceByAssetId.size} governance records from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseGovernanceFromCsv(row: any): DataGovernanceDTO | null {
    try {
      const assetId = row.AssetId || row.Id || this.generateSessionId();
      const assetName = row.AssetName || row.Name || '';

      if (!assetName) return null;

      // Parse arrays
      const retentionPolicies = row.RetentionPolicies ?
        row.RetentionPolicies.split(';').filter((r: string) => r) : [];
      const complianceFrameworks = row.ComplianceFrameworks ?
        row.ComplianceFrameworks.split(';').filter((c: string) => c) : [];
      const violations = row.ViolationsFound ?
        row.ViolationsFound.split(';').filter((v: string) => v) : [];

      // Parse metadata
      let metadata: Record<string, string> = {};
      if (row.Metadata) {
        try {
          metadata = JSON.parse(row.Metadata);
        } catch {
          // Try parsing as key=value pairs
          row.Metadata.split(';').forEach((item: string) => {
            const [key, value] = item.split('=');
            if (key && value) metadata[key] = value;
          });
        }
      }

      return {
        AssetId: assetId,
        AssetName: assetName,
        AssetType: row.AssetType || 'Unknown',
        Classification: row.Classification || 'Unclassified',
        Owner: row.Owner || 'Unknown',
        Custodian: row.Custodian || 'Unknown',
        RetentionPolicies: retentionPolicies,
        ComplianceFrameworks: complianceFrameworks,
        Metadata: metadata,
        HasPersonalData: row.HasPersonalData === 'true' || row.HasPersonalData === '1',
        HasSensitiveData: row.HasSensitiveData === 'true' || row.HasSensitiveData === '1',
        LastAuditDate: new Date(row.LastAuditDate || Date.now()),
        ComplianceStatus: row.ComplianceStatus || 'Unknown',
        ViolationsFound: violations,
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'DataGovernanceMetadataManagement',
        SessionId: row.SessionId || this.generateSessionId(),
        ComplianceScore: parseFloat(row.ComplianceScore || '0'),
        RiskLevel: row.RiskLevel,
        GovernanceRisk: parseFloat(row.GovernanceRisk || '0')
      };
    } catch (error) {
      console.warn('Failed to parse governance from CSV:', error);
      return null;
    }
  }

  /**
   * Load data lineage information from CSV
   */
  public async loadDataLineageStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'DataLineage.csv'),
      path.join(dataPath, 'DataFlows.csv'),
      path.join(dataPath, 'LineageMapping.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const lineage = this.parseLineageFromCsv(row);
              if (lineage) {
                this.lineageByLineageId.set(lineage.LineageId, lineage);
              }
            });
          }
        });

        console.log(`Loaded ${this.lineageByLineageId.size} lineage records from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseLineageFromCsv(row: any): DataLineageDTO | null {
    try {
      const lineageId = row.LineageId || row.Id || this.generateSessionId();
      const sourceAssetId = row.SourceAssetId || row.Source || '';
      const targetAssetId = row.TargetAssetId || row.Target || '';

      if (!sourceAssetId || !targetAssetId) return null;

      // Parse arrays
      const transformationSteps = row.TransformationSteps ?
        row.TransformationSteps.split(';').filter((t: string) => t) : [];
      const dependencies = row.Dependencies ?
        row.Dependencies.split(';').filter((d: string) => d) : [];
      const issues = row.Issues ?
        row.Issues.split(';').filter((i: string) => i) : [];

      // Parse flow metadata
      let flowMetadata: Record<string, string> = {};
      if (row.FlowMetadata) {
        try {
          flowMetadata = JSON.parse(row.FlowMetadata);
        } catch {
          // Parse as key=value pairs
          row.FlowMetadata.split(';').forEach((item: string) => {
            const [key, value] = item.split('=');
            if (key && value) flowMetadata[key] = value;
          });
        }
      }

      return {
        LineageId: lineageId,
        SourceAssetId: sourceAssetId,
        SourceAssetName: row.SourceAssetName || sourceAssetId,
        SourceAssetType: row.SourceAssetType || 'Unknown',
        TargetAssetId: targetAssetId,
        TargetAssetName: row.TargetAssetName || targetAssetId,
        TargetAssetType: row.TargetAssetType || 'Unknown',
        TransformationType: row.TransformationType || 'Unknown',
        TransformationSteps: transformationSteps,
        DataFlow: row.DataFlow || 'Unknown',
        FlowMetadata: flowMetadata,
        Dependencies: dependencies,
        IsOrphaned: row.IsOrphaned === 'true' || row.IsOrphaned === '1',
        HasBrokenLinks: row.HasBrokenLinks === 'true' || row.HasBrokenLinks === '1',
        LastValidated: new Date(row.LastValidated || Date.now()),
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'DataLineageDependencyEngine',
        SessionId: row.SessionId || this.generateSessionId(),
        Issues: issues,
        LineageRisk: parseFloat(row.LineageRisk || '0')
      };
    } catch (error) {
      console.warn('Failed to parse lineage from CSV:', error);
      return null;
    }
  }

  /**
   * Load external identities from CSV
   */
  public async loadExternalIdentitiesStreamingAsync(dataPath: string): Promise<void> {
    const filePaths = [
      path.join(dataPath, 'ExternalIdentities.csv'),
      path.join(dataPath, 'FederatedIdentities.csv'),
      path.join(dataPath, 'B2BUsers.csv')
    ];

    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');

        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const identity = this.parseExternalIdentityFromCsv(row);
              if (identity) {
                this.externalIdentitiesById.set(identity.ExternalIdentityId, identity);
                if (identity.ExternalUserEmail) {
                  this.externalIdentitiesByUpn.set(identity.ExternalUserEmail, identity);
                }
              }
            });
          }
        });

        console.log(`Loaded ${this.externalIdentitiesById.size} external identities from ${path.basename(filePath)}`);
      } catch (error) {
        console.debug(`File not found (expected): ${filePath}`);
      }
    }
  }

  private parseExternalIdentityFromCsv(row: any): ExternalIdentityDTO | null {
    try {
      const externalId = row.ExternalIdentityId || row.Id || this.generateSessionId();
      const externalProvider = row.ExternalProvider || row.Provider || 'Unknown';
      const externalUserId = row.ExternalUserId || row.UserId || '';

      if (!externalUserId) return null;

      // Parse arrays
      const assignedRoles = row.AssignedRoles ?
        row.AssignedRoles.split(';').filter((r: string) => r) : [];
      const permissions = row.Permissions ?
        row.Permissions.split(';').filter((p: string) => p) : [];
      const syncErrors = row.SyncErrors ?
        row.SyncErrors.split(';').filter((e: string) => e) : [];

      return {
        ExternalIdentityId: externalId,
        ExternalProvider: externalProvider,
        ExternalUserId: externalUserId,
        ExternalUserEmail: row.ExternalUserEmail || row.Email,
        ExternalDisplayName: row.ExternalDisplayName || row.DisplayName,
        InternalUserSid: row.InternalUserSid || row.MappedUserSid,
        MappingStatus: row.MappingStatus as 'Mapped' | 'Unmapped' | 'Conflict' || 'Unmapped',
        MappingConfidence: parseFloat(row.MappingConfidence || '0'),
        AssignedRoles: assignedRoles,
        Permissions: permissions,
        LastSynchronized: new Date(row.LastSynchronized || Date.now()),
        SyncErrors: syncErrors,
        DiscoveryTimestamp: new Date(row.DiscoveryTimestamp || Date.now()),
        DiscoveryModule: row.DiscoveryModule || 'ExternalIdentityMapping',
        SessionId: row.SessionId || this.generateSessionId(),
        IdentityRisk: parseFloat(row.IdentityRisk || '0')
      };
    } catch (error) {
      console.warn('Failed to parse external identity from CSV:', error);
      return null;
    }
  }
}