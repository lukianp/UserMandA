using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for Risk Analysis Dashboard
    /// </summary>
    public class RiskAnalysisViewModel : BaseViewModel
    {
        private readonly IRiskAnalysisService _riskAnalysisService;
        
        // Collections
        private ObservableCollection<RiskAssessment> _risks;
        private ObservableCollection<RiskMitigationAction> _actions;
        private ObservableCollection<RiskIndicator> _indicators;
        private ObservableCollection<RiskHeatmapCell> _heatmapCells;
        
        // Selected items
        private RiskAssessment _selectedRisk;
        private RiskMitigationAction _selectedAction;
        private RiskIndicator _selectedIndicator;
        
        // Statistics and analytics
        private RiskStatistics _riskStatistics;
        private Dictionary<string, double> _complianceScores;
        private double _organizationalRiskScore;
        
        // UI state
        private bool _isLoadingRisks;
        private bool _isLoadingStatistics;
        private string _searchText;
        private bool _showHeatmap = true;
        private bool _showStatistics = true;
        private bool _showTopRisks = true;
        
        // Filters
        private RiskCategory? _selectedCategory;
        private RiskLevel? _selectedLevel;
        private RiskStatus? _selectedStatus;
        private string _selectedOwner;
        
        // Editors
        private bool _showRiskEditor;
        private bool _showActionEditor;
        private bool _showIndicatorEditor;
        private bool _isEditingRisk;
        private bool _isEditingAction;
        private bool _isEditingIndicator;
        
        // New item properties
        private string _newRiskTitle;
        private string _newRiskDescription;
        private RiskCategory _newRiskCategory;
        private double _newRiskProbability;
        private double _newRiskImpact;
        private string _newRiskOwner;
        
        private string _newActionAction;
        private string _newActionDescription;
        private MitigationType _newActionType;
        private DateTime? _newActionDueDate;
        private string _newActionAssignedTo;
        
        private string _newIndicatorName;
        private double _newIndicatorThreshold;
        private string _newIndicatorUnit;

        public RiskAnalysisViewModel(IRiskAnalysisService riskAnalysisService) : base()
        {
            _riskAnalysisService = riskAnalysisService ?? throw new ArgumentNullException(nameof(riskAnalysisService));
            
            InitializeCollections();
            InitializeCommands();
            
            // Load initial data
            _ = LoadDataAsync();
        }

        #region Properties

        public ObservableCollection<RiskAssessment> Risks
        {
            get => _risks;
            set => SetProperty(ref _risks, value);
        }

        public ObservableCollection<RiskMitigationAction> Actions
        {
            get => _actions;
            set => SetProperty(ref _actions, value);
        }

        public ObservableCollection<RiskIndicator> Indicators
        {
            get => _indicators;
            set => SetProperty(ref _indicators, value);
        }

        public ObservableCollection<RiskHeatmapCell> HeatmapCells
        {
            get => _heatmapCells;
            set => SetProperty(ref _heatmapCells, value);
        }

        public RiskAssessment SelectedRisk
        {
            get => _selectedRisk;
            set
            {
                if (SetProperty(ref _selectedRisk, value))
                {
                    _ = LoadRiskDetailsAsync();
                }
            }
        }

        public RiskMitigationAction SelectedAction
        {
            get => _selectedAction;
            set => SetProperty(ref _selectedAction, value);
        }

        public RiskIndicator SelectedIndicator
        {
            get => _selectedIndicator;
            set => SetProperty(ref _selectedIndicator, value);
        }

        public RiskStatistics RiskStatistics
        {
            get => _riskStatistics;
            set => SetProperty(ref _riskStatistics, value);
        }

        public Dictionary<string, double> ComplianceScores
        {
            get => _complianceScores;
            set => SetProperty(ref _complianceScores, value);
        }

        public double OrganizationalRiskScore
        {
            get => _organizationalRiskScore;
            set => SetProperty(ref _organizationalRiskScore, value);
        }

        public bool IsLoadingRisks
        {
            get => _isLoadingRisks;
            set => SetProperty(ref _isLoadingRisks, value);
        }

        public bool IsLoadingStatistics
        {
            get => _isLoadingStatistics;
            set => SetProperty(ref _isLoadingStatistics, value);
        }

        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    _ = SearchRisksAsync();
                }
            }
        }

        public bool ShowHeatmap
        {
            get => _showHeatmap;
            set => SetProperty(ref _showHeatmap, value);
        }

        public bool ShowStatistics
        {
            get => _showStatistics;
            set => SetProperty(ref _showStatistics, value);
        }

        public bool ShowTopRisks
        {
            get => _showTopRisks;
            set => SetProperty(ref _showTopRisks, value);
        }

        // Filter properties
        public RiskCategory? SelectedCategory
        {
            get => _selectedCategory;
            set
            {
                if (SetProperty(ref _selectedCategory, value))
                {
                    _ = ApplyFiltersAsync();
                }
            }
        }

        public RiskLevel? SelectedLevel
        {
            get => _selectedLevel;
            set
            {
                if (SetProperty(ref _selectedLevel, value))
                {
                    _ = ApplyFiltersAsync();
                }
            }
        }

        public RiskStatus? SelectedStatus
        {
            get => _selectedStatus;
            set
            {
                if (SetProperty(ref _selectedStatus, value))
                {
                    _ = ApplyFiltersAsync();
                }
            }
        }

        public string SelectedOwner
        {
            get => _selectedOwner;
            set
            {
                if (SetProperty(ref _selectedOwner, value))
                {
                    _ = ApplyFiltersAsync();
                }
            }
        }

        // Editor properties
        public bool ShowRiskEditor
        {
            get => _showRiskEditor;
            set => SetProperty(ref _showRiskEditor, value);
        }

        public bool ShowActionEditor
        {
            get => _showActionEditor;
            set => SetProperty(ref _showActionEditor, value);
        }

        public bool ShowIndicatorEditor
        {
            get => _showIndicatorEditor;
            set => SetProperty(ref _showIndicatorEditor, value);
        }

        public bool IsEditingRisk
        {
            get => _isEditingRisk;
            set => SetProperty(ref _isEditingRisk, value);
        }

        public bool IsEditingAction
        {
            get => _isEditingAction;
            set => SetProperty(ref _isEditingAction, value);
        }

        public bool IsEditingIndicator
        {
            get => _isEditingIndicator;
            set => SetProperty(ref _isEditingIndicator, value);
        }

        // New item properties
        public string NewRiskTitle
        {
            get => _newRiskTitle;
            set => SetProperty(ref _newRiskTitle, value);
        }

        public string NewRiskDescription
        {
            get => _newRiskDescription;
            set => SetProperty(ref _newRiskDescription, value);
        }

        public RiskCategory NewRiskCategory
        {
            get => _newRiskCategory;
            set => SetProperty(ref _newRiskCategory, value);
        }

        public double NewRiskProbability
        {
            get => _newRiskProbability;
            set => SetProperty(ref _newRiskProbability, value);
        }

        public double NewRiskImpact
        {
            get => _newRiskImpact;
            set => SetProperty(ref _newRiskImpact, value);
        }

        public string NewRiskOwner
        {
            get => _newRiskOwner;
            set => SetProperty(ref _newRiskOwner, value);
        }

        public string NewActionAction
        {
            get => _newActionAction;
            set => SetProperty(ref _newActionAction, value);
        }

        public string NewActionDescription
        {
            get => _newActionDescription;
            set => SetProperty(ref _newActionDescription, value);
        }

        public MitigationType NewActionType
        {
            get => _newActionType;
            set => SetProperty(ref _newActionType, value);
        }

        public DateTime? NewActionDueDate
        {
            get => _newActionDueDate;
            set => SetProperty(ref _newActionDueDate, value);
        }

        public string NewActionAssignedTo
        {
            get => _newActionAssignedTo;
            set => SetProperty(ref _newActionAssignedTo, value);
        }

        public string NewIndicatorName
        {
            get => _newIndicatorName;
            set => SetProperty(ref _newIndicatorName, value);
        }

        public double NewIndicatorThreshold
        {
            get => _newIndicatorThreshold;
            set => SetProperty(ref _newIndicatorThreshold, value);
        }

        public string NewIndicatorUnit
        {
            get => _newIndicatorUnit;
            set => SetProperty(ref _newIndicatorUnit, value);
        }

        // Available enum values for UI binding
        public Array RiskCategories => Enum.GetValues(typeof(RiskCategory));
        public Array RiskLevels => Enum.GetValues(typeof(RiskLevel));
        public Array RiskStatuses => Enum.GetValues(typeof(RiskStatus));
        public Array MitigationTypes => Enum.GetValues(typeof(MitigationType));
        public Array ActionStatuses => Enum.GetValues(typeof(ActionStatus));

        #endregion

        #region Commands

        // View commands
        public ICommand RefreshDataCommand { get; private set; }
        public ICommand ClearFiltersCommand { get; private set; }
        public ICommand ToggleHeatmapCommand { get; private set; }
        public ICommand ToggleStatisticsCommand { get; private set; }

        // Risk commands
        public ICommand CreateRiskCommand { get; private set; }
        public ICommand EditRiskCommand { get; private set; }
        public ICommand DeleteRiskCommand { get; private set; }
        public ICommand SaveRiskCommand { get; private set; }
        public ICommand CancelRiskEditCommand { get; private set; }

        // Action commands
        public ICommand CreateActionCommand { get; private set; }
        public ICommand EditActionCommand { get; private set; }
        public ICommand DeleteActionCommand { get; private set; }
        public ICommand SaveActionCommand { get; private set; }
        public ICommand CancelActionEditCommand { get; private set; }

        // Indicator commands
        public ICommand CreateIndicatorCommand { get; private set; }
        public ICommand EditIndicatorCommand { get; private set; }
        public ICommand DeleteIndicatorCommand { get; private set; }
        public ICommand SaveIndicatorCommand { get; private set; }
        public ICommand CancelIndicatorEditCommand { get; private set; }

        // Analysis commands
        public ICommand RunAutomatedAssessmentCommand { get; private set; }
        public ICommand UpdateRiskLevelsCommand { get; private set; }
        public ICommand IdentifyEmergingRisksCommand { get; private set; }
        public ICommand GenerateReportCommand { get; private set; }

        // Export/Import commands
        public ICommand ExportRisksCommand { get; private set; }
        public ICommand ImportRisksCommand { get; private set; }

        #endregion

        #region Initialization

        private void InitializeCollections()
        {
            Risks = new ObservableCollection<RiskAssessment>();
            Actions = new ObservableCollection<RiskMitigationAction>();
            Indicators = new ObservableCollection<RiskIndicator>();
            HeatmapCells = new ObservableCollection<RiskHeatmapCell>();
            ComplianceScores = new Dictionary<string, double>();
        }

        protected override void InitializeCommands()
        {
            // View commands
            RefreshDataCommand = new AsyncRelayCommand(LoadDataAsync);
            ClearFiltersCommand = new RelayCommand(ClearFilters);
            ToggleHeatmapCommand = new RelayCommand(() => ShowHeatmap = !ShowHeatmap);
            ToggleStatisticsCommand = new RelayCommand(() => ShowStatistics = !ShowStatistics);

            // Risk commands
            CreateRiskCommand = new RelayCommand(StartCreateRisk);
            EditRiskCommand = new RelayCommand<RiskAssessment>(StartEditRisk);
            DeleteRiskCommand = new AsyncRelayCommand<RiskAssessment>(DeleteRiskAsync);
            SaveRiskCommand = new AsyncRelayCommand(SaveRiskAsync);
            CancelRiskEditCommand = new RelayCommand(CancelRiskEdit);

            // Action commands
            CreateActionCommand = new RelayCommand(StartCreateAction);
            EditActionCommand = new RelayCommand<RiskMitigationAction>(StartEditAction);
            DeleteActionCommand = new AsyncRelayCommand<RiskMitigationAction>(DeleteActionAsync);
            SaveActionCommand = new AsyncRelayCommand(SaveActionAsync);
            CancelActionEditCommand = new RelayCommand(CancelActionEdit);

            // Indicator commands
            CreateIndicatorCommand = new RelayCommand(StartCreateIndicator);
            EditIndicatorCommand = new RelayCommand<RiskIndicator>(StartEditIndicator);
            DeleteIndicatorCommand = new AsyncRelayCommand<RiskIndicator>(DeleteIndicatorAsync);
            SaveIndicatorCommand = new AsyncRelayCommand(SaveIndicatorAsync);
            CancelIndicatorEditCommand = new RelayCommand(CancelIndicatorEdit);

            // Analysis commands
            RunAutomatedAssessmentCommand = new AsyncRelayCommand(RunAutomatedAssessmentAsync);
            UpdateRiskLevelsCommand = new AsyncRelayCommand(UpdateRiskLevelsAsync);
            IdentifyEmergingRisksCommand = new AsyncRelayCommand(IdentifyEmergingRisksAsync);
            GenerateReportCommand = new AsyncRelayCommand(GenerateReportAsync);

            // Export/Import commands
            ExportRisksCommand = new AsyncRelayCommand(ExportRisksAsync);
            ImportRisksCommand = new AsyncRelayCommand(ImportRisksAsync);
        }

        #endregion

        #region Data Loading

        private async Task LoadDataAsync()
        {
            try
            {
                IsLoadingRisks = true;
                IsLoadingStatistics = true;

                // Load all data in parallel
                var risksTask = LoadRisksAsync();
                var actionsTask = LoadActionsAsync();
                var indicatorsTask = LoadIndicatorsAsync();
                var statisticsTask = LoadStatisticsAsync();
                var heatmapTask = LoadHeatmapAsync();
                var complianceTask = LoadComplianceScoresAsync();
                var orgScoreTask = LoadOrganizationalScoreAsync();

                await Task.WhenAll(risksTask, actionsTask, indicatorsTask, statisticsTask, 
                                 heatmapTask, complianceTask, orgScoreTask);
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to load risk data: {ex.Message}";
            }
            finally
            {
                IsLoadingRisks = false;
                IsLoadingStatistics = false;
            }
        }

        private async Task LoadRisksAsync()
        {
            var risks = await _riskAnalysisService.GetAllRiskAssessmentsAsync();
            
            App.Current.Dispatcher.Invoke(() =>
            {
                Risks.Clear();
                foreach (var risk in risks)
                {
                    Risks.Add(risk);
                }
            });
        }

        private async Task LoadActionsAsync()
        {
            var actions = await _riskAnalysisService.GetAllMitigationActionsAsync();
            
            App.Current.Dispatcher.Invoke(() =>
            {
                Actions.Clear();
                foreach (var action in actions)
                {
                    Actions.Add(action);
                }
            });
        }

        private async Task LoadIndicatorsAsync()
        {
            var indicators = await _riskAnalysisService.GetAllIndicatorsAsync();
            
            App.Current.Dispatcher.Invoke(() =>
            {
                Indicators.Clear();
                foreach (var indicator in indicators)
                {
                    Indicators.Add(indicator);
                }
            });
        }

        private async Task LoadStatisticsAsync()
        {
            RiskStatistics = await _riskAnalysisService.GetRiskStatisticsAsync();
        }

        private async Task LoadHeatmapAsync()
        {
            var cells = await _riskAnalysisService.GenerateRiskHeatmapAsync();
            
            App.Current.Dispatcher.Invoke(() =>
            {
                HeatmapCells.Clear();
                foreach (var cell in cells)
                {
                    HeatmapCells.Add(cell);
                }
            });
        }

        private async Task LoadComplianceScoresAsync()
        {
            ComplianceScores = await _riskAnalysisService.GetComplianceScoresAsync();
        }

        private async Task LoadOrganizationalScoreAsync()
        {
            OrganizationalRiskScore = await _riskAnalysisService.CalculateOrganizationalRiskScoreAsync();
        }

        private async Task LoadRiskDetailsAsync()
        {
            if (SelectedRisk == null) return;

            try
            {
                // Load mitigation actions for selected risk
                var riskActions = await _riskAnalysisService.GetMitigationActionsForRiskAsync(SelectedRisk.Id);
                var riskIndicators = await _riskAnalysisService.GetIndicatorsForRiskAsync(SelectedRisk.Id);

                App.Current.Dispatcher.Invoke(() =>
                {
                    // Update the risk with its actions and indicators
                    SelectedRisk.MitigationActions.Clear();
                    SelectedRisk.Indicators.Clear();

                    foreach (var action in riskActions)
                        SelectedRisk.MitigationActions.Add(action);

                    foreach (var indicator in riskIndicators)
                        SelectedRisk.Indicators.Add(indicator);
                });
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to load risk details: {ex.Message}";
            }
        }

        #endregion

        #region Search and Filtering

        private async Task SearchRisksAsync()
        {
            try
            {
                List<RiskAssessment> results;
                
                if (string.IsNullOrWhiteSpace(SearchText))
                {
                    results = await _riskAnalysisService.GetAllRiskAssessmentsAsync();
                }
                else
                {
                    results = await _riskAnalysisService.SearchRisksAsync(SearchText);
                }

                App.Current.Dispatcher.Invoke(() =>
                {
                    Risks.Clear();
                    foreach (var risk in results)
                    {
                        Risks.Add(risk);
                    }
                });
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to search risks: {ex.Message}";
            }
        }

        private async Task ApplyFiltersAsync()
        {
            try
            {
                var results = await _riskAnalysisService.FilterRisksAsync(
                    SelectedCategory, SelectedLevel, SelectedStatus, SelectedOwner);

                App.Current.Dispatcher.Invoke(() =>
                {
                    Risks.Clear();
                    foreach (var risk in results)
                    {
                        Risks.Add(risk);
                    }
                });
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to apply filters: {ex.Message}";
            }
        }

        private void ClearFilters()
        {
            SelectedCategory = null;
            SelectedLevel = null;
            SelectedStatus = null;
            SelectedOwner = null;
            SearchText = string.Empty;
        }

        #endregion

        #region Risk Operations

        private void StartCreateRisk()
        {
            NewRiskTitle = string.Empty;
            NewRiskDescription = string.Empty;
            NewRiskCategory = RiskCategory.Technical;
            NewRiskProbability = 0.5;
            NewRiskImpact = 0.5;
            NewRiskOwner = Environment.UserName;
            IsEditingRisk = false;
            ShowRiskEditor = true;
        }

        private void StartEditRisk(RiskAssessment risk)
        {
            if (risk == null) return;

            NewRiskTitle = risk.Title;
            NewRiskDescription = risk.Description;
            NewRiskCategory = risk.Category;
            NewRiskProbability = risk.Probability;
            NewRiskImpact = risk.Impact;
            NewRiskOwner = risk.Owner;
            IsEditingRisk = true;
            ShowRiskEditor = true;
        }

        private async Task SaveRiskAsync()
        {
            try
            {
                if (IsEditingRisk && SelectedRisk != null)
                {
                    SelectedRisk.Title = NewRiskTitle;
                    SelectedRisk.Description = NewRiskDescription;
                    SelectedRisk.Category = NewRiskCategory;
                    SelectedRisk.Probability = NewRiskProbability;
                    SelectedRisk.Impact = NewRiskImpact;
                    SelectedRisk.Owner = NewRiskOwner;

                    await _riskAnalysisService.UpdateRiskAssessmentAsync(SelectedRisk);
                }
                else
                {
                    await _riskAnalysisService.CreateRiskAssessmentAsync(NewRiskTitle, NewRiskDescription, NewRiskCategory);
                }

                ShowRiskEditor = false;
                await LoadRisksAsync();
                await LoadStatisticsAsync();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to save risk: {ex.Message}";
            }
        }

        private void CancelRiskEdit()
        {
            ShowRiskEditor = false;
        }

        private async Task DeleteRiskAsync(RiskAssessment risk)
        {
            try
            {
                if (risk == null) return;

                await _riskAnalysisService.DeleteRiskAssessmentAsync(risk.Id);
                await LoadDataAsync();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to delete risk: {ex.Message}";
            }
        }

        #endregion

        #region Action Operations

        private void StartCreateAction()
        {
            if (SelectedRisk == null)
            {
                ErrorMessage = "Please select a risk first";
                return;
            }

            NewActionAction = string.Empty;
            NewActionDescription = string.Empty;
            NewActionType = MitigationType.Preventive;
            NewActionDueDate = DateTime.Now.AddMonths(3);
            NewActionAssignedTo = Environment.UserName;
            IsEditingAction = false;
            ShowActionEditor = true;
        }

        private void StartEditAction(RiskMitigationAction action)
        {
            if (action == null) return;

            NewActionAction = action.Action;
            NewActionDescription = action.Description;
            NewActionType = action.Type;
            NewActionDueDate = action.DueDate;
            NewActionAssignedTo = action.AssignedTo;
            IsEditingAction = true;
            ShowActionEditor = true;
        }

        private async Task SaveActionAsync()
        {
            try
            {
                if (SelectedRisk == null) return;

                if (IsEditingAction && SelectedAction != null)
                {
                    SelectedAction.Action = NewActionAction;
                    SelectedAction.Description = NewActionDescription;
                    SelectedAction.Type = NewActionType;
                    SelectedAction.DueDate = NewActionDueDate;
                    SelectedAction.AssignedTo = NewActionAssignedTo;

                    await _riskAnalysisService.UpdateMitigationActionAsync(SelectedAction);
                }
                else
                {
                    await _riskAnalysisService.CreateMitigationActionAsync(
                        SelectedRisk.Id, NewActionAction, NewActionDescription, NewActionType);
                }

                ShowActionEditor = false;
                await LoadActionsAsync();
                await LoadRiskDetailsAsync();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to save action: {ex.Message}";
            }
        }

        private void CancelActionEdit()
        {
            ShowActionEditor = false;
        }

        private async Task DeleteActionAsync(RiskMitigationAction action)
        {
            try
            {
                if (action == null) return;

                await _riskAnalysisService.DeleteMitigationActionAsync(action.Id);
                await LoadActionsAsync();
                await LoadRiskDetailsAsync();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to delete action: {ex.Message}";
            }
        }

        #endregion

        #region Indicator Operations

        private void StartCreateIndicator()
        {
            if (SelectedRisk == null)
            {
                ErrorMessage = "Please select a risk first";
                return;
            }

            NewIndicatorName = string.Empty;
            NewIndicatorThreshold = 1.0;
            NewIndicatorUnit = string.Empty;
            IsEditingIndicator = false;
            ShowIndicatorEditor = true;
        }

        private void StartEditIndicator(RiskIndicator indicator)
        {
            if (indicator == null) return;

            NewIndicatorName = indicator.Name;
            NewIndicatorThreshold = indicator.Threshold;
            NewIndicatorUnit = indicator.Unit;
            IsEditingIndicator = true;
            ShowIndicatorEditor = true;
        }

        private async Task SaveIndicatorAsync()
        {
            try
            {
                if (SelectedRisk == null) return;

                if (IsEditingIndicator && SelectedIndicator != null)
                {
                    SelectedIndicator.Name = NewIndicatorName;
                    SelectedIndicator.Threshold = NewIndicatorThreshold;
                    SelectedIndicator.Unit = NewIndicatorUnit;

                    await _riskAnalysisService.UpdateIndicatorAsync(SelectedIndicator);
                }
                else
                {
                    await _riskAnalysisService.CreateIndicatorAsync(
                        SelectedRisk.Id, NewIndicatorName, NewIndicatorThreshold);
                }

                ShowIndicatorEditor = false;
                await LoadIndicatorsAsync();
                await LoadRiskDetailsAsync();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to save indicator: {ex.Message}";
            }
        }

        private void CancelIndicatorEdit()
        {
            ShowIndicatorEditor = false;
        }

        private async Task DeleteIndicatorAsync(RiskIndicator indicator)
        {
            try
            {
                if (indicator == null) return;

                await _riskAnalysisService.DeleteIndicatorAsync(indicator.Id);
                await LoadIndicatorsAsync();
                await LoadRiskDetailsAsync();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to delete indicator: {ex.Message}";
            }
        }

        #endregion

        #region Analysis Operations

        private async Task RunAutomatedAssessmentAsync()
        {
            try
            {
                IsLoading = true;
                var newRisks = await _riskAnalysisService.PerformAutomatedRiskAssessmentAsync();
                
                if (newRisks.Any())
                {
                    await LoadDataAsync();
                    StatusMessage = $"Automated assessment completed. {newRisks.Count} new risks identified.";
                }
                else
                {
                    StatusMessage = "Automated assessment completed. No new risks identified.";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to run automated assessment: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task UpdateRiskLevelsAsync()
        {
            try
            {
                IsLoading = true;
                await _riskAnalysisService.UpdateRiskLevelsBasedOnIndicatorsAsync();
                await LoadDataAsync();
                StatusMessage = "Risk levels updated based on current indicators.";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to update risk levels: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task IdentifyEmergingRisksAsync()
        {
            try
            {
                IsLoading = true;
                var emergingRisks = await _riskAnalysisService.IdentifyEmergingRisksAsync();
                
                if (emergingRisks.Any())
                {
                    await LoadDataAsync();
                    StatusMessage = $"Emerging risk analysis completed. {emergingRisks.Count} emerging risks identified.";
                }
                else
                {
                    StatusMessage = "Emerging risk analysis completed. No emerging risks identified.";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to identify emerging risks: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task GenerateReportAsync()
        {
            try
            {
                var report = await _riskAnalysisService.GenerateRiskReportAsync();
                
                var dialog = new Microsoft.Win32.SaveFileDialog
                {
                    Filter = "Markdown files (*.md)|*.md|Text files (*.txt)|*.txt",
                    DefaultExt = ".md"
                };

                if (dialog.ShowDialog() == true)
                {
                    await System.IO.File.WriteAllTextAsync(dialog.FileName, report);
                    StatusMessage = "Risk report generated successfully.";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to generate report: {ex.Message}";
            }
        }

        #endregion

        #region Import/Export Operations

        private async Task ExportRisksAsync()
        {
            try
            {
                var dialog = new Microsoft.Win32.SaveFileDialog
                {
                    Filter = "JSON files (*.json)|*.json|All files (*.*)|*.*",
                    DefaultExt = ".json"
                };

                if (dialog.ShowDialog() == true)
                {
                    await _riskAnalysisService.ExportRiskAssessmentsAsync(dialog.FileName);
                    StatusMessage = "Risk data exported successfully.";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to export risks: {ex.Message}";
            }
        }

        private async Task ImportRisksAsync()
        {
            try
            {
                var dialog = new Microsoft.Win32.OpenFileDialog
                {
                    Filter = "JSON files (*.json)|*.json|All files (*.*)|*.*"
                };

                if (dialog.ShowDialog() == true)
                {
                    await _riskAnalysisService.ImportRiskAssessmentsAsync(dialog.FileName);
                    await LoadDataAsync();
                    StatusMessage = "Risk data imported successfully.";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to import risks: {ex.Message}";
            }
        }

        #endregion
    }
}