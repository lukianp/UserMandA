"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[850],{

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

/***/ 40391:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(72832);

/**
 * LoadingSpinner Component
 *
 * Simple loading spinner for inline loading states
 */



/**
 * LoadingSpinner component for inline loading states
 */
const LoadingSpinner = ({ size = 'md', className, 'data-cy': dataCy, }) => {
    // Size mappings
    const sizes = {
        sm: 16,
        md: 24,
        lg: 32,
        xl: 48,
    };
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_3__/* .Loader2 */ .krw, { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('animate-spin text-blue-600 dark:text-blue-400', className), size: sizes[size], "data-cy": dataCy }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LoadingSpinner);


/***/ }),

/***/ 70850:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GroupMembersModal: () => (/* binding */ GroupMembersModal)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(74848);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var lucide_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(72832);
/* harmony import */ var _atoms_Button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(74160);
/* harmony import */ var _atoms_Input__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(34766);
/* harmony import */ var _atoms_LoadingSpinner__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(40391);
/* harmony import */ var _store_useModalStore__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(23361);
/* harmony import */ var _organisms_VirtualizedDataGrid__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(59944);

/**
 * Group Members Modal
 *
 * Modal dialog for viewing and managing group members
 */







const GroupMembersModal = ({ modalId, groupId, groupName }) => {
    const { closeModal } = (0,_store_useModalStore__WEBPACK_IMPORTED_MODULE_6__/* .useModalStore */ .K)();
    const [members, setMembers] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
    const [searchText, setSearchText] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('');
    const [selectedMembers, setSelectedMembers] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    // Load members on mount
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
        loadMembers();
    }, [groupId]);
    const loadMembers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('[GroupMembersModal] Loading members for group:', groupId);
            // Call PowerShell module to get group members
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Discovery/GroupDiscovery.psm1',
                functionName: 'Get-GroupMembers',
                parameters: {
                    GroupId: groupId,
                },
            });
            if (result.success && Array.isArray(result.data)) {
                setMembers(result.data);
                console.log(`[GroupMembersModal] Loaded ${result.data.length} members`);
            }
            else {
                throw new Error(result.error || 'Failed to load group members');
            }
        }
        catch (err) {
            console.error('[GroupMembersModal] Failed to load members:', err);
            setError(err instanceof Error ? err.message : 'Failed to load group members');
            setMembers([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleAddMembers = async () => {
        // TODO: Open user selection dialog to add members
        console.log('[GroupMembersModal] Add members - not yet implemented');
        alert('Add Members - Coming Soon!\n\nThis will open a dialog to search and select users to add to the group.');
    };
    const handleRemoveMembers = async () => {
        if (selectedMembers.length === 0)
            return;
        const confirmed = confirm(`Remove ${selectedMembers.length} member(s) from ${groupName}?\n\nThis action cannot be undone.`);
        if (!confirmed)
            return;
        setIsLoading(true);
        setError(null);
        try {
            // Call PowerShell module to remove members
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Management/GroupManagement.psm1',
                functionName: 'Remove-GroupMembers',
                parameters: {
                    GroupId: groupId,
                    MemberIds: selectedMembers.map(m => m.id),
                },
            });
            if (result.success) {
                console.log('[GroupMembersModal] Members removed successfully');
                setSelectedMembers([]);
                await loadMembers(); // Reload members
            }
            else {
                throw new Error(result.error || 'Failed to remove members');
            }
        }
        catch (err) {
            console.error('[GroupMembersModal] Failed to remove members:', err);
            setError(err instanceof Error ? err.message : 'Failed to remove members');
        }
        finally {
            setIsLoading(false);
        }
    };
    // Filter members based on search text
    const filteredMembers = members.filter(member => {
        if (!searchText)
            return true;
        const search = searchText.toLowerCase();
        return (member.displayName.toLowerCase().includes(search) ||
            member.email?.toLowerCase().includes(search) ||
            member.userPrincipalName?.toLowerCase().includes(search));
    });
    // Column definitions
    const columnDefs = [
        {
            field: 'displayName',
            headerName: 'Display Name',
            sortable: true,
            filter: true,
            checkboxSelection: true,
            headerCheckboxSelection: true,
            flex: 2,
        },
        {
            field: 'email',
            headerName: 'Email',
            sortable: true,
            filter: true,
            flex: 2,
        },
        {
            field: 'memberType',
            headerName: 'Type',
            sortable: true,
            filter: true,
            width: 100,
        },
        {
            field: 'accountEnabled',
            headerName: 'Status',
            sortable: true,
            filter: true,
            width: 120,
            cellRenderer: (params) => ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: params.value ? 'text-green-600' : 'text-red-600', children: params.value ? 'Enabled' : 'Disabled' })),
        },
    ];
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: "Group Members" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: groupName })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { onClick: () => closeModal(modalId), className: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300", disabled: isLoading, children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__.X, { size: 24 }) })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-4", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Input__WEBPACK_IMPORTED_MODULE_4__/* .Input */ .p, { placeholder: "Search members...", value: searchText, onChange: (e) => setSearchText(e.target.value), className: "w-64" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: [filteredMembers.length, " of ", members.length, " members"] })] }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "flex items-center gap-2", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__/* .Button */ .$, { onClick: loadMembers, variant: "secondary", size: "sm", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .RefreshCw */ .e9t, { className: isLoading ? 'animate-spin' : '', size: 18 }), disabled: isLoading, children: "Refresh" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__/* .Button */ .$, { onClick: handleAddMembers, variant: "primary", size: "sm", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .UserPlus */ .ypN, { size: 18 }), disabled: isLoading, children: "Add Members" }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__/* .Button */ .$, { onClick: handleRemoveMembers, variant: "danger", size: "sm", icon: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(lucide_react__WEBPACK_IMPORTED_MODULE_2__/* .Trash2 */ .TBR, { size: 18 }), disabled: selectedMembers.length === 0 || isLoading, children: ["Remove (", selectedMembers.length, ")"] })] })] }), error && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400", children: error })), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex-1 p-6 overflow-hidden", children: isLoading && members.length === 0 ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center justify-center h-full", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_LoadingSpinner__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A, { size: "lg" }) })) : ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_organisms_VirtualizedDataGrid__WEBPACK_IMPORTED_MODULE_7__/* .VirtualizedDataGrid */ .Q, { data: filteredMembers, columns: columnDefs, loading: isLoading, onSelectionChange: setSelectedMembers, height: "100%" })) }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700", children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_atoms_Button__WEBPACK_IMPORTED_MODULE_3__/* .Button */ .$, { variant: "secondary", onClick: () => closeModal(modalId), children: "Close" }) })] }) }));
};
/* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = ((/* unused pure expression or super */ null && (GroupMembersModal)));


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SUFBSSxHQUFHO0FBQzdwRjtBQUNBLHNFQUFlLGlFQUFpQixJQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9JbnB1dC50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9hdG9tcy9Mb2FkaW5nU3Bpbm5lci50c3giLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvY29tcG9uZW50cy9kaWFsb2dzL0dyb3VwTWVtYmVyc01vZGFsLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBJbnB1dCBDb21wb25lbnRcbiAqXG4gKiBBY2Nlc3NpYmxlIGlucHV0IGZpZWxkIHdpdGggbGFiZWwsIGVycm9yIHN0YXRlcywgYW5kIGhlbHAgdGV4dFxuICovXG5pbXBvcnQgUmVhY3QsIHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IEFsZXJ0Q2lyY2xlLCBJbmZvIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogSW5wdXQgY29tcG9uZW50IHdpdGggZnVsbCBhY2Nlc3NpYmlsaXR5IHN1cHBvcnRcbiAqL1xuZXhwb3J0IGNvbnN0IElucHV0ID0gZm9yd2FyZFJlZigoeyBsYWJlbCwgaGVscGVyVGV4dCwgZXJyb3IsIHJlcXVpcmVkID0gZmFsc2UsIHNob3dPcHRpb25hbCA9IHRydWUsIGlucHV0U2l6ZSA9ICdtZCcsIGZ1bGxXaWR0aCA9IGZhbHNlLCBzdGFydEljb24sIGVuZEljb24sIGNsYXNzTmFtZSwgaWQsICdkYXRhLWN5JzogZGF0YUN5LCBkaXNhYmxlZCA9IGZhbHNlLCAuLi5wcm9wcyB9LCByZWYpID0+IHtcbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgSUQgaWYgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgaW5wdXRJZCA9IGlkIHx8IGBpbnB1dC0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpbnB1dElkfS1lcnJvcmA7XG4gICAgY29uc3QgaGVscGVySWQgPSBgJHtpbnB1dElkfS1oZWxwZXJgO1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAncHgtMyBweS0xLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtNCBweS0yIHRleHQtYmFzZScsXG4gICAgICAgIGxnOiAncHgtNSBweS0zIHRleHQtbGcnLFxuICAgIH07XG4gICAgLy8gSW5wdXQgY2xhc3Nlc1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHJvdW5kZWQtbWQgYm9yZGVyIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGlzYWJsZWQ6YmctZ3JheS01MCBkaXNhYmxlZDp0ZXh0LWdyYXktNTAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTEwMCcsIHNpemVzW2lucHV0U2l6ZV0sIGZ1bGxXaWR0aCAmJiAndy1mdWxsJywgc3RhcnRJY29uICYmICdwbC0xMCcsIGVuZEljb24gJiYgJ3ByLTEwJywgZXJyb3JcbiAgICAgICAgPyBjbHN4KCdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC05MDAgcGxhY2Vob2xkZXItcmVkLTQwMCcsICdmb2N1czpib3JkZXItcmVkLTUwMCBmb2N1czpyaW5nLXJlZC01MDAnLCAnZGFyazpib3JkZXItcmVkLTQwMCBkYXJrOnRleHQtcmVkLTQwMCcpXG4gICAgICAgIDogY2xzeCgnYm9yZGVyLWdyYXktMzAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOmJvcmRlci1ibHVlLTUwMCBmb2N1czpyaW5nLWJsdWUtNTAwJywgJ2Rhcms6Ym9yZGVyLWdyYXktNjAwIGRhcms6cGxhY2Vob2xkZXItZ3JheS01MDAnKSwgY2xhc3NOYW1lKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KGZ1bGxXaWR0aCAmJiAndy1mdWxsJyk7XG4gICAgLy8gTGFiZWwgY2xhc3Nlc1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAgbWItMScpO1xuICAgIC8vIEhlbHBlci9FcnJvciB0ZXh0IGNsYXNzZXNcbiAgICBjb25zdCBoZWxwZXJDbGFzc2VzID0gY2xzeCgnbXQtMSB0ZXh0LXNtJywgZXJyb3IgPyAndGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwJyA6ICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCcpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpbnB1dElkLCBjbGFzc05hbWU6IGxhYmVsQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCwgcmVxdWlyZWQgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTUwMCBtbC0xXCIsIFwiYXJpYS1sYWJlbFwiOiBcInJlcXVpcmVkXCIsIGNoaWxkcmVuOiBcIipcIiB9KSksICFyZXF1aXJlZCAmJiBzaG93T3B0aW9uYWwgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1sLTEgdGV4dC14c1wiLCBjaGlsZHJlbjogXCIob3B0aW9uYWwpXCIgfSkpXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbc3RhcnRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCBsZWZ0LTAgcGwtMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogc3RhcnRJY29uIH0pIH0pKSwgX2pzeChcImlucHV0XCIsIHsgcmVmOiByZWYsIGlkOiBpbnB1dElkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWludmFsaWRcIjogISFlcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goZXJyb3IgJiYgZXJyb3JJZCwgaGVscGVyVGV4dCAmJiBoZWxwZXJJZCkgfHwgdW5kZWZpbmVkLCBcImFyaWEtcmVxdWlyZWRcIjogcmVxdWlyZWQsIGRpc2FibGVkOiBkaXNhYmxlZCwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgLi4ucHJvcHMgfSksIGVuZEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIHJpZ2h0LTAgcHItMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogZW5kSWNvbiB9KSB9KSldIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIHJvbGU6IFwiYWxlcnRcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBlcnJvcl0gfSkgfSkpLCBoZWxwZXJUZXh0ICYmICFlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBoZWxwZXJJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChJbmZvLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgaGVscGVyVGV4dF0gfSkgfSkpXSB9KSk7XG59KTtcbklucHV0LmRpc3BsYXlOYW1lID0gJ0lucHV0JztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4IH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIExvYWRpbmdTcGlubmVyIENvbXBvbmVudFxuICpcbiAqIFNpbXBsZSBsb2FkaW5nIHNwaW5uZXIgZm9yIGlubGluZSBsb2FkaW5nIHN0YXRlc1xuICovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgTG9hZGVyMiB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG4vKipcbiAqIExvYWRpbmdTcGlubmVyIGNvbXBvbmVudCBmb3IgaW5saW5lIGxvYWRpbmcgc3RhdGVzXG4gKi9cbmNvbnN0IExvYWRpbmdTcGlubmVyID0gKHsgc2l6ZSA9ICdtZCcsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICAvLyBTaXplIG1hcHBpbmdzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAxNixcbiAgICAgICAgbWQ6IDI0LFxuICAgICAgICBsZzogMzIsXG4gICAgICAgIHhsOiA0OCxcbiAgICB9O1xuICAgIHJldHVybiAoX2pzeChMb2FkZXIyLCB7IGNsYXNzTmFtZTogY2xzeCgnYW5pbWF0ZS1zcGluIHRleHQtYmx1ZS02MDAgZGFyazp0ZXh0LWJsdWUtNDAwJywgY2xhc3NOYW1lKSwgc2l6ZTogc2l6ZXNbc2l6ZV0sIFwiZGF0YS1jeVwiOiBkYXRhQ3kgfSkpO1xufTtcbmV4cG9ydCBkZWZhdWx0IExvYWRpbmdTcGlubmVyO1xuIiwiaW1wb3J0IHsganN4IGFzIF9qc3gsIGpzeHMgYXMgX2pzeHMgfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbi8qKlxuICogR3JvdXAgTWVtYmVycyBNb2RhbFxuICpcbiAqIE1vZGFsIGRpYWxvZyBmb3Igdmlld2luZyBhbmQgbWFuYWdpbmcgZ3JvdXAgbWVtYmVyc1xuICovXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFgsIFVzZXJQbHVzLCBUcmFzaDIsIFJlZnJlc2hDdyB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9hdG9tcy9CdXR0b24nO1xuaW1wb3J0IHsgSW5wdXQgfSBmcm9tICcuLi9hdG9tcy9JbnB1dCc7XG5pbXBvcnQgTG9hZGluZ1NwaW5uZXIgZnJvbSAnLi4vYXRvbXMvTG9hZGluZ1NwaW5uZXInO1xuaW1wb3J0IHsgdXNlTW9kYWxTdG9yZSB9IGZyb20gJy4uLy4uL3N0b3JlL3VzZU1vZGFsU3RvcmUnO1xuaW1wb3J0IHsgVmlydHVhbGl6ZWREYXRhR3JpZCB9IGZyb20gJy4uL29yZ2FuaXNtcy9WaXJ0dWFsaXplZERhdGFHcmlkJztcbmV4cG9ydCBjb25zdCBHcm91cE1lbWJlcnNNb2RhbCA9ICh7IG1vZGFsSWQsIGdyb3VwSWQsIGdyb3VwTmFtZSB9KSA9PiB7XG4gICAgY29uc3QgeyBjbG9zZU1vZGFsIH0gPSB1c2VNb2RhbFN0b3JlKCk7XG4gICAgY29uc3QgW21lbWJlcnMsIHNldE1lbWJlcnNdID0gdXNlU3RhdGUoW10pO1xuICAgIGNvbnN0IFtpc0xvYWRpbmcsIHNldElzTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dF0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW3NlbGVjdGVkTWVtYmVycywgc2V0U2VsZWN0ZWRNZW1iZXJzXSA9IHVzZVN0YXRlKFtdKTtcbiAgICAvLyBMb2FkIG1lbWJlcnMgb24gbW91bnRcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBsb2FkTWVtYmVycygpO1xuICAgIH0sIFtncm91cElkXSk7XG4gICAgY29uc3QgbG9hZE1lbWJlcnMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHNldElzTG9hZGluZyh0cnVlKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW0dyb3VwTWVtYmVyc01vZGFsXSBMb2FkaW5nIG1lbWJlcnMgZm9yIGdyb3VwOicsIGdyb3VwSWQpO1xuICAgICAgICAgICAgLy8gQ2FsbCBQb3dlclNoZWxsIG1vZHVsZSB0byBnZXQgZ3JvdXAgbWVtYmVyc1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL0Rpc2NvdmVyeS9Hcm91cERpc2NvdmVyeS5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdHZXQtR3JvdXBNZW1iZXJzJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIEdyb3VwSWQ6IGdyb3VwSWQsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzICYmIEFycmF5LmlzQXJyYXkocmVzdWx0LmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgc2V0TWVtYmVycyhyZXN1bHQuZGF0YSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtHcm91cE1lbWJlcnNNb2RhbF0gTG9hZGVkICR7cmVzdWx0LmRhdGEubGVuZ3RofSBtZW1iZXJzYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8ICdGYWlsZWQgdG8gbG9hZCBncm91cCBtZW1iZXJzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW0dyb3VwTWVtYmVyc01vZGFsXSBGYWlsZWQgdG8gbG9hZCBtZW1iZXJzOicsIGVycik7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ0ZhaWxlZCB0byBsb2FkIGdyb3VwIG1lbWJlcnMnKTtcbiAgICAgICAgICAgIHNldE1lbWJlcnMoW10pO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlQWRkTWVtYmVycyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gVE9ETzogT3BlbiB1c2VyIHNlbGVjdGlvbiBkaWFsb2cgdG8gYWRkIG1lbWJlcnNcbiAgICAgICAgY29uc29sZS5sb2coJ1tHcm91cE1lbWJlcnNNb2RhbF0gQWRkIG1lbWJlcnMgLSBub3QgeWV0IGltcGxlbWVudGVkJyk7XG4gICAgICAgIGFsZXJ0KCdBZGQgTWVtYmVycyAtIENvbWluZyBTb29uIVxcblxcblRoaXMgd2lsbCBvcGVuIGEgZGlhbG9nIHRvIHNlYXJjaCBhbmQgc2VsZWN0IHVzZXJzIHRvIGFkZCB0byB0aGUgZ3JvdXAuJyk7XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVSZW1vdmVNZW1iZXJzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0ZWRNZW1iZXJzLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgY29uZmlybWVkID0gY29uZmlybShgUmVtb3ZlICR7c2VsZWN0ZWRNZW1iZXJzLmxlbmd0aH0gbWVtYmVyKHMpIGZyb20gJHtncm91cE5hbWV9P1xcblxcblRoaXMgYWN0aW9uIGNhbm5vdCBiZSB1bmRvbmUuYCk7XG4gICAgICAgIGlmICghY29uZmlybWVkKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZXRJc0xvYWRpbmcodHJ1ZSk7XG4gICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQ2FsbCBQb3dlclNoZWxsIG1vZHVsZSB0byByZW1vdmUgbWVtYmVyc1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL01hbmFnZW1lbnQvR3JvdXBNYW5hZ2VtZW50LnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ1JlbW92ZS1Hcm91cE1lbWJlcnMnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgR3JvdXBJZDogZ3JvdXBJZCxcbiAgICAgICAgICAgICAgICAgICAgTWVtYmVySWRzOiBzZWxlY3RlZE1lbWJlcnMubWFwKG0gPT4gbS5pZCksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1tHcm91cE1lbWJlcnNNb2RhbF0gTWVtYmVycyByZW1vdmVkIHN1Y2Nlc3NmdWxseScpO1xuICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkTWVtYmVycyhbXSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgbG9hZE1lbWJlcnMoKTsgLy8gUmVsb2FkIG1lbWJlcnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZXN1bHQuZXJyb3IgfHwgJ0ZhaWxlZCB0byByZW1vdmUgbWVtYmVycycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tHcm91cE1lbWJlcnNNb2RhbF0gRmFpbGVkIHRvIHJlbW92ZSBtZW1iZXJzOicsIGVycik7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogJ0ZhaWxlZCB0byByZW1vdmUgbWVtYmVycycpO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gRmlsdGVyIG1lbWJlcnMgYmFzZWQgb24gc2VhcmNoIHRleHRcbiAgICBjb25zdCBmaWx0ZXJlZE1lbWJlcnMgPSBtZW1iZXJzLmZpbHRlcihtZW1iZXIgPT4ge1xuICAgICAgICBpZiAoIXNlYXJjaFRleHQpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgY29uc3Qgc2VhcmNoID0gc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gKG1lbWJlci5kaXNwbGF5TmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHNlYXJjaCkgfHxcbiAgICAgICAgICAgIG1lbWJlci5lbWFpbD8udG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhzZWFyY2gpIHx8XG4gICAgICAgICAgICBtZW1iZXIudXNlclByaW5jaXBhbE5hbWU/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc2VhcmNoKSk7XG4gICAgfSk7XG4gICAgLy8gQ29sdW1uIGRlZmluaXRpb25zXG4gICAgY29uc3QgY29sdW1uRGVmcyA9IFtcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdkaXNwbGF5TmFtZScsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnRGlzcGxheSBOYW1lJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgY2hlY2tib3hTZWxlY3Rpb246IHRydWUsXG4gICAgICAgICAgICBoZWFkZXJDaGVja2JveFNlbGVjdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGZsZXg6IDIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIGZpZWxkOiAnZW1haWwnLFxuICAgICAgICAgICAgaGVhZGVyTmFtZTogJ0VtYWlsJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgZmxleDogMixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdtZW1iZXJUeXBlJyxcbiAgICAgICAgICAgIGhlYWRlck5hbWU6ICdUeXBlJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgZmllbGQ6ICdhY2NvdW50RW5hYmxlZCcsXG4gICAgICAgICAgICBoZWFkZXJOYW1lOiAnU3RhdHVzJyxcbiAgICAgICAgICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZmlsdGVyOiB0cnVlLFxuICAgICAgICAgICAgd2lkdGg6IDEyMCxcbiAgICAgICAgICAgIGNlbGxSZW5kZXJlcjogKHBhcmFtcykgPT4gKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBwYXJhbXMudmFsdWUgPyAndGV4dC1ncmVlbi02MDAnIDogJ3RleHQtcmVkLTYwMCcsIGNoaWxkcmVuOiBwYXJhbXMudmFsdWUgPyAnRW5hYmxlZCcgOiAnRGlzYWJsZWQnIH0pKSxcbiAgICAgICAgfSxcbiAgICBdO1xuICAgIHJldHVybiAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmaXhlZCBpbnNldC0wIHotNTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgYmctYmxhY2svNTBcIiwgY2hpbGRyZW46IF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImJnLXdoaXRlIGRhcms6YmctZ3JheS04MDAgcm91bmRlZC1sZyBzaGFkb3cteGwgdy1mdWxsIG1heC13LTV4bCBtYXgtaC1bOTB2aF0gb3ZlcmZsb3ctaGlkZGVuIGZsZXggZmxleC1jb2xcIiwgY2hpbGRyZW46IFtfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC02IGJvcmRlci1iIGJvcmRlci1ncmF5LTIwMCBkYXJrOmJvcmRlci1ncmF5LTcwMFwiLCBjaGlsZHJlbjogW19qc3hzKFwiZGl2XCIsIHsgY2hpbGRyZW46IFtfanN4KFwiaDJcIiwgeyBjbGFzc05hbWU6IFwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZ3JheS05MDAgZGFyazp0ZXh0LXdoaXRlXCIsIGNoaWxkcmVuOiBcIkdyb3VwIE1lbWJlcnNcIiB9KSwgX2pzeChcInBcIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMCBtdC0xXCIsIGNoaWxkcmVuOiBncm91cE5hbWUgfSldIH0pLCBfanN4KFwiYnV0dG9uXCIsIHsgb25DbGljazogKCkgPT4gY2xvc2VNb2RhbChtb2RhbElkKSwgY2xhc3NOYW1lOiBcInRleHQtZ3JheS00MDAgaG92ZXI6dGV4dC1ncmF5LTYwMCBkYXJrOmhvdmVyOnRleHQtZ3JheS0zMDBcIiwgZGlzYWJsZWQ6IGlzTG9hZGluZywgY2hpbGRyZW46IF9qc3goWCwgeyBzaXplOiAyNCB9KSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTQgYm9yZGVyLWIgYm9yZGVyLWdyYXktMjAwIGRhcms6Ym9yZGVyLWdyYXktNzAwXCIsIGNoaWxkcmVuOiBbX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTRcIiwgY2hpbGRyZW46IFtfanN4KElucHV0LCB7IHBsYWNlaG9sZGVyOiBcIlNlYXJjaCBtZW1iZXJzLi4uXCIsIHZhbHVlOiBzZWFyY2hUZXh0LCBvbkNoYW5nZTogKGUpID0+IHNldFNlYXJjaFRleHQoZS50YXJnZXQudmFsdWUpLCBjbGFzc05hbWU6IFwidy02NFwiIH0pLCBfanN4cyhcInNwYW5cIiwgeyBjbGFzc05hbWU6IFwidGV4dC1zbSB0ZXh0LWdyYXktNjAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBjaGlsZHJlbjogW2ZpbHRlcmVkTWVtYmVycy5sZW5ndGgsIFwiIG9mIFwiLCBtZW1iZXJzLmxlbmd0aCwgXCIgbWVtYmVyc1wiXSB9KV0gfSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCIsIGNoaWxkcmVuOiBbX2pzeChCdXR0b24sIHsgb25DbGljazogbG9hZE1lbWJlcnMsIHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIHNpemU6IFwic21cIiwgaWNvbjogX2pzeChSZWZyZXNoQ3csIHsgY2xhc3NOYW1lOiBpc0xvYWRpbmcgPyAnYW5pbWF0ZS1zcGluJyA6ICcnLCBzaXplOiAxOCB9KSwgZGlzYWJsZWQ6IGlzTG9hZGluZywgY2hpbGRyZW46IFwiUmVmcmVzaFwiIH0pLCBfanN4KEJ1dHRvbiwgeyBvbkNsaWNrOiBoYW5kbGVBZGRNZW1iZXJzLCB2YXJpYW50OiBcInByaW1hcnlcIiwgc2l6ZTogXCJzbVwiLCBpY29uOiBfanN4KFVzZXJQbHVzLCB7IHNpemU6IDE4IH0pLCBkaXNhYmxlZDogaXNMb2FkaW5nLCBjaGlsZHJlbjogXCJBZGQgTWVtYmVyc1wiIH0pLCBfanN4cyhCdXR0b24sIHsgb25DbGljazogaGFuZGxlUmVtb3ZlTWVtYmVycywgdmFyaWFudDogXCJkYW5nZXJcIiwgc2l6ZTogXCJzbVwiLCBpY29uOiBfanN4KFRyYXNoMiwgeyBzaXplOiAxOCB9KSwgZGlzYWJsZWQ6IHNlbGVjdGVkTWVtYmVycy5sZW5ndGggPT09IDAgfHwgaXNMb2FkaW5nLCBjaGlsZHJlbjogW1wiUmVtb3ZlIChcIiwgc2VsZWN0ZWRNZW1iZXJzLmxlbmd0aCwgXCIpXCJdIH0pXSB9KV0gfSksIGVycm9yICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcIm14LTYgbXQtNCBwLTQgYmctcmVkLTUwIGRhcms6YmctcmVkLTkwMC8yMCBib3JkZXIgYm9yZGVyLXJlZC0yMDAgZGFyazpib3JkZXItcmVkLTgwMCByb3VuZGVkLWxnIHRleHQtcmVkLTcwMCBkYXJrOnRleHQtcmVkLTQwMFwiLCBjaGlsZHJlbjogZXJyb3IgfSkpLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXgtMSBwLTYgb3ZlcmZsb3ctaGlkZGVuXCIsIGNoaWxkcmVuOiBpc0xvYWRpbmcgJiYgbWVtYmVycy5sZW5ndGggPT09IDAgPyAoX2pzeChcImRpdlwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBoLWZ1bGxcIiwgY2hpbGRyZW46IF9qc3goTG9hZGluZ1NwaW5uZXIsIHsgc2l6ZTogXCJsZ1wiIH0pIH0pKSA6IChfanN4KFZpcnR1YWxpemVkRGF0YUdyaWQsIHsgZGF0YTogZmlsdGVyZWRNZW1iZXJzLCBjb2x1bW5zOiBjb2x1bW5EZWZzLCBsb2FkaW5nOiBpc0xvYWRpbmcsIG9uU2VsZWN0aW9uQ2hhbmdlOiBzZXRTZWxlY3RlZE1lbWJlcnMsIGhlaWdodDogXCIxMDAlXCIgfSkpIH0pLCBfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktZW5kIGdhcC0zIHAtNiBib3JkZXItdCBib3JkZXItZ3JheS0yMDAgZGFyazpib3JkZXItZ3JheS03MDBcIiwgY2hpbGRyZW46IF9qc3goQnV0dG9uLCB7IHZhcmlhbnQ6IFwic2Vjb25kYXJ5XCIsIG9uQ2xpY2s6ICgpID0+IGNsb3NlTW9kYWwobW9kYWxJZCksIGNoaWxkcmVuOiBcIkNsb3NlXCIgfSkgfSldIH0pIH0pKTtcbn07XG5leHBvcnQgZGVmYXVsdCBHcm91cE1lbWJlcnNNb2RhbDtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==