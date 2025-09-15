using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Implementation of Risk Analysis service
    /// </summary>
    public class RiskAnalysisService : IRiskAnalysisService
    {
        private readonly Dictionary<string, RiskAssessment> _risks;
        private readonly Dictionary<string, RiskMitigationAction> _actions;
        private readonly Dictionary<string, RiskIndicator> _indicators;
        private readonly string _dataPath;
        private readonly object _lockObject = new object();

        // Events
        public event EventHandler<RiskEventArgs> RiskCreated;
        public event EventHandler<RiskEventArgs> RiskUpdated;
        public event EventHandler<RiskEventArgs> RiskDeleted;
        public event EventHandler<RiskEventArgs> RiskLevelChanged;

        public RiskAnalysisService()
        {
            _risks = new Dictionary<string, RiskAssessment>();
            _actions = new Dictionary<string, RiskMitigationAction>();
            _indicators = new Dictionary<string, RiskIndicator>();

            var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            _dataPath = Path.Combine(appData, "MandADiscoverySuite", "RiskAnalysis");
            Directory.CreateDirectory(_dataPath);

            _ = LoadDataAsync();
        }

        #region Risk Assessment Management

        public async Task<RiskAssessment> CreateRiskAssessmentAsync(string title, string description, RiskCategory category)
        {
            try
            {
                var risk = new RiskAssessment
                {
                    Title = title,
                    Description = description,
                    Category = category
                };

                lock (_lockObject)
                {
                    _risks[risk.Id] = risk;
                }

                await SaveRisksAsync();
                
                RiskCreated?.Invoke(this, new RiskEventArgs { Risk = risk });

                return risk;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to create risk assessment: {ex.Message}", ex);
            }
        }

        public async Task<RiskAssessment> GetRiskAssessmentAsync(string riskId)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _risks.TryGetValue(riskId, out var risk) ? risk : null;
            }
        }

        public async Task<List<RiskAssessment>> GetAllRiskAssessmentsAsync()
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _risks.Values.OrderByDescending(r => r.RiskScore).ToList();
            }
        }

        public async Task<List<RiskAssessment>> GetRiskAssessmentsByCategoryAsync(RiskCategory category)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _risks.Values
                    .Where(r => r.Category == category)
                    .OrderByDescending(r => r.RiskScore)
                    .ToList();
            }
        }

        public async Task<List<RiskAssessment>> GetRiskAssessmentsByLevelAsync(RiskLevel level)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _risks.Values
                    .Where(r => r.CurrentLevel == level)
                    .OrderByDescending(r => r.RiskScore)
                    .ToList();
            }
        }

        public async Task<List<RiskAssessment>> GetRiskAssessmentsByStatusAsync(RiskStatus status)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _risks.Values
                    .Where(r => r.Status == status)
                    .OrderByDescending(r => r.RiskScore)
                    .ToList();
            }
        }

        public async Task<bool> UpdateRiskAssessmentAsync(RiskAssessment risk)
        {
            try
            {
                if (risk == null) return false;

                RiskLevel oldLevel = RiskLevel.Low;
                lock (_lockObject)
                {
                    if (_risks.TryGetValue(risk.Id, out var existingRisk))
                    {
                        oldLevel = existingRisk.CurrentLevel;
                    }
                    _risks[risk.Id] = risk;
                }

                await SaveRisksAsync();
                
                RiskUpdated?.Invoke(this, new RiskEventArgs { Risk = risk });
                
                if (oldLevel != risk.CurrentLevel)
                {
                    RiskLevelChanged?.Invoke(this, new RiskEventArgs 
                    { 
                        Risk = risk, 
                        OldLevel = oldLevel, 
                        NewLevel = risk.CurrentLevel 
                    });
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteRiskAssessmentAsync(string riskId)
        {
            try
            {
                RiskAssessment risk = null;
                lock (_lockObject)
                {
                    if (_risks.TryGetValue(riskId, out risk))
                    {
                        _risks.Remove(riskId);
                        
                        // Remove associated actions and indicators
                        var actionsToRemove = _actions.Values.Where(a => a.RiskId == riskId).Select(a => a.Id).ToList();
                        var indicatorsToRemove = _indicators.Values.Where(i => i.RiskId == riskId).Select(i => i.Id).ToList();
                        
                        foreach (var actionId in actionsToRemove)
                            _actions.Remove(actionId);
                        foreach (var indicatorId in indicatorsToRemove)
                            _indicators.Remove(indicatorId);
                    }
                }

                if (risk != null)
                {
                    await SaveRisksAsync();
                    await SaveActionsAsync();
                    await SaveIndicatorsAsync();
                    
                    RiskDeleted?.Invoke(this, new RiskEventArgs { Risk = risk });
                }

                return risk != null;
            }
            catch
            {
                return false;
            }
        }

        #endregion

        #region Mitigation Actions

        public async Task<RiskMitigationAction> CreateMitigationActionAsync(string riskId, string action, string description, MitigationType type)
        {
            try
            {
                var mitigationAction = new RiskMitigationAction
                {
                    RiskId = riskId,
                    Action = action,
                    Description = description,
                    Type = type
                };

                lock (_lockObject)
                {
                    _actions[mitigationAction.Id] = mitigationAction;
                }

                await SaveActionsAsync();
                
                return mitigationAction;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to create mitigation action: {ex.Message}", ex);
            }
        }

        public async Task<List<RiskMitigationAction>> GetMitigationActionsForRiskAsync(string riskId)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _actions.Values
                    .Where(a => a.RiskId == riskId)
                    .OrderBy(a => a.DueDate ?? DateTime.MaxValue)
                    .ToList();
            }
        }

        public async Task<List<RiskMitigationAction>> GetAllMitigationActionsAsync()
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _actions.Values
                    .OrderBy(a => a.DueDate ?? DateTime.MaxValue)
                    .ToList();
            }
        }

        public async Task<bool> UpdateMitigationActionAsync(RiskMitigationAction action)
        {
            try
            {
                if (action == null) return false;

                lock (_lockObject)
                {
                    _actions[action.Id] = action;
                }

                await SaveActionsAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteMitigationActionAsync(string actionId)
        {
            try
            {
                bool removed;
                lock (_lockObject)
                {
                    removed = _actions.Remove(actionId);
                }

                if (removed)
                {
                    await SaveActionsAsync();
                }

                return removed;
            }
            catch
            {
                return false;
            }
        }

        #endregion

        #region Risk Indicators

        public async Task<RiskIndicator> CreateIndicatorAsync(string riskId, string name, double threshold)
        {
            try
            {
                var indicator = new RiskIndicator
                {
                    RiskId = riskId,
                    Name = name,
                    Threshold = threshold
                };

                lock (_lockObject)
                {
                    _indicators[indicator.Id] = indicator;
                }

                await SaveIndicatorsAsync();
                
                return indicator;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to create indicator: {ex.Message}", ex);
            }
        }

        public async Task<List<RiskIndicator>> GetIndicatorsForRiskAsync(string riskId)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _indicators.Values
                    .Where(i => i.RiskId == riskId)
                    .OrderBy(i => i.Name)
                    .ToList();
            }
        }

        public async Task<List<RiskIndicator>> GetAllIndicatorsAsync()
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _indicators.Values.OrderBy(i => i.Name).ToList();
            }
        }

        public async Task<bool> UpdateIndicatorAsync(RiskIndicator indicator)
        {
            try
            {
                if (indicator == null) return false;

                lock (_lockObject)
                {
                    _indicators[indicator.Id] = indicator;
                }

                await SaveIndicatorsAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateIndicatorValueAsync(string indicatorId, double value, string note = null)
        {
            try
            {
                lock (_lockObject)
                {
                    if (_indicators.TryGetValue(indicatorId, out var indicator))
                    {
                        indicator.CurrentValue = value;
                        indicator.History.Add(new IndicatorDataPoint { Value = value, Note = note });
                        
                        // Update status based on threshold
                        if (value >= indicator.Threshold)
                            indicator.Status = IndicatorStatus.Critical;
                        else if (value >= indicator.Threshold * 0.8)
                            indicator.Status = IndicatorStatus.Warning;
                        else
                            indicator.Status = IndicatorStatus.Normal;
                    }
                }

                await SaveIndicatorsAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteIndicatorAsync(string indicatorId)
        {
            try
            {
                bool removed;
                lock (_lockObject)
                {
                    removed = _indicators.Remove(indicatorId);
                }

                if (removed)
                {
                    await SaveIndicatorsAsync();
                }

                return removed;
            }
            catch
            {
                return false;
            }
        }

        #endregion

        #region Risk Analysis & Reporting

        public async Task<RiskStatistics> GetRiskStatisticsAsync()
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                var stats = new RiskStatistics
                {
                    TotalRisks = _risks.Count
                };

                // Risk by level
                foreach (RiskLevel level in Enum.GetValues<RiskLevel>())
                {
                    stats.RisksByLevel[level] = _risks.Values.Count(r => r.CurrentLevel == level);
                }

                // Risk by category
                foreach (RiskCategory category in Enum.GetValues<RiskCategory>())
                {
                    stats.RisksByCategory[category] = _risks.Values.Count(r => r.Category == category);
                }

                // Risk by status
                foreach (RiskStatus status in Enum.GetValues<RiskStatus>())
                {
                    stats.RisksByStatus[status] = _risks.Values.Count(r => r.Status == status);
                }

                // Average risk score
                stats.AverageRiskScore = _risks.Values.Any() ? _risks.Values.Average(r => r.RiskScore) : 0;

                // Top risks
                stats.TopRisks = _risks.Values
                    .OrderByDescending(r => r.RiskScore)
                    .Take(10)
                    .ToList();

                return stats;
            }
        }

        public async Task<List<RiskHeatmapCell>> GenerateRiskHeatmapAsync()
        {
            await Task.CompletedTask;
            
            var heatmapCells = new List<RiskHeatmapCell>();
            
            // Create 5x5 heatmap grid
            for (int i = 1; i <= 5; i++)
            {
                for (int j = 1; j <= 5; j++)
                {
                    var cell = new RiskHeatmapCell
                    {
                        Probability = i / 5.0,
                        Impact = j / 5.0
                    };

                    lock (_lockObject)
                    {
                        // Find risks that fall into this cell
                        cell.Risks = _risks.Values
                            .Where(r => Math.Abs(r.Probability - cell.Probability) < 0.1 && 
                                       Math.Abs(r.Impact - cell.Impact) < 0.1)
                            .ToList();
                        
                        cell.RiskCount = cell.Risks.Count;
                        
                        // Determine risk level for cell
                        var score = cell.Probability * cell.Impact;
                        cell.Level = score switch
                        {
                            >= 0.8 => RiskLevel.Critical,
                            >= 0.6 => RiskLevel.High,
                            >= 0.4 => RiskLevel.Medium,
                            >= 0.2 => RiskLevel.Low,
                            _ => RiskLevel.Low
                        };
                    }

                    heatmapCells.Add(cell);
                }
            }

            return heatmapCells;
        }

        public async Task<List<RiskAssessment>> GetTopRisksAsync(int count = 10)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _risks.Values
                    .OrderByDescending(r => r.RiskScore)
                    .Take(count)
                    .ToList();
            }
        }

        public async Task<List<RiskTrendData>> GetRiskTrendsAsync(DateTime fromDate, DateTime toDate)
        {
            await Task.CompletedTask;
            
            var trends = new List<RiskTrendData>();
            
            lock (_lockObject)
            {
                // Group risks by month for trend analysis
                var risksByMonth = _risks.Values
                    .Where(r => r.CreatedDate >= fromDate && r.CreatedDate <= toDate)
                    .GroupBy(r => new { r.CreatedDate.Year, r.CreatedDate.Month })
                    .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month);

                foreach (var group in risksByMonth)
                {
                    var period = new DateTime(group.Key.Year, group.Key.Month, 1);
                    var risksInPeriod = group.ToList();
                    
                    trends.Add(new RiskTrendData
                    {
                        Period = period,
                        NewRisks = risksInPeriod.Count,
                        AverageScore = risksInPeriod.Average(r => r.RiskScore),
                        HighRisks = risksInPeriod.Count(r => r.CurrentLevel == RiskLevel.High),
                        CriticalRisks = risksInPeriod.Count(r => r.CurrentLevel == RiskLevel.Critical),
                        ClosedRisks = risksInPeriod.Count(r => r.Status == RiskStatus.Closed)
                    });
                }
            }

            return trends;
        }

        public async Task<double> CalculateOrganizationalRiskScoreAsync()
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                if (!_risks.Any())
                    return 0;

                // Weighted average considering risk levels
                var weightedSum = _risks.Values.Sum(r => r.RiskScore * GetRiskWeight(r.CurrentLevel));
                var totalWeight = _risks.Values.Sum(r => GetRiskWeight(r.CurrentLevel));
                
                return totalWeight > 0 ? weightedSum / totalWeight : 0;
            }
        }

        private double GetRiskWeight(RiskLevel level)
        {
            return level switch
            {
                RiskLevel.Critical => 5.0,
                RiskLevel.High => 4.0,
                RiskLevel.Medium => 3.0,
                RiskLevel.Low => 2.0,
                _ => 1.0
            };
        }

        #endregion

        #region Risk Assessment Automation

        public async Task<List<RiskAssessment>> PerformAutomatedRiskAssessmentAsync()
        {
            await Task.CompletedTask;
            
            var automatedRisks = new List<RiskAssessment>();
            
            // Automated risk identification based on indicators
            lock (_lockObject)
            {
                var criticalIndicators = _indicators.Values
                    .Where(i => i.Status == IndicatorStatus.Critical)
                    .ToList();

                foreach (var indicator in criticalIndicators)
                {
                    if (!_risks.Values.Any(r => r.AffectedSystems.Contains(indicator.Name)))
                    {
                        var automatedRisk = new RiskAssessment
                        {
                            Title = $"Automated Risk: {indicator.Name} Threshold Exceeded",
                            Description = $"Risk automatically identified based on {indicator.Name} exceeding threshold of {indicator.Threshold}",
                            Category = RiskCategory.Technical,
                            Probability = 0.8, // High probability for automated detection
                            Impact = Math.Min(indicator.CurrentValue / indicator.Threshold, 1.0),
                            CurrentLevel = indicator.CurrentValue >= indicator.Threshold * 1.5 ? RiskLevel.Critical : RiskLevel.High
                        };

                        _risks[automatedRisk.Id] = automatedRisk;
                        automatedRisks.Add(automatedRisk);
                    }
                }
            }

            if (automatedRisks.Any())
            {
                await SaveRisksAsync();
            }

            return automatedRisks;
        }

        public async Task<bool> UpdateRiskLevelsBasedOnIndicatorsAsync()
        {
            try
            {
                var updatedRisks = new List<RiskAssessment>();
                
                lock (_lockObject)
                {
                    foreach (var risk in _risks.Values)
                    {
                        var riskIndicators = _indicators.Values.Where(i => i.RiskId == risk.Id).ToList();
                        
                        if (riskIndicators.Any())
                        {
                            // Recalculate risk level based on indicators
                            var criticalCount = riskIndicators.Count(i => i.Status == IndicatorStatus.Critical);
                            var warningCount = riskIndicators.Count(i => i.Status == IndicatorStatus.Warning);
                            
                            var oldLevel = risk.CurrentLevel;
                            
                            if (criticalCount > 0)
                                risk.CurrentLevel = RiskLevel.Critical;
                            else if (warningCount > 0)
                                risk.CurrentLevel = RiskLevel.High;
                            else
                                risk.CurrentLevel = RiskLevel.Medium;
                            
                            if (oldLevel != risk.CurrentLevel)
                            {
                                updatedRisks.Add(risk);
                            }
                        }
                    }
                }

                if (updatedRisks.Any())
                {
                    await SaveRisksAsync();
                    
                    foreach (var risk in updatedRisks)
                    {
                        RiskLevelChanged?.Invoke(this, new RiskEventArgs { Risk = risk });
                    }
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<List<RiskAssessment>> IdentifyEmergingRisksAsync()
        {
            await Task.CompletedTask;
            
            var emergingRisks = new List<RiskAssessment>();
            
            lock (_lockObject)
            {
                // Identify risks with deteriorating trends
                foreach (var indicator in _indicators.Values)
                {
                    if (indicator.History.Count >= 3)
                    {
                        var recentValues = indicator.History.TakeLast(3).Select(h => h.Value).ToList();
                        
                        // Check for consistent increase (deteriorating trend)
                        if (recentValues[0] < recentValues[1] && recentValues[1] < recentValues[2])
                        {
                            var existingRisk = _risks.Values.FirstOrDefault(r => r.Indicators.Any(i => i.Id == indicator.Id));
                            
                            if (existingRisk == null)
                            {
                                var emergingRisk = new RiskAssessment
                                {
                                    Title = $"Emerging Risk: {indicator.Name} Trend Deteriorating",
                                    Description = $"Risk identified based on deteriorating trend in {indicator.Name}",
                                    Category = RiskCategory.Operational,
                                    Probability = 0.6,
                                    Impact = Math.Min(recentValues[2] / indicator.Threshold, 1.0),
                                    CurrentLevel = RiskLevel.Medium
                                };

                                emergingRisks.Add(emergingRisk);
                            }
                        }
                    }
                }
            }

            return emergingRisks;
        }

        #endregion

        #region Compliance & Frameworks

        public async Task<Dictionary<string, double>> GetComplianceScoresAsync()
        {
            await Task.CompletedTask;
            
            var complianceScores = new Dictionary<string, double>();
            
            // Sample compliance frameworks
            var frameworks = new[] { "ISO 27001", "SOX", "GDPR", "HIPAA", "PCI DSS" };
            
            lock (_lockObject)
            {
                foreach (var framework in frameworks)
                {
                    var frameworkRisks = _risks.Values
                        .Where(r => r.CustomFields.ContainsKey(framework))
                        .ToList();
                    
                    if (frameworkRisks.Any())
                    {
                        var averageRiskScore = frameworkRisks.Average(r => r.RiskScore);
                        complianceScores[framework] = Math.Max(0, 1.0 - averageRiskScore); // Higher risk = lower compliance
                    }
                    else
                    {
                        complianceScores[framework] = 0.5; // Default score when no risks identified
                    }
                }
            }

            return complianceScores;
        }

        public async Task<List<RiskAssessment>> GetComplianceRisksAsync(string framework)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _risks.Values
                    .Where(r => r.CustomFields.ContainsKey(framework))
                    .OrderByDescending(r => r.RiskScore)
                    .ToList();
            }
        }

        public async Task<bool> MapRiskToComplianceFrameworkAsync(string riskId, string framework, string controlId)
        {
            try
            {
                lock (_lockObject)
                {
                    if (_risks.TryGetValue(riskId, out var risk))
                    {
                        risk.CustomFields[framework] = controlId;
                    }
                }

                await SaveRisksAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        #endregion

        #region Search & Filtering

        public async Task<List<RiskAssessment>> SearchRisksAsync(string searchTerm)
        {
            await Task.CompletedTask;
            
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllRiskAssessmentsAsync();

            lock (_lockObject)
            {
                return _risks.Values
                    .Where(r => r.Title?.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) == true ||
                               r.Description?.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) == true ||
                               r.Owner?.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) == true)
                    .OrderByDescending(r => r.RiskScore)
                    .ToList();
            }
        }

        public async Task<List<RiskAssessment>> FilterRisksAsync(RiskCategory? category, RiskLevel? level, RiskStatus? status, string owner = null)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                var query = _risks.Values.AsEnumerable();

                if (category.HasValue)
                    query = query.Where(r => r.Category == category.Value);

                if (level.HasValue)
                    query = query.Where(r => r.CurrentLevel == level.Value);

                if (status.HasValue)
                    query = query.Where(r => r.Status == status.Value);

                if (!string.IsNullOrWhiteSpace(owner))
                    query = query.Where(r => r.Owner?.Contains(owner, StringComparison.OrdinalIgnoreCase) == true);

                return query.OrderByDescending(r => r.RiskScore).ToList();
            }
        }

        #endregion

        #region Import/Export

        public async Task<bool> ExportRiskAssessmentsAsync(string filePath, List<string> riskIds = null)
        {
            try
            {
                List<RiskAssessment> risksToExport;
                
                lock (_lockObject)
                {
                    if (riskIds != null)
                    {
                        risksToExport = _risks.Values.Where(r => riskIds.Contains(r.Id)).ToList();
                    }
                    else
                    {
                        risksToExport = _risks.Values.ToList();
                    }
                }

                var exportData = new
                {
                    Risks = risksToExport,
                    Actions = _actions.Values.Where(a => risksToExport.Any(r => r.Id == a.RiskId)).ToList(),
                    Indicators = _indicators.Values.Where(i => risksToExport.Any(r => r.Id == i.RiskId)).ToList()
                };

                var json = JsonConvert.SerializeObject(exportData, Formatting.Indented);
                await File.WriteAllTextAsync(filePath, json);
                
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ImportRiskAssessmentsAsync(string filePath)
        {
            try
            {
                if (!File.Exists(filePath)) return false;

                var json = await File.ReadAllTextAsync(filePath);
                var importData = JsonConvert.DeserializeAnonymousType(json, new
                {
                    Risks = new List<RiskAssessment>(),
                    Actions = new List<RiskMitigationAction>(),
                    Indicators = new List<RiskIndicator>()
                });

                if (importData != null)
                {
                    lock (_lockObject)
                    {
                        foreach (var risk in importData.Risks ?? new List<RiskAssessment>())
                        {
                            _risks[risk.Id] = risk;
                        }
                        
                        foreach (var action in importData.Actions ?? new List<RiskMitigationAction>())
                        {
                            _actions[action.Id] = action;
                        }
                        
                        foreach (var indicator in importData.Indicators ?? new List<RiskIndicator>())
                        {
                            _indicators[indicator.Id] = indicator;
                        }
                    }

                    await SaveRisksAsync();
                    await SaveActionsAsync();
                    await SaveIndicatorsAsync();
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<string> GenerateRiskReportAsync(string templatePath = null)
        {
            try
            {
                var statistics = await GetRiskStatisticsAsync();
                var topRisks = await GetTopRisksAsync();
                
                var report = $@"
# Risk Analysis Report
Generated: {DateTime.Now:yyyy-MM-dd HH:mm:ss}

## Executive Summary
- Total Risks: {statistics.TotalRisks}
- Average Risk Score: {statistics.AverageRiskScore:F2}
- Critical Risks: {statistics.RisksByLevel.GetValueOrDefault(RiskLevel.Critical, 0)}
- High Risks: {statistics.RisksByLevel.GetValueOrDefault(RiskLevel.High, 0)}

## Top 10 Risks
{string.Join("\n", topRisks.Take(10).Select((r, i) => $"{i + 1}. {r.Title} (Score: {r.RiskScore:F2})"))}

## Risk Distribution by Category
{string.Join("\n", statistics.RisksByCategory.Select(kvp => $"- {kvp.Key}: {kvp.Value}"))}

## Risk Distribution by Status
{string.Join("\n", statistics.RisksByStatus.Select(kvp => $"- {kvp.Key}: {kvp.Value}"))}
";

                return report;
            }
            catch (Exception ex)
            {
                return $"Error generating report: {ex.Message}";
            }
        }

        #endregion

        #region Private Methods

        private async Task LoadDataAsync()
        {
            try
            {
                await LoadRisksAsync();
                await LoadActionsAsync();
                await LoadIndicatorsAsync();
            }
            catch
            {
                // Handle loading errors gracefully
            }
        }

        private async Task LoadRisksAsync()
        {
            try
            {
                var filePath = Path.Combine(_dataPath, "risks.json");
                if (File.Exists(filePath))
                {
                    var json = await File.ReadAllTextAsync(filePath);
                    var risks = JsonConvert.DeserializeObject<List<RiskAssessment>>(json);
                    
                    if (risks != null)
                    {
                        lock (_lockObject)
                        {
                            _risks.Clear();
                            foreach (var risk in risks)
                            {
                                _risks[risk.Id] = risk;
                            }
                        }
                    }
                }
            }
            catch
            {
                // Handle file corruption gracefully
            }
        }

        private async Task SaveRisksAsync()
        {
            try
            {
                List<RiskAssessment> risks;
                lock (_lockObject)
                {
                    risks = _risks.Values.ToList();
                }

                var filePath = Path.Combine(_dataPath, "risks.json");
                var json = JsonConvert.SerializeObject(risks, Formatting.Indented);
                await File.WriteAllTextAsync(filePath, json);
            }
            catch
            {
                // Handle save errors gracefully
            }
        }

        private async Task LoadActionsAsync()
        {
            try
            {
                var filePath = Path.Combine(_dataPath, "actions.json");
                if (File.Exists(filePath))
                {
                    var json = await File.ReadAllTextAsync(filePath);
                    var actions = JsonConvert.DeserializeObject<List<RiskMitigationAction>>(json);
                    
                    if (actions != null)
                    {
                        lock (_lockObject)
                        {
                            _actions.Clear();
                            foreach (var action in actions)
                            {
                                _actions[action.Id] = action;
                            }
                        }
                    }
                }
            }
            catch
            {
                // Handle file corruption gracefully
            }
        }

        private async Task SaveActionsAsync()
        {
            try
            {
                List<RiskMitigationAction> actions;
                lock (_lockObject)
                {
                    actions = _actions.Values.ToList();
                }

                var filePath = Path.Combine(_dataPath, "actions.json");
                var json = JsonConvert.SerializeObject(actions, Formatting.Indented);
                await File.WriteAllTextAsync(filePath, json);
            }
            catch
            {
                // Handle save errors gracefully
            }
        }

        private async Task LoadIndicatorsAsync()
        {
            try
            {
                var filePath = Path.Combine(_dataPath, "indicators.json");
                if (File.Exists(filePath))
                {
                    var json = await File.ReadAllTextAsync(filePath);
                    var indicators = JsonConvert.DeserializeObject<List<RiskIndicator>>(json);
                    
                    if (indicators != null)
                    {
                        lock (_lockObject)
                        {
                            _indicators.Clear();
                            foreach (var indicator in indicators)
                            {
                                _indicators[indicator.Id] = indicator;
                            }
                        }
                    }
                }
            }
            catch
            {
                // Handle file corruption gracefully
            }
        }

        private async Task SaveIndicatorsAsync()
        {
            try
            {
                List<RiskIndicator> indicators;
                lock (_lockObject)
                {
                    indicators = _indicators.Values.ToList();
                }

                var filePath = Path.Combine(_dataPath, "indicators.json");
                var json = JsonConvert.SerializeObject(indicators, Formatting.Indented);
                await File.WriteAllTextAsync(filePath, json);
            }
            catch
            {
                // Handle save errors gracefully
            }
        }

        #endregion
    }
}