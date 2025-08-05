using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Printing;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using Microsoft.Win32;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for print preview functionality
    /// </summary>
    public partial class PrintPreviewViewModel : BaseViewModel
    {
        private readonly PrintService _printService;
        private readonly NotificationService _notificationService;
        
        // Preview properties
        private ObservableCollection<PrintPreviewPage> _previewPages;
        private object _printContent;
        private string _documentTitle = "Document";
        
        // Page settings
        private string _selectedPageSize = "Letter";
        private string _selectedOrientation = "Portrait";
        private double _zoomLevel = 100;
        private string _viewMode = "Single";
        private int _currentPageIndex = 1;
        
        // Print settings
        private string _printerName = "Default Printer";
        private PrintTicket _currentPrintTicket;
        private PrintQueue _currentPrintQueue;

        public PrintPreviewViewModel() : base()
        {
            _printService = ServiceLocator.GetService<PrintService>();
            _notificationService = ServiceLocator.GetService<NotificationService>();
            _previewPages = new ObservableCollection<PrintPreviewPage>();
            
            InitializeCommands();
            InitializePrintSettings();
            CreateSamplePreview();
        }

        #region Properties

        public ObservableCollection<PrintPreviewPage> PreviewPages
        {
            get => _previewPages;
            set => SetProperty(ref _previewPages, value);
        }

        public string DocumentTitle
        {
            get => _documentTitle;
            set => SetProperty(ref _documentTitle, value);
        }

        public string SelectedPageSize
        {
            get => _selectedPageSize;
            set
            {
                if (SetProperty(ref _selectedPageSize, value))
                {
                    UpdatePreview();
                }
            }
        }

        public string SelectedOrientation
        {
            get => _selectedOrientation;
            set
            {
                if (SetProperty(ref _selectedOrientation, value))
                {
                    UpdatePreview();
                }
            }
        }

        public double ZoomLevel
        {
            get => _zoomLevel;
            set => SetProperty(ref _zoomLevel, Math.Max(25, Math.Min(200, value)));
        }

        public string ViewMode
        {
            get => _viewMode;
            set
            {
                if (SetProperty(ref _viewMode, value))
                {
                    UpdateViewMode();
                }
            }
        }

        public int CurrentPageIndex
        {
            get => _currentPageIndex;
            set => SetProperty(ref _currentPageIndex, Math.Max(1, Math.Min(PageCount, value)));
        }

        public string PrinterName
        {
            get => _printerName;
            set => SetProperty(ref _printerName, value);
        }

        // Computed properties
        public int PageCount => PreviewPages?.Count ?? 0;
        public Orientation PageOrientation => ViewMode == "TwoPages" ? Orientation.Horizontal : Orientation.Vertical;

        // Options for UI
        public List<string> PageSizes { get; } = new List<string>
        {
            "Letter", "Legal", "A4", "A3", "Tabloid", "Executive", "Custom"
        };

        public List<string> OrientationOptions { get; } = new List<string>
        {
            "Portrait", "Landscape"
        };

        #endregion

        #region Commands

        public ICommand PrintCommand { get; private set; }
        public ICommand PageSetupCommand { get; private set; }
        public ICommand ExportCommand { get; private set; }
        public ICommand ZoomInCommand { get; private set; }
        public ICommand ZoomOutCommand { get; private set; }
        public ICommand SetViewModeCommand { get; private set; }
        public ICommand ShowSettingsCommand { get; private set; }
        public ICommand FirstPageCommand { get; private set; }
        public ICommand PreviousPageCommand { get; private set; }
        public ICommand NextPageCommand { get; private set; }
        public ICommand LastPageCommand { get; private set; }

        #endregion

        #region Private Methods

        private void InitializeCommands()
        {
            PrintCommand = new RelayCommand(Print);
            PageSetupCommand = new RelayCommand(ShowPageSetup);
            ExportCommand = new RelayCommand(Export);
            ZoomInCommand = new RelayCommand(ZoomIn);
            ZoomOutCommand = new RelayCommand(ZoomOut);
            SetViewModeCommand = new RelayCommand<string>(SetViewMode);
            ShowSettingsCommand = new RelayCommand(ShowSettings);
            FirstPageCommand = new RelayCommand(GoToFirstPage);
            PreviousPageCommand = new RelayCommand(GoToPreviousPage);
            NextPageCommand = new RelayCommand(GoToNextPage);
            LastPageCommand = new RelayCommand(GoToLastPage);
        }

        private void InitializePrintSettings()
        {
            try
            {
                _currentPrintQueue = _printService.DefaultPrintQueue;
                _currentPrintTicket = _printService.DefaultPrintTicket;
                
                if (_currentPrintQueue != null)
                {
                    PrinterName = _currentPrintQueue.Name;
                }
                
                Logger?.LogDebug("Initialized print settings with printer: {PrinterName}", PrinterName);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error initializing print settings");
            }
        }

        private void CreateSamplePreview()
        {
            try
            {
                // Create sample pages for demonstration
                PreviewPages.Clear();
                
                for (int i = 1; i <= 3; i++)
                {
                    var page = new PrintPreviewPage
                    {
                        PageNumber = i,
                        PageWidth = GetPageWidth(),
                        PageHeight = GetPageHeight(),
                        Header = new PrintPageHeader
                        {
                            Title = DocumentTitle,
                            Subtitle = $"Generated on {DateTime.Now:yyyy-MM-dd}",
                            ShowTitle = true,
                            ShowSubtitle = true,
                            ShowLine = true
                        },
                        Content = CreateSamplePageContent(i),
                        Footer = new PrintPageFooter
                        {
                            LeftText = $"Page {i} of {3}",
                            CenterText = DocumentTitle,
                            RightText = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                            ShowLeftText = true,
                            ShowCenterText = true,
                            ShowRightText = true,
                            ShowLine = true
                        }
                    };
                    
                    PreviewPages.Add(page);
                }
                
                OnPropertyChanged(nameof(PageCount));
                Logger?.LogDebug("Created sample preview with {PageCount} pages", PageCount);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error creating sample preview");
            }
        }

        private object CreateSamplePageContent(int pageNumber)
        {
            var stackPanel = new StackPanel { Margin = new Thickness(0, 20, 0, 0) };
            
            // Title
            var title = new TextBlock
            {
                Text = $"Sample Content - Page {pageNumber}",
                FontSize = 18,
                FontWeight = FontWeights.Bold,
                Margin = new Thickness(0, 0, 0, 16)
            };
            stackPanel.Children.Add(title);
            
            // Content paragraphs
            for (int i = 1; i <= 3; i++)
            {
                var paragraph = new TextBlock
                {
                    Text = $"This is sample paragraph {i} on page {pageNumber}. " +
                           "This demonstrates how content will appear when printed. " +
                           "The text wraps naturally and maintains proper formatting " +
                           "throughout the document layout process.",
                    TextWrapping = TextWrapping.Wrap,
                    Margin = new Thickness(0, 0, 0, 12),
                    LineHeight = 20
                };
                stackPanel.Children.Add(paragraph);
            }
            
            // Sample table
            if (pageNumber == 2)
            {
                var table = new Grid
                {
                    Margin = new Thickness(0, 20, 0, 0)
                };
                
                // Define columns
                table.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
                table.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
                table.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
                
                // Define rows
                for (int row = 0; row < 4; row++)
                {
                    table.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
                }
                
                // Add table content
                var headers = new[] { "Column 1", "Column 2", "Column 3" };
                for (int col = 0; col < 3; col++)
                {
                    var header = new TextBlock
                    {
                        Text = headers[col],
                        FontWeight = FontWeights.Bold,
                        Padding = new Thickness(8),
                        Background = System.Windows.Media.Brushes.LightGray
                    };
                    Grid.SetRow(header, 0);
                    Grid.SetColumn(header, col);
                    table.Children.Add(header);
                }
                
                // Add data rows
                for (int row = 1; row < 4; row++)
                {
                    for (int col = 0; col < 3; col++)
                    {
                        var cell = new TextBlock
                        {
                            Text = $"Data {row}-{col + 1}",
                            Padding = new Thickness(8)
                        };
                        Grid.SetRow(cell, row);
                        Grid.SetColumn(cell, col);
                        table.Children.Add(cell);
                    }
                }
                
                stackPanel.Children.Add(table);
            }
            
            return stackPanel;
        }

        private double GetPageWidth()
        {
            var baseWidth = SelectedPageSize switch
            {
                "Letter" => 816,
                "Legal" => 816,
                "A4" => 794,
                "A3" => 1123,
                "Tabloid" => 1056,
                "Executive" => 720,
                _ => 816
            };
            
            return SelectedOrientation == "Landscape" ? GetPageHeight() : baseWidth;
        }

        private double GetPageHeight()
        {
            var baseHeight = SelectedPageSize switch
            {
                "Letter" => 1056,
                "Legal" => 1344,
                "A4" => 1123,
                "A3" => 1587,
                "Tabloid" => 1632,
                "Executive" => 1008,
                _ => 1056
            };
            
            return SelectedOrientation == "Landscape" ? GetPageWidth() : baseHeight;
        }

        private void UpdatePreview()
        {
            try
            {
                foreach (var page in PreviewPages)
                {
                    page.PageWidth = GetPageWidth();
                    page.PageHeight = GetPageHeight();
                }
                
                Logger?.LogDebug("Updated preview for {PageSize} {Orientation}", SelectedPageSize, SelectedOrientation);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error updating preview");
            }
        }

        private void UpdateViewMode()
        {
            try
            {
                OnPropertyChanged(nameof(PageOrientation));
                Logger?.LogDebug("Updated view mode to: {ViewMode}", ViewMode);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error updating view mode");
            }
        }

        private void Print()
        {
            try
            {
                if (_printContent != null && _printContent is UIElement element)
                {
                    var success = _printService.Print(element, DocumentTitle);
                    
                    if (success)
                    {
                        _notificationService?.AddSuccess(
                            "Print Successful", 
                            $"Document '{DocumentTitle}' sent to printer successfully");
                    }
                    else
                    {
                        _notificationService?.AddError(
                            "Print Failed", 
                            "Failed to send document to printer");
                    }
                    
                    Logger?.LogInformation("Print operation completed: {Success}", success);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error printing document");
                _notificationService?.AddError(
                    "Print Error", 
                    "An error occurred while printing the document");
            }
        }

        private void ShowPageSetup()
        {
            try
            {
                var newTicket = _printService.ShowPageSetupDialog(_currentPrintTicket);
                if (newTicket != null)
                {
                    _currentPrintTicket = newTicket;
                    UpdatePreview();
                    
                    _notificationService?.AddInfo(
                        "Page Setup Updated", 
                        "Page setup settings have been updated");
                }
                
                Logger?.LogDebug("Showed page setup dialog");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing page setup dialog");
            }
        }

        private void Export()
        {
            try
            {
                var dialog = new SaveFileDialog
                {
                    Title = "Export Print Preview",
                    Filter = "XPS Files (*.xps)|*.xps|PDF Files (*.pdf)|*.pdf",
                    DefaultExt = ".xps",
                    FileName = $"{DocumentTitle}.xps"
                };
                
                if (dialog.ShowDialog() == true)
                {
                    if (_printContent is UIElement element)
                    {
                        var success = _printService.ExportToXps(element, dialog.FileName, DocumentTitle);
                        
                        if (success)
                        {
                            _notificationService?.AddSuccess(
                                "Export Successful", 
                                $"Document exported to {dialog.FileName}");
                        }
                        else
                        {
                            _notificationService?.AddError(
                                "Export Failed", 
                                "Failed to export document");
                        }
                    }
                }
                
                Logger?.LogDebug("Export operation initiated");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error exporting document");
            }
        }

        private void ZoomIn()
        {
            ZoomLevel = Math.Min(200, ZoomLevel + 25);
            Logger?.LogDebug("Zoomed in to {ZoomLevel}%", ZoomLevel);
        }

        private void ZoomOut()
        {
            ZoomLevel = Math.Max(25, ZoomLevel - 25);
            Logger?.LogDebug("Zoomed out to {ZoomLevel}%", ZoomLevel);
        }

        private void SetViewMode(string mode)
        {
            ViewMode = mode;
        }

        private void ShowSettings()
        {
            try
            {
                var settings = $"Print Settings:\n" +
                              $"• Document: {DocumentTitle}\n" +
                              $"• Printer: {PrinterName}\n" +
                              $"• Page Size: {SelectedPageSize}\n" +
                              $"• Orientation: {SelectedOrientation}\n" +
                              $"• Pages: {PageCount}\n" +
                              $"• Zoom: {ZoomLevel}%";
                
                _notificationService?.AddInfo("Print Settings", settings);
                Logger?.LogDebug("Showed print settings");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing print settings");
            }
        }

        private void GoToFirstPage()
        {
            CurrentPageIndex = 1;
        }

        private void GoToPreviousPage()
        {
            CurrentPageIndex = Math.Max(1, CurrentPageIndex - 1);
        }

        private void GoToNextPage()
        {
            CurrentPageIndex = Math.Min(PageCount, CurrentPageIndex + 1);
        }

        private void GoToLastPage()
        {
            CurrentPageIndex = PageCount;
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Sets the content to be previewed for printing
        /// </summary>
        public void SetPrintContent(object content, string title = "")
        {
            try
            {
                _printContent = content;
                
                if (!string.IsNullOrEmpty(title))
                {
                    DocumentTitle = title;
                }
                
                // Update preview with actual content
                UpdatePreview();
                
                Logger?.LogDebug("Set print content: {Title}", DocumentTitle);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error setting print content");
            }
        }

        #endregion
    }

    /// <summary>
    /// Represents a page in the print preview
    /// </summary>
    public class PrintPreviewPage : BaseViewModel
    {
        private double _pageWidth = 816;
        private double _pageHeight = 1056;

        public int PageNumber { get; set; }
        
        public double PageWidth
        {
            get => _pageWidth;
            set => SetProperty(ref _pageWidth, value);
        }
        
        public double PageHeight
        {
            get => _pageHeight;
            set => SetProperty(ref _pageHeight, value);
        }
        
        public PrintPageHeader Header { get; set; }
        public object Content { get; set; }
        public PrintPageFooter Footer { get; set; }
    }

    /// <summary>
    /// Print page header configuration
    /// </summary>
    public class PrintPageHeader
    {
        public string Title { get; set; }
        public string Subtitle { get; set; }
        public bool ShowTitle { get; set; }
        public bool ShowSubtitle { get; set; }
        public bool ShowLine { get; set; }
    }

    /// <summary>
    /// Print page footer configuration
    /// </summary>
    public class PrintPageFooter
    {
        public string LeftText { get; set; }
        public string CenterText { get; set; }
        public string RightText { get; set; }
        public bool ShowLeftText { get; set; }
        public bool ShowCenterText { get; set; }
        public bool ShowRightText { get; set; }
        public bool ShowLine { get; set; }
    }
}