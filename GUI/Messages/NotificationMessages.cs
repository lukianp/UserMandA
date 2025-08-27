using System;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Messages
{
    /// <summary>
    /// Message sent when a notification is added
    /// </summary>
    public class NotificationAddedMessage
    {
        public NotificationAddedMessage(Notification notification)
        {
            Notification = notification ?? throw new ArgumentNullException(nameof(notification));
            Timestamp = DateTime.Now;
        }

        public Notification Notification { get; }
        public DateTime Timestamp { get; }
    }

    /// <summary>
    /// Message sent when a notification is updated
    /// </summary>
    public class NotificationUpdatedMessage
    {
        public NotificationUpdatedMessage(Notification notification)
        {
            Notification = notification ?? throw new ArgumentNullException(nameof(notification));
            Timestamp = DateTime.Now;
        }

        public Notification Notification { get; }
        public DateTime Timestamp { get; }
    }

    /// <summary>
    /// Message sent when a notification is removed
    /// </summary>
    public class NotificationRemovedMessage
    {
        public NotificationRemovedMessage(Guid notificationId)
        {
            NotificationId = notificationId;
            Timestamp = DateTime.Now;
        }

        public Guid NotificationId { get; }
        public DateTime Timestamp { get; }
    }

    /// <summary>
    /// Message sent when all notifications are cleared
    /// </summary>
    public class NotificationsClearedMessage
    {
        public NotificationsClearedMessage()
        {
            Timestamp = DateTime.Now;
        }

        public DateTime Timestamp { get; }
    }

    /// <summary>
    /// Message sent when multiple notifications are updated at once
    /// </summary>
    public class NotificationBulkUpdateMessage
    {
        public NotificationBulkUpdateMessage()
        {
            Timestamp = DateTime.Now;
        }

        public DateTime Timestamp { get; }
    }
}