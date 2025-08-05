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
                foreach (var item in itemsList)
                {
                    Add(item);
                }
            }

            // Fire single reset notification for better performance
            OnCollectionChanged(new NotifyCollectionChangedEventArgs(NotifyCollectionChangedAction.Add, itemsList));
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