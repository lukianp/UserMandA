import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import type { ColDef } from 'ag-grid-community';
import { useProfileStore } from '../store/useProfileStore';

// TypeScript interfaces matching CSV structures
interface Mailbox {
  Id: string;
  UserPrincipalName: string;
  PrimarySmtpAddress: string;
  DisplayName: string;
  Alias: string;
  GivenName: string;
  Surname: string;
  JobTitle: string;
  Department: string;
  Company: string;
  EmployeeId: string;
  EmployeeType: string;
  CostCenter: string;
  Division: string;
  OfficeLocation: string;
  StreetAddress: string;
  City: string;
  State: string;
  PostalCode: string;
  Country: string;
  BusinessPhones: string;
  MobilePhone: string;
  FaxNumber: string;
  AccountEnabled: string;
  CreatedDateTime: string;
  DeletedDateTime: string;
  LastPasswordChangeDateTime: string;
  ProxyAddresses: string;
  MailboxTimeZone: string;
  MailboxLanguage: string;
  MailboxDateFormat: string;
  MailboxTimeFormat: string;
  WorkingHours: string;
  AutoReplyStatus: string;
  AutoReplyStartTime: string;
  AutoReplyEndTime: string;
  InboxItemCount: string;
  SentItemCount: string;
  DraftsItemCount: string;
  DeletedItemCount: string;
  TotalFolderCount: string;
  MailboxSizeMB: string;
  MailboxSizeBytes: string;
  MailboxQuotaMB: string;
  MailboxQuotaPercentUsed: string;
  MailboxTotalItemCount: string;
  MailboxLastActivityDate: string;
  HasArchiveMailbox: string;
  ArchiveSizeBytes: string;
  ArchiveSizeMB: string;
  CalendarPermissions: string;
  OnPremisesDistinguishedName: string;
  OnPremisesDomainName: string;
  OnPremisesImmutableId: string;
  OnPremisesLastSyncDateTime: string;
  OnPremisesSamAccountName: string;
  OnPremisesSecurityIdentifier: string;
  OnPremisesSyncEnabled: string;
  OnPremisesUserPrincipalName: string;
  PreferredDataLocation: string;
  UsageLocation: string;
  AssignedLicenses: string;
  AssignedPlans: string;
  ManagerId: string;
  RecipientType: string;
  RecipientTypeDetails: string;
  EXO_TotalItemSize: string;
  EXO_TotalItemCount: string;
  EXO_TotalDeletedItemSize: string;
  EXO_ProhibitSendQuota: string;
  EXO_ProhibitSendReceiveQuota: string;
  EXO_IssueWarningQuota: string;
  EXO_LastLogonTime: string;
  EXO_LastLogoffTime: string;
  EXO_MailboxType: string;
  EXO_LitigationHoldEnabled: string;
  EXO_RetentionPolicy: string;
  EXO_HiddenFromAddressLists: string;
  EXO_ForwardingAddress: string;
  EXO_ForwardingSmtpAddress: string;
  EXO_DeliverToMailboxAndForward: string;
  EXO_FullAccessPermissions: string;
  EXO_SendAsPermissions: string;
  EXO_SendOnBehalfPermissions: string;
  EXO_InboxRulesCount: string;
  EXO_InboxRulesWithForwarding: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface DistributionGroup {
  Id: string;
  DisplayName: string;
  PrimarySmtpAddress: string;
  Alias: string;
  Description: string;
  GroupType: string;
  RecipientType: string;
  RecipientTypeDetails: string;
  MailEnabled: string;
  SecurityEnabled: string;
  GroupTypes: string;
  MemberCount: string;
  Owners: string;
  OwnerCount: string;
  MembershipRule: string;
  MembershipRuleProcessingState: string;
  IsDynamicGroup: string;
  Visibility: string;
  Classification: string;
  IsAssignableToRole: string;
  ProxyAddresses: string;
  ResourceProvisioningOptions: string;
  CreatedDateTime: string;
  RenewedDateTime: string;
  ExpirationDateTime: string;
  OnPremisesSyncEnabled: string;
  OnPremisesLastSyncDateTime: string;
  OnPremisesSamAccountName: string;
  OnPremisesSecurityIdentifier: string;
  OrganizationId: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface MailContact {
  Id: string;
  DisplayName: string;
  ExternalEmailAddress: string;
  PrimarySmtpAddress: string;
  Alias: string;
  RecipientType: string;
  RecipientTypeDetails: string;
  HiddenFromAddressListsEnabled: string;
  CreatedDateTime: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

interface AcceptedDomain {
  DomainName: string;
  AuthenticationType: string;
  IsDefault: string;
  IsInitial: string;
  IsVerified: string;
  AvailabilityStatus: string;
  SupportedServices: string;
  MailFlowStatus: string;
  RecipientType: string;
  _DataType: string;
  _DiscoveryTimestamp: string;
  _DiscoveryModule: string;
  _SessionId: string;
}

// New mail flow configuration interfaces
interface TransportRule {
  Name: string;
  State: string;
  Priority: string;
  Mode: string;
  SentTo: string;
  SentToScope: string;
  RecipientDomainIs: string;
  FromScope: string;
  FromAddressContainsWords: string;
  SubjectContainsWords: string;
  HasAttachment: string;
  AttachmentContainsWords: string;
  RedirectMessageTo: string;
  CopyTo: string;
  BlindCopyTo: string;
  ModifySubject: string;
  PrependSubject: string;
  SetSCL: string;
  Quarantine: string;
  RejectMessageReasonText: string;
  Conditions: string;
  Actions: string;
  Exceptions: string;
  Comments: string;
  _DataType: string;
}

interface InboundConnector {
  Name: string;
  Enabled: string;
  ConnectorType: string;
  SenderDomains: string;
  SenderIPAddresses: string;
  RequireTls: string;
  RestrictDomainsToCertificate: string;
  TlsSenderCertificateName: string;
  TreatMessagesAsInternal: string;
  CloudServicesMailEnabled: string;
  Comment: string;
  _DataType: string;
}

interface OutboundConnector {
  Name: string;
  Enabled: string;
  ConnectorType: string;
  RecipientDomains: string;
  SmartHosts: string;
  TlsSettings: string;
  RequireTLS: string;
  TlsDomain: string;
  IsTransportRuleScoped: string;
  RouteAllMessagesViaOnPremises: string;
  CloudServicesMailEnabled: string;
  Comment: string;
  _DataType: string;
}

interface RemoteDomain {
  DomainName: string;
  Name: string;
  AllowedOOFType: string;
  AutoReplyEnabled: string;
  AutoForwardEnabled: string;
  DeliveryReportEnabled: string;
  NDREnabled: string;
  TNEFEnabled: string;
  CharacterSet: string;
  ContentType: string;
  IsInternal: string;
  _DataType: string;
}

interface OrganizationConfig {
  DisplayName: string;
  Name: string;
  DefaultPublicFolderMailbox: string;
  DistributionGroupDefaultOU: string;
  MicrosoftExchangeRecipientPrimarySmtpAddress: string;
  MailTipsAllTipsEnabled: string;
  MailTipsExternalRecipientsTipsEnabled: string;
  MailTipsGroupMetricsEnabled: string;
  MailTipsLargeAudienceThreshold: string;
  PublicFolderMigrationComplete: string;
  OAuth2ClientProfileEnabled: string;
  DirectoryBasedEdgeBlockModeEnabled: string;
  EwsEnabled: string;
  EwsAllowOutlook: string;
  MapiHttpEnabled: string;
  UnifiedAuditLogIngestionEnabled: string;
  AuditDisabled: string;
  _DataType: string;
}

interface OrganizationRelationship {
  Name: string;
  Enabled: string;
  DomainNames: string;
  FreeBusyAccessEnabled: string;
  FreeBusyAccessLevel: string;
  FreeBusyAccessScope: string;
  MailTipsAccessEnabled: string;
  MailTipsAccessLevel: string;
  MailTipsAccessScope: string;
  PhotosEnabled: string;
  TargetApplicationUri: string;
  TargetAutodiscoverEpr: string;
  TargetOwaURL: string;
  TargetSharingEpr: string;
  _DataType: string;
}

interface DkimConfig {
  Domain: string;
  Enabled: string;
  Status: string;
  Selector1CNAME: string;
  Selector2CNAME: string;
  KeyCreationTime: string;
  LastChecked: string;
  _DataType: string;
}

interface AntiSpamPolicy {
  Name: string;
  IsDefault: string;
  BulkThreshold: string;
  MarkAsSpamBulkMail: string;
  SpamAction: string;
  HighConfidenceSpamAction: string;
  BulkSpamAction: string;
  PhishSpamAction: string;
  HighConfidencePhishAction: string;
  QuarantineRetentionPeriod: string;
  EnableEndUserSpamNotifications: string;
  _DataType: string;
}

interface AntiPhishPolicy {
  Name: string;
  Enabled: string;
  IsDefault: string;
  EnableMailboxIntelligence: string;
  EnableMailboxIntelligenceProtection: string;
  EnableSpoofIntelligence: string;
  EnableFirstContactSafetyTips: string;
  EnableOrganizationDomainsProtection: string;
  EnableTargetedDomainsProtection: string;
  EnableTargetedUserProtection: string;
  AuthenticationFailAction: string;
  _DataType: string;
}

interface MalwarePolicy {
  Name: string;
  IsDefault: string;
  EnableFileFilter: string;
  FileTypes: string;
  ZapEnabled: string;
  EnableInternalSenderAdminNotifications: string;
  InternalSenderAdminAddress: string;
  EnableExternalSenderAdminNotifications: string;
  ExternalSenderAdminAddress: string;
  _DataType: string;
}

interface MigrationEndpoint {
  Identity: string;
  EndpointType: string;
  RemoteServer: string;
  MaxConcurrentMigrations: string;
  MaxConcurrentIncrementalSyncs: string;
  _DataType: string;
}

interface MigrationBatch {
  Identity: string;
  Status: string;
  Type: string;
  SourceEndpoint: string;
  TargetDeliveryDomain: string;
  TotalCount: string;
  FinalizedCount: string;
  StartDateTime: string;
  CompleteDateTime: string;
  _DataType: string;
}

interface DomainDNSRecord {
  DomainName: string;
  RecordType: string;
  MXRecord: string;
  MXPriority: string;
  SPFRecord: string;
  DKIMSelector1: string;
  DKIMSelector2: string;
  DMARCRecord: string;
  MailGatewayType: string;
  ThirdPartyGateway: string;
  IsThirdPartyGateway: string;
  GatewayDetails: string;
  ResolutionMethod: string;
  _DataType: string;
}

interface RetentionPolicy {
  Name: string;
  RetentionPolicyTagLinks: string;
  IsDefault: string;
  IsDefaultArbitrationMailbox: string;
  _DataType: string;
}

interface JournalRule {
  Name: string;
  Enabled: string;
  Recipient: string;
  JournalEmailAddress: string;
  Scope: string;
  _DataType: string;
}

export function useExchangeDiscoveredLogic() {
  const { selectedSourceProfile } = useProfileStore();

  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [groups, setGroups] = useState<DistributionGroup[]>([]);
  const [contacts, setContacts] = useState<MailContact[]>([]);
  const [domains, setDomains] = useState<AcceptedDomain[]>([]);

  // New mail flow configuration state
  const [transportRules, setTransportRules] = useState<TransportRule[]>([]);
  const [inboundConnectors, setInboundConnectors] = useState<InboundConnector[]>([]);
  const [outboundConnectors, setOutboundConnectors] = useState<OutboundConnector[]>([]);
  const [remoteDomains, setRemoteDomains] = useState<RemoteDomain[]>([]);
  const [orgConfig, setOrgConfig] = useState<OrganizationConfig[]>([]);
  const [orgRelationships, setOrgRelationships] = useState<OrganizationRelationship[]>([]);
  const [dkimConfigs, setDkimConfigs] = useState<DkimConfig[]>([]);
  const [antiSpamPolicies, setAntiSpamPolicies] = useState<AntiSpamPolicy[]>([]);
  const [antiPhishPolicies, setAntiPhishPolicies] = useState<AntiPhishPolicy[]>([]);
  const [malwarePolicies, setMalwarePolicies] = useState<MalwarePolicy[]>([]);
  const [migrationEndpoints, setMigrationEndpoints] = useState<MigrationEndpoint[]>([]);
  const [migrationBatches, setMigrationBatches] = useState<MigrationBatch[]>([]);
  const [dnsRecords, setDnsRecords] = useState<DomainDNSRecord[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([]);
  const [journalRules, setJournalRules] = useState<JournalRule[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Load CSV files
  useEffect(() => {
    if (!selectedSourceProfile) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const basePath = `C:\\DiscoveryData\\${selectedSourceProfile.companyName}\\Raw`;

        const loadCSV = <T,>(filename: string): Promise<T[]> => {
          return new Promise((resolve, reject) => {
            window.electronAPI.fs.readFile(`${basePath}\\${filename}`)
              .then((content: string) => {
                Papa.parse<T>(content, {
                  header: true,
                  skipEmptyLines: true,
                  complete: (results) => resolve(results.data),
                  error: (error) => reject(error),
                });
              })
              .catch((err) => {
                console.warn(`Could not load ${filename}:`, err);
                resolve([] as T[]);
              });
          });
        };

        const [
          mailboxData, groupData, contactData, domainData,
          transportRulesData, inboundConnectorsData, outboundConnectorsData,
          remoteDomainsData, orgConfigData, orgRelationshipsData,
          dkimConfigsData, antiSpamData, antiPhishData, malwareData,
          migrationEndpointsData, migrationBatchesData, dnsRecordsData,
          retentionData, journalData
        ] = await Promise.all([
          // Core Exchange data
          loadCSV<Mailbox>('ExchangeMailboxes.csv'),
          loadCSV<DistributionGroup>('ExchangeDistributionGroups.csv'),
          loadCSV<MailContact>('ExchangeMailContacts.csv'),
          loadCSV<AcceptedDomain>('ExchangeAcceptedDomains.csv'),
          // Mail flow configuration
          loadCSV<TransportRule>('ExchangeTransportRules.csv'),
          loadCSV<InboundConnector>('ExchangeInboundConnectors.csv'),
          loadCSV<OutboundConnector>('ExchangeOutboundConnectors.csv'),
          loadCSV<RemoteDomain>('ExchangeRemoteDomains.csv'),
          loadCSV<OrganizationConfig>('ExchangeOrganizationConfig.csv'),
          loadCSV<OrganizationRelationship>('ExchangeOrganizationRelationships.csv'),
          // Security policies
          loadCSV<DkimConfig>('ExchangeDkimConfig.csv'),
          loadCSV<AntiSpamPolicy>('ExchangeAntiSpamPolicies.csv'),
          loadCSV<AntiPhishPolicy>('ExchangeAntiPhishPolicies.csv'),
          loadCSV<MalwarePolicy>('ExchangeMalwarePolicies.csv'),
          // Migration
          loadCSV<MigrationEndpoint>('ExchangeMigrationEndpoints.csv'),
          loadCSV<MigrationBatch>('ExchangeMigrationBatches.csv'),
          // DNS and compliance
          loadCSV<DomainDNSRecord>('ExchangeDomainDNSRecords.csv'),
          loadCSV<RetentionPolicy>('ExchangeRetentionPolicies.csv'),
          loadCSV<JournalRule>('ExchangeJournalRules.csv'),
        ]);

        // Core data
        setMailboxes(mailboxData);
        setGroups(groupData);
        setContacts(contactData);
        setDomains(domainData);
        // Mail flow
        setTransportRules(transportRulesData);
        setInboundConnectors(inboundConnectorsData);
        setOutboundConnectors(outboundConnectorsData);
        setRemoteDomains(remoteDomainsData);
        setOrgConfig(orgConfigData);
        setOrgRelationships(orgRelationshipsData);
        // Security
        setDkimConfigs(dkimConfigsData);
        setAntiSpamPolicies(antiSpamData);
        setAntiPhishPolicies(antiPhishData);
        setMalwarePolicies(malwareData);
        // Migration
        setMigrationEndpoints(migrationEndpointsData);
        setMigrationBatches(migrationBatchesData);
        // DNS and compliance
        setDnsRecords(dnsRecordsData);
        setRetentionPolicies(retentionData);
        setJournalRules(journalData);

        setLoading(false);
      } catch (err) {
        console.error('Error loading Exchange data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSourceProfile]);

  // Calculate comprehensive statistics
  const statistics = useMemo(() => {
    // Mailbox statistics
    const totalMailboxes = mailboxes.length;
    const activeMailboxes = mailboxes.filter(m => m.AccountEnabled === 'True').length;
    const inactiveMailboxes = totalMailboxes - activeMailboxes;
    const mailboxesWithArchive = mailboxes.filter(m => m.HasArchiveMailbox === 'True').length;

    // Calculate total mailbox size
    const totalMailboxSizeMB = mailboxes.reduce((sum, m) => {
      const sizeMB = parseFloat(m.MailboxSizeMB || '0');
      return sum + (isNaN(sizeMB) ? 0 : sizeMB);
    }, 0);

    // Calculate total items
    const totalItems = mailboxes.reduce((sum, m) => {
      const items = parseInt(m.MailboxTotalItemCount || '0');
      return sum + (isNaN(items) ? 0 : items);
    }, 0);

    // Mailboxes with forwarding
    const mailboxesWithForwarding = mailboxes.filter(m =>
      m.EXO_ForwardingAddress || m.EXO_ForwardingSmtpAddress
    ).length;

    // Mailboxes with litigation hold
    const mailboxesWithLitigationHold = mailboxes.filter(m =>
      m.EXO_LitigationHoldEnabled === 'True'
    ).length;

    // Mailboxes with delegated permissions
    const mailboxesWithDelegatedAccess = mailboxes.filter(m =>
      m.EXO_FullAccessPermissions || m.EXO_SendAsPermissions || m.EXO_SendOnBehalfPermissions
    ).length;

    // Department breakdown
    const departmentCounts = mailboxes.reduce((acc, m) => {
      const dept = m.Department || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topDepartments = Object.entries(departmentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count, percentage: (count / totalMailboxes) * 100 }));

    // Recipient type breakdown
    const recipientTypeCounts = mailboxes.reduce((acc, m) => {
      const type = m.RecipientTypeDetails || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group statistics
    const totalGroups = groups.length;
    const m365Groups = groups.filter(g => g.GroupType === 'Microsoft365' || g.GroupTypes === 'Unified').length;
    const distributionLists = groups.filter(g => g.GroupType === 'DistributionList').length;
    const securityGroups = groups.filter(g => g.SecurityEnabled === 'True').length;
    const mailEnabledGroups = groups.filter(g => g.MailEnabled === 'True').length;

    // Group visibility breakdown
    const publicGroups = groups.filter(g => g.Visibility === 'Public').length;
    const privateGroups = groups.filter(g => g.Visibility === 'Private').length;

    // Group member statistics
    const totalGroupMembers = groups.reduce((sum, g) => {
      const members = parseInt(g.MemberCount || '0');
      return sum + (isNaN(members) ? 0 : members);
    }, 0);

    const avgMembersPerGroup = totalGroups > 0 ? Math.round(totalGroupMembers / totalGroups) : 0;

    // Top groups by member count
    const topGroupsByMembers = groups
      .map(g => ({
        name: g.DisplayName,
        count: parseInt(g.MemberCount || '0'),
        type: g.GroupType,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Domain statistics
    const totalDomains = domains.length;
    const verifiedDomains = domains.filter(d => d.IsVerified === 'True').length;
    const defaultDomain = domains.find(d => d.IsDefault === 'True')?.DomainName || 'None';
    const initialDomain = domains.find(d => d.IsInitial === 'True')?.DomainName || 'None';

    // Contact statistics
    const totalContacts = contacts.length;

    return {
      // Row 1: Primary metrics
      totalMailboxes,
      totalGroups,
      totalDomains,
      totalContacts,

      // Row 2: Mailbox details
      activeMailboxes,
      inactiveMailboxes,
      mailboxesWithArchive,
      totalMailboxSizeMB: Math.round(totalMailboxSizeMB),

      // Row 3: Advanced metrics
      mailboxesWithForwarding,
      mailboxesWithLitigationHold,
      mailboxesWithDelegatedAccess,
      totalItems,

      // Group details
      m365Groups,
      distributionLists,
      securityGroups,
      mailEnabledGroups,
      publicGroups,
      privateGroups,
      totalGroupMembers,
      avgMembersPerGroup,

      // Breakdowns
      topDepartments,
      recipientTypeCounts,
      topGroupsByMembers,

      // Domain details
      verifiedDomains,
      defaultDomain,
      initialDomain,

      // Mail Flow Statistics
      totalTransportRules: transportRules.length,
      enabledTransportRules: transportRules.filter(r => r.State === 'Enabled').length,
      disabledTransportRules: transportRules.filter(r => r.State === 'Disabled').length,

      totalInboundConnectors: inboundConnectors.length,
      enabledInboundConnectors: inboundConnectors.filter(c => c.Enabled === 'True').length,
      totalOutboundConnectors: outboundConnectors.length,
      enabledOutboundConnectors: outboundConnectors.filter(c => c.Enabled === 'True').length,

      totalRemoteDomains: remoteDomains.length,
      internalRemoteDomains: remoteDomains.filter(d => d.IsInternal === 'True').length,

      // Organization
      orgRelationshipsCount: orgRelationships.length,
      enabledOrgRelationships: orgRelationships.filter(r => r.Enabled === 'True').length,

      // Security Statistics
      totalDkimConfigs: dkimConfigs.length,
      enabledDkim: dkimConfigs.filter(d => d.Enabled === 'True').length,

      totalAntiSpamPolicies: antiSpamPolicies.length,
      totalAntiPhishPolicies: antiPhishPolicies.length,
      totalMalwarePolicies: malwarePolicies.length,

      // Migration Statistics
      totalMigrationEndpoints: migrationEndpoints.length,
      totalMigrationBatches: migrationBatches.length,
      activeMigrationBatches: migrationBatches.filter(b =>
        b.Status === 'InProgress' || b.Status === 'Syncing' || b.Status === 'Synced'
      ).length,
      completedMigrationBatches: migrationBatches.filter(b => b.Status === 'Completed').length,

      // DNS Statistics
      totalDnsRecords: dnsRecords.length,
      thirdPartyGatewayDomains: dnsRecords.filter(d => d.IsThirdPartyGateway === 'True').length,
      domainsWithDkim: dnsRecords.filter(d => d.DKIMSelector1 || d.DKIMSelector2).length,
      domainsWithDmarc: dnsRecords.filter(d => d.DMARCRecord).length,
      domainsWithSpf: dnsRecords.filter(d => d.SPFRecord).length,

      // Gateway breakdown
      gatewayBreakdown: dnsRecords.reduce((acc, d) => {
        const gateway = d.ThirdPartyGateway || 'Direct to M365';
        acc[gateway] = (acc[gateway] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),

      // Compliance Statistics
      totalRetentionPolicies: retentionPolicies.length,
      totalJournalRules: journalRules.length,
      enabledJournalRules: journalRules.filter(r => r.Enabled === 'True').length,

      // Discovery Success Calculation
      // Expected data sources and their presence (weighted by importance)
      discoverySuccessPercentage: (() => {
        // Define expected data sources with weights (higher = more critical)
        const expectedSources = [
          { name: 'Mailboxes', hasData: mailboxes.length > 0, weight: 20 },
          { name: 'Groups', hasData: groups.length > 0, weight: 15 },
          { name: 'Domains', hasData: domains.length > 0, weight: 15 },
          { name: 'Contacts', hasData: contacts.length > 0, weight: 5 },
          { name: 'Transport Rules', hasData: transportRules.length > 0, weight: 10 },
          { name: 'Inbound Connectors', hasData: inboundConnectors.length > 0, weight: 5 },
          { name: 'Outbound Connectors', hasData: outboundConnectors.length > 0, weight: 5 },
          { name: 'Remote Domains', hasData: remoteDomains.length > 0, weight: 5 },
          { name: 'DNS Records', hasData: dnsRecords.length > 0, weight: 10 },
          { name: 'DKIM Config', hasData: dkimConfigs.length > 0, weight: 3 },
          { name: 'Anti-Spam Policies', hasData: antiSpamPolicies.length > 0, weight: 2 },
          { name: 'Anti-Phish Policies', hasData: antiPhishPolicies.length > 0, weight: 2 },
          { name: 'Malware Policies', hasData: malwarePolicies.length > 0, weight: 2 },
          { name: 'Migration Endpoints', hasData: migrationEndpoints.length > 0, weight: 1 },
        ];

        const totalWeight = expectedSources.reduce((sum, s) => sum + s.weight, 0);
        const achievedWeight = expectedSources.reduce((sum, s) => sum + (s.hasData ? s.weight : 0), 0);

        return Math.round((achievedWeight / totalWeight) * 100);
      })(),

      // Data source breakdown for display
      dataSourcesReceived: [
        { name: 'Mailboxes', count: mailboxes.length, received: mailboxes.length > 0 },
        { name: 'Groups', count: groups.length, received: groups.length > 0 },
        { name: 'Domains', count: domains.length, received: domains.length > 0 },
        { name: 'Contacts', count: contacts.length, received: contacts.length > 0 },
        { name: 'Transport Rules', count: transportRules.length, received: transportRules.length > 0 },
        { name: 'Inbound Connectors', count: inboundConnectors.length, received: inboundConnectors.length > 0 },
        { name: 'Outbound Connectors', count: outboundConnectors.length, received: outboundConnectors.length > 0 },
        { name: 'Remote Domains', count: remoteDomains.length, received: remoteDomains.length > 0 },
        { name: 'DNS Records', count: dnsRecords.length, received: dnsRecords.length > 0 },
        { name: 'DKIM Config', count: dkimConfigs.length, received: dkimConfigs.length > 0 },
        { name: 'Anti-Spam Policies', count: antiSpamPolicies.length, received: antiSpamPolicies.length > 0 },
        { name: 'Anti-Phish Policies', count: antiPhishPolicies.length, received: antiPhishPolicies.length > 0 },
        { name: 'Malware Policies', count: malwarePolicies.length, received: malwarePolicies.length > 0 },
        { name: 'Migration Data', count: migrationEndpoints.length + migrationBatches.length, received: migrationEndpoints.length > 0 || migrationBatches.length > 0 },
      ],
      dataSourcesReceivedCount: [
        mailboxes.length > 0,
        groups.length > 0,
        domains.length > 0,
        contacts.length > 0,
        transportRules.length > 0,
        inboundConnectors.length > 0,
        outboundConnectors.length > 0,
        remoteDomains.length > 0,
        dnsRecords.length > 0,
        dkimConfigs.length > 0,
        antiSpamPolicies.length > 0,
        antiPhishPolicies.length > 0,
        malwarePolicies.length > 0,
        migrationEndpoints.length > 0 || migrationBatches.length > 0,
      ].filter(Boolean).length,
      dataSourcesTotal: 14,
    };
  }, [mailboxes, groups, contacts, domains, transportRules, inboundConnectors, outboundConnectors,
      remoteDomains, orgConfig, orgRelationships, dkimConfigs, antiSpamPolicies, antiPhishPolicies,
      malwarePolicies, migrationEndpoints, migrationBatches, dnsRecords, retentionPolicies, journalRules]);

  // Filter data based on active tab and search term
  const filteredMailboxes = useMemo(() => {
    if (activeTab !== 'mailboxes') return [];
    if (!searchTerm) return mailboxes;

    const term = searchTerm.toLowerCase();
    return mailboxes.filter(m =>
      m.DisplayName?.toLowerCase().includes(term) ||
      m.UserPrincipalName?.toLowerCase().includes(term) ||
      m.PrimarySmtpAddress?.toLowerCase().includes(term) ||
      m.Department?.toLowerCase().includes(term) ||
      m.JobTitle?.toLowerCase().includes(term)
    );
  }, [mailboxes, activeTab, searchTerm]);

  const filteredGroups = useMemo(() => {
    if (activeTab !== 'groups') return [];
    if (!searchTerm) return groups;

    const term = searchTerm.toLowerCase();
    return groups.filter(g =>
      g.DisplayName?.toLowerCase().includes(term) ||
      g.PrimarySmtpAddress?.toLowerCase().includes(term) ||
      g.GroupType?.toLowerCase().includes(term)
    );
  }, [groups, activeTab, searchTerm]);

  const filteredContacts = useMemo(() => {
    if (activeTab !== 'contacts') return [];
    if (!searchTerm) return contacts;

    const term = searchTerm.toLowerCase();
    return contacts.filter(c =>
      c.DisplayName?.toLowerCase().includes(term) ||
      c.ExternalEmailAddress?.toLowerCase().includes(term)
    );
  }, [contacts, activeTab, searchTerm]);

  const filteredDomains = useMemo(() => {
    if (activeTab !== 'domains') return [];
    if (!searchTerm) return domains;

    const term = searchTerm.toLowerCase();
    return domains.filter(d =>
      d.DomainName?.toLowerCase().includes(term)
    );
  }, [domains, activeTab, searchTerm]);

  // Mail Flow Filters
  const filteredTransportRules = useMemo(() => {
    if (activeTab !== 'transportRules') return [];
    if (!searchTerm) return transportRules;
    const term = searchTerm.toLowerCase();
    return transportRules.filter(r =>
      r.Name?.toLowerCase().includes(term) ||
      r.State?.toLowerCase().includes(term)
    );
  }, [transportRules, activeTab, searchTerm]);

  const filteredInboundConnectors = useMemo(() => {
    if (activeTab !== 'inboundConnectors') return [];
    if (!searchTerm) return inboundConnectors;
    const term = searchTerm.toLowerCase();
    return inboundConnectors.filter(c =>
      c.Name?.toLowerCase().includes(term) ||
      c.ConnectorType?.toLowerCase().includes(term)
    );
  }, [inboundConnectors, activeTab, searchTerm]);

  const filteredOutboundConnectors = useMemo(() => {
    if (activeTab !== 'outboundConnectors') return [];
    if (!searchTerm) return outboundConnectors;
    const term = searchTerm.toLowerCase();
    return outboundConnectors.filter(c =>
      c.Name?.toLowerCase().includes(term) ||
      c.ConnectorType?.toLowerCase().includes(term)
    );
  }, [outboundConnectors, activeTab, searchTerm]);

  const filteredRemoteDomains = useMemo(() => {
    if (activeTab !== 'remoteDomains') return [];
    if (!searchTerm) return remoteDomains;
    const term = searchTerm.toLowerCase();
    return remoteDomains.filter(d =>
      d.DomainName?.toLowerCase().includes(term) ||
      d.Name?.toLowerCase().includes(term)
    );
  }, [remoteDomains, activeTab, searchTerm]);

  // Security Filters
  const filteredDkimConfigs = useMemo(() => {
    if (activeTab !== 'dkim') return [];
    if (!searchTerm) return dkimConfigs;
    const term = searchTerm.toLowerCase();
    return dkimConfigs.filter(d =>
      d.Domain?.toLowerCase().includes(term)
    );
  }, [dkimConfigs, activeTab, searchTerm]);

  const filteredAntiSpamPolicies = useMemo(() => {
    if (activeTab !== 'antiSpam') return [];
    if (!searchTerm) return antiSpamPolicies;
    const term = searchTerm.toLowerCase();
    return antiSpamPolicies.filter(p =>
      p.Name?.toLowerCase().includes(term)
    );
  }, [antiSpamPolicies, activeTab, searchTerm]);

  const filteredAntiPhishPolicies = useMemo(() => {
    if (activeTab !== 'antiPhish') return [];
    if (!searchTerm) return antiPhishPolicies;
    const term = searchTerm.toLowerCase();
    return antiPhishPolicies.filter(p =>
      p.Name?.toLowerCase().includes(term)
    );
  }, [antiPhishPolicies, activeTab, searchTerm]);

  const filteredMalwarePolicies = useMemo(() => {
    if (activeTab !== 'malware') return [];
    if (!searchTerm) return malwarePolicies;
    const term = searchTerm.toLowerCase();
    return malwarePolicies.filter(p =>
      p.Name?.toLowerCase().includes(term)
    );
  }, [malwarePolicies, activeTab, searchTerm]);

  // DNS Records
  const filteredDnsRecords = useMemo(() => {
    if (activeTab !== 'dns') return [];
    if (!searchTerm) return dnsRecords;
    const term = searchTerm.toLowerCase();
    return dnsRecords.filter(d =>
      d.DomainName?.toLowerCase().includes(term) ||
      d.ThirdPartyGateway?.toLowerCase().includes(term)
    );
  }, [dnsRecords, activeTab, searchTerm]);

  // Migration Filters
  const filteredMigrationEndpoints = useMemo(() => {
    if (activeTab !== 'migrationEndpoints') return [];
    if (!searchTerm) return migrationEndpoints;
    const term = searchTerm.toLowerCase();
    return migrationEndpoints.filter(e =>
      e.Identity?.toLowerCase().includes(term) ||
      e.EndpointType?.toLowerCase().includes(term)
    );
  }, [migrationEndpoints, activeTab, searchTerm]);

  const filteredMigrationBatches = useMemo(() => {
    if (activeTab !== 'migrationBatches') return [];
    if (!searchTerm) return migrationBatches;
    const term = searchTerm.toLowerCase();
    return migrationBatches.filter(b =>
      b.Identity?.toLowerCase().includes(term) ||
      b.Status?.toLowerCase().includes(term)
    );
  }, [migrationBatches, activeTab, searchTerm]);

  // Column definitions for VirtualizedDataGrid
  const mailboxColumns = useMemo<ColDef<Mailbox>[]>(
    () => [
      {
        field: 'DisplayName',
        headerName: 'Display Name',
        sortable: true,
        filter: true,
        pinned: 'left',
        width: 200,
      },
      {
        field: 'UserPrincipalName',
        headerName: 'UPN',
        sortable: true,
        filter: true,
        width: 250,
      },
      {
        field: 'PrimarySmtpAddress',
        headerName: 'Email',
        sortable: true,
        filter: true,
        width: 250,
      },
      {
        field: 'RecipientTypeDetails',
        headerName: 'Type',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'Department',
        headerName: 'Department',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'JobTitle',
        headerName: 'Job Title',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'AccountEnabled',
        headerName: 'Enabled',
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          if (params.value === 'True' || params.value === true) return 'Yes';
          if (params.value === 'False' || params.value === false) return 'No';
          return params.value || 'N/A';
        },
        width: 100,
      },
      {
        field: 'MailboxSizeMB',
        headerName: 'Size (MB)',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => {
          const value = parseFloat(params.value);
          if (isNaN(value)) return 'N/A';
          return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
        },
        width: 120,
      },
      {
        field: 'MailboxTotalItemCount',
        headerName: 'Total Items',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => {
          const value = parseInt(params.value);
          if (isNaN(value)) return 'N/A';
          return value.toLocaleString();
        },
        width: 120,
      },
      {
        field: 'HasArchiveMailbox',
        headerName: 'Archive',
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          if (params.value === 'True' || params.value === true) return 'Yes';
          if (params.value === 'False' || params.value === false) return 'No';
          return params.value || 'N/A';
        },
        width: 100,
      },
      {
        field: 'EXO_LitigationHoldEnabled',
        headerName: 'Litigation Hold',
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          if (params.value === 'True' || params.value === true) return 'Yes';
          if (params.value === 'False' || params.value === false) return 'No';
          return params.value || 'N/A';
        },
        width: 130,
      },
      {
        field: 'CreatedDateTime',
        headerName: 'Created',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => {
          if (!params.value) return 'N/A';
          try {
            return new Date(params.value).toLocaleDateString();
          } catch {
            return params.value;
          }
        },
        width: 120,
      },
    ],
    []
  );

  const groupColumns = useMemo<ColDef<DistributionGroup>[]>(
    () => [
      {
        field: 'DisplayName',
        headerName: 'Display Name',
        sortable: true,
        filter: true,
        pinned: 'left',
        width: 200,
      },
      {
        field: 'PrimarySmtpAddress',
        headerName: 'Email',
        sortable: true,
        filter: true,
        width: 250,
      },
      {
        field: 'GroupType',
        headerName: 'Type',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'RecipientTypeDetails',
        headerName: 'Recipient Type',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'MemberCount',
        headerName: 'Members',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => {
          const value = parseInt(params.value);
          if (isNaN(value)) return 'N/A';
          return value.toLocaleString();
        },
        width: 100,
      },
      {
        field: 'OwnerCount',
        headerName: 'Owners',
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => {
          const value = parseInt(params.value);
          if (isNaN(value)) return 'N/A';
          return value.toLocaleString();
        },
        width: 100,
      },
      {
        field: 'MailEnabled',
        headerName: 'Mail Enabled',
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          if (params.value === 'True' || params.value === true) return 'Yes';
          if (params.value === 'False' || params.value === false) return 'No';
          return params.value || 'N/A';
        },
        width: 120,
      },
      {
        field: 'SecurityEnabled',
        headerName: 'Security Enabled',
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          if (params.value === 'True' || params.value === true) return 'Yes';
          if (params.value === 'False' || params.value === false) return 'No';
          return params.value || 'N/A';
        },
        width: 130,
      },
      {
        field: 'Visibility',
        headerName: 'Visibility',
        sortable: true,
        filter: true,
        width: 100,
      },
      {
        field: 'CreatedDateTime',
        headerName: 'Created',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => {
          if (!params.value) return 'N/A';
          try {
            return new Date(params.value).toLocaleDateString();
          } catch {
            return params.value;
          }
        },
        width: 120,
      },
    ],
    []
  );

  const contactColumns = useMemo<ColDef<MailContact>[]>(
    () => [
      {
        field: 'DisplayName',
        headerName: 'Display Name',
        sortable: true,
        filter: true,
        pinned: 'left',
        width: 200,
      },
      {
        field: 'ExternalEmailAddress',
        headerName: 'External Email',
        sortable: true,
        filter: true,
        width: 250,
      },
      {
        field: 'PrimarySmtpAddress',
        headerName: 'Primary SMTP',
        sortable: true,
        filter: true,
        width: 250,
      },
      {
        field: 'Alias',
        headerName: 'Alias',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'RecipientType',
        headerName: 'Recipient Type',
        sortable: true,
        filter: true,
        width: 150,
      },
      {
        field: 'HiddenFromAddressListsEnabled',
        headerName: 'Hidden',
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          if (params.value === 'True' || params.value === true) return 'Yes';
          if (params.value === 'False' || params.value === false) return 'No';
          return params.value || 'N/A';
        },
        width: 100,
      },
      {
        field: 'CreatedDateTime',
        headerName: 'Created',
        sortable: true,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => {
          if (!params.value) return 'N/A';
          try {
            return new Date(params.value).toLocaleDateString();
          } catch {
            return params.value;
          }
        },
        width: 120,
      },
    ],
    []
  );

  const domainColumns = useMemo<ColDef<AcceptedDomain>[]>(
    () => [
      {
        field: 'DomainName',
        headerName: 'Domain Name',
        sortable: true,
        filter: true,
        pinned: 'left',
        width: 250,
      },
      {
        field: 'AuthenticationType',
        headerName: 'Authentication Type',
        sortable: true,
        filter: true,
        width: 180,
      },
      {
        field: 'IsDefault',
        headerName: 'Default',
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          if (params.value === 'True' || params.value === true) return 'Yes';
          if (params.value === 'False' || params.value === false) return 'No';
          return params.value || 'N/A';
        },
        width: 100,
      },
      {
        field: 'IsInitial',
        headerName: 'Initial',
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          if (params.value === 'True' || params.value === true) return 'Yes';
          if (params.value === 'False' || params.value === false) return 'No';
          return params.value || 'N/A';
        },
        width: 100,
      },
      {
        field: 'IsVerified',
        headerName: 'Verified',
        sortable: true,
        filter: true,
        valueFormatter: (params) => {
          if (params.value === 'True' || params.value === true) return 'Yes';
          if (params.value === 'False' || params.value === false) return 'No';
          return params.value || 'N/A';
        },
        width: 100,
      },
      {
        field: 'SupportedServices',
        headerName: 'Supported Services',
        sortable: true,
        filter: true,
        width: 200,
      },
      {
        field: 'MailFlowStatus',
        headerName: 'Mail Flow Status',
        sortable: true,
        filter: true,
        width: 150,
      },
    ],
    []
  );

  // Transport Rules columns
  const transportRuleColumns = useMemo<ColDef<TransportRule>[]>(
    () => [
      { field: 'Name', headerName: 'Rule Name', sortable: true, filter: true, pinned: 'left', width: 250 },
      { field: 'State', headerName: 'State', sortable: true, filter: true, width: 100,
        cellStyle: (params) => ({
          color: params.value === 'Enabled' ? '#22c55e' : '#ef4444',
          fontWeight: 'bold'
        })
      },
      { field: 'Priority', headerName: 'Priority', sortable: true, filter: 'agNumberColumnFilter', width: 100 },
      { field: 'Mode', headerName: 'Mode', sortable: true, filter: true, width: 120 },
      { field: 'FromScope', headerName: 'From Scope', sortable: true, filter: true, width: 120 },
      { field: 'SentToScope', headerName: 'Sent To Scope', sortable: true, filter: true, width: 130 },
      { field: 'Actions', headerName: 'Actions', sortable: true, filter: true, width: 300 },
      { field: 'Conditions', headerName: 'Conditions', sortable: true, filter: true, width: 300 },
      { field: 'Comments', headerName: 'Comments', sortable: true, filter: true, width: 200 },
    ],
    []
  );

  // Inbound Connector columns
  const inboundConnectorColumns = useMemo<ColDef<InboundConnector>[]>(
    () => [
      { field: 'Name', headerName: 'Connector Name', sortable: true, filter: true, pinned: 'left', width: 200 },
      { field: 'Enabled', headerName: 'Enabled', sortable: true, filter: true, width: 100,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'ConnectorType', headerName: 'Type', sortable: true, filter: true, width: 120 },
      { field: 'SenderDomains', headerName: 'Sender Domains', sortable: true, filter: true, width: 200 },
      { field: 'SenderIPAddresses', headerName: 'Sender IPs', sortable: true, filter: true, width: 200 },
      { field: 'RequireTls', headerName: 'Require TLS', sortable: true, filter: true, width: 120,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'TreatMessagesAsInternal', headerName: 'Treat as Internal', sortable: true, filter: true, width: 140,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'Comment', headerName: 'Comment', sortable: true, filter: true, width: 200 },
    ],
    []
  );

  // Outbound Connector columns
  const outboundConnectorColumns = useMemo<ColDef<OutboundConnector>[]>(
    () => [
      { field: 'Name', headerName: 'Connector Name', sortable: true, filter: true, pinned: 'left', width: 200 },
      { field: 'Enabled', headerName: 'Enabled', sortable: true, filter: true, width: 100,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'ConnectorType', headerName: 'Type', sortable: true, filter: true, width: 120 },
      { field: 'RecipientDomains', headerName: 'Recipient Domains', sortable: true, filter: true, width: 200 },
      { field: 'SmartHosts', headerName: 'Smart Hosts', sortable: true, filter: true, width: 200 },
      { field: 'TlsSettings', headerName: 'TLS Settings', sortable: true, filter: true, width: 150 },
      { field: 'RequireTLS', headerName: 'Require TLS', sortable: true, filter: true, width: 120,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'RouteAllMessagesViaOnPremises', headerName: 'Route via On-Prem', sortable: true, filter: true, width: 150,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'Comment', headerName: 'Comment', sortable: true, filter: true, width: 200 },
    ],
    []
  );

  // Remote Domain columns
  const remoteDomainColumns = useMemo<ColDef<RemoteDomain>[]>(
    () => [
      { field: 'DomainName', headerName: 'Domain', sortable: true, filter: true, pinned: 'left', width: 200 },
      { field: 'Name', headerName: 'Name', sortable: true, filter: true, width: 150 },
      { field: 'AllowedOOFType', headerName: 'OOF Type', sortable: true, filter: true, width: 120 },
      { field: 'AutoReplyEnabled', headerName: 'Auto Reply', sortable: true, filter: true, width: 110,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'AutoForwardEnabled', headerName: 'Auto Forward', sortable: true, filter: true, width: 120,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'DeliveryReportEnabled', headerName: 'Delivery Reports', sortable: true, filter: true, width: 130,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'IsInternal', headerName: 'Internal', sortable: true, filter: true, width: 100,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
    ],
    []
  );

  // DKIM Config columns
  const dkimConfigColumns = useMemo<ColDef<DkimConfig>[]>(
    () => [
      { field: 'Domain', headerName: 'Domain', sortable: true, filter: true, pinned: 'left', width: 200 },
      { field: 'Enabled', headerName: 'Enabled', sortable: true, filter: true, width: 100,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No',
        cellStyle: (params) => ({
          color: params.value === 'True' ? '#22c55e' : '#ef4444',
          fontWeight: 'bold'
        })
      },
      { field: 'Status', headerName: 'Status', sortable: true, filter: true, width: 120 },
      { field: 'Selector1CNAME', headerName: 'Selector 1 CNAME', sortable: true, filter: true, width: 300 },
      { field: 'Selector2CNAME', headerName: 'Selector 2 CNAME', sortable: true, filter: true, width: 300 },
      { field: 'KeyCreationTime', headerName: 'Key Created', sortable: true, filter: true, width: 150 },
    ],
    []
  );

  // Anti-Spam Policy columns
  const antiSpamPolicyColumns = useMemo<ColDef<AntiSpamPolicy>[]>(
    () => [
      { field: 'Name', headerName: 'Policy Name', sortable: true, filter: true, pinned: 'left', width: 200 },
      { field: 'IsDefault', headerName: 'Default', sortable: true, filter: true, width: 100,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'BulkThreshold', headerName: 'Bulk Threshold', sortable: true, filter: 'agNumberColumnFilter', width: 130 },
      { field: 'SpamAction', headerName: 'Spam Action', sortable: true, filter: true, width: 140 },
      { field: 'HighConfidenceSpamAction', headerName: 'HC Spam Action', sortable: true, filter: true, width: 150 },
      { field: 'PhishSpamAction', headerName: 'Phish Action', sortable: true, filter: true, width: 130 },
      { field: 'HighConfidencePhishAction', headerName: 'HC Phish Action', sortable: true, filter: true, width: 150 },
      { field: 'QuarantineRetentionPeriod', headerName: 'Quarantine Days', sortable: true, filter: true, width: 140 },
    ],
    []
  );

  // Anti-Phish Policy columns
  const antiPhishPolicyColumns = useMemo<ColDef<AntiPhishPolicy>[]>(
    () => [
      { field: 'Name', headerName: 'Policy Name', sortable: true, filter: true, pinned: 'left', width: 200 },
      { field: 'Enabled', headerName: 'Enabled', sortable: true, filter: true, width: 100,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'IsDefault', headerName: 'Default', sortable: true, filter: true, width: 100,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'EnableMailboxIntelligence', headerName: 'Mailbox Intel', sortable: true, filter: true, width: 120,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'EnableSpoofIntelligence', headerName: 'Spoof Intel', sortable: true, filter: true, width: 110,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'EnableOrganizationDomainsProtection', headerName: 'Org Domains', sortable: true, filter: true, width: 120,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'AuthenticationFailAction', headerName: 'Auth Fail Action', sortable: true, filter: true, width: 140 },
    ],
    []
  );

  // Malware Policy columns
  const malwarePolicyColumns = useMemo<ColDef<MalwarePolicy>[]>(
    () => [
      { field: 'Name', headerName: 'Policy Name', sortable: true, filter: true, pinned: 'left', width: 200 },
      { field: 'IsDefault', headerName: 'Default', sortable: true, filter: true, width: 100,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'EnableFileFilter', headerName: 'File Filter', sortable: true, filter: true, width: 110,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'FileTypes', headerName: 'Blocked File Types', sortable: true, filter: true, width: 200 },
      { field: 'ZapEnabled', headerName: 'ZAP Enabled', sortable: true, filter: true, width: 110,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'EnableInternalSenderAdminNotifications', headerName: 'Int Admin Notify', sortable: true, filter: true, width: 140,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
      { field: 'EnableExternalSenderAdminNotifications', headerName: 'Ext Admin Notify', sortable: true, filter: true, width: 140,
        valueFormatter: (params) => params.value === 'True' ? 'Yes' : 'No' },
    ],
    []
  );

  // DNS Records columns
  const dnsRecordColumns = useMemo<ColDef<DomainDNSRecord>[]>(
    () => [
      { field: 'DomainName', headerName: 'Domain', sortable: true, filter: true, pinned: 'left', width: 200 },
      { field: 'MailGatewayType', headerName: 'Gateway Type', sortable: true, filter: true, width: 130,
        cellStyle: (params) => ({
          color: params.value === 'Direct' ? '#22c55e' : '#f59e0b',
          fontWeight: 'bold'
        })
      },
      { field: 'ThirdPartyGateway', headerName: 'Third-Party Gateway', sortable: true, filter: true, width: 160 },
      { field: 'MXRecord', headerName: 'MX Record', sortable: true, filter: true, width: 300 },
      { field: 'MXPriority', headerName: 'MX Priority', sortable: true, filter: 'agNumberColumnFilter', width: 110 },
      { field: 'SPFRecord', headerName: 'SPF Record', sortable: true, filter: true, width: 300 },
      { field: 'DMARCRecord', headerName: 'DMARC Record', sortable: true, filter: true, width: 300 },
      { field: 'DKIMSelector1', headerName: 'DKIM Selector 1', sortable: true, filter: true, width: 200 },
    ],
    []
  );

  // Migration Endpoint columns
  const migrationEndpointColumns = useMemo<ColDef<MigrationEndpoint>[]>(
    () => [
      { field: 'Identity', headerName: 'Endpoint', sortable: true, filter: true, pinned: 'left', width: 200 },
      { field: 'EndpointType', headerName: 'Type', sortable: true, filter: true, width: 150 },
      { field: 'RemoteServer', headerName: 'Remote Server', sortable: true, filter: true, width: 200 },
      { field: 'MaxConcurrentMigrations', headerName: 'Max Concurrent', sortable: true, filter: 'agNumberColumnFilter', width: 130 },
      { field: 'MaxConcurrentIncrementalSyncs', headerName: 'Max Incremental', sortable: true, filter: 'agNumberColumnFilter', width: 140 },
    ],
    []
  );

  // Migration Batch columns
  const migrationBatchColumns = useMemo<ColDef<MigrationBatch>[]>(
    () => [
      { field: 'Identity', headerName: 'Batch Name', sortable: true, filter: true, pinned: 'left', width: 200 },
      { field: 'Status', headerName: 'Status', sortable: true, filter: true, width: 120,
        cellStyle: (params) => {
          const colors: Record<string, string> = {
            'Completed': '#22c55e',
            'InProgress': '#3b82f6',
            'Syncing': '#f59e0b',
            'Failed': '#ef4444'
          };
          return { color: colors[params.value] || '#6b7280', fontWeight: 'bold' };
        }
      },
      { field: 'Type', headerName: 'Type', sortable: true, filter: true, width: 150 },
      { field: 'SourceEndpoint', headerName: 'Source Endpoint', sortable: true, filter: true, width: 180 },
      { field: 'TargetDeliveryDomain', headerName: 'Target Domain', sortable: true, filter: true, width: 180 },
      { field: 'TotalCount', headerName: 'Total', sortable: true, filter: 'agNumberColumnFilter', width: 100 },
      { field: 'FinalizedCount', headerName: 'Finalized', sortable: true, filter: 'agNumberColumnFilter', width: 100 },
      { field: 'StartDateTime', headerName: 'Started', sortable: true, filter: true, width: 150 },
      { field: 'CompleteDateTime', headerName: 'Completed', sortable: true, filter: true, width: 150 },
    ],
    []
  );

  // Export to CSV
  const exportToCSV = () => {
    let data: any[] = [];
    let filename = '';

    switch (activeTab) {
      case 'mailboxes':
        data = filteredMailboxes;
        filename = 'exchange_mailboxes_export.csv';
        break;
      case 'groups':
        data = filteredGroups;
        filename = 'exchange_groups_export.csv';
        break;
      case 'contacts':
        data = filteredContacts;
        filename = 'exchange_contacts_export.csv';
        break;
      case 'domains':
        data = filteredDomains;
        filename = 'exchange_domains_export.csv';
        break;
      case 'transportRules':
        data = filteredTransportRules;
        filename = 'exchange_transport_rules_export.csv';
        break;
      case 'inboundConnectors':
        data = filteredInboundConnectors;
        filename = 'exchange_inbound_connectors_export.csv';
        break;
      case 'outboundConnectors':
        data = filteredOutboundConnectors;
        filename = 'exchange_outbound_connectors_export.csv';
        break;
      case 'remoteDomains':
        data = filteredRemoteDomains;
        filename = 'exchange_remote_domains_export.csv';
        break;
      case 'dkim':
        data = filteredDkimConfigs;
        filename = 'exchange_dkim_export.csv';
        break;
      case 'antiSpam':
        data = filteredAntiSpamPolicies;
        filename = 'exchange_antispam_export.csv';
        break;
      case 'antiPhish':
        data = filteredAntiPhishPolicies;
        filename = 'exchange_antiphish_export.csv';
        break;
      case 'malware':
        data = filteredMalwarePolicies;
        filename = 'exchange_malware_export.csv';
        break;
      case 'dns':
        data = filteredDnsRecords;
        filename = 'exchange_dns_records_export.csv';
        break;
      case 'migrationEndpoints':
        data = filteredMigrationEndpoints;
        filename = 'exchange_migration_endpoints_export.csv';
        break;
      case 'migrationBatches':
        data = filteredMigrationBatches;
        filename = 'exchange_migration_batches_export.csv';
        break;
      default:
        return;
    }

    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    statistics,
    // Core data
    filteredMailboxes,
    filteredGroups,
    filteredContacts,
    filteredDomains,
    // Mail flow data
    filteredTransportRules,
    filteredInboundConnectors,
    filteredOutboundConnectors,
    filteredRemoteDomains,
    // Security data
    filteredDkimConfigs,
    filteredAntiSpamPolicies,
    filteredAntiPhishPolicies,
    filteredMalwarePolicies,
    // DNS and migration data
    filteredDnsRecords,
    filteredMigrationEndpoints,
    filteredMigrationBatches,
    // Core columns
    mailboxColumns,
    groupColumns,
    contactColumns,
    domainColumns,
    // Mail flow columns
    transportRuleColumns,
    inboundConnectorColumns,
    outboundConnectorColumns,
    remoteDomainColumns,
    // Security columns
    dkimConfigColumns,
    antiSpamPolicyColumns,
    antiPhishPolicyColumns,
    malwarePolicyColumns,
    // DNS and migration columns
    dnsRecordColumns,
    migrationEndpointColumns,
    migrationBatchColumns,
    exportToCSV,
  };
}
