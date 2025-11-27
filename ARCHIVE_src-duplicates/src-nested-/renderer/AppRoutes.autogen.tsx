import ActiveDirectoryDiscoveryView from "./views/discovery/ActiveDirectoryDiscoveryView";
import ApplicationDiscoveryView from "./views/discovery/ApplicationDiscoveryView";
import ApplicationDependencyMappingDiscoveryView from "./views/discovery/ApplicationDependencyMappingDiscoveryView";
import ApplicationDiscoveryDiscoveryView from "./views/discovery/ApplicationDiscoveryDiscoveryView";
import AWSDiscoveryView from "./views/discovery/AWSDiscoveryView";
import AzureDiscoveryView from "./views/discovery/AzureDiscoveryView";
import AzureResourceDiscoveryView from "./views/discovery/AzureResourceDiscoveryView";
import BackupRecoveryDiscoveryView from "./views/discovery/BackupRecoveryDiscoveryView";
import CertificateAuthorityDiscoveryView from "./views/discovery/CertificateAuthorityDiscoveryView";
import CertificateDiscoveryView from "./views/discovery/CertificateDiscoveryView";
import ConcurrentDiscoveryEngineDiscoveryView from "./views/discovery/ConcurrentDiscoveryEngineDiscoveryView";
import ConditionalAccessDiscoveryView from "./views/discovery/ConditionalAccessDiscoveryView";
import DatabaseSchemaDiscoveryView from "./views/discovery/DatabaseSchemaDiscoveryView";
import DataClassificationDiscoveryView from "./views/discovery/DataClassificationDiscoveryView";
import DataClassificationDiscoveryDiscoveryView from "./views/discovery/DataClassificationDiscoveryDiscoveryView";
import DiscoveryBaseDiscoveryView from "./views/discovery/DiscoveryBaseDiscoveryView";
import DiscoveryModuleBaseDiscoveryView from "./views/discovery/DiscoveryModuleBaseDiscoveryView";
import DLPDiscoveryView from "./views/discovery/DLPDiscoveryView";
import DNSDHCPDiscoveryView from "./views/discovery/DNSDHCPDiscoveryView";
import EntraIDAppDiscoveryView from "./views/discovery/EntraIDAppDiscoveryView";
import EntraIDAppDiscoveryDiscoveryView from "./views/discovery/EntraIDAppDiscoveryDiscoveryView";
import EnvironmentDetectionDiscoveryView from "./views/discovery/EnvironmentDetectionDiscoveryView";
import ExchangeDiscoveryView from "./views/discovery/ExchangeDiscoveryView";
import ExternalIdentityDiscoveryView from "./views/discovery/ExternalIdentityDiscoveryView";
import ExternalIdentityDiscoveryDiscoveryView from "./views/discovery/ExternalIdentityDiscoveryDiscoveryView";
import FileServerDiscoveryView from "./views/discovery/FileServerDiscoveryView";
import FileServerDiscoveryDiscoveryView from "./views/discovery/FileServerDiscoveryDiscoveryView";
import GCPDiscoveryView from "./views/discovery/GCPDiscoveryView";
import GPODiscoveryView from "./views/discovery/GPODiscoveryView";
import GraphDiscoveryView from "./views/discovery/GraphDiscoveryView";
import InfrastructureDiscoveryView from "./views/discovery/InfrastructureDiscoveryView";
import IntuneDiscoveryView from "./views/discovery/IntuneDiscoveryView";
import LicensingDiscoveryView from "./views/discovery/LicensingDiscoveryView";
import LicensingDiscoveryDiscoveryView from "./views/discovery/LicensingDiscoveryDiscoveryView";
import MultiDomainForestDiscoveryView from "./views/discovery/MultiDomainForestDiscoveryView";
import MultiDomainForestDiscoveryDiscoveryView from "./views/discovery/MultiDomainForestDiscoveryDiscoveryView";
import NetworkInfrastructureDiscoveryView from "./views/discovery/NetworkInfrastructureDiscoveryView";
import NetworkInfrastructureDiscoveryDiscoveryView from "./views/discovery/NetworkInfrastructureDiscoveryDiscoveryView";
import OneDriveDiscoveryView from "./views/discovery/OneDriveDiscoveryView";
import PaloAltoDiscoveryView from "./views/discovery/PaloAltoDiscoveryView";
import PanoramaInterrogationDiscoveryView from "./views/discovery/PanoramaInterrogationDiscoveryView";
import PhysicalServerDiscoveryView from "./views/discovery/PhysicalServerDiscoveryView";
import PhysicalServerDiscoveryDiscoveryView from "./views/discovery/PhysicalServerDiscoveryDiscoveryView";
import PowerBIDiscoveryView from "./views/discovery/PowerBIDiscoveryView";
import PowerPlatformDiscoveryView from "./views/discovery/PowerPlatformDiscoveryView";
import PrinterDiscoveryView from "./views/discovery/PrinterDiscoveryView";
import RealTimeDiscoveryEngineDiscoveryView from "./views/discovery/RealTimeDiscoveryEngineDiscoveryView";
import ScheduledTaskDiscoveryView from "./views/discovery/ScheduledTaskDiscoveryView";
import SecurityGroupAnalysisDiscoveryView from "./views/discovery/SecurityGroupAnalysisDiscoveryView";
import SecurityInfrastructureDiscoveryView from "./views/discovery/SecurityInfrastructureDiscoveryView";
import SharePointDiscoveryView from "./views/discovery/SharePointDiscoveryView";
import SQLServerDiscoveryView from "./views/discovery/SQLServerDiscoveryView";
import SQLServerDiscoveryDiscoveryView from "./views/discovery/SQLServerDiscoveryDiscoveryView";
import StorageArrayDiscoveryView from "./views/discovery/StorageArrayDiscoveryView";
import TeamsDiscoveryView from "./views/discovery/TeamsDiscoveryView";
import VirtualizationDiscoveryView from "./views/discovery/VirtualizationDiscoveryView";
import VirtualizationDiscoveryDiscoveryView from "./views/discovery/VirtualizationDiscoveryDiscoveryView";
import VMwareDiscoveryView from "./views/discovery/VMwareDiscoveryView";
import WebServerConfigDiscoveryView from "./views/discovery/WebServerConfigDiscoveryView";
import ApplicationMigrationView from "./views/migration/ApplicationMigrationView";
import FileSystemMigrationView from "./views/migration/FileSystemMigrationView";
import MailboxMigrationView from "./views/migration/MailboxMigrationView";
import MailboxMigrationBackupMigrationView from "./views/migration/MailboxMigrationBackupMigrationView";
import ServerMigrationView from "./views/migration/ServerMigrationView";
import SharePointMigrationView from "./views/migration/SharePointMigrationView";
import SharePointMigrationEnhancedMigrationView from "./views/migration/SharePointMigrationEnhancedMigrationView";
import UserMigrationView from "./views/migration/UserMigrationView";
import UserProfileMigrationView from "./views/migration/UserProfileMigrationView";
import VirtualMachineMigrationView from "./views/migration/VirtualMachineMigrationView";

export const AUTO_DISCOVERY_ROUTES = [
  { path: "/discovery/activedirectory", element: <ActiveDirectoryDiscoveryView /> },
  { path: "/discovery/application", element: <ApplicationDiscoveryView /> },
  { path: "/discovery/applicationdependencymapping", element: <ApplicationDependencyMappingDiscoveryView /> },
  { path: "/discovery/applicationdiscovery", element: <ApplicationDiscoveryDiscoveryView /> },
  { path: "/discovery/aws", element: <AWSDiscoveryView /> },
  { path: "/discovery/azure", element: <AzureDiscoveryView /> },
  { path: "/discovery/azureresource", element: <AzureResourceDiscoveryView /> },
  { path: "/discovery/backuprecovery", element: <BackupRecoveryDiscoveryView /> },
  { path: "/discovery/certificateauthority", element: <CertificateAuthorityDiscoveryView /> },
  { path: "/discovery/certificate", element: <CertificateDiscoveryView /> },
  { path: "/discovery/concurrentdiscoveryengine", element: <ConcurrentDiscoveryEngineDiscoveryView /> },
  { path: "/discovery/conditionalaccess", element: <ConditionalAccessDiscoveryView /> },
  { path: "/discovery/databaseschema", element: <DatabaseSchemaDiscoveryView /> },
  { path: "/discovery/dataclassification", element: <DataClassificationDiscoveryView /> },
  { path: "/discovery/dataclassificationdiscovery", element: <DataClassificationDiscoveryDiscoveryView /> },
  { path: "/discovery/discoverybase", element: <DiscoveryBaseDiscoveryView /> },
  { path: "/discovery/discoverymodulebase", element: <DiscoveryModuleBaseDiscoveryView /> },
  { path: "/discovery/dlp", element: <DLPDiscoveryView /> },
  { path: "/discovery/dnsdhcp", element: <DNSDHCPDiscoveryView /> },
  { path: "/discovery/entraidapp", element: <EntraIDAppDiscoveryView /> },
  { path: "/discovery/entraidappdiscovery", element: <EntraIDAppDiscoveryDiscoveryView /> },
  { path: "/discovery/environmentdetection", element: <EnvironmentDetectionDiscoveryView /> },
  { path: "/discovery/exchange", element: <ExchangeDiscoveryView /> },
  { path: "/discovery/externalidentity", element: <ExternalIdentityDiscoveryView /> },
  { path: "/discovery/externalidentitydiscovery", element: <ExternalIdentityDiscoveryDiscoveryView /> },
  { path: "/discovery/fileserver", element: <FileServerDiscoveryView /> },
  { path: "/discovery/fileserverdiscovery", element: <FileServerDiscoveryDiscoveryView /> },
  { path: "/discovery/gcp", element: <GCPDiscoveryView /> },
  { path: "/discovery/gpo", element: <GPODiscoveryView /> },
  { path: "/discovery/graph", element: <GraphDiscoveryView /> },
  { path: "/discovery/infrastructure", element: <InfrastructureDiscoveryView /> },
  { path: "/discovery/intune", element: <IntuneDiscoveryView /> },
  { path: "/discovery/licensing", element: <LicensingDiscoveryView /> },
  { path: "/discovery/licensingdiscovery", element: <LicensingDiscoveryDiscoveryView /> },
  { path: "/discovery/multidomainforest", element: <MultiDomainForestDiscoveryView /> },
  { path: "/discovery/multidomainforestdiscovery", element: <MultiDomainForestDiscoveryDiscoveryView /> },
  { path: "/discovery/networkinfrastructure", element: <NetworkInfrastructureDiscoveryView /> },
  { path: "/discovery/networkinfrastructurediscovery", element: <NetworkInfrastructureDiscoveryDiscoveryView /> },
  { path: "/discovery/onedrive", element: <OneDriveDiscoveryView /> },
  { path: "/discovery/paloalto", element: <PaloAltoDiscoveryView /> },
  { path: "/discovery/panoramainterrogation", element: <PanoramaInterrogationDiscoveryView /> },
  { path: "/discovery/physicalserver", element: <PhysicalServerDiscoveryView /> },
  { path: "/discovery/physicalserverdiscovery", element: <PhysicalServerDiscoveryDiscoveryView /> },
  { path: "/discovery/powerbi", element: <PowerBIDiscoveryView /> },
  { path: "/discovery/powerplatform", element: <PowerPlatformDiscoveryView /> },
  { path: "/discovery/printer", element: <PrinterDiscoveryView /> },
  { path: "/discovery/realtimediscoveryengine", element: <RealTimeDiscoveryEngineDiscoveryView /> },
  { path: "/discovery/scheduledtask", element: <ScheduledTaskDiscoveryView /> },
  { path: "/discovery/securitygroupanalysis", element: <SecurityGroupAnalysisDiscoveryView /> },
  { path: "/discovery/securityinfrastructure", element: <SecurityInfrastructureDiscoveryView /> },
  { path: "/discovery/sharepoint", element: <SharePointDiscoveryView /> },
  { path: "/discovery/sqlserver", element: <SQLServerDiscoveryView /> },
  { path: "/discovery/sqlserverdiscovery", element: <SQLServerDiscoveryDiscoveryView /> },
  { path: "/discovery/storagearray", element: <StorageArrayDiscoveryView /> },
  { path: "/discovery/teams", element: <TeamsDiscoveryView /> },
  { path: "/discovery/virtualization", element: <VirtualizationDiscoveryView /> },
  { path: "/discovery/virtualizationdiscovery", element: <VirtualizationDiscoveryDiscoveryView /> },
  { path: "/discovery/vmware", element: <VMwareDiscoveryView /> },
  { path: "/discovery/webserverconfig", element: <WebServerConfigDiscoveryView /> }
];

export const AUTO_MIGRATION_ROUTES = [
  { path: "/migration/application", element: <ApplicationMigrationView /> },
  { path: "/migration/filesystem", element: <FileSystemMigrationView /> },
  { path: "/migration/mailbox", element: <MailboxMigrationView /> },
  { path: "/migration/mailboxmigrationbackup", element: <MailboxMigrationBackupMigrationView /> },
  { path: "/migration/server", element: <ServerMigrationView /> },
  { path: "/migration/sharepoint", element: <SharePointMigrationView /> },
  { path: "/migration/sharepointmigrationenhanced", element: <SharePointMigrationEnhancedMigrationView /> },
  { path: "/migration/user", element: <UserMigrationView /> },
  { path: "/migration/userprofile", element: <UserProfileMigrationView /> },
  { path: "/migration/virtualmachine", element: <VirtualMachineMigrationView /> }
];
