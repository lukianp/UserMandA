using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    public class PieChart : Control
    {
        private Canvas _chartCanvas;
        private StackPanel _legend;

        public static readonly DependencyProperty DataProperty =
            DependencyProperty.Register("Data", typeof(IEnumerable<ChartDataPoint>), typeof(PieChart),
                new PropertyMetadata(null, OnDataChanged));

        public static readonly DependencyProperty ShowLabelsProperty =
            DependencyProperty.Register("ShowLabels", typeof(bool), typeof(PieChart),
                new PropertyMetadata(true, OnLayoutChanged));

        public static readonly DependencyProperty ShowLegendProperty =
            DependencyProperty.Register("ShowLegend", typeof(bool), typeof(PieChart),
                new PropertyMetadata(true, OnLayoutChanged));

        public IEnumerable<ChartDataPoint> Data
        {
            get => (IEnumerable<ChartDataPoint>)GetValue(DataProperty);
            set => SetValue(DataProperty, value);
        }

        public bool ShowLabels
        {
            get => (bool)GetValue(ShowLabelsProperty);
            set => SetValue(ShowLabelsProperty, value);
        }

        public bool ShowLegend
        {
            get => (bool)GetValue(ShowLegendProperty);
            set => SetValue(ShowLegendProperty, value);
        }

        static PieChart()
        {
            DefaultStyleKeyProperty.OverrideMetadata(typeof(PieChart), new FrameworkPropertyMetadata(typeof(PieChart)));
        }

        public override void OnApplyTemplate()
        {
            base.OnApplyTemplate();
            
            _chartCanvas = GetTemplateChild("PART_ChartCanvas") as Canvas;
            _legend = GetTemplateChild("PART_Legend") as StackPanel;
            
            UpdateChart();
        }

        private static void OnDataChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is PieChart chart)
                chart.UpdateChart();
        }

        private static void OnLayoutChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is PieChart chart)
                chart.UpdateChart();
        }

        private void UpdateChart()
        {
            if (_chartCanvas == null || Data == null)
                return;

            _chartCanvas.Children.Clear();
            _legend?.Children.Clear();

            var dataList = Data.Where(d => d.Value > 0).ToList();
            if (!dataList.Any())
                return;

            var total = dataList.Sum(d => d.Value);
            var centerX = _chartCanvas.ActualWidth / 2;
            var centerY = _chartCanvas.ActualHeight / 2;
            var radius = Math.Min(centerX, centerY) * 0.8;

            if (centerX == 0 || centerY == 0)
            {
                // Canvas not sized yet, wait for next layout pass
                Dispatcher.BeginInvoke(new Action(UpdateChart), System.Windows.Threading.DispatcherPriority.Render);
                return;
            }

            double currentAngle = 0;

            foreach (var dataPoint in dataList)
            {
                var sweepAngle = (dataPoint.Value / total) * 360;
                
                // Create pie slice
                var slice = CreatePieSlice(centerX, centerY, radius, currentAngle, sweepAngle, 
                    GetBrushFromColor(dataPoint.Color));
                
                _chartCanvas.Children.Add(slice);

                // Add label if enabled
                if (ShowLabels && sweepAngle > 10) // Only show labels for slices larger than 10 degrees
                {
                    var labelAngle = currentAngle + (sweepAngle / 2);
                    var labelRadius = radius * 0.7;
                    var labelX = centerX + labelRadius * Math.Cos(Math.PI * labelAngle / 180);
                    var labelY = centerY + labelRadius * Math.Sin(Math.PI * labelAngle / 180);

                    var label = new TextBlock
                    {
                        Text = $"{dataPoint.Percentage:F1}%",
                        Foreground = Brushes.White,
                        FontSize = 10,
                        FontWeight = FontWeights.Bold,
                        HorizontalAlignment = HorizontalAlignment.Center,
                        VerticalAlignment = VerticalAlignment.Center
                    };

                    Canvas.SetLeft(label, labelX - 15);
                    Canvas.SetTop(label, labelY - 8);
                    _chartCanvas.Children.Add(label);
                }

                // Add legend item
                if (ShowLegend && _legend != null)
                {
                    var legendItem = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(0, 2, 0, 2) };
                    
                    var colorRect = new Rectangle
                    {
                        Width = 12,
                        Height = 12,
                        Fill = GetBrushFromColor(dataPoint.Color),
                        Margin = new Thickness(0, 0, 6, 0)
                    };
                    
                    var text = new TextBlock
                    {
                        Text = $"{dataPoint.Label} ({dataPoint.Value:N0})",
                        FontSize = 11,
                        Foreground = new SolidColorBrush(Color.FromRgb(160, 174, 192)),
                        VerticalAlignment = VerticalAlignment.Center
                    };

                    legendItem.Children.Add(colorRect);
                    legendItem.Children.Add(text);
                    _legend.Children.Add(legendItem);
                }

                currentAngle += sweepAngle;
            }
        }

        private Path CreatePieSlice(double centerX, double centerY, double radius, double startAngle, double sweepAngle, Brush fill)
        {
            var startAngleRad = Math.PI * startAngle / 180;
            var endAngleRad = Math.PI * (startAngle + sweepAngle) / 180;

            var x1 = centerX + radius * Math.Cos(startAngleRad);
            var y1 = centerY + radius * Math.Sin(startAngleRad);
            var x2 = centerX + radius * Math.Cos(endAngleRad);
            var y2 = centerY + radius * Math.Sin(endAngleRad);

            var geometry = new PathGeometry();
            var figure = new PathFigure { StartPoint = new Point(centerX, centerY) };
            
            figure.Segments.Add(new LineSegment(new Point(x1, y1), true));
            figure.Segments.Add(new ArcSegment(new Point(x2, y2), new Size(radius, radius), 0, 
                sweepAngle > 180, SweepDirection.Clockwise, true));
            figure.Segments.Add(new LineSegment(new Point(centerX, centerY), true));
            
            geometry.Figures.Add(figure);

            return new Path
            {
                Data = geometry,
                Fill = fill,
                Stroke = new SolidColorBrush(Color.FromRgb(45, 55, 72)),
                StrokeThickness = 1
            };
        }

        private Brush GetBrushFromColor(string colorStr)
        {
            try
            {
                if (string.IsNullOrEmpty(colorStr))
                    return new SolidColorBrush(Color.FromRgb(99, 102, 241));

                if (colorStr.StartsWith("#"))
                {
                    var color = (Color)ColorConverter.ConvertFromString(colorStr);
                    return new SolidColorBrush(color);
                }
                
                return new SolidColorBrush(Color.FromRgb(99, 102, 241));
            }
            catch
            {
                return new SolidColorBrush(Color.FromRgb(99, 102, 241));
            }
        }

        protected override void OnRenderSizeChanged(SizeChangedInfo sizeInfo)
        {
            base.OnRenderSizeChanged(sizeInfo);
            Dispatcher.BeginInvoke(new Action(UpdateChart), System.Windows.Threading.DispatcherPriority.Render);
        }
    }
}