using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Interface for Risk Analysis service
    /// </summary>
    public interface IRiskAnalysisService
    {
        // Risk Assessment Management
        Task<RiskAssessment> CreateRiskAssessmentAsync(string title, string description, RiskCategory category);
        Task<RiskAssessment> GetRiskAssessmentAsync(string riskId);
        Task<List<RiskAssessment>> GetAllRiskAssessmentsAsync();
        Task<List<RiskAssessment>> GetRiskAssessmentsByCategoryAsync(RiskCategory category);
        Task<List<RiskAssessment>> GetRiskAssessmentsByLevelAsync(RiskLevel level);
        Task<List<RiskAssessment>> GetRiskAssessmentsByStatusAsync(RiskStatus status);
        Task<bool> UpdateRiskAssessmentAsync(RiskAssessment risk);
        Task<bool> DeleteRiskAssessmentAsync(string riskId);

        // Mitigation Actions
        Task<RiskMitigationAction> CreateMitigationActionAsync(string riskId, string action, string description, MitigationType type);
        Task<List<RiskMitigationAction>> GetMitigationActionsForRiskAsync(string riskId);
        Task<List<RiskMitigationAction>> GetAllMitigationActionsAsync();
        Task<bool> UpdateMitigationActionAsync(RiskMitigationAction action);
        Task<bool> DeleteMitigationActionAsync(string actionId);

        // Risk Indicators
        Task<RiskIndicator> CreateIndicatorAsync(string riskId, string name, double threshold);
        Task<List<RiskIndicator>> GetIndicatorsForRiskAsync(string riskId);
        Task<List<RiskIndicator>> GetAllIndicatorsAsync();
        Task<bool> UpdateIndicatorAsync(RiskIndicator indicator);
        Task<bool> UpdateIndicatorValueAsync(string indicatorId, double value, string note = null);
        Task<bool> DeleteIndicatorAsync(string indicatorId);

        // Risk Analysis & Reporting
        Task<RiskStatistics> GetRiskStatisticsAsync();
        Task<List<RiskHeatmapCell>> GenerateRiskHeatmapAsync();
        Task<List<RiskAssessment>> GetTopRisksAsync(int count = 10);
        Task<List<RiskTrendData>> GetRiskTrendsAsync(DateTime fromDate, DateTime toDate);
        Task<double> CalculateOrganizationalRiskScoreAsync();

        // Risk Assessment Automation
        Task<List<RiskAssessment>> PerformAutomatedRiskAssessmentAsync();
        Task<bool> UpdateRiskLevelsBasedOnIndicatorsAsync();
        Task<List<RiskAssessment>> IdentifyEmergingRisksAsync();

        // Compliance & Frameworks
        Task<Dictionary<string, double>> GetComplianceScoresAsync();
        Task<List<RiskAssessment>> GetComplianceRisksAsync(string framework);
        Task<bool> MapRiskToComplianceFrameworkAsync(string riskId, string framework, string controlId);

        // Search & Filtering
        Task<List<RiskAssessment>> SearchRisksAsync(string searchTerm);
        Task<List<RiskAssessment>> FilterRisksAsync(RiskCategory? category, RiskLevel? level, RiskStatus? status, string owner = null);

        // Import/Export
        Task<bool> ExportRiskAssessmentsAsync(string filePath, List<string> riskIds = null);
        Task<bool> ImportRiskAssessmentsAsync(string filePath);
        Task<string> GenerateRiskReportAsync(string templatePath = null);

        // Events
        event EventHandler<RiskEventArgs> RiskCreated;
        event EventHandler<RiskEventArgs> RiskUpdated;
        event EventHandler<RiskEventArgs> RiskDeleted;
        event EventHandler<RiskEventArgs> RiskLevelChanged;
    }

    /// <summary>
    /// Event arguments for risk events
    /// </summary>
    public class RiskEventArgs : EventArgs
    {
        public RiskAssessment Risk { get; set; }
        public RiskLevel? OldLevel { get; set; }
        public RiskLevel? NewLevel { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }

        public RiskEventArgs()
        {
            Timestamp = DateTime.Now;
        }
    }
}