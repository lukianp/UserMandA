using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Media;
using System.Diagnostics;
using System.Text;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for analyzing visual tree complexity and providing optimization recommendations
    /// </summary>
    public class VisualTreeAnalyzer
    {
        private readonly Dictionary<Type, PerformanceWeight> _performanceWeights;
        
        public VisualTreeAnalyzer()
        {
            _performanceWeights = InitializePerformanceWeights();
        }

        /// <summary>
        /// Analyzes the visual tree starting from the given element
        /// </summary>
        public VisualTreeAnalysisResult AnalyzeVisualTree(FrameworkElement root, bool includeRecommendations = true)
        {
            if (root == null) throw new ArgumentNullException(nameof(root));

            var result = new VisualTreeAnalysisResult
            {
                RootElement = root.GetType().Name,
                AnalysisDate = DateTime.UtcNow
            };

            var stopwatch = Stopwatch.StartNew();
            
            // Perform analysis
            AnalyzeElementRecursively(root, result, 0);
            
            stopwatch.Stop();
            result.AnalysisDuration = stopwatch.Elapsed;
            
            // Calculate complexity metrics
            CalculateComplexityMetrics(result);
            
            // Generate recommendations if requested
            if (includeRecommendations)
            {
                GenerateOptimizationRecommendations(result);
            }

            return result;
        }

        /// <summary>
        /// Analyzes a specific element and its children recursively
        /// </summary>
        private void AnalyzeElementRecursively(FrameworkElement element, VisualTreeAnalysisResult result, int depth)
        {
            if (element == null) return;

            result.TotalElements++;
            result.MaxDepth = Math.Max(result.MaxDepth, depth);
            
            var elementInfo = new ElementInfo
            {
                ElementType = element.GetType().Name,
                Name = element.Name,
                Depth = depth,
                HasRenderTransform = element.RenderTransform != null && !element.RenderTransform.Value.IsIdentity,
                IsHitTestVisible = element.IsHitTestVisible,
                IsVisible = element.IsVisible,
                ActualWidth = element.ActualWidth,
                ActualHeight = element.ActualHeight,
                PerformanceWeight = GetPerformanceWeight(element.GetType())
            };

            // Check for performance-impacting properties
            AnalyzeElementProperties(element, elementInfo);
            
            result.Elements.Add(elementInfo);
            
            // Update statistics
            UpdateStatistics(result, elementInfo);

            // Analyze children
            var childCount = VisualTreeHelper.GetChildrenCount(element);
            elementInfo.ChildCount = childCount;
            
            if (childCount > 10)
            {
                result.HighChildCountElements.Add(elementInfo);
            }

            for (int i = 0; i < childCount; i++)
            {
                if (VisualTreeHelper.GetChild(element, i) is FrameworkElement child)
                {
                    AnalyzeElementRecursively(child, result, depth + 1);
                }
            }
        }

        /// <summary>
        /// Analyzes specific properties of an element that affect performance
        /// </summary>
        private void AnalyzeElementProperties(FrameworkElement element, ElementInfo elementInfo)
        {
            // Check for expensive properties
            if (element.Effect != null)
            {
                elementInfo.HasEffect = true;
                elementInfo.EffectType = element.Effect.GetType().Name;
            }

            if (element.OpacityMask != null)
            {
                elementInfo.HasOpacityMask = true;
            }

            if (element.Clip != null)
            {
                elementInfo.HasClipping = true;
            }

            // Check for binding complexity
            var bindingCount = 0;
            var properties = element.GetType().GetFields(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static)
                .Where(f => f.FieldType == typeof(DependencyProperty))
                .Select(f => f.GetValue(null) as DependencyProperty)
                .Where(dp => dp != null);

            foreach (var dp in properties)
            {
                var binding = BindingOperations.GetBinding(element, dp);
                if (binding != null)
                {
                    bindingCount++;
                    if (binding.IsAsync)
                        elementInfo.AsyncBindingCount++;
                }
            }
            
            elementInfo.BindingCount = bindingCount;

            // Check for virtualization
            if (element is ItemsControl itemsControl)
            {
                elementInfo.IsVirtualizing = VirtualizingPanel.GetIsVirtualizing(itemsControl);
                elementInfo.VirtualizationMode = VirtualizingPanel.GetVirtualizationMode(itemsControl).ToString();
            }

            // Check for specific control optimizations
            AnalyzeControlSpecificProperties(element, elementInfo);
        }

        /// <summary>
        /// Analyzes control-specific properties
        /// </summary>
        private void AnalyzeControlSpecificProperties(FrameworkElement element, ElementInfo elementInfo)
        {
            switch (element)
            {
                case DataGrid dataGrid:
                    elementInfo.ControlSpecificInfo["EnableRowVirtualization"] = dataGrid.EnableRowVirtualization.ToString();
                    elementInfo.ControlSpecificInfo["EnableColumnVirtualization"] = dataGrid.EnableColumnVirtualization.ToString();
                    elementInfo.ControlSpecificInfo["RowCount"] = dataGrid.Items.Count.ToString();
                    elementInfo.ControlSpecificInfo["ColumnCount"] = dataGrid.Columns.Count.ToString();
                    break;

                case ListView listView:
                    elementInfo.ControlSpecificInfo["ItemCount"] = listView.Items.Count.ToString();
                    elementInfo.ControlSpecificInfo["View"] = listView.View?.GetType().Name ?? "None";
                    break;

                case TreeView treeView:
                    elementInfo.ControlSpecificInfo["ItemCount"] = treeView.Items.Count.ToString();
                    break;

                case Image image:
                    elementInfo.ControlSpecificInfo["Source"] = image.Source?.ToString() ?? "None";
                    elementInfo.ControlSpecificInfo["Stretch"] = image.Stretch.ToString();
                    break;

                case TextBlock textBlock:
                    elementInfo.ControlSpecificInfo["TextLength"] = textBlock.Text?.Length.ToString() ?? "0";
                    elementInfo.ControlSpecificInfo["TextWrapping"] = textBlock.TextWrapping.ToString();
                    break;
            }
        }

        /// <summary>
        /// Updates analysis statistics
        /// </summary>
        private void UpdateStatistics(VisualTreeAnalysisResult result, ElementInfo elementInfo)
        {
            var elementType = elementInfo.ElementType;
            
            if (!result.ElementTypeCount.ContainsKey(elementType))
                result.ElementTypeCount[elementType] = 0;
            
            result.ElementTypeCount[elementType]++;

            if (elementInfo.HasEffect)
                result.ElementsWithEffects++;

            if (elementInfo.HasRenderTransform)
                result.ElementsWithTransforms++;

            if (elementInfo.BindingCount > 5)
                result.ElementsWithManyBindings++;

            if (!elementInfo.IsHitTestVisible)
                result.OptimizedElements++;

            result.TotalComplexityScore += elementInfo.PerformanceWeight.Weight;
            result.TotalBindings += elementInfo.BindingCount;
        }

        /// <summary>
        /// Calculates overall complexity metrics
        /// </summary>
        private void CalculateComplexityMetrics(VisualTreeAnalysisResult result)
        {
            if (result.TotalElements == 0) return;

            result.AverageDepth = result.Elements.Average(e => e.Depth);
            result.AverageChildrenPerElement = result.Elements.Where(e => e.ChildCount > 0).Average(e => e.ChildCount);
            result.ComplexityScore = result.TotalComplexityScore / result.TotalElements;
            result.OptimizationPercentage = (double)result.OptimizedElements / result.TotalElements * 100;
        }

        /// <summary>
        /// Generates optimization recommendations based on analysis
        /// </summary>
        private void GenerateOptimizationRecommendations(VisualTreeAnalysisResult result)
        {
            var recommendations = new List<OptimizationRecommendation>();

            // Depth recommendations
            if (result.MaxDepth > 20)
            {
                recommendations.Add(new OptimizationRecommendation
                {
                    Type = RecommendationType.Structure,
                    Priority = Priority.High,
                    Title = "Visual Tree Too Deep",
                    Description = $"Visual tree has maximum depth of {result.MaxDepth}. Consider flattening the structure.",
                    Impact = "High - Deep nesting can cause layout and rendering performance issues"
                });
            }

            // Child count recommendations
            if (result.HighChildCountElements.Any())
            {
                var maxChildren = result.HighChildCountElements.Max(e => e.ChildCount);
                recommendations.Add(new OptimizationRecommendation
                {
                    Type = RecommendationType.Virtualization,
                    Priority = Priority.High,
                    Title = "High Child Count Elements",
                    Description = $"Found {result.HighChildCountElements.Count} elements with >10 children. Maximum: {maxChildren}",
                    Impact = "High - Consider using virtualization for containers with many children"
                });
            }

            // Effects recommendations
            if (result.ElementsWithEffects > result.TotalElements * 0.1)
            {
                recommendations.Add(new OptimizationRecommendation
                {
                    Type = RecommendationType.Effects,
                    Priority = Priority.Medium,
                    Title = "Excessive Use of Effects",
                    Description = $"{result.ElementsWithEffects} elements use effects. This can impact rendering performance.",
                    Impact = "Medium - Effects cause expensive pixel shader operations"
                });
            }

            // Binding recommendations
            if (result.ElementsWithManyBindings > 0)
            {
                recommendations.Add(new OptimizationRecommendation
                {
                    Type = RecommendationType.Bindings,
                    Priority = Priority.Medium,
                    Title = "Complex Binding Scenarios",
                    Description = $"{result.ElementsWithManyBindings} elements have >5 bindings each.",
                    Impact = "Medium - Many bindings per element can cause update performance issues"
                });
            }

            // Hit test optimization
            var nonOptimizedDecorative = result.TotalElements - result.OptimizedElements;
            if (result.OptimizationPercentage < 20 && nonOptimizedDecorative > 50)
            {
                recommendations.Add(new OptimizationRecommendation
                {
                    Type = RecommendationType.HitTesting,
                    Priority = Priority.Low,
                    Title = "Hit Test Optimization Opportunity",
                    Description = $"Only {result.OptimizationPercentage:F1}% of elements are optimized for hit testing.",
                    Impact = "Low - Consider disabling hit testing on decorative elements"
                });
            }

            result.Recommendations = recommendations;
        }

        /// <summary>
        /// Gets the performance weight for a given element type
        /// </summary>
        private PerformanceWeight GetPerformanceWeight(Type elementType)
        {
            if (_performanceWeights.TryGetValue(elementType, out var weight))
                return weight;

            // Check base types
            var baseType = elementType.BaseType;
            while (baseType != null)
            {
                if (_performanceWeights.TryGetValue(baseType, out weight))
                    return weight;
                baseType = baseType.BaseType;
            }

            return new PerformanceWeight { Weight = 1, Description = "Unknown element type" };
        }

        /// <summary>
        /// Initializes performance weights for different element types
        /// </summary>
        private Dictionary<Type, PerformanceWeight> InitializePerformanceWeights()
        {
            return new Dictionary<Type, PerformanceWeight>
            {
                { typeof(TextBlock), new PerformanceWeight { Weight = 1, Description = "Lightweight text element" } },
                { typeof(Border), new PerformanceWeight { Weight = 1, Description = "Simple container" } },
                { typeof(Grid), new PerformanceWeight { Weight = 2, Description = "Layout panel with measurements" } },
                { typeof(StackPanel), new PerformanceWeight { Weight = 1, Description = "Simple layout panel" } },
                { typeof(Canvas), new PerformanceWeight { Weight = 1, Description = "Absolute positioning panel" } },
                { typeof(DataGrid), new PerformanceWeight { Weight = 5, Description = "Complex data presentation control" } },
                { typeof(ListView), new PerformanceWeight { Weight = 4, Description = "Virtualized list control" } },
                { typeof(TreeView), new PerformanceWeight { Weight = 4, Description = "Hierarchical data control" } },
                { typeof(TabControl), new PerformanceWeight { Weight = 3, Description = "Tab container control" } },
                { typeof(Button), new PerformanceWeight { Weight = 2, Description = "Interactive control with templates" } },
                { typeof(TextBox), new PerformanceWeight { Weight = 3, Description = "Text input control" } },
                { typeof(ComboBox), new PerformanceWeight { Weight = 3, Description = "Dropdown selection control" } },
                { typeof(Image), new PerformanceWeight { Weight = 3, Description = "Image rendering element" } },
                { typeof(MediaElement), new PerformanceWeight { Weight = 6, Description = "Media playback control" } },
                { typeof(WebBrowser), new PerformanceWeight { Weight = 7, Description = "Embedded browser control" } },
                { typeof(Frame), new PerformanceWeight { Weight = 4, Description = "Navigation frame" } },
                { typeof(UserControl), new PerformanceWeight { Weight = 2, Description = "Custom control container" } }
            };
        }

        /// <summary>
        /// Exports analysis results to a detailed report
        /// </summary>
        public string ExportAnalysisReport(VisualTreeAnalysisResult result)
        {
            var report = new StringBuilder();
            
            report.AppendLine("=== VISUAL TREE ANALYSIS REPORT ===");
            report.AppendLine($"Analysis Date: {result.AnalysisDate:yyyy-MM-dd HH:mm:ss}");
            report.AppendLine($"Root Element: {result.RootElement}");
            report.AppendLine($"Analysis Duration: {result.AnalysisDuration.TotalMilliseconds:F2}ms");
            report.AppendLine();
            
            report.AppendLine("=== COMPLEXITY METRICS ===");
            report.AppendLine($"Total Elements: {result.TotalElements:N0}");
            report.AppendLine($"Maximum Depth: {result.MaxDepth}");
            report.AppendLine($"Average Depth: {result.AverageDepth:F2}");
            report.AppendLine($"Average Children per Element: {result.AverageChildrenPerElement:F2}");
            report.AppendLine($"Complexity Score: {result.ComplexityScore:F2}");
            report.AppendLine($"Optimization Percentage: {result.OptimizationPercentage:F1}%");
            report.AppendLine();
            
            report.AppendLine("=== ELEMENT STATISTICS ===");
            report.AppendLine($"Elements with Effects: {result.ElementsWithEffects}");
            report.AppendLine($"Elements with Transforms: {result.ElementsWithTransforms}");
            report.AppendLine($"Elements with Many Bindings: {result.ElementsWithManyBindings}");
            report.AppendLine($"Total Bindings: {result.TotalBindings:N0}");
            report.AppendLine();
            
            report.AppendLine("=== ELEMENT TYPE BREAKDOWN ===");
            foreach (var kvp in result.ElementTypeCount.OrderByDescending(x => x.Value))
            {
                report.AppendLine($"{kvp.Key}: {kvp.Value:N0}");
            }
            report.AppendLine();
            
            if (result.Recommendations?.Any() == true)
            {
                report.AppendLine("=== OPTIMIZATION RECOMMENDATIONS ===");
                foreach (var rec in result.Recommendations.OrderBy(r => r.Priority))
                {
                    report.AppendLine($"[{rec.Priority}] {rec.Title}");
                    report.AppendLine($"  {rec.Description}");
                    report.AppendLine($"  Impact: {rec.Impact}");
                    report.AppendLine();
                }
            }
            
            return report.ToString();
        }
    }

    /// <summary>
    /// Results of visual tree analysis
    /// </summary>
    public class VisualTreeAnalysisResult
    {
        public string RootElement { get; set; }
        public DateTime AnalysisDate { get; set; }
        public TimeSpan AnalysisDuration { get; set; }
        public int TotalElements { get; set; }
        public int MaxDepth { get; set; }
        public double AverageDepth { get; set; }
        public double AverageChildrenPerElement { get; set; }
        public double ComplexityScore { get; set; }
        public double OptimizationPercentage { get; set; }
        public int ElementsWithEffects { get; set; }
        public int ElementsWithTransforms { get; set; }
        public int ElementsWithManyBindings { get; set; }
        public int OptimizedElements { get; set; }
        public int TotalBindings { get; set; }
        public double TotalComplexityScore { get; set; }
        public Dictionary<string, int> ElementTypeCount { get; set; } = new();
        public List<ElementInfo> Elements { get; set; } = new();
        public List<ElementInfo> HighChildCountElements { get; set; } = new();
        public List<OptimizationRecommendation> Recommendations { get; set; } = new();
    }

    /// <summary>
    /// Information about a specific element in the visual tree
    /// </summary>
    public class ElementInfo
    {
        public string ElementType { get; set; }
        public string Name { get; set; }
        public int Depth { get; set; }
        public int ChildCount { get; set; }
        public bool HasRenderTransform { get; set; }
        public bool HasEffect { get; set; }
        public string EffectType { get; set; }
        public bool HasOpacityMask { get; set; }
        public bool HasClipping { get; set; }
        public bool IsHitTestVisible { get; set; }
        public bool IsVisible { get; set; }
        public bool IsVirtualizing { get; set; }
        public string VirtualizationMode { get; set; }
        public int BindingCount { get; set; }
        public int AsyncBindingCount { get; set; }
        public double ActualWidth { get; set; }
        public double ActualHeight { get; set; }
        public PerformanceWeight PerformanceWeight { get; set; }
        public Dictionary<string, string> ControlSpecificInfo { get; set; } = new();
    }

    /// <summary>
    /// Performance weight information for element types
    /// </summary>
    public class PerformanceWeight
    {
        public double Weight { get; set; }
        public string Description { get; set; }
    }

    /// <summary>
    /// Optimization recommendation
    /// </summary>
    public class OptimizationRecommendation
    {
        public RecommendationType Type { get; set; }
        public Priority Priority { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Impact { get; set; }
    }

    public enum RecommendationType
    {
        Structure,
        Virtualization,
        Effects,
        Bindings,
        HitTesting,
        Layout,
        Rendering
    }

    public enum Priority
    {
        Low,
        Medium,
        High,
        Critical
    }
}