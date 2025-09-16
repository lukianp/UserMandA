// Version: 1.0.0
// Author: Lukian Poleschtschuk
// Date Modified: 2025-09-16
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Stub for legacy CsvDataService - to be replaced by CsvDataServiceNew
    /// </summary>
    [Obsolete("Use CsvDataServiceNew instead")]
    public class CsvDataService
    {
        // Stub methods for compilation
        public Task<List<UserData>> LoadUsersAsync(string profile) => Task.FromResult(new List<UserData>());
        public Task<List<GroupData>> LoadGroupsAsync(string profile) => Task.FromResult(new List<GroupData>());
        public Task<List<InfrastructureData>> LoadInfrastructureAsync(string profile) => Task.FromResult(new List<InfrastructureData>());
        public Task<List<ApplicationData>> LoadApplicationsAsync(string profile) => Task.FromResult(new List<ApplicationData>());
        public Task<List<FileServerData>> LoadFileServersAsync(string profile) => Task.FromResult(new List<FileServerData>());
        public Task<List<PolicyData>> LoadGroupPoliciesAsync(string profile) => Task.FromResult(new List<PolicyData>());
        public Task<object> LoadSecurityPostureAsync(string profile) => Task.FromResult(new object());
    }
}