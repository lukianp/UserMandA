/**
 * Pagination Component
 *
 * Complete pagination controls with page numbers, jump to page, and items per page selector.
 * Follows accessibility best practices.
 */

import React from 'react';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Select } from '../atoms/Select';

export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems?: number;
  /** Items per page */
  pageSize: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Show page size selector */
  showPageSizeSelector?: boolean;
  /** Show jump to page input */
  showJumpToPage?: boolean;
  /** Show first/last page buttons */
  showFirstLastButtons?: boolean;
  /** Maximum page buttons to show */
  maxPageButtons?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * Pagination Component
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showJumpToPage = true,
  showFirstLastButtons = true,
  maxPageButtons = 7,
  disabled = false,
  className,
  'data-cy': dataCy,
}) => {
  // Calculate page range to display
  const getPageRange = (): number[] => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfRange = Math.floor(maxPageButtons / 2);
    let start = Math.max(1, currentPage - halfRange);
    const end = Math.min(totalPages, start + maxPageButtons - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxPageButtons) {
      start = Math.max(1, end - maxPageButtons + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageRange = getPageRange();

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleJumpToPage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('jumpToPage') as HTMLInputElement;
    const page = parseInt(input.value, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      input.value = '';
    }
  };

  const handlePageSizeChange = (value: string) => {
    if (onPageSizeChange) {
      onPageSizeChange(parseInt(value, 10));
    }
  };

  // Calculate displayed range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || 0);

  return (
    <div
      className={clsx('flex items-center justify-between gap-4 flex-wrap', className)}
      data-cy={dataCy}
    >
      {/* Items info and page size selector */}
      <div className="flex items-center gap-4">
        {totalItems !== undefined && (
          <span className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </span>
        )}

        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-700">
              Per page:
            </label>
            <Select
              name="pageSize"
              value={pageSize.toString()}
              onChange={handlePageSizeChange}
              options={pageSizeOptions.map(size => ({
                value: size.toString(),
                label: size.toString(),
              }))}
              disabled={disabled}
              className="w-20"
              data-cy="page-size-select"
            />
          </div>
        )}
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        {/* First page button */}
        {showFirstLastButtons && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageClick(1)}
            disabled={disabled || currentPage === 1}
            aria-label="First page"
            data-cy="first-page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Previous page button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          aria-label="Previous page"
          data-cy="prev-page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page number buttons */}
        <div className="flex items-center gap-1">
          {/* Show ellipsis if start is not 1 */}
          {pageRange[0] > 1 && (
            <span className="px-2 text-gray-500">...</span>
          )}

          {pageRange.map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              disabled={disabled}
              className={clsx(
                'min-w-[2.5rem] h-10 px-3 rounded-md text-sm font-medium',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                {
                  'bg-blue-600 text-white': page === currentPage,
                  'text-gray-700 hover:bg-gray-100': page !== currentPage && !disabled,
                  'text-gray-400 cursor-not-allowed': disabled,
                }
              )}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              data-cy={`page-${page}`}
            >
              {page}
            </button>
          ))}

          {/* Show ellipsis if end is not totalPages */}
          {pageRange[pageRange.length - 1] < totalPages && (
            <span className="px-2 text-gray-500">...</span>
          )}
        </div>

        {/* Next page button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          aria-label="Next page"
          data-cy="next-page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page button */}
        {showFirstLastButtons && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageClick(totalPages)}
            disabled={disabled || currentPage === totalPages}
            aria-label="Last page"
            data-cy="last-page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}

        {/* Jump to page */}
        {showJumpToPage && (
          <form onSubmit={handleJumpToPage} className="flex items-center gap-2 ml-4">
            <label htmlFor="jumpToPage" className="text-sm text-gray-700">
              Go to:
            </label>
            <input
              type="number"
              name="jumpToPage"
              id="jumpToPage"
              min={1}
              max={totalPages}
              placeholder="Page"
              disabled={disabled}
              className="w-20 h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-cy="jump-to-page"
            />
          </form>
        )}
      </div>
    </div>
  );
};

export default Pagination;
