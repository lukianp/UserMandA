using System.Windows;
using System.Windows.Media;

namespace MandADiscoverySuite.Helpers
{
    /// <summary>
    /// Optimizes brushes by freezing them for better performance
    /// </summary>
    public static class BrushOptimizer
    {
        /// <summary>
        /// Freezes all brushes in application resources for improved rendering performance
        /// </summary>
        public static void FreezeApplicationBrushes(Application app)
        {
            if (app?.Resources == null) return;

            FreezeResourceDictionary(app.Resources);
        }

        /// <summary>
        /// Recursively freezes all brushes in a resource dictionary
        /// </summary>
        private static void FreezeResourceDictionary(ResourceDictionary resources)
        {
            if (resources == null) return;

            // Freeze brushes in current dictionary
            foreach (var key in resources.Keys)
            {
                if (resources[key] is Brush brush && brush.CanFreeze && !brush.IsFrozen)
                {
                    brush.Freeze();
                }
                else if (resources[key] is Pen pen && pen.CanFreeze && !pen.IsFrozen)
                {
                    pen.Freeze();
                }
                else if (resources[key] is Drawing drawing && drawing.CanFreeze && !drawing.IsFrozen)
                {
                    drawing.Freeze();
                }
                else if (resources[key] is DrawingImage drawingImage && drawingImage.CanFreeze && !drawingImage.IsFrozen)
                {
                    drawingImage.Freeze();
                }
                else if (resources[key] is ImageSource imageSource && imageSource.CanFreeze && !imageSource.IsFrozen)
                {
                    imageSource.Freeze();
                }
                else if (resources[key] is Transform transform && transform.CanFreeze && !transform.IsFrozen)
                {
                    transform.Freeze();
                }
                else if (resources[key] is Geometry geometry && geometry.CanFreeze && !geometry.IsFrozen)
                {
                    geometry.Freeze();
                }
            }

            // Recursively freeze merged dictionaries
            foreach (var mergedDict in resources.MergedDictionaries)
            {
                FreezeResourceDictionary(mergedDict);
            }
        }

        /// <summary>
        /// Creates and freezes a solid color brush
        /// </summary>
        public static SolidColorBrush CreateFrozenBrush(Color color)
        {
            var brush = new SolidColorBrush(color);
            if (brush.CanFreeze)
                brush.Freeze();
            return brush;
        }

        /// <summary>
        /// Creates and freezes a linear gradient brush
        /// </summary>
        public static LinearGradientBrush CreateFrozenGradientBrush(GradientStopCollection stops, Point startPoint, Point endPoint)
        {
            if (stops.CanFreeze && !stops.IsFrozen)
                stops.Freeze();

            var brush = new LinearGradientBrush(stops, startPoint, endPoint);
            if (brush.CanFreeze)
                brush.Freeze();
            return brush;
        }
    }
}