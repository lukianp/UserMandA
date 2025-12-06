/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; (typeof current == 'object' || typeof current == 'function') && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + ({"1284":"discovery-src_renderer_views_discovery_A","3701":"discovery-src_renderer_views_discovery_H","4237":"discovery-src_renderer_views_discovery_P","5585":"migration"}[chunkId] || chunkId) + "." + {"29":"1823534877d08bd5f5ad","94":"beb6dd42ec05aaa466ad","131":"13ed3365043f597988de","144":"2bac104653d6afc317b8","146":"5e5a73184fb2e9e8c05e","221":"3b5a22e1fe6f3378f4cc","279":"6d465d4ffcf6a96329b4","301":"18eb90c0d20762a02556","310":"791da0b65eda58d628d1","432":"97343b06a362a0c31a25","513":"eaf46b3f92b6baf9448d","603":"819a1c8df769a8099798","690":"a26468034e2d12b91311","749":"7a88c703d29cd6e39856","850":"604437e6b39a4278f526","1019":"64d8ce0114732786b932","1050":"86da5d9e9843176b36c0","1087":"cb7ad4f0be41529af12b","1104":"b73e48782721f559526a","1172":"8982def3797bde75d8e3","1173":"78b2476604c3c997fe23","1177":"511db453fe9c4d247517","1272":"07fea5e15774f5f037b0","1284":"3b1ca5b97afacc4641b5","1321":"57db6225ef27e1cd3d4d","1323":"0c205ea85dbbaa8830a8","1569":"142aaa8183cf97ebede4","1623":"6f212fb593f01f8994bc","1695":"296c979e797ad2d8d5a2","1766":"00738a7a381fad323e9c","1777":"8a60157f54a4c6d17788","1826":"d7975b19fe9d015ad686","1923":"bda3672fe1957e1aa3f6","1981":"1fd2b4c3eb60571f525f","2046":"b1591e14eda71b39f76c","2071":"0651ae85cf080c318935","2153":"aa538a1d3019596ee160","2246":"78fdaa9a1049019889cd","2268":"9ec9dff9871ba57d7a26","2304":"cbc116fcd3d7b135e4ff","2410":"0fbeb6ff104909ad7862","2423":"3673a812f3274289df12","2474":"0cc4d6e74838a565592b","2512":"3a915ec15d85a7cebb70","2541":"07ce8f5c48b3f41e102c","2555":"d8a9c93dd69b57142102","2569":"7ac3731932325f0b6ffd","2605":"8135e5711b6fdfc07a76","2610":"fb749585240f28fae093","2639":"19a62f358517d6044160","2642":"3f8aeef1640953b123cb","2782":"7d27a38ec5f2452b6c17","2862":"f3a6892419cbc237b791","2874":"27f63522c83f607c33e0","2908":"298361da1006d7b1cfb5","2979":"53de0a751ca49ae189ae","2984":"d4fe2061e8979e6e9918","3016":"55ca73b56c238d3259b1","3130":"16f3c036aa407efd2449","3267":"eec410bf1fa2a0f68312","3311":"6fdfbed1b4842949317a","3353":"4dff9d9ecf1aad9563a9","3440":"0095cf9dbdf59ff92d0c","3569":"dce6831742ef4e649311","3654":"5e68b29d1053522c98c4","3701":"b996946604603440a743","3730":"445174092c08e9a08f5a","3745":"67631091ec41fdf2d3aa","3844":"384812f9f5cd73c18dba","4024":"acaddc2d267170e175a9","4147":"8e5047e396549c2997de","4210":"c875fe4d169b4fd3ff40","4226":"c677ba5663c80fc5c5b4","4237":"2961b476efb07f6d6d76","4262":"2e5aca02a04b9742e273","4431":"42730a2ffb09c62db328","4518":"983370fa0990dc99ba89","4521":"93b97f682a1f43c6c4d6","4522":"7757d0d5da474452fad3","4581":"99b94516c2e731795680","4728":"737673e33d01dea9ef51","4820":"295d6970c01ee85f9ea4","4885":"38dc60e0eb6d4f4e4ea0","4886":"50fa4e453c8d09b8d8c8","5035":"1f4f0f7f0b35ed1c63c0","5061":"ec2346e8be848ec157e7","5181":"271f95f31fe04a9c943a","5284":"1f9e405401d4cc326044","5293":"6c5836c5b3b05c721b03","5328":"fcb30a1110012c1c09eb","5362":"bfd931921f3b5a59a137","5424":"42909c12b8eab1df0453","5459":"6542f90b7b117e05d2cf","5585":"659dd9547b219d7f7433","5600":"bda610fbc9125e2ea465","5703":"7bd93c95c3c84fba5a46","5711":"b013a27281ae5380975a","5735":"db9303d2e3687b6f398a","5741":"f45ad26ad6beb95f106f","5764":"30eeddc25a64b37316fc","5836":"a84fb7d8d34cb0f4d933","5868":"328a7058729195b3429b","5894":"ab619b9d6f17285e3943","5996":"3f7cb9e7fffe07b6c4ae","6018":"d260db55068b40caab94","6149":"6fb0061d2247119f1990","6156":"9b8e9fe6becbaa1cef4d","6228":"5c48ecef35039251fbed","6252":"56e30058c033fa82e5ac","6257":"a95346ac15d368cd68b7","6302":"2e8c1a28b39ba990dc42","6528":"a032f994bbe9ee64800b","6638":"bae5424aaf29d8280a70","6674":"9ae51f0c6a4efb58410f","6678":"a62c4275cc502e418424","6705":"0638a79babb543aa7c85","6739":"856b60043d87bf24e02c","6880":"9e330c6630ceecb8924b","6899":"f92a452813cde420212d","6975":"ae21e5428a2ab1a38b97","7097":"4482ebc75e5911de23e6","7109":"b6954cc91cec5ce5b625","7120":"02044dfdcb4cf8ac1ca0","7176":"a80738d11707fe9efc81","7186":"a833a51c0585be3b4ad0","7251":"65a34eb735d26e444284","7511":"d27b7ca78c03e78c3802","7547":"f893a19109d26c6f8b92","7551":"8c851edac352b7627a1e","7588":"1400ed1737443d2d468e","7609":"55f04752e342245d971b","7735":"49a1ce64719d81c07d29","7773":"cd3647faed9e4c031ab0","7774":"beac8c2d145b7461ccc1","7781":"cf8c1325eb6590fff29c","7825":"01ca6c609cd60b6cd069","7846":"add69dba43b1c38d884d","7901":"e3e91936af7b86ec31eb","8073":"4476767b5acf10be4c90","8244":"01c6b2e72948fcb188d2","8433":"605bbd4d6075f680543e","8569":"9370e20e7cc4a0e88a78","8706":"b4b8b8b36ef4e3fd96ad","8712":"3383447260749b8ce3a9","8762":"42f0d94d62cdd2768692","8889":"3d4c31f0d12c625f0b0c","8928":"636806a96baa63350bf7","8964":"d1f6a7debb54fbb80eae","9161":"846c912ac2157dce7c28","9416":"10705ca3ab1934190590","9621":"97007eb98eff4108c7e6","9626":"97cb82511e81155fd397","9701":"e8c4d0112bbd0edc8fed"}[chunkId] + ".js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "guiv2:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "./";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = (typeof document !== 'undefined' && document.baseURI) || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			9121: 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(9121 != chunkId) {
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						} else installedChunks[chunkId] = 0;
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS41ZmU4ZWZhMDdkODAzZTA4MDQyOS5qcyIsIm1hcHBpbmdzIjoiOzs7O1VBQUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOzs7OztXQ3pCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLCtCQUErQix3Q0FBd0M7V0FDdkU7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQkFBaUIscUJBQXFCO1dBQ3RDO1dBQ0E7V0FDQSxrQkFBa0IscUJBQXFCO1dBQ3ZDO1dBQ0E7V0FDQSxLQUFLO1dBQ0w7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEU7Ozs7O1dDM0JBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBLEU7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esc0RBQXNEO1dBQ3RELHNDQUFzQyxtR0FBbUc7V0FDekk7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEU7Ozs7O1dDekJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEVBQUU7V0FDRixFOzs7OztXQ1JBO1dBQ0E7V0FDQTtXQUNBLGVBQWUseUtBQXlLLCtCQUErQiw2OUlBQTY5STtXQUNwckosRTs7Ozs7V0NKQSx3Rjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHVCQUF1Qiw0QkFBNEI7V0FDbkQ7V0FDQTtXQUNBO1dBQ0EsaUJBQWlCLG9CQUFvQjtXQUNyQztXQUNBLG1HQUFtRyxZQUFZO1dBQy9HO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLG1FQUFtRSxpQ0FBaUM7V0FDcEc7V0FDQTtXQUNBO1dBQ0EsRTs7Ozs7V0N4Q0E7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7O1dDTkEsNkI7Ozs7O1dDQUE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQzs7V0FFakM7V0FDQTtXQUNBO1dBQ0EsS0FBSztXQUNMO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNO1dBQ047V0FDQTtXQUNBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU0scUJBQXFCO1dBQzNCO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBLDRHOzs7OztXQ3JGQSxtQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svcnVudGltZS9jaHVuayBsb2FkZWQiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2NyZWF0ZSBmYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svcnVudGltZS9lbnN1cmUgY2h1bmsiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2dldCBqYXZhc2NyaXB0IGNodW5rIGZpbGVuYW1lIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2xvYWQgc2NyaXB0Iiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL25vbmNlIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldID0gZGVmZXJyZWRbaV07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwidmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mID8gKG9iaikgPT4gKE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopKSA6IChvYmopID0+IChvYmouX19wcm90b19fKTtcbnZhciBsZWFmUHJvdG90eXBlcztcbi8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuLy8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4vLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbi8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuLy8gbW9kZSAmIDE2OiByZXR1cm4gdmFsdWUgd2hlbiBpdCdzIFByb21pc2UtbGlrZVxuLy8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuX193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcblx0aWYobW9kZSAmIDEpIHZhbHVlID0gdGhpcyh2YWx1ZSk7XG5cdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG5cdGlmKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUpIHtcblx0XHRpZigobW9kZSAmIDQpICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcblx0XHRpZigobW9kZSAmIDE2KSAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHZhbHVlO1xuXHR9XG5cdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG5cdHZhciBkZWYgPSB7fTtcblx0bGVhZlByb3RvdHlwZXMgPSBsZWFmUHJvdG90eXBlcyB8fCBbbnVsbCwgZ2V0UHJvdG8oe30pLCBnZXRQcm90byhbXSksIGdldFByb3RvKGdldFByb3RvKV07XG5cdGZvcih2YXIgY3VycmVudCA9IG1vZGUgJiAyICYmIHZhbHVlOyAodHlwZW9mIGN1cnJlbnQgPT0gJ29iamVjdCcgfHwgdHlwZW9mIGN1cnJlbnQgPT0gJ2Z1bmN0aW9uJykgJiYgIX5sZWFmUHJvdG90eXBlcy5pbmRleE9mKGN1cnJlbnQpOyBjdXJyZW50ID0gZ2V0UHJvdG8oY3VycmVudCkpIHtcblx0XHRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjdXJyZW50KS5mb3JFYWNoKChrZXkpID0+IChkZWZba2V5XSA9ICgpID0+ICh2YWx1ZVtrZXldKSkpO1xuXHR9XG5cdGRlZlsnZGVmYXVsdCddID0gKCkgPT4gKHZhbHVlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBkZWYpO1xuXHRyZXR1cm4gbnM7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZiA9IHt9O1xuLy8gVGhpcyBmaWxlIGNvbnRhaW5zIG9ubHkgdGhlIGVudHJ5IGNodW5rLlxuLy8gVGhlIGNodW5rIGxvYWRpbmcgZnVuY3Rpb24gZm9yIGFkZGl0aW9uYWwgY2h1bmtzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmUgPSAoY2h1bmtJZCkgPT4ge1xuXHRyZXR1cm4gUHJvbWlzZS5hbGwoT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5mKS5yZWR1Y2UoKHByb21pc2VzLCBrZXkpID0+IHtcblx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmZba2V5XShjaHVua0lkLCBwcm9taXNlcyk7XG5cdFx0cmV0dXJuIHByb21pc2VzO1xuXHR9LCBbXSkpO1xufTsiLCIvLyBUaGlzIGZ1bmN0aW9uIGFsbG93IHRvIHJlZmVyZW5jZSBhc3luYyBjaHVua3Ncbl9fd2VicGFja19yZXF1aXJlX18udSA9IChjaHVua0lkKSA9PiB7XG5cdC8vIHJldHVybiB1cmwgZm9yIGZpbGVuYW1lcyBiYXNlZCBvbiB0ZW1wbGF0ZVxuXHRyZXR1cm4gXCJcIiArICh7XCIxMjg0XCI6XCJkaXNjb3Zlcnktc3JjX3JlbmRlcmVyX3ZpZXdzX2Rpc2NvdmVyeV9BXCIsXCIzNzAxXCI6XCJkaXNjb3Zlcnktc3JjX3JlbmRlcmVyX3ZpZXdzX2Rpc2NvdmVyeV9IXCIsXCI0MjM3XCI6XCJkaXNjb3Zlcnktc3JjX3JlbmRlcmVyX3ZpZXdzX2Rpc2NvdmVyeV9QXCIsXCI1NTg1XCI6XCJtaWdyYXRpb25cIn1bY2h1bmtJZF0gfHwgY2h1bmtJZCkgKyBcIi5cIiArIHtcIjI5XCI6XCIxODIzNTM0ODc3ZDA4YmQ1ZjVhZFwiLFwiOTRcIjpcImJlYjZkZDQyZWMwNWFhYTQ2NmFkXCIsXCIxMzFcIjpcIjEzZWQzMzY1MDQzZjU5Nzk4OGRlXCIsXCIxNDRcIjpcIjJiYWMxMDQ2NTNkNmFmYzMxN2I4XCIsXCIxNDZcIjpcIjVlNWE3MzE4NGZiMmU5ZThjMDVlXCIsXCIyMjFcIjpcIjNiNWEyMmUxZmU2ZjMzNzhmNGNjXCIsXCIyNzlcIjpcIjZkNDY1ZDRmZmNmNmE5NjMyOWI0XCIsXCIzMDFcIjpcIjE4ZWI5MGMwZDIwNzYyYTAyNTU2XCIsXCIzMTBcIjpcIjc5MWRhMGI2NWVkYTU4ZDYyOGQxXCIsXCI0MzJcIjpcIjk3MzQzYjA2YTM2MmEwYzMxYTI1XCIsXCI1MTNcIjpcImVhZjQ2YjNmOTJiNmJhZjk0NDhkXCIsXCI2MDNcIjpcIjgxOWExYzhkZjc2OWE4MDk5Nzk4XCIsXCI2OTBcIjpcImEyNjQ2ODAzNGUyZDEyYjkxMzExXCIsXCI3NDlcIjpcIjdhODhjNzAzZDI5Y2Q2ZTM5ODU2XCIsXCI4NTBcIjpcIjYwNDQzN2U2YjM5YTQyNzhmNTI2XCIsXCIxMDE5XCI6XCI2NGQ4Y2UwMTE0NzMyNzg2YjkzMlwiLFwiMTA1MFwiOlwiODZkYTVkOWU5ODQzMTc2YjM2YzBcIixcIjEwODdcIjpcImNiN2FkNGYwYmU0MTUyOWFmMTJiXCIsXCIxMTA0XCI6XCJiNzNlNDg3ODI3MjFmNTU5NTI2YVwiLFwiMTE3MlwiOlwiODk4MmRlZjM3OTdiZGU3NWQ4ZTNcIixcIjExNzNcIjpcIjc4YjI0NzY2MDRjM2M5OTdmZTIzXCIsXCIxMTc3XCI6XCI1MTFkYjQ1M2ZlOWM0ZDI0NzUxN1wiLFwiMTI3MlwiOlwiMDdmZWE1ZTE1Nzc0ZjVmMDM3YjBcIixcIjEyODRcIjpcIjNiMWNhNWI5N2FmYWNjNDY0MWI1XCIsXCIxMzIxXCI6XCI1N2RiNjIyNWVmMjdlMWNkM2Q0ZFwiLFwiMTMyM1wiOlwiMGMyMDVlYTg1ZGJiYWE4ODMwYThcIixcIjE1NjlcIjpcIjE0MmFhYTgxODNjZjk3ZWJlZGU0XCIsXCIxNjIzXCI6XCI2ZjIxMmZiNTkzZjAxZjg5OTRiY1wiLFwiMTY5NVwiOlwiMjk2Yzk3OWU3OTdhZDJkOGQ1YTJcIixcIjE3NjZcIjpcIjAwNzM4YTdhMzgxZmFkMzIzZTljXCIsXCIxNzc3XCI6XCI4YTYwMTU3ZjU0YTRjNmQxNzc4OFwiLFwiMTgyNlwiOlwiZDc5NzViMTlmZTlkMDE1YWQ2ODZcIixcIjE5MjNcIjpcImJkYTM2NzJmZTE5NTdlMWFhM2Y2XCIsXCIxOTgxXCI6XCIxZmQyYjRjM2ViNjA1NzFmNTI1ZlwiLFwiMjA0NlwiOlwiYjE1OTFlMTRlZGE3MWIzOWY3NmNcIixcIjIwNzFcIjpcIjA2NTFhZTg1Y2YwODBjMzE4OTM1XCIsXCIyMTUzXCI6XCJhYTUzOGExZDMwMTk1OTZlZTE2MFwiLFwiMjI0NlwiOlwiNzhmZGFhOWExMDQ5MDE5ODg5Y2RcIixcIjIyNjhcIjpcIjllYzlkZmY5ODcxYmE1N2Q3YTI2XCIsXCIyMzA0XCI6XCJjYmMxMTZmY2QzZDdiMTM1ZTRmZlwiLFwiMjQxMFwiOlwiMGZiZWI2ZmYxMDQ5MDlhZDc4NjJcIixcIjI0MjNcIjpcIjM2NzNhODEyZjMyNzQyODlkZjEyXCIsXCIyNDc0XCI6XCIwY2M0ZDZlNzQ4MzhhNTY1NTkyYlwiLFwiMjUxMlwiOlwiM2E5MTVlYzE1ZDg1YTdjZWJiNzBcIixcIjI1NDFcIjpcIjA3Y2U4ZjVjNDhiM2Y0MWUxMDJjXCIsXCIyNTU1XCI6XCJkOGE5YzkzZGQ2OWI1NzE0MjEwMlwiLFwiMjU2OVwiOlwiN2FjMzczMTkzMjMyNWYwYjZmZmRcIixcIjI2MDVcIjpcIjgxMzVlNTcxMWI2ZmRmYzA3YTc2XCIsXCIyNjEwXCI6XCJmYjc0OTU4NTI0MGYyOGZhZTA5M1wiLFwiMjYzOVwiOlwiMTlhNjJmMzU4NTE3ZDYwNDQxNjBcIixcIjI2NDJcIjpcIjNmOGFlZWYxNjQwOTUzYjEyM2NiXCIsXCIyNzgyXCI6XCI3ZDI3YTM4ZWM1ZjI0NTJiNmMxN1wiLFwiMjg2MlwiOlwiZjNhNjg5MjQxOWNiYzIzN2I3OTFcIixcIjI4NzRcIjpcIjI3ZjYzNTIyYzgzZjYwN2MzM2UwXCIsXCIyOTA4XCI6XCIyOTgzNjFkYTEwMDZkN2IxY2ZiNVwiLFwiMjk3OVwiOlwiNTNkZTBhNzUxY2E0OWFlMTg5YWVcIixcIjI5ODRcIjpcImQ0ZmUyMDYxZTg5NzllNmU5OTE4XCIsXCIzMDE2XCI6XCI1NWNhNzNiNTZjMjM4ZDMyNTliMVwiLFwiMzEzMFwiOlwiMTZmM2MwMzZhYTQwN2VmZDI0NDlcIixcIjMyNjdcIjpcImVlYzQxMGJmMWZhMmEwZjY4MzEyXCIsXCIzMzExXCI6XCI2ZmRmYmVkMWI0ODQyOTQ5MzE3YVwiLFwiMzM1M1wiOlwiNGRmZjlkOWVjZjFhYWQ5NTYzYTlcIixcIjM0NDBcIjpcIjAwOTVjZjlkYmRmNTlmZjkyZDBjXCIsXCIzNTY5XCI6XCJkY2U2ODMxNzQyZWY0ZTY0OTMxMVwiLFwiMzY1NFwiOlwiNWU2OGIyOWQxMDUzNTIyYzk4YzRcIixcIjM3MDFcIjpcImI5OTY5NDY2MDQ2MDM0NDBhNzQzXCIsXCIzNzMwXCI6XCI0NDUxNzQwOTJjMDhlOWEwOGY1YVwiLFwiMzc0NVwiOlwiNjc2MzEwOTFlYzQxZmRmMmQzYWFcIixcIjM4NDRcIjpcIjM4NDgxMmY5ZjVjZDczYzE4ZGJhXCIsXCI0MDI0XCI6XCJhY2FkZGMyZDI2NzE3MGUxNzVhOVwiLFwiNDE0N1wiOlwiOGU1MDQ3ZTM5NjU0OWMyOTk3ZGVcIixcIjQyMTBcIjpcImM4NzVmZTRkMTY5YjRmZDNmZjQwXCIsXCI0MjI2XCI6XCJjNjc3YmE1NjYzYzgwZmM1YzViNFwiLFwiNDIzN1wiOlwiMjk2MWI0NzZlZmIwN2Y2ZDZkNzZcIixcIjQyNjJcIjpcIjJlNWFjYTAyYTA0Yjk3NDJlMjczXCIsXCI0NDMxXCI6XCI0MjczMGEyZmZiMDljNjJkYjMyOFwiLFwiNDUxOFwiOlwiOTgzMzcwZmEwOTkwZGM5OWJhODlcIixcIjQ1MjFcIjpcIjkzYjk3ZjY4MmExZjQzYzZjNGQ2XCIsXCI0NTIyXCI6XCI3NzU3ZDBkNWRhNDc0NDUyZmFkM1wiLFwiNDU4MVwiOlwiOTliOTQ1MTZjMmU3MzE3OTU2ODBcIixcIjQ3MjhcIjpcIjczNzY3M2UzM2QwMWRlYTllZjUxXCIsXCI0ODIwXCI6XCIyOTVkNjk3MGMwMWVlODVmOWVhNFwiLFwiNDg4NVwiOlwiMzhkYzYwZTBlYjZkNGY0ZTRlYTBcIixcIjQ4ODZcIjpcIjUwZmE0ZTQ1M2M4ZDA5YjhkOGM4XCIsXCI1MDM1XCI6XCIxZjRmMGY3ZjBiMzVlZDFjNjNjMFwiLFwiNTA2MVwiOlwiZWMyMzQ2ZThiZTg0OGVjMTU3ZTdcIixcIjUxODFcIjpcIjI3MWY5NWYzMWZlMDRhOWM5NDNhXCIsXCI1Mjg0XCI6XCIxZjllNDA1NDAxZDRjYzMyNjA0NFwiLFwiNTI5M1wiOlwiNmM1ODM2YzViM2IwNWM3MjFiMDNcIixcIjUzMjhcIjpcImZjYjMwYTExMTAwMTJjMWMwOWViXCIsXCI1MzYyXCI6XCJiZmQ5MzE5MjFmM2I1YTU5YTEzN1wiLFwiNTQyNFwiOlwiNDI5MDljMTJiOGVhYjFkZjA0NTNcIixcIjU0NTlcIjpcIjY1NDJmOTBiN2IxMTdlMDVkMmNmXCIsXCI1NTg1XCI6XCI2NTlkZDk1NDdiMjE5ZDdmNzQzM1wiLFwiNTYwMFwiOlwiYmRhNjEwZmJjOTEyNWUyZWE0NjVcIixcIjU3MDNcIjpcIjdiZDkzYzk1YzNjODRmYmE1YTQ2XCIsXCI1NzExXCI6XCJiMDEzYTI3MjgxYWU1MzgwOTc1YVwiLFwiNTczNVwiOlwiZGI5MzAzZDJlMzY4N2I2ZjM5OGFcIixcIjU3NDFcIjpcImY0NWFkMjZhZDZiZWI5NWYxMDZmXCIsXCI1NzY0XCI6XCIzMGVlZGRjMjVhNjRiMzczMTZmY1wiLFwiNTgzNlwiOlwiYTg0ZmI3ZDhkMzRjYjBmNGQ5MzNcIixcIjU4NjhcIjpcIjMyOGE3MDU4NzI5MTk1YjM0MjliXCIsXCI1ODk0XCI6XCJhYjYxOWI5ZDZmMTcyODVlMzk0M1wiLFwiNTk5NlwiOlwiM2Y3Y2I5ZTdmZmZlMDdiNmM0YWVcIixcIjYwMThcIjpcImQyNjBkYjU1MDY4YjQwY2FhYjk0XCIsXCI2MTQ5XCI6XCI2ZmIwMDYxZDIyNDcxMTlmMTk5MFwiLFwiNjE1NlwiOlwiOWI4ZTlmZTZiZWNiYWExY2VmNGRcIixcIjYyMjhcIjpcIjVjNDhlY2VmMzUwMzkyNTFmYmVkXCIsXCI2MjUyXCI6XCI1NmUzMDA1OGMwMzNmYTgyZTVhY1wiLFwiNjI1N1wiOlwiYTk1MzQ2YWMxNWQzNjhjZDY4YjdcIixcIjYzMDJcIjpcIjJlOGMxYTI4YjM5YmE5OTBkYzQyXCIsXCI2NTI4XCI6XCJhMDMyZjk5NGJiZTllZTY0ODAwYlwiLFwiNjYzOFwiOlwiYmFlNTQyNGFhZjI5ZDgyODBhNzBcIixcIjY2NzRcIjpcIjlhZTUxZjBjNmE0ZWZiNTg0MTBmXCIsXCI2Njc4XCI6XCJhNjJjNDI3NWNjNTAyZTQxODQyNFwiLFwiNjcwNVwiOlwiMDYzOGE3OWJhYmI1NDNhYTdjODVcIixcIjY3MzlcIjpcIjg1NmI2MDA0M2Q4N2JmMjRlMDJjXCIsXCI2ODgwXCI6XCI5ZTMzMGM2NjMwY2VlY2I4OTI0YlwiLFwiNjg5OVwiOlwiZjkyYTQ1MjgxM2NkZTQyMDIxMmRcIixcIjY5NzVcIjpcImFlMjFlNTQyOGEyYWIxYTM4Yjk3XCIsXCI3MDk3XCI6XCI0NDgyZWJjNzVlNTkxMWRlMjNlNlwiLFwiNzEwOVwiOlwiYjY5NTRjYzkxY2VjNWNlNWI2MjVcIixcIjcxMjBcIjpcIjAyMDQ0ZGZkY2I0Y2Y4YWMxY2EwXCIsXCI3MTc2XCI6XCJhODA3MzhkMTE3MDdmZTllZmM4MVwiLFwiNzE4NlwiOlwiYTgzM2E1MWMwNTg1YmUzYjRhZDBcIixcIjcyNTFcIjpcIjY1YTM0ZWI3MzVkMjZlNDQ0Mjg0XCIsXCI3NTExXCI6XCJkMjdiN2NhNzhjMDNlNzhjMzgwMlwiLFwiNzU0N1wiOlwiZjg5M2ExOTEwOWQyNmM2ZjhiOTJcIixcIjc1NTFcIjpcIjhjODUxZWRhYzM1MmI3NjI3YTFlXCIsXCI3NTg4XCI6XCIxNDAwZWQxNzM3NDQzZDJkNDY4ZVwiLFwiNzYwOVwiOlwiNTVmMDQ3NTJlMzQyMjQ1ZDk3MWJcIixcIjc3MzVcIjpcIjQ5YTFjZTY0NzE5ZDgxYzA3ZDI5XCIsXCI3NzczXCI6XCJjZDM2NDdmYWVkOWU0YzAzMWFiMFwiLFwiNzc3NFwiOlwiYmVhYzhjMmQxNDViNzQ2MWNjYzFcIixcIjc3ODFcIjpcImNmOGMxMzI1ZWI2NTkwZmZmMjljXCIsXCI3ODI1XCI6XCIwMWNhNmM2MDljZDYwYjZjZDA2OVwiLFwiNzg0NlwiOlwiYWRkNjlkYmE0M2IxYzM4ZDg4NGRcIixcIjc5MDFcIjpcImUzZTkxOTM2YWY3Yjg2ZWMzMWViXCIsXCI4MDczXCI6XCI0NDc2NzY3YjVhY2YxMGJlNGM5MFwiLFwiODI0NFwiOlwiMDFjNmIyZTcyOTQ4ZmNiMTg4ZDJcIixcIjg0MzNcIjpcIjYwNWJiZDRkNjA3NWY2ODA1NDNlXCIsXCI4NTY5XCI6XCI5MzcwZTIwZTdjYzRhMGU4OGE3OFwiLFwiODcwNlwiOlwiYjRiOGI4YjM2ZWY0ZTNmZDk2YWRcIixcIjg3MTJcIjpcIjMzODM0NDcyNjA3NDliOGNlM2E5XCIsXCI4NzYyXCI6XCI0MmYwZDk0ZDYyY2RkMjc2ODY5MlwiLFwiODg4OVwiOlwiM2Q0YzMxZjBkMTJjNjI1ZjBiMGNcIixcIjg5MjhcIjpcIjYzNjgwNmE5NmJhYTYzMzUwYmY3XCIsXCI4OTY0XCI6XCJkMWY2YTdkZWJiNTRmYmI4MGVhZVwiLFwiOTE2MVwiOlwiODQ2YzkxMmFjMjE1N2RjZTdjMjhcIixcIjk0MTZcIjpcIjEwNzA1Y2EzYWIxOTM0MTkwNTkwXCIsXCI5NjIxXCI6XCI5NzAwN2ViOThlZmY0MTA4YzdlNlwiLFwiOTYyNlwiOlwiOTdjYjgyNTExZTgxMTU1ZmQzOTdcIixcIjk3MDFcIjpcImU4YzRkMDExMmJiZDBlZGM4ZmVkXCJ9W2NodW5rSWRdICsgXCIuanNcIjtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsInZhciBpblByb2dyZXNzID0ge307XG52YXIgZGF0YVdlYnBhY2tQcmVmaXggPSBcImd1aXYyOlwiO1xuLy8gbG9hZFNjcmlwdCBmdW5jdGlvbiB0byBsb2FkIGEgc2NyaXB0IHZpYSBzY3JpcHQgdGFnXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmwgPSAodXJsLCBkb25lLCBrZXksIGNodW5rSWQpID0+IHtcblx0aWYoaW5Qcm9ncmVzc1t1cmxdKSB7IGluUHJvZ3Jlc3NbdXJsXS5wdXNoKGRvbmUpOyByZXR1cm47IH1cblx0dmFyIHNjcmlwdCwgbmVlZEF0dGFjaDtcblx0aWYoa2V5ICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpO1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBzY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgcyA9IHNjcmlwdHNbaV07XG5cdFx0XHRpZihzLmdldEF0dHJpYnV0ZShcInNyY1wiKSA9PSB1cmwgfHwgcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXdlYnBhY2tcIikgPT0gZGF0YVdlYnBhY2tQcmVmaXggKyBrZXkpIHsgc2NyaXB0ID0gczsgYnJlYWs7IH1cblx0XHR9XG5cdH1cblx0aWYoIXNjcmlwdCkge1xuXHRcdG5lZWRBdHRhY2ggPSB0cnVlO1xuXHRcdHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXG5cdFx0c2NyaXB0LmNoYXJzZXQgPSAndXRmLTgnO1xuXHRcdGlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLm5jKSB7XG5cdFx0XHRzY3JpcHQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgX193ZWJwYWNrX3JlcXVpcmVfXy5uYyk7XG5cdFx0fVxuXHRcdHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXdlYnBhY2tcIiwgZGF0YVdlYnBhY2tQcmVmaXggKyBrZXkpO1xuXG5cdFx0c2NyaXB0LnNyYyA9IHVybDtcblx0fVxuXHRpblByb2dyZXNzW3VybF0gPSBbZG9uZV07XG5cdHZhciBvblNjcmlwdENvbXBsZXRlID0gKHByZXYsIGV2ZW50KSA9PiB7XG5cdFx0Ly8gYXZvaWQgbWVtIGxlYWtzIGluIElFLlxuXHRcdHNjcmlwdC5vbmVycm9yID0gc2NyaXB0Lm9ubG9hZCA9IG51bGw7XG5cdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXHRcdHZhciBkb25lRm5zID0gaW5Qcm9ncmVzc1t1cmxdO1xuXHRcdGRlbGV0ZSBpblByb2dyZXNzW3VybF07XG5cdFx0c2NyaXB0LnBhcmVudE5vZGUgJiYgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcblx0XHRkb25lRm5zICYmIGRvbmVGbnMuZm9yRWFjaCgoZm4pID0+IChmbihldmVudCkpKTtcblx0XHRpZihwcmV2KSByZXR1cm4gcHJldihldmVudCk7XG5cdH1cblx0dmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KG9uU2NyaXB0Q29tcGxldGUuYmluZChudWxsLCB1bmRlZmluZWQsIHsgdHlwZTogJ3RpbWVvdXQnLCB0YXJnZXQ6IHNjcmlwdCB9KSwgMTIwMDAwKTtcblx0c2NyaXB0Lm9uZXJyb3IgPSBvblNjcmlwdENvbXBsZXRlLmJpbmQobnVsbCwgc2NyaXB0Lm9uZXJyb3IpO1xuXHRzY3JpcHQub25sb2FkID0gb25TY3JpcHRDb21wbGV0ZS5iaW5kKG51bGwsIHNjcmlwdC5vbmxvYWQpO1xuXHRuZWVkQXR0YWNoICYmIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbn07IiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCIuL1wiOyIsIl9fd2VicGFja19yZXF1aXJlX18uYiA9ICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmJhc2VVUkkpIHx8IHNlbGYubG9jYXRpb24uaHJlZjtcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHQ5MTIxOiAwXG59O1xuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmYuaiA9IChjaHVua0lkLCBwcm9taXNlcykgPT4ge1xuXHRcdC8vIEpTT05QIGNodW5rIGxvYWRpbmcgZm9yIGphdmFzY3JpcHRcblx0XHR2YXIgaW5zdGFsbGVkQ2h1bmtEYXRhID0gX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgPyBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gOiB1bmRlZmluZWQ7XG5cdFx0aWYoaW5zdGFsbGVkQ2h1bmtEYXRhICE9PSAwKSB7IC8vIDAgbWVhbnMgXCJhbHJlYWR5IGluc3RhbGxlZFwiLlxuXG5cdFx0XHQvLyBhIFByb21pc2UgbWVhbnMgXCJjdXJyZW50bHkgbG9hZGluZ1wiLlxuXHRcdFx0aWYoaW5zdGFsbGVkQ2h1bmtEYXRhKSB7XG5cdFx0XHRcdHByb21pc2VzLnB1c2goaW5zdGFsbGVkQ2h1bmtEYXRhWzJdKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmKDkxMjEgIT0gY2h1bmtJZCkge1xuXHRcdFx0XHRcdC8vIHNldHVwIFByb21pc2UgaW4gY2h1bmsgY2FjaGVcblx0XHRcdFx0XHR2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IChpbnN0YWxsZWRDaHVua0RhdGEgPSBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSBbcmVzb2x2ZSwgcmVqZWN0XSkpO1xuXHRcdFx0XHRcdHByb21pc2VzLnB1c2goaW5zdGFsbGVkQ2h1bmtEYXRhWzJdID0gcHJvbWlzZSk7XG5cblx0XHRcdFx0XHQvLyBzdGFydCBjaHVuayBsb2FkaW5nXG5cdFx0XHRcdFx0dmFyIHVybCA9IF9fd2VicGFja19yZXF1aXJlX18ucCArIF9fd2VicGFja19yZXF1aXJlX18udShjaHVua0lkKTtcblx0XHRcdFx0XHQvLyBjcmVhdGUgZXJyb3IgYmVmb3JlIHN0YWNrIHVud291bmQgdG8gZ2V0IHVzZWZ1bCBzdGFja3RyYWNlIGxhdGVyXG5cdFx0XHRcdFx0dmFyIGVycm9yID0gbmV3IEVycm9yKCk7XG5cdFx0XHRcdFx0dmFyIGxvYWRpbmdFbmRlZCA9IChldmVudCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkpIHtcblx0XHRcdFx0XHRcdFx0aW5zdGFsbGVkQ2h1bmtEYXRhID0gaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdO1xuXHRcdFx0XHRcdFx0XHRpZihpbnN0YWxsZWRDaHVua0RhdGEgIT09IDApIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdFx0aWYoaW5zdGFsbGVkQ2h1bmtEYXRhKSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIGVycm9yVHlwZSA9IGV2ZW50ICYmIChldmVudC50eXBlID09PSAnbG9hZCcgPyAnbWlzc2luZycgOiBldmVudC50eXBlKTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgcmVhbFNyYyA9IGV2ZW50ICYmIGV2ZW50LnRhcmdldCAmJiBldmVudC50YXJnZXQuc3JjO1xuXHRcdFx0XHRcdFx0XHRcdGVycm9yLm1lc3NhZ2UgPSAnTG9hZGluZyBjaHVuayAnICsgY2h1bmtJZCArICcgZmFpbGVkLlxcbignICsgZXJyb3JUeXBlICsgJzogJyArIHJlYWxTcmMgKyAnKSc7XG5cdFx0XHRcdFx0XHRcdFx0ZXJyb3IubmFtZSA9ICdDaHVua0xvYWRFcnJvcic7XG5cdFx0XHRcdFx0XHRcdFx0ZXJyb3IudHlwZSA9IGVycm9yVHlwZTtcblx0XHRcdFx0XHRcdFx0XHRlcnJvci5yZXF1ZXN0ID0gcmVhbFNyYztcblx0XHRcdFx0XHRcdFx0XHRpbnN0YWxsZWRDaHVua0RhdGFbMV0oZXJyb3IpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmwodXJsLCBsb2FkaW5nRW5kZWQsIFwiY2h1bmstXCIgKyBjaHVua0lkLCBjaHVua0lkKTtcblx0XHRcdFx0fSBlbHNlIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IDA7XG5cdFx0XHR9XG5cdFx0fVxufTtcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBnbG9iYWxbXCJ3ZWJwYWNrQ2h1bmtndWl2MlwiXSA9IGdsb2JhbFtcIndlYnBhY2tDaHVua2d1aXYyXCJdIHx8IFtdO1xuY2h1bmtMb2FkaW5nR2xvYmFsLmZvckVhY2god2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCAwKSk7XG5jaHVua0xvYWRpbmdHbG9iYWwucHVzaCA9IHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2guYmluZChjaHVua0xvYWRpbmdHbG9iYWwpKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm5jID0gdW5kZWZpbmVkOyIsIiIsIiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==