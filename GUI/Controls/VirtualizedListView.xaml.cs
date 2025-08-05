using System;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for VirtualizedListView.xaml
    /// </summary>
    public partial class VirtualizedListView : UserControl
    {
        private VirtualizedListViewModel _viewModel;

        public VirtualizedListView()
        {
            InitializeComponent();
            _viewModel = new VirtualizedListViewModel();
            DataContext = _viewModel;
        }

        private void VirtualizedListBox_ScrollChanged(object sender, ScrollChangedEventArgs e)
        {
            try
            {
                // Implement infinite scrolling when near the bottom
                var scrollViewer = e.OriginalSource as ScrollViewer;
                if (scrollViewer != null)
                {
                    var scrollPercentage = scrollViewer.VerticalOffset / scrollViewer.ScrollableHeight;
                    
                    // Load more items when 80% scrolled (if not already loading)
                    if (scrollPercentage > 0.8 && !_viewModel.IsLoading)
                    {
                        _viewModel?.LoadMoreItemsAsync();
                    }
                    
                    // Update scroll position for performance tracking
                    _viewModel?.UpdateScrollPosition(scrollViewer.VerticalOffset, scrollViewer.ViewportHeight);
                }
            }
            catch (Exception ex)
            {
                _viewModel?.LogError(ex, "Error handling scroll changed event");
            }
        }

        /// <summary>
        /// Gets the view model for the virtualized list
        /// </summary>
        public VirtualizedListViewModel ViewModel => _viewModel;

        /// <summary>
        /// Sets the data source for the virtualized list
        /// </summary>
        public void SetDataSource<T>(IVirtualDataSource<T> dataSource) where T : class
        {
            _viewModel?.SetDataSource(dataSource);
        }

        /// <summary>
        /// Refreshes the list data
        /// </summary>
        public void RefreshData()
        {
            _viewModel?.RefreshData();
        }

        /// <summary>
        /// Scrolls to a specific item by index
        /// </summary>
        public void ScrollToItem(int index)
        {
            try
            {
                if (VirtualizedListBox.Items.Count > index && index >= 0)
                {
                    VirtualizedListBox.ScrollIntoView(VirtualizedListBox.Items[index]);
                }
            }
            catch (Exception ex)
            {
                _viewModel?.LogError(ex, $"Error scrolling to item at index {index}");
            }
        }
    }
}