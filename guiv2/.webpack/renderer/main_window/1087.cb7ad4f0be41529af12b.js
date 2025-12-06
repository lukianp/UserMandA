"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[1087],{

/***/ 41087:
/*!*********************************************************************************!*\
  !*** ./src/renderer/components/organisms/DiscoveredViewWrapper.tsx + 2 modules ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  DiscoveredViewWrapper: () => (/* binding */ DiscoveredViewWrapper)
});

// UNUSED EXPORTS: default

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
// EXTERNAL MODULE: ./node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(34164);
// EXTERNAL MODULE: ./src/renderer/components/organisms/VirtualizedDataGrid.tsx
var VirtualizedDataGrid = __webpack_require__(59944);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Spinner.tsx
var Spinner = __webpack_require__(28709);
;// ./src/renderer/components/organisms/DiscoveredViewTemplate.tsx

/**
 * Discovered View Template Component
 *
 * Pure presentation component for displaying CSV data from discovery modules
 * Provides consistent UI/UX across all discovered data views with dark theme support
 *
 * ARCHITECTURE: This component receives data as props - it does NOT call useCsvDataLoader.
 * Individual views are responsible for calling useCsvDataLoader and passing data to this template.
 */






/**
 * Pure presentation component for discovered data views
 * Receives data as props and renders UI - does NOT handle data loading
 */
const DiscoveredViewTemplate = react.memo(function DiscoveredViewTemplate({ title, description, data = [], // CRITICAL: Default to empty array to prevent undefined errors
columns = [], // CRITICAL: Default to empty array
loading, error, searchText, onSearchChange, onRefresh, onExport, lastRefresh, enableSearch = true, enableExport = true, 'data-cy': dataCy, }) {
    console.log(`[DiscoveredViewTemplate] ========== RENDER START ==========`);
    console.log(`[DiscoveredViewTemplate] Title: "${title}"`);
    console.log(`[DiscoveredViewTemplate] Data: ${data?.length || 0} rows`);
    console.log(`[DiscoveredViewTemplate] Columns: ${columns?.length || 0}`);
    console.log(`[DiscoveredViewTemplate] Loading: ${loading}`);
    console.log(`[DiscoveredViewTemplate] Error: ${error?.message || 'none'}`);
    console.log(`[DiscoveredViewTemplate] SearchText: "${searchText}"`);
    console.log(`[DiscoveredViewTemplate] LastRefresh: ${lastRefresh?.toISOString() || 'null'}`);
    console.log(`[DiscoveredViewTemplate] ========== RENDER END ==========`);
    // Filter data based on search text
    const filteredData = (0,react.useMemo)(() => {
        if (!searchText.trim()) {
            return data;
        }
        const searchLower = searchText.toLowerCase();
        return data.filter((row) => {
            return Object.values(row).some((value) => {
                if (value === null || value === undefined)
                    return false;
                return String(value).toLowerCase().includes(searchLower);
            });
        });
    }, [data, searchText]);
    // Calculate statistics
    const stats = (0,react.useMemo)(() => {
        return {
            total: data.length,
            filtered: filteredData.length,
        };
    }, [data.length, filteredData.length]);
    // Stable selection handler
    const handleSelectionChange = (0,react.useCallback)(() => {
        // Placeholder for future selection handling
    }, []);
    // Detect if error is a "discovery not run" scenario (file not found)
    const isDiscoveryNotRun = (0,react.useMemo)(() => {
        if (!error)
            return false;
        const errorMsg = error.message.toLowerCase();
        return errorMsg.includes('enoent') ||
            errorMsg.includes('no such file') ||
            errorMsg.includes('cannot find') ||
            errorMsg.includes('does not exist');
    }, [error]);
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": dataCy, children: [(0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: title }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: description }), lastRefresh && ((0,jsx_runtime.jsxs)("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-1", children: ["Last updated: ", lastRefresh.toLocaleTimeString(), " (auto-refresh: 30s)"] }))] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsxs)(Button.Button, { variant: "ghost", size: "sm", onClick: onRefresh, disabled: loading, "aria-label": "Reload data", children: [(0,jsx_runtime.jsx)(lucide_react.RefreshCw, { size: 16, className: (0,clsx.clsx)(loading && 'animate-spin') }), (0,jsx_runtime.jsx)("span", { className: "ml-2", children: "Reload" })] }), enableExport && onExport && ((0,jsx_runtime.jsxs)(Button.Button, { variant: "ghost", size: "sm", onClick: onExport, disabled: loading, "aria-label": "Export data", children: [(0,jsx_runtime.jsx)(lucide_react.Download, { size: 16 }), (0,jsx_runtime.jsx)("span", { className: "ml-2", children: "Export" })] }))] })] }), (0,jsx_runtime.jsxs)("div", { className: "mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400", children: [(0,jsx_runtime.jsxs)("span", { children: ["Total: ", (0,jsx_runtime.jsx)("strong", { className: "text-gray-900 dark:text-white", children: stats.total.toLocaleString() })] }), stats.filtered !== stats.total && ((0,jsx_runtime.jsxs)("span", { children: ["Filtered: ", (0,jsx_runtime.jsx)("strong", { className: "text-gray-900 dark:text-white", children: stats.filtered.toLocaleString() })] }))] })] }), enableSearch && ((0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3", children: (0,jsx_runtime.jsxs)("div", { className: "relative max-w-md", children: [(0,jsx_runtime.jsx)(lucide_react.Search, { size: 18, className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" }), (0,jsx_runtime.jsx)("input", { type: "text", placeholder: "Search...", value: searchText, onChange: (e) => onSearchChange(e.target.value), className: (0,clsx.clsx)('w-full pl-10 pr-4 py-2 rounded-lg', 'bg-gray-50 dark:bg-gray-700', 'border border-gray-300 dark:border-gray-600', 'text-gray-900 dark:text-white', 'placeholder-gray-500 dark:placeholder-gray-400', 'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400', 'transition-colors'), "aria-label": "Search discovered data" })] }) })), (0,jsx_runtime.jsxs)("div", { className: "flex-1 p-6 overflow-hidden", children: [loading && data.length === 0 && ((0,jsx_runtime.jsx)("div", { className: "h-full flex items-center justify-center", children: (0,jsx_runtime.jsxs)("div", { className: "text-center", children: [(0,jsx_runtime.jsx)(Spinner.Spinner, { size: "lg" }), (0,jsx_runtime.jsx)("p", { className: "mt-4 text-gray-600 dark:text-gray-400", children: "Loading data..." })] }) })), error && !loading && ((0,jsx_runtime.jsx)("div", { className: "h-full flex items-center justify-center", children: (0,jsx_runtime.jsx)("div", { className: "text-center max-w-md", children: isDiscoveryNotRun ? ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsx)(lucide_react.Info, { size: 48, className: "text-blue-500 mx-auto mb-4" }), (0,jsx_runtime.jsx)("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-2", children: "Discovery Not Run" }), (0,jsx_runtime.jsxs)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-2", children: ["The ", (0,jsx_runtime.jsx)("strong", { children: title }), " discovery module has not been executed yet."] }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "Run the discovery module from the Discovery tab to populate this view with data." }), (0,jsx_runtime.jsx)("div", { className: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4", children: (0,jsx_runtime.jsxs)("p", { className: "text-xs text-blue-700 dark:text-blue-300 text-left", children: [(0,jsx_runtime.jsx)("strong", { children: "Tip:" }), " Navigate to the Discovery tab, select ", title, ", configure the target environment, and click \"Start Discovery\" to collect data."] }) })] })) : ((0,jsx_runtime.jsxs)(jsx_runtime.Fragment, { children: [(0,jsx_runtime.jsx)(lucide_react.AlertCircle, { size: 48, className: "text-red-500 mx-auto mb-4" }), (0,jsx_runtime.jsx)("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-2", children: "Error Loading Data" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: error.message }), (0,jsx_runtime.jsxs)(Button.Button, { onClick: onRefresh, variant: "primary", children: [(0,jsx_runtime.jsx)(lucide_react.RefreshCw, { size: 16 }), (0,jsx_runtime.jsx)("span", { className: "ml-2", children: "Try Again" })] })] })) }) })), !loading && !error && filteredData.length === 0 && data.length === 0 && ((0,jsx_runtime.jsx)("div", { className: "h-full flex items-center justify-center", children: (0,jsx_runtime.jsx)("div", { className: "text-center", children: (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "No data available" }) }) })), !loading && !error && filteredData.length === 0 && data.length > 0 && ((0,jsx_runtime.jsx)("div", { className: "h-full flex items-center justify-center", children: (0,jsx_runtime.jsx)("div", { className: "text-center", children: (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "No results match your search" }) }) })), !error && (filteredData.length > 0 || loading) && ((0,jsx_runtime.jsx)(VirtualizedDataGrid.VirtualizedDataGrid, { data: filteredData, columns: columns, loading: loading, onSelectionChange: handleSelectionChange, enableExport: enableExport, enableGrouping: true, height: "calc(100vh - 280px)", "data-cy": `${dataCy}-grid` }))] })] }));
}, (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (prevProps.data === nextProps.data &&
        prevProps.columns === nextProps.columns &&
        prevProps.loading === nextProps.loading &&
        prevProps.error === nextProps.error &&
        prevProps.searchText === nextProps.searchText &&
        prevProps.lastRefresh === nextProps.lastRefresh);
});

// EXTERNAL MODULE: ./node_modules/papaparse/papaparse.min.js
var papaparse_min = __webpack_require__(44809);
var papaparse_min_default = /*#__PURE__*/__webpack_require__.n(papaparse_min);
// EXTERNAL MODULE: ./src/renderer/store/useProfileStore.ts
var useProfileStore = __webpack_require__(33813);
;// ./src/renderer/hooks/useCsvDataLoader.ts
/**
 * CSV Data Loader Hook
 *
 * Provides standardized CSV loading functionality for discovered data views
 * with error handling, validation, auto-refresh, and local file restrictions.
 *
 * Features:
 * - 30-second auto-refresh cycles (configurable)
 * - Exponential backoff retry on failure
 * - PascalCase-aware column generation
 * - Memory-efficient cleanup
 */



/**
 * Load and parse CSV data from local file path
 *
 * Security: Only loads files from guiv2/public/discovery/ directory
 * Performance: Implements row limits and file size restrictions
 *
 * @param csvPath - Relative path to CSV file (e.g., 'aws/results.csv')
 * @param options - Loading options
 * @returns CSV loader result with data, loading, and error states
 */
function useCsvDataLoader(csvPath, options = {}) {
    const { maxFileSize = 50 * 1024 * 1024, // 50MB
    maxRows = 100000, transform, onError, enableAutoRefresh = true, refreshInterval = 30000, // 30 seconds
    onSuccess, } = options;
    // Get current profile to determine data path
    const { selectedSourceProfile } = (0,useProfileStore.useProfileStore)();
    const [data, setData] = (0,react.useState)([]);
    const [columns, setColumns] = (0,react.useState)([]);
    const [loading, setLoading] = (0,react.useState)(false);
    const [error, setError] = (0,react.useState)(null);
    const [rawCsv, setRawCsv] = (0,react.useState)();
    const [lastRefresh, setLastRefresh] = (0,react.useState)(null);
    const [reloadCounter, setReloadCounter] = (0,react.useState)(0);
    const intervalRef = (0,react.useRef)();
    const retryCountRef = (0,react.useRef)(0);
    const maxRetries = 3;
    const isUnmountedRef = (0,react.useRef)(false);
    const mountCountRef = (0,react.useRef)(0);
    const lastMountTimeRef = (0,react.useRef)(0);
    const prevCsvPathRef = (0,react.useRef)(null);
    const loadInProgressRef = (0,react.useRef)(false);
    const reload = (0,react.useCallback)(() => {
        console.log('[useCsvDataLoader] Manual reload triggered');
        retryCountRef.current = 0; // Reset retry count on manual reload
        setReloadCounter((c) => c + 1);
    }, []);
    // CRITICAL DEBUG: Track loading state changes
    (0,react.useEffect)(() => {
        console.log(`[useCsvDataLoader] 🔄 Loading state changed to: ${loading}`);
    }, [loading]);
    // CRITICAL DEBUG: Track data state changes
    (0,react.useEffect)(() => {
        console.log(`[useCsvDataLoader] 📊 Data state changed to: ${data.length} rows`);
    }, [data]);
    (0,react.useEffect)(() => {
        mountCountRef.current += 1;
        const now = Date.now();
        const timeSinceLastMount = now - lastMountTimeRef.current;
        console.log(`[useCsvDataLoader] ⚙️  Effect triggered - Mount #${mountCountRef.current}, timeSince: ${timeSinceLastMount}ms, csvPath: ${csvPath}`);
        lastMountTimeRef.current = now;
        isUnmountedRef.current = false;
        // CRITICAL: Reset loadInProgressRef on each mount to prevent stale state from React Strict Mode double-mount
        if (mountCountRef.current > 1 && loadInProgressRef.current) {
            console.log(`[useCsvDataLoader] ⚠️  Resetting stale loadInProgressRef from previous mount`);
            loadInProgressRef.current = false;
        }
        if (!csvPath) {
            setData([]);
            setColumns([]);
            setLoading(false);
            setError(null);
            return;
        }
        // Validate path - only allow files in discovery directory
        if (csvPath.includes('..') || csvPath.startsWith('/') || csvPath.startsWith('\\')) {
            const err = new Error('Invalid CSV path: Path must be relative and within discovery directory');
            setError(err);
            onError?.(err);
            return;
        }
        const loadCsvData = async (isRetry = false) => {
            if (loadInProgressRef.current || isUnmountedRef.current) {
                console.log('[useCsvDataLoader] Load already in progress or unmounted, skipping');
                return;
            }
            loadInProgressRef.current = true;
            // CRITICAL: Check if unmounted BEFORE setting loading to true
            if (isUnmountedRef.current) {
                console.warn('[useCsvDataLoader] ⚠️  Component unmounted before setLoading, aborting');
                loadInProgressRef.current = false;
                return;
            }
            setLoading(true);
            console.log(`[useCsvDataLoader] 🔄 setLoading(true) called`);
            if (!isRetry) {
                setError(null);
            }
            try {
                // Get base path from profile
                const basePath = selectedSourceProfile?.dataPath || 'C:\\DiscoveryData\\ljpops';
                const rawDir = `${basePath}\\Raw`;
                // Construct full file path
                const fullPath = `${rawDir}\\${csvPath.replace(/^\/+/, '')}`;
                console.log(`[useCsvDataLoader] Loading CSV from: ${fullPath}`);
                console.log(`[useCsvDataLoader] Profile: ${selectedSourceProfile?.companyName || 'ljpops'}`);
                // Read CSV file using Electron API
                const csvText = await window.electronAPI.fs.readFile(fullPath, 'utf8');
                // CRITICAL: Check again after async operation
                if (isUnmountedRef.current) {
                    console.warn('[useCsvDataLoader] ⚠️  Component unmounted after readFile, aborting');
                    loadInProgressRef.current = false;
                    return;
                }
                if (!csvText || csvText.length === 0) {
                    throw new Error(`CSV file is empty: ${fullPath}`);
                }
                // Check file size
                if (csvText.length > maxFileSize) {
                    throw new Error(`CSV file exceeds maximum size of ${maxFileSize / 1024 / 1024}MB`);
                }
                setRawCsv(csvText);
                console.log(`[useCsvDataLoader] CSV loaded successfully, size: ${csvText.length} bytes`);
                // Parse CSV with PapaParse
                papaparse_min_default().parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    transformHeader: (header) => {
                        // Preserve PascalCase from PowerShell output
                        return header.trim();
                    },
                    complete: (results) => {
                        if (isUnmountedRef.current)
                            return;
                        console.log(`[useCsvDataLoader] Parsed ${results.data.length} rows`);
                        // Check row limit
                        if (results.data.length > maxRows) {
                            console.warn(`[useCsvDataLoader] Row count ${results.data.length} exceeds limit ${maxRows}, truncating`);
                            results.data = results.data.slice(0, maxRows);
                        }
                        // Apply transformation if provided
                        let finalData = results.data;
                        if (transform) {
                            try {
                                finalData = transform(results.data);
                                console.log(`[useCsvDataLoader] Transformed data: ${finalData.length} rows`);
                            }
                            catch (transformError) {
                                console.error('[useCsvDataLoader] Transform error:', transformError);
                                throw new Error(`Data transformation failed: ${transformError instanceof Error ? transformError.message : 'Unknown error'}`);
                            }
                        }
                        // Generate AG Grid columns from CSV headers (CRITICAL: preserve PascalCase)
                        const fields = results.meta.fields || [];
                        const generatedColumns = fields.map(field => {
                            // Convert PascalCase to readable header: "DisplayName" → "Display Name"
                            const headerName = field
                                .replace(/([A-Z])/g, ' $1')
                                .trim()
                                .replace(/^./, str => str.toUpperCase());
                            return {
                                field: field, // CRITICAL: Keep original PascalCase field name
                                headerName: headerName,
                                sortable: true,
                                filter: true,
                                width: 150,
                                resizable: true
                            };
                        });
                        console.log(`[useCsvDataLoader] Generated ${generatedColumns.length} columns:`, generatedColumns.map(c => c.field));
                        // Log parsing errors (non-fatal)
                        if (results.errors.length > 0) {
                            console.warn('[useCsvDataLoader] Parse warnings:', results.errors);
                        }
                        // CRITICAL: Update state in correct order to prevent race conditions
                        if (!isUnmountedRef.current) {
                            setData(finalData);
                            setColumns(generatedColumns);
                            setLastRefresh(new Date());
                            setError(null);
                            retryCountRef.current = 0;
                            // CRITICAL: Set loading to false LAST and log it
                            setLoading(false);
                            loadInProgressRef.current = false;
                            console.log(`[useCsvDataLoader] ✅ SUCCESS: Data loaded, loading set to FALSE`);
                            console.log(`[useCsvDataLoader] ✅ Data: ${finalData.length} rows, Columns: ${generatedColumns.length}`);
                            onSuccess?.(finalData, generatedColumns);
                        }
                        else {
                            console.warn('[useCsvDataLoader] ⚠️  Component unmounted during parse, skipping state update');
                        }
                    },
                    error: (parseError) => {
                        const err = new Error(`CSV parse error: ${parseError.message}`);
                        console.error('[useCsvDataLoader] Parse error:', parseError);
                        setError(err);
                        setLoading(false);
                        loadInProgressRef.current = false;
                        onError?.(err);
                    },
                });
            }
            catch (err) {
                if (isUnmountedRef.current)
                    return;
                const error = err instanceof Error ? err : new Error('Unknown error loading CSV');
                console.error('[useCsvDataLoader] Load error:', error);
                setError(error);
                // Retry logic with exponential backoff
                if (!isRetry && retryCountRef.current < maxRetries) {
                    retryCountRef.current++;
                    const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 5000);
                    console.log(`[useCsvDataLoader] Retry ${retryCountRef.current}/${maxRetries} in ${retryDelay}ms`);
                    setTimeout(() => {
                        if (!isUnmountedRef.current) {
                            loadCsvData(true);
                        }
                    }, retryDelay);
                    return;
                }
                setLoading(false);
                loadInProgressRef.current = false;
                onError?.(error);
            }
        };
        // Only load on first mount or when csvPath changes
        const shouldLoad = mountCountRef.current === 1 || csvPath !== prevCsvPathRef.current;
        prevCsvPathRef.current = csvPath;
        if (shouldLoad) {
            console.log(`[useCsvDataLoader] Initial load (mount: ${mountCountRef.current}, path: ${csvPath})`);
            loadCsvData();
        }
        else {
            console.log(`[useCsvDataLoader] Skipping load - no path change (mount: ${mountCountRef.current})`);
            // CRITICAL: Ensure loading stays false when we skip the load
            setLoading(false);
            console.log(`[useCsvDataLoader] ✅ Ensured loading=false since skipping load`);
        }
        // Setup auto-refresh ONLY on first mount
        if (enableAutoRefresh && mountCountRef.current === 1) {
            console.log(`[useCsvDataLoader] Starting auto-refresh (${refreshInterval}ms interval, mount: ${mountCountRef.current})`);
            intervalRef.current = setInterval(() => {
                if (!isUnmountedRef.current && !loadInProgressRef.current) {
                    console.log('[useCsvDataLoader] Auto-refresh triggered');
                    loadCsvData();
                }
            }, refreshInterval);
        }
        else if (enableAutoRefresh) {
            console.log(`[useCsvDataLoader] Skipping auto-refresh setup - already initialized (mount: ${mountCountRef.current})`);
        }
        // Cleanup on unmount
        return () => {
            isUnmountedRef.current = true;
            loadInProgressRef.current = false;
            if (intervalRef.current) {
                console.log('[useCsvDataLoader] Clearing auto-refresh interval on unmount');
                clearInterval(intervalRef.current);
                intervalRef.current = undefined;
            }
        };
    }, [csvPath, reloadCounter]); // MINIMAL dependencies to prevent loops
    return {
        data,
        columns,
        loading,
        error,
        rawCsv,
        lastRefresh,
        reload,
    };
}
/**
 * Validate CSV data against expected schema
 *
 * @param data - Parsed CSV data
 * @param requiredFields - Array of required field names
 * @returns Validation result
 */
function validateCsvSchema(data, requiredFields) {
    if (!data || data.length === 0) {
        return { valid: true, missingFields: [] };
    }
    const firstRow = data[0];
    const actualFields = Object.keys(firstRow);
    const missingFields = requiredFields.filter((field) => !actualFields.includes(field));
    return {
        valid: missingFields.length === 0,
        missingFields,
    };
}

;// ./src/renderer/components/organisms/DiscoveredViewWrapper.tsx

/**
 * Discovered View Wrapper Component
 *
 * Wrapper component that handles CSV data loading and passes data to DiscoveredViewTemplate.
 * This bridges the simple props interface (moduleName, csvPath) with the full template interface.
 *
 * Usage:
 * <DiscoveredViewWrapper
 *   moduleName="Exchange"
 *   csvPath="ExchangeDiscovery.csv"
 *   title="Exchange"
 *   description="Exchange mailboxes and groups"
 * />
 */



/**
 * Wrapper component that loads CSV data and renders DiscoveredViewTemplate
 */
const DiscoveredViewWrapper = ({ moduleName, csvPath, title, description, enableSearch = true, enableExport = true, 'data-cy': dataCy, }) => {
    const [searchText, setSearchText] = (0,react.useState)('');
    // Load CSV data using the hook
    const { data, columns, loading, error, lastRefresh, reload, } = useCsvDataLoader(csvPath, {
        enableAutoRefresh: true,
        refreshInterval: 30000,
    });
    // Handle search text change
    const handleSearchChange = (0,react.useCallback)((value) => {
        setSearchText(value);
    }, []);
    // Handle export
    const handleExport = (0,react.useCallback)(() => {
        if (!data || data.length === 0)
            return;
        // Create CSV content
        const headers = columns.map(col => col.field || '').join(',');
        const rows = data.map(row => columns.map(col => {
            const value = row[col.field];
            // Escape values that contain commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
        }).join(','));
        const csvContent = [headers, ...rows].join('\n');
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${moduleName}_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [data, columns, moduleName]);
    return ((0,jsx_runtime.jsx)(DiscoveredViewTemplate, { title: title, description: description, data: data, columns: columns, loading: loading, error: error, searchText: searchText, onSearchChange: handleSearchChange, onRefresh: reload, onExport: handleExport, lastRefresh: lastRefresh, enableSearch: enableSearch, enableExport: enableExport, "data-cy": dataCy }));
};
/* harmony default export */ const organisms_DiscoveredViewWrapper = ((/* unused pure expression or super */ null && (DiscoveredViewWrapper)));


/***/ }),

/***/ 59944:
/*!*******************************************************************!*\
  !*** ./src/renderer/components/organisms/VirtualizedDataGrid.tsx ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VirtualizedDataGrid: () => (/* binding */ VirtualizedDataGrid)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var ag_grid_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ag-grid-react */ 66875);
/* harmony import */ var ag_grid_enterprise__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ag-grid-enterprise */ 71652);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! lucide-react */ 72832);
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../atoms/Button */ 74160);
/* harmony import */ var _atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../atoms/Spinner */ 28709);

/**
 * VirtualizedDataGrid Component
 *
 * Enterprise-grade data grid using AG Grid Enterprise
 * Handles 100,000+ rows with virtual scrolling at 60 FPS
 */







// Lazy load AG Grid CSS - only load once when first grid mounts
let agGridStylesLoaded = false;
const loadAgGridStyles = () => {
    if (agGridStylesLoaded)
        return;
    // Dynamically import AG Grid styles
    Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(1981)]).then(__webpack_require__.bind(__webpack_require__, /*! ag-grid-community/styles/ag-grid.css */ 46479));
    Promise.all(/*! import() */[__webpack_require__.e(6412), __webpack_require__.e(9390), __webpack_require__.e(7480), __webpack_require__.e(3042), __webpack_require__.e(2985), __webpack_require__.e(9783), __webpack_require__.e(3098), __webpack_require__.e(8631), __webpack_require__.e(1155), __webpack_require__.e(6459), __webpack_require__.e(7321), __webpack_require__.e(3841), __webpack_require__.e(2093), __webpack_require__.e(7319), __webpack_require__.e(4499), __webpack_require__.e(294), __webpack_require__.e(9301), __webpack_require__.e(8508), __webpack_require__.e(9406), __webpack_require__.e(3655), __webpack_require__.e(2265), __webpack_require__.e(3136), __webpack_require__.e(2330), __webpack_require__.e(5648), __webpack_require__.e(2239), __webpack_require__.e(7284), __webpack_require__.e(1677), __webpack_require__.e(4464), __webpack_require__.e(8857), __webpack_require__.e(3498), __webpack_require__.e(7880), __webpack_require__.e(7428), __webpack_require__.e(237), __webpack_require__.e(7417), __webpack_require__.e(4261), __webpack_require__.e(9050), __webpack_require__.e(9280), __webpack_require__.e(3598), __webpack_require__.e(3587), __webpack_require__.e(5639), __webpack_require__.e(2399), __webpack_require__.e(8421), __webpack_require__.e(4242), __webpack_require__.e(3517), __webpack_require__.e(5471), __webpack_require__.e(8690), __webpack_require__.e(1165), __webpack_require__.e(3266), __webpack_require__.e(2142), __webpack_require__.e(2044), __webpack_require__.e(2507), __webpack_require__.e(4112), __webpack_require__.e(2100), __webpack_require__.e(5123), __webpack_require__.e(4538), __webpack_require__.e(7400), __webpack_require__.e(221)]).then(__webpack_require__.bind(__webpack_require__, /*! ag-grid-community/styles/ag-theme-alpine.css */ 64010));
    agGridStylesLoaded = true;
};
/**
 * High-performance data grid component
 */
function VirtualizedDataGridInner({ data, columns, loading = false, virtualRowHeight = 32, enableColumnReorder = true, enableColumnResize = true, enableExport = true, enablePrint = true, enableGrouping = false, enableFiltering = true, enableSelection = true, selectionMode = 'multiple', pagination = true, paginationPageSize = 100, onRowClick, onSelectionChange, className, height = '600px', 'data-cy': dataCy, }, ref) {
    const gridRef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
    const [gridApi, setGridApi] = react__WEBPACK_IMPORTED_MODULE_1__.useState(null);
    const [showColumnPanel, setShowColumnPanel] = react__WEBPACK_IMPORTED_MODULE_1__.useState(false);
    const rowData = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
        const result = data ?? [];
        console.log('[VirtualizedDataGrid] rowData computed:', result.length, 'rows');
        return result;
    }, [data]);
    // Load AG Grid styles on component mount
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        loadAgGridStyles();
    }, []);
    // Default column definition
    const defaultColDef = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => ({
        sortable: true,
        filter: enableFiltering,
        resizable: enableColumnResize,
        floatingFilter: enableFiltering,
        minWidth: 100,
    }), [enableFiltering, enableColumnResize]);
    // Grid options
    const gridOptions = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => ({
        rowHeight: virtualRowHeight,
        headerHeight: 40,
        floatingFiltersHeight: 40,
        suppressRowClickSelection: !enableSelection,
        rowSelection: enableSelection ? selectionMode : undefined,
        animateRows: true,
        // FIX: Disable charts to avoid error #200 (requires IntegratedChartsModule)
        enableCharts: false,
        // FIX: Use cellSelection instead of deprecated enableRangeSelection
        cellSelection: true,
        // FIX: Use legacy theme to prevent theming API conflict (error #239)
        // Must be set to 'legacy' to use v32 style themes with CSS files
        theme: 'legacy',
        statusBar: {
            statusPanels: [
                { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
                { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
                { statusPanel: 'agAggregationComponent', align: 'right' },
            ],
        },
        sideBar: enableGrouping
            ? {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                    },
                    {
                        id: 'filters',
                        labelDefault: 'Filters',
                        labelKey: 'filters',
                        iconKey: 'filter',
                        toolPanel: 'agFiltersToolPanel',
                    },
                ],
                defaultToolPanel: '',
            }
            : false,
    }), [virtualRowHeight, enableSelection, selectionMode, enableGrouping]);
    // Handle grid ready event
    const onGridReady = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((params) => {
        setGridApi(params.api);
        params.api.sizeColumnsToFit();
    }, []);
    // Handle row click
    const handleRowClick = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((event) => {
        if (onRowClick && event.data) {
            onRowClick(event.data);
        }
    }, [onRowClick]);
    // Handle selection change
    const handleSelectionChange = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)((event) => {
        if (onSelectionChange) {
            const selectedRows = event.api.getSelectedRows();
            onSelectionChange(selectedRows);
        }
    }, [onSelectionChange]);
    // Export to CSV
    const exportToCsv = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        if (gridApi) {
            gridApi.exportDataAsCsv({
                fileName: `export-${new Date().toISOString()}.csv`,
            });
        }
    }, [gridApi]);
    // Export to Excel
    const exportToExcel = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        if (gridApi) {
            gridApi.exportDataAsExcel({
                fileName: `export-${new Date().toISOString()}.xlsx`,
                sheetName: 'Data',
            });
        }
    }, [gridApi]);
    // Print grid
    const printGrid = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        if (gridApi) {
            gridApi.setGridOption('domLayout', 'print');
            setTimeout(() => {
                window.print();
                gridApi.setGridOption('domLayout', undefined);
            }, 100);
        }
    }, [gridApi]);
    // Toggle column visibility panel
    const toggleColumnPanel = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        setShowColumnPanel(!showColumnPanel);
    }, [showColumnPanel]);
    // Auto-size all columns
    const autoSizeColumns = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        if (gridApi) {
            const allColumnIds = columns.map(c => c.field).filter(Boolean);
            gridApi.autoSizeColumns(allColumnIds);
        }
    }, [gridApi, columns]);
    // Container classes
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_4__.clsx)('flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm', className);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { ref: ref, className: containerClasses, "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center gap-2", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: loading ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__.Spinner, { size: "sm" })) : (`${rowData.length.toLocaleString()} rows`) }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [enableFiltering && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Filter, { size: 16 }), onClick: () => {
                                    // Note: setFloatingFiltersHeight is deprecated in AG Grid v34
                                    // Floating filters are now controlled through column definitions
                                    console.warn('Filter toggle not yet implemented for AG Grid v34');
                                }, title: "Toggle filters", "data-cy": "toggle-filters", children: "Filters" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: showColumnPanel ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.EyeOff, { size: 16 }) : (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Eye, { size: 16 }), onClick: toggleColumnPanel, title: "Toggle column visibility", "data-cy": "toggle-columns", children: "Columns" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", onClick: autoSizeColumns, title: "Auto-size columns", "data-cy": "auto-size", children: "Auto Size" }), enableExport && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Download, { size: 16 }), onClick: exportToCsv, title: "Export to CSV", "data-cy": "export-csv", children: "CSV" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Download, { size: 16 }), onClick: exportToExcel, title: "Export to Excel", "data-cy": "export-excel", children: "Excel" })] })), enablePrint && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__.Button, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__.Printer, { size: 16 }), onClick: printGrid, title: "Print", "data-cy": "print", children: "Print" }))] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex-1 relative", children: [loading && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { "data-testid": "grid-loading", role: "status", "aria-label": "Loading data", className: "absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-10 flex items-center justify-center", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__.Spinner, { size: "lg", label: "Loading data..." }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_4__.clsx)('ag-theme-alpine', 'dark:ag-theme-alpine-dark', 'w-full'), style: { height }, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(ag_grid_react__WEBPACK_IMPORTED_MODULE_2__.AgGridReact, { ref: gridRef, rowData: rowData, columnDefs: columns, defaultColDef: defaultColDef, gridOptions: gridOptions, onGridReady: onGridReady, onRowClicked: handleRowClick, onSelectionChanged: handleSelectionChange, rowBuffer: 20, rowModelType: "clientSide", pagination: pagination, paginationPageSize: paginationPageSize, paginationAutoPageSize: false, suppressCellFocus: false, enableCellTextSelection: true, ensureDomOrder: true }) }), showColumnPanel && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto z-20", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-semibold text-sm mb-3", children: "Column Visibility" }), columns.map((col) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "flex items-center gap-2 py-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "checkbox", className: "rounded", defaultChecked: true, onChange: (e) => {
                                            if (gridApi && col.field) {
                                                gridApi.setColumnsVisible([col.field], e.target.checked);
                                            }
                                        } }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm", children: col.headerName || col.field })] }, col.field)))] }))] })] }));
}
const VirtualizedDataGrid = react__WEBPACK_IMPORTED_MODULE_1__.forwardRef(VirtualizedDataGridInner);
// Set displayName for React DevTools
VirtualizedDataGrid.displayName = 'VirtualizedDataGrid';


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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cy9vcmdhbmlzbXMvRGlzY292ZXJlZFZpZXdUZW1wbGF0ZS50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlQ3N2RGF0YUxvYWRlci50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL29yZ2FuaXNtcy9EaXNjb3ZlcmVkVmlld1dyYXBwZXIudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzLCBGcmFnbWVudCBhcyBfRnJhZ21lbnQgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogRGlzY292ZXJlZCBWaWV3IFRlbXBsYXRlIENvbXBvbmVudFxuICpcbiAqIFB1cmUgcHJlc2VudGF0aW9uIGNvbXBvbmVudCBmb3IgZGlzcGxheWluZyBDU1YgZGF0YSBmcm9tIGRpc2NvdmVyeSBtb2R1bGVzXG4gKiBQcm92aWRlcyBjb25zaXN0ZW50IFVJL1VYIGFjcm9zcyBhbGwgZGlzY292ZXJlZCBkYXRhIHZpZXdzIHdpdGggZGFyayB0aGVtZSBzdXBwb3J0XG4gKlxuICogQVJDSElURUNUVVJFOiBUaGlzIGNvbXBvbmVudCByZWNlaXZlcyBkYXRhIGFzIHByb3BzIC0gaXQgZG9lcyBOT1QgY2FsbCB1c2VDc3ZEYXRhTG9hZGVyLlxuICogSW5kaXZpZHVhbCB2aWV3cyBhcmUgcmVzcG9uc2libGUgZm9yIGNhbGxpbmcgdXNlQ3N2RGF0YUxvYWRlciBhbmQgcGFzc2luZyBkYXRhIHRvIHRoaXMgdGVtcGxhdGUuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VNZW1vLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IERvd25sb2FkLCBSZWZyZXNoQ3csIFNlYXJjaCwgQWxlcnRDaXJjbGUsIEluZm8gfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgVmlydHVhbGl6ZWREYXRhR3JpZCB9IGZyb20gJy4vVmlydHVhbGl6ZWREYXRhR3JpZCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL2F0b21zL1NwaW5uZXInO1xuLyoqXG4gKiBQdXJlIHByZXNlbnRhdGlvbiBjb21wb25lbnQgZm9yIGRpc2NvdmVyZWQgZGF0YSB2aWV3c1xuICogUmVjZWl2ZXMgZGF0YSBhcyBwcm9wcyBhbmQgcmVuZGVycyBVSSAtIGRvZXMgTk9UIGhhbmRsZSBkYXRhIGxvYWRpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IERpc2NvdmVyZWRWaWV3VGVtcGxhdGUgPSBSZWFjdC5tZW1vKGZ1bmN0aW9uIERpc2NvdmVyZWRWaWV3VGVtcGxhdGUoeyB0aXRsZSwgZGVzY3JpcHRpb24sIGRhdGEgPSBbXSwgLy8gQ1JJVElDQUw6IERlZmF1bHQgdG8gZW1wdHkgYXJyYXkgdG8gcHJldmVudCB1bmRlZmluZWQgZXJyb3JzXG5jb2x1bW5zID0gW10sIC8vIENSSVRJQ0FMOiBEZWZhdWx0IHRvIGVtcHR5IGFycmF5XG5sb2FkaW5nLCBlcnJvciwgc2VhcmNoVGV4dCwgb25TZWFyY2hDaGFuZ2UsIG9uUmVmcmVzaCwgb25FeHBvcnQsIGxhc3RSZWZyZXNoLCBlbmFibGVTZWFyY2ggPSB0cnVlLCBlbmFibGVFeHBvcnQgPSB0cnVlLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkge1xuICAgIGNvbnNvbGUubG9nKGBbRGlzY292ZXJlZFZpZXdUZW1wbGF0ZV0gPT09PT09PT09PSBSRU5ERVIgU1RBUlQgPT09PT09PT09PWApO1xuICAgIGNvbnNvbGUubG9nKGBbRGlzY292ZXJlZFZpZXdUZW1wbGF0ZV0gVGl0bGU6IFwiJHt0aXRsZX1cImApO1xuICAgIGNvbnNvbGUubG9nKGBbRGlzY292ZXJlZFZpZXdUZW1wbGF0ZV0gRGF0YTogJHtkYXRhPy5sZW5ndGggfHwgMH0gcm93c2ApO1xuICAgIGNvbnNvbGUubG9nKGBbRGlzY292ZXJlZFZpZXdUZW1wbGF0ZV0gQ29sdW1uczogJHtjb2x1bW5zPy5sZW5ndGggfHwgMH1gKTtcbiAgICBjb25zb2xlLmxvZyhgW0Rpc2NvdmVyZWRWaWV3VGVtcGxhdGVdIExvYWRpbmc6ICR7bG9hZGluZ31gKTtcbiAgICBjb25zb2xlLmxvZyhgW0Rpc2NvdmVyZWRWaWV3VGVtcGxhdGVdIEVycm9yOiAke2Vycm9yPy5tZXNzYWdlIHx8ICdub25lJ31gKTtcbiAgICBjb25zb2xlLmxvZyhgW0Rpc2NvdmVyZWRWaWV3VGVtcGxhdGVdIFNlYXJjaFRleHQ6IFwiJHtzZWFyY2hUZXh0fVwiYCk7XG4gICAgY29uc29sZS5sb2coYFtEaXNjb3ZlcmVkVmlld1RlbXBsYXRlXSBMYXN0UmVmcmVzaDogJHtsYXN0UmVmcmVzaD8udG9JU09TdHJpbmcoKSB8fCAnbnVsbCd9YCk7XG4gICAgY29uc29sZS5sb2coYFtEaXNjb3ZlcmVkVmlld1RlbXBsYXRlXSA9PT09PT09PT09IFJFTkRFUiBFTkQgPT09PT09PT09PWApO1xuICAgIC8vIEZpbHRlciBkYXRhIGJhc2VkIG9uIHNlYXJjaCB0ZXh0XG4gICAgY29uc3QgZmlsdGVyZWREYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghc2VhcmNoVGV4dC50cmltKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlYXJjaExvd2VyID0gc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gZGF0YS5maWx0ZXIoKHJvdykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXMocm93KS5zb21lKCh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSwgW2RhdGEsIHNlYXJjaFRleHRdKTtcbiAgICAvLyBDYWxjdWxhdGUgc3RhdGlzdGljc1xuICAgIGNvbnN0IHN0YXRzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbDogZGF0YS5sZW5ndGgsXG4gICAgICAgICAgICBmaWx0ZXJlZDogZmlsdGVyZWREYXRhLmxlbmd0aCxcbiAgICAgICAgfTtcbiAgICB9LCBbZGF0YS5sZW5ndGgsIGZpbHRlcmVkRGF0YS5sZW5ndGhdKTtcbiAgICAvLyBTdGFibGUgc2VsZWN0aW9uIGhhbmRsZXJcbiAgICBjb25zdCBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIC8vIFBsYWNlaG9sZGVyIGZvciBmdXR1cmUgc2VsZWN0aW9uIGhhbmRsaW5nXG4gICAgfSwgW10pO1xuICAgIC8vIERldGVjdCBpZiBlcnJvciBpcyBhIFwiZGlzY292ZXJ5IG5vdCBydW5cIiBzY2VuYXJpbyAoZmlsZSBub3QgZm91bmQpXG4gICAgY29uc3QgaXNEaXNjb3ZlcnlOb3RSdW4gPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFlcnJvcilcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBlcnJvci5tZXNzYWdlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHJldHVybiBlcnJvck1zZy5pbmNsdWRlcygnZW5vZW50JykgfHxcbiAgICAgICAgICAgIGVycm9yTXNnLmluY2x1ZGVzKCdubyBzdWNoIGZpbGUnKSB8fFxuICAgICAgICAgICAgZXJyb3JNc2cuaW5jbHVkZXMoJ2Nhbm5vdCBmaW5kJykgfHxcbiAgICAgICAgICAgIGVycm9yTXNnLmluY2x1ZGVzKCdkb2VzIG5vdCBleGlzdCcpO1xuICAgIH0sIFtlcnJvcl0pO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggZmxleC1jb2wgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJoMVwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IHRpdGxlIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIG10LTFcIiwgY2hpbGRyZW46IGRlc2NyaXB0aW9uIH0pLCBsYXN0UmVmcmVzaCAmJiAoX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS01MDAgbXQtMVwiLCBjaGlsZHJlbjogW1wiTGFzdCB1cGRhdGVkOiBcIiwgbGFzdFJlZnJlc2gudG9Mb2NhbGVUaW1lU3RyaW5nKCksIFwiIChhdXRvLXJlZnJlc2g6IDMwcylcIl0gfSkpXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4cyhCdXR0b24sIHsgdmFyaWFudDogXCJnaG9zdFwiLCBzaXplOiBcInNtXCIsIG9uQ2xpY2s6IG9uUmVmcmVzaCwgZGlzYWJsZWQ6IGxvYWRpbmcsIFwiYXJpYS1sYWJlbFwiOiBcIlJlbG9hZCBkYXRhXCIsIGNoaWxkcmVuOiBbX2pzeChSZWZyZXNoQ3csIHsgc2l6ZTogMTYsIGNsYXNzTmFtZTogY2xzeChsb2FkaW5nICYmICdhbmltYXRlLXNwaW4nKSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwibWwtMlwiLCBjaGlsZHJlbjogXCJSZWxvYWRcIiB9KV0gfSksIGVuYWJsZUV4cG9ydCAmJiBvbkV4cG9ydCAmJiAoX2pzeHMoQnV0dG9uLCB7IHZhcmlhbnQ6IFwiZ2hvc3RcIiwgc2l6ZTogXCJzbVwiLCBvbkNsaWNrOiBvbkV4cG9ydCwgZGlzYWJsZWQ6IGxvYWRpbmcsIFwiYXJpYS1sYWJlbFwiOiBcIkV4cG9ydCBkYXRhXCIsIGNoaWxkcmVuOiBbX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwibWwtMlwiLCBjaGlsZHJlbjogXCJFeHBvcnRcIiB9KV0gfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm10LTQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTQgdGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwic3BhblwiLCB7IGNoaWxkcmVuOiBbXCJUb3RhbDogXCIsIF9qc3goXCJzdHJvbmdcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IHN0YXRzLnRvdGFsLnRvTG9jYWxlU3RyaW5nKCkgfSldIH0pLCBzdGF0cy5maWx0ZXJlZCAhPT0gc3RhdHMudG90YWwgJiYgKF9qc3hzKFwic3BhblwiLCB7IGNoaWxkcmVuOiBbXCJGaWx0ZXJlZDogXCIsIF9qc3goXCJzdHJvbmdcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IHN0YXRzLmZpbHRlcmVkLnRvTG9jYWxlU3RyaW5nKCkgfSldIH0pKV0gfSldIH0pLCBlbmFibGVTZWFyY2ggJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS0zXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyZWxhdGl2ZSBtYXgtdy1tZFwiLCBjaGlsZHJlbjogW19qc3goU2VhcmNoLCB7IHNpemU6IDE4LCBjbGFzc05hbWU6IFwiYWJzb2x1dGUgbGVmdC0zIHRvcC0xLzIgdHJhbnNmb3JtIC10cmFuc2xhdGUteS0xLzIgdGV4dC1ncmF5LTQwMFwiIH0pLCBfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwiU2VhcmNoLi4uXCIsIHZhbHVlOiBzZWFyY2hUZXh0LCBvbkNoYW5nZTogKGUpID0+IG9uU2VhcmNoQ2hhbmdlKGUudGFyZ2V0LnZhbHVlKSwgY2xhc3NOYW1lOiBjbHN4KCd3LWZ1bGwgcGwtMTAgcHItNCBweS0yIHJvdW5kZWQtbGcnLCAnYmctZ3JheS01MCBkYXJrOmJnLWdyYXktNzAwJywgJ2JvcmRlciBib3JkZXItZ3JheS0zMDAgZGFyazpib3JkZXItZ3JheS02MDAnLCAndGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUnLCAncGxhY2Vob2xkZXItZ3JheS01MDAgZGFyazpwbGFjZWhvbGRlci1ncmF5LTQwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgZGFyazpmb2N1czpyaW5nLWJsdWUtNDAwJywgJ3RyYW5zaXRpb24tY29sb3JzJyksIFwiYXJpYS1sYWJlbFwiOiBcIlNlYXJjaCBkaXNjb3ZlcmVkIGRhdGFcIiB9KV0gfSkgfSkpLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcC02IG92ZXJmbG93LWhpZGRlblwiLCBjaGlsZHJlbjogW2xvYWRpbmcgJiYgZGF0YS5sZW5ndGggPT09IDAgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goU3Bpbm5lciwgeyBzaXplOiBcImxnXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcIm10LTQgdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiTG9hZGluZyBkYXRhLi4uXCIgfSldIH0pIH0pKSwgZXJyb3IgJiYgIWxvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyIG1heC13LW1kXCIsIGNoaWxkcmVuOiBpc0Rpc2NvdmVyeU5vdFJ1biA/IChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KEluZm8sIHsgc2l6ZTogNDgsIGNsYXNzTmFtZTogXCJ0ZXh0LWJsdWUtNTAwIG14LWF1dG8gbWItNFwiIH0pLCBfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlIG1iLTJcIiwgY2hpbGRyZW46IFwiRGlzY292ZXJ5IE5vdCBSdW5cIiB9KSwgX2pzeHMoXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDAgbWItMlwiLCBjaGlsZHJlbjogW1wiVGhlIFwiLCBfanN4KFwic3Ryb25nXCIsIHsgY2hpbGRyZW46IHRpdGxlIH0pLCBcIiBkaXNjb3ZlcnkgbW9kdWxlIGhhcyBub3QgYmVlbiBleGVjdXRlZCB5ZXQuXCJdIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1iLTRcIiwgY2hpbGRyZW46IFwiUnVuIHRoZSBkaXNjb3ZlcnkgbW9kdWxlIGZyb20gdGhlIERpc2NvdmVyeSB0YWIgdG8gcG9wdWxhdGUgdGhpcyB2aWV3IHdpdGggZGF0YS5cIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1ibHVlLTUwIGRhcms6YmctYmx1ZS05MDAvMjAgYm9yZGVyIGJvcmRlci1ibHVlLTIwMCBkYXJrOmJvcmRlci1ibHVlLTgwMCByb3VuZGVkLWxnIHAtMyBtYi00XCIsIGNoaWxkcmVuOiBfanN4cyhcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC14cyB0ZXh0LWJsdWUtNzAwIGRhcms6dGV4dC1ibHVlLTMwMCB0ZXh0LWxlZnRcIiwgY2hpbGRyZW46IFtfanN4KFwic3Ryb25nXCIsIHsgY2hpbGRyZW46IFwiVGlwOlwiIH0pLCBcIiBOYXZpZ2F0ZSB0byB0aGUgRGlzY292ZXJ5IHRhYiwgc2VsZWN0IFwiLCB0aXRsZSwgXCIsIGNvbmZpZ3VyZSB0aGUgdGFyZ2V0IGVudmlyb25tZW50LCBhbmQgY2xpY2sgXFxcIlN0YXJ0IERpc2NvdmVyeVxcXCIgdG8gY29sbGVjdCBkYXRhLlwiXSB9KSB9KV0gfSkpIDogKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgc2l6ZTogNDgsIGNsYXNzTmFtZTogXCJ0ZXh0LXJlZC01MDAgbXgtYXV0byBtYi00XCIgfSksIF9qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgbWItMlwiLCBjaGlsZHJlbjogXCJFcnJvciBMb2FkaW5nIERhdGFcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCBtYi00XCIsIGNoaWxkcmVuOiBlcnJvci5tZXNzYWdlIH0pLCBfanN4cyhCdXR0b24sIHsgb25DbGljazogb25SZWZyZXNoLCB2YXJpYW50OiBcInByaW1hcnlcIiwgY2hpbGRyZW46IFtfanN4KFJlZnJlc2hDdywgeyBzaXplOiAxNiB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwibWwtMlwiLCBjaGlsZHJlbjogXCJUcnkgQWdhaW5cIiB9KV0gfSldIH0pKSB9KSB9KSksICFsb2FkaW5nICYmICFlcnJvciAmJiBmaWx0ZXJlZERhdGEubGVuZ3RoID09PSAwICYmIGRhdGEubGVuZ3RoID09PSAwICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiTm8gZGF0YSBhdmFpbGFibGVcIiB9KSB9KSB9KSksICFsb2FkaW5nICYmICFlcnJvciAmJiBmaWx0ZXJlZERhdGEubGVuZ3RoID09PSAwICYmIGRhdGEubGVuZ3RoID4gMCAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIk5vIHJlc3VsdHMgbWF0Y2ggeW91ciBzZWFyY2hcIiB9KSB9KSB9KSksICFlcnJvciAmJiAoZmlsdGVyZWREYXRhLmxlbmd0aCA+IDAgfHwgbG9hZGluZykgJiYgKF9qc3goVmlydHVhbGl6ZWREYXRhR3JpZCwgeyBkYXRhOiBmaWx0ZXJlZERhdGEsIGNvbHVtbnM6IGNvbHVtbnMsIGxvYWRpbmc6IGxvYWRpbmcsIG9uU2VsZWN0aW9uQ2hhbmdlOiBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UsIGVuYWJsZUV4cG9ydDogZW5hYmxlRXhwb3J0LCBlbmFibGVHcm91cGluZzogdHJ1ZSwgaGVpZ2h0OiBcImNhbGMoMTAwdmggLSAyODBweClcIiwgXCJkYXRhLWN5XCI6IGAke2RhdGFDeX0tZ3JpZGAgfSkpXSB9KV0gfSkpO1xufSwgKHByZXZQcm9wcywgbmV4dFByb3BzKSA9PiB7XG4gICAgLy8gQ3VzdG9tIGNvbXBhcmlzb24gdG8gcHJldmVudCB1bm5lY2Vzc2FyeSByZS1yZW5kZXJzXG4gICAgcmV0dXJuIChwcmV2UHJvcHMuZGF0YSA9PT0gbmV4dFByb3BzLmRhdGEgJiZcbiAgICAgICAgcHJldlByb3BzLmNvbHVtbnMgPT09IG5leHRQcm9wcy5jb2x1bW5zICYmXG4gICAgICAgIHByZXZQcm9wcy5sb2FkaW5nID09PSBuZXh0UHJvcHMubG9hZGluZyAmJlxuICAgICAgICBwcmV2UHJvcHMuZXJyb3IgPT09IG5leHRQcm9wcy5lcnJvciAmJlxuICAgICAgICBwcmV2UHJvcHMuc2VhcmNoVGV4dCA9PT0gbmV4dFByb3BzLnNlYXJjaFRleHQgJiZcbiAgICAgICAgcHJldlByb3BzLmxhc3RSZWZyZXNoID09PSBuZXh0UHJvcHMubGFzdFJlZnJlc2gpO1xufSk7XG4iLCIvKipcbiAqIENTViBEYXRhIExvYWRlciBIb29rXG4gKlxuICogUHJvdmlkZXMgc3RhbmRhcmRpemVkIENTViBsb2FkaW5nIGZ1bmN0aW9uYWxpdHkgZm9yIGRpc2NvdmVyZWQgZGF0YSB2aWV3c1xuICogd2l0aCBlcnJvciBoYW5kbGluZywgdmFsaWRhdGlvbiwgYXV0by1yZWZyZXNoLCBhbmQgbG9jYWwgZmlsZSByZXN0cmljdGlvbnMuXG4gKlxuICogRmVhdHVyZXM6XG4gKiAtIDMwLXNlY29uZCBhdXRvLXJlZnJlc2ggY3ljbGVzIChjb25maWd1cmFibGUpXG4gKiAtIEV4cG9uZW50aWFsIGJhY2tvZmYgcmV0cnkgb24gZmFpbHVyZVxuICogLSBQYXNjYWxDYXNlLWF3YXJlIGNvbHVtbiBnZW5lcmF0aW9uXG4gKiAtIE1lbW9yeS1lZmZpY2llbnQgY2xlYW51cFxuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjaywgdXNlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFBhcGEgZnJvbSAncGFwYXBhcnNlJztcbmltcG9ydCB7IHVzZVByb2ZpbGVTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZVByb2ZpbGVTdG9yZSc7XG4vKipcbiAqIExvYWQgYW5kIHBhcnNlIENTViBkYXRhIGZyb20gbG9jYWwgZmlsZSBwYXRoXG4gKlxuICogU2VjdXJpdHk6IE9ubHkgbG9hZHMgZmlsZXMgZnJvbSBndWl2Mi9wdWJsaWMvZGlzY292ZXJ5LyBkaXJlY3RvcnlcbiAqIFBlcmZvcm1hbmNlOiBJbXBsZW1lbnRzIHJvdyBsaW1pdHMgYW5kIGZpbGUgc2l6ZSByZXN0cmljdGlvbnNcbiAqXG4gKiBAcGFyYW0gY3N2UGF0aCAtIFJlbGF0aXZlIHBhdGggdG8gQ1NWIGZpbGUgKGUuZy4sICdhd3MvcmVzdWx0cy5jc3YnKVxuICogQHBhcmFtIG9wdGlvbnMgLSBMb2FkaW5nIG9wdGlvbnNcbiAqIEByZXR1cm5zIENTViBsb2FkZXIgcmVzdWx0IHdpdGggZGF0YSwgbG9hZGluZywgYW5kIGVycm9yIHN0YXRlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQ3N2RGF0YUxvYWRlcihjc3ZQYXRoLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7IG1heEZpbGVTaXplID0gNTAgKiAxMDI0ICogMTAyNCwgLy8gNTBNQlxuICAgIG1heFJvd3MgPSAxMDAwMDAsIHRyYW5zZm9ybSwgb25FcnJvciwgZW5hYmxlQXV0b1JlZnJlc2ggPSB0cnVlLCByZWZyZXNoSW50ZXJ2YWwgPSAzMDAwMCwgLy8gMzAgc2Vjb25kc1xuICAgIG9uU3VjY2VzcywgfSA9IG9wdGlvbnM7XG4gICAgLy8gR2V0IGN1cnJlbnQgcHJvZmlsZSB0byBkZXRlcm1pbmUgZGF0YSBwYXRoXG4gICAgY29uc3QgeyBzZWxlY3RlZFNvdXJjZVByb2ZpbGUgfSA9IHVzZVByb2ZpbGVTdG9yZSgpO1xuICAgIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbY29sdW1ucywgc2V0Q29sdW1uc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Jhd0Nzdiwgc2V0UmF3Q3N2XSA9IHVzZVN0YXRlKCk7XG4gICAgY29uc3QgW2xhc3RSZWZyZXNoLCBzZXRMYXN0UmVmcmVzaF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbcmVsb2FkQ291bnRlciwgc2V0UmVsb2FkQ291bnRlcl0gPSB1c2VTdGF0ZSgwKTtcbiAgICBjb25zdCBpbnRlcnZhbFJlZiA9IHVzZVJlZigpO1xuICAgIGNvbnN0IHJldHJ5Q291bnRSZWYgPSB1c2VSZWYoMCk7XG4gICAgY29uc3QgbWF4UmV0cmllcyA9IDM7XG4gICAgY29uc3QgaXNVbm1vdW50ZWRSZWYgPSB1c2VSZWYoZmFsc2UpO1xuICAgIGNvbnN0IG1vdW50Q291bnRSZWYgPSB1c2VSZWYoMCk7XG4gICAgY29uc3QgbGFzdE1vdW50VGltZVJlZiA9IHVzZVJlZigwKTtcbiAgICBjb25zdCBwcmV2Q3N2UGF0aFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBsb2FkSW5Qcm9ncmVzc1JlZiA9IHVzZVJlZihmYWxzZSk7XG4gICAgY29uc3QgcmVsb2FkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnW3VzZUNzdkRhdGFMb2FkZXJdIE1hbnVhbCByZWxvYWQgdHJpZ2dlcmVkJyk7XG4gICAgICAgIHJldHJ5Q291bnRSZWYuY3VycmVudCA9IDA7IC8vIFJlc2V0IHJldHJ5IGNvdW50IG9uIG1hbnVhbCByZWxvYWRcbiAgICAgICAgc2V0UmVsb2FkQ291bnRlcigoYykgPT4gYyArIDEpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBDUklUSUNBTCBERUJVRzogVHJhY2sgbG9hZGluZyBzdGF0ZSBjaGFuZ2VzXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYFt1c2VDc3ZEYXRhTG9hZGVyXSDwn5SEIExvYWRpbmcgc3RhdGUgY2hhbmdlZCB0bzogJHtsb2FkaW5nfWApO1xuICAgIH0sIFtsb2FkaW5nXSk7XG4gICAgLy8gQ1JJVElDQUwgREVCVUc6IFRyYWNrIGRhdGEgc3RhdGUgY2hhbmdlc1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdXNlQ3N2RGF0YUxvYWRlcl0g8J+TiiBEYXRhIHN0YXRlIGNoYW5nZWQgdG86ICR7ZGF0YS5sZW5ndGh9IHJvd3NgKTtcbiAgICB9LCBbZGF0YV0pO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIG1vdW50Q291bnRSZWYuY3VycmVudCArPSAxO1xuICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICBjb25zdCB0aW1lU2luY2VMYXN0TW91bnQgPSBub3cgLSBsYXN0TW91bnRUaW1lUmVmLmN1cnJlbnQ7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbdXNlQ3N2RGF0YUxvYWRlcl0g4pqZ77iPICBFZmZlY3QgdHJpZ2dlcmVkIC0gTW91bnQgIyR7bW91bnRDb3VudFJlZi5jdXJyZW50fSwgdGltZVNpbmNlOiAke3RpbWVTaW5jZUxhc3RNb3VudH1tcywgY3N2UGF0aDogJHtjc3ZQYXRofWApO1xuICAgICAgICBsYXN0TW91bnRUaW1lUmVmLmN1cnJlbnQgPSBub3c7XG4gICAgICAgIGlzVW5tb3VudGVkUmVmLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgLy8gQ1JJVElDQUw6IFJlc2V0IGxvYWRJblByb2dyZXNzUmVmIG9uIGVhY2ggbW91bnQgdG8gcHJldmVudCBzdGFsZSBzdGF0ZSBmcm9tIFJlYWN0IFN0cmljdCBNb2RlIGRvdWJsZS1tb3VudFxuICAgICAgICBpZiAobW91bnRDb3VudFJlZi5jdXJyZW50ID4gMSAmJiBsb2FkSW5Qcm9ncmVzc1JlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW3VzZUNzdkRhdGFMb2FkZXJdIOKaoO+4jyAgUmVzZXR0aW5nIHN0YWxlIGxvYWRJblByb2dyZXNzUmVmIGZyb20gcHJldmlvdXMgbW91bnRgKTtcbiAgICAgICAgICAgIGxvYWRJblByb2dyZXNzUmVmLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNzdlBhdGgpIHtcbiAgICAgICAgICAgIHNldERhdGEoW10pO1xuICAgICAgICAgICAgc2V0Q29sdW1ucyhbXSk7XG4gICAgICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIFZhbGlkYXRlIHBhdGggLSBvbmx5IGFsbG93IGZpbGVzIGluIGRpc2NvdmVyeSBkaXJlY3RvcnlcbiAgICAgICAgaWYgKGNzdlBhdGguaW5jbHVkZXMoJy4uJykgfHwgY3N2UGF0aC5zdGFydHNXaXRoKCcvJykgfHwgY3N2UGF0aC5zdGFydHNXaXRoKCdcXFxcJykpIHtcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcignSW52YWxpZCBDU1YgcGF0aDogUGF0aCBtdXN0IGJlIHJlbGF0aXZlIGFuZCB3aXRoaW4gZGlzY292ZXJ5IGRpcmVjdG9yeScpO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyKTtcbiAgICAgICAgICAgIG9uRXJyb3I/LihlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxvYWRDc3ZEYXRhID0gYXN5bmMgKGlzUmV0cnkgPSBmYWxzZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGxvYWRJblByb2dyZXNzUmVmLmN1cnJlbnQgfHwgaXNVbm1vdW50ZWRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbdXNlQ3N2RGF0YUxvYWRlcl0gTG9hZCBhbHJlYWR5IGluIHByb2dyZXNzIG9yIHVubW91bnRlZCwgc2tpcHBpbmcnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2FkSW5Qcm9ncmVzc1JlZi5jdXJyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIENSSVRJQ0FMOiBDaGVjayBpZiB1bm1vdW50ZWQgQkVGT1JFIHNldHRpbmcgbG9hZGluZyB0byB0cnVlXG4gICAgICAgICAgICBpZiAoaXNVbm1vdW50ZWRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW3VzZUNzdkRhdGFMb2FkZXJdIOKaoO+4jyAgQ29tcG9uZW50IHVubW91bnRlZCBiZWZvcmUgc2V0TG9hZGluZywgYWJvcnRpbmcnKTtcbiAgICAgICAgICAgICAgICBsb2FkSW5Qcm9ncmVzc1JlZi5jdXJyZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdXNlQ3N2RGF0YUxvYWRlcl0g8J+UhCBzZXRMb2FkaW5nKHRydWUpIGNhbGxlZGApO1xuICAgICAgICAgICAgaWYgKCFpc1JldHJ5KSB7XG4gICAgICAgICAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIEdldCBiYXNlIHBhdGggZnJvbSBwcm9maWxlXG4gICAgICAgICAgICAgICAgY29uc3QgYmFzZVBhdGggPSBzZWxlY3RlZFNvdXJjZVByb2ZpbGU/LmRhdGFQYXRoIHx8ICdDOlxcXFxEaXNjb3ZlcnlEYXRhXFxcXGxqcG9wcyc7XG4gICAgICAgICAgICAgICAgY29uc3QgcmF3RGlyID0gYCR7YmFzZVBhdGh9XFxcXFJhd2A7XG4gICAgICAgICAgICAgICAgLy8gQ29uc3RydWN0IGZ1bGwgZmlsZSBwYXRoXG4gICAgICAgICAgICAgICAgY29uc3QgZnVsbFBhdGggPSBgJHtyYXdEaXJ9XFxcXCR7Y3N2UGF0aC5yZXBsYWNlKC9eXFwvKy8sICcnKX1gO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdXNlQ3N2RGF0YUxvYWRlcl0gTG9hZGluZyBDU1YgZnJvbTogJHtmdWxsUGF0aH1gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3VzZUNzdkRhdGFMb2FkZXJdIFByb2ZpbGU6ICR7c2VsZWN0ZWRTb3VyY2VQcm9maWxlPy5jb21wYW55TmFtZSB8fCAnbGpwb3BzJ31gKTtcbiAgICAgICAgICAgICAgICAvLyBSZWFkIENTViBmaWxlIHVzaW5nIEVsZWN0cm9uIEFQSVxuICAgICAgICAgICAgICAgIGNvbnN0IGNzdlRleHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZnMucmVhZEZpbGUoZnVsbFBhdGgsICd1dGY4Jyk7XG4gICAgICAgICAgICAgICAgLy8gQ1JJVElDQUw6IENoZWNrIGFnYWluIGFmdGVyIGFzeW5jIG9wZXJhdGlvblxuICAgICAgICAgICAgICAgIGlmIChpc1VubW91bnRlZFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW3VzZUNzdkRhdGFMb2FkZXJdIOKaoO+4jyAgQ29tcG9uZW50IHVubW91bnRlZCBhZnRlciByZWFkRmlsZSwgYWJvcnRpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgbG9hZEluUHJvZ3Jlc3NSZWYuY3VycmVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghY3N2VGV4dCB8fCBjc3ZUZXh0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENTViBmaWxlIGlzIGVtcHR5OiAke2Z1bGxQYXRofWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDaGVjayBmaWxlIHNpemVcbiAgICAgICAgICAgICAgICBpZiAoY3N2VGV4dC5sZW5ndGggPiBtYXhGaWxlU2l6ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENTViBmaWxlIGV4Y2VlZHMgbWF4aW11bSBzaXplIG9mICR7bWF4RmlsZVNpemUgLyAxMDI0IC8gMTAyNH1NQmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXRSYXdDc3YoY3N2VGV4dCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt1c2VDc3ZEYXRhTG9hZGVyXSBDU1YgbG9hZGVkIHN1Y2Nlc3NmdWxseSwgc2l6ZTogJHtjc3ZUZXh0Lmxlbmd0aH0gYnl0ZXNgKTtcbiAgICAgICAgICAgICAgICAvLyBQYXJzZSBDU1Ygd2l0aCBQYXBhUGFyc2VcbiAgICAgICAgICAgICAgICBQYXBhLnBhcnNlKGNzdlRleHQsIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBkeW5hbWljVHlwaW5nOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBza2lwRW1wdHlMaW5lczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtSGVhZGVyOiAoaGVhZGVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBQcmVzZXJ2ZSBQYXNjYWxDYXNlIGZyb20gUG93ZXJTaGVsbCBvdXRwdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoZWFkZXIudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogKHJlc3VsdHMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1VubW91bnRlZFJlZi5jdXJyZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdXNlQ3N2RGF0YUxvYWRlcl0gUGFyc2VkICR7cmVzdWx0cy5kYXRhLmxlbmd0aH0gcm93c2ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgcm93IGxpbWl0XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0cy5kYXRhLmxlbmd0aCA+IG1heFJvd3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYFt1c2VDc3ZEYXRhTG9hZGVyXSBSb3cgY291bnQgJHtyZXN1bHRzLmRhdGEubGVuZ3RofSBleGNlZWRzIGxpbWl0ICR7bWF4Um93c30sIHRydW5jYXRpbmdgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLmRhdGEgPSByZXN1bHRzLmRhdGEuc2xpY2UoMCwgbWF4Um93cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBcHBseSB0cmFuc2Zvcm1hdGlvbiBpZiBwcm92aWRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbmFsRGF0YSA9IHJlc3VsdHMuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5hbERhdGEgPSB0cmFuc2Zvcm0ocmVzdWx0cy5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt1c2VDc3ZEYXRhTG9hZGVyXSBUcmFuc2Zvcm1lZCBkYXRhOiAke2ZpbmFsRGF0YS5sZW5ndGh9IHJvd3NgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKHRyYW5zZm9ybUVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1t1c2VDc3ZEYXRhTG9hZGVyXSBUcmFuc2Zvcm0gZXJyb3I6JywgdHJhbnNmb3JtRXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYERhdGEgdHJhbnNmb3JtYXRpb24gZmFpbGVkOiAke3RyYW5zZm9ybUVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyB0cmFuc2Zvcm1FcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIEFHIEdyaWQgY29sdW1ucyBmcm9tIENTViBoZWFkZXJzIChDUklUSUNBTDogcHJlc2VydmUgUGFzY2FsQ2FzZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpZWxkcyA9IHJlc3VsdHMubWV0YS5maWVsZHMgfHwgW107XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBnZW5lcmF0ZWRDb2x1bW5zID0gZmllbGRzLm1hcChmaWVsZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCBQYXNjYWxDYXNlIHRvIHJlYWRhYmxlIGhlYWRlcjogXCJEaXNwbGF5TmFtZVwiIOKGkiBcIkRpc3BsYXkgTmFtZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVhZGVyTmFtZSA9IGZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8oW0EtWl0pL2csICcgJDEnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudHJpbSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9eLi8sIHN0ciA9PiBzdHIudG9VcHBlckNhc2UoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGQ6IGZpZWxkLCAvLyBDUklUSUNBTDogS2VlcCBvcmlnaW5hbCBQYXNjYWxDYXNlIGZpZWxkIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyTmFtZTogaGVhZGVyTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzaXphYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFt1c2VDc3ZEYXRhTG9hZGVyXSBHZW5lcmF0ZWQgJHtnZW5lcmF0ZWRDb2x1bW5zLmxlbmd0aH0gY29sdW1uczpgLCBnZW5lcmF0ZWRDb2x1bW5zLm1hcChjID0+IGMuZmllbGQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIExvZyBwYXJzaW5nIGVycm9ycyAobm9uLWZhdGFsKVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdHMuZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1t1c2VDc3ZEYXRhTG9hZGVyXSBQYXJzZSB3YXJuaW5nczonLCByZXN1bHRzLmVycm9ycyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDUklUSUNBTDogVXBkYXRlIHN0YXRlIGluIGNvcnJlY3Qgb3JkZXIgdG8gcHJldmVudCByYWNlIGNvbmRpdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNVbm1vdW50ZWRSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldERhdGEoZmluYWxEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRDb2x1bW5zKGdlbmVyYXRlZENvbHVtbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldExhc3RSZWZyZXNoKG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHJ5Q291bnRSZWYuY3VycmVudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ1JJVElDQUw6IFNldCBsb2FkaW5nIHRvIGZhbHNlIExBU1QgYW5kIGxvZyBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRJblByb2dyZXNzUmVmLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3VzZUNzdkRhdGFMb2FkZXJdIOKchSBTVUNDRVNTOiBEYXRhIGxvYWRlZCwgbG9hZGluZyBzZXQgdG8gRkFMU0VgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW3VzZUNzdkRhdGFMb2FkZXJdIOKchSBEYXRhOiAke2ZpbmFsRGF0YS5sZW5ndGh9IHJvd3MsIENvbHVtbnM6ICR7Z2VuZXJhdGVkQ29sdW1ucy5sZW5ndGh9YCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzPy4oZmluYWxEYXRhLCBnZW5lcmF0ZWRDb2x1bW5zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW3VzZUNzdkRhdGFMb2FkZXJdIOKaoO+4jyAgQ29tcG9uZW50IHVubW91bnRlZCBkdXJpbmcgcGFyc2UsIHNraXBwaW5nIHN0YXRlIHVwZGF0ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogKHBhcnNlRXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihgQ1NWIHBhcnNlIGVycm9yOiAke3BhcnNlRXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1t1c2VDc3ZEYXRhTG9hZGVyXSBQYXJzZSBlcnJvcjonLCBwYXJzZUVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRJblByb2dyZXNzUmVmLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3I/LihlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChpc1VubW91bnRlZFJlZi5jdXJyZW50KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyciA6IG5ldyBFcnJvcignVW5rbm93biBlcnJvciBsb2FkaW5nIENTVicpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1t1c2VDc3ZEYXRhTG9hZGVyXSBMb2FkIGVycm9yOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICBzZXRFcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgLy8gUmV0cnkgbG9naWMgd2l0aCBleHBvbmVudGlhbCBiYWNrb2ZmXG4gICAgICAgICAgICAgICAgaWYgKCFpc1JldHJ5ICYmIHJldHJ5Q291bnRSZWYuY3VycmVudCA8IG1heFJldHJpZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0cnlDb3VudFJlZi5jdXJyZW50Kys7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJldHJ5RGVsYXkgPSBNYXRoLm1pbigxMDAwICogTWF0aC5wb3coMiwgcmV0cnlDb3VudFJlZi5jdXJyZW50KSwgNTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdXNlQ3N2RGF0YUxvYWRlcl0gUmV0cnkgJHtyZXRyeUNvdW50UmVmLmN1cnJlbnR9LyR7bWF4UmV0cmllc30gaW4gJHtyZXRyeURlbGF5fW1zYCk7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1VubW91bnRlZFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZENzdkRhdGEodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHJldHJ5RGVsYXkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgICAgIGxvYWRJblByb2dyZXNzUmVmLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBvbkVycm9yPy4oZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvLyBPbmx5IGxvYWQgb24gZmlyc3QgbW91bnQgb3Igd2hlbiBjc3ZQYXRoIGNoYW5nZXNcbiAgICAgICAgY29uc3Qgc2hvdWxkTG9hZCA9IG1vdW50Q291bnRSZWYuY3VycmVudCA9PT0gMSB8fCBjc3ZQYXRoICE9PSBwcmV2Q3N2UGF0aFJlZi5jdXJyZW50O1xuICAgICAgICBwcmV2Q3N2UGF0aFJlZi5jdXJyZW50ID0gY3N2UGF0aDtcbiAgICAgICAgaWYgKHNob3VsZExvYWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdXNlQ3N2RGF0YUxvYWRlcl0gSW5pdGlhbCBsb2FkIChtb3VudDogJHttb3VudENvdW50UmVmLmN1cnJlbnR9LCBwYXRoOiAke2NzdlBhdGh9KWApO1xuICAgICAgICAgICAgbG9hZENzdkRhdGEoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdXNlQ3N2RGF0YUxvYWRlcl0gU2tpcHBpbmcgbG9hZCAtIG5vIHBhdGggY2hhbmdlIChtb3VudDogJHttb3VudENvdW50UmVmLmN1cnJlbnR9KWApO1xuICAgICAgICAgICAgLy8gQ1JJVElDQUw6IEVuc3VyZSBsb2FkaW5nIHN0YXlzIGZhbHNlIHdoZW4gd2Ugc2tpcCB0aGUgbG9hZFxuICAgICAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW3VzZUNzdkRhdGFMb2FkZXJdIOKchSBFbnN1cmVkIGxvYWRpbmc9ZmFsc2Ugc2luY2Ugc2tpcHBpbmcgbG9hZGApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNldHVwIGF1dG8tcmVmcmVzaCBPTkxZIG9uIGZpcnN0IG1vdW50XG4gICAgICAgIGlmIChlbmFibGVBdXRvUmVmcmVzaCAmJiBtb3VudENvdW50UmVmLmN1cnJlbnQgPT09IDEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdXNlQ3N2RGF0YUxvYWRlcl0gU3RhcnRpbmcgYXV0by1yZWZyZXNoICgke3JlZnJlc2hJbnRlcnZhbH1tcyBpbnRlcnZhbCwgbW91bnQ6ICR7bW91bnRDb3VudFJlZi5jdXJyZW50fSlgKTtcbiAgICAgICAgICAgIGludGVydmFsUmVmLmN1cnJlbnQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1VubW91bnRlZFJlZi5jdXJyZW50ICYmICFsb2FkSW5Qcm9ncmVzc1JlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbdXNlQ3N2RGF0YUxvYWRlcl0gQXV0by1yZWZyZXNoIHRyaWdnZXJlZCcpO1xuICAgICAgICAgICAgICAgICAgICBsb2FkQ3N2RGF0YSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHJlZnJlc2hJbnRlcnZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZW5hYmxlQXV0b1JlZnJlc2gpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbdXNlQ3N2RGF0YUxvYWRlcl0gU2tpcHBpbmcgYXV0by1yZWZyZXNoIHNldHVwIC0gYWxyZWFkeSBpbml0aWFsaXplZCAobW91bnQ6ICR7bW91bnRDb3VudFJlZi5jdXJyZW50fSlgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDbGVhbnVwIG9uIHVubW91bnRcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGlzVW5tb3VudGVkUmVmLmN1cnJlbnQgPSB0cnVlO1xuICAgICAgICAgICAgbG9hZEluUHJvZ3Jlc3NSZWYuY3VycmVudCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGludGVydmFsUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW3VzZUNzdkRhdGFMb2FkZXJdIENsZWFyaW5nIGF1dG8tcmVmcmVzaCBpbnRlcnZhbCBvbiB1bm1vdW50Jyk7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbFJlZi5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICBpbnRlcnZhbFJlZi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0sIFtjc3ZQYXRoLCByZWxvYWRDb3VudGVyXSk7IC8vIE1JTklNQUwgZGVwZW5kZW5jaWVzIHRvIHByZXZlbnQgbG9vcHNcbiAgICByZXR1cm4ge1xuICAgICAgICBkYXRhLFxuICAgICAgICBjb2x1bW5zLFxuICAgICAgICBsb2FkaW5nLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgcmF3Q3N2LFxuICAgICAgICBsYXN0UmVmcmVzaCxcbiAgICAgICAgcmVsb2FkLFxuICAgIH07XG59XG4vKipcbiAqIFZhbGlkYXRlIENTViBkYXRhIGFnYWluc3QgZXhwZWN0ZWQgc2NoZW1hXG4gKlxuICogQHBhcmFtIGRhdGEgLSBQYXJzZWQgQ1NWIGRhdGFcbiAqIEBwYXJhbSByZXF1aXJlZEZpZWxkcyAtIEFycmF5IG9mIHJlcXVpcmVkIGZpZWxkIG5hbWVzXG4gKiBAcmV0dXJucyBWYWxpZGF0aW9uIHJlc3VsdFxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDc3ZTY2hlbWEoZGF0YSwgcmVxdWlyZWRGaWVsZHMpIHtcbiAgICBpZiAoIWRhdGEgfHwgZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIG1pc3NpbmdGaWVsZHM6IFtdIH07XG4gICAgfVxuICAgIGNvbnN0IGZpcnN0Um93ID0gZGF0YVswXTtcbiAgICBjb25zdCBhY3R1YWxGaWVsZHMgPSBPYmplY3Qua2V5cyhmaXJzdFJvdyk7XG4gICAgY29uc3QgbWlzc2luZ0ZpZWxkcyA9IHJlcXVpcmVkRmllbGRzLmZpbHRlcigoZmllbGQpID0+ICFhY3R1YWxGaWVsZHMuaW5jbHVkZXMoZmllbGQpKTtcbiAgICByZXR1cm4ge1xuICAgICAgICB2YWxpZDogbWlzc2luZ0ZpZWxkcy5sZW5ndGggPT09IDAsXG4gICAgICAgIG1pc3NpbmdGaWVsZHMsXG4gICAgfTtcbn1cbiIsImltcG9ydCB7IGpzeCBhcyBfanN4IH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIERpc2NvdmVyZWQgVmlldyBXcmFwcGVyIENvbXBvbmVudFxuICpcbiAqIFdyYXBwZXIgY29tcG9uZW50IHRoYXQgaGFuZGxlcyBDU1YgZGF0YSBsb2FkaW5nIGFuZCBwYXNzZXMgZGF0YSB0byBEaXNjb3ZlcmVkVmlld1RlbXBsYXRlLlxuICogVGhpcyBicmlkZ2VzIHRoZSBzaW1wbGUgcHJvcHMgaW50ZXJmYWNlIChtb2R1bGVOYW1lLCBjc3ZQYXRoKSB3aXRoIHRoZSBmdWxsIHRlbXBsYXRlIGludGVyZmFjZS5cbiAqXG4gKiBVc2FnZTpcbiAqIDxEaXNjb3ZlcmVkVmlld1dyYXBwZXJcbiAqICAgbW9kdWxlTmFtZT1cIkV4Y2hhbmdlXCJcbiAqICAgY3N2UGF0aD1cIkV4Y2hhbmdlRGlzY292ZXJ5LmNzdlwiXG4gKiAgIHRpdGxlPVwiRXhjaGFuZ2VcIlxuICogICBkZXNjcmlwdGlvbj1cIkV4Y2hhbmdlIG1haWxib3hlcyBhbmQgZ3JvdXBzXCJcbiAqIC8+XG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEaXNjb3ZlcmVkVmlld1RlbXBsYXRlIH0gZnJvbSAnLi9EaXNjb3ZlcmVkVmlld1RlbXBsYXRlJztcbmltcG9ydCB7IHVzZUNzdkRhdGFMb2FkZXIgfSBmcm9tICcuLi8uLi9ob29rcy91c2VDc3ZEYXRhTG9hZGVyJztcbi8qKlxuICogV3JhcHBlciBjb21wb25lbnQgdGhhdCBsb2FkcyBDU1YgZGF0YSBhbmQgcmVuZGVycyBEaXNjb3ZlcmVkVmlld1RlbXBsYXRlXG4gKi9cbmV4cG9ydCBjb25zdCBEaXNjb3ZlcmVkVmlld1dyYXBwZXIgPSAoeyBtb2R1bGVOYW1lLCBjc3ZQYXRoLCB0aXRsZSwgZGVzY3JpcHRpb24sIGVuYWJsZVNlYXJjaCA9IHRydWUsIGVuYWJsZUV4cG9ydCA9IHRydWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgY29uc3QgW3NlYXJjaFRleHQsIHNldFNlYXJjaFRleHRdID0gdXNlU3RhdGUoJycpO1xuICAgIC8vIExvYWQgQ1NWIGRhdGEgdXNpbmcgdGhlIGhvb2tcbiAgICBjb25zdCB7IGRhdGEsIGNvbHVtbnMsIGxvYWRpbmcsIGVycm9yLCBsYXN0UmVmcmVzaCwgcmVsb2FkLCB9ID0gdXNlQ3N2RGF0YUxvYWRlcihjc3ZQYXRoLCB7XG4gICAgICAgIGVuYWJsZUF1dG9SZWZyZXNoOiB0cnVlLFxuICAgICAgICByZWZyZXNoSW50ZXJ2YWw6IDMwMDAwLFxuICAgIH0pO1xuICAgIC8vIEhhbmRsZSBzZWFyY2ggdGV4dCBjaGFuZ2VcbiAgICBjb25zdCBoYW5kbGVTZWFyY2hDaGFuZ2UgPSB1c2VDYWxsYmFjaygodmFsdWUpID0+IHtcbiAgICAgICAgc2V0U2VhcmNoVGV4dCh2YWx1ZSk7XG4gICAgfSwgW10pO1xuICAgIC8vIEhhbmRsZSBleHBvcnRcbiAgICBjb25zdCBoYW5kbGVFeHBvcnQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmICghZGF0YSB8fCBkYXRhLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gQ3JlYXRlIENTViBjb250ZW50XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBjb2x1bW5zLm1hcChjb2wgPT4gY29sLmZpZWxkIHx8ICcnKS5qb2luKCcsJyk7XG4gICAgICAgIGNvbnN0IHJvd3MgPSBkYXRhLm1hcChyb3cgPT4gY29sdW1ucy5tYXAoY29sID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcm93W2NvbC5maWVsZF07XG4gICAgICAgICAgICAvLyBFc2NhcGUgdmFsdWVzIHRoYXQgY29udGFpbiBjb21tYXMgb3IgcXVvdGVzXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAodmFsdWUuaW5jbHVkZXMoJywnKSB8fCB2YWx1ZS5pbmNsdWRlcygnXCInKSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYFwiJHt2YWx1ZS5yZXBsYWNlKC9cIi9nLCAnXCJcIicpfVwiYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZSA/PyAnJztcbiAgICAgICAgfSkuam9pbignLCcpKTtcbiAgICAgICAgY29uc3QgY3N2Q29udGVudCA9IFtoZWFkZXJzLCAuLi5yb3dzXS5qb2luKCdcXG4nKTtcbiAgICAgICAgLy8gQ3JlYXRlIGFuZCBkb3dubG9hZCBmaWxlXG4gICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbY3N2Q29udGVudF0sIHsgdHlwZTogJ3RleHQvY3N2O2NoYXJzZXQ9dXRmLTg7JyB9KTtcbiAgICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCB1cmwpO1xuICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgnZG93bmxvYWQnLCBgJHttb2R1bGVOYW1lfV9leHBvcnRfJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXX0uY3N2YCk7XG4gICAgICAgIGxpbmsuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICBsaW5rLmNsaWNrKCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobGluayk7XG4gICAgfSwgW2RhdGEsIGNvbHVtbnMsIG1vZHVsZU5hbWVdKTtcbiAgICByZXR1cm4gKF9qc3goRGlzY292ZXJlZFZpZXdUZW1wbGF0ZSwgeyB0aXRsZTogdGl0bGUsIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiwgZGF0YTogZGF0YSwgY29sdW1uczogY29sdW1ucywgbG9hZGluZzogbG9hZGluZywgZXJyb3I6IGVycm9yLCBzZWFyY2hUZXh0OiBzZWFyY2hUZXh0LCBvblNlYXJjaENoYW5nZTogaGFuZGxlU2VhcmNoQ2hhbmdlLCBvblJlZnJlc2g6IHJlbG9hZCwgb25FeHBvcnQ6IGhhbmRsZUV4cG9ydCwgbGFzdFJlZnJlc2g6IGxhc3RSZWZyZXNoLCBlbmFibGVTZWFyY2g6IGVuYWJsZVNlYXJjaCwgZW5hYmxlRXhwb3J0OiBlbmFibGVFeHBvcnQsIFwiZGF0YS1jeVwiOiBkYXRhQ3kgfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IERpc2NvdmVyZWRWaWV3V3JhcHBlcjtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBGcmFnbWVudCBhcyBfRnJhZ21lbnQsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogVmlydHVhbGl6ZWREYXRhR3JpZCBDb21wb25lbnRcbiAqXG4gKiBFbnRlcnByaXNlLWdyYWRlIGRhdGEgZ3JpZCB1c2luZyBBRyBHcmlkIEVudGVycHJpc2VcbiAqIEhhbmRsZXMgMTAwLDAwMCsgcm93cyB3aXRoIHZpcnR1YWwgc2Nyb2xsaW5nIGF0IDYwIEZQU1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWdHcmlkUmVhY3QgfSBmcm9tICdhZy1ncmlkLXJlYWN0JztcbmltcG9ydCAnYWctZ3JpZC1lbnRlcnByaXNlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IERvd25sb2FkLCBQcmludGVyLCBFeWUsIEV5ZU9mZiwgRmlsdGVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vYXRvbXMvU3Bpbm5lcic7XG4vLyBMYXp5IGxvYWQgQUcgR3JpZCBDU1MgLSBvbmx5IGxvYWQgb25jZSB3aGVuIGZpcnN0IGdyaWQgbW91bnRzXG5sZXQgYWdHcmlkU3R5bGVzTG9hZGVkID0gZmFsc2U7XG5jb25zdCBsb2FkQWdHcmlkU3R5bGVzID0gKCkgPT4ge1xuICAgIGlmIChhZ0dyaWRTdHlsZXNMb2FkZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgQUcgR3JpZCBzdHlsZXNcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy1ncmlkLmNzcycpO1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLXRoZW1lLWFscGluZS5jc3MnKTtcbiAgICBhZ0dyaWRTdHlsZXNMb2FkZWQgPSB0cnVlO1xufTtcbi8qKlxuICogSGlnaC1wZXJmb3JtYW5jZSBkYXRhIGdyaWQgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcih7IGRhdGEsIGNvbHVtbnMsIGxvYWRpbmcgPSBmYWxzZSwgdmlydHVhbFJvd0hlaWdodCA9IDMyLCBlbmFibGVDb2x1bW5SZW9yZGVyID0gdHJ1ZSwgZW5hYmxlQ29sdW1uUmVzaXplID0gdHJ1ZSwgZW5hYmxlRXhwb3J0ID0gdHJ1ZSwgZW5hYmxlUHJpbnQgPSB0cnVlLCBlbmFibGVHcm91cGluZyA9IGZhbHNlLCBlbmFibGVGaWx0ZXJpbmcgPSB0cnVlLCBlbmFibGVTZWxlY3Rpb24gPSB0cnVlLCBzZWxlY3Rpb25Nb2RlID0gJ211bHRpcGxlJywgcGFnaW5hdGlvbiA9IHRydWUsIHBhZ2luYXRpb25QYWdlU2l6ZSA9IDEwMCwgb25Sb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2UsIGNsYXNzTmFtZSwgaGVpZ2h0ID0gJzYwMHB4JywgJ2RhdGEtY3knOiBkYXRhQ3ksIH0sIHJlZikge1xuICAgIGNvbnN0IGdyaWRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW2dyaWRBcGksIHNldEdyaWRBcGldID0gUmVhY3QudXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCByb3dEYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGEgPz8gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVmlydHVhbGl6ZWREYXRhR3JpZF0gcm93RGF0YSBjb21wdXRlZDonLCByZXN1bHQubGVuZ3RoLCAncm93cycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhXSk7XG4gICAgLy8gTG9hZCBBRyBHcmlkIHN0eWxlcyBvbiBjb21wb25lbnQgbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkQWdHcmlkU3R5bGVzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIERlZmF1bHQgY29sdW1uIGRlZmluaXRpb25cbiAgICBjb25zdCBkZWZhdWx0Q29sRGVmID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIHJlc2l6YWJsZTogZW5hYmxlQ29sdW1uUmVzaXplLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgIH0pLCBbZW5hYmxlRmlsdGVyaW5nLCBlbmFibGVDb2x1bW5SZXNpemVdKTtcbiAgICAvLyBHcmlkIG9wdGlvbnNcbiAgICBjb25zdCBncmlkT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgcm93SGVpZ2h0OiB2aXJ0dWFsUm93SGVpZ2h0LFxuICAgICAgICBoZWFkZXJIZWlnaHQ6IDQwLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IDQwLFxuICAgICAgICBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiAhZW5hYmxlU2VsZWN0aW9uLFxuICAgICAgICByb3dTZWxlY3Rpb246IGVuYWJsZVNlbGVjdGlvbiA/IHNlbGVjdGlvbk1vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgIGFuaW1hdGVSb3dzOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IERpc2FibGUgY2hhcnRzIHRvIGF2b2lkIGVycm9yICMyMDAgKHJlcXVpcmVzIEludGVncmF0ZWRDaGFydHNNb2R1bGUpXG4gICAgICAgIGVuYWJsZUNoYXJ0czogZmFsc2UsXG4gICAgICAgIC8vIEZJWDogVXNlIGNlbGxTZWxlY3Rpb24gaW5zdGVhZCBvZiBkZXByZWNhdGVkIGVuYWJsZVJhbmdlU2VsZWN0aW9uXG4gICAgICAgIGNlbGxTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIC8vIEZJWDogVXNlIGxlZ2FjeSB0aGVtZSB0byBwcmV2ZW50IHRoZW1pbmcgQVBJIGNvbmZsaWN0IChlcnJvciAjMjM5KVxuICAgICAgICAvLyBNdXN0IGJlIHNldCB0byAnbGVnYWN5JyB0byB1c2UgdjMyIHN0eWxlIHRoZW1lcyB3aXRoIENTUyBmaWxlc1xuICAgICAgICB0aGVtZTogJ2xlZ2FjeScsXG4gICAgICAgIHN0YXR1c0Jhcjoge1xuICAgICAgICAgICAgc3RhdHVzUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnVG90YWxBbmRGaWx0ZXJlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1NlbGVjdGVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2NlbnRlcicgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdBZ2dyZWdhdGlvbkNvbXBvbmVudCcsIGFsaWduOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBzaWRlQmFyOiBlbmFibGVHcm91cGluZ1xuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdG9vbFBhbmVsczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnQ29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdDb2x1bW5zVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdmaWx0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdGaWx0ZXJzVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRUb29sUGFuZWw6ICcnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICB9KSwgW3ZpcnR1YWxSb3dIZWlnaHQsIGVuYWJsZVNlbGVjdGlvbiwgc2VsZWN0aW9uTW9kZSwgZW5hYmxlR3JvdXBpbmddKTtcbiAgICAvLyBIYW5kbGUgZ3JpZCByZWFkeSBldmVudFxuICAgIGNvbnN0IG9uR3JpZFJlYWR5ID0gdXNlQ2FsbGJhY2soKHBhcmFtcykgPT4ge1xuICAgICAgICBzZXRHcmlkQXBpKHBhcmFtcy5hcGkpO1xuICAgICAgICBwYXJhbXMuYXBpLnNpemVDb2x1bW5zVG9GaXQoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSGFuZGxlIHJvdyBjbGlja1xuICAgIGNvbnN0IGhhbmRsZVJvd0NsaWNrID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblJvd0NsaWNrICYmIGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIG9uUm93Q2xpY2soZXZlbnQuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCBbb25Sb3dDbGlja10pO1xuICAgIC8vIEhhbmRsZSBzZWxlY3Rpb24gY2hhbmdlXG4gICAgY29uc3QgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblNlbGVjdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3dzID0gZXZlbnQuYXBpLmdldFNlbGVjdGVkUm93cygpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2Uoc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblNlbGVjdGlvbkNoYW5nZV0pO1xuICAgIC8vIEV4cG9ydCB0byBDU1ZcbiAgICBjb25zdCBleHBvcnRUb0NzdiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzQ3N2KHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0uY3N2YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBFeHBvcnQgdG8gRXhjZWxcbiAgICBjb25zdCBleHBvcnRUb0V4Y2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNFeGNlbCh7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9Lnhsc3hgLFxuICAgICAgICAgICAgICAgIHNoZWV0TmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFByaW50IGdyaWRcbiAgICBjb25zdCBwcmludEdyaWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsICdwcmludCcpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnByaW50KCk7XG4gICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5IHBhbmVsXG4gICAgY29uc3QgdG9nZ2xlQ29sdW1uUGFuZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNob3dDb2x1bW5QYW5lbCghc2hvd0NvbHVtblBhbmVsKTtcbiAgICB9LCBbc2hvd0NvbHVtblBhbmVsXSk7XG4gICAgLy8gQXV0by1zaXplIGFsbCBjb2x1bW5zXG4gICAgY29uc3QgYXV0b1NpemVDb2x1bW5zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sdW1uSWRzID0gY29sdW1ucy5tYXAoYyA9PiBjLmZpZWxkKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICBncmlkQXBpLmF1dG9TaXplQ29sdW1ucyhhbGxDb2x1bW5JZHMpO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGksIGNvbHVtbnNdKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdmbGV4IGZsZXgtY29sIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBzaGFkb3ctc20nLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyByZWY6IHJlZiwgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogbG9hZGluZyA/IChfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJzbVwiIH0pKSA6IChgJHtyb3dEYXRhLmxlbmd0aC50b0xvY2FsZVN0cmluZygpfSByb3dzYCkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbZW5hYmxlRmlsdGVyaW5nICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChGaWx0ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHNldEZsb2F0aW5nRmlsdGVyc0hlaWdodCBpcyBkZXByZWNhdGVkIGluIEFHIEdyaWQgdjM0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9hdGluZyBmaWx0ZXJzIGFyZSBub3cgY29udHJvbGxlZCB0aHJvdWdoIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdGaWx0ZXIgdG9nZ2xlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIEFHIEdyaWQgdjM0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRpdGxlOiBcIlRvZ2dsZSBmaWx0ZXJzXCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1maWx0ZXJzXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBzaG93Q29sdW1uUGFuZWwgPyBfanN4KEV5ZU9mZiwgeyBzaXplOiAxNiB9KSA6IF9qc3goRXllLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiB0b2dnbGVDb2x1bW5QYW5lbCwgdGl0bGU6IFwiVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5XCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1jb2x1bW5zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbnNcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IGF1dG9TaXplQ29sdW1ucywgdGl0bGU6IFwiQXV0by1zaXplIGNvbHVtbnNcIiwgXCJkYXRhLWN5XCI6IFwiYXV0by1zaXplXCIsIGNoaWxkcmVuOiBcIkF1dG8gU2l6ZVwiIH0pLCBlbmFibGVFeHBvcnQgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0NzdiwgdGl0bGU6IFwiRXhwb3J0IHRvIENTVlwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtY3N2XCIsIGNoaWxkcmVuOiBcIkNTVlwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9FeGNlbCwgdGl0bGU6IFwiRXhwb3J0IHRvIEV4Y2VsXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbFwiLCBjaGlsZHJlbjogXCJFeGNlbFwiIH0pXSB9KSksIGVuYWJsZVByaW50ICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChQcmludGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBwcmludEdyaWQsIHRpdGxlOiBcIlByaW50XCIsIFwiZGF0YS1jeVwiOiBcInByaW50XCIsIGNoaWxkcmVuOiBcIlByaW50XCIgfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSByZWxhdGl2ZVwiLCBjaGlsZHJlbjogW2xvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBcImRhdGEtdGVzdGlkXCI6IFwiZ3JpZC1sb2FkaW5nXCIsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkxvYWRpbmcgZGF0YVwiLCBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSBiZy1vcGFjaXR5LTc1IGRhcms6YmctZ3JheS05MDAgZGFyazpiZy1vcGFjaXR5LTc1IHotMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goU3Bpbm5lciwgeyBzaXplOiBcImxnXCIsIGxhYmVsOiBcIkxvYWRpbmcgZGF0YS4uLlwiIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnYWctdGhlbWUtYWxwaW5lJywgJ2Rhcms6YWctdGhlbWUtYWxwaW5lLWRhcmsnLCAndy1mdWxsJyksIHN0eWxlOiB7IGhlaWdodCB9LCBjaGlsZHJlbjogX2pzeChBZ0dyaWRSZWFjdCwgeyByZWY6IGdyaWRSZWYsIHJvd0RhdGE6IHJvd0RhdGEsIGNvbHVtbkRlZnM6IGNvbHVtbnMsIGRlZmF1bHRDb2xEZWY6IGRlZmF1bHRDb2xEZWYsIGdyaWRPcHRpb25zOiBncmlkT3B0aW9ucywgb25HcmlkUmVhZHk6IG9uR3JpZFJlYWR5LCBvblJvd0NsaWNrZWQ6IGhhbmRsZVJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZWQ6IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSwgcm93QnVmZmVyOiAyMCwgcm93TW9kZWxUeXBlOiBcImNsaWVudFNpZGVcIiwgcGFnaW5hdGlvbjogcGFnaW5hdGlvbiwgcGFnaW5hdGlvblBhZ2VTaXplOiBwYWdpbmF0aW9uUGFnZVNpemUsIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGZhbHNlLCBzdXBwcmVzc0NlbGxGb2N1czogZmFsc2UsIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiB0cnVlLCBlbnN1cmVEb21PcmRlcjogdHJ1ZSB9KSB9KSwgc2hvd0NvbHVtblBhbmVsICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctNjQgaC1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWwgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNCBvdmVyZmxvdy15LWF1dG8gei0yMFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtc20gbWItM1wiLCBjaGlsZHJlbjogXCJDb2x1bW4gVmlzaWJpbGl0eVwiIH0pLCBjb2x1bW5zLm1hcCgoY29sKSA9PiAoX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweS0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjbGFzc05hbWU6IFwicm91bmRlZFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZSwgb25DaGFuZ2U6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmlkQXBpICYmIGNvbC5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRDb2x1bW5zVmlzaWJsZShbY29sLmZpZWxkXSwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBjb2wuaGVhZGVyTmFtZSB8fCBjb2wuZmllbGQgfSldIH0sIGNvbC5maWVsZCkpKV0gfSkpXSB9KV0gfSkpO1xufVxuZXhwb3J0IGNvbnN0IFZpcnR1YWxpemVkRGF0YUdyaWQgPSBSZWFjdC5mb3J3YXJkUmVmKFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcik7XG4vLyBTZXQgZGlzcGxheU5hbWUgZm9yIFJlYWN0IERldlRvb2xzXG5WaXJ0dWFsaXplZERhdGFHcmlkLmRpc3BsYXlOYW1lID0gJ1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9