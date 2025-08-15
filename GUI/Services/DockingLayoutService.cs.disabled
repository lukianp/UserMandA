using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for persisting and restoring docking panel layouts
    /// </summary>
    public interface IDockingLayoutService
    {
        Task<DockingLayout> LoadLayoutAsync();
        Task SaveLayoutAsync(DockingLayout layout);
        Task<List<string>> GetSavedLayoutsAsync();
        Task SaveLayoutAsync(string name, DockingLayout layout);
        Task<DockingLayout> LoadLayoutAsync(string name);
        Task DeleteLayoutAsync(string name);
        DockingLayout GetDefaultLayout();
    }

    public class DockingLayoutService : IDockingLayoutService
    {
        private readonly ILogger<DockingLayoutService> _logger;
        private readonly string _layoutDirectory;
        private readonly string _defaultLayoutFile;

        public DockingLayoutService(ILogger<DockingLayoutService> logger = null)
        {
            _logger = logger;
            _layoutDirectory = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "MandADiscoverySuite", "Layouts");
            _defaultLayoutFile = Path.Combine(_layoutDirectory, "default.json");

            // Ensure directory exists
            Directory.CreateDirectory(_layoutDirectory);
        }

        public async Task<DockingLayout> LoadLayoutAsync()
        {
            return await LoadLayoutAsync("default");
        }

        public async Task SaveLayoutAsync(DockingLayout layout)
        {
            await SaveLayoutAsync("default", layout);
        }

        public async Task<List<string>> GetSavedLayoutsAsync()
        {
            try
            {
                var layoutNames = new List<string>();
                if (Directory.Exists(_layoutDirectory))
                {
                    var files = Directory.GetFiles(_layoutDirectory, "*.json");
                    foreach (var file in files)
                    {
                        var name = Path.GetFileNameWithoutExtension(file);
                        layoutNames.Add(name);
                    }
                }
                return layoutNames;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting saved layouts");
                return new List<string>();
            }
        }

        public async Task SaveLayoutAsync(string name, DockingLayout layout)
        {
            try
            {
                var filePath = Path.Combine(_layoutDirectory, $"{name}.json");
                var json = JsonSerializer.Serialize(layout, new JsonSerializerOptions
                {
                    WriteIndented = true
                });

                await File.WriteAllTextAsync(filePath, json);
                _logger?.LogInformation("Saved docking layout: {LayoutName}", name);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error saving docking layout: {LayoutName}", name);
                throw;
            }
        }

        public async Task<DockingLayout> LoadLayoutAsync(string name)
        {
            try
            {
                var filePath = Path.Combine(_layoutDirectory, $"{name}.json");
                
                if (!File.Exists(filePath))
                {
                    _logger?.LogInformation("Layout file not found: {LayoutName}, returning default", name);
                    return GetDefaultLayout();
                }

                var json = await File.ReadAllTextAsync(filePath);
                var layout = JsonSerializer.Deserialize<DockingLayout>(json);
                
                _logger?.LogInformation("Loaded docking layout: {LayoutName}", name);
                return layout ?? GetDefaultLayout();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading docking layout: {LayoutName}, returning default", name);
                return GetDefaultLayout();
            }
        }

        public async Task DeleteLayoutAsync(string name)
        {
            try
            {
                if (name.Equals("default", StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException("Cannot delete the default layout");
                }

                var filePath = Path.Combine(_layoutDirectory, $"{name}.json");
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    _logger?.LogInformation("Deleted docking layout: {LayoutName}", name);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error deleting docking layout: {LayoutName}", name);
                throw;
            }
        }

        public DockingLayout GetDefaultLayout()
        {
            return new DockingLayout
            {
                Name = "Default",
                CreatedDate = DateTime.Now,
                LastModified = DateTime.Now,
                Panels = new List<PanelLayout>
                {
                    new PanelLayout
                    {
                        Id = "Explorer",
                        Title = "Explorer",
                        Icon = "🗂️",
                        Position = DockPosition.Left,
                        IsVisible = true,
                        IsPinned = true,
                        IsFloating = false,
                        Width = 250,
                        Height = 400,
                        FloatingX = 100,
                        FloatingY = 100
                    },
                    new PanelLayout
                    {
                        Id = "Properties",
                        Title = "Properties",
                        Icon = "⚙️",
                        Position = DockPosition.Right,
                        IsVisible = true,
                        IsPinned = true,
                        IsFloating = false,
                        Width = 300,
                        Height = 400,
                        FloatingX = 100,
                        FloatingY = 100
                    },
                    new PanelLayout
                    {
                        Id = "Output",
                        Title = "Output",
                        Icon = "📊",
                        Position = DockPosition.Bottom,
                        IsVisible = true,
                        IsPinned = true,
                        IsFloating = false,
                        Width = 800,
                        Height = 200,
                        FloatingX = 100,
                        FloatingY = 100
                    }
                },
                GridSizes = new DockingGridSizeInfo
                {
                    LeftPanelWidth = 250,
                    RightPanelWidth = 300,
                    BottomPanelHeight = 200,
                    LeftMinWidth = 150,
                    RightMinWidth = 200,
                    BottomMinHeight = 100
                }
            };
        }
    }

    /// <summary>
    /// Represents a complete docking layout configuration
    /// </summary>
    public class DockingLayout
    {
        public string Name { get; set; } = "Default";
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime LastModified { get; set; } = DateTime.Now;
        public List<PanelLayout> Panels { get; set; } = new List<PanelLayout>();
        public DockingGridSizeInfo GridSizes { get; set; } = new DockingGridSizeInfo();
        public string Description { get; set; } = "";
    }

    /// <summary>
    /// Layout information for a single panel
    /// </summary>
    public class PanelLayout
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Icon { get; set; }
        public DockPosition Position { get; set; }
        public bool IsVisible { get; set; } = true;
        public bool IsPinned { get; set; } = true;
        public bool IsFloating { get; set; } = false;
        public double Width { get; set; } = 250;
        public double Height { get; set; } = 200;
        public double FloatingX { get; set; } = 100;
        public double FloatingY { get; set; } = 100;
        public int ZIndex { get; set; } = 0;
    }

    /// <summary>
    /// Grid sizing information for the docking container
    /// </summary>
    public class DockingGridSizeInfo
    {
        public double LeftPanelWidth { get; set; } = 250;
        public double RightPanelWidth { get; set; } = 300;
        public double BottomPanelHeight { get; set; } = 200;
        public double LeftMinWidth { get; set; } = 150;
        public double RightMinWidth { get; set; } = 200;
        public double BottomMinHeight { get; set; } = 100;
    }
}