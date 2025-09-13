using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for What-If Simulation UI
    /// </summary>
    public class WhatIfSimulationViewModel : BaseViewModel
    {
        private readonly IWhatIfSimulationService _simulationService;
        
        // Main simulation management
        private WhatIfSimulation _currentSimulation;
        private ObservableCollection<WhatIfSimulation> _simulations;
        private WhatIfSimulation _selectedSimulation;
        
        // Parameters and scenarios
        private ObservableCollection<SimulationParameter> _parameters;
        private ObservableCollection<SimulationScenario> _scenarios;
        private SimulationParameter _selectedParameter;
        private SimulationScenario _selectedScenario;
        
        // Execution and results
        private bool _isRunning;
        private double _progressPercentage;
        private string _currentOperation;
        private SimulationResults _currentResults;
        private ObservableCollection<SimulationComparison> _comparisons;
        private ObservableCollection<SimulationRisk> _risks;
        private ObservableCollection<SimulationRecommendation> _recommendations;

        // UI State
        private string _simulationName = "New Simulation";
        private string _simulationDescription = string.Empty;
        private bool _showResults;
        private string _selectedTab = "Parameters";

        public WhatIfSimulationViewModel(IWhatIfSimulationService simulationService) : base()
        {
            _simulationService = simulationService ?? throw new ArgumentNullException(nameof(simulationService));
            
            // Initialize collections
            _simulations = new ObservableCollection<WhatIfSimulation>();
            _parameters = new ObservableCollection<SimulationParameter>();
            _scenarios = new ObservableCollection<SimulationScenario>();
            _comparisons = new ObservableCollection<SimulationComparison>();
            _risks = new ObservableCollection<SimulationRisk>();
            _recommendations = new ObservableCollection<SimulationRecommendation>();

            // Subscribe to service events
            _simulationService.SimulationStarted += OnSimulationStarted;
            _simulationService.SimulationCompleted += OnSimulationCompleted;
            _simulationService.SimulationFailed += OnSimulationFailed;
            _simulationService.SimulationProgressUpdated += OnSimulationProgressUpdated;

            TabTitle = "What-If Simulation";
            InitializeCommands();
            _ = LoadSimulationsAsync();
        }

        #region Properties

        public WhatIfSimulation CurrentSimulation
        {
            get => _currentSimulation;
            set => SetProperty(ref _currentSimulation, value);
        }

        public ObservableCollection<WhatIfSimulation> Simulations
        {
            get => _simulations;
            set => SetProperty(ref _simulations, value);
        }

        public WhatIfSimulation SelectedSimulation
        {
            get => _selectedSimulation;
            set
            {
                if (SetProperty(ref _selectedSimulation, value) && value != null)
                {
                    _ = LoadSimulationAsync(value);
                }
            }
        }

        public ObservableCollection<SimulationParameter> Parameters
        {
            get => _parameters;
            set => SetProperty(ref _parameters, value);
        }

        public ObservableCollection<SimulationScenario> Scenarios
        {
            get => _scenarios;
            set => SetProperty(ref _scenarios, value);
        }

        public SimulationParameter SelectedParameter
        {
            get => _selectedParameter;
            set => SetProperty(ref _selectedParameter, value);
        }

        public SimulationScenario SelectedScenario
        {
            get => _selectedScenario;
            set => SetProperty(ref _selectedScenario, value);
        }

        public bool IsRunning
        {
            get => _isRunning;
            set => SetProperty(ref _isRunning, value);
        }

        public double ProgressPercentage
        {
            get => _progressPercentage;
            set => SetProperty(ref _progressPercentage, value);
        }

        public string CurrentOperation
        {
            get => _currentOperation;
            set => SetProperty(ref _currentOperation, value);
        }

        public SimulationResults CurrentResults
        {
            get => _currentResults;
            set => SetProperty(ref _currentResults, value);
        }

        public ObservableCollection<SimulationComparison> Comparisons
        {
            get => _comparisons;
            set => SetProperty(ref _comparisons, value);
        }

        public ObservableCollection<SimulationRisk> Risks
        {
            get => _risks;
            set => SetProperty(ref _risks, value);
        }

        public ObservableCollection<SimulationRecommendation> Recommendations
        {
            get => _recommendations;
            set => SetProperty(ref _recommendations, value);
        }

        public string SimulationName
        {
            get => _simulationName;
            set
            {
                if (SetProperty(ref _simulationName, value) && CurrentSimulation != null)
                {
                    CurrentSimulation.Name = value;
                }
            }
        }

        public string SimulationDescription
        {
            get => _simulationDescription;
            set
            {
                if (SetProperty(ref _simulationDescription, value) && CurrentSimulation != null)
                {
                    CurrentSimulation.Description = value;
                }
            }
        }

        public bool ShowResults
        {
            get => _showResults;
            set => SetProperty(ref _showResults, value);
        }

        public string SelectedTab
        {
            get => _selectedTab;
            set => SetProperty(ref _selectedTab, value);
        }

        private System.Windows.GridLength _splitterPosition = new System.Windows.GridLength(250, System.Windows.GridUnitType.Pixel);
        public System.Windows.GridLength SplitterPosition
        {
            get => _splitterPosition;
            set => SetProperty(ref _splitterPosition, value);
        }

        // Computed properties
        public bool CanRunSimulation => CurrentSimulation != null && !IsRunning && 
                                       Scenarios.Any(s => s.IsEnabled);

        public bool CanCancelSimulation => IsRunning;

        public bool HasResults => CurrentResults != null;

        public bool HasScenarios => Scenarios?.Count > 0;

        public bool HasParameters => Parameters?.Count > 0;

        #endregion

        #region Commands

        public ICommand CreateSimulationCommand { get; private set; }
        public ICommand LoadSimulationCommand { get; private set; }
        public ICommand SaveSimulationCommand { get; private set; }
        public ICommand DeleteSimulationCommand { get; private set; }
        public ICommand CloneSimulationCommand { get; private set; }

        public ICommand AddParameterCommand { get; private set; }
        public ICommand EditParameterCommand { get; private set; }
        public ICommand RemoveParameterCommand { get; private set; }

        public ICommand AddScenarioCommand { get; private set; }
        public ICommand EditScenarioCommand { get; private set; }
        public ICommand RemoveScenarioCommand { get; private set; }
        public ICommand CreateBaselineScenarioCommand { get; private set; }

        public ICommand RunSimulationCommand { get; private set; }
        public ICommand CancelSimulationCommand { get; private set; }

        public ICommand CompareScenariusCommand { get; private set; }
        public ICommand AnalyzeRisksCommand { get; private set; }
        public ICommand GenerateRecommendationsCommand { get; private set; }

        public ICommand ImportSimulationCommand { get; private set; }
        public ICommand ExportSimulationCommand { get; private set; }

        public ICommand RefreshCommand { get; private set; }

        #endregion

        #region Command Initialization

        protected override void InitializeCommands()
        {
            base.InitializeCommands();

            // Simulation Management
            CreateSimulationCommand = new AsyncRelayCommand(CreateSimulationAsync);
            LoadSimulationCommand = new AsyncRelayCommand<WhatIfSimulation>(LoadSimulationAsync);
            SaveSimulationCommand = new AsyncRelayCommand(SaveSimulationAsync, () => CurrentSimulation != null);
            DeleteSimulationCommand = new AsyncRelayCommand<WhatIfSimulation>(DeleteSimulationAsync);
            CloneSimulationCommand = new AsyncRelayCommand<WhatIfSimulation>(CloneSimulationAsync);

            // Parameter Management
            AddParameterCommand = new AsyncRelayCommand(AddParameterAsync);
            EditParameterCommand = new AsyncRelayCommand<SimulationParameter>(EditParameterAsync);
            RemoveParameterCommand = new AsyncRelayCommand<SimulationParameter>(RemoveParameterAsync);

            // Scenario Management
            AddScenarioCommand = new AsyncRelayCommand(AddScenarioAsync);
            EditScenarioCommand = new AsyncRelayCommand<SimulationScenario>(EditScenarioAsync);
            RemoveScenarioCommand = new AsyncRelayCommand<SimulationScenario>(RemoveScenarioAsync);
            CreateBaselineScenarioCommand = new AsyncRelayCommand(CreateBaselineScenarioAsync);

            // Simulation Execution
            RunSimulationCommand = new AsyncRelayCommand(RunSimulationAsync, () => CanRunSimulation);
            CancelSimulationCommand = new AsyncRelayCommand(CancelSimulationAsync, () => CanCancelSimulation);

            // Analysis
            CompareScenariusCommand = new AsyncRelayCommand(CompareScenariusAsync);
            AnalyzeRisksCommand = new AsyncRelayCommand(AnalyzeRisksAsync);
            GenerateRecommendationsCommand = new AsyncRelayCommand(GenerateRecommendationsAsync);

            // Import/Export
            ImportSimulationCommand = new AsyncRelayCommand(ImportSimulationAsync);
            ExportSimulationCommand = new AsyncRelayCommand(ExportSimulationAsync);

            RefreshCommand = new AsyncRelayCommand(LoadSimulationsAsync);
        }

        #endregion

        #region Command Implementations

        private async Task CreateSimulationAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage = "Creating new simulation...";

                var simulation = await _simulationService.CreateSimulationAsync(SimulationName, SimulationDescription);
                CurrentSimulation = simulation;
                
                await LoadSimulationDataAsync(simulation);
                Simulations.Add(simulation);
                SelectedSimulation = simulation;

                StatusMessage = "New simulation created successfully.";
            }
            catch (Exception ex)
            {
                HandleError("Failed to create simulation", ex);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task LoadSimulationAsync(WhatIfSimulation simulation)
        {
            if (simulation == null) return;

            try
            {
                IsLoading = true;
                StatusMessage = "Loading simulation...";

                CurrentSimulation = simulation;
                await LoadSimulationDataAsync(simulation);

                SimulationName = simulation.Name;
                SimulationDescription = simulation.Description;
                ShowResults = simulation.Results != null;

                StatusMessage = $"Loaded simulation: {simulation.Name}";
            }
            catch (Exception ex)
            {
                HandleError("Failed to load simulation", ex);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task SaveSimulationAsync()
        {
            if (CurrentSimulation == null) return;

            try
            {
                IsLoading = true;
                StatusMessage = "Saving simulation...";

                var success = await _simulationService.SaveSimulationAsync(CurrentSimulation);
                if (success)
                {
                    StatusMessage = "Simulation saved successfully.";
                }
                else
                {
                    StatusMessage = "Failed to save simulation.";
                }
            }
            catch (Exception ex)
            {
                HandleError("Failed to save simulation", ex);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task DeleteSimulationAsync(WhatIfSimulation simulation)
        {
            if (simulation == null) return;

            try
            {
                IsLoading = true;
                StatusMessage = "Deleting simulation...";

                var success = await _simulationService.DeleteSimulationAsync(simulation.Id);
                if (success)
                {
                    Simulations.Remove(simulation);
                    if (CurrentSimulation?.Id == simulation.Id)
                    {
                        CurrentSimulation = null;
                        ClearCurrentSimulationData();
                    }
                    StatusMessage = "Simulation deleted successfully.";
                }
                else
                {
                    StatusMessage = "Failed to delete simulation.";
                }
            }
            catch (Exception ex)
            {
                HandleError("Failed to delete simulation", ex);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task CloneSimulationAsync(WhatIfSimulation simulation)
        {
            if (simulation == null) return;

            try
            {
                IsLoading = true;
                StatusMessage = "Cloning simulation...";

                var clonedSimulation = await _simulationService.CloneSimulationAsync(simulation.Id, $"{simulation.Name} (Copy)");
                if (clonedSimulation != null)
                {
                    Simulations.Add(clonedSimulation);
                    SelectedSimulation = clonedSimulation;
                    StatusMessage = "Simulation cloned successfully.";
                }
                else
                {
                    StatusMessage = "Failed to clone simulation.";
                }
            }
            catch (Exception ex)
            {
                HandleError("Failed to clone simulation", ex);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task AddParameterAsync()
        {
            if (CurrentSimulation == null) return;

            try
            {
                var availableParameters = await _simulationService.GetAvailableParametersAsync();
                if (availableParameters?.Any() == true)
                {
                    var parameter = availableParameters.First();
                    parameter.Value = parameter.DefaultValue;
                    
                    var success = await _simulationService.AddParameterAsync(CurrentSimulation.Id, parameter);
                    if (success)
                    {
                        Parameters.Add(parameter);
                        StatusMessage = $"Parameter '{parameter.DisplayName}' added successfully.";
                    }
                }
            }
            catch (Exception ex)
            {
                HandleError("Failed to add parameter", ex);
            }
        }

        private async Task EditParameterAsync(SimulationParameter parameter)
        {
            if (parameter == null || CurrentSimulation == null) return;

            try
            {
                var success = await _simulationService.UpdateParameterAsync(CurrentSimulation.Id, parameter);
                if (success)
                {
                    StatusMessage = $"Parameter '{parameter.DisplayName}' updated successfully.";
                }
            }
            catch (Exception ex)
            {
                HandleError("Failed to edit parameter", ex);
            }
        }

        private async Task RemoveParameterAsync(SimulationParameter parameter)
        {
            if (parameter == null || CurrentSimulation == null) return;

            try
            {
                var success = await _simulationService.RemoveParameterAsync(CurrentSimulation.Id, parameter.Id);
                if (success)
                {
                    Parameters.Remove(parameter);
                    StatusMessage = $"Parameter '{parameter.DisplayName}' removed successfully.";
                }
            }
            catch (Exception ex)
            {
                HandleError("Failed to remove parameter", ex);
            }
        }

        private async Task AddScenarioAsync()
        {
            if (CurrentSimulation == null) return;

            try
            {
                var scenario = new SimulationScenario
                {
                    Name = $"Scenario {Scenarios.Count + 1}",
                    Description = "New scenario",
                    Type = ScenarioType.Custom,
                    IsEnabled = true
                };

                var success = await _simulationService.AddScenarioAsync(CurrentSimulation.Id, scenario);
                if (success)
                {
                    Scenarios.Add(scenario);
                    StatusMessage = $"Scenario '{scenario.Name}' added successfully.";
                }
            }
            catch (Exception ex)
            {
                HandleError("Failed to add scenario", ex);
            }
        }

        private async Task EditScenarioAsync(SimulationScenario scenario)
        {
            if (scenario == null || CurrentSimulation == null) return;

            try
            {
                var success = await _simulationService.UpdateScenarioAsync(CurrentSimulation.Id, scenario);
                if (success)
                {
                    StatusMessage = $"Scenario '{scenario.Name}' updated successfully.";
                }
            }
            catch (Exception ex)
            {
                HandleError("Failed to edit scenario", ex);
            }
        }

        private async Task RemoveScenarioAsync(SimulationScenario scenario)
        {
            if (scenario == null || CurrentSimulation == null) return;

            try
            {
                var success = await _simulationService.RemoveScenarioAsync(CurrentSimulation.Id, scenario.Id);
                if (success)
                {
                    Scenarios.Remove(scenario);
                    StatusMessage = $"Scenario '{scenario.Name}' removed successfully.";
                }
            }
            catch (Exception ex)
            {
                HandleError("Failed to remove scenario", ex);
            }
        }

        private async Task CreateBaselineScenarioAsync()
        {
            if (CurrentSimulation == null) return;

            try
            {
                var baselineScenario = await _simulationService.CreateBaselineScenarioAsync(CurrentSimulation.Id);
                if (baselineScenario != null)
                {
                    Scenarios.Add(baselineScenario);
                    StatusMessage = "Baseline scenario created successfully.";
                }
            }
            catch (Exception ex)
            {
                HandleError("Failed to create baseline scenario", ex);
            }
        }

        private async Task RunSimulationAsync()
        {
            if (CurrentSimulation == null) return;

            try
            {
                IsRunning = true;
                ProgressPercentage = 0;
                CurrentOperation = "Starting simulation...";
                StatusMessage = "Running simulation...";

                var results = await _simulationService.RunSimulationAsync(CurrentSimulation.Id);
                CurrentResults = results;
                ShowResults = true;
                SelectedTab = "Results";

                await LoadAnalysisDataAsync();

                StatusMessage = "Simulation completed successfully.";
            }
            catch (Exception ex)
            {
                HandleError("Failed to run simulation", ex);
            }
            finally
            {
                IsRunning = false;
                ProgressPercentage = 100;
                CurrentOperation = "Completed";
            }
        }

        private async Task CancelSimulationAsync()
        {
            if (CurrentSimulation == null) return;

            try
            {
                var success = await _simulationService.CancelSimulationAsync(CurrentSimulation.Id);
                if (success)
                {
                    IsRunning = false;
                    StatusMessage = "Simulation cancelled.";
                }
            }
            catch (Exception ex)
            {
                HandleError("Failed to cancel simulation", ex);
            }
        }

        private async Task CompareScenariusAsync()
        {
            if (CurrentSimulation == null || !HasResults) return;

            try
            {
                IsLoading = true;
                StatusMessage = "Comparing scenarios...";

                var scenarioIds = Scenarios.Where(s => s.IsEnabled).Select(s => s.Id).ToList();
                var comparisons = await _simulationService.CompareScenarios(CurrentSimulation.Id, scenarioIds);
                
                Comparisons.Clear();
                foreach (var comparison in comparisons)
                {
                    Comparisons.Add(comparison);
                }

                StatusMessage = $"Scenario comparison completed. Found {comparisons.Count} comparisons.";
            }
            catch (Exception ex)
            {
                HandleError("Failed to compare scenarios", ex);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task AnalyzeRisksAsync()
        {
            if (CurrentSimulation == null) return;

            try
            {
                IsLoading = true;
                StatusMessage = "Analyzing risks...";

                var risks = await _simulationService.AnalyzeRisks(CurrentSimulation.Id);
                
                Risks.Clear();
                foreach (var risk in risks)
                {
                    Risks.Add(risk);
                }

                StatusMessage = $"Risk analysis completed. Identified {risks.Count} risks.";
            }
            catch (Exception ex)
            {
                HandleError("Failed to analyze risks", ex);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task GenerateRecommendationsAsync()
        {
            if (CurrentSimulation == null) return;

            try
            {
                IsLoading = true;
                StatusMessage = "Generating recommendations...";

                var recommendations = await _simulationService.GenerateRecommendations(CurrentSimulation.Id);
                
                Recommendations.Clear();
                foreach (var recommendation in recommendations)
                {
                    Recommendations.Add(recommendation);
                }

                StatusMessage = $"Recommendations generated. Found {recommendations.Count} recommendations.";
            }
            catch (Exception ex)
            {
                HandleError("Failed to generate recommendations", ex);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task ImportSimulationAsync()
        {
            try
            {
                // Implementation would show file dialog and import simulation
                StatusMessage = "Import functionality not yet implemented.";
            }
            catch (Exception ex)
            {
                HandleError("Failed to import simulation", ex);
            }
        }

        private async Task ExportSimulationAsync()
        {
            if (CurrentSimulation == null) return;

            try
            {
                var json = await _simulationService.ExportSimulationAsync(CurrentSimulation.Id);
                if (!string.IsNullOrEmpty(json))
                {
                    // Implementation would show save dialog and save JSON
                    StatusMessage = "Export functionality not yet implemented.";
                }
            }
            catch (Exception ex)
            {
                HandleError("Failed to export simulation", ex);
            }
        }

        #endregion

        #region Event Handlers

        private void OnSimulationStarted(object sender, SimulationEventArgs e)
        {
            if (e.SimulationId == CurrentSimulation?.Id)
            {
                App.Current.Dispatcher.Invoke(() =>
                {
                    IsRunning = true;
                    ProgressPercentage = 0;
                    CurrentOperation = "Initializing...";
                    StatusMessage = e.Message;
                });
            }
        }

        private void OnSimulationCompleted(object sender, SimulationEventArgs e)
        {
            if (e.SimulationId == CurrentSimulation?.Id)
            {
                App.Current.Dispatcher.Invoke(() =>
                {
                    IsRunning = false;
                    ProgressPercentage = 100;
                    CurrentOperation = "Completed";
                    StatusMessage = e.Message;
                    ShowResults = true;
                    _ = LoadAnalysisDataAsync();
                });
            }
        }

        private void OnSimulationFailed(object sender, SimulationEventArgs e)
        {
            if (e.SimulationId == CurrentSimulation?.Id)
            {
                App.Current.Dispatcher.Invoke(() =>
                {
                    IsRunning = false;
                    StatusMessage = e.Message;
                    HandleError("Simulation failed", new Exception(e.Message));
                });
            }
        }

        private void OnSimulationProgressUpdated(object sender, SimulationProgressEventArgs e)
        {
            if (e.SimulationId == CurrentSimulation?.Id)
            {
                App.Current.Dispatcher.Invoke(() =>
                {
                    ProgressPercentage = e.ProgressPercentage;
                    CurrentOperation = e.CurrentOperation;
                });
            }
        }

        #endregion

        #region Helper Methods

        private async Task LoadSimulationsAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage = "Loading simulations...";

                var simulations = await _simulationService.GetAllSimulationsAsync();
                
                Simulations.Clear();
                foreach (var simulation in simulations)
                {
                    Simulations.Add(simulation);
                }

                StatusMessage = $"Loaded {simulations.Count} simulations.";
            }
            catch (Exception ex)
            {
                HandleError("Failed to load simulations", ex);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task LoadSimulationDataAsync(WhatIfSimulation simulation)
        {
            if (simulation == null) return;

            // Load parameters
            Parameters.Clear();
            foreach (var parameter in simulation.Parameters)
            {
                Parameters.Add(parameter);
            }

            // Load scenarios
            Scenarios.Clear();
            foreach (var scenario in simulation.Scenarios)
            {
                Scenarios.Add(scenario);
            }

            // Load results if available
            if (simulation.Results != null)
            {
                CurrentResults = simulation.Results;
                await LoadAnalysisDataAsync();
            }
            else
            {
                ClearAnalysisData();
            }
        }

        private async Task LoadAnalysisDataAsync()
        {
            if (CurrentSimulation == null) return;

            try
            {
                await Task.WhenAll(
                    CompareScenariusAsync(),
                    AnalyzeRisksAsync(),
                    GenerateRecommendationsAsync()
                );
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Failed to load analysis data");
            }
        }

        private void ClearCurrentSimulationData()
        {
            Parameters.Clear();
            Scenarios.Clear();
            ClearAnalysisData();
            CurrentResults = null;
            ShowResults = false;
            SimulationName = "New Simulation";
            SimulationDescription = string.Empty;
        }

        private void ClearAnalysisData()
        {
            Comparisons.Clear();
            Risks.Clear();
            Recommendations.Clear();
        }

        private void HandleError(string message, Exception ex)
        {
            Logger?.LogError(ex, message);
            StatusMessage = message;
            HasErrors = true;
            ErrorMessage = ex.Message;
        }

        #endregion

        #region Cleanup

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                // Unsubscribe from events
                if (_simulationService != null)
                {
                    _simulationService.SimulationStarted -= OnSimulationStarted;
                    _simulationService.SimulationCompleted -= OnSimulationCompleted;
                    _simulationService.SimulationFailed -= OnSimulationFailed;
                    _simulationService.SimulationProgressUpdated -= OnSimulationProgressUpdated;
                }
            }

            base.Dispose(disposing);
        }

        #endregion
    }
}