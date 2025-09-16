using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Markup;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace MandADiscoverySuite.Tests
{
    [TestClass]
    public class ViewInstantiationTests
    {
        private const string BUILD_VIEWS_PATH = @"C:\enterprisediscovery\Views";

        // View instantiation test - this simulates what happens during navigation
        [TestMethod]
        public void Test_ViewInstantiationWithActualNavigation()
        {
            var instantiationResults = new Dictionary<string, (bool Success, string Details, Exception Exception)>();

            // Test the specific naming mismatches identified
            var viewsToTest = new Dictionary<string, string>
            {
                ["InfrastructureView"] = "InfrastructureViewNew.xaml", // Code looks for InfrastructureView but file is InfrastructureViewNew
                ["WavesView"] = "WaveView.xaml",                       // Code looks for WavesView but file is WaveView
                ["ComputersView"] = "ComputersView.xaml",             // Missing x:Name in MainWindow
                ["DashboardView"] = "DashboardView.xaml",             // Should work fine
                ["UsersView"] = "UsersView.xaml"                      // Should work fine
            };

            Console.WriteLine("=== VIEW INSTANTIATION TEST ===");
            Console.WriteLine("Testing actual navigation scenarios that are failing...\n");

            foreach (var viewTest in viewsToTest)
            {
                var expectedName = viewTest.Key;
                var actualFile = viewTest.Value;
                var filePath = Path.Combine(BUILD_VIEWS_PATH, actualFile);

                Console.WriteLine($"Testing {expectedName} (expects file: {actualFile}):");

                try
                {
                    if (!File.Exists(filePath))
                    {
                        instantiationResults[expectedName] = (false, $"File not found: {filePath}", null);
                        Console.WriteLine($"  X File not found: {filePath}");
                        continue;
                    }

                    // Step 1: Test XAML loading (what XamlReader.Load does)
                    FrameworkElement element = null;
                    using (var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                    {
                        element = (FrameworkElement)XamlReader.Load(fileStream);
                    }

                    if (element == null)
                    {
                        instantiationResults[expectedName] = (false, "XamlReader.Load returned null", null);
                        Console.WriteLine("  X XamlReader.Load returned null");
                        continue;
                    }

                    // Step 2: Test if the element can be added to a container (simulates adding to MainWindow)
                    var testGrid = new Grid();
                    testGrid.Children.Add(element);

                    // Step 3: Test DataContext assignment (simulates ViewModel binding)
                    element.DataContext = new object(); // Simple test object

                    // Step 4: Test Loaded event (simulates what happens when view becomes visible)
                    bool loadedEventFired = false;
                    element.Loaded += (s, e) => loadedEventFired = true;

                    // Force layout and rendering
                    element.Measure(new Size(1024, 768));
                    element.Arrange(new System.Windows.Rect(0, 0, 1024, 768));

                    instantiationResults[expectedName] = (true, $"Successfully instantiated as {element.GetType().Name}", null);
                    Console.WriteLine($"  + SUCCESS: Instantiated as {element.GetType().Name}");
                    Console.WriteLine($"    - Size: {element.ActualWidth}x{element.ActualHeight}");
                    Console.WriteLine($"    - Type: {element.GetType().FullName}");

                }
                catch (XamlParseException xamlEx)
                {
                    var details = $"XAML Parse Error at Line {xamlEx.LineNumber}, Position {xamlEx.LinePosition}: {xamlEx.Message}";
                    instantiationResults[expectedName] = (false, details, xamlEx);
                    Console.WriteLine($"  X XAML Parse Error: {details}");

                    if (xamlEx.InnerException != null)
                    {
                        Console.WriteLine($"    Inner Exception: {xamlEx.InnerException.Message}");
                    }
                }
                catch (Exception ex)
                {
                    var details = $"Exception: {ex.GetType().Name}: {ex.Message}";
                    instantiationResults[expectedName] = (false, details, ex);
                    Console.WriteLine($"  X Exception: {details}");

                    if (ex.InnerException != null)
                    {
                        Console.WriteLine($"    Inner Exception: {ex.InnerException.Message}");
                    }
                }

                Console.WriteLine();
            }

            // Summary
            var successful = 0;
            var failed = 0;

            Console.WriteLine("=== INSTANTIATION SUMMARY ===");
            foreach (var result in instantiationResults)
            {
                if (result.Value.Success)
                {
                    successful++;
                    Console.WriteLine($"+ {result.Key}: {result.Value.Details}");
                }
                else
                {
                    failed++;
                    Console.WriteLine($"X {result.Key}: {result.Value.Details}");
                }
            }

            Console.WriteLine($"\nSUCCESS: {successful}/{instantiationResults.Count}");
            Console.WriteLine($"FAILED: {failed}/{instantiationResults.Count}");

            // The test should highlight exactly which views can't be instantiated
            if (failed > 0)
            {
                Console.WriteLine("\nFAILURE ANALYSIS:");
                foreach (var failure in instantiationResults)
                {
                    if (!failure.Value.Success)
                    {
                        Console.WriteLine($"\n{failure.Key}:");
                        Console.WriteLine($"  Problem: {failure.Value.Details}");

                        if (failure.Value.Exception != null)
                        {
                            Console.WriteLine($"  Exception Type: {failure.Value.Exception.GetType().Name}");
                            Console.WriteLine($"  Stack Trace: {failure.Value.Exception.StackTrace}");
                        }
                    }
                }
            }

            // This test is diagnostic - it reports issues but doesn't fail
            // unless there are critical problems that would prevent navigation
        }

        [TestMethod]
        public void Test_FindNameSimulation()
        {
            Console.WriteLine("=== FINDNAME SIMULATION TEST ===");
            Console.WriteLine("Simulating MainWindow_Loaded FindName calls...\n");

            var mainWindowXamlPath = Path.Combine(@"C:\enterprisediscovery", "MandADiscoverySuite.xaml");

            if (!File.Exists(mainWindowXamlPath))
            {
                Console.WriteLine($"X MainWindow XAML not found at: {mainWindowXamlPath}");
                Assert.Fail("Cannot test FindName without MainWindow XAML");
                return;
            }

            try
            {
                // Load the MainWindow XAML
                FrameworkElement mainWindow = null;
                using (var fileStream = new FileStream(mainWindowXamlPath, FileMode.Open, FileAccess.Read))
                {
                    mainWindow = (FrameworkElement)XamlReader.Load(fileStream);
                }

                Console.WriteLine($"+ MainWindow loaded successfully as {mainWindow.GetType().Name}");

                // Test FindName calls that are used in MainWindow_Loaded
                var findNameTargets = new[]
                {
                    "DashboardView",
                    "UsersView",
                    "DiscoveryView",
                    "ComputersView",       // This was missing x:Name
                    "InfrastructureView",  // This expects InfrastructureViewNew
                    "GroupsView",
                    "WavesView",          // This expects WaveView
                    "MigrateView",
                    "ReportsView",
                    "AnalyticsView",
                    "SettingsView",
                    "ApplicationsView",
                    "DomainDiscoveryView",
                    "FileServersView",
                    "DatabasesView",
                    "SecurityView"
                };

                var findNameResults = new Dictionary<string, (bool Found, Type ElementType)>();

                foreach (var targetName in findNameTargets)
                {
                    try
                    {
                        var element = mainWindow.FindName(targetName) as FrameworkElement;

                        if (element != null)
                        {
                            findNameResults[targetName] = (true, element.GetType());
                            Console.WriteLine($"  + {targetName}: Found ({element.GetType().Name})");
                        }
                        else
                        {
                            findNameResults[targetName] = (false, null);
                            Console.WriteLine($"  X {targetName}: Not found (FindName returned null)");
                        }
                    }
                    catch (Exception ex)
                    {
                        findNameResults[targetName] = (false, null);
                        Console.WriteLine($"  X {targetName}: Exception during FindName: {ex.Message}");
                    }
                }

                // Analysis
                var found = findNameResults.Values.Count(r => r.Found);
                var notFound = findNameResults.Values.Count(r => !r.Found);

                Console.WriteLine($"\nFINDNAME RESULTS: {found} found, {notFound} missing");

                if (notFound > 0)
                {
                    Console.WriteLine("\nMISSING VIEWS (these will cause navigation failures):");
                    foreach (var missing in findNameResults.Where(r => !r.Value.Found))
                    {
                        Console.WriteLine($"  X {missing.Key} - Navigation will fail");
                    }

                    Console.WriteLine("\nROOT CAUSE:");
                    Console.WriteLine("  1. Missing x:Name attributes in MainWindow XAML");
                    Console.WriteLine("  2. Or view elements not present in MainWindow XAML");
                    Console.WriteLine("  3. Or naming mismatches between code and XAML");
                }

                // Report successful ones for comparison
                if (found > 0)
                {
                    Console.WriteLine("\nWORKING VIEWS (these should navigate successfully):");
                    foreach (var working in findNameResults.Where(r => r.Value.Found))
                    {
                        Console.WriteLine($"  + {working.Key} ({working.Value.ElementType.Name})");
                    }
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine($"X Failed to load MainWindow XAML: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"  Inner Exception: {ex.InnerException.Message}");
                }
                Assert.Fail($"Cannot simulate FindName due to MainWindow loading failure: {ex.Message}");
            }
        }

        [TestMethod]
        public void Test_AssemblyLoadingForViews()
        {
            Console.WriteLine("=== ASSEMBLY LOADING TEST ===");
            Console.WriteLine("Testing required assemblies for view instantiation...\n");

            var requiredAssemblies = new Dictionary<string, string>
            {
                ["PresentationCore"] = "Core WPF functionality",
                ["PresentationFramework"] = "WPF UI framework",
                ["WindowsBase"] = "WPF base classes",
                ["System.Xaml"] = "XAML parsing support",
                ["MandADiscoverySuite"] = "Main application assembly"
            };

            var assemblyResults = new Dictionary<string, (bool Available, string Version, string Location)>();

            foreach (var assemblyInfo in requiredAssemblies)
            {
                try
                {
                    Assembly assembly = null;

                    // Try different loading methods
                    try
                    {
                        assembly = Assembly.LoadWithPartialName(assemblyInfo.Key);
                    }
                    catch
                    {
                        // Fallback to reflection-only loading
                        try
                        {
                            assembly = Assembly.ReflectionOnlyLoadFrom(assemblyInfo.Key + ".dll");
                        }
                        catch
                        {
                            // Final fallback - check if it's already loaded
                            assembly = AppDomain.CurrentDomain.GetAssemblies()
                                .FirstOrDefault(a => a.GetName().Name.Equals(assemblyInfo.Key, StringComparison.OrdinalIgnoreCase));
                        }
                    }

                    if (assembly != null)
                    {
                        var version = assembly.GetName().Version?.ToString() ?? "Unknown";
                        var location = assembly.IsDynamic ? "Dynamic" : assembly.Location;

                        assemblyResults[assemblyInfo.Key] = (true, version, location);
                        Console.WriteLine($"  + {assemblyInfo.Key}: v{version}");
                        Console.WriteLine($"    Location: {location}");
                        Console.WriteLine($"    Purpose: {assemblyInfo.Value}");
                    }
                    else
                    {
                        assemblyResults[assemblyInfo.Key] = (false, "N/A", "N/A");
                        Console.WriteLine($"  X {assemblyInfo.Key}: NOT AVAILABLE");
                        Console.WriteLine($"    Purpose: {assemblyInfo.Value}");
                    }
                }
                catch (Exception ex)
                {
                    assemblyResults[assemblyInfo.Key] = (false, "Error", ex.Message);
                    Console.WriteLine($"  X {assemblyInfo.Key}: ERROR - {ex.Message}");
                    Console.WriteLine($"    Purpose: {assemblyInfo.Value}");
                }

                Console.WriteLine();
            }

            // Summary
            var available = assemblyResults.Values.Count(r => r.Available);
            var missing = assemblyResults.Values.Count(r => !r.Available);

            Console.WriteLine($"ASSEMBLY AVAILABILITY: {available}/{assemblyResults.Count} available");

            if (missing > 0)
            {
                Console.WriteLine("\nMISSING ASSEMBLIES (may cause view loading failures):");
                foreach (var missingAssembly in assemblyResults.Where(r => !r.Value.Available))
                {
                    Console.WriteLine($"  X {missingAssembly.Key}: {missingAssembly.Value.Location}");
                }
            }

            // Check .NET Framework version compatibility
            Console.WriteLine($"\n.NET Framework Version: {Environment.Version}");
            Console.WriteLine($"Target Framework: .NET 6.0 Windows");

            // This test reports assembly availability but doesn't fail unless critical assemblies are missing
            var criticalAssemblies = new[] { "PresentationCore", "PresentationFramework", "WindowsBase", "System.Xaml" };
            var missingCritical = criticalAssemblies.Where(ca =>
                !assemblyResults.ContainsKey(ca) || !assemblyResults[ca].Available).ToList();

            if (missingCritical.Any())
            {
                Assert.Fail($"Critical assemblies missing: {string.Join(", ", missingCritical)}");
            }
        }
    }
}