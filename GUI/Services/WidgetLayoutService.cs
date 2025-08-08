using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.ViewModels.Widgets;
using System.Text.Json;

namespace MandADiscoverySuite.Services
{
    public class WidgetLayoutService : IWidgetLayoutService
    {
        private readonly ILogger<WidgetLayoutService> _logger;
        private readonly string _configDirectory;
        private readonly string _layoutFilePath;

        public WidgetLayoutService(ILogger<WidgetLayoutService> logger = null)
        {
            _logger = logger;
            _configDirectory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MandADiscoverySuite");
            _layoutFilePath = Path.Combine(_configDirectory, "widget-layout.json");
        }

        public async Task<List<WidgetConfiguration>> LoadWidgetLayoutAsync()
        {
            try
            {
                if (!File.Exists(_layoutFilePath))
                {
                    _logger?.LogInformation("Widget layout file not found, will create default layout");
                    return null;
                }

                var json = await File.ReadAllTextAsync(_layoutFilePath);
                var configurations = JsonSerializer.Deserialize<List<WidgetConfiguration>>(json);

                _logger?.LogInformation("Loaded widget layout with {Count} widgets", configurations?.Count ?? 0);
                return configurations;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to load widget layout");
                return null;
            }
        }

        public async Task SaveWidgetLayoutAsync(IEnumerable<WidgetViewModel> widgets)
        {
            try
            {
                EnsureConfigDirectoryExists();

                var configurations = widgets.Select(w => new WidgetConfiguration
                {
                    WidgetType = w.WidgetType,
                    Title = w.Title,
                    Icon = w.Icon,
                    IsVisible = w.IsVisible,
                    Row = w.Row,
                    Column = w.Column,
                    RowSpan = w.RowSpan,
                    ColumnSpan = w.ColumnSpan
                }).ToList();

                var options = new JsonSerializerOptions
                {
                    WriteIndented = true
                };

                var json = JsonSerializer.Serialize(configurations, options);
                await File.WriteAllTextAsync(_layoutFilePath, json);

                _logger?.LogInformation("Saved widget layout with {Count} widgets", configurations.Count);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to save widget layout");
                throw;
            }
        }

        public async Task<List<WidgetViewModel>> CreateDefaultWidgetsAsync()
        {
            await Task.Delay(1); // Make it async for consistency

            var widgets = new List<WidgetViewModel>
            {
                new SystemOverviewWidget
                {
                    Row = 0,
                    Column = 0,
                    RowSpan = 1,
                    ColumnSpan = 2
                },
                new DiscoveryStatusWidget
                {
                    Row = 0,
                    Column = 2,
                    RowSpan = 2,
                    ColumnSpan = 1
                },
                new RiskAssessmentWidget
                {
                    Row = 0,
                    Column = 3,
                    RowSpan = 2,
                    ColumnSpan = 1
                },
                new MigrationProgressWidget
                {
                    Row = 1,
                    Column = 0,
                    RowSpan = 1,
                    ColumnSpan = 2
                }
            };

            _logger?.LogInformation("Created default widget layout with {Count} widgets", widgets.Count);
            return widgets;
        }

        public async Task ResetToDefaultLayoutAsync()
        {
            try
            {
                if (File.Exists(_layoutFilePath))
                {
                    File.Delete(_layoutFilePath);
                    _logger?.LogInformation("Reset widget layout to defaults");
                }
                
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to reset widget layout");
                throw;
            }
        }

        private void EnsureConfigDirectoryExists()
        {
            if (!Directory.Exists(_configDirectory))
            {
                Directory.CreateDirectory(_configDirectory);
                _logger?.LogInformation("Created configuration directory: {Directory}", _configDirectory);
            }
        }

        public WidgetViewModel CreateWidgetFromConfiguration(WidgetConfiguration config)
        {
            WidgetViewModel widget = config.WidgetType switch
            {
                "SystemOverview" => new SystemOverviewWidget(),
                "DiscoveryStatus" => new DiscoveryStatusWidget(),
                "RiskAssessment" => new RiskAssessmentWidget(),
                "MigrationProgress" => new MigrationProgressWidget(),
                _ => throw new ArgumentException($"Unknown widget type: {config.WidgetType}")
            };

            // Apply configuration
            widget.Title = config.Title;
            widget.Icon = config.Icon;
            widget.IsVisible = config.IsVisible;
            widget.Row = config.Row;
            widget.Column = config.Column;
            widget.RowSpan = config.RowSpan;
            widget.ColumnSpan = config.ColumnSpan;

            return widget;
        }
    }
}