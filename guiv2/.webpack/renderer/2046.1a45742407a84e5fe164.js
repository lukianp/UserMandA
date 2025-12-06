"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2046],{

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

/***/ 62307:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   f: () => (/* binding */ useMigrationPlanningLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _store_useMigrationStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2782);
/* harmony import */ var _store_useProfileStore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(33813);
/**
 * Migration Planning Logic Hook
 *
 * Manages wave planning functionality including:
 * - Wave creation, editing, deletion
 * - Wave duplication
 * - Form state management
 * - Search and filtering
 */



const useMigrationPlanningLogic = () => {
    const { waves, selectedWaveId, isLoading, error, loadWaves, planWave, updateWave, deleteWave, setSelectedWave, duplicateWave, } = (0,_store_useMigrationStore__WEBPACK_IMPORTED_MODULE_1__/* .useMigrationStore */ .V)();
    const { selectedSourceProfile, selectedTargetProfile } = (0,_store_useProfileStore__WEBPACK_IMPORTED_MODULE_2__/* .useProfileStore */ .K)();
    // Local form state
    const [formData, setFormData] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
        name: '',
        description: '',
        plannedStartDate: new Date().toISOString(),
        plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
        priority: 'Normal',
        batches: [],
        tasks: [],
        notes: '',
        prerequisites: [],
    });
    const [searchText, setSearchText] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
    const [showWaveForm, setShowWaveForm] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [editingWaveId, setEditingWaveId] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    // Load waves on mount
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        loadWaves();
    }, [loadWaves]);
    // Filtered waves based on search text
    const filteredWaves = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!searchText)
            return waves;
        const lower = searchText.toLowerCase();
        return waves.filter(w => (w.name ?? '').toLowerCase().includes(lower) ||
            (w.description ?? '').toLowerCase().includes(lower) ||
            (w.status ?? '').toLowerCase().includes(lower));
    }, [waves, searchText]);
    // Get selected wave object
    const selectedWave = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => waves.find(w => w.id === selectedWaveId), [waves, selectedWaveId]);
    // Form handlers
    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const handleCreateWave = async () => {
        if (!formData.name) {
            throw new Error('Wave name is required');
        }
        try {
            const waveId = await planWave(formData);
            resetForm();
            setSelectedWave(waveId);
            setShowWaveForm(false);
        }
        catch (error) {
            console.error('Failed to create wave:', error);
            throw error;
        }
    };
    const handleUpdateWave = async () => {
        if (!editingWaveId)
            return;
        try {
            await updateWave(editingWaveId, formData);
            resetForm();
            setEditingWaveId(null);
            setShowWaveForm(false);
        }
        catch (error) {
            console.error('Failed to update wave:', error);
            throw error;
        }
    };
    const handleEditWave = (wave) => {
        setFormData({
            name: wave.name,
            description: wave.description,
            plannedStartDate: wave.plannedStartDate,
            plannedEndDate: wave.plannedEndDate,
            priority: wave.priority,
            batches: wave.batches,
            tasks: wave.tasks,
            notes: wave.notes,
            prerequisites: wave.prerequisites,
        });
        setEditingWaveId(wave.id);
        setShowWaveForm(true);
    };
    const handleDeleteWave = async (id) => {
        if (confirm('Delete this migration wave? This cannot be undone.')) {
            try {
                await deleteWave(id);
                if (selectedWaveId === id) {
                    setSelectedWave(null);
                }
            }
            catch (error) {
                console.error('Failed to delete wave:', error);
                throw error;
            }
        }
    };
    const handleDuplicateWave = async (id) => {
        try {
            const newWaveId = await duplicateWave(id);
            setSelectedWave(newWaveId);
        }
        catch (error) {
            console.error('Failed to duplicate wave:', error);
            throw error;
        }
    };
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            plannedStartDate: new Date().toISOString(),
            plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'Normal',
            batches: [],
            tasks: [],
            notes: '',
            prerequisites: [],
        });
        setEditingWaveId(null);
    };
    const handleCancelForm = () => {
        resetForm();
        setShowWaveForm(false);
    };
    const handleSelectWave = (wave) => {
        setSelectedWave(wave.id);
    };
    return {
        // State
        waves: filteredWaves,
        selectedWave,
        isLoading,
        error,
        searchText,
        setSearchText,
        showWaveForm,
        setShowWaveForm,
        formData,
        // Form handlers
        handleFieldChange,
        handleCreateWave,
        handleUpdateWave,
        handleEditWave,
        handleDeleteWave,
        handleDuplicateWave,
        handleCancelForm,
        handleSelectWave,
        // Computed
        isEditing: !!editingWaveId,
        canSave: !!formData.name && !!selectedSourceProfile && !!selectedTargetProfile,
    };
};


/***/ }),

/***/ 64017:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   w: () => (/* binding */ useMigrationAnalysisLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/**
 * Migration Analysis Logic Hook
 * Handles complexity analysis for migration planning
 */

const useMigrationAnalysisLogic = () => {
    const [complexityScores, setComplexityScores] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(new Map());
    const [isAnalyzing, setIsAnalyzing] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [lastAnalyzed, setLastAnalyzed] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    /**
     * Analyze complexity for multiple users
     */
    const analyzeUsers = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (userIds) => {
        if (userIds.length === 0) {
            setError('No users selected for analysis');
            return;
        }
        setIsAnalyzing(true);
        setError(null);
        try {
            console.log(`Analyzing complexity for ${userIds.length} users...`);
            // Call IPC handler to analyze each user
            const results = await Promise.all(userIds.map(async (userId) => {
                try {
                    const result = await window.electronAPI.invoke('logicEngine:analyzeMigrationComplexity', userId);
                    if (result.success) {
                        return { userId, score: result.data };
                    }
                    else {
                        console.error(`Failed to analyze user ${userId}:`, result.error);
                        return {
                            userId,
                            score: {
                                score: 0,
                                level: 'Low',
                                factors: [`Analysis failed: ${result.error}`]
                            }
                        };
                    }
                }
                catch (err) {
                    console.error(`Exception analyzing user ${userId}:`, err);
                    return {
                        userId,
                        score: {
                            score: 0,
                            level: 'Low',
                            factors: [`Analysis exception: ${err.message}`]
                        }
                    };
                }
            }));
            // Update complexity scores map
            const newScores = new Map(complexityScores);
            results.forEach(({ userId, score }) => {
                newScores.set(userId, score);
            });
            setComplexityScores(newScores);
            setLastAnalyzed(new Date());
            console.log(`Complexity analysis complete: ${results.length} users analyzed`);
        }
        catch (err) {
            const errorMsg = `Complexity analysis failed: ${err.message}`;
            console.error(errorMsg, err);
            setError(errorMsg);
        }
        finally {
            setIsAnalyzing(false);
        }
    }, [complexityScores]);
    /**
     * Analyze a single user
     */
    const analyzeSingleUser = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (userId) => {
        setIsAnalyzing(true);
        setError(null);
        try {
            const result = await window.electronAPI.invoke('logicEngine:analyzeMigrationComplexity', userId);
            if (result.success) {
                const score = result.data;
                // Update map
                const newScores = new Map(complexityScores);
                newScores.set(userId, score);
                setComplexityScores(newScores);
                setLastAnalyzed(new Date());
                return score;
            }
            else {
                setError(result.error || 'Analysis failed');
                return null;
            }
        }
        catch (err) {
            const errorMsg = `Failed to analyze user: ${err.message}`;
            setError(errorMsg);
            console.error(errorMsg, err);
            return null;
        }
        finally {
            setIsAnalyzing(false);
        }
    }, [complexityScores]);
    /**
     * Get complexity score for a specific user
     */
    const getComplexityScore = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((userId) => {
        return complexityScores.get(userId);
    }, [complexityScores]);
    /**
     * Get complexity statistics
     */
    const getComplexityStats = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        const scores = Array.from(complexityScores.values());
        return {
            total: scores.length,
            low: scores.filter(s => s.level === 'Low').length,
            medium: scores.filter(s => s.level === 'Medium').length,
            high: scores.filter(s => s.level === 'High').length,
            averageScore: scores.length > 0
                ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length
                : 0
        };
    }, [complexityScores]);
    /**
     * Clear all complexity scores
     */
    const clearAnalysis = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        setComplexityScores(new Map());
        setError(null);
        setLastAnalyzed(null);
    }, []);
    /**
     * Get users by complexity level
     */
    const getUsersByComplexity = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((level) => {
        const userIds = [];
        complexityScores.forEach((score, userId) => {
            if (score.level === level) {
                userIds.push(userId);
            }
        });
        return userIds;
    }, [complexityScores]);
    /**
     * Check if user has been analyzed
     */
    const isUserAnalyzed = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((userId) => {
        return complexityScores.has(userId);
    }, [complexityScores]);
    return {
        // State
        complexityScores,
        isAnalyzing,
        error,
        lastAnalyzed,
        // Actions
        analyzeUsers,
        analyzeSingleUser,
        getComplexityScore,
        getComplexityStats,
        clearAnalysis,
        getUsersByComplexity,
        isUserAnalyzed
    };
};


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL2F0b21zL0lucHV0LnRzeCIsIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9jb21wb25lbnRzL21vbGVjdWxlcy9TZWFyY2hCYXIudHN4Iiwid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZU1pZ3JhdGlvblBsYW5uaW5nTG9naWMudHMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlTWlncmF0aW9uQW5hbHlzaXNMb2dpYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBqc3ggYXMgX2pzeCwganN4cyBhcyBfanN4cyB9IGZyb20gXCJyZWFjdC9qc3gtcnVudGltZVwiO1xuLyoqXG4gKiBJbnB1dCBDb21wb25lbnRcbiAqXG4gKiBBY2Nlc3NpYmxlIGlucHV0IGZpZWxkIHdpdGggbGFiZWwsIGVycm9yIHN0YXRlcywgYW5kIGhlbHAgdGV4dFxuICovXG5pbXBvcnQgUmVhY3QsIHsgZm9yd2FyZFJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IEFsZXJ0Q2lyY2xlLCBJbmZvIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogSW5wdXQgY29tcG9uZW50IHdpdGggZnVsbCBhY2Nlc3NpYmlsaXR5IHN1cHBvcnRcbiAqL1xuZXhwb3J0IGNvbnN0IElucHV0ID0gZm9yd2FyZFJlZigoeyBsYWJlbCwgaGVscGVyVGV4dCwgZXJyb3IsIHJlcXVpcmVkID0gZmFsc2UsIHNob3dPcHRpb25hbCA9IHRydWUsIGlucHV0U2l6ZSA9ICdtZCcsIGZ1bGxXaWR0aCA9IGZhbHNlLCBzdGFydEljb24sIGVuZEljb24sIGNsYXNzTmFtZSwgaWQsICdkYXRhLWN5JzogZGF0YUN5LCBkaXNhYmxlZCA9IGZhbHNlLCAuLi5wcm9wcyB9LCByZWYpID0+IHtcbiAgICAvLyBHZW5lcmF0ZSB1bmlxdWUgSUQgaWYgbm90IHByb3ZpZGVkXG4gICAgY29uc3QgaW5wdXRJZCA9IGlkIHx8IGBpbnB1dC0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1gO1xuICAgIGNvbnN0IGVycm9ySWQgPSBgJHtpbnB1dElkfS1lcnJvcmA7XG4gICAgY29uc3QgaGVscGVySWQgPSBgJHtpbnB1dElkfS1oZWxwZXJgO1xuICAgIC8vIFNpemUgc3R5bGVzXG4gICAgY29uc3Qgc2l6ZXMgPSB7XG4gICAgICAgIHNtOiAncHgtMyBweS0xLjUgdGV4dC1zbScsXG4gICAgICAgIG1kOiAncHgtNCBweS0yIHRleHQtYmFzZScsXG4gICAgICAgIGxnOiAncHgtNSBweS0zIHRleHQtbGcnLFxuICAgIH07XG4gICAgLy8gSW5wdXQgY2xhc3Nlc1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHJvdW5kZWQtbWQgYm9yZGVyIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctb2Zmc2V0LTInLCAnZGlzYWJsZWQ6YmctZ3JheS01MCBkaXNhYmxlZDp0ZXh0LWdyYXktNTAwIGRpc2FibGVkOmN1cnNvci1ub3QtYWxsb3dlZCcsICdkYXJrOmJnLWdyYXktODAwIGRhcms6dGV4dC1ncmF5LTEwMCcsIHNpemVzW2lucHV0U2l6ZV0sIGZ1bGxXaWR0aCAmJiAndy1mdWxsJywgc3RhcnRJY29uICYmICdwbC0xMCcsIGVuZEljb24gJiYgJ3ByLTEwJywgZXJyb3JcbiAgICAgICAgPyBjbHN4KCdib3JkZXItcmVkLTUwMCB0ZXh0LXJlZC05MDAgcGxhY2Vob2xkZXItcmVkLTQwMCcsICdmb2N1czpib3JkZXItcmVkLTUwMCBmb2N1czpyaW5nLXJlZC01MDAnLCAnZGFyazpib3JkZXItcmVkLTQwMCBkYXJrOnRleHQtcmVkLTQwMCcpXG4gICAgICAgIDogY2xzeCgnYm9yZGVyLWdyYXktMzAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOmJvcmRlci1ibHVlLTUwMCBmb2N1czpyaW5nLWJsdWUtNTAwJywgJ2Rhcms6Ym9yZGVyLWdyYXktNjAwIGRhcms6cGxhY2Vob2xkZXItZ3JheS01MDAnKSwgY2xhc3NOYW1lKTtcbiAgICAvLyBDb250YWluZXIgY2xhc3Nlc1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzZXMgPSBjbHN4KGZ1bGxXaWR0aCAmJiAndy1mdWxsJyk7XG4gICAgLy8gTGFiZWwgY2xhc3Nlc1xuICAgIGNvbnN0IGxhYmVsQ2xhc3NlcyA9IGNsc3goJ2Jsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1ncmF5LTcwMCBkYXJrOnRleHQtZ3JheS0yMDAgbWItMScpO1xuICAgIC8vIEhlbHBlci9FcnJvciB0ZXh0IGNsYXNzZXNcbiAgICBjb25zdCBoZWxwZXJDbGFzc2VzID0gY2xzeCgnbXQtMSB0ZXh0LXNtJywgZXJyb3IgPyAndGV4dC1yZWQtNjAwIGRhcms6dGV4dC1yZWQtNDAwJyA6ICd0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMCcpO1xuICAgIHJldHVybiAoX2pzeHMoXCJkaXZcIiwgeyBjbGFzc05hbWU6IGNvbnRhaW5lckNsYXNzZXMsIGNoaWxkcmVuOiBbbGFiZWwgJiYgKF9qc3hzKFwibGFiZWxcIiwgeyBodG1sRm9yOiBpbnB1dElkLCBjbGFzc05hbWU6IGxhYmVsQ2xhc3NlcywgY2hpbGRyZW46IFtsYWJlbCwgcmVxdWlyZWQgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtcmVkLTUwMCBtbC0xXCIsIFwiYXJpYS1sYWJlbFwiOiBcInJlcXVpcmVkXCIsIGNoaWxkcmVuOiBcIipcIiB9KSksICFyZXF1aXJlZCAmJiBzaG93T3B0aW9uYWwgJiYgKF9qc3goXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcInRleHQtZ3JheS01MDAgZGFyazp0ZXh0LWdyYXktNDAwIG1sLTEgdGV4dC14c1wiLCBjaGlsZHJlbjogXCIob3B0aW9uYWwpXCIgfSkpXSB9KSksIF9qc3hzKFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcInJlbGF0aXZlXCIsIGNoaWxkcmVuOiBbc3RhcnRJY29uICYmIChfanN4KFwiZGl2XCIsIHsgY2xhc3NOYW1lOiBcImFic29sdXRlIGluc2V0LXktMCBsZWZ0LTAgcGwtMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogc3RhcnRJY29uIH0pIH0pKSwgX2pzeChcImlucHV0XCIsIHsgcmVmOiByZWYsIGlkOiBpbnB1dElkLCBjbGFzc05hbWU6IGlucHV0Q2xhc3NlcywgXCJhcmlhLWludmFsaWRcIjogISFlcnJvciwgXCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGNsc3goZXJyb3IgJiYgZXJyb3JJZCwgaGVscGVyVGV4dCAmJiBoZWxwZXJJZCkgfHwgdW5kZWZpbmVkLCBcImFyaWEtcmVxdWlyZWRcIjogcmVxdWlyZWQsIGRpc2FibGVkOiBkaXNhYmxlZCwgXCJkYXRhLWN5XCI6IGRhdGFDeSwgLi4ucHJvcHMgfSksIGVuZEljb24gJiYgKF9qc3goXCJkaXZcIiwgeyBjbGFzc05hbWU6IFwiYWJzb2x1dGUgaW5zZXQteS0wIHJpZ2h0LTAgcHItMyBmbGV4IGl0ZW1zLWNlbnRlciBwb2ludGVyLWV2ZW50cy1ub25lXCIsIGNoaWxkcmVuOiBfanN4KFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJ0ZXh0LWdyYXktNTAwIGRhcms6dGV4dC1ncmF5LTQwMFwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiLCBjaGlsZHJlbjogZW5kSWNvbiB9KSB9KSldIH0pLCBlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBlcnJvcklkLCBjbGFzc05hbWU6IGhlbHBlckNsYXNzZXMsIHJvbGU6IFwiYWxlcnRcIiwgY2hpbGRyZW46IF9qc3hzKFwic3BhblwiLCB7IGNsYXNzTmFtZTogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLCBjaGlsZHJlbjogW19qc3goQWxlcnRDaXJjbGUsIHsgY2xhc3NOYW1lOiBcInctNCBoLTQgbXItMVwiLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBlcnJvcl0gfSkgfSkpLCBoZWxwZXJUZXh0ICYmICFlcnJvciAmJiAoX2pzeChcImRpdlwiLCB7IGlkOiBoZWxwZXJJZCwgY2xhc3NOYW1lOiBoZWxwZXJDbGFzc2VzLCBjaGlsZHJlbjogX2pzeHMoXCJzcGFuXCIsIHsgY2xhc3NOYW1lOiBcImZsZXggaXRlbXMtY2VudGVyXCIsIGNoaWxkcmVuOiBbX2pzeChJbmZvLCB7IGNsYXNzTmFtZTogXCJ3LTQgaC00IG1yLTFcIiwgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9KSwgaGVscGVyVGV4dF0gfSkgfSkpXSB9KSk7XG59KTtcbklucHV0LmRpc3BsYXlOYW1lID0gJ0lucHV0JztcbiIsImltcG9ydCB7IGpzeCBhcyBfanN4LCBqc3hzIGFzIF9qc3hzIH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG4vKipcbiAqIFNlYXJjaEJhciBDb21wb25lbnRcbiAqXG4gKiBTZWFyY2ggaW5wdXQgd2l0aCBpY29uLCBjbGVhciBidXR0b24sIGFuZCBkZWJvdW5jZWQgb25DaGFuZ2UuXG4gKiBVc2VkIGZvciBmaWx0ZXJpbmcgbGlzdHMgYW5kIHRhYmxlcy5cbiAqL1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNhbGxiYWNrIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgU2VhcmNoLCBYIH0gZnJvbSAnbHVjaWRlLXJlYWN0Jztcbi8qKlxuICogU2VhcmNoQmFyIENvbXBvbmVudFxuICovXG5leHBvcnQgY29uc3QgU2VhcmNoQmFyID0gKHsgdmFsdWU6IGNvbnRyb2xsZWRWYWx1ZSA9ICcnLCBvbkNoYW5nZSwgcGxhY2Vob2xkZXIgPSAnU2VhcmNoLi4uJywgZGVib3VuY2VEZWxheSA9IDMwMCwgZGlzYWJsZWQgPSBmYWxzZSwgc2l6ZSA9ICdtZCcsIGNsYXNzTmFtZSwgJ2RhdGEtY3knOiBkYXRhQ3ksIH0pID0+IHtcbiAgICBjb25zdCBbaW5wdXRWYWx1ZSwgc2V0SW5wdXRWYWx1ZV0gPSB1c2VTdGF0ZShjb250cm9sbGVkVmFsdWUpO1xuICAgIC8vIFN5bmMgd2l0aCBjb250cm9sbGVkIHZhbHVlXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgc2V0SW5wdXRWYWx1ZShjb250cm9sbGVkVmFsdWUpO1xuICAgIH0sIFtjb250cm9sbGVkVmFsdWVdKTtcbiAgICAvLyBEZWJvdW5jZWQgb25DaGFuZ2VcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAob25DaGFuZ2UgJiYgaW5wdXRWYWx1ZSAhPT0gY29udHJvbGxlZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoaW5wdXRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGRlYm91bmNlRGVsYXkpO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGhhbmRsZXIpO1xuICAgICAgICB9O1xuICAgIH0sIFtpbnB1dFZhbHVlLCBvbkNoYW5nZSwgZGVib3VuY2VEZWxheSwgY29udHJvbGxlZFZhbHVlXSk7XG4gICAgY29uc3QgaGFuZGxlSW5wdXRDaGFuZ2UgPSAoZSkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKGUudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUNsZWFyID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRJbnB1dFZhbHVlKCcnKTtcbiAgICAgICAgaWYgKG9uQ2hhbmdlKSB7XG4gICAgICAgICAgICBvbkNoYW5nZSgnJyk7XG4gICAgICAgIH1cbiAgICB9LCBbb25DaGFuZ2VdKTtcbiAgICAvLyBTaXplIGNsYXNzZXNcbiAgICBjb25zdCBzaXplQ2xhc3NlcyA9IHtcbiAgICAgICAgc206ICdoLTggdGV4dC1zbSBweC0zJyxcbiAgICAgICAgbWQ6ICdoLTEwIHRleHQtYmFzZSBweC00JyxcbiAgICAgICAgbGc6ICdoLTEyIHRleHQtbGcgcHgtNScsXG4gICAgfTtcbiAgICBjb25zdCBpY29uU2l6ZUNsYXNzZXMgPSB7XG4gICAgICAgIHNtOiAnaC00IHctNCcsXG4gICAgICAgIG1kOiAnaC01IHctNScsXG4gICAgICAgIGxnOiAnaC02IHctNicsXG4gICAgfTtcbiAgICBjb25zdCBjb250YWluZXJDbGFzc2VzID0gY2xzeCgncmVsYXRpdmUgZmxleCBpdGVtcy1jZW50ZXInLCBjbGFzc05hbWUpO1xuICAgIGNvbnN0IGlucHV0Q2xhc3NlcyA9IGNsc3goXG4gICAgLy8gQmFzZSBzdHlsZXNcbiAgICAndy1mdWxsIHJvdW5kZWQtbGcgYm9yZGVyIGJvcmRlci1ncmF5LTMwMCcsICdwbC0xMCBwci0xMCcsICdiZy13aGl0ZSB0ZXh0LWdyYXktOTAwIHBsYWNlaG9sZGVyLWdyYXktNDAwJywgJ2ZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1ibHVlLTUwMCBmb2N1czpib3JkZXItYmx1ZS01MDAnLCAndHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwJywgXG4gICAgLy8gU2l6ZVxuICAgIHNpemVDbGFzc2VzW3NpemVdLCBcbiAgICAvLyBEaXNhYmxlZFxuICAgIHtcbiAgICAgICAgJ2JnLWdyYXktMTAwIHRleHQtZ3JheS01MDAgY3Vyc29yLW5vdC1hbGxvd2VkJzogZGlzYWJsZWQsXG4gICAgfSk7XG4gICAgcmV0dXJuIChfanN4cyhcImRpdlwiLCB7IGNsYXNzTmFtZTogY29udGFpbmVyQ2xhc3NlcywgXCJkYXRhLWN5XCI6IGRhdGFDeSwgY2hpbGRyZW46IFtfanN4KFNlYXJjaCwgeyBjbGFzc05hbWU6IGNsc3goJ2Fic29sdXRlIGxlZnQtMyB0ZXh0LWdyYXktNDAwIHBvaW50ZXItZXZlbnRzLW5vbmUnLCBpY29uU2l6ZUNsYXNzZXNbc2l6ZV0pLCBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0pLCBfanN4KFwiaW5wdXRcIiwgeyB0eXBlOiBcInRleHRcIiwgdmFsdWU6IGlucHV0VmFsdWUsIG9uQ2hhbmdlOiBoYW5kbGVJbnB1dENoYW5nZSwgcGxhY2Vob2xkZXI6IHBsYWNlaG9sZGVyLCBkaXNhYmxlZDogZGlzYWJsZWQsIGNsYXNzTmFtZTogaW5wdXRDbGFzc2VzLCBcImFyaWEtbGFiZWxcIjogXCJTZWFyY2hcIiB9KSwgaW5wdXRWYWx1ZSAmJiAhZGlzYWJsZWQgJiYgKF9qc3goXCJidXR0b25cIiwgeyB0eXBlOiBcImJ1dHRvblwiLCBvbkNsaWNrOiBoYW5kbGVDbGVhciwgY2xhc3NOYW1lOiBjbHN4KCdhYnNvbHV0ZSByaWdodC0zJywgJ3RleHQtZ3JheS00MDAgaG92ZXI6dGV4dC1ncmF5LTYwMCcsICdmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS01MDAgcm91bmRlZCcsICd0cmFuc2l0aW9uLWNvbG9ycyBkdXJhdGlvbi0yMDAnKSwgXCJhcmlhLWxhYmVsXCI6IFwiQ2xlYXIgc2VhcmNoXCIsIGNoaWxkcmVuOiBfanN4KFgsIHsgY2xhc3NOYW1lOiBpY29uU2l6ZUNsYXNzZXNbc2l6ZV0gfSkgfSkpXSB9KSk7XG59O1xuZXhwb3J0IGRlZmF1bHQgU2VhcmNoQmFyO1xuIiwiLyoqXG4gKiBNaWdyYXRpb24gUGxhbm5pbmcgTG9naWMgSG9va1xuICpcbiAqIE1hbmFnZXMgd2F2ZSBwbGFubmluZyBmdW5jdGlvbmFsaXR5IGluY2x1ZGluZzpcbiAqIC0gV2F2ZSBjcmVhdGlvbiwgZWRpdGluZywgZGVsZXRpb25cbiAqIC0gV2F2ZSBkdXBsaWNhdGlvblxuICogLSBGb3JtIHN0YXRlIG1hbmFnZW1lbnRcbiAqIC0gU2VhcmNoIGFuZCBmaWx0ZXJpbmdcbiAqL1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZU1pZ3JhdGlvblN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlTWlncmF0aW9uU3RvcmUnO1xuaW1wb3J0IHsgdXNlUHJvZmlsZVN0b3JlIH0gZnJvbSAnLi4vc3RvcmUvdXNlUHJvZmlsZVN0b3JlJztcbmV4cG9ydCBjb25zdCB1c2VNaWdyYXRpb25QbGFubmluZ0xvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgd2F2ZXMsIHNlbGVjdGVkV2F2ZUlkLCBpc0xvYWRpbmcsIGVycm9yLCBsb2FkV2F2ZXMsIHBsYW5XYXZlLCB1cGRhdGVXYXZlLCBkZWxldGVXYXZlLCBzZXRTZWxlY3RlZFdhdmUsIGR1cGxpY2F0ZVdhdmUsIH0gPSB1c2VNaWdyYXRpb25TdG9yZSgpO1xuICAgIGNvbnN0IHsgc2VsZWN0ZWRTb3VyY2VQcm9maWxlLCBzZWxlY3RlZFRhcmdldFByb2ZpbGUgfSA9IHVzZVByb2ZpbGVTdG9yZSgpO1xuICAgIC8vIExvY2FsIGZvcm0gc3RhdGVcbiAgICBjb25zdCBbZm9ybURhdGEsIHNldEZvcm1EYXRhXSA9IHVzZVN0YXRlKHtcbiAgICAgICAgbmFtZTogJycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgICAgcGxhbm5lZFN0YXJ0RGF0ZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICBwbGFubmVkRW5kRGF0ZTogbmV3IERhdGUoRGF0ZS5ub3coKSArIDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKS50b0lTT1N0cmluZygpLCAvLyArNyBkYXlzXG4gICAgICAgIHByaW9yaXR5OiAnTm9ybWFsJyxcbiAgICAgICAgYmF0Y2hlczogW10sXG4gICAgICAgIHRhc2tzOiBbXSxcbiAgICAgICAgbm90ZXM6ICcnLFxuICAgICAgICBwcmVyZXF1aXNpdGVzOiBbXSxcbiAgICB9KTtcbiAgICBjb25zdCBbc2VhcmNoVGV4dCwgc2V0U2VhcmNoVGV4dF0gPSB1c2VTdGF0ZSgnJyk7XG4gICAgY29uc3QgW3Nob3dXYXZlRm9ybSwgc2V0U2hvd1dhdmVGb3JtXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbZWRpdGluZ1dhdmVJZCwgc2V0RWRpdGluZ1dhdmVJZF0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICAvLyBMb2FkIHdhdmVzIG9uIG1vdW50XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbG9hZFdhdmVzKCk7XG4gICAgfSwgW2xvYWRXYXZlc10pO1xuICAgIC8vIEZpbHRlcmVkIHdhdmVzIGJhc2VkIG9uIHNlYXJjaCB0ZXh0XG4gICAgY29uc3QgZmlsdGVyZWRXYXZlcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXNlYXJjaFRleHQpXG4gICAgICAgICAgICByZXR1cm4gd2F2ZXM7XG4gICAgICAgIGNvbnN0IGxvd2VyID0gc2VhcmNoVGV4dC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICByZXR1cm4gd2F2ZXMuZmlsdGVyKHcgPT4gKHcubmFtZSA/PyAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhsb3dlcikgfHxcbiAgICAgICAgICAgICh3LmRlc2NyaXB0aW9uID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyKSB8fFxuICAgICAgICAgICAgKHcuc3RhdHVzID8/ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxvd2VyKSk7XG4gICAgfSwgW3dhdmVzLCBzZWFyY2hUZXh0XSk7XG4gICAgLy8gR2V0IHNlbGVjdGVkIHdhdmUgb2JqZWN0XG4gICAgY29uc3Qgc2VsZWN0ZWRXYXZlID0gdXNlTWVtbygoKSA9PiB3YXZlcy5maW5kKHcgPT4gdy5pZCA9PT0gc2VsZWN0ZWRXYXZlSWQpLCBbd2F2ZXMsIHNlbGVjdGVkV2F2ZUlkXSk7XG4gICAgLy8gRm9ybSBoYW5kbGVyc1xuICAgIGNvbnN0IGhhbmRsZUZpZWxkQ2hhbmdlID0gKGZpZWxkLCB2YWx1ZSkgPT4ge1xuICAgICAgICBzZXRGb3JtRGF0YShwcmV2ID0+ICh7IC4uLnByZXYsIFtmaWVsZF06IHZhbHVlIH0pKTtcbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZUNyZWF0ZVdhdmUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghZm9ybURhdGEubmFtZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXYXZlIG5hbWUgaXMgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgd2F2ZUlkID0gYXdhaXQgcGxhbldhdmUoZm9ybURhdGEpO1xuICAgICAgICAgICAgcmVzZXRGb3JtKCk7XG4gICAgICAgICAgICBzZXRTZWxlY3RlZFdhdmUod2F2ZUlkKTtcbiAgICAgICAgICAgIHNldFNob3dXYXZlRm9ybShmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIHdhdmU6JywgZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IGhhbmRsZVVwZGF0ZVdhdmUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghZWRpdGluZ1dhdmVJZClcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVdhdmUoZWRpdGluZ1dhdmVJZCwgZm9ybURhdGEpO1xuICAgICAgICAgICAgcmVzZXRGb3JtKCk7XG4gICAgICAgICAgICBzZXRFZGl0aW5nV2F2ZUlkKG51bGwpO1xuICAgICAgICAgICAgc2V0U2hvd1dhdmVGb3JtKGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byB1cGRhdGUgd2F2ZTonLCBlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgY29uc3QgaGFuZGxlRWRpdFdhdmUgPSAod2F2ZSkgPT4ge1xuICAgICAgICBzZXRGb3JtRGF0YSh7XG4gICAgICAgICAgICBuYW1lOiB3YXZlLm5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogd2F2ZS5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIHBsYW5uZWRTdGFydERhdGU6IHdhdmUucGxhbm5lZFN0YXJ0RGF0ZSxcbiAgICAgICAgICAgIHBsYW5uZWRFbmREYXRlOiB3YXZlLnBsYW5uZWRFbmREYXRlLFxuICAgICAgICAgICAgcHJpb3JpdHk6IHdhdmUucHJpb3JpdHksXG4gICAgICAgICAgICBiYXRjaGVzOiB3YXZlLmJhdGNoZXMsXG4gICAgICAgICAgICB0YXNrczogd2F2ZS50YXNrcyxcbiAgICAgICAgICAgIG5vdGVzOiB3YXZlLm5vdGVzLFxuICAgICAgICAgICAgcHJlcmVxdWlzaXRlczogd2F2ZS5wcmVyZXF1aXNpdGVzLFxuICAgICAgICB9KTtcbiAgICAgICAgc2V0RWRpdGluZ1dhdmVJZCh3YXZlLmlkKTtcbiAgICAgICAgc2V0U2hvd1dhdmVGb3JtKHRydWUpO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlRGVsZXRlV2F2ZSA9IGFzeW5jIChpZCkgPT4ge1xuICAgICAgICBpZiAoY29uZmlybSgnRGVsZXRlIHRoaXMgbWlncmF0aW9uIHdhdmU/IFRoaXMgY2Fubm90IGJlIHVuZG9uZS4nKSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBkZWxldGVXYXZlKGlkKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRXYXZlSWQgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkV2F2ZShudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZGVsZXRlIHdhdmU6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVEdXBsaWNhdGVXYXZlID0gYXN5bmMgKGlkKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBuZXdXYXZlSWQgPSBhd2FpdCBkdXBsaWNhdGVXYXZlKGlkKTtcbiAgICAgICAgICAgIHNldFNlbGVjdGVkV2F2ZShuZXdXYXZlSWQpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGR1cGxpY2F0ZSB3YXZlOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCByZXNldEZvcm0gPSAoKSA9PiB7XG4gICAgICAgIHNldEZvcm1EYXRhKHtcbiAgICAgICAgICAgIG5hbWU6ICcnLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgICAgICAgcGxhbm5lZFN0YXJ0RGF0ZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgcGxhbm5lZEVuZERhdGU6IG5ldyBEYXRlKERhdGUubm93KCkgKyA3ICogMjQgKiA2MCAqIDYwICogMTAwMCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIHByaW9yaXR5OiAnTm9ybWFsJyxcbiAgICAgICAgICAgIGJhdGNoZXM6IFtdLFxuICAgICAgICAgICAgdGFza3M6IFtdLFxuICAgICAgICAgICAgbm90ZXM6ICcnLFxuICAgICAgICAgICAgcHJlcmVxdWlzaXRlczogW10sXG4gICAgICAgIH0pO1xuICAgICAgICBzZXRFZGl0aW5nV2F2ZUlkKG51bGwpO1xuICAgIH07XG4gICAgY29uc3QgaGFuZGxlQ2FuY2VsRm9ybSA9ICgpID0+IHtcbiAgICAgICAgcmVzZXRGb3JtKCk7XG4gICAgICAgIHNldFNob3dXYXZlRm9ybShmYWxzZSk7XG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVTZWxlY3RXYXZlID0gKHdhdmUpID0+IHtcbiAgICAgICAgc2V0U2VsZWN0ZWRXYXZlKHdhdmUuaWQpO1xuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gU3RhdGVcbiAgICAgICAgd2F2ZXM6IGZpbHRlcmVkV2F2ZXMsXG4gICAgICAgIHNlbGVjdGVkV2F2ZSxcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgc2VhcmNoVGV4dCxcbiAgICAgICAgc2V0U2VhcmNoVGV4dCxcbiAgICAgICAgc2hvd1dhdmVGb3JtLFxuICAgICAgICBzZXRTaG93V2F2ZUZvcm0sXG4gICAgICAgIGZvcm1EYXRhLFxuICAgICAgICAvLyBGb3JtIGhhbmRsZXJzXG4gICAgICAgIGhhbmRsZUZpZWxkQ2hhbmdlLFxuICAgICAgICBoYW5kbGVDcmVhdGVXYXZlLFxuICAgICAgICBoYW5kbGVVcGRhdGVXYXZlLFxuICAgICAgICBoYW5kbGVFZGl0V2F2ZSxcbiAgICAgICAgaGFuZGxlRGVsZXRlV2F2ZSxcbiAgICAgICAgaGFuZGxlRHVwbGljYXRlV2F2ZSxcbiAgICAgICAgaGFuZGxlQ2FuY2VsRm9ybSxcbiAgICAgICAgaGFuZGxlU2VsZWN0V2F2ZSxcbiAgICAgICAgLy8gQ29tcHV0ZWRcbiAgICAgICAgaXNFZGl0aW5nOiAhIWVkaXRpbmdXYXZlSWQsXG4gICAgICAgIGNhblNhdmU6ICEhZm9ybURhdGEubmFtZSAmJiAhIXNlbGVjdGVkU291cmNlUHJvZmlsZSAmJiAhIXNlbGVjdGVkVGFyZ2V0UHJvZmlsZSxcbiAgICB9O1xufTtcbiIsIi8qKlxuICogTWlncmF0aW9uIEFuYWx5c2lzIExvZ2ljIEhvb2tcbiAqIEhhbmRsZXMgY29tcGxleGl0eSBhbmFseXNpcyBmb3IgbWlncmF0aW9uIHBsYW5uaW5nXG4gKi9cbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjayB9IGZyb20gJ3JlYWN0JztcbmV4cG9ydCBjb25zdCB1c2VNaWdyYXRpb25BbmFseXNpc0xvZ2ljID0gKCkgPT4ge1xuICAgIGNvbnN0IFtjb21wbGV4aXR5U2NvcmVzLCBzZXRDb21wbGV4aXR5U2NvcmVzXSA9IHVzZVN0YXRlKG5ldyBNYXAoKSk7XG4gICAgY29uc3QgW2lzQW5hbHl6aW5nLCBzZXRJc0FuYWx5emluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBbbGFzdEFuYWx5emVkLCBzZXRMYXN0QW5hbHl6ZWRdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgLyoqXG4gICAgICogQW5hbHl6ZSBjb21wbGV4aXR5IGZvciBtdWx0aXBsZSB1c2Vyc1xuICAgICAqL1xuICAgIGNvbnN0IGFuYWx5emVVc2VycyA9IHVzZUNhbGxiYWNrKGFzeW5jICh1c2VySWRzKSA9PiB7XG4gICAgICAgIGlmICh1c2VySWRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgc2V0RXJyb3IoJ05vIHVzZXJzIHNlbGVjdGVkIGZvciBhbmFseXNpcycpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNldElzQW5hbHl6aW5nKHRydWUpO1xuICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBBbmFseXppbmcgY29tcGxleGl0eSBmb3IgJHt1c2VySWRzLmxlbmd0aH0gdXNlcnMuLi5gKTtcbiAgICAgICAgICAgIC8vIENhbGwgSVBDIGhhbmRsZXIgdG8gYW5hbHl6ZSBlYWNoIHVzZXJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbCh1c2VySWRzLm1hcChhc3luYyAodXNlcklkKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmludm9rZSgnbG9naWNFbmdpbmU6YW5hbHl6ZU1pZ3JhdGlvbkNvbXBsZXhpdHknLCB1c2VySWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHVzZXJJZCwgc2NvcmU6IHJlc3VsdC5kYXRhIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gYW5hbHl6ZSB1c2VyICR7dXNlcklkfTpgLCByZXN1bHQuZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsOiAnTG93JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFjdG9yczogW2BBbmFseXNpcyBmYWlsZWQ6ICR7cmVzdWx0LmVycm9yfWBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEV4Y2VwdGlvbiBhbmFseXppbmcgdXNlciAke3VzZXJJZH06YCwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmU6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWw6ICdMb3cnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhY3RvcnM6IFtgQW5hbHlzaXMgZXhjZXB0aW9uOiAke2Vyci5tZXNzYWdlfWBdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgLy8gVXBkYXRlIGNvbXBsZXhpdHkgc2NvcmVzIG1hcFxuICAgICAgICAgICAgY29uc3QgbmV3U2NvcmVzID0gbmV3IE1hcChjb21wbGV4aXR5U2NvcmVzKTtcbiAgICAgICAgICAgIHJlc3VsdHMuZm9yRWFjaCgoeyB1c2VySWQsIHNjb3JlIH0pID0+IHtcbiAgICAgICAgICAgICAgICBuZXdTY29yZXMuc2V0KHVzZXJJZCwgc2NvcmUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXRDb21wbGV4aXR5U2NvcmVzKG5ld1Njb3Jlcyk7XG4gICAgICAgICAgICBzZXRMYXN0QW5hbHl6ZWQobmV3IERhdGUoKSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQ29tcGxleGl0eSBhbmFseXNpcyBjb21wbGV0ZTogJHtyZXN1bHRzLmxlbmd0aH0gdXNlcnMgYW5hbHl6ZWRgKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9IGBDb21wbGV4aXR5IGFuYWx5c2lzIGZhaWxlZDogJHtlcnIubWVzc2FnZX1gO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvck1zZywgZXJyKTtcbiAgICAgICAgICAgIHNldEVycm9yKGVycm9yTXNnKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgIHNldElzQW5hbHl6aW5nKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH0sIFtjb21wbGV4aXR5U2NvcmVzXSk7XG4gICAgLyoqXG4gICAgICogQW5hbHl6ZSBhIHNpbmdsZSB1c2VyXG4gICAgICovXG4gICAgY29uc3QgYW5hbHl6ZVNpbmdsZVVzZXIgPSB1c2VDYWxsYmFjayhhc3luYyAodXNlcklkKSA9PiB7XG4gICAgICAgIHNldElzQW5hbHl6aW5nKHRydWUpO1xuICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5pbnZva2UoJ2xvZ2ljRW5naW5lOmFuYWx5emVNaWdyYXRpb25Db21wbGV4aXR5JywgdXNlcklkKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNjb3JlID0gcmVzdWx0LmRhdGE7XG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIG1hcFxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1Njb3JlcyA9IG5ldyBNYXAoY29tcGxleGl0eVNjb3Jlcyk7XG4gICAgICAgICAgICAgICAgbmV3U2NvcmVzLnNldCh1c2VySWQsIHNjb3JlKTtcbiAgICAgICAgICAgICAgICBzZXRDb21wbGV4aXR5U2NvcmVzKG5ld1Njb3Jlcyk7XG4gICAgICAgICAgICAgICAgc2V0TGFzdEFuYWx5emVkKG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzY29yZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldEVycm9yKHJlc3VsdC5lcnJvciB8fCAnQW5hbHlzaXMgZmFpbGVkJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNc2cgPSBgRmFpbGVkIHRvIGFuYWx5emUgdXNlcjogJHtlcnIubWVzc2FnZX1gO1xuICAgICAgICAgICAgc2V0RXJyb3IoZXJyb3JNc2cpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvck1zZywgZXJyKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgc2V0SXNBbmFseXppbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW2NvbXBsZXhpdHlTY29yZXNdKTtcbiAgICAvKipcbiAgICAgKiBHZXQgY29tcGxleGl0eSBzY29yZSBmb3IgYSBzcGVjaWZpYyB1c2VyXG4gICAgICovXG4gICAgY29uc3QgZ2V0Q29tcGxleGl0eVNjb3JlID0gdXNlQ2FsbGJhY2soKHVzZXJJZCkgPT4ge1xuICAgICAgICByZXR1cm4gY29tcGxleGl0eVNjb3Jlcy5nZXQodXNlcklkKTtcbiAgICB9LCBbY29tcGxleGl0eVNjb3Jlc10pO1xuICAgIC8qKlxuICAgICAqIEdldCBjb21wbGV4aXR5IHN0YXRpc3RpY3NcbiAgICAgKi9cbiAgICBjb25zdCBnZXRDb21wbGV4aXR5U3RhdHMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNjb3JlcyA9IEFycmF5LmZyb20oY29tcGxleGl0eVNjb3Jlcy52YWx1ZXMoKSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3RhbDogc2NvcmVzLmxlbmd0aCxcbiAgICAgICAgICAgIGxvdzogc2NvcmVzLmZpbHRlcihzID0+IHMubGV2ZWwgPT09ICdMb3cnKS5sZW5ndGgsXG4gICAgICAgICAgICBtZWRpdW06IHNjb3Jlcy5maWx0ZXIocyA9PiBzLmxldmVsID09PSAnTWVkaXVtJykubGVuZ3RoLFxuICAgICAgICAgICAgaGlnaDogc2NvcmVzLmZpbHRlcihzID0+IHMubGV2ZWwgPT09ICdIaWdoJykubGVuZ3RoLFxuICAgICAgICAgICAgYXZlcmFnZVNjb3JlOiBzY29yZXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgICAgID8gc2NvcmVzLnJlZHVjZSgoc3VtLCBzKSA9PiBzdW0gKyBzLnNjb3JlLCAwKSAvIHNjb3Jlcy5sZW5ndGhcbiAgICAgICAgICAgICAgICA6IDBcbiAgICAgICAgfTtcbiAgICB9LCBbY29tcGxleGl0eVNjb3Jlc10pO1xuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCBjb21wbGV4aXR5IHNjb3Jlc1xuICAgICAqL1xuICAgIGNvbnN0IGNsZWFyQW5hbHlzaXMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldENvbXBsZXhpdHlTY29yZXMobmV3IE1hcCgpKTtcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XG4gICAgICAgIHNldExhc3RBbmFseXplZChudWxsKTtcbiAgICB9LCBbXSk7XG4gICAgLyoqXG4gICAgICogR2V0IHVzZXJzIGJ5IGNvbXBsZXhpdHkgbGV2ZWxcbiAgICAgKi9cbiAgICBjb25zdCBnZXRVc2Vyc0J5Q29tcGxleGl0eSA9IHVzZUNhbGxiYWNrKChsZXZlbCkgPT4ge1xuICAgICAgICBjb25zdCB1c2VySWRzID0gW107XG4gICAgICAgIGNvbXBsZXhpdHlTY29yZXMuZm9yRWFjaCgoc2NvcmUsIHVzZXJJZCkgPT4ge1xuICAgICAgICAgICAgaWYgKHNjb3JlLmxldmVsID09PSBsZXZlbCkge1xuICAgICAgICAgICAgICAgIHVzZXJJZHMucHVzaCh1c2VySWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHVzZXJJZHM7XG4gICAgfSwgW2NvbXBsZXhpdHlTY29yZXNdKTtcbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB1c2VyIGhhcyBiZWVuIGFuYWx5emVkXG4gICAgICovXG4gICAgY29uc3QgaXNVc2VyQW5hbHl6ZWQgPSB1c2VDYWxsYmFjaygodXNlcklkKSA9PiB7XG4gICAgICAgIHJldHVybiBjb21wbGV4aXR5U2NvcmVzLmhhcyh1c2VySWQpO1xuICAgIH0sIFtjb21wbGV4aXR5U2NvcmVzXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy8gU3RhdGVcbiAgICAgICAgY29tcGxleGl0eVNjb3JlcyxcbiAgICAgICAgaXNBbmFseXppbmcsXG4gICAgICAgIGVycm9yLFxuICAgICAgICBsYXN0QW5hbHl6ZWQsXG4gICAgICAgIC8vIEFjdGlvbnNcbiAgICAgICAgYW5hbHl6ZVVzZXJzLFxuICAgICAgICBhbmFseXplU2luZ2xlVXNlcixcbiAgICAgICAgZ2V0Q29tcGxleGl0eVNjb3JlLFxuICAgICAgICBnZXRDb21wbGV4aXR5U3RhdHMsXG4gICAgICAgIGNsZWFyQW5hbHlzaXMsXG4gICAgICAgIGdldFVzZXJzQnlDb21wbGV4aXR5LFxuICAgICAgICBpc1VzZXJBbmFseXplZFxuICAgIH07XG59O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9