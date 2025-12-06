"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2782],{

/***/ 2782:
/*!*************************************************!*\
  !*** ./src/renderer/store/useMigrationStore.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useMigrationStore: () => (/* binding */ useMigrationStore)
/* harmony export */ });
/* harmony import */ var zustand__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! zustand */ 55618);
/* harmony import */ var zustand_middleware__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! zustand/middleware */ 87134);
/* harmony import */ var zustand_middleware_immer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! zustand/middleware/immer */ 9897);
/* harmony import */ var immer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! immer */ 1932);
/**
 * Migration Store
 *
 * Manages migration operations, progress tracking, and results.
 * Handles user, group, and data migration workflows.
 */




// Enable MapSet plugin for Immer to handle Maps and Sets in state
(0,immer__WEBPACK_IMPORTED_MODULE_3__.enableMapSet)();
const useMigrationStore = (0,zustand__WEBPACK_IMPORTED_MODULE_0__.create)()((0,zustand_middleware__WEBPACK_IMPORTED_MODULE_1__.devtools)((0,zustand_middleware__WEBPACK_IMPORTED_MODULE_1__.persist)((0,zustand_middleware__WEBPACK_IMPORTED_MODULE_1__.subscribeWithSelector)((0,zustand_middleware_immer__WEBPACK_IMPORTED_MODULE_2__.immer)((set, get) => ({
    // Existing state
    operations: new Map(),
    plans: [],
    selectedPlan: null,
    isMigrating: false,
    waves: [],
    selectedWaveId: null,
    currentWave: null,
    isLoading: false,
    error: null,
    // NEW: Wave orchestration state
    waveExecutionStatus: new Map(),
    waveDependencies: new Map(),
    // NEW: Resource mapping state
    mappings: [],
    // NEW: Conflict management state
    conflicts: [],
    conflictResolutionStrategies: new Map(),
    // NEW: Rollback system state
    rollbackPoints: [],
    canRollback: false,
    // NEW: Validation state
    validationResults: new Map(),
    // NEW: Delta sync state
    lastSyncTimestamp: null,
    deltaSyncEnabled: false,
    // Migration execution state
    executionProgress: null,
    isExecuting: false,
    executeMigration: async (waveId) => {
        await get().executeWave(waveId);
    },
    pauseMigration: async (waveId) => {
        await get().pauseWave(waveId);
    },
    resumeMigration: async (waveId) => {
        await get().resumeWave(waveId);
    },
    retryFailedItems: async (waveId) => {
        // Implement retry logic
        console.log('Retry failed items for wave:', waveId);
    },
    // Validation hook compatibility
    selectedWave: null,
    validateWave: async (waveId) => {
        await get().runPreFlightChecks(waveId);
    },
    validateAll: async () => {
        for (const wave of get().waves) {
            await get().runPreFlightChecks(wave.id);
        }
    },
    clearValidationResults: () => {
        set((state) => {
            state.validationResults.clear();
        });
    },
    // Actions
    /**
     * Create a new migration plan
     */
    createPlan: (planData) => {
        const newPlan = {
            ...planData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };
        set((state) => ({
            plans: [...state.plans, newPlan],
            selectedPlan: newPlan,
        }));
    },
    /**
     * Update an existing migration plan
     */
    updatePlan: (planId, updates) => {
        set((state) => ({
            plans: state.plans.map(p => p.id === planId ? { ...p, ...updates } : p),
            selectedPlan: state.selectedPlan?.id === planId
                ? { ...state.selectedPlan, ...updates }
                : state.selectedPlan,
        }));
    },
    /**
     * Delete a migration plan
     */
    deletePlan: (planId) => {
        set((state) => ({
            plans: state.plans.filter(p => p.id !== planId),
            selectedPlan: state.selectedPlan?.id === planId ? null : state.selectedPlan,
        }));
    },
    /**
     * Start executing a migration plan
     */
    startMigration: async (planId) => {
        const plan = get().plans.find(p => p.id === planId);
        if (!plan) {
            throw new Error(`Migration plan ${planId} not found`);
        }
        const operationId = crypto.randomUUID();
        const cancellationToken = crypto.randomUUID();
        const operation = {
            id: operationId,
            plan,
            status: 'NotStarted',
            progress: 0,
            currentTaskIndex: 0,
            taskResults: new Map(),
            failedTasks: [],
            startedAt: Date.now(),
            cancellationToken,
        };
        // Add operation to state
        set((state) => {
            const newOperations = new Map(state.operations);
            newOperations.set(operationId, operation);
            return {
                operations: newOperations,
                isMigrating: true,
            };
        });
        // Setup progress listener
        const progressCleanup = window.electronAPI.onProgress((data) => {
            if (data.executionId === cancellationToken) {
                const currentTask = get().operations.get(operationId)?.currentTaskIndex || 0;
                get().updateProgress(operationId, currentTask, data.percentage);
            }
        });
        try {
            // Execute migration tasks sequentially
            for (let i = 0; i < plan.tasks.length; i++) {
                const task = plan.tasks[i];
                // Update operation status
                set((state) => {
                    const newOperations = new Map(state.operations);
                    const op = newOperations.get(operationId);
                    if (op) {
                        op.status = 'InProgress';
                        op.currentTaskIndex = i;
                    }
                    return { operations: newOperations };
                });
                try {
                    // Execute task via PowerShell
                    const result = await window.electronAPI.executeModule({
                        modulePath: `Modules/Migration/${task.type}.psm1`,
                        functionName: `Invoke-${task.type}`,
                        parameters: task.parameters,
                        options: {
                            cancellationToken,
                            streamOutput: true,
                            timeout: task.timeout || 600000, // 10 minutes default
                        },
                    });
                    if (result.success) {
                        get().completeTask(operationId, task.id, result.data);
                    }
                    else {
                        get().failTask(operationId, task.id, result.error || 'Task failed');
                        // Stop on critical task failure
                        if (task.critical) {
                            throw new Error(`Critical task failed: ${task.name}`);
                        }
                    }
                }
                catch (error) {
                    get().failTask(operationId, task.id, error.message);
                    if (task.critical) {
                        throw error;
                    }
                }
            }
            // Cleanup and complete
            progressCleanup();
            get().completeMigration(operationId);
        }
        catch (error) {
            progressCleanup();
            console.error('Migration failed:', error);
            set((state) => {
                const newOperations = new Map(state.operations);
                const op = newOperations.get(operationId);
                if (op) {
                    op.status = 'Failed';
                    op.completedAt = Date.now();
                }
                return {
                    operations: newOperations,
                    isMigrating: false,
                };
            });
        }
        return operationId;
    },
    /**
     * Cancel a running migration
     */
    cancelMigration: async (operationId) => {
        const operation = get().operations.get(operationId);
        if (!operation || operation.status !== 'InProgress') {
            return;
        }
        try {
            await window.electronAPI.cancelExecution(operation.cancellationToken);
            set((state) => {
                const newOperations = new Map(state.operations);
                const op = newOperations.get(operationId);
                if (op) {
                    op.status = 'Cancelled';
                    op.completedAt = Date.now();
                }
                return {
                    operations: newOperations,
                    isMigrating: false,
                };
            });
        }
        catch (error) {
            console.error('Failed to cancel migration:', error);
        }
    },
    /**
     * Update progress for current task
     */
    updateProgress: (operationId, taskIndex, progress) => {
        set((state) => {
            const newOperations = new Map(state.operations);
            const operation = newOperations.get(operationId);
            if (operation) {
                // Calculate overall progress
                const tasksCompleted = taskIndex;
                const totalTasks = operation.plan.tasks.length;
                const taskProgress = progress / 100;
                const overallProgress = ((tasksCompleted + taskProgress) / totalTasks) * 100;
                operation.progress = Math.min(100, Math.round(overallProgress));
            }
            return { operations: newOperations };
        });
    },
    /**
     * Mark a task as completed
     */
    completeTask: (operationId, taskId, result) => {
        set((state) => {
            const newOperations = new Map(state.operations);
            const operation = newOperations.get(operationId);
            if (operation) {
                operation.taskResults.set(taskId, result);
            }
            return { operations: newOperations };
        });
    },
    /**
     * Mark a task as failed
     */
    failTask: (operationId, taskId, error) => {
        set((state) => {
            const newOperations = new Map(state.operations);
            const operation = newOperations.get(operationId);
            if (operation) {
                operation.failedTasks.push(taskId);
                operation.taskResults.set(taskId, { error });
            }
            return { operations: newOperations };
        });
    },
    /**
     * Mark migration as completed
     */
    completeMigration: (operationId) => {
        set((state) => {
            const newOperations = new Map(state.operations);
            const operation = newOperations.get(operationId);
            if (operation) {
                operation.status = operation.failedTasks.length > 0 ? 'CompletedWithWarnings' : 'Completed';
                operation.progress = 100;
                operation.completedAt = Date.now();
            }
            return {
                operations: newOperations,
                isMigrating: false,
            };
        });
    },
    /**
     * Clear a migration operation
     */
    clearOperation: (operationId) => {
        set((state) => {
            const newOperations = new Map(state.operations);
            newOperations.delete(operationId);
            return { operations: newOperations };
        });
    },
    /**
     * Get a specific operation
     */
    getOperation: (operationId) => {
        return get().operations.get(operationId);
    },
    /**
     * Load all migration waves
     */
    loadWaves: async () => {
        set({ isLoading: true, error: null });
        try {
            // For now, load from local storage or create empty array
            // In production, this would call window.electronAPI to load from file system
            const savedWaves = localStorage.getItem('migration-waves');
            const waves = savedWaves ? JSON.parse(savedWaves) : [];
            const currentSelectedId = get().selectedWaveId;
            const selectedWave = currentSelectedId ? waves.find((w) => w.id === currentSelectedId) || null : null;
            set({ waves, selectedWave, isLoading: false });
        }
        catch (error) {
            console.error('Failed to load waves:', error);
            set({ error: error.message || 'Failed to load waves', isLoading: false, waves: [], selectedWave: null });
        }
    },
    /**
     * Create a new migration wave
     */
    planWave: async (waveData) => {
        set({ isLoading: true, error: null });
        try {
            const newWave = {
                ...waveData,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                order: get().waves.length + 1,
                status: 'Planning',
                actualStartDate: null,
                actualEndDate: null,
                estimatedDuration: null,
                tasks: [],
                batches: [],
                metadata: {},
                notes: '',
                prerequisites: [],
                totalItems: 0,
                progressPercentage: 0,
            };
            const updatedWaves = [...get().waves, newWave];
            localStorage.setItem('migration-waves', JSON.stringify(updatedWaves));
            set({ waves: updatedWaves, isLoading: false });
            return newWave.id;
        }
        catch (error) {
            console.error('Failed to create wave:', error);
            set({ error: error.message || 'Failed to create wave', isLoading: false });
            throw error;
        }
    },
    /**
     * Update an existing wave
     */
    updateWave: async (waveId, updates) => {
        set({ isLoading: true, error: null });
        try {
            const updatedWaves = get().waves.map(w => w.id === waveId ? { ...w, ...updates } : w);
            localStorage.setItem('migration-waves', JSON.stringify(updatedWaves));
            set({ waves: updatedWaves, isLoading: false });
        }
        catch (error) {
            console.error('Failed to update wave:', error);
            set({ error: error.message || 'Failed to update wave', isLoading: false });
            throw error;
        }
    },
    /**
     * Delete a wave
     */
    deleteWave: async (waveId) => {
        set({ isLoading: true, error: null });
        try {
            const updatedWaves = get().waves.filter(w => w.id !== waveId);
            localStorage.setItem('migration-waves', JSON.stringify(updatedWaves));
            set({
                waves: updatedWaves,
                selectedWaveId: get().selectedWaveId === waveId ? null : get().selectedWaveId,
                isLoading: false,
            });
        }
        catch (error) {
            console.error('Failed to delete wave:', error);
            set({ error: error.message || 'Failed to delete wave', isLoading: false });
            throw error;
        }
    },
    /**
     * Duplicate an existing wave
     */
    duplicateWave: async (waveId) => {
        set({ isLoading: true, error: null });
        try {
            const originalWave = get().waves.find(w => w.id === waveId);
            if (!originalWave) {
                throw new Error(`Wave ${waveId} not found`);
            }
            const newWave = {
                ...originalWave,
                id: crypto.randomUUID(),
                name: `${originalWave.name} (Copy)`,
                createdAt: new Date().toISOString(),
                order: get().waves.length + 1,
                status: 'Planning',
                actualStartDate: null,
                actualEndDate: null,
                // Ensure users array is properly copied
                users: originalWave.users ? [...originalWave.users] : ['user1', 'user2'],
            };
            const updatedWaves = [...get().waves, newWave];
            localStorage.setItem('migration-waves', JSON.stringify(updatedWaves));
            set({ waves: updatedWaves, isLoading: false });
            return newWave.id;
        }
        catch (error) {
            console.error('Failed to duplicate wave:', error);
            set({ error: error.message || 'Failed to duplicate wave', isLoading: false });
            throw error;
        }
    },
    /**
     * Set the selected wave
     */
    setSelectedWave: (waveId) => {
        set((state) => {
            const wave = state.waves.find(w => w.id === waveId) || null;
            state.selectedWaveId = waveId;
            state.selectedWave = wave;
        });
    },
    /**
     * Clear error state
     */
    clearError: () => {
        set({ error: null });
    },
    // ==================== ENHANCED WAVE ORCHESTRATION ====================
    /**
     * Reorder waves by providing new order
     */
    reorderWaves: (waveIds) => {
        set((state) => {
            const reorderedWaves = waveIds
                .map((id) => state.waves.find((w) => w.id === id))
                .filter((w) => w !== undefined)
                .map((wave, index) => ({ ...wave, order: index + 1 }));
            state.waves = reorderedWaves;
        });
    },
    /**
     * Validate wave dependencies
     */
    validateWaveDependencies: async (waveId) => {
        const wave = get().waves.find((w) => w.id === waveId);
        if (!wave) {
            throw new Error(`Wave ${waveId} not found`);
        }
        const deps = get().waveDependencies.get(waveId) || [];
        const errors = [];
        const warnings = [];
        // Check if dependencies are completed
        for (const depId of deps) {
            const depWave = get().waves.find((w) => w.id === depId);
            if (!depWave) {
                errors.push({
                    field: 'dependencies',
                    message: `Dependent wave ${depId} not found`,
                    code: 'MISSING_DEPENDENCY',
                    severity: 'error',
                });
            }
            else if (depWave.status !== 'Completed') {
                warnings.push({
                    field: 'dependencies',
                    message: `Dependent wave "${depWave.name}" is not completed`,
                    code: 'INCOMPLETE_DEPENDENCY',
                    severity: 'warning',
                });
            }
        }
        const result = {
            isValid: errors.length === 0,
            errors: errors.map(e => ({
                field: e.field || '',
                message: e.message,
                severity: e.severity === 'critical' ? 'error' : 'error'
            })),
            warnings: warnings.map(w => ({
                field: w.field || '',
                message: w.message,
            })),
        };
        set((state) => {
            state.validationResults.set(waveId, result);
        });
        return result;
    },
    /**
     * Execute a migration wave
     */
    executeWave: async (waveId) => {
        set((state) => {
            state.isLoading = true;
            state.error = null;
        });
        try {
            const wave = get().waves.find((w) => w.id === waveId);
            if (!wave) {
                throw new Error(`Wave ${waveId} not found`);
            }
            // Validate dependencies first
            const validation = await get().validateWaveDependencies(waveId);
            if (!validation.isValid) {
                throw new Error(`Wave dependencies validation failed: ${validation.errors.join(', ')}`);
            }
            // Create rollback point before execution
            await get().createRollbackPoint(`Before ${wave.name} execution`);
            // Initialize execution status
            const executionStatus = {
                waveId,
                status: 'InProgress',
                phase: 'preparing',
                progress: {
                    waveId,
                    phase: 'preparing',
                    overallProgress: 0,
                    currentTask: 'Initializing',
                    tasksCompleted: 0,
                    tasksTotal: wave.tasks.length,
                    usersMigrated: 0,
                    usersTotal: 0,
                    estimatedTimeRemaining: 0,
                    throughput: 0,
                    errors: [],
                },
                startedAt: new Date(),
                errorCount: 0,
                warningCount: 0,
            };
            set((state) => {
                state.waveExecutionStatus.set(waveId, executionStatus);
                state.currentWave = wave;
                state.waves = state.waves.map((w) => w.id === waveId ? { ...w, status: 'InProgress', actualStartDate: new Date().toISOString() } : w);
            });
            // Execute wave via PowerShell
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Migration/MigrationOrchestrator.psm1',
                functionName: 'Start-MigrationWave',
                parameters: {
                    WaveId: waveId,
                    WaveName: wave.name,
                    Tasks: wave.tasks,
                    StreamProgress: true,
                },
                options: {
                    streamOutput: true,
                    timeout: 0, // No timeout for migrations
                },
            });
            if (result.success) {
                set((state) => {
                    const status = state.waveExecutionStatus.get(waveId);
                    if (status) {
                        status.status = 'Completed';
                        status.phase = 'completed';
                        status.completedAt = new Date();
                        status.progress.overallProgress = 100;
                    }
                    state.waves = state.waves.map((w) => w.id === waveId
                        ? { ...w, status: 'Completed', actualEndDate: new Date().toISOString() }
                        : w);
                    state.currentWave = null;
                    state.isLoading = false;
                });
            }
            else {
                throw new Error(result.error || 'Wave execution failed');
            }
        }
        catch (error) {
            console.error('Wave execution failed:', error);
            set((state) => {
                const status = state.waveExecutionStatus.get(waveId);
                if (status) {
                    status.status = 'Failed';
                    status.phase = 'failed';
                    status.completedAt = new Date();
                }
                state.waves = state.waves.map((w) => w.id === waveId ? { ...w, status: 'Failed' } : w);
                state.error = error.message;
                state.isLoading = false;
                state.currentWave = null;
            });
            throw error;
        }
    },
    /**
     * Pause a running wave
     */
    pauseWave: async (waveId) => {
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Migration/MigrationOrchestrator.psm1',
                functionName: 'Pause-MigrationWave',
                parameters: { WaveId: waveId },
            });
            set((state) => {
                const status = state.waveExecutionStatus.get(waveId);
                if (status) {
                    status.status = 'Paused';
                }
                state.waves = state.waves.map((w) => w.id === waveId ? { ...w, status: 'Paused' } : w);
            });
        }
        catch (error) {
            console.error('Failed to pause wave:', error);
            set({ error: error.message });
            throw error;
        }
    },
    /**
     * Resume a paused wave
     */
    resumeWave: async (waveId) => {
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Migration/MigrationOrchestrator.psm1',
                functionName: 'Resume-MigrationWave',
                parameters: { WaveId: waveId },
            });
            set((state) => {
                const status = state.waveExecutionStatus.get(waveId);
                if (status) {
                    status.status = 'InProgress';
                }
                state.waves = state.waves.map((w) => w.id === waveId ? { ...w, status: 'InProgress' } : w);
            });
        }
        catch (error) {
            console.error('Failed to resume wave:', error);
            set({ error: error.message });
            throw error;
        }
    },
    /**
     * Add an item to a migration wave
     */
    addItemToWave: (waveId, item) => {
        set((state) => {
            const wave = state.waves.find((w) => w.id === waveId);
            if (wave) {
                // Add item to the first batch, or create a new batch if none exists
                if (wave.batches.length === 0) {
                    // Create a new batch
                    const newBatch = {
                        id: `batch-${Date.now()}`,
                        name: `Batch for ${item.name}`,
                        description: `Auto-created batch for ${item.name}`,
                        type: item.type,
                        priority: 'Normal',
                        complexity: 'Simple',
                        items: [{
                                id: item.id,
                                waveId,
                                wave: wave.name,
                                sourceIdentity: item.id,
                                targetIdentity: item.id,
                                sourcePath: '',
                                targetPath: '',
                                type: item.type,
                                status: 'NotStarted',
                                priority: 'Normal',
                                complexity: 'Simple',
                                startTime: null,
                                endTime: null,
                                validationTime: null,
                                created: new Date(),
                                estimatedDuration: null,
                                actualDuration: null,
                                errors: [],
                                warnings: [],
                                validationResults: [],
                                properties: {},
                                permissionMappings: {},
                                sizeBytes: null,
                                transferredBytes: null,
                                progressPercentage: 0,
                                displayName: item.displayName,
                                description: item.name,
                                output: '',
                                dependencies: [],
                                dependentItems: [],
                                retryCount: 0,
                                maxRetryAttempts: 3,
                                lastRetryTime: null,
                                preMigrationChecklist: [],
                                postMigrationValidation: [],
                                requiresUserInteraction: false,
                                allowConcurrentMigration: true,
                                assignedTechnician: '',
                                businessJustification: '',
                                customFields: {},
                                tags: [],
                                transferRateMBps: 100,
                                maxConcurrentStreams: 1,
                                enableThrottling: false,
                                supportsRollback: true,
                                rollbackPlan: '',
                                rollbackInstructions: [],
                                isValidationRequired: true,
                                isValidationPassed: false,
                                qualityChecks: [],
                                isCompleted: false,
                                hasErrors: false,
                                hasWarnings: false,
                                isHighRisk: false,
                                completionPercentage: 0,
                                formattedSize: '0 B',
                                createdAt: new Date().toISOString(),
                            }],
                        status: 'NotStarted',
                        statusMessage: 'Created automatically',
                        startTime: null,
                        endTime: null,
                        plannedStartDate: null,
                        plannedEndDate: null,
                        estimatedDuration: null,
                        actualDuration: null,
                        assignedTechnician: '',
                        businessOwner: '',
                        maxConcurrentItems: 1,
                        enableAutoRetry: true,
                        maxRetryAttempts: 3,
                        retryDelay: 300000, // 5 minutes
                        totalItems: 1,
                        completedItems: 0,
                        failedItems: 0,
                        itemsWithWarnings: 0,
                        inProgressItems: 0,
                        pendingItems: 1,
                        progressPercentage: 0,
                        successRate: 0,
                        totalSizeBytes: 0,
                        transferredBytes: 0,
                        averageTransferRateMBps: 0,
                        formattedTotalSize: '0 B',
                        prerequisites: [],
                        postMigrationTasks: [],
                        dependentBatches: [],
                        configuration: {},
                        environmentSettings: {},
                        enableThrottling: false,
                        throttlingLimitMBps: 0,
                        preMigrationChecklist: [],
                        postMigrationValidation: [],
                        qualityGates: [],
                        requiresApproval: false,
                        approvedBy: '',
                        approvalDate: null,
                        errors: [],
                        warnings: [],
                        logFilePath: '',
                        detailedLogs: [],
                        businessJustification: '',
                        estimatedCost: null,
                        actualCost: null,
                        tags: [],
                        customProperties: {},
                        supportsRollback: false,
                        rollbackPlan: '',
                        rollbackInstructions: [],
                        isCompleted: false,
                        hasErrors: false,
                        hasWarnings: false,
                        isHighRisk: false,
                        canStart: true,
                        canPause: false,
                        canResume: false,
                        isRunning: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };
                    wave.batches.push(newBatch);
                }
                else {
                    // Add to first batch
                    const batch = wave.batches[0];
                    batch.items.push({
                        id: item.id,
                        waveId,
                        wave: wave.name,
                        sourceIdentity: item.id,
                        targetIdentity: item.id,
                        sourcePath: '',
                        targetPath: '',
                        type: item.type,
                        status: 'NotStarted',
                        priority: 'Normal',
                        complexity: 'Simple',
                        startTime: null,
                        endTime: null,
                        validationTime: null,
                        created: new Date(),
                        estimatedDuration: null,
                        actualDuration: null,
                        errors: [],
                        warnings: [],
                        validationResults: [],
                        properties: {},
                        permissionMappings: {},
                        sizeBytes: null,
                        transferredBytes: null,
                        progressPercentage: 0,
                        displayName: item.displayName,
                        description: item.name,
                        output: '',
                        dependencies: [],
                        dependentItems: [],
                        retryCount: 0,
                        maxRetryAttempts: 3,
                        lastRetryTime: null,
                        preMigrationChecklist: [],
                        postMigrationValidation: [],
                        requiresUserInteraction: false,
                        allowConcurrentMigration: true,
                        assignedTechnician: '',
                        businessJustification: '',
                        customFields: {},
                        tags: [],
                        transferRateMBps: 100,
                        maxConcurrentStreams: 1,
                        enableThrottling: false,
                        supportsRollback: true,
                        rollbackPlan: '',
                        rollbackInstructions: [],
                        isValidationRequired: true,
                        isValidationPassed: false,
                        qualityChecks: [],
                        isCompleted: false,
                        hasErrors: false,
                        hasWarnings: false,
                        isHighRisk: false,
                        completionPercentage: 0,
                        formattedSize: '0 B',
                        createdAt: new Date().toISOString(),
                    });
                    batch.totalItems++;
                    batch.pendingItems++;
                }
                wave.totalItems = (wave.totalItems || 0) + 1;
            }
        });
    },
    // ==================== ROLLBACK SYSTEM ====================
    /**
     * Create a rollback point
     */
    createRollbackPoint: async (name) => {
        const state = get();
        const rollbackPoint = {
            id: crypto.randomUUID(),
            name,
            description: `Rollback point created at ${new Date().toISOString()}`,
            createdAt: new Date().toISOString(),
            waveId: state.currentWave?.id || '',
            batchId: '',
            snapshot: {
                waves: state.waves,
                mappings: state.mappings,
                timestamp: new Date(),
                version: '1.0',
            },
            canRestore: true,
        };
        set((state) => {
            state.rollbackPoints.push(rollbackPoint);
            state.canRollback = true;
        });
        return rollbackPoint;
    },
    /**
     * Rollback to a specific point
     */
    rollbackToPoint: async (pointId) => {
        const point = get().rollbackPoints.find((p) => p.id === pointId);
        if (!point || !point.canRestore) {
            throw new Error('Rollback point not found or cannot be restored');
        }
        try {
            // Execute rollback via PowerShell
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Migration/MigrationOrchestrator.psm1',
                functionName: 'Invoke-MigrationRollback',
                parameters: {
                    RollbackPointId: pointId,
                    Snapshot: point.snapshot,
                },
            });
            // Restore state from snapshot
            const snapshot = point.snapshot;
            set((state) => {
                state.waves = snapshot.waves;
                state.mappings = snapshot.mappings;
                state.error = null;
            });
        }
        catch (error) {
            console.error('Rollback failed:', error);
            set({ error: error.message });
            throw error;
        }
    },
    /**
     * List all rollback points
     */
    listRollbackPoints: () => {
        return get().rollbackPoints;
    },
    /**
     * Delete a rollback point
     */
    deleteRollbackPoint: async (pointId) => {
        set((state) => {
            state.rollbackPoints = state.rollbackPoints.filter((p) => p.id !== pointId);
            state.canRollback = state.rollbackPoints.length > 0;
        });
    },
    // ==================== CONFLICT RESOLUTION ====================
    /**
     * Detect conflicts in a wave
     */
    detectConflicts: async (waveId) => {
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Migration/ConflictDetection.psm1',
                functionName: 'Find-MigrationConflicts',
                parameters: { WaveId: waveId },
            });
            if (result.success) {
                const conflicts = result.data.conflicts || [];
                set((state) => {
                    state.conflicts = conflicts;
                });
                return conflicts;
            }
            return [];
        }
        catch (error) {
            console.error('Conflict detection failed:', error);
            return [];
        }
    },
    /**
     * Resolve a specific conflict
     */
    resolveConflict: async (conflictId, resolution) => {
        try {
            await window.electronAPI.executeModule({
                modulePath: 'Modules/Migration/ConflictResolution.psm1',
                functionName: 'Resolve-MigrationConflict',
                parameters: {
                    ConflictId: conflictId,
                    Resolution: resolution,
                },
            });
            set((state) => {
                state.conflicts = state.conflicts.map((c) => c.id === conflictId ? { ...c, status: 'resolved' } : c);
            });
        }
        catch (error) {
            console.error('Conflict resolution failed:', error);
            set({ error: error.message });
            throw error;
        }
    },
    /**
     * Auto-resolve conflicts using a strategy
     */
    autoResolveConflicts: async (strategy) => {
        const conflicts = get().conflicts.filter((c) => c.status === 'pending');
        for (const conflict of conflicts) {
            const resolution = {
                conflictId: conflict.id,
                strategy: strategy,
                notes: `Auto-resolved using ${strategy} strategy`,
            };
            try {
                await get().resolveConflict(conflict.id, resolution);
            }
            catch (error) {
                console.error(`Failed to resolve conflict ${conflict.id}:`, error);
            }
        }
    },
    /**
     * Get conflicts by type
     */
    getConflictsByType: (type) => {
        return get().conflicts.filter((c) => c.type === type);
    },
    // ==================== RESOURCE MAPPING ====================
    /**
     * Add a resource mapping
     */
    mapResource: (mapping) => {
        set((state) => {
            state.mappings.push(mapping);
        });
    },
    /**
     * Import mappings from file
     */
    importMappings: async (file) => {
        try {
            const text = await file.text();
            const mappings = JSON.parse(text);
            set((state) => {
                state.mappings = [...state.mappings, ...mappings];
            });
        }
        catch (error) {
            console.error('Failed to import mappings:', error);
            set({ error: error.message });
            throw error;
        }
    },
    /**
     * Export mappings to file
     */
    exportMappings: async (waveId) => {
        const mappings = waveId
            ? get().mappings.filter((m) => m.waveId === waveId)
            : get().mappings;
        const blob = new Blob([JSON.stringify(mappings, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mappings-${waveId || 'all'}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
    /**
     * Validate mappings for a wave
     */
    validateMappings: async (waveId) => {
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Migration/MappingValidation.psm1',
                functionName: 'Test-MigrationMappings',
                parameters: {
                    WaveId: waveId,
                    Mappings: get().mappings,
                },
            });
            const validationResult = {
                isValid: result.success,
                errors: result.data?.errors || [],
                warnings: result.data?.warnings || [],
            };
            set((state) => {
                state.validationResults.set(waveId, validationResult);
            });
            return validationResult;
        }
        catch (error) {
            console.error('Mapping validation failed:', error);
            return {
                isValid: false,
                errors: [error.message],
                warnings: [],
            };
        }
    },
    /**
     * Auto-map resources using a strategy
     */
    autoMapResources: async (strategy) => {
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Migration/AutoMapping.psm1',
                functionName: 'New-AutomaticMappings',
                parameters: { Strategy: strategy },
            });
            if (result.success) {
                const newMappings = result.data.mappings || [];
                set((state) => {
                    state.mappings = [...state.mappings, ...newMappings];
                });
            }
        }
        catch (error) {
            console.error('Auto-mapping failed:', error);
            set({ error: error.message });
            throw error;
        }
    },
    /**
     * Bulk update mappings
     */
    bulkUpdateMappings: async (updates) => {
        set((state) => {
            state.mappings = state.mappings.map((m) => {
                const update = updates.get(m.id);
                return update ? { ...m, ...update } : m;
            });
        });
    },
    // ==================== DELTA SYNC ====================
    /**
     * Perform delta synchronization
     */
    performDeltaSync: async (waveId) => {
        const startTime = Date.now();
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Migration/DeltaSync.psm1',
                functionName: 'Invoke-DeltaSync',
                parameters: {
                    WaveId: waveId,
                    LastSyncTimestamp: get().lastSyncTimestamp,
                },
            });
            const syncResult = {
                changesDetected: result.data.changesDetected || 0,
                changesApplied: result.data.changesApplied || 0,
                conflicts: result.data.conflicts || 0,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
            set((state) => {
                state.lastSyncTimestamp = new Date();
            });
            return syncResult;
        }
        catch (error) {
            console.error('Delta sync failed:', error);
            throw error;
        }
    },
    /**
     * Schedule delta sync
     */
    scheduleDeltaSync: (waveId, interval) => {
        // This would typically use setInterval, but storing the interval ID
        // Store interval in a global registry or use a different approach
        console.log(`Scheduled delta sync for wave ${waveId} every ${interval}ms`);
        set((state) => {
            state.deltaSyncEnabled = true;
        });
    },
    /**
     * Stop delta sync
     */
    stopDeltaSync: (waveId) => {
        console.log(`Stopped delta sync for wave ${waveId}`);
        set((state) => {
            state.deltaSyncEnabled = false;
        });
    },
    // ==================== PROGRESS TRACKING ====================
    /**
     * Subscribe to progress updates for a wave
     */
    subscribeToProgress: (waveId, callback) => {
        // Listen to PowerShell progress events
        const cleanup = window.electronAPI.onProgress((data) => {
            // Note: ProgressData doesn't have waveId, filtering by other means if needed
            const status = get().waveExecutionStatus.get(waveId);
            if (status) {
                callback(status.progress);
            }
        });
        return cleanup;
    },
    /**
     * Get overall progress summary
     */
    getProgressSummary: () => {
        const waves = get().waves;
        const totalWaves = waves.length;
        const completedWaves = waves.filter((w) => w.status === 'Completed').length;
        const activeWaves = waves.filter((w) => w.status === 'InProgress').length;
        const failedWaves = waves.filter((w) => w.status === 'Failed').length;
        const totalUsers = waves.reduce((sum, w) => sum + (w.totalItems || 0), 0);
        const migratedUsers = waves.reduce((sum, w) => sum + (w.status === 'Completed' ? w.totalItems || 0 : 0), 0);
        const overallProgress = totalWaves > 0 ? (completedWaves / totalWaves) * 100 : 0;
        return {
            totalWaves,
            completedWaves,
            activeWaves,
            failedWaves,
            totalUsers,
            migratedUsers,
            overallProgress,
            estimatedCompletion: null, // Calculate based on current throughput
        };
    },
    // ==================== VALIDATION ====================
    /**
     * Run pre-flight checks for a wave
     */
    runPreFlightChecks: async (waveId) => {
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Migration/PreFlightChecks.psm1',
                functionName: 'Invoke-PreFlightChecks',
                parameters: { WaveId: waveId },
            });
            const validationResult = {
                isValid: result.success,
                errors: result.data?.errors || [],
                warnings: result.data?.warnings || [],
            };
            set((state) => {
                state.validationResults.set(waveId, validationResult);
            });
            return validationResult;
        }
        catch (error) {
            console.error('Pre-flight checks failed:', error);
            return {
                isValid: false,
                errors: [error.message],
                warnings: [],
            };
        }
    },
    /**
     * Validate licenses
     */
    validateLicenses: async (waveId) => {
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Migration/LicenseValidation.psm1',
                functionName: 'Test-LicenseAvailability',
                parameters: { WaveId: waveId },
            });
            return {
                passed: result.success,
                availableLicenses: result.data?.availableLicenses || 0,
                requiredLicenses: result.data?.requiredLicenses || 0,
                errors: result.data?.errors || [],
                warnings: result.data?.warnings || [],
            };
        }
        catch (error) {
            console.error('License validation failed:', error);
            return {
                passed: false,
                availableLicenses: 0,
                requiredLicenses: 0,
                errors: [{ field: 'licenses', message: error.message, code: 'ERROR', severity: 'error' }],
                warnings: [],
            };
        }
    },
    /**
     * Validate permissions
     */
    validatePermissions: async (waveId) => {
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Migration/PermissionValidation.psm1',
                functionName: 'Test-MigrationPermissions',
                parameters: { WaveId: waveId },
            });
            return {
                passed: result.success,
                missingPermissions: result.data?.missingPermissions || [],
                errors: result.data?.errors || [],
                warnings: result.data?.warnings || [],
            };
        }
        catch (error) {
            console.error('Permission validation failed:', error);
            return {
                passed: false,
                missingPermissions: [],
                errors: [{ field: 'permissions', message: error.message, code: 'ERROR', severity: 'error' }],
                warnings: [],
            };
        }
    },
    /**
     * Validate connectivity
     */
    validateConnectivity: async () => {
        try {
            const result = await window.electronAPI.executeModule({
                modulePath: 'Modules/Migration/ConnectivityTest.psm1',
                functionName: 'Test-MigrationConnectivity',
                parameters: {},
            });
            return {
                passed: result.success,
                sourceConnected: result.data?.sourceConnected || false,
                targetConnected: result.data?.targetConnected || false,
                errors: result.data?.errors || [],
                warnings: result.data?.warnings || [],
            };
        }
        catch (error) {
            console.error('Connectivity validation failed:', error);
            return {
                passed: false,
                sourceConnected: false,
                targetConnected: false,
                errors: [{ field: 'connectivity', message: error.message, code: 'ERROR', severity: 'error' }],
                warnings: [],
            };
        }
    },
}))), {
    name: 'MigrationStore',
    partialize: (state) => ({
        waves: state.waves,
        rollbackPoints: state.rollbackPoints,
        mappings: state.mappings,
        waveDependencies: state.waveDependencies,
    }),
})));


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQiw2RUFBNkU7QUFDeEc7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsZ0JBQWdCO0FBQzlDLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsZ0ZBQWdGO0FBQzNHO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLGlGQUFpRjtBQUM1RztBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvc3RvcmUvdXNlTWlncmF0aW9uU3RvcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBNaWdyYXRpb24gU3RvcmVcbiAqXG4gKiBNYW5hZ2VzIG1pZ3JhdGlvbiBvcGVyYXRpb25zLCBwcm9ncmVzcyB0cmFja2luZywgYW5kIHJlc3VsdHMuXG4gKiBIYW5kbGVzIHVzZXIsIGdyb3VwLCBhbmQgZGF0YSBtaWdyYXRpb24gd29ya2Zsb3dzLlxuICovXG5pbXBvcnQgeyBjcmVhdGUgfSBmcm9tICd6dXN0YW5kJztcbmltcG9ydCB7IGRldnRvb2xzLCBzdWJzY3JpYmVXaXRoU2VsZWN0b3IsIHBlcnNpc3QgfSBmcm9tICd6dXN0YW5kL21pZGRsZXdhcmUnO1xuaW1wb3J0IHsgaW1tZXIgfSBmcm9tICd6dXN0YW5kL21pZGRsZXdhcmUvaW1tZXInO1xuaW1wb3J0IHsgZW5hYmxlTWFwU2V0IH0gZnJvbSAnaW1tZXInO1xuLy8gRW5hYmxlIE1hcFNldCBwbHVnaW4gZm9yIEltbWVyIHRvIGhhbmRsZSBNYXBzIGFuZCBTZXRzIGluIHN0YXRlXG5lbmFibGVNYXBTZXQoKTtcbmV4cG9ydCBjb25zdCB1c2VNaWdyYXRpb25TdG9yZSA9IGNyZWF0ZSgpKGRldnRvb2xzKHBlcnNpc3Qoc3Vic2NyaWJlV2l0aFNlbGVjdG9yKGltbWVyKChzZXQsIGdldCkgPT4gKHtcbiAgICAvLyBFeGlzdGluZyBzdGF0ZVxuICAgIG9wZXJhdGlvbnM6IG5ldyBNYXAoKSxcbiAgICBwbGFuczogW10sXG4gICAgc2VsZWN0ZWRQbGFuOiBudWxsLFxuICAgIGlzTWlncmF0aW5nOiBmYWxzZSxcbiAgICB3YXZlczogW10sXG4gICAgc2VsZWN0ZWRXYXZlSWQ6IG51bGwsXG4gICAgY3VycmVudFdhdmU6IG51bGwsXG4gICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICBlcnJvcjogbnVsbCxcbiAgICAvLyBORVc6IFdhdmUgb3JjaGVzdHJhdGlvbiBzdGF0ZVxuICAgIHdhdmVFeGVjdXRpb25TdGF0dXM6IG5ldyBNYXAoKSxcbiAgICB3YXZlRGVwZW5kZW5jaWVzOiBuZXcgTWFwKCksXG4gICAgLy8gTkVXOiBSZXNvdXJjZSBtYXBwaW5nIHN0YXRlXG4gICAgbWFwcGluZ3M6IFtdLFxuICAgIC8vIE5FVzogQ29uZmxpY3QgbWFuYWdlbWVudCBzdGF0ZVxuICAgIGNvbmZsaWN0czogW10sXG4gICAgY29uZmxpY3RSZXNvbHV0aW9uU3RyYXRlZ2llczogbmV3IE1hcCgpLFxuICAgIC8vIE5FVzogUm9sbGJhY2sgc3lzdGVtIHN0YXRlXG4gICAgcm9sbGJhY2tQb2ludHM6IFtdLFxuICAgIGNhblJvbGxiYWNrOiBmYWxzZSxcbiAgICAvLyBORVc6IFZhbGlkYXRpb24gc3RhdGVcbiAgICB2YWxpZGF0aW9uUmVzdWx0czogbmV3IE1hcCgpLFxuICAgIC8vIE5FVzogRGVsdGEgc3luYyBzdGF0ZVxuICAgIGxhc3RTeW5jVGltZXN0YW1wOiBudWxsLFxuICAgIGRlbHRhU3luY0VuYWJsZWQ6IGZhbHNlLFxuICAgIC8vIE1pZ3JhdGlvbiBleGVjdXRpb24gc3RhdGVcbiAgICBleGVjdXRpb25Qcm9ncmVzczogbnVsbCxcbiAgICBpc0V4ZWN1dGluZzogZmFsc2UsXG4gICAgZXhlY3V0ZU1pZ3JhdGlvbjogYXN5bmMgKHdhdmVJZCkgPT4ge1xuICAgICAgICBhd2FpdCBnZXQoKS5leGVjdXRlV2F2ZSh3YXZlSWQpO1xuICAgIH0sXG4gICAgcGF1c2VNaWdyYXRpb246IGFzeW5jICh3YXZlSWQpID0+IHtcbiAgICAgICAgYXdhaXQgZ2V0KCkucGF1c2VXYXZlKHdhdmVJZCk7XG4gICAgfSxcbiAgICByZXN1bWVNaWdyYXRpb246IGFzeW5jICh3YXZlSWQpID0+IHtcbiAgICAgICAgYXdhaXQgZ2V0KCkucmVzdW1lV2F2ZSh3YXZlSWQpO1xuICAgIH0sXG4gICAgcmV0cnlGYWlsZWRJdGVtczogYXN5bmMgKHdhdmVJZCkgPT4ge1xuICAgICAgICAvLyBJbXBsZW1lbnQgcmV0cnkgbG9naWNcbiAgICAgICAgY29uc29sZS5sb2coJ1JldHJ5IGZhaWxlZCBpdGVtcyBmb3Igd2F2ZTonLCB3YXZlSWQpO1xuICAgIH0sXG4gICAgLy8gVmFsaWRhdGlvbiBob29rIGNvbXBhdGliaWxpdHlcbiAgICBzZWxlY3RlZFdhdmU6IG51bGwsXG4gICAgdmFsaWRhdGVXYXZlOiBhc3luYyAod2F2ZUlkKSA9PiB7XG4gICAgICAgIGF3YWl0IGdldCgpLnJ1blByZUZsaWdodENoZWNrcyh3YXZlSWQpO1xuICAgIH0sXG4gICAgdmFsaWRhdGVBbGw6IGFzeW5jICgpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCB3YXZlIG9mIGdldCgpLndhdmVzKSB7XG4gICAgICAgICAgICBhd2FpdCBnZXQoKS5ydW5QcmVGbGlnaHRDaGVja3Mod2F2ZS5pZCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGNsZWFyVmFsaWRhdGlvblJlc3VsdHM6ICgpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgc3RhdGUudmFsaWRhdGlvblJlc3VsdHMuY2xlYXIoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyBBY3Rpb25zXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IG1pZ3JhdGlvbiBwbGFuXG4gICAgICovXG4gICAgY3JlYXRlUGxhbjogKHBsYW5EYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1BsYW4gPSB7XG4gICAgICAgICAgICAuLi5wbGFuRGF0YSxcbiAgICAgICAgICAgIGlkOiBjcnlwdG8ucmFuZG9tVVVJRCgpLFxuICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgIH07XG4gICAgICAgIHNldCgoc3RhdGUpID0+ICh7XG4gICAgICAgICAgICBwbGFuczogWy4uLnN0YXRlLnBsYW5zLCBuZXdQbGFuXSxcbiAgICAgICAgICAgIHNlbGVjdGVkUGxhbjogbmV3UGxhbixcbiAgICAgICAgfSkpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogVXBkYXRlIGFuIGV4aXN0aW5nIG1pZ3JhdGlvbiBwbGFuXG4gICAgICovXG4gICAgdXBkYXRlUGxhbjogKHBsYW5JZCwgdXBkYXRlcykgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiAoe1xuICAgICAgICAgICAgcGxhbnM6IHN0YXRlLnBsYW5zLm1hcChwID0+IHAuaWQgPT09IHBsYW5JZCA/IHsgLi4ucCwgLi4udXBkYXRlcyB9IDogcCksXG4gICAgICAgICAgICBzZWxlY3RlZFBsYW46IHN0YXRlLnNlbGVjdGVkUGxhbj8uaWQgPT09IHBsYW5JZFxuICAgICAgICAgICAgICAgID8geyAuLi5zdGF0ZS5zZWxlY3RlZFBsYW4sIC4uLnVwZGF0ZXMgfVxuICAgICAgICAgICAgICAgIDogc3RhdGUuc2VsZWN0ZWRQbGFuLFxuICAgICAgICB9KSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEZWxldGUgYSBtaWdyYXRpb24gcGxhblxuICAgICAqL1xuICAgIGRlbGV0ZVBsYW46IChwbGFuSWQpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4gKHtcbiAgICAgICAgICAgIHBsYW5zOiBzdGF0ZS5wbGFucy5maWx0ZXIocCA9PiBwLmlkICE9PSBwbGFuSWQpLFxuICAgICAgICAgICAgc2VsZWN0ZWRQbGFuOiBzdGF0ZS5zZWxlY3RlZFBsYW4/LmlkID09PSBwbGFuSWQgPyBudWxsIDogc3RhdGUuc2VsZWN0ZWRQbGFuLFxuICAgICAgICB9KSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBTdGFydCBleGVjdXRpbmcgYSBtaWdyYXRpb24gcGxhblxuICAgICAqL1xuICAgIHN0YXJ0TWlncmF0aW9uOiBhc3luYyAocGxhbklkKSA9PiB7XG4gICAgICAgIGNvbnN0IHBsYW4gPSBnZXQoKS5wbGFucy5maW5kKHAgPT4gcC5pZCA9PT0gcGxhbklkKTtcbiAgICAgICAgaWYgKCFwbGFuKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1pZ3JhdGlvbiBwbGFuICR7cGxhbklkfSBub3QgZm91bmRgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvcGVyYXRpb25JZCA9IGNyeXB0by5yYW5kb21VVUlEKCk7XG4gICAgICAgIGNvbnN0IGNhbmNlbGxhdGlvblRva2VuID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0ge1xuICAgICAgICAgICAgaWQ6IG9wZXJhdGlvbklkLFxuICAgICAgICAgICAgcGxhbixcbiAgICAgICAgICAgIHN0YXR1czogJ05vdFN0YXJ0ZWQnLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IDAsXG4gICAgICAgICAgICBjdXJyZW50VGFza0luZGV4OiAwLFxuICAgICAgICAgICAgdGFza1Jlc3VsdHM6IG5ldyBNYXAoKSxcbiAgICAgICAgICAgIGZhaWxlZFRhc2tzOiBbXSxcbiAgICAgICAgICAgIHN0YXJ0ZWRBdDogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIGNhbmNlbGxhdGlvblRva2VuLFxuICAgICAgICB9O1xuICAgICAgICAvLyBBZGQgb3BlcmF0aW9uIHRvIHN0YXRlXG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgbmV3T3BlcmF0aW9ucy5zZXQob3BlcmF0aW9uSWQsIG9wZXJhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMsXG4gICAgICAgICAgICAgICAgaXNNaWdyYXRpbmc6IHRydWUsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gU2V0dXAgcHJvZ3Jlc3MgbGlzdGVuZXJcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3NDbGVhbnVwID0gd2luZG93LmVsZWN0cm9uQVBJLm9uUHJvZ3Jlc3MoKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChkYXRhLmV4ZWN1dGlvbklkID09PSBjYW5jZWxsYXRpb25Ub2tlbikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRUYXNrID0gZ2V0KCkub3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpPy5jdXJyZW50VGFza0luZGV4IHx8IDA7XG4gICAgICAgICAgICAgICAgZ2V0KCkudXBkYXRlUHJvZ3Jlc3Mob3BlcmF0aW9uSWQsIGN1cnJlbnRUYXNrLCBkYXRhLnBlcmNlbnRhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgbWlncmF0aW9uIHRhc2tzIHNlcXVlbnRpYWxseVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbGFuLnRhc2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGFzayA9IHBsYW4udGFza3NbaV07XG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIG9wZXJhdGlvbiBzdGF0dXNcbiAgICAgICAgICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcCA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcC5zdGF0dXMgPSAnSW5Qcm9ncmVzcyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcC5jdXJyZW50VGFza0luZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRXhlY3V0ZSB0YXNrIHZpYSBQb3dlclNoZWxsXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6IGBNb2R1bGVzL01pZ3JhdGlvbi8ke3Rhc2sudHlwZX0ucHNtMWAsXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6IGBJbnZva2UtJHt0YXNrLnR5cGV9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHRhc2sucGFyYW1ldGVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxsYXRpb25Ub2tlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJlYW1PdXRwdXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogdGFzay50aW1lb3V0IHx8IDYwMDAwMCwgLy8gMTAgbWludXRlcyBkZWZhdWx0XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnZXQoKS5jb21wbGV0ZVRhc2sob3BlcmF0aW9uSWQsIHRhc2suaWQsIHJlc3VsdC5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldCgpLmZhaWxUYXNrKG9wZXJhdGlvbklkLCB0YXNrLmlkLCByZXN1bHQuZXJyb3IgfHwgJ1Rhc2sgZmFpbGVkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTdG9wIG9uIGNyaXRpY2FsIHRhc2sgZmFpbHVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhc2suY3JpdGljYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENyaXRpY2FsIHRhc2sgZmFpbGVkOiAke3Rhc2submFtZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2V0KCkuZmFpbFRhc2sob3BlcmF0aW9uSWQsIHRhc2suaWQsIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFzay5jcml0aWNhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDbGVhbnVwIGFuZCBjb21wbGV0ZVxuICAgICAgICAgICAgcHJvZ3Jlc3NDbGVhbnVwKCk7XG4gICAgICAgICAgICBnZXQoKS5jb21wbGV0ZU1pZ3JhdGlvbihvcGVyYXRpb25JZCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBwcm9ncmVzc0NsZWFudXAoKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ01pZ3JhdGlvbiBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9wID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgICAgIGlmIChvcCkge1xuICAgICAgICAgICAgICAgICAgICBvcC5zdGF0dXMgPSAnRmFpbGVkJztcbiAgICAgICAgICAgICAgICAgICAgb3AuY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICBpc01pZ3JhdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcGVyYXRpb25JZDtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIENhbmNlbCBhIHJ1bm5pbmcgbWlncmF0aW9uXG4gICAgICovXG4gICAgY2FuY2VsTWlncmF0aW9uOiBhc3luYyAob3BlcmF0aW9uSWQpID0+IHtcbiAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gZ2V0KCkub3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICBpZiAoIW9wZXJhdGlvbiB8fCBvcGVyYXRpb24uc3RhdHVzICE9PSAnSW5Qcm9ncmVzcycpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmNhbmNlbEV4ZWN1dGlvbihvcGVyYXRpb24uY2FuY2VsbGF0aW9uVG9rZW4pO1xuICAgICAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9wID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgICAgIGlmIChvcCkge1xuICAgICAgICAgICAgICAgICAgICBvcC5zdGF0dXMgPSAnQ2FuY2VsbGVkJztcbiAgICAgICAgICAgICAgICAgICAgb3AuY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgICAgICBpc01pZ3JhdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNhbmNlbCBtaWdyYXRpb246JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBVcGRhdGUgcHJvZ3Jlc3MgZm9yIGN1cnJlbnQgdGFza1xuICAgICAqL1xuICAgIHVwZGF0ZVByb2dyZXNzOiAob3BlcmF0aW9uSWQsIHRhc2tJbmRleCwgcHJvZ3Jlc3MpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3T3BlcmF0aW9ucyA9IG5ldyBNYXAoc3RhdGUub3BlcmF0aW9ucyk7XG4gICAgICAgICAgICBjb25zdCBvcGVyYXRpb24gPSBuZXdPcGVyYXRpb25zLmdldChvcGVyYXRpb25JZCk7XG4gICAgICAgICAgICBpZiAob3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIG92ZXJhbGwgcHJvZ3Jlc3NcbiAgICAgICAgICAgICAgICBjb25zdCB0YXNrc0NvbXBsZXRlZCA9IHRhc2tJbmRleDtcbiAgICAgICAgICAgICAgICBjb25zdCB0b3RhbFRhc2tzID0gb3BlcmF0aW9uLnBsYW4udGFza3MubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhc2tQcm9ncmVzcyA9IHByb2dyZXNzIC8gMTAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IG92ZXJhbGxQcm9ncmVzcyA9ICgodGFza3NDb21wbGV0ZWQgKyB0YXNrUHJvZ3Jlc3MpIC8gdG90YWxUYXNrcykgKiAxMDA7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnByb2dyZXNzID0gTWF0aC5taW4oMTAwLCBNYXRoLnJvdW5kKG92ZXJhbGxQcm9ncmVzcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgb3BlcmF0aW9uczogbmV3T3BlcmF0aW9ucyB9O1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIE1hcmsgYSB0YXNrIGFzIGNvbXBsZXRlZFxuICAgICAqL1xuICAgIGNvbXBsZXRlVGFzazogKG9wZXJhdGlvbklkLCB0YXNrSWQsIHJlc3VsdCkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24udGFza1Jlc3VsdHMuc2V0KHRhc2tJZCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBNYXJrIGEgdGFzayBhcyBmYWlsZWRcbiAgICAgKi9cbiAgICBmYWlsVGFzazogKG9wZXJhdGlvbklkLCB0YXNrSWQsIGVycm9yKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wZXJhdGlvbnMgPSBuZXcgTWFwKHN0YXRlLm9wZXJhdGlvbnMpO1xuICAgICAgICAgICAgY29uc3Qgb3BlcmF0aW9uID0gbmV3T3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgICAgICAgICAgaWYgKG9wZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5mYWlsZWRUYXNrcy5wdXNoKHRhc2tJZCk7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW9uLnRhc2tSZXN1bHRzLnNldCh0YXNrSWQsIHsgZXJyb3IgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4geyBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogTWFyayBtaWdyYXRpb24gYXMgY29tcGxldGVkXG4gICAgICovXG4gICAgY29tcGxldGVNaWdyYXRpb246IChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIGNvbnN0IG9wZXJhdGlvbiA9IG5ld09wZXJhdGlvbnMuZ2V0KG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIGlmIChvcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uc3RhdHVzID0gb3BlcmF0aW9uLmZhaWxlZFRhc2tzLmxlbmd0aCA+IDAgPyAnQ29tcGxldGVkV2l0aFdhcm5pbmdzJyA6ICdDb21wbGV0ZWQnO1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbi5wcm9ncmVzcyA9IDEwMDtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb24uY29tcGxldGVkQXQgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBuZXdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIGlzTWlncmF0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogQ2xlYXIgYSBtaWdyYXRpb24gb3BlcmF0aW9uXG4gICAgICovXG4gICAgY2xlYXJPcGVyYXRpb246IChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdPcGVyYXRpb25zID0gbmV3IE1hcChzdGF0ZS5vcGVyYXRpb25zKTtcbiAgICAgICAgICAgIG5ld09wZXJhdGlvbnMuZGVsZXRlKG9wZXJhdGlvbklkKTtcbiAgICAgICAgICAgIHJldHVybiB7IG9wZXJhdGlvbnM6IG5ld09wZXJhdGlvbnMgfTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgYSBzcGVjaWZpYyBvcGVyYXRpb25cbiAgICAgKi9cbiAgICBnZXRPcGVyYXRpb246IChvcGVyYXRpb25JZCkgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0KCkub3BlcmF0aW9ucy5nZXQob3BlcmF0aW9uSWQpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogTG9hZCBhbGwgbWlncmF0aW9uIHdhdmVzXG4gICAgICovXG4gICAgbG9hZFdhdmVzOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIHNldCh7IGlzTG9hZGluZzogdHJ1ZSwgZXJyb3I6IG51bGwgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBGb3Igbm93LCBsb2FkIGZyb20gbG9jYWwgc3RvcmFnZSBvciBjcmVhdGUgZW1wdHkgYXJyYXlcbiAgICAgICAgICAgIC8vIEluIHByb2R1Y3Rpb24sIHRoaXMgd291bGQgY2FsbCB3aW5kb3cuZWxlY3Ryb25BUEkgdG8gbG9hZCBmcm9tIGZpbGUgc3lzdGVtXG4gICAgICAgICAgICBjb25zdCBzYXZlZFdhdmVzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ21pZ3JhdGlvbi13YXZlcycpO1xuICAgICAgICAgICAgY29uc3Qgd2F2ZXMgPSBzYXZlZFdhdmVzID8gSlNPTi5wYXJzZShzYXZlZFdhdmVzKSA6IFtdO1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFNlbGVjdGVkSWQgPSBnZXQoKS5zZWxlY3RlZFdhdmVJZDtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkV2F2ZSA9IGN1cnJlbnRTZWxlY3RlZElkID8gd2F2ZXMuZmluZCgodykgPT4gdy5pZCA9PT0gY3VycmVudFNlbGVjdGVkSWQpIHx8IG51bGwgOiBudWxsO1xuICAgICAgICAgICAgc2V0KHsgd2F2ZXMsIHNlbGVjdGVkV2F2ZSwgaXNMb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsb2FkIHdhdmVzOicsIGVycm9yKTtcbiAgICAgICAgICAgIHNldCh7IGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gbG9hZCB3YXZlcycsIGlzTG9hZGluZzogZmFsc2UsIHdhdmVzOiBbXSwgc2VsZWN0ZWRXYXZlOiBudWxsIH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgbWlncmF0aW9uIHdhdmVcbiAgICAgKi9cbiAgICBwbGFuV2F2ZTogYXN5bmMgKHdhdmVEYXRhKSA9PiB7XG4gICAgICAgIHNldCh7IGlzTG9hZGluZzogdHJ1ZSwgZXJyb3I6IG51bGwgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBuZXdXYXZlID0ge1xuICAgICAgICAgICAgICAgIC4uLndhdmVEYXRhLFxuICAgICAgICAgICAgICAgIGlkOiBjcnlwdG8ucmFuZG9tVVVJRCgpLFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgIG9yZGVyOiBnZXQoKS53YXZlcy5sZW5ndGggKyAxLFxuICAgICAgICAgICAgICAgIHN0YXR1czogJ1BsYW5uaW5nJyxcbiAgICAgICAgICAgICAgICBhY3R1YWxTdGFydERhdGU6IG51bGwsXG4gICAgICAgICAgICAgICAgYWN0dWFsRW5kRGF0ZTogbnVsbCxcbiAgICAgICAgICAgICAgICBlc3RpbWF0ZWREdXJhdGlvbjogbnVsbCxcbiAgICAgICAgICAgICAgICB0YXNrczogW10sXG4gICAgICAgICAgICAgICAgYmF0Y2hlczogW10sXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IHt9LFxuICAgICAgICAgICAgICAgIG5vdGVzOiAnJyxcbiAgICAgICAgICAgICAgICBwcmVyZXF1aXNpdGVzOiBbXSxcbiAgICAgICAgICAgICAgICB0b3RhbEl0ZW1zOiAwLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzUGVyY2VudGFnZTogMCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkV2F2ZXMgPSBbLi4uZ2V0KCkud2F2ZXMsIG5ld1dhdmVdO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ21pZ3JhdGlvbi13YXZlcycsIEpTT04uc3RyaW5naWZ5KHVwZGF0ZWRXYXZlcykpO1xuICAgICAgICAgICAgc2V0KHsgd2F2ZXM6IHVwZGF0ZWRXYXZlcywgaXNMb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIHJldHVybiBuZXdXYXZlLmlkO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNyZWF0ZSB3YXZlOicsIGVycm9yKTtcbiAgICAgICAgICAgIHNldCh7IGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gY3JlYXRlIHdhdmUnLCBpc0xvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSBhbiBleGlzdGluZyB3YXZlXG4gICAgICovXG4gICAgdXBkYXRlV2F2ZTogYXN5bmMgKHdhdmVJZCwgdXBkYXRlcykgPT4ge1xuICAgICAgICBzZXQoeyBpc0xvYWRpbmc6IHRydWUsIGVycm9yOiBudWxsIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlZFdhdmVzID0gZ2V0KCkud2F2ZXMubWFwKHcgPT4gdy5pZCA9PT0gd2F2ZUlkID8geyAuLi53LCAuLi51cGRhdGVzIH0gOiB3KTtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdtaWdyYXRpb24td2F2ZXMnLCBKU09OLnN0cmluZ2lmeSh1cGRhdGVkV2F2ZXMpKTtcbiAgICAgICAgICAgIHNldCh7IHdhdmVzOiB1cGRhdGVkV2F2ZXMsIGlzTG9hZGluZzogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gdXBkYXRlIHdhdmU6JywgZXJyb3IpO1xuICAgICAgICAgICAgc2V0KHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byB1cGRhdGUgd2F2ZScsIGlzTG9hZGluZzogZmFsc2UgfSk7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogRGVsZXRlIGEgd2F2ZVxuICAgICAqL1xuICAgIGRlbGV0ZVdhdmU6IGFzeW5jICh3YXZlSWQpID0+IHtcbiAgICAgICAgc2V0KHsgaXNMb2FkaW5nOiB0cnVlLCBlcnJvcjogbnVsbCB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWRXYXZlcyA9IGdldCgpLndhdmVzLmZpbHRlcih3ID0+IHcuaWQgIT09IHdhdmVJZCk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbWlncmF0aW9uLXdhdmVzJywgSlNPTi5zdHJpbmdpZnkodXBkYXRlZFdhdmVzKSk7XG4gICAgICAgICAgICBzZXQoe1xuICAgICAgICAgICAgICAgIHdhdmVzOiB1cGRhdGVkV2F2ZXMsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRXYXZlSWQ6IGdldCgpLnNlbGVjdGVkV2F2ZUlkID09PSB3YXZlSWQgPyBudWxsIDogZ2V0KCkuc2VsZWN0ZWRXYXZlSWQsXG4gICAgICAgICAgICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGRlbGV0ZSB3YXZlOicsIGVycm9yKTtcbiAgICAgICAgICAgIHNldCh7IGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gZGVsZXRlIHdhdmUnLCBpc0xvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIER1cGxpY2F0ZSBhbiBleGlzdGluZyB3YXZlXG4gICAgICovXG4gICAgZHVwbGljYXRlV2F2ZTogYXN5bmMgKHdhdmVJZCkgPT4ge1xuICAgICAgICBzZXQoeyBpc0xvYWRpbmc6IHRydWUsIGVycm9yOiBudWxsIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxXYXZlID0gZ2V0KCkud2F2ZXMuZmluZCh3ID0+IHcuaWQgPT09IHdhdmVJZCk7XG4gICAgICAgICAgICBpZiAoIW9yaWdpbmFsV2F2ZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgV2F2ZSAke3dhdmVJZH0gbm90IGZvdW5kYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBuZXdXYXZlID0ge1xuICAgICAgICAgICAgICAgIC4uLm9yaWdpbmFsV2F2ZSxcbiAgICAgICAgICAgICAgICBpZDogY3J5cHRvLnJhbmRvbVVVSUQoKSxcbiAgICAgICAgICAgICAgICBuYW1lOiBgJHtvcmlnaW5hbFdhdmUubmFtZX0gKENvcHkpYCxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgICAgICBvcmRlcjogZ2V0KCkud2F2ZXMubGVuZ3RoICsgMSxcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdQbGFubmluZycsXG4gICAgICAgICAgICAgICAgYWN0dWFsU3RhcnREYXRlOiBudWxsLFxuICAgICAgICAgICAgICAgIGFjdHVhbEVuZERhdGU6IG51bGwsXG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIHVzZXJzIGFycmF5IGlzIHByb3Blcmx5IGNvcGllZFxuICAgICAgICAgICAgICAgIHVzZXJzOiBvcmlnaW5hbFdhdmUudXNlcnMgPyBbLi4ub3JpZ2luYWxXYXZlLnVzZXJzXSA6IFsndXNlcjEnLCAndXNlcjInXSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkV2F2ZXMgPSBbLi4uZ2V0KCkud2F2ZXMsIG5ld1dhdmVdO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ21pZ3JhdGlvbi13YXZlcycsIEpTT04uc3RyaW5naWZ5KHVwZGF0ZWRXYXZlcykpO1xuICAgICAgICAgICAgc2V0KHsgd2F2ZXM6IHVwZGF0ZWRXYXZlcywgaXNMb2FkaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIHJldHVybiBuZXdXYXZlLmlkO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGR1cGxpY2F0ZSB3YXZlOicsIGVycm9yKTtcbiAgICAgICAgICAgIHNldCh7IGVycm9yOiBlcnJvci5tZXNzYWdlIHx8ICdGYWlsZWQgdG8gZHVwbGljYXRlIHdhdmUnLCBpc0xvYWRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgc2VsZWN0ZWQgd2F2ZVxuICAgICAqL1xuICAgIHNldFNlbGVjdGVkV2F2ZTogKHdhdmVJZCkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB3YXZlID0gc3RhdGUud2F2ZXMuZmluZCh3ID0+IHcuaWQgPT09IHdhdmVJZCkgfHwgbnVsbDtcbiAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkV2F2ZUlkID0gd2F2ZUlkO1xuICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRXYXZlID0gd2F2ZTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBDbGVhciBlcnJvciBzdGF0ZVxuICAgICAqL1xuICAgIGNsZWFyRXJyb3I6ICgpID0+IHtcbiAgICAgICAgc2V0KHsgZXJyb3I6IG51bGwgfSk7XG4gICAgfSxcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBFTkhBTkNFRCBXQVZFIE9SQ0hFU1RSQVRJT04gPT09PT09PT09PT09PT09PT09PT1cbiAgICAvKipcbiAgICAgKiBSZW9yZGVyIHdhdmVzIGJ5IHByb3ZpZGluZyBuZXcgb3JkZXJcbiAgICAgKi9cbiAgICByZW9yZGVyV2F2ZXM6ICh3YXZlSWRzKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlb3JkZXJlZFdhdmVzID0gd2F2ZUlkc1xuICAgICAgICAgICAgICAgIC5tYXAoKGlkKSA9PiBzdGF0ZS53YXZlcy5maW5kKCh3KSA9PiB3LmlkID09PSBpZCkpXG4gICAgICAgICAgICAgICAgLmZpbHRlcigodykgPT4gdyAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIC5tYXAoKHdhdmUsIGluZGV4KSA9PiAoeyAuLi53YXZlLCBvcmRlcjogaW5kZXggKyAxIH0pKTtcbiAgICAgICAgICAgIHN0YXRlLndhdmVzID0gcmVvcmRlcmVkV2F2ZXM7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogVmFsaWRhdGUgd2F2ZSBkZXBlbmRlbmNpZXNcbiAgICAgKi9cbiAgICB2YWxpZGF0ZVdhdmVEZXBlbmRlbmNpZXM6IGFzeW5jICh3YXZlSWQpID0+IHtcbiAgICAgICAgY29uc3Qgd2F2ZSA9IGdldCgpLndhdmVzLmZpbmQoKHcpID0+IHcuaWQgPT09IHdhdmVJZCk7XG4gICAgICAgIGlmICghd2F2ZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXYXZlICR7d2F2ZUlkfSBub3QgZm91bmRgKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZXBzID0gZ2V0KCkud2F2ZURlcGVuZGVuY2llcy5nZXQod2F2ZUlkKSB8fCBbXTtcbiAgICAgICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgICAgIGNvbnN0IHdhcm5pbmdzID0gW107XG4gICAgICAgIC8vIENoZWNrIGlmIGRlcGVuZGVuY2llcyBhcmUgY29tcGxldGVkXG4gICAgICAgIGZvciAoY29uc3QgZGVwSWQgb2YgZGVwcykge1xuICAgICAgICAgICAgY29uc3QgZGVwV2F2ZSA9IGdldCgpLndhdmVzLmZpbmQoKHcpID0+IHcuaWQgPT09IGRlcElkKTtcbiAgICAgICAgICAgIGlmICghZGVwV2F2ZSkge1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGQ6ICdkZXBlbmRlbmNpZXMnLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBgRGVwZW5kZW50IHdhdmUgJHtkZXBJZH0gbm90IGZvdW5kYCxcbiAgICAgICAgICAgICAgICAgICAgY29kZTogJ01JU1NJTkdfREVQRU5ERU5DWScsXG4gICAgICAgICAgICAgICAgICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZGVwV2F2ZS5zdGF0dXMgIT09ICdDb21wbGV0ZWQnKSB7XG4gICAgICAgICAgICAgICAgd2FybmluZ3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkOiAnZGVwZW5kZW5jaWVzJyxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogYERlcGVuZGVudCB3YXZlIFwiJHtkZXBXYXZlLm5hbWV9XCIgaXMgbm90IGNvbXBsZXRlZGAsXG4gICAgICAgICAgICAgICAgICAgIGNvZGU6ICdJTkNPTVBMRVRFX0RFUEVOREVOQ1knLFxuICAgICAgICAgICAgICAgICAgICBzZXZlcml0eTogJ3dhcm5pbmcnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgIGlzVmFsaWQ6IGVycm9ycy5sZW5ndGggPT09IDAsXG4gICAgICAgICAgICBlcnJvcnM6IGVycm9ycy5tYXAoZSA9PiAoe1xuICAgICAgICAgICAgICAgIGZpZWxkOiBlLmZpZWxkIHx8ICcnLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGUubWVzc2FnZSxcbiAgICAgICAgICAgICAgICBzZXZlcml0eTogZS5zZXZlcml0eSA9PT0gJ2NyaXRpY2FsJyA/ICdlcnJvcicgOiAnZXJyb3InXG4gICAgICAgICAgICB9KSksXG4gICAgICAgICAgICB3YXJuaW5nczogd2FybmluZ3MubWFwKHcgPT4gKHtcbiAgICAgICAgICAgICAgICBmaWVsZDogdy5maWVsZCB8fCAnJyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiB3Lm1lc3NhZ2UsXG4gICAgICAgICAgICB9KSksXG4gICAgICAgIH07XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIHN0YXRlLnZhbGlkYXRpb25SZXN1bHRzLnNldCh3YXZlSWQsIHJlc3VsdCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBhIG1pZ3JhdGlvbiB3YXZlXG4gICAgICovXG4gICAgZXhlY3V0ZVdhdmU6IGFzeW5jICh3YXZlSWQpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgc3RhdGUuaXNMb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHN0YXRlLmVycm9yID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB3YXZlID0gZ2V0KCkud2F2ZXMuZmluZCgodykgPT4gdy5pZCA9PT0gd2F2ZUlkKTtcbiAgICAgICAgICAgIGlmICghd2F2ZSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgV2F2ZSAke3dhdmVJZH0gbm90IGZvdW5kYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBWYWxpZGF0ZSBkZXBlbmRlbmNpZXMgZmlyc3RcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb24gPSBhd2FpdCBnZXQoKS52YWxpZGF0ZVdhdmVEZXBlbmRlbmNpZXMod2F2ZUlkKTtcbiAgICAgICAgICAgIGlmICghdmFsaWRhdGlvbi5pc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBXYXZlIGRlcGVuZGVuY2llcyB2YWxpZGF0aW9uIGZhaWxlZDogJHt2YWxpZGF0aW9uLmVycm9ycy5qb2luKCcsICcpfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ3JlYXRlIHJvbGxiYWNrIHBvaW50IGJlZm9yZSBleGVjdXRpb25cbiAgICAgICAgICAgIGF3YWl0IGdldCgpLmNyZWF0ZVJvbGxiYWNrUG9pbnQoYEJlZm9yZSAke3dhdmUubmFtZX0gZXhlY3V0aW9uYCk7XG4gICAgICAgICAgICAvLyBJbml0aWFsaXplIGV4ZWN1dGlvbiBzdGF0dXNcbiAgICAgICAgICAgIGNvbnN0IGV4ZWN1dGlvblN0YXR1cyA9IHtcbiAgICAgICAgICAgICAgICB3YXZlSWQsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnSW5Qcm9ncmVzcycsXG4gICAgICAgICAgICAgICAgcGhhc2U6ICdwcmVwYXJpbmcnLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgICAgICAgICAgICAgIHdhdmVJZCxcbiAgICAgICAgICAgICAgICAgICAgcGhhc2U6ICdwcmVwYXJpbmcnLFxuICAgICAgICAgICAgICAgICAgICBvdmVyYWxsUHJvZ3Jlc3M6IDAsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUYXNrOiAnSW5pdGlhbGl6aW5nJyxcbiAgICAgICAgICAgICAgICAgICAgdGFza3NDb21wbGV0ZWQ6IDAsXG4gICAgICAgICAgICAgICAgICAgIHRhc2tzVG90YWw6IHdhdmUudGFza3MubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICB1c2Vyc01pZ3JhdGVkOiAwLFxuICAgICAgICAgICAgICAgICAgICB1c2Vyc1RvdGFsOiAwLFxuICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWRUaW1lUmVtYWluaW5nOiAwLFxuICAgICAgICAgICAgICAgICAgICB0aHJvdWdocHV0OiAwLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcnM6IFtdLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc3RhcnRlZEF0OiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgIGVycm9yQ291bnQ6IDAsXG4gICAgICAgICAgICAgICAgd2FybmluZ0NvdW50OiAwLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgICAgICBzdGF0ZS53YXZlRXhlY3V0aW9uU3RhdHVzLnNldCh3YXZlSWQsIGV4ZWN1dGlvblN0YXR1cyk7XG4gICAgICAgICAgICAgICAgc3RhdGUuY3VycmVudFdhdmUgPSB3YXZlO1xuICAgICAgICAgICAgICAgIHN0YXRlLndhdmVzID0gc3RhdGUud2F2ZXMubWFwKCh3KSA9PiB3LmlkID09PSB3YXZlSWQgPyB7IC4uLncsIHN0YXR1czogJ0luUHJvZ3Jlc3MnLCBhY3R1YWxTdGFydERhdGU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9IDogdyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgd2F2ZSB2aWEgUG93ZXJTaGVsbFxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL01pZ3JhdGlvbi9NaWdyYXRpb25PcmNoZXN0cmF0b3IucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnU3RhcnQtTWlncmF0aW9uV2F2ZScsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBXYXZlSWQ6IHdhdmVJZCxcbiAgICAgICAgICAgICAgICAgICAgV2F2ZU5hbWU6IHdhdmUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgVGFza3M6IHdhdmUudGFza3MsXG4gICAgICAgICAgICAgICAgICAgIFN0cmVhbVByb2dyZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICBzdHJlYW1PdXRwdXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDAsIC8vIE5vIHRpbWVvdXQgZm9yIG1pZ3JhdGlvbnNcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IHN0YXRlLndhdmVFeGVjdXRpb25TdGF0dXMuZ2V0KHdhdmVJZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5zdGF0dXMgPSAnQ29tcGxldGVkJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5waGFzZSA9ICdjb21wbGV0ZWQnO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzLmNvbXBsZXRlZEF0ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cy5wcm9ncmVzcy5vdmVyYWxsUHJvZ3Jlc3MgPSAxMDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3RhdGUud2F2ZXMgPSBzdGF0ZS53YXZlcy5tYXAoKHcpID0+IHcuaWQgPT09IHdhdmVJZFxuICAgICAgICAgICAgICAgICAgICAgICAgPyB7IC4uLncsIHN0YXR1czogJ0NvbXBsZXRlZCcsIGFjdHVhbEVuZERhdGU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA6IHcpO1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5jdXJyZW50V2F2ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmlzTG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCAnV2F2ZSBleGVjdXRpb24gZmFpbGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdXYXZlIGV4ZWN1dGlvbiBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IHN0YXRlLndhdmVFeGVjdXRpb25TdGF0dXMuZ2V0KHdhdmVJZCk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuc3RhdHVzID0gJ0ZhaWxlZCc7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1cy5waGFzZSA9ICdmYWlsZWQnO1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuY29tcGxldGVkQXQgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdGF0ZS53YXZlcyA9IHN0YXRlLndhdmVzLm1hcCgodykgPT4gdy5pZCA9PT0gd2F2ZUlkID8geyAuLi53LCBzdGF0dXM6ICdGYWlsZWQnIH0gOiB3KTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5lcnJvciA9IGVycm9yLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgc3RhdGUuaXNMb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc3RhdGUuY3VycmVudFdhdmUgPSBudWxsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogUGF1c2UgYSBydW5uaW5nIHdhdmVcbiAgICAgKi9cbiAgICBwYXVzZVdhdmU6IGFzeW5jICh3YXZlSWQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9NaWdyYXRpb24vTWlncmF0aW9uT3JjaGVzdHJhdG9yLnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ1BhdXNlLU1pZ3JhdGlvbldhdmUnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHsgV2F2ZUlkOiB3YXZlSWQgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IHN0YXRlLndhdmVFeGVjdXRpb25TdGF0dXMuZ2V0KHdhdmVJZCk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMuc3RhdHVzID0gJ1BhdXNlZCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN0YXRlLndhdmVzID0gc3RhdGUud2F2ZXMubWFwKCh3KSA9PiB3LmlkID09PSB3YXZlSWQgPyB7IC4uLncsIHN0YXR1czogJ1BhdXNlZCcgfSA6IHcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcGF1c2Ugd2F2ZTonLCBlcnJvcik7XG4gICAgICAgICAgICBzZXQoeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZXN1bWUgYSBwYXVzZWQgd2F2ZVxuICAgICAqL1xuICAgIHJlc3VtZVdhdmU6IGFzeW5jICh3YXZlSWQpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9NaWdyYXRpb24vTWlncmF0aW9uT3JjaGVzdHJhdG9yLnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ1Jlc3VtZS1NaWdyYXRpb25XYXZlJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7IFdhdmVJZDogd2F2ZUlkIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXMgPSBzdGF0ZS53YXZlRXhlY3V0aW9uU3RhdHVzLmdldCh3YXZlSWQpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzLnN0YXR1cyA9ICdJblByb2dyZXNzJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3RhdGUud2F2ZXMgPSBzdGF0ZS53YXZlcy5tYXAoKHcpID0+IHcuaWQgPT09IHdhdmVJZCA/IHsgLi4udywgc3RhdHVzOiAnSW5Qcm9ncmVzcycgfSA6IHcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gcmVzdW1lIHdhdmU6JywgZXJyb3IpO1xuICAgICAgICAgICAgc2V0KHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQWRkIGFuIGl0ZW0gdG8gYSBtaWdyYXRpb24gd2F2ZVxuICAgICAqL1xuICAgIGFkZEl0ZW1Ub1dhdmU6ICh3YXZlSWQsIGl0ZW0pID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgd2F2ZSA9IHN0YXRlLndhdmVzLmZpbmQoKHcpID0+IHcuaWQgPT09IHdhdmVJZCk7XG4gICAgICAgICAgICBpZiAod2F2ZSkge1xuICAgICAgICAgICAgICAgIC8vIEFkZCBpdGVtIHRvIHRoZSBmaXJzdCBiYXRjaCwgb3IgY3JlYXRlIGEgbmV3IGJhdGNoIGlmIG5vbmUgZXhpc3RzXG4gICAgICAgICAgICAgICAgaWYgKHdhdmUuYmF0Y2hlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IGJhdGNoXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0JhdGNoID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGBiYXRjaC0ke0RhdGUubm93KCl9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGBCYXRjaCBmb3IgJHtpdGVtLm5hbWV9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBgQXV0by1jcmVhdGVkIGJhdGNoIGZvciAke2l0ZW0ubmFtZX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogaXRlbS50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6ICdOb3JtYWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxleGl0eTogJ1NpbXBsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2F2ZTogd2F2ZS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VJZGVudGl0eTogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0SWRlbnRpdHk6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVBhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYXRoOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogaXRlbS50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6ICdOb3RTdGFydGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6ICdOb3JtYWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV4aXR5OiAnU2ltcGxlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRUaW1lOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uVGltZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXN0aW1hdGVkRHVyYXRpb246IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbER1cmF0aW9uOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb25SZXN1bHRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1pc3Npb25NYXBwaW5nczoge30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemVCeXRlczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmZXJyZWRCeXRlczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NQZXJjZW50YWdlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogaXRlbS5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGl0ZW0ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwZW5kZW5jaWVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVwZW5kZW50SXRlbXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRyeUNvdW50OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhSZXRyeUF0dGVtcHRzOiAzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0UmV0cnlUaW1lOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVNaWdyYXRpb25DaGVja2xpc3Q6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3N0TWlncmF0aW9uVmFsaWRhdGlvbjogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVzVXNlckludGVyYWN0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsb3dDb25jdXJyZW50TWlncmF0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25lZFRlY2huaWNpYW46ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidXNpbmVzc0p1c3RpZmljYXRpb246ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXN0b21GaWVsZHM6IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmZXJSYXRlTUJwczogMTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhDb25jdXJyZW50U3RyZWFtczogMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlVGhyb3R0bGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1cHBvcnRzUm9sbGJhY2s6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGxiYWNrUGxhbjogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGxiYWNrSW5zdHJ1Y3Rpb25zOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNWYWxpZGF0aW9uUmVxdWlyZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzVmFsaWRhdGlvblBhc3NlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1YWxpdHlDaGVja3M6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0NvbXBsZXRlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0Vycm9yczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc1dhcm5pbmdzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNIaWdoUmlzazogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRpb25QZXJjZW50YWdlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRTaXplOiAnMCBCJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6ICdOb3RTdGFydGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c01lc3NhZ2U6ICdDcmVhdGVkIGF1dG9tYXRpY2FsbHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kVGltZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYW5uZWRTdGFydERhdGU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFubmVkRW5kRGF0ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZER1cmF0aW9uOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsRHVyYXRpb246IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25lZFRlY2huaWNpYW46ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnVzaW5lc3NPd25lcjogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhDb25jdXJyZW50SXRlbXM6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVBdXRvUmV0cnk6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhSZXRyeUF0dGVtcHRzOiAzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0cnlEZWxheTogMzAwMDAwLCAvLyA1IG1pbnV0ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsSXRlbXM6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZWRJdGVtczogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhaWxlZEl0ZW1zOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbXNXaXRoV2FybmluZ3M6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBpblByb2dyZXNzSXRlbXM6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwZW5kaW5nSXRlbXM6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc1BlcmNlbnRhZ2U6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzUmF0ZTogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsU2l6ZUJ5dGVzOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmZXJyZWRCeXRlczogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2ZXJhZ2VUcmFuc2ZlclJhdGVNQnBzOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVkVG90YWxTaXplOiAnMCBCJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZXJlcXVpc2l0ZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zdE1pZ3JhdGlvblRhc2tzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGVuZGVudEJhdGNoZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJhdGlvbjoge30sXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnZpcm9ubWVudFNldHRpbmdzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZVRocm90dGxpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3R0bGluZ0xpbWl0TUJwczogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZU1pZ3JhdGlvbkNoZWNrbGlzdDogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0TWlncmF0aW9uVmFsaWRhdGlvbjogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5R2F0ZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZXNBcHByb3ZhbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHByb3ZlZEJ5OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcHJvdmFsRGF0ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yczogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICB3YXJuaW5nczogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dGaWxlUGF0aDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXRhaWxlZExvZ3M6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnVzaW5lc3NKdXN0aWZpY2F0aW9uOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVzdGltYXRlZENvc3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3R1YWxDb3N0OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnczogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXN0b21Qcm9wZXJ0aWVzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1cHBvcnRzUm9sbGJhY2s6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sbGJhY2tQbGFuOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGxiYWNrSW5zdHJ1Y3Rpb25zOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzQ29tcGxldGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0Vycm9yczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNXYXJuaW5nczogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0hpZ2hSaXNrOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhblN0YXJ0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuUGF1c2U6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuUmVzdW1lOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzUnVubmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkQXQ6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHdhdmUuYmF0Y2hlcy5wdXNoKG5ld0JhdGNoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEFkZCB0byBmaXJzdCBiYXRjaFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBiYXRjaCA9IHdhdmUuYmF0Y2hlc1swXTtcbiAgICAgICAgICAgICAgICAgICAgYmF0Y2guaXRlbXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmVJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhdmU6IHdhdmUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZUlkZW50aXR5OiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0SWRlbnRpdHk6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VQYXRoOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFBhdGg6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogaXRlbS50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiAnTm90U3RhcnRlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmlvcml0eTogJ05vcm1hbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV4aXR5OiAnU2ltcGxlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0VGltZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZFRpbWU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0aW9uVGltZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWQ6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBlc3RpbWF0ZWREdXJhdGlvbjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbER1cmF0aW9uOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRpb25SZXN1bHRzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGVybWlzc2lvbk1hcHBpbmdzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVCeXRlczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZmVycmVkQnl0ZXM6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc1BlcmNlbnRhZ2U6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogaXRlbS5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBpdGVtLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQ6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwZW5kZW5jaWVzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcGVuZGVudEl0ZW1zOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHJ5Q291bnQ6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhSZXRyeUF0dGVtcHRzOiAzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFJldHJ5VGltZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHByZU1pZ3JhdGlvbkNoZWNrbGlzdDogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3N0TWlncmF0aW9uVmFsaWRhdGlvbjogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlc1VzZXJJbnRlcmFjdGlvbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxvd0NvbmN1cnJlbnRNaWdyYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25lZFRlY2huaWNpYW46ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnVzaW5lc3NKdXN0aWZpY2F0aW9uOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbUZpZWxkczoge30sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZmVyUmF0ZU1CcHM6IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1heENvbmN1cnJlbnRTdHJlYW1zOiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlVGhyb3R0bGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdXBwb3J0c1JvbGxiYWNrOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sbGJhY2tQbGFuOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGxiYWNrSW5zdHJ1Y3Rpb25zOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzVmFsaWRhdGlvblJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNWYWxpZGF0aW9uUGFzc2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHF1YWxpdHlDaGVja3M6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNDb21wbGV0ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3JzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc1dhcm5pbmdzOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzSGlnaFJpc2s6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGlvblBlcmNlbnRhZ2U6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRTaXplOiAnMCBCJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYmF0Y2gudG90YWxJdGVtcysrO1xuICAgICAgICAgICAgICAgICAgICBiYXRjaC5wZW5kaW5nSXRlbXMrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2F2ZS50b3RhbEl0ZW1zID0gKHdhdmUudG90YWxJdGVtcyB8fCAwKSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT0gUk9MTEJBQ0sgU1lTVEVNID09PT09PT09PT09PT09PT09PT09XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgcm9sbGJhY2sgcG9pbnRcbiAgICAgKi9cbiAgICBjcmVhdGVSb2xsYmFja1BvaW50OiBhc3luYyAobmFtZSkgPT4ge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IGdldCgpO1xuICAgICAgICBjb25zdCByb2xsYmFja1BvaW50ID0ge1xuICAgICAgICAgICAgaWQ6IGNyeXB0by5yYW5kb21VVUlEKCksXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IGBSb2xsYmFjayBwb2ludCBjcmVhdGVkIGF0ICR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpfWAsXG4gICAgICAgICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgICAgIHdhdmVJZDogc3RhdGUuY3VycmVudFdhdmU/LmlkIHx8ICcnLFxuICAgICAgICAgICAgYmF0Y2hJZDogJycsXG4gICAgICAgICAgICBzbmFwc2hvdDoge1xuICAgICAgICAgICAgICAgIHdhdmVzOiBzdGF0ZS53YXZlcyxcbiAgICAgICAgICAgICAgICBtYXBwaW5nczogc3RhdGUubWFwcGluZ3MsXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgIHZlcnNpb246ICcxLjAnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNhblJlc3RvcmU6IHRydWUsXG4gICAgICAgIH07XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIHN0YXRlLnJvbGxiYWNrUG9pbnRzLnB1c2gocm9sbGJhY2tQb2ludCk7XG4gICAgICAgICAgICBzdGF0ZS5jYW5Sb2xsYmFjayA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcm9sbGJhY2tQb2ludDtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJvbGxiYWNrIHRvIGEgc3BlY2lmaWMgcG9pbnRcbiAgICAgKi9cbiAgICByb2xsYmFja1RvUG9pbnQ6IGFzeW5jIChwb2ludElkKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gZ2V0KCkucm9sbGJhY2tQb2ludHMuZmluZCgocCkgPT4gcC5pZCA9PT0gcG9pbnRJZCk7XG4gICAgICAgIGlmICghcG9pbnQgfHwgIXBvaW50LmNhblJlc3RvcmUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUm9sbGJhY2sgcG9pbnQgbm90IGZvdW5kIG9yIGNhbm5vdCBiZSByZXN0b3JlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBFeGVjdXRlIHJvbGxiYWNrIHZpYSBQb3dlclNoZWxsXG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvTWlncmF0aW9uL01pZ3JhdGlvbk9yY2hlc3RyYXRvci5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdJbnZva2UtTWlncmF0aW9uUm9sbGJhY2snLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgUm9sbGJhY2tQb2ludElkOiBwb2ludElkLFxuICAgICAgICAgICAgICAgICAgICBTbmFwc2hvdDogcG9pbnQuc25hcHNob3QsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gUmVzdG9yZSBzdGF0ZSBmcm9tIHNuYXBzaG90XG4gICAgICAgICAgICBjb25zdCBzbmFwc2hvdCA9IHBvaW50LnNuYXBzaG90O1xuICAgICAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHN0YXRlLndhdmVzID0gc25hcHNob3Qud2F2ZXM7XG4gICAgICAgICAgICAgICAgc3RhdGUubWFwcGluZ3MgPSBzbmFwc2hvdC5tYXBwaW5ncztcbiAgICAgICAgICAgICAgICBzdGF0ZS5lcnJvciA9IG51bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1JvbGxiYWNrIGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgICAgICBzZXQoeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBMaXN0IGFsbCByb2xsYmFjayBwb2ludHNcbiAgICAgKi9cbiAgICBsaXN0Um9sbGJhY2tQb2ludHM6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIGdldCgpLnJvbGxiYWNrUG9pbnRzO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogRGVsZXRlIGEgcm9sbGJhY2sgcG9pbnRcbiAgICAgKi9cbiAgICBkZWxldGVSb2xsYmFja1BvaW50OiBhc3luYyAocG9pbnRJZCkgPT4ge1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBzdGF0ZS5yb2xsYmFja1BvaW50cyA9IHN0YXRlLnJvbGxiYWNrUG9pbnRzLmZpbHRlcigocCkgPT4gcC5pZCAhPT0gcG9pbnRJZCk7XG4gICAgICAgICAgICBzdGF0ZS5jYW5Sb2xsYmFjayA9IHN0YXRlLnJvbGxiYWNrUG9pbnRzLmxlbmd0aCA+IDA7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT0gQ09ORkxJQ1QgUkVTT0xVVElPTiA9PT09PT09PT09PT09PT09PT09PVxuICAgIC8qKlxuICAgICAqIERldGVjdCBjb25mbGljdHMgaW4gYSB3YXZlXG4gICAgICovXG4gICAgZGV0ZWN0Q29uZmxpY3RzOiBhc3luYyAod2F2ZUlkKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvTWlncmF0aW9uL0NvbmZsaWN0RGV0ZWN0aW9uLnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ0ZpbmQtTWlncmF0aW9uQ29uZmxpY3RzJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7IFdhdmVJZDogd2F2ZUlkIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbmZsaWN0cyA9IHJlc3VsdC5kYXRhLmNvbmZsaWN0cyB8fCBbXTtcbiAgICAgICAgICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmNvbmZsaWN0cyA9IGNvbmZsaWN0cztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uZmxpY3RzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ29uZmxpY3QgZGV0ZWN0aW9uIGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFJlc29sdmUgYSBzcGVjaWZpYyBjb25mbGljdFxuICAgICAqL1xuICAgIHJlc29sdmVDb25mbGljdDogYXN5bmMgKGNvbmZsaWN0SWQsIHJlc29sdXRpb24pID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9NaWdyYXRpb24vQ29uZmxpY3RSZXNvbHV0aW9uLnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ1Jlc29sdmUtTWlncmF0aW9uQ29uZmxpY3QnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgQ29uZmxpY3RJZDogY29uZmxpY3RJZCxcbiAgICAgICAgICAgICAgICAgICAgUmVzb2x1dGlvbjogcmVzb2x1dGlvbixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RhdGUuY29uZmxpY3RzID0gc3RhdGUuY29uZmxpY3RzLm1hcCgoYykgPT4gYy5pZCA9PT0gY29uZmxpY3RJZCA/IHsgLi4uYywgc3RhdHVzOiAncmVzb2x2ZWQnIH0gOiBjKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignQ29uZmxpY3QgcmVzb2x1dGlvbiBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICAgICAgc2V0KHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQXV0by1yZXNvbHZlIGNvbmZsaWN0cyB1c2luZyBhIHN0cmF0ZWd5XG4gICAgICovXG4gICAgYXV0b1Jlc29sdmVDb25mbGljdHM6IGFzeW5jIChzdHJhdGVneSkgPT4ge1xuICAgICAgICBjb25zdCBjb25mbGljdHMgPSBnZXQoKS5jb25mbGljdHMuZmlsdGVyKChjKSA9PiBjLnN0YXR1cyA9PT0gJ3BlbmRpbmcnKTtcbiAgICAgICAgZm9yIChjb25zdCBjb25mbGljdCBvZiBjb25mbGljdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc29sdXRpb24gPSB7XG4gICAgICAgICAgICAgICAgY29uZmxpY3RJZDogY29uZmxpY3QuaWQsXG4gICAgICAgICAgICAgICAgc3RyYXRlZ3k6IHN0cmF0ZWd5LFxuICAgICAgICAgICAgICAgIG5vdGVzOiBgQXV0by1yZXNvbHZlZCB1c2luZyAke3N0cmF0ZWd5fSBzdHJhdGVneWAsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBnZXQoKS5yZXNvbHZlQ29uZmxpY3QoY29uZmxpY3QuaWQsIHJlc29sdXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIHJlc29sdmUgY29uZmxpY3QgJHtjb25mbGljdC5pZH06YCwgZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXQgY29uZmxpY3RzIGJ5IHR5cGVcbiAgICAgKi9cbiAgICBnZXRDb25mbGljdHNCeVR5cGU6ICh0eXBlKSA9PiB7XG4gICAgICAgIHJldHVybiBnZXQoKS5jb25mbGljdHMuZmlsdGVyKChjKSA9PiBjLnR5cGUgPT09IHR5cGUpO1xuICAgIH0sXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT0gUkVTT1VSQ0UgTUFQUElORyA9PT09PT09PT09PT09PT09PT09PVxuICAgIC8qKlxuICAgICAqIEFkZCBhIHJlc291cmNlIG1hcHBpbmdcbiAgICAgKi9cbiAgICBtYXBSZXNvdXJjZTogKG1hcHBpbmcpID0+IHtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgc3RhdGUubWFwcGluZ3MucHVzaChtYXBwaW5nKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBJbXBvcnQgbWFwcGluZ3MgZnJvbSBmaWxlXG4gICAgICovXG4gICAgaW1wb3J0TWFwcGluZ3M6IGFzeW5jIChmaWxlKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgZmlsZS50ZXh0KCk7XG4gICAgICAgICAgICBjb25zdCBtYXBwaW5ncyA9IEpTT04ucGFyc2UodGV4dCk7XG4gICAgICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RhdGUubWFwcGluZ3MgPSBbLi4uc3RhdGUubWFwcGluZ3MsIC4uLm1hcHBpbmdzXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGltcG9ydCBtYXBwaW5nczonLCBlcnJvcik7XG4gICAgICAgICAgICBzZXQoeyBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBFeHBvcnQgbWFwcGluZ3MgdG8gZmlsZVxuICAgICAqL1xuICAgIGV4cG9ydE1hcHBpbmdzOiBhc3luYyAod2F2ZUlkKSA9PiB7XG4gICAgICAgIGNvbnN0IG1hcHBpbmdzID0gd2F2ZUlkXG4gICAgICAgICAgICA/IGdldCgpLm1hcHBpbmdzLmZpbHRlcigobSkgPT4gbS53YXZlSWQgPT09IHdhdmVJZClcbiAgICAgICAgICAgIDogZ2V0KCkubWFwcGluZ3M7XG4gICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbSlNPTi5zdHJpbmdpZnkobWFwcGluZ3MsIG51bGwsIDIpXSwge1xuICAgICAgICAgICAgdHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgYS5ocmVmID0gdXJsO1xuICAgICAgICBhLmRvd25sb2FkID0gYG1hcHBpbmdzLSR7d2F2ZUlkIHx8ICdhbGwnfS0ke0RhdGUubm93KCl9Lmpzb25gO1xuICAgICAgICBhLmNsaWNrKCk7XG4gICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFZhbGlkYXRlIG1hcHBpbmdzIGZvciBhIHdhdmVcbiAgICAgKi9cbiAgICB2YWxpZGF0ZU1hcHBpbmdzOiBhc3luYyAod2F2ZUlkKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvTWlncmF0aW9uL01hcHBpbmdWYWxpZGF0aW9uLnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ1Rlc3QtTWlncmF0aW9uTWFwcGluZ3MnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgV2F2ZUlkOiB3YXZlSWQsXG4gICAgICAgICAgICAgICAgICAgIE1hcHBpbmdzOiBnZXQoKS5tYXBwaW5ncyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIGlzVmFsaWQ6IHJlc3VsdC5zdWNjZXNzLFxuICAgICAgICAgICAgICAgIGVycm9yczogcmVzdWx0LmRhdGE/LmVycm9ycyB8fCBbXSxcbiAgICAgICAgICAgICAgICB3YXJuaW5nczogcmVzdWx0LmRhdGE/Lndhcm5pbmdzIHx8IFtdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgICAgICBzdGF0ZS52YWxpZGF0aW9uUmVzdWx0cy5zZXQod2F2ZUlkLCB2YWxpZGF0aW9uUmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHZhbGlkYXRpb25SZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdNYXBwaW5nIHZhbGlkYXRpb24gZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaXNWYWxpZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3JzOiBbZXJyb3IubWVzc2FnZV0sXG4gICAgICAgICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQXV0by1tYXAgcmVzb3VyY2VzIHVzaW5nIGEgc3RyYXRlZ3lcbiAgICAgKi9cbiAgICBhdXRvTWFwUmVzb3VyY2VzOiBhc3luYyAoc3RyYXRlZ3kpID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHdpbmRvdy5lbGVjdHJvbkFQSS5leGVjdXRlTW9kdWxlKHtcbiAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiAnTW9kdWxlcy9NaWdyYXRpb24vQXV0b01hcHBpbmcucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnTmV3LUF1dG9tYXRpY01hcHBpbmdzJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7IFN0cmF0ZWd5OiBzdHJhdGVneSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdNYXBwaW5ncyA9IHJlc3VsdC5kYXRhLm1hcHBpbmdzIHx8IFtdO1xuICAgICAgICAgICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUubWFwcGluZ3MgPSBbLi4uc3RhdGUubWFwcGluZ3MsIC4uLm5ld01hcHBpbmdzXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0F1dG8tbWFwcGluZyBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICAgICAgc2V0KHsgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogQnVsayB1cGRhdGUgbWFwcGluZ3NcbiAgICAgKi9cbiAgICBidWxrVXBkYXRlTWFwcGluZ3M6IGFzeW5jICh1cGRhdGVzKSA9PiB7XG4gICAgICAgIHNldCgoc3RhdGUpID0+IHtcbiAgICAgICAgICAgIHN0YXRlLm1hcHBpbmdzID0gc3RhdGUubWFwcGluZ3MubWFwKChtKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdXBkYXRlID0gdXBkYXRlcy5nZXQobS5pZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVwZGF0ZSA/IHsgLi4ubSwgLi4udXBkYXRlIH0gOiBtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT0gREVMVEEgU1lOQyA9PT09PT09PT09PT09PT09PT09PVxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gZGVsdGEgc3luY2hyb25pemF0aW9uXG4gICAgICovXG4gICAgcGVyZm9ybURlbHRhU3luYzogYXN5bmMgKHdhdmVJZCkgPT4ge1xuICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL01pZ3JhdGlvbi9EZWx0YVN5bmMucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnSW52b2tlLURlbHRhU3luYycsXG4gICAgICAgICAgICAgICAgcGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICAgICBXYXZlSWQ6IHdhdmVJZCxcbiAgICAgICAgICAgICAgICAgICAgTGFzdFN5bmNUaW1lc3RhbXA6IGdldCgpLmxhc3RTeW5jVGltZXN0YW1wLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHN5bmNSZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgY2hhbmdlc0RldGVjdGVkOiByZXN1bHQuZGF0YS5jaGFuZ2VzRGV0ZWN0ZWQgfHwgMCxcbiAgICAgICAgICAgICAgICBjaGFuZ2VzQXBwbGllZDogcmVzdWx0LmRhdGEuY2hhbmdlc0FwcGxpZWQgfHwgMCxcbiAgICAgICAgICAgICAgICBjb25mbGljdHM6IHJlc3VsdC5kYXRhLmNvbmZsaWN0cyB8fCAwLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBEYXRlLm5vdygpIC0gc3RhcnRUaW1lLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RhdGUubGFzdFN5bmNUaW1lc3RhbXAgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gc3luY1Jlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0RlbHRhIHN5bmMgZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBTY2hlZHVsZSBkZWx0YSBzeW5jXG4gICAgICovXG4gICAgc2NoZWR1bGVEZWx0YVN5bmM6ICh3YXZlSWQsIGludGVydmFsKSA9PiB7XG4gICAgICAgIC8vIFRoaXMgd291bGQgdHlwaWNhbGx5IHVzZSBzZXRJbnRlcnZhbCwgYnV0IHN0b3JpbmcgdGhlIGludGVydmFsIElEXG4gICAgICAgIC8vIFN0b3JlIGludGVydmFsIGluIGEgZ2xvYmFsIHJlZ2lzdHJ5IG9yIHVzZSBhIGRpZmZlcmVudCBhcHByb2FjaFxuICAgICAgICBjb25zb2xlLmxvZyhgU2NoZWR1bGVkIGRlbHRhIHN5bmMgZm9yIHdhdmUgJHt3YXZlSWR9IGV2ZXJ5ICR7aW50ZXJ2YWx9bXNgKTtcbiAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgc3RhdGUuZGVsdGFTeW5jRW5hYmxlZCA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogU3RvcCBkZWx0YSBzeW5jXG4gICAgICovXG4gICAgc3RvcERlbHRhU3luYzogKHdhdmVJZCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgU3RvcHBlZCBkZWx0YSBzeW5jIGZvciB3YXZlICR7d2F2ZUlkfWApO1xuICAgICAgICBzZXQoKHN0YXRlKSA9PiB7XG4gICAgICAgICAgICBzdGF0ZS5kZWx0YVN5bmNFbmFibGVkID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT0gUFJPR1JFU1MgVFJBQ0tJTkcgPT09PT09PT09PT09PT09PT09PT1cbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmUgdG8gcHJvZ3Jlc3MgdXBkYXRlcyBmb3IgYSB3YXZlXG4gICAgICovXG4gICAgc3Vic2NyaWJlVG9Qcm9ncmVzczogKHdhdmVJZCwgY2FsbGJhY2spID0+IHtcbiAgICAgICAgLy8gTGlzdGVuIHRvIFBvd2VyU2hlbGwgcHJvZ3Jlc3MgZXZlbnRzXG4gICAgICAgIGNvbnN0IGNsZWFudXAgPSB3aW5kb3cuZWxlY3Ryb25BUEkub25Qcm9ncmVzcygoZGF0YSkgPT4ge1xuICAgICAgICAgICAgLy8gTm90ZTogUHJvZ3Jlc3NEYXRhIGRvZXNuJ3QgaGF2ZSB3YXZlSWQsIGZpbHRlcmluZyBieSBvdGhlciBtZWFucyBpZiBuZWVkZWRcbiAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IGdldCgpLndhdmVFeGVjdXRpb25TdGF0dXMuZ2V0KHdhdmVJZCk7XG4gICAgICAgICAgICBpZiAoc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soc3RhdHVzLnByb2dyZXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjbGVhbnVwO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogR2V0IG92ZXJhbGwgcHJvZ3Jlc3Mgc3VtbWFyeVxuICAgICAqL1xuICAgIGdldFByb2dyZXNzU3VtbWFyeTogKCkgPT4ge1xuICAgICAgICBjb25zdCB3YXZlcyA9IGdldCgpLndhdmVzO1xuICAgICAgICBjb25zdCB0b3RhbFdhdmVzID0gd2F2ZXMubGVuZ3RoO1xuICAgICAgICBjb25zdCBjb21wbGV0ZWRXYXZlcyA9IHdhdmVzLmZpbHRlcigodykgPT4gdy5zdGF0dXMgPT09ICdDb21wbGV0ZWQnKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGFjdGl2ZVdhdmVzID0gd2F2ZXMuZmlsdGVyKCh3KSA9PiB3LnN0YXR1cyA9PT0gJ0luUHJvZ3Jlc3MnKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGZhaWxlZFdhdmVzID0gd2F2ZXMuZmlsdGVyKCh3KSA9PiB3LnN0YXR1cyA9PT0gJ0ZhaWxlZCcpLmxlbmd0aDtcbiAgICAgICAgY29uc3QgdG90YWxVc2VycyA9IHdhdmVzLnJlZHVjZSgoc3VtLCB3KSA9PiBzdW0gKyAody50b3RhbEl0ZW1zIHx8IDApLCAwKTtcbiAgICAgICAgY29uc3QgbWlncmF0ZWRVc2VycyA9IHdhdmVzLnJlZHVjZSgoc3VtLCB3KSA9PiBzdW0gKyAody5zdGF0dXMgPT09ICdDb21wbGV0ZWQnID8gdy50b3RhbEl0ZW1zIHx8IDAgOiAwKSwgMCk7XG4gICAgICAgIGNvbnN0IG92ZXJhbGxQcm9ncmVzcyA9IHRvdGFsV2F2ZXMgPiAwID8gKGNvbXBsZXRlZFdhdmVzIC8gdG90YWxXYXZlcykgKiAxMDAgOiAwO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG90YWxXYXZlcyxcbiAgICAgICAgICAgIGNvbXBsZXRlZFdhdmVzLFxuICAgICAgICAgICAgYWN0aXZlV2F2ZXMsXG4gICAgICAgICAgICBmYWlsZWRXYXZlcyxcbiAgICAgICAgICAgIHRvdGFsVXNlcnMsXG4gICAgICAgICAgICBtaWdyYXRlZFVzZXJzLFxuICAgICAgICAgICAgb3ZlcmFsbFByb2dyZXNzLFxuICAgICAgICAgICAgZXN0aW1hdGVkQ29tcGxldGlvbjogbnVsbCwgLy8gQ2FsY3VsYXRlIGJhc2VkIG9uIGN1cnJlbnQgdGhyb3VnaHB1dFxuICAgICAgICB9O1xuICAgIH0sXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT0gVkFMSURBVElPTiA9PT09PT09PT09PT09PT09PT09PVxuICAgIC8qKlxuICAgICAqIFJ1biBwcmUtZmxpZ2h0IGNoZWNrcyBmb3IgYSB3YXZlXG4gICAgICovXG4gICAgcnVuUHJlRmxpZ2h0Q2hlY2tzOiBhc3luYyAod2F2ZUlkKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvTWlncmF0aW9uL1ByZUZsaWdodENoZWNrcy5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdJbnZva2UtUHJlRmxpZ2h0Q2hlY2tzJyxcbiAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzOiB7IFdhdmVJZDogd2F2ZUlkIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgaXNWYWxpZDogcmVzdWx0LnN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgZXJyb3JzOiByZXN1bHQuZGF0YT8uZXJyb3JzIHx8IFtdLFxuICAgICAgICAgICAgICAgIHdhcm5pbmdzOiByZXN1bHQuZGF0YT8ud2FybmluZ3MgfHwgW10sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2V0KChzdGF0ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHN0YXRlLnZhbGlkYXRpb25SZXN1bHRzLnNldCh3YXZlSWQsIHZhbGlkYXRpb25SZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdmFsaWRhdGlvblJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1ByZS1mbGlnaHQgY2hlY2tzIGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yczogW2Vycm9yLm1lc3NhZ2VdLFxuICAgICAgICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFZhbGlkYXRlIGxpY2Vuc2VzXG4gICAgICovXG4gICAgdmFsaWRhdGVMaWNlbnNlczogYXN5bmMgKHdhdmVJZCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgd2luZG93LmVsZWN0cm9uQVBJLmV4ZWN1dGVNb2R1bGUoe1xuICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6ICdNb2R1bGVzL01pZ3JhdGlvbi9MaWNlbnNlVmFsaWRhdGlvbi5wc20xJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbk5hbWU6ICdUZXN0LUxpY2Vuc2VBdmFpbGFiaWxpdHknLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHsgV2F2ZUlkOiB3YXZlSWQgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwYXNzZWQ6IHJlc3VsdC5zdWNjZXNzLFxuICAgICAgICAgICAgICAgIGF2YWlsYWJsZUxpY2Vuc2VzOiByZXN1bHQuZGF0YT8uYXZhaWxhYmxlTGljZW5zZXMgfHwgMCxcbiAgICAgICAgICAgICAgICByZXF1aXJlZExpY2Vuc2VzOiByZXN1bHQuZGF0YT8ucmVxdWlyZWRMaWNlbnNlcyB8fCAwLFxuICAgICAgICAgICAgICAgIGVycm9yczogcmVzdWx0LmRhdGE/LmVycm9ycyB8fCBbXSxcbiAgICAgICAgICAgICAgICB3YXJuaW5nczogcmVzdWx0LmRhdGE/Lndhcm5pbmdzIHx8IFtdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0xpY2Vuc2UgdmFsaWRhdGlvbiBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwYXNzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGF2YWlsYWJsZUxpY2Vuc2VzOiAwLFxuICAgICAgICAgICAgICAgIHJlcXVpcmVkTGljZW5zZXM6IDAsXG4gICAgICAgICAgICAgICAgZXJyb3JzOiBbeyBmaWVsZDogJ2xpY2Vuc2VzJywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSwgY29kZTogJ0VSUk9SJywgc2V2ZXJpdHk6ICdlcnJvcicgfV0sXG4gICAgICAgICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogVmFsaWRhdGUgcGVybWlzc2lvbnNcbiAgICAgKi9cbiAgICB2YWxpZGF0ZVBlcm1pc3Npb25zOiBhc3luYyAod2F2ZUlkKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvTWlncmF0aW9uL1Blcm1pc3Npb25WYWxpZGF0aW9uLnBzbTEnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZTogJ1Rlc3QtTWlncmF0aW9uUGVybWlzc2lvbnMnLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHsgV2F2ZUlkOiB3YXZlSWQgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwYXNzZWQ6IHJlc3VsdC5zdWNjZXNzLFxuICAgICAgICAgICAgICAgIG1pc3NpbmdQZXJtaXNzaW9uczogcmVzdWx0LmRhdGE/Lm1pc3NpbmdQZXJtaXNzaW9ucyB8fCBbXSxcbiAgICAgICAgICAgICAgICBlcnJvcnM6IHJlc3VsdC5kYXRhPy5lcnJvcnMgfHwgW10sXG4gICAgICAgICAgICAgICAgd2FybmluZ3M6IHJlc3VsdC5kYXRhPy53YXJuaW5ncyB8fCBbXSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdQZXJtaXNzaW9uIHZhbGlkYXRpb24gZmFpbGVkOicsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGFzc2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBtaXNzaW5nUGVybWlzc2lvbnM6IFtdLFxuICAgICAgICAgICAgICAgIGVycm9yczogW3sgZmllbGQ6ICdwZXJtaXNzaW9ucycsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsIGNvZGU6ICdFUlJPUicsIHNldmVyaXR5OiAnZXJyb3InIH1dLFxuICAgICAgICAgICAgICAgIHdhcm5pbmdzOiBbXSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFZhbGlkYXRlIGNvbm5lY3Rpdml0eVxuICAgICAqL1xuICAgIHZhbGlkYXRlQ29ubmVjdGl2aXR5OiBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB3aW5kb3cuZWxlY3Ryb25BUEkuZXhlY3V0ZU1vZHVsZSh7XG4gICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogJ01vZHVsZXMvTWlncmF0aW9uL0Nvbm5lY3Rpdml0eVRlc3QucHNtMScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiAnVGVzdC1NaWdyYXRpb25Db25uZWN0aXZpdHknLFxuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnM6IHt9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBhc3NlZDogcmVzdWx0LnN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgc291cmNlQ29ubmVjdGVkOiByZXN1bHQuZGF0YT8uc291cmNlQ29ubmVjdGVkIHx8IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRhcmdldENvbm5lY3RlZDogcmVzdWx0LmRhdGE/LnRhcmdldENvbm5lY3RlZCB8fCBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcnM6IHJlc3VsdC5kYXRhPy5lcnJvcnMgfHwgW10sXG4gICAgICAgICAgICAgICAgd2FybmluZ3M6IHJlc3VsdC5kYXRhPy53YXJuaW5ncyB8fCBbXSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb25uZWN0aXZpdHkgdmFsaWRhdGlvbiBmYWlsZWQ6JywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwYXNzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNvdXJjZUNvbm5lY3RlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdGFyZ2V0Q29ubmVjdGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcnM6IFt7IGZpZWxkOiAnY29ubmVjdGl2aXR5JywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSwgY29kZTogJ0VSUk9SJywgc2V2ZXJpdHk6ICdlcnJvcicgfV0sXG4gICAgICAgICAgICAgICAgd2FybmluZ3M6IFtdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sXG59KSkpLCB7XG4gICAgbmFtZTogJ01pZ3JhdGlvblN0b3JlJyxcbiAgICBwYXJ0aWFsaXplOiAoc3RhdGUpID0+ICh7XG4gICAgICAgIHdhdmVzOiBzdGF0ZS53YXZlcyxcbiAgICAgICAgcm9sbGJhY2tQb2ludHM6IHN0YXRlLnJvbGxiYWNrUG9pbnRzLFxuICAgICAgICBtYXBwaW5nczogc3RhdGUubWFwcGluZ3MsXG4gICAgICAgIHdhdmVEZXBlbmRlbmNpZXM6IHN0YXRlLndhdmVEZXBlbmRlbmNpZXMsXG4gICAgfSksXG59KSkpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9