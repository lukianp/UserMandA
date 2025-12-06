"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[1321],{

/***/ 21321:
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
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "reports-view", "data-testid": "reports-view", children: [(0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-3", children: [(0,jsx_runtime.jsx)(lucide_react/* FileText */.iUU, { className: "w-8 h-8 text-indigo-600 dark:text-indigo-400" }), (0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Reports" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Generate reports from discovery and migration data" })] })] }) }), (0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-4", children: [(0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(SearchBar/* default */.A, { value: searchText, onChange: setSearchText, placeholder: "Search report templates...", "data-cy": "reports-search", "data-testid": "reports-search" }) }), (0,jsx_runtime.jsx)("div", { className: "w-48", children: (0,jsx_runtime.jsx)(Select/* Select */.l, { value: filterCategory, onChange: setFilterCategory, options: [
                                    { value: 'all', label: 'All Categories' },
                                    { value: 'Users', label: 'Users' },
                                    { value: 'Groups', label: 'Groups' },
                                    { value: 'Migration', label: 'Migration' },
                                    { value: 'Licensing', label: 'Licensing' },
                                ], "data-cy": "category-filter", "data-testid": "category-filter" }) })] }) }), (0,jsx_runtime.jsx)("div", { className: "flex-1 overflow-auto p-6", children: (0,jsx_runtime.jsxs)("div", { className: "max-w-7xl mx-auto", children: [(0,jsx_runtime.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: templates?.map((template) => {
                                const isGenerating = generatingReports.has(template.id);
                                return ((0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow", "data-cy": `report-card-${template.id}`, children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-start justify-between mb-3", children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsx)(lucide_react/* FileText */.iUU, { className: "w-5 h-5 text-indigo-600 dark:text-indigo-400" }), (0,jsx_runtime.jsx)(Badge/* default */.A, { variant: "default", children: template.format })] }), (0,jsx_runtime.jsx)(Badge/* default */.A, { children: template.category })] }), (0,jsx_runtime.jsx)("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-2", children: template.name }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: template.description }), (0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "primary", onClick: () => generateReport(template.id), disabled: isGenerating, loading: isGenerating, icon: isGenerating ? (0,jsx_runtime.jsx)(lucide_react/* Loader2 */.krw, { className: "w-4 h-4 animate-spin" }) : (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "w-4 h-4" }), className: "w-full", "data-cy": `generate-btn-${template.id}`, children: isGenerating ? 'Generating...' : 'Generate Report' })] }, template.id));
                            }) }), templates.length === 0 && ((0,jsx_runtime.jsxs)("div", { className: "text-center py-12", children: [(0,jsx_runtime.jsx)(lucide_react/* FileText */.iUU, { className: "w-16 h-16 text-gray-400 mx-auto mb-4" }), (0,jsx_runtime.jsx)("h3", { className: "text-lg font-medium text-gray-900 dark:text-white mb-2", children: "No report templates found" }), (0,jsx_runtime.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Try adjusting your search or filter criteria" })] }))] }) })] }));
};
/* harmony default export */ const reports_ReportsView = (ReportsView);


/***/ }),

/***/ 53404:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   I: () => (/* binding */ SearchBar)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72832);

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
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('relative flex items-center', className);
    const inputClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)(
    // Base styles
    'w-full rounded-lg border border-gray-300', 'pl-10 pr-10', 'bg-white text-gray-900 placeholder-gray-400', 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500', 'transition-all duration-200', 
    // Size
    sizeClasses[size], 
    // Disabled
    {
        'bg-gray-100 text-gray-500 cursor-not-allowed': disabled,
    });
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, "data-cy": dataCy, children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Search */ .vji, { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('absolute left-3 text-gray-400 pointer-events-none', iconSizeClasses[size]), "aria-hidden": "true" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "text", value: inputValue, onChange: handleInputChange, placeholder: placeholder, disabled: disabled, className: inputClasses, "aria-label": "Search" }), inputValue && !disabled && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { type: "button", onClick: handleClear, className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('absolute right-3', 'text-gray-400 hover:text-gray-600', 'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded', 'transition-colors duration-200'), "aria-label": "Clear search", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__.X, { className: iconSizeClasses[size] }) }))] }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SearchBar);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLHVEQUFLLFdBQVcsNEZBQTRGLHNEQUFJLFdBQVcsV0FBVyxtREFBSSxvRkFBb0YsSUFBSSxzREFBSSxXQUFXLG9CQUFvQix5Q0FBeUMsc0RBQUksV0FBVyxXQUFXLG1EQUFJLG9GQUFvRiw4QkFBOEIsc0RBQUksYUFBYSw4Q0FBOEMsbURBQUk7QUFDN2dCO0FBQ0E7QUFDQSxpQkFBaUIscUNBQXFDLHNEQUFJLFVBQVUsV0FBVyxtREFBSTtBQUNuRjtBQUNBO0FBQ0EscUJBQXFCLHlEQUF5RCxzREFBSSxXQUFXLG1QQUFtUCxHQUFHLEdBQUcsS0FBSztBQUMzVjtBQUNBLGlFQUFlLEtBQUssRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZVJlcG9ydHNMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9yZXBvcnRzL1JlcG9ydHNWaWV3LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL21vbGVjdWxlcy9TZWFyY2hCYXIudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvQmFkZ2UudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUmVwb3J0cyBWaWV3IExvZ2ljIEhvb2tcbiAqIFJlcG9ydCBnZW5lcmF0aW9uIGFuZCBtYW5hZ2VtZW50XG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmV4cG9ydCBjb25zdCB1c2VSZXBvcnRzTG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgW3RlbXBsYXRlc10gPSB1c2VTdGF0ZShbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAndXNlci1zdW1tYXJ5JyxcbiAgICAgICAgICAgIG5hbWU6ICdVc2VyIFN1bW1hcnkgUmVwb3J0JyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU3VtbWFyeSBvZiBhbGwgZGlzY292ZXJlZCB1c2VycyB3aXRoIGtleSBtZXRyaWNzJyxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnVXNlcnMnLFxuICAgICAgICAgICAgZm9ybWF0OiAnUERGJyxcbiAgICAgICAgICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2dyb3VwLW1lbWJlcnNoaXAnLFxuICAgICAgICAgICAgbmFtZTogJ0dyb3VwIE1lbWJlcnNoaXAgUmVwb3J0JyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRGV0YWlsZWQgZ3JvdXAgbWVtYmVyc2hpcCBhbmQgcGVybWlzc2lvbnMnLFxuICAgICAgICAgICAgY2F0ZWdvcnk6ICdHcm91cHMnLFxuICAgICAgICAgICAgZm9ybWF0OiAnRXhjZWwnLFxuICAgICAgICAgICAgcGFyYW1ldGVyczoge30sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnbWlncmF0aW9uLXJlYWRpbmVzcycsXG4gICAgICAgICAgICBuYW1lOiAnTWlncmF0aW9uIFJlYWRpbmVzcyBSZXBvcnQnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdBc3Nlc3NtZW50IG9mIG1pZ3JhdGlvbiByZWFkaW5lc3MgYW5kIGJsb2NrZXJzJyxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnTWlncmF0aW9uJyxcbiAgICAgICAgICAgIGZvcm1hdDogJ1BERicsXG4gICAgICAgICAgICBwYXJhbWV0ZXJzOiB7fSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdsaWNlbnNlLXVzYWdlJyxcbiAgICAgICAgICAgIG5hbWU6ICdMaWNlbnNlIFVzYWdlIFJlcG9ydCcsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0N1cnJlbnQgbGljZW5zZSBhbGxvY2F0aW9uIGFuZCB1c2FnZSBzdGF0aXN0aWNzJyxcbiAgICAgICAgICAgIGNhdGVnb3J5OiAnTGljZW5zaW5nJyxcbiAgICAgICAgICAgIGZvcm1hdDogJ0V4Y2VsJyxcbiAgICAgICAgICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgICAgICB9LFxuICAgIF0pO1xuICAgIGNvbnN0IFtnZW5lcmF0aW5nUmVwb3J0cywgc2V0R2VuZXJhdGluZ1JlcG9ydHNdID0gdXNlU3RhdGUobmV3IFNldCgpKTtcbiAgICBjb25zdCBbc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dF0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW2ZpbHRlckNhdGVnb3J5LCBzZXRGaWx0ZXJDYXRlZ29yeV0gPSB1c2VTdGF0ZSgnYWxsJyk7XG4gICAgY29uc3QgZmlsdGVyZWRUZW1wbGF0ZXMgPSB0ZW1wbGF0ZXMuZmlsdGVyKHRlbXBsYXRlID0+IHtcbiAgICAgICAgY29uc3QgbWF0Y2hlc1NlYXJjaCA9ICFzZWFyY2hUZXh0IHx8XG4gICAgICAgICAgICAodGVtcGxhdGUubmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCkpIHx8XG4gICAgICAgICAgICAodGVtcGxhdGUuZGVzY3JpcHRpb24gPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgY29uc3QgbWF0Y2hlc0NhdGVnb3J5ID0gZmlsdGVyQ2F0ZWdvcnkgPT09ICdhbGwnIHx8IHRlbXBsYXRlLmNhdGVnb3J5ID09PSBmaWx0ZXJDYXRlZ29yeTtcbiAgICAgICAgcmV0dXJuIG1hdGNoZXNTZWFyY2ggJiYgbWF0Y2hlc0NhdGVnb3J5O1xuICAgIH0pO1xuICAgIGNvbnN0IGdlbmVyYXRlUmVwb3J0ID0gdXNlQ2FsbGJhY2soYXN5bmMgKHRlbXBsYXRlSWQpID0+IHtcbiAgICAgICAgc2V0R2VuZXJhdGluZ1JlcG9ydHMocHJldiA9PiBuZXcgU2V0KHByZXYpLmFkZCh0ZW1wbGF0ZUlkKSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvUmVwb3J0aW5nL1JlcG9ydEdlbmVyYXRpb24ucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnTmV3LVJlcG9ydCcsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBUZW1wbGF0ZUlkOiB0ZW1wbGF0ZUlkLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIC8vIFJlcG9ydCBnZW5lcmF0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlcG9ydCBnZW5lcmF0ZWQ6JywgcmVzdWx0LmRhdGEub3V0cHV0UGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZ2VuZXJhdGUgcmVwb3J0OicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldEdlbmVyYXRpbmdSZXBvcnRzKHByZXYgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KHByZXYpO1xuICAgICAgICAgICAgICAgIG5leHQuZGVsZXRlKHRlbXBsYXRlSWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGVtcGxhdGVzOiBmaWx0ZXJlZFRlbXBsYXRlcyxcbiAgICAgICAgZ2VuZXJhdGluZ1JlcG9ydHMsXG4gICAgICAgIHNlYXJjaFRleHQsXG4gICAgICAgIHNldFNlYXJjaFRleHQsXG4gICAgICAgIGZpbHRlckNhdGVnb3J5LFxuICAgICAgICBzZXRGaWx0ZXJDYXRlZ29yeSxcbiAgICAgICAgZ2VuZXJhdGVSZXBvcnQsXG4gICAgfTtcbn07XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBSZXBvcnRzIFZpZXdcbiAqIFJlcG9ydCB0ZW1wbGF0ZXMgYW5kIGdlbmVyYXRpb25cbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEZpbGVUZXh0LCBEb3dubG9hZCwgTG9hZGVyMiB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyB1c2VSZXBvcnRzTG9naWMgfSBmcm9tICcuLi8uLi9ob29rcy91c2VSZXBvcnRzTG9naWMnO1xuaW1wb3J0IFNlYXJjaEJhciBmcm9tICcuLi8uLi9jb21wb25lbnRzL21vbGVjdWxlcy9TZWFyY2hCYXInO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU2VsZWN0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9TZWxlY3QnO1xuaW1wb3J0IEJhZGdlIGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQmFkZ2UnO1xuY29uc3QgUmVwb3J0c1ZpZXcgPSAoKSA9PiB7XG4gICAgY29uc3QgeyB0ZW1wbGF0ZXMsIGdlbmVyYXRpbmdSZXBvcnRzLCBzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0LCBmaWx0ZXJDYXRlZ29yeSwgc2V0RmlsdGVyQ2F0ZWdvcnksIGdlbmVyYXRlUmVwb3J0LCB9ID0gdXNlUmVwb3J0c0xvZ2ljKCk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgZmxleCBmbGV4LWNvbCBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDBcIiwgXCJkYXRhLWN5XCI6IFwicmVwb3J0cy12aWV3XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJyZXBvcnRzLXZpZXdcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNFwiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIiwgY2hpbGRyZW46IFtfanN4KEZpbGVUZXh0LCB7IGNsYXNzTmFtZTogXCJ3LTggaC04IHRleHQtaW5kaWdvLTYwMCBkYXJrOnRleHQtaW5kaWdvLTQwMFwiIH0pLCBfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZVwiLCBjaGlsZHJlbjogXCJSZXBvcnRzXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiR2VuZXJhdGUgcmVwb3J0cyBmcm9tIGRpc2NvdmVyeSBhbmQgbWlncmF0aW9uIGRhdGFcIiB9KV0gfSldIH0pIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktM1wiLCBjaGlsZHJlbjogX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMVwiLCBjaGlsZHJlbjogX2pzeChTZWFyY2hCYXIsIHsgdmFsdWU6IHNlYXJjaFRleHQsIG9uQ2hhbmdlOiBzZXRTZWFyY2hUZXh0LCBwbGFjZWhvbGRlcjogXCJTZWFyY2ggcmVwb3J0IHRlbXBsYXRlcy4uLlwiLCBcImRhdGEtY3lcIjogXCJyZXBvcnRzLXNlYXJjaFwiLCBcImRhdGEtdGVzdGlkXCI6IFwicmVwb3J0cy1zZWFyY2hcIiB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJ3LTQ4XCIsIGNoaWxkcmVuOiBfanN4KFNlbGVjdCwgeyB2YWx1ZTogZmlsdGVyQ2F0ZWdvcnksIG9uQ2hhbmdlOiBzZXRGaWx0ZXJDYXRlZ29yeSwgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ2FsbCcsIGxhYmVsOiAnQWxsIENhdGVnb3JpZXMnIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZhbHVlOiAnVXNlcnMnLCBsYWJlbDogJ1VzZXJzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0dyb3VwcycsIGxhYmVsOiAnR3JvdXBzJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ01pZ3JhdGlvbicsIGxhYmVsOiAnTWlncmF0aW9uJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0xpY2Vuc2luZycsIGxhYmVsOiAnTGljZW5zaW5nJyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCBcImRhdGEtY3lcIjogXCJjYXRlZ29yeS1maWx0ZXJcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImNhdGVnb3J5LWZpbHRlclwiIH0pIH0pXSB9KSB9KSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgb3ZlcmZsb3ctYXV0byBwLTZcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm1heC13LTd4bCBteC1hdXRvXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0yIGxnOmdyaWQtY29scy0zIGdhcC02XCIsIGNoaWxkcmVuOiB0ZW1wbGF0ZXM/Lm1hcCgodGVtcGxhdGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNHZW5lcmF0aW5nID0gZ2VuZXJhdGluZ1JlcG9ydHMuaGFzKHRlbXBsYXRlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIHJvdW5kZWQtbGcgc2hhZG93LW1kIHAtNiBob3ZlcjpzaGFkb3ctbGcgdHJhbnNpdGlvbi1zaGFkb3dcIiwgXCJkYXRhLWN5XCI6IGByZXBvcnQtY2FyZC0ke3RlbXBsYXRlLmlkfWAsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1zdGFydCBqdXN0aWZ5LWJldHdlZW4gbWItM1wiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChGaWxlVGV4dCwgeyBjbGFzc05hbWU6IFwidy01IGgtNSB0ZXh0LWluZGlnby02MDAgZGFyazp0ZXh0LWluZGlnby00MDBcIiB9KSwgX2pzeChCYWRnZSwgeyB2YXJpYW50OiBcImRlZmF1bHRcIiwgY2hpbGRyZW46IHRlbXBsYXRlLmZvcm1hdCB9KV0gfSksIF9qc3goQmFkZ2UsIHsgY2hpbGRyZW46IHRlbXBsYXRlLmNhdGVnb3J5IH0pXSB9KSwgX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC13aGl0ZSBtYi0yXCIsIGNoaWxkcmVuOiB0ZW1wbGF0ZS5uYW1lIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtIHRleHQtZ3JheS02MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1iLTRcIiwgY2hpbGRyZW46IHRlbXBsYXRlLmRlc2NyaXB0aW9uIH0pLCBfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcInByaW1hcnlcIiwgb25DbGljazogKCkgPT4gZ2VuZXJhdGVSZXBvcnQodGVtcGxhdGUuaWQpLCBkaXNhYmxlZDogaXNHZW5lcmF0aW5nLCBsb2FkaW5nOiBpc0dlbmVyYXRpbmcsIGljb246IGlzR2VuZXJhdGluZyA/IF9qc3goTG9hZGVyMiwgeyBjbGFzc05hbWU6IFwidy00IGgtNCBhbmltYXRlLXNwaW5cIiB9KSA6IF9qc3goRG93bmxvYWQsIHsgY2xhc3NOYW1lOiBcInctNCBoLTRcIiB9KSwgY2xhc3NOYW1lOiBcInctZnVsbFwiLCBcImRhdGEtY3lcIjogYGdlbmVyYXRlLWJ0bi0ke3RlbXBsYXRlLmlkfWAsIGNoaWxkcmVuOiBpc0dlbmVyYXRpbmcgPyAnR2VuZXJhdGluZy4uLicgOiAnR2VuZXJhdGUgUmVwb3J0JyB9KV0gfSwgdGVtcGxhdGUuaWQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSB9KSwgdGVtcGxhdGVzLmxlbmd0aCA9PT0gMCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1jZW50ZXIgcHktMTJcIiwgY2hpbGRyZW46IFtfanN4KEZpbGVUZXh0LCB7IGNsYXNzTmFtZTogXCJ3LTE2IGgtMTYgdGV4dC1ncmF5LTQwMCBteC1hdXRvIG1iLTRcIiB9KSwgX2pzeChcImgzXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtbGcgZm9udC1tZWRpdW0gdGV4dC1ncmF5LTkwMCBkYXJrOnRleHQtd2hpdGUgbWItMlwiLCBjaGlsZHJlbjogXCJObyByZXBvcnQgdGVtcGxhdGVzIGZvdW5kXCIgfSksIF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiVHJ5IGFkanVzdGluZyB5b3VyIHNlYXJjaCBvciBmaWx0ZXIgY3JpdGVyaWFcIiB9KV0gfSkpXSB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IFJlcG9ydHNWaWV3O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU2VhcmNoQmFyIENvbXBvbmVudFxuICpcbiAqIFNlYXJjaCBpbnB1dCB3aXRoIGljb24sIGNsZWFyIGJ1dHRvbiwgYW5kIGRlYm91bmNlZCBvbkNoYW5nZS5cbiAqIFVzZWQgZm9yIGZpbHRlcmluZyBsaXN0cyBhbmQgdGFibGVzLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBTZWFyY2gsIFggfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBTZWFyY2hCYXIgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBTZWFyY2hCYXIgPSAoeyB2YWx1ZTogY29udHJvbGxlZFZhbHVlID0gJycsIG9uQ2hhbmdlLCBwbGFjZWhvbGRlciA9ICdTZWFyY2guLi4nLCBkZWJvdW5jZURlbGF5ID0gMzAwLCBkaXNhYmxlZCA9IGZhbHNlLCBzaXplID0gJ21kJywgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIGNvbnN0IFtpbnB1dFZhbHVlLCBzZXRJbnB1dFZhbHVlXSA9IHVzZVN0YXRlKGNvbnRyb2xsZWRWYWx1ZSk7XG4gICAgLy8gU3luYyB3aXRoIGNvbnRyb2xsZWQgdmFsdWVcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKGNvbnRyb2xsZWRWYWx1ZSk7XG4gICAgfSwgW2NvbnRyb2xsZWRWYWx1ZV0pO1xuICAgIC8vIERlYm91bmNlZCBvbkNoYW5nZVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmIChvbkNoYW5nZSAmJiBpbnB1dFZhbHVlICE9PSBjb250cm9sbGVkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZShpbnB1dFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZGVib3VuY2VEZWxheSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlcik7XG4gICAgICAgIH07XG4gICAgfSwgW2lucHV0VmFsdWUsIG9uQ2hhbmdlLCBkZWJvdW5jZURlbGF5LCBjb250cm9sbGVkVmFsdWVdKTtcbiAgICBjb25zdCBoYW5kbGVJbnB1dENoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIHNldElucHV0VmFsdWUoZS50YXJnZXQudmFsdWUpO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlQ2xlYXIgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldElucHV0VmFsdWUoJycpO1xuICAgICAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKCcnKTtcbiAgICAgICAgfVxuICAgIH0sIFtvbkNoYW5nZV0pO1xuICAgIC8vIFNpemUgY2xhc3Nlc1xuICAgIGNvbnN0IHNpemVDbGFzc2VzID0ge1xuICAgICAgICBzbTogJ2gtOCB0ZXh0LXNtIHB4LTMnLFxuICAgICAgICBtZDogJ2gtMTAgdGV4dC1iYXNlIHB4LTQnLFxuICAgICAgICBsZzogJ2gtMTIgdGV4dC1sZyBweC01JyxcbiAgICB9O1xuICAgIGNvbnN0IGljb25TaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTQgdy00JyxcbiAgICAgICAgbWQ6ICdoLTUgdy01JyxcbiAgICAgICAgbGc6ICdoLTYgdy02JyxcbiAgICB9O1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdyZWxhdGl2ZSBmbGV4IGl0ZW1zLWNlbnRlcicsIGNsYXNzTmFtZSk7XG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICd3LWZ1bGwgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMzAwJywgJ3BsLTEwIHByLTEwJywgJ2JnLXdoaXRlIHRleHQtZ3JheS05MDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLWJsdWUtNTAwIGZvY3VzOmJvcmRlci1ibHVlLTUwMCcsICd0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCBcbiAgICAvLyBTaXplXG4gICAgc2l6ZUNsYXNzZXNbc2l6ZV0sIFxuICAgIC8vIERpc2FibGVkXG4gICAge1xuICAgICAgICAnYmctZ3JheS0xMDAgdGV4dC1ncmF5LTUwMCBjdXJzb3Itbm90LWFsbG93ZWQnOiBkaXNhYmxlZCxcbiAgICB9KTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3goU2VhcmNoLCB7IGNsYXNzTmFtZTogY2xzeCgnYWJzb2x1dGUgbGVmdC0zIHRleHQtZ3JheS00MDAgcG9pbnRlci1ldmVudHMtbm9uZScsIGljb25TaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIF9qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwidGV4dFwiLCB2YWx1ZTogaW5wdXRWYWx1ZSwgb25DaGFuZ2U6IGhhbmRsZUlucHV0Q2hhbmdlLCBwbGFjZWhvbGRlcjogcGxhY2Vob2xkZXIsIGRpc2FibGVkOiBkaXNhYmxlZCwgY2xhc3NOYW1lOiBpbnB1dENsYXNzZXMsIFwiYXJpYS1sYWJlbFwiOiBcIlNlYXJjaFwiIH0pLCBpbnB1dFZhbHVlICYmICFkaXNhYmxlZCAmJiAoX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IGhhbmRsZUNsZWFyLCBjbGFzc05hbWU6IGNsc3goJ2Fic29sdXRlIHJpZ2h0LTMnLCAndGV4dC1ncmF5LTQwMCBob3Zlcjp0ZXh0LWdyYXktNjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCByb3VuZGVkJywgJ3RyYW5zaXRpb24tY29sb3JzIGR1cmF0aW9uLTIwMCcpLCBcImFyaWEtbGFiZWxcIjogXCJDbGVhciBzZWFyY2hcIiwgY2hpbGRyZW46IF9qc3goWCwgeyBjbGFzc05hbWU6IGljb25TaXplQ2xhc3Nlc1tzaXplXSB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBTZWFyY2hCYXI7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBCYWRnZSBDb21wb25lbnRcbiAqXG4gKiBTbWFsbCBsYWJlbCBjb21wb25lbnQgZm9yIHN0YXR1cyBpbmRpY2F0b3JzLCBjb3VudHMsIGFuZCB0YWdzLlxuICogU3VwcG9ydHMgbXVsdGlwbGUgdmFyaWFudHMgYW5kIHNpemVzLlxuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuLyoqXG4gKiBCYWRnZSBDb21wb25lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IEJhZGdlID0gKHsgY2hpbGRyZW4sIHZhcmlhbnQgPSAnZGVmYXVsdCcsIHNpemUgPSAnbWQnLCBkb3QgPSBmYWxzZSwgZG90UG9zaXRpb24gPSAnbGVhZGluZycsIHJlbW92YWJsZSA9IGZhbHNlLCBvblJlbW92ZSwgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIC8vIFZhcmlhbnQgc3R5bGVzXG4gICAgY29uc3QgdmFyaWFudENsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ncmF5LTEwMCB0ZXh0LWdyYXktODAwIGJvcmRlci1ncmF5LTIwMCcsXG4gICAgICAgIHByaW1hcnk6ICdiZy1ibHVlLTEwMCB0ZXh0LWJsdWUtODAwIGJvcmRlci1ibHVlLTIwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi0xMDAgdGV4dC1ncmVlbi04MDAgYm9yZGVyLWdyZWVuLTIwMCcsXG4gICAgICAgIHdhcm5pbmc6ICdiZy15ZWxsb3ctMTAwIHRleHQteWVsbG93LTgwMCBib3JkZXIteWVsbG93LTIwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC0xMDAgdGV4dC1yZWQtODAwIGJvcmRlci1yZWQtMjAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tMTAwIHRleHQtY3lhbi04MDAgYm9yZGVyLWN5YW4tMjAwJyxcbiAgICB9O1xuICAgIC8vIERvdCBjb2xvciBjbGFzc2VzXG4gICAgY29uc3QgZG90Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWdyYXktNTAwJyxcbiAgICAgICAgcHJpbWFyeTogJ2JnLWJsdWUtNTAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTUwMCcsXG4gICAgICAgIHdhcm5pbmc6ICdiZy15ZWxsb3ctNTAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTUwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTUwMCcsXG4gICAgfTtcbiAgICAvLyBTaXplIHN0eWxlc1xuICAgIGNvbnN0IHNpemVDbGFzc2VzID0ge1xuICAgICAgICB4czogJ3B4LTIgcHktMC41IHRleHQteHMnLFxuICAgICAgICBzbTogJ3B4LTIuNSBweS0wLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtMyBweS0xIHRleHQtc20nLFxuICAgICAgICBsZzogJ3B4LTMuNSBweS0xLjUgdGV4dC1iYXNlJyxcbiAgICB9O1xuICAgIGNvbnN0IGRvdFNpemVDbGFzc2VzID0ge1xuICAgICAgICB4czogJ2gtMS41IHctMS41JyxcbiAgICAgICAgc206ICdoLTIgdy0yJyxcbiAgICAgICAgbWQ6ICdoLTIgdy0yJyxcbiAgICAgICAgbGc6ICdoLTIuNSB3LTIuNScsXG4gICAgfTtcbiAgICBjb25zdCBiYWRnZUNsYXNzZXMgPSBjbHN4KFxuICAgIC8vIEJhc2Ugc3R5bGVzXG4gICAgJ2lubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41JywgJ2ZvbnQtbWVkaXVtIHJvdW5kZWQtZnVsbCBib3JkZXInLCAndHJhbnNpdGlvbi1jb2xvcnMgZHVyYXRpb24tMjAwJywgXG4gICAgLy8gVmFyaWFudFxuICAgIHZhcmlhbnRDbGFzc2VzW3ZhcmlhbnRdLCBcbiAgICAvLyBTaXplXG4gICAgc2l6ZUNsYXNzZXNbc2l6ZV0sIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIChfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IGJhZGdlQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtkb3QgJiYgZG90UG9zaXRpb24gPT09ICdsZWFkaW5nJyAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGNsc3goJ3JvdW5kZWQtZnVsbCcsIGRvdENsYXNzZXNbdmFyaWFudF0sIGRvdFNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSksIF9qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IGNoaWxkcmVuIH0pLCBkb3QgJiYgZG90UG9zaXRpb24gPT09ICd0cmFpbGluZycgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdyb3VuZGVkLWZ1bGwnLCBkb3RDbGFzc2VzW3ZhcmlhbnRdLCBkb3RTaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSkpLCByZW1vdmFibGUgJiYgb25SZW1vdmUgJiYgKF9qc3goXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiBvblJlbW92ZSwgY2xhc3NOYW1lOiBjbHN4KCdtbC0wLjUgLW1yLTEgaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyJywgJ3JvdW5kZWQtZnVsbCBob3ZlcjpiZy1ibGFjay8xMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTEnLCB7XG4gICAgICAgICAgICAgICAgICAgICdoLTMgdy0zJzogc2l6ZSA9PT0gJ3hzJyB8fCBzaXplID09PSAnc20nLFxuICAgICAgICAgICAgICAgICAgICAnaC00IHctNCc6IHNpemUgPT09ICdtZCcgfHwgc2l6ZSA9PT0gJ2xnJyxcbiAgICAgICAgICAgICAgICB9KSwgXCJhcmlhLWxhYmVsXCI6IFwiUmVtb3ZlXCIsIGNoaWxkcmVuOiBfanN4KFwic3ZnXCIsIHsgY2xhc3NOYW1lOiBjbHN4KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdoLTIgdy0yJzogc2l6ZSA9PT0gJ3hzJyB8fCBzaXplID09PSAnc20nLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2gtMyB3LTMnOiBzaXplID09PSAnbWQnIHx8IHNpemUgPT09ICdsZycsXG4gICAgICAgICAgICAgICAgICAgIH0pLCBmaWxsOiBcImN1cnJlbnRDb2xvclwiLCB2aWV3Qm94OiBcIjAgMCAyMCAyMFwiLCBjaGlsZHJlbjogX2pzeChcInBhdGhcIiwgeyBmaWxsUnVsZTogXCJldmVub2RkXCIsIGQ6IFwiTTQuMjkzIDQuMjkzYTEgMSAwIDAxMS40MTQgMEwxMCA4LjU4Nmw0LjI5My00LjI5M2ExIDEgMCAxMTEuNDE0IDEuNDE0TDExLjQxNCAxMGw0LjI5MyA0LjI5M2ExIDEgMCAwMS0xLjQxNCAxLjQxNEwxMCAxMS40MTRsLTQuMjkzIDQuMjkzYTEgMSAwIDAxLTEuNDE0LTEuNDE0TDguNTg2IDEwIDQuMjkzIDUuNzA3YTEgMSAwIDAxMC0xLjQxNHpcIiwgY2xpcFJ1bGU6IFwiZXZlbm9kZFwiIH0pIH0pIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IEJhZGdlO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9