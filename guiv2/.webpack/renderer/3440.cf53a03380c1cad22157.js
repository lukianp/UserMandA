"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3440],{

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

/***/ 53440:
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
    const { getCurrentSourceProfile } = (0,useProfileStore/* useProfileStore */.K)();
    // Debounced search
    const debouncedSearch = (0,useDebounce/* useDebounce */.d)(searchText, 300);
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
        __webpack_require__.e(/* import() */ 850).then(__webpack_require__.bind(__webpack_require__, 70850)).then(({ GroupMembersModal }) => {
            const { openModal, updateModal } = (__webpack_require__(23361)/* .useModalStore */ .K).getState();
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
    const selectedSourceProfile = (0,useProfileStore/* useProfileStore */.K)((state) => state.selectedSourceProfile);
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
    const containerClasses = (0,clsx/* clsx */.$)('border border-gray-300 rounded-lg bg-white shadow-sm', className);
    return ((0,jsx_runtime.jsxs)("div", { className: containerClasses, "data-cy": dataCy, children: [(0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between px-4 py-3 border-b border-gray-200", children: [(0,jsx_runtime.jsxs)("button", { type: "button", onClick: toggleCollapse, className: "flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded", children: [(0,jsx_runtime.jsx)("span", { children: title }), hasActiveFilters && ((0,jsx_runtime.jsx)("span", { className: "inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full", children: filters.filter(f => f.value).length })), isCollapsed ? ((0,jsx_runtime.jsx)(lucide_react/* ChevronDown */.yQN, { className: "h-4 w-4", "aria-hidden": "true" })) : ((0,jsx_runtime.jsx)(lucide_react/* ChevronUp */.rXn, { className: "h-4 w-4", "aria-hidden": "true" }))] }), hasActiveFilters && !isCollapsed && ((0,jsx_runtime.jsx)(Button/* Button */.$, { variant: "ghost", size: "sm", onClick: handleReset, icon: (0,jsx_runtime.jsx)(lucide_react.X, { className: "h-4 w-4" }), "data-cy": "filter-reset", children: "Reset" }))] }), !isCollapsed && ((0,jsx_runtime.jsx)("div", { className: "p-4 space-y-4", children: filters.map((filter) => ((0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("label", { htmlFor: filter.id, className: "block text-sm font-medium text-gray-700 mb-1", children: filter.label }), filter.type === 'text' && ((0,jsx_runtime.jsx)("input", { id: filter.id, type: "text", value: filter.value || '', onChange: (e) => handleFilterChange(filter.id, e.target.value), placeholder: filter.placeholder, className: "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", "data-cy": `filter-${filter.id}` })), filter.type === 'select' && ((0,jsx_runtime.jsxs)("select", { id: filter.id, value: filter.value || '', onChange: (e) => handleFilterChange(filter.id, e.target.value), className: "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", "data-cy": `filter-${filter.id}`, children: [(0,jsx_runtime.jsx)("option", { value: "", children: "All" }), filter.options?.map((option) => ((0,jsx_runtime.jsx)("option", { value: option.value, children: option.label }, option.value)))] })), filter.type === 'date' && ((0,jsx_runtime.jsx)("input", { id: filter.id, type: "date", value: filter.value || '', onChange: (e) => handleFilterChange(filter.id, e.target.value), className: "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500", "data-cy": `filter-${filter.id}` })), filter.type === 'checkbox' && ((0,jsx_runtime.jsxs)("div", { className: "flex items-center", children: [(0,jsx_runtime.jsx)("input", { id: filter.id, type: "checkbox", checked: filter.value || false, onChange: (e) => handleFilterChange(filter.id, e.target.checked), className: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500", "data-cy": `filter-${filter.id}` }), (0,jsx_runtime.jsx)("label", { htmlFor: filter.id, className: "ml-2 text-sm text-gray-600", children: filter.placeholder || 'Enable' })] }))] }, filter.id))) }))] }));
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
    const [{ isDragging }, drag] = (0,react_dnd_dist/* useDrag */.i3)({
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
    return ((0,jsx_runtime.jsx)("div", { ref: drag, className: (0,clsx/* clsx */.$)('flex items-center justify-center cursor-move h-full', isDragging && 'opacity-50'), title: "Drag to add to migration wave", "data-cy": "group-drag-handle", "data-testid": "group-drag-handle", children: (0,jsx_runtime.jsx)(lucide_react/* GripVertical */.f2M, { size: 16, className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" }) }));
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
            cellRenderer: (params) => ((0,jsx_runtime.jsxs)(Button/* Button */.$, { onClick: () => handleViewDetails(params.data), variant: "secondary", size: "sm", "data-cy": "view-group-details", "data-testid": "view-group-details", children: [(0,jsx_runtime.jsx)(lucide_react/* Eye */.kU3, { className: "mr-1 h-3 w-3" }), "View Details"] })),
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
    return ((0,jsx_runtime.jsxs)("div", { className: "h-full flex flex-col bg-gray-50 dark:bg-gray-900", "data-cy": "groups-view", "data-testid": "groups-view", children: [(0,jsx_runtime.jsx)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4", children: (0,jsx_runtime.jsxs)("div", { className: "flex items-center justify-between", children: [(0,jsx_runtime.jsxs)("div", { children: [(0,jsx_runtime.jsx)("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Groups" }), (0,jsx_runtime.jsx)("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Manage Active Directory and Azure AD groups" })] }), (0,jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [(0,jsx_runtime.jsxs)(Badge/* Badge */.E, { variant: "info", size: "lg", children: [filteredCount, " of ", totalGroups, " groups"] }), (0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: handleRefresh, variant: "secondary", size: "md", icon: (0,jsx_runtime.jsx)(lucide_react/* RefreshCw */.e9t, { className: (0,clsx/* clsx */.$)('h-4 w-4', { 'animate-spin': isLoading }) }), disabled: isLoading, "data-cy": "refresh-btn", "data-testid": "refresh-btn", children: "Refresh" }), (0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: handleExport, variant: "secondary", size: "md", icon: (0,jsx_runtime.jsx)(lucide_react/* Download */.f5X, { className: "h-4 w-4" }), disabled: isLoading, "data-cy": "export-btn", "data-testid": "export-btn", children: "Export" }), (0,jsx_runtime.jsxs)(Button/* Button */.$, { onClick: handleDelete, variant: "danger", size: "md", icon: (0,jsx_runtime.jsx)(lucide_react/* Trash2 */.TBR, { className: "h-4 w-4" }), disabled: selectedGroups.length === 0 || isLoading, "data-cy": "delete-btn", "data-testid": "delete-btn", children: ["Delete (", selectedGroups.length, ")"] }), (0,jsx_runtime.jsx)(Button/* Button */.$, { onClick: () => {
                                        // Note: Modal functionality temporarily disabled due to import issues
                                        console.log('Create Group functionality - temporarily disabled');
                                        // TODO: Implement proper modal opening
                                    }, variant: "primary", size: "md", icon: (0,jsx_runtime.jsx)(lucide_react/* Plus */.FWt, { className: "h-4 w-4" }), disabled: isLoading, "data-cy": "create-btn", "data-testid": "create-btn", children: "Create Group" })] })] }) }), (0,jsx_runtime.jsxs)("div", { className: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 space-y-4", children: [(0,jsx_runtime.jsx)("div", { className: "flex items-center gap-4", children: (0,jsx_runtime.jsx)("div", { className: "flex-1", children: (0,jsx_runtime.jsx)(SearchBar/* SearchBar */.I, { value: searchText, onChange: setSearchText, placeholder: "Search groups by name, email, or description...", disabled: isLoading, "data-cy": "group-search", "data-testid": "group-search" }) }) }), (0,jsx_runtime.jsx)(FilterPanel, { filters: filters, onFilterChange: handleFilterChange, onReset: handleResetFilters, title: "Advanced Filters", defaultCollapsed: true, "data-cy": "group-filters", "data-testid": "group-filters" })] }), error && ((0,jsx_runtime.jsx)("div", { className: "mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg", children: (0,jsx_runtime.jsx)("p", { className: "text-sm text-red-800", children: error }) })), (0,jsx_runtime.jsx)("div", { className: "flex-1 px-6 py-4 overflow-hidden", children: (0,jsx_runtime.jsx)("div", { className: "h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm", children: (0,jsx_runtime.jsx)(VirtualizedDataGrid/* VirtualizedDataGrid */.Q, { data: groups, columns: extendedColumnDefs, loading: isLoading, onSelectionChange: setSelectedGroups }) }) })] }));
};
/* harmony default export */ const groups_GroupsView = (GroupsView);


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


/***/ }),

/***/ 99305:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   d: () => (/* binding */ useDebounce)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QSxpQkFBaUIscUNBQXFDLHNEQUFJLFVBQVUsV0FBVyxtREFBSTtBQUNuRjtBQUNBO0FBQ0EscUJBQXFCLHlEQUF5RCxzREFBSSxXQUFXLG1QQUFtUCxHQUFHLEdBQUcsS0FBSztBQUMzVjtBQUNBLGlFQUFlLEtBQUssRUFBQzs7Ozs7Ozs7Ozs7O0FDM0RyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDNEM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUCxnREFBZ0QsK0NBQVE7QUFDeEQsSUFBSSxnREFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0Esc0VBQWUsMkRBQVcsSUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvbW9sZWN1bGVzL1NlYXJjaEJhci50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdHlwZXMvbW9kZWxzL2dyb3VwLnRzIiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZUdyb3Vwc1ZpZXdMb2dpYy50cyIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL21vbGVjdWxlcy9GaWx0ZXJQYW5lbC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvdmlld3MvZ3JvdXBzL0dyb3Vwc1ZpZXcudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvb3JnYW5pc21zL1ZpcnR1YWxpemVkRGF0YUdyaWQudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2NvbXBvbmVudHMvYXRvbXMvQmFkZ2UudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZURlYm91bmNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFNlYXJjaEJhciBDb21wb25lbnRcbiAqXG4gKiBTZWFyY2ggaW5wdXQgd2l0aCBpY29uLCBjbGVhciBidXR0b24sIGFuZCBkZWJvdW5jZWQgb25DaGFuZ2UuXG4gKiBVc2VkIGZvciBmaWx0ZXJpbmcgbGlzdHMgYW5kIHRhYmxlcy5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgU2VhcmNoLCBYIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogU2VhcmNoQmFyIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgU2VhcmNoQmFyID0gKHsgdmFsdWU6IGNvbnRyb2xsZWRWYWx1ZSA9ICcnLCBvbkNoYW5nZSwgcGxhY2Vob2xkZXIgPSAnU2VhcmNoLi4uJywgZGVib3VuY2VEZWxheSA9IDMwMCwgZGlzYWJsZWQgPSBmYWxzZSwgc2l6ZSA9ICdtZCcsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICBjb25zdCBbaW5wdXRWYWx1ZSwgc2V0SW5wdXRWYWx1ZV0gPSB1c2VTdGF0ZShjb250cm9sbGVkVmFsdWUpO1xuICAgIC8vIFN5bmMgd2l0aCBjb250cm9sbGVkIHZhbHVlXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgc2V0SW5wdXRWYWx1ZShjb250cm9sbGVkVmFsdWUpO1xuICAgIH0sIFtjb250cm9sbGVkVmFsdWVdKTtcbiAgICAvLyBEZWJvdW5jZWQgb25DaGFuZ2VcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAob25DaGFuZ2UgJiYgaW5wdXRWYWx1ZSAhPT0gY29udHJvbGxlZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoaW5wdXRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGRlYm91bmNlRGVsYXkpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgICAgICB9O1xuICAgIH0sIFtpbnB1dFZhbHVlLCBvbkNoYW5nZSwgZGVib3VuY2VEZWxheSwgY29udHJvbGxlZFZhbHVlXSk7XG4gICAgY29uc3QgaGFuZGxlSW5wdXRDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKGUudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUNsZWFyID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKCcnKTtcbiAgICAgICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBvbkNoYW5nZSgnJyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25DaGFuZ2VdKTtcbiAgICAvLyBTaXplIGNsYXNzZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTggdGV4dC1zbSBweC0zJyxcbiAgICAgICAgbWQ6ICdoLTEwIHRleHQtYmFzZSBweC00JyxcbiAgICAgICAgbGc6ICdoLTEyIHRleHQtbGcgcHgtNScsXG4gICAgfTtcbiAgICBjb25zdCBpY29uU2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHNtOiAnaC00IHctNCcsXG4gICAgICAgIG1kOiAnaC01IHctNScsXG4gICAgICAgIGxnOiAnaC02IHctNicsXG4gICAgfTtcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgncmVsYXRpdmUgZmxleCBpdGVtcy1jZW50ZXInLCBjbGFzc05hbWUpO1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAndy1mdWxsIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCcsICdwbC0xMCBwci0xMCcsICdiZy13aGl0ZSB0ZXh0LWdyYXktOTAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCBmb2N1czpib3JkZXItYmx1ZS01MDAnLCAndHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgXG4gICAgLy8gU2l6ZVxuICAgIHNpemVDbGFzc2VzW3NpemVdLCBcbiAgICAvLyBEaXNhYmxlZFxuICAgIHtcbiAgICAgICAgJ2JnLWdyYXktMTAwIHRleHQtZ3JheS01MDAgY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4KFNlYXJjaCwgeyBjbGFzc05hbWU6IGNsc3goJ2Fic29sdXRlIGxlZnQtMyB0ZXh0LWdyYXktNDAwIHBvaW50ZXItZXZlbnRzLW5vbmUnLCBpY29uU2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgdmFsdWU6IGlucHV0VmFsdWUsIG9uQ2hhbmdlOiBoYW5kbGVJbnB1dENoYW5nZSwgcGxhY2Vob2xkZXI6IHBsYWNlaG9sZGVyLCBkaXNhYmxlZDogZGlzYWJsZWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtbGFiZWxcIjogXCJTZWFyY2hcIiB9KSwgaW5wdXRWYWx1ZSAmJiAhZGlzYWJsZWQgJiYgKF9qc3goXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiBoYW5kbGVDbGVhciwgY2xhc3NOYW1lOiBjbHN4KCdhYnNvbHV0ZSByaWdodC0zJywgJ3RleHQtZ3JheS00MDAgaG92ZXI6dGV4dC1ncmF5LTYwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgcm91bmRlZCcsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnKSwgXCJhcmlhLWxhYmVsXCI6IFwiQ2xlYXIgc2VhcmNoXCIsIGNoaWxkcmVuOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBpY29uU2l6ZUNsYXNzZXNbc2l6ZV0gfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgU2VhcmNoQmFyO1xuIiwiLyoqXG4gKiBHcm91cCBkYXRhIG1vZGVsIGludGVyZmFjZXNcbiAqXG4gKiBSZXByZXNlbnRzIEFjdGl2ZSBEaXJlY3RvcnkgYW5kIEF6dXJlIEFEIGdyb3Vwc1xuICovXG5leHBvcnQgdmFyIEdyb3VwVHlwZTtcbihmdW5jdGlvbiAoR3JvdXBUeXBlKSB7XG4gICAgR3JvdXBUeXBlW1wiU2VjdXJpdHlcIl0gPSBcIlNlY3VyaXR5XCI7XG4gICAgR3JvdXBUeXBlW1wiRGlzdHJpYnV0aW9uXCJdID0gXCJEaXN0cmlidXRpb25cIjtcbiAgICBHcm91cFR5cGVbXCJNYWlsRW5hYmxlZFwiXSA9IFwiTWFpbEVuYWJsZWRcIjtcbiAgICBHcm91cFR5cGVbXCJPZmZpY2UzNjVcIl0gPSBcIk9mZmljZTM2NVwiO1xuICAgIEdyb3VwVHlwZVtcIkR5bmFtaWNcIl0gPSBcIkR5bmFtaWNcIjtcbn0pKEdyb3VwVHlwZSB8fCAoR3JvdXBUeXBlID0ge30pKTtcbmV4cG9ydCB2YXIgR3JvdXBTY29wZTtcbihmdW5jdGlvbiAoR3JvdXBTY29wZSkge1xuICAgIEdyb3VwU2NvcGVbXCJVbml2ZXJzYWxcIl0gPSBcIlVuaXZlcnNhbFwiO1xuICAgIEdyb3VwU2NvcGVbXCJHbG9iYWxcIl0gPSBcIkdsb2JhbFwiO1xuICAgIEdyb3VwU2NvcGVbXCJEb21haW5Mb2NhbFwiXSA9IFwiRG9tYWluTG9jYWxcIjtcbiAgICBHcm91cFNjb3BlW1wiTm9uZVwiXSA9IFwiTm9uZVwiO1xufSkoR3JvdXBTY29wZSB8fCAoR3JvdXBTY29wZSA9IHt9KSk7XG5leHBvcnQgdmFyIE1lbWJlcnNoaXBUeXBlO1xuKGZ1bmN0aW9uIChNZW1iZXJzaGlwVHlwZSkge1xuICAgIE1lbWJlcnNoaXBUeXBlW1wiU3RhdGljXCJdID0gXCJTdGF0aWNcIjtcbiAgICBNZW1iZXJzaGlwVHlwZVtcIkR5bmFtaWNcIl0gPSBcIkR5bmFtaWNcIjtcbiAgICBNZW1iZXJzaGlwVHlwZVtcIlJ1bGVCYXNlZFwiXSA9IFwiUnVsZUJhc2VkXCI7XG59KShNZW1iZXJzaGlwVHlwZSB8fCAoTWVtYmVyc2hpcFR5cGUgPSB7fSkpO1xuIiwiLyoqXG4gKiBHcm91cHMgVmlldyBMb2dpYyBIb29rXG4gKlxuICogQnVzaW5lc3MgbG9naWMgZm9yIHRoZSBHcm91cHMgbWFuYWdlbWVudCB2aWV3LlxuICogSGFuZGxlcyBncm91cCBsb2FkaW5nLCBmaWx0ZXJpbmcsIHNlYXJjaCwgYW5kIG9wZXJhdGlvbnMuXG4gKiBNaXJyb3JzIEMjIEdyb3Vwc1ZpZXdNb2RlbC5Mb2FkQXN5bmMgcGF0dGVyblxuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgR3JvdXBUeXBlLCBHcm91cFNjb3BlLCBNZW1iZXJzaGlwVHlwZSB9IGZyb20gJy4uL3R5cGVzL21vZGVscy9ncm91cCc7XG5pbXBvcnQgeyB1c2VQcm9maWxlU3RvcmUgfSBmcm9tICcuLi9zdG9yZS91c2VQcm9maWxlU3RvcmUnO1xuaW1wb3J0IHsgdXNlRGVib3VuY2UgfSBmcm9tICcuL3VzZURlYm91bmNlJztcbmV4cG9ydCBjb25zdCB1c2VHcm91cHNWaWV3TG9naWMgPSAoKSA9PiB7XG4gICAgLy8gU3RhdGVcbiAgICBjb25zdCBbZ3JvdXBzLCBzZXRHcm91cHNdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dF0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW3NlbGVjdGVkR3JvdXBzLCBzZXRTZWxlY3RlZEdyb3Vwc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgY29uc3QgW2xvYWRpbmdNZXNzYWdlLCBzZXRMb2FkaW5nTWVzc2FnZV0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW3dhcm5pbmdzLCBzZXRXYXJuaW5nc10gPSB1c2VTdGF0ZShbXSk7XG4gICAgLy8gRmlsdGVyc1xuICAgIGNvbnN0IFtncm91cFR5cGVGaWx0ZXIsIHNldEdyb3VwVHlwZUZpbHRlcl0gPSB1c2VTdGF0ZSgnYWxsJyk7XG4gICAgY29uc3QgW3Njb3BlRmlsdGVyLCBzZXRTY29wZUZpbHRlcl0gPSB1c2VTdGF0ZSgnYWxsJyk7XG4gICAgY29uc3QgW3NvdXJjZUZpbHRlciwgc2V0U291cmNlRmlsdGVyXSA9IHVzZVN0YXRlKCdhbGwnKTtcbiAgICAvLyBHZXQgY3VycmVudCBwcm9maWxlIGZyb20gc3RvcmVcbiAgICBjb25zdCB7IGdldEN1cnJlbnRTb3VyY2VQcm9maWxlIH0gPSB1c2VQcm9maWxlU3RvcmUoKTtcbiAgICAvLyBEZWJvdW5jZWQgc2VhcmNoXG4gICAgY29uc3QgZGVib3VuY2VkU2VhcmNoID0gdXNlRGVib3VuY2Uoc2VhcmNoVGV4dCwgMzAwKTtcbiAgICAvKipcbiAgICAgKiBNYXAgR3JvdXBEdG8gZnJvbSBMb2dpYyBFbmdpbmUgdG8gR3JvdXBEYXRhIGZvciB0aGUgdmlld1xuICAgICAqL1xuICAgIGNvbnN0IG1hcEdyb3VwRHRvVG9Hcm91cERhdGEgPSAoZHRvKSA9PiB7XG4gICAgICAgIC8vIFBhcnNlIGdyb3VwIHR5cGUgZnJvbSBUeXBlIHN0cmluZ1xuICAgICAgICBsZXQgZ3JvdXBUeXBlID0gR3JvdXBUeXBlLlNlY3VyaXR5O1xuICAgICAgICBjb25zdCB0eXBlU3RyID0gKGR0by5UeXBlIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBpZiAodHlwZVN0ci5pbmNsdWRlcygnZGlzdHJpYnV0aW9uJykpXG4gICAgICAgICAgICBncm91cFR5cGUgPSBHcm91cFR5cGUuRGlzdHJpYnV0aW9uO1xuICAgICAgICBlbHNlIGlmICh0eXBlU3RyLmluY2x1ZGVzKCdtYWlsJykpXG4gICAgICAgICAgICBncm91cFR5cGUgPSBHcm91cFR5cGUuTWFpbEVuYWJsZWQ7XG4gICAgICAgIGVsc2UgaWYgKHR5cGVTdHIuaW5jbHVkZXMoJ2R5bmFtaWMnKSlcbiAgICAgICAgICAgIGdyb3VwVHlwZSA9IEdyb3VwVHlwZS5EeW5hbWljO1xuICAgICAgICAvLyBEZXRlcm1pbmUgc291cmNlIGZyb20gRGlzY292ZXJ5TW9kdWxlXG4gICAgICAgIGxldCBzb3VyY2UgPSAnQWN0aXZlRGlyZWN0b3J5JztcbiAgICAgICAgY29uc3QgZGlzY292ZXJ5TW9kdWxlID0gZHRvLkRpc2NvdmVyeU1vZHVsZSB8fCAnJztcbiAgICAgICAgaWYgKGRpc2NvdmVyeU1vZHVsZS5pbmNsdWRlcygnQXp1cmUnKSkge1xuICAgICAgICAgICAgc291cmNlID0gJ0F6dXJlQUQnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRpc2NvdmVyeU1vZHVsZS5pbmNsdWRlcygnQWN0aXZlRGlyZWN0b3J5JykgfHwgZGlzY292ZXJ5TW9kdWxlLmluY2x1ZGVzKCdBRCcpKSB7XG4gICAgICAgICAgICBzb3VyY2UgPSAnQWN0aXZlRGlyZWN0b3J5JztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IGR0by5TaWQgfHwgZHRvLk5hbWUsXG4gICAgICAgICAgICBvYmplY3RJZDogZHRvLlNpZCB8fCAnJyxcbiAgICAgICAgICAgIG5hbWU6IGR0by5OYW1lIHx8ICdVbmtub3duJyxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBkdG8uTmFtZSB8fCAnVW5rbm93bicsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZHRvLkRuIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGVtYWlsOiB1bmRlZmluZWQsIC8vIE5vdCBhdmFpbGFibGUgaW4gR3JvdXBEdG9cbiAgICAgICAgICAgIGdyb3VwVHlwZSxcbiAgICAgICAgICAgIHNjb3BlOiBHcm91cFNjb3BlLlVuaXZlcnNhbCwgLy8gRGVmYXVsdCBzY29wZVxuICAgICAgICAgICAgbWVtYmVyc2hpcFR5cGU6IE1lbWJlcnNoaXBUeXBlLlN0YXRpYywgLy8gRGVmYXVsdCBtZW1iZXJzaGlwIHR5cGVcbiAgICAgICAgICAgIG1lbWJlckNvdW50OiBkdG8uTWVtYmVycz8ubGVuZ3RoIHx8IDAsXG4gICAgICAgICAgICBvd25lcnM6IGR0by5NYW5hZ2VkQnkgPyBbZHRvLk1hbmFnZWRCeV0gOiBbXSxcbiAgICAgICAgICAgIGNyZWF0ZWREYXRlOiBkdG8uRGlzY292ZXJ5VGltZXN0YW1wIHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIGxhc3RNb2RpZmllZDogZHRvLkRpc2NvdmVyeVRpbWVzdGFtcCB8fCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICBzb3VyY2UsXG4gICAgICAgICAgICBpc1NlY3VyaXR5RW5hYmxlZDogZ3JvdXBUeXBlID09PSBHcm91cFR5cGUuU2VjdXJpdHksXG4gICAgICAgICAgICBpc01haWxFbmFibGVkOiBncm91cFR5cGUgPT09IEdyb3VwVHlwZS5NYWlsRW5hYmxlZCxcbiAgICAgICAgICAgIGRpc3Rpbmd1aXNoZWROYW1lOiBkdG8uRG4sXG4gICAgICAgICAgICBtYW5hZ2VkQnk6IGR0by5NYW5hZ2VkQnksXG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBMb2FkIGdyb3VwcyBmcm9tIExvZ2ljIEVuZ2luZSAoQ1NWIGRhdGEpXG4gICAgICogUmVwbGljYXRlcyAvZ3VpLyBHcm91cHNWaWV3TW9kZWwuTG9hZEFzeW5jKCkgcGF0dGVyblxuICAgICAqL1xuICAgIGNvbnN0IGxvYWRHcm91cHMgPSBhc3luYyAoZm9yY2VSZWxvYWQgPSBmYWxzZSkgPT4ge1xuICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICBzZXRXYXJuaW5ncyhbXSk7XG4gICAgICAgIHNldExvYWRpbmdNZXNzYWdlKCdMb2FkaW5nIGdyb3VwcyBmcm9tIExvZ2ljIEVuZ2luZS4uLicpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtHcm91cHNWaWV3XSBMb2FkaW5nIGdyb3VwcyBmcm9tIExvZ2ljRW5naW5lLi4uJHtmb3JjZVJlbG9hZCA/ICcgKGZvcmNlIHJlbG9hZCknIDogJyd9YCk7XG4gICAgICAgICAgICAvLyBGb3JjZSByZWxvYWQgZGF0YSBmcm9tIENTViBpZiByZXF1ZXN0ZWRcbiAgICAgICAgICAgIGlmIChmb3JjZVJlbG9hZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbR3JvdXBzVmlld10gRm9yY2luZyBMb2dpY0VuZ2luZSBkYXRhIHJlbG9hZC4uLicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbG9hZFJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5pbnZva2UoJ2xvZ2ljRW5naW5lOmZvcmNlUmVsb2FkJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZWxvYWRSZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVsb2FkUmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gcmVsb2FkIExvZ2ljRW5naW5lIGRhdGEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tHcm91cHNWaWV3XSBMb2dpY0VuZ2luZSBkYXRhIHJlbG9hZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gR2V0IGdyb3VwcyBmcm9tIExvZ2ljIEVuZ2luZVxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmludm9rZSgnbG9naWNFbmdpbmU6Z2V0QWxsR3JvdXBzJyk7XG4gICAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnRmFpbGVkIHRvIGxvYWQgZ3JvdXBzIGZyb20gTG9naWNFbmdpbmUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShyZXN1bHQuZGF0YSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcmVzcG9uc2UgZm9ybWF0IGZyb20gTG9naWNFbmdpbmUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE1hcCBHcm91cER0b1tdIHRvIEdyb3VwRGF0YVtdXG4gICAgICAgICAgICBjb25zdCBtYXBwZWRHcm91cHMgPSByZXN1bHQuZGF0YS5tYXAobWFwR3JvdXBEdG9Ub0dyb3VwRGF0YSk7XG4gICAgICAgICAgICBzZXRHcm91cHMobWFwcGVkR3JvdXBzKTtcbiAgICAgICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtHcm91cHNWaWV3XSBMb2FkZWQgJHttYXBwZWRHcm91cHMubGVuZ3RofSBncm91cHMgZnJvbSBMb2dpY0VuZ2luZWApO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tHcm91cHNWaWV3XSBGYWlsZWQgdG8gbG9hZCBncm91cHM6JywgZXJyKTtcbiAgICAgICAgICAgIHNldEVycm9yKGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiAnRmFpbGVkIHRvIGxvYWQgZ3JvdXBzIGZyb20gTG9naWMgRW5naW5lLicpO1xuICAgICAgICAgICAgc2V0R3JvdXBzKFtdKTsgLy8gU2V0IGVtcHR5IGFycmF5IGluc3RlYWQgb2YgbW9jayBkYXRhXG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgc2V0TG9hZGluZ01lc3NhZ2UoJycpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFeHBvcnQgc2VsZWN0ZWQgZ3JvdXBzIHRvIENTVlxuICAgICAqL1xuICAgIGNvbnN0IGhhbmRsZUV4cG9ydCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGV4cG9ydERhdGEgPSBzZWxlY3RlZEdyb3Vwcy5sZW5ndGggPiAwID8gc2VsZWN0ZWRHcm91cHMgOiBncm91cHM7XG4gICAgICAgICAgICAvLyBDb252ZXJ0IHRvIENTVlxuICAgICAgICAgICAgY29uc3QgY3N2Q29udGVudCA9IGNvbnZlcnRUb0NTVihleHBvcnREYXRhKTtcbiAgICAgICAgICAgIC8vIFNob3cgc2F2ZSBkaWFsb2dcbiAgICAgICAgICAgIGNvbnN0IGZpbGVQYXRoID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLnNob3dTYXZlRGlhbG9nKHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0V4cG9ydCBHcm91cHMnLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRQYXRoOiBgZ3JvdXBzX2V4cG9ydF8ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdfS5jc3ZgLFxuICAgICAgICAgICAgICAgIGZpbHRlcnM6IFt7IG5hbWU6ICdDU1YgRmlsZXMnLCBleHRlbnNpb25zOiBbJ2NzdiddIH1dLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoZmlsZVBhdGgpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkud3JpdGVGaWxlKGZpbGVQYXRoLCBjc3ZDb250ZW50KTtcbiAgICAgICAgICAgICAgICBhbGVydCgnR3JvdXBzIGV4cG9ydGVkIHN1Y2Nlc3NmdWxseSEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFeHBvcnQgZmFpbGVkOicsIGVycik7XG4gICAgICAgICAgICBhbGVydChgRXhwb3J0IGZhaWxlZDogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogRGVsZXRlIHNlbGVjdGVkIGdyb3Vwc1xuICAgICAqIE5vdGU6IEZvciBDU1YtYmFzZWQgZGlzY292ZXJ5IGRhdGEsIHRoaXMgcmVtb3ZlcyBpdGVtcyBmcm9tIGxvY2FsIHN0YXRlIG9ubHkuXG4gICAgICogRGF0YSB3aWxsIHJlbG9hZCBmcm9tIENTViBmaWxlcyBvbiBuZXh0IHJlZnJlc2guXG4gICAgICovXG4gICAgY29uc3QgaGFuZGxlRGVsZXRlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0ZWRHcm91cHMubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBpZiAoIWNvbmZpcm0oYFJlbW92ZSAke3NlbGVjdGVkR3JvdXBzLmxlbmd0aH0gZ3JvdXAocykgZnJvbSB0aGUgdmlldz9cXG5cXG5Ob3RlOiBUaGlzIHJlbW92ZXMgaXRlbXMgZnJvbSB0aGUgY3VycmVudCB2aWV3IG9ubHkuIERhdGEgd2lsbCByZWxvYWQgZnJvbSBDU1YgZmlsZXMgb24gbmV4dCByZWZyZXNoLmApKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEdldCBJRHMgb2YgZ3JvdXBzIHRvIHJlbW92ZVxuICAgICAgICAgICAgY29uc3QgaWRzVG9SZW1vdmUgPSBuZXcgU2V0KHNlbGVjdGVkR3JvdXBzLm1hcChnID0+IGcuaWQpKTtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBmcm9tIGxvY2FsIHN0YXRlXG4gICAgICAgICAgICBzZXRHcm91cHMoKHByZXZHcm91cHMpID0+IHByZXZHcm91cHMuZmlsdGVyKChnKSA9PiAhaWRzVG9SZW1vdmUuaGFzKGcuaWQpKSk7XG4gICAgICAgICAgICBzZXRTZWxlY3RlZEdyb3VwcyhbXSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgW0dyb3Vwc1ZpZXddIFJlbW92ZWQgJHtzZWxlY3RlZEdyb3Vwcy5sZW5ndGh9IGdyb3VwcyBmcm9tIHZpZXdgKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbR3JvdXBzVmlld10gRGVsZXRlIGZhaWxlZDonLCBlcnIpO1xuICAgICAgICAgICAgc2V0RXJyb3IoYEZhaWxlZCB0byByZW1vdmUgZ3JvdXBzIGZyb20gdmlldzogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogVmlldyBncm91cCBtZW1iZXJzXG4gICAgICogT3BlbnMgR3JvdXBNZW1iZXJzTW9kYWxcbiAgICAgKi9cbiAgICBjb25zdCBoYW5kbGVWaWV3TWVtYmVycyA9IChncm91cCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnW0dyb3Vwc1ZpZXddIE9wZW5pbmcgbWVtYmVycyBtb2RhbCBmb3IgZ3JvdXA6JywgZ3JvdXAubmFtZSk7XG4gICAgICAgIC8vIER5bmFtaWNhbGx5IGltcG9ydCBhbmQgcmVuZGVyIEdyb3VwTWVtYmVyc01vZGFsXG4gICAgICAgIGltcG9ydCgnLi4vY29tcG9uZW50cy9kaWFsb2dzL0dyb3VwTWVtYmVyc01vZGFsJykudGhlbigoeyBHcm91cE1lbWJlcnNNb2RhbCB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IG9wZW5Nb2RhbCwgdXBkYXRlTW9kYWwgfSA9IHJlcXVpcmUoJy4uL3N0b3JlL3VzZU1vZGFsU3RvcmUnKS51c2VNb2RhbFN0b3JlLmdldFN0YXRlKCk7XG4gICAgICAgICAgICBjb25zdCBtb2RhbElkID0gb3Blbk1vZGFsKHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnY3VzdG9tJyxcbiAgICAgICAgICAgICAgICB0aXRsZTogYE1lbWJlcnMgb2YgJHtncm91cC5uYW1lfWAsXG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiBHcm91cE1lbWJlcnNNb2RhbCxcbiAgICAgICAgICAgICAgICBwcm9wczoge1xuICAgICAgICAgICAgICAgICAgICBtb2RhbElkOiAnJywgLy8gV2lsbCBiZSB1cGRhdGVkIGJlbG93XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwSWQ6IGdyb3VwLmlkLFxuICAgICAgICAgICAgICAgICAgICBncm91cE5hbWU6IGdyb3VwLm5hbWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzaXplOiAneGwnLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBVcGRhdGUgbW9kYWwgcHJvcHMgd2l0aCBhY3R1YWwgbW9kYWxJZFxuICAgICAgICAgICAgdXBkYXRlTW9kYWwobW9kYWxJZCwge1xuICAgICAgICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGFsSWQsXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwSWQ6IGdyb3VwLmlkLFxuICAgICAgICAgICAgICAgICAgICBncm91cE5hbWU6IGdyb3VwLm5hbWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlZnJlc2ggZ3JvdXBzIGxpc3RcbiAgICAgKiBGb3JjZXMgcmVsb2FkIG9mIGRhdGEgZnJvbSBDU1YgZmlsZXNcbiAgICAgKi9cbiAgICBjb25zdCBoYW5kbGVSZWZyZXNoID0gKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnW0dyb3Vwc1ZpZXddIFJlZnJlc2ggYnV0dG9uIGNsaWNrZWQsIGZvcmNpbmcgZGF0YSByZWxvYWQnKTtcbiAgICAgICAgbG9hZEdyb3Vwcyh0cnVlKTsgLy8gUGFzcyB0cnVlIHRvIGZvcmNlIHJlbG9hZFxuICAgIH07XG4gICAgLy8gU3Vic2NyaWJlIHRvIHNlbGVjdGVkIHNvdXJjZSBwcm9maWxlIGNoYW5nZXNcbiAgICBjb25zdCBzZWxlY3RlZFNvdXJjZVByb2ZpbGUgPSB1c2VQcm9maWxlU3RvcmUoKHN0YXRlKSA9PiBzdGF0ZS5zZWxlY3RlZFNvdXJjZVByb2ZpbGUpO1xuICAgIC8vIExvYWQgZ3JvdXBzIG9uIG1vdW50IGFuZCB3aGVuIHByb2ZpbGUgY2hhbmdlc1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxvYWRHcm91cHMoKTtcbiAgICB9LCBbc2VsZWN0ZWRTb3VyY2VQcm9maWxlXSk7IC8vIFJlbG9hZCB3aGVuIHByb2ZpbGUgY2hhbmdlc1xuICAgIC8vIFN1YnNjcmliZSB0byBmaWxlIGNoYW5nZSBldmVudHMgZm9yIGF1dG8tcmVmcmVzaFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGhhbmRsZURhdGFSZWZyZXNoID0gKGRhdGFUeXBlKSA9PiB7XG4gICAgICAgICAgICBpZiAoKGRhdGFUeXBlID09PSAnR3JvdXBzJyB8fCBkYXRhVHlwZSA9PT0gJ0FsbCcpICYmICFpc0xvYWRpbmcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnW0dyb3Vwc1ZpZXddIEF1dG8tcmVmcmVzaGluZyBkdWUgdG8gZmlsZSBjaGFuZ2VzJyk7XG4gICAgICAgICAgICAgICAgbG9hZEdyb3VwcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvLyBUT0RPOiBTdWJzY3JpYmUgdG8gZmlsZSB3YXRjaGVyIGV2ZW50cyB3aGVuIGF2YWlsYWJsZVxuICAgICAgICAvLyB3aW5kb3cuZWxlY3Ryb25BUEkub24oJ2ZpbGV3YXRjaGVyOmRhdGFDaGFuZ2VkJywgaGFuZGxlRGF0YVJlZnJlc2gpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgLy8gVE9ETzogQ2xlYW51cCBzdWJzY3JpcHRpb25cbiAgICAgICAgICAgIC8vIHdpbmRvdy5lbGVjdHJvbkFQSS5vZmYoJ2ZpbGV3YXRjaGVyOmRhdGFDaGFuZ2VkJywgaGFuZGxlRGF0YVJlZnJlc2gpO1xuICAgICAgICB9O1xuICAgIH0sIFtpc0xvYWRpbmddKTtcbiAgICAvKipcbiAgICAgKiBGaWx0ZXJlZCBncm91cHMgYmFzZWQgb24gc2VhcmNoIGFuZCBmaWx0ZXJzXG4gICAgICovXG4gICAgY29uc3QgZmlsdGVyZWRHcm91cHMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IFsuLi5ncm91cHNdO1xuICAgICAgICAvLyBBcHBseSBzZWFyY2ggZmlsdGVyXG4gICAgICAgIGlmIChkZWJvdW5jZWRTZWFyY2gpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlYXJjaExvd2VyID0gZGVib3VuY2VkU2VhcmNoLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChnKSA9PiAoZy5uYW1lID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSB8fFxuICAgICAgICAgICAgICAgIChnLmRpc3BsYXlOYW1lID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaExvd2VyKSB8fFxuICAgICAgICAgICAgICAgIGcuZGVzY3JpcHRpb24/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoTG93ZXIpIHx8XG4gICAgICAgICAgICAgICAgZy5lbWFpbD8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2hMb3dlcikpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFwcGx5IGdyb3VwIHR5cGUgZmlsdGVyXG4gICAgICAgIGlmIChncm91cFR5cGVGaWx0ZXIgIT09ICdhbGwnKSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuZmlsdGVyKChnKSA9PiBnLmdyb3VwVHlwZSA9PT0gZ3JvdXBUeXBlRmlsdGVyKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBcHBseSBzY29wZSBmaWx0ZXJcbiAgICAgICAgaWYgKHNjb3BlRmlsdGVyICE9PSAnYWxsJykge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmZpbHRlcigoZykgPT4gZy5zY29wZSA9PT0gc2NvcGVGaWx0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFwcGx5IHNvdXJjZSBmaWx0ZXJcbiAgICAgICAgaWYgKHNvdXJjZUZpbHRlciAhPT0gJ2FsbCcpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5maWx0ZXIoKGcpID0+IGcuc291cmNlID09PSBzb3VyY2VGaWx0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgW2dyb3VwcywgZGVib3VuY2VkU2VhcmNoLCBncm91cFR5cGVGaWx0ZXIsIHNjb3BlRmlsdGVyLCBzb3VyY2VGaWx0ZXJdKTtcbiAgICAvKipcbiAgICAgKiBDb2x1bW4gZGVmaW5pdGlvbnMgZm9yIEFHIEdyaWRcbiAgICAgKiBVcGRhdGVkIGZvciBFcGljIDEgVGFzayAxLjQgLSBBZGRlZCBWaWV3IERldGFpbHMgYWN0aW9uXG4gICAgICovXG4gICAgY29uc3QgY29sdW1uRGVmcyA9IHVzZU1lbW8oKCkgPT4gW1xuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ25hbWUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0dyb3VwIE5hbWUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBmbGV4OiAyLFxuICAgICAgICAgICAgY2hlY2tib3hTZWxlY3Rpb246IHRydWUsXG4gICAgICAgICAgICBoZWFkZXJDaGVja2JveFNlbGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkaXNwbGF5TmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGlzcGxheSBOYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgZmxleDogMixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdncm91cFR5cGUnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ1R5cGUnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3Njb3BlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdTY29wZScsXG4gICAgICAgICAgICBzb3J0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGZpbHRlcjogdHJ1ZSxcbiAgICAgICAgICAgIHdpZHRoOiAxMzAsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnbWVtYmVyQ291bnQnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ01lbWJlcnMnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6ICdhZ051bWJlckNvbHVtbkZpbHRlcicsXG4gICAgICAgICAgICB3aWR0aDogMTIwLFxuICAgICAgICAgICAgdHlwZTogJ251bWVyaWNDb2x1bW4nLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ3NvdXJjZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnU291cmNlJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEzMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdlbWFpbCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRW1haWwnLFxuICAgICAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgICAgICBmaWx0ZXI6IHRydWUsXG4gICAgICAgICAgICBmbGV4OiAyLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBmaWVsZDogJ2NyZWF0ZWREYXRlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdDcmVhdGVkJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiAnYWdEYXRlQ29sdW1uRmlsdGVyJyxcbiAgICAgICAgICAgIHdpZHRoOiAxNTAsXG4gICAgICAgICAgICB2YWx1ZUZvcm1hdHRlcjogKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGFyYW1zLnZhbHVlKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHBhcmFtcy52YWx1ZSkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIF0sIFtdKTtcbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IGdyb3VwcyB0byBDU1YgZm9ybWF0XG4gICAgICovXG4gICAgY29uc3QgY29udmVydFRvQ1NWID0gKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IFtcbiAgICAgICAgICAgICdOYW1lJyxcbiAgICAgICAgICAgICdEaXNwbGF5IE5hbWUnLFxuICAgICAgICAgICAgJ1R5cGUnLFxuICAgICAgICAgICAgJ1Njb3BlJyxcbiAgICAgICAgICAgICdNZW1iZXJzJyxcbiAgICAgICAgICAgICdTb3VyY2UnLFxuICAgICAgICAgICAgJ0VtYWlsJyxcbiAgICAgICAgICAgICdEZXNjcmlwdGlvbicsXG4gICAgICAgICAgICAnQ3JlYXRlZCBEYXRlJyxcbiAgICAgICAgXTtcbiAgICAgICAgY29uc3Qgcm93cyA9IChkYXRhID8/IFtdKS5tYXAoKGcpID0+IFtcbiAgICAgICAgICAgIGcubmFtZSxcbiAgICAgICAgICAgIGcuZGlzcGxheU5hbWUsXG4gICAgICAgICAgICBnLmdyb3VwVHlwZSxcbiAgICAgICAgICAgIGcuc2NvcGUsXG4gICAgICAgICAgICBnLm1lbWJlckNvdW50LnRvU3RyaW5nKCksXG4gICAgICAgICAgICBnLnNvdXJjZSxcbiAgICAgICAgICAgIGcuZW1haWwgfHwgJycsXG4gICAgICAgICAgICBnLmRlc2NyaXB0aW9uIHx8ICcnLFxuICAgICAgICAgICAgZy5jcmVhdGVkRGF0ZSxcbiAgICAgICAgXSk7XG4gICAgICAgIGNvbnN0IGNzdlJvd3MgPSBbaGVhZGVycywgLi4ucm93c10ubWFwKChyb3cpID0+IHJvdy5tYXAoKGNlbGwpID0+IGBcIiR7Y2VsbC5yZXBsYWNlKC9cIi9nLCAnXCJcIicpfVwiYCkuam9pbignLCcpKTtcbiAgICAgICAgcmV0dXJuIGNzdlJvd3Muam9pbignXFxuJyk7XG4gICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgICBncm91cHM6IGZpbHRlcmVkR3JvdXBzLFxuICAgICAgICBpc0xvYWRpbmcsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBzZWFyY2hUZXh0LFxuICAgICAgICBzZXRTZWFyY2hUZXh0LFxuICAgICAgICBzZWxlY3RlZEdyb3VwcyxcbiAgICAgICAgc2V0U2VsZWN0ZWRHcm91cHMsXG4gICAgICAgIGdyb3VwVHlwZUZpbHRlcixcbiAgICAgICAgc2V0R3JvdXBUeXBlRmlsdGVyLFxuICAgICAgICBzY29wZUZpbHRlcixcbiAgICAgICAgc2V0U2NvcGVGaWx0ZXIsXG4gICAgICAgIHNvdXJjZUZpbHRlcixcbiAgICAgICAgc2V0U291cmNlRmlsdGVyLFxuICAgICAgICBjb2x1bW5EZWZzLFxuICAgICAgICBoYW5kbGVFeHBvcnQsXG4gICAgICAgIGhhbmRsZURlbGV0ZSxcbiAgICAgICAgaGFuZGxlVmlld01lbWJlcnMsXG4gICAgICAgIGhhbmRsZVJlZnJlc2gsXG4gICAgICAgIHRvdGFsR3JvdXBzOiBncm91cHMubGVuZ3RoLFxuICAgICAgICBmaWx0ZXJlZENvdW50OiBmaWx0ZXJlZEdyb3Vwcy5sZW5ndGgsXG4gICAgICAgIGxvYWRpbmdNZXNzYWdlLFxuICAgICAgICB3YXJuaW5ncyxcbiAgICB9O1xufTtcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIEZpbHRlclBhbmVsIENvbXBvbmVudFxuICpcbiAqIENvbGxhcHNpYmxlIHBhbmVsIGNvbnRhaW5pbmcgbXVsdGlwbGUgZmlsdGVyIGlucHV0cy5cbiAqIFVzZWQgZm9yIGFkdmFuY2VkIGZpbHRlcmluZyBpbiBkYXRhIHZpZXdzLlxuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBDaGV2cm9uRG93biwgQ2hldnJvblVwLCBYIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL2F0b21zL0J1dHRvbic7XG4vKipcbiAqIEZpbHRlclBhbmVsIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgRmlsdGVyUGFuZWwgPSAoeyBmaWx0ZXJzLCBvbkZpbHRlckNoYW5nZSwgb25SZXNldCwgZGVmYXVsdENvbGxhcHNlZCA9IGZhbHNlLCB0aXRsZSA9ICdGaWx0ZXJzJywgY2xhc3NOYW1lLCAnZGF0YS1jeSc6IGRhdGFDeSwgfSkgPT4ge1xuICAgIGNvbnN0IFtpc0NvbGxhcHNlZCwgc2V0SXNDb2xsYXBzZWRdID0gdXNlU3RhdGUoZGVmYXVsdENvbGxhcHNlZCk7XG4gICAgY29uc3QgaGFuZGxlRmlsdGVyQ2hhbmdlID0gKGZpbHRlcklkLCB2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAob25GaWx0ZXJDaGFuZ2UpIHtcbiAgICAgICAgICAgIG9uRmlsdGVyQ2hhbmdlKGZpbHRlcklkLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZVJlc2V0ID0gKCkgPT4ge1xuICAgICAgICBpZiAob25SZXNldCkge1xuICAgICAgICAgICAgb25SZXNldCgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCB0b2dnbGVDb2xsYXBzZSA9ICgpID0+IHtcbiAgICAgICAgc2V0SXNDb2xsYXBzZWQoIWlzQ29sbGFwc2VkKTtcbiAgICB9O1xuICAgIC8vIENoZWNrIGlmIGFueSBmaWx0ZXJzIGhhdmUgdmFsdWVzXG4gICAgY29uc3QgaGFzQWN0aXZlRmlsdGVycyA9IGZpbHRlcnMuc29tZShmID0+IHtcbiAgICAgICAgaWYgKGYudHlwZSA9PT0gJ2NoZWNrYm94JylcbiAgICAgICAgICAgIHJldHVybiBmLnZhbHVlID09PSB0cnVlO1xuICAgICAgICByZXR1cm4gZi52YWx1ZSAhPT0gdW5kZWZpbmVkICYmIGYudmFsdWUgIT09ICcnICYmIGYudmFsdWUgIT09IG51bGw7XG4gICAgfSk7XG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsc3goJ2JvcmRlciBib3JkZXItZ3JheS0zMDAgcm91bmRlZC1sZyBiZy13aGl0ZSBzaGFkb3ctc20nLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIFwiZGF0YS1jeVwiOiBkYXRhQ3ksIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHB4LTQgcHktMyBib3JkZXItYiBib3JkZXItZ3JheS0yMDBcIiwgY2hpbGRyZW46IFtfanN4cyhcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IHRvZ2dsZUNvbGxhcHNlLCBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgdGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZ3JheS03MDAgaG92ZXI6dGV4dC1ncmF5LTkwMCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgcm91bmRlZFwiLCBjaGlsZHJlbjogW19qc3goXCJzcGFuXCIsIHsgY2hpbGRyZW46IHRpdGxlIH0pLCBoYXNBY3RpdmVGaWx0ZXJzICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgdy01IGgtNSB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtd2hpdGUgYmctYmx1ZS01MDAgcm91bmRlZC1mdWxsXCIsIGNoaWxkcmVuOiBmaWx0ZXJzLmZpbHRlcihmID0+IGYudmFsdWUpLmxlbmd0aCB9KSksIGlzQ29sbGFwc2VkID8gKF9qc3goQ2hldnJvbkRvd24sIHsgY2xhc3NOYW1lOiBcImgtNCB3LTRcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSkgOiAoX2pzeChDaGV2cm9uVXAsIHsgY2xhc3NOYW1lOiBcImgtNCB3LTRcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSldIH0pLCBoYXNBY3RpdmVGaWx0ZXJzICYmICFpc0NvbGxhcHNlZCAmJiAoX2pzeChCdXR0b24sIHsgdmFyaWFudDogXCJnaG9zdFwiLCBzaXplOiBcInNtXCIsIG9uQ2xpY2s6IGhhbmRsZVJlc2V0LCBpY29uOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBcImgtNCB3LTRcIiB9KSwgXCJkYXRhLWN5XCI6IFwiZmlsdGVyLXJlc2V0XCIsIGNoaWxkcmVuOiBcIlJlc2V0XCIgfSkpXSB9KSwgIWlzQ29sbGFwc2VkICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInAtNCBzcGFjZS15LTRcIiwgY2hpbGRyZW46IGZpbHRlcnMubWFwKChmaWx0ZXIpID0+IChfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImxhYmVsXCIsIHsgaHRtbEZvcjogZmlsdGVyLmlkLCBjbGFzc05hbWU6IFwiYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWdyYXktNzAwIG1iLTFcIiwgY2hpbGRyZW46IGZpbHRlci5sYWJlbCB9KSwgZmlsdGVyLnR5cGUgPT09ICd0ZXh0JyAmJiAoX2pzeChcImlucHV0XCIsIHsgaWQ6IGZpbHRlci5pZCwgdHlwZTogXCJ0ZXh0XCIsIHZhbHVlOiBmaWx0ZXIudmFsdWUgfHwgJycsIG9uQ2hhbmdlOiAoZSkgPT4gaGFuZGxlRmlsdGVyQ2hhbmdlKGZpbHRlci5pZCwgZS50YXJnZXQudmFsdWUpLCBwbGFjZWhvbGRlcjogZmlsdGVyLnBsYWNlaG9sZGVyLCBjbGFzc05hbWU6IFwiYmxvY2sgdy1mdWxsIHJvdW5kZWQtbWQgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCBweC0zIHB5LTIgdGV4dC1zbSBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgZm9jdXM6Ym9yZGVyLWJsdWUtNTAwXCIsIFwiZGF0YS1jeVwiOiBgZmlsdGVyLSR7ZmlsdGVyLmlkfWAgfSkpLCBmaWx0ZXIudHlwZSA9PT0gJ3NlbGVjdCcgJiYgKF9qc3hzKFwic2VsZWN0XCIsIHsgaWQ6IGZpbHRlci5pZCwgdmFsdWU6IGZpbHRlci52YWx1ZSB8fCAnJywgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVGaWx0ZXJDaGFuZ2UoZmlsdGVyLmlkLCBlLnRhcmdldC52YWx1ZSksIGNsYXNzTmFtZTogXCJibG9jayB3LWZ1bGwgcm91bmRlZC1tZCBib3JkZXIgYm9yZGVyLWdyYXktMzAwIHB4LTMgcHktMiB0ZXh0LXNtIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCBmb2N1czpib3JkZXItYmx1ZS01MDBcIiwgXCJkYXRhLWN5XCI6IGBmaWx0ZXItJHtmaWx0ZXIuaWR9YCwgY2hpbGRyZW46IFtfanN4KFwib3B0aW9uXCIsIHsgdmFsdWU6IFwiXCIsIGNoaWxkcmVuOiBcIkFsbFwiIH0pLCBmaWx0ZXIub3B0aW9ucz8ubWFwKChvcHRpb24pID0+IChfanN4KFwib3B0aW9uXCIsIHsgdmFsdWU6IG9wdGlvbi52YWx1ZSwgY2hpbGRyZW46IG9wdGlvbi5sYWJlbCB9LCBvcHRpb24udmFsdWUpKSldIH0pKSwgZmlsdGVyLnR5cGUgPT09ICdkYXRlJyAmJiAoX2pzeChcImlucHV0XCIsIHsgaWQ6IGZpbHRlci5pZCwgdHlwZTogXCJkYXRlXCIsIHZhbHVlOiBmaWx0ZXIudmFsdWUgfHwgJycsIG9uQ2hhbmdlOiAoZSkgPT4gaGFuZGxlRmlsdGVyQ2hhbmdlKGZpbHRlci5pZCwgZS50YXJnZXQudmFsdWUpLCBjbGFzc05hbWU6IFwiYmxvY2sgdy1mdWxsIHJvdW5kZWQtbWQgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCBweC0zIHB5LTIgdGV4dC1zbSBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgZm9jdXM6Ym9yZGVyLWJsdWUtNTAwXCIsIFwiZGF0YS1jeVwiOiBgZmlsdGVyLSR7ZmlsdGVyLmlkfWAgfSkpLCBmaWx0ZXIudHlwZSA9PT0gJ2NoZWNrYm94JyAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXJcIiwgY2hpbGRyZW46IFtfanN4KFwiaW5wdXRcIiwgeyBpZDogZmlsdGVyLmlkLCB0eXBlOiBcImNoZWNrYm94XCIsIGNoZWNrZWQ6IGZpbHRlci52YWx1ZSB8fCBmYWxzZSwgb25DaGFuZ2U6IChlKSA9PiBoYW5kbGVGaWx0ZXJDaGFuZ2UoZmlsdGVyLmlkLCBlLnRhcmdldC5jaGVja2VkKSwgY2xhc3NOYW1lOiBcImgtNCB3LTQgcm91bmRlZCBib3JkZXItZ3JheS0zMDAgdGV4dC1ibHVlLTYwMCBmb2N1czpyaW5nLWJsdWUtNTAwXCIsIFwiZGF0YS1jeVwiOiBgZmlsdGVyLSR7ZmlsdGVyLmlkfWAgfSksIF9qc3goXCJsYWJlbFwiLCB7IGh0bWxGb3I6IGZpbHRlci5pZCwgY2xhc3NOYW1lOiBcIm1sLTIgdGV4dC1zbSB0ZXh0LWdyYXktNjAwXCIsIGNoaWxkcmVuOiBmaWx0ZXIucGxhY2Vob2xkZXIgfHwgJ0VuYWJsZScgfSldIH0pKV0gfSwgZmlsdGVyLmlkKSkpIH0pKV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IEZpbHRlclBhbmVsO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogR3JvdXBzIFZpZXdcbiAqXG4gKiBNYWluIHZpZXcgZm9yIG1hbmFnaW5nIEFjdGl2ZSBEaXJlY3RvcnkgYW5kIEF6dXJlIEFEIGdyb3Vwcy5cbiAqIEZlYXR1cmVzOiBzZWFyY2gsIGZpbHRlciwgZXhwb3J0LCBkZWxldGUsIHZpZXcgbWVtYmVycy5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VOYXZpZ2F0ZSB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuaW1wb3J0IHsgdXNlRHJhZyB9IGZyb20gJ3JlYWN0LWRuZCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgVHJhc2gyLCBSZWZyZXNoQ3csIFBsdXMsIEV5ZSwgR3JpcFZlcnRpY2FsIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcbmltcG9ydCB7IHVzZUdyb3Vwc1ZpZXdMb2dpYyB9IGZyb20gJy4uLy4uL2hvb2tzL3VzZUdyb3Vwc1ZpZXdMb2dpYyc7XG5pbXBvcnQgeyBWaXJ0dWFsaXplZERhdGFHcmlkIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9vcmdhbmlzbXMvVmlydHVhbGl6ZWREYXRhR3JpZCc7XG5pbXBvcnQgeyBTZWFyY2hCYXIgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL21vbGVjdWxlcy9TZWFyY2hCYXInO1xuaW1wb3J0IHsgRmlsdGVyUGFuZWwgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL21vbGVjdWxlcy9GaWx0ZXJQYW5lbCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2F0b21zL0J1dHRvbic7XG5pbXBvcnQgeyBCYWRnZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYXRvbXMvQmFkZ2UnO1xuaW1wb3J0IHsgR3JvdXBUeXBlLCBHcm91cFNjb3BlIH0gZnJvbSAnLi4vLi4vdHlwZXMvbW9kZWxzL2dyb3VwJztcbi8qKlxuICogRHJhZ2dhYmxlIGNlbGwgY29tcG9uZW50IGZvciBkcmFnIGhhbmRsZVxuICovXG5jb25zdCBEcmFnSGFuZGxlQ2VsbCA9ICh7IGRhdGEgfSkgPT4ge1xuICAgIGNvbnN0IFt7IGlzRHJhZ2dpbmcgfSwgZHJhZ10gPSB1c2VEcmFnKHtcbiAgICAgICAgdHlwZTogJ0dST1VQJyxcbiAgICAgICAgaXRlbTogKCkgPT4gKHtcbiAgICAgICAgICAgIGlkOiBkYXRhLmlkIHx8IGRhdGEub2JqZWN0SWQgfHwgJycsXG4gICAgICAgICAgICB0eXBlOiAnR1JPVVAnLFxuICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgfSksXG4gICAgICAgIGNvbGxlY3Q6IChtb25pdG9yKSA9PiAoe1xuICAgICAgICAgICAgaXNEcmFnZ2luZzogbW9uaXRvci5pc0RyYWdnaW5nKCksXG4gICAgICAgIH0pLFxuICAgIH0pO1xuICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IHJlZjogZHJhZywgY2xhc3NOYW1lOiBjbHN4KCdmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBjdXJzb3ItbW92ZSBoLWZ1bGwnLCBpc0RyYWdnaW5nICYmICdvcGFjaXR5LTUwJyksIHRpdGxlOiBcIkRyYWcgdG8gYWRkIHRvIG1pZ3JhdGlvbiB3YXZlXCIsIFwiZGF0YS1jeVwiOiBcImdyb3VwLWRyYWctaGFuZGxlXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJncm91cC1kcmFnLWhhbmRsZVwiLCBjaGlsZHJlbjogX2pzeChHcmlwVmVydGljYWwsIHsgc2l6ZTogMTYsIGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNDAwIGhvdmVyOnRleHQtZ3JheS02MDAgZGFyazpob3Zlcjp0ZXh0LWdyYXktMzAwXCIgfSkgfSkpO1xufTtcbi8qKlxuICogR3JvdXBzVmlldyBDb21wb25lbnRcbiAqIFVwZGF0ZWQgZm9yIEVwaWMgMSBUYXNrIDEuNCAtIEFkZGVkIFZpZXcgRGV0YWlscyBuYXZpZ2F0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBHcm91cHNWaWV3ID0gKCkgPT4ge1xuICAgIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKTtcbiAgICBjb25zdCB7IGdyb3VwcywgaXNMb2FkaW5nLCBlcnJvciwgc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dCwgc2VsZWN0ZWRHcm91cHMsIHNldFNlbGVjdGVkR3JvdXBzLCBncm91cFR5cGVGaWx0ZXIsIHNldEdyb3VwVHlwZUZpbHRlciwgc2NvcGVGaWx0ZXIsIHNldFNjb3BlRmlsdGVyLCBzb3VyY2VGaWx0ZXIsIHNldFNvdXJjZUZpbHRlciwgY29sdW1uRGVmcywgaGFuZGxlRXhwb3J0LCBoYW5kbGVEZWxldGUsIGhhbmRsZVJlZnJlc2gsIHRvdGFsR3JvdXBzLCBmaWx0ZXJlZENvdW50LCB9ID0gdXNlR3JvdXBzVmlld0xvZ2ljKCk7XG4gICAgLy8gSGFuZGxlciBmb3Igdmlld2luZyBncm91cCBkZXRhaWxzXG4gICAgY29uc3QgaGFuZGxlVmlld0RldGFpbHMgPSAoZ3JvdXApID0+IHtcbiAgICAgICAgbmF2aWdhdGUoYC9ncm91cHMvJHtncm91cC5pZH1gKTtcbiAgICB9O1xuICAgIC8vIEV4dGVuZGVkIGNvbHVtbiBkZWZpbml0aW9ucyB3aXRoIGRyYWcgaGFuZGxlIGFuZCBWaWV3IERldGFpbHMgYWN0aW9uXG4gICAgY29uc3QgZXh0ZW5kZWRDb2x1bW5EZWZzID0gdXNlTWVtbygoKSA9PiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICcnLFxuICAgICAgICAgICAgd2lkdGg6IDUwLFxuICAgICAgICAgICAgcGlubmVkOiAnbGVmdCcsXG4gICAgICAgICAgICBzdXBwcmVzc01lbnU6IHRydWUsXG4gICAgICAgICAgICBzb3J0YWJsZTogZmFsc2UsXG4gICAgICAgICAgICBmaWx0ZXI6IGZhbHNlLFxuICAgICAgICAgICAgcmVzaXphYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4gX2pzeChEcmFnSGFuZGxlQ2VsbCwgeyBkYXRhOiBwYXJhbXMuZGF0YSB9KSxcbiAgICAgICAgfSxcbiAgICAgICAgLi4uY29sdW1uRGVmcyxcbiAgICAgICAge1xuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0FjdGlvbnMnLFxuICAgICAgICAgICAgd2lkdGg6IDE1MCxcbiAgICAgICAgICAgIHBpbm5lZDogJ3JpZ2h0JyxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4gKF9qc3hzKEJ1dHRvbiwgeyBvbkNsaWNrOiAoKSA9PiBoYW5kbGVWaWV3RGV0YWlscyhwYXJhbXMuZGF0YSksIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwic21cIiwgXCJkYXRhLWN5XCI6IFwidmlldy1ncm91cC1kZXRhaWxzXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJ2aWV3LWdyb3VwLWRldGFpbHNcIiwgY2hpbGRyZW46IFtfanN4KEV5ZSwgeyBjbGFzc05hbWU6IFwibXItMSBoLTMgdy0zXCIgfSksIFwiVmlldyBEZXRhaWxzXCJdIH0pKSxcbiAgICAgICAgfSxcbiAgICBdLCBbY29sdW1uRGVmc10pO1xuICAgIC8vIEZpbHRlciBjb25maWd1cmF0aW9uXG4gICAgY29uc3QgZmlsdGVycyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdncm91cFR5cGUnLFxuICAgICAgICAgICAgbGFiZWw6ICdHcm91cCBUeXBlJyxcbiAgICAgICAgICAgIHR5cGU6ICdzZWxlY3QnLFxuICAgICAgICAgICAgdmFsdWU6IGdyb3VwVHlwZUZpbHRlcixcbiAgICAgICAgICAgIG9wdGlvbnM6IFtcbiAgICAgICAgICAgICAgICB7IHZhbHVlOiAnYWxsJywgbGFiZWw6ICdBbGwgVHlwZXMnIH0sXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogR3JvdXBUeXBlLlNlY3VyaXR5LCBsYWJlbDogJ1NlY3VyaXR5JyB9LFxuICAgICAgICAgICAgICAgIHsgdmFsdWU6IEdyb3VwVHlwZS5EaXN0cmlidXRpb24sIGxhYmVsOiAnRGlzdHJpYnV0aW9uJyB9LFxuICAgICAgICAgICAgICAgIHsgdmFsdWU6IEdyb3VwVHlwZS5NYWlsRW5hYmxlZCwgbGFiZWw6ICdNYWlsLUVuYWJsZWQnIH0sXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogR3JvdXBUeXBlLk9mZmljZTM2NSwgbGFiZWw6ICdPZmZpY2UgMzY1JyB9LFxuICAgICAgICAgICAgICAgIHsgdmFsdWU6IEdyb3VwVHlwZS5EeW5hbWljLCBsYWJlbDogJ0R5bmFtaWMnIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ3Njb3BlJyxcbiAgICAgICAgICAgIGxhYmVsOiAnU2NvcGUnLFxuICAgICAgICAgICAgdHlwZTogJ3NlbGVjdCcsXG4gICAgICAgICAgICB2YWx1ZTogc2NvcGVGaWx0ZXIsXG4gICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogJ2FsbCcsIGxhYmVsOiAnQWxsIFNjb3BlcycgfSxcbiAgICAgICAgICAgICAgICB7IHZhbHVlOiBHcm91cFNjb3BlLlVuaXZlcnNhbCwgbGFiZWw6ICdVbml2ZXJzYWwnIH0sXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogR3JvdXBTY29wZS5HbG9iYWwsIGxhYmVsOiAnR2xvYmFsJyB9LFxuICAgICAgICAgICAgICAgIHsgdmFsdWU6IEdyb3VwU2NvcGUuRG9tYWluTG9jYWwsIGxhYmVsOiAnRG9tYWluIExvY2FsJyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgaWQ6ICdzb3VyY2UnLFxuICAgICAgICAgICAgbGFiZWw6ICdTb3VyY2UnLFxuICAgICAgICAgICAgdHlwZTogJ3NlbGVjdCcsXG4gICAgICAgICAgICB2YWx1ZTogc291cmNlRmlsdGVyLFxuICAgICAgICAgICAgb3B0aW9uczogW1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdhbGwnLCBsYWJlbDogJ0FsbCBTb3VyY2VzJyB9LFxuICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdBY3RpdmVEaXJlY3RvcnknLCBsYWJlbDogJ0FjdGl2ZSBEaXJlY3RvcnknIH0sXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogJ0F6dXJlQUQnLCBsYWJlbDogJ0F6dXJlIEFEJyB9LFxuICAgICAgICAgICAgICAgIHsgdmFsdWU6ICdIeWJyaWQnLCBsYWJlbDogJ0h5YnJpZCcgfSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgXTtcbiAgICBjb25zdCBoYW5kbGVGaWx0ZXJDaGFuZ2UgPSAoZmlsdGVySWQsIHZhbHVlKSA9PiB7XG4gICAgICAgIHN3aXRjaCAoZmlsdGVySWQpIHtcbiAgICAgICAgICAgIGNhc2UgJ2dyb3VwVHlwZSc6XG4gICAgICAgICAgICAgICAgc2V0R3JvdXBUeXBlRmlsdGVyKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3Njb3BlJzpcbiAgICAgICAgICAgICAgICBzZXRTY29wZUZpbHRlcih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzb3VyY2UnOlxuICAgICAgICAgICAgICAgIHNldFNvdXJjZUZpbHRlcih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZVJlc2V0RmlsdGVycyA9ICgpID0+IHtcbiAgICAgICAgc2V0R3JvdXBUeXBlRmlsdGVyKCdhbGwnKTtcbiAgICAgICAgc2V0U2NvcGVGaWx0ZXIoJ2FsbCcpO1xuICAgICAgICBzZXRTb3VyY2VGaWx0ZXIoJ2FsbCcpO1xuICAgICAgICBzZXRTZWFyY2hUZXh0KCcnKTtcbiAgICB9O1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGZsZXggZmxleC1jb2wgYmctZ3JheS01MCBkYXJrOmJnLWdyYXktOTAwXCIsIFwiZGF0YS1jeVwiOiBcImdyb3Vwcy12aWV3XCIsIFwiZGF0YS10ZXN0aWRcIjogXCJncm91cHMtdmlld1wiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYmctd2hpdGUgZGFyazpiZy1ncmF5LTgwMCBib3JkZXItYiBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDAgcHgtNiBweS00XCIsIGNoaWxkcmVuOiBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNoaWxkcmVuOiBbX2pzeChcImgxXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWdyYXktOTAwIGRhcms6dGV4dC1ncmF5LTEwMFwiLCBjaGlsZHJlbjogXCJHcm91cHNcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwibXQtMSB0ZXh0LXNtIHRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwXCIsIGNoaWxkcmVuOiBcIk1hbmFnZSBBY3RpdmUgRGlyZWN0b3J5IGFuZCBBenVyZSBBRCBncm91cHNcIiB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeHMoQmFkZ2UsIHsgdmFyaWFudDogXCJpbmZvXCIsIHNpemU6IFwibGdcIiwgY2hpbGRyZW46IFtmaWx0ZXJlZENvdW50LCBcIiBvZiBcIiwgdG90YWxHcm91cHMsIFwiIGdyb3Vwc1wiXSB9KSwgX2pzeChCdXR0b24sIHsgb25DbGljazogaGFuZGxlUmVmcmVzaCwgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgc2l6ZTogXCJtZFwiLCBpY29uOiBfanN4KFJlZnJlc2hDdywgeyBjbGFzc05hbWU6IGNsc3goJ2gtNCB3LTQnLCB7ICdhbmltYXRlLXNwaW4nOiBpc0xvYWRpbmcgfSkgfSksIGRpc2FibGVkOiBpc0xvYWRpbmcsIFwiZGF0YS1jeVwiOiBcInJlZnJlc2gtYnRuXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJyZWZyZXNoLWJ0blwiLCBjaGlsZHJlbjogXCJSZWZyZXNoXCIgfSksIF9qc3goQnV0dG9uLCB7IG9uQ2xpY2s6IGhhbmRsZUV4cG9ydCwgdmFyaWFudDogXCJzZWNvbmRhcnlcIiwgc2l6ZTogXCJtZFwiLCBpY29uOiBfanN4KERvd25sb2FkLCB7IGNsYXNzTmFtZTogXCJoLTQgdy00XCIgfSksIGRpc2FibGVkOiBpc0xvYWRpbmcsIFwiZGF0YS1jeVwiOiBcImV4cG9ydC1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcImV4cG9ydC1idG5cIiwgY2hpbGRyZW46IFwiRXhwb3J0XCIgfSksIF9qc3hzKEJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVEZWxldGUsIHZhcmlhbnQ6IFwiZGFuZ2VyXCIsIHNpemU6IFwibWRcIiwgaWNvbjogX2pzeChUcmFzaDIsIHsgY2xhc3NOYW1lOiBcImgtNCB3LTRcIiB9KSwgZGlzYWJsZWQ6IHNlbGVjdGVkR3JvdXBzLmxlbmd0aCA9PT0gMCB8fCBpc0xvYWRpbmcsIFwiZGF0YS1jeVwiOiBcImRlbGV0ZS1idG5cIiwgXCJkYXRhLXRlc3RpZFwiOiBcImRlbGV0ZS1idG5cIiwgY2hpbGRyZW46IFtcIkRlbGV0ZSAoXCIsIHNlbGVjdGVkR3JvdXBzLmxlbmd0aCwgXCIpXCJdIH0pLCBfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogTW9kYWwgZnVuY3Rpb25hbGl0eSB0ZW1wb3JhcmlseSBkaXNhYmxlZCBkdWUgdG8gaW1wb3J0IGlzc3Vlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDcmVhdGUgR3JvdXAgZnVuY3Rpb25hbGl0eSAtIHRlbXBvcmFyaWx5IGRpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogSW1wbGVtZW50IHByb3BlciBtb2RhbCBvcGVuaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB2YXJpYW50OiBcInByaW1hcnlcIiwgc2l6ZTogXCJtZFwiLCBpY29uOiBfanN4KFBsdXMsIHsgY2xhc3NOYW1lOiBcImgtNCB3LTRcIiB9KSwgZGlzYWJsZWQ6IGlzTG9hZGluZywgXCJkYXRhLWN5XCI6IFwiY3JlYXRlLWJ0blwiLCBcImRhdGEtdGVzdGlkXCI6IFwiY3JlYXRlLWJ0blwiLCBjaGlsZHJlbjogXCJDcmVhdGUgR3JvdXBcIiB9KV0gfSldIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBweC02IHB5LTQgc3BhY2UteS00XCIsIGNoaWxkcmVuOiBbX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNFwiLCBjaGlsZHJlbjogX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTFcIiwgY2hpbGRyZW46IF9qc3goU2VhcmNoQmFyLCB7IHZhbHVlOiBzZWFyY2hUZXh0LCBvbkNoYW5nZTogc2V0U2VhcmNoVGV4dCwgcGxhY2Vob2xkZXI6IFwiU2VhcmNoIGdyb3VwcyBieSBuYW1lLCBlbWFpbCwgb3IgZGVzY3JpcHRpb24uLi5cIiwgZGlzYWJsZWQ6IGlzTG9hZGluZywgXCJkYXRhLWN5XCI6IFwiZ3JvdXAtc2VhcmNoXCIsIFwiZGF0YS10ZXN0aWRcIjogXCJncm91cC1zZWFyY2hcIiB9KSB9KSB9KSwgX2pzeChGaWx0ZXJQYW5lbCwgeyBmaWx0ZXJzOiBmaWx0ZXJzLCBvbkZpbHRlckNoYW5nZTogaGFuZGxlRmlsdGVyQ2hhbmdlLCBvblJlc2V0OiBoYW5kbGVSZXNldEZpbHRlcnMsIHRpdGxlOiBcIkFkdmFuY2VkIEZpbHRlcnNcIiwgZGVmYXVsdENvbGxhcHNlZDogdHJ1ZSwgXCJkYXRhLWN5XCI6IFwiZ3JvdXAtZmlsdGVyc1wiLCBcImRhdGEtdGVzdGlkXCI6IFwiZ3JvdXAtZmlsdGVyc1wiIH0pXSB9KSwgZXJyb3IgJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwibXgtNiBtdC00IHAtNCBiZy1yZWQtNTAgYm9yZGVyIGJvcmRlci1yZWQtMjAwIHJvdW5kZWQtbGdcIiwgY2hpbGRyZW46IF9qc3goXCJwXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1yZWQtODAwXCIsIGNoaWxkcmVuOiBlcnJvciB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleC0xIHB4LTYgcHktNCBvdmVyZmxvdy1oaWRkZW5cIiwgY2hpbGRyZW46IF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiaC1mdWxsIGJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwIHNoYWRvdy1zbVwiLCBjaGlsZHJlbjogX2pzeChWaXJ0dWFsaXplZERhdGFHcmlkLCB7IGRhdGE6IGdyb3VwcywgY29sdW1uczogZXh0ZW5kZWRDb2x1bW5EZWZzLCBsb2FkaW5nOiBpc0xvYWRpbmcsIG9uU2VsZWN0aW9uQ2hhbmdlOiBzZXRTZWxlY3RlZEdyb3VwcyB9KSB9KSB9KV0gfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IEdyb3Vwc1ZpZXc7XG4iLCJpbXBvcnQgeyBqc3ggYXMgX2pzeCwgRnJhZ21lbnQgYXMgX0ZyYWdtZW50LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFZpcnR1YWxpemVkRGF0YUdyaWQgQ29tcG9uZW50XG4gKlxuICogRW50ZXJwcmlzZS1ncmFkZSBkYXRhIGdyaWQgdXNpbmcgQUcgR3JpZCBFbnRlcnByaXNlXG4gKiBIYW5kbGVzIDEwMCwwMDArIHJvd3Mgd2l0aCB2aXJ0dWFsIHNjcm9sbGluZyBhdCA2MCBGUFNcbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8sIHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IEFnR3JpZFJlYWN0IH0gZnJvbSAnYWctZ3JpZC1yZWFjdCc7XG5pbXBvcnQgJ2FnLWdyaWQtZW50ZXJwcmlzZSc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBEb3dubG9hZCwgUHJpbnRlciwgRXllLCBFeWVPZmYsIEZpbHRlciB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL2F0b21zL1NwaW5uZXInO1xuLy8gTGF6eSBsb2FkIEFHIEdyaWQgQ1NTIC0gb25seSBsb2FkIG9uY2Ugd2hlbiBmaXJzdCBncmlkIG1vdW50c1xubGV0IGFnR3JpZFN0eWxlc0xvYWRlZCA9IGZhbHNlO1xuY29uc3QgbG9hZEFnR3JpZFN0eWxlcyA9ICgpID0+IHtcbiAgICBpZiAoYWdHcmlkU3R5bGVzTG9hZGVkKVxuICAgICAgICByZXR1cm47XG4gICAgLy8gRHluYW1pY2FsbHkgaW1wb3J0IEFHIEdyaWQgc3R5bGVzXG4gICAgaW1wb3J0KCdhZy1ncmlkLWNvbW11bml0eS9zdHlsZXMvYWctZ3JpZC5jc3MnKTtcbiAgICBpbXBvcnQoJ2FnLWdyaWQtY29tbXVuaXR5L3N0eWxlcy9hZy10aGVtZS1hbHBpbmUuY3NzJyk7XG4gICAgYWdHcmlkU3R5bGVzTG9hZGVkID0gdHJ1ZTtcbn07XG4vKipcbiAqIEhpZ2gtcGVyZm9ybWFuY2UgZGF0YSBncmlkIGNvbXBvbmVudFxuICovXG5mdW5jdGlvbiBWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIoeyBkYXRhLCBjb2x1bW5zLCBsb2FkaW5nID0gZmFsc2UsIHZpcnR1YWxSb3dIZWlnaHQgPSAzMiwgZW5hYmxlQ29sdW1uUmVvcmRlciA9IHRydWUsIGVuYWJsZUNvbHVtblJlc2l6ZSA9IHRydWUsIGVuYWJsZUV4cG9ydCA9IHRydWUsIGVuYWJsZVByaW50ID0gdHJ1ZSwgZW5hYmxlR3JvdXBpbmcgPSBmYWxzZSwgZW5hYmxlRmlsdGVyaW5nID0gdHJ1ZSwgZW5hYmxlU2VsZWN0aW9uID0gdHJ1ZSwgc2VsZWN0aW9uTW9kZSA9ICdtdWx0aXBsZScsIHBhZ2luYXRpb24gPSB0cnVlLCBwYWdpbmF0aW9uUGFnZVNpemUgPSAxMDAsIG9uUm93Q2xpY2ssIG9uU2VsZWN0aW9uQ2hhbmdlLCBjbGFzc05hbWUsIGhlaWdodCA9ICc2MDBweCcsICdkYXRhLWN5JzogZGF0YUN5LCB9LCByZWYpIHtcbiAgICBjb25zdCBncmlkUmVmID0gdXNlUmVmKG51bGwpO1xuICAgIGNvbnN0IFtncmlkQXBpLCBzZXRHcmlkQXBpXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpO1xuICAgIGNvbnN0IFtzaG93Q29sdW1uUGFuZWwsIHNldFNob3dDb2x1bW5QYW5lbF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3Qgcm93RGF0YSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhID8/IFtdO1xuICAgICAgICBjb25zb2xlLmxvZygnW1ZpcnR1YWxpemVkRGF0YUdyaWRdIHJvd0RhdGEgY29tcHV0ZWQ6JywgcmVzdWx0Lmxlbmd0aCwgJ3Jvd3MnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbZGF0YV0pO1xuICAgIC8vIExvYWQgQUcgR3JpZCBzdHlsZXMgb24gY29tcG9uZW50IG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZEFnR3JpZFN0eWxlcygpO1xuICAgIH0sIFtdKTtcbiAgICAvLyBEZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9uXG4gICAgY29uc3QgZGVmYXVsdENvbERlZiA9IHVzZU1lbW8oKCkgPT4gKHtcbiAgICAgICAgc29ydGFibGU6IHRydWUsXG4gICAgICAgIGZpbHRlcjogZW5hYmxlRmlsdGVyaW5nLFxuICAgICAgICByZXNpemFibGU6IGVuYWJsZUNvbHVtblJlc2l6ZSxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXI6IGVuYWJsZUZpbHRlcmluZyxcbiAgICAgICAgbWluV2lkdGg6IDEwMCxcbiAgICB9KSwgW2VuYWJsZUZpbHRlcmluZywgZW5hYmxlQ29sdW1uUmVzaXplXSk7XG4gICAgLy8gR3JpZCBvcHRpb25zXG4gICAgY29uc3QgZ3JpZE9wdGlvbnMgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgICAgIHJvd0hlaWdodDogdmlydHVhbFJvd0hlaWdodCxcbiAgICAgICAgaGVhZGVySGVpZ2h0OiA0MCxcbiAgICAgICAgZmxvYXRpbmdGaWx0ZXJzSGVpZ2h0OiA0MCxcbiAgICAgICAgc3VwcHJlc3NSb3dDbGlja1NlbGVjdGlvbjogIWVuYWJsZVNlbGVjdGlvbixcbiAgICAgICAgcm93U2VsZWN0aW9uOiBlbmFibGVTZWxlY3Rpb24gPyBzZWxlY3Rpb25Nb2RlIDogdW5kZWZpbmVkLFxuICAgICAgICBhbmltYXRlUm93czogdHJ1ZSxcbiAgICAgICAgLy8gRklYOiBEaXNhYmxlIGNoYXJ0cyB0byBhdm9pZCBlcnJvciAjMjAwIChyZXF1aXJlcyBJbnRlZ3JhdGVkQ2hhcnRzTW9kdWxlKVxuICAgICAgICBlbmFibGVDaGFydHM6IGZhbHNlLFxuICAgICAgICAvLyBGSVg6IFVzZSBjZWxsU2VsZWN0aW9uIGluc3RlYWQgb2YgZGVwcmVjYXRlZCBlbmFibGVSYW5nZVNlbGVjdGlvblxuICAgICAgICBjZWxsU2VsZWN0aW9uOiB0cnVlLFxuICAgICAgICAvLyBGSVg6IFVzZSBsZWdhY3kgdGhlbWUgdG8gcHJldmVudCB0aGVtaW5nIEFQSSBjb25mbGljdCAoZXJyb3IgIzIzOSlcbiAgICAgICAgLy8gTXVzdCBiZSBzZXQgdG8gJ2xlZ2FjeScgdG8gdXNlIHYzMiBzdHlsZSB0aGVtZXMgd2l0aCBDU1MgZmlsZXNcbiAgICAgICAgdGhlbWU6ICdsZWdhY3knLFxuICAgICAgICBzdGF0dXNCYXI6IHtcbiAgICAgICAgICAgIHN0YXR1c1BhbmVsczogW1xuICAgICAgICAgICAgICAgIHsgc3RhdHVzUGFuZWw6ICdhZ1RvdGFsQW5kRmlsdGVyZWRSb3dDb3VudENvbXBvbmVudCcsIGFsaWduOiAnbGVmdCcgfSxcbiAgICAgICAgICAgICAgICB7IHN0YXR1c1BhbmVsOiAnYWdTZWxlY3RlZFJvd0NvdW50Q29tcG9uZW50JywgYWxpZ246ICdjZW50ZXInIH0sXG4gICAgICAgICAgICAgICAgeyBzdGF0dXNQYW5lbDogJ2FnQWdncmVnYXRpb25Db21wb25lbnQnLCBhbGlnbjogJ3JpZ2h0JyB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgICAgc2lkZUJhcjogZW5hYmxlR3JvdXBpbmdcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIHRvb2xQYW5lbHM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsRGVmYXVsdDogJ0NvbHVtbnMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxLZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25LZXk6ICdjb2x1bW5zJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnQ29sdW1uc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbERlZmF1bHQ6ICdGaWx0ZXJzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsS2V5OiAnZmlsdGVycycsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uS2V5OiAnZmlsdGVyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2xQYW5lbDogJ2FnRmlsdGVyc1Rvb2xQYW5lbCcsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0VG9vbFBhbmVsOiAnJyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDogZmFsc2UsXG4gICAgfSksIFt2aXJ0dWFsUm93SGVpZ2h0LCBlbmFibGVTZWxlY3Rpb24sIHNlbGVjdGlvbk1vZGUsIGVuYWJsZUdyb3VwaW5nXSk7XG4gICAgLy8gSGFuZGxlIGdyaWQgcmVhZHkgZXZlbnRcbiAgICBjb25zdCBvbkdyaWRSZWFkeSA9IHVzZUNhbGxiYWNrKChwYXJhbXMpID0+IHtcbiAgICAgICAgc2V0R3JpZEFwaShwYXJhbXMuYXBpKTtcbiAgICAgICAgcGFyYW1zLmFwaS5zaXplQ29sdW1uc1RvRml0KCk7XG4gICAgfSwgW10pO1xuICAgIC8vIEhhbmRsZSByb3cgY2xpY2tcbiAgICBjb25zdCBoYW5kbGVSb3dDbGljayA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25Sb3dDbGljayAmJiBldmVudC5kYXRhKSB7XG4gICAgICAgICAgICBvblJvd0NsaWNrKGV2ZW50LmRhdGEpO1xuICAgICAgICB9XG4gICAgfSwgW29uUm93Q2xpY2tdKTtcbiAgICAvLyBIYW5kbGUgc2VsZWN0aW9uIGNoYW5nZVxuICAgIGNvbnN0IGhhbmRsZVNlbGVjdGlvbkNoYW5nZSA9IHVzZUNhbGxiYWNrKChldmVudCkgPT4ge1xuICAgICAgICBpZiAob25TZWxlY3Rpb25DaGFuZ2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IGV2ZW50LmFwaS5nZXRTZWxlY3RlZFJvd3MoKTtcbiAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlKHNlbGVjdGVkUm93cyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25TZWxlY3Rpb25DaGFuZ2VdKTtcbiAgICAvLyBFeHBvcnQgdG8gQ1NWXG4gICAgY29uc3QgZXhwb3J0VG9Dc3YgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmIChncmlkQXBpKSB7XG4gICAgICAgICAgICBncmlkQXBpLmV4cG9ydERhdGFBc0Nzdih7XG4gICAgICAgICAgICAgICAgZmlsZU5hbWU6IGBleHBvcnQtJHtuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCl9LmNzdmAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpXSk7XG4gICAgLy8gRXhwb3J0IHRvIEV4Y2VsXG4gICAgY29uc3QgZXhwb3J0VG9FeGNlbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGdyaWRBcGkuZXhwb3J0RGF0YUFzRXhjZWwoe1xuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBgZXhwb3J0LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfS54bHN4YCxcbiAgICAgICAgICAgICAgICBzaGVldE5hbWU6ICdEYXRhJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW2dyaWRBcGldKTtcbiAgICAvLyBQcmludCBncmlkXG4gICAgY29uc3QgcHJpbnRHcmlkID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoZ3JpZEFwaSkge1xuICAgICAgICAgICAgZ3JpZEFwaS5zZXRHcmlkT3B0aW9uKCdkb21MYXlvdXQnLCAncHJpbnQnKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wcmludCgpO1xuICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0R3JpZE9wdGlvbignZG9tTGF5b3V0JywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH1cbiAgICB9LCBbZ3JpZEFwaV0pO1xuICAgIC8vIFRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eSBwYW5lbFxuICAgIGNvbnN0IHRvZ2dsZUNvbHVtblBhbmVsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRTaG93Q29sdW1uUGFuZWwoIXNob3dDb2x1bW5QYW5lbCk7XG4gICAgfSwgW3Nob3dDb2x1bW5QYW5lbF0pO1xuICAgIC8vIEF1dG8tc2l6ZSBhbGwgY29sdW1uc1xuICAgIGNvbnN0IGF1dG9TaXplQ29sdW1ucyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKGdyaWRBcGkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsbENvbHVtbklkcyA9IGNvbHVtbnMubWFwKGMgPT4gYy5maWVsZCkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICAgICAgZ3JpZEFwaS5hdXRvU2l6ZUNvbHVtbnMoYWxsQ29sdW1uSWRzKTtcbiAgICAgICAgfVxuICAgIH0sIFtncmlkQXBpLCBjb2x1bW5zXSk7XG4gICAgLy8gQ29udGFpbmVyIGNsYXNzZXNcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgnZmxleCBmbGV4LWNvbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktOTAwIHJvdW5kZWQtbGcgc2hhZG93LXNtJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwiZGl2XCIsIHsgcmVmOiByZWYsIGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiwgY2hpbGRyZW46IF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtc20gdGV4dC1ncmF5LTYwMCBkYXJrOnRleHQtZ3JheS00MDBcIiwgY2hpbGRyZW46IGxvYWRpbmcgPyAoX2pzeChTcGlubmVyLCB7IHNpemU6IFwic21cIiB9KSkgOiAoYCR7cm93RGF0YS5sZW5ndGgudG9Mb2NhbGVTdHJpbmcoKX0gcm93c2ApIH0pIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiLCBjaGlsZHJlbjogW2VuYWJsZUZpbHRlcmluZyAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRmlsdGVyLCB7IHNpemU6IDE2IH0pLCBvbkNsaWNrOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBzZXRGbG9hdGluZ0ZpbHRlcnNIZWlnaHQgaXMgZGVwcmVjYXRlZCBpbiBBRyBHcmlkIHYzNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvYXRpbmcgZmlsdGVycyBhcmUgbm93IGNvbnRyb2xsZWQgdGhyb3VnaCBjb2x1bW4gZGVmaW5pdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRmlsdGVyIHRvZ2dsZSBub3QgeWV0IGltcGxlbWVudGVkIGZvciBBRyBHcmlkIHYzNCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB0aXRsZTogXCJUb2dnbGUgZmlsdGVyc1wiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtZmlsdGVyc1wiLCBjaGlsZHJlbjogXCJGaWx0ZXJzXCIgfSkpLCBfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogc2hvd0NvbHVtblBhbmVsID8gX2pzeChFeWVPZmYsIHsgc2l6ZTogMTYgfSkgOiBfanN4KEV5ZSwgeyBzaXplOiAxNiB9KSwgb25DbGljazogdG9nZ2xlQ29sdW1uUGFuZWwsIHRpdGxlOiBcIlRvZ2dsZSBjb2x1bW4gdmlzaWJpbGl0eVwiLCBcImRhdGEtY3lcIjogXCJ0b2dnbGUtY29sdW1uc1wiLCBjaGlsZHJlbjogXCJDb2x1bW5zXCIgfSksIF9qc3goQnV0dG9uLCB7IHNpemU6IFwic21cIiwgdmFyaWFudDogXCJnaG9zdFwiLCBvbkNsaWNrOiBhdXRvU2l6ZUNvbHVtbnMsIHRpdGxlOiBcIkF1dG8tc2l6ZSBjb2x1bW5zXCIsIFwiZGF0YS1jeVwiOiBcImF1dG8tc2l6ZVwiLCBjaGlsZHJlbjogXCJBdXRvIFNpemVcIiB9KSwgZW5hYmxlRXhwb3J0ICYmIChfanN4cyhfRnJhZ21lbnQsIHsgY2hpbGRyZW46IFtfanN4KEJ1dHRvbiwgeyBzaXplOiBcInNtXCIsIHZhcmlhbnQ6IFwiZ2hvc3RcIiwgaWNvbjogX2pzeChEb3dubG9hZCwgeyBzaXplOiAxNiB9KSwgb25DbGljazogZXhwb3J0VG9Dc3YsIHRpdGxlOiBcIkV4cG9ydCB0byBDU1ZcIiwgXCJkYXRhLWN5XCI6IFwiZXhwb3J0LWNzdlwiLCBjaGlsZHJlbjogXCJDU1ZcIiB9KSwgX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goRG93bmxvYWQsIHsgc2l6ZTogMTYgfSksIG9uQ2xpY2s6IGV4cG9ydFRvRXhjZWwsIHRpdGxlOiBcIkV4cG9ydCB0byBFeGNlbFwiLCBcImRhdGEtY3lcIjogXCJleHBvcnQtZXhjZWxcIiwgY2hpbGRyZW46IFwiRXhjZWxcIiB9KV0gfSkpLCBlbmFibGVQcmludCAmJiAoX2pzeChCdXR0b24sIHsgc2l6ZTogXCJzbVwiLCB2YXJpYW50OiBcImdob3N0XCIsIGljb246IF9qc3goUHJpbnRlciwgeyBzaXplOiAxNiB9KSwgb25DbGljazogcHJpbnRHcmlkLCB0aXRsZTogXCJQcmludFwiLCBcImRhdGEtY3lcIjogXCJwcmludFwiLCBjaGlsZHJlbjogXCJQcmludFwiIH0pKV0gfSldIH0pLCBfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4LTEgcmVsYXRpdmVcIiwgY2hpbGRyZW46IFtsb2FkaW5nICYmIChfanN4KFwiZGl2XCIsIHsgXCJkYXRhLXRlc3RpZFwiOiBcImdyaWQtbG9hZGluZ1wiLCByb2xlOiBcInN0YXR1c1wiLCBcImFyaWEtbGFiZWxcIjogXCJMb2FkaW5nIGRhdGFcIiwgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LTAgYmctd2hpdGUgYmctb3BhY2l0eS03NSBkYXJrOmJnLWdyYXktOTAwIGRhcms6Ymctb3BhY2l0eS03NSB6LTEwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIsIGNoaWxkcmVuOiBfanN4KFNwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiLCBsYWJlbDogXCJMb2FkaW5nIGRhdGEuLi5cIiB9KSB9KSksIF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNsc3goJ2FnLXRoZW1lLWFscGluZScsICdkYXJrOmFnLXRoZW1lLWFscGluZS1kYXJrJywgJ3ctZnVsbCcpLCBzdHlsZTogeyBoZWlnaHQgfSwgY2hpbGRyZW46IF9qc3goQWdHcmlkUmVhY3QsIHsgcmVmOiBncmlkUmVmLCByb3dEYXRhOiByb3dEYXRhLCBjb2x1bW5EZWZzOiBjb2x1bW5zLCBkZWZhdWx0Q29sRGVmOiBkZWZhdWx0Q29sRGVmLCBncmlkT3B0aW9uczogZ3JpZE9wdGlvbnMsIG9uR3JpZFJlYWR5OiBvbkdyaWRSZWFkeSwgb25Sb3dDbGlja2VkOiBoYW5kbGVSb3dDbGljaywgb25TZWxlY3Rpb25DaGFuZ2VkOiBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UsIHJvd0J1ZmZlcjogMjAsIHJvd01vZGVsVHlwZTogXCJjbGllbnRTaWRlXCIsIHBhZ2luYXRpb246IHBhZ2luYXRpb24sIHBhZ2luYXRpb25QYWdlU2l6ZTogcGFnaW5hdGlvblBhZ2VTaXplLCBwYWdpbmF0aW9uQXV0b1BhZ2VTaXplOiBmYWxzZSwgc3VwcHJlc3NDZWxsRm9jdXM6IGZhbHNlLCBlbmFibGVDZWxsVGV4dFNlbGVjdGlvbjogdHJ1ZSwgZW5zdXJlRG9tT3JkZXI6IHRydWUgfSkgfSksIHNob3dDb2x1bW5QYW5lbCAmJiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTY0IGgtZnVsbCBiZy13aGl0ZSBkYXJrOmJnLWdyYXktODAwIGJvcmRlci1sIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMCBwLTQgb3ZlcmZsb3cteS1hdXRvIHotMjBcIiwgY2hpbGRyZW46IFtfanN4KFwiaDNcIiwgeyBjbGFzc05hbWU6IFwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtIG1iLTNcIiwgY2hpbGRyZW46IFwiQ29sdW1uIFZpc2liaWxpdHlcIiB9KSwgY29sdW1ucy5tYXAoKGNvbCkgPT4gKF9qc3hzKFwibGFiZWxcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHktMVwiLCBjaGlsZHJlbjogW19qc3goXCJpbnB1dFwiLCB7IHR5cGU6IFwiY2hlY2tib3hcIiwgY2xhc3NOYW1lOiBcInJvdW5kZWRcIiwgZGVmYXVsdENoZWNrZWQ6IHRydWUsIG9uQ2hhbmdlOiAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JpZEFwaSAmJiBjb2wuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyaWRBcGkuc2V0Q29sdW1uc1Zpc2libGUoW2NvbC5maWVsZF0sIGUudGFyZ2V0LmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB9KSwgX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbVwiLCBjaGlsZHJlbjogY29sLmhlYWRlck5hbWUgfHwgY29sLmZpZWxkIH0pXSB9LCBjb2wuZmllbGQpKSldIH0pKV0gfSldIH0pKTtcbn1cbmV4cG9ydCBjb25zdCBWaXJ0dWFsaXplZERhdGFHcmlkID0gUmVhY3QuZm9yd2FyZFJlZihWaXJ0dWFsaXplZERhdGFHcmlkSW5uZXIpO1xuLy8gU2V0IGRpc3BsYXlOYW1lIGZvciBSZWFjdCBEZXZUb29sc1xuVmlydHVhbGl6ZWREYXRhR3JpZC5kaXNwbGF5TmFtZSA9ICdWaXJ0dWFsaXplZERhdGFHcmlkJztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICpcbiAqIFNtYWxsIGxhYmVsIGNvbXBvbmVudCBmb3Igc3RhdHVzIGluZGljYXRvcnMsIGNvdW50cywgYW5kIHRhZ3MuXG4gKiBTdXBwb3J0cyBtdWx0aXBsZSB2YXJpYW50cyBhbmQgc2l6ZXMuXG4gKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG4vKipcbiAqIEJhZGdlIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgQmFkZ2UgPSAoeyBjaGlsZHJlbiwgdmFyaWFudCA9ICdkZWZhdWx0Jywgc2l6ZSA9ICdtZCcsIGRvdCA9IGZhbHNlLCBkb3RQb3NpdGlvbiA9ICdsZWFkaW5nJywgcmVtb3ZhYmxlID0gZmFsc2UsIG9uUmVtb3ZlLCBjbGFzc05hbWUsICdkYXRhLWN5JzogZGF0YUN5LCB9KSA9PiB7XG4gICAgLy8gVmFyaWFudCBzdHlsZXNcbiAgICBjb25zdCB2YXJpYW50Q2xhc3NlcyA9IHtcbiAgICAgICAgZGVmYXVsdDogJ2JnLWdyYXktMTAwIHRleHQtZ3JheS04MDAgYm9yZGVyLWdyYXktMjAwJyxcbiAgICAgICAgcHJpbWFyeTogJ2JnLWJsdWUtMTAwIHRleHQtYmx1ZS04MDAgYm9yZGVyLWJsdWUtMjAwJyxcbiAgICAgICAgc3VjY2VzczogJ2JnLWdyZWVuLTEwMCB0ZXh0LWdyZWVuLTgwMCBib3JkZXItZ3JlZW4tMjAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy0xMDAgdGV4dC15ZWxsb3ctODAwIGJvcmRlci15ZWxsb3ctMjAwJyxcbiAgICAgICAgZGFuZ2VyOiAnYmctcmVkLTEwMCB0ZXh0LXJlZC04MDAgYm9yZGVyLXJlZC0yMDAnLFxuICAgICAgICBpbmZvOiAnYmctY3lhbi0xMDAgdGV4dC1jeWFuLTgwMCBib3JkZXItY3lhbi0yMDAnLFxuICAgIH07XG4gICAgLy8gRG90IGNvbG9yIGNsYXNzZXNcbiAgICBjb25zdCBkb3RDbGFzc2VzID0ge1xuICAgICAgICBkZWZhdWx0OiAnYmctZ3JheS01MDAnLFxuICAgICAgICBwcmltYXJ5OiAnYmctYmx1ZS01MDAnLFxuICAgICAgICBzdWNjZXNzOiAnYmctZ3JlZW4tNTAwJyxcbiAgICAgICAgd2FybmluZzogJ2JnLXllbGxvdy01MDAnLFxuICAgICAgICBkYW5nZXI6ICdiZy1yZWQtNTAwJyxcbiAgICAgICAgaW5mbzogJ2JnLWN5YW4tNTAwJyxcbiAgICB9O1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAncHgtMiBweS0wLjUgdGV4dC14cycsXG4gICAgICAgIHNtOiAncHgtMi41IHB5LTAuNSB0ZXh0LXNtJyxcbiAgICAgICAgbWQ6ICdweC0zIHB5LTEgdGV4dC1zbScsXG4gICAgICAgIGxnOiAncHgtMy41IHB5LTEuNSB0ZXh0LWJhc2UnLFxuICAgIH07XG4gICAgY29uc3QgZG90U2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHhzOiAnaC0xLjUgdy0xLjUnLFxuICAgICAgICBzbTogJ2gtMiB3LTInLFxuICAgICAgICBtZDogJ2gtMiB3LTInLFxuICAgICAgICBsZzogJ2gtMi41IHctMi41JyxcbiAgICB9O1xuICAgIGNvbnN0IGJhZGdlQ2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAnaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUnLCAnZm9udC1tZWRpdW0gcm91bmRlZC1mdWxsIGJvcmRlcicsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnLCBcbiAgICAvLyBWYXJpYW50XG4gICAgdmFyaWFudENsYXNzZXNbdmFyaWFudF0sIFxuICAgIC8vIFNpemVcbiAgICBzaXplQ2xhc3Nlc1tzaXplXSwgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gKF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogYmFkZ2VDbGFzc2VzLCBcImRhdGEtY3lcIjogZGF0YUN5LCBjaGlsZHJlbjogW2RvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ2xlYWRpbmcnICYmIChfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogY2xzeCgncm91bmRlZC1mdWxsJywgZG90Q2xhc3Nlc1t2YXJpYW50XSwgZG90U2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pKSwgX2pzeChcInNwYW5cIiwgeyBjaGlsZHJlbjogY2hpbGRyZW4gfSksIGRvdCAmJiBkb3RQb3NpdGlvbiA9PT0gJ3RyYWlsaW5nJyAmJiAoX2pzeChcInNwYW5cIiwgeyBjbGFzc05hbWU6IGNsc3goJ3JvdW5kZWQtZnVsbCcsIGRvdENsYXNzZXNbdmFyaWFudF0sIGRvdFNpemVDbGFzc2VzW3NpemVdKSwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSksIHJlbW92YWJsZSAmJiBvblJlbW92ZSAmJiAoX2pzeChcImJ1dHRvblwiLCB7IHR5cGU6IFwiYnV0dG9uXCIsIG9uQ2xpY2s6IG9uUmVtb3ZlLCBjbGFzc05hbWU6IGNsc3goJ21sLTAuNSAtbXItMSBpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXInLCAncm91bmRlZC1mdWxsIGhvdmVyOmJnLWJsYWNrLzEwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1vZmZzZXQtMScsIHtcbiAgICAgICAgICAgICAgICAgICAgJ2gtMyB3LTMnOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICdoLTQgdy00Jzogc2l6ZSA9PT0gJ21kJyB8fCBzaXplID09PSAnbGcnLFxuICAgICAgICAgICAgICAgIH0pLCBcImFyaWEtbGFiZWxcIjogXCJSZW1vdmVcIiwgY2hpbGRyZW46IF9qc3goXCJzdmdcIiwgeyBjbGFzc05hbWU6IGNsc3goe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2gtMiB3LTInOiBzaXplID09PSAneHMnIHx8IHNpemUgPT09ICdzbScsXG4gICAgICAgICAgICAgICAgICAgICAgICAnaC0zIHctMyc6IHNpemUgPT09ICdtZCcgfHwgc2l6ZSA9PT0gJ2xnJyxcbiAgICAgICAgICAgICAgICAgICAgfSksIGZpbGw6IFwiY3VycmVudENvbG9yXCIsIHZpZXdCb3g6IFwiMCAwIDIwIDIwXCIsIGNoaWxkcmVuOiBfanN4KFwicGF0aFwiLCB7IGZpbGxSdWxlOiBcImV2ZW5vZGRcIiwgZDogXCJNNC4yOTMgNC4yOTNhMSAxIDAgMDExLjQxNCAwTDEwIDguNTg2bDQuMjkzLTQuMjkzYTEgMSAwIDExMS40MTQgMS40MTRMMTEuNDE0IDEwbDQuMjkzIDQuMjkzYTEgMSAwIDAxLTEuNDE0IDEuNDE0TDEwIDExLjQxNGwtNC4yOTMgNC4yOTNhMSAxIDAgMDEtMS40MTQtMS40MTRMOC41ODYgMTAgNC4yOTMgNS43MDdhMSAxIDAgMDEwLTEuNDE0elwiLCBjbGlwUnVsZTogXCJldmVub2RkXCIgfSkgfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgQmFkZ2U7XG4iLCIvKipcbiAqIERlYm91bmNlIEhvb2tcbiAqXG4gKiBSZXR1cm5zIGEgZGVib3VuY2VkIHZhbHVlIHRoYXQgb25seSB1cGRhdGVzIGFmdGVyIHRoZSBzcGVjaWZpZWQgZGVsYXkuXG4gKiBVc2VmdWwgZm9yIHNlYXJjaCBpbnB1dHMgYW5kIGV4cGVuc2l2ZSBvcGVyYXRpb25zLlxuICovXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuLyoqXG4gKiBEZWJvdW5jZSBhIHZhbHVlXG4gKiBAcGFyYW0gdmFsdWUgVmFsdWUgdG8gZGVib3VuY2VcbiAqIEBwYXJhbSBkZWxheSBEZWxheSBpbiBtaWxsaXNlY29uZHMgKGRlZmF1bHQ6IDUwMG1zKVxuICogQHJldHVybnMgRGVib3VuY2VkIHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1c2VEZWJvdW5jZSh2YWx1ZSwgZGVsYXkgPSA1MDApIHtcbiAgICBjb25zdCBbZGVib3VuY2VkVmFsdWUsIHNldERlYm91bmNlZFZhbHVlXSA9IHVzZVN0YXRlKHZhbHVlKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICAvLyBTZXQgdXAgYSB0aW1lb3V0IHRvIHVwZGF0ZSB0aGUgZGVib3VuY2VkIHZhbHVlXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHNldERlYm91bmNlZFZhbHVlKHZhbHVlKTtcbiAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgICAvLyBDbGVhbnVwIHRpbWVvdXQgb24gdmFsdWUgY2hhbmdlIG9yIHVubW91bnRcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChoYW5kbGVyKTtcbiAgICAgICAgfTtcbiAgICB9LCBbdmFsdWUsIGRlbGF5XSk7XG4gICAgcmV0dXJuIGRlYm91bmNlZFZhbHVlO1xufVxuZXhwb3J0IGRlZmF1bHQgdXNlRGVib3VuY2U7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=