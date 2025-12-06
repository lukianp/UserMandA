"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3440],{

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

/***/ 53440:
/*!**************************************************************!*\
  !*** ./src/renderer/views/groups/GroupsView.tsx + 3 modules ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  GroupsView: () => (/* binding */ GroupsView),
  "default": () => (/* binding */ groups_GroupsView)
});

// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
// EXTERNAL MODULE: ./node_modules/react-router-dom/dist/index.js
var dist = __webpack_require__(84976);
// EXTERNAL MODULE: ./node_modules/react-dnd/dist/index.js + 44 modules
var react_dnd_dist = __webpack_require__(64074);
// EXTERNAL MODULE: ./node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(34164);
// EXTERNAL MODULE: ./node_modules/lucide-react/dist/esm/lucide-react.js
var lucide_react = __webpack_require__(72832);
;// ./src/renderer/types/models/group.ts
/**
 * Group data model interfaces
 *
 * Represents Active Directory and Azure AD groups
 */
var GroupType;
(function (GroupType) {
    GroupType["Security"] = "Security";
    GroupType["Distribution"] = "Distribution";
    GroupType["MailEnabled"] = "MailEnabled";
    GroupType["Office365"] = "Office365";
    GroupType["Dynamic"] = "Dynamic";
})(GroupType || (GroupType = {}));
var GroupScope;
(function (GroupScope) {
    GroupScope["Universal"] = "Universal";
    GroupScope["Global"] = "Global";
    GroupScope["DomainLocal"] = "DomainLocal";
    GroupScope["None"] = "None";
})(GroupScope || (GroupScope = {}));
var MembershipType;
(function (MembershipType) {
    MembershipType["Static"] = "Static";
    MembershipType["Dynamic"] = "Dynamic";
    MembershipType["RuleBased"] = "RuleBased";
})(MembershipType || (MembershipType = {}));

// EXTERNAL MODULE: ./src/renderer/store/useProfileStore.ts
var useProfileStore = __webpack_require__(33813);
// EXTERNAL MODULE: ./src/renderer/hooks/useDebounce.ts
var useDebounce = __webpack_require__(99305);
;// ./src/renderer/hooks/useGroupsViewLogic.ts
/**
 * Groups View Logic Hook
 *
 * Business logic for the Groups management view.
 * Handles group loading, filtering, search, and operations.
 * Mirrors C# GroupsViewModel.LoadAsync pattern
 */




const useGroupsViewLogic = () => {
    // State
    const [groups, setGroups] = (0,react.useState)([]);
    const [isLoading, setIsLoading] = (0,react.useState)(false);
    const [error, setError] = (0,react.useState)(null);
    const [searchText, setSearchText] = (0,react.useState)('');
    const [selectedGroups, setSelectedGroups] = (0,react.useState)([]);
    const [loadingMessage, setLoadingMessage] = (0,react.useState)('');
    const [warnings, setWarnings] = (0,react.useState)([]);
    // Filters
    const [groupTypeFilter, setGroupTypeFilter] = (0,react.useState)('all');
    const [scopeFilter, setScopeFilter] = (0,react.useState)('all');
    const [sourceFilter, setSourceFilter] = (0,react.useState)('all');
    // Get current profile from store
    const { getCurrentSourceProfile } = (0,useProfileStore.useProfileStore)();
    // Debounced search
    const debouncedSearch = (0,useDebounce.useDebounce)(searchText, 300);
    /**
     * Map GroupDto from Logic Engine to GroupData for the view
     */
    const mapGroupDtoToGroupData = (dto) => {
        // Parse group type from Type string
        let groupType = GroupType.Security;
        const typeStr = (dto.Type || '').toLowerCase();
        if (typeStr.includes('distribution'))
            groupType = GroupType.Distribution;
        else if (typeStr.includes('mail'))
            groupType = GroupType.MailEnabled;
        else if (typeStr.includes('dynamic'))
            groupType = GroupType.Dynamic;
        // Determine source from DiscoveryModule
        let source = 'ActiveDirectory';
        const discoveryModule = dto.DiscoveryModule || '';
        if (discoveryModule.includes('Azure')) {
            source = 'AzureAD';
        }
        else if (discoveryModule.includes('ActiveDirectory') || discoveryModule.includes('AD')) {
            source = 'ActiveDirectory';
        }
        return {
            id: dto.Sid || dto.Name,
            objectId: dto.Sid || '',
            name: dto.Name || 'Unknown',
            displayName: dto.Name || 'Unknown',
            description: dto.Dn || undefined,
            email: undefined, // Not available in GroupDto
            groupType,
            scope: GroupScope.Universal, // Default scope
            membershipType: MembershipType.Static, // Default membership type
            memberCount: dto.Members?.length || 0,
            owners: dto.ManagedBy ? [dto.ManagedBy] : [],
            createdDate: dto.DiscoveryTimestamp || new Date().toISOString(),
            lastModified: dto.DiscoveryTimestamp || new Date().toISOString(),
            source,
            isSecurityEnabled: groupType === GroupType.Security,
            isMailEnabled: groupType === GroupType.MailEnabled,
            distinguishedName: dto.Dn,
            managedBy: dto.ManagedBy,
        };
    };
    /**
     * Load groups from Logic Engine (CSV data)
     * Replicates /gui/ GroupsViewModel.LoadAsync() pattern
     */
    const loadGroups = async (forceReload = false) => {
        setIsLoading(true);
        setError(null);
        setWarnings([]);
        setLoadingMessage('Loading groups from Logic Engine...');
        try {
            console.log(`[GroupsView] Loading groups from LogicEngine...${forceReload ? ' (force reload)' : ''}`);
            // Force reload data from CSV if requested
            if (forceReload) {
                console.log('[GroupsView] Forcing LogicEngine data reload...');
                const reloadResult = await window.electronAPI.invoke('logicEngine:forceReload');
                if (!reloadResult.success) {
                    throw new Error(reloadResult.error || 'Failed to reload LogicEngine data');
                }
                console.log('[GroupsView] LogicEngine data reloaded successfully');
            }
            // Get groups from Logic Engine
            const result = await window.electronAPI.invoke('logicEngine:getAllGroups');
            if (!result.success) {
                throw new Error(result.error || 'Failed to load groups from LogicEngine');
            }
            if (!Array.isArray(result.data)) {
                throw new Error('Invalid response format from LogicEngine');
            }
            // Map GroupDto[] to GroupData[]
            const mappedGroups = result.data.map(mapGroupDtoToGroupData);
            setGroups(mappedGroups);
            setError(null);
            console.log(`[GroupsView] Loaded ${mappedGroups.length} groups from LogicEngine`);
        }
        catch (err) {
            console.error('[GroupsView] Failed to load groups:', err);
            setError(err instanceof Error ? err.message : 'Failed to load groups from Logic Engine.');
            setGroups([]); // Set empty array instead of mock data
        }
        finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    /**
     * Export selected groups to CSV
     */
    const handleExport = async () => {
        try {
            const exportData = selectedGroups.length > 0 ? selectedGroups : groups;
            // Convert to CSV
            const csvContent = convertToCSV(exportData);
            // Show save dialog
            const filePath = await window.electronAPI.showSaveDialog({
                title: 'Export Groups',
                defaultPath: `groups_export_${new Date().toISOString().split('T')[0]}.csv`,
                filters: [{ name: 'CSV Files', extensions: ['csv'] }],
            });
            if (filePath) {
                await window.electronAPI.writeFile(filePath, csvContent);
                alert('Groups exported successfully!');
            }
        }
        catch (err) {
            console.error('Export failed:', err);
            alert(`Export failed: ${err.message}`);
        }
    };
    /**
     * Delete selected groups
     * Note: For CSV-based discovery data, this removes items from local state only.
     * Data will reload from CSV files on next refresh.
     */
    const handleDelete = async () => {
        if (selectedGroups.length === 0)
            return;
        if (!confirm(`Remove ${selectedGroups.length} group(s) from the view?\n\nNote: This removes items from the current view only. Data will reload from CSV files on next refresh.`)) {
            return;
        }
        try {
            // Get IDs of groups to remove
            const idsToRemove = new Set(selectedGroups.map(g => g.id));
            // Remove from local state
            setGroups((prevGroups) => prevGroups.filter((g) => !idsToRemove.has(g.id)));
            setSelectedGroups([]);
            console.log(`[GroupsView] Removed ${selectedGroups.length} groups from view`);
        }
        catch (err) {
            console.error('[GroupsView] Delete failed:', err);
            setError(`Failed to remove groups from view: ${err.message}`);
        }
    };
    /**
     * View group members
     * Opens GroupMembersModal
     */
    const handleViewMembers = (group) => {
        console.log('[GroupsView] Opening members modal for group:', group.name);
        // Dynamically import and render GroupMembersModal
        __webpack_require__.e(/*! import() */ 850).then(__webpack_require__.bind(__webpack_require__, /*! ../components/dialogs/GroupMembersModal */ 70850)).then(({ GroupMembersModal }) => {
            const { openModal, updateModal } = (__webpack_require__(/*! ../store/useModalStore */ 23361).useModalStore).getState();
            const modalId = openModal({
                type: 'custom',
                title: `Members of ${group.name}`,
                component: GroupMembersModal,
                props: {
                    modalId: '', // Will be updated below
                    groupId: group.id,
                    groupName: group.name,
                },
                dismissable: true,
                size: 'xl',
            });
            // Update modal props with actual modalId
            updateModal(modalId, {
                props: {
                    modalId,
                    groupId: group.id,
                    groupName: group.name,
                },
            });
        });
    };
    /**
     * Refresh groups list
     * Forces reload of data from CSV files
     */
    const handleRefresh = () => {
        console.log('[GroupsView] Refresh button clicked, forcing data reload');
        loadGroups(true); // Pass true to force reload
    };
    // Subscribe to selected source profile changes
    const selectedSourceProfile = (0,useProfileStore.useProfileStore)((state) => state.selectedSourceProfile);
    // Load groups on mount and when profile changes
    (0,react.useEffect)(() => {
        loadGroups();
    }, [selectedSourceProfile]); // Reload when profile changes
    // Subscribe to file change events for auto-refresh
    (0,react.useEffect)(() => {
        const handleDataRefresh = (dataType) => {
            if ((dataType === 'Groups' || dataType === 'All') && !isLoading) {
                console.log('[GroupsView] Auto-refreshing due to file changes');
                loadGroups();
            }
        };
        // TODO: Subscribe to file watcher events when available
        // window.electronAPI.on('filewatcher:dataChanged', handleDataRefresh);
        return () => {
            // TODO: Cleanup subscription
            // window.electronAPI.off('filewatcher:dataChanged', handleDataRefresh);
        };
    }, [isLoading]);
    /**
     * Filtered groups based on search and filters
     */
    const filteredGroups = (0,react.useMemo)(() => {
        let result = [...groups];
        // Apply search filter
        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            result = result.filter((g) => (g.name ?? '').toLowerCase().includes(searchLower) ||
                (g.displayName ?? '').toLowerCase().includes(searchLower) ||
                g.description?.toLowerCase().includes(searchLower) ||
                g.email?.toLowerCase().includes(searchLower));
        }
        // Apply group type filter
        if (groupTypeFilter !== 'all') {
            result = result.filter((g) => g.groupType === groupTypeFilter);
        }
        // Apply scope filter
        if (scopeFilter !== 'all') {
            result = result.filter((g) => g.scope === scopeFilter);
        }
        // Apply source filter
        if (sourceFilter !== 'all') {
            result = result.filter((g) => g.source === sourceFilter);
        }
        return result;
    }, [groups, debouncedSearch, groupTypeFilter, scopeFilter, sourceFilter]);
    /**
     * Column definitions for AG Grid
     * Updated for Epic 1 Task 1.4 - Added View Details action
     */
    const columnDefs = (0,react.useMemo)(() => [
        {
            field: 'name',
            headerName: 'Group Name',
            sortable: true,
            filter: true,
            flex: 2,
            checkboxSelection: true,
            headerCheckboxSelection: true,
        },
        {
            field: 'displayName',
            headerName: 'Display Name',
            sortable: true,
            filter: true,
            flex: 2,
        },
        {
            field: 'groupType',
            headerName: 'Type',
            sortable: true,
            filter: true,
            width: 150,
        },
        {
            field: 'scope',
            headerName: 'Scope',
            sortable: true,
            filter: true,
            width: 130,
        },
        {
            field: 'memberCount',
            headerName: 'Members',
            sortable: true,
            filter: 'agNumberColumnFilter',
            width: 120,
            type: 'numericColumn',
        },
        {
            field: 'source',
            headerName: 'Source',
            sortable: true,
            filter: true,
            width: 130,
        },
        {
            field: 'email',
            headerName: 'Email',
            sortable: true,
            filter: true,
            flex: 2,
        },
        {
            field: 'createdDate',
            headerName: 'Created',
            sortable: true,
            filter: 'agDateColumnFilter',
            width: 150,
            valueFormatter: (params) => {
                if (!params.value)
                    return '';
                return new Date(params.value).toLocaleDateString();
            },
        },
    ], []);
    /**
     * Convert groups to CSV format
     */
    const convertToCSV = (data) => {
        const headers = [
            'Name',
            'Display Name',
            'Type',
            'Scope',
            'Members',
            'Source',
            'Email',
            'Description',
            'Created Date',
        ];
        const rows = (data ?? []).map((g) => [
            g.name,
            g.displayName,
            g.groupType,
            g.scope,
            g.memberCount.toString(),
            g.source,
            g.email || '',
            g.description || '',
            g.createdDate,
        ]);
        const csvRows = [headers, ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','));
        return csvRows.join('\n');
    };
    return {
        groups: filteredGroups,
        isLoading,
        error,
        searchText,
        setSearchText,
        selectedGroups,
        setSelectedGroups,
        groupTypeFilter,
        setGroupTypeFilter,
        scopeFilter,
        setScopeFilter,
        sourceFilter,
        setSourceFilter,
        columnDefs,
        handleExport,
        handleDelete,
        handleViewMembers,
        handleRefresh,
        totalGroups: groups.length,
        filteredCount: filteredGroups.length,
        loadingMessage,
        warnings,
    };
};

// EXTERNAL MODULE: ./src/renderer/components/organisms/VirtualizedDataGrid.tsx
var VirtualizedDataGrid = __webpack_require__(59944);
// EXTERNAL MODULE: ./src/renderer/components/molecules/SearchBar.tsx
var SearchBar = __webpack_require__(53404);
// EXTERNAL MODULE: ./src/renderer/components/atoms/Button.tsx
var Button = __webpack_require__(74160);
;// ./src/renderer/components/molecules/FilterPanel.tsx

/**
 * FilterPanel Component
 *
 * Collapsible panel containing multiple filter inputs.
 * Used for advanced filtering in data views.
 */




/**
 * FilterPanel Component
 */
const FilterPanel = ({ filters, onFilterChange, onReset, defaultCollapsed = false, title = 'Filters', className, 'data-cy': dataCy, }) => {
    const [isCollapsed, setIsCollapsed] = (0,react.useState)(defaultCollapsed);
    const handleFilterChange = (filterId, value) => {
        if (onFilterChange) {
            onFilterChange(filterId, value);
        }
    };
    const handleReset = () => {
        if (onReset) {
            onReset();
        }
    };
    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };
    // Check if any filters have values
    const hasActiveFilters = filters.some(f => {
        if (f.type === 'checkbox')
            return f.value === true;
        return f.value !== undefined && f.value !== '' && f.value !== null;
    });
    const containerClasses = (0,clsx.clsx)('border border-gray-300 rounded-lg bg-white shadow-sm', className);
    return ((0,jsx_runtime.jsxs)("div", { className: containerClasses, "data-cy": dataCy, children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between px-4 py-3 border-b border-gray-200", children: [(0,jsx_runtime.jsxs)("button", { type: "button", onClick: toggleCollapse, className: "flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded", children: [(0,jsx_runtime.jsx)("span", { children: title }), hasActiveFilters && ((0,jsx_runtime.jsx)("span", { className: "inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full", children: filters.filter(f => f.value).length })), isCollapsed ? ((0,jsx_runtime.jsx)(lucide_react.ChevronDown, { className: "h-4 w-4", "aria-hidden": "true" })) : ((0,jsx_runtime.jsx)(lucide_react.ChevronUp, { className: "h-4 w-4", "aria-hidden": "true" }))] }), hasActiveFilters && !isCollapsed && ((0,jsx_runtime.jsx)(Button.Button, { variant: "ghost", size: "sm", onClick: handleReset, icon: (0,jsx_runtime.jsx)(lucide_react.X, { className: "h-4 w-4" }), "data-cy": "filter-reset", children: "Reset" }))] }), !isCollapsed && ((0,jsx_runtime.jsx)("div", { className: "p-4 space-y-4", children: filters.map((filter) => ((0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("label", { htmlFor: filter.id, className: "block text-sm font-medium text-gray-700 mb-1", children: filter.label }), filter.type === 'text' && ((0,jsx_runtime.jsx)("input", { id: filter.id, type: "text", value: filter.value || '', onChange: (e) => handleFilterChange(filter.id, e.target.value), placeholder: filter.placeholder, className: "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", "data-cy": `filter-${filter.id}` })), filter.type === 'select' && ((0,jsx_runtime.jsxs)("select", { id: filter.id, value: filter.value || '', onChange: (e) => handleFilterChange(filter.id, e.target.value), className: "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", "data-cy": `filter-${filter.id}`, children: [(0,jsx_runtime.jsx)("option", { value: "", children: "All" }), filter.options?.map((option) => ((0,jsx_runtime.jsx)("option", { value: option.value, children: option.label }, option.value)))] })), filter.type === 'date' && ((0,jsx_runtime.jsx)("input", { id: filter.id, type: "date", value: filter.value || '', onChange: (e) => handleFilterChange(filter.id, e.target.value), className: "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", "data-cy": `filter-${filter.id}` })), filter.type === 'checkbox' && ((0,jsx_runtime.jsxs)("div", { className: "flex items-center", children: [(0,jsx_runtime.jsx)("input", { id: filter.id, type: "checkbox", checked: filter.value || false, onChange: (e) => handleFilterChange(filter.id, e.target.checked), className: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500", "data-cy": `filter-${filter.id}` }), (0,jsx_runtime.jsx)("label", { htmlFor: filter.id, className: "ml-2 text-sm text-gray-600", children: filter.placeholder || 'Enable' })] }))] }, filter.id))) }))] }));
};
/* harmony default export */ const molecules_FilterPanel = ((/* unused pure expression or super */ null && (FilterPanel)));

// EXTERNAL MODULE: ./src/renderer/components/atoms/Badge.tsx
var Badge = __webpack_require__(61315);
;// ./src/renderer/views/groups/GroupsView.tsx

/**
 * Groups View
 *
 * Main view for managing Active Directory and Azure AD groups.
 * Features: search, filter, export, delete, view members.
 */












/**
 * Draggable cell component for drag handle
 */
const DragHandleCell = ({ data }) => {
    const [{ isDragging }, drag] = (0,react_dnd_dist.useDrag)({
        type: 'GROUP',
        item: () => ({
            id: data.id || data.objectId || '',
            type: 'GROUP',
            data: data,
        }),
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    return ((0,jsx_runtime.jsx)("div", { ref: drag, className: (0,clsx.clsx)('flex items-center justify-center cursor-move h-full', isDragging && 'opacity-50'), title: "Drag to add to migration wave", "data-cy": "group-drag-handle", "data-testid": "group-drag-handle", children: (0,jsx_runtime.jsx)(lucide_react.GripVertical, { size: 16, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" }) }));
};
/**
 * GroupsView Component
 * Updated for Epic 1 Task 1.4 - Added View Details navigation
 */
const GroupsView = () => {
    const navigate = (0,dist.useNavigate)();
    const { groups, isLoading, error, searchText, setSearchText, selectedGroups, setSelectedGroups, groupTypeFilter, setGroupTypeFilter, scopeFilter, setScopeFilter, sourceFilter, setSourceFilter, columnDefs, handleExport, handleDelete, handleRefresh, totalGroups, filteredCount, } = useGroupsViewLogic();
    // Handler for viewing group details
    const handleViewDetails = (group) => {
        navigate(`/groups/${group.id}`);
    };
    // Extended column definitions with drag handle and View Details action
    const extendedColumnDefs = (0,react.useMemo)(() => [
        {
            headerName: '',
            width: 50,
            pinned: 'left',
            suppressMenu: true,
            sortable: false,
            filter: false,
            resizable: false,
            cellRenderer: (params) => (0,jsx_runtime.jsx)(DragHandleCell, { data: params.data }),
        },
        ...columnDefs,
        {
            headerName: 'Actions',
            width: 150,
            pinned: 'right',
            cellRenderer: (params) => ((0,jsx_runtime.jsxs)(Button.Button, { onClick: () => handleViewDetails(params.data), variant: "secondary", size: "sm", "data-cy": "view-group-details", "data-testid": "view-group-details", children: [(0,jsx_runtime.jsx)(lucide_react.Eye, { className: "mr-1 h-3 w-3" }), "View Details"] })),
        },
    ], [columnDefs]);
    // Filter configuration
    const filters = [
        {
            id: 'groupType',
            label: 'Group Type',
            type: 'select',
            value: groupTypeFilter,
            options: [
                { value: 'all', label: 'All Types' },
                { value: GroupType.Security, label: 'Security' },
                { value: GroupType.Distribution, label: 'Distribution' },
                { value: GroupType.MailEnabled, label: 'Mail-Enabled' },
                { value: GroupType.Office365, label: 'Office 365' },
                { value: GroupType.Dynamic, label: 'Dynamic' },
            ],
        },
        {
            id: 'scope',
            label: 'Scope',
            type: 'select',
            value: scopeFilter,
            options: [
                { value: 'all', label: 'All Scopes' },
                { value: GroupScope.Universal, label: 'Universal' },
                { value: GroupScope.Global, label: 'Global' },
                { value: GroupScope.DomainLocal, label: 'Domain Local' },
            ],
        },
        {
            id: 'source',
            label: 'Source',
            type: 'select',
            value: sourceFilter,
            options: [
                { value: 'all', label: 'All Sources' },
                { value: 'ActiveDirectory', label: 'Active Directory' },
                { value: 'AzureAD', label: 'Azure AD' },
                { value: 'Hybrid', label: 'Hybrid' },
            ],
        },
    ];
    const handleFilterChange = (filterId, value) => {
        switch (filterId) {
            case 'groupType':
                setGroupTypeFilter(value);
                break;
            case 'scope':
                setScopeFilter(value);
                break;
            case 'source':
                setSourceFilter(value);
                break;
        }
    };
    const handleResetFilters = () => {
        setGroupTypeFilter('all');
        setScopeFilter('all');
        setSourceFilter('all');
        setSearchText('');
    };
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "groups-view", "data-testid": "groups-view", children: [(0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Groups" }), (0,jsx_runtime.jsx)("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Manage Active Directory and Azure AD groups" })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsxs)(Badge.Badge, { variant: "info", size: "lg", children: [filteredCount, " of ", totalGroups, " groups"] }), (0,jsx_runtime.jsx)(Button.Button, { onClick: handleRefresh, variant: "secondary", size: "md", icon: (0,jsx_runtime.jsx)(lucide_react.RefreshCw, { className: (0,clsx.clsx)('h-4 w-4', { 'animate-spin': isLoading }) }), disabled: isLoading, "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), (0,jsx_runtime.jsx)(Button.Button, { onClick: handleExport, variant: "secondary", size: "md", icon: (0,jsx_runtime.jsx)(lucide_react.Download, { className: "h-4 w-4" }), disabled: isLoading, "data-cy": "export-btn", "data-testid": "export-btn", children: "Export" }), (0,jsx_runtime.jsxs)(Button.Button, { onClick: handleDelete, variant: "danger", size: "md", icon: (0,jsx_runtime.jsx)(lucide_react.Trash2, { className: "h-4 w-4" }), disabled: selectedGroups.length === 0 || isLoading, "data-cy": "delete-btn", "data-testid": "delete-btn", children: ["Delete (", selectedGroups.length, ")"] }), (0,jsx_runtime.jsx)(Button.Button, { onClick: () => {
                                        // Note: Modal functionality temporarily disabled due to import issues
                                        console.log('Create Group functionality - temporarily disabled');
                                        // TODO: Implement proper modal opening
                                    }, variant: "primary", size: "md", icon: (0,jsx_runtime.jsx)(lucide_react.Plus, { className: "h-4 w-4" }), disabled: isLoading, "data-cy": "create-btn", "data-testid": "create-btn", children: "Create Group" })] })] }) }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 space-y-4", children: [(0,jsx_runtime.jsx)("div", { className: "flex items-center gap-4", children: (0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(SearchBar.SearchBar, { value: searchText, onChange: setSearchText, placeholder: "Search groups by name, email, or description...", disabled: isLoading, "data-cy": "group-search", "data-testid": "group-search" }) }) }), (0,jsx_runtime.jsx)(FilterPanel, { filters: filters, onFilterChange: handleFilterChange, onReset: handleResetFilters, title: "Advanced Filters", defaultCollapsed: true, "data-cy": "group-filters", "data-testid": "group-filters" })] }), error && ((0,jsx_runtime.jsx)("div", { className: "mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg", children: (0,jsx_runtime.jsx)("p", { className: "text-sm text-red-800", children: error }) })), (0,jsx_runtime.jsx)("div", { className: "flex-1 px-6 py-4 overflow-hidden", children: (0,jsx_runtime.jsx)("div", { className: "h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid.VirtualizedDataGrid, { data: groups, columns: extendedColumnDefs, loading: isLoading, onSelectionChange: setSelectedGroups }) }) })] }));
};
/* harmony default export */ const groups_GroupsView = (GroupsView);


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBLGlCQUFpQixxQ0FBcUMsc0RBQUksVUFBVSxXQUFXLDBDQUFJO0FBQ25GO0FBQ0E7QUFDQSxxQkFBcUIseURBQXlELHNEQUFJLFdBQVcsbVBBQW1QLEdBQUcsR0FBRyxLQUFLO0FBQzNWO0FBQ0EsaUVBQWUsS0FBSyxFQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUMzRHJCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUM0QztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQLGdEQUFnRCwrQ0FBUTtBQUN4RCxJQUFJLGdEQUFTO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxzRUFBZSwyREFBVyxJQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9tb2xlY3VsZXMvU2VhcmNoQmFyLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci90eXBlcy9tb2RlbHMvZ3JvdXAudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlR3JvdXBzVmlld0xvZ2ljLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL0ZpbHRlclBhbmVsLnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci92aWV3cy9ncm91cHMvR3JvdXBzVmlldy50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9CYWRnZS50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlRGVib3VuY2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogU2VhcmNoQmFyIENvbXBvbmVudFxuICpcbiAqIFNlYXJjaCBpbnB1dCB3aXRoIGljb24sIGNsZWFyIGJ1dHRvbiwgYW5kIGRlYm91bmNlZCBvbkNoYW5nZS5cbiAqIFVzZWQgZm9yIGZpbHRlcmluZyBsaXN0cyBhbmQgdGFibGVzLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBTZWFyY2gsIFggfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuLyoqXG4gKiBTZWFyY2hCYXIgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBTZWFyY2hCYXIgPSAoeyB2YWx1ZTogY29udHJvbGxlZFZhbHVlID0gJycsIG9uQ2hhbmdlLCBwbGFjZWhvbGRlciA9ICdTZWFyY2guLi4nLCBkZWJvdW5jZURlbGF5ID0gMzAwLCBkaXNhYmxlZCA9IGZhbHNlLCBzaXplID0gJ21kJywgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIGNvbnN0IFtpbnB1dFZhbHVlLCBzZXRJbnB1dFZhbHVlXSA9IHVzZVN0YXRlKGNvbnRyb2xsZWRWYWx1ZSk7XG4gICAgLy8gU3luYyB3aXRoIGNvbnRyb2xsZWQgdmFsdWVcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKGNvbnRyb2xsZWRWYWx1ZSk7XG4gICAgfSwgW2NvbnRyb2xsZWRWYWx1ZV0pO1xuICAgIC8vIERlYm91bmNlZCBvbkNoYW5nZVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGlmIChvbkNoYW5nZSAmJiBpbnB1dFZhbHVlICE9PSBjb250cm9sbGVkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBvbkNoYW5nZShpbnB1dFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZGVib3VuY2VEZWxheSk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlcik7XG4gICAgICAgIH07XG4gICAgfSwgW2lucHV0VmFsdWUsIG9uQ2hhbmdlLCBkZWJvdW5jZURlbGF5LCBjb250cm9sbGVkVmFsdWVdKTtcbiAgICBjb25zdCBoYW5kbGVJbnB1dENoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIHNldElucHV0VmFsdWUoZS50YXJnZXQudmFsdWUpO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlQ2xlYXIgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldElucHV0VmFsdWUoJycpO1xuICAgICAgICBpZiAob25DaGFuZ2UpIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKCcnKTtcbiAgICAgICAgfVxuICAgIH0sIFtvbkNoYW5nZV0pO1xuICAgIC8vIFNpemUgY2xhc3Nlc1xuICAgIGNvbnN0IHNpemVDbGFzc2VzID0ge1xuICAgICAgICBzbTogJ2gtOCB0ZXh0LXNtIHB4LTMnLFxuICAgICAgICBtZDogJ2gtMTAgdGV4dC1iYXNlIHB4LTQnLFxuICAgICAgICBsZzogJ2gtMTIgdGV4dC1sZyBweC01JyxcbiAgICB9O1xuICAgIGNvbnN0IGljb25TaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTQgdy00JyxcbiAgICAgICAgbWQ6ICdoLTUgdy01JyxcbiAgICAgICAgbGc6ICdoLTYgdy02JyxcbiAgICB9O1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdyZWxhdGl2ZSBmbGV4IGl0ZW1zLWNlbnRlcicsIGNsYXNzTmFtZSk7XG4gICAgY29uc3QgaW5wdXRDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICd3LWZ1bGwgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMzAwJywgJ3BsLTEwIHByLTEwJywgJ2JnLXdoaXRlIHRleHQtZ3JheS05MDAgcGxhY2Vob2xkZXItZ3JheS00MDAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLWJsdWUtNTAwIGZvY3VzOmJvcmRlci1ibHVlLTUwMCcsICd0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAnLCBcbiAgICAvLyBTaXplXG4gICAgc2l6ZUNsYXNzZXNbc2l6ZV0sIFxuICAgIC8vIERpc2FibGVkXG4gICAge1xuICAgICAgICAnYmctZ3JheS0xMDAgdGV4dC1ncmF5LTUwMCBjdXJzb3Itbm90LWFsbG93ZWQnOiBkaXNhYmxlZCxcbiAgICB9KTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3goU2VhcmNoLCB7IGNsYXNzTmFtZTogY2xzeCgnYWJzb2x1dGUgbGVmdC0zIHRleHQtZ3JheS00MDAgcG9pbnRlci1ldmVudHMtbm9uZScsIGljb25TaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSksIF9qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwidGV4dFwiLCB2YWx1ZTogaW5wdXRWYWx1ZSwgb25DaGFuZ2U6IGhhbmRsZUlucHV0Q2hhbmdlLCBwbGFjZWhvbGRlcjogcGxhY2Vob2xkZXIsIGRpc2FibGVkOiBkaXNhYmxlZCwgY2xhc3NOYW1lOiBpbnB1dENsYXNzZXMsIFwiYXJpYS1sYWJlbFwiOiBcIlNlYXJjaFwiIH0pLCBpbnB1dFZhbHVlICYmICFkaXNhYmxlZCAmJiAoX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IGhhbmRsZUNsZWFyLCBjbGFzc05hbWU6IGNsc3goJ2Fic29sdXRlIHJpZ2h0LTMnLCAndGV4dC1ncmF5LTQwMCBob3Zlcjp0ZXh0LWdyYXktNjAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCByb3VuZGVkJywgJ3RyYW5zaXRpb24tY29sb3JzIGR1cmF0aW9uLTIwMCcpLCBcImFyaWEtbGFiZWxcIjogXCJDbGVhciBzZWFyY2hcIiwgY2hpbGRyZW46IF9qc3goWCwgeyBjbGFzc05hbWU6IGljb25TaXplQ2xhc3Nlc1tzaXplXSB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBTZWFyY2hCYXI7XG4iLCIvKipcbiAqIEdyb3VwIGRhdGEgbW9kZWwgaW50ZXJmYWNlc1xuICpcbiAqIFJlcHJlc2VudHMgQWN0aXZlIERpcmVjdG9yeSBhbmQgQXp1cmUgQUQgZ3JvdXBzXG4gKi9cbmV4cG9ydCB2YXIgR3JvdXBUeXBlO1xuKGZ1bmN0aW9uIChHcm91cFR5cGUpIHtcbiAgICBHcm91cFR5cGVbXCJTZWN1cml0eVwiXSA9IFwiU2VjdXJpdHlcIjtcbiAgICBHcm91cFR5cGVbXCJEaXN0cmlidXRpb25cIl0gPSBcIkRpc3RyaWJ1dGlvblwiO1xuICAgIEdyb3VwVHlwZVtcIk1haWxFbmFibGVkXCJdID0gXCJNYWlsRW5hYmxlZFwiO1xuICAgIEdyb3VwVHlwZVtcIk9mZmljZTM2NVwiXSA9IFwiT2ZmaWNlMzY1XCI7XG4gICAgR3JvdXBUeXBlW1wiRHluYW1pY1wiXSA9IFwiRHluYW1pY1wiO1xufSkoR3JvdXBUeXBlIHx8IChHcm91cFR5cGUgPSB7fSkpO1xuZXhwb3J0IHZhciBHcm91cFNjb3BlO1xuKGZ1bmN0aW9uIChHcm91cFNjb3BlKSB7XG4gICAgR3JvdXBTY29wZVtcIlVuaXZlcnNhbFwiXSA9IFwiVW5pdmVyc2FsXCI7XG4gICAgR3JvdXBTY29wZVtcIkdsb2JhbFwiXSA9IFwiR2xvYmFsXCI7XG4gICAgR3JvdXBTY29wZVtcIkRvbWFpbkxvY2FsXCJdID0gXCJEb21haW5Mb2NhbFwiO1xuICAgIEdyb3VwU2NvcGVbXCJOb25lXCJdID0gXCJOb25lXCI7XG59KShHcm91cFNjb3BlIHx8IChHcm91cFNjb3BlID0ge30pKTtcbmV4cG9ydCB2YXIgTWVtYmVyc2hpcFR5cGU7XG4oZnVuY3Rpb24gKE1lbWJlcnNoaXBUeXBlKSB7XG4gICAgTWVtYmVyc2hpcFR5cGVbXCJTdGF0aWNcIl0gPSBcIlN0YXRpY1wiO1xuICAgIE1lbWJlcnNoaXBUeXBlW1wiRHluYW1pY1wiXSA9IFwiRHluYW1pY1wiO1xuICAgIE1lbWJlcnNoaXBUeXBlW1wiUnVsZUJhc2VkXCJdID0gXCJSdWxlQmFzZWRcIjtcbn0pKE1lbWJlcnNoaXBUeXBlIHx8IChNZW1iZXJzaGlwVHlwZSA9IHt9KSk7XG4iLCIvKipcbiAqIEdyb3VwcyBWaWV3IExvZ2ljIEhvb2tcbiAqXG4gKiBCdXNpbmVzcyBsb2dpYyBmb3IgdGhlIEdyb3VwcyBtYW5hZ2VtZW50IHZpZXcuXG4gKiBIYW5kbGVzIGdyb3VwIGxvYWRpbmcsIGZpbHRlcmluZywgc2VhcmNoLCBhbmQgb3BlcmF0aW9ucy5cbiAqIE1pcnJvcnMgQyMgR3JvdXBzVmlld01vZGVsLkxvYWRBc3luYyBwYXR0ZXJuXG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBHcm91cFR5cGUsIEdyb3VwU2NvcGUsIE1lbWJlcnNoaXBUeXBlIH0gZnJvbSAnLi4vdHlwZXMvbW9kZWxzL2dyb3VwJztcbmltcG9ydCB7IHVzZVByb2ZpbGVTdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZVByb2ZpbGVTdG9yZSc7XG5pbXBvcnQgeyB1c2VEZWJvdW5jZSB9IGZyb20gJy4vdXNlRGVib3VuY2UnO1xuZXhwb3J0IGNvbnN0IHVzZUdyb3Vwc1ZpZXdMb2dpYyA9ICgpID0+IHtcbiAgICAvLyBTdGF0ZVxuICAgIGNvbnN0IFtncm91cHMsIHNldEdyb3Vwc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW2lzTG9hZGluZywgc2V0SXNMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0XSA9IHVzZVN0YXRlKCcnKTtcbiAgICBjb25zdCBbc2VsZWN0ZWRHcm91cHMsIHNldFNlbGVjdGVkR3JvdXBzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICBjb25zdCBbbG9hZGluZ01lc3NhZ2UsIHNldExvYWRpbmdNZXNzYWdlXSA9IHVzZVN0YXRlKCcnKTtcbiAgICBjb25zdCBbd2FybmluZ3MsIHNldFdhcm5pbmdzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICAvLyBGaWx0ZXJzXG4gICAgY29uc3QgW2dyb3VwVHlwZUZpbHRlciwgc2V0R3JvdXBUeXBlRmlsdGVyXSA9IHVzZVN0YXRlKCdhbGwnKTtcbiAgICBjb25zdCBbc2NvcGVGaWx0ZXIsIHNldFNjb3BlRmlsdGVyXSA9IHVzZVN0YXRlKCdhbGwnKTtcbiAgICBjb25zdCBbc291cmNlRmlsdGVyLCBzZXRTb3VyY2VGaWx0ZXJdID0gdXNlU3RhdGUoJ2FsbCcpO1xuICAgIC8vIEdldCBjdXJyZW50IHByb2ZpbGUgZnJvbSBzdG9yZVxuICAgIGNvbnN0IHsgZ2V0Q3VycmVudFNvdXJjZVByb2ZpbGUgfSA9IHVzZVByb2ZpbGVTdG9yZSgpO1xuICAgIC8vIERlYm91bmNlZCBzZWFyY2hcbiAgICBjb25zdCBkZWJvdW5jZWRTZWFyY2ggPSB1c2VEZWJvdW5jZShzZWFyY2hUZXh0LCAzMDApO1xuICAgIC8qKlxuICAgICAqIE1hcCBHcm91cER0byBmcm9tIExvZ2ljIEVuZ2luZSB0byBHcm91cERhdGEgZm9yIHRoZSB2aWV3XG4gICAgICovXG4gICAgY29uc3QgbWFwR3JvdXBEdG9Ub0dyb3VwRGF0YSA9IChkdG8pID0+IHtcbiAgICAgICAgLy8gUGFyc2UgZ3JvdXAgdHlwZSBmcm9tIFR5cGUgc3RyaW5nXG4gICAgICAgIGxldCBncm91cFR5cGUgPSBHcm91cFR5cGUuU2VjdXJpdHk7XG4gICAgICAgIGNvbnN0IHR5cGVTdHIgPSAoZHRvLlR5cGUgfHwgJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmICh0eXBlU3RyLmluY2x1ZGVzKCdkaXN0cmlidXRpb24nKSlcbiAgICAgICAgICAgIGdyb3VwVHlwZSA9IEdyb3VwVHlwZS5EaXN0cmlidXRpb247XG4gICAgICAgIGVsc2UgaWYgKHR5cGVTdHIuaW5jbHVkZXMoJ21haWwnKSlcbiAgICAgICAgICAgIGdyb3VwVHlwZSA9IEdyb3VwVHlwZS5NYWlsRW5hYmxlZDtcbiAgICAgICAgZWxzZSBpZiAodHlwZVN0ci5pbmNsdWRlcygnZHluYW1pYycpKVxuICAgICAgICAgICAgZ3JvdXBUeXBlID0gR3JvdXBUeXBlLkR5bmFtaWM7XG4gICAgICAgIC8vIERldGVybWluZSBzb3VyY2UgZnJvbSBEaXNjb3ZlcnlNb2R1bGVcbiAgICAgICAgbGV0IHNvdXJjZSA9ICdBY3RpdmVEaXJlY3RvcnknO1xuICAgICAgICBjb25zdCBkaXNjb3ZlcnlNb2R1bGUgPSBkdG8uRGlzY292ZXJ5TW9kdWxlIHx8ICcnO1xuICAgICAgICBpZiAoZGlzY292ZXJ5TW9kdWxlLmluY2x1ZGVzKCdBenVyZScpKSB7XG4gICAgICAgICAgICBzb3VyY2UgPSAnQXp1cmVBRCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlzY292ZXJ5TW9kdWxlLmluY2x1ZGVzKCdBY3RpdmVEaXJlY3RvcnknKSB8fCBkaXNjb3ZlcnlNb2R1bGUuaW5jbHVkZXMoJ0FEJykpIHtcbiAgICAgICAgICAgIHNvdXJjZSA9ICdBY3RpdmVEaXJlY3RvcnknO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogZHRvLlNpZCB8fCBkdG8uTmFtZSxcbiAgICAgICAgICAgIG9iamVjdElkOiBkdG8uU2lkIHx8ICcnLFxuICAgICAgICAgICAgbmFtZTogZHRvLk5hbWUgfHwgJ1Vua25vd24nLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IGR0by5OYW1lIHx8ICdVbmtub3duJyxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBkdG8uRG4gfHwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgZW1haWw6IHVuZGVmaW5lZCwgLy8gTm90IGF2YWlsYWJsZSBpbiBHcm91cER0b1xuICAgICAgICAgICAgZ3JvdXBUeXBlLFxuICAgICAgICAgICAgc2NvcGU6IEdyb3VwU2NvcGUuVW5pdmVyc2FsLCAvLyBEZWZhdWx0IHNjb3BlXG4gICAgICAgICAgICBtZW1iZXJzaGlwVHlwZTogTWVtYmVyc2hpcFR5cGUuU3RhdGljLCAvLyBEZWZhdWx0IG1lbWJlcnNoaXAgdHlwZVxuICAgICAgICAgICAgbWVtYmVyQ291bnQ6IGR0by5NZW1iZXJzPy5sZW5ndGggfHwgMCxcbiAgICAgICAgICAgIG93bmVyczogZHRvLk1hbmFnZWRCeSA/IFtkdG8uTWFuYWdlZEJ5XSA6IFtdLFxuICAgICAgICAgICAgY3JlYXRlZERhdGU6IGR0by5EaXNjb3ZlcnlUaW1lc3RhbXAgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgbGFzdE1vZGlmaWVkOiBkdG8uRGlzY292ZXJ5VGltZXN0YW1wIHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIHNvdXJjZSxcbiAgICAgICAgICAgIGlzU2VjdXJpdHlFbmFibGVkOiBncm91cFR5cGUgPT09IEdyb3VwVHlwZS5TZWN1cml0eSxcbiAgICAgICAgICAgIGlzTWFpbEVuYWJsZWQ6IGdyb3VwVHlwZSA9PT0gR3JvdXBUeXBlLk1haWxFbmFibGVkLFxuICAgICAgICAgICAgZGlzdGluZ3Vpc2hlZE5hbWU6IGR0by5EbixcbiAgICAgICAgICAgIG1hbmFnZWRCeTogZHRvLk1hbmFnZWRCeSxcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIExvYWQgZ3JvdXBzIGZyb20gTG9naWMgRW5naW5lIChDU1YgZGF0YSlcbiAgICAgKiBSZXBsaWNhdGVzIC9ndWkvIEdyb3Vwc1ZpZXdNb2RlbC5Mb2FkQXN5bmMoKSBwYXR0ZXJuXG4gICAgICovXG4gICAgY29uc3QgbG9hZEdyb3VwcyA9IGFzeW5jIChmb3JjZVJlbG9hZCA9IGZhbHNlKSA9PiB7XG4gICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHNldFdhcm5pbmdzKFtdKTtcbiAgICAgICAgc2V0TG9hZGluZ01lc3NhZ2UoJ0xvYWRpbmcgZ3JvdXBzIGZyb20gTG9naWMgRW5naW5lLi4uJyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW0dyb3Vwc1ZpZXddIExvYWRpbmcgZ3JvdXBzIGZyb20gTG9naWNFbmdpbmUuLi4ke2ZvcmNlUmVsb2FkID8gJyAoZm9yY2UgcmVsb2FkKScgOiAnJ31gKTtcbiAgICAgICAgICAgIC8vIEZvcmNlIHJlbG9hZCBkYXRhIGZyb20gQ1NWIGlmIHJlcXVlc3RlZFxuICAgICAgICAgICAgaWYgKGZvcmNlUmVsb2FkKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tHcm91cHNWaWV3XSBGb3JjaW5nIExvZ2ljRW5naW5lIGRhdGEgcmVsb2FkLi4uJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVsb2FkUmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmludm9rZSgnbG9naWNFbmdpbmU6Zm9yY2VSZWxvYWQnKTtcbiAgICAgICAgICAgICAgICBpZiAoIXJlbG9hZFJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZWxvYWRSZXN1bHQuZXJyb3IgfHwgJ0ZhaWxlZCB0byByZWxvYWQgTG9naWNFbmdpbmUgZGF0YScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0dyb3Vwc1ZpZXddIExvZ2ljRW5naW5lIGRhdGEgcmVsb2FkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBHZXQgZ3JvdXBzIGZyb20gTG9naWMgRW5naW5lXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuaW52b2tlKCdsb2dpY0VuZ2luZTpnZXRBbGxHcm91cHMnKTtcbiAgICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gbG9hZCBncm91cHMgZnJvbSBMb2dpY0VuZ2luZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHJlc3VsdC5kYXRhKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCByZXNwb25zZSBmb3JtYXQgZnJvbSBMb2dpY0VuZ2luZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTWFwIEdyb3VwRHRvW10gdG8gR3JvdXBEYXRhW11cbiAgICAgICAgICAgIGNvbnN0IG1hcHBlZEdyb3VwcyA9IHJlc3VsdC5kYXRhLm1hcChtYXBHcm91cER0b1RvR3JvdXBEYXRhKTtcbiAgICAgICAgICAgIHNldEdyb3VwcyhtYXBwZWRHcm91cHMpO1xuICAgICAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW0dyb3Vwc1ZpZXddIExvYWRlZCAke21hcHBlZEdyb3Vwcy5sZW5ndGh9IGdyb3VwcyBmcm9tIExvZ2ljRW5naW5lYCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0dyb3Vwc1ZpZXddIEZhaWxlZCB0byBsb2FkIGdyb3VwczonLCBlcnIpO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdGYWlsZWQgdG8gbG9hZCBncm91cHMgZnJvbSBMb2dpYyBFbmdpbmUuJyk7XG4gICAgICAgICAgICBzZXRHcm91cHMoW10pOyAvLyBTZXQgZW1wdHkgYXJyYXkgaW5zdGVhZCBvZiBtb2NrIGRhdGFcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgICAgICBzZXRMb2FkaW5nTWVzc2FnZSgnJyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEV4cG9ydCBzZWxlY3RlZCBncm91cHMgdG8gQ1NWXG4gICAgICovXG4gICAgY29uc3QgaGFuZGxlRXhwb3J0ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZXhwb3J0RGF0YSA9IHNlbGVjdGVkR3JvdXBzLmxlbmd0aCA+IDAgPyBzZWxlY3RlZEdyb3VwcyA6IGdyb3VwcztcbiAgICAgICAgICAgIC8vIENvbnZlcnQgdG8gQ1NWXG4gICAgICAgICAgICBjb25zdCBjc3ZDb250ZW50ID0gY29udmVydFRvQ1NWKGV4cG9ydERhdGEpO1xuICAgICAgICAgICAgLy8gU2hvdyBzYXZlIGRpYWxvZ1xuICAgICAgICAgICAgY29uc3QgZmlsZVBhdGggPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuc2hvd1NhdmVEaWFsb2coe1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnRXhwb3J0IEdyb3VwcycsXG4gICAgICAgICAgICAgICAgZGVmYXVsdFBhdGg6IGBncm91cHNfZXhwb3J0XyR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF19LmNzdmAsXG4gICAgICAgICAgICAgICAgZmlsdGVyczogW3sgbmFtZTogJ0NTViBGaWxlcycsIGV4dGVuc2lvbnM6IFsnY3N2J10gfV0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChmaWxlUGF0aCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS53cml0ZUZpbGUoZmlsZVBhdGgsIGNzdkNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdHcm91cHMgZXhwb3J0ZWQgc3VjY2Vzc2Z1bGx5IScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4cG9ydCBmYWlsZWQ6JywgZXJyKTtcbiAgICAgICAgICAgIGFsZXJ0KGBFeHBvcnQgZmFpbGVkOiAke2Vyci5tZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBEZWxldGUgc2VsZWN0ZWQgZ3JvdXBzXG4gICAgICogTm90ZTogRm9yIENTVi1iYXNlZCBkaXNjb3ZlcnkgZGF0YSwgdGhpcyByZW1vdmVzIGl0ZW1zIGZyb20gbG9jYWwgc3RhdGUgb25seS5cbiAgICAgKiBEYXRhIHdpbGwgcmVsb2FkIGZyb20gQ1NWIGZpbGVzIG9uIG5leHQgcmVmcmVzaC5cbiAgICAgKi9cbiAgICBjb25zdCBoYW5kbGVEZWxldGUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmIChzZWxlY3RlZEdyb3Vwcy5sZW5ndGggPT09IDApXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICghY29uZmlybShgUmVtb3ZlICR7c2VsZWN0ZWRHcm91cHMubGVuZ3RofSBncm91cChzKSBmcm9tIHRoZSB2aWV3P1xcblxcbk5vdGU6IFRoaXMgcmVtb3ZlcyBpdGVtcyBmcm9tIHRoZSBjdXJyZW50IHZpZXcgb25seS4gRGF0YSB3aWxsIHJlbG9hZCBmcm9tIENTViBmaWxlcyBvbiBuZXh0IHJlZnJlc2guYCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gR2V0IElEcyBvZiBncm91cHMgdG8gcmVtb3ZlXG4gICAgICAgICAgICBjb25zdCBpZHNUb1JlbW92ZSA9IG5ldyBTZXQoc2VsZWN0ZWRHcm91cHMubWFwKGcgPT4gZy5pZCkpO1xuICAgICAgICAgICAgLy8gUmVtb3ZlIGZyb20gbG9jYWwgc3RhdGVcbiAgICAgICAgICAgIHNldEdyb3VwcygocHJldkdyb3VwcykgPT4gcHJldkdyb3Vwcy5maWx0ZXIoKGcpID0+ICFpZHNUb1JlbW92ZS5oYXMoZy5pZCkpKTtcbiAgICAgICAgICAgIHNldFNlbGVjdGVkR3JvdXBzKFtdKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbR3JvdXBzVmlld10gUmVtb3ZlZCAke3NlbGVjdGVkR3JvdXBzLmxlbmd0aH0gZ3JvdXBzIGZyb20gdmlld2ApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tHcm91cHNWaWV3XSBEZWxldGUgZmFpbGVkOicsIGVycik7XG4gICAgICAgICAgICBzZXRFcnJvcihgRmFpbGVkIHRvIHJlbW92ZSBncm91cHMgZnJvbSB2aWV3OiAke2Vyci5tZXNzYWdlfWApO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBWaWV3IGdyb3VwIG1lbWJlcnNcbiAgICAgKiBPcGVucyBHcm91cE1lbWJlcnNNb2RhbFxuICAgICAqL1xuICAgIGNvbnN0IGhhbmRsZVZpZXdNZW1iZXJzID0gKGdyb3VwKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbR3JvdXBzVmlld10gT3BlbmluZyBtZW1iZXJzIG1vZGFsIGZvciBncm91cDonLCBncm91cC5uYW1lKTtcbiAgICAgICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IGFuZCByZW5kZXIgR3JvdXBNZW1iZXJzTW9kYWxcbiAgICAgICAgaW1wb3J0KCcuLi9jb21wb25lbnRzL2RpYWxvZ3MvR3JvdXBNZW1iZXJzTW9kYWwnKS50aGVuKCh7IEdyb3VwTWVtYmVyc01vZGFsIH0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHsgb3Blbk1vZGFsLCB1cGRhdGVNb2RhbCB9ID0gcmVxdWlyZSgnLi4vc3RvcmUvdXNlTW9kYWxTdG9yZScpLnVzZU1vZGFsU3RvcmUuZ2V0U3RhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IG1vZGFsSWQgPSBvcGVuTW9kYWwoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdjdXN0b20nLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBgTWVtYmVycyBvZiAke2dyb3VwLm5hbWV9YCxcbiAgICAgICAgICAgICAgICBjb21wb25lbnQ6IEdyb3VwTWVtYmVyc01vZGFsLFxuICAgICAgICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsSWQ6ICcnLCAvLyBXaWxsIGJlIHVwZGF0ZWQgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBJZDogZ3JvdXAuaWQsXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwTmFtZTogZ3JvdXAubmFtZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNpemU6ICd4bCcsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBtb2RhbCBwcm9wcyB3aXRoIGFjdHVhbCBtb2RhbElkXG4gICAgICAgICAgICB1cGRhdGVNb2RhbChtb2RhbElkLCB7XG4gICAgICAgICAgICAgICAgcHJvcHM6IHtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWxJZCxcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBJZDogZ3JvdXAuaWQsXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwTmFtZTogZ3JvdXAubmFtZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVmcmVzaCBncm91cHMgbGlzdFxuICAgICAqIEZvcmNlcyByZWxvYWQgb2YgZGF0YSBmcm9tIENTViBmaWxlc1xuICAgICAqL1xuICAgIGNvbnN0IGhhbmRsZVJlZnJlc2ggPSAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbR3JvdXBzVmlld10gUmVmcmVzaCBidXR0b24gY2xpY2tlZCwgZm9yY2luZyBkYXRhIHJlbG9hZCcpO1xuICAgICAgICBsb2FkR3JvdXBzKHRydWUpOyAvLyBQYXNzIHRydWUgdG8gZm9yY2UgcmVsb2FkXG4gICAgfTtcbiAgICAvLyBTdWJzY3JpYmUgdG8gc2VsZWN0ZWQgc291cmNlIHByb2ZpbGUgY2hhbmdlc1xuICAgIGNvbnN0IHNlbGVjdGVkU291cmNlUHJvZmlsZSA9IHVzZVByb2ZpbGVTdG9yZSgoc3RhdGUpID0+IHN0YXRlLnNlbGVjdGVkU291cmNlUHJvZmlsZSk7XG4gICAgLy8gTG9hZCBncm91cHMgb24gbW91bnQgYW5kIHdoZW4gcHJvZmlsZSBjaGFuZ2VzXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEdyb3VwcygpO1xuICAgIH0sIFtzZWxlY3RlZFNvdXJjZVByb2ZpbGVdKTsgLy8gUmVsb2FkIHdoZW4gcHJvZmlsZSBjaGFuZ2VzXG4gICAgLy8gU3Vic2NyaWJlIHRvIGZpbGUgY2hhbmdlIGV2ZW50cyBmb3IgYXV0by1yZWZyZXNoXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgaGFuZGxlRGF0YVJlZnJlc2ggPSAoZGF0YVR5cGUpID0+IHtcbiAgICAgICAgICAgIGlmICgoZGF0YVR5cGUgPT09ICdHcm91cHMnIHx8IGRhdGFUeXBlID09PSAnQWxsJykgJiYgIWlzTG9hZGluZykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbR3JvdXBzVmlld10gQXV0by1yZWZyZXNoaW5nIGR1ZSB0byBmaWxlIGNoYW5nZXMnKTtcbiAgICAgICAgICAgICAgICBsb2FkR3JvdXBzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vIFRPRE86IFN1YnNjcmliZSB0byBmaWxlIHdhdGNoZXIgZXZlbnRzIHdoZW4gYXZhaWxhYmxlXG4gICAgICAgIC8vIHdpbmRvdy5lbGVjdHJvbkFQSS5vbignZmlsZXdhdGNoZXI6ZGF0YUNoYW5nZWQnLCBoYW5kbGVEYXRhUmVmcmVzaCk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAvLyBUT0RPOiBDbGVhbnVwIHN1YnNjcmlwdGlvblxuICAgICAgICAgICAgLy8gd2luZG93LmVsZWN0cm9uQVBJLm9mZignZmlsZXdhdGNoZXI6ZGF0YUNoYW5nZWQnLCBoYW5kbGVEYXRhUmVmcmVzaCk7XG4gICAgICAgIH07XG4gICAgfSwgW2lzTG9hZGluZ10pO1xuICAgIC8qKlxuICAgICAqIEZpbHRlcmVkIGdyb3VwcyBiYXNlZCBvbiBzZWFyY2ggYW5kIGZpbHRlcnNcbiAgICAgKi9cbiAgICBjb25zdCBmaWx0ZXJlZEdyb3VwcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gWy4uLmdyb3Vwc107XG4gICAgICAgIC8vIEFwcGx5IHNlYXJjaCBmaWx0ZXJcbiAgICAgICAgaWYgKGRlYm91bmNlZFNlYXJjaCkge1xuICAgICAgICAgICAgY29uc3Qgc2VhcmNoTG93ZXIgPSBkZWJvdW5jZWRTZWFyY2gudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGcpID0+IChnLm5hbWUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpIHx8XG4gICAgICAgICAgICAgICAgKGcuZGlzcGxheU5hbWUgPz8gJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpIHx8XG4gICAgICAgICAgICAgICAgZy5kZXNjcmlwdGlvbj8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcikgfHxcbiAgICAgICAgICAgICAgICBnLmVtYWlsPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXBwbHkgZ3JvdXAgdHlwZSBmaWx0ZXJcbiAgICAgICAgaWYgKGdyb3VwVHlwZUZpbHRlciAhPT0gJ2FsbCcpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGcpID0+IGcuZ3JvdXBUeXBlID09PSBncm91cFR5cGVGaWx0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFwcGx5IHNjb3BlIGZpbHRlclxuICAgICAgICBpZiAoc2NvcGVGaWx0ZXIgIT09ICdhbGwnKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChnKSA9PiBnLnNjb3BlID09PSBzY29wZUZpbHRlcik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXBwbHkgc291cmNlIGZpbHRlclxuICAgICAgICBpZiAoc291cmNlRmlsdGVyICE9PSAnYWxsJykge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoZykgPT4gZy5zb3VyY2UgPT09IHNvdXJjZUZpbHRlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZ3JvdXBzLCBkZWJvdW5jZWRTZWFyY2gsIGdyb3VwVHlwZUZpbHRlciwgc2NvcGVGaWx0ZXIsIHNvdXJjZUZpbHRlcl0pO1xuICAgIC8qKlxuICAgICAqIENvbHVtbiBkZWZpbml0aW9ucyBmb3IgQUcgR3JpZFxuICAgICAqIFVwZGF0ZWQgZm9yIEVwaWMgMSBUYXNrIDEuNCAtIEFkZGVkIFZpZXcgRGV0YWlscyBhY3Rpb25cbiAgICAgKi9cbiAgICBjb25zdCBjb2x1bW5EZWZzID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnbmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnR3JvdXAgTmFtZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIGZsZXg6IDIsXG4gICAgICAgICAgICBjaGVja2JveFNlbGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGhlYWRlckNoZWNrYm94U2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2Rpc3BsYXlOYW1lJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdEaXNwbGF5IE5hbWUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBmbGV4OiAyLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2dyb3VwVHlwZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnVHlwZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnc2NvcGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1Njb3BlJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEzMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdtZW1iZXJDb3VudCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnTWVtYmVycycsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogJ2FnTnVtYmVyQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHdpZHRoOiAxMjAsXG4gICAgICAgICAgICB0eXBlOiAnbnVtZXJpY0NvbHVtbicsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnc291cmNlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTb3VyY2UnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTMwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2VtYWlsJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdFbWFpbCcsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIGZsZXg6IDIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnY3JlYXRlZERhdGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0NyZWF0ZWQnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ0RhdGVDb2x1bW5GaWx0ZXInLFxuICAgICAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgICAgIHZhbHVlRm9ybWF0dGVyOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwYXJhbXMudmFsdWUpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUocGFyYW1zLnZhbHVlKS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgXSwgW10pO1xuICAgIC8qKlxuICAgICAqIENvbnZlcnQgZ3JvdXBzIHRvIENTViBmb3JtYXRcbiAgICAgKi9cbiAgICBjb25zdCBjb252ZXJ0VG9DU1YgPSAoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCBoZWFkZXJzID0gW1xuICAgICAgICAgICAgJ05hbWUnLFxuICAgICAgICAgICAgJ0Rpc3BsYXkgTmFtZScsXG4gICAgICAgICAgICAnVHlwZScsXG4gICAgICAgICAgICAnU2NvcGUnLFxuICAgICAgICAgICAgJ01lbWJlcnMnLFxuICAgICAgICAgICAgJ1NvdXJjZScsXG4gICAgICAgICAgICAnRW1haWwnLFxuICAgICAgICAgICAgJ0Rlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICdDcmVhdGVkIERhdGUnLFxuICAgICAgICBdO1xuICAgICAgICBjb25zdCByb3dzID0gKGRhdGEgPz8gW10pLm1hcCgoZykgPT4gW1xuICAgICAgICAgICAgZy5uYW1lLFxuICAgICAgICAgICAgZy5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgIGcuZ3JvdXBUeXBlLFxuICAgICAgICAgICAgZy5zY29wZSxcbiAgICAgICAgICAgIGcubWVtYmVyQ291bnQudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGcuc291cmNlLFxuICAgICAgICAgICAgZy5lbWFpbCB8fCAnJyxcbiAgICAgICAgICAgIGcuZGVzY3JpcHRpb24gfHwgJycsXG4gICAgICAgICAgICBnLmNyZWF0ZWREYXRlLFxuICAgICAgICBdKTtcbiAgICAgICAgY29uc3QgY3N2Um93cyA9IFtoZWFkZXJzLCAuLi5yb3dzXS5tYXAoKHJvdykgPT4gcm93Lm1hcCgoY2VsbCkgPT4gYFwiJHtjZWxsLnJlcGxhY2UoL1wiL2csICdcIlwiJyl9XCJgKS5qb2luKCcsJykpO1xuICAgICAgICByZXR1cm4gY3N2Um93cy5qb2luKCdcXG4nKTtcbiAgICB9O1xuICAgIHJldHVybiB7XG4gICAgICAgIGdyb3VwczogZmlsdGVyZWRHcm91cHMsXG4gICAgICAgIGlzTG9hZGluZyxcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIHNlYXJjaFRleHQsXG4gICAgICAgIHNldFNlYXJjaFRleHQsXG4gICAgICAgIHNlbGVjdGVkR3JvdXBzLFxuICAgICAgICBzZXRTZWxlY3RlZEdyb3VwcyxcbiAgICAgICAgZ3JvdXBUeXBlRmlsdGVyLFxuICAgICAgICBzZXRHcm91cFR5cGVGaWx0ZXIsXG4gICAgICAgIHNjb3BlRmlsdGVyLFxuICAgICAgICBzZXRTY29wZUZpbHRlcixcbiAgICAgICAgc291cmNlRmlsdGVyLFxuICAgICAgICBzZXRTb3VyY2VGaWx0ZXIsXG4gICAgICAgIGNvbHVtbkRlZnMsXG4gICAgICAgIGhhbmRsZUV4cG9ydCxcbiAgICAgICAgaGFuZGxlRGVsZXRlLFxuICAgICAgICBoYW5kbGVWaWV3TWVtYmVycyxcbiAgICAgICAgaGFuZGxlUmVmcmVzaCxcbiAgICAgICAgdG90YWxHcm91cHM6IGdyb3Vwcy5sZW5ndGgsXG4gICAgICAgIGZpbHRlcmVkQ291bnQ6IGZpbHRlcmVkR3JvdXBzLmxlbmd0aCxcbiAgICAgICAgbG9hZGluZ01lc3NhZ2UsXG4gICAgICAgIHdhcm5pbmdzLFxuICAgIH07XG59O1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogRmlsdGVyUGFuZWwgQ29tcG9uZW50XG4gKlxuICogQ29sbGFwc2libGUgcGFuZWwgY29udGFpbmluZyBtdWx0aXBsZSBmaWx0ZXIgaW5wdXRzLlxuICogVXNlZCBmb3IgYWR2YW5jZWQgZmlsdGVyaW5nIGluIGRhdGEgdmlld3MuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IENoZXZyb25Eb3duLCBDaGV2cm9uVXAsIFggfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vYXRvbXMvQnV0dG9uJztcbi8qKlxuICogRmlsdGVyUGFuZWwgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBGaWx0ZXJQYW5lbCA9ICh7IGZpbHRlcnMsIG9uRmlsdGVyQ2hhbmdlLCBvblJlc2V0LCBkZWZhdWx0Q29sbGFwc2VkID0gZmFsc2UsIHRpdGxlID0gJ0ZpbHRlcnMnLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgY29uc3QgW2lzQ29sbGFwc2VkLCBzZXRJc0NvbGxhcHNlZF0gPSB1c2VTdGF0ZShkZWZhdWx0Q29sbGFwc2VkKTtcbiAgICBjb25zdCBoYW5kbGVGaWx0ZXJDaGFuZ2UgPSAoZmlsdGVySWQsIHZhbHVlKSA9PiB7XG4gICAgICAgIGlmIChvbkZpbHRlckNoYW5nZSkge1xuICAgICAgICAgICAgb25GaWx0ZXJDaGFuZ2UoZmlsdGVySWQsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlUmVzZXQgPSAoKSA9PiB7XG4gICAgICAgIGlmIChvblJlc2V0KSB7XG4gICAgICAgICAgICBvblJlc2V0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IHRvZ2dsZUNvbGxhcHNlID0gKCkgPT4ge1xuICAgICAgICBzZXRJc0NvbGxhcHNlZCghaXNDb2xsYXBzZWQpO1xuICAgIH07XG4gICAgLy8gQ2hlY2sgaWYgYW55IGZpbHRlcnMgaGF2ZSB2YWx1ZXNcbiAgICBjb25zdCBoYXNBY3RpdmVGaWx0ZXJzID0gZmlsdGVycy5zb21lKGYgPT4ge1xuICAgICAgICBpZiAoZi50eXBlID09PSAnY2hlY2tib3gnKVxuICAgICAgICAgICAgcmV0dXJuIGYudmFsdWUgPT09IHRydWU7XG4gICAgICAgIHJldHVybiBmLnZhbHVlICE9PSB1bmRlZmluZWQgJiYgZi52YWx1ZSAhPT0gJycgJiYgZi52YWx1ZSAhPT0gbnVsbDtcbiAgICB9KTtcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgnYm9yZGVyIGJvcmRlci1ncmF5LTMwMCByb3VuZGVkLWxnIGJnLXdoaXRlIHNoYWRvdy1zbScsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHgtNCBweS0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogdG9nZ2xlQ29sbGFwc2UsIGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1ncmF5LTcwMCBob3Zlcjp0ZXh0LWdyYXktOTAwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCByb3VuZGVkXCIsIGNoaWxkcmVuOiBbX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogdGl0bGUgfSksIGhhc0FjdGl2ZUZpbHRlcnMgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB3LTUgaC01IHRleHQteHMgZm9udC1tZWRpdW0gdGV4dC13aGl0ZSBiZy1ibHVlLTUwMCByb3VuZGVkLWZ1bGxcIiwgY2hpbGRyZW46IGZpbHRlcnMuZmlsdGVyKGYgPT4gZi52YWx1ZSkubGVuZ3RoIH0pKSwgaXNDb2xsYXBzZWQgPyAoX2pzeChDaGV2cm9uRG93biwgeyBjbGFzc05hbWU6IFwiaC00IHctNFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSA6IChfanN4KENoZXZyb25VcCwgeyBjbGFzc05hbWU6IFwiaC00IHctNFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKV0gfSksIGhhc0FjdGl2ZUZpbHRlcnMgJiYgIWlzQ29sbGFwc2VkICYmIChfanN4KEJ1dHRvbiwgeyB2YXJpYW50OiBcImdob3N0XCIsIHNpemU6IFwic21cIiwgb25DbGljazogaGFuZGxlUmVzZXQsIGljb246IF9qc3goWCwgeyBjbGFzc05hbWU6IFwiaC00IHctNFwiIH0pLCBcImRhdGEtY3lcIjogXCJmaWx0ZXItcmVzZXRcIiwgY2hpbGRyZW46IFwiUmVzZXRcIiB9KSldIH0pLCAhaXNDb2xsYXBzZWQgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwicC00IHNwYWNlLXktNFwiLCBjaGlsZHJlbjogZmlsdGVycy5tYXAoKGZpbHRlcikgPT4gKF9qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwibGFiZWxcIiwgeyBodG1sRm9yOiBmaWx0ZXIuaWQsIGNsYXNzTmFtZTogXCJibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZ3JheS03MDAgbWItMVwiLCBjaGlsZHJlbjogZmlsdGVyLmxhYmVsIH0pLCBmaWx0ZXIudHlwZSA9PT0gJ3RleHQnICYmIChfanN4KFwiaW5wdXRcIiwgeyBpZDogZmlsdGVyLmlkLCB0eXBlOiBcInRleHRcIiwgdmFsdWU6IGZpbHRlci52YWx1ZSB8fCAnJywgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVGaWx0ZXJDaGFuZ2UoZmlsdGVyLmlkLCBlLnRhcmdldC52YWx1ZSksIHBsYWNlaG9sZGVyOiBmaWx0ZXIucGxhY2Vob2xkZXIsIGNsYXNzTmFtZTogXCJibG9jayB3LWZ1bGwgcm91bmRlZC1tZCBib3JkZXIgYm9yZGVyLWdyYXktMzAwIHB4LTMgcHktMiB0ZXh0LXNtIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCBmb2N1czpib3JkZXItYmx1ZS01MDBcIiwgXCJkYXRhLWN5XCI6IGBmaWx0ZXItJHtmaWx0ZXIuaWR9YCB9KSksIGZpbHRlci50eXBlID09PSAnc2VsZWN0JyAmJiAoX2pzeHMoXCJzZWxlY3RcIiwgeyBpZDogZmlsdGVyLmlkLCB2YWx1ZTogZmlsdGVyLnZhbHVlIHx8ICcnLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZUZpbHRlckNoYW5nZShmaWx0ZXIuaWQsIGUudGFyZ2V0LnZhbHVlKSwgY2xhc3NOYW1lOiBcImJsb2NrIHctZnVsbCByb3VuZGVkLW1kIGJvcmRlciBib3JkZXItZ3JheS0zMDAgcHgtMyBweS0yIHRleHQtc20gZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLWJsdWUtNTAwIGZvY3VzOmJvcmRlci1ibHVlLTUwMFwiLCBcImRhdGEtY3lcIjogYGZpbHRlci0ke2ZpbHRlci5pZH1gLCBjaGlsZHJlbjogW19qc3goXCJvcHRpb25cIiwgeyB2YWx1ZTogXCJcIiwgY2hpbGRyZW46IFwiQWxsXCIgfSksIGZpbHRlci5vcHRpb25zPy5tYXAoKG9wdGlvbikgPT4gKF9qc3goXCJvcHRpb25cIiwgeyB2YWx1ZTogb3B0aW9uLnZhbHVlLCBjaGlsZHJlbjogb3B0aW9uLmxhYmVsIH0sIG9wdGlvbi52YWx1ZSkpKV0gfSkpLCBmaWx0ZXIudHlwZSA9PT0gJ2RhdGUnICYmIChfanN4KFwiaW5wdXRcIiwgeyBpZDogZmlsdGVyLmlkLCB0eXBlOiBcImRhdGVcIiwgdmFsdWU6IGZpbHRlci52YWx1ZSB8fCAnJywgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVGaWx0ZXJDaGFuZ2UoZmlsdGVyLmlkLCBlLnRhcmdldC52YWx1ZSksIGNsYXNzTmFtZTogXCJibG9jayB3LWZ1bGwgcm91bmRlZC1tZCBib3JkZXIgYm9yZGVyLWdyYXktMzAwIHB4LTMgcHktMiB0ZXh0LXNtIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCBmb2N1czpib3JkZXItYmx1ZS01MDBcIiwgXCJkYXRhLWN5XCI6IGBmaWx0ZXItJHtmaWx0ZXIuaWR9YCB9KSksIGZpbHRlci50eXBlID09PSAnY2hlY2tib3gnICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IGlkOiBmaWx0ZXIuaWQsIHR5cGU6IFwiY2hlY2tib3hcIiwgY2hlY2tlZDogZmlsdGVyLnZhbHVlIHx8IGZhbHNlLCBvbkNoYW5nZTogKGUpID0+IGhhbmRsZUZpbHRlckNoYW5nZShmaWx0ZXIuaWQsIGUudGFyZ2V0LmNoZWNrZWQpLCBjbGFzc05hbWU6IFwiaC00IHctNCByb3VuZGVkIGJvcmRlci1ncmF5LTMwMCB0ZXh0LWJsdWUtNjAwIGZvY3VzOnJpbmctYmx1ZS01MDBcIiwgXCJkYXRhLWN5XCI6IGBmaWx0ZXItJHtmaWx0ZXIuaWR9YCB9KSwgX2pzeChcImxhYmVsXCIsIHsgaHRtbEZvcjogZmlsdGVyLmlkLCBjbGFzc05hbWU6IFwibWwtMiB0ZXh0LXNtIHRleHQtZ3JheS02MDBcIiwgY2hpbGRyZW46IGZpbHRlci5wbGFjZWhvbGRlciB8fCAnRW5hYmxlJyB9KV0gfSkpXSB9LCBmaWx0ZXIuaWQpKSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgRmlsdGVyUGFuZWw7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBHcm91cHMgVmlld1xuICpcbiAqIE1haW4gdmlldyBmb3IgbWFuYWdpbmcgQWN0aXZlIERpcmVjdG9yeSBhbmQgQXp1cmUgQUQgZ3JvdXBzLlxuICogRmVhdHVyZXM6IHNlYXJjaCwgZmlsdGVyLCBleHBvcnQsIGRlbGV0ZSwgdmlldyBtZW1iZXJzLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZU5hdmlnYXRlIH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSc7XG5pbXBvcnQgeyB1c2VEcmFnIH0gZnJvbSAncmVhY3QtZG5kJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IERvd25sb2FkLCBUcmFzaDIsIFJlZnJlc2hDdywgUGx1cywgRXllLCBHcmlwVmVydGljYWwgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuaW1wb3J0IHsgdXNlR3JvdXBzVmlld0xvZ2ljIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlR3JvdXBzVmlld0xvZ2ljJztcbmltcG9ydCB7IFZpcnR1YWxpemVkRGF0YUdyaWQgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkJztcbmltcG9ydCB7IFNlYXJjaEJhciB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbW9sZWN1bGVzL1NlYXJjaEJhcic7XG5pbXBvcnQgeyBGaWx0ZXJQYW5lbCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbW9sZWN1bGVzL0ZpbHRlclBhbmVsJztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQnV0dG9uJztcbmltcG9ydCB7IEJhZGdlIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9hdG9tcy9CYWRnZSc7XG5pbXBvcnQgeyBHcm91cFR5cGUsIEdyb3VwU2NvcGUgfSBmcm9tICcuLi8uLi90eXBlcy9tb2RlbHMvZ3JvdXAnO1xuLyoqXG4gKiBEcmFnZ2FibGUgY2VsbCBjb21wb25lbnQgZm9yIGRyYWcgaGFuZGxlXG4gKi9cbmNvbnN0IERyYWdIYW5kbGVDZWxsID0gKHsgZGF0YSB9KSA9PiB7XG4gICAgY29uc3QgW3sgaXNEcmFnZ2luZyB9LCBkcmFnXSA9IHVzZURyYWcoe1xuICAgICAgICB0eXBlOiAnR1JPVVAnLFxuICAgICAgICBpdGVtOiAoKSA9PiAoe1xuICAgICAgICAgICAgaWQ6IGRhdGEuaWQgfHwgZGF0YS5vYmplY3RJZCB8fCAnJyxcbiAgICAgICAgICAgIHR5cGU6ICdHUk9VUCcsXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICB9KSxcbiAgICAgICAgY29sbGVjdDogKG1vbml0b3IpID0+ICh7XG4gICAgICAgICAgICBpc0RyYWdnaW5nOiBtb25pdG9yLmlzRHJhZ2dpbmcoKSxcbiAgICAgICAgfSksXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4KFwiZGl2XCIsIHsgcmVmOiBkcmFnLCBjbGFzc05hbWU6IGNsc3goJ2ZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGN1cnNvci1tb3ZlIGgtZnVsbCcsIGlzRHJhZ2dpbmcgJiYgJ29wYWNpdHktNTAnKSwgdGl0bGU6IFwiRHJhZyB0byBhZGQgdG8gbWlncmF0aW9uIHdhdmVcIiwgXCJkYXRhLWN5XCI6IFwiZ3JvdXAtZHJhZy1oYW5kbGVcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImdyb3VwLWRyYWctaGFuZGxlXCIsIGNoaWxkcmVuOiBfanN4KEdyaXBWZXJ0aWNhbCwgeyBzaXplOiAxNiwgY2xhc3NOYW1lOiBcInRleHQtZ3JheS00MDAgaG92ZXI6dGV4dC1ncmF5LTYwMCBkYXJrOmhvdmVyOnRleHQtZ3JheS0zMDBcIiB9KSB9KSk7XG59O1xuLyoqXG4gKiBHcm91cHNWaWV3IENvbXBvbmVudFxuICogVXBkYXRlZCBmb3IgRXBpYyAxIFRhc2sgMS40IC0gQWRkZWQgVmlldyBEZXRhaWxzIG5hdmlnYXRpb25cbiAqL1xuZXhwb3J0IGNvbnN0IEdyb3Vwc1ZpZXcgPSAoKSA9PiB7XG4gICAgY29uc3QgbmF2aWdhdGUgPSB1c2VOYXZpZ2F0ZSgpO1xuICAgIGNvbnN0IHsgZ3JvdXBzLCBpc0xvYWRpbmcsIGVycm9yLCBzZWFyY2hUZXh0LCBzZXRTZWFyY2hUZXh0LCBzZWxlY3RlZEdyb3Vwcywgc2V0U2VsZWN0ZWRHcm91cHMsIGdyb3VwVHlwZUZpbHRlciwgc2V0R3JvdXBUeXBlRmlsdGVyLCBzY29wZUZpbHRlciwgc2V0U2NvcGVGaWx0ZXIsIHNvdXJjZUZpbHRlciwgc2V0U291cmNlRmlsdGVyLCBjb2x1bW5EZWZzLCBoYW5kbGVFeHBvcnQsIGhhbmRsZURlbGV0ZSwgaGFuZGxlUmVmcmVzaCwgdG90YWxHcm91cHMsIGZpbHRlcmVkQ291bnQsIH0gPSB1c2VHcm91cHNWaWV3TG9naWMoKTtcbiAgICAvLyBIYW5kbGVyIGZvciB2aWV3aW5nIGdyb3VwIGRldGFpbHNcbiAgICBjb25zdCBoYW5kbGVWaWV3RGV0YWlscyA9IChncm91cCkgPT4ge1xuICAgICAgICBuYXZpZ2F0ZShgL2dyb3Vwcy8ke2dyb3VwLmlkfWApO1xuICAgIH07XG4gICAgLy8gRXh0ZW5kZWQgY29sdW1uIGRlZmluaXRpb25zIHdpdGggZHJhZyBoYW5kbGUgYW5kIFZpZXcgRGV0YWlscyBhY3Rpb25cbiAgICBjb25zdCBleHRlbmRlZENvbHVtbkRlZnMgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJycsXG4gICAgICAgICAgICB3aWR0aDogNTAsXG4gICAgICAgICAgICBwaW5uZWQ6ICdsZWZ0JyxcbiAgICAgICAgICAgIHN1cHByZXNzTWVudTogdHJ1ZSxcbiAgICAgICAgICAgIHNvcnRhYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGZpbHRlcjogZmFsc2UsXG4gICAgICAgICAgICByZXNpemFibGU6IGZhbHNlLFxuICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiAocGFyYW1zKSA9PiBfanN4KERyYWdIYW5kbGVDZWxsLCB7IGRhdGE6IHBhcmFtcy5kYXRhIH0pLFxuICAgICAgICB9LFxuICAgICAgICAuLi5jb2x1bW5EZWZzLFxuICAgICAgICB7XG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnQWN0aW9ucycsXG4gICAgICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICAgICAgcGlubmVkOiAncmlnaHQnLFxuICAgICAgICAgICAgY2VsbFJlbmRlcmVyOiAocGFyYW1zKSA9PiAoX2pzeHMoQnV0dG9uLCB7IG9uQ2xpY2s6ICgpID0+IGhhbmRsZVZpZXdEZXRhaWxzKHBhcmFtcy5kYXRhKSwgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgc2l6ZTogXCJzbVwiLCBcImRhdGEtY3lcIjogXCJ2aWV3LWdyb3VwLWRldGFpbHNcIiwgXCJkYXRhLXRlc3RpZFwiOiBcInZpZXctZ3JvdXAtZGV0YWlsc1wiLCBjaGlsZHJlbjogW19qc3goRXllLCB7IGNsYXNzTmFtZTogXCJtci0xIGgtMyB3LTNcIiB9KSwgXCJWaWV3IERldGFpbHNcIl0gfSkpLFxuICAgICAgICB9LFxuICAgIF0sIFtjb2x1bW5EZWZzXSk7XG4gICAgLy8gRmlsdGVyIGNvbmZpZ3VyYXRpb25cbiAgICBjb25zdCBmaWx0ZXJzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ2dyb3VwVHlwZScsXG4gICAgICAgICAgICBsYWJlbDogJ0dyb3VwIFR5cGUnLFxuICAgICAgICAgICAgdHlwZTogJ3NlbGVjdCcsXG4gICAgICAgICAgICB2YWx1ZTogZ3JvdXBUeXBlRmlsdGVyLFxuICAgICAgICAgICAgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdhbGwnLCBsYWJlbDogJ0FsbCBUeXBlcycgfSxcbiAgICAgICAgICAgICAgICB7IHZhbHVlOiBHcm91cFR5cGUuU2VjdXJpdHksIGxhYmVsOiAnU2VjdXJpdHknIH0sXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogR3JvdXBUeXBlLkRpc3RyaWJ1dGlvbiwgbGFiZWw6ICdEaXN0cmlidXRpb24nIH0sXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogR3JvdXBUeXBlLk1haWxFbmFibGVkLCBsYWJlbDogJ01haWwtRW5hYmxlZCcgfSxcbiAgICAgICAgICAgICAgICB7IHZhbHVlOiBHcm91cFR5cGUuT2ZmaWNlMzY1LCBsYWJlbDogJ09mZmljZSAzNjUnIH0sXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogR3JvdXBUeXBlLkR5bmFtaWMsIGxhYmVsOiAnRHluYW1pYycgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAnc2NvcGUnLFxuICAgICAgICAgICAgbGFiZWw6ICdTY29wZScsXG4gICAgICAgICAgICB0eXBlOiAnc2VsZWN0JyxcbiAgICAgICAgICAgIHZhbHVlOiBzY29wZUZpbHRlcixcbiAgICAgICAgICAgIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICB7IHZhbHVlOiAnYWxsJywgbGFiZWw6ICdBbGwgU2NvcGVzJyB9LFxuICAgICAgICAgICAgICAgIHsgdmFsdWU6IEdyb3VwU2NvcGUuVW5pdmVyc2FsLCBsYWJlbDogJ1VuaXZlcnNhbCcgfSxcbiAgICAgICAgICAgICAgICB7IHZhbHVlOiBHcm91cFNjb3BlLkdsb2JhbCwgbGFiZWw6ICdHbG9iYWwnIH0sXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogR3JvdXBTY29wZS5Eb21haW5Mb2NhbCwgbGFiZWw6ICdEb21haW4gTG9jYWwnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ3NvdXJjZScsXG4gICAgICAgICAgICBsYWJlbDogJ1NvdXJjZScsXG4gICAgICAgICAgICB0eXBlOiAnc2VsZWN0JyxcbiAgICAgICAgICAgIHZhbHVlOiBzb3VyY2VGaWx0ZXIsXG4gICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogJ2FsbCcsIGxhYmVsOiAnQWxsIFNvdXJjZXMnIH0sXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0FjdGl2ZURpcmVjdG9yeScsIGxhYmVsOiAnQWN0aXZlIERpcmVjdG9yeScgfSxcbiAgICAgICAgICAgICAgICB7IHZhbHVlOiAnQXp1cmVBRCcsIGxhYmVsOiAnQXp1cmUgQUQnIH0sXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0h5YnJpZCcsIGxhYmVsOiAnSHlicmlkJyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICBdO1xuICAgIGNvbnN0IGhhbmRsZUZpbHRlckNoYW5nZSA9IChmaWx0ZXJJZCwgdmFsdWUpID0+IHtcbiAgICAgICAgc3dpdGNoIChmaWx0ZXJJZCkge1xuICAgICAgICAgICAgY2FzZSAnZ3JvdXBUeXBlJzpcbiAgICAgICAgICAgICAgICBzZXRHcm91cFR5cGVGaWx0ZXIodmFsdWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc2NvcGUnOlxuICAgICAgICAgICAgICAgIHNldFNjb3BlRmlsdGVyKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3NvdXJjZSc6XG4gICAgICAgICAgICAgICAgc2V0U291cmNlRmlsdGVyKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlUmVzZXRGaWx0ZXJzID0gKCkgPT4ge1xuICAgICAgICBzZXRHcm91cFR5cGVGaWx0ZXIoJ2FsbCcpO1xuICAgICAgICBzZXRTY29wZUZpbHRlcignYWxsJyk7XG4gICAgICAgIHNldFNvdXJjZUZpbHRlcignYWxsJyk7XG4gICAgICAgIHNldFNlYXJjaFRleHQoJycpO1xuICAgIH07XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgZmxleCBmbGV4LWNvbCBiZy1ncmF5LTUwIGRhcms6YmctZ3JheS05MDBcIiwgXCJkYXRhLWN5XCI6IFwiZ3JvdXBzLXZpZXdcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImdyb3Vwcy12aWV3XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTRcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDFcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LWdyYXktMTAwXCIsIGNoaWxkcmVuOiBcIkdyb3Vwc1wiIH0pLCBfanN4KFwicFwiLCB7IGNsYXNzTmFtZTogXCJtdC0xIHRleHQtc20gdGV4dC1ncmF5LTUwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IFwiTWFuYWdlIEFjdGl2ZSBEaXJlY3RvcnkgYW5kIEF6dXJlIEFEIGdyb3Vwc1wiIH0pXSB9KSwgX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IFtfanN4cyhCYWRnZSwgeyB2YXJpYW50OiBcImluZm9cIiwgc2l6ZTogXCJsZ1wiLCBjaGlsZHJlbjogW2ZpbHRlcmVkQ291bnQsIFwiIG9mIFwiLCB0b3RhbEdyb3VwcywgXCIgZ3JvdXBzXCJdIH0pLCBfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVSZWZyZXNoLCB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBzaXplOiBcIm1kXCIsIGljb246IF9qc3goUmVmcmVzaEN3LCB7IGNsYXNzTmFtZTogY2xzeCgnaC00IHctNCcsIHsgJ2FuaW1hdGUtc3Bpbic6IGlzTG9hZGluZyB9KSB9KSwgZGlzYWJsZWQ6IGlzTG9hZGluZywgXCJkYXRhLWN5XCI6IFwicmVmcmVzaC1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcInJlZnJlc2gtYnRuXCIsIGNoaWxkcmVuOiBcIlJlZnJlc2hcIiB9KSwgX2pzeChCdXR0b24sIHsgb25DbGljazogaGFuZGxlRXhwb3J0LCB2YXJpYW50OiBcInNlY29uZGFyeVwiLCBzaXplOiBcIm1kXCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgY2xhc3NOYW1lOiBcImgtNCB3LTRcIiB9KSwgZGlzYWJsZWQ6IGlzTG9hZGluZywgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwiZXhwb3J0LWJ0blwiLCBjaGlsZHJlbjogXCJFeHBvcnRcIiB9KSwgX2pzeHMoQnV0dG9uLCB7IG9uQ2xpY2s6IGhhbmRsZURlbGV0ZSwgdmFyaWFudDogXCJkYW5nZXJcIiwgc2l6ZTogXCJtZFwiLCBpY29uOiBfanN4KFRyYXNoMiwgeyBjbGFzc05hbWU6IFwiaC00IHctNFwiIH0pLCBkaXNhYmxlZDogc2VsZWN0ZWRHcm91cHMubGVuZ3RoID09PSAwIHx8IGlzTG9hZGluZywgXCJkYXRhLWN5XCI6IFwiZGVsZXRlLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwiZGVsZXRlLWJ0blwiLCBjaGlsZHJlbjogW1wiRGVsZXRlIChcIiwgc2VsZWN0ZWRHcm91cHMubGVuZ3RoLCBcIilcIl0gfSksIF9qc3goQnV0dG9uLCB7IG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBNb2RhbCBmdW5jdGlvbmFsaXR5IHRlbXBvcmFyaWx5IGRpc2FibGVkIGR1ZSB0byBpbXBvcnQgaXNzdWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NyZWF0ZSBHcm91cCBmdW5jdGlvbmFsaXR5IC0gdGVtcG9yYXJpbHkgZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBJbXBsZW1lbnQgcHJvcGVyIG1vZGFsIG9wZW5pbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHZhcmlhbnQ6IFwicHJpbWFyeVwiLCBzaXplOiBcIm1kXCIsIGljb246IF9qc3goUGx1cywgeyBjbGFzc05hbWU6IFwiaC00IHctNFwiIH0pLCBkaXNhYmxlZDogaXNMb2FkaW5nLCBcImRhdGEtY3lcIjogXCJjcmVhdGUtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJjcmVhdGUtYnRuXCIsIGNoaWxkcmVuOiBcIkNyZWF0ZSBHcm91cFwiIH0pXSB9KV0gfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHB4LTYgcHktNCBzcGFjZS15LTRcIiwgY2hpbGRyZW46IFtfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC00XCIsIGNoaWxkcmVuOiBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMVwiLCBjaGlsZHJlbjogX2pzeChTZWFyY2hCYXIsIHsgdmFsdWU6IHNlYXJjaFRleHQsIG9uQ2hhbmdlOiBzZXRTZWFyY2hUZXh0LCBwbGFjZWhvbGRlcjogXCJTZWFyY2ggZ3JvdXBzIGJ5IG5hbWUsIGVtYWlsLCBvciBkZXNjcmlwdGlvbi4uLlwiLCBkaXNhYmxlZDogaXNMb2FkaW5nLCBcImRhdGEtY3lcIjogXCJncm91cC1zZWFyY2hcIiwgXCJkYXRhLXRlc3RpZFwiOiBcImdyb3VwLXNlYXJjaFwiIH0pIH0pIH0pLCBfanN4KEZpbHRlclBhbmVsLCB7IGZpbHRlcnM6IGZpbHRlcnMsIG9uRmlsdGVyQ2hhbmdlOiBoYW5kbGVGaWx0ZXJDaGFuZ2UsIG9uUmVzZXQ6IGhhbmRsZVJlc2V0RmlsdGVycywgdGl0bGU6IFwiQWR2YW5jZWQgRmlsdGVyc1wiLCBkZWZhdWx0Q29sbGFwc2VkOiB0cnVlLCBcImRhdGEtY3lcIjogXCJncm91cC1maWx0ZXJzXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJncm91cC1maWx0ZXJzXCIgfSldIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJteC02IG10LTQgcC00IGJnLXJlZC01MCBib3JkZXIgYm9yZGVyLXJlZC0yMDAgcm91bmRlZC1sZ1wiLCBjaGlsZHJlbjogX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LXJlZC04MDBcIiwgY2hpbGRyZW46IGVycm9yIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcHgtNiBweS00IG92ZXJmbG93LWhpZGRlblwiLCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJoLWZ1bGwgYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgc2hhZG93LXNtXCIsIGNoaWxkcmVuOiBfanN4KFZpcnR1YWxpemVkRGF0YUdyaWQsIHsgZGF0YTogZ3JvdXBzLCBjb2x1bW5zOiBleHRlbmRlZENvbHVtbkRlZnMsIGxvYWRpbmc6IGlzTG9hZGluZywgb25TZWxlY3Rpb25DaGFuZ2U6IHNldFNlbGVjdGVkR3JvdXBzIH0pIH0pIH0pXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgR3JvdXBzVmlldztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBGcmFnbWVudCBhcyBfRnJhZ21lbnQsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogVmlydHVhbGl6ZWREYXRhR3JpZCBDb21wb25lbnRcbiAqXG4gKiBFbnRlcnByaXNlLWdyYWRlIGRhdGEgZ3JpZCB1c2luZyBBRyBHcmlkIEVudGVycHJpc2VcbiAqIEhhbmRsZXMgMTAwLDAwMCsgcm93cyB3aXRoIHZpcnR1YWwgc2Nyb2xsaW5nIGF0IDYwIEZQU1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbywgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWdHcmlkUmVhY3QgfSBmcm9tICdhZy1ncmlkLXJlYWN0JztcbmltcG9ydCAnYWctZ3JpZC1lbnRlcnByaXNlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IERvd25sb2FkLCBQcmludGVyLCBFeWUsIEV5ZU9mZiwgRmlsdGVyIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vYXRvbXMvU3Bpbm5lcic7XG4vLyBMYXp5IGxvYWQgQUcgR3JpZCBDU1MgLSBvbmx5IGxvYWQgb25jZSB3aGVuIGZpcnN0IGdyaWQgbW91bnRzXG5sZXQgYWdHcmlkU3R5bGVzTG9hZGVkID0gZmFsc2U7XG5jb25zdCBsb2FkQWdHcmlkU3R5bGVzID0gKCkgPT4ge1xuICAgIGlmIChhZ0dyaWRTdHlsZXNMb2FkZWQpXG4gICAgICAgIHJldHVybjtcbiAgICAvLyBEeW5hbWljYWxseSBpbXBvcnQgQUcgR3JpZCBzdHlsZXNcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy1ncmlkLmNzcycpO1xuICAgIGltcG9ydCgnYWctZ3JpZC1jb21tdW5pdHkvc3R5bGVzL2FnLXRoZW1lLWFscGluZS5jc3MnKTtcbiAgICBhZ0dyaWRTdHlsZXNMb2FkZWQgPSB0cnVlO1xufTtcbi8qKlxuICogSGlnaC1wZXJmb3JtYW5jZSBkYXRhIGdyaWQgY29tcG9uZW50XG4gKi9cbmZ1bmN0aW9uIFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcih7IGRhdGEsIGNvbHVtbnMsIGxvYWRpbmcgPSBmYWxzZSwgdmlydHVhbFJvd0hlaWdodCA9IDMyLCBlbmFibGVDb2x1bW5SZW9yZGVyID0gdHJ1ZSwgZW5hYmxlQ29sdW1uUmVzaXplID0gdHJ1ZSwgZW5hYmxlRXhwb3J0ID0gdHJ1ZSwgZW5hYmxlUHJpbnQgPSB0cnVlLCBlbmFibGVHcm91cGluZyA9IGZhbHNlLCBlbmFibGVGaWx0ZXJpbmcgPSB0cnVlLCBlbmFibGVTZWxlY3Rpb24gPSB0cnVlLCBzZWxlY3Rpb25Nb2RlID0gJ211bHRpcGxlJywgcGFnaW5hdGlvbiA9IHRydWUsIHBhZ2luYXRpb25QYWdlU2l6ZSA9IDEwMCwgb25Sb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2UsIGNsYXNzTmFtZSwgaGVpZ2h0ID0gJzYwMHB4JywgJ2RhdGEtY3knOiBkYXRhQ3ksIH0sIHJlZikge1xuICAgIGNvbnN0IGdyaWRSZWYgPSB1c2VSZWYobnVsbCk7XG4gICAgY29uc3QgW2dyaWRBcGksIHNldEdyaWRBcGldID0gUmVhY3QudXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3QgW3Nob3dDb2x1bW5QYW5lbCwgc2V0U2hvd0NvbHVtblBhbmVsXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCByb3dEYXRhID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGEgPz8gW107XG4gICAgICAgIGNvbnNvbGUubG9nKCdbVmlydHVhbGl6ZWREYXRhR3JpZF0gcm93RGF0YSBjb21wdXRlZDonLCByZXN1bHQubGVuZ3RoLCAncm93cycpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtkYXRhXSk7XG4gICAgLy8gTG9hZCBBRyBHcmlkIHN0eWxlcyBvbiBjb21wb25lbnQgbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkQWdHcmlkU3R5bGVzKCk7XG4gICAgfSwgW10pO1xuICAgIC8vIERlZmF1bHQgY29sdW1uIGRlZmluaXRpb25cbiAgICBjb25zdCBkZWZhdWx0Q29sRGVmID0gdXNlTWVtbygoKSA9PiAoe1xuICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgZmlsdGVyOiBlbmFibGVGaWx0ZXJpbmcsXG4gICAgICAgIHJlc2l6YWJsZTogZW5hYmxlQ29sdW1uUmVzaXplLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICBtaW5XaWR0aDogMTAwLFxuICAgIH0pLCBbZW5hYmxlRmlsdGVyaW5nLCBlbmFibGVDb2x1bW5SZXNpemVdKTtcbiAgICAvLyBHcmlkIG9wdGlvbnNcbiAgICBjb25zdCBncmlkT3B0aW9ucyA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgcm93SGVpZ2h0OiB2aXJ0dWFsUm93SGVpZ2h0LFxuICAgICAgICBoZWFkZXJIZWlnaHQ6IDQwLFxuICAgICAgICBmbG9hdGluZ0ZpbHRlcnNIZWlnaHQ6IDQwLFxuICAgICAgICBzdXBwcmVzc1Jvd0NsaWNrU2VsZWN0aW9uOiAhZW5hYmxlU2VsZWN0aW9uLFxuICAgICAgICByb3dTZWxlY3Rpb246IGVuYWJsZVNlbGVjdGlvbiA/IHNlbGVjdGlvbk1vZGUgOiB1bmRlZmluZWQsXG4gICAgICAgIGFuaW1hdGVSb3dzOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IERpc2FibGUgY2hhcnRzIHRvIGF2b2lkIGVycm9yICMyMDAgKHJlcXVpcmVzIEludGVncmF0ZWRDaGFydHNNb2R1bGUpXG4gICAgICAgIGVuYWJsZUNoYXJ0czogZmFsc2UsXG4gICAgICAgIC8vIEZJWDogVXNlIGNlbGxTZWxlY3Rpb24gaW5zdGVhZCBvZiBkZXByZWNhdGVkIGVuYWJsZVJhbmdlU2VsZWN0aW9uXG4gICAgICAgIGNlbGxTZWxlY3Rpb246IHRydWUsXG4gICAgICAgIC8vIEZJWDogVXNlIGxlZ2FjeSB0aGVtZSB0byBwcmV2ZW50IHRoZW1pbmcgQVBJIGNvbmZsaWN0IChlcnJvciAjMjM5KVxuICAgICAgICAvLyBNdXN0IGJlIHNldCB0byAnbGVnYWN5JyB0byB1c2UgdjMyIHN0eWxlIHRoZW1lcyB3aXRoIENTUyBmaWxlc1xuICAgICAgICB0aGVtZTogJ2xlZ2FjeScsXG4gICAgICAgIHN0YXR1c0Jhcjoge1xuICAgICAgICAgICAgc3RhdHVzUGFuZWxzOiBbXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnVG90YWxBbmRGaWx0ZXJlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdsZWZ0JyB9LFxuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1NlbGVjdGVkUm93Q291bnRDb21wb25lbnQnLCBhbGlnbjogJ2NlbnRlcicgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdBZ2dyZWdhdGlvbkNvbXBvbmVudCcsIGFsaWduOiAncmlnaHQnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBzaWRlQmFyOiBlbmFibGVHcm91cGluZ1xuICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgdG9vbFBhbmVsczogW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxEZWZhdWx0OiAnQ29sdW1ucycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEtleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbktleTogJ2NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdDb2x1bW5zVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0ZpbHRlcnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdmaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdmaWx0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbFBhbmVsOiAnYWdGaWx0ZXJzVG9vbFBhbmVsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRUb29sUGFuZWw6ICcnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiBmYWxzZSxcbiAgICB9KSwgW3ZpcnR1YWxSb3dIZWlnaHQsIGVuYWJsZVNlbGVjdGlvbiwgc2VsZWN0aW9uTW9kZSwgZW5hYmxlR3JvdXBpbmddKTtcbiAgICAvLyBIYW5kbGUgZ3JpZCByZWFkeSBldmVudFxuICAgIGNvbnN0IG9uR3JpZFJlYWR5ID0gdXNlQ2FsbGJhY2soKHBhcmFtcykgPT4ge1xuICAgICAgICBzZXRHcmlkQXBpKHBhcmFtcy5hcGkpO1xuICAgICAgICBwYXJhbXMuYXBpLnNpemVDb2x1bW5zVG9GaXQoKTtcbiAgICB9LCBbXSk7XG4gICAgLy8gSGFuZGxlIHJvdyBjbGlja1xuICAgIGNvbnN0IGhhbmRsZVJvd0NsaWNrID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblJvd0NsaWNrICYmIGV2ZW50LmRhdGEpIHtcbiAgICAgICAgICAgIG9uUm93Q2xpY2soZXZlbnQuZGF0YSk7XG4gICAgICAgIH1cbiAgICB9LCBbb25Sb3dDbGlja10pO1xuICAgIC8vIEhhbmRsZSBzZWxlY3Rpb24gY2hhbmdlXG4gICAgY29uc3QgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChvblNlbGVjdGlvbkNoYW5nZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRSb3dzID0gZXZlbnQuYXBpLmdldFNlbGVjdGVkUm93cygpO1xuICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2Uoc2VsZWN0ZWRSb3dzKTtcbiAgICAgICAgfVxuICAgIH0sIFtvblNlbGVjdGlvbkNoYW5nZV0pO1xuICAgIC8vIEV4cG9ydCB0byBDU1ZcbiAgICBjb25zdCBleHBvcnRUb0NzdiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzQ3N2KHtcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogYGV4cG9ydC0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKX0uY3N2YCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBFeHBvcnQgdG8gRXhjZWxcbiAgICBjb25zdCBleHBvcnRUb0V4Y2VsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5leHBvcnREYXRhQXNFeGNlbCh7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9Lnhsc3hgLFxuICAgICAgICAgICAgICAgIHNoZWV0TmFtZTogJ0RhdGEnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFByaW50IGdyaWRcbiAgICBjb25zdCBwcmludEdyaWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLnNldEdyaWRPcHRpb24oJ2RvbUxheW91dCcsICdwcmludCcpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LnByaW50KCk7XG4gICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5IHBhbmVsXG4gICAgY29uc3QgdG9nZ2xlQ29sdW1uUGFuZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNob3dDb2x1bW5QYW5lbCghc2hvd0NvbHVtblBhbmVsKTtcbiAgICB9LCBbc2hvd0NvbHVtblBhbmVsXSk7XG4gICAgLy8gQXV0by1zaXplIGFsbCBjb2x1bW5zXG4gICAgY29uc3QgYXV0b1NpemVDb2x1bW5zID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgY29uc3QgYWxsQ29sdW1uSWRzID0gY29sdW1ucy5tYXAoYyA9PiBjLmZpZWxkKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICAgICAgICBncmlkQXBpLmF1dG9TaXplQ29sdW1ucyhhbGxDb2x1bW5JZHMpO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGksIGNvbHVtbnNdKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KCdmbGV4IGZsZXgtY29sIGJnLXdoaXRlIGRhcms6YmctZ3JheS05MDAgcm91bmRlZC1sZyBzaGFkb3ctc20nLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyByZWY6IHJlZiwgY2xhc3NOYW1lOiBjb250YWluZXJDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogbG9hZGluZyA/IChfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJzbVwiIH0pKSA6IChgJHtyb3dEYXRhLmxlbmd0aC50b0xvY2FsZVN0cmluZygpfSByb3dzYCkgfSkgfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbZW5hYmxlRmlsdGVyaW5nICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChGaWx0ZXIsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHNldEZsb2F0aW5nRmlsdGVyc0hlaWdodCBpcyBkZXByZWNhdGVkIGluIEFHIEdyaWQgdjM0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9hdGluZyBmaWx0ZXJzIGFyZSBub3cgY29udHJvbGxlZCB0aHJvdWdoIGNvbHVtbiBkZWZpbml0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdGaWx0ZXIgdG9nZ2xlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIEFHIEdyaWQgdjM0Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHRpdGxlOiBcIlRvZ2dsZSBmaWx0ZXJzXCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1maWx0ZXJzXCIsIGNoaWxkcmVuOiBcIkZpbHRlcnNcIiB9KSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBzaG93Q29sdW1uUGFuZWwgPyBfanN4KEV5ZU9mZiwgeyBzaXplOiAxNiB9KSA6IF9qc3goRXllLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiB0b2dnbGVDb2x1bW5QYW5lbCwgdGl0bGU6IFwiVG9nZ2xlIGNvbHVtbiB2aXNpYmlsaXR5XCIsIFwiZGF0YS1jeVwiOiBcInRvZ2dsZS1jb2x1bW5zXCIsIGNoaWxkcmVuOiBcIkNvbHVtbnNcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIG9uQ2xpY2s6IGF1dG9TaXplQ29sdW1ucywgdGl0bGU6IFwiQXV0by1zaXplIGNvbHVtbnNcIiwgXCJkYXRhLWN5XCI6IFwiYXV0by1zaXplXCIsIGNoaWxkcmVuOiBcIkF1dG8gU2l6ZVwiIH0pLCBlbmFibGVFeHBvcnQgJiYgKF9qc3hzKF9GcmFnbWVudCwgeyBjaGlsZHJlbjogW19qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBleHBvcnRUb0NzdiwgdGl0bGU6IFwiRXhwb3J0IHRvIENTVlwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtY3N2XCIsIGNoaWxkcmVuOiBcIkNTVlwiIH0pLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9FeGNlbCwgdGl0bGU6IFwiRXhwb3J0IHRvIEV4Y2VsXCIsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1leGNlbFwiLCBjaGlsZHJlbjogXCJFeGNlbFwiIH0pXSB9KSksIGVuYWJsZVByaW50ICYmIChfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChQcmludGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiBwcmludEdyaWQsIHRpdGxlOiBcIlByaW50XCIsIFwiZGF0YS1jeVwiOiBcInByaW50XCIsIGNoaWxkcmVuOiBcIlByaW50XCIgfSkpXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSByZWxhdGl2ZVwiLCBjaGlsZHJlbjogW2xvYWRpbmcgJiYgKF9qc3goXCJkaXZcIiwgeyBcImRhdGEtdGVzdGlkXCI6IFwiZ3JpZC1sb2FkaW5nXCIsIHJvbGU6IFwic3RhdHVzXCIsIFwiYXJpYS1sYWJlbFwiOiBcIkxvYWRpbmcgZGF0YVwiLCBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQtMCBiZy13aGl0ZSBiZy1vcGFjaXR5LTc1IGRhcms6YmctZ3JheS05MDAgZGFyazpiZy1vcGFjaXR5LTc1IHotMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiwgY2hpbGRyZW46IF9qc3goU3Bpbm5lciwgeyBzaXplOiBcImxnXCIsIGxhYmVsOiBcIkxvYWRpbmcgZGF0YS4uLlwiIH0pIH0pKSwgX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogY2xzeCgnYWctdGhlbWUtYWxwaW5lJywgJ2Rhcms6YWctdGhlbWUtYWxwaW5lLWRhcmsnLCAndy1mdWxsJyksIHN0eWxlOiB7IGhlaWdodCB9LCBjaGlsZHJlbjogX2pzeChBZ0dyaWRSZWFjdCwgeyByZWY6IGdyaWRSZWYsIHJvd0RhdGE6IHJvd0RhdGEsIGNvbHVtbkRlZnM6IGNvbHVtbnMsIGRlZmF1bHRDb2xEZWY6IGRlZmF1bHRDb2xEZWYsIGdyaWRPcHRpb25zOiBncmlkT3B0aW9ucywgb25HcmlkUmVhZHk6IG9uR3JpZFJlYWR5LCBvblJvd0NsaWNrZWQ6IGhhbmRsZVJvd0NsaWNrLCBvblNlbGVjdGlvbkNoYW5nZWQ6IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSwgcm93QnVmZmVyOiAyMCwgcm93TW9kZWxUeXBlOiBcImNsaWVudFNpZGVcIiwgcGFnaW5hdGlvbjogcGFnaW5hdGlvbiwgcGFnaW5hdGlvblBhZ2VTaXplOiBwYWdpbmF0aW9uUGFnZVNpemUsIHBhZ2luYXRpb25BdXRvUGFnZVNpemU6IGZhbHNlLCBzdXBwcmVzc0NlbGxGb2N1czogZmFsc2UsIGVuYWJsZUNlbGxUZXh0U2VsZWN0aW9uOiB0cnVlLCBlbnN1cmVEb21PcmRlcjogdHJ1ZSB9KSB9KSwgc2hvd0NvbHVtblBhbmVsICYmIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctNjQgaC1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgYm9yZGVyLWwgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHAtNCBvdmVyZmxvdy15LWF1dG8gei0yMFwiLCBjaGlsZHJlbjogW19qc3goXCJoM1wiLCB7IGNsYXNzTmFtZTogXCJmb250LXNlbWlib2xkIHRleHQtc20gbWItM1wiLCBjaGlsZHJlbjogXCJDb2x1bW4gVmlzaWJpbGl0eVwiIH0pLCBjb2x1bW5zLm1hcCgoY29sKSA9PiAoX2pzeHMoXCJsYWJlbFwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweS0xXCIsIGNoaWxkcmVuOiBbX2pzeChcImlucHV0XCIsIHsgdHlwZTogXCJjaGVja2JveFwiLCBjbGFzc05hbWU6IFwicm91bmRlZFwiLCBkZWZhdWx0Q2hlY2tlZDogdHJ1ZSwgb25DaGFuZ2U6IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmlkQXBpICYmIGNvbC5maWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ3JpZEFwaS5zZXRDb2x1bW5zVmlzaWJsZShbY29sLmZpZWxkXSwgZS50YXJnZXQuY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IH0pLCBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LXNtXCIsIGNoaWxkcmVuOiBjb2wuaGVhZGVyTmFtZSB8fCBjb2wuZmllbGQgfSldIH0sIGNvbC5maWVsZCkpKV0gfSkpXSB9KV0gfSkpO1xufVxuZXhwb3J0IGNvbnN0IFZpcnR1YWxpemVkRGF0YUdyaWQgPSBSZWFjdC5mb3J3YXJkUmVmKFZpcnR1YWxpemVkRGF0YUdyaWRJbm5lcik7XG4vLyBTZXQgZGlzcGxheU5hbWUgZm9yIFJlYWN0IERldlRvb2xzXG5WaXJ0dWFsaXplZERhdGFHcmlkLmRpc3BsYXlOYW1lID0gJ1ZpcnR1YWxpemVkRGF0YUdyaWQnO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogQmFkZ2UgQ29tcG9uZW50XG4gKlxuICogU21hbGwgbGFiZWwgY29tcG9uZW50IGZvciBzdGF0dXMgaW5kaWNhdG9ycywgY291bnRzLCBhbmQgdGFncy5cbiAqIFN1cHBvcnRzIG11bHRpcGxlIHZhcmlhbnRzIGFuZCBzaXplcy5cbiAqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4Jztcbi8qKlxuICogQmFkZ2UgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCBjb25zdCBCYWRnZSA9ICh7IGNoaWxkcmVuLCB2YXJpYW50ID0gJ2RlZmF1bHQnLCBzaXplID0gJ21kJywgZG90ID0gZmFsc2UsIGRvdFBvc2l0aW9uID0gJ2xlYWRpbmcnLCByZW1vdmFibGUgPSBmYWxzZSwgb25SZW1vdmUsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICAvLyBWYXJpYW50IHN0eWxlc1xuICAgIGNvbnN0IHZhcmlhbnRDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS0xMDAgdGV4dC1ncmF5LTgwMCBib3JkZXItZ3JheS0yMDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS0xMDAgdGV4dC1ibHVlLTgwMCBib3JkZXItYmx1ZS0yMDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tMTAwIHRleHQtZ3JlZW4tODAwIGJvcmRlci1ncmVlbi0yMDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTEwMCB0ZXh0LXllbGxvdy04MDAgYm9yZGVyLXllbGxvdy0yMDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtMTAwIHRleHQtcmVkLTgwMCBib3JkZXItcmVkLTIwMCcsXG4gICAgICAgIGluZm86ICdiZy1jeWFuLTEwMCB0ZXh0LWN5YW4tODAwIGJvcmRlci1jeWFuLTIwMCcsXG4gICAgfTtcbiAgICAvLyBEb3QgY29sb3IgY2xhc3Nlc1xuICAgIGNvbnN0IGRvdENsYXNzZXMgPSB7XG4gICAgICAgIGRlZmF1bHQ6ICdiZy1ncmF5LTUwMCcsXG4gICAgICAgIHByaW1hcnk6ICdiZy1ibHVlLTUwMCcsXG4gICAgICAgIHN1Y2Nlc3M6ICdiZy1ncmVlbi01MDAnLFxuICAgICAgICB3YXJuaW5nOiAnYmcteWVsbG93LTUwMCcsXG4gICAgICAgIGRhbmdlcjogJ2JnLXJlZC01MDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi01MDAnLFxuICAgIH07XG4gICAgLy8gU2l6ZSBzdHlsZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgeHM6ICdweC0yIHB5LTAuNSB0ZXh0LXhzJyxcbiAgICAgICAgc206ICdweC0yLjUgcHktMC41IHRleHQtc20nLFxuICAgICAgICBtZDogJ3B4LTMgcHktMSB0ZXh0LXNtJyxcbiAgICAgICAgbGc6ICdweC0zLjUgcHktMS41IHRleHQtYmFzZScsXG4gICAgfTtcbiAgICBjb25zdCBkb3RTaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgeHM6ICdoLTEuNSB3LTEuNScsXG4gICAgICAgIHNtOiAnaC0yIHctMicsXG4gICAgICAgIG1kOiAnaC0yIHctMicsXG4gICAgICAgIGxnOiAnaC0yLjUgdy0yLjUnLFxuICAgIH07XG4gICAgY29uc3QgYmFkZ2VDbGFzc2VzID0gY2xzeChcbiAgICAvLyBCYXNlIHN0eWxlc1xuICAgICdpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEuNScsICdmb250LW1lZGl1bSByb3VuZGVkLWZ1bGwgYm9yZGVyJywgJ3RyYW5zaXRpb24tY29sb3JzIGR1cmF0aW9uLTIwMCcsIFxuICAgIC8vIFZhcmlhbnRcbiAgICB2YXJpYW50Q2xhc3Nlc1t2YXJpYW50XSwgXG4gICAgLy8gU2l6ZVxuICAgIHNpemVDbGFzc2VzW3NpemVdLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBiYWRnZUNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbZG90ICYmIGRvdFBvc2l0aW9uID09PSAnbGVhZGluZycgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBjbHN4KCdyb3VuZGVkLWZ1bGwnLCBkb3RDbGFzc2VzW3ZhcmlhbnRdLCBkb3RTaXplQ2xhc3Nlc1tzaXplXSksIFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSkpLCBfanN4KFwic3BhblwiLCB7IGNoaWxkcmVuOiBjaGlsZHJlbiB9KSwgZG90ICYmIGRvdFBvc2l0aW9uID09PSAndHJhaWxpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgcmVtb3ZhYmxlICYmIG9uUmVtb3ZlICYmIChfanN4KFwiYnV0dG9uXCIsIHsgdHlwZTogXCJidXR0b25cIiwgb25DbGljazogb25SZW1vdmUsIGNsYXNzTmFtZTogY2xzeCgnbWwtMC41IC1tci0xIGlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlcicsICdyb3VuZGVkLWZ1bGwgaG92ZXI6YmctYmxhY2svMTAnLCAnZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLW9mZnNldC0xJywge1xuICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICd4cycgfHwgc2l6ZSA9PT0gJ3NtJyxcbiAgICAgICAgICAgICAgICAgICAgJ2gtNCB3LTQnOiBzaXplID09PSAnbWQnIHx8IHNpemUgPT09ICdsZycsXG4gICAgICAgICAgICAgICAgfSksIFwiYXJpYS1sYWJlbFwiOiBcIlJlbW92ZVwiLCBjaGlsZHJlbjogX2pzeChcInN2Z1wiLCB7IGNsYXNzTmFtZTogY2xzeCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0yIHctMic6IHNpemUgPT09ICd4cycgfHwgc2l6ZSA9PT0gJ3NtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdoLTMgdy0zJzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgICAgICB9KSwgZmlsbDogXCJjdXJyZW50Q29sb3JcIiwgdmlld0JveDogXCIwIDAgMjAgMjBcIiwgY2hpbGRyZW46IF9qc3goXCJwYXRoXCIsIHsgZmlsbFJ1bGU6IFwiZXZlbm9kZFwiLCBkOiBcIk00LjI5MyA0LjI5M2ExIDEgMCAwMTEuNDE0IDBMMTAgOC41ODZsNC4yOTMtNC4yOTNhMSAxIDAgMTExLjQxNCAxLjQxNEwxMS40MTQgMTBsNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQgMS40MTRMMTAgMTEuNDE0bC00LjI5MyA0LjI5M2ExIDEgMCAwMS0xLjQxNC0xLjQxNEw4LjU4NiAxMCA0LjI5MyA1LjcwN2ExIDEgMCAwMTAtMS40MTR6XCIsIGNsaXBSdWxlOiBcImV2ZW5vZGRcIiB9KSB9KSB9KSldIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBCYWRnZTtcbiIsIi8qKlxuICogRGVib3VuY2UgSG9va1xuICpcbiAqIFJldHVybnMgYSBkZWJvdW5jZWQgdmFsdWUgdGhhdCBvbmx5IHVwZGF0ZXMgYWZ0ZXIgdGhlIHNwZWNpZmllZCBkZWxheS5cbiAqIFVzZWZ1bCBmb3Igc2VhcmNoIGlucHV0cyBhbmQgZXhwZW5zaXZlIG9wZXJhdGlvbnMuXG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG4vKipcbiAqIERlYm91bmNlIGEgdmFsdWVcbiAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byBkZWJvdW5jZVxuICogQHBhcmFtIGRlbGF5IERlbGF5IGluIG1pbGxpc2Vjb25kcyAoZGVmYXVsdDogNTAwbXMpXG4gKiBAcmV0dXJucyBEZWJvdW5jZWQgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZURlYm91bmNlKHZhbHVlLCBkZWxheSA9IDUwMCkge1xuICAgIGNvbnN0IFtkZWJvdW5jZWRWYWx1ZSwgc2V0RGVib3VuY2VkVmFsdWVdID0gdXNlU3RhdGUodmFsdWUpO1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIC8vIFNldCB1cCBhIHRpbWVvdXQgdG8gdXBkYXRlIHRoZSBkZWJvdW5jZWQgdmFsdWVcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgc2V0RGVib3VuY2VkVmFsdWUodmFsdWUpO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgIC8vIENsZWFudXAgdGltZW91dCBvbiB2YWx1ZSBjaGFuZ2Ugb3IgdW5tb3VudFxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgICAgICB9O1xuICAgIH0sIFt2YWx1ZSwgZGVsYXldKTtcbiAgICByZXR1cm4gZGVib3VuY2VkVmFsdWU7XG59XG5leHBvcnQgZGVmYXVsdCB1c2VEZWJvdW5jZTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==