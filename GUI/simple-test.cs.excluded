using System;
using System.IO;
using System.Windows;

namespace MandADiscoverySuite.Test
{
    public class SimpleTest
    {
        [STAThread]
        public static void Main()
        {
            try
            {
                var log = @"C:\Temp\simple-test.log";
                Directory.CreateDirectory(@"C:\Temp");
                File.WriteAllText(log, $"[{DateTime.Now}] Simple test started\n");

                File.AppendAllText(log, $"[{DateTime.Now}] Creating App...\n");
                var app = new MandADiscoverySuite.App();
                File.AppendAllText(log, $"[{DateTime.Now}] App created\n");

                File.AppendAllText(log, $"[{DateTime.Now}] Calling InitializeComponent...\n");
                app.InitializeComponent();
                File.AppendAllText(log, $"[{DateTime.Now}] InitializeComponent completed\n");

                File.AppendAllText(log, $"[{DateTime.Now}] Calling app.Run()...\n");
                app.Run();
                File.AppendAllText(log, $"[{DateTime.Now}] app.Run() completed\n");
            }
            catch (Exception ex)
            {
                var log = @"C:\Temp\simple-test.log";
                File.AppendAllText(log, $"[{DateTime.Now}] ERROR: {ex.Message}\n");
                File.AppendAllText(log, $"Stack: {ex.StackTrace}\n");
                MessageBox.Show($"Error: {ex.Message}", "Simple Test Error");
            }
        }
    }
}