using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services.Migration
{
    /// <summary>
    /// Interface for pre-migration eligibility checking service
    /// </summary>
    public interface IPreMigrationCheckService
    {
        /// <summary>
        /// Generate comprehensive eligibility report for migration objects
        /// </summary>
        Task<EligibilityReport> GetEligibilityReportAsync(MigrationContext context, CancellationToken cancellationToken = default);

        /// <summary>
        /// Save manual mapping override
        /// </summary>
        Task SaveObjectMappingAsync(ObjectMapping mappingOverride, CancellationToken cancellationToken = default);

        /// <summary>
        /// Load existing mapping overrides
        /// </summary>
        Task<List<ObjectMapping>> LoadObjectMappingsAsync(CancellationToken cancellationToken = default);
    }
}