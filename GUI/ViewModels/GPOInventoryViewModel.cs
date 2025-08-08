using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for displaying discovered Group Policy Objects.
    /// </summary>
    public class GPOInventoryViewModel : BaseViewModel
    {
        public ObservableCollection<GroupPolicyData> Policies { get; } = new();

        public async Task InitializeAsync(string companyName)
        {
            var rawPath = ConfigurationService.Instance.GetCompanyRawDataPath(companyName);
            await LoadPoliciesAsync(rawPath);
        }

        private async Task LoadPoliciesAsync(string rawPath)
        {
            try
            {
                IsLoading = true;
                Policies.Clear();

                var file = Path.Combine(rawPath, "GPOs.csv");
                if (!File.Exists(file))
                    return;

                var lines = await File.ReadAllLinesAsync(file);
                foreach (var line in lines.Skip(1))
                {
                    var parts = line.Split(',');
                    if (parts.Length >= 2)
                    {
                        var linked = parts[1].Split(';').Select(o => o.Trim()).Where(o => !string.IsNullOrEmpty(o)).ToList();
                        Policies.Add(new GroupPolicyData { Name = parts[0], LinkedOUs = linked });
                    }
                }
            }
            finally
            {
                IsLoading = false;
            }
        }
    }
}
