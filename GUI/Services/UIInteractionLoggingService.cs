using System;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Data;
using System.Windows.Input;
using System.Windows.Media;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Global UI interaction logging service that captures every click, command, and user action
    /// </summary>
    public class UIInteractionLoggingService
    {
        private readonly ILogger<UIInteractionLoggingService> _logger;
        private readonly EnhancedLoggingService _enhancedLogger;
        private static UIInteractionLoggingService _instance;

        public static UIInteractionLoggingService Instance => _instance;

        public UIInteractionLoggingService(ILogger<UIInteractionLoggingService> logger)
        {
            _logger = logger;
            _enhancedLogger = EnhancedLoggingService.Instance;
            _instance = this;
        }

        /// <summary>
        /// Initialize global UI interaction tracking
        /// </summary>
        public void Initialize()
        {
            _ = Task.Run(async () => await _enhancedLogger.LogInformationAsync("=== UI INTERACTION LOGGING INITIALIZED ==="));
            
            // Hook into application-wide mouse events
            EventManager.RegisterClassHandler(typeof(UIElement), UIElement.PreviewMouseDownEvent, 
                new MouseButtonEventHandler(OnGlobalMouseDown), true);
            
            EventManager.RegisterClassHandler(typeof(UIElement), UIElement.MouseDownEvent, 
                new MouseButtonEventHandler(OnGlobalMouseClick), true);

            // Hook into command execution
            EventManager.RegisterClassHandler(typeof(ButtonBase), ButtonBase.ClickEvent, 
                new RoutedEventHandler(OnButtonClick), true);

            // Hook into text input
            EventManager.RegisterClassHandler(typeof(TextBoxBase), TextBoxBase.TextChangedEvent, 
                new TextChangedEventHandler(OnTextChanged), true);

            // Hook into selection changes
            EventManager.RegisterClassHandler(typeof(Selector), Selector.SelectionChangedEvent, 
                new SelectionChangedEventHandler(OnSelectionChanged), true);

            _ = Task.Run(async () => await _enhancedLogger.LogInformationAsync("Global UI event handlers registered successfully"));
        }

        private void OnGlobalMouseDown(object sender, MouseButtonEventArgs e)
        {
            try
            {
                var element = e.Source as FrameworkElement;
                if (element == null) return;

                var clickInfo = ExtractClickInformation(element, e, "PreviewMouseDown");
                _ = Task.Run(async () => await _enhancedLogger.LogInformationAsync($"🖱️ MOUSE_DOWN: {clickInfo}"));
            }
            catch (Exception ex)
            {
                _ = Task.Run(async () => await _enhancedLogger.LogErrorAsync("Error in OnGlobalMouseDown", ex));
            }
        }

        private void OnGlobalMouseClick(object sender, MouseButtonEventArgs e)
        {
            try
            {
                var element = e.Source as FrameworkElement;
                if (element == null) return;

                var clickInfo = ExtractClickInformation(element, e, "MouseClick");
                _ = Task.Run(async () => await _enhancedLogger.LogInformationAsync($"👆 CLICK: {clickInfo}"));
            }
            catch (Exception ex)
            {
                _ = Task.Run(async () => await _enhancedLogger.LogErrorAsync("Error in OnGlobalMouseClick", ex));
            }
        }

        private void OnButtonClick(object sender, RoutedEventArgs e)
        {
            try
            {
                var button = sender as ButtonBase;
                if (button == null) return;
                
                // Enhanced error tracking for tile/button failures
                var buttonInfo = ExtractButtonInformation(button);
                _ = Task.Run(async () => await _enhancedLogger.LogInformationAsync($"🔲 BUTTON_CLICK: {buttonInfo}"));
                
                // Monitor command execution and capture failures
                if (button.Command != null)
                {
                    var commandBefore = button.Command.CanExecute(button.CommandParameter);
                    _ = Task.Run(async () => {
                        await Task.Delay(100); // Give command time to execute
                        try 
                        {
                            // Check if command completed successfully by looking for any error states
                            var context = button.DataContext;
                            var hasError = CheckForErrorsInContext(context);
                            if (hasError)
                            {
                                await _enhancedLogger.LogWarningAsync($"🚨 TILE_ERROR: Button '{buttonInfo}' command may have failed - error detected in context");
                            }
                        }
                        catch (Exception cmdEx)
                        {
                            await _enhancedLogger.LogErrorAsync($"🚨 TILE_COMMAND_ERROR: Button '{buttonInfo}' command execution failed", cmdEx);
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                _ = Task.Run(async () => await _enhancedLogger.LogErrorAsync("Error in OnButtonClick", ex));
            }
        }

        private void OnTextChanged(object sender, TextChangedEventArgs e)
        {
            try
            {
                var textBox = sender as TextBoxBase;
                if (textBox == null) return;

                var textInfo = ExtractTextBoxInformation(textBox);
                _ = Task.Run(async () => await _enhancedLogger.LogInformationAsync($"📝 TEXT_CHANGED: {textInfo}"));
            }
            catch (Exception ex)
            {
                _ = Task.Run(async () => await _enhancedLogger.LogErrorAsync("Error in OnTextChanged", ex));
            }
        }

        private void OnSelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            try
            {
                var selector = sender as Selector;
                if (selector == null) return;

                var selectionInfo = ExtractSelectionInformation(selector, e);
                _ = Task.Run(async () => await _enhancedLogger.LogInformationAsync($"📋 SELECTION_CHANGED: {selectionInfo}"));
            }
            catch (Exception ex)
            {
                _ = Task.Run(async () => await _enhancedLogger.LogErrorAsync("Error in OnSelectionChanged", ex));
            }
        }

        private string ExtractClickInformation(FrameworkElement element, MouseButtonEventArgs e, string eventType)
        {
            var elementType = element.GetType().Name;
            var elementName = element.Name ?? "Unnamed";
            var position = e.GetPosition(element);
            var button = e.ChangedButton.ToString();
            var clickCount = e.ClickCount;
            
            // Get parent window information
            var window = Window.GetWindow(element);
            var windowName = window?.GetType().Name ?? "Unknown";
            
            // Get data context information
            var dataContextType = element.DataContext?.GetType().Name ?? "Null";
            
            // Get binding information if it's a bound control
            var bindingInfo = ExtractBindingInformation(element);
            
            return $"Type={elementType}, Name={elementName}, Window={windowName}, Position=({position.X:F0},{position.Y:F0}), Button={button}, ClickCount={clickCount}, DataContext={dataContextType}, Binding={bindingInfo}";
        }

        private string ExtractButtonInformation(ButtonBase button)
        {
            var buttonType = button.GetType().Name;
            var buttonName = button.Name ?? "Unnamed";
            var content = ExtractContentString(button.Content);
            var isEnabled = button.IsEnabled;
            var toolTip = button.ToolTip?.ToString() ?? "None";
            
            // Get parent information
            var parent = LogicalTreeHelper.GetParent(button);
            var parentType = parent?.GetType().Name ?? "None";
            var parentName = (parent as FrameworkElement)?.Name ?? "Unnamed";
            
            // Get window information
            var window = Window.GetWindow(button);
            var windowName = window?.GetType().Name ?? "Unknown";
            
            return $"Type={buttonType}, Name={buttonName}, Content='{content}', Enabled={isEnabled}, ToolTip='{toolTip}', Parent={parentType}({parentName}), Window={windowName}";
        }

        private string ExtractCommandInformation(ICommand command, object parameter)
        {
            var commandType = command.GetType().Name;
            var parameterValue = parameter?.ToString() ?? "Null";
            var canExecute = command.CanExecute(parameter);
            
            // Try to get more information about RelayCommand
            if (command.GetType().Name.Contains("RelayCommand"))
            {
                try
                {
                    // Use reflection to get the action information
                    var actionField = command.GetType().GetField("_execute", BindingFlags.NonPublic | BindingFlags.Instance);
                    if (actionField != null)
                    {
                        var action = actionField.GetValue(command);
                        var methodInfo = action?.GetType().GetMethod("Invoke");
                        if (methodInfo != null)
                        {
                            return $"Type={commandType}, Parameter='{parameterValue}', CanExecute={canExecute}, Method={methodInfo.Name}";
                        }
                    }
                }
                catch
                {
                    // Fallback if reflection fails
                }
            }
            
            return $"Type={commandType}, Parameter='{parameterValue}', CanExecute={canExecute}";
        }

        private string ExtractTextBoxInformation(TextBoxBase textBox)
        {
            var textBoxType = textBox.GetType().Name;
            var textBoxName = textBox.Name ?? "Unnamed";
            var text = textBox is TextBox tb ? tb.Text : "N/A";
            var textLength = text?.Length ?? 0;
            
            // Get binding information
            var bindingInfo = ExtractBindingInformation(textBox);
            
            return $"Type={textBoxType}, Name={textBoxName}, TextLength={textLength}, Binding={bindingInfo}";
        }

        private string ExtractSelectionInformation(Selector selector, SelectionChangedEventArgs e)
        {
            var selectorType = selector.GetType().Name;
            var selectorName = selector.Name ?? "Unnamed";
            var selectedIndex = selector.SelectedIndex;
            var selectedValue = selector.SelectedValue?.ToString() ?? "Null";
            var addedCount = e.AddedItems.Count;
            var removedCount = e.RemovedItems.Count;
            
            return $"Type={selectorType}, Name={selectorName}, SelectedIndex={selectedIndex}, SelectedValue='{selectedValue}', Added={addedCount}, Removed={removedCount}";
        }

        private string ExtractBindingInformation(FrameworkElement element)
        {
            try
            {
                // Common properties to check for bindings
                var properties = new[]
                {
                    TextBox.TextProperty,
                    ContentControl.ContentProperty,
                    ButtonBase.CommandProperty,
                    ItemsControl.ItemsSourceProperty,
                    Selector.SelectedItemProperty
                };

                foreach (var property in properties)
                {
                    if (property.OwnerType.IsAssignableFrom(element.GetType()))
                    {
                        var binding = BindingOperations.GetBinding(element, property);
                        if (binding != null)
                        {
                            var path = binding.Path?.Path ?? "Unknown";
                            var source = binding.Source?.GetType().Name ?? "DataContext";
                            return $"{property.Name}->'{path}' (Source: {source})";
                        }
                    }
                }
            }
            catch
            {
                // Ignore binding extraction errors
            }
            
            return "None";
        }

        /// <summary>
        /// Check if the data context has any error properties indicating a failed operation
        /// </summary>
        private bool CheckForErrorsInContext(object context)
        {
            if (context == null) return false;

            try
            {
                var contextType = context.GetType();
                
                // Check for common error properties
                var errorProperties = new[] { "ErrorMessage", "HasError", "IsError", "Error", "LastError" };
                
                foreach (var propName in errorProperties)
                {
                    var property = contextType.GetProperty(propName);
                    if (property != null)
                    {
                        var value = property.GetValue(context);
                        if (value != null)
                        {
                            // Check boolean error flags
                            if (value is bool boolValue && boolValue)
                                return true;
                                
                            // Check string error messages
                            if (value is string stringValue && !string.IsNullOrEmpty(stringValue))
                                return true;
                        }
                    }
                }

                // Check for IsLoading state that might indicate a hung operation
                var loadingProperty = contextType.GetProperty("IsLoading");
                if (loadingProperty != null)
                {
                    var isLoading = loadingProperty.GetValue(context);
                    if (isLoading is bool loading && loading)
                    {
                        // Log loading state for debugging
                        _ = Task.Run(async () => await _enhancedLogger.LogInformationAsync($"🔄 CONTEXT_LOADING: {contextType.Name} is in loading state"));
                    }
                }
            }
            catch (Exception ex)
            {
                _ = Task.Run(async () => await _enhancedLogger.LogWarningAsync("Error checking context for errors", ex));
            }

            return false;
        }

        private string ExtractContentString(object content)
        {
            if (content == null) return "Null";
            
            if (content is string str) return str;
            if (content is FrameworkElement fe) return $"{fe.GetType().Name}({fe.Name ?? "Unnamed"})";
            
            return content.ToString() ?? "Unknown";
        }

        /// <summary>
        /// Log a custom user action
        /// </summary>
        public void LogUserAction(string action, object details = null)
        {
            var detailsString = details?.ToString() ?? "None";
            _ = Task.Run(async () => await _enhancedLogger.LogInformationAsync($"👤 USER_ACTION: Action={action}, Details={detailsString}"));
        }

        /// <summary>
        /// Log navigation events
        /// </summary>
        public void LogNavigation(string fromView, string toView, object context = null)
        {
            var contextString = context?.ToString() ?? "None";
            _ = Task.Run(async () => await _enhancedLogger.LogInformationAsync($"🧭 NAVIGATION: From={fromView}, To={toView}, Context={contextString}"));
        }

        /// <summary>
        /// Log errors with UI context
        /// </summary>
        public void LogUIError(Exception exception, FrameworkElement element = null)
        {
            var elementInfo = element != null ? ExtractElementInformation(element) : "None";
            _ = Task.Run(async () => await _enhancedLogger.LogErrorAsync($"❌ UI_ERROR: Element={elementInfo}", exception));
        }

        private string ExtractElementInformation(FrameworkElement element)
        {
            var elementType = element.GetType().Name;
            var elementName = element.Name ?? "Unnamed";
            var dataContextType = element.DataContext?.GetType().Name ?? "Null";
            var window = Window.GetWindow(element);
            var windowName = window?.GetType().Name ?? "Unknown";
            
            return $"Type={elementType}, Name={elementName}, DataContext={dataContextType}, Window={windowName}";
        }
    }
}
