using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
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

        private void OutputText_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.A && Keyboard.Modifiers == ModifierKeys.Control)
            {
                // Ctrl+A - Select All
                OutputText.SelectAll();
                e.Handled = true;
            }
            else if (e.Key == Key.C && Keyboard.Modifiers == ModifierKeys.Control)
            {
                // Ctrl+C - Copy Selected Text
                if (!string.IsNullOrEmpty(OutputText.SelectedText))
                {
                    Clipboard.SetText(OutputText.SelectedText);
                }
                e.Handled = true;
            }
            else if (e.Key == Key.C && Keyboard.Modifiers == (ModifierKeys.Control | ModifierKeys.Shift))
            {
                // Ctrl+Shift+C - Copy All Text
                CopyButton_Click(sender, new RoutedEventArgs());
                e.Handled = true;
            }
        }

        private void SelectAll_Click(object sender, RoutedEventArgs e)
        {
            OutputText.SelectAll();
            OutputText.Focus();
        }

        private void CopySelected_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (!string.IsNullOrEmpty(OutputText.SelectedText))
                {
                    Clipboard.SetText(OutputText.SelectedText);
                }
                else if (!string.IsNullOrEmpty(OutputText.Text))
                {
                    // If nothing is selected, copy all text
                    Clipboard.SetText(OutputText.Text);
                }
            }
            catch (Exception ex)
            {
                AppendOutput($"Failed to copy to clipboard: {ex.Message}", Colors.Red);
            }
        }

        private void CopyButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (!string.IsNullOrEmpty(OutputText.Text))
                {
                    // Copy all text to clipboard
                    Clipboard.SetText(OutputText.Text);
                    
                    // Show a brief confirmation by changing button content
                    var originalContent = CopyButton.Content;
                    CopyButton.Content = "✓ Copied!";
                    
                    // Reset button content after 2 seconds
                    var timer = new System.Windows.Threading.DispatcherTimer();
                    timer.Interval = TimeSpan.FromSeconds(2);
                    timer.Tick += (s, args) =>
                    {
                        CopyButton.Content = originalContent;
                        timer.Stop();
                    };
                    timer.Start();
                }
                else
                {
                    AppendOutput("No content to copy.", Colors.Yellow);
                }
            }
            catch (Exception ex)
            {
                AppendOutput($"Failed to copy to clipboard: {ex.Message}", Colors.Red);
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