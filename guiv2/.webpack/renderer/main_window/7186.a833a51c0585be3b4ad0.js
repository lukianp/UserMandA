"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7186],{

/***/ 7186:
/*!**********************************************************************!*\
  !*** ./src/renderer/views/assets/AssetInventoryView.tsx + 1 modules ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  AssetInventoryView: () => (/* binding */ AssetInventoryView),
  "default": () => (/* binding */ assets_AssetInventoryView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
;// ./src/renderer/hooks/useAssetInventoryLogic.ts

/**
 * Custom hook for asset inventory logic with Logic Engine integration
 */
const useAssetInventoryLogic = () => {
    const [assets, setAssets] = (0,react.useState)([]);
    const [statistics, setStatistics] = (0,react.useState)(null);
    const [isLoading, setIsLoading] = (0,react.useState)(false);
    const [error, setError] = (0,react.useState)(null);
    const [searchText, setSearchText] = (0,react.useState)('');
    const [typeFilter, setTypeFilter] = (0,react.useState)('All');
    const [statusFilter, setStatusFilter] = (0,react.useState)('All');
    /**
     * Load asset data from Logic Engine
     */
    const loadAssetData = (0,react.useCallback)(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Query Logic Engine for device statistics
            const statsResult = await window.electronAPI.logicEngine.getStatistics();
            if (statsResult.success && statsResult.data?.statistics) {
                const stats = statsResult.data.statistics;
                // Build asset inventory from Logic Engine data
                const assetList = [];
                // Extract device data from statistics
                const deviceCount = stats.DeviceCount || 0;
                // For now, create mock assets based on device count
                // TODO: When Logic Engine provides detailed device data, extract real assets
                for (let i = 0; i < Math.min(deviceCount, 100); i++) {
                    assetList.push(generateMockAsset(i));
                }
                // Calculate statistics
                const assetStats = {
                    totalAssets: assetList.length,
                    workstations: assetList.filter(a => a.type === 'Workstation').length,
                    servers: assetList.filter(a => a.type === 'Server').length,
                    mobileDevices: assetList.filter(a => a.type === 'Mobile').length,
                    networkDevices: assetList.filter(a => a.type === 'Network').length,
                    printers: assetList.filter(a => a.type === 'Printer').length,
                    activeAssets: assetList.filter(a => a.status === 'Active').length,
                    inactiveAssets: assetList.filter(a => a.status === 'Inactive').length,
                    avgAge: assetList.reduce((sum, a) => sum + (a.age || 0), 0) / assetList.length,
                    totalValue: assetList.length * 1500, // Mock value
                };
                setAssets(assetList);
                setStatistics(assetStats);
                console.info('[AssetInventory] Loaded asset data from Logic Engine:', {
                    totalAssets: assetList.length,
                    deviceCount,
                });
            }
            else {
                console.warn('[AssetInventory] Logic Engine not loaded, using mock data');
                const mockData = generateMockAssetData();
                setAssets(mockData.assets);
                setStatistics(mockData.statistics);
            }
        }
        catch (err) {
            const errorMsg = `Failed to load asset data: ${err.message}`;
            console.error('[AssetInventory] Error:', err);
            setError(errorMsg);
            // Fallback to mock data on error
            const mockData = generateMockAssetData();
            setAssets(mockData.assets);
            setStatistics(mockData.statistics);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    /**
     * Load data on mount
     */
    (0,react.useEffect)(() => {
        loadAssetData();
    }, [loadAssetData]);
    /**
     * Filter assets based on search and filters
     */
    const filteredAssets = (0,react.useCallback)(() => {
        return assets.filter(asset => {
            // Search filter
            const matchesSearch = !searchText ||
                (asset.name ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
                (asset.type ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
                asset.manufacturer?.toLowerCase().includes(searchText.toLowerCase()) ||
                asset.model?.toLowerCase().includes(searchText.toLowerCase()) ||
                asset.ipAddress?.toLowerCase().includes(searchText.toLowerCase());
            // Type filter
            const matchesType = typeFilter === 'All' || asset.type === typeFilter;
            // Status filter
            const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [assets, searchText, typeFilter, statusFilter]);
    /**
     * Export assets to CSV
     */
    const exportAssets = (0,react.useCallback)(async () => {
        try {
            const filtered = filteredAssets();
            const csv = convertAssetsToCSV(filtered);
            await window.electronAPI.invoke('export-data', {
                filename: `asset-inventory-${new Date().toISOString().split('T')[0]}.csv`,
                data: csv,
            });
            console.info('[AssetInventory] Exported asset data successfully');
        }
        catch (err) {
            console.error('[AssetInventory] Export failed:', err);
            setError(`Export failed: ${err.message}`);
        }
    }, [filteredAssets]);
    return {
        assets: filteredAssets(),
        statistics,
        isLoading,
        error,
        searchText,
        setSearchText,
        typeFilter,
        setTypeFilter,
        statusFilter,
        setStatusFilter,
        refreshData: loadAssetData,
        exportAssets,
    };
};
/**
 * Generate mock asset for development/fallback
 */
function generateMockAsset(index) {
    const types = ['Workstation', 'Server', 'Mobile', 'Network', 'Printer'];
    const statuses = ['Active', 'Inactive', 'In Repair'];
    const manufacturers = ['Dell', 'HP', 'Lenovo', 'Apple', 'Cisco', 'Microsoft'];
    const locations = ['New York', 'London', 'Tokyo', 'Sydney', 'Paris'];
    const departments = ['IT', 'Sales', 'Engineering', 'HR', 'Finance'];
    const type = types[index % types.length];
    const manufacturer = manufacturers[index % manufacturers.length];
    const age = Math.floor(Math.random() * 6);
    const purchaseDate = new Date();
    purchaseDate.setFullYear(purchaseDate.getFullYear() - age);
    return {
        id: `asset-${index + 1}`,
        name: `${type}-${(index + 1).toString().padStart(3, '0')}`,
        type,
        category: type === 'Server' ? 'Infrastructure' : 'Endpoint',
        manufacturer,
        model: `Model-${manufacturer}-${Math.floor(Math.random() * 100)}`,
        serialNumber: `SN${(index + 1).toString().padStart(8, '0')}`,
        ipAddress: `192.168.${Math.floor(index / 254)}.${(index % 254) + 1}`,
        macAddress: `00:${((index >> 8) & 0xff).toString(16).padStart(2, '0')}:${(index & 0xff).toString(16).padStart(2, '0')}:00:00:00`,
        operatingSystem: type === 'Server' ? 'Windows Server 2019' : 'Windows 11',
        osVersion: type === 'Server' ? '10.0.17763' : '10.0.22000',
        cpu: `Intel Core i${5 + (index % 4)} ${9000 + index}`,
        ramGB: type === 'Server' ? 32 + (index % 3) * 32 : 8 + (index % 3) * 8,
        diskGB: type === 'Server' ? 500 + (index % 4) * 500 : 256 + (index % 3) * 256,
        location: locations[index % locations.length],
        department: departments[index % departments.length],
        owner: `user${(index % 50) + 1}@company.com`,
        assignedUser: type !== 'Server' ? `user${(index % 50) + 1}@company.com` : undefined,
        purchaseDate: purchaseDate.toISOString().split('T')[0],
        warrantyExpiry: new Date(purchaseDate.getTime() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: statuses[index % statuses.length],
        lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        domainJoined: Math.random() > 0.1,
        domain: 'company.local',
        age,
        lifecycleStatus: age < 1 ? 'New' : age < 3 ? 'Current' : age < 5 ? 'Aging' : 'End of Life',
    };
}
/**
 * Generate complete mock asset data
 */
function generateMockAssetData() {
    const assets = [];
    for (let i = 0; i < 150; i++) {
        assets.push(generateMockAsset(i));
    }
    const statistics = {
        totalAssets: assets.length,
        workstations: assets.filter(a => a.type === 'Workstation').length,
        servers: assets.filter(a => a.type === 'Server').length,
        mobileDevices: assets.filter(a => a.type === 'Mobile').length,
        networkDevices: assets.filter(a => a.type === 'Network').length,
        printers: assets.filter(a => a.type === 'Printer').length,
        activeAssets: assets.filter(a => a.status === 'Active').length,
        inactiveAssets: assets.filter(a => a.status === 'Inactive').length,
        avgAge: assets.reduce((sum, a) => sum + (a.age || 0), 0) / assets.length,
        totalValue: assets.length * 1500,
    };
    return { assets, statistics };
}
/**
 * Convert assets to CSV format
 */
function convertAssetsToCSV(assets) {
    const headers = [
        'ID', 'Name', 'Type', 'Category', 'Manufacturer', 'Model', 'Serial Number',
        'IP Address', 'MAC Address', 'Operating System', 'OS Version',
        'CPU', 'RAM (GB)', 'Disk (GB)', 'Location', 'Department', 'Owner',
        'Assigned User', 'Purchase Date', 'Warranty Expiry', 'Status', 'Last Seen',
        'Domain Joined', 'Domain', 'Age (Years)', 'Lifecycle Status'
    ];
    const rows = assets.map(asset => [
        asset.id,
        asset.name,
        asset.type,
        asset.category,
        asset.manufacturer || '',
        asset.model || '',
        asset.serialNumber || '',
        asset.ipAddress || '',
        asset.macAddress || '',
        asset.operatingSystem || '',
        asset.osVersion || '',
        asset.cpu || '',
        asset.ramGB?.toString() || '',
        asset.diskGB?.toString() || '',
        asset.location || '',
        asset.department || '',
        asset.owner || '',
        asset.assignedUser || '',
        asset.purchaseDate || '',
        asset.warrantyExpiry || '',
        asset.status,
        asset.lastSeen || '',
        asset.domainJoined ? 'Yes' : 'No',
        asset.domain || '',
        asset.age?.toString() || '',
        asset.lifecycleStatus || '',
    ]);
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Input.tsx
var Input = __webpack_require__(34766);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Badge.tsx
var Badge = __webpack_require__(61315);
// EXTERNAL MODULE: ./src/renderer/components/organisms/VirtualizedDataGrid.tsx
var VirtualizedDataGrid = __webpack_require__(59944);
;// ./src/renderer/views/assets/AssetInventoryView.tsx

/**
 * Asset Inventory View
 * Comprehensive asset tracking and lifecycle management
 */







const AssetInventoryView = () => {
    const { assets, statistics, isLoading, error, searchText, setSearchText, typeFilter, setTypeFilter, statusFilter, setStatusFilter, refreshData, exportAssets, } = useAssetInventoryLogic();
    const assetTypes = [
        { id: 'all', label: 'All Assets', icon: lucide_react.Package, count: statistics?.totalAssets || 0 },
        { id: 'servers', label: 'Servers', icon: lucide_react.Server, count: statistics?.servers || 0 },
        { id: 'workstations', label: 'Workstations', icon: lucide_react.Monitor, count: statistics?.workstations || 0 },
        { id: 'mobile', label: 'Mobile Devices', icon: lucide_react.Smartphone, count: statistics?.mobileDevices || 0 },
        { id: 'network', label: 'Network Devices', icon: lucide_react.HardDrive, count: statistics?.networkDevices || 0 },
        { id: 'printers', label: 'Printers', icon: lucide_react.Database, count: statistics?.printers || 0 },
    ];
    const columnDefs = [
        { field: 'name', headerName: 'Name', sortable: true, filter: true },
        { field: 'type', headerName: 'Type', sortable: true, filter: true },
        { field: 'manufacturer', headerName: 'Manufacturer', sortable: true, filter: true },
        { field: 'model', headerName: 'Model', sortable: true, filter: true },
        { field: 'serialNumber', headerName: 'Serial Number', sortable: true },
        { field: 'location', headerName: 'Location', sortable: true, filter: true },
        { field: 'status', headerName: 'Status', sortable: true, filter: true },
    ];
    return ((0,jsx_runtime.jsxs)("div", { className: "flex flex-col h-full p-6 bg-gray-50 dark:bg-gray-900", "data-cy": "asset-inventory-view", "data-testid": "asset-inventory-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)("div", { className: "p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg", children: (0,jsx_runtime.jsx)(lucide_react.Package, { className: "w-8 h-8 text-indigo-600 dark:text-indigo-400" }) }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Asset Inventory" }), (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Complete asset tracking and lifecycle management" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(Button.Button, { variant: "secondary", onClick: refreshData, disabled: isLoading, "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), (0,jsx_runtime.jsx)(Button.Button, { variant: "primary", onClick: exportAssets, icon: (0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4" }), "data-cy": "export-btn", children: "Export Inventory" })] })] }), (0,jsx_runtime.jsx)("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6", children: assetTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = typeFilter === type.id;
                    return ((0,jsx_runtime.jsx)("button", { onClick: () => setTypeFilter(type.id), className: `
                p-4 rounded-lg border-2 transition-all
                ${isSelected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300'}
              `, "data-cy": `asset-type-${type.id}`, children: (0,jsx_runtime.jsxs)("div", { className: "flex flex-col items-center gap-2", children: [(0,jsx_runtime.jsx)(Icon, { className: `w-8 h-8 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}` }), (0,jsx_runtime.jsx)("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: type.label }), (0,jsx_runtime.jsx)(Badge.Badge, { variant: isSelected ? 'primary' : 'default', children: type.count })] }) }, type.id));
                }) }), (0,jsx_runtime.jsx)("div", { className: "mb-6", children: (0,jsx_runtime.jsxs)("div", { className: "relative", children: [(0,jsx_runtime.jsx)(lucide_react.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }), (0,jsx_runtime.jsx)(Input.Input, { type: "text", placeholder: "Search assets by name, serial number, or location...", value: searchText, onChange: (e) => setSearchText(e.target.value), className: "pl-10", "data-cy": "asset-search", "data-testid": "asset-search" })] }) }), (0,jsx_runtime.jsx)("div", { className: "flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid.VirtualizedDataGrid, { data: assets, columns: columnDefs, loading: isLoading }) })] }));
};
/* harmony default export */ const assets_AssetInventoryView = (AssetInventoryView);


/***/ }),

/***/ 34766:
/*!*************************************************!*\
  !*** ./src/renderer/components/atoms/Input.tsx ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Input: () => (/* binding */ Input)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ 72832);

/**
 * Input Component
 *
 * Accessible input field with label, error states, and help text
 */



/**
 * Input component with full accessibility support
 */
const Input = (0,react__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(({ label, helperText, error, required = false, showOptional = true, inputSize = 'md', fullWidth = false, startIcon, endIcon, className, id, 'data-cy': dataCy, disabled = false, ...props }, ref) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    // Size styles
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg',
    };
    // Input classes
    const inputClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('block rounded-md border transition-all duration-200', 'focus:outline-none focus:ring-2 focus:ring-offset-2', 'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed', 'dark:bg-gray-800 dark:text-gray-100', sizes[inputSize], fullWidth && 'w-full', startIcon && 'pl-10', endIcon && 'pr-10', error
        ? (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('border-red-500 text-red-900 placeholder-red-400', 'focus:border-red-500 focus:ring-red-500', 'dark:border-red-400 dark:text-red-400')
        : (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('border-gray-300 placeholder-gray-400', 'focus:border-blue-500 focus:ring-blue-500', 'dark:border-gray-600 dark:placeholder-gray-500'), className);
    // Container classes
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(fullWidth && 'w-full');
    // Label classes
    const labelClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1');
    // Helper/Error text classes
    const helperClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('mt-1 text-sm', error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400');
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, children: [label && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { htmlFor: inputId, className: labelClasses, children: [label, required && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-red-500 ml-1", "aria-label": "required", children: "*" })), !required && showOptional && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400 ml-1 text-xs", children: "(optional)" }))] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "relative", children: [startIcon && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", "aria-hidden": "true", children: startIcon }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { ref: ref, id: inputId, className: inputClasses, "aria-invalid": !!error, "aria-describedby": (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(error && errorId, helperText && helperId) || undefined, "aria-required": required, disabled: disabled, "data-cy": dataCy, ...props }), endIcon && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", "aria-hidden": "true", children: endIcon }) }))] }), error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: errorId, className: helperClasses, role: "alert", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.AlertCircle, { className: "w-4 h-4 mr-1", "aria-hidden": "true" }), error] }) })), helperText && !error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: helperId, className: helperClasses, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Info, { className: "w-4 h-4 mr-1", "aria-hidden": "true" }), helperText] }) }))] }));
});
Input.displayName = 'Input';


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


/***/ }),

/***/ 61315:
/*!*************************************************!*\
  !*** ./src/renderer/components/atoms/Badge.tsx ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Badge: () => (/* binding */ Badge),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);

/**
 * Badge Component
 *
 * Small label component for status indicators, counts, and tags.
 * Supports multiple variants and sizes.
 */


/**
 * Badge Component
 */
const Badge = ({ children, variant = 'default', size = 'md', dot = false, dotPosition = 'leading', removable = false, onRemove, className, 'data-cy': dataCy, }) => {
    // Variant styles
    const variantClasses = {
        default: 'bg-gray-100 text-gray-800 border-gray-200',
        primary: 'bg-blue-100 text-blue-800 border-blue-200',
        success: 'bg-green-100 text-green-800 border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        danger: 'bg-red-100 text-red-800 border-red-200',
        info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    };
    // Dot color classes
    const dotClasses = {
        default: 'bg-gray-500',
        primary: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        danger: 'bg-red-500',
        info: 'bg-cyan-500',
    };
    // Size styles
    const sizeClasses = {
        xs: 'px-2 py-0.5 text-xs',
        sm: 'px-2.5 py-0.5 text-sm',
        md: 'px-3 py-1 text-sm',
        lg: 'px-3.5 py-1.5 text-base',
    };
    const dotSizeClasses = {
        xs: 'h-1.5 w-1.5',
        sm: 'h-2 w-2',
        md: 'h-2 w-2',
        lg: 'h-2.5 w-2.5',
    };
    const badgeClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(
    // Base styles
    'inline-flex items-center gap-1.5', 'font-medium rounded-full border', 'transition-colors duration-200', 
    // Variant
    variantClasses[variant], 
    // Size
    sizeClasses[size], className);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: badgeClasses, "data-cy": dataCy, children: [dot && dotPosition === 'leading' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('rounded-full', dotClasses[variant], dotSizeClasses[size]), "aria-hidden": "true" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { children: children }), dot && dotPosition === 'trailing' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('rounded-full', dotClasses[variant], dotSizeClasses[size]), "aria-hidden": "true" })), removable && onRemove && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { type: "button", onClick: onRemove, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('ml-0.5 -mr-1 inline-flex items-center justify-center', 'rounded-full hover:bg-black/10', 'focus:outline-none focus:ring-2 focus:ring-offset-1', {
                    'h-3 w-3': size === 'xs' || size === 'sm',
                    'h-4 w-4': size === 'md' || size === 'lg',
                }), "aria-label": "Remove", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)({
                        'h-2 w-2': size === 'xs' || size === 'sm',
                        'h-3 w-3': size === 'md' || size === 'lg',
                    }), fill: "currentColor", viewBox: "0 0 20 20", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Badge);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QixzREFBSSxhQUFhLDhDQUE4QywwQ0FBSTtBQUM3Z0I7QUFDQTtBQUNBLGlCQUFpQixxQ0FBcUMsc0RBQUksVUFBVSxXQUFXLDBDQUFJO0FBQ25GO0FBQ0E7QUFDQSxxQkFBcUIseURBQXlELHNEQUFJLFdBQVcsbVBBQW1QLEdBQUcsR0FBRyxLQUFLO0FBQzNWO0FBQ0EsaUVBQWUsS0FBSyxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlQXNzZXRJbnZlbnRvcnlMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9hc3NldHMvQXNzZXRJbnZlbnRvcnlWaWV3LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0lucHV0LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0JhZGdlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0Jztcbi8qKlxuICogQ3VzdG9tIGhvb2sgZm9yIGFzc2V0IGludmVudG9yeSBsb2dpYyB3aXRoIExvZ2ljIEVuZ2luZSBpbnRlZ3JhdGlvblxuICovXG5leHBvcnQgY29uc3QgdXNlQXNzZXRJbnZlbnRvcnlMb2dpYyA9ICgpID0+IHtcbiAgICBjb25zdCBbYXNzZXRzLCBzZXRBc3NldHNdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtzdGF0aXN0aWNzLCBzZXRTdGF0aXN0aWNzXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dF0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW3R5cGVGaWx0ZXIsIHNldFR5cGVGaWx0ZXJdID0gdXNlU3RhdGUoJ0FsbCcpO1xuICAgIGNvbnN0IFtzdGF0dXNGaWx0ZXIsIHNldFN0YXR1c0ZpbHRlcl0gPSB1c2VTdGF0ZSgnQWxsJyk7XG4gICAgLyoqXG4gICAgICogTG9hZCBhc3NldCBkYXRhIGZyb20gTG9naWMgRW5naW5lXG4gICAgICovXG4gICAgY29uc3QgbG9hZEFzc2V0RGF0YSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgc2V0SXNMb2FkaW5nKHRydWUpO1xuICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFF1ZXJ5IExvZ2ljIEVuZ2luZSBmb3IgZGV2aWNlIHN0YXRpc3RpY3NcbiAgICAgICAgICAgIGNvbnN0IHN0YXRzUmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmxvZ2ljRW5naW5lLmdldFN0YXRpc3RpY3MoKTtcbiAgICAgICAgICAgIGlmIChzdGF0c1Jlc3VsdC5zdWNjZXNzICYmIHN0YXRzUmVzdWx0LmRhdGE/LnN0YXRpc3RpY3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0cyA9IHN0YXRzUmVzdWx0LmRhdGEuc3RhdGlzdGljcztcbiAgICAgICAgICAgICAgICAvLyBCdWlsZCBhc3NldCBpbnZlbnRvcnkgZnJvbSBMb2dpYyBFbmdpbmUgZGF0YVxuICAgICAgICAgICAgICAgIGNvbnN0IGFzc2V0TGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIC8vIEV4dHJhY3QgZGV2aWNlIGRhdGEgZnJvbSBzdGF0aXN0aWNzXG4gICAgICAgICAgICAgICAgY29uc3QgZGV2aWNlQ291bnQgPSBzdGF0cy5EZXZpY2VDb3VudCB8fCAwO1xuICAgICAgICAgICAgICAgIC8vIEZvciBub3csIGNyZWF0ZSBtb2NrIGFzc2V0cyBiYXNlZCBvbiBkZXZpY2UgY291bnRcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBXaGVuIExvZ2ljIEVuZ2luZSBwcm92aWRlcyBkZXRhaWxlZCBkZXZpY2UgZGF0YSwgZXh0cmFjdCByZWFsIGFzc2V0c1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTWF0aC5taW4oZGV2aWNlQ291bnQsIDEwMCk7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBhc3NldExpc3QucHVzaChnZW5lcmF0ZU1vY2tBc3NldChpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBzdGF0aXN0aWNzXG4gICAgICAgICAgICAgICAgY29uc3QgYXNzZXRTdGF0cyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxBc3NldHM6IGFzc2V0TGlzdC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIHdvcmtzdGF0aW9uczogYXNzZXRMaXN0LmZpbHRlcihhID0+IGEudHlwZSA9PT0gJ1dvcmtzdGF0aW9uJykubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJzOiBhc3NldExpc3QuZmlsdGVyKGEgPT4gYS50eXBlID09PSAnU2VydmVyJykubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBtb2JpbGVEZXZpY2VzOiBhc3NldExpc3QuZmlsdGVyKGEgPT4gYS50eXBlID09PSAnTW9iaWxlJykubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBuZXR3b3JrRGV2aWNlczogYXNzZXRMaXN0LmZpbHRlcihhID0+IGEudHlwZSA9PT0gJ05ldHdvcmsnKS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIHByaW50ZXJzOiBhc3NldExpc3QuZmlsdGVyKGEgPT4gYS50eXBlID09PSAnUHJpbnRlcicpLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlQXNzZXRzOiBhc3NldExpc3QuZmlsdGVyKGEgPT4gYS5zdGF0dXMgPT09ICdBY3RpdmUnKS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGluYWN0aXZlQXNzZXRzOiBhc3NldExpc3QuZmlsdGVyKGEgPT4gYS5zdGF0dXMgPT09ICdJbmFjdGl2ZScpLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgYXZnQWdlOiBhc3NldExpc3QucmVkdWNlKChzdW0sIGEpID0+IHN1bSArIChhLmFnZSB8fCAwKSwgMCkgLyBhc3NldExpc3QubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICB0b3RhbFZhbHVlOiBhc3NldExpc3QubGVuZ3RoICogMTUwMCwgLy8gTW9jayB2YWx1ZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc2V0QXNzZXRzKGFzc2V0TGlzdCk7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGlzdGljcyhhc3NldFN0YXRzKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmluZm8oJ1tBc3NldEludmVudG9yeV0gTG9hZGVkIGFzc2V0IGRhdGEgZnJvbSBMb2dpYyBFbmdpbmU6Jywge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbEFzc2V0czogYXNzZXRMaXN0Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlQ291bnQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1tBc3NldEludmVudG9yeV0gTG9naWMgRW5naW5lIG5vdCBsb2FkZWQsIHVzaW5nIG1vY2sgZGF0YScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vY2tEYXRhID0gZ2VuZXJhdGVNb2NrQXNzZXREYXRhKCk7XG4gICAgICAgICAgICAgICAgc2V0QXNzZXRzKG1vY2tEYXRhLmFzc2V0cyk7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGlzdGljcyhtb2NrRGF0YS5zdGF0aXN0aWNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9IGBGYWlsZWQgdG8gbG9hZCBhc3NldCBkYXRhOiAke2Vyci5tZXNzYWdlfWA7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbQXNzZXRJbnZlbnRvcnldIEVycm9yOicsIGVycik7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnJvck1zZyk7XG4gICAgICAgICAgICAvLyBGYWxsYmFjayB0byBtb2NrIGRhdGEgb24gZXJyb3JcbiAgICAgICAgICAgIGNvbnN0IG1vY2tEYXRhID0gZ2VuZXJhdGVNb2NrQXNzZXREYXRhKCk7XG4gICAgICAgICAgICBzZXRBc3NldHMobW9ja0RhdGEuYXNzZXRzKTtcbiAgICAgICAgICAgIHNldFN0YXRpc3RpY3MobW9ja0RhdGEuc3RhdGlzdGljcyk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW10pO1xuICAgIC8qKlxuICAgICAqIExvYWQgZGF0YSBvbiBtb3VudFxuICAgICAqL1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRBc3NldERhdGEoKTtcbiAgICB9LCBbbG9hZEFzc2V0RGF0YV0pO1xuICAgIC8qKlxuICAgICAqIEZpbHRlciBhc3NldHMgYmFzZWQgb24gc2VhcmNoIGFuZCBmaWx0ZXJzXG4gICAgICovXG4gICAgY29uc3QgZmlsdGVyZWRBc3NldHMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHJldHVybiBhc3NldHMuZmlsdGVyKGFzc2V0ID0+IHtcbiAgICAgICAgICAgIC8vIFNlYXJjaCBmaWx0ZXJcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNTZWFyY2ggPSAhc2VhcmNoVGV4dCB8fFxuICAgICAgICAgICAgICAgIChhc3NldC5uYW1lID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKSkgfHxcbiAgICAgICAgICAgICAgICAoYXNzZXQudHlwZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpIHx8XG4gICAgICAgICAgICAgICAgYXNzZXQubWFudWZhY3R1cmVyPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKSkgfHxcbiAgICAgICAgICAgICAgICBhc3NldC5tb2RlbD8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpIHx8XG4gICAgICAgICAgICAgICAgYXNzZXQuaXBBZGRyZXNzPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgICAvLyBUeXBlIGZpbHRlclxuICAgICAgICAgICAgY29uc3QgbWF0Y2hlc1R5cGUgPSB0eXBlRmlsdGVyID09PSAnQWxsJyB8fCBhc3NldC50eXBlID09PSB0eXBlRmlsdGVyO1xuICAgICAgICAgICAgLy8gU3RhdHVzIGZpbHRlclxuICAgICAgICAgICAgY29uc3QgbWF0Y2hlc1N0YXR1cyA9IHN0YXR1c0ZpbHRlciA9PT0gJ0FsbCcgfHwgYXNzZXQuc3RhdHVzID09PSBzdGF0dXNGaWx0ZXI7XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hlc1NlYXJjaCAmJiBtYXRjaGVzVHlwZSAmJiBtYXRjaGVzU3RhdHVzO1xuICAgICAgICB9KTtcbiAgICB9LCBbYXNzZXRzLCBzZWFyY2hUZXh0LCB0eXBlRmlsdGVyLCBzdGF0dXNGaWx0ZXJdKTtcbiAgICAvKipcbiAgICAgKiBFeHBvcnQgYXNzZXRzIHRvIENTVlxuICAgICAqL1xuICAgIGNvbnN0IGV4cG9ydEFzc2V0cyA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkID0gZmlsdGVyZWRBc3NldHMoKTtcbiAgICAgICAgICAgIGNvbnN0IGNzdiA9IGNvbnZlcnRBc3NldHNUb0NTVihmaWx0ZXJlZCk7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuaW52b2tlKCdleHBvcnQtZGF0YScsIHtcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogYGFzc2V0LWludmVudG9yeS0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdfS5jc3ZgLFxuICAgICAgICAgICAgICAgIGRhdGE6IGNzdixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKCdbQXNzZXRJbnZlbnRvcnldIEV4cG9ydGVkIGFzc2V0IGRhdGEgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0Fzc2V0SW52ZW50b3J5XSBFeHBvcnQgZmFpbGVkOicsIGVycik7XG4gICAgICAgICAgICBzZXRFcnJvcihgRXhwb3J0IGZhaWxlZDogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgIH0sIFtmaWx0ZXJlZEFzc2V0c10pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGFzc2V0czogZmlsdGVyZWRBc3NldHMoKSxcbiAgICAgICAgc3RhdGlzdGljcyxcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgc2VhcmNoVGV4dCxcbiAgICAgICAgc2V0U2VhcmNoVGV4dCxcbiAgICAgICAgdHlwZUZpbHRlcixcbiAgICAgICAgc2V0VHlwZUZpbHRlcixcbiAgICAgICAgc3RhdHVzRmlsdGVyLFxuICAgICAgICBzZXRTdGF0dXNGaWx0ZXIsXG4gICAgICAgIHJlZnJlc2hEYXRhOiBsb2FkQXNzZXREYXRhLFxuICAgICAgICBleHBvcnRBc3NldHMsXG4gICAgfTtcbn07XG4vKipcbiAqIEdlbmVyYXRlIG1vY2sgYXNzZXQgZm9yIGRldmVsb3BtZW50L2ZhbGxiYWNrXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlTW9ja0Fzc2V0KGluZGV4KSB7XG4gICAgY29uc3QgdHlwZXMgPSBbJ1dvcmtzdGF0aW9uJywgJ1NlcnZlcicsICdNb2JpbGUnLCAnTmV0d29yaycsICdQcmludGVyJ107XG4gICAgY29uc3Qgc3RhdHVzZXMgPSBbJ0FjdGl2ZScsICdJbmFjdGl2ZScsICdJbiBSZXBhaXInXTtcbiAgICBjb25zdCBtYW51ZmFjdHVyZXJzID0gWydEZWxsJywgJ0hQJywgJ0xlbm92bycsICdBcHBsZScsICdDaXNjbycsICdNaWNyb3NvZnQnXTtcbiAgICBjb25zdCBsb2NhdGlvbnMgPSBbJ05ldyBZb3JrJywgJ0xvbmRvbicsICdUb2t5bycsICdTeWRuZXknLCAnUGFyaXMnXTtcbiAgICBjb25zdCBkZXBhcnRtZW50cyA9IFsnSVQnLCAnU2FsZXMnLCAnRW5naW5lZXJpbmcnLCAnSFInLCAnRmluYW5jZSddO1xuICAgIGNvbnN0IHR5cGUgPSB0eXBlc1tpbmRleCAlIHR5cGVzLmxlbmd0aF07XG4gICAgY29uc3QgbWFudWZhY3R1cmVyID0gbWFudWZhY3R1cmVyc1tpbmRleCAlIG1hbnVmYWN0dXJlcnMubGVuZ3RoXTtcbiAgICBjb25zdCBhZ2UgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2KTtcbiAgICBjb25zdCBwdXJjaGFzZURhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIHB1cmNoYXNlRGF0ZS5zZXRGdWxsWWVhcihwdXJjaGFzZURhdGUuZ2V0RnVsbFllYXIoKSAtIGFnZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGBhc3NldC0ke2luZGV4ICsgMX1gLFxuICAgICAgICBuYW1lOiBgJHt0eXBlfS0keyhpbmRleCArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoMywgJzAnKX1gLFxuICAgICAgICB0eXBlLFxuICAgICAgICBjYXRlZ29yeTogdHlwZSA9PT0gJ1NlcnZlcicgPyAnSW5mcmFzdHJ1Y3R1cmUnIDogJ0VuZHBvaW50JyxcbiAgICAgICAgbWFudWZhY3R1cmVyLFxuICAgICAgICBtb2RlbDogYE1vZGVsLSR7bWFudWZhY3R1cmVyfS0ke01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCl9YCxcbiAgICAgICAgc2VyaWFsTnVtYmVyOiBgU04keyhpbmRleCArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoOCwgJzAnKX1gLFxuICAgICAgICBpcEFkZHJlc3M6IGAxOTIuMTY4LiR7TWF0aC5mbG9vcihpbmRleCAvIDI1NCl9LiR7KGluZGV4ICUgMjU0KSArIDF9YCxcbiAgICAgICAgbWFjQWRkcmVzczogYDAwOiR7KChpbmRleCA+PiA4KSAmIDB4ZmYpLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpfTokeyhpbmRleCAmIDB4ZmYpLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpfTowMDowMDowMGAsXG4gICAgICAgIG9wZXJhdGluZ1N5c3RlbTogdHlwZSA9PT0gJ1NlcnZlcicgPyAnV2luZG93cyBTZXJ2ZXIgMjAxOScgOiAnV2luZG93cyAxMScsXG4gICAgICAgIG9zVmVyc2lvbjogdHlwZSA9PT0gJ1NlcnZlcicgPyAnMTAuMC4xNzc2MycgOiAnMTAuMC4yMjAwMCcsXG4gICAgICAgIGNwdTogYEludGVsIENvcmUgaSR7NSArIChpbmRleCAlIDQpfSAkezkwMDAgKyBpbmRleH1gLFxuICAgICAgICByYW1HQjogdHlwZSA9PT0gJ1NlcnZlcicgPyAzMiArIChpbmRleCAlIDMpICogMzIgOiA4ICsgKGluZGV4ICUgMykgKiA4LFxuICAgICAgICBkaXNrR0I6IHR5cGUgPT09ICdTZXJ2ZXInID8gNTAwICsgKGluZGV4ICUgNCkgKiA1MDAgOiAyNTYgKyAoaW5kZXggJSAzKSAqIDI1NixcbiAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uc1tpbmRleCAlIGxvY2F0aW9ucy5sZW5ndGhdLFxuICAgICAgICBkZXBhcnRtZW50OiBkZXBhcnRtZW50c1tpbmRleCAlIGRlcGFydG1lbnRzLmxlbmd0aF0sXG4gICAgICAgIG93bmVyOiBgdXNlciR7KGluZGV4ICUgNTApICsgMX1AY29tcGFueS5jb21gLFxuICAgICAgICBhc3NpZ25lZFVzZXI6IHR5cGUgIT09ICdTZXJ2ZXInID8gYHVzZXIkeyhpbmRleCAlIDUwKSArIDF9QGNvbXBhbnkuY29tYCA6IHVuZGVmaW5lZCxcbiAgICAgICAgcHVyY2hhc2VEYXRlOiBwdXJjaGFzZURhdGUudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdLFxuICAgICAgICB3YXJyYW50eUV4cGlyeTogbmV3IERhdGUocHVyY2hhc2VEYXRlLmdldFRpbWUoKSArIDMgKiAzNjUgKiAyNCAqIDYwICogNjAgKiAxMDAwKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0sXG4gICAgICAgIHN0YXR1czogc3RhdHVzZXNbaW5kZXggJSBzdGF0dXNlcy5sZW5ndGhdLFxuICAgICAgICBsYXN0U2VlbjogbmV3IERhdGUoRGF0ZS5ub3coKSAtIE1hdGgucmFuZG9tKCkgKiA3ICogMjQgKiA2MCAqIDYwICogMTAwMCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgZG9tYWluSm9pbmVkOiBNYXRoLnJhbmRvbSgpID4gMC4xLFxuICAgICAgICBkb21haW46ICdjb21wYW55LmxvY2FsJyxcbiAgICAgICAgYWdlLFxuICAgICAgICBsaWZlY3ljbGVTdGF0dXM6IGFnZSA8IDEgPyAnTmV3JyA6IGFnZSA8IDMgPyAnQ3VycmVudCcgOiBhZ2UgPCA1ID8gJ0FnaW5nJyA6ICdFbmQgb2YgTGlmZScsXG4gICAgfTtcbn1cbi8qKlxuICogR2VuZXJhdGUgY29tcGxldGUgbW9jayBhc3NldCBkYXRhXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlTW9ja0Fzc2V0RGF0YSgpIHtcbiAgICBjb25zdCBhc3NldHMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE1MDsgaSsrKSB7XG4gICAgICAgIGFzc2V0cy5wdXNoKGdlbmVyYXRlTW9ja0Fzc2V0KGkpKTtcbiAgICB9XG4gICAgY29uc3Qgc3RhdGlzdGljcyA9IHtcbiAgICAgICAgdG90YWxBc3NldHM6IGFzc2V0cy5sZW5ndGgsXG4gICAgICAgIHdvcmtzdGF0aW9uczogYXNzZXRzLmZpbHRlcihhID0+IGEudHlwZSA9PT0gJ1dvcmtzdGF0aW9uJykubGVuZ3RoLFxuICAgICAgICBzZXJ2ZXJzOiBhc3NldHMuZmlsdGVyKGEgPT4gYS50eXBlID09PSAnU2VydmVyJykubGVuZ3RoLFxuICAgICAgICBtb2JpbGVEZXZpY2VzOiBhc3NldHMuZmlsdGVyKGEgPT4gYS50eXBlID09PSAnTW9iaWxlJykubGVuZ3RoLFxuICAgICAgICBuZXR3b3JrRGV2aWNlczogYXNzZXRzLmZpbHRlcihhID0+IGEudHlwZSA9PT0gJ05ldHdvcmsnKS5sZW5ndGgsXG4gICAgICAgIHByaW50ZXJzOiBhc3NldHMuZmlsdGVyKGEgPT4gYS50eXBlID09PSAnUHJpbnRlcicpLmxlbmd0aCxcbiAgICAgICAgYWN0aXZlQXNzZXRzOiBhc3NldHMuZmlsdGVyKGEgPT4gYS5zdGF0dXMgPT09ICdBY3RpdmUnKS5sZW5ndGgsXG4gICAgICAgIGluYWN0aXZlQXNzZXRzOiBhc3NldHMuZmlsdGVyKGEgPT4gYS5zdGF0dXMgPT09ICdJbmFjdGl2ZScpLmxlbmd0aCxcbiAgICAgICAgYXZnQWdlOiBhc3NldHMucmVkdWNlKChzdW0sIGEpID0+IHN1bSArIChhLmFnZSB8fCAwKSwgMCkgLyBhc3NldHMubGVuZ3RoLFxuICAgICAgICB0b3RhbFZhbHVlOiBhc3NldHMubGVuZ3RoICogMTUwMCxcbiAgICB9O1xuICAgIHJldHVybiB7IGFzc2V0cywgc3RhdGlzdGljcyB9O1xufVxuLyoqXG4gKiBDb252ZXJ0IGFzc2V0cyB0byBDU1YgZm9ybWF0XG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRBc3NldHNUb0NTVihhc3NldHMpIHtcbiAgICBjb25zdCBoZWFkZXJzID0gW1xuICAgICAgICAnSUQnLCAnTmFtZScsICdUeXBlJywgJ0NhdGVnb3J5JywgJ01hbnVmYWN0dXJlcicsICdNb2RlbCcsICdTZXJpYWwgTnVtYmVyJyxcbiAgICAgICAgJ0lQIEFkZHJlc3MnLCAnTUFDIEFkZHJlc3MnLCAnT3BlcmF0aW5nIFN5c3RlbScsICdPUyBWZXJzaW9uJyxcbiAgICAgICAgJ0NQVScsICdSQU0gKEdCKScsICdEaXNrIChHQiknLCAnTG9jYXRpb24nLCAnRGVwYXJ0bWVudCcsICdPd25lcicsXG4gICAgICAgICdBc3NpZ25lZCBVc2VyJywgJ1B1cmNoYXNlIERhdGUnLCAnV2FycmFudHkgRXhwaXJ5JywgJ1N0YXR1cycsICdMYXN0IFNlZW4nLFxuICAgICAgICAnRG9tYWluIEpvaW5lZCcsICdEb21haW4nLCAnQWdlIChZZWFycyknLCAnTGlmZWN5Y2xlIFN0YXR1cydcbiAgICBdO1xuICAgIGNvbnN0IHJvd3MgPSBhc3NldHMubWFwKGFzc2V0ID0+IFtcbiAgICAgICAgYXNzZXQuaWQsXG4gICAgICAgIGFzc2V0Lm5hbWUsXG4gICAgICAgIGFzc2V0LnR5cGUsXG4gICAgICAgIGFzc2V0LmNhdGVnb3J5LFxuICAgICAgICBhc3NldC5tYW51ZmFjdHVyZXIgfHwgJycsXG4gICAgICAgIGFzc2V0Lm1vZGVsIHx8ICcnLFxuICAgICAgICBhc3NldC5zZXJpYWxOdW1iZXIgfHwgJycsXG4gICAgICAgIGFzc2V0LmlwQWRkcmVzcyB8fCAnJyxcbiAgICAgICAgYXNzZXQubWFjQWRkcmVzcyB8fCAnJyxcbiAgICAgICAgYXNzZXQub3BlcmF0aW5nU3lzdGVtIHx8ICcnLFxuICAgICAgICBhc3NldC5vc1ZlcnNpb24gfHwgJycsXG4gICAgICAgIGFzc2V0LmNwdSB8fCAnJyxcbiAgICAgICAgYXNzZXQucmFtR0I/LnRvU3RyaW5nKCkgfHwgJycsXG4gICAgICAgIGFzc2V0LmRpc2tHQj8udG9TdHJpbmcoKSB8fCAnJyxcbiAgICAgICAgYXNzZXQubG9jYXRpb24gfHwgJycsXG4gICAgICAgIGFzc2V0LmRlcGFydG1lbnQgfHwgJycsXG4gICAgICAgIGFzc2V0Lm93bmVyIHx8ICcnLFxuICAgICAgICBhc3NldC5hc3NpZ25lZFVzZXIgfHwgJycsXG4gICAgICAgIGFzc2V0LnB1cmNoYXNlRGF0ZSB8fCAnJyxcbiAgICAgICAgYXNzZXQud2FycmFudHlFeHBpcnkgfHwgJycsXG4gICAgICAgIGFzc2V0LnN0YXR1cyxcbiAgICAgICAgYXNzZXQubGFzdFNlZW4gfHwgJycsXG4gICAgICAgIGFzc2V0LmRvbWFpbkpvaW5lZCA/ICdZZXMnIDogJ05vJyxcbiAgICAgICAgYXNzZXQuZG9tYWluIHx8ICcnLFxuICAgICAgICBhc3NldC5hZ2U/LnRvU3RyaW5nKCkgfHwgJycsXG4gICAgICAgIGFzc2V0LmxpZmVjeWNsZVN0YXR1cyB8fCAnJyxcbiAgICBdKTtcbiAgICByZXR1cm4gW2hlYWRlcnMuam9pbignLCcpLCAuLi5yb3dzLm1hcChyb3cgPT4gcm93LmpvaW4oJywnKSldLmpvaW4oJ1xcbicpO1xufVxuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQXNzZXQgSW52ZW50b3J5IFZpZXdcbiAqIENvbXByZWhlbnNpdmUgYXNzZXQgdHJhY2tpbmcgYW5kIGxpZmVjeWNsZSBtYW5hZ2VtZW50XG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBQYWNrYWdlLCBTZXJ2ZXIsIE1vbml0b3IsIFNtYXJ0cGhvbmUsIEhhcmREcml2ZSwgRGF0YWJhc2UsIFNlYXJjaCwgRG93bmxvYWQgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgdXNlQXNzZXRJbnZlbnRvcnlMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZUFzc2V0SW52ZW50b3J5TG9naWMnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgSW5wdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0lucHV0JztcbmltcG9ydCB7IEJhZGdlIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CYWRnZSc7XG5pbXBvcnQgeyBWaXJ0dWFsaXplZERhdGFHcmlkIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZCc7XG5leHBvcnQgY29uc3QgQXNzZXRJbnZlbnRvcnlWaWV3ID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgYXNzZXRzLCBzdGF0aXN0aWNzLCBpc0xvYWRpbmcsIGVycm9yLCBzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0LCB0eXBlRmlsdGVyLCBzZXRUeXBlRmlsdGVyLCBzdGF0dXNGaWx0ZXIsIHNldFN0YXR1c0ZpbHRlciwgcmVmcmVzaERhdGEsIGV4cG9ydEFzc2V0cywgfSA9IHVzZUFzc2V0SW52ZW50b3J5TG9naWMoKTtcbiAgICBjb25zdCBhc3NldFR5cGVzID0gW1xuICAgICAgICB7IGlkOiAnYWxsJywgbGFiZWw6ICdBbGwgQXNzZXRzJywgaWNvbjogUGFja2FnZSwgY291bnQ6IHN0YXRpc3RpY3M/LnRvdGFsQXNzZXRzIHx8IDAgfSxcbiAgICAgICAgeyBpZDogJ3NlcnZlcnMnLCBsYWJlbDogJ1NlcnZlcnMnLCBpY29uOiBTZXJ2ZXIsIGNvdW50OiBzdGF0aXN0aWNzPy5zZXJ2ZXJzIHx8IDAgfSxcbiAgICAgICAgeyBpZDogJ3dvcmtzdGF0aW9ucycsIGxhYmVsOiAnV29ya3N0YXRpb25zJywgaWNvbjogTW9uaXRvciwgY291bnQ6IHN0YXRpc3RpY3M/LndvcmtzdGF0aW9ucyB8fCAwIH0sXG4gICAgICAgIHsgaWQ6ICdtb2JpbGUnLCBsYWJlbDogJ01vYmlsZSBEZXZpY2VzJywgaWNvbjogU21hcnRwaG9uZSwgY291bnQ6IHN0YXRpc3RpY3M/Lm1vYmlsZURldmljZXMgfHwgMCB9LFxuICAgICAgICB7IGlkOiAnbmV0d29yaycsIGxhYmVsOiAnTmV0d29yayBEZXZpY2VzJywgaWNvbjogSGFyZERyaXZlLCBjb3VudDogc3RhdGlzdGljcz8ubmV0d29ya0RldmljZXMgfHwgMCB9LFxuICAgICAgICB7IGlkOiAncHJpbnRlcnMnLCBsYWJlbDogJ1ByaW50ZXJzJywgaWNvbjogRGF0YWJhc2UsIGNvdW50OiBzdGF0aXN0aWNzPy5wcmludGVycyB8fCAwIH0sXG4gICAgXTtcbiAgICBjb25zdCBjb2x1bW5EZWZzID0gW1xuICAgICAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdOYW1lJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICB7IGZpZWxkOiAndHlwZScsIGhlYWRlck5hbWU6ICdUeXBlJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICB7IGZpZWxkOiAnbWFudWZhY3R1cmVyJywgaGVhZGVyTmFtZTogJ01hbnVmYWN0dXJlcicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgeyBmaWVsZDogJ21vZGVsJywgaGVhZGVyTmFtZTogJ01vZGVsJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICB7IGZpZWxkOiAnc2VyaWFsTnVtYmVyJywgaGVhZGVyTmFtZTogJ1NlcmlhbCBOdW1iZXInLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICB7IGZpZWxkOiAnbG9jYXRpb24nLCBoZWFkZXJOYW1lOiAnTG9jYXRpb24nLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlIH0sXG4gICAgICAgIHsgZmllbGQ6ICdzdGF0dXMnLCBoZWFkZXJOYW1lOiAnU3RhdHVzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgIF07XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGZsZXgtY29sIGgtZnVsbCBwLTYgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIFwiZGF0YS1jeVwiOiBcImFzc2V0LWludmVudG9yeS12aWV3XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJhc3NldC1pbnZlbnRvcnktdmlld1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi02XCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInAtMyBiZy1pbmRpZ28tMTAwIGRhcms6YmctaW5kaWdvLTkwMCByb3VuZGVkLWxnXCIsIGNoaWxkcmVuOiBfanN4KFBhY2thZ2UsIHsgY2xhc3NOYW1lOiBcInctOCBoLTggdGV4dC1pbmRpZ28tNjAwIGRhcms6dGV4dC1pbmRpZ28tNDAwXCIgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0zeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkFzc2V0IEludmVudG9yeVwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogXCJDb21wbGV0ZSBhc3NldCB0cmFja2luZyBhbmQgbGlmZWN5Y2xlIG1hbmFnZW1lbnRcIiB9KV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiLCBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIG9uQ2xpY2s6IHJlZnJlc2hEYXRhLCBkaXNhYmxlZDogaXNMb2FkaW5nLCBcImRhdGEtY3lcIjogXCJyZWZyZXNoLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwicmVmcmVzaC1idG5cIiwgY2hpbGRyZW46IFwiUmVmcmVzaFwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgb25DbGljazogZXhwb3J0QXNzZXRzLCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1idG5cIiwgY2hpbGRyZW46IFwiRXhwb3J0IEludmVudG9yeVwiIH0pXSB9KV0gfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMiBtZDpncmlkLWNvbHMtMyBsZzpncmlkLWNvbHMtNiBnYXAtNCBtYi02XCIsIGNoaWxkcmVuOiBhc3NldFR5cGVzLm1hcCgodHlwZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBJY29uID0gdHlwZS5pY29uO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpc1NlbGVjdGVkID0gdHlwZUZpbHRlciA9PT0gdHlwZS5pZDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogKCkgPT4gc2V0VHlwZUZpbHRlcih0eXBlLmlkKSwgY2xhc3NOYW1lOiBgXHJcbiAgICAgICAgICAgICAgICBwLTQgcm91bmRlZC1sZyBib3JkZXItMiB0cmFuc2l0aW9uLWFsbFxyXG4gICAgICAgICAgICAgICAgJHtpc1NlbGVjdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAnYm9yZGVyLWluZGlnby01MDAgYmctaW5kaWdvLTUwIGRhcms6YmctaW5kaWdvLTkwMCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICdib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBob3Zlcjpib3JkZXItaW5kaWdvLTMwMCd9XHJcbiAgICAgICAgICAgICAgYCwgXCJkYXRhLWN5XCI6IGBhc3NldC10eXBlLSR7dHlwZS5pZH1gLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4KEljb24sIHsgY2xhc3NOYW1lOiBgdy04IGgtOCAke2lzU2VsZWN0ZWQgPyAndGV4dC1pbmRpZ28tNjAwJyA6ICd0ZXh0LWdyYXktNDAwJ31gIH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiB0eXBlLmxhYmVsIH0pLCBfanN4KEJhZGdlLCB7IHZhcmlhbnQ6IGlzU2VsZWN0ZWQgPyAncHJpbWFyeScgOiAnZGVmYXVsdCcsIGNoaWxkcmVuOiB0eXBlLmNvdW50IH0pXSB9KSB9LCB0eXBlLmlkKSk7XG4gICAgICAgICAgICAgICAgfSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibWItNlwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVsYXRpdmVcIiwgY2hpbGRyZW46IFtfanN4KFNlYXJjaCwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgbGVmdC0zIHRvcC0xLzIgLXRyYW5zbGF0ZS15LTEvMiB3LTUgaC01IHRleHQtZ3JheS00MDBcIiB9KSwgX2pzeChJbnB1dCwgeyB0eXBlOiBcInRleHRcIiwgcGxhY2Vob2xkZXI6IFwiU2VhcmNoIGFzc2V0cyBieSBuYW1lLCBzZXJpYWwgbnVtYmVyLCBvciBsb2NhdGlvbi4uLlwiLCB2YWx1ZTogc2VhcmNoVGV4dCwgb25DaGFuZ2U6IChlKSA9PiBzZXRTZWFyY2hUZXh0KGUudGFyZ2V0LnZhbHVlKSwgY2xhc3NOYW1lOiBcInBsLTEwXCIsIFwiZGF0YS1jeVwiOiBcImFzc2V0LXNlYXJjaFwiLCBcImRhdGEtdGVzdGlkXCI6IFwiYXNzZXQtc2VhcmNoXCIgfSldIH0pIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogX2pzeChWaXJ0dWFsaXplZERhdGFHcmlkLCB7IGRhdGE6IGFzc2V0cywgY29sdW1uczogY29sdW1uRGVmcywgbG9hZGluZzogaXNMb2FkaW5nIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQXNzZXRJbnZlbnRvcnlWaWV3O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogSW5wdXQgQ29tcG9uZW50XG4gKlxuICogQWNjZXNzaWJsZSBpbnB1dCBmaWVsZCB3aXRoIGxhYmVsLCBlcnJvciBzdGF0ZXMsIGFuZCBoZWxwIHRleHRcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IGZvcndhcmRSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBBbGVydENpcmNsZSwgSW5mbyB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIElucHV0IGNvbXBvbmVudCB3aXRoIGZ1bGwgYWNjZXNzaWJpbGl0eSBzdXBwb3J0XG4gKi9cbmV4cG9ydCBjb25zdCBJbnB1dCA9IGZvcndhcmRSZWYoKHsgbGFiZWwsIGhlbHBlclRleHQsIGVycm9yLCByZXF1aXJlZCA9IGZhbHNlLCBzaG93T3B0aW9uYWwgPSB0cnVlLCBpbnB1dFNpemUgPSAnbWQnLCBmdWxsV2lkdGggPSBmYWxzZSwgc3RhcnRJY29uLCBlbmRJY29uLCBjbGFzc05hbWUsIGlkLCAnZGF0YS1jeSc6IGRhdGFDeSwgZGlzYWJsZWQgPSBmYWxzZSwgLi4ucHJvcHMgfSwgcmVmKSA9PiB7XG4gICAgLy8gR2VuZXJhdGUgdW5pcXVlIElEIGlmIG5vdCBwcm92aWRlZFxuICAgIGNvbnN0IGlucHV0SWQgPSBpZCB8fCBgaW5wdXQtJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICBjb25zdCBlcnJvcklkID0gYCR7aW5wdXRJZH0tZXJyb3JgO1xuICAgIGNvbnN0IGhlbHBlcklkID0gYCR7aW5wdXRJZH0taGVscGVyYDtcbiAgICAvLyBTaXplIHN0eWxlc1xuICAgIGNvbnN0IHNpemVzID0ge1xuICAgICAgICBzbTogJ3B4LTMgcHktMS41IHRleHQtc20nLFxuICAgICAgICBtZDogJ3B4LTQgcHktMiB0ZXh0LWJhc2UnLFxuICAgICAgICBsZzogJ3B4LTUgcHktMyB0ZXh0LWxnJyxcbiAgICB9O1xuICAgIC8vIElucHV0IGNsYXNzZXNcbiAgICBjb25zdCBpbnB1dENsYXNzZXMgPSBjbHN4KCdibG9jayByb3VuZGVkLW1kIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0yJywgJ2Rpc2FibGVkOmJnLWdyYXktNTAgZGlzYWJsZWQ6dGV4dC1ncmF5LTUwMCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQnLCAnZGFyazpiZy1ncmF5LTgwMCBkYXJrOnRleHQtZ3JheS0xMDAnLCBzaXplc1tpbnB1dFNpemVdLCBmdWxsV2lkdGggJiYgJ3ctZnVsbCcsIHN0YXJ0SWNvbiAmJiAncGwtMTAnLCBlbmRJY29uICYmICdwci0xMCcsIGVycm9yXG4gICAgICAgID8gY2xzeCgnYm9yZGVyLXJlZC01MDAgdGV4dC1yZWQtOTAwIHBsYWNlaG9sZGVyLXJlZC00MDAnLCAnZm9jdXM6Ym9yZGVyLXJlZC01MDAgZm9jdXM6cmluZy1yZWQtNTAwJywgJ2Rhcms6Ym9yZGVyLXJlZC00MDAgZGFyazp0ZXh0LXJlZC00MDAnKVxuICAgICAgICA6IGNsc3goJ2JvcmRlci1ncmF5LTMwMCBwbGFjZWhvbGRlci1ncmF5LTQwMCcsICdmb2N1czpib3JkZXItYmx1ZS01MDAgZm9jdXM6cmluZy1ibHVlLTUwMCcsICdkYXJrOmJvcmRlci1ncmF5LTYwMCBkYXJrOnBsYWNlaG9sZGVyLWdyYXktNTAwJyksIGNsYXNzTmFtZSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeChmdWxsV2lkdGggJiYgJ3ctZnVsbCcpO1xuICAgIC8vIExhYmVsIGNsYXNzZXNcbiAgICBjb25zdCBsYWJlbENsYXNzZXMgPSBjbHN4KCdibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgZGFyazp0ZXh0LWdyYXktMjAwIG1iLTEnKTtcbiAgICAvLyBIZWxwZXIvRXJyb3IgdGV4dCBjbGFzc2VzXG4gICAgY29uc3QgaGVscGVyQ2xhc3NlcyA9IGNsc3goJ210LTEgdGV4dC1zbScsIGVycm9yID8gJ3RleHQtcmVkLTYwMCBkYXJrOnRleHQtcmVkLTQwMCcgOiAndGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAnKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsICYmIChfanN4cyhcImxhYmVsXCIsIHsgaHRtbEZvcjogaW5wdXRJZCwgY2xhc3NOYW1lOiBsYWJlbENsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwsIHJlcXVpcmVkICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXJlZC01MDAgbWwtMVwiLCBcImFyaWEtbGFiZWxcIjogXCJyZXF1aXJlZFwiLCBjaGlsZHJlbjogXCIqXCIgfSkpLCAhcmVxdWlyZWQgJiYgc2hvd09wdGlvbmFsICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCBtbC0xIHRleHQteHNcIiwgY2hpbGRyZW46IFwiKG9wdGlvbmFsKVwiIH0pKV0gfSkpLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJyZWxhdGl2ZVwiLCBjaGlsZHJlbjogW3N0YXJ0SWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgbGVmdC0wIHBsLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IHN0YXJ0SWNvbiB9KSB9KSksIF9qc3goXCJpbnB1dFwiLCB7IHJlZjogcmVmLCBpZDogaW5wdXRJZCwgY2xhc3NOYW1lOiBpbnB1dENsYXNzZXMsIFwiYXJpYS1pbnZhbGlkXCI6ICEhZXJyb3IsIFwiYXJpYS1kZXNjcmliZWRieVwiOiBjbHN4KGVycm9yICYmIGVycm9ySWQsIGhlbHBlclRleHQgJiYgaGVscGVySWQpIHx8IHVuZGVmaW5lZCwgXCJhcmlhLXJlcXVpcmVkXCI6IHJlcXVpcmVkLCBkaXNhYmxlZDogZGlzYWJsZWQsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIC4uLnByb3BzIH0pLCBlbmRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCByaWdodC0wIHByLTMgZmxleCBpdGVtcy1jZW50ZXIgcG9pbnRlci1ldmVudHMtbm9uZVwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiwgY2hpbGRyZW46IGVuZEljb24gfSkgfSkpXSB9KSwgZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogZXJyb3JJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCByb2xlOiBcImFsZXJ0XCIsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0Q2lyY2xlLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgZXJyb3JdIH0pIH0pKSwgaGVscGVyVGV4dCAmJiAhZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBpZDogaGVscGVySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3NlcywgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goSW5mbywgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGhlbHBlclRleHRdIH0pIH0pKV0gfSkpO1xufSk7XG5JbnB1dC5kaXNwbGF5TmFtZSA9ICdJbnB1dCc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwgRnJhZ21lbnQgYXMgX0ZyYWdtZW50LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFZpcnR1YWxpemVkRGF0YUdyaWQgQ29tcG9uZW50XG4gKlxuICogRW50ZXJwcmlzZS1ncmFkZSBkYXRhIGdyaWQgdXNpbmcgQUcgR3JpZCBFbnRlcnByaXNlXG4gKiBIYW5kbGVzIDEwMCwwMDArIHJvd3Mgd2l0aCB2aXJ0dWFsIHNjcm9sbGluZyBhdCA2MCBGUFNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFnR3JpZFJlYWN0IH0gZnJvbSAnYWctZ3JpZC1yZWFjdCc7XG5pbXBvcnQgJ2FnLWdyaWQtZW50ZXJwcmlzZSc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgUHJpbnRlciwgRXllLCBFeWVPZmYsIEZpbHRlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL2F0b21zL1NwaW5uZXInO1xuLy8gTGF6eSBsb2FkIEFHIEdyaWQgQ1NTIC0gb25seSBsb2FkIG9uY2Ugd2hlbiBmaXJzdCBncmlkIG1vdW50c1xubGV0IGFnR3JpZFN0eWxlc0xvYWRlZCA9IGZhbHNlO1xuY29uc3QgbG9hZEFnR3JpZFN0eWxlcyA9ICgpID0+IHtcbiAgICBpZiAoYWdHcmlkU3R5bGVzTG9hZGVkKVxuICAgICAgICByZXR1cm47XG4gICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IEFHIEdyaWQgc3R5bGVzXG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctZ3JpZC5jc3MnKTtcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy10aGVtZS1hbHBpbmUuY3NzJyk7XG4gICAgYWdHcmlkU3R5bGVzTG9hZGVkID0gdHJ1ZTtcbn07XG4vKipcbiAqIEhpZ2gtcGVyZm9ybWFuY2UgZGF0YSBncmlkIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIoeyBkYXRhLCBjb2x1bW5zLCBsb2FkaW5nID0gZmFsc2UsIHZpcnR1YWxSb3dIZWlnaHQgPSAzMiwgZW5hYmxlQ29sdW1uUmVvcmRlciA9IHRydWUsIGVuYWJsZUNvbHVtblJlc2l6ZSA9IHRydWUsIGVuYWJsZUV4cG9ydCA9IHRydWUsIGVuYWJsZVByaW50ID0gdHJ1ZSwgZW5hYmxlR3JvdXBpbmcgPSBmYWxzZSwgZW5hYmxlRmlsdGVyaW5nID0gdHJ1ZSwgZW5hYmxlU2VsZWN0aW9uID0gdHJ1ZSwgc2VsZWN0aW9uTW9kZSA9ICdtdWx0aXBsZScsIHBhZ2luYXRpb24gPSB0cnVlLCBwYWdpbmF0aW9uUGFnZVNpemUgPSAxMDAsIG9uUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlLCBjbGFzc05hbWUsIGhlaWdodCA9ICc2MDBweCcsICdkYXRhLWN5JzogZGF0YUN5LCB9LCByZWYpIHtcbiAgICBjb25zdCBncmlkUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IFtncmlkQXBpLCBzZXRHcmlkQXBpXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzaG93Q29sdW1uUGFuZWwsIHNldFNob3dDb2x1bW5QYW5lbF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgcm93RGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhID8/IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnW1ZpcnR1YWxpemVkRGF0YUdyaWRdIHJvd0RhdGEgY29tcHV0ZWQ6JywgcmVzdWx0Lmxlbmd0aCwgJ3Jvd3MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgQUcgR3JpZCBzdHlsZXMgb24gY29tcG9uZW50IG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEFnR3JpZFN0eWxlcygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBEZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uXG4gICAgY29uc3QgZGVmYXVsdENvbERlZiA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICByZXNpemFibGU6IGVuYWJsZUNvbHVtblJlc2l6ZSxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgbWluV2lkdGg6IDEwMCxcbiAgICB9KSwgW2VuYWJsZUZpbHRlcmluZywgZW5hYmxlQ29sdW1uUmVzaXplXSk7XG4gICAgLy8gR3JpZCBvcHRpb25zXG4gICAgY29uc3QgZ3JpZE9wdGlvbnMgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHJvd0hlaWdodDogdmlydHVhbFJvd0hlaWdodCxcbiAgICAgICAgaGVhZGVySGVpZ2h0OiA0MCxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiA0MCxcbiAgICAgICAgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogIWVuYWJsZVNlbGVjdGlvbixcbiAgICAgICAgcm93U2VsZWN0aW9uOiBlbmFibGVTZWxlY3Rpb24gPyBzZWxlY3Rpb25Nb2RlIDogdW5kZWZpbmVkLFxuICAgICAgICBhbmltYXRlUm93czogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBEaXNhYmxlIGNoYXJ0cyB0byBhdm9pZCBlcnJvciAjMjAwIChyZXF1aXJlcyBJbnRlZ3JhdGVkQ2hhcnRzTW9kdWxlKVxuICAgICAgICBlbmFibGVDaGFydHM6IGZhbHNlLFxuICAgICAgICAvLyBGSVg6IFVzZSBjZWxsU2VsZWN0aW9uIGluc3RlYWQgb2YgZGVwcmVjYXRlZCBlbmFibGVSYW5nZVNlbGVjdGlvblxuICAgICAgICBjZWxsU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IFVzZSBsZWdhY3kgdGhlbWUgdG8gcHJldmVudCB0aGVtaW5nIEFQSSBjb25mbGljdCAoZXJyb3IgIzIzOSlcbiAgICAgICAgLy8gTXVzdCBiZSBzZXQgdG8gJ2xlZ2FjeScgdG8gdXNlIHYzMiBzdHlsZSB0aGVtZXMgd2l0aCBDU1MgZmlsZXNcbiAgICAgICAgdGhlbWU6ICdsZWdhY3knLFxuICAgICAgICBzdGF0dXNCYXI6IHtcbiAgICAgICAgICAgIHN0YXR1c1BhbmVsczogW1xuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1RvdGFsQW5kRmlsdGVyZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdTZWxlY3RlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnQWdncmVnYXRpb25Db21wb25lbnQnLCBhbGlnbjogJ3JpZ2h0JyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgc2lkZUJhcjogZW5hYmxlR3JvdXBpbmdcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHRvb2xQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnQ29sdW1uc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdGaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnZmlsdGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnRmlsdGVyc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VG9vbFBhbmVsOiAnJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogZmFsc2UsXG4gICAgfSksIFt2aXJ0dWFsUm93SGVpZ2h0LCBlbmFibGVTZWxlY3Rpb24sIHNlbGVjdGlvbk1vZGUsIGVuYWJsZUdyb3VwaW5nXSk7XG4gICAgLy8gSGFuZGxlIGdyaWQgcmVhZHkgZXZlbnRcbiAgICBjb25zdCBvbkdyaWRSZWFkeSA9IHVzZUNhbGxiYWNrKChwYXJhbXMpID0+IHtcbiAgICAgICAgc2V0R3JpZEFwaShwYXJhbXMuYXBpKTtcbiAgICAgICAgcGFyYW1zLmFwaS5zaXplQ29sdW1uc1RvRml0KCk7XG4gICAgfSwgW10pO1xuICAgIC8vIEhhbmRsZSByb3cgY2xpY2tcbiAgICBjb25zdCBoYW5kbGVSb3dDbGljayA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25Sb3dDbGljayAmJiBldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBvblJvd0NsaWNrKGV2ZW50LmRhdGEpO1xuICAgICAgICB9XG4gICAgfSwgW29uUm93Q2xpY2tdKTtcbiAgICAvLyBIYW5kbGUgc2VsZWN0aW9uIGNoYW5nZVxuICAgIGNvbnN0IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25TZWxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IGV2ZW50LmFwaS5nZXRTZWxlY3RlZFJvd3MoKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlKHNlbGVjdGVkUm93cyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25TZWxlY3Rpb25DaGFuZ2VdKTtcbiAgICAvLyBFeHBvcnQgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9Dc3YgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0Nzdih7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9LmNzdmAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gRXhwb3J0IHRvIEV4Y2VsXG4gICAgY29uc3QgZXhwb3J0VG9FeGNlbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzRXhjZWwoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS54bHN4YCxcbiAgICAgICAgICAgICAgICBzaGVldE5hbWU6ICdEYXRhJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBQcmludCBncmlkXG4gICAgY29uc3QgcHJpbnRHcmlkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCAncHJpbnQnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wcmludCgpO1xuICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eSBwYW5lbFxuICAgIGNvbnN0IHRvZ2dsZUNvbHVtblBhbmVsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCk7XG4gICAgfSwgW3Nob3dDb2x1bW5QYW5lbF0pO1xuICAgIC8vIEF1dG8tc2l6ZSBhbGwgY29sdW1uc1xuICAgIGNvbnN0IGF1dG9TaXplQ29sdW1ucyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbENvbHVtbklkcyA9IGNvbHVtbnMubWFwKGMgPT4gYy5maWVsZCkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAgICAgZ3JpZEFwaS5hdXRvU2l6ZUNvbHVtbnMoYWxsQ29sdW1uSWRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpLCBjb2x1bW5zXSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgnZmxleCBmbGV4LWNvbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbGcgc2hhZG93LXNtJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgcmVmOiByZWYsIGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGxvYWRpbmcgPyAoX2pzeChTcGlubmVyLCB7IHNpemU6IFwic21cIiB9KSkgOiAoYCR7cm93RGF0YS5sZW5ndGgudG9Mb2NhbGVTdHJpbmcoKX0gcm93c2ApIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW2VuYWJsZUZpbHRlcmluZyAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRmlsdGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBzZXRGbG9hdGluZ0ZpbHRlcnNIZWlnaHQgaXMgZGVwcmVjYXRlZCBpbiBBRyBHcmlkIHYzNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvYXRpbmcgZmlsdGVycyBhcmUgbm93IGNvbnRyb2xsZWQgdGhyb3VnaCBjb2x1bW4gZGVmaW5pdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRmlsdGVyIHRvZ2dsZSBub3QgeWV0IGltcGxlbWVudGVkIGZvciBBRyBHcmlkIHYzNCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aXRsZTogXCJUb2dnbGUgZmlsdGVyc1wiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtZmlsdGVyc1wiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSkpLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogc2hvd0NvbHVtblBhbmVsID8gX2pzeChFeWVPZmYsIHsgc2l6ZTogMTYgfSkgOiBfanN4KEV5ZSwgeyBzaXplOiAxNiB9KSwgb25DbGljazogdG9nZ2xlQ29sdW1uUGFuZWwsIHRpdGxlOiBcIlRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eVwiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtY29sdW1uc1wiLCBjaGlsZHJlbjogXCJDb2x1bW5zXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBhdXRvU2l6ZUNvbHVtbnMsIHRpdGxlOiBcIkF1dG8tc2l6ZSBjb2x1bW5zXCIsIFwiZGF0YS1jeVwiOiBcImF1dG8tc2l6ZVwiLCBjaGlsZHJlbjogXCJBdXRvIFNpemVcIiB9KSwgZW5hYmxlRXhwb3J0ICYmIChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9Dc3YsIHRpdGxlOiBcIkV4cG9ydCB0byBDU1ZcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWNzdlwiLCBjaGlsZHJlbjogXCJDU1ZcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvRXhjZWwsIHRpdGxlOiBcIkV4cG9ydCB0byBFeGNlbFwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWxcIiwgY2hpbGRyZW46IFwiRXhjZWxcIiB9KV0gfSkpLCBlbmFibGVQcmludCAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goUHJpbnRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogcHJpbnRHcmlkLCB0aXRsZTogXCJQcmludFwiLCBcImRhdGEtY3lcIjogXCJwcmludFwiLCBjaGlsZHJlbjogXCJQcmludFwiIH0pKV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcmVsYXRpdmVcIiwgY2hpbGRyZW46IFtsb2FkaW5nICYmIChfanN4KFwiZGl2XCIsIHsgXCJkYXRhLXRlc3RpZFwiOiBcImdyaWQtbG9hZGluZ1wiLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogXCJMb2FkaW5nIGRhdGFcIiwgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LTAgYmctd2hpdGUgYmctb3BhY2l0eS03NSBkYXJrOmJnLWdyYXktOTAwIGRhcms6Ymctb3BhY2l0eS03NSB6LTEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBsYWJlbDogXCJMb2FkaW5nIGRhdGEuLi5cIiB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2FnLXRoZW1lLWFscGluZScsICdkYXJrOmFnLXRoZW1lLWFscGluZS1kYXJrJywgJ3ctZnVsbCcpLCBzdHlsZTogeyBoZWlnaHQgfSwgY2hpbGRyZW46IF9qc3goQWdHcmlkUmVhY3QsIHsgcmVmOiBncmlkUmVmLCByb3dEYXRhOiByb3dEYXRhLCBjb2x1bW5EZWZzOiBjb2x1bW5zLCBkZWZhdWx0Q29sRGVmOiBkZWZhdWx0Q29sRGVmLCBncmlkT3B0aW9uczogZ3JpZE9wdGlvbnMsIG9uR3JpZFJlYWR5OiBvbkdyaWRSZWFkeSwgb25Sb3dDbGlja2VkOiBoYW5kbGVSb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2VkOiBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UsIHJvd0J1ZmZlcjogMjAsIHJvd01vZGVsVHlwZTogXCJjbGllbnRTaWRlXCIsIHBhZ2luYXRpb246IHBhZ2luYXRpb24sIHBhZ2luYXRpb25QYWdlU2l6ZTogcGFnaW5hdGlvblBhZ2VTaXplLCBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBmYWxzZSwgc3VwcHJlc3NDZWxsRm9jdXM6IGZhbHNlLCBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogdHJ1ZSwgZW5zdXJlRG9tT3JkZXI6IHRydWUgfSkgfSksIHNob3dDb2x1bW5QYW5lbCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTY0IGgtZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1sIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTQgb3ZlcmZsb3cteS1hdXRvIHotMjBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtIG1iLTNcIiwgY2hpbGRyZW46IFwiQ29sdW1uIFZpc2liaWxpdHlcIiB9KSwgY29sdW1ucy5tYXAoKGNvbCkgPT4gKF9qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHktMVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2xhc3NOYW1lOiBcInJvdW5kZWRcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWUsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZEFwaSAmJiBjb2wuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0Q29sdW1uc1Zpc2libGUoW2NvbC5maWVsZF0sIGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogY29sLmhlYWRlck5hbWUgfHwgY29sLmZpZWxkIH0pXSB9LCBjb2wuZmllbGQpKSldIH0pKV0gfSldIH0pKTtcbn1cbmV4cG9ydCBjb25zdCBWaXJ0dWFsaXplZERhdGFHcmlkID0gUmVhY3QuZm9yd2FyZFJlZihWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIpO1xuLy8gU2V0IGRpc3BsYXlOYW1lIGZvciBSZWFjdCBEZXZUb29sc1xuVmlydHVhbGl6ZWREYXRhR3JpZC5kaXNwbGF5TmFtZSA9ICdWaXJ0dWFsaXplZERhdGFHcmlkJztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICpcbiAqIFNtYWxsIGxhYmVsIGNvbXBvbmVudCBmb3Igc3RhdHVzIGluZGljYXRvcnMsIGNvdW50cywgYW5kIHRhZ3MuXG4gKiBTdXBwb3J0cyBtdWx0aXBsZSB2YXJpYW50cyBhbmQgc2l6ZXMuXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgQmFkZ2UgPSAoeyBjaGlsZHJlbiwgdmFyaWFudCA9ICdkZWZhdWx0Jywgc2l6ZSA9ICdtZCcsIGRvdCA9IGZhbHNlLCBkb3RQb3NpdGlvbiA9ICdsZWFkaW5nJywgcmVtb3ZhYmxlID0gZmFsc2UsIG9uUmVtb3ZlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gVmFyaWFudCBzdHlsZXNcbiAgICBjb25zdCB2YXJpYW50Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWdyYXktMTAwIHRleHQtZ3JheS04MDAgYm9yZGVyLWdyYXktMjAwJyxcbiAgICAgICAgcHJpbWFyeTogJ2JnLWJsdWUtMTAwIHRleHQtYmx1ZS04MDAgYm9yZGVyLWJsdWUtMjAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTEwMCB0ZXh0LWdyZWVuLTgwMCBib3JkZXItZ3JlZW4tMjAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy0xMDAgdGV4dC15ZWxsb3ctODAwIGJvcmRlci15ZWxsb3ctMjAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTEwMCB0ZXh0LXJlZC04MDAgYm9yZGVyLXJlZC0yMDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi0xMDAgdGV4dC1jeWFuLTgwMCBib3JkZXItY3lhbi0yMDAnLFxuICAgIH07XG4gICAgLy8gRG90IGNvbG9yIGNsYXNzZXNcbiAgICBjb25zdCBkb3RDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS01MDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS01MDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tNTAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy01MDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtNTAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tNTAwJyxcbiAgICB9O1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAncHgtMiBweS0wLjUgdGV4dC14cycsXG4gICAgICAgIHNtOiAncHgtMi41IHB5LTAuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC0zIHB5LTEgdGV4dC1zbScsXG4gICAgICAgIGxnOiAncHgtMy41IHB5LTEuNSB0ZXh0LWJhc2UnLFxuICAgIH07XG4gICAgY29uc3QgZG90U2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAnaC0xLjUgdy0xLjUnLFxuICAgICAgICBzbTogJ2gtMiB3LTInLFxuICAgICAgICBtZDogJ2gtMiB3LTInLFxuICAgICAgICBsZzogJ2gtMi41IHctMi41JyxcbiAgICB9O1xuICAgIGNvbnN0IGJhZGdlQ2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAnaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUnLCAnZm9udC1tZWRpdW0gcm91bmRlZC1mdWxsIGJvcmRlcicsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnLCBcbiAgICAvLyBWYXJpYW50XG4gICAgdmFyaWFudENsYXNzZXNbdmFyaWFudF0sIFxuICAgIC8vIFNpemVcbiAgICBzaXplQ2xhc3Nlc1tzaXplXSwgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogYmFkZ2VDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW2RvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ2xlYWRpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogY2hpbGRyZW4gfSksIGRvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ3RyYWlsaW5nJyAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGNsc3goJ3JvdW5kZWQtZnVsbCcsIGRvdENsYXNzZXNbdmFyaWFudF0sIGRvdFNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSksIHJlbW92YWJsZSAmJiBvblJlbW92ZSAmJiAoX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IG9uUmVtb3ZlLCBjbGFzc05hbWU6IGNsc3goJ21sLTAuNSAtbXItMSBpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXInLCAncm91bmRlZC1mdWxsIGhvdmVyOmJnLWJsYWNrLzEwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMScsIHtcbiAgICAgICAgICAgICAgICAgICAgJ2gtMyB3LTMnOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICdoLTQgdy00Jzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgIH0pLCBcImFyaWEtbGFiZWxcIjogXCJSZW1vdmVcIiwgY2hpbGRyZW46IF9qc3goXCJzdmdcIiwgeyBjbGFzc05hbWU6IGNsc3goe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2gtMiB3LTInOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICdtZCcgfHwgc2l6ZSA9PT0gJ2xnJyxcbiAgICAgICAgICAgICAgICAgICAgfSksIGZpbGw6IFwiY3VycmVudENvbG9yXCIsIHZpZXdCb3g6IFwiMCAwIDIwIDIwXCIsIGNoaWxkcmVuOiBfanN4KFwicGF0aFwiLCB7IGZpbGxSdWxlOiBcImV2ZW5vZGRcIiwgZDogXCJNNC4yOTMgNC4yOTNhMSAxIDAgMDExLjQxNCAwTDEwIDguNTg2bDQuMjkzLTQuMjkzYTEgMSAwIDExMS40MTQgMS40MTRMMTEuNDE0IDEwbDQuMjkzIDQuMjkzYTEgMSAwIDAxLTEuNDE0IDEuNDE0TDEwIDExLjQxNGwtNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQtMS40MTRMOC41ODYgMTAgNC4yOTMgNS43MDdhMSAxIDAgMDEwLTEuNDE0elwiLCBjbGlwUnVsZTogXCJldmVub2RkXCIgfSkgfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQmFkZ2U7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=