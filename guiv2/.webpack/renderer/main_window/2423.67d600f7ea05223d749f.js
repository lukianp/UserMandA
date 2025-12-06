"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2423],{

/***/ 2423:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   j: () => (/* binding */ useIntuneDiscoveryLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(33813);
/* harmony import */ var _lib_electron_api_fallback__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(58350);



const useIntuneDiscoveryLogic = () => {
    // Get selected profile from store
    const selectedSourceProfile = (0,_store_useProfileStore__WEBPACK_IMPORTED_MODULE_1__/* .useProfileStore */ .K)((state) => state.selectedSourceProfile);
    const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        config: {
            id: 'default-intune-config',
            name: 'Default Intune Discovery',
            tenantId: '',
            includeDevices: true,
            includeApplications: true,
            includePolicies: true,
            includeComplianceReports: true,
            includeConfigurationPolicies: true,
            includeCompliancePolicies: true,
            includeAppProtectionPolicies: true,
            platforms: [],
            timeout: 600000,
            createdAt: new Date(),
            updatedAt: new Date()
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
            selectedPlatforms: [],
            selectedComplianceStates: [],
            selectedManagementStates: [],
            showNonCompliantOnly: false
        },
        cancellationToken: null,
        error: null
    });
    // IPC progress tracking
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const unsubscribe = window.electronAPI?.onProgress?.((data) => {
            if (data.type === 'intune-discovery' && data.token === state.cancellationToken) {
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
            console.error('[IntuneDiscovery]', errorMessage);
            return;
        }
        const token = `intune-discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setState(prev => ({
            ...prev,
            isDiscovering: true,
            error: null,
            cancellationToken: token,
            progress: { current: 0, total: 100, message: 'Starting Intune discovery...', percentage: 0 }
        }));
        console.log(`[IntuneDiscovery] Starting discovery for company: ${selectedSourceProfile.companyName}`);
        console.log(`[IntuneDiscovery] Parameters:`, {
            IncludeDevices: state.config.includeDevices,
            IncludeApplications: state.config.includeApplications,
            IncludeConfigurationPolicies: state.config.includeConfigurationPolicies,
            IncludeCompliancePolicies: state.config.includeCompliancePolicies,
            IncludeAppProtectionPolicies: state.config.includeAppProtectionPolicies
        });
        try {
            const electronAPI = (0,_lib_electron_api_fallback__WEBPACK_IMPORTED_MODULE_2__/* .getElectronAPI */ .d)();
            const discoveryResult = await electronAPI.executeDiscoveryModule('Intune', selectedSourceProfile.companyName, {
                IncludeDevices: state.config.includeDevices,
                IncludeApplications: state.config.includeApplications,
                IncludeConfigurationPolicies: state.config.includeConfigurationPolicies,
                IncludeCompliancePolicies: state.config.includeCompliancePolicies,
                IncludeAppProtectionPolicies: state.config.includeAppProtectionPolicies
            }, { timeout: state.config.timeout || 600000 });
            setState(prev => ({
                ...prev,
                result: discoveryResult.data || discoveryResult,
                isDiscovering: false,
                cancellationToken: null,
                progress: { current: 100, total: 100, message: 'Completed', percentage: 100 }
            }));
            console.log(`[IntuneDiscovery] Discovery completed successfully`);
        }
        catch (error) {
            console.error('[IntuneDiscovery] Discovery failed:', error);
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
    // Device columns
    const deviceColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        {
            field: 'deviceName',
            headerName: 'Device Name',
            sortable: true,
            filter: true,
            width: 200
        },
        {
            field: 'userPrincipalName',
            headerName: 'User',
            sortable: true,
            filter: true,
            width: 220
        },
        {
            field: 'operatingSystem',
            headerName: 'Platform',
            sortable: true,
            filter: true,
            width: 120
        },
        {
            field: 'osVersion',
            headerName: 'OS Version',
            sortable: true,
            filter: true,
            width: 140
        },
        {
            field: 'complianceState',
            headerName: 'Compliance',
            sortable: true,
            filter: true,
            width: 130,
            valueFormatter: (params) => params.value || 'Unknown'
        },
        {
            field: 'managementState',
            headerName: 'Management',
            sortable: true,
            filter: true,
            width: 130
        },
        {
            field: 'lastSyncDateTime',
            headerName: 'Last Sync',
            sortable: true,
            filter: true,
            width: 180,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'Never'
        },
        {
            field: 'isEncrypted',
            headerName: 'Encrypted',
            sortable: true,
            filter: true,
            width: 110,
            valueFormatter: (params) => params.value ? 'Yes' : 'No'
        },
        {
            field: 'totalStorageSpaceInBytes',
            headerName: 'Storage',
            sortable: true,
            filter: true,
            width: 130,
            valueFormatter: (params) => {
                if (!params.value)
                    return 'N/A';
                const gb = params.value / (1024 * 1024 * 1024);
                return `${gb.toFixed(2)} GB`;
            }
        },
    ], []);
    // Application columns
    const applicationColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        {
            field: 'displayName',
            headerName: 'Application Name',
            sortable: true,
            filter: true,
            width: 250
        },
        {
            field: 'publisher',
            headerName: 'Publisher',
            sortable: true,
            filter: true,
            width: 200
        },
        {
            field: 'appType',
            headerName: 'Type',
            sortable: true,
            filter: true,
            width: 150
        },
        {
            field: 'installSummary.installedDeviceCount',
            headerName: 'Installed',
            sortable: true,
            filter: true,
            width: 120,
            valueGetter: (params) => params.data?.installSummary?.installedDeviceCount || 0
        },
        {
            field: 'installSummary.failedDeviceCount',
            headerName: 'Failed',
            sortable: true,
            filter: true,
            width: 110,
            valueGetter: (params) => params.data?.installSummary?.failedDeviceCount || 0
        },
        {
            field: 'installSummary.pendingInstallDeviceCount',
            headerName: 'Pending',
            sortable: true,
            filter: true,
            width: 110,
            valueGetter: (params) => params.data?.installSummary?.pendingInstallDeviceCount || 0
        },
        {
            field: 'createdDateTime',
            headerName: 'Created',
            sortable: true,
            filter: true,
            width: 180,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
        }
    ], []);
    // Configuration policy columns
    const configPolicyColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        {
            field: 'displayName',
            headerName: 'Policy Name',
            sortable: true,
            filter: true,
            width: 250
        },
        {
            field: 'description',
            headerName: 'Description',
            sortable: true,
            filter: true,
            width: 300
        },
        {
            field: 'platform',
            headerName: 'Platform',
            sortable: true,
            filter: true,
            width: 180,
            valueFormatter: (params) => params.value || 'N/A'
        },
        {
            field: 'assignments',
            headerName: 'Assignments',
            sortable: true,
            filter: true,
            width: 130,
            valueFormatter: (params) => params.value?.length || 0
        },
        {
            field: 'deploymentSummary.succeededDevicesCount',
            headerName: 'Succeeded',
            sortable: true,
            filter: true,
            width: 120,
            valueGetter: (params) => params.data?.deploymentSummary?.succeededDevicesCount || 0
        },
        {
            field: 'deploymentSummary.errorDevicesCount',
            headerName: 'Errors',
            sortable: true,
            filter: true,
            width: 100,
            valueGetter: (params) => params.data?.deploymentSummary?.errorDevicesCount || 0
        },
        {
            field: 'lastModifiedDateTime',
            headerName: 'Modified',
            sortable: true,
            filter: true,
            width: 180,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
        }
    ], []);
    // Compliance policy columns
    const compliancePolicyColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        {
            field: 'displayName',
            headerName: 'Policy Name',
            sortable: true,
            filter: true,
            width: 250
        },
        {
            field: 'description',
            headerName: 'Description',
            sortable: true,
            filter: true,
            width: 300
        },
        {
            field: 'platform',
            headerName: 'Platform',
            sortable: true,
            filter: true,
            width: 180,
            valueFormatter: (params) => params.value || 'N/A'
        },
        {
            field: 'scheduledActionsForRule',
            headerName: 'Actions',
            sortable: true,
            filter: true,
            width: 130,
            valueFormatter: (params) => params.value?.length || 0
        },
        {
            field: 'deviceStatusOverview.successCount',
            headerName: 'Success',
            sortable: true,
            filter: true,
            width: 120,
            valueGetter: (params) => params.data?.deviceStatusOverview?.successCount || 0
        },
        {
            field: 'deviceStatusOverview.errorCount',
            headerName: 'Errors',
            sortable: true,
            filter: true,
            width: 100,
            valueGetter: (params) => params.data?.deviceStatusOverview?.errorCount || 0
        },
        {
            field: 'version',
            headerName: 'Version',
            sortable: true,
            filter: true,
            width: 100
        }
    ], []);
    // App protection policy columns
    const appProtectionPolicyColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        {
            field: 'displayName',
            headerName: 'Policy Name',
            sortable: true,
            filter: true,
            width: 250
        },
        {
            field: 'description',
            headerName: 'Description',
            sortable: true,
            filter: true,
            width: 300
        },
        {
            field: 'platform',
            headerName: 'Platform',
            sortable: true,
            filter: true,
            width: 130
        },
        {
            field: 'pinRequired',
            headerName: 'PIN Required',
            sortable: true,
            filter: true,
            width: 140,
            valueFormatter: (params) => params.value ? 'Yes' : 'No'
        },
        {
            field: 'dataBackupBlocked',
            headerName: 'Backup Blocked',
            sortable: true,
            filter: true,
            width: 150,
            valueFormatter: (params) => params.value ? 'Yes' : 'No'
        },
        {
            field: 'deviceComplianceRequired',
            headerName: 'Compliance Required',
            sortable: true,
            filter: true,
            width: 180,
            valueFormatter: (params) => params.value ? 'Yes' : 'No'
        },
        {
            field: 'createdDateTime',
            headerName: 'Created',
            sortable: true,
            filter: true,
            width: 180,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
        }
    ], []);
    // Dynamic columns based on active tab
    const columns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        switch (state.activeTab) {
            case 'devices':
                return deviceColumns;
            case 'applications':
                return applicationColumns;
            case 'config-policies':
                return configPolicyColumns;
            case 'compliance-policies':
                return compliancePolicyColumns;
            case 'app-protection':
                return appProtectionPolicyColumns;
            default:
                return [];
        }
    }, [state.activeTab, deviceColumns, applicationColumns, configPolicyColumns, compliancePolicyColumns, appProtectionPolicyColumns]);
    // Filtered devices
    const filteredDevices = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.result?.devices)
            return [];
        let filtered = state.result.devices;
        if (state.filter.searchText) {
            const search = state.filter.searchText.toLowerCase();
            filtered = filtered.filter(d => d.deviceName?.toLowerCase().includes(search) ||
                d.userPrincipalName?.toLowerCase().includes(search) ||
                d.model?.toLowerCase().includes(search));
        }
        if (state.filter.selectedPlatforms.length > 0) {
            filtered = filtered.filter(d => state.filter.selectedPlatforms.includes(d.operatingSystem));
        }
        if (state.filter.selectedComplianceStates.length > 0) {
            filtered = filtered.filter(d => state.filter.selectedComplianceStates.includes(d.complianceState));
        }
        if (state.filter.selectedManagementStates.length > 0) {
            filtered = filtered.filter(d => state.filter.selectedManagementStates.includes(d.managementState));
        }
        if (state.filter.showNonCompliantOnly) {
            filtered = filtered.filter(d => d.complianceState !== 'compliant');
        }
        return filtered;
    }, [state.result?.devices, state.filter]);
    // Filtered applications
    const filteredApplications = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.result?.applications)
            return [];
        let filtered = state.result.applications;
        if (state.filter.searchText) {
            const search = state.filter.searchText.toLowerCase();
            filtered = filtered.filter(app => app.displayName?.toLowerCase().includes(search) ||
                app.description?.toLowerCase().includes(search));
        }
        return filtered;
    }, [state.result?.applications, state.filter.searchText]);
    // Filtered configuration policies
    const filteredConfigurations = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.result?.configurationPolicies)
            return [];
        let filtered = state.result.configurationPolicies;
        if (state.filter.searchText) {
            const search = state.filter.searchText.toLowerCase();
            filtered = filtered.filter(policy => policy.displayName?.toLowerCase().includes(search) ||
                policy.description?.toLowerCase().includes(search));
        }
        return filtered;
    }, [state.result?.configurationPolicies, state.filter.searchText]);
    // Filtered data based on active tab and filters (for backward compatibility)
    const filteredData = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        switch (state.activeTab) {
            case 'devices':
                return filteredDevices;
            case 'applications':
                return filteredApplications;
            case 'config-policies':
                return filteredConfigurations;
            case 'compliance-policies':
                return state.result?.compliancePolicies?.filter(policy => {
                    if (!state.filter.searchText)
                        return true;
                    const search = state.filter.searchText.toLowerCase();
                    return policy.displayName?.toLowerCase().includes(search) ||
                        policy.description?.toLowerCase().includes(search);
                }) || [];
            case 'app-protection':
                return state.result?.appProtectionPolicies?.filter(policy => {
                    if (!state.filter.searchText)
                        return true;
                    const search = state.filter.searchText.toLowerCase();
                    return policy.displayName?.toLowerCase().includes(search) ||
                        policy.description?.toLowerCase().includes(search);
                }) || [];
            default:
                return [];
        }
    }, [state.result, state.activeTab, state.filter.searchText, filteredDevices, filteredApplications, filteredConfigurations]);
    // Statistics
    const stats = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.result)
            return null;
        const devices = state.result.devices || [];
        const devicesByPlatform = {};
        const devicesByComplianceState = {};
        const deviceModelCounts = {};
        const nonComplianceReasonCounts = {};
        devices.forEach(device => {
            // Platform breakdown
            const platform = device.operatingSystem || 'Unknown';
            devicesByPlatform[platform] = (devicesByPlatform[platform] || 0) + 1;
            // Compliance state breakdown
            const complianceState = device.complianceState || 'Unknown';
            devicesByComplianceState[complianceState] = (devicesByComplianceState[complianceState] || 0) + 1;
            // Device model counts
            if (device.model) {
                deviceModelCounts[device.model] = (deviceModelCounts[device.model] || 0) + 1;
            }
            // Non-compliance reasons
            if (device.complianceState !== 'compliant' && device.complianceGracePeriodExpirationDateTime) {
                // This is simplified - in real implementation, parse actual non-compliance details
                const reason = 'Compliance grace period expired';
                nonComplianceReasonCounts[reason] = (nonComplianceReasonCounts[reason] || 0) + 1;
            }
        });
        const topDeviceModels = Object.entries(deviceModelCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([model, count]) => ({ model, count }));
        const topNonComplianceReasons = Object.entries(nonComplianceReasonCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([reason, count]) => ({ reason, count }));
        const compliantDevices = devicesByComplianceState['compliant'] || 0;
        const totalDevices = devices.length;
        const complianceRate = totalDevices > 0 ? (compliantDevices / totalDevices) * 100 : 0;
        return {
            totalDevices,
            compliantDevices,
            nonCompliantDevices: totalDevices - compliantDevices,
            devicesByPlatform,
            devicesByComplianceState,
            totalApplications: state.result.totalApplicationsFound || 0,
            totalConfigPolicies: state.result.totalConfigPoliciesFound || 0,
            totalCompliancePolicies: state.result.totalCompliancePoliciesFound || 0,
            totalAppProtectionPolicies: state.result.totalAppProtectionPoliciesFound || 0,
            totalPolicies: (state.result.totalConfigPoliciesFound || 0) + (state.result.totalCompliancePoliciesFound || 0) + (state.result.totalAppProtectionPoliciesFound || 0),
            totalConfigurations: state.result.totalConfigPoliciesFound || 0,
            complianceRate,
            topDeviceModels,
            topNonComplianceReasons
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
                functionName: 'Export-IntuneData',
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
        filteredDevices,
        filteredApplications,
        filteredConfigurations,
        stats,
        // Column definitions
        deviceColumns,
        policyColumns: configPolicyColumns,
        applicationColumns,
        configurationColumns: compliancePolicyColumns,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MsOENBQU87QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyw4Q0FBTztBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVDQUF1Qyw4Q0FBTztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNB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ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlSW50dW5lRGlzY292ZXJ5TG9naWMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VQcm9maWxlU3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VQcm9maWxlU3RvcmUnO1xuaW1wb3J0IHsgZ2V0RWxlY3Ryb25BUEkgfSBmcm9tICcuLi9saWIvZWxlY3Ryb24tYXBpLWZhbGxiYWNrJztcbmV4cG9ydCBjb25zdCB1c2VJbnR1bmVEaXNjb3ZlcnlMb2dpYyA9ICgpID0+IHtcbiAgICAvLyBHZXQgc2VsZWN0ZWQgcHJvZmlsZSBmcm9tIHN0b3JlXG4gICAgY29uc3Qgc2VsZWN0ZWRTb3VyY2VQcm9maWxlID0gdXNlUHJvZmlsZVN0b3JlKChzdGF0ZSkgPT4gc3RhdGUuc2VsZWN0ZWRTb3VyY2VQcm9maWxlKTtcbiAgICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgY29uZmlnOiB7XG4gICAgICAgICAgICBpZDogJ2RlZmF1bHQtaW50dW5lLWNvbmZpZycsXG4gICAgICAgICAgICBuYW1lOiAnRGVmYXVsdCBJbnR1bmUgRGlzY292ZXJ5JyxcbiAgICAgICAgICAgIHRlbmFudElkOiAnJyxcbiAgICAgICAgICAgIGluY2x1ZGVEZXZpY2VzOiB0cnVlLFxuICAgICAgICAgICAgaW5jbHVkZUFwcGxpY2F0aW9uczogdHJ1ZSxcbiAgICAgICAgICAgIGluY2x1ZGVQb2xpY2llczogdHJ1ZSxcbiAgICAgICAgICAgIGluY2x1ZGVDb21wbGlhbmNlUmVwb3J0czogdHJ1ZSxcbiAgICAgICAgICAgIGluY2x1ZGVDb25maWd1cmF0aW9uUG9saWNpZXM6IHRydWUsXG4gICAgICAgICAgICBpbmNsdWRlQ29tcGxpYW5jZVBvbGljaWVzOiB0cnVlLFxuICAgICAgICAgICAgaW5jbHVkZUFwcFByb3RlY3Rpb25Qb2xpY2llczogdHJ1ZSxcbiAgICAgICAgICAgIHBsYXRmb3JtczogW10sXG4gICAgICAgICAgICB0aW1lb3V0OiA2MDAwMDAsXG4gICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKClcbiAgICAgICAgfSxcbiAgICAgICAgcmVzdWx0OiBudWxsLFxuICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgcHJvZ3Jlc3M6IHtcbiAgICAgICAgICAgIGN1cnJlbnQ6IDAsXG4gICAgICAgICAgICB0b3RhbDogMTAwLFxuICAgICAgICAgICAgbWVzc2FnZTogJycsXG4gICAgICAgICAgICBwZXJjZW50YWdlOiAwXG4gICAgICAgIH0sXG4gICAgICAgIGFjdGl2ZVRhYjogJ292ZXJ2aWV3JyxcbiAgICAgICAgZmlsdGVyOiB7XG4gICAgICAgICAgICBzZWFyY2hUZXh0OiAnJyxcbiAgICAgICAgICAgIHNlbGVjdGVkUGxhdGZvcm1zOiBbXSxcbiAgICAgICAgICAgIHNlbGVjdGVkQ29tcGxpYW5jZVN0YXRlczogW10sXG4gICAgICAgICAgICBzZWxlY3RlZE1hbmFnZW1lbnRTdGF0ZXM6IFtdLFxuICAgICAgICAgICAgc2hvd05vbkNvbXBsaWFudE9ubHk6IGZhbHNlXG4gICAgICAgIH0sXG4gICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBudWxsLFxuICAgICAgICBlcnJvcjogbnVsbFxuICAgIH0pO1xuICAgIC8vIElQQyBwcm9ncmVzcyB0cmFja2luZ1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlID0gd2luZG93LmVsZWN0cm9uQVBJPy5vblByb2dyZXNzPy4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLnR5cGUgPT09ICdpbnR1bmUtZGlzY292ZXJ5JyAmJiBkYXRhLnRva2VuID09PSBzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGRhdGEuY3VycmVudCB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWw6IGRhdGEudG90YWwgfHwgMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGF0YS5tZXNzYWdlIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyY2VudGFnZTogZGF0YS5wZXJjZW50YWdlIHx8IDBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodW5zdWJzY3JpYmUpXG4gICAgICAgICAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfTtcbiAgICB9LCBbc3RhdGUuY2FuY2VsbGF0aW9uVG9rZW5dKTtcbiAgICBjb25zdCBzdGFydERpc2NvdmVyeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFzZWxlY3RlZFNvdXJjZVByb2ZpbGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9ICdObyBjb21wYW55IHByb2ZpbGUgc2VsZWN0ZWQuIFBsZWFzZSBzZWxlY3QgYSBwcm9maWxlIGZpcnN0Lic7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGVycm9yOiBlcnJvck1lc3NhZ2UgfSkpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0ludHVuZURpc2NvdmVyeV0nLCBlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHRva2VuID0gYGludHVuZS1kaXNjb3ZlcnktJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgaXNEaXNjb3ZlcmluZzogdHJ1ZSxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IHRva2VuLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IHsgY3VycmVudDogMCwgdG90YWw6IDEwMCwgbWVzc2FnZTogJ1N0YXJ0aW5nIEludHVuZSBkaXNjb3ZlcnkuLi4nLCBwZXJjZW50YWdlOiAwIH1cbiAgICAgICAgfSkpO1xuICAgICAgICBjb25zb2xlLmxvZyhgW0ludHVuZURpc2NvdmVyeV0gU3RhcnRpbmcgZGlzY292ZXJ5IGZvciBjb21wYW55OiAke3NlbGVjdGVkU291cmNlUHJvZmlsZS5jb21wYW55TmFtZX1gKTtcbiAgICAgICAgY29uc29sZS5sb2coYFtJbnR1bmVEaXNjb3ZlcnldIFBhcmFtZXRlcnM6YCwge1xuICAgICAgICAgICAgSW5jbHVkZURldmljZXM6IHN0YXRlLmNvbmZpZy5pbmNsdWRlRGV2aWNlcyxcbiAgICAgICAgICAgIEluY2x1ZGVBcHBsaWNhdGlvbnM6IHN0YXRlLmNvbmZpZy5pbmNsdWRlQXBwbGljYXRpb25zLFxuICAgICAgICAgICAgSW5jbHVkZUNvbmZpZ3VyYXRpb25Qb2xpY2llczogc3RhdGUuY29uZmlnLmluY2x1ZGVDb25maWd1cmF0aW9uUG9saWNpZXMsXG4gICAgICAgICAgICBJbmNsdWRlQ29tcGxpYW5jZVBvbGljaWVzOiBzdGF0ZS5jb25maWcuaW5jbHVkZUNvbXBsaWFuY2VQb2xpY2llcyxcbiAgICAgICAgICAgIEluY2x1ZGVBcHBQcm90ZWN0aW9uUG9saWNpZXM6IHN0YXRlLmNvbmZpZy5pbmNsdWRlQXBwUHJvdGVjdGlvblBvbGljaWVzXG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZWxlY3Ryb25BUEkgPSBnZXRFbGVjdHJvbkFQSSgpO1xuICAgICAgICAgICAgY29uc3QgZGlzY292ZXJ5UmVzdWx0ID0gYXdhaXQgZWxlY3Ryb25BUEkuZXhlY3V0ZURpc2NvdmVyeU1vZHVsZSgnSW50dW5lJywgc2VsZWN0ZWRTb3VyY2VQcm9maWxlLmNvbXBhbnlOYW1lLCB7XG4gICAgICAgICAgICAgICAgSW5jbHVkZURldmljZXM6IHN0YXRlLmNvbmZpZy5pbmNsdWRlRGV2aWNlcyxcbiAgICAgICAgICAgICAgICBJbmNsdWRlQXBwbGljYXRpb25zOiBzdGF0ZS5jb25maWcuaW5jbHVkZUFwcGxpY2F0aW9ucyxcbiAgICAgICAgICAgICAgICBJbmNsdWRlQ29uZmlndXJhdGlvblBvbGljaWVzOiBzdGF0ZS5jb25maWcuaW5jbHVkZUNvbmZpZ3VyYXRpb25Qb2xpY2llcyxcbiAgICAgICAgICAgICAgICBJbmNsdWRlQ29tcGxpYW5jZVBvbGljaWVzOiBzdGF0ZS5jb25maWcuaW5jbHVkZUNvbXBsaWFuY2VQb2xpY2llcyxcbiAgICAgICAgICAgICAgICBJbmNsdWRlQXBwUHJvdGVjdGlvblBvbGljaWVzOiBzdGF0ZS5jb25maWcuaW5jbHVkZUFwcFByb3RlY3Rpb25Qb2xpY2llc1xuICAgICAgICAgICAgfSwgeyB0aW1lb3V0OiBzdGF0ZS5jb25maWcudGltZW91dCB8fCA2MDAwMDAgfSk7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICByZXN1bHQ6IGRpc2NvdmVyeVJlc3VsdC5kYXRhIHx8IGRpc2NvdmVyeVJlc3VsdCxcbiAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbjogbnVsbCxcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogeyBjdXJyZW50OiAxMDAsIHRvdGFsOiAxMDAsIG1lc3NhZ2U6ICdDb21wbGV0ZWQnLCBwZXJjZW50YWdlOiAxMDAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtJbnR1bmVEaXNjb3ZlcnldIERpc2NvdmVyeSBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5YCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbSW50dW5lRGlzY292ZXJ5XSBEaXNjb3ZlcnkgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgIGlzRGlzY292ZXJpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBudWxsLFxuICAgICAgICAgICAgICAgIGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICdEaXNjb3ZlcnkgZmFpbGVkJ1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgfSwgW3NlbGVjdGVkU291cmNlUHJvZmlsZSwgc3RhdGUuY29uZmlnXSk7XG4gICAgY29uc3QgY2FuY2VsRGlzY292ZXJ5ID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoc3RhdGUuY2FuY2VsbGF0aW9uVG9rZW4pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmNhbmNlbEV4ZWN1dGlvbihzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbik7XG4gICAgICAgICAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgICAgICBpc0Rpc2NvdmVyaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzOiB7IGN1cnJlbnQ6IDAsIHRvdGFsOiAxMDAsIG1lc3NhZ2U6ICdEaXNjb3ZlcnkgY2FuY2VsbGVkJywgcGVyY2VudGFnZTogMCB9XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNhbmNlbCBkaXNjb3Zlcnk6JywgZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwgW3N0YXRlLmNhbmNlbGxhdGlvblRva2VuXSk7XG4gICAgY29uc3QgdXBkYXRlQ29uZmlnID0gdXNlQ2FsbGJhY2soKHVwZGF0ZXMpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGNvbmZpZzogeyAuLi5wcmV2LmNvbmZpZywgLi4udXBkYXRlcyB9XG4gICAgICAgIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3Qgc2V0QWN0aXZlVGFiID0gdXNlQ2FsbGJhY2soKHRhYikgPT4ge1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGFjdGl2ZVRhYjogdGFiIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgdXBkYXRlRmlsdGVyID0gdXNlQ2FsbGJhY2soKHVwZGF0ZXMpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGZpbHRlcjogeyAuLi5wcmV2LmZpbHRlciwgLi4udXBkYXRlcyB9XG4gICAgICAgIH0pKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgY2xlYXJFcnJvciA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBlcnJvcjogbnVsbCB9KSk7XG4gICAgfSwgW10pO1xuICAgIC8vIERldmljZSBjb2x1bW5zXG4gICAgY29uc3QgZGV2aWNlQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2RldmljZU5hbWUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0RldmljZSBOYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDIwMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3VzZXJQcmluY2lwYWxOYW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdVc2VyJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDIyMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ29wZXJhdGluZ1N5c3RlbScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUGxhdGZvcm0nLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTIwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnb3NWZXJzaW9uJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdPUyBWZXJzaW9uJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDE0MFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2NvbXBsaWFuY2VTdGF0ZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQ29tcGxpYW5jZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxMzAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlIHx8ICdVbmtub3duJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ21hbmFnZW1lbnRTdGF0ZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTWFuYWdlbWVudCcsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxMzBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdsYXN0U3luY0RhdGVUaW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdMYXN0IFN5bmMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKSA6ICdOZXZlcidcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdpc0VuY3J5cHRlZCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRW5jcnlwdGVkJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDExMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyAnWWVzJyA6ICdObydcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICd0b3RhbFN0b3JhZ2VTcGFjZUluQnl0ZXMnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1N0b3JhZ2UnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTMwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXBhcmFtcy52YWx1ZSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdOL0EnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGdiID0gcGFyYW1zLnZhbHVlIC8gKDEwMjQgKiAxMDI0ICogMTAyNCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke2diLnRvRml4ZWQoMil9IEdCYDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICBdLCBbXSk7XG4gICAgLy8gQXBwbGljYXRpb24gY29sdW1uc1xuICAgIGNvbnN0IGFwcGxpY2F0aW9uQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Rpc3BsYXlOYW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdBcHBsaWNhdGlvbiBOYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDI1MFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3B1Ymxpc2hlcicsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUHVibGlzaGVyJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDIwMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2FwcFR5cGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1R5cGUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTUwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnaW5zdGFsbFN1bW1hcnkuaW5zdGFsbGVkRGV2aWNlQ291bnQnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0luc3RhbGxlZCcsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxMjAsXG4gICAgICAgICAgICB2YWx1ZUdldHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLmRhdGE/Lmluc3RhbGxTdW1tYXJ5Py5pbnN0YWxsZWREZXZpY2VDb3VudCB8fCAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnaW5zdGFsbFN1bW1hcnkuZmFpbGVkRGV2aWNlQ291bnQnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0ZhaWxlZCcsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxMTAsXG4gICAgICAgICAgICB2YWx1ZUdldHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLmRhdGE/Lmluc3RhbGxTdW1tYXJ5Py5mYWlsZWREZXZpY2VDb3VudCB8fCAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnaW5zdGFsbFN1bW1hcnkucGVuZGluZ0luc3RhbGxEZXZpY2VDb3VudCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUGVuZGluZycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxMTAsXG4gICAgICAgICAgICB2YWx1ZUdldHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLmRhdGE/Lmluc3RhbGxTdW1tYXJ5Py5wZW5kaW5nSW5zdGFsbERldmljZUNvdW50IHx8IDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdjcmVhdGVkRGF0ZVRpbWUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0NyZWF0ZWQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKSA6ICdOL0EnXG4gICAgICAgIH1cbiAgICBdLCBbXSk7XG4gICAgLy8gQ29uZmlndXJhdGlvbiBwb2xpY3kgY29sdW1uc1xuICAgIGNvbnN0IGNvbmZpZ1BvbGljeUNvbHVtbnMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkaXNwbGF5TmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUG9saWN5IE5hbWUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMjUwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDMwMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3BsYXRmb3JtJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdQbGF0Zm9ybScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxODAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlIHx8ICdOL0EnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnYXNzaWdubWVudHMnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0Fzc2lnbm1lbnRzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEzMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWU/Lmxlbmd0aCB8fCAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGVwbG95bWVudFN1bW1hcnkuc3VjY2VlZGVkRGV2aWNlc0NvdW50JyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTdWNjZWVkZWQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTIwLFxuICAgICAgICAgICAgdmFsdWVHZXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy5kYXRhPy5kZXBsb3ltZW50U3VtbWFyeT8uc3VjY2VlZGVkRGV2aWNlc0NvdW50IHx8IDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkZXBsb3ltZW50U3VtbWFyeS5lcnJvckRldmljZXNDb3VudCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRXJyb3JzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIHZhbHVlR2V0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMuZGF0YT8uZGVwbG95bWVudFN1bW1hcnk/LmVycm9yRGV2aWNlc0NvdW50IHx8IDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdsYXN0TW9kaWZpZWREYXRlVGltZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTW9kaWZpZWQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKSA6ICdOL0EnXG4gICAgICAgIH1cbiAgICBdLCBbXSk7XG4gICAgLy8gQ29tcGxpYW5jZSBwb2xpY3kgY29sdW1uc1xuICAgIGNvbnN0IGNvbXBsaWFuY2VQb2xpY3lDb2x1bW5zID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGlzcGxheU5hbWUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1BvbGljeSBOYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDI1MFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAzMDBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdwbGF0Zm9ybScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnUGxhdGZvcm0nLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSB8fCAnTi9BJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3NjaGVkdWxlZEFjdGlvbnNGb3JSdWxlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdBY3Rpb25zJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEzMCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWU/Lmxlbmd0aCB8fCAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGV2aWNlU3RhdHVzT3ZlcnZpZXcuc3VjY2Vzc0NvdW50JyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTdWNjZXNzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIHZhbHVlR2V0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMuZGF0YT8uZGV2aWNlU3RhdHVzT3ZlcnZpZXc/LnN1Y2Nlc3NDb3VudCB8fCAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGV2aWNlU3RhdHVzT3ZlcnZpZXcuZXJyb3JDb3VudCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRXJyb3JzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIHZhbHVlR2V0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMuZGF0YT8uZGV2aWNlU3RhdHVzT3ZlcnZpZXc/LmVycm9yQ291bnQgfHwgMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3ZlcnNpb24nLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1ZlcnNpb24nLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTAwXG4gICAgICAgIH1cbiAgICBdLCBbXSk7XG4gICAgLy8gQXBwIHByb3RlY3Rpb24gcG9saWN5IGNvbHVtbnNcbiAgICBjb25zdCBhcHBQcm90ZWN0aW9uUG9saWN5Q29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Rpc3BsYXlOYW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdQb2xpY3kgTmFtZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAyNTBcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkZXNjcmlwdGlvbicsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGVzY3JpcHRpb24nLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMzAwXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAncGxhdGZvcm0nLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1BsYXRmb3JtJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEzMFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3BpblJlcXVpcmVkJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdQSU4gUmVxdWlyZWQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTQwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/ICdZZXMnIDogJ05vJ1xuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2RhdGFCYWNrdXBCbG9ja2VkJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdCYWNrdXAgQmxvY2tlZCcsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gJ1llcycgOiAnTm8nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZGV2aWNlQ29tcGxpYW5jZVJlcXVpcmVkJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDb21wbGlhbmNlIFJlcXVpcmVkJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDE4MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiBwYXJhbXMudmFsdWUgPyAnWWVzJyA6ICdObydcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdjcmVhdGVkRGF0ZVRpbWUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0NyZWF0ZWQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTgwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/IG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKSA6ICdOL0EnXG4gICAgICAgIH1cbiAgICBdLCBbXSk7XG4gICAgLy8gRHluYW1pYyBjb2x1bW5zIGJhc2VkIG9uIGFjdGl2ZSB0YWJcbiAgICBjb25zdCBjb2x1bW5zID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoc3RhdGUuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICBjYXNlICdkZXZpY2VzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gZGV2aWNlQ29sdW1ucztcbiAgICAgICAgICAgIGNhc2UgJ2FwcGxpY2F0aW9ucyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwcGxpY2F0aW9uQ29sdW1ucztcbiAgICAgICAgICAgIGNhc2UgJ2NvbmZpZy1wb2xpY2llcyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbmZpZ1BvbGljeUNvbHVtbnM7XG4gICAgICAgICAgICBjYXNlICdjb21wbGlhbmNlLXBvbGljaWVzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gY29tcGxpYW5jZVBvbGljeUNvbHVtbnM7XG4gICAgICAgICAgICBjYXNlICdhcHAtcHJvdGVjdGlvbic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwcFByb3RlY3Rpb25Qb2xpY3lDb2x1bW5zO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9LCBbc3RhdGUuYWN0aXZlVGFiLCBkZXZpY2VDb2x1bW5zLCBhcHBsaWNhdGlvbkNvbHVtbnMsIGNvbmZpZ1BvbGljeUNvbHVtbnMsIGNvbXBsaWFuY2VQb2xpY3lDb2x1bW5zLCBhcHBQcm90ZWN0aW9uUG9saWN5Q29sdW1uc10pO1xuICAgIC8vIEZpbHRlcmVkIGRldmljZXNcbiAgICBjb25zdCBmaWx0ZXJlZERldmljZXMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFzdGF0ZS5yZXN1bHQ/LmRldmljZXMpXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIGxldCBmaWx0ZXJlZCA9IHN0YXRlLnJlc3VsdC5kZXZpY2VzO1xuICAgICAgICBpZiAoc3RhdGUuZmlsdGVyLnNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IHN0YXRlLmZpbHRlci5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihkID0+IGQuZGV2aWNlTmFtZT8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgZC51c2VyUHJpbmNpcGFsTmFtZT8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgZC5tb2RlbD8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdGUuZmlsdGVyLnNlbGVjdGVkUGxhdGZvcm1zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZpbHRlcmVkID0gZmlsdGVyZWQuZmlsdGVyKGQgPT4gc3RhdGUuZmlsdGVyLnNlbGVjdGVkUGxhdGZvcm1zLmluY2x1ZGVzKGQub3BlcmF0aW5nU3lzdGVtKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5zZWxlY3RlZENvbXBsaWFuY2VTdGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIoZCA9PiBzdGF0ZS5maWx0ZXIuc2VsZWN0ZWRDb21wbGlhbmNlU3RhdGVzLmluY2x1ZGVzKGQuY29tcGxpYW5jZVN0YXRlKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5zZWxlY3RlZE1hbmFnZW1lbnRTdGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIoZCA9PiBzdGF0ZS5maWx0ZXIuc2VsZWN0ZWRNYW5hZ2VtZW50U3RhdGVzLmluY2x1ZGVzKGQubWFuYWdlbWVudFN0YXRlKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5zaG93Tm9uQ29tcGxpYW50T25seSkge1xuICAgICAgICAgICAgZmlsdGVyZWQgPSBmaWx0ZXJlZC5maWx0ZXIoZCA9PiBkLmNvbXBsaWFuY2VTdGF0ZSAhPT0gJ2NvbXBsaWFudCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWx0ZXJlZDtcbiAgICB9LCBbc3RhdGUucmVzdWx0Py5kZXZpY2VzLCBzdGF0ZS5maWx0ZXJdKTtcbiAgICAvLyBGaWx0ZXJlZCBhcHBsaWNhdGlvbnNcbiAgICBjb25zdCBmaWx0ZXJlZEFwcGxpY2F0aW9ucyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXN0YXRlLnJlc3VsdD8uYXBwbGljYXRpb25zKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICBsZXQgZmlsdGVyZWQgPSBzdGF0ZS5yZXN1bHQuYXBwbGljYXRpb25zO1xuICAgICAgICBpZiAoc3RhdGUuZmlsdGVyLnNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IHN0YXRlLmZpbHRlci5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihhcHAgPT4gYXBwLmRpc3BsYXlOYW1lPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICBhcHAuZGVzY3JpcHRpb24/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbHRlcmVkO1xuICAgIH0sIFtzdGF0ZS5yZXN1bHQ/LmFwcGxpY2F0aW9ucywgc3RhdGUuZmlsdGVyLnNlYXJjaFRleHRdKTtcbiAgICAvLyBGaWx0ZXJlZCBjb25maWd1cmF0aW9uIHBvbGljaWVzXG4gICAgY29uc3QgZmlsdGVyZWRDb25maWd1cmF0aW9ucyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXN0YXRlLnJlc3VsdD8uY29uZmlndXJhdGlvblBvbGljaWVzKVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICBsZXQgZmlsdGVyZWQgPSBzdGF0ZS5yZXN1bHQuY29uZmlndXJhdGlvblBvbGljaWVzO1xuICAgICAgICBpZiAoc3RhdGUuZmlsdGVyLnNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IHN0YXRlLmZpbHRlci5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBmaWx0ZXJlZCA9IGZpbHRlcmVkLmZpbHRlcihwb2xpY3kgPT4gcG9saWN5LmRpc3BsYXlOYW1lPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgICAgICBwb2xpY3kuZGVzY3JpcHRpb24/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbHRlcmVkO1xuICAgIH0sIFtzdGF0ZS5yZXN1bHQ/LmNvbmZpZ3VyYXRpb25Qb2xpY2llcywgc3RhdGUuZmlsdGVyLnNlYXJjaFRleHRdKTtcbiAgICAvLyBGaWx0ZXJlZCBkYXRhIGJhc2VkIG9uIGFjdGl2ZSB0YWIgYW5kIGZpbHRlcnMgKGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5KVxuICAgIGNvbnN0IGZpbHRlcmVkRGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHN0YXRlLmFjdGl2ZVRhYikge1xuICAgICAgICAgICAgY2FzZSAnZGV2aWNlcyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcmVkRGV2aWNlcztcbiAgICAgICAgICAgIGNhc2UgJ2FwcGxpY2F0aW9ucyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcmVkQXBwbGljYXRpb25zO1xuICAgICAgICAgICAgY2FzZSAnY29uZmlnLXBvbGljaWVzJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyZWRDb25maWd1cmF0aW9ucztcbiAgICAgICAgICAgIGNhc2UgJ2NvbXBsaWFuY2UtcG9saWNpZXMnOlxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZS5yZXN1bHQ/LmNvbXBsaWFuY2VQb2xpY2llcz8uZmlsdGVyKHBvbGljeSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RhdGUuZmlsdGVyLnNlYXJjaFRleHQpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoID0gc3RhdGUuZmlsdGVyLnNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBvbGljeS5kaXNwbGF5TmFtZT8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBwb2xpY3kuZGVzY3JpcHRpb24/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKTtcbiAgICAgICAgICAgICAgICB9KSB8fCBbXTtcbiAgICAgICAgICAgIGNhc2UgJ2FwcC1wcm90ZWN0aW9uJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGUucmVzdWx0Py5hcHBQcm90ZWN0aW9uUG9saWNpZXM/LmZpbHRlcihwb2xpY3kgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXN0YXRlLmZpbHRlci5zZWFyY2hUZXh0KVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaCA9IHN0YXRlLmZpbHRlci5zZWFyY2hUZXh0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwb2xpY3kuZGlzcGxheU5hbWU/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9saWN5LmRlc2NyaXB0aW9uPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCk7XG4gICAgICAgICAgICAgICAgfSkgfHwgW107XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5yZXN1bHQsIHN0YXRlLmFjdGl2ZVRhYiwgc3RhdGUuZmlsdGVyLnNlYXJjaFRleHQsIGZpbHRlcmVkRGV2aWNlcywgZmlsdGVyZWRBcHBsaWNhdGlvbnMsIGZpbHRlcmVkQ29uZmlndXJhdGlvbnNdKTtcbiAgICAvLyBTdGF0aXN0aWNzXG4gICAgY29uc3Qgc3RhdHMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFzdGF0ZS5yZXN1bHQpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgZGV2aWNlcyA9IHN0YXRlLnJlc3VsdC5kZXZpY2VzIHx8IFtdO1xuICAgICAgICBjb25zdCBkZXZpY2VzQnlQbGF0Zm9ybSA9IHt9O1xuICAgICAgICBjb25zdCBkZXZpY2VzQnlDb21wbGlhbmNlU3RhdGUgPSB7fTtcbiAgICAgICAgY29uc3QgZGV2aWNlTW9kZWxDb3VudHMgPSB7fTtcbiAgICAgICAgY29uc3Qgbm9uQ29tcGxpYW5jZVJlYXNvbkNvdW50cyA9IHt9O1xuICAgICAgICBkZXZpY2VzLmZvckVhY2goZGV2aWNlID0+IHtcbiAgICAgICAgICAgIC8vIFBsYXRmb3JtIGJyZWFrZG93blxuICAgICAgICAgICAgY29uc3QgcGxhdGZvcm0gPSBkZXZpY2Uub3BlcmF0aW5nU3lzdGVtIHx8ICdVbmtub3duJztcbiAgICAgICAgICAgIGRldmljZXNCeVBsYXRmb3JtW3BsYXRmb3JtXSA9IChkZXZpY2VzQnlQbGF0Zm9ybVtwbGF0Zm9ybV0gfHwgMCkgKyAxO1xuICAgICAgICAgICAgLy8gQ29tcGxpYW5jZSBzdGF0ZSBicmVha2Rvd25cbiAgICAgICAgICAgIGNvbnN0IGNvbXBsaWFuY2VTdGF0ZSA9IGRldmljZS5jb21wbGlhbmNlU3RhdGUgfHwgJ1Vua25vd24nO1xuICAgICAgICAgICAgZGV2aWNlc0J5Q29tcGxpYW5jZVN0YXRlW2NvbXBsaWFuY2VTdGF0ZV0gPSAoZGV2aWNlc0J5Q29tcGxpYW5jZVN0YXRlW2NvbXBsaWFuY2VTdGF0ZV0gfHwgMCkgKyAxO1xuICAgICAgICAgICAgLy8gRGV2aWNlIG1vZGVsIGNvdW50c1xuICAgICAgICAgICAgaWYgKGRldmljZS5tb2RlbCkge1xuICAgICAgICAgICAgICAgIGRldmljZU1vZGVsQ291bnRzW2RldmljZS5tb2RlbF0gPSAoZGV2aWNlTW9kZWxDb3VudHNbZGV2aWNlLm1vZGVsXSB8fCAwKSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBOb24tY29tcGxpYW5jZSByZWFzb25zXG4gICAgICAgICAgICBpZiAoZGV2aWNlLmNvbXBsaWFuY2VTdGF0ZSAhPT0gJ2NvbXBsaWFudCcgJiYgZGV2aWNlLmNvbXBsaWFuY2VHcmFjZVBlcmlvZEV4cGlyYXRpb25EYXRlVGltZSkge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgc2ltcGxpZmllZCAtIGluIHJlYWwgaW1wbGVtZW50YXRpb24sIHBhcnNlIGFjdHVhbCBub24tY29tcGxpYW5jZSBkZXRhaWxzXG4gICAgICAgICAgICAgICAgY29uc3QgcmVhc29uID0gJ0NvbXBsaWFuY2UgZ3JhY2UgcGVyaW9kIGV4cGlyZWQnO1xuICAgICAgICAgICAgICAgIG5vbkNvbXBsaWFuY2VSZWFzb25Db3VudHNbcmVhc29uXSA9IChub25Db21wbGlhbmNlUmVhc29uQ291bnRzW3JlYXNvbl0gfHwgMCkgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdG9wRGV2aWNlTW9kZWxzID0gT2JqZWN0LmVudHJpZXMoZGV2aWNlTW9kZWxDb3VudHMpXG4gICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gYlsxXSAtIGFbMV0pXG4gICAgICAgICAgICAuc2xpY2UoMCwgNSlcbiAgICAgICAgICAgIC5tYXAoKFttb2RlbCwgY291bnRdKSA9PiAoeyBtb2RlbCwgY291bnQgfSkpO1xuICAgICAgICBjb25zdCB0b3BOb25Db21wbGlhbmNlUmVhc29ucyA9IE9iamVjdC5lbnRyaWVzKG5vbkNvbXBsaWFuY2VSZWFzb25Db3VudHMpXG4gICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gYlsxXSAtIGFbMV0pXG4gICAgICAgICAgICAuc2xpY2UoMCwgNSlcbiAgICAgICAgICAgIC5tYXAoKFtyZWFzb24sIGNvdW50XSkgPT4gKHsgcmVhc29uLCBjb3VudCB9KSk7XG4gICAgICAgIGNvbnN0IGNvbXBsaWFudERldmljZXMgPSBkZXZpY2VzQnlDb21wbGlhbmNlU3RhdGVbJ2NvbXBsaWFudCddIHx8IDA7XG4gICAgICAgIGNvbnN0IHRvdGFsRGV2aWNlcyA9IGRldmljZXMubGVuZ3RoO1xuICAgICAgICBjb25zdCBjb21wbGlhbmNlUmF0ZSA9IHRvdGFsRGV2aWNlcyA+IDAgPyAoY29tcGxpYW50RGV2aWNlcyAvIHRvdGFsRGV2aWNlcykgKiAxMDAgOiAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG90YWxEZXZpY2VzLFxuICAgICAgICAgICAgY29tcGxpYW50RGV2aWNlcyxcbiAgICAgICAgICAgIG5vbkNvbXBsaWFudERldmljZXM6IHRvdGFsRGV2aWNlcyAtIGNvbXBsaWFudERldmljZXMsXG4gICAgICAgICAgICBkZXZpY2VzQnlQbGF0Zm9ybSxcbiAgICAgICAgICAgIGRldmljZXNCeUNvbXBsaWFuY2VTdGF0ZSxcbiAgICAgICAgICAgIHRvdGFsQXBwbGljYXRpb25zOiBzdGF0ZS5yZXN1bHQudG90YWxBcHBsaWNhdGlvbnNGb3VuZCB8fCAwLFxuICAgICAgICAgICAgdG90YWxDb25maWdQb2xpY2llczogc3RhdGUucmVzdWx0LnRvdGFsQ29uZmlnUG9saWNpZXNGb3VuZCB8fCAwLFxuICAgICAgICAgICAgdG90YWxDb21wbGlhbmNlUG9saWNpZXM6IHN0YXRlLnJlc3VsdC50b3RhbENvbXBsaWFuY2VQb2xpY2llc0ZvdW5kIHx8IDAsXG4gICAgICAgICAgICB0b3RhbEFwcFByb3RlY3Rpb25Qb2xpY2llczogc3RhdGUucmVzdWx0LnRvdGFsQXBwUHJvdGVjdGlvblBvbGljaWVzRm91bmQgfHwgMCxcbiAgICAgICAgICAgIHRvdGFsUG9saWNpZXM6IChzdGF0ZS5yZXN1bHQudG90YWxDb25maWdQb2xpY2llc0ZvdW5kIHx8IDApICsgKHN0YXRlLnJlc3VsdC50b3RhbENvbXBsaWFuY2VQb2xpY2llc0ZvdW5kIHx8IDApICsgKHN0YXRlLnJlc3VsdC50b3RhbEFwcFByb3RlY3Rpb25Qb2xpY2llc0ZvdW5kIHx8IDApLFxuICAgICAgICAgICAgdG90YWxDb25maWd1cmF0aW9uczogc3RhdGUucmVzdWx0LnRvdGFsQ29uZmlnUG9saWNpZXNGb3VuZCB8fCAwLFxuICAgICAgICAgICAgY29tcGxpYW5jZVJhdGUsXG4gICAgICAgICAgICB0b3BEZXZpY2VNb2RlbHMsXG4gICAgICAgICAgICB0b3BOb25Db21wbGlhbmNlUmVhc29uc1xuICAgICAgICB9O1xuICAgIH0sIFtzdGF0ZS5yZXN1bHRdKTtcbiAgICAvLyBDU1YgRXhwb3J0IHdpdGggYWR2YW5jZWQgZmxhdHRlbmluZ1xuICAgIGNvbnN0IGV4cG9ydFRvQ1NWID0gdXNlQ2FsbGJhY2soKGRhdGEsIGZpbGVuYW1lKSA9PiB7XG4gICAgICAgIGlmIChkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgYWxlcnQoJ05vIGRhdGEgdG8gZXhwb3J0Jyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmxhdHRlbk9iamVjdCA9IChvYmosIHByZWZpeCA9ICcnKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmbGF0dGVuZWQgPSB7fTtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gb2JqW2tleV07XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3S2V5ID0gcHJlZml4ID8gYCR7cHJlZml4fS4ke2tleX1gIDoga2V5O1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGZsYXR0ZW5lZFtuZXdLZXldID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBmbGF0dGVuZWRbbmV3S2V5XSA9IHZhbHVlLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZsYXR0ZW5lZFtuZXdLZXldID0gdmFsdWUubWFwKHYgPT4gdHlwZW9mIHYgPT09ICdvYmplY3QnID8gSlNPTi5zdHJpbmdpZnkodikgOiB2KS5qb2luKCc7ICcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZmxhdHRlbmVkLCBmbGF0dGVuT2JqZWN0KHZhbHVlLCBuZXdLZXkpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZsYXR0ZW5lZFtuZXdLZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmxhdHRlbmVkO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBmbGF0dGVuZWREYXRhID0gKGRhdGEgPz8gW10pLm1hcChpdGVtID0+IGZsYXR0ZW5PYmplY3QoaXRlbSkpO1xuICAgICAgICBjb25zdCBoZWFkZXJzID0gT2JqZWN0LmtleXMoZmxhdHRlbmVkRGF0YVswXSk7XG4gICAgICAgIGNvbnN0IGNzdkNvbnRlbnQgPSBbXG4gICAgICAgICAgICBoZWFkZXJzLmpvaW4oJywnKSxcbiAgICAgICAgICAgIC4uLmZsYXR0ZW5lZERhdGEubWFwKHJvdyA9PiBoZWFkZXJzLm1hcChoZWFkZXIgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gcm93W2hlYWRlcl07XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RyaW5nVmFsdWUgPSB2YWx1ZT8udG9TdHJpbmcoKSB8fCAnJztcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5nVmFsdWUuaW5jbHVkZXMoJywnKSB8fCBzdHJpbmdWYWx1ZS5pbmNsdWRlcygnXCInKVxuICAgICAgICAgICAgICAgICAgICA/IGBcIiR7c3RyaW5nVmFsdWUucmVwbGFjZSgvXCIvZywgJ1wiXCInKX1cImBcbiAgICAgICAgICAgICAgICAgICAgOiBzdHJpbmdWYWx1ZTtcbiAgICAgICAgICAgIH0pLmpvaW4oJywnKSlcbiAgICAgICAgXS5qb2luKCdcXG4nKTtcbiAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtjc3ZDb250ZW50XSwgeyB0eXBlOiAndGV4dC9jc3Y7Y2hhcnNldD11dGYtODsnIH0pO1xuICAgICAgICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBsaW5rLmhyZWYgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICBsaW5rLmRvd25sb2FkID0gZmlsZW5hbWU7XG4gICAgICAgIGxpbmsuY2xpY2soKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gRXhjZWwgRXhwb3J0XG4gICAgY29uc3QgZXhwb3J0VG9FeGNlbCA9IHVzZUNhbGxiYWNrKGFzeW5jIChkYXRhLCBmaWxlbmFtZSkgPT4ge1xuICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGFsZXJ0KCdObyBkYXRhIHRvIGV4cG9ydCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvRXhwb3J0L0V4cG9ydFRvRXhjZWwucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnRXhwb3J0LUludHVuZURhdGEnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgRGF0YTogZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgU2hlZXROYW1lOiBzdGF0ZS5hY3RpdmVUYWIsXG4gICAgICAgICAgICAgICAgICAgIEZpbGVOYW1lOiBmaWxlbmFtZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXhjZWwgZXhwb3J0IGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgICAgICBhbGVydCgnRXhjZWwgZXhwb3J0IGZhaWxlZDogJyArIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfSwgW3N0YXRlLmFjdGl2ZVRhYl0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIC8vIFN0YXRlXG4gICAgICAgIGNvbmZpZzogc3RhdGUuY29uZmlnLFxuICAgICAgICByZXN1bHQ6IHN0YXRlLnJlc3VsdCxcbiAgICAgICAgaXNEaXNjb3ZlcmluZzogc3RhdGUuaXNEaXNjb3ZlcmluZyxcbiAgICAgICAgcHJvZ3Jlc3M6IHN0YXRlLnByb2dyZXNzLFxuICAgICAgICBhY3RpdmVUYWI6IHN0YXRlLmFjdGl2ZVRhYixcbiAgICAgICAgZmlsdGVyOiBzdGF0ZS5maWx0ZXIsXG4gICAgICAgIGVycm9yOiBzdGF0ZS5lcnJvcixcbiAgICAgICAgLy8gRGF0YVxuICAgICAgICBjb2x1bW5zLFxuICAgICAgICBmaWx0ZXJlZERhdGEsXG4gICAgICAgIGZpbHRlcmVkRGV2aWNlcyxcbiAgICAgICAgZmlsdGVyZWRBcHBsaWNhdGlvbnMsXG4gICAgICAgIGZpbHRlcmVkQ29uZmlndXJhdGlvbnMsXG4gICAgICAgIHN0YXRzLFxuICAgICAgICAvLyBDb2x1bW4gZGVmaW5pdGlvbnNcbiAgICAgICAgZGV2aWNlQ29sdW1ucyxcbiAgICAgICAgcG9saWN5Q29sdW1uczogY29uZmlnUG9saWN5Q29sdW1ucyxcbiAgICAgICAgYXBwbGljYXRpb25Db2x1bW5zLFxuICAgICAgICBjb25maWd1cmF0aW9uQ29sdW1uczogY29tcGxpYW5jZVBvbGljeUNvbHVtbnMsXG4gICAgICAgIC8vIEFjdGlvbnNcbiAgICAgICAgc3RhcnREaXNjb3ZlcnksXG4gICAgICAgIGNhbmNlbERpc2NvdmVyeSxcbiAgICAgICAgdXBkYXRlQ29uZmlnLFxuICAgICAgICBzZXRBY3RpdmVUYWIsXG4gICAgICAgIHVwZGF0ZUZpbHRlcixcbiAgICAgICAgY2xlYXJFcnJvcixcbiAgICAgICAgZXhwb3J0VG9DU1YsXG4gICAgICAgIGV4cG9ydFRvRXhjZWxcbiAgICB9O1xufTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==