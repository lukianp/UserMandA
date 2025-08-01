using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Media;

namespace MandADiscoverySuite
{
    public partial class PowerShellWindow : Window
    {
        private Process? powerShellProcess;
        private CancellationTokenSource? cancellationTokenSource;
        private string scriptPath;
        private string[] scriptArguments;

        public PowerShellWindow(string scriptPath, string scriptName = "", string description = "", params string[] arguments)
        {
            InitializeComponent();
            
            this.scriptPath = scriptPath;
            this.scriptArguments = arguments ?? new string[0];
            
            if (!string.IsNullOrEmpty(scriptName))
            {
                ScriptName.Text = $"Script: {scriptName}";
                WindowTitle.Text = $"PowerShell - {scriptName}";
                Title = $"PowerShell - {scriptName}";
            }
            
            if (!string.IsNullOrEmpty(description))
            {
                ScriptDescription.Text = description;
            }
            
            // Add initial welcome message
            AppendOutput("PowerShell Script Execution Window", Colors.Cyan);
            AppendOutput($"Ready to execute: {Path.GetFileName(scriptPath)}", Colors.White);
            AppendOutput("Click 'Run Script' to begin execution.\n", Colors.Gray);
        }

        private void AppendOutput(string text, System.Windows.Media.Color color)
        {
            Dispatcher.BeginInvoke(new Action(() =>
            {
                var timestamp = DateTime.Now.ToString("HH:mm:ss");
                var newText = $"[{timestamp}] {text}\n";
                
                OutputText.Text += newText;
                
                // Auto-scroll to bottom
                OutputScrollViewer.ScrollToEnd();
            }));
        }

        private void AppendOutput(string text)
        {
            AppendOutput(text, Colors.White);
        }

        private async void RunButton_Click(object sender, RoutedEventArgs e)
        {
            if (!File.Exists(scriptPath))
            {
                AppendOutput($"ERROR: Script file not found: {scriptPath}", Colors.Red);
                return;
            }

            // Update UI state
            RunButton.IsEnabled = false;
            StopButton.IsEnabled = true;
            ExecutionProgress.Visibility = Visibility.Visible;
            ExecutionProgress.IsIndeterminate = true;

            AppendOutput("Starting PowerShell script execution...", Colors.Green);
            AppendOutput($"Script: {scriptPath}", Colors.Gray);
            
            if (scriptArguments.Length > 0)
            {
                AppendOutput($"Arguments: {string.Join(" ", scriptArguments)}", Colors.Gray);
            }
            
            AppendOutput("", Colors.White); // Empty line

            cancellationTokenSource = new CancellationTokenSource();

            try
            {
                await ExecuteScriptAsync(cancellationTokenSource.Token);
            }
            catch (OperationCanceledException)
            {
                AppendOutput("Script execution was cancelled.", Colors.Yellow);
            }
            catch (Exception ex)
            {
                AppendOutput($"ERROR: {ex.Message}", Colors.Red);
            }
            finally
            {
                // Reset UI state
                RunButton.IsEnabled = true;
                StopButton.IsEnabled = false;
                ExecutionProgress.Visibility = Visibility.Collapsed;
                ExecutionProgress.IsIndeterminate = false;
            }
        }

        private async Task ExecuteScriptAsync(CancellationToken cancellationToken)
        {
            var arguments = $"-ExecutionPolicy Bypass -NoProfile -File \"{scriptPath}\"";
            if (scriptArguments.Length > 0)
            {
                arguments += " " + string.Join(" ", scriptArguments);
            }

            var startInfo = new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = arguments,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true,
                WorkingDirectory = Path.GetDirectoryName(scriptPath)
            };

            powerShellProcess = new Process { StartInfo = startInfo };

            // Handle output
            powerShellProcess.OutputDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    AppendOutput(e.Data);
                }
            };

            powerShellProcess.ErrorDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    AppendOutput($"ERROR: {e.Data}", Colors.Red);
                }
            };

            AppendOutput("Launching PowerShell process...", Colors.Cyan);
            
            powerShellProcess.Start();
            powerShellProcess.BeginOutputReadLine();
            powerShellProcess.BeginErrorReadLine();

            // Wait for completion or cancellation
            while (!powerShellProcess.HasExited && !cancellationToken.IsCancellationRequested)
            {
                await Task.Delay(100, cancellationToken);
            }

            if (cancellationToken.IsCancellationRequested && !powerShellProcess.HasExited)
            {
                try
                {
                    powerShellProcess.Kill();
                    AppendOutput("PowerShell process terminated.", Colors.Yellow);
                }
                catch (Exception ex)
                {
                    AppendOutput($"Error terminating process: {ex.Message}", Colors.Red);
                }
            }
            else if (powerShellProcess.HasExited)
            {
                var exitCode = powerShellProcess.ExitCode;
                if (exitCode == 0)
                {
                    AppendOutput("Script completed successfully!", Colors.Green);
                }
                else
                {
                    AppendOutput($"Script completed with exit code: {exitCode}", Colors.Yellow);
                }
            }

            powerShellProcess?.Dispose();
            powerShellProcess = null;
        }

        private void StopButton_Click(object sender, RoutedEventArgs e)
        {
            if (cancellationTokenSource != null && !cancellationTokenSource.Token.IsCancellationRequested)
            {
                AppendOutput("Stopping script execution...", Colors.Yellow);
                cancellationTokenSource.Cancel();
            }
        }

        private void ClearButton_Click(object sender, RoutedEventArgs e)
        {
            OutputText.Text = "";
            AppendOutput("PowerShell Script Execution Window", Colors.Cyan);
            AppendOutput($"Ready to execute: {Path.GetFileName(scriptPath)}", Colors.White);
            AppendOutput("Click 'Run Script' to begin execution.\n", Colors.Gray);
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            if (powerShellProcess != null && !powerShellProcess.HasExited)
            {
                var result = MessageBox.Show(
                    "A PowerShell script is currently running. Do you want to stop it and close the window?",
                    "Script Running",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Question);

                if (result == MessageBoxResult.Yes)
                {
                    cancellationTokenSource?.Cancel();
                    Close();
                }
            }
            else
            {
                Close();
            }
        }

        protected override void OnClosed(EventArgs e)
        {
            // Clean up
            cancellationTokenSource?.Cancel();
            powerShellProcess?.Kill();
            powerShellProcess?.Dispose();
            base.OnClosed(e);
        }
    }
}