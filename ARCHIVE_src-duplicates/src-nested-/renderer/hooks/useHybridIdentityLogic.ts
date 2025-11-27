/**
 * Placeholder hybrid identity logic hook.
 * Provides stable defaults so views/tests can mock functionality.
 */
export const useHybridIdentityLogic = () => ({
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

export default useHybridIdentityLogic;
