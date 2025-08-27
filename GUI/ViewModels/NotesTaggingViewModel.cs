using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for Notes and Tagging management
    /// </summary>
    public class NotesTaggingViewModel : BaseViewModel
    {
        private readonly INotesTaggingService _notesTaggingService;
        
        // Collections
        private ObservableCollection<Note> _notes;
        private ObservableCollection<Tag> _tags;
        private ObservableCollection<Note> _filteredNotes;
        private ObservableCollection<Tag> _filteredTags;
        
        // Selected items
        private Note _selectedNote;
        private Tag _selectedTag;
        private ObservableCollection<Note> _selectedNotes;
        private ObservableCollection<Tag> _selectedTags;
        
        // Filter and search
        private NoteTagFilter _currentFilter;
        private string _noteSearchText;
        private string _tagSearchText;
        
        // UI state
        private bool _isNotesView = true;
        private bool _isLoadingNotes;
        private bool _isLoadingTags;
        private bool _isEditingNote;
        private bool _isEditingTag;
        private bool _showNoteEditor;
        private bool _showTagEditor;
        private bool _showFilterPanel;
        
        // Editor state
        private Note _editingNote;
        private Tag _editingTag;
        private string _newNoteTitle;
        private string _newNoteContent;
        private NoteType _newNoteType;
        private NotePriority _newNotePriority;
        private string _newTagName;
        private string _newTagColor;
        private TagCategory _newTagCategory;
        
        // Analytics
        private Dictionary<string, int> _tagUsageStats;
        private Dictionary<NoteType, int> _noteTypeStats;

        public NotesTaggingViewModel(INotesTaggingService notesTaggingService) : base()
        {
            _notesTaggingService = notesTaggingService ?? throw new ArgumentNullException(nameof(notesTaggingService));
            
            InitializeCollections();
            InitializeCommands();
            InitializeFilter();
            
            // Load data
            _ = LoadDataAsync();
        }

        #region Properties

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

        public ObservableCollection<Note> FilteredNotes
        {
            get => _filteredNotes;
            set => SetProperty(ref _filteredNotes, value);
        }

        public ObservableCollection<Tag> FilteredTags
        {
            get => _filteredTags;
            set => SetProperty(ref _filteredTags, value);
        }

        public Note SelectedNote
        {
            get => _selectedNote;
            set => SetProperty(ref _selectedNote, value);
        }

        public Tag SelectedTag
        {
            get => _selectedTag;
            set => SetProperty(ref _selectedTag, value);
        }

        public ObservableCollection<Note> SelectedNotes
        {
            get => _selectedNotes;
            set => SetProperty(ref _selectedNotes, value);
        }

        public ObservableCollection<Tag> SelectedTags
        {
            get => _selectedTags;
            set => SetProperty(ref _selectedTags, value);
        }

        public NoteTagFilter CurrentFilter
        {
            get => _currentFilter;
            set => SetProperty(ref _currentFilter, value);
        }

        public string NoteSearchText
        {
            get => _noteSearchText;
            set
            {
                if (SetProperty(ref _noteSearchText, value))
                {
                    _ = SearchNotesAsync(value);
                }
            }
        }

        public string TagSearchText
        {
            get => _tagSearchText;
            set
            {
                if (SetProperty(ref _tagSearchText, value))
                {
                    _ = SearchTagsAsync(value);
                }
            }
        }

        public bool IsNotesView
        {
            get => _isNotesView;
            set => SetProperty(ref _isNotesView, value);
        }

        public bool IsLoadingNotes
        {
            get => _isLoadingNotes;
            set => SetProperty(ref _isLoadingNotes, value);
        }

        public bool IsLoadingTags
        {
            get => _isLoadingTags;
            set => SetProperty(ref _isLoadingTags, value);
        }

        public bool IsEditingNote
        {
            get => _isEditingNote;
            set => SetProperty(ref _isEditingNote, value);
        }

        public bool IsEditingTag
        {
            get => _isEditingTag;
            set => SetProperty(ref _isEditingTag, value);
        }

        public bool ShowNoteEditor
        {
            get => _showNoteEditor;
            set => SetProperty(ref _showNoteEditor, value);
        }

        public bool ShowTagEditor
        {
            get => _showTagEditor;
            set => SetProperty(ref _showTagEditor, value);
        }

        public bool ShowFilterPanel
        {
            get => _showFilterPanel;
            set => SetProperty(ref _showFilterPanel, value);
        }

        public Note EditingNote
        {
            get => _editingNote;
            set => SetProperty(ref _editingNote, value);
        }

        public Tag EditingTag
        {
            get => _editingTag;
            set => SetProperty(ref _editingTag, value);
        }

        public string NewNoteTitle
        {
            get => _newNoteTitle;
            set => SetProperty(ref _newNoteTitle, value);
        }

        public string NewNoteContent
        {
            get => _newNoteContent;
            set => SetProperty(ref _newNoteContent, value);
        }

        public NoteType NewNoteType
        {
            get => _newNoteType;
            set => SetProperty(ref _newNoteType, value);
        }

        public NotePriority NewNotePriority
        {
            get => _newNotePriority;
            set => SetProperty(ref _newNotePriority, value);
        }

        public string NewTagName
        {
            get => _newTagName;
            set => SetProperty(ref _newTagName, value);
        }

        public string NewTagColor
        {
            get => _newTagColor;
            set => SetProperty(ref _newTagColor, value);
        }

        public TagCategory NewTagCategory
        {
            get => _newTagCategory;
            set => SetProperty(ref _newTagCategory, value);
        }

        public Dictionary<string, int> TagUsageStats
        {
            get => _tagUsageStats;
            set => SetProperty(ref _tagUsageStats, value);
        }

        public Dictionary<NoteType, int> NoteTypeStats
        {
            get => _noteTypeStats;
            set => SetProperty(ref _noteTypeStats, value);
        }

        // Available enum values for UI binding
        public Array NoteTypes => Enum.GetValues(typeof(NoteType));
        public Array NotePriorities => Enum.GetValues(typeof(NotePriority));
        public Array TagCategories => Enum.GetValues(typeof(TagCategory));

        #endregion

        #region Commands

        // View commands
        public ICommand ShowNotesViewCommand { get; private set; }
        public ICommand ShowTagsViewCommand { get; private set; }
        public ICommand ToggleFilterPanelCommand { get; private set; }
        public ICommand RefreshDataCommand { get; private set; }

        // Note commands
        public ICommand CreateNoteCommand { get; private set; }
        public ICommand EditNoteCommand { get; private set; }
        public ICommand DeleteNoteCommand { get; private set; }
        public ICommand SaveNoteCommand { get; private set; }
        public ICommand CancelNoteEditCommand { get; private set; }
        public ICommand PinNoteCommand { get; private set; }
        public ICommand UnpinNoteCommand { get; private set; }
        public ICommand BulkDeleteNotesCommand { get; private set; }

        // Tag commands
        public ICommand CreateTagCommand { get; private set; }
        public ICommand EditTagCommand { get; private set; }
        public ICommand DeleteTagCommand { get; private set; }
        public ICommand SaveTagCommand { get; private set; }
        public ICommand CancelTagEditCommand { get; private set; }

        // Tagging commands
        public ICommand AddTagToNoteCommand { get; private set; }
        public ICommand RemoveTagFromNoteCommand { get; private set; }
        public ICommand BulkTagNotesCommand { get; private set; }
        public ICommand BulkRemoveTagsCommand { get; private set; }

        // Filter commands
        public ICommand ClearFilterCommand { get; private set; }
        public ICommand ApplyFilterCommand { get; private set; }

        // Export/Import commands
        public ICommand ExportNotesCommand { get; private set; }
        public ICommand ImportNotesCommand { get; private set; }
        public ICommand ExportTagsCommand { get; private set; }
        public ICommand ImportTagsCommand { get; private set; }

        #endregion

        #region Initialization

        private void InitializeCollections()
        {
            Notes = new ObservableCollection<Note>();
            Tags = new ObservableCollection<Tag>();
            FilteredNotes = new ObservableCollection<Note>();
            FilteredTags = new ObservableCollection<Tag>();
            SelectedNotes = new ObservableCollection<Note>();
            SelectedTags = new ObservableCollection<Tag>();
            TagUsageStats = new Dictionary<string, int>();
            NoteTypeStats = new Dictionary<NoteType, int>();
        }

        protected override void InitializeCommands()
        {
            // View commands
            ShowNotesViewCommand = new RelayCommand(() => IsNotesView = true);
            ShowTagsViewCommand = new RelayCommand(() => IsNotesView = false);
            ToggleFilterPanelCommand = new RelayCommand(() => ShowFilterPanel = !ShowFilterPanel);
            RefreshDataCommand = new AsyncRelayCommand(LoadDataAsync);

            // Note commands
            CreateNoteCommand = new RelayCommand(StartCreateNote);
            EditNoteCommand = new RelayCommand<Note>(StartEditNote);
            DeleteNoteCommand = new AsyncRelayCommand<Note>(DeleteNoteAsync);
            SaveNoteCommand = new AsyncRelayCommand(SaveNoteAsync);
            CancelNoteEditCommand = new RelayCommand(CancelNoteEdit);
            PinNoteCommand = new AsyncRelayCommand<Note>(PinNoteAsync);
            UnpinNoteCommand = new AsyncRelayCommand<Note>(UnpinNoteAsync);
            BulkDeleteNotesCommand = new AsyncRelayCommand(BulkDeleteNotesAsync);

            // Tag commands
            CreateTagCommand = new RelayCommand(StartCreateTag);
            EditTagCommand = new RelayCommand<Tag>(StartEditTag);
            DeleteTagCommand = new AsyncRelayCommand<Tag>(DeleteTagAsync);
            SaveTagCommand = new AsyncRelayCommand(SaveTagAsync);
            CancelTagEditCommand = new RelayCommand(CancelTagEdit);

            // Tagging commands
            AddTagToNoteCommand = new AsyncRelayCommand<object>(AddTagToNoteAsync);
            RemoveTagFromNoteCommand = new AsyncRelayCommand<object>(RemoveTagFromNoteAsync);
            BulkTagNotesCommand = new AsyncRelayCommand(BulkTagNotesAsync);
            BulkRemoveTagsCommand = new AsyncRelayCommand(BulkRemoveTagsAsync);

            // Filter commands
            ClearFilterCommand = new RelayCommand(ClearFilter);
            ApplyFilterCommand = new AsyncRelayCommand(ApplyFilterAsync);

            // Export/Import commands
            ExportNotesCommand = new AsyncRelayCommand(ExportNotesAsync);
            ImportNotesCommand = new AsyncRelayCommand(ImportNotesAsync);
            ExportTagsCommand = new AsyncRelayCommand(ExportTagsAsync);
            ImportTagsCommand = new AsyncRelayCommand(ImportTagsAsync);
        }

        private void InitializeFilter()
        {
            CurrentFilter = new NoteTagFilter();
            NewTagColor = "#0078D4";
        }

        #endregion

        #region Data Loading

        private async Task LoadDataAsync()
        {
            try
            {
                IsLoadingNotes = true;
                IsLoadingTags = true;

                // Load notes and tags in parallel
                var notesTask = LoadNotesAsync();
                var tagsTask = LoadTagsAsync();
                var statsTask = LoadStatsAsync();

                await Task.WhenAll(notesTask, tagsTask, statsTask);

                // Apply current filter
                await ApplyFilterAsync();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to load data: {ex.Message}";
            }
            finally
            {
                IsLoadingNotes = false;
                IsLoadingTags = false;
            }
        }

        private async Task LoadNotesAsync()
        {
            var notes = await _notesTaggingService.GetAllNotesAsync();
            
            App.Current.Dispatcher.Invoke(() =>
            {
                Notes.Clear();
                foreach (var note in notes)
                {
                    Notes.Add(note);
                }
            });
        }

        private async Task LoadTagsAsync()
        {
            var tags = await _notesTaggingService.GetAllTagsAsync();
            
            App.Current.Dispatcher.Invoke(() =>
            {
                Tags.Clear();
                foreach (var tag in tags)
                {
                    Tags.Add(tag);
                }
            });
        }

        private async Task LoadStatsAsync()
        {
            var tagUsageTask = _notesTaggingService.GetTagUsageStatisticsAsync();
            var noteTypeTask = _notesTaggingService.GetNoteTypeStatisticsAsync();

            await Task.WhenAll(tagUsageTask, noteTypeTask);

            TagUsageStats = await tagUsageTask;
            NoteTypeStats = await noteTypeTask;
        }

        #endregion

        #region Search and Filter

        private async Task SearchNotesAsync(string searchText)
        {
            try
            {
                List<Note> results;
                
                if (string.IsNullOrWhiteSpace(searchText))
                {
                    results = Notes.ToList();
                }
                else
                {
                    results = await _notesTaggingService.SearchNotesAsync(searchText, CurrentFilter);
                }

                App.Current.Dispatcher.Invoke(() =>
                {
                    FilteredNotes.Clear();
                    foreach (var note in results)
                    {
                        FilteredNotes.Add(note);
                    }
                });
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to search notes: {ex.Message}";
            }
        }

        private async Task SearchTagsAsync(string searchText)
        {
            try
            {
                var results = await _notesTaggingService.SearchTagsAsync(searchText);

                App.Current.Dispatcher.Invoke(() =>
                {
                    FilteredTags.Clear();
                    foreach (var tag in results)
                    {
                        FilteredTags.Add(tag);
                    }
                });
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to search tags: {ex.Message}";
            }
        }

        private async Task ApplyFilterAsync()
        {
            if (IsNotesView)
            {
                await SearchNotesAsync(NoteSearchText);
            }
            else
            {
                await SearchTagsAsync(TagSearchText);
            }
        }

        private void ClearFilter()
        {
            CurrentFilter = new NoteTagFilter();
            NoteSearchText = string.Empty;
            TagSearchText = string.Empty;
        }

        #endregion

        #region Note Operations

        private void StartCreateNote()
        {
            EditingNote = new Note
            {
                Type = NewNoteType,
                Priority = NewNotePriority
            };
            NewNoteTitle = string.Empty;
            NewNoteContent = string.Empty;
            IsEditingNote = false;
            ShowNoteEditor = true;
        }

        private void StartEditNote(Note note)
        {
            if (note == null) return;

            EditingNote = note;
            NewNoteTitle = note.Title;
            NewNoteContent = note.Content;
            NewNoteType = note.Type;
            NewNotePriority = note.Priority;
            IsEditingNote = true;
            ShowNoteEditor = true;
        }

        private async Task SaveNoteAsync()
        {
            try
            {
                if (EditingNote == null) return;

                EditingNote.Title = NewNoteTitle;
                EditingNote.Content = NewNoteContent;
                EditingNote.Type = NewNoteType;
                EditingNote.Priority = NewNotePriority;

                bool success;
                if (IsEditingNote)
                {
                    success = await _notesTaggingService.UpdateNoteAsync(EditingNote);
                }
                else
                {
                    var createdNote = await _notesTaggingService.CreateNoteAsync(
                        EditingNote.EntityId ?? "system",
                        EditingNote.EntityType ?? "system",
                        NewNoteTitle,
                        NewNoteContent,
                        NewNoteType);
                    success = createdNote != null;
                }

                if (success)
                {
                    ShowNoteEditor = false;
                    await LoadDataAsync();
                }
                else
                {
                    ErrorMessage = "Failed to save note";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to save note: {ex.Message}";
            }
        }

        private void CancelNoteEdit()
        {
            ShowNoteEditor = false;
            EditingNote = null;
        }

        private async Task DeleteNoteAsync(Note note)
        {
            try
            {
                if (note == null) return;

                var success = await _notesTaggingService.DeleteNoteAsync(note.Id);
                if (success)
                {
                    await LoadDataAsync();
                }
                else
                {
                    ErrorMessage = "Failed to delete note";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to delete note: {ex.Message}";
            }
        }

        private async Task PinNoteAsync(Note note)
        {
            try
            {
                if (note == null) return;

                await _notesTaggingService.PinNoteAsync(note.Id, true);
                await LoadDataAsync();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to pin note: {ex.Message}";
            }
        }

        private async Task UnpinNoteAsync(Note note)
        {
            try
            {
                if (note == null) return;

                await _notesTaggingService.PinNoteAsync(note.Id, false);
                await LoadDataAsync();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to unpin note: {ex.Message}";
            }
        }

        private async Task BulkDeleteNotesAsync()
        {
            try
            {
                if (SelectedNotes?.Count == 0) return;

                var noteIds = SelectedNotes.Select(n => n.Id).ToList();
                var success = await _notesTaggingService.BulkDeleteNotesAsync(noteIds);
                
                if (success)
                {
                    await LoadDataAsync();
                    SelectedNotes.Clear();
                }
                else
                {
                    ErrorMessage = "Failed to delete selected notes";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to delete notes: {ex.Message}";
            }
        }

        #endregion

        #region Tag Operations

        private void StartCreateTag()
        {
            EditingTag = new Tag
            {
                Category = NewTagCategory,
                Color = NewTagColor
            };
            NewTagName = string.Empty;
            IsEditingTag = false;
            ShowTagEditor = true;
        }

        private void StartEditTag(Tag tag)
        {
            if (tag == null) return;

            EditingTag = tag;
            NewTagName = tag.Name;
            NewTagColor = tag.Color;
            NewTagCategory = tag.Category;
            IsEditingTag = true;
            ShowTagEditor = true;
        }

        private async Task SaveTagAsync()
        {
            try
            {
                if (EditingTag == null) return;

                EditingTag.Name = NewTagName;
                EditingTag.Color = NewTagColor;
                EditingTag.Category = NewTagCategory;

                bool success;
                if (IsEditingTag)
                {
                    success = await _notesTaggingService.UpdateTagAsync(EditingTag);
                }
                else
                {
                    var createdTag = await _notesTaggingService.CreateTagAsync(
                        NewTagName,
                        NewTagColor,
                        NewTagCategory);
                    success = createdTag != null;
                }

                if (success)
                {
                    ShowTagEditor = false;
                    await LoadDataAsync();
                }
                else
                {
                    ErrorMessage = "Failed to save tag";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to save tag: {ex.Message}";
            }
        }

        private void CancelTagEdit()
        {
            ShowTagEditor = false;
            EditingTag = null;
        }

        private async Task DeleteTagAsync(Tag tag)
        {
            try
            {
                if (tag == null) return;

                var success = await _notesTaggingService.DeleteTagAsync(tag.Id);
                if (success)
                {
                    await LoadDataAsync();
                }
                else
                {
                    ErrorMessage = "Failed to delete tag";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to delete tag: {ex.Message}";
            }
        }

        #endregion

        #region Tagging Operations

        private async Task AddTagToNoteAsync(object parameter)
        {
            // Implementation for adding tags to notes
            // Parameter could be a tuple of (Note, Tag) or similar
            await Task.CompletedTask;
        }

        private async Task RemoveTagFromNoteAsync(object parameter)
        {
            // Implementation for removing tags from notes
            await Task.CompletedTask;
        }

        private async Task BulkTagNotesAsync()
        {
            try
            {
                if (SelectedNotes?.Count == 0 || SelectedTags?.Count == 0) return;

                // For notes, we need to add tags differently since notes store tag names
                foreach (var note in SelectedNotes)
                {
                    foreach (var tag in SelectedTags)
                    {
                        await _notesTaggingService.AddTagToNoteAsync(note.Id, tag.Id);
                    }
                }

                await LoadDataAsync();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to tag notes: {ex.Message}";
            }
        }

        private async Task BulkRemoveTagsAsync()
        {
            try
            {
                if (SelectedNotes?.Count == 0 || SelectedTags?.Count == 0) return;

                foreach (var note in SelectedNotes)
                {
                    foreach (var tag in SelectedTags)
                    {
                        await _notesTaggingService.RemoveTagFromNoteAsync(note.Id, tag.Id);
                    }
                }

                await LoadDataAsync();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to remove tags: {ex.Message}";
            }
        }

        #endregion

        #region Import/Export

        private async Task ExportNotesAsync()
        {
            try
            {
                var dialog = new Microsoft.Win32.SaveFileDialog
                {
                    Filter = "JSON files (*.json)|*.json|All files (*.*)|*.*",
                    DefaultExt = ".json"
                };

                if (dialog.ShowDialog() == true)
                {
                    var noteIds = SelectedNotes?.Count > 0 ? SelectedNotes.Select(n => n.Id).ToList() : null;
                    var success = await _notesTaggingService.ExportNotesAsync(dialog.FileName, noteIds);
                    
                    if (!success)
                    {
                        ErrorMessage = "Failed to export notes";
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to export notes: {ex.Message}";
            }
        }

        private async Task ImportNotesAsync()
        {
            try
            {
                var dialog = new Microsoft.Win32.OpenFileDialog
                {
                    Filter = "JSON files (*.json)|*.json|All files (*.*)|*.*"
                };

                if (dialog.ShowDialog() == true)
                {
                    var success = await _notesTaggingService.ImportNotesAsync(dialog.FileName);
                    
                    if (success)
                    {
                        await LoadDataAsync();
                    }
                    else
                    {
                        ErrorMessage = "Failed to import notes";
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to import notes: {ex.Message}";
            }
        }

        private async Task ExportTagsAsync()
        {
            try
            {
                var dialog = new Microsoft.Win32.SaveFileDialog
                {
                    Filter = "JSON files (*.json)|*.json|All files (*.*)|*.*",
                    DefaultExt = ".json"
                };

                if (dialog.ShowDialog() == true)
                {
                    var success = await _notesTaggingService.ExportTagsAsync(dialog.FileName);
                    
                    if (!success)
                    {
                        ErrorMessage = "Failed to export tags";
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to export tags: {ex.Message}";
            }
        }

        private async Task ImportTagsAsync()
        {
            try
            {
                var dialog = new Microsoft.Win32.OpenFileDialog
                {
                    Filter = "JSON files (*.json)|*.json|All files (*.*)|*.*"
                };

                if (dialog.ShowDialog() == true)
                {
                    var success = await _notesTaggingService.ImportTagsAsync(dialog.FileName);
                    
                    if (success)
                    {
                        await LoadDataAsync();
                    }
                    else
                    {
                        ErrorMessage = "Failed to import tags";
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to import tags: {ex.Message}";
            }
        }

        #endregion
    }
}