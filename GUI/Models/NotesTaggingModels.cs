using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Represents a note attached to an entity
    /// </summary>
    public class Note : INotifyPropertyChanged
    {
        private string _title;
        private string _content;
        private DateTime _lastModified;
        private NotePriority _priority;
        private NoteType _type;
        private bool _isPinned;

        public string Id { get; set; }
        public string EntityId { get; set; }
        public string EntityType { get; set; }

        public string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }

        public string Content
        {
            get => _content;
            set => SetProperty(ref _content, value);
        }

        public DateTime CreatedDate { get; set; }

        public DateTime LastModified
        {
            get => _lastModified;
            set => SetProperty(ref _lastModified, value);
        }

        public string CreatedBy { get; set; }
        public string LastModifiedBy { get; set; }

        public NotePriority Priority
        {
            get => _priority;
            set => SetProperty(ref _priority, value);
        }

        public NoteType Type
        {
            get => _type;
            set => SetProperty(ref _type, value);
        }

        public bool IsPinned
        {
            get => _isPinned;
            set => SetProperty(ref _isPinned, value);
        }

        public List<string> Tags { get; set; }
        public Dictionary<string, object> CustomFields { get; set; }
        
        public Note()
        {
            Id = Guid.NewGuid().ToString();
            CreatedDate = DateTime.Now;
            LastModified = DateTime.Now;
            CreatedBy = Environment.UserName;
            LastModifiedBy = Environment.UserName;
            Priority = NotePriority.Normal;
            Type = NoteType.General;
            Tags = new List<string>();
            CustomFields = new Dictionary<string, object>();
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (object.Equals(storage, value)) return false;
            storage = value;
            LastModified = DateTime.Now;
            LastModifiedBy = Environment.UserName;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Represents a tag that can be applied to entities
    /// </summary>
    public class Tag : INotifyPropertyChanged
    {
        private string _name;
        private string _color;
        private string _description;
        private bool _isActive;

        public string Id { get; set; }

        public string Name
        {
            get => _name;
            set => SetProperty(ref _name, value);
        }

        public string Color
        {
            get => _color;
            set => SetProperty(ref _color, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public bool IsActive
        {
            get => _isActive;
            set => SetProperty(ref _isActive, value);
        }

        public TagCategory Category { get; set; }
        public DateTime CreatedDate { get; set; }
        public string CreatedBy { get; set; }
        public int UsageCount { get; set; }

        public Tag()
        {
            Id = Guid.NewGuid().ToString();
            CreatedDate = DateTime.Now;
            CreatedBy = Environment.UserName;
            IsActive = true;
            Category = TagCategory.General;
            Color = "#0078D4"; // Default blue
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (object.Equals(storage, value)) return false;
            storage = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Represents an entity with notes and tags
    /// </summary>
    public class TaggedEntity : INotifyPropertyChanged
    {
        private ObservableCollection<Note> _notes;
        private ObservableCollection<Tag> _tags;

        public string EntityId { get; set; }
        public string EntityType { get; set; }
        public string EntityName { get; set; }

        public ObservableCollection<Note> Notes
        {
            get => _notes;
            set => SetProperty(ref _notes, value);
        }

        public ObservableCollection<Tag> Tags
        {
            get => _tags;
            set => SetProperty(ref _tags, value);
        }

        public DateTime LastActivity { get; set; }
        public Dictionary<string, object> Metadata { get; set; }

        public TaggedEntity()
        {
            Notes = new ObservableCollection<Note>();
            Tags = new ObservableCollection<Tag>();
            LastActivity = DateTime.Now;
            Metadata = new Dictionary<string, object>();
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (object.Equals(storage, value)) return false;
            storage = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    /// <summary>
    /// Represents a filter for notes and tags
    /// </summary>
    public class NoteTagFilter : INotifyPropertyChanged
    {
        private string _searchText;
        private NotePriority? _selectedPriority;
        private NoteType? _selectedType;
        private TagCategory? _selectedCategory;
        private DateTime? _dateFrom;
        private DateTime? _dateTo;
        private bool _showPinnedOnly;
        private ObservableCollection<Tag> _selectedTags;

        public string SearchText
        {
            get => _searchText;
            set => SetProperty(ref _searchText, value);
        }

        public NotePriority? SelectedPriority
        {
            get => _selectedPriority;
            set => SetProperty(ref _selectedPriority, value);
        }

        public NoteType? SelectedType
        {
            get => _selectedType;
            set => SetProperty(ref _selectedType, value);
        }

        public TagCategory? SelectedCategory
        {
            get => _selectedCategory;
            set => SetProperty(ref _selectedCategory, value);
        }

        public DateTime? DateFrom
        {
            get => _dateFrom;
            set => SetProperty(ref _dateFrom, value);
        }

        public DateTime? DateTo
        {
            get => _dateTo;
            set => SetProperty(ref _dateTo, value);
        }

        public bool ShowPinnedOnly
        {
            get => _showPinnedOnly;
            set => SetProperty(ref _showPinnedOnly, value);
        }

        public ObservableCollection<Tag> SelectedTags
        {
            get => _selectedTags;
            set => SetProperty(ref _selectedTags, value);
        }

        public NoteTagFilter()
        {
            SelectedTags = new ObservableCollection<Tag>();
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (object.Equals(storage, value)) return false;
            storage = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }

    #region Enums

    public enum NotePriority
    {
        Low,
        Normal,
        High,
        Critical
    }

    public enum NoteType
    {
        General,
        Technical,
        Security,
        Compliance,
        Risk,
        Migration,
        Business,
        Architecture
    }

    public enum TagCategory
    {
        General,
        Priority,
        Status,
        Risk,
        Security,
        Compliance,
        Migration,
        Business,
        Technical,
        Custom
    }

    #endregion
}