"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7186],{

/***/ 7186:
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
        { id: 'all', label: 'All Assets', icon: lucide_react/* Package */.lPX, count: statistics?.totalAssets || 0 },
        { id: 'servers', label: 'Servers', icon: lucide_react/* Server */.gq4, count: statistics?.servers || 0 },
        { id: 'workstations', label: 'Workstations', icon: lucide_react/* Monitor */.VAG, count: statistics?.workstations || 0 },
        { id: 'mobile', label: 'Mobile Devices', icon: lucide_react/* Smartphone */.wO7, count: statistics?.mobileDevices || 0 },
        { id: 'network', label: 'Network Devices', icon: lucide_react/* HardDrive */.akk, count: statistics?.networkDevices || 0 },
        { id: 'printers', label: 'Printers', icon: lucide_react/* Database */.WmV, count: statistics?.printers || 0 },
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
    return ((0,jsx_runtime.jsxs)("div", { className: "flex flex-col h-full p-6 bg-gray-50 dark:bg-gray-900", "data-cy": "asset-inventory-view", "data-testid": "asset-inventory-view", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)("div", { className: "p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg", children: (0,jsx_runtime.jsx)(lucide_react/* Package */.lPX, { className: "w-8 h-8 text-indigo-600 dark:text-indigo-400" }) }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Asset Inventory" }), (0,jsx_runtime.jsx)("p", { className: "text-gray-600 dark:text-gray-400", children: "Complete asset tracking and lifecycle management" })] })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", onClick: refreshData, disabled: isLoading, "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "primary", onClick: exportAssets, icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4" }), "data-cy": "export-btn", children: "Export Inventory" })] })] }), (0,jsx_runtime.jsx)("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6", children: assetTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = typeFilter === type.id;
                    return ((0,jsx_runtime.jsx)("button", { onClick: () => setTypeFilter(type.id), className: `
                p-4 rounded-lg border-2 transition-all
                ${isSelected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300'}
              `, "data-cy": `asset-type-${type.id}`, children: (0,jsx_runtime.jsxs)("div", { className: "flex flex-col items-center gap-2", children: [(0,jsx_runtime.jsx)(Icon, { className: `w-8 h-8 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}` }), (0,jsx_runtime.jsx)("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: type.label }), (0,jsx_runtime.jsx)(Badge/* Badge */.E, { variant: isSelected ? 'primary' : 'default', children: type.count })] }) }, type.id));
                }) }), (0,jsx_runtime.jsx)("div", { className: "mb-6", children: (0,jsx_runtime.jsxs)("div", { className: "relative", children: [(0,jsx_runtime.jsx)(lucide_react/* Search */.vji, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }), (0,jsx_runtime.jsx)(Input/* Input */.p, { type: "text", placeholder: "Search assets by name, serial number, or location...", value: searchText, onChange: (e) => setSearchText(e.target.value), className: "pl-10", "data-cy": "asset-search", "data-testid": "asset-search" })] }) }), (0,jsx_runtime.jsx)("div", { className: "flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid/* VirtualizedDataGrid */.Q, { data: assets, columns: columnDefs, loading: isLoading }) })] }));
};
/* harmony default export */ const assets_AssetInventoryView = (AssetInventoryView);


/***/ }),

/***/ 34766:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   p: () => (/* binding */ Input)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72832);

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
    const inputClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('block rounded-md border transition-all duration-200', 'focus:outline-none focus:ring-2 focus:ring-offset-2', 'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed', 'dark:bg-gray-800 dark:text-gray-100', sizes[inputSize], fullWidth && 'w-full', startIcon && 'pl-10', endIcon && 'pr-10', error
        ? (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('border-red-500 text-red-900 placeholder-red-400', 'focus:border-red-500 focus:ring-red-500', 'dark:border-red-400 dark:text-red-400')
        : (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('border-gray-300 placeholder-gray-400', 'focus:border-blue-500 focus:ring-blue-500', 'dark:border-gray-600 dark:placeholder-gray-500'), className);
    // Container classes
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(fullWidth && 'w-full');
    // Label classes
    const labelClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1');
    // Helper/Error text classes
    const helperClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('mt-1 text-sm', error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400');
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, children: [label && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { htmlFor: inputId, className: labelClasses, children: [label, required && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-red-500 ml-1", "aria-label": "required", children: "*" })), !required && showOptional && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400 ml-1 text-xs", children: "(optional)" }))] })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "relative", children: [startIcon && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", "aria-hidden": "true", children: startIcon }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { ref: ref, id: inputId, className: inputClasses, "aria-invalid": !!error, "aria-describedby": (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(error && errorId, helperText && helperId) || undefined, "aria-required": required, disabled: disabled, "data-cy": dataCy, ...props }), endIcon && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-gray-500 dark:text-gray-400", "aria-hidden": "true", children: endIcon }) }))] }), error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: errorId, className: helperClasses, role: "alert", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .AlertCircle */ .RIJ, { className: "w-4 h-4 mr-1", "aria-hidden": "true" }), error] }) })), helperText && !error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { id: helperId, className: helperClasses, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "flex items-center", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Info */ .R2D, { className: "w-4 h-4 mr-1", "aria-hidden": "true" }), helperText] }) }))] }));
});
Input.displayName = 'Input';


/***/ }),

/***/ 59944:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Q: () => (/* binding */ VirtualizedDataGrid)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var ag_grid_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(66875);
/* harmony import */ var ag_grid_enterprise__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(71652);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(72832);
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(74160);
/* harmony import */ var _atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(28709);

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
    Promise.all(/* import() */[__webpack_require__.e(4489), __webpack_require__.e(4228), __webpack_require__.e(8270), __webpack_require__.e(180), __webpack_require__.e(4884), __webpack_require__.e(5157), __webpack_require__.e(2723), __webpack_require__.e(1818), __webpack_require__.e(1444), __webpack_require__.e(7402), __webpack_require__.e(6472), __webpack_require__.e(9437), __webpack_require__.e(4669), __webpack_require__.e(1414), __webpack_require__.e(7107), __webpack_require__.e(5439), __webpack_require__.e(7639), __webpack_require__.e(5403), __webpack_require__.e(8915), __webpack_require__.e(8522), __webpack_require__.e(1494), __webpack_require__.e(252), __webpack_require__.e(1780), __webpack_require__.e(9330), __webpack_require__.e(5300), __webpack_require__.e(131), __webpack_require__.e(3245), __webpack_require__.e(6481), __webpack_require__.e(2133), __webpack_require__.e(193), __webpack_require__.e(201), __webpack_require__.e(2080), __webpack_require__.e(7343), __webpack_require__.e(1243), __webpack_require__.e(785), __webpack_require__.e(3570), __webpack_require__.e(9793), __webpack_require__.e(3191), __webpack_require__.e(7948), __webpack_require__.e(4865), __webpack_require__.e(91), __webpack_require__.e(8248), __webpack_require__.e(3396), __webpack_require__.e(4460), __webpack_require__.e(9685), __webpack_require__.e(1375), __webpack_require__.e(9765), __webpack_require__.e(2135), __webpack_require__.e(3), __webpack_require__.e(7390), __webpack_require__.e(6185), __webpack_require__.e(7486), __webpack_require__.e(9450), __webpack_require__.e(3258), __webpack_require__.e(3794), __webpack_require__.e(7138), __webpack_require__.e(1981)]).then(__webpack_require__.bind(__webpack_require__, 46479));
    Promise.all(/* import() */[__webpack_require__.e(4489), __webpack_require__.e(4228), __webpack_require__.e(8270), __webpack_require__.e(180), __webpack_require__.e(4884), __webpack_require__.e(5157), __webpack_require__.e(2723), __webpack_require__.e(1818), __webpack_require__.e(1444), __webpack_require__.e(7402), __webpack_require__.e(6472), __webpack_require__.e(9437), __webpack_require__.e(4669), __webpack_require__.e(1414), __webpack_require__.e(7107), __webpack_require__.e(5439), __webpack_require__.e(7639), __webpack_require__.e(5403), __webpack_require__.e(8915), __webpack_require__.e(8522), __webpack_require__.e(1494), __webpack_require__.e(252), __webpack_require__.e(1780), __webpack_require__.e(9330), __webpack_require__.e(5300), __webpack_require__.e(131), __webpack_require__.e(3245), __webpack_require__.e(6481), __webpack_require__.e(2133), __webpack_require__.e(193), __webpack_require__.e(201), __webpack_require__.e(2080), __webpack_require__.e(7343), __webpack_require__.e(1243), __webpack_require__.e(785), __webpack_require__.e(3570), __webpack_require__.e(9793), __webpack_require__.e(3191), __webpack_require__.e(7948), __webpack_require__.e(4865), __webpack_require__.e(91), __webpack_require__.e(8248), __webpack_require__.e(3396), __webpack_require__.e(4460), __webpack_require__.e(9685), __webpack_require__.e(1375), __webpack_require__.e(9765), __webpack_require__.e(2135), __webpack_require__.e(3), __webpack_require__.e(7390), __webpack_require__.e(6185), __webpack_require__.e(7486), __webpack_require__.e(9450), __webpack_require__.e(3258), __webpack_require__.e(3794), __webpack_require__.e(7138), __webpack_require__.e(221)]).then(__webpack_require__.bind(__webpack_require__, 64010));
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
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_4__/* .clsx */ .$)('flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm', className);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { ref: ref, className: containerClasses, "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center gap-2", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: loading ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__/* .Spinner */ .y, { size: "sm" })) : (`${rowData.length.toLocaleString()} rows`) }) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [enableFiltering && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Filter */ .dJT, { size: 16 }), onClick: () => {
                                    // Note: setFloatingFiltersHeight is deprecated in AG Grid v34
                                    // Floating filters are now controlled through column definitions
                                    console.warn('Filter toggle not yet implemented for AG Grid v34');
                                }, title: "Toggle filters", "data-cy": "toggle-filters", children: "Filters" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: showColumnPanel ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .EyeOff */ .X_F, { size: 16 }) : (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Eye */ .kU3, { size: 16 }), onClick: toggleColumnPanel, title: "Toggle column visibility", "data-cy": "toggle-columns", children: "Columns" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", onClick: autoSizeColumns, title: "Auto-size columns", "data-cy": "auto-size", children: "Auto Size" }), enableExport && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Download */ .f5X, { size: 16 }), onClick: exportToCsv, title: "Export to CSV", "data-cy": "export-csv", children: "CSV" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Download */ .f5X, { size: 16 }), onClick: exportToExcel, title: "Export to Excel", "data-cy": "export-excel", children: "Excel" })] })), enablePrint && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_6__/* .Button */ .$, { size: "sm", variant: "ghost", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_5__/* .Printer */ .xjr, { size: 16 }), onClick: printGrid, title: "Print", "data-cy": "print", children: "Print" }))] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex-1 relative", children: [loading && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { "data-testid": "grid-loading", role: "status", "aria-label": "Loading data", className: "absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-10 flex items-center justify-center", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Spinner__WEBPACK_IMPORTED_MODULE_7__/* .Spinner */ .y, { size: "lg", label: "Loading data..." }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_4__/* .clsx */ .$)('ag-theme-alpine', 'dark:ag-theme-alpine-dark', 'w-full'), style: { height }, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(ag_grid_react__WEBPACK_IMPORTED_MODULE_2__/* .AgGridReact */ .W6, { ref: gridRef, rowData: rowData, columnDefs: columns, defaultColDef: defaultColDef, gridOptions: gridOptions, onGridReady: onGridReady, onRowClicked: handleRowClick, onSelectionChanged: handleSelectionChange, rowBuffer: 20, rowModelType: "clientSide", pagination: pagination, paginationPageSize: paginationPageSize, paginationAutoPageSize: false, suppressCellFocus: false, enableCellTextSelection: true, ensureDomOrder: true }) }), showColumnPanel && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto z-20", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h3", { className: "font-semibold text-sm mb-3", children: "Column Visibility" }), columns.map((col) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { className: "flex items-center gap-2 py-1", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "checkbox", className: "rounded", defaultChecked: true, onChange: (e) => {
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
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   E: () => (/* binding */ Badge)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);

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
    const badgeClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(
    // Base styles
    'inline-flex items-center gap-1.5', 'font-medium rounded-full border', 'transition-colors duration-200', 
    // Variant
    variantClasses[variant], 
    // Size
    sizeClasses[size], className);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: badgeClasses, "data-cy": dataCy, children: [dot && dotPosition === 'leading' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('rounded-full', dotClasses[variant], dotSizeClasses[size]), "aria-hidden": "true" })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { children: children }), dot && dotPosition === 'trailing' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('rounded-full', dotClasses[variant], dotSizeClasses[size]), "aria-hidden": "true" })), removable && onRemove && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { type: "button", onClick: onRemove, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('ml-0.5 -mr-1 inline-flex items-center justify-center', 'rounded-full hover:bg-black/10', 'focus:outline-none focus:ring-2 focus:ring-offset-1', {
                    'h-3 w-3': size === 'xs' || size === 'sm',
                    'h-4 w-4': size === 'md' || size === 'lg',
                }), "aria-label": "Remove", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)({
                        'h-2 w-2': size === 'xs' || size === 'sm',
                        'h-3 w-3': size === 'md' || size === 'lg',
                    }), fill: "currentColor", viewBox: "0 0 20 20", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }) }) }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Badge);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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YUFBYSw4Q0FBOEMsbURBQUk7QUFDN2dCO0FBQ0E7QUFDQSxpQkFBaUIscUNBQXFDLHNEQUFJLFVBQVUsV0FBVyxtREFBSTtBQUNuRjtBQUNBO0FBQ0EscUJBQXFCLHlEQUF5RCxzREFBSSxXQUFXLG1QQUFtUCxHQUFHLEdBQUcsS0FBSztBQUMzVjtBQUNBLGlFQUFlLEtBQUssRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZUFzc2V0SW52ZW50b3J5TG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdmlld3MvYXNzZXRzL0Fzc2V0SW52ZW50b3J5Vmlldy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9CYWRnZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG4vKipcbiAqIEN1c3RvbSBob29rIGZvciBhc3NldCBpbnZlbnRvcnkgbG9naWMgd2l0aCBMb2dpYyBFbmdpbmUgaW50ZWdyYXRpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHVzZUFzc2V0SW52ZW50b3J5TG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgW2Fzc2V0cywgc2V0QXNzZXRzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbc3RhdGlzdGljcywgc2V0U3RhdGlzdGljc10gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbaXNMb2FkaW5nLCBzZXRJc0xvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3NlYXJjaFRleHQsIHNldFNlYXJjaFRleHRdID0gdXNlU3RhdGUoJycpO1xuICAgIGNvbnN0IFt0eXBlRmlsdGVyLCBzZXRUeXBlRmlsdGVyXSA9IHVzZVN0YXRlKCdBbGwnKTtcbiAgICBjb25zdCBbc3RhdHVzRmlsdGVyLCBzZXRTdGF0dXNGaWx0ZXJdID0gdXNlU3RhdGUoJ0FsbCcpO1xuICAgIC8qKlxuICAgICAqIExvYWQgYXNzZXQgZGF0YSBmcm9tIExvZ2ljIEVuZ2luZVxuICAgICAqL1xuICAgIGNvbnN0IGxvYWRBc3NldERhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBRdWVyeSBMb2dpYyBFbmdpbmUgZm9yIGRldmljZSBzdGF0aXN0aWNzXG4gICAgICAgICAgICBjb25zdCBzdGF0c1Jlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5sb2dpY0VuZ2luZS5nZXRTdGF0aXN0aWNzKCk7XG4gICAgICAgICAgICBpZiAoc3RhdHNSZXN1bHQuc3VjY2VzcyAmJiBzdGF0c1Jlc3VsdC5kYXRhPy5zdGF0aXN0aWNzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHMgPSBzdGF0c1Jlc3VsdC5kYXRhLnN0YXRpc3RpY3M7XG4gICAgICAgICAgICAgICAgLy8gQnVpbGQgYXNzZXQgaW52ZW50b3J5IGZyb20gTG9naWMgRW5naW5lIGRhdGFcbiAgICAgICAgICAgICAgICBjb25zdCBhc3NldExpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICAvLyBFeHRyYWN0IGRldmljZSBkYXRhIGZyb20gc3RhdGlzdGljc1xuICAgICAgICAgICAgICAgIGNvbnN0IGRldmljZUNvdW50ID0gc3RhdHMuRGV2aWNlQ291bnQgfHwgMDtcbiAgICAgICAgICAgICAgICAvLyBGb3Igbm93LCBjcmVhdGUgbW9jayBhc3NldHMgYmFzZWQgb24gZGV2aWNlIGNvdW50XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogV2hlbiBMb2dpYyBFbmdpbmUgcHJvdmlkZXMgZGV0YWlsZWQgZGV2aWNlIGRhdGEsIGV4dHJhY3QgcmVhbCBhc3NldHNcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IE1hdGgubWluKGRldmljZUNvdW50LCAxMDApOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXRMaXN0LnB1c2goZ2VuZXJhdGVNb2NrQXNzZXQoaSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgc3RhdGlzdGljc1xuICAgICAgICAgICAgICAgIGNvbnN0IGFzc2V0U3RhdHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsQXNzZXRzOiBhc3NldExpc3QubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICB3b3Jrc3RhdGlvbnM6IGFzc2V0TGlzdC5maWx0ZXIoYSA9PiBhLnR5cGUgPT09ICdXb3Jrc3RhdGlvbicpLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgc2VydmVyczogYXNzZXRMaXN0LmZpbHRlcihhID0+IGEudHlwZSA9PT0gJ1NlcnZlcicpLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgbW9iaWxlRGV2aWNlczogYXNzZXRMaXN0LmZpbHRlcihhID0+IGEudHlwZSA9PT0gJ01vYmlsZScpLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgbmV0d29ya0RldmljZXM6IGFzc2V0TGlzdC5maWx0ZXIoYSA9PiBhLnR5cGUgPT09ICdOZXR3b3JrJykubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBwcmludGVyczogYXNzZXRMaXN0LmZpbHRlcihhID0+IGEudHlwZSA9PT0gJ1ByaW50ZXInKS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZUFzc2V0czogYXNzZXRMaXN0LmZpbHRlcihhID0+IGEuc3RhdHVzID09PSAnQWN0aXZlJykubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBpbmFjdGl2ZUFzc2V0czogYXNzZXRMaXN0LmZpbHRlcihhID0+IGEuc3RhdHVzID09PSAnSW5hY3RpdmUnKS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGF2Z0FnZTogYXNzZXRMaXN0LnJlZHVjZSgoc3VtLCBhKSA9PiBzdW0gKyAoYS5hZ2UgfHwgMCksIDApIC8gYXNzZXRMaXN0Lmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgdG90YWxWYWx1ZTogYXNzZXRMaXN0Lmxlbmd0aCAqIDE1MDAsIC8vIE1vY2sgdmFsdWVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNldEFzc2V0cyhhc3NldExpc3QpO1xuICAgICAgICAgICAgICAgIHNldFN0YXRpc3RpY3MoYXNzZXRTdGF0cyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5pbmZvKCdbQXNzZXRJbnZlbnRvcnldIExvYWRlZCBhc3NldCBkYXRhIGZyb20gTG9naWMgRW5naW5lOicsIHtcbiAgICAgICAgICAgICAgICAgICAgdG90YWxBc3NldHM6IGFzc2V0TGlzdC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGRldmljZUNvdW50LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbQXNzZXRJbnZlbnRvcnldIExvZ2ljIEVuZ2luZSBub3QgbG9hZGVkLCB1c2luZyBtb2NrIGRhdGEnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtb2NrRGF0YSA9IGdlbmVyYXRlTW9ja0Fzc2V0RGF0YSgpO1xuICAgICAgICAgICAgICAgIHNldEFzc2V0cyhtb2NrRGF0YS5hc3NldHMpO1xuICAgICAgICAgICAgICAgIHNldFN0YXRpc3RpY3MobW9ja0RhdGEuc3RhdGlzdGljcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBgRmFpbGVkIHRvIGxvYWQgYXNzZXQgZGF0YTogJHtlcnIubWVzc2FnZX1gO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0Fzc2V0SW52ZW50b3J5XSBFcnJvcjonLCBlcnIpO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyb3JNc2cpO1xuICAgICAgICAgICAgLy8gRmFsbGJhY2sgdG8gbW9jayBkYXRhIG9uIGVycm9yXG4gICAgICAgICAgICBjb25zdCBtb2NrRGF0YSA9IGdlbmVyYXRlTW9ja0Fzc2V0RGF0YSgpO1xuICAgICAgICAgICAgc2V0QXNzZXRzKG1vY2tEYXRhLmFzc2V0cyk7XG4gICAgICAgICAgICBzZXRTdGF0aXN0aWNzKG1vY2tEYXRhLnN0YXRpc3RpY3MpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBMb2FkIGRhdGEgb24gbW91bnRcbiAgICAgKi9cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkQXNzZXREYXRhKCk7XG4gICAgfSwgW2xvYWRBc3NldERhdGFdKTtcbiAgICAvKipcbiAgICAgKiBGaWx0ZXIgYXNzZXRzIGJhc2VkIG9uIHNlYXJjaCBhbmQgZmlsdGVyc1xuICAgICAqL1xuICAgIGNvbnN0IGZpbHRlcmVkQXNzZXRzID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICByZXR1cm4gYXNzZXRzLmZpbHRlcihhc3NldCA9PiB7XG4gICAgICAgICAgICAvLyBTZWFyY2ggZmlsdGVyXG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzU2VhcmNoID0gIXNlYXJjaFRleHQgfHxcbiAgICAgICAgICAgICAgICAoYXNzZXQubmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpIHx8XG4gICAgICAgICAgICAgICAgKGFzc2V0LnR5cGUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpKSB8fFxuICAgICAgICAgICAgICAgIGFzc2V0Lm1hbnVmYWN0dXJlcj8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpIHx8XG4gICAgICAgICAgICAgICAgYXNzZXQubW9kZWw/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpKSB8fFxuICAgICAgICAgICAgICAgIGFzc2V0LmlwQWRkcmVzcz8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgLy8gVHlwZSBmaWx0ZXJcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNUeXBlID0gdHlwZUZpbHRlciA9PT0gJ0FsbCcgfHwgYXNzZXQudHlwZSA9PT0gdHlwZUZpbHRlcjtcbiAgICAgICAgICAgIC8vIFN0YXR1cyBmaWx0ZXJcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZXNTdGF0dXMgPSBzdGF0dXNGaWx0ZXIgPT09ICdBbGwnIHx8IGFzc2V0LnN0YXR1cyA9PT0gc3RhdHVzRmlsdGVyO1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXNTZWFyY2ggJiYgbWF0Y2hlc1R5cGUgJiYgbWF0Y2hlc1N0YXR1cztcbiAgICAgICAgfSk7XG4gICAgfSwgW2Fzc2V0cywgc2VhcmNoVGV4dCwgdHlwZUZpbHRlciwgc3RhdHVzRmlsdGVyXSk7XG4gICAgLyoqXG4gICAgICogRXhwb3J0IGFzc2V0cyB0byBDU1ZcbiAgICAgKi9cbiAgICBjb25zdCBleHBvcnRBc3NldHMgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IGZpbHRlcmVkQXNzZXRzKCk7XG4gICAgICAgICAgICBjb25zdCBjc3YgPSBjb252ZXJ0QXNzZXRzVG9DU1YoZmlsdGVyZWQpO1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmludm9rZSgnZXhwb3J0LWRhdGEnLCB7XG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGBhc3NldC1pbnZlbnRvcnktJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXX0uY3N2YCxcbiAgICAgICAgICAgICAgICBkYXRhOiBjc3YsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygnW0Fzc2V0SW52ZW50b3J5XSBFeHBvcnRlZCBhc3NldCBkYXRhIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tBc3NldEludmVudG9yeV0gRXhwb3J0IGZhaWxlZDonLCBlcnIpO1xuICAgICAgICAgICAgc2V0RXJyb3IoYEV4cG9ydCBmYWlsZWQ6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICB9LCBbZmlsdGVyZWRBc3NldHNdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBhc3NldHM6IGZpbHRlcmVkQXNzZXRzKCksXG4gICAgICAgIHN0YXRpc3RpY3MsXG4gICAgICAgIGlzTG9hZGluZyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIHNlYXJjaFRleHQsXG4gICAgICAgIHNldFNlYXJjaFRleHQsXG4gICAgICAgIHR5cGVGaWx0ZXIsXG4gICAgICAgIHNldFR5cGVGaWx0ZXIsXG4gICAgICAgIHN0YXR1c0ZpbHRlcixcbiAgICAgICAgc2V0U3RhdHVzRmlsdGVyLFxuICAgICAgICByZWZyZXNoRGF0YTogbG9hZEFzc2V0RGF0YSxcbiAgICAgICAgZXhwb3J0QXNzZXRzLFxuICAgIH07XG59O1xuLyoqXG4gKiBHZW5lcmF0ZSBtb2NrIGFzc2V0IGZvciBkZXZlbG9wbWVudC9mYWxsYmFja1xuICovXG5mdW5jdGlvbiBnZW5lcmF0ZU1vY2tBc3NldChpbmRleCkge1xuICAgIGNvbnN0IHR5cGVzID0gWydXb3Jrc3RhdGlvbicsICdTZXJ2ZXInLCAnTW9iaWxlJywgJ05ldHdvcmsnLCAnUHJpbnRlciddO1xuICAgIGNvbnN0IHN0YXR1c2VzID0gWydBY3RpdmUnLCAnSW5hY3RpdmUnLCAnSW4gUmVwYWlyJ107XG4gICAgY29uc3QgbWFudWZhY3R1cmVycyA9IFsnRGVsbCcsICdIUCcsICdMZW5vdm8nLCAnQXBwbGUnLCAnQ2lzY28nLCAnTWljcm9zb2Z0J107XG4gICAgY29uc3QgbG9jYXRpb25zID0gWydOZXcgWW9yaycsICdMb25kb24nLCAnVG9reW8nLCAnU3lkbmV5JywgJ1BhcmlzJ107XG4gICAgY29uc3QgZGVwYXJ0bWVudHMgPSBbJ0lUJywgJ1NhbGVzJywgJ0VuZ2luZWVyaW5nJywgJ0hSJywgJ0ZpbmFuY2UnXTtcbiAgICBjb25zdCB0eXBlID0gdHlwZXNbaW5kZXggJSB0eXBlcy5sZW5ndGhdO1xuICAgIGNvbnN0IG1hbnVmYWN0dXJlciA9IG1hbnVmYWN0dXJlcnNbaW5kZXggJSBtYW51ZmFjdHVyZXJzLmxlbmd0aF07XG4gICAgY29uc3QgYWdlID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNik7XG4gICAgY29uc3QgcHVyY2hhc2VEYXRlID0gbmV3IERhdGUoKTtcbiAgICBwdXJjaGFzZURhdGUuc2V0RnVsbFllYXIocHVyY2hhc2VEYXRlLmdldEZ1bGxZZWFyKCkgLSBhZ2UpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBgYXNzZXQtJHtpbmRleCArIDF9YCxcbiAgICAgICAgbmFtZTogYCR7dHlwZX0tJHsoaW5kZXggKyAxKS50b1N0cmluZygpLnBhZFN0YXJ0KDMsICcwJyl9YCxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgY2F0ZWdvcnk6IHR5cGUgPT09ICdTZXJ2ZXInID8gJ0luZnJhc3RydWN0dXJlJyA6ICdFbmRwb2ludCcsXG4gICAgICAgIG1hbnVmYWN0dXJlcixcbiAgICAgICAgbW9kZWw6IGBNb2RlbC0ke21hbnVmYWN0dXJlcn0tJHtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApfWAsXG4gICAgICAgIHNlcmlhbE51bWJlcjogYFNOJHsoaW5kZXggKyAxKS50b1N0cmluZygpLnBhZFN0YXJ0KDgsICcwJyl9YCxcbiAgICAgICAgaXBBZGRyZXNzOiBgMTkyLjE2OC4ke01hdGguZmxvb3IoaW5kZXggLyAyNTQpfS4keyhpbmRleCAlIDI1NCkgKyAxfWAsXG4gICAgICAgIG1hY0FkZHJlc3M6IGAwMDokeygoaW5kZXggPj4gOCkgJiAweGZmKS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKX06JHsoaW5kZXggJiAweGZmKS50b1N0cmluZygxNikucGFkU3RhcnQoMiwgJzAnKX06MDA6MDA6MDBgLFxuICAgICAgICBvcGVyYXRpbmdTeXN0ZW06IHR5cGUgPT09ICdTZXJ2ZXInID8gJ1dpbmRvd3MgU2VydmVyIDIwMTknIDogJ1dpbmRvd3MgMTEnLFxuICAgICAgICBvc1ZlcnNpb246IHR5cGUgPT09ICdTZXJ2ZXInID8gJzEwLjAuMTc3NjMnIDogJzEwLjAuMjIwMDAnLFxuICAgICAgICBjcHU6IGBJbnRlbCBDb3JlIGkkezUgKyAoaW5kZXggJSA0KX0gJHs5MDAwICsgaW5kZXh9YCxcbiAgICAgICAgcmFtR0I6IHR5cGUgPT09ICdTZXJ2ZXInID8gMzIgKyAoaW5kZXggJSAzKSAqIDMyIDogOCArIChpbmRleCAlIDMpICogOCxcbiAgICAgICAgZGlza0dCOiB0eXBlID09PSAnU2VydmVyJyA/IDUwMCArIChpbmRleCAlIDQpICogNTAwIDogMjU2ICsgKGluZGV4ICUgMykgKiAyNTYsXG4gICAgICAgIGxvY2F0aW9uOiBsb2NhdGlvbnNbaW5kZXggJSBsb2NhdGlvbnMubGVuZ3RoXSxcbiAgICAgICAgZGVwYXJ0bWVudDogZGVwYXJ0bWVudHNbaW5kZXggJSBkZXBhcnRtZW50cy5sZW5ndGhdLFxuICAgICAgICBvd25lcjogYHVzZXIkeyhpbmRleCAlIDUwKSArIDF9QGNvbXBhbnkuY29tYCxcbiAgICAgICAgYXNzaWduZWRVc2VyOiB0eXBlICE9PSAnU2VydmVyJyA/IGB1c2VyJHsoaW5kZXggJSA1MCkgKyAxfUBjb21wYW55LmNvbWAgOiB1bmRlZmluZWQsXG4gICAgICAgIHB1cmNoYXNlRGF0ZTogcHVyY2hhc2VEYXRlLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSxcbiAgICAgICAgd2FycmFudHlFeHBpcnk6IG5ldyBEYXRlKHB1cmNoYXNlRGF0ZS5nZXRUaW1lKCkgKyAzICogMzY1ICogMjQgKiA2MCAqIDYwICogMTAwMCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdLFxuICAgICAgICBzdGF0dXM6IHN0YXR1c2VzW2luZGV4ICUgc3RhdHVzZXMubGVuZ3RoXSxcbiAgICAgICAgbGFzdFNlZW46IG5ldyBEYXRlKERhdGUubm93KCkgLSBNYXRoLnJhbmRvbSgpICogNyAqIDI0ICogNjAgKiA2MCAqIDEwMDApLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIGRvbWFpbkpvaW5lZDogTWF0aC5yYW5kb20oKSA+IDAuMSxcbiAgICAgICAgZG9tYWluOiAnY29tcGFueS5sb2NhbCcsXG4gICAgICAgIGFnZSxcbiAgICAgICAgbGlmZWN5Y2xlU3RhdHVzOiBhZ2UgPCAxID8gJ05ldycgOiBhZ2UgPCAzID8gJ0N1cnJlbnQnIDogYWdlIDwgNSA/ICdBZ2luZycgOiAnRW5kIG9mIExpZmUnLFxuICAgIH07XG59XG4vKipcbiAqIEdlbmVyYXRlIGNvbXBsZXRlIG1vY2sgYXNzZXQgZGF0YVxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZU1vY2tBc3NldERhdGEoKSB7XG4gICAgY29uc3QgYXNzZXRzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNTA7IGkrKykge1xuICAgICAgICBhc3NldHMucHVzaChnZW5lcmF0ZU1vY2tBc3NldChpKSk7XG4gICAgfVxuICAgIGNvbnN0IHN0YXRpc3RpY3MgPSB7XG4gICAgICAgIHRvdGFsQXNzZXRzOiBhc3NldHMubGVuZ3RoLFxuICAgICAgICB3b3Jrc3RhdGlvbnM6IGFzc2V0cy5maWx0ZXIoYSA9PiBhLnR5cGUgPT09ICdXb3Jrc3RhdGlvbicpLmxlbmd0aCxcbiAgICAgICAgc2VydmVyczogYXNzZXRzLmZpbHRlcihhID0+IGEudHlwZSA9PT0gJ1NlcnZlcicpLmxlbmd0aCxcbiAgICAgICAgbW9iaWxlRGV2aWNlczogYXNzZXRzLmZpbHRlcihhID0+IGEudHlwZSA9PT0gJ01vYmlsZScpLmxlbmd0aCxcbiAgICAgICAgbmV0d29ya0RldmljZXM6IGFzc2V0cy5maWx0ZXIoYSA9PiBhLnR5cGUgPT09ICdOZXR3b3JrJykubGVuZ3RoLFxuICAgICAgICBwcmludGVyczogYXNzZXRzLmZpbHRlcihhID0+IGEudHlwZSA9PT0gJ1ByaW50ZXInKS5sZW5ndGgsXG4gICAgICAgIGFjdGl2ZUFzc2V0czogYXNzZXRzLmZpbHRlcihhID0+IGEuc3RhdHVzID09PSAnQWN0aXZlJykubGVuZ3RoLFxuICAgICAgICBpbmFjdGl2ZUFzc2V0czogYXNzZXRzLmZpbHRlcihhID0+IGEuc3RhdHVzID09PSAnSW5hY3RpdmUnKS5sZW5ndGgsXG4gICAgICAgIGF2Z0FnZTogYXNzZXRzLnJlZHVjZSgoc3VtLCBhKSA9PiBzdW0gKyAoYS5hZ2UgfHwgMCksIDApIC8gYXNzZXRzLmxlbmd0aCxcbiAgICAgICAgdG90YWxWYWx1ZTogYXNzZXRzLmxlbmd0aCAqIDE1MDAsXG4gICAgfTtcbiAgICByZXR1cm4geyBhc3NldHMsIHN0YXRpc3RpY3MgfTtcbn1cbi8qKlxuICogQ29udmVydCBhc3NldHMgdG8gQ1NWIGZvcm1hdFxuICovXG5mdW5jdGlvbiBjb252ZXJ0QXNzZXRzVG9DU1YoYXNzZXRzKSB7XG4gICAgY29uc3QgaGVhZGVycyA9IFtcbiAgICAgICAgJ0lEJywgJ05hbWUnLCAnVHlwZScsICdDYXRlZ29yeScsICdNYW51ZmFjdHVyZXInLCAnTW9kZWwnLCAnU2VyaWFsIE51bWJlcicsXG4gICAgICAgICdJUCBBZGRyZXNzJywgJ01BQyBBZGRyZXNzJywgJ09wZXJhdGluZyBTeXN0ZW0nLCAnT1MgVmVyc2lvbicsXG4gICAgICAgICdDUFUnLCAnUkFNIChHQiknLCAnRGlzayAoR0IpJywgJ0xvY2F0aW9uJywgJ0RlcGFydG1lbnQnLCAnT3duZXInLFxuICAgICAgICAnQXNzaWduZWQgVXNlcicsICdQdXJjaGFzZSBEYXRlJywgJ1dhcnJhbnR5IEV4cGlyeScsICdTdGF0dXMnLCAnTGFzdCBTZWVuJyxcbiAgICAgICAgJ0RvbWFpbiBKb2luZWQnLCAnRG9tYWluJywgJ0FnZSAoWWVhcnMpJywgJ0xpZmVjeWNsZSBTdGF0dXMnXG4gICAgXTtcbiAgICBjb25zdCByb3dzID0gYXNzZXRzLm1hcChhc3NldCA9PiBbXG4gICAgICAgIGFzc2V0LmlkLFxuICAgICAgICBhc3NldC5uYW1lLFxuICAgICAgICBhc3NldC50eXBlLFxuICAgICAgICBhc3NldC5jYXRlZ29yeSxcbiAgICAgICAgYXNzZXQubWFudWZhY3R1cmVyIHx8ICcnLFxuICAgICAgICBhc3NldC5tb2RlbCB8fCAnJyxcbiAgICAgICAgYXNzZXQuc2VyaWFsTnVtYmVyIHx8ICcnLFxuICAgICAgICBhc3NldC5pcEFkZHJlc3MgfHwgJycsXG4gICAgICAgIGFzc2V0Lm1hY0FkZHJlc3MgfHwgJycsXG4gICAgICAgIGFzc2V0Lm9wZXJhdGluZ1N5c3RlbSB8fCAnJyxcbiAgICAgICAgYXNzZXQub3NWZXJzaW9uIHx8ICcnLFxuICAgICAgICBhc3NldC5jcHUgfHwgJycsXG4gICAgICAgIGFzc2V0LnJhbUdCPy50b1N0cmluZygpIHx8ICcnLFxuICAgICAgICBhc3NldC5kaXNrR0I/LnRvU3RyaW5nKCkgfHwgJycsXG4gICAgICAgIGFzc2V0LmxvY2F0aW9uIHx8ICcnLFxuICAgICAgICBhc3NldC5kZXBhcnRtZW50IHx8ICcnLFxuICAgICAgICBhc3NldC5vd25lciB8fCAnJyxcbiAgICAgICAgYXNzZXQuYXNzaWduZWRVc2VyIHx8ICcnLFxuICAgICAgICBhc3NldC5wdXJjaGFzZURhdGUgfHwgJycsXG4gICAgICAgIGFzc2V0LndhcnJhbnR5RXhwaXJ5IHx8ICcnLFxuICAgICAgICBhc3NldC5zdGF0dXMsXG4gICAgICAgIGFzc2V0Lmxhc3RTZWVuIHx8ICcnLFxuICAgICAgICBhc3NldC5kb21haW5Kb2luZWQgPyAnWWVzJyA6ICdObycsXG4gICAgICAgIGFzc2V0LmRvbWFpbiB8fCAnJyxcbiAgICAgICAgYXNzZXQuYWdlPy50b1N0cmluZygpIHx8ICcnLFxuICAgICAgICBhc3NldC5saWZlY3ljbGVTdGF0dXMgfHwgJycsXG4gICAgXSk7XG4gICAgcmV0dXJuIFtoZWFkZXJzLmpvaW4oJywnKSwgLi4ucm93cy5tYXAocm93ID0+IHJvdy5qb2luKCcsJykpXS5qb2luKCdcXG4nKTtcbn1cbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIEFzc2V0IEludmVudG9yeSBWaWV3XG4gKiBDb21wcmVoZW5zaXZlIGFzc2V0IHRyYWNraW5nIGFuZCBsaWZlY3ljbGUgbWFuYWdlbWVudFxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgUGFja2FnZSwgU2VydmVyLCBNb25pdG9yLCBTbWFydHBob25lLCBIYXJkRHJpdmUsIERhdGFiYXNlLCBTZWFyY2gsIERvd25sb2FkIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IHVzZUFzc2V0SW52ZW50b3J5TG9naWMgfSBmcm9tICcuLi8uLi9ob29rcy91c2VBc3NldEludmVudG9yeUxvZ2ljJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IElucHV0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9JbnB1dCc7XG5pbXBvcnQgeyBCYWRnZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQmFkZ2UnO1xuaW1wb3J0IHsgVmlydHVhbGl6ZWREYXRhR3JpZCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuZXhwb3J0IGNvbnN0IEFzc2V0SW52ZW50b3J5VmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IGFzc2V0cywgc3RhdGlzdGljcywgaXNMb2FkaW5nLCBlcnJvciwgc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dCwgdHlwZUZpbHRlciwgc2V0VHlwZUZpbHRlciwgc3RhdHVzRmlsdGVyLCBzZXRTdGF0dXNGaWx0ZXIsIHJlZnJlc2hEYXRhLCBleHBvcnRBc3NldHMsIH0gPSB1c2VBc3NldEludmVudG9yeUxvZ2ljKCk7XG4gICAgY29uc3QgYXNzZXRUeXBlcyA9IFtcbiAgICAgICAgeyBpZDogJ2FsbCcsIGxhYmVsOiAnQWxsIEFzc2V0cycsIGljb246IFBhY2thZ2UsIGNvdW50OiBzdGF0aXN0aWNzPy50b3RhbEFzc2V0cyB8fCAwIH0sXG4gICAgICAgIHsgaWQ6ICdzZXJ2ZXJzJywgbGFiZWw6ICdTZXJ2ZXJzJywgaWNvbjogU2VydmVyLCBjb3VudDogc3RhdGlzdGljcz8uc2VydmVycyB8fCAwIH0sXG4gICAgICAgIHsgaWQ6ICd3b3Jrc3RhdGlvbnMnLCBsYWJlbDogJ1dvcmtzdGF0aW9ucycsIGljb246IE1vbml0b3IsIGNvdW50OiBzdGF0aXN0aWNzPy53b3Jrc3RhdGlvbnMgfHwgMCB9LFxuICAgICAgICB7IGlkOiAnbW9iaWxlJywgbGFiZWw6ICdNb2JpbGUgRGV2aWNlcycsIGljb246IFNtYXJ0cGhvbmUsIGNvdW50OiBzdGF0aXN0aWNzPy5tb2JpbGVEZXZpY2VzIHx8IDAgfSxcbiAgICAgICAgeyBpZDogJ25ldHdvcmsnLCBsYWJlbDogJ05ldHdvcmsgRGV2aWNlcycsIGljb246IEhhcmREcml2ZSwgY291bnQ6IHN0YXRpc3RpY3M/Lm5ldHdvcmtEZXZpY2VzIHx8IDAgfSxcbiAgICAgICAgeyBpZDogJ3ByaW50ZXJzJywgbGFiZWw6ICdQcmludGVycycsIGljb246IERhdGFiYXNlLCBjb3VudDogc3RhdGlzdGljcz8ucHJpbnRlcnMgfHwgMCB9LFxuICAgIF07XG4gICAgY29uc3QgY29sdW1uRGVmcyA9IFtcbiAgICAgICAgeyBmaWVsZDogJ25hbWUnLCBoZWFkZXJOYW1lOiAnTmFtZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgeyBmaWVsZDogJ3R5cGUnLCBoZWFkZXJOYW1lOiAnVHlwZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgeyBmaWVsZDogJ21hbnVmYWN0dXJlcicsIGhlYWRlck5hbWU6ICdNYW51ZmFjdHVyZXInLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlIH0sXG4gICAgICAgIHsgZmllbGQ6ICdtb2RlbCcsIGhlYWRlck5hbWU6ICdNb2RlbCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICAgICAgeyBmaWVsZDogJ3NlcmlhbE51bWJlcicsIGhlYWRlck5hbWU6ICdTZXJpYWwgTnVtYmVyJywgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgeyBmaWVsZDogJ2xvY2F0aW9uJywgaGVhZGVyTmFtZTogJ0xvY2F0aW9uJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSB9LFxuICAgICAgICB7IGZpZWxkOiAnc3RhdHVzJywgaGVhZGVyTmFtZTogJ1N0YXR1cycsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUgfSxcbiAgICBdO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBmbGV4LWNvbCBoLWZ1bGwgcC02IGJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTkwMFwiLCBcImRhdGEtY3lcIjogXCJhc3NldC1pbnZlbnRvcnktdmlld1wiLCBcImRhdGEtdGVzdGlkXCI6IFwiYXNzZXQtaW52ZW50b3J5LXZpZXdcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItNlwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJwLTMgYmctaW5kaWdvLTEwMCBkYXJrOmJnLWluZGlnby05MDAgcm91bmRlZC1sZ1wiLCBjaGlsZHJlbjogX2pzeChQYWNrYWdlLCB7IGNsYXNzTmFtZTogXCJ3LTggaC04IHRleHQtaW5kaWdvLTYwMCBkYXJrOnRleHQtaW5kaWdvLTQwMFwiIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtM3hsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJBc3NldCBJbnZlbnRvcnlcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiQ29tcGxldGUgYXNzZXQgdHJhY2tpbmcgYW5kIGxpZmVjeWNsZSBtYW5hZ2VtZW50XCIgfSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBvbkNsaWNrOiByZWZyZXNoRGF0YSwgZGlzYWJsZWQ6IGlzTG9hZGluZywgXCJkYXRhLWN5XCI6IFwicmVmcmVzaC1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcInJlZnJlc2gtYnRuXCIsIGNoaWxkcmVuOiBcIlJlZnJlc2hcIiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIG9uQ2xpY2s6IGV4cG9ydEFzc2V0cywgaWNvbjogX2pzeChEb3dubG9hZCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBcImRhdGEtY3lcIjogXCJleHBvcnQtYnRuXCIsIGNoaWxkcmVuOiBcIkV4cG9ydCBJbnZlbnRvcnlcIiB9KV0gfSldIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTIgbWQ6Z3JpZC1jb2xzLTMgbGc6Z3JpZC1jb2xzLTYgZ2FwLTQgbWItNlwiLCBjaGlsZHJlbjogYXNzZXRUeXBlcy5tYXAoKHR5cGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgSWNvbiA9IHR5cGUuaWNvbjtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9IHR5cGVGaWx0ZXIgPT09IHR5cGUuaWQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeChcImJ1dHRvblwiLCB7IG9uQ2xpY2s6ICgpID0+IHNldFR5cGVGaWx0ZXIodHlwZS5pZCksIGNsYXNzTmFtZTogYFxyXG4gICAgICAgICAgICAgICAgcC00IHJvdW5kZWQtbGcgYm9yZGVyLTIgdHJhbnNpdGlvbi1hbGxcclxuICAgICAgICAgICAgICAgICR7aXNTZWxlY3RlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gJ2JvcmRlci1pbmRpZ28tNTAwIGJnLWluZGlnby01MCBkYXJrOmJnLWluZGlnby05MDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgaG92ZXI6Ym9yZGVyLWluZGlnby0zMDAnfVxyXG4gICAgICAgICAgICAgIGAsIFwiZGF0YS1jeVwiOiBgYXNzZXQtdHlwZS0ke3R5cGUuaWR9YCwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChJY29uLCB7IGNsYXNzTmFtZTogYHctOCBoLTggJHtpc1NlbGVjdGVkID8gJ3RleHQtaW5kaWdvLTYwMCcgOiAndGV4dC1ncmF5LTQwMCd9YCB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogdHlwZS5sYWJlbCB9KSwgX2pzeChCYWRnZSwgeyB2YXJpYW50OiBpc1NlbGVjdGVkID8gJ3ByaW1hcnknIDogJ2RlZmF1bHQnLCBjaGlsZHJlbjogdHlwZS5jb3VudCB9KV0gfSkgfSwgdHlwZS5pZCkpO1xuICAgICAgICAgICAgICAgIH0pIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm1iLTZcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbX2pzeChTZWFyY2gsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGxlZnQtMyB0b3AtMS8yIC10cmFuc2xhdGUteS0xLzIgdy01IGgtNSB0ZXh0LWdyYXktNDAwXCIgfSksIF9qc3goSW5wdXQsIHsgdHlwZTogXCJ0ZXh0XCIsIHBsYWNlaG9sZGVyOiBcIlNlYXJjaCBhc3NldHMgYnkgbmFtZSwgc2VyaWFsIG51bWJlciwgb3IgbG9jYXRpb24uLi5cIiwgdmFsdWU6IHNlYXJjaFRleHQsIG9uQ2hhbmdlOiAoZSkgPT4gc2V0U2VhcmNoVGV4dChlLnRhcmdldC52YWx1ZSksIGNsYXNzTmFtZTogXCJwbC0xMFwiLCBcImRhdGEtY3lcIjogXCJhc3NldC1zZWFyY2hcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImFzc2V0LXNlYXJjaFwiIH0pXSB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IF9qc3goVmlydHVhbGl6ZWREYXRhR3JpZCwgeyBkYXRhOiBhc3NldHMsIGNvbHVtbnM6IGNvbHVtbkRlZnMsIGxvYWRpbmc6IGlzTG9hZGluZyB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IEFzc2V0SW52ZW50b3J5VmlldztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIElucHV0IENvbXBvbmVudFxuICpcbiAqIEFjY2Vzc2libGUgaW5wdXQgZmllbGQgd2l0aCBsYWJlbCwgZXJyb3Igc3RhdGVzLCBhbmQgaGVscCB0ZXh0XG4gKi9cbmltcG9ydCBSZWFjdCwgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQWxlcnRDaXJjbGUsIEluZm8gfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBJbnB1dCBjb21wb25lbnQgd2l0aCBmdWxsIGFjY2Vzc2liaWxpdHkgc3VwcG9ydFxuICovXG5leHBvcnQgY29uc3QgSW5wdXQgPSBmb3J3YXJkUmVmKCh7IGxhYmVsLCBoZWxwZXJUZXh0LCBlcnJvciwgcmVxdWlyZWQgPSBmYWxzZSwgc2hvd09wdGlvbmFsID0gdHJ1ZSwgaW5wdXRTaXplID0gJ21kJywgZnVsbFdpZHRoID0gZmFsc2UsIHN0YXJ0SWNvbiwgZW5kSWNvbiwgY2xhc3NOYW1lLCBpZCwgJ2RhdGEtY3knOiBkYXRhQ3ksIGRpc2FibGVkID0gZmFsc2UsIC4uLnByb3BzIH0sIHJlZikgPT4ge1xuICAgIC8vIEdlbmVyYXRlIHVuaXF1ZSBJRCBpZiBub3QgcHJvdmlkZWRcbiAgICBjb25zdCBpbnB1dElkID0gaWQgfHwgYGlucHV0LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lucHV0SWR9LWVycm9yYDtcbiAgICBjb25zdCBoZWxwZXJJZCA9IGAke2lucHV0SWR9LWhlbHBlcmA7XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgc206ICdweC0zIHB5LTEuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC00IHB5LTIgdGV4dC1iYXNlJyxcbiAgICAgICAgbGc6ICdweC01IHB5LTMgdGV4dC1sZycsXG4gICAgfTtcbiAgICAvLyBJbnB1dCBjbGFzc2VzXG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeCgnYmxvY2sgcm91bmRlZC1tZCBib3JkZXIgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkaXNhYmxlZDpiZy1ncmF5LTUwIGRpc2FibGVkOnRleHQtZ3JheS01MDAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkJywgJ2Rhcms6YmctZ3JheS04MDAgZGFyazp0ZXh0LWdyYXktMTAwJywgc2l6ZXNbaW5wdXRTaXplXSwgZnVsbFdpZHRoICYmICd3LWZ1bGwnLCBzdGFydEljb24gJiYgJ3BsLTEwJywgZW5kSWNvbiAmJiAncHItMTAnLCBlcnJvclxuICAgICAgICA/IGNsc3goJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTkwMCBwbGFjZWhvbGRlci1yZWQtNDAwJywgJ2ZvY3VzOmJvcmRlci1yZWQtNTAwIGZvY3VzOnJpbmctcmVkLTUwMCcsICdkYXJrOmJvcmRlci1yZWQtNDAwIGRhcms6dGV4dC1yZWQtNDAwJylcbiAgICAgICAgOiBjbHN4KCdib3JkZXItZ3JheS0zMDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6Ym9yZGVyLWJsdWUtNTAwIGZvY3VzOnJpbmctYmx1ZS01MDAnLCAnZGFyazpib3JkZXItZ3JheS02MDAgZGFyazpwbGFjZWhvbGRlci1ncmF5LTUwMCcpLCBjbGFzc05hbWUpO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goZnVsbFdpZHRoICYmICd3LWZ1bGwnKTtcbiAgICAvLyBMYWJlbCBjbGFzc2VzXG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgnYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCBtYi0xJyk7XG4gICAgLy8gSGVscGVyL0Vycm9yIHRleHQgY2xhc3Nlc1xuICAgIGNvbnN0IGhlbHBlckNsYXNzZXMgPSBjbHN4KCdtdC0xIHRleHQtc20nLCBlcnJvciA/ICd0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAnIDogJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwJyk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlucHV0SWQsIGNsYXNzTmFtZTogbGFiZWxDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsLCByZXF1aXJlZCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yZWQtNTAwIG1sLTFcIiwgXCJhcmlhLWxhYmVsXCI6IFwicmVxdWlyZWRcIiwgY2hpbGRyZW46IFwiKlwiIH0pKSwgIXJlcXVpcmVkICYmIHNob3dPcHRpb25hbCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbWwtMSB0ZXh0LXhzXCIsIGNoaWxkcmVuOiBcIihvcHRpb25hbClcIiB9KSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVsYXRpdmVcIiwgY2hpbGRyZW46IFtzdGFydEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIGxlZnQtMCBwbC0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBzdGFydEljb24gfSkgfSkpLCBfanN4KFwiaW5wdXRcIiwgeyByZWY6IHJlZiwgaWQ6IGlucHV0SWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtaW52YWxpZFwiOiAhIWVycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeChlcnJvciAmJiBlcnJvcklkLCBoZWxwZXJUZXh0ICYmIGhlbHBlcklkKSB8fCB1bmRlZmluZWQsIFwiYXJpYS1yZXF1aXJlZFwiOiByZXF1aXJlZCwgZGlzYWJsZWQ6IGRpc2FibGVkLCBcImRhdGEtY3lcIjogZGF0YUN5LCAuLi5wcm9wcyB9KSwgZW5kSWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgcmlnaHQtMCBwci0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBlbmRJY29uIH0pIH0pKV0gfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3Nlcywgcm9sZTogXCJhbGVydFwiLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGVycm9yXSB9KSB9KSksIGhlbHBlclRleHQgJiYgIWVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGhlbHBlcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEluZm8sIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBoZWxwZXJUZXh0XSB9KSB9KSldIH0pKTtcbn0pO1xuSW5wdXQuZGlzcGxheU5hbWUgPSAnSW5wdXQnO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIEZyYWdtZW50IGFzIF9GcmFnbWVudCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBWaXJ0dWFsaXplZERhdGFHcmlkIENvbXBvbmVudFxuICpcbiAqIEVudGVycHJpc2UtZ3JhZGUgZGF0YSBncmlkIHVzaW5nIEFHIEdyaWQgRW50ZXJwcmlzZVxuICogSGFuZGxlcyAxMDAsMDAwKyByb3dzIHdpdGggdmlydHVhbCBzY3JvbGxpbmcgYXQgNjAgRlBTXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VNZW1vLCB1c2VDYWxsYmFjaywgdXNlUmVmLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBZ0dyaWRSZWFjdCB9IGZyb20gJ2FnLWdyaWQtcmVhY3QnO1xuaW1wb3J0ICdhZy1ncmlkLWVudGVycHJpc2UnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgRG93bmxvYWQsIFByaW50ZXIsIEV5ZSwgRXllT2ZmLCBGaWx0ZXIgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tICcuLi9hdG9tcy9TcGlubmVyJztcbi8vIExhenkgbG9hZCBBRyBHcmlkIENTUyAtIG9ubHkgbG9hZCBvbmNlIHdoZW4gZmlyc3QgZ3JpZCBtb3VudHNcbmxldCBhZ0dyaWRTdHlsZXNMb2FkZWQgPSBmYWxzZTtcbmNvbnN0IGxvYWRBZ0dyaWRTdHlsZXMgPSAoKSA9PiB7XG4gICAgaWYgKGFnR3JpZFN0eWxlc0xvYWRlZClcbiAgICAgICAgcmV0dXJuO1xuICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCBBRyBHcmlkIHN0eWxlc1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLWdyaWQuY3NzJyk7XG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctdGhlbWUtYWxwaW5lLmNzcycpO1xuICAgIGFnR3JpZFN0eWxlc0xvYWRlZCA9IHRydWU7XG59O1xuLyoqXG4gKiBIaWdoLXBlcmZvcm1hbmNlIGRhdGEgZ3JpZCBjb21wb25lbnRcbiAqL1xuZnVuY3Rpb24gVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKHsgZGF0YSwgY29sdW1ucywgbG9hZGluZyA9IGZhbHNlLCB2aXJ0dWFsUm93SGVpZ2h0ID0gMzIsIGVuYWJsZUNvbHVtblJlb3JkZXIgPSB0cnVlLCBlbmFibGVDb2x1bW5SZXNpemUgPSB0cnVlLCBlbmFibGVFeHBvcnQgPSB0cnVlLCBlbmFibGVQcmludCA9IHRydWUsIGVuYWJsZUdyb3VwaW5nID0gZmFsc2UsIGVuYWJsZUZpbHRlcmluZyA9IHRydWUsIGVuYWJsZVNlbGVjdGlvbiA9IHRydWUsIHNlbGVjdGlvbk1vZGUgPSAnbXVsdGlwbGUnLCBwYWdpbmF0aW9uID0gdHJ1ZSwgcGFnaW5hdGlvblBhZ2VTaXplID0gMTAwLCBvblJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZSwgY2xhc3NOYW1lLCBoZWlnaHQgPSAnNjAwcHgnLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSwgcmVmKSB7XG4gICAgY29uc3QgZ3JpZFJlZiA9IHVzZVJlZihudWxsKTtcbiAgICBjb25zdCBbZ3JpZEFwaSwgc2V0R3JpZEFwaV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2hvd0NvbHVtblBhbmVsLCBzZXRTaG93Q29sdW1uUGFuZWxdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IHJvd0RhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gZGF0YSA/PyBbXTtcbiAgICAgICAgY29uc29sZS5sb2coJ1tWaXJ0dWFsaXplZERhdGFHcmlkXSByb3dEYXRhIGNvbXB1dGVkOicsIHJlc3VsdC5sZW5ndGgsICdyb3dzJyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW2RhdGFdKTtcbiAgICAvLyBMb2FkIEFHIEdyaWQgc3R5bGVzIG9uIGNvbXBvbmVudCBtb3VudFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRBZ0dyaWRTdHlsZXMoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gRGVmYXVsdCBjb2x1bW4gZGVmaW5pdGlvblxuICAgIGNvbnN0IGRlZmF1bHRDb2xEZWYgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICBmaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgcmVzaXphYmxlOiBlbmFibGVDb2x1bW5SZXNpemUsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIG1pbldpZHRoOiAxMDAsXG4gICAgfSksIFtlbmFibGVGaWx0ZXJpbmcsIGVuYWJsZUNvbHVtblJlc2l6ZV0pO1xuICAgIC8vIEdyaWQgb3B0aW9uc1xuICAgIGNvbnN0IGdyaWRPcHRpb25zID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICByb3dIZWlnaHQ6IHZpcnR1YWxSb3dIZWlnaHQsXG4gICAgICAgIGhlYWRlckhlaWdodDogNDAsXG4gICAgICAgIGZsb2F0aW5nRmlsdGVyc0hlaWdodDogNDAsXG4gICAgICAgIHN1cHByZXNzUm93Q2xpY2tTZWxlY3Rpb246ICFlbmFibGVTZWxlY3Rpb24sXG4gICAgICAgIHJvd1NlbGVjdGlvbjogZW5hYmxlU2VsZWN0aW9uID8gc2VsZWN0aW9uTW9kZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgYW5pbWF0ZVJvd3M6IHRydWUsXG4gICAgICAgIC8vIEZJWDogRGlzYWJsZSBjaGFydHMgdG8gYXZvaWQgZXJyb3IgIzIwMCAocmVxdWlyZXMgSW50ZWdyYXRlZENoYXJ0c01vZHVsZSlcbiAgICAgICAgZW5hYmxlQ2hhcnRzOiBmYWxzZSxcbiAgICAgICAgLy8gRklYOiBVc2UgY2VsbFNlbGVjdGlvbiBpbnN0ZWFkIG9mIGRlcHJlY2F0ZWQgZW5hYmxlUmFuZ2VTZWxlY3Rpb25cbiAgICAgICAgY2VsbFNlbGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBVc2UgbGVnYWN5IHRoZW1lIHRvIHByZXZlbnQgdGhlbWluZyBBUEkgY29uZmxpY3QgKGVycm9yICMyMzkpXG4gICAgICAgIC8vIE11c3QgYmUgc2V0IHRvICdsZWdhY3knIHRvIHVzZSB2MzIgc3R5bGUgdGhlbWVzIHdpdGggQ1NTIGZpbGVzXG4gICAgICAgIHRoZW1lOiAnbGVnYWN5JyxcbiAgICAgICAgc3RhdHVzQmFyOiB7XG4gICAgICAgICAgICBzdGF0dXNQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdUb3RhbEFuZEZpbHRlcmVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2xlZnQnIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnU2VsZWN0ZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnY2VudGVyJyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ0FnZ3JlZ2F0aW9uQ29tcG9uZW50JywgYWxpZ246ICdyaWdodCcgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHNpZGVCYXI6IGVuYWJsZUdyb3VwaW5nXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICB0b29sUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdDb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnY29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0NvbHVtbnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnRmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2ZpbHRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sUGFuZWw6ICdhZ0ZpbHRlcnNUb29sUGFuZWwnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgZGVmYXVsdFRvb2xQYW5lbDogJycsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICA6IGZhbHNlLFxuICAgIH0pLCBbdmlydHVhbFJvd0hlaWdodCwgZW5hYmxlU2VsZWN0aW9uLCBzZWxlY3Rpb25Nb2RlLCBlbmFibGVHcm91cGluZ10pO1xuICAgIC8vIEhhbmRsZSBncmlkIHJlYWR5IGV2ZW50XG4gICAgY29uc3Qgb25HcmlkUmVhZHkgPSB1c2VDYWxsYmFjaygocGFyYW1zKSA9PiB7XG4gICAgICAgIHNldEdyaWRBcGkocGFyYW1zLmFwaSk7XG4gICAgICAgIHBhcmFtcy5hcGkuc2l6ZUNvbHVtbnNUb0ZpdCgpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBIYW5kbGUgcm93IGNsaWNrXG4gICAgY29uc3QgaGFuZGxlUm93Q2xpY2sgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uUm93Q2xpY2sgJiYgZXZlbnQuZGF0YSkge1xuICAgICAgICAgICAgb25Sb3dDbGljayhldmVudC5kYXRhKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblJvd0NsaWNrXSk7XG4gICAgLy8gSGFuZGxlIHNlbGVjdGlvbiBjaGFuZ2VcbiAgICBjb25zdCBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UgPSB1c2VDYWxsYmFjaygoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKG9uU2VsZWN0aW9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFJvd3MgPSBldmVudC5hcGkuZ2V0U2VsZWN0ZWRSb3dzKCk7XG4gICAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZShzZWxlY3RlZFJvd3MpO1xuICAgICAgICB9XG4gICAgfSwgW29uU2VsZWN0aW9uQ2hhbmdlXSk7XG4gICAgLy8gRXhwb3J0IHRvIENTVlxuICAgIGNvbnN0IGV4cG9ydFRvQ3N2ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNDc3Yoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS5jc3ZgLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIEV4cG9ydCB0byBFeGNlbFxuICAgIGNvbnN0IGV4cG9ydFRvRXhjZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0V4Y2VsKHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0ueGxzeGAsXG4gICAgICAgICAgICAgICAgc2hlZXROYW1lOiAnRGF0YScsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gUHJpbnQgZ3JpZFxuICAgIGNvbnN0IHByaW50R3JpZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgJ3ByaW50Jyk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB3aW5kb3cucHJpbnQoKTtcbiAgICAgICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBUb2dnbGUgY29sdW1uIHZpc2liaWxpdHkgcGFuZWxcbiAgICBjb25zdCB0b2dnbGVDb2x1bW5QYW5lbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0U2hvd0NvbHVtblBhbmVsKCFzaG93Q29sdW1uUGFuZWwpO1xuICAgIH0sIFtzaG93Q29sdW1uUGFuZWxdKTtcbiAgICAvLyBBdXRvLXNpemUgYWxsIGNvbHVtbnNcbiAgICBjb25zdCBhdXRvU2l6ZUNvbHVtbnMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBjb25zdCBhbGxDb2x1bW5JZHMgPSBjb2x1bW5zLm1hcChjID0+IGMuZmllbGQpLmZpbHRlcihCb29sZWFuKTtcbiAgICAgICAgICAgIGdyaWRBcGkuYXV0b1NpemVDb2x1bW5zKGFsbENvbHVtbklkcyk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaSwgY29sdW1uc10pO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ2ZsZXggZmxleC1jb2wgYmctd2hpdGUgZGFyazpiZy1ncmF5LTkwMCByb3VuZGVkLWxnIHNoYWRvdy1zbScsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IHJlZjogcmVmLCBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMyBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBsb2FkaW5nID8gKF9qc3goU3Bpbm5lciwgeyBzaXplOiBcInNtXCIgfSkpIDogKGAke3Jvd0RhdGEubGVuZ3RoLnRvTG9jYWxlU3RyaW5nKCl9IHJvd3NgKSB9KSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtlbmFibGVGaWx0ZXJpbmcgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KEZpbHRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogc2V0RmxvYXRpbmdGaWx0ZXJzSGVpZ2h0IGlzIGRlcHJlY2F0ZWQgaW4gQUcgR3JpZCB2MzRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsb2F0aW5nIGZpbHRlcnMgYXJlIG5vdyBjb250cm9sbGVkIHRocm91Z2ggY29sdW1uIGRlZmluaXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ZpbHRlciB0b2dnbGUgbm90IHlldCBpbXBsZW1lbnRlZCBmb3IgQUcgR3JpZCB2MzQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgdGl0bGU6IFwiVG9nZ2xlIGZpbHRlcnNcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWZpbHRlcnNcIiwgY2hpbGRyZW46IFwiRmlsdGVyc1wiIH0pKSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IHNob3dDb2x1bW5QYW5lbCA/IF9qc3goRXllT2ZmLCB7IHNpemU6IDE2IH0pIDogX2pzeChFeWUsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHRvZ2dsZUNvbHVtblBhbmVsLCB0aXRsZTogXCJUb2dnbGUgY29sdW1uIHZpc2liaWxpdHlcIiwgXCJkYXRhLWN5XCI6IFwidG9nZ2xlLWNvbHVtbnNcIiwgY2hpbGRyZW46IFwiQ29sdW1uc1wiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgb25DbGljazogYXV0b1NpemVDb2x1bW5zLCB0aXRsZTogXCJBdXRvLXNpemUgY29sdW1uc1wiLCBcImRhdGEtY3lcIjogXCJhdXRvLXNpemVcIiwgY2hpbGRyZW46IFwiQXV0byBTaXplXCIgfSksIGVuYWJsZUV4cG9ydCAmJiAoX2pzeHMoX0ZyYWdtZW50LCB7IGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvQ3N2LCB0aXRsZTogXCJFeHBvcnQgdG8gQ1NWXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1jc3ZcIiwgY2hpbGRyZW46IFwiQ1NWXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0V4Y2VsLCB0aXRsZTogXCJFeHBvcnQgdG8gRXhjZWxcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWV4Y2VsXCIsIGNoaWxkcmVuOiBcIkV4Y2VsXCIgfSldIH0pKSwgZW5hYmxlUHJpbnQgJiYgKF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KFByaW50ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IHByaW50R3JpZCwgdGl0bGU6IFwiUHJpbnRcIiwgXCJkYXRhLWN5XCI6IFwicHJpbnRcIiwgY2hpbGRyZW46IFwiUHJpbnRcIiB9KSldIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIHJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbbG9hZGluZyAmJiAoX2pzeChcImRpdlwiLCB7IFwiZGF0YS10ZXN0aWRcIjogXCJncmlkLWxvYWRpbmdcIiwgcm9sZTogXCJzdGF0dXNcIiwgXCJhcmlhLWxhYmVsXCI6IFwiTG9hZGluZyBkYXRhXCIsIGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC0wIGJnLXdoaXRlIGJnLW9wYWNpdHktNzUgZGFyazpiZy1ncmF5LTkwMCBkYXJrOmJnLW9wYWNpdHktNzUgei0xMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBjaGlsZHJlbjogX2pzeChTcGlubmVyLCB7IHNpemU6IFwibGdcIiwgbGFiZWw6IFwiTG9hZGluZyBkYXRhLi4uXCIgfSkgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdhZy10aGVtZS1hbHBpbmUnLCAnZGFyazphZy10aGVtZS1hbHBpbmUtZGFyaycsICd3LWZ1bGwnKSwgc3R5bGU6IHsgaGVpZ2h0IH0sIGNoaWxkcmVuOiBfanN4KEFnR3JpZFJlYWN0LCB7IHJlZjogZ3JpZFJlZiwgcm93RGF0YTogcm93RGF0YSwgY29sdW1uRGVmczogY29sdW1ucywgZGVmYXVsdENvbERlZjogZGVmYXVsdENvbERlZiwgZ3JpZE9wdGlvbnM6IGdyaWRPcHRpb25zLCBvbkdyaWRSZWFkeTogb25HcmlkUmVhZHksIG9uUm93Q2xpY2tlZDogaGFuZGxlUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlZDogaGFuZGxlU2VsZWN0aW9uQ2hhbmdlLCByb3dCdWZmZXI6IDIwLCByb3dNb2RlbFR5cGU6IFwiY2xpZW50U2lkZVwiLCBwYWdpbmF0aW9uOiBwYWdpbmF0aW9uLCBwYWdpbmF0aW9uUGFnZVNpemU6IHBhZ2luYXRpb25QYWdlU2l6ZSwgcGFnaW5hdGlvbkF1dG9QYWdlU2l6ZTogZmFsc2UsIHN1cHByZXNzQ2VsbEZvY3VzOiBmYWxzZSwgZW5hYmxlQ2VsbFRleHRTZWxlY3Rpb246IHRydWUsIGVuc3VyZURvbU9yZGVyOiB0cnVlIH0pIH0pLCBzaG93Q29sdW1uUGFuZWwgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIHRvcC0wIHJpZ2h0LTAgdy02NCBoLWZ1bGwgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItbCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcC00IG92ZXJmbG93LXktYXV0byB6LTIwXCIsIGNoaWxkcmVuOiBbX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcImZvbnQtc2VtaWJvbGQgdGV4dC1zbSBtYi0zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbiBWaXNpYmlsaXR5XCIgfSksIGNvbHVtbnMubWFwKChjb2wpID0+IChfanN4cyhcImxhYmVsXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB5LTFcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcImNoZWNrYm94XCIsIGNsYXNzTmFtZTogXCJyb3VuZGVkXCIsIGRlZmF1bHRDaGVja2VkOiB0cnVlLCBvbkNoYW5nZTogKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyaWRBcGkgJiYgY29sLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmlkQXBpLnNldENvbHVtbnNWaXNpYmxlKFtjb2wuZmllbGRdLCBlLnRhcmdldC5jaGVja2VkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gfSksIF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc21cIiwgY2hpbGRyZW46IGNvbC5oZWFkZXJOYW1lIHx8IGNvbC5maWVsZCB9KV0gfSwgY29sLmZpZWxkKSkpXSB9KSldIH0pXSB9KSk7XG59XG5leHBvcnQgY29uc3QgVmlydHVhbGl6ZWREYXRhR3JpZCA9IFJlYWN0LmZvcndhcmRSZWYoVmlydHVhbGl6ZWREYXRhR3JpZElubmVyKTtcbi8vIFNldCBkaXNwbGF5TmFtZSBmb3IgUmVhY3QgRGV2VG9vbHNcblZpcnR1YWxpemVkRGF0YUdyaWQuZGlzcGxheU5hbWUgPSAnVmlydHVhbGl6ZWREYXRhR3JpZCc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBCYWRnZSBDb21wb25lbnRcbiAqXG4gKiBTbWFsbCBsYWJlbCBjb21wb25lbnQgZm9yIHN0YXR1cyBpbmRpY2F0b3JzLCBjb3VudHMsIGFuZCB0YWdzLlxuICogU3VwcG9ydHMgbXVsdGlwbGUgdmFyaWFudHMgYW5kIHNpemVzLlxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuLyoqXG4gKiBCYWRnZSBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IEJhZGdlID0gKHsgY2hpbGRyZW4sIHZhcmlhbnQgPSAnZGVmYXVsdCcsIHNpemUgPSAnbWQnLCBkb3QgPSBmYWxzZSwgZG90UG9zaXRpb24gPSAnbGVhZGluZycsIHJlbW92YWJsZSA9IGZhbHNlLCBvblJlbW92ZSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIFZhcmlhbnQgc3R5bGVzXG4gICAgY29uc3QgdmFyaWFudENsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ncmF5LTEwMCB0ZXh0LWdyYXktODAwIGJvcmRlci1ncmF5LTIwMCcsXG4gICAgICAgIHByaW1hcnk6ICdiZy1ibHVlLTEwMCB0ZXh0LWJsdWUtODAwIGJvcmRlci1ibHVlLTIwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi0xMDAgdGV4dC1ncmVlbi04MDAgYm9yZGVyLWdyZWVuLTIwMCcsXG4gICAgICAgIHdhcm5pbmc6ICdiZy15ZWxsb3ctMTAwIHRleHQteWVsbG93LTgwMCBib3JkZXIteWVsbG93LTIwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC0xMDAgdGV4dC1yZWQtODAwIGJvcmRlci1yZWQtMjAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tMTAwIHRleHQtY3lhbi04MDAgYm9yZGVyLWN5YW4tMjAwJyxcbiAgICB9O1xuICAgIC8vIERvdCBjb2xvciBjbGFzc2VzXG4gICAgY29uc3QgZG90Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWdyYXktNTAwJyxcbiAgICAgICAgcHJpbWFyeTogJ2JnLWJsdWUtNTAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTUwMCcsXG4gICAgICAgIHdhcm5pbmc6ICdiZy15ZWxsb3ctNTAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTUwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTUwMCcsXG4gICAgfTtcbiAgICAvLyBTaXplIHN0eWxlc1xuICAgIGNvbnN0IHNpemVDbGFzc2VzID0ge1xuICAgICAgICB4czogJ3B4LTIgcHktMC41IHRleHQteHMnLFxuICAgICAgICBzbTogJ3B4LTIuNSBweS0wLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtMyBweS0xIHRleHQtc20nLFxuICAgICAgICBsZzogJ3B4LTMuNSBweS0xLjUgdGV4dC1iYXNlJyxcbiAgICB9O1xuICAgIGNvbnN0IGRvdFNpemVDbGFzc2VzID0ge1xuICAgICAgICB4czogJ2gtMS41IHctMS41JyxcbiAgICAgICAgc206ICdoLTIgdy0yJyxcbiAgICAgICAgbWQ6ICdoLTIgdy0yJyxcbiAgICAgICAgbGc6ICdoLTIuNSB3LTIuNScsXG4gICAgfTtcbiAgICBjb25zdCBiYWRnZUNsYXNzZXMgPSBjbHN4KFxuICAgIC8vIEJhc2Ugc3R5bGVzXG4gICAgJ2lubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41JywgJ2ZvbnQtbWVkaXVtIHJvdW5kZWQtZnVsbCBib3JkZXInLCAndHJhbnNpdGlvbi1jb2xvcnMgZHVyYXRpb24tMjAwJywgXG4gICAgLy8gVmFyaWFudFxuICAgIHZhcmlhbnRDbGFzc2VzW3ZhcmlhbnRdLCBcbiAgICAvLyBTaXplXG4gICAgc2l6ZUNsYXNzZXNbc2l6ZV0sIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIChfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IGJhZGdlQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtkb3QgJiYgZG90UG9zaXRpb24gPT09ICdsZWFkaW5nJyAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGNsc3goJ3JvdW5kZWQtZnVsbCcsIGRvdENsYXNzZXNbdmFyaWFudF0sIGRvdFNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IGNoaWxkcmVuIH0pLCBkb3QgJiYgZG90UG9zaXRpb24gPT09ICd0cmFpbGluZycgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdyb3VuZGVkLWZ1bGwnLCBkb3RDbGFzc2VzW3ZhcmlhbnRdLCBkb3RTaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSkpLCByZW1vdmFibGUgJiYgb25SZW1vdmUgJiYgKF9qc3goXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiBvblJlbW92ZSwgY2xhc3NOYW1lOiBjbHN4KCdtbC0wLjUgLW1yLTEgaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyJywgJ3JvdW5kZWQtZnVsbCBob3ZlcjpiZy1ibGFjay8xMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTEnLCB7XG4gICAgICAgICAgICAgICAgICAgICdoLTMgdy0zJzogc2l6ZSA9PT0gJ3hzJyB8fCBzaXplID09PSAnc20nLFxuICAgICAgICAgICAgICAgICAgICAnaC00IHctNCc6IHNpemUgPT09ICdtZCcgfHwgc2l6ZSA9PT0gJ2xnJyxcbiAgICAgICAgICAgICAgICB9KSwgXCJhcmlhLWxhYmVsXCI6IFwiUmVtb3ZlXCIsIGNoaWxkcmVuOiBfanN4KFwic3ZnXCIsIHsgY2xhc3NOYW1lOiBjbHN4KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdoLTIgdy0yJzogc2l6ZSA9PT0gJ3hzJyB8fCBzaXplID09PSAnc20nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2gtMyB3LTMnOiBzaXplID09PSAnbWQnIHx8IHNpemUgPT09ICdsZycsXG4gICAgICAgICAgICAgICAgICAgIH0pLCBmaWxsOiBcImN1cnJlbnRDb2xvclwiLCB2aWV3Qm94OiBcIjAgMCAyMCAyMFwiLCBjaGlsZHJlbjogX2pzeChcInBhdGhcIiwgeyBmaWxsUnVsZTogXCJldmVub2RkXCIsIGQ6IFwiTTQuMjkzIDQuMjkzYTEgMSAwIDAxMS40MTQgMEwxMCA4LjU4Nmw0LjI5My00LjI5M2ExIDEgMCAxMTEuNDE0IDEuNDE0TDExLjQxNCAxMGw0LjI5MyA0LjI5M2ExIDEgMCAwMS0xLjQxNCAxLjQxNEwxMCAxMS40MTRsLTQuMjkzIDQuMjkzYTEgMSAwIDAxLTEuNDE0LTEuNDE0TDguNTg2IDEwIDQuMjkzIDUuNzA3YTEgMSAwIDAxMC0xLjQxNHpcIiwgY2xpcFJ1bGU6IFwiZXZlbm9kZFwiIH0pIH0pIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IEJhZGdlO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9