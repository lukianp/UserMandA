"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[8889],{

/***/ 68889:
/*!***********************************************************!*\
  !*** ./src/renderer/hooks/useMigrationValidationLogic.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useMigrationValidationLogic: () => (/* binding */ useMigrationValidationLogic)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var _store_useMigrationStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../store/useMigrationStore */ 2782);


const useMigrationValidationLogic = () => {
    const { selectedWave, validationResults, isLoading, error, validateWave, validateAll, clearValidationResults, } = (0,_store_useMigrationStore__WEBPACK_IMPORTED_MODULE_1__.useMigrationStore)();
    // Get validation results for the selected wave
    const waveValidationResult = selectedWave ? validationResults.get(selectedWave.id) : null;
    const [isValidating, setIsValidating] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [selectedSeverity, setSelectedSeverity] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('all');
    const severityCounts = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!waveValidationResult)
            return { total: 0, blockers: 0, warnings: 0, info: 0, passed: 0 };
        const checks = waveValidationResult.checks || [];
        return {
            total: checks.length,
            blockers: checks.filter((c) => c.severity === 'blocker' && !c.passed).length,
            warnings: checks.filter((c) => c.severity === 'warning' && !c.passed).length,
            info: checks.filter((c) => c.severity === 'info' && !c.passed).length,
            passed: checks.filter((c) => c.passed).length,
        };
    }, [waveValidationResult]);
    const filteredChecks = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!waveValidationResult)
            return [];
        let checks = waveValidationResult.checks || [];
        if (selectedSeverity !== 'all') {
            checks = checks.filter((c) => c.severity === selectedSeverity);
        }
        return checks.sort((a, b) => {
            const order = { blocker: 0, warning: 1, info: 2 };
            return order[a.severity] - order[b.severity];
        });
    }, [waveValidationResult, selectedSeverity]);
    const handleRunValidation = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        if (!selectedWave)
            return;
        setIsValidating(true);
        try {
            await validateWave(selectedWave.id);
        }
        catch (error) {
            console.error('Validation failed:', error);
        }
        finally {
            setIsValidating(false);
        }
    }, [selectedWave, validateWave]);
    const handleExportReport = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        if (!waveValidationResult)
            return;
        const report = JSON.stringify(waveValidationResult, null, 2);
        const blob = new Blob([report], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'validation-report.json';
        a.click();
        URL.revokeObjectURL(url);
    }, [waveValidationResult]);
    const isReady = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
        if (!waveValidationResult)
            return false;
        return severityCounts.blockers === 0;
    }, [waveValidationResult, severityCounts]);
    return {
        selectedWave,
        validationResults: waveValidationResult,
        filteredChecks,
        isLoading: isLoading || isValidating,
        error,
        selectedSeverity,
        severityCounts,
        isReady,
        setSelectedSeverity,
        handleRunValidation,
        handleValidateAll: validateAll,
        handleClearResults: clearValidationResults,
        handleExportReport,
        hasWaveSelected: !!selectedWave,
        hasResults: !!waveValidationResult,
    };
};


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiODg4OS4zZDRjMzFmMGQxMmM2MjVmMGIwYy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUF1RDtBQUNRO0FBQ3hEO0FBQ1AsWUFBWSx3R0FBd0csRUFBRSwyRUFBaUI7QUFDdkk7QUFDQTtBQUNBLDRDQUE0QywrQ0FBUTtBQUNwRCxvREFBb0QsK0NBQVE7QUFDNUQsMkJBQTJCLDhDQUFPO0FBQ2xDO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsMkJBQTJCLDhDQUFPO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCO0FBQzVCO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTCxnQ0FBZ0Msa0RBQVc7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLCtCQUErQixrREFBVztBQUMxQztBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsMEJBQTBCO0FBQ3BFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxvQkFBb0IsOENBQU87QUFDM0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vc3JjL3JlbmRlcmVyL2hvb2tzL3VzZU1pZ3JhdGlvblZhbGlkYXRpb25Mb2dpYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlTWVtbywgdXNlQ2FsbGJhY2sgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VNaWdyYXRpb25TdG9yZSB9IGZyb20gJy4uL3N0b3JlL3VzZU1pZ3JhdGlvblN0b3JlJztcbmV4cG9ydCBjb25zdCB1c2VNaWdyYXRpb25WYWxpZGF0aW9uTG9naWMgPSAoKSA9PiB7XG4gICAgY29uc3QgeyBzZWxlY3RlZFdhdmUsIHZhbGlkYXRpb25SZXN1bHRzLCBpc0xvYWRpbmcsIGVycm9yLCB2YWxpZGF0ZVdhdmUsIHZhbGlkYXRlQWxsLCBjbGVhclZhbGlkYXRpb25SZXN1bHRzLCB9ID0gdXNlTWlncmF0aW9uU3RvcmUoKTtcbiAgICAvLyBHZXQgdmFsaWRhdGlvbiByZXN1bHRzIGZvciB0aGUgc2VsZWN0ZWQgd2F2ZVxuICAgIGNvbnN0IHdhdmVWYWxpZGF0aW9uUmVzdWx0ID0gc2VsZWN0ZWRXYXZlID8gdmFsaWRhdGlvblJlc3VsdHMuZ2V0KHNlbGVjdGVkV2F2ZS5pZCkgOiBudWxsO1xuICAgIGNvbnN0IFtpc1ZhbGlkYXRpbmcsIHNldElzVmFsaWRhdGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gICAgY29uc3QgW3NlbGVjdGVkU2V2ZXJpdHksIHNldFNlbGVjdGVkU2V2ZXJpdHldID0gdXNlU3RhdGUoJ2FsbCcpO1xuICAgIGNvbnN0IHNldmVyaXR5Q291bnRzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGlmICghd2F2ZVZhbGlkYXRpb25SZXN1bHQpXG4gICAgICAgICAgICByZXR1cm4geyB0b3RhbDogMCwgYmxvY2tlcnM6IDAsIHdhcm5pbmdzOiAwLCBpbmZvOiAwLCBwYXNzZWQ6IDAgfTtcbiAgICAgICAgY29uc3QgY2hlY2tzID0gd2F2ZVZhbGlkYXRpb25SZXN1bHQuY2hlY2tzIHx8IFtdO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdG90YWw6IGNoZWNrcy5sZW5ndGgsXG4gICAgICAgICAgICBibG9ja2VyczogY2hlY2tzLmZpbHRlcigoYykgPT4gYy5zZXZlcml0eSA9PT0gJ2Jsb2NrZXInICYmICFjLnBhc3NlZCkubGVuZ3RoLFxuICAgICAgICAgICAgd2FybmluZ3M6IGNoZWNrcy5maWx0ZXIoKGMpID0+IGMuc2V2ZXJpdHkgPT09ICd3YXJuaW5nJyAmJiAhYy5wYXNzZWQpLmxlbmd0aCxcbiAgICAgICAgICAgIGluZm86IGNoZWNrcy5maWx0ZXIoKGMpID0+IGMuc2V2ZXJpdHkgPT09ICdpbmZvJyAmJiAhYy5wYXNzZWQpLmxlbmd0aCxcbiAgICAgICAgICAgIHBhc3NlZDogY2hlY2tzLmZpbHRlcigoYykgPT4gYy5wYXNzZWQpLmxlbmd0aCxcbiAgICAgICAgfTtcbiAgICB9LCBbd2F2ZVZhbGlkYXRpb25SZXN1bHRdKTtcbiAgICBjb25zdCBmaWx0ZXJlZENoZWNrcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXdhdmVWYWxpZGF0aW9uUmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICBsZXQgY2hlY2tzID0gd2F2ZVZhbGlkYXRpb25SZXN1bHQuY2hlY2tzIHx8IFtdO1xuICAgICAgICBpZiAoc2VsZWN0ZWRTZXZlcml0eSAhPT0gJ2FsbCcpIHtcbiAgICAgICAgICAgIGNoZWNrcyA9IGNoZWNrcy5maWx0ZXIoKGMpID0+IGMuc2V2ZXJpdHkgPT09IHNlbGVjdGVkU2V2ZXJpdHkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjaGVja3Muc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3JkZXIgPSB7IGJsb2NrZXI6IDAsIHdhcm5pbmc6IDEsIGluZm86IDIgfTtcbiAgICAgICAgICAgIHJldHVybiBvcmRlclthLnNldmVyaXR5XSAtIG9yZGVyW2Iuc2V2ZXJpdHldO1xuICAgICAgICB9KTtcbiAgICB9LCBbd2F2ZVZhbGlkYXRpb25SZXN1bHQsIHNlbGVjdGVkU2V2ZXJpdHldKTtcbiAgICBjb25zdCBoYW5kbGVSdW5WYWxpZGF0aW9uID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIXNlbGVjdGVkV2F2ZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgc2V0SXNWYWxpZGF0aW5nKHRydWUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdmFsaWRhdGVXYXZlKHNlbGVjdGVkV2F2ZS5pZCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdWYWxpZGF0aW9uIGZhaWxlZDonLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICBzZXRJc1ZhbGlkYXRpbmcoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSwgW3NlbGVjdGVkV2F2ZSwgdmFsaWRhdGVXYXZlXSk7XG4gICAgY29uc3QgaGFuZGxlRXhwb3J0UmVwb3J0ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoIXdhdmVWYWxpZGF0aW9uUmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjb25zdCByZXBvcnQgPSBKU09OLnN0cmluZ2lmeSh3YXZlVmFsaWRhdGlvblJlc3VsdCwgbnVsbCwgMik7XG4gICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbcmVwb3J0XSwgeyB0eXBlOiAnYXBwbGljYXRpb24vanNvbicgfSk7XG4gICAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGEuaHJlZiA9IHVybDtcbiAgICAgICAgYS5kb3dubG9hZCA9ICd2YWxpZGF0aW9uLXJlcG9ydC5qc29uJztcbiAgICAgICAgYS5jbGljaygpO1xuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgfSwgW3dhdmVWYWxpZGF0aW9uUmVzdWx0XSk7XG4gICAgY29uc3QgaXNSZWFkeSA9IHVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXdhdmVWYWxpZGF0aW9uUmVzdWx0KVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gc2V2ZXJpdHlDb3VudHMuYmxvY2tlcnMgPT09IDA7XG4gICAgfSwgW3dhdmVWYWxpZGF0aW9uUmVzdWx0LCBzZXZlcml0eUNvdW50c10pO1xuICAgIHJldHVybiB7XG4gICAgICAgIHNlbGVjdGVkV2F2ZSxcbiAgICAgICAgdmFsaWRhdGlvblJlc3VsdHM6IHdhdmVWYWxpZGF0aW9uUmVzdWx0LFxuICAgICAgICBmaWx0ZXJlZENoZWNrcyxcbiAgICAgICAgaXNMb2FkaW5nOiBpc0xvYWRpbmcgfHwgaXNWYWxpZGF0aW5nLFxuICAgICAgICBlcnJvcixcbiAgICAgICAgc2VsZWN0ZWRTZXZlcml0eSxcbiAgICAgICAgc2V2ZXJpdHlDb3VudHMsXG4gICAgICAgIGlzUmVhZHksXG4gICAgICAgIHNldFNlbGVjdGVkU2V2ZXJpdHksXG4gICAgICAgIGhhbmRsZVJ1blZhbGlkYXRpb24sXG4gICAgICAgIGhhbmRsZVZhbGlkYXRlQWxsOiB2YWxpZGF0ZUFsbCxcbiAgICAgICAgaGFuZGxlQ2xlYXJSZXN1bHRzOiBjbGVhclZhbGlkYXRpb25SZXN1bHRzLFxuICAgICAgICBoYW5kbGVFeHBvcnRSZXBvcnQsXG4gICAgICAgIGhhc1dhdmVTZWxlY3RlZDogISFzZWxlY3RlZFdhdmUsXG4gICAgICAgIGhhc1Jlc3VsdHM6ICEhd2F2ZVZhbGlkYXRpb25SZXN1bHQsXG4gICAgfTtcbn07XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=