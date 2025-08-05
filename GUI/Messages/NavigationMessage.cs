using System;

namespace MandADiscoverySuite.Messages
{
    /// <summary>
    /// Message sent when navigation occurs in the application
    /// </summary>
    public class NavigationMessage
    {
        public NavigationMessage(string viewName, object parameters = null)
        {
            ViewName = viewName ?? throw new ArgumentNullException(nameof(viewName));
            Parameters = parameters;
            Timestamp = DateTime.Now;
        }

        public string ViewName { get; }
        public object Parameters { get; }
        public DateTime Timestamp { get; }
    }

    /// <summary>
    /// Message sent when a breadcrumb navigation request is made
    /// </summary>
    public class BreadcrumbNavigationMessage
    {
        public BreadcrumbNavigationMessage(string displayName, string viewName, object parameters = null)
        {
            DisplayName = displayName ?? throw new ArgumentNullException(nameof(displayName));
            ViewName = viewName ?? throw new ArgumentNullException(nameof(viewName));
            Parameters = parameters;
            Timestamp = DateTime.Now;
        }

        public string DisplayName { get; }
        public string ViewName { get; }
        public object Parameters { get; }
        public DateTime Timestamp { get; }
    }
}