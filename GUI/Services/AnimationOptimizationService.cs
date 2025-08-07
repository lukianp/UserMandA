using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media.Animation;
using System.Windows.Media;
using System.Diagnostics;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for optimizing animations by disabling unnecessary ones and controlling animation settings
    /// </summary>
    public class AnimationOptimizationService
    {
        private readonly Dictionary<string, bool> _animationSettings = new();
        private readonly HashSet<FrameworkElement> _optimizedElements = new();
        private readonly object _lock = new object();
        private bool _globalAnimationsEnabled = true;
        private AnimationPerformanceLevel _performanceLevel = AnimationPerformanceLevel.Balanced;

        /// <summary>
        /// Initializes the service with default animation settings
        /// </summary>
        public AnimationOptimizationService()
        {
            InitializeDefaultSettings();
        }

        /// <summary>
        /// Optimizes animations for a specific element
        /// </summary>
        public void OptimizeElementAnimations(FrameworkElement element, AnimationOptimizationLevel level = AnimationOptimizationLevel.Standard)
        {
            if (element == null) return;

            lock (_lock)
            {
                if (_optimizedElements.Contains(element)) return;
                _optimizedElements.Add(element);
            }

            switch (level)
            {
                case AnimationOptimizationLevel.Minimal:
                    ApplyMinimalAnimations(element);
                    break;
                case AnimationOptimizationLevel.Standard:
                    ApplyStandardAnimations(element);
                    break;
                case AnimationOptimizationLevel.Enhanced:
                    ApplyEnhancedAnimations(element);
                    break;
                case AnimationOptimizationLevel.Disabled:
                    DisableAllAnimations(element);
                    break;
            }

            Debug.WriteLine($"Animation optimization applied to {element.GetType().Name}: {level}");
        }

        /// <summary>
        /// Disables specific types of animations globally
        /// </summary>
        public void DisableAnimationType(AnimationType animationType, bool disable = true)
        {
            lock (_lock)
            {
                _animationSettings[animationType.ToString()] = !disable;
            }
            ApplyGlobalAnimationSettings();
        }

        /// <summary>
        /// Sets the global performance level for animations
        /// </summary>
        public void SetPerformanceLevel(AnimationPerformanceLevel level)
        {
            _performanceLevel = level;
            ApplyPerformanceLevelSettings();
            Debug.WriteLine($"Animation performance level set to: {level}");
        }

        /// <summary>
        /// Enables or disables all animations globally
        /// </summary>
        public void SetGlobalAnimationsEnabled(bool enabled)
        {
            _globalAnimationsEnabled = enabled;
            Timeline.DesiredFrameRateProperty.OverrideMetadata(
                typeof(Timeline), 
                new FrameworkPropertyMetadata { DefaultValue = enabled ? 60 : 1 }
            );
        }

        /// <summary>
        /// Optimizes DataGrid animations which can be performance heavy
        /// </summary>
        public void OptimizeDataGridAnimations(DataGrid dataGrid)
        {
            if (dataGrid == null) return;

            // Disable row virtualization animations that can cause scrolling lag
            dataGrid.EnableRowVirtualization = true;
            dataGrid.EnableColumnVirtualization = true;
            
            // Disable cell focus animations
            dataGrid.SetValue(DataGrid.CellStyleProperty, CreateOptimizedCellStyle());
            
            // Disable selection animations for better performance
            if (!_animationSettings.GetValueOrDefault("SelectionAnimations", true))
            {
                dataGrid.SelectionChanged += (s, e) =>
                {
                    // Skip selection animations
                };
            }
        }

        /// <summary>
        /// Optimizes ListView animations
        /// </summary>
        public void OptimizeListViewAnimations(ListView listView)
        {
            if (listView == null) return;

            // Disable item container animations
            listView.SetValue(ListView.ItemContainerStyleProperty, CreateOptimizedListViewItemStyle());
            
            // Enable virtualization for better performance
            VirtualizingPanel.SetIsVirtualizing(listView, true);
            VirtualizingPanel.SetVirtualizationMode(listView, VirtualizationMode.Recycling);
        }

        /// <summary>
        /// Creates optimized storyboards with reduced complexity
        /// </summary>
        public Storyboard CreateOptimizedStoryboard(params Timeline[] animations)
        {
            var storyboard = new Storyboard();
            
            foreach (var animation in animations)
            {
                if (ShouldIncludeAnimation(animation))
                {
                    OptimizeAnimation(animation);
                    storyboard.Children.Add(animation);
                }
            }

            return storyboard;
        }

        /// <summary>
        /// Gets current animation statistics
        /// </summary>
        public AnimationOptimizationStats GetOptimizationStats()
        {
            lock (_lock)
            {
                return new AnimationOptimizationStats
                {
                    OptimizedElementsCount = _optimizedElements.Count,
                    GlobalAnimationsEnabled = _globalAnimationsEnabled,
                    PerformanceLevel = _performanceLevel,
                    DisabledAnimationTypes = _animationSettings.Where(kvp => !kvp.Value).Select(kvp => kvp.Key).ToList(),
                    EnabledAnimationTypes = _animationSettings.Where(kvp => kvp.Value).Select(kvp => kvp.Key).ToList()
                };
            }
        }

        #region Private Methods

        private void InitializeDefaultSettings()
        {
            // Disable performance-heavy animations by default
            _animationSettings["LoadingAnimations"] = false; // Disable loading spinners on data operations
            _animationSettings["SelectionAnimations"] = false; // Disable selection highlight animations
            _animationSettings["ScrollingAnimations"] = false; // Disable smooth scrolling animations
            _animationSettings["ResizeAnimations"] = false; // Disable column/window resize animations
            _animationSettings["SortAnimations"] = false; // Disable sort indicator animations
            
            // Keep useful animations enabled
            _animationSettings["HoverAnimations"] = true; // Keep hover effects for UX
            _animationSettings["ClickAnimations"] = true; // Keep button press animations
            _animationSettings["TransitionAnimations"] = true; // Keep view transitions
            _animationSettings["NotificationAnimations"] = true; // Keep notification animations
        }

        private void ApplyMinimalAnimations(FrameworkElement element)
        {
            // Disable almost all animations except essential ones
            DisableElementAnimations(element, new[]
            {
                "Opacity", "Transform", "Background", "Foreground"
            });
        }

        private void ApplyStandardAnimations(FrameworkElement element)
        {
            // Disable performance-heavy animations but keep user feedback animations
            DisableElementAnimations(element, new[]
            {
                "Background", "Foreground", "BorderBrush"
            });
        }

        private void ApplyEnhancedAnimations(FrameworkElement element)
        {
            // Keep most animations but optimize their performance
            OptimizeElementTransitions(element);
        }

        private void DisableAllAnimations(FrameworkElement element)
        {
            // Remove all animations from the element
            element.Resources.Clear();
            
            if (element is Control control)
            {
                control.Template = CreateNonAnimatedTemplate(control);
            }
        }

        private void DisableElementAnimations(FrameworkElement element, string[] animationProperties)
        {
            foreach (var property in animationProperties)
            {
                var dependencyProperty = GetDependencyProperty(element.GetType(), property);
                if (dependencyProperty != null)
                {
                    element.BeginAnimation(dependencyProperty, null);
                }
            }
        }

        private void OptimizeElementTransitions(FrameworkElement element)
        {
            // Reduce animation duration for better performance
            if (element.Resources.Contains("TransitionDuration"))
            {
                element.Resources["TransitionDuration"] = TimeSpan.FromMilliseconds(150); // Reduced from typical 300ms
            }
        }

        private void ApplyGlobalAnimationSettings()
        {
            // Apply animation settings to system-wide animations
            // Note: PowerLineStatusChanged is not available in WPF SystemParameters
            // This functionality has been removed for compatibility
        }

        private void ApplyPerformanceLevelSettings()
        {
            switch (_performanceLevel)
            {
                case AnimationPerformanceLevel.Minimal:
                    Timeline.DesiredFrameRateProperty.OverrideMetadata(typeof(Timeline), 
                        new FrameworkPropertyMetadata { DefaultValue = 15 });
                    break;
                case AnimationPerformanceLevel.Balanced:
                    Timeline.DesiredFrameRateProperty.OverrideMetadata(typeof(Timeline), 
                        new FrameworkPropertyMetadata { DefaultValue = 30 });
                    break;
                case AnimationPerformanceLevel.Smooth:
                    Timeline.DesiredFrameRateProperty.OverrideMetadata(typeof(Timeline), 
                        new FrameworkPropertyMetadata { DefaultValue = 60 });
                    break;
            }
        }

        private Style CreateOptimizedCellStyle()
        {
            var style = new Style(typeof(DataGridCell));
            
            // Remove focus animations
            style.Setters.Add(new Setter(DataGridCell.FocusVisualStyleProperty, null));
            
            // Simplified selection styling without animations
            var trigger = new Trigger { Property = DataGridCell.IsSelectedProperty, Value = true };
            trigger.Setters.Add(new Setter(DataGridCell.BackgroundProperty, SystemColors.HighlightBrush));
            style.Triggers.Add(trigger);
            
            return style;
        }

        private Style CreateOptimizedListViewItemStyle()
        {
            var style = new Style(typeof(ListViewItem));
            
            // Remove hover animations
            style.Setters.Add(new Setter(ListViewItem.FocusVisualStyleProperty, null));
            
            return style;
        }

        private bool ShouldIncludeAnimation(Timeline animation)
        {
            if (!_globalAnimationsEnabled) return false;
            
            // Check if this type of animation is disabled
            var animationType = GetAnimationType(animation);
            return _animationSettings.GetValueOrDefault(animationType.ToString(), true);
        }

        private void OptimizeAnimation(Timeline animation)
        {
            // Reduce animation duration based on performance level
            var durationMultiplier = _performanceLevel switch
            {
                AnimationPerformanceLevel.Minimal => 0.3,
                AnimationPerformanceLevel.Balanced => 0.7,
                AnimationPerformanceLevel.Smooth => 1.0,
                _ => 0.7
            };

            if (animation.Duration.HasTimeSpan)
            {
                animation.Duration = TimeSpan.FromMilliseconds(
                    animation.Duration.TimeSpan.TotalMilliseconds * durationMultiplier);
            }
        }

        private AnimationType GetAnimationType(Timeline animation)
        {
            return animation switch
            {
                DoubleAnimation da when Storyboard.GetTargetProperty(da).Path.Contains("Opacity") => AnimationType.FadeAnimations,
                ColorAnimation => AnimationType.ColorAnimations,
                ThicknessAnimation => AnimationType.LayoutAnimations,
                _ => AnimationType.GeneralAnimations
            };
        }

        private DependencyProperty GetDependencyProperty(Type elementType, string propertyName)
        {
            var field = elementType.GetField($"{propertyName}Property", 
                System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static);
            return field?.GetValue(null) as DependencyProperty;
        }

        private ControlTemplate CreateNonAnimatedTemplate(Control control)
        {
            // Create a simple template without animations
            var template = new ControlTemplate(control.GetType());
            var border = new FrameworkElementFactory(typeof(Border));
            border.SetValue(Border.BackgroundProperty, new TemplateBindingExtension(Control.BackgroundProperty));
            border.SetValue(Border.BorderBrushProperty, new TemplateBindingExtension(Control.BorderBrushProperty));
            border.SetValue(Border.BorderThicknessProperty, new TemplateBindingExtension(Control.BorderThicknessProperty));
            
            var contentPresenter = new FrameworkElementFactory(typeof(ContentPresenter));
            contentPresenter.SetValue(ContentPresenter.HorizontalAlignmentProperty, HorizontalAlignment.Center);
            contentPresenter.SetValue(ContentPresenter.VerticalAlignmentProperty, VerticalAlignment.Center);
            
            border.AppendChild(contentPresenter);
            template.VisualTree = border;
            
            return template;
        }

        #endregion
    }

    /// <summary>
    /// Animation optimization levels
    /// </summary>
    public enum AnimationOptimizationLevel
    {
        Disabled,    // No animations
        Minimal,     // Only essential animations
        Standard,    // Balanced animation set
        Enhanced     // Most animations with optimization
    }

    /// <summary>
    /// Performance levels for animation rendering
    /// </summary>
    public enum AnimationPerformanceLevel
    {
        Minimal,  // 15 FPS, minimal animations
        Balanced, // 30 FPS, balanced performance
        Smooth    // 60 FPS, smooth animations
    }

    /// <summary>
    /// Types of animations that can be controlled
    /// </summary>
    public enum AnimationType
    {
        LoadingAnimations,
        SelectionAnimations,
        ScrollingAnimations,
        ResizeAnimations,
        SortAnimations,
        HoverAnimations,
        ClickAnimations,
        TransitionAnimations,
        NotificationAnimations,
        FadeAnimations,
        ColorAnimations,
        LayoutAnimations,
        GeneralAnimations
    }

    /// <summary>
    /// Statistics about animation optimization
    /// </summary>
    public class AnimationOptimizationStats
    {
        public int OptimizedElementsCount { get; set; }
        public bool GlobalAnimationsEnabled { get; set; }
        public AnimationPerformanceLevel PerformanceLevel { get; set; }
        public List<string> DisabledAnimationTypes { get; set; } = new();
        public List<string> EnabledAnimationTypes { get; set; } = new();

        public override string ToString()
        {
            return $"Optimized Elements: {OptimizedElementsCount}, Global Enabled: {GlobalAnimationsEnabled}, " +
                   $"Performance: {PerformanceLevel}, Disabled Types: {DisabledAnimationTypes.Count}";
        }
    }
}