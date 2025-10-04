/**
 * Pagination Service
 * Advanced pagination utilities for client-side, server-side, and cursor-based pagination
 */

/**
 * Pagination mode
 */
export type PaginationMode = 'client' | 'server' | 'cursor';

/**
 * Pagination state
 */
export interface PaginationState {
  /** Current page (1-based) */
  currentPage: number;
  /** Items per page */
  pageSize: number;
  /** Total items */
  totalItems: number;
  /** Total pages */
  totalPages: number;
  /** Has previous page */
  hasPrevious: boolean;
  /** Has next page */
  hasNext: boolean;
  /** Start index (0-based) */
  startIndex: number;
  /** End index (0-based, exclusive) */
  endIndex: number;
  /** Items on current page */
  itemsOnPage: number;
}

/**
 * Cursor pagination state
 */
export interface CursorPaginationState {
  /** Current cursor */
  cursor: string | null;
  /** Next cursor */
  nextCursor: string | null;
  /** Previous cursor */
  previousCursor: string | null;
  /** Items per page */
  pageSize: number;
  /** Has more items */
  hasMore: boolean;
}

/**
 * Server pagination parameters
 */
export interface ServerPaginationParams {
  /** Page number (1-based) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Offset (for offset/limit) */
  offset?: number;
  /** Limit (for offset/limit) */
  limit?: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  /** Items on current page */
  items: T[];
  /** Pagination state */
  state: PaginationState;
}

/**
 * Cursor paginated result
 */
export interface CursorPaginatedResult<T> {
  /** Items on current page */
  items: T[];
  /** Cursor pagination state */
  state: CursorPaginationState;
}

/**
 * Pagination Service
 */
export class PaginationService {
  private static instance: PaginationService;

  /** Common page size options */
  static readonly PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 500];

  /** Default page size */
  static readonly DEFAULT_PAGE_SIZE = 25;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): PaginationService {
    if (!PaginationService.instance) {
      PaginationService.instance = new PaginationService();
    }
    return PaginationService.instance;
  }

  /**
   * Client-side pagination - slice array
   * @param data Complete dataset
   * @param page Page number (1-based)
   * @param pageSize Items per page
   * @returns Paginated result
   */
  paginate<T>(data: T[], page: number, pageSize: number = PaginationService.DEFAULT_PAGE_SIZE): PaginatedResult<T> {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const validPage = Math.max(1, Math.min(page, totalPages || 1));

    const startIndex = (validPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    const items = data.slice(startIndex, endIndex);

    const state: PaginationState = {
      currentPage: validPage,
      pageSize,
      totalItems,
      totalPages,
      hasPrevious: validPage > 1,
      hasNext: validPage < totalPages,
      startIndex,
      endIndex,
      itemsOnPage: items.length,
    };

    return { items, state };
  }

  /**
   * Get page of data (alias for paginate)
   */
  getPage<T>(data: T[], page: number, pageSize: number = PaginationService.DEFAULT_PAGE_SIZE): T[] {
    return this.paginate(data, page, pageSize).items;
  }

  /**
   * Calculate pagination state without slicing data
   * @param totalItems Total number of items
   * @param page Current page (1-based)
   * @param pageSize Items per page
   * @returns Pagination state
   */
  calculateState(totalItems: number, page: number, pageSize: number = PaginationService.DEFAULT_PAGE_SIZE): PaginationState {
    const totalPages = Math.ceil(totalItems / pageSize);
    const validPage = Math.max(1, Math.min(page, totalPages || 1));

    const startIndex = (validPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return {
      currentPage: validPage,
      pageSize,
      totalItems,
      totalPages,
      hasPrevious: validPage > 1,
      hasNext: validPage < totalPages,
      startIndex,
      endIndex,
      itemsOnPage: endIndex - startIndex,
    };
  }

  /**
   * Get server pagination parameters (offset/limit)
   * @param page Page number (1-based)
   * @param pageSize Items per page
   * @returns Server pagination params
   */
  getServerParams(page: number, pageSize: number = PaginationService.DEFAULT_PAGE_SIZE): ServerPaginationParams {
    const validPage = Math.max(1, page);
    const offset = (validPage - 1) * pageSize;

    return {
      page: validPage,
      pageSize,
      offset,
      limit: pageSize,
    };
  }

  /**
   * Cursor-based pagination
   * @param data Complete dataset
   * @param cursor Current cursor (item ID or index)
   * @param pageSize Items per page
   * @param getId Function to get item ID
   * @returns Cursor paginated result
   */
  paginateByCursor<T>(
    data: T[],
    cursor: string | null,
    pageSize: number = PaginationService.DEFAULT_PAGE_SIZE,
    getId: (item: T) => string = (item: any) => item.id
  ): CursorPaginatedResult<T> {
    let startIndex = 0;

    // Find cursor position
    if (cursor) {
      const cursorIndex = data.findIndex((item) => getId(item) === cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1; // Start after cursor
      }
    }

    const endIndex = Math.min(startIndex + pageSize, data.length);
    const items = data.slice(startIndex, endIndex);

    const nextCursor = endIndex < data.length ? getId(data[endIndex - 1]) : null;
    const previousCursor = startIndex > 0 ? getId(data[startIndex - 1]) : null;

    const state: CursorPaginationState = {
      cursor,
      nextCursor,
      previousCursor,
      pageSize,
      hasMore: endIndex < data.length,
    };

    return { items, state };
  }

  /**
   * Get page range for pagination UI
   * @param currentPage Current page
   * @param totalPages Total pages
   * @param maxPages Maximum page numbers to show (default: 5)
   * @returns Array of page numbers to display
   */
  getPageRange(currentPage: number, totalPages: number, maxPages: number = 5): number[] {
    if (totalPages <= maxPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxPages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    // Adjust if at boundaries
    if (currentPage <= half) {
      end = maxPages;
    } else if (currentPage >= totalPages - half) {
      start = totalPages - maxPages + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  /**
   * Get pagination info text
   * @param state Pagination state
   * @returns Info text (e.g., "Showing 1-25 of 100")
   */
  getInfoText(state: PaginationState): string {
    if (state.totalItems === 0) {
      return 'No items';
    }

    const start = state.startIndex + 1;
    const end = state.endIndex;

    return `Showing ${start}-${end} of ${state.totalItems}`;
  }

  /**
   * Navigate to next page
   * @param state Current pagination state
   * @returns Next page number
   */
  nextPage(state: PaginationState): number {
    return state.hasNext ? state.currentPage + 1 : state.currentPage;
  }

  /**
   * Navigate to previous page
   * @param state Current pagination state
   * @returns Previous page number
   */
  previousPage(state: PaginationState): number {
    return state.hasPrevious ? state.currentPage - 1 : state.currentPage;
  }

  /**
   * Navigate to first page
   */
  firstPage(): number {
    return 1;
  }

  /**
   * Navigate to last page
   * @param state Current pagination state
   * @returns Last page number
   */
  lastPage(state: PaginationState): number {
    return state.totalPages;
  }

  /**
   * Jump to specific page
   * @param page Target page
   * @param state Current pagination state
   * @returns Valid page number
   */
  jumpToPage(page: number, state: PaginationState): number {
    return Math.max(1, Math.min(page, state.totalPages));
  }

  /**
   * Change page size
   * @param newPageSize New page size
   * @param state Current pagination state
   * @param preserveFirstItem Preserve first item on current page (default: true)
   * @returns New page number
   */
  changePageSize(newPageSize: number, state: PaginationState, preserveFirstItem: boolean = true): number {
    if (!preserveFirstItem) {
      return 1;
    }

    // Calculate which page the first item will be on with new page size
    const firstItemIndex = state.startIndex;
    return Math.floor(firstItemIndex / newPageSize) + 1;
  }

  /**
   * Persist pagination state to URL query parameters
   * @param state Pagination state
   * @param prefix Query param prefix (default: 'page')
   * @returns URLSearchParams
   */
  toUrlParams(state: PaginationState, prefix: string = 'page'): URLSearchParams {
    const params = new URLSearchParams();
    params.set(`${prefix}`, String(state.currentPage));
    params.set(`${prefix}Size`, String(state.pageSize));
    return params;
  }

  /**
   * Restore pagination state from URL query parameters
   * @param params URLSearchParams
   * @param prefix Query param prefix (default: 'page')
   * @returns Page number and page size
   */
  fromUrlParams(params: URLSearchParams, prefix: string = 'page'): { page: number; pageSize: number } {
    const page = parseInt(params.get(`${prefix}`) || '1', 10);
    const pageSize = parseInt(params.get(`${prefix}Size`) || String(PaginationService.DEFAULT_PAGE_SIZE), 10);

    return {
      page: Math.max(1, page),
      pageSize: Math.max(1, pageSize),
    };
  }

  /**
   * Virtual scrolling helper - calculate visible range
   * @param scrollTop Current scroll position
   * @param itemHeight Height of each item
   * @param viewportHeight Height of viewport
   * @param totalItems Total number of items
   * @param overscan Number of items to render outside viewport (default: 3)
   * @returns Start and end indices
   */
  calculateVirtualRange(
    scrollTop: number,
    itemHeight: number,
    viewportHeight: number,
    totalItems: number,
    overscan: number = 3
  ): { startIndex: number; endIndex: number; offsetY: number } {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(viewportHeight / itemHeight);
    const endIndex = Math.min(totalItems, startIndex + visibleCount + overscan * 2);
    const offsetY = startIndex * itemHeight;

    return { startIndex, endIndex, offsetY };
  }

  /**
   * Calculate total height for virtual scrolling
   * @param itemCount Number of items
   * @param itemHeight Height of each item
   * @returns Total height
   */
  calculateVirtualHeight(itemCount: number, itemHeight: number): number {
    return itemCount * itemHeight;
  }
}

export default PaginationService.getInstance();
