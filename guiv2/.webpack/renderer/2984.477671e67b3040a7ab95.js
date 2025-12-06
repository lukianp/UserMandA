"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2984],{

/***/ 12984:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   a: () => (/* binding */ useLicensingDiscoveryLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(33813);
/* harmony import */ var _lib_electron_api_fallback__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(58350);



const useLicensingDiscoveryLogic = () => {
    // Get selected profile from store
    const selectedSourceProfile = (0,_store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__/* .useProfileStore */ .K)((state) => state.selectedSourceProfile);
    const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        config: {
            includeMicrosoft365: true,
            includeAzure: true,
            includeOffice: true,
            includeWindows: true,
            includeThirdParty: false,
            timeout: 600000
        },
        result: null,
        isDiscovering: false,
        progress: {
            current: 0,
            total: 100,
            message: '',
            percentage: 0
        },
        activeTab: 'overview',
        filter: {
            searchText: '',
            selectedLicenseTypes: [],
            selectedStatuses: [],
            showOnlyExpiring: false,
            showOnlyUnassigned: false
        },
        cancellationToken: null,
        error: null
    });
    // IPC progress tracking
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const unsubscribe = window.electronAPI?.onProgress?.((data) => {
            if (data.type === 'licensing-discovery' && data.token === state.cancellationToken) {
                setState(prev => ({
                    ...prev,
                    progress: {
                        current: data.current || 0,
                        total: data.total || 100,
                        message: data.message || '',
                        percentage: data.percentage || 0
                    }
                }));
            }
        });
        return () => {
            if (unsubscribe)
                unsubscribe();
        };
    }, [state.cancellationToken]);
    const startDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!selectedSourceProfile) {
            const errorMessage = 'No company profile selected. Please select a profile first.';
            setState(prev => ({ ...prev, error: errorMessage }));
            console.error('[LicensingDiscovery]', errorMessage);
            return;
        }
        const token = `licensing-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setState(prev => ({
            ...prev,
            isDiscovering: true,
            error: null,
            cancellationToken: token,
            progress: { current: 0, total: 100, message: 'Starting license discovery...', percentage: 0 }
        }));
        console.log(`[LicensingDiscovery] Starting discovery for company: ${selectedSourceProfile.companyName}`);
        console.log(`[LicensingDiscovery] Parameters:`, {
            IncludeMicrosoft365: state.config.includeMicrosoft365,
            IncludeAzure: state.config.includeAzure,
            IncludeOffice: state.config.includeOffice,
            IncludeWindows: state.config.includeWindows,
            IncludeThirdParty: state.config.includeThirdParty
        });
        try {
            const electronAPI = (0,_lib_electron_api_fallback__WEBPACK_IMPORTED_MODULE_2__/* .getElectronAPI */ .d)();
            const discoveryResult = await electronAPI.executeDiscoveryModule('Licensing', selectedSourceProfile.companyName, {
                IncludeMicrosoft365: state.config.includeMicrosoft365,
                IncludeAzure: state.config.includeAzure,
                IncludeOffice: state.config.includeOffice,
                IncludeWindows: state.config.includeWindows,
                IncludeThirdParty: state.config.includeThirdParty
            }, { timeout: state.config.timeout || 600000 });
            setState(prev => ({
                ...prev,
                result: discoveryResult.data || discoveryResult,
                isDiscovering: false,
                cancellationToken: null,
                progress: { current: 100, total: 100, message: 'Completed', percentage: 100 }
            }));
            console.log(`[LicensingDiscovery] Discovery completed successfully`);
        }
        catch (error) {
            console.error('[LicensingDiscovery] Discovery failed:', error);
            setState(prev => ({
                ...prev,
                isDiscovering: false,
                cancellationToken: null,
                error: error.message || 'Discovery failed'
            }));
        }
    }, [selectedSourceProfile, state.config]);
    const cancelDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (state.cancellationToken) {
            try {
                await window.electronAPI.cancelExecution(state.cancellationToken);
                setState(prev => ({
                    ...prev,
                    isDiscovering: false,
                    cancellationToken: null,
                    progress: { current: 0, total: 100, message: 'Discovery cancelled', percentage: 0 }
                }));
            }
            catch (error) {
                console.error('Failed to cancel discovery:', error);
            }
        }
    }, [state.cancellationToken]);
    const updateConfig = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((updates) => {
        setState(prev => ({
            ...prev,
            config: { ...prev.config, ...updates }
        }));
    }, []);
    const setActiveTab = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((tab) => {
        setState(prev => ({ ...prev, activeTab: tab }));
    }, []);
    const updateFilter = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((updates) => {
        setState(prev => ({
            ...prev,
            filter: { ...prev.filter, ...updates }
        }));
    }, []);
    const clearError = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);
    // License columns
    const licenseColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        {
            field: 'productName',
            headerName: 'Product Name',
            sortable: true,
            filter: true,
            width: 280
        },
        {
            field: 'skuPartNumber',
            headerName: 'SKU',
            sortable: true,
            filter: true,
            width: 180
        },
        {
            field: 'vendor',
            headerName: 'Vendor',
            sortable: true,
            filter: true,
            width: 150
        },
        {
            field: 'prepaidUnits.enabled',
            headerName: 'Total Licenses',
            sortable: true,
            filter: true,
            width: 140,
            valueGetter: (params) => params.data?.prepaidUnits?.enabled || 0
        },
        {
            field: 'consumedUnits',
            headerName: 'Assigned',
            sortable: true,
            filter: true,
            width: 120
        },
        {
            field: 'availableUnits',
            headerName: 'Available',
            sortable: true,
            filter: true,
            width: 120
        },
        {
            field: 'utilization',
            headerName: 'Utilization',
            sortable: true,
            filter: true,
            width: 130,
            valueGetter: (params) => {
                const total = params.data?.prepaidUnits?.enabled || 0;
                const consumed = params.data?.consumedUnits || 0;
                return total > 0 ? ((consumed / total) * 100).toFixed(1) + '%' : '0%';
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            sortable: true,
            filter: true,
            width: 120,
            valueFormatter: (params) => {
                const status = params.value;
                return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
            }
        },
        {
            field: 'expirationDate',
            headerName: 'Expires',
            sortable: true,
            filter: true,
            width: 150,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
        },
        {
            field: 'cost.amount',
            headerName: 'Cost',
            sortable: true,
            filter: true,
            width: 140,
            valueGetter: (params) => {
                const cost = params.data?.cost;
                if (!cost)
                    return 'N/A';
                return `${cost.currency} ${cost.amount.toFixed(2)}/${cost.billingCycle}`;
            }
        }
    ], []);
    // Assignment columns
    const assignmentColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        {
            field: 'displayName',
            headerName: 'User Name',
            sortable: true,
            filter: true,
            width: 220
        },
        {
            field: 'userPrincipalName',
            headerName: 'Email',
            sortable: true,
            filter: true,
            width: 260
        },
        {
            field: 'skuId',
            headerName: 'License SKU',
            sortable: true,
            filter: true,
            width: 280,
            valueGetter: (params) => {
                // Map SKU ID to product name from result
                const skuId = params.data?.skuId;
                if (!skuId || !state.result)
                    return skuId || 'Unknown';
                const license = state.result.licenses?.find(l => l.skuId === skuId);
                return license?.productName || skuId;
            }
        },
        {
            field: 'assignmentSource',
            headerName: 'Assignment Source',
            sortable: true,
            filter: true,
            width: 160,
            valueFormatter: (params) => {
                const source = params.value;
                return source ? source.charAt(0).toUpperCase() + source.slice(1) : 'Unknown';
            }
        },
        {
            field: 'assignedPlans',
            headerName: 'Active Plans',
            sortable: true,
            filter: true,
            width: 130,
            valueFormatter: (params) => params.value?.length || 0
        },
        {
            field: 'disabledPlans',
            headerName: 'Disabled Plans',
            sortable: true,
            filter: true,
            width: 140,
            valueFormatter: (params) => params.value?.length || 0
        },
        {
            field: 'assignedDateTime',
            headerName: 'Assigned Date',
            sortable: true,
            filter: true,
            width: 180,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
        }
    ], [state.result]);
    // Subscription columns
    const subscriptionColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        {
            field: 'subscriptionName',
            headerName: 'Subscription Name',
            sortable: true,
            filter: true,
            width: 280
        },
        {
            field: 'subscriptionId',
            headerName: 'Subscription ID',
            sortable: true,
            filter: true,
            width: 280
        },
        {
            field: 'status',
            headerName: 'Status',
            sortable: true,
            filter: true,
            width: 120,
            valueFormatter: (params) => {
                const status = params.value;
                return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
            }
        },
        {
            field: 'totalLicenses',
            headerName: 'Total Licenses',
            sortable: true,
            filter: true,
            width: 140
        },
        {
            field: 'assignedLicenses',
            headerName: 'Assigned',
            sortable: true,
            filter: true,
            width: 120
        },
        {
            field: 'utilization',
            headerName: 'Utilization',
            sortable: true,
            filter: true,
            width: 130,
            valueGetter: (params) => {
                const total = params.data?.totalLicenses || 0;
                const assigned = params.data?.assignedLicenses || 0;
                return total > 0 ? ((assigned / total) * 100).toFixed(1) + '%' : '0%';
            }
        },
        {
            field: 'isTrial',
            headerName: 'Trial',
            sortable: true,
            filter: true,
            width: 100,
            valueFormatter: (params) => params.value ? 'Yes' : 'No'
        },
        {
            field: 'autoRenew',
            headerName: 'Auto Renew',
            sortable: true,
            filter: true,
            width: 120,
            valueFormatter: (params) => params.value ? 'Yes' : 'No'
        },
        {
            field: 'startDate',
            headerName: 'Start Date',
            sortable: true,
            filter: true,
            width: 150,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
        },
        {
            field: 'endDate',
            headerName: 'End Date',
            sortable: true,
            filter: true,
            width: 150,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
        }
    ], []);
    // Dynamic columns based on active tab
    const columns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        switch (state.activeTab) {
            case 'licenses':
                return licenseColumns;
            case 'assignments':
                return assignmentColumns;
            case 'subscriptions':
                return subscriptionColumns;
            default:
                return [];
        }
    }, [state.activeTab, licenseColumns, assignmentColumns, subscriptionColumns]);
    // Filtered licenses
    const filteredLicenses = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.result?.licenses)
            return [];
        let filtered = state.result.licenses;
        if (state.filter.searchText) {
            const search = state.filter.searchText.toLowerCase();
            filtered = filtered.filter(l => l.productName?.toLowerCase().includes(search) ||
                l.skuPartNumber?.toLowerCase().includes(search) ||
                l.vendor?.toLowerCase().includes(search));
        }
        if (state.filter.selectedLicenseTypes.length > 0) {
            filtered = filtered.filter(l => state.filter.selectedLicenseTypes.includes(l.skuPartNumber));
        }
        if (state.filter.selectedStatuses.length > 0) {
            filtered = filtered.filter(l => state.filter.selectedStatuses.includes(l.status));
        }
        if (state.filter.showOnlyExpiring) {
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            filtered = filtered.filter(l => l.expirationDate && new Date(l.expirationDate) <= thirtyDaysFromNow);
        }
        if (state.filter.showOnlyUnassigned) {
            filtered = filtered.filter(l => l.availableUnits > 0);
        }
        return filtered;
    }, [state.result?.licenses, state.filter]);
    // Filtered data based on active tab and filters (for backward compatibility)
    const filteredData = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        switch (state.activeTab) {
            case 'licenses':
                return filteredLicenses;
            case 'assignments':
                return state.result?.assignments?.filter(assignment => {
                    if (!state.filter.searchText)
                        return true;
                    const search = state.filter.searchText.toLowerCase();
                    return assignment.displayName?.toLowerCase().includes(search) ||
                        assignment.userPrincipalName?.toLowerCase().includes(search);
                }) || [];
            case 'subscriptions':
                return state.result?.subscriptions?.filter(sub => {
                    if (!state.filter.searchText)
                        return true;
                    const search = state.filter.searchText.toLowerCase();
                    return sub.subscriptionName?.toLowerCase().includes(search) ||
                        sub.subscriptionId?.toLowerCase().includes(search);
                }) || [];
            default:
                return [];
        }
    }, [state.result, state.activeTab, state.filter.searchText, filteredLicenses]);
    // Statistics
    const stats = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.result)
            return null;
        const licenses = state.result.licenses || [];
        const assignments = state.result.assignments || [];
        const licensesByProduct = {};
        const licensesByStatus = {
            active: 0,
            expired: 0,
            trial: 0,
            suspended: 0
        };
        const assignmentsBySource = {
            direct: 0,
            group: 0,
            inherited: 0
        };
        let totalCost = 0;
        const costByProduct = {};
        licenses.forEach(license => {
            // Product breakdown
            const product = license.productName || 'Unknown';
            licensesByProduct[product] = (licensesByProduct[product] || 0) + (license.prepaidUnits?.enabled || 0);
            // Status breakdown
            licensesByStatus[license.status] = (licensesByStatus[license.status] || 0) + 1;
            // Cost calculation
            if (license.cost) {
                const monthlyCost = license.cost.billingCycle === 'annual'
                    ? (license.cost.amount / 12) * (license.prepaidUnits?.enabled || 0)
                    : license.cost.amount * (license.prepaidUnits?.enabled || 0);
                totalCost += monthlyCost;
                if (!costByProduct[product]) {
                    costByProduct[product] = { cost: 0, count: 0, consumed: 0, enabled: 0 };
                }
                costByProduct[product].cost += monthlyCost;
                costByProduct[product].count += 1;
                costByProduct[product].consumed += license.consumedUnits || 0;
                costByProduct[product].enabled += license.prepaidUnits?.enabled || 0;
            }
        });
        assignments.forEach(assignment => {
            const source = assignment.assignmentSource || 'direct';
            assignmentsBySource[source] = (assignmentsBySource[source] || 0) + 1;
        });
        const topCostProducts = Object.entries(costByProduct)
            .sort((a, b) => b[1].cost - a[1].cost)
            .slice(0, 5)
            .map(([product, data]) => ({
            product,
            cost: data.cost,
            count: data.count,
            utilization: data.enabled > 0 ? (data.consumed / data.enabled) * 100 : 0
        }));
        const totalLicenses = state.result.totalLicenses || 0;
        const totalAssigned = state.result.totalAssigned || 0;
        const totalAvailable = state.result.totalAvailable || 0;
        const utilizationRate = totalLicenses > 0 ? (totalAssigned / totalLicenses) * 100 : 0;
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const expiringCount = licenses.filter(l => l.expirationDate && new Date(l.expirationDate) <= thirtyDaysFromNow).length;
        return {
            totalLicenses,
            totalAssigned,
            totalAvailable,
            totalUnits: totalLicenses,
            consumedUnits: totalAssigned,
            availableUnits: totalAvailable,
            utilizationRate,
            totalCost,
            costPerMonth: totalCost,
            licensesByProduct,
            licensesByStatus,
            assignmentsBySource,
            topCostProducts,
            expiringCount,
            underlicensedCount: state.result.complianceStatus?.underlicensedProducts?.length || 0,
            overlicensedCount: state.result.complianceStatus?.overlicensedProducts?.length || 0
        };
    }, [state.result]);
    // CSV Export with advanced flattening
    const exportToCSV = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((data, filename) => {
        if (data.length === 0) {
            alert('No data to export');
            return;
        }
        const flattenObject = (obj, prefix = '') => {
            const flattened = {};
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (value === null || value === undefined) {
                    flattened[newKey] = '';
                }
                else if (value instanceof Date) {
                    flattened[newKey] = value.toISOString();
                }
                else if (Array.isArray(value)) {
                    flattened[newKey] = value.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join('; ');
                }
                else if (typeof value === 'object') {
                    Object.assign(flattened, flattenObject(value, newKey));
                }
                else {
                    flattened[newKey] = value;
                }
            });
            return flattened;
        };
        const flattenedData = (data ?? []).map(item => flattenObject(item));
        const headers = Object.keys(flattenedData[0]);
        const csvContent = [
            headers.join(','),
            ...flattenedData.map(row => headers.map(header => {
                const value = row[header];
                const stringValue = value?.toString() || '';
                return stringValue.includes(',') || stringValue.includes('"')
                    ? `"${stringValue.replace(/"/g, '""')}"`
                    : stringValue;
            }).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }, []);
    // Excel Export
    const exportToExcel = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (data, filename) => {
        if (data.length === 0) {
            alert('No data to export');
            return;
        }
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Export/ExportToExcel.psm1',
                functionName: 'Export-LicensingData',
                parameters: {
                    Data: data,
                    SheetName: state.activeTab,
                    FileName: filename
                }
            });
        }
        catch (error) {
            console.error('Excel export failed:', error);
            alert('Excel export failed: ' + error.message);
        }
    }, [state.activeTab]);
    return {
        // State
        config: state.config,
        result: state.result,
        isDiscovering: state.isDiscovering,
        progress: state.progress,
        activeTab: state.activeTab,
        filter: state.filter,
        error: state.error,
        // Data
        columns,
        filteredData,
        filteredLicenses,
        stats,
        // Column definitions
        licenseColumns,
        assignmentColumns,
        subscriptionColumns,
        // Actions
        startDiscovery,
        cancelDiscovery,
        updateConfig,
        setActiveTab,
        updateFilter,
        clearError,
        exportToCSV,
        exportToExcel
    };
};


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiMjk4NC44ZTI0MTEyYWY2NTA5N2RhNmM0MS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBa0U7QUFDUDtBQUNHO0FBQ3ZEO0FBQ1A7QUFDQSxrQ0FBa0MsZ0ZBQWU7QUFDakQsOEJBQThCLCtDQUFRO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLGdEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsMkJBQTJCLGtEQUFXO0FBQ3RDO0FBQ0E7QUFDQSxnQ0FBZ0MsOEJBQThCO0FBQzlEO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QyxXQUFXLEdBQUcsd0NBQXdDO0FBQ25HO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0I7QUFDeEIsU0FBUztBQUNULDRFQUE0RSxrQ0FBa0M7QUFDOUc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsZ0NBQWdDLG1GQUFjO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsSUFBSSx5Q0FBeUM7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsS0FBSztBQUNMLDRCQUE0QixrREFBVztBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQztBQUNoQyxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCx5QkFBeUIsa0RBQVc7QUFDcEM7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QixTQUFTO0FBQ1QsS0FBSztBQUNMLHlCQUF5QixrREFBVztBQUNwQyw0QkFBNEIseUJBQXlCO0FBQ3JELEtBQUs7QUFDTCx5QkFBeUIsa0RBQVc7QUFDcEM7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QixTQUFTO0FBQ1QsS0FBSztBQUNMLHVCQUF1QixrREFBVztBQUNsQyw0QkFBNEIsc0JBQXNCO0FBQ2xELEtBQUs7QUFDTDtBQUNBLDJCQUEyQiw4Q0FBTztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsZUFBZSxFQUFFLHVCQUF1QixHQUFHLGtCQUFrQjtBQUN2RjtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4Qiw4Q0FBTztBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MsOENBQU87QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsOENBQU87QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSw2QkFBNkIsOENBQU87QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EseUJBQXlCLDhDQUFPO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLGtCQUFrQiw4Q0FBTztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQztBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSx3QkFBd0Isa0RBQVc7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxPQUFPLEdBQUcsSUFBSTtBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhHQUE4RztBQUM5RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixnQ0FBZ0M7QUFDMUQ7QUFDQSxhQUFhO0FBQ2I7QUFDQSw4Q0FBOEMsZ0JBQWdCLGNBQWMsR0FBRztBQUMvRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLDBCQUEwQixrREFBVztBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VMaWNlbnNpbmdEaXNjb3ZlcnlMb2dpYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VNZW1vLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZVByb2ZpbGVTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZVByb2ZpbGVTdG9yZSc7XG5pbXBvcnQgeyBnZXRFbGVjdHJvbkFQSSB9IGZyb20gJy4uL2xpYi9lbGVjdHJvbi1hcGktZmFsbGJhY2snO1xuZXhwb3J0IGNvbnN0IHVzZUxpY2Vuc2luZ0Rpc2NvdmVyeUxvZ2ljID0gKCkgPT4ge1xuICAgIC8vIEdldCBzZWxlY3RlZCBwcm9maWxlIGZyb20gc3RvcmVcbiAgICBjb25zdCBzZWxlY3RlZFNvdXJjZVByb2ZpbGUgPSB1c2VQcm9maWxlU3RvcmUoKHN0YXRlKSA9PiBzdGF0ZS5zZWxlY3RlZFNvdXJjZVByb2ZpbGUpO1xuICAgIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGUoe1xuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgIGluY2x1ZGVNaWNyb3NvZnQzNjU6IHRydWUsXG4gICAgICAgICAgICBpbmNsdWRlQXp1cmU6IHRydWUsXG4gICAgICAgICAgICBpbmNsdWRlT2ZmaWNlOiB0cnVlLFxuICAgICAgICAgICAgaW5jbHVkZVdpbmRvd3M6IHRydWUsXG4gICAgICAgICAgICBpbmNsdWRlVGhpcmRQYXJ0eTogZmFsc2UsXG4gICAgICAgICAgICB0aW1lb3V0OiA2MDAwMDBcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdWx0OiBudWxsLFxuICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgcHJvZ3Jlc3M6IHtcbiAgICAgICAgICAgIGN1cnJlbnQ6IDAsXG4gICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgbWVzc2FnZTogJycsXG4gICAgICAgICAgICBwZXJjZW50YWdlOiAwXG4gICAgICAgIH0sXG4gICAgICAgIGFjdGl2ZVRhYjogJ292ZXJ2aWV3JyxcbiAgICAgICAgZmlsdGVyOiB7XG4gICAgICAgICAgICBzZWFyY2hUZXh0OiAnJyxcbiAgICAgICAgICAgIHNlbGVjdGVkTGljZW5zZVR5cGVzOiBbXSxcbiAgICAgICAgICAgIHNlbGVjdGVkU3RhdHVzZXM6IFtdLFxuICAgICAgICAgICAgc2hvd09ubHlFeHBpcmluZzogZmFsc2UsXG4gICAgICAgICAgICBzaG93T25seVVuYXNzaWduZWQ6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBudWxsLFxuICAgICAgICBlcnJvcjogbnVsbFxuICAgIH0pO1xuICAgIC8vIElQQyBwcm9ncmVzcyB0cmFja2luZ1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlID0gd2luZG93LmVsZWN0cm9uQVBJPy5vblByb2dyZXNzPy4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLnR5cGUgPT09ICdsaWNlbnNpbmctZGlzY292ZXJ5JyAmJiBkYXRhLnRva2VuID09PSBzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGRhdGEuY3VycmVudCB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWw6IGRhdGEudG90YWwgfHwgMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGF0YS5tZXNzYWdlIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyY2VudGFnZTogZGF0YS5wZXJjZW50YWdlIHx8IDBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodW5zdWJzY3JpYmUpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfTtcbiAgICB9LCBbc3RhdGUuY2FuY2VsbGF0aW9uVG9rZW5dKTtcbiAgICBjb25zdCBzdGFydERpc2NvdmVyeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZVByb2ZpbGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9ICdObyBjb21wYW55IHByb2ZpbGUgc2VsZWN0ZWQuIFBsZWFzZSBzZWxlY3QgYSBwcm9maWxlIGZpcnN0Lic7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGVycm9yOiBlcnJvck1lc3NhZ2UgfSkpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0xpY2Vuc2luZ0Rpc2NvdmVyeV0nLCBlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRva2VuID0gYGxpY2Vuc2luZy1kaXNjb3ZlcnktJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogdHJ1ZSxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IHRva2VuLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IHsgY3VycmVudDogMCwgdG90YWw6IDEwMCwgbWVzc2FnZTogJ1N0YXJ0aW5nIGxpY2Vuc2UgZGlzY292ZXJ5Li4uJywgcGVyY2VudGFnZTogMCB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgY29uc29sZS5sb2coYFtMaWNlbnNpbmdEaXNjb3ZlcnldIFN0YXJ0aW5nIGRpc2NvdmVyeSBmb3IgY29tcGFueTogJHtzZWxlY3RlZFNvdXJjZVByb2ZpbGUuY29tcGFueU5hbWV9YCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbTGljZW5zaW5nRGlzY292ZXJ5XSBQYXJhbWV0ZXJzOmAsIHtcbiAgICAgICAgICAgIEluY2x1ZGVNaWNyb3NvZnQzNjU6IHN0YXRlLmNvbmZpZy5pbmNsdWRlTWljcm9zb2Z0MzY1LFxuICAgICAgICAgICAgSW5jbHVkZUF6dXJlOiBzdGF0ZS5jb25maWcuaW5jbHVkZUF6dXJlLFxuICAgICAgICAgICAgSW5jbHVkZU9mZmljZTogc3RhdGUuY29uZmlnLmluY2x1ZGVPZmZpY2UsXG4gICAgICAgICAgICBJbmNsdWRlV2luZG93czogc3RhdGUuY29uZmlnLmluY2x1ZGVXaW5kb3dzLFxuICAgICAgICAgICAgSW5jbHVkZVRoaXJkUGFydHk6IHN0YXRlLmNvbmZpZy5pbmNsdWRlVGhpcmRQYXJ0eVxuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGVsZWN0cm9uQVBJID0gZ2V0RWxlY3Ryb25BUEkoKTtcbiAgICAgICAgICAgIGNvbnN0IGRpc2NvdmVyeVJlc3VsdCA9IGF3YWl0IGVsZWN0cm9uQVBJLmV4ZWN1dGVEaXNjb3ZlcnlNb2R1bGUoJ0xpY2Vuc2luZycsIHNlbGVjdGVkU291cmNlUHJvZmlsZS5jb21wYW55TmFtZSwge1xuICAgICAgICAgICAgICAgIEluY2x1ZGVNaWNyb3NvZnQzNjU6IHN0YXRlLmNvbmZpZy5pbmNsdWRlTWljcm9zb2Z0MzY1LFxuICAgICAgICAgICAgICAgIEluY2x1ZGVBenVyZTogc3RhdGUuY29uZmlnLmluY2x1ZGVBenVyZSxcbiAgICAgICAgICAgICAgICBJbmNsdWRlT2ZmaWNlOiBzdGF0ZS5jb25maWcuaW5jbHVkZU9mZmljZSxcbiAgICAgICAgICAgICAgICBJbmNsdWRlV2luZG93czogc3RhdGUuY29uZmlnLmluY2x1ZGVXaW5kb3dzLFxuICAgICAgICAgICAgICAgIEluY2x1ZGVUaGlyZFBhcnR5OiBzdGF0ZS5jb25maWcuaW5jbHVkZVRoaXJkUGFydHlcbiAgICAgICAgICAgIH0sIHsgdGltZW91dDogc3RhdGUuY29uZmlnLnRpbWVvdXQgfHwgNjAwMDAwIH0pO1xuICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICAgICAgcmVzdWx0OiBkaXNjb3ZlcnlSZXN1bHQuZGF0YSB8fCBkaXNjb3ZlcnlSZXN1bHQsXG4gICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IG51bGwsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IHsgY3VycmVudDogMTAwLCB0b3RhbDogMTAwLCBtZXNzYWdlOiAnQ29tcGxldGVkJywgcGVyY2VudGFnZTogMTAwIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTGljZW5zaW5nRGlzY292ZXJ5XSBEaXNjb3ZlcnkgY29tcGxldGVkIHN1Y2Nlc3NmdWxseWApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0xpY2Vuc2luZ0Rpc2NvdmVyeV0gRGlzY292ZXJ5IGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbjogbnVsbCxcbiAgICAgICAgICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnRGlzY292ZXJ5IGZhaWxlZCdcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgIH0sIFtzZWxlY3RlZFNvdXJjZVByb2ZpbGUsIHN0YXRlLmNvbmZpZ10pO1xuICAgIGNvbnN0IGNhbmNlbERpc2NvdmVyeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLmNhbmNlbGxhdGlvblRva2VuKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5jYW5jZWxFeGVjdXRpb24oc3RhdGUuY2FuY2VsbGF0aW9uVG9rZW4pO1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogeyBjdXJyZW50OiAwLCB0b3RhbDogMTAwLCBtZXNzYWdlOiAnRGlzY292ZXJ5IGNhbmNlbGxlZCcsIHBlcmNlbnRhZ2U6IDAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBjYW5jZWwgZGlzY292ZXJ5OicsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbl0pO1xuICAgIGNvbnN0IHVwZGF0ZUNvbmZpZyA9IHVzZUNhbGxiYWNrKCh1cGRhdGVzKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBjb25maWc6IHsgLi4ucHJldi5jb25maWcsIC4uLnVwZGF0ZXMgfVxuICAgICAgICB9KSk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IHNldEFjdGl2ZVRhYiA9IHVzZUNhbGxiYWNrKCh0YWIpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBhY3RpdmVUYWI6IHRhYiB9KSk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IHVwZGF0ZUZpbHRlciA9IHVzZUNhbGxiYWNrKCh1cGRhdGVzKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgICBmaWx0ZXI6IHsgLi4ucHJldi5maWx0ZXIsIC4uLnVwZGF0ZXMgfVxuICAgICAgICB9KSk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IGNsZWFyRXJyb3IgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgZXJyb3I6IG51bGwgfSkpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBMaWNlbnNlIGNvbHVtbnNcbiAgICBjb25zdCBsaWNlbnNlQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3Byb2R1Y3ROYW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdQcm9kdWN0IE5hbWUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMjgwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnc2t1UGFydE51bWJlcicsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnU0tVJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDE4MFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3ZlbmRvcicsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVmVuZG9yJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDE1MFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3ByZXBhaWRVbml0cy5lbmFibGVkJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUb3RhbCBMaWNlbnNlcycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxNDAsXG4gICAgICAgICAgICB2YWx1ZUdldHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLmRhdGE/LnByZXBhaWRVbml0cz8uZW5hYmxlZCB8fCAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnY29uc3VtZWRVbml0cycsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQXNzaWduZWQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTIwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnYXZhaWxhYmxlVW5pdHMnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0F2YWlsYWJsZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxMjBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd1dGlsaXphdGlvbicsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVXRpbGl6YXRpb24nLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTMwLFxuICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b3RhbCA9IHBhcmFtcy5kYXRhPy5wcmVwYWlkVW5pdHM/LmVuYWJsZWQgfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCBjb25zdW1lZCA9IHBhcmFtcy5kYXRhPy5jb25zdW1lZFVuaXRzIHx8IDA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvdGFsID4gMCA/ICgoY29uc3VtZWQgLyB0b3RhbCkgKiAxMDApLnRvRml4ZWQoMSkgKyAnJScgOiAnMCUnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3N0YXR1cycsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnU3RhdHVzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzID0gcGFyYW1zLnZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0dXMgPyBzdGF0dXMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdGF0dXMuc2xpY2UoMSkgOiAnVW5rbm93bic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZXhwaXJhdGlvbkRhdGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0V4cGlyZXMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgOiAnTi9BJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Nvc3QuYW1vdW50JyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDb3N0JyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDE0MCxcbiAgICAgICAgICAgIHZhbHVlR2V0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29zdCA9IHBhcmFtcy5kYXRhPy5jb3N0O1xuICAgICAgICAgICAgICAgIGlmICghY29zdClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdOL0EnO1xuICAgICAgICAgICAgICAgIHJldHVybiBgJHtjb3N0LmN1cnJlbmN5fSAke2Nvc3QuYW1vdW50LnRvRml4ZWQoMil9LyR7Y29zdC5iaWxsaW5nQ3ljbGV9YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIF0sIFtdKTtcbiAgICAvLyBBc3NpZ25tZW50IGNvbHVtbnNcbiAgICBjb25zdCBhc3NpZ25tZW50Q29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Rpc3BsYXlOYW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdVc2VyIE5hbWUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMjIwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAndXNlclByaW5jaXBhbE5hbWUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0VtYWlsJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDI2MFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3NrdUlkJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdMaWNlbnNlIFNLVScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAyODAsXG4gICAgICAgICAgICB2YWx1ZUdldHRlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIC8vIE1hcCBTS1UgSUQgdG8gcHJvZHVjdCBuYW1lIGZyb20gcmVzdWx0XG4gICAgICAgICAgICAgICAgY29uc3Qgc2t1SWQgPSBwYXJhbXMuZGF0YT8uc2t1SWQ7XG4gICAgICAgICAgICAgICAgaWYgKCFza3VJZCB8fCAhc3RhdGUucmVzdWx0KVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2t1SWQgfHwgJ1Vua25vd24nO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpY2Vuc2UgPSBzdGF0ZS5yZXN1bHQubGljZW5zZXM/LmZpbmQobCA9PiBsLnNrdUlkID09PSBza3VJZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpY2Vuc2U/LnByb2R1Y3ROYW1lIHx8IHNrdUlkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Fzc2lnbm1lbnRTb3VyY2UnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0Fzc2lnbm1lbnQgU291cmNlJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDE2MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc291cmNlID0gcGFyYW1zLnZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBzb3VyY2UgPyBzb3VyY2UuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzb3VyY2Uuc2xpY2UoMSkgOiAnVW5rbm93bic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnYXNzaWduZWRQbGFucycsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQWN0aXZlIFBsYW5zJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEzMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWU/Lmxlbmd0aCB8fCAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGlzYWJsZWRQbGFucycsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGlzYWJsZWQgUGxhbnMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZT8ubGVuZ3RoIHx8IDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdhc3NpZ25lZERhdGVUaW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdBc3NpZ25lZCBEYXRlJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDE4MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyBuZXcgRGF0ZShwYXJhbXMudmFsdWUpLnRvTG9jYWxlU3RyaW5nKCkgOiAnTi9BJ1xuICAgICAgICB9XG4gICAgXSwgW3N0YXRlLnJlc3VsdF0pO1xuICAgIC8vIFN1YnNjcmlwdGlvbiBjb2x1bW5zXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3N1YnNjcmlwdGlvbk5hbWUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1N1YnNjcmlwdGlvbiBOYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDI4MFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3N1YnNjcmlwdGlvbklkJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTdWJzY3JpcHRpb24gSUQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMjgwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnc3RhdHVzJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTdGF0dXMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTIwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXMgPSBwYXJhbXMudmFsdWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXR1cyA/IHN0YXR1cy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0YXR1cy5zbGljZSgxKSA6ICdVbmtub3duJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd0b3RhbExpY2Vuc2VzJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUb3RhbCBMaWNlbnNlcycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxNDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdhc3NpZ25lZExpY2Vuc2VzJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdBc3NpZ25lZCcsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxMjBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd1dGlsaXphdGlvbicsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVXRpbGl6YXRpb24nLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTMwLFxuICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0b3RhbCA9IHBhcmFtcy5kYXRhPy50b3RhbExpY2Vuc2VzIHx8IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgYXNzaWduZWQgPSBwYXJhbXMuZGF0YT8uYXNzaWduZWRMaWNlbnNlcyB8fCAwO1xuICAgICAgICAgICAgICAgIHJldHVybiB0b3RhbCA+IDAgPyAoKGFzc2lnbmVkIC8gdG90YWwpICogMTAwKS50b0ZpeGVkKDEpICsgJyUnIDogJzAlJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdpc1RyaWFsJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUcmlhbCcsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gJ1llcycgOiAnTm8nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnYXV0b1JlbmV3JyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdBdXRvIFJlbmV3JyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyAnWWVzJyA6ICdObydcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdzdGFydERhdGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1N0YXJ0IERhdGUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgOiAnTi9BJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2VuZERhdGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0VuZCBEYXRlJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyBuZXcgRGF0ZShwYXJhbXMudmFsdWUpLnRvTG9jYWxlRGF0ZVN0cmluZygpIDogJ04vQSdcbiAgICAgICAgfVxuICAgIF0sIFtdKTtcbiAgICAvLyBEeW5hbWljIGNvbHVtbnMgYmFzZWQgb24gYWN0aXZlIHRhYlxuICAgIGNvbnN0IGNvbHVtbnMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgc3dpdGNoIChzdGF0ZS5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgIGNhc2UgJ2xpY2Vuc2VzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbGljZW5zZUNvbHVtbnM7XG4gICAgICAgICAgICBjYXNlICdhc3NpZ25tZW50cyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzc2lnbm1lbnRDb2x1bW5zO1xuICAgICAgICAgICAgY2FzZSAnc3Vic2NyaXB0aW9ucyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbkNvbHVtbnM7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5hY3RpdmVUYWIsIGxpY2Vuc2VDb2x1bW5zLCBhc3NpZ25tZW50Q29sdW1ucywgc3Vic2NyaXB0aW9uQ29sdW1uc10pO1xuICAgIC8vIEZpbHRlcmVkIGxpY2Vuc2VzXG4gICAgY29uc3QgZmlsdGVyZWRMaWNlbnNlcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXN0YXRlLnJlc3VsdD8ubGljZW5zZXMpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIGxldCBmaWx0ZXJlZCA9IHN0YXRlLnJlc3VsdC5saWNlbnNlcztcbiAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5zZWFyY2hUZXh0KSB7XG4gICAgICAgICAgICBjb25zdCBzZWFyY2ggPSBzdGF0ZS5maWx0ZXIuc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIobCA9PiBsLnByb2R1Y3ROYW1lPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICBsLnNrdVBhcnROdW1iZXI/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgIGwudmVuZG9yPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGF0ZS5maWx0ZXIuc2VsZWN0ZWRMaWNlbnNlVHlwZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIobCA9PiBzdGF0ZS5maWx0ZXIuc2VsZWN0ZWRMaWNlbnNlVHlwZXMuaW5jbHVkZXMobC5za3VQYXJ0TnVtYmVyKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5zZWxlY3RlZFN0YXR1c2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gZmlsdGVyZWQuZmlsdGVyKGwgPT4gc3RhdGUuZmlsdGVyLnNlbGVjdGVkU3RhdHVzZXMuaW5jbHVkZXMobC5zdGF0dXMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdGUuZmlsdGVyLnNob3dPbmx5RXhwaXJpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IHRoaXJ0eURheXNGcm9tTm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHRoaXJ0eURheXNGcm9tTm93LnNldERhdGUodGhpcnR5RGF5c0Zyb21Ob3cuZ2V0RGF0ZSgpICsgMzApO1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIobCA9PiBsLmV4cGlyYXRpb25EYXRlICYmIG5ldyBEYXRlKGwuZXhwaXJhdGlvbkRhdGUpIDw9IHRoaXJ0eURheXNGcm9tTm93KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdGUuZmlsdGVyLnNob3dPbmx5VW5hc3NpZ25lZCkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIobCA9PiBsLmF2YWlsYWJsZVVuaXRzID4gMCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbHRlcmVkO1xuICAgIH0sIFtzdGF0ZS5yZXN1bHQ/LmxpY2Vuc2VzLCBzdGF0ZS5maWx0ZXJdKTtcbiAgICAvLyBGaWx0ZXJlZCBkYXRhIGJhc2VkIG9uIGFjdGl2ZSB0YWIgYW5kIGZpbHRlcnMgKGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5KVxuICAgIGNvbnN0IGZpbHRlcmVkRGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHN0YXRlLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgY2FzZSAnbGljZW5zZXMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXJlZExpY2Vuc2VzO1xuICAgICAgICAgICAgY2FzZSAnYXNzaWdubWVudHMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZS5yZXN1bHQ/LmFzc2lnbm1lbnRzPy5maWx0ZXIoYXNzaWdubWVudCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RhdGUuZmlsdGVyLnNlYXJjaFRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gc3RhdGUuZmlsdGVyLnNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFzc2lnbm1lbnQuZGlzcGxheU5hbWU/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWdubWVudC51c2VyUHJpbmNpcGFsTmFtZT8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpO1xuICAgICAgICAgICAgICAgIH0pIHx8IFtdO1xuICAgICAgICAgICAgY2FzZSAnc3Vic2NyaXB0aW9ucyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlLnJlc3VsdD8uc3Vic2NyaXB0aW9ucz8uZmlsdGVyKHN1YiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RhdGUuZmlsdGVyLnNlYXJjaFRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gc3RhdGUuZmlsdGVyLnNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Yi5zdWJzY3JpcHRpb25OYW1lPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Yi5zdWJzY3JpcHRpb25JZD8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpO1xuICAgICAgICAgICAgICAgIH0pIHx8IFtdO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9LCBbc3RhdGUucmVzdWx0LCBzdGF0ZS5hY3RpdmVUYWIsIHN0YXRlLmZpbHRlci5zZWFyY2hUZXh0LCBmaWx0ZXJlZExpY2Vuc2VzXSk7XG4gICAgLy8gU3RhdGlzdGljc1xuICAgIGNvbnN0IHN0YXRzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghc3RhdGUucmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IGxpY2Vuc2VzID0gc3RhdGUucmVzdWx0LmxpY2Vuc2VzIHx8IFtdO1xuICAgICAgICBjb25zdCBhc3NpZ25tZW50cyA9IHN0YXRlLnJlc3VsdC5hc3NpZ25tZW50cyB8fCBbXTtcbiAgICAgICAgY29uc3QgbGljZW5zZXNCeVByb2R1Y3QgPSB7fTtcbiAgICAgICAgY29uc3QgbGljZW5zZXNCeVN0YXR1cyA9IHtcbiAgICAgICAgICAgIGFjdGl2ZTogMCxcbiAgICAgICAgICAgIGV4cGlyZWQ6IDAsXG4gICAgICAgICAgICB0cmlhbDogMCxcbiAgICAgICAgICAgIHN1c3BlbmRlZDogMFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBhc3NpZ25tZW50c0J5U291cmNlID0ge1xuICAgICAgICAgICAgZGlyZWN0OiAwLFxuICAgICAgICAgICAgZ3JvdXA6IDAsXG4gICAgICAgICAgICBpbmhlcml0ZWQ6IDBcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHRvdGFsQ29zdCA9IDA7XG4gICAgICAgIGNvbnN0IGNvc3RCeVByb2R1Y3QgPSB7fTtcbiAgICAgICAgbGljZW5zZXMuZm9yRWFjaChsaWNlbnNlID0+IHtcbiAgICAgICAgICAgIC8vIFByb2R1Y3QgYnJlYWtkb3duXG4gICAgICAgICAgICBjb25zdCBwcm9kdWN0ID0gbGljZW5zZS5wcm9kdWN0TmFtZSB8fCAnVW5rbm93bic7XG4gICAgICAgICAgICBsaWNlbnNlc0J5UHJvZHVjdFtwcm9kdWN0XSA9IChsaWNlbnNlc0J5UHJvZHVjdFtwcm9kdWN0XSB8fCAwKSArIChsaWNlbnNlLnByZXBhaWRVbml0cz8uZW5hYmxlZCB8fCAwKTtcbiAgICAgICAgICAgIC8vIFN0YXR1cyBicmVha2Rvd25cbiAgICAgICAgICAgIGxpY2Vuc2VzQnlTdGF0dXNbbGljZW5zZS5zdGF0dXNdID0gKGxpY2Vuc2VzQnlTdGF0dXNbbGljZW5zZS5zdGF0dXNdIHx8IDApICsgMTtcbiAgICAgICAgICAgIC8vIENvc3QgY2FsY3VsYXRpb25cbiAgICAgICAgICAgIGlmIChsaWNlbnNlLmNvc3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtb250aGx5Q29zdCA9IGxpY2Vuc2UuY29zdC5iaWxsaW5nQ3ljbGUgPT09ICdhbm51YWwnXG4gICAgICAgICAgICAgICAgICAgID8gKGxpY2Vuc2UuY29zdC5hbW91bnQgLyAxMikgKiAobGljZW5zZS5wcmVwYWlkVW5pdHM/LmVuYWJsZWQgfHwgMClcbiAgICAgICAgICAgICAgICAgICAgOiBsaWNlbnNlLmNvc3QuYW1vdW50ICogKGxpY2Vuc2UucHJlcGFpZFVuaXRzPy5lbmFibGVkIHx8IDApO1xuICAgICAgICAgICAgICAgIHRvdGFsQ29zdCArPSBtb250aGx5Q29zdDtcbiAgICAgICAgICAgICAgICBpZiAoIWNvc3RCeVByb2R1Y3RbcHJvZHVjdF0pIHtcbiAgICAgICAgICAgICAgICAgICAgY29zdEJ5UHJvZHVjdFtwcm9kdWN0XSA9IHsgY29zdDogMCwgY291bnQ6IDAsIGNvbnN1bWVkOiAwLCBlbmFibGVkOiAwIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvc3RCeVByb2R1Y3RbcHJvZHVjdF0uY29zdCArPSBtb250aGx5Q29zdDtcbiAgICAgICAgICAgICAgICBjb3N0QnlQcm9kdWN0W3Byb2R1Y3RdLmNvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgY29zdEJ5UHJvZHVjdFtwcm9kdWN0XS5jb25zdW1lZCArPSBsaWNlbnNlLmNvbnN1bWVkVW5pdHMgfHwgMDtcbiAgICAgICAgICAgICAgICBjb3N0QnlQcm9kdWN0W3Byb2R1Y3RdLmVuYWJsZWQgKz0gbGljZW5zZS5wcmVwYWlkVW5pdHM/LmVuYWJsZWQgfHwgMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGFzc2lnbm1lbnRzLmZvckVhY2goYXNzaWdubWVudCA9PiB7XG4gICAgICAgICAgICBjb25zdCBzb3VyY2UgPSBhc3NpZ25tZW50LmFzc2lnbm1lbnRTb3VyY2UgfHwgJ2RpcmVjdCc7XG4gICAgICAgICAgICBhc3NpZ25tZW50c0J5U291cmNlW3NvdXJjZV0gPSAoYXNzaWdubWVudHNCeVNvdXJjZVtzb3VyY2VdIHx8IDApICsgMTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHRvcENvc3RQcm9kdWN0cyA9IE9iamVjdC5lbnRyaWVzKGNvc3RCeVByb2R1Y3QpXG4gICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gYlsxXS5jb3N0IC0gYVsxXS5jb3N0KVxuICAgICAgICAgICAgLnNsaWNlKDAsIDUpXG4gICAgICAgICAgICAubWFwKChbcHJvZHVjdCwgZGF0YV0pID0+ICh7XG4gICAgICAgICAgICBwcm9kdWN0LFxuICAgICAgICAgICAgY29zdDogZGF0YS5jb3N0LFxuICAgICAgICAgICAgY291bnQ6IGRhdGEuY291bnQsXG4gICAgICAgICAgICB1dGlsaXphdGlvbjogZGF0YS5lbmFibGVkID4gMCA/IChkYXRhLmNvbnN1bWVkIC8gZGF0YS5lbmFibGVkKSAqIDEwMCA6IDBcbiAgICAgICAgfSkpO1xuICAgICAgICBjb25zdCB0b3RhbExpY2Vuc2VzID0gc3RhdGUucmVzdWx0LnRvdGFsTGljZW5zZXMgfHwgMDtcbiAgICAgICAgY29uc3QgdG90YWxBc3NpZ25lZCA9IHN0YXRlLnJlc3VsdC50b3RhbEFzc2lnbmVkIHx8IDA7XG4gICAgICAgIGNvbnN0IHRvdGFsQXZhaWxhYmxlID0gc3RhdGUucmVzdWx0LnRvdGFsQXZhaWxhYmxlIHx8IDA7XG4gICAgICAgIGNvbnN0IHV0aWxpemF0aW9uUmF0ZSA9IHRvdGFsTGljZW5zZXMgPiAwID8gKHRvdGFsQXNzaWduZWQgLyB0b3RhbExpY2Vuc2VzKSAqIDEwMCA6IDA7XG4gICAgICAgIGNvbnN0IHRoaXJ0eURheXNGcm9tTm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgdGhpcnR5RGF5c0Zyb21Ob3cuc2V0RGF0ZSh0aGlydHlEYXlzRnJvbU5vdy5nZXREYXRlKCkgKyAzMCk7XG4gICAgICAgIGNvbnN0IGV4cGlyaW5nQ291bnQgPSBsaWNlbnNlcy5maWx0ZXIobCA9PiBsLmV4cGlyYXRpb25EYXRlICYmIG5ldyBEYXRlKGwuZXhwaXJhdGlvbkRhdGUpIDw9IHRoaXJ0eURheXNGcm9tTm93KS5sZW5ndGg7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbExpY2Vuc2VzLFxuICAgICAgICAgICAgdG90YWxBc3NpZ25lZCxcbiAgICAgICAgICAgIHRvdGFsQXZhaWxhYmxlLFxuICAgICAgICAgICAgdG90YWxVbml0czogdG90YWxMaWNlbnNlcyxcbiAgICAgICAgICAgIGNvbnN1bWVkVW5pdHM6IHRvdGFsQXNzaWduZWQsXG4gICAgICAgICAgICBhdmFpbGFibGVVbml0czogdG90YWxBdmFpbGFibGUsXG4gICAgICAgICAgICB1dGlsaXphdGlvblJhdGUsXG4gICAgICAgICAgICB0b3RhbENvc3QsXG4gICAgICAgICAgICBjb3N0UGVyTW9udGg6IHRvdGFsQ29zdCxcbiAgICAgICAgICAgIGxpY2Vuc2VzQnlQcm9kdWN0LFxuICAgICAgICAgICAgbGljZW5zZXNCeVN0YXR1cyxcbiAgICAgICAgICAgIGFzc2lnbm1lbnRzQnlTb3VyY2UsXG4gICAgICAgICAgICB0b3BDb3N0UHJvZHVjdHMsXG4gICAgICAgICAgICBleHBpcmluZ0NvdW50LFxuICAgICAgICAgICAgdW5kZXJsaWNlbnNlZENvdW50OiBzdGF0ZS5yZXN1bHQuY29tcGxpYW5jZVN0YXR1cz8udW5kZXJsaWNlbnNlZFByb2R1Y3RzPy5sZW5ndGggfHwgMCxcbiAgICAgICAgICAgIG92ZXJsaWNlbnNlZENvdW50OiBzdGF0ZS5yZXN1bHQuY29tcGxpYW5jZVN0YXR1cz8ub3ZlcmxpY2Vuc2VkUHJvZHVjdHM/Lmxlbmd0aCB8fCAwXG4gICAgICAgIH07XG4gICAgfSwgW3N0YXRlLnJlc3VsdF0pO1xuICAgIC8vIENTViBFeHBvcnQgd2l0aCBhZHZhbmNlZCBmbGF0dGVuaW5nXG4gICAgY29uc3QgZXhwb3J0VG9DU1YgPSB1c2VDYWxsYmFjaygoZGF0YSwgZmlsZW5hbWUpID0+IHtcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBhbGVydCgnTm8gZGF0YSB0byBleHBvcnQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmbGF0dGVuT2JqZWN0ID0gKG9iaiwgcHJlZml4ID0gJycpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZsYXR0ZW5lZCA9IHt9O1xuICAgICAgICAgICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdLZXkgPSBwcmVmaXggPyBgJHtwcmVmaXh9LiR7a2V5fWAgOiBrZXk7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZmxhdHRlbmVkW25ld0tleV0gPSAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZsYXR0ZW5lZFtuZXdLZXldID0gdmFsdWUudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmxhdHRlbmVkW25ld0tleV0gPSB2YWx1ZS5tYXAodiA9PiB0eXBlb2YgdiA9PT0gJ29iamVjdCcgPyBKU09OLnN0cmluZ2lmeSh2KSA6IHYpLmpvaW4oJzsgJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihmbGF0dGVuZWQsIGZsYXR0ZW5PYmplY3QodmFsdWUsIG5ld0tleSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZmxhdHRlbmVkW25ld0tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBmbGF0dGVuZWQ7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGZsYXR0ZW5lZERhdGEgPSAoZGF0YSA/PyBbXSkubWFwKGl0ZW0gPT4gZmxhdHRlbk9iamVjdChpdGVtKSk7XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBPYmplY3Qua2V5cyhmbGF0dGVuZWREYXRhWzBdKTtcbiAgICAgICAgY29uc3QgY3N2Q29udGVudCA9IFtcbiAgICAgICAgICAgIGhlYWRlcnMuam9pbignLCcpLFxuICAgICAgICAgICAgLi4uZmxhdHRlbmVkRGF0YS5tYXAocm93ID0+IGhlYWRlcnMubWFwKGhlYWRlciA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByb3dbaGVhZGVyXTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdWYWx1ZSA9IHZhbHVlPy50b1N0cmluZygpIHx8ICcnO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdWYWx1ZS5pbmNsdWRlcygnLCcpIHx8IHN0cmluZ1ZhbHVlLmluY2x1ZGVzKCdcIicpXG4gICAgICAgICAgICAgICAgICAgID8gYFwiJHtzdHJpbmdWYWx1ZS5yZXBsYWNlKC9cIi9nLCAnXCJcIicpfVwiYFxuICAgICAgICAgICAgICAgICAgICA6IHN0cmluZ1ZhbHVlO1xuICAgICAgICAgICAgfSkuam9pbignLCcpKVxuICAgICAgICBdLmpvaW4oJ1xcbicpO1xuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW2NzdkNvbnRlbnRdLCB7IHR5cGU6ICd0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04OycgfSk7XG4gICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGxpbmsuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgIGxpbmsuZG93bmxvYWQgPSBmaWxlbmFtZTtcbiAgICAgICAgbGluay5jbGljaygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBFeGNlbCBFeHBvcnRcbiAgICBjb25zdCBleHBvcnRUb0V4Y2VsID0gdXNlQ2FsbGJhY2soYXN5bmMgKGRhdGEsIGZpbGVuYW1lKSA9PiB7XG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgYWxlcnQoJ05vIGRhdGEgdG8gZXhwb3J0Jyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9FeHBvcnQvRXhwb3J0VG9FeGNlbC5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdFeHBvcnQtTGljZW5zaW5nRGF0YScsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBEYXRhOiBkYXRhLFxuICAgICAgICAgICAgICAgICAgICBTaGVldE5hbWU6IHN0YXRlLmFjdGl2ZVRhYixcbiAgICAgICAgICAgICAgICAgICAgRmlsZU5hbWU6IGZpbGVuYW1lXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFeGNlbCBleHBvcnQgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgICAgIGFsZXJ0KCdFeGNlbCBleHBvcnQgZmFpbGVkOiAnICsgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9LCBbc3RhdGUuYWN0aXZlVGFiXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gU3RhdGVcbiAgICAgICAgY29uZmlnOiBzdGF0ZS5jb25maWcsXG4gICAgICAgIHJlc3VsdDogc3RhdGUucmVzdWx0LFxuICAgICAgICBpc0Rpc2NvdmVyaW5nOiBzdGF0ZS5pc0Rpc2NvdmVyaW5nLFxuICAgICAgICBwcm9ncmVzczogc3RhdGUucHJvZ3Jlc3MsXG4gICAgICAgIGFjdGl2ZVRhYjogc3RhdGUuYWN0aXZlVGFiLFxuICAgICAgICBmaWx0ZXI6IHN0YXRlLmZpbHRlcixcbiAgICAgICAgZXJyb3I6IHN0YXRlLmVycm9yLFxuICAgICAgICAvLyBEYXRhXG4gICAgICAgIGNvbHVtbnMsXG4gICAgICAgIGZpbHRlcmVkRGF0YSxcbiAgICAgICAgZmlsdGVyZWRMaWNlbnNlcyxcbiAgICAgICAgc3RhdHMsXG4gICAgICAgIC8vIENvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICBsaWNlbnNlQ29sdW1ucyxcbiAgICAgICAgYXNzaWdubWVudENvbHVtbnMsXG4gICAgICAgIHN1YnNjcmlwdGlvbkNvbHVtbnMsXG4gICAgICAgIC8vIEFjdGlvbnNcbiAgICAgICAgc3RhcnREaXNjb3ZlcnksXG4gICAgICAgIGNhbmNlbERpc2NvdmVyeSxcbiAgICAgICAgdXBkYXRlQ29uZmlnLFxuICAgICAgICBzZXRBY3RpdmVUYWIsXG4gICAgICAgIHVwZGF0ZUZpbHRlcixcbiAgICAgICAgY2xlYXJFcnJvcixcbiAgICAgICAgZXhwb3J0VG9DU1YsXG4gICAgICAgIGV4cG9ydFRvRXhjZWxcbiAgICB9O1xufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==