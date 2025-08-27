using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using Newtonsoft.Json;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Global state store implementing Redux-like pattern with immutable state management
    /// </summary>
    public class GlobalStateStore : IDisposable
    {
        private readonly ILogger<GlobalStateStore> _logger;
        private readonly IMessenger _messenger;
        private readonly object _stateLock = new object();
        private readonly ConcurrentDictionary<string, IStateReducer> _reducers;
        private readonly ConcurrentDictionary<string, object> _middlewares;
        private readonly List<IStateSubscriber> _subscribers;
        private readonly Timer _persistenceTimer;
        
        private AppState _currentState;
        private readonly string _persistencePath;
        private bool _disposed;

        public GlobalStateStore(ILogger<GlobalStateStore> logger = null, IMessenger messenger = null)
        {
            _logger = logger;
            _messenger = messenger ?? WeakReferenceMessenger.Default;
            _reducers = new ConcurrentDictionary<string, IStateReducer>();
            _middlewares = new ConcurrentDictionary<string, object>();
            _subscribers = new List<IStateSubscriber>();
            
            _persistencePath = System.IO.Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "MandADiscoverySuite", "state.json");
            
            _currentState = new AppState();
            
            // Auto-save state every 30 seconds
            _persistenceTimer = new Timer(PersistState, null, TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(30));
            
            InitializeDefaultReducers();
            LoadPersistedState();
            
            _logger?.LogInformation("Global state store initialized");
        }

        #region Public Properties

        /// <summary>
        /// Gets the current application state (immutable)
        /// </summary>
        public AppState CurrentState 
        { 
            get 
            { 
                lock (_stateLock)
                {
                    return _currentState.Clone();
                }
            } 
        }

        /// <summary>
        /// Gets the count of registered reducers
        /// </summary>
        public int ReducerCount => _reducers.Count;

        /// <summary>
        /// Gets the count of active subscribers
        /// </summary>
        public int SubscriberCount => _subscribers.Count;

        #endregion

        #region Public Methods

        /// <summary>
        /// Dispatches an action to update the state
        /// </summary>
        public async Task<ActionResult> DispatchAsync(IAction action)
        {
            if (action == null)
                throw new ArgumentNullException(nameof(action));

            try
            {
                _logger?.LogDebug("Dispatching action: {ActionType}", action.Type);
                
                // Apply middleware (before)
                foreach (var middleware in _middlewares.Values.OfType<IMiddleware>())
                {
                    action = await middleware.BeforeDispatchAsync(action, _currentState);
                    if (action == null) // Middleware can cancel action
                    {
                        return ActionResult.Cancelled("Action cancelled by middleware");
                    }
                }

                AppState newState;
                lock (_stateLock)
                {
                    // Find and execute appropriate reducer
                    var reducer = FindReducer(action.Type);
                    if (reducer == null)
                    {
                        _logger?.LogWarning("No reducer found for action type: {ActionType}", action.Type);
                        return ActionResult.Failed($"No reducer found for action type: {action.Type}");
                    }

                    newState = reducer.Reduce(_currentState, action);
                    
                    // Validate state change
                    if (!IsValidStateTransition(_currentState, newState, action))
                    {
                        _logger?.LogError("Invalid state transition for action: {ActionType}", action.Type);
                        return ActionResult.Failed("Invalid state transition");
                    }

                    _currentState = newState;
                }

                // Apply middleware (after)
                foreach (var middleware in _middlewares.Values.OfType<IMiddleware>())
                {
                    await middleware.AfterDispatchAsync(action, newState);
                }

                // Notify subscribers
                await NotifySubscribersAsync(action, newState);
                
                // Send global message
                _messenger.Send(new StateChangedMessage(action, newState));
                
                _logger?.LogDebug("Action dispatched successfully: {ActionType}", action.Type);
                return ActionResult.Success();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error dispatching action: {ActionType}", action.Type);
                return ActionResult.Failed(ex.Message);
            }
        }

        /// <summary>
        /// Registers a reducer for handling specific action types
        /// </summary>
        public void RegisterReducer(string actionTypePrefix, IStateReducer reducer)
        {
            if (string.IsNullOrEmpty(actionTypePrefix))
                throw new ArgumentException("Action type prefix cannot be null or empty", nameof(actionTypePrefix));
            
            if (reducer == null)
                throw new ArgumentNullException(nameof(reducer));

            _reducers.TryAdd(actionTypePrefix, reducer);
            _logger?.LogDebug("Registered reducer for: {ActionTypePrefix}", actionTypePrefix);
        }

        /// <summary>
        /// Registers middleware for intercepting actions
        /// </summary>
        public void RegisterMiddleware(string name, IMiddleware middleware)
        {
            if (string.IsNullOrEmpty(name))
                throw new ArgumentException("Middleware name cannot be null or empty", nameof(name));
            
            if (middleware == null)
                throw new ArgumentNullException(nameof(middleware));

            _middlewares.TryAdd(name, middleware);
            _logger?.LogDebug("Registered middleware: {MiddlewareName}", name);
        }

        /// <summary>
        /// Subscribes to state changes
        /// </summary>
        public void Subscribe(IStateSubscriber subscriber)
        {
            if (subscriber == null)
                throw new ArgumentNullException(nameof(subscriber));

            lock (_subscribers)
            {
                if (!_subscribers.Contains(subscriber))
                {
                    _subscribers.Add(subscriber);
                    _logger?.LogDebug("Added state subscriber: {SubscriberType}", subscriber.GetType().Name);
                }
            }
        }

        /// <summary>
        /// Unsubscribes from state changes
        /// </summary>
        public void Unsubscribe(IStateSubscriber subscriber)
        {
            if (subscriber == null)
                return;

            lock (_subscribers)
            {
                if (_subscribers.Remove(subscriber))
                {
                    _logger?.LogDebug("Removed state subscriber: {SubscriberType}", subscriber.GetType().Name);
                }
            }
        }

        /// <summary>
        /// Gets a slice of the current state
        /// </summary>
        public T GetState<T>(Func<AppState, T> selector)
        {
            if (selector == null)
                throw new ArgumentNullException(nameof(selector));

            lock (_stateLock)
            {
                return selector(_currentState);
            }
        }

        /// <summary>
        /// Resets the state to initial values
        /// </summary>
        public async Task ResetStateAsync()
        {
            try
            {
                var resetAction = new ResetStateAction();
                await DispatchAsync(resetAction);
                
                _logger?.LogInformation("State reset successfully");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error resetting state");
            }
        }

        /// <summary>
        /// Creates a snapshot of the current state
        /// </summary>
        public StateSnapshot CreateSnapshot()
        {
            lock (_stateLock)
            {
                return new StateSnapshot
                {
                    Timestamp = DateTime.UtcNow,
                    State = _currentState.Clone(),
                    Version = _currentState.Version
                };
            }
        }

        /// <summary>
        /// Restores state from a snapshot
        /// </summary>
        public async Task RestoreFromSnapshotAsync(StateSnapshot snapshot)
        {
            if (snapshot?.State == null)
                throw new ArgumentNullException(nameof(snapshot));

            try
            {
                var restoreAction = new RestoreStateAction(snapshot.State);
                await DispatchAsync(restoreAction);
                
                _logger?.LogInformation("State restored from snapshot: {Timestamp}", snapshot.Timestamp);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error restoring state from snapshot");
            }
        }

        /// <summary>
        /// Gets debugging information about the store
        /// </summary>
        public StoreDebugInfo GetDebugInfo()
        {
            lock (_stateLock)
            {
                return new StoreDebugInfo
                {
                    CurrentStateVersion = _currentState.Version,
                    RegisteredReducers = _reducers.Keys.ToList(),
                    RegisteredMiddlewares = _middlewares.Keys.ToList(),
                    SubscriberCount = _subscribers.Count,
                    StateSize = EstimateStateSize(_currentState),
                    LastActionTimestamp = _currentState.LastModified
                };
            }
        }

        #endregion

        #region Private Methods

        private void InitializeDefaultReducers()
        {
            try
            {
                // UI State Reducer
                RegisterReducer("UI", new UIStateReducer());
                
                // Discovery State Reducer
                RegisterReducer("DISCOVERY", new DiscoveryStateReducer());
                
                // User State Reducer
                RegisterReducer("USER", new UserStateReducer());
                
                // System State Reducer
                RegisterReducer("SYSTEM", new SystemStateReducer());
                
                _logger?.LogDebug("Initialized default reducers");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error initializing default reducers");
            }
        }

        private IStateReducer FindReducer(string actionType)
        {
            return _reducers.FirstOrDefault(kvp => actionType.StartsWith(kvp.Key, StringComparison.OrdinalIgnoreCase)).Value;
        }

        private bool IsValidStateTransition(AppState currentState, AppState newState, IAction action)
        {
            try
            {
                // Basic validation rules
                if (newState == null) return false;
                if (newState.Version <= currentState.Version) return false;
                if (newState.LastModified <= currentState.LastModified) return false;
                
                // Action-specific validation
                return action switch
                {
                    ResetStateAction => true,
                    RestoreStateAction => true,
                    _ => ValidateBusinessRules(currentState, newState, action)
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error validating state transition");
                return false;
            }
        }

        private bool ValidateBusinessRules(AppState currentState, AppState newState, IAction action)
        {
            // Add business rule validations here
            return true;
        }

        private async Task NotifySubscribersAsync(IAction action, AppState newState)
        {
            var subscribersToNotify = new List<IStateSubscriber>();
            
            lock (_subscribers)
            {
                subscribersToNotify.AddRange(_subscribers);
            }

            var tasks = subscribersToNotify.Select(async subscriber =>
            {
                try
                {
                    await subscriber.OnStateChangedAsync(action, newState);
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error notifying subscriber: {SubscriberType}", subscriber.GetType().Name);
                }
            });

            await Task.WhenAll(tasks);
        }

        private void LoadPersistedState()
        {
            try
            {
                if (System.IO.File.Exists(_persistencePath))
                {
                    var json = System.IO.File.ReadAllText(_persistencePath);
                    var persistedState = JsonConvert.DeserializeObject<AppState>(json);
                    
                    if (persistedState != null)
                    {
                        lock (_stateLock)
                        {
                            _currentState = persistedState;
                        }
                        
                        _logger?.LogInformation("Loaded persisted state from: {Path}", _persistencePath);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading persisted state");
            }
        }

        private void PersistState(object state)
        {
            try
            {
                AppState stateToSave;
                lock (_stateLock)
                {
                    stateToSave = _currentState.Clone();
                }

                var directory = System.IO.Path.GetDirectoryName(_persistencePath);
                if (!System.IO.Directory.Exists(directory))
                {
                    System.IO.Directory.CreateDirectory(directory);
                }

                var json = JsonConvert.SerializeObject(stateToSave, Formatting.Indented);
                System.IO.File.WriteAllText(_persistencePath, json);
                
                _logger?.LogDebug("Persisted state to: {Path}", _persistencePath);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error persisting state");
            }
        }

        private long EstimateStateSize(AppState state)
        {
            try
            {
                var json = JsonConvert.SerializeObject(state);
                return json.Length * 2; // Rough estimate in bytes
            }
            catch
            {
                return 0;
            }
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            if (!_disposed)
            {
                try
                {
                    _persistenceTimer?.Dispose();
                    PersistState(null);
                    
                    lock (_subscribers)
                    {
                        _subscribers.Clear();
                    }
                    
                    _reducers.Clear();
                    _middlewares.Clear();
                    
                    _logger?.LogInformation("Global state store disposed");
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error disposing global state store");
                }
                finally
                {
                    _disposed = true;
                }
            }
        }

        #endregion
    }

    #region State Models

    /// <summary>
    /// Root application state
    /// </summary>
    public class AppState
    {
        public long Version { get; set; } = 1;
        public DateTime LastModified { get; set; } = DateTime.UtcNow;
        public UIState UI { get; set; } = new UIState();
        public DiscoveryState Discovery { get; set; } = new DiscoveryState();
        public UserState User { get; set; } = new UserState();
        public SystemState System { get; set; } = new SystemState();

        public AppState Clone()
        {
            var json = JsonConvert.SerializeObject(this);
            var clone = JsonConvert.DeserializeObject<AppState>(json);
            return clone;
        }
    }

    /// <summary>
    /// UI-related state
    /// </summary>
    public class UIState
    {
        public string CurrentTheme { get; set; } = "Light";
        public string CurrentView { get; set; } = "Dashboard";
        public Dictionary<string, object> ViewStates { get; set; } = new Dictionary<string, object>();
        public bool IsLoading { get; set; }
        public List<string> OpenTabs { get; set; } = new List<string>();
        public Dictionary<string, bool> PanelVisibility { get; set; } = new Dictionary<string, bool>();
    }

    /// <summary>
    /// Discovery operation state
    /// </summary>
    public class DiscoveryState
    {
        public List<string> ActiveDiscoveries { get; set; } = new List<string>();
        public Dictionary<string, object> DiscoveryResults { get; set; } = new Dictionary<string, object>();
        public Dictionary<string, DateTime> LastDiscoveryTimes { get; set; } = new Dictionary<string, DateTime>();
        public string CurrentProfile { get; set; }
    }

    /// <summary>
    /// User-related state
    /// </summary>
    public class UserState
    {
        public string Username { get; set; }
        public Dictionary<string, object> Preferences { get; set; } = new Dictionary<string, object>();
        public List<string> RecentActions { get; set; } = new List<string>();
        public Dictionary<string, object> Settings { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// System-related state
    /// </summary>
    public class SystemState
    {
        public bool IsOnline { get; set; } = true;
        public Dictionary<string, object> PerformanceMetrics { get; set; } = new Dictionary<string, object>();
        public List<string> SystemMessages { get; set; } = new List<string>();
        public DateTime LastHealthCheck { get; set; } = DateTime.UtcNow;
    }

    #endregion

    #region Interfaces

    /// <summary>
    /// Base interface for all actions
    /// </summary>
    public interface IAction
    {
        string Type { get; }
        DateTime Timestamp { get; }
        object Payload { get; }
    }

    /// <summary>
    /// Interface for state reducers
    /// </summary>
    public interface IStateReducer
    {
        AppState Reduce(AppState currentState, IAction action);
    }

    /// <summary>
    /// Interface for middleware
    /// </summary>
    public interface IMiddleware
    {
        Task<IAction> BeforeDispatchAsync(IAction action, AppState currentState);
        Task AfterDispatchAsync(IAction action, AppState newState);
    }

    /// <summary>
    /// Interface for state subscribers
    /// </summary>
    public interface IStateSubscriber
    {
        Task OnStateChangedAsync(IAction action, AppState newState);
    }

    #endregion

    #region Actions

    /// <summary>
    /// Base action implementation
    /// </summary>
    public abstract class BaseAction : IAction
    {
        protected BaseAction(object payload = null)
        {
            Timestamp = DateTime.UtcNow;
            Payload = payload;
        }

        public abstract string Type { get; }
        public DateTime Timestamp { get; }
        public object Payload { get; }
    }

    /// <summary>
    /// Action to reset the entire state
    /// </summary>
    public class ResetStateAction : BaseAction
    {
        public override string Type => "SYSTEM_RESET_STATE";
    }

    /// <summary>
    /// Action to restore state from snapshot
    /// </summary>
    public class RestoreStateAction : BaseAction
    {
        public RestoreStateAction(AppState state) : base(state) { }
        public override string Type => "SYSTEM_RESTORE_STATE";
    }

    #endregion

    #region Reducers

    /// <summary>
    /// UI state reducer
    /// </summary>
    public class UIStateReducer : IStateReducer
    {
        public AppState Reduce(AppState currentState, IAction action)
        {
            var newState = currentState.Clone();
            newState.Version++;
            newState.LastModified = DateTime.UtcNow;

            switch (action.Type)
            {
                case "UI_SET_THEME":
                    newState.UI.CurrentTheme = action.Payload?.ToString() ?? "Light";
                    break;
                    
                case "UI_SET_VIEW":
                    newState.UI.CurrentView = action.Payload?.ToString() ?? "Dashboard";
                    break;
                    
                case "UI_SET_LOADING":
                    newState.UI.IsLoading = action.Payload is bool loading && loading;
                    break;
                    
                case "UI_OPEN_TAB":
                    if (action.Payload is string tab && !newState.UI.OpenTabs.Contains(tab))
                    {
                        newState.UI.OpenTabs.Add(tab);
                    }
                    break;
                    
                case "UI_CLOSE_TAB":
                    if (action.Payload is string tabToClose)
                    {
                        newState.UI.OpenTabs.Remove(tabToClose);
                    }
                    break;
            }

            return newState;
        }
    }

    /// <summary>
    /// Discovery state reducer
    /// </summary>
    public class DiscoveryStateReducer : IStateReducer
    {
        public AppState Reduce(AppState currentState, IAction action)
        {
            var newState = currentState.Clone();
            newState.Version++;
            newState.LastModified = DateTime.UtcNow;

            switch (action.Type)
            {
                case "DISCOVERY_START":
                    if (action.Payload is string discoveryId && !newState.Discovery.ActiveDiscoveries.Contains(discoveryId))
                    {
                        newState.Discovery.ActiveDiscoveries.Add(discoveryId);
                    }
                    break;
                    
                case "DISCOVERY_COMPLETE":
                    if (action.Payload is string completedId)
                    {
                        newState.Discovery.ActiveDiscoveries.Remove(completedId);
                        newState.Discovery.LastDiscoveryTimes[completedId] = DateTime.UtcNow;
                    }
                    break;
                    
                case "DISCOVERY_SET_PROFILE":
                    newState.Discovery.CurrentProfile = action.Payload?.ToString();
                    break;
            }

            return newState;
        }
    }

    /// <summary>
    /// User state reducer
    /// </summary>
    public class UserStateReducer : IStateReducer
    {
        public AppState Reduce(AppState currentState, IAction action)
        {
            var newState = currentState.Clone();
            newState.Version++;
            newState.LastModified = DateTime.UtcNow;

            switch (action.Type)
            {
                case "USER_SET_USERNAME":
                    newState.User.Username = action.Payload?.ToString();
                    break;
                    
                case "USER_ADD_RECENT_ACTION":
                    if (action.Payload is string recentAction)
                    {
                        newState.User.RecentActions.Insert(0, recentAction);
                        if (newState.User.RecentActions.Count > 50)
                        {
                            newState.User.RecentActions.RemoveAt(50);
                        }
                    }
                    break;
            }

            return newState;
        }
    }

    /// <summary>
    /// System state reducer
    /// </summary>
    public class SystemStateReducer : IStateReducer
    {
        public AppState Reduce(AppState currentState, IAction action)
        {
            var newState = currentState.Clone();
            newState.Version++;
            newState.LastModified = DateTime.UtcNow;

            switch (action.Type)
            {
                case "SYSTEM_SET_ONLINE_STATUS":
                    newState.System.IsOnline = action.Payload is bool online && online;
                    break;
                    
                case "SYSTEM_UPDATE_HEALTH":
                    newState.System.LastHealthCheck = DateTime.UtcNow;
                    break;
                    
                case "SYSTEM_RESET_STATE":
                    return new AppState();
                    
                case "SYSTEM_RESTORE_STATE":
                    if (action.Payload is AppState restoredState)
                    {
                        restoredState.Version = newState.Version;
                        restoredState.LastModified = DateTime.UtcNow;
                        return restoredState;
                    }
                    break;
            }

            return newState;
        }
    }

    #endregion

    #region Support Classes

    /// <summary>
    /// Result of dispatching an action
    /// </summary>
    public class ActionResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }

        public static ActionResult Success(object data = null) => new ActionResult { IsSuccess = true, Data = data };
        public static ActionResult Failed(string message) => new ActionResult { IsSuccess = false, Message = message };
        public static ActionResult Cancelled(string message) => new ActionResult { IsSuccess = false, Message = message };
    }

    /// <summary>
    /// State snapshot for debugging and restoration
    /// </summary>
    public class StateSnapshot
    {
        public DateTime Timestamp { get; set; }
        public AppState State { get; set; }
        public long Version { get; set; }
    }

    /// <summary>
    /// Debug information about the store
    /// </summary>
    public class StoreDebugInfo
    {
        public long CurrentStateVersion { get; set; }
        public List<string> RegisteredReducers { get; set; }
        public List<string> RegisteredMiddlewares { get; set; }
        public int SubscriberCount { get; set; }
        public long StateSize { get; set; }
        public DateTime LastActionTimestamp { get; set; }
    }

    /// <summary>
    /// Message sent when state changes
    /// </summary>
    public class StateChangedMessage
    {
        public StateChangedMessage(IAction action, AppState newState)
        {
            Action = action;
            NewState = newState;
            Timestamp = DateTime.UtcNow;
        }

        public IAction Action { get; }
        public AppState NewState { get; }
        public DateTime Timestamp { get; }
    }

    #endregion
}