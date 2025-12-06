"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7120],{

/***/ 37120:
/*!***********************************************!*\
  !*** ./src/renderer/hooks/useDLPDiscovery.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useDLPDiscovery: () => (/* binding */ useDLPDiscovery)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var _useDiscovery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./useDiscovery */ 83318);


function useDLPDiscovery(profileId) {
    const discovery = (0,_useDiscovery__WEBPACK_IMPORTED_MODULE_1__.useDiscovery)("DLP", profileId);
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const start = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (args = {}) => {
        try {
            setError(null);
            await discovery.start(args);
        }
        catch (err) {
            setError(err.message || "Failed to start DLP discovery");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNzEyMC4wMjA0NGRmZGNiNGNmOGFjMWNhMC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUE4QztBQUNBO0FBQ3ZDO0FBQ1Asc0JBQXNCLDJEQUFZO0FBQ2xDLDhCQUE4QiwrQ0FBUTtBQUN0QyxrQkFBa0Isa0RBQVcsaUJBQWlCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLDRCQUE0QixrREFBVztBQUN2QztBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wseUJBQXlCLGtEQUFXO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9zcmMvcmVuZGVyZXIvaG9va3MvdXNlRExQRGlzY292ZXJ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjayB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlRGlzY292ZXJ5IH0gZnJvbSBcIi4vdXNlRGlzY292ZXJ5XCI7XG5leHBvcnQgZnVuY3Rpb24gdXNlRExQRGlzY292ZXJ5KHByb2ZpbGVJZCkge1xuICAgIGNvbnN0IGRpc2NvdmVyeSA9IHVzZURpc2NvdmVyeShcIkRMUFwiLCBwcm9maWxlSWQpO1xuICAgIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGUobnVsbCk7XG4gICAgY29uc3Qgc3RhcnQgPSB1c2VDYWxsYmFjayhhc3luYyAoYXJncyA9IHt9KSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzZXRFcnJvcihudWxsKTtcbiAgICAgICAgICAgIGF3YWl0IGRpc2NvdmVyeS5zdGFydChhcmdzKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBzZXRFcnJvcihlcnIubWVzc2FnZSB8fCBcIkZhaWxlZCB0byBzdGFydCBETFAgZGlzY292ZXJ5XCIpO1xuICAgICAgICB9XG4gICAgfSwgW2Rpc2NvdmVyeV0pO1xuICAgIGNvbnN0IGNhbmNlbERpc2NvdmVyeSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gTm90ZTogVGhlIGJhc2UgdXNlRGlzY292ZXJ5IGhvb2sgZG9lc24ndCBoYXZlIGNhbmNlbCBmdW5jdGlvbmFsaXR5XG4gICAgICAgIC8vIFRoaXMgd291bGQgbmVlZCB0byBiZSBpbXBsZW1lbnRlZCBpbiB0aGUgYmFzZSBob29rIGlmIG5lZWRlZFxuICAgICAgICBjb25zb2xlLndhcm4oXCJDYW5jZWwgbm90IGltcGxlbWVudGVkIGluIGJhc2UgdXNlRGlzY292ZXJ5IGhvb2tcIik7XG4gICAgfSwgW10pO1xuICAgIGNvbnN0IGNsZWFyUmVzdWx0cyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgLy8gTm90ZTogVGhlIGJhc2UgdXNlRGlzY292ZXJ5IGhvb2sgZG9lc24ndCBleHBvc2UgY2xlYXIgZnVuY3Rpb25hbGl0eVxuICAgICAgICAvLyBUaGlzIHdvdWxkIG5lZWQgdG8gYmUgaW1wbGVtZW50ZWQgaW4gdGhlIGJhc2UgaG9vayBpZiBuZWVkZWRcbiAgICAgICAgY29uc29sZS53YXJuKFwiQ2xlYXIgcmVzdWx0cyBub3QgaW1wbGVtZW50ZWQgaW4gYmFzZSB1c2VEaXNjb3ZlcnkgaG9va1wiKTtcbiAgICB9LCBbXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaXNSdW5uaW5nOiBkaXNjb3ZlcnkuaXNSdW5uaW5nLFxuICAgICAgICByZXN1bHRzOiBkaXNjb3Zlcnkucm93cyxcbiAgICAgICAgZXJyb3I6IGVycm9yIHx8IChkaXNjb3ZlcnkuZXJyb3IgPyBkaXNjb3ZlcnkuZXJyb3IgOiBudWxsKSxcbiAgICAgICAgcHJvZ3Jlc3M6IGRpc2NvdmVyeS5wcm9ncmVzcyxcbiAgICAgICAgc3RhcnQsXG4gICAgICAgIGNhbmNlbERpc2NvdmVyeSxcbiAgICAgICAgY2xlYXJSZXN1bHRzLFxuICAgICAgICByb3dzOiBkaXNjb3Zlcnkucm93cyxcbiAgICB9O1xufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9