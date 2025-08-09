using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Implementation of Notes and Tagging service
    /// </summary>
    public class NotesTaggingService : INotesTaggingService
    {
        private readonly Dictionary<string, Note> _notes;
        private readonly Dictionary<string, Tag> _tags;
        private readonly Dictionary<string, TaggedEntity> _entities;
        private readonly string _dataPath;
        private readonly object _lockObject = new object();

        // Events
        public event EventHandler<NoteEventArgs> NoteCreated;
        public event EventHandler<NoteEventArgs> NoteUpdated;
        public event EventHandler<NoteEventArgs> NoteDeleted;
        public event EventHandler<TagEventArgs> TagCreated;
        public event EventHandler<TagEventArgs> TagUpdated;
        public event EventHandler<TagEventArgs> TagDeleted;

        public NotesTaggingService()
        {
            _notes = new Dictionary<string, Note>();
            _tags = new Dictionary<string, Tag>();
            _entities = new Dictionary<string, TaggedEntity>();

            var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            _dataPath = Path.Combine(appData, "MandADiscoverySuite", "NotesAndTags");
            Directory.CreateDirectory(_dataPath);

            LoadDataAsync();
        }

        #region Note Management

        public async Task<Note> CreateNoteAsync(string entityId, string entityType, string title, string content, NoteType type = NoteType.General)
        {
            try
            {
                var note = new Note
                {
                    EntityId = entityId,
                    EntityType = entityType,
                    Title = title,
                    Content = content,
                    Type = type
                };

                lock (_lockObject)
                {
                    _notes[note.Id] = note;
                }

                await SaveNotesAsync();
                
                NoteCreated?.Invoke(this, new NoteEventArgs 
                { 
                    Note = note, 
                    EntityId = entityId, 
                    EntityType = entityType 
                });

                return note;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to create note: {ex.Message}", ex);
            }
        }

        public async Task<Note> GetNoteAsync(string noteId)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _notes.TryGetValue(noteId, out var note) ? note : null;
            }
        }

        public async Task<List<Note>> GetNotesForEntityAsync(string entityId, string entityType)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _notes.Values
                    .Where(n => n.EntityId == entityId && n.EntityType == entityType)
                    .OrderByDescending(n => n.LastModified)
                    .ToList();
            }
        }

        public async Task<List<Note>> GetAllNotesAsync()
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _notes.Values.OrderByDescending(n => n.LastModified).ToList();
            }
        }

        public async Task<bool> UpdateNoteAsync(Note note)
        {
            try
            {
                if (note == null) return false;

                lock (_lockObject)
                {
                    _notes[note.Id] = note;
                }

                await SaveNotesAsync();
                
                NoteUpdated?.Invoke(this, new NoteEventArgs 
                { 
                    Note = note, 
                    EntityId = note.EntityId, 
                    EntityType = note.EntityType 
                });

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteNoteAsync(string noteId)
        {
            try
            {
                Note note = null;
                lock (_lockObject)
                {
                    if (_notes.TryGetValue(noteId, out note))
                    {
                        _notes.Remove(noteId);
                    }
                }

                if (note != null)
                {
                    await SaveNotesAsync();
                    
                    NoteDeleted?.Invoke(this, new NoteEventArgs 
                    { 
                        Note = note, 
                        EntityId = note.EntityId, 
                        EntityType = note.EntityType 
                    });
                }

                return note != null;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> PinNoteAsync(string noteId, bool isPinned = true)
        {
            try
            {
                lock (_lockObject)
                {
                    if (_notes.TryGetValue(noteId, out var note))
                    {
                        note.IsPinned = isPinned;
                        return true;
                    }
                }

                await SaveNotesAsync();
                return false;
            }
            catch
            {
                return false;
            }
        }

        public async Task<List<Note>> SearchNotesAsync(string searchTerm, NoteTagFilter filter = null)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                var query = _notes.Values.AsEnumerable();

                if (!string.IsNullOrWhiteSpace(searchTerm))
                {
                    query = query.Where(n => 
                        (n.Title?.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) == true) ||
                        (n.Content?.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) == true));
                }

                if (filter != null)
                {
                    if (filter.SelectedPriority.HasValue)
                        query = query.Where(n => n.Priority == filter.SelectedPriority.Value);

                    if (filter.SelectedType.HasValue)
                        query = query.Where(n => n.Type == filter.SelectedType.Value);

                    if (filter.ShowPinnedOnly)
                        query = query.Where(n => n.IsPinned);

                    if (filter.DateFrom.HasValue)
                        query = query.Where(n => n.CreatedDate >= filter.DateFrom.Value);

                    if (filter.DateTo.HasValue)
                        query = query.Where(n => n.CreatedDate <= filter.DateTo.Value);

                    if (filter.SelectedTags?.Count > 0)
                    {
                        var tagNames = filter.SelectedTags.Select(t => t.Name).ToHashSet();
                        query = query.Where(n => n.Tags?.Any(tag => tagNames.Contains(tag)) == true);
                    }
                }

                return query.OrderByDescending(n => n.LastModified).ToList();
            }
        }

        #endregion

        #region Tag Management

        public async Task<Tag> CreateTagAsync(string name, string color = null, TagCategory category = TagCategory.General)
        {
            try
            {
                // Check if tag already exists
                var existingTag = await GetTagByNameAsync(name);
                if (existingTag != null)
                    return existingTag;

                var tag = new Tag
                {
                    Name = name,
                    Color = color ?? "#0078D4",
                    Category = category
                };

                lock (_lockObject)
                {
                    _tags[tag.Id] = tag;
                }

                await SaveTagsAsync();
                
                TagCreated?.Invoke(this, new TagEventArgs { Tag = tag });

                return tag;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to create tag: {ex.Message}", ex);
            }
        }

        public async Task<Tag> GetTagAsync(string tagId)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _tags.TryGetValue(tagId, out var tag) ? tag : null;
            }
        }

        public async Task<Tag> GetTagByNameAsync(string name)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _tags.Values.FirstOrDefault(t => 
                    string.Equals(t.Name, name, StringComparison.OrdinalIgnoreCase));
            }
        }

        public async Task<List<Tag>> GetAllTagsAsync()
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _tags.Values.OrderBy(t => t.Name).ToList();
            }
        }

        public async Task<List<Tag>> GetTagsByCategoryAsync(TagCategory category)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _tags.Values
                    .Where(t => t.Category == category)
                    .OrderBy(t => t.Name)
                    .ToList();
            }
        }

        public async Task<bool> UpdateTagAsync(Tag tag)
        {
            try
            {
                if (tag == null) return false;

                lock (_lockObject)
                {
                    _tags[tag.Id] = tag;
                }

                await SaveTagsAsync();
                
                TagUpdated?.Invoke(this, new TagEventArgs { Tag = tag });

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteTagAsync(string tagId)
        {
            try
            {
                Tag tag = null;
                lock (_lockObject)
                {
                    if (_tags.TryGetValue(tagId, out tag))
                    {
                        _tags.Remove(tagId);
                        
                        // Remove tag from all notes
                        foreach (var note in _notes.Values.Where(n => n.Tags?.Contains(tag.Name) == true))
                        {
                            note.Tags.Remove(tag.Name);
                        }
                    }
                }

                if (tag != null)
                {
                    await SaveTagsAsync();
                    await SaveNotesAsync();
                    
                    TagDeleted?.Invoke(this, new TagEventArgs { Tag = tag });
                }

                return tag != null;
            }
            catch
            {
                return false;
            }
        }

        public async Task<List<Tag>> SearchTagsAsync(string searchTerm)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                    return _tags.Values.OrderBy(t => t.Name).ToList();

                return _tags.Values
                    .Where(t => t.Name?.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) == true ||
                               t.Description?.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) == true)
                    .OrderBy(t => t.Name)
                    .ToList();
            }
        }

        #endregion

        #region Entity Tag Association

        public async Task<bool> AddTagToEntityAsync(string entityId, string entityType, string tagId)
        {
            try
            {
                var tag = await GetTagAsync(tagId);
                if (tag == null) return false;

                var entityKey = $"{entityType}:{entityId}";
                TaggedEntity entity;
                
                lock (_lockObject)
                {
                    if (!_entities.TryGetValue(entityKey, out entity))
                    {
                        entity = new TaggedEntity
                        {
                            EntityId = entityId,
                            EntityType = entityType,
                            EntityName = entityId // Could be enhanced with actual entity name lookup
                        };
                        _entities[entityKey] = entity;
                    }

                    if (!entity.Tags.Any(t => t.Id == tagId))
                    {
                        entity.Tags.Add(tag);
                        entity.LastActivity = DateTime.Now;
                        tag.UsageCount++;
                    }
                }

                await SaveEntitiesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> RemoveTagFromEntityAsync(string entityId, string entityType, string tagId)
        {
            try
            {
                var entityKey = $"{entityType}:{entityId}";
                
                lock (_lockObject)
                {
                    if (_entities.TryGetValue(entityKey, out var entity))
                    {
                        var tag = entity.Tags.FirstOrDefault(t => t.Id == tagId);
                        if (tag != null)
                        {
                            entity.Tags.Remove(tag);
                            entity.LastActivity = DateTime.Now;
                            tag.UsageCount = Math.Max(0, tag.UsageCount - 1);
                        }
                    }
                }

                await SaveEntitiesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<List<Tag>> GetTagsForEntityAsync(string entityId, string entityType)
        {
            await Task.CompletedTask;
            
            var entityKey = $"{entityType}:{entityId}";
            
            lock (_lockObject)
            {
                if (_entities.TryGetValue(entityKey, out var entity))
                {
                    return entity.Tags.ToList();
                }
                
                return new List<Tag>();
            }
        }

        public async Task<List<TaggedEntity>> GetEntitiesWithTagAsync(string tagId)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _entities.Values
                    .Where(e => e.Tags.Any(t => t.Id == tagId))
                    .ToList();
            }
        }

        #endregion

        #region Note Tag Association

        public async Task<bool> AddTagToNoteAsync(string noteId, string tagId)
        {
            try
            {
                var note = await GetNoteAsync(noteId);
                var tag = await GetTagAsync(tagId);
                
                if (note == null || tag == null) return false;

                if (!note.Tags.Contains(tag.Name))
                {
                    note.Tags.Add(tag.Name);
                    tag.UsageCount++;
                    await UpdateNoteAsync(note);
                    await UpdateTagAsync(tag);
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> RemoveTagFromNoteAsync(string noteId, string tagId)
        {
            try
            {
                var note = await GetNoteAsync(noteId);
                var tag = await GetTagAsync(tagId);
                
                if (note == null || tag == null) return false;

                if (note.Tags.Remove(tag.Name))
                {
                    tag.UsageCount = Math.Max(0, tag.UsageCount - 1);
                    await UpdateNoteAsync(note);
                    await UpdateTagAsync(tag);
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<List<Tag>> GetTagsForNoteAsync(string noteId)
        {
            var note = await GetNoteAsync(noteId);
            if (note?.Tags == null) return new List<Tag>();

            var result = new List<Tag>();
            foreach (var tagName in note.Tags)
            {
                var tag = await GetTagByNameAsync(tagName);
                if (tag != null)
                    result.Add(tag);
            }

            return result;
        }

        #endregion

        #region Bulk Operations

        public async Task<bool> BulkAddTagsAsync(List<string> entityIds, string entityType, List<string> tagIds)
        {
            try
            {
                foreach (var entityId in entityIds)
                {
                    foreach (var tagId in tagIds)
                    {
                        await AddTagToEntityAsync(entityId, entityType, tagId);
                    }
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> BulkRemoveTagsAsync(List<string> entityIds, string entityType, List<string> tagIds)
        {
            try
            {
                foreach (var entityId in entityIds)
                {
                    foreach (var tagId in tagIds)
                    {
                        await RemoveTagFromEntityAsync(entityId, entityType, tagId);
                    }
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> BulkDeleteNotesAsync(List<string> noteIds)
        {
            try
            {
                foreach (var noteId in noteIds)
                {
                    await DeleteNoteAsync(noteId);
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        #endregion

        #region Analytics

        public async Task<Dictionary<string, int>> GetTagUsageStatisticsAsync()
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _tags.Values
                    .Where(t => t.UsageCount > 0)
                    .OrderByDescending(t => t.UsageCount)
                    .ToDictionary(t => t.Name, t => t.UsageCount);
            }
        }

        public async Task<Dictionary<NoteType, int>> GetNoteTypeStatisticsAsync()
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _notes.Values
                    .GroupBy(n => n.Type)
                    .ToDictionary(g => g.Key, g => g.Count());
            }
        }

        public async Task<List<Note>> GetRecentNotesAsync(int count = 10)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _notes.Values
                    .OrderByDescending(n => n.LastModified)
                    .Take(count)
                    .ToList();
            }
        }

        public async Task<List<Tag>> GetMostUsedTagsAsync(int count = 10)
        {
            await Task.CompletedTask;
            
            lock (_lockObject)
            {
                return _tags.Values
                    .OrderByDescending(t => t.UsageCount)
                    .Take(count)
                    .ToList();
            }
        }

        #endregion

        #region Import/Export

        public async Task<bool> ExportNotesAsync(string filePath, List<string> noteIds = null)
        {
            try
            {
                List<Note> notesToExport;
                
                lock (_lockObject)
                {
                    if (noteIds != null)
                    {
                        notesToExport = _notes.Values.Where(n => noteIds.Contains(n.Id)).ToList();
                    }
                    else
                    {
                        notesToExport = _notes.Values.ToList();
                    }
                }

                var json = JsonConvert.SerializeObject(notesToExport, Formatting.Indented);
                await File.WriteAllTextAsync(filePath, json);
                
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ImportNotesAsync(string filePath)
        {
            try
            {
                if (!File.Exists(filePath)) return false;

                var json = await File.ReadAllTextAsync(filePath);
                var notes = JsonConvert.DeserializeObject<List<Note>>(json);

                if (notes != null)
                {
                    lock (_lockObject)
                    {
                        foreach (var note in notes)
                        {
                            _notes[note.Id] = note;
                        }
                    }

                    await SaveNotesAsync();
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ExportTagsAsync(string filePath)
        {
            try
            {
                List<Tag> tags;
                
                lock (_lockObject)
                {
                    tags = _tags.Values.ToList();
                }

                var json = JsonConvert.SerializeObject(tags, Formatting.Indented);
                await File.WriteAllTextAsync(filePath, json);
                
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ImportTagsAsync(string filePath)
        {
            try
            {
                if (!File.Exists(filePath)) return false;

                var json = await File.ReadAllTextAsync(filePath);
                var tags = JsonConvert.DeserializeObject<List<Tag>>(json);

                if (tags != null)
                {
                    lock (_lockObject)
                    {
                        foreach (var tag in tags)
                        {
                            if (!_tags.ContainsKey(tag.Id))
                            {
                                _tags[tag.Id] = tag;
                            }
                        }
                    }

                    await SaveTagsAsync();
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        #endregion

        #region Private Methods

        private async Task LoadDataAsync()
        {
            try
            {
                await LoadNotesAsync();
                await LoadTagsAsync();
                await LoadEntitiesAsync();
            }
            catch
            {
                // Handle loading errors gracefully
            }
        }

        private async Task LoadNotesAsync()
        {
            try
            {
                var filePath = Path.Combine(_dataPath, "notes.json");
                if (File.Exists(filePath))
                {
                    var json = await File.ReadAllTextAsync(filePath);
                    var notes = JsonConvert.DeserializeObject<List<Note>>(json);
                    
                    if (notes != null)
                    {
                        lock (_lockObject)
                        {
                            _notes.Clear();
                            foreach (var note in notes)
                            {
                                _notes[note.Id] = note;
                            }
                        }
                    }
                }
            }
            catch
            {
                // Handle file corruption gracefully
            }
        }

        private async Task SaveNotesAsync()
        {
            try
            {
                List<Note> notes;
                lock (_lockObject)
                {
                    notes = _notes.Values.ToList();
                }

                var filePath = Path.Combine(_dataPath, "notes.json");
                var json = JsonConvert.SerializeObject(notes, Formatting.Indented);
                await File.WriteAllTextAsync(filePath, json);
            }
            catch
            {
                // Handle save errors gracefully
            }
        }

        private async Task LoadTagsAsync()
        {
            try
            {
                var filePath = Path.Combine(_dataPath, "tags.json");
                if (File.Exists(filePath))
                {
                    var json = await File.ReadAllTextAsync(filePath);
                    var tags = JsonConvert.DeserializeObject<List<Tag>>(json);
                    
                    if (tags != null)
                    {
                        lock (_lockObject)
                        {
                            _tags.Clear();
                            foreach (var tag in tags)
                            {
                                _tags[tag.Id] = tag;
                            }
                        }
                    }
                }
            }
            catch
            {
                // Handle file corruption gracefully
            }
        }

        private async Task SaveTagsAsync()
        {
            try
            {
                List<Tag> tags;
                lock (_lockObject)
                {
                    tags = _tags.Values.ToList();
                }

                var filePath = Path.Combine(_dataPath, "tags.json");
                var json = JsonConvert.SerializeObject(tags, Formatting.Indented);
                await File.WriteAllTextAsync(filePath, json);
            }
            catch
            {
                // Handle save errors gracefully
            }
        }

        private async Task LoadEntitiesAsync()
        {
            try
            {
                var filePath = Path.Combine(_dataPath, "entities.json");
                if (File.Exists(filePath))
                {
                    var json = await File.ReadAllTextAsync(filePath);
                    var entities = JsonConvert.DeserializeObject<List<TaggedEntity>>(json);
                    
                    if (entities != null)
                    {
                        lock (_lockObject)
                        {
                            _entities.Clear();
                            foreach (var entity in entities)
                            {
                                var key = $"{entity.EntityType}:{entity.EntityId}";
                                _entities[key] = entity;
                            }
                        }
                    }
                }
            }
            catch
            {
                // Handle file corruption gracefully
            }
        }

        private async Task SaveEntitiesAsync()
        {
            try
            {
                List<TaggedEntity> entities;
                lock (_lockObject)
                {
                    entities = _entities.Values.ToList();
                }

                var filePath = Path.Combine(_dataPath, "entities.json");
                var json = JsonConvert.SerializeObject(entities, Formatting.Indented);
                await File.WriteAllTextAsync(filePath, json);
            }
            catch
            {
                // Handle save errors gracefully
            }
        }

        #endregion
    }
}