using System.Windows;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Dialogs
{
    /// <summary>
    /// Interaction logic for FilterPresetManagerDialog.xaml
    /// </summary>
    public partial class FilterPresetManagerDialog : Window
    {
        public FilterPresetManagerViewModel ViewModel { get; private set; }

        public FilterPresetManagerDialog()
        {
            InitializeComponent();
            ViewModel = new FilterPresetManagerViewModel();
            DataContext = ViewModel;
        }

        private void PresetCard_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (sender is FrameworkElement element && element.DataContext is FilterConfiguration preset)
            {
                ViewModel.SelectedPreset = preset;
            }
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            _ = ViewModel.LoadPresetsAsync();
        }

        protected override void OnClosed(System.EventArgs e)
        {
            ViewModel?.Dispose();
            base.OnClosed(e);
        }
    }
}