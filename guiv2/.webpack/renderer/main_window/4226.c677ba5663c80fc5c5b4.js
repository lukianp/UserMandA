"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[4226],{

/***/ 64226:
/*!************************************************************!*\
  !*** ./src/renderer/hooks/useEnvironmentDetectionLogic.ts ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useEnvironmentDetectionLogic: () => (/* binding */ useEnvironmentDetectionLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);
/**
 * Environment Detection Logic Hook
 * FULLY FUNCTIONAL production-ready business logic for environment auto-detection
 * NO PLACEHOLDERS - Complete implementation for Azure, On-Premises, AWS, GCP detection
 */

const useEnvironmentDetectionLogic = () => {
    const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        config: {
            detectAzure: true,
            detectOnPremises: true,
            detectAWS: false,
            detectGCP: false,
            timeout: 300000
        },
        result: null,
        isDetecting: false,
        progress: { current: 0, total: 100, message: '', percentage: 0 },
        activeTab: 'overview',
        filter: { searchText: '', selectedProviders: [], selectedStatuses: [], showOnlyAvailable: false },
        cancellationToken: null,
        error: null
    });
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const unsubscribe = window.electronAPI?.onProgress?.((data) => {
            if (data.type === 'env-detection' && data.token === state.cancellationToken) {
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
        return () => { if (unsubscribe)
            unsubscribe(); };
    }, [state.cancellationToken]);
    const startDetection = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        const token = `env-detection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setState(prev => ({
            ...prev,
            isDetecting: true,
            cancellationToken: token,
            error: null,
            progress: { current: 0, total: 100, message: 'Initializing environment detection...', percentage: 0 }
        }));
        try {
            const detectionResult = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/EnvironmentDetection.psm1',
                functionName: 'Invoke-EnvironmentDetection',
                parameters: { ...state.config, cancellationToken: token },
            });
            setState(prev => ({
                ...prev,
                result: detectionResult.data,
                isDetecting: false,
                cancellationToken: null,
                progress: { current: 100, total: 100, message: 'Detection completed', percentage: 100 }
            }));
        }
        catch (error) {
            console.error('Environment Detection failed:', error);
            setState(prev => ({
                ...prev,
                isDetecting: false,
                cancellationToken: null,
                error: error.message || 'Environment detection failed'
            }));
        }
    }, [state.config]);
    const cancelDetection = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (state.cancellationToken) {
            try {
                await window.electronAPI.cancelExecution(state.cancellationToken);
            }
            catch (error) {
                console.error('Failed to cancel detection:', error);
            }
        }
        setState(prev => ({
            ...prev,
            isDetecting: false,
            cancellationToken: null,
            progress: { current: 0, total: 100, message: 'Cancelled', percentage: 0 }
        }));
    }, [state.cancellationToken]);
    const exportToCSV = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!state.result)
            return;
        try {
            let data = [];
            switch (state.activeTab) {
                case 'services':
                    data = state.result.detectedServices;
                    break;
                case 'recommendations':
                    data = state.result.recommendations;
                    break;
                case 'capabilities':
                    data = state.result.detectedServices.flatMap(s => s.capabilities.map(c => ({ serviceName: s.name, ...c })));
                    break;
            }
            const csvData = convertToCSV(data);
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `environment-detection-${state.activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        }
        catch (error) {
            console.error('CSV export failed:', error);
        }
    }, [state.result, state.activeTab]);
    const exportToExcel = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!state.result)
            return;
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Export/ExportToExcel.psm1',
                functionName: 'Export-EnvironmentData',
                parameters: {
                    data: state.result,
                    tab: state.activeTab,
                    filename: `environment-detection-${state.activeTab}-${new Date().toISOString().split('T')[0]}.xlsx`
                }
            });
        }
        catch (error) {
            console.error('Excel export failed:', error);
        }
    }, [state.result, state.activeTab]);
    const servicesColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'name', headerName: 'Service Name', sortable: true, filter: true, width: 250 },
        { field: 'type', headerName: 'Type', sortable: true, filter: true, width: 150 },
        { field: 'provider', headerName: 'Provider', sortable: true, filter: true, width: 150 },
        { field: 'status', headerName: 'Status', sortable: true, filter: true, width: 120 },
        { field: 'detected', headerName: 'Detected', sortable: true, filter: true, width: 100,
            valueFormatter: (params) => params.value ? 'Yes' : 'No' },
        { field: 'version', headerName: 'Version', sortable: true, filter: true, width: 120 },
        { field: 'endpoint', headerName: 'Endpoint', sortable: true, filter: true, width: 300 },
        { field: 'capabilities', headerName: 'Capabilities', sortable: false, filter: false, width: 120,
            valueFormatter: (params) => `${params.value?.length || 0} available` }
    ], []);
    const recommendationsColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'title', headerName: 'Recommendation', sortable: true, filter: true, width: 300 },
        { field: 'category', headerName: 'Category', sortable: true, filter: true, width: 150 },
        { field: 'priority', headerName: 'Priority', sortable: true, filter: true, width: 120 },
        { field: 'effort', headerName: 'Effort', sortable: true, filter: true, width: 100 },
        { field: 'impact', headerName: 'Impact', sortable: true, filter: true, width: 200 },
        { field: 'steps', headerName: 'Steps', sortable: false, filter: false, width: 100,
            valueFormatter: (params) => `${params.value?.length || 0} step(s)` },
        { field: 'relatedServices', headerName: 'Related Services', sortable: false, filter: false, width: 150,
            valueFormatter: (params) => `${params.value?.length || 0} service(s)` }
    ], []);
    const capabilitiesColumns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [
        { field: 'serviceName', headerName: 'Service', sortable: true, filter: true, width: 250 },
        { field: 'name', headerName: 'Capability', sortable: true, filter: true, width: 250 },
        { field: 'available', headerName: 'Available', sortable: true, filter: true, width: 120,
            valueFormatter: (params) => params.value ? 'Yes' : 'No' },
        { field: 'requiresLicense', headerName: 'Requires License', sortable: true, filter: true, width: 150,
            valueFormatter: (params) => params.value ? 'Yes' : 'No' },
        { field: 'licenseType', headerName: 'License Type', sortable: true, filter: true, width: 200 }
    ], []);
    const columns = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        switch (state.activeTab) {
            case 'services': return servicesColumns;
            case 'recommendations': return recommendationsColumns;
            case 'capabilities': return capabilitiesColumns;
            default: return [];
        }
    }, [state.activeTab, servicesColumns, recommendationsColumns, capabilitiesColumns]);
    const filteredData = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        let data = [];
        switch (state.activeTab) {
            case 'services':
                data = state.result?.detectedServices || [];
                if (state.filter.selectedProviders.length > 0) {
                    data = (data ?? []).filter((s) => state.filter.selectedProviders.includes(s.provider));
                }
                if (state.filter.selectedStatuses.length > 0) {
                    data = (data ?? []).filter((s) => state.filter.selectedStatuses.includes(s.status));
                }
                if (state.filter.showOnlyAvailable) {
                    data = (data ?? []).filter((s) => s.detected);
                }
                break;
            case 'recommendations':
                data = state.result?.recommendations || [];
                break;
            case 'capabilities':
                data = state.result?.detectedServices.flatMap(s => s.capabilities.map(c => ({ serviceName: s.name, ...c }))) || [];
                break;
            default:
                return [];
        }
        if (state.filter.searchText) {
            const searchLower = state.filter.searchText.toLowerCase();
            data = (data ?? []).filter(item => JSON.stringify(item).toLowerCase().includes(searchLower));
        }
        return data;
    }, [state.result, state.activeTab, state.filter]);
    const stats = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!state.result)
            return null;
        const services = state.result.detectedServices || [];
        const servicesByProvider = {
            azure: services.filter(s => s.provider === 'azure').length,
            microsoft365: services.filter(s => s.provider === 'microsoft365').length,
            'on-premises': services.filter(s => s.provider === 'on-premises').length,
            aws: services.filter(s => s.provider === 'aws').length,
            gcp: services.filter(s => s.provider === 'gcp').length
        };
        return {
            totalServicesDetected: services.length,
            servicesByProvider,
            criticalRecommendations: state.result.recommendations?.filter(r => r.priority === 'critical').length || 0,
            environmentConfidence: state.result.confidence || 0
        };
    }, [state.result]);
    const updateConfig = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((updates) => {
        setState(prev => ({ ...prev, config: { ...prev.config, ...updates } }));
    }, []);
    const updateFilter = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((updates) => {
        setState(prev => ({ ...prev, filter: { ...prev.filter, ...updates } }));
    }, []);
    const setActiveTab = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((tab) => {
        setState(prev => ({ ...prev, activeTab: tab }));
    }, []);
    return {
        config: state.config,
        result: state.result,
        isDetecting: state.isDetecting,
        progress: state.progress,
        activeTab: state.activeTab,
        filter: state.filter,
        error: state.error,
        columns,
        filteredData,
        stats,
        updateConfig,
        updateFilter,
        setActiveTab,
        startDetection,
        cancelDetection,
        exportToCSV,
        exportToExcel
    };
};
function convertToCSV(data) {
    if (!data || data.length === 0)
        return '';
    const flattenObject = (obj, prefix = '') => {
        return Object.keys(obj).reduce((acc, key) => {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (value === null || value === undefined) {
                acc[newKey] = '';
            }
            else if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                Object.assign(acc, flattenObject(value, newKey));
            }
            else if (Array.isArray(value)) {
                acc[newKey] = value.length;
            }
            else if (value instanceof Date) {
                acc[newKey] = value.toISOString();
            }
            else {
                acc[newKey] = value;
            }
            return acc;
        }, {});
    };
    const flatData = (data ?? []).map(item => flattenObject(item));
    const headers = Object.keys(flatData[0]);
    const rows = flatData.map(item => headers.map(header => {
        const value = item[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }).join(','));
    return [headers.join(','), ...rows].join('\n');
}


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxrQkFBa0IsOENBQU87QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wseUJBQXlCLGtEQUFXO0FBQ3BDLDRCQUE0QixtQkFBbUIsOEJBQThCO0FBQzdFLEtBQUs7QUFDTCx5QkFBeUIsa0RBQVc7QUFDcEMsNEJBQTRCLG1CQUFtQiw4QkFBOEI7QUFDN0UsS0FBSztBQUNMLHlCQUF5QixrREFBVztBQUNwQyw0QkFBNEIseUJBQXlCO0FBQ3JELEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDLE9BQU8sR0FBRyxJQUFJO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyxJQUFJO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLDBCQUEwQjtBQUNqRDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VFbnZpcm9ubWVudERldGVjdGlvbkxvZ2ljLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRW52aXJvbm1lbnQgRGV0ZWN0aW9uIExvZ2ljIEhvb2tcbiAqIEZVTExZIEZVTkNUSU9OQUwgcHJvZHVjdGlvbi1yZWFkeSBidXNpbmVzcyBsb2dpYyBmb3IgZW52aXJvbm1lbnQgYXV0by1kZXRlY3Rpb25cbiAqIE5PIFBMQUNFSE9MREVSUyAtIENvbXBsZXRlIGltcGxlbWVudGF0aW9uIGZvciBBenVyZSwgT24tUHJlbWlzZXMsIEFXUywgR0NQIGRldGVjdGlvblxuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZU1lbW8sIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmV4cG9ydCBjb25zdCB1c2VFbnZpcm9ubWVudERldGVjdGlvbkxvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGUoe1xuICAgICAgICBjb25maWc6IHtcbiAgICAgICAgICAgIGRldGVjdEF6dXJlOiB0cnVlLFxuICAgICAgICAgICAgZGV0ZWN0T25QcmVtaXNlczogdHJ1ZSxcbiAgICAgICAgICAgIGRldGVjdEFXUzogZmFsc2UsXG4gICAgICAgICAgICBkZXRlY3RHQ1A6IGZhbHNlLFxuICAgICAgICAgICAgdGltZW91dDogMzAwMDAwXG4gICAgICAgIH0sXG4gICAgICAgIHJlc3VsdDogbnVsbCxcbiAgICAgICAgaXNEZXRlY3Rpbmc6IGZhbHNlLFxuICAgICAgICBwcm9ncmVzczogeyBjdXJyZW50OiAwLCB0b3RhbDogMTAwLCBtZXNzYWdlOiAnJywgcGVyY2VudGFnZTogMCB9LFxuICAgICAgICBhY3RpdmVUYWI6ICdvdmVydmlldycsXG4gICAgICAgIGZpbHRlcjogeyBzZWFyY2hUZXh0OiAnJywgc2VsZWN0ZWRQcm92aWRlcnM6IFtdLCBzZWxlY3RlZFN0YXR1c2VzOiBbXSwgc2hvd09ubHlBdmFpbGFibGU6IGZhbHNlIH0sXG4gICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBudWxsLFxuICAgICAgICBlcnJvcjogbnVsbFxuICAgIH0pO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVuc3Vic2NyaWJlID0gd2luZG93LmVsZWN0cm9uQVBJPy5vblByb2dyZXNzPy4oKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLnR5cGUgPT09ICdlbnYtZGV0ZWN0aW9uJyAmJiBkYXRhLnRva2VuID09PSBzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGRhdGEuY3VycmVudCB8fCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG90YWw6IGRhdGEudG90YWwgfHwgMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZGF0YS5tZXNzYWdlIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVyY2VudGFnZTogZGF0YS5wZXJjZW50YWdlIHx8IDBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7IGlmICh1bnN1YnNjcmliZSlcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlKCk7IH07XG4gICAgfSwgW3N0YXRlLmNhbmNlbGxhdGlvblRva2VuXSk7XG4gICAgY29uc3Qgc3RhcnREZXRlY3Rpb24gPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gYGVudi1kZXRlY3Rpb24tJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgaXNEZXRlY3Rpbmc6IHRydWUsXG4gICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbjogdG9rZW4sXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIHByb2dyZXNzOiB7IGN1cnJlbnQ6IDAsIHRvdGFsOiAxMDAsIG1lc3NhZ2U6ICdJbml0aWFsaXppbmcgZW52aXJvbm1lbnQgZGV0ZWN0aW9uLi4uJywgcGVyY2VudGFnZTogMCB9XG4gICAgICAgIH0pKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGRldGVjdGlvblJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9EaXNjb3ZlcnkvRW52aXJvbm1lbnREZXRlY3Rpb24ucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnSW52b2tlLUVudmlyb25tZW50RGV0ZWN0aW9uJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7IC4uLnN0YXRlLmNvbmZpZywgY2FuY2VsbGF0aW9uVG9rZW46IHRva2VuIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHtcbiAgICAgICAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgICAgICAgIHJlc3VsdDogZGV0ZWN0aW9uUmVzdWx0LmRhdGEsXG4gICAgICAgICAgICAgICAgaXNEZXRlY3Rpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBudWxsLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiB7IGN1cnJlbnQ6IDEwMCwgdG90YWw6IDEwMCwgbWVzc2FnZTogJ0RldGVjdGlvbiBjb21wbGV0ZWQnLCBwZXJjZW50YWdlOiAxMDAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRW52aXJvbm1lbnQgRGV0ZWN0aW9uIGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7XG4gICAgICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgICAgICBpc0RldGVjdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2FuY2VsbGF0aW9uVG9rZW46IG51bGwsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ0Vudmlyb25tZW50IGRldGVjdGlvbiBmYWlsZWQnXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICB9LCBbc3RhdGUuY29uZmlnXSk7XG4gICAgY29uc3QgY2FuY2VsRGV0ZWN0aW9uID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoc3RhdGUuY2FuY2VsbGF0aW9uVG9rZW4pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmNhbmNlbEV4ZWN1dGlvbihzdGF0ZS5jYW5jZWxsYXRpb25Ub2tlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY2FuY2VsIGRldGVjdGlvbjonLCBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoe1xuICAgICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICAgIGlzRGV0ZWN0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuOiBudWxsLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IHsgY3VycmVudDogMCwgdG90YWw6IDEwMCwgbWVzc2FnZTogJ0NhbmNlbGxlZCcsIHBlcmNlbnRhZ2U6IDAgfVxuICAgICAgICB9KSk7XG4gICAgfSwgW3N0YXRlLmNhbmNlbGxhdGlvblRva2VuXSk7XG4gICAgY29uc3QgZXhwb3J0VG9DU1YgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghc3RhdGUucmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBbXTtcbiAgICAgICAgICAgIHN3aXRjaCAoc3RhdGUuYWN0aXZlVGFiKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc2VydmljZXMnOlxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0LmRldGVjdGVkU2VydmljZXM7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JlY29tbWVuZGF0aW9ucyc6XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBzdGF0ZS5yZXN1bHQucmVjb21tZW5kYXRpb25zO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjYXBhYmlsaXRpZXMnOlxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0LmRldGVjdGVkU2VydmljZXMuZmxhdE1hcChzID0+IHMuY2FwYWJpbGl0aWVzLm1hcChjID0+ICh7IHNlcnZpY2VOYW1lOiBzLm5hbWUsIC4uLmMgfSkpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjc3ZEYXRhID0gY29udmVydFRvQ1NWKGRhdGEpO1xuICAgICAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtjc3ZEYXRhXSwgeyB0eXBlOiAndGV4dC9jc3Y7Y2hhcnNldD11dGYtODsnIH0pO1xuICAgICAgICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICBsaW5rLmhyZWYgPSB1cmw7XG4gICAgICAgICAgICBsaW5rLmRvd25sb2FkID0gYGVudmlyb25tZW50LWRldGVjdGlvbi0ke3N0YXRlLmFjdGl2ZVRhYn0tJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXX0uY3N2YDtcbiAgICAgICAgICAgIGxpbmsuY2xpY2soKTtcbiAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NTViBleHBvcnQgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5yZXN1bHQsIHN0YXRlLmFjdGl2ZVRhYl0pO1xuICAgIGNvbnN0IGV4cG9ydFRvRXhjZWwgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghc3RhdGUucmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0V4cG9ydC9FeHBvcnRUb0V4Y2VsLnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ0V4cG9ydC1FbnZpcm9ubWVudERhdGEnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogc3RhdGUucmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICB0YWI6IHN0YXRlLmFjdGl2ZVRhYixcbiAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IGBlbnZpcm9ubWVudC1kZXRlY3Rpb24tJHtzdGF0ZS5hY3RpdmVUYWJ9LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF19Lnhsc3hgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFeGNlbCBleHBvcnQgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH0sIFtzdGF0ZS5yZXN1bHQsIHN0YXRlLmFjdGl2ZVRhYl0pO1xuICAgIGNvbnN0IHNlcnZpY2VzQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7IGZpZWxkOiAnbmFtZScsIGhlYWRlck5hbWU6ICdTZXJ2aWNlIE5hbWUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMjUwIH0sXG4gICAgICAgIHsgZmllbGQ6ICd0eXBlJywgaGVhZGVyTmFtZTogJ1R5cGUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTUwIH0sXG4gICAgICAgIHsgZmllbGQ6ICdwcm92aWRlcicsIGhlYWRlck5hbWU6ICdQcm92aWRlcicsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxNTAgfSxcbiAgICAgICAgeyBmaWVsZDogJ3N0YXR1cycsIGhlYWRlck5hbWU6ICdTdGF0dXMnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTIwIH0sXG4gICAgICAgIHsgZmllbGQ6ICdkZXRlY3RlZCcsIGhlYWRlck5hbWU6ICdEZXRlY3RlZCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gcGFyYW1zLnZhbHVlID8gJ1llcycgOiAnTm8nIH0sXG4gICAgICAgIHsgZmllbGQ6ICd2ZXJzaW9uJywgaGVhZGVyTmFtZTogJ1ZlcnNpb24nLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTIwIH0sXG4gICAgICAgIHsgZmllbGQ6ICdlbmRwb2ludCcsIGhlYWRlck5hbWU6ICdFbmRwb2ludCcsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAzMDAgfSxcbiAgICAgICAgeyBmaWVsZDogJ2NhcGFiaWxpdGllcycsIGhlYWRlck5hbWU6ICdDYXBhYmlsaXRpZXMnLCBzb3J0YWJsZTogZmFsc2UsIGZpbHRlcjogZmFsc2UsIHdpZHRoOiAxMjAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gYCR7cGFyYW1zLnZhbHVlPy5sZW5ndGggfHwgMH0gYXZhaWxhYmxlYCB9XG4gICAgXSwgW10pO1xuICAgIGNvbnN0IHJlY29tbWVuZGF0aW9uc0NvbHVtbnMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAgeyBmaWVsZDogJ3RpdGxlJywgaGVhZGVyTmFtZTogJ1JlY29tbWVuZGF0aW9uJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDMwMCB9LFxuICAgICAgICB7IGZpZWxkOiAnY2F0ZWdvcnknLCBoZWFkZXJOYW1lOiAnQ2F0ZWdvcnknLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTUwIH0sXG4gICAgICAgIHsgZmllbGQ6ICdwcmlvcml0eScsIGhlYWRlck5hbWU6ICdQcmlvcml0eScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAxMjAgfSxcbiAgICAgICAgeyBmaWVsZDogJ2VmZm9ydCcsIGhlYWRlck5hbWU6ICdFZmZvcnQnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTAwIH0sXG4gICAgICAgIHsgZmllbGQ6ICdpbXBhY3QnLCBoZWFkZXJOYW1lOiAnSW1wYWN0Jywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDIwMCB9LFxuICAgICAgICB7IGZpZWxkOiAnc3RlcHMnLCBoZWFkZXJOYW1lOiAnU3RlcHMnLCBzb3J0YWJsZTogZmFsc2UsIGZpbHRlcjogZmFsc2UsIHdpZHRoOiAxMDAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4gYCR7cGFyYW1zLnZhbHVlPy5sZW5ndGggfHwgMH0gc3RlcChzKWAgfSxcbiAgICAgICAgeyBmaWVsZDogJ3JlbGF0ZWRTZXJ2aWNlcycsIGhlYWRlck5hbWU6ICdSZWxhdGVkIFNlcnZpY2VzJywgc29ydGFibGU6IGZhbHNlLCBmaWx0ZXI6IGZhbHNlLCB3aWR0aDogMTUwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IGAke3BhcmFtcy52YWx1ZT8ubGVuZ3RoIHx8IDB9IHNlcnZpY2UocylgIH1cbiAgICBdLCBbXSk7XG4gICAgY29uc3QgY2FwYWJpbGl0aWVzQ29sdW1ucyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7IGZpZWxkOiAnc2VydmljZU5hbWUnLCBoZWFkZXJOYW1lOiAnU2VydmljZScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAyNTAgfSxcbiAgICAgICAgeyBmaWVsZDogJ25hbWUnLCBoZWFkZXJOYW1lOiAnQ2FwYWJpbGl0eScsIHNvcnRhYmxlOiB0cnVlLCBmaWx0ZXI6IHRydWUsIHdpZHRoOiAyNTAgfSxcbiAgICAgICAgeyBmaWVsZDogJ2F2YWlsYWJsZScsIGhlYWRlck5hbWU6ICdBdmFpbGFibGUnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTIwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/ICdZZXMnIDogJ05vJyB9LFxuICAgICAgICB7IGZpZWxkOiAncmVxdWlyZXNMaWNlbnNlJywgaGVhZGVyTmFtZTogJ1JlcXVpcmVzIExpY2Vuc2UnLCBzb3J0YWJsZTogdHJ1ZSwgZmlsdGVyOiB0cnVlLCB3aWR0aDogMTUwLFxuICAgICAgICAgICAgdmFsdWVGb3JtYXR0ZXI6IChwYXJhbXMpID0+IHBhcmFtcy52YWx1ZSA/ICdZZXMnIDogJ05vJyB9LFxuICAgICAgICB7IGZpZWxkOiAnbGljZW5zZVR5cGUnLCBoZWFkZXJOYW1lOiAnTGljZW5zZSBUeXBlJywgc29ydGFibGU6IHRydWUsIGZpbHRlcjogdHJ1ZSwgd2lkdGg6IDIwMCB9XG4gICAgXSwgW10pO1xuICAgIGNvbnN0IGNvbHVtbnMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgc3dpdGNoIChzdGF0ZS5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NlcnZpY2VzJzogcmV0dXJuIHNlcnZpY2VzQ29sdW1ucztcbiAgICAgICAgICAgIGNhc2UgJ3JlY29tbWVuZGF0aW9ucyc6IHJldHVybiByZWNvbW1lbmRhdGlvbnNDb2x1bW5zO1xuICAgICAgICAgICAgY2FzZSAnY2FwYWJpbGl0aWVzJzogcmV0dXJuIGNhcGFiaWxpdGllc0NvbHVtbnM7XG4gICAgICAgICAgICBkZWZhdWx0OiByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9LCBbc3RhdGUuYWN0aXZlVGFiLCBzZXJ2aWNlc0NvbHVtbnMsIHJlY29tbWVuZGF0aW9uc0NvbHVtbnMsIGNhcGFiaWxpdGllc0NvbHVtbnNdKTtcbiAgICBjb25zdCBmaWx0ZXJlZERhdGEgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgbGV0IGRhdGEgPSBbXTtcbiAgICAgICAgc3dpdGNoIChzdGF0ZS5hY3RpdmVUYWIpIHtcbiAgICAgICAgICAgIGNhc2UgJ3NlcnZpY2VzJzpcbiAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0Py5kZXRlY3RlZFNlcnZpY2VzIHx8IFtdO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5maWx0ZXIuc2VsZWN0ZWRQcm92aWRlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gKGRhdGEgPz8gW10pLmZpbHRlcigocykgPT4gc3RhdGUuZmlsdGVyLnNlbGVjdGVkUHJvdmlkZXJzLmluY2x1ZGVzKHMucHJvdmlkZXIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLmZpbHRlci5zZWxlY3RlZFN0YXR1c2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IChkYXRhID8/IFtdKS5maWx0ZXIoKHMpID0+IHN0YXRlLmZpbHRlci5zZWxlY3RlZFN0YXR1c2VzLmluY2x1ZGVzKHMuc3RhdHVzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5maWx0ZXIuc2hvd09ubHlBdmFpbGFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IChkYXRhID8/IFtdKS5maWx0ZXIoKHMpID0+IHMuZGV0ZWN0ZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JlY29tbWVuZGF0aW9ucyc6XG4gICAgICAgICAgICAgICAgZGF0YSA9IHN0YXRlLnJlc3VsdD8ucmVjb21tZW5kYXRpb25zIHx8IFtdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2FwYWJpbGl0aWVzJzpcbiAgICAgICAgICAgICAgICBkYXRhID0gc3RhdGUucmVzdWx0Py5kZXRlY3RlZFNlcnZpY2VzLmZsYXRNYXAocyA9PiBzLmNhcGFiaWxpdGllcy5tYXAoYyA9PiAoeyBzZXJ2aWNlTmFtZTogcy5uYW1lLCAuLi5jIH0pKSkgfHwgW107XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdGUuZmlsdGVyLnNlYXJjaFRleHQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaExvd2VyID0gc3RhdGUuZmlsdGVyLnNlYXJjaFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGRhdGEgPSAoZGF0YSA/PyBbXSkuZmlsdGVyKGl0ZW0gPT4gSlNPTi5zdHJpbmdpZnkoaXRlbSkudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sIFtzdGF0ZS5yZXN1bHQsIHN0YXRlLmFjdGl2ZVRhYiwgc3RhdGUuZmlsdGVyXSk7XG4gICAgY29uc3Qgc3RhdHMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgaWYgKCFzdGF0ZS5yZXN1bHQpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3Qgc2VydmljZXMgPSBzdGF0ZS5yZXN1bHQuZGV0ZWN0ZWRTZXJ2aWNlcyB8fCBbXTtcbiAgICAgICAgY29uc3Qgc2VydmljZXNCeVByb3ZpZGVyID0ge1xuICAgICAgICAgICAgYXp1cmU6IHNlcnZpY2VzLmZpbHRlcihzID0+IHMucHJvdmlkZXIgPT09ICdhenVyZScpLmxlbmd0aCxcbiAgICAgICAgICAgIG1pY3Jvc29mdDM2NTogc2VydmljZXMuZmlsdGVyKHMgPT4gcy5wcm92aWRlciA9PT0gJ21pY3Jvc29mdDM2NScpLmxlbmd0aCxcbiAgICAgICAgICAgICdvbi1wcmVtaXNlcyc6IHNlcnZpY2VzLmZpbHRlcihzID0+IHMucHJvdmlkZXIgPT09ICdvbi1wcmVtaXNlcycpLmxlbmd0aCxcbiAgICAgICAgICAgIGF3czogc2VydmljZXMuZmlsdGVyKHMgPT4gcy5wcm92aWRlciA9PT0gJ2F3cycpLmxlbmd0aCxcbiAgICAgICAgICAgIGdjcDogc2VydmljZXMuZmlsdGVyKHMgPT4gcy5wcm92aWRlciA9PT0gJ2djcCcpLmxlbmd0aFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG90YWxTZXJ2aWNlc0RldGVjdGVkOiBzZXJ2aWNlcy5sZW5ndGgsXG4gICAgICAgICAgICBzZXJ2aWNlc0J5UHJvdmlkZXIsXG4gICAgICAgICAgICBjcml0aWNhbFJlY29tbWVuZGF0aW9uczogc3RhdGUucmVzdWx0LnJlY29tbWVuZGF0aW9ucz8uZmlsdGVyKHIgPT4gci5wcmlvcml0eSA9PT0gJ2NyaXRpY2FsJykubGVuZ3RoIHx8IDAsXG4gICAgICAgICAgICBlbnZpcm9ubWVudENvbmZpZGVuY2U6IHN0YXRlLnJlc3VsdC5jb25maWRlbmNlIHx8IDBcbiAgICAgICAgfTtcbiAgICB9LCBbc3RhdGUucmVzdWx0XSk7XG4gICAgY29uc3QgdXBkYXRlQ29uZmlnID0gdXNlQ2FsbGJhY2soKHVwZGF0ZXMpID0+IHtcbiAgICAgICAgc2V0U3RhdGUocHJldiA9PiAoeyAuLi5wcmV2LCBjb25maWc6IHsgLi4ucHJldi5jb25maWcsIC4uLnVwZGF0ZXMgfSB9KSk7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IHVwZGF0ZUZpbHRlciA9IHVzZUNhbGxiYWNrKCh1cGRhdGVzKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgZmlsdGVyOiB7IC4uLnByZXYuZmlsdGVyLCAuLi51cGRhdGVzIH0gfSkpO1xuICAgIH0sIFtdKTtcbiAgICBjb25zdCBzZXRBY3RpdmVUYWIgPSB1c2VDYWxsYmFjaygodGFiKSA9PiB7XG4gICAgICAgIHNldFN0YXRlKHByZXYgPT4gKHsgLi4ucHJldiwgYWN0aXZlVGFiOiB0YWIgfSkpO1xuICAgIH0sIFtdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjb25maWc6IHN0YXRlLmNvbmZpZyxcbiAgICAgICAgcmVzdWx0OiBzdGF0ZS5yZXN1bHQsXG4gICAgICAgIGlzRGV0ZWN0aW5nOiBzdGF0ZS5pc0RldGVjdGluZyxcbiAgICAgICAgcHJvZ3Jlc3M6IHN0YXRlLnByb2dyZXNzLFxuICAgICAgICBhY3RpdmVUYWI6IHN0YXRlLmFjdGl2ZVRhYixcbiAgICAgICAgZmlsdGVyOiBzdGF0ZS5maWx0ZXIsXG4gICAgICAgIGVycm9yOiBzdGF0ZS5lcnJvcixcbiAgICAgICAgY29sdW1ucyxcbiAgICAgICAgZmlsdGVyZWREYXRhLFxuICAgICAgICBzdGF0cyxcbiAgICAgICAgdXBkYXRlQ29uZmlnLFxuICAgICAgICB1cGRhdGVGaWx0ZXIsXG4gICAgICAgIHNldEFjdGl2ZVRhYixcbiAgICAgICAgc3RhcnREZXRlY3Rpb24sXG4gICAgICAgIGNhbmNlbERldGVjdGlvbixcbiAgICAgICAgZXhwb3J0VG9DU1YsXG4gICAgICAgIGV4cG9ydFRvRXhjZWxcbiAgICB9O1xufTtcbmZ1bmN0aW9uIGNvbnZlcnRUb0NTVihkYXRhKSB7XG4gICAgaWYgKCFkYXRhIHx8IGRhdGEubGVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgY29uc3QgZmxhdHRlbk9iamVjdCA9IChvYmosIHByZWZpeCA9ICcnKSA9PiB7XG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLnJlZHVjZSgoYWNjLCBrZXkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gb2JqW2tleV07XG4gICAgICAgICAgICBjb25zdCBuZXdLZXkgPSBwcmVmaXggPyBgJHtwcmVmaXh9LiR7a2V5fWAgOiBrZXk7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGFjY1tuZXdLZXldID0gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSAmJiAhKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKGFjYywgZmxhdHRlbk9iamVjdCh2YWx1ZSwgbmV3S2V5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGFjY1tuZXdLZXldID0gdmFsdWUubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgICAgICAgYWNjW25ld0tleV0gPSB2YWx1ZS50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYWNjW25ld0tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgIH0sIHt9KTtcbiAgICB9O1xuICAgIGNvbnN0IGZsYXREYXRhID0gKGRhdGEgPz8gW10pLm1hcChpdGVtID0+IGZsYXR0ZW5PYmplY3QoaXRlbSkpO1xuICAgIGNvbnN0IGhlYWRlcnMgPSBPYmplY3Qua2V5cyhmbGF0RGF0YVswXSk7XG4gICAgY29uc3Qgcm93cyA9IGZsYXREYXRhLm1hcChpdGVtID0+IGhlYWRlcnMubWFwKGhlYWRlciA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gaXRlbVtoZWFkZXJdO1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAodmFsdWUuaW5jbHVkZXMoJywnKSB8fCB2YWx1ZS5pbmNsdWRlcygnXCInKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBgXCIke3ZhbHVlLnJlcGxhY2UoL1wiL2csICdcIlwiJyl9XCJgO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9KS5qb2luKCcsJykpO1xuICAgIHJldHVybiBbaGVhZGVycy5qb2luKCcsJyksIC4uLnJvd3NdLmpvaW4oJ1xcbicpO1xufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9