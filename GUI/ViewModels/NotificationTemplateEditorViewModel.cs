using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// View model for the notification template editor with comprehensive template management,
    /// token insertion, preview capabilities, and template testing functionality.
    /// Implements T-033 template editor requirements.
    /// </summary>
    public class NotificationTemplateEditorViewModel : INotifyPropertyChanged
    {
        #region Private Fields

        private readonly NotificationTemplateService _templateService;
        private readonly GraphNotificationService _notificationService;
        private readonly ILogger<NotificationTemplateEditorViewModel> _logger;

        private ObservableCollection<NotificationTemplateViewModel> _templates;
        private ObservableCollection<NotificationTemplateViewModel> _filteredTemplates;
        private ObservableCollection<TemplateTokenViewModel> _availableTokens;
        
        private NotificationTemplateViewModel _selectedTemplate;
        private string _searchText;
        private string _selectedTemplateType = "All Types";
        private string _templateTagsText;
        private string _recipientsText;
        
        private bool _isLoading;
        private bool _hasUnsavedChanges;

        #endregion

        #region Constructor

        public NotificationTemplateEditorViewModel(
            NotificationTemplateService templateService = null,
            GraphNotificationService notificationService = null,
            ILogger<NotificationTemplateEditorViewModel> logger = null)
        {
            _templateService = templateService ?? new NotificationTemplateService();
            _notificationService = notificationService ?? new GraphNotificationService();
            _logger = logger;

            InitializeCollections();
            InitializeCommands();
            
            // Load templates on startup
            _ = LoadTemplatesAsync();
        }

        #endregion

        #region Public Properties

        public ObservableCollection<NotificationTemplateViewModel> Templates
        {
            get => _templates;
            set => SetProperty(ref _templates, value);
        }

        public ObservableCollection<NotificationTemplateViewModel> FilteredTemplates
        {
            get => _filteredTemplates;
            set => SetProperty(ref _filteredTemplates, value);
        }

        public ObservableCollection<TemplateTokenViewModel> AvailableTokens
        {
            get => _availableTokens;
            set => SetProperty(ref _availableTokens, value);
        }

        public NotificationTemplateViewModel SelectedTemplate
        {
            get => _selectedTemplate;
            set
            {
                if (SetProperty(ref _selectedTemplate, value))
                {
                    OnTemplateSelectionChanged();
                }
            }
        }

        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    ApplyFilters();
                }
            }
        }

        public string SelectedTemplateType
        {
            get => _selectedTemplateType;
            set
            {
                if (SetProperty(ref _selectedTemplateType, value))
                {
                    ApplyFilters();
                }
            }
        }

        public string TemplateTagsText
        {
            get => _templateTagsText;
            set
            {
                if (SetProperty(ref _templateTagsText, value))
                {
                    UpdateTemplateTags();
                }
            }
        }

        public string RecipientsText
        {
            get => _recipientsText;
            set
            {
                if (SetProperty(ref _recipientsText, value))
                {
                    UpdateTemplateRecipients();
                }
            }
        }

        public bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        public bool HasUnsavedChanges
        {
            get => _hasUnsavedChanges;
            set => SetProperty(ref _hasUnsavedChanges, value);
        }

        public bool IsTemplateSelected => SelectedTemplate != null;

        #endregion

        #region Commands

        public ICommand CreateTemplateCommand { get; private set; }
        public ICommand DuplicateTemplateCommand { get; private set; }
        public ICommand DeleteTemplateCommand { get; private set; }
        public ICommand SaveTemplateCommand { get; private set; }
        public ICommand PreviewTemplateCommand { get; private set; }
        public ICommand TestSendCommand { get; private set; }
        public ICommand InsertTokenCommand { get; private set; }
        public ICommand ImportTemplatesCommand { get; private set; }
        public ICommand ExportTemplatesCommand { get; private set; }

        #endregion

        #region Public Methods

        public async Task LoadTemplatesAsync()
        {
            try
            {
                IsLoading = true;
                
                var templates = await _templateService.LoadTemplatesAsync();
                
                Templates.Clear();
                foreach (var template in templates)
                {
                    var templateViewModel = new NotificationTemplateViewModel(template, _templateService);
                    templateViewModel.PropertyChanged += OnTemplatePropertyChanged;
                    Templates.Add(templateViewModel);
                }

                ApplyFilters();
                
                _logger?.LogInformation("Loaded {Count} notification templates", templates.Count);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading notification templates");
            }
            finally
            {
                IsLoading = false;
            }
        }

        #endregion

        #region Private Methods

        private void InitializeCollections()
        {
            Templates = new ObservableCollection<NotificationTemplateViewModel>();
            FilteredTemplates = new ObservableCollection<NotificationTemplateViewModel>();
            AvailableTokens = new ObservableCollection<TemplateTokenViewModel>();
        }

        private void InitializeCommands()
        {
            CreateTemplateCommand = new AsyncRelayCommand(CreateTemplateAsync);
            DuplicateTemplateCommand = new AsyncRelayCommand(DuplicateTemplateAsync, () => SelectedTemplate != null);
            DeleteTemplateCommand = new AsyncRelayCommand(DeleteTemplateAsync, () => SelectedTemplate != null);
            SaveTemplateCommand = new AsyncRelayCommand(SaveTemplateAsync, () => SelectedTemplate != null && HasUnsavedChanges);
            PreviewTemplateCommand = new AsyncRelayCommand(PreviewTemplateAsync, () => SelectedTemplate != null);
            TestSendCommand = new AsyncRelayCommand(TestSendAsync, () => SelectedTemplate != null);
            InsertTokenCommand = new RelayCommand<string>(InsertToken);
            ImportTemplatesCommand = new AsyncRelayCommand(ImportTemplatesAsync);
            ExportTemplatesCommand = new AsyncRelayCommand(ExportTemplatesAsync);
        }

        private void OnTemplateSelectionChanged()
        {
            if (SelectedTemplate != null)
            {
                // Update UI fields
                TemplateTagsText = SelectedTemplate.Tags != null ? string.Join(", ", SelectedTemplate.Tags) : string.Empty;
                RecipientsText = SelectedTemplate.Recipients != null ? string.Join(", ", SelectedTemplate.Recipients) : string.Empty;
                
                // Load available tokens for this template type
                LoadAvailableTokens();
            }

            OnPropertyChanged(nameof(IsTemplateSelected));
            
            // Update command states
            ((AsyncRelayCommand)DuplicateTemplateCommand).NotifyCanExecuteChanged();
            ((AsyncRelayCommand)DeleteTemplateCommand).NotifyCanExecuteChanged();
            ((AsyncRelayCommand)SaveTemplateCommand).NotifyCanExecuteChanged();
            ((AsyncRelayCommand)PreviewTemplateCommand).NotifyCanExecuteChanged();
            ((AsyncRelayCommand)TestSendCommand).NotifyCanExecuteChanged();
        }

        private void OnTemplatePropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            HasUnsavedChanges = true;
            ((AsyncRelayCommand)SaveTemplateCommand).NotifyCanExecuteChanged();
        }

        private void LoadAvailableTokens()
        {
            if (SelectedTemplate == null)
                return;

            try
            {
                // Parse template type
                if (!Enum.TryParse<NotificationTemplateType>(SelectedTemplate.Type, out var templateType))
                {
                    templateType = NotificationTemplateType.Custom;
                }

                var tokens = _templateService.GetAvailableTokens(templateType);
                
                AvailableTokens.Clear();
                foreach (var token in tokens)
                {
                    AvailableTokens.Add(new TemplateTokenViewModel
                    {
                        Name = token.Name,
                        Description = token.Description,
                        Example = token.Example,
                        IsRequired = token.IsRequired
                    });
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading available tokens for template type {Type}", SelectedTemplate?.Type);
            }
        }

        private void ApplyFilters()
        {
            if (Templates == null)
                return;

            var filtered = Templates.AsEnumerable();

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(SearchText))
            {
                filtered = filtered.Where(t => 
                    (t.Name?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) == true) ||
                    (t.Description?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) == true));
            }

            // Apply type filter
            if (SelectedTemplateType != "All Types")
            {
                filtered = filtered.Where(t => 
                    t.Type?.Equals(SelectedTemplateType.Replace("-", ""), StringComparison.OrdinalIgnoreCase) == true);
            }

            FilteredTemplates.Clear();
            foreach (var template in filtered.OrderBy(t => t.Name))
            {
                FilteredTemplates.Add(template);
            }
        }

        private void UpdateTemplateTags()
        {
            if (SelectedTemplate == null)
                return;

            if (string.IsNullOrWhiteSpace(TemplateTagsText))
            {
                SelectedTemplate.Tags.Clear();
            }
            else
            {
                var tags = TemplateTagsText
                    .Split(',')
                    .Select(tag => tag.Trim())
                    .Where(tag => !string.IsNullOrWhiteSpace(tag))
                    .ToList();

                SelectedTemplate.Tags.Clear();
                foreach (var tag in tags)
                {
                    SelectedTemplate.Tags.Add(tag);
                }
            }

            HasUnsavedChanges = true;
        }

        private void UpdateTemplateRecipients()
        {
            if (SelectedTemplate == null)
                return;

            if (string.IsNullOrWhiteSpace(RecipientsText))
            {
                SelectedTemplate.Recipients.Clear();
            }
            else
            {
                var recipients = RecipientsText
                    .Split(',', '\n')
                    .Select(r => r.Trim())
                    .Where(r => !string.IsNullOrWhiteSpace(r))
                    .ToList();

                SelectedTemplate.Recipients.Clear();
                foreach (var recipient in recipients)
                {
                    SelectedTemplate.Recipients.Add(recipient);
                }
            }

            HasUnsavedChanges = true;
        }

        private async Task CreateTemplateAsync()
        {
            try
            {
                var newTemplate = new NotificationTemplate
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "New Template",
                    Description = "Template description",
                    Type = NotificationTemplateType.Custom,
                    Subject = "Template Subject",
                    Body = "Template body with {UserDisplayName} token example.",
                    IsActive = false,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    CreatedBy = "User"
                };

                var saved = await _templateService.SaveTemplateAsync(newTemplate);
                if (saved)
                {
                    var templateViewModel = new NotificationTemplateViewModel(newTemplate, _templateService);
                    templateViewModel.PropertyChanged += OnTemplatePropertyChanged;
                    
                    Templates.Add(templateViewModel);
                    ApplyFilters();
                    
                    SelectedTemplate = templateViewModel;
                    
                    _logger?.LogInformation("Created new template: {TemplateId}", newTemplate.Id);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating new template");
            }
        }

        private async Task DuplicateTemplateAsync()
        {
            if (SelectedTemplate == null)
                return;

            try
            {
                var duplicatedTemplate = await _templateService.DuplicateTemplateAsync(
                    SelectedTemplate.Id, 
                    $"{SelectedTemplate.Name} (Copy)");

                if (duplicatedTemplate != null)
                {
                    var templateViewModel = new NotificationTemplateViewModel(duplicatedTemplate, _templateService);
                    templateViewModel.PropertyChanged += OnTemplatePropertyChanged;
                    
                    Templates.Add(templateViewModel);
                    ApplyFilters();
                    
                    SelectedTemplate = templateViewModel;
                    
                    _logger?.LogInformation("Duplicated template: {OriginalId} to {NewId}", 
                        SelectedTemplate.Id, duplicatedTemplate.Id);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error duplicating template {TemplateId}", SelectedTemplate?.Id);
            }
        }

        private async Task DeleteTemplateAsync()
        {
            if (SelectedTemplate == null)
                return;

            try
            {
                // TODO: Show confirmation dialog
                var templateId = SelectedTemplate.Id;
                var deleted = await _templateService.DeleteTemplateAsync(templateId);
                
                if (deleted)
                {
                    Templates.Remove(SelectedTemplate);
                    ApplyFilters();
                    
                    SelectedTemplate = null;
                    
                    _logger?.LogInformation("Deleted template: {TemplateId}", templateId);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error deleting template {TemplateId}", SelectedTemplate?.Id);
            }
        }

        private async Task SaveTemplateAsync()
        {
            if (SelectedTemplate == null)
                return;

            try
            {
                SelectedTemplate.UpdatedAt = DateTime.Now;
                var saved = await SelectedTemplate.SaveAsync();
                
                if (saved)
                {
                    HasUnsavedChanges = false;
                    _logger?.LogInformation("Saved template: {TemplateId}", SelectedTemplate.Id);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving template {TemplateId}", SelectedTemplate?.Id);
            }
        }

        private async Task PreviewTemplateAsync()
        {
            if (SelectedTemplate == null)
                return;

            try
            {
                // Parse template type for sample data
                if (!Enum.TryParse<NotificationTemplateType>(SelectedTemplate.Type, out var templateType))
                {
                    templateType = NotificationTemplateType.Custom;
                }

                var sampleData = _notificationService.GetSampleTokenData(templateType);
                var preview = _templateService.CreatePreview(SelectedTemplate.ToNotificationTemplate(), sampleData);

                // TODO: Show preview dialog
                _logger?.LogInformation("Created preview for template: {TemplateId}", SelectedTemplate.Id);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating template preview {TemplateId}", SelectedTemplate?.Id);
            }
        }

        private async Task TestSendAsync()
        {
            if (SelectedTemplate == null)
                return;

            try
            {
                // TODO: Show test send dialog to get recipient email
                var testRecipients = new List<string>(); // Empty - should be provided by user input
                
                // Parse template type for sample data
                if (!Enum.TryParse<NotificationTemplateType>(SelectedTemplate.Type, out var templateType))
                {
                    templateType = NotificationTemplateType.Custom;
                }

                var sampleData = _notificationService.GetSampleTokenData(templateType);
                var result = await _notificationService.SendPreviewAsync(
                    SelectedTemplate.Id, 
                    testRecipients, 
                    sampleData);

                if (result.Success)
                {
                    _logger?.LogInformation("Test notification sent for template: {TemplateId}", SelectedTemplate.Id);
                }
                else
                {
                    _logger?.LogError("Failed to send test notification: {Error}", result.ErrorMessage);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error sending test notification {TemplateId}", SelectedTemplate?.Id);
            }
        }

        private void InsertToken(string tokenName)
        {
            if (string.IsNullOrWhiteSpace(tokenName))
                return;

            // TODO: Insert token at cursor position in the currently focused text box
            // For now, just log the action
            _logger?.LogInformation("Token insertion requested: {TokenName}", tokenName);
        }

        private async Task ImportTemplatesAsync()
        {
            try
            {
                // TODO: Show file dialog and import templates
                _logger?.LogInformation("Template import requested");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error importing templates");
            }
        }

        private async Task ExportTemplatesAsync()
        {
            try
            {
                // TODO: Show file dialog and export templates
                _logger?.LogInformation("Template export requested");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error exporting templates");
            }
        }

        #endregion

        #region INotifyPropertyChanged

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        #endregion
    }

    #region Supporting Classes

    public class NotificationTemplateViewModel : INotifyPropertyChanged
    {
        private readonly NotificationTemplate _template;
        private readonly NotificationTemplateService _templateService;

        public NotificationTemplateViewModel(NotificationTemplate template, NotificationTemplateService templateService)
        {
            _template = template ?? throw new ArgumentNullException(nameof(template));
            _templateService = templateService;
            
            Tags = new ObservableCollection<string>(template.Tags ?? new List<string>());
            Recipients = new ObservableCollection<string>(template.Recipients ?? new List<string>());
        }

        public string Id 
        { 
            get => _template.Id; 
            set 
            { 
                _template.Id = value; 
                OnPropertyChanged(); 
            } 
        }

        public string Name 
        { 
            get => _template.Name; 
            set 
            { 
                _template.Name = value; 
                OnPropertyChanged(); 
            } 
        }

        public string Description 
        { 
            get => _template.Description; 
            set 
            { 
                _template.Description = value; 
                OnPropertyChanged(); 
            } 
        }

        public string Type 
        { 
            get => _template.Type.ToString(); 
            set 
            { 
                if (Enum.TryParse<NotificationTemplateType>(value, out var type))
                {
                    _template.Type = type;
                    OnPropertyChanged();
                }
            } 
        }

        public string Subject 
        { 
            get => _template.Subject; 
            set 
            { 
                _template.Subject = value; 
                OnPropertyChanged(); 
            } 
        }

        public string Body 
        { 
            get => _template.Body; 
            set 
            { 
                _template.Body = value; 
                OnPropertyChanged(); 
            } 
        }

        public bool IsActive 
        { 
            get => _template.IsActive; 
            set 
            { 
                _template.IsActive = value; 
                OnPropertyChanged(); 
            } 
        }

        public DateTime CreatedAt => _template.CreatedAt;

        public DateTime UpdatedAt 
        { 
            get => _template.UpdatedAt; 
            set 
            { 
                _template.UpdatedAt = value; 
                OnPropertyChanged(); 
            } 
        }

        public ObservableCollection<string> Tags { get; }
        public ObservableCollection<string> Recipients { get; }

        public async Task<bool> SaveAsync()
        {
            // Update template with current values
            _template.Tags = Tags.ToList();
            _template.Recipients = Recipients.ToList();
            
            return await _templateService.SaveTemplateAsync(_template);
        }

        public NotificationTemplate ToNotificationTemplate()
        {
            // Update template with current values
            _template.Tags = Tags.ToList();
            _template.Recipients = Recipients.ToList();
            return _template;
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class TemplateTokenViewModel
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string Example { get; set; }
        public bool IsRequired { get; set; }
    }

    #endregion
}