/**
 * Pagination Hook
 *
 * Mirrors C# pagination patterns with:
 * - Client-side and server-side pagination support
 * - Page size management
 * - Page navigation
 * - Total count tracking
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

export interface PaginationOptions {
  /** Initial page (1-indexed) */
  initialPage?: number;
  /** Initial page size */
  initialPageSize?: number;
  /** Available page sizes */
  pageSizeOptions?: number[];
  /** Server-side pagination mode */
  serverSide?: boolean;
}

export interface PaginationState {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
  /** Start index (0-indexed) */
  startIndex: number;
  /** End index (0-indexed) */
  endIndex: number;
  /** Has previous page */
  hasPrevious: boolean;
  /** Has next page */
  hasNext: boolean;
}

export interface PaginationActions {
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  previousPage: () => void;
  /** Go to first page */
  firstPage: () => void;
  /** Go to last page */
  lastPage: () => void;
  /** Change page size */
  setPageSize: (size: number) => void;
  /** Set total items (for server-side) */
  setTotalItems: (total: number) => void;
}

export interface UsePaginationReturn<T = any> {
  /** Pagination state */
  state: PaginationState;
  /** Pagination actions */
  actions: PaginationActions;
  /** Paginated data (client-side only) */
  paginatedData: T[];
}

/**
 * Pagination Hook
 * Mirrors C# PaginationService pattern
 */
export function usePagination<T = any>(
  data: T[] = [],
  options: PaginationOptions = {}
): UsePaginationReturn<T> {
  const {
    initialPage = 1,
    initialPageSize = 25,
    pageSizeOptions = [10, 25, 50, 100, 250, 500],
    serverSide = false,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [totalItems, setTotalItemsState] = useState(data.length);

  // Update total items when data changes (client-side only)
  useEffect(() => {
    if (!serverSide) {
      setTotalItemsState(data.length);
    }
  }, [data.length, serverSide]);

  // Calculate pagination state
  const state: PaginationState = useMemo(() => {
    const total = serverSide ? totalItems : data.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);

    return {
      currentPage,
      pageSize,
      totalItems: total,
      totalPages,
      startIndex,
      endIndex,
      hasPrevious: currentPage > 1,
      hasNext: currentPage < totalPages,
    };
  }, [currentPage, pageSize, totalItems, data.length, serverSide]);

  // Pagination actions
  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, state.totalPages));
      setCurrentPage(validPage);
    },
    [state.totalPages]
  );

  const nextPage = useCallback(() => {
    if (state.hasNext) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [state.hasNext]);

  const previousPage = useCallback(() => {
    if (state.hasPrevious) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [state.hasPrevious]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(state.totalPages);
  }, [state.totalPages]);

  const setPageSize = useCallback(
    (size: number) => {
      setPageSizeState(size);
      // Reset to first page when page size changes
      setCurrentPage(1);
    },
    []
  );

  const setTotalItems = useCallback((total: number) => {
    setTotalItemsState(total);
  }, []);

  // Get paginated data (client-side only)
  const paginatedData = useMemo(() => {
    if (serverSide) {
      return data; // Server already paginated
    }
    return data.slice(state.startIndex, state.endIndex);
  }, [data, state.startIndex, state.endIndex, serverSide]);

  return {
    state,
    actions: {
      goToPage,
      nextPage,
      previousPage,
      firstPage,
      lastPage,
      setPageSize,
      setTotalItems,
    },
    paginatedData,
  };
}

export default usePagination;


