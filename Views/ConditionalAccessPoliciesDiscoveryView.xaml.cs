using System.Windows.Controls;
using System.Windows;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ConditionalAccessPoliciesDiscoveryView.xaml
    /// </summary>
    public partial class ConditionalAccessPoliciesDiscoveryView : UserControl
    {
        public ConditionalAccessPoliciesDiscoveryView()
        {
            System.Diagnostics.Debug.WriteLine("ConditionalAccessPoliciesDiscoveryView constructor started");

            try
            {
                System.Diagnostics.Debug.WriteLine("About to call InitializeComponent()");
                InitializeComponent();
                System.Diagnostics.Debug.WriteLine("InitializeComponent() completed successfully");
                Loaded += OnLoaded;
                System.Diagnostics.Debug.WriteLine("Loaded event handler attached");
            }
            catch (System.Xaml.XamlParseException xamlEx)
            {
                // Specific XAML parse exceptions
                System.Diagnostics.Debug.WriteLine($"XAML Parse Exception initializing ConditionalAccessPoliciesDiscoveryView: {xamlEx.Message}");
                System.Diagnostics.Debug.WriteLine($"XAML Error Line: {xamlEx.LineNumber}, Position: {xamlEx.LinePosition}");
                System.Diagnostics.Debug.WriteLine($"Inner Exception: {xamlEx.InnerException?.Message}");
                System.Diagnostics.Debug.WriteLine($"XAML Stack Trace: {xamlEx.StackTrace}");

                // Provide minimal fallback to prevent complete application failure
                DataContext ??= new { IsProcessing = false, ErrorMessage = $"XAML Parse Error: {xamlEx.Message}" };
            }
            catch (System.Resources.MissingManifestResourceException resourceEx)
            {
                // Missing resource files or assembly resources
                System.Diagnostics.Debug.WriteLine($"Missing Resource Exception initializing ConditionalAccessPoliciesDiscoveryView: {resourceEx.Message}");
                System.Diagnostics.Debug.WriteLine($"Resource Stack Trace: {resourceEx.StackTrace}");

                // Provide minimal fallback to prevent complete application failure
                DataContext ??= new { IsProcessing = false, ErrorMessage = $"Resource Error: {resourceEx.Message}" };
            }
            catch (System.Exception ex)
            {
                // Generic catch-all for other exceptions
                System.Diagnostics.Debug.WriteLine($"Generic Exception initializing ConditionalAccessPoliciesDiscoveryView: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Exception Type: {ex.GetType().FullName}");
                System.Diagnostics.Debug.WriteLine($"Full Stack Trace: {ex.StackTrace}");

                // Provide minimal fallback to prevent complete application failure
                DataContext ??= new { IsProcessing = false, ErrorMessage = $"Initialization Error: {ex.Message}" };
            }
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            // Verify DataContext was set by IoC container
            if (DataContext == null)
            {
                System.Diagnostics.Debug.WriteLine("Warning: DataContext not set for ConditionalAccessPoliciesDiscoveryView");
                // Could attempt fallback initialization here if needed
            }
        }

        // Factory method for ViewRegistry
        public static UserControl CreateView()
        {
            return new ConditionalAccessPoliciesDiscoveryView();
        }
    }
}