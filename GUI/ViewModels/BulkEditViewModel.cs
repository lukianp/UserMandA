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
    /// ViewModel for bulk edit operations across different data types
    /// </summary>
    public class BulkEditViewModel : BaseViewModel
    {
        private readonly INotesTaggingService _notesTaggingService;
        private readonly IRiskAnalysisService _riskAnalysisService;
        private readonly IWhatIfSimulationService _whatIfService;
        private readonly CsvDataService _csvDataService;
        
        // Data collections
        private ObservableCollection<BulkEditItem> _availableItems;
        private ObservableCollection<BulkEditItem> _selectedItems;
        private ObservableCollection<BulkEditOperation> _availableOperations;
        
        // Operation configuration
        private BulkEditOperation _selectedOperation;
        private string _operationValue;
        private BulkEditCategory _selectedCategory;
        
        // Progress tracking
        private bool _isProcessing;
        private double _progressPercentage;
        private string _progressStatus;
        private ObservableCollection<BulkEditResult> _operationHistory;

        public BulkEditViewModel(
            INotesTaggingService notesTaggingService = null,
            IRiskAnalysisService riskAnalysisService = null,
            IWhatIfSimulationService whatIfService = null,
            CsvDataService csvDataService = null) : base()
        {
            _notesTaggingService = notesTaggingService ?? SimpleServiceLocator.GetService<INotesTaggingService>();
            _riskAnalysisService = riskAnalysisService ?? SimpleServiceLocator.GetService<IRiskAnalysisService>();
            _whatIfService = whatIfService ?? SimpleServiceLocator.GetService<IWhatIfSimulationService>();
            _csvDataService = csvDataService ?? SimpleServiceLocator.GetService<CsvDataService>();
            
            InitializeCollections();
            InitializeCommands();
            InitializeOperations();
        }

        #region Properties

        public ObservableCollection<BulkEditItem> AvailableItems
        {
            get => _availableItems;
            set => SetProperty(ref _availableItems, value);
        }

        public ObservableCollection<BulkEditItem> SelectedItems
        {
            get => _selectedItems;
            set => SetProperty(ref _selectedItems, value);
        }

        public ObservableCollection<BulkEditOperation> AvailableOperations
        {
            get => _availableOperations;
            set => SetProperty(ref _availableOperations, value);
        }

        public BulkEditOperation SelectedOperation
        {
            get => _selectedOperation;
            set
            {
                SetProperty(ref _selectedOperation, value);
                OnPropertyChanged(nameof(RequiresValue));
                OnPropertyChanged(nameof(OperationDescription));
            }
        }

        public string OperationValue
        {
            get => _operationValue;
            set => SetProperty(ref _operationValue, value);
        }

        public BulkEditCategory SelectedCategory
        {
            get => _selectedCategory;
            set
            {
                SetProperty(ref _selectedCategory, value);
                _ = LoadItemsForCategoryAsync();
            }
        }

        public bool IsProcessing
        {
            get => _isProcessing;
            set => SetProperty(ref _isProcessing, value);
        }

        public double ProgressPercentage
        {
            get => _progressPercentage;
            set => SetProperty(ref _progressPercentage, value);
        }

        public string ProgressStatus
        {
            get => _progressStatus;
            set => SetProperty(ref _progressStatus, value);
        }

        public ObservableCollection<BulkEditResult> OperationHistory
        {
            get => _operationHistory;
            set => SetProperty(ref _operationHistory, value);
        }

        // Computed properties
        public bool RequiresValue => SelectedOperation?.RequiresValue ?? false;
        public string OperationDescription => SelectedOperation?.Description ?? "";
        public Array BulkEditCategories => Enum.GetValues(typeof(BulkEditCategory));

        #endregion

        #region Commands

        public ICommand LoadCategoryCommand { get; private set; }
        public ICommand SelectAllItemsCommand { get; private set; }
        public ICommand ClearSelectionCommand { get; private set; }
        public ICommand PreviewOperationCommand { get; private set; }
        public ICommand ExecuteOperationCommand { get; private set; }
        public ICommand CancelOperationCommand { get; private set; }
        public ICommand ClearHistoryCommand { get; private set; }
        public ICommand RefreshItemsCommand { get; private set; }

        #endregion

        #region Initialization

        private void InitializeCollections()
        {
            AvailableItems = new ObservableCollection<BulkEditItem>();
            SelectedItems = new ObservableCollection<BulkEditItem>();
            AvailableOperations = new ObservableCollection<BulkEditOperation>();
            OperationHistory = new ObservableCollection<BulkEditResult>();
            
            SelectedCategory = BulkEditCategory.Notes;
        }

        protected override void InitializeCommands()
        {
            LoadCategoryCommand = new AsyncRelayCommand<BulkEditCategory?>(LoadCategoryAsync);
            SelectAllItemsCommand = new RelayCommand(SelectAllItems);
            ClearSelectionCommand = new RelayCommand(ClearSelection);
            PreviewOperationCommand = new AsyncRelayCommand(PreviewOperationAsync);
            ExecuteOperationCommand = new AsyncRelayCommand(ExecuteOperationAsync);
            CancelOperationCommand = new RelayCommand(CancelOperation);
            ClearHistoryCommand = new RelayCommand(ClearHistory);
            RefreshItemsCommand = new AsyncRelayCommand(RefreshItemsAsync);
        }

        private void InitializeOperations()
        {
            AvailableOperations.Add(new BulkEditOperation
            {
                Id = "add-tag",
                Name = "Add Tag",
                Description = "Add a tag to selected items",
                RequiresValue = true,
                SupportedCategories = new[] { BulkEditCategory.Notes, BulkEditCategory.Risks, BulkEditCategory.DiscoveryData }
            });

            AvailableOperations.Add(new BulkEditOperation
            {
                Id = "remove-tag",
                Name = "Remove Tag",
                Description = "Remove a tag from selected items",
                RequiresValue = true,
                SupportedCategories = new[] { BulkEditCategory.Notes, BulkEditCategory.Risks, BulkEditCategory.DiscoveryData }
            });

            AvailableOperations.Add(new BulkEditOperation
            {
                Id = "update-status",
                Name = "Update Status",
                Description = "Update status of selected items",
                RequiresValue = true,
                SupportedCategories = new[] { BulkEditCategory.Risks, BulkEditCategory.Simulations }
            });

            AvailableOperations.Add(new BulkEditOperation
            {
                Id = "set-owner",
                Name = "Set Owner",
                Description = "Set owner for selected items",
                RequiresValue = true,
                SupportedCategories = new[] { BulkEditCategory.Risks, BulkEditCategory.Simulations }
            });

            AvailableOperations.Add(new BulkEditOperation
            {
                Id = "set-priority",
                Name = "Set Priority",
                Description = "Set priority level for selected items",
                RequiresValue = true,
                SupportedCategories = new[] { BulkEditCategory.Notes, BulkEditCategory.Risks }
            });

            AvailableOperations.Add(new BulkEditOperation
            {
                Id = "archive",
                Name = "Archive",
                Description = "Archive selected items",
                RequiresValue = false,
                SupportedCategories = new[] { BulkEditCategory.Notes, BulkEditCategory.Risks, BulkEditCategory.Simulations }
            });

            AvailableOperations.Add(new BulkEditOperation
            {
                Id = "delete",
                Name = "Delete",
                Description = "Delete selected items (cannot be undone)",
                RequiresValue = false,
                SupportedCategories = new[] { BulkEditCategory.Notes, BulkEditCategory.Risks, BulkEditCategory.Simulations }
            });

            AvailableOperations.Add(new BulkEditOperation
            {
                Id = "export",
                Name = "Export",
                Description = "Export selected items to file",
                RequiresValue = true,
                SupportedCategories = new[] { BulkEditCategory.Notes, BulkEditCategory.Risks, BulkEditCategory.Simulations, BulkEditCategory.DiscoveryData }
            });
        }

        #endregion

        #region Data Loading

        private async Task LoadCategoryAsync(BulkEditCategory? category = null)
        {
            var targetCategory = category ?? SelectedCategory;
            
            try
            {
                IsLoading = true;
                AvailableItems.Clear();
                SelectedItems.Clear();

                switch (targetCategory)
                {
                    case BulkEditCategory.Notes:
                        await LoadNotesAsync();
                        break;
                    case BulkEditCategory.Risks:
                        await LoadRisksAsync();
                        break;
                    case BulkEditCategory.Simulations:
                        await LoadSimulationsAsync();
                        break;
                    case BulkEditCategory.DiscoveryData:
                        await LoadDiscoveryDataAsync();
                        break;
                }

                StatusMessage = $"Loaded {AvailableItems.Count} {targetCategory} items";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to load {targetCategory} data: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task LoadItemsForCategoryAsync()
        {
            await LoadCategoryAsync(SelectedCategory);
        }

        private async Task LoadNotesAsync()
        {
            if (_notesTaggingService == null) return;

            var notes = await _notesTaggingService.GetAllNotesAsync();
            foreach (var note in notes)
            {
                AvailableItems.Add(new BulkEditItem
                {
                    Id = note.Id,
                    Name = note.Title,
                    Description = note.Content,
                    Category = BulkEditCategory.Notes,
                    Type = "Note",
                    Status = note.IsPinned ? "Pinned" : "Normal",
                    Owner = note.CreatedBy,
                    LastModified = note.LastModified,
                    Tags = note.Tags ?? new List<string>(),
                    Data = note
                });
            }
        }

        private async Task LoadRisksAsync()
        {
            if (_riskAnalysisService == null) return;

            var risks = await _riskAnalysisService.GetAllRiskAssessmentsAsync();
            foreach (var risk in risks)
            {
                AvailableItems.Add(new BulkEditItem
                {
                    Id = risk.Id,
                    Name = risk.Title,
                    Description = risk.Description,
                    Category = BulkEditCategory.Risks,
                    Type = "Risk Assessment",
                    Status = risk.Status.ToString(),
                    Owner = risk.Owner,
                    LastModified = risk.LastAssessed,
                    Tags = new List<string>(), // Risk assessments don't have tags by default
                    Data = risk
                });
            }
        }

        private async Task LoadSimulationsAsync()
        {
            if (_whatIfService == null) return;

            var simulations = await _whatIfService.GetAllSimulationsAsync();
            foreach (var simulation in simulations)
            {
                AvailableItems.Add(new BulkEditItem
                {
                    Id = simulation.Id,
                    Name = simulation.Name,
                    Description = simulation.Description,
                    Category = BulkEditCategory.Simulations,
                    Type = "What-If Simulation",
                    Status = "Active", // Simulations don't have explicit status
                    Owner = simulation.CreatedBy,
                    LastModified = simulation.CreatedDate,
                    Tags = new List<string>(), // Simulations don't have tags by default
                    Data = simulation
                });
            }
        }

        private async Task LoadDiscoveryDataAsync()
        {
            // For discovery data, we'll create placeholder items since we don't have direct access
            // to the discovery data structure. In a real implementation, this would load from
            // the appropriate discovery data services.
            
            await Task.Delay(100); // Simulate loading

            // Add placeholder discovery data items
            var categories = new[] { "Users", "Groups", "Infrastructure", "Applications" };
            var random = new Random();

            foreach (var category in categories)
            {
                for (int i = 1; i <= random.Next(5, 15); i++)
                {
                    AvailableItems.Add(new BulkEditItem
                    {
                        Id = $"{category.ToLower()}-{i}",
                        Name = $"{category} Item {i}",
                        Description = $"Discovery data for {category.ToLower()} item {i}",
                        Category = BulkEditCategory.DiscoveryData,
                        Type = category,
                        Status = "Discovered",
                        Owner = "Discovery Service",
                        LastModified = DateTime.Now.AddDays(-random.Next(1, 30)),
                        Tags = new List<string> { category.ToLower(), "discovered" },
                        Data = new { Category = category, ItemNumber = i }
                    });
                }
            }
        }

        #endregion

        #region Operations

        private void SelectAllItems()
        {
            SelectedItems.Clear();
            foreach (var item in AvailableItems)
            {
                SelectedItems.Add(item);
                item.IsSelected = true;
            }
        }

        private void ClearSelection()
        {
            foreach (var item in AvailableItems)
            {
                item.IsSelected = false;
            }
            SelectedItems.Clear();
        }

        private async Task PreviewOperationAsync()
        {
            if (SelectedOperation == null)
            {
                ErrorMessage = "Please select an operation";
                return;
            }

            if (!SelectedItems.Any())
            {
                ErrorMessage = "Please select items to preview";
                return;
            }

            if (SelectedOperation.RequiresValue && string.IsNullOrWhiteSpace(OperationValue))
            {
                ErrorMessage = "Please provide a value for this operation";
                return;
            }

            try
            {
                IsLoading = true;
                var affectedItems = SelectedItems.Count;
                var preview = GenerateOperationPreview();
                
                StatusMessage = $"Preview: {SelectedOperation.Name} will affect {affectedItems} items. {preview}";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Preview failed: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private string GenerateOperationPreview()
        {
            return SelectedOperation.Id switch
            {
                "add-tag" => $"Tag '{OperationValue}' will be added to {SelectedItems.Count} items",
                "remove-tag" => $"Tag '{OperationValue}' will be removed from {SelectedItems.Count} items",
                "update-status" => $"Status will be changed to '{OperationValue}' for {SelectedItems.Count} items",
                "set-owner" => $"Owner will be set to '{OperationValue}' for {SelectedItems.Count} items",
                "set-priority" => $"Priority will be set to '{OperationValue}' for {SelectedItems.Count} items",
                "archive" => $"{SelectedItems.Count} items will be archived",
                "delete" => $"{SelectedItems.Count} items will be permanently deleted",
                "export" => $"{SelectedItems.Count} items will be exported to '{OperationValue}'",
                _ => "Operation will be applied to selected items"
            };
        }

        private async Task ExecuteOperationAsync()
        {
            if (SelectedOperation == null)
            {
                ErrorMessage = "Please select an operation";
                return;
            }

            if (!SelectedItems.Any())
            {
                ErrorMessage = "Please select items to process";
                return;
            }

            if (SelectedOperation.RequiresValue && string.IsNullOrWhiteSpace(OperationValue))
            {
                ErrorMessage = "Please provide a value for this operation";
                return;
            }

            try
            {
                IsProcessing = true;
                ProgressPercentage = 0;
                ProgressStatus = "Starting bulk operation...";

                var result = new BulkEditResult
                {
                    Id = Guid.NewGuid().ToString(),
                    Operation = SelectedOperation.Name,
                    Category = SelectedCategory.ToString(),
                    StartTime = DateTime.Now,
                    TotalItems = SelectedItems.Count,
                    Value = OperationValue
                };

                var processedCount = 0;
                var errors = new List<string>();

                foreach (var item in SelectedItems.ToList())
                {
                    ProgressStatus = $"Processing {item.Name}...";
                    
                    try
                    {
                        await ProcessItemAsync(item, SelectedOperation, OperationValue);
                        processedCount++;
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Failed to process {item.Name}: {ex.Message}");
                    }

                    ProgressPercentage = (double)processedCount / SelectedItems.Count * 100;
                }

                result.EndTime = DateTime.Now;
                result.ProcessedItems = processedCount;
                result.Errors = errors;
                result.Status = errors.Any() ? "Completed with errors" : "Completed";

                OperationHistory.Insert(0, result);
                
                if (errors.Any())
                {
                    ErrorMessage = $"Operation completed with {errors.Count} errors. Check operation history for details.";
                }
                else
                {
                    StatusMessage = $"Successfully processed {processedCount} items.";
                }

                // Refresh the data to show changes
                await LoadItemsForCategoryAsync();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Bulk operation failed: {ex.Message}";
            }
            finally
            {
                IsProcessing = false;
                ProgressPercentage = 0;
                ProgressStatus = "";
            }
        }

        private async Task ProcessItemAsync(BulkEditItem item, BulkEditOperation operation, string value)
        {
            switch (item.Category)
            {
                case BulkEditCategory.Notes:
                    await ProcessNoteItemAsync(item, operation, value);
                    break;
                case BulkEditCategory.Risks:
                    await ProcessRiskItemAsync(item, operation, value);
                    break;
                case BulkEditCategory.Simulations:
                    await ProcessSimulationItemAsync(item, operation, value);
                    break;
                case BulkEditCategory.DiscoveryData:
                    await ProcessDiscoveryItemAsync(item, operation, value);
                    break;
            }
        }

        private async Task ProcessNoteItemAsync(BulkEditItem item, BulkEditOperation operation, string value)
        {
            if (_notesTaggingService == null || !(item.Data is Note note)) return;

            switch (operation.Id)
            {
                case "add-tag":
                    await _notesTaggingService.AddTagToNoteAsync(item.Id, value);
                    break;
                case "remove-tag":
                    await _notesTaggingService.RemoveTagFromNoteAsync(item.Id, value);
                    break;
                case "set-priority":
                    if (Enum.TryParse<NotePriority>(value, out var priority))
                    {
                        note.Priority = priority;
                        await _notesTaggingService.UpdateNoteAsync(note);
                    }
                    break;
                case "archive":
                    // Notes don't have an IsArchived property - this would be a custom implementation
                    // For now, just mark as complete without doing anything
                    break;
                case "delete":
                    await _notesTaggingService.DeleteNoteAsync(item.Id);
                    break;
            }
        }

        private async Task ProcessRiskItemAsync(BulkEditItem item, BulkEditOperation operation, string value)
        {
            if (_riskAnalysisService == null || !(item.Data is RiskAssessment risk)) return;

            switch (operation.Id)
            {
                case "update-status":
                    if (Enum.TryParse<RiskStatus>(value, out var status))
                    {
                        risk.Status = status;
                        await _riskAnalysisService.UpdateRiskAssessmentAsync(risk);
                    }
                    break;
                case "set-owner":
                    risk.Owner = value;
                    await _riskAnalysisService.UpdateRiskAssessmentAsync(risk);
                    break;
                case "delete":
                    await _riskAnalysisService.DeleteRiskAssessmentAsync(item.Id);
                    break;
            }
        }

        private async Task ProcessSimulationItemAsync(BulkEditItem item, BulkEditOperation operation, string value)
        {
            if (_whatIfService == null) return;

            switch (operation.Id)
            {
                case "set-owner":
                    // Would need to implement owner setting in simulation service
                    break;
                case "delete":
                    await _whatIfService.DeleteSimulationAsync(item.Id);
                    break;
            }
        }

        private async Task ProcessDiscoveryItemAsync(BulkEditItem item, BulkEditOperation operation, string value)
        {
            // Discovery data operations would be implemented based on the specific
            // discovery data services available
            await Task.Delay(10); // Simulate processing
        }

        private void CancelOperation()
        {
            IsProcessing = false;
            ProgressPercentage = 0;
            ProgressStatus = "Operation cancelled";
        }

        private void ClearHistory()
        {
            OperationHistory.Clear();
            StatusMessage = "Operation history cleared";
        }

        private async Task RefreshItemsAsync()
        {
            await LoadItemsForCategoryAsync();
        }

        #endregion
    }

    #region Supporting Classes

    public class BulkEditItem : BaseViewModel
    {
        private bool _isSelected;

        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public BulkEditCategory Category { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }
        public string Owner { get; set; }
        public DateTime LastModified { get; set; }
        public List<string> Tags { get; set; }
        public object Data { get; set; }

        public bool IsSelected
        {
            get => _isSelected;
            set => SetProperty(ref _isSelected, value);
        }
    }

    public class BulkEditOperation
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool RequiresValue { get; set; }
        public BulkEditCategory[] SupportedCategories { get; set; }
    }

    public class BulkEditResult
    {
        public string Id { get; set; }
        public string Operation { get; set; }
        public string Category { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int TotalItems { get; set; }
        public int ProcessedItems { get; set; }
        public string Value { get; set; }
        public string Status { get; set; }
        public List<string> Errors { get; set; }

        public BulkEditResult()
        {
            Errors = new List<string>();
        }

        public TimeSpan Duration => (EndTime ?? DateTime.Now) - StartTime;
    }

    public enum BulkEditCategory
    {
        Notes,
        Risks,
        Simulations,
        DiscoveryData
    }

    #endregion
}