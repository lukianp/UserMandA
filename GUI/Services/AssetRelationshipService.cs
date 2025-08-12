using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing relationships between assets, users, groups, and applications
    /// </summary>
    public class AssetRelationshipService
    {
        private readonly Dictionary<string, AssetRelationshipNode> _relationshipGraph;
        private readonly object _lockObject = new object();
        private static AssetRelationshipService _instance;

        public static AssetRelationshipService Instance => _instance ??= new AssetRelationshipService();

        private AssetRelationshipService()
        {
            _relationshipGraph = new Dictionary<string, AssetRelationshipNode>();
        }

        /// <summary>
        /// Adds or updates an infrastructure asset in the relationship graph
        /// </summary>
        public void AddOrUpdateAsset(InfrastructureData asset)
        {
            if (asset == null) return;

            lock (_lockObject)
            {
                var nodeId = GetNodeId("asset", asset.Id ?? asset.Name);
                
                if (!_relationshipGraph.TryGetValue(nodeId, out var node))
                {
                    node = new AssetRelationshipNode
                    {
                        Id = nodeId,
                        Type = "asset",
                        Name = asset.Name,
                        Data = asset
                    };
                    _relationshipGraph[nodeId] = node;
                }
                else
                {
                    node.Data = asset;
                    node.Name = asset.Name;
                }
            }
        }

        /// <summary>
        /// Adds or updates a user in the relationship graph
        /// </summary>
        public void AddOrUpdateUser(UserData user)
        {
            if (user == null) return;

            lock (_lockObject)
            {
                var nodeId = GetNodeId("user", user.Id ?? user.UserPrincipalName);
                
                if (!_relationshipGraph.TryGetValue(nodeId, out var node))
                {
                    node = new AssetRelationshipNode
                    {
                        Id = nodeId,
                        Type = "user",
                        Name = user.DisplayName ?? user.UserPrincipalName,
                        Data = user
                    };
                    _relationshipGraph[nodeId] = node;
                }
                else
                {
                    node.Data = user;
                    node.Name = user.DisplayName ?? user.UserPrincipalName;
                }
            }
        }

        /// <summary>
        /// Adds or updates a group in the relationship graph
        /// </summary>
        public void AddOrUpdateGroup(GroupData group)
        {
            if (group == null) return;

            lock (_lockObject)
            {
                var nodeId = GetNodeId("group", group.Id ?? group.Name);
                
                if (!_relationshipGraph.TryGetValue(nodeId, out var node))
                {
                    node = new AssetRelationshipNode
                    {
                        Id = nodeId,
                        Type = "group",
                        Name = group.Name,
                        Data = group
                    };
                    _relationshipGraph[nodeId] = node;
                }
                else
                {
                    node.Data = group;
                    node.Name = group.Name;
                }
            }
        }

        /// <summary>
        /// Adds or updates an application in the relationship graph
        /// </summary>
        public void AddOrUpdateApplication(ApplicationData application)
        {
            if (application == null) return;

            lock (_lockObject)
            {
                var nodeId = GetNodeId("application", application.Id ?? application.Name);
                
                if (!_relationshipGraph.TryGetValue(nodeId, out var node))
                {
                    node = new AssetRelationshipNode
                    {
                        Id = nodeId,
                        Type = "application",
                        Name = application.Name,
                        Data = application
                    };
                    _relationshipGraph[nodeId] = node;
                }
                else
                {
                    node.Data = application;
                    node.Name = application.Name;
                }
            }
        }

        /// <summary>
        /// Creates a relationship between two entities
        /// </summary>
        public void CreateRelationship(string fromType, string fromId, string toType, string toId, string relationshipType)
        {
            if (string.IsNullOrEmpty(fromId) || string.IsNullOrEmpty(toId)) return;

            lock (_lockObject)
            {
                var fromNodeId = GetNodeId(fromType, fromId);
                var toNodeId = GetNodeId(toType, toId);

                // Ensure both nodes exist
                if (!_relationshipGraph.ContainsKey(fromNodeId))
                {
                    _relationshipGraph[fromNodeId] = new AssetRelationshipNode
                    {
                        Id = fromNodeId,
                        Type = fromType,
                        Name = fromId
                    };
                }

                if (!_relationshipGraph.ContainsKey(toNodeId))
                {
                    _relationshipGraph[toNodeId] = new AssetRelationshipNode
                    {
                        Id = toNodeId,
                        Type = toType,
                        Name = toId
                    };
                }

                var fromNode = _relationshipGraph[fromNodeId];
                var toNode = _relationshipGraph[toNodeId];

                // Create the relationship
                var relationship = new AssetRelationship
                {
                    FromNodeId = fromNodeId,
                    ToNodeId = toNodeId,
                    RelationshipType = relationshipType,
                    CreatedDate = DateTime.Now
                };

                // Add to relationships list if not already present
                if (!fromNode.Relationships.Any(r => r.ToNodeId == toNodeId && r.RelationshipType == relationshipType))
                {
                    fromNode.Relationships.Add(relationship);
                }

                // Add reverse relationship for bidirectional navigation
                var reverseRelationship = new AssetRelationship
                {
                    FromNodeId = toNodeId,
                    ToNodeId = fromNodeId,
                    RelationshipType = GetReverseRelationshipType(relationshipType),
                    CreatedDate = DateTime.Now
                };

                if (!toNode.Relationships.Any(r => r.ToNodeId == fromNodeId && r.RelationshipType == reverseRelationship.RelationshipType))
                {
                    toNode.Relationships.Add(reverseRelationship);
                }
            }
        }

        /// <summary>
        /// Gets all related entities for a given entity
        /// </summary>
        public List<AssetRelationshipNode> GetRelatedEntities(string entityType, string entityId)
        {
            var nodeId = GetNodeId(entityType, entityId);
            var relatedNodes = new List<AssetRelationshipNode>();

            lock (_lockObject)
            {
                if (_relationshipGraph.TryGetValue(nodeId, out var node))
                {
                    foreach (var relationship in node.Relationships)
                    {
                        if (_relationshipGraph.TryGetValue(relationship.ToNodeId, out var relatedNode))
                        {
                            relatedNodes.Add(relatedNode);
                        }
                    }
                }
            }

            return relatedNodes;
        }

        /// <summary>
        /// Gets related entities of a specific type
        /// </summary>
        public List<T> GetRelatedEntitiesOfType<T>(string entityType, string entityId, string targetType) where T : class
        {
            var relatedEntities = new List<T>();
            var relatedNodes = GetRelatedEntities(entityType, entityId);

            foreach (var node in relatedNodes.Where(n => n.Type == targetType))
            {
                if (node.Data is T typedData)
                {
                    relatedEntities.Add(typedData);
                }
            }

            return relatedEntities;
        }

        /// <summary>
        /// Finds all paths between two entities
        /// </summary>
        public List<List<AssetRelationshipNode>> FindPaths(string fromType, string fromId, string toType, string toId, int maxDepth = 5)
        {
            var fromNodeId = GetNodeId(fromType, fromId);
            var toNodeId = GetNodeId(toType, toId);
            var paths = new List<List<AssetRelationshipNode>>();
            var visited = new HashSet<string>();
            var currentPath = new List<AssetRelationshipNode>();

            lock (_lockObject)
            {
                if (_relationshipGraph.TryGetValue(fromNodeId, out var startNode))
                {
                    FindPathsRecursive(startNode, toNodeId, visited, currentPath, paths, maxDepth);
                }
            }

            return paths;
        }

        private void FindPathsRecursive(AssetRelationshipNode currentNode, string targetNodeId, 
            HashSet<string> visited, List<AssetRelationshipNode> currentPath, 
            List<List<AssetRelationshipNode>> allPaths, int remainingDepth)
        {
            if (remainingDepth <= 0) return;

            visited.Add(currentNode.Id);
            currentPath.Add(currentNode);

            if (currentNode.Id == targetNodeId)
            {
                allPaths.Add(new List<AssetRelationshipNode>(currentPath));
            }
            else
            {
                foreach (var relationship in currentNode.Relationships)
                {
                    if (!visited.Contains(relationship.ToNodeId) && 
                        _relationshipGraph.TryGetValue(relationship.ToNodeId, out var nextNode))
                    {
                        FindPathsRecursive(nextNode, targetNodeId, visited, currentPath, allPaths, remainingDepth - 1);
                    }
                }
            }

            currentPath.RemoveAt(currentPath.Count - 1);
            visited.Remove(currentNode.Id);
        }

        /// <summary>
        /// Gets migration dependencies for an asset
        /// </summary>
        public List<MigrationDependency> GetMigrationDependencies(string assetId)
        {
            var dependencies = new List<MigrationDependency>();
            var nodeId = GetNodeId("asset", assetId);

            lock (_lockObject)
            {
                if (_relationshipGraph.TryGetValue(nodeId, out var assetNode))
                {
                    // Find dependent users
                    var userDependencies = assetNode.Relationships
                        .Where(r => r.RelationshipType == "used_by" || r.RelationshipType == "owned_by")
                        .Select(r => _relationshipGraph.TryGetValue(r.ToNodeId, out var node) ? node : null)
                        .Where(n => n != null && n.Type == "user")
                        .Select(n => new MigrationDependency
                        {
                            DependentEntityId = n.Id,
                            DependentEntityType = "user",
                            DependentEntityName = n.Name,
                            DependencyType = "User Dependency",
                            Severity = "High"
                        });

                    dependencies.AddRange(userDependencies);

                    // Find dependent applications
                    var appDependencies = assetNode.Relationships
                        .Where(r => r.RelationshipType == "hosts" || r.RelationshipType == "runs")
                        .Select(r => _relationshipGraph.TryGetValue(r.ToNodeId, out var node) ? node : null)
                        .Where(n => n != null && n.Type == "application")
                        .Select(n => new MigrationDependency
                        {
                            DependentEntityId = n.Id,
                            DependentEntityType = "application",
                            DependentEntityName = n.Name,
                            DependencyType = "Application Dependency",
                            Severity = "Medium"
                        });

                    dependencies.AddRange(appDependencies);

                    // Find child asset dependencies
                    var childDependencies = assetNode.Relationships
                        .Where(r => r.RelationshipType == "parent_of")
                        .Select(r => _relationshipGraph.TryGetValue(r.ToNodeId, out var node) ? node : null)
                        .Where(n => n != null && n.Type == "asset")
                        .Select(n => new MigrationDependency
                        {
                            DependentEntityId = n.Id,
                            DependentEntityType = "asset",
                            DependentEntityName = n.Name,
                            DependencyType = "Child Asset",
                            Severity = "Critical"
                        });

                    dependencies.AddRange(childDependencies);
                }
            }

            return dependencies;
        }

        /// <summary>
        /// Clears all relationships for testing or reset
        /// </summary>
        public void ClearAllRelationships()
        {
            lock (_lockObject)
            {
                _relationshipGraph.Clear();
            }
        }

        private string GetNodeId(string type, string id)
        {
            return $"{type}:{id}";
        }

        private string GetReverseRelationshipType(string relationshipType)
        {
            return relationshipType switch
            {
                "owns" => "owned_by",
                "owned_by" => "owns",
                "uses" => "used_by",
                "used_by" => "uses",
                "member_of" => "has_member",
                "has_member" => "member_of",
                "hosts" => "hosted_on",
                "hosted_on" => "hosts",
                "parent_of" => "child_of",
                "child_of" => "parent_of",
                "manages" => "managed_by",
                "managed_by" => "manages",
                _ => $"reverse_{relationshipType}"
            };
        }
    }

    /// <summary>
    /// Represents a node in the relationship graph
    /// </summary>
    public class AssetRelationshipNode
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public string Name { get; set; }
        public object Data { get; set; }
        public List<AssetRelationship> Relationships { get; set; } = new List<AssetRelationship>();
    }

    /// <summary>
    /// Represents a relationship between two nodes
    /// </summary>
    public class AssetRelationship
    {
        public string FromNodeId { get; set; }
        public string ToNodeId { get; set; }
        public string RelationshipType { get; set; }
        public DateTime CreatedDate { get; set; }
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// Represents a migration dependency
    /// </summary>
    public class MigrationDependency
    {
        public string DependentEntityId { get; set; }
        public string DependentEntityType { get; set; }
        public string DependentEntityName { get; set; }
        public string DependencyType { get; set; }
        public string Severity { get; set; }
        public string Notes { get; set; }
    }
}