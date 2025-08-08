using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Windows.Interop;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Manages global keyboard shortcuts and application-wide shortcut handling
    /// </summary>
    public class KeyboardShortcutManager : IDisposable
    {
        private readonly IKeyboardShortcutService _shortcutService;
        private readonly Dictionary<Window, List<WeakReference>> _windowHandlers;
        private readonly List<GlobalHotKey> _globalHotKeys;
        private bool _isDisposed = false;
        private HwndSource _hwndSource;
        private readonly object _lockObject = new object();

        // Windows API for global hot keys
        [DllImport("user32.dll")]
        private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);

        [DllImport("user32.dll")]
        private static extern bool UnregisterHotKey(IntPtr hWnd, int id);

        private const int WM_HOTKEY = 0x0312;

        public KeyboardShortcutManager(IKeyboardShortcutService shortcutService)
        {
            _shortcutService = shortcutService ?? throw new ArgumentNullException(nameof(shortcutService));
            _windowHandlers = new Dictionary<Window, List<WeakReference>>();
            _globalHotKeys = new List<GlobalHotKey>();

            InitializeGlobalShortcuts();
        }

        #region Global Shortcuts

        /// <summary>
        /// Registers a global system-wide shortcut
        /// </summary>
        public bool RegisterGlobalShortcut(KeyboardShortcut shortcut)
        {
            if (shortcut == null || !shortcut.IsGlobal) return false;

            try
            {
                var modifiers = ConvertToWin32Modifiers(shortcut.ModifierKeys);
                var virtualKey = KeyInterop.VirtualKeyFromKey(shortcut.Key);
                var hotKeyId = GetNextHotKeyId();

                if (_hwndSource?.Handle != IntPtr.Zero)
                {
                    if (RegisterHotKey(_hwndSource.Handle, hotKeyId, modifiers, (uint)virtualKey))
                    {
                        _globalHotKeys.Add(new GlobalHotKey
                        {
                            Id = hotKeyId,
                            Shortcut = shortcut,
                            ModifierKeys = shortcut.ModifierKeys,
                            Key = shortcut.Key
                        });
                        return true;
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error
                System.Diagnostics.Debug.WriteLine($"Failed to register global shortcut: {ex.Message}");
            }

            return false;
        }

        /// <summary>
        /// Unregisters a global shortcut
        /// </summary>
        public bool UnregisterGlobalShortcut(string shortcutId)
        {
            var hotKey = _globalHotKeys.FirstOrDefault(hk => hk.Shortcut.Id == shortcutId);
            if (hotKey != null)
            {
                if (_hwndSource?.Handle != IntPtr.Zero)
                {
                    UnregisterHotKey(_hwndSource.Handle, hotKey.Id);
                }
                _globalHotKeys.Remove(hotKey);
                return true;
            }
            return false;
        }

        /// <summary>
        /// Initializes the global shortcut system
        /// </summary>
        private void InitializeGlobalShortcuts()
        {
            try
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    var mainWindow = Application.Current.MainWindow;
                    if (mainWindow != null)
                    {
                        var windowInteropHelper = new WindowInteropHelper(mainWindow);
                        _hwndSource = HwndSource.FromHwnd(windowInteropHelper.Handle);
                        if (_hwndSource != null)
                        {
                            _hwndSource.AddHook(WndProc);
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to initialize global shortcuts: {ex.Message}");
            }
        }

        /// <summary>
        /// Windows message handler for global hot keys
        /// </summary>
        private IntPtr WndProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
        {
            if (msg == WM_HOTKEY)
            {
                var hotKeyId = wParam.ToInt32();
                var hotKey = _globalHotKeys.FirstOrDefault(hk => hk.Id == hotKeyId);
                if (hotKey != null)
                {
                    _ = Task.Run(() => _shortcutService.ExecuteAction(hotKey.Shortcut.ActionId));
                    handled = true;
                }
            }
            return IntPtr.Zero;
        }

        #endregion

        #region Window-Specific Shortcuts

        /// <summary>
        /// Registers keyboard shortcuts for a specific window
        /// </summary>
        public void RegisterWindowShortcuts(Window window, string context = null)
        {
            if (window == null) return;

            lock (_lockObject)
            {
                if (!_windowHandlers.ContainsKey(window))
                {
                    _windowHandlers[window] = new List<WeakReference>();
                }

                var handler = new KeyEventHandler((sender, e) => HandleWindowKeyDown(sender, e, context));
                var weakRef = new WeakReference(handler);
                _windowHandlers[window].Add(weakRef);

                window.KeyDown += handler;
                window.Closed += (s, e) => UnregisterWindowShortcuts(window);
            }
        }

        /// <summary>
        /// Unregisters keyboard shortcuts for a specific window
        /// </summary>
        public void UnregisterWindowShortcuts(Window window)
        {
            if (window == null) return;

            lock (_lockObject)
            {
                if (_windowHandlers.TryGetValue(window, out var handlers))
                {
                    foreach (var weakRef in handlers)
                    {
                        if (weakRef.Target is KeyEventHandler handler)
                        {
                            window.KeyDown -= handler;
                        }
                    }
                    _windowHandlers.Remove(window);
                }
            }
        }

        /// <summary>
        /// Handles key down events for window-specific shortcuts
        /// </summary>
        private void HandleWindowKeyDown(object sender, KeyEventArgs e, string context)
        {
            if (e.Handled) return;

            try
            {
                var modifiers = Keyboard.Modifiers;
                var key = e.Key;

                // Handle special key cases
                if (key == Key.System)
                {
                    key = e.SystemKey;
                }

                var handled = _shortcutService.TryExecuteShortcut(modifiers, key, context);
                if (handled)
                {
                    e.Handled = true;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error handling window shortcut: {ex.Message}");
            }
        }

        #endregion

        #region Application-Wide Shortcuts

        /// <summary>
        /// Registers application-wide shortcuts that work across all windows
        /// </summary>
        public void RegisterApplicationShortcuts()
        {
            // Application-wide shortcuts are handled at the Window level
            // This method is kept for interface compatibility
        }

        /// <summary>
        /// Unregisters application-wide shortcuts
        /// </summary>
        public void UnregisterApplicationShortcuts()
        {
            // Application-wide shortcuts are handled at the Window level
            // This method is kept for interface compatibility
        }

        /// <summary>
        /// Handles application-wide key events
        /// </summary>
        private void Application_PreviewKeyDown(object sender, KeyEventArgs e)
        {
            if (e.Handled) return;

            try
            {
                var modifiers = Keyboard.Modifiers;
                var key = e.Key;

                // Handle special key cases
                if (key == Key.System)
                {
                    key = e.SystemKey;
                }

                // Get the current focused element's context
                var context = GetCurrentContext();

                // Try to execute shortcut (non-global shortcuts only for application-wide handling)
                var shortcuts = Task.Run(() => _shortcutService.GetAllShortcutsAsync()).Result;
                var matchingShortcut = shortcuts?.FirstOrDefault(s => 
                    !s.IsGlobal && s.IsEnabled && s.Matches(modifiers, key) && 
                    (string.IsNullOrEmpty(s.Context) || s.Context == context));

                if (matchingShortcut != null)
                {
                    var handled = _shortcutService.ExecuteAction(matchingShortcut.ActionId, 
                        new ShortcutExecutionContext { Context = context, Source = sender });
                    if (handled)
                    {
                        e.Handled = true;
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error handling application shortcut: {ex.Message}");
            }
        }

        #endregion

        #region Context Management

        /// <summary>
        /// Gets the current application context for shortcut handling
        /// </summary>
        private string GetCurrentContext()
        {
            try
            {
                var focusedElement = Keyboard.FocusedElement;
                if (focusedElement is FrameworkElement element)
                {
                    // Check for specific control types and return appropriate context
                    return element.GetType().Name switch
                    {
                        "DataGrid" => "DataGrid",
                        "TextBox" => "TextEditor",
                        "RichTextBox" => "TextEditor",
                        "TreeView" => "TreeView",
                        "ListView" => "ListView",
                        "ComboBox" => "ComboBox",
                        _ => "General"
                    };
                }

                // Check active window for context
                var activeWindow = Application.Current.Windows.OfType<Window>()
                    .FirstOrDefault(w => w.IsActive);
                if (activeWindow != null)
                {
                    return activeWindow.GetType().Name.Replace("Window", "").Replace("View", "");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error getting context: {ex.Message}");
            }

            return "General";
        }

        /// <summary>
        /// Sets a specific context for shortcut handling
        /// </summary>
        public void SetContext(string context)
        {
            // Implementation for setting explicit context
            // This could be used for modal dialogs or specific application states
        }

        #endregion

        #region Utility Methods

        /// <summary>
        /// Converts WPF ModifierKeys to Win32 modifier flags
        /// </summary>
        private uint ConvertToWin32Modifiers(ModifierKeys modifiers)
        {
            uint win32Modifiers = 0;
            if (modifiers.HasFlag(ModifierKeys.Alt))
                win32Modifiers |= 0x0001; // MOD_ALT
            if (modifiers.HasFlag(ModifierKeys.Control))
                win32Modifiers |= 0x0002; // MOD_CONTROL
            if (modifiers.HasFlag(ModifierKeys.Shift))
                win32Modifiers |= 0x0004; // MOD_SHIFT
            if (modifiers.HasFlag(ModifierKeys.Windows))
                win32Modifiers |= 0x0008; // MOD_WIN
            return win32Modifiers;
        }

        /// <summary>
        /// Gets the next available hot key ID
        /// </summary>
        private int GetNextHotKeyId()
        {
            var maxId = _globalHotKeys.Any() ? _globalHotKeys.Max(hk => hk.Id) : 0;
            return maxId + 1;
        }

        /// <summary>
        /// Cleanup expired weak references
        /// </summary>
        private void CleanupWeakReferences()
        {
            lock (_lockObject)
            {
                var windowsToRemove = new List<Window>();
                foreach (var kvp in _windowHandlers)
                {
                    var aliveReferences = kvp.Value.Where(wr => wr.IsAlive).ToList();
                    if (aliveReferences.Count != kvp.Value.Count)
                    {
                        _windowHandlers[kvp.Key] = aliveReferences;
                    }
                    if (aliveReferences.Count == 0)
                    {
                        windowsToRemove.Add(kvp.Key);
                    }
                }

                foreach (var window in windowsToRemove)
                {
                    _windowHandlers.Remove(window);
                }
            }
        }

        #endregion

        #region IDisposable Implementation

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_isDisposed)
            {
                if (disposing)
                {
                    // Unregister all global shortcuts
                    foreach (var hotKey in _globalHotKeys.ToList())
                    {
                        UnregisterGlobalShortcut(hotKey.Shortcut.Id);
                    }

                    // Unregister application shortcuts
                    UnregisterApplicationShortcuts();

                    // Clean up window handlers
                    lock (_lockObject)
                    {
                        foreach (var kvp in _windowHandlers.ToList())
                        {
                            UnregisterWindowShortcuts(kvp.Key);
                        }
                        _windowHandlers.Clear();
                    }

                    // Remove window hook
                    if (_hwndSource != null)
                    {
                        _hwndSource.RemoveHook(WndProc);
                        _hwndSource = null;
                    }
                }

                _isDisposed = true;
            }
        }

        ~KeyboardShortcutManager()
        {
            Dispose(false);
        }

        #endregion
    }

    /// <summary>
    /// Represents a registered global hot key
    /// </summary>
    internal class GlobalHotKey
    {
        public int Id { get; set; }
        public KeyboardShortcut Shortcut { get; set; }
        public ModifierKeys ModifierKeys { get; set; }
        public Key Key { get; set; }
    }
}