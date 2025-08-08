using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// View model backing the asset inventory view.
    /// </summary>
    public class AssetInventoryViewModel : BaseViewModel
    {
        /// <summary>
        /// Collection of all discovered assets.
        /// </summary>
        public ObservableCollection<AssetData> Assets { get; } = new ObservableCollection<AssetData>();

        public AssetInventoryViewModel()
        {
            TabTitle = "Assets";
        }

        /// <summary>
        /// Loads assets from discovery results.
        /// </summary>
        public void LoadAssets(IEnumerable<AssetData> discoveredAssets)
        {
            Assets.Clear();
            if (discoveredAssets == null) return;
            foreach (var asset in discoveredAssets)
                Assets.Add(asset);
        }

        /// <summary>
        /// Returns assets owned by the specified user.
        /// </summary>
        public IEnumerable<AssetData> GetAssetsForUser(string userName)
        {
            if (string.IsNullOrWhiteSpace(userName))
                return Enumerable.Empty<AssetData>();
            return Assets.Where(a => string.Equals(a.Owner, userName, StringComparison.OrdinalIgnoreCase));
        }
    }
}
