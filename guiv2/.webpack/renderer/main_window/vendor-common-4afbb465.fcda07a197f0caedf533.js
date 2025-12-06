(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[9450],{

/***/ 25508:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Mz: () => (/* binding */ createSelector)
/* harmony export */ });
/* unused harmony exports createSelectorCreator, createStructuredSelector, lruMemoize, referenceEqualityCheck, setGlobalDevModeChecks, unstable_autotrackMemoize, weakMapMemoize */
// src/devModeChecks/identityFunctionCheck.ts
var runIdentityFunctionCheck = (resultFunc, inputSelectorsResults, outputSelectorResult) => {
  if (inputSelectorsResults.length === 1 && inputSelectorsResults[0] === outputSelectorResult) {
    let isInputSameAsOutput = false;
    try {
      const emptyObject = {};
      if (resultFunc(emptyObject) === emptyObject)
        isInputSameAsOutput = true;
    } catch {
    }
    if (isInputSameAsOutput) {
      let stack = void 0;
      try {
        throw new Error();
      } catch (e) {
        ;
        ({ stack } = e);
      }
      console.warn(
        "The result function returned its own inputs without modification. e.g\n`createSelector([state => state.todos], todos => todos)`\nThis could lead to inefficient memoization and unnecessary re-renders.\nEnsure transformation logic is in the result function, and extraction logic is in the input selectors.",
        { stack }
      );
    }
  }
};

// src/devModeChecks/inputStabilityCheck.ts
var runInputStabilityCheck = (inputSelectorResultsObject, options, inputSelectorArgs) => {
  const { memoize, memoizeOptions } = options;
  const { inputSelectorResults, inputSelectorResultsCopy } = inputSelectorResultsObject;
  const createAnEmptyObject = memoize(() => ({}), ...memoizeOptions);
  const areInputSelectorResultsEqual = createAnEmptyObject.apply(null, inputSelectorResults) === createAnEmptyObject.apply(null, inputSelectorResultsCopy);
  if (!areInputSelectorResultsEqual) {
    let stack = void 0;
    try {
      throw new Error();
    } catch (e) {
      ;
      ({ stack } = e);
    }
    console.warn(
      "An input selector returned a different result when passed same arguments.\nThis means your output selector will likely run more frequently than intended.\nAvoid returning a new reference inside your input selector, e.g.\n`createSelector([state => state.todos.map(todo => todo.id)], todoIds => todoIds.length)`",
      {
        arguments: inputSelectorArgs,
        firstInputs: inputSelectorResults,
        secondInputs: inputSelectorResultsCopy,
        stack
      }
    );
  }
};

// src/devModeChecks/setGlobalDevModeChecks.ts
var globalDevModeChecks = {
  inputStabilityCheck: "once",
  identityFunctionCheck: "once"
};
var setGlobalDevModeChecks = (devModeChecks) => {
  Object.assign(globalDevModeChecks, devModeChecks);
};

// src/utils.ts
var NOT_FOUND = /* @__PURE__ */ (/* unused pure expression or super */ null && (Symbol("NOT_FOUND")));
function assertIsFunction(func, errorMessage = `expected a function, instead received ${typeof func}`) {
  if (typeof func !== "function") {
    throw new TypeError(errorMessage);
  }
}
function assertIsObject(object, errorMessage = `expected an object, instead received ${typeof object}`) {
  if (typeof object !== "object") {
    throw new TypeError(errorMessage);
  }
}
function assertIsArrayOfFunctions(array, errorMessage = `expected all items to be functions, instead received the following types: `) {
  if (!array.every((item) => typeof item === "function")) {
    const itemTypes = array.map(
      (item) => typeof item === "function" ? `function ${item.name || "unnamed"}()` : typeof item
    ).join(", ");
    throw new TypeError(`${errorMessage}[${itemTypes}]`);
  }
}
var ensureIsArray = (item) => {
  return Array.isArray(item) ? item : [item];
};
function getDependencies(createSelectorArgs) {
  const dependencies = Array.isArray(createSelectorArgs[0]) ? createSelectorArgs[0] : createSelectorArgs;
  assertIsArrayOfFunctions(
    dependencies,
    `createSelector expects all input-selectors to be functions, but received the following types: `
  );
  return dependencies;
}
function collectInputSelectorResults(dependencies, inputSelectorArgs) {
  const inputSelectorResults = [];
  const { length } = dependencies;
  for (let i = 0; i < length; i++) {
    inputSelectorResults.push(dependencies[i].apply(null, inputSelectorArgs));
  }
  return inputSelectorResults;
}
var getDevModeChecksExecutionInfo = (firstRun, devModeChecks) => {
  const { identityFunctionCheck, inputStabilityCheck } = {
    ...globalDevModeChecks,
    ...devModeChecks
  };
  return {
    identityFunctionCheck: {
      shouldRun: identityFunctionCheck === "always" || identityFunctionCheck === "once" && firstRun,
      run: runIdentityFunctionCheck
    },
    inputStabilityCheck: {
      shouldRun: inputStabilityCheck === "always" || inputStabilityCheck === "once" && firstRun,
      run: runInputStabilityCheck
    }
  };
};

// src/autotrackMemoize/autotracking.ts
var $REVISION = 0;
var CURRENT_TRACKER = null;
var Cell = class {
  revision = $REVISION;
  _value;
  _lastValue;
  _isEqual = tripleEq;
  constructor(initialValue, isEqual = tripleEq) {
    this._value = this._lastValue = initialValue;
    this._isEqual = isEqual;
  }
  // Whenever a storage value is read, it'll add itself to the current tracker if
  // one exists, entangling its state with that cache.
  get value() {
    CURRENT_TRACKER?.add(this);
    return this._value;
  }
  // Whenever a storage value is updated, we bump the global revision clock,
  // assign the revision for this storage to the new value, _and_ we schedule a
  // rerender. This is important, and it's what makes autotracking  _pull_
  // based. We don't actively tell the caches which depend on the storage that
  // anything has happened. Instead, we recompute the caches when needed.
  set value(newValue) {
    if (this.value === newValue)
      return;
    this._value = newValue;
    this.revision = ++$REVISION;
  }
};
function tripleEq(a, b) {
  return a === b;
}
var TrackingCache = class {
  _cachedValue;
  _cachedRevision = -1;
  _deps = [];
  hits = 0;
  fn;
  constructor(fn) {
    this.fn = fn;
  }
  clear() {
    this._cachedValue = void 0;
    this._cachedRevision = -1;
    this._deps = [];
    this.hits = 0;
  }
  get value() {
    if (this.revision > this._cachedRevision) {
      const { fn } = this;
      const currentTracker = /* @__PURE__ */ new Set();
      const prevTracker = CURRENT_TRACKER;
      CURRENT_TRACKER = currentTracker;
      this._cachedValue = fn();
      CURRENT_TRACKER = prevTracker;
      this.hits++;
      this._deps = Array.from(currentTracker);
      this._cachedRevision = this.revision;
    }
    CURRENT_TRACKER?.add(this);
    return this._cachedValue;
  }
  get revision() {
    return Math.max(...this._deps.map((d) => d.revision), 0);
  }
};
function getValue(cell) {
  if (!(cell instanceof Cell)) {
    console.warn("Not a valid cell! ", cell);
  }
  return cell.value;
}
function setValue(storage, value) {
  if (!(storage instanceof Cell)) {
    throw new TypeError(
      "setValue must be passed a tracked store created with `createStorage`."
    );
  }
  storage.value = storage._lastValue = value;
}
function createCell(initialValue, isEqual = tripleEq) {
  return new Cell(initialValue, isEqual);
}
function createCache(fn) {
  assertIsFunction(
    fn,
    "the first parameter to `createCache` must be a function"
  );
  return new TrackingCache(fn);
}

// src/autotrackMemoize/tracking.ts
var neverEq = (a, b) => false;
function createTag() {
  return createCell(null, neverEq);
}
function dirtyTag(tag, value) {
  setValue(tag, value);
}
var consumeCollection = (node) => {
  let tag = node.collectionTag;
  if (tag === null) {
    tag = node.collectionTag = createTag();
  }
  getValue(tag);
};
var dirtyCollection = (node) => {
  const tag = node.collectionTag;
  if (tag !== null) {
    dirtyTag(tag, null);
  }
};

// src/autotrackMemoize/proxy.ts
var REDUX_PROXY_LABEL = Symbol();
var nextId = 0;
var proto = Object.getPrototypeOf({});
var ObjectTreeNode = class {
  constructor(value) {
    this.value = value;
    this.value = value;
    this.tag.value = value;
  }
  proxy = new Proxy(this, objectProxyHandler);
  tag = createTag();
  tags = {};
  children = {};
  collectionTag = null;
  id = nextId++;
};
var objectProxyHandler = {
  get(node, key) {
    function calculateResult() {
      const { value } = node;
      const childValue = Reflect.get(value, key);
      if (typeof key === "symbol") {
        return childValue;
      }
      if (key in proto) {
        return childValue;
      }
      if (typeof childValue === "object" && childValue !== null) {
        let childNode = node.children[key];
        if (childNode === void 0) {
          childNode = node.children[key] = createNode(childValue);
        }
        if (childNode.tag) {
          getValue(childNode.tag);
        }
        return childNode.proxy;
      } else {
        let tag = node.tags[key];
        if (tag === void 0) {
          tag = node.tags[key] = createTag();
          tag.value = childValue;
        }
        getValue(tag);
        return childValue;
      }
    }
    const res = calculateResult();
    return res;
  },
  ownKeys(node) {
    consumeCollection(node);
    return Reflect.ownKeys(node.value);
  },
  getOwnPropertyDescriptor(node, prop) {
    return Reflect.getOwnPropertyDescriptor(node.value, prop);
  },
  has(node, prop) {
    return Reflect.has(node.value, prop);
  }
};
var ArrayTreeNode = class {
  constructor(value) {
    this.value = value;
    this.value = value;
    this.tag.value = value;
  }
  proxy = new Proxy([this], arrayProxyHandler);
  tag = createTag();
  tags = {};
  children = {};
  collectionTag = null;
  id = nextId++;
};
var arrayProxyHandler = {
  get([node], key) {
    if (key === "length") {
      consumeCollection(node);
    }
    return objectProxyHandler.get(node, key);
  },
  ownKeys([node]) {
    return objectProxyHandler.ownKeys(node);
  },
  getOwnPropertyDescriptor([node], prop) {
    return objectProxyHandler.getOwnPropertyDescriptor(node, prop);
  },
  has([node], prop) {
    return objectProxyHandler.has(node, prop);
  }
};
function createNode(value) {
  if (Array.isArray(value)) {
    return new ArrayTreeNode(value);
  }
  return new ObjectTreeNode(value);
}
function updateNode(node, newValue) {
  const { value, tags, children } = node;
  node.value = newValue;
  if (Array.isArray(value) && Array.isArray(newValue) && value.length !== newValue.length) {
    dirtyCollection(node);
  } else {
    if (value !== newValue) {
      let oldKeysSize = 0;
      let newKeysSize = 0;
      let anyKeysAdded = false;
      for (const _key in value) {
        oldKeysSize++;
      }
      for (const key in newValue) {
        newKeysSize++;
        if (!(key in value)) {
          anyKeysAdded = true;
          break;
        }
      }
      const isDifferent = anyKeysAdded || oldKeysSize !== newKeysSize;
      if (isDifferent) {
        dirtyCollection(node);
      }
    }
  }
  for (const key in tags) {
    const childValue = value[key];
    const newChildValue = newValue[key];
    if (childValue !== newChildValue) {
      dirtyCollection(node);
      dirtyTag(tags[key], newChildValue);
    }
    if (typeof newChildValue === "object" && newChildValue !== null) {
      delete tags[key];
    }
  }
  for (const key in children) {
    const childNode = children[key];
    const newChildValue = newValue[key];
    const childValue = childNode.value;
    if (childValue === newChildValue) {
      continue;
    } else if (typeof newChildValue === "object" && newChildValue !== null) {
      updateNode(childNode, newChildValue);
    } else {
      deleteNode(childNode);
      delete children[key];
    }
  }
}
function deleteNode(node) {
  if (node.tag) {
    dirtyTag(node.tag, null);
  }
  dirtyCollection(node);
  for (const key in node.tags) {
    dirtyTag(node.tags[key], null);
  }
  for (const key in node.children) {
    deleteNode(node.children[key]);
  }
}

// src/lruMemoize.ts
function createSingletonCache(equals) {
  let entry;
  return {
    get(key) {
      if (entry && equals(entry.key, key)) {
        return entry.value;
      }
      return NOT_FOUND;
    },
    put(key, value) {
      entry = { key, value };
    },
    getEntries() {
      return entry ? [entry] : [];
    },
    clear() {
      entry = void 0;
    }
  };
}
function createLruCache(maxSize, equals) {
  let entries = [];
  function get(key) {
    const cacheIndex = entries.findIndex((entry) => equals(key, entry.key));
    if (cacheIndex > -1) {
      const entry = entries[cacheIndex];
      if (cacheIndex > 0) {
        entries.splice(cacheIndex, 1);
        entries.unshift(entry);
      }
      return entry.value;
    }
    return NOT_FOUND;
  }
  function put(key, value) {
    if (get(key) === NOT_FOUND) {
      entries.unshift({ key, value });
      if (entries.length > maxSize) {
        entries.pop();
      }
    }
  }
  function getEntries() {
    return entries;
  }
  function clear() {
    entries = [];
  }
  return { get, put, getEntries, clear };
}
var referenceEqualityCheck = (a, b) => a === b;
function createCacheKeyComparator(equalityCheck) {
  return function areArgumentsShallowlyEqual(prev, next) {
    if (prev === null || next === null || prev.length !== next.length) {
      return false;
    }
    const { length } = prev;
    for (let i = 0; i < length; i++) {
      if (!equalityCheck(prev[i], next[i])) {
        return false;
      }
    }
    return true;
  };
}
function lruMemoize(func, equalityCheckOrOptions) {
  const providedOptions = typeof equalityCheckOrOptions === "object" ? equalityCheckOrOptions : { equalityCheck: equalityCheckOrOptions };
  const {
    equalityCheck = referenceEqualityCheck,
    maxSize = 1,
    resultEqualityCheck
  } = providedOptions;
  const comparator = createCacheKeyComparator(equalityCheck);
  let resultsCount = 0;
  const cache = maxSize <= 1 ? createSingletonCache(comparator) : createLruCache(maxSize, comparator);
  function memoized() {
    let value = cache.get(arguments);
    if (value === NOT_FOUND) {
      value = func.apply(null, arguments);
      resultsCount++;
      if (resultEqualityCheck) {
        const entries = cache.getEntries();
        const matchingEntry = entries.find(
          (entry) => resultEqualityCheck(entry.value, value)
        );
        if (matchingEntry) {
          value = matchingEntry.value;
          resultsCount !== 0 && resultsCount--;
        }
      }
      cache.put(arguments, value);
    }
    return value;
  }
  memoized.clearCache = () => {
    cache.clear();
    memoized.resetResultsCount();
  };
  memoized.resultsCount = () => resultsCount;
  memoized.resetResultsCount = () => {
    resultsCount = 0;
  };
  return memoized;
}

// src/autotrackMemoize/autotrackMemoize.ts
function autotrackMemoize(func) {
  const node = createNode(
    []
  );
  let lastArgs = null;
  const shallowEqual = createCacheKeyComparator(referenceEqualityCheck);
  const cache = createCache(() => {
    const res = func.apply(null, node.proxy);
    return res;
  });
  function memoized() {
    if (!shallowEqual(lastArgs, arguments)) {
      updateNode(node, arguments);
      lastArgs = arguments;
    }
    return cache.value;
  }
  memoized.clearCache = () => {
    return cache.clear();
  };
  return memoized;
}

// src/weakMapMemoize.ts
var StrongRef = class {
  constructor(value) {
    this.value = value;
  }
  deref() {
    return this.value;
  }
};
var Ref = typeof WeakRef !== "undefined" ? WeakRef : StrongRef;
var UNTERMINATED = 0;
var TERMINATED = 1;
function createCacheNode() {
  return {
    s: UNTERMINATED,
    v: void 0,
    o: null,
    p: null
  };
}
function weakMapMemoize(func, options = {}) {
  let fnNode = createCacheNode();
  const { resultEqualityCheck } = options;
  let lastResult;
  let resultsCount = 0;
  function memoized() {
    let cacheNode = fnNode;
    const { length } = arguments;
    for (let i = 0, l = length; i < l; i++) {
      const arg = arguments[i];
      if (typeof arg === "function" || typeof arg === "object" && arg !== null) {
        let objectCache = cacheNode.o;
        if (objectCache === null) {
          cacheNode.o = objectCache = /* @__PURE__ */ new WeakMap();
        }
        const objectNode = objectCache.get(arg);
        if (objectNode === void 0) {
          cacheNode = createCacheNode();
          objectCache.set(arg, cacheNode);
        } else {
          cacheNode = objectNode;
        }
      } else {
        let primitiveCache = cacheNode.p;
        if (primitiveCache === null) {
          cacheNode.p = primitiveCache = /* @__PURE__ */ new Map();
        }
        const primitiveNode = primitiveCache.get(arg);
        if (primitiveNode === void 0) {
          cacheNode = createCacheNode();
          primitiveCache.set(arg, cacheNode);
        } else {
          cacheNode = primitiveNode;
        }
      }
    }
    const terminatedNode = cacheNode;
    let result;
    if (cacheNode.s === TERMINATED) {
      result = cacheNode.v;
    } else {
      result = func.apply(null, arguments);
      resultsCount++;
      if (resultEqualityCheck) {
        const lastResultValue = lastResult?.deref?.() ?? lastResult;
        if (lastResultValue != null && resultEqualityCheck(lastResultValue, result)) {
          result = lastResultValue;
          resultsCount !== 0 && resultsCount--;
        }
        const needsWeakRef = typeof result === "object" && result !== null || typeof result === "function";
        lastResult = needsWeakRef ? new Ref(result) : result;
      }
    }
    terminatedNode.s = TERMINATED;
    terminatedNode.v = result;
    return result;
  }
  memoized.clearCache = () => {
    fnNode = createCacheNode();
    memoized.resetResultsCount();
  };
  memoized.resultsCount = () => resultsCount;
  memoized.resetResultsCount = () => {
    resultsCount = 0;
  };
  return memoized;
}

// src/createSelectorCreator.ts
function createSelectorCreator(memoizeOrOptions, ...memoizeOptionsFromArgs) {
  const createSelectorCreatorOptions = typeof memoizeOrOptions === "function" ? {
    memoize: memoizeOrOptions,
    memoizeOptions: memoizeOptionsFromArgs
  } : memoizeOrOptions;
  const createSelector2 = (...createSelectorArgs) => {
    let recomputations = 0;
    let dependencyRecomputations = 0;
    let lastResult;
    let directlyPassedOptions = {};
    let resultFunc = createSelectorArgs.pop();
    if (typeof resultFunc === "object") {
      directlyPassedOptions = resultFunc;
      resultFunc = createSelectorArgs.pop();
    }
    assertIsFunction(
      resultFunc,
      `createSelector expects an output function after the inputs, but received: [${typeof resultFunc}]`
    );
    const combinedOptions = {
      ...createSelectorCreatorOptions,
      ...directlyPassedOptions
    };
    const {
      memoize,
      memoizeOptions = [],
      argsMemoize = weakMapMemoize,
      argsMemoizeOptions = [],
      devModeChecks = {}
    } = combinedOptions;
    const finalMemoizeOptions = ensureIsArray(memoizeOptions);
    const finalArgsMemoizeOptions = ensureIsArray(argsMemoizeOptions);
    const dependencies = getDependencies(createSelectorArgs);
    const memoizedResultFunc = memoize(function recomputationWrapper() {
      recomputations++;
      return resultFunc.apply(
        null,
        arguments
      );
    }, ...finalMemoizeOptions);
    let firstRun = true;
    const selector = argsMemoize(function dependenciesChecker() {
      dependencyRecomputations++;
      const inputSelectorResults = collectInputSelectorResults(
        dependencies,
        arguments
      );
      lastResult = memoizedResultFunc.apply(null, inputSelectorResults);
      if (true) {
        const { identityFunctionCheck, inputStabilityCheck } = getDevModeChecksExecutionInfo(firstRun, devModeChecks);
        if (identityFunctionCheck.shouldRun) {
          identityFunctionCheck.run(
            resultFunc,
            inputSelectorResults,
            lastResult
          );
        }
        if (inputStabilityCheck.shouldRun) {
          const inputSelectorResultsCopy = collectInputSelectorResults(
            dependencies,
            arguments
          );
          inputStabilityCheck.run(
            { inputSelectorResults, inputSelectorResultsCopy },
            { memoize, memoizeOptions: finalMemoizeOptions },
            arguments
          );
        }
        if (firstRun)
          firstRun = false;
      }
      return lastResult;
    }, ...finalArgsMemoizeOptions);
    return Object.assign(selector, {
      resultFunc,
      memoizedResultFunc,
      dependencies,
      dependencyRecomputations: () => dependencyRecomputations,
      resetDependencyRecomputations: () => {
        dependencyRecomputations = 0;
      },
      lastResult: () => lastResult,
      recomputations: () => recomputations,
      resetRecomputations: () => {
        recomputations = 0;
      },
      memoize,
      argsMemoize
    });
  };
  Object.assign(createSelector2, {
    withTypes: () => createSelector2
  });
  return createSelector2;
}
var createSelector = /* @__PURE__ */ createSelectorCreator(weakMapMemoize);

// src/createStructuredSelector.ts
var createStructuredSelector = Object.assign(
  (inputSelectorsObject, selectorCreator = createSelector) => {
    assertIsObject(
      inputSelectorsObject,
      `createStructuredSelector expects first argument to be an object where each property is a selector, instead received a ${typeof inputSelectorsObject}`
    );
    const inputSelectorKeys = Object.keys(inputSelectorsObject);
    const dependencies = inputSelectorKeys.map(
      (key) => inputSelectorsObject[key]
    );
    const structuredSelector = selectorCreator(
      dependencies,
      (...inputSelectorResults) => {
        return inputSelectorResults.reduce((composition, value, index) => {
          composition[inputSelectorKeys[index]] = value;
          return composition;
        }, {});
      }
    );
    return structuredSelector;
  },
  { withTypes: () => createStructuredSelector }
);

//# sourceMappingURL=reselect.mjs.map

/***/ }),

/***/ 82855:
/***/ ((module) => {

/*
	Based on rgbcolor.js by Stoyan Stefanov <sstoo@gmail.com>
	http://www.phpied.com/rgb-color-parser-in-javascript/
*/

module.exports = function(color_string) {
    this.ok = false;
    this.alpha = 1.0;

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1,6);
    }

    color_string = color_string.replace(/ /g,'');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred : 'cd5c5c',
        indigo : '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        rebeccapurple: '663399',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    color_string = simple_colors[color_string] || color_string;
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [
        {
            re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*((?:\d?\.)?\d)\)$/,
            example: ['rgba(123, 234, 45, 0.8)', 'rgba(255,234,245,1.0)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3]),
                    parseFloat(bits[4])
                ];
            }
        },
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
            re: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            example: ['#fb0', 'f0f'],
            process: function (bits){
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            var channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            if (channels.length > 3) {
                this.alpha = channels[3];
            }
            this.ok = true;
        }

    }

    // validate/cleanup values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);
    this.alpha = (this.alpha < 0) ? 0 : ((this.alpha > 1.0 || isNaN(this.alpha)) ? 1.0 : this.alpha);

    // some getters
    this.toRGB = function () {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    }
    this.toRGBA = function () {
        return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.alpha + ')';
    }
    this.toHex = function () {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    }

    // help
    this.getHelpXML = function () {

        var examples = new Array();
        // add regexps
        for (var i = 0; i < color_defs.length; i++) {
            var example = color_defs[i].example;
            for (var j = 0; j < example.length; j++) {
                examples[examples.length] = example[j];
            }
        }
        // add type-in colors
        for (var sc in simple_colors) {
            examples[examples.length] = sc;
        }

        var xml = document.createElement('ul');
        xml.setAttribute('id', 'rgbcolor-examples');
        for (var i = 0; i < examples.length; i++) {
            try {
                var list_item = document.createElement('li');
                var list_color = new RGBColor(examples[i]);
                var example_div = document.createElement('div');
                example_div.style.cssText =
                        'margin: 3px; '
                        + 'border: 1px solid black; '
                        + 'background:' + list_color.toHex() + '; '
                        + 'color:' + list_color.toHex()
                ;
                example_div.appendChild(document.createTextNode('test'));
                var list_item_value = document.createTextNode(
                    ' ' + examples[i] + ' -> ' + list_color.toRGB() + ' -> ' + list_color.toHex()
                );
                list_item.appendChild(example_div);
                list_item.appendChild(list_item_value);
                xml.appendChild(list_item);

            } catch(e){}
        }
        return xml;

    }

}


/***/ }),

/***/ 82960:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   y$: () => (/* binding */ createStore)
/* harmony export */ });
/* unused harmony exports __DO_NOT_USE__ActionTypes, applyMiddleware, bindActionCreators, combineReducers, compose, legacy_createStore */
/* harmony import */ var _babel_runtime_helpers_esm_objectSpread2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(22555);


/**
 * Adapted from React: https://github.com/facebook/react/blob/master/packages/shared/formatProdErrorMessage.js
 *
 * Do not require this module directly! Use normal throw error calls. These messages will be replaced with error codes
 * during build.
 * @param {number} code
 */
function formatProdErrorMessage(code) {
  return "Minified Redux error #" + code + "; visit https://redux.js.org/Errors?code=" + code + " for the full message or " + 'use the non-minified dev environment for full errors. ';
}

// Inlined version of the `symbol-observable` polyfill
var $$observable = (function () {
  return typeof Symbol === 'function' && Symbol.observable || '@@observable';
})();

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var randomString = function randomString() {
  return Math.random().toString(36).substring(7).split('').join('.');
};

var ActionTypes = {
  INIT: "@@redux/INIT" + randomString(),
  REPLACE: "@@redux/REPLACE" + randomString(),
  PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
    return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
  }
};

/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */
function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  var proto = obj;

  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}

// Inlined / shortened version of `kindOf` from https://github.com/jonschlinkert/kind-of
function miniKindOf(val) {
  if (val === void 0) return 'undefined';
  if (val === null) return 'null';
  var type = typeof val;

  switch (type) {
    case 'boolean':
    case 'string':
    case 'number':
    case 'symbol':
    case 'function':
      {
        return type;
      }
  }

  if (Array.isArray(val)) return 'array';
  if (isDate(val)) return 'date';
  if (isError(val)) return 'error';
  var constructorName = ctorName(val);

  switch (constructorName) {
    case 'Symbol':
    case 'Promise':
    case 'WeakMap':
    case 'WeakSet':
    case 'Map':
    case 'Set':
      return constructorName;
  } // other


  return type.slice(8, -1).toLowerCase().replace(/\s/g, '');
}

function ctorName(val) {
  return typeof val.constructor === 'function' ? val.constructor.name : null;
}

function isError(val) {
  return val instanceof Error || typeof val.message === 'string' && val.constructor && typeof val.constructor.stackTraceLimit === 'number';
}

function isDate(val) {
  if (val instanceof Date) return true;
  return typeof val.toDateString === 'function' && typeof val.getDate === 'function' && typeof val.setDate === 'function';
}

function kindOf(val) {
  var typeOfVal = typeof val;

  if (true) {
    typeOfVal = miniKindOf(val);
  }

  return typeOfVal;
}

/**
 * @deprecated
 *
 * **We recommend using the `configureStore` method
 * of the `@reduxjs/toolkit` package**, which replaces `createStore`.
 *
 * Redux Toolkit is our recommended approach for writing Redux logic today,
 * including store setup, reducers, data fetching, and more.
 *
 * **For more details, please read this Redux docs page:**
 * **https://redux.js.org/introduction/why-rtk-is-redux-today**
 *
 * `configureStore` from Redux Toolkit is an improved version of `createStore` that
 * simplifies setup and helps avoid common bugs.
 *
 * You should not be using the `redux` core package by itself today, except for learning purposes.
 * The `createStore` method from the core `redux` package will not be removed, but we encourage
 * all users to migrate to using Redux Toolkit for all Redux code.
 *
 * If you want to use `createStore` without this visual deprecation warning, use
 * the `legacy_createStore` import instead:
 *
 * `import { legacy_createStore as createStore} from 'redux'`
 *
 */

function createStore(reducer, preloadedState, enhancer) {
  var _ref2;

  if (typeof preloadedState === 'function' && typeof enhancer === 'function' || typeof enhancer === 'function' && typeof arguments[3] === 'function') {
    throw new Error( false ? 0 : 'It looks like you are passing several store enhancers to ' + 'createStore(). This is not supported. Instead, compose them ' + 'together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.');
  }

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error( false ? 0 : "Expected the enhancer to be a function. Instead, received: '" + kindOf(enhancer) + "'");
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error( false ? 0 : "Expected the root reducer to be a function. Instead, received: '" + kindOf(reducer) + "'");
  }

  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;
  /**
   * This makes a shallow copy of currentListeners so we can use
   * nextListeners as a temporary list while dispatching.
   *
   * This prevents any bugs around consumers calling
   * subscribe/unsubscribe in the middle of a dispatch.
   */

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }
  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */


  function getState() {
    if (isDispatching) {
      throw new Error( false ? 0 : 'You may not call store.getState() while the reducer is executing. ' + 'The reducer has already received the state as an argument. ' + 'Pass it down from the top reducer instead of reading it from the store.');
    }

    return currentState;
  }
  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */


  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error( false ? 0 : "Expected the listener to be a function. Instead, received: '" + kindOf(listener) + "'");
    }

    if (isDispatching) {
      throw new Error( false ? 0 : 'You may not call store.subscribe() while the reducer is executing. ' + 'If you would like to be notified after the store has been updated, subscribe from a ' + 'component and invoke store.getState() in the callback to access the latest state. ' + 'See https://redux.js.org/api/store#subscribelistener for more details.');
    }

    var isSubscribed = true;
    ensureCanMutateNextListeners();
    nextListeners.push(listener);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      if (isDispatching) {
        throw new Error( false ? 0 : 'You may not unsubscribe from a store listener while the reducer is executing. ' + 'See https://redux.js.org/api/store#subscribelistener for more details.');
      }

      isSubscribed = false;
      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }
  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */


  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error( false ? 0 : "Actions must be plain objects. Instead, the actual type was: '" + kindOf(action) + "'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.");
    }

    if (typeof action.type === 'undefined') {
      throw new Error( false ? 0 : 'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.');
    }

    if (isDispatching) {
      throw new Error( false ? 0 : 'Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;

    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      listener();
    }

    return action;
  }
  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */


  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error( false ? 0 : "Expected the nextReducer to be a function. Instead, received: '" + kindOf(nextReducer));
    }

    currentReducer = nextReducer; // This action has a similiar effect to ActionTypes.INIT.
    // Any reducers that existed in both the new and old rootReducer
    // will receive the previous state. This effectively populates
    // the new state tree with any relevant data from the old one.

    dispatch({
      type: ActionTypes.REPLACE
    });
  }
  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */


  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object' || observer === null) {
          throw new Error( false ? 0 : "Expected the observer to be an object. Instead, received: '" + kindOf(observer) + "'");
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return {
          unsubscribe: unsubscribe
        };
      }
    }, _ref[$$observable] = function () {
      return this;
    }, _ref;
  } // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.


  dispatch({
    type: ActionTypes.INIT
  });
  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[$$observable] = observable, _ref2;
}
/**
 * Creates a Redux store that holds the state tree.
 *
 * **We recommend using `configureStore` from the
 * `@reduxjs/toolkit` package**, which replaces `createStore`:
 * **https://redux.js.org/introduction/why-rtk-is-redux-today**
 *
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} [enhancer] The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */

var legacy_createStore = (/* unused pure expression or super */ null && (createStore));

/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */


  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
  } catch (e) {} // eslint-disable-line no-empty

}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!isPlainObject(inputState)) {
    return "The " + argumentName + " has unexpected type of \"" + kindOf(inputState) + "\". Expected argument to be an object with the following " + ("keys: \"" + reducerKeys.join('", "') + "\"");
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
  });
  unexpectedKeys.forEach(function (key) {
    unexpectedKeyCache[key] = true;
  });
  if (action && action.type === ActionTypes.REPLACE) return;

  if (unexpectedKeys.length > 0) {
    return "Unexpected " + (unexpectedKeys.length > 1 ? 'keys' : 'key') + " " + ("\"" + unexpectedKeys.join('", "') + "\" found in " + argumentName + ". ") + "Expected to find one of the known reducer keys instead: " + ("\"" + reducerKeys.join('", "') + "\". Unexpected keys will be ignored.");
  }
}

function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, {
      type: ActionTypes.INIT
    });

    if (typeof initialState === 'undefined') {
      throw new Error( false ? 0 : "The slice reducer for key \"" + key + "\" returned undefined during initialization. " + "If the state passed to the reducer is undefined, you must " + "explicitly return the initial state. The initial state may " + "not be undefined. If you don't want to set a value for this reducer, " + "you can use null instead of undefined.");
    }

    if (typeof reducer(undefined, {
      type: ActionTypes.PROBE_UNKNOWN_ACTION()
    }) === 'undefined') {
      throw new Error( false ? 0 : "The slice reducer for key \"" + key + "\" returned undefined when probed with a random type. " + ("Don't try to handle '" + ActionTypes.INIT + "' or other actions in \"redux/*\" ") + "namespace. They are considered private. Instead, you must return the " + "current state for any unknown actions, unless it is undefined, " + "in which case you must return the initial state, regardless of the " + "action type. The initial state may not be undefined, but can be null.");
    }
  });
}
/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */


function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};

  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];

    if (true) {
      if (typeof reducers[key] === 'undefined') {
        warning("No reducer provided for key \"" + key + "\"");
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }

  var finalReducerKeys = Object.keys(finalReducers); // This is used to make sure we don't warn about the same
  // keys multiple times.

  var unexpectedKeyCache;

  if (true) {
    unexpectedKeyCache = {};
  }

  var shapeAssertionError;

  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  return function combination(state, action) {
    if (state === void 0) {
      state = {};
    }

    if (shapeAssertionError) {
      throw shapeAssertionError;
    }

    if (true) {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);

      if (warningMessage) {
        warning(warningMessage);
      }
    }

    var hasChanged = false;
    var nextState = {};

    for (var _i = 0; _i < finalReducerKeys.length; _i++) {
      var _key = finalReducerKeys[_i];
      var reducer = finalReducers[_key];
      var previousStateForKey = state[_key];
      var nextStateForKey = reducer(previousStateForKey, action);

      if (typeof nextStateForKey === 'undefined') {
        var actionType = action && action.type;
        throw new Error( false ? 0 : "When called with an action of type " + (actionType ? "\"" + String(actionType) + "\"" : '(unknown type)') + ", the slice reducer for key \"" + _key + "\" returned undefined. " + "To ignore an action, you must explicitly return the previous state. " + "If you want this reducer to hold no value, you can return null instead of undefined.");
      }

      nextState[_key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  };
}

function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(this, arguments));
  };
}
/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass an action creator as the first argument,
 * and get a dispatch wrapped function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */


function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error( false ? 0 : "bindActionCreators expected an object or a function, but instead received: '" + kindOf(actionCreators) + "'. " + "Did you write \"import ActionCreators from\" instead of \"import * as ActionCreators from\"?");
  }

  var boundActionCreators = {};

  for (var key in actionCreators) {
    var actionCreator = actionCreators[key];

    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }

  return boundActionCreators;
}

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
function compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
}

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */

function applyMiddleware() {
  for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function () {
      var store = createStore.apply(void 0, arguments);

      var _dispatch = function dispatch() {
        throw new Error( false ? 0 : 'Dispatching while constructing your middleware is not allowed. ' + 'Other middleware would not be applied to this dispatch.');
      };

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch() {
          return _dispatch.apply(void 0, arguments);
        }
      };
      var chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = compose.apply(void 0, chain)(store.dispatch);
      return _objectSpread(_objectSpread({}, store), {}, {
        dispatch: _dispatch
      });
    };
  };
}




/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi00YWZiYjQ2NS4wYTJmODBlMzk0YjUzZWYxM2YzNy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0EsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBVSwwQkFBMEI7QUFDcEMsVUFBVSxpREFBaUQ7QUFDM0QsK0NBQStDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxTQUFTLFFBQVE7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxnQ0FBZ0MsbUVBQW1CO0FBQ25ELHdGQUF3RixZQUFZO0FBQ3BHO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUZBQXVGLGNBQWM7QUFDckc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5REFBeUQsdUJBQXVCO0FBQ2hGO0FBQ0EsMkJBQTJCLGFBQWEsR0FBRyxVQUFVO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVUsU0FBUztBQUNuQixrQkFBa0IsWUFBWTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVSw2Q0FBNkM7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLEtBQUs7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQztBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsUUFBUTtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVLHdCQUF3QjtBQUNsQztBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxnQkFBZ0I7QUFDaEIsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLFlBQVk7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksU0FBUztBQUNyQixvQkFBb0IsWUFBWTtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0dBQWtHO0FBQ2xHO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEM7QUFDMUM7QUFDQSxVQUFVLHNCQUFzQjtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksU0FBUztBQUNyQixnQ0FBZ0MsT0FBTztBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0ZBQW9GLGtCQUFrQjtBQUN0RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVSxJQUFxQztBQUMvQyxnQkFBZ0IsNkNBQTZDO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxnREFBZ0Q7QUFDOUQsY0FBYyw4Q0FBOEM7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrSEFBK0gsNEJBQTRCO0FBQzNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLElBQUk7QUFDYjtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsSUFBSTtBQUNKO0FBVUU7QUFDRixxQzs7Ozs7OztBQ3R1QkE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EseUNBQXlDO0FBQ3pDO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLElBQUksU0FBUyxJQUFJLFNBQVMsSUFBSTtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSwyQkFBMkIsSUFBSSxTQUFTLElBQUksU0FBUyxJQUFJO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSwrQkFBK0IsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFO0FBQ2pFO0FBQ0E7QUFDQTtBQUNB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V0FBVyxhQUFhO0FBQ3hCLGFBQWEsVUFBVTtBQUN2Qjs7QUFFQTtBQUNBLDZFQUE2RSxhQUFhO0FBQzFGO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esd0JBQXdCLE1BQXFDLEdBQUcsQ0FBMEI7QUFDMUY7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBLDJDQUEyQyxZQUFZO0FBQ3ZEO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTs7QUFFb0oiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZXNlbGVjdC9kaXN0L3Jlc2VsZWN0Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZ2Jjb2xvci9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWR1eC9lcy9yZWR1eC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzcmMvZGV2TW9kZUNoZWNrcy9pZGVudGl0eUZ1bmN0aW9uQ2hlY2sudHNcbnZhciBydW5JZGVudGl0eUZ1bmN0aW9uQ2hlY2sgPSAocmVzdWx0RnVuYywgaW5wdXRTZWxlY3RvcnNSZXN1bHRzLCBvdXRwdXRTZWxlY3RvclJlc3VsdCkgPT4ge1xuICBpZiAoaW5wdXRTZWxlY3RvcnNSZXN1bHRzLmxlbmd0aCA9PT0gMSAmJiBpbnB1dFNlbGVjdG9yc1Jlc3VsdHNbMF0gPT09IG91dHB1dFNlbGVjdG9yUmVzdWx0KSB7XG4gICAgbGV0IGlzSW5wdXRTYW1lQXNPdXRwdXQgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZW1wdHlPYmplY3QgPSB7fTtcbiAgICAgIGlmIChyZXN1bHRGdW5jKGVtcHR5T2JqZWN0KSA9PT0gZW1wdHlPYmplY3QpXG4gICAgICAgIGlzSW5wdXRTYW1lQXNPdXRwdXQgPSB0cnVlO1xuICAgIH0gY2F0Y2gge1xuICAgIH1cbiAgICBpZiAoaXNJbnB1dFNhbWVBc091dHB1dCkge1xuICAgICAgbGV0IHN0YWNrID0gdm9pZCAwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIDtcbiAgICAgICAgKHsgc3RhY2sgfSA9IGUpO1xuICAgICAgfVxuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBcIlRoZSByZXN1bHQgZnVuY3Rpb24gcmV0dXJuZWQgaXRzIG93biBpbnB1dHMgd2l0aG91dCBtb2RpZmljYXRpb24uIGUuZ1xcbmBjcmVhdGVTZWxlY3Rvcihbc3RhdGUgPT4gc3RhdGUudG9kb3NdLCB0b2RvcyA9PiB0b2RvcylgXFxuVGhpcyBjb3VsZCBsZWFkIHRvIGluZWZmaWNpZW50IG1lbW9pemF0aW9uIGFuZCB1bm5lY2Vzc2FyeSByZS1yZW5kZXJzLlxcbkVuc3VyZSB0cmFuc2Zvcm1hdGlvbiBsb2dpYyBpcyBpbiB0aGUgcmVzdWx0IGZ1bmN0aW9uLCBhbmQgZXh0cmFjdGlvbiBsb2dpYyBpcyBpbiB0aGUgaW5wdXQgc2VsZWN0b3JzLlwiLFxuICAgICAgICB7IHN0YWNrIH1cbiAgICAgICk7XG4gICAgfVxuICB9XG59O1xuXG4vLyBzcmMvZGV2TW9kZUNoZWNrcy9pbnB1dFN0YWJpbGl0eUNoZWNrLnRzXG52YXIgcnVuSW5wdXRTdGFiaWxpdHlDaGVjayA9IChpbnB1dFNlbGVjdG9yUmVzdWx0c09iamVjdCwgb3B0aW9ucywgaW5wdXRTZWxlY3RvckFyZ3MpID0+IHtcbiAgY29uc3QgeyBtZW1vaXplLCBtZW1vaXplT3B0aW9ucyB9ID0gb3B0aW9ucztcbiAgY29uc3QgeyBpbnB1dFNlbGVjdG9yUmVzdWx0cywgaW5wdXRTZWxlY3RvclJlc3VsdHNDb3B5IH0gPSBpbnB1dFNlbGVjdG9yUmVzdWx0c09iamVjdDtcbiAgY29uc3QgY3JlYXRlQW5FbXB0eU9iamVjdCA9IG1lbW9pemUoKCkgPT4gKHt9KSwgLi4ubWVtb2l6ZU9wdGlvbnMpO1xuICBjb25zdCBhcmVJbnB1dFNlbGVjdG9yUmVzdWx0c0VxdWFsID0gY3JlYXRlQW5FbXB0eU9iamVjdC5hcHBseShudWxsLCBpbnB1dFNlbGVjdG9yUmVzdWx0cykgPT09IGNyZWF0ZUFuRW1wdHlPYmplY3QuYXBwbHkobnVsbCwgaW5wdXRTZWxlY3RvclJlc3VsdHNDb3B5KTtcbiAgaWYgKCFhcmVJbnB1dFNlbGVjdG9yUmVzdWx0c0VxdWFsKSB7XG4gICAgbGV0IHN0YWNrID0gdm9pZCAwO1xuICAgIHRyeSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICA7XG4gICAgICAoeyBzdGFjayB9ID0gZSk7XG4gICAgfVxuICAgIGNvbnNvbGUud2FybihcbiAgICAgIFwiQW4gaW5wdXQgc2VsZWN0b3IgcmV0dXJuZWQgYSBkaWZmZXJlbnQgcmVzdWx0IHdoZW4gcGFzc2VkIHNhbWUgYXJndW1lbnRzLlxcblRoaXMgbWVhbnMgeW91ciBvdXRwdXQgc2VsZWN0b3Igd2lsbCBsaWtlbHkgcnVuIG1vcmUgZnJlcXVlbnRseSB0aGFuIGludGVuZGVkLlxcbkF2b2lkIHJldHVybmluZyBhIG5ldyByZWZlcmVuY2UgaW5zaWRlIHlvdXIgaW5wdXQgc2VsZWN0b3IsIGUuZy5cXG5gY3JlYXRlU2VsZWN0b3IoW3N0YXRlID0+IHN0YXRlLnRvZG9zLm1hcCh0b2RvID0+IHRvZG8uaWQpXSwgdG9kb0lkcyA9PiB0b2RvSWRzLmxlbmd0aClgXCIsXG4gICAgICB7XG4gICAgICAgIGFyZ3VtZW50czogaW5wdXRTZWxlY3RvckFyZ3MsXG4gICAgICAgIGZpcnN0SW5wdXRzOiBpbnB1dFNlbGVjdG9yUmVzdWx0cyxcbiAgICAgICAgc2Vjb25kSW5wdXRzOiBpbnB1dFNlbGVjdG9yUmVzdWx0c0NvcHksXG4gICAgICAgIHN0YWNrXG4gICAgICB9XG4gICAgKTtcbiAgfVxufTtcblxuLy8gc3JjL2Rldk1vZGVDaGVja3Mvc2V0R2xvYmFsRGV2TW9kZUNoZWNrcy50c1xudmFyIGdsb2JhbERldk1vZGVDaGVja3MgPSB7XG4gIGlucHV0U3RhYmlsaXR5Q2hlY2s6IFwib25jZVwiLFxuICBpZGVudGl0eUZ1bmN0aW9uQ2hlY2s6IFwib25jZVwiXG59O1xudmFyIHNldEdsb2JhbERldk1vZGVDaGVja3MgPSAoZGV2TW9kZUNoZWNrcykgPT4ge1xuICBPYmplY3QuYXNzaWduKGdsb2JhbERldk1vZGVDaGVja3MsIGRldk1vZGVDaGVja3MpO1xufTtcblxuLy8gc3JjL3V0aWxzLnRzXG52YXIgTk9UX0ZPVU5EID0gLyogQF9fUFVSRV9fICovIFN5bWJvbChcIk5PVF9GT1VORFwiKTtcbmZ1bmN0aW9uIGFzc2VydElzRnVuY3Rpb24oZnVuYywgZXJyb3JNZXNzYWdlID0gYGV4cGVjdGVkIGEgZnVuY3Rpb24sIGluc3RlYWQgcmVjZWl2ZWQgJHt0eXBlb2YgZnVuY31gKSB7XG4gIGlmICh0eXBlb2YgZnVuYyAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihlcnJvck1lc3NhZ2UpO1xuICB9XG59XG5mdW5jdGlvbiBhc3NlcnRJc09iamVjdChvYmplY3QsIGVycm9yTWVzc2FnZSA9IGBleHBlY3RlZCBhbiBvYmplY3QsIGluc3RlYWQgcmVjZWl2ZWQgJHt0eXBlb2Ygb2JqZWN0fWApIHtcbiAgaWYgKHR5cGVvZiBvYmplY3QgIT09IFwib2JqZWN0XCIpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGVycm9yTWVzc2FnZSk7XG4gIH1cbn1cbmZ1bmN0aW9uIGFzc2VydElzQXJyYXlPZkZ1bmN0aW9ucyhhcnJheSwgZXJyb3JNZXNzYWdlID0gYGV4cGVjdGVkIGFsbCBpdGVtcyB0byBiZSBmdW5jdGlvbnMsIGluc3RlYWQgcmVjZWl2ZWQgdGhlIGZvbGxvd2luZyB0eXBlczogYCkge1xuICBpZiAoIWFycmF5LmV2ZXJ5KChpdGVtKSA9PiB0eXBlb2YgaXRlbSA9PT0gXCJmdW5jdGlvblwiKSkge1xuICAgIGNvbnN0IGl0ZW1UeXBlcyA9IGFycmF5Lm1hcChcbiAgICAgIChpdGVtKSA9PiB0eXBlb2YgaXRlbSA9PT0gXCJmdW5jdGlvblwiID8gYGZ1bmN0aW9uICR7aXRlbS5uYW1lIHx8IFwidW5uYW1lZFwifSgpYCA6IHR5cGVvZiBpdGVtXG4gICAgKS5qb2luKFwiLCBcIik7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgJHtlcnJvck1lc3NhZ2V9WyR7aXRlbVR5cGVzfV1gKTtcbiAgfVxufVxudmFyIGVuc3VyZUlzQXJyYXkgPSAoaXRlbSkgPT4ge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShpdGVtKSA/IGl0ZW0gOiBbaXRlbV07XG59O1xuZnVuY3Rpb24gZ2V0RGVwZW5kZW5jaWVzKGNyZWF0ZVNlbGVjdG9yQXJncykge1xuICBjb25zdCBkZXBlbmRlbmNpZXMgPSBBcnJheS5pc0FycmF5KGNyZWF0ZVNlbGVjdG9yQXJnc1swXSkgPyBjcmVhdGVTZWxlY3RvckFyZ3NbMF0gOiBjcmVhdGVTZWxlY3RvckFyZ3M7XG4gIGFzc2VydElzQXJyYXlPZkZ1bmN0aW9ucyhcbiAgICBkZXBlbmRlbmNpZXMsXG4gICAgYGNyZWF0ZVNlbGVjdG9yIGV4cGVjdHMgYWxsIGlucHV0LXNlbGVjdG9ycyB0byBiZSBmdW5jdGlvbnMsIGJ1dCByZWNlaXZlZCB0aGUgZm9sbG93aW5nIHR5cGVzOiBgXG4gICk7XG4gIHJldHVybiBkZXBlbmRlbmNpZXM7XG59XG5mdW5jdGlvbiBjb2xsZWN0SW5wdXRTZWxlY3RvclJlc3VsdHMoZGVwZW5kZW5jaWVzLCBpbnB1dFNlbGVjdG9yQXJncykge1xuICBjb25zdCBpbnB1dFNlbGVjdG9yUmVzdWx0cyA9IFtdO1xuICBjb25zdCB7IGxlbmd0aCB9ID0gZGVwZW5kZW5jaWVzO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaW5wdXRTZWxlY3RvclJlc3VsdHMucHVzaChkZXBlbmRlbmNpZXNbaV0uYXBwbHkobnVsbCwgaW5wdXRTZWxlY3RvckFyZ3MpKTtcbiAgfVxuICByZXR1cm4gaW5wdXRTZWxlY3RvclJlc3VsdHM7XG59XG52YXIgZ2V0RGV2TW9kZUNoZWNrc0V4ZWN1dGlvbkluZm8gPSAoZmlyc3RSdW4sIGRldk1vZGVDaGVja3MpID0+IHtcbiAgY29uc3QgeyBpZGVudGl0eUZ1bmN0aW9uQ2hlY2ssIGlucHV0U3RhYmlsaXR5Q2hlY2sgfSA9IHtcbiAgICAuLi5nbG9iYWxEZXZNb2RlQ2hlY2tzLFxuICAgIC4uLmRldk1vZGVDaGVja3NcbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBpZGVudGl0eUZ1bmN0aW9uQ2hlY2s6IHtcbiAgICAgIHNob3VsZFJ1bjogaWRlbnRpdHlGdW5jdGlvbkNoZWNrID09PSBcImFsd2F5c1wiIHx8IGlkZW50aXR5RnVuY3Rpb25DaGVjayA9PT0gXCJvbmNlXCIgJiYgZmlyc3RSdW4sXG4gICAgICBydW46IHJ1bklkZW50aXR5RnVuY3Rpb25DaGVja1xuICAgIH0sXG4gICAgaW5wdXRTdGFiaWxpdHlDaGVjazoge1xuICAgICAgc2hvdWxkUnVuOiBpbnB1dFN0YWJpbGl0eUNoZWNrID09PSBcImFsd2F5c1wiIHx8IGlucHV0U3RhYmlsaXR5Q2hlY2sgPT09IFwib25jZVwiICYmIGZpcnN0UnVuLFxuICAgICAgcnVuOiBydW5JbnB1dFN0YWJpbGl0eUNoZWNrXG4gICAgfVxuICB9O1xufTtcblxuLy8gc3JjL2F1dG90cmFja01lbW9pemUvYXV0b3RyYWNraW5nLnRzXG52YXIgJFJFVklTSU9OID0gMDtcbnZhciBDVVJSRU5UX1RSQUNLRVIgPSBudWxsO1xudmFyIENlbGwgPSBjbGFzcyB7XG4gIHJldmlzaW9uID0gJFJFVklTSU9OO1xuICBfdmFsdWU7XG4gIF9sYXN0VmFsdWU7XG4gIF9pc0VxdWFsID0gdHJpcGxlRXE7XG4gIGNvbnN0cnVjdG9yKGluaXRpYWxWYWx1ZSwgaXNFcXVhbCA9IHRyaXBsZUVxKSB7XG4gICAgdGhpcy5fdmFsdWUgPSB0aGlzLl9sYXN0VmFsdWUgPSBpbml0aWFsVmFsdWU7XG4gICAgdGhpcy5faXNFcXVhbCA9IGlzRXF1YWw7XG4gIH1cbiAgLy8gV2hlbmV2ZXIgYSBzdG9yYWdlIHZhbHVlIGlzIHJlYWQsIGl0J2xsIGFkZCBpdHNlbGYgdG8gdGhlIGN1cnJlbnQgdHJhY2tlciBpZlxuICAvLyBvbmUgZXhpc3RzLCBlbnRhbmdsaW5nIGl0cyBzdGF0ZSB3aXRoIHRoYXQgY2FjaGUuXG4gIGdldCB2YWx1ZSgpIHtcbiAgICBDVVJSRU5UX1RSQUNLRVI/LmFkZCh0aGlzKTtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cbiAgLy8gV2hlbmV2ZXIgYSBzdG9yYWdlIHZhbHVlIGlzIHVwZGF0ZWQsIHdlIGJ1bXAgdGhlIGdsb2JhbCByZXZpc2lvbiBjbG9jayxcbiAgLy8gYXNzaWduIHRoZSByZXZpc2lvbiBmb3IgdGhpcyBzdG9yYWdlIHRvIHRoZSBuZXcgdmFsdWUsIF9hbmRfIHdlIHNjaGVkdWxlIGFcbiAgLy8gcmVyZW5kZXIuIFRoaXMgaXMgaW1wb3J0YW50LCBhbmQgaXQncyB3aGF0IG1ha2VzIGF1dG90cmFja2luZyAgX3B1bGxfXG4gIC8vIGJhc2VkLiBXZSBkb24ndCBhY3RpdmVseSB0ZWxsIHRoZSBjYWNoZXMgd2hpY2ggZGVwZW5kIG9uIHRoZSBzdG9yYWdlIHRoYXRcbiAgLy8gYW55dGhpbmcgaGFzIGhhcHBlbmVkLiBJbnN0ZWFkLCB3ZSByZWNvbXB1dGUgdGhlIGNhY2hlcyB3aGVuIG5lZWRlZC5cbiAgc2V0IHZhbHVlKG5ld1ZhbHVlKSB7XG4gICAgaWYgKHRoaXMudmFsdWUgPT09IG5ld1ZhbHVlKVxuICAgICAgcmV0dXJuO1xuICAgIHRoaXMuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgdGhpcy5yZXZpc2lvbiA9ICsrJFJFVklTSU9OO1xuICB9XG59O1xuZnVuY3Rpb24gdHJpcGxlRXEoYSwgYikge1xuICByZXR1cm4gYSA9PT0gYjtcbn1cbnZhciBUcmFja2luZ0NhY2hlID0gY2xhc3Mge1xuICBfY2FjaGVkVmFsdWU7XG4gIF9jYWNoZWRSZXZpc2lvbiA9IC0xO1xuICBfZGVwcyA9IFtdO1xuICBoaXRzID0gMDtcbiAgZm47XG4gIGNvbnN0cnVjdG9yKGZuKSB7XG4gICAgdGhpcy5mbiA9IGZuO1xuICB9XG4gIGNsZWFyKCkge1xuICAgIHRoaXMuX2NhY2hlZFZhbHVlID0gdm9pZCAwO1xuICAgIHRoaXMuX2NhY2hlZFJldmlzaW9uID0gLTE7XG4gICAgdGhpcy5fZGVwcyA9IFtdO1xuICAgIHRoaXMuaGl0cyA9IDA7XG4gIH1cbiAgZ2V0IHZhbHVlKCkge1xuICAgIGlmICh0aGlzLnJldmlzaW9uID4gdGhpcy5fY2FjaGVkUmV2aXNpb24pIHtcbiAgICAgIGNvbnN0IHsgZm4gfSA9IHRoaXM7XG4gICAgICBjb25zdCBjdXJyZW50VHJhY2tlciA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gICAgICBjb25zdCBwcmV2VHJhY2tlciA9IENVUlJFTlRfVFJBQ0tFUjtcbiAgICAgIENVUlJFTlRfVFJBQ0tFUiA9IGN1cnJlbnRUcmFja2VyO1xuICAgICAgdGhpcy5fY2FjaGVkVmFsdWUgPSBmbigpO1xuICAgICAgQ1VSUkVOVF9UUkFDS0VSID0gcHJldlRyYWNrZXI7XG4gICAgICB0aGlzLmhpdHMrKztcbiAgICAgIHRoaXMuX2RlcHMgPSBBcnJheS5mcm9tKGN1cnJlbnRUcmFja2VyKTtcbiAgICAgIHRoaXMuX2NhY2hlZFJldmlzaW9uID0gdGhpcy5yZXZpc2lvbjtcbiAgICB9XG4gICAgQ1VSUkVOVF9UUkFDS0VSPy5hZGQodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZFZhbHVlO1xuICB9XG4gIGdldCByZXZpc2lvbigpIHtcbiAgICByZXR1cm4gTWF0aC5tYXgoLi4udGhpcy5fZGVwcy5tYXAoKGQpID0+IGQucmV2aXNpb24pLCAwKTtcbiAgfVxufTtcbmZ1bmN0aW9uIGdldFZhbHVlKGNlbGwpIHtcbiAgaWYgKCEoY2VsbCBpbnN0YW5jZW9mIENlbGwpKSB7XG4gICAgY29uc29sZS53YXJuKFwiTm90IGEgdmFsaWQgY2VsbCEgXCIsIGNlbGwpO1xuICB9XG4gIHJldHVybiBjZWxsLnZhbHVlO1xufVxuZnVuY3Rpb24gc2V0VmFsdWUoc3RvcmFnZSwgdmFsdWUpIHtcbiAgaWYgKCEoc3RvcmFnZSBpbnN0YW5jZW9mIENlbGwpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgIFwic2V0VmFsdWUgbXVzdCBiZSBwYXNzZWQgYSB0cmFja2VkIHN0b3JlIGNyZWF0ZWQgd2l0aCBgY3JlYXRlU3RvcmFnZWAuXCJcbiAgICApO1xuICB9XG4gIHN0b3JhZ2UudmFsdWUgPSBzdG9yYWdlLl9sYXN0VmFsdWUgPSB2YWx1ZTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUNlbGwoaW5pdGlhbFZhbHVlLCBpc0VxdWFsID0gdHJpcGxlRXEpIHtcbiAgcmV0dXJuIG5ldyBDZWxsKGluaXRpYWxWYWx1ZSwgaXNFcXVhbCk7XG59XG5mdW5jdGlvbiBjcmVhdGVDYWNoZShmbikge1xuICBhc3NlcnRJc0Z1bmN0aW9uKFxuICAgIGZuLFxuICAgIFwidGhlIGZpcnN0IHBhcmFtZXRlciB0byBgY3JlYXRlQ2FjaGVgIG11c3QgYmUgYSBmdW5jdGlvblwiXG4gICk7XG4gIHJldHVybiBuZXcgVHJhY2tpbmdDYWNoZShmbik7XG59XG5cbi8vIHNyYy9hdXRvdHJhY2tNZW1vaXplL3RyYWNraW5nLnRzXG52YXIgbmV2ZXJFcSA9IChhLCBiKSA9PiBmYWxzZTtcbmZ1bmN0aW9uIGNyZWF0ZVRhZygpIHtcbiAgcmV0dXJuIGNyZWF0ZUNlbGwobnVsbCwgbmV2ZXJFcSk7XG59XG5mdW5jdGlvbiBkaXJ0eVRhZyh0YWcsIHZhbHVlKSB7XG4gIHNldFZhbHVlKHRhZywgdmFsdWUpO1xufVxudmFyIGNvbnN1bWVDb2xsZWN0aW9uID0gKG5vZGUpID0+IHtcbiAgbGV0IHRhZyA9IG5vZGUuY29sbGVjdGlvblRhZztcbiAgaWYgKHRhZyA9PT0gbnVsbCkge1xuICAgIHRhZyA9IG5vZGUuY29sbGVjdGlvblRhZyA9IGNyZWF0ZVRhZygpO1xuICB9XG4gIGdldFZhbHVlKHRhZyk7XG59O1xudmFyIGRpcnR5Q29sbGVjdGlvbiA9IChub2RlKSA9PiB7XG4gIGNvbnN0IHRhZyA9IG5vZGUuY29sbGVjdGlvblRhZztcbiAgaWYgKHRhZyAhPT0gbnVsbCkge1xuICAgIGRpcnR5VGFnKHRhZywgbnVsbCk7XG4gIH1cbn07XG5cbi8vIHNyYy9hdXRvdHJhY2tNZW1vaXplL3Byb3h5LnRzXG52YXIgUkVEVVhfUFJPWFlfTEFCRUwgPSBTeW1ib2woKTtcbnZhciBuZXh0SWQgPSAwO1xudmFyIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHt9KTtcbnZhciBPYmplY3RUcmVlTm9kZSA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IodmFsdWUpIHtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMudGFnLnZhbHVlID0gdmFsdWU7XG4gIH1cbiAgcHJveHkgPSBuZXcgUHJveHkodGhpcywgb2JqZWN0UHJveHlIYW5kbGVyKTtcbiAgdGFnID0gY3JlYXRlVGFnKCk7XG4gIHRhZ3MgPSB7fTtcbiAgY2hpbGRyZW4gPSB7fTtcbiAgY29sbGVjdGlvblRhZyA9IG51bGw7XG4gIGlkID0gbmV4dElkKys7XG59O1xudmFyIG9iamVjdFByb3h5SGFuZGxlciA9IHtcbiAgZ2V0KG5vZGUsIGtleSkge1xuICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZVJlc3VsdCgpIHtcbiAgICAgIGNvbnN0IHsgdmFsdWUgfSA9IG5vZGU7XG4gICAgICBjb25zdCBjaGlsZFZhbHVlID0gUmVmbGVjdC5nZXQodmFsdWUsIGtleSk7XG4gICAgICBpZiAodHlwZW9mIGtleSA9PT0gXCJzeW1ib2xcIikge1xuICAgICAgICByZXR1cm4gY2hpbGRWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgaW4gcHJvdG8pIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkVmFsdWU7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGNoaWxkVmFsdWUgPT09IFwib2JqZWN0XCIgJiYgY2hpbGRWYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICBsZXQgY2hpbGROb2RlID0gbm9kZS5jaGlsZHJlbltrZXldO1xuICAgICAgICBpZiAoY2hpbGROb2RlID09PSB2b2lkIDApIHtcbiAgICAgICAgICBjaGlsZE5vZGUgPSBub2RlLmNoaWxkcmVuW2tleV0gPSBjcmVhdGVOb2RlKGNoaWxkVmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGlsZE5vZGUudGFnKSB7XG4gICAgICAgICAgZ2V0VmFsdWUoY2hpbGROb2RlLnRhZyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNoaWxkTm9kZS5wcm94eTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB0YWcgPSBub2RlLnRhZ3Nba2V5XTtcbiAgICAgICAgaWYgKHRhZyA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgdGFnID0gbm9kZS50YWdzW2tleV0gPSBjcmVhdGVUYWcoKTtcbiAgICAgICAgICB0YWcudmFsdWUgPSBjaGlsZFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGdldFZhbHVlKHRhZyk7XG4gICAgICAgIHJldHVybiBjaGlsZFZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXMgPSBjYWxjdWxhdGVSZXN1bHQoKTtcbiAgICByZXR1cm4gcmVzO1xuICB9LFxuICBvd25LZXlzKG5vZGUpIHtcbiAgICBjb25zdW1lQ29sbGVjdGlvbihub2RlKTtcbiAgICByZXR1cm4gUmVmbGVjdC5vd25LZXlzKG5vZGUudmFsdWUpO1xuICB9LFxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iobm9kZSwgcHJvcCkge1xuICAgIHJldHVybiBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihub2RlLnZhbHVlLCBwcm9wKTtcbiAgfSxcbiAgaGFzKG5vZGUsIHByb3ApIHtcbiAgICByZXR1cm4gUmVmbGVjdC5oYXMobm9kZS52YWx1ZSwgcHJvcCk7XG4gIH1cbn07XG52YXIgQXJyYXlUcmVlTm9kZSA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IodmFsdWUpIHtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMudGFnLnZhbHVlID0gdmFsdWU7XG4gIH1cbiAgcHJveHkgPSBuZXcgUHJveHkoW3RoaXNdLCBhcnJheVByb3h5SGFuZGxlcik7XG4gIHRhZyA9IGNyZWF0ZVRhZygpO1xuICB0YWdzID0ge307XG4gIGNoaWxkcmVuID0ge307XG4gIGNvbGxlY3Rpb25UYWcgPSBudWxsO1xuICBpZCA9IG5leHRJZCsrO1xufTtcbnZhciBhcnJheVByb3h5SGFuZGxlciA9IHtcbiAgZ2V0KFtub2RlXSwga2V5KSB7XG4gICAgaWYgKGtleSA9PT0gXCJsZW5ndGhcIikge1xuICAgICAgY29uc3VtZUNvbGxlY3Rpb24obm9kZSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RQcm94eUhhbmRsZXIuZ2V0KG5vZGUsIGtleSk7XG4gIH0sXG4gIG93bktleXMoW25vZGVdKSB7XG4gICAgcmV0dXJuIG9iamVjdFByb3h5SGFuZGxlci5vd25LZXlzKG5vZGUpO1xuICB9LFxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoW25vZGVdLCBwcm9wKSB7XG4gICAgcmV0dXJuIG9iamVjdFByb3h5SGFuZGxlci5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iobm9kZSwgcHJvcCk7XG4gIH0sXG4gIGhhcyhbbm9kZV0sIHByb3ApIHtcbiAgICByZXR1cm4gb2JqZWN0UHJveHlIYW5kbGVyLmhhcyhub2RlLCBwcm9wKTtcbiAgfVxufTtcbmZ1bmN0aW9uIGNyZWF0ZU5vZGUodmFsdWUpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIG5ldyBBcnJheVRyZWVOb2RlKHZhbHVlKTtcbiAgfVxuICByZXR1cm4gbmV3IE9iamVjdFRyZWVOb2RlKHZhbHVlKTtcbn1cbmZ1bmN0aW9uIHVwZGF0ZU5vZGUobm9kZSwgbmV3VmFsdWUpIHtcbiAgY29uc3QgeyB2YWx1ZSwgdGFncywgY2hpbGRyZW4gfSA9IG5vZGU7XG4gIG5vZGUudmFsdWUgPSBuZXdWYWx1ZTtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIEFycmF5LmlzQXJyYXkobmV3VmFsdWUpICYmIHZhbHVlLmxlbmd0aCAhPT0gbmV3VmFsdWUubGVuZ3RoKSB7XG4gICAgZGlydHlDb2xsZWN0aW9uKG5vZGUpO1xuICB9IGVsc2Uge1xuICAgIGlmICh2YWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgIGxldCBvbGRLZXlzU2l6ZSA9IDA7XG4gICAgICBsZXQgbmV3S2V5c1NpemUgPSAwO1xuICAgICAgbGV0IGFueUtleXNBZGRlZCA9IGZhbHNlO1xuICAgICAgZm9yIChjb25zdCBfa2V5IGluIHZhbHVlKSB7XG4gICAgICAgIG9sZEtleXNTaXplKys7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGtleSBpbiBuZXdWYWx1ZSkge1xuICAgICAgICBuZXdLZXlzU2l6ZSsrO1xuICAgICAgICBpZiAoIShrZXkgaW4gdmFsdWUpKSB7XG4gICAgICAgICAgYW55S2V5c0FkZGVkID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgaXNEaWZmZXJlbnQgPSBhbnlLZXlzQWRkZWQgfHwgb2xkS2V5c1NpemUgIT09IG5ld0tleXNTaXplO1xuICAgICAgaWYgKGlzRGlmZmVyZW50KSB7XG4gICAgICAgIGRpcnR5Q29sbGVjdGlvbihub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgaW4gdGFncykge1xuICAgIGNvbnN0IGNoaWxkVmFsdWUgPSB2YWx1ZVtrZXldO1xuICAgIGNvbnN0IG5ld0NoaWxkVmFsdWUgPSBuZXdWYWx1ZVtrZXldO1xuICAgIGlmIChjaGlsZFZhbHVlICE9PSBuZXdDaGlsZFZhbHVlKSB7XG4gICAgICBkaXJ0eUNvbGxlY3Rpb24obm9kZSk7XG4gICAgICBkaXJ0eVRhZyh0YWdzW2tleV0sIG5ld0NoaWxkVmFsdWUpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG5ld0NoaWxkVmFsdWUgPT09IFwib2JqZWN0XCIgJiYgbmV3Q2hpbGRWYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgZGVsZXRlIHRhZ3Nba2V5XTtcbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgaW4gY2hpbGRyZW4pIHtcbiAgICBjb25zdCBjaGlsZE5vZGUgPSBjaGlsZHJlbltrZXldO1xuICAgIGNvbnN0IG5ld0NoaWxkVmFsdWUgPSBuZXdWYWx1ZVtrZXldO1xuICAgIGNvbnN0IGNoaWxkVmFsdWUgPSBjaGlsZE5vZGUudmFsdWU7XG4gICAgaWYgKGNoaWxkVmFsdWUgPT09IG5ld0NoaWxkVmFsdWUpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG5ld0NoaWxkVmFsdWUgPT09IFwib2JqZWN0XCIgJiYgbmV3Q2hpbGRWYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgdXBkYXRlTm9kZShjaGlsZE5vZGUsIG5ld0NoaWxkVmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGVOb2RlKGNoaWxkTm9kZSk7XG4gICAgICBkZWxldGUgY2hpbGRyZW5ba2V5XTtcbiAgICB9XG4gIH1cbn1cbmZ1bmN0aW9uIGRlbGV0ZU5vZGUobm9kZSkge1xuICBpZiAobm9kZS50YWcpIHtcbiAgICBkaXJ0eVRhZyhub2RlLnRhZywgbnVsbCk7XG4gIH1cbiAgZGlydHlDb2xsZWN0aW9uKG5vZGUpO1xuICBmb3IgKGNvbnN0IGtleSBpbiBub2RlLnRhZ3MpIHtcbiAgICBkaXJ0eVRhZyhub2RlLnRhZ3Nba2V5XSwgbnVsbCk7XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgaW4gbm9kZS5jaGlsZHJlbikge1xuICAgIGRlbGV0ZU5vZGUobm9kZS5jaGlsZHJlbltrZXldKTtcbiAgfVxufVxuXG4vLyBzcmMvbHJ1TWVtb2l6ZS50c1xuZnVuY3Rpb24gY3JlYXRlU2luZ2xldG9uQ2FjaGUoZXF1YWxzKSB7XG4gIGxldCBlbnRyeTtcbiAgcmV0dXJuIHtcbiAgICBnZXQoa2V5KSB7XG4gICAgICBpZiAoZW50cnkgJiYgZXF1YWxzKGVudHJ5LmtleSwga2V5KSkge1xuICAgICAgICByZXR1cm4gZW50cnkudmFsdWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gTk9UX0ZPVU5EO1xuICAgIH0sXG4gICAgcHV0KGtleSwgdmFsdWUpIHtcbiAgICAgIGVudHJ5ID0geyBrZXksIHZhbHVlIH07XG4gICAgfSxcbiAgICBnZXRFbnRyaWVzKCkge1xuICAgICAgcmV0dXJuIGVudHJ5ID8gW2VudHJ5XSA6IFtdO1xuICAgIH0sXG4gICAgY2xlYXIoKSB7XG4gICAgICBlbnRyeSA9IHZvaWQgMDtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBjcmVhdGVMcnVDYWNoZShtYXhTaXplLCBlcXVhbHMpIHtcbiAgbGV0IGVudHJpZXMgPSBbXTtcbiAgZnVuY3Rpb24gZ2V0KGtleSkge1xuICAgIGNvbnN0IGNhY2hlSW5kZXggPSBlbnRyaWVzLmZpbmRJbmRleCgoZW50cnkpID0+IGVxdWFscyhrZXksIGVudHJ5LmtleSkpO1xuICAgIGlmIChjYWNoZUluZGV4ID4gLTEpIHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gZW50cmllc1tjYWNoZUluZGV4XTtcbiAgICAgIGlmIChjYWNoZUluZGV4ID4gMCkge1xuICAgICAgICBlbnRyaWVzLnNwbGljZShjYWNoZUluZGV4LCAxKTtcbiAgICAgICAgZW50cmllcy51bnNoaWZ0KGVudHJ5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlbnRyeS52YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIE5PVF9GT1VORDtcbiAgfVxuICBmdW5jdGlvbiBwdXQoa2V5LCB2YWx1ZSkge1xuICAgIGlmIChnZXQoa2V5KSA9PT0gTk9UX0ZPVU5EKSB7XG4gICAgICBlbnRyaWVzLnVuc2hpZnQoeyBrZXksIHZhbHVlIH0pO1xuICAgICAgaWYgKGVudHJpZXMubGVuZ3RoID4gbWF4U2l6ZSkge1xuICAgICAgICBlbnRyaWVzLnBvcCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBnZXRFbnRyaWVzKCkge1xuICAgIHJldHVybiBlbnRyaWVzO1xuICB9XG4gIGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgIGVudHJpZXMgPSBbXTtcbiAgfVxuICByZXR1cm4geyBnZXQsIHB1dCwgZ2V0RW50cmllcywgY2xlYXIgfTtcbn1cbnZhciByZWZlcmVuY2VFcXVhbGl0eUNoZWNrID0gKGEsIGIpID0+IGEgPT09IGI7XG5mdW5jdGlvbiBjcmVhdGVDYWNoZUtleUNvbXBhcmF0b3IoZXF1YWxpdHlDaGVjaykge1xuICByZXR1cm4gZnVuY3Rpb24gYXJlQXJndW1lbnRzU2hhbGxvd2x5RXF1YWwocHJldiwgbmV4dCkge1xuICAgIGlmIChwcmV2ID09PSBudWxsIHx8IG5leHQgPT09IG51bGwgfHwgcHJldi5sZW5ndGggIT09IG5leHQubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHsgbGVuZ3RoIH0gPSBwcmV2O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghZXF1YWxpdHlDaGVjayhwcmV2W2ldLCBuZXh0W2ldKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xufVxuZnVuY3Rpb24gbHJ1TWVtb2l6ZShmdW5jLCBlcXVhbGl0eUNoZWNrT3JPcHRpb25zKSB7XG4gIGNvbnN0IHByb3ZpZGVkT3B0aW9ucyA9IHR5cGVvZiBlcXVhbGl0eUNoZWNrT3JPcHRpb25zID09PSBcIm9iamVjdFwiID8gZXF1YWxpdHlDaGVja09yT3B0aW9ucyA6IHsgZXF1YWxpdHlDaGVjazogZXF1YWxpdHlDaGVja09yT3B0aW9ucyB9O1xuICBjb25zdCB7XG4gICAgZXF1YWxpdHlDaGVjayA9IHJlZmVyZW5jZUVxdWFsaXR5Q2hlY2ssXG4gICAgbWF4U2l6ZSA9IDEsXG4gICAgcmVzdWx0RXF1YWxpdHlDaGVja1xuICB9ID0gcHJvdmlkZWRPcHRpb25zO1xuICBjb25zdCBjb21wYXJhdG9yID0gY3JlYXRlQ2FjaGVLZXlDb21wYXJhdG9yKGVxdWFsaXR5Q2hlY2spO1xuICBsZXQgcmVzdWx0c0NvdW50ID0gMDtcbiAgY29uc3QgY2FjaGUgPSBtYXhTaXplIDw9IDEgPyBjcmVhdGVTaW5nbGV0b25DYWNoZShjb21wYXJhdG9yKSA6IGNyZWF0ZUxydUNhY2hlKG1heFNpemUsIGNvbXBhcmF0b3IpO1xuICBmdW5jdGlvbiBtZW1vaXplZCgpIHtcbiAgICBsZXQgdmFsdWUgPSBjYWNoZS5nZXQoYXJndW1lbnRzKTtcbiAgICBpZiAodmFsdWUgPT09IE5PVF9GT1VORCkge1xuICAgICAgdmFsdWUgPSBmdW5jLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICByZXN1bHRzQ291bnQrKztcbiAgICAgIGlmIChyZXN1bHRFcXVhbGl0eUNoZWNrKSB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBjYWNoZS5nZXRFbnRyaWVzKCk7XG4gICAgICAgIGNvbnN0IG1hdGNoaW5nRW50cnkgPSBlbnRyaWVzLmZpbmQoXG4gICAgICAgICAgKGVudHJ5KSA9PiByZXN1bHRFcXVhbGl0eUNoZWNrKGVudHJ5LnZhbHVlLCB2YWx1ZSlcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKG1hdGNoaW5nRW50cnkpIHtcbiAgICAgICAgICB2YWx1ZSA9IG1hdGNoaW5nRW50cnkudmFsdWU7XG4gICAgICAgICAgcmVzdWx0c0NvdW50ICE9PSAwICYmIHJlc3VsdHNDb3VudC0tO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjYWNoZS5wdXQoYXJndW1lbnRzLCB2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBtZW1vaXplZC5jbGVhckNhY2hlID0gKCkgPT4ge1xuICAgIGNhY2hlLmNsZWFyKCk7XG4gICAgbWVtb2l6ZWQucmVzZXRSZXN1bHRzQ291bnQoKTtcbiAgfTtcbiAgbWVtb2l6ZWQucmVzdWx0c0NvdW50ID0gKCkgPT4gcmVzdWx0c0NvdW50O1xuICBtZW1vaXplZC5yZXNldFJlc3VsdHNDb3VudCA9ICgpID0+IHtcbiAgICByZXN1bHRzQ291bnQgPSAwO1xuICB9O1xuICByZXR1cm4gbWVtb2l6ZWQ7XG59XG5cbi8vIHNyYy9hdXRvdHJhY2tNZW1vaXplL2F1dG90cmFja01lbW9pemUudHNcbmZ1bmN0aW9uIGF1dG90cmFja01lbW9pemUoZnVuYykge1xuICBjb25zdCBub2RlID0gY3JlYXRlTm9kZShcbiAgICBbXVxuICApO1xuICBsZXQgbGFzdEFyZ3MgPSBudWxsO1xuICBjb25zdCBzaGFsbG93RXF1YWwgPSBjcmVhdGVDYWNoZUtleUNvbXBhcmF0b3IocmVmZXJlbmNlRXF1YWxpdHlDaGVjayk7XG4gIGNvbnN0IGNhY2hlID0gY3JlYXRlQ2FjaGUoKCkgPT4ge1xuICAgIGNvbnN0IHJlcyA9IGZ1bmMuYXBwbHkobnVsbCwgbm9kZS5wcm94eSk7XG4gICAgcmV0dXJuIHJlcztcbiAgfSk7XG4gIGZ1bmN0aW9uIG1lbW9pemVkKCkge1xuICAgIGlmICghc2hhbGxvd0VxdWFsKGxhc3RBcmdzLCBhcmd1bWVudHMpKSB7XG4gICAgICB1cGRhdGVOb2RlKG5vZGUsIGFyZ3VtZW50cyk7XG4gICAgICBsYXN0QXJncyA9IGFyZ3VtZW50cztcbiAgICB9XG4gICAgcmV0dXJuIGNhY2hlLnZhbHVlO1xuICB9XG4gIG1lbW9pemVkLmNsZWFyQ2FjaGUgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGNhY2hlLmNsZWFyKCk7XG4gIH07XG4gIHJldHVybiBtZW1vaXplZDtcbn1cblxuLy8gc3JjL3dlYWtNYXBNZW1vaXplLnRzXG52YXIgU3Ryb25nUmVmID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih2YWx1ZSkge1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuICBkZXJlZigpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgfVxufTtcbnZhciBSZWYgPSB0eXBlb2YgV2Vha1JlZiAhPT0gXCJ1bmRlZmluZWRcIiA/IFdlYWtSZWYgOiBTdHJvbmdSZWY7XG52YXIgVU5URVJNSU5BVEVEID0gMDtcbnZhciBURVJNSU5BVEVEID0gMTtcbmZ1bmN0aW9uIGNyZWF0ZUNhY2hlTm9kZSgpIHtcbiAgcmV0dXJuIHtcbiAgICBzOiBVTlRFUk1JTkFURUQsXG4gICAgdjogdm9pZCAwLFxuICAgIG86IG51bGwsXG4gICAgcDogbnVsbFxuICB9O1xufVxuZnVuY3Rpb24gd2Vha01hcE1lbW9pemUoZnVuYywgb3B0aW9ucyA9IHt9KSB7XG4gIGxldCBmbk5vZGUgPSBjcmVhdGVDYWNoZU5vZGUoKTtcbiAgY29uc3QgeyByZXN1bHRFcXVhbGl0eUNoZWNrIH0gPSBvcHRpb25zO1xuICBsZXQgbGFzdFJlc3VsdDtcbiAgbGV0IHJlc3VsdHNDb3VudCA9IDA7XG4gIGZ1bmN0aW9uIG1lbW9pemVkKCkge1xuICAgIGxldCBjYWNoZU5vZGUgPSBmbk5vZGU7XG4gICAgY29uc3QgeyBsZW5ndGggfSA9IGFyZ3VtZW50cztcbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IGxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgY29uc3QgYXJnID0gYXJndW1lbnRzW2ldO1xuICAgICAgaWYgKHR5cGVvZiBhcmcgPT09IFwiZnVuY3Rpb25cIiB8fCB0eXBlb2YgYXJnID09PSBcIm9iamVjdFwiICYmIGFyZyAhPT0gbnVsbCkge1xuICAgICAgICBsZXQgb2JqZWN0Q2FjaGUgPSBjYWNoZU5vZGUubztcbiAgICAgICAgaWYgKG9iamVjdENhY2hlID09PSBudWxsKSB7XG4gICAgICAgICAgY2FjaGVOb2RlLm8gPSBvYmplY3RDYWNoZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgV2Vha01hcCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9iamVjdE5vZGUgPSBvYmplY3RDYWNoZS5nZXQoYXJnKTtcbiAgICAgICAgaWYgKG9iamVjdE5vZGUgPT09IHZvaWQgMCkge1xuICAgICAgICAgIGNhY2hlTm9kZSA9IGNyZWF0ZUNhY2hlTm9kZSgpO1xuICAgICAgICAgIG9iamVjdENhY2hlLnNldChhcmcsIGNhY2hlTm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FjaGVOb2RlID0gb2JqZWN0Tm9kZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHByaW1pdGl2ZUNhY2hlID0gY2FjaGVOb2RlLnA7XG4gICAgICAgIGlmIChwcmltaXRpdmVDYWNoZSA9PT0gbnVsbCkge1xuICAgICAgICAgIGNhY2hlTm9kZS5wID0gcHJpbWl0aXZlQ2FjaGUgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByaW1pdGl2ZU5vZGUgPSBwcmltaXRpdmVDYWNoZS5nZXQoYXJnKTtcbiAgICAgICAgaWYgKHByaW1pdGl2ZU5vZGUgPT09IHZvaWQgMCkge1xuICAgICAgICAgIGNhY2hlTm9kZSA9IGNyZWF0ZUNhY2hlTm9kZSgpO1xuICAgICAgICAgIHByaW1pdGl2ZUNhY2hlLnNldChhcmcsIGNhY2hlTm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FjaGVOb2RlID0gcHJpbWl0aXZlTm9kZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB0ZXJtaW5hdGVkTm9kZSA9IGNhY2hlTm9kZTtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGlmIChjYWNoZU5vZGUucyA9PT0gVEVSTUlOQVRFRCkge1xuICAgICAgcmVzdWx0ID0gY2FjaGVOb2RlLnY7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgIHJlc3VsdHNDb3VudCsrO1xuICAgICAgaWYgKHJlc3VsdEVxdWFsaXR5Q2hlY2spIHtcbiAgICAgICAgY29uc3QgbGFzdFJlc3VsdFZhbHVlID0gbGFzdFJlc3VsdD8uZGVyZWY/LigpID8/IGxhc3RSZXN1bHQ7XG4gICAgICAgIGlmIChsYXN0UmVzdWx0VmFsdWUgIT0gbnVsbCAmJiByZXN1bHRFcXVhbGl0eUNoZWNrKGxhc3RSZXN1bHRWYWx1ZSwgcmVzdWx0KSkge1xuICAgICAgICAgIHJlc3VsdCA9IGxhc3RSZXN1bHRWYWx1ZTtcbiAgICAgICAgICByZXN1bHRzQ291bnQgIT09IDAgJiYgcmVzdWx0c0NvdW50LS07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmVlZHNXZWFrUmVmID0gdHlwZW9mIHJlc3VsdCA9PT0gXCJvYmplY3RcIiAmJiByZXN1bHQgIT09IG51bGwgfHwgdHlwZW9mIHJlc3VsdCA9PT0gXCJmdW5jdGlvblwiO1xuICAgICAgICBsYXN0UmVzdWx0ID0gbmVlZHNXZWFrUmVmID8gbmV3IFJlZihyZXN1bHQpIDogcmVzdWx0O1xuICAgICAgfVxuICAgIH1cbiAgICB0ZXJtaW5hdGVkTm9kZS5zID0gVEVSTUlOQVRFRDtcbiAgICB0ZXJtaW5hdGVkTm9kZS52ID0gcmVzdWx0O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgbWVtb2l6ZWQuY2xlYXJDYWNoZSA9ICgpID0+IHtcbiAgICBmbk5vZGUgPSBjcmVhdGVDYWNoZU5vZGUoKTtcbiAgICBtZW1vaXplZC5yZXNldFJlc3VsdHNDb3VudCgpO1xuICB9O1xuICBtZW1vaXplZC5yZXN1bHRzQ291bnQgPSAoKSA9PiByZXN1bHRzQ291bnQ7XG4gIG1lbW9pemVkLnJlc2V0UmVzdWx0c0NvdW50ID0gKCkgPT4ge1xuICAgIHJlc3VsdHNDb3VudCA9IDA7XG4gIH07XG4gIHJldHVybiBtZW1vaXplZDtcbn1cblxuLy8gc3JjL2NyZWF0ZVNlbGVjdG9yQ3JlYXRvci50c1xuZnVuY3Rpb24gY3JlYXRlU2VsZWN0b3JDcmVhdG9yKG1lbW9pemVPck9wdGlvbnMsIC4uLm1lbW9pemVPcHRpb25zRnJvbUFyZ3MpIHtcbiAgY29uc3QgY3JlYXRlU2VsZWN0b3JDcmVhdG9yT3B0aW9ucyA9IHR5cGVvZiBtZW1vaXplT3JPcHRpb25zID09PSBcImZ1bmN0aW9uXCIgPyB7XG4gICAgbWVtb2l6ZTogbWVtb2l6ZU9yT3B0aW9ucyxcbiAgICBtZW1vaXplT3B0aW9uczogbWVtb2l6ZU9wdGlvbnNGcm9tQXJnc1xuICB9IDogbWVtb2l6ZU9yT3B0aW9ucztcbiAgY29uc3QgY3JlYXRlU2VsZWN0b3IyID0gKC4uLmNyZWF0ZVNlbGVjdG9yQXJncykgPT4ge1xuICAgIGxldCByZWNvbXB1dGF0aW9ucyA9IDA7XG4gICAgbGV0IGRlcGVuZGVuY3lSZWNvbXB1dGF0aW9ucyA9IDA7XG4gICAgbGV0IGxhc3RSZXN1bHQ7XG4gICAgbGV0IGRpcmVjdGx5UGFzc2VkT3B0aW9ucyA9IHt9O1xuICAgIGxldCByZXN1bHRGdW5jID0gY3JlYXRlU2VsZWN0b3JBcmdzLnBvcCgpO1xuICAgIGlmICh0eXBlb2YgcmVzdWx0RnVuYyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgZGlyZWN0bHlQYXNzZWRPcHRpb25zID0gcmVzdWx0RnVuYztcbiAgICAgIHJlc3VsdEZ1bmMgPSBjcmVhdGVTZWxlY3RvckFyZ3MucG9wKCk7XG4gICAgfVxuICAgIGFzc2VydElzRnVuY3Rpb24oXG4gICAgICByZXN1bHRGdW5jLFxuICAgICAgYGNyZWF0ZVNlbGVjdG9yIGV4cGVjdHMgYW4gb3V0cHV0IGZ1bmN0aW9uIGFmdGVyIHRoZSBpbnB1dHMsIGJ1dCByZWNlaXZlZDogWyR7dHlwZW9mIHJlc3VsdEZ1bmN9XWBcbiAgICApO1xuICAgIGNvbnN0IGNvbWJpbmVkT3B0aW9ucyA9IHtcbiAgICAgIC4uLmNyZWF0ZVNlbGVjdG9yQ3JlYXRvck9wdGlvbnMsXG4gICAgICAuLi5kaXJlY3RseVBhc3NlZE9wdGlvbnNcbiAgICB9O1xuICAgIGNvbnN0IHtcbiAgICAgIG1lbW9pemUsXG4gICAgICBtZW1vaXplT3B0aW9ucyA9IFtdLFxuICAgICAgYXJnc01lbW9pemUgPSB3ZWFrTWFwTWVtb2l6ZSxcbiAgICAgIGFyZ3NNZW1vaXplT3B0aW9ucyA9IFtdLFxuICAgICAgZGV2TW9kZUNoZWNrcyA9IHt9XG4gICAgfSA9IGNvbWJpbmVkT3B0aW9ucztcbiAgICBjb25zdCBmaW5hbE1lbW9pemVPcHRpb25zID0gZW5zdXJlSXNBcnJheShtZW1vaXplT3B0aW9ucyk7XG4gICAgY29uc3QgZmluYWxBcmdzTWVtb2l6ZU9wdGlvbnMgPSBlbnN1cmVJc0FycmF5KGFyZ3NNZW1vaXplT3B0aW9ucyk7XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gZ2V0RGVwZW5kZW5jaWVzKGNyZWF0ZVNlbGVjdG9yQXJncyk7XG4gICAgY29uc3QgbWVtb2l6ZWRSZXN1bHRGdW5jID0gbWVtb2l6ZShmdW5jdGlvbiByZWNvbXB1dGF0aW9uV3JhcHBlcigpIHtcbiAgICAgIHJlY29tcHV0YXRpb25zKys7XG4gICAgICByZXR1cm4gcmVzdWx0RnVuYy5hcHBseShcbiAgICAgICAgbnVsbCxcbiAgICAgICAgYXJndW1lbnRzXG4gICAgICApO1xuICAgIH0sIC4uLmZpbmFsTWVtb2l6ZU9wdGlvbnMpO1xuICAgIGxldCBmaXJzdFJ1biA9IHRydWU7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBhcmdzTWVtb2l6ZShmdW5jdGlvbiBkZXBlbmRlbmNpZXNDaGVja2VyKCkge1xuICAgICAgZGVwZW5kZW5jeVJlY29tcHV0YXRpb25zKys7XG4gICAgICBjb25zdCBpbnB1dFNlbGVjdG9yUmVzdWx0cyA9IGNvbGxlY3RJbnB1dFNlbGVjdG9yUmVzdWx0cyhcbiAgICAgICAgZGVwZW5kZW5jaWVzLFxuICAgICAgICBhcmd1bWVudHNcbiAgICAgICk7XG4gICAgICBsYXN0UmVzdWx0ID0gbWVtb2l6ZWRSZXN1bHRGdW5jLmFwcGx5KG51bGwsIGlucHV0U2VsZWN0b3JSZXN1bHRzKTtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIHtcbiAgICAgICAgY29uc3QgeyBpZGVudGl0eUZ1bmN0aW9uQ2hlY2ssIGlucHV0U3RhYmlsaXR5Q2hlY2sgfSA9IGdldERldk1vZGVDaGVja3NFeGVjdXRpb25JbmZvKGZpcnN0UnVuLCBkZXZNb2RlQ2hlY2tzKTtcbiAgICAgICAgaWYgKGlkZW50aXR5RnVuY3Rpb25DaGVjay5zaG91bGRSdW4pIHtcbiAgICAgICAgICBpZGVudGl0eUZ1bmN0aW9uQ2hlY2sucnVuKFxuICAgICAgICAgICAgcmVzdWx0RnVuYyxcbiAgICAgICAgICAgIGlucHV0U2VsZWN0b3JSZXN1bHRzLFxuICAgICAgICAgICAgbGFzdFJlc3VsdFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlucHV0U3RhYmlsaXR5Q2hlY2suc2hvdWxkUnVuKSB7XG4gICAgICAgICAgY29uc3QgaW5wdXRTZWxlY3RvclJlc3VsdHNDb3B5ID0gY29sbGVjdElucHV0U2VsZWN0b3JSZXN1bHRzKFxuICAgICAgICAgICAgZGVwZW5kZW5jaWVzLFxuICAgICAgICAgICAgYXJndW1lbnRzXG4gICAgICAgICAgKTtcbiAgICAgICAgICBpbnB1dFN0YWJpbGl0eUNoZWNrLnJ1bihcbiAgICAgICAgICAgIHsgaW5wdXRTZWxlY3RvclJlc3VsdHMsIGlucHV0U2VsZWN0b3JSZXN1bHRzQ29weSB9LFxuICAgICAgICAgICAgeyBtZW1vaXplLCBtZW1vaXplT3B0aW9uczogZmluYWxNZW1vaXplT3B0aW9ucyB9LFxuICAgICAgICAgICAgYXJndW1lbnRzXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlyc3RSdW4pXG4gICAgICAgICAgZmlyc3RSdW4gPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsYXN0UmVzdWx0O1xuICAgIH0sIC4uLmZpbmFsQXJnc01lbW9pemVPcHRpb25zKTtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzZWxlY3Rvciwge1xuICAgICAgcmVzdWx0RnVuYyxcbiAgICAgIG1lbW9pemVkUmVzdWx0RnVuYyxcbiAgICAgIGRlcGVuZGVuY2llcyxcbiAgICAgIGRlcGVuZGVuY3lSZWNvbXB1dGF0aW9uczogKCkgPT4gZGVwZW5kZW5jeVJlY29tcHV0YXRpb25zLFxuICAgICAgcmVzZXREZXBlbmRlbmN5UmVjb21wdXRhdGlvbnM6ICgpID0+IHtcbiAgICAgICAgZGVwZW5kZW5jeVJlY29tcHV0YXRpb25zID0gMDtcbiAgICAgIH0sXG4gICAgICBsYXN0UmVzdWx0OiAoKSA9PiBsYXN0UmVzdWx0LFxuICAgICAgcmVjb21wdXRhdGlvbnM6ICgpID0+IHJlY29tcHV0YXRpb25zLFxuICAgICAgcmVzZXRSZWNvbXB1dGF0aW9uczogKCkgPT4ge1xuICAgICAgICByZWNvbXB1dGF0aW9ucyA9IDA7XG4gICAgICB9LFxuICAgICAgbWVtb2l6ZSxcbiAgICAgIGFyZ3NNZW1vaXplXG4gICAgfSk7XG4gIH07XG4gIE9iamVjdC5hc3NpZ24oY3JlYXRlU2VsZWN0b3IyLCB7XG4gICAgd2l0aFR5cGVzOiAoKSA9PiBjcmVhdGVTZWxlY3RvcjJcbiAgfSk7XG4gIHJldHVybiBjcmVhdGVTZWxlY3RvcjI7XG59XG52YXIgY3JlYXRlU2VsZWN0b3IgPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlU2VsZWN0b3JDcmVhdG9yKHdlYWtNYXBNZW1vaXplKTtcblxuLy8gc3JjL2NyZWF0ZVN0cnVjdHVyZWRTZWxlY3Rvci50c1xudmFyIGNyZWF0ZVN0cnVjdHVyZWRTZWxlY3RvciA9IE9iamVjdC5hc3NpZ24oXG4gIChpbnB1dFNlbGVjdG9yc09iamVjdCwgc2VsZWN0b3JDcmVhdG9yID0gY3JlYXRlU2VsZWN0b3IpID0+IHtcbiAgICBhc3NlcnRJc09iamVjdChcbiAgICAgIGlucHV0U2VsZWN0b3JzT2JqZWN0LFxuICAgICAgYGNyZWF0ZVN0cnVjdHVyZWRTZWxlY3RvciBleHBlY3RzIGZpcnN0IGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCB3aGVyZSBlYWNoIHByb3BlcnR5IGlzIGEgc2VsZWN0b3IsIGluc3RlYWQgcmVjZWl2ZWQgYSAke3R5cGVvZiBpbnB1dFNlbGVjdG9yc09iamVjdH1gXG4gICAgKTtcbiAgICBjb25zdCBpbnB1dFNlbGVjdG9yS2V5cyA9IE9iamVjdC5rZXlzKGlucHV0U2VsZWN0b3JzT2JqZWN0KTtcbiAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBpbnB1dFNlbGVjdG9yS2V5cy5tYXAoXG4gICAgICAoa2V5KSA9PiBpbnB1dFNlbGVjdG9yc09iamVjdFtrZXldXG4gICAgKTtcbiAgICBjb25zdCBzdHJ1Y3R1cmVkU2VsZWN0b3IgPSBzZWxlY3RvckNyZWF0b3IoXG4gICAgICBkZXBlbmRlbmNpZXMsXG4gICAgICAoLi4uaW5wdXRTZWxlY3RvclJlc3VsdHMpID0+IHtcbiAgICAgICAgcmV0dXJuIGlucHV0U2VsZWN0b3JSZXN1bHRzLnJlZHVjZSgoY29tcG9zaXRpb24sIHZhbHVlLCBpbmRleCkgPT4ge1xuICAgICAgICAgIGNvbXBvc2l0aW9uW2lucHV0U2VsZWN0b3JLZXlzW2luZGV4XV0gPSB2YWx1ZTtcbiAgICAgICAgICByZXR1cm4gY29tcG9zaXRpb247XG4gICAgICAgIH0sIHt9KTtcbiAgICAgIH1cbiAgICApO1xuICAgIHJldHVybiBzdHJ1Y3R1cmVkU2VsZWN0b3I7XG4gIH0sXG4gIHsgd2l0aFR5cGVzOiAoKSA9PiBjcmVhdGVTdHJ1Y3R1cmVkU2VsZWN0b3IgfVxuKTtcbmV4cG9ydCB7XG4gIGNyZWF0ZVNlbGVjdG9yLFxuICBjcmVhdGVTZWxlY3RvckNyZWF0b3IsXG4gIGNyZWF0ZVN0cnVjdHVyZWRTZWxlY3RvcixcbiAgbHJ1TWVtb2l6ZSxcbiAgcmVmZXJlbmNlRXF1YWxpdHlDaGVjayxcbiAgc2V0R2xvYmFsRGV2TW9kZUNoZWNrcyxcbiAgYXV0b3RyYWNrTWVtb2l6ZSBhcyB1bnN0YWJsZV9hdXRvdHJhY2tNZW1vaXplLFxuICB3ZWFrTWFwTWVtb2l6ZVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlc2VsZWN0Lm1qcy5tYXAiLCIvKlxuXHRCYXNlZCBvbiByZ2Jjb2xvci5qcyBieSBTdG95YW4gU3RlZmFub3YgPHNzdG9vQGdtYWlsLmNvbT5cblx0aHR0cDovL3d3dy5waHBpZWQuY29tL3JnYi1jb2xvci1wYXJzZXItaW4tamF2YXNjcmlwdC9cbiovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY29sb3Jfc3RyaW5nKSB7XG4gICAgdGhpcy5vayA9IGZhbHNlO1xuICAgIHRoaXMuYWxwaGEgPSAxLjA7XG5cbiAgICAvLyBzdHJpcCBhbnkgbGVhZGluZyAjXG4gICAgaWYgKGNvbG9yX3N0cmluZy5jaGFyQXQoMCkgPT0gJyMnKSB7IC8vIHJlbW92ZSAjIGlmIGFueVxuICAgICAgICBjb2xvcl9zdHJpbmcgPSBjb2xvcl9zdHJpbmcuc3Vic3RyKDEsNik7XG4gICAgfVxuXG4gICAgY29sb3Jfc3RyaW5nID0gY29sb3Jfc3RyaW5nLnJlcGxhY2UoLyAvZywnJyk7XG4gICAgY29sb3Jfc3RyaW5nID0gY29sb3Jfc3RyaW5nLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyBiZWZvcmUgZ2V0dGluZyBpbnRvIHJlZ2V4cHMsIHRyeSBzaW1wbGUgbWF0Y2hlc1xuICAgIC8vIGFuZCBvdmVyd3JpdGUgdGhlIGlucHV0XG4gICAgdmFyIHNpbXBsZV9jb2xvcnMgPSB7XG4gICAgICAgIGFsaWNlYmx1ZTogJ2YwZjhmZicsXG4gICAgICAgIGFudGlxdWV3aGl0ZTogJ2ZhZWJkNycsXG4gICAgICAgIGFxdWE6ICcwMGZmZmYnLFxuICAgICAgICBhcXVhbWFyaW5lOiAnN2ZmZmQ0JyxcbiAgICAgICAgYXp1cmU6ICdmMGZmZmYnLFxuICAgICAgICBiZWlnZTogJ2Y1ZjVkYycsXG4gICAgICAgIGJpc3F1ZTogJ2ZmZTRjNCcsXG4gICAgICAgIGJsYWNrOiAnMDAwMDAwJyxcbiAgICAgICAgYmxhbmNoZWRhbG1vbmQ6ICdmZmViY2QnLFxuICAgICAgICBibHVlOiAnMDAwMGZmJyxcbiAgICAgICAgYmx1ZXZpb2xldDogJzhhMmJlMicsXG4gICAgICAgIGJyb3duOiAnYTUyYTJhJyxcbiAgICAgICAgYnVybHl3b29kOiAnZGViODg3JyxcbiAgICAgICAgY2FkZXRibHVlOiAnNWY5ZWEwJyxcbiAgICAgICAgY2hhcnRyZXVzZTogJzdmZmYwMCcsXG4gICAgICAgIGNob2NvbGF0ZTogJ2QyNjkxZScsXG4gICAgICAgIGNvcmFsOiAnZmY3ZjUwJyxcbiAgICAgICAgY29ybmZsb3dlcmJsdWU6ICc2NDk1ZWQnLFxuICAgICAgICBjb3Juc2lsazogJ2ZmZjhkYycsXG4gICAgICAgIGNyaW1zb246ICdkYzE0M2MnLFxuICAgICAgICBjeWFuOiAnMDBmZmZmJyxcbiAgICAgICAgZGFya2JsdWU6ICcwMDAwOGInLFxuICAgICAgICBkYXJrY3lhbjogJzAwOGI4YicsXG4gICAgICAgIGRhcmtnb2xkZW5yb2Q6ICdiODg2MGInLFxuICAgICAgICBkYXJrZ3JheTogJ2E5YTlhOScsXG4gICAgICAgIGRhcmtncmVlbjogJzAwNjQwMCcsXG4gICAgICAgIGRhcmtraGFraTogJ2JkYjc2YicsXG4gICAgICAgIGRhcmttYWdlbnRhOiAnOGIwMDhiJyxcbiAgICAgICAgZGFya29saXZlZ3JlZW46ICc1NTZiMmYnLFxuICAgICAgICBkYXJrb3JhbmdlOiAnZmY4YzAwJyxcbiAgICAgICAgZGFya29yY2hpZDogJzk5MzJjYycsXG4gICAgICAgIGRhcmtyZWQ6ICc4YjAwMDAnLFxuICAgICAgICBkYXJrc2FsbW9uOiAnZTk5NjdhJyxcbiAgICAgICAgZGFya3NlYWdyZWVuOiAnOGZiYzhmJyxcbiAgICAgICAgZGFya3NsYXRlYmx1ZTogJzQ4M2Q4YicsXG4gICAgICAgIGRhcmtzbGF0ZWdyYXk6ICcyZjRmNGYnLFxuICAgICAgICBkYXJrdHVycXVvaXNlOiAnMDBjZWQxJyxcbiAgICAgICAgZGFya3Zpb2xldDogJzk0MDBkMycsXG4gICAgICAgIGRlZXBwaW5rOiAnZmYxNDkzJyxcbiAgICAgICAgZGVlcHNreWJsdWU6ICcwMGJmZmYnLFxuICAgICAgICBkaW1ncmF5OiAnNjk2OTY5JyxcbiAgICAgICAgZG9kZ2VyYmx1ZTogJzFlOTBmZicsXG4gICAgICAgIGZlbGRzcGFyOiAnZDE5Mjc1JyxcbiAgICAgICAgZmlyZWJyaWNrOiAnYjIyMjIyJyxcbiAgICAgICAgZmxvcmFsd2hpdGU6ICdmZmZhZjAnLFxuICAgICAgICBmb3Jlc3RncmVlbjogJzIyOGIyMicsXG4gICAgICAgIGZ1Y2hzaWE6ICdmZjAwZmYnLFxuICAgICAgICBnYWluc2Jvcm86ICdkY2RjZGMnLFxuICAgICAgICBnaG9zdHdoaXRlOiAnZjhmOGZmJyxcbiAgICAgICAgZ29sZDogJ2ZmZDcwMCcsXG4gICAgICAgIGdvbGRlbnJvZDogJ2RhYTUyMCcsXG4gICAgICAgIGdyYXk6ICc4MDgwODAnLFxuICAgICAgICBncmVlbjogJzAwODAwMCcsXG4gICAgICAgIGdyZWVueWVsbG93OiAnYWRmZjJmJyxcbiAgICAgICAgaG9uZXlkZXc6ICdmMGZmZjAnLFxuICAgICAgICBob3RwaW5rOiAnZmY2OWI0JyxcbiAgICAgICAgaW5kaWFucmVkIDogJ2NkNWM1YycsXG4gICAgICAgIGluZGlnbyA6ICc0YjAwODInLFxuICAgICAgICBpdm9yeTogJ2ZmZmZmMCcsXG4gICAgICAgIGtoYWtpOiAnZjBlNjhjJyxcbiAgICAgICAgbGF2ZW5kZXI6ICdlNmU2ZmEnLFxuICAgICAgICBsYXZlbmRlcmJsdXNoOiAnZmZmMGY1JyxcbiAgICAgICAgbGF3bmdyZWVuOiAnN2NmYzAwJyxcbiAgICAgICAgbGVtb25jaGlmZm9uOiAnZmZmYWNkJyxcbiAgICAgICAgbGlnaHRibHVlOiAnYWRkOGU2JyxcbiAgICAgICAgbGlnaHRjb3JhbDogJ2YwODA4MCcsXG4gICAgICAgIGxpZ2h0Y3lhbjogJ2UwZmZmZicsXG4gICAgICAgIGxpZ2h0Z29sZGVucm9keWVsbG93OiAnZmFmYWQyJyxcbiAgICAgICAgbGlnaHRncmV5OiAnZDNkM2QzJyxcbiAgICAgICAgbGlnaHRncmVlbjogJzkwZWU5MCcsXG4gICAgICAgIGxpZ2h0cGluazogJ2ZmYjZjMScsXG4gICAgICAgIGxpZ2h0c2FsbW9uOiAnZmZhMDdhJyxcbiAgICAgICAgbGlnaHRzZWFncmVlbjogJzIwYjJhYScsXG4gICAgICAgIGxpZ2h0c2t5Ymx1ZTogJzg3Y2VmYScsXG4gICAgICAgIGxpZ2h0c2xhdGVibHVlOiAnODQ3MGZmJyxcbiAgICAgICAgbGlnaHRzbGF0ZWdyYXk6ICc3Nzg4OTknLFxuICAgICAgICBsaWdodHN0ZWVsYmx1ZTogJ2IwYzRkZScsXG4gICAgICAgIGxpZ2h0eWVsbG93OiAnZmZmZmUwJyxcbiAgICAgICAgbGltZTogJzAwZmYwMCcsXG4gICAgICAgIGxpbWVncmVlbjogJzMyY2QzMicsXG4gICAgICAgIGxpbmVuOiAnZmFmMGU2JyxcbiAgICAgICAgbWFnZW50YTogJ2ZmMDBmZicsXG4gICAgICAgIG1hcm9vbjogJzgwMDAwMCcsXG4gICAgICAgIG1lZGl1bWFxdWFtYXJpbmU6ICc2NmNkYWEnLFxuICAgICAgICBtZWRpdW1ibHVlOiAnMDAwMGNkJyxcbiAgICAgICAgbWVkaXVtb3JjaGlkOiAnYmE1NWQzJyxcbiAgICAgICAgbWVkaXVtcHVycGxlOiAnOTM3MGQ4JyxcbiAgICAgICAgbWVkaXVtc2VhZ3JlZW46ICczY2IzNzEnLFxuICAgICAgICBtZWRpdW1zbGF0ZWJsdWU6ICc3YjY4ZWUnLFxuICAgICAgICBtZWRpdW1zcHJpbmdncmVlbjogJzAwZmE5YScsXG4gICAgICAgIG1lZGl1bXR1cnF1b2lzZTogJzQ4ZDFjYycsXG4gICAgICAgIG1lZGl1bXZpb2xldHJlZDogJ2M3MTU4NScsXG4gICAgICAgIG1pZG5pZ2h0Ymx1ZTogJzE5MTk3MCcsXG4gICAgICAgIG1pbnRjcmVhbTogJ2Y1ZmZmYScsXG4gICAgICAgIG1pc3R5cm9zZTogJ2ZmZTRlMScsXG4gICAgICAgIG1vY2Nhc2luOiAnZmZlNGI1JyxcbiAgICAgICAgbmF2YWpvd2hpdGU6ICdmZmRlYWQnLFxuICAgICAgICBuYXZ5OiAnMDAwMDgwJyxcbiAgICAgICAgb2xkbGFjZTogJ2ZkZjVlNicsXG4gICAgICAgIG9saXZlOiAnODA4MDAwJyxcbiAgICAgICAgb2xpdmVkcmFiOiAnNmI4ZTIzJyxcbiAgICAgICAgb3JhbmdlOiAnZmZhNTAwJyxcbiAgICAgICAgb3JhbmdlcmVkOiAnZmY0NTAwJyxcbiAgICAgICAgb3JjaGlkOiAnZGE3MGQ2JyxcbiAgICAgICAgcGFsZWdvbGRlbnJvZDogJ2VlZThhYScsXG4gICAgICAgIHBhbGVncmVlbjogJzk4ZmI5OCcsXG4gICAgICAgIHBhbGV0dXJxdW9pc2U6ICdhZmVlZWUnLFxuICAgICAgICBwYWxldmlvbGV0cmVkOiAnZDg3MDkzJyxcbiAgICAgICAgcGFwYXlhd2hpcDogJ2ZmZWZkNScsXG4gICAgICAgIHBlYWNocHVmZjogJ2ZmZGFiOScsXG4gICAgICAgIHBlcnU6ICdjZDg1M2YnLFxuICAgICAgICBwaW5rOiAnZmZjMGNiJyxcbiAgICAgICAgcGx1bTogJ2RkYTBkZCcsXG4gICAgICAgIHBvd2RlcmJsdWU6ICdiMGUwZTYnLFxuICAgICAgICBwdXJwbGU6ICc4MDAwODAnLFxuICAgICAgICByZWJlY2NhcHVycGxlOiAnNjYzMzk5JyxcbiAgICAgICAgcmVkOiAnZmYwMDAwJyxcbiAgICAgICAgcm9zeWJyb3duOiAnYmM4ZjhmJyxcbiAgICAgICAgcm95YWxibHVlOiAnNDE2OWUxJyxcbiAgICAgICAgc2FkZGxlYnJvd246ICc4YjQ1MTMnLFxuICAgICAgICBzYWxtb246ICdmYTgwNzInLFxuICAgICAgICBzYW5keWJyb3duOiAnZjRhNDYwJyxcbiAgICAgICAgc2VhZ3JlZW46ICcyZThiNTcnLFxuICAgICAgICBzZWFzaGVsbDogJ2ZmZjVlZScsXG4gICAgICAgIHNpZW5uYTogJ2EwNTIyZCcsXG4gICAgICAgIHNpbHZlcjogJ2MwYzBjMCcsXG4gICAgICAgIHNreWJsdWU6ICc4N2NlZWInLFxuICAgICAgICBzbGF0ZWJsdWU6ICc2YTVhY2QnLFxuICAgICAgICBzbGF0ZWdyYXk6ICc3MDgwOTAnLFxuICAgICAgICBzbm93OiAnZmZmYWZhJyxcbiAgICAgICAgc3ByaW5nZ3JlZW46ICcwMGZmN2YnLFxuICAgICAgICBzdGVlbGJsdWU6ICc0NjgyYjQnLFxuICAgICAgICB0YW46ICdkMmI0OGMnLFxuICAgICAgICB0ZWFsOiAnMDA4MDgwJyxcbiAgICAgICAgdGhpc3RsZTogJ2Q4YmZkOCcsXG4gICAgICAgIHRvbWF0bzogJ2ZmNjM0NycsXG4gICAgICAgIHR1cnF1b2lzZTogJzQwZTBkMCcsXG4gICAgICAgIHZpb2xldDogJ2VlODJlZScsXG4gICAgICAgIHZpb2xldHJlZDogJ2QwMjA5MCcsXG4gICAgICAgIHdoZWF0OiAnZjVkZWIzJyxcbiAgICAgICAgd2hpdGU6ICdmZmZmZmYnLFxuICAgICAgICB3aGl0ZXNtb2tlOiAnZjVmNWY1JyxcbiAgICAgICAgeWVsbG93OiAnZmZmZjAwJyxcbiAgICAgICAgeWVsbG93Z3JlZW46ICc5YWNkMzInXG4gICAgfTtcbiAgICBjb2xvcl9zdHJpbmcgPSBzaW1wbGVfY29sb3JzW2NvbG9yX3N0cmluZ10gfHwgY29sb3Jfc3RyaW5nO1xuICAgIC8vIGVtZCBvZiBzaW1wbGUgdHlwZS1pbiBjb2xvcnNcblxuICAgIC8vIGFycmF5IG9mIGNvbG9yIGRlZmluaXRpb24gb2JqZWN0c1xuICAgIHZhciBjb2xvcl9kZWZzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgICByZTogL15yZ2JhXFwoKFxcZHsxLDN9KSxcXHMqKFxcZHsxLDN9KSxcXHMqKFxcZHsxLDN9KSxcXHMqKCg/OlxcZD9cXC4pP1xcZClcXCkkLyxcbiAgICAgICAgICAgIGV4YW1wbGU6IFsncmdiYSgxMjMsIDIzNCwgNDUsIDAuOCknLCAncmdiYSgyNTUsMjM0LDI0NSwxLjApJ10sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoYml0cyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoYml0c1sxXSksXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGJpdHNbMl0pLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzNdKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VGbG9hdChiaXRzWzRdKVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJlOiAvXnJnYlxcKChcXGR7MSwzfSksXFxzKihcXGR7MSwzfSksXFxzKihcXGR7MSwzfSlcXCkkLyxcbiAgICAgICAgICAgIGV4YW1wbGU6IFsncmdiKDEyMywgMjM0LCA0NSknLCAncmdiKDI1NSwyMzQsMjQ1KSddLFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGJpdHMpe1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGJpdHNbMV0pLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzJdKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoYml0c1szXSlcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICByZTogL14oWzAtOWEtZkEtRl17Mn0pKFswLTlhLWZBLUZdezJ9KShbMC05YS1mQS1GXXsyfSkkLyxcbiAgICAgICAgICAgIGV4YW1wbGU6IFsnIzAwZmYwMCcsICczMzY2OTknXSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChiaXRzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzFdLCAxNiksXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGJpdHNbMl0sIDE2KSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoYml0c1szXSwgMTYpXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgcmU6IC9eKFswLTlhLWZBLUZdezF9KShbMC05YS1mQS1GXXsxfSkoWzAtOWEtZkEtRl17MX0pJC8sXG4gICAgICAgICAgICBleGFtcGxlOiBbJyNmYjAnLCAnZjBmJ10sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoYml0cyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoYml0c1sxXSArIGJpdHNbMV0sIDE2KSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoYml0c1syXSArIGJpdHNbMl0sIDE2KSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoYml0c1szXSArIGJpdHNbM10sIDE2KVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBdO1xuXG4gICAgLy8gc2VhcmNoIHRocm91Z2ggdGhlIGRlZmluaXRpb25zIHRvIGZpbmQgYSBtYXRjaFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sb3JfZGVmcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcmUgPSBjb2xvcl9kZWZzW2ldLnJlO1xuICAgICAgICB2YXIgcHJvY2Vzc29yID0gY29sb3JfZGVmc1tpXS5wcm9jZXNzO1xuICAgICAgICB2YXIgYml0cyA9IHJlLmV4ZWMoY29sb3Jfc3RyaW5nKTtcbiAgICAgICAgaWYgKGJpdHMpIHtcbiAgICAgICAgICAgIHZhciBjaGFubmVscyA9IHByb2Nlc3NvcihiaXRzKTtcbiAgICAgICAgICAgIHRoaXMuciA9IGNoYW5uZWxzWzBdO1xuICAgICAgICAgICAgdGhpcy5nID0gY2hhbm5lbHNbMV07XG4gICAgICAgICAgICB0aGlzLmIgPSBjaGFubmVsc1syXTtcbiAgICAgICAgICAgIGlmIChjaGFubmVscy5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hbHBoYSA9IGNoYW5uZWxzWzNdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vayA9IHRydWU7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgIC8vIHZhbGlkYXRlL2NsZWFudXAgdmFsdWVzXG4gICAgdGhpcy5yID0gKHRoaXMuciA8IDAgfHwgaXNOYU4odGhpcy5yKSkgPyAwIDogKCh0aGlzLnIgPiAyNTUpID8gMjU1IDogdGhpcy5yKTtcbiAgICB0aGlzLmcgPSAodGhpcy5nIDwgMCB8fCBpc05hTih0aGlzLmcpKSA/IDAgOiAoKHRoaXMuZyA+IDI1NSkgPyAyNTUgOiB0aGlzLmcpO1xuICAgIHRoaXMuYiA9ICh0aGlzLmIgPCAwIHx8IGlzTmFOKHRoaXMuYikpID8gMCA6ICgodGhpcy5iID4gMjU1KSA/IDI1NSA6IHRoaXMuYik7XG4gICAgdGhpcy5hbHBoYSA9ICh0aGlzLmFscGhhIDwgMCkgPyAwIDogKCh0aGlzLmFscGhhID4gMS4wIHx8IGlzTmFOKHRoaXMuYWxwaGEpKSA/IDEuMCA6IHRoaXMuYWxwaGEpO1xuXG4gICAgLy8gc29tZSBnZXR0ZXJzXG4gICAgdGhpcy50b1JHQiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICdyZ2IoJyArIHRoaXMuciArICcsICcgKyB0aGlzLmcgKyAnLCAnICsgdGhpcy5iICsgJyknO1xuICAgIH1cbiAgICB0aGlzLnRvUkdCQSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICdyZ2JhKCcgKyB0aGlzLnIgKyAnLCAnICsgdGhpcy5nICsgJywgJyArIHRoaXMuYiArICcsICcgKyB0aGlzLmFscGhhICsgJyknO1xuICAgIH1cbiAgICB0aGlzLnRvSGV4ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgciA9IHRoaXMuci50b1N0cmluZygxNik7XG4gICAgICAgIHZhciBnID0gdGhpcy5nLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmIudG9TdHJpbmcoMTYpO1xuICAgICAgICBpZiAoci5sZW5ndGggPT0gMSkgciA9ICcwJyArIHI7XG4gICAgICAgIGlmIChnLmxlbmd0aCA9PSAxKSBnID0gJzAnICsgZztcbiAgICAgICAgaWYgKGIubGVuZ3RoID09IDEpIGIgPSAnMCcgKyBiO1xuICAgICAgICByZXR1cm4gJyMnICsgciArIGcgKyBiO1xuICAgIH1cblxuICAgIC8vIGhlbHBcbiAgICB0aGlzLmdldEhlbHBYTUwgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdmFyIGV4YW1wbGVzID0gbmV3IEFycmF5KCk7XG4gICAgICAgIC8vIGFkZCByZWdleHBzXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sb3JfZGVmcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGV4YW1wbGUgPSBjb2xvcl9kZWZzW2ldLmV4YW1wbGU7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGV4YW1wbGUubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBleGFtcGxlc1tleGFtcGxlcy5sZW5ndGhdID0gZXhhbXBsZVtqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBhZGQgdHlwZS1pbiBjb2xvcnNcbiAgICAgICAgZm9yICh2YXIgc2MgaW4gc2ltcGxlX2NvbG9ycykge1xuICAgICAgICAgICAgZXhhbXBsZXNbZXhhbXBsZXMubGVuZ3RoXSA9IHNjO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHhtbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgICAgIHhtbC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3JnYmNvbG9yLWV4YW1wbGVzJyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXhhbXBsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIGxpc3RfaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgICAgICAgICAgdmFyIGxpc3RfY29sb3IgPSBuZXcgUkdCQ29sb3IoZXhhbXBsZXNbaV0pO1xuICAgICAgICAgICAgICAgIHZhciBleGFtcGxlX2RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIGV4YW1wbGVfZGl2LnN0eWxlLmNzc1RleHQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgJ21hcmdpbjogM3B4OyAnXG4gICAgICAgICAgICAgICAgICAgICAgICArICdib3JkZXI6IDFweCBzb2xpZCBibGFjazsgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnYmFja2dyb3VuZDonICsgbGlzdF9jb2xvci50b0hleCgpICsgJzsgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnY29sb3I6JyArIGxpc3RfY29sb3IudG9IZXgoKVxuICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICBleGFtcGxlX2Rpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgndGVzdCcpKTtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdF9pdGVtX3ZhbHVlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXG4gICAgICAgICAgICAgICAgICAgICcgJyArIGV4YW1wbGVzW2ldICsgJyAtPiAnICsgbGlzdF9jb2xvci50b1JHQigpICsgJyAtPiAnICsgbGlzdF9jb2xvci50b0hleCgpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBsaXN0X2l0ZW0uYXBwZW5kQ2hpbGQoZXhhbXBsZV9kaXYpO1xuICAgICAgICAgICAgICAgIGxpc3RfaXRlbS5hcHBlbmRDaGlsZChsaXN0X2l0ZW1fdmFsdWUpO1xuICAgICAgICAgICAgICAgIHhtbC5hcHBlbmRDaGlsZChsaXN0X2l0ZW0pO1xuXG4gICAgICAgICAgICB9IGNhdGNoKGUpe31cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geG1sO1xuXG4gICAgfVxuXG59XG4iLCJpbXBvcnQgX29iamVjdFNwcmVhZCBmcm9tICdAYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9vYmplY3RTcHJlYWQyJztcblxuLyoqXG4gKiBBZGFwdGVkIGZyb20gUmVhY3Q6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC9ibG9iL21hc3Rlci9wYWNrYWdlcy9zaGFyZWQvZm9ybWF0UHJvZEVycm9yTWVzc2FnZS5qc1xuICpcbiAqIERvIG5vdCByZXF1aXJlIHRoaXMgbW9kdWxlIGRpcmVjdGx5ISBVc2Ugbm9ybWFsIHRocm93IGVycm9yIGNhbGxzLiBUaGVzZSBtZXNzYWdlcyB3aWxsIGJlIHJlcGxhY2VkIHdpdGggZXJyb3IgY29kZXNcbiAqIGR1cmluZyBidWlsZC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBjb2RlXG4gKi9cbmZ1bmN0aW9uIGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoY29kZSkge1xuICByZXR1cm4gXCJNaW5pZmllZCBSZWR1eCBlcnJvciAjXCIgKyBjb2RlICsgXCI7IHZpc2l0IGh0dHBzOi8vcmVkdXguanMub3JnL0Vycm9ycz9jb2RlPVwiICsgY29kZSArIFwiIGZvciB0aGUgZnVsbCBtZXNzYWdlIG9yIFwiICsgJ3VzZSB0aGUgbm9uLW1pbmlmaWVkIGRldiBlbnZpcm9ubWVudCBmb3IgZnVsbCBlcnJvcnMuICc7XG59XG5cbi8vIElubGluZWQgdmVyc2lvbiBvZiB0aGUgYHN5bWJvbC1vYnNlcnZhYmxlYCBwb2x5ZmlsbFxudmFyICQkb2JzZXJ2YWJsZSA9IChmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIFN5bWJvbC5vYnNlcnZhYmxlIHx8ICdAQG9ic2VydmFibGUnO1xufSkoKTtcblxuLyoqXG4gKiBUaGVzZSBhcmUgcHJpdmF0ZSBhY3Rpb24gdHlwZXMgcmVzZXJ2ZWQgYnkgUmVkdXguXG4gKiBGb3IgYW55IHVua25vd24gYWN0aW9ucywgeW91IG11c3QgcmV0dXJuIHRoZSBjdXJyZW50IHN0YXRlLlxuICogSWYgdGhlIGN1cnJlbnQgc3RhdGUgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCByZXR1cm4gdGhlIGluaXRpYWwgc3RhdGUuXG4gKiBEbyBub3QgcmVmZXJlbmNlIHRoZXNlIGFjdGlvbiB0eXBlcyBkaXJlY3RseSBpbiB5b3VyIGNvZGUuXG4gKi9cbnZhciByYW5kb21TdHJpbmcgPSBmdW5jdGlvbiByYW5kb21TdHJpbmcoKSB7XG4gIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoNykuc3BsaXQoJycpLmpvaW4oJy4nKTtcbn07XG5cbnZhciBBY3Rpb25UeXBlcyA9IHtcbiAgSU5JVDogXCJAQHJlZHV4L0lOSVRcIiArIHJhbmRvbVN0cmluZygpLFxuICBSRVBMQUNFOiBcIkBAcmVkdXgvUkVQTEFDRVwiICsgcmFuZG9tU3RyaW5nKCksXG4gIFBST0JFX1VOS05PV05fQUNUSU9OOiBmdW5jdGlvbiBQUk9CRV9VTktOT1dOX0FDVElPTigpIHtcbiAgICByZXR1cm4gXCJAQHJlZHV4L1BST0JFX1VOS05PV05fQUNUSU9OXCIgKyByYW5kb21TdHJpbmcoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge2FueX0gb2JqIFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBhcmd1bWVudCBhcHBlYXJzIHRvIGJlIGEgcGxhaW4gb2JqZWN0LlxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgfHwgb2JqID09PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gIHZhciBwcm90byA9IG9iajtcblxuICB3aGlsZSAoT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvKSAhPT0gbnVsbCkge1xuICAgIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvKTtcbiAgfVxuXG4gIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSA9PT0gcHJvdG87XG59XG5cbi8vIElubGluZWQgLyBzaG9ydGVuZWQgdmVyc2lvbiBvZiBga2luZE9mYCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9qb25zY2hsaW5rZXJ0L2tpbmQtb2ZcbmZ1bmN0aW9uIG1pbmlLaW5kT2YodmFsKSB7XG4gIGlmICh2YWwgPT09IHZvaWQgMCkgcmV0dXJuICd1bmRlZmluZWQnO1xuICBpZiAodmFsID09PSBudWxsKSByZXR1cm4gJ251bGwnO1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWw7XG5cbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICBjYXNlICdudW1iZXInOlxuICAgIGNhc2UgJ3N5bWJvbCc6XG4gICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAge1xuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICAgIH1cbiAgfVxuXG4gIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHJldHVybiAnYXJyYXknO1xuICBpZiAoaXNEYXRlKHZhbCkpIHJldHVybiAnZGF0ZSc7XG4gIGlmIChpc0Vycm9yKHZhbCkpIHJldHVybiAnZXJyb3InO1xuICB2YXIgY29uc3RydWN0b3JOYW1lID0gY3Rvck5hbWUodmFsKTtcblxuICBzd2l0Y2ggKGNvbnN0cnVjdG9yTmFtZSkge1xuICAgIGNhc2UgJ1N5bWJvbCc6XG4gICAgY2FzZSAnUHJvbWlzZSc6XG4gICAgY2FzZSAnV2Vha01hcCc6XG4gICAgY2FzZSAnV2Vha1NldCc6XG4gICAgY2FzZSAnTWFwJzpcbiAgICBjYXNlICdTZXQnOlxuICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yTmFtZTtcbiAgfSAvLyBvdGhlclxuXG5cbiAgcmV0dXJuIHR5cGUuc2xpY2UoOCwgLTEpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzL2csICcnKTtcbn1cblxuZnVuY3Rpb24gY3Rvck5hbWUodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yID09PSAnZnVuY3Rpb24nID8gdmFsLmNvbnN0cnVjdG9yLm5hbWUgOiBudWxsO1xufVxuXG5mdW5jdGlvbiBpc0Vycm9yKHZhbCkge1xuICByZXR1cm4gdmFsIGluc3RhbmNlb2YgRXJyb3IgfHwgdHlwZW9mIHZhbC5tZXNzYWdlID09PSAnc3RyaW5nJyAmJiB2YWwuY29uc3RydWN0b3IgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5zdGFja1RyYWNlTGltaXQgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIHR5cGVvZiB2YWwudG9EYXRlU3RyaW5nID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWwuZ2V0RGF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgdmFsLnNldERhdGUgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGtpbmRPZih2YWwpIHtcbiAgdmFyIHR5cGVPZlZhbCA9IHR5cGVvZiB2YWw7XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICB0eXBlT2ZWYWwgPSBtaW5pS2luZE9mKHZhbCk7XG4gIH1cblxuICByZXR1cm4gdHlwZU9mVmFsO1xufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKlxuICogKipXZSByZWNvbW1lbmQgdXNpbmcgdGhlIGBjb25maWd1cmVTdG9yZWAgbWV0aG9kXG4gKiBvZiB0aGUgYEByZWR1eGpzL3Rvb2xraXRgIHBhY2thZ2UqKiwgd2hpY2ggcmVwbGFjZXMgYGNyZWF0ZVN0b3JlYC5cbiAqXG4gKiBSZWR1eCBUb29sa2l0IGlzIG91ciByZWNvbW1lbmRlZCBhcHByb2FjaCBmb3Igd3JpdGluZyBSZWR1eCBsb2dpYyB0b2RheSxcbiAqIGluY2x1ZGluZyBzdG9yZSBzZXR1cCwgcmVkdWNlcnMsIGRhdGEgZmV0Y2hpbmcsIGFuZCBtb3JlLlxuICpcbiAqICoqRm9yIG1vcmUgZGV0YWlscywgcGxlYXNlIHJlYWQgdGhpcyBSZWR1eCBkb2NzIHBhZ2U6KipcbiAqICoqaHR0cHM6Ly9yZWR1eC5qcy5vcmcvaW50cm9kdWN0aW9uL3doeS1ydGstaXMtcmVkdXgtdG9kYXkqKlxuICpcbiAqIGBjb25maWd1cmVTdG9yZWAgZnJvbSBSZWR1eCBUb29sa2l0IGlzIGFuIGltcHJvdmVkIHZlcnNpb24gb2YgYGNyZWF0ZVN0b3JlYCB0aGF0XG4gKiBzaW1wbGlmaWVzIHNldHVwIGFuZCBoZWxwcyBhdm9pZCBjb21tb24gYnVncy5cbiAqXG4gKiBZb3Ugc2hvdWxkIG5vdCBiZSB1c2luZyB0aGUgYHJlZHV4YCBjb3JlIHBhY2thZ2UgYnkgaXRzZWxmIHRvZGF5LCBleGNlcHQgZm9yIGxlYXJuaW5nIHB1cnBvc2VzLlxuICogVGhlIGBjcmVhdGVTdG9yZWAgbWV0aG9kIGZyb20gdGhlIGNvcmUgYHJlZHV4YCBwYWNrYWdlIHdpbGwgbm90IGJlIHJlbW92ZWQsIGJ1dCB3ZSBlbmNvdXJhZ2VcbiAqIGFsbCB1c2VycyB0byBtaWdyYXRlIHRvIHVzaW5nIFJlZHV4IFRvb2xraXQgZm9yIGFsbCBSZWR1eCBjb2RlLlxuICpcbiAqIElmIHlvdSB3YW50IHRvIHVzZSBgY3JlYXRlU3RvcmVgIHdpdGhvdXQgdGhpcyB2aXN1YWwgZGVwcmVjYXRpb24gd2FybmluZywgdXNlXG4gKiB0aGUgYGxlZ2FjeV9jcmVhdGVTdG9yZWAgaW1wb3J0IGluc3RlYWQ6XG4gKlxuICogYGltcG9ydCB7IGxlZ2FjeV9jcmVhdGVTdG9yZSBhcyBjcmVhdGVTdG9yZX0gZnJvbSAncmVkdXgnYFxuICpcbiAqL1xuXG5mdW5jdGlvbiBjcmVhdGVTdG9yZShyZWR1Y2VyLCBwcmVsb2FkZWRTdGF0ZSwgZW5oYW5jZXIpIHtcbiAgdmFyIF9yZWYyO1xuXG4gIGlmICh0eXBlb2YgcHJlbG9hZGVkU3RhdGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGVuaGFuY2VyID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBlbmhhbmNlciA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgYXJndW1lbnRzWzNdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoMCkgOiAnSXQgbG9va3MgbGlrZSB5b3UgYXJlIHBhc3Npbmcgc2V2ZXJhbCBzdG9yZSBlbmhhbmNlcnMgdG8gJyArICdjcmVhdGVTdG9yZSgpLiBUaGlzIGlzIG5vdCBzdXBwb3J0ZWQuIEluc3RlYWQsIGNvbXBvc2UgdGhlbSAnICsgJ3RvZ2V0aGVyIHRvIGEgc2luZ2xlIGZ1bmN0aW9uLiBTZWUgaHR0cHM6Ly9yZWR1eC5qcy5vcmcvdHV0b3JpYWxzL2Z1bmRhbWVudGFscy9wYXJ0LTQtc3RvcmUjY3JlYXRpbmctYS1zdG9yZS13aXRoLWVuaGFuY2VycyBmb3IgYW4gZXhhbXBsZS4nKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcHJlbG9hZGVkU3RhdGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGVuaGFuY2VyID09PSAndW5kZWZpbmVkJykge1xuICAgIGVuaGFuY2VyID0gcHJlbG9hZGVkU3RhdGU7XG4gICAgcHJlbG9hZGVkU3RhdGUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGVuaGFuY2VyICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgZW5oYW5jZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDEpIDogXCJFeHBlY3RlZCB0aGUgZW5oYW5jZXIgdG8gYmUgYSBmdW5jdGlvbi4gSW5zdGVhZCwgcmVjZWl2ZWQ6ICdcIiArIGtpbmRPZihlbmhhbmNlcikgKyBcIidcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVuaGFuY2VyKGNyZWF0ZVN0b3JlKShyZWR1Y2VyLCBwcmVsb2FkZWRTdGF0ZSk7XG4gIH1cblxuICBpZiAodHlwZW9mIHJlZHVjZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgyKSA6IFwiRXhwZWN0ZWQgdGhlIHJvb3QgcmVkdWNlciB0byBiZSBhIGZ1bmN0aW9uLiBJbnN0ZWFkLCByZWNlaXZlZDogJ1wiICsga2luZE9mKHJlZHVjZXIpICsgXCInXCIpO1xuICB9XG5cbiAgdmFyIGN1cnJlbnRSZWR1Y2VyID0gcmVkdWNlcjtcbiAgdmFyIGN1cnJlbnRTdGF0ZSA9IHByZWxvYWRlZFN0YXRlO1xuICB2YXIgY3VycmVudExpc3RlbmVycyA9IFtdO1xuICB2YXIgbmV4dExpc3RlbmVycyA9IGN1cnJlbnRMaXN0ZW5lcnM7XG4gIHZhciBpc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG4gIC8qKlxuICAgKiBUaGlzIG1ha2VzIGEgc2hhbGxvdyBjb3B5IG9mIGN1cnJlbnRMaXN0ZW5lcnMgc28gd2UgY2FuIHVzZVxuICAgKiBuZXh0TGlzdGVuZXJzIGFzIGEgdGVtcG9yYXJ5IGxpc3Qgd2hpbGUgZGlzcGF0Y2hpbmcuXG4gICAqXG4gICAqIFRoaXMgcHJldmVudHMgYW55IGJ1Z3MgYXJvdW5kIGNvbnN1bWVycyBjYWxsaW5nXG4gICAqIHN1YnNjcmliZS91bnN1YnNjcmliZSBpbiB0aGUgbWlkZGxlIG9mIGEgZGlzcGF0Y2guXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKG5leHRMaXN0ZW5lcnMgPT09IGN1cnJlbnRMaXN0ZW5lcnMpIHtcbiAgICAgIG5leHRMaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzLnNsaWNlKCk7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBSZWFkcyB0aGUgc3RhdGUgdHJlZSBtYW5hZ2VkIGJ5IHRoZSBzdG9yZS5cbiAgICpcbiAgICogQHJldHVybnMge2FueX0gVGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBvZiB5b3VyIGFwcGxpY2F0aW9uLlxuICAgKi9cblxuXG4gIGZ1bmN0aW9uIGdldFN0YXRlKCkge1xuICAgIGlmIChpc0Rpc3BhdGNoaW5nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgzKSA6ICdZb3UgbWF5IG5vdCBjYWxsIHN0b3JlLmdldFN0YXRlKCkgd2hpbGUgdGhlIHJlZHVjZXIgaXMgZXhlY3V0aW5nLiAnICsgJ1RoZSByZWR1Y2VyIGhhcyBhbHJlYWR5IHJlY2VpdmVkIHRoZSBzdGF0ZSBhcyBhbiBhcmd1bWVudC4gJyArICdQYXNzIGl0IGRvd24gZnJvbSB0aGUgdG9wIHJlZHVjZXIgaW5zdGVhZCBvZiByZWFkaW5nIGl0IGZyb20gdGhlIHN0b3JlLicpO1xuICAgIH1cblxuICAgIHJldHVybiBjdXJyZW50U3RhdGU7XG4gIH1cbiAgLyoqXG4gICAqIEFkZHMgYSBjaGFuZ2UgbGlzdGVuZXIuIEl0IHdpbGwgYmUgY2FsbGVkIGFueSB0aW1lIGFuIGFjdGlvbiBpcyBkaXNwYXRjaGVkLFxuICAgKiBhbmQgc29tZSBwYXJ0IG9mIHRoZSBzdGF0ZSB0cmVlIG1heSBwb3RlbnRpYWxseSBoYXZlIGNoYW5nZWQuIFlvdSBtYXkgdGhlblxuICAgKiBjYWxsIGBnZXRTdGF0ZSgpYCB0byByZWFkIHRoZSBjdXJyZW50IHN0YXRlIHRyZWUgaW5zaWRlIHRoZSBjYWxsYmFjay5cbiAgICpcbiAgICogWW91IG1heSBjYWxsIGBkaXNwYXRjaCgpYCBmcm9tIGEgY2hhbmdlIGxpc3RlbmVyLCB3aXRoIHRoZSBmb2xsb3dpbmdcbiAgICogY2F2ZWF0czpcbiAgICpcbiAgICogMS4gVGhlIHN1YnNjcmlwdGlvbnMgYXJlIHNuYXBzaG90dGVkIGp1c3QgYmVmb3JlIGV2ZXJ5IGBkaXNwYXRjaCgpYCBjYWxsLlxuICAgKiBJZiB5b3Ugc3Vic2NyaWJlIG9yIHVuc3Vic2NyaWJlIHdoaWxlIHRoZSBsaXN0ZW5lcnMgYXJlIGJlaW5nIGludm9rZWQsIHRoaXNcbiAgICogd2lsbCBub3QgaGF2ZSBhbnkgZWZmZWN0IG9uIHRoZSBgZGlzcGF0Y2goKWAgdGhhdCBpcyBjdXJyZW50bHkgaW4gcHJvZ3Jlc3MuXG4gICAqIEhvd2V2ZXIsIHRoZSBuZXh0IGBkaXNwYXRjaCgpYCBjYWxsLCB3aGV0aGVyIG5lc3RlZCBvciBub3QsIHdpbGwgdXNlIGEgbW9yZVxuICAgKiByZWNlbnQgc25hcHNob3Qgb2YgdGhlIHN1YnNjcmlwdGlvbiBsaXN0LlxuICAgKlxuICAgKiAyLiBUaGUgbGlzdGVuZXIgc2hvdWxkIG5vdCBleHBlY3QgdG8gc2VlIGFsbCBzdGF0ZSBjaGFuZ2VzLCBhcyB0aGUgc3RhdGVcbiAgICogbWlnaHQgaGF2ZSBiZWVuIHVwZGF0ZWQgbXVsdGlwbGUgdGltZXMgZHVyaW5nIGEgbmVzdGVkIGBkaXNwYXRjaCgpYCBiZWZvcmVcbiAgICogdGhlIGxpc3RlbmVyIGlzIGNhbGxlZC4gSXQgaXMsIGhvd2V2ZXIsIGd1YXJhbnRlZWQgdGhhdCBhbGwgc3Vic2NyaWJlcnNcbiAgICogcmVnaXN0ZXJlZCBiZWZvcmUgdGhlIGBkaXNwYXRjaCgpYCBzdGFydGVkIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIGxhdGVzdFxuICAgKiBzdGF0ZSBieSB0aGUgdGltZSBpdCBleGl0cy5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgQSBjYWxsYmFjayB0byBiZSBpbnZva2VkIG9uIGV2ZXJ5IGRpc3BhdGNoLlxuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgZnVuY3Rpb24gdG8gcmVtb3ZlIHRoaXMgY2hhbmdlIGxpc3RlbmVyLlxuICAgKi9cblxuXG4gIGZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcikge1xuICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDQpIDogXCJFeHBlY3RlZCB0aGUgbGlzdGVuZXIgdG8gYmUgYSBmdW5jdGlvbi4gSW5zdGVhZCwgcmVjZWl2ZWQ6ICdcIiArIGtpbmRPZihsaXN0ZW5lcikgKyBcIidcIik7XG4gICAgfVxuXG4gICAgaWYgKGlzRGlzcGF0Y2hpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDUpIDogJ1lvdSBtYXkgbm90IGNhbGwgc3RvcmUuc3Vic2NyaWJlKCkgd2hpbGUgdGhlIHJlZHVjZXIgaXMgZXhlY3V0aW5nLiAnICsgJ0lmIHlvdSB3b3VsZCBsaWtlIHRvIGJlIG5vdGlmaWVkIGFmdGVyIHRoZSBzdG9yZSBoYXMgYmVlbiB1cGRhdGVkLCBzdWJzY3JpYmUgZnJvbSBhICcgKyAnY29tcG9uZW50IGFuZCBpbnZva2Ugc3RvcmUuZ2V0U3RhdGUoKSBpbiB0aGUgY2FsbGJhY2sgdG8gYWNjZXNzIHRoZSBsYXRlc3Qgc3RhdGUuICcgKyAnU2VlIGh0dHBzOi8vcmVkdXguanMub3JnL2FwaS9zdG9yZSNzdWJzY3JpYmVsaXN0ZW5lciBmb3IgbW9yZSBkZXRhaWxzLicpO1xuICAgIH1cblxuICAgIHZhciBpc1N1YnNjcmliZWQgPSB0cnVlO1xuICAgIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKTtcbiAgICBuZXh0TGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgIHJldHVybiBmdW5jdGlvbiB1bnN1YnNjcmliZSgpIHtcbiAgICAgIGlmICghaXNTdWJzY3JpYmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzRGlzcGF0Y2hpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoNikgOiAnWW91IG1heSBub3QgdW5zdWJzY3JpYmUgZnJvbSBhIHN0b3JlIGxpc3RlbmVyIHdoaWxlIHRoZSByZWR1Y2VyIGlzIGV4ZWN1dGluZy4gJyArICdTZWUgaHR0cHM6Ly9yZWR1eC5qcy5vcmcvYXBpL3N0b3JlI3N1YnNjcmliZWxpc3RlbmVyIGZvciBtb3JlIGRldGFpbHMuJyk7XG4gICAgICB9XG5cbiAgICAgIGlzU3Vic2NyaWJlZCA9IGZhbHNlO1xuICAgICAgZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpO1xuICAgICAgdmFyIGluZGV4ID0gbmV4dExpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgIG5leHRMaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIGN1cnJlbnRMaXN0ZW5lcnMgPSBudWxsO1xuICAgIH07XG4gIH1cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgYW4gYWN0aW9uLiBJdCBpcyB0aGUgb25seSB3YXkgdG8gdHJpZ2dlciBhIHN0YXRlIGNoYW5nZS5cbiAgICpcbiAgICogVGhlIGByZWR1Y2VyYCBmdW5jdGlvbiwgdXNlZCB0byBjcmVhdGUgdGhlIHN0b3JlLCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZVxuICAgKiBjdXJyZW50IHN0YXRlIHRyZWUgYW5kIHRoZSBnaXZlbiBgYWN0aW9uYC4gSXRzIHJldHVybiB2YWx1ZSB3aWxsXG4gICAqIGJlIGNvbnNpZGVyZWQgdGhlICoqbmV4dCoqIHN0YXRlIG9mIHRoZSB0cmVlLCBhbmQgdGhlIGNoYW5nZSBsaXN0ZW5lcnNcbiAgICogd2lsbCBiZSBub3RpZmllZC5cbiAgICpcbiAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb25seSBzdXBwb3J0cyBwbGFpbiBvYmplY3QgYWN0aW9ucy4gSWYgeW91IHdhbnQgdG9cbiAgICogZGlzcGF0Y2ggYSBQcm9taXNlLCBhbiBPYnNlcnZhYmxlLCBhIHRodW5rLCBvciBzb21ldGhpbmcgZWxzZSwgeW91IG5lZWQgdG9cbiAgICogd3JhcCB5b3VyIHN0b3JlIGNyZWF0aW5nIGZ1bmN0aW9uIGludG8gdGhlIGNvcnJlc3BvbmRpbmcgbWlkZGxld2FyZS4gRm9yXG4gICAqIGV4YW1wbGUsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3IgdGhlIGByZWR1eC10aHVua2AgcGFja2FnZS4gRXZlbiB0aGVcbiAgICogbWlkZGxld2FyZSB3aWxsIGV2ZW50dWFsbHkgZGlzcGF0Y2ggcGxhaW4gb2JqZWN0IGFjdGlvbnMgdXNpbmcgdGhpcyBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhY3Rpb24gQSBwbGFpbiBvYmplY3QgcmVwcmVzZW50aW5nIOKAnHdoYXQgY2hhbmdlZOKAnS4gSXQgaXNcbiAgICogYSBnb29kIGlkZWEgdG8ga2VlcCBhY3Rpb25zIHNlcmlhbGl6YWJsZSBzbyB5b3UgY2FuIHJlY29yZCBhbmQgcmVwbGF5IHVzZXJcbiAgICogc2Vzc2lvbnMsIG9yIHVzZSB0aGUgdGltZSB0cmF2ZWxsaW5nIGByZWR1eC1kZXZ0b29sc2AuIEFuIGFjdGlvbiBtdXN0IGhhdmVcbiAgICogYSBgdHlwZWAgcHJvcGVydHkgd2hpY2ggbWF5IG5vdCBiZSBgdW5kZWZpbmVkYC4gSXQgaXMgYSBnb29kIGlkZWEgdG8gdXNlXG4gICAqIHN0cmluZyBjb25zdGFudHMgZm9yIGFjdGlvbiB0eXBlcy5cbiAgICpcbiAgICogQHJldHVybnMge09iamVjdH0gRm9yIGNvbnZlbmllbmNlLCB0aGUgc2FtZSBhY3Rpb24gb2JqZWN0IHlvdSBkaXNwYXRjaGVkLlxuICAgKlxuICAgKiBOb3RlIHRoYXQsIGlmIHlvdSB1c2UgYSBjdXN0b20gbWlkZGxld2FyZSwgaXQgbWF5IHdyYXAgYGRpc3BhdGNoKClgIHRvXG4gICAqIHJldHVybiBzb21ldGhpbmcgZWxzZSAoZm9yIGV4YW1wbGUsIGEgUHJvbWlzZSB5b3UgY2FuIGF3YWl0KS5cbiAgICovXG5cblxuICBmdW5jdGlvbiBkaXNwYXRjaChhY3Rpb24pIHtcbiAgICBpZiAoIWlzUGxhaW5PYmplY3QoYWN0aW9uKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoNykgOiBcIkFjdGlvbnMgbXVzdCBiZSBwbGFpbiBvYmplY3RzLiBJbnN0ZWFkLCB0aGUgYWN0dWFsIHR5cGUgd2FzOiAnXCIgKyBraW5kT2YoYWN0aW9uKSArIFwiJy4gWW91IG1heSBuZWVkIHRvIGFkZCBtaWRkbGV3YXJlIHRvIHlvdXIgc3RvcmUgc2V0dXAgdG8gaGFuZGxlIGRpc3BhdGNoaW5nIG90aGVyIHZhbHVlcywgc3VjaCBhcyAncmVkdXgtdGh1bmsnIHRvIGhhbmRsZSBkaXNwYXRjaGluZyBmdW5jdGlvbnMuIFNlZSBodHRwczovL3JlZHV4LmpzLm9yZy90dXRvcmlhbHMvZnVuZGFtZW50YWxzL3BhcnQtNC1zdG9yZSNtaWRkbGV3YXJlIGFuZCBodHRwczovL3JlZHV4LmpzLm9yZy90dXRvcmlhbHMvZnVuZGFtZW50YWxzL3BhcnQtNi1hc3luYy1sb2dpYyN1c2luZy10aGUtcmVkdXgtdGh1bmstbWlkZGxld2FyZSBmb3IgZXhhbXBsZXMuXCIpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYWN0aW9uLnR5cGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSg4KSA6ICdBY3Rpb25zIG1heSBub3QgaGF2ZSBhbiB1bmRlZmluZWQgXCJ0eXBlXCIgcHJvcGVydHkuIFlvdSBtYXkgaGF2ZSBtaXNzcGVsbGVkIGFuIGFjdGlvbiB0eXBlIHN0cmluZyBjb25zdGFudC4nKTtcbiAgICB9XG5cbiAgICBpZiAoaXNEaXNwYXRjaGluZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoOSkgOiAnUmVkdWNlcnMgbWF5IG5vdCBkaXNwYXRjaCBhY3Rpb25zLicpO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBpc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcbiAgICAgIGN1cnJlbnRTdGF0ZSA9IGN1cnJlbnRSZWR1Y2VyKGN1cnJlbnRTdGF0ZSwgYWN0aW9uKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBsaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzID0gbmV4dExpc3RlbmVycztcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XG4gICAgICBsaXN0ZW5lcigpO1xuICAgIH1cblxuICAgIHJldHVybiBhY3Rpb247XG4gIH1cbiAgLyoqXG4gICAqIFJlcGxhY2VzIHRoZSByZWR1Y2VyIGN1cnJlbnRseSB1c2VkIGJ5IHRoZSBzdG9yZSB0byBjYWxjdWxhdGUgdGhlIHN0YXRlLlxuICAgKlxuICAgKiBZb3UgbWlnaHQgbmVlZCB0aGlzIGlmIHlvdXIgYXBwIGltcGxlbWVudHMgY29kZSBzcGxpdHRpbmcgYW5kIHlvdSB3YW50IHRvXG4gICAqIGxvYWQgc29tZSBvZiB0aGUgcmVkdWNlcnMgZHluYW1pY2FsbHkuIFlvdSBtaWdodCBhbHNvIG5lZWQgdGhpcyBpZiB5b3VcbiAgICogaW1wbGVtZW50IGEgaG90IHJlbG9hZGluZyBtZWNoYW5pc20gZm9yIFJlZHV4LlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0UmVkdWNlciBUaGUgcmVkdWNlciBmb3IgdGhlIHN0b3JlIHRvIHVzZSBpbnN0ZWFkLlxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG5cblxuICBmdW5jdGlvbiByZXBsYWNlUmVkdWNlcihuZXh0UmVkdWNlcikge1xuICAgIGlmICh0eXBlb2YgbmV4dFJlZHVjZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDEwKSA6IFwiRXhwZWN0ZWQgdGhlIG5leHRSZWR1Y2VyIHRvIGJlIGEgZnVuY3Rpb24uIEluc3RlYWQsIHJlY2VpdmVkOiAnXCIgKyBraW5kT2YobmV4dFJlZHVjZXIpKTtcbiAgICB9XG5cbiAgICBjdXJyZW50UmVkdWNlciA9IG5leHRSZWR1Y2VyOyAvLyBUaGlzIGFjdGlvbiBoYXMgYSBzaW1pbGlhciBlZmZlY3QgdG8gQWN0aW9uVHlwZXMuSU5JVC5cbiAgICAvLyBBbnkgcmVkdWNlcnMgdGhhdCBleGlzdGVkIGluIGJvdGggdGhlIG5ldyBhbmQgb2xkIHJvb3RSZWR1Y2VyXG4gICAgLy8gd2lsbCByZWNlaXZlIHRoZSBwcmV2aW91cyBzdGF0ZS4gVGhpcyBlZmZlY3RpdmVseSBwb3B1bGF0ZXNcbiAgICAvLyB0aGUgbmV3IHN0YXRlIHRyZWUgd2l0aCBhbnkgcmVsZXZhbnQgZGF0YSBmcm9tIHRoZSBvbGQgb25lLlxuXG4gICAgZGlzcGF0Y2goe1xuICAgICAgdHlwZTogQWN0aW9uVHlwZXMuUkVQTEFDRVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBJbnRlcm9wZXJhYmlsaXR5IHBvaW50IGZvciBvYnNlcnZhYmxlL3JlYWN0aXZlIGxpYnJhcmllcy5cbiAgICogQHJldHVybnMge29ic2VydmFibGV9IEEgbWluaW1hbCBvYnNlcnZhYmxlIG9mIHN0YXRlIGNoYW5nZXMuXG4gICAqIEZvciBtb3JlIGluZm9ybWF0aW9uLCBzZWUgdGhlIG9ic2VydmFibGUgcHJvcG9zYWw6XG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L3Byb3Bvc2FsLW9ic2VydmFibGVcbiAgICovXG5cblxuICBmdW5jdGlvbiBvYnNlcnZhYmxlKCkge1xuICAgIHZhciBfcmVmO1xuXG4gICAgdmFyIG91dGVyU3Vic2NyaWJlID0gc3Vic2NyaWJlO1xuICAgIHJldHVybiBfcmVmID0ge1xuICAgICAgLyoqXG4gICAgICAgKiBUaGUgbWluaW1hbCBvYnNlcnZhYmxlIHN1YnNjcmlwdGlvbiBtZXRob2QuXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JzZXJ2ZXIgQW55IG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIGFzIGFuIG9ic2VydmVyLlxuICAgICAgICogVGhlIG9ic2VydmVyIG9iamVjdCBzaG91bGQgaGF2ZSBhIGBuZXh0YCBtZXRob2QuXG4gICAgICAgKiBAcmV0dXJucyB7c3Vic2NyaXB0aW9ufSBBbiBvYmplY3Qgd2l0aCBhbiBgdW5zdWJzY3JpYmVgIG1ldGhvZCB0aGF0IGNhblxuICAgICAgICogYmUgdXNlZCB0byB1bnN1YnNjcmliZSB0aGUgb2JzZXJ2YWJsZSBmcm9tIHRoZSBzdG9yZSwgYW5kIHByZXZlbnQgZnVydGhlclxuICAgICAgICogZW1pc3Npb24gb2YgdmFsdWVzIGZyb20gdGhlIG9ic2VydmFibGUuXG4gICAgICAgKi9cbiAgICAgIHN1YnNjcmliZTogZnVuY3Rpb24gc3Vic2NyaWJlKG9ic2VydmVyKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb2JzZXJ2ZXIgIT09ICdvYmplY3QnIHx8IG9ic2VydmVyID09PSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoMTEpIDogXCJFeHBlY3RlZCB0aGUgb2JzZXJ2ZXIgdG8gYmUgYW4gb2JqZWN0LiBJbnN0ZWFkLCByZWNlaXZlZDogJ1wiICsga2luZE9mKG9ic2VydmVyKSArIFwiJ1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG9ic2VydmVTdGF0ZSgpIHtcbiAgICAgICAgICBpZiAob2JzZXJ2ZXIubmV4dCkge1xuICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChnZXRTdGF0ZSgpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBvYnNlcnZlU3RhdGUoKTtcbiAgICAgICAgdmFyIHVuc3Vic2NyaWJlID0gb3V0ZXJTdWJzY3JpYmUob2JzZXJ2ZVN0YXRlKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB1bnN1YnNjcmliZTogdW5zdWJzY3JpYmVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LCBfcmVmWyQkb2JzZXJ2YWJsZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LCBfcmVmO1xuICB9IC8vIFdoZW4gYSBzdG9yZSBpcyBjcmVhdGVkLCBhbiBcIklOSVRcIiBhY3Rpb24gaXMgZGlzcGF0Y2hlZCBzbyB0aGF0IGV2ZXJ5XG4gIC8vIHJlZHVjZXIgcmV0dXJucyB0aGVpciBpbml0aWFsIHN0YXRlLiBUaGlzIGVmZmVjdGl2ZWx5IHBvcHVsYXRlc1xuICAvLyB0aGUgaW5pdGlhbCBzdGF0ZSB0cmVlLlxuXG5cbiAgZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFjdGlvblR5cGVzLklOSVRcbiAgfSk7XG4gIHJldHVybiBfcmVmMiA9IHtcbiAgICBkaXNwYXRjaDogZGlzcGF0Y2gsXG4gICAgc3Vic2NyaWJlOiBzdWJzY3JpYmUsXG4gICAgZ2V0U3RhdGU6IGdldFN0YXRlLFxuICAgIHJlcGxhY2VSZWR1Y2VyOiByZXBsYWNlUmVkdWNlclxuICB9LCBfcmVmMlskJG9ic2VydmFibGVdID0gb2JzZXJ2YWJsZSwgX3JlZjI7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBSZWR1eCBzdG9yZSB0aGF0IGhvbGRzIHRoZSBzdGF0ZSB0cmVlLlxuICpcbiAqICoqV2UgcmVjb21tZW5kIHVzaW5nIGBjb25maWd1cmVTdG9yZWAgZnJvbSB0aGVcbiAqIGBAcmVkdXhqcy90b29sa2l0YCBwYWNrYWdlKiosIHdoaWNoIHJlcGxhY2VzIGBjcmVhdGVTdG9yZWA6XG4gKiAqKmh0dHBzOi8vcmVkdXguanMub3JnL2ludHJvZHVjdGlvbi93aHktcnRrLWlzLXJlZHV4LXRvZGF5KipcbiAqXG4gKiBUaGUgb25seSB3YXkgdG8gY2hhbmdlIHRoZSBkYXRhIGluIHRoZSBzdG9yZSBpcyB0byBjYWxsIGBkaXNwYXRjaCgpYCBvbiBpdC5cbiAqXG4gKiBUaGVyZSBzaG91bGQgb25seSBiZSBhIHNpbmdsZSBzdG9yZSBpbiB5b3VyIGFwcC4gVG8gc3BlY2lmeSBob3cgZGlmZmVyZW50XG4gKiBwYXJ0cyBvZiB0aGUgc3RhdGUgdHJlZSByZXNwb25kIHRvIGFjdGlvbnMsIHlvdSBtYXkgY29tYmluZSBzZXZlcmFsIHJlZHVjZXJzXG4gKiBpbnRvIGEgc2luZ2xlIHJlZHVjZXIgZnVuY3Rpb24gYnkgdXNpbmcgYGNvbWJpbmVSZWR1Y2Vyc2AuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVkdWNlciBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgbmV4dCBzdGF0ZSB0cmVlLCBnaXZlblxuICogdGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBhbmQgdGhlIGFjdGlvbiB0byBoYW5kbGUuXG4gKlxuICogQHBhcmFtIHthbnl9IFtwcmVsb2FkZWRTdGF0ZV0gVGhlIGluaXRpYWwgc3RhdGUuIFlvdSBtYXkgb3B0aW9uYWxseSBzcGVjaWZ5IGl0XG4gKiB0byBoeWRyYXRlIHRoZSBzdGF0ZSBmcm9tIHRoZSBzZXJ2ZXIgaW4gdW5pdmVyc2FsIGFwcHMsIG9yIHRvIHJlc3RvcmUgYVxuICogcHJldmlvdXNseSBzZXJpYWxpemVkIHVzZXIgc2Vzc2lvbi5cbiAqIElmIHlvdSB1c2UgYGNvbWJpbmVSZWR1Y2Vyc2AgdG8gcHJvZHVjZSB0aGUgcm9vdCByZWR1Y2VyIGZ1bmN0aW9uLCB0aGlzIG11c3QgYmVcbiAqIGFuIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNoYXBlIGFzIGBjb21iaW5lUmVkdWNlcnNgIGtleXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2VuaGFuY2VyXSBUaGUgc3RvcmUgZW5oYW5jZXIuIFlvdSBtYXkgb3B0aW9uYWxseSBzcGVjaWZ5IGl0XG4gKiB0byBlbmhhbmNlIHRoZSBzdG9yZSB3aXRoIHRoaXJkLXBhcnR5IGNhcGFiaWxpdGllcyBzdWNoIGFzIG1pZGRsZXdhcmUsXG4gKiB0aW1lIHRyYXZlbCwgcGVyc2lzdGVuY2UsIGV0Yy4gVGhlIG9ubHkgc3RvcmUgZW5oYW5jZXIgdGhhdCBzaGlwcyB3aXRoIFJlZHV4XG4gKiBpcyBgYXBwbHlNaWRkbGV3YXJlKClgLlxuICpcbiAqIEByZXR1cm5zIHtTdG9yZX0gQSBSZWR1eCBzdG9yZSB0aGF0IGxldHMgeW91IHJlYWQgdGhlIHN0YXRlLCBkaXNwYXRjaCBhY3Rpb25zXG4gKiBhbmQgc3Vic2NyaWJlIHRvIGNoYW5nZXMuXG4gKi9cblxudmFyIGxlZ2FjeV9jcmVhdGVTdG9yZSA9IGNyZWF0ZVN0b3JlO1xuXG4vKipcbiAqIFByaW50cyBhIHdhcm5pbmcgaW4gdGhlIGNvbnNvbGUgaWYgaXQgZXhpc3RzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIFRoZSB3YXJuaW5nIG1lc3NhZ2UuXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gd2FybmluZyhtZXNzYWdlKSB7XG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS5lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG5cblxuICB0cnkge1xuICAgIC8vIFRoaXMgZXJyb3Igd2FzIHRocm93biBhcyBhIGNvbnZlbmllbmNlIHNvIHRoYXQgaWYgeW91IGVuYWJsZVxuICAgIC8vIFwiYnJlYWsgb24gYWxsIGV4Y2VwdGlvbnNcIiBpbiB5b3VyIGNvbnNvbGUsXG4gICAgLy8gaXQgd291bGQgcGF1c2UgdGhlIGV4ZWN1dGlvbiBhdCB0aGlzIGxpbmUuXG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICB9IGNhdGNoIChlKSB7fSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWVtcHR5XG5cbn1cblxuZnVuY3Rpb24gZ2V0VW5leHBlY3RlZFN0YXRlU2hhcGVXYXJuaW5nTWVzc2FnZShpbnB1dFN0YXRlLCByZWR1Y2VycywgYWN0aW9uLCB1bmV4cGVjdGVkS2V5Q2FjaGUpIHtcbiAgdmFyIHJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMocmVkdWNlcnMpO1xuICB2YXIgYXJndW1lbnROYW1lID0gYWN0aW9uICYmIGFjdGlvbi50eXBlID09PSBBY3Rpb25UeXBlcy5JTklUID8gJ3ByZWxvYWRlZFN0YXRlIGFyZ3VtZW50IHBhc3NlZCB0byBjcmVhdGVTdG9yZScgOiAncHJldmlvdXMgc3RhdGUgcmVjZWl2ZWQgYnkgdGhlIHJlZHVjZXInO1xuXG4gIGlmIChyZWR1Y2VyS2V5cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gJ1N0b3JlIGRvZXMgbm90IGhhdmUgYSB2YWxpZCByZWR1Y2VyLiBNYWtlIHN1cmUgdGhlIGFyZ3VtZW50IHBhc3NlZCAnICsgJ3RvIGNvbWJpbmVSZWR1Y2VycyBpcyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSByZWR1Y2Vycy4nO1xuICB9XG5cbiAgaWYgKCFpc1BsYWluT2JqZWN0KGlucHV0U3RhdGUpKSB7XG4gICAgcmV0dXJuIFwiVGhlIFwiICsgYXJndW1lbnROYW1lICsgXCIgaGFzIHVuZXhwZWN0ZWQgdHlwZSBvZiBcXFwiXCIgKyBraW5kT2YoaW5wdXRTdGF0ZSkgKyBcIlxcXCIuIEV4cGVjdGVkIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgXCIgKyAoXCJrZXlzOiBcXFwiXCIgKyByZWR1Y2VyS2V5cy5qb2luKCdcIiwgXCInKSArIFwiXFxcIlwiKTtcbiAgfVxuXG4gIHZhciB1bmV4cGVjdGVkS2V5cyA9IE9iamVjdC5rZXlzKGlucHV0U3RhdGUpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuICFyZWR1Y2Vycy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmICF1bmV4cGVjdGVkS2V5Q2FjaGVba2V5XTtcbiAgfSk7XG4gIHVuZXhwZWN0ZWRLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHVuZXhwZWN0ZWRLZXlDYWNoZVtrZXldID0gdHJ1ZTtcbiAgfSk7XG4gIGlmIChhY3Rpb24gJiYgYWN0aW9uLnR5cGUgPT09IEFjdGlvblR5cGVzLlJFUExBQ0UpIHJldHVybjtcblxuICBpZiAodW5leHBlY3RlZEtleXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBcIlVuZXhwZWN0ZWQgXCIgKyAodW5leHBlY3RlZEtleXMubGVuZ3RoID4gMSA/ICdrZXlzJyA6ICdrZXknKSArIFwiIFwiICsgKFwiXFxcIlwiICsgdW5leHBlY3RlZEtleXMuam9pbignXCIsIFwiJykgKyBcIlxcXCIgZm91bmQgaW4gXCIgKyBhcmd1bWVudE5hbWUgKyBcIi4gXCIpICsgXCJFeHBlY3RlZCB0byBmaW5kIG9uZSBvZiB0aGUga25vd24gcmVkdWNlciBrZXlzIGluc3RlYWQ6IFwiICsgKFwiXFxcIlwiICsgcmVkdWNlcktleXMuam9pbignXCIsIFwiJykgKyBcIlxcXCIuIFVuZXhwZWN0ZWQga2V5cyB3aWxsIGJlIGlnbm9yZWQuXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFJlZHVjZXJTaGFwZShyZWR1Y2Vycykge1xuICBPYmplY3Qua2V5cyhyZWR1Y2VycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHJlZHVjZXIgPSByZWR1Y2Vyc1trZXldO1xuICAgIHZhciBpbml0aWFsU3RhdGUgPSByZWR1Y2VyKHVuZGVmaW5lZCwge1xuICAgICAgdHlwZTogQWN0aW9uVHlwZXMuSU5JVFxuICAgIH0pO1xuXG4gICAgaWYgKHR5cGVvZiBpbml0aWFsU3RhdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgxMikgOiBcIlRoZSBzbGljZSByZWR1Y2VyIGZvciBrZXkgXFxcIlwiICsga2V5ICsgXCJcXFwiIHJldHVybmVkIHVuZGVmaW5lZCBkdXJpbmcgaW5pdGlhbGl6YXRpb24uIFwiICsgXCJJZiB0aGUgc3RhdGUgcGFzc2VkIHRvIHRoZSByZWR1Y2VyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgXCIgKyBcImV4cGxpY2l0bHkgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLiBUaGUgaW5pdGlhbCBzdGF0ZSBtYXkgXCIgKyBcIm5vdCBiZSB1bmRlZmluZWQuIElmIHlvdSBkb24ndCB3YW50IHRvIHNldCBhIHZhbHVlIGZvciB0aGlzIHJlZHVjZXIsIFwiICsgXCJ5b3UgY2FuIHVzZSBudWxsIGluc3RlYWQgb2YgdW5kZWZpbmVkLlwiKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHJlZHVjZXIodW5kZWZpbmVkLCB7XG4gICAgICB0eXBlOiBBY3Rpb25UeXBlcy5QUk9CRV9VTktOT1dOX0FDVElPTigpXG4gICAgfSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgxMykgOiBcIlRoZSBzbGljZSByZWR1Y2VyIGZvciBrZXkgXFxcIlwiICsga2V5ICsgXCJcXFwiIHJldHVybmVkIHVuZGVmaW5lZCB3aGVuIHByb2JlZCB3aXRoIGEgcmFuZG9tIHR5cGUuIFwiICsgKFwiRG9uJ3QgdHJ5IHRvIGhhbmRsZSAnXCIgKyBBY3Rpb25UeXBlcy5JTklUICsgXCInIG9yIG90aGVyIGFjdGlvbnMgaW4gXFxcInJlZHV4LypcXFwiIFwiKSArIFwibmFtZXNwYWNlLiBUaGV5IGFyZSBjb25zaWRlcmVkIHByaXZhdGUuIEluc3RlYWQsIHlvdSBtdXN0IHJldHVybiB0aGUgXCIgKyBcImN1cnJlbnQgc3RhdGUgZm9yIGFueSB1bmtub3duIGFjdGlvbnMsIHVubGVzcyBpdCBpcyB1bmRlZmluZWQsIFwiICsgXCJpbiB3aGljaCBjYXNlIHlvdSBtdXN0IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZSwgcmVnYXJkbGVzcyBvZiB0aGUgXCIgKyBcImFjdGlvbiB0eXBlLiBUaGUgaW5pdGlhbCBzdGF0ZSBtYXkgbm90IGJlIHVuZGVmaW5lZCwgYnV0IGNhbiBiZSBudWxsLlwiKTtcbiAgICB9XG4gIH0pO1xufVxuLyoqXG4gKiBUdXJucyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSBkaWZmZXJlbnQgcmVkdWNlciBmdW5jdGlvbnMsIGludG8gYSBzaW5nbGVcbiAqIHJlZHVjZXIgZnVuY3Rpb24uIEl0IHdpbGwgY2FsbCBldmVyeSBjaGlsZCByZWR1Y2VyLCBhbmQgZ2F0aGVyIHRoZWlyIHJlc3VsdHNcbiAqIGludG8gYSBzaW5nbGUgc3RhdGUgb2JqZWN0LCB3aG9zZSBrZXlzIGNvcnJlc3BvbmQgdG8gdGhlIGtleXMgb2YgdGhlIHBhc3NlZFxuICogcmVkdWNlciBmdW5jdGlvbnMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHJlZHVjZXJzIEFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgY29ycmVzcG9uZCB0byBkaWZmZXJlbnRcbiAqIHJlZHVjZXIgZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZSBjb21iaW5lZCBpbnRvIG9uZS4gT25lIGhhbmR5IHdheSB0byBvYnRhaW5cbiAqIGl0IGlzIHRvIHVzZSBFUzYgYGltcG9ydCAqIGFzIHJlZHVjZXJzYCBzeW50YXguIFRoZSByZWR1Y2VycyBtYXkgbmV2ZXIgcmV0dXJuXG4gKiB1bmRlZmluZWQgZm9yIGFueSBhY3Rpb24uIEluc3RlYWQsIHRoZXkgc2hvdWxkIHJldHVybiB0aGVpciBpbml0aWFsIHN0YXRlXG4gKiBpZiB0aGUgc3RhdGUgcGFzc2VkIHRvIHRoZW0gd2FzIHVuZGVmaW5lZCwgYW5kIHRoZSBjdXJyZW50IHN0YXRlIGZvciBhbnlcbiAqIHVucmVjb2duaXplZCBhY3Rpb24uXG4gKlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIHJlZHVjZXIgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGV2ZXJ5IHJlZHVjZXIgaW5zaWRlIHRoZVxuICogcGFzc2VkIG9iamVjdCwgYW5kIGJ1aWxkcyBhIHN0YXRlIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNoYXBlLlxuICovXG5cblxuZnVuY3Rpb24gY29tYmluZVJlZHVjZXJzKHJlZHVjZXJzKSB7XG4gIHZhciByZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKHJlZHVjZXJzKTtcbiAgdmFyIGZpbmFsUmVkdWNlcnMgPSB7fTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZHVjZXJLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IHJlZHVjZXJLZXlzW2ldO1xuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGlmICh0eXBlb2YgcmVkdWNlcnNba2V5XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgd2FybmluZyhcIk5vIHJlZHVjZXIgcHJvdmlkZWQgZm9yIGtleSBcXFwiXCIgKyBrZXkgKyBcIlxcXCJcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiByZWR1Y2Vyc1trZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmaW5hbFJlZHVjZXJzW2tleV0gPSByZWR1Y2Vyc1trZXldO1xuICAgIH1cbiAgfVxuXG4gIHZhciBmaW5hbFJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMoZmluYWxSZWR1Y2Vycyk7IC8vIFRoaXMgaXMgdXNlZCB0byBtYWtlIHN1cmUgd2UgZG9uJ3Qgd2FybiBhYm91dCB0aGUgc2FtZVxuICAvLyBrZXlzIG11bHRpcGxlIHRpbWVzLlxuXG4gIHZhciB1bmV4cGVjdGVkS2V5Q2FjaGU7XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICB1bmV4cGVjdGVkS2V5Q2FjaGUgPSB7fTtcbiAgfVxuXG4gIHZhciBzaGFwZUFzc2VydGlvbkVycm9yO1xuXG4gIHRyeSB7XG4gICAgYXNzZXJ0UmVkdWNlclNoYXBlKGZpbmFsUmVkdWNlcnMpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgc2hhcGVBc3NlcnRpb25FcnJvciA9IGU7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gY29tYmluYXRpb24oc3RhdGUsIGFjdGlvbikge1xuICAgIGlmIChzdGF0ZSA9PT0gdm9pZCAwKSB7XG4gICAgICBzdGF0ZSA9IHt9O1xuICAgIH1cblxuICAgIGlmIChzaGFwZUFzc2VydGlvbkVycm9yKSB7XG4gICAgICB0aHJvdyBzaGFwZUFzc2VydGlvbkVycm9yO1xuICAgIH1cblxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICB2YXIgd2FybmluZ01lc3NhZ2UgPSBnZXRVbmV4cGVjdGVkU3RhdGVTaGFwZVdhcm5pbmdNZXNzYWdlKHN0YXRlLCBmaW5hbFJlZHVjZXJzLCBhY3Rpb24sIHVuZXhwZWN0ZWRLZXlDYWNoZSk7XG5cbiAgICAgIGlmICh3YXJuaW5nTWVzc2FnZSkge1xuICAgICAgICB3YXJuaW5nKHdhcm5pbmdNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaGFzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHZhciBuZXh0U3RhdGUgPSB7fTtcblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBmaW5hbFJlZHVjZXJLZXlzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9rZXkgPSBmaW5hbFJlZHVjZXJLZXlzW19pXTtcbiAgICAgIHZhciByZWR1Y2VyID0gZmluYWxSZWR1Y2Vyc1tfa2V5XTtcbiAgICAgIHZhciBwcmV2aW91c1N0YXRlRm9yS2V5ID0gc3RhdGVbX2tleV07XG4gICAgICB2YXIgbmV4dFN0YXRlRm9yS2V5ID0gcmVkdWNlcihwcmV2aW91c1N0YXRlRm9yS2V5LCBhY3Rpb24pO1xuXG4gICAgICBpZiAodHlwZW9mIG5leHRTdGF0ZUZvcktleSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdmFyIGFjdGlvblR5cGUgPSBhY3Rpb24gJiYgYWN0aW9uLnR5cGU7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDE0KSA6IFwiV2hlbiBjYWxsZWQgd2l0aCBhbiBhY3Rpb24gb2YgdHlwZSBcIiArIChhY3Rpb25UeXBlID8gXCJcXFwiXCIgKyBTdHJpbmcoYWN0aW9uVHlwZSkgKyBcIlxcXCJcIiA6ICcodW5rbm93biB0eXBlKScpICsgXCIsIHRoZSBzbGljZSByZWR1Y2VyIGZvciBrZXkgXFxcIlwiICsgX2tleSArIFwiXFxcIiByZXR1cm5lZCB1bmRlZmluZWQuIFwiICsgXCJUbyBpZ25vcmUgYW4gYWN0aW9uLCB5b3UgbXVzdCBleHBsaWNpdGx5IHJldHVybiB0aGUgcHJldmlvdXMgc3RhdGUuIFwiICsgXCJJZiB5b3Ugd2FudCB0aGlzIHJlZHVjZXIgdG8gaG9sZCBubyB2YWx1ZSwgeW91IGNhbiByZXR1cm4gbnVsbCBpbnN0ZWFkIG9mIHVuZGVmaW5lZC5cIik7XG4gICAgICB9XG5cbiAgICAgIG5leHRTdGF0ZVtfa2V5XSA9IG5leHRTdGF0ZUZvcktleTtcbiAgICAgIGhhc0NoYW5nZWQgPSBoYXNDaGFuZ2VkIHx8IG5leHRTdGF0ZUZvcktleSAhPT0gcHJldmlvdXNTdGF0ZUZvcktleTtcbiAgICB9XG5cbiAgICBoYXNDaGFuZ2VkID0gaGFzQ2hhbmdlZCB8fCBmaW5hbFJlZHVjZXJLZXlzLmxlbmd0aCAhPT0gT2JqZWN0LmtleXMoc3RhdGUpLmxlbmd0aDtcbiAgICByZXR1cm4gaGFzQ2hhbmdlZCA/IG5leHRTdGF0ZSA6IHN0YXRlO1xuICB9O1xufVxuXG5mdW5jdGlvbiBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9yLCBkaXNwYXRjaCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkaXNwYXRjaChhY3Rpb25DcmVhdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuLyoqXG4gKiBUdXJucyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSBhY3Rpb24gY3JlYXRvcnMsIGludG8gYW4gb2JqZWN0IHdpdGggdGhlXG4gKiBzYW1lIGtleXMsIGJ1dCB3aXRoIGV2ZXJ5IGZ1bmN0aW9uIHdyYXBwZWQgaW50byBhIGBkaXNwYXRjaGAgY2FsbCBzbyB0aGV5XG4gKiBtYXkgYmUgaW52b2tlZCBkaXJlY3RseS4gVGhpcyBpcyBqdXN0IGEgY29udmVuaWVuY2UgbWV0aG9kLCBhcyB5b3UgY2FuIGNhbGxcbiAqIGBzdG9yZS5kaXNwYXRjaChNeUFjdGlvbkNyZWF0b3JzLmRvU29tZXRoaW5nKCkpYCB5b3Vyc2VsZiBqdXN0IGZpbmUuXG4gKlxuICogRm9yIGNvbnZlbmllbmNlLCB5b3UgY2FuIGFsc28gcGFzcyBhbiBhY3Rpb24gY3JlYXRvciBhcyB0aGUgZmlyc3QgYXJndW1lbnQsXG4gKiBhbmQgZ2V0IGEgZGlzcGF0Y2ggd3JhcHBlZCBmdW5jdGlvbiBpbiByZXR1cm4uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R9IGFjdGlvbkNyZWF0b3JzIEFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGFjdGlvblxuICogY3JlYXRvciBmdW5jdGlvbnMuIE9uZSBoYW5keSB3YXkgdG8gb2J0YWluIGl0IGlzIHRvIHVzZSBFUzYgYGltcG9ydCAqIGFzYFxuICogc3ludGF4LiBZb3UgbWF5IGFsc28gcGFzcyBhIHNpbmdsZSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBkaXNwYXRjaCBUaGUgYGRpc3BhdGNoYCBmdW5jdGlvbiBhdmFpbGFibGUgb24geW91ciBSZWR1eFxuICogc3RvcmUuXG4gKlxuICogQHJldHVybnMge0Z1bmN0aW9ufE9iamVjdH0gVGhlIG9iamVjdCBtaW1pY2tpbmcgdGhlIG9yaWdpbmFsIG9iamVjdCwgYnV0IHdpdGhcbiAqIGV2ZXJ5IGFjdGlvbiBjcmVhdG9yIHdyYXBwZWQgaW50byB0aGUgYGRpc3BhdGNoYCBjYWxsLiBJZiB5b3UgcGFzc2VkIGFcbiAqIGZ1bmN0aW9uIGFzIGBhY3Rpb25DcmVhdG9yc2AsIHRoZSByZXR1cm4gdmFsdWUgd2lsbCBhbHNvIGJlIGEgc2luZ2xlXG4gKiBmdW5jdGlvbi5cbiAqL1xuXG5cbmZ1bmN0aW9uIGJpbmRBY3Rpb25DcmVhdG9ycyhhY3Rpb25DcmVhdG9ycywgZGlzcGF0Y2gpIHtcbiAgaWYgKHR5cGVvZiBhY3Rpb25DcmVhdG9ycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9ycywgZGlzcGF0Y2gpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBhY3Rpb25DcmVhdG9ycyAhPT0gJ29iamVjdCcgfHwgYWN0aW9uQ3JlYXRvcnMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgxNikgOiBcImJpbmRBY3Rpb25DcmVhdG9ycyBleHBlY3RlZCBhbiBvYmplY3Qgb3IgYSBmdW5jdGlvbiwgYnV0IGluc3RlYWQgcmVjZWl2ZWQ6ICdcIiArIGtpbmRPZihhY3Rpb25DcmVhdG9ycykgKyBcIicuIFwiICsgXCJEaWQgeW91IHdyaXRlIFxcXCJpbXBvcnQgQWN0aW9uQ3JlYXRvcnMgZnJvbVxcXCIgaW5zdGVhZCBvZiBcXFwiaW1wb3J0ICogYXMgQWN0aW9uQ3JlYXRvcnMgZnJvbVxcXCI/XCIpO1xuICB9XG5cbiAgdmFyIGJvdW5kQWN0aW9uQ3JlYXRvcnMgPSB7fTtcblxuICBmb3IgKHZhciBrZXkgaW4gYWN0aW9uQ3JlYXRvcnMpIHtcbiAgICB2YXIgYWN0aW9uQ3JlYXRvciA9IGFjdGlvbkNyZWF0b3JzW2tleV07XG5cbiAgICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGJvdW5kQWN0aW9uQ3JlYXRvcnNba2V5XSA9IGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3IsIGRpc3BhdGNoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYm91bmRBY3Rpb25DcmVhdG9ycztcbn1cblxuLyoqXG4gKiBDb21wb3NlcyBzaW5nbGUtYXJndW1lbnQgZnVuY3Rpb25zIGZyb20gcmlnaHQgdG8gbGVmdC4gVGhlIHJpZ2h0bW9zdFxuICogZnVuY3Rpb24gY2FuIHRha2UgbXVsdGlwbGUgYXJndW1lbnRzIGFzIGl0IHByb3ZpZGVzIHRoZSBzaWduYXR1cmUgZm9yXG4gKiB0aGUgcmVzdWx0aW5nIGNvbXBvc2l0ZSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBmdW5jcyBUaGUgZnVuY3Rpb25zIHRvIGNvbXBvc2UuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgZnVuY3Rpb24gb2J0YWluZWQgYnkgY29tcG9zaW5nIHRoZSBhcmd1bWVudCBmdW5jdGlvbnNcbiAqIGZyb20gcmlnaHQgdG8gbGVmdC4gRm9yIGV4YW1wbGUsIGNvbXBvc2UoZiwgZywgaCkgaXMgaWRlbnRpY2FsIHRvIGRvaW5nXG4gKiAoLi4uYXJncykgPT4gZihnKGgoLi4uYXJncykpKS5cbiAqL1xuZnVuY3Rpb24gY29tcG9zZSgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGZ1bmNzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGZ1bmNzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICByZXR1cm4gYXJnO1xuICAgIH07XG4gIH1cblxuICBpZiAoZnVuY3MubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGZ1bmNzWzBdO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmNzLnJlZHVjZShmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gYShiLmFwcGx5KHZvaWQgMCwgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfSk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHN0b3JlIGVuaGFuY2VyIHRoYXQgYXBwbGllcyBtaWRkbGV3YXJlIHRvIHRoZSBkaXNwYXRjaCBtZXRob2RcbiAqIG9mIHRoZSBSZWR1eCBzdG9yZS4gVGhpcyBpcyBoYW5keSBmb3IgYSB2YXJpZXR5IG9mIHRhc2tzLCBzdWNoIGFzIGV4cHJlc3NpbmdcbiAqIGFzeW5jaHJvbm91cyBhY3Rpb25zIGluIGEgY29uY2lzZSBtYW5uZXIsIG9yIGxvZ2dpbmcgZXZlcnkgYWN0aW9uIHBheWxvYWQuXG4gKlxuICogU2VlIGByZWR1eC10aHVua2AgcGFja2FnZSBhcyBhbiBleGFtcGxlIG9mIHRoZSBSZWR1eCBtaWRkbGV3YXJlLlxuICpcbiAqIEJlY2F1c2UgbWlkZGxld2FyZSBpcyBwb3RlbnRpYWxseSBhc3luY2hyb25vdXMsIHRoaXMgc2hvdWxkIGJlIHRoZSBmaXJzdFxuICogc3RvcmUgZW5oYW5jZXIgaW4gdGhlIGNvbXBvc2l0aW9uIGNoYWluLlxuICpcbiAqIE5vdGUgdGhhdCBlYWNoIG1pZGRsZXdhcmUgd2lsbCBiZSBnaXZlbiB0aGUgYGRpc3BhdGNoYCBhbmQgYGdldFN0YXRlYCBmdW5jdGlvbnNcbiAqIGFzIG5hbWVkIGFyZ3VtZW50cy5cbiAqXG4gKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBtaWRkbGV3YXJlcyBUaGUgbWlkZGxld2FyZSBjaGFpbiB0byBiZSBhcHBsaWVkLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIHN0b3JlIGVuaGFuY2VyIGFwcGx5aW5nIHRoZSBtaWRkbGV3YXJlLlxuICovXG5cbmZ1bmN0aW9uIGFwcGx5TWlkZGxld2FyZSgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIG1pZGRsZXdhcmVzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIG1pZGRsZXdhcmVzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjcmVhdGVTdG9yZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc3RvcmUgPSBjcmVhdGVTdG9yZS5hcHBseSh2b2lkIDAsIGFyZ3VtZW50cyk7XG5cbiAgICAgIHZhciBfZGlzcGF0Y2ggPSBmdW5jdGlvbiBkaXNwYXRjaCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoMTUpIDogJ0Rpc3BhdGNoaW5nIHdoaWxlIGNvbnN0cnVjdGluZyB5b3VyIG1pZGRsZXdhcmUgaXMgbm90IGFsbG93ZWQuICcgKyAnT3RoZXIgbWlkZGxld2FyZSB3b3VsZCBub3QgYmUgYXBwbGllZCB0byB0aGlzIGRpc3BhdGNoLicpO1xuICAgICAgfTtcblxuICAgICAgdmFyIG1pZGRsZXdhcmVBUEkgPSB7XG4gICAgICAgIGdldFN0YXRlOiBzdG9yZS5nZXRTdGF0ZSxcbiAgICAgICAgZGlzcGF0Y2g6IGZ1bmN0aW9uIGRpc3BhdGNoKCkge1xuICAgICAgICAgIHJldHVybiBfZGlzcGF0Y2guYXBwbHkodm9pZCAwLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdmFyIGNoYWluID0gbWlkZGxld2FyZXMubWFwKGZ1bmN0aW9uIChtaWRkbGV3YXJlKSB7XG4gICAgICAgIHJldHVybiBtaWRkbGV3YXJlKG1pZGRsZXdhcmVBUEkpO1xuICAgICAgfSk7XG4gICAgICBfZGlzcGF0Y2ggPSBjb21wb3NlLmFwcGx5KHZvaWQgMCwgY2hhaW4pKHN0b3JlLmRpc3BhdGNoKTtcbiAgICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHN0b3JlKSwge30sIHtcbiAgICAgICAgZGlzcGF0Y2g6IF9kaXNwYXRjaFxuICAgICAgfSk7XG4gICAgfTtcbiAgfTtcbn1cblxuZXhwb3J0IHsgQWN0aW9uVHlwZXMgYXMgX19ET19OT1RfVVNFX19BY3Rpb25UeXBlcywgYXBwbHlNaWRkbGV3YXJlLCBiaW5kQWN0aW9uQ3JlYXRvcnMsIGNvbWJpbmVSZWR1Y2VycywgY29tcG9zZSwgY3JlYXRlU3RvcmUsIGxlZ2FjeV9jcmVhdGVTdG9yZSB9O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9