using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace MandADiscoverySuite.ViewModels.Widgets
{
    public class RiskItem
    {
        public string Category { get; set; }
        public string Level { get; set; }
        public string Icon { get; set; }
        public int Count { get; set; }
        public string Description { get; set; }
    }

    public class RiskAssessmentWidget : WidgetViewModel
    {
        private ObservableCollection<RiskItem> _riskItems;
        private int _criticalRisks;
        private int _highRisks;
        private int _mediumRisks;
        private int _lowRisks;
        private double _overallRiskScore;

        public RiskAssessmentWidget()
        {
            Title = "Risk Assessment";
            Icon = "⚠️";
            RowSpan = 2;
            ColumnSpan = 1;
            RiskItems = new ObservableCollection<RiskItem>();
        }

        public override string WidgetType => "RiskAssessment";

        public ObservableCollection<RiskItem> RiskItems
        {
            get => _riskItems;
            set => SetProperty(ref _riskItems, value);
        }

        public int CriticalRisks
        {
            get => _criticalRisks;
            set => SetProperty(ref _criticalRisks, value);
        }

        public int HighRisks
        {
            get => _highRisks;
            set => SetProperty(ref _highRisks, value);
        }

        public int MediumRisks
        {
            get => _mediumRisks;
            set => SetProperty(ref _mediumRisks, value);
        }

        public int LowRisks
        {
            get => _lowRisks;
            set => SetProperty(ref _lowRisks, value);
        }

        public double OverallRiskScore
        {
            get => _overallRiskScore;
            set => SetProperty(ref _overallRiskScore, value);
        }

        public override async Task RefreshAsync()
        {
            try
            {
                IsLoading = true;

                await Task.Delay(1200);

                var risks = new[]
                {
                    new RiskItem { Category = "Security", Level = "Critical", Icon = "🔒", Count = 3, Description = "Unpatched vulnerabilities detected" },
                    new RiskItem { Category = "Compliance", Level = "High", Icon = "📋", Count = 7, Description = "Policy violations found" },
                    new RiskItem { Category = "Data", Level = "Medium", Icon = "💾", Count = 12, Description = "Sensitive data exposure risks" },
                    new RiskItem { Category = "Infrastructure", Level = "High", Icon = "🖥️", Count = 5, Description = "Legacy system dependencies" },
                    new RiskItem { Category = "Access", Level = "Critical", Icon = "🔑", Count = 2, Description = "Privileged access anomalies" },
                };

                RiskItems.Clear();
                foreach (var risk in risks)
                {
                    RiskItems.Add(risk);
                }

                // Calculate risk counts
                CriticalRisks = 0;
                HighRisks = 0;
                MediumRisks = 0;
                LowRisks = 0;

                foreach (var risk in risks)
                {
                    switch (risk.Level)
                    {
                        case "Critical":
                            CriticalRisks += risk.Count;
                            break;
                        case "High":
                            HighRisks += risk.Count;
                            break;
                        case "Medium":
                            MediumRisks += risk.Count;
                            break;
                        case "Low":
                            LowRisks += risk.Count;
                            break;
                    }
                }

                // Calculate overall risk score (weighted)
                OverallRiskScore = ((CriticalRisks * 10) + (HighRisks * 5) + (MediumRisks * 2) + (LowRisks * 1)) / 10.0;

                OnRefreshCompleted();
            }
            catch (Exception ex)
            {
                OnRefreshError($"Failed to refresh risk assessment: {ex.Message}");
            }
        }
    }
}