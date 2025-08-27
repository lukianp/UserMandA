using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Windows;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Node in the dependency graph
    /// </summary>
    public class DependencyNode : INotifyPropertyChanged
    {
        private string _id;
        private string _name;
        private string _type;
        private string _description;
        private Point _position;
        private bool _isSelected;
        private bool _isHighlighted;
        private DependencyNodeStatus _status;
        private string _icon;
        private string _color;
        private double _size = 50;
        private int _dependencyCount;
        private Dictionary<string, object> _properties;

        public event PropertyChangedEventHandler PropertyChanged;

        public DependencyNode()
        {
            Id = Guid.NewGuid().ToString();
            _properties = new Dictionary<string, object>();
            Status = DependencyNodeStatus.Normal;
        }

        /// <summary>
        /// Unique identifier for the node
        /// </summary>
        public string Id
        {
            get => _id;
            set => SetProperty(ref _id, value);
        }

        /// <summary>
        /// Display name of the node
        /// </summary>
        public string Name
        {
            get => _name;
            set => SetProperty(ref _name, value);
        }

        /// <summary>
        /// Type of the node (User, Group, Server, Application, etc.)
        /// </summary>
        public string Type
        {
            get => _type;
            set => SetProperty(ref _type, value);
        }

        /// <summary>
        /// Description of the node
        /// </summary>
        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        /// <summary>
        /// Position of the node in the graph
        /// </summary>
        public Point Position
        {
            get => _position;
            set => SetProperty(ref _position, value);
        }

        /// <summary>
        /// Whether the node is currently selected
        /// </summary>
        public bool IsSelected
        {
            get => _isSelected;
            set => SetProperty(ref _isSelected, value);
        }

        /// <summary>
        /// Whether the node is highlighted (e.g., in search results)
        /// </summary>
        public bool IsHighlighted
        {
            get => _isHighlighted;
            set => SetProperty(ref _isHighlighted, value);
        }

        /// <summary>
        /// Status of the node
        /// </summary>
        public DependencyNodeStatus Status
        {
            get => _status;
            set => SetProperty(ref _status, value);
        }

        /// <summary>
        /// Icon for the node
        /// </summary>
        public string Icon
        {
            get => _icon;
            set => SetProperty(ref _icon, value);
        }

        /// <summary>
        /// Color of the node
        /// </summary>
        public string Color
        {
            get => _color;
            set => SetProperty(ref _color, value);
        }

        /// <summary>
        /// Size of the node
        /// </summary>
        public double Size
        {
            get => _size;
            set => SetProperty(ref _size, value);
        }

        /// <summary>
        /// Number of dependencies this node has
        /// </summary>
        public int DependencyCount
        {
            get => _dependencyCount;
            set => SetProperty(ref _dependencyCount, value);
        }

        /// <summary>
        /// Additional properties for the node
        /// </summary>
        public Dictionary<string, object> Properties
        {
            get => _properties;
            set => SetProperty(ref _properties, value);
        }

        protected virtual bool SetProperty<T>(ref T field, T value, [System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            if (Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Edge/Connection between nodes in the dependency graph
    /// </summary>
    public class DependencyEdge : INotifyPropertyChanged
    {
        private string _id;
        private string _sourceNodeId;
        private string _targetNodeId;
        private string _label;
        private DependencyEdgeType _edgeType;
        private double _weight = 1.0;
        private bool _isDirectional = true;
        private string _color;
        private double _thickness = 2.0;
        private bool _isHighlighted;
        private Dictionary<string, object> _properties;

        public event PropertyChangedEventHandler PropertyChanged;

        public DependencyEdge()
        {
            Id = Guid.NewGuid().ToString();
            _properties = new Dictionary<string, object>();
        }

        /// <summary>
        /// Unique identifier for the edge
        /// </summary>
        public string Id
        {
            get => _id;
            set => SetProperty(ref _id, value);
        }

        /// <summary>
        /// ID of the source node
        /// </summary>
        public string SourceNodeId
        {
            get => _sourceNodeId;
            set => SetProperty(ref _sourceNodeId, value);
        }

        /// <summary>
        /// ID of the target node
        /// </summary>
        public string TargetNodeId
        {
            get => _targetNodeId;
            set => SetProperty(ref _targetNodeId, value);
        }

        /// <summary>
        /// Label for the edge
        /// </summary>
        public string Label
        {
            get => _label;
            set => SetProperty(ref _label, value);
        }

        /// <summary>
        /// Type of dependency relationship
        /// </summary>
        public DependencyEdgeType EdgeType
        {
            get => _edgeType;
            set => SetProperty(ref _edgeType, value);
        }

        /// <summary>
        /// Weight/strength of the dependency (1.0 = normal)
        /// </summary>
        public double Weight
        {
            get => _weight;
            set => SetProperty(ref _weight, value);
        }

        /// <summary>
        /// Whether the edge is directional
        /// </summary>
        public bool IsDirectional
        {
            get => _isDirectional;
            set => SetProperty(ref _isDirectional, value);
        }

        /// <summary>
        /// Color of the edge
        /// </summary>
        public string Color
        {
            get => _color;
            set => SetProperty(ref _color, value);
        }

        /// <summary>
        /// Thickness of the edge
        /// </summary>
        public double Thickness
        {
            get => _thickness;
            set => SetProperty(ref _thickness, value);
        }

        /// <summary>
        /// Whether the edge is highlighted
        /// </summary>
        public bool IsHighlighted
        {
            get => _isHighlighted;
            set => SetProperty(ref _isHighlighted, value);
        }

        /// <summary>
        /// Additional properties for the edge
        /// </summary>
        public Dictionary<string, object> Properties
        {
            get => _properties;
            set => SetProperty(ref _properties, value);
        }

        protected virtual bool SetProperty<T>(ref T field, T value, [System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            if (Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Complete dependency graph containing nodes and edges
    /// </summary>
    public class DependencyGraph : INotifyPropertyChanged
    {
        private string _id;
        private string _name;
        private string _description;
        private List<DependencyNode> _nodes;
        private List<DependencyEdge> _edges;
        private DateTime _created;
        private DateTime _lastModified;
        private Dictionary<string, object> _metadata;

        public event PropertyChangedEventHandler PropertyChanged;

        public DependencyGraph()
        {
            Id = Guid.NewGuid().ToString();
            _nodes = new List<DependencyNode>();
            _edges = new List<DependencyEdge>();
            _created = DateTime.Now;
            _lastModified = DateTime.Now;
            _metadata = new Dictionary<string, object>();
        }

        /// <summary>
        /// Unique identifier for the graph
        /// </summary>
        public string Id
        {
            get => _id;
            set => SetProperty(ref _id, value);
        }

        /// <summary>
        /// Name of the graph
        /// </summary>
        public string Name
        {
            get => _name;
            set => SetProperty(ref _name, value);
        }

        /// <summary>
        /// Description of the graph
        /// </summary>
        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        /// <summary>
        /// All nodes in the graph
        /// </summary>
        public List<DependencyNode> Nodes
        {
            get => _nodes;
            set => SetProperty(ref _nodes, value);
        }

        /// <summary>
        /// All edges in the graph
        /// </summary>
        public List<DependencyEdge> Edges
        {
            get => _edges;
            set => SetProperty(ref _edges, value);
        }

        /// <summary>
        /// When the graph was created
        /// </summary>
        public DateTime Created
        {
            get => _created;
            set => SetProperty(ref _created, value);
        }

        /// <summary>
        /// When the graph was last modified
        /// </summary>
        public DateTime LastModified
        {
            get => _lastModified;
            set => SetProperty(ref _lastModified, value);
        }

        /// <summary>
        /// Metadata about the graph
        /// </summary>
        public Dictionary<string, object> Metadata
        {
            get => _metadata;
            set => SetProperty(ref _metadata, value);
        }

        protected virtual bool SetProperty<T>(ref T field, T value, [System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            if (Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Layout algorithm for positioning nodes
    /// </summary>
    public class GraphLayoutSettings : INotifyPropertyChanged
    {
        private GraphLayoutAlgorithm _algorithm = GraphLayoutAlgorithm.ForceDirected;
        private double _nodeSpacing = 100;
        private double _edgeLength = 150;
        private double _repulsionStrength = 1000;
        private double _attractionStrength = 10;
        private int _maxIterations = 100;
        private double _damping = 0.9;
        private bool _preventOverlap = true;

        public event PropertyChangedEventHandler PropertyChanged;

        /// <summary>
        /// Layout algorithm to use
        /// </summary>
        public GraphLayoutAlgorithm Algorithm
        {
            get => _algorithm;
            set => SetProperty(ref _algorithm, value);
        }

        /// <summary>
        /// Minimum spacing between nodes
        /// </summary>
        public double NodeSpacing
        {
            get => _nodeSpacing;
            set => SetProperty(ref _nodeSpacing, value);
        }

        /// <summary>
        /// Desired edge length
        /// </summary>
        public double EdgeLength
        {
            get => _edgeLength;
            set => SetProperty(ref _edgeLength, value);
        }

        /// <summary>
        /// Strength of repulsion between nodes
        /// </summary>
        public double RepulsionStrength
        {
            get => _repulsionStrength;
            set => SetProperty(ref _repulsionStrength, value);
        }

        /// <summary>
        /// Strength of attraction along edges
        /// </summary>
        public double AttractionStrength
        {
            get => _attractionStrength;
            set => SetProperty(ref _attractionStrength, value);
        }

        /// <summary>
        /// Maximum iterations for layout algorithm
        /// </summary>
        public int MaxIterations
        {
            get => _maxIterations;
            set => SetProperty(ref _maxIterations, value);
        }

        /// <summary>
        /// Damping factor for animations
        /// </summary>
        public double Damping
        {
            get => _damping;
            set => SetProperty(ref _damping, value);
        }

        /// <summary>
        /// Whether to prevent node overlap
        /// </summary>
        public bool PreventOverlap
        {
            get => _preventOverlap;
            set => SetProperty(ref _preventOverlap, value);
        }

        protected virtual bool SetProperty<T>(ref T field, T value, [System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            if (Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Status of a dependency node
    /// </summary>
    public enum DependencyNodeStatus
    {
        Normal,
        Warning,
        Error,
        Critical,
        Inactive,
        Pending
    }

    /// <summary>
    /// Type of dependency relationship
    /// </summary>
    public enum DependencyEdgeType
    {
        DependsOn,
        Uses,
        Contains,
        ConnectsTo,
        Manages,
        Accesses,
        Communicates,
        Inherits,
        Implements,
        References
    }

    /// <summary>
    /// Layout algorithms for graph visualization
    /// </summary>
    public enum GraphLayoutAlgorithm
    {
        ForceDirected,
        Hierarchical,
        Circular,
        Grid,
        Tree,
        Radial
    }

    /// <summary>
    /// Filter criteria for dependency graph
    /// </summary>
    public class DependencyGraphFilter : INotifyPropertyChanged
    {
        private List<string> _nodeTypes;
        private List<DependencyEdgeType> _edgeTypes;
        private List<DependencyNodeStatus> _nodeStatuses;
        private int _maxDepth = -1;
        private double _minWeight = 0;
        private string _searchText;
        private bool _showOrphans = true;
        private bool _showSelfReferences = false;

        public event PropertyChangedEventHandler PropertyChanged;

        public DependencyGraphFilter()
        {
            _nodeTypes = new List<string>();
            _edgeTypes = new List<DependencyEdgeType>();
            _nodeStatuses = new List<DependencyNodeStatus>();
        }

        /// <summary>
        /// Filter by node types
        /// </summary>
        public List<string> NodeTypes
        {
            get => _nodeTypes;
            set => SetProperty(ref _nodeTypes, value);
        }

        /// <summary>
        /// Filter by edge types
        /// </summary>
        public List<DependencyEdgeType> EdgeTypes
        {
            get => _edgeTypes;
            set => SetProperty(ref _edgeTypes, value);
        }

        /// <summary>
        /// Filter by node statuses
        /// </summary>
        public List<DependencyNodeStatus> NodeStatuses
        {
            get => _nodeStatuses;
            set => SetProperty(ref _nodeStatuses, value);
        }

        /// <summary>
        /// Maximum depth from selected node (-1 = unlimited)
        /// </summary>
        public int MaxDepth
        {
            get => _maxDepth;
            set => SetProperty(ref _maxDepth, value);
        }

        /// <summary>
        /// Minimum edge weight to display
        /// </summary>
        public double MinWeight
        {
            get => _minWeight;
            set => SetProperty(ref _minWeight, value);
        }

        /// <summary>
        /// Search text for node names/descriptions
        /// </summary>
        public string SearchText
        {
            get => _searchText;
            set => SetProperty(ref _searchText, value);
        }

        /// <summary>
        /// Whether to show nodes with no connections
        /// </summary>
        public bool ShowOrphans
        {
            get => _showOrphans;
            set => SetProperty(ref _showOrphans, value);
        }

        /// <summary>
        /// Whether to show self-referencing connections
        /// </summary>
        public bool ShowSelfReferences
        {
            get => _showSelfReferences;
            set => SetProperty(ref _showSelfReferences, value);
        }

        protected virtual bool SetProperty<T>(ref T field, T value, [System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            if (Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            return true;
        }

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}