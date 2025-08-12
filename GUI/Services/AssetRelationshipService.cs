using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing comprehensive relationships between assets, users, groups, applications, and policies
    /// Supports migration planning with relationship graph analysis
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
        /// Adds or updates a group policy object in the relationship graph
        /// </summary>
        public void AddOrUpdatePolicy(PolicyData policy)
        {
            if (policy == null) return;

            lock (_lockObject)
            {
                var nodeId = GetNodeId("policy", policy.Id ?? policy.Name);

                if (!_relationshipGraph.TryGetValue(nodeId, out var node))
                {
                    node = new AssetRelationshipNode
                    {
                        Id = nodeId,
                        Type = "policy",
                        Name = policy.Name,
                        Data = policy
                    };
                    _relationshipGraph[nodeId] = node;
                }
                else
                {
                    node.Data = policy;
                    node.Name = policy.Name;
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
        /// Gets policies related to a user
        /// </summary>
        public List<PolicyData> GetPoliciesForUser(string userId) => GetRelatedEntitiesOfType<PolicyData>("user", userId, "policy");

        /// <summary>
        /// Gets policies related to a computer
        /// </summary>
        public List<PolicyData> GetPoliciesForComputer(string computerId) => GetRelatedEntitiesOfType<PolicyData>("asset", computerId, "policy");

        /// <summary>
        /// Gets policies related to a group
        /// </summary>
        public List<PolicyData> GetPoliciesForGroup(string groupId) => GetRelatedEntitiesOfType<PolicyData>("group", groupId, "policy");

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
        /// Analyzes migration waves based on relationship dependencies
        /// </summary>
        public List<MigrationWave> AnalyzeMigrationWaves(List<string> entityIds, string entityType)
        {
            var waves = new List<MigrationWave>();
            var processed = new HashSet<string>();
            var currentWave = 1;

            lock (_lockObject)
            {
                while (processed.Count < entityIds.Count)
                {
                    var waveEntities = new List<string>();
                    
                    foreach (var entityId in entityIds.Where(id => !processed.Contains(id)))
                    {
                        var nodeId = GetNodeId(entityType, entityId);
                        if (_relationshipGraph.TryGetValue(nodeId, out var node))
                        {
                            // Check if all dependencies are already processed
                            var dependencies = GetEntityDependencies(entityId, entityType);
                            var unresolvedDeps = dependencies.Where(dep => !processed.Contains($"{dep.DependentEntityType}:{dep.DependentEntityId}")).ToList();
                            
                            if (unresolvedDeps.Count == 0)
                            {
                                waveEntities.Add(entityId);
                                processed.Add($"{entityType}:{entityId}");
                            }
                        }
                        else
                        {
                            // No dependencies found, can be migrated in first wave
                            waveEntities.Add(entityId);
                            processed.Add($"{entityType}:{entityId}");
                        }
                    }
                    
                    if (waveEntities.Any())
                    {
                        waves.Add(new MigrationWave
                        {
                            WaveNumber = currentWave++,
                            EntityIds = waveEntities,
                            EntityType = entityType,
                            EstimatedDuration = TimeSpan.FromHours(waveEntities.Count * 0.5) // Rough estimate
                        });
                    }
                    else
                    {
                        // Break infinite loop - add remaining entities to final wave
                        var remainingIds = entityIds.Where(id => !processed.Contains($"{entityType}:{id}")).ToList();
                        if (remainingIds.Any())
                        {
                            waves.Add(new MigrationWave
                            {
                                WaveNumber = currentWave,
                                EntityIds = remainingIds,
                                EntityType = entityType,
                                EstimatedDuration = TimeSpan.FromHours(remainingIds.Count * 0.5),
                                HasCircularDependencies = true
                            });
                        }
                        break;
                    }
                }
            }

            return waves;
        }

        /// <summary>
        /// Gets migration dependencies for a specific entity
        /// </summary>
        public List<MigrationDependency> GetEntityDependencies(string entityId, string entityType)
        {
            var dependencies = new List<MigrationDependency>();
            var nodeId = GetNodeId(entityType, entityId);

            lock (_lockObject)
            {
                if (_relationshipGraph.TryGetValue(nodeId, out var entityNode))
                {
                    foreach (var relationship in entityNode.Relationships)
                    {
                        if (_relationshipGraph.TryGetValue(relationship.ToNodeId, out var relatedNode))
                        {
                            var severity = DetermineDependencySeverity(relationship.RelationshipType);
                            dependencies.Add(new MigrationDependency
                            {
                                DependentEntityId = ExtractIdFromNodeId(relatedNode.Id),
                                DependentEntityType = ExtractTypeFromNodeId(relatedNode.Id),
                                DependentEntityName = relatedNode.Name,
                                DependencyType = relationship.RelationshipType,
                                Severity = severity
                            });
                        }
                    }
                }
            }

            return dependencies;
        }

        /// <summary>
        /// Builds comprehensive relationship graph from all loaded data
        /// </summary>
        public async Task BuildComprehensiveRelationshipGraph(string profileName, CsvDataService csvDataService)
        {
            try
            {
                // Load all entities
                var users = await csvDataService.LoadUsersAsync(profileName);
                var groups = await csvDataService.LoadGroupsAsync(profileName);
                var infrastructure = await csvDataService.LoadInfrastructureAsync(profileName);
                var applications = await csvDataService.LoadApplicationsAsync(profileName);

                lock (_lockObject)
                {
                    _relationshipGraph.Clear();

                    // Add all entities to the graph
                    foreach (var user in users)
                    {
                        AddOrUpdateUser(user);
                    }

                    foreach (var group in groups)
                    {
                        AddOrUpdateGroup(group);
                    }

                    foreach (var asset in infrastructure)
                    {
                        AddOrUpdateAsset(asset);
                    }

                    foreach (var app in applications)
                    {
                        AddOrUpdateApplication(app);
                    }

                    // Create relationships between entities
                    CreateUserGroupRelationships(users, groups);
                    CreateUserAssetRelationships(users, infrastructure);
                    CreateGroupAssetRelationships(groups, infrastructure);
                    CreateApplicationRelationships(applications, users, groups, infrastructure);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error building relationship graph: {ex.Message}");
            }
        }

        /// <summary>
        /// Creates relationships between users and groups
        /// </summary>
        private void CreateUserGroupRelationships(IEnumerable<UserData> users, IEnumerable<GroupData> groups)
        {
            foreach (var group in groups)
            {
                if (group.UserIds != null && group.UserIds.Any())
                {
                    foreach (var userId in group.UserIds)
                    {
                        var user = users.FirstOrDefault(u => 
                            u.Id == userId || 
                            u.UserPrincipalName == userId || 
                            u.SamAccountName == userId);
                        
                        if (user != null)
                        {
                            CreateRelationship("user", user.Id, "group", group.Id, "member_of");
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Creates relationships between users and assets
        /// </summary>
        private void CreateUserAssetRelationships(IEnumerable<UserData> users, IEnumerable<InfrastructureData> assets)
        {
            // This would be based on actual CSV data structure
            // For now, create basic relationships where user names match asset names
            foreach (var user in users)
            {
                foreach (var asset in assets)
                {
                    if (!string.IsNullOrEmpty(user.SamAccountName) && 
                        !string.IsNullOrEmpty(asset.Name) &&
                        asset.Name.Contains(user.SamAccountName, StringComparison.OrdinalIgnoreCase))
                    {
                        CreateRelationship("user", user.Id, "asset", asset.Id, "uses");
                    }
                }
            }
        }

        /// <summary>
        /// Creates relationships between groups and assets
        /// </summary>
        private void CreateGroupAssetRelationships(IEnumerable<GroupData> groups, IEnumerable<InfrastructureData> assets)
        {
            // This would be based on actual CSV data structure
            // For now, create basic relationships where group names match asset descriptions
            foreach (var group in groups)
            {
                foreach (var asset in assets)
                {
                    if (!string.IsNullOrEmpty(group.DisplayName) && 
                        !string.IsNullOrEmpty(asset.Description) &&
                        asset.Description.Contains(group.DisplayName, StringComparison.OrdinalIgnoreCase))
                    {
                        CreateRelationship("group", group.Id, "asset", asset.Id, "manages");
                    }
                }
            }
        }

        /// <summary>
        /// Creates relationships for applications
        /// </summary>
        private void CreateApplicationRelationships(IEnumerable<ApplicationData> applications, IEnumerable<UserData> users, IEnumerable<GroupData> groups, IEnumerable<InfrastructureData> assets)
        {
            foreach (var app in applications)
            {
                // Link applications to users
                if (app.UserIds != null && app.UserIds.Any())
                {
                    foreach (var userId in app.UserIds)
                    {
                        var user = users.FirstOrDefault(u => u.Id == userId || u.UserPrincipalName == userId);
                        if (user != null)
                        {
                            CreateRelationship("application", app.Id, "user", user.Id, "assigned_to");
                        }
                    }
                }

                // Link applications to groups based on naming patterns
                // This is a simplified approach - in reality you'd use proper CSV relationships
                foreach (var group in groups)
                {
                    if (!string.IsNullOrEmpty(app.Name) && !string.IsNullOrEmpty(group.DisplayName) &&
                        (app.Name.Contains(group.DisplayName, StringComparison.OrdinalIgnoreCase) ||
                         group.DisplayName.Contains(app.Name, StringComparison.OrdinalIgnoreCase)))
                    {
                        CreateRelationship("application", app.Id, "group", group.Id, "assigned_to");
                    }
                }

                // Link applications to assets where they're installed
                foreach (var asset in assets)
                {
                    if (!string.IsNullOrEmpty(app.InstallLocation) && 
                        !string.IsNullOrEmpty(asset.Name) &&
                        app.InstallLocation.Contains(asset.Name, StringComparison.OrdinalIgnoreCase))
                    {
                        CreateRelationship("application", app.Id, "asset", asset.Id, "installed_on");
                    }
                }
            }
        }

        /// <summary>
        /// Gets migration impact analysis for an entity
        /// </summary>
        public MigrationImpactAnalysis GetMigrationImpact(string entityId, string entityType)
        {
            var analysis = new MigrationImpactAnalysis
            {
                EntityId = entityId,
                EntityType = entityType,
                ImpactedEntities = new List<MigrationDependency>()
            };

            var relatedEntities = GetRelatedEntities(entityType, entityId);
            
            foreach (var related in relatedEntities)
            {
                var dependency = new MigrationDependency
                {
                    DependentEntityId = ExtractIdFromNodeId(related.Id),
                    DependentEntityType = ExtractTypeFromNodeId(related.Id),
                    DependentEntityName = related.Name,
                    DependencyType = "Related Entity",
                    Severity = "Medium"
                };
                
                analysis.ImpactedEntities.Add(dependency);
            }

            analysis.TotalImpactedEntities = analysis.ImpactedEntities.Count;
            analysis.RiskLevel = analysis.TotalImpactedEntities > 10 ? "High" : 
                                analysis.TotalImpactedEntities > 5 ? "Medium" : "Low";

            return analysis;
        }

        /// <summary>
        /// Determines dependency severity based on relationship type
        /// </summary>
        private string DetermineDependencySeverity(string relationshipType)
        {
            return relationshipType switch
            {
                "owns" or "owned_by" => "Critical",
                "member_of" or "has_member" => "High",
                "uses" or "used_by" => "Medium",
                "manages" or "managed_by" => "High",
                "assigned_to" => "Medium",
                "installed_on" => "Low",
                _ => "Low"
            };
        }

        /// <summary>
        /// Extracts entity type from node ID
        /// </summary>
        private string ExtractTypeFromNodeId(string nodeId)
        {
            var colonIndex = nodeId.IndexOf(':');
            return colonIndex > 0 ? nodeId.Substring(0, colonIndex) : "unknown";
        }

        /// <summary>
        /// Extracts entity ID from node ID
        /// </summary>
        private string ExtractIdFromNodeId(string nodeId)
        {
            var colonIndex = nodeId.IndexOf(':');
            return colonIndex > 0 && colonIndex < nodeId.Length - 1 ? nodeId.Substring(colonIndex + 1) : nodeId;
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

    /// <summary>
    /// Represents a migration wave for phased migration planning
    /// </summary>
    public class MigrationWave
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string Description { get; set; }
        public int WaveNumber { get; set; }
        public List<string> EntityIds { get; set; } = new List<string>();
        public string EntityType { get; set; }
        public TimeSpan EstimatedDuration { get; set; }
        public bool HasCircularDependencies { get; set; }
        public string Notes { get; set; }
        public string Status { get; set; } = "Planned";
        public string Priority { get; set; } = "Medium";
        public string AssignedTo { get; set; }
        public List<MigrationTask> Tasks { get; set; } = new List<MigrationTask>();
        public DateTime PlannedStartDate { get; set; } = DateTime.Now;
        public DateTime PlannedEndDate { get; set; } = DateTime.Now.AddDays(7);
        public List<string> Dependencies { get; set; } = new List<string>();
    }

    /// <summary>
    /// Represents a migration task within a wave
    /// </summary>
    public class MigrationTask
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; }
        public string Description { get; set; }
        public string Status { get; set; } = "Planned";
        public string Priority { get; set; } = "Medium";
        public string AssignedTo { get; set; }
        public DateTime PlannedStartDate { get; set; } = DateTime.Now;
        public DateTime PlannedEndDate { get; set; } = DateTime.Now.AddDays(1);
        public DateTime? ActualStartDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
        public string Notes { get; set; }
        public List<string> Dependencies { get; set; } = new List<string>();
        public int ProgressPercent { get; set; } = 0;
        public string WaveId { get; set; }
        public int CompletionPercentage { get; set; } = 0;
        public double EstimatedHours { get; set; } = 8.0;
        public double ActualHours { get; set; } = 0.0;

        public bool IsOverdue()
        {
            return DateTime.Now > PlannedEndDate && Status != "Completed";
        }
    }

    /// <summary>
    /// Represents migration impact analysis results
    /// </summary>
    public class MigrationImpactAnalysis
    {
        public string EntityId { get; set; }
        public string EntityType { get; set; }
        public List<MigrationDependency> ImpactedEntities { get; set; } = new List<MigrationDependency>();
        public int TotalImpactedEntities { get; set; }
        public string RiskLevel { get; set; }
        public string Notes { get; set; }
    }

    /// <summary>
    /// Extension methods for MigrationWave
    /// </summary>
    public static class MigrationWaveExtensions
    {
        public static int GetCompletionPercentage(this MigrationWave wave)
        {
            if (wave.Tasks == null || !wave.Tasks.Any())
                return 0;

            var totalTasks = wave.Tasks.Count;
            var completedTasks = wave.Tasks.Count(t => t.Status == "Completed");
            
            return (int)Math.Round((double)completedTasks / totalTasks * 100);
        }
    }
}