using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows.Input;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.ViewModels
{
    public class DiscoveryModuleViewModel : ObservableObject
    {
        private readonly MainViewModel _mainViewModel;
        private readonly EnhancedLoggingService _logger;
        private string _moduleId;
        private string _displayName;
        private string _description;
        private string _icon;
        private string _category;
        private bool _enabled;
        private string _status = "Ready";
        private double _progress;
        private Process _runningProcess;

        public DiscoveryModuleViewModel(MainViewModel mainViewModel)
        {
            _mainViewModel = mainViewModel;
            _logger = EnhancedLoggingService.Instance;
            RunDiscoveryCommand = new CommunityToolkit.Mvvm.Input.AsyncRelayCommand(RunDiscoveryAsync, CanRunDiscovery);
        }

        public string ModuleId
        {
            get => _moduleId;
            set => SetProperty(ref _moduleId, value);
        }

        public string DisplayName
        {
            get => _displayName;
            set => SetProperty(ref _displayName, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public string Icon
        {
            get => _icon;
            set => SetProperty(ref _icon, value);
        }

        public string Category
        {
            get => _category;
            set => SetProperty(ref _category, value);
        }

        public bool Enabled
        {
            get => _enabled;
            set
            {
                if (SetProperty(ref _enabled, value))
                {
                    RunDiscoveryCommand.NotifyCanExecuteChanged();
                }
            }
        }

        public string Status
        {
            get => _status;
            set
            {
                if (SetProperty(ref _status, value))
                {
                    RunDiscoveryCommand.NotifyCanExecuteChanged();
                }
            }
        }

        public double Progress
        {
            get => _progress;
            set => SetProperty(ref _progress, value);
        }

        public bool IsEnabled => Enabled && Status != "Running";

        public CommunityToolkit.Mvvm.Input.IAsyncRelayCommand RunDiscoveryCommand { get; }

        private bool CanRunDiscovery()
        {
            return Enabled && Status != "Running";
        }

        private async Task RunDiscoveryAsync()
        {
            try
            {
                Status = "Running";
                Progress = 0;
                _ = _logger.LogInformationAsync($"Starting discovery module: {ModuleId}");

                var scriptsPath = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Scripts");
                var launcherPath = System.IO.Path.Combine(scriptsPath, "DiscoveryModuleLauncher.ps1");
                
                if (!System.IO.File.Exists(launcherPath))
                {
                    // Try ConfigurationService path
                    launcherPath = ConfigurationService.Instance.GetDiscoveryLauncherScriptPath();
                    
                    if (!System.IO.File.Exists(launcherPath))
                    {
                        _ = _logger.LogErrorAsync($"DiscoveryModuleLauncher.ps1 not found at {launcherPath}");
                        Status = "Failed";
                        return;
                    }
                }

                var currentProfile = _mainViewModel?.CurrentProfileName ?? "ljpops";
                
                var startInfo = new ProcessStartInfo
                {
                    FileName = "powershell.exe",
                    Arguments = $"-NoProfile -ExecutionPolicy Bypass -File \"{launcherPath}\" -ModuleName \"{ModuleId}\" -CompanyName \"{currentProfile}\"",
                    WorkingDirectory = @"C:\enterprisediscovery",
                    UseShellExecute = true,
                    CreateNoWindow = false
                };

                _ = _logger.LogInformationAsync($"Executing: {startInfo.FileName} {startInfo.Arguments}");

                _runningProcess = new Process { StartInfo = startInfo };
                
                // Start progress simulation
                _ = Task.Run(async () =>
                {
                    while (_runningProcess != null && !_runningProcess.HasExited)
                    {
                        await Task.Delay(1000);
                        if (Progress < 90)
                        {
                            Progress += 5;
                        }
                    }
                });

                _runningProcess.Start();
                await Task.Run(() => _runningProcess.WaitForExit());

                var exitCode = _runningProcess.ExitCode;
                _runningProcess = null;
                
                if (exitCode == 0)
                {
                    Progress = 100;
                    Status = "Completed";
                    _ = _logger.LogInformationAsync($"Discovery module {ModuleId} completed successfully");
                    
                    // Trigger data reload
                    await _mainViewModel?.ReloadDataAsync();
                }
                else
                {
                    Status = "Failed";
                    _ = _logger.LogErrorAsync($"Discovery module {ModuleId} failed with exit code {exitCode}");
                }
            }
            catch (Exception ex)
            {
                _ = _logger.LogErrorAsync($"Error running discovery module {ModuleId}: {ex.Message}");
                Status = "Failed";
            }
            finally
            {
                Progress = 0;
                _runningProcess = null;
            }
        }
    }
}