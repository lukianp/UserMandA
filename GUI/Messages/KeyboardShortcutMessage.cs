using System;

namespace MandADiscoverySuite.Messages
{
    /// <summary>
    /// Message sent when a keyboard shortcut is executed
    /// </summary>
    public class KeyboardShortcutMessage
    {
        public KeyboardShortcutMessage(string actionName)
        {
            ActionName = actionName ?? throw new ArgumentNullException(nameof(actionName));
            Timestamp = DateTime.Now;
        }

        public string ActionName { get; }
        public DateTime Timestamp { get; }
    }

    /// <summary>
    /// Message sent when a keyboard shortcut is successfully executed
    /// </summary>
    public class ShortcutExecutedMessage
    {
        public ShortcutExecutedMessage(string shortcutName, string keyGesture)
        {
            ShortcutName = shortcutName ?? throw new ArgumentNullException(nameof(shortcutName));
            KeyGesture = keyGesture ?? throw new ArgumentNullException(nameof(keyGesture));
            Timestamp = DateTime.Now;
        }

        public string ShortcutName { get; }
        public string KeyGesture { get; }
        public DateTime Timestamp { get; }
    }
}