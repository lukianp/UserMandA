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
/******/ 			return "" + ({"3051":"discovery-18377601","5585":"migration","7655":"discovery-0dbddc7c","8037":"discovery-ddb7e021"}[chunkId] || chunkId) + "." + {"29":"e84515d0acad57d8da43","94":"356c82c412792b20cccb","144":"d1fa4f90a06103720b35","146":"e85a58d1aa314a14c069","221":"d303cc6fec45c11aa435","279":"6e97d4105952b07952df","301":"bd7f0607469522be416b","310":"3b51f4c37c8a05979bf8","432":"5e794001d1bafa3aab0f","513":"1db47db0a5cd993c2a20","690":"9ca1016e2cd973301102","749":"9b6bc0535957801dc83b","850":"cfba2ace401e67fae67d","1019":"e313bc67a636dbb6dc78","1104":"e78c137a338bf31101ca","1172":"c1b2d0f97b7ca0a10102","1173":"7cbe650311af0ff8cd1d","1177":"1bfd122b0fb142b28dcb","1272":"7cdd6308282390284f72","1321":"37a2d21ad1a6563854f3","1323":"d325682d1148ee52a70b","1569":"43a42bbfa839b2e54a59","1617":"b079877b6aff5d0c2489","1623":"6a202812c2a3b3b61565","1695":"da8bfbbae3c196c3aceb","1766":"5de1cabfdb05a5660f7d","1777":"5cd64ceecb939b25e88f","1826":"a77eaeb1e339fdcb1a84","1923":"32d8aa08639d09facd65","1981":"18c358061ae957e4db0f","2046":"1a45742407a84e5fe164","2071":"43857f06ce1e08b5b278","2153":"46e068589ffc603cbca3","2246":"1482dfe4ee7fdfc2c95e","2268":"b3fa43b969542f4378e4","2304":"cf888232b41b3e09ff54","2423":"67d600f7ea05223d749f","2474":"a8823dbf10f9640b0dc9","2512":"2f74052d5ba8c72d5570","2541":"18f870c70f2f9b82c7c5","2555":"7cd62462e2ce04f047e9","2569":"6da672d9fbc36cdb4508","2605":"01bfc12d435220cb264d","2610":"fd62adc6f0992df8c506","2639":"b80ac62221cb10dba0f9","2642":"5f45aa3c77ed8d7b586f","2701":"b44d2173b7a7f8999b2e","2782":"d8947c979831a1316896","2862":"4eece5091f76c0604417","2874":"610386f99933e14ab783","2908":"b5499bf83034de3c9c25","2979":"03c954c945eb032ad591","2984":"477671e67b3040a7ab95","3016":"909426d2bea808bba3ce","3051":"f272b1cb666a23e41e9f","3130":"69be2dc74adcfbd6aa92","3311":"22752b3047bbd0a225bc","3353":"8e2fcf541200fef3c70c","3440":"cf53a03380c1cad22157","3569":"d5ae7819431d70c3aff6","3654":"37492274332c9b6ab75a","3730":"d735b3bf20810f366082","3745":"70c524797cbe90cf3d2e","3844":"35c8d006a6fd3528e88c","4024":"890d03449293e452008a","4147":"dbc254a4ae8ce65e53ec","4210":"da0a940abe08723da7ae","4226":"db01b7d448051502d150","4262":"d085980c8b7ec93d1edd","4431":"ae18d8b18a760391285f","4499":"16701ded1b39c007e61e","4518":"93bec1fb9ea5f6121bc0","4521":"fc454a9752e1aae5d2dc","4522":"29453402d7a2ee89435b","4581":"2473d2259d13996d6fc7","4728":"e14e9be94fb6b0afab44","4820":"2252071193c8169b30a4","4885":"508fbb12d7956d356dde","4886":"b21b207c668f209cf4b8","5035":"8e77a26c596cdcec5120","5061":"799e73b35baa6470d2b4","5181":"65e8a1a8d58b95a054e4","5284":"5afb50389be9be6a217a","5293":"e5742ce8799881dfc34a","5328":"9e0a1f0286d8483b6727","5362":"a187b460534ebc9c0e90","5369":"332543d58685ba6223c2","5424":"aa0a402ba383ce0bb777","5459":"92901ab0860d41c7c0bc","5585":"c3569a2724c8684dd6d2","5600":"6c2987cdb56bd8f2b350","5648":"3b86839cdabc637f8e75","5703":"9f3ff473fa9028e04f9f","5711":"08ff800a2cbac9b9dda7","5735":"cefb758589f25ce3b93a","5741":"143b7bdf1e19c20cb190","5764":"87e13f0c0e645337db06","5836":"43acd96a5dea85ba500e","5868":"b32ca4971a03338d0928","5894":"88039671a91a0e47702e","5953":"a72e04b5cc1382bd7447","5996":"832e4bb47c3c54f6f828","6018":"b39375ffe1e3898b2360","6149":"fabc1b994a863efd37e1","6156":"92520efb3e4cf719873e","6228":"35445278ff287f14c866","6252":"34b62b53d66b9e3029ac","6257":"fd982e33109e4b2c956b","6302":"d1c51700d378fa50b55f","6528":"e810388aa1146f8c009b","6638":"ffeace5d5dabf2ad0596","6674":"3a168b53d15c22c30f16","6678":"df78458b84d10950af6f","6705":"a69e87254d9951395a39","6739":"0d301d2b6e9842107054","6840":"fb692c1be4ba6f152aea","6975":"39e17e097c9acb4ce6d7","7097":"94ca2ccec39f63dfff42","7109":"96da8ccb63242387d33c","7120":"46a1363cd189804ec5a7","7176":"6c00949f6b9305f5dd31","7186":"30990d811372a682bbfb","7251":"8f9c93b977daadb93702","7511":"d6d0442dfafe8e7b8ea4","7547":"be58339f5fde62039576","7551":"795875a3a992311f75c0","7588":"4ace5755e6a6f8db70a2","7609":"d869c77dbbfb96778da4","7655":"b7ee94967416b0191a3f","7735":"66e584cae7072d62ce27","7773":"839fa59f76c1a31bb49e","7774":"5235e66b3e293477cc7f","7781":"c75501a3020180999d65","7825":"2290b7de32c150c0240d","7846":"3cc776eef9cfc0267398","7901":"64850c4c9b42e09f0acd","8037":"88ee87c11adf3d910884","8073":"410cd9aea9369966932b","8244":"53f216736a832a21e035","8433":"744606f22092b61f5fe7","8569":"55dc15beea92c4acfe84","8706":"d7e81e81380807308f19","8712":"47938a1b9b639bf9ae51","8762":"bd428911819ae9b94252","8889":"f917b64da116b4d2b916","8928":"38590804372cc1c058ac","8964":"b3d600632af73cfc7b04","9161":"1b83fdeaa2139ad10e74","9280":"756b412533435e799133","9416":"2fd38294b04182496073","9621":"4609f2b230b8e7970ed3","9626":"8edab79e74b55a1676e2","9701":"e74e08ee4482e09c8567"}[chunkId] + ".js";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS5kODA1OWVlMjdjZTQ1ODg0MzIwMC5qcyIsIm1hcHBpbmdzIjoiOzs7O1VBQUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOzs7OztXQ3pCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLCtCQUErQix3Q0FBd0M7V0FDdkU7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQkFBaUIscUJBQXFCO1dBQ3RDO1dBQ0E7V0FDQSxrQkFBa0IscUJBQXFCO1dBQ3ZDO1dBQ0E7V0FDQSxLQUFLO1dBQ0w7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEU7Ozs7O1dDM0JBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBLEU7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esc0RBQXNEO1dBQ3RELHNDQUFzQyxtR0FBbUc7V0FDekk7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEU7Ozs7O1dDekJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEVBQUU7V0FDRixFOzs7OztXQ1JBO1dBQ0E7V0FDQTtXQUNBLGVBQWUsdUdBQXVHLCtCQUErQiwrOUlBQSs5STtXQUNwbkosRTs7Ozs7V0NKQSx3Rjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHVCQUF1Qiw0QkFBNEI7V0FDbkQ7V0FDQTtXQUNBO1dBQ0EsaUJBQWlCLG9CQUFvQjtXQUNyQztXQUNBLG1HQUFtRyxZQUFZO1dBQy9HO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLG1FQUFtRSxpQ0FBaUM7V0FDcEc7V0FDQTtXQUNBO1dBQ0EsRTs7Ozs7V0N4Q0E7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7O1dDTkEsNkI7Ozs7O1dDQUE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQzs7V0FFakM7V0FDQTtXQUNBO1dBQ0EsS0FBSztXQUNMO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNO1dBQ047V0FDQTtXQUNBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU0scUJBQXFCO1dBQzNCO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBLDRHOzs7OztXQ3JGQSxtQyIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svcnVudGltZS9jaHVuayBsb2FkZWQiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2NyZWF0ZSBmYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svcnVudGltZS9lbnN1cmUgY2h1bmsiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2dldCBqYXZhc2NyaXB0IGNodW5rIGZpbGVuYW1lIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2xvYWQgc2NyaXB0Iiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9ydW50aW1lL25vbmNlIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vZ3VpdjIvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2d1aXYyL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldID0gZGVmZXJyZWRbaV07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwidmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mID8gKG9iaikgPT4gKE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopKSA6IChvYmopID0+IChvYmouX19wcm90b19fKTtcbnZhciBsZWFmUHJvdG90eXBlcztcbi8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuLy8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4vLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbi8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuLy8gbW9kZSAmIDE2OiByZXR1cm4gdmFsdWUgd2hlbiBpdCdzIFByb21pc2UtbGlrZVxuLy8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuX193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcblx0aWYobW9kZSAmIDEpIHZhbHVlID0gdGhpcyh2YWx1ZSk7XG5cdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG5cdGlmKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUpIHtcblx0XHRpZigobW9kZSAmIDQpICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcblx0XHRpZigobW9kZSAmIDE2KSAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHZhbHVlO1xuXHR9XG5cdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG5cdHZhciBkZWYgPSB7fTtcblx0bGVhZlByb3RvdHlwZXMgPSBsZWFmUHJvdG90eXBlcyB8fCBbbnVsbCwgZ2V0UHJvdG8oe30pLCBnZXRQcm90byhbXSksIGdldFByb3RvKGdldFByb3RvKV07XG5cdGZvcih2YXIgY3VycmVudCA9IG1vZGUgJiAyICYmIHZhbHVlOyAodHlwZW9mIGN1cnJlbnQgPT0gJ29iamVjdCcgfHwgdHlwZW9mIGN1cnJlbnQgPT0gJ2Z1bmN0aW9uJykgJiYgIX5sZWFmUHJvdG90eXBlcy5pbmRleE9mKGN1cnJlbnQpOyBjdXJyZW50ID0gZ2V0UHJvdG8oY3VycmVudCkpIHtcblx0XHRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhjdXJyZW50KS5mb3JFYWNoKChrZXkpID0+IChkZWZba2V5XSA9ICgpID0+ICh2YWx1ZVtrZXldKSkpO1xuXHR9XG5cdGRlZlsnZGVmYXVsdCddID0gKCkgPT4gKHZhbHVlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBkZWYpO1xuXHRyZXR1cm4gbnM7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZiA9IHt9O1xuLy8gVGhpcyBmaWxlIGNvbnRhaW5zIG9ubHkgdGhlIGVudHJ5IGNodW5rLlxuLy8gVGhlIGNodW5rIGxvYWRpbmcgZnVuY3Rpb24gZm9yIGFkZGl0aW9uYWwgY2h1bmtzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmUgPSAoY2h1bmtJZCkgPT4ge1xuXHRyZXR1cm4gUHJvbWlzZS5hbGwoT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5mKS5yZWR1Y2UoKHByb21pc2VzLCBrZXkpID0+IHtcblx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmZba2V5XShjaHVua0lkLCBwcm9taXNlcyk7XG5cdFx0cmV0dXJuIHByb21pc2VzO1xuXHR9LCBbXSkpO1xufTsiLCIvLyBUaGlzIGZ1bmN0aW9uIGFsbG93IHRvIHJlZmVyZW5jZSBhc3luYyBjaHVua3Ncbl9fd2VicGFja19yZXF1aXJlX18udSA9IChjaHVua0lkKSA9PiB7XG5cdC8vIHJldHVybiB1cmwgZm9yIGZpbGVuYW1lcyBiYXNlZCBvbiB0ZW1wbGF0ZVxuXHRyZXR1cm4gXCJcIiArICh7XCIzMDUxXCI6XCJkaXNjb3ZlcnktMTgzNzc2MDFcIixcIjU1ODVcIjpcIm1pZ3JhdGlvblwiLFwiNzY1NVwiOlwiZGlzY292ZXJ5LTBkYmRkYzdjXCIsXCI4MDM3XCI6XCJkaXNjb3ZlcnktZGRiN2UwMjFcIn1bY2h1bmtJZF0gfHwgY2h1bmtJZCkgKyBcIi5cIiArIHtcIjI5XCI6XCI1YjgzYzA0NGNhNDZhZjEzMDIzZlwiLFwiOTRcIjpcImZkYzY2OTNiYTc1Zjk1NjZmNjEzXCIsXCIxNDRcIjpcImFjOWE2ZjJlNDNjYWQ5YWU0YmMyXCIsXCIxNDZcIjpcIjAyMjcyOTAwMjM2Y2ZmOTBlMDdmXCIsXCIyMjFcIjpcImQ2NzYxZmMwMGIzY2FiN2Q1ZmI2XCIsXCIyNzlcIjpcImRmM2I2NDg2ZWU2MjUzZjA0NGY3XCIsXCIzMDFcIjpcIjI0ZDRmMDQ3YjFkMTg1NDk0NDQxXCIsXCIzMTBcIjpcImZlMTU1MzBkZmFjYzk3YjAzYTZiXCIsXCI0MzJcIjpcIjIyMzY3Y2VkMTkyNjQ1ODMzNmU1XCIsXCI1MTNcIjpcIjY3YTRjNzNiNGQ1ODQ5MGZkNzU4XCIsXCI2OTBcIjpcImVkODIyODY5NDg0ZmZhNjgwZTRjXCIsXCI3NDlcIjpcImFlZTdlMDNmZDNhMjljYTU5ZTliXCIsXCI4NTBcIjpcIjNmMWZlNjNhMWVlNTBjNmIyNDNlXCIsXCIxMDE5XCI6XCJlYWQwNzIxZjY5YjdmZDE3NDM0YVwiLFwiMTEwNFwiOlwiOTIwYTYyZDJmN2M0YWYxMjJlZTJcIixcIjExNzJcIjpcImFiNDE3ZWI1NjQzOTFjNDMxMTE4XCIsXCIxMTczXCI6XCJiMzc5OTQ4YzUzZjY5MzRmNDJkYlwiLFwiMTE3N1wiOlwiNDg2MGY4OWI2NTM3MzU3OTM3NjhcIixcIjEyNzJcIjpcIjQ4ZjFhZjU1NjZmNjE4M2IyZjhiXCIsXCIxMzIxXCI6XCI2ZDgxZWE4YTcxZGU1NjMzOGVkYVwiLFwiMTMyM1wiOlwiYzE2ODM5MDdlNzE4YWYxM2EyYzNcIixcIjE1NjlcIjpcIjgwZGQ5NGJjYTgzMTNkYTdhZWRmXCIsXCIxNjE3XCI6XCI5NDY0NjI3NGU1ZjkxOTFjZmE0MlwiLFwiMTYyM1wiOlwiNTI0M2FiMjNhMzFhNGEwNGUyYmNcIixcIjE2OTVcIjpcImFhMDIyZTRiY2Q2NDEzODcxNzlhXCIsXCIxNzY2XCI6XCIxZDFkMTMwYzc1MDdhZTc1YjFhMFwiLFwiMTc3N1wiOlwiOTlmMzRkN2MwODc2ZTljNDlkOGVcIixcIjE4MjZcIjpcImE1YzMyMjRlOWYzMDE1MjdkZTBjXCIsXCIxOTIzXCI6XCJiZmYwNjZhMjRlYzAyOTExYWM2MlwiLFwiMTk4MVwiOlwiYjIwZjdhM2FmNmE4OGRhMGNkNjZcIixcIjIwNDZcIjpcIjdiNzgzYTNkYTNiNWQ0MzU0ZTRkXCIsXCIyMDcxXCI6XCIyNWQ2N2NhZjFkNWUzYmFkN2VkYlwiLFwiMjE1M1wiOlwiM2UzYThkNTI5NjAxNGNmMGVjYTFcIixcIjIyNDZcIjpcImIxMTk3NDY4YTA2ODYyMjY3MzVkXCIsXCIyMjY4XCI6XCIxNTZiZGY5ZDQ2NThkMzU3MDJhY1wiLFwiMjMwNFwiOlwiNWQ3NzQ5ZTg3Mzg2OWQyMjcyZGZcIixcIjI0MjNcIjpcImUwZWJjY2RjMjUxMzExNWE2ZWI3XCIsXCIyNDc0XCI6XCJlZGNhYjBmNDE3YjM3Zjk3YTdkZFwiLFwiMjUxMlwiOlwiY2I3ZGU2MzdjMGVmMmJmYTRjMjBcIixcIjI1NDFcIjpcIjFmMDhjY2FlZGFkZGRiZWIzZjE3XCIsXCIyNTU1XCI6XCJlMDRiNjczNDcyYzJkMmM4NDhjOFwiLFwiMjU2OVwiOlwiZmJiNDZjY2ZjOTIzZTZhYzMzYjdcIixcIjI2MDVcIjpcIjU5NGVkYzhhNTUzYmVlN2JjMjQyXCIsXCIyNjEwXCI6XCJkNTg1NDllMTJjNjRlOGRmNzAzY1wiLFwiMjYzOVwiOlwiNDA0OTYwMzU4NWExYWU4MDBiZWFcIixcIjI2NDJcIjpcImFmN2MzYmU4MDA0ZjgwZDk2NjA2XCIsXCIyNzAxXCI6XCIyZmE3NTZhNDczOWRhYzViNzhmNVwiLFwiMjc4MlwiOlwiOTZlYzFjZWNiZTNjMzUzMWVmY2ZcIixcIjI4NjJcIjpcImMxZWRkMDNkMTUyZTYzNjgyZjVlXCIsXCIyODc0XCI6XCJjZWUwZTA3YTNlOTE0NWUyNDQ1ZFwiLFwiMjkwOFwiOlwiYzhiNTA4ZmIxZGQzMzhkOGU4ZDhcIixcIjI5NzlcIjpcImFmNmJiYWNkNjRkY2E2MzQzM2ExXCIsXCIyOTg0XCI6XCI4ZTI0MTEyYWY2NTA5N2RhNmM0MVwiLFwiMzAxNlwiOlwiNmQwODdmMjc2MGIwM2FjMDZkMzNcIixcIjMwNTFcIjpcImM2YTJmNjAzMzk3YzA5NjIyMjRmXCIsXCIzMTMwXCI6XCI3YTkyMWRhYjRmOWQ2M2NhMmZhZlwiLFwiMzMxMVwiOlwiN2Y2ZTJjM2E4ZjdlMmU5ZWNjZDNcIixcIjMzNTNcIjpcImJmNzkxZDgxZDM0NTlmNjM1YWQ5XCIsXCIzNDQwXCI6XCI5ZWUxYWFmZWE3ZWQzNGM1NjIwNlwiLFwiMzU2OVwiOlwiZDU4OTIyMjgyOWYxNDIyYTEyYjBcIixcIjM2NTRcIjpcIjJmMDU2NTgwN2MxNDZkOGM4ZThlXCIsXCIzNzMwXCI6XCI0MDRjYTc3NjhmNmYwZGE5MzBkNlwiLFwiMzc0NVwiOlwiOWJiODQyMjk1NDQ3ZDYzODU5ZDdcIixcIjM4NDRcIjpcImEyZmRiNDkxY2RlYzZmY2U5MTgwXCIsXCI0MDI0XCI6XCIzMjc1NGRhZmMzZDIyMjM0NWI3N1wiLFwiNDE0N1wiOlwiMzdjZDM4MTRhOTYwZWNmNmZmMjZcIixcIjQyMTBcIjpcIjc0YmFhMDk2ZDdmOTI1M2E2NTJhXCIsXCI0MjI2XCI6XCI1MmJiZjg3ZDcwMTY3YzJmMjc3ZVwiLFwiNDI2MlwiOlwiNmIyYWJhODBiZDYzZWY0OGYyZmFcIixcIjQ0MzFcIjpcIjg5Y2Q5ZTI4ZDlhZjAxMzNhOWI3XCIsXCI0NDk5XCI6XCIxZTFiZDZlMGVjM2I2MDUyODI2YVwiLFwiNDUxOFwiOlwiNWI1OTI3ZDU5MTcwZTMyM2RkOGZcIixcIjQ1MjFcIjpcImVkNTdmNmE3ZGVkOTVlNWZiMzk1XCIsXCI0NTIyXCI6XCI0ODU5NDk5NWUwZWE2ZWZlODYyZlwiLFwiNDU4MVwiOlwiMTM2NGY4ODRjZGQ3NTdiMTAxMjRcIixcIjQ3MjhcIjpcIjY3OWEzMjBiNDMyYzA5MTVhYzBjXCIsXCI0ODIwXCI6XCJlNTUzMDliODEwYWMzOWFkNTMxZFwiLFwiNDg4NVwiOlwiNWM2OTI5MTIwNGE3OWEzMTRlMjJcIixcIjQ4ODZcIjpcImQzMGY5NGFlZDc4ZTk1OWY3ODc0XCIsXCI1MDM1XCI6XCIwNjY1NDYyMWUzNzI1OTAwMWMxOVwiLFwiNTA2MVwiOlwiZTVhYjY4MzhiNzE1MTkxZDBhNGZcIixcIjUxODFcIjpcIjA4Zjk4ZmNlY2IwZmIyNGQ4NWIyXCIsXCI1Mjg0XCI6XCIwMzc2ODUyMGM4ZDZhMWM2NGU0NFwiLFwiNTI5M1wiOlwiZGYzYzE5N2M5MGY5MDYwZTJhNWRcIixcIjUzMjhcIjpcIjA3MGEwODhlODA4ZDE5N2FkNTRkXCIsXCI1MzYyXCI6XCIwMTY4MTRjNTc5ODAzZjA5YzE4NVwiLFwiNTM2OVwiOlwiNDhiMTI4YWUyNWRhMGUwOGVhNmZcIixcIjU0MjRcIjpcIjBlNTZhMzMyZDdlYTg3ZDQ0NzJiXCIsXCI1NDU5XCI6XCIxZjFjOTFlYTQ2ZTA4MjFmMTI1MFwiLFwiNTU4NVwiOlwiNjBkOTE4YWI0ZWIyMDFiMDgyMDZcIixcIjU2MDBcIjpcIjgyZDRiNmY1MTE2MDdmZGEwOTEzXCIsXCI1NjQ4XCI6XCJkY2MyZTE3MmE0NTkwZjcwMzA1NVwiLFwiNTcwM1wiOlwiODExYjI1ODgwZjEwYWNiMTlkNzBcIixcIjU3MTFcIjpcIjliOGJiM2IxMzZmZjBmM2JjMzIzXCIsXCI1NzM1XCI6XCI5ZDg1YTI1MGM0OTRkNWRhY2ExMlwiLFwiNTc0MVwiOlwiYTBkOGU3ZmUzMTBiZTM5Yzg5NDBcIixcIjU3NjRcIjpcIjdlMjhmNGJiZTdjZjA5YmRjMDQ0XCIsXCI1ODM2XCI6XCIwNmIyNjM2Mjc0OTQ3ZTQxNWQ4Y1wiLFwiNTg2OFwiOlwiZDYyOTUzZmNlY2RhZWIwMGY0OGNcIixcIjU4OTRcIjpcIjA5ZmVjOTY5N2YyZTgzZDFhNjY2XCIsXCI1OTUzXCI6XCJjOTc1ZDc4MmE0YjU2MjRlOTA4OFwiLFwiNTk5NlwiOlwiYWIzZmIxMTI2ODUwMDhiOWEzMzVcIixcIjYwMThcIjpcIjBmOTdiOTk5ZjU2ZmFhMmQxYWNkXCIsXCI2MTQ5XCI6XCIwNzFjODE3NzJlZWMzOGM3MTQ3Y1wiLFwiNjE1NlwiOlwiMTkwMzVhNGRiZTY2NWJjM2FmYjVcIixcIjYyMjhcIjpcIjFiYjZiMTM0NjZiZjlkMmE1YTY3XCIsXCI2MjUyXCI6XCJkOTFiMjQ2ZTFkZTg0YWI0MWUyNVwiLFwiNjI1N1wiOlwiNWIxZTBhODZhYjE2MDYxYTE2YWJcIixcIjYzMDJcIjpcIjA5NmMwYWU4ZGRhODNiOThiY2M2XCIsXCI2NTI4XCI6XCJkYTUxYjEyNzE0YjZjY2Y5NDA1ZlwiLFwiNjYzOFwiOlwiNzcxNDhkMDAxNjI3MDNhZjNkYmZcIixcIjY2NzRcIjpcImE2NjBiNDIwNDc0NjVhMDlkZDljXCIsXCI2Njc4XCI6XCJjZDM1YjRmYjdhOGJmZjlmYWUxNVwiLFwiNjcwNVwiOlwiZDlmZDA5ZDk2MjY2MzUwZjQ5NjBcIixcIjY3MzlcIjpcImFlYjQwMzFkMmNkZDdmZDc3NDlhXCIsXCI2ODQwXCI6XCIxZWNhOWRjZTM5ZWNiODhhNDk2MVwiLFwiNjk3NVwiOlwiOWY3NjMwYzJlZThmNGU0NjdkY2FcIixcIjcwOTdcIjpcImJkZTRkYWNiYjE2ODFhM2NjN2IyXCIsXCI3MTA5XCI6XCJiNjI4YWY3YThlNjA0ZDY2ZTU3MVwiLFwiNzEyMFwiOlwiZWUxNjNlOTM4OGJiZWY3MzA2MDVcIixcIjcxNzZcIjpcIjdiYzRhNTU5MDQ5ZGRhNDk2N2I3XCIsXCI3MTg2XCI6XCI1YzIyYTcwMjA1NzJmNGQ2NGViNFwiLFwiNzI1MVwiOlwiYzY1MTRiNzU2YTI4Nzg1NGZjOTlcIixcIjc1MTFcIjpcIjBlYWE2OGQ1ZjFmMTI0MzY3ZTFjXCIsXCI3NTQ3XCI6XCI0OGVlMTI3NzNjMmM3YWVkMDM4NlwiLFwiNzU1MVwiOlwiZDU4NjllNDZkMTBmNGJiMGMxNjRcIixcIjc1ODhcIjpcImQzM2YyMTgzNzE1NDE0OGI1NTk0XCIsXCI3NjA5XCI6XCI0OGI1N2Q2YmViZDhmMjdlNmFmYVwiLFwiNzY1NVwiOlwiYmY3NzAzZWNjMGE0ZmE4NjE4OTJcIixcIjc3MzVcIjpcImRiNzk4OGRiNjU1MWFmN2U3YzYzXCIsXCI3NzczXCI6XCIwZTU0NjFiNDYxMTg2ZWE2NGU0YVwiLFwiNzc3NFwiOlwiMTU0YjQ5YWNjZjZmNmZlMmRhOGJcIixcIjc3ODFcIjpcIjg3YzM4ODNhN2VjNzQ0ZTMwZjJjXCIsXCI3ODI1XCI6XCJjNGMwMTM3NmRjODBhODQ5ZmU2NlwiLFwiNzg0NlwiOlwiZmJhZGRlNGUxNzVkZWFiODNjNWZcIixcIjc5MDFcIjpcIjJkMzEwNTY4N2U5ZWMyZWI3MGE1XCIsXCI4MDM3XCI6XCI3OWRmODU5ZTkyMGNjM2YwYmU5MlwiLFwiODA3M1wiOlwiYjhmYjNjYmU3ZjE2N2YxNGQxMzFcIixcIjgyNDRcIjpcIjNiODhkNTU3MTJkNjM4MGYxOWE2XCIsXCI4NDMzXCI6XCJkMzI5ODFkNmMwOTUyNzg5ZDE2ZVwiLFwiODU2OVwiOlwiYTNjMGQzMTIwYmE3MzBjOWI4ZjdcIixcIjg3MDZcIjpcIjA4MjVjZGExODMzYTYzZDkyYWRlXCIsXCI4NzEyXCI6XCJiZDMwYWNjNjI2Yjk0ZjUzN2E3N1wiLFwiODc2MlwiOlwiNmYzZGJiYmYzMzNhMTMxZjhiOTJcIixcIjg4ODlcIjpcIjJhNTFkM2Q1MDkxOWJjNzkxNzFlXCIsXCI4OTI4XCI6XCJjNzVmOTkzMjg2ODkwZGJjYTc4OVwiLFwiODk2NFwiOlwiMTAwZWFiNWYwMDM1ZGMwNzRlZGVcIixcIjkxNjFcIjpcImZhMGI1Zjg1MTE2MjZmY2IxMjllXCIsXCI5MjgwXCI6XCI1MGNmM2ZkMzQwNzQzZmRiZThkZlwiLFwiOTQxNlwiOlwiOGIxMmJjYjMzMjMyMmQzYjQ0Y2FcIixcIjk2MjFcIjpcIjg3YTRjODUxMGIxNDIwNDcyOTdhXCIsXCI5NjI2XCI6XCJjNTI0MjAzODRmNDU4YTlkZDFhNlwiLFwiOTcwMVwiOlwiNjI0Y2RlMzQyOGI3ZTEzMjJiMTRcIn1bY2h1bmtJZF0gKyBcIi5qc1wiO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwidmFyIGluUHJvZ3Jlc3MgPSB7fTtcbnZhciBkYXRhV2VicGFja1ByZWZpeCA9IFwiZ3VpdjI6XCI7XG4vLyBsb2FkU2NyaXB0IGZ1bmN0aW9uIHRvIGxvYWQgYSBzY3JpcHQgdmlhIHNjcmlwdCB0YWdcbl9fd2VicGFja19yZXF1aXJlX18ubCA9ICh1cmwsIGRvbmUsIGtleSwgY2h1bmtJZCkgPT4ge1xuXHRpZihpblByb2dyZXNzW3VybF0pIHsgaW5Qcm9ncmVzc1t1cmxdLnB1c2goZG9uZSk7IHJldHVybjsgfVxuXHR2YXIgc2NyaXB0LCBuZWVkQXR0YWNoO1xuXHRpZihrZXkgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhciBzY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzY3JpcHRcIik7XG5cdFx0Zm9yKHZhciBpID0gMDsgaSA8IHNjcmlwdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBzID0gc2NyaXB0c1tpXTtcblx0XHRcdGlmKHMuZ2V0QXR0cmlidXRlKFwic3JjXCIpID09IHVybCB8fCBzLmdldEF0dHJpYnV0ZShcImRhdGEtd2VicGFja1wiKSA9PSBkYXRhV2VicGFja1ByZWZpeCArIGtleSkgeyBzY3JpcHQgPSBzOyBicmVhazsgfVxuXHRcdH1cblx0fVxuXHRpZighc2NyaXB0KSB7XG5cdFx0bmVlZEF0dGFjaCA9IHRydWU7XG5cdFx0c2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG5cblx0XHRzY3JpcHQuY2hhcnNldCA9ICd1dGYtOCc7XG5cdFx0aWYgKF9fd2VicGFja19yZXF1aXJlX18ubmMpIHtcblx0XHRcdHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBfX3dlYnBhY2tfcmVxdWlyZV9fLm5jKTtcblx0XHR9XG5cdFx0c2NyaXB0LnNldEF0dHJpYnV0ZShcImRhdGEtd2VicGFja1wiLCBkYXRhV2VicGFja1ByZWZpeCArIGtleSk7XG5cblx0XHRzY3JpcHQuc3JjID0gdXJsO1xuXHR9XG5cdGluUHJvZ3Jlc3NbdXJsXSA9IFtkb25lXTtcblx0dmFyIG9uU2NyaXB0Q29tcGxldGUgPSAocHJldiwgZXZlbnQpID0+IHtcblx0XHQvLyBhdm9pZCBtZW0gbGVha3MgaW4gSUUuXG5cdFx0c2NyaXB0Lm9uZXJyb3IgPSBzY3JpcHQub25sb2FkID0gbnVsbDtcblx0XHRjbGVhclRpbWVvdXQodGltZW91dCk7XG5cdFx0dmFyIGRvbmVGbnMgPSBpblByb2dyZXNzW3VybF07XG5cdFx0ZGVsZXRlIGluUHJvZ3Jlc3NbdXJsXTtcblx0XHRzY3JpcHQucGFyZW50Tm9kZSAmJiBzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xuXHRcdGRvbmVGbnMgJiYgZG9uZUZucy5mb3JFYWNoKChmbikgPT4gKGZuKGV2ZW50KSkpO1xuXHRcdGlmKHByZXYpIHJldHVybiBwcmV2KGV2ZW50KTtcblx0fVxuXHR2YXIgdGltZW91dCA9IHNldFRpbWVvdXQob25TY3JpcHRDb21wbGV0ZS5iaW5kKG51bGwsIHVuZGVmaW5lZCwgeyB0eXBlOiAndGltZW91dCcsIHRhcmdldDogc2NyaXB0IH0pLCAxMjAwMDApO1xuXHRzY3JpcHQub25lcnJvciA9IG9uU2NyaXB0Q29tcGxldGUuYmluZChudWxsLCBzY3JpcHQub25lcnJvcik7XG5cdHNjcmlwdC5vbmxvYWQgPSBvblNjcmlwdENvbXBsZXRlLmJpbmQobnVsbCwgc2NyaXB0Lm9ubG9hZCk7XG5cdG5lZWRBdHRhY2ggJiYgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xufTsiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIi4vXCI7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5iID0gKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQuYmFzZVVSSSkgfHwgc2VsZi5sb2NhdGlvbi5ocmVmO1xuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdDkxMjE6IDBcbn07XG5cbl9fd2VicGFja19yZXF1aXJlX18uZi5qID0gKGNodW5rSWQsIHByb21pc2VzKSA9PiB7XG5cdFx0Ly8gSlNPTlAgY2h1bmsgbG9hZGluZyBmb3IgamF2YXNjcmlwdFxuXHRcdHZhciBpbnN0YWxsZWRDaHVua0RhdGEgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSA/IGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA6IHVuZGVmaW5lZDtcblx0XHRpZihpbnN0YWxsZWRDaHVua0RhdGEgIT09IDApIHsgLy8gMCBtZWFucyBcImFscmVhZHkgaW5zdGFsbGVkXCIuXG5cblx0XHRcdC8vIGEgUHJvbWlzZSBtZWFucyBcImN1cnJlbnRseSBsb2FkaW5nXCIuXG5cdFx0XHRpZihpbnN0YWxsZWRDaHVua0RhdGEpIHtcblx0XHRcdFx0cHJvbWlzZXMucHVzaChpbnN0YWxsZWRDaHVua0RhdGFbMl0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYoOTEyMSAhPSBjaHVua0lkKSB7XG5cdFx0XHRcdFx0Ly8gc2V0dXAgUHJvbWlzZSBpbiBjaHVuayBjYWNoZVxuXHRcdFx0XHRcdHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gKGluc3RhbGxlZENodW5rRGF0YSA9IGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IFtyZXNvbHZlLCByZWplY3RdKSk7XG5cdFx0XHRcdFx0cHJvbWlzZXMucHVzaChpbnN0YWxsZWRDaHVua0RhdGFbMl0gPSBwcm9taXNlKTtcblxuXHRcdFx0XHRcdC8vIHN0YXJ0IGNodW5rIGxvYWRpbmdcblx0XHRcdFx0XHR2YXIgdXJsID0gX193ZWJwYWNrX3JlcXVpcmVfXy5wICsgX193ZWJwYWNrX3JlcXVpcmVfXy51KGNodW5rSWQpO1xuXHRcdFx0XHRcdC8vIGNyZWF0ZSBlcnJvciBiZWZvcmUgc3RhY2sgdW53b3VuZCB0byBnZXQgdXNlZnVsIHN0YWNrdHJhY2UgbGF0ZXJcblx0XHRcdFx0XHR2YXIgZXJyb3IgPSBuZXcgRXJyb3IoKTtcblx0XHRcdFx0XHR2YXIgbG9hZGluZ0VuZGVkID0gKGV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSkge1xuXHRcdFx0XHRcdFx0XHRpbnN0YWxsZWRDaHVua0RhdGEgPSBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF07XG5cdFx0XHRcdFx0XHRcdGlmKGluc3RhbGxlZENodW5rRGF0YSAhPT0gMCkgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0XHRpZihpbnN0YWxsZWRDaHVua0RhdGEpIHtcblx0XHRcdFx0XHRcdFx0XHR2YXIgZXJyb3JUeXBlID0gZXZlbnQgJiYgKGV2ZW50LnR5cGUgPT09ICdsb2FkJyA/ICdtaXNzaW5nJyA6IGV2ZW50LnR5cGUpO1xuXHRcdFx0XHRcdFx0XHRcdHZhciByZWFsU3JjID0gZXZlbnQgJiYgZXZlbnQudGFyZ2V0ICYmIGV2ZW50LnRhcmdldC5zcmM7XG5cdFx0XHRcdFx0XHRcdFx0ZXJyb3IubWVzc2FnZSA9ICdMb2FkaW5nIGNodW5rICcgKyBjaHVua0lkICsgJyBmYWlsZWQuXFxuKCcgKyBlcnJvclR5cGUgKyAnOiAnICsgcmVhbFNyYyArICcpJztcblx0XHRcdFx0XHRcdFx0XHRlcnJvci5uYW1lID0gJ0NodW5rTG9hZEVycm9yJztcblx0XHRcdFx0XHRcdFx0XHRlcnJvci50eXBlID0gZXJyb3JUeXBlO1xuXHRcdFx0XHRcdFx0XHRcdGVycm9yLnJlcXVlc3QgPSByZWFsU3JjO1xuXHRcdFx0XHRcdFx0XHRcdGluc3RhbGxlZENodW5rRGF0YVsxXShlcnJvcik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubCh1cmwsIGxvYWRpbmdFbmRlZCwgXCJjaHVuay1cIiArIGNodW5rSWQsIGNodW5rSWQpO1xuXHRcdFx0XHR9IGVsc2UgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0XHRcdH1cblx0XHR9XG59O1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIFtjaHVua0lkcywgbW9yZU1vZHVsZXMsIHJ1bnRpbWVdID0gZGF0YTtcblx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG5cdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuXHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwO1xuXHRpZihjaHVua0lkcy5zb21lKChpZCkgPT4gKGluc3RhbGxlZENodW5rc1tpZF0gIT09IDApKSkge1xuXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYocnVudGltZSkgdmFyIHJlc3VsdCA9IHJ1bnRpbWUoX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdH1cblx0aWYocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24pIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xuXHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJiBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXVswXSgpO1xuXHRcdH1cblx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuXHR9XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLk8ocmVzdWx0KTtcbn1cblxudmFyIGNodW5rTG9hZGluZ0dsb2JhbCA9IGdsb2JhbFtcIndlYnBhY2tDaHVua2d1aXYyXCJdID0gZ2xvYmFsW1wid2VicGFja0NodW5rZ3VpdjJcIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubmMgPSB1bmRlZmluZWQ7IiwiIiwiIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9