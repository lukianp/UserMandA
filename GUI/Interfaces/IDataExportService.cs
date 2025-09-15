using System.Collections.Generic;
using System.Threading.Tasks;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Interface for data export services
    /// </summary>
    public interface IDataExportService
    {
        Task<bool> ExportToCsvAsync<T>(IEnumerable<T> data, string defaultFileName = null);
        Task<bool> ExportToJsonAsync<T>(IEnumerable<T> data, string defaultFileName = null);
        Task<bool> ExportToExcelAsync<T>(IEnumerable<T> data, string defaultFileName = null);
        Task<bool> ExportToExcelAsync<T>(IEnumerable<T> data, string defaultFileName, string worksheetName, bool includeCharts = false);
        Task<string> ExportAssetDetailAsync(object assetDetail);
        Task<string> ExportDiscoveryDataAsync(object data);
        Task<string> ExportReportsAsync(object reports);
    }
}