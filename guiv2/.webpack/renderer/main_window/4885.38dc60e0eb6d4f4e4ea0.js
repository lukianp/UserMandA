"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[4885],{

/***/ 54885:
/*!*******************************************************!*\
  !*** ./src/renderer/hooks/useCertificateDiscovery.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useCertificateDiscovery: () => (/* binding */ useCertificateDiscovery)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var _useDiscovery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./useDiscovery */ 83318);


function useCertificateDiscovery(profileId) {
    const discovery = (0,_useDiscovery__WEBPACK_IMPORTED_MODULE_1__.useDiscovery)("Certificate", profileId);
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const start = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (args = {}) => {
        try {
            setError(null);
            await discovery.start(args);
        }
        catch (err) {
            setError(err.message || "Failed to start Certificate discovery");
        }
    }, [discovery]);
    const cancelDiscovery = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async () => {
        // Note: The base useDiscovery hook doesn't have cancel functionality
        // This would need to be implemented in the base hook if needed
        console.warn("Cancel not implemented in base useDiscovery hook");
    }, []);
    const clearResults = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        // Note: The base useDiscovery hook doesn't expose clear functionality
        // This would need to be implemented in the base hook if needed
        console.warn("Clear results not implemented in base useDiscovery hook");
    }, []);
    return {
        isRunning: discovery.isRunning,
        results: discovery.rows,
        error: error || (discovery.error ? discovery.error : null),
        progress: discovery.progress,
        start,
        cancelDiscovery,
        clearResults,
        rows: discovery.rows,
    };
}


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNDg4NS4zOGRjNjBlMGViNmQ0ZjRlNGVhMC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUE4QztBQUNBO0FBQ3ZDO0FBQ1Asc0JBQXNCLDJEQUFZO0FBQ2xDLDhCQUE4QiwrQ0FBUTtBQUN0QyxrQkFBa0Isa0RBQVcsaUJBQWlCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLDRCQUE0QixrREFBVztBQUN2QztBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wseUJBQXlCLGtEQUFXO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlQ2VydGlmaWNhdGVEaXNjb3ZlcnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUNhbGxiYWNrIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VEaXNjb3ZlcnkgfSBmcm9tIFwiLi91c2VEaXNjb3ZlcnlcIjtcbmV4cG9ydCBmdW5jdGlvbiB1c2VDZXJ0aWZpY2F0ZURpc2NvdmVyeShwcm9maWxlSWQpIHtcbiAgICBjb25zdCBkaXNjb3ZlcnkgPSB1c2VEaXNjb3ZlcnkoXCJDZXJ0aWZpY2F0ZVwiLCBwcm9maWxlSWQpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3Qgc3RhcnQgPSB1c2VDYWxsYmFjayhhc3luYyAoYXJncyA9IHt9KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgICAgIGF3YWl0IGRpc2NvdmVyeS5zdGFydChhcmdzKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIubWVzc2FnZSB8fCBcIkZhaWxlZCB0byBzdGFydCBDZXJ0aWZpY2F0ZSBkaXNjb3ZlcnlcIik7XG4gICAgICAgIH1cbiAgICB9LCBbZGlzY292ZXJ5XSk7XG4gICAgY29uc3QgY2FuY2VsRGlzY292ZXJ5ID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBOb3RlOiBUaGUgYmFzZSB1c2VEaXNjb3ZlcnkgaG9vayBkb2Vzbid0IGhhdmUgY2FuY2VsIGZ1bmN0aW9uYWxpdHlcbiAgICAgICAgLy8gVGhpcyB3b3VsZCBuZWVkIHRvIGJlIGltcGxlbWVudGVkIGluIHRoZSBiYXNlIGhvb2sgaWYgbmVlZGVkXG4gICAgICAgIGNvbnNvbGUud2FybihcIkNhbmNlbCBub3QgaW1wbGVtZW50ZWQgaW4gYmFzZSB1c2VEaXNjb3ZlcnkgaG9va1wiKTtcbiAgICB9LCBbXSk7XG4gICAgY29uc3QgY2xlYXJSZXN1bHRzID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICAvLyBOb3RlOiBUaGUgYmFzZSB1c2VEaXNjb3ZlcnkgaG9vayBkb2Vzbid0IGV4cG9zZSBjbGVhciBmdW5jdGlvbmFsaXR5XG4gICAgICAgIC8vIFRoaXMgd291bGQgbmVlZCB0byBiZSBpbXBsZW1lbnRlZCBpbiB0aGUgYmFzZSBob29rIGlmIG5lZWRlZFxuICAgICAgICBjb25zb2xlLndhcm4oXCJDbGVhciByZXN1bHRzIG5vdCBpbXBsZW1lbnRlZCBpbiBiYXNlIHVzZURpc2NvdmVyeSBob29rXCIpO1xuICAgIH0sIFtdKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBpc1J1bm5pbmc6IGRpc2NvdmVyeS5pc1J1bm5pbmcsXG4gICAgICAgIHJlc3VsdHM6IGRpc2NvdmVyeS5yb3dzLFxuICAgICAgICBlcnJvcjogZXJyb3IgfHwgKGRpc2NvdmVyeS5lcnJvciA/IGRpc2NvdmVyeS5lcnJvciA6IG51bGwpLFxuICAgICAgICBwcm9ncmVzczogZGlzY292ZXJ5LnByb2dyZXNzLFxuICAgICAgICBzdGFydCxcbiAgICAgICAgY2FuY2VsRGlzY292ZXJ5LFxuICAgICAgICBjbGVhclJlc3VsdHMsXG4gICAgICAgIHJvd3M6IGRpc2NvdmVyeS5yb3dzLFxuICAgIH07XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=