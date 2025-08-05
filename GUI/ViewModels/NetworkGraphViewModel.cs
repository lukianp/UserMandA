using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Interactive Network Graph
    /// </summary>
    public class NetworkGraphViewModel : BaseViewModel
    {
        private readonly IDataService _dataService;
        private readonly IProfileService _profileService;
        
        private double _canvasWidth = 1200;
        private double _canvasHeight = 800;
        private bool _showLabels = true;
        private string _selectedLayoutAlgorithm = "Force-Directed";
        private string _selectedNodeType = "All";
        private GraphNodeViewModel _selectedNode;
        private string _selectedNodeInfo = string.Empty;
        private double _zoomLevel = 1.0;

        public NetworkGraphViewModel(
            ILogger<NetworkGraphViewModel> logger,
            IMessenger messenger,
            IDataService dataService,
            IProfileService profileService) : base(logger, messenger)
        {
            _dataService = dataService ?? throw new ArgumentNullException(nameof(dataService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));

            Nodes = new ObservableCollection<GraphNodeViewModel>();
            Edges = new ObservableCollection<GraphEdgeViewModel>();
            
            FilteredNodes = CollectionViewSource.GetDefaultView(Nodes);
            FilteredNodes.Filter = FilterNodes;
            
            LayoutAlgorithms = new[] { "Force-Directed", "Hierarchical", "Circular", "Grid" };
            NodeTypes = new[] { "All", "Users", "Computers", "Groups", "Applications" };

            InitializeCommands();
        }

        #region Properties

        public ObservableCollection<GraphNodeViewModel> Nodes { get; }
        public ObservableCollection<GraphEdgeViewModel> Edges { get; }
        public ICollectionView FilteredNodes { get; }

        public double CanvasWidth
        {
            get => _canvasWidth;
            set => SetProperty(ref _canvasWidth, value);
        }

        public double CanvasHeight
        {
            get => _canvasHeight;
            set => SetProperty(ref _canvasHeight, value);
        }

        public bool ShowLabels
        {
            get => _showLabels;
            set => SetProperty(ref _showLabels, value);
        }

        public string[] LayoutAlgorithms { get; }
        public string[] NodeTypes { get; }

        public string SelectedLayoutAlgorithm
        {
            get => _selectedLayoutAlgorithm;
            set
            {
                if (SetProperty(ref _selectedLayoutAlgorithm, value))
                {
                    _ = ApplyLayoutAsync();
                }
            }
        }

        public string SelectedNodeType
        {
            get => _selectedNodeType;
            set
            {
                if (SetProperty(ref _selectedNodeType, value))
                {
                    FilteredNodes.Refresh();
                }
            }
        }

        public GraphNodeViewModel SelectedNode
        {
            get => _selectedNode;
            set
            {
                if (SetProperty(ref _selectedNode, value))
                {
                    UpdateSelectedNodeInfo();
                }
            }
        }

        public string SelectedNodeInfo
        {
            get => _selectedNodeInfo;
            set => SetProperty(ref _selectedNodeInfo, value);
        }

        public double ZoomLevel
        {
            get => _zoomLevel;
            set => SetProperty(ref _zoomLevel, value);
        }

        public int NodeCount => Nodes.Count;
        public int EdgeCount => Edges.Count;

        #endregion

        #region Commands

        public ICommand RefreshLayoutCommand { get; private set; }
        public ICommand CenterViewCommand { get; private set; }
        public ICommand ZoomInCommand { get; private set; }
        public ICommand ZoomOutCommand { get; private set; }
        public ICommand LoadDataCommand { get; private set; }

        protected override void InitializeCommands()
        {
            base.InitializeCommands();
            
            RefreshLayoutCommand = new AsyncRelayCommand(ApplyLayoutAsync);
            CenterViewCommand = new RelayCommand(CenterView);
            ZoomInCommand = new RelayCommand(ZoomIn);
            ZoomOutCommand = new RelayCommand(ZoomOut);
            LoadDataCommand = new AsyncRelayCommand(LoadDataAsync);
        }

        #endregion

        #region Public Methods

        public async Task LoadDataAsync()
        {
            await ExecuteAsync(async () =>
            {
                var profile = await _profileService.GetCurrentProfileAsync();
                if (profile == null) return;

                // Load data from all sources
                var users = await _dataService.LoadUsersAsync(profile.Name);
                var infrastructure = await _dataService.LoadInfrastructureAsync(profile.Name);
                var groups = await _dataService.LoadGroupsAsync(profile.Name);

                // Clear existing data
                Nodes.Clear();
                Edges.Clear();

                // Create nodes for users
                foreach (var user in users.Take(100)) // Limit for performance
                {
                    var node = new GraphNodeViewModel
                    {
                        Id = user.Id,
                        Label = user.Name ?? user.UserPrincipalName,
                        NodeType = "User",
                        NodeColor = "#FF4F46E5", // Blue
                        BorderColor = "#FF3730A3",
                        Icon = "\uE716", // Person icon
                        ToolTip = $"User: {user.Name}\nEmail: {user.UserPrincipalName}\nDepartment: {user.Department}",
                        Data = user,
                        X = Random.Shared.NextDouble() * CanvasWidth,
                        Y = Random.Shared.NextDouble() * CanvasHeight
                    };
                    Nodes.Add(node);
                }

                // Create nodes for computers
                foreach (var computer in infrastructure.Take(50))
                {
                    var node = new GraphNodeViewModel
                    {
                        Id = computer.Id,
                        Label = computer.Name,
                        NodeType = "Computer",
                        NodeColor = "#FF059669", // Green
                        BorderColor = "#FF047857",
                        Icon = "\uE977", // Computer icon
                        ToolTip = $"Computer: {computer.Name}\nOS: {computer.OperatingSystem}\nDomain: {computer.Domain}",
                        Data = computer,
                        X = Random.Shared.NextDouble() * CanvasWidth,
                        Y = Random.Shared.NextDouble() * CanvasHeight
                    };
                    Nodes.Add(node);
                }

                // Create nodes for groups
                foreach (var group in groups.Take(30))
                {
                    var node = new GraphNodeViewModel
                    {
                        Id = group.Id,
                        Label = group.Name,
                        NodeType = "Group",
                        NodeColor = "#FFDC2626", // Red
                        BorderColor = "#FFB91C1C",
                        Icon = "\uE902", // Group icon
                        ToolTip = $"Group: {group.Name}\nType: {group.Type}\nMembers: {group.MemberCount}",
                        Data = group,
                        X = Random.Shared.NextDouble() * CanvasWidth,
                        Y = Random.Shared.NextDouble() * CanvasHeight
                    };
                    Nodes.Add(node);
                }

                // Create edges based on relationships
                CreateEdges(users, infrastructure, groups);

                // Apply initial layout
                await ApplyLayoutAsync();

                // Update property change notifications
                OnPropertyChanged(nameof(NodeCount));
                OnPropertyChanged(nameof(EdgeCount));

            }, "Loading network data");
        }

        public void SelectNode(GraphNodeViewModel node)
        {
            SelectedNode = node;
            HighlightConnections(node, true);
        }

        public void HighlightConnections(GraphNodeViewModel node, bool highlight)
        {
            if (node == null) return;

            // Highlight connected edges
            foreach (var edge in Edges.Where(e => e.SourceId == node.Id || e.TargetId == node.Id))
            {
                edge.IsHighlighted = highlight;
            }

            // Highlight connected nodes
            var connectedNodeIds = Edges
                .Where(e => e.SourceId == node.Id || e.TargetId == node.Id)
                .SelectMany(e => new[] { e.SourceId, e.TargetId })
                .Where(id => id != node.Id)
                .Distinct();

            foreach (var connectedNode in Nodes.Where(n => connectedNodeIds.Contains(n.Id)))
            {
                connectedNode.IsHighlighted = highlight;
            }
        }

        public void UpdateNodeConnections(GraphNodeViewModel node)
        {
            // Update edges connected to this node
            foreach (var edge in Edges.Where(e => e.SourceId == node.Id || e.TargetId == node.Id))
            {
                var sourceNode = Nodes.FirstOrDefault(n => n.Id == edge.SourceId);
                var targetNode = Nodes.FirstOrDefault(n => n.Id == edge.TargetId);

                if (sourceNode != null && targetNode != null)
                {
                    edge.StartX = sourceNode.X + 25; // Center of node
                    edge.StartY = sourceNode.Y + 25;
                    edge.EndX = targetNode.X + 25;
                    edge.EndY = targetNode.Y + 25;
                }
            }
        }

        #endregion

        #region Private Methods

        private bool FilterNodes(object item)
        {
            if (item is GraphNodeViewModel node)
            {
                return SelectedNodeType == "All" || node.NodeType == SelectedNodeType;
            }
            return false;
        }

        private async Task ApplyLayoutAsync()
        {
            await ExecuteAsync(async () =>
            {
                await Task.Run(() =>
                {
                    switch (SelectedLayoutAlgorithm)
                    {
                        case "Force-Directed":
                            ApplyForceDirectedLayout();
                            break;
                        case "Hierarchical":
                            ApplyHierarchicalLayout();
                            break;
                        case "Circular":
                            ApplyCircularLayout();
                            break;
                        case "Grid":
                            ApplyGridLayout();
                            break;
                    }
                });

                // Update all edge positions
                foreach (var node in Nodes)
                {
                    UpdateNodeConnections(node);
                }

            }, "Applying layout");
        }

        private void ApplyForceDirectedLayout()
        {
            const int iterations = 100;
            const double k = 50; // Optimal distance
            const double temperature = 100;

            for (int iter = 0; iter < iterations; iter++)
            {
                // Calculate repulsive forces
                foreach (var node1 in Nodes)
                {
                    double fx = 0, fy = 0;

                    foreach (var node2 in Nodes.Where(n => n != node1))
                    {
                        double dx = node1.X - node2.X;
                        double dy = node1.Y - node2.Y;
                        double distance = Math.Max(1, Math.Sqrt(dx * dx + dy * dy));
                        
                        double force = k * k / distance;
                        fx += force * dx / distance;
                        fy += force * dy / distance;
                    }

                    // Calculate attractive forces from edges
                    foreach (var edge in Edges.Where(e => e.SourceId == node1.Id || e.TargetId == node1.Id))
                    {
                        var other = Nodes.FirstOrDefault(n => 
                            n.Id == (edge.SourceId == node1.Id ? edge.TargetId : edge.SourceId));
                        
                        if (other != null)
                        {
                            double dx = other.X - node1.X;
                            double dy = other.Y - node1.Y;
                            double distance = Math.Max(1, Math.Sqrt(dx * dx + dy * dy));
                            
                            double force = distance * distance / k;
                            fx += force * dx / distance;
                            fy += force * dy / distance;
                        }
                    }

                    // Apply forces with temperature cooling
                    double temp = temperature * (1 - (double)iter / iterations);
                    double displacement = Math.Min(temp, Math.Sqrt(fx * fx + fy * fy));
                    
                    if (displacement > 0)
                    {
                        node1.X = Math.Max(0, Math.Min(CanvasWidth - 50, node1.X + fx / displacement * temp));
                        node1.Y = Math.Max(0, Math.Min(CanvasHeight - 50, node1.Y + fy / displacement * temp));
                    }
                }
            }
        }

        private void ApplyHierarchicalLayout()
        {
            var levels = new Dictionary<string, int>();
            var nodesByType = Nodes.GroupBy(n => n.NodeType).ToList();
            
            int levelHeight = (int)(CanvasHeight / nodesByType.Count);
            int currentLevel = 0;

            foreach (var typeGroup in nodesByType)
            {
                var nodesInLevel = typeGroup.ToList();
                int nodeWidth = (int)(CanvasWidth / Math.Max(1, nodesInLevel.Count));
                
                for (int i = 0; i < nodesInLevel.Count; i++)
                {
                    nodesInLevel[i].X = i * nodeWidth + nodeWidth / 2;
                    nodesInLevel[i].Y = currentLevel * levelHeight + levelHeight / 2;
                }
                
                currentLevel++;
            }
        }

        private void ApplyCircularLayout()
        {
            double centerX = CanvasWidth / 2;
            double centerY = CanvasHeight / 2;
            double radius = Math.Min(CanvasWidth, CanvasHeight) / 3;
            
            int nodeCount = Nodes.Count;
            for (int i = 0; i < nodeCount; i++)
            {
                double angle = 2 * Math.PI * i / nodeCount;
                Nodes[i].X = centerX + radius * Math.Cos(angle) - 25;
                Nodes[i].Y = centerY + radius * Math.Sin(angle) - 25;
            }
        }

        private void ApplyGridLayout()
        {
            int cols = (int)Math.Ceiling(Math.Sqrt(Nodes.Count));
            int rows = (int)Math.Ceiling((double)Nodes.Count / cols);
            
            double cellWidth = CanvasWidth / cols;
            double cellHeight = CanvasHeight / rows;
            
            for (int i = 0; i < Nodes.Count; i++)
            {
                int row = i / cols;
                int col = i % cols;
                
                Nodes[i].X = col * cellWidth + cellWidth / 2 - 25;
                Nodes[i].Y = row * cellHeight + cellHeight / 2 - 25;
            }
        }

        private void CreateEdges(IEnumerable<UserData> users, IEnumerable<InfrastructureData> infrastructure, IEnumerable<GroupData> groups)
        {
            // Create edges based on domain relationships
            foreach (var user in users.Take(50))
            {
                // Connect users to computers in same domain
                foreach (var computer in infrastructure.Where(c => c.Domain == user.Domain).Take(5))
                {
                    var edge = new GraphEdgeViewModel
                    {
                        SourceId = user.Id,
                        TargetId = computer.Id,
                        ConnectionType = "Domain Membership",
                        Description = $"User {user.Name} in domain {user.Domain}",
                        EdgeColor = "#FF6B7280",
                        Weight = 1,
                        DashArray = null
                    };
                    Edges.Add(edge);
                }

                // Connect users to groups (simplified - would use actual group membership data)
                foreach (var group in groups.Where(g => g.Type == "Security").Take(2))
                {
                    var edge = new GraphEdgeViewModel
                    {
                        SourceId = user.Id,
                        TargetId = group.Id,
                        ConnectionType = "Group Membership",
                        Description = $"User {user.Name} member of {group.Name}",
                        EdgeColor = "#FFDC2626",
                        Weight = 2,
                        DashArray = "5,5"
                    };
                    Edges.Add(edge);
                }
            }

            // Update edge positions
            foreach (var edge in Edges)
            {
                var sourceNode = Nodes.FirstOrDefault(n => n.Id == edge.SourceId);
                var targetNode = Nodes.FirstOrDefault(n => n.Id == edge.TargetId);

                if (sourceNode != null && targetNode != null)
                {
                    edge.StartX = sourceNode.X + 25;
                    edge.StartY = sourceNode.Y + 25;
                    edge.EndX = targetNode.X + 25;
                    edge.EndY = targetNode.Y + 25;
                }
            }
        }

        private void CenterView()
        {
            // This would be implemented to center the view on the graph
            Logger?.LogInformation("Centering graph view");
        }

        private void ZoomIn()
        {
            ZoomLevel = Math.Min(3.0, ZoomLevel * 1.2);
        }

        private void ZoomOut()
        {
            ZoomLevel = Math.Max(0.1, ZoomLevel / 1.2);
        }

        private void UpdateSelectedNodeInfo()
        {
            if (SelectedNode != null)
            {
                var connections = Edges.Count(e => e.SourceId == SelectedNode.Id || e.TargetId == SelectedNode.Id);
                SelectedNodeInfo = $"Selected: {SelectedNode.Label} ({connections} connections)";
            }
            else
            {
                SelectedNodeInfo = string.Empty;
            }
        }

        #endregion
    }

    /// <summary>
    /// ViewModel for a graph node
    /// </summary>
    public class GraphNodeViewModel : BaseViewModel
    {
        private double _x;
        private double _y;
        private bool _isHighlighted;
        private int _connectionCount;

        public string Id { get; set; }
        public string Label { get; set; }
        public string NodeType { get; set; }
        public string NodeColor { get; set; }
        public string BorderColor { get; set; }
        public string Icon { get; set; }
        public string ToolTip { get; set; }
        public object Data { get; set; }

        public double X
        {
            get => _x;
            set
            {
                if (SetProperty(ref _x, value))
                {
                    OnPropertyChanged(nameof(LabelX));
                }
            }
        }

        public double Y
        {
            get => _y;
            set
            {
                if (SetProperty(ref _y, value))
                {
                    OnPropertyChanged(nameof(LabelY));
                }
            }
        }

        public double LabelX => X - 20;
        public double LabelY => Y + 55;

        public bool IsHighlighted
        {
            get => _isHighlighted;
            set => SetProperty(ref _isHighlighted, value);
        }

        public int ConnectionCount
        {
            get => _connectionCount;
            set => SetProperty(ref _connectionCount, value);
        }

        public bool ShowConnectionCount => ConnectionCount > 0;
    }

    /// <summary>
    /// ViewModel for a graph edge
    /// </summary>
    public class GraphEdgeViewModel : BaseViewModel
    {
        private double _startX;
        private double _startY;
        private double _endX;
        private double _endY;
        private bool _isHighlighted;

        public string SourceId { get; set; }
        public string TargetId { get; set; }
        public string ConnectionType { get; set; }
        public string Description { get; set; }
        public string EdgeColor { get; set; }
        public double Weight { get; set; } = 1.0;
        public string DashArray { get; set; }

        public double StartX
        {
            get => _startX;
            set => SetProperty(ref _startX, value);
        }

        public double StartY
        {
            get => _startY;
            set => SetProperty(ref _startY, value);
        }

        public double EndX
        {
            get => _endX;
            set => SetProperty(ref _endX, value);
        }

        public double EndY
        {
            get => _endY;
            set => SetProperty(ref _endY, value);
        }

        public bool IsHighlighted
        {
            get => _isHighlighted;
            set => SetProperty(ref _isHighlighted, value);
        }
    }
}