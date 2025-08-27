using System;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Simple UI interaction logging helper that logs all UI actions to the company folder
    /// </summary>
    public static class UIInteractionLogger
    {
        /// <summary>
        /// Log a navigation event
        /// </summary>
        public static async Task LogNavigationAsync(string fromView, string toView, string method = "Click")
        {
            try
            {
                await EnhancedLoggingService.Instance.LogUserActionAsync(
                    $"Navigation: {fromView} → {toView}", 
                    $"Method: {method}", 
                    new { From = fromView, To = toView, Method = method }
                );
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to log navigation: {ex.Message}");
            }
        }

        /// <summary>
        /// Log a button click event
        /// </summary>
        public static async Task LogButtonClickAsync(string buttonName, string viewName, object additionalData = null)
        {
            try
            {
                await EnhancedLoggingService.Instance.LogUserActionAsync(
                    $"Button Click: {buttonName}",
                    $"View: {viewName}",
                    new { Button = buttonName, View = viewName, Data = additionalData }
                );
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to log button click: {ex.Message}");
            }
        }

        /// <summary>
        /// Log a data loading event
        /// </summary>
        public static async Task LogDataLoadAsync(string dataType, string viewName, int recordCount, TimeSpan duration)
        {
            try
            {
                await EnhancedLoggingService.Instance.LogDataOperationAsync(
                    "Load",
                    dataType,
                    recordCount,
                    new { View = viewName, DurationMs = duration.TotalMilliseconds }
                );
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to log data load: {ex.Message}");
            }
        }

        /// <summary>
        /// Log a view load event
        /// </summary>
        public static async Task LogViewLoadAsync(string viewName, bool success, string errorMessage = null)
        {
            try
            {
                await EnhancedLoggingService.Instance.LogInformationAsync(
                    $"View Load: {viewName} - {(success ? "Success" : "Failed")}",
                    new { View = viewName, Success = success, Error = errorMessage }
                );
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to log view load: {ex.Message}");
            }
        }

        /// <summary>
        /// Log a command execution
        /// </summary>
        public static async Task LogCommandAsync(string commandName, string viewName, object parameters = null, bool success = true, string errorMessage = null)
        {
            try
            {
                await EnhancedLoggingService.Instance.LogUserActionAsync(
                    $"Command: {commandName}",
                    $"View: {viewName}, Success: {success}",
                    new { Command = commandName, View = viewName, Parameters = parameters, Success = success, Error = errorMessage }
                );
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to log command: {ex.Message}");
            }
        }
    }
}