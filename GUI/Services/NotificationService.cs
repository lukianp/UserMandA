using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Timers;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Messages;
using Newtonsoft.Json;
using System.IO;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing application notifications and alerts
    /// </summary>
    public class NotificationService : IDisposable
    {
        private readonly ILogger<NotificationService> _logger;
        private readonly IMessenger _messenger;
        private readonly ObservableCollection<Notification> _notifications;
        private readonly Timer _cleanupTimer;
        private readonly string _notificationsPath;
        private readonly object _lockObject = new object();

        public NotificationService(ILogger<NotificationService> logger, IMessenger messenger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _messenger = messenger ?? throw new ArgumentNullException(nameof(messenger));
            
            _notifications = new ObservableCollection<Notification>();
            
            _notificationsPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "MandADiscoverySuite", "notifications.json");

            // Set up cleanup timer (runs every 5 minutes)
            _cleanupTimer = new Timer(TimeSpan.FromMinutes(5).TotalMilliseconds);
            _cleanupTimer.Elapsed += CleanupExpiredNotifications;
            _cleanupTimer.Start();

            LoadPersistedNotifications();
        }

        #region Properties

        public IReadOnlyCollection<Notification> Notifications
        {
            get
            {
                lock (_lockObject)
                {
                    return _notifications.ToList().AsReadOnly();
                }
            }
        }

        public int UnreadCount
        {
            get
            {
                lock (_lockObject)
                {
                    return _notifications.Count(n => !n.IsRead);
                }
            }
        }

        public int TotalCount
        {
            get
            {
                lock (_lockObject)
                {
                    return _notifications.Count;
                }
            }
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Adds a new notification
        /// </summary>
        public void AddNotification(string title, string message, NotificationType type = NotificationType.Information, 
            TimeSpan? autoHideDelay = null, string actionText = null, Action actionCallback = null)
        {
            try
            {
                var notification = new Notification
                {
                    Id = Guid.NewGuid(),
                    Title = title ?? throw new ArgumentNullException(nameof(title)),
                    Message = message ?? throw new ArgumentNullException(nameof(message)),
                    Type = type,
                    Timestamp = DateTime.Now,
                    IsRead = false,
                    IsPersistent = autoHideDelay == null,
                    AutoHideDelay = autoHideDelay,
                    ActionText = actionText,
                    ActionCallback = actionCallback
                };

                lock (_lockObject)
                {
                    _notifications.Insert(0, notification); // Add to beginning for newest first
                }

                // Send notification message
                _messenger.Send(new NotificationAddedMessage(notification));

                // Schedule auto-hide if specified
                if (autoHideDelay.HasValue)
                {
                    Task.Delay(autoHideDelay.Value).ContinueWith(_ => RemoveNotification(notification.Id));
                }

                _logger.LogDebug("Added notification: {Title} ({Type})", title, type);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding notification: {Title}", title);
            }
        }

        /// <summary>
        /// Adds a success notification
        /// </summary>
        public void AddSuccess(string title, string message, TimeSpan? autoHideDelay = null)
        {
            AddNotification(title, message, NotificationType.Success, autoHideDelay ?? TimeSpan.FromSeconds(5));
        }

        /// <summary>
        /// Adds an error notification
        /// </summary>
        public void AddError(string title, string message, string actionText = null, Action actionCallback = null)
        {
            AddNotification(title, message, NotificationType.Error, null, actionText, actionCallback);
        }

        /// <summary>
        /// Adds a warning notification
        /// </summary>
        public void AddWarning(string title, string message, TimeSpan? autoHideDelay = null)
        {
            AddNotification(title, message, NotificationType.Warning, autoHideDelay ?? TimeSpan.FromSeconds(10));
        }

        /// <summary>
        /// Adds an information notification
        /// </summary>
        public void AddInfo(string title, string message, TimeSpan? autoHideDelay = null)
        {
            AddNotification(title, message, NotificationType.Information, autoHideDelay ?? TimeSpan.FromSeconds(7));
        }

        /// <summary>
        /// Marks a notification as read
        /// </summary>
        public void MarkAsRead(Guid notificationId)
        {
            try
            {
                lock (_lockObject)
                {
                    var notification = _notifications.FirstOrDefault(n => n.Id == notificationId);
                    if (notification != null && !notification.IsRead)
                    {
                        notification.IsRead = true;
                        _messenger.Send(new NotificationUpdatedMessage(notification));
                        _logger.LogDebug("Marked notification as read: {Id}", notificationId);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification as read: {Id}", notificationId);
            }
        }

        /// <summary>
        /// Marks all notifications as read
        /// </summary>
        public void MarkAllAsRead()
        {
            try
            {
                lock (_lockObject)
                {
                    var unreadNotifications = _notifications.Where(n => !n.IsRead).ToList();
                    foreach (var notification in unreadNotifications)
                    {
                        notification.IsRead = true;
                    }

                    if (unreadNotifications.Any())
                    {
                        _messenger.Send(new NotificationBulkUpdateMessage());
                        _logger.LogDebug("Marked {Count} notifications as read", unreadNotifications.Count);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking all notifications as read");
            }
        }

        /// <summary>
        /// Removes a specific notification
        /// </summary>
        public void RemoveNotification(Guid notificationId)
        {
            try
            {
                lock (_lockObject)
                {
                    var notification = _notifications.FirstOrDefault(n => n.Id == notificationId);
                    if (notification != null)
                    {
                        _notifications.Remove(notification);
                        _messenger.Send(new NotificationRemovedMessage(notificationId));
                        _logger.LogDebug("Removed notification: {Id}", notificationId);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing notification: {Id}", notificationId);
            }
        }

        /// <summary>
        /// Clears all notifications
        /// </summary>
        public void ClearAll()
        {
            try
            {
                lock (_lockObject)
                {
                    var count = _notifications.Count;
                    _notifications.Clear();
                    
                    if (count > 0)
                    {
                        _messenger.Send(new NotificationsClearedMessage());
                        _logger.LogDebug("Cleared all {Count} notifications", count);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing all notifications");
            }
        }

        /// <summary>
        /// Gets notifications by type
        /// </summary>
        public IEnumerable<Notification> GetNotificationsByType(NotificationType type)
        {
            lock (_lockObject)
            {
                return _notifications.Where(n => n.Type == type).ToList();
            }
        }

        /// <summary>
        /// Gets notifications from the last specified time period
        /// </summary>
        public IEnumerable<Notification> GetRecentNotifications(TimeSpan timespan)
        {
            var cutoffTime = DateTime.Now - timespan;
            lock (_lockObject)
            {
                return _notifications.Where(n => n.Timestamp >= cutoffTime).ToList();
            }
        }

        /// <summary>
        /// Exports notifications to a file
        /// </summary>
        public async Task ExportNotificationsAsync(string filePath)
        {
            try
            {
                var notifications = Notifications.Select(n => new
                {
                    n.Id,
                    n.Title,
                    n.Message,
                    Type = n.Type.ToString(),
                    n.Timestamp,
                    n.IsRead
                }).ToList();

                var json = JsonConvert.SerializeObject(notifications, Formatting.Indented);
                await File.WriteAllTextAsync(filePath, json);

                _logger.LogInformation("Exported {Count} notifications to {FilePath}", notifications.Count, filePath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting notifications to {FilePath}", filePath);
                throw;
            }
        }

        #endregion

        #region Private Methods

        private void CleanupExpiredNotifications(object sender, ElapsedEventArgs e)
        {
            try
            {
                var cutoffTime = DateTime.Now.AddDays(-7); // Remove notifications older than 7 days
                
                lock (_lockObject)
                {
                    var expiredNotifications = _notifications
                        .Where(n => n.Timestamp < cutoffTime && n.IsRead)
                        .ToList();

                    foreach (var notification in expiredNotifications)
                    {
                        _notifications.Remove(notification);
                    }

                    if (expiredNotifications.Any())
                    {
                        _logger.LogDebug("Cleaned up {Count} expired notifications", expiredNotifications.Count);
                        _messenger.Send(new NotificationBulkUpdateMessage());
                    }
                }

                // Persist remaining notifications
                PersistNotifications();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during notification cleanup");
            }
        }

        private void LoadPersistedNotifications()
        {
            try
            {
                if (!File.Exists(_notificationsPath)) return;

                var json = File.ReadAllText(_notificationsPath);
                var persistedNotifications = JsonConvert.DeserializeObject<List<Notification>>(json);

                if (persistedNotifications != null)
                {
                    lock (_lockObject)
                    {
                        foreach (var notification in persistedNotifications.OrderByDescending(n => n.Timestamp))
                        {
                            _notifications.Add(notification);
                        }
                    }

                    _logger.LogDebug("Loaded {Count} persisted notifications", persistedNotifications.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error loading persisted notifications");
            }
        }

        private void PersistNotifications()
        {
            try
            {
                // Only persist important notifications
                var notificationsToPersist = _notifications
                    .Where(n => n.IsPersistent || n.Type == NotificationType.Error)
                    .Take(100) // Limit to last 100 notifications
                    .ToList();

                var directory = Path.GetDirectoryName(_notificationsPath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                var json = JsonConvert.SerializeObject(notificationsToPersist, Formatting.Indented);
                File.WriteAllText(_notificationsPath, json);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error persisting notifications");
            }
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            try
            {
                _cleanupTimer?.Stop();
                _cleanupTimer?.Dispose();
                PersistNotifications();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error disposing NotificationService");
            }
        }

        #endregion
    }

    /// <summary>
    /// Represents a single notification
    /// </summary>
    public class Notification
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public NotificationType Type { get; set; }
        public DateTime Timestamp { get; set; }
        public bool IsRead { get; set; }
        public bool IsPersistent { get; set; }
        public TimeSpan? AutoHideDelay { get; set; }
        public string ActionText { get; set; }
        
        [JsonIgnore]
        public Action ActionCallback { get; set; }

        public string TypeIcon => Type switch
        {
            NotificationType.Success => "✅",
            NotificationType.Warning => "⚠️",
            NotificationType.Error => "❌",
            NotificationType.Information => "ℹ️",
            _ => "📝"
        };

        public string FormattedTimestamp => Timestamp.ToString("yyyy-MM-dd HH:mm:ss");

        public string RelativeTime
        {
            get
            {
                var timeSpan = DateTime.Now - Timestamp;
                
                if (timeSpan.TotalMinutes < 1)
                    return "Just now";
                if (timeSpan.TotalMinutes < 60)
                    return $"{(int)timeSpan.TotalMinutes}m ago";
                if (timeSpan.TotalHours < 24)
                    return $"{(int)timeSpan.TotalHours}h ago";
                if (timeSpan.TotalDays < 7)
                    return $"{(int)timeSpan.TotalDays}d ago";
                
                return Timestamp.ToString("MMM dd");
            }
        }
    }

    /// <summary>
    /// Types of notifications
    /// </summary>
    public enum NotificationType
    {
        Information,
        Success,
        Warning,
        Error
    }
}