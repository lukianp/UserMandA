using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.ViewModels
{
    public abstract class WidgetViewModel : INotifyPropertyChanged
    {
        private string _title;
        private string _icon;
        private bool _isVisible;
        private int _row;
        private int _column;
        private int _rowSpan;
        private int _columnSpan;
        private DateTime? _lastUpdated;
        private bool _isLoading;
        private string _errorMessage;

        protected WidgetViewModel()
        {
            _isVisible = true;
            _rowSpan = 1;
            _columnSpan = 1;
        }

        public abstract string WidgetType { get; }

        public string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }

        public string Icon
        {
            get => _icon;
            set => SetProperty(ref _icon, value);
        }

        public bool IsVisible
        {
            get => _isVisible;
            set => SetProperty(ref _isVisible, value);
        }

        public int Row
        {
            get => _row;
            set => SetProperty(ref _row, value);
        }

        public int Column
        {
            get => _column;
            set => SetProperty(ref _column, value);
        }

        public int RowSpan
        {
            get => _rowSpan;
            set => SetProperty(ref _rowSpan, value);
        }

        public int ColumnSpan
        {
            get => _columnSpan;
            set => SetProperty(ref _columnSpan, value);
        }

        public DateTime? LastUpdated
        {
            get => _lastUpdated;
            set => SetProperty(ref _lastUpdated, value);
        }

        public bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        public string ErrorMessage
        {
            get => _errorMessage;
            set => SetProperty(ref _errorMessage, value);
        }

        public abstract void RefreshAsync();

        protected virtual void OnRefreshCompleted()
        {
            LastUpdated = DateTime.Now;
            IsLoading = false;
            ErrorMessage = null;
        }

        protected virtual void OnRefreshError(string errorMessage)
        {
            IsLoading = false;
            ErrorMessage = errorMessage;
        }

        protected virtual bool SetProperty<T>(ref T backingStore, T value, [CallerMemberName] string propertyName = "")
        {
            if (Equals(backingStore, value))
                return false;

            backingStore = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = "")
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        public event PropertyChangedEventHandler PropertyChanged;
    }
}