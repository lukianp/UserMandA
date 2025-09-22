using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using Newtonsoft.Json;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service implementation for managing dependency graphs and analysis
    /// </summary>
    public class DependencyGraphService : IDependencyGraphService
    {
        private readonly Dictionary<string, DependencyGraph> _graphs;
        private readonly string _graphsDirectory;

        #region Events

        public event EventHandler<DependencyNodeEventArgs> NodeAdded;
        public event EventHandler<DependencyNodeEventArgs> NodeUpdated;
        public event EventHandler<DependencyNodeEventArgs> NodeRemoved;
        public event EventHandler<DependencyEdgeEventArgs> EdgeAdded;
        public event EventHandler<DependencyEdgeEventArgs> EdgeUpdated;
        public event EventHandler<DependencyEdgeEventArgs> EdgeRemoved;
        public event EventHandler<DependencyGraphEventArgs> LayoutUpdated;

        #endregion

        public DependencyGraphService()
        {
            _graphs = new Dictionary<string, DependencyGraph>();
            _graphsDirectory = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "MandADiscoverySuite", "DependencyGraphs");

            Directory.CreateDirectory(_graphsDirectory);

            // Initialize events to prevent CS8618 warnings
            NodeAdded = delegate { };
            NodeUpdated = delegate { };
            NodeRemoved = delegate { };
            EdgeAdded = delegate { };
            EdgeUpdated = delegate { };
            EdgeRemoved = delegate { };
            LayoutUpdated = delegate { };
        }

        #region Graph Management

        public async Task<DependencyGraph> CreateGraphAsync(string name, string description = null)
        {
            var graph = new DependencyGraph
            {
                Name = name,
                Description = description ?? "",
                Created = DateTime.Now,
                LastModified = DateTime.Now
            };

            _graphs[graph.Id] = graph;
            await SaveGraphAsync(graph);
            return graph;
        }

        public async Task<DependencyGraph> LoadGraphAsync(string graphId)
        {
            if (_graphs.ContainsKey(graphId))
                return _graphs[graphId];

            var filePath = Path.Combine(_graphsDirectory, $"{graphId}.json");
            if (!File.Exists(filePath))
                throw new FileNotFoundException($"Graph with ID {graphId} not found");

            var json = await File.ReadAllTextAsync(filePath);
            var graph = JsonConvert.DeserializeObject<DependencyGraph>(json);
            
            if (graph != null)
            {
                _graphs[graphId] = graph;
                return graph;
            }
            
            throw new InvalidOperationException($"Failed to deserialize graph {graphId}");
        }

        public async Task SaveGraphAsync(DependencyGraph graph)
        {
            if (graph == null) throw new ArgumentNullException(nameof(graph));

            graph.LastModified = DateTime.Now;
            _graphs[graph.Id] = graph;

            var filePath = Path.Combine(_graphsDirectory, $"{graph.Id}.json");
            var json = JsonConvert.SerializeObject(graph, Formatting.Indented);
            await File.WriteAllTextAsync(filePath, json);
        }

        public async Task DeleteGraphAsync(string graphId)
        {
            _graphs.Remove(graphId);
            
            var filePath = Path.Combine(_graphsDirectory, $"{graphId}.json");
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
            
            await Task.CompletedTask;
        }

        public async Task<List<DependencyGraph>> GetAllGraphsAsync()
        {
            var graphs = new List<DependencyGraph>();
            
            // Load from memory first
            graphs.AddRange(_graphs.Values);
            
            // Load any graphs from disk that aren't in memory
            var files = Directory.GetFiles(_graphsDirectory, "*.json");
            foreach (var file in files)
            {
                var graphId = Path.GetFileNameWithoutExtension(file);
                if (!_graphs.ContainsKey(graphId))
                {
                    try
                    {
                        var graph = await LoadGraphAsync(graphId);
                        graphs.Add(graph);
                    }
                    catch
                    {
                        // Skip corrupted files
                    }
                }
            }
            
            return graphs.OrderByDescending(g => g.LastModified).ToList();
        }

        #endregion

        #region Node and Edge Management

        public async Task<DependencyNode> AddNodeAsync(string graphId, DependencyNode node)
        {
            var graph = await LoadGraphAsync(graphId);
            if (node.Id == null)
                node.Id = Guid.NewGuid().ToString();
                
            graph.Nodes.Add(node);
            await SaveGraphAsync(graph);
            
            NodeAdded?.Invoke(this, new DependencyNodeEventArgs { GraphId = graphId, Node = node });
            return node;
        }

        public async Task UpdateNodeAsync(string graphId, DependencyNode node)
        {
            var graph = await LoadGraphAsync(graphId);
            var existingNode = graph.Nodes.FirstOrDefault(n => n.Id == node.Id);
            
            if (existingNode != null)
            {
                var index = graph.Nodes.IndexOf(existingNode);
                graph.Nodes[index] = node;
                await SaveGraphAsync(graph);
                
                NodeUpdated?.Invoke(this, new DependencyNodeEventArgs { GraphId = graphId, Node = node });
            }
        }

        public async Task RemoveNodeAsync(string graphId, string nodeId)
        {
            var graph = await LoadGraphAsync(graphId);
            var node = graph.Nodes.FirstOrDefault(n => n.Id == nodeId);
            
            if (node != null)
            {
                graph.Nodes.Remove(node);
                
                // Remove all edges connected to this node
                var edgesToRemove = graph.Edges.Where(e => e.SourceNodeId == nodeId || e.TargetNodeId == nodeId).ToList();
                foreach (var edge in edgesToRemove)
                {
                    graph.Edges.Remove(edge);
                }
                
                await SaveGraphAsync(graph);
                NodeRemoved?.Invoke(this, new DependencyNodeEventArgs { GraphId = graphId, Node = node });
            }
        }

        public async Task<DependencyEdge> AddEdgeAsync(string graphId, DependencyEdge edge)
        {
            var graph = await LoadGraphAsync(graphId);
            if (edge.Id == null)
                edge.Id = Guid.NewGuid().ToString();
                
            // Validate that both nodes exist
            var sourceExists = graph.Nodes.Any(n => n.Id == edge.SourceNodeId);
            var targetExists = graph.Nodes.Any(n => n.Id == edge.TargetNodeId);
            
            if (!sourceExists || !targetExists)
                throw new ArgumentException("Source or target node not found in graph");
                
            graph.Edges.Add(edge);
            await SaveGraphAsync(graph);
            
            EdgeAdded?.Invoke(this, new DependencyEdgeEventArgs { GraphId = graphId, Edge = edge });
            return edge;
        }

        public async Task UpdateEdgeAsync(string graphId, DependencyEdge edge)
        {
            var graph = await LoadGraphAsync(graphId);
            var existingEdge = graph.Edges.FirstOrDefault(e => e.Id == edge.Id);
            
            if (existingEdge != null)
            {
                var index = graph.Edges.IndexOf(existingEdge);
                graph.Edges[index] = edge;
                await SaveGraphAsync(graph);
                
                EdgeUpdated?.Invoke(this, new DependencyEdgeEventArgs { GraphId = graphId, Edge = edge });
            }
        }

        public async Task RemoveEdgeAsync(string graphId, string edgeId)
        {
            var graph = await LoadGraphAsync(graphId);
            var edge = graph.Edges.FirstOrDefault(e => e.Id == edgeId);
            
            if (edge != null)
            {
                graph.Edges.Remove(edge);
                await SaveGraphAsync(graph);
                
                EdgeRemoved?.Invoke(this, new DependencyEdgeEventArgs { GraphId = graphId, Edge = edge });
            }
        }

        #endregion

        #region Layout and Positioning

        public async Task<DependencyGraph> ApplyLayoutAsync(string graphId, GraphLayoutAlgorithm algorithm, GraphLayoutSettings settings = null)
        {
            var graph = await LoadGraphAsync(graphId);
            settings ??= new GraphLayoutSettings { Algorithm = algorithm };
            
            Dictionary<string, Point> positions = algorithm switch
            {
                GraphLayoutAlgorithm.ForceDirected => await CalculateForceDirectedLayoutAsync(graph, settings),
                GraphLayoutAlgorithm.Hierarchical => await CalculateHierarchicalLayoutAsync(graph, settings),
                GraphLayoutAlgorithm.Circular => await CalculateCircularLayoutAsync(graph, settings),
                GraphLayoutAlgorithm.Grid => await CalculateGridLayoutAsync(graph, settings),
                GraphLayoutAlgorithm.Tree => await CalculateHierarchicalLayoutAsync(graph, settings), // Use hierarchical for tree
                GraphLayoutAlgorithm.Radial => await CalculateCircularLayoutAsync(graph, settings), // Use circular for radial
                _ => await CalculateForceDirectedLayoutAsync(graph, settings)
            };
            
            // Apply calculated positions to nodes
            foreach (var node in graph.Nodes)
            {
                if (positions.ContainsKey(node.Id))
                {
                    node.Position = positions[node.Id];
                }
            }
            
            await SaveGraphAsync(graph);
            LayoutUpdated?.Invoke(this, new DependencyGraphEventArgs 
            { 
                Graph = graph, 
                Algorithm = algorithm, 
                Settings = settings 
            });
            
            return graph;
        }

        public async Task<Dictionary<string, Point>> CalculateForceDirectedLayoutAsync(DependencyGraph graph, GraphLayoutSettings settings)
        {
            return await Task.Run(() =>
            {
                var positions = new Dictionary<string, Point>();
                var nodes = graph.Nodes.ToList();
                var random = new Random();
                
                // Initialize random positions
                foreach (var node in nodes)
                {
                    positions[node.Id] = new Point(
                        random.NextDouble() * 800,
                        random.NextDouble() * 600
                    );
                }
                
                // Force-directed algorithm simulation
                for (int iteration = 0; iteration < settings.MaxIterations; iteration++)
                {
                    var forces = new Dictionary<string, Vector>();
                    
                    // Initialize forces
                    foreach (var node in nodes)
                    {
                        forces[node.Id] = new Vector(0, 0);
                    }
                    
                    // Repulsion forces between all nodes
                    for (int i = 0; i < nodes.Count; i++)
                    {
                        for (int j = i + 1; j < nodes.Count; j++)
                        {
                            var node1 = nodes[i];
                            var node2 = nodes[j];
                            var pos1 = positions[node1.Id];
                            var pos2 = positions[node2.Id];
                            
                            var direction = pos1 - pos2;
                            var distance = Math.Max(direction.Length, 1);
                            direction.Normalize();
                            
                            var repulsion = settings.RepulsionStrength / (distance * distance);
                            var force = direction * repulsion;
                            
                            forces[node1.Id] += force;
                            forces[node2.Id] -= force;
                        }
                    }
                    
                    // Attraction forces for connected nodes
                    foreach (var edge in graph.Edges)
                    {
                        var pos1 = positions[edge.SourceNodeId];
                        var pos2 = positions[edge.TargetNodeId];
                        
                        var direction = pos2 - pos1;
                        var distance = Math.Max(direction.Length, 1);
                        direction.Normalize();
                        
                        var attraction = settings.AttractionStrength * (distance - settings.EdgeLength);
                        var force = direction * attraction;
                        
                        forces[edge.SourceNodeId] += force;
                        forces[edge.TargetNodeId] -= force;
                    }
                    
                    // Apply forces with damping
                    foreach (var node in nodes)
                    {
                        var force = forces[node.Id] * settings.Damping;
                        var newPos = positions[node.Id] + force;
                        
                        // Keep within bounds
                        newPos.X = Math.Max(50, Math.Min(750, newPos.X));
                        newPos.Y = Math.Max(50, Math.Min(550, newPos.Y));
                        
                        positions[node.Id] = newPos;
                    }
                }
                
                return positions;
            });
        }

        public async Task<Dictionary<string, Point>> CalculateHierarchicalLayoutAsync(DependencyGraph graph, GraphLayoutSettings settings)
        {
            return await Task.Run(() =>
            {
                var positions = new Dictionary<string, Point>();
                var nodes = graph.Nodes.ToList();
                
                if (nodes.Count == 0) return positions;
                
                // Simple hierarchical layout - arrange in levels based on dependency depth
                var levels = new List<List<DependencyNode>>();
                var visited = new HashSet<string>();
                var queue = new Queue<(DependencyNode node, int level)>();
                
                // Find root nodes (no incoming edges)
                var rootNodes = nodes.Where(n => !graph.Edges.Any(e => e.TargetNodeId == n.Id)).ToList();
                if (rootNodes.Count == 0)
                    rootNodes = nodes.Take(1).ToList(); // Use first node if no clear root
                
                foreach (var root in rootNodes)
                {
                    queue.Enqueue((root, 0));
                }
                
                while (queue.Count > 0)
                {
                    var (node, level) = queue.Dequeue();
                    if (visited.Contains(node.Id)) continue;
                    
                    visited.Add(node.Id);
                    
                    // Ensure we have enough levels
                    while (levels.Count <= level)
                        levels.Add(new List<DependencyNode>());
                    
                    levels[level].Add(node);
                    
                    // Add children to queue
                    var children = graph.Edges
                        .Where(e => e.SourceNodeId == node.Id)
                        .Select(e => nodes.FirstOrDefault(n => n.Id == e.TargetNodeId))
                        .Where(n => n != null && !visited.Contains(n.Id));
                    
                    foreach (var child in children)
                    {
                        queue.Enqueue((child, level + 1));
                    }
                }
                
                // Position nodes in levels
                double levelHeight = 100;
                for (int levelIndex = 0; levelIndex < levels.Count; levelIndex++)
                {
                    var levelNodes = levels[levelIndex];
                    double nodeSpacing = levelNodes.Count > 1 ? 600.0 / (levelNodes.Count - 1) : 0;
                    
                    for (int nodeIndex = 0; nodeIndex < levelNodes.Count; nodeIndex++)
                    {
                        var x = levelNodes.Count == 1 ? 400 : 100 + nodeIndex * nodeSpacing;
                        var y = 100 + levelIndex * levelHeight;
                        
                        positions[levelNodes[nodeIndex].Id] = new Point(x, y);
                    }
                }
                
                return positions;
            });
        }

        public async Task<Dictionary<string, Point>> CalculateCircularLayoutAsync(DependencyGraph graph, GraphLayoutSettings settings)
        {
            return await Task.Run(() =>
            {
                var positions = new Dictionary<string, Point>();
                var nodes = graph.Nodes.ToList();
                
                if (nodes.Count == 0) return positions;
                
                double centerX = 400;
                double centerY = 300;
                double radius = Math.Min(250, Math.Max(100, nodes.Count * 20));
                
                for (int i = 0; i < nodes.Count; i++)
                {
                    double angle = 2 * Math.PI * i / nodes.Count;
                    double x = centerX + radius * Math.Cos(angle);
                    double y = centerY + radius * Math.Sin(angle);
                    
                    positions[nodes[i].Id] = new Point(x, y);
                }
                
                return positions;
            });
        }

        public async Task<Dictionary<string, Point>> CalculateGridLayoutAsync(DependencyGraph graph, GraphLayoutSettings settings)
        {
            return await Task.Run(() =>
            {
                var positions = new Dictionary<string, Point>();
                var nodes = graph.Nodes.ToList();
                
                if (nodes.Count == 0) return positions;
                
                int cols = (int)Math.Ceiling(Math.Sqrt(nodes.Count));
                int rows = (int)Math.Ceiling((double)nodes.Count / cols);
                
                double cellWidth = 700.0 / cols;
                double cellHeight = 500.0 / rows;
                
                for (int i = 0; i < nodes.Count; i++)
                {
                    int row = i / cols;
                    int col = i % cols;
                    
                    double x = 50 + col * cellWidth + cellWidth / 2;
                    double y = 50 + row * cellHeight + cellHeight / 2;
                    
                    positions[nodes[i].Id] = new Point(x, y);
                }
                
                return positions;
            });
        }

        #endregion

        #region Analysis and Filtering

        public async Task<DependencyGraph> ApplyFilterAsync(DependencyGraph graph, DependencyGraphFilter filter)
        {
            return await Task.Run(() =>
            {
                var filteredGraph = new DependencyGraph
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = $"{graph.Name} (Filtered)",
                    Description = $"Filtered view of {graph.Name}",
                    Created = DateTime.Now,
                    LastModified = DateTime.Now,
                    Metadata = new Dictionary<string, object>(graph.Metadata)
                };
                
                // Filter nodes
                var filteredNodes = graph.Nodes.Where(node =>
                {
                    // Filter by node types
                    if (filter.NodeTypes.Any() && !filter.NodeTypes.Contains(node.Type))
                        return false;
                    
                    // Filter by node statuses
                    if (filter.NodeStatuses.Any() && !filter.NodeStatuses.Contains(node.Status))
                        return false;
                    
                    // Filter by search text
                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        var searchText = filter.SearchText.ToLower();
                        if (!node.Name.ToLower().Contains(searchText) && 
                            !node.Description.ToLower().Contains(searchText))
                            return false;
                    }
                    
                    return true;
                }).ToList();
                
                filteredGraph.Nodes = filteredNodes;
                
                // Filter edges
                var nodeIds = new HashSet<string>(filteredNodes.Select(n => n.Id));
                var filteredEdges = graph.Edges.Where(edge =>
                {
                    // Only include edges where both nodes are in filtered set
                    if (!nodeIds.Contains(edge.SourceNodeId) || !nodeIds.Contains(edge.TargetNodeId))
                        return false;
                    
                    // Filter by edge types
                    if (filter.EdgeTypes.Any() && !filter.EdgeTypes.Contains(edge.EdgeType))
                        return false;
                    
                    // Filter by minimum weight
                    if (edge.Weight < filter.MinWeight)
                        return false;
                    
                    return true;
                }).ToList();
                
                filteredGraph.Edges = filteredEdges;
                
                return filteredGraph;
            });
        }

        public async Task<List<DependencyNode>> FindShortestPathAsync(string graphId, string fromNodeId, string toNodeId)
        {
            var graph = await LoadGraphAsync(graphId);
            
            return await Task.Run(() =>
            {
                // Dijkstra's algorithm implementation
                var distances = new Dictionary<string, double>();
                var previous = new Dictionary<string, string>();
                var unvisited = new HashSet<string>();
                
                // Initialize
                foreach (var node in graph.Nodes)
                {
                    distances[node.Id] = double.MaxValue;
                    unvisited.Add(node.Id);
                }
                distances[fromNodeId] = 0;
                
                while (unvisited.Count > 0)
                {
                    var current = unvisited.OrderBy(id => distances[id]).First();
                    unvisited.Remove(current);
                    
                    if (current == toNodeId)
                        break;
                    
                    var neighbors = graph.Edges
                        .Where(e => e.SourceNodeId == current)
                        .Select(e => e.TargetNodeId)
                        .Where(id => unvisited.Contains(id));
                    
                    foreach (var neighbor in neighbors)
                    {
                        var edge = graph.Edges.First(e => e.SourceNodeId == current && e.TargetNodeId == neighbor);
                        var alt = distances[current] + edge.Weight;
                        
                        if (alt < distances[neighbor])
                        {
                            distances[neighbor] = alt;
                            previous[neighbor] = current;
                        }
                    }
                }
                
                // Reconstruct path
                var path = new List<DependencyNode>();
                var pathNodeId = toNodeId;
                
                while (pathNodeId != null)
                {
                    var node = graph.Nodes.First(n => n.Id == pathNodeId);
                    path.Insert(0, node);
                    previous.TryGetValue(pathNodeId, out pathNodeId);
                }
                
                return path.Count > 1 ? path : new List<DependencyNode>();
            });
        }

        public async Task<List<DependencyNode>> FindNodesWithinDepthAsync(string graphId, string nodeId, int maxDepth)
        {
            var graph = await LoadGraphAsync(graphId);
            
            return await Task.Run(() =>
            {
                var result = new List<DependencyNode>();
                var visited = new HashSet<string>();
                var queue = new Queue<(string id, int depth)>();
                
                queue.Enqueue((nodeId, 0));
                
                while (queue.Count > 0)
                {
                    var (currentId, depth) = queue.Dequeue();
                    
                    if (visited.Contains(currentId) || depth > maxDepth)
                        continue;
                    
                    visited.Add(currentId);
                    var node = graph.Nodes.FirstOrDefault(n => n.Id == currentId);
                    if (node != null)
                        result.Add(node);
                    
                    // Add connected nodes
                    var connectedIds = graph.Edges
                        .Where(e => e.SourceNodeId == currentId || e.TargetNodeId == currentId)
                        .Select(e => e.SourceNodeId == currentId ? e.TargetNodeId : e.SourceNodeId)
                        .Where(id => !visited.Contains(id));
                    
                    foreach (var connectedId in connectedIds)
                    {
                        queue.Enqueue((connectedId, depth + 1));
                    }
                }
                
                return result;
            });
        }

        public async Task<List<List<DependencyNode>>> DetectCircularDependenciesAsync(string graphId)
        {
            var graph = await LoadGraphAsync(graphId);
            
            return await Task.Run(() =>
            {
                var cycles = new List<List<DependencyNode>>();
                var visited = new HashSet<string>();
                var recursionStack = new HashSet<string>();
                
                // DFS to detect cycles
                bool HasCycle(string nodeId, List<string> path)
                {
                    if (recursionStack.Contains(nodeId))
                    {
                        // Found cycle - extract it
                        var cycleStart = path.IndexOf(nodeId);
                        var cyclePath = path.Skip(cycleStart).ToList();
                        cyclePath.Add(nodeId); // Complete the cycle
                        
                        var cycleNodes = cyclePath.Select(id => graph.Nodes.First(n => n.Id == id)).ToList();
                        cycles.Add(cycleNodes);
                        return true;
                    }
                    
                    if (visited.Contains(nodeId))
                        return false;
                    
                    visited.Add(nodeId);
                    recursionStack.Add(nodeId);
                    path.Add(nodeId);
                    
                    var children = graph.Edges
                        .Where(e => e.SourceNodeId == nodeId)
                        .Select(e => e.TargetNodeId);
                    
                    foreach (var child in children)
                    {
                        if (HasCycle(child, path))
                            return true;
                    }
                    
                    recursionStack.Remove(nodeId);
                    path.RemoveAt(path.Count - 1);
                    return false;
                }
                
                foreach (var node in graph.Nodes)
                {
                    if (!visited.Contains(node.Id))
                    {
                        HasCycle(node.Id, new List<string>());
                    }
                }
                
                return cycles;
            });
        }

        public async Task<Dictionary<string, double>> CalculateNodeCentralityAsync(string graphId)
        {
            var graph = await LoadGraphAsync(graphId);
            
            return await Task.Run(() =>
            {
                var centrality = new Dictionary<string, double>();
                
                // Simple degree centrality calculation
                foreach (var node in graph.Nodes)
                {
                    var degree = graph.Edges.Count(e => e.SourceNodeId == node.Id || e.TargetNodeId == node.Id);
                    centrality[node.Id] = (double)degree / Math.Max(1, graph.Nodes.Count - 1);
                }
                
                return centrality;
            });
        }

        public async Task<List<List<DependencyNode>>> GetConnectedComponentsAsync(string graphId)
        {
            var graph = await LoadGraphAsync(graphId);
            
            return await Task.Run(() =>
            {
                var components = new List<List<DependencyNode>>();
                var visited = new HashSet<string>();
                
                foreach (var node in graph.Nodes)
                {
                    if (!visited.Contains(node.Id))
                    {
                        var component = new List<DependencyNode>();
                        var queue = new Queue<string>();
                        
                        queue.Enqueue(node.Id);
                        
                        while (queue.Count > 0)
                        {
                            var currentId = queue.Dequeue();
                            if (visited.Contains(currentId))
                                continue;
                            
                            visited.Add(currentId);
                            var currentNode = graph.Nodes.First(n => n.Id == currentId);
                            component.Add(currentNode);
                            
                            // Add connected nodes
                            var connectedIds = graph.Edges
                                .Where(e => e.SourceNodeId == currentId || e.TargetNodeId == currentId)
                                .Select(e => e.SourceNodeId == currentId ? e.TargetNodeId : e.SourceNodeId)
                                .Where(id => !visited.Contains(id));
                            
                            foreach (var connectedId in connectedIds)
                            {
                                queue.Enqueue(connectedId);
                            }
                        }
                        
                        components.Add(component);
                    }
                }
                
                return components;
            });
        }

        #endregion

        #region Data Integration

        public async Task<DependencyGraph> BuildGraphFromDiscoveryDataAsync(string name, List<UserData> users = null, 
            List<GroupData> groups = null, List<InfrastructureData> infrastructure = null, 
            List<ApplicationData> applications = null)
        {
            var graph = await CreateGraphAsync(name, "Graph built from discovery data");
            
            // Add user nodes
            if (users != null)
            {
                foreach (var user in users)
                {
                    var node = new DependencyNode
                    {
                        Name = user.Name,
                        Type = "User",
                        Description = $"User: {user.Name}",
                        Status = DependencyNodeStatus.Normal,
                        Icon = "👤",
                        Color = "#4CAF50"
                    };
                    node.Properties["OriginalData"] = user;
                    await AddNodeAsync(graph.Id, node);
                }
            }
            
            // Add group nodes
            if (groups != null)
            {
                foreach (var group in groups)
                {
                    var node = new DependencyNode
                    {
                        Name = group.Name,
                        Type = "Group",
                        Description = $"Group: {group.Name}",
                        Status = DependencyNodeStatus.Normal,
                        Icon = "👥",
                        Color = "#2196F3"
                    };
                    node.Properties["OriginalData"] = group;
                    await AddNodeAsync(graph.Id, node);
                }
            }
            
            // Add infrastructure nodes
            if (infrastructure != null)
            {
                foreach (var infra in infrastructure)
                {
                    var node = new DependencyNode
                    {
                        Name = infra.Name,
                        Type = "Infrastructure",
                        Description = $"Infrastructure: {infra.Name} ({infra.Type})",
                        Status = DependencyNodeStatus.Normal,
                        Icon = "🖥️",
                        Color = "#FF9800"
                    };
                    node.Properties["OriginalData"] = infra;
                    await AddNodeAsync(graph.Id, node);
                }
            }
            
            // Add application nodes
            if (applications != null)
            {
                foreach (var app in applications)
                {
                    var node = new DependencyNode
                    {
                        Name = app.Name,
                        Type = "Application",
                        Description = $"Application: {app.Name} ({app.Publisher})",
                        Status = DependencyNodeStatus.Normal,
                        Icon = "📱",
                        Color = "#9C27B0"
                    };
                    node.Properties["OriginalData"] = app;
                    await AddNodeAsync(graph.Id, node);
                }
            }
            
            // Create basic relationships (this would be enhanced with actual discovery logic)
            await CreateBasicRelationships(graph);
            
            return graph;
        }

        private async Task CreateBasicRelationships(DependencyGraph graph)
        {
            var nodes = graph.Nodes;
            var random = new Random();
            
            // Create some sample relationships between different node types
            var userNodes = nodes.Where(n => n.Type == "User").ToList();
            var groupNodes = nodes.Where(n => n.Type == "Group").ToList();
            var infraNodes = nodes.Where(n => n.Type == "Infrastructure").ToList();
            var appNodes = nodes.Where(n => n.Type == "Application").ToList();
            
            // Users to Groups (membership)
            foreach (var user in userNodes.Take(Math.Min(userNodes.Count, 10)))
            {
                var group = groupNodes.OrderBy(x => random.Next()).FirstOrDefault();
                if (group != null)
                {
                    var edge = new DependencyEdge
                    {
                        SourceNodeId = user.Id,
                        TargetNodeId = group.Id,
                        EdgeType = DependencyEdgeType.Contains,
                        Label = "Member of",
                        Weight = 1.0,
                        Color = "#666666"
                    };
                    await AddEdgeAsync(graph.Id, edge);
                }
            }
            
            // Applications to Infrastructure (hosted on)
            foreach (var app in appNodes.Take(Math.Min(appNodes.Count, 5)))
            {
                var infra = infraNodes.OrderBy(x => random.Next()).FirstOrDefault();
                if (infra != null)
                {
                    var edge = new DependencyEdge
                    {
                        SourceNodeId = app.Id,
                        TargetNodeId = infra.Id,
                        EdgeType = DependencyEdgeType.DependsOn,
                        Label = "Hosted on",
                        Weight = 2.0,
                        Color = "#FF5722"
                    };
                    await AddEdgeAsync(graph.Id, edge);
                }
            }
        }

        public async Task UpdateGraphWithDiscoveryDataAsync(string graphId, List<UserData> users = null, 
            List<GroupData> groups = null, List<InfrastructureData> infrastructure = null, 
            List<ApplicationData> applications = null)
        {
            // Implementation would compare new data with existing graph and update accordingly
            await Task.CompletedTask;
        }

        public async Task<string> ExportGraphAsync(string graphId, string format = "json")
        {
            var graph = await LoadGraphAsync(graphId);
            
            return format.ToLower() switch
            {
                "json" => JsonConvert.SerializeObject(graph, Formatting.Indented),
                "xml" => ExportToXml(graph),
                "csv" => ExportToCsv(graph),
                _ => JsonConvert.SerializeObject(graph, Formatting.Indented)
            };
        }

        public async Task<DependencyGraph> ImportGraphAsync(string filePath, string format = "json")
        {
            if (!File.Exists(filePath))
                throw new FileNotFoundException($"File not found: {filePath}");
            
            var content = await File.ReadAllTextAsync(filePath);
            
            return format.ToLower() switch
            {
                "json" => JsonConvert.DeserializeObject<DependencyGraph>(content),
                "xml" => ImportFromXml(content),
                _ => JsonConvert.DeserializeObject<DependencyGraph>(content)
            };
        }

        #region Export/Import Helpers

        private string ExportToXml(DependencyGraph graph)
        {
            var xml = new System.Xml.XmlDocument();
            var root = xml.CreateElement("DependencyGraph");

            // Add graph properties
            root.SetAttribute("Id", graph.Id);
            root.SetAttribute("Name", graph.Name);
            root.SetAttribute("CreatedDate", graph.Created.ToString("o"));

            // Add nodes
            var nodesElement = xml.CreateElement("Nodes");
            foreach (var node in graph.Nodes)
            {
                var nodeElement = xml.CreateElement("Node");
                nodeElement.SetAttribute("Id", node.Id);
                nodeElement.SetAttribute("Label", node.Name);
                nodeElement.SetAttribute("Type", node.Type);
                nodeElement.SetAttribute("X", node.Position.X.ToString());
                nodeElement.SetAttribute("Y", node.Position.Y.ToString());
                nodeElement.SetAttribute("IsSelected", node.IsSelected.ToString());
                nodesElement.AppendChild(nodeElement);
            }
            root.AppendChild(nodesElement);

            // Add edges
            var edgesElement = xml.CreateElement("Edges");
            foreach (var edge in graph.Edges)
            {
                var edgeElement = xml.CreateElement("Edge");
                edgeElement.SetAttribute("Id", edge.Id);
                edgeElement.SetAttribute("Source", edge.SourceNodeId);
                edgeElement.SetAttribute("Target", edge.TargetNodeId);
                edgeElement.SetAttribute("Type", edge.EdgeType.ToString());
                edgeElement.SetAttribute("Weight", edge.Weight.ToString());
                edgesElement.AppendChild(edgeElement);
            }
            root.AppendChild(edgesElement);

            xml.AppendChild(root);
            return xml.OuterXml;
        }

        private string ExportToCsv(DependencyGraph graph)
        {
            var csv = new System.Text.StringBuilder();

            // Export nodes
            csv.AppendLine("# Nodes");
            csv.AppendLine("Id,Label,Type,X,Y,IsSelected");
            foreach (var node in graph.Nodes)
            {
                csv.AppendLine($"\"{node.Id}\",\"{node.Name}\",\"{node.Type}\",{node.Position.X},{node.Position.Y},{node.IsSelected}");
            }

            csv.AppendLine();

            // Export edges
            csv.AppendLine("# Edges");
            csv.AppendLine("Id,Source,Target,Type,Weight");
            foreach (var edge in graph.Edges)
            {
                csv.AppendLine($"\"{edge.Id}\",\"{edge.SourceNodeId}\",\"{edge.TargetNodeId}\",\"{edge.EdgeType}\",{edge.Weight}");
            }

            return csv.ToString();
        }

        private DependencyGraph ImportFromXml(string xmlContent)
        {
            var xml = new System.Xml.XmlDocument();
            xml.LoadXml(xmlContent);

            var root = xml.DocumentElement;
            var graph = new DependencyGraph
            {
                Id = root.GetAttribute("Id"),
                Name = root.GetAttribute("Name"),
                Created = DateTime.Parse(root.GetAttribute("CreatedDate"))
            };

            // Import nodes
            var nodesElement = root.SelectSingleNode("Nodes");
            if (nodesElement != null)
            {
                foreach (System.Xml.XmlNode nodeElement in nodesElement.ChildNodes)
                {
                    if (nodeElement.Name == "Node")
                    {
                        var node = new DependencyNode
                        {
                            Id = nodeElement.Attributes["Id"]?.Value,
                            Name = nodeElement.Attributes["Label"]?.Value,
                            Type = nodeElement.Attributes["Type"]?.Value,
                            Position = new System.Windows.Point(
                                double.Parse(nodeElement.Attributes["X"]?.Value ?? "0"),
                                double.Parse(nodeElement.Attributes["Y"]?.Value ?? "0")
                            ),
                            IsSelected = bool.Parse(nodeElement.Attributes["IsSelected"]?.Value ?? "false")
                        };
                        graph.Nodes.Add(node);
                    }
                }
            }

            // Import edges
            var edgesElement = root.SelectSingleNode("Edges");
            if (edgesElement != null)
            {
                foreach (System.Xml.XmlNode edgeElement in edgesElement.ChildNodes)
                {
                    if (edgeElement.Name == "Edge")
                    {
                        var edge = new DependencyEdge
                        {
                            Id = edgeElement.Attributes["Id"]?.Value,
                            SourceNodeId = edgeElement.Attributes["Source"]?.Value,
                            TargetNodeId = edgeElement.Attributes["Target"]?.Value,
                            EdgeType = Enum.Parse<DependencyEdgeType>(edgeElement.Attributes["Type"]?.Value ?? "Dependency"),
                            Weight = double.Parse(edgeElement.Attributes["Weight"]?.Value ?? "1")
                        };
                        graph.Edges.Add(edge);
                    }
                }
            }

            return graph;
        }

        #endregion

        #endregion
    }
}