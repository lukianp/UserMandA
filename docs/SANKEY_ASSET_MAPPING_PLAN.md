# Organization Sankey Chart - Discovery Asset Mapping Plan

**Date:** 2025-12-30
**Purpose:** Map discovered IT assets from all 63 discovery modules to the Organization Sankey visualization

---

## Executive Summary

The Organization Sankey chart currently supports **116+ asset type mappings** but several key discovery modules are not yet mapped. This document provides a comprehensive plan to integrate:

1. **Infrastructure Discovery** assets (servers, network devices, security devices)
2. Missing discovery module outputs
3. Enhanced relationship inference for discovered assets

**Priority 1: Infrastructure Discovery Integration** - Currently running and generating comprehensive network discovery data.

---

## Current State Analysis

### Available Discovery Modules (63 Total)

| Category | Module Count | Examples |
|----------|--------------|----------|
| **Cloud Discovery** | 9 | AzureDiscovery, AWSDiscovery, GCPDiscovery, AzureResourceDiscovery |
| **Identity & Access** | 10 | ActiveDirectoryDiscovery, EntraIDAppDiscovery, ExternalIdentityDiscovery |
| **Applications & Services** | 8 | ApplicationDiscovery, Office365Discovery, PowerPlatformDiscovery, TeamsDiscovery |
| **Infrastructure** | 12 | InfrastructureDiscovery, PhysicalServerDiscovery, VirtualizationDiscovery, NetworkInfrastructureDiscovery |
| **Security & Compliance** | 8 | SecurityInfrastructureDiscovery, ConditionalAccessDiscovery, DLPDiscovery, CertificateDiscovery |
| **Data & Storage** | 6 | DatabaseSchemaDiscovery, FileServerDiscovery, StorageArrayDiscovery, BackupRecoveryDiscovery |
| **Specialized** | 10 | GPODiscovery, PrinterDiscovery, ScheduledTaskDiscovery, DataClassificationDiscovery |

### Existing typeMapping Coverage

**Well-Covered Categories:**
- ✅ Azure resources (VMs, Functions, KeyVaults, StorageAccounts, VirtualNetworks, NSGs)
- ✅ Identity (Users, Groups, Directory Roles, Service Principals)
- ✅ Microsoft 365 (Exchange, SharePoint, Teams, OneDrive, Intune)
- ✅ Security (Conditional Access, DLP, Antivirus, Firewall Rules)
- ✅ Network infrastructure (DNS, DHCP, Network Adapters, Routes, Shares)
- ✅ Physical servers (BIOS, Hardware, Network Hardware, Storage)
- ✅ Databases (SQL Server, Azure SQL)

**Missing/Incomplete Mappings:**
- ❌ **InfrastructureDiscovery.csv** - Main infrastructure scan output (CRITICAL GAP!)
- ⚠️ **GPODiscovery** - Basic mapping exists but no detailed GPO structure
- ⚠️ **PrinterDiscovery** - No mapping
- ⚠️ **ScheduledTaskDiscovery** - No mapping
- ⚠️ **WebServerConfigDiscovery** - No mapping
- ⚠️ **PaloAltoDiscovery / PanoramaInterrogation** - No mapping
- ⚠️ **VMwareDiscovery** - No mapping (VirtualizationDiscovery exists but VMware-specific missing)
- ⚠️ **CertificateAuthorityDiscovery** - No CA-specific mapping
- ⚠️ **DataClassificationDiscovery** - No mapping
- ⚠️ **ApplicationDependencyMapping** - No mapping

---

## Infrastructure Discovery Deep Dive

### Output Structure (InfrastructureDiscovery.csv)

The Infrastructure Discovery module performs comprehensive network scanning using nmap and produces the following asset record:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `IPAddress` | String | IPv4 address | `192.168.0.10` |
| `Hostname` | String | DNS hostname | `URAN.ljpops.com` |
| `Status` | String | Host status | `up` |
| `OS` | String | Detected operating system | `Linux 4.19 - 5.15` |
| `OSAccuracy` | Int | OS detection confidence (0-100) | `95` |
| `OSFamily` | String | OS family | `Linux`, `Windows` |
| `OpenPorts` | String (CSV) | Comma-separated port list | `53,80,443,3389` |
| `Services` | String (Multi) | Semicolon-separated services with versions | `dnsmasq (53); lighttpd 1.4.63 (80)` |
| `ServiceVersions` | String (Multi) | Semicolon-separated product versions | `dnsmasq 2.87; lighttpd 1.4.63` |
| `MACAddress` | String | MAC address | `AA:BB:CC:DD:EE:FF` |
| `MACVendor` | String | Vendor from OUI | `Sagemcom Broadband SAS` |
| `LastSeen` | DateTime | Discovery timestamp | `2025-12-30 00:21:34` |
| `ScanMethod` | String | Scanning method used | `nmap` or `PowerShell (Production-Safe)` |
| `DeviceType` | String | Inferred device category | See below |
| `RiskLevel` | String | Security risk assessment | `Low`, `High` |
| `Vulnerabilities` | String (Multi) | Semicolon-separated vulnerabilities | `High-risk service: telnet on port 23` |
| `_DataType` | String | Asset categorization | `Server`, `NetworkDevice`, `SecurityDevice`, `StorageDevice`, `Virtualization` |

### DeviceType Inference Logic

The module infers device type using:

1. **OS + Port Matching:**
   - Windows + Port 3389 (RDP) → `Windows Server/Workstation`
   - Linux OS → `Linux Server`

2. **Port-Based Classification** (via `Get-DeviceTypeFromPorts`):
   - Ports 80/443/8080 → `Web Server`
   - Port 3389 → `Windows Server`
   - Port 22 → `Linux/Unix Server`
   - Ports 25/587/110/143/993/995 → `Mail Server`
   - Port 53 → `DNS Server`
   - Ports 1433/3306/5432/1521 → `Database Server`
   - Ports 445/139/137 → `File Server`
   - SNMP ports (161/162) → `Network Device` (Router/Switch)
   - Printer ports (9100/515/631) → `Printer`

3. **_DataType Classification** (added during categorization):
   - `*Server*` → Server
   - `*Router*` → NetworkDevice
   - `*Switch*` → NetworkDevice
   - `*Firewall*` | `*IDS*` | `*IPS*` → SecurityDevice
   - `*Storage*` | `*SAN*` | `*NAS*` → StorageDevice
   - `*ESXi*` | `*Hyper-V*` | `*KVM*` → Virtualization

### Current Discovery Results (In Progress)

**Successfully Scanned Assets:**
- **192.168.0.1**: Sagemcom router (Linux 4.19-5.15), dnsmasq 2.87, lighttpd 1.4.63
  - Ports: 53 (DNS), 80 (HTTP), 443 (HTTPS)
  - Type: NetworkDevice (Router)

- **192.168.0.10**: URAN.ljpops.com - Domain Controller
  - Vendor: Microsoft (Hyper-V VM)
  - Type: Server (Domain Controller)

- **192.168.0.11, 192.168.0.20**: Microsoft Hyper-V VMs
  - Type: Server (Virtualization)

- **192.168.0.109**: Samsung Electronics device
  - Type: Unknown (likely client/endpoint)

- **192.168.0.216**: D-Link device
  - Type: NetworkDevice

- **192.168.0.252**: localhost
  - Type: Server

---

## Recommended typeMapping Additions

### 1. InfrastructureDiscovery (Main CSV) - **CRITICAL**

Add to `useOrganisationMapLogic.ts` line ~100:

```typescript
'infrastructurediscovery': {
  type: 'datacenter',  // Use datacenter for all infrastructure assets
  getName: (r) => {
    // Priority: Hostname > IP > MAC Vendor
    if (r.Hostname && r.Hostname !== 'Unknown') return r.Hostname;
    if (r.IPAddress) {
      // Include MAC vendor for better identification
      if (r.MACVendor && r.MACVendor !== '') {
        return `${r.IPAddress} (${r.MACVendor})`;
      }
      return r.IPAddress;
    }
    return r.MACAddress || 'Unknown Device';
  },
  priority: 1,  // Infrastructure layer (leftmost)
  category: (r) => {
    // Dynamic category based on _DataType field
    switch (r._DataType) {
      case 'Server': return 'Infrastructure';
      case 'NetworkDevice': return 'Network';
      case 'SecurityDevice': return 'Security';
      case 'StorageDevice': return 'Storage';
      case 'Virtualization': return 'Virtualization';
      default: return 'Infrastructure';
    }
  }
},
```

**Note:** The `category` field may need to be dynamic. If the current implementation doesn't support a function for category, use:

```typescript
category: 'Infrastructure'  // Static category, differentiate via DeviceType in factSheet
```

### 2. Additional Missing Mappings

```typescript
// GPO Discovery - Enhanced
'gpodiscovery': {
  type: 'platform',
  getName: (r) => r.DisplayName || r.Name || r.GPOName,
  priority: 3,
  category: 'Policy'
},

// Printer Discovery
'printerdiscovery': {
  type: 'it-component',
  getName: (r) => r.PrinterName || r.Name || r.ShareName,
  priority: 2,
  category: 'Infrastructure'
},

// Scheduled Task Discovery
'scheduledtaskdiscovery': {
  type: 'it-component',
  getName: (r) => r.TaskName || r.Name || r.TaskPath,
  priority: 2,
  category: 'Scheduled Task'
},

// Web Server Config Discovery
'webserverconfigdiscovery': {
  type: 'it-component',
  getName: (r) => r.ServerName || r.SiteName || r.Name,
  priority: 2,
  category: 'Application'
},

// Palo Alto / Panorama Discovery
'panoramainterrogation': {
  type: 'platform',
  getName: (r) => r.DeviceName || r.Name || r.ManagementIP,
  priority: 3,
  category: 'Security'
},
'panoramadiscovery': {
  type: 'platform',
  getName: (r) => r.DeviceName || r.Name || r.ManagementIP,
  priority: 3,
  category: 'Security'
},

// VMware Discovery
'vmwarediscovery': {
  type: 'datacenter',
  getName: (r) => r.VMName || r.Name || r.HostName,
  priority: 1,
  category: 'Virtualization'
},
'vmwarediscovery_vms': {
  type: 'it-component',
  getName: (r) => r.VMName || r.Name,
  priority: 2,
  category: 'Virtualization'
},
'vmwarediscovery_hosts': {
  type: 'datacenter',
  getName: (r) => r.HostName || r.Name,
  priority: 1,
  category: 'Virtualization'
},

// Certificate Authority Discovery
'certificateauthoritydiscovery': {
  type: 'platform',
  getName: (r) => r.CAName || r.Name || r.ServerName,
  priority: 3,
  category: 'Certificate'
},

// Data Classification Discovery
'dataclassificationdiscovery': {
  type: 'it-component',
  getName: (r) => r.FileName || r.Path || r.DataAssetName,
  priority: 2,
  category: 'Data Classification'
},

// Application Dependency Mapping
'applicationdependencymapping': {
  type: 'application',
  getName: (r) => r.ApplicationName || r.Name,
  priority: 2,
  category: 'Dependency'
},
```

---

## Relationship Inference Logic Enhancements

### Current Relationship Capabilities

**Intra-File Links** (same CSV):
- User → Group (via GroupMemberships field)
- Application → Server (via ComputerName field)
- Mailbox → User (via UPN matching)
- OneDrive → User (via OwnerDisplayName)
- SharePoint Site → Owner (via OwnerDisplayName)
- Resource → Resource Group (via ResourceGroupName)
- Service Principal → Application (via AppId)
- User → Manager (via ManagerUPN)

**Cross-File Links** (different CSVs):
- Application → Database (connection string parsing)
- Subscription → Tenant (via TenantId)
- Team → Group (name/ID matching)
- EntraID App → Service Principal (via AppId)
- SharePoint Site → Lists (via SiteUrl)
- Mailbox → User (via UPN/email/display name)

### Recommended Additions for Infrastructure Discovery

Add to `generateLinksForFile()` in `useOrganisationMapLogic.ts` (around line 1472):

```typescript
// Infrastructure Discovery intra-file relationships
if (fileTypeKey.includes('infrastructurediscovery')) {
  nodes.forEach(node => {
    const record = node.metadata.record;

    // Server → Network relationships via subnet inference
    // If we have IP addresses, we can infer subnet membership
    // This would require subnet nodes to exist (from infrastructurediscovery_subnet)

    // Service → Server relationships
    // Parse Services field to create service component nodes
    if (record.Services && record.Services !== '') {
      const services = record.Services.split(';').map(s => s.trim());
      services.forEach(service => {
        // Extract service name (before the port number)
        const serviceMatch = service.match(/^([^(]+)/);
        if (serviceMatch) {
          const serviceName = serviceMatch[1].trim();
          const serviceNodeId = `it-component-${serviceName}-service`;

          // Create service node if it doesn't exist
          // (Would need to check if node exists or create it)

          // Create PROVIDES relationship: Server PROVIDES Service
          links.push({
            source: node.id,
            target: serviceNodeId,
            value: 1,
            type: 'provides' as RelationType
          });
        }
      });
    }
  });
}
```

Add to `generateCrossFileLinksOptimized()` in `useOrganisationMapLogic.ts` (around line 1669):

```typescript
// Infrastructure → Active Directory User/Computer matching
const infraNodes = nodesByType.get('datacenter') || [];
const adUserNodes = allNodes.filter(n =>
  n.metadata.source.includes('activedirectory') &&
  n.type === 'application'  // AD users are mapped as 'application' type
);
const adComputerNodes = allNodes.filter(n =>
  n.metadata.source.includes('activedirectory') &&
  n.metadata.record.ObjectClass === 'computer'
);

infraNodes.forEach(infraNode => {
  const hostname = infraNode.metadata.record.Hostname;
  if (!hostname || hostname === 'Unknown') return;

  // Match infrastructure hostname to AD computer object
  const matchingComputer = adComputerNodes.find(adNode => {
    const adName = adNode.metadata.record.Name || adNode.metadata.record.DNSHostName;
    if (!adName) return false;

    // Match full FQDN or just hostname
    return adName.toLowerCase() === hostname.toLowerCase() ||
           adName.toLowerCase().startsWith(hostname.toLowerCase() + '.');
  });

  if (matchingComputer) {
    links.push({
      source: infraNode.id,
      target: matchingComputer.id,
      value: 1,
      type: 'ownership' as RelationType  // Physical host owns AD computer object
    });
  }
});

// Infrastructure → Application deployment relationships
// Match servers (from infrastructure) to applications (from ApplicationDiscovery)
// via ServerName/ComputerName fields
const appNodes = nodesByType.get('application') || [];
infraNodes.forEach(infraNode => {
  const infraHostname = infraNode.metadata.record.Hostname;
  const infraIP = infraNode.metadata.record.IPAddress;

  if (!infraHostname || infraHostname === 'Unknown') return;

  appNodes.forEach(appNode => {
    const appServer = appNode.metadata.record.ServerName ||
                     appNode.metadata.record.ComputerName ||
                     appNode.metadata.record.HostName;

    if (!appServer) return;

    // Match hostname or IP
    if (appServer.toLowerCase() === infraHostname.toLowerCase() ||
        appServer === infraIP) {
      links.push({
        source: infraNode.id,
        target: appNode.id,
        value: 1,
        type: 'deployment' as RelationType  // Server deploys/hosts Application
      });
    }
  });
});

// Infrastructure → Database hosting relationships
// Match database servers (SQL, MySQL, etc.) to infrastructure hosts
const dbNodes = allNodes.filter(n =>
  n.metadata.category === 'Database' ||
  n.metadata.source.includes('sql') ||
  n.metadata.source.includes('database')
);

infraNodes.forEach(infraNode => {
  const infraHostname = infraNode.metadata.record.Hostname;
  const infraIP = infraNode.metadata.record.IPAddress;
  const openPorts = infraNode.metadata.record.OpenPorts || '';

  // Check if infrastructure host has database ports open
  const hasDatabasePort = openPorts.includes('1433') ||  // SQL Server
                          openPorts.includes('3306') ||  // MySQL
                          openPorts.includes('5432') ||  // PostgreSQL
                          openPorts.includes('1521');    // Oracle

  if (hasDatabasePort) {
    dbNodes.forEach(dbNode => {
      const dbServer = dbNode.metadata.record.ServerName ||
                      dbNode.metadata.record.InstanceName ||
                      dbNode.metadata.record.ComputerName;

      if (!dbServer) return;

      // Match hostname or IP
      if (dbServer.toLowerCase().includes(infraHostname.toLowerCase()) ||
          dbServer === infraIP) {
        links.push({
          source: infraNode.id,
          target: dbNode.id,
          value: 1,
          type: 'deployment' as RelationType  // Server hosts Database
        });
      }
    });
  }
});

// Domain Controller → AD Users/Groups relationships
// Infrastructure hosts identified as Domain Controllers should link to AD assets
infraNodes.forEach(infraNode => {
  const services = infraNode.metadata.record.Services || '';
  const openPorts = infraNode.metadata.record.OpenPorts || '';

  // Identify Domain Controllers by LDAP/Kerberos ports and services
  const isDomainController = openPorts.includes('389') ||  // LDAP
                            openPorts.includes('636') ||  // LDAPS
                            openPorts.includes('88') ||   // Kerberos
                            openPorts.includes('3268') || // Global Catalog
                            services.toLowerCase().includes('ldap') ||
                            services.toLowerCase().includes('kerberos');

  if (isDomainController) {
    // Link DC to all AD users and groups (ownership relationship)
    const adAssets = allNodes.filter(n =>
      n.metadata.source.includes('activedirectory') ||
      n.metadata.source.includes('entraid')
    );

    // Don't create link to every user/group (would be thousands)
    // Instead, create summary statistics in factSheet
    // or link to AD Groups only
    const adGroupNodes = adAssets.filter(n => n.metadata.category === 'Group');
    adGroupNodes.forEach(groupNode => {
      links.push({
        source: infraNode.id,
        target: groupNode.id,
        value: 1,
        type: 'ownership' as RelationType  // DC owns/manages AD Groups
      });
    });
  }
});
```

---

## Visualization Enhancements

### Color Category Additions

Add to `SankeyDiagram.tsx` `CATEGORY_COLORS` (around line 50):

```typescript
const CATEGORY_COLORS: Record<string, string> = {
  // ... existing colors ...

  // Infrastructure Discovery categories
  'Virtualization': '#9b59b6',      // Purple
  'Scheduled Task': '#e67e22',      // Orange
  'Dependency': '#95a5a6',           // Gray
  'Data Classification': '#16a085', // Teal

  // Keep existing colors for:
  // - Infrastructure: '#3498db'
  // - Network: '#2980b9'
  // - Storage: '#f39c12'
  // - Security: '#e74c3c'
};
```

### FactSheet Metadata Enhancement

For Infrastructure Discovery nodes, enhance the `createNodeFromRecord()` function to include rich metadata in the fact sheet:

```typescript
// In useOrganisationMapLogic.ts, around createNodeFromRecord()
if (fileTypeKey.includes('infrastructurediscovery')) {
  factSheet = {
    ...factSheet,
    'Technical Details': {
      'IP Address': record.IPAddress,
      'Hostname': record.Hostname,
      'MAC Address': record.MACAddress,
      'MAC Vendor': record.MACVendor,
      'Operating System': record.OS,
      'OS Accuracy': `${record.OSAccuracy}%`,
      'OS Family': record.OSFamily,
      'Device Type': record.DeviceType,
      'Data Type': record._DataType,
    },
    'Services & Ports': {
      'Open Ports': record.OpenPorts,
      'Services': record.Services,
      'Service Versions': record.ServiceVersions,
    },
    'Security': {
      'Risk Level': record.RiskLevel,
      'Vulnerabilities': record.Vulnerabilities || 'None detected',
      'Last Seen': record.LastSeen,
      'Scan Method': record.ScanMethod,
    }
  };
}
```

---

## Implementation Plan

### Phase 1: Infrastructure Discovery Integration (Immediate - HIGH PRIORITY)

**Objective:** Map currently running Infrastructure Discovery scan results to Sankey chart

**Tasks:**
1. ✅ **Analyze Infrastructure Discovery output structure** (COMPLETE)
2. ⬜ **Add `infrastructurediscovery` typeMapping** to `useOrganisationMapLogic.ts`
   - Location: Line ~100, after existing infrastructure mappings
   - Implement dynamic category based on `_DataType` field
   - Use Hostname > IP > MAC Vendor prioritization for name
3. ⬜ **Add color categories** for new types (Virtualization, Scheduled Task, etc.)
   - Location: `SankeyDiagram.tsx` line ~50
4. ⬜ **Enhance factSheet metadata** for infrastructure nodes
   - Location: `createNodeFromRecord()` in `useOrganisationMapLogic.ts`
5. ⬜ **Test with current Infrastructure Discovery results**
   - Wait for scan to complete (currently in progress)
   - Load InfrastructureDiscovery.csv in Organization Map view
   - Verify nodes appear correctly categorized
   - Verify factSheets show all technical details

**Expected Outcome:**
- Infrastructure devices (7+ from current scan) appear in leftmost layer
- Servers, routers, domain controllers correctly categorized
- Rich technical metadata visible in detail panels

### Phase 2: Relationship Inference (Short-term)

**Objective:** Create meaningful connections between infrastructure and other assets

**Tasks:**
1. ⬜ **Infrastructure → AD Computer matching** (high value)
   - Match hostnames to Active Directory computer objects
   - Creates ownership relationship
2. ⬜ **Infrastructure → Application deployment** (high value)
   - Match servers to applications via hostname/IP
   - Creates deployment relationship
3. ⬜ **Infrastructure → Database hosting** (high value)
   - Match database ports to database instances
   - Creates deployment relationship
4. ⬜ **Domain Controller → AD Assets** (medium value)
   - Link DCs to AD groups (not all users - too many)
   - Creates management relationship
5. ⬜ **Service extraction** (optional, advanced)
   - Parse Services field to create service component nodes
   - Creates provides relationship

**Expected Outcome:**
- Clear visual flow from infrastructure → applications → users
- Domain architecture becomes visible (DC → AD Groups → Users)
- Application hosting relationships clear (Server → App → Database)

### Phase 3: Additional Discovery Modules (Medium-term)

**Objective:** Fill remaining gaps in discovery coverage

**Priority Order:**
1. **GPODiscovery** - Enhance existing basic mapping with detailed structure
2. **VMwareDiscovery** - Critical for virtualization visibility
3. **PrinterDiscovery** - Infrastructure completeness
4. **ScheduledTaskDiscovery** - Automation visibility
5. **WebServerConfigDiscovery** - Application infrastructure
6. **PaloAltoDiscovery** - Security infrastructure
7. **CertificateAuthorityDiscovery** - Security/trust infrastructure
8. **DataClassificationDiscovery** - Compliance visibility
9. **ApplicationDependencyMapping** - Application relationships

**Tasks per module:**
1. Analyze CSV output structure
2. Add typeMapping entry
3. Add color category if new
4. Add relationship inference logic if applicable
5. Test with sample/real data

**Expected Outcome:**
- 100% coverage of all 63 discovery modules
- Comprehensive enterprise architecture visualization
- All assets correctly categorized and connected

### Phase 4: Performance & UX Optimization (Long-term)

**Objective:** Handle large-scale enterprise environments

**Tasks:**
1. ⬜ **Hierarchical grouping**
   - Group infrastructure by subnet
   - Group applications by business capability
   - Group users by organizational unit
2. ⬜ **Advanced filtering**
   - Filter by risk level (show only high-risk assets)
   - Filter by device type (servers only, network only, etc.)
   - Filter by relationship type (deployment, ownership, etc.)
3. ⬜ **Progressive loading**
   - Load summary view first (aggregated)
   - Load details on-demand (drill-down)
   - Reduce 5000 node limit impact
4. ⬜ **Time-based filtering**
   - Filter by LastSeen date (active vs stale)
   - Filter by discovery date (recent vs historical)
5. ⬜ **Custom node shapes**
   - Different shapes for servers, network devices, applications
   - Visual distinction improves readability

**Expected Outcome:**
- Sankey chart handles 10,000+ nodes gracefully
- Users can navigate large environments efficiently
- Performance remains responsive

---

## Testing Strategy

### Unit Testing
- **typeMapping lookup** - Verify each file type resolves to correct mapping
- **Name extraction** - Test getName() functions with various record formats
- **Category assignment** - Verify dynamic vs static category logic
- **Relationship matching** - Test hostname/IP/ID matching algorithms

### Integration Testing
- **CSV parsing** - Test with real discovery outputs
- **Node creation** - Verify factSheets populated correctly
- **Link generation** - Verify relationships created as expected
- **Deduplication** - Verify merge logic doesn't lose data

### End-to-End Testing
- **Small environment (10-50 assets):**
  - Single subnet infrastructure scan
  - Few servers, network devices
  - Verify all appear and connect correctly

- **Medium environment (100-500 assets):**
  - Multi-subnet infrastructure scan
  - AD users/groups, applications
  - Verify performance acceptable

- **Large environment (1000+ assets):**
  - Full enterprise scan
  - All discovery modules
  - Verify limits enforced gracefully

### User Acceptance Testing
- **Navigation:** Can users find specific assets quickly?
- **Comprehension:** Do relationship types make sense?
- **Detail:** Is factSheet information useful?
- **Performance:** Is the interface responsive?

---

## Success Metrics

**Coverage Metrics:**
- ✅ 116+ asset types currently mapped
- 🎯 Target: 130+ asset types (add 14 missing modules)
- 🎯 Current: 63 discovery modules available
- 🎯 Target: 100% module coverage

**Quality Metrics:**
- Name extraction success rate >95% (non-null, meaningful names)
- Relationship inference accuracy >90% (correct matches)
- Deduplication effectiveness >85% (duplicates removed)
- Factsheet completeness >80% (all key fields populated)

**Performance Metrics:**
- Load time <5 seconds for 500 nodes
- Load time <15 seconds for 2000 nodes
- Render time <2 seconds after filters applied
- No browser crashes up to 5000 nodes

**User Experience Metrics:**
- Time to find specific asset <30 seconds
- Comprehension (understand diagram) <5 minutes
- Satisfaction score >4/5
- Task completion rate >90%

---

## Appendix A: Infrastructure Discovery CSV Example

```csv
IPAddress,Hostname,Status,OS,OSAccuracy,OSFamily,OpenPorts,Services,ServiceVersions,MACAddress,MACVendor,LastSeen,ScanMethod,DeviceType,RiskLevel,Vulnerabilities,_DataType
192.168.0.1,,up,Linux 4.19 - 5.15,95,Linux,"53,80,443","dnsmasq (53); lighttpd 1.4.63 (80); https (443)","dnsmasq 2.87; lighttpd 1.4.63",AA:BB:CC:DD:EE:FF,Sagemcom Broadband SAS,2025-12-30 00:21:34,nmap,Linux Server,Low,,NetworkDevice
192.168.0.10,URAN.ljpops.com,up,Windows Server 2019,100,Windows,"53,88,389,445,3389","domain (53); kerberos (88); ldap (389); microsoft-ds (445); ms-wbt-server (3389)",,11:22:33:44:55:66,Microsoft,2025-12-30 00:21:45,nmap,Windows Server/Workstation,Low,,Server
```

---

## Appendix B: File Locations

**Core Files:**
- `D:\Scripts\UserMandA-1\guiv2\src\renderer\hooks\useOrganisationMapLogic.ts` - typeMapping, relationship inference
- `D:\Scripts\UserMandA-1\guiv2\src\renderer\components\organisms\SankeyDiagram.tsx` - Visualization, colors
- `D:\Scripts\UserMandA-1\guiv2\src\renderer\views\organisation\OrganisationMapView.tsx` - View controller
- `D:\Scripts\UserMandA-1\Modules\Discovery\InfrastructureDiscovery.psm1` - Infrastructure Discovery module

**Discovery Output:**
- `C:\DiscoveryData\ljpops\Raw\InfrastructureDiscovery.csv` - Main infrastructure scan results
- `C:\DiscoveryData\ljpops\Raw\*.csv` - All other discovery outputs

**Documentation:**
- `D:\Scripts\UserMandA-1\CLAUDE.local.md` - Workflow and credential management
- `D:\Scripts\UserMandA-1\docs\SANKEY_ASSET_MAPPING_PLAN.md` - This document

---

## Appendix C: Quick Reference - Adding a New Discovery Type

1. **Find the CSV output location and structure**
   - Run discovery module
   - Locate CSV in `C:\DiscoveryData\{profile}\Raw\`
   - Note column names and sample data

2. **Add typeMapping entry** (`useOrganisationMapLogic.ts` line ~100):
   ```typescript
   'yourmodulename': {
     type: 'datacenter' | 'it-component' | 'application' | 'platform',
     getName: (r) => r.Name || r.DisplayName || r.Id,
     priority: 1 | 2 | 3,  // 1=leftmost, 3=rightmost
     category: 'YourCategory'
   },
   ```

3. **Add color category** (if new) (`SankeyDiagram.tsx` line ~50):
   ```typescript
   'YourCategory': '#hexcolor',
   ```

4. **Add relationship logic** (optional) (`useOrganisationMapLogic.ts`):
   - Intra-file: ~line 1472 in `generateLinksForFile()`
   - Cross-file: ~line 1669 in `generateCrossFileLinksOptimized()`

5. **Test**:
   - Run discovery module
   - Open Organization Map view
   - Verify nodes appear in correct layer
   - Verify factSheet shows data
   - Verify relationships created (if applicable)

---

**Document Version:** 1.0
**Last Updated:** 2025-12-30
**Author:** Claude Code Assistant
**Status:** Ready for Implementation
