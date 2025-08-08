using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service interface for managing dependency graphs and analysis
    /// </summary>
    public interface IDependencyGraphService
    {
        #region Graph Management

        /// <summary>
        /// Creates a new dependency graph
        /// </summary>
        Task<DependencyGraph> CreateGraphAsync(string name, string description = null);

        /// <summary>
        /// Loads an existing dependency graph
        /// </summary>
        Task<DependencyGraph> LoadGraphAsync(string graphId);

        /// <summary>
        /// Saves a dependency graph
        /// </summary>
        Task SaveGraphAsync(DependencyGraph graph);

        /// <summary>
        /// Deletes a dependency graph
        /// </summary>
        Task DeleteGraphAsync(string graphId);

        /// <summary>
        /// Gets all available dependency graphs
        /// </summary>
        Task<List<DependencyGraph>> GetAllGraphsAsync();

        #endregion

        #region Node and Edge Management

        /// <summary>
        /// Adds a node to the graph
        /// </summary>
        Task<DependencyNode> AddNodeAsync(string graphId, DependencyNode node);

        /// <summary>
        /// Updates an existing node
        /// </summary>
        Task UpdateNodeAsync(string graphId, DependencyNode node);

        /// <summary>
        /// Removes a node from the graph
        /// </summary>
        Task RemoveNodeAsync(string graphId, string nodeId);

        /// <summary>
        /// Adds an edge between two nodes
        /// </summary>
        Task<DependencyEdge> AddEdgeAsync(string graphId, DependencyEdge edge);

        /// <summary>
        /// Updates an existing edge
        /// </summary>
        Task UpdateEdgeAsync(string graphId, DependencyEdge edge);

        /// <summary>
        /// Removes an edge from the graph
        /// </summary>
        Task RemoveEdgeAsync(string graphId, string edgeId);

        #endregion

        #region Layout and Positioning

        /// <summary>
        /// Applies a layout algorithm to position nodes
        /// </summary>
        Task<DependencyGraph> ApplyLayoutAsync(string graphId, GraphLayoutAlgorithm algorithm, GraphLayoutSettings settings = null);

        /// <summary>
        /// Calculates optimal positions using force-directed algorithm
        /// </summary>
        Task<Dictionary<string, System.Windows.Point>> CalculateForceDirectedLayoutAsync(DependencyGraph graph, GraphLayoutSettings settings);

        /// <summary>
        /// Calculates hierarchical layout positions
        /// </summary>
        Task<Dictionary<string, System.Windows.Point>> CalculateHierarchicalLayoutAsync(DependencyGraph graph, GraphLayoutSettings settings);

        /// <summary>
        /// Calculates circular layout positions
        /// </summary>
        Task<Dictionary<string, System.Windows.Point>> CalculateCircularLayoutAsync(DependencyGraph graph, GraphLayoutSettings settings);

        /// <summary>
        /// Calculates grid layout positions
        /// </summary>
        Task<Dictionary<string, System.Windows.Point>> CalculateGridLayoutAsync(DependencyGraph graph, GraphLayoutSettings settings);

        #endregion

        #region Analysis and Filtering

        /// <summary>
        /// Filters graph based on criteria
        /// </summary>
        Task<DependencyGraph> ApplyFilterAsync(DependencyGraph graph, DependencyGraphFilter filter);

        /// <summary>
        /// Finds shortest path between two nodes
        /// </summary>
        Task<List<DependencyNode>> FindShortestPathAsync(string graphId, string fromNodeId, string toNodeId);

        /// <summary>
        /// Finds all nodes within specified depth from a starting node
        /// </summary>
        Task<List<DependencyNode>> FindNodesWithinDepthAsync(string graphId, string nodeId, int maxDepth);

        /// <summary>
        /// Detects circular dependencies in the graph
        /// </summary>
        Task<List<List<DependencyNode>>> DetectCircularDependenciesAsync(string graphId);

        /// <summary>
        /// Calculates centrality measures for nodes
        /// </summary>
        Task<Dictionary<string, double>> CalculateNodeCentralityAsync(string graphId);

        /// <summary>
        /// Gets connected components of the graph
        /// </summary>
        Task<List<List<DependencyNode>>> GetConnectedComponentsAsync(string graphId);

        #endregion

        #region Data Integration

        /// <summary>
        /// Builds graph from discovery data
        /// </summary>
        Task<DependencyGraph> BuildGraphFromDiscoveryDataAsync(string name, List<UserData> users = null, 
            List<GroupData> groups = null, List<InfrastructureData> infrastructure = null, 
            List<ApplicationData> applications = null);

        /// <summary>
        /// Updates graph with new discovery data
        /// </summary>
        Task UpdateGraphWithDiscoveryDataAsync(string graphId, List<UserData> users = null, 
            List<GroupData> groups = null, List<InfrastructureData> infrastructure = null, 
            List<ApplicationData> applications = null);

        /// <summary>
        /// Exports graph to various formats
        /// </summary>
        Task<string> ExportGraphAsync(string graphId, string format = "json");

        /// <summary>
        /// Imports graph from file
        /// </summary>
        Task<DependencyGraph> ImportGraphAsync(string filePath, string format = "json");

        #endregion

        #region Events

        /// <summary>
        /// Event fired when a node is added
        /// </summary>
        event EventHandler<DependencyNodeEventArgs> NodeAdded;

        /// <summary>
        /// Event fired when a node is updated
        /// </summary>
        event EventHandler<DependencyNodeEventArgs> NodeUpdated;

        /// <summary>
        /// Event fired when a node is removed
        /// </summary>
        event EventHandler<DependencyNodeEventArgs> NodeRemoved;

        /// <summary>
        /// Event fired when an edge is added
        /// </summary>
        event EventHandler<DependencyEdgeEventArgs> EdgeAdded;

        /// <summary>
        /// Event fired when an edge is updated
        /// </summary>
        event EventHandler<DependencyEdgeEventArgs> EdgeUpdated;

        /// <summary>
        /// Event fired when an edge is removed
        /// </summary>
        event EventHandler<DependencyEdgeEventArgs> EdgeRemoved;

        /// <summary>
        /// Event fired when graph layout is updated
        /// </summary>
        event EventHandler<DependencyGraphEventArgs> LayoutUpdated;

        #endregion
    }

    #region Event Arguments

    /// <summary>
    /// Event arguments for dependency node events
    /// </summary>
    public class DependencyNodeEventArgs : EventArgs
    {
        public string GraphId { get; set; }
        public DependencyNode Node { get; set; }
    }

    /// <summary>
    /// Event arguments for dependency edge events
    /// </summary>
    public class DependencyEdgeEventArgs : EventArgs
    {
        public string GraphId { get; set; }
        public DependencyEdge Edge { get; set; }
    }

    /// <summary>
    /// Event arguments for dependency graph events
    /// </summary>
    public class DependencyGraphEventArgs : EventArgs
    {
        public DependencyGraph Graph { get; set; }
        public GraphLayoutAlgorithm Algorithm { get; set; }
        public GraphLayoutSettings Settings { get; set; }
    }

    #endregion
}