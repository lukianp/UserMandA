using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Markup;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace MandADiscoverySuite.Tests
{
    [TestClass]
    public class NavigationDiagnosticTests
    {
        private const string BUILD_VIEWS_PATH = @"C:\enterprisediscovery\Views";
        private const string WORKSPACE_VIEWS_PATH = @"D:\Scripts\UserMandA\GUI\Views";

        private static readonly string[] MAIN_VIEWS = {
            "DashboardView.xaml",
            "UsersView.xaml",
            "DiscoveryView.xaml",
            "ComputersView.xaml",
            "InfrastructureViewNew.xaml", // Note: code looks for "InfrastructureView" but file is "InfrastructureViewNew"
            "GroupsView.xaml",
            "WaveView.xaml", // Note: code looks for "WavesView" but file is "WaveView"
            "MigrateView.xaml",
            "ReportsView.xaml",
            "AnalyticsView.xaml",
            "SettingsView.xaml",
            "ApplicationsView.xaml",
            "DomainDiscoveryView.xaml",
            "FileServersView.xaml",
            "DatabasesView.xaml",
            "SecurityView.xaml"
        };

        [TestInitialize]
        public void TestInitialize()
        {
            // Ensure WPF application context is available for XAML parsing
            if (Application.Current == null)
            {
                new Application();
            }
        }

        [TestMethod]
        public void Test_ViewsDirectoryDeployment()
        {
            var results = new List<string>();

            // Check if Views directory exists in build output
            if (!Directory.Exists(BUILD_VIEWS_PATH))
            {
                results.Add($"CRITICAL: Views directory missing in build output: {BUILD_VIEWS_PATH}");
            }
            else
            {
                results.Add($"✓ Views directory found in build output: {BUILD_VIEWS_PATH}");
            }

            // Check if Views directory exists in workspace
            if (!Directory.Exists(WORKSPACE_VIEWS_PATH))
            {
                results.Add($"ERROR: Views directory missing in workspace: {WORKSPACE_VIEWS_PATH}");
            }
            else
            {
                results.Add($"✓ Views directory found in workspace: {WORKSPACE_VIEWS_PATH}");
            }

            // Compare file counts
            if (Directory.Exists(BUILD_VIEWS_PATH) && Directory.Exists(WORKSPACE_VIEWS_PATH))
            {
                var buildFiles = Directory.GetFiles(BUILD_VIEWS_PATH, "*.xaml", SearchOption.TopDirectoryOnly);
                var workspaceFiles = Directory.GetFiles(WORKSPACE_VIEWS_PATH, "*.xaml", SearchOption.TopDirectoryOnly);

                results.Add($"Build output XAML files: {buildFiles.Length}");
                results.Add($"Workspace XAML files: {workspaceFiles.Length}");

                if (buildFiles.Length != workspaceFiles.Length)
                {
                    results.Add("WARNING: File count mismatch between workspace and build output");
                }
            }

            // Log results
            foreach (var result in results)
            {
                Console.WriteLine(result);
            }

            // Test passes if build directory exists (critical requirement)
            Assert.IsTrue(Directory.Exists(BUILD_VIEWS_PATH),
                $"Views directory must exist in build output: {BUILD_VIEWS_PATH}");
        }

        [TestMethod]
        public void Test_MainViewFilesPresent()
        {
            var missingFiles = new List<string>();
            var presentFiles = new List<string>();

            foreach (var viewFile in MAIN_VIEWS)
            {
                var buildPath = Path.Combine(BUILD_VIEWS_PATH, viewFile);

                if (File.Exists(buildPath))
                {
                    presentFiles.Add(viewFile);
                }
                else
                {
                    missingFiles.Add(viewFile);
                }
            }

            Console.WriteLine($"Present files ({presentFiles.Count}):");
            foreach (var file in presentFiles)
            {
                Console.WriteLine($"  ✓ {file}");
            }

            Console.WriteLine($"Missing files ({missingFiles.Count}):");
            foreach (var file in missingFiles)
            {
                Console.WriteLine($"  ✗ {file}");
            }

            // Identify naming mismatches that could cause navigation failures
            if (missingFiles.Any())
            {
                Console.WriteLine("\nPOTENTIAL NAMING MISMATCHES:");

                // Check for common naming pattern issues
                var allBuildFiles = Directory.Exists(BUILD_VIEWS_PATH)
                    ? Directory.GetFiles(BUILD_VIEWS_PATH, "*.xaml").Select(Path.GetFileName).ToList()
                    : new List<string>();

                foreach (var missing in missingFiles)
                {
                    var baseName = Path.GetFileNameWithoutExtension(missing);
                    var similarFiles = allBuildFiles.Where(f =>
                        f.Contains(baseName.Replace("View", "")) ||
                        baseName.Contains(Path.GetFileNameWithoutExtension(f).Replace("View", ""))
                    ).ToList();

                    if (similarFiles.Any())
                    {
                        Console.WriteLine($"  {missing} -> Similar files found: {string.Join(", ", similarFiles)}");
                    }
                }
            }

            Assert.IsFalse(missingFiles.Any(),
                $"Missing critical view files: {string.Join(", ", missingFiles)}");
        }

        [TestMethod]
        public void Test_XamlParsingForMainViews()
        {
            var parsingResults = new Dictionary<string, (bool Success, string Error)>();

            foreach (var viewFile in MAIN_VIEWS)
            {
                var buildPath = Path.Combine(BUILD_VIEWS_PATH, viewFile);

                if (!File.Exists(buildPath))
                {
                    parsingResults[viewFile] = (false, "File not found");
                    continue;
                }

                try
                {
                    // Attempt to parse XAML without instantiating
                    var xamlContent = File.ReadAllText(buildPath);

                    // Basic XAML syntax validation
                    if (string.IsNullOrWhiteSpace(xamlContent))
                    {
                        parsingResults[viewFile] = (false, "Empty XAML file");
                        continue;
                    }

                    if (!xamlContent.TrimStart().StartsWith("<"))
                    {
                        parsingResults[viewFile] = (false, "Invalid XAML format - does not start with XML tag");
                        continue;
                    }

                    // Try to parse as XAML (without instantiation to avoid dependency issues)
                    using (var stringReader = new StringReader(xamlContent))
                    {
                        try
                        {
                            var reader = System.Xml.XmlReader.Create(stringReader);
                            while (reader.Read()) { } // Parse through the entire document
                            parsingResults[viewFile] = (true, null);
                        }
                        catch (Exception xmlEx)
                        {
                            parsingResults[viewFile] = (false, $"XML parsing error: {xmlEx.Message}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    parsingResults[viewFile] = (false, $"General error: {ex.Message}");
                }
            }

            // Report results
            var successful = parsingResults.Where(r => r.Value.Success).ToList();
            var failed = parsingResults.Where(r => !r.Value.Success).ToList();

            Console.WriteLine($"XAML Parsing Results:");
            Console.WriteLine($"Successful: {successful.Count}/{parsingResults.Count}");
            Console.WriteLine($"Failed: {failed.Count}/{parsingResults.Count}");

            Console.WriteLine("\nSuccessful parsings:");
            foreach (var result in successful)
            {
                Console.WriteLine($"  ✓ {result.Key}");
            }

            Console.WriteLine("\nFailed parsings:");
            foreach (var result in failed)
            {
                Console.WriteLine($"  ✗ {result.Key}: {result.Value.Error}");
            }

            Assert.IsTrue(failed.Count == 0,
                $"XAML parsing failed for: {string.Join(", ", failed.Select(f => $"{f.Key} ({f.Value.Error})"))}");
        }

        [TestMethod]
        public void Test_ViewInstantiation()
        {
            var instantiationResults = new Dictionary<string, (bool Success, string Error)>();

            foreach (var viewFile in MAIN_VIEWS)
            {
                var buildPath = Path.Combine(BUILD_VIEWS_PATH, viewFile);

                if (!File.Exists(buildPath))
                {
                    instantiationResults[viewFile] = (false, "File not found");
                    continue;
                }

                try
                {
                    // Attempt to load and instantiate the XAML
                    using (var fileStream = new FileStream(buildPath, FileMode.Open, FileAccess.Read))
                    {
                        var element = (FrameworkElement)XamlReader.Load(fileStream);

                        // Basic validation that the element was created
                        if (element == null)
                        {
                            instantiationResults[viewFile] = (false, "XamlReader.Load returned null");
                        }
                        else
                        {
                            instantiationResults[viewFile] = (true, $"Type: {element.GetType().Name}");
                        }
                    }
                }
                catch (XamlParseException xamlEx)
                {
                    instantiationResults[viewFile] = (false, $"XAML Parse Exception: {xamlEx.Message} (Line {xamlEx.LineNumber}, Position {xamlEx.LinePosition})");
                }
                catch (FileNotFoundException fnfEx)
                {
                    instantiationResults[viewFile] = (false, $"File Not Found: {fnfEx.Message}");
                }
                catch (Exception ex)
                {
                    instantiationResults[viewFile] = (false, $"Exception: {ex.GetType().Name}: {ex.Message}");
                }
            }

            // Report results
            var successful = instantiationResults.Where(r => r.Value.Success).ToList();
            var failed = instantiationResults.Where(r => !r.Value.Success).ToList();

            Console.WriteLine($"View Instantiation Results:");
            Console.WriteLine($"Successful: {successful.Count}/{instantiationResults.Count}");
            Console.WriteLine($"Failed: {failed.Count}/{instantiationResults.Count}");

            Console.WriteLine("\nSuccessful instantiations:");
            foreach (var result in successful)
            {
                Console.WriteLine($"  ✓ {result.Key}: {result.Value.Error}");
            }

            Console.WriteLine("\nFailed instantiations:");
            foreach (var result in failed)
            {
                Console.WriteLine($"  ✗ {result.Key}: {result.Value.Error}");
            }

            // Report detailed failure analysis
            if (failed.Any())
            {
                Console.WriteLine("\nDETAILED FAILURE ANALYSIS:");
                foreach (var failure in failed)
                {
                    Console.WriteLine($"\n{failure.Key}:");
                    Console.WriteLine($"  Error: {failure.Value.Error}");

                    // Additional analysis for common issues
                    if (failure.Value.Error.Contains("Cannot locate resource"))
                    {
                        Console.WriteLine("  → This suggests missing dependencies or resource files");
                    }
                    else if (failure.Value.Error.Contains("FileNotFoundException"))
                    {
                        Console.WriteLine("  → This suggests the view file wasn't properly deployed");
                    }
                    else if (failure.Value.Error.Contains("XamlParseException"))
                    {
                        Console.WriteLine("  → This suggests syntax errors in the XAML");
                    }
                }
            }

            // Test fails if any critical views can't be instantiated
            Assert.IsTrue(failed.Count == 0,
                $"View instantiation failed for: {string.Join(", ", failed.Select(f => f.Key))}");
        }

        [TestMethod]
        public void Test_NavigationNamingMismatch()
        {
            var navigationMismatches = new List<string>();

            // Check for known naming mismatches between code and actual files
            var codeExpected = new Dictionary<string, string>
            {
                ["InfrastructureView"] = "InfrastructureViewNew.xaml",
                ["WavesView"] = "WaveView.xaml"
            };

            foreach (var mismatch in codeExpected)
            {
                var expectedByCode = mismatch.Key + ".xaml";
                var actualFile = mismatch.Value;
                var buildPath = Path.Combine(BUILD_VIEWS_PATH, actualFile);

                if (File.Exists(buildPath))
                {
                    navigationMismatches.Add($"Navigation expects '{expectedByCode}' but file is '{actualFile}'");
                }
                else
                {
                    navigationMismatches.Add($"Navigation expects '{expectedByCode}', file '{actualFile}' also missing");
                }
            }

            Console.WriteLine("Navigation Naming Mismatch Analysis:");
            if (navigationMismatches.Any())
            {
                Console.WriteLine("CRITICAL NAVIGATION ISSUES FOUND:");
                foreach (var issue in navigationMismatches)
                {
                    Console.WriteLine($"  ✗ {issue}");
                }

                Console.WriteLine("\nRECOMMENDATIONS:");
                Console.WriteLine("1. Update MainWindow_Loaded FindName calls to match actual file names");
                Console.WriteLine("2. Or rename XAML files to match what the code expects");
            }
            else
            {
                Console.WriteLine("✓ No obvious naming mismatches detected");
            }

            // This is a warning test - log issues but don't fail the test suite
            foreach (var issue in navigationMismatches)
            {
                Console.WriteLine($"WARNING: {issue}");
            }
        }

        [TestMethod]
        public void Test_RequiredAssemblies()
        {
            var requiredAssemblies = new List<string>
            {
                "PresentationCore",
                "PresentationFramework",
                "WindowsBase",
                "System.Xaml",
                "MandADiscoverySuite" // The main application assembly
            };

            var assemblyResults = new Dictionary<string, bool>();

            foreach (var assemblyName in requiredAssemblies)
            {
                try
                {
                    var assembly = Assembly.LoadWithPartialName(assemblyName);
                    assemblyResults[assemblyName] = assembly != null;
                }
                catch
                {
                    assemblyResults[assemblyName] = false;
                }
            }

            Console.WriteLine("Required Assembly Check:");
            foreach (var result in assemblyResults)
            {
                var status = result.Value ? "✓" : "✗";
                Console.WriteLine($"  {status} {result.Key}: {(result.Value ? "Available" : "Missing")}");
            }

            var missingAssemblies = assemblyResults.Where(r => !r.Value).Select(r => r.Key).ToList();

            Assert.IsFalse(missingAssemblies.Any(),
                $"Missing required assemblies: {string.Join(", ", missingAssemblies)}");
        }

        [TestMethod]
        public void Test_ResourceDictionaryLoading()
        {
            var resourceResults = new List<string>();

            try
            {
                // Check if we can access Application resources
                if (Application.Current?.Resources != null)
                {
                    resourceResults.Add($"✓ Application.Current.Resources available ({Application.Current.Resources.Count} resources)");

                    // Check for common resource types that views might depend on
                    var commonResourceTypes = new[] { "Style", "DataTemplate", "ControlTemplate", "Brush", "Color" };
                    var resourceTypeCounts = new Dictionary<string, int>();

                    foreach (var resource in Application.Current.Resources.Values)
                    {
                        var typeName = resource.GetType().Name;
                        if (commonResourceTypes.Contains(typeName))
                        {
                            resourceTypeCounts[typeName] = resourceTypeCounts.GetValueOrDefault(typeName, 0) + 1;
                        }
                    }

                    foreach (var typeCount in resourceTypeCounts)
                    {
                        resourceResults.Add($"  - {typeCount.Key}: {typeCount.Value}");
                    }
                }
                else
                {
                    resourceResults.Add("✗ Application.Current.Resources not available");
                }

                // Try to load a resource dictionary manually if possible
                var appXamlPath = Path.Combine(Path.GetDirectoryName(BUILD_VIEWS_PATH), "App.xaml");
                if (File.Exists(appXamlPath))
                {
                    resourceResults.Add($"✓ App.xaml found at: {appXamlPath}");
                }
                else
                {
                    resourceResults.Add($"✗ App.xaml not found at: {appXamlPath}");
                }
            }
            catch (Exception ex)
            {
                resourceResults.Add($"✗ Exception checking resources: {ex.Message}");
            }

            Console.WriteLine("Resource Dictionary Analysis:");
            foreach (var result in resourceResults)
            {
                Console.WriteLine(result);
            }

            // This test is informational - we don't fail on resource issues
            // as views might have their own resource loading mechanisms
        }
    }
}