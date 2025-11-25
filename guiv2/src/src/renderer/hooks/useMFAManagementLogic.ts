/**
 * Placeholder MFA management hook so tests can mock behavior.
 */
export const useMFAManagementLogic = () => ({
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

export default useMFAManagementLogic;
