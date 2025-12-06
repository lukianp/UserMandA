"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7486],{

/***/ 4768:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  CF: () => (/* binding */ autoBatchEnhancer),
  HY: () => (/* reexport */ combineReducers),
  U1: () => (/* binding */ configureStore),
  VP: () => (/* binding */ createAction),
  Nc: () => (/* binding */ createListenerMiddleware),
  Z0: () => (/* binding */ createSlice),
  ss: () => (/* reexport */ immer/* current */.ss),
  aA: () => (/* binding */ prepareAutoBatched)
});

// UNUSED EXPORTS: ReducerType, SHOULD_AUTOBATCH, TaskAbortError, Tuple, __DO_NOT_USE__ActionTypes, addListener, applyMiddleware, asyncThunkCreator, bindActionCreators, buildCreateSlice, clearAllListeners, combineSlices, compose, createActionCreatorInvariantMiddleware, createAsyncThunk, createDraftSafeSelector, createDraftSafeSelectorCreator, createDynamicMiddleware, createEntityAdapter, createImmutableStateInvariantMiddleware, createNextState, createReducer, createSelector, createSelectorCreator, createSerializableStateInvariantMiddleware, createStore, findNonSerializableValue, formatProdErrorMessage, freeze, isAction, isActionCreator, isAllOf, isAnyOf, isAsyncThunkAction, isDraft, isFluxStandardAction, isFulfilled, isImmutableDefault, isPending, isPlain, isPlainObject, isRejected, isRejectedWithValue, legacy_createStore, lruMemoize, miniSerializeError, nanoid, original, removeListener, unwrapResult, weakMapMemoize

;// ./node_modules/recharts/node_modules/redux/dist/redux.mjs
// src/utils/formatProdErrorMessage.ts
function formatProdErrorMessage(code) {
  return `Minified Redux error #${code}; visit https://redux.js.org/Errors?code=${code} for the full message or use the non-minified dev environment for full errors. `;
}

// src/utils/symbol-observable.ts
var $$observable = /* @__PURE__ */ (() => typeof Symbol === "function" && Symbol.observable || "@@observable")();
var symbol_observable_default = $$observable;

// src/utils/actionTypes.ts
var randomString = () => Math.random().toString(36).substring(7).split("").join(".");
var ActionTypes = {
  INIT: `@@redux/INIT${/* @__PURE__ */ randomString()}`,
  REPLACE: `@@redux/REPLACE${/* @__PURE__ */ randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
};
var actionTypes_default = ActionTypes;

// src/utils/isPlainObject.ts
function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null)
    return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto || Object.getPrototypeOf(obj) === null;
}

// src/utils/kindOf.ts
function miniKindOf(val) {
  if (val === void 0)
    return "undefined";
  if (val === null)
    return "null";
  const type = typeof val;
  switch (type) {
    case "boolean":
    case "string":
    case "number":
    case "symbol":
    case "function": {
      return type;
    }
  }
  if (Array.isArray(val))
    return "array";
  if (isDate(val))
    return "date";
  if (isError(val))
    return "error";
  const constructorName = ctorName(val);
  switch (constructorName) {
    case "Symbol":
    case "Promise":
    case "WeakMap":
    case "WeakSet":
    case "Map":
    case "Set":
      return constructorName;
  }
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase().replace(/\s/g, "");
}
function ctorName(val) {
  return typeof val.constructor === "function" ? val.constructor.name : null;
}
function isError(val) {
  return val instanceof Error || typeof val.message === "string" && val.constructor && typeof val.constructor.stackTraceLimit === "number";
}
function isDate(val) {
  if (val instanceof Date)
    return true;
  return typeof val.toDateString === "function" && typeof val.getDate === "function" && typeof val.setDate === "function";
}
function kindOf(val) {
  let typeOfVal = typeof val;
  if (true) {
    typeOfVal = miniKindOf(val);
  }
  return typeOfVal;
}

// src/createStore.ts
function createStore(reducer, preloadedState, enhancer) {
  if (typeof reducer !== "function") {
    throw new Error( false ? 0 : `Expected the root reducer to be a function. Instead, received: '${kindOf(reducer)}'`);
  }
  if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function" && typeof arguments[3] === "function") {
    throw new Error( false ? 0 : "It looks like you are passing several store enhancers to createStore(). This is not supported. Instead, compose them together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.");
  }
  if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
    enhancer = preloadedState;
    preloadedState = void 0;
  }
  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error( false ? 0 : `Expected the enhancer to be a function. Instead, received: '${kindOf(enhancer)}'`);
    }
    return enhancer(createStore)(reducer, preloadedState);
  }
  let currentReducer = reducer;
  let currentState = preloadedState;
  let currentListeners = /* @__PURE__ */ new Map();
  let nextListeners = currentListeners;
  let listenerIdCounter = 0;
  let isDispatching = false;
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = /* @__PURE__ */ new Map();
      currentListeners.forEach((listener, key) => {
        nextListeners.set(key, listener);
      });
    }
  }
  function getState() {
    if (isDispatching) {
      throw new Error( false ? 0 : "You may not call store.getState() while the reducer is executing. The reducer has already received the state as an argument. Pass it down from the top reducer instead of reading it from the store.");
    }
    return currentState;
  }
  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error( false ? 0 : `Expected the listener to be a function. Instead, received: '${kindOf(listener)}'`);
    }
    if (isDispatching) {
      throw new Error( false ? 0 : "You may not call store.subscribe() while the reducer is executing. If you would like to be notified after the store has been updated, subscribe from a component and invoke store.getState() in the callback to access the latest state. See https://redux.js.org/api/store#subscribelistener for more details.");
    }
    let isSubscribed = true;
    ensureCanMutateNextListeners();
    const listenerId = listenerIdCounter++;
    nextListeners.set(listenerId, listener);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }
      if (isDispatching) {
        throw new Error( false ? 0 : "You may not unsubscribe from a store listener while the reducer is executing. See https://redux.js.org/api/store#subscribelistener for more details.");
      }
      isSubscribed = false;
      ensureCanMutateNextListeners();
      nextListeners.delete(listenerId);
      currentListeners = null;
    };
  }
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error( false ? 0 : `Actions must be plain objects. Instead, the actual type was: '${kindOf(action)}'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.`);
    }
    if (typeof action.type === "undefined") {
      throw new Error( false ? 0 : 'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.');
    }
    if (typeof action.type !== "string") {
      throw new Error( false ? 0 : `Action "type" property must be a string. Instead, the actual type was: '${kindOf(action.type)}'. Value was: '${action.type}' (stringified)`);
    }
    if (isDispatching) {
      throw new Error( false ? 0 : "Reducers may not dispatch actions.");
    }
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }
    const listeners = currentListeners = nextListeners;
    listeners.forEach((listener) => {
      listener();
    });
    return action;
  }
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== "function") {
      throw new Error( false ? 0 : `Expected the nextReducer to be a function. Instead, received: '${kindOf(nextReducer)}`);
    }
    currentReducer = nextReducer;
    dispatch({
      type: actionTypes_default.REPLACE
    });
  }
  function observable() {
    const outerSubscribe = subscribe;
    return {
      /**
       * The minimal observable subscription method.
       * @param observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer) {
        if (typeof observer !== "object" || observer === null) {
          throw new Error( false ? 0 : `Expected the observer to be an object. Instead, received: '${kindOf(observer)}'`);
        }
        function observeState() {
          const observerAsObserver = observer;
          if (observerAsObserver.next) {
            observerAsObserver.next(getState());
          }
        }
        observeState();
        const unsubscribe = outerSubscribe(observeState);
        return {
          unsubscribe
        };
      },
      [symbol_observable_default]() {
        return this;
      }
    };
  }
  dispatch({
    type: actionTypes_default.INIT
  });
  const store = {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [symbol_observable_default]: observable
  };
  return store;
}
function legacy_createStore(reducer, preloadedState, enhancer) {
  return createStore(reducer, preloadedState, enhancer);
}

// src/utils/warning.ts
function warning(message) {
  if (typeof console !== "undefined" && typeof console.error === "function") {
    console.error(message);
  }
  try {
    throw new Error(message);
  } catch (e) {
  }
}

// src/combineReducers.ts
function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  const reducerKeys = Object.keys(reducers);
  const argumentName = action && action.type === actionTypes_default.INIT ? "preloadedState argument passed to createStore" : "previous state received by the reducer";
  if (reducerKeys.length === 0) {
    return "Store does not have a valid reducer. Make sure the argument passed to combineReducers is an object whose values are reducers.";
  }
  if (!isPlainObject(inputState)) {
    return `The ${argumentName} has unexpected type of "${kindOf(inputState)}". Expected argument to be an object with the following keys: "${reducerKeys.join('", "')}"`;
  }
  const unexpectedKeys = Object.keys(inputState).filter((key) => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]);
  unexpectedKeys.forEach((key) => {
    unexpectedKeyCache[key] = true;
  });
  if (action && action.type === actionTypes_default.REPLACE)
    return;
  if (unexpectedKeys.length > 0) {
    return `Unexpected ${unexpectedKeys.length > 1 ? "keys" : "key"} "${unexpectedKeys.join('", "')}" found in ${argumentName}. Expected to find one of the known reducer keys instead: "${reducerKeys.join('", "')}". Unexpected keys will be ignored.`;
  }
}
function assertReducerShape(reducers) {
  Object.keys(reducers).forEach((key) => {
    const reducer = reducers[key];
    const initialState = reducer(void 0, {
      type: actionTypes_default.INIT
    });
    if (typeof initialState === "undefined") {
      throw new Error( false ? 0 : `The slice reducer for key "${key}" returned undefined during initialization. If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined. If you don't want to set a value for this reducer, you can use null instead of undefined.`);
    }
    if (typeof reducer(void 0, {
      type: actionTypes_default.PROBE_UNKNOWN_ACTION()
    }) === "undefined") {
      throw new Error( false ? 0 : `The slice reducer for key "${key}" returned undefined when probed with a random type. Don't try to handle '${actionTypes_default.INIT}' or other actions in "redux/*" namespace. They are considered private. Instead, you must return the current state for any unknown actions, unless it is undefined, in which case you must return the initial state, regardless of the action type. The initial state may not be undefined, but can be null.`);
    }
  });
}
function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    if (true) {
      if (typeof reducers[key] === "undefined") {
        warning(`No reducer provided for key "${key}"`);
      }
    }
    if (typeof reducers[key] === "function") {
      finalReducers[key] = reducers[key];
    }
  }
  const finalReducerKeys = Object.keys(finalReducers);
  let unexpectedKeyCache;
  if (true) {
    unexpectedKeyCache = {};
  }
  let shapeAssertionError;
  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }
  return function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError;
    }
    if (true) {
      const warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
      if (warningMessage) {
        warning(warningMessage);
      }
    }
    let hasChanged = false;
    const nextState = {};
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === "undefined") {
        const actionType = action && action.type;
        throw new Error( false ? 0 : `When called with an action of type ${actionType ? `"${String(actionType)}"` : "(unknown type)"}, the slice reducer for key "${key}" returned undefined. To ignore an action, you must explicitly return the previous state. If you want this reducer to hold no value, you can return null instead of undefined.`);
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  };
}

// src/bindActionCreators.ts
function bindActionCreator(actionCreator, dispatch) {
  return function(...args) {
    return dispatch(actionCreator.apply(this, args));
  };
}
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === "function") {
    return bindActionCreator(actionCreators, dispatch);
  }
  if (typeof actionCreators !== "object" || actionCreators === null) {
    throw new Error( false ? 0 : `bindActionCreators expected an object or a function, but instead received: '${kindOf(actionCreators)}'. Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`);
  }
  const boundActionCreators = {};
  for (const key in actionCreators) {
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === "function") {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}

// src/compose.ts
function compose(...funcs) {
  if (funcs.length === 0) {
    return (arg) => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

// src/applyMiddleware.ts
function applyMiddleware(...middlewares) {
  return (createStore2) => (reducer, preloadedState) => {
    const store = createStore2(reducer, preloadedState);
    let dispatch = () => {
      throw new Error( false ? 0 : "Dispatching while constructing your middleware is not allowed. Other middleware would not be applied to this dispatch.");
    };
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args)
    };
    const chain = middlewares.map((middleware) => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);
    return {
      ...store,
      dispatch
    };
  };
}

// src/utils/isAction.ts
function redux_isAction(action) {
  return isPlainObject(action) && "type" in action && typeof action.type === "string";
}

//# sourceMappingURL=redux.mjs.map
// EXTERNAL MODULE: ./node_modules/immer/dist/immer.mjs
var immer = __webpack_require__(1932);
// EXTERNAL MODULE: ./node_modules/reselect/dist/reselect.mjs
var reselect = __webpack_require__(25508);
;// ./node_modules/recharts/node_modules/redux-thunk/dist/redux-thunk.mjs
// src/index.ts
function createThunkMiddleware(extraArgument) {
  const middleware = ({ dispatch, getState }) => (next) => (action) => {
    if (typeof action === "function") {
      return action(dispatch, getState, extraArgument);
    }
    return next(action);
  };
  return middleware;
}
var redux_thunk_thunk = createThunkMiddleware();
var withExtraArgument = createThunkMiddleware;


;// ./node_modules/recharts/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs
/* provided dependency */ var process = __webpack_require__(71926);
// src/index.ts




// src/createDraftSafeSelector.ts


var createDraftSafeSelectorCreator = (...args) => {
  const createSelector2 = createSelectorCreator(...args);
  const createDraftSafeSelector2 = Object.assign((...args2) => {
    const selector = createSelector2(...args2);
    const wrappedSelector = (value, ...rest) => selector(isDraft(value) ? current(value) : value, ...rest);
    Object.assign(wrappedSelector, selector);
    return wrappedSelector;
  }, {
    withTypes: () => createDraftSafeSelector2
  });
  return createDraftSafeSelector2;
};
var createDraftSafeSelector = /* @__PURE__ */ (/* unused pure expression or super */ null && (createDraftSafeSelectorCreator(weakMapMemoize)));

// src/configureStore.ts


// src/devtoolsExtension.ts

var composeWithDevTools = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : function() {
  if (arguments.length === 0) return void 0;
  if (typeof arguments[0] === "object") return compose;
  return compose.apply(null, arguments);
};
var devToolsEnhancer = typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__ : function() {
  return function(noop3) {
    return noop3;
  };
};

// src/getDefaultMiddleware.ts


// src/createAction.ts


// src/tsHelpers.ts
var hasMatchFunction = (v) => {
  return v && typeof v.match === "function";
};

// src/createAction.ts
function createAction(type, prepareAction) {
  function actionCreator(...args) {
    if (prepareAction) {
      let prepared = prepareAction(...args);
      if (!prepared) {
        throw new Error( false ? 0 : "prepareAction did not return an object");
      }
      return {
        type,
        payload: prepared.payload,
        ..."meta" in prepared && {
          meta: prepared.meta
        },
        ..."error" in prepared && {
          error: prepared.error
        }
      };
    }
    return {
      type,
      payload: args[0]
    };
  }
  actionCreator.toString = () => `${type}`;
  actionCreator.type = type;
  actionCreator.match = (action) => redux_isAction(action) && action.type === type;
  return actionCreator;
}
function isActionCreator(action) {
  return typeof action === "function" && "type" in action && // hasMatchFunction only wants Matchers but I don't see the point in rewriting it
  hasMatchFunction(action);
}
function isFSA(action) {
  return isAction(action) && Object.keys(action).every(isValidKey);
}
function isValidKey(key) {
  return ["type", "payload", "error", "meta"].indexOf(key) > -1;
}

// src/actionCreatorInvariantMiddleware.ts
function getMessage(type) {
  const splitType = type ? `${type}`.split("/") : [];
  const actionName = splitType[splitType.length - 1] || "actionCreator";
  return `Detected an action creator with type "${type || "unknown"}" being dispatched. 
Make sure you're calling the action creator before dispatching, i.e. \`dispatch(${actionName}())\` instead of \`dispatch(${actionName})\`. This is necessary even if the action has no payload.`;
}
function createActionCreatorInvariantMiddleware(options = {}) {
  if (false) // removed by dead control flow
{}
  const {
    isActionCreator: isActionCreator2 = isActionCreator
  } = options;
  return () => (next) => (action) => {
    if (isActionCreator2(action)) {
      console.warn(getMessage(action.type));
    }
    return next(action);
  };
}

// src/utils.ts

function getTimeMeasureUtils(maxDelay, fnName) {
  let elapsed = 0;
  return {
    measureTime(fn) {
      const started = Date.now();
      try {
        return fn();
      } finally {
        const finished = Date.now();
        elapsed += finished - started;
      }
    },
    warnIfExceeded() {
      if (elapsed > maxDelay) {
        console.warn(`${fnName} took ${elapsed}ms, which is more than the warning threshold of ${maxDelay}ms. 
If your state or actions are very large, you may want to disable the middleware as it might cause too much of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
It is disabled in production builds, so you don't need to worry about that.`);
      }
    }
  };
}
var Tuple = class _Tuple extends Array {
  constructor(...items) {
    super(...items);
    Object.setPrototypeOf(this, _Tuple.prototype);
  }
  static get [Symbol.species]() {
    return _Tuple;
  }
  concat(...arr) {
    return super.concat.apply(this, arr);
  }
  prepend(...arr) {
    if (arr.length === 1 && Array.isArray(arr[0])) {
      return new _Tuple(...arr[0].concat(this));
    }
    return new _Tuple(...arr.concat(this));
  }
};
function freezeDraftable(val) {
  return (0,immer/* isDraftable */.a6)(val) ? (0,immer/* produce */.jM)(val, () => {
  }) : val;
}
function getOrInsertComputed(map, key, compute) {
  if (map.has(key)) return map.get(key);
  return map.set(key, compute(key)).get(key);
}

// src/immutableStateInvariantMiddleware.ts
function isImmutableDefault(value) {
  return typeof value !== "object" || value == null || Object.isFrozen(value);
}
function trackForMutations(isImmutable, ignorePaths, obj) {
  const trackedProperties = trackProperties(isImmutable, ignorePaths, obj);
  return {
    detectMutations() {
      return detectMutations(isImmutable, ignorePaths, trackedProperties, obj);
    }
  };
}
function trackProperties(isImmutable, ignorePaths = [], obj, path = "", checkedObjects = /* @__PURE__ */ new Set()) {
  const tracked = {
    value: obj
  };
  if (!isImmutable(obj) && !checkedObjects.has(obj)) {
    checkedObjects.add(obj);
    tracked.children = {};
    for (const key in obj) {
      const childPath = path ? path + "." + key : key;
      if (ignorePaths.length && ignorePaths.indexOf(childPath) !== -1) {
        continue;
      }
      tracked.children[key] = trackProperties(isImmutable, ignorePaths, obj[key], childPath);
    }
  }
  return tracked;
}
function detectMutations(isImmutable, ignoredPaths = [], trackedProperty, obj, sameParentRef = false, path = "") {
  const prevObj = trackedProperty ? trackedProperty.value : void 0;
  const sameRef = prevObj === obj;
  if (sameParentRef && !sameRef && !Number.isNaN(obj)) {
    return {
      wasMutated: true,
      path
    };
  }
  if (isImmutable(prevObj) || isImmutable(obj)) {
    return {
      wasMutated: false
    };
  }
  const keysToDetect = {};
  for (let key in trackedProperty.children) {
    keysToDetect[key] = true;
  }
  for (let key in obj) {
    keysToDetect[key] = true;
  }
  const hasIgnoredPaths = ignoredPaths.length > 0;
  for (let key in keysToDetect) {
    const nestedPath = path ? path + "." + key : key;
    if (hasIgnoredPaths) {
      const hasMatches = ignoredPaths.some((ignored) => {
        if (ignored instanceof RegExp) {
          return ignored.test(nestedPath);
        }
        return nestedPath === ignored;
      });
      if (hasMatches) {
        continue;
      }
    }
    const result = detectMutations(isImmutable, ignoredPaths, trackedProperty.children[key], obj[key], sameRef, nestedPath);
    if (result.wasMutated) {
      return result;
    }
  }
  return {
    wasMutated: false
  };
}
function createImmutableStateInvariantMiddleware(options = {}) {
  if (false) // removed by dead control flow
{} else {
    let stringify2 = function(obj, serializer, indent, decycler) {
      return JSON.stringify(obj, getSerialize2(serializer, decycler), indent);
    }, getSerialize2 = function(serializer, decycler) {
      let stack = [], keys = [];
      if (!decycler) decycler = function(_, value) {
        if (stack[0] === value) return "[Circular ~]";
        return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
      };
      return function(key, value) {
        if (stack.length > 0) {
          var thisPos = stack.indexOf(this);
          ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
          ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
          if (~stack.indexOf(value)) value = decycler.call(this, key, value);
        } else stack.push(value);
        return serializer == null ? value : serializer.call(this, key, value);
      };
    };
    var stringify = stringify2, getSerialize = getSerialize2;
    let {
      isImmutable = isImmutableDefault,
      ignoredPaths,
      warnAfter = 32
    } = options;
    const track = trackForMutations.bind(null, isImmutable, ignoredPaths);
    return ({
      getState
    }) => {
      let state = getState();
      let tracker = track(state);
      let result;
      return (next) => (action) => {
        const measureUtils = getTimeMeasureUtils(warnAfter, "ImmutableStateInvariantMiddleware");
        measureUtils.measureTime(() => {
          state = getState();
          result = tracker.detectMutations();
          tracker = track(state);
          if (result.wasMutated) {
            throw new Error( false ? 0 : `A state mutation was detected between dispatches, in the path '${result.path || ""}'.  This may cause incorrect behavior. (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)`);
          }
        });
        const dispatchedAction = next(action);
        measureUtils.measureTime(() => {
          state = getState();
          result = tracker.detectMutations();
          tracker = track(state);
          if (result.wasMutated) {
            throw new Error( false ? 0 : `A state mutation was detected inside a dispatch, in the path: ${result.path || ""}. Take a look at the reducer(s) handling the action ${stringify2(action)}. (https://redux.js.org/style-guide/style-guide#do-not-mutate-state)`);
          }
        });
        measureUtils.warnIfExceeded();
        return dispatchedAction;
      };
    };
  }
}

// src/serializableStateInvariantMiddleware.ts

function isPlain(val) {
  const type = typeof val;
  return val == null || type === "string" || type === "boolean" || type === "number" || Array.isArray(val) || isPlainObject(val);
}
function findNonSerializableValue(value, path = "", isSerializable = isPlain, getEntries, ignoredPaths = [], cache) {
  let foundNestedSerializable;
  if (!isSerializable(value)) {
    return {
      keyPath: path || "<root>",
      value
    };
  }
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (cache?.has(value)) return false;
  const entries = getEntries != null ? getEntries(value) : Object.entries(value);
  const hasIgnoredPaths = ignoredPaths.length > 0;
  for (const [key, nestedValue] of entries) {
    const nestedPath = path ? path + "." + key : key;
    if (hasIgnoredPaths) {
      const hasMatches = ignoredPaths.some((ignored) => {
        if (ignored instanceof RegExp) {
          return ignored.test(nestedPath);
        }
        return nestedPath === ignored;
      });
      if (hasMatches) {
        continue;
      }
    }
    if (!isSerializable(nestedValue)) {
      return {
        keyPath: nestedPath,
        value: nestedValue
      };
    }
    if (typeof nestedValue === "object") {
      foundNestedSerializable = findNonSerializableValue(nestedValue, nestedPath, isSerializable, getEntries, ignoredPaths, cache);
      if (foundNestedSerializable) {
        return foundNestedSerializable;
      }
    }
  }
  if (cache && isNestedFrozen(value)) cache.add(value);
  return false;
}
function isNestedFrozen(value) {
  if (!Object.isFrozen(value)) return false;
  for (const nestedValue of Object.values(value)) {
    if (typeof nestedValue !== "object" || nestedValue === null) continue;
    if (!isNestedFrozen(nestedValue)) return false;
  }
  return true;
}
function createSerializableStateInvariantMiddleware(options = {}) {
  if (false) // removed by dead control flow
{} else {
    const {
      isSerializable = isPlain,
      getEntries,
      ignoredActions = [],
      ignoredActionPaths = ["meta.arg", "meta.baseQueryMeta"],
      ignoredPaths = [],
      warnAfter = 32,
      ignoreState = false,
      ignoreActions = false,
      disableCache = false
    } = options;
    const cache = !disableCache && WeakSet ? /* @__PURE__ */ new WeakSet() : void 0;
    return (storeAPI) => (next) => (action) => {
      if (!redux_isAction(action)) {
        return next(action);
      }
      const result = next(action);
      const measureUtils = getTimeMeasureUtils(warnAfter, "SerializableStateInvariantMiddleware");
      if (!ignoreActions && !(ignoredActions.length && ignoredActions.indexOf(action.type) !== -1)) {
        measureUtils.measureTime(() => {
          const foundActionNonSerializableValue = findNonSerializableValue(action, "", isSerializable, getEntries, ignoredActionPaths, cache);
          if (foundActionNonSerializableValue) {
            const {
              keyPath,
              value
            } = foundActionNonSerializableValue;
            console.error(`A non-serializable value was detected in an action, in the path: \`${keyPath}\`. Value:`, value, "\nTake a look at the logic that dispatched this action: ", action, "\n(See https://redux.js.org/faq/actions#why-should-type-be-a-string-or-at-least-serializable-why-should-my-action-types-be-constants)", "\n(To allow non-serializable values see: https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data)");
          }
        });
      }
      if (!ignoreState) {
        measureUtils.measureTime(() => {
          const state = storeAPI.getState();
          const foundStateNonSerializableValue = findNonSerializableValue(state, "", isSerializable, getEntries, ignoredPaths, cache);
          if (foundStateNonSerializableValue) {
            const {
              keyPath,
              value
            } = foundStateNonSerializableValue;
            console.error(`A non-serializable value was detected in the state, in the path: \`${keyPath}\`. Value:`, value, `
Take a look at the reducer(s) handling this action type: ${action.type}.
(See https://redux.js.org/faq/organizing-state#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)`);
          }
        });
        measureUtils.warnIfExceeded();
      }
      return result;
    };
  }
}

// src/getDefaultMiddleware.ts
function isBoolean(x) {
  return typeof x === "boolean";
}
var buildGetDefaultMiddleware = () => function getDefaultMiddleware(options) {
  const {
    thunk = true,
    immutableCheck = true,
    serializableCheck = true,
    actionCreatorCheck = true
  } = options ?? {};
  let middlewareArray = new Tuple();
  if (thunk) {
    if (isBoolean(thunk)) {
      middlewareArray.push(redux_thunk_thunk);
    } else {
      middlewareArray.push(withExtraArgument(thunk.extraArgument));
    }
  }
  if (true) {
    if (immutableCheck) {
      let immutableOptions = {};
      if (!isBoolean(immutableCheck)) {
        immutableOptions = immutableCheck;
      }
      middlewareArray.unshift(createImmutableStateInvariantMiddleware(immutableOptions));
    }
    if (serializableCheck) {
      let serializableOptions = {};
      if (!isBoolean(serializableCheck)) {
        serializableOptions = serializableCheck;
      }
      middlewareArray.push(createSerializableStateInvariantMiddleware(serializableOptions));
    }
    if (actionCreatorCheck) {
      let actionCreatorOptions = {};
      if (!isBoolean(actionCreatorCheck)) {
        actionCreatorOptions = actionCreatorCheck;
      }
      middlewareArray.unshift(createActionCreatorInvariantMiddleware(actionCreatorOptions));
    }
  }
  return middlewareArray;
};

// src/autoBatchEnhancer.ts
var SHOULD_AUTOBATCH = "RTK_autoBatch";
var prepareAutoBatched = () => (payload) => ({
  payload,
  meta: {
    [SHOULD_AUTOBATCH]: true
  }
});
var createQueueWithTimer = (timeout) => {
  return (notify) => {
    setTimeout(notify, timeout);
  };
};
var autoBatchEnhancer = (options = {
  type: "raf"
}) => (next) => (...args) => {
  const store = next(...args);
  let notifying = true;
  let shouldNotifyAtEndOfTick = false;
  let notificationQueued = false;
  const listeners = /* @__PURE__ */ new Set();
  const queueCallback = options.type === "tick" ? queueMicrotask : options.type === "raf" ? (
    // requestAnimationFrame won't exist in SSR environments. Fall back to a vague approximation just to keep from erroring.
    typeof window !== "undefined" && window.requestAnimationFrame ? window.requestAnimationFrame : createQueueWithTimer(10)
  ) : options.type === "callback" ? options.queueNotification : createQueueWithTimer(options.timeout);
  const notifyListeners = () => {
    notificationQueued = false;
    if (shouldNotifyAtEndOfTick) {
      shouldNotifyAtEndOfTick = false;
      listeners.forEach((l) => l());
    }
  };
  return Object.assign({}, store, {
    // Override the base `store.subscribe` method to keep original listeners
    // from running if we're delaying notifications
    subscribe(listener2) {
      const wrappedListener = () => notifying && listener2();
      const unsubscribe = store.subscribe(wrappedListener);
      listeners.add(listener2);
      return () => {
        unsubscribe();
        listeners.delete(listener2);
      };
    },
    // Override the base `store.dispatch` method so that we can check actions
    // for the `shouldAutoBatch` flag and determine if batching is active
    dispatch(action) {
      try {
        notifying = !action?.meta?.[SHOULD_AUTOBATCH];
        shouldNotifyAtEndOfTick = !notifying;
        if (shouldNotifyAtEndOfTick) {
          if (!notificationQueued) {
            notificationQueued = true;
            queueCallback(notifyListeners);
          }
        }
        return store.dispatch(action);
      } finally {
        notifying = true;
      }
    }
  });
};

// src/getDefaultEnhancers.ts
var buildGetDefaultEnhancers = (middlewareEnhancer) => function getDefaultEnhancers(options) {
  const {
    autoBatch = true
  } = options ?? {};
  let enhancerArray = new Tuple(middlewareEnhancer);
  if (autoBatch) {
    enhancerArray.push(autoBatchEnhancer(typeof autoBatch === "object" ? autoBatch : void 0));
  }
  return enhancerArray;
};

// src/configureStore.ts
function configureStore(options) {
  const getDefaultMiddleware = buildGetDefaultMiddleware();
  const {
    reducer = void 0,
    middleware,
    devTools = true,
    duplicateMiddlewareCheck = true,
    preloadedState = void 0,
    enhancers = void 0
  } = options || {};
  let rootReducer;
  if (typeof reducer === "function") {
    rootReducer = reducer;
  } else if (isPlainObject(reducer)) {
    rootReducer = combineReducers(reducer);
  } else {
    throw new Error( false ? 0 : "`reducer` is a required argument, and must be a function or an object of functions that can be passed to combineReducers");
  }
  if ( true && middleware && typeof middleware !== "function") {
    throw new Error( false ? 0 : "`middleware` field must be a callback");
  }
  let finalMiddleware;
  if (typeof middleware === "function") {
    finalMiddleware = middleware(getDefaultMiddleware);
    if ( true && !Array.isArray(finalMiddleware)) {
      throw new Error( false ? 0 : "when using a middleware builder function, an array of middleware must be returned");
    }
  } else {
    finalMiddleware = getDefaultMiddleware();
  }
  if ( true && finalMiddleware.some((item) => typeof item !== "function")) {
    throw new Error( false ? 0 : "each middleware provided to configureStore must be a function");
  }
  if ( true && duplicateMiddlewareCheck) {
    let middlewareReferences = /* @__PURE__ */ new Set();
    finalMiddleware.forEach((middleware2) => {
      if (middlewareReferences.has(middleware2)) {
        throw new Error( false ? 0 : "Duplicate middleware references found when creating the store. Ensure that each middleware is only included once.");
      }
      middlewareReferences.add(middleware2);
    });
  }
  let finalCompose = compose;
  if (devTools) {
    finalCompose = composeWithDevTools({
      // Enable capture of stack traces for dispatched Redux actions
      trace: "development" !== "production",
      ...typeof devTools === "object" && devTools
    });
  }
  const middlewareEnhancer = applyMiddleware(...finalMiddleware);
  const getDefaultEnhancers = buildGetDefaultEnhancers(middlewareEnhancer);
  if ( true && enhancers && typeof enhancers !== "function") {
    throw new Error( false ? 0 : "`enhancers` field must be a callback");
  }
  let storeEnhancers = typeof enhancers === "function" ? enhancers(getDefaultEnhancers) : getDefaultEnhancers();
  if ( true && !Array.isArray(storeEnhancers)) {
    throw new Error( false ? 0 : "`enhancers` callback must return an array");
  }
  if ( true && storeEnhancers.some((item) => typeof item !== "function")) {
    throw new Error( false ? 0 : "each enhancer provided to configureStore must be a function");
  }
  if ( true && finalMiddleware.length && !storeEnhancers.includes(middlewareEnhancer)) {
    console.error("middlewares were provided, but middleware enhancer was not included in final enhancers - make sure to call `getDefaultEnhancers`");
  }
  const composedEnhancer = finalCompose(...storeEnhancers);
  return createStore(rootReducer, preloadedState, composedEnhancer);
}

// src/createReducer.ts


// src/mapBuilders.ts
function executeReducerBuilderCallback(builderCallback) {
  const actionsMap = {};
  const actionMatchers = [];
  let defaultCaseReducer;
  const builder = {
    addCase(typeOrActionCreator, reducer) {
      if (true) {
        if (actionMatchers.length > 0) {
          throw new Error( false ? 0 : "`builder.addCase` should only be called before calling `builder.addMatcher`");
        }
        if (defaultCaseReducer) {
          throw new Error( false ? 0 : "`builder.addCase` should only be called before calling `builder.addDefaultCase`");
        }
      }
      const type = typeof typeOrActionCreator === "string" ? typeOrActionCreator : typeOrActionCreator.type;
      if (!type) {
        throw new Error( false ? 0 : "`builder.addCase` cannot be called with an empty action type");
      }
      if (type in actionsMap) {
        throw new Error( false ? 0 : `\`builder.addCase\` cannot be called with two reducers for the same action type '${type}'`);
      }
      actionsMap[type] = reducer;
      return builder;
    },
    addAsyncThunk(asyncThunk, reducers) {
      if (true) {
        if (defaultCaseReducer) {
          throw new Error( false ? 0 : "`builder.addAsyncThunk` should only be called before calling `builder.addDefaultCase`");
        }
      }
      if (reducers.pending) actionsMap[asyncThunk.pending.type] = reducers.pending;
      if (reducers.rejected) actionsMap[asyncThunk.rejected.type] = reducers.rejected;
      if (reducers.fulfilled) actionsMap[asyncThunk.fulfilled.type] = reducers.fulfilled;
      if (reducers.settled) actionMatchers.push({
        matcher: asyncThunk.settled,
        reducer: reducers.settled
      });
      return builder;
    },
    addMatcher(matcher, reducer) {
      if (true) {
        if (defaultCaseReducer) {
          throw new Error( false ? 0 : "`builder.addMatcher` should only be called before calling `builder.addDefaultCase`");
        }
      }
      actionMatchers.push({
        matcher,
        reducer
      });
      return builder;
    },
    addDefaultCase(reducer) {
      if (true) {
        if (defaultCaseReducer) {
          throw new Error( false ? 0 : "`builder.addDefaultCase` can only be called once");
        }
      }
      defaultCaseReducer = reducer;
      return builder;
    }
  };
  builderCallback(builder);
  return [actionsMap, actionMatchers, defaultCaseReducer];
}

// src/createReducer.ts
function isStateFunction(x) {
  return typeof x === "function";
}
function createReducer(initialState, mapOrBuilderCallback) {
  if (true) {
    if (typeof mapOrBuilderCallback === "object") {
      throw new Error( false ? 0 : "The object notation for `createReducer` has been removed. Please use the 'builder callback' notation instead: https://redux-toolkit.js.org/api/createReducer");
    }
  }
  let [actionsMap, finalActionMatchers, finalDefaultCaseReducer] = executeReducerBuilderCallback(mapOrBuilderCallback);
  let getInitialState;
  if (isStateFunction(initialState)) {
    getInitialState = () => freezeDraftable(initialState());
  } else {
    const frozenInitialState = freezeDraftable(initialState);
    getInitialState = () => frozenInitialState;
  }
  function reducer(state = getInitialState(), action) {
    let caseReducers = [actionsMap[action.type], ...finalActionMatchers.filter(({
      matcher
    }) => matcher(action)).map(({
      reducer: reducer2
    }) => reducer2)];
    if (caseReducers.filter((cr) => !!cr).length === 0) {
      caseReducers = [finalDefaultCaseReducer];
    }
    return caseReducers.reduce((previousState, caseReducer) => {
      if (caseReducer) {
        if ((0,immer/* isDraft */.Qx)(previousState)) {
          const draft = previousState;
          const result = caseReducer(draft, action);
          if (result === void 0) {
            return previousState;
          }
          return result;
        } else if (!(0,immer/* isDraftable */.a6)(previousState)) {
          const result = caseReducer(previousState, action);
          if (result === void 0) {
            if (previousState === null) {
              return previousState;
            }
            throw Error("A case reducer on a non-draftable value must not return undefined");
          }
          return result;
        } else {
          return (0,immer/* produce */.jM)(previousState, (draft) => {
            return caseReducer(draft, action);
          });
        }
      }
      return previousState;
    }, state);
  }
  reducer.getInitialState = getInitialState;
  return reducer;
}

// src/matchers.ts
var matches = (matcher, action) => {
  if (hasMatchFunction(matcher)) {
    return matcher.match(action);
  } else {
    return matcher(action);
  }
};
function isAnyOf(...matchers) {
  return (action) => {
    return matchers.some((matcher) => matches(matcher, action));
  };
}
function isAllOf(...matchers) {
  return (action) => {
    return matchers.every((matcher) => matches(matcher, action));
  };
}
function hasExpectedRequestMetadata(action, validStatus) {
  if (!action || !action.meta) return false;
  const hasValidRequestId = typeof action.meta.requestId === "string";
  const hasValidRequestStatus = validStatus.indexOf(action.meta.requestStatus) > -1;
  return hasValidRequestId && hasValidRequestStatus;
}
function isAsyncThunkArray(a) {
  return typeof a[0] === "function" && "pending" in a[0] && "fulfilled" in a[0] && "rejected" in a[0];
}
function isPending(...asyncThunks) {
  if (asyncThunks.length === 0) {
    return (action) => hasExpectedRequestMetadata(action, ["pending"]);
  }
  if (!isAsyncThunkArray(asyncThunks)) {
    return isPending()(asyncThunks[0]);
  }
  return isAnyOf(...asyncThunks.map((asyncThunk) => asyncThunk.pending));
}
function isRejected(...asyncThunks) {
  if (asyncThunks.length === 0) {
    return (action) => hasExpectedRequestMetadata(action, ["rejected"]);
  }
  if (!isAsyncThunkArray(asyncThunks)) {
    return isRejected()(asyncThunks[0]);
  }
  return isAnyOf(...asyncThunks.map((asyncThunk) => asyncThunk.rejected));
}
function isRejectedWithValue(...asyncThunks) {
  const hasFlag = (action) => {
    return action && action.meta && action.meta.rejectedWithValue;
  };
  if (asyncThunks.length === 0) {
    return isAllOf(isRejected(...asyncThunks), hasFlag);
  }
  if (!isAsyncThunkArray(asyncThunks)) {
    return isRejectedWithValue()(asyncThunks[0]);
  }
  return isAllOf(isRejected(...asyncThunks), hasFlag);
}
function isFulfilled(...asyncThunks) {
  if (asyncThunks.length === 0) {
    return (action) => hasExpectedRequestMetadata(action, ["fulfilled"]);
  }
  if (!isAsyncThunkArray(asyncThunks)) {
    return isFulfilled()(asyncThunks[0]);
  }
  return isAnyOf(...asyncThunks.map((asyncThunk) => asyncThunk.fulfilled));
}
function isAsyncThunkAction(...asyncThunks) {
  if (asyncThunks.length === 0) {
    return (action) => hasExpectedRequestMetadata(action, ["pending", "fulfilled", "rejected"]);
  }
  if (!isAsyncThunkArray(asyncThunks)) {
    return isAsyncThunkAction()(asyncThunks[0]);
  }
  return isAnyOf(...asyncThunks.flatMap((asyncThunk) => [asyncThunk.pending, asyncThunk.rejected, asyncThunk.fulfilled]));
}

// src/nanoid.ts
var urlAlphabet = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW";
var nanoid = (size = 21) => {
  let id = "";
  let i = size;
  while (i--) {
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
};

// src/createAsyncThunk.ts
var commonProperties = ["name", "message", "stack", "code"];
var RejectWithValue = class {
  constructor(payload, meta) {
    this.payload = payload;
    this.meta = meta;
  }
  /*
  type-only property to distinguish between RejectWithValue and FulfillWithMeta
  does not exist at runtime
  */
  _type;
};
var FulfillWithMeta = class {
  constructor(payload, meta) {
    this.payload = payload;
    this.meta = meta;
  }
  /*
  type-only property to distinguish between RejectWithValue and FulfillWithMeta
  does not exist at runtime
  */
  _type;
};
var miniSerializeError = (value) => {
  if (typeof value === "object" && value !== null) {
    const simpleError = {};
    for (const property of commonProperties) {
      if (typeof value[property] === "string") {
        simpleError[property] = value[property];
      }
    }
    return simpleError;
  }
  return {
    message: String(value)
  };
};
var externalAbortMessage = "External signal was aborted";
var createAsyncThunk = /* @__PURE__ */ (() => {
  function createAsyncThunk2(typePrefix, payloadCreator, options) {
    const fulfilled = createAction(typePrefix + "/fulfilled", (payload, requestId, arg, meta) => ({
      payload,
      meta: {
        ...meta || {},
        arg,
        requestId,
        requestStatus: "fulfilled"
      }
    }));
    const pending = createAction(typePrefix + "/pending", (requestId, arg, meta) => ({
      payload: void 0,
      meta: {
        ...meta || {},
        arg,
        requestId,
        requestStatus: "pending"
      }
    }));
    const rejected = createAction(typePrefix + "/rejected", (error, requestId, arg, payload, meta) => ({
      payload,
      error: (options && options.serializeError || miniSerializeError)(error || "Rejected"),
      meta: {
        ...meta || {},
        arg,
        requestId,
        rejectedWithValue: !!payload,
        requestStatus: "rejected",
        aborted: error?.name === "AbortError",
        condition: error?.name === "ConditionError"
      }
    }));
    function actionCreator(arg, {
      signal
    } = {}) {
      return (dispatch, getState, extra) => {
        const requestId = options?.idGenerator ? options.idGenerator(arg) : nanoid();
        const abortController = new AbortController();
        let abortHandler;
        let abortReason;
        function abort(reason) {
          abortReason = reason;
          abortController.abort();
        }
        if (signal) {
          if (signal.aborted) {
            abort(externalAbortMessage);
          } else {
            signal.addEventListener("abort", () => abort(externalAbortMessage), {
              once: true
            });
          }
        }
        const promise = async function() {
          let finalAction;
          try {
            let conditionResult = options?.condition?.(arg, {
              getState,
              extra
            });
            if (isThenable(conditionResult)) {
              conditionResult = await conditionResult;
            }
            if (conditionResult === false || abortController.signal.aborted) {
              throw {
                name: "ConditionError",
                message: "Aborted due to condition callback returning false."
              };
            }
            const abortedPromise = new Promise((_, reject) => {
              abortHandler = () => {
                reject({
                  name: "AbortError",
                  message: abortReason || "Aborted"
                });
              };
              abortController.signal.addEventListener("abort", abortHandler);
            });
            dispatch(pending(requestId, arg, options?.getPendingMeta?.({
              requestId,
              arg
            }, {
              getState,
              extra
            })));
            finalAction = await Promise.race([abortedPromise, Promise.resolve(payloadCreator(arg, {
              dispatch,
              getState,
              extra,
              requestId,
              signal: abortController.signal,
              abort,
              rejectWithValue: (value, meta) => {
                return new RejectWithValue(value, meta);
              },
              fulfillWithValue: (value, meta) => {
                return new FulfillWithMeta(value, meta);
              }
            })).then((result) => {
              if (result instanceof RejectWithValue) {
                throw result;
              }
              if (result instanceof FulfillWithMeta) {
                return fulfilled(result.payload, requestId, arg, result.meta);
              }
              return fulfilled(result, requestId, arg);
            })]);
          } catch (err) {
            finalAction = err instanceof RejectWithValue ? rejected(null, requestId, arg, err.payload, err.meta) : rejected(err, requestId, arg);
          } finally {
            if (abortHandler) {
              abortController.signal.removeEventListener("abort", abortHandler);
            }
          }
          const skipDispatch = options && !options.dispatchConditionRejection && rejected.match(finalAction) && finalAction.meta.condition;
          if (!skipDispatch) {
            dispatch(finalAction);
          }
          return finalAction;
        }();
        return Object.assign(promise, {
          abort,
          requestId,
          arg,
          unwrap() {
            return promise.then(unwrapResult);
          }
        });
      };
    }
    return Object.assign(actionCreator, {
      pending,
      rejected,
      fulfilled,
      settled: isAnyOf(rejected, fulfilled),
      typePrefix
    });
  }
  createAsyncThunk2.withTypes = () => createAsyncThunk2;
  return createAsyncThunk2;
})();
function unwrapResult(action) {
  if (action.meta && action.meta.rejectedWithValue) {
    throw action.payload;
  }
  if (action.error) {
    throw action.error;
  }
  return action.payload;
}
function isThenable(value) {
  return value !== null && typeof value === "object" && typeof value.then === "function";
}

// src/createSlice.ts
var asyncThunkSymbol = /* @__PURE__ */ Symbol.for("rtk-slice-createasyncthunk");
var asyncThunkCreator = {
  [asyncThunkSymbol]: createAsyncThunk
};
var ReducerType = /* @__PURE__ */ ((ReducerType2) => {
  ReducerType2["reducer"] = "reducer";
  ReducerType2["reducerWithPrepare"] = "reducerWithPrepare";
  ReducerType2["asyncThunk"] = "asyncThunk";
  return ReducerType2;
})(ReducerType || {});
function getType(slice, actionKey) {
  return `${slice}/${actionKey}`;
}
function buildCreateSlice({
  creators
} = {}) {
  const cAT = creators?.asyncThunk?.[asyncThunkSymbol];
  return function createSlice2(options) {
    const {
      name,
      reducerPath = name
    } = options;
    if (!name) {
      throw new Error( false ? 0 : "`name` is a required option for createSlice");
    }
    if (typeof process !== "undefined" && "development" === "development") {
      if (options.initialState === void 0) {
        console.error("You must provide an `initialState` value that is not `undefined`. You may have misspelled `initialState`");
      }
    }
    const reducers = (typeof options.reducers === "function" ? options.reducers(buildReducerCreators()) : options.reducers) || {};
    const reducerNames = Object.keys(reducers);
    const context = {
      sliceCaseReducersByName: {},
      sliceCaseReducersByType: {},
      actionCreators: {},
      sliceMatchers: []
    };
    const contextMethods = {
      addCase(typeOrActionCreator, reducer2) {
        const type = typeof typeOrActionCreator === "string" ? typeOrActionCreator : typeOrActionCreator.type;
        if (!type) {
          throw new Error( false ? 0 : "`context.addCase` cannot be called with an empty action type");
        }
        if (type in context.sliceCaseReducersByType) {
          throw new Error( false ? 0 : "`context.addCase` cannot be called with two reducers for the same action type: " + type);
        }
        context.sliceCaseReducersByType[type] = reducer2;
        return contextMethods;
      },
      addMatcher(matcher, reducer2) {
        context.sliceMatchers.push({
          matcher,
          reducer: reducer2
        });
        return contextMethods;
      },
      exposeAction(name2, actionCreator) {
        context.actionCreators[name2] = actionCreator;
        return contextMethods;
      },
      exposeCaseReducer(name2, reducer2) {
        context.sliceCaseReducersByName[name2] = reducer2;
        return contextMethods;
      }
    };
    reducerNames.forEach((reducerName) => {
      const reducerDefinition = reducers[reducerName];
      const reducerDetails = {
        reducerName,
        type: getType(name, reducerName),
        createNotation: typeof options.reducers === "function"
      };
      if (isAsyncThunkSliceReducerDefinition(reducerDefinition)) {
        handleThunkCaseReducerDefinition(reducerDetails, reducerDefinition, contextMethods, cAT);
      } else {
        handleNormalReducerDefinition(reducerDetails, reducerDefinition, contextMethods);
      }
    });
    function buildReducer() {
      if (true) {
        if (typeof options.extraReducers === "object") {
          throw new Error( false ? 0 : "The object notation for `createSlice.extraReducers` has been removed. Please use the 'builder callback' notation instead: https://redux-toolkit.js.org/api/createSlice");
        }
      }
      const [extraReducers = {}, actionMatchers = [], defaultCaseReducer = void 0] = typeof options.extraReducers === "function" ? executeReducerBuilderCallback(options.extraReducers) : [options.extraReducers];
      const finalCaseReducers = {
        ...extraReducers,
        ...context.sliceCaseReducersByType
      };
      return createReducer(options.initialState, (builder) => {
        for (let key in finalCaseReducers) {
          builder.addCase(key, finalCaseReducers[key]);
        }
        for (let sM of context.sliceMatchers) {
          builder.addMatcher(sM.matcher, sM.reducer);
        }
        for (let m of actionMatchers) {
          builder.addMatcher(m.matcher, m.reducer);
        }
        if (defaultCaseReducer) {
          builder.addDefaultCase(defaultCaseReducer);
        }
      });
    }
    const selectSelf = (state) => state;
    const injectedSelectorCache = /* @__PURE__ */ new Map();
    const injectedStateCache = /* @__PURE__ */ new WeakMap();
    let _reducer;
    function reducer(state, action) {
      if (!_reducer) _reducer = buildReducer();
      return _reducer(state, action);
    }
    function getInitialState() {
      if (!_reducer) _reducer = buildReducer();
      return _reducer.getInitialState();
    }
    function makeSelectorProps(reducerPath2, injected = false) {
      function selectSlice(state) {
        let sliceState = state[reducerPath2];
        if (typeof sliceState === "undefined") {
          if (injected) {
            sliceState = getOrInsertComputed(injectedStateCache, selectSlice, getInitialState);
          } else if (true) {
            throw new Error( false ? 0 : "selectSlice returned undefined for an uninjected slice reducer");
          }
        }
        return sliceState;
      }
      function getSelectors(selectState = selectSelf) {
        const selectorCache = getOrInsertComputed(injectedSelectorCache, injected, () => /* @__PURE__ */ new WeakMap());
        return getOrInsertComputed(selectorCache, selectState, () => {
          const map = {};
          for (const [name2, selector] of Object.entries(options.selectors ?? {})) {
            map[name2] = wrapSelector(selector, selectState, () => getOrInsertComputed(injectedStateCache, selectState, getInitialState), injected);
          }
          return map;
        });
      }
      return {
        reducerPath: reducerPath2,
        getSelectors,
        get selectors() {
          return getSelectors(selectSlice);
        },
        selectSlice
      };
    }
    const slice = {
      name,
      reducer,
      actions: context.actionCreators,
      caseReducers: context.sliceCaseReducersByName,
      getInitialState,
      ...makeSelectorProps(reducerPath),
      injectInto(injectable, {
        reducerPath: pathOpt,
        ...config
      } = {}) {
        const newReducerPath = pathOpt ?? reducerPath;
        injectable.inject({
          reducerPath: newReducerPath,
          reducer
        }, config);
        return {
          ...slice,
          ...makeSelectorProps(newReducerPath, true)
        };
      }
    };
    return slice;
  };
}
function wrapSelector(selector, selectState, getInitialState, injected) {
  function wrapper(rootState, ...args) {
    let sliceState = selectState(rootState);
    if (typeof sliceState === "undefined") {
      if (injected) {
        sliceState = getInitialState();
      } else if (true) {
        throw new Error( false ? 0 : "selectState returned undefined for an uninjected slice reducer");
      }
    }
    return selector(sliceState, ...args);
  }
  wrapper.unwrapped = selector;
  return wrapper;
}
var createSlice = /* @__PURE__ */ buildCreateSlice();
function buildReducerCreators() {
  function asyncThunk(payloadCreator, config) {
    return {
      _reducerDefinitionType: "asyncThunk" /* asyncThunk */,
      payloadCreator,
      ...config
    };
  }
  asyncThunk.withTypes = () => asyncThunk;
  return {
    reducer(caseReducer) {
      return Object.assign({
        // hack so the wrapping function has the same name as the original
        // we need to create a wrapper so the `reducerDefinitionType` is not assigned to the original
        [caseReducer.name](...args) {
          return caseReducer(...args);
        }
      }[caseReducer.name], {
        _reducerDefinitionType: "reducer" /* reducer */
      });
    },
    preparedReducer(prepare, reducer) {
      return {
        _reducerDefinitionType: "reducerWithPrepare" /* reducerWithPrepare */,
        prepare,
        reducer
      };
    },
    asyncThunk
  };
}
function handleNormalReducerDefinition({
  type,
  reducerName,
  createNotation
}, maybeReducerWithPrepare, context) {
  let caseReducer;
  let prepareCallback;
  if ("reducer" in maybeReducerWithPrepare) {
    if (createNotation && !isCaseReducerWithPrepareDefinition(maybeReducerWithPrepare)) {
      throw new Error( false ? 0 : "Please use the `create.preparedReducer` notation for prepared action creators with the `create` notation.");
    }
    caseReducer = maybeReducerWithPrepare.reducer;
    prepareCallback = maybeReducerWithPrepare.prepare;
  } else {
    caseReducer = maybeReducerWithPrepare;
  }
  context.addCase(type, caseReducer).exposeCaseReducer(reducerName, caseReducer).exposeAction(reducerName, prepareCallback ? createAction(type, prepareCallback) : createAction(type));
}
function isAsyncThunkSliceReducerDefinition(reducerDefinition) {
  return reducerDefinition._reducerDefinitionType === "asyncThunk" /* asyncThunk */;
}
function isCaseReducerWithPrepareDefinition(reducerDefinition) {
  return reducerDefinition._reducerDefinitionType === "reducerWithPrepare" /* reducerWithPrepare */;
}
function handleThunkCaseReducerDefinition({
  type,
  reducerName
}, reducerDefinition, context, cAT) {
  if (!cAT) {
    throw new Error( false ? 0 : "Cannot use `create.asyncThunk` in the built-in `createSlice`. Use `buildCreateSlice({ creators: { asyncThunk: asyncThunkCreator } })` to create a customised version of `createSlice`.");
  }
  const {
    payloadCreator,
    fulfilled,
    pending,
    rejected,
    settled,
    options
  } = reducerDefinition;
  const thunk = cAT(type, payloadCreator, options);
  context.exposeAction(reducerName, thunk);
  if (fulfilled) {
    context.addCase(thunk.fulfilled, fulfilled);
  }
  if (pending) {
    context.addCase(thunk.pending, pending);
  }
  if (rejected) {
    context.addCase(thunk.rejected, rejected);
  }
  if (settled) {
    context.addMatcher(thunk.settled, settled);
  }
  context.exposeCaseReducer(reducerName, {
    fulfilled: fulfilled || noop,
    pending: pending || noop,
    rejected: rejected || noop,
    settled: settled || noop
  });
}
function noop() {
}

// src/entities/entity_state.ts
function getInitialEntityState() {
  return {
    ids: [],
    entities: {}
  };
}
function createInitialStateFactory(stateAdapter) {
  function getInitialState(additionalState = {}, entities) {
    const state = Object.assign(getInitialEntityState(), additionalState);
    return entities ? stateAdapter.setAll(state, entities) : state;
  }
  return {
    getInitialState
  };
}

// src/entities/state_selectors.ts
function createSelectorsFactory() {
  function getSelectors(selectState, options = {}) {
    const {
      createSelector: createSelector2 = createDraftSafeSelector
    } = options;
    const selectIds = (state) => state.ids;
    const selectEntities = (state) => state.entities;
    const selectAll = createSelector2(selectIds, selectEntities, (ids, entities) => ids.map((id) => entities[id]));
    const selectId = (_, id) => id;
    const selectById = (entities, id) => entities[id];
    const selectTotal = createSelector2(selectIds, (ids) => ids.length);
    if (!selectState) {
      return {
        selectIds,
        selectEntities,
        selectAll,
        selectTotal,
        selectById: createSelector2(selectEntities, selectId, selectById)
      };
    }
    const selectGlobalizedEntities = createSelector2(selectState, selectEntities);
    return {
      selectIds: createSelector2(selectState, selectIds),
      selectEntities: selectGlobalizedEntities,
      selectAll: createSelector2(selectState, selectAll),
      selectTotal: createSelector2(selectState, selectTotal),
      selectById: createSelector2(selectGlobalizedEntities, selectId, selectById)
    };
  }
  return {
    getSelectors
  };
}

// src/entities/state_adapter.ts

var isDraftTyped = (/* unused pure expression or super */ null && (isDraft3));
function createSingleArgumentStateOperator(mutator) {
  const operator = createStateOperator((_, state) => mutator(state));
  return function operation(state) {
    return operator(state, void 0);
  };
}
function createStateOperator(mutator) {
  return function operation(state, arg) {
    function isPayloadActionArgument(arg2) {
      return isFSA(arg2);
    }
    const runMutator = (draft) => {
      if (isPayloadActionArgument(arg)) {
        mutator(arg.payload, draft);
      } else {
        mutator(arg, draft);
      }
    };
    if (isDraftTyped(state)) {
      runMutator(state);
      return state;
    }
    return createNextState3(state, runMutator);
  };
}

// src/entities/utils.ts

function selectIdValue(entity, selectId) {
  const key = selectId(entity);
  if ( true && key === void 0) {
    console.warn("The entity passed to the `selectId` implementation returned undefined.", "You should probably provide your own `selectId` implementation.", "The entity that was passed:", entity, "The `selectId` implementation:", selectId.toString());
  }
  return key;
}
function ensureEntitiesArray(entities) {
  if (!Array.isArray(entities)) {
    entities = Object.values(entities);
  }
  return entities;
}
function getCurrent(value) {
  return isDraft4(value) ? current2(value) : value;
}
function splitAddedUpdatedEntities(newEntities, selectId, state) {
  newEntities = ensureEntitiesArray(newEntities);
  const existingIdsArray = getCurrent(state.ids);
  const existingIds = new Set(existingIdsArray);
  const added = [];
  const addedIds = /* @__PURE__ */ new Set([]);
  const updated = [];
  for (const entity of newEntities) {
    const id = selectIdValue(entity, selectId);
    if (existingIds.has(id) || addedIds.has(id)) {
      updated.push({
        id,
        changes: entity
      });
    } else {
      addedIds.add(id);
      added.push(entity);
    }
  }
  return [added, updated, existingIdsArray];
}

// src/entities/unsorted_state_adapter.ts
function createUnsortedStateAdapter(selectId) {
  function addOneMutably(entity, state) {
    const key = selectIdValue(entity, selectId);
    if (key in state.entities) {
      return;
    }
    state.ids.push(key);
    state.entities[key] = entity;
  }
  function addManyMutably(newEntities, state) {
    newEntities = ensureEntitiesArray(newEntities);
    for (const entity of newEntities) {
      addOneMutably(entity, state);
    }
  }
  function setOneMutably(entity, state) {
    const key = selectIdValue(entity, selectId);
    if (!(key in state.entities)) {
      state.ids.push(key);
    }
    ;
    state.entities[key] = entity;
  }
  function setManyMutably(newEntities, state) {
    newEntities = ensureEntitiesArray(newEntities);
    for (const entity of newEntities) {
      setOneMutably(entity, state);
    }
  }
  function setAllMutably(newEntities, state) {
    newEntities = ensureEntitiesArray(newEntities);
    state.ids = [];
    state.entities = {};
    addManyMutably(newEntities, state);
  }
  function removeOneMutably(key, state) {
    return removeManyMutably([key], state);
  }
  function removeManyMutably(keys, state) {
    let didMutate = false;
    keys.forEach((key) => {
      if (key in state.entities) {
        delete state.entities[key];
        didMutate = true;
      }
    });
    if (didMutate) {
      state.ids = state.ids.filter((id) => id in state.entities);
    }
  }
  function removeAllMutably(state) {
    Object.assign(state, {
      ids: [],
      entities: {}
    });
  }
  function takeNewKey(keys, update, state) {
    const original3 = state.entities[update.id];
    if (original3 === void 0) {
      return false;
    }
    const updated = Object.assign({}, original3, update.changes);
    const newKey = selectIdValue(updated, selectId);
    const hasNewKey = newKey !== update.id;
    if (hasNewKey) {
      keys[update.id] = newKey;
      delete state.entities[update.id];
    }
    ;
    state.entities[newKey] = updated;
    return hasNewKey;
  }
  function updateOneMutably(update, state) {
    return updateManyMutably([update], state);
  }
  function updateManyMutably(updates, state) {
    const newKeys = {};
    const updatesPerEntity = {};
    updates.forEach((update) => {
      if (update.id in state.entities) {
        updatesPerEntity[update.id] = {
          id: update.id,
          // Spreads ignore falsy values, so this works even if there isn't
          // an existing update already at this key
          changes: {
            ...updatesPerEntity[update.id]?.changes,
            ...update.changes
          }
        };
      }
    });
    updates = Object.values(updatesPerEntity);
    const didMutateEntities = updates.length > 0;
    if (didMutateEntities) {
      const didMutateIds = updates.filter((update) => takeNewKey(newKeys, update, state)).length > 0;
      if (didMutateIds) {
        state.ids = Object.values(state.entities).map((e) => selectIdValue(e, selectId));
      }
    }
  }
  function upsertOneMutably(entity, state) {
    return upsertManyMutably([entity], state);
  }
  function upsertManyMutably(newEntities, state) {
    const [added, updated] = splitAddedUpdatedEntities(newEntities, selectId, state);
    addManyMutably(added, state);
    updateManyMutably(updated, state);
  }
  return {
    removeAll: createSingleArgumentStateOperator(removeAllMutably),
    addOne: createStateOperator(addOneMutably),
    addMany: createStateOperator(addManyMutably),
    setOne: createStateOperator(setOneMutably),
    setMany: createStateOperator(setManyMutably),
    setAll: createStateOperator(setAllMutably),
    updateOne: createStateOperator(updateOneMutably),
    updateMany: createStateOperator(updateManyMutably),
    upsertOne: createStateOperator(upsertOneMutably),
    upsertMany: createStateOperator(upsertManyMutably),
    removeOne: createStateOperator(removeOneMutably),
    removeMany: createStateOperator(removeManyMutably)
  };
}

// src/entities/sorted_state_adapter.ts
function findInsertIndex(sortedItems, item, comparisonFunction) {
  let lowIndex = 0;
  let highIndex = sortedItems.length;
  while (lowIndex < highIndex) {
    let middleIndex = lowIndex + highIndex >>> 1;
    const currentItem = sortedItems[middleIndex];
    const res = comparisonFunction(item, currentItem);
    if (res >= 0) {
      lowIndex = middleIndex + 1;
    } else {
      highIndex = middleIndex;
    }
  }
  return lowIndex;
}
function insert(sortedItems, item, comparisonFunction) {
  const insertAtIndex = findInsertIndex(sortedItems, item, comparisonFunction);
  sortedItems.splice(insertAtIndex, 0, item);
  return sortedItems;
}
function createSortedStateAdapter(selectId, comparer) {
  const {
    removeOne,
    removeMany,
    removeAll
  } = createUnsortedStateAdapter(selectId);
  function addOneMutably(entity, state) {
    return addManyMutably([entity], state);
  }
  function addManyMutably(newEntities, state, existingIds) {
    newEntities = ensureEntitiesArray(newEntities);
    const existingKeys = new Set(existingIds ?? getCurrent(state.ids));
    const addedKeys = /* @__PURE__ */ new Set();
    const models = newEntities.filter((model) => {
      const modelId = selectIdValue(model, selectId);
      const notAdded = !addedKeys.has(modelId);
      if (notAdded) addedKeys.add(modelId);
      return !existingKeys.has(modelId) && notAdded;
    });
    if (models.length !== 0) {
      mergeFunction(state, models);
    }
  }
  function setOneMutably(entity, state) {
    return setManyMutably([entity], state);
  }
  function setManyMutably(newEntities, state) {
    let deduplicatedEntities = {};
    newEntities = ensureEntitiesArray(newEntities);
    if (newEntities.length !== 0) {
      for (const item of newEntities) {
        const entityId = selectId(item);
        deduplicatedEntities[entityId] = item;
        delete state.entities[entityId];
      }
      newEntities = ensureEntitiesArray(deduplicatedEntities);
      mergeFunction(state, newEntities);
    }
  }
  function setAllMutably(newEntities, state) {
    newEntities = ensureEntitiesArray(newEntities);
    state.entities = {};
    state.ids = [];
    addManyMutably(newEntities, state, []);
  }
  function updateOneMutably(update, state) {
    return updateManyMutably([update], state);
  }
  function updateManyMutably(updates, state) {
    let appliedUpdates = false;
    let replacedIds = false;
    for (let update of updates) {
      const entity = state.entities[update.id];
      if (!entity) {
        continue;
      }
      appliedUpdates = true;
      Object.assign(entity, update.changes);
      const newId = selectId(entity);
      if (update.id !== newId) {
        replacedIds = true;
        delete state.entities[update.id];
        const oldIndex = state.ids.indexOf(update.id);
        state.ids[oldIndex] = newId;
        state.entities[newId] = entity;
      }
    }
    if (appliedUpdates) {
      mergeFunction(state, [], appliedUpdates, replacedIds);
    }
  }
  function upsertOneMutably(entity, state) {
    return upsertManyMutably([entity], state);
  }
  function upsertManyMutably(newEntities, state) {
    const [added, updated, existingIdsArray] = splitAddedUpdatedEntities(newEntities, selectId, state);
    if (added.length) {
      addManyMutably(added, state, existingIdsArray);
    }
    if (updated.length) {
      updateManyMutably(updated, state);
    }
  }
  function areArraysEqual(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] === b[i]) {
        continue;
      }
      return false;
    }
    return true;
  }
  const mergeFunction = (state, addedItems, appliedUpdates, replacedIds) => {
    const currentEntities = getCurrent(state.entities);
    const currentIds = getCurrent(state.ids);
    const stateEntities = state.entities;
    let ids = currentIds;
    if (replacedIds) {
      ids = new Set(currentIds);
    }
    let sortedEntities = [];
    for (const id of ids) {
      const entity = currentEntities[id];
      if (entity) {
        sortedEntities.push(entity);
      }
    }
    const wasPreviouslyEmpty = sortedEntities.length === 0;
    for (const item of addedItems) {
      stateEntities[selectId(item)] = item;
      if (!wasPreviouslyEmpty) {
        insert(sortedEntities, item, comparer);
      }
    }
    if (wasPreviouslyEmpty) {
      sortedEntities = addedItems.slice().sort(comparer);
    } else if (appliedUpdates) {
      sortedEntities.sort(comparer);
    }
    const newSortedIds = sortedEntities.map(selectId);
    if (!areArraysEqual(currentIds, newSortedIds)) {
      state.ids = newSortedIds;
    }
  };
  return {
    removeOne,
    removeMany,
    removeAll,
    addOne: createStateOperator(addOneMutably),
    updateOne: createStateOperator(updateOneMutably),
    upsertOne: createStateOperator(upsertOneMutably),
    setOne: createStateOperator(setOneMutably),
    setMany: createStateOperator(setManyMutably),
    setAll: createStateOperator(setAllMutably),
    addMany: createStateOperator(addManyMutably),
    updateMany: createStateOperator(updateManyMutably),
    upsertMany: createStateOperator(upsertManyMutably)
  };
}

// src/entities/create_adapter.ts
function createEntityAdapter(options = {}) {
  const {
    selectId,
    sortComparer
  } = {
    sortComparer: false,
    selectId: (instance) => instance.id,
    ...options
  };
  const stateAdapter = sortComparer ? createSortedStateAdapter(selectId, sortComparer) : createUnsortedStateAdapter(selectId);
  const stateFactory = createInitialStateFactory(stateAdapter);
  const selectorsFactory = createSelectorsFactory();
  return {
    selectId,
    sortComparer,
    ...stateFactory,
    ...selectorsFactory,
    ...stateAdapter
  };
}

// src/listenerMiddleware/index.ts


// src/listenerMiddleware/exceptions.ts
var task = "task";
var listener = "listener";
var completed = "completed";
var cancelled = "cancelled";
var taskCancelled = `task-${cancelled}`;
var taskCompleted = `task-${completed}`;
var listenerCancelled = `${listener}-${cancelled}`;
var listenerCompleted = `${listener}-${completed}`;
var TaskAbortError = class {
  constructor(code) {
    this.code = code;
    this.message = `${task} ${cancelled} (reason: ${code})`;
  }
  name = "TaskAbortError";
  message;
};

// src/listenerMiddleware/utils.ts
var assertFunction = (func, expected) => {
  if (typeof func !== "function") {
    throw new TypeError( false ? 0 : `${expected} is not a function`);
  }
};
var noop2 = () => {
};
var catchRejection = (promise, onError = noop2) => {
  promise.catch(onError);
  return promise;
};
var addAbortSignalListener = (abortSignal, callback) => {
  abortSignal.addEventListener("abort", callback, {
    once: true
  });
  return () => abortSignal.removeEventListener("abort", callback);
};
var abortControllerWithReason = (abortController, reason) => {
  const signal = abortController.signal;
  if (signal.aborted) {
    return;
  }
  if (!("reason" in signal)) {
    Object.defineProperty(signal, "reason", {
      enumerable: true,
      value: reason,
      configurable: true,
      writable: true
    });
  }
  ;
  abortController.abort(reason);
};

// src/listenerMiddleware/task.ts
var validateActive = (signal) => {
  if (signal.aborted) {
    const {
      reason
    } = signal;
    throw new TaskAbortError(reason);
  }
};
function raceWithSignal(signal, promise) {
  let cleanup = noop2;
  return new Promise((resolve, reject) => {
    const notifyRejection = () => reject(new TaskAbortError(signal.reason));
    if (signal.aborted) {
      notifyRejection();
      return;
    }
    cleanup = addAbortSignalListener(signal, notifyRejection);
    promise.finally(() => cleanup()).then(resolve, reject);
  }).finally(() => {
    cleanup = noop2;
  });
}
var runTask = async (task2, cleanUp) => {
  try {
    await Promise.resolve();
    const value = await task2();
    return {
      status: "ok",
      value
    };
  } catch (error) {
    return {
      status: error instanceof TaskAbortError ? "cancelled" : "rejected",
      error
    };
  } finally {
    cleanUp?.();
  }
};
var createPause = (signal) => {
  return (promise) => {
    return catchRejection(raceWithSignal(signal, promise).then((output) => {
      validateActive(signal);
      return output;
    }));
  };
};
var createDelay = (signal) => {
  const pause = createPause(signal);
  return (timeoutMs) => {
    return pause(new Promise((resolve) => setTimeout(resolve, timeoutMs)));
  };
};

// src/listenerMiddleware/index.ts
var {
  assign: redux_toolkit_modern_assign
} = Object;
var INTERNAL_NIL_TOKEN = {};
var alm = "listenerMiddleware";
var createFork = (parentAbortSignal, parentBlockingPromises) => {
  const linkControllers = (controller) => addAbortSignalListener(parentAbortSignal, () => abortControllerWithReason(controller, parentAbortSignal.reason));
  return (taskExecutor, opts) => {
    assertFunction(taskExecutor, "taskExecutor");
    const childAbortController = new AbortController();
    linkControllers(childAbortController);
    const result = runTask(async () => {
      validateActive(parentAbortSignal);
      validateActive(childAbortController.signal);
      const result2 = await taskExecutor({
        pause: createPause(childAbortController.signal),
        delay: createDelay(childAbortController.signal),
        signal: childAbortController.signal
      });
      validateActive(childAbortController.signal);
      return result2;
    }, () => abortControllerWithReason(childAbortController, taskCompleted));
    if (opts?.autoJoin) {
      parentBlockingPromises.push(result.catch(noop2));
    }
    return {
      result: createPause(parentAbortSignal)(result),
      cancel() {
        abortControllerWithReason(childAbortController, taskCancelled);
      }
    };
  };
};
var createTakePattern = (startListening, signal) => {
  const take = async (predicate, timeout) => {
    validateActive(signal);
    let unsubscribe = () => {
    };
    const tuplePromise = new Promise((resolve, reject) => {
      let stopListening = startListening({
        predicate,
        effect: (action, listenerApi) => {
          listenerApi.unsubscribe();
          resolve([action, listenerApi.getState(), listenerApi.getOriginalState()]);
        }
      });
      unsubscribe = () => {
        stopListening();
        reject();
      };
    });
    const promises = [tuplePromise];
    if (timeout != null) {
      promises.push(new Promise((resolve) => setTimeout(resolve, timeout, null)));
    }
    try {
      const output = await raceWithSignal(signal, Promise.race(promises));
      validateActive(signal);
      return output;
    } finally {
      unsubscribe();
    }
  };
  return (predicate, timeout) => catchRejection(take(predicate, timeout));
};
var getListenerEntryPropsFrom = (options) => {
  let {
    type,
    actionCreator,
    matcher,
    predicate,
    effect
  } = options;
  if (type) {
    predicate = createAction(type).match;
  } else if (actionCreator) {
    type = actionCreator.type;
    predicate = actionCreator.match;
  } else if (matcher) {
    predicate = matcher;
  } else if (predicate) {
  } else {
    throw new Error( false ? 0 : "Creating or removing a listener requires one of the known fields for matching an action");
  }
  assertFunction(effect, "options.listener");
  return {
    predicate,
    type,
    effect
  };
};
var createListenerEntry = /* @__PURE__ */ redux_toolkit_modern_assign((options) => {
  const {
    type,
    predicate,
    effect
  } = getListenerEntryPropsFrom(options);
  const entry = {
    id: nanoid(),
    effect,
    type,
    predicate,
    pending: /* @__PURE__ */ new Set(),
    unsubscribe: () => {
      throw new Error( false ? 0 : "Unsubscribe not initialized");
    }
  };
  return entry;
}, {
  withTypes: () => createListenerEntry
});
var findListenerEntry = (listenerMap, options) => {
  const {
    type,
    effect,
    predicate
  } = getListenerEntryPropsFrom(options);
  return Array.from(listenerMap.values()).find((entry) => {
    const matchPredicateOrType = typeof type === "string" ? entry.type === type : entry.predicate === predicate;
    return matchPredicateOrType && entry.effect === effect;
  });
};
var cancelActiveListeners = (entry) => {
  entry.pending.forEach((controller) => {
    abortControllerWithReason(controller, listenerCancelled);
  });
};
var createClearListenerMiddleware = (listenerMap, executingListeners) => {
  return () => {
    for (const listener2 of executingListeners.keys()) {
      cancelActiveListeners(listener2);
    }
    listenerMap.clear();
  };
};
var safelyNotifyError = (errorHandler, errorToNotify, errorInfo) => {
  try {
    errorHandler(errorToNotify, errorInfo);
  } catch (errorHandlerError) {
    setTimeout(() => {
      throw errorHandlerError;
    }, 0);
  }
};
var addListener = /* @__PURE__ */ redux_toolkit_modern_assign(/* @__PURE__ */ createAction(`${alm}/add`), {
  withTypes: () => addListener
});
var clearAllListeners = /* @__PURE__ */ createAction(`${alm}/removeAll`);
var removeListener = /* @__PURE__ */ redux_toolkit_modern_assign(/* @__PURE__ */ createAction(`${alm}/remove`), {
  withTypes: () => removeListener
});
var defaultErrorHandler = (...args) => {
  console.error(`${alm}/error`, ...args);
};
var createListenerMiddleware = (middlewareOptions = {}) => {
  const listenerMap = /* @__PURE__ */ new Map();
  const executingListeners = /* @__PURE__ */ new Map();
  const trackExecutingListener = (entry) => {
    const count = executingListeners.get(entry) ?? 0;
    executingListeners.set(entry, count + 1);
  };
  const untrackExecutingListener = (entry) => {
    const count = executingListeners.get(entry) ?? 1;
    if (count === 1) {
      executingListeners.delete(entry);
    } else {
      executingListeners.set(entry, count - 1);
    }
  };
  const {
    extra,
    onError = defaultErrorHandler
  } = middlewareOptions;
  assertFunction(onError, "onError");
  const insertEntry = (entry) => {
    entry.unsubscribe = () => listenerMap.delete(entry.id);
    listenerMap.set(entry.id, entry);
    return (cancelOptions) => {
      entry.unsubscribe();
      if (cancelOptions?.cancelActive) {
        cancelActiveListeners(entry);
      }
    };
  };
  const startListening = (options) => {
    const entry = findListenerEntry(listenerMap, options) ?? createListenerEntry(options);
    return insertEntry(entry);
  };
  redux_toolkit_modern_assign(startListening, {
    withTypes: () => startListening
  });
  const stopListening = (options) => {
    const entry = findListenerEntry(listenerMap, options);
    if (entry) {
      entry.unsubscribe();
      if (options.cancelActive) {
        cancelActiveListeners(entry);
      }
    }
    return !!entry;
  };
  redux_toolkit_modern_assign(stopListening, {
    withTypes: () => stopListening
  });
  const notifyListener = async (entry, action, api, getOriginalState) => {
    const internalTaskController = new AbortController();
    const take = createTakePattern(startListening, internalTaskController.signal);
    const autoJoinPromises = [];
    try {
      entry.pending.add(internalTaskController);
      trackExecutingListener(entry);
      await Promise.resolve(entry.effect(
        action,
        // Use assign() rather than ... to avoid extra helper functions added to bundle
        redux_toolkit_modern_assign({}, api, {
          getOriginalState,
          condition: (predicate, timeout) => take(predicate, timeout).then(Boolean),
          take,
          delay: createDelay(internalTaskController.signal),
          pause: createPause(internalTaskController.signal),
          extra,
          signal: internalTaskController.signal,
          fork: createFork(internalTaskController.signal, autoJoinPromises),
          unsubscribe: entry.unsubscribe,
          subscribe: () => {
            listenerMap.set(entry.id, entry);
          },
          cancelActiveListeners: () => {
            entry.pending.forEach((controller, _, set) => {
              if (controller !== internalTaskController) {
                abortControllerWithReason(controller, listenerCancelled);
                set.delete(controller);
              }
            });
          },
          cancel: () => {
            abortControllerWithReason(internalTaskController, listenerCancelled);
            entry.pending.delete(internalTaskController);
          },
          throwIfCancelled: () => {
            validateActive(internalTaskController.signal);
          }
        })
      ));
    } catch (listenerError) {
      if (!(listenerError instanceof TaskAbortError)) {
        safelyNotifyError(onError, listenerError, {
          raisedBy: "effect"
        });
      }
    } finally {
      await Promise.all(autoJoinPromises);
      abortControllerWithReason(internalTaskController, listenerCompleted);
      untrackExecutingListener(entry);
      entry.pending.delete(internalTaskController);
    }
  };
  const clearListenerMiddleware = createClearListenerMiddleware(listenerMap, executingListeners);
  const middleware = (api) => (next) => (action) => {
    if (!redux_isAction(action)) {
      return next(action);
    }
    if (addListener.match(action)) {
      return startListening(action.payload);
    }
    if (clearAllListeners.match(action)) {
      clearListenerMiddleware();
      return;
    }
    if (removeListener.match(action)) {
      return stopListening(action.payload);
    }
    let originalState = api.getState();
    const getOriginalState = () => {
      if (originalState === INTERNAL_NIL_TOKEN) {
        throw new Error( false ? 0 : `${alm}: getOriginalState can only be called synchronously`);
      }
      return originalState;
    };
    let result;
    try {
      result = next(action);
      if (listenerMap.size > 0) {
        const currentState = api.getState();
        const listenerEntries = Array.from(listenerMap.values());
        for (const entry of listenerEntries) {
          let runListener = false;
          try {
            runListener = entry.predicate(action, currentState, originalState);
          } catch (predicateError) {
            runListener = false;
            safelyNotifyError(onError, predicateError, {
              raisedBy: "predicate"
            });
          }
          if (!runListener) {
            continue;
          }
          notifyListener(entry, action, api, getOriginalState);
        }
      }
    } finally {
      originalState = INTERNAL_NIL_TOKEN;
    }
    return result;
  };
  return {
    middleware,
    startListening,
    stopListening,
    clearListeners: clearListenerMiddleware
  };
};

// src/dynamicMiddleware/index.ts

var createMiddlewareEntry = (middleware) => ({
  middleware,
  applied: /* @__PURE__ */ new Map()
});
var matchInstance = (instanceId) => (action) => action?.meta?.instanceId === instanceId;
var createDynamicMiddleware = () => {
  const instanceId = nanoid();
  const middlewareMap = /* @__PURE__ */ new Map();
  const withMiddleware = Object.assign(createAction("dynamicMiddleware/add", (...middlewares) => ({
    payload: middlewares,
    meta: {
      instanceId
    }
  })), {
    withTypes: () => withMiddleware
  });
  const addMiddleware = Object.assign(function addMiddleware2(...middlewares) {
    middlewares.forEach((middleware2) => {
      getOrInsertComputed(middlewareMap, middleware2, createMiddlewareEntry);
    });
  }, {
    withTypes: () => addMiddleware
  });
  const getFinalMiddleware = (api) => {
    const appliedMiddleware = Array.from(middlewareMap.values()).map((entry) => getOrInsertComputed(entry.applied, api, entry.middleware));
    return compose3(...appliedMiddleware);
  };
  const isWithMiddleware = isAllOf(withMiddleware, matchInstance(instanceId));
  const middleware = (api) => (next) => (action) => {
    if (isWithMiddleware(action)) {
      addMiddleware(...action.payload);
      return api.dispatch;
    }
    return getFinalMiddleware(api)(next)(action);
  };
  return {
    middleware,
    addMiddleware,
    withMiddleware,
    instanceId
  };
};

// src/combineSlices.ts

var isSliceLike = (maybeSliceLike) => "reducerPath" in maybeSliceLike && typeof maybeSliceLike.reducerPath === "string";
var getReducers = (slices) => slices.flatMap((sliceOrMap) => isSliceLike(sliceOrMap) ? [[sliceOrMap.reducerPath, sliceOrMap.reducer]] : Object.entries(sliceOrMap));
var ORIGINAL_STATE = Symbol.for("rtk-state-proxy-original");
var isStateProxy = (value) => !!value && !!value[ORIGINAL_STATE];
var stateProxyMap = /* @__PURE__ */ new WeakMap();
var createStateProxy = (state, reducerMap, initialStateCache) => getOrInsertComputed(stateProxyMap, state, () => new Proxy(state, {
  get: (target, prop, receiver) => {
    if (prop === ORIGINAL_STATE) return target;
    const result = Reflect.get(target, prop, receiver);
    if (typeof result === "undefined") {
      const cached = initialStateCache[prop];
      if (typeof cached !== "undefined") return cached;
      const reducer = reducerMap[prop];
      if (reducer) {
        const reducerResult = reducer(void 0, {
          type: nanoid()
        });
        if (typeof reducerResult === "undefined") {
          throw new Error( false ? 0 : `The slice reducer for key "${prop.toString()}" returned undefined when called for selector(). If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined. If you don't want to set a value for this reducer, you can use null instead of undefined.`);
        }
        initialStateCache[prop] = reducerResult;
        return reducerResult;
      }
    }
    return result;
  }
}));
var original = (state) => {
  if (!isStateProxy(state)) {
    throw new Error( false ? 0 : "original must be used on state Proxy");
  }
  return state[ORIGINAL_STATE];
};
var emptyObject = {};
var noopReducer = (state = emptyObject) => state;
function combineSlices(...slices) {
  const reducerMap = Object.fromEntries(getReducers(slices));
  const getReducer = () => Object.keys(reducerMap).length ? combineReducers2(reducerMap) : noopReducer;
  let reducer = getReducer();
  function combinedReducer(state, action) {
    return reducer(state, action);
  }
  combinedReducer.withLazyLoadedSlices = () => combinedReducer;
  const initialStateCache = {};
  const inject = (slice, config = {}) => {
    const {
      reducerPath,
      reducer: reducerToInject
    } = slice;
    const currentReducer = reducerMap[reducerPath];
    if (!config.overrideExisting && currentReducer && currentReducer !== reducerToInject) {
      if (typeof process !== "undefined" && "development" === "development") {
        console.error(`called \`inject\` to override already-existing reducer ${reducerPath} without specifying \`overrideExisting: true\``);
      }
      return combinedReducer;
    }
    if (config.overrideExisting && currentReducer !== reducerToInject) {
      delete initialStateCache[reducerPath];
    }
    reducerMap[reducerPath] = reducerToInject;
    reducer = getReducer();
    return combinedReducer;
  };
  const selector = Object.assign(function makeSelector(selectorFn, selectState) {
    return function selector2(state, ...args) {
      return selectorFn(createStateProxy(selectState ? selectState(state, ...args) : state, reducerMap, initialStateCache), ...args);
    };
  }, {
    original
  });
  return Object.assign(combinedReducer, {
    inject,
    selector
  });
}

// src/formatProdErrorMessage.ts
function redux_toolkit_modern_formatProdErrorMessage(code) {
  return `Minified Redux Toolkit error #${code}; visit https://redux-toolkit.js.org/Errors?code=${code} for the full message or use the non-minified dev environment for full errors. `;
}

//# sourceMappingURL=redux-toolkit.modern.mjs.map

/***/ }),

/***/ 24128:
/***/ ((module) => {



var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];

  return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};

/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
      listeners.fn === fn &&
      (!once || listeners.once) &&
      (!context || listeners.context === context)
    ) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
        listeners[i].fn !== fn ||
        (once && !listeners[i].once) ||
        (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if ('undefined' !== "object") {
  module.exports = EventEmitter;
}


/***/ }),

/***/ 39638:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(24128);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_index_js__WEBPACK_IMPORTED_MODULE_0__);


/***/ }),

/***/ 43660:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Kq: () => (/* binding */ Provider_default)
/* harmony export */ });
/* unused harmony exports ReactReduxContext, batch, connect, createDispatchHook, createSelectorHook, createStoreHook, shallowEqual, useDispatch, useSelector, useStore */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var use_sync_external_store_with_selector_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(78418);
// src/utils/react.ts


// src/utils/react-is.ts
var IS_REACT_19 = /* @__PURE__ */ (/* unused pure expression or super */ null && (React.version.startsWith("19")));
var REACT_ELEMENT_TYPE = /* @__PURE__ */ (/* unused pure expression or super */ null && (Symbol.for(
  IS_REACT_19 ? "react.transitional.element" : "react.element"
)));
var REACT_PORTAL_TYPE = /* @__PURE__ */ (/* unused pure expression or super */ null && (Symbol.for("react.portal")));
var REACT_FRAGMENT_TYPE = /* @__PURE__ */ (/* unused pure expression or super */ null && (Symbol.for("react.fragment")));
var REACT_STRICT_MODE_TYPE = /* @__PURE__ */ (/* unused pure expression or super */ null && (Symbol.for("react.strict_mode")));
var REACT_PROFILER_TYPE = /* @__PURE__ */ (/* unused pure expression or super */ null && (Symbol.for("react.profiler")));
var REACT_CONSUMER_TYPE = /* @__PURE__ */ (/* unused pure expression or super */ null && (Symbol.for("react.consumer")));
var REACT_CONTEXT_TYPE = /* @__PURE__ */ (/* unused pure expression or super */ null && (Symbol.for("react.context")));
var REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref");
var REACT_SUSPENSE_TYPE = /* @__PURE__ */ (/* unused pure expression or super */ null && (Symbol.for("react.suspense")));
var REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ (/* unused pure expression or super */ null && (Symbol.for(
  "react.suspense_list"
)));
var REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo");
var REACT_LAZY_TYPE = /* @__PURE__ */ (/* unused pure expression or super */ null && (Symbol.for("react.lazy")));
var REACT_OFFSCREEN_TYPE = /* @__PURE__ */ (/* unused pure expression or super */ null && (Symbol.for("react.offscreen")));
var REACT_CLIENT_REFERENCE = /* @__PURE__ */ (/* unused pure expression or super */ null && (Symbol.for(
  "react.client.reference"
)));
var ForwardRef = REACT_FORWARD_REF_TYPE;
var Memo = REACT_MEMO_TYPE;
function isValidElementType(type) {
  return typeof type === "string" || typeof type === "function" || type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_OFFSCREEN_TYPE || typeof type === "object" && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_CONSUMER_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_CLIENT_REFERENCE || type.getModuleId !== void 0) ? true : false;
}
function typeOf(object) {
  if (typeof object === "object" && object !== null) {
    const { $$typeof } = object;
    switch ($$typeof) {
      case REACT_ELEMENT_TYPE:
        switch (object = object.type, object) {
          case REACT_FRAGMENT_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_SUSPENSE_TYPE:
          case REACT_SUSPENSE_LIST_TYPE:
            return object;
          default:
            switch (object = object && object.$$typeof, object) {
              case REACT_CONTEXT_TYPE:
              case REACT_FORWARD_REF_TYPE:
              case REACT_LAZY_TYPE:
              case REACT_MEMO_TYPE:
                return object;
              case REACT_CONSUMER_TYPE:
                return object;
              default:
                return $$typeof;
            }
        }
      case REACT_PORTAL_TYPE:
        return $$typeof;
    }
  }
}
function isContextConsumer(object) {
  return IS_REACT_19 ? typeOf(object) === REACT_CONSUMER_TYPE : typeOf(object) === REACT_CONTEXT_TYPE;
}
function isMemo(object) {
  return typeOf(object) === REACT_MEMO_TYPE;
}

// src/utils/warning.ts
function warning(message) {
  if (typeof console !== "undefined" && typeof console.error === "function") {
    console.error(message);
  }
  try {
    throw new Error(message);
  } catch (e) {
  }
}

// src/connect/verifySubselectors.ts
function verify(selector, methodName) {
  if (!selector) {
    throw new Error(`Unexpected value for ${methodName} in connect.`);
  } else if (methodName === "mapStateToProps" || methodName === "mapDispatchToProps") {
    if (!Object.prototype.hasOwnProperty.call(selector, "dependsOnOwnProps")) {
      warning(
        `The selector for ${methodName} of connect did not specify a value for dependsOnOwnProps.`
      );
    }
  }
}
function verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps) {
  verify(mapStateToProps, "mapStateToProps");
  verify(mapDispatchToProps, "mapDispatchToProps");
  verify(mergeProps, "mergeProps");
}

// src/connect/selectorFactory.ts
function pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, {
  areStatesEqual,
  areOwnPropsEqual,
  areStatePropsEqual
}) {
  let hasRunAtLeastOnce = false;
  let state;
  let ownProps;
  let stateProps;
  let dispatchProps;
  let mergedProps;
  function handleFirstCall(firstState, firstOwnProps) {
    state = firstState;
    ownProps = firstOwnProps;
    stateProps = mapStateToProps(state, ownProps);
    dispatchProps = mapDispatchToProps(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    hasRunAtLeastOnce = true;
    return mergedProps;
  }
  function handleNewPropsAndNewState() {
    stateProps = mapStateToProps(state, ownProps);
    if (mapDispatchToProps.dependsOnOwnProps)
      dispatchProps = mapDispatchToProps(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }
  function handleNewProps() {
    if (mapStateToProps.dependsOnOwnProps)
      stateProps = mapStateToProps(state, ownProps);
    if (mapDispatchToProps.dependsOnOwnProps)
      dispatchProps = mapDispatchToProps(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }
  function handleNewState() {
    const nextStateProps = mapStateToProps(state, ownProps);
    const statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
    stateProps = nextStateProps;
    if (statePropsChanged)
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }
  function handleSubsequentCalls(nextState, nextOwnProps) {
    const propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
    const stateChanged = !areStatesEqual(
      nextState,
      state,
      nextOwnProps,
      ownProps
    );
    state = nextState;
    ownProps = nextOwnProps;
    if (propsChanged && stateChanged) return handleNewPropsAndNewState();
    if (propsChanged) return handleNewProps();
    if (stateChanged) return handleNewState();
    return mergedProps;
  }
  return function pureFinalPropsSelector(nextState, nextOwnProps) {
    return hasRunAtLeastOnce ? handleSubsequentCalls(nextState, nextOwnProps) : handleFirstCall(nextState, nextOwnProps);
  };
}
function finalPropsSelectorFactory(dispatch, {
  initMapStateToProps,
  initMapDispatchToProps,
  initMergeProps,
  ...options
}) {
  const mapStateToProps = initMapStateToProps(dispatch, options);
  const mapDispatchToProps = initMapDispatchToProps(dispatch, options);
  const mergeProps = initMergeProps(dispatch, options);
  if (true) {
    verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps);
  }
  return pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
}

// src/utils/bindActionCreators.ts
function bindActionCreators(actionCreators, dispatch) {
  const boundActionCreators = {};
  for (const key in actionCreators) {
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === "function") {
      boundActionCreators[key] = (...args) => dispatch(actionCreator(...args));
    }
  }
  return boundActionCreators;
}

// src/utils/isPlainObject.ts
function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null) return false;
  const proto = Object.getPrototypeOf(obj);
  if (proto === null) return true;
  let baseProto = proto;
  while (Object.getPrototypeOf(baseProto) !== null) {
    baseProto = Object.getPrototypeOf(baseProto);
  }
  return proto === baseProto;
}

// src/utils/verifyPlainObject.ts
function verifyPlainObject(value, displayName, methodName) {
  if (!isPlainObject(value)) {
    warning(
      `${methodName}() in ${displayName} must return a plain object. Instead received ${value}.`
    );
  }
}

// src/connect/wrapMapToProps.ts
function wrapMapToPropsConstant(getConstant) {
  return function initConstantSelector(dispatch) {
    const constant = getConstant(dispatch);
    function constantSelector() {
      return constant;
    }
    constantSelector.dependsOnOwnProps = false;
    return constantSelector;
  };
}
function getDependsOnOwnProps(mapToProps) {
  return mapToProps.dependsOnOwnProps ? Boolean(mapToProps.dependsOnOwnProps) : mapToProps.length !== 1;
}
function wrapMapToPropsFunc(mapToProps, methodName) {
  return function initProxySelector(dispatch, { displayName }) {
    const proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
      return proxy.dependsOnOwnProps ? proxy.mapToProps(stateOrDispatch, ownProps) : proxy.mapToProps(stateOrDispatch, void 0);
    };
    proxy.dependsOnOwnProps = true;
    proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
      proxy.mapToProps = mapToProps;
      proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);
      let props = proxy(stateOrDispatch, ownProps);
      if (typeof props === "function") {
        proxy.mapToProps = props;
        proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
        props = proxy(stateOrDispatch, ownProps);
      }
      if (true)
        verifyPlainObject(props, displayName, methodName);
      return props;
    };
    return proxy;
  };
}

// src/connect/invalidArgFactory.ts
function createInvalidArgFactory(arg, name) {
  return (dispatch, options) => {
    throw new Error(
      `Invalid value of type ${typeof arg} for ${name} argument when connecting component ${options.wrappedComponentName}.`
    );
  };
}

// src/connect/mapDispatchToProps.ts
function mapDispatchToPropsFactory(mapDispatchToProps) {
  return mapDispatchToProps && typeof mapDispatchToProps === "object" ? wrapMapToPropsConstant(
    (dispatch) => (
      // @ts-ignore
      bindActionCreators(mapDispatchToProps, dispatch)
    )
  ) : !mapDispatchToProps ? wrapMapToPropsConstant((dispatch) => ({
    dispatch
  })) : typeof mapDispatchToProps === "function" ? (
    // @ts-ignore
    wrapMapToPropsFunc(mapDispatchToProps, "mapDispatchToProps")
  ) : createInvalidArgFactory(mapDispatchToProps, "mapDispatchToProps");
}

// src/connect/mapStateToProps.ts
function mapStateToPropsFactory(mapStateToProps) {
  return !mapStateToProps ? wrapMapToPropsConstant(() => ({})) : typeof mapStateToProps === "function" ? (
    // @ts-ignore
    wrapMapToPropsFunc(mapStateToProps, "mapStateToProps")
  ) : createInvalidArgFactory(mapStateToProps, "mapStateToProps");
}

// src/connect/mergeProps.ts
function defaultMergeProps(stateProps, dispatchProps, ownProps) {
  return { ...ownProps, ...stateProps, ...dispatchProps };
}
function wrapMergePropsFunc(mergeProps) {
  return function initMergePropsProxy(dispatch, { displayName, areMergedPropsEqual }) {
    let hasRunOnce = false;
    let mergedProps;
    return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
      const nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      if (hasRunOnce) {
        if (!areMergedPropsEqual(nextMergedProps, mergedProps))
          mergedProps = nextMergedProps;
      } else {
        hasRunOnce = true;
        mergedProps = nextMergedProps;
        if (true)
          verifyPlainObject(mergedProps, displayName, "mergeProps");
      }
      return mergedProps;
    };
  };
}
function mergePropsFactory(mergeProps) {
  return !mergeProps ? () => defaultMergeProps : typeof mergeProps === "function" ? wrapMergePropsFunc(mergeProps) : createInvalidArgFactory(mergeProps, "mergeProps");
}

// src/utils/batch.ts
function defaultNoopBatch(callback) {
  callback();
}

// src/utils/Subscription.ts
function createListenerCollection() {
  let first = null;
  let last = null;
  return {
    clear() {
      first = null;
      last = null;
    },
    notify() {
      defaultNoopBatch(() => {
        let listener = first;
        while (listener) {
          listener.callback();
          listener = listener.next;
        }
      });
    },
    get() {
      const listeners = [];
      let listener = first;
      while (listener) {
        listeners.push(listener);
        listener = listener.next;
      }
      return listeners;
    },
    subscribe(callback) {
      let isSubscribed = true;
      const listener = last = {
        callback,
        next: null,
        prev: last
      };
      if (listener.prev) {
        listener.prev.next = listener;
      } else {
        first = listener;
      }
      return function unsubscribe() {
        if (!isSubscribed || first === null) return;
        isSubscribed = false;
        if (listener.next) {
          listener.next.prev = listener.prev;
        } else {
          last = listener.prev;
        }
        if (listener.prev) {
          listener.prev.next = listener.next;
        } else {
          first = listener.next;
        }
      };
    }
  };
}
var nullListeners = {
  notify() {
  },
  get: () => []
};
function createSubscription(store, parentSub) {
  let unsubscribe;
  let listeners = nullListeners;
  let subscriptionsAmount = 0;
  let selfSubscribed = false;
  function addNestedSub(listener) {
    trySubscribe();
    const cleanupListener = listeners.subscribe(listener);
    let removed = false;
    return () => {
      if (!removed) {
        removed = true;
        cleanupListener();
        tryUnsubscribe();
      }
    };
  }
  function notifyNestedSubs() {
    listeners.notify();
  }
  function handleChangeWrapper() {
    if (subscription.onStateChange) {
      subscription.onStateChange();
    }
  }
  function isSubscribed() {
    return selfSubscribed;
  }
  function trySubscribe() {
    subscriptionsAmount++;
    if (!unsubscribe) {
      unsubscribe = parentSub ? parentSub.addNestedSub(handleChangeWrapper) : store.subscribe(handleChangeWrapper);
      listeners = createListenerCollection();
    }
  }
  function tryUnsubscribe() {
    subscriptionsAmount--;
    if (unsubscribe && subscriptionsAmount === 0) {
      unsubscribe();
      unsubscribe = void 0;
      listeners.clear();
      listeners = nullListeners;
    }
  }
  function trySubscribeSelf() {
    if (!selfSubscribed) {
      selfSubscribed = true;
      trySubscribe();
    }
  }
  function tryUnsubscribeSelf() {
    if (selfSubscribed) {
      selfSubscribed = false;
      tryUnsubscribe();
    }
  }
  const subscription = {
    addNestedSub,
    notifyNestedSubs,
    handleChangeWrapper,
    isSubscribed,
    trySubscribe: trySubscribeSelf,
    tryUnsubscribe: tryUnsubscribeSelf,
    getListeners: () => listeners
  };
  return subscription;
}

// src/utils/useIsomorphicLayoutEffect.ts
var canUseDOM = () => !!(typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined");
var isDOM = /* @__PURE__ */ canUseDOM();
var isRunningInReactNative = () => typeof navigator !== "undefined" && navigator.product === "ReactNative";
var isReactNative = /* @__PURE__ */ isRunningInReactNative();
var getUseIsomorphicLayoutEffect = () => isDOM || isReactNative ? react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect : react__WEBPACK_IMPORTED_MODULE_0__.useEffect;
var useIsomorphicLayoutEffect = /* @__PURE__ */ getUseIsomorphicLayoutEffect();

// src/utils/shallowEqual.ts
function is(x, y) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}
function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true;
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }
  return true;
}

// src/utils/hoistStatics.ts
var REACT_STATICS = {
  childContextTypes: true,
  contextType: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  getDerivedStateFromError: true,
  getDerivedStateFromProps: true,
  mixins: true,
  propTypes: true,
  type: true
};
var KNOWN_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  callee: true,
  arguments: true,
  arity: true
};
var FORWARD_REF_STATICS = {
  $$typeof: true,
  render: true,
  defaultProps: true,
  displayName: true,
  propTypes: true
};
var MEMO_STATICS = {
  $$typeof: true,
  compare: true,
  defaultProps: true,
  displayName: true,
  propTypes: true,
  type: true
};
var TYPE_STATICS = {
  [ForwardRef]: FORWARD_REF_STATICS,
  [Memo]: MEMO_STATICS
};
function getStatics(component) {
  if (isMemo(component)) {
    return MEMO_STATICS;
  }
  return TYPE_STATICS[component["$$typeof"]] || REACT_STATICS;
}
var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = Object.prototype;
function hoistNonReactStatics(targetComponent, sourceComponent) {
  if (typeof sourceComponent !== "string") {
    if (objectPrototype) {
      const inheritedComponent = getPrototypeOf(sourceComponent);
      if (inheritedComponent && inheritedComponent !== objectPrototype) {
        hoistNonReactStatics(targetComponent, inheritedComponent);
      }
    }
    let keys = getOwnPropertyNames(sourceComponent);
    if (getOwnPropertySymbols) {
      keys = keys.concat(getOwnPropertySymbols(sourceComponent));
    }
    const targetStatics = getStatics(targetComponent);
    const sourceStatics = getStatics(sourceComponent);
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];
      if (!KNOWN_STATICS[key] && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
        const descriptor = getOwnPropertyDescriptor(sourceComponent, key);
        try {
          defineProperty(targetComponent, key, descriptor);
        } catch (e) {
        }
      }
    }
  }
  return targetComponent;
}

// src/components/Context.ts
var ContextKey = /* @__PURE__ */ Symbol.for(`react-redux-context`);
var gT = typeof globalThis !== "undefined" ? globalThis : (
  /* fall back to a per-module scope (pre-8.1 behaviour) if `globalThis` is not available */
  {}
);
function getContext() {
  if (!react__WEBPACK_IMPORTED_MODULE_0__.createContext) return {};
  const contextMap = gT[ContextKey] ??= /* @__PURE__ */ new Map();
  let realContext = contextMap.get(react__WEBPACK_IMPORTED_MODULE_0__.createContext);
  if (!realContext) {
    realContext = react__WEBPACK_IMPORTED_MODULE_0__.createContext(
      null
    );
    if (true) {
      realContext.displayName = "ReactRedux";
    }
    contextMap.set(react__WEBPACK_IMPORTED_MODULE_0__.createContext, realContext);
  }
  return realContext;
}
var ReactReduxContext = /* @__PURE__ */ getContext();

// src/components/connect.tsx
var NO_SUBSCRIPTION_ARRAY = (/* unused pure expression or super */ null && ([null, null]));
var stringifyComponent = (Comp) => {
  try {
    return JSON.stringify(Comp);
  } catch (err) {
    return String(Comp);
  }
};
function useIsomorphicLayoutEffectWithArgs(effectFunc, effectArgs, dependencies) {
  useIsomorphicLayoutEffect(() => effectFunc(...effectArgs), dependencies);
}
function captureWrapperProps(lastWrapperProps, lastChildProps, renderIsScheduled, wrapperProps, childPropsFromStoreUpdate, notifyNestedSubs) {
  lastWrapperProps.current = wrapperProps;
  renderIsScheduled.current = false;
  if (childPropsFromStoreUpdate.current) {
    childPropsFromStoreUpdate.current = null;
    notifyNestedSubs();
  }
}
function subscribeUpdates(shouldHandleStateChanges, store, subscription, childPropsSelector, lastWrapperProps, lastChildProps, renderIsScheduled, isMounted, childPropsFromStoreUpdate, notifyNestedSubs, additionalSubscribeListener) {
  if (!shouldHandleStateChanges) return () => {
  };
  let didUnsubscribe = false;
  let lastThrownError = null;
  const checkForUpdates = () => {
    if (didUnsubscribe || !isMounted.current) {
      return;
    }
    const latestStoreState = store.getState();
    let newChildProps, error;
    try {
      newChildProps = childPropsSelector(
        latestStoreState,
        lastWrapperProps.current
      );
    } catch (e) {
      error = e;
      lastThrownError = e;
    }
    if (!error) {
      lastThrownError = null;
    }
    if (newChildProps === lastChildProps.current) {
      if (!renderIsScheduled.current) {
        notifyNestedSubs();
      }
    } else {
      lastChildProps.current = newChildProps;
      childPropsFromStoreUpdate.current = newChildProps;
      renderIsScheduled.current = true;
      additionalSubscribeListener();
    }
  };
  subscription.onStateChange = checkForUpdates;
  subscription.trySubscribe();
  checkForUpdates();
  const unsubscribeWrapper = () => {
    didUnsubscribe = true;
    subscription.tryUnsubscribe();
    subscription.onStateChange = null;
    if (lastThrownError) {
      throw lastThrownError;
    }
  };
  return unsubscribeWrapper;
}
function strictEqual(a, b) {
  return a === b;
}
var hasWarnedAboutDeprecatedPureOption = false;
function connect(mapStateToProps, mapDispatchToProps, mergeProps, {
  // The `pure` option has been removed, so TS doesn't like us destructuring this to check its existence.
  // @ts-ignore
  pure,
  areStatesEqual = strictEqual,
  areOwnPropsEqual = shallowEqual,
  areStatePropsEqual = shallowEqual,
  areMergedPropsEqual = shallowEqual,
  // use React's forwardRef to expose a ref of the wrapped component
  forwardRef = false,
  // the context consumer to use
  context = ReactReduxContext
} = {}) {
  if (true) {
    if (pure !== void 0 && !hasWarnedAboutDeprecatedPureOption) {
      hasWarnedAboutDeprecatedPureOption = true;
      warning(
        'The `pure` option has been removed. `connect` is now always a "pure/memoized" component'
      );
    }
  }
  const Context = context;
  const initMapStateToProps = mapStateToPropsFactory(mapStateToProps);
  const initMapDispatchToProps = mapDispatchToPropsFactory(mapDispatchToProps);
  const initMergeProps = mergePropsFactory(mergeProps);
  const shouldHandleStateChanges = Boolean(mapStateToProps);
  const wrapWithConnect = (WrappedComponent) => {
    if (true) {
      const isValid = /* @__PURE__ */ isValidElementType(WrappedComponent);
      if (!isValid)
        throw new Error(
          `You must pass a component to the function returned by connect. Instead received ${stringifyComponent(
            WrappedComponent
          )}`
        );
    }
    const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || "Component";
    const displayName = `Connect(${wrappedComponentName})`;
    const selectorFactoryOptions = {
      shouldHandleStateChanges,
      displayName,
      wrappedComponentName,
      WrappedComponent,
      // @ts-ignore
      initMapStateToProps,
      initMapDispatchToProps,
      initMergeProps,
      areStatesEqual,
      areStatePropsEqual,
      areOwnPropsEqual,
      areMergedPropsEqual
    };
    function ConnectFunction(props) {
      const [propsContext, reactReduxForwardedRef, wrapperProps] = React.useMemo(() => {
        const { reactReduxForwardedRef: reactReduxForwardedRef2, ...wrapperProps2 } = props;
        return [props.context, reactReduxForwardedRef2, wrapperProps2];
      }, [props]);
      const ContextToUse = React.useMemo(() => {
        let ResultContext = Context;
        if (propsContext?.Consumer) {
          if (true) {
            const isValid = /* @__PURE__ */ isContextConsumer(
              // @ts-ignore
              /* @__PURE__ */ React.createElement(propsContext.Consumer, null)
            );
            if (!isValid) {
              throw new Error(
                "You must pass a valid React context consumer as `props.context`"
              );
            }
            ResultContext = propsContext;
          }
        }
        return ResultContext;
      }, [propsContext, Context]);
      const contextValue = React.useContext(ContextToUse);
      const didStoreComeFromProps = Boolean(props.store) && Boolean(props.store.getState) && Boolean(props.store.dispatch);
      const didStoreComeFromContext = Boolean(contextValue) && Boolean(contextValue.store);
      if ( true && !didStoreComeFromProps && !didStoreComeFromContext) {
        throw new Error(
          `Could not find "store" in the context of "${displayName}". Either wrap the root component in a <Provider>, or pass a custom React context provider to <Provider> and the corresponding React context consumer to ${displayName} in connect options.`
        );
      }
      const store = didStoreComeFromProps ? props.store : contextValue.store;
      const getServerState = didStoreComeFromContext ? contextValue.getServerState : store.getState;
      const childPropsSelector = React.useMemo(() => {
        return finalPropsSelectorFactory(store.dispatch, selectorFactoryOptions);
      }, [store]);
      const [subscription, notifyNestedSubs] = React.useMemo(() => {
        if (!shouldHandleStateChanges) return NO_SUBSCRIPTION_ARRAY;
        const subscription2 = createSubscription(
          store,
          didStoreComeFromProps ? void 0 : contextValue.subscription
        );
        const notifyNestedSubs2 = subscription2.notifyNestedSubs.bind(subscription2);
        return [subscription2, notifyNestedSubs2];
      }, [store, didStoreComeFromProps, contextValue]);
      const overriddenContextValue = React.useMemo(() => {
        if (didStoreComeFromProps) {
          return contextValue;
        }
        return {
          ...contextValue,
          subscription
        };
      }, [didStoreComeFromProps, contextValue, subscription]);
      const lastChildProps = React.useRef(void 0);
      const lastWrapperProps = React.useRef(wrapperProps);
      const childPropsFromStoreUpdate = React.useRef(void 0);
      const renderIsScheduled = React.useRef(false);
      const isMounted = React.useRef(false);
      const latestSubscriptionCallbackError = React.useRef(
        void 0
      );
      useIsomorphicLayoutEffect(() => {
        isMounted.current = true;
        return () => {
          isMounted.current = false;
        };
      }, []);
      const actualChildPropsSelector = React.useMemo(() => {
        const selector = () => {
          if (childPropsFromStoreUpdate.current && wrapperProps === lastWrapperProps.current) {
            return childPropsFromStoreUpdate.current;
          }
          return childPropsSelector(store.getState(), wrapperProps);
        };
        return selector;
      }, [store, wrapperProps]);
      const subscribeForReact = React.useMemo(() => {
        const subscribe = (reactListener) => {
          if (!subscription) {
            return () => {
            };
          }
          return subscribeUpdates(
            shouldHandleStateChanges,
            store,
            subscription,
            // @ts-ignore
            childPropsSelector,
            lastWrapperProps,
            lastChildProps,
            renderIsScheduled,
            isMounted,
            childPropsFromStoreUpdate,
            notifyNestedSubs,
            reactListener
          );
        };
        return subscribe;
      }, [subscription]);
      useIsomorphicLayoutEffectWithArgs(captureWrapperProps, [
        lastWrapperProps,
        lastChildProps,
        renderIsScheduled,
        wrapperProps,
        childPropsFromStoreUpdate,
        notifyNestedSubs
      ]);
      let actualChildProps;
      try {
        actualChildProps = React.useSyncExternalStore(
          // TODO We're passing through a big wrapper that does a bunch of extra side effects besides subscribing
          subscribeForReact,
          // TODO This is incredibly hacky. We've already processed the store update and calculated new child props,
          // TODO and we're just passing that through so it triggers a re-render for us rather than relying on `uSES`.
          actualChildPropsSelector,
          getServerState ? () => childPropsSelector(getServerState(), wrapperProps) : actualChildPropsSelector
        );
      } catch (err) {
        if (latestSubscriptionCallbackError.current) {
          ;
          err.message += `
The error may be correlated with this previous error:
${latestSubscriptionCallbackError.current.stack}

`;
        }
        throw err;
      }
      useIsomorphicLayoutEffect(() => {
        latestSubscriptionCallbackError.current = void 0;
        childPropsFromStoreUpdate.current = void 0;
        lastChildProps.current = actualChildProps;
      });
      const renderedWrappedComponent = React.useMemo(() => {
        return (
          // @ts-ignore
          /* @__PURE__ */ React.createElement(
            WrappedComponent,
            {
              ...actualChildProps,
              ref: reactReduxForwardedRef
            }
          )
        );
      }, [reactReduxForwardedRef, WrappedComponent, actualChildProps]);
      const renderedChild = React.useMemo(() => {
        if (shouldHandleStateChanges) {
          return /* @__PURE__ */ React.createElement(ContextToUse.Provider, { value: overriddenContextValue }, renderedWrappedComponent);
        }
        return renderedWrappedComponent;
      }, [ContextToUse, renderedWrappedComponent, overriddenContextValue]);
      return renderedChild;
    }
    const _Connect = React.memo(ConnectFunction);
    const Connect = _Connect;
    Connect.WrappedComponent = WrappedComponent;
    Connect.displayName = ConnectFunction.displayName = displayName;
    if (forwardRef) {
      const _forwarded = React.forwardRef(
        function forwardConnectRef(props, ref) {
          return /* @__PURE__ */ React.createElement(Connect, { ...props, reactReduxForwardedRef: ref });
        }
      );
      const forwarded = _forwarded;
      forwarded.displayName = displayName;
      forwarded.WrappedComponent = WrappedComponent;
      return /* @__PURE__ */ hoistNonReactStatics(forwarded, WrappedComponent);
    }
    return /* @__PURE__ */ hoistNonReactStatics(Connect, WrappedComponent);
  };
  return wrapWithConnect;
}
var connect_default = (/* unused pure expression or super */ null && (connect));

// src/components/Provider.tsx
function Provider(providerProps) {
  const { children, context, serverState, store } = providerProps;
  const contextValue = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => {
    const subscription = createSubscription(store);
    const baseContextValue = {
      store,
      subscription,
      getServerState: serverState ? () => serverState : void 0
    };
    if (false) // removed by dead control flow
{} else {
      const { identityFunctionCheck = "once", stabilityCheck = "once" } = providerProps;
      return /* @__PURE__ */ Object.assign(baseContextValue, {
        stabilityCheck,
        identityFunctionCheck
      });
    }
  }, [store, serverState]);
  const previousState = react__WEBPACK_IMPORTED_MODULE_0__.useMemo(() => store.getState(), [store]);
  useIsomorphicLayoutEffect(() => {
    const { subscription } = contextValue;
    subscription.onStateChange = subscription.notifyNestedSubs;
    subscription.trySubscribe();
    if (previousState !== store.getState()) {
      subscription.notifyNestedSubs();
    }
    return () => {
      subscription.tryUnsubscribe();
      subscription.onStateChange = void 0;
    };
  }, [contextValue, previousState]);
  const Context = context || ReactReduxContext;
  return /* @__PURE__ */ react__WEBPACK_IMPORTED_MODULE_0__.createElement(Context.Provider, { value: contextValue }, children);
}
var Provider_default = Provider;

// src/hooks/useReduxContext.ts
function createReduxContextHook(context = ReactReduxContext) {
  return function useReduxContext2() {
    const contextValue = React.useContext(context);
    if ( true && !contextValue) {
      throw new Error(
        "could not find react-redux context value; please ensure the component is wrapped in a <Provider>"
      );
    }
    return contextValue;
  };
}
var useReduxContext = /* @__PURE__ */ (/* unused pure expression or super */ null && (createReduxContextHook()));

// src/hooks/useStore.ts
function createStoreHook(context = ReactReduxContext) {
  const useReduxContext2 = context === ReactReduxContext ? useReduxContext : (
    // @ts-ignore
    createReduxContextHook(context)
  );
  const useStore2 = () => {
    const { store } = useReduxContext2();
    return store;
  };
  Object.assign(useStore2, {
    withTypes: () => useStore2
  });
  return useStore2;
}
var useStore = /* @__PURE__ */ (/* unused pure expression or super */ null && (createStoreHook()));

// src/hooks/useDispatch.ts
function createDispatchHook(context = ReactReduxContext) {
  const useStore2 = context === ReactReduxContext ? useStore : createStoreHook(context);
  const useDispatch2 = () => {
    const store = useStore2();
    return store.dispatch;
  };
  Object.assign(useDispatch2, {
    withTypes: () => useDispatch2
  });
  return useDispatch2;
}
var useDispatch = /* @__PURE__ */ (/* unused pure expression or super */ null && (createDispatchHook()));

// src/hooks/useSelector.ts

var refEquality = (a, b) => a === b;
function createSelectorHook(context = ReactReduxContext) {
  const useReduxContext2 = context === ReactReduxContext ? useReduxContext : createReduxContextHook(context);
  const useSelector2 = (selector, equalityFnOrOptions = {}) => {
    const { equalityFn = refEquality } = typeof equalityFnOrOptions === "function" ? { equalityFn: equalityFnOrOptions } : equalityFnOrOptions;
    if (true) {
      if (!selector) {
        throw new Error(`You must pass a selector to useSelector`);
      }
      if (typeof selector !== "function") {
        throw new Error(`You must pass a function as a selector to useSelector`);
      }
      if (typeof equalityFn !== "function") {
        throw new Error(
          `You must pass a function as an equality function to useSelector`
        );
      }
    }
    const reduxContext = useReduxContext2();
    const { store, subscription, getServerState } = reduxContext;
    const firstRun = React.useRef(true);
    const wrappedSelector = React.useCallback(
      {
        [selector.name](state) {
          const selected = selector(state);
          if (true) {
            const { devModeChecks = {} } = typeof equalityFnOrOptions === "function" ? {} : equalityFnOrOptions;
            const { identityFunctionCheck, stabilityCheck } = reduxContext;
            const {
              identityFunctionCheck: finalIdentityFunctionCheck,
              stabilityCheck: finalStabilityCheck
            } = {
              stabilityCheck,
              identityFunctionCheck,
              ...devModeChecks
            };
            if (finalStabilityCheck === "always" || finalStabilityCheck === "once" && firstRun.current) {
              const toCompare = selector(state);
              if (!equalityFn(selected, toCompare)) {
                let stack = void 0;
                try {
                  throw new Error();
                } catch (e) {
                  ;
                  ({ stack } = e);
                }
                console.warn(
                  "Selector " + (selector.name || "unknown") + " returned a different result when called with the same parameters. This can lead to unnecessary rerenders.\nSelectors that return a new reference (such as an object or an array) should be memoized: https://redux.js.org/usage/deriving-data-selectors#optimizing-selectors-with-memoization",
                  {
                    state,
                    selected,
                    selected2: toCompare,
                    stack
                  }
                );
              }
            }
            if (finalIdentityFunctionCheck === "always" || finalIdentityFunctionCheck === "once" && firstRun.current) {
              if (selected === state) {
                let stack = void 0;
                try {
                  throw new Error();
                } catch (e) {
                  ;
                  ({ stack } = e);
                }
                console.warn(
                  "Selector " + (selector.name || "unknown") + " returned the root state when called. This can lead to unnecessary rerenders.\nSelectors that return the entire state are almost certainly a mistake, as they will cause a rerender whenever *anything* in state changes.",
                  { stack }
                );
              }
            }
            if (firstRun.current) firstRun.current = false;
          }
          return selected;
        }
      }[selector.name],
      [selector]
    );
    const selectedState = useSyncExternalStoreWithSelector(
      subscription.addNestedSub,
      store.getState,
      getServerState || store.getState,
      wrappedSelector,
      equalityFn
    );
    React.useDebugValue(selectedState);
    return selectedState;
  };
  Object.assign(useSelector2, {
    withTypes: () => useSelector2
  });
  return useSelector2;
}
var useSelector = /* @__PURE__ */ (/* unused pure expression or super */ null && (createSelectorHook()));

// src/exports.ts
var batch = (/* unused pure expression or super */ null && (defaultNoopBatch));

//# sourceMappingURL=react-redux.mjs.map

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi0xZjA1ZjUzYi4wY2UxZTkyMjMxNzQ1YWE2OTI3ZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBLGtDQUFrQyxPQUFPLHlDQUF5QyxNQUFNO0FBQ3hGOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsK0JBQStCO0FBQ3RELDZCQUE2QiwrQkFBK0I7QUFDNUQsNkRBQTZELGVBQWU7QUFDNUU7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxJQUFxQztBQUMzQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsTUFBcUMsR0FBRyxDQUF5QixzRUFBc0UsZ0JBQWdCO0FBQzNLO0FBQ0E7QUFDQSxvQkFBb0IsTUFBcUMsR0FBRyxDQUF5QjtBQUNyRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixNQUFxQyxHQUFHLENBQXlCLGtFQUFrRSxpQkFBaUI7QUFDMUs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixNQUFxQyxHQUFHLENBQXlCO0FBQ3ZGO0FBQ0E7QUFDQTtBQUNB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLE1BQU0sSUFBSTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDeUU7QUFDekUsbUJBQW1CLHdEQUFRO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDaUU7QUFDakU7QUFDQTtBQUNBLE1BQU0sS0FBcUM7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGNBQWM7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsWUFBWTtBQUN4RCxJQUFJO0FBQ0o7QUFDQTtBQUNBLDRCQUE0QixZQUFZO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsTUFBTSxJQUFxQztBQUMzQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLFdBQVcsUUFBUSxhQUFhLCtDQUErQyxNQUFNO0FBQzlGO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0QsYUFBYTtBQUM3RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVUsSUFBcUM7QUFDL0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLFlBQVksTUFBTSxNQUFNLHFDQUFxQyw2QkFBNkI7QUFDekg7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsNERBQTREO0FBQzVEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLGtEQUFrRCxrQ0FBa0M7QUFDcEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLFlBQVksSUFBcUM7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRUFBa0Usa0RBQXFCLEdBQUcsNENBQWU7QUFDekc7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixrQkFBa0I7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsaUJBQWlCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksc0NBQXNDO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLElBQXFDO0FBQ25ELG9CQUFvQixxQkFBcUIsaURBQWlEO0FBQzFGLG9CQUFvQix3Q0FBd0M7QUFDNUQ7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0EscUJBQXFCLFFBQVE7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBLHFCQUFxQixRQUFRO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxrQ0FBa0Msb0VBQW9COztBQUV0RDtBQUNBLFlBQVksZ0VBQWdCO0FBYTFCO0FBQ0Ysd0MiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9ub2RlX21vZHVsZXMvcmVkdXgvZGlzdC9yZWR1eC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvbm9kZV9tb2R1bGVzL3JlZHV4LXRodW5rL2Rpc3QvcmVkdXgtdGh1bmsubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL25vZGVfbW9kdWxlcy9AcmVkdXhqcy90b29sa2l0L2Rpc3QvcmVkdXgtdG9vbGtpdC5tb2Rlcm4ubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL25vZGVfbW9kdWxlcy9ldmVudGVtaXR0ZXIzL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL25vZGVfbW9kdWxlcy9ldmVudGVtaXR0ZXIzL2luZGV4Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9ub2RlX21vZHVsZXMvcmVhY3QtcmVkdXgvZGlzdC9yZWFjdC1yZWR1eC5tanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gc3JjL3V0aWxzL2Zvcm1hdFByb2RFcnJvck1lc3NhZ2UudHNcbmZ1bmN0aW9uIGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoY29kZSkge1xuICByZXR1cm4gYE1pbmlmaWVkIFJlZHV4IGVycm9yICMke2NvZGV9OyB2aXNpdCBodHRwczovL3JlZHV4LmpzLm9yZy9FcnJvcnM/Y29kZT0ke2NvZGV9IGZvciB0aGUgZnVsbCBtZXNzYWdlIG9yIHVzZSB0aGUgbm9uLW1pbmlmaWVkIGRldiBlbnZpcm9ubWVudCBmb3IgZnVsbCBlcnJvcnMuIGA7XG59XG5cbi8vIHNyYy91dGlscy9zeW1ib2wtb2JzZXJ2YWJsZS50c1xudmFyICQkb2JzZXJ2YWJsZSA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT4gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5vYnNlcnZhYmxlIHx8IFwiQEBvYnNlcnZhYmxlXCIpKCk7XG52YXIgc3ltYm9sX29ic2VydmFibGVfZGVmYXVsdCA9ICQkb2JzZXJ2YWJsZTtcblxuLy8gc3JjL3V0aWxzL2FjdGlvblR5cGVzLnRzXG52YXIgcmFuZG9tU3RyaW5nID0gKCkgPT4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpLnNwbGl0KFwiXCIpLmpvaW4oXCIuXCIpO1xudmFyIEFjdGlvblR5cGVzID0ge1xuICBJTklUOiBgQEByZWR1eC9JTklUJHsvKiBAX19QVVJFX18gKi8gcmFuZG9tU3RyaW5nKCl9YCxcbiAgUkVQTEFDRTogYEBAcmVkdXgvUkVQTEFDRSR7LyogQF9fUFVSRV9fICovIHJhbmRvbVN0cmluZygpfWAsXG4gIFBST0JFX1VOS05PV05fQUNUSU9OOiAoKSA9PiBgQEByZWR1eC9QUk9CRV9VTktOT1dOX0FDVElPTiR7cmFuZG9tU3RyaW5nKCl9YFxufTtcbnZhciBhY3Rpb25UeXBlc19kZWZhdWx0ID0gQWN0aW9uVHlwZXM7XG5cbi8vIHNyYy91dGlscy9pc1BsYWluT2JqZWN0LnRzXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuICBpZiAodHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIiB8fCBvYmogPT09IG51bGwpXG4gICAgcmV0dXJuIGZhbHNlO1xuICBsZXQgcHJvdG8gPSBvYmo7XG4gIHdoaWxlIChPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG8pICE9PSBudWxsKSB7XG4gICAgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YocHJvdG8pO1xuICB9XG4gIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSA9PT0gcHJvdG8gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikgPT09IG51bGw7XG59XG5cbi8vIHNyYy91dGlscy9raW5kT2YudHNcbmZ1bmN0aW9uIG1pbmlLaW5kT2YodmFsKSB7XG4gIGlmICh2YWwgPT09IHZvaWQgMClcbiAgICByZXR1cm4gXCJ1bmRlZmluZWRcIjtcbiAgaWYgKHZhbCA9PT0gbnVsbClcbiAgICByZXR1cm4gXCJudWxsXCI7XG4gIGNvbnN0IHR5cGUgPSB0eXBlb2YgdmFsO1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgY2FzZSBcInN5bWJvbFwiOlxuICAgIGNhc2UgXCJmdW5jdGlvblwiOiB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSlcbiAgICByZXR1cm4gXCJhcnJheVwiO1xuICBpZiAoaXNEYXRlKHZhbCkpXG4gICAgcmV0dXJuIFwiZGF0ZVwiO1xuICBpZiAoaXNFcnJvcih2YWwpKVxuICAgIHJldHVybiBcImVycm9yXCI7XG4gIGNvbnN0IGNvbnN0cnVjdG9yTmFtZSA9IGN0b3JOYW1lKHZhbCk7XG4gIHN3aXRjaCAoY29uc3RydWN0b3JOYW1lKSB7XG4gICAgY2FzZSBcIlN5bWJvbFwiOlxuICAgIGNhc2UgXCJQcm9taXNlXCI6XG4gICAgY2FzZSBcIldlYWtNYXBcIjpcbiAgICBjYXNlIFwiV2Vha1NldFwiOlxuICAgIGNhc2UgXCJNYXBcIjpcbiAgICBjYXNlIFwiU2V0XCI6XG4gICAgICByZXR1cm4gY29uc3RydWN0b3JOYW1lO1xuICB9XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsKS5zbGljZSg4LCAtMSkudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9cXHMvZywgXCJcIik7XG59XG5mdW5jdGlvbiBjdG9yTmFtZSh2YWwpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWwuY29uc3RydWN0b3IgPT09IFwiZnVuY3Rpb25cIiA/IHZhbC5jb25zdHJ1Y3Rvci5uYW1lIDogbnVsbDtcbn1cbmZ1bmN0aW9uIGlzRXJyb3IodmFsKSB7XG4gIHJldHVybiB2YWwgaW5zdGFuY2VvZiBFcnJvciB8fCB0eXBlb2YgdmFsLm1lc3NhZ2UgPT09IFwic3RyaW5nXCIgJiYgdmFsLmNvbnN0cnVjdG9yICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3Iuc3RhY2tUcmFjZUxpbWl0ID09PSBcIm51bWJlclwiO1xufVxuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRGF0ZSlcbiAgICByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIHR5cGVvZiB2YWwudG9EYXRlU3RyaW5nID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHZhbC5nZXREYXRlID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIHZhbC5zZXREYXRlID09PSBcImZ1bmN0aW9uXCI7XG59XG5mdW5jdGlvbiBraW5kT2YodmFsKSB7XG4gIGxldCB0eXBlT2ZWYWwgPSB0eXBlb2YgdmFsO1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgdHlwZU9mVmFsID0gbWluaUtpbmRPZih2YWwpO1xuICB9XG4gIHJldHVybiB0eXBlT2ZWYWw7XG59XG5cbi8vIHNyYy9jcmVhdGVTdG9yZS50c1xuZnVuY3Rpb24gY3JlYXRlU3RvcmUocmVkdWNlciwgcHJlbG9hZGVkU3RhdGUsIGVuaGFuY2VyKSB7XG4gIGlmICh0eXBlb2YgcmVkdWNlciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoMikgOiBgRXhwZWN0ZWQgdGhlIHJvb3QgcmVkdWNlciB0byBiZSBhIGZ1bmN0aW9uLiBJbnN0ZWFkLCByZWNlaXZlZDogJyR7a2luZE9mKHJlZHVjZXIpfSdgKTtcbiAgfVxuICBpZiAodHlwZW9mIHByZWxvYWRlZFN0YXRlID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGVuaGFuY2VyID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIGVuaGFuY2VyID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGFyZ3VtZW50c1szXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoMCkgOiBcIkl0IGxvb2tzIGxpa2UgeW91IGFyZSBwYXNzaW5nIHNldmVyYWwgc3RvcmUgZW5oYW5jZXJzIHRvIGNyZWF0ZVN0b3JlKCkuIFRoaXMgaXMgbm90IHN1cHBvcnRlZC4gSW5zdGVhZCwgY29tcG9zZSB0aGVtIHRvZ2V0aGVyIHRvIGEgc2luZ2xlIGZ1bmN0aW9uLiBTZWUgaHR0cHM6Ly9yZWR1eC5qcy5vcmcvdHV0b3JpYWxzL2Z1bmRhbWVudGFscy9wYXJ0LTQtc3RvcmUjY3JlYXRpbmctYS1zdG9yZS13aXRoLWVuaGFuY2VycyBmb3IgYW4gZXhhbXBsZS5cIik7XG4gIH1cbiAgaWYgKHR5cGVvZiBwcmVsb2FkZWRTdGF0ZSA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBlbmhhbmNlciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGVuaGFuY2VyID0gcHJlbG9hZGVkU3RhdGU7XG4gICAgcHJlbG9hZGVkU3RhdGUgPSB2b2lkIDA7XG4gIH1cbiAgaWYgKHR5cGVvZiBlbmhhbmNlciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGlmICh0eXBlb2YgZW5oYW5jZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoMSkgOiBgRXhwZWN0ZWQgdGhlIGVuaGFuY2VyIHRvIGJlIGEgZnVuY3Rpb24uIEluc3RlYWQsIHJlY2VpdmVkOiAnJHtraW5kT2YoZW5oYW5jZXIpfSdgKTtcbiAgICB9XG4gICAgcmV0dXJuIGVuaGFuY2VyKGNyZWF0ZVN0b3JlKShyZWR1Y2VyLCBwcmVsb2FkZWRTdGF0ZSk7XG4gIH1cbiAgbGV0IGN1cnJlbnRSZWR1Y2VyID0gcmVkdWNlcjtcbiAgbGV0IGN1cnJlbnRTdGF0ZSA9IHByZWxvYWRlZFN0YXRlO1xuICBsZXQgY3VycmVudExpc3RlbmVycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIGxldCBuZXh0TGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycztcbiAgbGV0IGxpc3RlbmVySWRDb3VudGVyID0gMDtcbiAgbGV0IGlzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcbiAgZnVuY3Rpb24gZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpIHtcbiAgICBpZiAobmV4dExpc3RlbmVycyA9PT0gY3VycmVudExpc3RlbmVycykge1xuICAgICAgbmV4dExpc3RlbmVycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgICBjdXJyZW50TGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyLCBrZXkpID0+IHtcbiAgICAgICAgbmV4dExpc3RlbmVycy5zZXQoa2V5LCBsaXN0ZW5lcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZ2V0U3RhdGUoKSB7XG4gICAgaWYgKGlzRGlzcGF0Y2hpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDMpIDogXCJZb3UgbWF5IG5vdCBjYWxsIHN0b3JlLmdldFN0YXRlKCkgd2hpbGUgdGhlIHJlZHVjZXIgaXMgZXhlY3V0aW5nLiBUaGUgcmVkdWNlciBoYXMgYWxyZWFkeSByZWNlaXZlZCB0aGUgc3RhdGUgYXMgYW4gYXJndW1lbnQuIFBhc3MgaXQgZG93biBmcm9tIHRoZSB0b3AgcmVkdWNlciBpbnN0ZWFkIG9mIHJlYWRpbmcgaXQgZnJvbSB0aGUgc3RvcmUuXCIpO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudFN0YXRlO1xuICB9XG4gIGZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcikge1xuICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoNCkgOiBgRXhwZWN0ZWQgdGhlIGxpc3RlbmVyIHRvIGJlIGEgZnVuY3Rpb24uIEluc3RlYWQsIHJlY2VpdmVkOiAnJHtraW5kT2YobGlzdGVuZXIpfSdgKTtcbiAgICB9XG4gICAgaWYgKGlzRGlzcGF0Y2hpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDUpIDogXCJZb3UgbWF5IG5vdCBjYWxsIHN0b3JlLnN1YnNjcmliZSgpIHdoaWxlIHRoZSByZWR1Y2VyIGlzIGV4ZWN1dGluZy4gSWYgeW91IHdvdWxkIGxpa2UgdG8gYmUgbm90aWZpZWQgYWZ0ZXIgdGhlIHN0b3JlIGhhcyBiZWVuIHVwZGF0ZWQsIHN1YnNjcmliZSBmcm9tIGEgY29tcG9uZW50IGFuZCBpbnZva2Ugc3RvcmUuZ2V0U3RhdGUoKSBpbiB0aGUgY2FsbGJhY2sgdG8gYWNjZXNzIHRoZSBsYXRlc3Qgc3RhdGUuIFNlZSBodHRwczovL3JlZHV4LmpzLm9yZy9hcGkvc3RvcmUjc3Vic2NyaWJlbGlzdGVuZXIgZm9yIG1vcmUgZGV0YWlscy5cIik7XG4gICAgfVxuICAgIGxldCBpc1N1YnNjcmliZWQgPSB0cnVlO1xuICAgIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKTtcbiAgICBjb25zdCBsaXN0ZW5lcklkID0gbGlzdGVuZXJJZENvdW50ZXIrKztcbiAgICBuZXh0TGlzdGVuZXJzLnNldChsaXN0ZW5lcklkLCBsaXN0ZW5lcik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHVuc3Vic2NyaWJlKCkge1xuICAgICAgaWYgKCFpc1N1YnNjcmliZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGlzRGlzcGF0Y2hpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoNikgOiBcIllvdSBtYXkgbm90IHVuc3Vic2NyaWJlIGZyb20gYSBzdG9yZSBsaXN0ZW5lciB3aGlsZSB0aGUgcmVkdWNlciBpcyBleGVjdXRpbmcuIFNlZSBodHRwczovL3JlZHV4LmpzLm9yZy9hcGkvc3RvcmUjc3Vic2NyaWJlbGlzdGVuZXIgZm9yIG1vcmUgZGV0YWlscy5cIik7XG4gICAgICB9XG4gICAgICBpc1N1YnNjcmliZWQgPSBmYWxzZTtcbiAgICAgIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKTtcbiAgICAgIG5leHRMaXN0ZW5lcnMuZGVsZXRlKGxpc3RlbmVySWQpO1xuICAgICAgY3VycmVudExpc3RlbmVycyA9IG51bGw7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkaXNwYXRjaChhY3Rpb24pIHtcbiAgICBpZiAoIWlzUGxhaW5PYmplY3QoYWN0aW9uKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoNykgOiBgQWN0aW9ucyBtdXN0IGJlIHBsYWluIG9iamVjdHMuIEluc3RlYWQsIHRoZSBhY3R1YWwgdHlwZSB3YXM6ICcke2tpbmRPZihhY3Rpb24pfScuIFlvdSBtYXkgbmVlZCB0byBhZGQgbWlkZGxld2FyZSB0byB5b3VyIHN0b3JlIHNldHVwIHRvIGhhbmRsZSBkaXNwYXRjaGluZyBvdGhlciB2YWx1ZXMsIHN1Y2ggYXMgJ3JlZHV4LXRodW5rJyB0byBoYW5kbGUgZGlzcGF0Y2hpbmcgZnVuY3Rpb25zLiBTZWUgaHR0cHM6Ly9yZWR1eC5qcy5vcmcvdHV0b3JpYWxzL2Z1bmRhbWVudGFscy9wYXJ0LTQtc3RvcmUjbWlkZGxld2FyZSBhbmQgaHR0cHM6Ly9yZWR1eC5qcy5vcmcvdHV0b3JpYWxzL2Z1bmRhbWVudGFscy9wYXJ0LTYtYXN5bmMtbG9naWMjdXNpbmctdGhlLXJlZHV4LXRodW5rLW1pZGRsZXdhcmUgZm9yIGV4YW1wbGVzLmApO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGFjdGlvbi50eXBlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSg4KSA6ICdBY3Rpb25zIG1heSBub3QgaGF2ZSBhbiB1bmRlZmluZWQgXCJ0eXBlXCIgcHJvcGVydHkuIFlvdSBtYXkgaGF2ZSBtaXNzcGVsbGVkIGFuIGFjdGlvbiB0eXBlIHN0cmluZyBjb25zdGFudC4nKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhY3Rpb24udHlwZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoMTcpIDogYEFjdGlvbiBcInR5cGVcIiBwcm9wZXJ0eSBtdXN0IGJlIGEgc3RyaW5nLiBJbnN0ZWFkLCB0aGUgYWN0dWFsIHR5cGUgd2FzOiAnJHtraW5kT2YoYWN0aW9uLnR5cGUpfScuIFZhbHVlIHdhczogJyR7YWN0aW9uLnR5cGV9JyAoc3RyaW5naWZpZWQpYCk7XG4gICAgfVxuICAgIGlmIChpc0Rpc3BhdGNoaW5nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSg5KSA6IFwiUmVkdWNlcnMgbWF5IG5vdCBkaXNwYXRjaCBhY3Rpb25zLlwiKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGlzRGlzcGF0Y2hpbmcgPSB0cnVlO1xuICAgICAgY3VycmVudFN0YXRlID0gY3VycmVudFJlZHVjZXIoY3VycmVudFN0YXRlLCBhY3Rpb24pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGxpc3RlbmVycyA9IGN1cnJlbnRMaXN0ZW5lcnMgPSBuZXh0TGlzdGVuZXJzO1xuICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIoKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYWN0aW9uO1xuICB9XG4gIGZ1bmN0aW9uIHJlcGxhY2VSZWR1Y2VyKG5leHRSZWR1Y2VyKSB7XG4gICAgaWYgKHR5cGVvZiBuZXh0UmVkdWNlciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgxMCkgOiBgRXhwZWN0ZWQgdGhlIG5leHRSZWR1Y2VyIHRvIGJlIGEgZnVuY3Rpb24uIEluc3RlYWQsIHJlY2VpdmVkOiAnJHtraW5kT2YobmV4dFJlZHVjZXIpfWApO1xuICAgIH1cbiAgICBjdXJyZW50UmVkdWNlciA9IG5leHRSZWR1Y2VyO1xuICAgIGRpc3BhdGNoKHtcbiAgICAgIHR5cGU6IGFjdGlvblR5cGVzX2RlZmF1bHQuUkVQTEFDRVxuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIG9ic2VydmFibGUoKSB7XG4gICAgY29uc3Qgb3V0ZXJTdWJzY3JpYmUgPSBzdWJzY3JpYmU7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8qKlxuICAgICAgICogVGhlIG1pbmltYWwgb2JzZXJ2YWJsZSBzdWJzY3JpcHRpb24gbWV0aG9kLlxuICAgICAgICogQHBhcmFtIG9ic2VydmVyIEFueSBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCBhcyBhbiBvYnNlcnZlci5cbiAgICAgICAqIFRoZSBvYnNlcnZlciBvYmplY3Qgc2hvdWxkIGhhdmUgYSBgbmV4dGAgbWV0aG9kLlxuICAgICAgICogQHJldHVybnMgQW4gb2JqZWN0IHdpdGggYW4gYHVuc3Vic2NyaWJlYCBtZXRob2QgdGhhdCBjYW5cbiAgICAgICAqIGJlIHVzZWQgdG8gdW5zdWJzY3JpYmUgdGhlIG9ic2VydmFibGUgZnJvbSB0aGUgc3RvcmUsIGFuZCBwcmV2ZW50IGZ1cnRoZXJcbiAgICAgICAqIGVtaXNzaW9uIG9mIHZhbHVlcyBmcm9tIHRoZSBvYnNlcnZhYmxlLlxuICAgICAgICovXG4gICAgICBzdWJzY3JpYmUob2JzZXJ2ZXIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvYnNlcnZlciAhPT0gXCJvYmplY3RcIiB8fCBvYnNlcnZlciA9PT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDExKSA6IGBFeHBlY3RlZCB0aGUgb2JzZXJ2ZXIgdG8gYmUgYW4gb2JqZWN0LiBJbnN0ZWFkLCByZWNlaXZlZDogJyR7a2luZE9mKG9ic2VydmVyKX0nYCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gb2JzZXJ2ZVN0YXRlKCkge1xuICAgICAgICAgIGNvbnN0IG9ic2VydmVyQXNPYnNlcnZlciA9IG9ic2VydmVyO1xuICAgICAgICAgIGlmIChvYnNlcnZlckFzT2JzZXJ2ZXIubmV4dCkge1xuICAgICAgICAgICAgb2JzZXJ2ZXJBc09ic2VydmVyLm5leHQoZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9ic2VydmVTdGF0ZSgpO1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZSA9IG91dGVyU3Vic2NyaWJlKG9ic2VydmVTdGF0ZSk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdW5zdWJzY3JpYmVcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgICBbc3ltYm9sX29ic2VydmFibGVfZGVmYXVsdF0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgZGlzcGF0Y2goe1xuICAgIHR5cGU6IGFjdGlvblR5cGVzX2RlZmF1bHQuSU5JVFxuICB9KTtcbiAgY29uc3Qgc3RvcmUgPSB7XG4gICAgZGlzcGF0Y2gsXG4gICAgc3Vic2NyaWJlLFxuICAgIGdldFN0YXRlLFxuICAgIHJlcGxhY2VSZWR1Y2VyLFxuICAgIFtzeW1ib2xfb2JzZXJ2YWJsZV9kZWZhdWx0XTogb2JzZXJ2YWJsZVxuICB9O1xuICByZXR1cm4gc3RvcmU7XG59XG5mdW5jdGlvbiBsZWdhY3lfY3JlYXRlU3RvcmUocmVkdWNlciwgcHJlbG9hZGVkU3RhdGUsIGVuaGFuY2VyKSB7XG4gIHJldHVybiBjcmVhdGVTdG9yZShyZWR1Y2VyLCBwcmVsb2FkZWRTdGF0ZSwgZW5oYW5jZXIpO1xufVxuXG4vLyBzcmMvdXRpbHMvd2FybmluZy50c1xuZnVuY3Rpb24gd2FybmluZyhtZXNzYWdlKSB7XG4gIGlmICh0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgY29uc29sZS5lcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgfVxuICB0cnkge1xuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgfSBjYXRjaCAoZSkge1xuICB9XG59XG5cbi8vIHNyYy9jb21iaW5lUmVkdWNlcnMudHNcbmZ1bmN0aW9uIGdldFVuZXhwZWN0ZWRTdGF0ZVNoYXBlV2FybmluZ01lc3NhZ2UoaW5wdXRTdGF0ZSwgcmVkdWNlcnMsIGFjdGlvbiwgdW5leHBlY3RlZEtleUNhY2hlKSB7XG4gIGNvbnN0IHJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMocmVkdWNlcnMpO1xuICBjb25zdCBhcmd1bWVudE5hbWUgPSBhY3Rpb24gJiYgYWN0aW9uLnR5cGUgPT09IGFjdGlvblR5cGVzX2RlZmF1bHQuSU5JVCA/IFwicHJlbG9hZGVkU3RhdGUgYXJndW1lbnQgcGFzc2VkIHRvIGNyZWF0ZVN0b3JlXCIgOiBcInByZXZpb3VzIHN0YXRlIHJlY2VpdmVkIGJ5IHRoZSByZWR1Y2VyXCI7XG4gIGlmIChyZWR1Y2VyS2V5cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gXCJTdG9yZSBkb2VzIG5vdCBoYXZlIGEgdmFsaWQgcmVkdWNlci4gTWFrZSBzdXJlIHRoZSBhcmd1bWVudCBwYXNzZWQgdG8gY29tYmluZVJlZHVjZXJzIGlzIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIHJlZHVjZXJzLlwiO1xuICB9XG4gIGlmICghaXNQbGFpbk9iamVjdChpbnB1dFN0YXRlKSkge1xuICAgIHJldHVybiBgVGhlICR7YXJndW1lbnROYW1lfSBoYXMgdW5leHBlY3RlZCB0eXBlIG9mIFwiJHtraW5kT2YoaW5wdXRTdGF0ZSl9XCIuIEV4cGVjdGVkIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcga2V5czogXCIke3JlZHVjZXJLZXlzLmpvaW4oJ1wiLCBcIicpfVwiYDtcbiAgfVxuICBjb25zdCB1bmV4cGVjdGVkS2V5cyA9IE9iamVjdC5rZXlzKGlucHV0U3RhdGUpLmZpbHRlcigoa2V5KSA9PiAhcmVkdWNlcnMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAhdW5leHBlY3RlZEtleUNhY2hlW2tleV0pO1xuICB1bmV4cGVjdGVkS2V5cy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICB1bmV4cGVjdGVkS2V5Q2FjaGVba2V5XSA9IHRydWU7XG4gIH0pO1xuICBpZiAoYWN0aW9uICYmIGFjdGlvbi50eXBlID09PSBhY3Rpb25UeXBlc19kZWZhdWx0LlJFUExBQ0UpXG4gICAgcmV0dXJuO1xuICBpZiAodW5leHBlY3RlZEtleXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBgVW5leHBlY3RlZCAke3VuZXhwZWN0ZWRLZXlzLmxlbmd0aCA+IDEgPyBcImtleXNcIiA6IFwia2V5XCJ9IFwiJHt1bmV4cGVjdGVkS2V5cy5qb2luKCdcIiwgXCInKX1cIiBmb3VuZCBpbiAke2FyZ3VtZW50TmFtZX0uIEV4cGVjdGVkIHRvIGZpbmQgb25lIG9mIHRoZSBrbm93biByZWR1Y2VyIGtleXMgaW5zdGVhZDogXCIke3JlZHVjZXJLZXlzLmpvaW4oJ1wiLCBcIicpfVwiLiBVbmV4cGVjdGVkIGtleXMgd2lsbCBiZSBpZ25vcmVkLmA7XG4gIH1cbn1cbmZ1bmN0aW9uIGFzc2VydFJlZHVjZXJTaGFwZShyZWR1Y2Vycykge1xuICBPYmplY3Qua2V5cyhyZWR1Y2VycykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgY29uc3QgcmVkdWNlciA9IHJlZHVjZXJzW2tleV07XG4gICAgY29uc3QgaW5pdGlhbFN0YXRlID0gcmVkdWNlcih2b2lkIDAsIHtcbiAgICAgIHR5cGU6IGFjdGlvblR5cGVzX2RlZmF1bHQuSU5JVFxuICAgIH0pO1xuICAgIGlmICh0eXBlb2YgaW5pdGlhbFN0YXRlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgxMikgOiBgVGhlIHNsaWNlIHJlZHVjZXIgZm9yIGtleSBcIiR7a2V5fVwiIHJldHVybmVkIHVuZGVmaW5lZCBkdXJpbmcgaW5pdGlhbGl6YXRpb24uIElmIHRoZSBzdGF0ZSBwYXNzZWQgdG8gdGhlIHJlZHVjZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCBleHBsaWNpdGx5IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZS4gVGhlIGluaXRpYWwgc3RhdGUgbWF5IG5vdCBiZSB1bmRlZmluZWQuIElmIHlvdSBkb24ndCB3YW50IHRvIHNldCBhIHZhbHVlIGZvciB0aGlzIHJlZHVjZXIsIHlvdSBjYW4gdXNlIG51bGwgaW5zdGVhZCBvZiB1bmRlZmluZWQuYCk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcmVkdWNlcih2b2lkIDAsIHtcbiAgICAgIHR5cGU6IGFjdGlvblR5cGVzX2RlZmF1bHQuUFJPQkVfVU5LTk9XTl9BQ1RJT04oKVxuICAgIH0pID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgxMykgOiBgVGhlIHNsaWNlIHJlZHVjZXIgZm9yIGtleSBcIiR7a2V5fVwiIHJldHVybmVkIHVuZGVmaW5lZCB3aGVuIHByb2JlZCB3aXRoIGEgcmFuZG9tIHR5cGUuIERvbid0IHRyeSB0byBoYW5kbGUgJyR7YWN0aW9uVHlwZXNfZGVmYXVsdC5JTklUfScgb3Igb3RoZXIgYWN0aW9ucyBpbiBcInJlZHV4LypcIiBuYW1lc3BhY2UuIFRoZXkgYXJlIGNvbnNpZGVyZWQgcHJpdmF0ZS4gSW5zdGVhZCwgeW91IG11c3QgcmV0dXJuIHRoZSBjdXJyZW50IHN0YXRlIGZvciBhbnkgdW5rbm93biBhY3Rpb25zLCB1bmxlc3MgaXQgaXMgdW5kZWZpbmVkLCBpbiB3aGljaCBjYXNlIHlvdSBtdXN0IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZSwgcmVnYXJkbGVzcyBvZiB0aGUgYWN0aW9uIHR5cGUuIFRoZSBpbml0aWFsIHN0YXRlIG1heSBub3QgYmUgdW5kZWZpbmVkLCBidXQgY2FuIGJlIG51bGwuYCk7XG4gICAgfVxuICB9KTtcbn1cbmZ1bmN0aW9uIGNvbWJpbmVSZWR1Y2VycyhyZWR1Y2Vycykge1xuICBjb25zdCByZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKHJlZHVjZXJzKTtcbiAgY29uc3QgZmluYWxSZWR1Y2VycyA9IHt9O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHJlZHVjZXJLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qga2V5ID0gcmVkdWNlcktleXNbaV07XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIikge1xuICAgICAgaWYgKHR5cGVvZiByZWR1Y2Vyc1trZXldID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHdhcm5pbmcoYE5vIHJlZHVjZXIgcHJvdmlkZWQgZm9yIGtleSBcIiR7a2V5fVwiYCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcmVkdWNlcnNba2V5XSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBmaW5hbFJlZHVjZXJzW2tleV0gPSByZWR1Y2Vyc1trZXldO1xuICAgIH1cbiAgfVxuICBjb25zdCBmaW5hbFJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMoZmluYWxSZWR1Y2Vycyk7XG4gIGxldCB1bmV4cGVjdGVkS2V5Q2FjaGU7XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIHtcbiAgICB1bmV4cGVjdGVkS2V5Q2FjaGUgPSB7fTtcbiAgfVxuICBsZXQgc2hhcGVBc3NlcnRpb25FcnJvcjtcbiAgdHJ5IHtcbiAgICBhc3NlcnRSZWR1Y2VyU2hhcGUoZmluYWxSZWR1Y2Vycyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzaGFwZUFzc2VydGlvbkVycm9yID0gZTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gY29tYmluYXRpb24oc3RhdGUgPSB7fSwgYWN0aW9uKSB7XG4gICAgaWYgKHNoYXBlQXNzZXJ0aW9uRXJyb3IpIHtcbiAgICAgIHRocm93IHNoYXBlQXNzZXJ0aW9uRXJyb3I7XG4gICAgfVxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIHtcbiAgICAgIGNvbnN0IHdhcm5pbmdNZXNzYWdlID0gZ2V0VW5leHBlY3RlZFN0YXRlU2hhcGVXYXJuaW5nTWVzc2FnZShzdGF0ZSwgZmluYWxSZWR1Y2VycywgYWN0aW9uLCB1bmV4cGVjdGVkS2V5Q2FjaGUpO1xuICAgICAgaWYgKHdhcm5pbmdNZXNzYWdlKSB7XG4gICAgICAgIHdhcm5pbmcod2FybmluZ01lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cbiAgICBsZXQgaGFzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIGNvbnN0IG5leHRTdGF0ZSA9IHt9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmluYWxSZWR1Y2VyS2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qga2V5ID0gZmluYWxSZWR1Y2VyS2V5c1tpXTtcbiAgICAgIGNvbnN0IHJlZHVjZXIgPSBmaW5hbFJlZHVjZXJzW2tleV07XG4gICAgICBjb25zdCBwcmV2aW91c1N0YXRlRm9yS2V5ID0gc3RhdGVba2V5XTtcbiAgICAgIGNvbnN0IG5leHRTdGF0ZUZvcktleSA9IHJlZHVjZXIocHJldmlvdXNTdGF0ZUZvcktleSwgYWN0aW9uKTtcbiAgICAgIGlmICh0eXBlb2YgbmV4dFN0YXRlRm9yS2V5ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGNvbnN0IGFjdGlvblR5cGUgPSBhY3Rpb24gJiYgYWN0aW9uLnR5cGU7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDE0KSA6IGBXaGVuIGNhbGxlZCB3aXRoIGFuIGFjdGlvbiBvZiB0eXBlICR7YWN0aW9uVHlwZSA/IGBcIiR7U3RyaW5nKGFjdGlvblR5cGUpfVwiYCA6IFwiKHVua25vd24gdHlwZSlcIn0sIHRoZSBzbGljZSByZWR1Y2VyIGZvciBrZXkgXCIke2tleX1cIiByZXR1cm5lZCB1bmRlZmluZWQuIFRvIGlnbm9yZSBhbiBhY3Rpb24sIHlvdSBtdXN0IGV4cGxpY2l0bHkgcmV0dXJuIHRoZSBwcmV2aW91cyBzdGF0ZS4gSWYgeW91IHdhbnQgdGhpcyByZWR1Y2VyIHRvIGhvbGQgbm8gdmFsdWUsIHlvdSBjYW4gcmV0dXJuIG51bGwgaW5zdGVhZCBvZiB1bmRlZmluZWQuYCk7XG4gICAgICB9XG4gICAgICBuZXh0U3RhdGVba2V5XSA9IG5leHRTdGF0ZUZvcktleTtcbiAgICAgIGhhc0NoYW5nZWQgPSBoYXNDaGFuZ2VkIHx8IG5leHRTdGF0ZUZvcktleSAhPT0gcHJldmlvdXNTdGF0ZUZvcktleTtcbiAgICB9XG4gICAgaGFzQ2hhbmdlZCA9IGhhc0NoYW5nZWQgfHwgZmluYWxSZWR1Y2VyS2V5cy5sZW5ndGggIT09IE9iamVjdC5rZXlzKHN0YXRlKS5sZW5ndGg7XG4gICAgcmV0dXJuIGhhc0NoYW5nZWQgPyBuZXh0U3RhdGUgOiBzdGF0ZTtcbiAgfTtcbn1cblxuLy8gc3JjL2JpbmRBY3Rpb25DcmVhdG9ycy50c1xuZnVuY3Rpb24gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvciwgZGlzcGF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2goYWN0aW9uQ3JlYXRvci5hcHBseSh0aGlzLCBhcmdzKSk7XG4gIH07XG59XG5mdW5jdGlvbiBiaW5kQWN0aW9uQ3JlYXRvcnMoYWN0aW9uQ3JlYXRvcnMsIGRpc3BhdGNoKSB7XG4gIGlmICh0eXBlb2YgYWN0aW9uQ3JlYXRvcnMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHJldHVybiBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9ycywgZGlzcGF0Y2gpO1xuICB9XG4gIGlmICh0eXBlb2YgYWN0aW9uQ3JlYXRvcnMgIT09IFwib2JqZWN0XCIgfHwgYWN0aW9uQ3JlYXRvcnMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgxNikgOiBgYmluZEFjdGlvbkNyZWF0b3JzIGV4cGVjdGVkIGFuIG9iamVjdCBvciBhIGZ1bmN0aW9uLCBidXQgaW5zdGVhZCByZWNlaXZlZDogJyR7a2luZE9mKGFjdGlvbkNyZWF0b3JzKX0nLiBEaWQgeW91IHdyaXRlIFwiaW1wb3J0IEFjdGlvbkNyZWF0b3JzIGZyb21cIiBpbnN0ZWFkIG9mIFwiaW1wb3J0ICogYXMgQWN0aW9uQ3JlYXRvcnMgZnJvbVwiP2ApO1xuICB9XG4gIGNvbnN0IGJvdW5kQWN0aW9uQ3JlYXRvcnMgPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgaW4gYWN0aW9uQ3JlYXRvcnMpIHtcbiAgICBjb25zdCBhY3Rpb25DcmVhdG9yID0gYWN0aW9uQ3JlYXRvcnNba2V5XTtcbiAgICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgYm91bmRBY3Rpb25DcmVhdG9yc1trZXldID0gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvciwgZGlzcGF0Y2gpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYm91bmRBY3Rpb25DcmVhdG9ycztcbn1cblxuLy8gc3JjL2NvbXBvc2UudHNcbmZ1bmN0aW9uIGNvbXBvc2UoLi4uZnVuY3MpIHtcbiAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAoYXJnKSA9PiBhcmc7XG4gIH1cbiAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBmdW5jc1swXTtcbiAgfVxuICByZXR1cm4gZnVuY3MucmVkdWNlKChhLCBiKSA9PiAoLi4uYXJncykgPT4gYShiKC4uLmFyZ3MpKSk7XG59XG5cbi8vIHNyYy9hcHBseU1pZGRsZXdhcmUudHNcbmZ1bmN0aW9uIGFwcGx5TWlkZGxld2FyZSguLi5taWRkbGV3YXJlcykge1xuICByZXR1cm4gKGNyZWF0ZVN0b3JlMikgPT4gKHJlZHVjZXIsIHByZWxvYWRlZFN0YXRlKSA9PiB7XG4gICAgY29uc3Qgc3RvcmUgPSBjcmVhdGVTdG9yZTIocmVkdWNlciwgcHJlbG9hZGVkU3RhdGUpO1xuICAgIGxldCBkaXNwYXRjaCA9ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDE1KSA6IFwiRGlzcGF0Y2hpbmcgd2hpbGUgY29uc3RydWN0aW5nIHlvdXIgbWlkZGxld2FyZSBpcyBub3QgYWxsb3dlZC4gT3RoZXIgbWlkZGxld2FyZSB3b3VsZCBub3QgYmUgYXBwbGllZCB0byB0aGlzIGRpc3BhdGNoLlwiKTtcbiAgICB9O1xuICAgIGNvbnN0IG1pZGRsZXdhcmVBUEkgPSB7XG4gICAgICBnZXRTdGF0ZTogc3RvcmUuZ2V0U3RhdGUsXG4gICAgICBkaXNwYXRjaDogKGFjdGlvbiwgLi4uYXJncykgPT4gZGlzcGF0Y2goYWN0aW9uLCAuLi5hcmdzKVxuICAgIH07XG4gICAgY29uc3QgY2hhaW4gPSBtaWRkbGV3YXJlcy5tYXAoKG1pZGRsZXdhcmUpID0+IG1pZGRsZXdhcmUobWlkZGxld2FyZUFQSSkpO1xuICAgIGRpc3BhdGNoID0gY29tcG9zZSguLi5jaGFpbikoc3RvcmUuZGlzcGF0Y2gpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5zdG9yZSxcbiAgICAgIGRpc3BhdGNoXG4gICAgfTtcbiAgfTtcbn1cblxuLy8gc3JjL3V0aWxzL2lzQWN0aW9uLnRzXG5mdW5jdGlvbiBpc0FjdGlvbihhY3Rpb24pIHtcbiAgcmV0dXJuIGlzUGxhaW5PYmplY3QoYWN0aW9uKSAmJiBcInR5cGVcIiBpbiBhY3Rpb24gJiYgdHlwZW9mIGFjdGlvbi50eXBlID09PSBcInN0cmluZ1wiO1xufVxuZXhwb3J0IHtcbiAgYWN0aW9uVHlwZXNfZGVmYXVsdCBhcyBfX0RPX05PVF9VU0VfX0FjdGlvblR5cGVzLFxuICBhcHBseU1pZGRsZXdhcmUsXG4gIGJpbmRBY3Rpb25DcmVhdG9ycyxcbiAgY29tYmluZVJlZHVjZXJzLFxuICBjb21wb3NlLFxuICBjcmVhdGVTdG9yZSxcbiAgaXNBY3Rpb24sXG4gIGlzUGxhaW5PYmplY3QsXG4gIGxlZ2FjeV9jcmVhdGVTdG9yZVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlZHV4Lm1qcy5tYXAiLCIvLyBzcmMvaW5kZXgudHNcbmZ1bmN0aW9uIGNyZWF0ZVRodW5rTWlkZGxld2FyZShleHRyYUFyZ3VtZW50KSB7XG4gIGNvbnN0IG1pZGRsZXdhcmUgPSAoeyBkaXNwYXRjaCwgZ2V0U3RhdGUgfSkgPT4gKG5leHQpID0+IChhY3Rpb24pID0+IHtcbiAgICBpZiAodHlwZW9mIGFjdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICByZXR1cm4gYWN0aW9uKGRpc3BhdGNoLCBnZXRTdGF0ZSwgZXh0cmFBcmd1bWVudCk7XG4gICAgfVxuICAgIHJldHVybiBuZXh0KGFjdGlvbik7XG4gIH07XG4gIHJldHVybiBtaWRkbGV3YXJlO1xufVxudmFyIHRodW5rID0gY3JlYXRlVGh1bmtNaWRkbGV3YXJlKCk7XG52YXIgd2l0aEV4dHJhQXJndW1lbnQgPSBjcmVhdGVUaHVua01pZGRsZXdhcmU7XG5leHBvcnQge1xuICB0aHVuayxcbiAgd2l0aEV4dHJhQXJndW1lbnRcbn07XG4iLCIvLyBzcmMvaW5kZXgudHNcbmV4cG9ydCAqIGZyb20gXCJyZWR1eFwiO1xuaW1wb3J0IHsgcHJvZHVjZSwgY3VycmVudCBhcyBjdXJyZW50MywgZnJlZXplLCBvcmlnaW5hbCBhcyBvcmlnaW5hbDIsIGlzRHJhZnQgYXMgaXNEcmFmdDUgfSBmcm9tIFwiaW1tZXJcIjtcbmltcG9ydCB7IGNyZWF0ZVNlbGVjdG9yLCBjcmVhdGVTZWxlY3RvckNyZWF0b3IgYXMgY3JlYXRlU2VsZWN0b3JDcmVhdG9yMiwgbHJ1TWVtb2l6ZSwgd2Vha01hcE1lbW9pemUgYXMgd2Vha01hcE1lbW9pemUyIH0gZnJvbSBcInJlc2VsZWN0XCI7XG5cbi8vIHNyYy9jcmVhdGVEcmFmdFNhZmVTZWxlY3Rvci50c1xuaW1wb3J0IHsgY3VycmVudCwgaXNEcmFmdCB9IGZyb20gXCJpbW1lclwiO1xuaW1wb3J0IHsgY3JlYXRlU2VsZWN0b3JDcmVhdG9yLCB3ZWFrTWFwTWVtb2l6ZSB9IGZyb20gXCJyZXNlbGVjdFwiO1xudmFyIGNyZWF0ZURyYWZ0U2FmZVNlbGVjdG9yQ3JlYXRvciA9ICguLi5hcmdzKSA9PiB7XG4gIGNvbnN0IGNyZWF0ZVNlbGVjdG9yMiA9IGNyZWF0ZVNlbGVjdG9yQ3JlYXRvciguLi5hcmdzKTtcbiAgY29uc3QgY3JlYXRlRHJhZnRTYWZlU2VsZWN0b3IyID0gT2JqZWN0LmFzc2lnbigoLi4uYXJnczIpID0+IHtcbiAgICBjb25zdCBzZWxlY3RvciA9IGNyZWF0ZVNlbGVjdG9yMiguLi5hcmdzMik7XG4gICAgY29uc3Qgd3JhcHBlZFNlbGVjdG9yID0gKHZhbHVlLCAuLi5yZXN0KSA9PiBzZWxlY3Rvcihpc0RyYWZ0KHZhbHVlKSA/IGN1cnJlbnQodmFsdWUpIDogdmFsdWUsIC4uLnJlc3QpO1xuICAgIE9iamVjdC5hc3NpZ24od3JhcHBlZFNlbGVjdG9yLCBzZWxlY3Rvcik7XG4gICAgcmV0dXJuIHdyYXBwZWRTZWxlY3RvcjtcbiAgfSwge1xuICAgIHdpdGhUeXBlczogKCkgPT4gY3JlYXRlRHJhZnRTYWZlU2VsZWN0b3IyXG4gIH0pO1xuICByZXR1cm4gY3JlYXRlRHJhZnRTYWZlU2VsZWN0b3IyO1xufTtcbnZhciBjcmVhdGVEcmFmdFNhZmVTZWxlY3RvciA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVEcmFmdFNhZmVTZWxlY3RvckNyZWF0b3Iod2Vha01hcE1lbW9pemUpO1xuXG4vLyBzcmMvY29uZmlndXJlU3RvcmUudHNcbmltcG9ydCB7IGFwcGx5TWlkZGxld2FyZSwgY3JlYXRlU3RvcmUsIGNvbXBvc2UgYXMgY29tcG9zZTIsIGNvbWJpbmVSZWR1Y2VycywgaXNQbGFpbk9iamVjdCBhcyBpc1BsYWluT2JqZWN0MiB9IGZyb20gXCJyZWR1eFwiO1xuXG4vLyBzcmMvZGV2dG9vbHNFeHRlbnNpb24udHNcbmltcG9ydCB7IGNvbXBvc2UgfSBmcm9tIFwicmVkdXhcIjtcbnZhciBjb21wb3NlV2l0aERldlRvb2xzID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cuX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fQ09NUE9TRV9fID8gd2luZG93Ll9fUkVEVVhfREVWVE9PTFNfRVhURU5TSU9OX0NPTVBPU0VfXyA6IGZ1bmN0aW9uKCkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHZvaWQgMDtcbiAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMF0gPT09IFwib2JqZWN0XCIpIHJldHVybiBjb21wb3NlO1xuICByZXR1cm4gY29tcG9zZS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xufTtcbnZhciBkZXZUb29sc0VuaGFuY2VyID0gdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cuX19SRURVWF9ERVZUT09MU19FWFRFTlNJT05fXyA/IHdpbmRvdy5fX1JFRFVYX0RFVlRPT0xTX0VYVEVOU0lPTl9fIDogZnVuY3Rpb24oKSB7XG4gIHJldHVybiBmdW5jdGlvbihub29wMykge1xuICAgIHJldHVybiBub29wMztcbiAgfTtcbn07XG5cbi8vIHNyYy9nZXREZWZhdWx0TWlkZGxld2FyZS50c1xuaW1wb3J0IHsgdGh1bmsgYXMgdGh1bmtNaWRkbGV3YXJlLCB3aXRoRXh0cmFBcmd1bWVudCB9IGZyb20gXCJyZWR1eC10aHVua1wiO1xuXG4vLyBzcmMvY3JlYXRlQWN0aW9uLnRzXG5pbXBvcnQgeyBpc0FjdGlvbiB9IGZyb20gXCJyZWR1eFwiO1xuXG4vLyBzcmMvdHNIZWxwZXJzLnRzXG52YXIgaGFzTWF0Y2hGdW5jdGlvbiA9ICh2KSA9PiB7XG4gIHJldHVybiB2ICYmIHR5cGVvZiB2Lm1hdGNoID09PSBcImZ1bmN0aW9uXCI7XG59O1xuXG4vLyBzcmMvY3JlYXRlQWN0aW9uLnRzXG5mdW5jdGlvbiBjcmVhdGVBY3Rpb24odHlwZSwgcHJlcGFyZUFjdGlvbikge1xuICBmdW5jdGlvbiBhY3Rpb25DcmVhdG9yKC4uLmFyZ3MpIHtcbiAgICBpZiAocHJlcGFyZUFjdGlvbikge1xuICAgICAgbGV0IHByZXBhcmVkID0gcHJlcGFyZUFjdGlvbiguLi5hcmdzKTtcbiAgICAgIGlmICghcHJlcGFyZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoMCkgOiBcInByZXBhcmVBY3Rpb24gZGlkIG5vdCByZXR1cm4gYW4gb2JqZWN0XCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZSxcbiAgICAgICAgcGF5bG9hZDogcHJlcGFyZWQucGF5bG9hZCxcbiAgICAgICAgLi4uXCJtZXRhXCIgaW4gcHJlcGFyZWQgJiYge1xuICAgICAgICAgIG1ldGE6IHByZXBhcmVkLm1ldGFcbiAgICAgICAgfSxcbiAgICAgICAgLi4uXCJlcnJvclwiIGluIHByZXBhcmVkICYmIHtcbiAgICAgICAgICBlcnJvcjogcHJlcGFyZWQuZXJyb3JcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGUsXG4gICAgICBwYXlsb2FkOiBhcmdzWzBdXG4gICAgfTtcbiAgfVxuICBhY3Rpb25DcmVhdG9yLnRvU3RyaW5nID0gKCkgPT4gYCR7dHlwZX1gO1xuICBhY3Rpb25DcmVhdG9yLnR5cGUgPSB0eXBlO1xuICBhY3Rpb25DcmVhdG9yLm1hdGNoID0gKGFjdGlvbikgPT4gaXNBY3Rpb24oYWN0aW9uKSAmJiBhY3Rpb24udHlwZSA9PT0gdHlwZTtcbiAgcmV0dXJuIGFjdGlvbkNyZWF0b3I7XG59XG5mdW5jdGlvbiBpc0FjdGlvbkNyZWF0b3IoYWN0aW9uKSB7XG4gIHJldHVybiB0eXBlb2YgYWN0aW9uID09PSBcImZ1bmN0aW9uXCIgJiYgXCJ0eXBlXCIgaW4gYWN0aW9uICYmIC8vIGhhc01hdGNoRnVuY3Rpb24gb25seSB3YW50cyBNYXRjaGVycyBidXQgSSBkb24ndCBzZWUgdGhlIHBvaW50IGluIHJld3JpdGluZyBpdFxuICBoYXNNYXRjaEZ1bmN0aW9uKGFjdGlvbik7XG59XG5mdW5jdGlvbiBpc0ZTQShhY3Rpb24pIHtcbiAgcmV0dXJuIGlzQWN0aW9uKGFjdGlvbikgJiYgT2JqZWN0LmtleXMoYWN0aW9uKS5ldmVyeShpc1ZhbGlkS2V5KTtcbn1cbmZ1bmN0aW9uIGlzVmFsaWRLZXkoa2V5KSB7XG4gIHJldHVybiBbXCJ0eXBlXCIsIFwicGF5bG9hZFwiLCBcImVycm9yXCIsIFwibWV0YVwiXS5pbmRleE9mKGtleSkgPiAtMTtcbn1cblxuLy8gc3JjL2FjdGlvbkNyZWF0b3JJbnZhcmlhbnRNaWRkbGV3YXJlLnRzXG5mdW5jdGlvbiBnZXRNZXNzYWdlKHR5cGUpIHtcbiAgY29uc3Qgc3BsaXRUeXBlID0gdHlwZSA/IGAke3R5cGV9YC5zcGxpdChcIi9cIikgOiBbXTtcbiAgY29uc3QgYWN0aW9uTmFtZSA9IHNwbGl0VHlwZVtzcGxpdFR5cGUubGVuZ3RoIC0gMV0gfHwgXCJhY3Rpb25DcmVhdG9yXCI7XG4gIHJldHVybiBgRGV0ZWN0ZWQgYW4gYWN0aW9uIGNyZWF0b3Igd2l0aCB0eXBlIFwiJHt0eXBlIHx8IFwidW5rbm93blwifVwiIGJlaW5nIGRpc3BhdGNoZWQuIFxuTWFrZSBzdXJlIHlvdSdyZSBjYWxsaW5nIHRoZSBhY3Rpb24gY3JlYXRvciBiZWZvcmUgZGlzcGF0Y2hpbmcsIGkuZS4gXFxgZGlzcGF0Y2goJHthY3Rpb25OYW1lfSgpKVxcYCBpbnN0ZWFkIG9mIFxcYGRpc3BhdGNoKCR7YWN0aW9uTmFtZX0pXFxgLiBUaGlzIGlzIG5lY2Vzc2FyeSBldmVuIGlmIHRoZSBhY3Rpb24gaGFzIG5vIHBheWxvYWQuYDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUFjdGlvbkNyZWF0b3JJbnZhcmlhbnRNaWRkbGV3YXJlKG9wdGlvbnMgPSB7fSkge1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgcmV0dXJuICgpID0+IChuZXh0KSA9PiAoYWN0aW9uKSA9PiBuZXh0KGFjdGlvbik7XG4gIH1cbiAgY29uc3Qge1xuICAgIGlzQWN0aW9uQ3JlYXRvcjogaXNBY3Rpb25DcmVhdG9yMiA9IGlzQWN0aW9uQ3JlYXRvclxuICB9ID0gb3B0aW9ucztcbiAgcmV0dXJuICgpID0+IChuZXh0KSA9PiAoYWN0aW9uKSA9PiB7XG4gICAgaWYgKGlzQWN0aW9uQ3JlYXRvcjIoYWN0aW9uKSkge1xuICAgICAgY29uc29sZS53YXJuKGdldE1lc3NhZ2UoYWN0aW9uLnR5cGUpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5leHQoYWN0aW9uKTtcbiAgfTtcbn1cblxuLy8gc3JjL3V0aWxzLnRzXG5pbXBvcnQgeyBwcm9kdWNlIGFzIGNyZWF0ZU5leHRTdGF0ZSwgaXNEcmFmdGFibGUgfSBmcm9tIFwiaW1tZXJcIjtcbmZ1bmN0aW9uIGdldFRpbWVNZWFzdXJlVXRpbHMobWF4RGVsYXksIGZuTmFtZSkge1xuICBsZXQgZWxhcHNlZCA9IDA7XG4gIHJldHVybiB7XG4gICAgbWVhc3VyZVRpbWUoZm4pIHtcbiAgICAgIGNvbnN0IHN0YXJ0ZWQgPSBEYXRlLm5vdygpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGZuKCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBjb25zdCBmaW5pc2hlZCA9IERhdGUubm93KCk7XG4gICAgICAgIGVsYXBzZWQgKz0gZmluaXNoZWQgLSBzdGFydGVkO1xuICAgICAgfVxuICAgIH0sXG4gICAgd2FybklmRXhjZWVkZWQoKSB7XG4gICAgICBpZiAoZWxhcHNlZCA+IG1heERlbGF5KSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgJHtmbk5hbWV9IHRvb2sgJHtlbGFwc2VkfW1zLCB3aGljaCBpcyBtb3JlIHRoYW4gdGhlIHdhcm5pbmcgdGhyZXNob2xkIG9mICR7bWF4RGVsYXl9bXMuIFxuSWYgeW91ciBzdGF0ZSBvciBhY3Rpb25zIGFyZSB2ZXJ5IGxhcmdlLCB5b3UgbWF5IHdhbnQgdG8gZGlzYWJsZSB0aGUgbWlkZGxld2FyZSBhcyBpdCBtaWdodCBjYXVzZSB0b28gbXVjaCBvZiBhIHNsb3dkb3duIGluIGRldmVsb3BtZW50IG1vZGUuIFNlZSBodHRwczovL3JlZHV4LXRvb2xraXQuanMub3JnL2FwaS9nZXREZWZhdWx0TWlkZGxld2FyZSBmb3IgaW5zdHJ1Y3Rpb25zLlxuSXQgaXMgZGlzYWJsZWQgaW4gcHJvZHVjdGlvbiBidWlsZHMsIHNvIHlvdSBkb24ndCBuZWVkIHRvIHdvcnJ5IGFib3V0IHRoYXQuYCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxudmFyIFR1cGxlID0gY2xhc3MgX1R1cGxlIGV4dGVuZHMgQXJyYXkge1xuICBjb25zdHJ1Y3RvciguLi5pdGVtcykge1xuICAgIHN1cGVyKC4uLml0ZW1zKTtcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgX1R1cGxlLnByb3RvdHlwZSk7XG4gIH1cbiAgc3RhdGljIGdldCBbU3ltYm9sLnNwZWNpZXNdKCkge1xuICAgIHJldHVybiBfVHVwbGU7XG4gIH1cbiAgY29uY2F0KC4uLmFycikge1xuICAgIHJldHVybiBzdXBlci5jb25jYXQuYXBwbHkodGhpcywgYXJyKTtcbiAgfVxuICBwcmVwZW5kKC4uLmFycikge1xuICAgIGlmIChhcnIubGVuZ3RoID09PSAxICYmIEFycmF5LmlzQXJyYXkoYXJyWzBdKSkge1xuICAgICAgcmV0dXJuIG5ldyBfVHVwbGUoLi4uYXJyWzBdLmNvbmNhdCh0aGlzKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgX1R1cGxlKC4uLmFyci5jb25jYXQodGhpcykpO1xuICB9XG59O1xuZnVuY3Rpb24gZnJlZXplRHJhZnRhYmxlKHZhbCkge1xuICByZXR1cm4gaXNEcmFmdGFibGUodmFsKSA/IGNyZWF0ZU5leHRTdGF0ZSh2YWwsICgpID0+IHtcbiAgfSkgOiB2YWw7XG59XG5mdW5jdGlvbiBnZXRPckluc2VydENvbXB1dGVkKG1hcCwga2V5LCBjb21wdXRlKSB7XG4gIGlmIChtYXAuaGFzKGtleSkpIHJldHVybiBtYXAuZ2V0KGtleSk7XG4gIHJldHVybiBtYXAuc2V0KGtleSwgY29tcHV0ZShrZXkpKS5nZXQoa2V5KTtcbn1cblxuLy8gc3JjL2ltbXV0YWJsZVN0YXRlSW52YXJpYW50TWlkZGxld2FyZS50c1xuZnVuY3Rpb24gaXNJbW11dGFibGVEZWZhdWx0KHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgfHwgdmFsdWUgPT0gbnVsbCB8fCBPYmplY3QuaXNGcm96ZW4odmFsdWUpO1xufVxuZnVuY3Rpb24gdHJhY2tGb3JNdXRhdGlvbnMoaXNJbW11dGFibGUsIGlnbm9yZVBhdGhzLCBvYmopIHtcbiAgY29uc3QgdHJhY2tlZFByb3BlcnRpZXMgPSB0cmFja1Byb3BlcnRpZXMoaXNJbW11dGFibGUsIGlnbm9yZVBhdGhzLCBvYmopO1xuICByZXR1cm4ge1xuICAgIGRldGVjdE11dGF0aW9ucygpIHtcbiAgICAgIHJldHVybiBkZXRlY3RNdXRhdGlvbnMoaXNJbW11dGFibGUsIGlnbm9yZVBhdGhzLCB0cmFja2VkUHJvcGVydGllcywgb2JqKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiB0cmFja1Byb3BlcnRpZXMoaXNJbW11dGFibGUsIGlnbm9yZVBhdGhzID0gW10sIG9iaiwgcGF0aCA9IFwiXCIsIGNoZWNrZWRPYmplY3RzID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSkge1xuICBjb25zdCB0cmFja2VkID0ge1xuICAgIHZhbHVlOiBvYmpcbiAgfTtcbiAgaWYgKCFpc0ltbXV0YWJsZShvYmopICYmICFjaGVja2VkT2JqZWN0cy5oYXMob2JqKSkge1xuICAgIGNoZWNrZWRPYmplY3RzLmFkZChvYmopO1xuICAgIHRyYWNrZWQuY2hpbGRyZW4gPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcbiAgICAgIGNvbnN0IGNoaWxkUGF0aCA9IHBhdGggPyBwYXRoICsgXCIuXCIgKyBrZXkgOiBrZXk7XG4gICAgICBpZiAoaWdub3JlUGF0aHMubGVuZ3RoICYmIGlnbm9yZVBhdGhzLmluZGV4T2YoY2hpbGRQYXRoKSAhPT0gLTEpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICB0cmFja2VkLmNoaWxkcmVuW2tleV0gPSB0cmFja1Byb3BlcnRpZXMoaXNJbW11dGFibGUsIGlnbm9yZVBhdGhzLCBvYmpba2V5XSwgY2hpbGRQYXRoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRyYWNrZWQ7XG59XG5mdW5jdGlvbiBkZXRlY3RNdXRhdGlvbnMoaXNJbW11dGFibGUsIGlnbm9yZWRQYXRocyA9IFtdLCB0cmFja2VkUHJvcGVydHksIG9iaiwgc2FtZVBhcmVudFJlZiA9IGZhbHNlLCBwYXRoID0gXCJcIikge1xuICBjb25zdCBwcmV2T2JqID0gdHJhY2tlZFByb3BlcnR5ID8gdHJhY2tlZFByb3BlcnR5LnZhbHVlIDogdm9pZCAwO1xuICBjb25zdCBzYW1lUmVmID0gcHJldk9iaiA9PT0gb2JqO1xuICBpZiAoc2FtZVBhcmVudFJlZiAmJiAhc2FtZVJlZiAmJiAhTnVtYmVyLmlzTmFOKG9iaikpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2FzTXV0YXRlZDogdHJ1ZSxcbiAgICAgIHBhdGhcbiAgICB9O1xuICB9XG4gIGlmIChpc0ltbXV0YWJsZShwcmV2T2JqKSB8fCBpc0ltbXV0YWJsZShvYmopKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdhc011dGF0ZWQ6IGZhbHNlXG4gICAgfTtcbiAgfVxuICBjb25zdCBrZXlzVG9EZXRlY3QgPSB7fTtcbiAgZm9yIChsZXQga2V5IGluIHRyYWNrZWRQcm9wZXJ0eS5jaGlsZHJlbikge1xuICAgIGtleXNUb0RldGVjdFtrZXldID0gdHJ1ZTtcbiAgfVxuICBmb3IgKGxldCBrZXkgaW4gb2JqKSB7XG4gICAga2V5c1RvRGV0ZWN0W2tleV0gPSB0cnVlO1xuICB9XG4gIGNvbnN0IGhhc0lnbm9yZWRQYXRocyA9IGlnbm9yZWRQYXRocy5sZW5ndGggPiAwO1xuICBmb3IgKGxldCBrZXkgaW4ga2V5c1RvRGV0ZWN0KSB7XG4gICAgY29uc3QgbmVzdGVkUGF0aCA9IHBhdGggPyBwYXRoICsgXCIuXCIgKyBrZXkgOiBrZXk7XG4gICAgaWYgKGhhc0lnbm9yZWRQYXRocykge1xuICAgICAgY29uc3QgaGFzTWF0Y2hlcyA9IGlnbm9yZWRQYXRocy5zb21lKChpZ25vcmVkKSA9PiB7XG4gICAgICAgIGlmIChpZ25vcmVkIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAgICAgcmV0dXJuIGlnbm9yZWQudGVzdChuZXN0ZWRQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmVzdGVkUGF0aCA9PT0gaWdub3JlZDtcbiAgICAgIH0pO1xuICAgICAgaWYgKGhhc01hdGNoZXMpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IGRldGVjdE11dGF0aW9ucyhpc0ltbXV0YWJsZSwgaWdub3JlZFBhdGhzLCB0cmFja2VkUHJvcGVydHkuY2hpbGRyZW5ba2V5XSwgb2JqW2tleV0sIHNhbWVSZWYsIG5lc3RlZFBhdGgpO1xuICAgIGlmIChyZXN1bHQud2FzTXV0YXRlZCkge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHtcbiAgICB3YXNNdXRhdGVkOiBmYWxzZVxuICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlSW1tdXRhYmxlU3RhdGVJbnZhcmlhbnRNaWRkbGV3YXJlKG9wdGlvbnMgPSB7fSkge1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgcmV0dXJuICgpID0+IChuZXh0KSA9PiAoYWN0aW9uKSA9PiBuZXh0KGFjdGlvbik7XG4gIH0gZWxzZSB7XG4gICAgbGV0IHN0cmluZ2lmeTIgPSBmdW5jdGlvbihvYmosIHNlcmlhbGl6ZXIsIGluZGVudCwgZGVjeWNsZXIpIHtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmosIGdldFNlcmlhbGl6ZTIoc2VyaWFsaXplciwgZGVjeWNsZXIpLCBpbmRlbnQpO1xuICAgIH0sIGdldFNlcmlhbGl6ZTIgPSBmdW5jdGlvbihzZXJpYWxpemVyLCBkZWN5Y2xlcikge1xuICAgICAgbGV0IHN0YWNrID0gW10sIGtleXMgPSBbXTtcbiAgICAgIGlmICghZGVjeWNsZXIpIGRlY3ljbGVyID0gZnVuY3Rpb24oXywgdmFsdWUpIHtcbiAgICAgICAgaWYgKHN0YWNrWzBdID09PSB2YWx1ZSkgcmV0dXJuIFwiW0NpcmN1bGFyIH5dXCI7XG4gICAgICAgIHJldHVybiBcIltDaXJjdWxhciB+LlwiICsga2V5cy5zbGljZSgwLCBzdGFjay5pbmRleE9mKHZhbHVlKSkuam9pbihcIi5cIikgKyBcIl1cIjtcbiAgICAgIH07XG4gICAgICByZXR1cm4gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgICAgIHZhciB0aGlzUG9zID0gc3RhY2suaW5kZXhPZih0aGlzKTtcbiAgICAgICAgICB+dGhpc1BvcyA/IHN0YWNrLnNwbGljZSh0aGlzUG9zICsgMSkgOiBzdGFjay5wdXNoKHRoaXMpO1xuICAgICAgICAgIH50aGlzUG9zID8ga2V5cy5zcGxpY2UodGhpc1BvcywgSW5maW5pdHksIGtleSkgOiBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICBpZiAofnN0YWNrLmluZGV4T2YodmFsdWUpKSB2YWx1ZSA9IGRlY3ljbGVyLmNhbGwodGhpcywga2V5LCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSBzdGFjay5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZXIgPT0gbnVsbCA/IHZhbHVlIDogc2VyaWFsaXplci5jYWxsKHRoaXMsIGtleSwgdmFsdWUpO1xuICAgICAgfTtcbiAgICB9O1xuICAgIHZhciBzdHJpbmdpZnkgPSBzdHJpbmdpZnkyLCBnZXRTZXJpYWxpemUgPSBnZXRTZXJpYWxpemUyO1xuICAgIGxldCB7XG4gICAgICBpc0ltbXV0YWJsZSA9IGlzSW1tdXRhYmxlRGVmYXVsdCxcbiAgICAgIGlnbm9yZWRQYXRocyxcbiAgICAgIHdhcm5BZnRlciA9IDMyXG4gICAgfSA9IG9wdGlvbnM7XG4gICAgY29uc3QgdHJhY2sgPSB0cmFja0Zvck11dGF0aW9ucy5iaW5kKG51bGwsIGlzSW1tdXRhYmxlLCBpZ25vcmVkUGF0aHMpO1xuICAgIHJldHVybiAoe1xuICAgICAgZ2V0U3RhdGVcbiAgICB9KSA9PiB7XG4gICAgICBsZXQgc3RhdGUgPSBnZXRTdGF0ZSgpO1xuICAgICAgbGV0IHRyYWNrZXIgPSB0cmFjayhzdGF0ZSk7XG4gICAgICBsZXQgcmVzdWx0O1xuICAgICAgcmV0dXJuIChuZXh0KSA9PiAoYWN0aW9uKSA9PiB7XG4gICAgICAgIGNvbnN0IG1lYXN1cmVVdGlscyA9IGdldFRpbWVNZWFzdXJlVXRpbHMod2FybkFmdGVyLCBcIkltbXV0YWJsZVN0YXRlSW52YXJpYW50TWlkZGxld2FyZVwiKTtcbiAgICAgICAgbWVhc3VyZVV0aWxzLm1lYXN1cmVUaW1lKCgpID0+IHtcbiAgICAgICAgICBzdGF0ZSA9IGdldFN0YXRlKCk7XG4gICAgICAgICAgcmVzdWx0ID0gdHJhY2tlci5kZXRlY3RNdXRhdGlvbnMoKTtcbiAgICAgICAgICB0cmFja2VyID0gdHJhY2soc3RhdGUpO1xuICAgICAgICAgIGlmIChyZXN1bHQud2FzTXV0YXRlZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoMTkpIDogYEEgc3RhdGUgbXV0YXRpb24gd2FzIGRldGVjdGVkIGJldHdlZW4gZGlzcGF0Y2hlcywgaW4gdGhlIHBhdGggJyR7cmVzdWx0LnBhdGggfHwgXCJcIn0nLiAgVGhpcyBtYXkgY2F1c2UgaW5jb3JyZWN0IGJlaGF2aW9yLiAoaHR0cHM6Ly9yZWR1eC5qcy5vcmcvc3R5bGUtZ3VpZGUvc3R5bGUtZ3VpZGUjZG8tbm90LW11dGF0ZS1zdGF0ZSlgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBkaXNwYXRjaGVkQWN0aW9uID0gbmV4dChhY3Rpb24pO1xuICAgICAgICBtZWFzdXJlVXRpbHMubWVhc3VyZVRpbWUoKCkgPT4ge1xuICAgICAgICAgIHN0YXRlID0gZ2V0U3RhdGUoKTtcbiAgICAgICAgICByZXN1bHQgPSB0cmFja2VyLmRldGVjdE11dGF0aW9ucygpO1xuICAgICAgICAgIHRyYWNrZXIgPSB0cmFjayhzdGF0ZSk7XG4gICAgICAgICAgaWYgKHJlc3VsdC53YXNNdXRhdGVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgyMCkgOiBgQSBzdGF0ZSBtdXRhdGlvbiB3YXMgZGV0ZWN0ZWQgaW5zaWRlIGEgZGlzcGF0Y2gsIGluIHRoZSBwYXRoOiAke3Jlc3VsdC5wYXRoIHx8IFwiXCJ9LiBUYWtlIGEgbG9vayBhdCB0aGUgcmVkdWNlcihzKSBoYW5kbGluZyB0aGUgYWN0aW9uICR7c3RyaW5naWZ5MihhY3Rpb24pfS4gKGh0dHBzOi8vcmVkdXguanMub3JnL3N0eWxlLWd1aWRlL3N0eWxlLWd1aWRlI2RvLW5vdC1tdXRhdGUtc3RhdGUpYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbWVhc3VyZVV0aWxzLndhcm5JZkV4Y2VlZGVkKCk7XG4gICAgICAgIHJldHVybiBkaXNwYXRjaGVkQWN0aW9uO1xuICAgICAgfTtcbiAgICB9O1xuICB9XG59XG5cbi8vIHNyYy9zZXJpYWxpemFibGVTdGF0ZUludmFyaWFudE1pZGRsZXdhcmUudHNcbmltcG9ydCB7IGlzQWN0aW9uIGFzIGlzQWN0aW9uMiwgaXNQbGFpbk9iamVjdCB9IGZyb20gXCJyZWR1eFwiO1xuZnVuY3Rpb24gaXNQbGFpbih2YWwpIHtcbiAgY29uc3QgdHlwZSA9IHR5cGVvZiB2YWw7XG4gIHJldHVybiB2YWwgPT0gbnVsbCB8fCB0eXBlID09PSBcInN0cmluZ1wiIHx8IHR5cGUgPT09IFwiYm9vbGVhblwiIHx8IHR5cGUgPT09IFwibnVtYmVyXCIgfHwgQXJyYXkuaXNBcnJheSh2YWwpIHx8IGlzUGxhaW5PYmplY3QodmFsKTtcbn1cbmZ1bmN0aW9uIGZpbmROb25TZXJpYWxpemFibGVWYWx1ZSh2YWx1ZSwgcGF0aCA9IFwiXCIsIGlzU2VyaWFsaXphYmxlID0gaXNQbGFpbiwgZ2V0RW50cmllcywgaWdub3JlZFBhdGhzID0gW10sIGNhY2hlKSB7XG4gIGxldCBmb3VuZE5lc3RlZFNlcmlhbGl6YWJsZTtcbiAgaWYgKCFpc1NlcmlhbGl6YWJsZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4ge1xuICAgICAga2V5UGF0aDogcGF0aCB8fCBcIjxyb290PlwiLFxuICAgICAgdmFsdWVcbiAgICB9O1xuICB9XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKGNhY2hlPy5oYXModmFsdWUpKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGVudHJpZXMgPSBnZXRFbnRyaWVzICE9IG51bGwgPyBnZXRFbnRyaWVzKHZhbHVlKSA6IE9iamVjdC5lbnRyaWVzKHZhbHVlKTtcbiAgY29uc3QgaGFzSWdub3JlZFBhdGhzID0gaWdub3JlZFBhdGhzLmxlbmd0aCA+IDA7XG4gIGZvciAoY29uc3QgW2tleSwgbmVzdGVkVmFsdWVdIG9mIGVudHJpZXMpIHtcbiAgICBjb25zdCBuZXN0ZWRQYXRoID0gcGF0aCA/IHBhdGggKyBcIi5cIiArIGtleSA6IGtleTtcbiAgICBpZiAoaGFzSWdub3JlZFBhdGhzKSB7XG4gICAgICBjb25zdCBoYXNNYXRjaGVzID0gaWdub3JlZFBhdGhzLnNvbWUoKGlnbm9yZWQpID0+IHtcbiAgICAgICAgaWYgKGlnbm9yZWQgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgICByZXR1cm4gaWdub3JlZC50ZXN0KG5lc3RlZFBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXN0ZWRQYXRoID09PSBpZ25vcmVkO1xuICAgICAgfSk7XG4gICAgICBpZiAoaGFzTWF0Y2hlcykge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFpc1NlcmlhbGl6YWJsZShuZXN0ZWRWYWx1ZSkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGtleVBhdGg6IG5lc3RlZFBhdGgsXG4gICAgICAgIHZhbHVlOiBuZXN0ZWRWYWx1ZVxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBuZXN0ZWRWYWx1ZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgZm91bmROZXN0ZWRTZXJpYWxpemFibGUgPSBmaW5kTm9uU2VyaWFsaXphYmxlVmFsdWUobmVzdGVkVmFsdWUsIG5lc3RlZFBhdGgsIGlzU2VyaWFsaXphYmxlLCBnZXRFbnRyaWVzLCBpZ25vcmVkUGF0aHMsIGNhY2hlKTtcbiAgICAgIGlmIChmb3VuZE5lc3RlZFNlcmlhbGl6YWJsZSkge1xuICAgICAgICByZXR1cm4gZm91bmROZXN0ZWRTZXJpYWxpemFibGU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChjYWNoZSAmJiBpc05lc3RlZEZyb3plbih2YWx1ZSkpIGNhY2hlLmFkZCh2YWx1ZSk7XG4gIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGlzTmVzdGVkRnJvemVuKHZhbHVlKSB7XG4gIGlmICghT2JqZWN0LmlzRnJvemVuKHZhbHVlKSkgcmV0dXJuIGZhbHNlO1xuICBmb3IgKGNvbnN0IG5lc3RlZFZhbHVlIG9mIE9iamVjdC52YWx1ZXModmFsdWUpKSB7XG4gICAgaWYgKHR5cGVvZiBuZXN0ZWRWYWx1ZSAhPT0gXCJvYmplY3RcIiB8fCBuZXN0ZWRWYWx1ZSA9PT0gbnVsbCkgY29udGludWU7XG4gICAgaWYgKCFpc05lc3RlZEZyb3plbihuZXN0ZWRWYWx1ZSkpIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVNlcmlhbGl6YWJsZVN0YXRlSW52YXJpYW50TWlkZGxld2FyZShvcHRpb25zID0ge30pIHtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIikge1xuICAgIHJldHVybiAoKSA9PiAobmV4dCkgPT4gKGFjdGlvbikgPT4gbmV4dChhY3Rpb24pO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHtcbiAgICAgIGlzU2VyaWFsaXphYmxlID0gaXNQbGFpbixcbiAgICAgIGdldEVudHJpZXMsXG4gICAgICBpZ25vcmVkQWN0aW9ucyA9IFtdLFxuICAgICAgaWdub3JlZEFjdGlvblBhdGhzID0gW1wibWV0YS5hcmdcIiwgXCJtZXRhLmJhc2VRdWVyeU1ldGFcIl0sXG4gICAgICBpZ25vcmVkUGF0aHMgPSBbXSxcbiAgICAgIHdhcm5BZnRlciA9IDMyLFxuICAgICAgaWdub3JlU3RhdGUgPSBmYWxzZSxcbiAgICAgIGlnbm9yZUFjdGlvbnMgPSBmYWxzZSxcbiAgICAgIGRpc2FibGVDYWNoZSA9IGZhbHNlXG4gICAgfSA9IG9wdGlvbnM7XG4gICAgY29uc3QgY2FjaGUgPSAhZGlzYWJsZUNhY2hlICYmIFdlYWtTZXQgPyAvKiBAX19QVVJFX18gKi8gbmV3IFdlYWtTZXQoKSA6IHZvaWQgMDtcbiAgICByZXR1cm4gKHN0b3JlQVBJKSA9PiAobmV4dCkgPT4gKGFjdGlvbikgPT4ge1xuICAgICAgaWYgKCFpc0FjdGlvbjIoYWN0aW9uKSkge1xuICAgICAgICByZXR1cm4gbmV4dChhY3Rpb24pO1xuICAgICAgfVxuICAgICAgY29uc3QgcmVzdWx0ID0gbmV4dChhY3Rpb24pO1xuICAgICAgY29uc3QgbWVhc3VyZVV0aWxzID0gZ2V0VGltZU1lYXN1cmVVdGlscyh3YXJuQWZ0ZXIsIFwiU2VyaWFsaXphYmxlU3RhdGVJbnZhcmlhbnRNaWRkbGV3YXJlXCIpO1xuICAgICAgaWYgKCFpZ25vcmVBY3Rpb25zICYmICEoaWdub3JlZEFjdGlvbnMubGVuZ3RoICYmIGlnbm9yZWRBY3Rpb25zLmluZGV4T2YoYWN0aW9uLnR5cGUpICE9PSAtMSkpIHtcbiAgICAgICAgbWVhc3VyZVV0aWxzLm1lYXN1cmVUaW1lKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBmb3VuZEFjdGlvbk5vblNlcmlhbGl6YWJsZVZhbHVlID0gZmluZE5vblNlcmlhbGl6YWJsZVZhbHVlKGFjdGlvbiwgXCJcIiwgaXNTZXJpYWxpemFibGUsIGdldEVudHJpZXMsIGlnbm9yZWRBY3Rpb25QYXRocywgY2FjaGUpO1xuICAgICAgICAgIGlmIChmb3VuZEFjdGlvbk5vblNlcmlhbGl6YWJsZVZhbHVlKSB7XG4gICAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICAgIGtleVBhdGgsXG4gICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICB9ID0gZm91bmRBY3Rpb25Ob25TZXJpYWxpemFibGVWYWx1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEEgbm9uLXNlcmlhbGl6YWJsZSB2YWx1ZSB3YXMgZGV0ZWN0ZWQgaW4gYW4gYWN0aW9uLCBpbiB0aGUgcGF0aDogXFxgJHtrZXlQYXRofVxcYC4gVmFsdWU6YCwgdmFsdWUsIFwiXFxuVGFrZSBhIGxvb2sgYXQgdGhlIGxvZ2ljIHRoYXQgZGlzcGF0Y2hlZCB0aGlzIGFjdGlvbjogXCIsIGFjdGlvbiwgXCJcXG4oU2VlIGh0dHBzOi8vcmVkdXguanMub3JnL2ZhcS9hY3Rpb25zI3doeS1zaG91bGQtdHlwZS1iZS1hLXN0cmluZy1vci1hdC1sZWFzdC1zZXJpYWxpemFibGUtd2h5LXNob3VsZC1teS1hY3Rpb24tdHlwZXMtYmUtY29uc3RhbnRzKVwiLCBcIlxcbihUbyBhbGxvdyBub24tc2VyaWFsaXphYmxlIHZhbHVlcyBzZWU6IGh0dHBzOi8vcmVkdXgtdG9vbGtpdC5qcy5vcmcvdXNhZ2UvdXNhZ2UtZ3VpZGUjd29ya2luZy13aXRoLW5vbi1zZXJpYWxpemFibGUtZGF0YSlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICghaWdub3JlU3RhdGUpIHtcbiAgICAgICAgbWVhc3VyZVV0aWxzLm1lYXN1cmVUaW1lKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBzdGF0ZSA9IHN0b3JlQVBJLmdldFN0YXRlKCk7XG4gICAgICAgICAgY29uc3QgZm91bmRTdGF0ZU5vblNlcmlhbGl6YWJsZVZhbHVlID0gZmluZE5vblNlcmlhbGl6YWJsZVZhbHVlKHN0YXRlLCBcIlwiLCBpc1NlcmlhbGl6YWJsZSwgZ2V0RW50cmllcywgaWdub3JlZFBhdGhzLCBjYWNoZSk7XG4gICAgICAgICAgaWYgKGZvdW5kU3RhdGVOb25TZXJpYWxpemFibGVWYWx1ZSkge1xuICAgICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgICBrZXlQYXRoLFxuICAgICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICAgfSA9IGZvdW5kU3RhdGVOb25TZXJpYWxpemFibGVWYWx1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEEgbm9uLXNlcmlhbGl6YWJsZSB2YWx1ZSB3YXMgZGV0ZWN0ZWQgaW4gdGhlIHN0YXRlLCBpbiB0aGUgcGF0aDogXFxgJHtrZXlQYXRofVxcYC4gVmFsdWU6YCwgdmFsdWUsIGBcblRha2UgYSBsb29rIGF0IHRoZSByZWR1Y2VyKHMpIGhhbmRsaW5nIHRoaXMgYWN0aW9uIHR5cGU6ICR7YWN0aW9uLnR5cGV9LlxuKFNlZSBodHRwczovL3JlZHV4LmpzLm9yZy9mYXEvb3JnYW5pemluZy1zdGF0ZSNjYW4taS1wdXQtZnVuY3Rpb25zLXByb21pc2VzLW9yLW90aGVyLW5vbi1zZXJpYWxpemFibGUtaXRlbXMtaW4tbXktc3RvcmUtc3RhdGUpYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbWVhc3VyZVV0aWxzLndhcm5JZkV4Y2VlZGVkKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH1cbn1cblxuLy8gc3JjL2dldERlZmF1bHRNaWRkbGV3YXJlLnRzXG5mdW5jdGlvbiBpc0Jvb2xlYW4oeCkge1xuICByZXR1cm4gdHlwZW9mIHggPT09IFwiYm9vbGVhblwiO1xufVxudmFyIGJ1aWxkR2V0RGVmYXVsdE1pZGRsZXdhcmUgPSAoKSA9PiBmdW5jdGlvbiBnZXREZWZhdWx0TWlkZGxld2FyZShvcHRpb25zKSB7XG4gIGNvbnN0IHtcbiAgICB0aHVuayA9IHRydWUsXG4gICAgaW1tdXRhYmxlQ2hlY2sgPSB0cnVlLFxuICAgIHNlcmlhbGl6YWJsZUNoZWNrID0gdHJ1ZSxcbiAgICBhY3Rpb25DcmVhdG9yQ2hlY2sgPSB0cnVlXG4gIH0gPSBvcHRpb25zID8/IHt9O1xuICBsZXQgbWlkZGxld2FyZUFycmF5ID0gbmV3IFR1cGxlKCk7XG4gIGlmICh0aHVuaykge1xuICAgIGlmIChpc0Jvb2xlYW4odGh1bmspKSB7XG4gICAgICBtaWRkbGV3YXJlQXJyYXkucHVzaCh0aHVua01pZGRsZXdhcmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtaWRkbGV3YXJlQXJyYXkucHVzaCh3aXRoRXh0cmFBcmd1bWVudCh0aHVuay5leHRyYUFyZ3VtZW50KSk7XG4gICAgfVxuICB9XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIHtcbiAgICBpZiAoaW1tdXRhYmxlQ2hlY2spIHtcbiAgICAgIGxldCBpbW11dGFibGVPcHRpb25zID0ge307XG4gICAgICBpZiAoIWlzQm9vbGVhbihpbW11dGFibGVDaGVjaykpIHtcbiAgICAgICAgaW1tdXRhYmxlT3B0aW9ucyA9IGltbXV0YWJsZUNoZWNrO1xuICAgICAgfVxuICAgICAgbWlkZGxld2FyZUFycmF5LnVuc2hpZnQoY3JlYXRlSW1tdXRhYmxlU3RhdGVJbnZhcmlhbnRNaWRkbGV3YXJlKGltbXV0YWJsZU9wdGlvbnMpKTtcbiAgICB9XG4gICAgaWYgKHNlcmlhbGl6YWJsZUNoZWNrKSB7XG4gICAgICBsZXQgc2VyaWFsaXphYmxlT3B0aW9ucyA9IHt9O1xuICAgICAgaWYgKCFpc0Jvb2xlYW4oc2VyaWFsaXphYmxlQ2hlY2spKSB7XG4gICAgICAgIHNlcmlhbGl6YWJsZU9wdGlvbnMgPSBzZXJpYWxpemFibGVDaGVjaztcbiAgICAgIH1cbiAgICAgIG1pZGRsZXdhcmVBcnJheS5wdXNoKGNyZWF0ZVNlcmlhbGl6YWJsZVN0YXRlSW52YXJpYW50TWlkZGxld2FyZShzZXJpYWxpemFibGVPcHRpb25zKSk7XG4gICAgfVxuICAgIGlmIChhY3Rpb25DcmVhdG9yQ2hlY2spIHtcbiAgICAgIGxldCBhY3Rpb25DcmVhdG9yT3B0aW9ucyA9IHt9O1xuICAgICAgaWYgKCFpc0Jvb2xlYW4oYWN0aW9uQ3JlYXRvckNoZWNrKSkge1xuICAgICAgICBhY3Rpb25DcmVhdG9yT3B0aW9ucyA9IGFjdGlvbkNyZWF0b3JDaGVjaztcbiAgICAgIH1cbiAgICAgIG1pZGRsZXdhcmVBcnJheS51bnNoaWZ0KGNyZWF0ZUFjdGlvbkNyZWF0b3JJbnZhcmlhbnRNaWRkbGV3YXJlKGFjdGlvbkNyZWF0b3JPcHRpb25zKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBtaWRkbGV3YXJlQXJyYXk7XG59O1xuXG4vLyBzcmMvYXV0b0JhdGNoRW5oYW5jZXIudHNcbnZhciBTSE9VTERfQVVUT0JBVENIID0gXCJSVEtfYXV0b0JhdGNoXCI7XG52YXIgcHJlcGFyZUF1dG9CYXRjaGVkID0gKCkgPT4gKHBheWxvYWQpID0+ICh7XG4gIHBheWxvYWQsXG4gIG1ldGE6IHtcbiAgICBbU0hPVUxEX0FVVE9CQVRDSF06IHRydWVcbiAgfVxufSk7XG52YXIgY3JlYXRlUXVldWVXaXRoVGltZXIgPSAodGltZW91dCkgPT4ge1xuICByZXR1cm4gKG5vdGlmeSkgPT4ge1xuICAgIHNldFRpbWVvdXQobm90aWZ5LCB0aW1lb3V0KTtcbiAgfTtcbn07XG52YXIgYXV0b0JhdGNoRW5oYW5jZXIgPSAob3B0aW9ucyA9IHtcbiAgdHlwZTogXCJyYWZcIlxufSkgPT4gKG5leHQpID0+ICguLi5hcmdzKSA9PiB7XG4gIGNvbnN0IHN0b3JlID0gbmV4dCguLi5hcmdzKTtcbiAgbGV0IG5vdGlmeWluZyA9IHRydWU7XG4gIGxldCBzaG91bGROb3RpZnlBdEVuZE9mVGljayA9IGZhbHNlO1xuICBsZXQgbm90aWZpY2F0aW9uUXVldWVkID0gZmFsc2U7XG4gIGNvbnN0IGxpc3RlbmVycyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIGNvbnN0IHF1ZXVlQ2FsbGJhY2sgPSBvcHRpb25zLnR5cGUgPT09IFwidGlja1wiID8gcXVldWVNaWNyb3Rhc2sgOiBvcHRpb25zLnR5cGUgPT09IFwicmFmXCIgPyAoXG4gICAgLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHdvbid0IGV4aXN0IGluIFNTUiBlbnZpcm9ubWVudHMuIEZhbGwgYmFjayB0byBhIHZhZ3VlIGFwcHJveGltYXRpb24ganVzdCB0byBrZWVwIGZyb20gZXJyb3JpbmcuXG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA6IGNyZWF0ZVF1ZXVlV2l0aFRpbWVyKDEwKVxuICApIDogb3B0aW9ucy50eXBlID09PSBcImNhbGxiYWNrXCIgPyBvcHRpb25zLnF1ZXVlTm90aWZpY2F0aW9uIDogY3JlYXRlUXVldWVXaXRoVGltZXIob3B0aW9ucy50aW1lb3V0KTtcbiAgY29uc3Qgbm90aWZ5TGlzdGVuZXJzID0gKCkgPT4ge1xuICAgIG5vdGlmaWNhdGlvblF1ZXVlZCA9IGZhbHNlO1xuICAgIGlmIChzaG91bGROb3RpZnlBdEVuZE9mVGljaykge1xuICAgICAgc2hvdWxkTm90aWZ5QXRFbmRPZlRpY2sgPSBmYWxzZTtcbiAgICAgIGxpc3RlbmVycy5mb3JFYWNoKChsKSA9PiBsKCkpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHN0b3JlLCB7XG4gICAgLy8gT3ZlcnJpZGUgdGhlIGJhc2UgYHN0b3JlLnN1YnNjcmliZWAgbWV0aG9kIHRvIGtlZXAgb3JpZ2luYWwgbGlzdGVuZXJzXG4gICAgLy8gZnJvbSBydW5uaW5nIGlmIHdlJ3JlIGRlbGF5aW5nIG5vdGlmaWNhdGlvbnNcbiAgICBzdWJzY3JpYmUobGlzdGVuZXIyKSB7XG4gICAgICBjb25zdCB3cmFwcGVkTGlzdGVuZXIgPSAoKSA9PiBub3RpZnlpbmcgJiYgbGlzdGVuZXIyKCk7XG4gICAgICBjb25zdCB1bnN1YnNjcmliZSA9IHN0b3JlLnN1YnNjcmliZSh3cmFwcGVkTGlzdGVuZXIpO1xuICAgICAgbGlzdGVuZXJzLmFkZChsaXN0ZW5lcjIpO1xuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgbGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcjIpO1xuICAgICAgfTtcbiAgICB9LFxuICAgIC8vIE92ZXJyaWRlIHRoZSBiYXNlIGBzdG9yZS5kaXNwYXRjaGAgbWV0aG9kIHNvIHRoYXQgd2UgY2FuIGNoZWNrIGFjdGlvbnNcbiAgICAvLyBmb3IgdGhlIGBzaG91bGRBdXRvQmF0Y2hgIGZsYWcgYW5kIGRldGVybWluZSBpZiBiYXRjaGluZyBpcyBhY3RpdmVcbiAgICBkaXNwYXRjaChhY3Rpb24pIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5vdGlmeWluZyA9ICFhY3Rpb24/Lm1ldGE/LltTSE9VTERfQVVUT0JBVENIXTtcbiAgICAgICAgc2hvdWxkTm90aWZ5QXRFbmRPZlRpY2sgPSAhbm90aWZ5aW5nO1xuICAgICAgICBpZiAoc2hvdWxkTm90aWZ5QXRFbmRPZlRpY2spIHtcbiAgICAgICAgICBpZiAoIW5vdGlmaWNhdGlvblF1ZXVlZCkge1xuICAgICAgICAgICAgbm90aWZpY2F0aW9uUXVldWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHF1ZXVlQ2FsbGJhY2sobm90aWZ5TGlzdGVuZXJzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0b3JlLmRpc3BhdGNoKGFjdGlvbik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBub3RpZnlpbmcgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59O1xuXG4vLyBzcmMvZ2V0RGVmYXVsdEVuaGFuY2Vycy50c1xudmFyIGJ1aWxkR2V0RGVmYXVsdEVuaGFuY2VycyA9IChtaWRkbGV3YXJlRW5oYW5jZXIpID0+IGZ1bmN0aW9uIGdldERlZmF1bHRFbmhhbmNlcnMob3B0aW9ucykge1xuICBjb25zdCB7XG4gICAgYXV0b0JhdGNoID0gdHJ1ZVxuICB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgbGV0IGVuaGFuY2VyQXJyYXkgPSBuZXcgVHVwbGUobWlkZGxld2FyZUVuaGFuY2VyKTtcbiAgaWYgKGF1dG9CYXRjaCkge1xuICAgIGVuaGFuY2VyQXJyYXkucHVzaChhdXRvQmF0Y2hFbmhhbmNlcih0eXBlb2YgYXV0b0JhdGNoID09PSBcIm9iamVjdFwiID8gYXV0b0JhdGNoIDogdm9pZCAwKSk7XG4gIH1cbiAgcmV0dXJuIGVuaGFuY2VyQXJyYXk7XG59O1xuXG4vLyBzcmMvY29uZmlndXJlU3RvcmUudHNcbmZ1bmN0aW9uIGNvbmZpZ3VyZVN0b3JlKG9wdGlvbnMpIHtcbiAgY29uc3QgZ2V0RGVmYXVsdE1pZGRsZXdhcmUgPSBidWlsZEdldERlZmF1bHRNaWRkbGV3YXJlKCk7XG4gIGNvbnN0IHtcbiAgICByZWR1Y2VyID0gdm9pZCAwLFxuICAgIG1pZGRsZXdhcmUsXG4gICAgZGV2VG9vbHMgPSB0cnVlLFxuICAgIGR1cGxpY2F0ZU1pZGRsZXdhcmVDaGVjayA9IHRydWUsXG4gICAgcHJlbG9hZGVkU3RhdGUgPSB2b2lkIDAsXG4gICAgZW5oYW5jZXJzID0gdm9pZCAwXG4gIH0gPSBvcHRpb25zIHx8IHt9O1xuICBsZXQgcm9vdFJlZHVjZXI7XG4gIGlmICh0eXBlb2YgcmVkdWNlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgcm9vdFJlZHVjZXIgPSByZWR1Y2VyO1xuICB9IGVsc2UgaWYgKGlzUGxhaW5PYmplY3QyKHJlZHVjZXIpKSB7XG4gICAgcm9vdFJlZHVjZXIgPSBjb21iaW5lUmVkdWNlcnMocmVkdWNlcik7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoMSkgOiBcImByZWR1Y2VyYCBpcyBhIHJlcXVpcmVkIGFyZ3VtZW50LCBhbmQgbXVzdCBiZSBhIGZ1bmN0aW9uIG9yIGFuIG9iamVjdCBvZiBmdW5jdGlvbnMgdGhhdCBjYW4gYmUgcGFzc2VkIHRvIGNvbWJpbmVSZWR1Y2Vyc1wiKTtcbiAgfVxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiICYmIG1pZGRsZXdhcmUgJiYgdHlwZW9mIG1pZGRsZXdhcmUgIT09IFwiZnVuY3Rpb25cIikge1xuICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDIpIDogXCJgbWlkZGxld2FyZWAgZmllbGQgbXVzdCBiZSBhIGNhbGxiYWNrXCIpO1xuICB9XG4gIGxldCBmaW5hbE1pZGRsZXdhcmU7XG4gIGlmICh0eXBlb2YgbWlkZGxld2FyZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgZmluYWxNaWRkbGV3YXJlID0gbWlkZGxld2FyZShnZXREZWZhdWx0TWlkZGxld2FyZSk7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIiAmJiAhQXJyYXkuaXNBcnJheShmaW5hbE1pZGRsZXdhcmUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgzKSA6IFwid2hlbiB1c2luZyBhIG1pZGRsZXdhcmUgYnVpbGRlciBmdW5jdGlvbiwgYW4gYXJyYXkgb2YgbWlkZGxld2FyZSBtdXN0IGJlIHJldHVybmVkXCIpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBmaW5hbE1pZGRsZXdhcmUgPSBnZXREZWZhdWx0TWlkZGxld2FyZSgpO1xuICB9XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIgJiYgZmluYWxNaWRkbGV3YXJlLnNvbWUoKGl0ZW0pID0+IHR5cGVvZiBpdGVtICE9PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoNCkgOiBcImVhY2ggbWlkZGxld2FyZSBwcm92aWRlZCB0byBjb25maWd1cmVTdG9yZSBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gIH1cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIiAmJiBkdXBsaWNhdGVNaWRkbGV3YXJlQ2hlY2spIHtcbiAgICBsZXQgbWlkZGxld2FyZVJlZmVyZW5jZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICAgIGZpbmFsTWlkZGxld2FyZS5mb3JFYWNoKChtaWRkbGV3YXJlMikgPT4ge1xuICAgICAgaWYgKG1pZGRsZXdhcmVSZWZlcmVuY2VzLmhhcyhtaWRkbGV3YXJlMikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoNDIpIDogXCJEdXBsaWNhdGUgbWlkZGxld2FyZSByZWZlcmVuY2VzIGZvdW5kIHdoZW4gY3JlYXRpbmcgdGhlIHN0b3JlLiBFbnN1cmUgdGhhdCBlYWNoIG1pZGRsZXdhcmUgaXMgb25seSBpbmNsdWRlZCBvbmNlLlwiKTtcbiAgICAgIH1cbiAgICAgIG1pZGRsZXdhcmVSZWZlcmVuY2VzLmFkZChtaWRkbGV3YXJlMik7XG4gICAgfSk7XG4gIH1cbiAgbGV0IGZpbmFsQ29tcG9zZSA9IGNvbXBvc2UyO1xuICBpZiAoZGV2VG9vbHMpIHtcbiAgICBmaW5hbENvbXBvc2UgPSBjb21wb3NlV2l0aERldlRvb2xzKHtcbiAgICAgIC8vIEVuYWJsZSBjYXB0dXJlIG9mIHN0YWNrIHRyYWNlcyBmb3IgZGlzcGF0Y2hlZCBSZWR1eCBhY3Rpb25zXG4gICAgICB0cmFjZTogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiLFxuICAgICAgLi4udHlwZW9mIGRldlRvb2xzID09PSBcIm9iamVjdFwiICYmIGRldlRvb2xzXG4gICAgfSk7XG4gIH1cbiAgY29uc3QgbWlkZGxld2FyZUVuaGFuY2VyID0gYXBwbHlNaWRkbGV3YXJlKC4uLmZpbmFsTWlkZGxld2FyZSk7XG4gIGNvbnN0IGdldERlZmF1bHRFbmhhbmNlcnMgPSBidWlsZEdldERlZmF1bHRFbmhhbmNlcnMobWlkZGxld2FyZUVuaGFuY2VyKTtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIiAmJiBlbmhhbmNlcnMgJiYgdHlwZW9mIGVuaGFuY2VycyAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoNSkgOiBcImBlbmhhbmNlcnNgIGZpZWxkIG11c3QgYmUgYSBjYWxsYmFja1wiKTtcbiAgfVxuICBsZXQgc3RvcmVFbmhhbmNlcnMgPSB0eXBlb2YgZW5oYW5jZXJzID09PSBcImZ1bmN0aW9uXCIgPyBlbmhhbmNlcnMoZ2V0RGVmYXVsdEVuaGFuY2VycykgOiBnZXREZWZhdWx0RW5oYW5jZXJzKCk7XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIgJiYgIUFycmF5LmlzQXJyYXkoc3RvcmVFbmhhbmNlcnMpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoNikgOiBcImBlbmhhbmNlcnNgIGNhbGxiYWNrIG11c3QgcmV0dXJuIGFuIGFycmF5XCIpO1xuICB9XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIgJiYgc3RvcmVFbmhhbmNlcnMuc29tZSgoaXRlbSkgPT4gdHlwZW9mIGl0ZW0gIT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSg3KSA6IFwiZWFjaCBlbmhhbmNlciBwcm92aWRlZCB0byBjb25maWd1cmVTdG9yZSBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gIH1cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIiAmJiBmaW5hbE1pZGRsZXdhcmUubGVuZ3RoICYmICFzdG9yZUVuaGFuY2Vycy5pbmNsdWRlcyhtaWRkbGV3YXJlRW5oYW5jZXIpKSB7XG4gICAgY29uc29sZS5lcnJvcihcIm1pZGRsZXdhcmVzIHdlcmUgcHJvdmlkZWQsIGJ1dCBtaWRkbGV3YXJlIGVuaGFuY2VyIHdhcyBub3QgaW5jbHVkZWQgaW4gZmluYWwgZW5oYW5jZXJzIC0gbWFrZSBzdXJlIHRvIGNhbGwgYGdldERlZmF1bHRFbmhhbmNlcnNgXCIpO1xuICB9XG4gIGNvbnN0IGNvbXBvc2VkRW5oYW5jZXIgPSBmaW5hbENvbXBvc2UoLi4uc3RvcmVFbmhhbmNlcnMpO1xuICByZXR1cm4gY3JlYXRlU3RvcmUocm9vdFJlZHVjZXIsIHByZWxvYWRlZFN0YXRlLCBjb21wb3NlZEVuaGFuY2VyKTtcbn1cblxuLy8gc3JjL2NyZWF0ZVJlZHVjZXIudHNcbmltcG9ydCB7IHByb2R1Y2UgYXMgY3JlYXRlTmV4dFN0YXRlMiwgaXNEcmFmdCBhcyBpc0RyYWZ0MiwgaXNEcmFmdGFibGUgYXMgaXNEcmFmdGFibGUyIH0gZnJvbSBcImltbWVyXCI7XG5cbi8vIHNyYy9tYXBCdWlsZGVycy50c1xuZnVuY3Rpb24gZXhlY3V0ZVJlZHVjZXJCdWlsZGVyQ2FsbGJhY2soYnVpbGRlckNhbGxiYWNrKSB7XG4gIGNvbnN0IGFjdGlvbnNNYXAgPSB7fTtcbiAgY29uc3QgYWN0aW9uTWF0Y2hlcnMgPSBbXTtcbiAgbGV0IGRlZmF1bHRDYXNlUmVkdWNlcjtcbiAgY29uc3QgYnVpbGRlciA9IHtcbiAgICBhZGRDYXNlKHR5cGVPckFjdGlvbkNyZWF0b3IsIHJlZHVjZXIpIHtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIHtcbiAgICAgICAgaWYgKGFjdGlvbk1hdGNoZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgyNikgOiBcImBidWlsZGVyLmFkZENhc2VgIHNob3VsZCBvbmx5IGJlIGNhbGxlZCBiZWZvcmUgY2FsbGluZyBgYnVpbGRlci5hZGRNYXRjaGVyYFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVmYXVsdENhc2VSZWR1Y2VyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoMjcpIDogXCJgYnVpbGRlci5hZGRDYXNlYCBzaG91bGQgb25seSBiZSBjYWxsZWQgYmVmb3JlIGNhbGxpbmcgYGJ1aWxkZXIuYWRkRGVmYXVsdENhc2VgXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCB0eXBlID0gdHlwZW9mIHR5cGVPckFjdGlvbkNyZWF0b3IgPT09IFwic3RyaW5nXCIgPyB0eXBlT3JBY3Rpb25DcmVhdG9yIDogdHlwZU9yQWN0aW9uQ3JlYXRvci50eXBlO1xuICAgICAgaWYgKCF0eXBlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDI4KSA6IFwiYGJ1aWxkZXIuYWRkQ2FzZWAgY2Fubm90IGJlIGNhbGxlZCB3aXRoIGFuIGVtcHR5IGFjdGlvbiB0eXBlXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgaW4gYWN0aW9uc01hcCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgyOSkgOiBgXFxgYnVpbGRlci5hZGRDYXNlXFxgIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCB0d28gcmVkdWNlcnMgZm9yIHRoZSBzYW1lIGFjdGlvbiB0eXBlICcke3R5cGV9J2ApO1xuICAgICAgfVxuICAgICAgYWN0aW9uc01hcFt0eXBlXSA9IHJlZHVjZXI7XG4gICAgICByZXR1cm4gYnVpbGRlcjtcbiAgICB9LFxuICAgIGFkZEFzeW5jVGh1bmsoYXN5bmNUaHVuaywgcmVkdWNlcnMpIHtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIHtcbiAgICAgICAgaWYgKGRlZmF1bHRDYXNlUmVkdWNlcikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDQzKSA6IFwiYGJ1aWxkZXIuYWRkQXN5bmNUaHVua2Agc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGJlZm9yZSBjYWxsaW5nIGBidWlsZGVyLmFkZERlZmF1bHRDYXNlYFwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHJlZHVjZXJzLnBlbmRpbmcpIGFjdGlvbnNNYXBbYXN5bmNUaHVuay5wZW5kaW5nLnR5cGVdID0gcmVkdWNlcnMucGVuZGluZztcbiAgICAgIGlmIChyZWR1Y2Vycy5yZWplY3RlZCkgYWN0aW9uc01hcFthc3luY1RodW5rLnJlamVjdGVkLnR5cGVdID0gcmVkdWNlcnMucmVqZWN0ZWQ7XG4gICAgICBpZiAocmVkdWNlcnMuZnVsZmlsbGVkKSBhY3Rpb25zTWFwW2FzeW5jVGh1bmsuZnVsZmlsbGVkLnR5cGVdID0gcmVkdWNlcnMuZnVsZmlsbGVkO1xuICAgICAgaWYgKHJlZHVjZXJzLnNldHRsZWQpIGFjdGlvbk1hdGNoZXJzLnB1c2goe1xuICAgICAgICBtYXRjaGVyOiBhc3luY1RodW5rLnNldHRsZWQsXG4gICAgICAgIHJlZHVjZXI6IHJlZHVjZXJzLnNldHRsZWRcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGJ1aWxkZXI7XG4gICAgfSxcbiAgICBhZGRNYXRjaGVyKG1hdGNoZXIsIHJlZHVjZXIpIHtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIHtcbiAgICAgICAgaWYgKGRlZmF1bHRDYXNlUmVkdWNlcikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDMwKSA6IFwiYGJ1aWxkZXIuYWRkTWF0Y2hlcmAgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGJlZm9yZSBjYWxsaW5nIGBidWlsZGVyLmFkZERlZmF1bHRDYXNlYFwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYWN0aW9uTWF0Y2hlcnMucHVzaCh7XG4gICAgICAgIG1hdGNoZXIsXG4gICAgICAgIHJlZHVjZXJcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGJ1aWxkZXI7XG4gICAgfSxcbiAgICBhZGREZWZhdWx0Q2FzZShyZWR1Y2VyKSB7XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgICAgIGlmIChkZWZhdWx0Q2FzZVJlZHVjZXIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgzMSkgOiBcImBidWlsZGVyLmFkZERlZmF1bHRDYXNlYCBjYW4gb25seSBiZSBjYWxsZWQgb25jZVwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGVmYXVsdENhc2VSZWR1Y2VyID0gcmVkdWNlcjtcbiAgICAgIHJldHVybiBidWlsZGVyO1xuICAgIH1cbiAgfTtcbiAgYnVpbGRlckNhbGxiYWNrKGJ1aWxkZXIpO1xuICByZXR1cm4gW2FjdGlvbnNNYXAsIGFjdGlvbk1hdGNoZXJzLCBkZWZhdWx0Q2FzZVJlZHVjZXJdO1xufVxuXG4vLyBzcmMvY3JlYXRlUmVkdWNlci50c1xuZnVuY3Rpb24gaXNTdGF0ZUZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCI7XG59XG5mdW5jdGlvbiBjcmVhdGVSZWR1Y2VyKGluaXRpYWxTdGF0ZSwgbWFwT3JCdWlsZGVyQ2FsbGJhY2spIHtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIikge1xuICAgIGlmICh0eXBlb2YgbWFwT3JCdWlsZGVyQ2FsbGJhY2sgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDgpIDogXCJUaGUgb2JqZWN0IG5vdGF0aW9uIGZvciBgY3JlYXRlUmVkdWNlcmAgaGFzIGJlZW4gcmVtb3ZlZC4gUGxlYXNlIHVzZSB0aGUgJ2J1aWxkZXIgY2FsbGJhY2snIG5vdGF0aW9uIGluc3RlYWQ6IGh0dHBzOi8vcmVkdXgtdG9vbGtpdC5qcy5vcmcvYXBpL2NyZWF0ZVJlZHVjZXJcIik7XG4gICAgfVxuICB9XG4gIGxldCBbYWN0aW9uc01hcCwgZmluYWxBY3Rpb25NYXRjaGVycywgZmluYWxEZWZhdWx0Q2FzZVJlZHVjZXJdID0gZXhlY3V0ZVJlZHVjZXJCdWlsZGVyQ2FsbGJhY2sobWFwT3JCdWlsZGVyQ2FsbGJhY2spO1xuICBsZXQgZ2V0SW5pdGlhbFN0YXRlO1xuICBpZiAoaXNTdGF0ZUZ1bmN0aW9uKGluaXRpYWxTdGF0ZSkpIHtcbiAgICBnZXRJbml0aWFsU3RhdGUgPSAoKSA9PiBmcmVlemVEcmFmdGFibGUoaW5pdGlhbFN0YXRlKCkpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGZyb3plbkluaXRpYWxTdGF0ZSA9IGZyZWV6ZURyYWZ0YWJsZShpbml0aWFsU3RhdGUpO1xuICAgIGdldEluaXRpYWxTdGF0ZSA9ICgpID0+IGZyb3plbkluaXRpYWxTdGF0ZTtcbiAgfVxuICBmdW5jdGlvbiByZWR1Y2VyKHN0YXRlID0gZ2V0SW5pdGlhbFN0YXRlKCksIGFjdGlvbikge1xuICAgIGxldCBjYXNlUmVkdWNlcnMgPSBbYWN0aW9uc01hcFthY3Rpb24udHlwZV0sIC4uLmZpbmFsQWN0aW9uTWF0Y2hlcnMuZmlsdGVyKCh7XG4gICAgICBtYXRjaGVyXG4gICAgfSkgPT4gbWF0Y2hlcihhY3Rpb24pKS5tYXAoKHtcbiAgICAgIHJlZHVjZXI6IHJlZHVjZXIyXG4gICAgfSkgPT4gcmVkdWNlcjIpXTtcbiAgICBpZiAoY2FzZVJlZHVjZXJzLmZpbHRlcigoY3IpID0+ICEhY3IpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY2FzZVJlZHVjZXJzID0gW2ZpbmFsRGVmYXVsdENhc2VSZWR1Y2VyXTtcbiAgICB9XG4gICAgcmV0dXJuIGNhc2VSZWR1Y2Vycy5yZWR1Y2UoKHByZXZpb3VzU3RhdGUsIGNhc2VSZWR1Y2VyKSA9PiB7XG4gICAgICBpZiAoY2FzZVJlZHVjZXIpIHtcbiAgICAgICAgaWYgKGlzRHJhZnQyKHByZXZpb3VzU3RhdGUpKSB7XG4gICAgICAgICAgY29uc3QgZHJhZnQgPSBwcmV2aW91c1N0YXRlO1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNhc2VSZWR1Y2VyKGRyYWZ0LCBhY3Rpb24pO1xuICAgICAgICAgIGlmIChyZXN1bHQgPT09IHZvaWQgMCkge1xuICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzU3RhdGU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0gZWxzZSBpZiAoIWlzRHJhZnRhYmxlMihwcmV2aW91c1N0YXRlKSkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGNhc2VSZWR1Y2VyKHByZXZpb3VzU3RhdGUsIGFjdGlvbik7XG4gICAgICAgICAgaWYgKHJlc3VsdCA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICBpZiAocHJldmlvdXNTdGF0ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHJldmlvdXNTdGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiQSBjYXNlIHJlZHVjZXIgb24gYSBub24tZHJhZnRhYmxlIHZhbHVlIG11c3Qgbm90IHJldHVybiB1bmRlZmluZWRcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGNyZWF0ZU5leHRTdGF0ZTIocHJldmlvdXNTdGF0ZSwgKGRyYWZ0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY2FzZVJlZHVjZXIoZHJhZnQsIGFjdGlvbik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBwcmV2aW91c1N0YXRlO1xuICAgIH0sIHN0YXRlKTtcbiAgfVxuICByZWR1Y2VyLmdldEluaXRpYWxTdGF0ZSA9IGdldEluaXRpYWxTdGF0ZTtcbiAgcmV0dXJuIHJlZHVjZXI7XG59XG5cbi8vIHNyYy9tYXRjaGVycy50c1xudmFyIG1hdGNoZXMgPSAobWF0Y2hlciwgYWN0aW9uKSA9PiB7XG4gIGlmIChoYXNNYXRjaEZ1bmN0aW9uKG1hdGNoZXIpKSB7XG4gICAgcmV0dXJuIG1hdGNoZXIubWF0Y2goYWN0aW9uKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbWF0Y2hlcihhY3Rpb24pO1xuICB9XG59O1xuZnVuY3Rpb24gaXNBbnlPZiguLi5tYXRjaGVycykge1xuICByZXR1cm4gKGFjdGlvbikgPT4ge1xuICAgIHJldHVybiBtYXRjaGVycy5zb21lKChtYXRjaGVyKSA9PiBtYXRjaGVzKG1hdGNoZXIsIGFjdGlvbikpO1xuICB9O1xufVxuZnVuY3Rpb24gaXNBbGxPZiguLi5tYXRjaGVycykge1xuICByZXR1cm4gKGFjdGlvbikgPT4ge1xuICAgIHJldHVybiBtYXRjaGVycy5ldmVyeSgobWF0Y2hlcikgPT4gbWF0Y2hlcyhtYXRjaGVyLCBhY3Rpb24pKTtcbiAgfTtcbn1cbmZ1bmN0aW9uIGhhc0V4cGVjdGVkUmVxdWVzdE1ldGFkYXRhKGFjdGlvbiwgdmFsaWRTdGF0dXMpIHtcbiAgaWYgKCFhY3Rpb24gfHwgIWFjdGlvbi5tZXRhKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGhhc1ZhbGlkUmVxdWVzdElkID0gdHlwZW9mIGFjdGlvbi5tZXRhLnJlcXVlc3RJZCA9PT0gXCJzdHJpbmdcIjtcbiAgY29uc3QgaGFzVmFsaWRSZXF1ZXN0U3RhdHVzID0gdmFsaWRTdGF0dXMuaW5kZXhPZihhY3Rpb24ubWV0YS5yZXF1ZXN0U3RhdHVzKSA+IC0xO1xuICByZXR1cm4gaGFzVmFsaWRSZXF1ZXN0SWQgJiYgaGFzVmFsaWRSZXF1ZXN0U3RhdHVzO1xufVxuZnVuY3Rpb24gaXNBc3luY1RodW5rQXJyYXkoYSkge1xuICByZXR1cm4gdHlwZW9mIGFbMF0gPT09IFwiZnVuY3Rpb25cIiAmJiBcInBlbmRpbmdcIiBpbiBhWzBdICYmIFwiZnVsZmlsbGVkXCIgaW4gYVswXSAmJiBcInJlamVjdGVkXCIgaW4gYVswXTtcbn1cbmZ1bmN0aW9uIGlzUGVuZGluZyguLi5hc3luY1RodW5rcykge1xuICBpZiAoYXN5bmNUaHVua3MubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIChhY3Rpb24pID0+IGhhc0V4cGVjdGVkUmVxdWVzdE1ldGFkYXRhKGFjdGlvbiwgW1wicGVuZGluZ1wiXSk7XG4gIH1cbiAgaWYgKCFpc0FzeW5jVGh1bmtBcnJheShhc3luY1RodW5rcykpIHtcbiAgICByZXR1cm4gaXNQZW5kaW5nKCkoYXN5bmNUaHVua3NbMF0pO1xuICB9XG4gIHJldHVybiBpc0FueU9mKC4uLmFzeW5jVGh1bmtzLm1hcCgoYXN5bmNUaHVuaykgPT4gYXN5bmNUaHVuay5wZW5kaW5nKSk7XG59XG5mdW5jdGlvbiBpc1JlamVjdGVkKC4uLmFzeW5jVGh1bmtzKSB7XG4gIGlmIChhc3luY1RodW5rcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gKGFjdGlvbikgPT4gaGFzRXhwZWN0ZWRSZXF1ZXN0TWV0YWRhdGEoYWN0aW9uLCBbXCJyZWplY3RlZFwiXSk7XG4gIH1cbiAgaWYgKCFpc0FzeW5jVGh1bmtBcnJheShhc3luY1RodW5rcykpIHtcbiAgICByZXR1cm4gaXNSZWplY3RlZCgpKGFzeW5jVGh1bmtzWzBdKTtcbiAgfVxuICByZXR1cm4gaXNBbnlPZiguLi5hc3luY1RodW5rcy5tYXAoKGFzeW5jVGh1bmspID0+IGFzeW5jVGh1bmsucmVqZWN0ZWQpKTtcbn1cbmZ1bmN0aW9uIGlzUmVqZWN0ZWRXaXRoVmFsdWUoLi4uYXN5bmNUaHVua3MpIHtcbiAgY29uc3QgaGFzRmxhZyA9IChhY3Rpb24pID0+IHtcbiAgICByZXR1cm4gYWN0aW9uICYmIGFjdGlvbi5tZXRhICYmIGFjdGlvbi5tZXRhLnJlamVjdGVkV2l0aFZhbHVlO1xuICB9O1xuICBpZiAoYXN5bmNUaHVua3MubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGlzQWxsT2YoaXNSZWplY3RlZCguLi5hc3luY1RodW5rcyksIGhhc0ZsYWcpO1xuICB9XG4gIGlmICghaXNBc3luY1RodW5rQXJyYXkoYXN5bmNUaHVua3MpKSB7XG4gICAgcmV0dXJuIGlzUmVqZWN0ZWRXaXRoVmFsdWUoKShhc3luY1RodW5rc1swXSk7XG4gIH1cbiAgcmV0dXJuIGlzQWxsT2YoaXNSZWplY3RlZCguLi5hc3luY1RodW5rcyksIGhhc0ZsYWcpO1xufVxuZnVuY3Rpb24gaXNGdWxmaWxsZWQoLi4uYXN5bmNUaHVua3MpIHtcbiAgaWYgKGFzeW5jVGh1bmtzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAoYWN0aW9uKSA9PiBoYXNFeHBlY3RlZFJlcXVlc3RNZXRhZGF0YShhY3Rpb24sIFtcImZ1bGZpbGxlZFwiXSk7XG4gIH1cbiAgaWYgKCFpc0FzeW5jVGh1bmtBcnJheShhc3luY1RodW5rcykpIHtcbiAgICByZXR1cm4gaXNGdWxmaWxsZWQoKShhc3luY1RodW5rc1swXSk7XG4gIH1cbiAgcmV0dXJuIGlzQW55T2YoLi4uYXN5bmNUaHVua3MubWFwKChhc3luY1RodW5rKSA9PiBhc3luY1RodW5rLmZ1bGZpbGxlZCkpO1xufVxuZnVuY3Rpb24gaXNBc3luY1RodW5rQWN0aW9uKC4uLmFzeW5jVGh1bmtzKSB7XG4gIGlmIChhc3luY1RodW5rcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gKGFjdGlvbikgPT4gaGFzRXhwZWN0ZWRSZXF1ZXN0TWV0YWRhdGEoYWN0aW9uLCBbXCJwZW5kaW5nXCIsIFwiZnVsZmlsbGVkXCIsIFwicmVqZWN0ZWRcIl0pO1xuICB9XG4gIGlmICghaXNBc3luY1RodW5rQXJyYXkoYXN5bmNUaHVua3MpKSB7XG4gICAgcmV0dXJuIGlzQXN5bmNUaHVua0FjdGlvbigpKGFzeW5jVGh1bmtzWzBdKTtcbiAgfVxuICByZXR1cm4gaXNBbnlPZiguLi5hc3luY1RodW5rcy5mbGF0TWFwKChhc3luY1RodW5rKSA9PiBbYXN5bmNUaHVuay5wZW5kaW5nLCBhc3luY1RodW5rLnJlamVjdGVkLCBhc3luY1RodW5rLmZ1bGZpbGxlZF0pKTtcbn1cblxuLy8gc3JjL25hbm9pZC50c1xudmFyIHVybEFscGhhYmV0ID0gXCJNb2R1bGVTeW1iaGFzT3duUHItMDEyMzQ1Njc4OUFCQ0RFRkdITlJWZmdjdGlVdnpfS3FZVEprTHhwWlhJalFXXCI7XG52YXIgbmFub2lkID0gKHNpemUgPSAyMSkgPT4ge1xuICBsZXQgaWQgPSBcIlwiO1xuICBsZXQgaSA9IHNpemU7XG4gIHdoaWxlIChpLS0pIHtcbiAgICBpZCArPSB1cmxBbHBoYWJldFtNYXRoLnJhbmRvbSgpICogNjQgfCAwXTtcbiAgfVxuICByZXR1cm4gaWQ7XG59O1xuXG4vLyBzcmMvY3JlYXRlQXN5bmNUaHVuay50c1xudmFyIGNvbW1vblByb3BlcnRpZXMgPSBbXCJuYW1lXCIsIFwibWVzc2FnZVwiLCBcInN0YWNrXCIsIFwiY29kZVwiXTtcbnZhciBSZWplY3RXaXRoVmFsdWUgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKHBheWxvYWQsIG1ldGEpIHtcbiAgICB0aGlzLnBheWxvYWQgPSBwYXlsb2FkO1xuICAgIHRoaXMubWV0YSA9IG1ldGE7XG4gIH1cbiAgLypcbiAgdHlwZS1vbmx5IHByb3BlcnR5IHRvIGRpc3Rpbmd1aXNoIGJldHdlZW4gUmVqZWN0V2l0aFZhbHVlIGFuZCBGdWxmaWxsV2l0aE1ldGFcbiAgZG9lcyBub3QgZXhpc3QgYXQgcnVudGltZVxuICAqL1xuICBfdHlwZTtcbn07XG52YXIgRnVsZmlsbFdpdGhNZXRhID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihwYXlsb2FkLCBtZXRhKSB7XG4gICAgdGhpcy5wYXlsb2FkID0gcGF5bG9hZDtcbiAgICB0aGlzLm1ldGEgPSBtZXRhO1xuICB9XG4gIC8qXG4gIHR5cGUtb25seSBwcm9wZXJ0eSB0byBkaXN0aW5ndWlzaCBiZXR3ZWVuIFJlamVjdFdpdGhWYWx1ZSBhbmQgRnVsZmlsbFdpdGhNZXRhXG4gIGRvZXMgbm90IGV4aXN0IGF0IHJ1bnRpbWVcbiAgKi9cbiAgX3R5cGU7XG59O1xudmFyIG1pbmlTZXJpYWxpemVFcnJvciA9ICh2YWx1ZSkgPT4ge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgY29uc3Qgc2ltcGxlRXJyb3IgPSB7fTtcbiAgICBmb3IgKGNvbnN0IHByb3BlcnR5IG9mIGNvbW1vblByb3BlcnRpZXMpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWVbcHJvcGVydHldID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHNpbXBsZUVycm9yW3Byb3BlcnR5XSA9IHZhbHVlW3Byb3BlcnR5XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNpbXBsZUVycm9yO1xuICB9XG4gIHJldHVybiB7XG4gICAgbWVzc2FnZTogU3RyaW5nKHZhbHVlKVxuICB9O1xufTtcbnZhciBleHRlcm5hbEFib3J0TWVzc2FnZSA9IFwiRXh0ZXJuYWwgc2lnbmFsIHdhcyBhYm9ydGVkXCI7XG52YXIgY3JlYXRlQXN5bmNUaHVuayA9IC8qIEBfX1BVUkVfXyAqLyAoKCkgPT4ge1xuICBmdW5jdGlvbiBjcmVhdGVBc3luY1RodW5rMih0eXBlUHJlZml4LCBwYXlsb2FkQ3JlYXRvciwgb3B0aW9ucykge1xuICAgIGNvbnN0IGZ1bGZpbGxlZCA9IGNyZWF0ZUFjdGlvbih0eXBlUHJlZml4ICsgXCIvZnVsZmlsbGVkXCIsIChwYXlsb2FkLCByZXF1ZXN0SWQsIGFyZywgbWV0YSkgPT4gKHtcbiAgICAgIHBheWxvYWQsXG4gICAgICBtZXRhOiB7XG4gICAgICAgIC4uLm1ldGEgfHwge30sXG4gICAgICAgIGFyZyxcbiAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICByZXF1ZXN0U3RhdHVzOiBcImZ1bGZpbGxlZFwiXG4gICAgICB9XG4gICAgfSkpO1xuICAgIGNvbnN0IHBlbmRpbmcgPSBjcmVhdGVBY3Rpb24odHlwZVByZWZpeCArIFwiL3BlbmRpbmdcIiwgKHJlcXVlc3RJZCwgYXJnLCBtZXRhKSA9PiAoe1xuICAgICAgcGF5bG9hZDogdm9pZCAwLFxuICAgICAgbWV0YToge1xuICAgICAgICAuLi5tZXRhIHx8IHt9LFxuICAgICAgICBhcmcsXG4gICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgcmVxdWVzdFN0YXR1czogXCJwZW5kaW5nXCJcbiAgICAgIH1cbiAgICB9KSk7XG4gICAgY29uc3QgcmVqZWN0ZWQgPSBjcmVhdGVBY3Rpb24odHlwZVByZWZpeCArIFwiL3JlamVjdGVkXCIsIChlcnJvciwgcmVxdWVzdElkLCBhcmcsIHBheWxvYWQsIG1ldGEpID0+ICh7XG4gICAgICBwYXlsb2FkLFxuICAgICAgZXJyb3I6IChvcHRpb25zICYmIG9wdGlvbnMuc2VyaWFsaXplRXJyb3IgfHwgbWluaVNlcmlhbGl6ZUVycm9yKShlcnJvciB8fCBcIlJlamVjdGVkXCIpLFxuICAgICAgbWV0YToge1xuICAgICAgICAuLi5tZXRhIHx8IHt9LFxuICAgICAgICBhcmcsXG4gICAgICAgIHJlcXVlc3RJZCxcbiAgICAgICAgcmVqZWN0ZWRXaXRoVmFsdWU6ICEhcGF5bG9hZCxcbiAgICAgICAgcmVxdWVzdFN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICBhYm9ydGVkOiBlcnJvcj8ubmFtZSA9PT0gXCJBYm9ydEVycm9yXCIsXG4gICAgICAgIGNvbmRpdGlvbjogZXJyb3I/Lm5hbWUgPT09IFwiQ29uZGl0aW9uRXJyb3JcIlxuICAgICAgfVxuICAgIH0pKTtcbiAgICBmdW5jdGlvbiBhY3Rpb25DcmVhdG9yKGFyZywge1xuICAgICAgc2lnbmFsXG4gICAgfSA9IHt9KSB7XG4gICAgICByZXR1cm4gKGRpc3BhdGNoLCBnZXRTdGF0ZSwgZXh0cmEpID0+IHtcbiAgICAgICAgY29uc3QgcmVxdWVzdElkID0gb3B0aW9ucz8uaWRHZW5lcmF0b3IgPyBvcHRpb25zLmlkR2VuZXJhdG9yKGFyZykgOiBuYW5vaWQoKTtcbiAgICAgICAgY29uc3QgYWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICBsZXQgYWJvcnRIYW5kbGVyO1xuICAgICAgICBsZXQgYWJvcnRSZWFzb247XG4gICAgICAgIGZ1bmN0aW9uIGFib3J0KHJlYXNvbikge1xuICAgICAgICAgIGFib3J0UmVhc29uID0gcmVhc29uO1xuICAgICAgICAgIGFib3J0Q29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaWduYWwpIHtcbiAgICAgICAgICBpZiAoc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgICAgICAgIGFib3J0KGV4dGVybmFsQWJvcnRNZXNzYWdlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCAoKSA9PiBhYm9ydChleHRlcm5hbEFib3J0TWVzc2FnZSksIHtcbiAgICAgICAgICAgICAgb25jZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsZXQgZmluYWxBY3Rpb247XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBjb25kaXRpb25SZXN1bHQgPSBvcHRpb25zPy5jb25kaXRpb24/LihhcmcsIHtcbiAgICAgICAgICAgICAgZ2V0U3RhdGUsXG4gICAgICAgICAgICAgIGV4dHJhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChpc1RoZW5hYmxlKGNvbmRpdGlvblJlc3VsdCkpIHtcbiAgICAgICAgICAgICAgY29uZGl0aW9uUmVzdWx0ID0gYXdhaXQgY29uZGl0aW9uUmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbmRpdGlvblJlc3VsdCA9PT0gZmFsc2UgfHwgYWJvcnRDb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICAgICAgICAgIHRocm93IHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcIkNvbmRpdGlvbkVycm9yXCIsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJBYm9ydGVkIGR1ZSB0byBjb25kaXRpb24gY2FsbGJhY2sgcmV0dXJuaW5nIGZhbHNlLlwiXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBhYm9ydGVkUHJvbWlzZSA9IG5ldyBQcm9taXNlKChfLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgYWJvcnRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgICAgICAgICBuYW1lOiBcIkFib3J0RXJyb3JcIixcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGFib3J0UmVhc29uIHx8IFwiQWJvcnRlZFwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGFib3J0Q29udHJvbGxlci5zaWduYWwuYWRkRXZlbnRMaXN0ZW5lcihcImFib3J0XCIsIGFib3J0SGFuZGxlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRpc3BhdGNoKHBlbmRpbmcocmVxdWVzdElkLCBhcmcsIG9wdGlvbnM/LmdldFBlbmRpbmdNZXRhPy4oe1xuICAgICAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgICAgIGFyZ1xuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBnZXRTdGF0ZSxcbiAgICAgICAgICAgICAgZXh0cmFcbiAgICAgICAgICAgIH0pKSk7XG4gICAgICAgICAgICBmaW5hbEFjdGlvbiA9IGF3YWl0IFByb21pc2UucmFjZShbYWJvcnRlZFByb21pc2UsIFByb21pc2UucmVzb2x2ZShwYXlsb2FkQ3JlYXRvcihhcmcsIHtcbiAgICAgICAgICAgICAgZGlzcGF0Y2gsXG4gICAgICAgICAgICAgIGdldFN0YXRlLFxuICAgICAgICAgICAgICBleHRyYSxcbiAgICAgICAgICAgICAgcmVxdWVzdElkLFxuICAgICAgICAgICAgICBzaWduYWw6IGFib3J0Q29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgIGFib3J0LFxuICAgICAgICAgICAgICByZWplY3RXaXRoVmFsdWU6ICh2YWx1ZSwgbWV0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUmVqZWN0V2l0aFZhbHVlKHZhbHVlLCBtZXRhKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgZnVsZmlsbFdpdGhWYWx1ZTogKHZhbHVlLCBtZXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGdWxmaWxsV2l0aE1ldGEodmFsdWUsIG1ldGEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBSZWplY3RXaXRoVmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyByZXN1bHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIEZ1bGZpbGxXaXRoTWV0YSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdWxmaWxsZWQocmVzdWx0LnBheWxvYWQsIHJlcXVlc3RJZCwgYXJnLCByZXN1bHQubWV0YSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bGZpbGxlZChyZXN1bHQsIHJlcXVlc3RJZCwgYXJnKTtcbiAgICAgICAgICAgIH0pXSk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBmaW5hbEFjdGlvbiA9IGVyciBpbnN0YW5jZW9mIFJlamVjdFdpdGhWYWx1ZSA/IHJlamVjdGVkKG51bGwsIHJlcXVlc3RJZCwgYXJnLCBlcnIucGF5bG9hZCwgZXJyLm1ldGEpIDogcmVqZWN0ZWQoZXJyLCByZXF1ZXN0SWQsIGFyZyk7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGlmIChhYm9ydEhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgYWJvcnRDb250cm9sbGVyLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgYWJvcnRIYW5kbGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgc2tpcERpc3BhdGNoID0gb3B0aW9ucyAmJiAhb3B0aW9ucy5kaXNwYXRjaENvbmRpdGlvblJlamVjdGlvbiAmJiByZWplY3RlZC5tYXRjaChmaW5hbEFjdGlvbikgJiYgZmluYWxBY3Rpb24ubWV0YS5jb25kaXRpb247XG4gICAgICAgICAgaWYgKCFza2lwRGlzcGF0Y2gpIHtcbiAgICAgICAgICAgIGRpc3BhdGNoKGZpbmFsQWN0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZpbmFsQWN0aW9uO1xuICAgICAgICB9KCk7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHByb21pc2UsIHtcbiAgICAgICAgICBhYm9ydCxcbiAgICAgICAgICByZXF1ZXN0SWQsXG4gICAgICAgICAgYXJnLFxuICAgICAgICAgIHVud3JhcCgpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlLnRoZW4odW53cmFwUmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oYWN0aW9uQ3JlYXRvciwge1xuICAgICAgcGVuZGluZyxcbiAgICAgIHJlamVjdGVkLFxuICAgICAgZnVsZmlsbGVkLFxuICAgICAgc2V0dGxlZDogaXNBbnlPZihyZWplY3RlZCwgZnVsZmlsbGVkKSxcbiAgICAgIHR5cGVQcmVmaXhcbiAgICB9KTtcbiAgfVxuICBjcmVhdGVBc3luY1RodW5rMi53aXRoVHlwZXMgPSAoKSA9PiBjcmVhdGVBc3luY1RodW5rMjtcbiAgcmV0dXJuIGNyZWF0ZUFzeW5jVGh1bmsyO1xufSkoKTtcbmZ1bmN0aW9uIHVud3JhcFJlc3VsdChhY3Rpb24pIHtcbiAgaWYgKGFjdGlvbi5tZXRhICYmIGFjdGlvbi5tZXRhLnJlamVjdGVkV2l0aFZhbHVlKSB7XG4gICAgdGhyb3cgYWN0aW9uLnBheWxvYWQ7XG4gIH1cbiAgaWYgKGFjdGlvbi5lcnJvcikge1xuICAgIHRocm93IGFjdGlvbi5lcnJvcjtcbiAgfVxuICByZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG59XG5mdW5jdGlvbiBpc1RoZW5hYmxlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuLy8gc3JjL2NyZWF0ZVNsaWNlLnRzXG52YXIgYXN5bmNUaHVua1N5bWJvbCA9IC8qIEBfX1BVUkVfXyAqLyBTeW1ib2wuZm9yKFwicnRrLXNsaWNlLWNyZWF0ZWFzeW5jdGh1bmtcIik7XG52YXIgYXN5bmNUaHVua0NyZWF0b3IgPSB7XG4gIFthc3luY1RodW5rU3ltYm9sXTogY3JlYXRlQXN5bmNUaHVua1xufTtcbnZhciBSZWR1Y2VyVHlwZSA9IC8qIEBfX1BVUkVfXyAqLyAoKFJlZHVjZXJUeXBlMikgPT4ge1xuICBSZWR1Y2VyVHlwZTJbXCJyZWR1Y2VyXCJdID0gXCJyZWR1Y2VyXCI7XG4gIFJlZHVjZXJUeXBlMltcInJlZHVjZXJXaXRoUHJlcGFyZVwiXSA9IFwicmVkdWNlcldpdGhQcmVwYXJlXCI7XG4gIFJlZHVjZXJUeXBlMltcImFzeW5jVGh1bmtcIl0gPSBcImFzeW5jVGh1bmtcIjtcbiAgcmV0dXJuIFJlZHVjZXJUeXBlMjtcbn0pKFJlZHVjZXJUeXBlIHx8IHt9KTtcbmZ1bmN0aW9uIGdldFR5cGUoc2xpY2UsIGFjdGlvbktleSkge1xuICByZXR1cm4gYCR7c2xpY2V9LyR7YWN0aW9uS2V5fWA7XG59XG5mdW5jdGlvbiBidWlsZENyZWF0ZVNsaWNlKHtcbiAgY3JlYXRvcnNcbn0gPSB7fSkge1xuICBjb25zdCBjQVQgPSBjcmVhdG9ycz8uYXN5bmNUaHVuaz8uW2FzeW5jVGh1bmtTeW1ib2xdO1xuICByZXR1cm4gZnVuY3Rpb24gY3JlYXRlU2xpY2UyKG9wdGlvbnMpIHtcbiAgICBjb25zdCB7XG4gICAgICBuYW1lLFxuICAgICAgcmVkdWNlclBhdGggPSBuYW1lXG4gICAgfSA9IG9wdGlvbnM7XG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgxMSkgOiBcImBuYW1lYCBpcyBhIHJlcXVpcmVkIG9wdGlvbiBmb3IgY3JlYXRlU2xpY2VcIik7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJkZXZlbG9wbWVudFwiKSB7XG4gICAgICBpZiAob3B0aW9ucy5pbml0aWFsU3RhdGUgPT09IHZvaWQgMCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiWW91IG11c3QgcHJvdmlkZSBhbiBgaW5pdGlhbFN0YXRlYCB2YWx1ZSB0aGF0IGlzIG5vdCBgdW5kZWZpbmVkYC4gWW91IG1heSBoYXZlIG1pc3NwZWxsZWQgYGluaXRpYWxTdGF0ZWBcIik7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlZHVjZXJzID0gKHR5cGVvZiBvcHRpb25zLnJlZHVjZXJzID09PSBcImZ1bmN0aW9uXCIgPyBvcHRpb25zLnJlZHVjZXJzKGJ1aWxkUmVkdWNlckNyZWF0b3JzKCkpIDogb3B0aW9ucy5yZWR1Y2VycykgfHwge307XG4gICAgY29uc3QgcmVkdWNlck5hbWVzID0gT2JqZWN0LmtleXMocmVkdWNlcnMpO1xuICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICBzbGljZUNhc2VSZWR1Y2Vyc0J5TmFtZToge30sXG4gICAgICBzbGljZUNhc2VSZWR1Y2Vyc0J5VHlwZToge30sXG4gICAgICBhY3Rpb25DcmVhdG9yczoge30sXG4gICAgICBzbGljZU1hdGNoZXJzOiBbXVxuICAgIH07XG4gICAgY29uc3QgY29udGV4dE1ldGhvZHMgPSB7XG4gICAgICBhZGRDYXNlKHR5cGVPckFjdGlvbkNyZWF0b3IsIHJlZHVjZXIyKSB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSB0eXBlb2YgdHlwZU9yQWN0aW9uQ3JlYXRvciA9PT0gXCJzdHJpbmdcIiA/IHR5cGVPckFjdGlvbkNyZWF0b3IgOiB0eXBlT3JBY3Rpb25DcmVhdG9yLnR5cGU7XG4gICAgICAgIGlmICghdHlwZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDEyKSA6IFwiYGNvbnRleHQuYWRkQ2FzZWAgY2Fubm90IGJlIGNhbGxlZCB3aXRoIGFuIGVtcHR5IGFjdGlvbiB0eXBlXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlIGluIGNvbnRleHQuc2xpY2VDYXNlUmVkdWNlcnNCeVR5cGUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgxMykgOiBcImBjb250ZXh0LmFkZENhc2VgIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCB0d28gcmVkdWNlcnMgZm9yIHRoZSBzYW1lIGFjdGlvbiB0eXBlOiBcIiArIHR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRleHQuc2xpY2VDYXNlUmVkdWNlcnNCeVR5cGVbdHlwZV0gPSByZWR1Y2VyMjtcbiAgICAgICAgcmV0dXJuIGNvbnRleHRNZXRob2RzO1xuICAgICAgfSxcbiAgICAgIGFkZE1hdGNoZXIobWF0Y2hlciwgcmVkdWNlcjIpIHtcbiAgICAgICAgY29udGV4dC5zbGljZU1hdGNoZXJzLnB1c2goe1xuICAgICAgICAgIG1hdGNoZXIsXG4gICAgICAgICAgcmVkdWNlcjogcmVkdWNlcjJcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjb250ZXh0TWV0aG9kcztcbiAgICAgIH0sXG4gICAgICBleHBvc2VBY3Rpb24obmFtZTIsIGFjdGlvbkNyZWF0b3IpIHtcbiAgICAgICAgY29udGV4dC5hY3Rpb25DcmVhdG9yc1tuYW1lMl0gPSBhY3Rpb25DcmVhdG9yO1xuICAgICAgICByZXR1cm4gY29udGV4dE1ldGhvZHM7XG4gICAgICB9LFxuICAgICAgZXhwb3NlQ2FzZVJlZHVjZXIobmFtZTIsIHJlZHVjZXIyKSB7XG4gICAgICAgIGNvbnRleHQuc2xpY2VDYXNlUmVkdWNlcnNCeU5hbWVbbmFtZTJdID0gcmVkdWNlcjI7XG4gICAgICAgIHJldHVybiBjb250ZXh0TWV0aG9kcztcbiAgICAgIH1cbiAgICB9O1xuICAgIHJlZHVjZXJOYW1lcy5mb3JFYWNoKChyZWR1Y2VyTmFtZSkgPT4ge1xuICAgICAgY29uc3QgcmVkdWNlckRlZmluaXRpb24gPSByZWR1Y2Vyc1tyZWR1Y2VyTmFtZV07XG4gICAgICBjb25zdCByZWR1Y2VyRGV0YWlscyA9IHtcbiAgICAgICAgcmVkdWNlck5hbWUsXG4gICAgICAgIHR5cGU6IGdldFR5cGUobmFtZSwgcmVkdWNlck5hbWUpLFxuICAgICAgICBjcmVhdGVOb3RhdGlvbjogdHlwZW9mIG9wdGlvbnMucmVkdWNlcnMgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgfTtcbiAgICAgIGlmIChpc0FzeW5jVGh1bmtTbGljZVJlZHVjZXJEZWZpbml0aW9uKHJlZHVjZXJEZWZpbml0aW9uKSkge1xuICAgICAgICBoYW5kbGVUaHVua0Nhc2VSZWR1Y2VyRGVmaW5pdGlvbihyZWR1Y2VyRGV0YWlscywgcmVkdWNlckRlZmluaXRpb24sIGNvbnRleHRNZXRob2RzLCBjQVQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGFuZGxlTm9ybWFsUmVkdWNlckRlZmluaXRpb24ocmVkdWNlckRldGFpbHMsIHJlZHVjZXJEZWZpbml0aW9uLCBjb250ZXh0TWV0aG9kcyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZnVuY3Rpb24gYnVpbGRSZWR1Y2VyKCkge1xuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIikge1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMuZXh0cmFSZWR1Y2VycyA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDE0KSA6IFwiVGhlIG9iamVjdCBub3RhdGlvbiBmb3IgYGNyZWF0ZVNsaWNlLmV4dHJhUmVkdWNlcnNgIGhhcyBiZWVuIHJlbW92ZWQuIFBsZWFzZSB1c2UgdGhlICdidWlsZGVyIGNhbGxiYWNrJyBub3RhdGlvbiBpbnN0ZWFkOiBodHRwczovL3JlZHV4LXRvb2xraXQuanMub3JnL2FwaS9jcmVhdGVTbGljZVwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgW2V4dHJhUmVkdWNlcnMgPSB7fSwgYWN0aW9uTWF0Y2hlcnMgPSBbXSwgZGVmYXVsdENhc2VSZWR1Y2VyID0gdm9pZCAwXSA9IHR5cGVvZiBvcHRpb25zLmV4dHJhUmVkdWNlcnMgPT09IFwiZnVuY3Rpb25cIiA/IGV4ZWN1dGVSZWR1Y2VyQnVpbGRlckNhbGxiYWNrKG9wdGlvbnMuZXh0cmFSZWR1Y2VycykgOiBbb3B0aW9ucy5leHRyYVJlZHVjZXJzXTtcbiAgICAgIGNvbnN0IGZpbmFsQ2FzZVJlZHVjZXJzID0ge1xuICAgICAgICAuLi5leHRyYVJlZHVjZXJzLFxuICAgICAgICAuLi5jb250ZXh0LnNsaWNlQ2FzZVJlZHVjZXJzQnlUeXBlXG4gICAgICB9O1xuICAgICAgcmV0dXJuIGNyZWF0ZVJlZHVjZXIob3B0aW9ucy5pbml0aWFsU3RhdGUsIChidWlsZGVyKSA9PiB7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBmaW5hbENhc2VSZWR1Y2Vycykge1xuICAgICAgICAgIGJ1aWxkZXIuYWRkQ2FzZShrZXksIGZpbmFsQ2FzZVJlZHVjZXJzW2tleV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IHNNIG9mIGNvbnRleHQuc2xpY2VNYXRjaGVycykge1xuICAgICAgICAgIGJ1aWxkZXIuYWRkTWF0Y2hlcihzTS5tYXRjaGVyLCBzTS5yZWR1Y2VyKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBtIG9mIGFjdGlvbk1hdGNoZXJzKSB7XG4gICAgICAgICAgYnVpbGRlci5hZGRNYXRjaGVyKG0ubWF0Y2hlciwgbS5yZWR1Y2VyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVmYXVsdENhc2VSZWR1Y2VyKSB7XG4gICAgICAgICAgYnVpbGRlci5hZGREZWZhdWx0Q2FzZShkZWZhdWx0Q2FzZVJlZHVjZXIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3Qgc2VsZWN0U2VsZiA9IChzdGF0ZSkgPT4gc3RhdGU7XG4gICAgY29uc3QgaW5qZWN0ZWRTZWxlY3RvckNhY2hlID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICBjb25zdCBpbmplY3RlZFN0YXRlQ2FjaGUgPSAvKiBAX19QVVJFX18gKi8gbmV3IFdlYWtNYXAoKTtcbiAgICBsZXQgX3JlZHVjZXI7XG4gICAgZnVuY3Rpb24gcmVkdWNlcihzdGF0ZSwgYWN0aW9uKSB7XG4gICAgICBpZiAoIV9yZWR1Y2VyKSBfcmVkdWNlciA9IGJ1aWxkUmVkdWNlcigpO1xuICAgICAgcmV0dXJuIF9yZWR1Y2VyKHN0YXRlLCBhY3Rpb24pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICBpZiAoIV9yZWR1Y2VyKSBfcmVkdWNlciA9IGJ1aWxkUmVkdWNlcigpO1xuICAgICAgcmV0dXJuIF9yZWR1Y2VyLmdldEluaXRpYWxTdGF0ZSgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBtYWtlU2VsZWN0b3JQcm9wcyhyZWR1Y2VyUGF0aDIsIGluamVjdGVkID0gZmFsc2UpIHtcbiAgICAgIGZ1bmN0aW9uIHNlbGVjdFNsaWNlKHN0YXRlKSB7XG4gICAgICAgIGxldCBzbGljZVN0YXRlID0gc3RhdGVbcmVkdWNlclBhdGgyXTtcbiAgICAgICAgaWYgKHR5cGVvZiBzbGljZVN0YXRlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaWYgKGluamVjdGVkKSB7XG4gICAgICAgICAgICBzbGljZVN0YXRlID0gZ2V0T3JJbnNlcnRDb21wdXRlZChpbmplY3RlZFN0YXRlQ2FjaGUsIHNlbGVjdFNsaWNlLCBnZXRJbml0aWFsU3RhdGUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgxNSkgOiBcInNlbGVjdFNsaWNlIHJldHVybmVkIHVuZGVmaW5lZCBmb3IgYW4gdW5pbmplY3RlZCBzbGljZSByZWR1Y2VyXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2xpY2VTdGF0ZTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGdldFNlbGVjdG9ycyhzZWxlY3RTdGF0ZSA9IHNlbGVjdFNlbGYpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0b3JDYWNoZSA9IGdldE9ySW5zZXJ0Q29tcHV0ZWQoaW5qZWN0ZWRTZWxlY3RvckNhY2hlLCBpbmplY3RlZCwgKCkgPT4gLyogQF9fUFVSRV9fICovIG5ldyBXZWFrTWFwKCkpO1xuICAgICAgICByZXR1cm4gZ2V0T3JJbnNlcnRDb21wdXRlZChzZWxlY3RvckNhY2hlLCBzZWxlY3RTdGF0ZSwgKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG1hcCA9IHt9O1xuICAgICAgICAgIGZvciAoY29uc3QgW25hbWUyLCBzZWxlY3Rvcl0gb2YgT2JqZWN0LmVudHJpZXMob3B0aW9ucy5zZWxlY3RvcnMgPz8ge30pKSB7XG4gICAgICAgICAgICBtYXBbbmFtZTJdID0gd3JhcFNlbGVjdG9yKHNlbGVjdG9yLCBzZWxlY3RTdGF0ZSwgKCkgPT4gZ2V0T3JJbnNlcnRDb21wdXRlZChpbmplY3RlZFN0YXRlQ2FjaGUsIHNlbGVjdFN0YXRlLCBnZXRJbml0aWFsU3RhdGUpLCBpbmplY3RlZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBtYXA7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVkdWNlclBhdGg6IHJlZHVjZXJQYXRoMixcbiAgICAgICAgZ2V0U2VsZWN0b3JzLFxuICAgICAgICBnZXQgc2VsZWN0b3JzKCkge1xuICAgICAgICAgIHJldHVybiBnZXRTZWxlY3RvcnMoc2VsZWN0U2xpY2UpO1xuICAgICAgICB9LFxuICAgICAgICBzZWxlY3RTbGljZVxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3Qgc2xpY2UgPSB7XG4gICAgICBuYW1lLFxuICAgICAgcmVkdWNlcixcbiAgICAgIGFjdGlvbnM6IGNvbnRleHQuYWN0aW9uQ3JlYXRvcnMsXG4gICAgICBjYXNlUmVkdWNlcnM6IGNvbnRleHQuc2xpY2VDYXNlUmVkdWNlcnNCeU5hbWUsXG4gICAgICBnZXRJbml0aWFsU3RhdGUsXG4gICAgICAuLi5tYWtlU2VsZWN0b3JQcm9wcyhyZWR1Y2VyUGF0aCksXG4gICAgICBpbmplY3RJbnRvKGluamVjdGFibGUsIHtcbiAgICAgICAgcmVkdWNlclBhdGg6IHBhdGhPcHQsXG4gICAgICAgIC4uLmNvbmZpZ1xuICAgICAgfSA9IHt9KSB7XG4gICAgICAgIGNvbnN0IG5ld1JlZHVjZXJQYXRoID0gcGF0aE9wdCA/PyByZWR1Y2VyUGF0aDtcbiAgICAgICAgaW5qZWN0YWJsZS5pbmplY3Qoe1xuICAgICAgICAgIHJlZHVjZXJQYXRoOiBuZXdSZWR1Y2VyUGF0aCxcbiAgICAgICAgICByZWR1Y2VyXG4gICAgICAgIH0sIGNvbmZpZyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uc2xpY2UsXG4gICAgICAgICAgLi4ubWFrZVNlbGVjdG9yUHJvcHMobmV3UmVkdWNlclBhdGgsIHRydWUpXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gc2xpY2U7XG4gIH07XG59XG5mdW5jdGlvbiB3cmFwU2VsZWN0b3Ioc2VsZWN0b3IsIHNlbGVjdFN0YXRlLCBnZXRJbml0aWFsU3RhdGUsIGluamVjdGVkKSB7XG4gIGZ1bmN0aW9uIHdyYXBwZXIocm9vdFN0YXRlLCAuLi5hcmdzKSB7XG4gICAgbGV0IHNsaWNlU3RhdGUgPSBzZWxlY3RTdGF0ZShyb290U3RhdGUpO1xuICAgIGlmICh0eXBlb2Ygc2xpY2VTdGF0ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKGluamVjdGVkKSB7XG4gICAgICAgIHNsaWNlU3RhdGUgPSBnZXRJbml0aWFsU3RhdGUoKTtcbiAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDE2KSA6IFwic2VsZWN0U3RhdGUgcmV0dXJuZWQgdW5kZWZpbmVkIGZvciBhbiB1bmluamVjdGVkIHNsaWNlIHJlZHVjZXJcIik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzZWxlY3RvcihzbGljZVN0YXRlLCAuLi5hcmdzKTtcbiAgfVxuICB3cmFwcGVyLnVud3JhcHBlZCA9IHNlbGVjdG9yO1xuICByZXR1cm4gd3JhcHBlcjtcbn1cbnZhciBjcmVhdGVTbGljZSA9IC8qIEBfX1BVUkVfXyAqLyBidWlsZENyZWF0ZVNsaWNlKCk7XG5mdW5jdGlvbiBidWlsZFJlZHVjZXJDcmVhdG9ycygpIHtcbiAgZnVuY3Rpb24gYXN5bmNUaHVuayhwYXlsb2FkQ3JlYXRvciwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIF9yZWR1Y2VyRGVmaW5pdGlvblR5cGU6IFwiYXN5bmNUaHVua1wiIC8qIGFzeW5jVGh1bmsgKi8sXG4gICAgICBwYXlsb2FkQ3JlYXRvcixcbiAgICAgIC4uLmNvbmZpZ1xuICAgIH07XG4gIH1cbiAgYXN5bmNUaHVuay53aXRoVHlwZXMgPSAoKSA9PiBhc3luY1RodW5rO1xuICByZXR1cm4ge1xuICAgIHJlZHVjZXIoY2FzZVJlZHVjZXIpIHtcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgLy8gaGFjayBzbyB0aGUgd3JhcHBpbmcgZnVuY3Rpb24gaGFzIHRoZSBzYW1lIG5hbWUgYXMgdGhlIG9yaWdpbmFsXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gY3JlYXRlIGEgd3JhcHBlciBzbyB0aGUgYHJlZHVjZXJEZWZpbml0aW9uVHlwZWAgaXMgbm90IGFzc2lnbmVkIHRvIHRoZSBvcmlnaW5hbFxuICAgICAgICBbY2FzZVJlZHVjZXIubmFtZV0oLi4uYXJncykge1xuICAgICAgICAgIHJldHVybiBjYXNlUmVkdWNlciguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgfVtjYXNlUmVkdWNlci5uYW1lXSwge1xuICAgICAgICBfcmVkdWNlckRlZmluaXRpb25UeXBlOiBcInJlZHVjZXJcIiAvKiByZWR1Y2VyICovXG4gICAgICB9KTtcbiAgICB9LFxuICAgIHByZXBhcmVkUmVkdWNlcihwcmVwYXJlLCByZWR1Y2VyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBfcmVkdWNlckRlZmluaXRpb25UeXBlOiBcInJlZHVjZXJXaXRoUHJlcGFyZVwiIC8qIHJlZHVjZXJXaXRoUHJlcGFyZSAqLyxcbiAgICAgICAgcHJlcGFyZSxcbiAgICAgICAgcmVkdWNlclxuICAgICAgfTtcbiAgICB9LFxuICAgIGFzeW5jVGh1bmtcbiAgfTtcbn1cbmZ1bmN0aW9uIGhhbmRsZU5vcm1hbFJlZHVjZXJEZWZpbml0aW9uKHtcbiAgdHlwZSxcbiAgcmVkdWNlck5hbWUsXG4gIGNyZWF0ZU5vdGF0aW9uXG59LCBtYXliZVJlZHVjZXJXaXRoUHJlcGFyZSwgY29udGV4dCkge1xuICBsZXQgY2FzZVJlZHVjZXI7XG4gIGxldCBwcmVwYXJlQ2FsbGJhY2s7XG4gIGlmIChcInJlZHVjZXJcIiBpbiBtYXliZVJlZHVjZXJXaXRoUHJlcGFyZSkge1xuICAgIGlmIChjcmVhdGVOb3RhdGlvbiAmJiAhaXNDYXNlUmVkdWNlcldpdGhQcmVwYXJlRGVmaW5pdGlvbihtYXliZVJlZHVjZXJXaXRoUHJlcGFyZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDE3KSA6IFwiUGxlYXNlIHVzZSB0aGUgYGNyZWF0ZS5wcmVwYXJlZFJlZHVjZXJgIG5vdGF0aW9uIGZvciBwcmVwYXJlZCBhY3Rpb24gY3JlYXRvcnMgd2l0aCB0aGUgYGNyZWF0ZWAgbm90YXRpb24uXCIpO1xuICAgIH1cbiAgICBjYXNlUmVkdWNlciA9IG1heWJlUmVkdWNlcldpdGhQcmVwYXJlLnJlZHVjZXI7XG4gICAgcHJlcGFyZUNhbGxiYWNrID0gbWF5YmVSZWR1Y2VyV2l0aFByZXBhcmUucHJlcGFyZTtcbiAgfSBlbHNlIHtcbiAgICBjYXNlUmVkdWNlciA9IG1heWJlUmVkdWNlcldpdGhQcmVwYXJlO1xuICB9XG4gIGNvbnRleHQuYWRkQ2FzZSh0eXBlLCBjYXNlUmVkdWNlcikuZXhwb3NlQ2FzZVJlZHVjZXIocmVkdWNlck5hbWUsIGNhc2VSZWR1Y2VyKS5leHBvc2VBY3Rpb24ocmVkdWNlck5hbWUsIHByZXBhcmVDYWxsYmFjayA/IGNyZWF0ZUFjdGlvbih0eXBlLCBwcmVwYXJlQ2FsbGJhY2spIDogY3JlYXRlQWN0aW9uKHR5cGUpKTtcbn1cbmZ1bmN0aW9uIGlzQXN5bmNUaHVua1NsaWNlUmVkdWNlckRlZmluaXRpb24ocmVkdWNlckRlZmluaXRpb24pIHtcbiAgcmV0dXJuIHJlZHVjZXJEZWZpbml0aW9uLl9yZWR1Y2VyRGVmaW5pdGlvblR5cGUgPT09IFwiYXN5bmNUaHVua1wiIC8qIGFzeW5jVGh1bmsgKi87XG59XG5mdW5jdGlvbiBpc0Nhc2VSZWR1Y2VyV2l0aFByZXBhcmVEZWZpbml0aW9uKHJlZHVjZXJEZWZpbml0aW9uKSB7XG4gIHJldHVybiByZWR1Y2VyRGVmaW5pdGlvbi5fcmVkdWNlckRlZmluaXRpb25UeXBlID09PSBcInJlZHVjZXJXaXRoUHJlcGFyZVwiIC8qIHJlZHVjZXJXaXRoUHJlcGFyZSAqLztcbn1cbmZ1bmN0aW9uIGhhbmRsZVRodW5rQ2FzZVJlZHVjZXJEZWZpbml0aW9uKHtcbiAgdHlwZSxcbiAgcmVkdWNlck5hbWVcbn0sIHJlZHVjZXJEZWZpbml0aW9uLCBjb250ZXh0LCBjQVQpIHtcbiAgaWYgKCFjQVQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgxOCkgOiBcIkNhbm5vdCB1c2UgYGNyZWF0ZS5hc3luY1RodW5rYCBpbiB0aGUgYnVpbHQtaW4gYGNyZWF0ZVNsaWNlYC4gVXNlIGBidWlsZENyZWF0ZVNsaWNlKHsgY3JlYXRvcnM6IHsgYXN5bmNUaHVuazogYXN5bmNUaHVua0NyZWF0b3IgfSB9KWAgdG8gY3JlYXRlIGEgY3VzdG9taXNlZCB2ZXJzaW9uIG9mIGBjcmVhdGVTbGljZWAuXCIpO1xuICB9XG4gIGNvbnN0IHtcbiAgICBwYXlsb2FkQ3JlYXRvcixcbiAgICBmdWxmaWxsZWQsXG4gICAgcGVuZGluZyxcbiAgICByZWplY3RlZCxcbiAgICBzZXR0bGVkLFxuICAgIG9wdGlvbnNcbiAgfSA9IHJlZHVjZXJEZWZpbml0aW9uO1xuICBjb25zdCB0aHVuayA9IGNBVCh0eXBlLCBwYXlsb2FkQ3JlYXRvciwgb3B0aW9ucyk7XG4gIGNvbnRleHQuZXhwb3NlQWN0aW9uKHJlZHVjZXJOYW1lLCB0aHVuayk7XG4gIGlmIChmdWxmaWxsZWQpIHtcbiAgICBjb250ZXh0LmFkZENhc2UodGh1bmsuZnVsZmlsbGVkLCBmdWxmaWxsZWQpO1xuICB9XG4gIGlmIChwZW5kaW5nKSB7XG4gICAgY29udGV4dC5hZGRDYXNlKHRodW5rLnBlbmRpbmcsIHBlbmRpbmcpO1xuICB9XG4gIGlmIChyZWplY3RlZCkge1xuICAgIGNvbnRleHQuYWRkQ2FzZSh0aHVuay5yZWplY3RlZCwgcmVqZWN0ZWQpO1xuICB9XG4gIGlmIChzZXR0bGVkKSB7XG4gICAgY29udGV4dC5hZGRNYXRjaGVyKHRodW5rLnNldHRsZWQsIHNldHRsZWQpO1xuICB9XG4gIGNvbnRleHQuZXhwb3NlQ2FzZVJlZHVjZXIocmVkdWNlck5hbWUsIHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCB8fCBub29wLFxuICAgIHBlbmRpbmc6IHBlbmRpbmcgfHwgbm9vcCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWQgfHwgbm9vcCxcbiAgICBzZXR0bGVkOiBzZXR0bGVkIHx8IG5vb3BcbiAgfSk7XG59XG5mdW5jdGlvbiBub29wKCkge1xufVxuXG4vLyBzcmMvZW50aXRpZXMvZW50aXR5X3N0YXRlLnRzXG5mdW5jdGlvbiBnZXRJbml0aWFsRW50aXR5U3RhdGUoKSB7XG4gIHJldHVybiB7XG4gICAgaWRzOiBbXSxcbiAgICBlbnRpdGllczoge31cbiAgfTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUluaXRpYWxTdGF0ZUZhY3Rvcnkoc3RhdGVBZGFwdGVyKSB7XG4gIGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZShhZGRpdGlvbmFsU3RhdGUgPSB7fSwgZW50aXRpZXMpIHtcbiAgICBjb25zdCBzdGF0ZSA9IE9iamVjdC5hc3NpZ24oZ2V0SW5pdGlhbEVudGl0eVN0YXRlKCksIGFkZGl0aW9uYWxTdGF0ZSk7XG4gICAgcmV0dXJuIGVudGl0aWVzID8gc3RhdGVBZGFwdGVyLnNldEFsbChzdGF0ZSwgZW50aXRpZXMpIDogc3RhdGU7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBnZXRJbml0aWFsU3RhdGVcbiAgfTtcbn1cblxuLy8gc3JjL2VudGl0aWVzL3N0YXRlX3NlbGVjdG9ycy50c1xuZnVuY3Rpb24gY3JlYXRlU2VsZWN0b3JzRmFjdG9yeSgpIHtcbiAgZnVuY3Rpb24gZ2V0U2VsZWN0b3JzKHNlbGVjdFN0YXRlLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7XG4gICAgICBjcmVhdGVTZWxlY3RvcjogY3JlYXRlU2VsZWN0b3IyID0gY3JlYXRlRHJhZnRTYWZlU2VsZWN0b3JcbiAgICB9ID0gb3B0aW9ucztcbiAgICBjb25zdCBzZWxlY3RJZHMgPSAoc3RhdGUpID0+IHN0YXRlLmlkcztcbiAgICBjb25zdCBzZWxlY3RFbnRpdGllcyA9IChzdGF0ZSkgPT4gc3RhdGUuZW50aXRpZXM7XG4gICAgY29uc3Qgc2VsZWN0QWxsID0gY3JlYXRlU2VsZWN0b3IyKHNlbGVjdElkcywgc2VsZWN0RW50aXRpZXMsIChpZHMsIGVudGl0aWVzKSA9PiBpZHMubWFwKChpZCkgPT4gZW50aXRpZXNbaWRdKSk7XG4gICAgY29uc3Qgc2VsZWN0SWQgPSAoXywgaWQpID0+IGlkO1xuICAgIGNvbnN0IHNlbGVjdEJ5SWQgPSAoZW50aXRpZXMsIGlkKSA9PiBlbnRpdGllc1tpZF07XG4gICAgY29uc3Qgc2VsZWN0VG90YWwgPSBjcmVhdGVTZWxlY3RvcjIoc2VsZWN0SWRzLCAoaWRzKSA9PiBpZHMubGVuZ3RoKTtcbiAgICBpZiAoIXNlbGVjdFN0YXRlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzZWxlY3RJZHMsXG4gICAgICAgIHNlbGVjdEVudGl0aWVzLFxuICAgICAgICBzZWxlY3RBbGwsXG4gICAgICAgIHNlbGVjdFRvdGFsLFxuICAgICAgICBzZWxlY3RCeUlkOiBjcmVhdGVTZWxlY3RvcjIoc2VsZWN0RW50aXRpZXMsIHNlbGVjdElkLCBzZWxlY3RCeUlkKVxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3Qgc2VsZWN0R2xvYmFsaXplZEVudGl0aWVzID0gY3JlYXRlU2VsZWN0b3IyKHNlbGVjdFN0YXRlLCBzZWxlY3RFbnRpdGllcyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNlbGVjdElkczogY3JlYXRlU2VsZWN0b3IyKHNlbGVjdFN0YXRlLCBzZWxlY3RJZHMpLFxuICAgICAgc2VsZWN0RW50aXRpZXM6IHNlbGVjdEdsb2JhbGl6ZWRFbnRpdGllcyxcbiAgICAgIHNlbGVjdEFsbDogY3JlYXRlU2VsZWN0b3IyKHNlbGVjdFN0YXRlLCBzZWxlY3RBbGwpLFxuICAgICAgc2VsZWN0VG90YWw6IGNyZWF0ZVNlbGVjdG9yMihzZWxlY3RTdGF0ZSwgc2VsZWN0VG90YWwpLFxuICAgICAgc2VsZWN0QnlJZDogY3JlYXRlU2VsZWN0b3IyKHNlbGVjdEdsb2JhbGl6ZWRFbnRpdGllcywgc2VsZWN0SWQsIHNlbGVjdEJ5SWQpXG4gICAgfTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGdldFNlbGVjdG9yc1xuICB9O1xufVxuXG4vLyBzcmMvZW50aXRpZXMvc3RhdGVfYWRhcHRlci50c1xuaW1wb3J0IHsgcHJvZHVjZSBhcyBjcmVhdGVOZXh0U3RhdGUzLCBpc0RyYWZ0IGFzIGlzRHJhZnQzIH0gZnJvbSBcImltbWVyXCI7XG52YXIgaXNEcmFmdFR5cGVkID0gaXNEcmFmdDM7XG5mdW5jdGlvbiBjcmVhdGVTaW5nbGVBcmd1bWVudFN0YXRlT3BlcmF0b3IobXV0YXRvcikge1xuICBjb25zdCBvcGVyYXRvciA9IGNyZWF0ZVN0YXRlT3BlcmF0b3IoKF8sIHN0YXRlKSA9PiBtdXRhdG9yKHN0YXRlKSk7XG4gIHJldHVybiBmdW5jdGlvbiBvcGVyYXRpb24oc3RhdGUpIHtcbiAgICByZXR1cm4gb3BlcmF0b3Ioc3RhdGUsIHZvaWQgMCk7XG4gIH07XG59XG5mdW5jdGlvbiBjcmVhdGVTdGF0ZU9wZXJhdG9yKG11dGF0b3IpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG9wZXJhdGlvbihzdGF0ZSwgYXJnKSB7XG4gICAgZnVuY3Rpb24gaXNQYXlsb2FkQWN0aW9uQXJndW1lbnQoYXJnMikge1xuICAgICAgcmV0dXJuIGlzRlNBKGFyZzIpO1xuICAgIH1cbiAgICBjb25zdCBydW5NdXRhdG9yID0gKGRyYWZ0KSA9PiB7XG4gICAgICBpZiAoaXNQYXlsb2FkQWN0aW9uQXJndW1lbnQoYXJnKSkge1xuICAgICAgICBtdXRhdG9yKGFyZy5wYXlsb2FkLCBkcmFmdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtdXRhdG9yKGFyZywgZHJhZnQpO1xuICAgICAgfVxuICAgIH07XG4gICAgaWYgKGlzRHJhZnRUeXBlZChzdGF0ZSkpIHtcbiAgICAgIHJ1bk11dGF0b3Ioc3RhdGUpO1xuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlTmV4dFN0YXRlMyhzdGF0ZSwgcnVuTXV0YXRvcik7XG4gIH07XG59XG5cbi8vIHNyYy9lbnRpdGllcy91dGlscy50c1xuaW1wb3J0IHsgY3VycmVudCBhcyBjdXJyZW50MiwgaXNEcmFmdCBhcyBpc0RyYWZ0NCB9IGZyb20gXCJpbW1lclwiO1xuZnVuY3Rpb24gc2VsZWN0SWRWYWx1ZShlbnRpdHksIHNlbGVjdElkKSB7XG4gIGNvbnN0IGtleSA9IHNlbGVjdElkKGVudGl0eSk7XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIgJiYga2V5ID09PSB2b2lkIDApIHtcbiAgICBjb25zb2xlLndhcm4oXCJUaGUgZW50aXR5IHBhc3NlZCB0byB0aGUgYHNlbGVjdElkYCBpbXBsZW1lbnRhdGlvbiByZXR1cm5lZCB1bmRlZmluZWQuXCIsIFwiWW91IHNob3VsZCBwcm9iYWJseSBwcm92aWRlIHlvdXIgb3duIGBzZWxlY3RJZGAgaW1wbGVtZW50YXRpb24uXCIsIFwiVGhlIGVudGl0eSB0aGF0IHdhcyBwYXNzZWQ6XCIsIGVudGl0eSwgXCJUaGUgYHNlbGVjdElkYCBpbXBsZW1lbnRhdGlvbjpcIiwgc2VsZWN0SWQudG9TdHJpbmcoKSk7XG4gIH1cbiAgcmV0dXJuIGtleTtcbn1cbmZ1bmN0aW9uIGVuc3VyZUVudGl0aWVzQXJyYXkoZW50aXRpZXMpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGVudGl0aWVzKSkge1xuICAgIGVudGl0aWVzID0gT2JqZWN0LnZhbHVlcyhlbnRpdGllcyk7XG4gIH1cbiAgcmV0dXJuIGVudGl0aWVzO1xufVxuZnVuY3Rpb24gZ2V0Q3VycmVudCh2YWx1ZSkge1xuICByZXR1cm4gaXNEcmFmdDQodmFsdWUpID8gY3VycmVudDIodmFsdWUpIDogdmFsdWU7XG59XG5mdW5jdGlvbiBzcGxpdEFkZGVkVXBkYXRlZEVudGl0aWVzKG5ld0VudGl0aWVzLCBzZWxlY3RJZCwgc3RhdGUpIHtcbiAgbmV3RW50aXRpZXMgPSBlbnN1cmVFbnRpdGllc0FycmF5KG5ld0VudGl0aWVzKTtcbiAgY29uc3QgZXhpc3RpbmdJZHNBcnJheSA9IGdldEN1cnJlbnQoc3RhdGUuaWRzKTtcbiAgY29uc3QgZXhpc3RpbmdJZHMgPSBuZXcgU2V0KGV4aXN0aW5nSWRzQXJyYXkpO1xuICBjb25zdCBhZGRlZCA9IFtdO1xuICBjb25zdCBhZGRlZElkcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KFtdKTtcbiAgY29uc3QgdXBkYXRlZCA9IFtdO1xuICBmb3IgKGNvbnN0IGVudGl0eSBvZiBuZXdFbnRpdGllcykge1xuICAgIGNvbnN0IGlkID0gc2VsZWN0SWRWYWx1ZShlbnRpdHksIHNlbGVjdElkKTtcbiAgICBpZiAoZXhpc3RpbmdJZHMuaGFzKGlkKSB8fCBhZGRlZElkcy5oYXMoaWQpKSB7XG4gICAgICB1cGRhdGVkLnB1c2goe1xuICAgICAgICBpZCxcbiAgICAgICAgY2hhbmdlczogZW50aXR5XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkZWRJZHMuYWRkKGlkKTtcbiAgICAgIGFkZGVkLnB1c2goZW50aXR5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFthZGRlZCwgdXBkYXRlZCwgZXhpc3RpbmdJZHNBcnJheV07XG59XG5cbi8vIHNyYy9lbnRpdGllcy91bnNvcnRlZF9zdGF0ZV9hZGFwdGVyLnRzXG5mdW5jdGlvbiBjcmVhdGVVbnNvcnRlZFN0YXRlQWRhcHRlcihzZWxlY3RJZCkge1xuICBmdW5jdGlvbiBhZGRPbmVNdXRhYmx5KGVudGl0eSwgc3RhdGUpIHtcbiAgICBjb25zdCBrZXkgPSBzZWxlY3RJZFZhbHVlKGVudGl0eSwgc2VsZWN0SWQpO1xuICAgIGlmIChrZXkgaW4gc3RhdGUuZW50aXRpZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3RhdGUuaWRzLnB1c2goa2V5KTtcbiAgICBzdGF0ZS5lbnRpdGllc1trZXldID0gZW50aXR5O1xuICB9XG4gIGZ1bmN0aW9uIGFkZE1hbnlNdXRhYmx5KG5ld0VudGl0aWVzLCBzdGF0ZSkge1xuICAgIG5ld0VudGl0aWVzID0gZW5zdXJlRW50aXRpZXNBcnJheShuZXdFbnRpdGllcyk7XG4gICAgZm9yIChjb25zdCBlbnRpdHkgb2YgbmV3RW50aXRpZXMpIHtcbiAgICAgIGFkZE9uZU11dGFibHkoZW50aXR5LCBzdGF0ZSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHNldE9uZU11dGFibHkoZW50aXR5LCBzdGF0ZSkge1xuICAgIGNvbnN0IGtleSA9IHNlbGVjdElkVmFsdWUoZW50aXR5LCBzZWxlY3RJZCk7XG4gICAgaWYgKCEoa2V5IGluIHN0YXRlLmVudGl0aWVzKSkge1xuICAgICAgc3RhdGUuaWRzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgO1xuICAgIHN0YXRlLmVudGl0aWVzW2tleV0gPSBlbnRpdHk7XG4gIH1cbiAgZnVuY3Rpb24gc2V0TWFueU11dGFibHkobmV3RW50aXRpZXMsIHN0YXRlKSB7XG4gICAgbmV3RW50aXRpZXMgPSBlbnN1cmVFbnRpdGllc0FycmF5KG5ld0VudGl0aWVzKTtcbiAgICBmb3IgKGNvbnN0IGVudGl0eSBvZiBuZXdFbnRpdGllcykge1xuICAgICAgc2V0T25lTXV0YWJseShlbnRpdHksIHN0YXRlKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gc2V0QWxsTXV0YWJseShuZXdFbnRpdGllcywgc3RhdGUpIHtcbiAgICBuZXdFbnRpdGllcyA9IGVuc3VyZUVudGl0aWVzQXJyYXkobmV3RW50aXRpZXMpO1xuICAgIHN0YXRlLmlkcyA9IFtdO1xuICAgIHN0YXRlLmVudGl0aWVzID0ge307XG4gICAgYWRkTWFueU11dGFibHkobmV3RW50aXRpZXMsIHN0YXRlKTtcbiAgfVxuICBmdW5jdGlvbiByZW1vdmVPbmVNdXRhYmx5KGtleSwgc3RhdGUpIHtcbiAgICByZXR1cm4gcmVtb3ZlTWFueU11dGFibHkoW2tleV0sIHN0YXRlKTtcbiAgfVxuICBmdW5jdGlvbiByZW1vdmVNYW55TXV0YWJseShrZXlzLCBzdGF0ZSkge1xuICAgIGxldCBkaWRNdXRhdGUgPSBmYWxzZTtcbiAgICBrZXlzLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgaWYgKGtleSBpbiBzdGF0ZS5lbnRpdGllcykge1xuICAgICAgICBkZWxldGUgc3RhdGUuZW50aXRpZXNba2V5XTtcbiAgICAgICAgZGlkTXV0YXRlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoZGlkTXV0YXRlKSB7XG4gICAgICBzdGF0ZS5pZHMgPSBzdGF0ZS5pZHMuZmlsdGVyKChpZCkgPT4gaWQgaW4gc3RhdGUuZW50aXRpZXMpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiByZW1vdmVBbGxNdXRhYmx5KHN0YXRlKSB7XG4gICAgT2JqZWN0LmFzc2lnbihzdGF0ZSwge1xuICAgICAgaWRzOiBbXSxcbiAgICAgIGVudGl0aWVzOiB7fVxuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIHRha2VOZXdLZXkoa2V5cywgdXBkYXRlLCBzdGF0ZSkge1xuICAgIGNvbnN0IG9yaWdpbmFsMyA9IHN0YXRlLmVudGl0aWVzW3VwZGF0ZS5pZF07XG4gICAgaWYgKG9yaWdpbmFsMyA9PT0gdm9pZCAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHVwZGF0ZWQgPSBPYmplY3QuYXNzaWduKHt9LCBvcmlnaW5hbDMsIHVwZGF0ZS5jaGFuZ2VzKTtcbiAgICBjb25zdCBuZXdLZXkgPSBzZWxlY3RJZFZhbHVlKHVwZGF0ZWQsIHNlbGVjdElkKTtcbiAgICBjb25zdCBoYXNOZXdLZXkgPSBuZXdLZXkgIT09IHVwZGF0ZS5pZDtcbiAgICBpZiAoaGFzTmV3S2V5KSB7XG4gICAgICBrZXlzW3VwZGF0ZS5pZF0gPSBuZXdLZXk7XG4gICAgICBkZWxldGUgc3RhdGUuZW50aXRpZXNbdXBkYXRlLmlkXTtcbiAgICB9XG4gICAgO1xuICAgIHN0YXRlLmVudGl0aWVzW25ld0tleV0gPSB1cGRhdGVkO1xuICAgIHJldHVybiBoYXNOZXdLZXk7XG4gIH1cbiAgZnVuY3Rpb24gdXBkYXRlT25lTXV0YWJseSh1cGRhdGUsIHN0YXRlKSB7XG4gICAgcmV0dXJuIHVwZGF0ZU1hbnlNdXRhYmx5KFt1cGRhdGVdLCBzdGF0ZSk7XG4gIH1cbiAgZnVuY3Rpb24gdXBkYXRlTWFueU11dGFibHkodXBkYXRlcywgc3RhdGUpIHtcbiAgICBjb25zdCBuZXdLZXlzID0ge307XG4gICAgY29uc3QgdXBkYXRlc1BlckVudGl0eSA9IHt9O1xuICAgIHVwZGF0ZXMuZm9yRWFjaCgodXBkYXRlKSA9PiB7XG4gICAgICBpZiAodXBkYXRlLmlkIGluIHN0YXRlLmVudGl0aWVzKSB7XG4gICAgICAgIHVwZGF0ZXNQZXJFbnRpdHlbdXBkYXRlLmlkXSA9IHtcbiAgICAgICAgICBpZDogdXBkYXRlLmlkLFxuICAgICAgICAgIC8vIFNwcmVhZHMgaWdub3JlIGZhbHN5IHZhbHVlcywgc28gdGhpcyB3b3JrcyBldmVuIGlmIHRoZXJlIGlzbid0XG4gICAgICAgICAgLy8gYW4gZXhpc3RpbmcgdXBkYXRlIGFscmVhZHkgYXQgdGhpcyBrZXlcbiAgICAgICAgICBjaGFuZ2VzOiB7XG4gICAgICAgICAgICAuLi51cGRhdGVzUGVyRW50aXR5W3VwZGF0ZS5pZF0/LmNoYW5nZXMsXG4gICAgICAgICAgICAuLi51cGRhdGUuY2hhbmdlc1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB1cGRhdGVzID0gT2JqZWN0LnZhbHVlcyh1cGRhdGVzUGVyRW50aXR5KTtcbiAgICBjb25zdCBkaWRNdXRhdGVFbnRpdGllcyA9IHVwZGF0ZXMubGVuZ3RoID4gMDtcbiAgICBpZiAoZGlkTXV0YXRlRW50aXRpZXMpIHtcbiAgICAgIGNvbnN0IGRpZE11dGF0ZUlkcyA9IHVwZGF0ZXMuZmlsdGVyKCh1cGRhdGUpID0+IHRha2VOZXdLZXkobmV3S2V5cywgdXBkYXRlLCBzdGF0ZSkpLmxlbmd0aCA+IDA7XG4gICAgICBpZiAoZGlkTXV0YXRlSWRzKSB7XG4gICAgICAgIHN0YXRlLmlkcyA9IE9iamVjdC52YWx1ZXMoc3RhdGUuZW50aXRpZXMpLm1hcCgoZSkgPT4gc2VsZWN0SWRWYWx1ZShlLCBzZWxlY3RJZCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB1cHNlcnRPbmVNdXRhYmx5KGVudGl0eSwgc3RhdGUpIHtcbiAgICByZXR1cm4gdXBzZXJ0TWFueU11dGFibHkoW2VudGl0eV0sIHN0YXRlKTtcbiAgfVxuICBmdW5jdGlvbiB1cHNlcnRNYW55TXV0YWJseShuZXdFbnRpdGllcywgc3RhdGUpIHtcbiAgICBjb25zdCBbYWRkZWQsIHVwZGF0ZWRdID0gc3BsaXRBZGRlZFVwZGF0ZWRFbnRpdGllcyhuZXdFbnRpdGllcywgc2VsZWN0SWQsIHN0YXRlKTtcbiAgICBhZGRNYW55TXV0YWJseShhZGRlZCwgc3RhdGUpO1xuICAgIHVwZGF0ZU1hbnlNdXRhYmx5KHVwZGF0ZWQsIHN0YXRlKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHJlbW92ZUFsbDogY3JlYXRlU2luZ2xlQXJndW1lbnRTdGF0ZU9wZXJhdG9yKHJlbW92ZUFsbE11dGFibHkpLFxuICAgIGFkZE9uZTogY3JlYXRlU3RhdGVPcGVyYXRvcihhZGRPbmVNdXRhYmx5KSxcbiAgICBhZGRNYW55OiBjcmVhdGVTdGF0ZU9wZXJhdG9yKGFkZE1hbnlNdXRhYmx5KSxcbiAgICBzZXRPbmU6IGNyZWF0ZVN0YXRlT3BlcmF0b3Ioc2V0T25lTXV0YWJseSksXG4gICAgc2V0TWFueTogY3JlYXRlU3RhdGVPcGVyYXRvcihzZXRNYW55TXV0YWJseSksXG4gICAgc2V0QWxsOiBjcmVhdGVTdGF0ZU9wZXJhdG9yKHNldEFsbE11dGFibHkpLFxuICAgIHVwZGF0ZU9uZTogY3JlYXRlU3RhdGVPcGVyYXRvcih1cGRhdGVPbmVNdXRhYmx5KSxcbiAgICB1cGRhdGVNYW55OiBjcmVhdGVTdGF0ZU9wZXJhdG9yKHVwZGF0ZU1hbnlNdXRhYmx5KSxcbiAgICB1cHNlcnRPbmU6IGNyZWF0ZVN0YXRlT3BlcmF0b3IodXBzZXJ0T25lTXV0YWJseSksXG4gICAgdXBzZXJ0TWFueTogY3JlYXRlU3RhdGVPcGVyYXRvcih1cHNlcnRNYW55TXV0YWJseSksXG4gICAgcmVtb3ZlT25lOiBjcmVhdGVTdGF0ZU9wZXJhdG9yKHJlbW92ZU9uZU11dGFibHkpLFxuICAgIHJlbW92ZU1hbnk6IGNyZWF0ZVN0YXRlT3BlcmF0b3IocmVtb3ZlTWFueU11dGFibHkpXG4gIH07XG59XG5cbi8vIHNyYy9lbnRpdGllcy9zb3J0ZWRfc3RhdGVfYWRhcHRlci50c1xuZnVuY3Rpb24gZmluZEluc2VydEluZGV4KHNvcnRlZEl0ZW1zLCBpdGVtLCBjb21wYXJpc29uRnVuY3Rpb24pIHtcbiAgbGV0IGxvd0luZGV4ID0gMDtcbiAgbGV0IGhpZ2hJbmRleCA9IHNvcnRlZEl0ZW1zLmxlbmd0aDtcbiAgd2hpbGUgKGxvd0luZGV4IDwgaGlnaEluZGV4KSB7XG4gICAgbGV0IG1pZGRsZUluZGV4ID0gbG93SW5kZXggKyBoaWdoSW5kZXggPj4+IDE7XG4gICAgY29uc3QgY3VycmVudEl0ZW0gPSBzb3J0ZWRJdGVtc1ttaWRkbGVJbmRleF07XG4gICAgY29uc3QgcmVzID0gY29tcGFyaXNvbkZ1bmN0aW9uKGl0ZW0sIGN1cnJlbnRJdGVtKTtcbiAgICBpZiAocmVzID49IDApIHtcbiAgICAgIGxvd0luZGV4ID0gbWlkZGxlSW5kZXggKyAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBoaWdoSW5kZXggPSBtaWRkbGVJbmRleDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGxvd0luZGV4O1xufVxuZnVuY3Rpb24gaW5zZXJ0KHNvcnRlZEl0ZW1zLCBpdGVtLCBjb21wYXJpc29uRnVuY3Rpb24pIHtcbiAgY29uc3QgaW5zZXJ0QXRJbmRleCA9IGZpbmRJbnNlcnRJbmRleChzb3J0ZWRJdGVtcywgaXRlbSwgY29tcGFyaXNvbkZ1bmN0aW9uKTtcbiAgc29ydGVkSXRlbXMuc3BsaWNlKGluc2VydEF0SW5kZXgsIDAsIGl0ZW0pO1xuICByZXR1cm4gc29ydGVkSXRlbXM7XG59XG5mdW5jdGlvbiBjcmVhdGVTb3J0ZWRTdGF0ZUFkYXB0ZXIoc2VsZWN0SWQsIGNvbXBhcmVyKSB7XG4gIGNvbnN0IHtcbiAgICByZW1vdmVPbmUsXG4gICAgcmVtb3ZlTWFueSxcbiAgICByZW1vdmVBbGxcbiAgfSA9IGNyZWF0ZVVuc29ydGVkU3RhdGVBZGFwdGVyKHNlbGVjdElkKTtcbiAgZnVuY3Rpb24gYWRkT25lTXV0YWJseShlbnRpdHksIHN0YXRlKSB7XG4gICAgcmV0dXJuIGFkZE1hbnlNdXRhYmx5KFtlbnRpdHldLCBzdGF0ZSk7XG4gIH1cbiAgZnVuY3Rpb24gYWRkTWFueU11dGFibHkobmV3RW50aXRpZXMsIHN0YXRlLCBleGlzdGluZ0lkcykge1xuICAgIG5ld0VudGl0aWVzID0gZW5zdXJlRW50aXRpZXNBcnJheShuZXdFbnRpdGllcyk7XG4gICAgY29uc3QgZXhpc3RpbmdLZXlzID0gbmV3IFNldChleGlzdGluZ0lkcyA/PyBnZXRDdXJyZW50KHN0YXRlLmlkcykpO1xuICAgIGNvbnN0IGFkZGVkS2V5cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gICAgY29uc3QgbW9kZWxzID0gbmV3RW50aXRpZXMuZmlsdGVyKChtb2RlbCkgPT4ge1xuICAgICAgY29uc3QgbW9kZWxJZCA9IHNlbGVjdElkVmFsdWUobW9kZWwsIHNlbGVjdElkKTtcbiAgICAgIGNvbnN0IG5vdEFkZGVkID0gIWFkZGVkS2V5cy5oYXMobW9kZWxJZCk7XG4gICAgICBpZiAobm90QWRkZWQpIGFkZGVkS2V5cy5hZGQobW9kZWxJZCk7XG4gICAgICByZXR1cm4gIWV4aXN0aW5nS2V5cy5oYXMobW9kZWxJZCkgJiYgbm90QWRkZWQ7XG4gICAgfSk7XG4gICAgaWYgKG1vZGVscy5sZW5ndGggIT09IDApIHtcbiAgICAgIG1lcmdlRnVuY3Rpb24oc3RhdGUsIG1vZGVscyk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHNldE9uZU11dGFibHkoZW50aXR5LCBzdGF0ZSkge1xuICAgIHJldHVybiBzZXRNYW55TXV0YWJseShbZW50aXR5XSwgc3RhdGUpO1xuICB9XG4gIGZ1bmN0aW9uIHNldE1hbnlNdXRhYmx5KG5ld0VudGl0aWVzLCBzdGF0ZSkge1xuICAgIGxldCBkZWR1cGxpY2F0ZWRFbnRpdGllcyA9IHt9O1xuICAgIG5ld0VudGl0aWVzID0gZW5zdXJlRW50aXRpZXNBcnJheShuZXdFbnRpdGllcyk7XG4gICAgaWYgKG5ld0VudGl0aWVzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgZm9yIChjb25zdCBpdGVtIG9mIG5ld0VudGl0aWVzKSB7XG4gICAgICAgIGNvbnN0IGVudGl0eUlkID0gc2VsZWN0SWQoaXRlbSk7XG4gICAgICAgIGRlZHVwbGljYXRlZEVudGl0aWVzW2VudGl0eUlkXSA9IGl0ZW07XG4gICAgICAgIGRlbGV0ZSBzdGF0ZS5lbnRpdGllc1tlbnRpdHlJZF07XG4gICAgICB9XG4gICAgICBuZXdFbnRpdGllcyA9IGVuc3VyZUVudGl0aWVzQXJyYXkoZGVkdXBsaWNhdGVkRW50aXRpZXMpO1xuICAgICAgbWVyZ2VGdW5jdGlvbihzdGF0ZSwgbmV3RW50aXRpZXMpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBzZXRBbGxNdXRhYmx5KG5ld0VudGl0aWVzLCBzdGF0ZSkge1xuICAgIG5ld0VudGl0aWVzID0gZW5zdXJlRW50aXRpZXNBcnJheShuZXdFbnRpdGllcyk7XG4gICAgc3RhdGUuZW50aXRpZXMgPSB7fTtcbiAgICBzdGF0ZS5pZHMgPSBbXTtcbiAgICBhZGRNYW55TXV0YWJseShuZXdFbnRpdGllcywgc3RhdGUsIFtdKTtcbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVPbmVNdXRhYmx5KHVwZGF0ZSwgc3RhdGUpIHtcbiAgICByZXR1cm4gdXBkYXRlTWFueU11dGFibHkoW3VwZGF0ZV0sIHN0YXRlKTtcbiAgfVxuICBmdW5jdGlvbiB1cGRhdGVNYW55TXV0YWJseSh1cGRhdGVzLCBzdGF0ZSkge1xuICAgIGxldCBhcHBsaWVkVXBkYXRlcyA9IGZhbHNlO1xuICAgIGxldCByZXBsYWNlZElkcyA9IGZhbHNlO1xuICAgIGZvciAobGV0IHVwZGF0ZSBvZiB1cGRhdGVzKSB7XG4gICAgICBjb25zdCBlbnRpdHkgPSBzdGF0ZS5lbnRpdGllc1t1cGRhdGUuaWRdO1xuICAgICAgaWYgKCFlbnRpdHkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBhcHBsaWVkVXBkYXRlcyA9IHRydWU7XG4gICAgICBPYmplY3QuYXNzaWduKGVudGl0eSwgdXBkYXRlLmNoYW5nZXMpO1xuICAgICAgY29uc3QgbmV3SWQgPSBzZWxlY3RJZChlbnRpdHkpO1xuICAgICAgaWYgKHVwZGF0ZS5pZCAhPT0gbmV3SWQpIHtcbiAgICAgICAgcmVwbGFjZWRJZHMgPSB0cnVlO1xuICAgICAgICBkZWxldGUgc3RhdGUuZW50aXRpZXNbdXBkYXRlLmlkXTtcbiAgICAgICAgY29uc3Qgb2xkSW5kZXggPSBzdGF0ZS5pZHMuaW5kZXhPZih1cGRhdGUuaWQpO1xuICAgICAgICBzdGF0ZS5pZHNbb2xkSW5kZXhdID0gbmV3SWQ7XG4gICAgICAgIHN0YXRlLmVudGl0aWVzW25ld0lkXSA9IGVudGl0eTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGFwcGxpZWRVcGRhdGVzKSB7XG4gICAgICBtZXJnZUZ1bmN0aW9uKHN0YXRlLCBbXSwgYXBwbGllZFVwZGF0ZXMsIHJlcGxhY2VkSWRzKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gdXBzZXJ0T25lTXV0YWJseShlbnRpdHksIHN0YXRlKSB7XG4gICAgcmV0dXJuIHVwc2VydE1hbnlNdXRhYmx5KFtlbnRpdHldLCBzdGF0ZSk7XG4gIH1cbiAgZnVuY3Rpb24gdXBzZXJ0TWFueU11dGFibHkobmV3RW50aXRpZXMsIHN0YXRlKSB7XG4gICAgY29uc3QgW2FkZGVkLCB1cGRhdGVkLCBleGlzdGluZ0lkc0FycmF5XSA9IHNwbGl0QWRkZWRVcGRhdGVkRW50aXRpZXMobmV3RW50aXRpZXMsIHNlbGVjdElkLCBzdGF0ZSk7XG4gICAgaWYgKGFkZGVkLmxlbmd0aCkge1xuICAgICAgYWRkTWFueU11dGFibHkoYWRkZWQsIHN0YXRlLCBleGlzdGluZ0lkc0FycmF5KTtcbiAgICB9XG4gICAgaWYgKHVwZGF0ZWQubGVuZ3RoKSB7XG4gICAgICB1cGRhdGVNYW55TXV0YWJseSh1cGRhdGVkLCBzdGF0ZSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGFyZUFycmF5c0VxdWFsKGEsIGIpIHtcbiAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFbaV0gPT09IGJbaV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGNvbnN0IG1lcmdlRnVuY3Rpb24gPSAoc3RhdGUsIGFkZGVkSXRlbXMsIGFwcGxpZWRVcGRhdGVzLCByZXBsYWNlZElkcykgPT4ge1xuICAgIGNvbnN0IGN1cnJlbnRFbnRpdGllcyA9IGdldEN1cnJlbnQoc3RhdGUuZW50aXRpZXMpO1xuICAgIGNvbnN0IGN1cnJlbnRJZHMgPSBnZXRDdXJyZW50KHN0YXRlLmlkcyk7XG4gICAgY29uc3Qgc3RhdGVFbnRpdGllcyA9IHN0YXRlLmVudGl0aWVzO1xuICAgIGxldCBpZHMgPSBjdXJyZW50SWRzO1xuICAgIGlmIChyZXBsYWNlZElkcykge1xuICAgICAgaWRzID0gbmV3IFNldChjdXJyZW50SWRzKTtcbiAgICB9XG4gICAgbGV0IHNvcnRlZEVudGl0aWVzID0gW107XG4gICAgZm9yIChjb25zdCBpZCBvZiBpZHMpIHtcbiAgICAgIGNvbnN0IGVudGl0eSA9IGN1cnJlbnRFbnRpdGllc1tpZF07XG4gICAgICBpZiAoZW50aXR5KSB7XG4gICAgICAgIHNvcnRlZEVudGl0aWVzLnB1c2goZW50aXR5KTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgd2FzUHJldmlvdXNseUVtcHR5ID0gc29ydGVkRW50aXRpZXMubGVuZ3RoID09PSAwO1xuICAgIGZvciAoY29uc3QgaXRlbSBvZiBhZGRlZEl0ZW1zKSB7XG4gICAgICBzdGF0ZUVudGl0aWVzW3NlbGVjdElkKGl0ZW0pXSA9IGl0ZW07XG4gICAgICBpZiAoIXdhc1ByZXZpb3VzbHlFbXB0eSkge1xuICAgICAgICBpbnNlcnQoc29ydGVkRW50aXRpZXMsIGl0ZW0sIGNvbXBhcmVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHdhc1ByZXZpb3VzbHlFbXB0eSkge1xuICAgICAgc29ydGVkRW50aXRpZXMgPSBhZGRlZEl0ZW1zLnNsaWNlKCkuc29ydChjb21wYXJlcik7XG4gICAgfSBlbHNlIGlmIChhcHBsaWVkVXBkYXRlcykge1xuICAgICAgc29ydGVkRW50aXRpZXMuc29ydChjb21wYXJlcik7XG4gICAgfVxuICAgIGNvbnN0IG5ld1NvcnRlZElkcyA9IHNvcnRlZEVudGl0aWVzLm1hcChzZWxlY3RJZCk7XG4gICAgaWYgKCFhcmVBcnJheXNFcXVhbChjdXJyZW50SWRzLCBuZXdTb3J0ZWRJZHMpKSB7XG4gICAgICBzdGF0ZS5pZHMgPSBuZXdTb3J0ZWRJZHM7XG4gICAgfVxuICB9O1xuICByZXR1cm4ge1xuICAgIHJlbW92ZU9uZSxcbiAgICByZW1vdmVNYW55LFxuICAgIHJlbW92ZUFsbCxcbiAgICBhZGRPbmU6IGNyZWF0ZVN0YXRlT3BlcmF0b3IoYWRkT25lTXV0YWJseSksXG4gICAgdXBkYXRlT25lOiBjcmVhdGVTdGF0ZU9wZXJhdG9yKHVwZGF0ZU9uZU11dGFibHkpLFxuICAgIHVwc2VydE9uZTogY3JlYXRlU3RhdGVPcGVyYXRvcih1cHNlcnRPbmVNdXRhYmx5KSxcbiAgICBzZXRPbmU6IGNyZWF0ZVN0YXRlT3BlcmF0b3Ioc2V0T25lTXV0YWJseSksXG4gICAgc2V0TWFueTogY3JlYXRlU3RhdGVPcGVyYXRvcihzZXRNYW55TXV0YWJseSksXG4gICAgc2V0QWxsOiBjcmVhdGVTdGF0ZU9wZXJhdG9yKHNldEFsbE11dGFibHkpLFxuICAgIGFkZE1hbnk6IGNyZWF0ZVN0YXRlT3BlcmF0b3IoYWRkTWFueU11dGFibHkpLFxuICAgIHVwZGF0ZU1hbnk6IGNyZWF0ZVN0YXRlT3BlcmF0b3IodXBkYXRlTWFueU11dGFibHkpLFxuICAgIHVwc2VydE1hbnk6IGNyZWF0ZVN0YXRlT3BlcmF0b3IodXBzZXJ0TWFueU11dGFibHkpXG4gIH07XG59XG5cbi8vIHNyYy9lbnRpdGllcy9jcmVhdGVfYWRhcHRlci50c1xuZnVuY3Rpb24gY3JlYXRlRW50aXR5QWRhcHRlcihvcHRpb25zID0ge30pIHtcbiAgY29uc3Qge1xuICAgIHNlbGVjdElkLFxuICAgIHNvcnRDb21wYXJlclxuICB9ID0ge1xuICAgIHNvcnRDb21wYXJlcjogZmFsc2UsXG4gICAgc2VsZWN0SWQ6IChpbnN0YW5jZSkgPT4gaW5zdGFuY2UuaWQsXG4gICAgLi4ub3B0aW9uc1xuICB9O1xuICBjb25zdCBzdGF0ZUFkYXB0ZXIgPSBzb3J0Q29tcGFyZXIgPyBjcmVhdGVTb3J0ZWRTdGF0ZUFkYXB0ZXIoc2VsZWN0SWQsIHNvcnRDb21wYXJlcikgOiBjcmVhdGVVbnNvcnRlZFN0YXRlQWRhcHRlcihzZWxlY3RJZCk7XG4gIGNvbnN0IHN0YXRlRmFjdG9yeSA9IGNyZWF0ZUluaXRpYWxTdGF0ZUZhY3Rvcnkoc3RhdGVBZGFwdGVyKTtcbiAgY29uc3Qgc2VsZWN0b3JzRmFjdG9yeSA9IGNyZWF0ZVNlbGVjdG9yc0ZhY3RvcnkoKTtcbiAgcmV0dXJuIHtcbiAgICBzZWxlY3RJZCxcbiAgICBzb3J0Q29tcGFyZXIsXG4gICAgLi4uc3RhdGVGYWN0b3J5LFxuICAgIC4uLnNlbGVjdG9yc0ZhY3RvcnksXG4gICAgLi4uc3RhdGVBZGFwdGVyXG4gIH07XG59XG5cbi8vIHNyYy9saXN0ZW5lck1pZGRsZXdhcmUvaW5kZXgudHNcbmltcG9ydCB7IGlzQWN0aW9uIGFzIGlzQWN0aW9uMyB9IGZyb20gXCJyZWR1eFwiO1xuXG4vLyBzcmMvbGlzdGVuZXJNaWRkbGV3YXJlL2V4Y2VwdGlvbnMudHNcbnZhciB0YXNrID0gXCJ0YXNrXCI7XG52YXIgbGlzdGVuZXIgPSBcImxpc3RlbmVyXCI7XG52YXIgY29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcbnZhciBjYW5jZWxsZWQgPSBcImNhbmNlbGxlZFwiO1xudmFyIHRhc2tDYW5jZWxsZWQgPSBgdGFzay0ke2NhbmNlbGxlZH1gO1xudmFyIHRhc2tDb21wbGV0ZWQgPSBgdGFzay0ke2NvbXBsZXRlZH1gO1xudmFyIGxpc3RlbmVyQ2FuY2VsbGVkID0gYCR7bGlzdGVuZXJ9LSR7Y2FuY2VsbGVkfWA7XG52YXIgbGlzdGVuZXJDb21wbGV0ZWQgPSBgJHtsaXN0ZW5lcn0tJHtjb21wbGV0ZWR9YDtcbnZhciBUYXNrQWJvcnRFcnJvciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoY29kZSkge1xuICAgIHRoaXMuY29kZSA9IGNvZGU7XG4gICAgdGhpcy5tZXNzYWdlID0gYCR7dGFza30gJHtjYW5jZWxsZWR9IChyZWFzb246ICR7Y29kZX0pYDtcbiAgfVxuICBuYW1lID0gXCJUYXNrQWJvcnRFcnJvclwiO1xuICBtZXNzYWdlO1xufTtcblxuLy8gc3JjL2xpc3RlbmVyTWlkZGxld2FyZS91dGlscy50c1xudmFyIGFzc2VydEZ1bmN0aW9uID0gKGZ1bmMsIGV4cGVjdGVkKSA9PiB7XG4gIGlmICh0eXBlb2YgZnVuYyAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDMyKSA6IGAke2V4cGVjdGVkfSBpcyBub3QgYSBmdW5jdGlvbmApO1xuICB9XG59O1xudmFyIG5vb3AyID0gKCkgPT4ge1xufTtcbnZhciBjYXRjaFJlamVjdGlvbiA9IChwcm9taXNlLCBvbkVycm9yID0gbm9vcDIpID0+IHtcbiAgcHJvbWlzZS5jYXRjaChvbkVycm9yKTtcbiAgcmV0dXJuIHByb21pc2U7XG59O1xudmFyIGFkZEFib3J0U2lnbmFsTGlzdGVuZXIgPSAoYWJvcnRTaWduYWwsIGNhbGxiYWNrKSA9PiB7XG4gIGFib3J0U2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBjYWxsYmFjaywge1xuICAgIG9uY2U6IHRydWVcbiAgfSk7XG4gIHJldHVybiAoKSA9PiBhYm9ydFNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgY2FsbGJhY2spO1xufTtcbnZhciBhYm9ydENvbnRyb2xsZXJXaXRoUmVhc29uID0gKGFib3J0Q29udHJvbGxlciwgcmVhc29uKSA9PiB7XG4gIGNvbnN0IHNpZ25hbCA9IGFib3J0Q29udHJvbGxlci5zaWduYWw7XG4gIGlmIChzaWduYWwuYWJvcnRlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoIShcInJlYXNvblwiIGluIHNpZ25hbCkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2lnbmFsLCBcInJlYXNvblwiLCB7XG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgdmFsdWU6IHJlYXNvbixcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH1cbiAgO1xuICBhYm9ydENvbnRyb2xsZXIuYWJvcnQocmVhc29uKTtcbn07XG5cbi8vIHNyYy9saXN0ZW5lck1pZGRsZXdhcmUvdGFzay50c1xudmFyIHZhbGlkYXRlQWN0aXZlID0gKHNpZ25hbCkgPT4ge1xuICBpZiAoc2lnbmFsLmFib3J0ZWQpIHtcbiAgICBjb25zdCB7XG4gICAgICByZWFzb25cbiAgICB9ID0gc2lnbmFsO1xuICAgIHRocm93IG5ldyBUYXNrQWJvcnRFcnJvcihyZWFzb24pO1xuICB9XG59O1xuZnVuY3Rpb24gcmFjZVdpdGhTaWduYWwoc2lnbmFsLCBwcm9taXNlKSB7XG4gIGxldCBjbGVhbnVwID0gbm9vcDI7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgbm90aWZ5UmVqZWN0aW9uID0gKCkgPT4gcmVqZWN0KG5ldyBUYXNrQWJvcnRFcnJvcihzaWduYWwucmVhc29uKSk7XG4gICAgaWYgKHNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICBub3RpZnlSZWplY3Rpb24oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY2xlYW51cCA9IGFkZEFib3J0U2lnbmFsTGlzdGVuZXIoc2lnbmFsLCBub3RpZnlSZWplY3Rpb24pO1xuICAgIHByb21pc2UuZmluYWxseSgoKSA9PiBjbGVhbnVwKCkpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgY2xlYW51cCA9IG5vb3AyO1xuICB9KTtcbn1cbnZhciBydW5UYXNrID0gYXN5bmMgKHRhc2syLCBjbGVhblVwKSA9PiB7XG4gIHRyeSB7XG4gICAgYXdhaXQgUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgY29uc3QgdmFsdWUgPSBhd2FpdCB0YXNrMigpO1xuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXM6IFwib2tcIixcbiAgICAgIHZhbHVlXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzOiBlcnJvciBpbnN0YW5jZW9mIFRhc2tBYm9ydEVycm9yID8gXCJjYW5jZWxsZWRcIiA6IFwicmVqZWN0ZWRcIixcbiAgICAgIGVycm9yXG4gICAgfTtcbiAgfSBmaW5hbGx5IHtcbiAgICBjbGVhblVwPy4oKTtcbiAgfVxufTtcbnZhciBjcmVhdGVQYXVzZSA9IChzaWduYWwpID0+IHtcbiAgcmV0dXJuIChwcm9taXNlKSA9PiB7XG4gICAgcmV0dXJuIGNhdGNoUmVqZWN0aW9uKHJhY2VXaXRoU2lnbmFsKHNpZ25hbCwgcHJvbWlzZSkudGhlbigob3V0cHV0KSA9PiB7XG4gICAgICB2YWxpZGF0ZUFjdGl2ZShzaWduYWwpO1xuICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9KSk7XG4gIH07XG59O1xudmFyIGNyZWF0ZURlbGF5ID0gKHNpZ25hbCkgPT4ge1xuICBjb25zdCBwYXVzZSA9IGNyZWF0ZVBhdXNlKHNpZ25hbCk7XG4gIHJldHVybiAodGltZW91dE1zKSA9PiB7XG4gICAgcmV0dXJuIHBhdXNlKG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIHRpbWVvdXRNcykpKTtcbiAgfTtcbn07XG5cbi8vIHNyYy9saXN0ZW5lck1pZGRsZXdhcmUvaW5kZXgudHNcbnZhciB7XG4gIGFzc2lnblxufSA9IE9iamVjdDtcbnZhciBJTlRFUk5BTF9OSUxfVE9LRU4gPSB7fTtcbnZhciBhbG0gPSBcImxpc3RlbmVyTWlkZGxld2FyZVwiO1xudmFyIGNyZWF0ZUZvcmsgPSAocGFyZW50QWJvcnRTaWduYWwsIHBhcmVudEJsb2NraW5nUHJvbWlzZXMpID0+IHtcbiAgY29uc3QgbGlua0NvbnRyb2xsZXJzID0gKGNvbnRyb2xsZXIpID0+IGFkZEFib3J0U2lnbmFsTGlzdGVuZXIocGFyZW50QWJvcnRTaWduYWwsICgpID0+IGFib3J0Q29udHJvbGxlcldpdGhSZWFzb24oY29udHJvbGxlciwgcGFyZW50QWJvcnRTaWduYWwucmVhc29uKSk7XG4gIHJldHVybiAodGFza0V4ZWN1dG9yLCBvcHRzKSA9PiB7XG4gICAgYXNzZXJ0RnVuY3Rpb24odGFza0V4ZWN1dG9yLCBcInRhc2tFeGVjdXRvclwiKTtcbiAgICBjb25zdCBjaGlsZEFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBsaW5rQ29udHJvbGxlcnMoY2hpbGRBYm9ydENvbnRyb2xsZXIpO1xuICAgIGNvbnN0IHJlc3VsdCA9IHJ1blRhc2soYXN5bmMgKCkgPT4ge1xuICAgICAgdmFsaWRhdGVBY3RpdmUocGFyZW50QWJvcnRTaWduYWwpO1xuICAgICAgdmFsaWRhdGVBY3RpdmUoY2hpbGRBYm9ydENvbnRyb2xsZXIuc2lnbmFsKTtcbiAgICAgIGNvbnN0IHJlc3VsdDIgPSBhd2FpdCB0YXNrRXhlY3V0b3Ioe1xuICAgICAgICBwYXVzZTogY3JlYXRlUGF1c2UoY2hpbGRBYm9ydENvbnRyb2xsZXIuc2lnbmFsKSxcbiAgICAgICAgZGVsYXk6IGNyZWF0ZURlbGF5KGNoaWxkQWJvcnRDb250cm9sbGVyLnNpZ25hbCksXG4gICAgICAgIHNpZ25hbDogY2hpbGRBYm9ydENvbnRyb2xsZXIuc2lnbmFsXG4gICAgICB9KTtcbiAgICAgIHZhbGlkYXRlQWN0aXZlKGNoaWxkQWJvcnRDb250cm9sbGVyLnNpZ25hbCk7XG4gICAgICByZXR1cm4gcmVzdWx0MjtcbiAgICB9LCAoKSA9PiBhYm9ydENvbnRyb2xsZXJXaXRoUmVhc29uKGNoaWxkQWJvcnRDb250cm9sbGVyLCB0YXNrQ29tcGxldGVkKSk7XG4gICAgaWYgKG9wdHM/LmF1dG9Kb2luKSB7XG4gICAgICBwYXJlbnRCbG9ja2luZ1Byb21pc2VzLnB1c2gocmVzdWx0LmNhdGNoKG5vb3AyKSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXN1bHQ6IGNyZWF0ZVBhdXNlKHBhcmVudEFib3J0U2lnbmFsKShyZXN1bHQpLFxuICAgICAgY2FuY2VsKCkge1xuICAgICAgICBhYm9ydENvbnRyb2xsZXJXaXRoUmVhc29uKGNoaWxkQWJvcnRDb250cm9sbGVyLCB0YXNrQ2FuY2VsbGVkKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xufTtcbnZhciBjcmVhdGVUYWtlUGF0dGVybiA9IChzdGFydExpc3RlbmluZywgc2lnbmFsKSA9PiB7XG4gIGNvbnN0IHRha2UgPSBhc3luYyAocHJlZGljYXRlLCB0aW1lb3V0KSA9PiB7XG4gICAgdmFsaWRhdGVBY3RpdmUoc2lnbmFsKTtcbiAgICBsZXQgdW5zdWJzY3JpYmUgPSAoKSA9PiB7XG4gICAgfTtcbiAgICBjb25zdCB0dXBsZVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgc3RvcExpc3RlbmluZyA9IHN0YXJ0TGlzdGVuaW5nKHtcbiAgICAgICAgcHJlZGljYXRlLFxuICAgICAgICBlZmZlY3Q6IChhY3Rpb24sIGxpc3RlbmVyQXBpKSA9PiB7XG4gICAgICAgICAgbGlzdGVuZXJBcGkudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICByZXNvbHZlKFthY3Rpb24sIGxpc3RlbmVyQXBpLmdldFN0YXRlKCksIGxpc3RlbmVyQXBpLmdldE9yaWdpbmFsU3RhdGUoKV0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHVuc3Vic2NyaWJlID0gKCkgPT4ge1xuICAgICAgICBzdG9wTGlzdGVuaW5nKCk7XG4gICAgICAgIHJlamVjdCgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgICBjb25zdCBwcm9taXNlcyA9IFt0dXBsZVByb21pc2VdO1xuICAgIGlmICh0aW1lb3V0ICE9IG51bGwpIHtcbiAgICAgIHByb21pc2VzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZW91dCwgbnVsbCkpKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG91dHB1dCA9IGF3YWl0IHJhY2VXaXRoU2lnbmFsKHNpZ25hbCwgUHJvbWlzZS5yYWNlKHByb21pc2VzKSk7XG4gICAgICB2YWxpZGF0ZUFjdGl2ZShzaWduYWwpO1xuICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiAocHJlZGljYXRlLCB0aW1lb3V0KSA9PiBjYXRjaFJlamVjdGlvbih0YWtlKHByZWRpY2F0ZSwgdGltZW91dCkpO1xufTtcbnZhciBnZXRMaXN0ZW5lckVudHJ5UHJvcHNGcm9tID0gKG9wdGlvbnMpID0+IHtcbiAgbGV0IHtcbiAgICB0eXBlLFxuICAgIGFjdGlvbkNyZWF0b3IsXG4gICAgbWF0Y2hlcixcbiAgICBwcmVkaWNhdGUsXG4gICAgZWZmZWN0XG4gIH0gPSBvcHRpb25zO1xuICBpZiAodHlwZSkge1xuICAgIHByZWRpY2F0ZSA9IGNyZWF0ZUFjdGlvbih0eXBlKS5tYXRjaDtcbiAgfSBlbHNlIGlmIChhY3Rpb25DcmVhdG9yKSB7XG4gICAgdHlwZSA9IGFjdGlvbkNyZWF0b3IudHlwZTtcbiAgICBwcmVkaWNhdGUgPSBhY3Rpb25DcmVhdG9yLm1hdGNoO1xuICB9IGVsc2UgaWYgKG1hdGNoZXIpIHtcbiAgICBwcmVkaWNhdGUgPSBtYXRjaGVyO1xuICB9IGVsc2UgaWYgKHByZWRpY2F0ZSkge1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDIxKSA6IFwiQ3JlYXRpbmcgb3IgcmVtb3ZpbmcgYSBsaXN0ZW5lciByZXF1aXJlcyBvbmUgb2YgdGhlIGtub3duIGZpZWxkcyBmb3IgbWF0Y2hpbmcgYW4gYWN0aW9uXCIpO1xuICB9XG4gIGFzc2VydEZ1bmN0aW9uKGVmZmVjdCwgXCJvcHRpb25zLmxpc3RlbmVyXCIpO1xuICByZXR1cm4ge1xuICAgIHByZWRpY2F0ZSxcbiAgICB0eXBlLFxuICAgIGVmZmVjdFxuICB9O1xufTtcbnZhciBjcmVhdGVMaXN0ZW5lckVudHJ5ID0gLyogQF9fUFVSRV9fICovIGFzc2lnbigob3B0aW9ucykgPT4ge1xuICBjb25zdCB7XG4gICAgdHlwZSxcbiAgICBwcmVkaWNhdGUsXG4gICAgZWZmZWN0XG4gIH0gPSBnZXRMaXN0ZW5lckVudHJ5UHJvcHNGcm9tKG9wdGlvbnMpO1xuICBjb25zdCBlbnRyeSA9IHtcbiAgICBpZDogbmFub2lkKCksXG4gICAgZWZmZWN0LFxuICAgIHR5cGUsXG4gICAgcHJlZGljYXRlLFxuICAgIHBlbmRpbmc6IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCksXG4gICAgdW5zdWJzY3JpYmU6ICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCIgPyBmb3JtYXRQcm9kRXJyb3JNZXNzYWdlKDIyKSA6IFwiVW5zdWJzY3JpYmUgbm90IGluaXRpYWxpemVkXCIpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGVudHJ5O1xufSwge1xuICB3aXRoVHlwZXM6ICgpID0+IGNyZWF0ZUxpc3RlbmVyRW50cnlcbn0pO1xudmFyIGZpbmRMaXN0ZW5lckVudHJ5ID0gKGxpc3RlbmVyTWFwLCBvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHtcbiAgICB0eXBlLFxuICAgIGVmZmVjdCxcbiAgICBwcmVkaWNhdGVcbiAgfSA9IGdldExpc3RlbmVyRW50cnlQcm9wc0Zyb20ob3B0aW9ucyk7XG4gIHJldHVybiBBcnJheS5mcm9tKGxpc3RlbmVyTWFwLnZhbHVlcygpKS5maW5kKChlbnRyeSkgPT4ge1xuICAgIGNvbnN0IG1hdGNoUHJlZGljYXRlT3JUeXBlID0gdHlwZW9mIHR5cGUgPT09IFwic3RyaW5nXCIgPyBlbnRyeS50eXBlID09PSB0eXBlIDogZW50cnkucHJlZGljYXRlID09PSBwcmVkaWNhdGU7XG4gICAgcmV0dXJuIG1hdGNoUHJlZGljYXRlT3JUeXBlICYmIGVudHJ5LmVmZmVjdCA9PT0gZWZmZWN0O1xuICB9KTtcbn07XG52YXIgY2FuY2VsQWN0aXZlTGlzdGVuZXJzID0gKGVudHJ5KSA9PiB7XG4gIGVudHJ5LnBlbmRpbmcuZm9yRWFjaCgoY29udHJvbGxlcikgPT4ge1xuICAgIGFib3J0Q29udHJvbGxlcldpdGhSZWFzb24oY29udHJvbGxlciwgbGlzdGVuZXJDYW5jZWxsZWQpO1xuICB9KTtcbn07XG52YXIgY3JlYXRlQ2xlYXJMaXN0ZW5lck1pZGRsZXdhcmUgPSAobGlzdGVuZXJNYXAsIGV4ZWN1dGluZ0xpc3RlbmVycykgPT4ge1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgbGlzdGVuZXIyIG9mIGV4ZWN1dGluZ0xpc3RlbmVycy5rZXlzKCkpIHtcbiAgICAgIGNhbmNlbEFjdGl2ZUxpc3RlbmVycyhsaXN0ZW5lcjIpO1xuICAgIH1cbiAgICBsaXN0ZW5lck1hcC5jbGVhcigpO1xuICB9O1xufTtcbnZhciBzYWZlbHlOb3RpZnlFcnJvciA9IChlcnJvckhhbmRsZXIsIGVycm9yVG9Ob3RpZnksIGVycm9ySW5mbykgPT4ge1xuICB0cnkge1xuICAgIGVycm9ySGFuZGxlcihlcnJvclRvTm90aWZ5LCBlcnJvckluZm8pO1xuICB9IGNhdGNoIChlcnJvckhhbmRsZXJFcnJvcikge1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhyb3cgZXJyb3JIYW5kbGVyRXJyb3I7XG4gICAgfSwgMCk7XG4gIH1cbn07XG52YXIgYWRkTGlzdGVuZXIgPSAvKiBAX19QVVJFX18gKi8gYXNzaWduKC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVBY3Rpb24oYCR7YWxtfS9hZGRgKSwge1xuICB3aXRoVHlwZXM6ICgpID0+IGFkZExpc3RlbmVyXG59KTtcbnZhciBjbGVhckFsbExpc3RlbmVycyA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVBY3Rpb24oYCR7YWxtfS9yZW1vdmVBbGxgKTtcbnZhciByZW1vdmVMaXN0ZW5lciA9IC8qIEBfX1BVUkVfXyAqLyBhc3NpZ24oLyogQF9fUFVSRV9fICovIGNyZWF0ZUFjdGlvbihgJHthbG19L3JlbW92ZWApLCB7XG4gIHdpdGhUeXBlczogKCkgPT4gcmVtb3ZlTGlzdGVuZXJcbn0pO1xudmFyIGRlZmF1bHRFcnJvckhhbmRsZXIgPSAoLi4uYXJncykgPT4ge1xuICBjb25zb2xlLmVycm9yKGAke2FsbX0vZXJyb3JgLCAuLi5hcmdzKTtcbn07XG52YXIgY3JlYXRlTGlzdGVuZXJNaWRkbGV3YXJlID0gKG1pZGRsZXdhcmVPcHRpb25zID0ge30pID0+IHtcbiAgY29uc3QgbGlzdGVuZXJNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBjb25zdCBleGVjdXRpbmdMaXN0ZW5lcnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBjb25zdCB0cmFja0V4ZWN1dGluZ0xpc3RlbmVyID0gKGVudHJ5KSA9PiB7XG4gICAgY29uc3QgY291bnQgPSBleGVjdXRpbmdMaXN0ZW5lcnMuZ2V0KGVudHJ5KSA/PyAwO1xuICAgIGV4ZWN1dGluZ0xpc3RlbmVycy5zZXQoZW50cnksIGNvdW50ICsgMSk7XG4gIH07XG4gIGNvbnN0IHVudHJhY2tFeGVjdXRpbmdMaXN0ZW5lciA9IChlbnRyeSkgPT4ge1xuICAgIGNvbnN0IGNvdW50ID0gZXhlY3V0aW5nTGlzdGVuZXJzLmdldChlbnRyeSkgPz8gMTtcbiAgICBpZiAoY291bnQgPT09IDEpIHtcbiAgICAgIGV4ZWN1dGluZ0xpc3RlbmVycy5kZWxldGUoZW50cnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleGVjdXRpbmdMaXN0ZW5lcnMuc2V0KGVudHJ5LCBjb3VudCAtIDEpO1xuICAgIH1cbiAgfTtcbiAgY29uc3Qge1xuICAgIGV4dHJhLFxuICAgIG9uRXJyb3IgPSBkZWZhdWx0RXJyb3JIYW5kbGVyXG4gIH0gPSBtaWRkbGV3YXJlT3B0aW9ucztcbiAgYXNzZXJ0RnVuY3Rpb24ob25FcnJvciwgXCJvbkVycm9yXCIpO1xuICBjb25zdCBpbnNlcnRFbnRyeSA9IChlbnRyeSkgPT4ge1xuICAgIGVudHJ5LnVuc3Vic2NyaWJlID0gKCkgPT4gbGlzdGVuZXJNYXAuZGVsZXRlKGVudHJ5LmlkKTtcbiAgICBsaXN0ZW5lck1hcC5zZXQoZW50cnkuaWQsIGVudHJ5KTtcbiAgICByZXR1cm4gKGNhbmNlbE9wdGlvbnMpID0+IHtcbiAgICAgIGVudHJ5LnVuc3Vic2NyaWJlKCk7XG4gICAgICBpZiAoY2FuY2VsT3B0aW9ucz8uY2FuY2VsQWN0aXZlKSB7XG4gICAgICAgIGNhbmNlbEFjdGl2ZUxpc3RlbmVycyhlbnRyeSk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcbiAgY29uc3Qgc3RhcnRMaXN0ZW5pbmcgPSAob3B0aW9ucykgPT4ge1xuICAgIGNvbnN0IGVudHJ5ID0gZmluZExpc3RlbmVyRW50cnkobGlzdGVuZXJNYXAsIG9wdGlvbnMpID8/IGNyZWF0ZUxpc3RlbmVyRW50cnkob3B0aW9ucyk7XG4gICAgcmV0dXJuIGluc2VydEVudHJ5KGVudHJ5KTtcbiAgfTtcbiAgYXNzaWduKHN0YXJ0TGlzdGVuaW5nLCB7XG4gICAgd2l0aFR5cGVzOiAoKSA9PiBzdGFydExpc3RlbmluZ1xuICB9KTtcbiAgY29uc3Qgc3RvcExpc3RlbmluZyA9IChvcHRpb25zKSA9PiB7XG4gICAgY29uc3QgZW50cnkgPSBmaW5kTGlzdGVuZXJFbnRyeShsaXN0ZW5lck1hcCwgb3B0aW9ucyk7XG4gICAgaWYgKGVudHJ5KSB7XG4gICAgICBlbnRyeS51bnN1YnNjcmliZSgpO1xuICAgICAgaWYgKG9wdGlvbnMuY2FuY2VsQWN0aXZlKSB7XG4gICAgICAgIGNhbmNlbEFjdGl2ZUxpc3RlbmVycyhlbnRyeSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAhIWVudHJ5O1xuICB9O1xuICBhc3NpZ24oc3RvcExpc3RlbmluZywge1xuICAgIHdpdGhUeXBlczogKCkgPT4gc3RvcExpc3RlbmluZ1xuICB9KTtcbiAgY29uc3Qgbm90aWZ5TGlzdGVuZXIgPSBhc3luYyAoZW50cnksIGFjdGlvbiwgYXBpLCBnZXRPcmlnaW5hbFN0YXRlKSA9PiB7XG4gICAgY29uc3QgaW50ZXJuYWxUYXNrQ29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICBjb25zdCB0YWtlID0gY3JlYXRlVGFrZVBhdHRlcm4oc3RhcnRMaXN0ZW5pbmcsIGludGVybmFsVGFza0NvbnRyb2xsZXIuc2lnbmFsKTtcbiAgICBjb25zdCBhdXRvSm9pblByb21pc2VzID0gW107XG4gICAgdHJ5IHtcbiAgICAgIGVudHJ5LnBlbmRpbmcuYWRkKGludGVybmFsVGFza0NvbnRyb2xsZXIpO1xuICAgICAgdHJhY2tFeGVjdXRpbmdMaXN0ZW5lcihlbnRyeSk7XG4gICAgICBhd2FpdCBQcm9taXNlLnJlc29sdmUoZW50cnkuZWZmZWN0KFxuICAgICAgICBhY3Rpb24sXG4gICAgICAgIC8vIFVzZSBhc3NpZ24oKSByYXRoZXIgdGhhbiAuLi4gdG8gYXZvaWQgZXh0cmEgaGVscGVyIGZ1bmN0aW9ucyBhZGRlZCB0byBidW5kbGVcbiAgICAgICAgYXNzaWduKHt9LCBhcGksIHtcbiAgICAgICAgICBnZXRPcmlnaW5hbFN0YXRlLFxuICAgICAgICAgIGNvbmRpdGlvbjogKHByZWRpY2F0ZSwgdGltZW91dCkgPT4gdGFrZShwcmVkaWNhdGUsIHRpbWVvdXQpLnRoZW4oQm9vbGVhbiksXG4gICAgICAgICAgdGFrZSxcbiAgICAgICAgICBkZWxheTogY3JlYXRlRGVsYXkoaW50ZXJuYWxUYXNrQ29udHJvbGxlci5zaWduYWwpLFxuICAgICAgICAgIHBhdXNlOiBjcmVhdGVQYXVzZShpbnRlcm5hbFRhc2tDb250cm9sbGVyLnNpZ25hbCksXG4gICAgICAgICAgZXh0cmEsXG4gICAgICAgICAgc2lnbmFsOiBpbnRlcm5hbFRhc2tDb250cm9sbGVyLnNpZ25hbCxcbiAgICAgICAgICBmb3JrOiBjcmVhdGVGb3JrKGludGVybmFsVGFza0NvbnRyb2xsZXIuc2lnbmFsLCBhdXRvSm9pblByb21pc2VzKSxcbiAgICAgICAgICB1bnN1YnNjcmliZTogZW50cnkudW5zdWJzY3JpYmUsXG4gICAgICAgICAgc3Vic2NyaWJlOiAoKSA9PiB7XG4gICAgICAgICAgICBsaXN0ZW5lck1hcC5zZXQoZW50cnkuaWQsIGVudHJ5KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNhbmNlbEFjdGl2ZUxpc3RlbmVyczogKCkgPT4ge1xuICAgICAgICAgICAgZW50cnkucGVuZGluZy5mb3JFYWNoKChjb250cm9sbGVyLCBfLCBzZXQpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIgIT09IGludGVybmFsVGFza0NvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgICAgICBhYm9ydENvbnRyb2xsZXJXaXRoUmVhc29uKGNvbnRyb2xsZXIsIGxpc3RlbmVyQ2FuY2VsbGVkKTtcbiAgICAgICAgICAgICAgICBzZXQuZGVsZXRlKGNvbnRyb2xsZXIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNhbmNlbDogKCkgPT4ge1xuICAgICAgICAgICAgYWJvcnRDb250cm9sbGVyV2l0aFJlYXNvbihpbnRlcm5hbFRhc2tDb250cm9sbGVyLCBsaXN0ZW5lckNhbmNlbGxlZCk7XG4gICAgICAgICAgICBlbnRyeS5wZW5kaW5nLmRlbGV0ZShpbnRlcm5hbFRhc2tDb250cm9sbGVyKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRocm93SWZDYW5jZWxsZWQ6ICgpID0+IHtcbiAgICAgICAgICAgIHZhbGlkYXRlQWN0aXZlKGludGVybmFsVGFza0NvbnRyb2xsZXIuc2lnbmFsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApKTtcbiAgICB9IGNhdGNoIChsaXN0ZW5lckVycm9yKSB7XG4gICAgICBpZiAoIShsaXN0ZW5lckVycm9yIGluc3RhbmNlb2YgVGFza0Fib3J0RXJyb3IpKSB7XG4gICAgICAgIHNhZmVseU5vdGlmeUVycm9yKG9uRXJyb3IsIGxpc3RlbmVyRXJyb3IsIHtcbiAgICAgICAgICByYWlzZWRCeTogXCJlZmZlY3RcIlxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoYXV0b0pvaW5Qcm9taXNlcyk7XG4gICAgICBhYm9ydENvbnRyb2xsZXJXaXRoUmVhc29uKGludGVybmFsVGFza0NvbnRyb2xsZXIsIGxpc3RlbmVyQ29tcGxldGVkKTtcbiAgICAgIHVudHJhY2tFeGVjdXRpbmdMaXN0ZW5lcihlbnRyeSk7XG4gICAgICBlbnRyeS5wZW5kaW5nLmRlbGV0ZShpbnRlcm5hbFRhc2tDb250cm9sbGVyKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IGNsZWFyTGlzdGVuZXJNaWRkbGV3YXJlID0gY3JlYXRlQ2xlYXJMaXN0ZW5lck1pZGRsZXdhcmUobGlzdGVuZXJNYXAsIGV4ZWN1dGluZ0xpc3RlbmVycyk7XG4gIGNvbnN0IG1pZGRsZXdhcmUgPSAoYXBpKSA9PiAobmV4dCkgPT4gKGFjdGlvbikgPT4ge1xuICAgIGlmICghaXNBY3Rpb24zKGFjdGlvbikpIHtcbiAgICAgIHJldHVybiBuZXh0KGFjdGlvbik7XG4gICAgfVxuICAgIGlmIChhZGRMaXN0ZW5lci5tYXRjaChhY3Rpb24pKSB7XG4gICAgICByZXR1cm4gc3RhcnRMaXN0ZW5pbmcoYWN0aW9uLnBheWxvYWQpO1xuICAgIH1cbiAgICBpZiAoY2xlYXJBbGxMaXN0ZW5lcnMubWF0Y2goYWN0aW9uKSkge1xuICAgICAgY2xlYXJMaXN0ZW5lck1pZGRsZXdhcmUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHJlbW92ZUxpc3RlbmVyLm1hdGNoKGFjdGlvbikpIHtcbiAgICAgIHJldHVybiBzdG9wTGlzdGVuaW5nKGFjdGlvbi5wYXlsb2FkKTtcbiAgICB9XG4gICAgbGV0IG9yaWdpbmFsU3RhdGUgPSBhcGkuZ2V0U3RhdGUoKTtcbiAgICBjb25zdCBnZXRPcmlnaW5hbFN0YXRlID0gKCkgPT4ge1xuICAgICAgaWYgKG9yaWdpbmFsU3RhdGUgPT09IElOVEVSTkFMX05JTF9UT0tFTikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgyMykgOiBgJHthbG19OiBnZXRPcmlnaW5hbFN0YXRlIGNhbiBvbmx5IGJlIGNhbGxlZCBzeW5jaHJvbm91c2x5YCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3JpZ2luYWxTdGF0ZTtcbiAgICB9O1xuICAgIGxldCByZXN1bHQ7XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IG5leHQoYWN0aW9uKTtcbiAgICAgIGlmIChsaXN0ZW5lck1hcC5zaXplID4gMCkge1xuICAgICAgICBjb25zdCBjdXJyZW50U3RhdGUgPSBhcGkuZ2V0U3RhdGUoKTtcbiAgICAgICAgY29uc3QgbGlzdGVuZXJFbnRyaWVzID0gQXJyYXkuZnJvbShsaXN0ZW5lck1hcC52YWx1ZXMoKSk7XG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgbGlzdGVuZXJFbnRyaWVzKSB7XG4gICAgICAgICAgbGV0IHJ1bkxpc3RlbmVyID0gZmFsc2U7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJ1bkxpc3RlbmVyID0gZW50cnkucHJlZGljYXRlKGFjdGlvbiwgY3VycmVudFN0YXRlLCBvcmlnaW5hbFN0YXRlKTtcbiAgICAgICAgICB9IGNhdGNoIChwcmVkaWNhdGVFcnJvcikge1xuICAgICAgICAgICAgcnVuTGlzdGVuZXIgPSBmYWxzZTtcbiAgICAgICAgICAgIHNhZmVseU5vdGlmeUVycm9yKG9uRXJyb3IsIHByZWRpY2F0ZUVycm9yLCB7XG4gICAgICAgICAgICAgIHJhaXNlZEJ5OiBcInByZWRpY2F0ZVwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFydW5MaXN0ZW5lcikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5vdGlmeUxpc3RlbmVyKGVudHJ5LCBhY3Rpb24sIGFwaSwgZ2V0T3JpZ2luYWxTdGF0ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgb3JpZ2luYWxTdGF0ZSA9IElOVEVSTkFMX05JTF9UT0tFTjtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBtaWRkbGV3YXJlLFxuICAgIHN0YXJ0TGlzdGVuaW5nLFxuICAgIHN0b3BMaXN0ZW5pbmcsXG4gICAgY2xlYXJMaXN0ZW5lcnM6IGNsZWFyTGlzdGVuZXJNaWRkbGV3YXJlXG4gIH07XG59O1xuXG4vLyBzcmMvZHluYW1pY01pZGRsZXdhcmUvaW5kZXgudHNcbmltcG9ydCB7IGNvbXBvc2UgYXMgY29tcG9zZTMgfSBmcm9tIFwicmVkdXhcIjtcbnZhciBjcmVhdGVNaWRkbGV3YXJlRW50cnkgPSAobWlkZGxld2FyZSkgPT4gKHtcbiAgbWlkZGxld2FyZSxcbiAgYXBwbGllZDogLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKVxufSk7XG52YXIgbWF0Y2hJbnN0YW5jZSA9IChpbnN0YW5jZUlkKSA9PiAoYWN0aW9uKSA9PiBhY3Rpb24/Lm1ldGE/Lmluc3RhbmNlSWQgPT09IGluc3RhbmNlSWQ7XG52YXIgY3JlYXRlRHluYW1pY01pZGRsZXdhcmUgPSAoKSA9PiB7XG4gIGNvbnN0IGluc3RhbmNlSWQgPSBuYW5vaWQoKTtcbiAgY29uc3QgbWlkZGxld2FyZU1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIGNvbnN0IHdpdGhNaWRkbGV3YXJlID0gT2JqZWN0LmFzc2lnbihjcmVhdGVBY3Rpb24oXCJkeW5hbWljTWlkZGxld2FyZS9hZGRcIiwgKC4uLm1pZGRsZXdhcmVzKSA9PiAoe1xuICAgIHBheWxvYWQ6IG1pZGRsZXdhcmVzLFxuICAgIG1ldGE6IHtcbiAgICAgIGluc3RhbmNlSWRcbiAgICB9XG4gIH0pKSwge1xuICAgIHdpdGhUeXBlczogKCkgPT4gd2l0aE1pZGRsZXdhcmVcbiAgfSk7XG4gIGNvbnN0IGFkZE1pZGRsZXdhcmUgPSBPYmplY3QuYXNzaWduKGZ1bmN0aW9uIGFkZE1pZGRsZXdhcmUyKC4uLm1pZGRsZXdhcmVzKSB7XG4gICAgbWlkZGxld2FyZXMuZm9yRWFjaCgobWlkZGxld2FyZTIpID0+IHtcbiAgICAgIGdldE9ySW5zZXJ0Q29tcHV0ZWQobWlkZGxld2FyZU1hcCwgbWlkZGxld2FyZTIsIGNyZWF0ZU1pZGRsZXdhcmVFbnRyeSk7XG4gICAgfSk7XG4gIH0sIHtcbiAgICB3aXRoVHlwZXM6ICgpID0+IGFkZE1pZGRsZXdhcmVcbiAgfSk7XG4gIGNvbnN0IGdldEZpbmFsTWlkZGxld2FyZSA9IChhcGkpID0+IHtcbiAgICBjb25zdCBhcHBsaWVkTWlkZGxld2FyZSA9IEFycmF5LmZyb20obWlkZGxld2FyZU1hcC52YWx1ZXMoKSkubWFwKChlbnRyeSkgPT4gZ2V0T3JJbnNlcnRDb21wdXRlZChlbnRyeS5hcHBsaWVkLCBhcGksIGVudHJ5Lm1pZGRsZXdhcmUpKTtcbiAgICByZXR1cm4gY29tcG9zZTMoLi4uYXBwbGllZE1pZGRsZXdhcmUpO1xuICB9O1xuICBjb25zdCBpc1dpdGhNaWRkbGV3YXJlID0gaXNBbGxPZih3aXRoTWlkZGxld2FyZSwgbWF0Y2hJbnN0YW5jZShpbnN0YW5jZUlkKSk7XG4gIGNvbnN0IG1pZGRsZXdhcmUgPSAoYXBpKSA9PiAobmV4dCkgPT4gKGFjdGlvbikgPT4ge1xuICAgIGlmIChpc1dpdGhNaWRkbGV3YXJlKGFjdGlvbikpIHtcbiAgICAgIGFkZE1pZGRsZXdhcmUoLi4uYWN0aW9uLnBheWxvYWQpO1xuICAgICAgcmV0dXJuIGFwaS5kaXNwYXRjaDtcbiAgICB9XG4gICAgcmV0dXJuIGdldEZpbmFsTWlkZGxld2FyZShhcGkpKG5leHQpKGFjdGlvbik7XG4gIH07XG4gIHJldHVybiB7XG4gICAgbWlkZGxld2FyZSxcbiAgICBhZGRNaWRkbGV3YXJlLFxuICAgIHdpdGhNaWRkbGV3YXJlLFxuICAgIGluc3RhbmNlSWRcbiAgfTtcbn07XG5cbi8vIHNyYy9jb21iaW5lU2xpY2VzLnRzXG5pbXBvcnQgeyBjb21iaW5lUmVkdWNlcnMgYXMgY29tYmluZVJlZHVjZXJzMiB9IGZyb20gXCJyZWR1eFwiO1xudmFyIGlzU2xpY2VMaWtlID0gKG1heWJlU2xpY2VMaWtlKSA9PiBcInJlZHVjZXJQYXRoXCIgaW4gbWF5YmVTbGljZUxpa2UgJiYgdHlwZW9mIG1heWJlU2xpY2VMaWtlLnJlZHVjZXJQYXRoID09PSBcInN0cmluZ1wiO1xudmFyIGdldFJlZHVjZXJzID0gKHNsaWNlcykgPT4gc2xpY2VzLmZsYXRNYXAoKHNsaWNlT3JNYXApID0+IGlzU2xpY2VMaWtlKHNsaWNlT3JNYXApID8gW1tzbGljZU9yTWFwLnJlZHVjZXJQYXRoLCBzbGljZU9yTWFwLnJlZHVjZXJdXSA6IE9iamVjdC5lbnRyaWVzKHNsaWNlT3JNYXApKTtcbnZhciBPUklHSU5BTF9TVEFURSA9IFN5bWJvbC5mb3IoXCJydGstc3RhdGUtcHJveHktb3JpZ2luYWxcIik7XG52YXIgaXNTdGF0ZVByb3h5ID0gKHZhbHVlKSA9PiAhIXZhbHVlICYmICEhdmFsdWVbT1JJR0lOQUxfU1RBVEVdO1xudmFyIHN0YXRlUHJveHlNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IFdlYWtNYXAoKTtcbnZhciBjcmVhdGVTdGF0ZVByb3h5ID0gKHN0YXRlLCByZWR1Y2VyTWFwLCBpbml0aWFsU3RhdGVDYWNoZSkgPT4gZ2V0T3JJbnNlcnRDb21wdXRlZChzdGF0ZVByb3h5TWFwLCBzdGF0ZSwgKCkgPT4gbmV3IFByb3h5KHN0YXRlLCB7XG4gIGdldDogKHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpID0+IHtcbiAgICBpZiAocHJvcCA9PT0gT1JJR0lOQUxfU1RBVEUpIHJldHVybiB0YXJnZXQ7XG4gICAgY29uc3QgcmVzdWx0ID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wLCByZWNlaXZlcik7XG4gICAgaWYgKHR5cGVvZiByZXN1bHQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGNvbnN0IGNhY2hlZCA9IGluaXRpYWxTdGF0ZUNhY2hlW3Byb3BdO1xuICAgICAgaWYgKHR5cGVvZiBjYWNoZWQgIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBjYWNoZWQ7XG4gICAgICBjb25zdCByZWR1Y2VyID0gcmVkdWNlck1hcFtwcm9wXTtcbiAgICAgIGlmIChyZWR1Y2VyKSB7XG4gICAgICAgIGNvbnN0IHJlZHVjZXJSZXN1bHQgPSByZWR1Y2VyKHZvaWQgMCwge1xuICAgICAgICAgIHR5cGU6IG5hbm9pZCgpXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodHlwZW9mIHJlZHVjZXJSZXN1bHQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiID8gZm9ybWF0UHJvZEVycm9yTWVzc2FnZSgyNCkgOiBgVGhlIHNsaWNlIHJlZHVjZXIgZm9yIGtleSBcIiR7cHJvcC50b1N0cmluZygpfVwiIHJldHVybmVkIHVuZGVmaW5lZCB3aGVuIGNhbGxlZCBmb3Igc2VsZWN0b3IoKS4gSWYgdGhlIHN0YXRlIHBhc3NlZCB0byB0aGUgcmVkdWNlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IGV4cGxpY2l0bHkgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLiBUaGUgaW5pdGlhbCBzdGF0ZSBtYXkgbm90IGJlIHVuZGVmaW5lZC4gSWYgeW91IGRvbid0IHdhbnQgdG8gc2V0IGEgdmFsdWUgZm9yIHRoaXMgcmVkdWNlciwgeW91IGNhbiB1c2UgbnVsbCBpbnN0ZWFkIG9mIHVuZGVmaW5lZC5gKTtcbiAgICAgICAgfVxuICAgICAgICBpbml0aWFsU3RhdGVDYWNoZVtwcm9wXSA9IHJlZHVjZXJSZXN1bHQ7XG4gICAgICAgIHJldHVybiByZWR1Y2VyUmVzdWx0O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KSk7XG52YXIgb3JpZ2luYWwgPSAoc3RhdGUpID0+IHtcbiAgaWYgKCFpc1N0YXRlUHJveHkoc3RhdGUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSBcInByb2R1Y3Rpb25cIiA/IGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoMjUpIDogXCJvcmlnaW5hbCBtdXN0IGJlIHVzZWQgb24gc3RhdGUgUHJveHlcIik7XG4gIH1cbiAgcmV0dXJuIHN0YXRlW09SSUdJTkFMX1NUQVRFXTtcbn07XG52YXIgZW1wdHlPYmplY3QgPSB7fTtcbnZhciBub29wUmVkdWNlciA9IChzdGF0ZSA9IGVtcHR5T2JqZWN0KSA9PiBzdGF0ZTtcbmZ1bmN0aW9uIGNvbWJpbmVTbGljZXMoLi4uc2xpY2VzKSB7XG4gIGNvbnN0IHJlZHVjZXJNYXAgPSBPYmplY3QuZnJvbUVudHJpZXMoZ2V0UmVkdWNlcnMoc2xpY2VzKSk7XG4gIGNvbnN0IGdldFJlZHVjZXIgPSAoKSA9PiBPYmplY3Qua2V5cyhyZWR1Y2VyTWFwKS5sZW5ndGggPyBjb21iaW5lUmVkdWNlcnMyKHJlZHVjZXJNYXApIDogbm9vcFJlZHVjZXI7XG4gIGxldCByZWR1Y2VyID0gZ2V0UmVkdWNlcigpO1xuICBmdW5jdGlvbiBjb21iaW5lZFJlZHVjZXIoc3RhdGUsIGFjdGlvbikge1xuICAgIHJldHVybiByZWR1Y2VyKHN0YXRlLCBhY3Rpb24pO1xuICB9XG4gIGNvbWJpbmVkUmVkdWNlci53aXRoTGF6eUxvYWRlZFNsaWNlcyA9ICgpID0+IGNvbWJpbmVkUmVkdWNlcjtcbiAgY29uc3QgaW5pdGlhbFN0YXRlQ2FjaGUgPSB7fTtcbiAgY29uc3QgaW5qZWN0ID0gKHNsaWNlLCBjb25maWcgPSB7fSkgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIHJlZHVjZXJQYXRoLFxuICAgICAgcmVkdWNlcjogcmVkdWNlclRvSW5qZWN0XG4gICAgfSA9IHNsaWNlO1xuICAgIGNvbnN0IGN1cnJlbnRSZWR1Y2VyID0gcmVkdWNlck1hcFtyZWR1Y2VyUGF0aF07XG4gICAgaWYgKCFjb25maWcub3ZlcnJpZGVFeGlzdGluZyAmJiBjdXJyZW50UmVkdWNlciAmJiBjdXJyZW50UmVkdWNlciAhPT0gcmVkdWNlclRvSW5qZWN0KSB7XG4gICAgICBpZiAodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwiZGV2ZWxvcG1lbnRcIikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBjYWxsZWQgXFxgaW5qZWN0XFxgIHRvIG92ZXJyaWRlIGFscmVhZHktZXhpc3RpbmcgcmVkdWNlciAke3JlZHVjZXJQYXRofSB3aXRob3V0IHNwZWNpZnlpbmcgXFxgb3ZlcnJpZGVFeGlzdGluZzogdHJ1ZVxcYGApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbWJpbmVkUmVkdWNlcjtcbiAgICB9XG4gICAgaWYgKGNvbmZpZy5vdmVycmlkZUV4aXN0aW5nICYmIGN1cnJlbnRSZWR1Y2VyICE9PSByZWR1Y2VyVG9JbmplY3QpIHtcbiAgICAgIGRlbGV0ZSBpbml0aWFsU3RhdGVDYWNoZVtyZWR1Y2VyUGF0aF07XG4gICAgfVxuICAgIHJlZHVjZXJNYXBbcmVkdWNlclBhdGhdID0gcmVkdWNlclRvSW5qZWN0O1xuICAgIHJlZHVjZXIgPSBnZXRSZWR1Y2VyKCk7XG4gICAgcmV0dXJuIGNvbWJpbmVkUmVkdWNlcjtcbiAgfTtcbiAgY29uc3Qgc2VsZWN0b3IgPSBPYmplY3QuYXNzaWduKGZ1bmN0aW9uIG1ha2VTZWxlY3RvcihzZWxlY3RvckZuLCBzZWxlY3RTdGF0ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiBzZWxlY3RvcjIoc3RhdGUsIC4uLmFyZ3MpIHtcbiAgICAgIHJldHVybiBzZWxlY3RvckZuKGNyZWF0ZVN0YXRlUHJveHkoc2VsZWN0U3RhdGUgPyBzZWxlY3RTdGF0ZShzdGF0ZSwgLi4uYXJncykgOiBzdGF0ZSwgcmVkdWNlck1hcCwgaW5pdGlhbFN0YXRlQ2FjaGUpLCAuLi5hcmdzKTtcbiAgICB9O1xuICB9LCB7XG4gICAgb3JpZ2luYWxcbiAgfSk7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKGNvbWJpbmVkUmVkdWNlciwge1xuICAgIGluamVjdCxcbiAgICBzZWxlY3RvclxuICB9KTtcbn1cblxuLy8gc3JjL2Zvcm1hdFByb2RFcnJvck1lc3NhZ2UudHNcbmZ1bmN0aW9uIGZvcm1hdFByb2RFcnJvck1lc3NhZ2UoY29kZSkge1xuICByZXR1cm4gYE1pbmlmaWVkIFJlZHV4IFRvb2xraXQgZXJyb3IgIyR7Y29kZX07IHZpc2l0IGh0dHBzOi8vcmVkdXgtdG9vbGtpdC5qcy5vcmcvRXJyb3JzP2NvZGU9JHtjb2RlfSBmb3IgdGhlIGZ1bGwgbWVzc2FnZSBvciB1c2UgdGhlIG5vbi1taW5pZmllZCBkZXYgZW52aXJvbm1lbnQgZm9yIGZ1bGwgZXJyb3JzLiBgO1xufVxuZXhwb3J0IHtcbiAgUmVkdWNlclR5cGUsXG4gIFNIT1VMRF9BVVRPQkFUQ0gsXG4gIFRhc2tBYm9ydEVycm9yLFxuICBUdXBsZSxcbiAgYWRkTGlzdGVuZXIsXG4gIGFzeW5jVGh1bmtDcmVhdG9yLFxuICBhdXRvQmF0Y2hFbmhhbmNlcixcbiAgYnVpbGRDcmVhdGVTbGljZSxcbiAgY2xlYXJBbGxMaXN0ZW5lcnMsXG4gIGNvbWJpbmVTbGljZXMsXG4gIGNvbmZpZ3VyZVN0b3JlLFxuICBjcmVhdGVBY3Rpb24sXG4gIGNyZWF0ZUFjdGlvbkNyZWF0b3JJbnZhcmlhbnRNaWRkbGV3YXJlLFxuICBjcmVhdGVBc3luY1RodW5rLFxuICBjcmVhdGVEcmFmdFNhZmVTZWxlY3RvcixcbiAgY3JlYXRlRHJhZnRTYWZlU2VsZWN0b3JDcmVhdG9yLFxuICBjcmVhdGVEeW5hbWljTWlkZGxld2FyZSxcbiAgY3JlYXRlRW50aXR5QWRhcHRlcixcbiAgY3JlYXRlSW1tdXRhYmxlU3RhdGVJbnZhcmlhbnRNaWRkbGV3YXJlLFxuICBjcmVhdGVMaXN0ZW5lck1pZGRsZXdhcmUsXG4gIHByb2R1Y2UgYXMgY3JlYXRlTmV4dFN0YXRlLFxuICBjcmVhdGVSZWR1Y2VyLFxuICBjcmVhdGVTZWxlY3RvcixcbiAgY3JlYXRlU2VsZWN0b3JDcmVhdG9yMiBhcyBjcmVhdGVTZWxlY3RvckNyZWF0b3IsXG4gIGNyZWF0ZVNlcmlhbGl6YWJsZVN0YXRlSW52YXJpYW50TWlkZGxld2FyZSxcbiAgY3JlYXRlU2xpY2UsXG4gIGN1cnJlbnQzIGFzIGN1cnJlbnQsXG4gIGZpbmROb25TZXJpYWxpemFibGVWYWx1ZSxcbiAgZm9ybWF0UHJvZEVycm9yTWVzc2FnZSxcbiAgZnJlZXplLFxuICBpc0FjdGlvbkNyZWF0b3IsXG4gIGlzQWxsT2YsXG4gIGlzQW55T2YsXG4gIGlzQXN5bmNUaHVua0FjdGlvbixcbiAgaXNEcmFmdDUgYXMgaXNEcmFmdCxcbiAgaXNGU0EgYXMgaXNGbHV4U3RhbmRhcmRBY3Rpb24sXG4gIGlzRnVsZmlsbGVkLFxuICBpc0ltbXV0YWJsZURlZmF1bHQsXG4gIGlzUGVuZGluZyxcbiAgaXNQbGFpbixcbiAgaXNSZWplY3RlZCxcbiAgaXNSZWplY3RlZFdpdGhWYWx1ZSxcbiAgbHJ1TWVtb2l6ZSxcbiAgbWluaVNlcmlhbGl6ZUVycm9yLFxuICBuYW5vaWQsXG4gIG9yaWdpbmFsMiBhcyBvcmlnaW5hbCxcbiAgcHJlcGFyZUF1dG9CYXRjaGVkLFxuICByZW1vdmVMaXN0ZW5lcixcbiAgdW53cmFwUmVzdWx0LFxuICB3ZWFrTWFwTWVtb2l6ZTIgYXMgd2Vha01hcE1lbW9pemVcbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZWR1eC10b29sa2l0Lm1vZGVybi5tanMubWFwIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuICAsIHByZWZpeCA9ICd+JztcblxuLyoqXG4gKiBDb25zdHJ1Y3RvciB0byBjcmVhdGUgYSBzdG9yYWdlIGZvciBvdXIgYEVFYCBvYmplY3RzLlxuICogQW4gYEV2ZW50c2AgaW5zdGFuY2UgaXMgYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBFdmVudHMoKSB7fVxuXG4vL1xuLy8gV2UgdHJ5IHRvIG5vdCBpbmhlcml0IGZyb20gYE9iamVjdC5wcm90b3R5cGVgLiBJbiBzb21lIGVuZ2luZXMgY3JlYXRpbmcgYW5cbi8vIGluc3RhbmNlIGluIHRoaXMgd2F5IGlzIGZhc3RlciB0aGFuIGNhbGxpbmcgYE9iamVjdC5jcmVhdGUobnVsbClgIGRpcmVjdGx5LlxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcbi8vIGNoYXJhY3RlciB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVpbHQtaW4gb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdFxuLy8gb3ZlcnJpZGRlbiBvciB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXG4vL1xuaWYgKE9iamVjdC5jcmVhdGUpIHtcbiAgRXZlbnRzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgLy9cbiAgLy8gVGhpcyBoYWNrIGlzIG5lZWRlZCBiZWNhdXNlIHRoZSBgX19wcm90b19fYCBwcm9wZXJ0eSBpcyBzdGlsbCBpbmhlcml0ZWQgaW5cbiAgLy8gc29tZSBvbGQgYnJvd3NlcnMgbGlrZSBBbmRyb2lkIDQsIGlQaG9uZSA1LjEsIE9wZXJhIDExIGFuZCBTYWZhcmkgNS5cbiAgLy9cbiAgaWYgKCFuZXcgRXZlbnRzKCkuX19wcm90b19fKSBwcmVmaXggPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBldmVudCBsaXN0ZW5lci5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKiBAcGFyYW0geyp9IGNvbnRleHQgVGhlIGNvbnRleHQgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICogQHBhcmFtIHtCb29sZWFufSBbb25jZT1mYWxzZV0gU3BlY2lmeSBpZiB0aGUgbGlzdGVuZXIgaXMgYSBvbmUtdGltZSBsaXN0ZW5lci5cbiAqIEBjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIEFkZCBhIGxpc3RlbmVyIGZvciBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7RXZlbnRFbWl0dGVyfSBlbWl0dGVyIFJlZmVyZW5jZSB0byB0aGUgYEV2ZW50RW1pdHRlcmAgaW5zdGFuY2UuXG4gKiBAcGFyYW0geyhTdHJpbmd8U3ltYm9sKX0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKiBAcGFyYW0geyp9IGNvbnRleHQgVGhlIGNvbnRleHQgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIFNwZWNpZnkgaWYgdGhlIGxpc3RlbmVyIGlzIGEgb25lLXRpbWUgbGlzdGVuZXIuXG4gKiBAcmV0dXJucyB7RXZlbnRFbWl0dGVyfVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gYWRkTGlzdGVuZXIoZW1pdHRlciwgZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIH1cblxuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgZW1pdHRlciwgb25jZSlcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCFlbWl0dGVyLl9ldmVudHNbZXZ0XSkgZW1pdHRlci5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lciwgZW1pdHRlci5fZXZlbnRzQ291bnQrKztcbiAgZWxzZSBpZiAoIWVtaXR0ZXIuX2V2ZW50c1tldnRdLmZuKSBlbWl0dGVyLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZSBlbWl0dGVyLl9ldmVudHNbZXZ0XSA9IFtlbWl0dGVyLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJdO1xuXG4gIHJldHVybiBlbWl0dGVyO1xufVxuXG4vKipcbiAqIENsZWFyIGV2ZW50IGJ5IG5hbWUuXG4gKlxuICogQHBhcmFtIHtFdmVudEVtaXR0ZXJ9IGVtaXR0ZXIgUmVmZXJlbmNlIHRvIHRoZSBgRXZlbnRFbWl0dGVyYCBpbnN0YW5jZS5cbiAqIEBwYXJhbSB7KFN0cmluZ3xTeW1ib2wpfSBldnQgVGhlIEV2ZW50IG5hbWUuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBjbGVhckV2ZW50KGVtaXR0ZXIsIGV2dCkge1xuICBpZiAoLS1lbWl0dGVyLl9ldmVudHNDb3VudCA9PT0gMCkgZW1pdHRlci5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICBlbHNlIGRlbGV0ZSBlbWl0dGVyLl9ldmVudHNbZXZ0XTtcbn1cblxuLyoqXG4gKiBNaW5pbWFsIGBFdmVudEVtaXR0ZXJgIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBgRXZlbnRFbWl0dGVyYCBpbnRlcmZhY2UuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKi9cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG59XG5cbi8qKlxuICogUmV0dXJuIGFuIGFycmF5IGxpc3RpbmcgdGhlIGV2ZW50cyBmb3Igd2hpY2ggdGhlIGVtaXR0ZXIgaGFzIHJlZ2lzdGVyZWRcbiAqIGxpc3RlbmVycy5cbiAqXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKiBAcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnROYW1lcyA9IGZ1bmN0aW9uIGV2ZW50TmFtZXMoKSB7XG4gIHZhciBuYW1lcyA9IFtdXG4gICAgLCBldmVudHNcbiAgICAsIG5hbWU7XG5cbiAgaWYgKHRoaXMuX2V2ZW50c0NvdW50ID09PSAwKSByZXR1cm4gbmFtZXM7XG5cbiAgZm9yIChuYW1lIGluIChldmVudHMgPSB0aGlzLl9ldmVudHMpKSB7XG4gICAgaWYgKGhhcy5jYWxsKGV2ZW50cywgbmFtZSkpIG5hbWVzLnB1c2gocHJlZml4ID8gbmFtZS5zbGljZSgxKSA6IG5hbWUpO1xuICB9XG5cbiAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgICByZXR1cm4gbmFtZXMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZXZlbnRzKSk7XG4gIH1cblxuICByZXR1cm4gbmFtZXM7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgbGlzdGVuZXJzIHJlZ2lzdGVyZWQgZm9yIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHsoU3RyaW5nfFN5bWJvbCl9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHJldHVybnMge0FycmF5fSBUaGUgcmVnaXN0ZXJlZCBsaXN0ZW5lcnMuXG4gKiBAcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50KSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XG4gICAgLCBoYW5kbGVycyA9IHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmICghaGFuZGxlcnMpIHJldHVybiBbXTtcbiAgaWYgKGhhbmRsZXJzLmZuKSByZXR1cm4gW2hhbmRsZXJzLmZuXTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGhhbmRsZXJzLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcbiAgICBlZVtpXSA9IGhhbmRsZXJzW2ldLmZuO1xuICB9XG5cbiAgcmV0dXJuIGVlO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgbGlzdGVuaW5nIHRvIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHsoU3RyaW5nfFN5bWJvbCl9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHJldHVybnMge051bWJlcn0gVGhlIG51bWJlciBvZiBsaXN0ZW5lcnMuXG4gKiBAcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uIGxpc3RlbmVyQ291bnQoZXZlbnQpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcbiAgICAsIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmICghbGlzdGVuZXJzKSByZXR1cm4gMDtcbiAgaWYgKGxpc3RlbmVycy5mbikgcmV0dXJuIDE7XG4gIHJldHVybiBsaXN0ZW5lcnMubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBDYWxscyBlYWNoIG9mIHRoZSBsaXN0ZW5lcnMgcmVnaXN0ZXJlZCBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0geyhTdHJpbmd8U3ltYm9sKX0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBlbHNlIGBmYWxzZWAuXG4gKiBAcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBhcmdzXG4gICAgLCBpO1xuXG4gIGlmIChsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAgICwgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgNDogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMiwgYTMpOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBBZGQgYSBsaXN0ZW5lciBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0geyhTdHJpbmd8U3ltYm9sKX0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKiBAcGFyYW0geyp9IFtjb250ZXh0PXRoaXNdIFRoZSBjb250ZXh0IHRvIGludm9rZSB0aGUgbGlzdGVuZXIgd2l0aC5cbiAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IGB0aGlzYC5cbiAqIEBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICByZXR1cm4gYWRkTGlzdGVuZXIodGhpcywgZXZlbnQsIGZuLCBjb250ZXh0LCBmYWxzZSk7XG59O1xuXG4vKipcbiAqIEFkZCBhIG9uZS10aW1lIGxpc3RlbmVyIGZvciBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7KFN0cmluZ3xTeW1ib2wpfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW2NvbnRleHQ9dGhpc10gVGhlIGNvbnRleHQgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gYHRoaXNgLlxuICogQHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICByZXR1cm4gYWRkTGlzdGVuZXIodGhpcywgZXZlbnQsIGZuLCBjb250ZXh0LCB0cnVlKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBsaXN0ZW5lcnMgb2YgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0geyhTdHJpbmd8U3ltYm9sKX0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBPbmx5IHJlbW92ZSB0aGUgbGlzdGVuZXJzIHRoYXQgbWF0Y2ggdGhpcyBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7Kn0gY29udGV4dCBPbmx5IHJlbW92ZSB0aGUgbGlzdGVuZXJzIHRoYXQgaGF2ZSB0aGlzIGNvbnRleHQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25lLXRpbWUgbGlzdGVuZXJzLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gYHRoaXNgLlxuICogQHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xuICBpZiAoIWZuKSB7XG4gICAgY2xlYXJFdmVudCh0aGlzLCBldnQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmIChsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAoXG4gICAgICBsaXN0ZW5lcnMuZm4gPT09IGZuICYmXG4gICAgICAoIW9uY2UgfHwgbGlzdGVuZXJzLm9uY2UpICYmXG4gICAgICAoIWNvbnRleHQgfHwgbGlzdGVuZXJzLmNvbnRleHQgPT09IGNvbnRleHQpXG4gICAgKSB7XG4gICAgICBjbGVhckV2ZW50KHRoaXMsIGV2dCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAodmFyIGkgPSAwLCBldmVudHMgPSBbXSwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGxpc3RlbmVyc1tpXS5mbiAhPT0gZm4gfHxcbiAgICAgICAgKG9uY2UgJiYgIWxpc3RlbmVyc1tpXS5vbmNlKSB8fFxuICAgICAgICAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICkge1xuICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vXG4gICAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxuICAgIC8vXG4gICAgaWYgKGV2ZW50cy5sZW5ndGgpIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcbiAgICBlbHNlIGNsZWFyRXZlbnQodGhpcywgZXZ0KTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycywgb3IgdGhvc2Ugb2YgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0geyhTdHJpbmd8U3ltYm9sKX0gW2V2ZW50XSBUaGUgZXZlbnQgbmFtZS5cbiAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IGB0aGlzYC5cbiAqIEBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgdmFyIGV2dDtcblxuICBpZiAoZXZlbnQpIHtcbiAgICBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuICAgIGlmICh0aGlzLl9ldmVudHNbZXZ0XSkgY2xlYXJFdmVudCh0aGlzLCBldnQpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudHMoKTtcbiAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBwcmVmaXguXG4vL1xuRXZlbnRFbWl0dGVyLnByZWZpeGVkID0gcHJlZml4O1xuXG4vL1xuLy8gQWxsb3cgYEV2ZW50RW1pdHRlcmAgdG8gYmUgaW1wb3J0ZWQgYXMgbW9kdWxlIG5hbWVzcGFjZS5cbi8vXG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xufVxuIiwiaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICcuL2luZGV4LmpzJ1xuXG5leHBvcnQgeyBFdmVudEVtaXR0ZXIgfVxuZXhwb3J0IGRlZmF1bHQgRXZlbnRFbWl0dGVyXG4iLCIvLyBzcmMvdXRpbHMvcmVhY3QudHNcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG4vLyBzcmMvdXRpbHMvcmVhY3QtaXMudHNcbnZhciBJU19SRUFDVF8xOSA9IC8qIEBfX1BVUkVfXyAqLyBSZWFjdC52ZXJzaW9uLnN0YXJ0c1dpdGgoXCIxOVwiKTtcbnZhciBSRUFDVF9FTEVNRU5UX1RZUEUgPSAvKiBAX19QVVJFX18gKi8gU3ltYm9sLmZvcihcbiAgSVNfUkVBQ1RfMTkgPyBcInJlYWN0LnRyYW5zaXRpb25hbC5lbGVtZW50XCIgOiBcInJlYWN0LmVsZW1lbnRcIlxuKTtcbnZhciBSRUFDVF9QT1JUQUxfVFlQRSA9IC8qIEBfX1BVUkVfXyAqLyBTeW1ib2wuZm9yKFwicmVhY3QucG9ydGFsXCIpO1xudmFyIFJFQUNUX0ZSQUdNRU5UX1RZUEUgPSAvKiBAX19QVVJFX18gKi8gU3ltYm9sLmZvcihcInJlYWN0LmZyYWdtZW50XCIpO1xudmFyIFJFQUNUX1NUUklDVF9NT0RFX1RZUEUgPSAvKiBAX19QVVJFX18gKi8gU3ltYm9sLmZvcihcInJlYWN0LnN0cmljdF9tb2RlXCIpO1xudmFyIFJFQUNUX1BST0ZJTEVSX1RZUEUgPSAvKiBAX19QVVJFX18gKi8gU3ltYm9sLmZvcihcInJlYWN0LnByb2ZpbGVyXCIpO1xudmFyIFJFQUNUX0NPTlNVTUVSX1RZUEUgPSAvKiBAX19QVVJFX18gKi8gU3ltYm9sLmZvcihcInJlYWN0LmNvbnN1bWVyXCIpO1xudmFyIFJFQUNUX0NPTlRFWFRfVFlQRSA9IC8qIEBfX1BVUkVfXyAqLyBTeW1ib2wuZm9yKFwicmVhY3QuY29udGV4dFwiKTtcbnZhciBSRUFDVF9GT1JXQVJEX1JFRl9UWVBFID0gLyogQF9fUFVSRV9fICovIFN5bWJvbC5mb3IoXCJyZWFjdC5mb3J3YXJkX3JlZlwiKTtcbnZhciBSRUFDVF9TVVNQRU5TRV9UWVBFID0gLyogQF9fUFVSRV9fICovIFN5bWJvbC5mb3IoXCJyZWFjdC5zdXNwZW5zZVwiKTtcbnZhciBSRUFDVF9TVVNQRU5TRV9MSVNUX1RZUEUgPSAvKiBAX19QVVJFX18gKi8gU3ltYm9sLmZvcihcbiAgXCJyZWFjdC5zdXNwZW5zZV9saXN0XCJcbik7XG52YXIgUkVBQ1RfTUVNT19UWVBFID0gLyogQF9fUFVSRV9fICovIFN5bWJvbC5mb3IoXCJyZWFjdC5tZW1vXCIpO1xudmFyIFJFQUNUX0xBWllfVFlQRSA9IC8qIEBfX1BVUkVfXyAqLyBTeW1ib2wuZm9yKFwicmVhY3QubGF6eVwiKTtcbnZhciBSRUFDVF9PRkZTQ1JFRU5fVFlQRSA9IC8qIEBfX1BVUkVfXyAqLyBTeW1ib2wuZm9yKFwicmVhY3Qub2Zmc2NyZWVuXCIpO1xudmFyIFJFQUNUX0NMSUVOVF9SRUZFUkVOQ0UgPSAvKiBAX19QVVJFX18gKi8gU3ltYm9sLmZvcihcbiAgXCJyZWFjdC5jbGllbnQucmVmZXJlbmNlXCJcbik7XG52YXIgRm9yd2FyZFJlZiA9IFJFQUNUX0ZPUldBUkRfUkVGX1RZUEU7XG52YXIgTWVtbyA9IFJFQUNUX01FTU9fVFlQRTtcbmZ1bmN0aW9uIGlzVmFsaWRFbGVtZW50VHlwZSh0eXBlKSB7XG4gIHJldHVybiB0eXBlb2YgdHlwZSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgdHlwZSA9PT0gXCJmdW5jdGlvblwiIHx8IHR5cGUgPT09IFJFQUNUX0ZSQUdNRU5UX1RZUEUgfHwgdHlwZSA9PT0gUkVBQ1RfUFJPRklMRVJfVFlQRSB8fCB0eXBlID09PSBSRUFDVF9TVFJJQ1RfTU9ERV9UWVBFIHx8IHR5cGUgPT09IFJFQUNUX1NVU1BFTlNFX1RZUEUgfHwgdHlwZSA9PT0gUkVBQ1RfU1VTUEVOU0VfTElTVF9UWVBFIHx8IHR5cGUgPT09IFJFQUNUX09GRlNDUkVFTl9UWVBFIHx8IHR5cGVvZiB0eXBlID09PSBcIm9iamVjdFwiICYmIHR5cGUgIT09IG51bGwgJiYgKHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX0xBWllfVFlQRSB8fCB0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9NRU1PX1RZUEUgfHwgdHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfQ09OVEVYVF9UWVBFIHx8IHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX0NPTlNVTUVSX1RZUEUgfHwgdHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfRk9SV0FSRF9SRUZfVFlQRSB8fCB0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9DTElFTlRfUkVGRVJFTkNFIHx8IHR5cGUuZ2V0TW9kdWxlSWQgIT09IHZvaWQgMCkgPyB0cnVlIDogZmFsc2U7XG59XG5mdW5jdGlvbiB0eXBlT2Yob2JqZWN0KSB7XG4gIGlmICh0eXBlb2Ygb2JqZWN0ID09PSBcIm9iamVjdFwiICYmIG9iamVjdCAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHsgJCR0eXBlb2YgfSA9IG9iamVjdDtcbiAgICBzd2l0Y2ggKCQkdHlwZW9mKSB7XG4gICAgICBjYXNlIFJFQUNUX0VMRU1FTlRfVFlQRTpcbiAgICAgICAgc3dpdGNoIChvYmplY3QgPSBvYmplY3QudHlwZSwgb2JqZWN0KSB7XG4gICAgICAgICAgY2FzZSBSRUFDVF9GUkFHTUVOVF9UWVBFOlxuICAgICAgICAgIGNhc2UgUkVBQ1RfUFJPRklMRVJfVFlQRTpcbiAgICAgICAgICBjYXNlIFJFQUNUX1NUUklDVF9NT0RFX1RZUEU6XG4gICAgICAgICAgY2FzZSBSRUFDVF9TVVNQRU5TRV9UWVBFOlxuICAgICAgICAgIGNhc2UgUkVBQ1RfU1VTUEVOU0VfTElTVF9UWVBFOlxuICAgICAgICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgc3dpdGNoIChvYmplY3QgPSBvYmplY3QgJiYgb2JqZWN0LiQkdHlwZW9mLCBvYmplY3QpIHtcbiAgICAgICAgICAgICAgY2FzZSBSRUFDVF9DT05URVhUX1RZUEU6XG4gICAgICAgICAgICAgIGNhc2UgUkVBQ1RfRk9SV0FSRF9SRUZfVFlQRTpcbiAgICAgICAgICAgICAgY2FzZSBSRUFDVF9MQVpZX1RZUEU6XG4gICAgICAgICAgICAgIGNhc2UgUkVBQ1RfTUVNT19UWVBFOlxuICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICAgICAgICAgIGNhc2UgUkVBQ1RfQ09OU1VNRVJfVFlQRTpcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiAkJHR5cGVvZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgY2FzZSBSRUFDVF9QT1JUQUxfVFlQRTpcbiAgICAgICAgcmV0dXJuICQkdHlwZW9mO1xuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gaXNDb250ZXh0Q29uc3VtZXIob2JqZWN0KSB7XG4gIHJldHVybiBJU19SRUFDVF8xOSA/IHR5cGVPZihvYmplY3QpID09PSBSRUFDVF9DT05TVU1FUl9UWVBFIDogdHlwZU9mKG9iamVjdCkgPT09IFJFQUNUX0NPTlRFWFRfVFlQRTtcbn1cbmZ1bmN0aW9uIGlzTWVtbyhvYmplY3QpIHtcbiAgcmV0dXJuIHR5cGVPZihvYmplY3QpID09PSBSRUFDVF9NRU1PX1RZUEU7XG59XG5cbi8vIHNyYy91dGlscy93YXJuaW5nLnRzXG5mdW5jdGlvbiB3YXJuaW5nKG1lc3NhZ2UpIHtcbiAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuICB9XG4gIHRyeSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICB9IGNhdGNoIChlKSB7XG4gIH1cbn1cblxuLy8gc3JjL2Nvbm5lY3QvdmVyaWZ5U3Vic2VsZWN0b3JzLnRzXG5mdW5jdGlvbiB2ZXJpZnkoc2VsZWN0b3IsIG1ldGhvZE5hbWUpIHtcbiAgaWYgKCFzZWxlY3Rvcikge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5leHBlY3RlZCB2YWx1ZSBmb3IgJHttZXRob2ROYW1lfSBpbiBjb25uZWN0LmApO1xuICB9IGVsc2UgaWYgKG1ldGhvZE5hbWUgPT09IFwibWFwU3RhdGVUb1Byb3BzXCIgfHwgbWV0aG9kTmFtZSA9PT0gXCJtYXBEaXNwYXRjaFRvUHJvcHNcIikge1xuICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNlbGVjdG9yLCBcImRlcGVuZHNPbk93blByb3BzXCIpKSB7XG4gICAgICB3YXJuaW5nKFxuICAgICAgICBgVGhlIHNlbGVjdG9yIGZvciAke21ldGhvZE5hbWV9IG9mIGNvbm5lY3QgZGlkIG5vdCBzcGVjaWZ5IGEgdmFsdWUgZm9yIGRlcGVuZHNPbk93blByb3BzLmBcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5mdW5jdGlvbiB2ZXJpZnlTdWJzZWxlY3RvcnMobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMsIG1lcmdlUHJvcHMpIHtcbiAgdmVyaWZ5KG1hcFN0YXRlVG9Qcm9wcywgXCJtYXBTdGF0ZVRvUHJvcHNcIik7XG4gIHZlcmlmeShtYXBEaXNwYXRjaFRvUHJvcHMsIFwibWFwRGlzcGF0Y2hUb1Byb3BzXCIpO1xuICB2ZXJpZnkobWVyZ2VQcm9wcywgXCJtZXJnZVByb3BzXCIpO1xufVxuXG4vLyBzcmMvY29ubmVjdC9zZWxlY3RvckZhY3RvcnkudHNcbmZ1bmN0aW9uIHB1cmVGaW5hbFByb3BzU2VsZWN0b3JGYWN0b3J5KG1hcFN0YXRlVG9Qcm9wcywgbWFwRGlzcGF0Y2hUb1Byb3BzLCBtZXJnZVByb3BzLCBkaXNwYXRjaCwge1xuICBhcmVTdGF0ZXNFcXVhbCxcbiAgYXJlT3duUHJvcHNFcXVhbCxcbiAgYXJlU3RhdGVQcm9wc0VxdWFsXG59KSB7XG4gIGxldCBoYXNSdW5BdExlYXN0T25jZSA9IGZhbHNlO1xuICBsZXQgc3RhdGU7XG4gIGxldCBvd25Qcm9wcztcbiAgbGV0IHN0YXRlUHJvcHM7XG4gIGxldCBkaXNwYXRjaFByb3BzO1xuICBsZXQgbWVyZ2VkUHJvcHM7XG4gIGZ1bmN0aW9uIGhhbmRsZUZpcnN0Q2FsbChmaXJzdFN0YXRlLCBmaXJzdE93blByb3BzKSB7XG4gICAgc3RhdGUgPSBmaXJzdFN0YXRlO1xuICAgIG93blByb3BzID0gZmlyc3RPd25Qcm9wcztcbiAgICBzdGF0ZVByb3BzID0gbWFwU3RhdGVUb1Byb3BzKHN0YXRlLCBvd25Qcm9wcyk7XG4gICAgZGlzcGF0Y2hQcm9wcyA9IG1hcERpc3BhdGNoVG9Qcm9wcyhkaXNwYXRjaCwgb3duUHJvcHMpO1xuICAgIG1lcmdlZFByb3BzID0gbWVyZ2VQcm9wcyhzdGF0ZVByb3BzLCBkaXNwYXRjaFByb3BzLCBvd25Qcm9wcyk7XG4gICAgaGFzUnVuQXRMZWFzdE9uY2UgPSB0cnVlO1xuICAgIHJldHVybiBtZXJnZWRQcm9wcztcbiAgfVxuICBmdW5jdGlvbiBoYW5kbGVOZXdQcm9wc0FuZE5ld1N0YXRlKCkge1xuICAgIHN0YXRlUHJvcHMgPSBtYXBTdGF0ZVRvUHJvcHMoc3RhdGUsIG93blByb3BzKTtcbiAgICBpZiAobWFwRGlzcGF0Y2hUb1Byb3BzLmRlcGVuZHNPbk93blByb3BzKVxuICAgICAgZGlzcGF0Y2hQcm9wcyA9IG1hcERpc3BhdGNoVG9Qcm9wcyhkaXNwYXRjaCwgb3duUHJvcHMpO1xuICAgIG1lcmdlZFByb3BzID0gbWVyZ2VQcm9wcyhzdGF0ZVByb3BzLCBkaXNwYXRjaFByb3BzLCBvd25Qcm9wcyk7XG4gICAgcmV0dXJuIG1lcmdlZFByb3BzO1xuICB9XG4gIGZ1bmN0aW9uIGhhbmRsZU5ld1Byb3BzKCkge1xuICAgIGlmIChtYXBTdGF0ZVRvUHJvcHMuZGVwZW5kc09uT3duUHJvcHMpXG4gICAgICBzdGF0ZVByb3BzID0gbWFwU3RhdGVUb1Byb3BzKHN0YXRlLCBvd25Qcm9wcyk7XG4gICAgaWYgKG1hcERpc3BhdGNoVG9Qcm9wcy5kZXBlbmRzT25Pd25Qcm9wcylcbiAgICAgIGRpc3BhdGNoUHJvcHMgPSBtYXBEaXNwYXRjaFRvUHJvcHMoZGlzcGF0Y2gsIG93blByb3BzKTtcbiAgICBtZXJnZWRQcm9wcyA9IG1lcmdlUHJvcHMoc3RhdGVQcm9wcywgZGlzcGF0Y2hQcm9wcywgb3duUHJvcHMpO1xuICAgIHJldHVybiBtZXJnZWRQcm9wcztcbiAgfVxuICBmdW5jdGlvbiBoYW5kbGVOZXdTdGF0ZSgpIHtcbiAgICBjb25zdCBuZXh0U3RhdGVQcm9wcyA9IG1hcFN0YXRlVG9Qcm9wcyhzdGF0ZSwgb3duUHJvcHMpO1xuICAgIGNvbnN0IHN0YXRlUHJvcHNDaGFuZ2VkID0gIWFyZVN0YXRlUHJvcHNFcXVhbChuZXh0U3RhdGVQcm9wcywgc3RhdGVQcm9wcyk7XG4gICAgc3RhdGVQcm9wcyA9IG5leHRTdGF0ZVByb3BzO1xuICAgIGlmIChzdGF0ZVByb3BzQ2hhbmdlZClcbiAgICAgIG1lcmdlZFByb3BzID0gbWVyZ2VQcm9wcyhzdGF0ZVByb3BzLCBkaXNwYXRjaFByb3BzLCBvd25Qcm9wcyk7XG4gICAgcmV0dXJuIG1lcmdlZFByb3BzO1xuICB9XG4gIGZ1bmN0aW9uIGhhbmRsZVN1YnNlcXVlbnRDYWxscyhuZXh0U3RhdGUsIG5leHRPd25Qcm9wcykge1xuICAgIGNvbnN0IHByb3BzQ2hhbmdlZCA9ICFhcmVPd25Qcm9wc0VxdWFsKG5leHRPd25Qcm9wcywgb3duUHJvcHMpO1xuICAgIGNvbnN0IHN0YXRlQ2hhbmdlZCA9ICFhcmVTdGF0ZXNFcXVhbChcbiAgICAgIG5leHRTdGF0ZSxcbiAgICAgIHN0YXRlLFxuICAgICAgbmV4dE93blByb3BzLFxuICAgICAgb3duUHJvcHNcbiAgICApO1xuICAgIHN0YXRlID0gbmV4dFN0YXRlO1xuICAgIG93blByb3BzID0gbmV4dE93blByb3BzO1xuICAgIGlmIChwcm9wc0NoYW5nZWQgJiYgc3RhdGVDaGFuZ2VkKSByZXR1cm4gaGFuZGxlTmV3UHJvcHNBbmROZXdTdGF0ZSgpO1xuICAgIGlmIChwcm9wc0NoYW5nZWQpIHJldHVybiBoYW5kbGVOZXdQcm9wcygpO1xuICAgIGlmIChzdGF0ZUNoYW5nZWQpIHJldHVybiBoYW5kbGVOZXdTdGF0ZSgpO1xuICAgIHJldHVybiBtZXJnZWRQcm9wcztcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gcHVyZUZpbmFsUHJvcHNTZWxlY3RvcihuZXh0U3RhdGUsIG5leHRPd25Qcm9wcykge1xuICAgIHJldHVybiBoYXNSdW5BdExlYXN0T25jZSA/IGhhbmRsZVN1YnNlcXVlbnRDYWxscyhuZXh0U3RhdGUsIG5leHRPd25Qcm9wcykgOiBoYW5kbGVGaXJzdENhbGwobmV4dFN0YXRlLCBuZXh0T3duUHJvcHMpO1xuICB9O1xufVxuZnVuY3Rpb24gZmluYWxQcm9wc1NlbGVjdG9yRmFjdG9yeShkaXNwYXRjaCwge1xuICBpbml0TWFwU3RhdGVUb1Byb3BzLFxuICBpbml0TWFwRGlzcGF0Y2hUb1Byb3BzLFxuICBpbml0TWVyZ2VQcm9wcyxcbiAgLi4ub3B0aW9uc1xufSkge1xuICBjb25zdCBtYXBTdGF0ZVRvUHJvcHMgPSBpbml0TWFwU3RhdGVUb1Byb3BzKGRpc3BhdGNoLCBvcHRpb25zKTtcbiAgY29uc3QgbWFwRGlzcGF0Y2hUb1Byb3BzID0gaW5pdE1hcERpc3BhdGNoVG9Qcm9wcyhkaXNwYXRjaCwgb3B0aW9ucyk7XG4gIGNvbnN0IG1lcmdlUHJvcHMgPSBpbml0TWVyZ2VQcm9wcyhkaXNwYXRjaCwgb3B0aW9ucyk7XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIHtcbiAgICB2ZXJpZnlTdWJzZWxlY3RvcnMobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMsIG1lcmdlUHJvcHMpO1xuICB9XG4gIHJldHVybiBwdXJlRmluYWxQcm9wc1NlbGVjdG9yRmFjdG9yeShtYXBTdGF0ZVRvUHJvcHMsIG1hcERpc3BhdGNoVG9Qcm9wcywgbWVyZ2VQcm9wcywgZGlzcGF0Y2gsIG9wdGlvbnMpO1xufVxuXG4vLyBzcmMvdXRpbHMvYmluZEFjdGlvbkNyZWF0b3JzLnRzXG5mdW5jdGlvbiBiaW5kQWN0aW9uQ3JlYXRvcnMoYWN0aW9uQ3JlYXRvcnMsIGRpc3BhdGNoKSB7XG4gIGNvbnN0IGJvdW5kQWN0aW9uQ3JlYXRvcnMgPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgaW4gYWN0aW9uQ3JlYXRvcnMpIHtcbiAgICBjb25zdCBhY3Rpb25DcmVhdG9yID0gYWN0aW9uQ3JlYXRvcnNba2V5XTtcbiAgICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgYm91bmRBY3Rpb25DcmVhdG9yc1trZXldID0gKC4uLmFyZ3MpID0+IGRpc3BhdGNoKGFjdGlvbkNyZWF0b3IoLi4uYXJncykpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYm91bmRBY3Rpb25DcmVhdG9ycztcbn1cblxuLy8gc3JjL3V0aWxzL2lzUGxhaW5PYmplY3QudHNcbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG4gIGlmICh0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiIHx8IG9iaiA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopO1xuICBpZiAocHJvdG8gPT09IG51bGwpIHJldHVybiB0cnVlO1xuICBsZXQgYmFzZVByb3RvID0gcHJvdG87XG4gIHdoaWxlIChPYmplY3QuZ2V0UHJvdG90eXBlT2YoYmFzZVByb3RvKSAhPT0gbnVsbCkge1xuICAgIGJhc2VQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihiYXNlUHJvdG8pO1xuICB9XG4gIHJldHVybiBwcm90byA9PT0gYmFzZVByb3RvO1xufVxuXG4vLyBzcmMvdXRpbHMvdmVyaWZ5UGxhaW5PYmplY3QudHNcbmZ1bmN0aW9uIHZlcmlmeVBsYWluT2JqZWN0KHZhbHVlLCBkaXNwbGF5TmFtZSwgbWV0aG9kTmFtZSkge1xuICBpZiAoIWlzUGxhaW5PYmplY3QodmFsdWUpKSB7XG4gICAgd2FybmluZyhcbiAgICAgIGAke21ldGhvZE5hbWV9KCkgaW4gJHtkaXNwbGF5TmFtZX0gbXVzdCByZXR1cm4gYSBwbGFpbiBvYmplY3QuIEluc3RlYWQgcmVjZWl2ZWQgJHt2YWx1ZX0uYFxuICAgICk7XG4gIH1cbn1cblxuLy8gc3JjL2Nvbm5lY3Qvd3JhcE1hcFRvUHJvcHMudHNcbmZ1bmN0aW9uIHdyYXBNYXBUb1Byb3BzQ29uc3RhbnQoZ2V0Q29uc3RhbnQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGluaXRDb25zdGFudFNlbGVjdG9yKGRpc3BhdGNoKSB7XG4gICAgY29uc3QgY29uc3RhbnQgPSBnZXRDb25zdGFudChkaXNwYXRjaCk7XG4gICAgZnVuY3Rpb24gY29uc3RhbnRTZWxlY3RvcigpIHtcbiAgICAgIHJldHVybiBjb25zdGFudDtcbiAgICB9XG4gICAgY29uc3RhbnRTZWxlY3Rvci5kZXBlbmRzT25Pd25Qcm9wcyA9IGZhbHNlO1xuICAgIHJldHVybiBjb25zdGFudFNlbGVjdG9yO1xuICB9O1xufVxuZnVuY3Rpb24gZ2V0RGVwZW5kc09uT3duUHJvcHMobWFwVG9Qcm9wcykge1xuICByZXR1cm4gbWFwVG9Qcm9wcy5kZXBlbmRzT25Pd25Qcm9wcyA/IEJvb2xlYW4obWFwVG9Qcm9wcy5kZXBlbmRzT25Pd25Qcm9wcykgOiBtYXBUb1Byb3BzLmxlbmd0aCAhPT0gMTtcbn1cbmZ1bmN0aW9uIHdyYXBNYXBUb1Byb3BzRnVuYyhtYXBUb1Byb3BzLCBtZXRob2ROYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbiBpbml0UHJveHlTZWxlY3RvcihkaXNwYXRjaCwgeyBkaXNwbGF5TmFtZSB9KSB7XG4gICAgY29uc3QgcHJveHkgPSBmdW5jdGlvbiBtYXBUb1Byb3BzUHJveHkoc3RhdGVPckRpc3BhdGNoLCBvd25Qcm9wcykge1xuICAgICAgcmV0dXJuIHByb3h5LmRlcGVuZHNPbk93blByb3BzID8gcHJveHkubWFwVG9Qcm9wcyhzdGF0ZU9yRGlzcGF0Y2gsIG93blByb3BzKSA6IHByb3h5Lm1hcFRvUHJvcHMoc3RhdGVPckRpc3BhdGNoLCB2b2lkIDApO1xuICAgIH07XG4gICAgcHJveHkuZGVwZW5kc09uT3duUHJvcHMgPSB0cnVlO1xuICAgIHByb3h5Lm1hcFRvUHJvcHMgPSBmdW5jdGlvbiBkZXRlY3RGYWN0b3J5QW5kVmVyaWZ5KHN0YXRlT3JEaXNwYXRjaCwgb3duUHJvcHMpIHtcbiAgICAgIHByb3h5Lm1hcFRvUHJvcHMgPSBtYXBUb1Byb3BzO1xuICAgICAgcHJveHkuZGVwZW5kc09uT3duUHJvcHMgPSBnZXREZXBlbmRzT25Pd25Qcm9wcyhtYXBUb1Byb3BzKTtcbiAgICAgIGxldCBwcm9wcyA9IHByb3h5KHN0YXRlT3JEaXNwYXRjaCwgb3duUHJvcHMpO1xuICAgICAgaWYgKHR5cGVvZiBwcm9wcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHByb3h5Lm1hcFRvUHJvcHMgPSBwcm9wcztcbiAgICAgICAgcHJveHkuZGVwZW5kc09uT3duUHJvcHMgPSBnZXREZXBlbmRzT25Pd25Qcm9wcyhwcm9wcyk7XG4gICAgICAgIHByb3BzID0gcHJveHkoc3RhdGVPckRpc3BhdGNoLCBvd25Qcm9wcyk7XG4gICAgICB9XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKVxuICAgICAgICB2ZXJpZnlQbGFpbk9iamVjdChwcm9wcywgZGlzcGxheU5hbWUsIG1ldGhvZE5hbWUpO1xuICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH07XG4gICAgcmV0dXJuIHByb3h5O1xuICB9O1xufVxuXG4vLyBzcmMvY29ubmVjdC9pbnZhbGlkQXJnRmFjdG9yeS50c1xuZnVuY3Rpb24gY3JlYXRlSW52YWxpZEFyZ0ZhY3RvcnkoYXJnLCBuYW1lKSB7XG4gIHJldHVybiAoZGlzcGF0Y2gsIG9wdGlvbnMpID0+IHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgSW52YWxpZCB2YWx1ZSBvZiB0eXBlICR7dHlwZW9mIGFyZ30gZm9yICR7bmFtZX0gYXJndW1lbnQgd2hlbiBjb25uZWN0aW5nIGNvbXBvbmVudCAke29wdGlvbnMud3JhcHBlZENvbXBvbmVudE5hbWV9LmBcbiAgICApO1xuICB9O1xufVxuXG4vLyBzcmMvY29ubmVjdC9tYXBEaXNwYXRjaFRvUHJvcHMudHNcbmZ1bmN0aW9uIG1hcERpc3BhdGNoVG9Qcm9wc0ZhY3RvcnkobWFwRGlzcGF0Y2hUb1Byb3BzKSB7XG4gIHJldHVybiBtYXBEaXNwYXRjaFRvUHJvcHMgJiYgdHlwZW9mIG1hcERpc3BhdGNoVG9Qcm9wcyA9PT0gXCJvYmplY3RcIiA/IHdyYXBNYXBUb1Byb3BzQ29uc3RhbnQoXG4gICAgKGRpc3BhdGNoKSA9PiAoXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBiaW5kQWN0aW9uQ3JlYXRvcnMobWFwRGlzcGF0Y2hUb1Byb3BzLCBkaXNwYXRjaClcbiAgICApXG4gICkgOiAhbWFwRGlzcGF0Y2hUb1Byb3BzID8gd3JhcE1hcFRvUHJvcHNDb25zdGFudCgoZGlzcGF0Y2gpID0+ICh7XG4gICAgZGlzcGF0Y2hcbiAgfSkpIDogdHlwZW9mIG1hcERpc3BhdGNoVG9Qcm9wcyA9PT0gXCJmdW5jdGlvblwiID8gKFxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICB3cmFwTWFwVG9Qcm9wc0Z1bmMobWFwRGlzcGF0Y2hUb1Byb3BzLCBcIm1hcERpc3BhdGNoVG9Qcm9wc1wiKVxuICApIDogY3JlYXRlSW52YWxpZEFyZ0ZhY3RvcnkobWFwRGlzcGF0Y2hUb1Byb3BzLCBcIm1hcERpc3BhdGNoVG9Qcm9wc1wiKTtcbn1cblxuLy8gc3JjL2Nvbm5lY3QvbWFwU3RhdGVUb1Byb3BzLnRzXG5mdW5jdGlvbiBtYXBTdGF0ZVRvUHJvcHNGYWN0b3J5KG1hcFN0YXRlVG9Qcm9wcykge1xuICByZXR1cm4gIW1hcFN0YXRlVG9Qcm9wcyA/IHdyYXBNYXBUb1Byb3BzQ29uc3RhbnQoKCkgPT4gKHt9KSkgOiB0eXBlb2YgbWFwU3RhdGVUb1Byb3BzID09PSBcImZ1bmN0aW9uXCIgPyAoXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHdyYXBNYXBUb1Byb3BzRnVuYyhtYXBTdGF0ZVRvUHJvcHMsIFwibWFwU3RhdGVUb1Byb3BzXCIpXG4gICkgOiBjcmVhdGVJbnZhbGlkQXJnRmFjdG9yeShtYXBTdGF0ZVRvUHJvcHMsIFwibWFwU3RhdGVUb1Byb3BzXCIpO1xufVxuXG4vLyBzcmMvY29ubmVjdC9tZXJnZVByb3BzLnRzXG5mdW5jdGlvbiBkZWZhdWx0TWVyZ2VQcm9wcyhzdGF0ZVByb3BzLCBkaXNwYXRjaFByb3BzLCBvd25Qcm9wcykge1xuICByZXR1cm4geyAuLi5vd25Qcm9wcywgLi4uc3RhdGVQcm9wcywgLi4uZGlzcGF0Y2hQcm9wcyB9O1xufVxuZnVuY3Rpb24gd3JhcE1lcmdlUHJvcHNGdW5jKG1lcmdlUHJvcHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGluaXRNZXJnZVByb3BzUHJveHkoZGlzcGF0Y2gsIHsgZGlzcGxheU5hbWUsIGFyZU1lcmdlZFByb3BzRXF1YWwgfSkge1xuICAgIGxldCBoYXNSdW5PbmNlID0gZmFsc2U7XG4gICAgbGV0IG1lcmdlZFByb3BzO1xuICAgIHJldHVybiBmdW5jdGlvbiBtZXJnZVByb3BzUHJveHkoc3RhdGVQcm9wcywgZGlzcGF0Y2hQcm9wcywgb3duUHJvcHMpIHtcbiAgICAgIGNvbnN0IG5leHRNZXJnZWRQcm9wcyA9IG1lcmdlUHJvcHMoc3RhdGVQcm9wcywgZGlzcGF0Y2hQcm9wcywgb3duUHJvcHMpO1xuICAgICAgaWYgKGhhc1J1bk9uY2UpIHtcbiAgICAgICAgaWYgKCFhcmVNZXJnZWRQcm9wc0VxdWFsKG5leHRNZXJnZWRQcm9wcywgbWVyZ2VkUHJvcHMpKVxuICAgICAgICAgIG1lcmdlZFByb3BzID0gbmV4dE1lcmdlZFByb3BzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGFzUnVuT25jZSA9IHRydWU7XG4gICAgICAgIG1lcmdlZFByb3BzID0gbmV4dE1lcmdlZFByb3BzO1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKVxuICAgICAgICAgIHZlcmlmeVBsYWluT2JqZWN0KG1lcmdlZFByb3BzLCBkaXNwbGF5TmFtZSwgXCJtZXJnZVByb3BzXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1lcmdlZFByb3BzO1xuICAgIH07XG4gIH07XG59XG5mdW5jdGlvbiBtZXJnZVByb3BzRmFjdG9yeShtZXJnZVByb3BzKSB7XG4gIHJldHVybiAhbWVyZ2VQcm9wcyA/ICgpID0+IGRlZmF1bHRNZXJnZVByb3BzIDogdHlwZW9mIG1lcmdlUHJvcHMgPT09IFwiZnVuY3Rpb25cIiA/IHdyYXBNZXJnZVByb3BzRnVuYyhtZXJnZVByb3BzKSA6IGNyZWF0ZUludmFsaWRBcmdGYWN0b3J5KG1lcmdlUHJvcHMsIFwibWVyZ2VQcm9wc1wiKTtcbn1cblxuLy8gc3JjL3V0aWxzL2JhdGNoLnRzXG5mdW5jdGlvbiBkZWZhdWx0Tm9vcEJhdGNoKGNhbGxiYWNrKSB7XG4gIGNhbGxiYWNrKCk7XG59XG5cbi8vIHNyYy91dGlscy9TdWJzY3JpcHRpb24udHNcbmZ1bmN0aW9uIGNyZWF0ZUxpc3RlbmVyQ29sbGVjdGlvbigpIHtcbiAgbGV0IGZpcnN0ID0gbnVsbDtcbiAgbGV0IGxhc3QgPSBudWxsO1xuICByZXR1cm4ge1xuICAgIGNsZWFyKCkge1xuICAgICAgZmlyc3QgPSBudWxsO1xuICAgICAgbGFzdCA9IG51bGw7XG4gICAgfSxcbiAgICBub3RpZnkoKSB7XG4gICAgICBkZWZhdWx0Tm9vcEJhdGNoKCgpID0+IHtcbiAgICAgICAgbGV0IGxpc3RlbmVyID0gZmlyc3Q7XG4gICAgICAgIHdoaWxlIChsaXN0ZW5lcikge1xuICAgICAgICAgIGxpc3RlbmVyLmNhbGxiYWNrKCk7XG4gICAgICAgICAgbGlzdGVuZXIgPSBsaXN0ZW5lci5uZXh0O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldCgpIHtcbiAgICAgIGNvbnN0IGxpc3RlbmVycyA9IFtdO1xuICAgICAgbGV0IGxpc3RlbmVyID0gZmlyc3Q7XG4gICAgICB3aGlsZSAobGlzdGVuZXIpIHtcbiAgICAgICAgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgICAgICBsaXN0ZW5lciA9IGxpc3RlbmVyLm5leHQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGlzdGVuZXJzO1xuICAgIH0sXG4gICAgc3Vic2NyaWJlKGNhbGxiYWNrKSB7XG4gICAgICBsZXQgaXNTdWJzY3JpYmVkID0gdHJ1ZTtcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gbGFzdCA9IHtcbiAgICAgICAgY2FsbGJhY2ssXG4gICAgICAgIG5leHQ6IG51bGwsXG4gICAgICAgIHByZXY6IGxhc3RcbiAgICAgIH07XG4gICAgICBpZiAobGlzdGVuZXIucHJldikge1xuICAgICAgICBsaXN0ZW5lci5wcmV2Lm5leHQgPSBsaXN0ZW5lcjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpcnN0ID0gbGlzdGVuZXI7XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24gdW5zdWJzY3JpYmUoKSB7XG4gICAgICAgIGlmICghaXNTdWJzY3JpYmVkIHx8IGZpcnN0ID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIGlzU3Vic2NyaWJlZCA9IGZhbHNlO1xuICAgICAgICBpZiAobGlzdGVuZXIubmV4dCkge1xuICAgICAgICAgIGxpc3RlbmVyLm5leHQucHJldiA9IGxpc3RlbmVyLnByZXY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGFzdCA9IGxpc3RlbmVyLnByZXY7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpc3RlbmVyLnByZXYpIHtcbiAgICAgICAgICBsaXN0ZW5lci5wcmV2Lm5leHQgPSBsaXN0ZW5lci5uZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZpcnN0ID0gbGlzdGVuZXIubmV4dDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH07XG59XG52YXIgbnVsbExpc3RlbmVycyA9IHtcbiAgbm90aWZ5KCkge1xuICB9LFxuICBnZXQ6ICgpID0+IFtdXG59O1xuZnVuY3Rpb24gY3JlYXRlU3Vic2NyaXB0aW9uKHN0b3JlLCBwYXJlbnRTdWIpIHtcbiAgbGV0IHVuc3Vic2NyaWJlO1xuICBsZXQgbGlzdGVuZXJzID0gbnVsbExpc3RlbmVycztcbiAgbGV0IHN1YnNjcmlwdGlvbnNBbW91bnQgPSAwO1xuICBsZXQgc2VsZlN1YnNjcmliZWQgPSBmYWxzZTtcbiAgZnVuY3Rpb24gYWRkTmVzdGVkU3ViKGxpc3RlbmVyKSB7XG4gICAgdHJ5U3Vic2NyaWJlKCk7XG4gICAgY29uc3QgY2xlYW51cExpc3RlbmVyID0gbGlzdGVuZXJzLnN1YnNjcmliZShsaXN0ZW5lcik7XG4gICAgbGV0IHJlbW92ZWQgPSBmYWxzZTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKCFyZW1vdmVkKSB7XG4gICAgICAgIHJlbW92ZWQgPSB0cnVlO1xuICAgICAgICBjbGVhbnVwTGlzdGVuZXIoKTtcbiAgICAgICAgdHJ5VW5zdWJzY3JpYmUoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIG5vdGlmeU5lc3RlZFN1YnMoKSB7XG4gICAgbGlzdGVuZXJzLm5vdGlmeSgpO1xuICB9XG4gIGZ1bmN0aW9uIGhhbmRsZUNoYW5nZVdyYXBwZXIoKSB7XG4gICAgaWYgKHN1YnNjcmlwdGlvbi5vblN0YXRlQ2hhbmdlKSB7XG4gICAgICBzdWJzY3JpcHRpb24ub25TdGF0ZUNoYW5nZSgpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBpc1N1YnNjcmliZWQoKSB7XG4gICAgcmV0dXJuIHNlbGZTdWJzY3JpYmVkO1xuICB9XG4gIGZ1bmN0aW9uIHRyeVN1YnNjcmliZSgpIHtcbiAgICBzdWJzY3JpcHRpb25zQW1vdW50Kys7XG4gICAgaWYgKCF1bnN1YnNjcmliZSkge1xuICAgICAgdW5zdWJzY3JpYmUgPSBwYXJlbnRTdWIgPyBwYXJlbnRTdWIuYWRkTmVzdGVkU3ViKGhhbmRsZUNoYW5nZVdyYXBwZXIpIDogc3RvcmUuc3Vic2NyaWJlKGhhbmRsZUNoYW5nZVdyYXBwZXIpO1xuICAgICAgbGlzdGVuZXJzID0gY3JlYXRlTGlzdGVuZXJDb2xsZWN0aW9uKCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHRyeVVuc3Vic2NyaWJlKCkge1xuICAgIHN1YnNjcmlwdGlvbnNBbW91bnQtLTtcbiAgICBpZiAodW5zdWJzY3JpYmUgJiYgc3Vic2NyaXB0aW9uc0Ftb3VudCA9PT0gMCkge1xuICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgIHVuc3Vic2NyaWJlID0gdm9pZCAwO1xuICAgICAgbGlzdGVuZXJzLmNsZWFyKCk7XG4gICAgICBsaXN0ZW5lcnMgPSBudWxsTGlzdGVuZXJzO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0cnlTdWJzY3JpYmVTZWxmKCkge1xuICAgIGlmICghc2VsZlN1YnNjcmliZWQpIHtcbiAgICAgIHNlbGZTdWJzY3JpYmVkID0gdHJ1ZTtcbiAgICAgIHRyeVN1YnNjcmliZSgpO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiB0cnlVbnN1YnNjcmliZVNlbGYoKSB7XG4gICAgaWYgKHNlbGZTdWJzY3JpYmVkKSB7XG4gICAgICBzZWxmU3Vic2NyaWJlZCA9IGZhbHNlO1xuICAgICAgdHJ5VW5zdWJzY3JpYmUoKTtcbiAgICB9XG4gIH1cbiAgY29uc3Qgc3Vic2NyaXB0aW9uID0ge1xuICAgIGFkZE5lc3RlZFN1YixcbiAgICBub3RpZnlOZXN0ZWRTdWJzLFxuICAgIGhhbmRsZUNoYW5nZVdyYXBwZXIsXG4gICAgaXNTdWJzY3JpYmVkLFxuICAgIHRyeVN1YnNjcmliZTogdHJ5U3Vic2NyaWJlU2VsZixcbiAgICB0cnlVbnN1YnNjcmliZTogdHJ5VW5zdWJzY3JpYmVTZWxmLFxuICAgIGdldExpc3RlbmVyczogKCkgPT4gbGlzdGVuZXJzXG4gIH07XG4gIHJldHVybiBzdWJzY3JpcHRpb247XG59XG5cbi8vIHNyYy91dGlscy91c2VJc29tb3JwaGljTGF5b3V0RWZmZWN0LnRzXG52YXIgY2FuVXNlRE9NID0gKCkgPT4gISEodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2Ygd2luZG93LmRvY3VtZW50ICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAhPT0gXCJ1bmRlZmluZWRcIik7XG52YXIgaXNET00gPSAvKiBAX19QVVJFX18gKi8gY2FuVXNlRE9NKCk7XG52YXIgaXNSdW5uaW5nSW5SZWFjdE5hdGl2ZSA9ICgpID0+IHR5cGVvZiBuYXZpZ2F0b3IgIT09IFwidW5kZWZpbmVkXCIgJiYgbmF2aWdhdG9yLnByb2R1Y3QgPT09IFwiUmVhY3ROYXRpdmVcIjtcbnZhciBpc1JlYWN0TmF0aXZlID0gLyogQF9fUFVSRV9fICovIGlzUnVubmluZ0luUmVhY3ROYXRpdmUoKTtcbnZhciBnZXRVc2VJc29tb3JwaGljTGF5b3V0RWZmZWN0ID0gKCkgPT4gaXNET00gfHwgaXNSZWFjdE5hdGl2ZSA/IFJlYWN0LnVzZUxheW91dEVmZmVjdCA6IFJlYWN0LnVzZUVmZmVjdDtcbnZhciB1c2VJc29tb3JwaGljTGF5b3V0RWZmZWN0ID0gLyogQF9fUFVSRV9fICovIGdldFVzZUlzb21vcnBoaWNMYXlvdXRFZmZlY3QoKTtcblxuLy8gc3JjL3V0aWxzL3NoYWxsb3dFcXVhbC50c1xuZnVuY3Rpb24gaXMoeCwgeSkge1xuICBpZiAoeCA9PT0geSkge1xuICAgIHJldHVybiB4ICE9PSAwIHx8IHkgIT09IDAgfHwgMSAvIHggPT09IDEgLyB5O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB4ICE9PSB4ICYmIHkgIT09IHk7XG4gIH1cbn1cbmZ1bmN0aW9uIHNoYWxsb3dFcXVhbChvYmpBLCBvYmpCKSB7XG4gIGlmIChpcyhvYmpBLCBvYmpCKSkgcmV0dXJuIHRydWU7XG4gIGlmICh0eXBlb2Ygb2JqQSAhPT0gXCJvYmplY3RcIiB8fCBvYmpBID09PSBudWxsIHx8IHR5cGVvZiBvYmpCICE9PSBcIm9iamVjdFwiIHx8IG9iakIgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY29uc3Qga2V5c0EgPSBPYmplY3Qua2V5cyhvYmpBKTtcbiAgY29uc3Qga2V5c0IgPSBPYmplY3Qua2V5cyhvYmpCKTtcbiAgaWYgKGtleXNBLmxlbmd0aCAhPT0ga2V5c0IubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwga2V5c0EubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmpCLCBrZXlzQVtpXSkgfHwgIWlzKG9iakFba2V5c0FbaV1dLCBvYmpCW2tleXNBW2ldXSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIHNyYy91dGlscy9ob2lzdFN0YXRpY3MudHNcbnZhciBSRUFDVF9TVEFUSUNTID0ge1xuICBjaGlsZENvbnRleHRUeXBlczogdHJ1ZSxcbiAgY29udGV4dFR5cGU6IHRydWUsXG4gIGNvbnRleHRUeXBlczogdHJ1ZSxcbiAgZGVmYXVsdFByb3BzOiB0cnVlLFxuICBkaXNwbGF5TmFtZTogdHJ1ZSxcbiAgZ2V0RGVmYXVsdFByb3BzOiB0cnVlLFxuICBnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3I6IHRydWUsXG4gIGdldERlcml2ZWRTdGF0ZUZyb21Qcm9wczogdHJ1ZSxcbiAgbWl4aW5zOiB0cnVlLFxuICBwcm9wVHlwZXM6IHRydWUsXG4gIHR5cGU6IHRydWVcbn07XG52YXIgS05PV05fU1RBVElDUyA9IHtcbiAgbmFtZTogdHJ1ZSxcbiAgbGVuZ3RoOiB0cnVlLFxuICBwcm90b3R5cGU6IHRydWUsXG4gIGNhbGxlcjogdHJ1ZSxcbiAgY2FsbGVlOiB0cnVlLFxuICBhcmd1bWVudHM6IHRydWUsXG4gIGFyaXR5OiB0cnVlXG59O1xudmFyIEZPUldBUkRfUkVGX1NUQVRJQ1MgPSB7XG4gICQkdHlwZW9mOiB0cnVlLFxuICByZW5kZXI6IHRydWUsXG4gIGRlZmF1bHRQcm9wczogdHJ1ZSxcbiAgZGlzcGxheU5hbWU6IHRydWUsXG4gIHByb3BUeXBlczogdHJ1ZVxufTtcbnZhciBNRU1PX1NUQVRJQ1MgPSB7XG4gICQkdHlwZW9mOiB0cnVlLFxuICBjb21wYXJlOiB0cnVlLFxuICBkZWZhdWx0UHJvcHM6IHRydWUsXG4gIGRpc3BsYXlOYW1lOiB0cnVlLFxuICBwcm9wVHlwZXM6IHRydWUsXG4gIHR5cGU6IHRydWVcbn07XG52YXIgVFlQRV9TVEFUSUNTID0ge1xuICBbRm9yd2FyZFJlZl06IEZPUldBUkRfUkVGX1NUQVRJQ1MsXG4gIFtNZW1vXTogTUVNT19TVEFUSUNTXG59O1xuZnVuY3Rpb24gZ2V0U3RhdGljcyhjb21wb25lbnQpIHtcbiAgaWYgKGlzTWVtbyhjb21wb25lbnQpKSB7XG4gICAgcmV0dXJuIE1FTU9fU1RBVElDUztcbiAgfVxuICByZXR1cm4gVFlQRV9TVEFUSUNTW2NvbXBvbmVudFtcIiQkdHlwZW9mXCJdXSB8fCBSRUFDVF9TVEFUSUNTO1xufVxudmFyIGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xudmFyIGdldE93blByb3BlcnR5TmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcztcbnZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xudmFyIGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG52YXIgZ2V0UHJvdG90eXBlT2YgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG52YXIgb2JqZWN0UHJvdG90eXBlID0gT2JqZWN0LnByb3RvdHlwZTtcbmZ1bmN0aW9uIGhvaXN0Tm9uUmVhY3RTdGF0aWNzKHRhcmdldENvbXBvbmVudCwgc291cmNlQ29tcG9uZW50KSB7XG4gIGlmICh0eXBlb2Ygc291cmNlQ29tcG9uZW50ICE9PSBcInN0cmluZ1wiKSB7XG4gICAgaWYgKG9iamVjdFByb3RvdHlwZSkge1xuICAgICAgY29uc3QgaW5oZXJpdGVkQ29tcG9uZW50ID0gZ2V0UHJvdG90eXBlT2Yoc291cmNlQ29tcG9uZW50KTtcbiAgICAgIGlmIChpbmhlcml0ZWRDb21wb25lbnQgJiYgaW5oZXJpdGVkQ29tcG9uZW50ICE9PSBvYmplY3RQcm90b3R5cGUpIHtcbiAgICAgICAgaG9pc3ROb25SZWFjdFN0YXRpY3ModGFyZ2V0Q29tcG9uZW50LCBpbmhlcml0ZWRDb21wb25lbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICBsZXQga2V5cyA9IGdldE93blByb3BlcnR5TmFtZXMoc291cmNlQ29tcG9uZW50KTtcbiAgICBpZiAoZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG4gICAgICBrZXlzID0ga2V5cy5jb25jYXQoZ2V0T3duUHJvcGVydHlTeW1ib2xzKHNvdXJjZUNvbXBvbmVudCkpO1xuICAgIH1cbiAgICBjb25zdCB0YXJnZXRTdGF0aWNzID0gZ2V0U3RhdGljcyh0YXJnZXRDb21wb25lbnQpO1xuICAgIGNvbnN0IHNvdXJjZVN0YXRpY3MgPSBnZXRTdGF0aWNzKHNvdXJjZUNvbXBvbmVudCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICBjb25zdCBrZXkgPSBrZXlzW2ldO1xuICAgICAgaWYgKCFLTk9XTl9TVEFUSUNTW2tleV0gJiYgIShzb3VyY2VTdGF0aWNzICYmIHNvdXJjZVN0YXRpY3Nba2V5XSkgJiYgISh0YXJnZXRTdGF0aWNzICYmIHRhcmdldFN0YXRpY3Nba2V5XSkpIHtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRvciA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2VDb21wb25lbnQsIGtleSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZGVmaW5lUHJvcGVydHkodGFyZ2V0Q29tcG9uZW50LCBrZXksIGRlc2NyaXB0b3IpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRhcmdldENvbXBvbmVudDtcbn1cblxuLy8gc3JjL2NvbXBvbmVudHMvQ29udGV4dC50c1xudmFyIENvbnRleHRLZXkgPSAvKiBAX19QVVJFX18gKi8gU3ltYm9sLmZvcihgcmVhY3QtcmVkdXgtY29udGV4dGApO1xudmFyIGdUID0gdHlwZW9mIGdsb2JhbFRoaXMgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxUaGlzIDogKFxuICAvKiBmYWxsIGJhY2sgdG8gYSBwZXItbW9kdWxlIHNjb3BlIChwcmUtOC4xIGJlaGF2aW91cikgaWYgYGdsb2JhbFRoaXNgIGlzIG5vdCBhdmFpbGFibGUgKi9cbiAge31cbik7XG5mdW5jdGlvbiBnZXRDb250ZXh0KCkge1xuICBpZiAoIVJlYWN0LmNyZWF0ZUNvbnRleHQpIHJldHVybiB7fTtcbiAgY29uc3QgY29udGV4dE1hcCA9IGdUW0NvbnRleHRLZXldID8/PSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBsZXQgcmVhbENvbnRleHQgPSBjb250ZXh0TWFwLmdldChSZWFjdC5jcmVhdGVDb250ZXh0KTtcbiAgaWYgKCFyZWFsQ29udGV4dCkge1xuICAgIHJlYWxDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dChcbiAgICAgIG51bGxcbiAgICApO1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIHtcbiAgICAgIHJlYWxDb250ZXh0LmRpc3BsYXlOYW1lID0gXCJSZWFjdFJlZHV4XCI7XG4gICAgfVxuICAgIGNvbnRleHRNYXAuc2V0KFJlYWN0LmNyZWF0ZUNvbnRleHQsIHJlYWxDb250ZXh0KTtcbiAgfVxuICByZXR1cm4gcmVhbENvbnRleHQ7XG59XG52YXIgUmVhY3RSZWR1eENvbnRleHQgPSAvKiBAX19QVVJFX18gKi8gZ2V0Q29udGV4dCgpO1xuXG4vLyBzcmMvY29tcG9uZW50cy9jb25uZWN0LnRzeFxudmFyIE5PX1NVQlNDUklQVElPTl9BUlJBWSA9IFtudWxsLCBudWxsXTtcbnZhciBzdHJpbmdpZnlDb21wb25lbnQgPSAoQ29tcCkgPT4ge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShDb21wKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFN0cmluZyhDb21wKTtcbiAgfVxufTtcbmZ1bmN0aW9uIHVzZUlzb21vcnBoaWNMYXlvdXRFZmZlY3RXaXRoQXJncyhlZmZlY3RGdW5jLCBlZmZlY3RBcmdzLCBkZXBlbmRlbmNpZXMpIHtcbiAgdXNlSXNvbW9ycGhpY0xheW91dEVmZmVjdCgoKSA9PiBlZmZlY3RGdW5jKC4uLmVmZmVjdEFyZ3MpLCBkZXBlbmRlbmNpZXMpO1xufVxuZnVuY3Rpb24gY2FwdHVyZVdyYXBwZXJQcm9wcyhsYXN0V3JhcHBlclByb3BzLCBsYXN0Q2hpbGRQcm9wcywgcmVuZGVySXNTY2hlZHVsZWQsIHdyYXBwZXJQcm9wcywgY2hpbGRQcm9wc0Zyb21TdG9yZVVwZGF0ZSwgbm90aWZ5TmVzdGVkU3Vicykge1xuICBsYXN0V3JhcHBlclByb3BzLmN1cnJlbnQgPSB3cmFwcGVyUHJvcHM7XG4gIHJlbmRlcklzU2NoZWR1bGVkLmN1cnJlbnQgPSBmYWxzZTtcbiAgaWYgKGNoaWxkUHJvcHNGcm9tU3RvcmVVcGRhdGUuY3VycmVudCkge1xuICAgIGNoaWxkUHJvcHNGcm9tU3RvcmVVcGRhdGUuY3VycmVudCA9IG51bGw7XG4gICAgbm90aWZ5TmVzdGVkU3VicygpO1xuICB9XG59XG5mdW5jdGlvbiBzdWJzY3JpYmVVcGRhdGVzKHNob3VsZEhhbmRsZVN0YXRlQ2hhbmdlcywgc3RvcmUsIHN1YnNjcmlwdGlvbiwgY2hpbGRQcm9wc1NlbGVjdG9yLCBsYXN0V3JhcHBlclByb3BzLCBsYXN0Q2hpbGRQcm9wcywgcmVuZGVySXNTY2hlZHVsZWQsIGlzTW91bnRlZCwgY2hpbGRQcm9wc0Zyb21TdG9yZVVwZGF0ZSwgbm90aWZ5TmVzdGVkU3VicywgYWRkaXRpb25hbFN1YnNjcmliZUxpc3RlbmVyKSB7XG4gIGlmICghc2hvdWxkSGFuZGxlU3RhdGVDaGFuZ2VzKSByZXR1cm4gKCkgPT4ge1xuICB9O1xuICBsZXQgZGlkVW5zdWJzY3JpYmUgPSBmYWxzZTtcbiAgbGV0IGxhc3RUaHJvd25FcnJvciA9IG51bGw7XG4gIGNvbnN0IGNoZWNrRm9yVXBkYXRlcyA9ICgpID0+IHtcbiAgICBpZiAoZGlkVW5zdWJzY3JpYmUgfHwgIWlzTW91bnRlZC5jdXJyZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGxhdGVzdFN0b3JlU3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpO1xuICAgIGxldCBuZXdDaGlsZFByb3BzLCBlcnJvcjtcbiAgICB0cnkge1xuICAgICAgbmV3Q2hpbGRQcm9wcyA9IGNoaWxkUHJvcHNTZWxlY3RvcihcbiAgICAgICAgbGF0ZXN0U3RvcmVTdGF0ZSxcbiAgICAgICAgbGFzdFdyYXBwZXJQcm9wcy5jdXJyZW50XG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGVycm9yID0gZTtcbiAgICAgIGxhc3RUaHJvd25FcnJvciA9IGU7XG4gICAgfVxuICAgIGlmICghZXJyb3IpIHtcbiAgICAgIGxhc3RUaHJvd25FcnJvciA9IG51bGw7XG4gICAgfVxuICAgIGlmIChuZXdDaGlsZFByb3BzID09PSBsYXN0Q2hpbGRQcm9wcy5jdXJyZW50KSB7XG4gICAgICBpZiAoIXJlbmRlcklzU2NoZWR1bGVkLmN1cnJlbnQpIHtcbiAgICAgICAgbm90aWZ5TmVzdGVkU3VicygpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsYXN0Q2hpbGRQcm9wcy5jdXJyZW50ID0gbmV3Q2hpbGRQcm9wcztcbiAgICAgIGNoaWxkUHJvcHNGcm9tU3RvcmVVcGRhdGUuY3VycmVudCA9IG5ld0NoaWxkUHJvcHM7XG4gICAgICByZW5kZXJJc1NjaGVkdWxlZC5jdXJyZW50ID0gdHJ1ZTtcbiAgICAgIGFkZGl0aW9uYWxTdWJzY3JpYmVMaXN0ZW5lcigpO1xuICAgIH1cbiAgfTtcbiAgc3Vic2NyaXB0aW9uLm9uU3RhdGVDaGFuZ2UgPSBjaGVja0ZvclVwZGF0ZXM7XG4gIHN1YnNjcmlwdGlvbi50cnlTdWJzY3JpYmUoKTtcbiAgY2hlY2tGb3JVcGRhdGVzKCk7XG4gIGNvbnN0IHVuc3Vic2NyaWJlV3JhcHBlciA9ICgpID0+IHtcbiAgICBkaWRVbnN1YnNjcmliZSA9IHRydWU7XG4gICAgc3Vic2NyaXB0aW9uLnRyeVVuc3Vic2NyaWJlKCk7XG4gICAgc3Vic2NyaXB0aW9uLm9uU3RhdGVDaGFuZ2UgPSBudWxsO1xuICAgIGlmIChsYXN0VGhyb3duRXJyb3IpIHtcbiAgICAgIHRocm93IGxhc3RUaHJvd25FcnJvcjtcbiAgICB9XG4gIH07XG4gIHJldHVybiB1bnN1YnNjcmliZVdyYXBwZXI7XG59XG5mdW5jdGlvbiBzdHJpY3RFcXVhbChhLCBiKSB7XG4gIHJldHVybiBhID09PSBiO1xufVxudmFyIGhhc1dhcm5lZEFib3V0RGVwcmVjYXRlZFB1cmVPcHRpb24gPSBmYWxzZTtcbmZ1bmN0aW9uIGNvbm5lY3QobWFwU3RhdGVUb1Byb3BzLCBtYXBEaXNwYXRjaFRvUHJvcHMsIG1lcmdlUHJvcHMsIHtcbiAgLy8gVGhlIGBwdXJlYCBvcHRpb24gaGFzIGJlZW4gcmVtb3ZlZCwgc28gVFMgZG9lc24ndCBsaWtlIHVzIGRlc3RydWN0dXJpbmcgdGhpcyB0byBjaGVjayBpdHMgZXhpc3RlbmNlLlxuICAvLyBAdHMtaWdub3JlXG4gIHB1cmUsXG4gIGFyZVN0YXRlc0VxdWFsID0gc3RyaWN0RXF1YWwsXG4gIGFyZU93blByb3BzRXF1YWwgPSBzaGFsbG93RXF1YWwsXG4gIGFyZVN0YXRlUHJvcHNFcXVhbCA9IHNoYWxsb3dFcXVhbCxcbiAgYXJlTWVyZ2VkUHJvcHNFcXVhbCA9IHNoYWxsb3dFcXVhbCxcbiAgLy8gdXNlIFJlYWN0J3MgZm9yd2FyZFJlZiB0byBleHBvc2UgYSByZWYgb2YgdGhlIHdyYXBwZWQgY29tcG9uZW50XG4gIGZvcndhcmRSZWYgPSBmYWxzZSxcbiAgLy8gdGhlIGNvbnRleHQgY29uc3VtZXIgdG8gdXNlXG4gIGNvbnRleHQgPSBSZWFjdFJlZHV4Q29udGV4dFxufSA9IHt9KSB7XG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIpIHtcbiAgICBpZiAocHVyZSAhPT0gdm9pZCAwICYmICFoYXNXYXJuZWRBYm91dERlcHJlY2F0ZWRQdXJlT3B0aW9uKSB7XG4gICAgICBoYXNXYXJuZWRBYm91dERlcHJlY2F0ZWRQdXJlT3B0aW9uID0gdHJ1ZTtcbiAgICAgIHdhcm5pbmcoXG4gICAgICAgICdUaGUgYHB1cmVgIG9wdGlvbiBoYXMgYmVlbiByZW1vdmVkLiBgY29ubmVjdGAgaXMgbm93IGFsd2F5cyBhIFwicHVyZS9tZW1vaXplZFwiIGNvbXBvbmVudCdcbiAgICAgICk7XG4gICAgfVxuICB9XG4gIGNvbnN0IENvbnRleHQgPSBjb250ZXh0O1xuICBjb25zdCBpbml0TWFwU3RhdGVUb1Byb3BzID0gbWFwU3RhdGVUb1Byb3BzRmFjdG9yeShtYXBTdGF0ZVRvUHJvcHMpO1xuICBjb25zdCBpbml0TWFwRGlzcGF0Y2hUb1Byb3BzID0gbWFwRGlzcGF0Y2hUb1Byb3BzRmFjdG9yeShtYXBEaXNwYXRjaFRvUHJvcHMpO1xuICBjb25zdCBpbml0TWVyZ2VQcm9wcyA9IG1lcmdlUHJvcHNGYWN0b3J5KG1lcmdlUHJvcHMpO1xuICBjb25zdCBzaG91bGRIYW5kbGVTdGF0ZUNoYW5nZXMgPSBCb29sZWFuKG1hcFN0YXRlVG9Qcm9wcyk7XG4gIGNvbnN0IHdyYXBXaXRoQ29ubmVjdCA9IChXcmFwcGVkQ29tcG9uZW50KSA9PiB7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIikge1xuICAgICAgY29uc3QgaXNWYWxpZCA9IC8qIEBfX1BVUkVfXyAqLyBpc1ZhbGlkRWxlbWVudFR5cGUoV3JhcHBlZENvbXBvbmVudCk7XG4gICAgICBpZiAoIWlzVmFsaWQpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgWW91IG11c3QgcGFzcyBhIGNvbXBvbmVudCB0byB0aGUgZnVuY3Rpb24gcmV0dXJuZWQgYnkgY29ubmVjdC4gSW5zdGVhZCByZWNlaXZlZCAke3N0cmluZ2lmeUNvbXBvbmVudChcbiAgICAgICAgICAgIFdyYXBwZWRDb21wb25lbnRcbiAgICAgICAgICApfWBcbiAgICAgICAgKTtcbiAgICB9XG4gICAgY29uc3Qgd3JhcHBlZENvbXBvbmVudE5hbWUgPSBXcmFwcGVkQ29tcG9uZW50LmRpc3BsYXlOYW1lIHx8IFdyYXBwZWRDb21wb25lbnQubmFtZSB8fCBcIkNvbXBvbmVudFwiO1xuICAgIGNvbnN0IGRpc3BsYXlOYW1lID0gYENvbm5lY3QoJHt3cmFwcGVkQ29tcG9uZW50TmFtZX0pYDtcbiAgICBjb25zdCBzZWxlY3RvckZhY3RvcnlPcHRpb25zID0ge1xuICAgICAgc2hvdWxkSGFuZGxlU3RhdGVDaGFuZ2VzLFxuICAgICAgZGlzcGxheU5hbWUsXG4gICAgICB3cmFwcGVkQ29tcG9uZW50TmFtZSxcbiAgICAgIFdyYXBwZWRDb21wb25lbnQsXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBpbml0TWFwU3RhdGVUb1Byb3BzLFxuICAgICAgaW5pdE1hcERpc3BhdGNoVG9Qcm9wcyxcbiAgICAgIGluaXRNZXJnZVByb3BzLFxuICAgICAgYXJlU3RhdGVzRXF1YWwsXG4gICAgICBhcmVTdGF0ZVByb3BzRXF1YWwsXG4gICAgICBhcmVPd25Qcm9wc0VxdWFsLFxuICAgICAgYXJlTWVyZ2VkUHJvcHNFcXVhbFxuICAgIH07XG4gICAgZnVuY3Rpb24gQ29ubmVjdEZ1bmN0aW9uKHByb3BzKSB7XG4gICAgICBjb25zdCBbcHJvcHNDb250ZXh0LCByZWFjdFJlZHV4Rm9yd2FyZGVkUmVmLCB3cmFwcGVyUHJvcHNdID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgcmVhY3RSZWR1eEZvcndhcmRlZFJlZjogcmVhY3RSZWR1eEZvcndhcmRlZFJlZjIsIC4uLndyYXBwZXJQcm9wczIgfSA9IHByb3BzO1xuICAgICAgICByZXR1cm4gW3Byb3BzLmNvbnRleHQsIHJlYWN0UmVkdXhGb3J3YXJkZWRSZWYyLCB3cmFwcGVyUHJvcHMyXTtcbiAgICAgIH0sIFtwcm9wc10pO1xuICAgICAgY29uc3QgQ29udGV4dFRvVXNlID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGxldCBSZXN1bHRDb250ZXh0ID0gQ29udGV4dDtcbiAgICAgICAgaWYgKHByb3BzQ29udGV4dD8uQ29uc3VtZXIpIHtcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgICAgICAgICBjb25zdCBpc1ZhbGlkID0gLyogQF9fUFVSRV9fICovIGlzQ29udGV4dENvbnN1bWVyKFxuICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgIC8qIEBfX1BVUkVfXyAqLyBSZWFjdC5jcmVhdGVFbGVtZW50KHByb3BzQ29udGV4dC5Db25zdW1lciwgbnVsbClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIFwiWW91IG11c3QgcGFzcyBhIHZhbGlkIFJlYWN0IGNvbnRleHQgY29uc3VtZXIgYXMgYHByb3BzLmNvbnRleHRgXCJcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFJlc3VsdENvbnRleHQgPSBwcm9wc0NvbnRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBSZXN1bHRDb250ZXh0O1xuICAgICAgfSwgW3Byb3BzQ29udGV4dCwgQ29udGV4dF0pO1xuICAgICAgY29uc3QgY29udGV4dFZhbHVlID0gUmVhY3QudXNlQ29udGV4dChDb250ZXh0VG9Vc2UpO1xuICAgICAgY29uc3QgZGlkU3RvcmVDb21lRnJvbVByb3BzID0gQm9vbGVhbihwcm9wcy5zdG9yZSkgJiYgQm9vbGVhbihwcm9wcy5zdG9yZS5nZXRTdGF0ZSkgJiYgQm9vbGVhbihwcm9wcy5zdG9yZS5kaXNwYXRjaCk7XG4gICAgICBjb25zdCBkaWRTdG9yZUNvbWVGcm9tQ29udGV4dCA9IEJvb2xlYW4oY29udGV4dFZhbHVlKSAmJiBCb29sZWFuKGNvbnRleHRWYWx1ZS5zdG9yZSk7XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiICYmICFkaWRTdG9yZUNvbWVGcm9tUHJvcHMgJiYgIWRpZFN0b3JlQ29tZUZyb21Db250ZXh0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQ291bGQgbm90IGZpbmQgXCJzdG9yZVwiIGluIHRoZSBjb250ZXh0IG9mIFwiJHtkaXNwbGF5TmFtZX1cIi4gRWl0aGVyIHdyYXAgdGhlIHJvb3QgY29tcG9uZW50IGluIGEgPFByb3ZpZGVyPiwgb3IgcGFzcyBhIGN1c3RvbSBSZWFjdCBjb250ZXh0IHByb3ZpZGVyIHRvIDxQcm92aWRlcj4gYW5kIHRoZSBjb3JyZXNwb25kaW5nIFJlYWN0IGNvbnRleHQgY29uc3VtZXIgdG8gJHtkaXNwbGF5TmFtZX0gaW4gY29ubmVjdCBvcHRpb25zLmBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHN0b3JlID0gZGlkU3RvcmVDb21lRnJvbVByb3BzID8gcHJvcHMuc3RvcmUgOiBjb250ZXh0VmFsdWUuc3RvcmU7XG4gICAgICBjb25zdCBnZXRTZXJ2ZXJTdGF0ZSA9IGRpZFN0b3JlQ29tZUZyb21Db250ZXh0ID8gY29udGV4dFZhbHVlLmdldFNlcnZlclN0YXRlIDogc3RvcmUuZ2V0U3RhdGU7XG4gICAgICBjb25zdCBjaGlsZFByb3BzU2VsZWN0b3IgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIGZpbmFsUHJvcHNTZWxlY3RvckZhY3Rvcnkoc3RvcmUuZGlzcGF0Y2gsIHNlbGVjdG9yRmFjdG9yeU9wdGlvbnMpO1xuICAgICAgfSwgW3N0b3JlXSk7XG4gICAgICBjb25zdCBbc3Vic2NyaXB0aW9uLCBub3RpZnlOZXN0ZWRTdWJzXSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoIXNob3VsZEhhbmRsZVN0YXRlQ2hhbmdlcykgcmV0dXJuIE5PX1NVQlNDUklQVElPTl9BUlJBWTtcbiAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uMiA9IGNyZWF0ZVN1YnNjcmlwdGlvbihcbiAgICAgICAgICBzdG9yZSxcbiAgICAgICAgICBkaWRTdG9yZUNvbWVGcm9tUHJvcHMgPyB2b2lkIDAgOiBjb250ZXh0VmFsdWUuc3Vic2NyaXB0aW9uXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IG5vdGlmeU5lc3RlZFN1YnMyID0gc3Vic2NyaXB0aW9uMi5ub3RpZnlOZXN0ZWRTdWJzLmJpbmQoc3Vic2NyaXB0aW9uMik7XG4gICAgICAgIHJldHVybiBbc3Vic2NyaXB0aW9uMiwgbm90aWZ5TmVzdGVkU3ViczJdO1xuICAgICAgfSwgW3N0b3JlLCBkaWRTdG9yZUNvbWVGcm9tUHJvcHMsIGNvbnRleHRWYWx1ZV0pO1xuICAgICAgY29uc3Qgb3ZlcnJpZGRlbkNvbnRleHRWYWx1ZSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoZGlkU3RvcmVDb21lRnJvbVByb3BzKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnRleHRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmNvbnRleHRWYWx1ZSxcbiAgICAgICAgICBzdWJzY3JpcHRpb25cbiAgICAgICAgfTtcbiAgICAgIH0sIFtkaWRTdG9yZUNvbWVGcm9tUHJvcHMsIGNvbnRleHRWYWx1ZSwgc3Vic2NyaXB0aW9uXSk7XG4gICAgICBjb25zdCBsYXN0Q2hpbGRQcm9wcyA9IFJlYWN0LnVzZVJlZih2b2lkIDApO1xuICAgICAgY29uc3QgbGFzdFdyYXBwZXJQcm9wcyA9IFJlYWN0LnVzZVJlZih3cmFwcGVyUHJvcHMpO1xuICAgICAgY29uc3QgY2hpbGRQcm9wc0Zyb21TdG9yZVVwZGF0ZSA9IFJlYWN0LnVzZVJlZih2b2lkIDApO1xuICAgICAgY29uc3QgcmVuZGVySXNTY2hlZHVsZWQgPSBSZWFjdC51c2VSZWYoZmFsc2UpO1xuICAgICAgY29uc3QgaXNNb3VudGVkID0gUmVhY3QudXNlUmVmKGZhbHNlKTtcbiAgICAgIGNvbnN0IGxhdGVzdFN1YnNjcmlwdGlvbkNhbGxiYWNrRXJyb3IgPSBSZWFjdC51c2VSZWYoXG4gICAgICAgIHZvaWQgMFxuICAgICAgKTtcbiAgICAgIHVzZUlzb21vcnBoaWNMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpc01vdW50ZWQuY3VycmVudCA9IHRydWU7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgaXNNb3VudGVkLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgfTtcbiAgICAgIH0sIFtdKTtcbiAgICAgIGNvbnN0IGFjdHVhbENoaWxkUHJvcHNTZWxlY3RvciA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCBzZWxlY3RvciA9ICgpID0+IHtcbiAgICAgICAgICBpZiAoY2hpbGRQcm9wc0Zyb21TdG9yZVVwZGF0ZS5jdXJyZW50ICYmIHdyYXBwZXJQcm9wcyA9PT0gbGFzdFdyYXBwZXJQcm9wcy5jdXJyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gY2hpbGRQcm9wc0Zyb21TdG9yZVVwZGF0ZS5jdXJyZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gY2hpbGRQcm9wc1NlbGVjdG9yKHN0b3JlLmdldFN0YXRlKCksIHdyYXBwZXJQcm9wcyk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBzZWxlY3RvcjtcbiAgICAgIH0sIFtzdG9yZSwgd3JhcHBlclByb3BzXSk7XG4gICAgICBjb25zdCBzdWJzY3JpYmVGb3JSZWFjdCA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWJzY3JpYmUgPSAocmVhY3RMaXN0ZW5lcikgPT4ge1xuICAgICAgICAgIGlmICghc3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHN1YnNjcmliZVVwZGF0ZXMoXG4gICAgICAgICAgICBzaG91bGRIYW5kbGVTdGF0ZUNoYW5nZXMsXG4gICAgICAgICAgICBzdG9yZSxcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbixcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGNoaWxkUHJvcHNTZWxlY3RvcixcbiAgICAgICAgICAgIGxhc3RXcmFwcGVyUHJvcHMsXG4gICAgICAgICAgICBsYXN0Q2hpbGRQcm9wcyxcbiAgICAgICAgICAgIHJlbmRlcklzU2NoZWR1bGVkLFxuICAgICAgICAgICAgaXNNb3VudGVkLFxuICAgICAgICAgICAgY2hpbGRQcm9wc0Zyb21TdG9yZVVwZGF0ZSxcbiAgICAgICAgICAgIG5vdGlmeU5lc3RlZFN1YnMsXG4gICAgICAgICAgICByZWFjdExpc3RlbmVyXG4gICAgICAgICAgKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHN1YnNjcmliZTtcbiAgICAgIH0sIFtzdWJzY3JpcHRpb25dKTtcbiAgICAgIHVzZUlzb21vcnBoaWNMYXlvdXRFZmZlY3RXaXRoQXJncyhjYXB0dXJlV3JhcHBlclByb3BzLCBbXG4gICAgICAgIGxhc3RXcmFwcGVyUHJvcHMsXG4gICAgICAgIGxhc3RDaGlsZFByb3BzLFxuICAgICAgICByZW5kZXJJc1NjaGVkdWxlZCxcbiAgICAgICAgd3JhcHBlclByb3BzLFxuICAgICAgICBjaGlsZFByb3BzRnJvbVN0b3JlVXBkYXRlLFxuICAgICAgICBub3RpZnlOZXN0ZWRTdWJzXG4gICAgICBdKTtcbiAgICAgIGxldCBhY3R1YWxDaGlsZFByb3BzO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYWN0dWFsQ2hpbGRQcm9wcyA9IFJlYWN0LnVzZVN5bmNFeHRlcm5hbFN0b3JlKFxuICAgICAgICAgIC8vIFRPRE8gV2UncmUgcGFzc2luZyB0aHJvdWdoIGEgYmlnIHdyYXBwZXIgdGhhdCBkb2VzIGEgYnVuY2ggb2YgZXh0cmEgc2lkZSBlZmZlY3RzIGJlc2lkZXMgc3Vic2NyaWJpbmdcbiAgICAgICAgICBzdWJzY3JpYmVGb3JSZWFjdCxcbiAgICAgICAgICAvLyBUT0RPIFRoaXMgaXMgaW5jcmVkaWJseSBoYWNreS4gV2UndmUgYWxyZWFkeSBwcm9jZXNzZWQgdGhlIHN0b3JlIHVwZGF0ZSBhbmQgY2FsY3VsYXRlZCBuZXcgY2hpbGQgcHJvcHMsXG4gICAgICAgICAgLy8gVE9ETyBhbmQgd2UncmUganVzdCBwYXNzaW5nIHRoYXQgdGhyb3VnaCBzbyBpdCB0cmlnZ2VycyBhIHJlLXJlbmRlciBmb3IgdXMgcmF0aGVyIHRoYW4gcmVseWluZyBvbiBgdVNFU2AuXG4gICAgICAgICAgYWN0dWFsQ2hpbGRQcm9wc1NlbGVjdG9yLFxuICAgICAgICAgIGdldFNlcnZlclN0YXRlID8gKCkgPT4gY2hpbGRQcm9wc1NlbGVjdG9yKGdldFNlcnZlclN0YXRlKCksIHdyYXBwZXJQcm9wcykgOiBhY3R1YWxDaGlsZFByb3BzU2VsZWN0b3JcbiAgICAgICAgKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBpZiAobGF0ZXN0U3Vic2NyaXB0aW9uQ2FsbGJhY2tFcnJvci5jdXJyZW50KSB7XG4gICAgICAgICAgO1xuICAgICAgICAgIGVyci5tZXNzYWdlICs9IGBcblRoZSBlcnJvciBtYXkgYmUgY29ycmVsYXRlZCB3aXRoIHRoaXMgcHJldmlvdXMgZXJyb3I6XG4ke2xhdGVzdFN1YnNjcmlwdGlvbkNhbGxiYWNrRXJyb3IuY3VycmVudC5zdGFja31cblxuYDtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgICB1c2VJc29tb3JwaGljTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICAgICAgbGF0ZXN0U3Vic2NyaXB0aW9uQ2FsbGJhY2tFcnJvci5jdXJyZW50ID0gdm9pZCAwO1xuICAgICAgICBjaGlsZFByb3BzRnJvbVN0b3JlVXBkYXRlLmN1cnJlbnQgPSB2b2lkIDA7XG4gICAgICAgIGxhc3RDaGlsZFByb3BzLmN1cnJlbnQgPSBhY3R1YWxDaGlsZFByb3BzO1xuICAgICAgfSk7XG4gICAgICBjb25zdCByZW5kZXJlZFdyYXBwZWRDb21wb25lbnQgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgLyogQF9fUFVSRV9fICovIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICBXcmFwcGVkQ29tcG9uZW50LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAuLi5hY3R1YWxDaGlsZFByb3BzLFxuICAgICAgICAgICAgICByZWY6IHJlYWN0UmVkdXhGb3J3YXJkZWRSZWZcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9LCBbcmVhY3RSZWR1eEZvcndhcmRlZFJlZiwgV3JhcHBlZENvbXBvbmVudCwgYWN0dWFsQ2hpbGRQcm9wc10pO1xuICAgICAgY29uc3QgcmVuZGVyZWRDaGlsZCA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgICAgICBpZiAoc2hvdWxkSGFuZGxlU3RhdGVDaGFuZ2VzKSB7XG4gICAgICAgICAgcmV0dXJuIC8qIEBfX1BVUkVfXyAqLyBSZWFjdC5jcmVhdGVFbGVtZW50KENvbnRleHRUb1VzZS5Qcm92aWRlciwgeyB2YWx1ZTogb3ZlcnJpZGRlbkNvbnRleHRWYWx1ZSB9LCByZW5kZXJlZFdyYXBwZWRDb21wb25lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZW5kZXJlZFdyYXBwZWRDb21wb25lbnQ7XG4gICAgICB9LCBbQ29udGV4dFRvVXNlLCByZW5kZXJlZFdyYXBwZWRDb21wb25lbnQsIG92ZXJyaWRkZW5Db250ZXh0VmFsdWVdKTtcbiAgICAgIHJldHVybiByZW5kZXJlZENoaWxkO1xuICAgIH1cbiAgICBjb25zdCBfQ29ubmVjdCA9IFJlYWN0Lm1lbW8oQ29ubmVjdEZ1bmN0aW9uKTtcbiAgICBjb25zdCBDb25uZWN0ID0gX0Nvbm5lY3Q7XG4gICAgQ29ubmVjdC5XcmFwcGVkQ29tcG9uZW50ID0gV3JhcHBlZENvbXBvbmVudDtcbiAgICBDb25uZWN0LmRpc3BsYXlOYW1lID0gQ29ubmVjdEZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gZGlzcGxheU5hbWU7XG4gICAgaWYgKGZvcndhcmRSZWYpIHtcbiAgICAgIGNvbnN0IF9mb3J3YXJkZWQgPSBSZWFjdC5mb3J3YXJkUmVmKFxuICAgICAgICBmdW5jdGlvbiBmb3J3YXJkQ29ubmVjdFJlZihwcm9wcywgcmVmKSB7XG4gICAgICAgICAgcmV0dXJuIC8qIEBfX1BVUkVfXyAqLyBSZWFjdC5jcmVhdGVFbGVtZW50KENvbm5lY3QsIHsgLi4ucHJvcHMsIHJlYWN0UmVkdXhGb3J3YXJkZWRSZWY6IHJlZiB9KTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIGNvbnN0IGZvcndhcmRlZCA9IF9mb3J3YXJkZWQ7XG4gICAgICBmb3J3YXJkZWQuZGlzcGxheU5hbWUgPSBkaXNwbGF5TmFtZTtcbiAgICAgIGZvcndhcmRlZC5XcmFwcGVkQ29tcG9uZW50ID0gV3JhcHBlZENvbXBvbmVudDtcbiAgICAgIHJldHVybiAvKiBAX19QVVJFX18gKi8gaG9pc3ROb25SZWFjdFN0YXRpY3MoZm9yd2FyZGVkLCBXcmFwcGVkQ29tcG9uZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIC8qIEBfX1BVUkVfXyAqLyBob2lzdE5vblJlYWN0U3RhdGljcyhDb25uZWN0LCBXcmFwcGVkQ29tcG9uZW50KTtcbiAgfTtcbiAgcmV0dXJuIHdyYXBXaXRoQ29ubmVjdDtcbn1cbnZhciBjb25uZWN0X2RlZmF1bHQgPSBjb25uZWN0O1xuXG4vLyBzcmMvY29tcG9uZW50cy9Qcm92aWRlci50c3hcbmZ1bmN0aW9uIFByb3ZpZGVyKHByb3ZpZGVyUHJvcHMpIHtcbiAgY29uc3QgeyBjaGlsZHJlbiwgY29udGV4dCwgc2VydmVyU3RhdGUsIHN0b3JlIH0gPSBwcm92aWRlclByb3BzO1xuICBjb25zdCBjb250ZXh0VmFsdWUgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBjcmVhdGVTdWJzY3JpcHRpb24oc3RvcmUpO1xuICAgIGNvbnN0IGJhc2VDb250ZXh0VmFsdWUgPSB7XG4gICAgICBzdG9yZSxcbiAgICAgIHN1YnNjcmlwdGlvbixcbiAgICAgIGdldFNlcnZlclN0YXRlOiBzZXJ2ZXJTdGF0ZSA/ICgpID0+IHNlcnZlclN0YXRlIDogdm9pZCAwXG4gICAgfTtcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgICByZXR1cm4gYmFzZUNvbnRleHRWYWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgeyBpZGVudGl0eUZ1bmN0aW9uQ2hlY2sgPSBcIm9uY2VcIiwgc3RhYmlsaXR5Q2hlY2sgPSBcIm9uY2VcIiB9ID0gcHJvdmlkZXJQcm9wcztcbiAgICAgIHJldHVybiAvKiBAX19QVVJFX18gKi8gT2JqZWN0LmFzc2lnbihiYXNlQ29udGV4dFZhbHVlLCB7XG4gICAgICAgIHN0YWJpbGl0eUNoZWNrLFxuICAgICAgICBpZGVudGl0eUZ1bmN0aW9uQ2hlY2tcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwgW3N0b3JlLCBzZXJ2ZXJTdGF0ZV0pO1xuICBjb25zdCBwcmV2aW91c1N0YXRlID0gUmVhY3QudXNlTWVtbygoKSA9PiBzdG9yZS5nZXRTdGF0ZSgpLCBbc3RvcmVdKTtcbiAgdXNlSXNvbW9ycGhpY0xheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgeyBzdWJzY3JpcHRpb24gfSA9IGNvbnRleHRWYWx1ZTtcbiAgICBzdWJzY3JpcHRpb24ub25TdGF0ZUNoYW5nZSA9IHN1YnNjcmlwdGlvbi5ub3RpZnlOZXN0ZWRTdWJzO1xuICAgIHN1YnNjcmlwdGlvbi50cnlTdWJzY3JpYmUoKTtcbiAgICBpZiAocHJldmlvdXNTdGF0ZSAhPT0gc3RvcmUuZ2V0U3RhdGUoKSkge1xuICAgICAgc3Vic2NyaXB0aW9uLm5vdGlmeU5lc3RlZFN1YnMoKTtcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHN1YnNjcmlwdGlvbi50cnlVbnN1YnNjcmliZSgpO1xuICAgICAgc3Vic2NyaXB0aW9uLm9uU3RhdGVDaGFuZ2UgPSB2b2lkIDA7XG4gICAgfTtcbiAgfSwgW2NvbnRleHRWYWx1ZSwgcHJldmlvdXNTdGF0ZV0pO1xuICBjb25zdCBDb250ZXh0ID0gY29udGV4dCB8fCBSZWFjdFJlZHV4Q29udGV4dDtcbiAgcmV0dXJuIC8qIEBfX1BVUkVfXyAqLyBSZWFjdC5jcmVhdGVFbGVtZW50KENvbnRleHQuUHJvdmlkZXIsIHsgdmFsdWU6IGNvbnRleHRWYWx1ZSB9LCBjaGlsZHJlbik7XG59XG52YXIgUHJvdmlkZXJfZGVmYXVsdCA9IFByb3ZpZGVyO1xuXG4vLyBzcmMvaG9va3MvdXNlUmVkdXhDb250ZXh0LnRzXG5mdW5jdGlvbiBjcmVhdGVSZWR1eENvbnRleHRIb29rKGNvbnRleHQgPSBSZWFjdFJlZHV4Q29udGV4dCkge1xuICByZXR1cm4gZnVuY3Rpb24gdXNlUmVkdXhDb250ZXh0MigpIHtcbiAgICBjb25zdCBjb250ZXh0VmFsdWUgPSBSZWFjdC51c2VDb250ZXh0KGNvbnRleHQpO1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIgJiYgIWNvbnRleHRWYWx1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcImNvdWxkIG5vdCBmaW5kIHJlYWN0LXJlZHV4IGNvbnRleHQgdmFsdWU7IHBsZWFzZSBlbnN1cmUgdGhlIGNvbXBvbmVudCBpcyB3cmFwcGVkIGluIGEgPFByb3ZpZGVyPlwiXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gY29udGV4dFZhbHVlO1xuICB9O1xufVxudmFyIHVzZVJlZHV4Q29udGV4dCA9IC8qIEBfX1BVUkVfXyAqLyBjcmVhdGVSZWR1eENvbnRleHRIb29rKCk7XG5cbi8vIHNyYy9ob29rcy91c2VTdG9yZS50c1xuZnVuY3Rpb24gY3JlYXRlU3RvcmVIb29rKGNvbnRleHQgPSBSZWFjdFJlZHV4Q29udGV4dCkge1xuICBjb25zdCB1c2VSZWR1eENvbnRleHQyID0gY29udGV4dCA9PT0gUmVhY3RSZWR1eENvbnRleHQgPyB1c2VSZWR1eENvbnRleHQgOiAoXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGNyZWF0ZVJlZHV4Q29udGV4dEhvb2soY29udGV4dClcbiAgKTtcbiAgY29uc3QgdXNlU3RvcmUyID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgc3RvcmUgfSA9IHVzZVJlZHV4Q29udGV4dDIoKTtcbiAgICByZXR1cm4gc3RvcmU7XG4gIH07XG4gIE9iamVjdC5hc3NpZ24odXNlU3RvcmUyLCB7XG4gICAgd2l0aFR5cGVzOiAoKSA9PiB1c2VTdG9yZTJcbiAgfSk7XG4gIHJldHVybiB1c2VTdG9yZTI7XG59XG52YXIgdXNlU3RvcmUgPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlU3RvcmVIb29rKCk7XG5cbi8vIHNyYy9ob29rcy91c2VEaXNwYXRjaC50c1xuZnVuY3Rpb24gY3JlYXRlRGlzcGF0Y2hIb29rKGNvbnRleHQgPSBSZWFjdFJlZHV4Q29udGV4dCkge1xuICBjb25zdCB1c2VTdG9yZTIgPSBjb250ZXh0ID09PSBSZWFjdFJlZHV4Q29udGV4dCA/IHVzZVN0b3JlIDogY3JlYXRlU3RvcmVIb29rKGNvbnRleHQpO1xuICBjb25zdCB1c2VEaXNwYXRjaDIgPSAoKSA9PiB7XG4gICAgY29uc3Qgc3RvcmUgPSB1c2VTdG9yZTIoKTtcbiAgICByZXR1cm4gc3RvcmUuZGlzcGF0Y2g7XG4gIH07XG4gIE9iamVjdC5hc3NpZ24odXNlRGlzcGF0Y2gyLCB7XG4gICAgd2l0aFR5cGVzOiAoKSA9PiB1c2VEaXNwYXRjaDJcbiAgfSk7XG4gIHJldHVybiB1c2VEaXNwYXRjaDI7XG59XG52YXIgdXNlRGlzcGF0Y2ggPSAvKiBAX19QVVJFX18gKi8gY3JlYXRlRGlzcGF0Y2hIb29rKCk7XG5cbi8vIHNyYy9ob29rcy91c2VTZWxlY3Rvci50c1xuaW1wb3J0IHsgdXNlU3luY0V4dGVybmFsU3RvcmVXaXRoU2VsZWN0b3IgfSBmcm9tIFwidXNlLXN5bmMtZXh0ZXJuYWwtc3RvcmUvd2l0aC1zZWxlY3Rvci5qc1wiO1xudmFyIHJlZkVxdWFsaXR5ID0gKGEsIGIpID0+IGEgPT09IGI7XG5mdW5jdGlvbiBjcmVhdGVTZWxlY3Rvckhvb2soY29udGV4dCA9IFJlYWN0UmVkdXhDb250ZXh0KSB7XG4gIGNvbnN0IHVzZVJlZHV4Q29udGV4dDIgPSBjb250ZXh0ID09PSBSZWFjdFJlZHV4Q29udGV4dCA/IHVzZVJlZHV4Q29udGV4dCA6IGNyZWF0ZVJlZHV4Q29udGV4dEhvb2soY29udGV4dCk7XG4gIGNvbnN0IHVzZVNlbGVjdG9yMiA9IChzZWxlY3RvciwgZXF1YWxpdHlGbk9yT3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgY29uc3QgeyBlcXVhbGl0eUZuID0gcmVmRXF1YWxpdHkgfSA9IHR5cGVvZiBlcXVhbGl0eUZuT3JPcHRpb25zID09PSBcImZ1bmN0aW9uXCIgPyB7IGVxdWFsaXR5Rm46IGVxdWFsaXR5Rm5Pck9wdGlvbnMgfSA6IGVxdWFsaXR5Rm5Pck9wdGlvbnM7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIikge1xuICAgICAgaWYgKCFzZWxlY3Rvcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFlvdSBtdXN0IHBhc3MgYSBzZWxlY3RvciB0byB1c2VTZWxlY3RvcmApO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgWW91IG11c3QgcGFzcyBhIGZ1bmN0aW9uIGFzIGEgc2VsZWN0b3IgdG8gdXNlU2VsZWN0b3JgKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgZXF1YWxpdHlGbiAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgWW91IG11c3QgcGFzcyBhIGZ1bmN0aW9uIGFzIGFuIGVxdWFsaXR5IGZ1bmN0aW9uIHRvIHVzZVNlbGVjdG9yYFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZWR1eENvbnRleHQgPSB1c2VSZWR1eENvbnRleHQyKCk7XG4gICAgY29uc3QgeyBzdG9yZSwgc3Vic2NyaXB0aW9uLCBnZXRTZXJ2ZXJTdGF0ZSB9ID0gcmVkdXhDb250ZXh0O1xuICAgIGNvbnN0IGZpcnN0UnVuID0gUmVhY3QudXNlUmVmKHRydWUpO1xuICAgIGNvbnN0IHdyYXBwZWRTZWxlY3RvciA9IFJlYWN0LnVzZUNhbGxiYWNrKFxuICAgICAge1xuICAgICAgICBbc2VsZWN0b3IubmFtZV0oc3RhdGUpIHtcbiAgICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHNlbGVjdG9yKHN0YXRlKTtcbiAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSB7XG4gICAgICAgICAgICBjb25zdCB7IGRldk1vZGVDaGVja3MgPSB7fSB9ID0gdHlwZW9mIGVxdWFsaXR5Rm5Pck9wdGlvbnMgPT09IFwiZnVuY3Rpb25cIiA/IHt9IDogZXF1YWxpdHlGbk9yT3B0aW9ucztcbiAgICAgICAgICAgIGNvbnN0IHsgaWRlbnRpdHlGdW5jdGlvbkNoZWNrLCBzdGFiaWxpdHlDaGVjayB9ID0gcmVkdXhDb250ZXh0O1xuICAgICAgICAgICAgY29uc3Qge1xuICAgICAgICAgICAgICBpZGVudGl0eUZ1bmN0aW9uQ2hlY2s6IGZpbmFsSWRlbnRpdHlGdW5jdGlvbkNoZWNrLFxuICAgICAgICAgICAgICBzdGFiaWxpdHlDaGVjazogZmluYWxTdGFiaWxpdHlDaGVja1xuICAgICAgICAgICAgfSA9IHtcbiAgICAgICAgICAgICAgc3RhYmlsaXR5Q2hlY2ssXG4gICAgICAgICAgICAgIGlkZW50aXR5RnVuY3Rpb25DaGVjayxcbiAgICAgICAgICAgICAgLi4uZGV2TW9kZUNoZWNrc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChmaW5hbFN0YWJpbGl0eUNoZWNrID09PSBcImFsd2F5c1wiIHx8IGZpbmFsU3RhYmlsaXR5Q2hlY2sgPT09IFwib25jZVwiICYmIGZpcnN0UnVuLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgY29uc3QgdG9Db21wYXJlID0gc2VsZWN0b3Ioc3RhdGUpO1xuICAgICAgICAgICAgICBpZiAoIWVxdWFsaXR5Rm4oc2VsZWN0ZWQsIHRvQ29tcGFyZSkpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3RhY2sgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAgICh7IHN0YWNrIH0gPSBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgXCJTZWxlY3RvciBcIiArIChzZWxlY3Rvci5uYW1lIHx8IFwidW5rbm93blwiKSArIFwiIHJldHVybmVkIGEgZGlmZmVyZW50IHJlc3VsdCB3aGVuIGNhbGxlZCB3aXRoIHRoZSBzYW1lIHBhcmFtZXRlcnMuIFRoaXMgY2FuIGxlYWQgdG8gdW5uZWNlc3NhcnkgcmVyZW5kZXJzLlxcblNlbGVjdG9ycyB0aGF0IHJldHVybiBhIG5ldyByZWZlcmVuY2UgKHN1Y2ggYXMgYW4gb2JqZWN0IG9yIGFuIGFycmF5KSBzaG91bGQgYmUgbWVtb2l6ZWQ6IGh0dHBzOi8vcmVkdXguanMub3JnL3VzYWdlL2Rlcml2aW5nLWRhdGEtc2VsZWN0b3JzI29wdGltaXppbmctc2VsZWN0b3JzLXdpdGgtbWVtb2l6YXRpb25cIixcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUsXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkLFxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZDI6IHRvQ29tcGFyZSxcbiAgICAgICAgICAgICAgICAgICAgc3RhY2tcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZmluYWxJZGVudGl0eUZ1bmN0aW9uQ2hlY2sgPT09IFwiYWx3YXlzXCIgfHwgZmluYWxJZGVudGl0eUZ1bmN0aW9uQ2hlY2sgPT09IFwib25jZVwiICYmIGZpcnN0UnVuLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkID09PSBzdGF0ZSkge1xuICAgICAgICAgICAgICAgIGxldCBzdGFjayA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgICAgKHsgc3RhY2sgfSA9IGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICBcIlNlbGVjdG9yIFwiICsgKHNlbGVjdG9yLm5hbWUgfHwgXCJ1bmtub3duXCIpICsgXCIgcmV0dXJuZWQgdGhlIHJvb3Qgc3RhdGUgd2hlbiBjYWxsZWQuIFRoaXMgY2FuIGxlYWQgdG8gdW5uZWNlc3NhcnkgcmVyZW5kZXJzLlxcblNlbGVjdG9ycyB0aGF0IHJldHVybiB0aGUgZW50aXJlIHN0YXRlIGFyZSBhbG1vc3QgY2VydGFpbmx5IGEgbWlzdGFrZSwgYXMgdGhleSB3aWxsIGNhdXNlIGEgcmVyZW5kZXIgd2hlbmV2ZXIgKmFueXRoaW5nKiBpbiBzdGF0ZSBjaGFuZ2VzLlwiLFxuICAgICAgICAgICAgICAgICAgeyBzdGFjayB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZpcnN0UnVuLmN1cnJlbnQpIGZpcnN0UnVuLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHNlbGVjdGVkO1xuICAgICAgICB9XG4gICAgICB9W3NlbGVjdG9yLm5hbWVdLFxuICAgICAgW3NlbGVjdG9yXVxuICAgICk7XG4gICAgY29uc3Qgc2VsZWN0ZWRTdGF0ZSA9IHVzZVN5bmNFeHRlcm5hbFN0b3JlV2l0aFNlbGVjdG9yKFxuICAgICAgc3Vic2NyaXB0aW9uLmFkZE5lc3RlZFN1YixcbiAgICAgIHN0b3JlLmdldFN0YXRlLFxuICAgICAgZ2V0U2VydmVyU3RhdGUgfHwgc3RvcmUuZ2V0U3RhdGUsXG4gICAgICB3cmFwcGVkU2VsZWN0b3IsXG4gICAgICBlcXVhbGl0eUZuXG4gICAgKTtcbiAgICBSZWFjdC51c2VEZWJ1Z1ZhbHVlKHNlbGVjdGVkU3RhdGUpO1xuICAgIHJldHVybiBzZWxlY3RlZFN0YXRlO1xuICB9O1xuICBPYmplY3QuYXNzaWduKHVzZVNlbGVjdG9yMiwge1xuICAgIHdpdGhUeXBlczogKCkgPT4gdXNlU2VsZWN0b3IyXG4gIH0pO1xuICByZXR1cm4gdXNlU2VsZWN0b3IyO1xufVxudmFyIHVzZVNlbGVjdG9yID0gLyogQF9fUFVSRV9fICovIGNyZWF0ZVNlbGVjdG9ySG9vaygpO1xuXG4vLyBzcmMvZXhwb3J0cy50c1xudmFyIGJhdGNoID0gZGVmYXVsdE5vb3BCYXRjaDtcbmV4cG9ydCB7XG4gIFByb3ZpZGVyX2RlZmF1bHQgYXMgUHJvdmlkZXIsXG4gIFJlYWN0UmVkdXhDb250ZXh0LFxuICBiYXRjaCxcbiAgY29ubmVjdF9kZWZhdWx0IGFzIGNvbm5lY3QsXG4gIGNyZWF0ZURpc3BhdGNoSG9vayxcbiAgY3JlYXRlU2VsZWN0b3JIb29rLFxuICBjcmVhdGVTdG9yZUhvb2ssXG4gIHNoYWxsb3dFcXVhbCxcbiAgdXNlRGlzcGF0Y2gsXG4gIHVzZVNlbGVjdG9yLFxuICB1c2VTdG9yZVxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlYWN0LXJlZHV4Lm1qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=