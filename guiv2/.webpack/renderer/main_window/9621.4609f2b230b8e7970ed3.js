"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[9621],{

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

/***/ 39621:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ security_RiskAssessmentView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
// EXTERNAL MODULE: ./src/renderer/store/useProfileStore.ts
var useProfileStore = __webpack_require__(33813);
;// ./src/renderer/hooks/useRiskAssessmentLogic.ts
/**
 * Risk Assessment Logic Hook
 */


const useRiskAssessmentLogic = () => {
    const { selectedSourceProfile } = (0,useProfileStore/* useProfileStore */.K)();
    const [data, setData] = (0,react.useState)([]);
    const [isLoading, setIsLoading] = (0,react.useState)(false);
    const [error, setError] = (0,react.useState)(null);
    const [filters, setFilters] = (0,react.useState)({
        riskLevel: '',
        category: '',
        status: '',
        owner: '',
        searchText: '',
    });
    const [selectedRisks, setSelectedRisks] = (0,react.useState)([]);
    const columns = (0,react.useMemo)(() => [
        { headerName: 'Resource', field: 'resourceName', pinned: 'left', width: 180, filter: 'agTextColumnFilter', checkboxSelection: true, headerCheckboxSelection: true },
        { headerName: 'Type', field: 'resourceType', width: 120 },
        { headerName: 'Risk Type', field: 'riskType', width: 150, filter: 'agTextColumnFilter' },
        {
            headerName: 'Risk Level',
            field: 'riskLevel',
            width: 120,
            cellRenderer: (params) => {
                const colorMap = {
                    Critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                    High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
                    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                    Low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                };
                const color = colorMap[params.value] || '';
                return `<span class="px-2 py-1 rounded text-xs font-semibold ${color}">${params.value}</span>`;
            },
        },
        { headerName: 'Category', field: 'category', width: 140, filter: 'agTextColumnFilter' },
        { headerName: 'Status', field: 'status', width: 120 },
        { headerName: 'Owner', field: 'owner', width: 150, filter: 'agTextColumnFilter' },
        { headerName: 'Description', field: 'description', width: 300 },
        { headerName: 'Recommendation', field: 'recommendation', width: 250 },
        { headerName: 'Detected', field: 'detectedDate', width: 140, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '' },
        { headerName: 'Due Date', field: 'dueDate', width: 140, valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '' },
    ], []);
    const filteredData = (0,react.useMemo)(() => {
        let result = [...data];
        if (filters.riskLevel)
            result = result.filter((item) => item.riskLevel === filters.riskLevel);
        if (filters.category)
            result = result.filter((item) => (item.category ?? '').toLowerCase().includes(filters.category.toLowerCase()));
        if (filters.status)
            result = result.filter((item) => item.status === filters.status);
        if (filters.owner)
            result = result.filter((item) => (item.owner ?? '').toLowerCase().includes(filters.owner.toLowerCase()));
        if (filters.searchText) {
            const search = filters.searchText.toLowerCase();
            result = result.filter((item) => (item.resourceName ?? '').toLowerCase().includes(search) ||
                (item.description ?? '').toLowerCase().includes(search));
        }
        return result;
    }, [data, filters]);
    const filterOptions = (0,react.useMemo)(() => ({
        riskLevels: ['Critical', 'High', 'Medium', 'Low'],
        categories: [...new Set((data ?? []).map((d) => d.category))].sort(),
        statuses: [...new Set((data ?? []).map((d) => d.status))].sort(),
        owners: [...new Set((data ?? []).map((d) => d.owner))].sort(),
    }), [data]);
    const loadData = (0,react.useCallback)(async () => {
        if (!selectedSourceProfile) {
            setError('No source profile selected');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Security/RiskAssessment.psm1',
                functionName: 'Get-SecurityRisks',
                parameters: { Domain: selectedSourceProfile.domain, Credential: selectedSourceProfile.credential },
                options: { timeout: 300000 },
            });
            if (result.success && result.data) {
                setData(result.data.risks || []);
            }
            else {
                throw new Error(result.error || 'Failed to load risk data');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
        finally {
            setIsLoading(false);
        }
    }, [selectedSourceProfile]);
    const updateFilter = (0,react.useCallback)((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);
    const clearFilters = (0,react.useCallback)(() => {
        setFilters({ riskLevel: '', category: '', status: '', owner: '', searchText: '' });
    }, []);
    const stats = (0,react.useMemo)(() => {
        const total = filteredData.length;
        const critical = filteredData.filter((d) => d.riskLevel === 'Critical').length;
        const high = filteredData.filter((d) => d.riskLevel === 'High').length;
        const resolved = filteredData.filter((d) => d.isResolved).length;
        const overdue = filteredData.filter((d) => d.isOverdue).length;
        return { total, critical, high, resolved, overdue };
    }, [filteredData]);
    (0,react.useEffect)(() => {
        if (selectedSourceProfile)
            loadData();
    }, [selectedSourceProfile, loadData]);
    return {
        data: filteredData,
        columns,
        isLoading,
        error,
        filters,
        filterOptions,
        updateFilter,
        clearFilters,
        selectedRisks,
        setSelectedRisks,
        loadData,
        stats,
        selectedProfile: selectedSourceProfile,
    };
};

// EXTERNAL MODULE: ./src/renderer/components/organisms/VirtualizedDataGrid.tsx
var VirtualizedDataGrid = __webpack_require__(59944);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Input.tsx
var Input = __webpack_require__(34766);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Select.tsx
var Select = __webpack_require__(1156);
;// ./src/renderer/views/security/RiskAssessmentView.tsx

/**
 * Risk Assessment View
 */







const RiskAssessmentView = () => {
    const { data, columns, isLoading, error, filters, filterOptions, updateFilter, clearFilters, selectedRisks, setSelectedRisks, loadData, stats, selectedProfile, } = useRiskAssessmentLogic();
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "risk-assessment-view", "data-testid": "risk-assessment-view", children: [(0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(lucide_react/* AlertTriangle */.hcu, { className: "w-8 h-8 text-orange-600 dark:text-orange-400" }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Risk Assessment" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Identify and track security risks" })] })] }), selectedProfile && (0,jsx_runtime.jsxs)("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Profile: ", (0,jsx_runtime.jsx)("span", { className: "font-semibold", children: selectedProfile.name })] })] }) }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4", children: [(0,jsx_runtime.jsxs)("div", { className: "bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-blue-600 dark:text-blue-400 font-medium", children: "Total Risks" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-blue-900 dark:text-blue-100", children: stats?.total ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-red-50 dark:bg-red-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-red-600 dark:text-red-400 font-medium", children: "Critical" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-red-900 dark:text-red-100", children: stats?.critical ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-orange-600 dark:text-orange-400 font-medium", children: "High" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-orange-900 dark:text-orange-100", children: stats?.high ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-green-50 dark:bg-green-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-green-600 dark:text-green-400 font-medium", children: "Resolved" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-green-900 dark:text-green-100", children: stats?.resolved ?? 0 })] }), (0,jsx_runtime.jsxs)("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4", children: [(0,jsx_runtime.jsx)("div", { className: "text-sm text-yellow-600 dark:text-yellow-400 font-medium", children: "Overdue" }), (0,jsx_runtime.jsx)("div", { className: "text-2xl font-bold text-yellow-900 dark:text-yellow-100", children: stats?.overdue ?? 0 })] })] }) }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3 mb-3", children: [(0,jsx_runtime.jsx)(lucide_react/* Filter */.dJT, { className: "w-5 h-5 text-gray-600 dark:text-gray-400" }), (0,jsx_runtime.jsx)("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "Filters" }), (filters.riskLevel || filters.category || filters.status || filters.owner || filters.searchText) && ((0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "ghost", size: "sm", icon: (0,jsx_runtime.jsx)(lucide_react.X, { className: "w-4 h-4" }), onClick: clearFilters, "data-cy": "clear-filters-btn", "data-testid": "clear-filters-btn", children: "Clear All" }))] }), (0,jsx_runtime.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-3", children: [(0,jsx_runtime.jsx)(Input/* Input */.p, { placeholder: "Search risks...", value: filters.searchText, onChange: (e) => updateFilter('searchText', e.target.value), "data-cy": "search-input", "data-testid": "search-input" }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.riskLevel, onChange: (value) => updateFilter('riskLevel', value), "data-cy": "risk-level-select", options: [
                                    { value: '', label: 'All Risk Levels' },
                                    ...(filterOptions?.riskLevels ?? []).map((rl) => ({ value: rl, label: rl }))
                                ] }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.category, onChange: (value) => updateFilter('category', value), "data-cy": "category-select", "data-testid": "category-select", options: [
                                    { value: '', label: 'All Categories' },
                                    ...(filterOptions?.categories ?? []).map((cat) => ({ value: cat, label: cat }))
                                ] }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.status, onChange: (value) => updateFilter('status', value), "data-cy": "status-select", "data-testid": "status-select", options: [
                                    { value: '', label: 'All Statuses' },
                                    ...(filterOptions?.statuses ?? []).map((st) => ({ value: st, label: st }))
                                ] }), (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filters.owner, onChange: (value) => updateFilter('owner', value), "data-cy": "owner-select", "data-testid": "owner-select", options: [
                                    { value: '', label: 'All Owners' },
                                    ...(filterOptions?.owners ?? []).map((own) => ({ value: own, label: own }))
                                ] })] })] }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "primary", icon: (0,jsx_runtime.jsx)(lucide_react/* RefreshCw */.e9t, { className: "w-4 h-4" }), onClick: loadData, loading: isLoading, "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "secondary", icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4" }), disabled: (data?.length ?? 0) === 0, "data-cy": "export-btn", children: "Export Risk Report" })] }) }), error && ((0,jsx_runtime.jsx)("div", { className: "mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md", children: (0,jsx_runtime.jsx)("p", { className: "text-sm text-red-800 dark:text-red-200", children: error }) })), (0,jsx_runtime.jsx)("div", { className: "flex-1 overflow-hidden p-6", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid/* VirtualizedDataGrid */.Q, { data: data, columns: columns, loading: isLoading, enableSelection: true, selectionMode: "multiple", onSelectionChange: setSelectedRisks, height: "calc(100vh - 500px)" }) })] }));
};
/* harmony default export */ const security_RiskAssessmentView = (RiskAssessmentView);


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


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LDREQUFPLElBQUksVUFBVSw4RUFBOEUsS0FBSyxJQUFJLEdBQUcsdURBQUssVUFBVSxxREFBcUQsc0RBQUksVUFBVSx1TkFBdU4sc0RBQUksQ0FBQyw0REFBTyxJQUFJLHNDQUFzQyxHQUFHLElBQUksc0RBQUksVUFBVSxXQUFXLG1EQUFJLHFFQUFxRSxRQUFRLFlBQVksc0RBQUksQ0FBQyxnRUFBVyxJQUFJLHlhQUF5YSxHQUFHLHVCQUF1Qix1REFBSyxVQUFVLDZKQUE2SixzREFBSSxTQUFTLHdFQUF3RSx5QkFBeUIsdURBQUssWUFBWSxzREFBc0Qsc0RBQUksWUFBWTtBQUNyMkU7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLEdBQUcsc0RBQUksV0FBVyw2REFBNkQsSUFBSSxpQkFBaUIsS0FBSyxJQUFJO0FBQ3hKO0FBQ08sNEJBQTRCLDZDQUFnQjtBQUNuRDtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlUmlza0Fzc2Vzc21lbnRMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9zZWN1cml0eS9SaXNrQXNzZXNzbWVudFZpZXcudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIElucHV0IENvbXBvbmVudFxuICpcbiAqIEFjY2Vzc2libGUgaW5wdXQgZmllbGQgd2l0aCBsYWJlbCwgZXJyb3Igc3RhdGVzLCBhbmQgaGVscCB0ZXh0XG4gKi9cbmltcG9ydCBSZWFjdCwgeyBmb3J3YXJkUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQWxlcnRDaXJjbGUsIEluZm8gfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBJbnB1dCBjb21wb25lbnQgd2l0aCBmdWxsIGFjY2Vzc2liaWxpdHkgc3VwcG9ydFxuICovXG5leHBvcnQgY29uc3QgSW5wdXQgPSBmb3J3YXJkUmVmKCh7IGxhYmVsLCBoZWxwZXJUZXh0LCBlcnJvciwgcmVxdWlyZWQgPSBmYWxzZSwgc2hvd09wdGlvbmFsID0gdHJ1ZSwgaW5wdXRTaXplID0gJ21kJywgZnVsbFdpZHRoID0gZmFsc2UsIHN0YXJ0SWNvbiwgZW5kSWNvbiwgY2xhc3NOYW1lLCBpZCwgJ2RhdGEtY3knOiBkYXRhQ3ksIGRpc2FibGVkID0gZmFsc2UsIC4uLnByb3BzIH0sIHJlZikgPT4ge1xuICAgIC8vIEdlbmVyYXRlIHVuaXF1ZSBJRCBpZiBub3QgcHJvdmlkZWRcbiAgICBjb25zdCBpbnB1dElkID0gaWQgfHwgYGlucHV0LSR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfWA7XG4gICAgY29uc3QgZXJyb3JJZCA9IGAke2lucHV0SWR9LWVycm9yYDtcbiAgICBjb25zdCBoZWxwZXJJZCA9IGAke2lucHV0SWR9LWhlbHBlcmA7XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplcyA9IHtcbiAgICAgICAgc206ICdweC0zIHB5LTEuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC00IHB5LTIgdGV4dC1iYXNlJyxcbiAgICAgICAgbGc6ICdweC01IHB5LTMgdGV4dC1sZycsXG4gICAgfTtcbiAgICAvLyBJbnB1dCBjbGFzc2VzXG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeCgnYmxvY2sgcm91bmRlZC1tZCBib3JkZXIgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMicsICdkaXNhYmxlZDpiZy1ncmF5LTUwIGRpc2FibGVkOnRleHQtZ3JheS01MDAgZGlzYWJsZWQ6Y3Vyc29yLW5vdC1hbGxvd2VkJywgJ2Rhcms6YmctZ3JheS04MDAgZGFyazp0ZXh0LWdyYXktMTAwJywgc2l6ZXNbaW5wdXRTaXplXSwgZnVsbFdpZHRoICYmICd3LWZ1bGwnLCBzdGFydEljb24gJiYgJ3BsLTEwJywgZW5kSWNvbiAmJiAncHItMTAnLCBlcnJvclxuICAgICAgICA/IGNsc3goJ2JvcmRlci1yZWQtNTAwIHRleHQtcmVkLTkwMCBwbGFjZWhvbGRlci1yZWQtNDAwJywgJ2ZvY3VzOmJvcmRlci1yZWQtNTAwIGZvY3VzOnJpbmctcmVkLTUwMCcsICdkYXJrOmJvcmRlci1yZWQtNDAwIGRhcms6dGV4dC1yZWQtNDAwJylcbiAgICAgICAgOiBjbHN4KCdib3JkZXItZ3JheS0zMDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6Ym9yZGVyLWJsdWUtNTAwIGZvY3VzOnJpbmctYmx1ZS01MDAnLCAnZGFyazpib3JkZXItZ3JheS02MDAgZGFyazpwbGFjZWhvbGRlci1ncmF5LTUwMCcpLCBjbGFzc05hbWUpO1xuICAgIC8vIENvbnRhaW5lciBjbGFzc2VzXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goZnVsbFdpZHRoICYmICd3LWZ1bGwnKTtcbiAgICAvLyBMYWJlbCBjbGFzc2VzXG4gICAgY29uc3QgbGFiZWxDbGFzc2VzID0gY2xzeCgnYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIGRhcms6dGV4dC1ncmF5LTIwMCBtYi0xJyk7XG4gICAgLy8gSGVscGVyL0Vycm9yIHRleHQgY2xhc3Nlc1xuICAgIGNvbnN0IGhlbHBlckNsYXNzZXMgPSBjbHN4KCdtdC0xIHRleHQtc20nLCBlcnJvciA/ICd0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAnIDogJ3RleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwJyk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCAmJiAoX2pzeHMoXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGlucHV0SWQsIGNsYXNzTmFtZTogbGFiZWxDbGFzc2VzLCBjaGlsZHJlbjogW2xhYmVsLCByZXF1aXJlZCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1yZWQtNTAwIG1sLTFcIiwgXCJhcmlhLWxhYmVsXCI6IFwicmVxdWlyZWRcIiwgY2hpbGRyZW46IFwiKlwiIH0pKSwgIXJlcXVpcmVkICYmIHNob3dPcHRpb25hbCAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDAgbWwtMSB0ZXh0LXhzXCIsIGNoaWxkcmVuOiBcIihvcHRpb25hbClcIiB9KSldIH0pKSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicmVsYXRpdmVcIiwgY2hpbGRyZW46IFtzdGFydEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIGxlZnQtMCBwbC0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBzdGFydEljb24gfSkgfSkpLCBfanN4KFwiaW5wdXRcIiwgeyByZWY6IHJlZiwgaWQ6IGlucHV0SWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtaW52YWxpZFwiOiAhIWVycm9yLCBcImFyaWEtZGVzY3JpYmVkYnlcIjogY2xzeChlcnJvciAmJiBlcnJvcklkLCBoZWxwZXJUZXh0ICYmIGhlbHBlcklkKSB8fCB1bmRlZmluZWQsIFwiYXJpYS1yZXF1aXJlZFwiOiByZXF1aXJlZCwgZGlzYWJsZWQ6IGRpc2FibGVkLCBcImRhdGEtY3lcIjogZGF0YUN5LCAuLi5wcm9wcyB9KSwgZW5kSWNvbiAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSBpbnNldC15LTAgcmlnaHQtMCBwci0zIGZsZXggaXRlbXMtY2VudGVyIHBvaW50ZXItZXZlbnRzLW5vbmVcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIsIGNoaWxkcmVuOiBlbmRJY29uIH0pIH0pKV0gfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGVycm9ySWQsIGNsYXNzTmFtZTogaGVscGVyQ2xhc3Nlcywgcm9sZTogXCJhbGVydFwiLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChBbGVydENpcmNsZSwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBtci0xXCIsIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIGVycm9yXSB9KSB9KSksIGhlbHBlclRleHQgJiYgIWVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgaWQ6IGhlbHBlcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIGNoaWxkcmVuOiBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KEluZm8sIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBoZWxwZXJUZXh0XSB9KSB9KSldIH0pKTtcbn0pO1xuSW5wdXQuZGlzcGxheU5hbWUgPSAnSW5wdXQnO1xuIiwiLyoqXG4gKiBSaXNrIEFzc2Vzc21lbnQgTG9naWMgSG9va1xuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjaywgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVByb2ZpbGVTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZVByb2ZpbGVTdG9yZSc7XG5leHBvcnQgY29uc3QgdXNlUmlza0Fzc2Vzc21lbnRMb2dpYyA9ICgpID0+IHtcbiAgICBjb25zdCB7IHNlbGVjdGVkU291cmNlUHJvZmlsZSB9ID0gdXNlUHJvZmlsZVN0b3JlKCk7XG4gICAgY29uc3QgW2RhdGEsIHNldERhdGFdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbZmlsdGVycywgc2V0RmlsdGVyc10gPSB1c2VTdGF0ZSh7XG4gICAgICAgIHJpc2tMZXZlbDogJycsXG4gICAgICAgIGNhdGVnb3J5OiAnJyxcbiAgICAgICAgc3RhdHVzOiAnJyxcbiAgICAgICAgb3duZXI6ICcnLFxuICAgICAgICBzZWFyY2hUZXh0OiAnJyxcbiAgICB9KTtcbiAgICBjb25zdCBbc2VsZWN0ZWRSaXNrcywgc2V0U2VsZWN0ZWRSaXNrc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgY29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7IGhlYWRlck5hbWU6ICdSZXNvdXJjZScsIGZpZWxkOiAncmVzb3VyY2VOYW1lJywgcGlubmVkOiAnbGVmdCcsIHdpZHRoOiAxODAsIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicsIGNoZWNrYm94U2VsZWN0aW9uOiB0cnVlLCBoZWFkZXJDaGVja2JveFNlbGVjdGlvbjogdHJ1ZSB9LFxuICAgICAgICB7IGhlYWRlck5hbWU6ICdUeXBlJywgZmllbGQ6ICdyZXNvdXJjZVR5cGUnLCB3aWR0aDogMTIwIH0sXG4gICAgICAgIHsgaGVhZGVyTmFtZTogJ1Jpc2sgVHlwZScsIGZpZWxkOiAncmlza1R5cGUnLCB3aWR0aDogMTUwLCBmaWx0ZXI6ICdhZ1RleHRDb2x1bW5GaWx0ZXInIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdSaXNrIExldmVsJyxcbiAgICAgICAgICAgIGZpZWxkOiAncmlza0xldmVsJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMjAsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2xvck1hcCA9IHtcbiAgICAgICAgICAgICAgICAgICAgQ3JpdGljYWw6ICdiZy1yZWQtMTAwIHRleHQtcmVkLTgwMCBkYXJrOmJnLXJlZC05MDAvMjAgZGFyazp0ZXh0LXJlZC00MDAnLFxuICAgICAgICAgICAgICAgICAgICBIaWdoOiAnYmctb3JhbmdlLTEwMCB0ZXh0LW9yYW5nZS04MDAgZGFyazpiZy1vcmFuZ2UtOTAwLzIwIGRhcms6dGV4dC1vcmFuZ2UtNDAwJyxcbiAgICAgICAgICAgICAgICAgICAgTWVkaXVtOiAnYmcteWVsbG93LTEwMCB0ZXh0LXllbGxvdy04MDAgZGFyazpiZy15ZWxsb3ctOTAwLzIwIGRhcms6dGV4dC15ZWxsb3ctNDAwJyxcbiAgICAgICAgICAgICAgICAgICAgTG93OiAnYmctZ3JlZW4tMTAwIHRleHQtZ3JlZW4tODAwIGRhcms6YmctZ3JlZW4tOTAwLzIwIGRhcms6dGV4dC1ncmVlbi00MDAnLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSBjb2xvck1hcFtwYXJhbXMudmFsdWVdIHx8ICcnO1xuICAgICAgICAgICAgICAgIHJldHVybiBgPHNwYW4gY2xhc3M9XCJweC0yIHB5LTEgcm91bmRlZCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgJHtjb2xvcn1cIj4ke3BhcmFtcy52YWx1ZX08L3NwYW4+YDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHsgaGVhZGVyTmFtZTogJ0NhdGVnb3J5JywgZmllbGQ6ICdjYXRlZ29yeScsIHdpZHRoOiAxNDAsIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicgfSxcbiAgICAgICAgeyBoZWFkZXJOYW1lOiAnU3RhdHVzJywgZmllbGQ6ICdzdGF0dXMnLCB3aWR0aDogMTIwIH0sXG4gICAgICAgIHsgaGVhZGVyTmFtZTogJ093bmVyJywgZmllbGQ6ICdvd25lcicsIHdpZHRoOiAxNTAsIGZpbHRlcjogJ2FnVGV4dENvbHVtbkZpbHRlcicgfSxcbiAgICAgICAgeyBoZWFkZXJOYW1lOiAnRGVzY3JpcHRpb24nLCBmaWVsZDogJ2Rlc2NyaXB0aW9uJywgd2lkdGg6IDMwMCB9LFxuICAgICAgICB7IGhlYWRlck5hbWU6ICdSZWNvbW1lbmRhdGlvbicsIGZpZWxkOiAncmVjb21tZW5kYXRpb24nLCB3aWR0aDogMjUwIH0sXG4gICAgICAgIHsgaGVhZGVyTmFtZTogJ0RldGVjdGVkJywgZmllbGQ6ICdkZXRlY3RlZERhdGUnLCB3aWR0aDogMTQwLCB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gbmV3IERhdGUocGFyYW1zLnZhbHVlKS50b0xvY2FsZURhdGVTdHJpbmcoKSA6ICcnIH0sXG4gICAgICAgIHsgaGVhZGVyTmFtZTogJ0R1ZSBEYXRlJywgZmllbGQ6ICdkdWVEYXRlJywgd2lkdGg6IDE0MCwgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgOiAnJyB9LFxuICAgIF0sIFtdKTtcbiAgICBjb25zdCBmaWx0ZXJlZERhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFsuLi5kYXRhXTtcbiAgICAgICAgaWYgKGZpbHRlcnMucmlza0xldmVsKVxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5yaXNrTGV2ZWwgPT09IGZpbHRlcnMucmlza0xldmVsKTtcbiAgICAgICAgaWYgKGZpbHRlcnMuY2F0ZWdvcnkpXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChpdGVtKSA9PiAoaXRlbS5jYXRlZ29yeSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXJzLmNhdGVnb3J5LnRvTG93ZXJDYXNlKCkpKTtcbiAgICAgICAgaWYgKGZpbHRlcnMuc3RhdHVzKVxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5zdGF0dXMgPT09IGZpbHRlcnMuc3RhdHVzKTtcbiAgICAgICAgaWYgKGZpbHRlcnMub3duZXIpXG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChpdGVtKSA9PiAoaXRlbS5vd25lciA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXJzLm93bmVyLnRvTG93ZXJDYXNlKCkpKTtcbiAgICAgICAgaWYgKGZpbHRlcnMuc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gZmlsdGVycy5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChpdGVtKSA9PiAoaXRlbS5yZXNvdXJjZU5hbWUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgIChpdGVtLmRlc2NyaXB0aW9uID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW2RhdGEsIGZpbHRlcnNdKTtcbiAgICBjb25zdCBmaWx0ZXJPcHRpb25zID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICByaXNrTGV2ZWxzOiBbJ0NyaXRpY2FsJywgJ0hpZ2gnLCAnTWVkaXVtJywgJ0xvdyddLFxuICAgICAgICBjYXRlZ29yaWVzOiBbLi4ubmV3IFNldCgoZGF0YSA/PyBbXSkubWFwKChkKSA9PiBkLmNhdGVnb3J5KSldLnNvcnQoKSxcbiAgICAgICAgc3RhdHVzZXM6IFsuLi5uZXcgU2V0KChkYXRhID8/IFtdKS5tYXAoKGQpID0+IGQuc3RhdHVzKSldLnNvcnQoKSxcbiAgICAgICAgb3duZXJzOiBbLi4ubmV3IFNldCgoZGF0YSA/PyBbXSkubWFwKChkKSA9PiBkLm93bmVyKSldLnNvcnQoKSxcbiAgICB9KSwgW2RhdGFdKTtcbiAgICBjb25zdCBsb2FkRGF0YSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZVByb2ZpbGUpIHtcbiAgICAgICAgICAgIHNldEVycm9yKCdObyBzb3VyY2UgcHJvZmlsZSBzZWxlY3RlZCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvU2VjdXJpdHkvUmlza0Fzc2Vzc21lbnQucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnR2V0LVNlY3VyaXR5Umlza3MnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHsgRG9tYWluOiBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuZG9tYWluLCBDcmVkZW50aWFsOiBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuY3JlZGVudGlhbCB9LFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHsgdGltZW91dDogMzAwMDAwIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2VzcyAmJiByZXN1bHQuZGF0YSkge1xuICAgICAgICAgICAgICAgIHNldERhdGEocmVzdWx0LmRhdGEucmlza3MgfHwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnRmFpbGVkIHRvIGxvYWQgcmlzayBkYXRhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW3NlbGVjdGVkU291cmNlUHJvZmlsZV0pO1xuICAgIGNvbnN0IHVwZGF0ZUZpbHRlciA9IHVzZUNhbGxiYWNrKChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIHNldEZpbHRlcnMoKHByZXYpID0+ICh7IC4uLnByZXYsIFtrZXldOiB2YWx1ZSB9KSk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IGNsZWFyRmlsdGVycyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0RmlsdGVycyh7IHJpc2tMZXZlbDogJycsIGNhdGVnb3J5OiAnJywgc3RhdHVzOiAnJywgb3duZXI6ICcnLCBzZWFyY2hUZXh0OiAnJyB9KTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3Qgc3RhdHMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgY29uc3QgdG90YWwgPSBmaWx0ZXJlZERhdGEubGVuZ3RoO1xuICAgICAgICBjb25zdCBjcml0aWNhbCA9IGZpbHRlcmVkRGF0YS5maWx0ZXIoKGQpID0+IGQucmlza0xldmVsID09PSAnQ3JpdGljYWwnKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGhpZ2ggPSBmaWx0ZXJlZERhdGEuZmlsdGVyKChkKSA9PiBkLnJpc2tMZXZlbCA9PT0gJ0hpZ2gnKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHJlc29sdmVkID0gZmlsdGVyZWREYXRhLmZpbHRlcigoZCkgPT4gZC5pc1Jlc29sdmVkKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IG92ZXJkdWUgPSBmaWx0ZXJlZERhdGEuZmlsdGVyKChkKSA9PiBkLmlzT3ZlcmR1ZSkubGVuZ3RoO1xuICAgICAgICByZXR1cm4geyB0b3RhbCwgY3JpdGljYWwsIGhpZ2gsIHJlc29sdmVkLCBvdmVyZHVlIH07XG4gICAgfSwgW2ZpbHRlcmVkRGF0YV0pO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChzZWxlY3RlZFNvdXJjZVByb2ZpbGUpXG4gICAgICAgICAgICBsb2FkRGF0YSgpO1xuICAgIH0sIFtzZWxlY3RlZFNvdXJjZVByb2ZpbGUsIGxvYWREYXRhXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YTogZmlsdGVyZWREYXRhLFxuICAgICAgICBjb2x1bW5zLFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBmaWx0ZXJzLFxuICAgICAgICBmaWx0ZXJPcHRpb25zLFxuICAgICAgICB1cGRhdGVGaWx0ZXIsXG4gICAgICAgIGNsZWFyRmlsdGVycyxcbiAgICAgICAgc2VsZWN0ZWRSaXNrcyxcbiAgICAgICAgc2V0U2VsZWN0ZWRSaXNrcyxcbiAgICAgICAgbG9hZERhdGEsXG4gICAgICAgIHN0YXRzLFxuICAgICAgICBzZWxlY3RlZFByb2ZpbGU6IHNlbGVjdGVkU291cmNlUHJvZmlsZSxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFJpc2sgQXNzZXNzbWVudCBWaWV3XG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBbGVydFRyaWFuZ2xlLCBSZWZyZXNoQ3csIERvd25sb2FkLCBGaWx0ZXIsIFggfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgdXNlUmlza0Fzc2Vzc21lbnRMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZVJpc2tBc3Nlc3NtZW50TG9naWMnO1xuaW1wb3J0IHsgVmlydHVhbGl6ZWREYXRhR3JpZCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgSW5wdXQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0lucHV0JztcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvU2VsZWN0JztcbmNvbnN0IFJpc2tBc3Nlc3NtZW50VmlldyA9ICgpID0+IHtcbiAgICBjb25zdCB7IGRhdGEsIGNvbHVtbnMsIGlzTG9hZGluZywgZXJyb3IsIGZpbHRlcnMsIGZpbHRlck9wdGlvbnMsIHVwZGF0ZUZpbHRlciwgY2xlYXJGaWx0ZXJzLCBzZWxlY3RlZFJpc2tzLCBzZXRTZWxlY3RlZFJpc2tzLCBsb2FkRGF0YSwgc3RhdHMsIHNlbGVjdGVkUHJvZmlsZSwgfSA9IHVzZVJpc2tBc3Nlc3NtZW50TG9naWMoKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImgtZnVsbCBmbGV4IGZsZXgtY29sIGJnLWdyYXktNTAgZGFyazpiZy1ncmF5LTkwMFwiLCBcImRhdGEtY3lcIjogXCJyaXNrLWFzc2Vzc21lbnQtdmlld1wiLCBcImRhdGEtdGVzdGlkXCI6IFwicmlzay1hc3Nlc3NtZW50LXZpZXdcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KEFsZXJ0VHJpYW5nbGUsIHsgY2xhc3NOYW1lOiBcInctOCBoLTggdGV4dC1vcmFuZ2UtNjAwIGRhcms6dGV4dC1vcmFuZ2UtNDAwXCIgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIlJpc2sgQXNzZXNzbWVudFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIklkZW50aWZ5IGFuZCB0cmFjayBzZWN1cml0eSByaXNrc1wiIH0pXSB9KV0gfSksIHNlbGVjdGVkUHJvZmlsZSAmJiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBbXCJQcm9maWxlOiBcIiwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZFwiLCBjaGlsZHJlbjogc2VsZWN0ZWRQcm9maWxlLm5hbWUgfSldIH0pXSB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImdyaWQgZ3JpZC1jb2xzLTIgbWQ6Z3JpZC1jb2xzLTUgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy1ibHVlLTUwIGRhcms6YmctYmx1ZS05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ibHVlLTYwMCBkYXJrOnRleHQtYmx1ZS00MDAgZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiVG90YWwgUmlza3NcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ibHVlLTkwMCBkYXJrOnRleHQtYmx1ZS0xMDBcIiwgY2hpbGRyZW46IHN0YXRzPy50b3RhbCA/PyAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctcmVkLTUwIGRhcms6YmctcmVkLTkwMC8yMCByb3VuZGVkLWxnIHAtNFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LXJlZC02MDAgZGFyazp0ZXh0LXJlZC00MDAgZm9udC1tZWRpdW1cIiwgY2hpbGRyZW46IFwiQ3JpdGljYWxcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1yZWQtOTAwIGRhcms6dGV4dC1yZWQtMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8uY3JpdGljYWwgPz8gMCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLW9yYW5nZS01MCBkYXJrOmJnLW9yYW5nZS05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1vcmFuZ2UtNjAwIGRhcms6dGV4dC1vcmFuZ2UtNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIkhpZ2hcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1vcmFuZ2UtOTAwIGRhcms6dGV4dC1vcmFuZ2UtMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8uaGlnaCA/PyAwIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctZ3JlZW4tNTAgZGFyazpiZy1ncmVlbi05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmVlbi02MDAgZGFyazp0ZXh0LWdyZWVuLTQwMCBmb250LW1lZGl1bVwiLCBjaGlsZHJlbjogXCJSZXNvbHZlZFwiIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyZWVuLTkwMCBkYXJrOnRleHQtZ3JlZW4tMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8ucmVzb2x2ZWQgPz8gMCB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXllbGxvdy01MCBkYXJrOmJnLXllbGxvdy05MDAvMjAgcm91bmRlZC1sZyBwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC15ZWxsb3ctNjAwIGRhcms6dGV4dC15ZWxsb3ctNDAwIGZvbnQtbWVkaXVtXCIsIGNoaWxkcmVuOiBcIk92ZXJkdWVcIiB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC15ZWxsb3ctOTAwIGRhcms6dGV4dC15ZWxsb3ctMTAwXCIsIGNoaWxkcmVuOiBzdGF0cz8ub3ZlcmR1ZSA/PyAwIH0pXSB9KV0gfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zIG1iLTNcIiwgY2hpbGRyZW46IFtfanN4KEZpbHRlciwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiIH0pLCBfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSksIChmaWx0ZXJzLnJpc2tMZXZlbCB8fCBmaWx0ZXJzLmNhdGVnb3J5IHx8IGZpbHRlcnMuc3RhdHVzIHx8IGZpbHRlcnMub3duZXIgfHwgZmlsdGVycy5zZWFyY2hUZXh0KSAmJiAoX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJnaG9zdFwiLCBzaXplOiBcInNtXCIsIGljb246IF9qc3goWCwgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiBjbGVhckZpbHRlcnMsIFwiZGF0YS1jeVwiOiBcImNsZWFyLWZpbHRlcnMtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJjbGVhci1maWx0ZXJzLWJ0blwiLCBjaGlsZHJlbjogXCJDbGVhciBBbGxcIiB9KSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy01IGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChJbnB1dCwgeyBwbGFjZWhvbGRlcjogXCJTZWFyY2ggcmlza3MuLi5cIiwgdmFsdWU6IGZpbHRlcnMuc2VhcmNoVGV4dCwgb25DaGFuZ2U6IChlKSA9PiB1cGRhdGVGaWx0ZXIoJ3NlYXJjaFRleHQnLCBlLnRhcmdldC52YWx1ZSksIFwiZGF0YS1jeVwiOiBcInNlYXJjaC1pbnB1dFwiLCBcImRhdGEtdGVzdGlkXCI6IFwic2VhcmNoLWlucHV0XCIgfSksIF9qc3goU2VsZWN0LCB7IHZhbHVlOiBmaWx0ZXJzLnJpc2tMZXZlbCwgb25DaGFuZ2U6ICh2YWx1ZSkgPT4gdXBkYXRlRmlsdGVyKCdyaXNrTGV2ZWwnLCB2YWx1ZSksIFwiZGF0YS1jeVwiOiBcInJpc2stbGV2ZWwtc2VsZWN0XCIsIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ0FsbCBSaXNrIExldmVscycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihmaWx0ZXJPcHRpb25zPy5yaXNrTGV2ZWxzID8/IFtdKS5tYXAoKHJsKSA9PiAoeyB2YWx1ZTogcmwsIGxhYmVsOiBybCB9KSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSB9KSwgX2pzeChTZWxlY3QsIHsgdmFsdWU6IGZpbHRlcnMuY2F0ZWdvcnksIG9uQ2hhbmdlOiAodmFsdWUpID0+IHVwZGF0ZUZpbHRlcignY2F0ZWdvcnknLCB2YWx1ZSksIFwiZGF0YS1jeVwiOiBcImNhdGVnb3J5LXNlbGVjdFwiLCBcImRhdGEtdGVzdGlkXCI6IFwiY2F0ZWdvcnktc2VsZWN0XCIsIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ0FsbCBDYXRlZ29yaWVzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGZpbHRlck9wdGlvbnM/LmNhdGVnb3JpZXMgPz8gW10pLm1hcCgoY2F0KSA9PiAoeyB2YWx1ZTogY2F0LCBsYWJlbDogY2F0IH0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdIH0pLCBfanN4KFNlbGVjdCwgeyB2YWx1ZTogZmlsdGVycy5zdGF0dXMsIG9uQ2hhbmdlOiAodmFsdWUpID0+IHVwZGF0ZUZpbHRlcignc3RhdHVzJywgdmFsdWUpLCBcImRhdGEtY3lcIjogXCJzdGF0dXMtc2VsZWN0XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJzdGF0dXMtc2VsZWN0XCIsIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICcnLCBsYWJlbDogJ0FsbCBTdGF0dXNlcycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLihmaWx0ZXJPcHRpb25zPy5zdGF0dXNlcyA/PyBbXSkubWFwKChzdCkgPT4gKHsgdmFsdWU6IHN0LCBsYWJlbDogc3QgfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gfSksIF9qc3goU2VsZWN0LCB7IHZhbHVlOiBmaWx0ZXJzLm93bmVyLCBvbkNoYW5nZTogKHZhbHVlKSA9PiB1cGRhdGVGaWx0ZXIoJ293bmVyJywgdmFsdWUpLCBcImRhdGEtY3lcIjogXCJvd25lci1zZWxlY3RcIiwgXCJkYXRhLXRlc3RpZFwiOiBcIm93bmVyLXNlbGVjdFwiLCBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnJywgbGFiZWw6ICdBbGwgT3duZXJzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGZpbHRlck9wdGlvbnM/Lm93bmVycyA/PyBbXSkubWFwKChvd24pID0+ICh7IHZhbHVlOiBvd24sIGxhYmVsOiBvd24gfSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gfSldIH0pXSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTNcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiLCBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBpY29uOiBfanN4KFJlZnJlc2hDdywgeyBjbGFzc05hbWU6IFwidy00IGgtNFwiIH0pLCBvbkNsaWNrOiBsb2FkRGF0YSwgbG9hZGluZzogaXNMb2FkaW5nLCBcImRhdGEtY3lcIjogXCJyZWZyZXNoLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwicmVmcmVzaC1idG5cIiwgY2hpbGRyZW46IFwiUmVmcmVzaFwiIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGRpc2FibGVkOiAoZGF0YT8ubGVuZ3RoID8/IDApID09PSAwLCBcImRhdGEtY3lcIjogXCJleHBvcnQtYnRuXCIsIGNoaWxkcmVuOiBcIkV4cG9ydCBSaXNrIFJlcG9ydFwiIH0pXSB9KSB9KSwgZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibXgtNiBtdC00IHAtNCBiZy1yZWQtNTAgZGFyazpiZy1yZWQtOTAwLzIwIGJvcmRlciBib3JkZXItcmVkLTIwMCBkYXJrOmJvcmRlci1yZWQtODAwIHJvdW5kZWQtbWRcIiwgY2hpbGRyZW46IF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1yZWQtODAwIGRhcms6dGV4dC1yZWQtMjAwXCIsIGNoaWxkcmVuOiBlcnJvciB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIG92ZXJmbG93LWhpZGRlbiBwLTZcIiwgY2hpbGRyZW46IF9qc3goVmlydHVhbGl6ZWREYXRhR3JpZCwgeyBkYXRhOiBkYXRhLCBjb2x1bW5zOiBjb2x1bW5zLCBsb2FkaW5nOiBpc0xvYWRpbmcsIGVuYWJsZVNlbGVjdGlvbjogdHJ1ZSwgc2VsZWN0aW9uTW9kZTogXCJtdWx0aXBsZVwiLCBvblNlbGVjdGlvbkNoYW5nZTogc2V0U2VsZWN0ZWRSaXNrcywgaGVpZ2h0OiBcImNhbGMoMTAwdmggLSA1MDBweClcIiB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFJpc2tBc3Nlc3NtZW50VmlldztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBGcmFnbWVudCBhcyBfRnJhZ21lbnQsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogVmlydHVhbGl6ZWREYXRhR3JpZCBDb21wb25lbnRcbiAqXG4gKiBFbnRlcnByaXNlLWdyYWRlIGRhdGEgZ3JpZCB1c2luZyBBRyBHcmlkIEVudGVycHJpc2VcbiAqIEhhbmRsZXMgMTAwLDAwMCsgcm93cyB3aXRoIHZpcnR1YWwgc2Nyb2xsaW5nIGF0IDYwIEZQU1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWdHcmlkUmVhY3QgfSBmcm9tICdhZy1ncmlkLXJlYWN0JztcbmltcG9ydCAnYWctZ3JpZC1lbnRlcnByaXNlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IERvd25sb2FkLCBQcmludGVyLCBFeWUsIEV5ZU9mZiwgRmlsdGVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vYXRvbXMvU3Bpbm5lcic7XG4vLyBMYXp5IGxvYWQgQUcgR3JpZCBDU1MgLSBvbmx5IGxvYWQgb25jZSB3aGVuIGZpcnN0IGdyaWQgbW91bnRzXG5sZXQgYWdHcmlkU3R5bGVzTG9hZGVkID0gZmFsc2U7XG5jb25zdCBsb2FkQWdHcmlkU3R5bGVzID0gKCkgPT4ge1xuICAgIGlmIChhZ0dyaWRTdHlsZXNMb2FkZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgQUcgR3JpZCBzdHlsZXNcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy1ncmlkLmNzcycpO1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLXRoZW1lLWFscGluZS5jc3MnKTtcbiAgICBhZ0dyaWRTdHlsZXNMb2FkZWQgPSB0cnVlO1xufTtcbi8qKlxuICogSGlnaC1wZXJmb3JtYW5jZSBkYXRhIGdyaWQgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcih7IGRhdGEsIGNvbHVtbnMsIGxvYWRpbmcgPSBmYWxzZSwgdmlydHVhbFJvd0hlaWdodCA9IDMyLCBlbmFibGVDb2x1bW5SZW9yZGVyID0gdHJ1ZSwgZW5hYmxlQ29sdW1uUmVzaXplID0gdHJ1ZSwgZW5hYmxlRXhwb3J0ID0gdHJ1ZSwgZW5hYmxlUHJpbnQgPSB0cnVlLCBlbmFibGVHcm91cGluZyA9IGZhbHNlLCBlbmFibGVGaWx0ZXJpbmcgPSB0cnVlLCBlbmFibGVTZWxlY3Rpb24gPSB0cnVlLCBzZWxlY3Rpb25Nb2RlID0gJ211bHRpcGxlJywgcGFnaW5hdGlvbiA9IHRydWUsIHBhZ2luYXRpb25QYWdlU2l6ZSA9IDEwMCwgb25Sb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2UsIGNsYXNzTmFtZSwgaGVpZ2h0ID0gJzYwMHB4JywgJ2RhdGEtY3knOiBkYXRhQ3ksIH0sIHJlZikge1xuICAgIGNvbnN0IGdyaWRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW2dyaWRBcGksIHNldEdyaWRBcGldID0gUmVhY3QudXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCByb3dEYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGEgPz8gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVmlydHVhbGl6ZWREYXRhR3JpZF0gcm93RGF0YSBjb21wdXRlZDonLCByZXN1bHQubGVuZ3RoLCAncm93cycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhXSk7XG4gICAgLy8gTG9hZCBBRyBHcmlkIHN0eWxlcyBvbiBjb21wb25lbnQgbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkQWdHcmlkU3R5bGVzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIERlZmF1bHQgY29sdW1uIGRlZmluaXRpb25cbiAgICBjb25zdCBkZWZhdWx0Q29sRGVmID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIHJlc2l6YWJsZTogZW5hYmxlQ29sdW1uUmVzaXplLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgIH0pLCBbZW5hYmxlRmlsdGVyaW5nLCBlbmFibGVDb2x1bW5SZXNpemVdKTtcbiAgICAvLyBHcmlkIG9wdGlvbnNcbiAgICBjb25zdCBncmlkT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgcm93SGVpZ2h0OiB2aXJ0dWFsUm93SGVpZ2h0LFxuICAgICAgICBoZWFkZXJIZWlnaHQ6IDQwLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IDQwLFxuICAgICAgICBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiAhZW5hYmxlU2VsZWN0aW9uLFxuICAgICAgICByb3dTZWxlY3Rpb246IGVuYWJsZVNlbGVjdGlvbiA/IHNlbGVjdGlvbk1vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgIGFuaW1hdGVSb3dzOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IERpc2FibGUgY2hhcnRzIHRvIGF2b2lkIGVycm9yICMyMDAgKHJlcXVpcmVzIEludGVncmF0ZWRDaGFydHNNb2R1bGUpXG4gICAgICAgIGVuYWJsZUNoYXJ0czogZmFsc2UsXG4gICAgICAgIC8vIEZJWDogVXNlIGNlbGxTZWxlY3Rpb24gaW5zdGVhZCBvZiBkZXByZWNhdGVkIGVuYWJsZVJhbmdlU2VsZWN0aW9uXG4gICAgICAgIGNlbGxTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIC8vIEZJWDogVXNlIGxlZ2FjeSB0aGVtZSB0byBwcmV2ZW50IHRoZW1pbmcgQVBJIGNvbmZsaWN0IChlcnJvciAjMjM5KVxuICAgICAgICAvLyBNdXN0IGJlIHNldCB0byAnbGVnYWN5JyB0byB1c2UgdjMyIHN0eWxlIHRoZW1lcyB3aXRoIENTUyBmaWxlc1xuICAgICAgICB0aGVtZTogJ2xlZ2FjeScsXG4gICAgICAgIHN0YXR1c0Jhcjoge1xuICAgICAgICAgICAgc3RhdHVzUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnVG90YWxBbmRGaWx0ZXJlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1NlbGVjdGVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2NlbnRlcicgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdBZ2dyZWdhdGlvbkNvbXBvbmVudCcsIGFsaWduOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBzaWRlQmFyOiBlbmFibGVHcm91cGluZ1xuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdG9vbFBhbmVsczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnQ29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdDb2x1bW5zVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdmaWx0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdGaWx0ZXJzVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRUb29sUGFuZWw6ICcnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICB9KSwgW3ZpcnR1YWxSb3dIZWlnaHQsIGVuYWJsZVNlbGVjdGlvbiwgc2VsZWN0aW9uTW9kZSwgZW5hYmxlR3JvdXBpbmddKTtcbiAgICAvLyBIYW5kbGUgZ3JpZCByZWFkeSBldmVudFxuICAgIGNvbnN0IG9uR3JpZFJlYWR5ID0gdXNlQ2FsbGJhY2soKHBhcmFtcykgPT4ge1xuICAgICAgICBzZXRHcmlkQXBpKHBhcmFtcy5hcGkpO1xuICAgICAgICBwYXJhbXMuYXBpLnNpemVDb2x1bW5zVG9GaXQoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSGFuZGxlIHJvdyBjbGlja1xuICAgIGNvbnN0IGhhbmRsZVJvd0NsaWNrID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblJvd0NsaWNrICYmIGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIG9uUm93Q2xpY2soZXZlbnQuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCBbb25Sb3dDbGlja10pO1xuICAgIC8vIEhhbmRsZSBzZWxlY3Rpb24gY2hhbmdlXG4gICAgY29uc3QgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblNlbGVjdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3dzID0gZXZlbnQuYXBpLmdldFNlbGVjdGVkUm93cygpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2Uoc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblNlbGVjdGlvbkNoYW5nZV0pO1xuICAgIC8vIEV4cG9ydCB0byBDU1ZcbiAgICBjb25zdCBleHBvcnRUb0NzdiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzQ3N2KHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0uY3N2YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBFeHBvcnQgdG8gRXhjZWxcbiAgICBjb25zdCBleHBvcnRUb0V4Y2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNFeGNlbCh7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9Lnhsc3hgLFxuICAgICAgICAgICAgICAgIHNoZWV0TmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFByaW50IGdyaWRcbiAgICBjb25zdCBwcmludEdyaWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsICdwcmludCcpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnByaW50KCk7XG4gICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5IHBhbmVsXG4gICAgY29uc3QgdG9nZ2xlQ29sdW1uUGFuZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNob3dDb2x1bW5QYW5lbCghc2hvd0NvbHVtblBhbmVsKTtcbiAgICB9LCBbc2hvd0NvbHVtblBhbmVsXSk7XG4gICAgLy8gQXV0by1zaXplIGFsbCBjb2x1bW5zXG4gICAgY29uc3QgYXV0b1NpemVDb2x1bW5zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sdW1uSWRzID0gY29sdW1ucy5tYXAoYyA9PiBjLmZpZWxkKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICBncmlkQXBpLmF1dG9TaXplQ29sdW1ucyhhbGxDb2x1bW5JZHMpO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGksIGNvbHVtbnNdKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdmbGV4IGZsZXgtY29sIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBzaGFkb3ctc20nLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyByZWY6IHJlZiwgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogbG9hZGluZyA/IChfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJzbVwiIH0pKSA6IChgJHtyb3dEYXRhLmxlbmd0aC50b0xvY2FsZVN0cmluZygpfSByb3dzYCkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbZW5hYmxlRmlsdGVyaW5nICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChGaWx0ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHNldEZsb2F0aW5nRmlsdGVyc0hlaWdodCBpcyBkZXByZWNhdGVkIGluIEFHIEdyaWQgdjM0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9hdGluZyBmaWx0ZXJzIGFyZSBub3cgY29udHJvbGxlZCB0aHJvdWdoIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdGaWx0ZXIgdG9nZ2xlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIEFHIEdyaWQgdjM0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRpdGxlOiBcIlRvZ2dsZSBmaWx0ZXJzXCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1maWx0ZXJzXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBzaG93Q29sdW1uUGFuZWwgPyBfanN4KEV5ZU9mZiwgeyBzaXplOiAxNiB9KSA6IF9qc3goRXllLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiB0b2dnbGVDb2x1bW5QYW5lbCwgdGl0bGU6IFwiVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5XCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1jb2x1bW5zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbnNcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IGF1dG9TaXplQ29sdW1ucywgdGl0bGU6IFwiQXV0by1zaXplIGNvbHVtbnNcIiwgXCJkYXRhLWN5XCI6IFwiYXV0by1zaXplXCIsIGNoaWxkcmVuOiBcIkF1dG8gU2l6ZVwiIH0pLCBlbmFibGVFeHBvcnQgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0NzdiwgdGl0bGU6IFwiRXhwb3J0IHRvIENTVlwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtY3N2XCIsIGNoaWxkcmVuOiBcIkNTVlwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9FeGNlbCwgdGl0bGU6IFwiRXhwb3J0IHRvIEV4Y2VsXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbFwiLCBjaGlsZHJlbjogXCJFeGNlbFwiIH0pXSB9KSksIGVuYWJsZVByaW50ICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChQcmludGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBwcmludEdyaWQsIHRpdGxlOiBcIlByaW50XCIsIFwiZGF0YS1jeVwiOiBcInByaW50XCIsIGNoaWxkcmVuOiBcIlByaW50XCIgfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSByZWxhdGl2ZVwiLCBjaGlsZHJlbjogW2xvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBcImRhdGEtdGVzdGlkXCI6IFwiZ3JpZC1sb2FkaW5nXCIsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkxvYWRpbmcgZGF0YVwiLCBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSBiZy1vcGFjaXR5LTc1IGRhcms6YmctZ3JheS05MDAgZGFyazpiZy1vcGFjaXR5LTc1IHotMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goU3Bpbm5lciwgeyBzaXplOiBcImxnXCIsIGxhYmVsOiBcIkxvYWRpbmcgZGF0YS4uLlwiIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnYWctdGhlbWUtYWxwaW5lJywgJ2Rhcms6YWctdGhlbWUtYWxwaW5lLWRhcmsnLCAndy1mdWxsJyksIHN0eWxlOiB7IGhlaWdodCB9LCBjaGlsZHJlbjogX2pzeChBZ0dyaWRSZWFjdCwgeyByZWY6IGdyaWRSZWYsIHJvd0RhdGE6IHJvd0RhdGEsIGNvbHVtbkRlZnM6IGNvbHVtbnMsIGRlZmF1bHRDb2xEZWY6IGRlZmF1bHRDb2xEZWYsIGdyaWRPcHRpb25zOiBncmlkT3B0aW9ucywgb25HcmlkUmVhZHk6IG9uR3JpZFJlYWR5LCBvblJvd0NsaWNrZWQ6IGhhbmRsZVJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZWQ6IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSwgcm93QnVmZmVyOiAyMCwgcm93TW9kZWxUeXBlOiBcImNsaWVudFNpZGVcIiwgcGFnaW5hdGlvbjogcGFnaW5hdGlvbiwgcGFnaW5hdGlvblBhZ2VTaXplOiBwYWdpbmF0aW9uUGFnZVNpemUsIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGZhbHNlLCBzdXBwcmVzc0NlbGxGb2N1czogZmFsc2UsIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiB0cnVlLCBlbnN1cmVEb21PcmRlcjogdHJ1ZSB9KSB9KSwgc2hvd0NvbHVtblBhbmVsICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctNjQgaC1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWwgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNCBvdmVyZmxvdy15LWF1dG8gei0yMFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtc20gbWItM1wiLCBjaGlsZHJlbjogXCJDb2x1bW4gVmlzaWJpbGl0eVwiIH0pLCBjb2x1bW5zLm1hcCgoY29sKSA9PiAoX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweS0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjbGFzc05hbWU6IFwicm91bmRlZFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZSwgb25DaGFuZ2U6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmlkQXBpICYmIGNvbC5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRDb2x1bW5zVmlzaWJsZShbY29sLmZpZWxkXSwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBjb2wuaGVhZGVyTmFtZSB8fCBjb2wuZmllbGQgfSldIH0sIGNvbC5maWVsZCkpKV0gfSkpXSB9KV0gfSkpO1xufVxuZXhwb3J0IGNvbnN0IFZpcnR1YWxpemVkRGF0YUdyaWQgPSBSZWFjdC5mb3J3YXJkUmVmKFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcik7XG4vLyBTZXQgZGlzcGxheU5hbWUgZm9yIFJlYWN0IERldlRvb2xzXG5WaXJ0dWFsaXplZERhdGFHcmlkLmRpc3BsYXlOYW1lID0gJ1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9