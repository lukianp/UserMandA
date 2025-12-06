"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[432],{

/***/ 10432:
/*!***************************************************!*\
  !*** ./src/renderer/hooks/useDNSDHCPDiscovery.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useDNSDHCPDiscovery: () => (/* binding */ useDNSDHCPDiscovery)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ 96540);
/* harmony import */ var _useDiscovery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./useDiscovery */ 83318);


function useDNSDHCPDiscovery(profileId) {
    const discovery = (0,_useDiscovery__WEBPACK_IMPORTED_MODULE_1__.useDiscovery)("DNSDHCP", profileId);
    const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const start = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (args = {}) => {
        try {
            setError(null);
            await discovery.start(args);
        }
        catch (err) {
            setError(err.message || "Failed to start DNS/DHCP discovery");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiNDMyLjk3MzQzYjA2YTM2MmEwYzMxYTI1LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQThDO0FBQ0E7QUFDdkM7QUFDUCxzQkFBc0IsMkRBQVk7QUFDbEMsOEJBQThCLCtDQUFRO0FBQ3RDLGtCQUFrQixrREFBVyxpQkFBaUI7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsNEJBQTRCLGtEQUFXO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCx5QkFBeUIsa0RBQVc7QUFDcEM7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL3NyYy9yZW5kZXJlci9ob29rcy91c2VETlNESENQRGlzY292ZXJ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjayB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlRGlzY292ZXJ5IH0gZnJvbSBcIi4vdXNlRGlzY292ZXJ5XCI7XG5leHBvcnQgZnVuY3Rpb24gdXNlRE5TREhDUERpc2NvdmVyeShwcm9maWxlSWQpIHtcbiAgICBjb25zdCBkaXNjb3ZlcnkgPSB1c2VEaXNjb3ZlcnkoXCJETlNESENQXCIsIHByb2ZpbGVJZCk7XG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShudWxsKTtcbiAgICBjb25zdCBzdGFydCA9IHVzZUNhbGxiYWNrKGFzeW5jIChhcmdzID0ge30pID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHNldEVycm9yKG51bGwpO1xuICAgICAgICAgICAgYXdhaXQgZGlzY292ZXJ5LnN0YXJ0KGFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHNldEVycm9yKGVyci5tZXNzYWdlIHx8IFwiRmFpbGVkIHRvIHN0YXJ0IEROUy9ESENQIGRpc2NvdmVyeVwiKTtcbiAgICAgICAgfVxuICAgIH0sIFtkaXNjb3ZlcnldKTtcbiAgICBjb25zdCBjYW5jZWxEaXNjb3ZlcnkgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIE5vdGU6IFRoZSBiYXNlIHVzZURpc2NvdmVyeSBob29rIGRvZXNuJ3QgaGF2ZSBjYW5jZWwgZnVuY3Rpb25hbGl0eVxuICAgICAgICAvLyBUaGlzIHdvdWxkIG5lZWQgdG8gYmUgaW1wbGVtZW50ZWQgaW4gdGhlIGJhc2UgaG9vayBpZiBuZWVkZWRcbiAgICAgICAgY29uc29sZS53YXJuKFwiQ2FuY2VsIG5vdCBpbXBsZW1lbnRlZCBpbiBiYXNlIHVzZURpc2NvdmVyeSBob29rXCIpO1xuICAgIH0sIFtdKTtcbiAgICBjb25zdCBjbGVhclJlc3VsdHMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIC8vIE5vdGU6IFRoZSBiYXNlIHVzZURpc2NvdmVyeSBob29rIGRvZXNuJ3QgZXhwb3NlIGNsZWFyIGZ1bmN0aW9uYWxpdHlcbiAgICAgICAgLy8gVGhpcyB3b3VsZCBuZWVkIHRvIGJlIGltcGxlbWVudGVkIGluIHRoZSBiYXNlIGhvb2sgaWYgbmVlZGVkXG4gICAgICAgIGNvbnNvbGUud2FybihcIkNsZWFyIHJlc3VsdHMgbm90IGltcGxlbWVudGVkIGluIGJhc2UgdXNlRGlzY292ZXJ5IGhvb2tcIik7XG4gICAgfSwgW10pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGlzUnVubmluZzogZGlzY292ZXJ5LmlzUnVubmluZyxcbiAgICAgICAgcmVzdWx0czogZGlzY292ZXJ5LnJvd3MsXG4gICAgICAgIGVycm9yOiBlcnJvciB8fCAoZGlzY292ZXJ5LmVycm9yID8gZGlzY292ZXJ5LmVycm9yIDogbnVsbCksXG4gICAgICAgIHByb2dyZXNzOiBkaXNjb3ZlcnkucHJvZ3Jlc3MsXG4gICAgICAgIHN0YXJ0LFxuICAgICAgICBjYW5jZWxEaXNjb3ZlcnksXG4gICAgICAgIGNsZWFyUmVzdWx0cyxcbiAgICAgICAgcm93czogZGlzY292ZXJ5LnJvd3MsXG4gICAgfTtcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==