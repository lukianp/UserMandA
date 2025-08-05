using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.Collections;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Smart pagination service with infinite scroll and adaptive loading
    /// </summary>
    /// <typeparam name="T">Type of items to paginate</typeparam>
    public class SmartPaginationService<T> : IDisposable
    {
        private readonly OptimizedObservableCollection<T> _displayItems;
        private readonly List<T> _allItems;
        private readonly object _lockObject = new object();
        private CancellationTokenSource _loadingCancellation;
        private bool _disposed;

        public int PageSize { get; set; } = 50;
        public int PreloadThreshold { get; set; } = 10; // Load more when this many items from end
        public bool IsInfiniteScrollEnabled { get; set; } = true;
        public bool IsLoading { get; private set; }
        public bool HasMoreItems { get; private set; } = true;
        public int CurrentPage { get; private set; } = 1;
        public int TotalItems => _allItems.Count;
        public int LoadedItems => _displayItems.Count;

        public event EventHandler<LoadMoreEventArgs> LoadMoreRequested;
        public event EventHandler<PaginationEventArgs> PageChanged;
        public event EventHandler LoadingStateChanged;

        public SmartPaginationService()
        {
            _displayItems = new OptimizedObservableCollection<T>();
            _allItems = new List<T>();
        }

        /// <summary>
        /// Gets the display collection for binding to UI
        /// </summary>
        public OptimizedObservableCollection<T> DisplayItems => _displayItems;

        /// <summary>
        /// Sets all available items (for non-infinite scroll scenarios)
        /// </summary>
        /// <param name="items">All items to paginate</param>
        public void SetAllItems(IEnumerable<T> items)
        {
            lock (_lockObject)
            {
                _allItems.Clear();
                _allItems.AddRange(items ?? Enumerable.Empty<T>());
                
                CurrentPage = 1;
                HasMoreItems = _allItems.Count > PageSize;
                
                LoadCurrentPage();
            }
        }

        /// <summary>
        /// Adds items to the collection (for infinite scroll scenarios)
        /// </summary>
        /// <param name="items">Items to add</param>
        /// <param name="hasMore">Whether more items are available</param>
        public void AddItems(IEnumerable<T> items, bool hasMore = true)
        {
            lock (_lockObject)
            {
                var itemsList = items?.ToList() ?? new List<T>();
                _allItems.AddRange(itemsList);
                
                Application.Current.Dispatcher.Invoke(() =>
                {
                    _displayItems.AddRange(itemsList);
                });

                HasMoreItems = hasMore;
                SetLoadingState(false);
            }
        }

        /// <summary>
        /// Goes to a specific page
        /// </summary>
        /// <param name="pageNumber">Page number to navigate to</param>
        public void GoToPage(int pageNumber)
        {
            if (pageNumber < 1) pageNumber = 1;
            
            lock (_lockObject)
            {
                CurrentPage = pageNumber;
                LoadCurrentPage();
                OnPageChanged(new PaginationEventArgs { CurrentPage = CurrentPage, PageSize = PageSize });
            }
        }

        /// <summary>
        /// Goes to the next page
        /// </summary>
        public void NextPage()
        {
            GoToPage(CurrentPage + 1);
        }

        /// <summary>
        /// Goes to the previous page
        /// </summary>
        public void PreviousPage()
        {
            GoToPage(CurrentPage - 1);
        }

        /// <summary>
        /// Checks if an item is near the end and triggers loading more items if needed
        /// </summary>
        /// <param name="item">Item to check position for</param>
        public void CheckForLoadMore(T item)
        {
            if (!IsInfiniteScrollEnabled || IsLoading || !HasMoreItems) return;

            var index = _displayItems.IndexOf(item);
            if (index >= 0 && index >= _displayItems.Count - PreloadThreshold)
            {
                LoadMoreItems();
            }
        }

        /// <summary>
        /// Attaches to a ScrollViewer for automatic infinite scroll detection
        /// </summary>
        /// <param name="scrollViewer">ScrollViewer to monitor</param>
        public void AttachToScrollViewer(ScrollViewer scrollViewer)
        {
            if (scrollViewer != null)
            {
                scrollViewer.ScrollChanged += ScrollViewer_ScrollChanged;
            }
        }

        /// <summary>
        /// Detaches from a ScrollViewer
        /// </summary>
        /// <param name="scrollViewer">ScrollViewer to stop monitoring</param>
        public void DetachFromScrollViewer(ScrollViewer scrollViewer)
        {
            if (scrollViewer != null)
            {
                scrollViewer.ScrollChanged -= ScrollViewer_ScrollChanged;
            }
        }

        /// <summary>
        /// Refreshes the current page
        /// </summary>
        public void Refresh()
        {
            lock (_lockObject)
            {
                LoadCurrentPage();
            }
        }

        /// <summary>
        /// Clears all items
        /// </summary>
        public void Clear()
        {
            lock (_lockObject)
            {
                _allItems.Clear();
                Application.Current.Dispatcher.Invoke(() =>
                {
                    _displayItems.Clear();
                });
                
                CurrentPage = 1;
                HasMoreItems = false;
                SetLoadingState(false);
            }
        }

        /// <summary>
        /// Gets pagination information
        /// </summary>
        /// <returns>Pagination info string</returns>
        public string GetPaginationInfo()
        {
            if (IsInfiniteScrollEnabled)
            {
                return HasMoreItems 
                    ? $"Showing {LoadedItems} items (more available)"
                    : $"Showing all {LoadedItems} items";
            }
            else
            {
                var startIndex = (CurrentPage - 1) * PageSize + 1;
                var endIndex = Math.Min(CurrentPage * PageSize, TotalItems);
                var totalPages = (int)Math.Ceiling((double)TotalItems / PageSize);
                
                return $"Showing {startIndex}-{endIndex} of {TotalItems} items (Page {CurrentPage} of {totalPages})";
            }
        }

        private void LoadCurrentPage()
        {
            var startIndex = (CurrentPage - 1) * PageSize;
            var itemsToShow = _allItems.Skip(startIndex).Take(PageSize).ToList();
            
            Application.Current.Dispatcher.Invoke(() =>
            {
                _displayItems.ReplaceAll(itemsToShow);
            });
        }

        private void LoadMoreItems()
        {
            if (IsLoading || !HasMoreItems) return;

            SetLoadingState(true);

            // Cancel any existing loading operation
            _loadingCancellation?.Cancel();
            _loadingCancellation = new CancellationTokenSource();

            var args = new LoadMoreEventArgs
            {
                CurrentItemCount = LoadedItems,
                PageSize = PageSize,
                CancellationToken = _loadingCancellation.Token
            };

            OnLoadMoreRequested(args);
        }

        private void ScrollViewer_ScrollChanged(object sender, ScrollChangedEventArgs e)
        {
            if (!IsInfiniteScrollEnabled || IsLoading || !HasMoreItems) return;

            var scrollViewer = sender as ScrollViewer;
            if (scrollViewer == null) return;

            // Check if we're near the bottom
            var threshold = scrollViewer.ViewportHeight * 0.8; // Load when 80% scrolled
            var distanceFromBottom = scrollViewer.ExtentHeight - scrollViewer.VerticalOffset - scrollViewer.ViewportHeight;

            if (distanceFromBottom <= threshold)
            {
                LoadMoreItems();
            }
        }

        private void SetLoadingState(bool isLoading)
        {
            if (IsLoading != isLoading)
            {
                IsLoading = isLoading;
                LoadingStateChanged?.Invoke(this, EventArgs.Empty);
            }
        }

        private void OnLoadMoreRequested(LoadMoreEventArgs e)
        {
            LoadMoreRequested?.Invoke(this, e);
        }

        private void OnPageChanged(PaginationEventArgs e)
        {
            PageChanged?.Invoke(this, e);
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _loadingCancellation?.Cancel();
                _loadingCancellation?.Dispose();
                _disposed = true;
            }
        }
    }

    /// <summary>
    /// Event arguments for load more requests
    /// </summary>
    public class LoadMoreEventArgs : EventArgs
    {
        public int CurrentItemCount { get; set; }
        public int PageSize { get; set; }
        public CancellationToken CancellationToken { get; set; }
    }

    /// <summary>
    /// Event arguments for pagination changes
    /// </summary>
    public class PaginationEventArgs : EventArgs
    {
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
    }

    /// <summary>
    /// Behavior for attaching smart pagination to ItemsControl
    /// </summary>
    public static class SmartPaginationBehavior
    {
        public static readonly DependencyProperty PaginationServiceProperty =
            DependencyProperty.RegisterAttached(
                "PaginationService",
                typeof(object),
                typeof(SmartPaginationBehavior),
                new PropertyMetadata(null, OnPaginationServiceChanged));

        public static object GetPaginationService(DependencyObject obj)
        {
            return obj.GetValue(PaginationServiceProperty);
        }

        public static void SetPaginationService(DependencyObject obj, object value)
        {
            obj.SetValue(PaginationServiceProperty, value);
        }

        private static void OnPaginationServiceChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ItemsControl itemsControl && e.NewValue != null)
            {
                // Attach pagination behavior
                itemsControl.Loaded += (sender, args) =>
                {
                    var scrollViewer = FindScrollViewer(itemsControl);
                    if (scrollViewer != null)
                    {
                        // Attach infinite scroll if service supports it
                        var serviceType = e.NewValue.GetType();
                        var attachMethod = serviceType.GetMethod("AttachToScrollViewer");
                        attachMethod?.Invoke(e.NewValue, new object[] { scrollViewer });
                    }
                };
            }
        }

        private static ScrollViewer FindScrollViewer(DependencyObject parent)
        {
            for (int i = 0; i < VisualTreeHelper.GetChildrenCount(parent); i++)
            {
                var child = VisualTreeHelper.GetChild(parent, i);
                if (child is ScrollViewer scrollViewer)
                {
                    return scrollViewer;
                }

                var result = FindScrollViewer(child);
                if (result != null)
                {
                    return result;
                }
            }
            return null;
        }
    }
}