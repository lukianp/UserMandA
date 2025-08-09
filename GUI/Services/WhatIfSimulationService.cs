using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Implementation of What-If Simulation service
    /// </summary>
    public class WhatIfSimulationService : IWhatIfSimulationService
    {
        private readonly Dictionary<string, WhatIfSimulation> _simulations;
        private readonly Dictionary<string, CancellationTokenSource> _runningSimulations;
        private readonly string _dataPath;
        private readonly object _lockObject = new object();

        // Events
        public event EventHandler<SimulationEventArgs> SimulationStarted;
        public event EventHandler<SimulationEventArgs> SimulationCompleted;
        public event EventHandler<SimulationEventArgs> SimulationFailed;
        public event EventHandler<SimulationProgressEventArgs> SimulationProgressUpdated;

        public WhatIfSimulationService()
        {
            _simulations = new Dictionary<string, WhatIfSimulation>();
            _runningSimulations = new Dictionary<string, CancellationTokenSource>();
            
            var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            _dataPath = Path.Combine(appData, "MandADiscoverySuite", "WhatIfSimulations");
            Directory.CreateDirectory(_dataPath);
            
            _ = LoadSimulationsAsync();
        }

        #region Simulation Management

        public async Task<WhatIfSimulation> CreateSimulationAsync(string name, string description = null)
        {
            try
            {
                var simulation = new WhatIfSimulation
                {
                    Name = name,
                    Description = description ?? $"What-If simulation created on {DateTime.Now:yyyy-MM-dd HH:mm:ss}",
                    CreatedBy = Environment.UserName,
                    Status = SimulationStatus.Draft
                };

                // Add default parameters
                await AddDefaultParametersAsync(simulation);

                lock (_lockObject)
                {
                    _simulations[simulation.Id] = simulation;
                }

                await SaveSimulationAsync(simulation);
                return simulation;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to create simulation: {ex.Message}", ex);
            }
        }

        public async Task<WhatIfSimulation> LoadSimulationAsync(string simulationId)
        {
            try
            {
                lock (_lockObject)
                {
                    if (_simulations.TryGetValue(simulationId, out var simulation))
                    {
                        return simulation;
                    }
                }

                var filePath = Path.Combine(_dataPath, $"{simulationId}.json");
                if (File.Exists(filePath))
                {
                    var json = await File.ReadAllTextAsync(filePath);
                    var simulation = JsonConvert.DeserializeObject<WhatIfSimulation>(json);
                    
                    lock (_lockObject)
                    {
                        _simulations[simulationId] = simulation;
                    }
                    
                    return simulation;
                }

                return null;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to load simulation: {ex.Message}", ex);
            }
        }

        public async Task<bool> SaveSimulationAsync(WhatIfSimulation simulation)
        {
            try
            {
                simulation.LastModified = DateTime.Now;
                
                lock (_lockObject)
                {
                    _simulations[simulation.Id] = simulation;
                }

                var filePath = Path.Combine(_dataPath, $"{simulation.Id}.json");
                var json = JsonConvert.SerializeObject(simulation, Formatting.Indented);
                await File.WriteAllTextAsync(filePath, json);
                
                return true;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to save simulation: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> DeleteSimulationAsync(string simulationId)
        {
            try
            {
                lock (_lockObject)
                {
                    _simulations.Remove(simulationId);
                }

                var filePath = Path.Combine(_dataPath, $"{simulationId}.json");
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                await Task.CompletedTask;
                return true;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to delete simulation: {ex.Message}");
                return false;
            }
        }

        public async Task<List<WhatIfSimulation>> GetAllSimulationsAsync()
        {
            await LoadSimulationsAsync();
            
            lock (_lockObject)
            {
                return _simulations.Values.OrderByDescending(s => s.LastModified).ToList();
            }
        }

        public async Task<WhatIfSimulation> CloneSimulationAsync(string simulationId, string newName)
        {
            try
            {
                var originalSimulation = await LoadSimulationAsync(simulationId);
                if (originalSimulation == null)
                    return null;

                var clonedSimulation = JsonConvert.DeserializeObject<WhatIfSimulation>(
                    JsonConvert.SerializeObject(originalSimulation));
                
                clonedSimulation.Id = Guid.NewGuid().ToString();
                clonedSimulation.Name = newName;
                clonedSimulation.CreatedDate = DateTime.Now;
                clonedSimulation.LastModified = DateTime.Now;
                clonedSimulation.Status = SimulationStatus.Draft;
                clonedSimulation.Results = null;

                await SaveSimulationAsync(clonedSimulation);
                return clonedSimulation;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to clone simulation: {ex.Message}", ex);
            }
        }

        #endregion

        #region Parameter Management

        public async Task<List<SimulationParameter>> GetAvailableParametersAsync()
        {
            await Task.CompletedTask;
            
            return new List<SimulationParameter>
            {
                new SimulationParameter
                {
                    Key = "migration_timeline",
                    DisplayName = "Migration Timeline",
                    Description = "Total time allocated for migration",
                    Type = ParameterType.TimeSpan,
                    Category = "Timeline",
                    DefaultValue = TimeSpan.FromDays(180),
                    Unit = "days"
                },
                new SimulationParameter
                {
                    Key = "budget_constraint",
                    DisplayName = "Budget Constraint",
                    Description = "Maximum budget available for migration",
                    Type = ParameterType.Currency,
                    Category = "Financial",
                    DefaultValue = 1000000.0,
                    Unit = "USD"
                },
                new SimulationParameter
                {
                    Key = "team_size",
                    DisplayName = "Team Size",
                    Description = "Number of team members available",
                    Type = ParameterType.Integer,
                    Category = "Resources",
                    DefaultValue = 10,
                    MinValue = 1,
                    MaxValue = 100
                },
                new SimulationParameter
                {
                    Key = "risk_tolerance",
                    DisplayName = "Risk Tolerance",
                    Description = "Acceptable risk level for the migration",
                    Type = ParameterType.Percentage,
                    Category = "Risk",
                    DefaultValue = 0.2,
                    MinValue = 0.0,
                    MaxValue = 1.0
                }
            };
        }

        public async Task<bool> AddParameterAsync(string simulationId, SimulationParameter parameter)
        {
            try
            {
                var simulation = await LoadSimulationAsync(simulationId);
                if (simulation == null)
                    return false;

                simulation.Parameters.Add(parameter);
                return await SaveSimulationAsync(simulation);
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateParameterAsync(string simulationId, SimulationParameter parameter)
        {
            try
            {
                var simulation = await LoadSimulationAsync(simulationId);
                if (simulation == null)
                    return false;

                var existingParam = simulation.Parameters.FirstOrDefault(p => p.Id == parameter.Id);
                if (existingParam != null)
                {
                    var index = simulation.Parameters.IndexOf(existingParam);
                    simulation.Parameters[index] = parameter;
                    return await SaveSimulationAsync(simulation);
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> RemoveParameterAsync(string simulationId, string parameterId)
        {
            try
            {
                var simulation = await LoadSimulationAsync(simulationId);
                if (simulation == null)
                    return false;

                var parameter = simulation.Parameters.FirstOrDefault(p => p.Id == parameterId);
                if (parameter != null)
                {
                    simulation.Parameters.Remove(parameter);
                    return await SaveSimulationAsync(simulation);
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        #endregion

        #region Scenario Management

        public async Task<bool> AddScenarioAsync(string simulationId, SimulationScenario scenario)
        {
            try
            {
                var simulation = await LoadSimulationAsync(simulationId);
                if (simulation == null)
                    return false;

                simulation.Scenarios.Add(scenario);
                return await SaveSimulationAsync(simulation);
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateScenarioAsync(string simulationId, SimulationScenario scenario)
        {
            try
            {
                var simulation = await LoadSimulationAsync(simulationId);
                if (simulation == null)
                    return false;

                var existingScenario = simulation.Scenarios.FirstOrDefault(s => s.Id == scenario.Id);
                if (existingScenario != null)
                {
                    var index = simulation.Scenarios.IndexOf(existingScenario);
                    simulation.Scenarios[index] = scenario;
                    return await SaveSimulationAsync(simulation);
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> RemoveScenarioAsync(string simulationId, string scenarioId)
        {
            try
            {
                var simulation = await LoadSimulationAsync(simulationId);
                if (simulation == null)
                    return false;

                var scenario = simulation.Scenarios.FirstOrDefault(s => s.Id == scenarioId);
                if (scenario != null)
                {
                    simulation.Scenarios.Remove(scenario);
                    return await SaveSimulationAsync(simulation);
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        public async Task<SimulationScenario> CreateBaselineScenarioAsync(string simulationId)
        {
            try
            {
                var simulation = await LoadSimulationAsync(simulationId);
                if (simulation == null)
                    return null;

                var baselineScenario = new SimulationScenario
                {
                    Name = "Baseline",
                    Description = "Current state baseline scenario",
                    IsBaseline = true,
                    Type = ScenarioType.Baseline,
                    Probability = 1.0
                };

                simulation.Scenarios.Add(baselineScenario);
                await SaveSimulationAsync(simulation);
                
                return baselineScenario;
            }
            catch
            {
                return null;
            }
        }

        #endregion

        #region Simulation Execution

        public async Task<SimulationResults> RunSimulationAsync(string simulationId)
        {
            try
            {
                var simulation = await LoadSimulationAsync(simulationId);
                if (simulation == null)
                    throw new ArgumentException("Simulation not found");

                simulation.Status = SimulationStatus.Running;
                simulation.ProgressPercentage = 0;
                await SaveSimulationAsync(simulation);

                var cts = new CancellationTokenSource();
                lock (_lockObject)
                {
                    _runningSimulations[simulationId] = cts;
                }

                SimulationStarted?.Invoke(this, new SimulationEventArgs 
                { 
                    SimulationId = simulationId, 
                    Simulation = simulation,
                    Message = "Simulation started"
                });

                try
                {
                    var results = await ExecuteSimulationAsync(simulation, cts.Token);
                    
                    simulation.Status = SimulationStatus.Completed;
                    simulation.ProgressPercentage = 100;
                    simulation.Results = results;
                    await SaveSimulationAsync(simulation);

                    SimulationCompleted?.Invoke(this, new SimulationEventArgs 
                    { 
                        SimulationId = simulationId, 
                        Simulation = simulation,
                        Message = "Simulation completed successfully"
                    });

                    return results;
                }
                catch (OperationCanceledException)
                {
                    simulation.Status = SimulationStatus.Cancelled;
                    await SaveSimulationAsync(simulation);
                    throw;
                }
                finally
                {
                    lock (_lockObject)
                    {
                        _runningSimulations.Remove(simulationId);
                    }
                }
            }
            catch (Exception ex)
            {
                var simulation = await LoadSimulationAsync(simulationId);
                if (simulation != null)
                {
                    simulation.Status = SimulationStatus.Failed;
                    await SaveSimulationAsync(simulation);
                }

                SimulationFailed?.Invoke(this, new SimulationEventArgs 
                { 
                    SimulationId = simulationId, 
                    Simulation = simulation,
                    Message = ex.Message
                });

                throw;
            }
        }

        public async Task<bool> CancelSimulationAsync(string simulationId)
        {
            try
            {
                lock (_lockObject)
                {
                    if (_runningSimulations.TryGetValue(simulationId, out var cts))
                    {
                        cts.Cancel();
                        return true;
                    }
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        public async Task<double> GetSimulationProgressAsync(string simulationId)
        {
            var simulation = await LoadSimulationAsync(simulationId);
            return simulation?.ProgressPercentage ?? 0;
        }

        #endregion

        #region Analysis & Comparison

        public async Task<List<SimulationComparison>> CompareScenarios(string simulationId, List<string> scenarioIds)
        {
            var simulation = await LoadSimulationAsync(simulationId);
            if (simulation?.Results == null)
                return new List<SimulationComparison>();

            var comparisons = new List<SimulationComparison>();
            var baselineScenario = simulation.Scenarios.FirstOrDefault(s => s.IsBaseline);
            
            if (baselineScenario == null)
                return comparisons;

            foreach (var scenarioId in scenarioIds.Where(id => id != baselineScenario.Id))
            {
                var scenario = simulation.Scenarios.FirstOrDefault(s => s.Id == scenarioId);
                if (scenario?.PredictedOutcome != null)
                {
                    foreach (var metric in scenario.PredictedOutcome.ImpactMetrics)
                    {
                        var baselineValue = baselineScenario.PredictedOutcome?.ImpactMetrics.ContainsKey(metric.Key) == true
                            ? baselineScenario.PredictedOutcome.ImpactMetrics[metric.Key]
                            : 0;

                        var comparison = new SimulationComparison
                        {
                            BaselineScenarioId = baselineScenario.Id,
                            ComparisonScenarioId = scenarioId,
                            MetricName = metric.Key,
                            BaselineValue = baselineValue,
                            ComparisonValue = metric.Value,
                            AbsoluteChange = metric.Value - baselineValue,
                            PercentageChange = baselineValue != 0 ? ((metric.Value - baselineValue) / baselineValue) * 100 : 0,
                            Result = metric.Value > baselineValue ? Models.ComparisonResult.Worse : 
                                    metric.Value < baselineValue ? Models.ComparisonResult.Better : Models.ComparisonResult.Same
                        };

                        comparisons.Add(comparison);
                    }
                }
            }

            return comparisons;
        }

        public async Task<List<SimulationRisk>> AnalyzeRisks(string simulationId)
        {
            var simulation = await LoadSimulationAsync(simulationId);
            if (simulation == null)
                return new List<SimulationRisk>();

            var risks = new List<SimulationRisk>();

            // Analyze timeline risks
            var timelineParam = simulation.Parameters.FirstOrDefault(p => p.Key == "migration_timeline");
            if (timelineParam?.Value is TimeSpan timeline && timeline < TimeSpan.FromDays(90))
            {
                risks.Add(new SimulationRisk
                {
                    Name = "Aggressive Timeline",
                    Description = "The planned timeline may be too aggressive for successful completion",
                    Category = SimulationRiskCategory.Operational,
                    Level = RiskLevel.High,
                    Probability = 0.7,
                    Impact = 0.8,
                    RecommendedAction = "Consider extending the timeline or reducing scope"
                });
            }

            // Analyze budget risks
            var budgetParam = simulation.Parameters.FirstOrDefault(p => p.Key == "budget_constraint");
            if (budgetParam?.Value is double budget && budget < 500000)
            {
                risks.Add(new SimulationRisk
                {
                    Name = "Budget Constraint",
                    Description = "Limited budget may impact migration quality and timeline",
                    Category = SimulationRiskCategory.Financial,
                    Level = RiskLevel.Medium,
                    Probability = 0.6,
                    Impact = 0.7,
                    RecommendedAction = "Secure additional funding or adjust project scope"
                });
            }

            return risks;
        }

        public async Task<List<SimulationRecommendation>> GenerateRecommendations(string simulationId)
        {
            var simulation = await LoadSimulationAsync(simulationId);
            if (simulation == null)
                return new List<SimulationRecommendation>();

            var recommendations = new List<SimulationRecommendation>();

            // Analyze team size recommendations
            var teamSizeParam = simulation.Parameters.FirstOrDefault(p => p.Key == "team_size");
            if (teamSizeParam?.Value is int teamSize && teamSize < 5)
            {
                recommendations.Add(new SimulationRecommendation
                {
                    Title = "Increase Team Size",
                    Description = "Consider expanding the migration team to improve efficiency and reduce timeline risks",
                    Type = Models.RecommendationType.Optimization,
                    Priority = Models.RecommendationPriority.High,
                    ConfidenceScore = 0.8,
                    Benefits = new List<string> { "Faster completion", "Better knowledge distribution", "Reduced individual workload" },
                    Considerations = new List<string> { "Increased costs", "Communication overhead", "Onboarding time" }
                });
            }

            return recommendations;
        }

        #endregion

        #region Data Integration

        public async Task<WhatIfSimulation> BuildFromDiscoveryDataAsync(string name, List<UserData> users, List<GroupData> groups, List<InfrastructureData> infrastructure, List<ApplicationData> applications)
        {
            try
            {
                var simulation = await CreateSimulationAsync(name, "Simulation built from discovery data");

                // Add parameters based on discovery data
                if (users?.Any() == true)
                {
                    simulation.Parameters.Add(new SimulationParameter
                    {
                        Key = "user_count",
                        DisplayName = "User Count",
                        Description = "Total number of users to migrate",
                        Type = ParameterType.Integer,
                        Category = "Users",
                        Value = users.Count,
                        DefaultValue = users.Count
                    });
                }

                if (infrastructure?.Any() == true)
                {
                    simulation.Parameters.Add(new SimulationParameter
                    {
                        Key = "server_count",
                        DisplayName = "Server Count", 
                        Description = "Total number of servers to migrate",
                        Type = ParameterType.Integer,
                        Category = "Infrastructure",
                        Value = infrastructure.Count,
                        DefaultValue = infrastructure.Count
                    });
                }

                if (applications?.Any() == true)
                {
                    simulation.Parameters.Add(new SimulationParameter
                    {
                        Key = "application_count",
                        DisplayName = "Application Count",
                        Description = "Total number of applications to migrate",
                        Type = ParameterType.Integer,
                        Category = "Applications",
                        Value = applications.Count,
                        DefaultValue = applications.Count
                    });
                }

                await SaveSimulationAsync(simulation);
                return simulation;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to build simulation from discovery data: {ex.Message}", ex);
            }
        }

        public async Task<bool> ImportSimulationAsync(string filePath)
        {
            try
            {
                if (!File.Exists(filePath))
                    return false;

                var json = await File.ReadAllTextAsync(filePath);
                var simulation = JsonConvert.DeserializeObject<WhatIfSimulation>(json);
                
                return await SaveSimulationAsync(simulation);
            }
            catch
            {
                return false;
            }
        }

        public async Task<string> ExportSimulationAsync(string simulationId)
        {
            try
            {
                var simulation = await LoadSimulationAsync(simulationId);
                if (simulation == null)
                    return null;

                return JsonConvert.SerializeObject(simulation, Formatting.Indented);
            }
            catch
            {
                return null;
            }
        }

        #endregion

        #region Private Methods

        private async Task LoadSimulationsAsync()
        {
            try
            {
                if (!Directory.Exists(_dataPath))
                    return;

                var files = Directory.GetFiles(_dataPath, "*.json");
                foreach (var file in files)
                {
                    try
                    {
                        var json = await File.ReadAllTextAsync(file);
                        var simulation = JsonConvert.DeserializeObject<WhatIfSimulation>(json);
                        
                        lock (_lockObject)
                        {
                            _simulations[simulation.Id] = simulation;
                        }
                    }
                    catch
                    {
                        // Skip corrupted files
                    }
                }
            }
            catch
            {
                // Handle directory access errors
            }
        }

        private async Task AddDefaultParametersAsync(WhatIfSimulation simulation)
        {
            var defaultParameters = await GetAvailableParametersAsync();
            foreach (var param in defaultParameters)
            {
                param.Value = param.DefaultValue;
                simulation.Parameters.Add(param);
            }
        }

        private async Task<SimulationResults> ExecuteSimulationAsync(WhatIfSimulation simulation, CancellationToken cancellationToken)
        {
            var results = new SimulationResults
            {
                GeneratedDate = DateTime.Now
            };

            var startTime = DateTime.Now;

            try
            {
                // Simulate execution steps
                var steps = new[] { "Initializing", "Analyzing Parameters", "Running Scenarios", "Calculating Outcomes", "Generating Reports" };
                
                for (int i = 0; i < steps.Length; i++)
                {
                    cancellationToken.ThrowIfCancellationRequested();

                    var progress = ((double)(i + 1) / steps.Length) * 100;
                    simulation.ProgressPercentage = progress;

                    SimulationProgressUpdated?.Invoke(this, new SimulationProgressEventArgs
                    {
                        SimulationId = simulation.Id,
                        ProgressPercentage = progress,
                        CurrentOperation = steps[i],
                        ElapsedTime = DateTime.Now - startTime
                    });

                    // Simulate processing time
                    await Task.Delay(TimeSpan.FromSeconds(2), cancellationToken);
                }

                // Generate outcomes for each scenario
                foreach (var scenario in simulation.Scenarios.Where(s => s.IsEnabled))
                {
                    var outcome = new SimulationOutcome
                    {
                        ScenarioId = scenario.Id,
                        Name = $"{scenario.Name} Outcome",
                        Description = $"Predicted outcome for {scenario.Name}",
                        Type = OutcomeType.Cost,
                        Confidence = 0.85,
                        RiskLevel = RiskLevel.Medium
                    };

                    outcome.ImpactMetrics["cost"] = scenario.Type == ScenarioType.Optimistic ? 800000 : 1200000;
                    outcome.ImpactMetrics["timeline"] = scenario.Type == ScenarioType.Optimistic ? 120 : 180;
                    outcome.ImpactMetrics["risk_score"] = scenario.Type == ScenarioType.Pessimistic ? 0.8 : 0.3;

                    results.Outcomes.Add(outcome);
                    scenario.PredictedOutcome = outcome;
                }

                results.ExecutionTime = DateTime.Now - startTime;
                results.Metrics["total_scenarios"] = simulation.Scenarios.Count(s => s.IsEnabled);
                results.Metrics["avg_confidence"] = results.Outcomes.Average(o => o.Confidence);

                return results;
            }
            catch (OperationCanceledException)
            {
                results.ExecutionTime = DateTime.Now - startTime;
                throw;
            }
        }

        #endregion
    }
}