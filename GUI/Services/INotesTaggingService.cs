using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Interface for Notes and Tagging service
    /// </summary>
    public interface INotesTaggingService
    {
        // Note Management
        Task<Note> CreateNoteAsync(string entityId, string entityType, string title, string content, NoteType type = NoteType.General);
        Task<Note> GetNoteAsync(string noteId);
        Task<List<Note>> GetNotesForEntityAsync(string entityId, string entityType);
        Task<List<Note>> GetAllNotesAsync();
        Task<bool> UpdateNoteAsync(Note note);
        Task<bool> DeleteNoteAsync(string noteId);
        Task<bool> PinNoteAsync(string noteId, bool isPinned = true);
        Task<List<Note>> SearchNotesAsync(string searchTerm, NoteTagFilter filter = null);

        // Tag Management
        Task<Tag> CreateTagAsync(string name, string color = null, TagCategory category = TagCategory.General);
        Task<Tag> GetTagAsync(string tagId);
        Task<Tag> GetTagByNameAsync(string name);
        Task<List<Tag>> GetAllTagsAsync();
        Task<List<Tag>> GetTagsByCategoryAsync(TagCategory category);
        Task<bool> UpdateTagAsync(Tag tag);
        Task<bool> DeleteTagAsync(string tagId);
        Task<List<Tag>> SearchTagsAsync(string searchTerm);

        // Entity Tag Association
        Task<bool> AddTagToEntityAsync(string entityId, string entityType, string tagId);
        Task<bool> RemoveTagFromEntityAsync(string entityId, string entityType, string tagId);
        Task<List<Tag>> GetTagsForEntityAsync(string entityId, string entityType);
        Task<List<TaggedEntity>> GetEntitiesWithTagAsync(string tagId);

        // Note Tag Association
        Task<bool> AddTagToNoteAsync(string noteId, string tagId);
        Task<bool> RemoveTagFromNoteAsync(string noteId, string tagId);
        Task<List<Tag>> GetTagsForNoteAsync(string noteId);

        // Bulk Operations
        Task<bool> BulkAddTagsAsync(List<string> entityIds, string entityType, List<string> tagIds);
        Task<bool> BulkRemoveTagsAsync(List<string> entityIds, string entityType, List<string> tagIds);
        Task<bool> BulkDeleteNotesAsync(List<string> noteIds);

        // Analytics
        Task<Dictionary<string, int>> GetTagUsageStatisticsAsync();
        Task<Dictionary<NoteType, int>> GetNoteTypeStatisticsAsync();
        Task<List<Note>> GetRecentNotesAsync(int count = 10);
        Task<List<Tag>> GetMostUsedTagsAsync(int count = 10);

        // Import/Export
        Task<bool> ExportNotesAsync(string filePath, List<string> noteIds = null);
        Task<bool> ImportNotesAsync(string filePath);
        Task<bool> ExportTagsAsync(string filePath);
        Task<bool> ImportTagsAsync(string filePath);

        // Events
        event EventHandler<NoteEventArgs> NoteCreated;
        event EventHandler<NoteEventArgs> NoteUpdated;
        event EventHandler<NoteEventArgs> NoteDeleted;
        event EventHandler<TagEventArgs> TagCreated;
        event EventHandler<TagEventArgs> TagUpdated;
        event EventHandler<TagEventArgs> TagDeleted;
    }

    /// <summary>
    /// Event arguments for note events
    /// </summary>
    public class NoteEventArgs : EventArgs
    {
        public Note Note { get; set; }
        public string EntityId { get; set; }
        public string EntityType { get; set; }
        public DateTime Timestamp { get; set; }

        public NoteEventArgs()
        {
            Timestamp = DateTime.Now;
        }
    }

    /// <summary>
    /// Event arguments for tag events
    /// </summary>
    public class TagEventArgs : EventArgs
    {
        public Tag Tag { get; set; }
        public string EntityId { get; set; }
        public string EntityType { get; set; }
        public DateTime Timestamp { get; set; }

        public TagEventArgs()
        {
            Timestamp = DateTime.Now;
        }
    }
}