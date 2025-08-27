using System;

namespace MandADiscoverySuite.Messages
{
    /// <summary>
    /// Message for requesting actions to be performed on data objects
    /// </summary>
    public class ActionMessage
    {
        public ActionMessage(string actionType, object data, object parameters = null)
        {
            ActionType = actionType ?? throw new ArgumentNullException(nameof(actionType));
            Data = data;
            Parameters = parameters;
            Timestamp = DateTime.Now;
        }

        /// <summary>
        /// The type of action to perform (e.g., "Export", "Delete", "Update")
        /// </summary>
        public string ActionType { get; }

        /// <summary>
        /// The data object the action should be performed on
        /// </summary>
        public object Data { get; }

        /// <summary>
        /// Additional parameters for the action
        /// </summary>
        public object Parameters { get; }

        /// <summary>
        /// When the action was requested
        /// </summary>
        public DateTime Timestamp { get; }
    }

    /// <summary>
    /// Message for bulk actions on multiple data objects
    /// </summary>
    public class BulkActionMessage
    {
        public BulkActionMessage(string actionType, object[] dataItems, object parameters = null)
        {
            ActionType = actionType ?? throw new ArgumentNullException(nameof(actionType));
            DataItems = dataItems ?? throw new ArgumentNullException(nameof(dataItems));
            Parameters = parameters;
            Timestamp = DateTime.Now;
        }

        /// <summary>
        /// The type of action to perform
        /// </summary>
        public string ActionType { get; }

        /// <summary>
        /// The data objects the action should be performed on
        /// </summary>
        public object[] DataItems { get; }

        /// <summary>
        /// Additional parameters for the action
        /// </summary>
        public object Parameters { get; }

        /// <summary>
        /// When the action was requested
        /// </summary>
        public DateTime Timestamp { get; }
    }

    /// <summary>
    /// Message indicating the result of an action
    /// </summary>
    public class ActionResultMessage
    {
        public ActionResultMessage(string actionType, bool success, string message = null, object result = null, Exception exception = null)
        {
            ActionType = actionType ?? throw new ArgumentNullException(nameof(actionType));
            Success = success;
            Message = message;
            Result = result;
            Exception = exception;
            Timestamp = DateTime.Now;
        }

        /// <summary>
        /// The type of action that was performed
        /// </summary>
        public string ActionType { get; }

        /// <summary>
        /// Whether the action was successful
        /// </summary>
        public bool Success { get; }

        /// <summary>
        /// Optional message describing the result
        /// </summary>
        public string Message { get; }

        /// <summary>
        /// Optional result data from the action
        /// </summary>
        public object Result { get; }

        /// <summary>
        /// Exception if the action failed
        /// </summary>
        public Exception Exception { get; }

        /// <summary>
        /// When the action completed
        /// </summary>
        public DateTime Timestamp { get; }
    }
}