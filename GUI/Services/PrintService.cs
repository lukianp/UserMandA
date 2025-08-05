using System;
using System.Collections.Generic;
using System.IO;
using System.Printing;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Markup;
using System.Windows.Media;
using System.Windows.Xps;
using System.Windows.Xps.Packaging;
using Microsoft.Extensions.Logging;
using Microsoft.Win32;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for handling printing operations
    /// </summary>
    public class PrintService : IDisposable
    {
        private readonly ILogger<PrintService> _logger;
        private PrintQueue _defaultPrintQueue;
        private PrintTicket _defaultPrintTicket;

        public PrintService(ILogger<PrintService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            InitializePrintSystem();
        }

        #region Properties

        /// <summary>
        /// Gets the available print queues
        /// </summary>
        public IEnumerable<PrintQueue> AvailablePrinters
        {
            get
            {
                try
                {
                    var printServer = new LocalPrintServer();
                    return printServer.GetPrintQueues();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error getting available printers");
                    return new List<PrintQueue>();
                }
            }
        }

        /// <summary>
        /// Gets or sets the default print queue
        /// </summary>
        public PrintQueue DefaultPrintQueue
        {
            get => _defaultPrintQueue;
            set => _defaultPrintQueue = value;
        }

        /// <summary>
        /// Gets or sets the default print ticket
        /// </summary>
        public PrintTicket DefaultPrintTicket
        {
            get => _defaultPrintTicket;
            set => _defaultPrintTicket = value;
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Shows the print dialog and prints the specified content
        /// </summary>
        public bool Print(UIElement content, string documentName = "Document")
        {
            try
            {
                var printDialog = new PrintDialog();
                
                if (printDialog.ShowDialog() == true)
                {
                    // Create a document paginator
                    var paginator = CreateDocumentPaginator(content, printDialog.PrintTicket);
                    
                    // Print the document
                    printDialog.PrintDocument(paginator, documentName);
                    
                    _logger.LogInformation("Successfully printed document: {DocumentName}", documentName);
                    return true;
                }
                
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error printing document: {DocumentName}", documentName);
                return false;
            }
        }

        /// <summary>
        /// Prints content directly without showing dialog
        /// </summary>
        public bool PrintDirect(UIElement content, PrintQueue printQueue = null, PrintTicket printTicket = null, string documentName = "Document")
        {
            try
            {
                var queue = printQueue ?? _defaultPrintQueue;
                var ticket = printTicket ?? _defaultPrintTicket;
                
                if (queue == null)
                {
                    _logger.LogWarning("No print queue specified for direct printing");
                    return false;
                }

                var paginator = CreateDocumentPaginator(content, ticket);
                var writer = PrintQueue.CreateXpsDocumentWriter(queue);
                
                writer.Write(paginator, ticket);
                
                _logger.LogInformation("Successfully printed document directly: {DocumentName}", documentName);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error printing document directly: {DocumentName}", documentName);
                return false;
            }
        }

        /// <summary>
        /// Exports content to XPS format
        /// </summary>
        public bool ExportToXps(UIElement content, string filePath, string documentName = "Document")
        {
            try
            {
                using (var package = Package.Open(filePath, FileMode.Create))
                using (var xpsDocument = new XpsDocument(package))
                {
                    var writer = XpsDocument.CreateXpsDocumentWriter(xpsDocument);
                    var paginator = CreateDocumentPaginator(content, null);
                    
                    writer.Write(paginator);
                }
                
                _logger.LogInformation("Successfully exported to XPS: {FilePath}", filePath);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting to XPS: {FilePath}", filePath);
                return false;
            }
        }

        /// <summary>
        /// Shows page setup dialog
        /// </summary>
        public PrintTicket ShowPageSetupDialog(PrintTicket currentTicket = null)
        {
            try
            {
                var printDialog = new PrintDialog();
                
                if (currentTicket != null)
                {
                    printDialog.PrintTicket = currentTicket;
                }
                
                if (printDialog.ShowDialog() == true)
                {
                    return printDialog.PrintTicket;
                }
                
                return currentTicket;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error showing page setup dialog");
                return currentTicket;
            }
        }

        /// <summary>
        /// Gets print capabilities for a printer
        /// </summary>
        public PrintCapabilities GetPrintCapabilities(PrintQueue printQueue = null)
        {
            try
            {
                var queue = printQueue ?? _defaultPrintQueue;
                return queue?.GetPrintCapabilities();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting print capabilities");
                return null;
            }
        }

        /// <summary>
        /// Creates a print preview document
        /// </summary>
        public FlowDocument CreatePrintPreviewDocument(UIElement content, PrintTicket printTicket = null)
        {
            try
            {
                var document = new FlowDocument();
                
                // Clone the content to avoid issues with visual tree
                var clonedContent = CloneUIElement(content);
                
                var container = new BlockUIContainer(clonedContent);
                document.Blocks.Add(container);
                
                // Apply print formatting
                if (printTicket != null)
                {
                    ApplyPrintFormatting(document, printTicket);
                }
                
                return document;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating print preview document");
                return new FlowDocument();
            }
        }

        /// <summary>
        /// Gets available paper sizes
        /// </summary>
        public IEnumerable<PageMediaSize> GetAvailablePaperSizes(PrintQueue printQueue = null)
        {
            try
            {
                var capabilities = GetPrintCapabilities(printQueue);
                return capabilities?.PageMediaSizeCapability ?? new List<PageMediaSize>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available paper sizes");
                return new List<PageMediaSize>();
            }
        }

        /// <summary>
        /// Calculates page count for content
        /// </summary>
        public int CalculatePageCount(UIElement content, PrintTicket printTicket = null)
        {
            try
            {
                var paginator = CreateDocumentPaginator(content, printTicket);
                return paginator.PageCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating page count");
                return 1;
            }
        }

        #endregion

        #region Private Methods

        private void InitializePrintSystem()
        {
            try
            {
                var printServer = new LocalPrintServer();
                _defaultPrintQueue = printServer.DefaultPrintQueue;
                _defaultPrintTicket = _defaultPrintQueue?.DefaultPrintTicket;
                
                _logger.LogDebug("Initialized print system with default printer: {PrinterName}", 
                    _defaultPrintQueue?.Name ?? "None");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error initializing print system");
            }
        }

        private DocumentPaginator CreateDocumentPaginator(UIElement content, PrintTicket printTicket)
        {
            try
            {
                // Create a fixed document
                var fixedDocument = new FixedDocument();
                
                // Determine page size
                var pageSize = GetPageSize(printTicket);
                var pageMargin = new Thickness(40);
                var contentSize = new Size(
                    pageSize.Width - pageMargin.Left - pageMargin.Right,
                    pageSize.Height - pageMargin.Top - pageMargin.Bottom);

                // Measure and arrange content
                content.Measure(contentSize);
                content.Arrange(new Rect(contentSize));

                // Create page content
                var pageContent = new PageContent();
                var fixedPage = new FixedPage
                {
                    Width = pageSize.Width,
                    Height = pageSize.Height
                };

                // Add content to page with margins
                var contentBorder = new Border
                {
                    Margin = pageMargin,
                    Child = content
                };
                
                fixedPage.Children.Add(contentBorder);
                pageContent.Child = fixedPage;
                fixedDocument.Pages.Add(pageContent);

                return fixedDocument.DocumentPaginator;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating document paginator");
                throw;
            }
        }

        private Size GetPageSize(PrintTicket printTicket)
        {
            try
            {
                if (printTicket?.PageMediaSize != null)
                {
                    return new Size(
                        printTicket.PageMediaSize.Width ?? 816, // Default to Letter size
                        printTicket.PageMediaSize.Height ?? 1056);
                }
                
                // Default to Letter size (8.5" x 11" at 96 DPI)
                return new Size(816, 1056);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting page size from print ticket");
                return new Size(816, 1056);
            }
        }

        private UIElement CloneUIElement(UIElement element)
        {
            try
            {
                var xaml = XamlWriter.Save(element);
                var cloned = (UIElement)XamlReader.Parse(xaml);
                return cloned;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cloning UI element");
                return element; // Return original if cloning fails
            }
        }

        private void ApplyPrintFormatting(FlowDocument document, PrintTicket printTicket)
        {
            try
            {
                var pageSize = GetPageSize(printTicket);
                
                document.PageWidth = pageSize.Width;
                document.PageHeight = pageSize.Height;
                document.PagePadding = new Thickness(40);
                document.ColumnGap = 0;
                document.ColumnWidth = pageSize.Width - 80; // Account for padding
                
                // Apply orientation
                if (printTicket.PageOrientation == PageOrientation.Landscape)
                {
                    var temp = document.PageWidth;
                    document.PageWidth = document.PageHeight;
                    document.PageHeight = temp;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying print formatting");
            }
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            try
            {
                _defaultPrintQueue?.Dispose();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error disposing PrintService");
            }
        }

        #endregion
    }

    /// <summary>
    /// Print job information
    /// </summary>
    public class PrintJobInfo
    {
        public string DocumentName { get; set; }
        public string PrinterName { get; set; }
        public int PageCount { get; set; }
        public DateTime PrintTime { get; set; }
        public PrintJobStatus Status { get; set; }
    }

    /// <summary>
    /// Print job status
    /// </summary>
    public enum PrintJobStatus
    {
        Pending,
        Printing,
        Completed,
        Error,
        Cancelled
    }
}