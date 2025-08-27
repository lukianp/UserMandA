using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Interface for What-If Simulation service
    /// </summary>
    public interface IWhatIfSimulationService
    {
        // Simulation Management
        Task<WhatIfSimulation> CreateSimulationAsync(string name, string description = null);
        Task<WhatIfSimulation> LoadSimulationAsync(string simulationId);
        Task<bool> SaveSimulationAsync(WhatIfSimulation simulation);
        Task<bool> DeleteSimulationAsync(string simulationId);
        Task<List<WhatIfSimulation>> GetAllSimulationsAsync();
        Task<WhatIfSimulation> CloneSimulationAsync(string simulationId, string newName);

        // Parameter Management
        Task<List<SimulationParameter>> GetAvailableParametersAsync();
        Task<bool> AddParameterAsync(string simulationId, SimulationParameter parameter);
        Task<bool> UpdateParameterAsync(string simulationId, SimulationParameter parameter);
        Task<bool> RemoveParameterAsync(string simulationId, string parameterId);

        // Scenario Management
        Task<bool> AddScenarioAsync(string simulationId, SimulationScenario scenario);
        Task<bool> UpdateScenarioAsync(string simulationId, SimulationScenario scenario);
        Task<bool> RemoveScenarioAsync(string simulationId, string scenarioId);
        Task<SimulationScenario> CreateBaselineScenarioAsync(string simulationId);

        // Simulation Execution
        Task<SimulationResults> RunSimulationAsync(string simulationId);
        Task<bool> CancelSimulationAsync(string simulationId);
        Task<double> GetSimulationProgressAsync(string simulationId);

        // Analysis & Comparison
        Task<List<SimulationComparison>> CompareScenarios(string simulationId, List<string> scenarioIds);
        Task<List<SimulationRisk>> AnalyzeRisks(string simulationId);
        Task<List<SimulationRecommendation>> GenerateRecommendations(string simulationId);

        // Data Integration
        Task<WhatIfSimulation> BuildFromDiscoveryDataAsync(string name, List<UserData> users, List<GroupData> groups, List<InfrastructureData> infrastructure, List<ApplicationData> applications);
        Task<bool> ImportSimulationAsync(string filePath);
        Task<string> ExportSimulationAsync(string simulationId);

        // Events
        event EventHandler<SimulationEventArgs> SimulationStarted;
        event EventHandler<SimulationEventArgs> SimulationCompleted;
        event EventHandler<SimulationEventArgs> SimulationFailed;
        event EventHandler<SimulationProgressEventArgs> SimulationProgressUpdated;
    }

    /// <summary>
    /// Event arguments for simulation events
    /// </summary>
    public class SimulationEventArgs : EventArgs
    {
        public string SimulationId { get; set; }
        public WhatIfSimulation Simulation { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }

        public SimulationEventArgs()
        {
            Timestamp = DateTime.Now;
        }
    }

    /// <summary>
    /// Event arguments for simulation progress updates
    /// </summary>
    public class SimulationProgressEventArgs : EventArgs
    {
        public string SimulationId { get; set; }
        public double ProgressPercentage { get; set; }
        public string CurrentOperation { get; set; }
        public TimeSpan ElapsedTime { get; set; }
        public TimeSpan EstimatedRemainingTime { get; set; }
        public DateTime Timestamp { get; set; }

        public SimulationProgressEventArgs()
        {
            Timestamp = DateTime.Now;
        }
    }
}