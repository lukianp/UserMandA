"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[1321],{

/***/ 21321:
/*!****************************************************************!*\
  !*** ./src/renderer/views/reports/ReportsView.tsx + 1 modules ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ reports_ReportsView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
;// ./src/renderer/hooks/useReportsLogic.ts
/**
 * Reports View Logic Hook
 * Report generation and management
 */

const useReportsLogic = () => {
    const [templates] = (0,react.useState)([
        {
            id: 'user-summary',
            name: 'User Summary Report',
            description: 'Summary of all discovered users with key metrics',
            category: 'Users',
            format: 'PDF',
            parameters: {},
        },
        {
            id: 'group-membership',
            name: 'Group Membership Report',
            description: 'Detailed group membership and permissions',
            category: 'Groups',
            format: 'Excel',
            parameters: {},
        },
        {
            id: 'migration-readiness',
            name: 'Migration Readiness Report',
            description: 'Assessment of migration readiness and blockers',
            category: 'Migration',
            format: 'PDF',
            parameters: {},
        },
        {
            id: 'license-usage',
            name: 'License Usage Report',
            description: 'Current license allocation and usage statistics',
            category: 'Licensing',
            format: 'Excel',
            parameters: {},
        },
    ]);
    const [generatingReports, setGeneratingReports] = (0,react.useState)(new Set());
    const [searchText, setSearchText] = (0,react.useState)('');
    const [filterCategory, setFilterCategory] = (0,react.useState)('all');
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = !searchText ||
            (template.name ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
            (template.description ?? '').toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
        return matchesSearch && matchesCategory;
    });
    const generateReport = (0,react.useCallback)(async (templateId) => {
        setGeneratingReports(prev => new Set(prev).add(templateId));
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Reporting/ReportGeneration.psm1',
                functionName: 'New-Report',
                parameters: {
                    TemplateId: templateId,
                },
            });
            if (result.success) {
                // Report generated successfully
                console.log('Report generated:', result.data.outputPath);
            }
        }
        catch (error) {
            console.error('Failed to generate report:', error);
        }
        finally {
            setGeneratingReports(prev => {
                const next = new Set(prev);
                next.delete(templateId);
                return next;
            });
        }
    }, []);
    return {
        templates: filteredTemplates,
        generatingReports,
        searchText,
        setSearchText,
        filterCategory,
        setFilterCategory,
        generateReport,
    };
};

// EXTERNAL MODULE: ./src/renderer/components/molecules/SearchBar.tsx
var SearchBar = __webpack_require__(53404);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Select.tsx
var Select = __webpack_require__(1156);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Badge.tsx
var Badge = __webpack_require__(61315);
;// ./src/renderer/views/reports/ReportsView.tsx

/**
 * Reports View
 * Report templates and generation
 */







const ReportsView = () => {
    const { templates, generatingReports, searchText, setSearchText, filterCategory, setFilterCategory, generateReport, } = useReportsLogic();
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "reports-view", "data-testid": "reports-view", children: [(0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(lucide_react.FileText, { className: "w-8 h-8 text-indigo-600 dark:text-indigo-400" }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Reports" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Generate reports from discovery and migration data" })] })] }) }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-4", children: [(0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(SearchBar["default"], { value: searchText, onChange: setSearchText, placeholder: "Search report templates...", "data-cy": "reports-search", "data-testid": "reports-search" }) }), (0,jsx_runtime.jsx)("div", { className: "w-48", children: (0,jsx_runtime.jsx)(Select.Select, { value: filterCategory, onChange: setFilterCategory, options: [
                                    { value: 'all', label: 'All Categories' },
                                    { value: 'Users', label: 'Users' },
                                    { value: 'Groups', label: 'Groups' },
                                    { value: 'Migration', label: 'Migration' },
                                    { value: 'Licensing', label: 'Licensing' },
                                ], "data-cy": "category-filter", "data-testid": "category-filter" }) })] }) }), (0,jsx_runtime.jsx)("div", { className: "flex-1 overflow-auto p-6", children: (0,jsx_runtime.jsxs)("div", { className: "max-w-7xl mx-auto", children: [(0,jsx_runtime.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: templates?.map((template) => {
                                const isGenerating = generatingReports.has(template.id);
                                return ((0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow", "data-cy": `report-card-${template.id}`, children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-start justify-between mb-3", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react.FileText, { className: "w-5 h-5 text-indigo-600 dark:text-indigo-400" }), (0,jsx_runtime.jsx)(Badge["default"], { variant: "default", children: template.format })] }), (0,jsx_runtime.jsx)(Badge["default"], { children: template.category })] }), (0,jsx_runtime.jsx)("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-2", children: template.name }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: template.description }), (0,jsx_runtime.jsx)(Button.Button, { variant: "primary", onClick: () => generateReport(template.id), disabled: isGenerating, loading: isGenerating, icon: isGenerating ? (0,jsx_runtime.jsx)(lucide_react.Loader2, { className: "w-4 h-4 animate-spin" }) : (0,jsx_runtime.jsx)(lucide_react.Download, { className: "w-4 h-4" }), className: "w-full", "data-cy": `generate-btn-${template.id}`, children: isGenerating ? 'Generating...' : 'Generate Report' })] }, template.id));
                            }) }), templates.length === 0 && ((0,jsx_runtime.jsxs)("div", { className: "text-center py-12", children: [(0,jsx_runtime.jsx)(lucide_react.FileText, { className: "w-16 h-16 text-gray-400 mx-auto mb-4" }), (0,jsx_runtime.jsx)("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "No report templates found" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Try adjusting your search or filter criteria" })] }))] }) })] }));
};
/* harmony default export */ const reports_ReportsView = (ReportsView);


/***/ }),

/***/ 53404:
/*!*********************************************************!*\
  !*** ./src/renderer/components/molecules/SearchBar.tsx ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SearchBar: () => (/* binding */ SearchBar),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lucide-react */ 72832);

/**
 * SearchBar Component
 *
 * Search input with icon, clear button, and debounced onChange.
 * Used for filtering lists and tables.
 */



/**
 * SearchBar Component
 */
const SearchBar = ({ value: controlledValue = '', onChange, placeholder = 'Search...', debounceDelay = 300, disabled = false, size = 'md', className, 'data-cy': dataCy, }) => {
    const [inputValue, setInputValue] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(controlledValue);
    // Sync with controlled value
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        setInputValue(controlledValue);
    }, [controlledValue]);
    // Debounced onChange
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        const handler = setTimeout(() => {
            if (onChange && inputValue !== controlledValue) {
                onChange(inputValue);
            }
        }, debounceDelay);
        return () => {
            clearTimeout(handler);
        };
    }, [inputValue, onChange, debounceDelay, controlledValue]);
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };
    const handleClear = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
        setInputValue('');
        if (onChange) {
            onChange('');
        }
    }, [onChange]);
    // Size classes
    const sizeClasses = {
        sm: 'h-8 text-sm px-3',
        md: 'h-10 text-base px-4',
        lg: 'h-12 text-lg px-5',
    };
    const iconSizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('relative flex items-center', className);
    const inputClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)(
    // Base styles
    'w-full rounded-lg border border-gray-300', 'pl-10 pr-10', 'bg-white text-gray-900 placeholder-gray-400', 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500', 'transition-all duration-200', 
    // Size
    sizeClasses[size], 
    // Disabled
    {
        'bg-gray-100 text-gray-500 cursor-not-allowed': disabled,
    });
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.Search, { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('absolute left-3 text-gray-400 pointer-events-none', iconSizeClasses[size]), "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "text", value: inputValue, onChange: handleInputChange, placeholder: placeholder, disabled: disabled, className: inputClasses, "aria-label": "Search" }), inputValue && !disabled && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { type: "button", onClick: handleClear, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('absolute right-3', 'text-gray-400 hover:text-gray-600', 'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded', 'transition-colors duration-200'), "aria-label": "Clear search", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: iconSizeClasses[size] }) }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SearchBar);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSx1REFBSyxXQUFXLDRGQUE0RixzREFBSSxXQUFXLFdBQVcsMENBQUksb0ZBQW9GLElBQUksc0RBQUksV0FBVyxvQkFBb0IseUNBQXlDLHNEQUFJLFdBQVcsV0FBVywwQ0FBSSxvRkFBb0YsOEJBQThCLHNEQUFJLGFBQWEsOENBQThDLDBDQUFJO0FBQzdnQjtBQUNBO0FBQ0EsaUJBQWlCLHFDQUFxQyxzREFBSSxVQUFVLFdBQVcsMENBQUk7QUFDbkY7QUFDQTtBQUNBLHFCQUFxQix5REFBeUQsc0RBQUksV0FBVyxtUEFBbVAsR0FBRyxHQUFHLEtBQUs7QUFDM1Y7QUFDQSxpRUFBZSxLQUFLLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VSZXBvcnRzTG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdmlld3MvcmVwb3J0cy9SZXBvcnRzVmlldy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvU2VhcmNoQmFyLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0JhZGdlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFJlcG9ydHMgVmlldyBMb2dpYyBIb29rXG4gKiBSZXBvcnQgZ2VuZXJhdGlvbiBhbmQgbWFuYWdlbWVudFxuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5leHBvcnQgY29uc3QgdXNlUmVwb3J0c0xvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IFt0ZW1wbGF0ZXNdID0gdXNlU3RhdGUoW1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ3VzZXItc3VtbWFyeScsXG4gICAgICAgICAgICBuYW1lOiAnVXNlciBTdW1tYXJ5IFJlcG9ydCcsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1N1bW1hcnkgb2YgYWxsIGRpc2NvdmVyZWQgdXNlcnMgd2l0aCBrZXkgbWV0cmljcycsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ1VzZXJzJyxcbiAgICAgICAgICAgIGZvcm1hdDogJ1BERicsXG4gICAgICAgICAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdncm91cC1tZW1iZXJzaGlwJyxcbiAgICAgICAgICAgIG5hbWU6ICdHcm91cCBNZW1iZXJzaGlwIFJlcG9ydCcsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0RldGFpbGVkIGdyb3VwIG1lbWJlcnNoaXAgYW5kIHBlcm1pc3Npb25zJyxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnR3JvdXBzJyxcbiAgICAgICAgICAgIGZvcm1hdDogJ0V4Y2VsJyxcbiAgICAgICAgICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ21pZ3JhdGlvbi1yZWFkaW5lc3MnLFxuICAgICAgICAgICAgbmFtZTogJ01pZ3JhdGlvbiBSZWFkaW5lc3MgUmVwb3J0JyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQXNzZXNzbWVudCBvZiBtaWdyYXRpb24gcmVhZGluZXNzIGFuZCBibG9ja2VycycsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ01pZ3JhdGlvbicsXG4gICAgICAgICAgICBmb3JtYXQ6ICdQREYnLFxuICAgICAgICAgICAgcGFyYW1ldGVyczoge30sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnbGljZW5zZS11c2FnZScsXG4gICAgICAgICAgICBuYW1lOiAnTGljZW5zZSBVc2FnZSBSZXBvcnQnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDdXJyZW50IGxpY2Vuc2UgYWxsb2NhdGlvbiBhbmQgdXNhZ2Ugc3RhdGlzdGljcycsXG4gICAgICAgICAgICBjYXRlZ29yeTogJ0xpY2Vuc2luZycsXG4gICAgICAgICAgICBmb3JtYXQ6ICdFeGNlbCcsXG4gICAgICAgICAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICAgICAgfSxcbiAgICBdKTtcbiAgICBjb25zdCBbZ2VuZXJhdGluZ1JlcG9ydHMsIHNldEdlbmVyYXRpbmdSZXBvcnRzXSA9IHVzZVN0YXRlKG5ldyBTZXQoKSk7XG4gICAgY29uc3QgW3NlYXJjaFRleHQsIHNldFNlYXJjaFRleHRdID0gdXNlU3RhdGUoJycpO1xuICAgIGNvbnN0IFtmaWx0ZXJDYXRlZ29yeSwgc2V0RmlsdGVyQ2F0ZWdvcnldID0gdXNlU3RhdGUoJ2FsbCcpO1xuICAgIGNvbnN0IGZpbHRlcmVkVGVtcGxhdGVzID0gdGVtcGxhdGVzLmZpbHRlcih0ZW1wbGF0ZSA9PiB7XG4gICAgICAgIGNvbnN0IG1hdGNoZXNTZWFyY2ggPSAhc2VhcmNoVGV4dCB8fFxuICAgICAgICAgICAgKHRlbXBsYXRlLm5hbWUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpKSB8fFxuICAgICAgICAgICAgKHRlbXBsYXRlLmRlc2NyaXB0aW9uID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaFRleHQudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIGNvbnN0IG1hdGNoZXNDYXRlZ29yeSA9IGZpbHRlckNhdGVnb3J5ID09PSAnYWxsJyB8fCB0ZW1wbGF0ZS5jYXRlZ29yeSA9PT0gZmlsdGVyQ2F0ZWdvcnk7XG4gICAgICAgIHJldHVybiBtYXRjaGVzU2VhcmNoICYmIG1hdGNoZXNDYXRlZ29yeTtcbiAgICB9KTtcbiAgICBjb25zdCBnZW5lcmF0ZVJlcG9ydCA9IHVzZUNhbGxiYWNrKGFzeW5jICh0ZW1wbGF0ZUlkKSA9PiB7XG4gICAgICAgIHNldEdlbmVyYXRpbmdSZXBvcnRzKHByZXYgPT4gbmV3IFNldChwcmV2KS5hZGQodGVtcGxhdGVJZCkpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL1JlcG9ydGluZy9SZXBvcnRHZW5lcmF0aW9uLnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ05ldy1SZXBvcnQnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgVGVtcGxhdGVJZDogdGVtcGxhdGVJZCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAvLyBSZXBvcnQgZ2VuZXJhdGVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZXBvcnQgZ2VuZXJhdGVkOicsIHJlc3VsdC5kYXRhLm91dHB1dFBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGdlbmVyYXRlIHJlcG9ydDonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRHZW5lcmF0aW5nUmVwb3J0cyhwcmV2ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChwcmV2KTtcbiAgICAgICAgICAgICAgICBuZXh0LmRlbGV0ZSh0ZW1wbGF0ZUlkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW10pO1xuICAgIHJldHVybiB7XG4gICAgICAgIHRlbXBsYXRlczogZmlsdGVyZWRUZW1wbGF0ZXMsXG4gICAgICAgIGdlbmVyYXRpbmdSZXBvcnRzLFxuICAgICAgICBzZWFyY2hUZXh0LFxuICAgICAgICBzZXRTZWFyY2hUZXh0LFxuICAgICAgICBmaWx0ZXJDYXRlZ29yeSxcbiAgICAgICAgc2V0RmlsdGVyQ2F0ZWdvcnksXG4gICAgICAgIGdlbmVyYXRlUmVwb3J0LFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogUmVwb3J0cyBWaWV3XG4gKiBSZXBvcnQgdGVtcGxhdGVzIGFuZCBnZW5lcmF0aW9uXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBGaWxlVGV4dCwgRG93bmxvYWQsIExvYWRlcjIgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgdXNlUmVwb3J0c0xvZ2ljIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlUmVwb3J0c0xvZ2ljJztcbmltcG9ydCBTZWFyY2hCYXIgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9tb2xlY3VsZXMvU2VhcmNoQmFyJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvU2VsZWN0JztcbmltcG9ydCBCYWRnZSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0JhZGdlJztcbmNvbnN0IFJlcG9ydHNWaWV3ID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgdGVtcGxhdGVzLCBnZW5lcmF0aW5nUmVwb3J0cywgc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dCwgZmlsdGVyQ2F0ZWdvcnksIHNldEZpbHRlckNhdGVnb3J5LCBnZW5lcmF0ZVJlcG9ydCwgfSA9IHVzZVJlcG9ydHNMb2dpYygpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggZmxleC1jb2wgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIFwiZGF0YS1jeVwiOiBcInJlcG9ydHMtdmlld1wiLCBcImRhdGEtdGVzdGlkXCI6IFwicmVwb3J0cy12aWV3XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCIsIGNoaWxkcmVuOiBbX2pzeChGaWxlVGV4dCwgeyBjbGFzc05hbWU6IFwidy04IGgtOCB0ZXh0LWluZGlnby02MDAgZGFyazp0ZXh0LWluZGlnby00MDBcIiB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjaGlsZHJlbjogW19qc3goXCJoMVwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGVcIiwgY2hpbGRyZW46IFwiUmVwb3J0c1wiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIkdlbmVyYXRlIHJlcG9ydHMgZnJvbSBkaXNjb3ZlcnkgYW5kIG1pZ3JhdGlvbiBkYXRhXCIgfSldIH0pXSB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTNcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTFcIiwgY2hpbGRyZW46IF9qc3goU2VhcmNoQmFyLCB7IHZhbHVlOiBzZWFyY2hUZXh0LCBvbkNoYW5nZTogc2V0U2VhcmNoVGV4dCwgcGxhY2Vob2xkZXI6IFwiU2VhcmNoIHJlcG9ydCB0ZW1wbGF0ZXMuLi5cIiwgXCJkYXRhLWN5XCI6IFwicmVwb3J0cy1zZWFyY2hcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInJlcG9ydHMtc2VhcmNoXCIgfSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidy00OFwiLCBjaGlsZHJlbjogX2pzeChTZWxlY3QsIHsgdmFsdWU6IGZpbHRlckNhdGVnb3J5LCBvbkNoYW5nZTogc2V0RmlsdGVyQ2F0ZWdvcnksIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdhbGwnLCBsYWJlbDogJ0FsbCBDYXRlZ29yaWVzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ1VzZXJzJywgbGFiZWw6ICdVc2VycycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdHcm91cHMnLCBsYWJlbDogJ0dyb3VwcycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdNaWdyYXRpb24nLCBsYWJlbDogJ01pZ3JhdGlvbicgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdMaWNlbnNpbmcnLCBsYWJlbDogJ0xpY2Vuc2luZycgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgXCJkYXRhLWN5XCI6IFwiY2F0ZWdvcnktZmlsdGVyXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJjYXRlZ29yeS1maWx0ZXJcIiB9KSB9KV0gfSkgfSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIG92ZXJmbG93LWF1dG8gcC02XCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJtYXgtdy03eGwgbXgtYXV0b1wiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBsZzpncmlkLWNvbHMtMyBnYXAtNlwiLCBjaGlsZHJlbjogdGVtcGxhdGVzPy5tYXAoKHRlbXBsYXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzR2VuZXJhdGluZyA9IGdlbmVyYXRpbmdSZXBvcnRzLmhhcyh0ZW1wbGF0ZS5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIHNoYWRvdy1tZCBwLTYgaG92ZXI6c2hhZG93LWxnIHRyYW5zaXRpb24tc2hhZG93XCIsIFwiZGF0YS1jeVwiOiBgcmVwb3J0LWNhcmQtJHt0ZW1wbGF0ZS5pZH1gLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtc3RhcnQganVzdGlmeS1iZXR3ZWVuIG1iLTNcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW19qc3goRmlsZVRleHQsIHsgY2xhc3NOYW1lOiBcInctNSBoLTUgdGV4dC1pbmRpZ28tNjAwIGRhcms6dGV4dC1pbmRpZ28tNDAwXCIgfSksIF9qc3goQmFkZ2UsIHsgdmFyaWFudDogXCJkZWZhdWx0XCIsIGNoaWxkcmVuOiB0ZW1wbGF0ZS5mb3JtYXQgfSldIH0pLCBfanN4KEJhZGdlLCB7IGNoaWxkcmVuOiB0ZW1wbGF0ZS5jYXRlZ29yeSB9KV0gfSksIF9qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgbWItMlwiLCBjaGlsZHJlbjogdGVtcGxhdGUubmFtZSB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCBtYi00XCIsIGNoaWxkcmVuOiB0ZW1wbGF0ZS5kZXNjcmlwdGlvbiB9KSwgX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJwcmltYXJ5XCIsIG9uQ2xpY2s6ICgpID0+IGdlbmVyYXRlUmVwb3J0KHRlbXBsYXRlLmlkKSwgZGlzYWJsZWQ6IGlzR2VuZXJhdGluZywgbG9hZGluZzogaXNHZW5lcmF0aW5nLCBpY29uOiBpc0dlbmVyYXRpbmcgPyBfanN4KExvYWRlcjIsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgYW5pbWF0ZS1zcGluXCIgfSkgOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00XCIgfSksIGNsYXNzTmFtZTogXCJ3LWZ1bGxcIiwgXCJkYXRhLWN5XCI6IGBnZW5lcmF0ZS1idG4tJHt0ZW1wbGF0ZS5pZH1gLCBjaGlsZHJlbjogaXNHZW5lcmF0aW5nID8gJ0dlbmVyYXRpbmcuLi4nIDogJ0dlbmVyYXRlIFJlcG9ydCcgfSldIH0sIHRlbXBsYXRlLmlkKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgfSksIHRlbXBsYXRlcy5sZW5ndGggPT09IDAgJiYgKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInRleHQtY2VudGVyIHB5LTEyXCIsIGNoaWxkcmVuOiBbX2pzeChGaWxlVGV4dCwgeyBjbGFzc05hbWU6IFwidy0xNiBoLTE2IHRleHQtZ3JheS00MDAgbXgtYXV0byBtYi00XCIgfSksIF9qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWxnIGZvbnQtbWVkaXVtIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlIG1iLTJcIiwgY2hpbGRyZW46IFwiTm8gcmVwb3J0IHRlbXBsYXRlcyBmb3VuZFwiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIlRyeSBhZGp1c3RpbmcgeW91ciBzZWFyY2ggb3IgZmlsdGVyIGNyaXRlcmlhXCIgfSldIH0pKV0gfSkgfSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBSZXBvcnRzVmlldztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFNlYXJjaEJhciBDb21wb25lbnRcbiAqXG4gKiBTZWFyY2ggaW5wdXQgd2l0aCBpY29uLCBjbGVhciBidXR0b24sIGFuZCBkZWJvdW5jZWQgb25DaGFuZ2UuXG4gKiBVc2VkIGZvciBmaWx0ZXJpbmcgbGlzdHMgYW5kIHRhYmxlcy5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgU2VhcmNoLCBYIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogU2VhcmNoQmFyIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgU2VhcmNoQmFyID0gKHsgdmFsdWU6IGNvbnRyb2xsZWRWYWx1ZSA9ICcnLCBvbkNoYW5nZSwgcGxhY2Vob2xkZXIgPSAnU2VhcmNoLi4uJywgZGVib3VuY2VEZWxheSA9IDMwMCwgZGlzYWJsZWQgPSBmYWxzZSwgc2l6ZSA9ICdtZCcsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICBjb25zdCBbaW5wdXRWYWx1ZSwgc2V0SW5wdXRWYWx1ZV0gPSB1c2VTdGF0ZShjb250cm9sbGVkVmFsdWUpO1xuICAgIC8vIFN5bmMgd2l0aCBjb250cm9sbGVkIHZhbHVlXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgc2V0SW5wdXRWYWx1ZShjb250cm9sbGVkVmFsdWUpO1xuICAgIH0sIFtjb250cm9sbGVkVmFsdWVdKTtcbiAgICAvLyBEZWJvdW5jZWQgb25DaGFuZ2VcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAob25DaGFuZ2UgJiYgaW5wdXRWYWx1ZSAhPT0gY29udHJvbGxlZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoaW5wdXRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGRlYm91bmNlRGVsYXkpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgICAgICB9O1xuICAgIH0sIFtpbnB1dFZhbHVlLCBvbkNoYW5nZSwgZGVib3VuY2VEZWxheSwgY29udHJvbGxlZFZhbHVlXSk7XG4gICAgY29uc3QgaGFuZGxlSW5wdXRDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKGUudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUNsZWFyID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKCcnKTtcbiAgICAgICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBvbkNoYW5nZSgnJyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25DaGFuZ2VdKTtcbiAgICAvLyBTaXplIGNsYXNzZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTggdGV4dC1zbSBweC0zJyxcbiAgICAgICAgbWQ6ICdoLTEwIHRleHQtYmFzZSBweC00JyxcbiAgICAgICAgbGc6ICdoLTEyIHRleHQtbGcgcHgtNScsXG4gICAgfTtcbiAgICBjb25zdCBpY29uU2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHNtOiAnaC00IHctNCcsXG4gICAgICAgIG1kOiAnaC01IHctNScsXG4gICAgICAgIGxnOiAnaC02IHctNicsXG4gICAgfTtcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgncmVsYXRpdmUgZmxleCBpdGVtcy1jZW50ZXInLCBjbGFzc05hbWUpO1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAndy1mdWxsIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCcsICdwbC0xMCBwci0xMCcsICdiZy13aGl0ZSB0ZXh0LWdyYXktOTAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCBmb2N1czpib3JkZXItYmx1ZS01MDAnLCAndHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgXG4gICAgLy8gU2l6ZVxuICAgIHNpemVDbGFzc2VzW3NpemVdLCBcbiAgICAvLyBEaXNhYmxlZFxuICAgIHtcbiAgICAgICAgJ2JnLWdyYXktMTAwIHRleHQtZ3JheS01MDAgY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4KFNlYXJjaCwgeyBjbGFzc05hbWU6IGNsc3goJ2Fic29sdXRlIGxlZnQtMyB0ZXh0LWdyYXktNDAwIHBvaW50ZXItZXZlbnRzLW5vbmUnLCBpY29uU2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgdmFsdWU6IGlucHV0VmFsdWUsIG9uQ2hhbmdlOiBoYW5kbGVJbnB1dENoYW5nZSwgcGxhY2Vob2xkZXI6IHBsYWNlaG9sZGVyLCBkaXNhYmxlZDogZGlzYWJsZWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtbGFiZWxcIjogXCJTZWFyY2hcIiB9KSwgaW5wdXRWYWx1ZSAmJiAhZGlzYWJsZWQgJiYgKF9qc3goXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiBoYW5kbGVDbGVhciwgY2xhc3NOYW1lOiBjbHN4KCdhYnNvbHV0ZSByaWdodC0zJywgJ3RleHQtZ3JheS00MDAgaG92ZXI6dGV4dC1ncmF5LTYwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgcm91bmRlZCcsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnKSwgXCJhcmlhLWxhYmVsXCI6IFwiQ2xlYXIgc2VhcmNoXCIsIGNoaWxkcmVuOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBpY29uU2l6ZUNsYXNzZXNbc2l6ZV0gfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgU2VhcmNoQmFyO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQmFkZ2UgQ29tcG9uZW50XG4gKlxuICogU21hbGwgbGFiZWwgY29tcG9uZW50IGZvciBzdGF0dXMgaW5kaWNhdG9ycywgY291bnRzLCBhbmQgdGFncy5cbiAqIFN1cHBvcnRzIG11bHRpcGxlIHZhcmlhbnRzIGFuZCBzaXplcy5cbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4Jztcbi8qKlxuICogQmFkZ2UgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBCYWRnZSA9ICh7IGNoaWxkcmVuLCB2YXJpYW50ID0gJ2RlZmF1bHQnLCBzaXplID0gJ21kJywgZG90ID0gZmFsc2UsIGRvdFBvc2l0aW9uID0gJ2xlYWRpbmcnLCByZW1vdmFibGUgPSBmYWxzZSwgb25SZW1vdmUsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICAvLyBWYXJpYW50IHN0eWxlc1xuICAgIGNvbnN0IHZhcmlhbnRDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS0xMDAgdGV4dC1ncmF5LTgwMCBib3JkZXItZ3JheS0yMDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS0xMDAgdGV4dC1ibHVlLTgwMCBib3JkZXItYmx1ZS0yMDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tMTAwIHRleHQtZ3JlZW4tODAwIGJvcmRlci1ncmVlbi0yMDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTEwMCB0ZXh0LXllbGxvdy04MDAgYm9yZGVyLXllbGxvdy0yMDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtMTAwIHRleHQtcmVkLTgwMCBib3JkZXItcmVkLTIwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTEwMCB0ZXh0LWN5YW4tODAwIGJvcmRlci1jeWFuLTIwMCcsXG4gICAgfTtcbiAgICAvLyBEb3QgY29sb3IgY2xhc3Nlc1xuICAgIGNvbnN0IGRvdENsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ncmF5LTUwMCcsXG4gICAgICAgIHByaW1hcnk6ICdiZy1ibHVlLTUwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi01MDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTUwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC01MDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi01MDAnLFxuICAgIH07XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgeHM6ICdweC0yIHB5LTAuNSB0ZXh0LXhzJyxcbiAgICAgICAgc206ICdweC0yLjUgcHktMC41IHRleHQtc20nLFxuICAgICAgICBtZDogJ3B4LTMgcHktMSB0ZXh0LXNtJyxcbiAgICAgICAgbGc6ICdweC0zLjUgcHktMS41IHRleHQtYmFzZScsXG4gICAgfTtcbiAgICBjb25zdCBkb3RTaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgeHM6ICdoLTEuNSB3LTEuNScsXG4gICAgICAgIHNtOiAnaC0yIHctMicsXG4gICAgICAgIG1kOiAnaC0yIHctMicsXG4gICAgICAgIGxnOiAnaC0yLjUgdy0yLjUnLFxuICAgIH07XG4gICAgY29uc3QgYmFkZ2VDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICdpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEuNScsICdmb250LW1lZGl1bSByb3VuZGVkLWZ1bGwgYm9yZGVyJywgJ3RyYW5zaXRpb24tY29sb3JzIGR1cmF0aW9uLTIwMCcsIFxuICAgIC8vIFZhcmlhbnRcbiAgICB2YXJpYW50Q2xhc3Nlc1t2YXJpYW50XSwgXG4gICAgLy8gU2l6ZVxuICAgIHNpemVDbGFzc2VzW3NpemVdLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBiYWRnZUNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbZG90ICYmIGRvdFBvc2l0aW9uID09PSAnbGVhZGluZycgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdyb3VuZGVkLWZ1bGwnLCBkb3RDbGFzc2VzW3ZhcmlhbnRdLCBkb3RTaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSkpLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBjaGlsZHJlbiB9KSwgZG90ICYmIGRvdFBvc2l0aW9uID09PSAndHJhaWxpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgcmVtb3ZhYmxlICYmIG9uUmVtb3ZlICYmIChfanN4KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogb25SZW1vdmUsIGNsYXNzTmFtZTogY2xzeCgnbWwtMC41IC1tci0xIGlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlcicsICdyb3VuZGVkLWZ1bGwgaG92ZXI6YmctYmxhY2svMTAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0xJywge1xuICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICd4cycgfHwgc2l6ZSA9PT0gJ3NtJyxcbiAgICAgICAgICAgICAgICAgICAgJ2gtNCB3LTQnOiBzaXplID09PSAnbWQnIHx8IHNpemUgPT09ICdsZycsXG4gICAgICAgICAgICAgICAgfSksIFwiYXJpYS1sYWJlbFwiOiBcIlJlbW92ZVwiLCBjaGlsZHJlbjogX2pzeChcInN2Z1wiLCB7IGNsYXNzTmFtZTogY2xzeCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0yIHctMic6IHNpemUgPT09ICd4cycgfHwgc2l6ZSA9PT0gJ3NtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdoLTMgdy0zJzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgICAgICB9KSwgZmlsbDogXCJjdXJyZW50Q29sb3JcIiwgdmlld0JveDogXCIwIDAgMjAgMjBcIiwgY2hpbGRyZW46IF9qc3goXCJwYXRoXCIsIHsgZmlsbFJ1bGU6IFwiZXZlbm9kZFwiLCBkOiBcIk00LjI5MyA0LjI5M2ExIDEgMCAwMTEuNDE0IDBMMTAgOC41ODZsNC4yOTMtNC4yOTNhMSAxIDAgMTExLjQxNCAxLjQxNEwxMS40MTQgMTBsNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQgMS40MTRMMTAgMTEuNDE0bC00LjI5MyA0LjI5M2ExIDEgMCAwMS0xLjQxNC0xLjQxNEw4LjU4NiAxMCA0LjI5MyA1LjcwN2ExIDEgMCAwMTAtMS40MTR6XCIsIGNsaXBSdWxlOiBcImV2ZW5vZGRcIiB9KSB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBCYWRnZTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==