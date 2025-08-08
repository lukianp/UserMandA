using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Management.Automation;
using System.Management.Automation.Runspaces;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for script editing and PowerShell execution functionality
    /// </summary>
    public class ScriptEditorService : IScriptEditorService, IDisposable
    {
        private readonly string _settingsPath;
        private readonly string _templatesPath;
        private readonly string _historyPath;
        private ScriptEditorSettings _settings;
        private readonly List<ScriptExecutionResult> _executionHistory;
        private PowerShell _currentExecution;
        private CancellationTokenSource _cancellationTokenSource;
        private bool _disposed = false;

        public event EventHandler<ScriptExecutionStartedEventArgs> ExecutionStarted;
        public event EventHandler<ScriptExecutionCompletedEventArgs> ExecutionCompleted;
        public event EventHandler<ScriptOutputEventArgs> OutputReceived;

        public ScriptEditorService()
        {
            var appDataPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "MandADiscoverySuite",
                "ScriptEditor"
            );

            Directory.CreateDirectory(appDataPath);

            _settingsPath = Path.Combine(appDataPath, "settings.json");
            _templatesPath = Path.Combine(appDataPath, "templates.json");
            _historyPath = Path.Combine(appDataPath, "history.json");

            _executionHistory = new List<ScriptExecutionResult>();
            LoadSettings();
            LoadExecutionHistory();
        }

        /// <summary>
        /// Execute a PowerShell script
        /// </summary>
        public async Task<ScriptExecutionResult> ExecuteScriptAsync(string script, PowerShellExecutionOptions options = null, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(script))
                throw new ArgumentException("Script cannot be empty", nameof(script));

            options = options ?? new PowerShellExecutionOptions();
            
            var result = new ScriptExecutionResult
            {
                Timestamp = DateTime.Now,
                Script = script,
                State = ScriptExecutionState.Running,
                WorkingDirectory = options.WorkingDirectory ?? Directory.GetCurrentDirectory()
            };

            var stopwatch = Stopwatch.StartNew();
            
            ExecutionStarted?.Invoke(this, new ScriptExecutionStartedEventArgs
            {
                Script = script,
                StartTime = result.Timestamp,
                Options = options
            });

            try
            {
                using (var runspace = RunspaceFactory.CreateRunspace())
                {
                    runspace.Open();
                    
                    if (!string.IsNullOrEmpty(options.WorkingDirectory))
                    {
                        runspace.SessionStateProxy.Path.SetLocation(options.WorkingDirectory);
                    }

                    // Set variables
                    foreach (var variable in options.Variables)
                    {
                        runspace.SessionStateProxy.SetVariable(variable.Key, variable.Value);
                    }

                    using (_currentExecution = PowerShell.Create())
                    {
                        _currentExecution.Runspace = runspace;
                        _currentExecution.AddScript(script);

                        // Configure execution policy if needed
                        if (options.ExecutionPolicy != PowerShellExecutionPolicy.Bypass)
                        {
                            _currentExecution.AddCommand("Set-ExecutionPolicy")
                                            .AddParameter("ExecutionPolicy", options.ExecutionPolicy.ToString())
                                            .AddParameter("Scope", "Process")
                                            .AddParameter("Force");
                        }

                        var outputCollection = new PSDataCollection<PSObject>();
                        var errorCollection = new PSDataCollection<ErrorRecord>();

                        var outputBuilder = new StringBuilder();
                        var errorBuilder = new StringBuilder();

                        // Handle output
                        outputCollection.DataAdded += (sender, e) =>
                        {
                            var output = outputCollection[e.Index]?.ToString();
                            if (!string.IsNullOrEmpty(output))
                            {
                                outputBuilder.AppendLine(output);
                                OutputReceived?.Invoke(this, new ScriptOutputEventArgs
                                {
                                    Output = output,
                                    IsError = false,
                                    Timestamp = DateTime.Now
                                });
                            }
                        };

                        // Handle errors
                        errorCollection.DataAdded += (sender, e) =>
                        {
                            var error = errorCollection[e.Index]?.ToString();
                            if (!string.IsNullOrEmpty(error))
                            {
                                errorBuilder.AppendLine(error);
                                OutputReceived?.Invoke(this, new ScriptOutputEventArgs
                                {
                                    Output = error,
                                    IsError = true,
                                    Timestamp = DateTime.Now
                                });
                            }
                        };

                        // Execute with timeout
                        var executeTask = Task.Run(() =>
                        {
                            return _currentExecution.BeginInvoke<PSObject, PSObject>(null, outputCollection);
                        }, cancellationToken);

                        var timeoutTask = Task.Delay(TimeSpan.FromSeconds(options.TimeoutSeconds), cancellationToken);
                        var completedTask = await Task.WhenAny(executeTask, timeoutTask);

                        if (completedTask == timeoutTask)
                        {
                            _currentExecution?.Stop();
                            result.State = ScriptExecutionState.Cancelled;
                            result.Error = "Script execution timed out";
                        }
                        else
                        {
                            var asyncResult = await executeTask;
                            _currentExecution.EndInvoke(asyncResult);

                            result.Output = outputBuilder.ToString();
                            result.Error = errorBuilder.ToString();

                            if (_currentExecution.HadErrors || !string.IsNullOrEmpty(result.Error))
                            {
                                result.State = ScriptExecutionState.CompletedWithErrors;
                                result.IsSuccess = false;
                            }
                            else
                            {
                                result.State = ScriptExecutionState.Completed;
                                result.IsSuccess = true;
                            }
                        }
                    }
                }
            }
            catch (OperationCanceledException)
            {
                result.State = ScriptExecutionState.Cancelled;
                result.Error = "Script execution was cancelled";
            }
            catch (Exception ex)
            {
                result.State = ScriptExecutionState.Failed;
                result.IsSuccess = false;
                result.Error = $"Execution failed: {ex.Message}";
            }
            finally
            {
                stopwatch.Stop();
                result.ExecutionTime = stopwatch.Elapsed;
                _currentExecution = null;
            }

            _executionHistory.Insert(0, result);
            if (_executionHistory.Count > 100) // Keep only last 100 results
            {
                _executionHistory.RemoveRange(100, _executionHistory.Count - 100);
            }

            await SaveExecutionHistoryAsync();

            ExecutionCompleted?.Invoke(this, new ScriptExecutionCompletedEventArgs { Result = result });

            return result;
        }

        /// <summary>
        /// Execute a PowerShell script from file
        /// </summary>
        public async Task<ScriptExecutionResult> ExecuteScriptFileAsync(string filePath, PowerShellExecutionOptions options = null, CancellationToken cancellationToken = default)
        {
            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Script file not found: {filePath}");

            var script = await File.ReadAllTextAsync(filePath, cancellationToken);
            
            options = options ?? new PowerShellExecutionOptions();
            if (string.IsNullOrEmpty(options.WorkingDirectory))
            {
                options.WorkingDirectory = Path.GetDirectoryName(filePath);
            }

            return await ExecuteScriptAsync(script, options, cancellationToken);
        }

        /// <summary>
        /// Validate PowerShell script syntax
        /// </summary>
        public async Task<List<ScriptSyntaxError>> ValidateScriptAsync(string script)
        {
            var errors = new List<ScriptSyntaxError>();

            if (string.IsNullOrWhiteSpace(script))
                return errors;

            await Task.Run(() =>
            {
                try
                {
                    var tokens = PSParser.Tokenize(script, out var parseErrors);
                    
                    foreach (var error in parseErrors)
                    {
                        errors.Add(new ScriptSyntaxError
                        {
                            Line = error.Token.StartLine,
                            Column = error.Token.StartColumn,
                            Message = error.Message,
                            Severity = "Error",
                            ErrorCode = error.GetType().Name
                        });
                    }
                }
                catch (Exception ex)
                {
                    errors.Add(new ScriptSyntaxError
                    {
                        Line = 1,
                        Column = 1,
                        Message = $"Parse error: {ex.Message}",
                        Severity = "Error",
                        ErrorCode = "ParseException"
                    });
                }
            });

            return errors;
        }

        /// <summary>
        /// Get autocomplete suggestions for PowerShell
        /// </summary>
        public async Task<List<AutocompleteSuggestion>> GetAutocompleteSuggestionsAsync(string script, int cursorPosition)
        {
            var suggestions = new List<AutocompleteSuggestion>();

            await Task.Run(() =>
            {
                try
                {
                    // Get the text up to cursor position
                    var textToCursor = script.Substring(0, Math.Min(cursorPosition, script.Length));
                    var lastWord = GetLastWord(textToCursor);

                    if (string.IsNullOrEmpty(lastWord))
                        return;

                    // Add common PowerShell cmdlets
                    var commonCmdlets = new[]
                    {
                        "Get-Process", "Get-Service", "Get-ChildItem", "Get-Content", "Set-Content",
                        "Get-Location", "Set-Location", "Get-Variable", "Set-Variable",
                        "Write-Output", "Write-Host", "Write-Error", "Write-Warning",
                        "Import-Module", "Export-Module", "Get-Module", "Remove-Module",
                        "Invoke-Command", "Invoke-Expression", "Start-Process", "Stop-Process"
                    };

                    foreach (var cmdlet in commonCmdlets)
                    {
                        if (cmdlet.StartsWith(lastWord, StringComparison.OrdinalIgnoreCase))
                        {
                            suggestions.Add(new AutocompleteSuggestion
                            {
                                Text = cmdlet,
                                DisplayText = cmdlet,
                                Description = $"PowerShell cmdlet: {cmdlet}",
                                Type = AutocompleteSuggestionType.Cmdlet,
                                Icon = "⚡",
                                Priority = 10
                            });
                        }
                    }

                    // Add common variables
                    var commonVariables = new[] { "$env:", "$PSVersionTable", "$Host", "$Error", "$null", "$true", "$false" };
                    foreach (var variable in commonVariables)
                    {
                        if (variable.StartsWith(lastWord, StringComparison.OrdinalIgnoreCase))
                        {
                            suggestions.Add(new AutocompleteSuggestion
                            {
                                Text = variable,
                                DisplayText = variable,
                                Description = $"PowerShell variable: {variable}",
                                Type = AutocompleteSuggestionType.Variable,
                                Icon = "$",
                                Priority = 5
                            });
                        }
                    }
                }
                catch (Exception)
                {
                    // Ignore autocomplete errors
                }
            });

            return suggestions.OrderByDescending(s => s.Priority).ThenBy(s => s.Text).ToList();
        }

        /// <summary>
        /// Format PowerShell script
        /// </summary>
        public async Task<string> FormatScriptAsync(string script)
        {
            if (string.IsNullOrWhiteSpace(script))
                return script;

            return await Task.Run(() =>
            {
                try
                {
                    // Basic formatting - in a real implementation, you might use PSScriptAnalyzer
                    var lines = script.Split('\n');
                    var formatted = new StringBuilder();
                    var indentLevel = 0;

                    foreach (var line in lines)
                    {
                        var trimmedLine = line.Trim();
                        
                        if (trimmedLine.StartsWith("}"))
                            indentLevel = Math.Max(0, indentLevel - 1);

                        var indent = new string(' ', indentLevel * 4);
                        formatted.AppendLine(indent + trimmedLine);

                        if (trimmedLine.EndsWith("{"))
                            indentLevel++;
                    }

                    return formatted.ToString();
                }
                catch
                {
                    return script; // Return original if formatting fails
                }
            });
        }

        /// <summary>
        /// Load script file
        /// </summary>
        public async Task<ScriptFile> LoadScriptFileAsync(string filePath)
        {
            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Script file not found: {filePath}");

            var fileInfo = new FileInfo(filePath);
            var content = await File.ReadAllTextAsync(filePath);

            return new ScriptFile
            {
                FilePath = filePath,
                FileName = Path.GetFileName(filePath),
                Content = content,
                LastModified = fileInfo.LastWriteTime,
                FileSize = fileInfo.Length,
                IsReadOnly = fileInfo.IsReadOnly,
                Language = GetLanguageFromExtension(Path.GetExtension(filePath))
            };
        }

        /// <summary>
        /// Save script file
        /// </summary>
        public async Task SaveScriptFileAsync(ScriptFile scriptFile)
        {
            if (scriptFile == null)
                throw new ArgumentNullException(nameof(scriptFile));

            if (string.IsNullOrEmpty(scriptFile.FilePath))
                throw new ArgumentException("File path is required", nameof(scriptFile));

            await File.WriteAllTextAsync(scriptFile.FilePath, scriptFile.Content ?? string.Empty);
            scriptFile.LastModified = DateTime.Now;
            scriptFile.IsModified = false;
        }

        /// <summary>
        /// Get default script templates
        /// </summary>
        public List<ScriptTemplate> GetDefaultTemplates()
        {
            return new List<ScriptTemplate>
            {
                new ScriptTemplate
                {
                    Name = "Discovery Module Template",
                    Description = "Basic template for discovery modules",
                    Category = ScriptTemplateCategory.Discovery,
                    Content = @"param(
    [Parameter(Mandatory=$true)]
    [string]$CompanyName,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = ""C:\discoverydata\$CompanyName""
)

# Discovery Module: {ModuleName}
# Description: {Description}
# Created: $(Get-Date)

try {
    Write-Host ""Starting discovery for $CompanyName..."" -ForegroundColor Green
    
    # Create output directory if it doesn't exist
    if (!(Test-Path $OutputPath)) {
        New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    }
    
    # Your discovery logic here
    
    Write-Host ""Discovery completed successfully!"" -ForegroundColor Green
}
catch {
    Write-Error ""Discovery failed: $($_.Exception.Message)""
    throw
}"
                },
                new ScriptTemplate
                {
                    Name = "Data Export Template",
                    Description = "Template for exporting data to CSV",
                    Category = ScriptTemplateCategory.Export,
                    Content = @"param(
    [Parameter(Mandatory=$true)]
    [object[]]$Data,
    
    [Parameter(Mandatory=$true)]
    [string]$OutputPath,
    
    [Parameter(Mandatory=$false)]
    [switch]$NoTypeInformation
)

try {
    # Export data to CSV
    $Data | Export-Csv -Path $OutputPath -NoTypeInformation:$NoTypeInformation
    
    Write-Host ""Data exported to: $OutputPath"" -ForegroundColor Green
    Write-Host ""Records exported: $($Data.Count)"" -ForegroundColor Yellow
}
catch {
    Write-Error ""Export failed: $($_.Exception.Message)""
    throw
}"
                },
                new ScriptTemplate
                {
                    Name = "Azure AD Query Template",
                    Description = "Template for querying Azure AD",
                    Category = ScriptTemplateCategory.Discovery,
                    Content = @"# Azure AD Discovery Template
# Requires: Microsoft.Graph PowerShell Module

param(
    [Parameter(Mandatory=$false)]
    [string]$TenantId
)

try {
    # Connect to Microsoft Graph
    if ($TenantId) {
        Connect-MgGraph -TenantId $TenantId -Scopes ""User.Read.All"", ""Group.Read.All""
    } else {
        Connect-MgGraph -Scopes ""User.Read.All"", ""Group.Read.All""
    }
    
    # Get users
    $users = Get-MgUser -All
    Write-Host ""Found $($users.Count) users"" -ForegroundColor Green
    
    # Get groups
    $groups = Get-MgGroup -All  
    Write-Host ""Found $($groups.Count) groups"" -ForegroundColor Green
    
    # Disconnect
    Disconnect-MgGraph
}
catch {
    Write-Error ""Azure AD query failed: $($_.Exception.Message)""
    throw
}"
                },
                new ScriptTemplate
                {
                    Name = "System Information Template",
                    Description = "Template for gathering system information",
                    Category = ScriptTemplateCategory.Analysis,
                    Content = @"# System Information Discovery
# Gathers comprehensive system information

$computerInfo = @{
    ComputerName = $env:COMPUTERNAME
    Domain = $env:USERDOMAIN
    UserName = $env:USERNAME
    OperatingSystem = (Get-CimInstance Win32_OperatingSystem).Caption
    Version = (Get-CimInstance Win32_OperatingSystem).Version
    Architecture = $env:PROCESSOR_ARCHITECTURE
    TotalMemory = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
    IPAddress = (Get-NetIPAddress | Where-Object {$_.AddressFamily -eq 'IPv4' -and $_.IPAddress -ne '127.0.0.1'}).IPAddress
    LastBootTime = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
    PowerShellVersion = $PSVersionTable.PSVersion.ToString()
}

# Display information
$computerInfo | Format-Table -AutoSize

# Export to CSV
$outputPath = ""SystemInfo_$($env:COMPUTERNAME)_$(Get-Date -Format 'yyyyMMdd_HHmmss').csv""
[PSCustomObject]$computerInfo | Export-Csv -Path $outputPath -NoTypeInformation

Write-Host ""System information exported to: $outputPath"" -ForegroundColor Green"
                }
            };
        }

        /// <summary>
        /// Save custom script template
        /// </summary>
        public async Task SaveTemplateAsync(ScriptTemplate template)
        {
            var templates = await LoadCustomTemplatesAsync();
            
            var existing = templates.FirstOrDefault(t => t.Id == template.Id);
            if (existing != null)
            {
                templates.Remove(existing);
            }

            template.Modified = DateTime.Now;
            templates.Add(template);

            var json = JsonSerializer.Serialize(templates, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(_templatesPath, json);
        }

        /// <summary>
        /// Load custom script templates
        /// </summary>
        public async Task<List<ScriptTemplate>> LoadCustomTemplatesAsync()
        {
            if (!File.Exists(_templatesPath))
                return new List<ScriptTemplate>();

            try
            {
                var json = await File.ReadAllTextAsync(_templatesPath);
                return JsonSerializer.Deserialize<List<ScriptTemplate>>(json) ?? new List<ScriptTemplate>();
            }
            catch
            {
                return new List<ScriptTemplate>();
            }
        }

        /// <summary>
        /// Delete custom script template
        /// </summary>
        public async Task DeleteTemplateAsync(string templateId)
        {
            var templates = await LoadCustomTemplatesAsync();
            var template = templates.FirstOrDefault(t => t.Id == templateId);
            
            if (template != null)
            {
                templates.Remove(template);
                var json = JsonSerializer.Serialize(templates, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(_templatesPath, json);
            }
        }

        /// <summary>
        /// Get script editor settings
        /// </summary>
        public ScriptEditorSettings GetSettings()
        {
            return _settings;
        }

        /// <summary>
        /// Save script editor settings
        /// </summary>
        public async Task SaveSettingsAsync(ScriptEditorSettings settings)
        {
            _settings = settings;
            var json = JsonSerializer.Serialize(settings, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(_settingsPath, json);
        }

        /// <summary>
        /// Get recent execution results
        /// </summary>
        public List<ScriptExecutionResult> GetRecentResults(int count = 20)
        {
            return _executionHistory.Take(count).ToList();
        }

        /// <summary>
        /// Clear execution history
        /// </summary>
        public async Task ClearExecutionHistoryAsync()
        {
            _executionHistory.Clear();
            if (File.Exists(_historyPath))
            {
                File.Delete(_historyPath);
            }
            await Task.CompletedTask;
        }

        /// <summary>
        /// Cancel running script execution
        /// </summary>
        public void CancelExecution()
        {
            _cancellationTokenSource?.Cancel();
            _currentExecution?.Stop();
        }

        /// <summary>
        /// Check if PowerShell is available
        /// </summary>
        public bool IsPowerShellAvailable()
        {
            try
            {
                using (var ps = PowerShell.Create())
                {
                    ps.AddScript("$PSVersionTable.PSVersion");
                    var result = ps.Invoke();
                    return result.Count > 0;
                }
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Get PowerShell version information
        /// </summary>
        public async Task<PowerShellVersionInfo> GetPowerShellVersionAsync()
        {
            return await Task.Run(() =>
            {
                try
                {
                    using (var ps = PowerShell.Create())
                    {
                        ps.AddScript("$PSVersionTable");
                        var result = ps.Invoke();
                        
                        if (result.Count > 0)
                        {
                            var versionTable = result[0].BaseObject as System.Collections.Hashtable;
                            
                            return new PowerShellVersionInfo
                            {
                                Version = versionTable?["PSVersion"]?.ToString() ?? "Unknown",
                                Edition = versionTable?["PSEdition"]?.ToString() ?? "Unknown",
                                PSCompatibleVersions = versionTable?["PSCompatibleVersions"]?.ToString() ?? "Unknown",
                                BuildVersion = versionTable?["BuildVersion"]?.ToString() ?? "Unknown",
                                CLRVersion = versionTable?["CLRVersion"]?.ToString() ?? "Unknown",
                                WSManStackVersion = versionTable?["WSManStackVersion"]?.ToString() ?? "Unknown"
                            };
                        }
                    }
                }
                catch
                {
                    // Fall back to basic info
                }

                return new PowerShellVersionInfo
                {
                    Version = Environment.Version.ToString(),
                    Edition = "Desktop",
                    PSCompatibleVersions = "Unknown",
                    BuildVersion = "Unknown",
                    CLRVersion = Environment.Version.ToString(),
                    WSManStackVersion = "Unknown"
                };
            });
        }

        #region Private Methods

        private void LoadSettings()
        {
            if (File.Exists(_settingsPath))
            {
                try
                {
                    var json = File.ReadAllText(_settingsPath);
                    _settings = JsonSerializer.Deserialize<ScriptEditorSettings>(json) ?? new ScriptEditorSettings();
                }
                catch
                {
                    _settings = new ScriptEditorSettings();
                }
            }
            else
            {
                _settings = new ScriptEditorSettings();
            }
        }

        private void LoadExecutionHistory()
        {
            if (File.Exists(_historyPath))
            {
                try
                {
                    var json = File.ReadAllText(_historyPath);
                    var history = JsonSerializer.Deserialize<List<ScriptExecutionResult>>(json);
                    if (history != null)
                    {
                        _executionHistory.AddRange(history.Take(100)); // Keep only last 100
                    }
                }
                catch
                {
                    // Ignore history loading errors
                }
            }
        }

        private async Task SaveExecutionHistoryAsync()
        {
            try
            {
                var json = JsonSerializer.Serialize(_executionHistory, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(_historyPath, json);
            }
            catch
            {
                // Ignore history saving errors
            }
        }

        private string GetLastWord(string text)
        {
            if (string.IsNullOrEmpty(text))
                return string.Empty;

            var words = text.Split(new[] { ' ', '\t', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
            return words.Length > 0 ? words[words.Length - 1] : string.Empty;
        }

        private string GetLanguageFromExtension(string extension)
        {
            return extension.ToLower() switch
            {
                ".ps1" => "PowerShell",
                ".psm1" => "PowerShell",
                ".psd1" => "PowerShell",
                ".cs" => "C#",
                ".js" => "JavaScript",
                ".py" => "Python",
                ".sql" => "SQL",
                ".json" => "JSON",
                ".xml" => "XML",
                _ => "Text"
            };
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _currentExecution?.Dispose();
                    _cancellationTokenSource?.Dispose();
                }
                _disposed = true;
            }
        }

        #endregion
    }
}