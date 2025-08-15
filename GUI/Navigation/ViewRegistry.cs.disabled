using System;
using System.Collections.Generic;
using System.Windows.Controls;
using MandADiscoverySuite.Views;
using MandADiscoverySuite.Views.Placeholders;

namespace MandADiscoverySuite.Navigation
{
    /// <summary>
    /// Centralized view registry for resolving navigation targets to actual views
    /// </summary>
    public static class ViewRegistry
    {
        /// <summary>
        /// Factories for creating views by navigation key
        /// </summary>
        public static readonly Dictionary<string, Func<UserControl>> Factories = new(StringComparer.OrdinalIgnoreCase);

        /// <summary>
        /// Register a view factory for a navigation key
        /// </summary>
        public static void Register(string key, Func<UserControl> factory)
        {
            Factories[key] = factory;
        }

        /// <summary>
        /// Resolve a navigation key to a view instance, or create a placeholder if not found
        /// </summary>
        public static UserControl Resolve(string key)
        {
            if (Factories.TryGetValue(key, out var factory))
            {
                try
                {
                    return factory();
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"ViewRegistry: Failed to create view for key '{key}': {ex.Message}");
                    return CreateMissingView(key, $"Error creating view: {ex.Message}");
                }
            }

            System.Diagnostics.Debug.WriteLine($"ViewRegistry: No factory registered for key '{key}'");
            return CreateMissingView(key, "No factory registered");
        }

        /// <summary>
        /// Create a placeholder view for missing registrations
        /// </summary>
        private static UserControl CreateMissingView(string key, string reason)
        {
            return new MissingView 
            { 
                DataContext = new ViewModels.Placeholders.MissingViewModel 
                { 
                    Key = key, 
                    Reason = reason 
                } 
            };
        }

        /// <summary>
        /// Check if a key is registered
        /// </summary>
        public static bool IsRegistered(string key)
        {
            return Factories.ContainsKey(key);
        }

        /// <summary>
        /// Get all registered keys
        /// </summary>
        public static IEnumerable<string> GetRegisteredKeys()
        {
            return Factories.Keys;
        }
    }
}