using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Linq;

namespace MandADiscoverySuite.Collections
{
    /// <summary>
    /// Optimized ObservableCollection that supports bulk operations and suppressing notifications
    /// </summary>
    /// <typeparam name="T">Type of items in the collection</typeparam>
    public class OptimizedObservableCollection<T> : ObservableCollection<T>
    {
        private bool _suppressNotifications;
        private bool _hasChanges;
        private int _batchSize = 1000;
        
        /// <summary>
        /// Gets or sets the batch size for bulk operations (default: 1000)
        /// </summary>
        public int BatchSize
        {
            get => _batchSize;
            set => _batchSize = Math.Max(1, value);
        }

        /// <summary>
        /// Initializes a new instance of OptimizedObservableCollection
        /// </summary>
        public OptimizedObservableCollection() : base() { }

        /// <summary>
        /// Initializes a new instance with items from enumerable
        /// </summary>
        /// <param name="items">Items to add to collection</param>
        public OptimizedObservableCollection(IEnumerable<T> items) : base(items) { }

        /// <summary>
        /// Adds multiple items to the collection in a single bulk operation
        /// </summary>
        /// <param name="items">Items to add</param>
        public void AddRange(IEnumerable<T> items)
        {
            if (items == null) return;

            var itemsList = items.ToList();
            if (!itemsList.Any()) return;

            using (SuppressNotifications())
            {
                // Process in batches for very large datasets to prevent memory issues
                if (itemsList.Count > _batchSize)
                {
                    for (int i = 0; i < itemsList.Count; i += _batchSize)
                    {
                        var batch = itemsList.Skip(i).Take(_batchSize);
                        foreach (var item in batch)
                        {
                            Items.Add(item);
                        }
                    }
                }
                else
                {
                    foreach (var item in itemsList)
                    {
                        Items.Add(item);
                    }
                }
            }

            // Fire single reset notification for better performance with large datasets
            OnCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Reset));
        }

        /// <summary>
        /// Replaces all items in the collection with new items in a single operation
        /// </summary>
        /// <param name="items">Items to replace with</param>
        public void ReplaceAll(IEnumerable<T> items)
        {
            if (items == null) items = Enumerable.Empty<T>();

            var itemsList = items.ToList();

            using (SuppressNotifications())
            {
                Clear();
                foreach (var item in itemsList)
                {
                    Add(item);
                }
            }

            OnCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Reset));
        }

        /// <summary>
        /// Removes multiple items from the collection in a single bulk operation
        /// </summary>
        /// <param name="items">Items to remove</param>
        public void RemoveRange(IEnumerable<T> items)
        {
            if (items == null) return;

            var itemsList = items.ToList();
            if (!itemsList.Any()) return;

            var removedItems = new List<T>();

            using (SuppressNotifications())
            {
                foreach (var item in itemsList)
                {
                    if (Remove(item))
                    {
                        removedItems.Add(item);
                    }
                }
            }

            if (removedItems.Any())
            {
                OnCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Remove, removedItems));
            }
        }

        /// <summary>
        /// Returns an IDisposable that suppresses change notifications until disposed
        /// </summary>
        /// <returns>IDisposable that restores notifications when disposed</returns>
        public IDisposable SuppressNotifications()
        {
            return new NotificationSuppressor(this);
        }

        /// <summary>
        /// Refreshes the collection by firing a reset notification
        /// </summary>
        public void Refresh()
        {
            OnCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Reset));
        }
        
        /// <summary>
        /// Sorts the collection in place using the provided comparer
        /// </summary>
        /// <param name="comparer">Comparer to use for sorting</param>
        public void Sort(IComparer<T> comparer = null)
        {
            if (Count <= 1) return;
            
            var sorted = comparer == null 
                ? this.OrderBy(x => x).ToList() 
                : this.OrderBy(x => x, comparer).ToList();
            
            using (SuppressNotifications())
            {
                Items.Clear();
                foreach (var item in sorted)
                {
                    Items.Add(item);
                }
            }
            
            OnCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Reset));
        }
        
        /// <summary>
        /// Sorts the collection in place using a key selector
        /// </summary>
        /// <typeparam name="TKey">Type of the sort key</typeparam>
        /// <param name="keySelector">Function to extract sort key</param>
        /// <param name="descending">Whether to sort descending</param>
        public void Sort<TKey>(Func<T, TKey> keySelector, bool descending = false)
        {
            if (Count <= 1 || keySelector == null) return;
            
            var sorted = descending 
                ? this.OrderByDescending(keySelector).ToList()
                : this.OrderBy(keySelector).ToList();
            
            using (SuppressNotifications())
            {
                Items.Clear();
                foreach (var item in sorted)
                {
                    Items.Add(item);
                }
            }
            
            OnCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Reset));
        }

        protected override void OnCollectionChanged(NotifyCollectionChangedEventArgs e)
        {
            if (_suppressNotifications)
            {
                _hasChanges = true;
                return;
            }

            base.OnCollectionChanged(e);
        }

        protected override void OnPropertyChanged(PropertyChangedEventArgs e)
        {
            if (_suppressNotifications) return;
            base.OnPropertyChanged(e);
        }

        private void ResumeNotifications()
        {
            _suppressNotifications = false;
            if (_hasChanges)
            {
                _hasChanges = false;
                OnCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Reset));
                OnPropertyChanged(new PropertyChangedEventArgs(nameof(Count)));
                OnPropertyChanged(new PropertyChangedEventArgs("Item[]"));
            }
        }

        private class NotificationSuppressor : IDisposable
        {
            private readonly OptimizedObservableCollection<T> _collection;
            private bool _disposed;

            public NotificationSuppressor(OptimizedObservableCollection<T> collection)
            {
                _collection = collection ?? throw new ArgumentNullException(nameof(collection));
                _collection._suppressNotifications = true;
                _collection._hasChanges = false;
            }

            public void Dispose()
            {
                if (!_disposed)
                {
                    _collection.ResumeNotifications();
                    _disposed = true;
                }
            }
        }
    }
}