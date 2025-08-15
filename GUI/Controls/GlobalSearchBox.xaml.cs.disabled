using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for GlobalSearchBox.xaml
    /// </summary>
    public partial class GlobalSearchBox : UserControl
    {
        private GlobalSearchViewModel _viewModel;

        public GlobalSearchBox()
        {
            InitializeComponent();
            Loaded += OnLoaded;
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            _viewModel = DataContext as GlobalSearchViewModel;
        }

        private void SearchTextBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (_viewModel == null) return;

            switch (e.Key)
            {
                case Key.Tab:
                    if (_viewModel.FilterSuggestions.Count > 0)
                    {
                        _viewModel.ApplyFirstSuggestion();
                        e.Handled = true;
                    }
                    break;
                    
                case Key.Escape:
                    _viewModel.ClearSearch();
                    SearchTextBox.MoveFocus(new TraversalRequest(FocusNavigationDirection.Next));
                    e.Handled = true;
                    break;
            }
        }

        private void SearchTextBox_GotFocus(object sender, RoutedEventArgs e)
        {
            _viewModel?.OnSearchBoxFocused();
        }

        private void SearchTextBox_LostFocus(object sender, RoutedEventArgs e)
        {
            // Delay hiding results to allow for result selection
            Dispatcher.BeginInvoke(new System.Action(() =>
            {
                if (!IsKeyboardFocusWithin && !ResultsPopup.IsMouseOver)
                {
                    _viewModel?.OnSearchBoxLostFocus();
                }
            }), System.Windows.Threading.DispatcherPriority.Background);
        }

        private void Result_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (sender is FrameworkElement element && 
                element.DataContext is SearchResultItem result)
            {
                _viewModel?.SelectResult(result);
                e.Handled = true;
            }
        }

        private void Result_MouseEnter(object sender, MouseEventArgs e)
        {
            if (sender is FrameworkElement element && 
                element.DataContext is SearchResultItem result)
            {
                _viewModel?.HighlightResult(result);
            }
        }

        /// <summary>
        /// Focuses the search box
        /// </summary>
        public void FocusSearchBox()
        {
            SearchTextBox.Focus();
            SearchTextBox.SelectAll();
        }

        /// <summary>
        /// Sets the search text programmatically
        /// </summary>
        public void SetSearchText(string text)
        {
            if (_viewModel != null)
            {
                _viewModel.SearchText = text;
            }
        }

        private void History_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (sender is FrameworkElement element && 
                element.DataContext is string searchTerm)
            {
                _viewModel?.SelectFromHistoryCommand?.Execute(searchTerm);
                e.Handled = true;
            }
        }

        private void History_MouseEnter(object sender, MouseEventArgs e)
        {
            // Optional: Add hover effects or preview functionality
        }
    }
}