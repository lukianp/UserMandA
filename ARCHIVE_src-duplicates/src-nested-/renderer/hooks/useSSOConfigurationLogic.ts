/**
 * Placeholder SSO configuration hook to support view tests.
 */
export const useSSOConfigurationLogic = () => ({
  data: [],
  selectedItems: [],
  searchText: '',
  isLoading: false,
  error: null as string | null,
  loadData: async () => undefined,
  exportData: async () => undefined,
  refreshData: async () => undefined,
  pagination: { page: 0, pageSize: 50, total: 0 },
});

export default useSSOConfigurationLogic;
