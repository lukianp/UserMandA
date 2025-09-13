using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for optimizing hit test performance by disabling hit testing on decorative elements
    /// </summary>
    public class HitTestOptimizationService
    {
        private readonly HashSet<Type> _decorativeElementTypes = new()
        {
            typeof(TextBlock),
            typeof(Rectangle),
            typeof(Ellipse),
            typeof(Line),
            typeof(System.Windows.Shapes.Path)
        };

        private readonly HashSet<string> _decorativeIndicators = new()
        {
            "icon", "separator", "divider", "decoration", "background", "header", "title", "label"
        };

        /// <summary>
        /// Optimizes hit testing for a visual tree starting from the given element
        /// </summary>
        /// <param name="root">Root element to optimize</param>
        /// <param name="aggressive">Whether to use aggressive optimization</param>
        /// <returns>Number of elements optimized</returns>
        public int OptimizeVisualTree(FrameworkElement root, bool aggressive = false)
        {
            if (root == null) return 0;

            var optimizedCount = 0;
            var elementsToProcess = new Queue<FrameworkElement>();
            elementsToProcess.Enqueue(root);

            while (elementsToProcess.Count > 0)
            {
                var element = elementsToProcess.Dequeue();

                // Check if this element should have hit testing disabled
                if (ShouldDisableHitTesting(element, aggressive))
                {
                    element.IsHitTestVisible = false;
                    optimizedCount++;
                }

                // Process child elements
                for (int i = 0; i < VisualTreeHelper.GetChildrenCount(element); i++)
                {
                    if (VisualTreeHelper.GetChild(element, i) is FrameworkElement child)
                    {
                        elementsToProcess.Enqueue(child);
                    }
                }
            }

            return optimizedCount;
        }

        /// <summary>
        /// Optimizes specific common decorative elements
        /// </summary>
        /// <param name="element">Element to check and optimize</param>
        public void OptimizeDecorativeElement(FrameworkElement element)
        {
            if (element == null) return;

            switch (element)
            {
                case TextBlock textBlock when IsDecorativeText(textBlock):
                    textBlock.IsHitTestVisible = false;
                    break;

                case Border border when IsDecorativeBorder(border):
                    border.IsHitTestVisible = false;
                    break;

                case Rectangle rectangle when IsDecorative(rectangle):
                    rectangle.IsHitTestVisible = false;
                    break;

                case Ellipse ellipse when IsDecorative(ellipse):
                    ellipse.IsHitTestVisible = false;
                    break;

                case System.Windows.Shapes.Path path when IsDecorative(path):
                    path.IsHitTestVisible = false;
                    break;
            }
        }

        /// <summary>
        /// Batch optimizes multiple elements
        /// </summary>
        /// <param name="elements">Elements to optimize</param>
        /// <returns>Number of elements optimized</returns>
        public int OptimizeElements(IEnumerable<FrameworkElement> elements)
        {
            if (elements == null) return 0;

            var optimizedCount = 0;
            foreach (var element in elements)
            {
                if (ShouldDisableHitTesting(element, false))
                {
                    element.IsHitTestVisible = false;
                    optimizedCount++;
                }
            }

            return optimizedCount;
        }

        /// <summary>
        /// Creates optimization recommendations for a visual tree
        /// </summary>
        /// <param name="root">Root element to analyze</param>
        /// <returns>Optimization report</returns>
        public HitTestOptimizationReport AnalyzeVisualTree(FrameworkElement root)
        {
            var report = new HitTestOptimizationReport
            {
                AnalysisDate = DateTime.Now,
                RootElementType = root?.GetType().Name ?? "Unknown"
            };

            if (root == null) return report;

            var elementsToAnalyze = new Queue<FrameworkElement>();
            elementsToAnalyze.Enqueue(root);

            while (elementsToAnalyze.Count > 0)
            {
                var element = elementsToAnalyze.Dequeue();
                report.TotalElements++;

                if (element.IsHitTestVisible)
                {
                    report.HitTestVisibleElements++;

                    if (ShouldDisableHitTesting(element, false))
                    {
                        report.OptimizationCandidates.Add(new OptimizationCandidate
                        {
                            ElementType = element.GetType().Name,
                            ElementName = element.Name,
                            Reason = GetOptimizationReason(element)
                        });
                    }
                }
                else
                {
                    report.OptimizedElements++;
                }

                // Process children
                for (int i = 0; i < VisualTreeHelper.GetChildrenCount(element); i++)
                {
                    if (VisualTreeHelper.GetChild(element, i) is FrameworkElement child)
                    {
                        elementsToAnalyze.Enqueue(child);
                    }
                }
            }

            return report;
        }

        /// <summary>
        /// Determines if hit testing should be disabled for an element
        /// </summary>
        private bool ShouldDisableHitTesting(FrameworkElement element, bool aggressive)
        {
            if (element == null) return false;

            // Never disable hit testing on interactive elements
            if (IsInteractiveElement(element)) return false;

            // Check by element type
            if (_decorativeElementTypes.Contains(element.GetType()))
            {
                return aggressive || IsDecorativeByContext(element);
            }

            // Check borders
            if (element is Border border)
            {
                return IsDecorativeBorder(border);
            }

            return false;
        }

        /// <summary>
        /// Checks if an element is interactive
        /// </summary>
        private bool IsInteractiveElement(FrameworkElement element)
        {
            return element is Button || 
                   element is TextBox ||
                   element is ComboBox ||
                   element is CheckBox ||
                   element is RadioButton ||
                   element is Slider ||
                   element is ListBox ||
                   element is ListView ||
                   element is DataGrid ||
                   element is ScrollViewer ||
                   element.Cursor != null;
        }

        /// <summary>
        /// Determines if a TextBlock is decorative
        /// </summary>
        private bool IsDecorativeText(TextBlock textBlock)
        {
            if (textBlock.Text?.Length <= 3) return true; // Icons, separators
            return IsDecorativeByContext(textBlock);
        }

        /// <summary>
        /// Determines if a Border is decorative
        /// </summary>
        private bool IsDecorativeBorder(Border border)
        {
            return border.Child == null || 
                   (border.Background != null && border.Child is TextBlock) ||
                   IsDecorativeByContext(border);
        }

        /// <summary>
        /// Determines if an element is decorative by context
        /// </summary>
        private bool IsDecorativeByContext(FrameworkElement element)
        {
            var name = element.Name?.ToLowerInvariant() ?? "";
            var className = element.GetType().Name.ToLowerInvariant();

            return _decorativeIndicators.Any(indicator => 
                name.Contains(indicator) || className.Contains(indicator));
        }

        /// <summary>
        /// Checks if a shape is decorative
        /// </summary>
        private bool IsDecorative(Shape shape)
        {
            return shape.Fill != null || shape.Stroke != null;
        }

        /// <summary>
        /// Gets the optimization reason for an element
        /// </summary>
        private string GetOptimizationReason(FrameworkElement element)
        {
            if (element is TextBlock textBlock && textBlock.Text?.Length <= 3)
                return "Short text - likely decorative icon or separator";

            if (_decorativeElementTypes.Contains(element.GetType()))
                return "Decorative element type";

            if (IsDecorativeByContext(element))
                return "Decorative based on naming convention";

            return "Potentially decorative";
        }
    }

    /// <summary>
    /// Report for hit test optimization analysis
    /// </summary>
    public class HitTestOptimizationReport
    {
        public DateTime AnalysisDate { get; set; }
        public string RootElementType { get; set; }
        public int TotalElements { get; set; }
        public int HitTestVisibleElements { get; set; }
        public int OptimizedElements { get; set; }
        public List<OptimizationCandidate> OptimizationCandidates { get; set; } = new();

        public double OptimizationPercentage =>
            TotalElements > 0 ? (double)OptimizedElements / TotalElements * 100 : 0;

        public int PotentialSavings => OptimizationCandidates.Count;

        public override string ToString()
        {
            return $"Hit Test Analysis: {OptimizedElements}/{TotalElements} optimized ({OptimizationPercentage:F1}%), {PotentialSavings} potential savings";
        }
    }

    /// <summary>
    /// Represents an element that could be optimized
    /// </summary>
    public class OptimizationCandidate
    {
        public string ElementType { get; set; }
        public string ElementName { get; set; }
        public string Reason { get; set; }

        public override string ToString()
        {
            return $"{ElementType} '{ElementName}': {Reason}";
        }
    }
}