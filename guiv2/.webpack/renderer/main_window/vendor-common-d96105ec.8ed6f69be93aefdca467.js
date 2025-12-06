(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[9793],{

/***/ 27575:
/***/ ((__unused_webpack___webpack_module__, __unused_webpack___webpack_exports__, __webpack_require__) => {

"use strict";

// UNUSED EXPORTS: SSRProvider, useIsSSR, useSSRSafeId

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./node_modules/@react-aria/ssr/dist/SSRProvider.mjs


/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ // We must avoid a circular dependency with @react-aria/utils, and this useLayoutEffect is
// guarded by a check that it only runs on the client side.
// eslint-disable-next-line rulesdir/useLayoutEffectRule

// Default context value to use in case there is no SSRProvider. This is fine for
// client-only apps. In order to support multiple copies of React Aria potentially
// being on the page at once, the prefix is set to a random number. SSRProvider
// will reset this to zero for consistency between server and client, so in the
// SSR case multiple copies of React Aria is not supported.
const $b5e257d569688ac6$var$defaultContext = {
    prefix: String(Math.round(Math.random() * 10000000000)),
    current: 0
};
const $b5e257d569688ac6$var$SSRContext = /*#__PURE__*/ (0, react).createContext($b5e257d569688ac6$var$defaultContext);
const $b5e257d569688ac6$var$IsSSRContext = /*#__PURE__*/ (0, react).createContext(false);
// This is only used in React < 18.
function $b5e257d569688ac6$var$LegacySSRProvider(props) {
    let cur = (0, $670gB$useContext)($b5e257d569688ac6$var$SSRContext);
    let counter = $b5e257d569688ac6$var$useCounter(cur === $b5e257d569688ac6$var$defaultContext);
    let [isSSR, setIsSSR] = (0, $670gB$useState)(true);
    let value = (0, $670gB$useMemo)(()=>({
            // If this is the first SSRProvider, start with an empty string prefix, otherwise
            // append and increment the counter.
            prefix: cur === $b5e257d569688ac6$var$defaultContext ? '' : `${cur.prefix}-${counter}`,
            current: 0
        }), [
        cur,
        counter
    ]);
    // If on the client, and the component was initially server rendered,
    // then schedule a layout effect to update the component after hydration.
    if (typeof document !== 'undefined') // This if statement technically breaks the rules of hooks, but is safe
    // because the condition never changes after mounting.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (0, $670gB$useLayoutEffect)(()=>{
        setIsSSR(false);
    }, []);
    return /*#__PURE__*/ (0, $670gB$react).createElement($b5e257d569688ac6$var$SSRContext.Provider, {
        value: value
    }, /*#__PURE__*/ (0, $670gB$react).createElement($b5e257d569688ac6$var$IsSSRContext.Provider, {
        value: isSSR
    }, props.children));
}
let $b5e257d569688ac6$var$warnedAboutSSRProvider = false;
function $b5e257d569688ac6$export$9f8ac96af4b1b2ae(props) {
    if (typeof (0, $670gB$react)['useId'] === 'function') {
        if ( true && !$b5e257d569688ac6$var$warnedAboutSSRProvider) {
            console.warn('In React 18, SSRProvider is not necessary and is a noop. You can remove it from your app.');
            $b5e257d569688ac6$var$warnedAboutSSRProvider = true;
        }
        return /*#__PURE__*/ (0, $670gB$react).createElement((0, $670gB$react).Fragment, null, props.children);
    }
    return /*#__PURE__*/ (0, $670gB$react).createElement($b5e257d569688ac6$var$LegacySSRProvider, props);
}
let $b5e257d569688ac6$var$canUseDOM = Boolean(typeof window !== 'undefined' && window.document && window.document.createElement);
let $b5e257d569688ac6$var$componentIds = new WeakMap();
function $b5e257d569688ac6$var$useCounter(isDisabled = false) {
    let ctx = (0, react.useContext)($b5e257d569688ac6$var$SSRContext);
    let ref = (0, react.useRef)(null);
    // eslint-disable-next-line rulesdir/pure-render
    if (ref.current === null && !isDisabled) {
        var _React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_ReactCurrentOwner, _React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        // In strict mode, React renders components twice, and the ref will be reset to null on the second render.
        // This means our id counter will be incremented twice instead of once. This is a problem because on the
        // server, components are only rendered once and so ids generated on the server won't match the client.
        // In React 18, useId was introduced to solve this, but it is not available in older versions. So to solve this
        // we need to use some React internals to access the underlying Fiber instance, which is stable between renders.
        // This is exposed as ReactCurrentOwner in development, which is all we need since StrictMode only runs in development.
        // To ensure that we only increment the global counter once, we store the starting id for this component in
        // a weak map associated with the Fiber. On the second render, we reset the global counter to this value.
        // Since React runs the second render immediately after the first, this is safe.
        // @ts-ignore
        let currentOwner = (_React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = (0, react).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) === null || _React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED === void 0 ? void 0 : (_React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_ReactCurrentOwner = _React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner) === null || _React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_ReactCurrentOwner === void 0 ? void 0 : _React___SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_ReactCurrentOwner.current;
        if (currentOwner) {
            let prevComponentValue = $b5e257d569688ac6$var$componentIds.get(currentOwner);
            if (prevComponentValue == null) // On the first render, and first call to useId, store the id and state in our weak map.
            $b5e257d569688ac6$var$componentIds.set(currentOwner, {
                id: ctx.current,
                state: currentOwner.memoizedState
            });
            else if (currentOwner.memoizedState !== prevComponentValue.state) {
                // On the second render, the memoizedState gets reset by React.
                // Reset the counter, and remove from the weak map so we don't
                // do this for subsequent useId calls.
                ctx.current = prevComponentValue.id;
                $b5e257d569688ac6$var$componentIds.delete(currentOwner);
            }
        }
        // eslint-disable-next-line rulesdir/pure-render
        ref.current = ++ctx.current;
    }
    // eslint-disable-next-line rulesdir/pure-render
    return ref.current;
}
function $b5e257d569688ac6$var$useLegacySSRSafeId(defaultId) {
    let ctx = (0, react.useContext)($b5e257d569688ac6$var$SSRContext);
    // If we are rendering in a non-DOM environment, and there's no SSRProvider,
    // provide a warning to hint to the developer to add one.
    if (ctx === $b5e257d569688ac6$var$defaultContext && !$b5e257d569688ac6$var$canUseDOM && "development" !== 'production') console.warn('When server rendering, you must wrap your application in an <SSRProvider> to ensure consistent ids are generated between the client and server.');
    let counter = $b5e257d569688ac6$var$useCounter(!!defaultId);
    let prefix = ctx === $b5e257d569688ac6$var$defaultContext && "development" === 'test' ? 0 : `react-aria${ctx.prefix}`;
    return defaultId || `${prefix}-${counter}`;
}
function $b5e257d569688ac6$var$useModernSSRSafeId(defaultId) {
    let id = (0, react).useId();
    let [didSSR] = (0, react.useState)($b5e257d569688ac6$export$535bd6ca7f90a273());
    let prefix = didSSR || "development" === 'test' ? 'react-aria' : `react-aria${$b5e257d569688ac6$var$defaultContext.prefix}`;
    return defaultId || `${prefix}-${id}`;
}
const $b5e257d569688ac6$export$619500959fc48b26 = typeof (0, react)['useId'] === 'function' ? $b5e257d569688ac6$var$useModernSSRSafeId : $b5e257d569688ac6$var$useLegacySSRSafeId;
function $b5e257d569688ac6$var$getSnapshot() {
    return false;
}
function $b5e257d569688ac6$var$getServerSnapshot() {
    return true;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function $b5e257d569688ac6$var$subscribe(onStoreChange) {
    // noop
    return ()=>{};
}
function $b5e257d569688ac6$export$535bd6ca7f90a273() {
    // In React 18, we can use useSyncExternalStore to detect if we're server rendering or hydrating.
    if (typeof (0, react)['useSyncExternalStore'] === 'function') return (0, react)['useSyncExternalStore']($b5e257d569688ac6$var$subscribe, $b5e257d569688ac6$var$getSnapshot, $b5e257d569688ac6$var$getServerSnapshot);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return (0, react.useContext)($b5e257d569688ac6$var$IsSSRContext);
}



//# sourceMappingURL=SSRProvider.module.js.map

;// ./node_modules/@react-aria/ssr/dist/import.mjs


/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 



//# sourceMappingURL=module.js.map


/***/ }),

/***/ 46733:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  pP: () => (/* reexport */ $507fabe10e71c6fb$export$b9b3dfddab17db27),
  iQ: () => (/* reexport */ useFocus_$a1ea59d68270f0dd$export$f8168d8dd8fd66e6),
  K7: () => (/* reexport */ $507fabe10e71c6fb$export$ec71b4b83ac08ec3),
  Rb: () => (/* reexport */ $9ab94262bd0047c7$export$420e68273165f4ec),
  Mk: () => (/* reexport */ $6179b936705e76d3$export$ae780daf29e6d456)
});

// UNUSED EXPORTS: ClearPressResponder, Focusable, FocusableContext, FocusableProvider, PressResponder, Pressable, addWindowFocusTracking, focusSafely, getInteractionModality, setInteractionModality, useFocusVisible, useFocusable, useInteractOutside, useInteractionModality, useKeyboard, useLongPress, useMove, usePress, useScrollWheel

// EXTERNAL MODULE: ./node_modules/@react-aria/utils/dist/import.mjs + 42 modules
var dist_import = __webpack_require__(64057);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./node_modules/@react-aria/interactions/dist/utils.mjs



/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 

function utils_$8a9cb279dc87e130$export$525bc4921d56d4a(nativeEvent) {
    let event = nativeEvent;
    event.nativeEvent = nativeEvent;
    event.isDefaultPrevented = ()=>event.defaultPrevented;
    // cancelBubble is technically deprecated in the spec, but still supported in all browsers.
    event.isPropagationStopped = ()=>event.cancelBubble;
    event.persist = ()=>{};
    return event;
}
function utils_$8a9cb279dc87e130$export$c2b7abe5d61ec696(event, target) {
    Object.defineProperty(event, 'target', {
        value: target
    });
    Object.defineProperty(event, 'currentTarget', {
        value: target
    });
}
function $8a9cb279dc87e130$export$715c682d09d639cc(onBlur) {
    let stateRef = (0, react.useRef)({
        isFocused: false,
        observer: null
    });
    // Clean up MutationObserver on unmount. See below.
    (0, dist_import/* useLayoutEffect */.Nf)(()=>{
        const state = stateRef.current;
        return ()=>{
            if (state.observer) {
                state.observer.disconnect();
                state.observer = null;
            }
        };
    }, []);
    let dispatchBlur = (0, dist_import/* useEffectEvent */.Jt)((e)=>{
        onBlur === null || onBlur === void 0 ? void 0 : onBlur(e);
    });
    // This function is called during a React onFocus event.
    return (0, react.useCallback)((e)=>{
        // React does not fire onBlur when an element is disabled. https://github.com/facebook/react/issues/9142
        // Most browsers fire a native focusout event in this case, except for Firefox. In that case, we use a
        // MutationObserver to watch for the disabled attribute, and dispatch these events ourselves.
        // For browsers that do, focusout fires before the MutationObserver, so onBlur should not fire twice.
        if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
            stateRef.current.isFocused = true;
            let target = e.target;
            let onBlurHandler = (e)=>{
                stateRef.current.isFocused = false;
                if (target.disabled) {
                    // For backward compatibility, dispatch a (fake) React synthetic event.
                    let event = utils_$8a9cb279dc87e130$export$525bc4921d56d4a(e);
                    dispatchBlur(event);
                }
                // We no longer need the MutationObserver once the target is blurred.
                if (stateRef.current.observer) {
                    stateRef.current.observer.disconnect();
                    stateRef.current.observer = null;
                }
            };
            target.addEventListener('focusout', onBlurHandler, {
                once: true
            });
            stateRef.current.observer = new MutationObserver(()=>{
                if (stateRef.current.isFocused && target.disabled) {
                    var _stateRef_current_observer;
                    (_stateRef_current_observer = stateRef.current.observer) === null || _stateRef_current_observer === void 0 ? void 0 : _stateRef_current_observer.disconnect();
                    let relatedTargetEl = target === document.activeElement ? null : document.activeElement;
                    target.dispatchEvent(new FocusEvent('blur', {
                        relatedTarget: relatedTargetEl
                    }));
                    target.dispatchEvent(new FocusEvent('focusout', {
                        bubbles: true,
                        relatedTarget: relatedTargetEl
                    }));
                }
            });
            stateRef.current.observer.observe(target, {
                attributes: true,
                attributeFilter: [
                    'disabled'
                ]
            });
        }
    }, [
        dispatchBlur
    ]);
}
let $8a9cb279dc87e130$export$fda7da73ab5d4c48 = false;
function utils_$8a9cb279dc87e130$export$cabe61c495ee3649(target) {
    // The browser will focus the nearest focusable ancestor of our target.
    while(target && !(0, $6dfIe$isFocusable)(target))target = target.parentElement;
    let window = (0, $6dfIe$getOwnerWindow)(target);
    let activeElement = window.document.activeElement;
    if (!activeElement || activeElement === target) return;
    $8a9cb279dc87e130$export$fda7da73ab5d4c48 = true;
    let isRefocusing = false;
    let onBlur = (e)=>{
        if (e.target === activeElement || isRefocusing) e.stopImmediatePropagation();
    };
    let onFocusOut = (e)=>{
        if (e.target === activeElement || isRefocusing) {
            e.stopImmediatePropagation();
            // If there was no focusable ancestor, we don't expect a focus event.
            // Re-focus the original active element here.
            if (!target && !isRefocusing) {
                isRefocusing = true;
                (0, $6dfIe$focusWithoutScrolling)(activeElement);
                cleanup();
            }
        }
    };
    let onFocus = (e)=>{
        if (e.target === target || isRefocusing) e.stopImmediatePropagation();
    };
    let onFocusIn = (e)=>{
        if (e.target === target || isRefocusing) {
            e.stopImmediatePropagation();
            if (!isRefocusing) {
                isRefocusing = true;
                (0, $6dfIe$focusWithoutScrolling)(activeElement);
                cleanup();
            }
        }
    };
    window.addEventListener('blur', onBlur, true);
    window.addEventListener('focusout', onFocusOut, true);
    window.addEventListener('focusin', onFocusIn, true);
    window.addEventListener('focus', onFocus, true);
    let cleanup = ()=>{
        cancelAnimationFrame(raf);
        window.removeEventListener('blur', onBlur, true);
        window.removeEventListener('focusout', onFocusOut, true);
        window.removeEventListener('focusin', onFocusIn, true);
        window.removeEventListener('focus', onFocus, true);
        $8a9cb279dc87e130$export$fda7da73ab5d4c48 = false;
        isRefocusing = false;
    };
    let raf = requestAnimationFrame(cleanup);
    return cleanup;
}



//# sourceMappingURL=utils.module.js.map

;// ./node_modules/@react-aria/interactions/dist/textSelection.mjs


/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 
// Note that state only matters here for iOS. Non-iOS gets user-select: none applied to the target element
// rather than at the document level so we just need to apply/remove user-select: none for each pressed element individually
let $14c0b72509d70225$var$state = 'default';
let $14c0b72509d70225$var$savedUserSelect = '';
let $14c0b72509d70225$var$modifiedElementMap = new WeakMap();
function textSelection_$14c0b72509d70225$export$16a4697467175487(target) {
    if ((0, $7R18e$isIOS)()) {
        if ($14c0b72509d70225$var$state === 'default') {
            const documentObject = (0, $7R18e$getOwnerDocument)(target);
            $14c0b72509d70225$var$savedUserSelect = documentObject.documentElement.style.webkitUserSelect;
            documentObject.documentElement.style.webkitUserSelect = 'none';
        }
        $14c0b72509d70225$var$state = 'disabled';
    } else if (target instanceof HTMLElement || target instanceof SVGElement) {
        // If not iOS, store the target's original user-select and change to user-select: none
        // Ignore state since it doesn't apply for non iOS
        let property = 'userSelect' in target.style ? 'userSelect' : 'webkitUserSelect';
        $14c0b72509d70225$var$modifiedElementMap.set(target, target.style[property]);
        target.style[property] = 'none';
    }
}
function textSelection_$14c0b72509d70225$export$b0d6fa1ab32e3295(target) {
    if ((0, $7R18e$isIOS)()) {
        // If the state is already default, there's nothing to do.
        // If it is restoring, then there's no need to queue a second restore.
        if ($14c0b72509d70225$var$state !== 'disabled') return;
        $14c0b72509d70225$var$state = 'restoring';
        // There appears to be a delay on iOS where selection still might occur
        // after pointer up, so wait a bit before removing user-select.
        setTimeout(()=>{
            // Wait for any CSS transitions to complete so we don't recompute style
            // for the whole page in the middle of the animation and cause jank.
            (0, $7R18e$runAfterTransition)(()=>{
                // Avoid race conditions
                if ($14c0b72509d70225$var$state === 'restoring') {
                    const documentObject = (0, $7R18e$getOwnerDocument)(target);
                    if (documentObject.documentElement.style.webkitUserSelect === 'none') documentObject.documentElement.style.webkitUserSelect = $14c0b72509d70225$var$savedUserSelect || '';
                    $14c0b72509d70225$var$savedUserSelect = '';
                    $14c0b72509d70225$var$state = 'default';
                }
            });
        }, 300);
    } else if (target instanceof HTMLElement || target instanceof SVGElement) // If not iOS, restore the target's original user-select if any
    // Ignore state since it doesn't apply for non iOS
    {
        if (target && $14c0b72509d70225$var$modifiedElementMap.has(target)) {
            let targetOldUserSelect = $14c0b72509d70225$var$modifiedElementMap.get(target);
            let property = 'userSelect' in target.style ? 'userSelect' : 'webkitUserSelect';
            if (target.style[property] === 'none') target.style[property] = targetOldUserSelect;
            if (target.getAttribute('style') === '') target.removeAttribute('style');
            $14c0b72509d70225$var$modifiedElementMap.delete(target);
        }
    }
}



//# sourceMappingURL=textSelection.module.js.map

;// ./node_modules/@react-aria/interactions/dist/context.mjs


/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 
const context_$ae1eeba8b9eafd08$export$5165eccb35aaadb5 = (0, react).createContext({
    register: ()=>{}
});
context_$ae1eeba8b9eafd08$export$5165eccb35aaadb5.displayName = 'PressResponderContext';



//# sourceMappingURL=context.module.js.map

// EXTERNAL MODULE: ./node_modules/@swc/helpers/esm/_class_private_field_get.js + 1 modules
var _class_private_field_get = __webpack_require__(63711);
// EXTERNAL MODULE: ./node_modules/@swc/helpers/esm/_class_private_field_init.js + 1 modules
var _class_private_field_init = __webpack_require__(50501);
// EXTERNAL MODULE: ./node_modules/@swc/helpers/esm/_class_private_field_set.js + 1 modules
var _class_private_field_set = __webpack_require__(82923);
// EXTERNAL MODULE: ./node_modules/react-dom/index.js
var react_dom = __webpack_require__(40961);
;// ./node_modules/@react-aria/interactions/dist/usePress.mjs










/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ // Portions of the code in this file are based on code from react.
// Original licensing for the following can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/facebook/react/tree/cc7c1aece46a6b69b41958d731e0fd27c94bfc6c/packages/react-interactions









function $f6c31cce2adf654f$var$usePressResponderContext(props) {
    // Consume context from <PressResponder> and merge with props.
    let context = (0, $7mdmh$useContext)((0, $ae1eeba8b9eafd08$export$5165eccb35aaadb5));
    if (context) {
        let { register: register, ...contextProps } = context;
        props = (0, $7mdmh$mergeProps)(contextProps, props);
        register();
    }
    (0, $7mdmh$useSyncRef)(context, props.ref);
    return props;
}
var $f6c31cce2adf654f$var$_shouldStopPropagation = /*#__PURE__*/ new WeakMap();
class $f6c31cce2adf654f$var$PressEvent {
    continuePropagation() {
        (0, $7mdmh$_2)(this, $f6c31cce2adf654f$var$_shouldStopPropagation, false);
    }
    get shouldStopPropagation() {
        return (0, $7mdmh$_)(this, $f6c31cce2adf654f$var$_shouldStopPropagation);
    }
    constructor(type, pointerType, originalEvent, state){
        (0, $7mdmh$_1)(this, $f6c31cce2adf654f$var$_shouldStopPropagation, {
            writable: true,
            value: void 0
        });
        (0, $7mdmh$_2)(this, $f6c31cce2adf654f$var$_shouldStopPropagation, true);
        var _state_target;
        let currentTarget = (_state_target = state === null || state === void 0 ? void 0 : state.target) !== null && _state_target !== void 0 ? _state_target : originalEvent.currentTarget;
        const rect = currentTarget === null || currentTarget === void 0 ? void 0 : currentTarget.getBoundingClientRect();
        let x, y = 0;
        let clientX, clientY = null;
        if (originalEvent.clientX != null && originalEvent.clientY != null) {
            clientX = originalEvent.clientX;
            clientY = originalEvent.clientY;
        }
        if (rect) {
            if (clientX != null && clientY != null) {
                x = clientX - rect.left;
                y = clientY - rect.top;
            } else {
                x = rect.width / 2;
                y = rect.height / 2;
            }
        }
        this.type = type;
        this.pointerType = pointerType;
        this.target = originalEvent.currentTarget;
        this.shiftKey = originalEvent.shiftKey;
        this.metaKey = originalEvent.metaKey;
        this.ctrlKey = originalEvent.ctrlKey;
        this.altKey = originalEvent.altKey;
        this.x = x;
        this.y = y;
    }
}
const $f6c31cce2adf654f$var$LINK_CLICKED = Symbol('linkClicked');
const $f6c31cce2adf654f$var$STYLE_ID = 'react-aria-pressable-style';
const $f6c31cce2adf654f$var$PRESSABLE_ATTRIBUTE = 'data-react-aria-pressable';
function usePress_$f6c31cce2adf654f$export$45712eceda6fad21(props) {
    let { onPress: onPress, onPressChange: onPressChange, onPressStart: onPressStart, onPressEnd: onPressEnd, onPressUp: onPressUp, onClick: onClick, isDisabled: isDisabled, isPressed: isPressedProp, preventFocusOnPress: preventFocusOnPress, shouldCancelOnPointerExit: shouldCancelOnPointerExit, allowTextSelectionOnPress: allowTextSelectionOnPress, ref: domRef, ...domProps } = $f6c31cce2adf654f$var$usePressResponderContext(props);
    let [isPressed, setPressed] = (0, $7mdmh$useState)(false);
    let ref = (0, $7mdmh$useRef)({
        isPressed: false,
        ignoreEmulatedMouseEvents: false,
        didFirePressStart: false,
        isTriggeringEvent: false,
        activePointerId: null,
        target: null,
        isOverTarget: false,
        pointerType: null,
        disposables: []
    });
    let { addGlobalListener: addGlobalListener, removeAllGlobalListeners: removeAllGlobalListeners } = (0, $7mdmh$useGlobalListeners)();
    let triggerPressStart = (0, $7mdmh$useEffectEvent)((originalEvent, pointerType)=>{
        let state = ref.current;
        if (isDisabled || state.didFirePressStart) return false;
        let shouldStopPropagation = true;
        state.isTriggeringEvent = true;
        if (onPressStart) {
            let event = new $f6c31cce2adf654f$var$PressEvent('pressstart', pointerType, originalEvent);
            onPressStart(event);
            shouldStopPropagation = event.shouldStopPropagation;
        }
        if (onPressChange) onPressChange(true);
        state.isTriggeringEvent = false;
        state.didFirePressStart = true;
        setPressed(true);
        return shouldStopPropagation;
    });
    let triggerPressEnd = (0, $7mdmh$useEffectEvent)((originalEvent, pointerType, wasPressed = true)=>{
        let state = ref.current;
        if (!state.didFirePressStart) return false;
        state.didFirePressStart = false;
        state.isTriggeringEvent = true;
        let shouldStopPropagation = true;
        if (onPressEnd) {
            let event = new $f6c31cce2adf654f$var$PressEvent('pressend', pointerType, originalEvent);
            onPressEnd(event);
            shouldStopPropagation = event.shouldStopPropagation;
        }
        if (onPressChange) onPressChange(false);
        setPressed(false);
        if (onPress && wasPressed && !isDisabled) {
            let event = new $f6c31cce2adf654f$var$PressEvent('press', pointerType, originalEvent);
            onPress(event);
            shouldStopPropagation && (shouldStopPropagation = event.shouldStopPropagation);
        }
        state.isTriggeringEvent = false;
        return shouldStopPropagation;
    });
    let triggerPressUp = (0, $7mdmh$useEffectEvent)((originalEvent, pointerType)=>{
        let state = ref.current;
        if (isDisabled) return false;
        if (onPressUp) {
            state.isTriggeringEvent = true;
            let event = new $f6c31cce2adf654f$var$PressEvent('pressup', pointerType, originalEvent);
            onPressUp(event);
            state.isTriggeringEvent = false;
            return event.shouldStopPropagation;
        }
        return true;
    });
    let cancel = (0, $7mdmh$useEffectEvent)((e)=>{
        let state = ref.current;
        if (state.isPressed && state.target) {
            if (state.didFirePressStart && state.pointerType != null) triggerPressEnd($f6c31cce2adf654f$var$createEvent(state.target, e), state.pointerType, false);
            state.isPressed = false;
            state.isOverTarget = false;
            state.activePointerId = null;
            state.pointerType = null;
            removeAllGlobalListeners();
            if (!allowTextSelectionOnPress) (0, $14c0b72509d70225$export$b0d6fa1ab32e3295)(state.target);
            for (let dispose of state.disposables)dispose();
            state.disposables = [];
        }
    });
    let cancelOnPointerExit = (0, $7mdmh$useEffectEvent)((e)=>{
        if (shouldCancelOnPointerExit) cancel(e);
    });
    let triggerClick = (0, $7mdmh$useEffectEvent)((e)=>{
        if (isDisabled) return;
        onClick === null || onClick === void 0 ? void 0 : onClick(e);
    });
    let triggerSyntheticClick = (0, $7mdmh$useEffectEvent)((e, target)=>{
        if (isDisabled) return;
        // Some third-party libraries pass in onClick instead of onPress.
        // Create a fake mouse event and trigger onClick as well.
        // This matches the browser's native activation behavior for certain elements (e.g. button).
        // https://html.spec.whatwg.org/#activation
        // https://html.spec.whatwg.org/#fire-a-synthetic-pointer-event
        if (onClick) {
            let event = new MouseEvent('click', e);
            (0, $8a9cb279dc87e130$export$c2b7abe5d61ec696)(event, target);
            onClick((0, $8a9cb279dc87e130$export$525bc4921d56d4a)(event));
        }
    });
    let pressProps = (0, $7mdmh$useMemo)(()=>{
        let state = ref.current;
        let pressProps = {
            onKeyDown (e) {
                if ($f6c31cce2adf654f$var$isValidKeyboardEvent(e.nativeEvent, e.currentTarget) && (0, $7mdmh$nodeContains)(e.currentTarget, (0, $7mdmh$getEventTarget)(e.nativeEvent))) {
                    var _state_metaKeyEvents;
                    if ($f6c31cce2adf654f$var$shouldPreventDefaultKeyboard((0, $7mdmh$getEventTarget)(e.nativeEvent), e.key)) e.preventDefault();
                    // If the event is repeating, it may have started on a different element
                    // after which focus moved to the current element. Ignore these events and
                    // only handle the first key down event.
                    let shouldStopPropagation = true;
                    if (!state.isPressed && !e.repeat) {
                        state.target = e.currentTarget;
                        state.isPressed = true;
                        state.pointerType = 'keyboard';
                        shouldStopPropagation = triggerPressStart(e, 'keyboard');
                        // Focus may move before the key up event, so register the event on the document
                        // instead of the same element where the key down event occurred. Make it capturing so that it will trigger
                        // before stopPropagation from useKeyboard on a child element may happen and thus we can still call triggerPress for the parent element.
                        let originalTarget = e.currentTarget;
                        let pressUp = (e)=>{
                            if ($f6c31cce2adf654f$var$isValidKeyboardEvent(e, originalTarget) && !e.repeat && (0, $7mdmh$nodeContains)(originalTarget, (0, $7mdmh$getEventTarget)(e)) && state.target) triggerPressUp($f6c31cce2adf654f$var$createEvent(state.target, e), 'keyboard');
                        };
                        addGlobalListener((0, $7mdmh$getOwnerDocument)(e.currentTarget), 'keyup', (0, $7mdmh$chain)(pressUp, onKeyUp), true);
                    }
                    if (shouldStopPropagation) e.stopPropagation();
                    // Keep track of the keydown events that occur while the Meta (e.g. Command) key is held.
                    // macOS has a bug where keyup events are not fired while the Meta key is down.
                    // When the Meta key itself is released we will get an event for that, and we'll act as if
                    // all of these other keys were released as well.
                    // https://bugs.chromium.org/p/chromium/issues/detail?id=1393524
                    // https://bugs.webkit.org/show_bug.cgi?id=55291
                    // https://bugzilla.mozilla.org/show_bug.cgi?id=1299553
                    if (e.metaKey && (0, $7mdmh$isMac)()) (_state_metaKeyEvents = state.metaKeyEvents) === null || _state_metaKeyEvents === void 0 ? void 0 : _state_metaKeyEvents.set(e.key, e.nativeEvent);
                } else if (e.key === 'Meta') state.metaKeyEvents = new Map();
            },
            onClick (e) {
                if (e && !(0, $7mdmh$nodeContains)(e.currentTarget, (0, $7mdmh$getEventTarget)(e.nativeEvent))) return;
                if (e && e.button === 0 && !state.isTriggeringEvent && !(0, $7mdmh$openLink).isOpening) {
                    let shouldStopPropagation = true;
                    if (isDisabled) e.preventDefault();
                    // If triggered from a screen reader or by using element.click(),
                    // trigger as if it were a keyboard click.
                    if (!state.ignoreEmulatedMouseEvents && !state.isPressed && (state.pointerType === 'virtual' || (0, $7mdmh$isVirtualClick)(e.nativeEvent))) {
                        let stopPressStart = triggerPressStart(e, 'virtual');
                        let stopPressUp = triggerPressUp(e, 'virtual');
                        let stopPressEnd = triggerPressEnd(e, 'virtual');
                        triggerClick(e);
                        shouldStopPropagation = stopPressStart && stopPressUp && stopPressEnd;
                    } else if (state.isPressed && state.pointerType !== 'keyboard') {
                        let pointerType = state.pointerType || e.nativeEvent.pointerType || 'virtual';
                        let stopPressUp = triggerPressUp($f6c31cce2adf654f$var$createEvent(e.currentTarget, e), pointerType);
                        let stopPressEnd = triggerPressEnd($f6c31cce2adf654f$var$createEvent(e.currentTarget, e), pointerType, true);
                        shouldStopPropagation = stopPressUp && stopPressEnd;
                        state.isOverTarget = false;
                        triggerClick(e);
                        cancel(e);
                    }
                    state.ignoreEmulatedMouseEvents = false;
                    if (shouldStopPropagation) e.stopPropagation();
                }
            }
        };
        let onKeyUp = (e)=>{
            var _state_metaKeyEvents;
            if (state.isPressed && state.target && $f6c31cce2adf654f$var$isValidKeyboardEvent(e, state.target)) {
                var _state_metaKeyEvents1;
                if ($f6c31cce2adf654f$var$shouldPreventDefaultKeyboard((0, $7mdmh$getEventTarget)(e), e.key)) e.preventDefault();
                let target = (0, $7mdmh$getEventTarget)(e);
                let wasPressed = (0, $7mdmh$nodeContains)(state.target, (0, $7mdmh$getEventTarget)(e));
                triggerPressEnd($f6c31cce2adf654f$var$createEvent(state.target, e), 'keyboard', wasPressed);
                if (wasPressed) triggerSyntheticClick(e, state.target);
                removeAllGlobalListeners();
                // If a link was triggered with a key other than Enter, open the URL ourselves.
                // This means the link has a role override, and the default browser behavior
                // only applies when using the Enter key.
                if (e.key !== 'Enter' && $f6c31cce2adf654f$var$isHTMLAnchorLink(state.target) && (0, $7mdmh$nodeContains)(state.target, target) && !e[$f6c31cce2adf654f$var$LINK_CLICKED]) {
                    // Store a hidden property on the event so we only trigger link click once,
                    // even if there are multiple usePress instances attached to the element.
                    e[$f6c31cce2adf654f$var$LINK_CLICKED] = true;
                    (0, $7mdmh$openLink)(state.target, e, false);
                }
                state.isPressed = false;
                (_state_metaKeyEvents1 = state.metaKeyEvents) === null || _state_metaKeyEvents1 === void 0 ? void 0 : _state_metaKeyEvents1.delete(e.key);
            } else if (e.key === 'Meta' && ((_state_metaKeyEvents = state.metaKeyEvents) === null || _state_metaKeyEvents === void 0 ? void 0 : _state_metaKeyEvents.size)) {
                var _state_target;
                // If we recorded keydown events that occurred while the Meta key was pressed,
                // and those haven't received keyup events already, fire keyup events ourselves.
                // See comment above for more info about the macOS bug causing this.
                let events = state.metaKeyEvents;
                state.metaKeyEvents = undefined;
                for (let event of events.values())(_state_target = state.target) === null || _state_target === void 0 ? void 0 : _state_target.dispatchEvent(new KeyboardEvent('keyup', event));
            }
        };
        if (typeof PointerEvent !== 'undefined') {
            pressProps.onPointerDown = (e)=>{
                // Only handle left clicks, and ignore events that bubbled through portals.
                if (e.button !== 0 || !(0, $7mdmh$nodeContains)(e.currentTarget, (0, $7mdmh$getEventTarget)(e.nativeEvent))) return;
                // iOS safari fires pointer events from VoiceOver with incorrect coordinates/target.
                // Ignore and let the onClick handler take care of it instead.
                // https://bugs.webkit.org/show_bug.cgi?id=222627
                // https://bugs.webkit.org/show_bug.cgi?id=223202
                if ((0, $7mdmh$isVirtualPointerEvent)(e.nativeEvent)) {
                    state.pointerType = 'virtual';
                    return;
                }
                state.pointerType = e.pointerType;
                let shouldStopPropagation = true;
                if (!state.isPressed) {
                    state.isPressed = true;
                    state.isOverTarget = true;
                    state.activePointerId = e.pointerId;
                    state.target = e.currentTarget;
                    if (!allowTextSelectionOnPress) (0, $14c0b72509d70225$export$16a4697467175487)(state.target);
                    shouldStopPropagation = triggerPressStart(e, state.pointerType);
                    // Release pointer capture so that touch interactions can leave the original target.
                    // This enables onPointerLeave and onPointerEnter to fire.
                    let target = (0, $7mdmh$getEventTarget)(e.nativeEvent);
                    if ('releasePointerCapture' in target) target.releasePointerCapture(e.pointerId);
                    addGlobalListener((0, $7mdmh$getOwnerDocument)(e.currentTarget), 'pointerup', onPointerUp, false);
                    addGlobalListener((0, $7mdmh$getOwnerDocument)(e.currentTarget), 'pointercancel', onPointerCancel, false);
                }
                if (shouldStopPropagation) e.stopPropagation();
            };
            pressProps.onMouseDown = (e)=>{
                if (!(0, $7mdmh$nodeContains)(e.currentTarget, (0, $7mdmh$getEventTarget)(e.nativeEvent))) return;
                if (e.button === 0) {
                    if (preventFocusOnPress) {
                        let dispose = (0, $8a9cb279dc87e130$export$cabe61c495ee3649)(e.target);
                        if (dispose) state.disposables.push(dispose);
                    }
                    e.stopPropagation();
                }
            };
            pressProps.onPointerUp = (e)=>{
                // iOS fires pointerup with zero width and height, so check the pointerType recorded during pointerdown.
                if (!(0, $7mdmh$nodeContains)(e.currentTarget, (0, $7mdmh$getEventTarget)(e.nativeEvent)) || state.pointerType === 'virtual') return;
                // Only handle left clicks. If isPressed is true, delay until onClick.
                if (e.button === 0 && !state.isPressed) triggerPressUp(e, state.pointerType || e.pointerType);
            };
            pressProps.onPointerEnter = (e)=>{
                if (e.pointerId === state.activePointerId && state.target && !state.isOverTarget && state.pointerType != null) {
                    state.isOverTarget = true;
                    triggerPressStart($f6c31cce2adf654f$var$createEvent(state.target, e), state.pointerType);
                }
            };
            pressProps.onPointerLeave = (e)=>{
                if (e.pointerId === state.activePointerId && state.target && state.isOverTarget && state.pointerType != null) {
                    state.isOverTarget = false;
                    triggerPressEnd($f6c31cce2adf654f$var$createEvent(state.target, e), state.pointerType, false);
                    cancelOnPointerExit(e);
                }
            };
            let onPointerUp = (e)=>{
                if (e.pointerId === state.activePointerId && state.isPressed && e.button === 0 && state.target) {
                    if ((0, $7mdmh$nodeContains)(state.target, (0, $7mdmh$getEventTarget)(e)) && state.pointerType != null) {
                        // Wait for onClick to fire onPress. This avoids browser issues when the DOM
                        // is mutated between onPointerUp and onClick, and is more compatible with third party libraries.
                        // https://github.com/adobe/react-spectrum/issues/1513
                        // https://issues.chromium.org/issues/40732224
                        // However, iOS and Android do not focus or fire onClick after a long press.
                        // We work around this by triggering a click ourselves after a timeout.
                        // This timeout is canceled during the click event in case the real one fires first.
                        // The timeout must be at least 32ms, because Safari on iOS delays the click event on
                        // non-form elements without certain ARIA roles (for hover emulation).
                        // https://github.com/WebKit/WebKit/blob/dccfae42bb29bd4bdef052e469f604a9387241c0/Source/WebKit/WebProcess/WebPage/ios/WebPageIOS.mm#L875-L892
                        let clicked = false;
                        let timeout = setTimeout(()=>{
                            if (state.isPressed && state.target instanceof HTMLElement) {
                                if (clicked) cancel(e);
                                else {
                                    (0, $7mdmh$focusWithoutScrolling)(state.target);
                                    state.target.click();
                                }
                            }
                        }, 80);
                        // Use a capturing listener to track if a click occurred.
                        // If stopPropagation is called it may never reach our handler.
                        addGlobalListener(e.currentTarget, 'click', ()=>clicked = true, true);
                        state.disposables.push(()=>clearTimeout(timeout));
                    } else cancel(e);
                    // Ignore subsequent onPointerLeave event before onClick on touch devices.
                    state.isOverTarget = false;
                }
            };
            let onPointerCancel = (e)=>{
                cancel(e);
            };
            pressProps.onDragStart = (e)=>{
                if (!(0, $7mdmh$nodeContains)(e.currentTarget, (0, $7mdmh$getEventTarget)(e.nativeEvent))) return;
                // Safari does not call onPointerCancel when a drag starts, whereas Chrome and Firefox do.
                cancel(e);
            };
        } else if (false) // removed by dead control flow
{}
        return pressProps;
    }, [
        addGlobalListener,
        isDisabled,
        preventFocusOnPress,
        removeAllGlobalListeners,
        allowTextSelectionOnPress,
        cancel,
        cancelOnPointerExit,
        triggerPressEnd,
        triggerPressStart,
        triggerPressUp,
        triggerClick,
        triggerSyntheticClick
    ]);
    // Avoid onClick delay for double tap to zoom by default.
    (0, $7mdmh$useEffect)(()=>{
        if (!domRef || "development" === 'test') return;
        const ownerDocument = (0, $7mdmh$getOwnerDocument)(domRef.current);
        if (!ownerDocument || !ownerDocument.head || ownerDocument.getElementById($f6c31cce2adf654f$var$STYLE_ID)) return;
        const style = ownerDocument.createElement('style');
        style.id = $f6c31cce2adf654f$var$STYLE_ID;
        // touchAction: 'manipulation' is supposed to be equivalent, but in
        // Safari it causes onPointerCancel not to fire on scroll.
        // https://bugs.webkit.org/show_bug.cgi?id=240917
        style.textContent = `
@layer {
  [${$f6c31cce2adf654f$var$PRESSABLE_ATTRIBUTE}] {
    touch-action: pan-x pan-y pinch-zoom;
  }
}
    `.trim();
        ownerDocument.head.prepend(style);
    }, [
        domRef
    ]);
    // Remove user-select: none in case component unmounts immediately after pressStart
    (0, $7mdmh$useEffect)(()=>{
        let state = ref.current;
        return ()=>{
            var _state_target;
            if (!allowTextSelectionOnPress) (0, $14c0b72509d70225$export$b0d6fa1ab32e3295)((_state_target = state.target) !== null && _state_target !== void 0 ? _state_target : undefined);
            for (let dispose of state.disposables)dispose();
            state.disposables = [];
        };
    }, [
        allowTextSelectionOnPress
    ]);
    return {
        isPressed: isPressedProp || isPressed,
        pressProps: (0, $7mdmh$mergeProps)(domProps, pressProps, {
            [$f6c31cce2adf654f$var$PRESSABLE_ATTRIBUTE]: true
        })
    };
}
function $f6c31cce2adf654f$var$isHTMLAnchorLink(target) {
    return target.tagName === 'A' && target.hasAttribute('href');
}
function $f6c31cce2adf654f$var$isValidKeyboardEvent(event, currentTarget) {
    const { key: key, code: code } = event;
    const element = currentTarget;
    const role = element.getAttribute('role');
    // Accessibility for keyboards. Space and Enter only.
    // "Spacebar" is for IE 11
    return (key === 'Enter' || key === ' ' || key === 'Spacebar' || code === 'Space') && !(element instanceof (0, $7mdmh$getOwnerWindow)(element).HTMLInputElement && !$f6c31cce2adf654f$var$isValidInputKey(element, key) || element instanceof (0, $7mdmh$getOwnerWindow)(element).HTMLTextAreaElement || element.isContentEditable) && // Links should only trigger with Enter key
    !((role === 'link' || !role && $f6c31cce2adf654f$var$isHTMLAnchorLink(element)) && key !== 'Enter');
}
function $f6c31cce2adf654f$var$getTouchFromEvent(event) {
    const { targetTouches: targetTouches } = event;
    if (targetTouches.length > 0) return targetTouches[0];
    return null;
}
function $f6c31cce2adf654f$var$getTouchById(event, pointerId) {
    const changedTouches = event.changedTouches;
    for(let i = 0; i < changedTouches.length; i++){
        const touch = changedTouches[i];
        if (touch.identifier === pointerId) return touch;
    }
    return null;
}
function $f6c31cce2adf654f$var$createTouchEvent(target, e) {
    let clientX = 0;
    let clientY = 0;
    if (e.targetTouches && e.targetTouches.length === 1) {
        clientX = e.targetTouches[0].clientX;
        clientY = e.targetTouches[0].clientY;
    }
    return {
        currentTarget: target,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
        clientX: clientX,
        clientY: clientY
    };
}
function $f6c31cce2adf654f$var$createEvent(target, e) {
    let clientX = e.clientX;
    let clientY = e.clientY;
    return {
        currentTarget: target,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
        clientX: clientX,
        clientY: clientY
    };
}
function $f6c31cce2adf654f$var$getPointClientRect(point) {
    let offsetX = 0;
    let offsetY = 0;
    if (point.width !== undefined) offsetX = point.width / 2;
    else if (point.radiusX !== undefined) offsetX = point.radiusX;
    if (point.height !== undefined) offsetY = point.height / 2;
    else if (point.radiusY !== undefined) offsetY = point.radiusY;
    return {
        top: point.clientY - offsetY,
        right: point.clientX + offsetX,
        bottom: point.clientY + offsetY,
        left: point.clientX - offsetX
    };
}
function $f6c31cce2adf654f$var$areRectanglesOverlapping(a, b) {
    // check if they cannot overlap on x axis
    if (a.left > b.right || b.left > a.right) return false;
    // check if they cannot overlap on y axis
    if (a.top > b.bottom || b.top > a.bottom) return false;
    return true;
}
function $f6c31cce2adf654f$var$isOverTarget(point, target) {
    let rect = target.getBoundingClientRect();
    let pointRect = $f6c31cce2adf654f$var$getPointClientRect(point);
    return $f6c31cce2adf654f$var$areRectanglesOverlapping(rect, pointRect);
}
function $f6c31cce2adf654f$var$shouldPreventDefaultUp(target) {
    if (target instanceof HTMLInputElement) return false;
    if (target instanceof HTMLButtonElement) return target.type !== 'submit' && target.type !== 'reset';
    if ($f6c31cce2adf654f$var$isHTMLAnchorLink(target)) return false;
    return true;
}
function $f6c31cce2adf654f$var$shouldPreventDefaultKeyboard(target, key) {
    if (target instanceof HTMLInputElement) return !$f6c31cce2adf654f$var$isValidInputKey(target, key);
    return $f6c31cce2adf654f$var$shouldPreventDefaultUp(target);
}
const $f6c31cce2adf654f$var$nonTextInputTypes = new Set([
    'checkbox',
    'radio',
    'range',
    'color',
    'file',
    'image',
    'button',
    'submit',
    'reset'
]);
function $f6c31cce2adf654f$var$isValidInputKey(target, key) {
    // Only space should toggle checkboxes and radios, not enter.
    return target.type === 'checkbox' || target.type === 'radio' ? key === ' ' : $f6c31cce2adf654f$var$nonTextInputTypes.has(target.type);
}



//# sourceMappingURL=usePress.module.js.map

// EXTERNAL MODULE: ./node_modules/@react-aria/ssr/dist/import.mjs + 1 modules
var ssr_dist_import = __webpack_require__(27575);
;// ./node_modules/@react-aria/interactions/dist/useFocusVisible.mjs





/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ // Portions of the code in this file are based on code from react.
// Original licensing for the following can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/facebook/react/tree/cc7c1aece46a6b69b41958d731e0fd27c94bfc6c/packages/react-interactions




let $507fabe10e71c6fb$var$currentModality = null;
let $507fabe10e71c6fb$var$changeHandlers = new Set();
let $507fabe10e71c6fb$export$d90243b58daecda7 = new Map(); // We use a map here to support setting event listeners across multiple document objects.
let $507fabe10e71c6fb$var$hasEventBeforeFocus = false;
let $507fabe10e71c6fb$var$hasBlurredWindowRecently = false;
// Only Tab or Esc keys will make focus visible on text input elements
const $507fabe10e71c6fb$var$FOCUS_VISIBLE_INPUT_KEYS = {
    Tab: true,
    Escape: true
};
function $507fabe10e71c6fb$var$triggerChangeHandlers(modality, e) {
    for (let handler of $507fabe10e71c6fb$var$changeHandlers)handler(modality, e);
}
/**
 * Helper function to determine if a KeyboardEvent is unmodified and could make keyboard focus styles visible.
 */ function $507fabe10e71c6fb$var$isValidKey(e) {
    // Control and Shift keys trigger when navigating back to the tab with keyboard.
    return !(e.metaKey || !(0, dist_import/* isMac */.Lz)() && e.altKey || e.ctrlKey || e.key === 'Control' || e.key === 'Shift' || e.key === 'Meta');
}
function $507fabe10e71c6fb$var$handleKeyboardEvent(e) {
    $507fabe10e71c6fb$var$hasEventBeforeFocus = true;
    if ($507fabe10e71c6fb$var$isValidKey(e)) {
        $507fabe10e71c6fb$var$currentModality = 'keyboard';
        $507fabe10e71c6fb$var$triggerChangeHandlers('keyboard', e);
    }
}
function $507fabe10e71c6fb$var$handlePointerEvent(e) {
    $507fabe10e71c6fb$var$currentModality = 'pointer';
    if (e.type === 'mousedown' || e.type === 'pointerdown') {
        $507fabe10e71c6fb$var$hasEventBeforeFocus = true;
        $507fabe10e71c6fb$var$triggerChangeHandlers('pointer', e);
    }
}
function $507fabe10e71c6fb$var$handleClickEvent(e) {
    if ((0, dist_import/* isVirtualClick */.YF)(e)) {
        $507fabe10e71c6fb$var$hasEventBeforeFocus = true;
        $507fabe10e71c6fb$var$currentModality = 'virtual';
    }
}
function $507fabe10e71c6fb$var$handleFocusEvent(e) {
    // Firefox fires two extra focus events when the user first clicks into an iframe:
    // first on the window, then on the document. We ignore these events so they don't
    // cause keyboard focus rings to appear.
    if (e.target === window || e.target === document || (0, $8a9cb279dc87e130$export$fda7da73ab5d4c48) || !e.isTrusted) return;
    // If a focus event occurs without a preceding keyboard or pointer event, switch to virtual modality.
    // This occurs, for example, when navigating a form with the next/previous buttons on iOS.
    if (!$507fabe10e71c6fb$var$hasEventBeforeFocus && !$507fabe10e71c6fb$var$hasBlurredWindowRecently) {
        $507fabe10e71c6fb$var$currentModality = 'virtual';
        $507fabe10e71c6fb$var$triggerChangeHandlers('virtual', e);
    }
    $507fabe10e71c6fb$var$hasEventBeforeFocus = false;
    $507fabe10e71c6fb$var$hasBlurredWindowRecently = false;
}
function $507fabe10e71c6fb$var$handleWindowBlur() {
    if (0, $8a9cb279dc87e130$export$fda7da73ab5d4c48) return;
    // When the window is blurred, reset state. This is necessary when tabbing out of the window,
    // for example, since a subsequent focus event won't be fired.
    $507fabe10e71c6fb$var$hasEventBeforeFocus = false;
    $507fabe10e71c6fb$var$hasBlurredWindowRecently = true;
}
/**
 * Setup global event listeners to control when keyboard focus style should be visible.
 */ function $507fabe10e71c6fb$var$setupGlobalFocusEvents(element) {
    if (typeof window === 'undefined' || typeof document === 'undefined' || $507fabe10e71c6fb$export$d90243b58daecda7.get((0, dist_import/* getOwnerWindow */.mD)(element))) return;
    const windowObject = (0, dist_import/* getOwnerWindow */.mD)(element);
    const documentObject = (0, dist_import/* getOwnerDocument */.TW)(element);
    // Programmatic focus() calls shouldn't affect the current input modality.
    // However, we need to detect other cases when a focus event occurs without
    // a preceding user event (e.g. screen reader focus). Overriding the focus
    // method on HTMLElement.prototype is a bit hacky, but works.
    let focus = windowObject.HTMLElement.prototype.focus;
    windowObject.HTMLElement.prototype.focus = function() {
        $507fabe10e71c6fb$var$hasEventBeforeFocus = true;
        focus.apply(this, arguments);
    };
    documentObject.addEventListener('keydown', $507fabe10e71c6fb$var$handleKeyboardEvent, true);
    documentObject.addEventListener('keyup', $507fabe10e71c6fb$var$handleKeyboardEvent, true);
    documentObject.addEventListener('click', $507fabe10e71c6fb$var$handleClickEvent, true);
    // Register focus events on the window so they are sure to happen
    // before React's event listeners (registered on the document).
    windowObject.addEventListener('focus', $507fabe10e71c6fb$var$handleFocusEvent, true);
    windowObject.addEventListener('blur', $507fabe10e71c6fb$var$handleWindowBlur, false);
    if (typeof PointerEvent !== 'undefined') {
        documentObject.addEventListener('pointerdown', $507fabe10e71c6fb$var$handlePointerEvent, true);
        documentObject.addEventListener('pointermove', $507fabe10e71c6fb$var$handlePointerEvent, true);
        documentObject.addEventListener('pointerup', $507fabe10e71c6fb$var$handlePointerEvent, true);
    } else if (false) // removed by dead control flow
{}
    // Add unmount handler
    windowObject.addEventListener('beforeunload', ()=>{
        $507fabe10e71c6fb$var$tearDownWindowFocusTracking(element);
    }, {
        once: true
    });
    $507fabe10e71c6fb$export$d90243b58daecda7.set(windowObject, {
        focus: focus
    });
}
const $507fabe10e71c6fb$var$tearDownWindowFocusTracking = (element, loadListener)=>{
    const windowObject = (0, dist_import/* getOwnerWindow */.mD)(element);
    const documentObject = (0, dist_import/* getOwnerDocument */.TW)(element);
    if (loadListener) documentObject.removeEventListener('DOMContentLoaded', loadListener);
    if (!$507fabe10e71c6fb$export$d90243b58daecda7.has(windowObject)) return;
    windowObject.HTMLElement.prototype.focus = $507fabe10e71c6fb$export$d90243b58daecda7.get(windowObject).focus;
    documentObject.removeEventListener('keydown', $507fabe10e71c6fb$var$handleKeyboardEvent, true);
    documentObject.removeEventListener('keyup', $507fabe10e71c6fb$var$handleKeyboardEvent, true);
    documentObject.removeEventListener('click', $507fabe10e71c6fb$var$handleClickEvent, true);
    windowObject.removeEventListener('focus', $507fabe10e71c6fb$var$handleFocusEvent, true);
    windowObject.removeEventListener('blur', $507fabe10e71c6fb$var$handleWindowBlur, false);
    if (typeof PointerEvent !== 'undefined') {
        documentObject.removeEventListener('pointerdown', $507fabe10e71c6fb$var$handlePointerEvent, true);
        documentObject.removeEventListener('pointermove', $507fabe10e71c6fb$var$handlePointerEvent, true);
        documentObject.removeEventListener('pointerup', $507fabe10e71c6fb$var$handlePointerEvent, true);
    } else if (false) // removed by dead control flow
{}
    $507fabe10e71c6fb$export$d90243b58daecda7.delete(windowObject);
};
function $507fabe10e71c6fb$export$2f1888112f558a7d(element) {
    const documentObject = (0, dist_import/* getOwnerDocument */.TW)(element);
    let loadListener;
    if (documentObject.readyState !== 'loading') $507fabe10e71c6fb$var$setupGlobalFocusEvents(element);
    else {
        loadListener = ()=>{
            $507fabe10e71c6fb$var$setupGlobalFocusEvents(element);
        };
        documentObject.addEventListener('DOMContentLoaded', loadListener);
    }
    return ()=>$507fabe10e71c6fb$var$tearDownWindowFocusTracking(element, loadListener);
}
// Server-side rendering does not have the document object defined
// eslint-disable-next-line no-restricted-globals
if (typeof document !== 'undefined') $507fabe10e71c6fb$export$2f1888112f558a7d();
function $507fabe10e71c6fb$export$b9b3dfddab17db27() {
    return $507fabe10e71c6fb$var$currentModality !== 'pointer';
}
function useFocusVisible_$507fabe10e71c6fb$export$630ff653c5ada6a9() {
    return $507fabe10e71c6fb$var$currentModality;
}
function $507fabe10e71c6fb$export$8397ddfc504fdb9a(modality) {
    $507fabe10e71c6fb$var$currentModality = modality;
    $507fabe10e71c6fb$var$triggerChangeHandlers(modality, null);
}
function $507fabe10e71c6fb$export$98e20ec92f614cfe() {
    $507fabe10e71c6fb$var$setupGlobalFocusEvents();
    let [modality, setModality] = (0, $28AnR$useState)($507fabe10e71c6fb$var$currentModality);
    (0, $28AnR$useEffect)(()=>{
        let handler = ()=>{
            setModality($507fabe10e71c6fb$var$currentModality);
        };
        $507fabe10e71c6fb$var$changeHandlers.add(handler);
        return ()=>{
            $507fabe10e71c6fb$var$changeHandlers.delete(handler);
        };
    }, []);
    return (0, $28AnR$useIsSSR)() ? null : modality;
}
const $507fabe10e71c6fb$var$nonTextInputTypes = new Set([
    'checkbox',
    'radio',
    'range',
    'color',
    'file',
    'image',
    'button',
    'submit',
    'reset'
]);
/**
 * If this is attached to text input component, return if the event is a focus event (Tab/Escape keys pressed) so that
 * focus visible style can be properly set.
 */ function $507fabe10e71c6fb$var$isKeyboardFocusEvent(isTextInput, modality, e) {
    let document1 = (0, dist_import/* getOwnerDocument */.TW)(e === null || e === void 0 ? void 0 : e.target);
    const IHTMLInputElement = typeof window !== 'undefined' ? (0, dist_import/* getOwnerWindow */.mD)(e === null || e === void 0 ? void 0 : e.target).HTMLInputElement : HTMLInputElement;
    const IHTMLTextAreaElement = typeof window !== 'undefined' ? (0, dist_import/* getOwnerWindow */.mD)(e === null || e === void 0 ? void 0 : e.target).HTMLTextAreaElement : HTMLTextAreaElement;
    const IHTMLElement = typeof window !== 'undefined' ? (0, dist_import/* getOwnerWindow */.mD)(e === null || e === void 0 ? void 0 : e.target).HTMLElement : HTMLElement;
    const IKeyboardEvent = typeof window !== 'undefined' ? (0, dist_import/* getOwnerWindow */.mD)(e === null || e === void 0 ? void 0 : e.target).KeyboardEvent : KeyboardEvent;
    // For keyboard events that occur on a non-input element that will move focus into input element (aka ArrowLeft going from Datepicker button to the main input group)
    // we need to rely on the user passing isTextInput into here. This way we can skip toggling focus visiblity for said input element
    isTextInput = isTextInput || document1.activeElement instanceof IHTMLInputElement && !$507fabe10e71c6fb$var$nonTextInputTypes.has(document1.activeElement.type) || document1.activeElement instanceof IHTMLTextAreaElement || document1.activeElement instanceof IHTMLElement && document1.activeElement.isContentEditable;
    return !(isTextInput && modality === 'keyboard' && e instanceof IKeyboardEvent && !$507fabe10e71c6fb$var$FOCUS_VISIBLE_INPUT_KEYS[e.key]);
}
function $507fabe10e71c6fb$export$ffd9e5021c1fb2d6(props = {}) {
    let { isTextInput: isTextInput, autoFocus: autoFocus } = props;
    let [isFocusVisibleState, setFocusVisible] = (0, $28AnR$useState)(autoFocus || $507fabe10e71c6fb$export$b9b3dfddab17db27());
    $507fabe10e71c6fb$export$ec71b4b83ac08ec3((isFocusVisible)=>{
        setFocusVisible(isFocusVisible);
    }, [
        isTextInput
    ], {
        isTextInput: isTextInput
    });
    return {
        isFocusVisible: isFocusVisibleState
    };
}
function $507fabe10e71c6fb$export$ec71b4b83ac08ec3(fn, deps, opts) {
    $507fabe10e71c6fb$var$setupGlobalFocusEvents();
    (0, react.useEffect)(()=>{
        let handler = (modality, e)=>{
            // We want to early return for any keyboard events that occur inside text inputs EXCEPT for Tab and Escape
            if (!$507fabe10e71c6fb$var$isKeyboardFocusEvent(!!(opts === null || opts === void 0 ? void 0 : opts.isTextInput), modality, e)) return;
            fn($507fabe10e71c6fb$export$b9b3dfddab17db27());
        };
        $507fabe10e71c6fb$var$changeHandlers.add(handler);
        return ()=>{
            $507fabe10e71c6fb$var$changeHandlers.delete(handler);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}



//# sourceMappingURL=useFocusVisible.module.js.map

;// ./node_modules/@react-aria/interactions/dist/focusSafely.mjs



/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 

function focusSafely_$3ad3f6e1647bc98d$export$80f3e147d781571c(element) {
    // If the user is interacting with a virtual cursor, e.g. screen reader, then
    // wait until after any animated transitions that are currently occurring on
    // the page before shifting focus. This avoids issues with VoiceOver on iOS
    // causing the page to scroll when moving focus if the element is transitioning
    // from off the screen.
    const ownerDocument = (0, $k50bp$getOwnerDocument)(element);
    const activeElement = (0, $k50bp$getActiveElement)(ownerDocument);
    if ((0, $507fabe10e71c6fb$export$630ff653c5ada6a9)() === 'virtual') {
        let lastFocusedElement = activeElement;
        (0, $k50bp$runAfterTransition)(()=>{
            // If focus did not move and the element is still in the document, focus it.
            if ((0, $k50bp$getActiveElement)(ownerDocument) === lastFocusedElement && element.isConnected) (0, $k50bp$focusWithoutScrolling)(element);
        });
    } else (0, $k50bp$focusWithoutScrolling)(element);
}



//# sourceMappingURL=focusSafely.module.js.map

;// ./node_modules/@react-aria/interactions/dist/useFocus.mjs




/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ // Portions of the code in this file are based on code from react.
// Original licensing for the following can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/facebook/react/tree/cc7c1aece46a6b69b41958d731e0fd27c94bfc6c/packages/react-interactions



function useFocus_$a1ea59d68270f0dd$export$f8168d8dd8fd66e6(props) {
    let { isDisabled: isDisabled, onFocus: onFocusProp, onBlur: onBlurProp, onFocusChange: onFocusChange } = props;
    const onBlur = (0, react.useCallback)((e)=>{
        if (e.target === e.currentTarget) {
            if (onBlurProp) onBlurProp(e);
            if (onFocusChange) onFocusChange(false);
            return true;
        }
    }, [
        onBlurProp,
        onFocusChange
    ]);
    const onSyntheticFocus = (0, $8a9cb279dc87e130$export$715c682d09d639cc)(onBlur);
    const onFocus = (0, react.useCallback)((e)=>{
        // Double check that document.activeElement actually matches e.target in case a previously chained
        // focus handler already moved focus somewhere else.
        const ownerDocument = (0, dist_import/* getOwnerDocument */.TW)(e.target);
        const activeElement = ownerDocument ? (0, dist_import/* getActiveElement */.bq)(ownerDocument) : (0, dist_import/* getActiveElement */.bq)();
        if (e.target === e.currentTarget && activeElement === (0, dist_import/* getEventTarget */.wt)(e.nativeEvent)) {
            if (onFocusProp) onFocusProp(e);
            if (onFocusChange) onFocusChange(true);
            onSyntheticFocus(e);
        }
    }, [
        onFocusChange,
        onFocusProp,
        onSyntheticFocus
    ]);
    return {
        focusProps: {
            onFocus: !isDisabled && (onFocusProp || onFocusChange || onBlurProp) ? onFocus : undefined,
            onBlur: !isDisabled && (onBlurProp || onFocusChange) ? onBlur : undefined
        }
    };
}



//# sourceMappingURL=useFocus.module.js.map

;// ./node_modules/@react-aria/interactions/dist/createEventHandler.mjs
/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ function createEventHandler_$93925083ecbb358c$export$48d1ea6320830260(handler) {
    if (!handler) return undefined;
    let shouldStopPropagation = true;
    return (e)=>{
        let event = {
            ...e,
            preventDefault () {
                e.preventDefault();
            },
            isDefaultPrevented () {
                return e.isDefaultPrevented();
            },
            stopPropagation () {
                if (shouldStopPropagation && "development" !== 'production') console.error('stopPropagation is now the default behavior for events in React Spectrum. You can use continuePropagation() to revert this behavior.');
                else shouldStopPropagation = true;
            },
            continuePropagation () {
                shouldStopPropagation = false;
            },
            isPropagationStopped () {
                return shouldStopPropagation;
            }
        };
        handler(event);
        if (shouldStopPropagation) e.stopPropagation();
    };
}



//# sourceMappingURL=createEventHandler.module.js.map

;// ./node_modules/@react-aria/interactions/dist/useKeyboard.mjs


/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 
function useKeyboard_$46d819fcbaf35654$export$8f71654801c2f7cd(props) {
    return {
        keyboardProps: props.isDisabled ? {} : {
            onKeyDown: (0, $93925083ecbb358c$export$48d1ea6320830260)(props.onKeyDown),
            onKeyUp: (0, $93925083ecbb358c$export$48d1ea6320830260)(props.onKeyUp)
        }
    };
}



//# sourceMappingURL=useKeyboard.module.js.map

;// ./node_modules/@react-aria/interactions/dist/useFocusable.mjs






/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 




let $f645667febf57a63$export$f9762fab77588ecb = /*#__PURE__*/ (/* unused pure expression or super */ null && ((0, $fcPuG$react).createContext(null)));
function $f645667febf57a63$var$useFocusableContext(ref) {
    let context = (0, $fcPuG$useContext)($f645667febf57a63$export$f9762fab77588ecb) || {};
    (0, $fcPuG$useSyncRef)(context, ref);
    // eslint-disable-next-line
    let { ref: _, ...otherProps } = context;
    return otherProps;
}
const $f645667febf57a63$export$13f3202a3e5ddd5 = /*#__PURE__*/ (/* unused pure expression or super */ null && ((0, $fcPuG$react).forwardRef(function FocusableProvider(props, ref) {
    let { children: children, ...otherProps } = props;
    let objRef = (0, $fcPuG$useObjectRef)(ref);
    let context = {
        ...otherProps,
        ref: objRef
    };
    return /*#__PURE__*/ (0, $fcPuG$react).createElement($f645667febf57a63$export$f9762fab77588ecb.Provider, {
        value: context
    }, children);
})));
function useFocusable_$f645667febf57a63$export$4c014de7c8940b4c(props, domRef) {
    let { focusProps: focusProps } = (0, $a1ea59d68270f0dd$export$f8168d8dd8fd66e6)(props);
    let { keyboardProps: keyboardProps } = (0, $46d819fcbaf35654$export$8f71654801c2f7cd)(props);
    let interactions = (0, $fcPuG$mergeProps)(focusProps, keyboardProps);
    let domProps = $f645667febf57a63$var$useFocusableContext(domRef);
    let interactionProps = props.isDisabled ? {} : domProps;
    let autoFocusRef = (0, $fcPuG$useRef)(props.autoFocus);
    (0, $fcPuG$useEffect)(()=>{
        if (autoFocusRef.current && domRef.current) (0, $3ad3f6e1647bc98d$export$80f3e147d781571c)(domRef.current);
        autoFocusRef.current = false;
    }, [
        domRef
    ]);
    // Always set a tabIndex so that Safari allows focusing native buttons and inputs.
    let tabIndex = props.excludeFromTabOrder ? -1 : 0;
    if (props.isDisabled) tabIndex = undefined;
    return {
        focusableProps: (0, $fcPuG$mergeProps)({
            ...interactions,
            tabIndex: tabIndex
        }, interactionProps)
    };
}
const $f645667febf57a63$export$35a3bebf7ef2d934 = /*#__PURE__*/ (/* unused pure expression or super */ null && ((0, $fcPuG$forwardRef)(({ children: children, ...props }, ref)=>{
    ref = (0, $fcPuG$useObjectRef)(ref);
    let { focusableProps: focusableProps } = useFocusable_$f645667febf57a63$export$4c014de7c8940b4c(props, ref);
    let child = (0, $fcPuG$react).Children.only(children);
    (0, $fcPuG$useEffect)(()=>{
        if (false) // removed by dead control flow
{}
        let el = ref.current;
        if (!el || !(el instanceof (0, $fcPuG$getOwnerWindow)(el).Element)) {
            console.error('<Focusable> child must forward its ref to a DOM element.');
            return;
        }
        if (!props.isDisabled && !(0, $fcPuG$isFocusable)(el)) {
            console.warn('<Focusable> child must be focusable. Please ensure the tabIndex prop is passed through.');
            return;
        }
        if (el.localName !== 'button' && el.localName !== 'input' && el.localName !== 'select' && el.localName !== 'textarea' && el.localName !== 'a' && el.localName !== 'area' && el.localName !== 'summary' && el.localName !== 'img' && el.localName !== 'svg') {
            let role = el.getAttribute('role');
            if (!role) console.warn('<Focusable> child must have an interactive ARIA role.');
            else if (// https://w3c.github.io/aria/#widget_roles
            role !== 'application' && role !== 'button' && role !== 'checkbox' && role !== 'combobox' && role !== 'gridcell' && role !== 'link' && role !== 'menuitem' && role !== 'menuitemcheckbox' && role !== 'menuitemradio' && role !== 'option' && role !== 'radio' && role !== 'searchbox' && role !== 'separator' && role !== 'slider' && role !== 'spinbutton' && role !== 'switch' && role !== 'tab' && role !== 'tabpanel' && role !== 'textbox' && role !== 'treeitem' && // aria-describedby is also announced on these roles
            role !== 'img' && role !== 'meter' && role !== 'progressbar') console.warn(`<Focusable> child must have an interactive ARIA role. Got "${role}".`);
        }
    }, [
        ref,
        props.isDisabled
    ]);
    // @ts-ignore
    let childRef = parseInt((0, $fcPuG$react).version, 10) < 19 ? child.ref : child.props.ref;
    return /*#__PURE__*/ (0, $fcPuG$react).cloneElement(child, {
        ...(0, $fcPuG$mergeProps)(focusableProps, child.props),
        // @ts-ignore
        ref: (0, $fcPuG$mergeRefs)(childRef, ref)
    });
})));



//# sourceMappingURL=useFocusable.module.js.map

;// ./node_modules/@react-aria/interactions/dist/Pressable.mjs





/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 



const $3b117e43dc0ca95d$export$27c701ed9e449e99 = /*#__PURE__*/ (/* unused pure expression or super */ null && ((0, $hhDyF$react).forwardRef(({ children: children, ...props }, ref)=>{
    ref = (0, $hhDyF$useObjectRef)(ref);
    let { pressProps: pressProps } = (0, $f6c31cce2adf654f$export$45712eceda6fad21)({
        ...props,
        ref: ref
    });
    let { focusableProps: focusableProps } = (0, $f645667febf57a63$export$4c014de7c8940b4c)(props, ref);
    let child = (0, $hhDyF$react).Children.only(children);
    (0, $hhDyF$useEffect)(()=>{
        if (false) // removed by dead control flow
{}
        let el = ref.current;
        if (!el || !(el instanceof (0, $hhDyF$getOwnerWindow)(el).Element)) {
            console.error('<Pressable> child must forward its ref to a DOM element.');
            return;
        }
        if (!props.isDisabled && !(0, $hhDyF$isFocusable)(el)) {
            console.warn('<Pressable> child must be focusable. Please ensure the tabIndex prop is passed through.');
            return;
        }
        if (el.localName !== 'button' && el.localName !== 'input' && el.localName !== 'select' && el.localName !== 'textarea' && el.localName !== 'a' && el.localName !== 'area' && el.localName !== 'summary') {
            let role = el.getAttribute('role');
            if (!role) console.warn('<Pressable> child must have an interactive ARIA role.');
            else if (// https://w3c.github.io/aria/#widget_roles
            role !== 'application' && role !== 'button' && role !== 'checkbox' && role !== 'combobox' && role !== 'gridcell' && role !== 'link' && role !== 'menuitem' && role !== 'menuitemcheckbox' && role !== 'menuitemradio' && role !== 'option' && role !== 'radio' && role !== 'searchbox' && role !== 'separator' && role !== 'slider' && role !== 'spinbutton' && role !== 'switch' && role !== 'tab' && role !== 'textbox' && role !== 'treeitem') console.warn(`<Pressable> child must have an interactive ARIA role. Got "${role}".`);
        }
    }, [
        ref,
        props.isDisabled
    ]);
    // @ts-ignore
    let childRef = parseInt((0, $hhDyF$react).version, 10) < 19 ? child.ref : child.props.ref;
    return /*#__PURE__*/ (0, $hhDyF$react).cloneElement(child, {
        ...(0, $hhDyF$mergeProps)(pressProps, focusableProps, child.props),
        // @ts-ignore
        ref: (0, $hhDyF$mergeRefs)(childRef, ref)
    });
})));



//# sourceMappingURL=Pressable.module.js.map

;// ./node_modules/@react-aria/interactions/dist/PressResponder.mjs




/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 


const $f1ab8c75478c6f73$export$3351871ee4b288b8 = /*#__PURE__*/ (/* unused pure expression or super */ null && ((0, $87RPk$react).forwardRef(({ children: children, ...props }, ref)=>{
    let isRegistered = (0, $87RPk$useRef)(false);
    let prevContext = (0, $87RPk$useContext)((0, $ae1eeba8b9eafd08$export$5165eccb35aaadb5));
    ref = (0, $87RPk$useObjectRef)(ref || (prevContext === null || prevContext === void 0 ? void 0 : prevContext.ref));
    let context = (0, $87RPk$mergeProps)(prevContext || {}, {
        ...props,
        ref: ref,
        register () {
            isRegistered.current = true;
            if (prevContext) prevContext.register();
        }
    });
    (0, $87RPk$useSyncRef)(prevContext, ref);
    (0, $87RPk$useEffect)(()=>{
        if (!isRegistered.current) {
            if (true) console.warn("A PressResponder was rendered without a pressable child. Either call the usePress hook, or wrap your DOM node with <Pressable> component.");
            isRegistered.current = true; // only warn once in strict mode.
        }
    }, []);
    return /*#__PURE__*/ (0, $87RPk$react).createElement((0, $ae1eeba8b9eafd08$export$5165eccb35aaadb5).Provider, {
        value: context
    }, children);
})));
function $f1ab8c75478c6f73$export$cf75428e0b9ed1ea({ children: children }) {
    let context = (0, $87RPk$useMemo)(()=>({
            register: ()=>{}
        }), []);
    return /*#__PURE__*/ (0, $87RPk$react).createElement((0, $ae1eeba8b9eafd08$export$5165eccb35aaadb5).Provider, {
        value: context
    }, children);
}



//# sourceMappingURL=PressResponder.module.js.map

;// ./node_modules/@react-aria/interactions/dist/useFocusWithin.mjs




/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ // Portions of the code in this file are based on code from react.
// Original licensing for the following can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/facebook/react/tree/cc7c1aece46a6b69b41958d731e0fd27c94bfc6c/packages/react-interactions



function $9ab94262bd0047c7$export$420e68273165f4ec(props) {
    let { isDisabled: isDisabled, onBlurWithin: onBlurWithin, onFocusWithin: onFocusWithin, onFocusWithinChange: onFocusWithinChange } = props;
    let state = (0, react.useRef)({
        isFocusWithin: false
    });
    let { addGlobalListener: addGlobalListener, removeAllGlobalListeners: removeAllGlobalListeners } = (0, dist_import/* useGlobalListeners */.A5)();
    let onBlur = (0, react.useCallback)((e)=>{
        // Ignore events bubbling through portals.
        if (!e.currentTarget.contains(e.target)) return;
        // We don't want to trigger onBlurWithin and then immediately onFocusWithin again
        // when moving focus inside the element. Only trigger if the currentTarget doesn't
        // include the relatedTarget (where focus is moving).
        if (state.current.isFocusWithin && !e.currentTarget.contains(e.relatedTarget)) {
            state.current.isFocusWithin = false;
            removeAllGlobalListeners();
            if (onBlurWithin) onBlurWithin(e);
            if (onFocusWithinChange) onFocusWithinChange(false);
        }
    }, [
        onBlurWithin,
        onFocusWithinChange,
        state,
        removeAllGlobalListeners
    ]);
    let onSyntheticFocus = (0, $8a9cb279dc87e130$export$715c682d09d639cc)(onBlur);
    let onFocus = (0, react.useCallback)((e)=>{
        // Ignore events bubbling through portals.
        if (!e.currentTarget.contains(e.target)) return;
        // Double check that document.activeElement actually matches e.target in case a previously chained
        // focus handler already moved focus somewhere else.
        const ownerDocument = (0, dist_import/* getOwnerDocument */.TW)(e.target);
        const activeElement = (0, dist_import/* getActiveElement */.bq)(ownerDocument);
        if (!state.current.isFocusWithin && activeElement === (0, dist_import/* getEventTarget */.wt)(e.nativeEvent)) {
            if (onFocusWithin) onFocusWithin(e);
            if (onFocusWithinChange) onFocusWithinChange(true);
            state.current.isFocusWithin = true;
            onSyntheticFocus(e);
            // Browsers don't fire blur events when elements are removed from the DOM.
            // However, if a focus event occurs outside the element we're tracking, we
            // can manually fire onBlur.
            let currentTarget = e.currentTarget;
            addGlobalListener(ownerDocument, 'focus', (e)=>{
                if (state.current.isFocusWithin && !(0, dist_import/* nodeContains */.sD)(currentTarget, e.target)) {
                    let nativeEvent = new ownerDocument.defaultView.FocusEvent('blur', {
                        relatedTarget: e.target
                    });
                    (0, utils_$8a9cb279dc87e130$export$c2b7abe5d61ec696)(nativeEvent, currentTarget);
                    let event = (0, utils_$8a9cb279dc87e130$export$525bc4921d56d4a)(nativeEvent);
                    onBlur(event);
                }
            }, {
                capture: true
            });
        }
    }, [
        onFocusWithin,
        onFocusWithinChange,
        onSyntheticFocus,
        addGlobalListener,
        onBlur
    ]);
    if (isDisabled) return {
        focusWithinProps: {
            // These cannot be null, that would conflict in mergeProps
            onFocus: undefined,
            onBlur: undefined
        }
    };
    return {
        focusWithinProps: {
            onFocus: onFocus,
            onBlur: onBlur
        }
    };
}



//# sourceMappingURL=useFocusWithin.module.js.map

;// ./node_modules/@react-aria/interactions/dist/useHover.mjs



/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ // Portions of the code in this file are based on code from react.
// Original licensing for the following can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/facebook/react/tree/cc7c1aece46a6b69b41958d731e0fd27c94bfc6c/packages/react-interactions


// iOS fires onPointerEnter twice: once with pointerType="touch" and again with pointerType="mouse".
// We want to ignore these emulated events so they do not trigger hover behavior.
// See https://bugs.webkit.org/show_bug.cgi?id=214609.
let $6179b936705e76d3$var$globalIgnoreEmulatedMouseEvents = false;
let $6179b936705e76d3$var$hoverCount = 0;
function $6179b936705e76d3$var$setGlobalIgnoreEmulatedMouseEvents() {
    $6179b936705e76d3$var$globalIgnoreEmulatedMouseEvents = true;
    // Clear globalIgnoreEmulatedMouseEvents after a short timeout. iOS fires onPointerEnter
    // with pointerType="mouse" immediately after onPointerUp and before onFocus. On other
    // devices that don't have this quirk, we don't want to ignore a mouse hover sometime in
    // the distant future because a user previously touched the element.
    setTimeout(()=>{
        $6179b936705e76d3$var$globalIgnoreEmulatedMouseEvents = false;
    }, 50);
}
function $6179b936705e76d3$var$handleGlobalPointerEvent(e) {
    if (e.pointerType === 'touch') $6179b936705e76d3$var$setGlobalIgnoreEmulatedMouseEvents();
}
function $6179b936705e76d3$var$setupGlobalTouchEvents() {
    if (typeof document === 'undefined') return;
    if ($6179b936705e76d3$var$hoverCount === 0) {
        if (typeof PointerEvent !== 'undefined') document.addEventListener('pointerup', $6179b936705e76d3$var$handleGlobalPointerEvent);
        else if (false) // removed by dead control flow
{}
    }
    $6179b936705e76d3$var$hoverCount++;
    return ()=>{
        $6179b936705e76d3$var$hoverCount--;
        if ($6179b936705e76d3$var$hoverCount > 0) return;
        if (typeof PointerEvent !== 'undefined') document.removeEventListener('pointerup', $6179b936705e76d3$var$handleGlobalPointerEvent);
        else if (false) // removed by dead control flow
{}
    };
}
function $6179b936705e76d3$export$ae780daf29e6d456(props) {
    let { onHoverStart: onHoverStart, onHoverChange: onHoverChange, onHoverEnd: onHoverEnd, isDisabled: isDisabled } = props;
    let [isHovered, setHovered] = (0, react.useState)(false);
    let state = (0, react.useRef)({
        isHovered: false,
        ignoreEmulatedMouseEvents: false,
        pointerType: '',
        target: null
    }).current;
    (0, react.useEffect)($6179b936705e76d3$var$setupGlobalTouchEvents, []);
    let { addGlobalListener: addGlobalListener, removeAllGlobalListeners: removeAllGlobalListeners } = (0, dist_import/* useGlobalListeners */.A5)();
    let { hoverProps: hoverProps, triggerHoverEnd: triggerHoverEnd } = (0, react.useMemo)(()=>{
        let triggerHoverStart = (event, pointerType)=>{
            state.pointerType = pointerType;
            if (isDisabled || pointerType === 'touch' || state.isHovered || !event.currentTarget.contains(event.target)) return;
            state.isHovered = true;
            let target = event.currentTarget;
            state.target = target;
            // When an element that is hovered over is removed, no pointerleave event is fired by the browser,
            // even though the originally hovered target may have shrunk in size so it is no longer hovered.
            // However, a pointerover event will be fired on the new target the mouse is over.
            // In Chrome this happens immediately. In Safari and Firefox, it happens upon moving the mouse one pixel.
            addGlobalListener((0, dist_import/* getOwnerDocument */.TW)(event.target), 'pointerover', (e)=>{
                if (state.isHovered && state.target && !(0, dist_import/* nodeContains */.sD)(state.target, e.target)) triggerHoverEnd(e, e.pointerType);
            }, {
                capture: true
            });
            if (onHoverStart) onHoverStart({
                type: 'hoverstart',
                target: target,
                pointerType: pointerType
            });
            if (onHoverChange) onHoverChange(true);
            setHovered(true);
        };
        let triggerHoverEnd = (event, pointerType)=>{
            let target = state.target;
            state.pointerType = '';
            state.target = null;
            if (pointerType === 'touch' || !state.isHovered || !target) return;
            state.isHovered = false;
            removeAllGlobalListeners();
            if (onHoverEnd) onHoverEnd({
                type: 'hoverend',
                target: target,
                pointerType: pointerType
            });
            if (onHoverChange) onHoverChange(false);
            setHovered(false);
        };
        let hoverProps = {};
        if (typeof PointerEvent !== 'undefined') {
            hoverProps.onPointerEnter = (e)=>{
                if ($6179b936705e76d3$var$globalIgnoreEmulatedMouseEvents && e.pointerType === 'mouse') return;
                triggerHoverStart(e, e.pointerType);
            };
            hoverProps.onPointerLeave = (e)=>{
                if (!isDisabled && e.currentTarget.contains(e.target)) triggerHoverEnd(e, e.pointerType);
            };
        } else if (false) // removed by dead control flow
{}
        return {
            hoverProps: hoverProps,
            triggerHoverEnd: triggerHoverEnd
        };
    }, [
        onHoverStart,
        onHoverChange,
        onHoverEnd,
        isDisabled,
        state,
        addGlobalListener,
        removeAllGlobalListeners
    ]);
    (0, react.useEffect)(()=>{
        // Call the triggerHoverEnd as soon as isDisabled changes to true
        // Safe to call triggerHoverEnd, it will early return if we aren't currently hovering
        if (isDisabled) triggerHoverEnd({
            currentTarget: state.target
        }, state.pointerType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        isDisabled
    ]);
    return {
        hoverProps: hoverProps,
        isHovered: isHovered
    };
}



//# sourceMappingURL=useHover.module.js.map

;// ./node_modules/@react-aria/interactions/dist/useInteractOutside.mjs



/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ // Portions of the code in this file are based on code from react.
// Original licensing for the following can be found in the
// NOTICE file in the root directory of this source tree.
// See https://github.com/facebook/react/tree/cc7c1aece46a6b69b41958d731e0fd27c94bfc6c/packages/react-interactions


function $e0b6e0b68ec7f50f$export$872b660ac5a1ff98(props) {
    let { ref: ref, onInteractOutside: onInteractOutside, isDisabled: isDisabled, onInteractOutsideStart: onInteractOutsideStart } = props;
    let stateRef = (0, $ispOf$useRef)({
        isPointerDown: false,
        ignoreEmulatedMouseEvents: false
    });
    let onPointerDown = (0, $ispOf$useEffectEvent)((e)=>{
        if (onInteractOutside && $e0b6e0b68ec7f50f$var$isValidEvent(e, ref)) {
            if (onInteractOutsideStart) onInteractOutsideStart(e);
            stateRef.current.isPointerDown = true;
        }
    });
    let triggerInteractOutside = (0, $ispOf$useEffectEvent)((e)=>{
        if (onInteractOutside) onInteractOutside(e);
    });
    (0, $ispOf$useEffect)(()=>{
        let state = stateRef.current;
        if (isDisabled) return;
        const element = ref.current;
        const documentObject = (0, $ispOf$getOwnerDocument)(element);
        // Use pointer events if available. Otherwise, fall back to mouse and touch events.
        if (typeof PointerEvent !== 'undefined') {
            let onClick = (e)=>{
                if (state.isPointerDown && $e0b6e0b68ec7f50f$var$isValidEvent(e, ref)) triggerInteractOutside(e);
                state.isPointerDown = false;
            };
            // changing these to capture phase fixed combobox
            // Use click instead of pointerup to avoid Android Chrome issue
            // https://issues.chromium.org/issues/40732224
            documentObject.addEventListener('pointerdown', onPointerDown, true);
            documentObject.addEventListener('click', onClick, true);
            return ()=>{
                documentObject.removeEventListener('pointerdown', onPointerDown, true);
                documentObject.removeEventListener('click', onClick, true);
            };
        } else if (false) // removed by dead control flow
{}
    }, [
        ref,
        isDisabled,
        onPointerDown,
        triggerInteractOutside
    ]);
}
function $e0b6e0b68ec7f50f$var$isValidEvent(event, ref) {
    if (event.button > 0) return false;
    if (event.target) {
        // if the event target is no longer in the document, ignore
        const ownerDocument = event.target.ownerDocument;
        if (!ownerDocument || !ownerDocument.documentElement.contains(event.target)) return false;
        // If the target is within a top layer element (e.g. toasts), ignore.
        if (event.target.closest('[data-react-aria-top-layer]')) return false;
    }
    if (!ref.current) return false;
    // When the event source is inside a Shadow DOM, event.target is just the shadow root.
    // Using event.composedPath instead means we can get the actual element inside the shadow root.
    // This only works if the shadow root is open, there is no way to detect if it is closed.
    // If the event composed path contains the ref, interaction is inside.
    return !event.composedPath().includes(ref.current);
}



//# sourceMappingURL=useInteractOutside.module.js.map

;// ./node_modules/@react-aria/interactions/dist/useMove.mjs




/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 


function $e8a7022cf87cba2a$export$36da96379f79f245(props) {
    let { onMoveStart: onMoveStart, onMove: onMove, onMoveEnd: onMoveEnd } = props;
    let state = (0, $5GN7j$useRef)({
        didMove: false,
        lastPosition: null,
        id: null
    });
    let { addGlobalListener: addGlobalListener, removeGlobalListener: removeGlobalListener } = (0, $5GN7j$useGlobalListeners)();
    let move = (0, $5GN7j$useEffectEvent)((originalEvent, pointerType, deltaX, deltaY)=>{
        if (deltaX === 0 && deltaY === 0) return;
        if (!state.current.didMove) {
            state.current.didMove = true;
            onMoveStart === null || onMoveStart === void 0 ? void 0 : onMoveStart({
                type: 'movestart',
                pointerType: pointerType,
                shiftKey: originalEvent.shiftKey,
                metaKey: originalEvent.metaKey,
                ctrlKey: originalEvent.ctrlKey,
                altKey: originalEvent.altKey
            });
        }
        onMove === null || onMove === void 0 ? void 0 : onMove({
            type: 'move',
            pointerType: pointerType,
            deltaX: deltaX,
            deltaY: deltaY,
            shiftKey: originalEvent.shiftKey,
            metaKey: originalEvent.metaKey,
            ctrlKey: originalEvent.ctrlKey,
            altKey: originalEvent.altKey
        });
    });
    let end = (0, $5GN7j$useEffectEvent)((originalEvent, pointerType)=>{
        (0, $14c0b72509d70225$export$b0d6fa1ab32e3295)();
        if (state.current.didMove) onMoveEnd === null || onMoveEnd === void 0 ? void 0 : onMoveEnd({
            type: 'moveend',
            pointerType: pointerType,
            shiftKey: originalEvent.shiftKey,
            metaKey: originalEvent.metaKey,
            ctrlKey: originalEvent.ctrlKey,
            altKey: originalEvent.altKey
        });
    });
    let moveProps = (0, $5GN7j$useMemo)(()=>{
        let moveProps = {};
        let start = ()=>{
            (0, $14c0b72509d70225$export$16a4697467175487)();
            state.current.didMove = false;
        };
        if (typeof PointerEvent === 'undefined' && "development" === 'test') // removed by dead control flow
{} else {
            let onPointerMove = (e)=>{
                if (e.pointerId === state.current.id) {
                    var _state_current_lastPosition, _state_current_lastPosition1;
                    let pointerType = e.pointerType || 'mouse';
                    var _state_current_lastPosition_pageX, _state_current_lastPosition_pageY;
                    // Problems with PointerEvent#movementX/movementY:
                    // 1. it is always 0 on macOS Safari.
                    // 2. On Chrome Android, it's scaled by devicePixelRatio, but not on Chrome macOS
                    move(e, pointerType, e.pageX - ((_state_current_lastPosition_pageX = (_state_current_lastPosition = state.current.lastPosition) === null || _state_current_lastPosition === void 0 ? void 0 : _state_current_lastPosition.pageX) !== null && _state_current_lastPosition_pageX !== void 0 ? _state_current_lastPosition_pageX : 0), e.pageY - ((_state_current_lastPosition_pageY = (_state_current_lastPosition1 = state.current.lastPosition) === null || _state_current_lastPosition1 === void 0 ? void 0 : _state_current_lastPosition1.pageY) !== null && _state_current_lastPosition_pageY !== void 0 ? _state_current_lastPosition_pageY : 0));
                    state.current.lastPosition = {
                        pageX: e.pageX,
                        pageY: e.pageY
                    };
                }
            };
            let onPointerUp = (e)=>{
                if (e.pointerId === state.current.id) {
                    let pointerType = e.pointerType || 'mouse';
                    end(e, pointerType);
                    state.current.id = null;
                    removeGlobalListener(window, 'pointermove', onPointerMove, false);
                    removeGlobalListener(window, 'pointerup', onPointerUp, false);
                    removeGlobalListener(window, 'pointercancel', onPointerUp, false);
                }
            };
            moveProps.onPointerDown = (e)=>{
                if (e.button === 0 && state.current.id == null) {
                    start();
                    e.stopPropagation();
                    e.preventDefault();
                    state.current.lastPosition = {
                        pageX: e.pageX,
                        pageY: e.pageY
                    };
                    state.current.id = e.pointerId;
                    addGlobalListener(window, 'pointermove', onPointerMove, false);
                    addGlobalListener(window, 'pointerup', onPointerUp, false);
                    addGlobalListener(window, 'pointercancel', onPointerUp, false);
                }
            };
        }
        let triggerKeyboardMove = (e, deltaX, deltaY)=>{
            start();
            move(e, 'keyboard', deltaX, deltaY);
            end(e, 'keyboard');
        };
        moveProps.onKeyDown = (e)=>{
            switch(e.key){
                case 'Left':
                case 'ArrowLeft':
                    e.preventDefault();
                    e.stopPropagation();
                    triggerKeyboardMove(e, -1, 0);
                    break;
                case 'Right':
                case 'ArrowRight':
                    e.preventDefault();
                    e.stopPropagation();
                    triggerKeyboardMove(e, 1, 0);
                    break;
                case 'Up':
                case 'ArrowUp':
                    e.preventDefault();
                    e.stopPropagation();
                    triggerKeyboardMove(e, 0, -1);
                    break;
                case 'Down':
                case 'ArrowDown':
                    e.preventDefault();
                    e.stopPropagation();
                    triggerKeyboardMove(e, 0, 1);
                    break;
            }
        };
        return moveProps;
    }, [
        state,
        addGlobalListener,
        removeGlobalListener,
        move,
        end
    ]);
    return {
        moveProps: moveProps
    };
}



//# sourceMappingURL=useMove.module.js.map

;// ./node_modules/@react-aria/interactions/dist/useScrollWheel.mjs



/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 

function $7d0a636d7a4dcefd$export$2123ff2b87c81ca(props, ref) {
    let { onScroll: onScroll, isDisabled: isDisabled } = props;
    let onScrollHandler = (0, $nrdL2$useCallback)((e)=>{
        // If the ctrlKey is pressed, this is a zoom event, do nothing.
        if (e.ctrlKey) return;
        // stop scrolling the page
        e.preventDefault();
        e.stopPropagation();
        if (onScroll) onScroll({
            deltaX: e.deltaX,
            deltaY: e.deltaY
        });
    }, [
        onScroll
    ]);
    (0, $nrdL2$useEvent)(ref, 'wheel', isDisabled ? undefined : onScrollHandler);
}



//# sourceMappingURL=useScrollWheel.module.js.map

;// ./node_modules/@react-aria/interactions/dist/useLongPress.mjs




/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 


const $8a26561d2877236e$var$DEFAULT_THRESHOLD = 500;
function $8a26561d2877236e$export$c24ed0104d07eab9(props) {
    let { isDisabled: isDisabled, onLongPressStart: onLongPressStart, onLongPressEnd: onLongPressEnd, onLongPress: onLongPress, threshold: threshold = $8a26561d2877236e$var$DEFAULT_THRESHOLD, accessibilityDescription: accessibilityDescription } = props;
    const timeRef = (0, $4k2kv$useRef)(undefined);
    let { addGlobalListener: addGlobalListener, removeGlobalListener: removeGlobalListener } = (0, $4k2kv$useGlobalListeners)();
    let { pressProps: pressProps } = (0, $f6c31cce2adf654f$export$45712eceda6fad21)({
        isDisabled: isDisabled,
        onPressStart (e) {
            e.continuePropagation();
            if (e.pointerType === 'mouse' || e.pointerType === 'touch') {
                if (onLongPressStart) onLongPressStart({
                    ...e,
                    type: 'longpressstart'
                });
                timeRef.current = setTimeout(()=>{
                    // Prevent other usePress handlers from also handling this event.
                    e.target.dispatchEvent(new PointerEvent('pointercancel', {
                        bubbles: true
                    }));
                    // Ensure target is focused. On touch devices, browsers typically focus on pointer up.
                    if ((0, $4k2kv$getOwnerDocument)(e.target).activeElement !== e.target) (0, $4k2kv$focusWithoutScrolling)(e.target);
                    if (onLongPress) onLongPress({
                        ...e,
                        type: 'longpress'
                    });
                    timeRef.current = undefined;
                }, threshold);
                // Prevent context menu, which may be opened on long press on touch devices
                if (e.pointerType === 'touch') {
                    let onContextMenu = (e)=>{
                        e.preventDefault();
                    };
                    addGlobalListener(e.target, 'contextmenu', onContextMenu, {
                        once: true
                    });
                    addGlobalListener(window, 'pointerup', ()=>{
                        // If no contextmenu event is fired quickly after pointerup, remove the handler
                        // so future context menu events outside a long press are not prevented.
                        setTimeout(()=>{
                            removeGlobalListener(e.target, 'contextmenu', onContextMenu);
                        }, 30);
                    }, {
                        once: true
                    });
                }
            }
        },
        onPressEnd (e) {
            if (timeRef.current) clearTimeout(timeRef.current);
            if (onLongPressEnd && (e.pointerType === 'mouse' || e.pointerType === 'touch')) onLongPressEnd({
                ...e,
                type: 'longpressend'
            });
        }
    });
    let descriptionProps = (0, $4k2kv$useDescription)(onLongPress && !isDisabled ? accessibilityDescription : undefined);
    return {
        longPressProps: (0, $4k2kv$mergeProps)(pressProps, descriptionProps)
    };
}



//# sourceMappingURL=useLongPress.module.js.map

;// ./node_modules/@react-aria/interactions/dist/import.mjs















/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 
















//# sourceMappingURL=module.js.map


/***/ }),

/***/ 50928:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  og: () => (/* reexport */ useFocusRing_$f7dceffc5ad7768b$export$4e328f61c538687f)
});

// UNUSED EXPORTS: FocusRing, FocusScope, Focusable, FocusableProvider, createFocusManager, dispatchVirtualBlur, dispatchVirtualFocus, focusSafely, getFocusableTreeWalker, getVirtuallyFocusedElement, isElementInChildOfActiveScope, isFocusable, moveVirtualFocus, useFocusManager, useFocusable, useHasTabbableChild

// EXTERNAL MODULE: ./node_modules/@react-aria/utils/dist/import.mjs + 42 modules
var dist_import = __webpack_require__(64057);
// EXTERNAL MODULE: ./node_modules/@react-aria/interactions/dist/import.mjs + 18 modules
var interactions_dist_import = __webpack_require__(46733);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./node_modules/@react-aria/focus/dist/FocusScope.mjs




/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 


const $9bf71ea28793e738$var$FocusContext = /*#__PURE__*/ (/* unused pure expression or super */ null && ((0, $cgawC$react).createContext(null)));
const $9bf71ea28793e738$var$RESTORE_FOCUS_EVENT = 'react-aria-focus-scope-restore';
let $9bf71ea28793e738$var$activeScope = null;
function $9bf71ea28793e738$export$20e40289641fbbb6(props) {
    let { children: children, contain: contain, restoreFocus: restoreFocus, autoFocus: autoFocus } = props;
    let startRef = (0, $cgawC$useRef)(null);
    let endRef = (0, $cgawC$useRef)(null);
    let scopeRef = (0, $cgawC$useRef)([]);
    let { parentNode: parentNode } = (0, $cgawC$useContext)($9bf71ea28793e738$var$FocusContext) || {};
    // Create a tree node here so we can add children to it even before it is added to the tree.
    let node = (0, $cgawC$useMemo)(()=>new $9bf71ea28793e738$var$TreeNode({
            scopeRef: scopeRef
        }), [
        scopeRef
    ]);
    (0, $cgawC$useLayoutEffect)(()=>{
        // If a new scope mounts outside the active scope, (e.g. DialogContainer launched from a menu),
        // use the active scope as the parent instead of the parent from context. Layout effects run bottom
        // up, so if the parent is not yet added to the tree, don't do this. Only the outer-most FocusScope
        // that is being added should get the activeScope as its parent.
        let parent = parentNode || $9bf71ea28793e738$export$d06fae2ee68b101e.root;
        if ($9bf71ea28793e738$export$d06fae2ee68b101e.getTreeNode(parent.scopeRef) && $9bf71ea28793e738$var$activeScope && !$9bf71ea28793e738$var$isAncestorScope($9bf71ea28793e738$var$activeScope, parent.scopeRef)) {
            let activeNode = $9bf71ea28793e738$export$d06fae2ee68b101e.getTreeNode($9bf71ea28793e738$var$activeScope);
            if (activeNode) parent = activeNode;
        }
        // Add the node to the parent, and to the tree.
        parent.addChild(node);
        $9bf71ea28793e738$export$d06fae2ee68b101e.addNode(node);
    }, [
        node,
        parentNode
    ]);
    (0, $cgawC$useLayoutEffect)(()=>{
        let node = $9bf71ea28793e738$export$d06fae2ee68b101e.getTreeNode(scopeRef);
        if (node) node.contain = !!contain;
    }, [
        contain
    ]);
    (0, $cgawC$useLayoutEffect)(()=>{
        var _startRef_current;
        // Find all rendered nodes between the sentinels and add them to the scope.
        let node = (_startRef_current = startRef.current) === null || _startRef_current === void 0 ? void 0 : _startRef_current.nextSibling;
        let nodes = [];
        let stopPropagation = (e)=>e.stopPropagation();
        while(node && node !== endRef.current){
            nodes.push(node);
            // Stop custom restore focus event from propagating to parent focus scopes.
            node.addEventListener($9bf71ea28793e738$var$RESTORE_FOCUS_EVENT, stopPropagation);
            node = node.nextSibling;
        }
        scopeRef.current = nodes;
        return ()=>{
            for (let node of nodes)node.removeEventListener($9bf71ea28793e738$var$RESTORE_FOCUS_EVENT, stopPropagation);
        };
    }, [
        children
    ]);
    $9bf71ea28793e738$var$useActiveScopeTracker(scopeRef, restoreFocus, contain);
    $9bf71ea28793e738$var$useFocusContainment(scopeRef, contain);
    $9bf71ea28793e738$var$useRestoreFocus(scopeRef, restoreFocus, contain);
    $9bf71ea28793e738$var$useAutoFocus(scopeRef, autoFocus);
    // This needs to be an effect so that activeScope is updated after the FocusScope tree is complete.
    // It cannot be a useLayoutEffect because the parent of this node hasn't been attached in the tree yet.
    (0, $cgawC$useEffect)(()=>{
        const activeElement = (0, $cgawC$getActiveElement)((0, $cgawC$getOwnerDocument)(scopeRef.current ? scopeRef.current[0] : undefined));
        let scope = null;
        if ($9bf71ea28793e738$var$isElementInScope(activeElement, scopeRef.current)) {
            // We need to traverse the focusScope tree and find the bottom most scope that
            // contains the active element and set that as the activeScope.
            for (let node of $9bf71ea28793e738$export$d06fae2ee68b101e.traverse())if (node.scopeRef && $9bf71ea28793e738$var$isElementInScope(activeElement, node.scopeRef.current)) scope = node;
            if (scope === $9bf71ea28793e738$export$d06fae2ee68b101e.getTreeNode(scopeRef)) $9bf71ea28793e738$var$activeScope = scope.scopeRef;
        }
    }, [
        scopeRef
    ]);
    // This layout effect cleanup is so that the tree node is removed synchronously with react before the RAF
    // in useRestoreFocus cleanup runs.
    (0, $cgawC$useLayoutEffect)(()=>{
        return ()=>{
            var _focusScopeTree_getTreeNode_parent, _focusScopeTree_getTreeNode;
            var _focusScopeTree_getTreeNode_parent_scopeRef;
            // Scope may have been re-parented.
            let parentScope = (_focusScopeTree_getTreeNode_parent_scopeRef = (_focusScopeTree_getTreeNode = $9bf71ea28793e738$export$d06fae2ee68b101e.getTreeNode(scopeRef)) === null || _focusScopeTree_getTreeNode === void 0 ? void 0 : (_focusScopeTree_getTreeNode_parent = _focusScopeTree_getTreeNode.parent) === null || _focusScopeTree_getTreeNode_parent === void 0 ? void 0 : _focusScopeTree_getTreeNode_parent.scopeRef) !== null && _focusScopeTree_getTreeNode_parent_scopeRef !== void 0 ? _focusScopeTree_getTreeNode_parent_scopeRef : null;
            if ((scopeRef === $9bf71ea28793e738$var$activeScope || $9bf71ea28793e738$var$isAncestorScope(scopeRef, $9bf71ea28793e738$var$activeScope)) && (!parentScope || $9bf71ea28793e738$export$d06fae2ee68b101e.getTreeNode(parentScope))) $9bf71ea28793e738$var$activeScope = parentScope;
            $9bf71ea28793e738$export$d06fae2ee68b101e.removeTreeNode(scopeRef);
        };
    }, [
        scopeRef
    ]);
    let focusManager = (0, $cgawC$useMemo)(()=>$9bf71ea28793e738$var$createFocusManagerForScope(scopeRef), []);
    let value = (0, $cgawC$useMemo)(()=>({
            focusManager: focusManager,
            parentNode: node
        }), [
        node,
        focusManager
    ]);
    return /*#__PURE__*/ (0, $cgawC$react).createElement($9bf71ea28793e738$var$FocusContext.Provider, {
        value: value
    }, /*#__PURE__*/ (0, $cgawC$react).createElement("span", {
        "data-focus-scope-start": true,
        hidden: true,
        ref: startRef
    }), children, /*#__PURE__*/ (0, $cgawC$react).createElement("span", {
        "data-focus-scope-end": true,
        hidden: true,
        ref: endRef
    }));
}
function $9bf71ea28793e738$export$10c5169755ce7bd7() {
    var _useContext;
    return (_useContext = (0, $cgawC$useContext)($9bf71ea28793e738$var$FocusContext)) === null || _useContext === void 0 ? void 0 : _useContext.focusManager;
}
function $9bf71ea28793e738$var$createFocusManagerForScope(scopeRef) {
    return {
        focusNext (opts = {}) {
            let scope = scopeRef.current;
            let { from: from, tabbable: tabbable, wrap: wrap, accept: accept } = opts;
            var _scope_;
            let node = from || (0, $cgawC$getActiveElement)((0, $cgawC$getOwnerDocument)((_scope_ = scope[0]) !== null && _scope_ !== void 0 ? _scope_ : undefined));
            let sentinel = scope[0].previousElementSibling;
            let scopeRoot = $9bf71ea28793e738$var$getScopeRoot(scope);
            let walker = FocusScope_$9bf71ea28793e738$export$2d6ec8fc375ceafa(scopeRoot, {
                tabbable: tabbable,
                accept: accept
            }, scope);
            walker.currentNode = $9bf71ea28793e738$var$isElementInScope(node, scope) ? node : sentinel;
            let nextNode = walker.nextNode();
            if (!nextNode && wrap) {
                walker.currentNode = sentinel;
                nextNode = walker.nextNode();
            }
            if (nextNode) $9bf71ea28793e738$var$focusElement(nextNode, true);
            return nextNode;
        },
        focusPrevious (opts = {}) {
            let scope = scopeRef.current;
            let { from: from, tabbable: tabbable, wrap: wrap, accept: accept } = opts;
            var _scope_;
            let node = from || (0, $cgawC$getActiveElement)((0, $cgawC$getOwnerDocument)((_scope_ = scope[0]) !== null && _scope_ !== void 0 ? _scope_ : undefined));
            let sentinel = scope[scope.length - 1].nextElementSibling;
            let scopeRoot = $9bf71ea28793e738$var$getScopeRoot(scope);
            let walker = FocusScope_$9bf71ea28793e738$export$2d6ec8fc375ceafa(scopeRoot, {
                tabbable: tabbable,
                accept: accept
            }, scope);
            walker.currentNode = $9bf71ea28793e738$var$isElementInScope(node, scope) ? node : sentinel;
            let previousNode = walker.previousNode();
            if (!previousNode && wrap) {
                walker.currentNode = sentinel;
                previousNode = walker.previousNode();
            }
            if (previousNode) $9bf71ea28793e738$var$focusElement(previousNode, true);
            return previousNode;
        },
        focusFirst (opts = {}) {
            let scope = scopeRef.current;
            let { tabbable: tabbable, accept: accept } = opts;
            let scopeRoot = $9bf71ea28793e738$var$getScopeRoot(scope);
            let walker = FocusScope_$9bf71ea28793e738$export$2d6ec8fc375ceafa(scopeRoot, {
                tabbable: tabbable,
                accept: accept
            }, scope);
            walker.currentNode = scope[0].previousElementSibling;
            let nextNode = walker.nextNode();
            if (nextNode) $9bf71ea28793e738$var$focusElement(nextNode, true);
            return nextNode;
        },
        focusLast (opts = {}) {
            let scope = scopeRef.current;
            let { tabbable: tabbable, accept: accept } = opts;
            let scopeRoot = $9bf71ea28793e738$var$getScopeRoot(scope);
            let walker = FocusScope_$9bf71ea28793e738$export$2d6ec8fc375ceafa(scopeRoot, {
                tabbable: tabbable,
                accept: accept
            }, scope);
            walker.currentNode = scope[scope.length - 1].nextElementSibling;
            let previousNode = walker.previousNode();
            if (previousNode) $9bf71ea28793e738$var$focusElement(previousNode, true);
            return previousNode;
        }
    };
}
function $9bf71ea28793e738$var$getScopeRoot(scope) {
    return scope[0].parentElement;
}
function $9bf71ea28793e738$var$shouldContainFocus(scopeRef) {
    let scope = $9bf71ea28793e738$export$d06fae2ee68b101e.getTreeNode($9bf71ea28793e738$var$activeScope);
    while(scope && scope.scopeRef !== scopeRef){
        if (scope.contain) return false;
        scope = scope.parent;
    }
    return true;
}
function $9bf71ea28793e738$var$isTabbableRadio(element) {
    if (element.checked) return true;
    let radios = [];
    if (!element.form) radios = [
        ...(0, $cgawC$getOwnerDocument)(element).querySelectorAll(`input[type="radio"][name="${CSS.escape(element.name)}"]`)
    ].filter((radio)=>!radio.form);
    else {
        var _element_form_elements, _element_form;
        let radioList = (_element_form = element.form) === null || _element_form === void 0 ? void 0 : (_element_form_elements = _element_form.elements) === null || _element_form_elements === void 0 ? void 0 : _element_form_elements.namedItem(element.name);
        radios = [
            ...radioList !== null && radioList !== void 0 ? radioList : []
        ];
    }
    if (!radios) return false;
    let anyChecked = radios.some((radio)=>radio.checked);
    return !anyChecked;
}
function $9bf71ea28793e738$var$useFocusContainment(scopeRef, contain) {
    let focusedNode = (0, $cgawC$useRef)(undefined);
    let raf = (0, $cgawC$useRef)(undefined);
    (0, $cgawC$useLayoutEffect)(()=>{
        let scope = scopeRef.current;
        if (!contain) {
            // if contain was changed, then we should cancel any ongoing waits to pull focus back into containment
            if (raf.current) {
                cancelAnimationFrame(raf.current);
                raf.current = undefined;
            }
            return;
        }
        const ownerDocument = (0, $cgawC$getOwnerDocument)(scope ? scope[0] : undefined);
        // Handle the Tab key to contain focus within the scope
        let onKeyDown = (e)=>{
            if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey || !$9bf71ea28793e738$var$shouldContainFocus(scopeRef) || e.isComposing) return;
            let focusedElement = (0, $cgawC$getActiveElement)(ownerDocument);
            let scope = scopeRef.current;
            if (!scope || !$9bf71ea28793e738$var$isElementInScope(focusedElement, scope)) return;
            let scopeRoot = $9bf71ea28793e738$var$getScopeRoot(scope);
            let walker = FocusScope_$9bf71ea28793e738$export$2d6ec8fc375ceafa(scopeRoot, {
                tabbable: true
            }, scope);
            if (!focusedElement) return;
            walker.currentNode = focusedElement;
            let nextElement = e.shiftKey ? walker.previousNode() : walker.nextNode();
            if (!nextElement) {
                walker.currentNode = e.shiftKey ? scope[scope.length - 1].nextElementSibling : scope[0].previousElementSibling;
                nextElement = e.shiftKey ? walker.previousNode() : walker.nextNode();
            }
            e.preventDefault();
            if (nextElement) $9bf71ea28793e738$var$focusElement(nextElement, true);
        };
        let onFocus = (e)=>{
            // If focusing an element in a child scope of the currently active scope, the child becomes active.
            // Moving out of the active scope to an ancestor is not allowed.
            if ((!$9bf71ea28793e738$var$activeScope || $9bf71ea28793e738$var$isAncestorScope($9bf71ea28793e738$var$activeScope, scopeRef)) && $9bf71ea28793e738$var$isElementInScope((0, $cgawC$getEventTarget)(e), scopeRef.current)) {
                $9bf71ea28793e738$var$activeScope = scopeRef;
                focusedNode.current = (0, $cgawC$getEventTarget)(e);
            } else if ($9bf71ea28793e738$var$shouldContainFocus(scopeRef) && !$9bf71ea28793e738$var$isElementInChildScope((0, $cgawC$getEventTarget)(e), scopeRef)) {
                // If a focus event occurs outside the active scope (e.g. user tabs from browser location bar),
                // restore focus to the previously focused node or the first tabbable element in the active scope.
                if (focusedNode.current) focusedNode.current.focus();
                else if ($9bf71ea28793e738$var$activeScope && $9bf71ea28793e738$var$activeScope.current) $9bf71ea28793e738$var$focusFirstInScope($9bf71ea28793e738$var$activeScope.current);
            } else if ($9bf71ea28793e738$var$shouldContainFocus(scopeRef)) focusedNode.current = (0, $cgawC$getEventTarget)(e);
        };
        let onBlur = (e)=>{
            // Firefox doesn't shift focus back to the Dialog properly without this
            if (raf.current) cancelAnimationFrame(raf.current);
            raf.current = requestAnimationFrame(()=>{
                // Patches infinite focus coersion loop for Android Talkback where the user isn't able to move the virtual cursor
                // if within a containing focus scope. Bug filed against Chrome: https://issuetracker.google.com/issues/384844019.
                // Note that this means focus can leave focus containing modals due to this, but it is isolated to Chrome Talkback.
                let modality = (0, $cgawC$getInteractionModality)();
                let shouldSkipFocusRestore = (modality === 'virtual' || modality === null) && (0, $cgawC$isAndroid)() && (0, $cgawC$isChrome)();
                // Use document.activeElement instead of e.relatedTarget so we can tell if user clicked into iframe
                let activeElement = (0, $cgawC$getActiveElement)(ownerDocument);
                if (!shouldSkipFocusRestore && activeElement && $9bf71ea28793e738$var$shouldContainFocus(scopeRef) && !$9bf71ea28793e738$var$isElementInChildScope(activeElement, scopeRef)) {
                    $9bf71ea28793e738$var$activeScope = scopeRef;
                    let target = (0, $cgawC$getEventTarget)(e);
                    if (target && target.isConnected) {
                        var _focusedNode_current;
                        focusedNode.current = target;
                        (_focusedNode_current = focusedNode.current) === null || _focusedNode_current === void 0 ? void 0 : _focusedNode_current.focus();
                    } else if ($9bf71ea28793e738$var$activeScope.current) $9bf71ea28793e738$var$focusFirstInScope($9bf71ea28793e738$var$activeScope.current);
                }
            });
        };
        ownerDocument.addEventListener('keydown', onKeyDown, false);
        ownerDocument.addEventListener('focusin', onFocus, false);
        scope === null || scope === void 0 ? void 0 : scope.forEach((element)=>element.addEventListener('focusin', onFocus, false));
        scope === null || scope === void 0 ? void 0 : scope.forEach((element)=>element.addEventListener('focusout', onBlur, false));
        return ()=>{
            ownerDocument.removeEventListener('keydown', onKeyDown, false);
            ownerDocument.removeEventListener('focusin', onFocus, false);
            scope === null || scope === void 0 ? void 0 : scope.forEach((element)=>element.removeEventListener('focusin', onFocus, false));
            scope === null || scope === void 0 ? void 0 : scope.forEach((element)=>element.removeEventListener('focusout', onBlur, false));
        };
    }, [
        scopeRef,
        contain
    ]);
    // This is a useLayoutEffect so it is guaranteed to run before our async synthetic blur
    (0, $cgawC$useLayoutEffect)(()=>{
        return ()=>{
            if (raf.current) cancelAnimationFrame(raf.current);
        };
    }, [
        raf
    ]);
}
function $9bf71ea28793e738$var$isElementInAnyScope(element) {
    return $9bf71ea28793e738$var$isElementInChildScope(element);
}
function $9bf71ea28793e738$var$isElementInScope(element, scope) {
    if (!element) return false;
    if (!scope) return false;
    return scope.some((node)=>node.contains(element));
}
function $9bf71ea28793e738$var$isElementInChildScope(element, scope = null) {
    // If the element is within a top layer element (e.g. toasts), always allow moving focus there.
    if (element instanceof Element && element.closest('[data-react-aria-top-layer]')) return true;
    // node.contains in isElementInScope covers child scopes that are also DOM children,
    // but does not cover child scopes in portals.
    for (let { scopeRef: s } of $9bf71ea28793e738$export$d06fae2ee68b101e.traverse($9bf71ea28793e738$export$d06fae2ee68b101e.getTreeNode(scope))){
        if (s && $9bf71ea28793e738$var$isElementInScope(element, s.current)) return true;
    }
    return false;
}
function $9bf71ea28793e738$export$1258395f99bf9cbf(element) {
    return $9bf71ea28793e738$var$isElementInChildScope(element, $9bf71ea28793e738$var$activeScope);
}
function $9bf71ea28793e738$var$isAncestorScope(ancestor, scope) {
    var _focusScopeTree_getTreeNode;
    let parent = (_focusScopeTree_getTreeNode = $9bf71ea28793e738$export$d06fae2ee68b101e.getTreeNode(scope)) === null || _focusScopeTree_getTreeNode === void 0 ? void 0 : _focusScopeTree_getTreeNode.parent;
    while(parent){
        if (parent.scopeRef === ancestor) return true;
        parent = parent.parent;
    }
    return false;
}
function $9bf71ea28793e738$var$focusElement(element, scroll = false) {
    if (element != null && !scroll) try {
        (0, $cgawC$focusSafely)(element);
    } catch  {
    // ignore
    }
    else if (element != null) try {
        element.focus();
    } catch  {
    // ignore
    }
}
function $9bf71ea28793e738$var$getFirstInScope(scope, tabbable = true) {
    let sentinel = scope[0].previousElementSibling;
    let scopeRoot = $9bf71ea28793e738$var$getScopeRoot(scope);
    let walker = FocusScope_$9bf71ea28793e738$export$2d6ec8fc375ceafa(scopeRoot, {
        tabbable: tabbable
    }, scope);
    walker.currentNode = sentinel;
    let nextNode = walker.nextNode();
    // If the scope does not contain a tabbable element, use the first focusable element.
    if (tabbable && !nextNode) {
        scopeRoot = $9bf71ea28793e738$var$getScopeRoot(scope);
        walker = FocusScope_$9bf71ea28793e738$export$2d6ec8fc375ceafa(scopeRoot, {
            tabbable: false
        }, scope);
        walker.currentNode = sentinel;
        nextNode = walker.nextNode();
    }
    return nextNode;
}
function $9bf71ea28793e738$var$focusFirstInScope(scope, tabbable = true) {
    $9bf71ea28793e738$var$focusElement($9bf71ea28793e738$var$getFirstInScope(scope, tabbable));
}
function $9bf71ea28793e738$var$useAutoFocus(scopeRef, autoFocus) {
    const autoFocusRef = (0, $cgawC$react).useRef(autoFocus);
    (0, $cgawC$useEffect)(()=>{
        if (autoFocusRef.current) {
            $9bf71ea28793e738$var$activeScope = scopeRef;
            const ownerDocument = (0, $cgawC$getOwnerDocument)(scopeRef.current ? scopeRef.current[0] : undefined);
            if (!$9bf71ea28793e738$var$isElementInScope((0, $cgawC$getActiveElement)(ownerDocument), $9bf71ea28793e738$var$activeScope.current) && scopeRef.current) $9bf71ea28793e738$var$focusFirstInScope(scopeRef.current);
        }
        autoFocusRef.current = false;
    }, [
        scopeRef
    ]);
}
function $9bf71ea28793e738$var$useActiveScopeTracker(scopeRef, restore, contain) {
    // tracks the active scope, in case restore and contain are both false.
    // if either are true, this is tracked in useRestoreFocus or useFocusContainment.
    (0, $cgawC$useLayoutEffect)(()=>{
        if (restore || contain) return;
        let scope = scopeRef.current;
        const ownerDocument = (0, $cgawC$getOwnerDocument)(scope ? scope[0] : undefined);
        let onFocus = (e)=>{
            let target = (0, $cgawC$getEventTarget)(e);
            if ($9bf71ea28793e738$var$isElementInScope(target, scopeRef.current)) $9bf71ea28793e738$var$activeScope = scopeRef;
            else if (!$9bf71ea28793e738$var$isElementInAnyScope(target)) $9bf71ea28793e738$var$activeScope = null;
        };
        ownerDocument.addEventListener('focusin', onFocus, false);
        scope === null || scope === void 0 ? void 0 : scope.forEach((element)=>element.addEventListener('focusin', onFocus, false));
        return ()=>{
            ownerDocument.removeEventListener('focusin', onFocus, false);
            scope === null || scope === void 0 ? void 0 : scope.forEach((element)=>element.removeEventListener('focusin', onFocus, false));
        };
    }, [
        scopeRef,
        restore,
        contain
    ]);
}
function $9bf71ea28793e738$var$shouldRestoreFocus(scopeRef) {
    let scope = $9bf71ea28793e738$export$d06fae2ee68b101e.getTreeNode($9bf71ea28793e738$var$activeScope);
    while(scope && scope.scopeRef !== scopeRef){
        if (scope.nodeToRestore) return false;
        scope = scope.parent;
    }
    return (scope === null || scope === void 0 ? void 0 : scope.scopeRef) === scopeRef;
}
function $9bf71ea28793e738$var$useRestoreFocus(scopeRef, restoreFocus, contain) {
    // create a ref during render instead of useLayoutEffect so the active element is saved before a child with autoFocus=true mounts.
    // eslint-disable-next-line no-restricted-globals
    const nodeToRestoreRef = (0, $cgawC$useRef)(typeof document !== 'undefined' ? (0, $cgawC$getActiveElement)((0, $cgawC$getOwnerDocument)(scopeRef.current ? scopeRef.current[0] : undefined)) : null);
    // restoring scopes should all track if they are active regardless of contain, but contain already tracks it plus logic to contain the focus
    // restoring-non-containing scopes should only care if they become active so they can perform the restore
    (0, $cgawC$useLayoutEffect)(()=>{
        let scope = scopeRef.current;
        const ownerDocument = (0, $cgawC$getOwnerDocument)(scope ? scope[0] : undefined);
        if (!restoreFocus || contain) return;
        let onFocus = ()=>{
            // If focusing an element in a child scope of the currently active scope, the child becomes active.
            // Moving out of the active scope to an ancestor is not allowed.
            if ((!$9bf71ea28793e738$var$activeScope || $9bf71ea28793e738$var$isAncestorScope($9bf71ea28793e738$var$activeScope, scopeRef)) && $9bf71ea28793e738$var$isElementInScope((0, $cgawC$getActiveElement)(ownerDocument), scopeRef.current)) $9bf71ea28793e738$var$activeScope = scopeRef;
        };
        ownerDocument.addEventListener('focusin', onFocus, false);
        scope === null || scope === void 0 ? void 0 : scope.forEach((element)=>element.addEventListener('focusin', onFocus, false));
        return ()=>{
            ownerDocument.removeEventListener('focusin', onFocus, false);
            scope === null || scope === void 0 ? void 0 : scope.forEach((element)=>element.removeEventListener('focusin', onFocus, false));
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        scopeRef,
        contain
    ]);
    (0, $cgawC$useLayoutEffect)(()=>{
        const ownerDocument = (0, $cgawC$getOwnerDocument)(scopeRef.current ? scopeRef.current[0] : undefined);
        if (!restoreFocus) return;
        // Handle the Tab key so that tabbing out of the scope goes to the next element
        // after the node that had focus when the scope mounted. This is important when
        // using portals for overlays, so that focus goes to the expected element when
        // tabbing out of the overlay.
        let onKeyDown = (e)=>{
            if (e.key !== 'Tab' || e.altKey || e.ctrlKey || e.metaKey || !$9bf71ea28793e738$var$shouldContainFocus(scopeRef) || e.isComposing) return;
            let focusedElement = ownerDocument.activeElement;
            if (!$9bf71ea28793e738$var$isElementInChildScope(focusedElement, scopeRef) || !$9bf71ea28793e738$var$shouldRestoreFocus(scopeRef)) return;
            let treeNode = $9bf71ea28793e738$export$d06fae2ee68b101e.getTreeNode(scopeRef);
            if (!treeNode) return;
            let nodeToRestore = treeNode.nodeToRestore;
            // Create a DOM tree walker that matches all tabbable elements
            let walker = FocusScope_$9bf71ea28793e738$export$2d6ec8fc375ceafa(ownerDocument.body, {
                tabbable: true
            });
            // Find the next tabbable element after the currently focused element
            walker.currentNode = focusedElement;
            let nextElement = e.shiftKey ? walker.previousNode() : walker.nextNode();
            if (!nodeToRestore || !nodeToRestore.isConnected || nodeToRestore === ownerDocument.body) {
                nodeToRestore = undefined;
                treeNode.nodeToRestore = undefined;
            }
            // If there is no next element, or it is outside the current scope, move focus to the
            // next element after the node to restore to instead.
            if ((!nextElement || !$9bf71ea28793e738$var$isElementInChildScope(nextElement, scopeRef)) && nodeToRestore) {
                walker.currentNode = nodeToRestore;
                // Skip over elements within the scope, in case the scope immediately follows the node to restore.
                do nextElement = e.shiftKey ? walker.previousNode() : walker.nextNode();
                while ($9bf71ea28793e738$var$isElementInChildScope(nextElement, scopeRef));
                e.preventDefault();
                e.stopPropagation();
                if (nextElement) $9bf71ea28793e738$var$focusElement(nextElement, true);
                else // If there is no next element and the nodeToRestore isn't within a FocusScope (i.e. we are leaving the top level focus scope)
                // then move focus to the body.
                // Otherwise restore focus to the nodeToRestore (e.g menu within a popover -> tabbing to close the menu should move focus to menu trigger)
                if (!$9bf71ea28793e738$var$isElementInAnyScope(nodeToRestore)) focusedElement.blur();
                else $9bf71ea28793e738$var$focusElement(nodeToRestore, true);
            }
        };
        if (!contain) ownerDocument.addEventListener('keydown', onKeyDown, true);
        return ()=>{
            if (!contain) ownerDocument.removeEventListener('keydown', onKeyDown, true);
        };
    }, [
        scopeRef,
        restoreFocus,
        contain
    ]);
    // useLayoutEffect instead of useEffect so the active element is saved synchronously instead of asynchronously.
    (0, $cgawC$useLayoutEffect)(()=>{
        const ownerDocument = (0, $cgawC$getOwnerDocument)(scopeRef.current ? scopeRef.current[0] : undefined);
        if (!restoreFocus) return;
        let treeNode = $9bf71ea28793e738$export$d06fae2ee68b101e.getTreeNode(scopeRef);
        if (!treeNode) return;
        var _nodeToRestoreRef_current;
        treeNode.nodeToRestore = (_nodeToRestoreRef_current = nodeToRestoreRef.current) !== null && _nodeToRestoreRef_current !== void 0 ? _nodeToRestoreRef_current : undefined;
        return ()=>{
            let treeNode = $9bf71ea28793e738$export$d06fae2ee68b101e.getTreeNode(scopeRef);
            if (!treeNode) return;
            let nodeToRestore = treeNode.nodeToRestore;
            // if we already lost focus to the body and this was the active scope, then we should attempt to restore
            let activeElement = (0, $cgawC$getActiveElement)(ownerDocument);
            if (restoreFocus && nodeToRestore && (activeElement && $9bf71ea28793e738$var$isElementInChildScope(activeElement, scopeRef) || activeElement === ownerDocument.body && $9bf71ea28793e738$var$shouldRestoreFocus(scopeRef))) {
                // freeze the focusScopeTree so it persists after the raf, otherwise during unmount nodes are removed from it
                let clonedTree = $9bf71ea28793e738$export$d06fae2ee68b101e.clone();
                requestAnimationFrame(()=>{
                    // Only restore focus if we've lost focus to the body, the alternative is that focus has been purposefully moved elsewhere
                    if (ownerDocument.activeElement === ownerDocument.body) {
                        // look up the tree starting with our scope to find a nodeToRestore still in the DOM
                        let treeNode = clonedTree.getTreeNode(scopeRef);
                        while(treeNode){
                            if (treeNode.nodeToRestore && treeNode.nodeToRestore.isConnected) {
                                $9bf71ea28793e738$var$restoreFocusToElement(treeNode.nodeToRestore);
                                return;
                            }
                            treeNode = treeNode.parent;
                        }
                        // If no nodeToRestore was found, focus the first element in the nearest
                        // ancestor scope that is still in the tree.
                        treeNode = clonedTree.getTreeNode(scopeRef);
                        while(treeNode){
                            if (treeNode.scopeRef && treeNode.scopeRef.current && $9bf71ea28793e738$export$d06fae2ee68b101e.getTreeNode(treeNode.scopeRef)) {
                                let node = $9bf71ea28793e738$var$getFirstInScope(treeNode.scopeRef.current, true);
                                $9bf71ea28793e738$var$restoreFocusToElement(node);
                                return;
                            }
                            treeNode = treeNode.parent;
                        }
                    }
                });
            }
        };
    }, [
        scopeRef,
        restoreFocus
    ]);
}
function $9bf71ea28793e738$var$restoreFocusToElement(node) {
    // Dispatch a custom event that parent elements can intercept to customize focus restoration.
    // For example, virtualized collection components reuse DOM elements, so the original element
    // might still exist in the DOM but representing a different item.
    if (node.dispatchEvent(new CustomEvent($9bf71ea28793e738$var$RESTORE_FOCUS_EVENT, {
        bubbles: true,
        cancelable: true
    }))) $9bf71ea28793e738$var$focusElement(node);
}
function FocusScope_$9bf71ea28793e738$export$2d6ec8fc375ceafa(root, opts, scope) {
    let filter = (opts === null || opts === void 0 ? void 0 : opts.tabbable) ? (0, $cgawC$isTabbable) : (0, $cgawC$isFocusable);
    // Ensure that root is an Element or fall back appropriately
    let rootElement = (root === null || root === void 0 ? void 0 : root.nodeType) === Node.ELEMENT_NODE ? root : null;
    // Determine the document to use
    let doc = (0, $cgawC$getOwnerDocument)(rootElement);
    // Create a TreeWalker, ensuring the root is an Element or Document
    let walker = (0, $cgawC$createShadowTreeWalker)(doc, root || doc, NodeFilter.SHOW_ELEMENT, {
        acceptNode (node) {
            var _opts_from;
            // Skip nodes inside the starting node.
            if (opts === null || opts === void 0 ? void 0 : (_opts_from = opts.from) === null || _opts_from === void 0 ? void 0 : _opts_from.contains(node)) return NodeFilter.FILTER_REJECT;
            if ((opts === null || opts === void 0 ? void 0 : opts.tabbable) && node.tagName === 'INPUT' && node.getAttribute('type') === 'radio') {
                // If the radio is in a form, we can get all the other radios by name
                if (!$9bf71ea28793e738$var$isTabbableRadio(node)) return NodeFilter.FILTER_REJECT;
                // If the radio is in the same group as the current node and none are selected, we can skip it
                if (walker.currentNode.tagName === 'INPUT' && walker.currentNode.type === 'radio' && walker.currentNode.name === node.name) return NodeFilter.FILTER_REJECT;
            }
            if (filter(node) && (!scope || $9bf71ea28793e738$var$isElementInScope(node, scope)) && (!(opts === null || opts === void 0 ? void 0 : opts.accept) || opts.accept(node))) return NodeFilter.FILTER_ACCEPT;
            return NodeFilter.FILTER_SKIP;
        }
    });
    if (opts === null || opts === void 0 ? void 0 : opts.from) walker.currentNode = opts.from;
    return walker;
}
function $9bf71ea28793e738$export$c5251b9e124bf29(ref, defaultOptions = {}) {
    return {
        focusNext (opts = {}) {
            let root = ref.current;
            if (!root) return null;
            let { from: from, tabbable: tabbable = defaultOptions.tabbable, wrap: wrap = defaultOptions.wrap, accept: accept = defaultOptions.accept } = opts;
            let node = from || (0, $cgawC$getActiveElement)((0, $cgawC$getOwnerDocument)(root));
            let walker = FocusScope_$9bf71ea28793e738$export$2d6ec8fc375ceafa(root, {
                tabbable: tabbable,
                accept: accept
            });
            if (root.contains(node)) walker.currentNode = node;
            let nextNode = walker.nextNode();
            if (!nextNode && wrap) {
                walker.currentNode = root;
                nextNode = walker.nextNode();
            }
            if (nextNode) $9bf71ea28793e738$var$focusElement(nextNode, true);
            return nextNode;
        },
        focusPrevious (opts = defaultOptions) {
            let root = ref.current;
            if (!root) return null;
            let { from: from, tabbable: tabbable = defaultOptions.tabbable, wrap: wrap = defaultOptions.wrap, accept: accept = defaultOptions.accept } = opts;
            let node = from || (0, $cgawC$getActiveElement)((0, $cgawC$getOwnerDocument)(root));
            let walker = FocusScope_$9bf71ea28793e738$export$2d6ec8fc375ceafa(root, {
                tabbable: tabbable,
                accept: accept
            });
            if (root.contains(node)) walker.currentNode = node;
            else {
                let next = $9bf71ea28793e738$var$last(walker);
                if (next) $9bf71ea28793e738$var$focusElement(next, true);
                return next !== null && next !== void 0 ? next : null;
            }
            let previousNode = walker.previousNode();
            if (!previousNode && wrap) {
                walker.currentNode = root;
                let lastNode = $9bf71ea28793e738$var$last(walker);
                if (!lastNode) // couldn't wrap
                return null;
                previousNode = lastNode;
            }
            if (previousNode) $9bf71ea28793e738$var$focusElement(previousNode, true);
            return previousNode !== null && previousNode !== void 0 ? previousNode : null;
        },
        focusFirst (opts = defaultOptions) {
            let root = ref.current;
            if (!root) return null;
            let { tabbable: tabbable = defaultOptions.tabbable, accept: accept = defaultOptions.accept } = opts;
            let walker = FocusScope_$9bf71ea28793e738$export$2d6ec8fc375ceafa(root, {
                tabbable: tabbable,
                accept: accept
            });
            let nextNode = walker.nextNode();
            if (nextNode) $9bf71ea28793e738$var$focusElement(nextNode, true);
            return nextNode;
        },
        focusLast (opts = defaultOptions) {
            let root = ref.current;
            if (!root) return null;
            let { tabbable: tabbable = defaultOptions.tabbable, accept: accept = defaultOptions.accept } = opts;
            let walker = FocusScope_$9bf71ea28793e738$export$2d6ec8fc375ceafa(root, {
                tabbable: tabbable,
                accept: accept
            });
            let next = $9bf71ea28793e738$var$last(walker);
            if (next) $9bf71ea28793e738$var$focusElement(next, true);
            return next !== null && next !== void 0 ? next : null;
        }
    };
}
function $9bf71ea28793e738$var$last(walker) {
    let next = undefined;
    let last;
    do {
        last = walker.lastChild();
        if (last) next = last;
    }while (last);
    return next;
}
class $9bf71ea28793e738$var$Tree {
    get size() {
        return this.fastMap.size;
    }
    getTreeNode(data) {
        return this.fastMap.get(data);
    }
    addTreeNode(scopeRef, parent, nodeToRestore) {
        let parentNode = this.fastMap.get(parent !== null && parent !== void 0 ? parent : null);
        if (!parentNode) return;
        let node = new $9bf71ea28793e738$var$TreeNode({
            scopeRef: scopeRef
        });
        parentNode.addChild(node);
        node.parent = parentNode;
        this.fastMap.set(scopeRef, node);
        if (nodeToRestore) node.nodeToRestore = nodeToRestore;
    }
    addNode(node) {
        this.fastMap.set(node.scopeRef, node);
    }
    removeTreeNode(scopeRef) {
        // never remove the root
        if (scopeRef === null) return;
        let node = this.fastMap.get(scopeRef);
        if (!node) return;
        let parentNode = node.parent;
        // when we remove a scope, check if any sibling scopes are trying to restore focus to something inside the scope we're removing
        // if we are, then replace the siblings restore with the restore from the scope we're removing
        for (let current of this.traverse())if (current !== node && node.nodeToRestore && current.nodeToRestore && node.scopeRef && node.scopeRef.current && $9bf71ea28793e738$var$isElementInScope(current.nodeToRestore, node.scopeRef.current)) current.nodeToRestore = node.nodeToRestore;
        let children = node.children;
        if (parentNode) {
            parentNode.removeChild(node);
            if (children.size > 0) children.forEach((child)=>parentNode && parentNode.addChild(child));
        }
        this.fastMap.delete(node.scopeRef);
    }
    // Pre Order Depth First
    *traverse(node = this.root) {
        if (node.scopeRef != null) yield node;
        if (node.children.size > 0) for (let child of node.children)yield* this.traverse(child);
    }
    clone() {
        var _node_parent;
        let newTree = new $9bf71ea28793e738$var$Tree();
        var _node_parent_scopeRef;
        for (let node of this.traverse())newTree.addTreeNode(node.scopeRef, (_node_parent_scopeRef = (_node_parent = node.parent) === null || _node_parent === void 0 ? void 0 : _node_parent.scopeRef) !== null && _node_parent_scopeRef !== void 0 ? _node_parent_scopeRef : null, node.nodeToRestore);
        return newTree;
    }
    constructor(){
        this.fastMap = new Map();
        this.root = new $9bf71ea28793e738$var$TreeNode({
            scopeRef: null
        });
        this.fastMap.set(null, this.root);
    }
}
class $9bf71ea28793e738$var$TreeNode {
    addChild(node) {
        this.children.add(node);
        node.parent = this;
    }
    removeChild(node) {
        this.children.delete(node);
        node.parent = undefined;
    }
    constructor(props){
        this.children = new Set();
        this.contain = false;
        this.scopeRef = props.scopeRef;
    }
}
let $9bf71ea28793e738$export$d06fae2ee68b101e = new $9bf71ea28793e738$var$Tree();



//# sourceMappingURL=FocusScope.module.js.map

;// ./node_modules/@react-aria/focus/dist/useFocusRing.mjs





function useFocusRing_$f7dceffc5ad7768b$export$4e328f61c538687f(props = {}) {
    let { autoFocus: autoFocus = false, isTextInput: isTextInput, within: within } = props;
    let state = (0, react.useRef)({
        isFocused: false,
        isFocusVisible: autoFocus || (0, interactions_dist_import/* isFocusVisible */.pP)()
    });
    let [isFocused, setFocused] = (0, react.useState)(false);
    let [isFocusVisibleState, setFocusVisible] = (0, react.useState)(()=>state.current.isFocused && state.current.isFocusVisible);
    let updateState = (0, react.useCallback)(()=>setFocusVisible(state.current.isFocused && state.current.isFocusVisible), []);
    let onFocusChange = (0, react.useCallback)((isFocused)=>{
        state.current.isFocused = isFocused;
        setFocused(isFocused);
        updateState();
    }, [
        updateState
    ]);
    (0, interactions_dist_import/* useFocusVisibleListener */.K7)((isFocusVisible)=>{
        state.current.isFocusVisible = isFocusVisible;
        updateState();
    }, [], {
        isTextInput: isTextInput
    });
    let { focusProps: focusProps } = (0, interactions_dist_import/* useFocus */.iQ)({
        isDisabled: within,
        onFocusChange: onFocusChange
    });
    let { focusWithinProps: focusWithinProps } = (0, interactions_dist_import/* useFocusWithin */.Rb)({
        isDisabled: !within,
        onFocusWithinChange: onFocusChange
    });
    return {
        isFocused: isFocused,
        isFocusVisible: isFocusVisibleState,
        focusProps: within ? focusWithinProps : focusProps
    };
}



//# sourceMappingURL=useFocusRing.module.js.map

// EXTERNAL MODULE: ./node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(34164);
;// ./node_modules/@react-aria/focus/dist/FocusRing.mjs





/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 



function $907718708eab68af$export$1a38b4ad7f578e1d(props) {
    let { children: children, focusClass: focusClass, focusRingClass: focusRingClass } = props;
    let { isFocused: isFocused, isFocusVisible: isFocusVisible, focusProps: focusProps } = (0, $f7dceffc5ad7768b$export$4e328f61c538687f)(props);
    let child = (0, $hAmeg$react).Children.only(children);
    return /*#__PURE__*/ (0, $hAmeg$react).cloneElement(child, (0, $hAmeg$mergeProps)(child.props, {
        ...focusProps,
        className: (0, $hAmeg$clsx)({
            [focusClass || '']: isFocused,
            [focusRingClass || '']: isFocusVisible
        })
    }));
}



//# sourceMappingURL=FocusRing.module.js.map

;// ./node_modules/@react-aria/focus/dist/useHasTabbableChild.mjs




/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 


function $83013635b024ae3d$export$eac1895992b9f3d6(ref, options) {
    let isDisabled = options === null || options === void 0 ? void 0 : options.isDisabled;
    let [hasTabbableChild, setHasTabbableChild] = (0, $hGAaG$useState)(false);
    (0, $hGAaG$useLayoutEffect)(()=>{
        if ((ref === null || ref === void 0 ? void 0 : ref.current) && !isDisabled) {
            let update = ()=>{
                if (ref.current) {
                    let walker = (0, $9bf71ea28793e738$export$2d6ec8fc375ceafa)(ref.current, {
                        tabbable: true
                    });
                    setHasTabbableChild(!!walker.nextNode());
                }
            };
            update();
            // Update when new elements are inserted, or the tabIndex/disabled attribute updates.
            let observer = new MutationObserver(update);
            observer.observe(ref.current, {
                subtree: true,
                childList: true,
                attributes: true,
                attributeFilter: [
                    'tabIndex',
                    'disabled'
                ]
            });
            return ()=>{
                // Disconnect mutation observer when a React update occurs on the top-level component
                // so we update synchronously after re-rendering. Otherwise React will emit act warnings
                // in tests since mutation observers fire asynchronously. The mutation observer is necessary
                // so we also update if a child component re-renders and adds/removes something tabbable.
                observer.disconnect();
            };
        }
    });
    return isDisabled ? false : hasTabbableChild;
}



//# sourceMappingURL=useHasTabbableChild.module.js.map

;// ./node_modules/@react-aria/focus/dist/virtualFocus.mjs



function $55f9b1ae81f22853$export$76e4e37e5339496d(to) {
    let from = $55f9b1ae81f22853$export$759df0d867455a91((0, $hpDQO$getOwnerDocument)(to));
    if (from !== to) {
        if (from) $55f9b1ae81f22853$export$6c5dc7e81d2cc29a(from, to);
        if (to) $55f9b1ae81f22853$export$2b35b76d2e30e129(to, from);
    }
}
function $55f9b1ae81f22853$export$6c5dc7e81d2cc29a(from, to) {
    from.dispatchEvent(new FocusEvent('blur', {
        relatedTarget: to
    }));
    from.dispatchEvent(new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: to
    }));
}
function $55f9b1ae81f22853$export$2b35b76d2e30e129(to, from) {
    to.dispatchEvent(new FocusEvent('focus', {
        relatedTarget: from
    }));
    to.dispatchEvent(new FocusEvent('focusin', {
        bubbles: true,
        relatedTarget: from
    }));
}
function $55f9b1ae81f22853$export$759df0d867455a91(document) {
    let activeElement = (0, $hpDQO$getActiveElement)(document);
    let activeDescendant = activeElement === null || activeElement === void 0 ? void 0 : activeElement.getAttribute('aria-activedescendant');
    if (activeDescendant) return document.getElementById(activeDescendant) || activeElement;
    return activeElement;
}



//# sourceMappingURL=virtualFocus.module.js.map

;// ./node_modules/@react-aria/focus/dist/import.mjs








/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 









//# sourceMappingURL=module.js.map


/***/ }),

/***/ 93146:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var now = __webpack_require__(13491)
  , root = typeof window === 'undefined' ? window : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix]
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
}
module.exports.cancel = function() {
  caf.apply(root, arguments)
}
module.exports.polyfill = function(object) {
  if (!object) {
    object = root;
  }
  object.requestAnimationFrame = raf
  object.cancelAnimationFrame = caf
}


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi1kOTYxMDVlYy43NzY1NDdiOWU3NjI5MmNmYWMyNS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBZ007O0FBRWhNO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJEQUEyRCxLQUFZO0FBQ3ZFLDZEQUE2RCxLQUFZO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyRUFBMkUsV0FBVyxHQUFHLFFBQVE7QUFDakc7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksS0FBd0U7QUFDcEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsZ0JBQWlCO0FBQ25DLGtCQUFrQixZQUFhO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEZBQTRGLEtBQVk7QUFDeEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixnQkFBaUI7QUFDbkM7QUFDQTtBQUNBLDRGQUE0RixhQUFvQjtBQUNoSDtBQUNBLGlFQUFpRSxhQUFvQixjQUFjLENBQVksZ0JBQWdCLFdBQVc7QUFDMUksMkJBQTJCLE9BQU8sR0FBRyxRQUFRO0FBQzdDO0FBQ0E7QUFDQSxpQkFBaUIsS0FBWTtBQUM3Qix1QkFBdUIsY0FBZTtBQUN0QywyQkFBMkIsYUFBb0IsMENBQTBDLDRDQUE0QztBQUNySSwyQkFBMkIsT0FBTyxHQUFHLEdBQUc7QUFDeEM7QUFDQSw2REFBNkQsS0FBWTtBQUN6RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixLQUFZLHFEQUFxRCxLQUFZO0FBQ2hHO0FBQ0EsZUFBZSxnQkFBaUI7QUFDaEM7OztBQUdvTDtBQUNwTDs7O0FDOUk2TTs7QUFFN007QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR29MO0FBQ3BMOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hCd1A7QUFDdks7O0FBRWpGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUyw4Q0FBd0M7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsK0NBQXlDO0FBQ2xEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsdUJBQXVCLFlBQWE7QUFDcEM7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFFBQVEsbUNBQXNCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLDJCQUEyQixrQ0FBcUI7QUFDaEQ7QUFDQSxLQUFLO0FBQ0w7QUFDQSxlQUFlLGlCQUFrQjtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLDhDQUF3QztBQUN4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsK0NBQXlDO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR3FVO0FBQ3JVOzs7QUM1SnNKOztBQUV0SjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsdURBQXlDO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyx1REFBeUM7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVCxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRzhJO0FBQzlJOzs7QUN0RWlDOztBQUVqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxpREFBeUMsT0FBTyxLQUFZO0FBQ2xFO0FBQ0EsQ0FBQztBQUNELGlEQUF5Qzs7O0FBR21DO0FBQzVFOzs7Ozs7Ozs7OztBQ3BCcU47QUFDNUM7QUFDeEU7QUFDM0I7QUFDRTtBQUNEO0FBQzRmO0FBQzNnQjtBQUM4Rzs7QUFFdEs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxzQ0FBc0M7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyxrREFBeUM7QUFDbEQsVUFBVSwrV0FBK1c7QUFDelg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxVQUFVLDJGQUEyRjtBQUNyRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0I7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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O0FBQUEsRUFxQjNDO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHeUU7QUFDekU7OztBQ3RHeUs7QUFDaEc7QUFDa0Q7O0FBRTNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0EsVUFBVSxpRUFBaUU7QUFDM0U7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsVUFBVSxtRkFBbUY7QUFDN0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQsYUFBb0IsYUFBYTtBQUFBLEVBMEUzRSxDQUFDO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLGNBQWM7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLG9EQUF5QztBQUMxRDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLG9EQUF5QztBQUMxRDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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Q0E7OztBQUcwRTtBQUMxRTs7O0FDeEQySDs7O0FBRzNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdxUjtBQUNyUjs7O0FDckN3VztBQUNqUjtBQUNNO0FBQ2M7QUFDb007QUFDdE47QUFDeUw7O0FBRWxSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7OztBQVNvakM7QUFDcGpDOzs7Ozs7OztBQzVCQSxVQUFVLG1CQUFPLENBQUMsS0FBaUI7QUFDbkMsMkNBQTJDLE1BQU07QUFDakQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZUFBZSw0QkFBNEI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsZUFBZTtBQUN0QztBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Qsc0NBQXNDLFNBQVM7QUFDL0M7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBLG1CQUFtQixrQkFBa0I7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0EsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL3Nzci9kaXN0L1NTUlByb3ZpZGVyLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS9zc3IvZGlzdC9pbXBvcnQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL2ludGVyYWN0aW9ucy9kaXN0L3V0aWxzLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS9pbnRlcmFjdGlvbnMvZGlzdC90ZXh0U2VsZWN0aW9uLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS9pbnRlcmFjdGlvbnMvZGlzdC9jb250ZXh0Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS9pbnRlcmFjdGlvbnMvZGlzdC91c2VQcmVzcy5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvaW50ZXJhY3Rpb25zL2Rpc3QvdXNlRm9jdXNWaXNpYmxlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS9pbnRlcmFjdGlvbnMvZGlzdC9mb2N1c1NhZmVseS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvaW50ZXJhY3Rpb25zL2Rpc3QvdXNlRm9jdXMubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL2ludGVyYWN0aW9ucy9kaXN0L2NyZWF0ZUV2ZW50SGFuZGxlci5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvaW50ZXJhY3Rpb25zL2Rpc3QvdXNlS2V5Ym9hcmQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL2ludGVyYWN0aW9ucy9kaXN0L3VzZUZvY3VzYWJsZS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvaW50ZXJhY3Rpb25zL2Rpc3QvUHJlc3NhYmxlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS9pbnRlcmFjdGlvbnMvZGlzdC9QcmVzc1Jlc3BvbmRlci5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvaW50ZXJhY3Rpb25zL2Rpc3QvdXNlRm9jdXNXaXRoaW4ubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL2ludGVyYWN0aW9ucy9kaXN0L3VzZUhvdmVyLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS9pbnRlcmFjdGlvbnMvZGlzdC91c2VJbnRlcmFjdE91dHNpZGUubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL2ludGVyYWN0aW9ucy9kaXN0L3VzZU1vdmUubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL2ludGVyYWN0aW9ucy9kaXN0L3VzZVNjcm9sbFdoZWVsLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS9pbnRlcmFjdGlvbnMvZGlzdC91c2VMb25nUHJlc3MubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL2ludGVyYWN0aW9ucy9kaXN0L2ltcG9ydC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvZm9jdXMvZGlzdC9Gb2N1c1Njb3BlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS9mb2N1cy9kaXN0L3VzZUZvY3VzUmluZy5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvZm9jdXMvZGlzdC9Gb2N1c1JpbmcubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL2ZvY3VzL2Rpc3QvdXNlSGFzVGFiYmFibGVDaGlsZC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvZm9jdXMvZGlzdC92aXJ0dWFsRm9jdXMubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL2ZvY3VzL2Rpc3QvaW1wb3J0Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yYWYvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICQ2NzBnQiRyZWFjdCwge3VzZUNvbnRleHQgYXMgJDY3MGdCJHVzZUNvbnRleHQsIHVzZVN0YXRlIGFzICQ2NzBnQiR1c2VTdGF0ZSwgdXNlTWVtbyBhcyAkNjcwZ0IkdXNlTWVtbywgdXNlTGF5b3V0RWZmZWN0IGFzICQ2NzBnQiR1c2VMYXlvdXRFZmZlY3QsIHVzZVJlZiBhcyAkNjcwZ0IkdXNlUmVmfSBmcm9tIFwicmVhY3RcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIC8vIFdlIG11c3QgYXZvaWQgYSBjaXJjdWxhciBkZXBlbmRlbmN5IHdpdGggQHJlYWN0LWFyaWEvdXRpbHMsIGFuZCB0aGlzIHVzZUxheW91dEVmZmVjdCBpc1xuLy8gZ3VhcmRlZCBieSBhIGNoZWNrIHRoYXQgaXQgb25seSBydW5zIG9uIHRoZSBjbGllbnQgc2lkZS5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBydWxlc2Rpci91c2VMYXlvdXRFZmZlY3RSdWxlXG5cbi8vIERlZmF1bHQgY29udGV4dCB2YWx1ZSB0byB1c2UgaW4gY2FzZSB0aGVyZSBpcyBubyBTU1JQcm92aWRlci4gVGhpcyBpcyBmaW5lIGZvclxuLy8gY2xpZW50LW9ubHkgYXBwcy4gSW4gb3JkZXIgdG8gc3VwcG9ydCBtdWx0aXBsZSBjb3BpZXMgb2YgUmVhY3QgQXJpYSBwb3RlbnRpYWxseVxuLy8gYmVpbmcgb24gdGhlIHBhZ2UgYXQgb25jZSwgdGhlIHByZWZpeCBpcyBzZXQgdG8gYSByYW5kb20gbnVtYmVyLiBTU1JQcm92aWRlclxuLy8gd2lsbCByZXNldCB0aGlzIHRvIHplcm8gZm9yIGNvbnNpc3RlbmN5IGJldHdlZW4gc2VydmVyIGFuZCBjbGllbnQsIHNvIGluIHRoZVxuLy8gU1NSIGNhc2UgbXVsdGlwbGUgY29waWVzIG9mIFJlYWN0IEFyaWEgaXMgbm90IHN1cHBvcnRlZC5cbmNvbnN0ICRiNWUyNTdkNTY5Njg4YWM2JHZhciRkZWZhdWx0Q29udGV4dCA9IHtcbiAgICBwcmVmaXg6IFN0cmluZyhNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwMDAwMCkpLFxuICAgIGN1cnJlbnQ6IDBcbn07XG5jb25zdCAkYjVlMjU3ZDU2OTY4OGFjNiR2YXIkU1NSQ29udGV4dCA9IC8qI19fUFVSRV9fKi8gKDAsICQ2NzBnQiRyZWFjdCkuY3JlYXRlQ29udGV4dCgkYjVlMjU3ZDU2OTY4OGFjNiR2YXIkZGVmYXVsdENvbnRleHQpO1xuY29uc3QgJGI1ZTI1N2Q1Njk2ODhhYzYkdmFyJElzU1NSQ29udGV4dCA9IC8qI19fUFVSRV9fKi8gKDAsICQ2NzBnQiRyZWFjdCkuY3JlYXRlQ29udGV4dChmYWxzZSk7XG4vLyBUaGlzIGlzIG9ubHkgdXNlZCBpbiBSZWFjdCA8IDE4LlxuZnVuY3Rpb24gJGI1ZTI1N2Q1Njk2ODhhYzYkdmFyJExlZ2FjeVNTUlByb3ZpZGVyKHByb3BzKSB7XG4gICAgbGV0IGN1ciA9ICgwLCAkNjcwZ0IkdXNlQ29udGV4dCkoJGI1ZTI1N2Q1Njk2ODhhYzYkdmFyJFNTUkNvbnRleHQpO1xuICAgIGxldCBjb3VudGVyID0gJGI1ZTI1N2Q1Njk2ODhhYzYkdmFyJHVzZUNvdW50ZXIoY3VyID09PSAkYjVlMjU3ZDU2OTY4OGFjNiR2YXIkZGVmYXVsdENvbnRleHQpO1xuICAgIGxldCBbaXNTU1IsIHNldElzU1NSXSA9ICgwLCAkNjcwZ0IkdXNlU3RhdGUpKHRydWUpO1xuICAgIGxldCB2YWx1ZSA9ICgwLCAkNjcwZ0IkdXNlTWVtbykoKCk9Pih7XG4gICAgICAgICAgICAvLyBJZiB0aGlzIGlzIHRoZSBmaXJzdCBTU1JQcm92aWRlciwgc3RhcnQgd2l0aCBhbiBlbXB0eSBzdHJpbmcgcHJlZml4LCBvdGhlcndpc2VcbiAgICAgICAgICAgIC8vIGFwcGVuZCBhbmQgaW5jcmVtZW50IHRoZSBjb3VudGVyLlxuICAgICAgICAgICAgcHJlZml4OiBjdXIgPT09ICRiNWUyNTdkNTY5Njg4YWM2JHZhciRkZWZhdWx0Q29udGV4dCA/ICcnIDogYCR7Y3VyLnByZWZpeH0tJHtjb3VudGVyfWAsXG4gICAgICAgICAgICBjdXJyZW50OiAwXG4gICAgICAgIH0pLCBbXG4gICAgICAgIGN1cixcbiAgICAgICAgY291bnRlclxuICAgIF0pO1xuICAgIC8vIElmIG9uIHRoZSBjbGllbnQsIGFuZCB0aGUgY29tcG9uZW50IHdhcyBpbml0aWFsbHkgc2VydmVyIHJlbmRlcmVkLFxuICAgIC8vIHRoZW4gc2NoZWR1bGUgYSBsYXlvdXQgZWZmZWN0IHRvIHVwZGF0ZSB0aGUgY29tcG9uZW50IGFmdGVyIGh5ZHJhdGlvbi5cbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykgLy8gVGhpcyBpZiBzdGF0ZW1lbnQgdGVjaG5pY2FsbHkgYnJlYWtzIHRoZSBydWxlcyBvZiBob29rcywgYnV0IGlzIHNhZmVcbiAgICAvLyBiZWNhdXNlIHRoZSBjb25kaXRpb24gbmV2ZXIgY2hhbmdlcyBhZnRlciBtb3VudGluZy5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvcnVsZXMtb2YtaG9va3NcbiAgICAoMCwgJDY3MGdCJHVzZUxheW91dEVmZmVjdCkoKCk9PntcbiAgICAgICAgc2V0SXNTU1IoZmFsc2UpO1xuICAgIH0sIFtdKTtcbiAgICByZXR1cm4gLyojX19QVVJFX18qLyAoMCwgJDY3MGdCJHJlYWN0KS5jcmVhdGVFbGVtZW50KCRiNWUyNTdkNTY5Njg4YWM2JHZhciRTU1JDb250ZXh0LlByb3ZpZGVyLCB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH0sIC8qI19fUFVSRV9fKi8gKDAsICQ2NzBnQiRyZWFjdCkuY3JlYXRlRWxlbWVudCgkYjVlMjU3ZDU2OTY4OGFjNiR2YXIkSXNTU1JDb250ZXh0LlByb3ZpZGVyLCB7XG4gICAgICAgIHZhbHVlOiBpc1NTUlxuICAgIH0sIHByb3BzLmNoaWxkcmVuKSk7XG59XG5sZXQgJGI1ZTI1N2Q1Njk2ODhhYzYkdmFyJHdhcm5lZEFib3V0U1NSUHJvdmlkZXIgPSBmYWxzZTtcbmZ1bmN0aW9uICRiNWUyNTdkNTY5Njg4YWM2JGV4cG9ydCQ5ZjhhYzk2YWY0YjFiMmFlKHByb3BzKSB7XG4gICAgaWYgKHR5cGVvZiAoMCwgJDY3MGdCJHJlYWN0KVsndXNlSWQnXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICd0ZXN0JyAmJiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmICEkYjVlMjU3ZDU2OTY4OGFjNiR2YXIkd2FybmVkQWJvdXRTU1JQcm92aWRlcikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdJbiBSZWFjdCAxOCwgU1NSUHJvdmlkZXIgaXMgbm90IG5lY2Vzc2FyeSBhbmQgaXMgYSBub29wLiBZb3UgY2FuIHJlbW92ZSBpdCBmcm9tIHlvdXIgYXBwLicpO1xuICAgICAgICAgICAgJGI1ZTI1N2Q1Njk2ODhhYzYkdmFyJHdhcm5lZEFib3V0U1NSUHJvdmlkZXIgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAvKiNfX1BVUkVfXyovICgwLCAkNjcwZ0IkcmVhY3QpLmNyZWF0ZUVsZW1lbnQoKDAsICQ2NzBnQiRyZWFjdCkuRnJhZ21lbnQsIG51bGwsIHByb3BzLmNoaWxkcmVuKTtcbiAgICB9XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gKDAsICQ2NzBnQiRyZWFjdCkuY3JlYXRlRWxlbWVudCgkYjVlMjU3ZDU2OTY4OGFjNiR2YXIkTGVnYWN5U1NSUHJvdmlkZXIsIHByb3BzKTtcbn1cbmxldCAkYjVlMjU3ZDU2OTY4OGFjNiR2YXIkY2FuVXNlRE9NID0gQm9vbGVhbih0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuZG9jdW1lbnQgJiYgd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xubGV0ICRiNWUyNTdkNTY5Njg4YWM2JHZhciRjb21wb25lbnRJZHMgPSBuZXcgV2Vha01hcCgpO1xuZnVuY3Rpb24gJGI1ZTI1N2Q1Njk2ODhhYzYkdmFyJHVzZUNvdW50ZXIoaXNEaXNhYmxlZCA9IGZhbHNlKSB7XG4gICAgbGV0IGN0eCA9ICgwLCAkNjcwZ0IkdXNlQ29udGV4dCkoJGI1ZTI1N2Q1Njk2ODhhYzYkdmFyJFNTUkNvbnRleHQpO1xuICAgIGxldCByZWYgPSAoMCwgJDY3MGdCJHVzZVJlZikobnVsbCk7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJ1bGVzZGlyL3B1cmUtcmVuZGVyXG4gICAgaWYgKHJlZi5jdXJyZW50ID09PSBudWxsICYmICFpc0Rpc2FibGVkKSB7XG4gICAgICAgIHZhciBfUmVhY3RfX19TRUNSRVRfSU5URVJOQUxTX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRURfUmVhY3RDdXJyZW50T3duZXIsIF9SZWFjdF9fX1NFQ1JFVF9JTlRFUk5BTFNfRE9fTk9UX1VTRV9PUl9ZT1VfV0lMTF9CRV9GSVJFRDtcbiAgICAgICAgLy8gSW4gc3RyaWN0IG1vZGUsIFJlYWN0IHJlbmRlcnMgY29tcG9uZW50cyB0d2ljZSwgYW5kIHRoZSByZWYgd2lsbCBiZSByZXNldCB0byBudWxsIG9uIHRoZSBzZWNvbmQgcmVuZGVyLlxuICAgICAgICAvLyBUaGlzIG1lYW5zIG91ciBpZCBjb3VudGVyIHdpbGwgYmUgaW5jcmVtZW50ZWQgdHdpY2UgaW5zdGVhZCBvZiBvbmNlLiBUaGlzIGlzIGEgcHJvYmxlbSBiZWNhdXNlIG9uIHRoZVxuICAgICAgICAvLyBzZXJ2ZXIsIGNvbXBvbmVudHMgYXJlIG9ubHkgcmVuZGVyZWQgb25jZSBhbmQgc28gaWRzIGdlbmVyYXRlZCBvbiB0aGUgc2VydmVyIHdvbid0IG1hdGNoIHRoZSBjbGllbnQuXG4gICAgICAgIC8vIEluIFJlYWN0IDE4LCB1c2VJZCB3YXMgaW50cm9kdWNlZCB0byBzb2x2ZSB0aGlzLCBidXQgaXQgaXMgbm90IGF2YWlsYWJsZSBpbiBvbGRlciB2ZXJzaW9ucy4gU28gdG8gc29sdmUgdGhpc1xuICAgICAgICAvLyB3ZSBuZWVkIHRvIHVzZSBzb21lIFJlYWN0IGludGVybmFscyB0byBhY2Nlc3MgdGhlIHVuZGVybHlpbmcgRmliZXIgaW5zdGFuY2UsIHdoaWNoIGlzIHN0YWJsZSBiZXR3ZWVuIHJlbmRlcnMuXG4gICAgICAgIC8vIFRoaXMgaXMgZXhwb3NlZCBhcyBSZWFjdEN1cnJlbnRPd25lciBpbiBkZXZlbG9wbWVudCwgd2hpY2ggaXMgYWxsIHdlIG5lZWQgc2luY2UgU3RyaWN0TW9kZSBvbmx5IHJ1bnMgaW4gZGV2ZWxvcG1lbnQuXG4gICAgICAgIC8vIFRvIGVuc3VyZSB0aGF0IHdlIG9ubHkgaW5jcmVtZW50IHRoZSBnbG9iYWwgY291bnRlciBvbmNlLCB3ZSBzdG9yZSB0aGUgc3RhcnRpbmcgaWQgZm9yIHRoaXMgY29tcG9uZW50IGluXG4gICAgICAgIC8vIGEgd2VhayBtYXAgYXNzb2NpYXRlZCB3aXRoIHRoZSBGaWJlci4gT24gdGhlIHNlY29uZCByZW5kZXIsIHdlIHJlc2V0IHRoZSBnbG9iYWwgY291bnRlciB0byB0aGlzIHZhbHVlLlxuICAgICAgICAvLyBTaW5jZSBSZWFjdCBydW5zIHRoZSBzZWNvbmQgcmVuZGVyIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBmaXJzdCwgdGhpcyBpcyBzYWZlLlxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGxldCBjdXJyZW50T3duZXIgPSAoX1JlYWN0X19fU0VDUkVUX0lOVEVSTkFMU19ET19OT1RfVVNFX09SX1lPVV9XSUxMX0JFX0ZJUkVEID0gKDAsICQ2NzBnQiRyZWFjdCkuX19TRUNSRVRfSU5URVJOQUxTX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRUQpID09PSBudWxsIHx8IF9SZWFjdF9fX1NFQ1JFVF9JTlRFUk5BTFNfRE9fTk9UX1VTRV9PUl9ZT1VfV0lMTF9CRV9GSVJFRCA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9SZWFjdF9fX1NFQ1JFVF9JTlRFUk5BTFNfRE9fTk9UX1VTRV9PUl9ZT1VfV0lMTF9CRV9GSVJFRF9SZWFjdEN1cnJlbnRPd25lciA9IF9SZWFjdF9fX1NFQ1JFVF9JTlRFUk5BTFNfRE9fTk9UX1VTRV9PUl9ZT1VfV0lMTF9CRV9GSVJFRC5SZWFjdEN1cnJlbnRPd25lcikgPT09IG51bGwgfHwgX1JlYWN0X19fU0VDUkVUX0lOVEVSTkFMU19ET19OT1RfVVNFX09SX1lPVV9XSUxMX0JFX0ZJUkVEX1JlYWN0Q3VycmVudE93bmVyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfUmVhY3RfX19TRUNSRVRfSU5URVJOQUxTX0RPX05PVF9VU0VfT1JfWU9VX1dJTExfQkVfRklSRURfUmVhY3RDdXJyZW50T3duZXIuY3VycmVudDtcbiAgICAgICAgaWYgKGN1cnJlbnRPd25lcikge1xuICAgICAgICAgICAgbGV0IHByZXZDb21wb25lbnRWYWx1ZSA9ICRiNWUyNTdkNTY5Njg4YWM2JHZhciRjb21wb25lbnRJZHMuZ2V0KGN1cnJlbnRPd25lcik7XG4gICAgICAgICAgICBpZiAocHJldkNvbXBvbmVudFZhbHVlID09IG51bGwpIC8vIE9uIHRoZSBmaXJzdCByZW5kZXIsIGFuZCBmaXJzdCBjYWxsIHRvIHVzZUlkLCBzdG9yZSB0aGUgaWQgYW5kIHN0YXRlIGluIG91ciB3ZWFrIG1hcC5cbiAgICAgICAgICAgICRiNWUyNTdkNTY5Njg4YWM2JHZhciRjb21wb25lbnRJZHMuc2V0KGN1cnJlbnRPd25lciwge1xuICAgICAgICAgICAgICAgIGlkOiBjdHguY3VycmVudCxcbiAgICAgICAgICAgICAgICBzdGF0ZTogY3VycmVudE93bmVyLm1lbW9pemVkU3RhdGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZWxzZSBpZiAoY3VycmVudE93bmVyLm1lbW9pemVkU3RhdGUgIT09IHByZXZDb21wb25lbnRWYWx1ZS5zdGF0ZSkge1xuICAgICAgICAgICAgICAgIC8vIE9uIHRoZSBzZWNvbmQgcmVuZGVyLCB0aGUgbWVtb2l6ZWRTdGF0ZSBnZXRzIHJlc2V0IGJ5IFJlYWN0LlxuICAgICAgICAgICAgICAgIC8vIFJlc2V0IHRoZSBjb3VudGVyLCBhbmQgcmVtb3ZlIGZyb20gdGhlIHdlYWsgbWFwIHNvIHdlIGRvbid0XG4gICAgICAgICAgICAgICAgLy8gZG8gdGhpcyBmb3Igc3Vic2VxdWVudCB1c2VJZCBjYWxscy5cbiAgICAgICAgICAgICAgICBjdHguY3VycmVudCA9IHByZXZDb21wb25lbnRWYWx1ZS5pZDtcbiAgICAgICAgICAgICAgICAkYjVlMjU3ZDU2OTY4OGFjNiR2YXIkY29tcG9uZW50SWRzLmRlbGV0ZShjdXJyZW50T3duZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBydWxlc2Rpci9wdXJlLXJlbmRlclxuICAgICAgICByZWYuY3VycmVudCA9ICsrY3R4LmN1cnJlbnQ7XG4gICAgfVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBydWxlc2Rpci9wdXJlLXJlbmRlclxuICAgIHJldHVybiByZWYuY3VycmVudDtcbn1cbmZ1bmN0aW9uICRiNWUyNTdkNTY5Njg4YWM2JHZhciR1c2VMZWdhY3lTU1JTYWZlSWQoZGVmYXVsdElkKSB7XG4gICAgbGV0IGN0eCA9ICgwLCAkNjcwZ0IkdXNlQ29udGV4dCkoJGI1ZTI1N2Q1Njk2ODhhYzYkdmFyJFNTUkNvbnRleHQpO1xuICAgIC8vIElmIHdlIGFyZSByZW5kZXJpbmcgaW4gYSBub24tRE9NIGVudmlyb25tZW50LCBhbmQgdGhlcmUncyBubyBTU1JQcm92aWRlcixcbiAgICAvLyBwcm92aWRlIGEgd2FybmluZyB0byBoaW50IHRvIHRoZSBkZXZlbG9wZXIgdG8gYWRkIG9uZS5cbiAgICBpZiAoY3R4ID09PSAkYjVlMjU3ZDU2OTY4OGFjNiR2YXIkZGVmYXVsdENvbnRleHQgJiYgISRiNWUyNTdkNTY5Njg4YWM2JHZhciRjYW5Vc2VET00gJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykgY29uc29sZS53YXJuKCdXaGVuIHNlcnZlciByZW5kZXJpbmcsIHlvdSBtdXN0IHdyYXAgeW91ciBhcHBsaWNhdGlvbiBpbiBhbiA8U1NSUHJvdmlkZXI+IHRvIGVuc3VyZSBjb25zaXN0ZW50IGlkcyBhcmUgZ2VuZXJhdGVkIGJldHdlZW4gdGhlIGNsaWVudCBhbmQgc2VydmVyLicpO1xuICAgIGxldCBjb3VudGVyID0gJGI1ZTI1N2Q1Njk2ODhhYzYkdmFyJHVzZUNvdW50ZXIoISFkZWZhdWx0SWQpO1xuICAgIGxldCBwcmVmaXggPSBjdHggPT09ICRiNWUyNTdkNTY5Njg4YWM2JHZhciRkZWZhdWx0Q29udGV4dCAmJiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Rlc3QnID8gJ3JlYWN0LWFyaWEnIDogYHJlYWN0LWFyaWEke2N0eC5wcmVmaXh9YDtcbiAgICByZXR1cm4gZGVmYXVsdElkIHx8IGAke3ByZWZpeH0tJHtjb3VudGVyfWA7XG59XG5mdW5jdGlvbiAkYjVlMjU3ZDU2OTY4OGFjNiR2YXIkdXNlTW9kZXJuU1NSU2FmZUlkKGRlZmF1bHRJZCkge1xuICAgIGxldCBpZCA9ICgwLCAkNjcwZ0IkcmVhY3QpLnVzZUlkKCk7XG4gICAgbGV0IFtkaWRTU1JdID0gKDAsICQ2NzBnQiR1c2VTdGF0ZSkoJGI1ZTI1N2Q1Njk2ODhhYzYkZXhwb3J0JDUzNWJkNmNhN2Y5MGEyNzMoKSk7XG4gICAgbGV0IHByZWZpeCA9IGRpZFNTUiB8fCBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Rlc3QnID8gJ3JlYWN0LWFyaWEnIDogYHJlYWN0LWFyaWEkeyRiNWUyNTdkNTY5Njg4YWM2JHZhciRkZWZhdWx0Q29udGV4dC5wcmVmaXh9YDtcbiAgICByZXR1cm4gZGVmYXVsdElkIHx8IGAke3ByZWZpeH0tJHtpZH1gO1xufVxuY29uc3QgJGI1ZTI1N2Q1Njk2ODhhYzYkZXhwb3J0JDYxOTUwMDk1OWZjNDhiMjYgPSB0eXBlb2YgKDAsICQ2NzBnQiRyZWFjdClbJ3VzZUlkJ10gPT09ICdmdW5jdGlvbicgPyAkYjVlMjU3ZDU2OTY4OGFjNiR2YXIkdXNlTW9kZXJuU1NSU2FmZUlkIDogJGI1ZTI1N2Q1Njk2ODhhYzYkdmFyJHVzZUxlZ2FjeVNTUlNhZmVJZDtcbmZ1bmN0aW9uICRiNWUyNTdkNTY5Njg4YWM2JHZhciRnZXRTbmFwc2hvdCgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiAkYjVlMjU3ZDU2OTY4OGFjNiR2YXIkZ2V0U2VydmVyU25hcHNob3QoKSB7XG4gICAgcmV0dXJuIHRydWU7XG59XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5mdW5jdGlvbiAkYjVlMjU3ZDU2OTY4OGFjNiR2YXIkc3Vic2NyaWJlKG9uU3RvcmVDaGFuZ2UpIHtcbiAgICAvLyBub29wXG4gICAgcmV0dXJuICgpPT57fTtcbn1cbmZ1bmN0aW9uICRiNWUyNTdkNTY5Njg4YWM2JGV4cG9ydCQ1MzViZDZjYTdmOTBhMjczKCkge1xuICAgIC8vIEluIFJlYWN0IDE4LCB3ZSBjYW4gdXNlIHVzZVN5bmNFeHRlcm5hbFN0b3JlIHRvIGRldGVjdCBpZiB3ZSdyZSBzZXJ2ZXIgcmVuZGVyaW5nIG9yIGh5ZHJhdGluZy5cbiAgICBpZiAodHlwZW9mICgwLCAkNjcwZ0IkcmVhY3QpWyd1c2VTeW5jRXh0ZXJuYWxTdG9yZSddID09PSAnZnVuY3Rpb24nKSByZXR1cm4gKDAsICQ2NzBnQiRyZWFjdClbJ3VzZVN5bmNFeHRlcm5hbFN0b3JlJ10oJGI1ZTI1N2Q1Njk2ODhhYzYkdmFyJHN1YnNjcmliZSwgJGI1ZTI1N2Q1Njk2ODhhYzYkdmFyJGdldFNuYXBzaG90LCAkYjVlMjU3ZDU2OTY4OGFjNiR2YXIkZ2V0U2VydmVyU25hcHNob3QpO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9ydWxlcy1vZi1ob29rc1xuICAgIHJldHVybiAoMCwgJDY3MGdCJHVzZUNvbnRleHQpKCRiNWUyNTdkNTY5Njg4YWM2JHZhciRJc1NTUkNvbnRleHQpO1xufVxuXG5cbmV4cG9ydCB7JGI1ZTI1N2Q1Njk2ODhhYzYkZXhwb3J0JDlmOGFjOTZhZjRiMWIyYWUgYXMgU1NSUHJvdmlkZXIsICRiNWUyNTdkNTY5Njg4YWM2JGV4cG9ydCQ1MzViZDZjYTdmOTBhMjczIGFzIHVzZUlzU1NSLCAkYjVlMjU3ZDU2OTY4OGFjNiRleHBvcnQkNjE5NTAwOTU5ZmM0OGIyNiBhcyB1c2VTU1JTYWZlSWR9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9U1NSUHJvdmlkZXIubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHtTU1JQcm92aWRlciBhcyAkYjVlMjU3ZDU2OTY4OGFjNiRleHBvcnQkOWY4YWM5NmFmNGIxYjJhZSwgdXNlSXNTU1IgYXMgJGI1ZTI1N2Q1Njk2ODhhYzYkZXhwb3J0JDUzNWJkNmNhN2Y5MGEyNzMsIHVzZVNTUlNhZmVJZCBhcyAkYjVlMjU3ZDU2OTY4OGFjNiRleHBvcnQkNjE5NTAwOTU5ZmM0OGIyNn0gZnJvbSBcIi4vU1NSUHJvdmlkZXIubWpzXCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcblxuXG5leHBvcnQgeyRiNWUyNTdkNTY5Njg4YWM2JGV4cG9ydCQ5ZjhhYzk2YWY0YjFiMmFlIGFzIFNTUlByb3ZpZGVyLCAkYjVlMjU3ZDU2OTY4OGFjNiRleHBvcnQkNjE5NTAwOTU5ZmM0OGIyNiBhcyB1c2VTU1JTYWZlSWQsICRiNWUyNTdkNTY5Njg4YWM2JGV4cG9ydCQ1MzViZDZjYTdmOTBhMjczIGFzIHVzZUlzU1NSfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7dXNlTGF5b3V0RWZmZWN0IGFzICQ2ZGZJZSR1c2VMYXlvdXRFZmZlY3QsIHVzZUVmZmVjdEV2ZW50IGFzICQ2ZGZJZSR1c2VFZmZlY3RFdmVudCwgaXNGb2N1c2FibGUgYXMgJDZkZkllJGlzRm9jdXNhYmxlLCBnZXRPd25lcldpbmRvdyBhcyAkNmRmSWUkZ2V0T3duZXJXaW5kb3csIGZvY3VzV2l0aG91dFNjcm9sbGluZyBhcyAkNmRmSWUkZm9jdXNXaXRob3V0U2Nyb2xsaW5nfSBmcm9tIFwiQHJlYWN0LWFyaWEvdXRpbHNcIjtcbmltcG9ydCB7dXNlUmVmIGFzICQ2ZGZJZSR1c2VSZWYsIHVzZUNhbGxiYWNrIGFzICQ2ZGZJZSR1c2VDYWxsYmFja30gZnJvbSBcInJlYWN0XCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcblxuZnVuY3Rpb24gJDhhOWNiMjc5ZGM4N2UxMzAkZXhwb3J0JDUyNWJjNDkyMWQ1NmQ0YShuYXRpdmVFdmVudCkge1xuICAgIGxldCBldmVudCA9IG5hdGl2ZUV2ZW50O1xuICAgIGV2ZW50Lm5hdGl2ZUV2ZW50ID0gbmF0aXZlRXZlbnQ7XG4gICAgZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkID0gKCk9PmV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQ7XG4gICAgLy8gY2FuY2VsQnViYmxlIGlzIHRlY2huaWNhbGx5IGRlcHJlY2F0ZWQgaW4gdGhlIHNwZWMsIGJ1dCBzdGlsbCBzdXBwb3J0ZWQgaW4gYWxsIGJyb3dzZXJzLlxuICAgIGV2ZW50LmlzUHJvcGFnYXRpb25TdG9wcGVkID0gKCk9PmV2ZW50LmNhbmNlbEJ1YmJsZTtcbiAgICBldmVudC5wZXJzaXN0ID0gKCk9Pnt9O1xuICAgIHJldHVybiBldmVudDtcbn1cbmZ1bmN0aW9uICQ4YTljYjI3OWRjODdlMTMwJGV4cG9ydCRjMmI3YWJlNWQ2MWVjNjk2KGV2ZW50LCB0YXJnZXQpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXZlbnQsICd0YXJnZXQnLCB7XG4gICAgICAgIHZhbHVlOiB0YXJnZXRcbiAgICB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXZlbnQsICdjdXJyZW50VGFyZ2V0Jywge1xuICAgICAgICB2YWx1ZTogdGFyZ2V0XG4gICAgfSk7XG59XG5mdW5jdGlvbiAkOGE5Y2IyNzlkYzg3ZTEzMCRleHBvcnQkNzE1YzY4MmQwOWQ2MzljYyhvbkJsdXIpIHtcbiAgICBsZXQgc3RhdGVSZWYgPSAoMCwgJDZkZkllJHVzZVJlZikoe1xuICAgICAgICBpc0ZvY3VzZWQ6IGZhbHNlLFxuICAgICAgICBvYnNlcnZlcjogbnVsbFxuICAgIH0pO1xuICAgIC8vIENsZWFuIHVwIE11dGF0aW9uT2JzZXJ2ZXIgb24gdW5tb3VudC4gU2VlIGJlbG93LlxuICAgICgwLCAkNmRmSWUkdXNlTGF5b3V0RWZmZWN0KSgoKT0+e1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHN0YXRlUmVmLmN1cnJlbnQ7XG4gICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgaWYgKHN0YXRlLm9ic2VydmVyKSB7XG4gICAgICAgICAgICAgICAgc3RhdGUub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIHN0YXRlLm9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LCBbXSk7XG4gICAgbGV0IGRpc3BhdGNoQmx1ciA9ICgwLCAkNmRmSWUkdXNlRWZmZWN0RXZlbnQpKChlKT0+e1xuICAgICAgICBvbkJsdXIgPT09IG51bGwgfHwgb25CbHVyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvbkJsdXIoZSk7XG4gICAgfSk7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgZHVyaW5nIGEgUmVhY3Qgb25Gb2N1cyBldmVudC5cbiAgICByZXR1cm4gKDAsICQ2ZGZJZSR1c2VDYWxsYmFjaykoKGUpPT57XG4gICAgICAgIC8vIFJlYWN0IGRvZXMgbm90IGZpcmUgb25CbHVyIHdoZW4gYW4gZWxlbWVudCBpcyBkaXNhYmxlZC4gaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2lzc3Vlcy85MTQyXG4gICAgICAgIC8vIE1vc3QgYnJvd3NlcnMgZmlyZSBhIG5hdGl2ZSBmb2N1c291dCBldmVudCBpbiB0aGlzIGNhc2UsIGV4Y2VwdCBmb3IgRmlyZWZveC4gSW4gdGhhdCBjYXNlLCB3ZSB1c2UgYVxuICAgICAgICAvLyBNdXRhdGlvbk9ic2VydmVyIHRvIHdhdGNoIGZvciB0aGUgZGlzYWJsZWQgYXR0cmlidXRlLCBhbmQgZGlzcGF0Y2ggdGhlc2UgZXZlbnRzIG91cnNlbHZlcy5cbiAgICAgICAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgZG8sIGZvY3Vzb3V0IGZpcmVzIGJlZm9yZSB0aGUgTXV0YXRpb25PYnNlcnZlciwgc28gb25CbHVyIHNob3VsZCBub3QgZmlyZSB0d2ljZS5cbiAgICAgICAgaWYgKGUudGFyZ2V0IGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQgfHwgZS50YXJnZXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50IHx8IGUudGFyZ2V0IGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCB8fCBlLnRhcmdldCBpbnN0YW5jZW9mIEhUTUxTZWxlY3RFbGVtZW50KSB7XG4gICAgICAgICAgICBzdGF0ZVJlZi5jdXJyZW50LmlzRm9jdXNlZCA9IHRydWU7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgICAgICBsZXQgb25CbHVySGFuZGxlciA9IChlKT0+e1xuICAgICAgICAgICAgICAgIHN0YXRlUmVmLmN1cnJlbnQuaXNGb2N1c2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSwgZGlzcGF0Y2ggYSAoZmFrZSkgUmVhY3Qgc3ludGhldGljIGV2ZW50LlxuICAgICAgICAgICAgICAgICAgICBsZXQgZXZlbnQgPSAkOGE5Y2IyNzlkYzg3ZTEzMCRleHBvcnQkNTI1YmM0OTIxZDU2ZDRhKGUpO1xuICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaEJsdXIoZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBXZSBubyBsb25nZXIgbmVlZCB0aGUgTXV0YXRpb25PYnNlcnZlciBvbmNlIHRoZSB0YXJnZXQgaXMgYmx1cnJlZC5cbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVSZWYuY3VycmVudC5vYnNlcnZlcikge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZVJlZi5jdXJyZW50Lm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGVSZWYuY3VycmVudC5vYnNlcnZlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIG9uQmx1ckhhbmRsZXIsIHtcbiAgICAgICAgICAgICAgICBvbmNlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHN0YXRlUmVmLmN1cnJlbnQub2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKT0+e1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZVJlZi5jdXJyZW50LmlzRm9jdXNlZCAmJiB0YXJnZXQuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9zdGF0ZVJlZl9jdXJyZW50X29ic2VydmVyO1xuICAgICAgICAgICAgICAgICAgICAoX3N0YXRlUmVmX2N1cnJlbnRfb2JzZXJ2ZXIgPSBzdGF0ZVJlZi5jdXJyZW50Lm9ic2VydmVyKSA9PT0gbnVsbCB8fCBfc3RhdGVSZWZfY3VycmVudF9vYnNlcnZlciA9PT0gdm9pZCAwID8gdm9pZCAwIDogX3N0YXRlUmVmX2N1cnJlbnRfb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcmVsYXRlZFRhcmdldEVsID0gdGFyZ2V0ID09PSBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID8gbnVsbCA6IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5kaXNwYXRjaEV2ZW50KG5ldyBGb2N1c0V2ZW50KCdibHVyJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRlZFRhcmdldDogcmVsYXRlZFRhcmdldEVsXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmRpc3BhdGNoRXZlbnQobmV3IEZvY3VzRXZlbnQoJ2ZvY3Vzb3V0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0ZWRUYXJnZXQ6IHJlbGF0ZWRUYXJnZXRFbFxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzdGF0ZVJlZi5jdXJyZW50Lm9ic2VydmVyLm9ic2VydmUodGFyZ2V0LCB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVGaWx0ZXI6IFtcbiAgICAgICAgICAgICAgICAgICAgJ2Rpc2FibGVkJ1xuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSwgW1xuICAgICAgICBkaXNwYXRjaEJsdXJcbiAgICBdKTtcbn1cbmxldCAkOGE5Y2IyNzlkYzg3ZTEzMCRleHBvcnQkZmRhN2RhNzNhYjVkNGM0OCA9IGZhbHNlO1xuZnVuY3Rpb24gJDhhOWNiMjc5ZGM4N2UxMzAkZXhwb3J0JGNhYmU2MWM0OTVlZTM2NDkodGFyZ2V0KSB7XG4gICAgLy8gVGhlIGJyb3dzZXIgd2lsbCBmb2N1cyB0aGUgbmVhcmVzdCBmb2N1c2FibGUgYW5jZXN0b3Igb2Ygb3VyIHRhcmdldC5cbiAgICB3aGlsZSh0YXJnZXQgJiYgISgwLCAkNmRmSWUkaXNGb2N1c2FibGUpKHRhcmdldCkpdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gICAgbGV0IHdpbmRvdyA9ICgwLCAkNmRmSWUkZ2V0T3duZXJXaW5kb3cpKHRhcmdldCk7XG4gICAgbGV0IGFjdGl2ZUVsZW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICBpZiAoIWFjdGl2ZUVsZW1lbnQgfHwgYWN0aXZlRWxlbWVudCA9PT0gdGFyZ2V0KSByZXR1cm47XG4gICAgJDhhOWNiMjc5ZGM4N2UxMzAkZXhwb3J0JGZkYTdkYTczYWI1ZDRjNDggPSB0cnVlO1xuICAgIGxldCBpc1JlZm9jdXNpbmcgPSBmYWxzZTtcbiAgICBsZXQgb25CbHVyID0gKGUpPT57XG4gICAgICAgIGlmIChlLnRhcmdldCA9PT0gYWN0aXZlRWxlbWVudCB8fCBpc1JlZm9jdXNpbmcpIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgfTtcbiAgICBsZXQgb25Gb2N1c091dCA9IChlKT0+e1xuICAgICAgICBpZiAoZS50YXJnZXQgPT09IGFjdGl2ZUVsZW1lbnQgfHwgaXNSZWZvY3VzaW5nKSB7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgd2FzIG5vIGZvY3VzYWJsZSBhbmNlc3Rvciwgd2UgZG9uJ3QgZXhwZWN0IGEgZm9jdXMgZXZlbnQuXG4gICAgICAgICAgICAvLyBSZS1mb2N1cyB0aGUgb3JpZ2luYWwgYWN0aXZlIGVsZW1lbnQgaGVyZS5cbiAgICAgICAgICAgIGlmICghdGFyZ2V0ICYmICFpc1JlZm9jdXNpbmcpIHtcbiAgICAgICAgICAgICAgICBpc1JlZm9jdXNpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICgwLCAkNmRmSWUkZm9jdXNXaXRob3V0U2Nyb2xsaW5nKShhY3RpdmVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGxldCBvbkZvY3VzID0gKGUpPT57XG4gICAgICAgIGlmIChlLnRhcmdldCA9PT0gdGFyZ2V0IHx8IGlzUmVmb2N1c2luZykgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICB9O1xuICAgIGxldCBvbkZvY3VzSW4gPSAoZSk9PntcbiAgICAgICAgaWYgKGUudGFyZ2V0ID09PSB0YXJnZXQgfHwgaXNSZWZvY3VzaW5nKSB7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgaWYgKCFpc1JlZm9jdXNpbmcpIHtcbiAgICAgICAgICAgICAgICBpc1JlZm9jdXNpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICgwLCAkNmRmSWUkZm9jdXNXaXRob3V0U2Nyb2xsaW5nKShhY3RpdmVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgb25CbHVyLCB0cnVlKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNvdXQnLCBvbkZvY3VzT3V0LCB0cnVlKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIG9uRm9jdXNJbiwgdHJ1ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgb25Gb2N1cywgdHJ1ZSk7XG4gICAgbGV0IGNsZWFudXAgPSAoKT0+e1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShyYWYpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmx1cicsIG9uQmx1ciwgdHJ1ZSk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1c291dCcsIG9uRm9jdXNPdXQsIHRydWUpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIG9uRm9jdXNJbiwgdHJ1ZSk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIG9uRm9jdXMsIHRydWUpO1xuICAgICAgICAkOGE5Y2IyNzlkYzg3ZTEzMCRleHBvcnQkZmRhN2RhNzNhYjVkNGM0OCA9IGZhbHNlO1xuICAgICAgICBpc1JlZm9jdXNpbmcgPSBmYWxzZTtcbiAgICB9O1xuICAgIGxldCByYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2xlYW51cCk7XG4gICAgcmV0dXJuIGNsZWFudXA7XG59XG5cblxuZXhwb3J0IHskOGE5Y2IyNzlkYzg3ZTEzMCRleHBvcnQkNTI1YmM0OTIxZDU2ZDRhIGFzIGNyZWF0ZVN5bnRoZXRpY0V2ZW50LCAkOGE5Y2IyNzlkYzg3ZTEzMCRleHBvcnQkYzJiN2FiZTVkNjFlYzY5NiBhcyBzZXRFdmVudFRhcmdldCwgJDhhOWNiMjc5ZGM4N2UxMzAkZXhwb3J0JDcxNWM2ODJkMDlkNjM5Y2MgYXMgdXNlU3ludGhldGljQmx1ckV2ZW50LCAkOGE5Y2IyNzlkYzg3ZTEzMCRleHBvcnQkZmRhN2RhNzNhYjVkNGM0OCBhcyBpZ25vcmVGb2N1c0V2ZW50LCAkOGE5Y2IyNzlkYzg3ZTEzMCRleHBvcnQkY2FiZTYxYzQ5NWVlMzY0OSBhcyBwcmV2ZW50Rm9jdXN9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXRpbHMubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHtpc0lPUyBhcyAkN1IxOGUkaXNJT1MsIGdldE93bmVyRG9jdW1lbnQgYXMgJDdSMThlJGdldE93bmVyRG9jdW1lbnQsIHJ1bkFmdGVyVHJhbnNpdGlvbiBhcyAkN1IxOGUkcnVuQWZ0ZXJUcmFuc2l0aW9ufSBmcm9tIFwiQHJlYWN0LWFyaWEvdXRpbHNcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuLy8gTm90ZSB0aGF0IHN0YXRlIG9ubHkgbWF0dGVycyBoZXJlIGZvciBpT1MuIE5vbi1pT1MgZ2V0cyB1c2VyLXNlbGVjdDogbm9uZSBhcHBsaWVkIHRvIHRoZSB0YXJnZXQgZWxlbWVudFxuLy8gcmF0aGVyIHRoYW4gYXQgdGhlIGRvY3VtZW50IGxldmVsIHNvIHdlIGp1c3QgbmVlZCB0byBhcHBseS9yZW1vdmUgdXNlci1zZWxlY3Q6IG5vbmUgZm9yIGVhY2ggcHJlc3NlZCBlbGVtZW50IGluZGl2aWR1YWxseVxubGV0ICQxNGMwYjcyNTA5ZDcwMjI1JHZhciRzdGF0ZSA9ICdkZWZhdWx0JztcbmxldCAkMTRjMGI3MjUwOWQ3MDIyNSR2YXIkc2F2ZWRVc2VyU2VsZWN0ID0gJyc7XG5sZXQgJDE0YzBiNzI1MDlkNzAyMjUkdmFyJG1vZGlmaWVkRWxlbWVudE1hcCA9IG5ldyBXZWFrTWFwKCk7XG5mdW5jdGlvbiAkMTRjMGI3MjUwOWQ3MDIyNSRleHBvcnQkMTZhNDY5NzQ2NzE3NTQ4Nyh0YXJnZXQpIHtcbiAgICBpZiAoKDAsICQ3UjE4ZSRpc0lPUykoKSkge1xuICAgICAgICBpZiAoJDE0YzBiNzI1MDlkNzAyMjUkdmFyJHN0YXRlID09PSAnZGVmYXVsdCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGRvY3VtZW50T2JqZWN0ID0gKDAsICQ3UjE4ZSRnZXRPd25lckRvY3VtZW50KSh0YXJnZXQpO1xuICAgICAgICAgICAgJDE0YzBiNzI1MDlkNzAyMjUkdmFyJHNhdmVkVXNlclNlbGVjdCA9IGRvY3VtZW50T2JqZWN0LmRvY3VtZW50RWxlbWVudC5zdHlsZS53ZWJraXRVc2VyU2VsZWN0O1xuICAgICAgICAgICAgZG9jdW1lbnRPYmplY3QuZG9jdW1lbnRFbGVtZW50LnN0eWxlLndlYmtpdFVzZXJTZWxlY3QgPSAnbm9uZSc7XG4gICAgICAgIH1cbiAgICAgICAgJDE0YzBiNzI1MDlkNzAyMjUkdmFyJHN0YXRlID0gJ2Rpc2FibGVkJztcbiAgICB9IGVsc2UgaWYgKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50IHx8IHRhcmdldCBpbnN0YW5jZW9mIFNWR0VsZW1lbnQpIHtcbiAgICAgICAgLy8gSWYgbm90IGlPUywgc3RvcmUgdGhlIHRhcmdldCdzIG9yaWdpbmFsIHVzZXItc2VsZWN0IGFuZCBjaGFuZ2UgdG8gdXNlci1zZWxlY3Q6IG5vbmVcbiAgICAgICAgLy8gSWdub3JlIHN0YXRlIHNpbmNlIGl0IGRvZXNuJ3QgYXBwbHkgZm9yIG5vbiBpT1NcbiAgICAgICAgbGV0IHByb3BlcnR5ID0gJ3VzZXJTZWxlY3QnIGluIHRhcmdldC5zdHlsZSA/ICd1c2VyU2VsZWN0JyA6ICd3ZWJraXRVc2VyU2VsZWN0JztcbiAgICAgICAgJDE0YzBiNzI1MDlkNzAyMjUkdmFyJG1vZGlmaWVkRWxlbWVudE1hcC5zZXQodGFyZ2V0LCB0YXJnZXQuc3R5bGVbcHJvcGVydHldKTtcbiAgICAgICAgdGFyZ2V0LnN0eWxlW3Byb3BlcnR5XSA9ICdub25lJztcbiAgICB9XG59XG5mdW5jdGlvbiAkMTRjMGI3MjUwOWQ3MDIyNSRleHBvcnQkYjBkNmZhMWFiMzJlMzI5NSh0YXJnZXQpIHtcbiAgICBpZiAoKDAsICQ3UjE4ZSRpc0lPUykoKSkge1xuICAgICAgICAvLyBJZiB0aGUgc3RhdGUgaXMgYWxyZWFkeSBkZWZhdWx0LCB0aGVyZSdzIG5vdGhpbmcgdG8gZG8uXG4gICAgICAgIC8vIElmIGl0IGlzIHJlc3RvcmluZywgdGhlbiB0aGVyZSdzIG5vIG5lZWQgdG8gcXVldWUgYSBzZWNvbmQgcmVzdG9yZS5cbiAgICAgICAgaWYgKCQxNGMwYjcyNTA5ZDcwMjI1JHZhciRzdGF0ZSAhPT0gJ2Rpc2FibGVkJykgcmV0dXJuO1xuICAgICAgICAkMTRjMGI3MjUwOWQ3MDIyNSR2YXIkc3RhdGUgPSAncmVzdG9yaW5nJztcbiAgICAgICAgLy8gVGhlcmUgYXBwZWFycyB0byBiZSBhIGRlbGF5IG9uIGlPUyB3aGVyZSBzZWxlY3Rpb24gc3RpbGwgbWlnaHQgb2NjdXJcbiAgICAgICAgLy8gYWZ0ZXIgcG9pbnRlciB1cCwgc28gd2FpdCBhIGJpdCBiZWZvcmUgcmVtb3ZpbmcgdXNlci1zZWxlY3QuXG4gICAgICAgIHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIGFueSBDU1MgdHJhbnNpdGlvbnMgdG8gY29tcGxldGUgc28gd2UgZG9uJ3QgcmVjb21wdXRlIHN0eWxlXG4gICAgICAgICAgICAvLyBmb3IgdGhlIHdob2xlIHBhZ2UgaW4gdGhlIG1pZGRsZSBvZiB0aGUgYW5pbWF0aW9uIGFuZCBjYXVzZSBqYW5rLlxuICAgICAgICAgICAgKDAsICQ3UjE4ZSRydW5BZnRlclRyYW5zaXRpb24pKCgpPT57XG4gICAgICAgICAgICAgICAgLy8gQXZvaWQgcmFjZSBjb25kaXRpb25zXG4gICAgICAgICAgICAgICAgaWYgKCQxNGMwYjcyNTA5ZDcwMjI1JHZhciRzdGF0ZSA9PT0gJ3Jlc3RvcmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZG9jdW1lbnRPYmplY3QgPSAoMCwgJDdSMThlJGdldE93bmVyRG9jdW1lbnQpKHRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkb2N1bWVudE9iamVjdC5kb2N1bWVudEVsZW1lbnQuc3R5bGUud2Via2l0VXNlclNlbGVjdCA9PT0gJ25vbmUnKSBkb2N1bWVudE9iamVjdC5kb2N1bWVudEVsZW1lbnQuc3R5bGUud2Via2l0VXNlclNlbGVjdCA9ICQxNGMwYjcyNTA5ZDcwMjI1JHZhciRzYXZlZFVzZXJTZWxlY3QgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgICQxNGMwYjcyNTA5ZDcwMjI1JHZhciRzYXZlZFVzZXJTZWxlY3QgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgJDE0YzBiNzI1MDlkNzAyMjUkdmFyJHN0YXRlID0gJ2RlZmF1bHQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCAzMDApO1xuICAgIH0gZWxzZSBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgfHwgdGFyZ2V0IGluc3RhbmNlb2YgU1ZHRWxlbWVudCkgLy8gSWYgbm90IGlPUywgcmVzdG9yZSB0aGUgdGFyZ2V0J3Mgb3JpZ2luYWwgdXNlci1zZWxlY3QgaWYgYW55XG4gICAgLy8gSWdub3JlIHN0YXRlIHNpbmNlIGl0IGRvZXNuJ3QgYXBwbHkgZm9yIG5vbiBpT1NcbiAgICB7XG4gICAgICAgIGlmICh0YXJnZXQgJiYgJDE0YzBiNzI1MDlkNzAyMjUkdmFyJG1vZGlmaWVkRWxlbWVudE1hcC5oYXModGFyZ2V0KSkge1xuICAgICAgICAgICAgbGV0IHRhcmdldE9sZFVzZXJTZWxlY3QgPSAkMTRjMGI3MjUwOWQ3MDIyNSR2YXIkbW9kaWZpZWRFbGVtZW50TWFwLmdldCh0YXJnZXQpO1xuICAgICAgICAgICAgbGV0IHByb3BlcnR5ID0gJ3VzZXJTZWxlY3QnIGluIHRhcmdldC5zdHlsZSA/ICd1c2VyU2VsZWN0JyA6ICd3ZWJraXRVc2VyU2VsZWN0JztcbiAgICAgICAgICAgIGlmICh0YXJnZXQuc3R5bGVbcHJvcGVydHldID09PSAnbm9uZScpIHRhcmdldC5zdHlsZVtwcm9wZXJ0eV0gPSB0YXJnZXRPbGRVc2VyU2VsZWN0O1xuICAgICAgICAgICAgaWYgKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ3N0eWxlJykgPT09ICcnKSB0YXJnZXQucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuICAgICAgICAgICAgJDE0YzBiNzI1MDlkNzAyMjUkdmFyJG1vZGlmaWVkRWxlbWVudE1hcC5kZWxldGUodGFyZ2V0KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5leHBvcnQgeyQxNGMwYjcyNTA5ZDcwMjI1JGV4cG9ydCQxNmE0Njk3NDY3MTc1NDg3IGFzIGRpc2FibGVUZXh0U2VsZWN0aW9uLCAkMTRjMGI3MjUwOWQ3MDIyNSRleHBvcnQkYjBkNmZhMWFiMzJlMzI5NSBhcyByZXN0b3JlVGV4dFNlbGVjdGlvbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD10ZXh0U2VsZWN0aW9uLm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCAkM2FlRzEkcmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcbmNvbnN0ICRhZTFlZWJhOGI5ZWFmZDA4JGV4cG9ydCQ1MTY1ZWNjYjM1YWFhZGI1ID0gKDAsICQzYWVHMSRyZWFjdCkuY3JlYXRlQ29udGV4dCh7XG4gICAgcmVnaXN0ZXI6ICgpPT57fVxufSk7XG4kYWUxZWViYThiOWVhZmQwOCRleHBvcnQkNTE2NWVjY2IzNWFhYWRiNS5kaXNwbGF5TmFtZSA9ICdQcmVzc1Jlc3BvbmRlckNvbnRleHQnO1xuXG5cbmV4cG9ydCB7JGFlMWVlYmE4YjllYWZkMDgkZXhwb3J0JDUxNjVlY2NiMzVhYWFkYjUgYXMgUHJlc3NSZXNwb25kZXJDb250ZXh0fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnRleHQubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHtjcmVhdGVTeW50aGV0aWNFdmVudCBhcyAkOGE5Y2IyNzlkYzg3ZTEzMCRleHBvcnQkNTI1YmM0OTIxZDU2ZDRhLCBwcmV2ZW50Rm9jdXMgYXMgJDhhOWNiMjc5ZGM4N2UxMzAkZXhwb3J0JGNhYmU2MWM0OTVlZTM2NDksIHNldEV2ZW50VGFyZ2V0IGFzICQ4YTljYjI3OWRjODdlMTMwJGV4cG9ydCRjMmI3YWJlNWQ2MWVjNjk2fSBmcm9tIFwiLi91dGlscy5tanNcIjtcbmltcG9ydCB7ZGlzYWJsZVRleHRTZWxlY3Rpb24gYXMgJDE0YzBiNzI1MDlkNzAyMjUkZXhwb3J0JDE2YTQ2OTc0NjcxNzU0ODcsIHJlc3RvcmVUZXh0U2VsZWN0aW9uIGFzICQxNGMwYjcyNTA5ZDcwMjI1JGV4cG9ydCRiMGQ2ZmExYWIzMmUzMjk1fSBmcm9tIFwiLi90ZXh0U2VsZWN0aW9uLm1qc1wiO1xuaW1wb3J0IHtQcmVzc1Jlc3BvbmRlckNvbnRleHQgYXMgJGFlMWVlYmE4YjllYWZkMDgkZXhwb3J0JDUxNjVlY2NiMzVhYWFkYjV9IGZyb20gXCIuL2NvbnRleHQubWpzXCI7XG5pbXBvcnQge18gYXMgJDdtZG1oJF99IGZyb20gXCJAc3djL2hlbHBlcnMvXy9fY2xhc3NfcHJpdmF0ZV9maWVsZF9nZXRcIjtcbmltcG9ydCB7XyBhcyAkN21kbWgkXzF9IGZyb20gXCJAc3djL2hlbHBlcnMvXy9fY2xhc3NfcHJpdmF0ZV9maWVsZF9pbml0XCI7XG5pbXBvcnQge18gYXMgJDdtZG1oJF8yfSBmcm9tIFwiQHN3Yy9oZWxwZXJzL18vX2NsYXNzX3ByaXZhdGVfZmllbGRfc2V0XCI7XG5pbXBvcnQge21lcmdlUHJvcHMgYXMgJDdtZG1oJG1lcmdlUHJvcHMsIHVzZVN5bmNSZWYgYXMgJDdtZG1oJHVzZVN5bmNSZWYsIHVzZUdsb2JhbExpc3RlbmVycyBhcyAkN21kbWgkdXNlR2xvYmFsTGlzdGVuZXJzLCB1c2VFZmZlY3RFdmVudCBhcyAkN21kbWgkdXNlRWZmZWN0RXZlbnQsIG5vZGVDb250YWlucyBhcyAkN21kbWgkbm9kZUNvbnRhaW5zLCBnZXRFdmVudFRhcmdldCBhcyAkN21kbWgkZ2V0RXZlbnRUYXJnZXQsIGdldE93bmVyRG9jdW1lbnQgYXMgJDdtZG1oJGdldE93bmVyRG9jdW1lbnQsIGNoYWluIGFzICQ3bWRtaCRjaGFpbiwgaXNNYWMgYXMgJDdtZG1oJGlzTWFjLCBvcGVuTGluayBhcyAkN21kbWgkb3BlbkxpbmssIGlzVmlydHVhbENsaWNrIGFzICQ3bWRtaCRpc1ZpcnR1YWxDbGljaywgaXNWaXJ0dWFsUG9pbnRlckV2ZW50IGFzICQ3bWRtaCRpc1ZpcnR1YWxQb2ludGVyRXZlbnQsIGZvY3VzV2l0aG91dFNjcm9sbGluZyBhcyAkN21kbWgkZm9jdXNXaXRob3V0U2Nyb2xsaW5nLCBnZXRPd25lcldpbmRvdyBhcyAkN21kbWgkZ2V0T3duZXJXaW5kb3d9IGZyb20gXCJAcmVhY3QtYXJpYS91dGlsc1wiO1xuaW1wb3J0IHtmbHVzaFN5bmMgYXMgJDdtZG1oJGZsdXNoU3luY30gZnJvbSBcInJlYWN0LWRvbVwiO1xuaW1wb3J0IHt1c2VDb250ZXh0IGFzICQ3bWRtaCR1c2VDb250ZXh0LCB1c2VTdGF0ZSBhcyAkN21kbWgkdXNlU3RhdGUsIHVzZVJlZiBhcyAkN21kbWgkdXNlUmVmLCB1c2VNZW1vIGFzICQ3bWRtaCR1c2VNZW1vLCB1c2VFZmZlY3QgYXMgJDdtZG1oJHVzZUVmZmVjdH0gZnJvbSBcInJlYWN0XCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyAvLyBQb3J0aW9ucyBvZiB0aGUgY29kZSBpbiB0aGlzIGZpbGUgYXJlIGJhc2VkIG9uIGNvZGUgZnJvbSByZWFjdC5cbi8vIE9yaWdpbmFsIGxpY2Vuc2luZyBmb3IgdGhlIGZvbGxvd2luZyBjYW4gYmUgZm91bmQgaW4gdGhlXG4vLyBOT1RJQ0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QvdHJlZS9jYzdjMWFlY2U0NmE2YjY5YjQxOTU4ZDczMWUwZmQyN2M5NGJmYzZjL3BhY2thZ2VzL3JlYWN0LWludGVyYWN0aW9uc1xuXG5cblxuXG5cblxuXG5cblxuZnVuY3Rpb24gJGY2YzMxY2NlMmFkZjY1NGYkdmFyJHVzZVByZXNzUmVzcG9uZGVyQ29udGV4dChwcm9wcykge1xuICAgIC8vIENvbnN1bWUgY29udGV4dCBmcm9tIDxQcmVzc1Jlc3BvbmRlcj4gYW5kIG1lcmdlIHdpdGggcHJvcHMuXG4gICAgbGV0IGNvbnRleHQgPSAoMCwgJDdtZG1oJHVzZUNvbnRleHQpKCgwLCAkYWUxZWViYThiOWVhZmQwOCRleHBvcnQkNTE2NWVjY2IzNWFhYWRiNSkpO1xuICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgIGxldCB7IHJlZ2lzdGVyOiByZWdpc3RlciwgLi4uY29udGV4dFByb3BzIH0gPSBjb250ZXh0O1xuICAgICAgICBwcm9wcyA9ICgwLCAkN21kbWgkbWVyZ2VQcm9wcykoY29udGV4dFByb3BzLCBwcm9wcyk7XG4gICAgICAgIHJlZ2lzdGVyKCk7XG4gICAgfVxuICAgICgwLCAkN21kbWgkdXNlU3luY1JlZikoY29udGV4dCwgcHJvcHMucmVmKTtcbiAgICByZXR1cm4gcHJvcHM7XG59XG52YXIgJGY2YzMxY2NlMmFkZjY1NGYkdmFyJF9zaG91bGRTdG9wUHJvcGFnYXRpb24gPSAvKiNfX1BVUkVfXyovIG5ldyBXZWFrTWFwKCk7XG5jbGFzcyAkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkUHJlc3NFdmVudCB7XG4gICAgY29udGludWVQcm9wYWdhdGlvbigpIHtcbiAgICAgICAgKDAsICQ3bWRtaCRfMikodGhpcywgJGY2YzMxY2NlMmFkZjY1NGYkdmFyJF9zaG91bGRTdG9wUHJvcGFnYXRpb24sIGZhbHNlKTtcbiAgICB9XG4gICAgZ2V0IHNob3VsZFN0b3BQcm9wYWdhdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICgwLCAkN21kbWgkXykodGhpcywgJGY2YzMxY2NlMmFkZjY1NGYkdmFyJF9zaG91bGRTdG9wUHJvcGFnYXRpb24pO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcih0eXBlLCBwb2ludGVyVHlwZSwgb3JpZ2luYWxFdmVudCwgc3RhdGUpe1xuICAgICAgICAoMCwgJDdtZG1oJF8xKSh0aGlzLCAkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkX3Nob3VsZFN0b3BQcm9wYWdhdGlvbiwge1xuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogdm9pZCAwXG4gICAgICAgIH0pO1xuICAgICAgICAoMCwgJDdtZG1oJF8yKSh0aGlzLCAkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkX3Nob3VsZFN0b3BQcm9wYWdhdGlvbiwgdHJ1ZSk7XG4gICAgICAgIHZhciBfc3RhdGVfdGFyZ2V0O1xuICAgICAgICBsZXQgY3VycmVudFRhcmdldCA9IChfc3RhdGVfdGFyZ2V0ID0gc3RhdGUgPT09IG51bGwgfHwgc3RhdGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHN0YXRlLnRhcmdldCkgIT09IG51bGwgJiYgX3N0YXRlX3RhcmdldCAhPT0gdm9pZCAwID8gX3N0YXRlX3RhcmdldCA6IG9yaWdpbmFsRXZlbnQuY3VycmVudFRhcmdldDtcbiAgICAgICAgY29uc3QgcmVjdCA9IGN1cnJlbnRUYXJnZXQgPT09IG51bGwgfHwgY3VycmVudFRhcmdldCA9PT0gdm9pZCAwID8gdm9pZCAwIDogY3VycmVudFRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IHgsIHkgPSAwO1xuICAgICAgICBsZXQgY2xpZW50WCwgY2xpZW50WSA9IG51bGw7XG4gICAgICAgIGlmIChvcmlnaW5hbEV2ZW50LmNsaWVudFggIT0gbnVsbCAmJiBvcmlnaW5hbEV2ZW50LmNsaWVudFkgIT0gbnVsbCkge1xuICAgICAgICAgICAgY2xpZW50WCA9IG9yaWdpbmFsRXZlbnQuY2xpZW50WDtcbiAgICAgICAgICAgIGNsaWVudFkgPSBvcmlnaW5hbEV2ZW50LmNsaWVudFk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlY3QpIHtcbiAgICAgICAgICAgIGlmIChjbGllbnRYICE9IG51bGwgJiYgY2xpZW50WSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgeCA9IGNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgICAgICAgICAgeSA9IGNsaWVudFkgLSByZWN0LnRvcDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgeCA9IHJlY3Qud2lkdGggLyAyO1xuICAgICAgICAgICAgICAgIHkgPSByZWN0LmhlaWdodCAvIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5wb2ludGVyVHlwZSA9IHBvaW50ZXJUeXBlO1xuICAgICAgICB0aGlzLnRhcmdldCA9IG9yaWdpbmFsRXZlbnQuY3VycmVudFRhcmdldDtcbiAgICAgICAgdGhpcy5zaGlmdEtleSA9IG9yaWdpbmFsRXZlbnQuc2hpZnRLZXk7XG4gICAgICAgIHRoaXMubWV0YUtleSA9IG9yaWdpbmFsRXZlbnQubWV0YUtleTtcbiAgICAgICAgdGhpcy5jdHJsS2V5ID0gb3JpZ2luYWxFdmVudC5jdHJsS2V5O1xuICAgICAgICB0aGlzLmFsdEtleSA9IG9yaWdpbmFsRXZlbnQuYWx0S2V5O1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgIH1cbn1cbmNvbnN0ICRmNmMzMWNjZTJhZGY2NTRmJHZhciRMSU5LX0NMSUNLRUQgPSBTeW1ib2woJ2xpbmtDbGlja2VkJyk7XG5jb25zdCAkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkU1RZTEVfSUQgPSAncmVhY3QtYXJpYS1wcmVzc2FibGUtc3R5bGUnO1xuY29uc3QgJGY2YzMxY2NlMmFkZjY1NGYkdmFyJFBSRVNTQUJMRV9BVFRSSUJVVEUgPSAnZGF0YS1yZWFjdC1hcmlhLXByZXNzYWJsZSc7XG5mdW5jdGlvbiAkZjZjMzFjY2UyYWRmNjU0ZiRleHBvcnQkNDU3MTJlY2VkYTZmYWQyMShwcm9wcykge1xuICAgIGxldCB7IG9uUHJlc3M6IG9uUHJlc3MsIG9uUHJlc3NDaGFuZ2U6IG9uUHJlc3NDaGFuZ2UsIG9uUHJlc3NTdGFydDogb25QcmVzc1N0YXJ0LCBvblByZXNzRW5kOiBvblByZXNzRW5kLCBvblByZXNzVXA6IG9uUHJlc3NVcCwgb25DbGljazogb25DbGljaywgaXNEaXNhYmxlZDogaXNEaXNhYmxlZCwgaXNQcmVzc2VkOiBpc1ByZXNzZWRQcm9wLCBwcmV2ZW50Rm9jdXNPblByZXNzOiBwcmV2ZW50Rm9jdXNPblByZXNzLCBzaG91bGRDYW5jZWxPblBvaW50ZXJFeGl0OiBzaG91bGRDYW5jZWxPblBvaW50ZXJFeGl0LCBhbGxvd1RleHRTZWxlY3Rpb25PblByZXNzOiBhbGxvd1RleHRTZWxlY3Rpb25PblByZXNzLCByZWY6IGRvbVJlZiwgLi4uZG9tUHJvcHMgfSA9ICRmNmMzMWNjZTJhZGY2NTRmJHZhciR1c2VQcmVzc1Jlc3BvbmRlckNvbnRleHQocHJvcHMpO1xuICAgIGxldCBbaXNQcmVzc2VkLCBzZXRQcmVzc2VkXSA9ICgwLCAkN21kbWgkdXNlU3RhdGUpKGZhbHNlKTtcbiAgICBsZXQgcmVmID0gKDAsICQ3bWRtaCR1c2VSZWYpKHtcbiAgICAgICAgaXNQcmVzc2VkOiBmYWxzZSxcbiAgICAgICAgaWdub3JlRW11bGF0ZWRNb3VzZUV2ZW50czogZmFsc2UsXG4gICAgICAgIGRpZEZpcmVQcmVzc1N0YXJ0OiBmYWxzZSxcbiAgICAgICAgaXNUcmlnZ2VyaW5nRXZlbnQ6IGZhbHNlLFxuICAgICAgICBhY3RpdmVQb2ludGVySWQ6IG51bGwsXG4gICAgICAgIHRhcmdldDogbnVsbCxcbiAgICAgICAgaXNPdmVyVGFyZ2V0OiBmYWxzZSxcbiAgICAgICAgcG9pbnRlclR5cGU6IG51bGwsXG4gICAgICAgIGRpc3Bvc2FibGVzOiBbXVxuICAgIH0pO1xuICAgIGxldCB7IGFkZEdsb2JhbExpc3RlbmVyOiBhZGRHbG9iYWxMaXN0ZW5lciwgcmVtb3ZlQWxsR2xvYmFsTGlzdGVuZXJzOiByZW1vdmVBbGxHbG9iYWxMaXN0ZW5lcnMgfSA9ICgwLCAkN21kbWgkdXNlR2xvYmFsTGlzdGVuZXJzKSgpO1xuICAgIGxldCB0cmlnZ2VyUHJlc3NTdGFydCA9ICgwLCAkN21kbWgkdXNlRWZmZWN0RXZlbnQpKChvcmlnaW5hbEV2ZW50LCBwb2ludGVyVHlwZSk9PntcbiAgICAgICAgbGV0IHN0YXRlID0gcmVmLmN1cnJlbnQ7XG4gICAgICAgIGlmIChpc0Rpc2FibGVkIHx8IHN0YXRlLmRpZEZpcmVQcmVzc1N0YXJ0KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGxldCBzaG91bGRTdG9wUHJvcGFnYXRpb24gPSB0cnVlO1xuICAgICAgICBzdGF0ZS5pc1RyaWdnZXJpbmdFdmVudCA9IHRydWU7XG4gICAgICAgIGlmIChvblByZXNzU3RhcnQpIHtcbiAgICAgICAgICAgIGxldCBldmVudCA9IG5ldyAkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkUHJlc3NFdmVudCgncHJlc3NzdGFydCcsIHBvaW50ZXJUeXBlLCBvcmlnaW5hbEV2ZW50KTtcbiAgICAgICAgICAgIG9uUHJlc3NTdGFydChldmVudCk7XG4gICAgICAgICAgICBzaG91bGRTdG9wUHJvcGFnYXRpb24gPSBldmVudC5zaG91bGRTdG9wUHJvcGFnYXRpb247XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9uUHJlc3NDaGFuZ2UpIG9uUHJlc3NDaGFuZ2UodHJ1ZSk7XG4gICAgICAgIHN0YXRlLmlzVHJpZ2dlcmluZ0V2ZW50ID0gZmFsc2U7XG4gICAgICAgIHN0YXRlLmRpZEZpcmVQcmVzc1N0YXJ0ID0gdHJ1ZTtcbiAgICAgICAgc2V0UHJlc3NlZCh0cnVlKTtcbiAgICAgICAgcmV0dXJuIHNob3VsZFN0b3BQcm9wYWdhdGlvbjtcbiAgICB9KTtcbiAgICBsZXQgdHJpZ2dlclByZXNzRW5kID0gKDAsICQ3bWRtaCR1c2VFZmZlY3RFdmVudCkoKG9yaWdpbmFsRXZlbnQsIHBvaW50ZXJUeXBlLCB3YXNQcmVzc2VkID0gdHJ1ZSk9PntcbiAgICAgICAgbGV0IHN0YXRlID0gcmVmLmN1cnJlbnQ7XG4gICAgICAgIGlmICghc3RhdGUuZGlkRmlyZVByZXNzU3RhcnQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgc3RhdGUuZGlkRmlyZVByZXNzU3RhcnQgPSBmYWxzZTtcbiAgICAgICAgc3RhdGUuaXNUcmlnZ2VyaW5nRXZlbnQgPSB0cnVlO1xuICAgICAgICBsZXQgc2hvdWxkU3RvcFByb3BhZ2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgaWYgKG9uUHJlc3NFbmQpIHtcbiAgICAgICAgICAgIGxldCBldmVudCA9IG5ldyAkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkUHJlc3NFdmVudCgncHJlc3NlbmQnLCBwb2ludGVyVHlwZSwgb3JpZ2luYWxFdmVudCk7XG4gICAgICAgICAgICBvblByZXNzRW5kKGV2ZW50KTtcbiAgICAgICAgICAgIHNob3VsZFN0b3BQcm9wYWdhdGlvbiA9IGV2ZW50LnNob3VsZFN0b3BQcm9wYWdhdGlvbjtcbiAgICAgICAgfVxuICAgICAgICBpZiAob25QcmVzc0NoYW5nZSkgb25QcmVzc0NoYW5nZShmYWxzZSk7XG4gICAgICAgIHNldFByZXNzZWQoZmFsc2UpO1xuICAgICAgICBpZiAob25QcmVzcyAmJiB3YXNQcmVzc2VkICYmICFpc0Rpc2FibGVkKSB7XG4gICAgICAgICAgICBsZXQgZXZlbnQgPSBuZXcgJGY2YzMxY2NlMmFkZjY1NGYkdmFyJFByZXNzRXZlbnQoJ3ByZXNzJywgcG9pbnRlclR5cGUsIG9yaWdpbmFsRXZlbnQpO1xuICAgICAgICAgICAgb25QcmVzcyhldmVudCk7XG4gICAgICAgICAgICBzaG91bGRTdG9wUHJvcGFnYXRpb24gJiYgKHNob3VsZFN0b3BQcm9wYWdhdGlvbiA9IGV2ZW50LnNob3VsZFN0b3BQcm9wYWdhdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGUuaXNUcmlnZ2VyaW5nRXZlbnQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHNob3VsZFN0b3BQcm9wYWdhdGlvbjtcbiAgICB9KTtcbiAgICBsZXQgdHJpZ2dlclByZXNzVXAgPSAoMCwgJDdtZG1oJHVzZUVmZmVjdEV2ZW50KSgob3JpZ2luYWxFdmVudCwgcG9pbnRlclR5cGUpPT57XG4gICAgICAgIGxldCBzdGF0ZSA9IHJlZi5jdXJyZW50O1xuICAgICAgICBpZiAoaXNEaXNhYmxlZCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAob25QcmVzc1VwKSB7XG4gICAgICAgICAgICBzdGF0ZS5pc1RyaWdnZXJpbmdFdmVudCA9IHRydWU7XG4gICAgICAgICAgICBsZXQgZXZlbnQgPSBuZXcgJGY2YzMxY2NlMmFkZjY1NGYkdmFyJFByZXNzRXZlbnQoJ3ByZXNzdXAnLCBwb2ludGVyVHlwZSwgb3JpZ2luYWxFdmVudCk7XG4gICAgICAgICAgICBvblByZXNzVXAoZXZlbnQpO1xuICAgICAgICAgICAgc3RhdGUuaXNUcmlnZ2VyaW5nRXZlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiBldmVudC5zaG91bGRTdG9wUHJvcGFnYXRpb247XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gICAgbGV0IGNhbmNlbCA9ICgwLCAkN21kbWgkdXNlRWZmZWN0RXZlbnQpKChlKT0+e1xuICAgICAgICBsZXQgc3RhdGUgPSByZWYuY3VycmVudDtcbiAgICAgICAgaWYgKHN0YXRlLmlzUHJlc3NlZCAmJiBzdGF0ZS50YXJnZXQpIHtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5kaWRGaXJlUHJlc3NTdGFydCAmJiBzdGF0ZS5wb2ludGVyVHlwZSAhPSBudWxsKSB0cmlnZ2VyUHJlc3NFbmQoJGY2YzMxY2NlMmFkZjY1NGYkdmFyJGNyZWF0ZUV2ZW50KHN0YXRlLnRhcmdldCwgZSksIHN0YXRlLnBvaW50ZXJUeXBlLCBmYWxzZSk7XG4gICAgICAgICAgICBzdGF0ZS5pc1ByZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXRlLmlzT3ZlclRhcmdldCA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhdGUuYWN0aXZlUG9pbnRlcklkID0gbnVsbDtcbiAgICAgICAgICAgIHN0YXRlLnBvaW50ZXJUeXBlID0gbnVsbDtcbiAgICAgICAgICAgIHJlbW92ZUFsbEdsb2JhbExpc3RlbmVycygpO1xuICAgICAgICAgICAgaWYgKCFhbGxvd1RleHRTZWxlY3Rpb25PblByZXNzKSAoMCwgJDE0YzBiNzI1MDlkNzAyMjUkZXhwb3J0JGIwZDZmYTFhYjMyZTMyOTUpKHN0YXRlLnRhcmdldCk7XG4gICAgICAgICAgICBmb3IgKGxldCBkaXNwb3NlIG9mIHN0YXRlLmRpc3Bvc2FibGVzKWRpc3Bvc2UoKTtcbiAgICAgICAgICAgIHN0YXRlLmRpc3Bvc2FibGVzID0gW107XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBsZXQgY2FuY2VsT25Qb2ludGVyRXhpdCA9ICgwLCAkN21kbWgkdXNlRWZmZWN0RXZlbnQpKChlKT0+e1xuICAgICAgICBpZiAoc2hvdWxkQ2FuY2VsT25Qb2ludGVyRXhpdCkgY2FuY2VsKGUpO1xuICAgIH0pO1xuICAgIGxldCB0cmlnZ2VyQ2xpY2sgPSAoMCwgJDdtZG1oJHVzZUVmZmVjdEV2ZW50KSgoZSk9PntcbiAgICAgICAgaWYgKGlzRGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgb25DbGljayA9PT0gbnVsbCB8fCBvbkNsaWNrID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvbkNsaWNrKGUpO1xuICAgIH0pO1xuICAgIGxldCB0cmlnZ2VyU3ludGhldGljQ2xpY2sgPSAoMCwgJDdtZG1oJHVzZUVmZmVjdEV2ZW50KSgoZSwgdGFyZ2V0KT0+e1xuICAgICAgICBpZiAoaXNEaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICAvLyBTb21lIHRoaXJkLXBhcnR5IGxpYnJhcmllcyBwYXNzIGluIG9uQ2xpY2sgaW5zdGVhZCBvZiBvblByZXNzLlxuICAgICAgICAvLyBDcmVhdGUgYSBmYWtlIG1vdXNlIGV2ZW50IGFuZCB0cmlnZ2VyIG9uQ2xpY2sgYXMgd2VsbC5cbiAgICAgICAgLy8gVGhpcyBtYXRjaGVzIHRoZSBicm93c2VyJ3MgbmF0aXZlIGFjdGl2YXRpb24gYmVoYXZpb3IgZm9yIGNlcnRhaW4gZWxlbWVudHMgKGUuZy4gYnV0dG9uKS5cbiAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy8jYWN0aXZhdGlvblxuICAgICAgICAvLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnLyNmaXJlLWEtc3ludGhldGljLXBvaW50ZXItZXZlbnRcbiAgICAgICAgaWYgKG9uQ2xpY2spIHtcbiAgICAgICAgICAgIGxldCBldmVudCA9IG5ldyBNb3VzZUV2ZW50KCdjbGljaycsIGUpO1xuICAgICAgICAgICAgKDAsICQ4YTljYjI3OWRjODdlMTMwJGV4cG9ydCRjMmI3YWJlNWQ2MWVjNjk2KShldmVudCwgdGFyZ2V0KTtcbiAgICAgICAgICAgIG9uQ2xpY2soKDAsICQ4YTljYjI3OWRjODdlMTMwJGV4cG9ydCQ1MjViYzQ5MjFkNTZkNGEpKGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBsZXQgcHJlc3NQcm9wcyA9ICgwLCAkN21kbWgkdXNlTWVtbykoKCk9PntcbiAgICAgICAgbGV0IHN0YXRlID0gcmVmLmN1cnJlbnQ7XG4gICAgICAgIGxldCBwcmVzc1Byb3BzID0ge1xuICAgICAgICAgICAgb25LZXlEb3duIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCRmNmMzMWNjZTJhZGY2NTRmJHZhciRpc1ZhbGlkS2V5Ym9hcmRFdmVudChlLm5hdGl2ZUV2ZW50LCBlLmN1cnJlbnRUYXJnZXQpICYmICgwLCAkN21kbWgkbm9kZUNvbnRhaW5zKShlLmN1cnJlbnRUYXJnZXQsICgwLCAkN21kbWgkZ2V0RXZlbnRUYXJnZXQpKGUubmF0aXZlRXZlbnQpKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgX3N0YXRlX21ldGFLZXlFdmVudHM7XG4gICAgICAgICAgICAgICAgICAgIGlmICgkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkc2hvdWxkUHJldmVudERlZmF1bHRLZXlib2FyZCgoMCwgJDdtZG1oJGdldEV2ZW50VGFyZ2V0KShlLm5hdGl2ZUV2ZW50KSwgZS5rZXkpKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBldmVudCBpcyByZXBlYXRpbmcsIGl0IG1heSBoYXZlIHN0YXJ0ZWQgb24gYSBkaWZmZXJlbnQgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAvLyBhZnRlciB3aGljaCBmb2N1cyBtb3ZlZCB0byB0aGUgY3VycmVudCBlbGVtZW50LiBJZ25vcmUgdGhlc2UgZXZlbnRzIGFuZFxuICAgICAgICAgICAgICAgICAgICAvLyBvbmx5IGhhbmRsZSB0aGUgZmlyc3Qga2V5IGRvd24gZXZlbnQuXG4gICAgICAgICAgICAgICAgICAgIGxldCBzaG91bGRTdG9wUHJvcGFnYXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXN0YXRlLmlzUHJlc3NlZCAmJiAhZS5yZXBlYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnRhcmdldCA9IGUuY3VycmVudFRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmlzUHJlc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wb2ludGVyVHlwZSA9ICdrZXlib2FyZCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG91bGRTdG9wUHJvcGFnYXRpb24gPSB0cmlnZ2VyUHJlc3NTdGFydChlLCAna2V5Ym9hcmQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvY3VzIG1heSBtb3ZlIGJlZm9yZSB0aGUga2V5IHVwIGV2ZW50LCBzbyByZWdpc3RlciB0aGUgZXZlbnQgb24gdGhlIGRvY3VtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkIG9mIHRoZSBzYW1lIGVsZW1lbnQgd2hlcmUgdGhlIGtleSBkb3duIGV2ZW50IG9jY3VycmVkLiBNYWtlIGl0IGNhcHR1cmluZyBzbyB0aGF0IGl0IHdpbGwgdHJpZ2dlclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYmVmb3JlIHN0b3BQcm9wYWdhdGlvbiBmcm9tIHVzZUtleWJvYXJkIG9uIGEgY2hpbGQgZWxlbWVudCBtYXkgaGFwcGVuIGFuZCB0aHVzIHdlIGNhbiBzdGlsbCBjYWxsIHRyaWdnZXJQcmVzcyBmb3IgdGhlIHBhcmVudCBlbGVtZW50LlxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9yaWdpbmFsVGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHByZXNzVXAgPSAoZSk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJGY2YzMxY2NlMmFkZjY1NGYkdmFyJGlzVmFsaWRLZXlib2FyZEV2ZW50KGUsIG9yaWdpbmFsVGFyZ2V0KSAmJiAhZS5yZXBlYXQgJiYgKDAsICQ3bWRtaCRub2RlQ29udGFpbnMpKG9yaWdpbmFsVGFyZ2V0LCAoMCwgJDdtZG1oJGdldEV2ZW50VGFyZ2V0KShlKSkgJiYgc3RhdGUudGFyZ2V0KSB0cmlnZ2VyUHJlc3NVcCgkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkY3JlYXRlRXZlbnQoc3RhdGUudGFyZ2V0LCBlKSwgJ2tleWJvYXJkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkR2xvYmFsTGlzdGVuZXIoKDAsICQ3bWRtaCRnZXRPd25lckRvY3VtZW50KShlLmN1cnJlbnRUYXJnZXQpLCAna2V5dXAnLCAoMCwgJDdtZG1oJGNoYWluKShwcmVzc1VwLCBvbktleVVwKSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNob3VsZFN0b3BQcm9wYWdhdGlvbikgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gS2VlcCB0cmFjayBvZiB0aGUga2V5ZG93biBldmVudHMgdGhhdCBvY2N1ciB3aGlsZSB0aGUgTWV0YSAoZS5nLiBDb21tYW5kKSBrZXkgaXMgaGVsZC5cbiAgICAgICAgICAgICAgICAgICAgLy8gbWFjT1MgaGFzIGEgYnVnIHdoZXJlIGtleXVwIGV2ZW50cyBhcmUgbm90IGZpcmVkIHdoaWxlIHRoZSBNZXRhIGtleSBpcyBkb3duLlxuICAgICAgICAgICAgICAgICAgICAvLyBXaGVuIHRoZSBNZXRhIGtleSBpdHNlbGYgaXMgcmVsZWFzZWQgd2Ugd2lsbCBnZXQgYW4gZXZlbnQgZm9yIHRoYXQsIGFuZCB3ZSdsbCBhY3QgYXMgaWZcbiAgICAgICAgICAgICAgICAgICAgLy8gYWxsIG9mIHRoZXNlIG90aGVyIGtleXMgd2VyZSByZWxlYXNlZCBhcyB3ZWxsLlxuICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0xMzkzNTI0XG4gICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD01NTI5MVxuICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0xMjk5NTUzXG4gICAgICAgICAgICAgICAgICAgIGlmIChlLm1ldGFLZXkgJiYgKDAsICQ3bWRtaCRpc01hYykoKSkgKF9zdGF0ZV9tZXRhS2V5RXZlbnRzID0gc3RhdGUubWV0YUtleUV2ZW50cykgPT09IG51bGwgfHwgX3N0YXRlX21ldGFLZXlFdmVudHMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9zdGF0ZV9tZXRhS2V5RXZlbnRzLnNldChlLmtleSwgZS5uYXRpdmVFdmVudCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlLmtleSA9PT0gJ01ldGEnKSBzdGF0ZS5tZXRhS2V5RXZlbnRzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uQ2xpY2sgKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSAmJiAhKDAsICQ3bWRtaCRub2RlQ29udGFpbnMpKGUuY3VycmVudFRhcmdldCwgKDAsICQ3bWRtaCRnZXRFdmVudFRhcmdldCkoZS5uYXRpdmVFdmVudCkpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaWYgKGUgJiYgZS5idXR0b24gPT09IDAgJiYgIXN0YXRlLmlzVHJpZ2dlcmluZ0V2ZW50ICYmICEoMCwgJDdtZG1oJG9wZW5MaW5rKS5pc09wZW5pbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNob3VsZFN0b3BQcm9wYWdhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0Rpc2FibGVkKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRyaWdnZXJlZCBmcm9tIGEgc2NyZWVuIHJlYWRlciBvciBieSB1c2luZyBlbGVtZW50LmNsaWNrKCksXG4gICAgICAgICAgICAgICAgICAgIC8vIHRyaWdnZXIgYXMgaWYgaXQgd2VyZSBhIGtleWJvYXJkIGNsaWNrLlxuICAgICAgICAgICAgICAgICAgICBpZiAoIXN0YXRlLmlnbm9yZUVtdWxhdGVkTW91c2VFdmVudHMgJiYgIXN0YXRlLmlzUHJlc3NlZCAmJiAoc3RhdGUucG9pbnRlclR5cGUgPT09ICd2aXJ0dWFsJyB8fCAoMCwgJDdtZG1oJGlzVmlydHVhbENsaWNrKShlLm5hdGl2ZUV2ZW50KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdG9wUHJlc3NTdGFydCA9IHRyaWdnZXJQcmVzc1N0YXJ0KGUsICd2aXJ0dWFsJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RvcFByZXNzVXAgPSB0cmlnZ2VyUHJlc3NVcChlLCAndmlydHVhbCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0b3BQcmVzc0VuZCA9IHRyaWdnZXJQcmVzc0VuZChlLCAndmlydHVhbCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlckNsaWNrKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkU3RvcFByb3BhZ2F0aW9uID0gc3RvcFByZXNzU3RhcnQgJiYgc3RvcFByZXNzVXAgJiYgc3RvcFByZXNzRW5kO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0YXRlLmlzUHJlc3NlZCAmJiBzdGF0ZS5wb2ludGVyVHlwZSAhPT0gJ2tleWJvYXJkJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHBvaW50ZXJUeXBlID0gc3RhdGUucG9pbnRlclR5cGUgfHwgZS5uYXRpdmVFdmVudC5wb2ludGVyVHlwZSB8fCAndmlydHVhbCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3RvcFByZXNzVXAgPSB0cmlnZ2VyUHJlc3NVcCgkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkY3JlYXRlRXZlbnQoZS5jdXJyZW50VGFyZ2V0LCBlKSwgcG9pbnRlclR5cGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0b3BQcmVzc0VuZCA9IHRyaWdnZXJQcmVzc0VuZCgkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkY3JlYXRlRXZlbnQoZS5jdXJyZW50VGFyZ2V0LCBlKSwgcG9pbnRlclR5cGUsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkU3RvcFByb3BhZ2F0aW9uID0gc3RvcFByZXNzVXAgJiYgc3RvcFByZXNzRW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuaXNPdmVyVGFyZ2V0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyQ2xpY2soZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWwoZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuaWdub3JlRW11bGF0ZWRNb3VzZUV2ZW50cyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvdWxkU3RvcFByb3BhZ2F0aW9uKSBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgbGV0IG9uS2V5VXAgPSAoZSk9PntcbiAgICAgICAgICAgIHZhciBfc3RhdGVfbWV0YUtleUV2ZW50cztcbiAgICAgICAgICAgIGlmIChzdGF0ZS5pc1ByZXNzZWQgJiYgc3RhdGUudGFyZ2V0ICYmICRmNmMzMWNjZTJhZGY2NTRmJHZhciRpc1ZhbGlkS2V5Ym9hcmRFdmVudChlLCBzdGF0ZS50YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9zdGF0ZV9tZXRhS2V5RXZlbnRzMTtcbiAgICAgICAgICAgICAgICBpZiAoJGY2YzMxY2NlMmFkZjY1NGYkdmFyJHNob3VsZFByZXZlbnREZWZhdWx0S2V5Ym9hcmQoKDAsICQ3bWRtaCRnZXRFdmVudFRhcmdldCkoZSksIGUua2V5KSkgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSAoMCwgJDdtZG1oJGdldEV2ZW50VGFyZ2V0KShlKTtcbiAgICAgICAgICAgICAgICBsZXQgd2FzUHJlc3NlZCA9ICgwLCAkN21kbWgkbm9kZUNvbnRhaW5zKShzdGF0ZS50YXJnZXQsICgwLCAkN21kbWgkZ2V0RXZlbnRUYXJnZXQpKGUpKTtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyUHJlc3NFbmQoJGY2YzMxY2NlMmFkZjY1NGYkdmFyJGNyZWF0ZUV2ZW50KHN0YXRlLnRhcmdldCwgZSksICdrZXlib2FyZCcsIHdhc1ByZXNzZWQpO1xuICAgICAgICAgICAgICAgIGlmICh3YXNQcmVzc2VkKSB0cmlnZ2VyU3ludGhldGljQ2xpY2soZSwgc3RhdGUudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICByZW1vdmVBbGxHbG9iYWxMaXN0ZW5lcnMoKTtcbiAgICAgICAgICAgICAgICAvLyBJZiBhIGxpbmsgd2FzIHRyaWdnZXJlZCB3aXRoIGEga2V5IG90aGVyIHRoYW4gRW50ZXIsIG9wZW4gdGhlIFVSTCBvdXJzZWx2ZXMuXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBtZWFucyB0aGUgbGluayBoYXMgYSByb2xlIG92ZXJyaWRlLCBhbmQgdGhlIGRlZmF1bHQgYnJvd3NlciBiZWhhdmlvclxuICAgICAgICAgICAgICAgIC8vIG9ubHkgYXBwbGllcyB3aGVuIHVzaW5nIHRoZSBFbnRlciBrZXkuXG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ICE9PSAnRW50ZXInICYmICRmNmMzMWNjZTJhZGY2NTRmJHZhciRpc0hUTUxBbmNob3JMaW5rKHN0YXRlLnRhcmdldCkgJiYgKDAsICQ3bWRtaCRub2RlQ29udGFpbnMpKHN0YXRlLnRhcmdldCwgdGFyZ2V0KSAmJiAhZVskZjZjMzFjY2UyYWRmNjU0ZiR2YXIkTElOS19DTElDS0VEXSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTdG9yZSBhIGhpZGRlbiBwcm9wZXJ0eSBvbiB0aGUgZXZlbnQgc28gd2Ugb25seSB0cmlnZ2VyIGxpbmsgY2xpY2sgb25jZSxcbiAgICAgICAgICAgICAgICAgICAgLy8gZXZlbiBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgdXNlUHJlc3MgaW5zdGFuY2VzIGF0dGFjaGVkIHRvIHRoZSBlbGVtZW50LlxuICAgICAgICAgICAgICAgICAgICBlWyRmNmMzMWNjZTJhZGY2NTRmJHZhciRMSU5LX0NMSUNLRURdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgKDAsICQ3bWRtaCRvcGVuTGluaykoc3RhdGUudGFyZ2V0LCBlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN0YXRlLmlzUHJlc3NlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIChfc3RhdGVfbWV0YUtleUV2ZW50czEgPSBzdGF0ZS5tZXRhS2V5RXZlbnRzKSA9PT0gbnVsbCB8fCBfc3RhdGVfbWV0YUtleUV2ZW50czEgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9zdGF0ZV9tZXRhS2V5RXZlbnRzMS5kZWxldGUoZS5rZXkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlLmtleSA9PT0gJ01ldGEnICYmICgoX3N0YXRlX21ldGFLZXlFdmVudHMgPSBzdGF0ZS5tZXRhS2V5RXZlbnRzKSA9PT0gbnVsbCB8fCBfc3RhdGVfbWV0YUtleUV2ZW50cyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX3N0YXRlX21ldGFLZXlFdmVudHMuc2l6ZSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3N0YXRlX3RhcmdldDtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWNvcmRlZCBrZXlkb3duIGV2ZW50cyB0aGF0IG9jY3VycmVkIHdoaWxlIHRoZSBNZXRhIGtleSB3YXMgcHJlc3NlZCxcbiAgICAgICAgICAgICAgICAvLyBhbmQgdGhvc2UgaGF2ZW4ndCByZWNlaXZlZCBrZXl1cCBldmVudHMgYWxyZWFkeSwgZmlyZSBrZXl1cCBldmVudHMgb3Vyc2VsdmVzLlxuICAgICAgICAgICAgICAgIC8vIFNlZSBjb21tZW50IGFib3ZlIGZvciBtb3JlIGluZm8gYWJvdXQgdGhlIG1hY09TIGJ1ZyBjYXVzaW5nIHRoaXMuXG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50cyA9IHN0YXRlLm1ldGFLZXlFdmVudHM7XG4gICAgICAgICAgICAgICAgc3RhdGUubWV0YUtleUV2ZW50cyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBldmVudCBvZiBldmVudHMudmFsdWVzKCkpKF9zdGF0ZV90YXJnZXQgPSBzdGF0ZS50YXJnZXQpID09PSBudWxsIHx8IF9zdGF0ZV90YXJnZXQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9zdGF0ZV90YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgS2V5Ym9hcmRFdmVudCgna2V5dXAnLCBldmVudCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAodHlwZW9mIFBvaW50ZXJFdmVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHByZXNzUHJvcHMub25Qb2ludGVyRG93biA9IChlKT0+e1xuICAgICAgICAgICAgICAgIC8vIE9ubHkgaGFuZGxlIGxlZnQgY2xpY2tzLCBhbmQgaWdub3JlIGV2ZW50cyB0aGF0IGJ1YmJsZWQgdGhyb3VnaCBwb3J0YWxzLlxuICAgICAgICAgICAgICAgIGlmIChlLmJ1dHRvbiAhPT0gMCB8fCAhKDAsICQ3bWRtaCRub2RlQ29udGFpbnMpKGUuY3VycmVudFRhcmdldCwgKDAsICQ3bWRtaCRnZXRFdmVudFRhcmdldCkoZS5uYXRpdmVFdmVudCkpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgLy8gaU9TIHNhZmFyaSBmaXJlcyBwb2ludGVyIGV2ZW50cyBmcm9tIFZvaWNlT3ZlciB3aXRoIGluY29ycmVjdCBjb29yZGluYXRlcy90YXJnZXQuXG4gICAgICAgICAgICAgICAgLy8gSWdub3JlIGFuZCBsZXQgdGhlIG9uQ2xpY2sgaGFuZGxlciB0YWtlIGNhcmUgb2YgaXQgaW5zdGVhZC5cbiAgICAgICAgICAgICAgICAvLyBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjIyNjI3XG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTIyMzIwMlxuICAgICAgICAgICAgICAgIGlmICgoMCwgJDdtZG1oJGlzVmlydHVhbFBvaW50ZXJFdmVudCkoZS5uYXRpdmVFdmVudCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUucG9pbnRlclR5cGUgPSAndmlydHVhbCc7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3RhdGUucG9pbnRlclR5cGUgPSBlLnBvaW50ZXJUeXBlO1xuICAgICAgICAgICAgICAgIGxldCBzaG91bGRTdG9wUHJvcGFnYXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmICghc3RhdGUuaXNQcmVzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmlzUHJlc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmlzT3ZlclRhcmdldCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmFjdGl2ZVBvaW50ZXJJZCA9IGUucG9pbnRlcklkO1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS50YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYWxsb3dUZXh0U2VsZWN0aW9uT25QcmVzcykgKDAsICQxNGMwYjcyNTA5ZDcwMjI1JGV4cG9ydCQxNmE0Njk3NDY3MTc1NDg3KShzdGF0ZS50YXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICBzaG91bGRTdG9wUHJvcGFnYXRpb24gPSB0cmlnZ2VyUHJlc3NTdGFydChlLCBzdGF0ZS5wb2ludGVyVHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbGVhc2UgcG9pbnRlciBjYXB0dXJlIHNvIHRoYXQgdG91Y2ggaW50ZXJhY3Rpb25zIGNhbiBsZWF2ZSB0aGUgb3JpZ2luYWwgdGFyZ2V0LlxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGVuYWJsZXMgb25Qb2ludGVyTGVhdmUgYW5kIG9uUG9pbnRlckVudGVyIHRvIGZpcmUuXG4gICAgICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSAoMCwgJDdtZG1oJGdldEV2ZW50VGFyZ2V0KShlLm5hdGl2ZUV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCdyZWxlYXNlUG9pbnRlckNhcHR1cmUnIGluIHRhcmdldCkgdGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShlLnBvaW50ZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgIGFkZEdsb2JhbExpc3RlbmVyKCgwLCAkN21kbWgkZ2V0T3duZXJEb2N1bWVudCkoZS5jdXJyZW50VGFyZ2V0KSwgJ3BvaW50ZXJ1cCcsIG9uUG9pbnRlclVwLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGFkZEdsb2JhbExpc3RlbmVyKCgwLCAkN21kbWgkZ2V0T3duZXJEb2N1bWVudCkoZS5jdXJyZW50VGFyZ2V0KSwgJ3BvaW50ZXJjYW5jZWwnLCBvblBvaW50ZXJDYW5jZWwsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZFN0b3BQcm9wYWdhdGlvbikgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwcmVzc1Byb3BzLm9uTW91c2VEb3duID0gKGUpPT57XG4gICAgICAgICAgICAgICAgaWYgKCEoMCwgJDdtZG1oJG5vZGVDb250YWlucykoZS5jdXJyZW50VGFyZ2V0LCAoMCwgJDdtZG1oJGdldEV2ZW50VGFyZ2V0KShlLm5hdGl2ZUV2ZW50KSkpIHJldHVybjtcbiAgICAgICAgICAgICAgICBpZiAoZS5idXR0b24gPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZlbnRGb2N1c09uUHJlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkaXNwb3NlID0gKDAsICQ4YTljYjI3OWRjODdlMTMwJGV4cG9ydCRjYWJlNjFjNDk1ZWUzNjQ5KShlLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlzcG9zZSkgc3RhdGUuZGlzcG9zYWJsZXMucHVzaChkaXNwb3NlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwcmVzc1Byb3BzLm9uUG9pbnRlclVwID0gKGUpPT57XG4gICAgICAgICAgICAgICAgLy8gaU9TIGZpcmVzIHBvaW50ZXJ1cCB3aXRoIHplcm8gd2lkdGggYW5kIGhlaWdodCwgc28gY2hlY2sgdGhlIHBvaW50ZXJUeXBlIHJlY29yZGVkIGR1cmluZyBwb2ludGVyZG93bi5cbiAgICAgICAgICAgICAgICBpZiAoISgwLCAkN21kbWgkbm9kZUNvbnRhaW5zKShlLmN1cnJlbnRUYXJnZXQsICgwLCAkN21kbWgkZ2V0RXZlbnRUYXJnZXQpKGUubmF0aXZlRXZlbnQpKSB8fCBzdGF0ZS5wb2ludGVyVHlwZSA9PT0gJ3ZpcnR1YWwnKSByZXR1cm47XG4gICAgICAgICAgICAgICAgLy8gT25seSBoYW5kbGUgbGVmdCBjbGlja3MuIElmIGlzUHJlc3NlZCBpcyB0cnVlLCBkZWxheSB1bnRpbCBvbkNsaWNrLlxuICAgICAgICAgICAgICAgIGlmIChlLmJ1dHRvbiA9PT0gMCAmJiAhc3RhdGUuaXNQcmVzc2VkKSB0cmlnZ2VyUHJlc3NVcChlLCBzdGF0ZS5wb2ludGVyVHlwZSB8fCBlLnBvaW50ZXJUeXBlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwcmVzc1Byb3BzLm9uUG9pbnRlckVudGVyID0gKGUpPT57XG4gICAgICAgICAgICAgICAgaWYgKGUucG9pbnRlcklkID09PSBzdGF0ZS5hY3RpdmVQb2ludGVySWQgJiYgc3RhdGUudGFyZ2V0ICYmICFzdGF0ZS5pc092ZXJUYXJnZXQgJiYgc3RhdGUucG9pbnRlclR5cGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5pc092ZXJUYXJnZXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyUHJlc3NTdGFydCgkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkY3JlYXRlRXZlbnQoc3RhdGUudGFyZ2V0LCBlKSwgc3RhdGUucG9pbnRlclR5cGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwcmVzc1Byb3BzLm9uUG9pbnRlckxlYXZlID0gKGUpPT57XG4gICAgICAgICAgICAgICAgaWYgKGUucG9pbnRlcklkID09PSBzdGF0ZS5hY3RpdmVQb2ludGVySWQgJiYgc3RhdGUudGFyZ2V0ICYmIHN0YXRlLmlzT3ZlclRhcmdldCAmJiBzdGF0ZS5wb2ludGVyVHlwZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmlzT3ZlclRhcmdldCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyUHJlc3NFbmQoJGY2YzMxY2NlMmFkZjY1NGYkdmFyJGNyZWF0ZUV2ZW50KHN0YXRlLnRhcmdldCwgZSksIHN0YXRlLnBvaW50ZXJUeXBlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbE9uUG9pbnRlckV4aXQoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxldCBvblBvaW50ZXJVcCA9IChlKT0+e1xuICAgICAgICAgICAgICAgIGlmIChlLnBvaW50ZXJJZCA9PT0gc3RhdGUuYWN0aXZlUG9pbnRlcklkICYmIHN0YXRlLmlzUHJlc3NlZCAmJiBlLmJ1dHRvbiA9PT0gMCAmJiBzdGF0ZS50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCgwLCAkN21kbWgkbm9kZUNvbnRhaW5zKShzdGF0ZS50YXJnZXQsICgwLCAkN21kbWgkZ2V0RXZlbnRUYXJnZXQpKGUpKSAmJiBzdGF0ZS5wb2ludGVyVHlwZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXYWl0IGZvciBvbkNsaWNrIHRvIGZpcmUgb25QcmVzcy4gVGhpcyBhdm9pZHMgYnJvd3NlciBpc3N1ZXMgd2hlbiB0aGUgRE9NXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpcyBtdXRhdGVkIGJldHdlZW4gb25Qb2ludGVyVXAgYW5kIG9uQ2xpY2ssIGFuZCBpcyBtb3JlIGNvbXBhdGlibGUgd2l0aCB0aGlyZCBwYXJ0eSBsaWJyYXJpZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYWRvYmUvcmVhY3Qtc3BlY3RydW0vaXNzdWVzLzE1MTNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vaXNzdWVzLmNocm9taXVtLm9yZy9pc3N1ZXMvNDA3MzIyMjRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhvd2V2ZXIsIGlPUyBhbmQgQW5kcm9pZCBkbyBub3QgZm9jdXMgb3IgZmlyZSBvbkNsaWNrIGFmdGVyIGEgbG9uZyBwcmVzcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIHdvcmsgYXJvdW5kIHRoaXMgYnkgdHJpZ2dlcmluZyBhIGNsaWNrIG91cnNlbHZlcyBhZnRlciBhIHRpbWVvdXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIHRpbWVvdXQgaXMgY2FuY2VsZWQgZHVyaW5nIHRoZSBjbGljayBldmVudCBpbiBjYXNlIHRoZSByZWFsIG9uZSBmaXJlcyBmaXJzdC5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSB0aW1lb3V0IG11c3QgYmUgYXQgbGVhc3QgMzJtcywgYmVjYXVzZSBTYWZhcmkgb24gaU9TIGRlbGF5cyB0aGUgY2xpY2sgZXZlbnQgb25cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vbi1mb3JtIGVsZW1lbnRzIHdpdGhvdXQgY2VydGFpbiBBUklBIHJvbGVzIChmb3IgaG92ZXIgZW11bGF0aW9uKS5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9XZWJLaXQvV2ViS2l0L2Jsb2IvZGNjZmFlNDJiYjI5YmQ0YmRlZjA1MmU0NjlmNjA0YTkzODcyNDFjMC9Tb3VyY2UvV2ViS2l0L1dlYlByb2Nlc3MvV2ViUGFnZS9pb3MvV2ViUGFnZUlPUy5tbSNMODc1LUw4OTJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjbGlja2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGltZW91dCA9IHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGUuaXNQcmVzc2VkICYmIHN0YXRlLnRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbGlja2VkKSBjYW5jZWwoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKDAsICQ3bWRtaCRmb2N1c1dpdGhvdXRTY3JvbGxpbmcpKHN0YXRlLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS50YXJnZXQuY2xpY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDgwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVzZSBhIGNhcHR1cmluZyBsaXN0ZW5lciB0byB0cmFjayBpZiBhIGNsaWNrIG9jY3VycmVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgc3RvcFByb3BhZ2F0aW9uIGlzIGNhbGxlZCBpdCBtYXkgbmV2ZXIgcmVhY2ggb3VyIGhhbmRsZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRHbG9iYWxMaXN0ZW5lcihlLmN1cnJlbnRUYXJnZXQsICdjbGljaycsICgpPT5jbGlja2VkID0gdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5kaXNwb3NhYmxlcy5wdXNoKCgpPT5jbGVhclRpbWVvdXQodGltZW91dCkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgY2FuY2VsKGUpO1xuICAgICAgICAgICAgICAgICAgICAvLyBJZ25vcmUgc3Vic2VxdWVudCBvblBvaW50ZXJMZWF2ZSBldmVudCBiZWZvcmUgb25DbGljayBvbiB0b3VjaCBkZXZpY2VzLlxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5pc092ZXJUYXJnZXQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IG9uUG9pbnRlckNhbmNlbCA9IChlKT0+e1xuICAgICAgICAgICAgICAgIGNhbmNlbChlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwcmVzc1Byb3BzLm9uRHJhZ1N0YXJ0ID0gKGUpPT57XG4gICAgICAgICAgICAgICAgaWYgKCEoMCwgJDdtZG1oJG5vZGVDb250YWlucykoZS5jdXJyZW50VGFyZ2V0LCAoMCwgJDdtZG1oJGdldEV2ZW50VGFyZ2V0KShlLm5hdGl2ZUV2ZW50KSkpIHJldHVybjtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lcyBub3QgY2FsbCBvblBvaW50ZXJDYW5jZWwgd2hlbiBhIGRyYWcgc3RhcnRzLCB3aGVyZWFzIENocm9tZSBhbmQgRmlyZWZveCBkby5cbiAgICAgICAgICAgICAgICBjYW5jZWwoZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAndGVzdCcpIHtcbiAgICAgICAgICAgIC8vIE5PVEU6IHRoaXMgZmFsbGJhY2sgYnJhbmNoIGlzIGVudGlyZWx5IHVzZWQgYnkgdW5pdCB0ZXN0cy5cbiAgICAgICAgICAgIC8vIEFsbCBicm93c2VycyBub3cgc3VwcG9ydCBwb2ludGVyIGV2ZW50cywgYnV0IEpTRE9NIHN0aWxsIGRvZXMgbm90LlxuICAgICAgICAgICAgcHJlc3NQcm9wcy5vbk1vdXNlRG93biA9IChlKT0+e1xuICAgICAgICAgICAgICAgIC8vIE9ubHkgaGFuZGxlIGxlZnQgY2xpY2tzXG4gICAgICAgICAgICAgICAgaWYgKGUuYnV0dG9uICE9PSAwIHx8ICEoMCwgJDdtZG1oJG5vZGVDb250YWlucykoZS5jdXJyZW50VGFyZ2V0LCAoMCwgJDdtZG1oJGdldEV2ZW50VGFyZ2V0KShlLm5hdGl2ZUV2ZW50KSkpIHJldHVybjtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuaWdub3JlRW11bGF0ZWRNb3VzZUV2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN0YXRlLmlzUHJlc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGUuaXNPdmVyVGFyZ2V0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZS50YXJnZXQgPSBlLmN1cnJlbnRUYXJnZXQ7XG4gICAgICAgICAgICAgICAgc3RhdGUucG9pbnRlclR5cGUgPSAoMCwgJDdtZG1oJGlzVmlydHVhbENsaWNrKShlLm5hdGl2ZUV2ZW50KSA/ICd2aXJ0dWFsJyA6ICdtb3VzZSc7XG4gICAgICAgICAgICAgICAgLy8gRmx1c2ggc3luYyBzbyB0aGF0IGZvY3VzIG1vdmVkIGR1cmluZyByZWFjdCByZS1yZW5kZXJzIG9jY3VycyBiZWZvcmUgd2UgeWllbGQgYmFjayB0byB0aGUgYnJvd3Nlci5cbiAgICAgICAgICAgICAgICBsZXQgc2hvdWxkU3RvcFByb3BhZ2F0aW9uID0gKDAsICQ3bWRtaCRmbHVzaFN5bmMpKCgpPT50cmlnZ2VyUHJlc3NTdGFydChlLCBzdGF0ZS5wb2ludGVyVHlwZSkpO1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRTdG9wUHJvcGFnYXRpb24pIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHByZXZlbnRGb2N1c09uUHJlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRpc3Bvc2UgPSAoMCwgJDhhOWNiMjc5ZGM4N2UxMzAkZXhwb3J0JGNhYmU2MWM0OTVlZTM2NDkpKGUudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3Bvc2UpIHN0YXRlLmRpc3Bvc2FibGVzLnB1c2goZGlzcG9zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFkZEdsb2JhbExpc3RlbmVyKCgwLCAkN21kbWgkZ2V0T3duZXJEb2N1bWVudCkoZS5jdXJyZW50VGFyZ2V0KSwgJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwcmVzc1Byb3BzLm9uTW91c2VFbnRlciA9IChlKT0+e1xuICAgICAgICAgICAgICAgIGlmICghKDAsICQ3bWRtaCRub2RlQ29udGFpbnMpKGUuY3VycmVudFRhcmdldCwgKDAsICQ3bWRtaCRnZXRFdmVudFRhcmdldCkoZS5uYXRpdmVFdmVudCkpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgbGV0IHNob3VsZFN0b3BQcm9wYWdhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLmlzUHJlc3NlZCAmJiAhc3RhdGUuaWdub3JlRW11bGF0ZWRNb3VzZUV2ZW50cyAmJiBzdGF0ZS5wb2ludGVyVHlwZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmlzT3ZlclRhcmdldCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNob3VsZFN0b3BQcm9wYWdhdGlvbiA9IHRyaWdnZXJQcmVzc1N0YXJ0KGUsIHN0YXRlLnBvaW50ZXJUeXBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZFN0b3BQcm9wYWdhdGlvbikgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwcmVzc1Byb3BzLm9uTW91c2VMZWF2ZSA9IChlKT0+e1xuICAgICAgICAgICAgICAgIGlmICghKDAsICQ3bWRtaCRub2RlQ29udGFpbnMpKGUuY3VycmVudFRhcmdldCwgKDAsICQ3bWRtaCRnZXRFdmVudFRhcmdldCkoZS5uYXRpdmVFdmVudCkpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgbGV0IHNob3VsZFN0b3BQcm9wYWdhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLmlzUHJlc3NlZCAmJiAhc3RhdGUuaWdub3JlRW11bGF0ZWRNb3VzZUV2ZW50cyAmJiBzdGF0ZS5wb2ludGVyVHlwZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmlzT3ZlclRhcmdldCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBzaG91bGRTdG9wUHJvcGFnYXRpb24gPSB0cmlnZ2VyUHJlc3NFbmQoZSwgc3RhdGUucG9pbnRlclR5cGUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsT25Qb2ludGVyRXhpdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZFN0b3BQcm9wYWdhdGlvbikgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBwcmVzc1Byb3BzLm9uTW91c2VVcCA9IChlKT0+e1xuICAgICAgICAgICAgICAgIGlmICghKDAsICQ3bWRtaCRub2RlQ29udGFpbnMpKGUuY3VycmVudFRhcmdldCwgKDAsICQ3bWRtaCRnZXRFdmVudFRhcmdldCkoZS5uYXRpdmVFdmVudCkpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaWYgKCFzdGF0ZS5pZ25vcmVFbXVsYXRlZE1vdXNlRXZlbnRzICYmIGUuYnV0dG9uID09PSAwICYmICFzdGF0ZS5pc1ByZXNzZWQpIHRyaWdnZXJQcmVzc1VwKGUsIHN0YXRlLnBvaW50ZXJUeXBlIHx8ICdtb3VzZScpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxldCBvbk1vdXNlVXAgPSAoZSk9PntcbiAgICAgICAgICAgICAgICAvLyBPbmx5IGhhbmRsZSBsZWZ0IGNsaWNrc1xuICAgICAgICAgICAgICAgIGlmIChlLmJ1dHRvbiAhPT0gMCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5pZ25vcmVFbXVsYXRlZE1vdXNlRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmlnbm9yZUVtdWxhdGVkTW91c2VFdmVudHMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUudGFyZ2V0ICYmIHN0YXRlLnRhcmdldC5jb250YWlucyhlLnRhcmdldCkgJiYgc3RhdGUucG9pbnRlclR5cGUgIT0gbnVsbCkgO1xuICAgICAgICAgICAgICAgIGVsc2UgY2FuY2VsKGUpO1xuICAgICAgICAgICAgICAgIHN0YXRlLmlzT3ZlclRhcmdldCA9IGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHByZXNzUHJvcHMub25Ub3VjaFN0YXJ0ID0gKGUpPT57XG4gICAgICAgICAgICAgICAgaWYgKCEoMCwgJDdtZG1oJG5vZGVDb250YWlucykoZS5jdXJyZW50VGFyZ2V0LCAoMCwgJDdtZG1oJGdldEV2ZW50VGFyZ2V0KShlLm5hdGl2ZUV2ZW50KSkpIHJldHVybjtcbiAgICAgICAgICAgICAgICBsZXQgdG91Y2ggPSAkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkZ2V0VG91Y2hGcm9tRXZlbnQoZS5uYXRpdmVFdmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKCF0b3VjaCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHN0YXRlLmFjdGl2ZVBvaW50ZXJJZCA9IHRvdWNoLmlkZW50aWZpZXI7XG4gICAgICAgICAgICAgICAgc3RhdGUuaWdub3JlRW11bGF0ZWRNb3VzZUV2ZW50cyA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGUuaXNPdmVyVGFyZ2V0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5pc1ByZXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHN0YXRlLnRhcmdldCA9IGUuY3VycmVudFRhcmdldDtcbiAgICAgICAgICAgICAgICBzdGF0ZS5wb2ludGVyVHlwZSA9ICd0b3VjaCc7XG4gICAgICAgICAgICAgICAgaWYgKCFhbGxvd1RleHRTZWxlY3Rpb25PblByZXNzKSAoMCwgJDE0YzBiNzI1MDlkNzAyMjUkZXhwb3J0JDE2YTQ2OTc0NjcxNzU0ODcpKHN0YXRlLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgbGV0IHNob3VsZFN0b3BQcm9wYWdhdGlvbiA9IHRyaWdnZXJQcmVzc1N0YXJ0KCRmNmMzMWNjZTJhZGY2NTRmJHZhciRjcmVhdGVUb3VjaEV2ZW50KHN0YXRlLnRhcmdldCwgZSksIHN0YXRlLnBvaW50ZXJUeXBlKTtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkU3RvcFByb3BhZ2F0aW9uKSBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGFkZEdsb2JhbExpc3RlbmVyKCgwLCAkN21kbWgkZ2V0T3duZXJXaW5kb3cpKGUuY3VycmVudFRhcmdldCksICdzY3JvbGwnLCBvblNjcm9sbCwgdHJ1ZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcHJlc3NQcm9wcy5vblRvdWNoTW92ZSA9IChlKT0+e1xuICAgICAgICAgICAgICAgIGlmICghKDAsICQ3bWRtaCRub2RlQ29udGFpbnMpKGUuY3VycmVudFRhcmdldCwgKDAsICQ3bWRtaCRnZXRFdmVudFRhcmdldCkoZS5uYXRpdmVFdmVudCkpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaWYgKCFzdGF0ZS5pc1ByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgdG91Y2ggPSAkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkZ2V0VG91Y2hCeUlkKGUubmF0aXZlRXZlbnQsIHN0YXRlLmFjdGl2ZVBvaW50ZXJJZCk7XG4gICAgICAgICAgICAgICAgbGV0IHNob3VsZFN0b3BQcm9wYWdhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHRvdWNoICYmICRmNmMzMWNjZTJhZGY2NTRmJHZhciRpc092ZXJUYXJnZXQodG91Y2gsIGUuY3VycmVudFRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzdGF0ZS5pc092ZXJUYXJnZXQgJiYgc3RhdGUucG9pbnRlclR5cGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuaXNPdmVyVGFyZ2V0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZFN0b3BQcm9wYWdhdGlvbiA9IHRyaWdnZXJQcmVzc1N0YXJ0KCRmNmMzMWNjZTJhZGY2NTRmJHZhciRjcmVhdGVUb3VjaEV2ZW50KHN0YXRlLnRhcmdldCwgZSksIHN0YXRlLnBvaW50ZXJUeXBlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdGUuaXNPdmVyVGFyZ2V0ICYmIHN0YXRlLnBvaW50ZXJUeXBlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuaXNPdmVyVGFyZ2V0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNob3VsZFN0b3BQcm9wYWdhdGlvbiA9IHRyaWdnZXJQcmVzc0VuZCgkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkY3JlYXRlVG91Y2hFdmVudChzdGF0ZS50YXJnZXQsIGUpLCBzdGF0ZS5wb2ludGVyVHlwZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBjYW5jZWxPblBvaW50ZXJFeGl0KCRmNmMzMWNjZTJhZGY2NTRmJHZhciRjcmVhdGVUb3VjaEV2ZW50KHN0YXRlLnRhcmdldCwgZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkU3RvcFByb3BhZ2F0aW9uKSBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHByZXNzUHJvcHMub25Ub3VjaEVuZCA9IChlKT0+e1xuICAgICAgICAgICAgICAgIGlmICghKDAsICQ3bWRtaCRub2RlQ29udGFpbnMpKGUuY3VycmVudFRhcmdldCwgKDAsICQ3bWRtaCRnZXRFdmVudFRhcmdldCkoZS5uYXRpdmVFdmVudCkpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaWYgKCFzdGF0ZS5pc1ByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgdG91Y2ggPSAkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkZ2V0VG91Y2hCeUlkKGUubmF0aXZlRXZlbnQsIHN0YXRlLmFjdGl2ZVBvaW50ZXJJZCk7XG4gICAgICAgICAgICAgICAgbGV0IHNob3VsZFN0b3BQcm9wYWdhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHRvdWNoICYmICRmNmMzMWNjZTJhZGY2NTRmJHZhciRpc092ZXJUYXJnZXQodG91Y2gsIGUuY3VycmVudFRhcmdldCkgJiYgc3RhdGUucG9pbnRlclR5cGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyUHJlc3NVcCgkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkY3JlYXRlVG91Y2hFdmVudChzdGF0ZS50YXJnZXQsIGUpLCBzdGF0ZS5wb2ludGVyVHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIHNob3VsZFN0b3BQcm9wYWdhdGlvbiA9IHRyaWdnZXJQcmVzc0VuZCgkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkY3JlYXRlVG91Y2hFdmVudChzdGF0ZS50YXJnZXQsIGUpLCBzdGF0ZS5wb2ludGVyVHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXJTeW50aGV0aWNDbGljayhlLm5hdGl2ZUV2ZW50LCBzdGF0ZS50YXJnZXQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdGUuaXNPdmVyVGFyZ2V0ICYmIHN0YXRlLnBvaW50ZXJUeXBlICE9IG51bGwpIHNob3VsZFN0b3BQcm9wYWdhdGlvbiA9IHRyaWdnZXJQcmVzc0VuZCgkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkY3JlYXRlVG91Y2hFdmVudChzdGF0ZS50YXJnZXQsIGUpLCBzdGF0ZS5wb2ludGVyVHlwZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmIChzaG91bGRTdG9wUHJvcGFnYXRpb24pIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgc3RhdGUuaXNQcmVzc2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc3RhdGUuYWN0aXZlUG9pbnRlcklkID0gbnVsbDtcbiAgICAgICAgICAgICAgICBzdGF0ZS5pc092ZXJUYXJnZXQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5pZ25vcmVFbXVsYXRlZE1vdXNlRXZlbnRzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUudGFyZ2V0ICYmICFhbGxvd1RleHRTZWxlY3Rpb25PblByZXNzKSAoMCwgJDE0YzBiNzI1MDlkNzAyMjUkZXhwb3J0JGIwZDZmYTFhYjMyZTMyOTUpKHN0YXRlLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgcmVtb3ZlQWxsR2xvYmFsTGlzdGVuZXJzKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcHJlc3NQcm9wcy5vblRvdWNoQ2FuY2VsID0gKGUpPT57XG4gICAgICAgICAgICAgICAgaWYgKCEoMCwgJDdtZG1oJG5vZGVDb250YWlucykoZS5jdXJyZW50VGFyZ2V0LCAoMCwgJDdtZG1oJGdldEV2ZW50VGFyZ2V0KShlLm5hdGl2ZUV2ZW50KSkpIHJldHVybjtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5pc1ByZXNzZWQpIGNhbmNlbCgkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkY3JlYXRlVG91Y2hFdmVudChzdGF0ZS50YXJnZXQsIGUpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgb25TY3JvbGwgPSAoZSk9PntcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuaXNQcmVzc2VkICYmICgwLCAkN21kbWgkbm9kZUNvbnRhaW5zKSgoMCwgJDdtZG1oJGdldEV2ZW50VGFyZ2V0KShlKSwgc3RhdGUudGFyZ2V0KSkgY2FuY2VsKHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRhcmdldDogc3RhdGUudGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICBzaGlmdEtleTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGN0cmxLZXk6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBtZXRhS2V5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgYWx0S2V5OiBmYWxzZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHByZXNzUHJvcHMub25EcmFnU3RhcnQgPSAoZSk9PntcbiAgICAgICAgICAgICAgICBpZiAoISgwLCAkN21kbWgkbm9kZUNvbnRhaW5zKShlLmN1cnJlbnRUYXJnZXQsICgwLCAkN21kbWgkZ2V0RXZlbnRUYXJnZXQpKGUubmF0aXZlRXZlbnQpKSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGNhbmNlbChlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByZXNzUHJvcHM7XG4gICAgfSwgW1xuICAgICAgICBhZGRHbG9iYWxMaXN0ZW5lcixcbiAgICAgICAgaXNEaXNhYmxlZCxcbiAgICAgICAgcHJldmVudEZvY3VzT25QcmVzcyxcbiAgICAgICAgcmVtb3ZlQWxsR2xvYmFsTGlzdGVuZXJzLFxuICAgICAgICBhbGxvd1RleHRTZWxlY3Rpb25PblByZXNzLFxuICAgICAgICBjYW5jZWwsXG4gICAgICAgIGNhbmNlbE9uUG9pbnRlckV4aXQsXG4gICAgICAgIHRyaWdnZXJQcmVzc0VuZCxcbiAgICAgICAgdHJpZ2dlclByZXNzU3RhcnQsXG4gICAgICAgIHRyaWdnZXJQcmVzc1VwLFxuICAgICAgICB0cmlnZ2VyQ2xpY2ssXG4gICAgICAgIHRyaWdnZXJTeW50aGV0aWNDbGlja1xuICAgIF0pO1xuICAgIC8vIEF2b2lkIG9uQ2xpY2sgZGVsYXkgZm9yIGRvdWJsZSB0YXAgdG8gem9vbSBieSBkZWZhdWx0LlxuICAgICgwLCAkN21kbWgkdXNlRWZmZWN0KSgoKT0+e1xuICAgICAgICBpZiAoIWRvbVJlZiB8fCBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Rlc3QnKSByZXR1cm47XG4gICAgICAgIGNvbnN0IG93bmVyRG9jdW1lbnQgPSAoMCwgJDdtZG1oJGdldE93bmVyRG9jdW1lbnQpKGRvbVJlZi5jdXJyZW50KTtcbiAgICAgICAgaWYgKCFvd25lckRvY3VtZW50IHx8ICFvd25lckRvY3VtZW50LmhlYWQgfHwgb3duZXJEb2N1bWVudC5nZXRFbGVtZW50QnlJZCgkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkU1RZTEVfSUQpKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHN0eWxlID0gb3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICBzdHlsZS5pZCA9ICRmNmMzMWNjZTJhZGY2NTRmJHZhciRTVFlMRV9JRDtcbiAgICAgICAgLy8gdG91Y2hBY3Rpb246ICdtYW5pcHVsYXRpb24nIGlzIHN1cHBvc2VkIHRvIGJlIGVxdWl2YWxlbnQsIGJ1dCBpblxuICAgICAgICAvLyBTYWZhcmkgaXQgY2F1c2VzIG9uUG9pbnRlckNhbmNlbCBub3QgdG8gZmlyZSBvbiBzY3JvbGwuXG4gICAgICAgIC8vIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0yNDA5MTdcbiAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSBgXG5AbGF5ZXIge1xuICBbJHskZjZjMzFjY2UyYWRmNjU0ZiR2YXIkUFJFU1NBQkxFX0FUVFJJQlVURX1dIHtcbiAgICB0b3VjaC1hY3Rpb246IHBhbi14IHBhbi15IHBpbmNoLXpvb207XG4gIH1cbn1cbiAgICBgLnRyaW0oKTtcbiAgICAgICAgb3duZXJEb2N1bWVudC5oZWFkLnByZXBlbmQoc3R5bGUpO1xuICAgIH0sIFtcbiAgICAgICAgZG9tUmVmXG4gICAgXSk7XG4gICAgLy8gUmVtb3ZlIHVzZXItc2VsZWN0OiBub25lIGluIGNhc2UgY29tcG9uZW50IHVubW91bnRzIGltbWVkaWF0ZWx5IGFmdGVyIHByZXNzU3RhcnRcbiAgICAoMCwgJDdtZG1oJHVzZUVmZmVjdCkoKCk9PntcbiAgICAgICAgbGV0IHN0YXRlID0gcmVmLmN1cnJlbnQ7XG4gICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgdmFyIF9zdGF0ZV90YXJnZXQ7XG4gICAgICAgICAgICBpZiAoIWFsbG93VGV4dFNlbGVjdGlvbk9uUHJlc3MpICgwLCAkMTRjMGI3MjUwOWQ3MDIyNSRleHBvcnQkYjBkNmZhMWFiMzJlMzI5NSkoKF9zdGF0ZV90YXJnZXQgPSBzdGF0ZS50YXJnZXQpICE9PSBudWxsICYmIF9zdGF0ZV90YXJnZXQgIT09IHZvaWQgMCA/IF9zdGF0ZV90YXJnZXQgOiB1bmRlZmluZWQpO1xuICAgICAgICAgICAgZm9yIChsZXQgZGlzcG9zZSBvZiBzdGF0ZS5kaXNwb3NhYmxlcylkaXNwb3NlKCk7XG4gICAgICAgICAgICBzdGF0ZS5kaXNwb3NhYmxlcyA9IFtdO1xuICAgICAgICB9O1xuICAgIH0sIFtcbiAgICAgICAgYWxsb3dUZXh0U2VsZWN0aW9uT25QcmVzc1xuICAgIF0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGlzUHJlc3NlZDogaXNQcmVzc2VkUHJvcCB8fCBpc1ByZXNzZWQsXG4gICAgICAgIHByZXNzUHJvcHM6ICgwLCAkN21kbWgkbWVyZ2VQcm9wcykoZG9tUHJvcHMsIHByZXNzUHJvcHMsIHtcbiAgICAgICAgICAgIFskZjZjMzFjY2UyYWRmNjU0ZiR2YXIkUFJFU1NBQkxFX0FUVFJJQlVURV06IHRydWVcbiAgICAgICAgfSlcbiAgICB9O1xufVxuZnVuY3Rpb24gJGY2YzMxY2NlMmFkZjY1NGYkdmFyJGlzSFRNTEFuY2hvckxpbmsodGFyZ2V0KSB7XG4gICAgcmV0dXJuIHRhcmdldC50YWdOYW1lID09PSAnQScgJiYgdGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnaHJlZicpO1xufVxuZnVuY3Rpb24gJGY2YzMxY2NlMmFkZjY1NGYkdmFyJGlzVmFsaWRLZXlib2FyZEV2ZW50KGV2ZW50LCBjdXJyZW50VGFyZ2V0KSB7XG4gICAgY29uc3QgeyBrZXk6IGtleSwgY29kZTogY29kZSB9ID0gZXZlbnQ7XG4gICAgY29uc3QgZWxlbWVudCA9IGN1cnJlbnRUYXJnZXQ7XG4gICAgY29uc3Qgcm9sZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdyb2xlJyk7XG4gICAgLy8gQWNjZXNzaWJpbGl0eSBmb3Iga2V5Ym9hcmRzLiBTcGFjZSBhbmQgRW50ZXIgb25seS5cbiAgICAvLyBcIlNwYWNlYmFyXCIgaXMgZm9yIElFIDExXG4gICAgcmV0dXJuIChrZXkgPT09ICdFbnRlcicgfHwga2V5ID09PSAnICcgfHwga2V5ID09PSAnU3BhY2ViYXInIHx8IGNvZGUgPT09ICdTcGFjZScpICYmICEoZWxlbWVudCBpbnN0YW5jZW9mICgwLCAkN21kbWgkZ2V0T3duZXJXaW5kb3cpKGVsZW1lbnQpLkhUTUxJbnB1dEVsZW1lbnQgJiYgISRmNmMzMWNjZTJhZGY2NTRmJHZhciRpc1ZhbGlkSW5wdXRLZXkoZWxlbWVudCwga2V5KSB8fCBlbGVtZW50IGluc3RhbmNlb2YgKDAsICQ3bWRtaCRnZXRPd25lcldpbmRvdykoZWxlbWVudCkuSFRNTFRleHRBcmVhRWxlbWVudCB8fCBlbGVtZW50LmlzQ29udGVudEVkaXRhYmxlKSAmJiAvLyBMaW5rcyBzaG91bGQgb25seSB0cmlnZ2VyIHdpdGggRW50ZXIga2V5XG4gICAgISgocm9sZSA9PT0gJ2xpbmsnIHx8ICFyb2xlICYmICRmNmMzMWNjZTJhZGY2NTRmJHZhciRpc0hUTUxBbmNob3JMaW5rKGVsZW1lbnQpKSAmJiBrZXkgIT09ICdFbnRlcicpO1xufVxuZnVuY3Rpb24gJGY2YzMxY2NlMmFkZjY1NGYkdmFyJGdldFRvdWNoRnJvbUV2ZW50KGV2ZW50KSB7XG4gICAgY29uc3QgeyB0YXJnZXRUb3VjaGVzOiB0YXJnZXRUb3VjaGVzIH0gPSBldmVudDtcbiAgICBpZiAodGFyZ2V0VG91Y2hlcy5sZW5ndGggPiAwKSByZXR1cm4gdGFyZ2V0VG91Y2hlc1swXTtcbiAgICByZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uICRmNmMzMWNjZTJhZGY2NTRmJHZhciRnZXRUb3VjaEJ5SWQoZXZlbnQsIHBvaW50ZXJJZCkge1xuICAgIGNvbnN0IGNoYW5nZWRUb3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXM7XG4gICAgZm9yKGxldCBpID0gMDsgaSA8IGNoYW5nZWRUb3VjaGVzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgY29uc3QgdG91Y2ggPSBjaGFuZ2VkVG91Y2hlc1tpXTtcbiAgICAgICAgaWYgKHRvdWNoLmlkZW50aWZpZXIgPT09IHBvaW50ZXJJZCkgcmV0dXJuIHRvdWNoO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uICRmNmMzMWNjZTJhZGY2NTRmJHZhciRjcmVhdGVUb3VjaEV2ZW50KHRhcmdldCwgZSkge1xuICAgIGxldCBjbGllbnRYID0gMDtcbiAgICBsZXQgY2xpZW50WSA9IDA7XG4gICAgaWYgKGUudGFyZ2V0VG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGNsaWVudFggPSBlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgY2xpZW50WSA9IGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjdXJyZW50VGFyZ2V0OiB0YXJnZXQsXG4gICAgICAgIHNoaWZ0S2V5OiBlLnNoaWZ0S2V5LFxuICAgICAgICBjdHJsS2V5OiBlLmN0cmxLZXksXG4gICAgICAgIG1ldGFLZXk6IGUubWV0YUtleSxcbiAgICAgICAgYWx0S2V5OiBlLmFsdEtleSxcbiAgICAgICAgY2xpZW50WDogY2xpZW50WCxcbiAgICAgICAgY2xpZW50WTogY2xpZW50WVxuICAgIH07XG59XG5mdW5jdGlvbiAkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkY3JlYXRlRXZlbnQodGFyZ2V0LCBlKSB7XG4gICAgbGV0IGNsaWVudFggPSBlLmNsaWVudFg7XG4gICAgbGV0IGNsaWVudFkgPSBlLmNsaWVudFk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY3VycmVudFRhcmdldDogdGFyZ2V0LFxuICAgICAgICBzaGlmdEtleTogZS5zaGlmdEtleSxcbiAgICAgICAgY3RybEtleTogZS5jdHJsS2V5LFxuICAgICAgICBtZXRhS2V5OiBlLm1ldGFLZXksXG4gICAgICAgIGFsdEtleTogZS5hbHRLZXksXG4gICAgICAgIGNsaWVudFg6IGNsaWVudFgsXG4gICAgICAgIGNsaWVudFk6IGNsaWVudFlcbiAgICB9O1xufVxuZnVuY3Rpb24gJGY2YzMxY2NlMmFkZjY1NGYkdmFyJGdldFBvaW50Q2xpZW50UmVjdChwb2ludCkge1xuICAgIGxldCBvZmZzZXRYID0gMDtcbiAgICBsZXQgb2Zmc2V0WSA9IDA7XG4gICAgaWYgKHBvaW50LndpZHRoICE9PSB1bmRlZmluZWQpIG9mZnNldFggPSBwb2ludC53aWR0aCAvIDI7XG4gICAgZWxzZSBpZiAocG9pbnQucmFkaXVzWCAhPT0gdW5kZWZpbmVkKSBvZmZzZXRYID0gcG9pbnQucmFkaXVzWDtcbiAgICBpZiAocG9pbnQuaGVpZ2h0ICE9PSB1bmRlZmluZWQpIG9mZnNldFkgPSBwb2ludC5oZWlnaHQgLyAyO1xuICAgIGVsc2UgaWYgKHBvaW50LnJhZGl1c1kgIT09IHVuZGVmaW5lZCkgb2Zmc2V0WSA9IHBvaW50LnJhZGl1c1k7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgdG9wOiBwb2ludC5jbGllbnRZIC0gb2Zmc2V0WSxcbiAgICAgICAgcmlnaHQ6IHBvaW50LmNsaWVudFggKyBvZmZzZXRYLFxuICAgICAgICBib3R0b206IHBvaW50LmNsaWVudFkgKyBvZmZzZXRZLFxuICAgICAgICBsZWZ0OiBwb2ludC5jbGllbnRYIC0gb2Zmc2V0WFxuICAgIH07XG59XG5mdW5jdGlvbiAkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkYXJlUmVjdGFuZ2xlc092ZXJsYXBwaW5nKGEsIGIpIHtcbiAgICAvLyBjaGVjayBpZiB0aGV5IGNhbm5vdCBvdmVybGFwIG9uIHggYXhpc1xuICAgIGlmIChhLmxlZnQgPiBiLnJpZ2h0IHx8IGIubGVmdCA+IGEucmlnaHQpIHJldHVybiBmYWxzZTtcbiAgICAvLyBjaGVjayBpZiB0aGV5IGNhbm5vdCBvdmVybGFwIG9uIHkgYXhpc1xuICAgIGlmIChhLnRvcCA+IGIuYm90dG9tIHx8IGIudG9wID4gYS5ib3R0b20pIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uICRmNmMzMWNjZTJhZGY2NTRmJHZhciRpc092ZXJUYXJnZXQocG9pbnQsIHRhcmdldCkge1xuICAgIGxldCByZWN0ID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGxldCBwb2ludFJlY3QgPSAkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkZ2V0UG9pbnRDbGllbnRSZWN0KHBvaW50KTtcbiAgICByZXR1cm4gJGY2YzMxY2NlMmFkZjY1NGYkdmFyJGFyZVJlY3RhbmdsZXNPdmVybGFwcGluZyhyZWN0LCBwb2ludFJlY3QpO1xufVxuZnVuY3Rpb24gJGY2YzMxY2NlMmFkZjY1NGYkdmFyJHNob3VsZFByZXZlbnREZWZhdWx0VXAodGFyZ2V0KSB7XG4gICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHJldHVybiBmYWxzZTtcbiAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQpIHJldHVybiB0YXJnZXQudHlwZSAhPT0gJ3N1Ym1pdCcgJiYgdGFyZ2V0LnR5cGUgIT09ICdyZXNldCc7XG4gICAgaWYgKCRmNmMzMWNjZTJhZGY2NTRmJHZhciRpc0hUTUxBbmNob3JMaW5rKHRhcmdldCkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uICRmNmMzMWNjZTJhZGY2NTRmJHZhciRzaG91bGRQcmV2ZW50RGVmYXVsdEtleWJvYXJkKHRhcmdldCwga2V5KSB7XG4gICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHJldHVybiAhJGY2YzMxY2NlMmFkZjY1NGYkdmFyJGlzVmFsaWRJbnB1dEtleSh0YXJnZXQsIGtleSk7XG4gICAgcmV0dXJuICRmNmMzMWNjZTJhZGY2NTRmJHZhciRzaG91bGRQcmV2ZW50RGVmYXVsdFVwKHRhcmdldCk7XG59XG5jb25zdCAkZjZjMzFjY2UyYWRmNjU0ZiR2YXIkbm9uVGV4dElucHV0VHlwZXMgPSBuZXcgU2V0KFtcbiAgICAnY2hlY2tib3gnLFxuICAgICdyYWRpbycsXG4gICAgJ3JhbmdlJyxcbiAgICAnY29sb3InLFxuICAgICdmaWxlJyxcbiAgICAnaW1hZ2UnLFxuICAgICdidXR0b24nLFxuICAgICdzdWJtaXQnLFxuICAgICdyZXNldCdcbl0pO1xuZnVuY3Rpb24gJGY2YzMxY2NlMmFkZjY1NGYkdmFyJGlzVmFsaWRJbnB1dEtleSh0YXJnZXQsIGtleSkge1xuICAgIC8vIE9ubHkgc3BhY2Ugc2hvdWxkIHRvZ2dsZSBjaGVja2JveGVzIGFuZCByYWRpb3MsIG5vdCBlbnRlci5cbiAgICByZXR1cm4gdGFyZ2V0LnR5cGUgPT09ICdjaGVja2JveCcgfHwgdGFyZ2V0LnR5cGUgPT09ICdyYWRpbycgPyBrZXkgPT09ICcgJyA6ICRmNmMzMWNjZTJhZGY2NTRmJHZhciRub25UZXh0SW5wdXRUeXBlcy5oYXModGFyZ2V0LnR5cGUpO1xufVxuXG5cbmV4cG9ydCB7JGY2YzMxY2NlMmFkZjY1NGYkZXhwb3J0JDQ1NzEyZWNlZGE2ZmFkMjEgYXMgdXNlUHJlc3N9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlUHJlc3MubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHtpZ25vcmVGb2N1c0V2ZW50IGFzICQ4YTljYjI3OWRjODdlMTMwJGV4cG9ydCRmZGE3ZGE3M2FiNWQ0YzQ4fSBmcm9tIFwiLi91dGlscy5tanNcIjtcbmltcG9ydCB7aXNNYWMgYXMgJDI4QW5SJGlzTWFjLCBpc1ZpcnR1YWxDbGljayBhcyAkMjhBblIkaXNWaXJ0dWFsQ2xpY2ssIGdldE93bmVyV2luZG93IGFzICQyOEFuUiRnZXRPd25lcldpbmRvdywgZ2V0T3duZXJEb2N1bWVudCBhcyAkMjhBblIkZ2V0T3duZXJEb2N1bWVudH0gZnJvbSBcIkByZWFjdC1hcmlhL3V0aWxzXCI7XG5pbXBvcnQge3VzZVN0YXRlIGFzICQyOEFuUiR1c2VTdGF0ZSwgdXNlRWZmZWN0IGFzICQyOEFuUiR1c2VFZmZlY3R9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHt1c2VJc1NTUiBhcyAkMjhBblIkdXNlSXNTU1J9IGZyb20gXCJAcmVhY3QtYXJpYS9zc3JcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIC8vIFBvcnRpb25zIG9mIHRoZSBjb2RlIGluIHRoaXMgZmlsZSBhcmUgYmFzZWQgb24gY29kZSBmcm9tIHJlYWN0LlxuLy8gT3JpZ2luYWwgbGljZW5zaW5nIGZvciB0aGUgZm9sbG93aW5nIGNhbiBiZSBmb3VuZCBpbiB0aGVcbi8vIE5PVElDRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC90cmVlL2NjN2MxYWVjZTQ2YTZiNjliNDE5NThkNzMxZTBmZDI3Yzk0YmZjNmMvcGFja2FnZXMvcmVhY3QtaW50ZXJhY3Rpb25zXG5cblxuXG5cbmxldCAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkY3VycmVudE1vZGFsaXR5ID0gbnVsbDtcbmxldCAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkY2hhbmdlSGFuZGxlcnMgPSBuZXcgU2V0KCk7XG5sZXQgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JGQ5MDI0M2I1OGRhZWNkYTcgPSBuZXcgTWFwKCk7IC8vIFdlIHVzZSBhIG1hcCBoZXJlIHRvIHN1cHBvcnQgc2V0dGluZyBldmVudCBsaXN0ZW5lcnMgYWNyb3NzIG11bHRpcGxlIGRvY3VtZW50IG9iamVjdHMuXG5sZXQgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhc0V2ZW50QmVmb3JlRm9jdXMgPSBmYWxzZTtcbmxldCAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaGFzQmx1cnJlZFdpbmRvd1JlY2VudGx5ID0gZmFsc2U7XG4vLyBPbmx5IFRhYiBvciBFc2Mga2V5cyB3aWxsIG1ha2UgZm9jdXMgdmlzaWJsZSBvbiB0ZXh0IGlucHV0IGVsZW1lbnRzXG5jb25zdCAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkRk9DVVNfVklTSUJMRV9JTlBVVF9LRVlTID0ge1xuICAgIFRhYjogdHJ1ZSxcbiAgICBFc2NhcGU6IHRydWVcbn07XG5mdW5jdGlvbiAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkdHJpZ2dlckNoYW5nZUhhbmRsZXJzKG1vZGFsaXR5LCBlKSB7XG4gICAgZm9yIChsZXQgaGFuZGxlciBvZiAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkY2hhbmdlSGFuZGxlcnMpaGFuZGxlcihtb2RhbGl0eSwgZSk7XG59XG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBkZXRlcm1pbmUgaWYgYSBLZXlib2FyZEV2ZW50IGlzIHVubW9kaWZpZWQgYW5kIGNvdWxkIG1ha2Uga2V5Ym9hcmQgZm9jdXMgc3R5bGVzIHZpc2libGUuXG4gKi8gZnVuY3Rpb24gJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGlzVmFsaWRLZXkoZSkge1xuICAgIC8vIENvbnRyb2wgYW5kIFNoaWZ0IGtleXMgdHJpZ2dlciB3aGVuIG5hdmlnYXRpbmcgYmFjayB0byB0aGUgdGFiIHdpdGgga2V5Ym9hcmQuXG4gICAgcmV0dXJuICEoZS5tZXRhS2V5IHx8ICEoMCwgJDI4QW5SJGlzTWFjKSgpICYmIGUuYWx0S2V5IHx8IGUuY3RybEtleSB8fCBlLmtleSA9PT0gJ0NvbnRyb2wnIHx8IGUua2V5ID09PSAnU2hpZnQnIHx8IGUua2V5ID09PSAnTWV0YScpO1xufVxuZnVuY3Rpb24gJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhbmRsZUtleWJvYXJkRXZlbnQoZSkge1xuICAgICQ1MDdmYWJlMTBlNzFjNmZiJHZhciRoYXNFdmVudEJlZm9yZUZvY3VzID0gdHJ1ZTtcbiAgICBpZiAoJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGlzVmFsaWRLZXkoZSkpIHtcbiAgICAgICAgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGN1cnJlbnRNb2RhbGl0eSA9ICdrZXlib2FyZCc7XG4gICAgICAgICQ1MDdmYWJlMTBlNzFjNmZiJHZhciR0cmlnZ2VyQ2hhbmdlSGFuZGxlcnMoJ2tleWJvYXJkJywgZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhbmRsZVBvaW50ZXJFdmVudChlKSB7XG4gICAgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGN1cnJlbnRNb2RhbGl0eSA9ICdwb2ludGVyJztcbiAgICBpZiAoZS50eXBlID09PSAnbW91c2Vkb3duJyB8fCBlLnR5cGUgPT09ICdwb2ludGVyZG93bicpIHtcbiAgICAgICAgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhc0V2ZW50QmVmb3JlRm9jdXMgPSB0cnVlO1xuICAgICAgICAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkdHJpZ2dlckNoYW5nZUhhbmRsZXJzKCdwb2ludGVyJywgZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhbmRsZUNsaWNrRXZlbnQoZSkge1xuICAgIGlmICgoMCwgJDI4QW5SJGlzVmlydHVhbENsaWNrKShlKSkge1xuICAgICAgICAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaGFzRXZlbnRCZWZvcmVGb2N1cyA9IHRydWU7XG4gICAgICAgICQ1MDdmYWJlMTBlNzFjNmZiJHZhciRjdXJyZW50TW9kYWxpdHkgPSAndmlydHVhbCc7XG4gICAgfVxufVxuZnVuY3Rpb24gJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhbmRsZUZvY3VzRXZlbnQoZSkge1xuICAgIC8vIEZpcmVmb3ggZmlyZXMgdHdvIGV4dHJhIGZvY3VzIGV2ZW50cyB3aGVuIHRoZSB1c2VyIGZpcnN0IGNsaWNrcyBpbnRvIGFuIGlmcmFtZTpcbiAgICAvLyBmaXJzdCBvbiB0aGUgd2luZG93LCB0aGVuIG9uIHRoZSBkb2N1bWVudC4gV2UgaWdub3JlIHRoZXNlIGV2ZW50cyBzbyB0aGV5IGRvbid0XG4gICAgLy8gY2F1c2Uga2V5Ym9hcmQgZm9jdXMgcmluZ3MgdG8gYXBwZWFyLlxuICAgIGlmIChlLnRhcmdldCA9PT0gd2luZG93IHx8IGUudGFyZ2V0ID09PSBkb2N1bWVudCB8fCAoMCwgJDhhOWNiMjc5ZGM4N2UxMzAkZXhwb3J0JGZkYTdkYTczYWI1ZDRjNDgpIHx8ICFlLmlzVHJ1c3RlZCkgcmV0dXJuO1xuICAgIC8vIElmIGEgZm9jdXMgZXZlbnQgb2NjdXJzIHdpdGhvdXQgYSBwcmVjZWRpbmcga2V5Ym9hcmQgb3IgcG9pbnRlciBldmVudCwgc3dpdGNoIHRvIHZpcnR1YWwgbW9kYWxpdHkuXG4gICAgLy8gVGhpcyBvY2N1cnMsIGZvciBleGFtcGxlLCB3aGVuIG5hdmlnYXRpbmcgYSBmb3JtIHdpdGggdGhlIG5leHQvcHJldmlvdXMgYnV0dG9ucyBvbiBpT1MuXG4gICAgaWYgKCEkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaGFzRXZlbnRCZWZvcmVGb2N1cyAmJiAhJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhc0JsdXJyZWRXaW5kb3dSZWNlbnRseSkge1xuICAgICAgICAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkY3VycmVudE1vZGFsaXR5ID0gJ3ZpcnR1YWwnO1xuICAgICAgICAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkdHJpZ2dlckNoYW5nZUhhbmRsZXJzKCd2aXJ0dWFsJywgZSk7XG4gICAgfVxuICAgICQ1MDdmYWJlMTBlNzFjNmZiJHZhciRoYXNFdmVudEJlZm9yZUZvY3VzID0gZmFsc2U7XG4gICAgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhc0JsdXJyZWRXaW5kb3dSZWNlbnRseSA9IGZhbHNlO1xufVxuZnVuY3Rpb24gJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhbmRsZVdpbmRvd0JsdXIoKSB7XG4gICAgaWYgKDAsICQ4YTljYjI3OWRjODdlMTMwJGV4cG9ydCRmZGE3ZGE3M2FiNWQ0YzQ4KSByZXR1cm47XG4gICAgLy8gV2hlbiB0aGUgd2luZG93IGlzIGJsdXJyZWQsIHJlc2V0IHN0YXRlLiBUaGlzIGlzIG5lY2Vzc2FyeSB3aGVuIHRhYmJpbmcgb3V0IG9mIHRoZSB3aW5kb3csXG4gICAgLy8gZm9yIGV4YW1wbGUsIHNpbmNlIGEgc3Vic2VxdWVudCBmb2N1cyBldmVudCB3b24ndCBiZSBmaXJlZC5cbiAgICAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaGFzRXZlbnRCZWZvcmVGb2N1cyA9IGZhbHNlO1xuICAgICQ1MDdmYWJlMTBlNzFjNmZiJHZhciRoYXNCbHVycmVkV2luZG93UmVjZW50bHkgPSB0cnVlO1xufVxuLyoqXG4gKiBTZXR1cCBnbG9iYWwgZXZlbnQgbGlzdGVuZXJzIHRvIGNvbnRyb2wgd2hlbiBrZXlib2FyZCBmb2N1cyBzdHlsZSBzaG91bGQgYmUgdmlzaWJsZS5cbiAqLyBmdW5jdGlvbiAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkc2V0dXBHbG9iYWxGb2N1c0V2ZW50cyhlbGVtZW50KSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcgfHwgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JGQ5MDI0M2I1OGRhZWNkYTcuZ2V0KCgwLCAkMjhBblIkZ2V0T3duZXJXaW5kb3cpKGVsZW1lbnQpKSkgcmV0dXJuO1xuICAgIGNvbnN0IHdpbmRvd09iamVjdCA9ICgwLCAkMjhBblIkZ2V0T3duZXJXaW5kb3cpKGVsZW1lbnQpO1xuICAgIGNvbnN0IGRvY3VtZW50T2JqZWN0ID0gKDAsICQyOEFuUiRnZXRPd25lckRvY3VtZW50KShlbGVtZW50KTtcbiAgICAvLyBQcm9ncmFtbWF0aWMgZm9jdXMoKSBjYWxscyBzaG91bGRuJ3QgYWZmZWN0IHRoZSBjdXJyZW50IGlucHV0IG1vZGFsaXR5LlxuICAgIC8vIEhvd2V2ZXIsIHdlIG5lZWQgdG8gZGV0ZWN0IG90aGVyIGNhc2VzIHdoZW4gYSBmb2N1cyBldmVudCBvY2N1cnMgd2l0aG91dFxuICAgIC8vIGEgcHJlY2VkaW5nIHVzZXIgZXZlbnQgKGUuZy4gc2NyZWVuIHJlYWRlciBmb2N1cykuIE92ZXJyaWRpbmcgdGhlIGZvY3VzXG4gICAgLy8gbWV0aG9kIG9uIEhUTUxFbGVtZW50LnByb3RvdHlwZSBpcyBhIGJpdCBoYWNreSwgYnV0IHdvcmtzLlxuICAgIGxldCBmb2N1cyA9IHdpbmRvd09iamVjdC5IVE1MRWxlbWVudC5wcm90b3R5cGUuZm9jdXM7XG4gICAgd2luZG93T2JqZWN0LkhUTUxFbGVtZW50LnByb3RvdHlwZS5mb2N1cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaGFzRXZlbnRCZWZvcmVGb2N1cyA9IHRydWU7XG4gICAgICAgIGZvY3VzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgICBkb2N1bWVudE9iamVjdC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhbmRsZUtleWJvYXJkRXZlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50T2JqZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhbmRsZUtleWJvYXJkRXZlbnQsIHRydWUpO1xuICAgIGRvY3VtZW50T2JqZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhbmRsZUNsaWNrRXZlbnQsIHRydWUpO1xuICAgIC8vIFJlZ2lzdGVyIGZvY3VzIGV2ZW50cyBvbiB0aGUgd2luZG93IHNvIHRoZXkgYXJlIHN1cmUgdG8gaGFwcGVuXG4gICAgLy8gYmVmb3JlIFJlYWN0J3MgZXZlbnQgbGlzdGVuZXJzIChyZWdpc3RlcmVkIG9uIHRoZSBkb2N1bWVudCkuXG4gICAgd2luZG93T2JqZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhbmRsZUZvY3VzRXZlbnQsIHRydWUpO1xuICAgIHdpbmRvd09iamVjdC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhbmRsZVdpbmRvd0JsdXIsIGZhbHNlKTtcbiAgICBpZiAodHlwZW9mIFBvaW50ZXJFdmVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZG9jdW1lbnRPYmplY3QuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaGFuZGxlUG9pbnRlckV2ZW50LCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnRPYmplY3QuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaGFuZGxlUG9pbnRlckV2ZW50LCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnRPYmplY3QuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcnVwJywgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhbmRsZVBvaW50ZXJFdmVudCwgdHJ1ZSk7XG4gICAgfSBlbHNlIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Rlc3QnKSB7XG4gICAgICAgIGRvY3VtZW50T2JqZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsICQ1MDdmYWJlMTBlNzFjNmZiJHZhciRoYW5kbGVQb2ludGVyRXZlbnQsIHRydWUpO1xuICAgICAgICBkb2N1bWVudE9iamVjdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaGFuZGxlUG9pbnRlckV2ZW50LCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnRPYmplY3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsICQ1MDdmYWJlMTBlNzFjNmZiJHZhciRoYW5kbGVQb2ludGVyRXZlbnQsIHRydWUpO1xuICAgIH1cbiAgICAvLyBBZGQgdW5tb3VudCBoYW5kbGVyXG4gICAgd2luZG93T2JqZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsICgpPT57XG4gICAgICAgICQ1MDdmYWJlMTBlNzFjNmZiJHZhciR0ZWFyRG93bldpbmRvd0ZvY3VzVHJhY2tpbmcoZWxlbWVudCk7XG4gICAgfSwge1xuICAgICAgICBvbmNlOiB0cnVlXG4gICAgfSk7XG4gICAgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JGQ5MDI0M2I1OGRhZWNkYTcuc2V0KHdpbmRvd09iamVjdCwge1xuICAgICAgICBmb2N1czogZm9jdXNcbiAgICB9KTtcbn1cbmNvbnN0ICQ1MDdmYWJlMTBlNzFjNmZiJHZhciR0ZWFyRG93bldpbmRvd0ZvY3VzVHJhY2tpbmcgPSAoZWxlbWVudCwgbG9hZExpc3RlbmVyKT0+e1xuICAgIGNvbnN0IHdpbmRvd09iamVjdCA9ICgwLCAkMjhBblIkZ2V0T3duZXJXaW5kb3cpKGVsZW1lbnQpO1xuICAgIGNvbnN0IGRvY3VtZW50T2JqZWN0ID0gKDAsICQyOEFuUiRnZXRPd25lckRvY3VtZW50KShlbGVtZW50KTtcbiAgICBpZiAobG9hZExpc3RlbmVyKSBkb2N1bWVudE9iamVjdC5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgbG9hZExpc3RlbmVyKTtcbiAgICBpZiAoISQ1MDdmYWJlMTBlNzFjNmZiJGV4cG9ydCRkOTAyNDNiNThkYWVjZGE3Lmhhcyh3aW5kb3dPYmplY3QpKSByZXR1cm47XG4gICAgd2luZG93T2JqZWN0LkhUTUxFbGVtZW50LnByb3RvdHlwZS5mb2N1cyA9ICQ1MDdmYWJlMTBlNzFjNmZiJGV4cG9ydCRkOTAyNDNiNThkYWVjZGE3LmdldCh3aW5kb3dPYmplY3QpLmZvY3VzO1xuICAgIGRvY3VtZW50T2JqZWN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaGFuZGxlS2V5Ym9hcmRFdmVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnRPYmplY3QucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaGFuZGxlS2V5Ym9hcmRFdmVudCwgdHJ1ZSk7XG4gICAgZG9jdW1lbnRPYmplY3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaGFuZGxlQ2xpY2tFdmVudCwgdHJ1ZSk7XG4gICAgd2luZG93T2JqZWN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhbmRsZUZvY3VzRXZlbnQsIHRydWUpO1xuICAgIHdpbmRvd09iamVjdC5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhbmRsZVdpbmRvd0JsdXIsIGZhbHNlKTtcbiAgICBpZiAodHlwZW9mIFBvaW50ZXJFdmVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZG9jdW1lbnRPYmplY3QucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaGFuZGxlUG9pbnRlckV2ZW50LCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnRPYmplY3QucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaGFuZGxlUG9pbnRlckV2ZW50LCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnRPYmplY3QucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcnVwJywgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGhhbmRsZVBvaW50ZXJFdmVudCwgdHJ1ZSk7XG4gICAgfSBlbHNlIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Rlc3QnKSB7XG4gICAgICAgIGRvY3VtZW50T2JqZWN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsICQ1MDdmYWJlMTBlNzFjNmZiJHZhciRoYW5kbGVQb2ludGVyRXZlbnQsIHRydWUpO1xuICAgICAgICBkb2N1bWVudE9iamVjdC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaGFuZGxlUG9pbnRlckV2ZW50LCB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnRPYmplY3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsICQ1MDdmYWJlMTBlNzFjNmZiJHZhciRoYW5kbGVQb2ludGVyRXZlbnQsIHRydWUpO1xuICAgIH1cbiAgICAkNTA3ZmFiZTEwZTcxYzZmYiRleHBvcnQkZDkwMjQzYjU4ZGFlY2RhNy5kZWxldGUod2luZG93T2JqZWN0KTtcbn07XG5mdW5jdGlvbiAkNTA3ZmFiZTEwZTcxYzZmYiRleHBvcnQkMmYxODg4MTEyZjU1OGE3ZChlbGVtZW50KSB7XG4gICAgY29uc3QgZG9jdW1lbnRPYmplY3QgPSAoMCwgJDI4QW5SJGdldE93bmVyRG9jdW1lbnQpKGVsZW1lbnQpO1xuICAgIGxldCBsb2FkTGlzdGVuZXI7XG4gICAgaWYgKGRvY3VtZW50T2JqZWN0LnJlYWR5U3RhdGUgIT09ICdsb2FkaW5nJykgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJHNldHVwR2xvYmFsRm9jdXNFdmVudHMoZWxlbWVudCk7XG4gICAgZWxzZSB7XG4gICAgICAgIGxvYWRMaXN0ZW5lciA9ICgpPT57XG4gICAgICAgICAgICAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkc2V0dXBHbG9iYWxGb2N1c0V2ZW50cyhlbGVtZW50KTtcbiAgICAgICAgfTtcbiAgICAgICAgZG9jdW1lbnRPYmplY3QuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGxvYWRMaXN0ZW5lcik7XG4gICAgfVxuICAgIHJldHVybiAoKT0+JDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJHRlYXJEb3duV2luZG93Rm9jdXNUcmFja2luZyhlbGVtZW50LCBsb2FkTGlzdGVuZXIpO1xufVxuLy8gU2VydmVyLXNpZGUgcmVuZGVyaW5nIGRvZXMgbm90IGhhdmUgdGhlIGRvY3VtZW50IG9iamVjdCBkZWZpbmVkXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1nbG9iYWxzXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JDJmMTg4ODExMmY1NThhN2QoKTtcbmZ1bmN0aW9uICQ1MDdmYWJlMTBlNzFjNmZiJGV4cG9ydCRiOWIzZGZkZGFiMTdkYjI3KCkge1xuICAgIHJldHVybiAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkY3VycmVudE1vZGFsaXR5ICE9PSAncG9pbnRlcic7XG59XG5mdW5jdGlvbiAkNTA3ZmFiZTEwZTcxYzZmYiRleHBvcnQkNjMwZmY2NTNjNWFkYTZhOSgpIHtcbiAgICByZXR1cm4gJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGN1cnJlbnRNb2RhbGl0eTtcbn1cbmZ1bmN0aW9uICQ1MDdmYWJlMTBlNzFjNmZiJGV4cG9ydCQ4Mzk3ZGRmYzUwNGZkYjlhKG1vZGFsaXR5KSB7XG4gICAgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGN1cnJlbnRNb2RhbGl0eSA9IG1vZGFsaXR5O1xuICAgICQ1MDdmYWJlMTBlNzFjNmZiJHZhciR0cmlnZ2VyQ2hhbmdlSGFuZGxlcnMobW9kYWxpdHksIG51bGwpO1xufVxuZnVuY3Rpb24gJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JDk4ZTIwZWM5MmY2MTRjZmUoKSB7XG4gICAgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJHNldHVwR2xvYmFsRm9jdXNFdmVudHMoKTtcbiAgICBsZXQgW21vZGFsaXR5LCBzZXRNb2RhbGl0eV0gPSAoMCwgJDI4QW5SJHVzZVN0YXRlKSgkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkY3VycmVudE1vZGFsaXR5KTtcbiAgICAoMCwgJDI4QW5SJHVzZUVmZmVjdCkoKCk9PntcbiAgICAgICAgbGV0IGhhbmRsZXIgPSAoKT0+e1xuICAgICAgICAgICAgc2V0TW9kYWxpdHkoJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGN1cnJlbnRNb2RhbGl0eSk7XG4gICAgICAgIH07XG4gICAgICAgICQ1MDdmYWJlMTBlNzFjNmZiJHZhciRjaGFuZ2VIYW5kbGVycy5hZGQoaGFuZGxlcik7XG4gICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGNoYW5nZUhhbmRsZXJzLmRlbGV0ZShoYW5kbGVyKTtcbiAgICAgICAgfTtcbiAgICB9LCBbXSk7XG4gICAgcmV0dXJuICgwLCAkMjhBblIkdXNlSXNTU1IpKCkgPyBudWxsIDogbW9kYWxpdHk7XG59XG5jb25zdCAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkbm9uVGV4dElucHV0VHlwZXMgPSBuZXcgU2V0KFtcbiAgICAnY2hlY2tib3gnLFxuICAgICdyYWRpbycsXG4gICAgJ3JhbmdlJyxcbiAgICAnY29sb3InLFxuICAgICdmaWxlJyxcbiAgICAnaW1hZ2UnLFxuICAgICdidXR0b24nLFxuICAgICdzdWJtaXQnLFxuICAgICdyZXNldCdcbl0pO1xuLyoqXG4gKiBJZiB0aGlzIGlzIGF0dGFjaGVkIHRvIHRleHQgaW5wdXQgY29tcG9uZW50LCByZXR1cm4gaWYgdGhlIGV2ZW50IGlzIGEgZm9jdXMgZXZlbnQgKFRhYi9Fc2NhcGUga2V5cyBwcmVzc2VkKSBzbyB0aGF0XG4gKiBmb2N1cyB2aXNpYmxlIHN0eWxlIGNhbiBiZSBwcm9wZXJseSBzZXQuXG4gKi8gZnVuY3Rpb24gJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGlzS2V5Ym9hcmRGb2N1c0V2ZW50KGlzVGV4dElucHV0LCBtb2RhbGl0eSwgZSkge1xuICAgIGxldCBkb2N1bWVudDEgPSAoMCwgJDI4QW5SJGdldE93bmVyRG9jdW1lbnQpKGUgPT09IG51bGwgfHwgZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZS50YXJnZXQpO1xuICAgIGNvbnN0IElIVE1MSW5wdXRFbGVtZW50ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyAoMCwgJDI4QW5SJGdldE93bmVyV2luZG93KShlID09PSBudWxsIHx8IGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGUudGFyZ2V0KS5IVE1MSW5wdXRFbGVtZW50IDogSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCBJSFRNTFRleHRBcmVhRWxlbWVudCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gKDAsICQyOEFuUiRnZXRPd25lcldpbmRvdykoZSA9PT0gbnVsbCB8fCBlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBlLnRhcmdldCkuSFRNTFRleHRBcmVhRWxlbWVudCA6IEhUTUxUZXh0QXJlYUVsZW1lbnQ7XG4gICAgY29uc3QgSUhUTUxFbGVtZW50ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyAoMCwgJDI4QW5SJGdldE93bmVyV2luZG93KShlID09PSBudWxsIHx8IGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGUudGFyZ2V0KS5IVE1MRWxlbWVudCA6IEhUTUxFbGVtZW50O1xuICAgIGNvbnN0IElLZXlib2FyZEV2ZW50ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyAoMCwgJDI4QW5SJGdldE93bmVyV2luZG93KShlID09PSBudWxsIHx8IGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGUudGFyZ2V0KS5LZXlib2FyZEV2ZW50IDogS2V5Ym9hcmRFdmVudDtcbiAgICAvLyBGb3Iga2V5Ym9hcmQgZXZlbnRzIHRoYXQgb2NjdXIgb24gYSBub24taW5wdXQgZWxlbWVudCB0aGF0IHdpbGwgbW92ZSBmb2N1cyBpbnRvIGlucHV0IGVsZW1lbnQgKGFrYSBBcnJvd0xlZnQgZ29pbmcgZnJvbSBEYXRlcGlja2VyIGJ1dHRvbiB0byB0aGUgbWFpbiBpbnB1dCBncm91cClcbiAgICAvLyB3ZSBuZWVkIHRvIHJlbHkgb24gdGhlIHVzZXIgcGFzc2luZyBpc1RleHRJbnB1dCBpbnRvIGhlcmUuIFRoaXMgd2F5IHdlIGNhbiBza2lwIHRvZ2dsaW5nIGZvY3VzIHZpc2libGl0eSBmb3Igc2FpZCBpbnB1dCBlbGVtZW50XG4gICAgaXNUZXh0SW5wdXQgPSBpc1RleHRJbnB1dCB8fCBkb2N1bWVudDEuYWN0aXZlRWxlbWVudCBpbnN0YW5jZW9mIElIVE1MSW5wdXRFbGVtZW50ICYmICEkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkbm9uVGV4dElucHV0VHlwZXMuaGFzKGRvY3VtZW50MS5hY3RpdmVFbGVtZW50LnR5cGUpIHx8IGRvY3VtZW50MS5hY3RpdmVFbGVtZW50IGluc3RhbmNlb2YgSUhUTUxUZXh0QXJlYUVsZW1lbnQgfHwgZG9jdW1lbnQxLmFjdGl2ZUVsZW1lbnQgaW5zdGFuY2VvZiBJSFRNTEVsZW1lbnQgJiYgZG9jdW1lbnQxLmFjdGl2ZUVsZW1lbnQuaXNDb250ZW50RWRpdGFibGU7XG4gICAgcmV0dXJuICEoaXNUZXh0SW5wdXQgJiYgbW9kYWxpdHkgPT09ICdrZXlib2FyZCcgJiYgZSBpbnN0YW5jZW9mIElLZXlib2FyZEV2ZW50ICYmICEkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkRk9DVVNfVklTSUJMRV9JTlBVVF9LRVlTW2Uua2V5XSk7XG59XG5mdW5jdGlvbiAkNTA3ZmFiZTEwZTcxYzZmYiRleHBvcnQkZmZkOWU1MDIxYzFmYjJkNihwcm9wcyA9IHt9KSB7XG4gICAgbGV0IHsgaXNUZXh0SW5wdXQ6IGlzVGV4dElucHV0LCBhdXRvRm9jdXM6IGF1dG9Gb2N1cyB9ID0gcHJvcHM7XG4gICAgbGV0IFtpc0ZvY3VzVmlzaWJsZVN0YXRlLCBzZXRGb2N1c1Zpc2libGVdID0gKDAsICQyOEFuUiR1c2VTdGF0ZSkoYXV0b0ZvY3VzIHx8ICQ1MDdmYWJlMTBlNzFjNmZiJGV4cG9ydCRiOWIzZGZkZGFiMTdkYjI3KCkpO1xuICAgICQ1MDdmYWJlMTBlNzFjNmZiJGV4cG9ydCRlYzcxYjRiODNhYzA4ZWMzKChpc0ZvY3VzVmlzaWJsZSk9PntcbiAgICAgICAgc2V0Rm9jdXNWaXNpYmxlKGlzRm9jdXNWaXNpYmxlKTtcbiAgICB9LCBbXG4gICAgICAgIGlzVGV4dElucHV0XG4gICAgXSwge1xuICAgICAgICBpc1RleHRJbnB1dDogaXNUZXh0SW5wdXRcbiAgICB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBpc0ZvY3VzVmlzaWJsZTogaXNGb2N1c1Zpc2libGVTdGF0ZVxuICAgIH07XG59XG5mdW5jdGlvbiAkNTA3ZmFiZTEwZTcxYzZmYiRleHBvcnQkZWM3MWI0YjgzYWMwOGVjMyhmbiwgZGVwcywgb3B0cykge1xuICAgICQ1MDdmYWJlMTBlNzFjNmZiJHZhciRzZXR1cEdsb2JhbEZvY3VzRXZlbnRzKCk7XG4gICAgKDAsICQyOEFuUiR1c2VFZmZlY3QpKCgpPT57XG4gICAgICAgIGxldCBoYW5kbGVyID0gKG1vZGFsaXR5LCBlKT0+e1xuICAgICAgICAgICAgLy8gV2Ugd2FudCB0byBlYXJseSByZXR1cm4gZm9yIGFueSBrZXlib2FyZCBldmVudHMgdGhhdCBvY2N1ciBpbnNpZGUgdGV4dCBpbnB1dHMgRVhDRVBUIGZvciBUYWIgYW5kIEVzY2FwZVxuICAgICAgICAgICAgaWYgKCEkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkaXNLZXlib2FyZEZvY3VzRXZlbnQoISEob3B0cyA9PT0gbnVsbCB8fCBvcHRzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRzLmlzVGV4dElucHV0KSwgbW9kYWxpdHksIGUpKSByZXR1cm47XG4gICAgICAgICAgICBmbigkNTA3ZmFiZTEwZTcxYzZmYiRleHBvcnQkYjliM2RmZGRhYjE3ZGIyNygpKTtcbiAgICAgICAgfTtcbiAgICAgICAgJDUwN2ZhYmUxMGU3MWM2ZmIkdmFyJGNoYW5nZUhhbmRsZXJzLmFkZChoYW5kbGVyKTtcbiAgICAgICAgcmV0dXJuICgpPT57XG4gICAgICAgICAgICAkNTA3ZmFiZTEwZTcxYzZmYiR2YXIkY2hhbmdlSGFuZGxlcnMuZGVsZXRlKGhhbmRsZXIpO1xuICAgICAgICB9O1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgICB9LCBkZXBzKTtcbn1cblxuXG5leHBvcnQgeyQ1MDdmYWJlMTBlNzFjNmZiJGV4cG9ydCRkOTAyNDNiNThkYWVjZGE3IGFzIGhhc1NldHVwR2xvYmFsTGlzdGVuZXJzLCAkNTA3ZmFiZTEwZTcxYzZmYiRleHBvcnQkMmYxODg4MTEyZjU1OGE3ZCBhcyBhZGRXaW5kb3dGb2N1c1RyYWNraW5nLCAkNTA3ZmFiZTEwZTcxYzZmYiRleHBvcnQkYjliM2RmZGRhYjE3ZGIyNyBhcyBpc0ZvY3VzVmlzaWJsZSwgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JDYzMGZmNjUzYzVhZGE2YTkgYXMgZ2V0SW50ZXJhY3Rpb25Nb2RhbGl0eSwgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JDgzOTdkZGZjNTA0ZmRiOWEgYXMgc2V0SW50ZXJhY3Rpb25Nb2RhbGl0eSwgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JDk4ZTIwZWM5MmY2MTRjZmUgYXMgdXNlSW50ZXJhY3Rpb25Nb2RhbGl0eSwgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JGZmZDllNTAyMWMxZmIyZDYgYXMgdXNlRm9jdXNWaXNpYmxlLCAkNTA3ZmFiZTEwZTcxYzZmYiRleHBvcnQkZWM3MWI0YjgzYWMwOGVjMyBhcyB1c2VGb2N1c1Zpc2libGVMaXN0ZW5lcn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VGb2N1c1Zpc2libGUubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHtnZXRJbnRlcmFjdGlvbk1vZGFsaXR5IGFzICQ1MDdmYWJlMTBlNzFjNmZiJGV4cG9ydCQ2MzBmZjY1M2M1YWRhNmE5fSBmcm9tIFwiLi91c2VGb2N1c1Zpc2libGUubWpzXCI7XG5pbXBvcnQge2dldE93bmVyRG9jdW1lbnQgYXMgJGs1MGJwJGdldE93bmVyRG9jdW1lbnQsIGdldEFjdGl2ZUVsZW1lbnQgYXMgJGs1MGJwJGdldEFjdGl2ZUVsZW1lbnQsIHJ1bkFmdGVyVHJhbnNpdGlvbiBhcyAkazUwYnAkcnVuQWZ0ZXJUcmFuc2l0aW9uLCBmb2N1c1dpdGhvdXRTY3JvbGxpbmcgYXMgJGs1MGJwJGZvY3VzV2l0aG91dFNjcm9sbGluZ30gZnJvbSBcIkByZWFjdC1hcmlhL3V0aWxzXCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlICdMaWNlbnNlJyk7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gJ0FTIElTJyBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuXG5mdW5jdGlvbiAkM2FkM2Y2ZTE2NDdiYzk4ZCRleHBvcnQkODBmM2UxNDdkNzgxNTcxYyhlbGVtZW50KSB7XG4gICAgLy8gSWYgdGhlIHVzZXIgaXMgaW50ZXJhY3Rpbmcgd2l0aCBhIHZpcnR1YWwgY3Vyc29yLCBlLmcuIHNjcmVlbiByZWFkZXIsIHRoZW5cbiAgICAvLyB3YWl0IHVudGlsIGFmdGVyIGFueSBhbmltYXRlZCB0cmFuc2l0aW9ucyB0aGF0IGFyZSBjdXJyZW50bHkgb2NjdXJyaW5nIG9uXG4gICAgLy8gdGhlIHBhZ2UgYmVmb3JlIHNoaWZ0aW5nIGZvY3VzLiBUaGlzIGF2b2lkcyBpc3N1ZXMgd2l0aCBWb2ljZU92ZXIgb24gaU9TXG4gICAgLy8gY2F1c2luZyB0aGUgcGFnZSB0byBzY3JvbGwgd2hlbiBtb3ZpbmcgZm9jdXMgaWYgdGhlIGVsZW1lbnQgaXMgdHJhbnNpdGlvbmluZ1xuICAgIC8vIGZyb20gb2ZmIHRoZSBzY3JlZW4uXG4gICAgY29uc3Qgb3duZXJEb2N1bWVudCA9ICgwLCAkazUwYnAkZ2V0T3duZXJEb2N1bWVudCkoZWxlbWVudCk7XG4gICAgY29uc3QgYWN0aXZlRWxlbWVudCA9ICgwLCAkazUwYnAkZ2V0QWN0aXZlRWxlbWVudCkob3duZXJEb2N1bWVudCk7XG4gICAgaWYgKCgwLCAkNTA3ZmFiZTEwZTcxYzZmYiRleHBvcnQkNjMwZmY2NTNjNWFkYTZhOSkoKSA9PT0gJ3ZpcnR1YWwnKSB7XG4gICAgICAgIGxldCBsYXN0Rm9jdXNlZEVsZW1lbnQgPSBhY3RpdmVFbGVtZW50O1xuICAgICAgICAoMCwgJGs1MGJwJHJ1bkFmdGVyVHJhbnNpdGlvbikoKCk9PntcbiAgICAgICAgICAgIC8vIElmIGZvY3VzIGRpZCBub3QgbW92ZSBhbmQgdGhlIGVsZW1lbnQgaXMgc3RpbGwgaW4gdGhlIGRvY3VtZW50LCBmb2N1cyBpdC5cbiAgICAgICAgICAgIGlmICgoMCwgJGs1MGJwJGdldEFjdGl2ZUVsZW1lbnQpKG93bmVyRG9jdW1lbnQpID09PSBsYXN0Rm9jdXNlZEVsZW1lbnQgJiYgZWxlbWVudC5pc0Nvbm5lY3RlZCkgKDAsICRrNTBicCRmb2N1c1dpdGhvdXRTY3JvbGxpbmcpKGVsZW1lbnQpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgKDAsICRrNTBicCRmb2N1c1dpdGhvdXRTY3JvbGxpbmcpKGVsZW1lbnQpO1xufVxuXG5cbmV4cG9ydCB7JDNhZDNmNmUxNjQ3YmM5OGQkZXhwb3J0JDgwZjNlMTQ3ZDc4MTU3MWMgYXMgZm9jdXNTYWZlbHl9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Zm9jdXNTYWZlbHkubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHt1c2VTeW50aGV0aWNCbHVyRXZlbnQgYXMgJDhhOWNiMjc5ZGM4N2UxMzAkZXhwb3J0JDcxNWM2ODJkMDlkNjM5Y2N9IGZyb20gXCIuL3V0aWxzLm1qc1wiO1xuaW1wb3J0IHt1c2VDYWxsYmFjayBhcyAkaGYwbGokdXNlQ2FsbGJhY2t9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtnZXRPd25lckRvY3VtZW50IGFzICRoZjBsaiRnZXRPd25lckRvY3VtZW50LCBnZXRBY3RpdmVFbGVtZW50IGFzICRoZjBsaiRnZXRBY3RpdmVFbGVtZW50LCBnZXRFdmVudFRhcmdldCBhcyAkaGYwbGokZ2V0RXZlbnRUYXJnZXR9IGZyb20gXCJAcmVhY3QtYXJpYS91dGlsc1wiO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMjAgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gLy8gUG9ydGlvbnMgb2YgdGhlIGNvZGUgaW4gdGhpcyBmaWxlIGFyZSBiYXNlZCBvbiBjb2RlIGZyb20gcmVhY3QuXG4vLyBPcmlnaW5hbCBsaWNlbnNpbmcgZm9yIHRoZSBmb2xsb3dpbmcgY2FuIGJlIGZvdW5kIGluIHRoZVxuLy8gTk9USUNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4vLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L3RyZWUvY2M3YzFhZWNlNDZhNmI2OWI0MTk1OGQ3MzFlMGZkMjdjOTRiZmM2Yy9wYWNrYWdlcy9yZWFjdC1pbnRlcmFjdGlvbnNcblxuXG5cbmZ1bmN0aW9uICRhMWVhNTlkNjgyNzBmMGRkJGV4cG9ydCRmODE2OGQ4ZGQ4ZmQ2NmU2KHByb3BzKSB7XG4gICAgbGV0IHsgaXNEaXNhYmxlZDogaXNEaXNhYmxlZCwgb25Gb2N1czogb25Gb2N1c1Byb3AsIG9uQmx1cjogb25CbHVyUHJvcCwgb25Gb2N1c0NoYW5nZTogb25Gb2N1c0NoYW5nZSB9ID0gcHJvcHM7XG4gICAgY29uc3Qgb25CbHVyID0gKDAsICRoZjBsaiR1c2VDYWxsYmFjaykoKGUpPT57XG4gICAgICAgIGlmIChlLnRhcmdldCA9PT0gZS5jdXJyZW50VGFyZ2V0KSB7XG4gICAgICAgICAgICBpZiAob25CbHVyUHJvcCkgb25CbHVyUHJvcChlKTtcbiAgICAgICAgICAgIGlmIChvbkZvY3VzQ2hhbmdlKSBvbkZvY3VzQ2hhbmdlKGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfSwgW1xuICAgICAgICBvbkJsdXJQcm9wLFxuICAgICAgICBvbkZvY3VzQ2hhbmdlXG4gICAgXSk7XG4gICAgY29uc3Qgb25TeW50aGV0aWNGb2N1cyA9ICgwLCAkOGE5Y2IyNzlkYzg3ZTEzMCRleHBvcnQkNzE1YzY4MmQwOWQ2MzljYykob25CbHVyKTtcbiAgICBjb25zdCBvbkZvY3VzID0gKDAsICRoZjBsaiR1c2VDYWxsYmFjaykoKGUpPT57XG4gICAgICAgIC8vIERvdWJsZSBjaGVjayB0aGF0IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYWN0dWFsbHkgbWF0Y2hlcyBlLnRhcmdldCBpbiBjYXNlIGEgcHJldmlvdXNseSBjaGFpbmVkXG4gICAgICAgIC8vIGZvY3VzIGhhbmRsZXIgYWxyZWFkeSBtb3ZlZCBmb2N1cyBzb21ld2hlcmUgZWxzZS5cbiAgICAgICAgY29uc3Qgb3duZXJEb2N1bWVudCA9ICgwLCAkaGYwbGokZ2V0T3duZXJEb2N1bWVudCkoZS50YXJnZXQpO1xuICAgICAgICBjb25zdCBhY3RpdmVFbGVtZW50ID0gb3duZXJEb2N1bWVudCA/ICgwLCAkaGYwbGokZ2V0QWN0aXZlRWxlbWVudCkob3duZXJEb2N1bWVudCkgOiAoMCwgJGhmMGxqJGdldEFjdGl2ZUVsZW1lbnQpKCk7XG4gICAgICAgIGlmIChlLnRhcmdldCA9PT0gZS5jdXJyZW50VGFyZ2V0ICYmIGFjdGl2ZUVsZW1lbnQgPT09ICgwLCAkaGYwbGokZ2V0RXZlbnRUYXJnZXQpKGUubmF0aXZlRXZlbnQpKSB7XG4gICAgICAgICAgICBpZiAob25Gb2N1c1Byb3ApIG9uRm9jdXNQcm9wKGUpO1xuICAgICAgICAgICAgaWYgKG9uRm9jdXNDaGFuZ2UpIG9uRm9jdXNDaGFuZ2UodHJ1ZSk7XG4gICAgICAgICAgICBvblN5bnRoZXRpY0ZvY3VzKGUpO1xuICAgICAgICB9XG4gICAgfSwgW1xuICAgICAgICBvbkZvY3VzQ2hhbmdlLFxuICAgICAgICBvbkZvY3VzUHJvcCxcbiAgICAgICAgb25TeW50aGV0aWNGb2N1c1xuICAgIF0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGZvY3VzUHJvcHM6IHtcbiAgICAgICAgICAgIG9uRm9jdXM6ICFpc0Rpc2FibGVkICYmIChvbkZvY3VzUHJvcCB8fCBvbkZvY3VzQ2hhbmdlIHx8IG9uQmx1clByb3ApID8gb25Gb2N1cyA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG9uQmx1cjogIWlzRGlzYWJsZWQgJiYgKG9uQmx1clByb3AgfHwgb25Gb2N1c0NoYW5nZSkgPyBvbkJsdXIgOiB1bmRlZmluZWRcbiAgICAgICAgfVxuICAgIH07XG59XG5cblxuZXhwb3J0IHskYTFlYTU5ZDY4MjcwZjBkZCRleHBvcnQkZjgxNjhkOGRkOGZkNjZlNiBhcyB1c2VGb2N1c307XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VGb2N1cy5tb2R1bGUuanMubWFwXG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjAgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gZnVuY3Rpb24gJDkzOTI1MDgzZWNiYjM1OGMkZXhwb3J0JDQ4ZDFlYTYzMjA4MzAyNjAoaGFuZGxlcikge1xuICAgIGlmICghaGFuZGxlcikgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICBsZXQgc2hvdWxkU3RvcFByb3BhZ2F0aW9uID0gdHJ1ZTtcbiAgICByZXR1cm4gKGUpPT57XG4gICAgICAgIGxldCBldmVudCA9IHtcbiAgICAgICAgICAgIC4uLmUsXG4gICAgICAgICAgICBwcmV2ZW50RGVmYXVsdCAoKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlzRGVmYXVsdFByZXZlbnRlZCAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGUuaXNEZWZhdWx0UHJldmVudGVkKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3RvcFByb3BhZ2F0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkU3RvcFByb3BhZ2F0aW9uICYmIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIGNvbnNvbGUuZXJyb3IoJ3N0b3BQcm9wYWdhdGlvbiBpcyBub3cgdGhlIGRlZmF1bHQgYmVoYXZpb3IgZm9yIGV2ZW50cyBpbiBSZWFjdCBTcGVjdHJ1bS4gWW91IGNhbiB1c2UgY29udGludWVQcm9wYWdhdGlvbigpIHRvIHJldmVydCB0aGlzIGJlaGF2aW9yLicpO1xuICAgICAgICAgICAgICAgIGVsc2Ugc2hvdWxkU3RvcFByb3BhZ2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250aW51ZVByb3BhZ2F0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzaG91bGRTdG9wUHJvcGFnYXRpb24gPSBmYWxzZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpc1Byb3BhZ2F0aW9uU3RvcHBlZCAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNob3VsZFN0b3BQcm9wYWdhdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaGFuZGxlcihldmVudCk7XG4gICAgICAgIGlmIChzaG91bGRTdG9wUHJvcGFnYXRpb24pIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfTtcbn1cblxuXG5leHBvcnQgeyQ5MzkyNTA4M2VjYmIzNThjJGV4cG9ydCQ0OGQxZWE2MzIwODMwMjYwIGFzIGNyZWF0ZUV2ZW50SGFuZGxlcn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jcmVhdGVFdmVudEhhbmRsZXIubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHtjcmVhdGVFdmVudEhhbmRsZXIgYXMgJDkzOTI1MDgzZWNiYjM1OGMkZXhwb3J0JDQ4ZDFlYTYzMjA4MzAyNjB9IGZyb20gXCIuL2NyZWF0ZUV2ZW50SGFuZGxlci5tanNcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuZnVuY3Rpb24gJDQ2ZDgxOWZjYmFmMzU2NTQkZXhwb3J0JDhmNzE2NTQ4MDFjMmY3Y2QocHJvcHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBrZXlib2FyZFByb3BzOiBwcm9wcy5pc0Rpc2FibGVkID8ge30gOiB7XG4gICAgICAgICAgICBvbktleURvd246ICgwLCAkOTM5MjUwODNlY2JiMzU4YyRleHBvcnQkNDhkMWVhNjMyMDgzMDI2MCkocHJvcHMub25LZXlEb3duKSxcbiAgICAgICAgICAgIG9uS2V5VXA6ICgwLCAkOTM5MjUwODNlY2JiMzU4YyRleHBvcnQkNDhkMWVhNjMyMDgzMDI2MCkocHJvcHMub25LZXlVcClcbiAgICAgICAgfVxuICAgIH07XG59XG5cblxuZXhwb3J0IHskNDZkODE5ZmNiYWYzNTY1NCRleHBvcnQkOGY3MTY1NDgwMWMyZjdjZCBhcyB1c2VLZXlib2FyZH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VLZXlib2FyZC5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge2ZvY3VzU2FmZWx5IGFzICQzYWQzZjZlMTY0N2JjOThkJGV4cG9ydCQ4MGYzZTE0N2Q3ODE1NzFjfSBmcm9tIFwiLi9mb2N1c1NhZmVseS5tanNcIjtcbmltcG9ydCB7dXNlRm9jdXMgYXMgJGExZWE1OWQ2ODI3MGYwZGQkZXhwb3J0JGY4MTY4ZDhkZDhmZDY2ZTZ9IGZyb20gXCIuL3VzZUZvY3VzLm1qc1wiO1xuaW1wb3J0IHt1c2VLZXlib2FyZCBhcyAkNDZkODE5ZmNiYWYzNTY1NCRleHBvcnQkOGY3MTY1NDgwMWMyZjdjZH0gZnJvbSBcIi4vdXNlS2V5Ym9hcmQubWpzXCI7XG5pbXBvcnQge3VzZVN5bmNSZWYgYXMgJGZjUHVHJHVzZVN5bmNSZWYsIHVzZU9iamVjdFJlZiBhcyAkZmNQdUckdXNlT2JqZWN0UmVmLCBtZXJnZVByb3BzIGFzICRmY1B1RyRtZXJnZVByb3BzLCBnZXRPd25lcldpbmRvdyBhcyAkZmNQdUckZ2V0T3duZXJXaW5kb3csIGlzRm9jdXNhYmxlIGFzICRmY1B1RyRpc0ZvY3VzYWJsZSwgbWVyZ2VSZWZzIGFzICRmY1B1RyRtZXJnZVJlZnN9IGZyb20gXCJAcmVhY3QtYXJpYS91dGlsc1wiO1xuaW1wb3J0ICRmY1B1RyRyZWFjdCwge3VzZUNvbnRleHQgYXMgJGZjUHVHJHVzZUNvbnRleHQsIHVzZVJlZiBhcyAkZmNQdUckdXNlUmVmLCB1c2VFZmZlY3QgYXMgJGZjUHVHJHVzZUVmZmVjdCwgZm9yd2FyZFJlZiBhcyAkZmNQdUckZm9yd2FyZFJlZn0gZnJvbSBcInJlYWN0XCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcblxuXG5cblxubGV0ICRmNjQ1NjY3ZmViZjU3YTYzJGV4cG9ydCRmOTc2MmZhYjc3NTg4ZWNiID0gLyojX19QVVJFX18qLyAoMCwgJGZjUHVHJHJlYWN0KS5jcmVhdGVDb250ZXh0KG51bGwpO1xuZnVuY3Rpb24gJGY2NDU2NjdmZWJmNTdhNjMkdmFyJHVzZUZvY3VzYWJsZUNvbnRleHQocmVmKSB7XG4gICAgbGV0IGNvbnRleHQgPSAoMCwgJGZjUHVHJHVzZUNvbnRleHQpKCRmNjQ1NjY3ZmViZjU3YTYzJGV4cG9ydCRmOTc2MmZhYjc3NTg4ZWNiKSB8fCB7fTtcbiAgICAoMCwgJGZjUHVHJHVzZVN5bmNSZWYpKGNvbnRleHQsIHJlZik7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lXG4gICAgbGV0IHsgcmVmOiBfLCAuLi5vdGhlclByb3BzIH0gPSBjb250ZXh0O1xuICAgIHJldHVybiBvdGhlclByb3BzO1xufVxuY29uc3QgJGY2NDU2NjdmZWJmNTdhNjMkZXhwb3J0JDEzZjMyMDJhM2U1ZGRkNSA9IC8qI19fUFVSRV9fKi8gKDAsICRmY1B1RyRyZWFjdCkuZm9yd2FyZFJlZihmdW5jdGlvbiBGb2N1c2FibGVQcm92aWRlcihwcm9wcywgcmVmKSB7XG4gICAgbGV0IHsgY2hpbGRyZW46IGNoaWxkcmVuLCAuLi5vdGhlclByb3BzIH0gPSBwcm9wcztcbiAgICBsZXQgb2JqUmVmID0gKDAsICRmY1B1RyR1c2VPYmplY3RSZWYpKHJlZik7XG4gICAgbGV0IGNvbnRleHQgPSB7XG4gICAgICAgIC4uLm90aGVyUHJvcHMsXG4gICAgICAgIHJlZjogb2JqUmVmXG4gICAgfTtcbiAgICByZXR1cm4gLyojX19QVVJFX18qLyAoMCwgJGZjUHVHJHJlYWN0KS5jcmVhdGVFbGVtZW50KCRmNjQ1NjY3ZmViZjU3YTYzJGV4cG9ydCRmOTc2MmZhYjc3NTg4ZWNiLlByb3ZpZGVyLCB7XG4gICAgICAgIHZhbHVlOiBjb250ZXh0XG4gICAgfSwgY2hpbGRyZW4pO1xufSk7XG5mdW5jdGlvbiAkZjY0NTY2N2ZlYmY1N2E2MyRleHBvcnQkNGMwMTRkZTdjODk0MGI0Yyhwcm9wcywgZG9tUmVmKSB7XG4gICAgbGV0IHsgZm9jdXNQcm9wczogZm9jdXNQcm9wcyB9ID0gKDAsICRhMWVhNTlkNjgyNzBmMGRkJGV4cG9ydCRmODE2OGQ4ZGQ4ZmQ2NmU2KShwcm9wcyk7XG4gICAgbGV0IHsga2V5Ym9hcmRQcm9wczoga2V5Ym9hcmRQcm9wcyB9ID0gKDAsICQ0NmQ4MTlmY2JhZjM1NjU0JGV4cG9ydCQ4ZjcxNjU0ODAxYzJmN2NkKShwcm9wcyk7XG4gICAgbGV0IGludGVyYWN0aW9ucyA9ICgwLCAkZmNQdUckbWVyZ2VQcm9wcykoZm9jdXNQcm9wcywga2V5Ym9hcmRQcm9wcyk7XG4gICAgbGV0IGRvbVByb3BzID0gJGY2NDU2NjdmZWJmNTdhNjMkdmFyJHVzZUZvY3VzYWJsZUNvbnRleHQoZG9tUmVmKTtcbiAgICBsZXQgaW50ZXJhY3Rpb25Qcm9wcyA9IHByb3BzLmlzRGlzYWJsZWQgPyB7fSA6IGRvbVByb3BzO1xuICAgIGxldCBhdXRvRm9jdXNSZWYgPSAoMCwgJGZjUHVHJHVzZVJlZikocHJvcHMuYXV0b0ZvY3VzKTtcbiAgICAoMCwgJGZjUHVHJHVzZUVmZmVjdCkoKCk9PntcbiAgICAgICAgaWYgKGF1dG9Gb2N1c1JlZi5jdXJyZW50ICYmIGRvbVJlZi5jdXJyZW50KSAoMCwgJDNhZDNmNmUxNjQ3YmM5OGQkZXhwb3J0JDgwZjNlMTQ3ZDc4MTU3MWMpKGRvbVJlZi5jdXJyZW50KTtcbiAgICAgICAgYXV0b0ZvY3VzUmVmLmN1cnJlbnQgPSBmYWxzZTtcbiAgICB9LCBbXG4gICAgICAgIGRvbVJlZlxuICAgIF0pO1xuICAgIC8vIEFsd2F5cyBzZXQgYSB0YWJJbmRleCBzbyB0aGF0IFNhZmFyaSBhbGxvd3MgZm9jdXNpbmcgbmF0aXZlIGJ1dHRvbnMgYW5kIGlucHV0cy5cbiAgICBsZXQgdGFiSW5kZXggPSBwcm9wcy5leGNsdWRlRnJvbVRhYk9yZGVyID8gLTEgOiAwO1xuICAgIGlmIChwcm9wcy5pc0Rpc2FibGVkKSB0YWJJbmRleCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4ge1xuICAgICAgICBmb2N1c2FibGVQcm9wczogKDAsICRmY1B1RyRtZXJnZVByb3BzKSh7XG4gICAgICAgICAgICAuLi5pbnRlcmFjdGlvbnMsXG4gICAgICAgICAgICB0YWJJbmRleDogdGFiSW5kZXhcbiAgICAgICAgfSwgaW50ZXJhY3Rpb25Qcm9wcylcbiAgICB9O1xufVxuY29uc3QgJGY2NDU2NjdmZWJmNTdhNjMkZXhwb3J0JDM1YTNiZWJmN2VmMmQ5MzQgPSAvKiNfX1BVUkVfXyovICgwLCAkZmNQdUckZm9yd2FyZFJlZikoKHsgY2hpbGRyZW46IGNoaWxkcmVuLCAuLi5wcm9wcyB9LCByZWYpPT57XG4gICAgcmVmID0gKDAsICRmY1B1RyR1c2VPYmplY3RSZWYpKHJlZik7XG4gICAgbGV0IHsgZm9jdXNhYmxlUHJvcHM6IGZvY3VzYWJsZVByb3BzIH0gPSAkZjY0NTY2N2ZlYmY1N2E2MyRleHBvcnQkNGMwMTRkZTdjODk0MGI0Yyhwcm9wcywgcmVmKTtcbiAgICBsZXQgY2hpbGQgPSAoMCwgJGZjUHVHJHJlYWN0KS5DaGlsZHJlbi5vbmx5KGNoaWxkcmVuKTtcbiAgICAoMCwgJGZjUHVHJHVzZUVmZmVjdCkoKCk9PntcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHJldHVybjtcbiAgICAgICAgbGV0IGVsID0gcmVmLmN1cnJlbnQ7XG4gICAgICAgIGlmICghZWwgfHwgIShlbCBpbnN0YW5jZW9mICgwLCAkZmNQdUckZ2V0T3duZXJXaW5kb3cpKGVsKS5FbGVtZW50KSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignPEZvY3VzYWJsZT4gY2hpbGQgbXVzdCBmb3J3YXJkIGl0cyByZWYgdG8gYSBET00gZWxlbWVudC4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXByb3BzLmlzRGlzYWJsZWQgJiYgISgwLCAkZmNQdUckaXNGb2N1c2FibGUpKGVsKSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCc8Rm9jdXNhYmxlPiBjaGlsZCBtdXN0IGJlIGZvY3VzYWJsZS4gUGxlYXNlIGVuc3VyZSB0aGUgdGFiSW5kZXggcHJvcCBpcyBwYXNzZWQgdGhyb3VnaC4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWwubG9jYWxOYW1lICE9PSAnYnV0dG9uJyAmJiBlbC5sb2NhbE5hbWUgIT09ICdpbnB1dCcgJiYgZWwubG9jYWxOYW1lICE9PSAnc2VsZWN0JyAmJiBlbC5sb2NhbE5hbWUgIT09ICd0ZXh0YXJlYScgJiYgZWwubG9jYWxOYW1lICE9PSAnYScgJiYgZWwubG9jYWxOYW1lICE9PSAnYXJlYScgJiYgZWwubG9jYWxOYW1lICE9PSAnc3VtbWFyeScgJiYgZWwubG9jYWxOYW1lICE9PSAnaW1nJyAmJiBlbC5sb2NhbE5hbWUgIT09ICdzdmcnKSB7XG4gICAgICAgICAgICBsZXQgcm9sZSA9IGVsLmdldEF0dHJpYnV0ZSgncm9sZScpO1xuICAgICAgICAgICAgaWYgKCFyb2xlKSBjb25zb2xlLndhcm4oJzxGb2N1c2FibGU+IGNoaWxkIG11c3QgaGF2ZSBhbiBpbnRlcmFjdGl2ZSBBUklBIHJvbGUuJyk7XG4gICAgICAgICAgICBlbHNlIGlmICgvLyBodHRwczovL3czYy5naXRodWIuaW8vYXJpYS8jd2lkZ2V0X3JvbGVzXG4gICAgICAgICAgICByb2xlICE9PSAnYXBwbGljYXRpb24nICYmIHJvbGUgIT09ICdidXR0b24nICYmIHJvbGUgIT09ICdjaGVja2JveCcgJiYgcm9sZSAhPT0gJ2NvbWJvYm94JyAmJiByb2xlICE9PSAnZ3JpZGNlbGwnICYmIHJvbGUgIT09ICdsaW5rJyAmJiByb2xlICE9PSAnbWVudWl0ZW0nICYmIHJvbGUgIT09ICdtZW51aXRlbWNoZWNrYm94JyAmJiByb2xlICE9PSAnbWVudWl0ZW1yYWRpbycgJiYgcm9sZSAhPT0gJ29wdGlvbicgJiYgcm9sZSAhPT0gJ3JhZGlvJyAmJiByb2xlICE9PSAnc2VhcmNoYm94JyAmJiByb2xlICE9PSAnc2VwYXJhdG9yJyAmJiByb2xlICE9PSAnc2xpZGVyJyAmJiByb2xlICE9PSAnc3BpbmJ1dHRvbicgJiYgcm9sZSAhPT0gJ3N3aXRjaCcgJiYgcm9sZSAhPT0gJ3RhYicgJiYgcm9sZSAhPT0gJ3RhYnBhbmVsJyAmJiByb2xlICE9PSAndGV4dGJveCcgJiYgcm9sZSAhPT0gJ3RyZWVpdGVtJyAmJiAvLyBhcmlhLWRlc2NyaWJlZGJ5IGlzIGFsc28gYW5ub3VuY2VkIG9uIHRoZXNlIHJvbGVzXG4gICAgICAgICAgICByb2xlICE9PSAnaW1nJyAmJiByb2xlICE9PSAnbWV0ZXInICYmIHJvbGUgIT09ICdwcm9ncmVzc2JhcicpIGNvbnNvbGUud2FybihgPEZvY3VzYWJsZT4gY2hpbGQgbXVzdCBoYXZlIGFuIGludGVyYWN0aXZlIEFSSUEgcm9sZS4gR290IFwiJHtyb2xlfVwiLmApO1xuICAgICAgICB9XG4gICAgfSwgW1xuICAgICAgICByZWYsXG4gICAgICAgIHByb3BzLmlzRGlzYWJsZWRcbiAgICBdKTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgbGV0IGNoaWxkUmVmID0gcGFyc2VJbnQoKDAsICRmY1B1RyRyZWFjdCkudmVyc2lvbiwgMTApIDwgMTkgPyBjaGlsZC5yZWYgOiBjaGlsZC5wcm9wcy5yZWY7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gKDAsICRmY1B1RyRyZWFjdCkuY2xvbmVFbGVtZW50KGNoaWxkLCB7XG4gICAgICAgIC4uLigwLCAkZmNQdUckbWVyZ2VQcm9wcykoZm9jdXNhYmxlUHJvcHMsIGNoaWxkLnByb3BzKSxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZWY6ICgwLCAkZmNQdUckbWVyZ2VSZWZzKShjaGlsZFJlZiwgcmVmKVxuICAgIH0pO1xufSk7XG5cblxuZXhwb3J0IHskZjY0NTY2N2ZlYmY1N2E2MyRleHBvcnQkZjk3NjJmYWI3NzU4OGVjYiBhcyBGb2N1c2FibGVDb250ZXh0LCAkZjY0NTY2N2ZlYmY1N2E2MyRleHBvcnQkMTNmMzIwMmEzZTVkZGQ1IGFzIEZvY3VzYWJsZVByb3ZpZGVyLCAkZjY0NTY2N2ZlYmY1N2E2MyRleHBvcnQkNGMwMTRkZTdjODk0MGI0YyBhcyB1c2VGb2N1c2FibGUsICRmNjQ1NjY3ZmViZjU3YTYzJGV4cG9ydCQzNWEzYmViZjdlZjJkOTM0IGFzIEZvY3VzYWJsZX07XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VGb2N1c2FibGUubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHt1c2VQcmVzcyBhcyAkZjZjMzFjY2UyYWRmNjU0ZiRleHBvcnQkNDU3MTJlY2VkYTZmYWQyMX0gZnJvbSBcIi4vdXNlUHJlc3MubWpzXCI7XG5pbXBvcnQge3VzZUZvY3VzYWJsZSBhcyAkZjY0NTY2N2ZlYmY1N2E2MyRleHBvcnQkNGMwMTRkZTdjODk0MGI0Y30gZnJvbSBcIi4vdXNlRm9jdXNhYmxlLm1qc1wiO1xuaW1wb3J0IHt1c2VPYmplY3RSZWYgYXMgJGhoRHlGJHVzZU9iamVjdFJlZiwgZ2V0T3duZXJXaW5kb3cgYXMgJGhoRHlGJGdldE93bmVyV2luZG93LCBpc0ZvY3VzYWJsZSBhcyAkaGhEeUYkaXNGb2N1c2FibGUsIG1lcmdlUHJvcHMgYXMgJGhoRHlGJG1lcmdlUHJvcHMsIG1lcmdlUmVmcyBhcyAkaGhEeUYkbWVyZ2VSZWZzfSBmcm9tIFwiQHJlYWN0LWFyaWEvdXRpbHNcIjtcbmltcG9ydCAkaGhEeUYkcmVhY3QsIHt1c2VFZmZlY3QgYXMgJGhoRHlGJHVzZUVmZmVjdH0gZnJvbSBcInJlYWN0XCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcblxuXG5cbmNvbnN0ICQzYjExN2U0M2RjMGNhOTVkJGV4cG9ydCQyN2M3MDFlZDllNDQ5ZTk5ID0gLyojX19QVVJFX18qLyAoMCwgJGhoRHlGJHJlYWN0KS5mb3J3YXJkUmVmKCh7IGNoaWxkcmVuOiBjaGlsZHJlbiwgLi4ucHJvcHMgfSwgcmVmKT0+e1xuICAgIHJlZiA9ICgwLCAkaGhEeUYkdXNlT2JqZWN0UmVmKShyZWYpO1xuICAgIGxldCB7IHByZXNzUHJvcHM6IHByZXNzUHJvcHMgfSA9ICgwLCAkZjZjMzFjY2UyYWRmNjU0ZiRleHBvcnQkNDU3MTJlY2VkYTZmYWQyMSkoe1xuICAgICAgICAuLi5wcm9wcyxcbiAgICAgICAgcmVmOiByZWZcbiAgICB9KTtcbiAgICBsZXQgeyBmb2N1c2FibGVQcm9wczogZm9jdXNhYmxlUHJvcHMgfSA9ICgwLCAkZjY0NTY2N2ZlYmY1N2E2MyRleHBvcnQkNGMwMTRkZTdjODk0MGI0YykocHJvcHMsIHJlZik7XG4gICAgbGV0IGNoaWxkID0gKDAsICRoaER5RiRyZWFjdCkuQ2hpbGRyZW4ub25seShjaGlsZHJlbik7XG4gICAgKDAsICRoaER5RiR1c2VFZmZlY3QpKCgpPT57XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSByZXR1cm47XG4gICAgICAgIGxldCBlbCA9IHJlZi5jdXJyZW50O1xuICAgICAgICBpZiAoIWVsIHx8ICEoZWwgaW5zdGFuY2VvZiAoMCwgJGhoRHlGJGdldE93bmVyV2luZG93KShlbCkuRWxlbWVudCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJzxQcmVzc2FibGU+IGNoaWxkIG11c3QgZm9yd2FyZCBpdHMgcmVmIHRvIGEgRE9NIGVsZW1lbnQuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFwcm9wcy5pc0Rpc2FibGVkICYmICEoMCwgJGhoRHlGJGlzRm9jdXNhYmxlKShlbCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignPFByZXNzYWJsZT4gY2hpbGQgbXVzdCBiZSBmb2N1c2FibGUuIFBsZWFzZSBlbnN1cmUgdGhlIHRhYkluZGV4IHByb3AgaXMgcGFzc2VkIHRocm91Z2guJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsLmxvY2FsTmFtZSAhPT0gJ2J1dHRvbicgJiYgZWwubG9jYWxOYW1lICE9PSAnaW5wdXQnICYmIGVsLmxvY2FsTmFtZSAhPT0gJ3NlbGVjdCcgJiYgZWwubG9jYWxOYW1lICE9PSAndGV4dGFyZWEnICYmIGVsLmxvY2FsTmFtZSAhPT0gJ2EnICYmIGVsLmxvY2FsTmFtZSAhPT0gJ2FyZWEnICYmIGVsLmxvY2FsTmFtZSAhPT0gJ3N1bW1hcnknKSB7XG4gICAgICAgICAgICBsZXQgcm9sZSA9IGVsLmdldEF0dHJpYnV0ZSgncm9sZScpO1xuICAgICAgICAgICAgaWYgKCFyb2xlKSBjb25zb2xlLndhcm4oJzxQcmVzc2FibGU+IGNoaWxkIG11c3QgaGF2ZSBhbiBpbnRlcmFjdGl2ZSBBUklBIHJvbGUuJyk7XG4gICAgICAgICAgICBlbHNlIGlmICgvLyBodHRwczovL3czYy5naXRodWIuaW8vYXJpYS8jd2lkZ2V0X3JvbGVzXG4gICAgICAgICAgICByb2xlICE9PSAnYXBwbGljYXRpb24nICYmIHJvbGUgIT09ICdidXR0b24nICYmIHJvbGUgIT09ICdjaGVja2JveCcgJiYgcm9sZSAhPT0gJ2NvbWJvYm94JyAmJiByb2xlICE9PSAnZ3JpZGNlbGwnICYmIHJvbGUgIT09ICdsaW5rJyAmJiByb2xlICE9PSAnbWVudWl0ZW0nICYmIHJvbGUgIT09ICdtZW51aXRlbWNoZWNrYm94JyAmJiByb2xlICE9PSAnbWVudWl0ZW1yYWRpbycgJiYgcm9sZSAhPT0gJ29wdGlvbicgJiYgcm9sZSAhPT0gJ3JhZGlvJyAmJiByb2xlICE9PSAnc2VhcmNoYm94JyAmJiByb2xlICE9PSAnc2VwYXJhdG9yJyAmJiByb2xlICE9PSAnc2xpZGVyJyAmJiByb2xlICE9PSAnc3BpbmJ1dHRvbicgJiYgcm9sZSAhPT0gJ3N3aXRjaCcgJiYgcm9sZSAhPT0gJ3RhYicgJiYgcm9sZSAhPT0gJ3RleHRib3gnICYmIHJvbGUgIT09ICd0cmVlaXRlbScpIGNvbnNvbGUud2FybihgPFByZXNzYWJsZT4gY2hpbGQgbXVzdCBoYXZlIGFuIGludGVyYWN0aXZlIEFSSUEgcm9sZS4gR290IFwiJHtyb2xlfVwiLmApO1xuICAgICAgICB9XG4gICAgfSwgW1xuICAgICAgICByZWYsXG4gICAgICAgIHByb3BzLmlzRGlzYWJsZWRcbiAgICBdKTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgbGV0IGNoaWxkUmVmID0gcGFyc2VJbnQoKDAsICRoaER5RiRyZWFjdCkudmVyc2lvbiwgMTApIDwgMTkgPyBjaGlsZC5yZWYgOiBjaGlsZC5wcm9wcy5yZWY7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gKDAsICRoaER5RiRyZWFjdCkuY2xvbmVFbGVtZW50KGNoaWxkLCB7XG4gICAgICAgIC4uLigwLCAkaGhEeUYkbWVyZ2VQcm9wcykocHJlc3NQcm9wcywgZm9jdXNhYmxlUHJvcHMsIGNoaWxkLnByb3BzKSxcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZWY6ICgwLCAkaGhEeUYkbWVyZ2VSZWZzKShjaGlsZFJlZiwgcmVmKVxuICAgIH0pO1xufSk7XG5cblxuZXhwb3J0IHskM2IxMTdlNDNkYzBjYTk1ZCRleHBvcnQkMjdjNzAxZWQ5ZTQ0OWU5OSBhcyBQcmVzc2FibGV9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UHJlc3NhYmxlLm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7UHJlc3NSZXNwb25kZXJDb250ZXh0IGFzICRhZTFlZWJhOGI5ZWFmZDA4JGV4cG9ydCQ1MTY1ZWNjYjM1YWFhZGI1fSBmcm9tIFwiLi9jb250ZXh0Lm1qc1wiO1xuaW1wb3J0IHt1c2VPYmplY3RSZWYgYXMgJDg3UlBrJHVzZU9iamVjdFJlZiwgbWVyZ2VQcm9wcyBhcyAkODdSUGskbWVyZ2VQcm9wcywgdXNlU3luY1JlZiBhcyAkODdSUGskdXNlU3luY1JlZn0gZnJvbSBcIkByZWFjdC1hcmlhL3V0aWxzXCI7XG5pbXBvcnQgJDg3UlBrJHJlYWN0LCB7dXNlUmVmIGFzICQ4N1JQayR1c2VSZWYsIHVzZUNvbnRleHQgYXMgJDg3UlBrJHVzZUNvbnRleHQsIHVzZUVmZmVjdCBhcyAkODdSUGskdXNlRWZmZWN0LCB1c2VNZW1vIGFzICQ4N1JQayR1c2VNZW1vfSBmcm9tIFwicmVhY3RcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuXG5cbmNvbnN0ICRmMWFiOGM3NTQ3OGM2ZjczJGV4cG9ydCQzMzUxODcxZWU0YjI4OGI4ID0gLyojX19QVVJFX18qLyAoMCwgJDg3UlBrJHJlYWN0KS5mb3J3YXJkUmVmKCh7IGNoaWxkcmVuOiBjaGlsZHJlbiwgLi4ucHJvcHMgfSwgcmVmKT0+e1xuICAgIGxldCBpc1JlZ2lzdGVyZWQgPSAoMCwgJDg3UlBrJHVzZVJlZikoZmFsc2UpO1xuICAgIGxldCBwcmV2Q29udGV4dCA9ICgwLCAkODdSUGskdXNlQ29udGV4dCkoKDAsICRhZTFlZWJhOGI5ZWFmZDA4JGV4cG9ydCQ1MTY1ZWNjYjM1YWFhZGI1KSk7XG4gICAgcmVmID0gKDAsICQ4N1JQayR1c2VPYmplY3RSZWYpKHJlZiB8fCAocHJldkNvbnRleHQgPT09IG51bGwgfHwgcHJldkNvbnRleHQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHByZXZDb250ZXh0LnJlZikpO1xuICAgIGxldCBjb250ZXh0ID0gKDAsICQ4N1JQayRtZXJnZVByb3BzKShwcmV2Q29udGV4dCB8fCB7fSwge1xuICAgICAgICAuLi5wcm9wcyxcbiAgICAgICAgcmVmOiByZWYsXG4gICAgICAgIHJlZ2lzdGVyICgpIHtcbiAgICAgICAgICAgIGlzUmVnaXN0ZXJlZC5jdXJyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChwcmV2Q29udGV4dCkgcHJldkNvbnRleHQucmVnaXN0ZXIoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICgwLCAkODdSUGskdXNlU3luY1JlZikocHJldkNvbnRleHQsIHJlZik7XG4gICAgKDAsICQ4N1JQayR1c2VFZmZlY3QpKCgpPT57XG4gICAgICAgIGlmICghaXNSZWdpc3RlcmVkLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSBjb25zb2xlLndhcm4oXCJBIFByZXNzUmVzcG9uZGVyIHdhcyByZW5kZXJlZCB3aXRob3V0IGEgcHJlc3NhYmxlIGNoaWxkLiBFaXRoZXIgY2FsbCB0aGUgdXNlUHJlc3MgaG9vaywgb3Igd3JhcCB5b3VyIERPTSBub2RlIHdpdGggPFByZXNzYWJsZT4gY29tcG9uZW50LlwiKTtcbiAgICAgICAgICAgIGlzUmVnaXN0ZXJlZC5jdXJyZW50ID0gdHJ1ZTsgLy8gb25seSB3YXJuIG9uY2UgaW4gc3RyaWN0IG1vZGUuXG4gICAgICAgIH1cbiAgICB9LCBbXSk7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gKDAsICQ4N1JQayRyZWFjdCkuY3JlYXRlRWxlbWVudCgoMCwgJGFlMWVlYmE4YjllYWZkMDgkZXhwb3J0JDUxNjVlY2NiMzVhYWFkYjUpLlByb3ZpZGVyLCB7XG4gICAgICAgIHZhbHVlOiBjb250ZXh0XG4gICAgfSwgY2hpbGRyZW4pO1xufSk7XG5mdW5jdGlvbiAkZjFhYjhjNzU0NzhjNmY3MyRleHBvcnQkY2Y3NTQyOGUwYjllZDFlYSh7IGNoaWxkcmVuOiBjaGlsZHJlbiB9KSB7XG4gICAgbGV0IGNvbnRleHQgPSAoMCwgJDg3UlBrJHVzZU1lbW8pKCgpPT4oe1xuICAgICAgICAgICAgcmVnaXN0ZXI6ICgpPT57fVxuICAgICAgICB9KSwgW10pO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovICgwLCAkODdSUGskcmVhY3QpLmNyZWF0ZUVsZW1lbnQoKDAsICRhZTFlZWJhOGI5ZWFmZDA4JGV4cG9ydCQ1MTY1ZWNjYjM1YWFhZGI1KS5Qcm92aWRlciwge1xuICAgICAgICB2YWx1ZTogY29udGV4dFxuICAgIH0sIGNoaWxkcmVuKTtcbn1cblxuXG5leHBvcnQgeyRmMWFiOGM3NTQ3OGM2ZjczJGV4cG9ydCQzMzUxODcxZWU0YjI4OGI4IGFzIFByZXNzUmVzcG9uZGVyLCAkZjFhYjhjNzU0NzhjNmY3MyRleHBvcnQkY2Y3NTQyOGUwYjllZDFlYSBhcyBDbGVhclByZXNzUmVzcG9uZGVyfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVByZXNzUmVzcG9uZGVyLm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7Y3JlYXRlU3ludGhldGljRXZlbnQgYXMgJDhhOWNiMjc5ZGM4N2UxMzAkZXhwb3J0JDUyNWJjNDkyMWQ1NmQ0YSwgc2V0RXZlbnRUYXJnZXQgYXMgJDhhOWNiMjc5ZGM4N2UxMzAkZXhwb3J0JGMyYjdhYmU1ZDYxZWM2OTYsIHVzZVN5bnRoZXRpY0JsdXJFdmVudCBhcyAkOGE5Y2IyNzlkYzg3ZTEzMCRleHBvcnQkNzE1YzY4MmQwOWQ2MzljY30gZnJvbSBcIi4vdXRpbHMubWpzXCI7XG5pbXBvcnQge3VzZVJlZiBhcyAkM2I5UTAkdXNlUmVmLCB1c2VDYWxsYmFjayBhcyAkM2I5UTAkdXNlQ2FsbGJhY2t9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHt1c2VHbG9iYWxMaXN0ZW5lcnMgYXMgJDNiOVEwJHVzZUdsb2JhbExpc3RlbmVycywgZ2V0T3duZXJEb2N1bWVudCBhcyAkM2I5UTAkZ2V0T3duZXJEb2N1bWVudCwgZ2V0QWN0aXZlRWxlbWVudCBhcyAkM2I5UTAkZ2V0QWN0aXZlRWxlbWVudCwgZ2V0RXZlbnRUYXJnZXQgYXMgJDNiOVEwJGdldEV2ZW50VGFyZ2V0LCBub2RlQ29udGFpbnMgYXMgJDNiOVEwJG5vZGVDb250YWluc30gZnJvbSBcIkByZWFjdC1hcmlhL3V0aWxzXCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyAvLyBQb3J0aW9ucyBvZiB0aGUgY29kZSBpbiB0aGlzIGZpbGUgYXJlIGJhc2VkIG9uIGNvZGUgZnJvbSByZWFjdC5cbi8vIE9yaWdpbmFsIGxpY2Vuc2luZyBmb3IgdGhlIGZvbGxvd2luZyBjYW4gYmUgZm91bmQgaW4gdGhlXG4vLyBOT1RJQ0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QvdHJlZS9jYzdjMWFlY2U0NmE2YjY5YjQxOTU4ZDczMWUwZmQyN2M5NGJmYzZjL3BhY2thZ2VzL3JlYWN0LWludGVyYWN0aW9uc1xuXG5cblxuZnVuY3Rpb24gJDlhYjk0MjYyYmQwMDQ3YzckZXhwb3J0JDQyMGU2ODI3MzE2NWY0ZWMocHJvcHMpIHtcbiAgICBsZXQgeyBpc0Rpc2FibGVkOiBpc0Rpc2FibGVkLCBvbkJsdXJXaXRoaW46IG9uQmx1cldpdGhpbiwgb25Gb2N1c1dpdGhpbjogb25Gb2N1c1dpdGhpbiwgb25Gb2N1c1dpdGhpbkNoYW5nZTogb25Gb2N1c1dpdGhpbkNoYW5nZSB9ID0gcHJvcHM7XG4gICAgbGV0IHN0YXRlID0gKDAsICQzYjlRMCR1c2VSZWYpKHtcbiAgICAgICAgaXNGb2N1c1dpdGhpbjogZmFsc2VcbiAgICB9KTtcbiAgICBsZXQgeyBhZGRHbG9iYWxMaXN0ZW5lcjogYWRkR2xvYmFsTGlzdGVuZXIsIHJlbW92ZUFsbEdsb2JhbExpc3RlbmVyczogcmVtb3ZlQWxsR2xvYmFsTGlzdGVuZXJzIH0gPSAoMCwgJDNiOVEwJHVzZUdsb2JhbExpc3RlbmVycykoKTtcbiAgICBsZXQgb25CbHVyID0gKDAsICQzYjlRMCR1c2VDYWxsYmFjaykoKGUpPT57XG4gICAgICAgIC8vIElnbm9yZSBldmVudHMgYnViYmxpbmcgdGhyb3VnaCBwb3J0YWxzLlxuICAgICAgICBpZiAoIWUuY3VycmVudFRhcmdldC5jb250YWlucyhlLnRhcmdldCkpIHJldHVybjtcbiAgICAgICAgLy8gV2UgZG9uJ3Qgd2FudCB0byB0cmlnZ2VyIG9uQmx1cldpdGhpbiBhbmQgdGhlbiBpbW1lZGlhdGVseSBvbkZvY3VzV2l0aGluIGFnYWluXG4gICAgICAgIC8vIHdoZW4gbW92aW5nIGZvY3VzIGluc2lkZSB0aGUgZWxlbWVudC4gT25seSB0cmlnZ2VyIGlmIHRoZSBjdXJyZW50VGFyZ2V0IGRvZXNuJ3RcbiAgICAgICAgLy8gaW5jbHVkZSB0aGUgcmVsYXRlZFRhcmdldCAod2hlcmUgZm9jdXMgaXMgbW92aW5nKS5cbiAgICAgICAgaWYgKHN0YXRlLmN1cnJlbnQuaXNGb2N1c1dpdGhpbiAmJiAhZS5jdXJyZW50VGFyZ2V0LmNvbnRhaW5zKGUucmVsYXRlZFRhcmdldCkpIHtcbiAgICAgICAgICAgIHN0YXRlLmN1cnJlbnQuaXNGb2N1c1dpdGhpbiA9IGZhbHNlO1xuICAgICAgICAgICAgcmVtb3ZlQWxsR2xvYmFsTGlzdGVuZXJzKCk7XG4gICAgICAgICAgICBpZiAob25CbHVyV2l0aGluKSBvbkJsdXJXaXRoaW4oZSk7XG4gICAgICAgICAgICBpZiAob25Gb2N1c1dpdGhpbkNoYW5nZSkgb25Gb2N1c1dpdGhpbkNoYW5nZShmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbXG4gICAgICAgIG9uQmx1cldpdGhpbixcbiAgICAgICAgb25Gb2N1c1dpdGhpbkNoYW5nZSxcbiAgICAgICAgc3RhdGUsXG4gICAgICAgIHJlbW92ZUFsbEdsb2JhbExpc3RlbmVyc1xuICAgIF0pO1xuICAgIGxldCBvblN5bnRoZXRpY0ZvY3VzID0gKDAsICQ4YTljYjI3OWRjODdlMTMwJGV4cG9ydCQ3MTVjNjgyZDA5ZDYzOWNjKShvbkJsdXIpO1xuICAgIGxldCBvbkZvY3VzID0gKDAsICQzYjlRMCR1c2VDYWxsYmFjaykoKGUpPT57XG4gICAgICAgIC8vIElnbm9yZSBldmVudHMgYnViYmxpbmcgdGhyb3VnaCBwb3J0YWxzLlxuICAgICAgICBpZiAoIWUuY3VycmVudFRhcmdldC5jb250YWlucyhlLnRhcmdldCkpIHJldHVybjtcbiAgICAgICAgLy8gRG91YmxlIGNoZWNrIHRoYXQgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBhY3R1YWxseSBtYXRjaGVzIGUudGFyZ2V0IGluIGNhc2UgYSBwcmV2aW91c2x5IGNoYWluZWRcbiAgICAgICAgLy8gZm9jdXMgaGFuZGxlciBhbHJlYWR5IG1vdmVkIGZvY3VzIHNvbWV3aGVyZSBlbHNlLlxuICAgICAgICBjb25zdCBvd25lckRvY3VtZW50ID0gKDAsICQzYjlRMCRnZXRPd25lckRvY3VtZW50KShlLnRhcmdldCk7XG4gICAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSAoMCwgJDNiOVEwJGdldEFjdGl2ZUVsZW1lbnQpKG93bmVyRG9jdW1lbnQpO1xuICAgICAgICBpZiAoIXN0YXRlLmN1cnJlbnQuaXNGb2N1c1dpdGhpbiAmJiBhY3RpdmVFbGVtZW50ID09PSAoMCwgJDNiOVEwJGdldEV2ZW50VGFyZ2V0KShlLm5hdGl2ZUV2ZW50KSkge1xuICAgICAgICAgICAgaWYgKG9uRm9jdXNXaXRoaW4pIG9uRm9jdXNXaXRoaW4oZSk7XG4gICAgICAgICAgICBpZiAob25Gb2N1c1dpdGhpbkNoYW5nZSkgb25Gb2N1c1dpdGhpbkNoYW5nZSh0cnVlKTtcbiAgICAgICAgICAgIHN0YXRlLmN1cnJlbnQuaXNGb2N1c1dpdGhpbiA9IHRydWU7XG4gICAgICAgICAgICBvblN5bnRoZXRpY0ZvY3VzKGUpO1xuICAgICAgICAgICAgLy8gQnJvd3NlcnMgZG9uJ3QgZmlyZSBibHVyIGV2ZW50cyB3aGVuIGVsZW1lbnRzIGFyZSByZW1vdmVkIGZyb20gdGhlIERPTS5cbiAgICAgICAgICAgIC8vIEhvd2V2ZXIsIGlmIGEgZm9jdXMgZXZlbnQgb2NjdXJzIG91dHNpZGUgdGhlIGVsZW1lbnQgd2UncmUgdHJhY2tpbmcsIHdlXG4gICAgICAgICAgICAvLyBjYW4gbWFudWFsbHkgZmlyZSBvbkJsdXIuXG4gICAgICAgICAgICBsZXQgY3VycmVudFRhcmdldCA9IGUuY3VycmVudFRhcmdldDtcbiAgICAgICAgICAgIGFkZEdsb2JhbExpc3RlbmVyKG93bmVyRG9jdW1lbnQsICdmb2N1cycsIChlKT0+e1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5jdXJyZW50LmlzRm9jdXNXaXRoaW4gJiYgISgwLCAkM2I5UTAkbm9kZUNvbnRhaW5zKShjdXJyZW50VGFyZ2V0LCBlLnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hdGl2ZUV2ZW50ID0gbmV3IG93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcuRm9jdXNFdmVudCgnYmx1cicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0ZWRUYXJnZXQ6IGUudGFyZ2V0XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAoMCwgJDhhOWNiMjc5ZGM4N2UxMzAkZXhwb3J0JGMyYjdhYmU1ZDYxZWM2OTYpKG5hdGl2ZUV2ZW50LCBjdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGV2ZW50ID0gKDAsICQ4YTljYjI3OWRjODdlMTMwJGV4cG9ydCQ1MjViYzQ5MjFkNTZkNGEpKG5hdGl2ZUV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgb25CbHVyKGV2ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgY2FwdHVyZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LCBbXG4gICAgICAgIG9uRm9jdXNXaXRoaW4sXG4gICAgICAgIG9uRm9jdXNXaXRoaW5DaGFuZ2UsXG4gICAgICAgIG9uU3ludGhldGljRm9jdXMsXG4gICAgICAgIGFkZEdsb2JhbExpc3RlbmVyLFxuICAgICAgICBvbkJsdXJcbiAgICBdKTtcbiAgICBpZiAoaXNEaXNhYmxlZCkgcmV0dXJuIHtcbiAgICAgICAgZm9jdXNXaXRoaW5Qcm9wczoge1xuICAgICAgICAgICAgLy8gVGhlc2UgY2Fubm90IGJlIG51bGwsIHRoYXQgd291bGQgY29uZmxpY3QgaW4gbWVyZ2VQcm9wc1xuICAgICAgICAgICAgb25Gb2N1czogdW5kZWZpbmVkLFxuICAgICAgICAgICAgb25CbHVyOiB1bmRlZmluZWRcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZm9jdXNXaXRoaW5Qcm9wczoge1xuICAgICAgICAgICAgb25Gb2N1czogb25Gb2N1cyxcbiAgICAgICAgICAgIG9uQmx1cjogb25CbHVyXG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5cbmV4cG9ydCB7JDlhYjk0MjYyYmQwMDQ3YzckZXhwb3J0JDQyMGU2ODI3MzE2NWY0ZWMgYXMgdXNlRm9jdXNXaXRoaW59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlRm9jdXNXaXRoaW4ubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHt1c2VHbG9iYWxMaXN0ZW5lcnMgYXMgJEFXeG5UJHVzZUdsb2JhbExpc3RlbmVycywgZ2V0T3duZXJEb2N1bWVudCBhcyAkQVd4blQkZ2V0T3duZXJEb2N1bWVudCwgbm9kZUNvbnRhaW5zIGFzICRBV3huVCRub2RlQ29udGFpbnN9IGZyb20gXCJAcmVhY3QtYXJpYS91dGlsc1wiO1xuaW1wb3J0IHt1c2VTdGF0ZSBhcyAkQVd4blQkdXNlU3RhdGUsIHVzZVJlZiBhcyAkQVd4blQkdXNlUmVmLCB1c2VFZmZlY3QgYXMgJEFXeG5UJHVzZUVmZmVjdCwgdXNlTWVtbyBhcyAkQVd4blQkdXNlTWVtb30gZnJvbSBcInJlYWN0XCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyAvLyBQb3J0aW9ucyBvZiB0aGUgY29kZSBpbiB0aGlzIGZpbGUgYXJlIGJhc2VkIG9uIGNvZGUgZnJvbSByZWFjdC5cbi8vIE9yaWdpbmFsIGxpY2Vuc2luZyBmb3IgdGhlIGZvbGxvd2luZyBjYW4gYmUgZm91bmQgaW4gdGhlXG4vLyBOT1RJQ0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QvdHJlZS9jYzdjMWFlY2U0NmE2YjY5YjQxOTU4ZDczMWUwZmQyN2M5NGJmYzZjL3BhY2thZ2VzL3JlYWN0LWludGVyYWN0aW9uc1xuXG5cbi8vIGlPUyBmaXJlcyBvblBvaW50ZXJFbnRlciB0d2ljZTogb25jZSB3aXRoIHBvaW50ZXJUeXBlPVwidG91Y2hcIiBhbmQgYWdhaW4gd2l0aCBwb2ludGVyVHlwZT1cIm1vdXNlXCIuXG4vLyBXZSB3YW50IHRvIGlnbm9yZSB0aGVzZSBlbXVsYXRlZCBldmVudHMgc28gdGhleSBkbyBub3QgdHJpZ2dlciBob3ZlciBiZWhhdmlvci5cbi8vIFNlZSBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MjE0NjA5LlxubGV0ICQ2MTc5YjkzNjcwNWU3NmQzJHZhciRnbG9iYWxJZ25vcmVFbXVsYXRlZE1vdXNlRXZlbnRzID0gZmFsc2U7XG5sZXQgJDYxNzliOTM2NzA1ZTc2ZDMkdmFyJGhvdmVyQ291bnQgPSAwO1xuZnVuY3Rpb24gJDYxNzliOTM2NzA1ZTc2ZDMkdmFyJHNldEdsb2JhbElnbm9yZUVtdWxhdGVkTW91c2VFdmVudHMoKSB7XG4gICAgJDYxNzliOTM2NzA1ZTc2ZDMkdmFyJGdsb2JhbElnbm9yZUVtdWxhdGVkTW91c2VFdmVudHMgPSB0cnVlO1xuICAgIC8vIENsZWFyIGdsb2JhbElnbm9yZUVtdWxhdGVkTW91c2VFdmVudHMgYWZ0ZXIgYSBzaG9ydCB0aW1lb3V0LiBpT1MgZmlyZXMgb25Qb2ludGVyRW50ZXJcbiAgICAvLyB3aXRoIHBvaW50ZXJUeXBlPVwibW91c2VcIiBpbW1lZGlhdGVseSBhZnRlciBvblBvaW50ZXJVcCBhbmQgYmVmb3JlIG9uRm9jdXMuIE9uIG90aGVyXG4gICAgLy8gZGV2aWNlcyB0aGF0IGRvbid0IGhhdmUgdGhpcyBxdWlyaywgd2UgZG9uJ3Qgd2FudCB0byBpZ25vcmUgYSBtb3VzZSBob3ZlciBzb21ldGltZSBpblxuICAgIC8vIHRoZSBkaXN0YW50IGZ1dHVyZSBiZWNhdXNlIGEgdXNlciBwcmV2aW91c2x5IHRvdWNoZWQgdGhlIGVsZW1lbnQuXG4gICAgc2V0VGltZW91dCgoKT0+e1xuICAgICAgICAkNjE3OWI5MzY3MDVlNzZkMyR2YXIkZ2xvYmFsSWdub3JlRW11bGF0ZWRNb3VzZUV2ZW50cyA9IGZhbHNlO1xuICAgIH0sIDUwKTtcbn1cbmZ1bmN0aW9uICQ2MTc5YjkzNjcwNWU3NmQzJHZhciRoYW5kbGVHbG9iYWxQb2ludGVyRXZlbnQoZSkge1xuICAgIGlmIChlLnBvaW50ZXJUeXBlID09PSAndG91Y2gnKSAkNjE3OWI5MzY3MDVlNzZkMyR2YXIkc2V0R2xvYmFsSWdub3JlRW11bGF0ZWRNb3VzZUV2ZW50cygpO1xufVxuZnVuY3Rpb24gJDYxNzliOTM2NzA1ZTc2ZDMkdmFyJHNldHVwR2xvYmFsVG91Y2hFdmVudHMoKSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcbiAgICBpZiAoJDYxNzliOTM2NzA1ZTc2ZDMkdmFyJGhvdmVyQ291bnQgPT09IDApIHtcbiAgICAgICAgaWYgKHR5cGVvZiBQb2ludGVyRXZlbnQgIT09ICd1bmRlZmluZWQnKSBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVydXAnLCAkNjE3OWI5MzY3MDVlNzZkMyR2YXIkaGFuZGxlR2xvYmFsUG9pbnRlckV2ZW50KTtcbiAgICAgICAgZWxzZSBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICd0ZXN0JykgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCAkNjE3OWI5MzY3MDVlNzZkMyR2YXIkc2V0R2xvYmFsSWdub3JlRW11bGF0ZWRNb3VzZUV2ZW50cyk7XG4gICAgfVxuICAgICQ2MTc5YjkzNjcwNWU3NmQzJHZhciRob3ZlckNvdW50Kys7XG4gICAgcmV0dXJuICgpPT57XG4gICAgICAgICQ2MTc5YjkzNjcwNWU3NmQzJHZhciRob3ZlckNvdW50LS07XG4gICAgICAgIGlmICgkNjE3OWI5MzY3MDVlNzZkMyR2YXIkaG92ZXJDb3VudCA+IDApIHJldHVybjtcbiAgICAgICAgaWYgKHR5cGVvZiBQb2ludGVyRXZlbnQgIT09ICd1bmRlZmluZWQnKSBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVydXAnLCAkNjE3OWI5MzY3MDVlNzZkMyR2YXIkaGFuZGxlR2xvYmFsUG9pbnRlckV2ZW50KTtcbiAgICAgICAgZWxzZSBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICd0ZXN0JykgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCAkNjE3OWI5MzY3MDVlNzZkMyR2YXIkc2V0R2xvYmFsSWdub3JlRW11bGF0ZWRNb3VzZUV2ZW50cyk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uICQ2MTc5YjkzNjcwNWU3NmQzJGV4cG9ydCRhZTc4MGRhZjI5ZTZkNDU2KHByb3BzKSB7XG4gICAgbGV0IHsgb25Ib3ZlclN0YXJ0OiBvbkhvdmVyU3RhcnQsIG9uSG92ZXJDaGFuZ2U6IG9uSG92ZXJDaGFuZ2UsIG9uSG92ZXJFbmQ6IG9uSG92ZXJFbmQsIGlzRGlzYWJsZWQ6IGlzRGlzYWJsZWQgfSA9IHByb3BzO1xuICAgIGxldCBbaXNIb3ZlcmVkLCBzZXRIb3ZlcmVkXSA9ICgwLCAkQVd4blQkdXNlU3RhdGUpKGZhbHNlKTtcbiAgICBsZXQgc3RhdGUgPSAoMCwgJEFXeG5UJHVzZVJlZikoe1xuICAgICAgICBpc0hvdmVyZWQ6IGZhbHNlLFxuICAgICAgICBpZ25vcmVFbXVsYXRlZE1vdXNlRXZlbnRzOiBmYWxzZSxcbiAgICAgICAgcG9pbnRlclR5cGU6ICcnLFxuICAgICAgICB0YXJnZXQ6IG51bGxcbiAgICB9KS5jdXJyZW50O1xuICAgICgwLCAkQVd4blQkdXNlRWZmZWN0KSgkNjE3OWI5MzY3MDVlNzZkMyR2YXIkc2V0dXBHbG9iYWxUb3VjaEV2ZW50cywgW10pO1xuICAgIGxldCB7IGFkZEdsb2JhbExpc3RlbmVyOiBhZGRHbG9iYWxMaXN0ZW5lciwgcmVtb3ZlQWxsR2xvYmFsTGlzdGVuZXJzOiByZW1vdmVBbGxHbG9iYWxMaXN0ZW5lcnMgfSA9ICgwLCAkQVd4blQkdXNlR2xvYmFsTGlzdGVuZXJzKSgpO1xuICAgIGxldCB7IGhvdmVyUHJvcHM6IGhvdmVyUHJvcHMsIHRyaWdnZXJIb3ZlckVuZDogdHJpZ2dlckhvdmVyRW5kIH0gPSAoMCwgJEFXeG5UJHVzZU1lbW8pKCgpPT57XG4gICAgICAgIGxldCB0cmlnZ2VySG92ZXJTdGFydCA9IChldmVudCwgcG9pbnRlclR5cGUpPT57XG4gICAgICAgICAgICBzdGF0ZS5wb2ludGVyVHlwZSA9IHBvaW50ZXJUeXBlO1xuICAgICAgICAgICAgaWYgKGlzRGlzYWJsZWQgfHwgcG9pbnRlclR5cGUgPT09ICd0b3VjaCcgfHwgc3RhdGUuaXNIb3ZlcmVkIHx8ICFldmVudC5jdXJyZW50VGFyZ2V0LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybjtcbiAgICAgICAgICAgIHN0YXRlLmlzSG92ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQuY3VycmVudFRhcmdldDtcbiAgICAgICAgICAgIHN0YXRlLnRhcmdldCA9IHRhcmdldDtcbiAgICAgICAgICAgIC8vIFdoZW4gYW4gZWxlbWVudCB0aGF0IGlzIGhvdmVyZWQgb3ZlciBpcyByZW1vdmVkLCBubyBwb2ludGVybGVhdmUgZXZlbnQgaXMgZmlyZWQgYnkgdGhlIGJyb3dzZXIsXG4gICAgICAgICAgICAvLyBldmVuIHRob3VnaCB0aGUgb3JpZ2luYWxseSBob3ZlcmVkIHRhcmdldCBtYXkgaGF2ZSBzaHJ1bmsgaW4gc2l6ZSBzbyBpdCBpcyBubyBsb25nZXIgaG92ZXJlZC5cbiAgICAgICAgICAgIC8vIEhvd2V2ZXIsIGEgcG9pbnRlcm92ZXIgZXZlbnQgd2lsbCBiZSBmaXJlZCBvbiB0aGUgbmV3IHRhcmdldCB0aGUgbW91c2UgaXMgb3Zlci5cbiAgICAgICAgICAgIC8vIEluIENocm9tZSB0aGlzIGhhcHBlbnMgaW1tZWRpYXRlbHkuIEluIFNhZmFyaSBhbmQgRmlyZWZveCwgaXQgaGFwcGVucyB1cG9uIG1vdmluZyB0aGUgbW91c2Ugb25lIHBpeGVsLlxuICAgICAgICAgICAgYWRkR2xvYmFsTGlzdGVuZXIoKDAsICRBV3huVCRnZXRPd25lckRvY3VtZW50KShldmVudC50YXJnZXQpLCAncG9pbnRlcm92ZXInLCAoZSk9PntcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuaXNIb3ZlcmVkICYmIHN0YXRlLnRhcmdldCAmJiAhKDAsICRBV3huVCRub2RlQ29udGFpbnMpKHN0YXRlLnRhcmdldCwgZS50YXJnZXQpKSB0cmlnZ2VySG92ZXJFbmQoZSwgZS5wb2ludGVyVHlwZSk7XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgY2FwdHVyZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAob25Ib3ZlclN0YXJ0KSBvbkhvdmVyU3RhcnQoe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdob3ZlcnN0YXJ0JyxcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgICAgICAgICBwb2ludGVyVHlwZTogcG9pbnRlclR5cGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKG9uSG92ZXJDaGFuZ2UpIG9uSG92ZXJDaGFuZ2UodHJ1ZSk7XG4gICAgICAgICAgICBzZXRIb3ZlcmVkKHRydWUpO1xuICAgICAgICB9O1xuICAgICAgICBsZXQgdHJpZ2dlckhvdmVyRW5kID0gKGV2ZW50LCBwb2ludGVyVHlwZSk9PntcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBzdGF0ZS50YXJnZXQ7XG4gICAgICAgICAgICBzdGF0ZS5wb2ludGVyVHlwZSA9ICcnO1xuICAgICAgICAgICAgc3RhdGUudGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChwb2ludGVyVHlwZSA9PT0gJ3RvdWNoJyB8fCAhc3RhdGUuaXNIb3ZlcmVkIHx8ICF0YXJnZXQpIHJldHVybjtcbiAgICAgICAgICAgIHN0YXRlLmlzSG92ZXJlZCA9IGZhbHNlO1xuICAgICAgICAgICAgcmVtb3ZlQWxsR2xvYmFsTGlzdGVuZXJzKCk7XG4gICAgICAgICAgICBpZiAob25Ib3ZlckVuZCkgb25Ib3ZlckVuZCh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2hvdmVyZW5kJyxcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHRhcmdldCxcbiAgICAgICAgICAgICAgICBwb2ludGVyVHlwZTogcG9pbnRlclR5cGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKG9uSG92ZXJDaGFuZ2UpIG9uSG92ZXJDaGFuZ2UoZmFsc2UpO1xuICAgICAgICAgICAgc2V0SG92ZXJlZChmYWxzZSk7XG4gICAgICAgIH07XG4gICAgICAgIGxldCBob3ZlclByb3BzID0ge307XG4gICAgICAgIGlmICh0eXBlb2YgUG9pbnRlckV2ZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgaG92ZXJQcm9wcy5vblBvaW50ZXJFbnRlciA9IChlKT0+e1xuICAgICAgICAgICAgICAgIGlmICgkNjE3OWI5MzY3MDVlNzZkMyR2YXIkZ2xvYmFsSWdub3JlRW11bGF0ZWRNb3VzZUV2ZW50cyAmJiBlLnBvaW50ZXJUeXBlID09PSAnbW91c2UnKSByZXR1cm47XG4gICAgICAgICAgICAgICAgdHJpZ2dlckhvdmVyU3RhcnQoZSwgZS5wb2ludGVyVHlwZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaG92ZXJQcm9wcy5vblBvaW50ZXJMZWF2ZSA9IChlKT0+e1xuICAgICAgICAgICAgICAgIGlmICghaXNEaXNhYmxlZCAmJiBlLmN1cnJlbnRUYXJnZXQuY29udGFpbnMoZS50YXJnZXQpKSB0cmlnZ2VySG92ZXJFbmQoZSwgZS5wb2ludGVyVHlwZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAndGVzdCcpIHtcbiAgICAgICAgICAgIGhvdmVyUHJvcHMub25Ub3VjaFN0YXJ0ID0gKCk9PntcbiAgICAgICAgICAgICAgICBzdGF0ZS5pZ25vcmVFbXVsYXRlZE1vdXNlRXZlbnRzID0gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBob3ZlclByb3BzLm9uTW91c2VFbnRlciA9IChlKT0+e1xuICAgICAgICAgICAgICAgIGlmICghc3RhdGUuaWdub3JlRW11bGF0ZWRNb3VzZUV2ZW50cyAmJiAhJDYxNzliOTM2NzA1ZTc2ZDMkdmFyJGdsb2JhbElnbm9yZUVtdWxhdGVkTW91c2VFdmVudHMpIHRyaWdnZXJIb3ZlclN0YXJ0KGUsICdtb3VzZScpO1xuICAgICAgICAgICAgICAgIHN0YXRlLmlnbm9yZUVtdWxhdGVkTW91c2VFdmVudHMgPSBmYWxzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBob3ZlclByb3BzLm9uTW91c2VMZWF2ZSA9IChlKT0+e1xuICAgICAgICAgICAgICAgIGlmICghaXNEaXNhYmxlZCAmJiBlLmN1cnJlbnRUYXJnZXQuY29udGFpbnMoZS50YXJnZXQpKSB0cmlnZ2VySG92ZXJFbmQoZSwgJ21vdXNlJyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBob3ZlclByb3BzOiBob3ZlclByb3BzLFxuICAgICAgICAgICAgdHJpZ2dlckhvdmVyRW5kOiB0cmlnZ2VySG92ZXJFbmRcbiAgICAgICAgfTtcbiAgICB9LCBbXG4gICAgICAgIG9uSG92ZXJTdGFydCxcbiAgICAgICAgb25Ib3ZlckNoYW5nZSxcbiAgICAgICAgb25Ib3ZlckVuZCxcbiAgICAgICAgaXNEaXNhYmxlZCxcbiAgICAgICAgc3RhdGUsXG4gICAgICAgIGFkZEdsb2JhbExpc3RlbmVyLFxuICAgICAgICByZW1vdmVBbGxHbG9iYWxMaXN0ZW5lcnNcbiAgICBdKTtcbiAgICAoMCwgJEFXeG5UJHVzZUVmZmVjdCkoKCk9PntcbiAgICAgICAgLy8gQ2FsbCB0aGUgdHJpZ2dlckhvdmVyRW5kIGFzIHNvb24gYXMgaXNEaXNhYmxlZCBjaGFuZ2VzIHRvIHRydWVcbiAgICAgICAgLy8gU2FmZSB0byBjYWxsIHRyaWdnZXJIb3ZlckVuZCwgaXQgd2lsbCBlYXJseSByZXR1cm4gaWYgd2UgYXJlbid0IGN1cnJlbnRseSBob3ZlcmluZ1xuICAgICAgICBpZiAoaXNEaXNhYmxlZCkgdHJpZ2dlckhvdmVyRW5kKHtcbiAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQ6IHN0YXRlLnRhcmdldFxuICAgICAgICB9LCBzdGF0ZS5wb2ludGVyVHlwZSk7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuICAgIH0sIFtcbiAgICAgICAgaXNEaXNhYmxlZFxuICAgIF0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGhvdmVyUHJvcHM6IGhvdmVyUHJvcHMsXG4gICAgICAgIGlzSG92ZXJlZDogaXNIb3ZlcmVkXG4gICAgfTtcbn1cblxuXG5leHBvcnQgeyQ2MTc5YjkzNjcwNWU3NmQzJGV4cG9ydCRhZTc4MGRhZjI5ZTZkNDU2IGFzIHVzZUhvdmVyfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVzZUhvdmVyLm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7dXNlRWZmZWN0RXZlbnQgYXMgJGlzcE9mJHVzZUVmZmVjdEV2ZW50LCBnZXRPd25lckRvY3VtZW50IGFzICRpc3BPZiRnZXRPd25lckRvY3VtZW50fSBmcm9tIFwiQHJlYWN0LWFyaWEvdXRpbHNcIjtcbmltcG9ydCB7dXNlUmVmIGFzICRpc3BPZiR1c2VSZWYsIHVzZUVmZmVjdCBhcyAkaXNwT2YkdXNlRWZmZWN0fSBmcm9tIFwicmVhY3RcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIC8vIFBvcnRpb25zIG9mIHRoZSBjb2RlIGluIHRoaXMgZmlsZSBhcmUgYmFzZWQgb24gY29kZSBmcm9tIHJlYWN0LlxuLy8gT3JpZ2luYWwgbGljZW5zaW5nIGZvciB0aGUgZm9sbG93aW5nIGNhbiBiZSBmb3VuZCBpbiB0aGVcbi8vIE5PVElDRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC90cmVlL2NjN2MxYWVjZTQ2YTZiNjliNDE5NThkNzMxZTBmZDI3Yzk0YmZjNmMvcGFja2FnZXMvcmVhY3QtaW50ZXJhY3Rpb25zXG5cblxuZnVuY3Rpb24gJGUwYjZlMGI2OGVjN2Y1MGYkZXhwb3J0JDg3MmI2NjBhYzVhMWZmOTgocHJvcHMpIHtcbiAgICBsZXQgeyByZWY6IHJlZiwgb25JbnRlcmFjdE91dHNpZGU6IG9uSW50ZXJhY3RPdXRzaWRlLCBpc0Rpc2FibGVkOiBpc0Rpc2FibGVkLCBvbkludGVyYWN0T3V0c2lkZVN0YXJ0OiBvbkludGVyYWN0T3V0c2lkZVN0YXJ0IH0gPSBwcm9wcztcbiAgICBsZXQgc3RhdGVSZWYgPSAoMCwgJGlzcE9mJHVzZVJlZikoe1xuICAgICAgICBpc1BvaW50ZXJEb3duOiBmYWxzZSxcbiAgICAgICAgaWdub3JlRW11bGF0ZWRNb3VzZUV2ZW50czogZmFsc2VcbiAgICB9KTtcbiAgICBsZXQgb25Qb2ludGVyRG93biA9ICgwLCAkaXNwT2YkdXNlRWZmZWN0RXZlbnQpKChlKT0+e1xuICAgICAgICBpZiAob25JbnRlcmFjdE91dHNpZGUgJiYgJGUwYjZlMGI2OGVjN2Y1MGYkdmFyJGlzVmFsaWRFdmVudChlLCByZWYpKSB7XG4gICAgICAgICAgICBpZiAob25JbnRlcmFjdE91dHNpZGVTdGFydCkgb25JbnRlcmFjdE91dHNpZGVTdGFydChlKTtcbiAgICAgICAgICAgIHN0YXRlUmVmLmN1cnJlbnQuaXNQb2ludGVyRG93biA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBsZXQgdHJpZ2dlckludGVyYWN0T3V0c2lkZSA9ICgwLCAkaXNwT2YkdXNlRWZmZWN0RXZlbnQpKChlKT0+e1xuICAgICAgICBpZiAob25JbnRlcmFjdE91dHNpZGUpIG9uSW50ZXJhY3RPdXRzaWRlKGUpO1xuICAgIH0pO1xuICAgICgwLCAkaXNwT2YkdXNlRWZmZWN0KSgoKT0+e1xuICAgICAgICBsZXQgc3RhdGUgPSBzdGF0ZVJlZi5jdXJyZW50O1xuICAgICAgICBpZiAoaXNEaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gcmVmLmN1cnJlbnQ7XG4gICAgICAgIGNvbnN0IGRvY3VtZW50T2JqZWN0ID0gKDAsICRpc3BPZiRnZXRPd25lckRvY3VtZW50KShlbGVtZW50KTtcbiAgICAgICAgLy8gVXNlIHBvaW50ZXIgZXZlbnRzIGlmIGF2YWlsYWJsZS4gT3RoZXJ3aXNlLCBmYWxsIGJhY2sgdG8gbW91c2UgYW5kIHRvdWNoIGV2ZW50cy5cbiAgICAgICAgaWYgKHR5cGVvZiBQb2ludGVyRXZlbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBsZXQgb25DbGljayA9IChlKT0+e1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5pc1BvaW50ZXJEb3duICYmICRlMGI2ZTBiNjhlYzdmNTBmJHZhciRpc1ZhbGlkRXZlbnQoZSwgcmVmKSkgdHJpZ2dlckludGVyYWN0T3V0c2lkZShlKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5pc1BvaW50ZXJEb3duID0gZmFsc2U7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gY2hhbmdpbmcgdGhlc2UgdG8gY2FwdHVyZSBwaGFzZSBmaXhlZCBjb21ib2JveFxuICAgICAgICAgICAgLy8gVXNlIGNsaWNrIGluc3RlYWQgb2YgcG9pbnRlcnVwIHRvIGF2b2lkIEFuZHJvaWQgQ2hyb21lIGlzc3VlXG4gICAgICAgICAgICAvLyBodHRwczovL2lzc3Vlcy5jaHJvbWl1bS5vcmcvaXNzdWVzLzQwNzMyMjI0XG4gICAgICAgICAgICBkb2N1bWVudE9iamVjdC5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIG9uUG9pbnRlckRvd24sIHRydWUpO1xuICAgICAgICAgICAgZG9jdW1lbnRPYmplY3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgICAgIGRvY3VtZW50T2JqZWN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgb25Qb2ludGVyRG93biwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnRPYmplY3QucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrLCB0cnVlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICd0ZXN0Jykge1xuICAgICAgICAgICAgbGV0IG9uTW91c2VVcCA9IChlKT0+e1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5pZ25vcmVFbXVsYXRlZE1vdXNlRXZlbnRzKSBzdGF0ZS5pZ25vcmVFbXVsYXRlZE1vdXNlRXZlbnRzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdGUuaXNQb2ludGVyRG93biAmJiAkZTBiNmUwYjY4ZWM3ZjUwZiR2YXIkaXNWYWxpZEV2ZW50KGUsIHJlZikpIHRyaWdnZXJJbnRlcmFjdE91dHNpZGUoZSk7XG4gICAgICAgICAgICAgICAgc3RhdGUuaXNQb2ludGVyRG93biA9IGZhbHNlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxldCBvblRvdWNoRW5kID0gKGUpPT57XG4gICAgICAgICAgICAgICAgc3RhdGUuaWdub3JlRW11bGF0ZWRNb3VzZUV2ZW50cyA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLmlzUG9pbnRlckRvd24gJiYgJGUwYjZlMGI2OGVjN2Y1MGYkdmFyJGlzVmFsaWRFdmVudChlLCByZWYpKSB0cmlnZ2VySW50ZXJhY3RPdXRzaWRlKGUpO1xuICAgICAgICAgICAgICAgIHN0YXRlLmlzUG9pbnRlckRvd24gPSBmYWxzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBkb2N1bWVudE9iamVjdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBvblBvaW50ZXJEb3duLCB0cnVlKTtcbiAgICAgICAgICAgIGRvY3VtZW50T2JqZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXAsIHRydWUpO1xuICAgICAgICAgICAgZG9jdW1lbnRPYmplY3QuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uUG9pbnRlckRvd24sIHRydWUpO1xuICAgICAgICAgICAgZG9jdW1lbnRPYmplY3QuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgICAgIGRvY3VtZW50T2JqZWN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uUG9pbnRlckRvd24sIHRydWUpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50T2JqZWN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXAsIHRydWUpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50T2JqZWN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblBvaW50ZXJEb3duLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudE9iamVjdC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQsIHRydWUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0sIFtcbiAgICAgICAgcmVmLFxuICAgICAgICBpc0Rpc2FibGVkLFxuICAgICAgICBvblBvaW50ZXJEb3duLFxuICAgICAgICB0cmlnZ2VySW50ZXJhY3RPdXRzaWRlXG4gICAgXSk7XG59XG5mdW5jdGlvbiAkZTBiNmUwYjY4ZWM3ZjUwZiR2YXIkaXNWYWxpZEV2ZW50KGV2ZW50LCByZWYpIHtcbiAgICBpZiAoZXZlbnQuYnV0dG9uID4gMCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChldmVudC50YXJnZXQpIHtcbiAgICAgICAgLy8gaWYgdGhlIGV2ZW50IHRhcmdldCBpcyBubyBsb25nZXIgaW4gdGhlIGRvY3VtZW50LCBpZ25vcmVcbiAgICAgICAgY29uc3Qgb3duZXJEb2N1bWVudCA9IGV2ZW50LnRhcmdldC5vd25lckRvY3VtZW50O1xuICAgICAgICBpZiAoIW93bmVyRG9jdW1lbnQgfHwgIW93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy8gSWYgdGhlIHRhcmdldCBpcyB3aXRoaW4gYSB0b3AgbGF5ZXIgZWxlbWVudCAoZS5nLiB0b2FzdHMpLCBpZ25vcmUuXG4gICAgICAgIGlmIChldmVudC50YXJnZXQuY2xvc2VzdCgnW2RhdGEtcmVhY3QtYXJpYS10b3AtbGF5ZXJdJykpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKCFyZWYuY3VycmVudCkgcmV0dXJuIGZhbHNlO1xuICAgIC8vIFdoZW4gdGhlIGV2ZW50IHNvdXJjZSBpcyBpbnNpZGUgYSBTaGFkb3cgRE9NLCBldmVudC50YXJnZXQgaXMganVzdCB0aGUgc2hhZG93IHJvb3QuXG4gICAgLy8gVXNpbmcgZXZlbnQuY29tcG9zZWRQYXRoIGluc3RlYWQgbWVhbnMgd2UgY2FuIGdldCB0aGUgYWN0dWFsIGVsZW1lbnQgaW5zaWRlIHRoZSBzaGFkb3cgcm9vdC5cbiAgICAvLyBUaGlzIG9ubHkgd29ya3MgaWYgdGhlIHNoYWRvdyByb290IGlzIG9wZW4sIHRoZXJlIGlzIG5vIHdheSB0byBkZXRlY3QgaWYgaXQgaXMgY2xvc2VkLlxuICAgIC8vIElmIHRoZSBldmVudCBjb21wb3NlZCBwYXRoIGNvbnRhaW5zIHRoZSByZWYsIGludGVyYWN0aW9uIGlzIGluc2lkZS5cbiAgICByZXR1cm4gIWV2ZW50LmNvbXBvc2VkUGF0aCgpLmluY2x1ZGVzKHJlZi5jdXJyZW50KTtcbn1cblxuXG5leHBvcnQgeyRlMGI2ZTBiNjhlYzdmNTBmJGV4cG9ydCQ4NzJiNjYwYWM1YTFmZjk4IGFzIHVzZUludGVyYWN0T3V0c2lkZX07XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VJbnRlcmFjdE91dHNpZGUubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHtkaXNhYmxlVGV4dFNlbGVjdGlvbiBhcyAkMTRjMGI3MjUwOWQ3MDIyNSRleHBvcnQkMTZhNDY5NzQ2NzE3NTQ4NywgcmVzdG9yZVRleHRTZWxlY3Rpb24gYXMgJDE0YzBiNzI1MDlkNzAyMjUkZXhwb3J0JGIwZDZmYTFhYjMyZTMyOTV9IGZyb20gXCIuL3RleHRTZWxlY3Rpb24ubWpzXCI7XG5pbXBvcnQge3VzZVJlZiBhcyAkNUdON2okdXNlUmVmLCB1c2VNZW1vIGFzICQ1R043aiR1c2VNZW1vfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7dXNlR2xvYmFsTGlzdGVuZXJzIGFzICQ1R043aiR1c2VHbG9iYWxMaXN0ZW5lcnMsIHVzZUVmZmVjdEV2ZW50IGFzICQ1R043aiR1c2VFZmZlY3RFdmVudH0gZnJvbSBcIkByZWFjdC1hcmlhL3V0aWxzXCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcblxuXG5mdW5jdGlvbiAkZThhNzAyMmNmODdjYmEyYSRleHBvcnQkMzZkYTk2Mzc5Zjc5ZjI0NShwcm9wcykge1xuICAgIGxldCB7IG9uTW92ZVN0YXJ0OiBvbk1vdmVTdGFydCwgb25Nb3ZlOiBvbk1vdmUsIG9uTW92ZUVuZDogb25Nb3ZlRW5kIH0gPSBwcm9wcztcbiAgICBsZXQgc3RhdGUgPSAoMCwgJDVHTjdqJHVzZVJlZikoe1xuICAgICAgICBkaWRNb3ZlOiBmYWxzZSxcbiAgICAgICAgbGFzdFBvc2l0aW9uOiBudWxsLFxuICAgICAgICBpZDogbnVsbFxuICAgIH0pO1xuICAgIGxldCB7IGFkZEdsb2JhbExpc3RlbmVyOiBhZGRHbG9iYWxMaXN0ZW5lciwgcmVtb3ZlR2xvYmFsTGlzdGVuZXI6IHJlbW92ZUdsb2JhbExpc3RlbmVyIH0gPSAoMCwgJDVHTjdqJHVzZUdsb2JhbExpc3RlbmVycykoKTtcbiAgICBsZXQgbW92ZSA9ICgwLCAkNUdON2okdXNlRWZmZWN0RXZlbnQpKChvcmlnaW5hbEV2ZW50LCBwb2ludGVyVHlwZSwgZGVsdGFYLCBkZWx0YVkpPT57XG4gICAgICAgIGlmIChkZWx0YVggPT09IDAgJiYgZGVsdGFZID09PSAwKSByZXR1cm47XG4gICAgICAgIGlmICghc3RhdGUuY3VycmVudC5kaWRNb3ZlKSB7XG4gICAgICAgICAgICBzdGF0ZS5jdXJyZW50LmRpZE1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgb25Nb3ZlU3RhcnQgPT09IG51bGwgfHwgb25Nb3ZlU3RhcnQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9uTW92ZVN0YXJ0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbW92ZXN0YXJ0JyxcbiAgICAgICAgICAgICAgICBwb2ludGVyVHlwZTogcG9pbnRlclR5cGUsXG4gICAgICAgICAgICAgICAgc2hpZnRLZXk6IG9yaWdpbmFsRXZlbnQuc2hpZnRLZXksXG4gICAgICAgICAgICAgICAgbWV0YUtleTogb3JpZ2luYWxFdmVudC5tZXRhS2V5LFxuICAgICAgICAgICAgICAgIGN0cmxLZXk6IG9yaWdpbmFsRXZlbnQuY3RybEtleSxcbiAgICAgICAgICAgICAgICBhbHRLZXk6IG9yaWdpbmFsRXZlbnQuYWx0S2V5XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBvbk1vdmUgPT09IG51bGwgfHwgb25Nb3ZlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvbk1vdmUoe1xuICAgICAgICAgICAgdHlwZTogJ21vdmUnLFxuICAgICAgICAgICAgcG9pbnRlclR5cGU6IHBvaW50ZXJUeXBlLFxuICAgICAgICAgICAgZGVsdGFYOiBkZWx0YVgsXG4gICAgICAgICAgICBkZWx0YVk6IGRlbHRhWSxcbiAgICAgICAgICAgIHNoaWZ0S2V5OiBvcmlnaW5hbEV2ZW50LnNoaWZ0S2V5LFxuICAgICAgICAgICAgbWV0YUtleTogb3JpZ2luYWxFdmVudC5tZXRhS2V5LFxuICAgICAgICAgICAgY3RybEtleTogb3JpZ2luYWxFdmVudC5jdHJsS2V5LFxuICAgICAgICAgICAgYWx0S2V5OiBvcmlnaW5hbEV2ZW50LmFsdEtleVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICBsZXQgZW5kID0gKDAsICQ1R043aiR1c2VFZmZlY3RFdmVudCkoKG9yaWdpbmFsRXZlbnQsIHBvaW50ZXJUeXBlKT0+e1xuICAgICAgICAoMCwgJDE0YzBiNzI1MDlkNzAyMjUkZXhwb3J0JGIwZDZmYTFhYjMyZTMyOTUpKCk7XG4gICAgICAgIGlmIChzdGF0ZS5jdXJyZW50LmRpZE1vdmUpIG9uTW92ZUVuZCA9PT0gbnVsbCB8fCBvbk1vdmVFbmQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9uTW92ZUVuZCh7XG4gICAgICAgICAgICB0eXBlOiAnbW92ZWVuZCcsXG4gICAgICAgICAgICBwb2ludGVyVHlwZTogcG9pbnRlclR5cGUsXG4gICAgICAgICAgICBzaGlmdEtleTogb3JpZ2luYWxFdmVudC5zaGlmdEtleSxcbiAgICAgICAgICAgIG1ldGFLZXk6IG9yaWdpbmFsRXZlbnQubWV0YUtleSxcbiAgICAgICAgICAgIGN0cmxLZXk6IG9yaWdpbmFsRXZlbnQuY3RybEtleSxcbiAgICAgICAgICAgIGFsdEtleTogb3JpZ2luYWxFdmVudC5hbHRLZXlcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgbGV0IG1vdmVQcm9wcyA9ICgwLCAkNUdON2okdXNlTWVtbykoKCk9PntcbiAgICAgICAgbGV0IG1vdmVQcm9wcyA9IHt9O1xuICAgICAgICBsZXQgc3RhcnQgPSAoKT0+e1xuICAgICAgICAgICAgKDAsICQxNGMwYjcyNTA5ZDcwMjI1JGV4cG9ydCQxNmE0Njk3NDY3MTc1NDg3KSgpO1xuICAgICAgICAgICAgc3RhdGUuY3VycmVudC5kaWRNb3ZlID0gZmFsc2U7XG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlb2YgUG9pbnRlckV2ZW50ID09PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Rlc3QnKSB7XG4gICAgICAgICAgICBsZXQgb25Nb3VzZU1vdmUgPSAoZSk9PntcbiAgICAgICAgICAgICAgICBpZiAoZS5idXR0b24gPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbiwgX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uMTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbl9wYWdlWCwgX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uX3BhZ2VZO1xuICAgICAgICAgICAgICAgICAgICBtb3ZlKGUsICdtb3VzZScsIGUucGFnZVggLSAoKF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbl9wYWdlWCA9IChfc3RhdGVfY3VycmVudF9sYXN0UG9zaXRpb24gPSBzdGF0ZS5jdXJyZW50Lmxhc3RQb3NpdGlvbikgPT09IG51bGwgfHwgX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfc3RhdGVfY3VycmVudF9sYXN0UG9zaXRpb24ucGFnZVgpICE9PSBudWxsICYmIF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbl9wYWdlWCAhPT0gdm9pZCAwID8gX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uX3BhZ2VYIDogMCksIGUucGFnZVkgLSAoKF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbl9wYWdlWSA9IChfc3RhdGVfY3VycmVudF9sYXN0UG9zaXRpb24xID0gc3RhdGUuY3VycmVudC5sYXN0UG9zaXRpb24pID09PSBudWxsIHx8IF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbjEgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbjEucGFnZVkpICE9PSBudWxsICYmIF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbl9wYWdlWSAhPT0gdm9pZCAwID8gX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uX3BhZ2VZIDogMCkpO1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5jdXJyZW50Lmxhc3RQb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VYOiBlLnBhZ2VYLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVk6IGUucGFnZVlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IG9uTW91c2VVcCA9IChlKT0+e1xuICAgICAgICAgICAgICAgIGlmIChlLmJ1dHRvbiA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBlbmQoZSwgJ21vdXNlJyk7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUdsb2JhbExpc3RlbmVyKHdpbmRvdywgJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUdsb2JhbExpc3RlbmVyKHdpbmRvdywgJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbW92ZVByb3BzLm9uTW91c2VEb3duID0gKGUpPT57XG4gICAgICAgICAgICAgICAgaWYgKGUuYnV0dG9uID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuY3VycmVudC5sYXN0UG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlWDogZS5wYWdlWCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VZOiBlLnBhZ2VZXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGFkZEdsb2JhbExpc3RlbmVyKHdpbmRvdywgJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGFkZEdsb2JhbExpc3RlbmVyKHdpbmRvdywgJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IG9uVG91Y2hNb3ZlID0gKGUpPT57XG4gICAgICAgICAgICAgICAgbGV0IHRvdWNoID0gW1xuICAgICAgICAgICAgICAgICAgICAuLi5lLmNoYW5nZWRUb3VjaGVzXG4gICAgICAgICAgICAgICAgXS5maW5kSW5kZXgoKHsgaWRlbnRpZmllcjogaWRlbnRpZmllciB9KT0+aWRlbnRpZmllciA9PT0gc3RhdGUuY3VycmVudC5pZCk7XG4gICAgICAgICAgICAgICAgaWYgKHRvdWNoID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbiwgX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uMTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHsgcGFnZVg6IHBhZ2VYLCBwYWdlWTogcGFnZVkgfSA9IGUuY2hhbmdlZFRvdWNoZXNbdG91Y2hdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uX3BhZ2VYLCBfc3RhdGVfY3VycmVudF9sYXN0UG9zaXRpb25fcGFnZVk7XG4gICAgICAgICAgICAgICAgICAgIG1vdmUoZSwgJ3RvdWNoJywgcGFnZVggLSAoKF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbl9wYWdlWCA9IChfc3RhdGVfY3VycmVudF9sYXN0UG9zaXRpb24gPSBzdGF0ZS5jdXJyZW50Lmxhc3RQb3NpdGlvbikgPT09IG51bGwgfHwgX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfc3RhdGVfY3VycmVudF9sYXN0UG9zaXRpb24ucGFnZVgpICE9PSBudWxsICYmIF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbl9wYWdlWCAhPT0gdm9pZCAwID8gX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uX3BhZ2VYIDogMCksIHBhZ2VZIC0gKChfc3RhdGVfY3VycmVudF9sYXN0UG9zaXRpb25fcGFnZVkgPSAoX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uMSA9IHN0YXRlLmN1cnJlbnQubGFzdFBvc2l0aW9uKSA9PT0gbnVsbCB8fCBfc3RhdGVfY3VycmVudF9sYXN0UG9zaXRpb24xID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfc3RhdGVfY3VycmVudF9sYXN0UG9zaXRpb24xLnBhZ2VZKSAhPT0gbnVsbCAmJiBfc3RhdGVfY3VycmVudF9sYXN0UG9zaXRpb25fcGFnZVkgIT09IHZvaWQgMCA/IF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbl9wYWdlWSA6IDApKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuY3VycmVudC5sYXN0UG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlWDogcGFnZVgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlWTogcGFnZVlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IG9uVG91Y2hFbmQgPSAoZSk9PntcbiAgICAgICAgICAgICAgICBsZXQgdG91Y2ggPSBbXG4gICAgICAgICAgICAgICAgICAgIC4uLmUuY2hhbmdlZFRvdWNoZXNcbiAgICAgICAgICAgICAgICBdLmZpbmRJbmRleCgoeyBpZGVudGlmaWVyOiBpZGVudGlmaWVyIH0pPT5pZGVudGlmaWVyID09PSBzdGF0ZS5jdXJyZW50LmlkKTtcbiAgICAgICAgICAgICAgICBpZiAodG91Y2ggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBlbmQoZSwgJ3RvdWNoJyk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmN1cnJlbnQuaWQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVHbG9iYWxMaXN0ZW5lcih3aW5kb3csICd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSk7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUdsb2JhbExpc3RlbmVyKHdpbmRvdywgJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUdsb2JhbExpc3RlbmVyKHdpbmRvdywgJ3RvdWNoY2FuY2VsJywgb25Ub3VjaEVuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG1vdmVQcm9wcy5vblRvdWNoU3RhcnQgPSAoZSk9PntcbiAgICAgICAgICAgICAgICBpZiAoZS5jaGFuZ2VkVG91Y2hlcy5sZW5ndGggPT09IDAgfHwgc3RhdGUuY3VycmVudC5pZCAhPSBudWxsKSByZXR1cm47XG4gICAgICAgICAgICAgICAgbGV0IHsgcGFnZVg6IHBhZ2VYLCBwYWdlWTogcGFnZVksIGlkZW50aWZpZXI6IGlkZW50aWZpZXIgfSA9IGUuY2hhbmdlZFRvdWNoZXNbMF07XG4gICAgICAgICAgICAgICAgc3RhcnQoKTtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBzdGF0ZS5jdXJyZW50Lmxhc3RQb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgcGFnZVg6IHBhZ2VYLFxuICAgICAgICAgICAgICAgICAgICBwYWdlWTogcGFnZVlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHN0YXRlLmN1cnJlbnQuaWQgPSBpZGVudGlmaWVyO1xuICAgICAgICAgICAgICAgIGFkZEdsb2JhbExpc3RlbmVyKHdpbmRvdywgJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgYWRkR2xvYmFsTGlzdGVuZXIod2luZG93LCAndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgYWRkR2xvYmFsTGlzdGVuZXIod2luZG93LCAndG91Y2hjYW5jZWwnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG9uUG9pbnRlck1vdmUgPSAoZSk9PntcbiAgICAgICAgICAgICAgICBpZiAoZS5wb2ludGVySWQgPT09IHN0YXRlLmN1cnJlbnQuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbiwgX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uMTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBvaW50ZXJUeXBlID0gZS5wb2ludGVyVHlwZSB8fCAnbW91c2UnO1xuICAgICAgICAgICAgICAgICAgICB2YXIgX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uX3BhZ2VYLCBfc3RhdGVfY3VycmVudF9sYXN0UG9zaXRpb25fcGFnZVk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFByb2JsZW1zIHdpdGggUG9pbnRlckV2ZW50I21vdmVtZW50WC9tb3ZlbWVudFk6XG4gICAgICAgICAgICAgICAgICAgIC8vIDEuIGl0IGlzIGFsd2F5cyAwIG9uIG1hY09TIFNhZmFyaS5cbiAgICAgICAgICAgICAgICAgICAgLy8gMi4gT24gQ2hyb21lIEFuZHJvaWQsIGl0J3Mgc2NhbGVkIGJ5IGRldmljZVBpeGVsUmF0aW8sIGJ1dCBub3Qgb24gQ2hyb21lIG1hY09TXG4gICAgICAgICAgICAgICAgICAgIG1vdmUoZSwgcG9pbnRlclR5cGUsIGUucGFnZVggLSAoKF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbl9wYWdlWCA9IChfc3RhdGVfY3VycmVudF9sYXN0UG9zaXRpb24gPSBzdGF0ZS5jdXJyZW50Lmxhc3RQb3NpdGlvbikgPT09IG51bGwgfHwgX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfc3RhdGVfY3VycmVudF9sYXN0UG9zaXRpb24ucGFnZVgpICE9PSBudWxsICYmIF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbl9wYWdlWCAhPT0gdm9pZCAwID8gX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uX3BhZ2VYIDogMCksIGUucGFnZVkgLSAoKF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbl9wYWdlWSA9IChfc3RhdGVfY3VycmVudF9sYXN0UG9zaXRpb24xID0gc3RhdGUuY3VycmVudC5sYXN0UG9zaXRpb24pID09PSBudWxsIHx8IF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbjEgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbjEucGFnZVkpICE9PSBudWxsICYmIF9zdGF0ZV9jdXJyZW50X2xhc3RQb3NpdGlvbl9wYWdlWSAhPT0gdm9pZCAwID8gX3N0YXRlX2N1cnJlbnRfbGFzdFBvc2l0aW9uX3BhZ2VZIDogMCkpO1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5jdXJyZW50Lmxhc3RQb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VYOiBlLnBhZ2VYLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVk6IGUucGFnZVlcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IG9uUG9pbnRlclVwID0gKGUpPT57XG4gICAgICAgICAgICAgICAgaWYgKGUucG9pbnRlcklkID09PSBzdGF0ZS5jdXJyZW50LmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwb2ludGVyVHlwZSA9IGUucG9pbnRlclR5cGUgfHwgJ21vdXNlJztcbiAgICAgICAgICAgICAgICAgICAgZW5kKGUsIHBvaW50ZXJUeXBlKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuY3VycmVudC5pZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUdsb2JhbExpc3RlbmVyKHdpbmRvdywgJ3BvaW50ZXJtb3ZlJywgb25Qb2ludGVyTW92ZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVHbG9iYWxMaXN0ZW5lcih3aW5kb3csICdwb2ludGVydXAnLCBvblBvaW50ZXJVcCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVHbG9iYWxMaXN0ZW5lcih3aW5kb3csICdwb2ludGVyY2FuY2VsJywgb25Qb2ludGVyVXAsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbW92ZVByb3BzLm9uUG9pbnRlckRvd24gPSAoZSk9PntcbiAgICAgICAgICAgICAgICBpZiAoZS5idXR0b24gPT09IDAgJiYgc3RhdGUuY3VycmVudC5pZCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuY3VycmVudC5sYXN0UG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlWDogZS5wYWdlWCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VZOiBlLnBhZ2VZXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmN1cnJlbnQuaWQgPSBlLnBvaW50ZXJJZDtcbiAgICAgICAgICAgICAgICAgICAgYWRkR2xvYmFsTGlzdGVuZXIod2luZG93LCAncG9pbnRlcm1vdmUnLCBvblBvaW50ZXJNb3ZlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGFkZEdsb2JhbExpc3RlbmVyKHdpbmRvdywgJ3BvaW50ZXJ1cCcsIG9uUG9pbnRlclVwLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGFkZEdsb2JhbExpc3RlbmVyKHdpbmRvdywgJ3BvaW50ZXJjYW5jZWwnLCBvblBvaW50ZXJVcCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRyaWdnZXJLZXlib2FyZE1vdmUgPSAoZSwgZGVsdGFYLCBkZWx0YVkpPT57XG4gICAgICAgICAgICBzdGFydCgpO1xuICAgICAgICAgICAgbW92ZShlLCAna2V5Ym9hcmQnLCBkZWx0YVgsIGRlbHRhWSk7XG4gICAgICAgICAgICBlbmQoZSwgJ2tleWJvYXJkJyk7XG4gICAgICAgIH07XG4gICAgICAgIG1vdmVQcm9wcy5vbktleURvd24gPSAoZSk9PntcbiAgICAgICAgICAgIHN3aXRjaChlLmtleSl7XG4gICAgICAgICAgICAgICAgY2FzZSAnTGVmdCc6XG4gICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dMZWZ0JzpcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyS2V5Ym9hcmRNb3ZlKGUsIC0xLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnUmlnaHQnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXJLZXlib2FyZE1vdmUoZSwgMSwgMCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1VwJzpcbiAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1VwJzpcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyS2V5Ym9hcmRNb3ZlKGUsIDAsIC0xKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnRG93bic6XG4gICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyS2V5Ym9hcmRNb3ZlKGUsIDAsIDEpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG1vdmVQcm9wcztcbiAgICB9LCBbXG4gICAgICAgIHN0YXRlLFxuICAgICAgICBhZGRHbG9iYWxMaXN0ZW5lcixcbiAgICAgICAgcmVtb3ZlR2xvYmFsTGlzdGVuZXIsXG4gICAgICAgIG1vdmUsXG4gICAgICAgIGVuZFxuICAgIF0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIG1vdmVQcm9wczogbW92ZVByb3BzXG4gICAgfTtcbn1cblxuXG5leHBvcnQgeyRlOGE3MDIyY2Y4N2NiYTJhJGV4cG9ydCQzNmRhOTYzNzlmNzlmMjQ1IGFzIHVzZU1vdmV9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlTW92ZS5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge3VzZUNhbGxiYWNrIGFzICRucmRMMiR1c2VDYWxsYmFja30gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge3VzZUV2ZW50IGFzICRucmRMMiR1c2VFdmVudH0gZnJvbSBcIkByZWFjdC1hcmlhL3V0aWxzXCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMSBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcblxuZnVuY3Rpb24gJDdkMGE2MzZkN2E0ZGNlZmQkZXhwb3J0JDIxMjNmZjJiODdjODFjYShwcm9wcywgcmVmKSB7XG4gICAgbGV0IHsgb25TY3JvbGw6IG9uU2Nyb2xsLCBpc0Rpc2FibGVkOiBpc0Rpc2FibGVkIH0gPSBwcm9wcztcbiAgICBsZXQgb25TY3JvbGxIYW5kbGVyID0gKDAsICRucmRMMiR1c2VDYWxsYmFjaykoKGUpPT57XG4gICAgICAgIC8vIElmIHRoZSBjdHJsS2V5IGlzIHByZXNzZWQsIHRoaXMgaXMgYSB6b29tIGV2ZW50LCBkbyBub3RoaW5nLlxuICAgICAgICBpZiAoZS5jdHJsS2V5KSByZXR1cm47XG4gICAgICAgIC8vIHN0b3Agc2Nyb2xsaW5nIHRoZSBwYWdlXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgaWYgKG9uU2Nyb2xsKSBvblNjcm9sbCh7XG4gICAgICAgICAgICBkZWx0YVg6IGUuZGVsdGFYLFxuICAgICAgICAgICAgZGVsdGFZOiBlLmRlbHRhWVxuICAgICAgICB9KTtcbiAgICB9LCBbXG4gICAgICAgIG9uU2Nyb2xsXG4gICAgXSk7XG4gICAgKDAsICRucmRMMiR1c2VFdmVudCkocmVmLCAnd2hlZWwnLCBpc0Rpc2FibGVkID8gdW5kZWZpbmVkIDogb25TY3JvbGxIYW5kbGVyKTtcbn1cblxuXG5leHBvcnQgeyQ3ZDBhNjM2ZDdhNGRjZWZkJGV4cG9ydCQyMTIzZmYyYjg3YzgxY2EgYXMgdXNlU2Nyb2xsV2hlZWx9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlU2Nyb2xsV2hlZWwubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHt1c2VQcmVzcyBhcyAkZjZjMzFjY2UyYWRmNjU0ZiRleHBvcnQkNDU3MTJlY2VkYTZmYWQyMX0gZnJvbSBcIi4vdXNlUHJlc3MubWpzXCI7XG5pbXBvcnQge3VzZUdsb2JhbExpc3RlbmVycyBhcyAkNGsya3YkdXNlR2xvYmFsTGlzdGVuZXJzLCBnZXRPd25lckRvY3VtZW50IGFzICQ0azJrdiRnZXRPd25lckRvY3VtZW50LCBmb2N1c1dpdGhvdXRTY3JvbGxpbmcgYXMgJDRrMmt2JGZvY3VzV2l0aG91dFNjcm9sbGluZywgdXNlRGVzY3JpcHRpb24gYXMgJDRrMmt2JHVzZURlc2NyaXB0aW9uLCBtZXJnZVByb3BzIGFzICQ0azJrdiRtZXJnZVByb3BzfSBmcm9tIFwiQHJlYWN0LWFyaWEvdXRpbHNcIjtcbmltcG9ydCB7dXNlUmVmIGFzICQ0azJrdiR1c2VSZWZ9IGZyb20gXCJyZWFjdFwiO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMjAgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gXG5cblxuY29uc3QgJDhhMjY1NjFkMjg3NzIzNmUkdmFyJERFRkFVTFRfVEhSRVNIT0xEID0gNTAwO1xuZnVuY3Rpb24gJDhhMjY1NjFkMjg3NzIzNmUkZXhwb3J0JGMyNGVkMDEwNGQwN2VhYjkocHJvcHMpIHtcbiAgICBsZXQgeyBpc0Rpc2FibGVkOiBpc0Rpc2FibGVkLCBvbkxvbmdQcmVzc1N0YXJ0OiBvbkxvbmdQcmVzc1N0YXJ0LCBvbkxvbmdQcmVzc0VuZDogb25Mb25nUHJlc3NFbmQsIG9uTG9uZ1ByZXNzOiBvbkxvbmdQcmVzcywgdGhyZXNob2xkOiB0aHJlc2hvbGQgPSAkOGEyNjU2MWQyODc3MjM2ZSR2YXIkREVGQVVMVF9USFJFU0hPTEQsIGFjY2Vzc2liaWxpdHlEZXNjcmlwdGlvbjogYWNjZXNzaWJpbGl0eURlc2NyaXB0aW9uIH0gPSBwcm9wcztcbiAgICBjb25zdCB0aW1lUmVmID0gKDAsICQ0azJrdiR1c2VSZWYpKHVuZGVmaW5lZCk7XG4gICAgbGV0IHsgYWRkR2xvYmFsTGlzdGVuZXI6IGFkZEdsb2JhbExpc3RlbmVyLCByZW1vdmVHbG9iYWxMaXN0ZW5lcjogcmVtb3ZlR2xvYmFsTGlzdGVuZXIgfSA9ICgwLCAkNGsya3YkdXNlR2xvYmFsTGlzdGVuZXJzKSgpO1xuICAgIGxldCB7IHByZXNzUHJvcHM6IHByZXNzUHJvcHMgfSA9ICgwLCAkZjZjMzFjY2UyYWRmNjU0ZiRleHBvcnQkNDU3MTJlY2VkYTZmYWQyMSkoe1xuICAgICAgICBpc0Rpc2FibGVkOiBpc0Rpc2FibGVkLFxuICAgICAgICBvblByZXNzU3RhcnQgKGUpIHtcbiAgICAgICAgICAgIGUuY29udGludWVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgaWYgKGUucG9pbnRlclR5cGUgPT09ICdtb3VzZScgfHwgZS5wb2ludGVyVHlwZSA9PT0gJ3RvdWNoJykge1xuICAgICAgICAgICAgICAgIGlmIChvbkxvbmdQcmVzc1N0YXJ0KSBvbkxvbmdQcmVzc1N0YXJ0KHtcbiAgICAgICAgICAgICAgICAgICAgLi4uZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xvbmdwcmVzc3N0YXJ0J1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRpbWVSZWYuY3VycmVudCA9IHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJldmVudCBvdGhlciB1c2VQcmVzcyBoYW5kbGVycyBmcm9tIGFsc28gaGFuZGxpbmcgdGhpcyBldmVudC5cbiAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuZGlzcGF0Y2hFdmVudChuZXcgUG9pbnRlckV2ZW50KCdwb2ludGVyY2FuY2VsJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnViYmxlczogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIEVuc3VyZSB0YXJnZXQgaXMgZm9jdXNlZC4gT24gdG91Y2ggZGV2aWNlcywgYnJvd3NlcnMgdHlwaWNhbGx5IGZvY3VzIG9uIHBvaW50ZXIgdXAuXG4gICAgICAgICAgICAgICAgICAgIGlmICgoMCwgJDRrMmt2JGdldE93bmVyRG9jdW1lbnQpKGUudGFyZ2V0KS5hY3RpdmVFbGVtZW50ICE9PSBlLnRhcmdldCkgKDAsICQ0azJrdiRmb2N1c1dpdGhvdXRTY3JvbGxpbmcpKGUudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9uTG9uZ1ByZXNzKSBvbkxvbmdQcmVzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2xvbmdwcmVzcydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVSZWYuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9LCB0aHJlc2hvbGQpO1xuICAgICAgICAgICAgICAgIC8vIFByZXZlbnQgY29udGV4dCBtZW51LCB3aGljaCBtYXkgYmUgb3BlbmVkIG9uIGxvbmcgcHJlc3Mgb24gdG91Y2ggZGV2aWNlc1xuICAgICAgICAgICAgICAgIGlmIChlLnBvaW50ZXJUeXBlID09PSAndG91Y2gnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBvbkNvbnRleHRNZW51ID0gKGUpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGFkZEdsb2JhbExpc3RlbmVyKGUudGFyZ2V0LCAnY29udGV4dG1lbnUnLCBvbkNvbnRleHRNZW51LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBhZGRHbG9iYWxMaXN0ZW5lcih3aW5kb3csICdwb2ludGVydXAnLCAoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgbm8gY29udGV4dG1lbnUgZXZlbnQgaXMgZmlyZWQgcXVpY2tseSBhZnRlciBwb2ludGVydXAsIHJlbW92ZSB0aGUgaGFuZGxlclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gZnV0dXJlIGNvbnRleHQgbWVudSBldmVudHMgb3V0c2lkZSBhIGxvbmcgcHJlc3MgYXJlIG5vdCBwcmV2ZW50ZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlR2xvYmFsTGlzdGVuZXIoZS50YXJnZXQsICdjb250ZXh0bWVudScsIG9uQ29udGV4dE1lbnUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMzApO1xuICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb25QcmVzc0VuZCAoZSkge1xuICAgICAgICAgICAgaWYgKHRpbWVSZWYuY3VycmVudCkgY2xlYXJUaW1lb3V0KHRpbWVSZWYuY3VycmVudCk7XG4gICAgICAgICAgICBpZiAob25Mb25nUHJlc3NFbmQgJiYgKGUucG9pbnRlclR5cGUgPT09ICdtb3VzZScgfHwgZS5wb2ludGVyVHlwZSA9PT0gJ3RvdWNoJykpIG9uTG9uZ1ByZXNzRW5kKHtcbiAgICAgICAgICAgICAgICAuLi5lLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdsb25ncHJlc3NlbmQnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGxldCBkZXNjcmlwdGlvblByb3BzID0gKDAsICQ0azJrdiR1c2VEZXNjcmlwdGlvbikob25Mb25nUHJlc3MgJiYgIWlzRGlzYWJsZWQgPyBhY2Nlc3NpYmlsaXR5RGVzY3JpcHRpb24gOiB1bmRlZmluZWQpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGxvbmdQcmVzc1Byb3BzOiAoMCwgJDRrMmt2JG1lcmdlUHJvcHMpKHByZXNzUHJvcHMsIGRlc2NyaXB0aW9uUHJvcHMpXG4gICAgfTtcbn1cblxuXG5leHBvcnQgeyQ4YTI2NTYxZDI4NzcyMzZlJGV4cG9ydCRjMjRlZDAxMDRkMDdlYWI5IGFzIHVzZUxvbmdQcmVzc307XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VMb25nUHJlc3MubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHtQcmVzc2FibGUgYXMgJDNiMTE3ZTQzZGMwY2E5NWQkZXhwb3J0JDI3YzcwMWVkOWU0NDllOTl9IGZyb20gXCIuL1ByZXNzYWJsZS5tanNcIjtcbmltcG9ydCB7Q2xlYXJQcmVzc1Jlc3BvbmRlciBhcyAkZjFhYjhjNzU0NzhjNmY3MyRleHBvcnQkY2Y3NTQyOGUwYjllZDFlYSwgUHJlc3NSZXNwb25kZXIgYXMgJGYxYWI4Yzc1NDc4YzZmNzMkZXhwb3J0JDMzNTE4NzFlZTRiMjg4Yjh9IGZyb20gXCIuL1ByZXNzUmVzcG9uZGVyLm1qc1wiO1xuaW1wb3J0IHt1c2VGb2N1cyBhcyAkYTFlYTU5ZDY4MjcwZjBkZCRleHBvcnQkZjgxNjhkOGRkOGZkNjZlNn0gZnJvbSBcIi4vdXNlRm9jdXMubWpzXCI7XG5pbXBvcnQge2FkZFdpbmRvd0ZvY3VzVHJhY2tpbmcgYXMgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JDJmMTg4ODExMmY1NThhN2QsIGdldEludGVyYWN0aW9uTW9kYWxpdHkgYXMgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JDYzMGZmNjUzYzVhZGE2YTksIGlzRm9jdXNWaXNpYmxlIGFzICQ1MDdmYWJlMTBlNzFjNmZiJGV4cG9ydCRiOWIzZGZkZGFiMTdkYjI3LCBzZXRJbnRlcmFjdGlvbk1vZGFsaXR5IGFzICQ1MDdmYWJlMTBlNzFjNmZiJGV4cG9ydCQ4Mzk3ZGRmYzUwNGZkYjlhLCB1c2VGb2N1c1Zpc2libGUgYXMgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JGZmZDllNTAyMWMxZmIyZDYsIHVzZUZvY3VzVmlzaWJsZUxpc3RlbmVyIGFzICQ1MDdmYWJlMTBlNzFjNmZiJGV4cG9ydCRlYzcxYjRiODNhYzA4ZWMzLCB1c2VJbnRlcmFjdGlvbk1vZGFsaXR5IGFzICQ1MDdmYWJlMTBlNzFjNmZiJGV4cG9ydCQ5OGUyMGVjOTJmNjE0Y2ZlfSBmcm9tIFwiLi91c2VGb2N1c1Zpc2libGUubWpzXCI7XG5pbXBvcnQge3VzZUZvY3VzV2l0aGluIGFzICQ5YWI5NDI2MmJkMDA0N2M3JGV4cG9ydCQ0MjBlNjgyNzMxNjVmNGVjfSBmcm9tIFwiLi91c2VGb2N1c1dpdGhpbi5tanNcIjtcbmltcG9ydCB7dXNlSG92ZXIgYXMgJDYxNzliOTM2NzA1ZTc2ZDMkZXhwb3J0JGFlNzgwZGFmMjllNmQ0NTZ9IGZyb20gXCIuL3VzZUhvdmVyLm1qc1wiO1xuaW1wb3J0IHt1c2VJbnRlcmFjdE91dHNpZGUgYXMgJGUwYjZlMGI2OGVjN2Y1MGYkZXhwb3J0JDg3MmI2NjBhYzVhMWZmOTh9IGZyb20gXCIuL3VzZUludGVyYWN0T3V0c2lkZS5tanNcIjtcbmltcG9ydCB7dXNlS2V5Ym9hcmQgYXMgJDQ2ZDgxOWZjYmFmMzU2NTQkZXhwb3J0JDhmNzE2NTQ4MDFjMmY3Y2R9IGZyb20gXCIuL3VzZUtleWJvYXJkLm1qc1wiO1xuaW1wb3J0IHt1c2VNb3ZlIGFzICRlOGE3MDIyY2Y4N2NiYTJhJGV4cG9ydCQzNmRhOTYzNzlmNzlmMjQ1fSBmcm9tIFwiLi91c2VNb3ZlLm1qc1wiO1xuaW1wb3J0IHt1c2VQcmVzcyBhcyAkZjZjMzFjY2UyYWRmNjU0ZiRleHBvcnQkNDU3MTJlY2VkYTZmYWQyMX0gZnJvbSBcIi4vdXNlUHJlc3MubWpzXCI7XG5pbXBvcnQge3VzZVNjcm9sbFdoZWVsIGFzICQ3ZDBhNjM2ZDdhNGRjZWZkJGV4cG9ydCQyMTIzZmYyYjg3YzgxY2F9IGZyb20gXCIuL3VzZVNjcm9sbFdoZWVsLm1qc1wiO1xuaW1wb3J0IHt1c2VMb25nUHJlc3MgYXMgJDhhMjY1NjFkMjg3NzIzNmUkZXhwb3J0JGMyNGVkMDEwNGQwN2VhYjl9IGZyb20gXCIuL3VzZUxvbmdQcmVzcy5tanNcIjtcbmltcG9ydCB7Rm9jdXNhYmxlIGFzICRmNjQ1NjY3ZmViZjU3YTYzJGV4cG9ydCQzNWEzYmViZjdlZjJkOTM0LCBGb2N1c2FibGVDb250ZXh0IGFzICRmNjQ1NjY3ZmViZjU3YTYzJGV4cG9ydCRmOTc2MmZhYjc3NTg4ZWNiLCBGb2N1c2FibGVQcm92aWRlciBhcyAkZjY0NTY2N2ZlYmY1N2E2MyRleHBvcnQkMTNmMzIwMmEzZTVkZGQ1LCB1c2VGb2N1c2FibGUgYXMgJGY2NDU2NjdmZWJmNTdhNjMkZXhwb3J0JDRjMDE0ZGU3Yzg5NDBiNGN9IGZyb20gXCIuL3VzZUZvY3VzYWJsZS5tanNcIjtcbmltcG9ydCB7Zm9jdXNTYWZlbHkgYXMgJDNhZDNmNmUxNjQ3YmM5OGQkZXhwb3J0JDgwZjNlMTQ3ZDc4MTU3MWN9IGZyb20gXCIuL2ZvY3VzU2FmZWx5Lm1qc1wiO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMjAgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5leHBvcnQgeyQzYjExN2U0M2RjMGNhOTVkJGV4cG9ydCQyN2M3MDFlZDllNDQ5ZTk5IGFzIFByZXNzYWJsZSwgJGYxYWI4Yzc1NDc4YzZmNzMkZXhwb3J0JDMzNTE4NzFlZTRiMjg4YjggYXMgUHJlc3NSZXNwb25kZXIsICRmMWFiOGM3NTQ3OGM2ZjczJGV4cG9ydCRjZjc1NDI4ZTBiOWVkMWVhIGFzIENsZWFyUHJlc3NSZXNwb25kZXIsICRhMWVhNTlkNjgyNzBmMGRkJGV4cG9ydCRmODE2OGQ4ZGQ4ZmQ2NmU2IGFzIHVzZUZvY3VzLCAkNTA3ZmFiZTEwZTcxYzZmYiRleHBvcnQkYjliM2RmZGRhYjE3ZGIyNyBhcyBpc0ZvY3VzVmlzaWJsZSwgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JDYzMGZmNjUzYzVhZGE2YTkgYXMgZ2V0SW50ZXJhY3Rpb25Nb2RhbGl0eSwgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JDgzOTdkZGZjNTA0ZmRiOWEgYXMgc2V0SW50ZXJhY3Rpb25Nb2RhbGl0eSwgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JDJmMTg4ODExMmY1NThhN2QgYXMgYWRkV2luZG93Rm9jdXNUcmFja2luZywgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JDk4ZTIwZWM5MmY2MTRjZmUgYXMgdXNlSW50ZXJhY3Rpb25Nb2RhbGl0eSwgJDUwN2ZhYmUxMGU3MWM2ZmIkZXhwb3J0JGZmZDllNTAyMWMxZmIyZDYgYXMgdXNlRm9jdXNWaXNpYmxlLCAkNTA3ZmFiZTEwZTcxYzZmYiRleHBvcnQkZWM3MWI0YjgzYWMwOGVjMyBhcyB1c2VGb2N1c1Zpc2libGVMaXN0ZW5lciwgJDlhYjk0MjYyYmQwMDQ3YzckZXhwb3J0JDQyMGU2ODI3MzE2NWY0ZWMgYXMgdXNlRm9jdXNXaXRoaW4sICQ2MTc5YjkzNjcwNWU3NmQzJGV4cG9ydCRhZTc4MGRhZjI5ZTZkNDU2IGFzIHVzZUhvdmVyLCAkZTBiNmUwYjY4ZWM3ZjUwZiRleHBvcnQkODcyYjY2MGFjNWExZmY5OCBhcyB1c2VJbnRlcmFjdE91dHNpZGUsICQ0NmQ4MTlmY2JhZjM1NjU0JGV4cG9ydCQ4ZjcxNjU0ODAxYzJmN2NkIGFzIHVzZUtleWJvYXJkLCAkZThhNzAyMmNmODdjYmEyYSRleHBvcnQkMzZkYTk2Mzc5Zjc5ZjI0NSBhcyB1c2VNb3ZlLCAkZjZjMzFjY2UyYWRmNjU0ZiRleHBvcnQkNDU3MTJlY2VkYTZmYWQyMSBhcyB1c2VQcmVzcywgJDdkMGE2MzZkN2E0ZGNlZmQkZXhwb3J0JDIxMjNmZjJiODdjODFjYSBhcyB1c2VTY3JvbGxXaGVlbCwgJDhhMjY1NjFkMjg3NzIzNmUkZXhwb3J0JGMyNGVkMDEwNGQwN2VhYjkgYXMgdXNlTG9uZ1ByZXNzLCAkZjY0NTY2N2ZlYmY1N2E2MyRleHBvcnQkNGMwMTRkZTdjODk0MGI0YyBhcyB1c2VGb2N1c2FibGUsICRmNjQ1NjY3ZmViZjU3YTYzJGV4cG9ydCQxM2YzMjAyYTNlNWRkZDUgYXMgRm9jdXNhYmxlUHJvdmlkZXIsICRmNjQ1NjY3ZmViZjU3YTYzJGV4cG9ydCQzNWEzYmViZjdlZjJkOTM0IGFzIEZvY3VzYWJsZSwgJGY2NDU2NjdmZWJmNTdhNjMkZXhwb3J0JGY5NzYyZmFiNzc1ODhlY2IgYXMgRm9jdXNhYmxlQ29udGV4dCwgJDNhZDNmNmUxNjQ3YmM5OGQkZXhwb3J0JDgwZjNlMTQ3ZDc4MTU3MWMgYXMgZm9jdXNTYWZlbHl9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHt1c2VMYXlvdXRFZmZlY3QgYXMgJGNnYXdDJHVzZUxheW91dEVmZmVjdCwgZ2V0QWN0aXZlRWxlbWVudCBhcyAkY2dhd0MkZ2V0QWN0aXZlRWxlbWVudCwgZ2V0T3duZXJEb2N1bWVudCBhcyAkY2dhd0MkZ2V0T3duZXJEb2N1bWVudCwgZ2V0RXZlbnRUYXJnZXQgYXMgJGNnYXdDJGdldEV2ZW50VGFyZ2V0LCBpc0FuZHJvaWQgYXMgJGNnYXdDJGlzQW5kcm9pZCwgaXNDaHJvbWUgYXMgJGNnYXdDJGlzQ2hyb21lLCBpc1RhYmJhYmxlIGFzICRjZ2F3QyRpc1RhYmJhYmxlLCBpc0ZvY3VzYWJsZSBhcyAkY2dhd0MkaXNGb2N1c2FibGUsIGNyZWF0ZVNoYWRvd1RyZWVXYWxrZXIgYXMgJGNnYXdDJGNyZWF0ZVNoYWRvd1RyZWVXYWxrZXJ9IGZyb20gXCJAcmVhY3QtYXJpYS91dGlsc1wiO1xuaW1wb3J0IHtnZXRJbnRlcmFjdGlvbk1vZGFsaXR5IGFzICRjZ2F3QyRnZXRJbnRlcmFjdGlvbk1vZGFsaXR5LCBmb2N1c1NhZmVseSBhcyAkY2dhd0MkZm9jdXNTYWZlbHl9IGZyb20gXCJAcmVhY3QtYXJpYS9pbnRlcmFjdGlvbnNcIjtcbmltcG9ydCAkY2dhd0MkcmVhY3QsIHt1c2VSZWYgYXMgJGNnYXdDJHVzZVJlZiwgdXNlQ29udGV4dCBhcyAkY2dhd0MkdXNlQ29udGV4dCwgdXNlTWVtbyBhcyAkY2dhd0MkdXNlTWVtbywgdXNlRWZmZWN0IGFzICRjZ2F3QyR1c2VFZmZlY3R9IGZyb20gXCJyZWFjdFwiO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMjAgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gXG5cblxuY29uc3QgJDliZjcxZWEyODc5M2U3MzgkdmFyJEZvY3VzQ29udGV4dCA9IC8qI19fUFVSRV9fKi8gKDAsICRjZ2F3QyRyZWFjdCkuY3JlYXRlQ29udGV4dChudWxsKTtcbmNvbnN0ICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRSRVNUT1JFX0ZPQ1VTX0VWRU5UID0gJ3JlYWN0LWFyaWEtZm9jdXMtc2NvcGUtcmVzdG9yZSc7XG5sZXQgJDliZjcxZWEyODc5M2U3MzgkdmFyJGFjdGl2ZVNjb3BlID0gbnVsbDtcbmZ1bmN0aW9uICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCQyMGU0MDI4OTY0MWZiYmI2KHByb3BzKSB7XG4gICAgbGV0IHsgY2hpbGRyZW46IGNoaWxkcmVuLCBjb250YWluOiBjb250YWluLCByZXN0b3JlRm9jdXM6IHJlc3RvcmVGb2N1cywgYXV0b0ZvY3VzOiBhdXRvRm9jdXMgfSA9IHByb3BzO1xuICAgIGxldCBzdGFydFJlZiA9ICgwLCAkY2dhd0MkdXNlUmVmKShudWxsKTtcbiAgICBsZXQgZW5kUmVmID0gKDAsICRjZ2F3QyR1c2VSZWYpKG51bGwpO1xuICAgIGxldCBzY29wZVJlZiA9ICgwLCAkY2dhd0MkdXNlUmVmKShbXSk7XG4gICAgbGV0IHsgcGFyZW50Tm9kZTogcGFyZW50Tm9kZSB9ID0gKDAsICRjZ2F3QyR1c2VDb250ZXh0KSgkOWJmNzFlYTI4NzkzZTczOCR2YXIkRm9jdXNDb250ZXh0KSB8fCB7fTtcbiAgICAvLyBDcmVhdGUgYSB0cmVlIG5vZGUgaGVyZSBzbyB3ZSBjYW4gYWRkIGNoaWxkcmVuIHRvIGl0IGV2ZW4gYmVmb3JlIGl0IGlzIGFkZGVkIHRvIHRoZSB0cmVlLlxuICAgIGxldCBub2RlID0gKDAsICRjZ2F3QyR1c2VNZW1vKSgoKT0+bmV3ICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRUcmVlTm9kZSh7XG4gICAgICAgICAgICBzY29wZVJlZjogc2NvcGVSZWZcbiAgICAgICAgfSksIFtcbiAgICAgICAgc2NvcGVSZWZcbiAgICBdKTtcbiAgICAoMCwgJGNnYXdDJHVzZUxheW91dEVmZmVjdCkoKCk9PntcbiAgICAgICAgLy8gSWYgYSBuZXcgc2NvcGUgbW91bnRzIG91dHNpZGUgdGhlIGFjdGl2ZSBzY29wZSwgKGUuZy4gRGlhbG9nQ29udGFpbmVyIGxhdW5jaGVkIGZyb20gYSBtZW51KSxcbiAgICAgICAgLy8gdXNlIHRoZSBhY3RpdmUgc2NvcGUgYXMgdGhlIHBhcmVudCBpbnN0ZWFkIG9mIHRoZSBwYXJlbnQgZnJvbSBjb250ZXh0LiBMYXlvdXQgZWZmZWN0cyBydW4gYm90dG9tXG4gICAgICAgIC8vIHVwLCBzbyBpZiB0aGUgcGFyZW50IGlzIG5vdCB5ZXQgYWRkZWQgdG8gdGhlIHRyZWUsIGRvbid0IGRvIHRoaXMuIE9ubHkgdGhlIG91dGVyLW1vc3QgRm9jdXNTY29wZVxuICAgICAgICAvLyB0aGF0IGlzIGJlaW5nIGFkZGVkIHNob3VsZCBnZXQgdGhlIGFjdGl2ZVNjb3BlIGFzIGl0cyBwYXJlbnQuXG4gICAgICAgIGxldCBwYXJlbnQgPSBwYXJlbnROb2RlIHx8ICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCRkMDZmYWUyZWU2OGIxMDFlLnJvb3Q7XG4gICAgICAgIGlmICgkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkZDA2ZmFlMmVlNjhiMTAxZS5nZXRUcmVlTm9kZShwYXJlbnQuc2NvcGVSZWYpICYmICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRhY3RpdmVTY29wZSAmJiAhJDliZjcxZWEyODc5M2U3MzgkdmFyJGlzQW5jZXN0b3JTY29wZSgkOWJmNzFlYTI4NzkzZTczOCR2YXIkYWN0aXZlU2NvcGUsIHBhcmVudC5zY29wZVJlZikpIHtcbiAgICAgICAgICAgIGxldCBhY3RpdmVOb2RlID0gJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JGQwNmZhZTJlZTY4YjEwMWUuZ2V0VHJlZU5vZGUoJDliZjcxZWEyODc5M2U3MzgkdmFyJGFjdGl2ZVNjb3BlKTtcbiAgICAgICAgICAgIGlmIChhY3RpdmVOb2RlKSBwYXJlbnQgPSBhY3RpdmVOb2RlO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFkZCB0aGUgbm9kZSB0byB0aGUgcGFyZW50LCBhbmQgdG8gdGhlIHRyZWUuXG4gICAgICAgIHBhcmVudC5hZGRDaGlsZChub2RlKTtcbiAgICAgICAgJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JGQwNmZhZTJlZTY4YjEwMWUuYWRkTm9kZShub2RlKTtcbiAgICB9LCBbXG4gICAgICAgIG5vZGUsXG4gICAgICAgIHBhcmVudE5vZGVcbiAgICBdKTtcbiAgICAoMCwgJGNnYXdDJHVzZUxheW91dEVmZmVjdCkoKCk9PntcbiAgICAgICAgbGV0IG5vZGUgPSAkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkZDA2ZmFlMmVlNjhiMTAxZS5nZXRUcmVlTm9kZShzY29wZVJlZik7XG4gICAgICAgIGlmIChub2RlKSBub2RlLmNvbnRhaW4gPSAhIWNvbnRhaW47XG4gICAgfSwgW1xuICAgICAgICBjb250YWluXG4gICAgXSk7XG4gICAgKDAsICRjZ2F3QyR1c2VMYXlvdXRFZmZlY3QpKCgpPT57XG4gICAgICAgIHZhciBfc3RhcnRSZWZfY3VycmVudDtcbiAgICAgICAgLy8gRmluZCBhbGwgcmVuZGVyZWQgbm9kZXMgYmV0d2VlbiB0aGUgc2VudGluZWxzIGFuZCBhZGQgdGhlbSB0byB0aGUgc2NvcGUuXG4gICAgICAgIGxldCBub2RlID0gKF9zdGFydFJlZl9jdXJyZW50ID0gc3RhcnRSZWYuY3VycmVudCkgPT09IG51bGwgfHwgX3N0YXJ0UmVmX2N1cnJlbnQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9zdGFydFJlZl9jdXJyZW50Lm5leHRTaWJsaW5nO1xuICAgICAgICBsZXQgbm9kZXMgPSBbXTtcbiAgICAgICAgbGV0IHN0b3BQcm9wYWdhdGlvbiA9IChlKT0+ZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgd2hpbGUobm9kZSAmJiBub2RlICE9PSBlbmRSZWYuY3VycmVudCl7XG4gICAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgLy8gU3RvcCBjdXN0b20gcmVzdG9yZSBmb2N1cyBldmVudCBmcm9tIHByb3BhZ2F0aW5nIHRvIHBhcmVudCBmb2N1cyBzY29wZXMuXG4gICAgICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJDliZjcxZWEyODc5M2U3MzgkdmFyJFJFU1RPUkVfRk9DVVNfRVZFTlQsIHN0b3BQcm9wYWdhdGlvbik7XG4gICAgICAgICAgICBub2RlID0gbm9kZS5uZXh0U2libGluZztcbiAgICAgICAgfVxuICAgICAgICBzY29wZVJlZi5jdXJyZW50ID0gbm9kZXM7XG4gICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBub2Rlcylub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJDliZjcxZWEyODc5M2U3MzgkdmFyJFJFU1RPUkVfRk9DVVNfRVZFTlQsIHN0b3BQcm9wYWdhdGlvbik7XG4gICAgICAgIH07XG4gICAgfSwgW1xuICAgICAgICBjaGlsZHJlblxuICAgIF0pO1xuICAgICQ5YmY3MWVhMjg3OTNlNzM4JHZhciR1c2VBY3RpdmVTY29wZVRyYWNrZXIoc2NvcGVSZWYsIHJlc3RvcmVGb2N1cywgY29udGFpbik7XG4gICAgJDliZjcxZWEyODc5M2U3MzgkdmFyJHVzZUZvY3VzQ29udGFpbm1lbnQoc2NvcGVSZWYsIGNvbnRhaW4pO1xuICAgICQ5YmY3MWVhMjg3OTNlNzM4JHZhciR1c2VSZXN0b3JlRm9jdXMoc2NvcGVSZWYsIHJlc3RvcmVGb2N1cywgY29udGFpbik7XG4gICAgJDliZjcxZWEyODc5M2U3MzgkdmFyJHVzZUF1dG9Gb2N1cyhzY29wZVJlZiwgYXV0b0ZvY3VzKTtcbiAgICAvLyBUaGlzIG5lZWRzIHRvIGJlIGFuIGVmZmVjdCBzbyB0aGF0IGFjdGl2ZVNjb3BlIGlzIHVwZGF0ZWQgYWZ0ZXIgdGhlIEZvY3VzU2NvcGUgdHJlZSBpcyBjb21wbGV0ZS5cbiAgICAvLyBJdCBjYW5ub3QgYmUgYSB1c2VMYXlvdXRFZmZlY3QgYmVjYXVzZSB0aGUgcGFyZW50IG9mIHRoaXMgbm9kZSBoYXNuJ3QgYmVlbiBhdHRhY2hlZCBpbiB0aGUgdHJlZSB5ZXQuXG4gICAgKDAsICRjZ2F3QyR1c2VFZmZlY3QpKCgpPT57XG4gICAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSAoMCwgJGNnYXdDJGdldEFjdGl2ZUVsZW1lbnQpKCgwLCAkY2dhd0MkZ2V0T3duZXJEb2N1bWVudCkoc2NvcGVSZWYuY3VycmVudCA/IHNjb3BlUmVmLmN1cnJlbnRbMF0gOiB1bmRlZmluZWQpKTtcbiAgICAgICAgbGV0IHNjb3BlID0gbnVsbDtcbiAgICAgICAgaWYgKCQ5YmY3MWVhMjg3OTNlNzM4JHZhciRpc0VsZW1lbnRJblNjb3BlKGFjdGl2ZUVsZW1lbnQsIHNjb3BlUmVmLmN1cnJlbnQpKSB7XG4gICAgICAgICAgICAvLyBXZSBuZWVkIHRvIHRyYXZlcnNlIHRoZSBmb2N1c1Njb3BlIHRyZWUgYW5kIGZpbmQgdGhlIGJvdHRvbSBtb3N0IHNjb3BlIHRoYXRcbiAgICAgICAgICAgIC8vIGNvbnRhaW5zIHRoZSBhY3RpdmUgZWxlbWVudCBhbmQgc2V0IHRoYXQgYXMgdGhlIGFjdGl2ZVNjb3BlLlxuICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiAkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkZDA2ZmFlMmVlNjhiMTAxZS50cmF2ZXJzZSgpKWlmIChub2RlLnNjb3BlUmVmICYmICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRpc0VsZW1lbnRJblNjb3BlKGFjdGl2ZUVsZW1lbnQsIG5vZGUuc2NvcGVSZWYuY3VycmVudCkpIHNjb3BlID0gbm9kZTtcbiAgICAgICAgICAgIGlmIChzY29wZSA9PT0gJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JGQwNmZhZTJlZTY4YjEwMWUuZ2V0VHJlZU5vZGUoc2NvcGVSZWYpKSAkOWJmNzFlYTI4NzkzZTczOCR2YXIkYWN0aXZlU2NvcGUgPSBzY29wZS5zY29wZVJlZjtcbiAgICAgICAgfVxuICAgIH0sIFtcbiAgICAgICAgc2NvcGVSZWZcbiAgICBdKTtcbiAgICAvLyBUaGlzIGxheW91dCBlZmZlY3QgY2xlYW51cCBpcyBzbyB0aGF0IHRoZSB0cmVlIG5vZGUgaXMgcmVtb3ZlZCBzeW5jaHJvbm91c2x5IHdpdGggcmVhY3QgYmVmb3JlIHRoZSBSQUZcbiAgICAvLyBpbiB1c2VSZXN0b3JlRm9jdXMgY2xlYW51cCBydW5zLlxuICAgICgwLCAkY2dhd0MkdXNlTGF5b3V0RWZmZWN0KSgoKT0+e1xuICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgIHZhciBfZm9jdXNTY29wZVRyZWVfZ2V0VHJlZU5vZGVfcGFyZW50LCBfZm9jdXNTY29wZVRyZWVfZ2V0VHJlZU5vZGU7XG4gICAgICAgICAgICB2YXIgX2ZvY3VzU2NvcGVUcmVlX2dldFRyZWVOb2RlX3BhcmVudF9zY29wZVJlZjtcbiAgICAgICAgICAgIC8vIFNjb3BlIG1heSBoYXZlIGJlZW4gcmUtcGFyZW50ZWQuXG4gICAgICAgICAgICBsZXQgcGFyZW50U2NvcGUgPSAoX2ZvY3VzU2NvcGVUcmVlX2dldFRyZWVOb2RlX3BhcmVudF9zY29wZVJlZiA9IChfZm9jdXNTY29wZVRyZWVfZ2V0VHJlZU5vZGUgPSAkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkZDA2ZmFlMmVlNjhiMTAxZS5nZXRUcmVlTm9kZShzY29wZVJlZikpID09PSBudWxsIHx8IF9mb2N1c1Njb3BlVHJlZV9nZXRUcmVlTm9kZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogKF9mb2N1c1Njb3BlVHJlZV9nZXRUcmVlTm9kZV9wYXJlbnQgPSBfZm9jdXNTY29wZVRyZWVfZ2V0VHJlZU5vZGUucGFyZW50KSA9PT0gbnVsbCB8fCBfZm9jdXNTY29wZVRyZWVfZ2V0VHJlZU5vZGVfcGFyZW50ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZm9jdXNTY29wZVRyZWVfZ2V0VHJlZU5vZGVfcGFyZW50LnNjb3BlUmVmKSAhPT0gbnVsbCAmJiBfZm9jdXNTY29wZVRyZWVfZ2V0VHJlZU5vZGVfcGFyZW50X3Njb3BlUmVmICE9PSB2b2lkIDAgPyBfZm9jdXNTY29wZVRyZWVfZ2V0VHJlZU5vZGVfcGFyZW50X3Njb3BlUmVmIDogbnVsbDtcbiAgICAgICAgICAgIGlmICgoc2NvcGVSZWYgPT09ICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRhY3RpdmVTY29wZSB8fCAkOWJmNzFlYTI4NzkzZTczOCR2YXIkaXNBbmNlc3RvclNjb3BlKHNjb3BlUmVmLCAkOWJmNzFlYTI4NzkzZTczOCR2YXIkYWN0aXZlU2NvcGUpKSAmJiAoIXBhcmVudFNjb3BlIHx8ICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCRkMDZmYWUyZWU2OGIxMDFlLmdldFRyZWVOb2RlKHBhcmVudFNjb3BlKSkpICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRhY3RpdmVTY29wZSA9IHBhcmVudFNjb3BlO1xuICAgICAgICAgICAgJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JGQwNmZhZTJlZTY4YjEwMWUucmVtb3ZlVHJlZU5vZGUoc2NvcGVSZWYpO1xuICAgICAgICB9O1xuICAgIH0sIFtcbiAgICAgICAgc2NvcGVSZWZcbiAgICBdKTtcbiAgICBsZXQgZm9jdXNNYW5hZ2VyID0gKDAsICRjZ2F3QyR1c2VNZW1vKSgoKT0+JDliZjcxZWEyODc5M2U3MzgkdmFyJGNyZWF0ZUZvY3VzTWFuYWdlckZvclNjb3BlKHNjb3BlUmVmKSwgW10pO1xuICAgIGxldCB2YWx1ZSA9ICgwLCAkY2dhd0MkdXNlTWVtbykoKCk9Pih7XG4gICAgICAgICAgICBmb2N1c01hbmFnZXI6IGZvY3VzTWFuYWdlcixcbiAgICAgICAgICAgIHBhcmVudE5vZGU6IG5vZGVcbiAgICAgICAgfSksIFtcbiAgICAgICAgbm9kZSxcbiAgICAgICAgZm9jdXNNYW5hZ2VyXG4gICAgXSk7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gKDAsICRjZ2F3QyRyZWFjdCkuY3JlYXRlRWxlbWVudCgkOWJmNzFlYTI4NzkzZTczOCR2YXIkRm9jdXNDb250ZXh0LlByb3ZpZGVyLCB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgIH0sIC8qI19fUFVSRV9fKi8gKDAsICRjZ2F3QyRyZWFjdCkuY3JlYXRlRWxlbWVudChcInNwYW5cIiwge1xuICAgICAgICBcImRhdGEtZm9jdXMtc2NvcGUtc3RhcnRcIjogdHJ1ZSxcbiAgICAgICAgaGlkZGVuOiB0cnVlLFxuICAgICAgICByZWY6IHN0YXJ0UmVmXG4gICAgfSksIGNoaWxkcmVuLCAvKiNfX1BVUkVfXyovICgwLCAkY2dhd0MkcmVhY3QpLmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIsIHtcbiAgICAgICAgXCJkYXRhLWZvY3VzLXNjb3BlLWVuZFwiOiB0cnVlLFxuICAgICAgICBoaWRkZW46IHRydWUsXG4gICAgICAgIHJlZjogZW5kUmVmXG4gICAgfSkpO1xufVxuZnVuY3Rpb24gJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JDEwYzUxNjk3NTVjZTdiZDcoKSB7XG4gICAgdmFyIF91c2VDb250ZXh0O1xuICAgIHJldHVybiAoX3VzZUNvbnRleHQgPSAoMCwgJGNnYXdDJHVzZUNvbnRleHQpKCQ5YmY3MWVhMjg3OTNlNzM4JHZhciRGb2N1c0NvbnRleHQpKSA9PT0gbnVsbCB8fCBfdXNlQ29udGV4dCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX3VzZUNvbnRleHQuZm9jdXNNYW5hZ2VyO1xufVxuZnVuY3Rpb24gJDliZjcxZWEyODc5M2U3MzgkdmFyJGNyZWF0ZUZvY3VzTWFuYWdlckZvclNjb3BlKHNjb3BlUmVmKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZm9jdXNOZXh0IChvcHRzID0ge30pIHtcbiAgICAgICAgICAgIGxldCBzY29wZSA9IHNjb3BlUmVmLmN1cnJlbnQ7XG4gICAgICAgICAgICBsZXQgeyBmcm9tOiBmcm9tLCB0YWJiYWJsZTogdGFiYmFibGUsIHdyYXA6IHdyYXAsIGFjY2VwdDogYWNjZXB0IH0gPSBvcHRzO1xuICAgICAgICAgICAgdmFyIF9zY29wZV87XG4gICAgICAgICAgICBsZXQgbm9kZSA9IGZyb20gfHwgKDAsICRjZ2F3QyRnZXRBY3RpdmVFbGVtZW50KSgoMCwgJGNnYXdDJGdldE93bmVyRG9jdW1lbnQpKChfc2NvcGVfID0gc2NvcGVbMF0pICE9PSBudWxsICYmIF9zY29wZV8gIT09IHZvaWQgMCA/IF9zY29wZV8gOiB1bmRlZmluZWQpKTtcbiAgICAgICAgICAgIGxldCBzZW50aW5lbCA9IHNjb3BlWzBdLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgICAgICAgICBsZXQgc2NvcGVSb290ID0gJDliZjcxZWEyODc5M2U3MzgkdmFyJGdldFNjb3BlUm9vdChzY29wZSk7XG4gICAgICAgICAgICBsZXQgd2Fsa2VyID0gJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JDJkNmVjOGZjMzc1Y2VhZmEoc2NvcGVSb290LCB7XG4gICAgICAgICAgICAgICAgdGFiYmFibGU6IHRhYmJhYmxlLFxuICAgICAgICAgICAgICAgIGFjY2VwdDogYWNjZXB0XG4gICAgICAgICAgICB9LCBzY29wZSk7XG4gICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSAkOWJmNzFlYTI4NzkzZTczOCR2YXIkaXNFbGVtZW50SW5TY29wZShub2RlLCBzY29wZSkgPyBub2RlIDogc2VudGluZWw7XG4gICAgICAgICAgICBsZXQgbmV4dE5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgIGlmICghbmV4dE5vZGUgJiYgd3JhcCkge1xuICAgICAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IHNlbnRpbmVsO1xuICAgICAgICAgICAgICAgIG5leHROb2RlID0gd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobmV4dE5vZGUpICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRmb2N1c0VsZW1lbnQobmV4dE5vZGUsIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIG5leHROb2RlO1xuICAgICAgICB9LFxuICAgICAgICBmb2N1c1ByZXZpb3VzIChvcHRzID0ge30pIHtcbiAgICAgICAgICAgIGxldCBzY29wZSA9IHNjb3BlUmVmLmN1cnJlbnQ7XG4gICAgICAgICAgICBsZXQgeyBmcm9tOiBmcm9tLCB0YWJiYWJsZTogdGFiYmFibGUsIHdyYXA6IHdyYXAsIGFjY2VwdDogYWNjZXB0IH0gPSBvcHRzO1xuICAgICAgICAgICAgdmFyIF9zY29wZV87XG4gICAgICAgICAgICBsZXQgbm9kZSA9IGZyb20gfHwgKDAsICRjZ2F3QyRnZXRBY3RpdmVFbGVtZW50KSgoMCwgJGNnYXdDJGdldE93bmVyRG9jdW1lbnQpKChfc2NvcGVfID0gc2NvcGVbMF0pICE9PSBudWxsICYmIF9zY29wZV8gIT09IHZvaWQgMCA/IF9zY29wZV8gOiB1bmRlZmluZWQpKTtcbiAgICAgICAgICAgIGxldCBzZW50aW5lbCA9IHNjb3BlW3Njb3BlLmxlbmd0aCAtIDFdLm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgICAgIGxldCBzY29wZVJvb3QgPSAkOWJmNzFlYTI4NzkzZTczOCR2YXIkZ2V0U2NvcGVSb290KHNjb3BlKTtcbiAgICAgICAgICAgIGxldCB3YWxrZXIgPSAkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkMmQ2ZWM4ZmMzNzVjZWFmYShzY29wZVJvb3QsIHtcbiAgICAgICAgICAgICAgICB0YWJiYWJsZTogdGFiYmFibGUsXG4gICAgICAgICAgICAgICAgYWNjZXB0OiBhY2NlcHRcbiAgICAgICAgICAgIH0sIHNjb3BlKTtcbiAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9ICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRpc0VsZW1lbnRJblNjb3BlKG5vZGUsIHNjb3BlKSA/IG5vZGUgOiBzZW50aW5lbDtcbiAgICAgICAgICAgIGxldCBwcmV2aW91c05vZGUgPSB3YWxrZXIucHJldmlvdXNOb2RlKCk7XG4gICAgICAgICAgICBpZiAoIXByZXZpb3VzTm9kZSAmJiB3cmFwKSB7XG4gICAgICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gc2VudGluZWw7XG4gICAgICAgICAgICAgICAgcHJldmlvdXNOb2RlID0gd2Fsa2VyLnByZXZpb3VzTm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByZXZpb3VzTm9kZSkgJDliZjcxZWEyODc5M2U3MzgkdmFyJGZvY3VzRWxlbWVudChwcmV2aW91c05vZGUsIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzTm9kZTtcbiAgICAgICAgfSxcbiAgICAgICAgZm9jdXNGaXJzdCAob3B0cyA9IHt9KSB7XG4gICAgICAgICAgICBsZXQgc2NvcGUgPSBzY29wZVJlZi5jdXJyZW50O1xuICAgICAgICAgICAgbGV0IHsgdGFiYmFibGU6IHRhYmJhYmxlLCBhY2NlcHQ6IGFjY2VwdCB9ID0gb3B0cztcbiAgICAgICAgICAgIGxldCBzY29wZVJvb3QgPSAkOWJmNzFlYTI4NzkzZTczOCR2YXIkZ2V0U2NvcGVSb290KHNjb3BlKTtcbiAgICAgICAgICAgIGxldCB3YWxrZXIgPSAkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkMmQ2ZWM4ZmMzNzVjZWFmYShzY29wZVJvb3QsIHtcbiAgICAgICAgICAgICAgICB0YWJiYWJsZTogdGFiYmFibGUsXG4gICAgICAgICAgICAgICAgYWNjZXB0OiBhY2NlcHRcbiAgICAgICAgICAgIH0sIHNjb3BlKTtcbiAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IHNjb3BlWzBdLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgICAgICAgICBsZXQgbmV4dE5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgIGlmIChuZXh0Tm9kZSkgJDliZjcxZWEyODc5M2U3MzgkdmFyJGZvY3VzRWxlbWVudChuZXh0Tm9kZSwgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm4gbmV4dE5vZGU7XG4gICAgICAgIH0sXG4gICAgICAgIGZvY3VzTGFzdCAob3B0cyA9IHt9KSB7XG4gICAgICAgICAgICBsZXQgc2NvcGUgPSBzY29wZVJlZi5jdXJyZW50O1xuICAgICAgICAgICAgbGV0IHsgdGFiYmFibGU6IHRhYmJhYmxlLCBhY2NlcHQ6IGFjY2VwdCB9ID0gb3B0cztcbiAgICAgICAgICAgIGxldCBzY29wZVJvb3QgPSAkOWJmNzFlYTI4NzkzZTczOCR2YXIkZ2V0U2NvcGVSb290KHNjb3BlKTtcbiAgICAgICAgICAgIGxldCB3YWxrZXIgPSAkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkMmQ2ZWM4ZmMzNzVjZWFmYShzY29wZVJvb3QsIHtcbiAgICAgICAgICAgICAgICB0YWJiYWJsZTogdGFiYmFibGUsXG4gICAgICAgICAgICAgICAgYWNjZXB0OiBhY2NlcHRcbiAgICAgICAgICAgIH0sIHNjb3BlKTtcbiAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IHNjb3BlW3Njb3BlLmxlbmd0aCAtIDFdLm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgICAgIGxldCBwcmV2aW91c05vZGUgPSB3YWxrZXIucHJldmlvdXNOb2RlKCk7XG4gICAgICAgICAgICBpZiAocHJldmlvdXNOb2RlKSAkOWJmNzFlYTI4NzkzZTczOCR2YXIkZm9jdXNFbGVtZW50KHByZXZpb3VzTm9kZSwgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm4gcHJldmlvdXNOb2RlO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRnZXRTY29wZVJvb3Qoc2NvcGUpIHtcbiAgICByZXR1cm4gc2NvcGVbMF0ucGFyZW50RWxlbWVudDtcbn1cbmZ1bmN0aW9uICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRzaG91bGRDb250YWluRm9jdXMoc2NvcGVSZWYpIHtcbiAgICBsZXQgc2NvcGUgPSAkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkZDA2ZmFlMmVlNjhiMTAxZS5nZXRUcmVlTm9kZSgkOWJmNzFlYTI4NzkzZTczOCR2YXIkYWN0aXZlU2NvcGUpO1xuICAgIHdoaWxlKHNjb3BlICYmIHNjb3BlLnNjb3BlUmVmICE9PSBzY29wZVJlZil7XG4gICAgICAgIGlmIChzY29wZS5jb250YWluKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHNjb3BlID0gc2NvcGUucGFyZW50O1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRpc1RhYmJhYmxlUmFkaW8oZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50LmNoZWNrZWQpIHJldHVybiB0cnVlO1xuICAgIGxldCByYWRpb3MgPSBbXTtcbiAgICBpZiAoIWVsZW1lbnQuZm9ybSkgcmFkaW9zID0gW1xuICAgICAgICAuLi4oMCwgJGNnYXdDJGdldE93bmVyRG9jdW1lbnQpKGVsZW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoYGlucHV0W3R5cGU9XCJyYWRpb1wiXVtuYW1lPVwiJHtDU1MuZXNjYXBlKGVsZW1lbnQubmFtZSl9XCJdYClcbiAgICBdLmZpbHRlcigocmFkaW8pPT4hcmFkaW8uZm9ybSk7XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBfZWxlbWVudF9mb3JtX2VsZW1lbnRzLCBfZWxlbWVudF9mb3JtO1xuICAgICAgICBsZXQgcmFkaW9MaXN0ID0gKF9lbGVtZW50X2Zvcm0gPSBlbGVtZW50LmZvcm0pID09PSBudWxsIHx8IF9lbGVtZW50X2Zvcm0gPT09IHZvaWQgMCA/IHZvaWQgMCA6IChfZWxlbWVudF9mb3JtX2VsZW1lbnRzID0gX2VsZW1lbnRfZm9ybS5lbGVtZW50cykgPT09IG51bGwgfHwgX2VsZW1lbnRfZm9ybV9lbGVtZW50cyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2VsZW1lbnRfZm9ybV9lbGVtZW50cy5uYW1lZEl0ZW0oZWxlbWVudC5uYW1lKTtcbiAgICAgICAgcmFkaW9zID0gW1xuICAgICAgICAgICAgLi4ucmFkaW9MaXN0ICE9PSBudWxsICYmIHJhZGlvTGlzdCAhPT0gdm9pZCAwID8gcmFkaW9MaXN0IDogW11cbiAgICAgICAgXTtcbiAgICB9XG4gICAgaWYgKCFyYWRpb3MpIHJldHVybiBmYWxzZTtcbiAgICBsZXQgYW55Q2hlY2tlZCA9IHJhZGlvcy5zb21lKChyYWRpbyk9PnJhZGlvLmNoZWNrZWQpO1xuICAgIHJldHVybiAhYW55Q2hlY2tlZDtcbn1cbmZ1bmN0aW9uICQ5YmY3MWVhMjg3OTNlNzM4JHZhciR1c2VGb2N1c0NvbnRhaW5tZW50KHNjb3BlUmVmLCBjb250YWluKSB7XG4gICAgbGV0IGZvY3VzZWROb2RlID0gKDAsICRjZ2F3QyR1c2VSZWYpKHVuZGVmaW5lZCk7XG4gICAgbGV0IHJhZiA9ICgwLCAkY2dhd0MkdXNlUmVmKSh1bmRlZmluZWQpO1xuICAgICgwLCAkY2dhd0MkdXNlTGF5b3V0RWZmZWN0KSgoKT0+e1xuICAgICAgICBsZXQgc2NvcGUgPSBzY29wZVJlZi5jdXJyZW50O1xuICAgICAgICBpZiAoIWNvbnRhaW4pIHtcbiAgICAgICAgICAgIC8vIGlmIGNvbnRhaW4gd2FzIGNoYW5nZWQsIHRoZW4gd2Ugc2hvdWxkIGNhbmNlbCBhbnkgb25nb2luZyB3YWl0cyB0byBwdWxsIGZvY3VzIGJhY2sgaW50byBjb250YWlubWVudFxuICAgICAgICAgICAgaWYgKHJhZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUocmFmLmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIHJhZi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG93bmVyRG9jdW1lbnQgPSAoMCwgJGNnYXdDJGdldE93bmVyRG9jdW1lbnQpKHNjb3BlID8gc2NvcGVbMF0gOiB1bmRlZmluZWQpO1xuICAgICAgICAvLyBIYW5kbGUgdGhlIFRhYiBrZXkgdG8gY29udGFpbiBmb2N1cyB3aXRoaW4gdGhlIHNjb3BlXG4gICAgICAgIGxldCBvbktleURvd24gPSAoZSk9PntcbiAgICAgICAgICAgIGlmIChlLmtleSAhPT0gJ1RhYicgfHwgZS5hbHRLZXkgfHwgZS5jdHJsS2V5IHx8IGUubWV0YUtleSB8fCAhJDliZjcxZWEyODc5M2U3MzgkdmFyJHNob3VsZENvbnRhaW5Gb2N1cyhzY29wZVJlZikgfHwgZS5pc0NvbXBvc2luZykgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IGZvY3VzZWRFbGVtZW50ID0gKDAsICRjZ2F3QyRnZXRBY3RpdmVFbGVtZW50KShvd25lckRvY3VtZW50KTtcbiAgICAgICAgICAgIGxldCBzY29wZSA9IHNjb3BlUmVmLmN1cnJlbnQ7XG4gICAgICAgICAgICBpZiAoIXNjb3BlIHx8ICEkOWJmNzFlYTI4NzkzZTczOCR2YXIkaXNFbGVtZW50SW5TY29wZShmb2N1c2VkRWxlbWVudCwgc2NvcGUpKSByZXR1cm47XG4gICAgICAgICAgICBsZXQgc2NvcGVSb290ID0gJDliZjcxZWEyODc5M2U3MzgkdmFyJGdldFNjb3BlUm9vdChzY29wZSk7XG4gICAgICAgICAgICBsZXQgd2Fsa2VyID0gJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JDJkNmVjOGZjMzc1Y2VhZmEoc2NvcGVSb290LCB7XG4gICAgICAgICAgICAgICAgdGFiYmFibGU6IHRydWVcbiAgICAgICAgICAgIH0sIHNjb3BlKTtcbiAgICAgICAgICAgIGlmICghZm9jdXNlZEVsZW1lbnQpIHJldHVybjtcbiAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IGZvY3VzZWRFbGVtZW50O1xuICAgICAgICAgICAgbGV0IG5leHRFbGVtZW50ID0gZS5zaGlmdEtleSA/IHdhbGtlci5wcmV2aW91c05vZGUoKSA6IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgaWYgKCFuZXh0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IGUuc2hpZnRLZXkgPyBzY29wZVtzY29wZS5sZW5ndGggLSAxXS5uZXh0RWxlbWVudFNpYmxpbmcgOiBzY29wZVswXS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgICAgICAgICAgICAgIG5leHRFbGVtZW50ID0gZS5zaGlmdEtleSA/IHdhbGtlci5wcmV2aW91c05vZGUoKSA6IHdhbGtlci5uZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKG5leHRFbGVtZW50KSAkOWJmNzFlYTI4NzkzZTczOCR2YXIkZm9jdXNFbGVtZW50KG5leHRFbGVtZW50LCB0cnVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IG9uRm9jdXMgPSAoZSk9PntcbiAgICAgICAgICAgIC8vIElmIGZvY3VzaW5nIGFuIGVsZW1lbnQgaW4gYSBjaGlsZCBzY29wZSBvZiB0aGUgY3VycmVudGx5IGFjdGl2ZSBzY29wZSwgdGhlIGNoaWxkIGJlY29tZXMgYWN0aXZlLlxuICAgICAgICAgICAgLy8gTW92aW5nIG91dCBvZiB0aGUgYWN0aXZlIHNjb3BlIHRvIGFuIGFuY2VzdG9yIGlzIG5vdCBhbGxvd2VkLlxuICAgICAgICAgICAgaWYgKCghJDliZjcxZWEyODc5M2U3MzgkdmFyJGFjdGl2ZVNjb3BlIHx8ICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRpc0FuY2VzdG9yU2NvcGUoJDliZjcxZWEyODc5M2U3MzgkdmFyJGFjdGl2ZVNjb3BlLCBzY29wZVJlZikpICYmICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRpc0VsZW1lbnRJblNjb3BlKCgwLCAkY2dhd0MkZ2V0RXZlbnRUYXJnZXQpKGUpLCBzY29wZVJlZi5jdXJyZW50KSkge1xuICAgICAgICAgICAgICAgICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRhY3RpdmVTY29wZSA9IHNjb3BlUmVmO1xuICAgICAgICAgICAgICAgIGZvY3VzZWROb2RlLmN1cnJlbnQgPSAoMCwgJGNnYXdDJGdldEV2ZW50VGFyZ2V0KShlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoJDliZjcxZWEyODc5M2U3MzgkdmFyJHNob3VsZENvbnRhaW5Gb2N1cyhzY29wZVJlZikgJiYgISQ5YmY3MWVhMjg3OTNlNzM4JHZhciRpc0VsZW1lbnRJbkNoaWxkU2NvcGUoKDAsICRjZ2F3QyRnZXRFdmVudFRhcmdldCkoZSksIHNjb3BlUmVmKSkge1xuICAgICAgICAgICAgICAgIC8vIElmIGEgZm9jdXMgZXZlbnQgb2NjdXJzIG91dHNpZGUgdGhlIGFjdGl2ZSBzY29wZSAoZS5nLiB1c2VyIHRhYnMgZnJvbSBicm93c2VyIGxvY2F0aW9uIGJhciksXG4gICAgICAgICAgICAgICAgLy8gcmVzdG9yZSBmb2N1cyB0byB0aGUgcHJldmlvdXNseSBmb2N1c2VkIG5vZGUgb3IgdGhlIGZpcnN0IHRhYmJhYmxlIGVsZW1lbnQgaW4gdGhlIGFjdGl2ZSBzY29wZS5cbiAgICAgICAgICAgICAgICBpZiAoZm9jdXNlZE5vZGUuY3VycmVudCkgZm9jdXNlZE5vZGUuY3VycmVudC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCQ5YmY3MWVhMjg3OTNlNzM4JHZhciRhY3RpdmVTY29wZSAmJiAkOWJmNzFlYTI4NzkzZTczOCR2YXIkYWN0aXZlU2NvcGUuY3VycmVudCkgJDliZjcxZWEyODc5M2U3MzgkdmFyJGZvY3VzRmlyc3RJblNjb3BlKCQ5YmY3MWVhMjg3OTNlNzM4JHZhciRhY3RpdmVTY29wZS5jdXJyZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoJDliZjcxZWEyODc5M2U3MzgkdmFyJHNob3VsZENvbnRhaW5Gb2N1cyhzY29wZVJlZikpIGZvY3VzZWROb2RlLmN1cnJlbnQgPSAoMCwgJGNnYXdDJGdldEV2ZW50VGFyZ2V0KShlKTtcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IG9uQmx1ciA9IChlKT0+e1xuICAgICAgICAgICAgLy8gRmlyZWZveCBkb2Vzbid0IHNoaWZ0IGZvY3VzIGJhY2sgdG8gdGhlIERpYWxvZyBwcm9wZXJseSB3aXRob3V0IHRoaXNcbiAgICAgICAgICAgIGlmIChyYWYuY3VycmVudCkgY2FuY2VsQW5pbWF0aW9uRnJhbWUocmFmLmN1cnJlbnQpO1xuICAgICAgICAgICAgcmFmLmN1cnJlbnQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCk9PntcbiAgICAgICAgICAgICAgICAvLyBQYXRjaGVzIGluZmluaXRlIGZvY3VzIGNvZXJzaW9uIGxvb3AgZm9yIEFuZHJvaWQgVGFsa2JhY2sgd2hlcmUgdGhlIHVzZXIgaXNuJ3QgYWJsZSB0byBtb3ZlIHRoZSB2aXJ0dWFsIGN1cnNvclxuICAgICAgICAgICAgICAgIC8vIGlmIHdpdGhpbiBhIGNvbnRhaW5pbmcgZm9jdXMgc2NvcGUuIEJ1ZyBmaWxlZCBhZ2FpbnN0IENocm9tZTogaHR0cHM6Ly9pc3N1ZXRyYWNrZXIuZ29vZ2xlLmNvbS9pc3N1ZXMvMzg0ODQ0MDE5LlxuICAgICAgICAgICAgICAgIC8vIE5vdGUgdGhhdCB0aGlzIG1lYW5zIGZvY3VzIGNhbiBsZWF2ZSBmb2N1cyBjb250YWluaW5nIG1vZGFscyBkdWUgdG8gdGhpcywgYnV0IGl0IGlzIGlzb2xhdGVkIHRvIENocm9tZSBUYWxrYmFjay5cbiAgICAgICAgICAgICAgICBsZXQgbW9kYWxpdHkgPSAoMCwgJGNnYXdDJGdldEludGVyYWN0aW9uTW9kYWxpdHkpKCk7XG4gICAgICAgICAgICAgICAgbGV0IHNob3VsZFNraXBGb2N1c1Jlc3RvcmUgPSAobW9kYWxpdHkgPT09ICd2aXJ0dWFsJyB8fCBtb2RhbGl0eSA9PT0gbnVsbCkgJiYgKDAsICRjZ2F3QyRpc0FuZHJvaWQpKCkgJiYgKDAsICRjZ2F3QyRpc0Nocm9tZSkoKTtcbiAgICAgICAgICAgICAgICAvLyBVc2UgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBpbnN0ZWFkIG9mIGUucmVsYXRlZFRhcmdldCBzbyB3ZSBjYW4gdGVsbCBpZiB1c2VyIGNsaWNrZWQgaW50byBpZnJhbWVcbiAgICAgICAgICAgICAgICBsZXQgYWN0aXZlRWxlbWVudCA9ICgwLCAkY2dhd0MkZ2V0QWN0aXZlRWxlbWVudCkob3duZXJEb2N1bWVudCk7XG4gICAgICAgICAgICAgICAgaWYgKCFzaG91bGRTa2lwRm9jdXNSZXN0b3JlICYmIGFjdGl2ZUVsZW1lbnQgJiYgJDliZjcxZWEyODc5M2U3MzgkdmFyJHNob3VsZENvbnRhaW5Gb2N1cyhzY29wZVJlZikgJiYgISQ5YmY3MWVhMjg3OTNlNzM4JHZhciRpc0VsZW1lbnRJbkNoaWxkU2NvcGUoYWN0aXZlRWxlbWVudCwgc2NvcGVSZWYpKSB7XG4gICAgICAgICAgICAgICAgICAgICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRhY3RpdmVTY29wZSA9IHNjb3BlUmVmO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gKDAsICRjZ2F3QyRnZXRFdmVudFRhcmdldCkoZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXQgJiYgdGFyZ2V0LmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX2ZvY3VzZWROb2RlX2N1cnJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2VkTm9kZS5jdXJyZW50ID0gdGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgKF9mb2N1c2VkTm9kZV9jdXJyZW50ID0gZm9jdXNlZE5vZGUuY3VycmVudCkgPT09IG51bGwgfHwgX2ZvY3VzZWROb2RlX2N1cnJlbnQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9mb2N1c2VkTm9kZV9jdXJyZW50LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoJDliZjcxZWEyODc5M2U3MzgkdmFyJGFjdGl2ZVNjb3BlLmN1cnJlbnQpICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRmb2N1c0ZpcnN0SW5TY29wZSgkOWJmNzFlYTI4NzkzZTczOCR2YXIkYWN0aXZlU2NvcGUuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIG93bmVyRG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5RG93biwgZmFsc2UpO1xuICAgICAgICBvd25lckRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCBvbkZvY3VzLCBmYWxzZSk7XG4gICAgICAgIHNjb3BlID09PSBudWxsIHx8IHNjb3BlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBzY29wZS5mb3JFYWNoKChlbGVtZW50KT0+ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdmb2N1c2luJywgb25Gb2N1cywgZmFsc2UpKTtcbiAgICAgICAgc2NvcGUgPT09IG51bGwgfHwgc2NvcGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHNjb3BlLmZvckVhY2goKGVsZW1lbnQpPT5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0Jywgb25CbHVyLCBmYWxzZSkpO1xuICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgIG93bmVyRG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5RG93biwgZmFsc2UpO1xuICAgICAgICAgICAgb3duZXJEb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1c2luJywgb25Gb2N1cywgZmFsc2UpO1xuICAgICAgICAgICAgc2NvcGUgPT09IG51bGwgfHwgc2NvcGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHNjb3BlLmZvckVhY2goKGVsZW1lbnQpPT5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCBvbkZvY3VzLCBmYWxzZSkpO1xuICAgICAgICAgICAgc2NvcGUgPT09IG51bGwgfHwgc2NvcGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHNjb3BlLmZvckVhY2goKGVsZW1lbnQpPT5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ZvY3Vzb3V0Jywgb25CbHVyLCBmYWxzZSkpO1xuICAgICAgICB9O1xuICAgIH0sIFtcbiAgICAgICAgc2NvcGVSZWYsXG4gICAgICAgIGNvbnRhaW5cbiAgICBdKTtcbiAgICAvLyBUaGlzIGlzIGEgdXNlTGF5b3V0RWZmZWN0IHNvIGl0IGlzIGd1YXJhbnRlZWQgdG8gcnVuIGJlZm9yZSBvdXIgYXN5bmMgc3ludGhldGljIGJsdXJcbiAgICAoMCwgJGNnYXdDJHVzZUxheW91dEVmZmVjdCkoKCk9PntcbiAgICAgICAgcmV0dXJuICgpPT57XG4gICAgICAgICAgICBpZiAocmFmLmN1cnJlbnQpIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHJhZi5jdXJyZW50KTtcbiAgICAgICAgfTtcbiAgICB9LCBbXG4gICAgICAgIHJhZlxuICAgIF0pO1xufVxuZnVuY3Rpb24gJDliZjcxZWEyODc5M2U3MzgkdmFyJGlzRWxlbWVudEluQW55U2NvcGUoZWxlbWVudCkge1xuICAgIHJldHVybiAkOWJmNzFlYTI4NzkzZTczOCR2YXIkaXNFbGVtZW50SW5DaGlsZFNjb3BlKGVsZW1lbnQpO1xufVxuZnVuY3Rpb24gJDliZjcxZWEyODc5M2U3MzgkdmFyJGlzRWxlbWVudEluU2NvcGUoZWxlbWVudCwgc2NvcGUpIHtcbiAgICBpZiAoIWVsZW1lbnQpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoIXNjb3BlKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHNjb3BlLnNvbWUoKG5vZGUpPT5ub2RlLmNvbnRhaW5zKGVsZW1lbnQpKTtcbn1cbmZ1bmN0aW9uICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRpc0VsZW1lbnRJbkNoaWxkU2NvcGUoZWxlbWVudCwgc2NvcGUgPSBudWxsKSB7XG4gICAgLy8gSWYgdGhlIGVsZW1lbnQgaXMgd2l0aGluIGEgdG9wIGxheWVyIGVsZW1lbnQgKGUuZy4gdG9hc3RzKSwgYWx3YXlzIGFsbG93IG1vdmluZyBmb2N1cyB0aGVyZS5cbiAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgZWxlbWVudC5jbG9zZXN0KCdbZGF0YS1yZWFjdC1hcmlhLXRvcC1sYXllcl0nKSkgcmV0dXJuIHRydWU7XG4gICAgLy8gbm9kZS5jb250YWlucyBpbiBpc0VsZW1lbnRJblNjb3BlIGNvdmVycyBjaGlsZCBzY29wZXMgdGhhdCBhcmUgYWxzbyBET00gY2hpbGRyZW4sXG4gICAgLy8gYnV0IGRvZXMgbm90IGNvdmVyIGNoaWxkIHNjb3BlcyBpbiBwb3J0YWxzLlxuICAgIGZvciAobGV0IHsgc2NvcGVSZWY6IHMgfSBvZiAkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkZDA2ZmFlMmVlNjhiMTAxZS50cmF2ZXJzZSgkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkZDA2ZmFlMmVlNjhiMTAxZS5nZXRUcmVlTm9kZShzY29wZSkpKXtcbiAgICAgICAgaWYgKHMgJiYgJDliZjcxZWEyODc5M2U3MzgkdmFyJGlzRWxlbWVudEluU2NvcGUoZWxlbWVudCwgcy5jdXJyZW50KSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCQxMjU4Mzk1Zjk5YmY5Y2JmKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gJDliZjcxZWEyODc5M2U3MzgkdmFyJGlzRWxlbWVudEluQ2hpbGRTY29wZShlbGVtZW50LCAkOWJmNzFlYTI4NzkzZTczOCR2YXIkYWN0aXZlU2NvcGUpO1xufVxuZnVuY3Rpb24gJDliZjcxZWEyODc5M2U3MzgkdmFyJGlzQW5jZXN0b3JTY29wZShhbmNlc3Rvciwgc2NvcGUpIHtcbiAgICB2YXIgX2ZvY3VzU2NvcGVUcmVlX2dldFRyZWVOb2RlO1xuICAgIGxldCBwYXJlbnQgPSAoX2ZvY3VzU2NvcGVUcmVlX2dldFRyZWVOb2RlID0gJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JGQwNmZhZTJlZTY4YjEwMWUuZ2V0VHJlZU5vZGUoc2NvcGUpKSA9PT0gbnVsbCB8fCBfZm9jdXNTY29wZVRyZWVfZ2V0VHJlZU5vZGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9mb2N1c1Njb3BlVHJlZV9nZXRUcmVlTm9kZS5wYXJlbnQ7XG4gICAgd2hpbGUocGFyZW50KXtcbiAgICAgICAgaWYgKHBhcmVudC5zY29wZVJlZiA9PT0gYW5jZXN0b3IpIHJldHVybiB0cnVlO1xuICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50O1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiAkOWJmNzFlYTI4NzkzZTczOCR2YXIkZm9jdXNFbGVtZW50KGVsZW1lbnQsIHNjcm9sbCA9IGZhbHNlKSB7XG4gICAgaWYgKGVsZW1lbnQgIT0gbnVsbCAmJiAhc2Nyb2xsKSB0cnkge1xuICAgICAgICAoMCwgJGNnYXdDJGZvY3VzU2FmZWx5KShlbGVtZW50KTtcbiAgICB9IGNhdGNoICB7XG4gICAgLy8gaWdub3JlXG4gICAgfVxuICAgIGVsc2UgaWYgKGVsZW1lbnQgIT0gbnVsbCkgdHJ5IHtcbiAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgIH0gY2F0Y2ggIHtcbiAgICAvLyBpZ25vcmVcbiAgICB9XG59XG5mdW5jdGlvbiAkOWJmNzFlYTI4NzkzZTczOCR2YXIkZ2V0Rmlyc3RJblNjb3BlKHNjb3BlLCB0YWJiYWJsZSA9IHRydWUpIHtcbiAgICBsZXQgc2VudGluZWwgPSBzY29wZVswXS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgIGxldCBzY29wZVJvb3QgPSAkOWJmNzFlYTI4NzkzZTczOCR2YXIkZ2V0U2NvcGVSb290KHNjb3BlKTtcbiAgICBsZXQgd2Fsa2VyID0gJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JDJkNmVjOGZjMzc1Y2VhZmEoc2NvcGVSb290LCB7XG4gICAgICAgIHRhYmJhYmxlOiB0YWJiYWJsZVxuICAgIH0sIHNjb3BlKTtcbiAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBzZW50aW5lbDtcbiAgICBsZXQgbmV4dE5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAvLyBJZiB0aGUgc2NvcGUgZG9lcyBub3QgY29udGFpbiBhIHRhYmJhYmxlIGVsZW1lbnQsIHVzZSB0aGUgZmlyc3QgZm9jdXNhYmxlIGVsZW1lbnQuXG4gICAgaWYgKHRhYmJhYmxlICYmICFuZXh0Tm9kZSkge1xuICAgICAgICBzY29wZVJvb3QgPSAkOWJmNzFlYTI4NzkzZTczOCR2YXIkZ2V0U2NvcGVSb290KHNjb3BlKTtcbiAgICAgICAgd2Fsa2VyID0gJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JDJkNmVjOGZjMzc1Y2VhZmEoc2NvcGVSb290LCB7XG4gICAgICAgICAgICB0YWJiYWJsZTogZmFsc2VcbiAgICAgICAgfSwgc2NvcGUpO1xuICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBzZW50aW5lbDtcbiAgICAgICAgbmV4dE5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIG5leHROb2RlO1xufVxuZnVuY3Rpb24gJDliZjcxZWEyODc5M2U3MzgkdmFyJGZvY3VzRmlyc3RJblNjb3BlKHNjb3BlLCB0YWJiYWJsZSA9IHRydWUpIHtcbiAgICAkOWJmNzFlYTI4NzkzZTczOCR2YXIkZm9jdXNFbGVtZW50KCQ5YmY3MWVhMjg3OTNlNzM4JHZhciRnZXRGaXJzdEluU2NvcGUoc2NvcGUsIHRhYmJhYmxlKSk7XG59XG5mdW5jdGlvbiAkOWJmNzFlYTI4NzkzZTczOCR2YXIkdXNlQXV0b0ZvY3VzKHNjb3BlUmVmLCBhdXRvRm9jdXMpIHtcbiAgICBjb25zdCBhdXRvRm9jdXNSZWYgPSAoMCwgJGNnYXdDJHJlYWN0KS51c2VSZWYoYXV0b0ZvY3VzKTtcbiAgICAoMCwgJGNnYXdDJHVzZUVmZmVjdCkoKCk9PntcbiAgICAgICAgaWYgKGF1dG9Gb2N1c1JlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAkOWJmNzFlYTI4NzkzZTczOCR2YXIkYWN0aXZlU2NvcGUgPSBzY29wZVJlZjtcbiAgICAgICAgICAgIGNvbnN0IG93bmVyRG9jdW1lbnQgPSAoMCwgJGNnYXdDJGdldE93bmVyRG9jdW1lbnQpKHNjb3BlUmVmLmN1cnJlbnQgPyBzY29wZVJlZi5jdXJyZW50WzBdIDogdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIGlmICghJDliZjcxZWEyODc5M2U3MzgkdmFyJGlzRWxlbWVudEluU2NvcGUoKDAsICRjZ2F3QyRnZXRBY3RpdmVFbGVtZW50KShvd25lckRvY3VtZW50KSwgJDliZjcxZWEyODc5M2U3MzgkdmFyJGFjdGl2ZVNjb3BlLmN1cnJlbnQpICYmIHNjb3BlUmVmLmN1cnJlbnQpICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRmb2N1c0ZpcnN0SW5TY29wZShzY29wZVJlZi5jdXJyZW50KTtcbiAgICAgICAgfVxuICAgICAgICBhdXRvRm9jdXNSZWYuY3VycmVudCA9IGZhbHNlO1xuICAgIH0sIFtcbiAgICAgICAgc2NvcGVSZWZcbiAgICBdKTtcbn1cbmZ1bmN0aW9uICQ5YmY3MWVhMjg3OTNlNzM4JHZhciR1c2VBY3RpdmVTY29wZVRyYWNrZXIoc2NvcGVSZWYsIHJlc3RvcmUsIGNvbnRhaW4pIHtcbiAgICAvLyB0cmFja3MgdGhlIGFjdGl2ZSBzY29wZSwgaW4gY2FzZSByZXN0b3JlIGFuZCBjb250YWluIGFyZSBib3RoIGZhbHNlLlxuICAgIC8vIGlmIGVpdGhlciBhcmUgdHJ1ZSwgdGhpcyBpcyB0cmFja2VkIGluIHVzZVJlc3RvcmVGb2N1cyBvciB1c2VGb2N1c0NvbnRhaW5tZW50LlxuICAgICgwLCAkY2dhd0MkdXNlTGF5b3V0RWZmZWN0KSgoKT0+e1xuICAgICAgICBpZiAocmVzdG9yZSB8fCBjb250YWluKSByZXR1cm47XG4gICAgICAgIGxldCBzY29wZSA9IHNjb3BlUmVmLmN1cnJlbnQ7XG4gICAgICAgIGNvbnN0IG93bmVyRG9jdW1lbnQgPSAoMCwgJGNnYXdDJGdldE93bmVyRG9jdW1lbnQpKHNjb3BlID8gc2NvcGVbMF0gOiB1bmRlZmluZWQpO1xuICAgICAgICBsZXQgb25Gb2N1cyA9IChlKT0+e1xuICAgICAgICAgICAgbGV0IHRhcmdldCA9ICgwLCAkY2dhd0MkZ2V0RXZlbnRUYXJnZXQpKGUpO1xuICAgICAgICAgICAgaWYgKCQ5YmY3MWVhMjg3OTNlNzM4JHZhciRpc0VsZW1lbnRJblNjb3BlKHRhcmdldCwgc2NvcGVSZWYuY3VycmVudCkpICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRhY3RpdmVTY29wZSA9IHNjb3BlUmVmO1xuICAgICAgICAgICAgZWxzZSBpZiAoISQ5YmY3MWVhMjg3OTNlNzM4JHZhciRpc0VsZW1lbnRJbkFueVNjb3BlKHRhcmdldCkpICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRhY3RpdmVTY29wZSA9IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIG93bmVyRG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIG9uRm9jdXMsIGZhbHNlKTtcbiAgICAgICAgc2NvcGUgPT09IG51bGwgfHwgc2NvcGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHNjb3BlLmZvckVhY2goKGVsZW1lbnQpPT5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCBvbkZvY3VzLCBmYWxzZSkpO1xuICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgIG93bmVyRG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIG9uRm9jdXMsIGZhbHNlKTtcbiAgICAgICAgICAgIHNjb3BlID09PSBudWxsIHx8IHNjb3BlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBzY29wZS5mb3JFYWNoKChlbGVtZW50KT0+ZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1c2luJywgb25Gb2N1cywgZmFsc2UpKTtcbiAgICAgICAgfTtcbiAgICB9LCBbXG4gICAgICAgIHNjb3BlUmVmLFxuICAgICAgICByZXN0b3JlLFxuICAgICAgICBjb250YWluXG4gICAgXSk7XG59XG5mdW5jdGlvbiAkOWJmNzFlYTI4NzkzZTczOCR2YXIkc2hvdWxkUmVzdG9yZUZvY3VzKHNjb3BlUmVmKSB7XG4gICAgbGV0IHNjb3BlID0gJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JGQwNmZhZTJlZTY4YjEwMWUuZ2V0VHJlZU5vZGUoJDliZjcxZWEyODc5M2U3MzgkdmFyJGFjdGl2ZVNjb3BlKTtcbiAgICB3aGlsZShzY29wZSAmJiBzY29wZS5zY29wZVJlZiAhPT0gc2NvcGVSZWYpe1xuICAgICAgICBpZiAoc2NvcGUubm9kZVRvUmVzdG9yZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBzY29wZSA9IHNjb3BlLnBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIChzY29wZSA9PT0gbnVsbCB8fCBzY29wZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogc2NvcGUuc2NvcGVSZWYpID09PSBzY29wZVJlZjtcbn1cbmZ1bmN0aW9uICQ5YmY3MWVhMjg3OTNlNzM4JHZhciR1c2VSZXN0b3JlRm9jdXMoc2NvcGVSZWYsIHJlc3RvcmVGb2N1cywgY29udGFpbikge1xuICAgIC8vIGNyZWF0ZSBhIHJlZiBkdXJpbmcgcmVuZGVyIGluc3RlYWQgb2YgdXNlTGF5b3V0RWZmZWN0IHNvIHRoZSBhY3RpdmUgZWxlbWVudCBpcyBzYXZlZCBiZWZvcmUgYSBjaGlsZCB3aXRoIGF1dG9Gb2N1cz10cnVlIG1vdW50cy5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1nbG9iYWxzXG4gICAgY29uc3Qgbm9kZVRvUmVzdG9yZVJlZiA9ICgwLCAkY2dhd0MkdXNlUmVmKSh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnID8gKDAsICRjZ2F3QyRnZXRBY3RpdmVFbGVtZW50KSgoMCwgJGNnYXdDJGdldE93bmVyRG9jdW1lbnQpKHNjb3BlUmVmLmN1cnJlbnQgPyBzY29wZVJlZi5jdXJyZW50WzBdIDogdW5kZWZpbmVkKSkgOiBudWxsKTtcbiAgICAvLyByZXN0b3Jpbmcgc2NvcGVzIHNob3VsZCBhbGwgdHJhY2sgaWYgdGhleSBhcmUgYWN0aXZlIHJlZ2FyZGxlc3Mgb2YgY29udGFpbiwgYnV0IGNvbnRhaW4gYWxyZWFkeSB0cmFja3MgaXQgcGx1cyBsb2dpYyB0byBjb250YWluIHRoZSBmb2N1c1xuICAgIC8vIHJlc3RvcmluZy1ub24tY29udGFpbmluZyBzY29wZXMgc2hvdWxkIG9ubHkgY2FyZSBpZiB0aGV5IGJlY29tZSBhY3RpdmUgc28gdGhleSBjYW4gcGVyZm9ybSB0aGUgcmVzdG9yZVxuICAgICgwLCAkY2dhd0MkdXNlTGF5b3V0RWZmZWN0KSgoKT0+e1xuICAgICAgICBsZXQgc2NvcGUgPSBzY29wZVJlZi5jdXJyZW50O1xuICAgICAgICBjb25zdCBvd25lckRvY3VtZW50ID0gKDAsICRjZ2F3QyRnZXRPd25lckRvY3VtZW50KShzY29wZSA/IHNjb3BlWzBdIDogdW5kZWZpbmVkKTtcbiAgICAgICAgaWYgKCFyZXN0b3JlRm9jdXMgfHwgY29udGFpbikgcmV0dXJuO1xuICAgICAgICBsZXQgb25Gb2N1cyA9ICgpPT57XG4gICAgICAgICAgICAvLyBJZiBmb2N1c2luZyBhbiBlbGVtZW50IGluIGEgY2hpbGQgc2NvcGUgb2YgdGhlIGN1cnJlbnRseSBhY3RpdmUgc2NvcGUsIHRoZSBjaGlsZCBiZWNvbWVzIGFjdGl2ZS5cbiAgICAgICAgICAgIC8vIE1vdmluZyBvdXQgb2YgdGhlIGFjdGl2ZSBzY29wZSB0byBhbiBhbmNlc3RvciBpcyBub3QgYWxsb3dlZC5cbiAgICAgICAgICAgIGlmICgoISQ5YmY3MWVhMjg3OTNlNzM4JHZhciRhY3RpdmVTY29wZSB8fCAkOWJmNzFlYTI4NzkzZTczOCR2YXIkaXNBbmNlc3RvclNjb3BlKCQ5YmY3MWVhMjg3OTNlNzM4JHZhciRhY3RpdmVTY29wZSwgc2NvcGVSZWYpKSAmJiAkOWJmNzFlYTI4NzkzZTczOCR2YXIkaXNFbGVtZW50SW5TY29wZSgoMCwgJGNnYXdDJGdldEFjdGl2ZUVsZW1lbnQpKG93bmVyRG9jdW1lbnQpLCBzY29wZVJlZi5jdXJyZW50KSkgJDliZjcxZWEyODc5M2U3MzgkdmFyJGFjdGl2ZVNjb3BlID0gc2NvcGVSZWY7XG4gICAgICAgIH07XG4gICAgICAgIG93bmVyRG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIG9uRm9jdXMsIGZhbHNlKTtcbiAgICAgICAgc2NvcGUgPT09IG51bGwgfHwgc2NvcGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHNjb3BlLmZvckVhY2goKGVsZW1lbnQpPT5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzaW4nLCBvbkZvY3VzLCBmYWxzZSkpO1xuICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgIG93bmVyRG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXNpbicsIG9uRm9jdXMsIGZhbHNlKTtcbiAgICAgICAgICAgIHNjb3BlID09PSBudWxsIHx8IHNjb3BlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBzY29wZS5mb3JFYWNoKChlbGVtZW50KT0+ZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1c2luJywgb25Gb2N1cywgZmFsc2UpKTtcbiAgICAgICAgfTtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gICAgfSwgW1xuICAgICAgICBzY29wZVJlZixcbiAgICAgICAgY29udGFpblxuICAgIF0pO1xuICAgICgwLCAkY2dhd0MkdXNlTGF5b3V0RWZmZWN0KSgoKT0+e1xuICAgICAgICBjb25zdCBvd25lckRvY3VtZW50ID0gKDAsICRjZ2F3QyRnZXRPd25lckRvY3VtZW50KShzY29wZVJlZi5jdXJyZW50ID8gc2NvcGVSZWYuY3VycmVudFswXSA6IHVuZGVmaW5lZCk7XG4gICAgICAgIGlmICghcmVzdG9yZUZvY3VzKSByZXR1cm47XG4gICAgICAgIC8vIEhhbmRsZSB0aGUgVGFiIGtleSBzbyB0aGF0IHRhYmJpbmcgb3V0IG9mIHRoZSBzY29wZSBnb2VzIHRvIHRoZSBuZXh0IGVsZW1lbnRcbiAgICAgICAgLy8gYWZ0ZXIgdGhlIG5vZGUgdGhhdCBoYWQgZm9jdXMgd2hlbiB0aGUgc2NvcGUgbW91bnRlZC4gVGhpcyBpcyBpbXBvcnRhbnQgd2hlblxuICAgICAgICAvLyB1c2luZyBwb3J0YWxzIGZvciBvdmVybGF5cywgc28gdGhhdCBmb2N1cyBnb2VzIHRvIHRoZSBleHBlY3RlZCBlbGVtZW50IHdoZW5cbiAgICAgICAgLy8gdGFiYmluZyBvdXQgb2YgdGhlIG92ZXJsYXkuXG4gICAgICAgIGxldCBvbktleURvd24gPSAoZSk9PntcbiAgICAgICAgICAgIGlmIChlLmtleSAhPT0gJ1RhYicgfHwgZS5hbHRLZXkgfHwgZS5jdHJsS2V5IHx8IGUubWV0YUtleSB8fCAhJDliZjcxZWEyODc5M2U3MzgkdmFyJHNob3VsZENvbnRhaW5Gb2N1cyhzY29wZVJlZikgfHwgZS5pc0NvbXBvc2luZykgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IGZvY3VzZWRFbGVtZW50ID0gb3duZXJEb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgICAgICAgICAgaWYgKCEkOWJmNzFlYTI4NzkzZTczOCR2YXIkaXNFbGVtZW50SW5DaGlsZFNjb3BlKGZvY3VzZWRFbGVtZW50LCBzY29wZVJlZikgfHwgISQ5YmY3MWVhMjg3OTNlNzM4JHZhciRzaG91bGRSZXN0b3JlRm9jdXMoc2NvcGVSZWYpKSByZXR1cm47XG4gICAgICAgICAgICBsZXQgdHJlZU5vZGUgPSAkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkZDA2ZmFlMmVlNjhiMTAxZS5nZXRUcmVlTm9kZShzY29wZVJlZik7XG4gICAgICAgICAgICBpZiAoIXRyZWVOb2RlKSByZXR1cm47XG4gICAgICAgICAgICBsZXQgbm9kZVRvUmVzdG9yZSA9IHRyZWVOb2RlLm5vZGVUb1Jlc3RvcmU7XG4gICAgICAgICAgICAvLyBDcmVhdGUgYSBET00gdHJlZSB3YWxrZXIgdGhhdCBtYXRjaGVzIGFsbCB0YWJiYWJsZSBlbGVtZW50c1xuICAgICAgICAgICAgbGV0IHdhbGtlciA9ICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCQyZDZlYzhmYzM3NWNlYWZhKG93bmVyRG9jdW1lbnQuYm9keSwge1xuICAgICAgICAgICAgICAgIHRhYmJhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIEZpbmQgdGhlIG5leHQgdGFiYmFibGUgZWxlbWVudCBhZnRlciB0aGUgY3VycmVudGx5IGZvY3VzZWQgZWxlbWVudFxuICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gZm9jdXNlZEVsZW1lbnQ7XG4gICAgICAgICAgICBsZXQgbmV4dEVsZW1lbnQgPSBlLnNoaWZ0S2V5ID8gd2Fsa2VyLnByZXZpb3VzTm9kZSgpIDogd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgICAgICBpZiAoIW5vZGVUb1Jlc3RvcmUgfHwgIW5vZGVUb1Jlc3RvcmUuaXNDb25uZWN0ZWQgfHwgbm9kZVRvUmVzdG9yZSA9PT0gb3duZXJEb2N1bWVudC5ib2R5KSB7XG4gICAgICAgICAgICAgICAgbm9kZVRvUmVzdG9yZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0cmVlTm9kZS5ub2RlVG9SZXN0b3JlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gbmV4dCBlbGVtZW50LCBvciBpdCBpcyBvdXRzaWRlIHRoZSBjdXJyZW50IHNjb3BlLCBtb3ZlIGZvY3VzIHRvIHRoZVxuICAgICAgICAgICAgLy8gbmV4dCBlbGVtZW50IGFmdGVyIHRoZSBub2RlIHRvIHJlc3RvcmUgdG8gaW5zdGVhZC5cbiAgICAgICAgICAgIGlmICgoIW5leHRFbGVtZW50IHx8ICEkOWJmNzFlYTI4NzkzZTczOCR2YXIkaXNFbGVtZW50SW5DaGlsZFNjb3BlKG5leHRFbGVtZW50LCBzY29wZVJlZikpICYmIG5vZGVUb1Jlc3RvcmUpIHtcbiAgICAgICAgICAgICAgICB3YWxrZXIuY3VycmVudE5vZGUgPSBub2RlVG9SZXN0b3JlO1xuICAgICAgICAgICAgICAgIC8vIFNraXAgb3ZlciBlbGVtZW50cyB3aXRoaW4gdGhlIHNjb3BlLCBpbiBjYXNlIHRoZSBzY29wZSBpbW1lZGlhdGVseSBmb2xsb3dzIHRoZSBub2RlIHRvIHJlc3RvcmUuXG4gICAgICAgICAgICAgICAgZG8gbmV4dEVsZW1lbnQgPSBlLnNoaWZ0S2V5ID8gd2Fsa2VyLnByZXZpb3VzTm9kZSgpIDogd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgICAgICAgICAgd2hpbGUgKCQ5YmY3MWVhMjg3OTNlNzM4JHZhciRpc0VsZW1lbnRJbkNoaWxkU2NvcGUobmV4dEVsZW1lbnQsIHNjb3BlUmVmKSk7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKG5leHRFbGVtZW50KSAkOWJmNzFlYTI4NzkzZTczOCR2YXIkZm9jdXNFbGVtZW50KG5leHRFbGVtZW50LCB0cnVlKTtcbiAgICAgICAgICAgICAgICBlbHNlIC8vIElmIHRoZXJlIGlzIG5vIG5leHQgZWxlbWVudCBhbmQgdGhlIG5vZGVUb1Jlc3RvcmUgaXNuJ3Qgd2l0aGluIGEgRm9jdXNTY29wZSAoaS5lLiB3ZSBhcmUgbGVhdmluZyB0aGUgdG9wIGxldmVsIGZvY3VzIHNjb3BlKVxuICAgICAgICAgICAgICAgIC8vIHRoZW4gbW92ZSBmb2N1cyB0byB0aGUgYm9keS5cbiAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UgcmVzdG9yZSBmb2N1cyB0byB0aGUgbm9kZVRvUmVzdG9yZSAoZS5nIG1lbnUgd2l0aGluIGEgcG9wb3ZlciAtPiB0YWJiaW5nIHRvIGNsb3NlIHRoZSBtZW51IHNob3VsZCBtb3ZlIGZvY3VzIHRvIG1lbnUgdHJpZ2dlcilcbiAgICAgICAgICAgICAgICBpZiAoISQ5YmY3MWVhMjg3OTNlNzM4JHZhciRpc0VsZW1lbnRJbkFueVNjb3BlKG5vZGVUb1Jlc3RvcmUpKSBmb2N1c2VkRWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICAgICAgZWxzZSAkOWJmNzFlYTI4NzkzZTczOCR2YXIkZm9jdXNFbGVtZW50KG5vZGVUb1Jlc3RvcmUsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAoIWNvbnRhaW4pIG93bmVyRG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5RG93biwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgaWYgKCFjb250YWluKSBvd25lckRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleURvd24sIHRydWUpO1xuICAgICAgICB9O1xuICAgIH0sIFtcbiAgICAgICAgc2NvcGVSZWYsXG4gICAgICAgIHJlc3RvcmVGb2N1cyxcbiAgICAgICAgY29udGFpblxuICAgIF0pO1xuICAgIC8vIHVzZUxheW91dEVmZmVjdCBpbnN0ZWFkIG9mIHVzZUVmZmVjdCBzbyB0aGUgYWN0aXZlIGVsZW1lbnQgaXMgc2F2ZWQgc3luY2hyb25vdXNseSBpbnN0ZWFkIG9mIGFzeW5jaHJvbm91c2x5LlxuICAgICgwLCAkY2dhd0MkdXNlTGF5b3V0RWZmZWN0KSgoKT0+e1xuICAgICAgICBjb25zdCBvd25lckRvY3VtZW50ID0gKDAsICRjZ2F3QyRnZXRPd25lckRvY3VtZW50KShzY29wZVJlZi5jdXJyZW50ID8gc2NvcGVSZWYuY3VycmVudFswXSA6IHVuZGVmaW5lZCk7XG4gICAgICAgIGlmICghcmVzdG9yZUZvY3VzKSByZXR1cm47XG4gICAgICAgIGxldCB0cmVlTm9kZSA9ICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCRkMDZmYWUyZWU2OGIxMDFlLmdldFRyZWVOb2RlKHNjb3BlUmVmKTtcbiAgICAgICAgaWYgKCF0cmVlTm9kZSkgcmV0dXJuO1xuICAgICAgICB2YXIgX25vZGVUb1Jlc3RvcmVSZWZfY3VycmVudDtcbiAgICAgICAgdHJlZU5vZGUubm9kZVRvUmVzdG9yZSA9IChfbm9kZVRvUmVzdG9yZVJlZl9jdXJyZW50ID0gbm9kZVRvUmVzdG9yZVJlZi5jdXJyZW50KSAhPT0gbnVsbCAmJiBfbm9kZVRvUmVzdG9yZVJlZl9jdXJyZW50ICE9PSB2b2lkIDAgPyBfbm9kZVRvUmVzdG9yZVJlZl9jdXJyZW50IDogdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgIGxldCB0cmVlTm9kZSA9ICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCRkMDZmYWUyZWU2OGIxMDFlLmdldFRyZWVOb2RlKHNjb3BlUmVmKTtcbiAgICAgICAgICAgIGlmICghdHJlZU5vZGUpIHJldHVybjtcbiAgICAgICAgICAgIGxldCBub2RlVG9SZXN0b3JlID0gdHJlZU5vZGUubm9kZVRvUmVzdG9yZTtcbiAgICAgICAgICAgIC8vIGlmIHdlIGFscmVhZHkgbG9zdCBmb2N1cyB0byB0aGUgYm9keSBhbmQgdGhpcyB3YXMgdGhlIGFjdGl2ZSBzY29wZSwgdGhlbiB3ZSBzaG91bGQgYXR0ZW1wdCB0byByZXN0b3JlXG4gICAgICAgICAgICBsZXQgYWN0aXZlRWxlbWVudCA9ICgwLCAkY2dhd0MkZ2V0QWN0aXZlRWxlbWVudCkob3duZXJEb2N1bWVudCk7XG4gICAgICAgICAgICBpZiAocmVzdG9yZUZvY3VzICYmIG5vZGVUb1Jlc3RvcmUgJiYgKGFjdGl2ZUVsZW1lbnQgJiYgJDliZjcxZWEyODc5M2U3MzgkdmFyJGlzRWxlbWVudEluQ2hpbGRTY29wZShhY3RpdmVFbGVtZW50LCBzY29wZVJlZikgfHwgYWN0aXZlRWxlbWVudCA9PT0gb3duZXJEb2N1bWVudC5ib2R5ICYmICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRzaG91bGRSZXN0b3JlRm9jdXMoc2NvcGVSZWYpKSkge1xuICAgICAgICAgICAgICAgIC8vIGZyZWV6ZSB0aGUgZm9jdXNTY29wZVRyZWUgc28gaXQgcGVyc2lzdHMgYWZ0ZXIgdGhlIHJhZiwgb3RoZXJ3aXNlIGR1cmluZyB1bm1vdW50IG5vZGVzIGFyZSByZW1vdmVkIGZyb20gaXRcbiAgICAgICAgICAgICAgICBsZXQgY2xvbmVkVHJlZSA9ICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCRkMDZmYWUyZWU2OGIxMDFlLmNsb25lKCk7XG4gICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpPT57XG4gICAgICAgICAgICAgICAgICAgIC8vIE9ubHkgcmVzdG9yZSBmb2N1cyBpZiB3ZSd2ZSBsb3N0IGZvY3VzIHRvIHRoZSBib2R5LCB0aGUgYWx0ZXJuYXRpdmUgaXMgdGhhdCBmb2N1cyBoYXMgYmVlbiBwdXJwb3NlZnVsbHkgbW92ZWQgZWxzZXdoZXJlXG4gICAgICAgICAgICAgICAgICAgIGlmIChvd25lckRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgPT09IG93bmVyRG9jdW1lbnQuYm9keSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9vayB1cCB0aGUgdHJlZSBzdGFydGluZyB3aXRoIG91ciBzY29wZSB0byBmaW5kIGEgbm9kZVRvUmVzdG9yZSBzdGlsbCBpbiB0aGUgRE9NXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdHJlZU5vZGUgPSBjbG9uZWRUcmVlLmdldFRyZWVOb2RlKHNjb3BlUmVmKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlKHRyZWVOb2RlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJlZU5vZGUubm9kZVRvUmVzdG9yZSAmJiB0cmVlTm9kZS5ub2RlVG9SZXN0b3JlLmlzQ29ubmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRyZXN0b3JlRm9jdXNUb0VsZW1lbnQodHJlZU5vZGUubm9kZVRvUmVzdG9yZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJlZU5vZGUgPSB0cmVlTm9kZS5wYXJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBubyBub2RlVG9SZXN0b3JlIHdhcyBmb3VuZCwgZm9jdXMgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIG5lYXJlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFuY2VzdG9yIHNjb3BlIHRoYXQgaXMgc3RpbGwgaW4gdGhlIHRyZWUuXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmVlTm9kZSA9IGNsb25lZFRyZWUuZ2V0VHJlZU5vZGUoc2NvcGVSZWYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUodHJlZU5vZGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cmVlTm9kZS5zY29wZVJlZiAmJiB0cmVlTm9kZS5zY29wZVJlZi5jdXJyZW50ICYmICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCRkMDZmYWUyZWU2OGIxMDFlLmdldFRyZWVOb2RlKHRyZWVOb2RlLnNjb3BlUmVmKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbm9kZSA9ICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRnZXRGaXJzdEluU2NvcGUodHJlZU5vZGUuc2NvcGVSZWYuY3VycmVudCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRyZXN0b3JlRm9jdXNUb0VsZW1lbnQobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJlZU5vZGUgPSB0cmVlTm9kZS5wYXJlbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LCBbXG4gICAgICAgIHNjb3BlUmVmLFxuICAgICAgICByZXN0b3JlRm9jdXNcbiAgICBdKTtcbn1cbmZ1bmN0aW9uICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRyZXN0b3JlRm9jdXNUb0VsZW1lbnQobm9kZSkge1xuICAgIC8vIERpc3BhdGNoIGEgY3VzdG9tIGV2ZW50IHRoYXQgcGFyZW50IGVsZW1lbnRzIGNhbiBpbnRlcmNlcHQgdG8gY3VzdG9taXplIGZvY3VzIHJlc3RvcmF0aW9uLlxuICAgIC8vIEZvciBleGFtcGxlLCB2aXJ0dWFsaXplZCBjb2xsZWN0aW9uIGNvbXBvbmVudHMgcmV1c2UgRE9NIGVsZW1lbnRzLCBzbyB0aGUgb3JpZ2luYWwgZWxlbWVudFxuICAgIC8vIG1pZ2h0IHN0aWxsIGV4aXN0IGluIHRoZSBET00gYnV0IHJlcHJlc2VudGluZyBhIGRpZmZlcmVudCBpdGVtLlxuICAgIGlmIChub2RlLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCQ5YmY3MWVhMjg3OTNlNzM4JHZhciRSRVNUT1JFX0ZPQ1VTX0VWRU5ULCB7XG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIGNhbmNlbGFibGU6IHRydWVcbiAgICB9KSkpICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRmb2N1c0VsZW1lbnQobm9kZSk7XG59XG5mdW5jdGlvbiAkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkMmQ2ZWM4ZmMzNzVjZWFmYShyb290LCBvcHRzLCBzY29wZSkge1xuICAgIGxldCBmaWx0ZXIgPSAob3B0cyA9PT0gbnVsbCB8fCBvcHRzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRzLnRhYmJhYmxlKSA/ICgwLCAkY2dhd0MkaXNUYWJiYWJsZSkgOiAoMCwgJGNnYXdDJGlzRm9jdXNhYmxlKTtcbiAgICAvLyBFbnN1cmUgdGhhdCByb290IGlzIGFuIEVsZW1lbnQgb3IgZmFsbCBiYWNrIGFwcHJvcHJpYXRlbHlcbiAgICBsZXQgcm9vdEVsZW1lbnQgPSAocm9vdCA9PT0gbnVsbCB8fCByb290ID09PSB2b2lkIDAgPyB2b2lkIDAgOiByb290Lm5vZGVUeXBlKSA9PT0gTm9kZS5FTEVNRU5UX05PREUgPyByb290IDogbnVsbDtcbiAgICAvLyBEZXRlcm1pbmUgdGhlIGRvY3VtZW50IHRvIHVzZVxuICAgIGxldCBkb2MgPSAoMCwgJGNnYXdDJGdldE93bmVyRG9jdW1lbnQpKHJvb3RFbGVtZW50KTtcbiAgICAvLyBDcmVhdGUgYSBUcmVlV2Fsa2VyLCBlbnN1cmluZyB0aGUgcm9vdCBpcyBhbiBFbGVtZW50IG9yIERvY3VtZW50XG4gICAgbGV0IHdhbGtlciA9ICgwLCAkY2dhd0MkY3JlYXRlU2hhZG93VHJlZVdhbGtlcikoZG9jLCByb290IHx8IGRvYywgTm9kZUZpbHRlci5TSE9XX0VMRU1FTlQsIHtcbiAgICAgICAgYWNjZXB0Tm9kZSAobm9kZSkge1xuICAgICAgICAgICAgdmFyIF9vcHRzX2Zyb207XG4gICAgICAgICAgICAvLyBTa2lwIG5vZGVzIGluc2lkZSB0aGUgc3RhcnRpbmcgbm9kZS5cbiAgICAgICAgICAgIGlmIChvcHRzID09PSBudWxsIHx8IG9wdHMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IChfb3B0c19mcm9tID0gb3B0cy5mcm9tKSA9PT0gbnVsbCB8fCBfb3B0c19mcm9tID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfb3B0c19mcm9tLmNvbnRhaW5zKG5vZGUpKSByZXR1cm4gTm9kZUZpbHRlci5GSUxURVJfUkVKRUNUO1xuICAgICAgICAgICAgaWYgKChvcHRzID09PSBudWxsIHx8IG9wdHMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdHMudGFiYmFibGUpICYmIG5vZGUudGFnTmFtZSA9PT0gJ0lOUFVUJyAmJiBub2RlLmdldEF0dHJpYnV0ZSgndHlwZScpID09PSAncmFkaW8nKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJhZGlvIGlzIGluIGEgZm9ybSwgd2UgY2FuIGdldCBhbGwgdGhlIG90aGVyIHJhZGlvcyBieSBuYW1lXG4gICAgICAgICAgICAgICAgaWYgKCEkOWJmNzFlYTI4NzkzZTczOCR2YXIkaXNUYWJiYWJsZVJhZGlvKG5vZGUpKSByZXR1cm4gTm9kZUZpbHRlci5GSUxURVJfUkVKRUNUO1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSByYWRpbyBpcyBpbiB0aGUgc2FtZSBncm91cCBhcyB0aGUgY3VycmVudCBub2RlIGFuZCBub25lIGFyZSBzZWxlY3RlZCwgd2UgY2FuIHNraXAgaXRcbiAgICAgICAgICAgICAgICBpZiAod2Fsa2VyLmN1cnJlbnROb2RlLnRhZ05hbWUgPT09ICdJTlBVVCcgJiYgd2Fsa2VyLmN1cnJlbnROb2RlLnR5cGUgPT09ICdyYWRpbycgJiYgd2Fsa2VyLmN1cnJlbnROb2RlLm5hbWUgPT09IG5vZGUubmFtZSkgcmV0dXJuIE5vZGVGaWx0ZXIuRklMVEVSX1JFSkVDVDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmaWx0ZXIobm9kZSkgJiYgKCFzY29wZSB8fCAkOWJmNzFlYTI4NzkzZTczOCR2YXIkaXNFbGVtZW50SW5TY29wZShub2RlLCBzY29wZSkpICYmICghKG9wdHMgPT09IG51bGwgfHwgb3B0cyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0cy5hY2NlcHQpIHx8IG9wdHMuYWNjZXB0KG5vZGUpKSkgcmV0dXJuIE5vZGVGaWx0ZXIuRklMVEVSX0FDQ0VQVDtcbiAgICAgICAgICAgIHJldHVybiBOb2RlRmlsdGVyLkZJTFRFUl9TS0lQO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKG9wdHMgPT09IG51bGwgfHwgb3B0cyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0cy5mcm9tKSB3YWxrZXIuY3VycmVudE5vZGUgPSBvcHRzLmZyb207XG4gICAgcmV0dXJuIHdhbGtlcjtcbn1cbmZ1bmN0aW9uICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCRjNTI1MWI5ZTEyNGJmMjkocmVmLCBkZWZhdWx0T3B0aW9ucyA9IHt9KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZm9jdXNOZXh0IChvcHRzID0ge30pIHtcbiAgICAgICAgICAgIGxldCByb290ID0gcmVmLmN1cnJlbnQ7XG4gICAgICAgICAgICBpZiAoIXJvb3QpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgbGV0IHsgZnJvbTogZnJvbSwgdGFiYmFibGU6IHRhYmJhYmxlID0gZGVmYXVsdE9wdGlvbnMudGFiYmFibGUsIHdyYXA6IHdyYXAgPSBkZWZhdWx0T3B0aW9ucy53cmFwLCBhY2NlcHQ6IGFjY2VwdCA9IGRlZmF1bHRPcHRpb25zLmFjY2VwdCB9ID0gb3B0cztcbiAgICAgICAgICAgIGxldCBub2RlID0gZnJvbSB8fCAoMCwgJGNnYXdDJGdldEFjdGl2ZUVsZW1lbnQpKCgwLCAkY2dhd0MkZ2V0T3duZXJEb2N1bWVudCkocm9vdCkpO1xuICAgICAgICAgICAgbGV0IHdhbGtlciA9ICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCQyZDZlYzhmYzM3NWNlYWZhKHJvb3QsIHtcbiAgICAgICAgICAgICAgICB0YWJiYWJsZTogdGFiYmFibGUsXG4gICAgICAgICAgICAgICAgYWNjZXB0OiBhY2NlcHRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHJvb3QuY29udGFpbnMobm9kZSkpIHdhbGtlci5jdXJyZW50Tm9kZSA9IG5vZGU7XG4gICAgICAgICAgICBsZXQgbmV4dE5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgIGlmICghbmV4dE5vZGUgJiYgd3JhcCkge1xuICAgICAgICAgICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IHJvb3Q7XG4gICAgICAgICAgICAgICAgbmV4dE5vZGUgPSB3YWxrZXIubmV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChuZXh0Tm9kZSkgJDliZjcxZWEyODc5M2U3MzgkdmFyJGZvY3VzRWxlbWVudChuZXh0Tm9kZSwgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm4gbmV4dE5vZGU7XG4gICAgICAgIH0sXG4gICAgICAgIGZvY3VzUHJldmlvdXMgKG9wdHMgPSBkZWZhdWx0T3B0aW9ucykge1xuICAgICAgICAgICAgbGV0IHJvb3QgPSByZWYuY3VycmVudDtcbiAgICAgICAgICAgIGlmICghcm9vdCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBsZXQgeyBmcm9tOiBmcm9tLCB0YWJiYWJsZTogdGFiYmFibGUgPSBkZWZhdWx0T3B0aW9ucy50YWJiYWJsZSwgd3JhcDogd3JhcCA9IGRlZmF1bHRPcHRpb25zLndyYXAsIGFjY2VwdDogYWNjZXB0ID0gZGVmYXVsdE9wdGlvbnMuYWNjZXB0IH0gPSBvcHRzO1xuICAgICAgICAgICAgbGV0IG5vZGUgPSBmcm9tIHx8ICgwLCAkY2dhd0MkZ2V0QWN0aXZlRWxlbWVudCkoKDAsICRjZ2F3QyRnZXRPd25lckRvY3VtZW50KShyb290KSk7XG4gICAgICAgICAgICBsZXQgd2Fsa2VyID0gJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JDJkNmVjOGZjMzc1Y2VhZmEocm9vdCwge1xuICAgICAgICAgICAgICAgIHRhYmJhYmxlOiB0YWJiYWJsZSxcbiAgICAgICAgICAgICAgICBhY2NlcHQ6IGFjY2VwdFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocm9vdC5jb250YWlucyhub2RlKSkgd2Fsa2VyLmN1cnJlbnROb2RlID0gbm9kZTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBuZXh0ID0gJDliZjcxZWEyODc5M2U3MzgkdmFyJGxhc3Qod2Fsa2VyKTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dCkgJDliZjcxZWEyODc5M2U3MzgkdmFyJGZvY3VzRWxlbWVudChuZXh0LCB0cnVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dCAhPT0gbnVsbCAmJiBuZXh0ICE9PSB2b2lkIDAgPyBuZXh0IDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBwcmV2aW91c05vZGUgPSB3YWxrZXIucHJldmlvdXNOb2RlKCk7XG4gICAgICAgICAgICBpZiAoIXByZXZpb3VzTm9kZSAmJiB3cmFwKSB7XG4gICAgICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gcm9vdDtcbiAgICAgICAgICAgICAgICBsZXQgbGFzdE5vZGUgPSAkOWJmNzFlYTI4NzkzZTczOCR2YXIkbGFzdCh3YWxrZXIpO1xuICAgICAgICAgICAgICAgIGlmICghbGFzdE5vZGUpIC8vIGNvdWxkbid0IHdyYXBcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICBwcmV2aW91c05vZGUgPSBsYXN0Tm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcmV2aW91c05vZGUpICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRmb2N1c0VsZW1lbnQocHJldmlvdXNOb2RlLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiBwcmV2aW91c05vZGUgIT09IG51bGwgJiYgcHJldmlvdXNOb2RlICE9PSB2b2lkIDAgPyBwcmV2aW91c05vZGUgOiBudWxsO1xuICAgICAgICB9LFxuICAgICAgICBmb2N1c0ZpcnN0IChvcHRzID0gZGVmYXVsdE9wdGlvbnMpIHtcbiAgICAgICAgICAgIGxldCByb290ID0gcmVmLmN1cnJlbnQ7XG4gICAgICAgICAgICBpZiAoIXJvb3QpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgbGV0IHsgdGFiYmFibGU6IHRhYmJhYmxlID0gZGVmYXVsdE9wdGlvbnMudGFiYmFibGUsIGFjY2VwdDogYWNjZXB0ID0gZGVmYXVsdE9wdGlvbnMuYWNjZXB0IH0gPSBvcHRzO1xuICAgICAgICAgICAgbGV0IHdhbGtlciA9ICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCQyZDZlYzhmYzM3NWNlYWZhKHJvb3QsIHtcbiAgICAgICAgICAgICAgICB0YWJiYWJsZTogdGFiYmFibGUsXG4gICAgICAgICAgICAgICAgYWNjZXB0OiBhY2NlcHRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IG5leHROb2RlID0gd2Fsa2VyLm5leHROb2RlKCk7XG4gICAgICAgICAgICBpZiAobmV4dE5vZGUpICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRmb2N1c0VsZW1lbnQobmV4dE5vZGUsIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIG5leHROb2RlO1xuICAgICAgICB9LFxuICAgICAgICBmb2N1c0xhc3QgKG9wdHMgPSBkZWZhdWx0T3B0aW9ucykge1xuICAgICAgICAgICAgbGV0IHJvb3QgPSByZWYuY3VycmVudDtcbiAgICAgICAgICAgIGlmICghcm9vdCkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBsZXQgeyB0YWJiYWJsZTogdGFiYmFibGUgPSBkZWZhdWx0T3B0aW9ucy50YWJiYWJsZSwgYWNjZXB0OiBhY2NlcHQgPSBkZWZhdWx0T3B0aW9ucy5hY2NlcHQgfSA9IG9wdHM7XG4gICAgICAgICAgICBsZXQgd2Fsa2VyID0gJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JDJkNmVjOGZjMzc1Y2VhZmEocm9vdCwge1xuICAgICAgICAgICAgICAgIHRhYmJhYmxlOiB0YWJiYWJsZSxcbiAgICAgICAgICAgICAgICBhY2NlcHQ6IGFjY2VwdFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgbmV4dCA9ICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRsYXN0KHdhbGtlcik7XG4gICAgICAgICAgICBpZiAobmV4dCkgJDliZjcxZWEyODc5M2U3MzgkdmFyJGZvY3VzRWxlbWVudChuZXh0LCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiBuZXh0ICE9PSBudWxsICYmIG5leHQgIT09IHZvaWQgMCA/IG5leHQgOiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRsYXN0KHdhbGtlcikge1xuICAgIGxldCBuZXh0ID0gdW5kZWZpbmVkO1xuICAgIGxldCBsYXN0O1xuICAgIGRvIHtcbiAgICAgICAgbGFzdCA9IHdhbGtlci5sYXN0Q2hpbGQoKTtcbiAgICAgICAgaWYgKGxhc3QpIG5leHQgPSBsYXN0O1xuICAgIH13aGlsZSAobGFzdCk7XG4gICAgcmV0dXJuIG5leHQ7XG59XG5jbGFzcyAkOWJmNzFlYTI4NzkzZTczOCR2YXIkVHJlZSB7XG4gICAgZ2V0IHNpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZhc3RNYXAuc2l6ZTtcbiAgICB9XG4gICAgZ2V0VHJlZU5vZGUoZGF0YSkge1xuICAgICAgICByZXR1cm4gdGhpcy5mYXN0TWFwLmdldChkYXRhKTtcbiAgICB9XG4gICAgYWRkVHJlZU5vZGUoc2NvcGVSZWYsIHBhcmVudCwgbm9kZVRvUmVzdG9yZSkge1xuICAgICAgICBsZXQgcGFyZW50Tm9kZSA9IHRoaXMuZmFzdE1hcC5nZXQocGFyZW50ICE9PSBudWxsICYmIHBhcmVudCAhPT0gdm9pZCAwID8gcGFyZW50IDogbnVsbCk7XG4gICAgICAgIGlmICghcGFyZW50Tm9kZSkgcmV0dXJuO1xuICAgICAgICBsZXQgbm9kZSA9IG5ldyAkOWJmNzFlYTI4NzkzZTczOCR2YXIkVHJlZU5vZGUoe1xuICAgICAgICAgICAgc2NvcGVSZWY6IHNjb3BlUmVmXG4gICAgICAgIH0pO1xuICAgICAgICBwYXJlbnROb2RlLmFkZENoaWxkKG5vZGUpO1xuICAgICAgICBub2RlLnBhcmVudCA9IHBhcmVudE5vZGU7XG4gICAgICAgIHRoaXMuZmFzdE1hcC5zZXQoc2NvcGVSZWYsIG5vZGUpO1xuICAgICAgICBpZiAobm9kZVRvUmVzdG9yZSkgbm9kZS5ub2RlVG9SZXN0b3JlID0gbm9kZVRvUmVzdG9yZTtcbiAgICB9XG4gICAgYWRkTm9kZShub2RlKSB7XG4gICAgICAgIHRoaXMuZmFzdE1hcC5zZXQobm9kZS5zY29wZVJlZiwgbm9kZSk7XG4gICAgfVxuICAgIHJlbW92ZVRyZWVOb2RlKHNjb3BlUmVmKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlbW92ZSB0aGUgcm9vdFxuICAgICAgICBpZiAoc2NvcGVSZWYgPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLmZhc3RNYXAuZ2V0KHNjb3BlUmVmKTtcbiAgICAgICAgaWYgKCFub2RlKSByZXR1cm47XG4gICAgICAgIGxldCBwYXJlbnROb2RlID0gbm9kZS5wYXJlbnQ7XG4gICAgICAgIC8vIHdoZW4gd2UgcmVtb3ZlIGEgc2NvcGUsIGNoZWNrIGlmIGFueSBzaWJsaW5nIHNjb3BlcyBhcmUgdHJ5aW5nIHRvIHJlc3RvcmUgZm9jdXMgdG8gc29tZXRoaW5nIGluc2lkZSB0aGUgc2NvcGUgd2UncmUgcmVtb3ZpbmdcbiAgICAgICAgLy8gaWYgd2UgYXJlLCB0aGVuIHJlcGxhY2UgdGhlIHNpYmxpbmdzIHJlc3RvcmUgd2l0aCB0aGUgcmVzdG9yZSBmcm9tIHRoZSBzY29wZSB3ZSdyZSByZW1vdmluZ1xuICAgICAgICBmb3IgKGxldCBjdXJyZW50IG9mIHRoaXMudHJhdmVyc2UoKSlpZiAoY3VycmVudCAhPT0gbm9kZSAmJiBub2RlLm5vZGVUb1Jlc3RvcmUgJiYgY3VycmVudC5ub2RlVG9SZXN0b3JlICYmIG5vZGUuc2NvcGVSZWYgJiYgbm9kZS5zY29wZVJlZi5jdXJyZW50ICYmICQ5YmY3MWVhMjg3OTNlNzM4JHZhciRpc0VsZW1lbnRJblNjb3BlKGN1cnJlbnQubm9kZVRvUmVzdG9yZSwgbm9kZS5zY29wZVJlZi5jdXJyZW50KSkgY3VycmVudC5ub2RlVG9SZXN0b3JlID0gbm9kZS5ub2RlVG9SZXN0b3JlO1xuICAgICAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xuICAgICAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbi5zaXplID4gMCkgY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpPT5wYXJlbnROb2RlICYmIHBhcmVudE5vZGUuYWRkQ2hpbGQoY2hpbGQpKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZhc3RNYXAuZGVsZXRlKG5vZGUuc2NvcGVSZWYpO1xuICAgIH1cbiAgICAvLyBQcmUgT3JkZXIgRGVwdGggRmlyc3RcbiAgICAqdHJhdmVyc2Uobm9kZSA9IHRoaXMucm9vdCkge1xuICAgICAgICBpZiAobm9kZS5zY29wZVJlZiAhPSBudWxsKSB5aWVsZCBub2RlO1xuICAgICAgICBpZiAobm9kZS5jaGlsZHJlbi5zaXplID4gMCkgZm9yIChsZXQgY2hpbGQgb2Ygbm9kZS5jaGlsZHJlbil5aWVsZCogdGhpcy50cmF2ZXJzZShjaGlsZCk7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICB2YXIgX25vZGVfcGFyZW50O1xuICAgICAgICBsZXQgbmV3VHJlZSA9IG5ldyAkOWJmNzFlYTI4NzkzZTczOCR2YXIkVHJlZSgpO1xuICAgICAgICB2YXIgX25vZGVfcGFyZW50X3Njb3BlUmVmO1xuICAgICAgICBmb3IgKGxldCBub2RlIG9mIHRoaXMudHJhdmVyc2UoKSluZXdUcmVlLmFkZFRyZWVOb2RlKG5vZGUuc2NvcGVSZWYsIChfbm9kZV9wYXJlbnRfc2NvcGVSZWYgPSAoX25vZGVfcGFyZW50ID0gbm9kZS5wYXJlbnQpID09PSBudWxsIHx8IF9ub2RlX3BhcmVudCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX25vZGVfcGFyZW50LnNjb3BlUmVmKSAhPT0gbnVsbCAmJiBfbm9kZV9wYXJlbnRfc2NvcGVSZWYgIT09IHZvaWQgMCA/IF9ub2RlX3BhcmVudF9zY29wZVJlZiA6IG51bGwsIG5vZGUubm9kZVRvUmVzdG9yZSk7XG4gICAgICAgIHJldHVybiBuZXdUcmVlO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmZhc3RNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMucm9vdCA9IG5ldyAkOWJmNzFlYTI4NzkzZTczOCR2YXIkVHJlZU5vZGUoe1xuICAgICAgICAgICAgc2NvcGVSZWY6IG51bGxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZmFzdE1hcC5zZXQobnVsbCwgdGhpcy5yb290KTtcbiAgICB9XG59XG5jbGFzcyAkOWJmNzFlYTI4NzkzZTczOCR2YXIkVHJlZU5vZGUge1xuICAgIGFkZENoaWxkKG5vZGUpIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5hZGQobm9kZSk7XG4gICAgICAgIG5vZGUucGFyZW50ID0gdGhpcztcbiAgICB9XG4gICAgcmVtb3ZlQ2hpbGQobm9kZSkge1xuICAgICAgICB0aGlzLmNoaWxkcmVuLmRlbGV0ZShub2RlKTtcbiAgICAgICAgbm9kZS5wYXJlbnQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHByb3BzKXtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IG5ldyBTZXQoKTtcbiAgICAgICAgdGhpcy5jb250YWluID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2NvcGVSZWYgPSBwcm9wcy5zY29wZVJlZjtcbiAgICB9XG59XG5sZXQgJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JGQwNmZhZTJlZTY4YjEwMWUgPSBuZXcgJDliZjcxZWEyODc5M2U3MzgkdmFyJFRyZWUoKTtcblxuXG5leHBvcnQgeyQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCQyMGU0MDI4OTY0MWZiYmI2IGFzIEZvY3VzU2NvcGUsICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCRkMDZmYWUyZWU2OGIxMDFlIGFzIGZvY3VzU2NvcGVUcmVlLCAkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkMTBjNTE2OTc1NWNlN2JkNyBhcyB1c2VGb2N1c01hbmFnZXIsICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCQyZDZlYzhmYzM3NWNlYWZhIGFzIGdldEZvY3VzYWJsZVRyZWVXYWxrZXIsICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCQxMjU4Mzk1Zjk5YmY5Y2JmIGFzIGlzRWxlbWVudEluQ2hpbGRPZkFjdGl2ZVNjb3BlLCAkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkYzUyNTFiOWUxMjRiZjI5IGFzIGNyZWF0ZUZvY3VzTWFuYWdlcn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Gb2N1c1Njb3BlLm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7aXNGb2N1c1Zpc2libGUgYXMgJGlzV0U1JGlzRm9jdXNWaXNpYmxlLCB1c2VGb2N1c1Zpc2libGVMaXN0ZW5lciBhcyAkaXNXRTUkdXNlRm9jdXNWaXNpYmxlTGlzdGVuZXIsIHVzZUZvY3VzIGFzICRpc1dFNSR1c2VGb2N1cywgdXNlRm9jdXNXaXRoaW4gYXMgJGlzV0U1JHVzZUZvY3VzV2l0aGlufSBmcm9tIFwiQHJlYWN0LWFyaWEvaW50ZXJhY3Rpb25zXCI7XG5pbXBvcnQge3VzZVJlZiBhcyAkaXNXRTUkdXNlUmVmLCB1c2VTdGF0ZSBhcyAkaXNXRTUkdXNlU3RhdGUsIHVzZUNhbGxiYWNrIGFzICRpc1dFNSR1c2VDYWxsYmFja30gZnJvbSBcInJlYWN0XCI7XG5cblxuXG5mdW5jdGlvbiAkZjdkY2VmZmM1YWQ3NzY4YiRleHBvcnQkNGUzMjhmNjFjNTM4Njg3Zihwcm9wcyA9IHt9KSB7XG4gICAgbGV0IHsgYXV0b0ZvY3VzOiBhdXRvRm9jdXMgPSBmYWxzZSwgaXNUZXh0SW5wdXQ6IGlzVGV4dElucHV0LCB3aXRoaW46IHdpdGhpbiB9ID0gcHJvcHM7XG4gICAgbGV0IHN0YXRlID0gKDAsICRpc1dFNSR1c2VSZWYpKHtcbiAgICAgICAgaXNGb2N1c2VkOiBmYWxzZSxcbiAgICAgICAgaXNGb2N1c1Zpc2libGU6IGF1dG9Gb2N1cyB8fCAoMCwgJGlzV0U1JGlzRm9jdXNWaXNpYmxlKSgpXG4gICAgfSk7XG4gICAgbGV0IFtpc0ZvY3VzZWQsIHNldEZvY3VzZWRdID0gKDAsICRpc1dFNSR1c2VTdGF0ZSkoZmFsc2UpO1xuICAgIGxldCBbaXNGb2N1c1Zpc2libGVTdGF0ZSwgc2V0Rm9jdXNWaXNpYmxlXSA9ICgwLCAkaXNXRTUkdXNlU3RhdGUpKCgpPT5zdGF0ZS5jdXJyZW50LmlzRm9jdXNlZCAmJiBzdGF0ZS5jdXJyZW50LmlzRm9jdXNWaXNpYmxlKTtcbiAgICBsZXQgdXBkYXRlU3RhdGUgPSAoMCwgJGlzV0U1JHVzZUNhbGxiYWNrKSgoKT0+c2V0Rm9jdXNWaXNpYmxlKHN0YXRlLmN1cnJlbnQuaXNGb2N1c2VkICYmIHN0YXRlLmN1cnJlbnQuaXNGb2N1c1Zpc2libGUpLCBbXSk7XG4gICAgbGV0IG9uRm9jdXNDaGFuZ2UgPSAoMCwgJGlzV0U1JHVzZUNhbGxiYWNrKSgoaXNGb2N1c2VkKT0+e1xuICAgICAgICBzdGF0ZS5jdXJyZW50LmlzRm9jdXNlZCA9IGlzRm9jdXNlZDtcbiAgICAgICAgc2V0Rm9jdXNlZChpc0ZvY3VzZWQpO1xuICAgICAgICB1cGRhdGVTdGF0ZSgpO1xuICAgIH0sIFtcbiAgICAgICAgdXBkYXRlU3RhdGVcbiAgICBdKTtcbiAgICAoMCwgJGlzV0U1JHVzZUZvY3VzVmlzaWJsZUxpc3RlbmVyKSgoaXNGb2N1c1Zpc2libGUpPT57XG4gICAgICAgIHN0YXRlLmN1cnJlbnQuaXNGb2N1c1Zpc2libGUgPSBpc0ZvY3VzVmlzaWJsZTtcbiAgICAgICAgdXBkYXRlU3RhdGUoKTtcbiAgICB9LCBbXSwge1xuICAgICAgICBpc1RleHRJbnB1dDogaXNUZXh0SW5wdXRcbiAgICB9KTtcbiAgICBsZXQgeyBmb2N1c1Byb3BzOiBmb2N1c1Byb3BzIH0gPSAoMCwgJGlzV0U1JHVzZUZvY3VzKSh7XG4gICAgICAgIGlzRGlzYWJsZWQ6IHdpdGhpbixcbiAgICAgICAgb25Gb2N1c0NoYW5nZTogb25Gb2N1c0NoYW5nZVxuICAgIH0pO1xuICAgIGxldCB7IGZvY3VzV2l0aGluUHJvcHM6IGZvY3VzV2l0aGluUHJvcHMgfSA9ICgwLCAkaXNXRTUkdXNlRm9jdXNXaXRoaW4pKHtcbiAgICAgICAgaXNEaXNhYmxlZDogIXdpdGhpbixcbiAgICAgICAgb25Gb2N1c1dpdGhpbkNoYW5nZTogb25Gb2N1c0NoYW5nZVxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGlzRm9jdXNlZDogaXNGb2N1c2VkLFxuICAgICAgICBpc0ZvY3VzVmlzaWJsZTogaXNGb2N1c1Zpc2libGVTdGF0ZSxcbiAgICAgICAgZm9jdXNQcm9wczogd2l0aGluID8gZm9jdXNXaXRoaW5Qcm9wcyA6IGZvY3VzUHJvcHNcbiAgICB9O1xufVxuXG5cbmV4cG9ydCB7JGY3ZGNlZmZjNWFkNzc2OGIkZXhwb3J0JDRlMzI4ZjYxYzUzODY4N2YgYXMgdXNlRm9jdXNSaW5nfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVzZUZvY3VzUmluZy5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge3VzZUZvY3VzUmluZyBhcyAkZjdkY2VmZmM1YWQ3NzY4YiRleHBvcnQkNGUzMjhmNjFjNTM4Njg3Zn0gZnJvbSBcIi4vdXNlRm9jdXNSaW5nLm1qc1wiO1xuaW1wb3J0ICRoQW1lZyRjbHN4IGZyb20gXCJjbHN4XCI7XG5pbXBvcnQge21lcmdlUHJvcHMgYXMgJGhBbWVnJG1lcmdlUHJvcHN9IGZyb20gXCJAcmVhY3QtYXJpYS91dGlsc1wiO1xuaW1wb3J0ICRoQW1lZyRyZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuXG5cblxuZnVuY3Rpb24gJDkwNzcxODcwOGVhYjY4YWYkZXhwb3J0JDFhMzhiNGFkN2Y1NzhlMWQocHJvcHMpIHtcbiAgICBsZXQgeyBjaGlsZHJlbjogY2hpbGRyZW4sIGZvY3VzQ2xhc3M6IGZvY3VzQ2xhc3MsIGZvY3VzUmluZ0NsYXNzOiBmb2N1c1JpbmdDbGFzcyB9ID0gcHJvcHM7XG4gICAgbGV0IHsgaXNGb2N1c2VkOiBpc0ZvY3VzZWQsIGlzRm9jdXNWaXNpYmxlOiBpc0ZvY3VzVmlzaWJsZSwgZm9jdXNQcm9wczogZm9jdXNQcm9wcyB9ID0gKDAsICRmN2RjZWZmYzVhZDc3NjhiJGV4cG9ydCQ0ZTMyOGY2MWM1Mzg2ODdmKShwcm9wcyk7XG4gICAgbGV0IGNoaWxkID0gKDAsICRoQW1lZyRyZWFjdCkuQ2hpbGRyZW4ub25seShjaGlsZHJlbik7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi8gKDAsICRoQW1lZyRyZWFjdCkuY2xvbmVFbGVtZW50KGNoaWxkLCAoMCwgJGhBbWVnJG1lcmdlUHJvcHMpKGNoaWxkLnByb3BzLCB7XG4gICAgICAgIC4uLmZvY3VzUHJvcHMsXG4gICAgICAgIGNsYXNzTmFtZTogKDAsICRoQW1lZyRjbHN4KSh7XG4gICAgICAgICAgICBbZm9jdXNDbGFzcyB8fCAnJ106IGlzRm9jdXNlZCxcbiAgICAgICAgICAgIFtmb2N1c1JpbmdDbGFzcyB8fCAnJ106IGlzRm9jdXNWaXNpYmxlXG4gICAgICAgIH0pXG4gICAgfSkpO1xufVxuXG5cbmV4cG9ydCB7JDkwNzcxODcwOGVhYjY4YWYkZXhwb3J0JDFhMzhiNGFkN2Y1NzhlMWQgYXMgRm9jdXNSaW5nfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUZvY3VzUmluZy5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge2dldEZvY3VzYWJsZVRyZWVXYWxrZXIgYXMgJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JDJkNmVjOGZjMzc1Y2VhZmF9IGZyb20gXCIuL0ZvY3VzU2NvcGUubWpzXCI7XG5pbXBvcnQge3VzZUxheW91dEVmZmVjdCBhcyAkaEdBYUckdXNlTGF5b3V0RWZmZWN0fSBmcm9tIFwiQHJlYWN0LWFyaWEvdXRpbHNcIjtcbmltcG9ydCB7dXNlU3RhdGUgYXMgJGhHQWFHJHVzZVN0YXRlfSBmcm9tIFwicmVhY3RcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIyIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuXG5cbmZ1bmN0aW9uICQ4MzAxMzYzNWIwMjRhZTNkJGV4cG9ydCRlYWMxODk1OTkyYjlmM2Q2KHJlZiwgb3B0aW9ucykge1xuICAgIGxldCBpc0Rpc2FibGVkID0gb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb25zLmlzRGlzYWJsZWQ7XG4gICAgbGV0IFtoYXNUYWJiYWJsZUNoaWxkLCBzZXRIYXNUYWJiYWJsZUNoaWxkXSA9ICgwLCAkaEdBYUckdXNlU3RhdGUpKGZhbHNlKTtcbiAgICAoMCwgJGhHQWFHJHVzZUxheW91dEVmZmVjdCkoKCk9PntcbiAgICAgICAgaWYgKChyZWYgPT09IG51bGwgfHwgcmVmID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZWYuY3VycmVudCkgJiYgIWlzRGlzYWJsZWQpIHtcbiAgICAgICAgICAgIGxldCB1cGRhdGUgPSAoKT0+e1xuICAgICAgICAgICAgICAgIGlmIChyZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgd2Fsa2VyID0gKDAsICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCQyZDZlYzhmYzM3NWNlYWZhKShyZWYuY3VycmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFiYmFibGU6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNldEhhc1RhYmJhYmxlQ2hpbGQoISF3YWxrZXIubmV4dE5vZGUoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICAgICAgLy8gVXBkYXRlIHdoZW4gbmV3IGVsZW1lbnRzIGFyZSBpbnNlcnRlZCwgb3IgdGhlIHRhYkluZGV4L2Rpc2FibGVkIGF0dHJpYnV0ZSB1cGRhdGVzLlxuICAgICAgICAgICAgbGV0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIodXBkYXRlKTtcbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUocmVmLmN1cnJlbnQsIHtcbiAgICAgICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogW1xuICAgICAgICAgICAgICAgICAgICAndGFiSW5kZXgnLFxuICAgICAgICAgICAgICAgICAgICAnZGlzYWJsZWQnXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgICAgICAvLyBEaXNjb25uZWN0IG11dGF0aW9uIG9ic2VydmVyIHdoZW4gYSBSZWFjdCB1cGRhdGUgb2NjdXJzIG9uIHRoZSB0b3AtbGV2ZWwgY29tcG9uZW50XG4gICAgICAgICAgICAgICAgLy8gc28gd2UgdXBkYXRlIHN5bmNocm9ub3VzbHkgYWZ0ZXIgcmUtcmVuZGVyaW5nLiBPdGhlcndpc2UgUmVhY3Qgd2lsbCBlbWl0IGFjdCB3YXJuaW5nc1xuICAgICAgICAgICAgICAgIC8vIGluIHRlc3RzIHNpbmNlIG11dGF0aW9uIG9ic2VydmVycyBmaXJlIGFzeW5jaHJvbm91c2x5LiBUaGUgbXV0YXRpb24gb2JzZXJ2ZXIgaXMgbmVjZXNzYXJ5XG4gICAgICAgICAgICAgICAgLy8gc28gd2UgYWxzbyB1cGRhdGUgaWYgYSBjaGlsZCBjb21wb25lbnQgcmUtcmVuZGVycyBhbmQgYWRkcy9yZW1vdmVzIHNvbWV0aGluZyB0YWJiYWJsZS5cbiAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGlzRGlzYWJsZWQgPyBmYWxzZSA6IGhhc1RhYmJhYmxlQ2hpbGQ7XG59XG5cblxuZXhwb3J0IHskODMwMTM2MzViMDI0YWUzZCRleHBvcnQkZWFjMTg5NTk5MmI5ZjNkNiBhcyB1c2VIYXNUYWJiYWJsZUNoaWxkfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVzZUhhc1RhYmJhYmxlQ2hpbGQubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHtnZXRPd25lckRvY3VtZW50IGFzICRocERRTyRnZXRPd25lckRvY3VtZW50LCBnZXRBY3RpdmVFbGVtZW50IGFzICRocERRTyRnZXRBY3RpdmVFbGVtZW50fSBmcm9tIFwiQHJlYWN0LWFyaWEvdXRpbHNcIjtcblxuXG5mdW5jdGlvbiAkNTVmOWIxYWU4MWYyMjg1MyRleHBvcnQkNzZlNGUzN2U1MzM5NDk2ZCh0bykge1xuICAgIGxldCBmcm9tID0gJDU1ZjliMWFlODFmMjI4NTMkZXhwb3J0JDc1OWRmMGQ4Njc0NTVhOTEoKDAsICRocERRTyRnZXRPd25lckRvY3VtZW50KSh0bykpO1xuICAgIGlmIChmcm9tICE9PSB0bykge1xuICAgICAgICBpZiAoZnJvbSkgJDU1ZjliMWFlODFmMjI4NTMkZXhwb3J0JDZjNWRjN2U4MWQyY2MyOWEoZnJvbSwgdG8pO1xuICAgICAgICBpZiAodG8pICQ1NWY5YjFhZTgxZjIyODUzJGV4cG9ydCQyYjM1Yjc2ZDJlMzBlMTI5KHRvLCBmcm9tKTtcbiAgICB9XG59XG5mdW5jdGlvbiAkNTVmOWIxYWU4MWYyMjg1MyRleHBvcnQkNmM1ZGM3ZTgxZDJjYzI5YShmcm9tLCB0bykge1xuICAgIGZyb20uZGlzcGF0Y2hFdmVudChuZXcgRm9jdXNFdmVudCgnYmx1cicsIHtcbiAgICAgICAgcmVsYXRlZFRhcmdldDogdG9cbiAgICB9KSk7XG4gICAgZnJvbS5kaXNwYXRjaEV2ZW50KG5ldyBGb2N1c0V2ZW50KCdmb2N1c291dCcsIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgcmVsYXRlZFRhcmdldDogdG9cbiAgICB9KSk7XG59XG5mdW5jdGlvbiAkNTVmOWIxYWU4MWYyMjg1MyRleHBvcnQkMmIzNWI3NmQyZTMwZTEyOSh0bywgZnJvbSkge1xuICAgIHRvLmRpc3BhdGNoRXZlbnQobmV3IEZvY3VzRXZlbnQoJ2ZvY3VzJywge1xuICAgICAgICByZWxhdGVkVGFyZ2V0OiBmcm9tXG4gICAgfSkpO1xuICAgIHRvLmRpc3BhdGNoRXZlbnQobmV3IEZvY3VzRXZlbnQoJ2ZvY3VzaW4nLCB7XG4gICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgIHJlbGF0ZWRUYXJnZXQ6IGZyb21cbiAgICB9KSk7XG59XG5mdW5jdGlvbiAkNTVmOWIxYWU4MWYyMjg1MyRleHBvcnQkNzU5ZGYwZDg2NzQ1NWE5MShkb2N1bWVudCkge1xuICAgIGxldCBhY3RpdmVFbGVtZW50ID0gKDAsICRocERRTyRnZXRBY3RpdmVFbGVtZW50KShkb2N1bWVudCk7XG4gICAgbGV0IGFjdGl2ZURlc2NlbmRhbnQgPSBhY3RpdmVFbGVtZW50ID09PSBudWxsIHx8IGFjdGl2ZUVsZW1lbnQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGFjdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnKTtcbiAgICBpZiAoYWN0aXZlRGVzY2VuZGFudCkgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFjdGl2ZURlc2NlbmRhbnQpIHx8IGFjdGl2ZUVsZW1lbnQ7XG4gICAgcmV0dXJuIGFjdGl2ZUVsZW1lbnQ7XG59XG5cblxuZXhwb3J0IHskNTVmOWIxYWU4MWYyMjg1MyRleHBvcnQkNzZlNGUzN2U1MzM5NDk2ZCBhcyBtb3ZlVmlydHVhbEZvY3VzLCAkNTVmOWIxYWU4MWYyMjg1MyRleHBvcnQkNzU5ZGYwZDg2NzQ1NWE5MSBhcyBnZXRWaXJ0dWFsbHlGb2N1c2VkRWxlbWVudCwgJDU1ZjliMWFlODFmMjI4NTMkZXhwb3J0JDZjNWRjN2U4MWQyY2MyOWEgYXMgZGlzcGF0Y2hWaXJ0dWFsQmx1ciwgJDU1ZjliMWFlODFmMjI4NTMkZXhwb3J0JDJiMzViNzZkMmUzMGUxMjkgYXMgZGlzcGF0Y2hWaXJ0dWFsRm9jdXN9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dmlydHVhbEZvY3VzLm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7Y3JlYXRlRm9jdXNNYW5hZ2VyIGFzICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCRjNTI1MWI5ZTEyNGJmMjksIEZvY3VzU2NvcGUgYXMgJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JDIwZTQwMjg5NjQxZmJiYjYsIGdldEZvY3VzYWJsZVRyZWVXYWxrZXIgYXMgJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JDJkNmVjOGZjMzc1Y2VhZmEsIGlzRWxlbWVudEluQ2hpbGRPZkFjdGl2ZVNjb3BlIGFzICQ5YmY3MWVhMjg3OTNlNzM4JGV4cG9ydCQxMjU4Mzk1Zjk5YmY5Y2JmLCB1c2VGb2N1c01hbmFnZXIgYXMgJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JDEwYzUxNjk3NTVjZTdiZDd9IGZyb20gXCIuL0ZvY3VzU2NvcGUubWpzXCI7XG5pbXBvcnQge0ZvY3VzUmluZyBhcyAkOTA3NzE4NzA4ZWFiNjhhZiRleHBvcnQkMWEzOGI0YWQ3ZjU3OGUxZH0gZnJvbSBcIi4vRm9jdXNSaW5nLm1qc1wiO1xuaW1wb3J0IHt1c2VGb2N1c1JpbmcgYXMgJGY3ZGNlZmZjNWFkNzc2OGIkZXhwb3J0JDRlMzI4ZjYxYzUzODY4N2Z9IGZyb20gXCIuL3VzZUZvY3VzUmluZy5tanNcIjtcbmltcG9ydCB7dXNlSGFzVGFiYmFibGVDaGlsZCBhcyAkODMwMTM2MzViMDI0YWUzZCRleHBvcnQkZWFjMTg5NTk5MmI5ZjNkNn0gZnJvbSBcIi4vdXNlSGFzVGFiYmFibGVDaGlsZC5tanNcIjtcbmltcG9ydCB7ZGlzcGF0Y2hWaXJ0dWFsQmx1ciBhcyAkNTVmOWIxYWU4MWYyMjg1MyRleHBvcnQkNmM1ZGM3ZTgxZDJjYzI5YSwgZGlzcGF0Y2hWaXJ0dWFsRm9jdXMgYXMgJDU1ZjliMWFlODFmMjI4NTMkZXhwb3J0JDJiMzViNzZkMmUzMGUxMjksIGdldFZpcnR1YWxseUZvY3VzZWRFbGVtZW50IGFzICQ1NWY5YjFhZTgxZjIyODUzJGV4cG9ydCQ3NTlkZjBkODY3NDU1YTkxLCBtb3ZlVmlydHVhbEZvY3VzIGFzICQ1NWY5YjFhZTgxZjIyODUzJGV4cG9ydCQ3NmU0ZTM3ZTUzMzk0OTZkfSBmcm9tIFwiLi92aXJ0dWFsRm9jdXMubWpzXCI7XG5pbXBvcnQge2lzRm9jdXNhYmxlIGFzICRkNDhmOTdjOWQxYThlMzIzJHJlX2V4cG9ydCRpc0ZvY3VzYWJsZX0gZnJvbSBcIkByZWFjdC1hcmlhL3V0aWxzXCI7XG5pbXBvcnQge0ZvY3VzYWJsZVByb3ZpZGVyIGFzICRkNDhmOTdjOWQxYThlMzIzJHJlX2V4cG9ydCRGb2N1c2FibGVQcm92aWRlciwgRm9jdXNhYmxlIGFzICRkNDhmOTdjOWQxYThlMzIzJHJlX2V4cG9ydCRGb2N1c2FibGUsIHVzZUZvY3VzYWJsZSBhcyAkZDQ4Zjk3YzlkMWE4ZTMyMyRyZV9leHBvcnQkdXNlRm9jdXNhYmxlLCBmb2N1c1NhZmVseSBhcyAkZDQ4Zjk3YzlkMWE4ZTMyMyRyZV9leHBvcnQkZm9jdXNTYWZlbHl9IGZyb20gXCJAcmVhY3QtYXJpYS9pbnRlcmFjdGlvbnNcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuXG5cblxuXG5cblxuXG5cbmV4cG9ydCB7JDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JDIwZTQwMjg5NjQxZmJiYjYgYXMgRm9jdXNTY29wZSwgJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JDEwYzUxNjk3NTVjZTdiZDcgYXMgdXNlRm9jdXNNYW5hZ2VyLCAkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkMmQ2ZWM4ZmMzNzVjZWFmYSBhcyBnZXRGb2N1c2FibGVUcmVlV2Fsa2VyLCAkOWJmNzFlYTI4NzkzZTczOCRleHBvcnQkYzUyNTFiOWUxMjRiZjI5IGFzIGNyZWF0ZUZvY3VzTWFuYWdlciwgJDliZjcxZWEyODc5M2U3MzgkZXhwb3J0JDEyNTgzOTVmOTliZjljYmYgYXMgaXNFbGVtZW50SW5DaGlsZE9mQWN0aXZlU2NvcGUsICQ5MDc3MTg3MDhlYWI2OGFmJGV4cG9ydCQxYTM4YjRhZDdmNTc4ZTFkIGFzIEZvY3VzUmluZywgJGY3ZGNlZmZjNWFkNzc2OGIkZXhwb3J0JDRlMzI4ZjYxYzUzODY4N2YgYXMgdXNlRm9jdXNSaW5nLCAkODMwMTM2MzViMDI0YWUzZCRleHBvcnQkZWFjMTg5NTk5MmI5ZjNkNiBhcyB1c2VIYXNUYWJiYWJsZUNoaWxkLCAkNTVmOWIxYWU4MWYyMjg1MyRleHBvcnQkNzZlNGUzN2U1MzM5NDk2ZCBhcyBtb3ZlVmlydHVhbEZvY3VzLCAkNTVmOWIxYWU4MWYyMjg1MyRleHBvcnQkNmM1ZGM3ZTgxZDJjYzI5YSBhcyBkaXNwYXRjaFZpcnR1YWxCbHVyLCAkNTVmOWIxYWU4MWYyMjg1MyRleHBvcnQkMmIzNWI3NmQyZTMwZTEyOSBhcyBkaXNwYXRjaFZpcnR1YWxGb2N1cywgJDU1ZjliMWFlODFmMjI4NTMkZXhwb3J0JDc1OWRmMGQ4Njc0NTVhOTEgYXMgZ2V0VmlydHVhbGx5Rm9jdXNlZEVsZW1lbnQsICRkNDhmOTdjOWQxYThlMzIzJHJlX2V4cG9ydCRpc0ZvY3VzYWJsZSBhcyBpc0ZvY3VzYWJsZSwgJGQ0OGY5N2M5ZDFhOGUzMjMkcmVfZXhwb3J0JEZvY3VzYWJsZVByb3ZpZGVyIGFzIEZvY3VzYWJsZVByb3ZpZGVyLCAkZDQ4Zjk3YzlkMWE4ZTMyMyRyZV9leHBvcnQkRm9jdXNhYmxlIGFzIEZvY3VzYWJsZSwgJGQ0OGY5N2M5ZDFhOGUzMjMkcmVfZXhwb3J0JHVzZUZvY3VzYWJsZSBhcyB1c2VGb2N1c2FibGUsICRkNDhmOTdjOWQxYThlMzIzJHJlX2V4cG9ydCRmb2N1c1NhZmVseSBhcyBmb2N1c1NhZmVseX07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tb2R1bGUuanMubWFwXG4iLCJ2YXIgbm93ID0gcmVxdWlyZSgncGVyZm9ybWFuY2Utbm93JylcbiAgLCByb290ID0gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3dcbiAgLCB2ZW5kb3JzID0gWydtb3onLCAnd2Via2l0J11cbiAgLCBzdWZmaXggPSAnQW5pbWF0aW9uRnJhbWUnXG4gICwgcmFmID0gcm9vdFsncmVxdWVzdCcgKyBzdWZmaXhdXG4gICwgY2FmID0gcm9vdFsnY2FuY2VsJyArIHN1ZmZpeF0gfHwgcm9vdFsnY2FuY2VsUmVxdWVzdCcgKyBzdWZmaXhdXG5cbmZvcih2YXIgaSA9IDA7ICFyYWYgJiYgaSA8IHZlbmRvcnMubGVuZ3RoOyBpKyspIHtcbiAgcmFmID0gcm9vdFt2ZW5kb3JzW2ldICsgJ1JlcXVlc3QnICsgc3VmZml4XVxuICBjYWYgPSByb290W3ZlbmRvcnNbaV0gKyAnQ2FuY2VsJyArIHN1ZmZpeF1cbiAgICAgIHx8IHJvb3RbdmVuZG9yc1tpXSArICdDYW5jZWxSZXF1ZXN0JyArIHN1ZmZpeF1cbn1cblxuLy8gU29tZSB2ZXJzaW9ucyBvZiBGRiBoYXZlIHJBRiBidXQgbm90IGNBRlxuaWYoIXJhZiB8fCAhY2FmKSB7XG4gIHZhciBsYXN0ID0gMFxuICAgICwgaWQgPSAwXG4gICAgLCBxdWV1ZSA9IFtdXG4gICAgLCBmcmFtZUR1cmF0aW9uID0gMTAwMCAvIDYwXG5cbiAgcmFmID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBpZihxdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHZhciBfbm93ID0gbm93KClcbiAgICAgICAgLCBuZXh0ID0gTWF0aC5tYXgoMCwgZnJhbWVEdXJhdGlvbiAtIChfbm93IC0gbGFzdCkpXG4gICAgICBsYXN0ID0gbmV4dCArIF9ub3dcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcCA9IHF1ZXVlLnNsaWNlKDApXG4gICAgICAgIC8vIENsZWFyIHF1ZXVlIGhlcmUgdG8gcHJldmVudFxuICAgICAgICAvLyBjYWxsYmFja3MgZnJvbSBhcHBlbmRpbmcgbGlzdGVuZXJzXG4gICAgICAgIC8vIHRvIHRoZSBjdXJyZW50IGZyYW1lJ3MgcXVldWVcbiAgICAgICAgcXVldWUubGVuZ3RoID0gMFxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY3AubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZighY3BbaV0uY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgIGNwW2ldLmNhbGxiYWNrKGxhc3QpXG4gICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgdGhyb3cgZSB9LCAwKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgTWF0aC5yb3VuZChuZXh0KSlcbiAgICB9XG4gICAgcXVldWUucHVzaCh7XG4gICAgICBoYW5kbGU6ICsraWQsXG4gICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICBjYW5jZWxsZWQ6IGZhbHNlXG4gICAgfSlcbiAgICByZXR1cm4gaWRcbiAgfVxuXG4gIGNhZiA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYocXVldWVbaV0uaGFuZGxlID09PSBoYW5kbGUpIHtcbiAgICAgICAgcXVldWVbaV0uY2FuY2VsbGVkID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuKSB7XG4gIC8vIFdyYXAgaW4gYSBuZXcgZnVuY3Rpb24gdG8gcHJldmVudFxuICAvLyBgY2FuY2VsYCBwb3RlbnRpYWxseSBiZWluZyBhc3NpZ25lZFxuICAvLyB0byB0aGUgbmF0aXZlIHJBRiBmdW5jdGlvblxuICByZXR1cm4gcmFmLmNhbGwocm9vdCwgZm4pXG59XG5tb2R1bGUuZXhwb3J0cy5jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgY2FmLmFwcGx5KHJvb3QsIGFyZ3VtZW50cylcbn1cbm1vZHVsZS5leHBvcnRzLnBvbHlmaWxsID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gIGlmICghb2JqZWN0KSB7XG4gICAgb2JqZWN0ID0gcm9vdDtcbiAgfVxuICBvYmplY3QucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcmFmXG4gIG9iamVjdC5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGNhZlxufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9