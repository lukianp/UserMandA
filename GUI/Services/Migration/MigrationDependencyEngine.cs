using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// Migration dependency engine for analyzing and ordering migrations based on dependencies
    /// </summary>
    public class MigrationDependencyEngine
    {
        private readonly ILogger<MigrationDependencyEngine> _logger;
        private readonly ILogicEngineService _logicEngineService;

        public MigrationDependencyEngine(
            ILogger<MigrationDependencyEngine> logger,
            ILogicEngineService logicEngineService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _logicEngineService = logicEngineService ?? throw new ArgumentNullException(nameof(logicEngineService));
        }

        /// <summary>
        /// Build dependency graph for migration items using LogicEngineService projections
        /// </summary>
        public async Task<DependencyGraph> BuildDependencyGraphAsync(
            List<MigrationItem> items, 
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var graph = new DependencyGraph();
            
            _logger.LogInformation($"Building dependency graph for {items.Count} migration items");

            try
            {
                // Group items by type for efficient processing
                var itemsByType = items.GroupBy(i => i.Type).ToDictionary(g => g.Key, g => g.ToList());

                // Process different types of dependencies
                await ProcessUserDependencies(itemsByType, graph, context, cancellationToken);
                await ProcessGroupDependencies(itemsByType, graph, context, cancellationToken);
                await ProcessFileDependencies(itemsByType, graph, context, cancellationToken);
                await ProcessMailboxDependencies(itemsByType, graph, context, cancellationToken);
                await ProcessDatabaseDependencies(itemsByType, graph, context, cancellationToken);

                // Calculate processing order using topological sort
                var topologicalOrder = PerformTopologicalSort(graph.Dependencies);
                graph.ProcessingOrder = topologicalOrder.OrderBy(x => x.Value).Select(x => x.Key).ToList();

                // Detect circular dependencies
                graph.CircularDependencies = DetectCircularDependencies(graph.Dependencies);

                _logger.LogInformation($"Dependency graph built with {graph.Dependencies.Count} nodes and {graph.CircularDependencies.Count} circular dependencies");

                return graph;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to build dependency graph");
                throw;
            }
        }

        /// <summary>
        /// Order migration items into execution stages based on dependencies
        /// </summary>
        public async Task<List<MigrationStage>> OrderMigrationStagesAsync(
            DependencyGraph graph, 
            MigrationWave wave,
            CancellationToken cancellationToken = default)
        {
            var stages = new List<MigrationStage>();
            
            _logger.LogInformation("Ordering migration items into execution stages");

            try
            {
                // Get execution order from dependency graph
                var executionOrder = graph.GetExecutionOrder();
                var allItems = wave.Batches.SelectMany(b => b.Items).ToDictionary(i => i.Id, i => i);

                // Group items into stages based on dependency levels
                var stageGroups = new Dictionary<int, List<string>>();
                
                foreach (var itemId in executionOrder)
                {
                    if (allItems.ContainsKey(itemId))
                    {
                        var dependencyLevel = CalculateDependencyLevel(itemId, graph.Dependencies);
                        
                        if (!stageGroups.ContainsKey(dependencyLevel))
                        {
                            stageGroups[dependencyLevel] = new List<string>();
                        }
                        
                        stageGroups[dependencyLevel].Add(itemId);
                    }
                }

                // Create migration stages
                foreach (var stageGroup in stageGroups.OrderBy(kvp => kvp.Key))
                {
                    var stage = new MigrationStage
                    {
                        StageOrder = stageGroup.Key,
                        Items = stageGroup.Value.Select(id => allItems[id]).ToList(),
                        AllowParallelExecution = CanExecuteInParallel(stageGroup.Value, graph.Dependencies),
                        Dependencies = GetStageDependencies(stageGroup.Value, graph.Dependencies),
                        EstimatedDuration = await EstimateStageDuration(stageGroup.Value.Select(id => allItems[id]).ToList(), cancellationToken)
                    };

                    stages.Add(stage);
                }

                _logger.LogInformation($"Created {stages.Count} migration stages");

                return stages;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to order migration stages");
                throw;
            }
        }

        /// <summary>
        /// Validate dependencies and check for migration readiness
        /// </summary>
        public async Task<ValidationResult> ValidateDependenciesAsync(
            DependencyGraph graph, 
            MigrationContext context,
            CancellationToken cancellationToken = default)
        {
            var result = new ValidationResult
            {
                ValidationType = "DependencyValidation",
                StartTime = DateTime.Now,
                SessionId = context.SessionId
            };

            try
            {
                _logger.LogInformation("Validating migration dependencies");

                // Check for circular dependencies
                if (graph.CircularDependencies.Any())
                {
                    result.Errors.Add($"Circular dependencies detected: {string.Join(", ", graph.CircularDependencies)}");
                    foreach (var circular in graph.CircularDependencies)
                    {
                        result.Issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                        {
                            Severity = ValidationSeverity.Critical,
                            Category = "Dependency",
                            ItemName = circular,
                            Description = "Circular dependency prevents migration",
                            RecommendedAction = "Remove or restructure dependency to break the cycle"
                        });
                    }
                }

                // Validate external dependencies
                await ValidateExternalDependencies(graph, context, result, cancellationToken);

                // Validate resource availability
                await ValidateResourceAvailability(graph, context, result, cancellationToken);

                // Validate timing constraints
                await ValidateTimingConstraints(graph, context, result, cancellationToken);

                result.IsSuccess = !result.Errors.Any();
                result.EndTime = DateTime.Now;

                _logger.LogInformation($"Dependency validation completed. Success: {result.IsSuccess}, Issues: {result.Issues.Count}");

                return result;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.ErrorMessage = ex.Message;
                result.Errors.Add(ex.ToString());
                _logger.LogError(ex, "Dependency validation failed");
                return result;
            }
        }

        /// <summary>
        /// Process user dependencies (managers, direct reports, group ownership)
        /// </summary>
        private async Task ProcessUserDependencies(
            Dictionary<MigrationType, List<MigrationItem>> itemsByType,
            DependencyGraph graph,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            if (!itemsByType.ContainsKey(MigrationType.User))
                return;

            var userItems = itemsByType[MigrationType.User];
            
            foreach (var userItem in userItems)
            {
                cancellationToken.ThrowIfCancellationRequested();

                try
                {
                    var userDetail = await _logicEngineService.GetUserDetailAsync(userItem.SourceIdentity);
                    if (userDetail != null)
                    {
                        var dependencies = new List<string>();

                        // Manager dependency (manager should be migrated first)
                        if (!string.IsNullOrEmpty(userDetail.ManagerUpn))
                        {
                            var managerItem = userItems.FirstOrDefault(u => u.SourceIdentity == userDetail.ManagerUpn);
                            if (managerItem != null)
                            {
                                dependencies.Add(managerItem.Id);
                            }
                        }

                        // Group ownership dependencies (groups should be migrated before group owners)
                        foreach (var ownedGroup in userDetail.OwnedGroups ?? new List<string>())
                        {
                            var groupItems = itemsByType.ContainsKey(MigrationType.SecurityGroup) 
                                ? itemsByType[MigrationType.SecurityGroup] 
                                : new List<MigrationItem>();
                                
                            var groupItem = groupItems.FirstOrDefault(g => g.SourceIdentity == ownedGroup);
                            if (groupItem != null)
                            {
                                dependencies.Add(groupItem.Id);
                            }
                        }

                        if (dependencies.Any())
                        {
                            graph.Dependencies[userItem.Id] = dependencies;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Failed to process dependencies for user: {userItem.SourceIdentity}");
                }
            }
        }

        /// <summary>
        /// Process group dependencies (nested groups, group memberships)
        /// </summary>
        private async Task ProcessGroupDependencies(
            Dictionary<MigrationType, List<MigrationItem>> itemsByType,
            DependencyGraph graph,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            if (!itemsByType.ContainsKey(MigrationType.SecurityGroup))
                return;

            var groupItems = itemsByType[MigrationType.SecurityGroup];

            foreach (var groupItem in groupItems)
            {
                cancellationToken.ThrowIfCancellationRequested();

                try
                {
                    // Use LogicEngineService to get group details and nested group relationships
                    var groupDetail = await _logicEngineService.GetGroupDetailAsync(groupItem.SourceIdentity);
                    if (groupDetail?.NestedGroups != null)
                    {
                        var dependencies = new List<string>();

                        // Parent groups should be migrated before child groups
                        foreach (var parentGroup in groupDetail.NestedGroups)
                        {
                            var parentItem = groupItems.FirstOrDefault(g => g.SourceIdentity == parentGroup);
                            if (parentItem != null && parentItem.Id != groupItem.Id)
                            {
                                dependencies.Add(parentItem.Id);
                            }
                        }

                        if (dependencies.Any())
                        {
                            graph.Dependencies[groupItem.Id] = dependencies;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Failed to process dependencies for group: {groupItem.SourceIdentity}");
                }
            }
        }

        /// <summary>
        /// Process file dependencies (ACL dependencies on users and groups)
        /// </summary>
        private async Task ProcessFileDependencies(
            Dictionary<MigrationType, List<MigrationItem>> itemsByType,
            DependencyGraph graph,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            if (!itemsByType.ContainsKey(MigrationType.FileShare))
                return;

            var fileItems = itemsByType[MigrationType.FileShare];
            var userItems = itemsByType.ContainsKey(MigrationType.User) ? itemsByType[MigrationType.User] : new List<MigrationItem>();
            var groupItems = itemsByType.ContainsKey(MigrationType.SecurityGroup) ? itemsByType[MigrationType.SecurityGroup] : new List<MigrationItem>();

            foreach (var fileItem in fileItems)
            {
                cancellationToken.ThrowIfCancellationRequested();

                try
                {
                    var fileDetail = await _logicEngineService.GetFileShareDetailAsync(fileItem.SourcePath);
                    if (fileDetail?.AclEntries != null)
                    {
                        var dependencies = new List<string>();

                        // File shares depend on users and groups in their ACLs
                        foreach (var aclEntry in fileDetail.AclEntries)
                        {
                            // Find user dependencies
                            var userItem = userItems.FirstOrDefault(u => u.SourceIdentity == aclEntry.IdentitySid);
                            if (userItem != null)
                            {
                                dependencies.Add(userItem.Id);
                            }

                            // Find group dependencies
                            var groupItem = groupItems.FirstOrDefault(g => g.SourceIdentity == aclEntry.IdentitySid);
                            if (groupItem != null)
                            {
                                dependencies.Add(groupItem.Id);
                            }
                        }

                        if (dependencies.Any())
                        {
                            graph.Dependencies[fileItem.Id] = dependencies.Distinct().ToList();
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Failed to process dependencies for file share: {fileItem.SourcePath}");
                }
            }
        }

        /// <summary>
        /// Process mailbox dependencies (user ownership, distribution group memberships)
        /// </summary>
        private async Task ProcessMailboxDependencies(
            Dictionary<MigrationType, List<MigrationItem>> itemsByType,
            DependencyGraph graph,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            if (!itemsByType.ContainsKey(MigrationType.Mailbox))
                return;

            var mailboxItems = itemsByType[MigrationType.Mailbox];
            var userItems = itemsByType.ContainsKey(MigrationType.User) ? itemsByType[MigrationType.User] : new List<MigrationItem>();

            foreach (var mailboxItem in mailboxItems)
            {
                cancellationToken.ThrowIfCancellationRequested();

                try
                {
                    var dependencies = new List<string>();

                    // Mailboxes depend on their user accounts being migrated first
                    var ownerUser = userItems.FirstOrDefault(u => u.SourceIdentity == mailboxItem.SourceIdentity);
                    if (ownerUser != null)
                    {
                        dependencies.Add(ownerUser.Id);
                    }

                    // Add dependencies for shared mailbox permissions
                    var mailboxDetail = await _logicEngineService.GetMailboxDetailAsync(mailboxItem.SourceIdentity);
                    if (mailboxDetail?.Permissions != null)
                    {
                        foreach (var permission in mailboxDetail.Permissions)
                        {
                            var permissionUser = userItems.FirstOrDefault(u => u.SourceIdentity == permission);
                            if (permissionUser != null && permissionUser.Id != ownerUser?.Id)
                            {
                                dependencies.Add(permissionUser.Id);
                            }
                        }
                    }

                    if (dependencies.Any())
                    {
                        graph.Dependencies[mailboxItem.Id] = dependencies.Distinct().ToList();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Failed to process dependencies for mailbox: {mailboxItem.SourceIdentity}");
                }
            }
        }

        /// <summary>
        /// Process database dependencies (database ownership, login dependencies)
        /// </summary>
        private async Task ProcessDatabaseDependencies(
            Dictionary<MigrationType, List<MigrationItem>> itemsByType,
            DependencyGraph graph,
            MigrationContext context,
            CancellationToken cancellationToken)
        {
            if (!itemsByType.ContainsKey(MigrationType.Database))
                return;

            var databaseItems = itemsByType[MigrationType.Database];
            var userItems = itemsByType.ContainsKey(MigrationType.User) ? itemsByType[MigrationType.User] : new List<MigrationItem>();

            foreach (var databaseItem in databaseItems)
            {
                cancellationToken.ThrowIfCancellationRequested();

                try
                {
                    var dependencies = new List<string>();

                    // Database migrations depend on user accounts for database ownership
                    var databaseDetail = await _logicEngineService.GetDatabaseDetailAsync(databaseItem.SourceIdentity);
                    if (databaseDetail?.Owners != null)
                    {
                        foreach (var owner in databaseDetail.Owners)
                        {
                            var ownerUser = userItems.FirstOrDefault(u => u.SourceIdentity == owner);
                            if (ownerUser != null)
                            {
                                dependencies.Add(ownerUser.Id);
                            }
                        }
                    }

                    if (dependencies.Any())
                    {
                        graph.Dependencies[databaseItem.Id] = dependencies.Distinct().ToList();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Failed to process dependencies for database: {databaseItem.SourceIdentity}");
                }
            }
        }

        /// <summary>
        /// Perform topological sort to determine processing order
        /// </summary>
        private Dictionary<string, int> PerformTopologicalSort(Dictionary<string, List<string>> dependencies)
        {
            var result = new Dictionary<string, int>();
            var visited = new HashSet<string>();
            var visiting = new HashSet<string>();
            var order = 0;

            // Get all nodes
            var allNodes = dependencies.Keys.Union(dependencies.Values.SelectMany(v => v)).Distinct().ToList();

            foreach (var node in allNodes)
            {
                if (!visited.Contains(node))
                {
                    VisitNode(node, dependencies, visited, visiting, result, ref order);
                }
            }

            return result;
        }

        /// <summary>
        /// Recursive node visiting for topological sort
        /// </summary>
        private void VisitNode(
            string node,
            Dictionary<string, List<string>> dependencies,
            HashSet<string> visited,
            HashSet<string> visiting,
            Dictionary<string, int> result,
            ref int order)
        {
            if (visiting.Contains(node))
            {
                // Circular dependency detected
                return;
            }

            if (visited.Contains(node))
            {
                return;
            }

            visiting.Add(node);

            if (dependencies.ContainsKey(node))
            {
                foreach (var dependency in dependencies[node])
                {
                    VisitNode(dependency, dependencies, visited, visiting, result, ref order);
                }
            }

            visiting.Remove(node);
            visited.Add(node);
            result[node] = order++;
        }

        /// <summary>
        /// Detect circular dependencies in the graph
        /// </summary>
        private List<string> DetectCircularDependencies(Dictionary<string, List<string>> dependencies)
        {
            var circular = new List<string>();
            var visited = new HashSet<string>();
            var recursionStack = new HashSet<string>();

            foreach (var node in dependencies.Keys)
            {
                if (HasCircularDependency(node, dependencies, visited, recursionStack))
                {
                    circular.Add(node);
                }
            }

            return circular;
        }

        /// <summary>
        /// Check if a node has circular dependencies
        /// </summary>
        private bool HasCircularDependency(
            string node,
            Dictionary<string, List<string>> dependencies,
            HashSet<string> visited,
            HashSet<string> recursionStack)
        {
            if (recursionStack.Contains(node))
            {
                return true;
            }

            if (visited.Contains(node))
            {
                return false;
            }

            visited.Add(node);
            recursionStack.Add(node);

            if (dependencies.ContainsKey(node))
            {
                foreach (var dependency in dependencies[node])
                {
                    if (HasCircularDependency(dependency, dependencies, visited, recursionStack))
                    {
                        return true;
                    }
                }
            }

            recursionStack.Remove(node);
            return false;
        }

        /// <summary>
        /// Calculate dependency level for staging
        /// </summary>
        private int CalculateDependencyLevel(string itemId, Dictionary<string, List<string>> dependencies)
        {
            if (!dependencies.ContainsKey(itemId) || !dependencies[itemId].Any())
            {
                return 0; // No dependencies, can be in stage 0
            }

            var maxDependencyLevel = 0;
            foreach (var dependency in dependencies[itemId])
            {
                var dependencyLevel = CalculateDependencyLevel(dependency, dependencies);
                maxDependencyLevel = Math.Max(maxDependencyLevel, dependencyLevel);
            }

            return maxDependencyLevel + 1;
        }

        /// <summary>
        /// Check if items in a stage can execute in parallel
        /// </summary>
        private bool CanExecuteInParallel(List<string> stageItems, Dictionary<string, List<string>> dependencies)
        {
            // Items can execute in parallel if they don't depend on each other
            foreach (var item in stageItems)
            {
                if (dependencies.ContainsKey(item))
                {
                    var itemDependencies = dependencies[item];
                    if (itemDependencies.Any(dep => stageItems.Contains(dep)))
                    {
                        return false; // Found internal dependency within stage
                    }
                }
            }

            return true;
        }

        /// <summary>
        /// Get dependencies for a stage
        /// </summary>
        private List<string> GetStageDependencies(List<string> stageItems, Dictionary<string, List<string>> dependencies)
        {
            var stageDependencies = new HashSet<string>();

            foreach (var item in stageItems)
            {
                if (dependencies.ContainsKey(item))
                {
                    foreach (var dependency in dependencies[item])
                    {
                        if (!stageItems.Contains(dependency))
                        {
                            stageDependencies.Add(dependency);
                        }
                    }
                }
            }

            return stageDependencies.ToList();
        }

        /// <summary>
        /// Estimate duration for a migration stage
        /// </summary>
        private async Task<TimeSpan> EstimateStageDuration(List<MigrationItem> items, CancellationToken cancellationToken)
        {
            await Task.CompletedTask; // Async compliance

            // Simple estimation based on item types and counts
            var totalMinutes = 0.0;

            var itemsByType = items.GroupBy(i => i.Type).ToDictionary(g => g.Key, g => g.Count());

            foreach (var typeGroup in itemsByType)
            {
                switch (typeGroup.Key)
                {
                    case MigrationType.User:
                        totalMinutes += typeGroup.Value * 2; // 2 minutes per user
                        break;
                    case MigrationType.Mailbox:
                        totalMinutes += typeGroup.Value * 15; // 15 minutes per mailbox
                        break;
                    case MigrationType.FileShare:
                        totalMinutes += typeGroup.Value * 30; // 30 minutes per file share
                        break;
                    case MigrationType.Database:
                        totalMinutes += typeGroup.Value * 60; // 60 minutes per database
                        break;
                    case MigrationType.SecurityGroup:
                        totalMinutes += typeGroup.Value * 1; // 1 minute per group
                        break;
                    default:
                        totalMinutes += typeGroup.Value * 5; // Default 5 minutes per item
                        break;
                }
            }

            return TimeSpan.FromMinutes(Math.Max(totalMinutes, 1)); // Minimum 1 minute
        }

        /// <summary>
        /// Validate external dependencies not included in migration
        /// </summary>
        private async Task ValidateExternalDependencies(
            DependencyGraph graph,
            MigrationContext context,
            ValidationResult result,
            CancellationToken cancellationToken)
        {
            await Task.CompletedTask; // Async compliance

            // Check for external dependencies that won't be migrated
            foreach (var dependency in graph.Dependencies)
            {
                foreach (var dep in dependency.Value)
                {
                    if (!graph.Dependencies.ContainsKey(dep))
                    {
                        result.Issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                        {
                            Severity = ValidationSeverity.Warning,
                            Category = "Dependency",
                            Description = $"External dependency detected: {dependency.Key} depends on {dep} which is not included in migration"
                        });
                    }
                }
            }
        }

        /// <summary>
        /// Validate resource availability for migration
        /// </summary>
        private async Task ValidateResourceAvailability(
            DependencyGraph graph,
            MigrationContext context,
            ValidationResult result,
            CancellationToken cancellationToken)
        {
            await Task.CompletedTask; // Async compliance

            // Check target environment capacity
            if (context.Target?.Licensing != null)
            {
                var userCount = graph.Dependencies.Keys.Count(k => k.StartsWith("User_"));
                if (userCount > context.Target.Licensing.AvailableLicenses.Count)
                {
                    result.Errors.Add($"Insufficient licenses: {userCount} users to migrate but only {context.Target.Licensing.AvailableLicenses.Count} licenses available");
                }
            }
        }

        /// <summary>
        /// Validate timing constraints
        /// </summary>
        private async Task ValidateTimingConstraints(
            DependencyGraph graph,
            MigrationContext context,
            ValidationResult result,
            CancellationToken cancellationToken)
        {
            await Task.CompletedTask; // Async compliance

            // Validate that migration can complete within configured timeouts
            var estimatedDuration = await EstimateStageDuration(
                graph.Dependencies.Keys.Select(k => new MigrationItem { Id = k, Type = MigrationType.User }).ToList(),
                cancellationToken);

            if (estimatedDuration > context.OperationTimeout)
            {
                result.Issues.Add(new MandADiscoverySuite.Migration.ValidationIssue
                {
                    Severity = ValidationSeverity.Warning,
                    Category = "Performance",
                    Description = $"Estimated migration duration ({estimatedDuration}) exceeds configured timeout ({context.OperationTimeout})"
                });
            }
        }
    }

    /// <summary>
    /// Migration stage for dependency-ordered execution
    /// </summary>
    public class MigrationStage
    {
        public int StageOrder { get; set; }
        public List<MigrationItem> Items { get; set; } = new List<MigrationItem>();
        public List<string> Dependencies { get; set; } = new List<string>();
        public bool AllowParallelExecution { get; set; } = true;
        public TimeSpan EstimatedDuration { get; set; }
        public string StageName => $"Stage {StageOrder}";
        public int ItemCount => Items?.Count ?? 0;

        public string Description => $"Migration stage {StageOrder} with {ItemCount} items" +
            (AllowParallelExecution ? " (parallel execution)" : " (sequential execution)") +
            $", estimated duration: {EstimatedDuration:hh\\:mm\\:ss}";
    }
}