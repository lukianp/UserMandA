"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[5459],{

/***/ 33523:
/*!***********************************************************!*\
  !*** ./src/renderer/components/molecules/ProgressBar.tsx ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ProgressBar: () => (/* binding */ ProgressBar),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ 74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ 34164);

/**
 * ProgressBar Component
 *
 * Progress indicator with percentage display and optional label.
 * Supports different variants and sizes.
 */


/**
 * ProgressBar Component
 */
const ProgressBar = ({ value, max = 100, variant = 'default', size = 'md', showLabel = true, label, labelPosition = 'inside', striped = false, animated = false, className, 'data-cy': dataCy, }) => {
    // Calculate percentage
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    // Variant colors
    const variantClasses = {
        default: 'bg-blue-600',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        danger: 'bg-red-600',
        info: 'bg-cyan-600',
    };
    // Background colors
    const bgClasses = {
        default: 'bg-blue-100',
        success: 'bg-green-100',
        warning: 'bg-yellow-100',
        danger: 'bg-red-100',
        info: 'bg-cyan-100',
    };
    // Size classes
    const sizeClasses = {
        sm: 'h-2',
        md: 'h-4',
        lg: 'h-6',
    };
    const containerClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('w-full', className);
    const trackClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('w-full rounded-full overflow-hidden', bgClasses[variant], sizeClasses[size]);
    const barClasses = (0,clsx__WEBPACK_IMPORTED_MODULE_2__.clsx)('h-full transition-all duration-300 ease-out', variantClasses[variant], {
        // Striped pattern
        'bg-gradient-to-r from-transparent via-black/10 to-transparent bg-[length:1rem_100%]': striped,
        'animate-progress-stripes': striped && animated,
    });
    const labelText = label || (showLabel ? `${Math.round(percentage)}%` : '');
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: containerClasses, "data-cy": dataCy, children: [labelText && labelPosition === 'outside' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center justify-between mb-1", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-sm font-medium text-gray-700", children: labelText }) })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: trackClasses, role: "progressbar", "aria-valuenow": value, "aria-valuemin": 0, "aria-valuemax": max, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: barClasses, style: { width: `${percentage}%` }, children: labelText && labelPosition === 'inside' && size !== 'sm' && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center justify-center h-full px-2", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "text-xs font-semibold text-white whitespace-nowrap", children: labelText }) })) }) })] }));
};
// Add animation for striped progress bars
const styles = `
@keyframes progress-stripes {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}

.animate-progress-stripes {
  animation: progress-stripes 1s linear infinite;
}
`;
// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('progress-bar-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'progress-bar-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProgressBar);


/***/ }),

/***/ 68769:
/*!****************************************************!*\
  !*** ./src/renderer/hooks/useAWSDiscoveryLogic.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useAWSDiscoveryLogic: () => (/* binding */ useAWSDiscoveryLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var _useDebounce__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./useDebounce */ 99305);
/* harmony import */ var _store_useProfileStore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../store/useProfileStore */ 33813);
/* harmony import */ var _lib_electron_api_fallback__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lib/electron-api-fallback */ 58350);
/**
 * AWS Cloud Infrastructure Discovery View Logic Hook
 * Manages state and business logic for AWS resource discovery operations
 */




/**
 * AWS Cloud Infrastructure Discovery Logic Hook
 */
const useAWSDiscoveryLogic = () => {
    // Get selected company profile from store
    const selectedSourceProfile = (0,_store_useProfileStore__WEBPACK_IMPORTED_MODULE_2__.useProfileStore)((state) => state.selectedSourceProfile);
    // State
    const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        config: {
            awsRegions: ['us-east-1'],
            resourceTypes: ['ec2', 's3', 'rds'],
            includeTagDetails: true,
            includeCostEstimates: true,
            includeSecurityAnalysis: true,
            timeout: 300000,
        },
        result: null,
        filter: {
            searchText: '',
            selectedRegions: [],
            selectedResourceTypes: [],
            selectedStates: [],
            showOnlySecurityRisks: false,
        },
        isDiscovering: false,
        progress: null,
        activeTab: 'overview',
        error: null,
        cancellationToken: null,
    });
    const debouncedSearch = (0,_useDebounce__WEBPACK_IMPORTED_MODULE_1__.useDebounce)(state.filter.searchText, 300);
    // Subscribe to discovery progress and output events
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const unsubscribeProgress = window.electron.onDiscoveryProgress((data) => {
            if (data.executionId === state.cancellationToken) {
                setState(prev => ({
                    ...prev,
                    progress: {
                        phase: data.currentPhase,
                        progress: data.percentage,
                        currentRegion: data.currentItem,
                        currentResourceType: data.currentPhase,
                        itemsProcessed: data.itemsProcessed,
                        totalItems: data.totalItems,
                        message: `${data.currentPhase} (${data.itemsProcessed || 0}/${data.totalItems || 0})`,
                    }
                }));
            }
        });
        const unsubscribeOutput = window.electron.onDiscoveryOutput((data) => {
            if (data.executionId === state.cancellationToken) {
                // Results are handled by onDiscoveryComplete
            }
        });
        const unsubscribeComplete = window.electron.onDiscoveryComplete((data) => {
            if (data.executionId === state.cancellationToken) {
                setState(prev => ({
                    ...prev,
                    result: data.result,
                    isDiscovering: false,
                    progress: null,
                    cancellationToken: null,
                }));
            }
        });
        const unsubscribeError = window.electron.onDiscoveryError((data) => {
            if (data.executionId === state.cancellationToken) {
                setState(prev => ({
                    ...prev,
                    isDiscovering: false,
                    error: data.error,
                    progress: null,
                    cancellationToken: null,
                }));
            }
        });
        return () => {
            if (unsubscribeProgress)
                unsubscribeProgress();
            if (unsubscribeOutput)
                unsubscribeOutput();
            if (unsubscribeComplete)
                unsubscribeComplete();
            if (unsubscribeError)
                unsubscribeError();
        };
    }, [state.cancellationToken]);
    /**
     * Start AWS Discovery
     */
    const startDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        // Check if a profile is selected
        if (!selectedSourceProfile) {
            setState(prev => ({
                ...prev,
                error: 'No company profile selected. Please select a profile first.',
            }));
            return;
        }
        const token = `aws-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log(`[AWSDiscoveryHook] Starting AWS discovery for company: ${selectedSourceProfile.companyName}`);
        console.log(`[AWSDiscoveryHook] Parameters:`, {
            regions: state.config.awsRegions,
            resourceTypes: state.config.resourceTypes,
            includeTagDetails: state.config.includeTagDetails,
            includeCostEstimates: state.config.includeCostEstimates,
            includeSecurityAnalysis: state.config.includeSecurityAnalysis,
        });
        setState(prev => ({
            ...prev,
            isDiscovering: true,
            error: null,
            progress: { phase: 'initializing', progress: 0 },
            cancellationToken: token,
        }));
        try {
            const electronAPI = (0,_lib_electron_api_fallback__WEBPACK_IMPORTED_MODULE_3__.getElectronAPI)();
            // Execute discovery module with credentials from the profile
            const result = await electronAPI.executeDiscoveryModule('AWS', selectedSourceProfile.companyName, {
                Regions: state.config.awsRegions,
                ResourceTypes: state.config.resourceTypes,
                IncludeTagDetails: state.config.includeTagDetails,
                IncludeCostEstimates: state.config.includeCostEstimates,
                IncludeSecurityAnalysis: state.config.includeSecurityAnalysis,
            }, {
                timeout: state.config.timeout || 300000,
            });
            if (result.success) {
                console.log(`[AWSDiscoveryHook] ✅ AWS discovery completed successfully`);
            }
            else {
                console.error(`[AWSDiscoveryHook] ❌ AWS discovery failed:`, result.error);
            }
        }
        catch (error) {
            console.error(`[AWSDiscoveryHook] Error:`, error);
            setState(prev => ({
                ...prev,
                isDiscovering: false,
                error: error.message || 'Unknown error occurred during AWS discovery',
                progress: null,
                cancellationToken: null,
            }));
        }
    }, [state.config, selectedSourceProfile]);
    /**
     * Cancel ongoing discovery
     */
    const cancelDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!state.cancellationToken)
            return;
        try {
            await window.electronAPI.cancelExecution(state.cancellationToken);
            setState(prev => ({
                ...prev,
                isDiscovering: false,
                progress: null,
                cancellationToken: null,
            }));
        }
        catch (error) {
            console.error('Failed to cancel discovery:', error);
            setState(prev => ({
                ...prev,
                isDiscovering: false,
                progress: null,
                cancellationToken: null,
            }));
        }
    }, [state.cancellationToken]);
    /**
     * Update discovery configuration
     */
    const setConfig = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((updates) => {
        setState(prev => ({
            ...prev,
            config: typeof updates === 'function' ? updates(prev.config) : { ...prev.config, ...updates },
        }));
    }, []);
    /**
     * Update filter state
     */
    const setFilter = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((updates) => {
        setState(prev => ({
            ...prev,
            filter: typeof updates === 'function' ? updates(prev.filter) : { ...prev.filter, ...updates },
        }));
    }, []);
    /**
     * Set active tab
     */
    const setActiveTab = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((tab) => {
        setState(prev => ({ ...prev, activeTab: tab }));
    }, []);
    /**
     * Export to CSV
     */
    const exportToCSV = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!state.result)
            return;
        try {
            const dataToExport = getDataForActiveTab();
            const csvContent = convertToCSV(dataToExport);
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Common/ExportUtilities.psm1',
                functionName: 'Export-ToCSV',
                parameters: {
                    Data: csvContent,
                    FileName: `aws-${state.activeTab}-discovery-${Date.now()}.csv`,
                },
            });
        }
        catch (error) {
            console.error('Failed to export to CSV:', error);
        }
    }, [state.result, state.activeTab]);
    /**
     * Export to Excel
     */
    const exportToExcel = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!state.result)
            return;
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/AWSCloudDiscovery.psm1',
                functionName: 'Export-AWSDiscoveryResults',
                parameters: {
                    Result: state.result,
                    Format: 'Excel',
                    FileName: `aws-discovery-${Date.now()}.xlsx`,
                },
            });
        }
        catch (error) {
            console.error('Failed to export to Excel:', error);
        }
    }, [state.result]);
    /**
     * Get data for the currently active tab
     */
    const getDataForActiveTab = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        if (!state.result)
            return [];
        switch (state.activeTab) {
            case 'ec2':
                return state.result.ec2Instances || [];
            case 's3':
                return state.result.s3Buckets || [];
            case 'rds':
                return state.result.rdsInstances || [];
            case 'overview':
            default:
                return [];
        }
    }, [state.result, state.activeTab]);
    /**
     * Column definitions for EC2 instances
     */
    const ec2Columns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'instanceId', headerName: 'Instance ID', sortable: true, filter: true, flex: 1 },
        { field: 'instanceType', headerName: 'Type', sortable: true, filter: true, flex: 1 },
        { field: 'state', headerName: 'State', sortable: true, filter: true, flex: 1,
            cellStyle: (params) => {
                if (params.value === 'running')
                    return { color: 'green' };
                if (params.value === 'stopped')
                    return { color: 'red' };
                return undefined;
            }
        },
        { field: 'region', headerName: 'Region', sortable: true, filter: true, flex: 1 },
        { field: 'availabilityZone', headerName: 'AZ', sortable: true, filter: true, flex: 1 },
        { field: 'privateIpAddress', headerName: 'Private IP', sortable: true, flex: 1 },
        { field: 'publicIpAddress', headerName: 'Public IP', sortable: true, flex: 1 },
        { field: 'vpcId', headerName: 'VPC', sortable: true, filter: true, flex: 1 },
        { field: 'subnetId', headerName: 'Subnet', sortable: true, filter: true, flex: 1 },
        { field: 'estimatedMonthlyCost', headerName: 'Est. Monthly Cost', sortable: true,
            valueFormatter: (p) => p.value ? `$${(p.value ?? 0).toFixed(2)}` : '-', flex: 1 },
        { field: 'launchTime', headerName: 'Launch Time', sortable: true,
            valueFormatter: (p) => p.value ? new Date(p.value).toLocaleString() : '-', flex: 1 },
    ], []);
    /**
     * Column definitions for S3 buckets
     */
    const s3Columns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'name', headerName: 'Bucket Name', sortable: true, filter: true, flex: 2 },
        { field: 'region', headerName: 'Region', sortable: true, filter: true, flex: 1 },
        { field: 'creationDate', headerName: 'Created', sortable: true,
            valueFormatter: (p) => p.value ? new Date(p.value).toLocaleDateString() : '-', flex: 1 },
        { field: 'encryption.enabled', headerName: 'Encrypted', sortable: true, flex: 1,
            cellRenderer: (params) => params.data.encryption?.enabled ? 'Yes' : 'No' },
        { field: 'versioning', headerName: 'Versioning', sortable: true, flex: 1,
            cellRenderer: (params) => params.value ? 'Enabled' : 'Disabled' },
        { field: 'publicAccess', headerName: 'Public Access', sortable: true, flex: 1,
            cellStyle: (params) => params.value ? { color: 'red', fontWeight: 'bold' } : undefined },
        { field: 'totalSize', headerName: 'Size', sortable: true,
            valueFormatter: (p) => p.value ? formatBytes(p.value) : '-', flex: 1 },
        { field: 'objectCount', headerName: 'Objects', sortable: true,
            valueFormatter: (p) => p.value ? p.value.toLocaleString() : '-', flex: 1 },
        { field: 'estimatedMonthlyCost', headerName: 'Est. Monthly Cost', sortable: true,
            valueFormatter: (p) => p.value ? `$${(p.value ?? 0).toFixed(2)}` : '-', flex: 1 },
    ], []);
    /**
     * Column definitions for RDS instances
     */
    const rdsColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'instanceIdentifier', headerName: 'Instance ID', sortable: true, filter: true, flex: 2 },
        { field: 'engine', headerName: 'Engine', sortable: true, filter: true, flex: 1 },
        { field: 'engineVersion', headerName: 'Version', sortable: true, flex: 1 },
        { field: 'status', headerName: 'Status', sortable: true, filter: true, flex: 1,
            cellStyle: (params) => {
                if (params.value === 'available')
                    return { color: 'green' };
                if (params.value === 'stopped')
                    return { color: 'red' };
                return undefined;
            }
        },
        { field: 'instanceClass', headerName: 'Class', sortable: true, filter: true, flex: 1 },
        { field: 'region', headerName: 'Region', sortable: true, filter: true, flex: 1 },
        { field: 'availabilityZone', headerName: 'AZ', sortable: true, flex: 1 },
        { field: 'multiAZ', headerName: 'Multi-AZ', sortable: true, flex: 1,
            cellRenderer: (params) => params.value ? 'Yes' : 'No' },
        { field: 'storageEncrypted', headerName: 'Encrypted', sortable: true, flex: 1,
            cellRenderer: (params) => params.value ? 'Yes' : 'No' },
        { field: 'allocatedStorage', headerName: 'Storage (GB)', sortable: true, flex: 1 },
        { field: 'estimatedMonthlyCost', headerName: 'Est. Monthly Cost', sortable: true,
            valueFormatter: (p) => p.value ? `$${(p.value ?? 0).toFixed(2)}` : '-', flex: 1 },
    ], []);
    /**
     * Filtered data for EC2 instances
     */
    const filteredEC2 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.result?.ec2Instances)
            return [];
        return filterData(state.result.ec2Instances, state.filter, debouncedSearch);
    }, [state.result, state.filter, debouncedSearch]);
    /**
     * Filtered data for S3 buckets
     */
    const filteredS3 = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.result?.s3Buckets)
            return [];
        return filterData(state.result.s3Buckets, state.filter, debouncedSearch);
    }, [state.result, state.filter, debouncedSearch]);
    /**
     * Filtered data for RDS instances
     */
    const filteredRDS = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.result?.rdsInstances)
            return [];
        return filterData(state.result.rdsInstances, state.filter, debouncedSearch);
    }, [state.result, state.filter, debouncedSearch]);
    /**
     * Dynamic columns based on active tab
     */
    const columns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        switch (state.activeTab) {
            case 'ec2':
                return ec2Columns;
            case 's3':
                return s3Columns;
            case 'rds':
                return rdsColumns;
            case 'overview':
            default:
                return [];
        }
    }, [state.activeTab, ec2Columns, s3Columns, rdsColumns]);
    /**
     * Dynamic filtered data based on active tab
     */
    const filteredData = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        switch (state.activeTab) {
            case 'ec2':
                return filteredEC2;
            case 's3':
                return filteredS3;
            case 'rds':
                return filteredRDS;
            case 'overview':
            default:
                return [];
        }
    }, [state.activeTab, filteredEC2, filteredS3, filteredRDS]);
    /**
     * Calculate statistics
     */
    const stats = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.result)
            return null;
        const totalResources = (state.result.ec2Instances?.length || 0) +
            (state.result.s3Buckets?.length || 0) +
            (state.result.rdsInstances?.length || 0);
        const estimatedCost = (state.result.estimatedMonthlyCost || 0);
        const securityRisks = (state.result.securityFindings?.length || 0);
        return {
            totalResources,
            ec2Count: state.result.ec2Instances?.length || 0,
            s3Count: state.result.s3Buckets?.length || 0,
            rdsCount: state.result.rdsInstances?.length || 0,
            estimatedCost,
            securityRisks,
            totalFound: totalResources,
        };
    }, [state.result]);
    return {
        // Configuration
        config: state.config,
        setConfig,
        // Discovery state
        result: state.result,
        isDiscovering: state.isDiscovering,
        progress: state.progress?.progress || 0,
        error: state.error,
        // Filtering
        filter: state.filter,
        setFilter,
        // Actions
        startDiscovery,
        cancelDiscovery,
        exportToCSV,
        exportToExcel,
        // Tab management
        activeTab: state.activeTab,
        setActiveTab,
        // Data for active tab (dynamic based on activeTab)
        columns,
        filteredData,
        // Statistics
        stats,
    };
};
/**
 * Filter data based on filter state and search text
 */
function filterData(data, filter, searchText) {
    return (data ?? []).filter(item => {
        // Search text filter
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            const matchesSearch = Object.values(item).some(value => value && value.toString().toLowerCase().includes(searchLower));
            if (!matchesSearch)
                return false;
        }
        // Region filter
        if (filter.selectedRegions.length > 0 && !filter.selectedRegions.includes(item.region)) {
            return false;
        }
        // State filter (for EC2 instances)
        if (filter.selectedStates.length > 0 && item.state && !filter.selectedStates.includes(item.state)) {
            return false;
        }
        // Security risks filter
        if (filter.showOnlySecurityRisks && !item.securityFindings?.length) {
            return false;
        }
        return true;
    });
}
/**
 * Convert data to CSV format
 */
function convertToCSV(data) {
    if (!data || data.length === 0)
        return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            return JSON.stringify(value ?? '');
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}
/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


/***/ }),

/***/ 99305:
/*!*******************************************!*\
  !*** ./src/renderer/hooks/useDebounce.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useDebounce: () => (/* binding */ useDebounce)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);
/**
 * Debounce Hook
 *
 * Returns a debounced value that only updates after the specified delay.
 * Useful for search inputs and expensive operations.
 */

/**
 * Debounce a value
 * @param value Value to debounce
 * @param delay Delay in milliseconds (default: 500ms)
 * @returns Debounced value
 */
function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(value);
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        // Set up a timeout to update the debounced value
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        // Cleanup timeout on value change or unmount
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ((/* unused pure expression or super */ null && (useDebounce)));


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QVE7QUFDeEQsSUFBSSxnREFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0Esc0VBQWUsMkRBQVcsSUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL1Byb2dyZXNzQmFyLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VBV1NEaXNjb3ZlcnlMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VEZWJvdW5jZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBQcm9ncmVzc0JhciBDb21wb25lbnRcbiAqXG4gKiBQcm9ncmVzcyBpbmRpY2F0b3Igd2l0aCBwZXJjZW50YWdlIGRpc3BsYXkgYW5kIG9wdGlvbmFsIGxhYmVsLlxuICogU3VwcG9ydHMgZGlmZmVyZW50IHZhcmlhbnRzIGFuZCBzaXplcy5cbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4Jztcbi8qKlxuICogUHJvZ3Jlc3NCYXIgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBQcm9ncmVzc0JhciA9ICh7IHZhbHVlLCBtYXggPSAxMDAsIHZhcmlhbnQgPSAnZGVmYXVsdCcsIHNpemUgPSAnbWQnLCBzaG93TGFiZWwgPSB0cnVlLCBsYWJlbCwgbGFiZWxQb3NpdGlvbiA9ICdpbnNpZGUnLCBzdHJpcGVkID0gZmFsc2UsIGFuaW1hdGVkID0gZmFsc2UsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICAvLyBDYWxjdWxhdGUgcGVyY2VudGFnZVxuICAgIGNvbnN0IHBlcmNlbnRhZ2UgPSBNYXRoLm1pbigxMDAsIE1hdGgubWF4KDAsICh2YWx1ZSAvIG1heCkgKiAxMDApKTtcbiAgICAvLyBWYXJpYW50IGNvbG9yc1xuICAgIGNvbnN0IHZhcmlhbnRDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctYmx1ZS02MDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tNjAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy02MDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtNjAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tNjAwJyxcbiAgICB9O1xuICAgIC8vIEJhY2tncm91bmQgY29sb3JzXG4gICAgY29uc3QgYmdDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctYmx1ZS0xMDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tMTAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy0xMDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtMTAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tMTAwJyxcbiAgICB9O1xuICAgIC8vIFNpemUgY2xhc3Nlc1xuICAgIGNvbnN0IHNpemVDbGFzc2VzID0ge1xuICAgICAgICBzbTogJ2gtMicsXG4gICAgICAgIG1kOiAnaC00JyxcbiAgICAgICAgbGc6ICdoLTYnLFxuICAgIH07XG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ3ctZnVsbCcsIGNsYXNzTmFtZSk7XG4gICAgY29uc3QgdHJhY2tDbGFzc2VzID0gY2xzeCgndy1mdWxsIHJvdW5kZWQtZnVsbCBvdmVyZmxvdy1oaWRkZW4nLCBiZ0NsYXNzZXNbdmFyaWFudF0sIHNpemVDbGFzc2VzW3NpemVdKTtcbiAgICBjb25zdCBiYXJDbGFzc2VzID0gY2xzeCgnaC1mdWxsIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTMwMCBlYXNlLW91dCcsIHZhcmlhbnRDbGFzc2VzW3ZhcmlhbnRdLCB7XG4gICAgICAgIC8vIFN0cmlwZWQgcGF0dGVyblxuICAgICAgICAnYmctZ3JhZGllbnQtdG8tciBmcm9tLXRyYW5zcGFyZW50IHZpYS1ibGFjay8xMCB0by10cmFuc3BhcmVudCBiZy1bbGVuZ3RoOjFyZW1fMTAwJV0nOiBzdHJpcGVkLFxuICAgICAgICAnYW5pbWF0ZS1wcm9ncmVzcy1zdHJpcGVzJzogc3RyaXBlZCAmJiBhbmltYXRlZCxcbiAgICB9KTtcbiAgICBjb25zdCBsYWJlbFRleHQgPSBsYWJlbCB8fCAoc2hvd0xhYmVsID8gYCR7TWF0aC5yb3VuZChwZXJjZW50YWdlKX0lYCA6ICcnKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW2xhYmVsVGV4dCAmJiBsYWJlbFBvc2l0aW9uID09PSAnb3V0c2lkZScgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTFcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMFwiLCBjaGlsZHJlbjogbGFiZWxUZXh0IH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogdHJhY2tDbGFzc2VzLCByb2xlOiBcInByb2dyZXNzYmFyXCIsIFwiYXJpYS12YWx1ZW5vd1wiOiB2YWx1ZSwgXCJhcmlhLXZhbHVlbWluXCI6IDAsIFwiYXJpYS12YWx1ZW1heFwiOiBtYXgsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBiYXJDbGFzc2VzLCBzdHlsZTogeyB3aWR0aDogYCR7cGVyY2VudGFnZX0lYCB9LCBjaGlsZHJlbjogbGFiZWxUZXh0ICYmIGxhYmVsUG9zaXRpb24gPT09ICdpbnNpZGUnICYmIHNpemUgIT09ICdzbScgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgaC1mdWxsIHB4LTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXdoaXRlIHdoaXRlc3BhY2Utbm93cmFwXCIsIGNoaWxkcmVuOiBsYWJlbFRleHQgfSkgfSkpIH0pIH0pXSB9KSk7XG59O1xuLy8gQWRkIGFuaW1hdGlvbiBmb3Igc3RyaXBlZCBwcm9ncmVzcyBiYXJzXG5jb25zdCBzdHlsZXMgPSBgXHJcbkBrZXlmcmFtZXMgcHJvZ3Jlc3Mtc3RyaXBlcyB7XHJcbiAgZnJvbSB7XHJcbiAgICBiYWNrZ3JvdW5kLXBvc2l0aW9uOiAxcmVtIDA7XHJcbiAgfVxyXG4gIHRvIHtcclxuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMDtcclxuICB9XHJcbn1cclxuXHJcbi5hbmltYXRlLXByb2dyZXNzLXN0cmlwZXMge1xyXG4gIGFuaW1hdGlvbjogcHJvZ3Jlc3Mtc3RyaXBlcyAxcyBsaW5lYXIgaW5maW5pdGU7XHJcbn1cclxuYDtcbi8vIEluamVjdCBzdHlsZXNcbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmICFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvZ3Jlc3MtYmFyLXN0eWxlcycpKSB7XG4gICAgY29uc3Qgc3R5bGVTaGVldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgc3R5bGVTaGVldC5pZCA9ICdwcm9ncmVzcy1iYXItc3R5bGVzJztcbiAgICBzdHlsZVNoZWV0LnRleHRDb250ZW50ID0gc3R5bGVzO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVTaGVldCk7XG59XG5leHBvcnQgZGVmYXVsdCBQcm9ncmVzc0JhcjtcbiIsIi8qKlxuICogQVdTIENsb3VkIEluZnJhc3RydWN0dXJlIERpc2NvdmVyeSBWaWV3IExvZ2ljIEhvb2tcbiAqIE1hbmFnZXMgc3RhdGUgYW5kIGJ1c2luZXNzIGxvZ2ljIGZvciBBV1MgcmVzb3VyY2UgZGlzY292ZXJ5IG9wZXJhdGlvbnNcbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VEZWJvdW5jZSB9IGZyb20gJy4vdXNlRGVib3VuY2UnO1xuaW1wb3J0IHsgdXNlUHJvZmlsZVN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlUHJvZmlsZVN0b3JlJztcbmltcG9ydCB7IGdldEVsZWN0cm9uQVBJIH0gZnJvbSAnLi4vbGliL2VsZWN0cm9uLWFwaS1mYWxsYmFjayc7XG4vKipcbiAqIEFXUyBDbG91ZCBJbmZyYXN0cnVjdHVyZSBEaXNjb3ZlcnkgTG9naWMgSG9va1xuICovXG5leHBvcnQgY29uc3QgdXNlQVdTRGlzY292ZXJ5TG9naWMgPSAoKSA9PiB7XG4gICAgLy8gR2V0IHNlbGVjdGVkIGNvbXBhbnkgcHJvZmlsZSBmcm9tIHN0b3JlXG4gICAgY29uc3Qgc2VsZWN0ZWRTb3VyY2VQcm9maWxlID0gdXNlUHJvZmlsZVN0b3JlKChzdGF0ZSkgPT4gc3RhdGUuc2VsZWN0ZWRTb3VyY2VQcm9maWxlKTtcbiAgICAvLyBTdGF0ZVxuICAgIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGUoe1xuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgIGF3c1JlZ2lvbnM6IFsndXMtZWFzdC0xJ10sXG4gICAgICAgICAgICByZXNvdXJjZVR5cGVzOiBbJ2VjMicsICdzMycsICdyZHMnXSxcbiAgICAgICAgICAgIGluY2x1ZGVUYWdEZXRhaWxzOiB0cnVlLFxuICAgICAgICAgICAgaW5jbHVkZUNvc3RFc3RpbWF0ZXM6IHRydWUsXG4gICAgICAgICAgICBpbmNsdWRlU2VjdXJpdHlBbmFseXNpczogdHJ1ZSxcbiAgICAgICAgICAgIHRpbWVvdXQ6IDMwMDAwMCxcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdWx0OiBudWxsLFxuICAgICAgICBmaWx0ZXI6IHtcbiAgICAgICAgICAgIHNlYXJjaFRleHQ6ICcnLFxuICAgICAgICAgICAgc2VsZWN0ZWRSZWdpb25zOiBbXSxcbiAgICAgICAgICAgIHNlbGVjdGVkUmVzb3VyY2VUeXBlczogW10sXG4gICAgICAgICAgICBzZWxlY3RlZFN0YXRlczogW10sXG4gICAgICAgICAgICBzaG93T25seVNlY3VyaXR5Umlza3M6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgcHJvZ3Jlc3M6IG51bGwsXG4gICAgICAgIGFjdGl2ZVRhYjogJ292ZXJ2aWV3JyxcbiAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBudWxsLFxuICAgIH0pO1xuICAgIGNvbnN0IGRlYm91bmNlZFNlYXJjaCA9IHVzZURlYm91bmNlKHN0YXRlLmZpbHRlci5zZWFyY2hUZXh0LCAzMDApO1xuICAgIC8vIFN1YnNjcmliZSB0byBkaXNjb3ZlcnkgcHJvZ3Jlc3MgYW5kIG91dHB1dCBldmVudHNcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZVByb2dyZXNzID0gd2luZG93LmVsZWN0cm9uLm9uRGlzY292ZXJ5UHJvZ3Jlc3MoKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLmV4ZWN1dGlvbklkID09PSBzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBoYXNlOiBkYXRhLmN1cnJlbnRQaGFzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiBkYXRhLnBlcmNlbnRhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50UmVnaW9uOiBkYXRhLmN1cnJlbnRJdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFJlc291cmNlVHlwZTogZGF0YS5jdXJyZW50UGhhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtc1Byb2Nlc3NlZDogZGF0YS5pdGVtc1Byb2Nlc3NlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsSXRlbXM6IGRhdGEudG90YWxJdGVtcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGAke2RhdGEuY3VycmVudFBoYXNlfSAoJHtkYXRhLml0ZW1zUHJvY2Vzc2VkIHx8IDB9LyR7ZGF0YS50b3RhbEl0ZW1zIHx8IDB9KWAsXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZU91dHB1dCA9IHdpbmRvdy5lbGVjdHJvbi5vbkRpc2NvdmVyeU91dHB1dCgoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEuZXhlY3V0aW9uSWQgPT09IHN0YXRlLmNhbmNlbGxhdGlvblRva2VuKSB7XG4gICAgICAgICAgICAgICAgLy8gUmVzdWx0cyBhcmUgaGFuZGxlZCBieSBvbkRpc2NvdmVyeUNvbXBsZXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZUNvbXBsZXRlID0gd2luZG93LmVsZWN0cm9uLm9uRGlzY292ZXJ5Q29tcGxldGUoKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLmV4ZWN1dGlvbklkID09PSBzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBkYXRhLnJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbjogbnVsbCxcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZUVycm9yID0gd2luZG93LmVsZWN0cm9uLm9uRGlzY292ZXJ5RXJyb3IoKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLmV4ZWN1dGlvbklkID09PSBzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBkYXRhLmVycm9yLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IG51bGwsXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGlmICh1bnN1YnNjcmliZVByb2dyZXNzKVxuICAgICAgICAgICAgICAgIHVuc3Vic2NyaWJlUHJvZ3Jlc3MoKTtcbiAgICAgICAgICAgIGlmICh1bnN1YnNjcmliZU91dHB1dClcbiAgICAgICAgICAgICAgICB1bnN1YnNjcmliZU91dHB1dCgpO1xuICAgICAgICAgICAgaWYgKHVuc3Vic2NyaWJlQ29tcGxldGUpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmVDb21wbGV0ZSgpO1xuICAgICAgICAgICAgaWYgKHVuc3Vic2NyaWJlRXJyb3IpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmVFcnJvcigpO1xuICAgICAgICB9O1xuICAgIH0sIFtzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbl0pO1xuICAgIC8qKlxuICAgICAqIFN0YXJ0IEFXUyBEaXNjb3ZlcnlcbiAgICAgKi9cbiAgICBjb25zdCBzdGFydERpc2NvdmVyeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgYSBwcm9maWxlIGlzIHNlbGVjdGVkXG4gICAgICAgIGlmICghc2VsZWN0ZWRTb3VyY2VQcm9maWxlKSB7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICBlcnJvcjogJ05vIGNvbXBhbnkgcHJvZmlsZSBzZWxlY3RlZC4gUGxlYXNlIHNlbGVjdCBhIHByb2ZpbGUgZmlyc3QuJyxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB0b2tlbiA9IGBhd3MtZGlzY292ZXJ5LSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSl9YDtcbiAgICAgICAgY29uc29sZS5sb2coYFtBV1NEaXNjb3ZlcnlIb29rXSBTdGFydGluZyBBV1MgZGlzY292ZXJ5IGZvciBjb21wYW55OiAke3NlbGVjdGVkU291cmNlUHJvZmlsZS5jb21wYW55TmFtZX1gKTtcbiAgICAgICAgY29uc29sZS5sb2coYFtBV1NEaXNjb3ZlcnlIb29rXSBQYXJhbWV0ZXJzOmAsIHtcbiAgICAgICAgICAgIHJlZ2lvbnM6IHN0YXRlLmNvbmZpZy5hd3NSZWdpb25zLFxuICAgICAgICAgICAgcmVzb3VyY2VUeXBlczogc3RhdGUuY29uZmlnLnJlc291cmNlVHlwZXMsXG4gICAgICAgICAgICBpbmNsdWRlVGFnRGV0YWlsczogc3RhdGUuY29uZmlnLmluY2x1ZGVUYWdEZXRhaWxzLFxuICAgICAgICAgICAgaW5jbHVkZUNvc3RFc3RpbWF0ZXM6IHN0YXRlLmNvbmZpZy5pbmNsdWRlQ29zdEVzdGltYXRlcyxcbiAgICAgICAgICAgIGluY2x1ZGVTZWN1cml0eUFuYWx5c2lzOiBzdGF0ZS5jb25maWcuaW5jbHVkZVNlY3VyaXR5QW5hbHlzaXMsXG4gICAgICAgIH0pO1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogdHJ1ZSxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IHsgcGhhc2U6ICdpbml0aWFsaXppbmcnLCBwcm9ncmVzczogMCB9LFxuICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IHRva2VuLFxuICAgICAgICB9KSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBlbGVjdHJvbkFQSSA9IGdldEVsZWN0cm9uQVBJKCk7XG4gICAgICAgICAgICAvLyBFeGVjdXRlIGRpc2NvdmVyeSBtb2R1bGUgd2l0aCBjcmVkZW50aWFscyBmcm9tIHRoZSBwcm9maWxlXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBlbGVjdHJvbkFQSS5leGVjdXRlRGlzY292ZXJ5TW9kdWxlKCdBV1MnLCBzZWxlY3RlZFNvdXJjZVByb2ZpbGUuY29tcGFueU5hbWUsIHtcbiAgICAgICAgICAgICAgICBSZWdpb25zOiBzdGF0ZS5jb25maWcuYXdzUmVnaW9ucyxcbiAgICAgICAgICAgICAgICBSZXNvdXJjZVR5cGVzOiBzdGF0ZS5jb25maWcucmVzb3VyY2VUeXBlcyxcbiAgICAgICAgICAgICAgICBJbmNsdWRlVGFnRGV0YWlsczogc3RhdGUuY29uZmlnLmluY2x1ZGVUYWdEZXRhaWxzLFxuICAgICAgICAgICAgICAgIEluY2x1ZGVDb3N0RXN0aW1hdGVzOiBzdGF0ZS5jb25maWcuaW5jbHVkZUNvc3RFc3RpbWF0ZXMsXG4gICAgICAgICAgICAgICAgSW5jbHVkZVNlY3VyaXR5QW5hbHlzaXM6IHN0YXRlLmNvbmZpZy5pbmNsdWRlU2VjdXJpdHlBbmFseXNpcyxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiBzdGF0ZS5jb25maWcudGltZW91dCB8fCAzMDAwMDAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbQVdTRGlzY292ZXJ5SG9va10g4pyFIEFXUyBkaXNjb3ZlcnkgY29tcGxldGVkIHN1Y2Nlc3NmdWxseWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW0FXU0Rpc2NvdmVyeUhvb2tdIOKdjCBBV1MgZGlzY292ZXJ5IGZhaWxlZDpgLCByZXN1bHQuZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW0FXU0Rpc2NvdmVyeUhvb2tdIEVycm9yOmAsIGVycm9yKTtcbiAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICdVbmtub3duIGVycm9yIG9jY3VycmVkIGR1cmluZyBBV1MgZGlzY292ZXJ5JyxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogbnVsbCxcbiAgICAgICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbjogbnVsbCxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5jb25maWcsIHNlbGVjdGVkU291cmNlUHJvZmlsZV0pO1xuICAgIC8qKlxuICAgICAqIENhbmNlbCBvbmdvaW5nIGRpc2NvdmVyeVxuICAgICAqL1xuICAgIGNvbnN0IGNhbmNlbERpc2NvdmVyeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5jYW5jZWxFeGVjdXRpb24oc3RhdGUuY2FuY2VsbGF0aW9uVG9rZW4pO1xuICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IG51bGwsXG4gICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IG51bGwsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2FuY2VsIGRpc2NvdmVyeTonLCBlcnJvcik7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogbnVsbCxcbiAgICAgICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbjogbnVsbCxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbl0pO1xuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBkaXNjb3ZlcnkgY29uZmlndXJhdGlvblxuICAgICAqL1xuICAgIGNvbnN0IHNldENvbmZpZyA9IHVzZUNhbGxiYWNrKCh1cGRhdGVzKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBjb25maWc6IHR5cGVvZiB1cGRhdGVzID09PSAnZnVuY3Rpb24nID8gdXBkYXRlcyhwcmV2LmNvbmZpZykgOiB7IC4uLnByZXYuY29uZmlnLCAuLi51cGRhdGVzIH0sXG4gICAgICAgIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogVXBkYXRlIGZpbHRlciBzdGF0ZVxuICAgICAqL1xuICAgIGNvbnN0IHNldEZpbHRlciA9IHVzZUNhbGxiYWNrKCh1cGRhdGVzKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBmaWx0ZXI6IHR5cGVvZiB1cGRhdGVzID09PSAnZnVuY3Rpb24nID8gdXBkYXRlcyhwcmV2LmZpbHRlcikgOiB7IC4uLnByZXYuZmlsdGVyLCAuLi51cGRhdGVzIH0sXG4gICAgICAgIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogU2V0IGFjdGl2ZSB0YWJcbiAgICAgKi9cbiAgICBjb25zdCBzZXRBY3RpdmVUYWIgPSB1c2VDYWxsYmFjaygodGFiKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgYWN0aXZlVGFiOiB0YWIgfSkpO1xuICAgIH0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBFeHBvcnQgdG8gQ1NWXG4gICAgICovXG4gICAgY29uc3QgZXhwb3J0VG9DU1YgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghc3RhdGUucmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZGF0YVRvRXhwb3J0ID0gZ2V0RGF0YUZvckFjdGl2ZVRhYigpO1xuICAgICAgICAgICAgY29uc3QgY3N2Q29udGVudCA9IGNvbnZlcnRUb0NTVihkYXRhVG9FeHBvcnQpO1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0NvbW1vbi9FeHBvcnRVdGlsaXRpZXMucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnRXhwb3J0LVRvQ1NWJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIERhdGE6IGNzdkNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgIEZpbGVOYW1lOiBgYXdzLSR7c3RhdGUuYWN0aXZlVGFifS1kaXNjb3ZlcnktJHtEYXRlLm5vdygpfS5jc3ZgLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBleHBvcnQgdG8gQ1NWOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5yZXN1bHQsIHN0YXRlLmFjdGl2ZVRhYl0pO1xuICAgIC8qKlxuICAgICAqIEV4cG9ydCB0byBFeGNlbFxuICAgICAqL1xuICAgIGNvbnN0IGV4cG9ydFRvRXhjZWwgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghc3RhdGUucmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0Rpc2NvdmVyeS9BV1NDbG91ZERpc2NvdmVyeS5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdFeHBvcnQtQVdTRGlzY292ZXJ5UmVzdWx0cycsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBSZXN1bHQ6IHN0YXRlLnJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgRm9ybWF0OiAnRXhjZWwnLFxuICAgICAgICAgICAgICAgICAgICBGaWxlTmFtZTogYGF3cy1kaXNjb3ZlcnktJHtEYXRlLm5vdygpfS54bHN4YCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZXhwb3J0IHRvIEV4Y2VsOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5yZXN1bHRdKTtcbiAgICAvKipcbiAgICAgKiBHZXQgZGF0YSBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgdGFiXG4gICAgICovXG4gICAgY29uc3QgZ2V0RGF0YUZvckFjdGl2ZVRhYiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKCFzdGF0ZS5yZXN1bHQpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIHN3aXRjaCAoc3RhdGUuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICBjYXNlICdlYzInOlxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZS5yZXN1bHQuZWMySW5zdGFuY2VzIHx8IFtdO1xuICAgICAgICAgICAgY2FzZSAnczMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZS5yZXN1bHQuczNCdWNrZXRzIHx8IFtdO1xuICAgICAgICAgICAgY2FzZSAncmRzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGUucmVzdWx0LnJkc0luc3RhbmNlcyB8fCBbXTtcbiAgICAgICAgICAgIGNhc2UgJ292ZXJ2aWV3JzpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgfSwgW3N0YXRlLnJlc3VsdCwgc3RhdGUuYWN0aXZlVGFiXSk7XG4gICAgLyoqXG4gICAgICogQ29sdW1uIGRlZmluaXRpb25zIGZvciBFQzIgaW5zdGFuY2VzXG4gICAgICovXG4gICAgY29uc3QgZWMyQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7IGZpZWxkOiAnaW5zdGFuY2VJZCcsIGhlYWRlck5hbWU6ICdJbnN0YW5jZSBJRCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEgfSxcbiAgICAgICAgeyBmaWVsZDogJ2luc3RhbmNlVHlwZScsIGhlYWRlck5hbWU6ICdUeXBlJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMSB9LFxuICAgICAgICB7IGZpZWxkOiAnc3RhdGUnLCBoZWFkZXJOYW1lOiAnU3RhdGUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAxLFxuICAgICAgICAgICAgY2VsbFN0eWxlOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtcy52YWx1ZSA9PT0gJ3J1bm5pbmcnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBjb2xvcjogJ2dyZWVuJyB9O1xuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMudmFsdWUgPT09ICdzdG9wcGVkJylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgY29sb3I6ICdyZWQnIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgeyBmaWVsZDogJ3JlZ2lvbicsIGhlYWRlck5hbWU6ICdSZWdpb24nLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAxIH0sXG4gICAgICAgIHsgZmllbGQ6ICdhdmFpbGFiaWxpdHlab25lJywgaGVhZGVyTmFtZTogJ0FaJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMSB9LFxuICAgICAgICB7IGZpZWxkOiAncHJpdmF0ZUlwQWRkcmVzcycsIGhlYWRlck5hbWU6ICdQcml2YXRlIElQJywgc29ydGFibGU6IHRydWUsIGZsZXg6IDEgfSxcbiAgICAgICAgeyBmaWVsZDogJ3B1YmxpY0lwQWRkcmVzcycsIGhlYWRlck5hbWU6ICdQdWJsaWMgSVAnLCBzb3J0YWJsZTogdHJ1ZSwgZmxleDogMSB9LFxuICAgICAgICB7IGZpZWxkOiAndnBjSWQnLCBoZWFkZXJOYW1lOiAnVlBDJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMSB9LFxuICAgICAgICB7IGZpZWxkOiAnc3VibmV0SWQnLCBoZWFkZXJOYW1lOiAnU3VibmV0Jywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMSB9LFxuICAgICAgICB7IGZpZWxkOiAnZXN0aW1hdGVkTW9udGhseUNvc3QnLCBoZWFkZXJOYW1lOiAnRXN0LiBNb250aGx5IENvc3QnLCBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocCkgPT4gcC52YWx1ZSA/IGAkJHsocC52YWx1ZSA/PyAwKS50b0ZpeGVkKDIpfWAgOiAnLScsIGZsZXg6IDEgfSxcbiAgICAgICAgeyBmaWVsZDogJ2xhdW5jaFRpbWUnLCBoZWFkZXJOYW1lOiAnTGF1bmNoIFRpbWUnLCBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocCkgPT4gcC52YWx1ZSA/IG5ldyBEYXRlKHAudmFsdWUpLnRvTG9jYWxlU3RyaW5nKCkgOiAnLScsIGZsZXg6IDEgfSxcbiAgICBdLCBbXSk7XG4gICAgLyoqXG4gICAgICogQ29sdW1uIGRlZmluaXRpb25zIGZvciBTMyBidWNrZXRzXG4gICAgICovXG4gICAgY29uc3QgczNDb2x1bW5zID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHsgZmllbGQ6ICduYW1lJywgaGVhZGVyTmFtZTogJ0J1Y2tldCBOYW1lJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMiB9LFxuICAgICAgICB7IGZpZWxkOiAncmVnaW9uJywgaGVhZGVyTmFtZTogJ1JlZ2lvbicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEgfSxcbiAgICAgICAgeyBmaWVsZDogJ2NyZWF0aW9uRGF0ZScsIGhlYWRlck5hbWU6ICdDcmVhdGVkJywgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHApID0+IHAudmFsdWUgPyBuZXcgRGF0ZShwLnZhbHVlKS50b0xvY2FsZURhdGVTdHJpbmcoKSA6ICctJywgZmxleDogMSB9LFxuICAgICAgICB7IGZpZWxkOiAnZW5jcnlwdGlvbi5lbmFibGVkJywgaGVhZGVyTmFtZTogJ0VuY3J5cHRlZCcsIHNvcnRhYmxlOiB0cnVlLCBmbGV4OiAxLFxuICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiAocGFyYW1zKSA9PiBwYXJhbXMuZGF0YS5lbmNyeXB0aW9uPy5lbmFibGVkID8gJ1llcycgOiAnTm8nIH0sXG4gICAgICAgIHsgZmllbGQ6ICd2ZXJzaW9uaW5nJywgaGVhZGVyTmFtZTogJ1ZlcnNpb25pbmcnLCBzb3J0YWJsZTogdHJ1ZSwgZmxleDogMSxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gJ0VuYWJsZWQnIDogJ0Rpc2FibGVkJyB9LFxuICAgICAgICB7IGZpZWxkOiAncHVibGljQWNjZXNzJywgaGVhZGVyTmFtZTogJ1B1YmxpYyBBY2Nlc3MnLCBzb3J0YWJsZTogdHJ1ZSwgZmxleDogMSxcbiAgICAgICAgICAgIGNlbGxTdHlsZTogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8geyBjb2xvcjogJ3JlZCcsIGZvbnRXZWlnaHQ6ICdib2xkJyB9IDogdW5kZWZpbmVkIH0sXG4gICAgICAgIHsgZmllbGQ6ICd0b3RhbFNpemUnLCBoZWFkZXJOYW1lOiAnU2l6ZScsIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwKSA9PiBwLnZhbHVlID8gZm9ybWF0Qnl0ZXMocC52YWx1ZSkgOiAnLScsIGZsZXg6IDEgfSxcbiAgICAgICAgeyBmaWVsZDogJ29iamVjdENvdW50JywgaGVhZGVyTmFtZTogJ09iamVjdHMnLCBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocCkgPT4gcC52YWx1ZSA/IHAudmFsdWUudG9Mb2NhbGVTdHJpbmcoKSA6ICctJywgZmxleDogMSB9LFxuICAgICAgICB7IGZpZWxkOiAnZXN0aW1hdGVkTW9udGhseUNvc3QnLCBoZWFkZXJOYW1lOiAnRXN0LiBNb250aGx5IENvc3QnLCBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocCkgPT4gcC52YWx1ZSA/IGAkJHsocC52YWx1ZSA/PyAwKS50b0ZpeGVkKDIpfWAgOiAnLScsIGZsZXg6IDEgfSxcbiAgICBdLCBbXSk7XG4gICAgLyoqXG4gICAgICogQ29sdW1uIGRlZmluaXRpb25zIGZvciBSRFMgaW5zdGFuY2VzXG4gICAgICovXG4gICAgY29uc3QgcmRzQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7IGZpZWxkOiAnaW5zdGFuY2VJZGVudGlmaWVyJywgaGVhZGVyTmFtZTogJ0luc3RhbmNlIElEJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMiB9LFxuICAgICAgICB7IGZpZWxkOiAnZW5naW5lJywgaGVhZGVyTmFtZTogJ0VuZ2luZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIGZsZXg6IDEgfSxcbiAgICAgICAgeyBmaWVsZDogJ2VuZ2luZVZlcnNpb24nLCBoZWFkZXJOYW1lOiAnVmVyc2lvbicsIHNvcnRhYmxlOiB0cnVlLCBmbGV4OiAxIH0sXG4gICAgICAgIHsgZmllbGQ6ICdzdGF0dXMnLCBoZWFkZXJOYW1lOiAnU3RhdHVzJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMSxcbiAgICAgICAgICAgIGNlbGxTdHlsZTogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMudmFsdWUgPT09ICdhdmFpbGFibGUnKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBjb2xvcjogJ2dyZWVuJyB9O1xuICAgICAgICAgICAgICAgIGlmIChwYXJhbXMudmFsdWUgPT09ICdzdG9wcGVkJylcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgY29sb3I6ICdyZWQnIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgeyBmaWVsZDogJ2luc3RhbmNlQ2xhc3MnLCBoZWFkZXJOYW1lOiAnQ2xhc3MnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCBmbGV4OiAxIH0sXG4gICAgICAgIHsgZmllbGQ6ICdyZWdpb24nLCBoZWFkZXJOYW1lOiAnUmVnaW9uJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgZmxleDogMSB9LFxuICAgICAgICB7IGZpZWxkOiAnYXZhaWxhYmlsaXR5Wm9uZScsIGhlYWRlck5hbWU6ICdBWicsIHNvcnRhYmxlOiB0cnVlLCBmbGV4OiAxIH0sXG4gICAgICAgIHsgZmllbGQ6ICdtdWx0aUFaJywgaGVhZGVyTmFtZTogJ011bHRpLUFaJywgc29ydGFibGU6IHRydWUsIGZsZXg6IDEsXG4gICAgICAgICAgICBjZWxsUmVuZGVyZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/ICdZZXMnIDogJ05vJyB9LFxuICAgICAgICB7IGZpZWxkOiAnc3RvcmFnZUVuY3J5cHRlZCcsIGhlYWRlck5hbWU6ICdFbmNyeXB0ZWQnLCBzb3J0YWJsZTogdHJ1ZSwgZmxleDogMSxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gJ1llcycgOiAnTm8nIH0sXG4gICAgICAgIHsgZmllbGQ6ICdhbGxvY2F0ZWRTdG9yYWdlJywgaGVhZGVyTmFtZTogJ1N0b3JhZ2UgKEdCKScsIHNvcnRhYmxlOiB0cnVlLCBmbGV4OiAxIH0sXG4gICAgICAgIHsgZmllbGQ6ICdlc3RpbWF0ZWRNb250aGx5Q29zdCcsIGhlYWRlck5hbWU6ICdFc3QuIE1vbnRobHkgQ29zdCcsIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwKSA9PiBwLnZhbHVlID8gYCQkeyhwLnZhbHVlID8/IDApLnRvRml4ZWQoMil9YCA6ICctJywgZmxleDogMSB9LFxuICAgIF0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBGaWx0ZXJlZCBkYXRhIGZvciBFQzIgaW5zdGFuY2VzXG4gICAgICovXG4gICAgY29uc3QgZmlsdGVyZWRFQzIgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFzdGF0ZS5yZXN1bHQ/LmVjMkluc3RhbmNlcylcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIGZpbHRlckRhdGEoc3RhdGUucmVzdWx0LmVjMkluc3RhbmNlcywgc3RhdGUuZmlsdGVyLCBkZWJvdW5jZWRTZWFyY2gpO1xuICAgIH0sIFtzdGF0ZS5yZXN1bHQsIHN0YXRlLmZpbHRlciwgZGVib3VuY2VkU2VhcmNoXSk7XG4gICAgLyoqXG4gICAgICogRmlsdGVyZWQgZGF0YSBmb3IgUzMgYnVja2V0c1xuICAgICAqL1xuICAgIGNvbnN0IGZpbHRlcmVkUzMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFzdGF0ZS5yZXN1bHQ/LnMzQnVja2V0cylcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIGZpbHRlckRhdGEoc3RhdGUucmVzdWx0LnMzQnVja2V0cywgc3RhdGUuZmlsdGVyLCBkZWJvdW5jZWRTZWFyY2gpO1xuICAgIH0sIFtzdGF0ZS5yZXN1bHQsIHN0YXRlLmZpbHRlciwgZGVib3VuY2VkU2VhcmNoXSk7XG4gICAgLyoqXG4gICAgICogRmlsdGVyZWQgZGF0YSBmb3IgUkRTIGluc3RhbmNlc1xuICAgICAqL1xuICAgIGNvbnN0IGZpbHRlcmVkUkRTID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghc3RhdGUucmVzdWx0Py5yZHNJbnN0YW5jZXMpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIHJldHVybiBmaWx0ZXJEYXRhKHN0YXRlLnJlc3VsdC5yZHNJbnN0YW5jZXMsIHN0YXRlLmZpbHRlciwgZGVib3VuY2VkU2VhcmNoKTtcbiAgICB9LCBbc3RhdGUucmVzdWx0LCBzdGF0ZS5maWx0ZXIsIGRlYm91bmNlZFNlYXJjaF0pO1xuICAgIC8qKlxuICAgICAqIER5bmFtaWMgY29sdW1ucyBiYXNlZCBvbiBhY3RpdmUgdGFiXG4gICAgICovXG4gICAgY29uc3QgY29sdW1ucyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHN0YXRlLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgY2FzZSAnZWMyJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gZWMyQ29sdW1ucztcbiAgICAgICAgICAgIGNhc2UgJ3MzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gczNDb2x1bW5zO1xuICAgICAgICAgICAgY2FzZSAncmRzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gcmRzQ29sdW1ucztcbiAgICAgICAgICAgIGNhc2UgJ292ZXJ2aWV3JzpcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgfSwgW3N0YXRlLmFjdGl2ZVRhYiwgZWMyQ29sdW1ucywgczNDb2x1bW5zLCByZHNDb2x1bW5zXSk7XG4gICAgLyoqXG4gICAgICogRHluYW1pYyBmaWx0ZXJlZCBkYXRhIGJhc2VkIG9uIGFjdGl2ZSB0YWJcbiAgICAgKi9cbiAgICBjb25zdCBmaWx0ZXJlZERhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgc3dpdGNoIChzdGF0ZS5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgIGNhc2UgJ2VjMic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcmVkRUMyO1xuICAgICAgICAgICAgY2FzZSAnczMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXJlZFMzO1xuICAgICAgICAgICAgY2FzZSAncmRzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyZWRSRFM7XG4gICAgICAgICAgICBjYXNlICdvdmVydmlldyc6XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5hY3RpdmVUYWIsIGZpbHRlcmVkRUMyLCBmaWx0ZXJlZFMzLCBmaWx0ZXJlZFJEU10pO1xuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSBzdGF0aXN0aWNzXG4gICAgICovXG4gICAgY29uc3Qgc3RhdHMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFzdGF0ZS5yZXN1bHQpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgdG90YWxSZXNvdXJjZXMgPSAoc3RhdGUucmVzdWx0LmVjMkluc3RhbmNlcz8ubGVuZ3RoIHx8IDApICtcbiAgICAgICAgICAgIChzdGF0ZS5yZXN1bHQuczNCdWNrZXRzPy5sZW5ndGggfHwgMCkgK1xuICAgICAgICAgICAgKHN0YXRlLnJlc3VsdC5yZHNJbnN0YW5jZXM/Lmxlbmd0aCB8fCAwKTtcbiAgICAgICAgY29uc3QgZXN0aW1hdGVkQ29zdCA9IChzdGF0ZS5yZXN1bHQuZXN0aW1hdGVkTW9udGhseUNvc3QgfHwgMCk7XG4gICAgICAgIGNvbnN0IHNlY3VyaXR5Umlza3MgPSAoc3RhdGUucmVzdWx0LnNlY3VyaXR5RmluZGluZ3M/Lmxlbmd0aCB8fCAwKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRvdGFsUmVzb3VyY2VzLFxuICAgICAgICAgICAgZWMyQ291bnQ6IHN0YXRlLnJlc3VsdC5lYzJJbnN0YW5jZXM/Lmxlbmd0aCB8fCAwLFxuICAgICAgICAgICAgczNDb3VudDogc3RhdGUucmVzdWx0LnMzQnVja2V0cz8ubGVuZ3RoIHx8IDAsXG4gICAgICAgICAgICByZHNDb3VudDogc3RhdGUucmVzdWx0LnJkc0luc3RhbmNlcz8ubGVuZ3RoIHx8IDAsXG4gICAgICAgICAgICBlc3RpbWF0ZWRDb3N0LFxuICAgICAgICAgICAgc2VjdXJpdHlSaXNrcyxcbiAgICAgICAgICAgIHRvdGFsRm91bmQ6IHRvdGFsUmVzb3VyY2VzLFxuICAgICAgICB9O1xuICAgIH0sIFtzdGF0ZS5yZXN1bHRdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBDb25maWd1cmF0aW9uXG4gICAgICAgIGNvbmZpZzogc3RhdGUuY29uZmlnLFxuICAgICAgICBzZXRDb25maWcsXG4gICAgICAgIC8vIERpc2NvdmVyeSBzdGF0ZVxuICAgICAgICByZXN1bHQ6IHN0YXRlLnJlc3VsdCxcbiAgICAgICAgaXNEaXNjb3ZlcmluZzogc3RhdGUuaXNEaXNjb3ZlcmluZyxcbiAgICAgICAgcHJvZ3Jlc3M6IHN0YXRlLnByb2dyZXNzPy5wcm9ncmVzcyB8fCAwLFxuICAgICAgICBlcnJvcjogc3RhdGUuZXJyb3IsXG4gICAgICAgIC8vIEZpbHRlcmluZ1xuICAgICAgICBmaWx0ZXI6IHN0YXRlLmZpbHRlcixcbiAgICAgICAgc2V0RmlsdGVyLFxuICAgICAgICAvLyBBY3Rpb25zXG4gICAgICAgIHN0YXJ0RGlzY292ZXJ5LFxuICAgICAgICBjYW5jZWxEaXNjb3ZlcnksXG4gICAgICAgIGV4cG9ydFRvQ1NWLFxuICAgICAgICBleHBvcnRUb0V4Y2VsLFxuICAgICAgICAvLyBUYWIgbWFuYWdlbWVudFxuICAgICAgICBhY3RpdmVUYWI6IHN0YXRlLmFjdGl2ZVRhYixcbiAgICAgICAgc2V0QWN0aXZlVGFiLFxuICAgICAgICAvLyBEYXRhIGZvciBhY3RpdmUgdGFiIChkeW5hbWljIGJhc2VkIG9uIGFjdGl2ZVRhYilcbiAgICAgICAgY29sdW1ucyxcbiAgICAgICAgZmlsdGVyZWREYXRhLFxuICAgICAgICAvLyBTdGF0aXN0aWNzXG4gICAgICAgIHN0YXRzLFxuICAgIH07XG59O1xuLyoqXG4gKiBGaWx0ZXIgZGF0YSBiYXNlZCBvbiBmaWx0ZXIgc3RhdGUgYW5kIHNlYXJjaCB0ZXh0XG4gKi9cbmZ1bmN0aW9uIGZpbHRlckRhdGEoZGF0YSwgZmlsdGVyLCBzZWFyY2hUZXh0KSB7XG4gICAgcmV0dXJuIChkYXRhID8/IFtdKS5maWx0ZXIoaXRlbSA9PiB7XG4gICAgICAgIC8vIFNlYXJjaCB0ZXh0IGZpbHRlclxuICAgICAgICBpZiAoc2VhcmNoVGV4dCkge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoTG93ZXIgPSBzZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzU2VhcmNoID0gT2JqZWN0LnZhbHVlcyhpdGVtKS5zb21lKHZhbHVlID0+IHZhbHVlICYmIHZhbHVlLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcikpO1xuICAgICAgICAgICAgaWYgKCFtYXRjaGVzU2VhcmNoKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBSZWdpb24gZmlsdGVyXG4gICAgICAgIGlmIChmaWx0ZXIuc2VsZWN0ZWRSZWdpb25zLmxlbmd0aCA+IDAgJiYgIWZpbHRlci5zZWxlY3RlZFJlZ2lvbnMuaW5jbHVkZXMoaXRlbS5yZWdpb24pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU3RhdGUgZmlsdGVyIChmb3IgRUMyIGluc3RhbmNlcylcbiAgICAgICAgaWYgKGZpbHRlci5zZWxlY3RlZFN0YXRlcy5sZW5ndGggPiAwICYmIGl0ZW0uc3RhdGUgJiYgIWZpbHRlci5zZWxlY3RlZFN0YXRlcy5pbmNsdWRlcyhpdGVtLnN0YXRlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNlY3VyaXR5IHJpc2tzIGZpbHRlclxuICAgICAgICBpZiAoZmlsdGVyLnNob3dPbmx5U2VjdXJpdHlSaXNrcyAmJiAhaXRlbS5zZWN1cml0eUZpbmRpbmdzPy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbn1cbi8qKlxuICogQ29udmVydCBkYXRhIHRvIENTViBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gY29udmVydFRvQ1NWKGRhdGEpIHtcbiAgICBpZiAoIWRhdGEgfHwgZGF0YS5sZW5ndGggPT09IDApXG4gICAgICAgIHJldHVybiAnJztcbiAgICBjb25zdCBoZWFkZXJzID0gT2JqZWN0LmtleXMoZGF0YVswXSk7XG4gICAgY29uc3QgY3N2Um93cyA9IFtoZWFkZXJzLmpvaW4oJywnKV07XG4gICAgZm9yIChjb25zdCByb3cgb2YgZGF0YSkge1xuICAgICAgICBjb25zdCB2YWx1ZXMgPSBoZWFkZXJzLm1hcChoZWFkZXIgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByb3dbaGVhZGVyXTtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSA/PyAnJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBjc3ZSb3dzLnB1c2godmFsdWVzLmpvaW4oJywnKSk7XG4gICAgfVxuICAgIHJldHVybiBjc3ZSb3dzLmpvaW4oJ1xcbicpO1xufVxuLyoqXG4gKiBGb3JtYXQgYnl0ZXMgdG8gaHVtYW4tcmVhZGFibGUgZm9ybWF0XG4gKi9cbmZ1bmN0aW9uIGZvcm1hdEJ5dGVzKGJ5dGVzKSB7XG4gICAgaWYgKGJ5dGVzID09PSAwKVxuICAgICAgICByZXR1cm4gJzAgQnl0ZXMnO1xuICAgIGNvbnN0IGsgPSAxMDI0O1xuICAgIGNvbnN0IHNpemVzID0gWydCeXRlcycsICdLQicsICdNQicsICdHQicsICdUQiddO1xuICAgIGNvbnN0IGkgPSBNYXRoLmZsb29yKE1hdGgubG9nKGJ5dGVzKSAvIE1hdGgubG9nKGspKTtcbiAgICByZXR1cm4gcGFyc2VGbG9hdCgoYnl0ZXMgLyBNYXRoLnBvdyhrLCBpKSkudG9GaXhlZCgyKSkgKyAnICcgKyBzaXplc1tpXTtcbn1cbiIsIi8qKlxuICogRGVib3VuY2UgSG9va1xuICpcbiAqIFJldHVybnMgYSBkZWJvdW5jZWQgdmFsdWUgdGhhdCBvbmx5IHVwZGF0ZXMgYWZ0ZXIgdGhlIHNwZWNpZmllZCBkZWxheS5cbiAqIFVzZWZ1bCBmb3Igc2VhcmNoIGlucHV0cyBhbmQgZXhwZW5zaXZlIG9wZXJhdGlvbnMuXG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG4vKipcbiAqIERlYm91bmNlIGEgdmFsdWVcbiAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byBkZWJvdW5jZVxuICogQHBhcmFtIGRlbGF5IERlbGF5IGluIG1pbGxpc2Vjb25kcyAoZGVmYXVsdDogNTAwbXMpXG4gKiBAcmV0dXJucyBEZWJvdW5jZWQgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZURlYm91bmNlKHZhbHVlLCBkZWxheSA9IDUwMCkge1xuICAgIGNvbnN0IFtkZWJvdW5jZWRWYWx1ZSwgc2V0RGVib3VuY2VkVmFsdWVdID0gdXNlU3RhdGUodmFsdWUpO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIC8vIFNldCB1cCBhIHRpbWVvdXQgdG8gdXBkYXRlIHRoZSBkZWJvdW5jZWQgdmFsdWVcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgc2V0RGVib3VuY2VkVmFsdWUodmFsdWUpO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgIC8vIENsZWFudXAgdGltZW91dCBvbiB2YWx1ZSBjaGFuZ2Ugb3IgdW5tb3VudFxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgICAgICB9O1xuICAgIH0sIFt2YWx1ZSwgZGVsYXldKTtcbiAgICByZXR1cm4gZGVib3VuY2VkVmFsdWU7XG59XG5leHBvcnQgZGVmYXVsdCB1c2VEZWJvdW5jZTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==