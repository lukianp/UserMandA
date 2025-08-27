using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for applying modern styling to charts
    /// </summary>
    public class ChartStylingService
    {
        private readonly Dictionary<string, Brush> _colorPalette;
        private readonly Dictionary<ChartType, ChartStyleSettings> _chartSettings;

        public ChartStylingService()
        {
            _colorPalette = new Dictionary<string, Brush>
            {
                ["Primary"] = new SolidColorBrush(Color.FromRgb(33, 150, 243)),
                ["Secondary"] = new SolidColorBrush(Color.FromRgb(76, 175, 80)),
                ["Tertiary"] = new SolidColorBrush(Color.FromRgb(255, 152, 0)),
                ["Quaternary"] = new SolidColorBrush(Color.FromRgb(233, 30, 99)),
                ["Quinary"] = new SolidColorBrush(Color.FromRgb(156, 39, 176)),
                ["Senary"] = new SolidColorBrush(Color.FromRgb(0, 188, 212)),
                ["Success"] = new SolidColorBrush(Color.FromRgb(76, 175, 80)),
                ["Warning"] = new SolidColorBrush(Color.FromRgb(255, 193, 7)),
                ["Error"] = new SolidColorBrush(Color.FromRgb(244, 67, 54)),
                ["Info"] = new SolidColorBrush(Color.FromRgb(33, 150, 243))
            };

            _chartSettings = new Dictionary<ChartType, ChartStyleSettings>
            {
                [ChartType.Bar] = new ChartStyleSettings
                {
                    UseAnimations = true,
                    ShowGrid = true,
                    ShowLegend = true,
                    UseGradients = true,
                    CornerRadius = 4,
                    BorderThickness = 1
                },
                [ChartType.Line] = new ChartStyleSettings
                {
                    UseAnimations = true,
                    ShowGrid = true,
                    ShowLegend = true,
                    UseGradients = false,
                    StrokeThickness = 2,
                    ShowMarkers = true
                },
                [ChartType.Pie] = new ChartStyleSettings
                {
                    UseAnimations = true,
                    ShowGrid = false,
                    ShowLegend = true,
                    UseGradients = true,
                    CornerRadius = 0,
                    ShowLabels = true
                },
                [ChartType.Area] = new ChartStyleSettings
                {
                    UseAnimations = true,
                    ShowGrid = true,
                    ShowLegend = true,
                    UseGradients = true,
                    FillOpacity = 0.7
                },
                [ChartType.Scatter] = new ChartStyleSettings
                {
                    UseAnimations = true,
                    ShowGrid = true,
                    ShowLegend = true,
                    UseGradients = false,
                    MarkerSize = 6
                }
            };
        }

        /// <summary>
        /// Applies modern styling to a chart container
        /// </summary>
        public void ApplyModernStyling(FrameworkElement chartContainer, ChartType chartType)
        {
            if (chartContainer == null) return;

            var settings = GetChartSettings(chartType);
            
            // Apply container styling
            if (chartContainer is Border border)
            {
                ApplyContainerStyling(border, settings);
            }
            else if (chartContainer is Panel panel)
            {
                ApplyPanelStyling(panel, settings);
            }

            // Apply animations
            if (settings.UseAnimations)
            {
                ApplyLoadAnimations(chartContainer);
            }
        }

        /// <summary>
        /// Creates a styled chart title
        /// </summary>
        public TextBlock CreateChartTitle(string title, ChartTitleStyle style = ChartTitleStyle.Primary)
        {
            var titleBlock = new TextBlock
            {
                Text = title,
                FontFamily = new FontFamily("Segoe UI"),
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 0, 0, 16)
            };

            switch (style)
            {
                case ChartTitleStyle.Primary:
                    titleBlock.FontSize = 18;
                    titleBlock.FontWeight = FontWeights.SemiBold;
                    titleBlock.Foreground = new SolidColorBrush(Color.FromRgb(33, 33, 33));
                    break;
                case ChartTitleStyle.Secondary:
                    titleBlock.FontSize = 14;
                    titleBlock.FontWeight = FontWeights.Medium;
                    titleBlock.Foreground = new SolidColorBrush(Color.FromRgb(97, 97, 97));
                    break;
                case ChartTitleStyle.Subtitle:
                    titleBlock.FontSize = 12;
                    titleBlock.FontWeight = FontWeights.Normal;
                    titleBlock.Foreground = new SolidColorBrush(Color.FromRgb(117, 117, 117));
                    titleBlock.Margin = new Thickness(0, 0, 0, 12);
                    break;
            }

            return titleBlock;
        }

        /// <summary>
        /// Creates a modern chart legend
        /// </summary>
        public StackPanel CreateChartLegend(List<LegendItem> items)
        {
            var legend = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = new Thickness(0, 12, 0, 0)
            };

            for (int i = 0; i < items.Count; i++)
            {
                var item = items[i];
                var legendItem = CreateLegendItem(item.Text, GetColorFromPalette(i), item.IsVisible);
                legend.Children.Add(legendItem);
            }

            return legend;
        }

        /// <summary>
        /// Applies gradient styling to chart elements
        /// </summary>
        public void ApplyGradientStyling(Shape shape, int colorIndex, GradientDirection direction = GradientDirection.TopToBottom)
        {
            var primaryColor = GetColorFromPalette(colorIndex);
            var gradientBrush = CreateGradientBrush(primaryColor, direction);
            shape.Fill = gradientBrush;
        }

        /// <summary>
        /// Creates animated data points for line charts
        /// </summary>
        public Ellipse CreateAnimatedDataPoint(Point position, int colorIndex, double size = 8)
        {
            var dataPoint = new Ellipse
            {
                Width = size,
                Height = size,
                Fill = GetColorFromPalette(colorIndex),
                Stroke = Brushes.White,
                StrokeThickness = 2,
                RenderTransformOrigin = new Point(0.5, 0.5)
            };

            Canvas.SetLeft(dataPoint, position.X - size / 2);
            Canvas.SetTop(dataPoint, position.Y - size / 2);

            // Add hover animation
            AddDataPointHoverAnimation(dataPoint);

            return dataPoint;
        }

        /// <summary>
        /// Creates animated bar chart elements
        /// </summary>
        public Rectangle CreateAnimatedBar(double height, double width, int colorIndex, TimeSpan delay = default)
        {
            var bar = new Rectangle
            {
                Width = width,
                Height = height,
                Fill = CreateGradientBrush(GetColorFromPalette(colorIndex), GradientDirection.TopToBottom),
                RenderTransformOrigin = new Point(0.5, 1),
                RenderTransform = new ScaleTransform(1, 0)
            };

            // Add entrance animation
            var animation = new DoubleAnimation
            {
                From = 0,
                To = 1,
                Duration = TimeSpan.FromMilliseconds(800),
                BeginTime = delay,
                EasingFunction = new CubicEase { EasingMode = EasingMode.EaseOut }
            };

            bar.RenderTransform.BeginAnimation(ScaleTransform.ScaleYProperty, animation);

            // Add hover effect
            AddBarHoverAnimation(bar);

            return bar;
        }

        /// <summary>
        /// Creates tooltip for chart elements
        /// </summary>
        public Border CreateChartTooltip(string text, object data = null)
        {
            var tooltip = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(245, 245, 245)),
                BorderBrush = new SolidColorBrush(Color.FromRgb(204, 204, 204)),
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(4),
                Padding = new Thickness(8),
                Effect = new System.Windows.Media.Effects.DropShadowEffect
                {
                    Color = Color.FromArgb(64, 0, 0, 0),
                    BlurRadius = 6,
                    ShadowDepth = 3,
                    Opacity = 0.4
                }
            };

            var textBlock = new TextBlock
            {
                Text = text,
                FontFamily = new FontFamily("Segoe UI"),
                FontSize = 11,
                Foreground = new SolidColorBrush(Color.FromRgb(33, 33, 33))
            };

            tooltip.Child = textBlock;
            return tooltip;
        }

        /// <summary>
        /// Gets chart performance statistics
        /// </summary>
        public ChartStylingStats GetStats()
        {
            return new ChartStylingStats
            {
                AvailableColors = _colorPalette.Count,
                ChartTypes = _chartSettings.Count,
                AnimationsEnabled = true
            };
        }

        #region Private Methods


        private ChartStyleSettings GetChartSettings(ChartType chartType)
        {
            return _chartSettings.ContainsKey(chartType) 
                ? _chartSettings[chartType] 
                : new ChartStyleSettings();
        }

        private Brush GetColorFromPalette(int index)
        {
            var colors = new string[] { "Primary", "Secondary", "Tertiary", "Quaternary", "Quinary", "Senary" };
            var colorKey = colors[index % colors.Length];
            return _colorPalette[colorKey];
        }

        private LinearGradientBrush CreateGradientBrush(Brush baseBrush, GradientDirection direction)
        {
            if (baseBrush is SolidColorBrush solidBrush)
            {
                var color = solidBrush.Color;
                var lightColor = Color.FromArgb(color.A, 
                    (byte)Math.Min(255, color.R + 40),
                    (byte)Math.Min(255, color.G + 40),
                    (byte)Math.Min(255, color.B + 40));
                
                var darkColor = Color.FromArgb((byte)(color.A * 0.8), 
                    (byte)(color.R * 0.8),
                    (byte)(color.G * 0.8),
                    (byte)(color.B * 0.8));

                var gradientBrush = new LinearGradientBrush();
                
                switch (direction)
                {
                    case GradientDirection.TopToBottom:
                        gradientBrush.StartPoint = new Point(0, 0);
                        gradientBrush.EndPoint = new Point(0, 1);
                        break;
                    case GradientDirection.LeftToRight:
                        gradientBrush.StartPoint = new Point(0, 0);
                        gradientBrush.EndPoint = new Point(1, 0);
                        break;
                }

                gradientBrush.GradientStops.Add(new GradientStop(lightColor, 0));
                gradientBrush.GradientStops.Add(new GradientStop(darkColor, 1));

                return gradientBrush;
            }

            return baseBrush as LinearGradientBrush ?? new LinearGradientBrush();
        }

        private StackPanel CreateLegendItem(string text, Brush color, bool isVisible)
        {
            var legendItem = new StackPanel
            {
                Orientation = Orientation.Horizontal,
                Margin = new Thickness(8, 0, 8, 0),
                Opacity = isVisible ? 1.0 : 0.5
            };

            var colorIndicator = new Rectangle
            {
                Width = 12,
                Height = 12,
                Fill = color,
                Margin = new Thickness(0, 0, 6, 0),
                RadiusX = 2,
                RadiusY = 2
            };

            var textBlock = new TextBlock
            {
                Text = text,
                FontFamily = new FontFamily("Segoe UI"),
                FontSize = 11,
                Foreground = new SolidColorBrush(Color.FromRgb(97, 97, 97)),
                VerticalAlignment = VerticalAlignment.Center
            };

            legendItem.Children.Add(colorIndicator);
            legendItem.Children.Add(textBlock);

            return legendItem;
        }

        private void ApplyContainerStyling(Border border, ChartStyleSettings settings)
        {
            border.Background = new SolidColorBrush(Color.FromRgb(250, 250, 250));
            border.BorderBrush = new SolidColorBrush(Color.FromRgb(224, 224, 224));
            border.BorderThickness = new Thickness(1);
            border.CornerRadius = new CornerRadius(8);
            border.Padding = new Thickness(16);
            border.Margin = new Thickness(8);

            if (settings.UseShadow)
            {
                border.Effect = new System.Windows.Media.Effects.DropShadowEffect
                {
                    Color = Color.FromArgb(32, 0, 0, 0),
                    BlurRadius = 8,
                    ShadowDepth = 2,
                    Opacity = 0.3
                };
            }
        }

        private void ApplyPanelStyling(Panel panel, ChartStyleSettings settings)
        {
            panel.Background = new SolidColorBrush(Color.FromRgb(250, 250, 250));
        }

        private void ApplyLoadAnimations(FrameworkElement element)
        {
            element.Opacity = 0;
            var fadeIn = new DoubleAnimation
            {
                From = 0,
                To = 1,
                Duration = TimeSpan.FromMilliseconds(500),
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            element.BeginAnimation(FrameworkElement.OpacityProperty, fadeIn);
        }

        private void AddDataPointHoverAnimation(Ellipse dataPoint)
        {
            dataPoint.MouseEnter += (s, e) =>
            {
                var scaleAnimation = new DoubleAnimation
                {
                    To = 1.5,
                    Duration = TimeSpan.FromMilliseconds(100)
                };

                var transform = new ScaleTransform(1, 1, 0.5, 0.5);
                dataPoint.RenderTransform = transform;
                transform.BeginAnimation(ScaleTransform.ScaleXProperty, scaleAnimation);
                transform.BeginAnimation(ScaleTransform.ScaleYProperty, scaleAnimation);
            };

            dataPoint.MouseLeave += (s, e) =>
            {
                var scaleAnimation = new DoubleAnimation
                {
                    To = 1.0,
                    Duration = TimeSpan.FromMilliseconds(100)
                };

                if (dataPoint.RenderTransform is ScaleTransform transform)
                {
                    transform.BeginAnimation(ScaleTransform.ScaleXProperty, scaleAnimation);
                    transform.BeginAnimation(ScaleTransform.ScaleYProperty, scaleAnimation);
                }
            };
        }

        private void AddBarHoverAnimation(Rectangle bar)
        {
            bar.MouseEnter += (s, e) =>
            {
                var scaleAnimation = new DoubleAnimation
                {
                    To = 1.05,
                    Duration = TimeSpan.FromMilliseconds(100)
                };

                if (bar.RenderTransform is ScaleTransform transform)
                {
                    transform.BeginAnimation(ScaleTransform.ScaleYProperty, scaleAnimation);
                }
            };

            bar.MouseLeave += (s, e) =>
            {
                var scaleAnimation = new DoubleAnimation
                {
                    To = 1.0,
                    Duration = TimeSpan.FromMilliseconds(100)
                };

                if (bar.RenderTransform is ScaleTransform transform)
                {
                    transform.BeginAnimation(ScaleTransform.ScaleYProperty, scaleAnimation);
                }
            };
        }

        #endregion
    }

    /// <summary>
    /// Chart type enumeration
    /// </summary>
    public enum ChartType
    {
        Bar,
        Line,
        Pie,
        Area,
        Scatter,
        Doughnut
    }

    /// <summary>
    /// Chart title style options
    /// </summary>
    public enum ChartTitleStyle
    {
        Primary,
        Secondary,
        Subtitle
    }

    /// <summary>
    /// Gradient direction options
    /// </summary>
    public enum GradientDirection
    {
        TopToBottom,
        LeftToRight,
        Radial
    }

    /// <summary>
    /// Chart style settings
    /// </summary>
    public class ChartStyleSettings
    {
        public bool UseAnimations { get; set; } = true;
        public bool ShowGrid { get; set; } = true;
        public bool ShowLegend { get; set; } = true;
        public bool UseGradients { get; set; } = true;
        public bool UseShadow { get; set; } = true;
        public double CornerRadius { get; set; } = 4;
        public double StrokeThickness { get; set; } = 1;
        public double Opacity { get; set; } = 1.0;
        public double BorderThickness { get; set; } = 1;
        public bool ShowMarkers { get; set; } = true;
        public bool ShowLabels { get; set; } = true;
        public double FillOpacity { get; set; } = 0.7;
        public double MarkerSize { get; set; } = 6;
    }

    /// <summary>
    /// Legend item information
    /// </summary>
    public class LegendItem
    {
        public string Text { get; set; }
        public bool IsVisible { get; set; } = true;
        public object Data { get; set; }
    }

    /// <summary>
    /// Chart styling statistics
    /// </summary>
    public class ChartStylingStats
    {
        public int AvailableColors { get; set; }
        public int ChartTypes { get; set; }
        public bool AnimationsEnabled { get; set; }

        public override string ToString()
        {
            return $"Chart Styling: Colors={AvailableColors}, Types={ChartTypes}, Animations={AnimationsEnabled}";
        }
    }
}