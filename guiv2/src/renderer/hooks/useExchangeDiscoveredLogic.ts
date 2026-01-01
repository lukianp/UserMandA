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

export function useExchangeDiscoveredLogic() {
  const { selectedSourceProfile } = useProfileStore();

  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [groups, setGroups] = useState<DistributionGroup[]>([]);
  const [contacts, setContacts] = useState<MailContact[]>([]);
  const [domains, setDomains] = useState<AcceptedDomain[]>([]);

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

        const [mailboxData, groupData, contactData, domainData] = await Promise.all([
          loadCSV<Mailbox>('ExchangeMailboxes.csv'),
          loadCSV<DistributionGroup>('ExchangeDistributionGroups.csv'),
          loadCSV<MailContact>('ExchangeMailContacts.csv'),
          loadCSV<AcceptedDomain>('Exchange_AcceptedDomain.csv'),
        ]);

        setMailboxes(mailboxData);
        setGroups(groupData);
        setContacts(contactData);
        setDomains(domainData);

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
    };
  }, [mailboxes, groups, contacts, domains]);

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
    filteredMailboxes,
    filteredGroups,
    filteredContacts,
    filteredDomains,
    mailboxColumns,
    groupColumns,
    contactColumns,
    domainColumns,
    exportToCSV,
  };
}
