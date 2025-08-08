using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Interactive Dependency Graph feature
    /// </summary>
    public class DependencyGraphViewModel : BaseViewModel
    {
        private readonly IDependencyGraphService _dependencyGraphService;
        private readonly IDataService _dataService;
        
        private DependencyGraph _currentGraph;
        private DependencyNode _selectedNode;
        private DependencyEdge _selectedEdge;
        private GraphLayoutAlgorithm _selectedLayoutAlgorithm = GraphLayoutAlgorithm.ForceDirected;
        private GraphLayoutSettings _layoutSettings;
        private DependencyGraphFilter _filter;
        private string _searchText;
        private bool _isLayoutInProgress;
        private bool _showFilterPanel;
        private bool _showNodeProperties;
        private bool _showGraphStatistics;
        private double _zoomLevel = 1.0;
        private Point _panOffset = new Point(0, 0);

        public DependencyGraphViewModel(
            IDependencyGraphService dependencyGraphService = null, 
            IDataService dataService = null)
        {
            _dependencyGraphService = dependencyGraphService ?? new DependencyGraphService();
            _dataService = dataService;
            
            // Initialize collections
            AvailableGraphs = new ObservableCollection<DependencyGraph>();
            Nodes = new ObservableCollection<DependencyNode>();
            Edges = new ObservableCollection<DependencyEdge>();
            LayoutAlgorithms = new ObservableCollection<GraphLayoutAlgorithm>(Enum.GetValues<GraphLayoutAlgorithm>());
            NodeTypes = new ObservableCollection<string>();
            EdgeTypes = new ObservableCollection<DependencyEdgeType>(Enum.GetValues<DependencyEdgeType>());
            NodeStatuses = new ObservableCollection<DependencyNodeStatus>(Enum.GetValues<DependencyNodeStatus>());
            GraphStatistics = new ObservableCollection<GraphStatistic>();
            
            // Initialize settings and filter
            LayoutSettings = new GraphLayoutSettings();
            Filter = new DependencyGraphFilter();
            
            // Initialize commands
            InitializeCommands();
            
            // Subscribe to service events
            if (_dependencyGraphService != null)
            {
                _dependencyGraphService.NodeAdded += OnNodeAdded;
                _dependencyGraphService.NodeUpdated += OnNodeUpdated;
                _dependencyGraphService.NodeRemoved += OnNodeRemoved;
                _dependencyGraphService.EdgeAdded += OnEdgeAdded;
                _dependencyGraphService.EdgeUpdated += OnEdgeUpdated;
                _dependencyGraphService.EdgeRemoved += OnEdgeRemoved;
                _dependencyGraphService.LayoutUpdated += OnLayoutUpdated;
            }
            
            // Load initial data
            LoadAvailableGraphsAsync();
        }

        #region Properties

        /// <summary>
        /// Current dependency graph being displayed
        /// </summary>
        public DependencyGraph CurrentGraph
        {
            get => _currentGraph;
            set
            {
                if (SetProperty(ref _currentGraph, value))
                {
                    OnGraphChanged();
                }
            }
        }

        /// <summary>
        /// Currently selected node
        /// </summary>
        public DependencyNode SelectedNode
        {
            get => _selectedNode;
            set
            {
                if (SetProperty(ref _selectedNode, value))
                {
                    ShowNodeProperties = value != null;
                    NodePropertyPanelVisibility = value != null ? Visibility.Visible : Visibility.Collapsed;
                }
            }
        }

        /// <summary>
        /// Currently selected edge
        /// </summary>
        public DependencyEdge SelectedEdge
        {
            get => _selectedEdge;
            set => SetProperty(ref _selectedEdge, value);
        }

        /// <summary>
        /// Selected layout algorithm
        /// </summary>
        public GraphLayoutAlgorithm SelectedLayoutAlgorithm
        {
            get => _selectedLayoutAlgorithm;
            set
            {
                if (SetProperty(ref _selectedLayoutAlgorithm, value))
                {
                    LayoutSettings.Algorithm = value;
                }
            }
        }

        /// <summary>
        /// Layout settings for the graph
        /// </summary>
        public GraphLayoutSettings LayoutSettings
        {
            get => _layoutSettings;
            set => SetProperty(ref _layoutSettings, value);
        }

        /// <summary>
        /// Filter settings for the graph
        /// </summary>
        public DependencyGraphFilter Filter
        {
            get => _filter;
            set => SetProperty(ref _filter, value);
        }

        /// <summary>
        /// Search text for filtering nodes
        /// </summary>
        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    Filter.SearchText = value;
                    ApplyFilterCommand.RaiseCanExecuteChanged();
                }
            }
        }

        /// <summary>
        /// Whether layout calculation is in progress
        /// </summary>
        public bool IsLayoutInProgress
        {
            get => _isLayoutInProgress;
            set => SetProperty(ref _isLayoutInProgress, value);
        }

        /// <summary>
        /// Whether to show the filter panel
        /// </summary>
        public bool ShowFilterPanel
        {
            get => _showFilterPanel;
            set => SetProperty(ref _showFilterPanel, value);
        }

        /// <summary>
        /// Whether to show node properties panel
        /// </summary>
        public bool ShowNodeProperties
        {
            get => _showNodeProperties;
            set => SetProperty(ref _showNodeProperties, value);
        }

        /// <summary>
        /// Whether to show graph statistics panel
        /// </summary>
        public bool ShowGraphStatistics
        {
            get => _showGraphStatistics;
            set => SetProperty(ref _showGraphStatistics, value);
        }

        /// <summary>
        /// Current zoom level
        /// </summary>
        public double ZoomLevel
        {
            get => _zoomLevel;
            set => SetProperty(ref _zoomLevel, Math.Max(0.1, Math.Min(5.0, value)));
        }

        /// <summary>
        /// Pan offset for the graph view
        /// </summary>
        public Point PanOffset
        {
            get => _panOffset;
            set => SetProperty(ref _panOffset, value);
        }

        /// <summary>
        /// Node property panel visibility
        /// </summary>
        public Visibility NodePropertyPanelVisibility { get; private set; } = Visibility.Collapsed;

        /// <summary>
        /// Filter panel visibility
        /// </summary>
        public Visibility FilterPanelVisibility => ShowFilterPanel ? Visibility.Visible : Visibility.Collapsed;

        /// <summary>
        /// Statistics panel visibility
        /// </summary>
        public Visibility StatisticsPanelVisibility => ShowGraphStatistics ? Visibility.Visible : Visibility.Collapsed;

        #endregion

        #region Collections

        /// <summary>
        /// Available dependency graphs
        /// </summary>
        public ObservableCollection<DependencyGraph> AvailableGraphs { get; }

        /// <summary>
        /// Nodes in the current graph
        /// </summary>
        public ObservableCollection<DependencyNode> Nodes { get; }

        /// <summary>
        /// Edges in the current graph
        /// </summary>
        public ObservableCollection<DependencyEdge> Edges { get; }

        /// <summary>
        /// Available layout algorithms
        /// </summary>
        public ObservableCollection<GraphLayoutAlgorithm> LayoutAlgorithms { get; }

        /// <summary>
        /// Available node types for filtering
        /// </summary>
        public ObservableCollection<string> NodeTypes { get; }

        /// <summary>
        /// Available edge types for filtering
        /// </summary>
        public ObservableCollection<DependencyEdgeType> EdgeTypes { get; }

        /// <summary>
        /// Available node statuses for filtering
        /// </summary>
        public ObservableCollection<DependencyNodeStatus> NodeStatuses { get; }

        /// <summary>
        /// Graph statistics
        /// </summary>
        public ObservableCollection<GraphStatistic> GraphStatistics { get; }

        #endregion

        #region Commands

        public RelayCommand NewGraphCommand { get; private set; }
        public RelayCommand<DependencyGraph> LoadGraphCommand { get; private set; }
        public RelayCommand SaveGraphCommand { get; private set; }
        public RelayCommand DeleteGraphCommand { get; private set; }
        public RelayCommand BuildFromDiscoveryDataCommand { get; private set; }
        public RelayCommand<GraphLayoutAlgorithm> ApplyLayoutCommand { get; private set; }
        public RelayCommand ApplyFilterCommand { get; private set; }
        public RelayCommand ClearFilterCommand { get; private set; }
        public RelayCommand<DependencyNode> SelectNodeCommand { get; private set; }
        public RelayCommand<DependencyEdge> SelectEdgeCommand { get; private set; }
        public RelayCommand AddNodeCommand { get; private set; }
        public RelayCommand DeleteNodeCommand { get; private set; }
        public RelayCommand AddEdgeCommand { get; private set; }
        public RelayCommand DeleteEdgeCommand { get; private set; }
        public RelayCommand ZoomInCommand { get; private set; }
        public RelayCommand ZoomOutCommand { get; private set; }
        public RelayCommand ZoomToFitCommand { get; private set; }
        public RelayCommand ResetViewCommand { get; private set; }
        public RelayCommand ToggleFilterPanelCommand { get; private set; }
        public RelayCommand ToggleStatisticsPanelCommand { get; private set; }
        public RelayCommand ExportGraphCommand { get; private set; }
        public RelayCommand ImportGraphCommand { get; private set; }
        public RelayCommand FindShortestPathCommand { get; private set; }
        public RelayCommand DetectCyclesCommand { get; private set; }
        public RelayCommand AnalyzeCentralityCommand { get; private set; }

        #endregion

        #region Command Methods

        private void InitializeCommands()
        {
            NewGraphCommand = new RelayCommand(async () => await NewGraphAsync());
            LoadGraphCommand = new RelayCommand<DependencyGraph>(async graph => await LoadGraphAsync(graph));
            SaveGraphCommand = new RelayCommand(async () => await SaveGraphAsync(), () => CurrentGraph != null);
            DeleteGraphCommand = new RelayCommand(async () => await DeleteGraphAsync(), () => CurrentGraph != null);
            BuildFromDiscoveryDataCommand = new RelayCommand(async () => await BuildFromDiscoveryDataAsync());
            
            ApplyLayoutCommand = new RelayCommand<GraphLayoutAlgorithm>(async algorithm => await ApplyLayoutAsync(algorithm), 
                algorithm => CurrentGraph != null && !IsLayoutInProgress);
            ApplyFilterCommand = new RelayCommand(async () => await ApplyFilterAsync(), () => CurrentGraph != null);
            ClearFilterCommand = new RelayCommand(ClearFilter);
            
            SelectNodeCommand = new RelayCommand<DependencyNode>(SelectNode);
            SelectEdgeCommand = new RelayCommand<DependencyEdge>(SelectEdge);
            AddNodeCommand = new RelayCommand(async () => await AddNodeAsync());
            DeleteNodeCommand = new RelayCommand(async () => await DeleteNodeAsync(), () => SelectedNode != null);
            AddEdgeCommand = new RelayCommand(async () => await AddEdgeAsync());
            DeleteEdgeCommand = new RelayCommand(async () => await DeleteEdgeAsync(), () => SelectedEdge != null);
            
            ZoomInCommand = new RelayCommand(() => ZoomLevel *= 1.2);
            ZoomOutCommand = new RelayCommand(() => ZoomLevel /= 1.2);
            ZoomToFitCommand = new RelayCommand(ZoomToFit);
            ResetViewCommand = new RelayCommand(ResetView);
            
            ToggleFilterPanelCommand = new RelayCommand(() => ShowFilterPanel = !ShowFilterPanel);
            ToggleStatisticsPanelCommand = new RelayCommand(() => ShowGraphStatistics = !ShowGraphStatistics);
            
            ExportGraphCommand = new RelayCommand(async () => await ExportGraphAsync(), () => CurrentGraph != null);
            ImportGraphCommand = new RelayCommand(async () => await ImportGraphAsync());
            FindShortestPathCommand = new RelayCommand(async () => await FindShortestPathAsync(), () => CurrentGraph != null && Nodes.Count >= 2);
            DetectCyclesCommand = new RelayCommand(async () => await DetectCyclesAsync(), () => CurrentGraph != null);
            AnalyzeCentralityCommand = new RelayCommand(async () => await AnalyzeCentralityAsync(), () => CurrentGraph != null);
        }

        private async Task NewGraphAsync()
        {
            try
            {
                IsLoading = true;
                StatusMessage = "Creating new graph...";
                
                var newGraph = await _dependencyGraphService.CreateGraphAsync($"Graph {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
                CurrentGraph = newGraph;
                
                await LoadAvailableGraphsAsync();
                StatusMessage = "New graph created successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error creating graph: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task LoadGraphAsync(DependencyGraph graph)
        {
            if (graph == null) return;
            
            try
            {
                IsLoading = true;
                StatusMessage = $"Loading graph: {graph.Name}";
                
                CurrentGraph = await _dependencyGraphService.LoadGraphAsync(graph.Id);
                StatusMessage = $"Graph '{CurrentGraph.Name}' loaded successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error loading graph: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task SaveGraphAsync()
        {
            if (CurrentGraph == null) return;
            
            try
            {
                IsLoading = true;
                StatusMessage = "Saving graph...";
                
                await _dependencyGraphService.SaveGraphAsync(CurrentGraph);
                StatusMessage = "Graph saved successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error saving graph: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task DeleteGraphAsync()
        {
            if (CurrentGraph == null) return;
            
            var result = MessageBox.Show(
                $"Are you sure you want to delete the graph '{CurrentGraph.Name}'?",
                "Confirm Delete", MessageBoxButton.YesNo, MessageBoxImage.Question);
                
            if (result != MessageBoxResult.Yes) return;
            
            try
            {
                IsLoading = true;
                StatusMessage = "Deleting graph...";
                
                await _dependencyGraphService.DeleteGraphAsync(CurrentGraph.Id);
                CurrentGraph = null;
                await LoadAvailableGraphsAsync();
                
                StatusMessage = "Graph deleted successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error deleting graph: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task BuildFromDiscoveryDataAsync()
        {
            if (_dataService == null)
            {
                StatusMessage = "Data service not available";
                return;
            }
            
            try
            {
                IsLoading = true;
                StatusMessage = "Building graph from discovery data...";
                
                // Load discovery data
                var users = await _dataService.LoadUsersAsync("");
                var groups = await _dataService.LoadGroupsAsync("");
                var infrastructure = await _dataService.LoadInfrastructureAsync("");
                var applications = await _dataService.LoadApplicationsAsync("");
                
                var graphName = $"Discovery Graph {DateTime.Now:yyyy-MM-dd HH:mm:ss}";
                CurrentGraph = await _dependencyGraphService.BuildGraphFromDiscoveryDataAsync(
                    graphName, users?.ToList(), groups?.ToList(), infrastructure?.ToList(), applications?.ToList());
                
                await LoadAvailableGraphsAsync();
                StatusMessage = $"Graph built with {CurrentGraph.Nodes.Count} nodes and {CurrentGraph.Edges.Count} edges";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error building graph from discovery data: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task ApplyLayoutAsync(GraphLayoutAlgorithm algorithm)
        {
            if (CurrentGraph == null) return;
            
            try
            {
                IsLayoutInProgress = true;
                StatusMessage = $"Applying {algorithm} layout...";
                
                CurrentGraph = await _dependencyGraphService.ApplyLayoutAsync(CurrentGraph.Id, algorithm, LayoutSettings);
                StatusMessage = $"{algorithm} layout applied successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error applying layout: {ex.Message}";
            }
            finally
            {
                IsLayoutInProgress = false;
            }
        }

        private async Task ApplyFilterAsync()
        {
            if (CurrentGraph == null) return;
            
            try
            {
                IsLoading = true;
                StatusMessage = "Applying filter...";
                
                var filteredGraph = await _dependencyGraphService.ApplyFilterAsync(CurrentGraph, Filter);
                // Update the view with filtered nodes/edges
                RefreshNodesAndEdges();
                
                StatusMessage = $"Filter applied: {Nodes.Count} nodes, {Edges.Count} edges";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error applying filter: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void ClearFilter()
        {
            Filter = new DependencyGraphFilter();
            SearchText = "";
            RefreshNodesAndEdges();
            StatusMessage = "Filter cleared";
        }

        private void SelectNode(DependencyNode node)
        {
            SelectedNode = node;
            SelectedEdge = null;
        }

        private void SelectEdge(DependencyEdge edge)
        {
            SelectedEdge = edge;
            SelectedNode = null;
        }

        private async Task AddNodeAsync()
        {
            if (CurrentGraph == null) return;
            
            var newNode = new DependencyNode
            {
                Name = "New Node",
                Type = "Custom",
                Description = "Custom node",
                Status = DependencyNodeStatus.Normal,
                Position = new Point(400, 300),
                Color = "#808080"
            };
            
            try
            {
                await _dependencyGraphService.AddNodeAsync(CurrentGraph.Id, newNode);
                StatusMessage = "Node added successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error adding node: {ex.Message}";
            }
        }

        private async Task DeleteNodeAsync()
        {
            if (CurrentGraph == null || SelectedNode == null) return;
            
            try
            {
                await _dependencyGraphService.RemoveNodeAsync(CurrentGraph.Id, SelectedNode.Id);
                SelectedNode = null;
                StatusMessage = "Node deleted successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error deleting node: {ex.Message}";
            }
        }

        private async Task AddEdgeAsync()
        {
            if (CurrentGraph == null || Nodes.Count < 2) return;
            
            // For demo purposes, connect first two nodes
            var sourceNode = Nodes.FirstOrDefault();
            var targetNode = Nodes.Skip(1).FirstOrDefault();
            
            if (sourceNode == null || targetNode == null) return;
            
            var newEdge = new DependencyEdge
            {
                SourceNodeId = sourceNode.Id,
                TargetNodeId = targetNode.Id,
                EdgeType = DependencyEdgeType.DependsOn,
                Label = "Depends On",
                Weight = 1.0,
                Color = "#666666"
            };
            
            try
            {
                await _dependencyGraphService.AddEdgeAsync(CurrentGraph.Id, newEdge);
                StatusMessage = "Edge added successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error adding edge: {ex.Message}";
            }
        }

        private async Task DeleteEdgeAsync()
        {
            if (CurrentGraph == null || SelectedEdge == null) return;
            
            try
            {
                await _dependencyGraphService.RemoveEdgeAsync(CurrentGraph.Id, SelectedEdge.Id);
                SelectedEdge = null;
                StatusMessage = "Edge deleted successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error deleting edge: {ex.Message}";
            }
        }

        private void ZoomToFit()
        {
            // Implementation would calculate bounds and adjust zoom/pan
            ZoomLevel = 1.0;
            PanOffset = new Point(0, 0);
            StatusMessage = "View reset to fit";
        }

        private void ResetView()
        {
            ZoomLevel = 1.0;
            PanOffset = new Point(0, 0);
            StatusMessage = "View reset";
        }

        private async Task ExportGraphAsync()
        {
            if (CurrentGraph == null) return;
            
            try
            {
                var json = await _dependencyGraphService.ExportGraphAsync(CurrentGraph.Id);
                // Implementation would show save dialog and save file
                StatusMessage = "Graph exported successfully";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error exporting graph: {ex.Message}";
            }
        }

        private async Task ImportGraphAsync()
        {
            try
            {
                // Implementation would show open dialog and load file
                // var graph = await _dependencyGraphService.ImportGraphAsync(filePath);
                // CurrentGraph = graph;
                StatusMessage = "Graph import not yet implemented";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error importing graph: {ex.Message}";
            }
        }

        private async Task FindShortestPathAsync()
        {
            if (CurrentGraph == null || Nodes.Count < 2) return;
            
            try
            {
                var fromNode = Nodes.FirstOrDefault();
                var toNode = Nodes.LastOrDefault();
                
                if (fromNode == null || toNode == null) return;
                
                var path = await _dependencyGraphService.FindShortestPathAsync(CurrentGraph.Id, fromNode.Id, toNode.Id);
                StatusMessage = path.Count > 0 ? $"Shortest path found with {path.Count} nodes" : "No path found";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error finding shortest path: {ex.Message}";
            }
        }

        private async Task DetectCyclesAsync()
        {
            if (CurrentGraph == null) return;
            
            try
            {
                var cycles = await _dependencyGraphService.DetectCircularDependenciesAsync(CurrentGraph.Id);
                StatusMessage = cycles.Count > 0 ? $"Found {cycles.Count} circular dependencies" : "No circular dependencies found";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error detecting cycles: {ex.Message}";
            }
        }

        private async Task AnalyzeCentralityAsync()
        {
            if (CurrentGraph == null) return;
            
            try
            {
                var centrality = await _dependencyGraphService.CalculateNodeCentralityAsync(CurrentGraph.Id);
                var topNodes = centrality.OrderByDescending(kvp => kvp.Value).Take(5);
                StatusMessage = $"Centrality analysis completed. Top node: {topNodes.FirstOrDefault().Key}";
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error analyzing centrality: {ex.Message}";
            }
        }

        #endregion

        #region Private Methods

        private async Task LoadAvailableGraphsAsync()
        {
            try
            {
                var graphs = await _dependencyGraphService.GetAllGraphsAsync();
                AvailableGraphs.Clear();
                
                foreach (var graph in graphs)
                {
                    AvailableGraphs.Add(graph);
                }
            }
            catch (Exception ex)
            {
                StatusMessage = $"Error loading available graphs: {ex.Message}";
            }
        }

        private void OnGraphChanged()
        {
            RefreshNodesAndEdges();
            UpdateGraphStatistics();
            UpdateNodeTypes();
            
            // Refresh command states
            SaveGraphCommand.RaiseCanExecuteChanged();
            DeleteGraphCommand.RaiseCanExecuteChanged();
            ApplyLayoutCommand.RaiseCanExecuteChanged();
            ApplyFilterCommand.RaiseCanExecuteChanged();
            ExportGraphCommand.RaiseCanExecuteChanged();
            FindShortestPathCommand.RaiseCanExecuteChanged();
            DetectCyclesCommand.RaiseCanExecuteChanged();
            AnalyzeCentralityCommand.RaiseCanExecuteChanged();
        }

        private void RefreshNodesAndEdges()
        {
            Nodes.Clear();
            Edges.Clear();
            
            if (CurrentGraph != null)
            {
                foreach (var node in CurrentGraph.Nodes)
                {
                    Nodes.Add(node);
                }
                
                foreach (var edge in CurrentGraph.Edges)
                {
                    Edges.Add(edge);
                }
            }
        }

        private void UpdateGraphStatistics()
        {
            GraphStatistics.Clear();
            
            if (CurrentGraph != null)
            {
                GraphStatistics.Add(new GraphStatistic("Nodes", CurrentGraph.Nodes.Count.ToString()));
                GraphStatistics.Add(new GraphStatistic("Edges", CurrentGraph.Edges.Count.ToString()));
                GraphStatistics.Add(new GraphStatistic("Created", CurrentGraph.Created.ToString("yyyy-MM-dd HH:mm")));
                GraphStatistics.Add(new GraphStatistic("Modified", CurrentGraph.LastModified.ToString("yyyy-MM-dd HH:mm")));
                
                // Calculate additional statistics
                var nodesByType = CurrentGraph.Nodes.GroupBy(n => n.Type).ToList();
                foreach (var group in nodesByType.Take(5))
                {
                    GraphStatistics.Add(new GraphStatistic($"{group.Key} Nodes", group.Count().ToString()));
                }
            }
        }

        private void UpdateNodeTypes()
        {
            NodeTypes.Clear();
            
            if (CurrentGraph != null)
            {
                var types = CurrentGraph.Nodes.Select(n => n.Type).Distinct().OrderBy(t => t);
                foreach (var type in types)
                {
                    NodeTypes.Add(type);
                }
            }
        }

        #endregion

        #region Event Handlers

        private void OnNodeAdded(object sender, DependencyNodeEventArgs e)
        {
            if (e.GraphId == CurrentGraph?.Id)
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    Nodes.Add(e.Node);
                    UpdateGraphStatistics();
                });
            }
        }

        private void OnNodeUpdated(object sender, DependencyNodeEventArgs e)
        {
            if (e.GraphId == CurrentGraph?.Id)
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    var existingNode = Nodes.FirstOrDefault(n => n.Id == e.Node.Id);
                    if (existingNode != null)
                    {
                        var index = Nodes.IndexOf(existingNode);
                        Nodes[index] = e.Node;
                    }
                });
            }
        }

        private void OnNodeRemoved(object sender, DependencyNodeEventArgs e)
        {
            if (e.GraphId == CurrentGraph?.Id)
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    var nodeToRemove = Nodes.FirstOrDefault(n => n.Id == e.Node.Id);
                    if (nodeToRemove != null)
                    {
                        Nodes.Remove(nodeToRemove);
                        
                        // Remove connected edges
                        var edgesToRemove = Edges.Where(edge => 
                            edge.SourceNodeId == e.Node.Id || edge.TargetNodeId == e.Node.Id).ToList();
                        foreach (var edge in edgesToRemove)
                        {
                            Edges.Remove(edge);
                        }
                        
                        UpdateGraphStatistics();
                    }
                });
            }
        }

        private void OnEdgeAdded(object sender, DependencyEdgeEventArgs e)
        {
            if (e.GraphId == CurrentGraph?.Id)
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    Edges.Add(e.Edge);
                    UpdateGraphStatistics();
                });
            }
        }

        private void OnEdgeUpdated(object sender, DependencyEdgeEventArgs e)
        {
            if (e.GraphId == CurrentGraph?.Id)
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    var existingEdge = Edges.FirstOrDefault(edge => edge.Id == e.Edge.Id);
                    if (existingEdge != null)
                    {
                        var index = Edges.IndexOf(existingEdge);
                        Edges[index] = e.Edge;
                    }
                });
            }
        }

        private void OnEdgeRemoved(object sender, DependencyEdgeEventArgs e)
        {
            if (e.GraphId == CurrentGraph?.Id)
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    var edgeToRemove = Edges.FirstOrDefault(edge => edge.Id == e.Edge.Id);
                    if (edgeToRemove != null)
                    {
                        Edges.Remove(edgeToRemove);
                        UpdateGraphStatistics();
                    }
                });
            }
        }

        private void OnLayoutUpdated(object sender, DependencyGraphEventArgs e)
        {
            if (e.Graph.Id == CurrentGraph?.Id)
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    CurrentGraph = e.Graph;
                });
            }
        }

        #endregion

        #region IDisposable

        protected override void Dispose(bool disposing)
        {
            if (disposing && _dependencyGraphService != null)
            {
                _dependencyGraphService.NodeAdded -= OnNodeAdded;
                _dependencyGraphService.NodeUpdated -= OnNodeUpdated;
                _dependencyGraphService.NodeRemoved -= OnNodeRemoved;
                _dependencyGraphService.EdgeAdded -= OnEdgeAdded;
                _dependencyGraphService.EdgeUpdated -= OnEdgeUpdated;
                _dependencyGraphService.EdgeRemoved -= OnEdgeRemoved;
                _dependencyGraphService.LayoutUpdated -= OnLayoutUpdated;
            }
            
            base.Dispose(disposing);
        }

        #endregion
    }

    /// <summary>
    /// Simple class for displaying graph statistics
    /// </summary>
    public class GraphStatistic
    {
        public string Name { get; set; }
        public string Value { get; set; }
        
        public GraphStatistic(string name, string value)
        {
            Name = name;
            Value = value;
        }
    }
}