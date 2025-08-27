using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Tests.Services
{
    /// <summary>
    /// Comprehensive test suite for LogicEngineService T-029 expanded modules
    /// Tests Threat Detection, Data Governance, Data Lineage, and External Identity modules
    /// </summary>
    public class LogicEngineServiceExpandedModulesTests : IDisposable
    {
        private readonly Mock<ILogger<LogicEngineService>> _mockLogger;
        private readonly string _testDataPath;
        private readonly LogicEngineService _logicEngine;

        public LogicEngineServiceExpandedModulesTests()
        {
            _mockLogger = new Mock<ILogger<LogicEngineService>>();
            _testDataPath = Path.Combine(Path.GetTempPath(), "LogicEngineExpandedTests", Guid.NewGuid().ToString());
            Directory.CreateDirectory(_testDataPath);
            
            _logicEngine = new LogicEngineService(_mockLogger.Object, _testDataPath);
            
            // Set up test data for expanded modules
            SetupExpandedModuleTestData();
        }

        private void SetupExpandedModuleTestData()
        {
            // Create minimal base data
            var usersData = @"UPN,Sam,Sid,Mail,DisplayName,Enabled,OU,ManagerSid,Dept,AzureObjectId,Groups,DiscoveryTimestamp,DiscoveryModule,SessionId
jdoe@contoso.com,jdoe,S-1-5-21-1234567890-1234567890-1234567890-1001,jdoe@contoso.com,John Doe,True,OU=Users,,IT,12345678-1234-1234-1234-123456789abc,Domain Users,2024-01-15T10:30:00Z,ActiveDirectoryDiscovery,session-001";

            // Create ThreatDetection.csv
            var threatData = @"ThreatId,AssetId,AssetType,ThreatCategory,ThreatType,Severity,Status,Description,DetectionTime,Remediation,AffectedUsers,DiscoveryTimestamp,DiscoveryModule,SessionId
THR-001,WS001,Workstation,Malware,Trojan,High,Active,Suspicious executable detected on workstation,2024-01-15T14:30:00Z,Quarantine file and run full scan,S-1-5-21-1234567890-1234567890-1234567890-1001,2024-01-15T15:00:00Z,ThreatDetectionEngine,session-001
THR-002,SRV001,Server,Vulnerability,CVE-2024-0001,Critical,Open,Critical vulnerability in web server component,2024-01-15T13:45:00Z,Apply security patch immediately,Multiple users,2024-01-15T15:00:00Z,ThreatDetectionEngine,session-001
THR-003,DB001,Database,DataBreach,UnauthorizedAccess,High,Investigating,Unusual data access patterns detected,2024-01-15T12:15:00Z,Review access logs and user permissions,Unknown,2024-01-15T15:00:00Z,ThreatDetectionEngine,session-001
THR-004,WS001,Workstation,PolicyViolation,SoftwareViolation,Medium,Resolved,Unauthorized software installation detected,2024-01-14T09:30:00Z,Software removed by IT,S-1-5-21-1234567890-1234567890-1234567890-1001,2024-01-15T15:00:00Z,ThreatDetectionEngine,session-001";

            // Create DataGovernance.csv
            var governanceData = @"AssetId,AssetName,AssetType,DataClassification,Owner,DataSteward,ComplianceStatus,RetentionPolicy,LastReviewDate,NextReviewDate,DataSources,BusinessCriticality,DiscoveryTimestamp,DiscoveryModule,SessionId
DB001,CustomerDatabase,Database,Confidential,jdoe@contoso.com,asmith@contoso.com,Compliant,7 Years,2024-01-01T00:00:00Z,2024-07-01T00:00:00Z,CRM;ERP,High,2024-01-15T16:00:00Z,DataGovernanceMetadataManagement,session-001
FS001,CustomerFiles,FileShare,Sensitive,asmith@contoso.com,bwilson@contoso.com,NonCompliant,5 Years,2023-12-01T00:00:00Z,2024-06-01T00:00:00Z,Manual Upload,Medium,2024-01-15T16:00:00Z,DataGovernanceMetadataManagement,session-001
SP001,ProjectDocuments,SharePoint,Internal,jdoe@contoso.com,,Compliant,3 Years,2024-01-10T00:00:00Z,2024-04-10T00:00:00Z,Teams;OneDrive,Low,2024-01-15T16:00:00Z,DataGovernanceMetadataManagement,session-001
WS001,LocalFiles,Workstation,Public,jdoe@contoso.com,,Unknown,1 Year,,,Unknown,Low,2024-01-15T16:00:00Z,DataGovernanceMetadataManagement,session-001";

            // Create DataLineage.csv
            var lineageData = @"LineageId,SourceAsset,SourceType,TargetAsset,TargetType,FlowType,DataElements,TransformationType,LastFlowTime,FlowFrequency,DataVolume,BusinessProcess,DiscoveryTimestamp,DiscoveryModule,SessionId
LIN-001,CRM_DB,Database,CustomerDatabase,Database,ETL,CustomerData;ContactInfo,Transform,2024-01-15T02:00:00Z,Daily,1000 GB,Customer Management,2024-01-15T17:00:00Z,DataLineageDependencyEngine,session-001
LIN-002,CustomerDatabase,Database,ReportingDW,DataWarehouse,Replication,CustomerData;SalesData,Aggregate,2024-01-15T06:00:00Z,Hourly,500 GB,Business Intelligence,2024-01-15T17:00:00Z,DataLineageDependencyEngine,session-001
LIN-003,FileShare_FS001,FileShare,CustomerDatabase,Database,Manual Import,CustomerFiles;Documents,Load,2024-01-15T08:30:00Z,Weekly,50 GB,Document Processing,2024-01-15T17:00:00Z,DataLineageDependencyEngine,session-001
LIN-004,ReportingDW,DataWarehouse,PowerBI,Analytics,API,AggregatedData;Metrics,Visualization,2024-01-15T09:00:00Z,Real-time,10 GB,Executive Reporting,2024-01-15T17:00:00Z,DataLineageDependencyEngine,session-001";

            // Create ExternalIdentities.csv
            var externalIdentityData = @"ExternalId,ExternalUPN,Provider,ProviderType,InternalUserSid,InternalUPN,MappingStatus,MappingAccuracy,LastSyncTime,Attributes,Roles,TrustLevel,DiscoveryTimestamp,DiscoveryModule,SessionId
EXT-001,john.doe@partner.com,PartnerAD,ActiveDirectory,S-1-5-21-1234567890-1234567890-1234567890-1001,jdoe@contoso.com,Mapped,High,2024-01-15T08:00:00Z,Name;Email;Department,Partner Access,Trusted,2024-01-15T18:00:00Z,ExternalIdentityDiscovery,session-001
EXT-002,jdoe.contractor@vendor.com,VendorAzureAD,AzureActiveDirectory,,jdoe@contoso.com,PotentialMatch,Medium,2024-01-15T07:30:00Z,Name;Email,Contractor,Review Required,2024-01-15T18:00:00Z,ExternalIdentityDiscovery,session-001
EXT-003,alice.smith@partner.com,PartnerAD,ActiveDirectory,,asmith@contoso.com,Unmapped,Unknown,,Name;Email,Guest,Untrusted,2024-01-15T18:00:00Z,ExternalIdentityDiscovery,session-001
EXT-004,admin@supplier.com,SupplierLDAP,LDAP,,admin@contoso.com,Blocked,N/A,,Admin;FullAccess,SystemAdmin,Blocked,2024-01-15T18:00:00Z,ExternalIdentityDiscovery,session-001";

            // Write test CSV files
            File.WriteAllText(Path.Combine(_testDataPath, "Users.csv"), usersData);
            File.WriteAllText(Path.Combine(_testDataPath, "ThreatDetection.csv"), threatData);
            File.WriteAllText(Path.Combine(_testDataPath, "DataGovernance.csv"), governanceData);
            File.WriteAllText(Path.Combine(_testDataPath, "DataLineage.csv"), lineageData);
            File.WriteAllText(Path.Combine(_testDataPath, "ExternalIdentities.csv"), externalIdentityData);

            // Create empty files for other modules to avoid load errors
            File.WriteAllText(Path.Combine(_testDataPath, "Groups.csv"), "");
            File.WriteAllText(Path.Combine(_testDataPath, "Devices.csv"), "");
            File.WriteAllText(Path.Combine(_testDataPath, "Applications.csv"), "");
            File.WriteAllText(Path.Combine(_testDataPath, "GPOs.csv"), "");
            File.WriteAllText(Path.Combine(_testDataPath, "NTFS_ACL.csv"), "");
            File.WriteAllText(Path.Combine(_testDataPath, "Mailboxes.csv"), "");
            File.WriteAllText(Path.Combine(_testDataPath, "AzureRoles.csv"), "");
            File.WriteAllText(Path.Combine(_testDataPath, "SQL.csv"), "");
            File.WriteAllText(Path.Combine(_testDataPath, "MappedDrives.csv"), "");
        }

        public void Dispose()
        {
            if (Directory.Exists(_testDataPath))
            {
                Directory.Delete(_testDataPath, true);
            }
        }

        #region Threat Detection Module Tests

        [Fact]
        public async Task LoadThreatDetection_ShouldParseAllFields()
        {
            // Arrange & Act
            await _logicEngine.LoadAllAsync();
            var stats = _logicEngine.GetLoadStatistics();

            // Assert
            Assert.Equal(4, stats.ThreatCount);
        }

        [Fact]
        public async Task GetThreatsForAssetAsync_ShouldReturnAssetSpecificThreats()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var ws001Threats = await _logicEngine.GetThreatsForAssetAsync("WS001");
            var srv001Threats = await _logicEngine.GetThreatsForAssetAsync("SRV001");

            // Assert
            Assert.Equal(2, ws001Threats.Count); // THR-001 and THR-004
            Assert.Single(srv001Threats); // THR-002

            var malwareThreat = ws001Threats.First(t => t.ThreatId == "THR-001");
            Assert.Equal("Malware", malwareThreat.ThreatCategory);
            Assert.Equal("High", malwareThreat.Severity);
            Assert.Equal("Active", malwareThreat.Status);

            var vulnerabilityThreat = srv001Threats.First();
            Assert.Equal("Vulnerability", vulnerabilityThreat.ThreatCategory);
            Assert.Equal("Critical", vulnerabilityThreat.Severity);
        }

        [Fact]
        public async Task GenerateThreatAnalysisProjectionAsync_ShouldCreateComprehensiveAnalysis()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var threatAnalysis = await _logicEngine.GenerateThreatAnalysisProjectionAsync();

            // Assert
            Assert.NotNull(threatAnalysis);
            Assert.True(threatAnalysis.TotalThreats > 0);
            Assert.True(threatAnalysis.HighSeverityThreats > 0);
            Assert.True(threatAnalysis.CriticalSeverityThreats > 0);
            
            // Should have threat breakdown by category
            Assert.Contains(threatAnalysis.ThreatsByCategory, kvp => kvp.Key == "Malware");
            Assert.Contains(threatAnalysis.ThreatsByCategory, kvp => kvp.Key == "Vulnerability");
            Assert.Contains(threatAnalysis.ThreatsByCategory, kvp => kvp.Key == "DataBreach");
            
            // Should have asset risk scores
            Assert.NotEmpty(threatAnalysis.AssetRiskScores);
            Assert.Contains(threatAnalysis.AssetRiskScores, ars => ars.AssetId == "WS001");
            Assert.Contains(threatAnalysis.AssetRiskScores, ars => ars.AssetId == "SRV001");
        }

        [Fact]
        public async Task ThreatInferenceRules_ShouldCalculateRiskScores()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var threatAnalysis = await _logicEngine.GenerateThreatAnalysisProjectionAsync();
            var ws001Risk = threatAnalysis.AssetRiskScores.First(ars => ars.AssetId == "WS001");
            var srv001Risk = threatAnalysis.AssetRiskScores.First(ars => ars.AssetId == "SRV001");

            // Assert
            // WS001 has 1 High + 1 Medium = should have lower risk than SRV001 with 1 Critical
            Assert.True(srv001Risk.RiskScore > ws001Risk.RiskScore, "Critical vulnerability should result in higher risk score");
            
            // Should include threat details in risk assessment
            Assert.Contains("Malware", ws001Risk.ThreatCategories);
            Assert.Contains("Vulnerability", srv001Risk.ThreatCategories);
        }

        #endregion

        #region Data Governance Module Tests

        [Fact]
        public async Task LoadDataGovernance_ShouldParseAllFields()
        {
            // Arrange & Act
            await _logicEngine.LoadAllAsync();
            var stats = _logicEngine.GetLoadStatistics();

            // Assert
            Assert.Equal(4, stats.GovernanceAssetCount);
        }

        [Fact]
        public async Task GetGovernanceForAssetAsync_ShouldReturnAssetGovernanceInfo()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var db001Governance = await _logicEngine.GetGovernanceForAssetAsync("DB001");
            var fs001Governance = await _logicEngine.GetGovernanceForAssetAsync("FS001");

            // Assert
            Assert.NotNull(db001Governance);
            Assert.Equal("CustomerDatabase", db001Governance.AssetName);
            Assert.Equal("Confidential", db001Governance.DataClassification);
            Assert.Equal("jdoe@contoso.com", db001Governance.Owner);
            Assert.Equal("Compliant", db001Governance.ComplianceStatus);
            Assert.Equal("High", db001Governance.BusinessCriticality);

            Assert.NotNull(fs001Governance);
            Assert.Equal("NonCompliant", fs001Governance.ComplianceStatus);
            Assert.Equal("Medium", fs001Governance.BusinessCriticality);
        }

        [Fact]
        public async Task DataGovernanceInferenceRules_ShouldIdentifyComplianceRisks()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var riskDashboard = await _logicEngine.GenerateRiskDashboardProjectionAsync();

            // Assert
            Assert.NotNull(riskDashboard);
            Assert.True(riskDashboard.GovernanceRisks.Count > 0);
            
            // Should identify non-compliant assets
            var nonCompliantRisks = riskDashboard.GovernanceRisks.Where(gr => gr.RiskType == "NonCompliant").ToList();
            Assert.NotEmpty(nonCompliantRisks);
            Assert.Contains(nonCompliantRisks, risk => risk.AssetId == "FS001");
            
            // Should identify assets with unknown classification
            var unknownClassificationRisks = riskDashboard.GovernanceRisks.Where(gr => gr.RiskType == "UnknownClassification").ToList();
            Assert.Contains(unknownClassificationRisks, risk => risk.AssetId == "WS001");
        }

        [Fact]
        public async Task DataGovernance_ShouldIdentifyRetentionPolicyViolations()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var riskDashboard = await _logicEngine.GenerateRiskDashboardProjectionAsync();

            // Assert
            var retentionViolations = riskDashboard.GovernanceRisks.Where(gr => gr.RiskType == "RetentionPolicyViolation").ToList();
            // FS001 has last review date > 30 days ago, should be flagged
            Assert.Contains(retentionViolations, risk => risk.AssetId == "FS001");
        }

        #endregion

        #region Data Lineage Module Tests

        [Fact]
        public async Task LoadDataLineage_ShouldParseAllFields()
        {
            // Arrange & Act
            await _logicEngine.LoadAllAsync();
            var stats = _logicEngine.GetLoadStatistics();

            // Assert
            Assert.Equal(4, stats.LineageFlowCount);
        }

        [Fact]
        public async Task GetLineageForAssetAsync_ShouldReturnUpstreamAndDownstreamFlows()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var customerDbLineage = await _logicEngine.GetLineageForAssetAsync("CustomerDatabase");
            var reportingDwLineage = await _logicEngine.GetLineageForAssetAsync("ReportingDW");

            // Assert
            // CustomerDatabase should appear as both source and target
            Assert.Equal(2, customerDbLineage.Count); // LIN-001 (as target) and LIN-002 (as source)
            
            var incomingFlow = customerDbLineage.First(l => l.TargetAsset == "CustomerDatabase");
            Assert.Equal("CRM_DB", incomingFlow.SourceAsset);
            Assert.Equal("ETL", incomingFlow.FlowType);
            Assert.Equal("Daily", incomingFlow.FlowFrequency);

            var outgoingFlow = customerDbLineage.First(l => l.SourceAsset == "CustomerDatabase");
            Assert.Equal("ReportingDW", outgoingFlow.TargetAsset);
            Assert.Equal("Replication", outgoingFlow.FlowType);

            // ReportingDW should have incoming from CustomerDatabase and outgoing to PowerBI
            Assert.Equal(2, reportingDwLineage.Count);
        }

        [Fact]
        public async Task DataLineageInferenceRules_ShouldIdentifyDependencyChains()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var riskDashboard = await _logicEngine.GenerateRiskDashboardProjectionAsync();

            // Assert
            Assert.NotNull(riskDashboard);
            
            // Should identify critical data flow dependencies
            var lineageDependencies = riskDashboard.LineageDependencies;
            Assert.NotEmpty(lineageDependencies);
            
            // Should identify CustomerDatabase as a critical hub (multiple dependencies)
            var customerDbDeps = lineageDependencies.FirstOrDefault(ld => ld.AssetId == "CustomerDatabase");
            Assert.NotNull(customerDbDeps);
            Assert.True(customerDbDeps.UpstreamDependencies > 0);
            Assert.True(customerDbDeps.DownstreamDependencies > 0);
            Assert.Equal("High", customerDbDeps.CriticalityLevel); // Multiple dependencies = high criticality
        }

        [Fact]
        public async Task DataLineage_ShouldDetectBrokenFlows()
        {
            // Arrange - Create a lineage entry with a missing source
            var brokenLineageData = @"LineageId,SourceAsset,SourceType,TargetAsset,TargetType,FlowType,DataElements,TransformationType,LastFlowTime,FlowFrequency,DataVolume,BusinessProcess,DiscoveryTimestamp,DiscoveryModule,SessionId
LIN-005,NonExistentSource,Database,CustomerDatabase,Database,ETL,CustomerData,Transform,2024-01-10T02:00:00Z,Daily,1000 GB,Customer Management,2024-01-15T17:00:00Z,DataLineageDependencyEngine,session-001";

            File.AppendAllText(Path.Combine(_testDataPath, "DataLineage.csv"), Environment.NewLine + brokenLineageData);

            // Act
            await _logicEngine.LoadAllAsync();
            var riskDashboard = await _logicEngine.GenerateRiskDashboardProjectionAsync();

            // Assert
            var brokenFlows = riskDashboard.LineageRisks.Where(lr => lr.RiskType == "BrokenFlow").ToList();
            Assert.NotEmpty(brokenFlows);
            Assert.Contains(brokenFlows, risk => risk.Description.Contains("NonExistentSource"));
        }

        #endregion

        #region External Identity Module Tests

        [Fact]
        public async Task LoadExternalIdentities_ShouldParseAllFields()
        {
            // Arrange & Act
            await _logicEngine.LoadAllAsync();
            var stats = _logicEngine.GetLoadStatistics();

            // Assert
            Assert.Equal(4, stats.ExternalIdentityCount);
        }

        [Fact]
        public async Task GetExternalIdentitiesForUserAsync_ShouldReturnUserMappings()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var johnExternalIds = await _logicEngine.GetExternalIdentitiesForUserAsync("S-1-5-21-1234567890-1234567890-1234567890-1001");

            // Assert
            Assert.Single(johnExternalIds); // EXT-001 is mapped to John
            
            var partnerIdentity = johnExternalIds.First();
            Assert.Equal("john.doe@partner.com", partnerIdentity.ExternalUPN);
            Assert.Equal("PartnerAD", partnerIdentity.Provider);
            Assert.Equal("Mapped", partnerIdentity.MappingStatus);
            Assert.Equal("High", partnerIdentity.MappingAccuracy);
            Assert.Equal("Trusted", partnerIdentity.TrustLevel);
        }

        [Fact]
        public async Task ExternalIdentityInferenceRules_ShouldIdentifySecurityRisks()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var riskDashboard = await _logicEngine.GenerateRiskDashboardProjectionAsync();

            // Assert
            Assert.NotNull(riskDashboard);
            
            var identityRisks = riskDashboard.IdentityRisks;
            Assert.NotEmpty(identityRisks);
            
            // Should identify blocked identities
            var blockedRisks = identityRisks.Where(ir => ir.RiskType == "BlockedIdentity").ToList();
            Assert.NotEmpty(blockedRisks);
            Assert.Contains(blockedRisks, risk => risk.ExternalId == "EXT-004");
            
            // Should identify unmapped identities
            var unmappedRisks = identityRisks.Where(ir => ir.RiskType == "UnmappedIdentity").ToList();
            Assert.Contains(unmappedRisks, risk => risk.ExternalId == "EXT-003");
            
            // Should identify potential matches needing review
            var reviewRequiredRisks = identityRisks.Where(ir => ir.RiskType == "ReviewRequired").ToList();
            Assert.Contains(reviewRequiredRisks, risk => risk.ExternalId == "EXT-002");
        }

        [Fact]
        public async Task ExternalIdentity_ShouldDetectPrivilegedAccountRisks()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var riskDashboard = await _logicEngine.GenerateRiskDashboardProjectionAsync();

            // Assert
            var privilegedRisks = riskDashboard.IdentityRisks.Where(ir => ir.RiskType == "PrivilegedExternal").ToList();
            
            // EXT-004 has SystemAdmin role, should be flagged as privileged
            Assert.Contains(privilegedRisks, risk => risk.ExternalId == "EXT-004" && risk.Severity == "Critical");
        }

        #endregion

        #region Integrated Risk Dashboard Tests

        [Fact]
        public async Task GenerateRiskDashboardProjectionAsync_ShouldIntegrateAllModules()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var riskDashboard = await _logicEngine.GenerateRiskDashboardProjectionAsync();

            // Assert
            Assert.NotNull(riskDashboard);
            
            // Should have data from all expanded modules
            Assert.NotEmpty(riskDashboard.ThreatRisks);
            Assert.NotEmpty(riskDashboard.GovernanceRisks);
            Assert.NotEmpty(riskDashboard.LineageDependencies);
            Assert.NotEmpty(riskDashboard.IdentityRisks);
            
            // Should have overall risk scores
            Assert.True(riskDashboard.OverallRiskScore > 0);
            Assert.NotEmpty(riskDashboard.TopRiskAssets);
            
            // Should prioritize risks by severity
            var criticalRisks = riskDashboard.TopRiskAssets.Where(tra => tra.RiskLevel == "Critical").ToList();
            var highRisks = riskDashboard.TopRiskAssets.Where(tra => tra.RiskLevel == "High").ToList();
            
            Assert.NotEmpty(criticalRisks.Concat(highRisks));
        }

        [Fact]
        public async Task RiskDashboard_ShouldProvideActionableRecommendations()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var riskDashboard = await _logicEngine.GenerateRiskDashboardProjectionAsync();

            // Assert
            Assert.NotEmpty(riskDashboard.Recommendations);
            
            // Should have specific recommendations for each risk type
            var threatRecommendations = riskDashboard.Recommendations.Where(r => r.Category == "Threat").ToList();
            var governanceRecommendations = riskDashboard.Recommendations.Where(r => r.Category == "Governance").ToList();
            var lineageRecommendations = riskDashboard.Recommendations.Where(r => r.Category == "Lineage").ToList();
            var identityRecommendations = riskDashboard.Recommendations.Where(r => r.Category == "Identity").ToList();
            
            Assert.NotEmpty(threatRecommendations);
            Assert.NotEmpty(governanceRecommendations);
            Assert.NotEmpty(identityRecommendations);
            
            // Recommendations should have priority levels
            Assert.All(riskDashboard.Recommendations, rec => 
                Assert.Contains(rec.Priority, new[] { "Critical", "High", "Medium", "Low" }));
        }

        #endregion

        #region Cross-Module Correlation Tests

        [Fact]
        public async Task CrossModuleInference_ShouldCorrelateThreatsWithGovernance()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var riskDashboard = await _logicEngine.GenerateRiskDashboardProjectionAsync();

            // Assert
            // Assets with high-value data (Confidential classification) and threats should have elevated risk
            var correlatedRisks = riskDashboard.CorrelatedRisks.Where(cr => 
                cr.RiskTypes.Contains("Threat") && cr.RiskTypes.Contains("Governance")).ToList();
            
            Assert.NotEmpty(correlatedRisks);
            
            // DB001 has confidential data and a data breach threat - should be correlated
            Assert.Contains(correlatedRisks, risk => 
                risk.AssetId == "DB001" && risk.OverallSeverity == "Critical");
        }

        [Fact]
        public async Task CrossModuleInference_ShouldIdentifyLineageImpactOnThreats()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var riskDashboard = await _logicEngine.GenerateRiskDashboardProjectionAsync();

            // Assert
            // Assets in critical data flows with threats should have amplified impact scores
            var lineageImpactRisks = riskDashboard.CorrelatedRisks.Where(cr => 
                cr.RiskTypes.Contains("Threat") && cr.RiskTypes.Contains("LineageImpact")).ToList();
            
            Assert.NotEmpty(lineageImpactRisks);
            
            // CustomerDatabase has both threats and critical lineage position
            var customerDbRisk = lineageImpactRisks.FirstOrDefault(risk => risk.AssetId == "CustomerDatabase");
            if (customerDbRisk != null)
            {
                Assert.True(customerDbRisk.ImpactScore > 5, "Asset with threats in critical data flow should have high impact score");
            }
        }

        [Fact]
        public async Task CrossModuleInference_ShouldIdentifyExternalIdentityDataAccess()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();

            // Act
            var riskDashboard = await _logicEngine.GenerateRiskDashboardProjectionAsync();

            // Assert
            // External identities with access to sensitive data should be flagged
            var externalDataAccessRisks = riskDashboard.IdentityRisks.Where(ir => 
                ir.RiskType == "ExternalDataAccess").ToList();
            
            // John Doe (mapped external identity) with access to confidential database should be flagged
            Assert.Contains(externalDataAccessRisks, risk => 
                risk.InternalUserSid == "S-1-5-21-1234567890-1234567890-1234567890-1001" &&
                risk.Severity == "High");
        }

        #endregion

        #region Performance Tests for Expanded Modules

        [Fact]
        public async Task ExpandedModules_ShouldLoadWithinPerformanceTargets()
        {
            // Arrange
            var startTime = DateTime.UtcNow;

            // Act
            await _logicEngine.LoadAllAsync();
            var endTime = DateTime.UtcNow;

            // Assert
            var duration = endTime - startTime;
            Assert.True(duration.TotalSeconds < 15, $"Expanded modules load took {duration.TotalSeconds} seconds, should be less than 15");
            
            var stats = _logicEngine.GetLoadStatistics();
            Assert.True(stats.InferenceRulesApplied > 0, "Should have applied inference rules for expanded modules");
        }

        [Fact]
        public async Task RiskDashboardGeneration_ShouldCompleteWithinReasonableTime()
        {
            // Arrange
            await _logicEngine.LoadAllAsync();
            var startTime = DateTime.UtcNow;

            // Act
            var riskDashboard = await _logicEngine.GenerateRiskDashboardProjectionAsync();
            var endTime = DateTime.UtcNow;

            // Assert
            var duration = endTime - startTime;
            Assert.True(duration.TotalSeconds < 5, $"Risk dashboard generation took {duration.TotalSeconds} seconds, should be less than 5");
            Assert.NotNull(riskDashboard);
        }

        #endregion
    }
}