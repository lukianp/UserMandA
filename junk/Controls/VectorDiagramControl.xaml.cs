using System;
using System.ComponentModel;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Microsoft.Win32;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Vector diagram control for displaying scalable diagrams and logos
    /// </summary>
    public partial class VectorDiagramControl : UserControl, INotifyPropertyChanged
    {
        private DiagramType _currentDiagramType = DiagramType.ProcessFlow;
        private double _currentZoom = 1.0;

        public VectorDiagramControl()
        {
            InitializeComponent();
            DataContext = this;
            LoadDiagram(DiagramType.ProcessFlow);
        }

        #region Dependency Properties

        public static readonly DependencyProperty DiagramTypeProperty =
            DependencyProperty.Register("DiagramType", typeof(DiagramType), typeof(VectorDiagramControl),
                new PropertyMetadata(DiagramType.ProcessFlow, OnDiagramTypeChanged));

        public static readonly DependencyProperty TitleProperty =
            DependencyProperty.Register("Title", typeof(string), typeof(VectorDiagramControl),
                new PropertyMetadata("Diagram", OnTitleChanged));

        public static readonly DependencyProperty DescriptionProperty =
            DependencyProperty.Register("Description", typeof(string), typeof(VectorDiagramControl),
                new PropertyMetadata("Vector diagram", OnDescriptionChanged));

        public static readonly DependencyProperty IsInteractiveProperty =
            DependencyProperty.Register("IsInteractive", typeof(bool), typeof(VectorDiagramControl),
                new PropertyMetadata(false, OnIsInteractiveChanged));

        public static readonly DependencyProperty ShowControlsProperty =
            DependencyProperty.Register("ShowControls", typeof(bool), typeof(VectorDiagramControl),
                new PropertyMetadata(true, OnShowControlsChanged));

        #endregion

        #region Properties

        /// <summary>
        /// Gets or sets the diagram type to display
        /// </summary>
        public DiagramType DiagramType
        {
            get { return (DiagramType)GetValue(DiagramTypeProperty); }
            set { SetValue(DiagramTypeProperty, value); }
        }

        /// <summary>
        /// Gets or sets the diagram title
        /// </summary>
        public string Title
        {
            get { return (string)GetValue(TitleProperty); }
            set { SetValue(TitleProperty, value); }
        }

        /// <summary>
        /// Gets or sets the diagram description
        /// </summary>
        public string Description
        {
            get { return (string)GetValue(DescriptionProperty); }
            set { SetValue(DescriptionProperty, value); }
        }

        /// <summary>
        /// Gets or sets whether the diagram supports interactive features
        /// </summary>
        public bool IsInteractive
        {
            get { return (bool)GetValue(IsInteractiveProperty); }
            set { SetValue(IsInteractiveProperty, value); }
        }

        /// <summary>
        /// Gets or sets whether to show the control bar
        /// </summary>
        public bool ShowControls
        {
            get { return (bool)GetValue(ShowControlsProperty); }
            set { SetValue(ShowControlsProperty, value); }
        }

        /// <summary>
        /// Gets the current zoom level
        /// </summary>
        public double CurrentZoom
        {
            get { return _currentZoom; }
            private set
            {
                _currentZoom = value;
                ZoomLevelText.Text = $"{(int)(_currentZoom * 100)}%";
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(CurrentZoom)));
            }
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Loads a specific diagram type
        /// </summary>
        public void LoadDiagram(DiagramType diagramType)
        {
            ShowLoading();
            
            _currentDiagramType = diagramType;
            
            // Simulate loading delay for demonstration
            Dispatcher.BeginInvoke(new Action(() =>
            {
                var diagramInfo = GetDiagramInfo(diagramType);
                
                MainDiagram.Source = diagramInfo.ImageSource;
                DiagramTitle.Text = diagramInfo.Title;
                DiagramDescription.Text = diagramInfo.Description;
                DiagramIcon.Source = diagramInfo.IconSource;
                
                UpdateInteractiveHotspots(diagramType);
                HideLoading();
                
            }), System.Windows.Threading.DispatcherPriority.Background);
        }

        /// <summary>
        /// Sets the zoom level
        /// </summary>
        public void SetZoom(double zoomLevel)
        {
            zoomLevel = Math.Max(0.1, Math.Min(5.0, zoomLevel)); // Clamp between 10% and 500%
            
            var scaleTransform = DiagramContainer.RenderTransform as ScaleTransform ?? new ScaleTransform();
            scaleTransform.ScaleX = zoomLevel;
            scaleTransform.ScaleY = zoomLevel;
            DiagramContainer.RenderTransform = scaleTransform;
            
            CurrentZoom = zoomLevel;
        }

        /// <summary>
        /// Exports the diagram to a PNG file
        /// </summary>
        public void ExportToPng(string filePath)
        {
            try
            {
                var renderTargetBitmap = new RenderTargetBitmap(
                    (int)DiagramContainer.ActualWidth,
                    (int)DiagramContainer.ActualHeight,
                    96, 96, PixelFormats.Pbgra32);
                
                renderTargetBitmap.Render(DiagramContainer);
                
                var encoder = new PngBitmapEncoder();
                encoder.Frames.Add(BitmapFrame.Create(renderTargetBitmap));
                
                using var fileStream = new FileStream(filePath, FileMode.Create);
                encoder.Save(fileStream);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to export diagram: {ex.Message}", "Export Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        #endregion

        #region Private Methods

        private void ShowLoading()
        {
            LoadingOverlay.Visibility = Visibility.Visible;
        }

        private void HideLoading()
        {
            LoadingOverlay.Visibility = Visibility.Collapsed;
        }

        private DiagramInfo GetDiagramInfo(DiagramType diagramType)
        {
            return diagramType switch
            {
                DiagramType.ProcessFlow => new DiagramInfo
                {
                    Title = "Process Flow Diagram",
                    Description = "Visual representation of process flow",
                    ImageSource = (ImageSource)FindResource("ProcessFlowDiagram"),
                    IconSource = (ImageSource)FindResource("ProcessFlowDiagram")
                },
                DiagramType.OrganizationChart => new DiagramInfo
                {
                    Title = "Organization Chart",
                    Description = "Company organizational structure",
                    ImageSource = (ImageSource)FindResource("OrganizationChart"),
                    IconSource = (ImageSource)FindResource("OrganizationChart")
                },
                DiagramType.DataFlow => new DiagramInfo
                {
                    Title = "Data Flow Diagram",
                    Description = "Data flow and processing visualization",
                    ImageSource = (ImageSource)FindResource("DataFlowDiagram"),
                    IconSource = (ImageSource)FindResource("DataFlowDiagram")
                },
                DiagramType.NetworkTopology => new DiagramInfo
                {
                    Title = "Network Topology",
                    Description = "Network infrastructure layout",
                    ImageSource = (ImageSource)FindResource("NetworkTopology"),
                    IconSource = (ImageSource)FindResource("NetworkTopology")
                },
                DiagramType.Timeline => new DiagramInfo
                {
                    Title = "Timeline Diagram",
                    Description = "Project timeline and milestones",
                    ImageSource = (ImageSource)FindResource("TimelineDiagram"),
                    IconSource = (ImageSource)FindResource("TimelineDiagram")
                },
                DiagramType.CompanyLogo => new DiagramInfo
                {
                    Title = "Company Logo",
                    Description = "M&A Discovery Suite Logo",
                    ImageSource = (ImageSource)FindResource("CompanyLogoVector"),
                    IconSource = (ImageSource)FindResource("CompanyLogoVector")
                },
                _ => new DiagramInfo
                {
                    Title = "Unknown Diagram",
                    Description = "Diagram type not recognized",
                    ImageSource = (ImageSource)FindResource("DiscoverySuiteIcon"),
                    IconSource = (ImageSource)FindResource("DiscoverySuiteIcon")
                }
            };
        }

        private void UpdateInteractiveHotspots(DiagramType diagramType)
        {
            // Hide all hotspots first
            Hotspot1.Visibility = Visibility.Collapsed;
            Hotspot2.Visibility = Visibility.Collapsed;
            Hotspot3.Visibility = Visibility.Collapsed;

            // Show hotspots based on diagram type and interactive mode
            if (IsInteractive && InteractiveModeCheckBox.IsChecked == true)
            {
                switch (diagramType)
                {
                    case DiagramType.ProcessFlow:
                        Hotspot1.Visibility = Visibility.Visible;
                        Hotspot2.Visibility = Visibility.Visible;
                        Hotspot3.Visibility = Visibility.Visible;
                        Canvas.SetLeft(Hotspot1, 50);
                        Canvas.SetTop(Hotspot1, 30);
                        Canvas.SetLeft(Hotspot2, 170);
                        Canvas.SetTop(Hotspot2, 30);
                        Canvas.SetLeft(Hotspot3, 290);
                        Canvas.SetTop(Hotspot3, 30);
                        break;

                    case DiagramType.OrganizationChart:
                        Hotspot1.Visibility = Visibility.Visible;
                        Hotspot2.Visibility = Visibility.Visible;
                        Canvas.SetLeft(Hotspot1, 200);
                        Canvas.SetTop(Hotspot1, 40);
                        Canvas.SetLeft(Hotspot2, 90);
                        Canvas.SetTop(Hotspot2, 120);
                        break;
                }
            }
        }

        #endregion

        #region Event Handlers

        private static void OnDiagramTypeChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is VectorDiagramControl control)
            {
                control.LoadDiagram((DiagramType)e.NewValue);
            }
        }

        private static void OnTitleChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is VectorDiagramControl control)
            {
                control.DiagramTitle.Text = (string)e.NewValue;
            }
        }

        private static void OnDescriptionChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is VectorDiagramControl control)
            {
                control.DiagramDescription.Text = (string)e.NewValue;
            }
        }

        private static void OnIsInteractiveChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is VectorDiagramControl control)
            {
                control.InteractiveModeCheckBox.IsEnabled = (bool)e.NewValue;
                control.UpdateInteractiveHotspots(control._currentDiagramType);
            }
        }

        private static void OnShowControlsChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is VectorDiagramControl control)
            {
                var visibility = (bool)e.NewValue ? Visibility.Visible : Visibility.Collapsed;
                control.GetTemplateChild("HeaderBorder")?.SetValue(VisibilityProperty, visibility);
                control.GetTemplateChild("FooterBorder")?.SetValue(VisibilityProperty, visibility);
            }
        }

        private void ZoomIn_Click(object sender, RoutedEventArgs e)
        {
            SetZoom(CurrentZoom * 1.2);
        }

        private void ZoomOut_Click(object sender, RoutedEventArgs e)
        {
            SetZoom(CurrentZoom * 0.8);
        }

        private void ResetZoom_Click(object sender, RoutedEventArgs e)
        {
            SetZoom(1.0);
        }

        private void InteractiveMode_Checked(object sender, RoutedEventArgs e)
        {
            UpdateInteractiveHotspots(_currentDiagramType);
        }

        private void InteractiveMode_Unchecked(object sender, RoutedEventArgs e)
        {
            UpdateInteractiveHotspots(_currentDiagramType);
        }

        private void Hotspot_MouseEnter(object sender, System.Windows.Input.MouseEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                element.SetValue(RenderTransformProperty, new ScaleTransform(1.2, 1.2));
            }
        }

        private void Hotspot_MouseLeave(object sender, System.Windows.Input.MouseEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                element.SetValue(RenderTransformProperty, new ScaleTransform(1.0, 1.0));
            }
        }

        private void SaveAsPng_Click(object sender, RoutedEventArgs e)
        {
            var saveDialog = new SaveFileDialog
            {
                Filter = "PNG files (*.png)|*.png",
                DefaultExt = "png",
                FileName = $"{DiagramTitle.Text.Replace(" ", "_")}.png"
            };

            if (saveDialog.ShowDialog() == true)
            {
                ExportToPng(saveDialog.FileName);
            }
        }

        private void SaveAsPdf_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("PDF export functionality would be implemented here.", "PDF Export",
                MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void CopyToClipboard_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var renderTargetBitmap = new RenderTargetBitmap(
                    (int)DiagramContainer.ActualWidth,
                    (int)DiagramContainer.ActualHeight,
                    96, 96, PixelFormats.Pbgra32);
                
                renderTargetBitmap.Render(DiagramContainer);
                Clipboard.SetImage(renderTargetBitmap);
                
                MessageBox.Show("Diagram copied to clipboard!", "Copy Successful",
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to copy diagram: {ex.Message}", "Copy Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        #endregion

        #region INotifyPropertyChanged

        public event PropertyChangedEventHandler PropertyChanged;

        #endregion
    }

    /// <summary>
    /// Types of diagrams supported
    /// </summary>
    public enum DiagramType
    {
        ProcessFlow,
        OrganizationChart,
        DataFlow,
        NetworkTopology,
        Timeline,
        CompanyLogo
    }

    /// <summary>
    /// Information about a diagram
    /// </summary>
    internal class DiagramInfo
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public ImageSource ImageSource { get; set; }
        public ImageSource IconSource { get; set; }
    }
}