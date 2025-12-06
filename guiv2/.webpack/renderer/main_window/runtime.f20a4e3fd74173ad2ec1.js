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
/******/ 			return "" + ({"3051":"discovery-18377601","5585":"migration","7655":"discovery-0dbddc7c","8037":"discovery-ddb7e021"}[chunkId] || chunkId) + "." + {"29":"e84515d0acad57d8da43","94":"356c82c412792b20cccb","144":"7b1e3440a733daf4a050","146":"e85a58d1aa314a14c069","221":"d303cc6fec45c11aa435","279":"6e97d4105952b07952df","301":"bd7f0607469522be416b","310":"3b51f4c37c8a05979bf8","432":"5e794001d1bafa3aab0f","513":"1db47db0a5cd993c2a20","603":"9a07963ce7755314a01e","690":"7001b5e0e0930e21ba4d","749":"9b6bc0535957801dc83b","850":"cfba2ace401e67fae67d","1019":"eb4b23321392779f4273","1050":"6ecd6be3b6ba12602b48","1087":"29170a0c661ac912af33","1104":"e78c137a338bf31101ca","1172":"c1b2d0f97b7ca0a10102","1173":"7cbe650311af0ff8cd1d","1177":"f86da86106413cb4fdee","1272":"7cdd6308282390284f72","1321":"37a2d21ad1a6563854f3","1323":"e20fa7dfd928f8b14942","1569":"43a42bbfa839b2e54a59","1623":"6a202812c2a3b3b61565","1695":"cd75ddcd260d12d3b0de","1766":"5de1cabfdb05a5660f7d","1777":"d2e4d30cc6b6118a53ea","1826":"a77eaeb1e339fdcb1a84","1923":"32d8aa08639d09facd65","1981":"18c358061ae957e4db0f","2046":"1a45742407a84e5fe164","2071":"43857f06ce1e08b5b278","2153":"8908e2e45f44be5593e3","2246":"85f9f6ab6f9e7faffd0a","2268":"b3fa43b969542f4378e4","2304":"cf888232b41b3e09ff54","2410":"b8679ab1147adb2485a2","2423":"67d600f7ea05223d749f","2474":"a8823dbf10f9640b0dc9","2512":"a0decb4123c888ba1f97","2541":"18f870c70f2f9b82c7c5","2555":"3b9f5fa2162e1da7c34d","2569":"2807ebcc442378f0670f","2605":"01bfc12d435220cb264d","2610":"9f7aa1c76d6c297b9789","2639":"b80ac62221cb10dba0f9","2642":"912afcf745ac4be48388","2782":"d8947c979831a1316896","2862":"4eece5091f76c0604417","2874":"610386f99933e14ab783","2908":"b5499bf83034de3c9c25","2979":"03c954c945eb032ad591","2984":"477671e67b3040a7ab95","3016":"909426d2bea808bba3ce","3051":"f272b1cb666a23e41e9f","3130":"69be2dc74adcfbd6aa92","3311":"22752b3047bbd0a225bc","3353":"8e2fcf541200fef3c70c","3440":"cf53a03380c1cad22157","3569":"d5ae7819431d70c3aff6","3654":"37492274332c9b6ab75a","3730":"d735b3bf20810f366082","3745":"70c524797cbe90cf3d2e","3844":"35c8d006a6fd3528e88c","4024":"890d03449293e452008a","4147":"dbc254a4ae8ce65e53ec","4210":"903968857c0ed6d70266","4226":"db01b7d448051502d150","4262":"a99d2cd5fed15ea99cb7","4431":"cc70a338277089caf930","4499":"228f490218c7725b455d","4518":"282f5db4f03cc8b161f1","4521":"abf9003c8bd9cf421d81","4522":"29453402d7a2ee89435b","4581":"2473d2259d13996d6fc7","4728":"e14e9be94fb6b0afab44","4820":"2252071193c8169b30a4","4885":"508fbb12d7956d356dde","4886":"51f5d0230f25b30ed413","5035":"8e77a26c596cdcec5120","5061":"799e73b35baa6470d2b4","5181":"6fc7f3aa1226b5822588","5284":"5afb50389be9be6a217a","5293":"2297f618e9c0d13c20e0","5328":"9e0a1f0286d8483b6727","5362":"b62c884b1a5b2466d4bb","5369":"3c9bca370fecc27c63bf","5424":"aa0a402ba383ce0bb777","5459":"92901ab0860d41c7c0bc","5585":"c3569a2724c8684dd6d2","5600":"aad36ed721904884d858","5648":"1b59d6ad9de6d50727fa","5703":"9f3ff473fa9028e04f9f","5711":"08ff800a2cbac9b9dda7","5735":"cefb758589f25ce3b93a","5741":"743704ec1425494b4c25","5764":"eb4729752304a85ae2df","5836":"5b76190ecd0c20985e4b","5868":"b32ca4971a03338d0928","5894":"616b993e2ce3ca38c360","5996":"832e4bb47c3c54f6f828","6018":"b39375ffe1e3898b2360","6149":"c61c6dac31261b37fb51","6156":"92520efb3e4cf719873e","6228":"35445278ff287f14c866","6252":"a0310e97491a12638e0d","6257":"04f655a5d64a73f22367","6302":"d1c51700d378fa50b55f","6528":"e810388aa1146f8c009b","6638":"ffeace5d5dabf2ad0596","6674":"8b23bf6f91904b897709","6678":"df78458b84d10950af6f","6705":"6671b734f66a5a808ea9","6739":"0d301d2b6e9842107054","6975":"39e17e097c9acb4ce6d7","7097":"94ca2ccec39f63dfff42","7109":"96da8ccb63242387d33c","7120":"46a1363cd189804ec5a7","7176":"6c00949f6b9305f5dd31","7186":"30990d811372a682bbfb","7251":"f9e6a3e25dd3b05385f2","7511":"5deb063238b5410b6077","7547":"be58339f5fde62039576","7551":"795875a3a992311f75c0","7588":"4ace5755e6a6f8db70a2","7609":"d869c77dbbfb96778da4","7655":"3b8121e131b0e6b84d42","7735":"66e584cae7072d62ce27","7773":"839fa59f76c1a31bb49e","7774":"5235e66b3e293477cc7f","7781":"c75501a3020180999d65","7825":"8c8d320f5ea405283418","7846":"3cc776eef9cfc0267398","7901":"64850c4c9b42e09f0acd","8037":"88ee87c11adf3d910884","8073":"410cd9aea9369966932b","8244":"53f216736a832a21e035","8433":"744606f22092b61f5fe7","8569":"55dc15beea92c4acfe84","8706":"d7e81e81380807308f19","8712":"3feacd7696d5450bb847","8762":"bd428911819ae9b94252","8889":"f917b64da116b4d2b916","8928":"38590804372cc1c058ac","8964":"b3d600632af73cfc7b04","9161":"1b83fdeaa2139ad10e74","9280":"756b412533435e799133","9416":"444702c1551074e0a713","9621":"4609f2b230b8e7970ed3","9626":"ff2ff0c7b62e83e7edac","9701":"e74e08ee4482e09c8567"}[chunkId] + ".js";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS41NGQwOTI3Yzk1ZWUyNTBjYzY0OS5qcyIsIm1hcHBpbmdzIjoiOzs7O1VBQUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOzs7OztXQ3pCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLCtCQUErQix3Q0FBd0M7V0FDdkU7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQkFBaUIscUJBQXFCO1dBQ3RDO1dBQ0E7V0FDQSxrQkFBa0IscUJBQXFCO1dBQ3ZDO1dBQ0E7V0FDQSxLQUFLO1dBQ0w7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEU7Ozs7O1dDM0JBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBLEU7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esc0RBQXNEO1dBQ3RELHNDQUFzQyxtR0FBbUc7V0FDekk7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEU7Ozs7O1dDekJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEVBQUU7V0FDRixFOzs7OztXQ1JBO1dBQ0E7V0FDQTtXQUNBLGVBQWUsdUdBQXVHLCtCQUErQiw4OUlBQTg5STtXQUNubkosRTs7Ozs7V0NKQSx3Rjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHVCQUF1Qiw0QkFBNEI7V0FDbkQ7V0FDQTtXQUNBO1dBQ0EsaUJBQWlCLG9CQUFvQjtXQUNyQztXQUNBLG1HQUFtRyxZQUFZO1dBQy9HO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLG1FQUFtRSxpQ0FBaUM7V0FDcEc7V0FDQTtXQUNBO1dBQ0EsRTs7Ozs7V0N4Q0E7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7O1dDTkEsNkI7Ozs7O1dDQUE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQzs7V0FFakM7V0FDQTtXQUNBO1dBQ0EsS0FBSztXQUNMO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNO1dBQ047V0FDQTtXQUNBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU0scUJBQXFCO1dBQzNCO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBLDRHOzs7OztXQ3JGQSxtQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svcnVudGltZS9jaHVuayBsb2FkZWQiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2NyZWF0ZSBmYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svcnVudGltZS9lbnN1cmUgY2h1bmsiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2dldCBqYXZhc2NyaXB0IGNodW5rIGZpbGVuYW1lIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2xvYWQgc2NyaXB0Iiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL25vbmNlIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldID0gZGVmZXJyZWRbaV07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwidmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mID8gKG9iaikgPT4gKE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopKSA6IChvYmopID0+IChvYmouX19wcm90b19fKTtcbnZhciBsZWFmUHJvdG90eXBlcztcbi8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuLy8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4vLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbi8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuLy8gbW9kZSAmIDE2OiByZXR1cm4gdmFsdWUgd2hlbiBpdCdzIFByb21pc2UtbGlrZVxuLy8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuX193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcblx0aWYobW9kZSAmIDEpIHZhbHVlID0gdGhpcyh2YWx1ZSk7XG5cdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG5cdGlmKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUpIHtcblx0XHRpZigobW9kZSAmIDQpICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcblx0XHRpZigobW9kZSAmIDE2KSAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHZhbHVlO1xuXHR9XG5cdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG5cdHZhciBkZWYgPSB7fTtcblx0bGVhZlByb3RvdHlwZXMgPSBsZWFmUHJvdG90eXBlcyB8fCBbbnVsbCwgZ2V0UHJvdG8oe30pLCBnZXRQcm90byhbXSksIGdldFByb3RvKGdldFByb3RvKV07XG5cdGZvcih2YXIgY3VycmVudCA9IG1vZGUgJiAyICYmIHZhbHVlOyAodHlwZW9mIGN1cnJlbnQgPT0gJ29iamVjdCcgfHwgdHlwZW9mIGN1cnJlbnQgPT0gJ2Z1bmN0aW9uJykgJiYgIX5sZWFmUHJvdG90eXBlcy5pbmRleE9mKGN1cnJlbnQpOyBjdXJyZW50ID0gZ2V0UHJvdG8oY3VycmVudCkpIHtcblx0XHRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjdXJyZW50KS5mb3JFYWNoKChrZXkpID0+IChkZWZba2V5XSA9ICgpID0+ICh2YWx1ZVtrZXldKSkpO1xuXHR9XG5cdGRlZlsnZGVmYXVsdCddID0gKCkgPT4gKHZhbHVlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBkZWYpO1xuXHRyZXR1cm4gbnM7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZiA9IHt9O1xuLy8gVGhpcyBmaWxlIGNvbnRhaW5zIG9ubHkgdGhlIGVudHJ5IGNodW5rLlxuLy8gVGhlIGNodW5rIGxvYWRpbmcgZnVuY3Rpb24gZm9yIGFkZGl0aW9uYWwgY2h1bmtzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmUgPSAoY2h1bmtJZCkgPT4ge1xuXHRyZXR1cm4gUHJvbWlzZS5hbGwoT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5mKS5yZWR1Y2UoKHByb21pc2VzLCBrZXkpID0+IHtcblx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmZba2V5XShjaHVua0lkLCBwcm9taXNlcyk7XG5cdFx0cmV0dXJuIHByb21pc2VzO1xuXHR9LCBbXSkpO1xufTsiLCIvLyBUaGlzIGZ1bmN0aW9uIGFsbG93IHRvIHJlZmVyZW5jZSBhc3luYyBjaHVua3Ncbl9fd2VicGFja19yZXF1aXJlX18udSA9IChjaHVua0lkKSA9PiB7XG5cdC8vIHJldHVybiB1cmwgZm9yIGZpbGVuYW1lcyBiYXNlZCBvbiB0ZW1wbGF0ZVxuXHRyZXR1cm4gXCJcIiArICh7XCIzMDUxXCI6XCJkaXNjb3ZlcnktMTgzNzc2MDFcIixcIjU1ODVcIjpcIm1pZ3JhdGlvblwiLFwiNzY1NVwiOlwiZGlzY292ZXJ5LTBkYmRkYzdjXCIsXCI4MDM3XCI6XCJkaXNjb3ZlcnktZGRiN2UwMjFcIn1bY2h1bmtJZF0gfHwgY2h1bmtJZCkgKyBcIi5cIiArIHtcIjI5XCI6XCI1YjgzYzA0NGNhNDZhZjEzMDIzZlwiLFwiOTRcIjpcImZkYzY2OTNiYTc1Zjk1NjZmNjEzXCIsXCIxNDRcIjpcImZkNTlmOWUyMDU4YTE2MDVlZDc0XCIsXCIxNDZcIjpcIjAyMjcyOTAwMjM2Y2ZmOTBlMDdmXCIsXCIyMjFcIjpcImQ2NzYxZmMwMGIzY2FiN2Q1ZmI2XCIsXCIyNzlcIjpcImRmM2I2NDg2ZWU2MjUzZjA0NGY3XCIsXCIzMDFcIjpcIjI0ZDRmMDQ3YjFkMTg1NDk0NDQxXCIsXCIzMTBcIjpcImZlMTU1MzBkZmFjYzk3YjAzYTZiXCIsXCI0MzJcIjpcIjIyMzY3Y2VkMTkyNjQ1ODMzNmU1XCIsXCI1MTNcIjpcIjY3YTRjNzNiNGQ1ODQ5MGZkNzU4XCIsXCI2MDNcIjpcIjIyMjBjZWUyODMxYThhZWVkNDEwXCIsXCI2OTBcIjpcIjM0NTkyMjRmYTQ2ODA3ZWI4YjI2XCIsXCI3NDlcIjpcImFlZTdlMDNmZDNhMjljYTU5ZTliXCIsXCI4NTBcIjpcIjNmMWZlNjNhMWVlNTBjNmIyNDNlXCIsXCIxMDE5XCI6XCI3NzBkOTNhMWRlMjY1MGM2NzljZFwiLFwiMTA1MFwiOlwiYzgwN2JlMWNhNzAxMjM4NzU2ZTNcIixcIjEwODdcIjpcIjkxNTE0OTk4NGFlNTNlNTg1NGU4XCIsXCIxMTA0XCI6XCI5MjBhNjJkMmY3YzRhZjEyMmVlMlwiLFwiMTE3MlwiOlwiYWI0MTdlYjU2NDM5MWM0MzExMThcIixcIjExNzNcIjpcImIzNzk5NDhjNTNmNjkzNGY0MmRiXCIsXCIxMTc3XCI6XCJmMzc2YjU5YTI3ZGExNjRjYjM1OVwiLFwiMTI3MlwiOlwiNDhmMWFmNTU2NmY2MTgzYjJmOGJcIixcIjEzMjFcIjpcIjZkODFlYThhNzFkZTU2MzM4ZWRhXCIsXCIxMzIzXCI6XCJjYTg2MjNhZjVjODk2ZTg1YjEwMFwiLFwiMTU2OVwiOlwiODBkZDk0YmNhODMxM2RhN2FlZGZcIixcIjE2MjNcIjpcIjUyNDNhYjIzYTMxYTRhMDRlMmJjXCIsXCIxNjk1XCI6XCI0M2ZiNzE5NDBjNjQxMmY2MTI3M1wiLFwiMTc2NlwiOlwiMWQxZDEzMGM3NTA3YWU3NWIxYTBcIixcIjE3NzdcIjpcImFmZmVlYzdjN2YxNTk5NDZjOGMzXCIsXCIxODI2XCI6XCJhNWMzMjI0ZTlmMzAxNTI3ZGUwY1wiLFwiMTkyM1wiOlwiYmZmMDY2YTI0ZWMwMjkxMWFjNjJcIixcIjE5ODFcIjpcImIyMGY3YTNhZjZhODhkYTBjZDY2XCIsXCIyMDQ2XCI6XCI3Yjc4M2EzZGEzYjVkNDM1NGU0ZFwiLFwiMjA3MVwiOlwiMjVkNjdjYWYxZDVlM2JhZDdlZGJcIixcIjIxNTNcIjpcIjBkOTliMDA5ODQzZTk2MTI5Y2Y4XCIsXCIyMjQ2XCI6XCJjYTYzYzc2NTIzMTJiOTIyYmQ5ZVwiLFwiMjI2OFwiOlwiMTU2YmRmOWQ0NjU4ZDM1NzAyYWNcIixcIjIzMDRcIjpcIjVkNzc0OWU4NzM4NjlkMjI3MmRmXCIsXCIyNDEwXCI6XCIwMmVjOTFjN2RmNjMwOWY4MDg0YlwiLFwiMjQyM1wiOlwiZTBlYmNjZGMyNTEzMTE1YTZlYjdcIixcIjI0NzRcIjpcImVkY2FiMGY0MTdiMzdmOTdhN2RkXCIsXCIyNTEyXCI6XCI1MmE1YWFkMmMzMDAxZWYxNDc2N1wiLFwiMjU0MVwiOlwiMWYwOGNjYWVkYWRkZGJlYjNmMTdcIixcIjI1NTVcIjpcImQ2NjQ4YWVmNjY2NWUyMGFjYmUzXCIsXCIyNTY5XCI6XCI4MWEyYWJiYzVlN2UwZmI2MmFlNlwiLFwiMjYwNVwiOlwiNTk0ZWRjOGE1NTNiZWU3YmMyNDJcIixcIjI2MTBcIjpcIjA5ODQ0NzYzZGUzYWZlMWM4ZTBlXCIsXCIyNjM5XCI6XCI0MDQ5NjAzNTg1YTFhZTgwMGJlYVwiLFwiMjY0MlwiOlwiOTdlNTNlMWJhOTIxNjRkNzVhZWJcIixcIjI3ODJcIjpcIjk2ZWMxY2VjYmUzYzM1MzFlZmNmXCIsXCIyODYyXCI6XCJjMWVkZDAzZDE1MmU2MzY4MmY1ZVwiLFwiMjg3NFwiOlwiY2VlMGUwN2EzZTkxNDVlMjQ0NWRcIixcIjI5MDhcIjpcImM4YjUwOGZiMWRkMzM4ZDhlOGQ4XCIsXCIyOTc5XCI6XCJhZjZiYmFjZDY0ZGNhNjM0MzNhMVwiLFwiMjk4NFwiOlwiOGUyNDExMmFmNjUwOTdkYTZjNDFcIixcIjMwMTZcIjpcIjZkMDg3ZjI3NjBiMDNhYzA2ZDMzXCIsXCIzMDUxXCI6XCJjNmEyZjYwMzM5N2MwOTYyMjI0ZlwiLFwiMzEzMFwiOlwiN2E5MjFkYWI0ZjlkNjNjYTJmYWZcIixcIjMzMTFcIjpcIjdmNmUyYzNhOGY3ZTJlOWVjY2QzXCIsXCIzMzUzXCI6XCJiZjc5MWQ4MWQzNDU5ZjYzNWFkOVwiLFwiMzQ0MFwiOlwiOWVlMWFhZmVhN2VkMzRjNTYyMDZcIixcIjM1NjlcIjpcImQ1ODkyMjI4MjlmMTQyMmExMmIwXCIsXCIzNjU0XCI6XCIyZjA1NjU4MDdjMTQ2ZDhjOGU4ZVwiLFwiMzczMFwiOlwiNDA0Y2E3NzY4ZjZmMGRhOTMwZDZcIixcIjM3NDVcIjpcIjliYjg0MjI5NTQ0N2Q2Mzg1OWQ3XCIsXCIzODQ0XCI6XCJhMmZkYjQ5MWNkZWM2ZmNlOTE4MFwiLFwiNDAyNFwiOlwiMzI3NTRkYWZjM2QyMjIzNDViNzdcIixcIjQxNDdcIjpcIjM3Y2QzODE0YTk2MGVjZjZmZjI2XCIsXCI0MjEwXCI6XCI2Mjk0YzM4ODJiNTIxZjVhMWYwZFwiLFwiNDIyNlwiOlwiNTJiYmY4N2Q3MDE2N2MyZjI3N2VcIixcIjQyNjJcIjpcIjUwMzk0NzhiZDk1ZGM3NGEzNThhXCIsXCI0NDMxXCI6XCJlZWRjNzY4MjY4NTA0NDVlZjBjYVwiLFwiNDQ5OVwiOlwiZjI2NTI0ZjYwMzVjMTE2MjY0MWVcIixcIjQ1MThcIjpcIjRiOTU5ZDlmMDU1OTk4MDRkNmFjXCIsXCI0NTIxXCI6XCI5NTQzOTQ5NWNiYjcxODM5MDA2ZFwiLFwiNDUyMlwiOlwiNDg1OTQ5OTVlMGVhNmVmZTg2MmZcIixcIjQ1ODFcIjpcIjEzNjRmODg0Y2RkNzU3YjEwMTI0XCIsXCI0NzI4XCI6XCI2NzlhMzIwYjQzMmMwOTE1YWMwY1wiLFwiNDgyMFwiOlwiZTU1MzA5YjgxMGFjMzlhZDUzMWRcIixcIjQ4ODVcIjpcIjVjNjkyOTEyMDRhNzlhMzE0ZTIyXCIsXCI0ODg2XCI6XCJiNWI0Y2RlYmU2NTUyMWI0YmNkYVwiLFwiNTAzNVwiOlwiMDY2NTQ2MjFlMzcyNTkwMDFjMTlcIixcIjUwNjFcIjpcImU1YWI2ODM4YjcxNTE5MWQwYTRmXCIsXCI1MTgxXCI6XCJkNjQzOTg4YzE5OTE0NGUzNDQzOFwiLFwiNTI4NFwiOlwiMDM3Njg1MjBjOGQ2YTFjNjRlNDRcIixcIjUyOTNcIjpcIjRhMTkyYjEwMTE4ZjEwMTRlMzYxXCIsXCI1MzI4XCI6XCIwNzBhMDg4ZTgwOGQxOTdhZDU0ZFwiLFwiNTM2MlwiOlwiZmQyYjgyMTkyYzQ2Yjk3YzViM2RcIixcIjUzNjlcIjpcIjRmOGNlNzg3ZDllYWI4MjU0ODZlXCIsXCI1NDI0XCI6XCIwZTU2YTMzMmQ3ZWE4N2Q0NDcyYlwiLFwiNTQ1OVwiOlwiMWYxYzkxZWE0NmUwODIxZjEyNTBcIixcIjU1ODVcIjpcIjYwZDkxOGFiNGViMjAxYjA4MjA2XCIsXCI1NjAwXCI6XCI0YWJkNWRlM2ZmMGRjODMwNjU4ZFwiLFwiNTY0OFwiOlwiNjMzMWMzMWU3MjI4MmQyMWYxMzlcIixcIjU3MDNcIjpcIjgxMWIyNTg4MGYxMGFjYjE5ZDcwXCIsXCI1NzExXCI6XCI5YjhiYjNiMTM2ZmYwZjNiYzMyM1wiLFwiNTczNVwiOlwiOWQ4NWEyNTBjNDk0ZDVkYWNhMTJcIixcIjU3NDFcIjpcIjA4YThiYWRhYzVlMGY2OTJhZmEzXCIsXCI1NzY0XCI6XCI0ZmJiYTYzMzI5OTI5NWQ4OWM4ZVwiLFwiNTgzNlwiOlwiZjMyYmIxODdmMWJjZDBlOTYyMzhcIixcIjU4NjhcIjpcImQ2Mjk1M2ZjZWNkYWViMDBmNDhjXCIsXCI1ODk0XCI6XCI5MDkyMTdiNGIwNDhkNzUzNjZiN1wiLFwiNTk5NlwiOlwiYWIzZmIxMTI2ODUwMDhiOWEzMzVcIixcIjYwMThcIjpcIjBmOTdiOTk5ZjU2ZmFhMmQxYWNkXCIsXCI2MTQ5XCI6XCI1MzhlZWIyNDNjYjM1OTdmYzY3MVwiLFwiNjE1NlwiOlwiMTkwMzVhNGRiZTY2NWJjM2FmYjVcIixcIjYyMjhcIjpcIjFiYjZiMTM0NjZiZjlkMmE1YTY3XCIsXCI2MjUyXCI6XCI4NTFjZWFkMWJlZGEyYTljMTNkZVwiLFwiNjI1N1wiOlwiMDNhMjI3YWRlMDZhMmY5ZDE3NDVcIixcIjYzMDJcIjpcIjA5NmMwYWU4ZGRhODNiOThiY2M2XCIsXCI2NTI4XCI6XCJkYTUxYjEyNzE0YjZjY2Y5NDA1ZlwiLFwiNjYzOFwiOlwiNzcxNDhkMDAxNjI3MDNhZjNkYmZcIixcIjY2NzRcIjpcIjRjYzdhNWI1MjRkNTBjMmFjMzIwXCIsXCI2Njc4XCI6XCJjZDM1YjRmYjdhOGJmZjlmYWUxNVwiLFwiNjcwNVwiOlwiZjBjZDhmYTlmNjcxNjg5NDFlMzVcIixcIjY3MzlcIjpcImFlYjQwMzFkMmNkZDdmZDc3NDlhXCIsXCI2OTc1XCI6XCI5Zjc2MzBjMmVlOGY0ZTQ2N2RjYVwiLFwiNzA5N1wiOlwiYmRlNGRhY2JiMTY4MWEzY2M3YjJcIixcIjcxMDlcIjpcImI2MjhhZjdhOGU2MDRkNjZlNTcxXCIsXCI3MTIwXCI6XCJlZTE2M2U5Mzg4YmJlZjczMDYwNVwiLFwiNzE3NlwiOlwiN2JjNGE1NTkwNDlkZGE0OTY3YjdcIixcIjcxODZcIjpcIjVjMjJhNzAyMDU3MmY0ZDY0ZWI0XCIsXCI3MjUxXCI6XCI2MmIzNWY4NGExNDhiYTAxNDcxMlwiLFwiNzUxMVwiOlwiOTE3MjczYzNhY2VhNTlmZWZlYzVcIixcIjc1NDdcIjpcIjQ4ZWUxMjc3M2MyYzdhZWQwMzg2XCIsXCI3NTUxXCI6XCJkNTg2OWU0NmQxMGY0YmIwYzE2NFwiLFwiNzU4OFwiOlwiZDMzZjIxODM3MTU0MTQ4YjU1OTRcIixcIjc2MDlcIjpcIjQ4YjU3ZDZiZWJkOGYyN2U2YWZhXCIsXCI3NjU1XCI6XCJkYWNmMGI0NzcxYjNiYWM3YTI3MFwiLFwiNzczNVwiOlwiZGI3OTg4ZGI2NTUxYWY3ZTdjNjNcIixcIjc3NzNcIjpcIjBlNTQ2MWI0NjExODZlYTY0ZTRhXCIsXCI3Nzc0XCI6XCIxNTRiNDlhY2NmNmY2ZmUyZGE4YlwiLFwiNzc4MVwiOlwiODdjMzg4M2E3ZWM3NDRlMzBmMmNcIixcIjc4MjVcIjpcImVkMmM0NmQ5ZTM1MGQyMDFiZGU1XCIsXCI3ODQ2XCI6XCJmYmFkZGU0ZTE3NWRlYWI4M2M1ZlwiLFwiNzkwMVwiOlwiMmQzMTA1Njg3ZTllYzJlYjcwYTVcIixcIjgwMzdcIjpcIjc5ZGY4NTllOTIwY2MzZjBiZTkyXCIsXCI4MDczXCI6XCJiOGZiM2NiZTdmMTY3ZjE0ZDEzMVwiLFwiODI0NFwiOlwiM2I4OGQ1NTcxMmQ2MzgwZjE5YTZcIixcIjg0MzNcIjpcImQzMjk4MWQ2YzA5NTI3ODlkMTZlXCIsXCI4NTY5XCI6XCJhM2MwZDMxMjBiYTczMGM5YjhmN1wiLFwiODcwNlwiOlwiMDgyNWNkYTE4MzNhNjNkOTJhZGVcIixcIjg3MTJcIjpcIjU0ZDUyYmFjNjdjNDhlMTY4MDJjXCIsXCI4NzYyXCI6XCI2ZjNkYmJiZjMzM2ExMzFmOGI5MlwiLFwiODg4OVwiOlwiMmE1MWQzZDUwOTE5YmM3OTE3MWVcIixcIjg5MjhcIjpcImM3NWY5OTMyODY4OTBkYmNhNzg5XCIsXCI4OTY0XCI6XCIxMDBlYWI1ZjAwMzVkYzA3NGVkZVwiLFwiOTE2MVwiOlwiZmEwYjVmODUxMTYyNmZjYjEyOWVcIixcIjkyODBcIjpcIjUwY2YzZmQzNDA3NDNmZGJlOGRmXCIsXCI5NDE2XCI6XCJiNDcxM2FlNDA3MDY5NjUxMjJhM1wiLFwiOTYyMVwiOlwiODdhNGM4NTEwYjE0MjA0NzI5N2FcIixcIjk2MjZcIjpcIjczMzMwMmNlNjllNTgzNmMwMWRmXCIsXCI5NzAxXCI6XCI2MjRjZGUzNDI4YjdlMTMyMmIxNFwifVtjaHVua0lkXSArIFwiLmpzXCI7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCJ2YXIgaW5Qcm9ncmVzcyA9IHt9O1xudmFyIGRhdGFXZWJwYWNrUHJlZml4ID0gXCJndWl2MjpcIjtcbi8vIGxvYWRTY3JpcHQgZnVuY3Rpb24gdG8gbG9hZCBhIHNjcmlwdCB2aWEgc2NyaXB0IHRhZ1xuX193ZWJwYWNrX3JlcXVpcmVfXy5sID0gKHVybCwgZG9uZSwga2V5LCBjaHVua0lkKSA9PiB7XG5cdGlmKGluUHJvZ3Jlc3NbdXJsXSkgeyBpblByb2dyZXNzW3VybF0ucHVzaChkb25lKTsgcmV0dXJuOyB9XG5cdHZhciBzY3JpcHQsIG5lZWRBdHRhY2g7XG5cdGlmKGtleSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFyIHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKTtcblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgc2NyaXB0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIHMgPSBzY3JpcHRzW2ldO1xuXHRcdFx0aWYocy5nZXRBdHRyaWJ1dGUoXCJzcmNcIikgPT0gdXJsIHx8IHMuZ2V0QXR0cmlidXRlKFwiZGF0YS13ZWJwYWNrXCIpID09IGRhdGFXZWJwYWNrUHJlZml4ICsga2V5KSB7IHNjcmlwdCA9IHM7IGJyZWFrOyB9XG5cdFx0fVxuXHR9XG5cdGlmKCFzY3JpcHQpIHtcblx0XHRuZWVkQXR0YWNoID0gdHJ1ZTtcblx0XHRzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblxuXHRcdHNjcmlwdC5jaGFyc2V0ID0gJ3V0Zi04Jztcblx0XHRpZiAoX193ZWJwYWNrX3JlcXVpcmVfXy5uYykge1xuXHRcdFx0c2NyaXB0LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIF9fd2VicGFja19yZXF1aXJlX18ubmMpO1xuXHRcdH1cblx0XHRzY3JpcHQuc2V0QXR0cmlidXRlKFwiZGF0YS13ZWJwYWNrXCIsIGRhdGFXZWJwYWNrUHJlZml4ICsga2V5KTtcblxuXHRcdHNjcmlwdC5zcmMgPSB1cmw7XG5cdH1cblx0aW5Qcm9ncmVzc1t1cmxdID0gW2RvbmVdO1xuXHR2YXIgb25TY3JpcHRDb21wbGV0ZSA9IChwcmV2LCBldmVudCkgPT4ge1xuXHRcdC8vIGF2b2lkIG1lbSBsZWFrcyBpbiBJRS5cblx0XHRzY3JpcHQub25lcnJvciA9IHNjcmlwdC5vbmxvYWQgPSBudWxsO1xuXHRcdGNsZWFyVGltZW91dCh0aW1lb3V0KTtcblx0XHR2YXIgZG9uZUZucyA9IGluUHJvZ3Jlc3NbdXJsXTtcblx0XHRkZWxldGUgaW5Qcm9ncmVzc1t1cmxdO1xuXHRcdHNjcmlwdC5wYXJlbnROb2RlICYmIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG5cdFx0ZG9uZUZucyAmJiBkb25lRm5zLmZvckVhY2goKGZuKSA9PiAoZm4oZXZlbnQpKSk7XG5cdFx0aWYocHJldikgcmV0dXJuIHByZXYoZXZlbnQpO1xuXHR9XG5cdHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChvblNjcmlwdENvbXBsZXRlLmJpbmQobnVsbCwgdW5kZWZpbmVkLCB7IHR5cGU6ICd0aW1lb3V0JywgdGFyZ2V0OiBzY3JpcHQgfSksIDEyMDAwMCk7XG5cdHNjcmlwdC5vbmVycm9yID0gb25TY3JpcHRDb21wbGV0ZS5iaW5kKG51bGwsIHNjcmlwdC5vbmVycm9yKTtcblx0c2NyaXB0Lm9ubG9hZCA9IG9uU2NyaXB0Q29tcGxldGUuYmluZChudWxsLCBzY3JpcHQub25sb2FkKTtcblx0bmVlZEF0dGFjaCAmJiBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG59OyIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiLi9cIjsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmIgPSAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5iYXNlVVJJKSB8fCBzZWxmLmxvY2F0aW9uLmhyZWY7XG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IHtcblx0OTEyMTogMFxufTtcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5mLmogPSAoY2h1bmtJZCwgcHJvbWlzZXMpID0+IHtcblx0XHQvLyBKU09OUCBjaHVuayBsb2FkaW5nIGZvciBqYXZhc2NyaXB0XG5cdFx0dmFyIGluc3RhbGxlZENodW5rRGF0YSA9IF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpID8gaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdIDogdW5kZWZpbmVkO1xuXHRcdGlmKGluc3RhbGxlZENodW5rRGF0YSAhPT0gMCkgeyAvLyAwIG1lYW5zIFwiYWxyZWFkeSBpbnN0YWxsZWRcIi5cblxuXHRcdFx0Ly8gYSBQcm9taXNlIG1lYW5zIFwiY3VycmVudGx5IGxvYWRpbmdcIi5cblx0XHRcdGlmKGluc3RhbGxlZENodW5rRGF0YSkge1xuXHRcdFx0XHRwcm9taXNlcy5wdXNoKGluc3RhbGxlZENodW5rRGF0YVsyXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZig5MTIxICE9IGNodW5rSWQpIHtcblx0XHRcdFx0XHQvLyBzZXR1cCBQcm9taXNlIGluIGNodW5rIGNhY2hlXG5cdFx0XHRcdFx0dmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiAoaW5zdGFsbGVkQ2h1bmtEYXRhID0gaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gW3Jlc29sdmUsIHJlamVjdF0pKTtcblx0XHRcdFx0XHRwcm9taXNlcy5wdXNoKGluc3RhbGxlZENodW5rRGF0YVsyXSA9IHByb21pc2UpO1xuXG5cdFx0XHRcdFx0Ly8gc3RhcnQgY2h1bmsgbG9hZGluZ1xuXHRcdFx0XHRcdHZhciB1cmwgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLnAgKyBfX3dlYnBhY2tfcmVxdWlyZV9fLnUoY2h1bmtJZCk7XG5cdFx0XHRcdFx0Ly8gY3JlYXRlIGVycm9yIGJlZm9yZSBzdGFjayB1bndvdW5kIHRvIGdldCB1c2VmdWwgc3RhY2t0cmFjZSBsYXRlclxuXHRcdFx0XHRcdHZhciBlcnJvciA9IG5ldyBFcnJvcigpO1xuXHRcdFx0XHRcdHZhciBsb2FkaW5nRW5kZWQgPSAoZXZlbnQpID0+IHtcblx0XHRcdFx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpKSB7XG5cdFx0XHRcdFx0XHRcdGluc3RhbGxlZENodW5rRGF0YSA9IGluc3RhbGxlZENodW5rc1tjaHVua0lkXTtcblx0XHRcdFx0XHRcdFx0aWYoaW5zdGFsbGVkQ2h1bmtEYXRhICE9PSAwKSBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRcdGlmKGluc3RhbGxlZENodW5rRGF0YSkge1xuXHRcdFx0XHRcdFx0XHRcdHZhciBlcnJvclR5cGUgPSBldmVudCAmJiAoZXZlbnQudHlwZSA9PT0gJ2xvYWQnID8gJ21pc3NpbmcnIDogZXZlbnQudHlwZSk7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIHJlYWxTcmMgPSBldmVudCAmJiBldmVudC50YXJnZXQgJiYgZXZlbnQudGFyZ2V0LnNyYztcblx0XHRcdFx0XHRcdFx0XHRlcnJvci5tZXNzYWdlID0gJ0xvYWRpbmcgY2h1bmsgJyArIGNodW5rSWQgKyAnIGZhaWxlZC5cXG4oJyArIGVycm9yVHlwZSArICc6ICcgKyByZWFsU3JjICsgJyknO1xuXHRcdFx0XHRcdFx0XHRcdGVycm9yLm5hbWUgPSAnQ2h1bmtMb2FkRXJyb3InO1xuXHRcdFx0XHRcdFx0XHRcdGVycm9yLnR5cGUgPSBlcnJvclR5cGU7XG5cdFx0XHRcdFx0XHRcdFx0ZXJyb3IucmVxdWVzdCA9IHJlYWxTcmM7XG5cdFx0XHRcdFx0XHRcdFx0aW5zdGFsbGVkQ2h1bmtEYXRhWzFdKGVycm9yKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5sKHVybCwgbG9hZGluZ0VuZGVkLCBcImNodW5rLVwiICsgY2h1bmtJZCwgY2h1bmtJZCk7XG5cdFx0XHRcdH0gZWxzZSBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuXHRcdFx0fVxuXHRcdH1cbn07XG5cbi8vIG5vIHByZWZldGNoaW5nXG5cbi8vIG5vIHByZWxvYWRlZFxuXG4vLyBubyBITVJcblxuLy8gbm8gSE1SIG1hbmlmZXN0XG5cbl9fd2VicGFja19yZXF1aXJlX18uTy5qID0gKGNodW5rSWQpID0+IChpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPT09IDApO1xuXG4vLyBpbnN0YWxsIGEgSlNPTlAgY2FsbGJhY2sgZm9yIGNodW5rIGxvYWRpbmdcbnZhciB3ZWJwYWNrSnNvbnBDYWxsYmFjayA9IChwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbiwgZGF0YSkgPT4ge1xuXHR2YXIgW2NodW5rSWRzLCBtb3JlTW9kdWxlcywgcnVudGltZV0gPSBkYXRhO1xuXHQvLyBhZGQgXCJtb3JlTW9kdWxlc1wiIHRvIHRoZSBtb2R1bGVzIG9iamVjdCxcblx0Ly8gdGhlbiBmbGFnIGFsbCBcImNodW5rSWRzXCIgYXMgbG9hZGVkIGFuZCBmaXJlIGNhbGxiYWNrXG5cdHZhciBtb2R1bGVJZCwgY2h1bmtJZCwgaSA9IDA7XG5cdGlmKGNodW5rSWRzLnNvbWUoKGlkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2lkXSAhPT0gMCkpKSB7XG5cdFx0Zm9yKG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG5cdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8obW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm1bbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihydW50aW1lKSB2YXIgcmVzdWx0ID0gcnVudGltZShfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblx0fVxuXHRpZihwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbikgcGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24oZGF0YSk7XG5cdGZvcig7aSA8IGNodW5rSWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2h1bmtJZCA9IGNodW5rSWRzW2ldO1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdWzBdKCk7XG5cdFx0fVxuXHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IDA7XG5cdH1cblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uTyhyZXN1bHQpO1xufVxuXG52YXIgY2h1bmtMb2FkaW5nR2xvYmFsID0gZ2xvYmFsW1wid2VicGFja0NodW5rZ3VpdjJcIl0gPSBnbG9iYWxbXCJ3ZWJwYWNrQ2h1bmtndWl2MlwiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5uYyA9IHVuZGVmaW5lZDsiLCIiLCIiLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=