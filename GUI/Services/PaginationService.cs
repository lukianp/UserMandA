using System;
using System.Collections.Generic;
using System.Linq;

namespace MandADiscoverySuite.Services
{
    public class PaginationService<T>
    {
        private List<T> _allItems = new List<T>();
        private int _currentPage = 1;
        private int _itemsPerPage = 50;

        public event EventHandler PageChanged;

        public int CurrentPage
        {
            get => _currentPage;
            set
            {
                if (value >= 1 && value <= TotalPages && _currentPage != value)
                {
                    _currentPage = value;
                    PageChanged?.Invoke(this, EventArgs.Empty);
                }
            }
        }

        public int ItemsPerPage
        {
            get => _itemsPerPage;
            set
            {
                if (value > 0 && _itemsPerPage != value)
                {
                    _itemsPerPage = value;
                    CurrentPage = 1; // Reset to first page when page size changes
                }
            }
        }

        public int TotalItems => _allItems.Count;
        public int TotalPages => (int)Math.Ceiling((double)TotalItems / ItemsPerPage);
        public bool HasPreviousPage => CurrentPage > 1;
        public bool HasNextPage => CurrentPage < TotalPages;

        public int StartIndex => Math.Max(0, (CurrentPage - 1) * ItemsPerPage);
        public int EndIndex => Math.Min(TotalItems - 1, StartIndex + ItemsPerPage - 1);

        public string PageInfo => TotalItems == 0 
            ? "No items" 
            : $"{StartIndex + 1}-{EndIndex + 1} of {TotalItems}";

        public void SetAllItems(IEnumerable<T> items)
        {
            _allItems = items?.ToList() ?? new List<T>();
            CurrentPage = 1;
        }

        public IEnumerable<T> GetCurrentPageItems()
        {
            if (!_allItems.Any()) return Enumerable.Empty<T>();
            
            return _allItems
                .Skip(StartIndex)
                .Take(ItemsPerPage);
        }

        public void FirstPage() => CurrentPage = 1;
        public void LastPage() => CurrentPage = TotalPages;
        public void NextPage() => CurrentPage++;
        public void PreviousPage() => CurrentPage--;

        public void GoToPage(int page)
        {
            if (page >= 1 && page <= TotalPages)
                CurrentPage = page;
        }

        public int[] GetPageNumbers()
        {
            if (TotalPages <= 7)
            {
                return Enumerable.Range(1, TotalPages).ToArray();
            }

            var pages = new List<int>();
            
            if (CurrentPage <= 4)
            {
                pages.AddRange(Enumerable.Range(1, 5));
                pages.Add(-1); // Separator
                pages.Add(TotalPages);
            }
            else if (CurrentPage >= TotalPages - 3)
            {
                pages.Add(1);
                pages.Add(-1); // Separator
                pages.AddRange(Enumerable.Range(TotalPages - 4, 5));
            }
            else
            {
                pages.Add(1);
                pages.Add(-1); // Separator
                pages.AddRange(Enumerable.Range(CurrentPage - 1, 3));
                pages.Add(-1); // Separator
                pages.Add(TotalPages);
            }

            return pages.ToArray();
        }
    }
}