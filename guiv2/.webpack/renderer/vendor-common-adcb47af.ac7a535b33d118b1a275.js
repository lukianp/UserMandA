"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7948],{

/***/ 44363:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



if (false) // removed by dead control flow
{} else {
  module.exports = __webpack_require__(98413);
}


/***/ }),

/***/ 64074:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  QP: () => (/* reexport */ DndProvider),
  i3: () => (/* reexport */ useDrag),
  Hd: () => (/* reexport */ useDrop)
});

// UNUSED EXPORTS: DndContext, DragPreviewImage, useDragDropManager, useDragLayer

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./node_modules/react-dnd/dist/core/DndContext.js

/**
 * Create the React Context
 */ const DndContext = (0,react.createContext)({
    dragDropManager: undefined
});

//# sourceMappingURL=DndContext.js.map
// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(74848);
// EXTERNAL MODULE: ./node_modules/dnd-core/dist/index.js + 27 modules
var dist = __webpack_require__(46248);
;// ./node_modules/react-dnd/dist/core/DndProvider.js
function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for(i = 0; i < sourceSymbolKeys.length; i++){
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
    }
    return target;
}
function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}




let refCount = 0;
const INSTANCE_SYM = Symbol.for('__REACT_DND_CONTEXT_INSTANCE__');
var DndProvider = /*#__PURE__*/ (0,react.memo)(function DndProvider(_param) {
    var { children  } = _param, props = _objectWithoutProperties(_param, [
        "children"
    ]);
    const [manager, isGlobalInstance] = getDndContextValue(props) // memoized from props
    ;
    /**
		 * If the global context was used to store the DND context
		 * then where theres no more references to it we should
		 * clean it up to avoid memory leaks
		 */ (0,react.useEffect)(()=>{
        if (isGlobalInstance) {
            const context = getGlobalContext();
            ++refCount;
            return ()=>{
                if (--refCount === 0) {
                    context[INSTANCE_SYM] = null;
                }
            };
        }
        return;
    }, []);
    return /*#__PURE__*/ (0,jsx_runtime.jsx)(DndContext.Provider, {
        value: manager,
        children: children
    });
});
/**
 * A React component that provides the React-DnD context
 */ 
function getDndContextValue(props) {
    if ('manager' in props) {
        const manager = {
            dragDropManager: props.manager
        };
        return [
            manager,
            false
        ];
    }
    const manager = createSingletonDndContext(props.backend, props.context, props.options, props.debugMode);
    const isGlobalInstance = !props.context;
    return [
        manager,
        isGlobalInstance
    ];
}
function createSingletonDndContext(backend, context = getGlobalContext(), options, debugMode) {
    const ctx = context;
    if (!ctx[INSTANCE_SYM]) {
        ctx[INSTANCE_SYM] = {
            dragDropManager: (0,dist/* createDragDropManager */.b)(backend, context, options, debugMode)
        };
    }
    return ctx[INSTANCE_SYM];
}
function getGlobalContext() {
    return typeof window !== 'undefined' ? window : window;
}

//# sourceMappingURL=DndProvider.js.map
;// ./node_modules/react-dnd/dist/core/DragPreviewImage.js

/**
 * A utility for rendering a drag preview image
 */ const DragPreviewImage = (0,react.memo)(function DragPreviewImage({ connect , src  }) {
    (0,react.useEffect)(()=>{
        if (typeof Image === 'undefined') return;
        let connected = false;
        const img = new Image();
        img.src = src;
        img.onload = ()=>{
            connect(img);
            connected = true;
        };
        return ()=>{
            if (connected) {
                connect(null);
            }
        };
    });
    return null;
});

//# sourceMappingURL=DragPreviewImage.js.map
;// ./node_modules/react-dnd/dist/core/index.js




//# sourceMappingURL=index.js.map
;// ./node_modules/react-dnd/dist/hooks/types.js


//# sourceMappingURL=types.js.map
// EXTERNAL MODULE: ./node_modules/@react-dnd/invariant/dist/index.js
var invariant_dist = __webpack_require__(79396);
// EXTERNAL MODULE: ./node_modules/fast-deep-equal/index.js
var fast_deep_equal = __webpack_require__(32017);
;// ./node_modules/react-dnd/dist/hooks/useIsomorphicLayoutEffect.js

// suppress the useLayoutEffect warning on server side.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? react.useLayoutEffect : react.useEffect;

//# sourceMappingURL=useIsomorphicLayoutEffect.js.map
;// ./node_modules/react-dnd/dist/hooks/useCollector.js



/**
 *
 * @param monitor The monitor to collect state from
 * @param collect The collecting function
 * @param onUpdate A method to invoke when updates occur
 */ function useCollector_useCollector(monitor, collect, onUpdate) {
    const [collected, setCollected] = (0,react.useState)(()=>collect(monitor)
    );
    const updateCollected = (0,react.useCallback)(()=>{
        const nextValue = collect(monitor);
        // This needs to be a deep-equality check because some monitor-collected values
        // include XYCoord objects that may be equivalent, but do not have instance equality.
        if (!fast_deep_equal(collected, nextValue)) {
            setCollected(nextValue);
            if (onUpdate) {
                onUpdate();
            }
        }
    }, [
        collected,
        monitor,
        onUpdate
    ]);
    // update the collected properties after react renders.
    // Note that the "Dustbin Stress Test" fails if this is not
    // done when the component updates
    useIsomorphicLayoutEffect(updateCollected);
    return [
        collected,
        updateCollected
    ];
}

//# sourceMappingURL=useCollector.js.map
;// ./node_modules/react-dnd/dist/hooks/useMonitorOutput.js


function useMonitorOutput(monitor, collect, onCollect) {
    const [collected, updateCollected] = useCollector_useCollector(monitor, collect, onCollect);
    useIsomorphicLayoutEffect(function subscribeToMonitorStateChange() {
        const handlerId = monitor.getHandlerId();
        if (handlerId == null) {
            return;
        }
        return monitor.subscribeToStateChange(updateCollected, {
            handlerIds: [
                handlerId
            ]
        });
    }, [
        monitor,
        updateCollected
    ]);
    return collected;
}

//# sourceMappingURL=useMonitorOutput.js.map
;// ./node_modules/react-dnd/dist/hooks/useCollectedProps.js

function useCollectedProps(collector, monitor, connector) {
    return useMonitorOutput(monitor, collector || (()=>({})
    ), ()=>connector.reconnect()
    );
}

//# sourceMappingURL=useCollectedProps.js.map
;// ./node_modules/react-dnd/dist/hooks/useOptionalFactory.js

function useOptionalFactory(arg, deps) {
    const memoDeps = [
        ...deps || []
    ];
    if (deps == null && typeof arg !== 'function') {
        memoDeps.push(arg);
    }
    return (0,react.useMemo)(()=>{
        return typeof arg === 'function' ? arg() : arg;
    }, memoDeps);
}

//# sourceMappingURL=useOptionalFactory.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrag/connectors.js

function useConnectDragSource(connector) {
    return (0,react.useMemo)(()=>connector.hooks.dragSource()
    , [
        connector
    ]);
}
function useConnectDragPreview(connector) {
    return (0,react.useMemo)(()=>connector.hooks.dragPreview()
    , [
        connector
    ]);
}

//# sourceMappingURL=connectors.js.map
;// ./node_modules/react-dnd/dist/internals/DragSourceMonitorImpl.js

let isCallingCanDrag = false;
let isCallingIsDragging = false;
class DragSourceMonitorImpl {
    receiveHandlerId(sourceId) {
        this.sourceId = sourceId;
    }
    getHandlerId() {
        return this.sourceId;
    }
    canDrag() {
        (0,invariant_dist/* invariant */.V)(!isCallingCanDrag, 'You may not call monitor.canDrag() inside your canDrag() implementation. ' + 'Read more: http://react-dnd.github.io/react-dnd/docs/api/drag-source-monitor');
        try {
            isCallingCanDrag = true;
            return this.internalMonitor.canDragSource(this.sourceId);
        } finally{
            isCallingCanDrag = false;
        }
    }
    isDragging() {
        if (!this.sourceId) {
            return false;
        }
        (0,invariant_dist/* invariant */.V)(!isCallingIsDragging, 'You may not call monitor.isDragging() inside your isDragging() implementation. ' + 'Read more: http://react-dnd.github.io/react-dnd/docs/api/drag-source-monitor');
        try {
            isCallingIsDragging = true;
            return this.internalMonitor.isDraggingSource(this.sourceId);
        } finally{
            isCallingIsDragging = false;
        }
    }
    subscribeToStateChange(listener, options) {
        return this.internalMonitor.subscribeToStateChange(listener, options);
    }
    isDraggingSource(sourceId) {
        return this.internalMonitor.isDraggingSource(sourceId);
    }
    isOverTarget(targetId, options) {
        return this.internalMonitor.isOverTarget(targetId, options);
    }
    getTargetIds() {
        return this.internalMonitor.getTargetIds();
    }
    isSourcePublic() {
        return this.internalMonitor.isSourcePublic();
    }
    getSourceId() {
        return this.internalMonitor.getSourceId();
    }
    subscribeToOffsetChange(listener) {
        return this.internalMonitor.subscribeToOffsetChange(listener);
    }
    canDragSource(sourceId) {
        return this.internalMonitor.canDragSource(sourceId);
    }
    canDropOnTarget(targetId) {
        return this.internalMonitor.canDropOnTarget(targetId);
    }
    getItemType() {
        return this.internalMonitor.getItemType();
    }
    getItem() {
        return this.internalMonitor.getItem();
    }
    getDropResult() {
        return this.internalMonitor.getDropResult();
    }
    didDrop() {
        return this.internalMonitor.didDrop();
    }
    getInitialClientOffset() {
        return this.internalMonitor.getInitialClientOffset();
    }
    getInitialSourceClientOffset() {
        return this.internalMonitor.getInitialSourceClientOffset();
    }
    getSourceClientOffset() {
        return this.internalMonitor.getSourceClientOffset();
    }
    getClientOffset() {
        return this.internalMonitor.getClientOffset();
    }
    getDifferenceFromInitialOffset() {
        return this.internalMonitor.getDifferenceFromInitialOffset();
    }
    constructor(manager){
        this.sourceId = null;
        this.internalMonitor = manager.getMonitor();
    }
}

//# sourceMappingURL=DragSourceMonitorImpl.js.map
;// ./node_modules/react-dnd/dist/internals/DropTargetMonitorImpl.js

let isCallingCanDrop = false;
class DropTargetMonitorImpl {
    receiveHandlerId(targetId) {
        this.targetId = targetId;
    }
    getHandlerId() {
        return this.targetId;
    }
    subscribeToStateChange(listener, options) {
        return this.internalMonitor.subscribeToStateChange(listener, options);
    }
    canDrop() {
        // Cut out early if the target id has not been set. This should prevent errors
        // where the user has an older version of dnd-core like in
        // https://github.com/react-dnd/react-dnd/issues/1310
        if (!this.targetId) {
            return false;
        }
        (0,invariant_dist/* invariant */.V)(!isCallingCanDrop, 'You may not call monitor.canDrop() inside your canDrop() implementation. ' + 'Read more: http://react-dnd.github.io/react-dnd/docs/api/drop-target-monitor');
        try {
            isCallingCanDrop = true;
            return this.internalMonitor.canDropOnTarget(this.targetId);
        } finally{
            isCallingCanDrop = false;
        }
    }
    isOver(options) {
        if (!this.targetId) {
            return false;
        }
        return this.internalMonitor.isOverTarget(this.targetId, options);
    }
    getItemType() {
        return this.internalMonitor.getItemType();
    }
    getItem() {
        return this.internalMonitor.getItem();
    }
    getDropResult() {
        return this.internalMonitor.getDropResult();
    }
    didDrop() {
        return this.internalMonitor.didDrop();
    }
    getInitialClientOffset() {
        return this.internalMonitor.getInitialClientOffset();
    }
    getInitialSourceClientOffset() {
        return this.internalMonitor.getInitialSourceClientOffset();
    }
    getSourceClientOffset() {
        return this.internalMonitor.getSourceClientOffset();
    }
    getClientOffset() {
        return this.internalMonitor.getClientOffset();
    }
    getDifferenceFromInitialOffset() {
        return this.internalMonitor.getDifferenceFromInitialOffset();
    }
    constructor(manager){
        this.targetId = null;
        this.internalMonitor = manager.getMonitor();
    }
}

//# sourceMappingURL=DropTargetMonitorImpl.js.map
;// ./node_modules/react-dnd/dist/internals/registration.js
function registerTarget(type, target, manager) {
    const registry = manager.getRegistry();
    const targetId = registry.addTarget(type, target);
    return [
        targetId,
        ()=>registry.removeTarget(targetId)
    ];
}
function registerSource(type, source, manager) {
    const registry = manager.getRegistry();
    const sourceId = registry.addSource(type, source);
    return [
        sourceId,
        ()=>registry.removeSource(sourceId)
    ];
}

//# sourceMappingURL=registration.js.map
;// ./node_modules/@react-dnd/shallowequal/dist/index.js
function shallowEqual(objA, objB, compare, compareContext) {
    let compareResult = compare ? compare.call(compareContext, objA, objB) : void 0;
    if (compareResult !== void 0) {
        return !!compareResult;
    }
    if (objA === objB) {
        return true;
    }
    if (typeof objA !== 'object' || !objA || typeof objB !== 'object' || !objB) {
        return false;
    }
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) {
        return false;
    }
    const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
    // Test for A's keys different from B.
    for(let idx = 0; idx < keysA.length; idx++){
        const key = keysA[idx];
        if (!bHasOwnProperty(key)) {
            return false;
        }
        const valueA = objA[key];
        const valueB = objB[key];
        compareResult = compare ? compare.call(compareContext, valueA, valueB, key) : void 0;
        if (compareResult === false || compareResult === void 0 && valueA !== valueB) {
            return false;
        }
    }
    return true;
}

//# sourceMappingURL=index.js.map
;// ./node_modules/react-dnd/dist/internals/isRef.js
function isRef(obj) {
    return(// eslint-disable-next-line no-prototype-builtins
    obj !== null && typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, 'current'));
}

//# sourceMappingURL=isRef.js.map
;// ./node_modules/react-dnd/dist/internals/wrapConnectorHooks.js


function throwIfCompositeComponentElement(element) {
    // Custom components can no longer be wrapped directly in React DnD 2.0
    // so that we don't need to depend on findDOMNode() from react-dom.
    if (typeof element.type === 'string') {
        return;
    }
    const displayName = element.type.displayName || element.type.name || 'the component';
    throw new Error('Only native element nodes can now be passed to React DnD connectors.' + `You can either wrap ${displayName} into a <div>, or turn it into a ` + 'drag source or a drop target itself.');
}
function wrapHookToRecognizeElement(hook) {
    return (elementOrNode = null, options = null)=>{
        // When passed a node, call the hook straight away.
        if (!(0,react.isValidElement)(elementOrNode)) {
            const node = elementOrNode;
            hook(node, options);
            // return the node so it can be chained (e.g. when within callback refs
            // <div ref={node => connectDragSource(connectDropTarget(node))}/>
            return node;
        }
        // If passed a ReactElement, clone it and attach this function as a ref.
        // This helps us achieve a neat API where user doesn't even know that refs
        // are being used under the hood.
        const element = elementOrNode;
        throwIfCompositeComponentElement(element);
        // When no options are passed, use the hook directly
        const ref = options ? (node)=>hook(node, options)
         : hook;
        return cloneWithRef(element, ref);
    };
}
function wrapConnectorHooks(hooks) {
    const wrappedHooks = {};
    Object.keys(hooks).forEach((key)=>{
        const hook = hooks[key];
        // ref objects should be passed straight through without wrapping
        if (key.endsWith('Ref')) {
            wrappedHooks[key] = hooks[key];
        } else {
            const wrappedHook = wrapHookToRecognizeElement(hook);
            wrappedHooks[key] = ()=>wrappedHook
            ;
        }
    });
    return wrappedHooks;
}
function setRef(ref, node) {
    if (typeof ref === 'function') {
        ref(node);
    } else {
        ref.current = node;
    }
}
function cloneWithRef(element, newRef) {
    const previousRef = element.ref;
    (0,invariant_dist/* invariant */.V)(typeof previousRef !== 'string', 'Cannot connect React DnD to an element with an existing string ref. ' + 'Please convert it to use a callback ref instead, or wrap it into a <span> or <div>. ' + 'Read more: https://reactjs.org/docs/refs-and-the-dom.html#callback-refs');
    if (!previousRef) {
        // When there is no ref on the element, use the new ref directly
        return (0,react.cloneElement)(element, {
            ref: newRef
        });
    } else {
        return (0,react.cloneElement)(element, {
            ref: (node)=>{
                setRef(previousRef, node);
                setRef(newRef, node);
            }
        });
    }
}

//# sourceMappingURL=wrapConnectorHooks.js.map
;// ./node_modules/react-dnd/dist/internals/SourceConnector.js



class SourceConnector {
    receiveHandlerId(newHandlerId) {
        if (this.handlerId === newHandlerId) {
            return;
        }
        this.handlerId = newHandlerId;
        this.reconnect();
    }
    get connectTarget() {
        return this.dragSource;
    }
    get dragSourceOptions() {
        return this.dragSourceOptionsInternal;
    }
    set dragSourceOptions(options) {
        this.dragSourceOptionsInternal = options;
    }
    get dragPreviewOptions() {
        return this.dragPreviewOptionsInternal;
    }
    set dragPreviewOptions(options) {
        this.dragPreviewOptionsInternal = options;
    }
    reconnect() {
        const didChange = this.reconnectDragSource();
        this.reconnectDragPreview(didChange);
    }
    reconnectDragSource() {
        const dragSource = this.dragSource;
        // if nothing has changed then don't resubscribe
        const didChange = this.didHandlerIdChange() || this.didConnectedDragSourceChange() || this.didDragSourceOptionsChange();
        if (didChange) {
            this.disconnectDragSource();
        }
        if (!this.handlerId) {
            return didChange;
        }
        if (!dragSource) {
            this.lastConnectedDragSource = dragSource;
            return didChange;
        }
        if (didChange) {
            this.lastConnectedHandlerId = this.handlerId;
            this.lastConnectedDragSource = dragSource;
            this.lastConnectedDragSourceOptions = this.dragSourceOptions;
            this.dragSourceUnsubscribe = this.backend.connectDragSource(this.handlerId, dragSource, this.dragSourceOptions);
        }
        return didChange;
    }
    reconnectDragPreview(forceDidChange = false) {
        const dragPreview = this.dragPreview;
        // if nothing has changed then don't resubscribe
        const didChange = forceDidChange || this.didHandlerIdChange() || this.didConnectedDragPreviewChange() || this.didDragPreviewOptionsChange();
        if (didChange) {
            this.disconnectDragPreview();
        }
        if (!this.handlerId) {
            return;
        }
        if (!dragPreview) {
            this.lastConnectedDragPreview = dragPreview;
            return;
        }
        if (didChange) {
            this.lastConnectedHandlerId = this.handlerId;
            this.lastConnectedDragPreview = dragPreview;
            this.lastConnectedDragPreviewOptions = this.dragPreviewOptions;
            this.dragPreviewUnsubscribe = this.backend.connectDragPreview(this.handlerId, dragPreview, this.dragPreviewOptions);
        }
    }
    didHandlerIdChange() {
        return this.lastConnectedHandlerId !== this.handlerId;
    }
    didConnectedDragSourceChange() {
        return this.lastConnectedDragSource !== this.dragSource;
    }
    didConnectedDragPreviewChange() {
        return this.lastConnectedDragPreview !== this.dragPreview;
    }
    didDragSourceOptionsChange() {
        return !shallowEqual(this.lastConnectedDragSourceOptions, this.dragSourceOptions);
    }
    didDragPreviewOptionsChange() {
        return !shallowEqual(this.lastConnectedDragPreviewOptions, this.dragPreviewOptions);
    }
    disconnectDragSource() {
        if (this.dragSourceUnsubscribe) {
            this.dragSourceUnsubscribe();
            this.dragSourceUnsubscribe = undefined;
        }
    }
    disconnectDragPreview() {
        if (this.dragPreviewUnsubscribe) {
            this.dragPreviewUnsubscribe();
            this.dragPreviewUnsubscribe = undefined;
            this.dragPreviewNode = null;
            this.dragPreviewRef = null;
        }
    }
    get dragSource() {
        return this.dragSourceNode || this.dragSourceRef && this.dragSourceRef.current;
    }
    get dragPreview() {
        return this.dragPreviewNode || this.dragPreviewRef && this.dragPreviewRef.current;
    }
    clearDragSource() {
        this.dragSourceNode = null;
        this.dragSourceRef = null;
    }
    clearDragPreview() {
        this.dragPreviewNode = null;
        this.dragPreviewRef = null;
    }
    constructor(backend){
        this.hooks = wrapConnectorHooks({
            dragSource: (node, options)=>{
                this.clearDragSource();
                this.dragSourceOptions = options || null;
                if (isRef(node)) {
                    this.dragSourceRef = node;
                } else {
                    this.dragSourceNode = node;
                }
                this.reconnectDragSource();
            },
            dragPreview: (node, options)=>{
                this.clearDragPreview();
                this.dragPreviewOptions = options || null;
                if (isRef(node)) {
                    this.dragPreviewRef = node;
                } else {
                    this.dragPreviewNode = node;
                }
                this.reconnectDragPreview();
            }
        });
        this.handlerId = null;
        // The drop target may either be attached via ref or connect function
        this.dragSourceRef = null;
        this.dragSourceOptionsInternal = null;
        // The drag preview may either be attached via ref or connect function
        this.dragPreviewRef = null;
        this.dragPreviewOptionsInternal = null;
        this.lastConnectedHandlerId = null;
        this.lastConnectedDragSource = null;
        this.lastConnectedDragSourceOptions = null;
        this.lastConnectedDragPreview = null;
        this.lastConnectedDragPreviewOptions = null;
        this.backend = backend;
    }
}

//# sourceMappingURL=SourceConnector.js.map
;// ./node_modules/react-dnd/dist/internals/TargetConnector.js



class TargetConnector {
    get connectTarget() {
        return this.dropTarget;
    }
    reconnect() {
        // if nothing has changed then don't resubscribe
        const didChange = this.didHandlerIdChange() || this.didDropTargetChange() || this.didOptionsChange();
        if (didChange) {
            this.disconnectDropTarget();
        }
        const dropTarget = this.dropTarget;
        if (!this.handlerId) {
            return;
        }
        if (!dropTarget) {
            this.lastConnectedDropTarget = dropTarget;
            return;
        }
        if (didChange) {
            this.lastConnectedHandlerId = this.handlerId;
            this.lastConnectedDropTarget = dropTarget;
            this.lastConnectedDropTargetOptions = this.dropTargetOptions;
            this.unsubscribeDropTarget = this.backend.connectDropTarget(this.handlerId, dropTarget, this.dropTargetOptions);
        }
    }
    receiveHandlerId(newHandlerId) {
        if (newHandlerId === this.handlerId) {
            return;
        }
        this.handlerId = newHandlerId;
        this.reconnect();
    }
    get dropTargetOptions() {
        return this.dropTargetOptionsInternal;
    }
    set dropTargetOptions(options) {
        this.dropTargetOptionsInternal = options;
    }
    didHandlerIdChange() {
        return this.lastConnectedHandlerId !== this.handlerId;
    }
    didDropTargetChange() {
        return this.lastConnectedDropTarget !== this.dropTarget;
    }
    didOptionsChange() {
        return !shallowEqual(this.lastConnectedDropTargetOptions, this.dropTargetOptions);
    }
    disconnectDropTarget() {
        if (this.unsubscribeDropTarget) {
            this.unsubscribeDropTarget();
            this.unsubscribeDropTarget = undefined;
        }
    }
    get dropTarget() {
        return this.dropTargetNode || this.dropTargetRef && this.dropTargetRef.current;
    }
    clearDropTarget() {
        this.dropTargetRef = null;
        this.dropTargetNode = null;
    }
    constructor(backend){
        this.hooks = wrapConnectorHooks({
            dropTarget: (node, options)=>{
                this.clearDropTarget();
                this.dropTargetOptions = options;
                if (isRef(node)) {
                    this.dropTargetRef = node;
                } else {
                    this.dropTargetNode = node;
                }
                this.reconnect();
            }
        });
        this.handlerId = null;
        // The drop target may either be attached via ref or connect function
        this.dropTargetRef = null;
        this.dropTargetOptionsInternal = null;
        this.lastConnectedHandlerId = null;
        this.lastConnectedDropTarget = null;
        this.lastConnectedDropTargetOptions = null;
        this.backend = backend;
    }
}

//# sourceMappingURL=TargetConnector.js.map
;// ./node_modules/react-dnd/dist/internals/index.js






//# sourceMappingURL=index.js.map
;// ./node_modules/react-dnd/dist/hooks/useDragDropManager.js



/**
 * A hook to retrieve the DragDropManager from Context
 */ function useDragDropManager_useDragDropManager() {
    const { dragDropManager  } = (0,react.useContext)(DndContext);
    (0,invariant_dist/* invariant */.V)(dragDropManager != null, 'Expected drag drop context');
    return dragDropManager;
}

//# sourceMappingURL=useDragDropManager.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrag/useDragSourceConnector.js




function useDragSourceConnector(dragSourceOptions, dragPreviewOptions) {
    const manager = useDragDropManager_useDragDropManager();
    const connector = (0,react.useMemo)(()=>new SourceConnector(manager.getBackend())
    , [
        manager
    ]);
    useIsomorphicLayoutEffect(()=>{
        connector.dragSourceOptions = dragSourceOptions || null;
        connector.reconnect();
        return ()=>connector.disconnectDragSource()
        ;
    }, [
        connector,
        dragSourceOptions
    ]);
    useIsomorphicLayoutEffect(()=>{
        connector.dragPreviewOptions = dragPreviewOptions || null;
        connector.reconnect();
        return ()=>connector.disconnectDragPreview()
        ;
    }, [
        connector,
        dragPreviewOptions
    ]);
    return connector;
}

//# sourceMappingURL=useDragSourceConnector.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrag/useDragSourceMonitor.js



function useDragSourceMonitor() {
    const manager = useDragDropManager_useDragDropManager();
    return (0,react.useMemo)(()=>new DragSourceMonitorImpl(manager)
    , [
        manager
    ]);
}

//# sourceMappingURL=useDragSourceMonitor.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrag/DragSourceImpl.js
class DragSourceImpl {
    beginDrag() {
        const spec = this.spec;
        const monitor = this.monitor;
        let result = null;
        if (typeof spec.item === 'object') {
            result = spec.item;
        } else if (typeof spec.item === 'function') {
            result = spec.item(monitor);
        } else {
            result = {};
        }
        return result !== null && result !== void 0 ? result : null;
    }
    canDrag() {
        const spec = this.spec;
        const monitor = this.monitor;
        if (typeof spec.canDrag === 'boolean') {
            return spec.canDrag;
        } else if (typeof spec.canDrag === 'function') {
            return spec.canDrag(monitor);
        } else {
            return true;
        }
    }
    isDragging(globalMonitor, target) {
        const spec = this.spec;
        const monitor = this.monitor;
        const { isDragging  } = spec;
        return isDragging ? isDragging(monitor) : target === globalMonitor.getSourceId();
    }
    endDrag() {
        const spec = this.spec;
        const monitor = this.monitor;
        const connector = this.connector;
        const { end  } = spec;
        if (end) {
            end(monitor.getItem(), monitor);
        }
        connector.reconnect();
    }
    constructor(spec, monitor, connector){
        this.spec = spec;
        this.monitor = monitor;
        this.connector = connector;
    }
}

//# sourceMappingURL=DragSourceImpl.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrag/useDragSource.js


function useDragSource(spec, monitor, connector) {
    const handler = (0,react.useMemo)(()=>new DragSourceImpl(spec, monitor, connector)
    , [
        monitor,
        connector
    ]);
    (0,react.useEffect)(()=>{
        handler.spec = spec;
    }, [
        spec
    ]);
    return handler;
}

//# sourceMappingURL=useDragSource.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrag/useDragType.js


function useDragType(spec) {
    return (0,react.useMemo)(()=>{
        const result = spec.type;
        (0,invariant_dist/* invariant */.V)(result != null, 'spec.type must be defined');
        return result;
    }, [
        spec
    ]);
}

//# sourceMappingURL=useDragType.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrag/useRegisteredDragSource.js





function useRegisteredDragSource(spec, monitor, connector) {
    const manager = useDragDropManager_useDragDropManager();
    const handler = useDragSource(spec, monitor, connector);
    const itemType = useDragType(spec);
    useIsomorphicLayoutEffect(function registerDragSource() {
        if (itemType != null) {
            const [handlerId, unregister] = registerSource(itemType, handler, manager);
            monitor.receiveHandlerId(handlerId);
            connector.receiveHandlerId(handlerId);
            return unregister;
        }
        return;
    }, [
        manager,
        monitor,
        connector,
        handler,
        itemType
    ]);
}

//# sourceMappingURL=useRegisteredDragSource.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrag/useDrag.js







/**
 * useDragSource hook
 * @param sourceSpec The drag source specification (object or function, function preferred)
 * @param deps The memoization deps array to use when evaluating spec changes
 */ function useDrag(specArg, deps) {
    const spec = useOptionalFactory(specArg, deps);
    (0,invariant_dist/* invariant */.V)(!spec.begin, `useDrag::spec.begin was deprecated in v14. Replace spec.begin() with spec.item(). (see more here - https://react-dnd.github.io/react-dnd/docs/api/use-drag)`);
    const monitor = useDragSourceMonitor();
    const connector = useDragSourceConnector(spec.options, spec.previewOptions);
    useRegisteredDragSource(spec, monitor, connector);
    return [
        useCollectedProps(spec.collect, monitor, connector),
        useConnectDragSource(connector),
        useConnectDragPreview(connector), 
    ];
}

//# sourceMappingURL=useDrag.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrag/index.js


//# sourceMappingURL=index.js.map
;// ./node_modules/react-dnd/dist/hooks/useDragLayer.js



/**
 * useDragLayer Hook
 * @param collector The property collector
 */ function useDragLayer(collect) {
    const dragDropManager = useDragDropManager();
    const monitor = dragDropManager.getMonitor();
    const [collected, updateCollected] = useCollector(monitor, collect);
    useEffect(()=>monitor.subscribeToOffsetChange(updateCollected)
    );
    useEffect(()=>monitor.subscribeToStateChange(updateCollected)
    );
    return collected;
}

//# sourceMappingURL=useDragLayer.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrop/connectors.js

function useConnectDropTarget(connector) {
    return (0,react.useMemo)(()=>connector.hooks.dropTarget()
    , [
        connector
    ]);
}

//# sourceMappingURL=connectors.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrop/useDropTargetConnector.js




function useDropTargetConnector(options) {
    const manager = useDragDropManager_useDragDropManager();
    const connector = (0,react.useMemo)(()=>new TargetConnector(manager.getBackend())
    , [
        manager
    ]);
    useIsomorphicLayoutEffect(()=>{
        connector.dropTargetOptions = options || null;
        connector.reconnect();
        return ()=>connector.disconnectDropTarget()
        ;
    }, [
        options
    ]);
    return connector;
}

//# sourceMappingURL=useDropTargetConnector.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrop/useDropTargetMonitor.js



function useDropTargetMonitor() {
    const manager = useDragDropManager_useDragDropManager();
    return (0,react.useMemo)(()=>new DropTargetMonitorImpl(manager)
    , [
        manager
    ]);
}

//# sourceMappingURL=useDropTargetMonitor.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrop/useAccept.js


/**
 * Internal utility hook to get an array-version of spec.accept.
 * The main utility here is that we aren't creating a new array on every render if a non-array spec.accept is passed in.
 * @param spec
 */ function useAccept(spec) {
    const { accept  } = spec;
    return (0,react.useMemo)(()=>{
        (0,invariant_dist/* invariant */.V)(spec.accept != null, 'accept must be defined');
        return Array.isArray(accept) ? accept : [
            accept
        ];
    }, [
        accept
    ]);
}

//# sourceMappingURL=useAccept.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrop/DropTargetImpl.js
class DropTargetImpl {
    canDrop() {
        const spec = this.spec;
        const monitor = this.monitor;
        return spec.canDrop ? spec.canDrop(monitor.getItem(), monitor) : true;
    }
    hover() {
        const spec = this.spec;
        const monitor = this.monitor;
        if (spec.hover) {
            spec.hover(monitor.getItem(), monitor);
        }
    }
    drop() {
        const spec = this.spec;
        const monitor = this.monitor;
        if (spec.drop) {
            return spec.drop(monitor.getItem(), monitor);
        }
        return;
    }
    constructor(spec, monitor){
        this.spec = spec;
        this.monitor = monitor;
    }
}

//# sourceMappingURL=DropTargetImpl.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrop/useDropTarget.js


function useDropTarget(spec, monitor) {
    const dropTarget = (0,react.useMemo)(()=>new DropTargetImpl(spec, monitor)
    , [
        monitor
    ]);
    (0,react.useEffect)(()=>{
        dropTarget.spec = spec;
    }, [
        spec
    ]);
    return dropTarget;
}

//# sourceMappingURL=useDropTarget.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrop/useRegisteredDropTarget.js





function useRegisteredDropTarget(spec, monitor, connector) {
    const manager = useDragDropManager_useDragDropManager();
    const dropTarget = useDropTarget(spec, monitor);
    const accept = useAccept(spec);
    useIsomorphicLayoutEffect(function registerDropTarget() {
        const [handlerId, unregister] = registerTarget(accept, dropTarget, manager);
        monitor.receiveHandlerId(handlerId);
        connector.receiveHandlerId(handlerId);
        return unregister;
    }, [
        manager,
        monitor,
        dropTarget,
        connector,
        accept.map((a)=>a.toString()
        ).join('|'), 
    ]);
}

//# sourceMappingURL=useRegisteredDropTarget.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrop/useDrop.js






/**
 * useDropTarget Hook
 * @param spec The drop target specification (object or function, function preferred)
 * @param deps The memoization deps array to use when evaluating spec changes
 */ function useDrop(specArg, deps) {
    const spec = useOptionalFactory(specArg, deps);
    const monitor = useDropTargetMonitor();
    const connector = useDropTargetConnector(spec.options);
    useRegisteredDropTarget(spec, monitor, connector);
    return [
        useCollectedProps(spec.collect, monitor, connector),
        useConnectDropTarget(connector), 
    ];
}

//# sourceMappingURL=useDrop.js.map
;// ./node_modules/react-dnd/dist/hooks/useDrop/index.js


//# sourceMappingURL=index.js.map
;// ./node_modules/react-dnd/dist/hooks/index.js






//# sourceMappingURL=index.js.map
;// ./node_modules/react-dnd/dist/types/connectors.js


//# sourceMappingURL=connectors.js.map
;// ./node_modules/react-dnd/dist/types/monitors.js


//# sourceMappingURL=monitors.js.map
;// ./node_modules/react-dnd/dist/types/options.js


//# sourceMappingURL=options.js.map
;// ./node_modules/react-dnd/dist/types/index.js




//# sourceMappingURL=index.js.map
;// ./node_modules/react-dnd/dist/index.js




//# sourceMappingURL=index.js.map

/***/ }),

/***/ 72706:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Id: () => (/* reexport */ asap)
});

// UNUSED EXPORTS: AsapQueue, TaskFactory

;// ./node_modules/@react-dnd/asap/dist/makeRequestCall.js
// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` or `self` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.
/* globals self */ const scope = typeof window !== 'undefined' ? window : self;
const BrowserMutationObserver = scope.MutationObserver || scope.WebKitMutationObserver;
function makeRequestCallFromTimer(callback) {
    return function requestCall() {
        // We dispatch a timeout with a specified delay of 0 for engines that
        // can reliably accommodate that request. This will usually be snapped
        // to a 4 milisecond delay, but once we're flushing, there's no delay
        // between events.
        const timeoutHandle = setTimeout(handleTimer, 0);
        // However, since this timer gets frequently dropped in Firefox
        // workers, we enlist an interval handle that will try to fire
        // an event 20 times per second until it succeeds.
        const intervalHandle = setInterval(handleTimer, 50);
        function handleTimer() {
            // Whichever timer succeeds will cancel both timers and
            // execute the callback.
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    };
}
// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
function makeRequestCallFromMutationObserver(callback) {
    let toggle = 1;
    const observer = new BrowserMutationObserver(callback);
    const node = document.createTextNode('');
    observer.observe(node, {
        characterData: true
    });
    return function requestCall() {
        toggle = -toggle;
        node.data = toggle;
    };
}
const makeRequestCall = typeof BrowserMutationObserver === 'function' ? // reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
makeRequestCallFromMutationObserver : // task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.
// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396
// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
makeRequestCallFromTimer;

//# sourceMappingURL=makeRequestCall.js.map
;// ./node_modules/@react-dnd/asap/dist/AsapQueue.js
/* eslint-disable no-restricted-globals, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */ 
class AsapQueue {
    // Use the fastest means possible to execute a task in its own turn, with
    // priority over other events including IO, animation, reflow, and redraw
    // events in browsers.
    //
    // An exception thrown by a task will permanently interrupt the processing of
    // subsequent tasks. The higher level `asap` function ensures that if an
    // exception is thrown by a task, that the task queue will continue flushing as
    // soon as possible, but if you use `rawAsap` directly, you are responsible to
    // either ensure that no exceptions are thrown from your task, or to manually
    // call `rawAsap.requestFlush` if an exception is thrown.
    enqueueTask(task) {
        const { queue: q , requestFlush  } = this;
        if (!q.length) {
            requestFlush();
            this.flushing = true;
        }
        // Equivalent to push, but avoids a function call.
        q[q.length] = task;
    }
    constructor(){
        this.queue = [];
        // We queue errors to ensure they are thrown in right order (FIFO).
        // Array-as-queue is good enough here, since we are just dealing with exceptions.
        this.pendingErrors = [];
        // Once a flush has been requested, no further calls to `requestFlush` are
        // necessary until the next `flush` completes.
        // @ts-ignore
        this.flushing = false;
        // The position of the next task to execute in the task queue. This is
        // preserved between calls to `flush` so that it can be resumed if
        // a task throws an exception.
        this.index = 0;
        // If a task schedules additional tasks recursively, the task queue can grow
        // unbounded. To prevent memory exhaustion, the task queue will periodically
        // truncate already-completed tasks.
        this.capacity = 1024;
        // The flush function processes all tasks that have been scheduled with
        // `rawAsap` unless and until one of those tasks throws an exception.
        // If a task throws an exception, `flush` ensures that its state will remain
        // consistent and will resume where it left off when called again.
        // However, `flush` does not make any arrangements to be called again if an
        // exception is thrown.
        this.flush = ()=>{
            const { queue: q  } = this;
            while(this.index < q.length){
                const currentIndex = this.index;
                // Advance the index before calling the task. This ensures that we will
                // begin flushing on the next task the task throws an error.
                this.index++;
                q[currentIndex].call();
                // Prevent leaking memory for long chains of recursive calls to `asap`.
                // If we call `asap` within tasks scheduled by `asap`, the queue will
                // grow, but to avoid an O(n) walk for every task we execute, we don't
                // shift tasks off the queue after they have been executed.
                // Instead, we periodically shift 1024 tasks off the queue.
                if (this.index > this.capacity) {
                    // Manually shift all values starting at the index back to the
                    // beginning of the queue.
                    for(let scan = 0, newLength = q.length - this.index; scan < newLength; scan++){
                        q[scan] = q[scan + this.index];
                    }
                    q.length -= this.index;
                    this.index = 0;
                }
            }
            q.length = 0;
            this.index = 0;
            this.flushing = false;
        };
        // In a web browser, exceptions are not fatal. However, to avoid
        // slowing down the queue of pending tasks, we rethrow the error in a
        // lower priority turn.
        this.registerPendingError = (err)=>{
            this.pendingErrors.push(err);
            this.requestErrorThrow();
        };
        // `requestFlush` requests that the high priority event queue be flushed as
        // soon as possible.
        // This is useful to prevent an error thrown in a task from stalling the event
        // queue if the exception handled by Node.js’s
        // `process.on("uncaughtException")` or by a domain.
        // `requestFlush` is implemented using a strategy based on data collected from
        // every available SauceLabs Selenium web driver worker at time of writing.
        // https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593
        this.requestFlush = makeRequestCall(this.flush);
        this.requestErrorThrow = makeRequestCallFromTimer(()=>{
            // Throw first error
            if (this.pendingErrors.length) {
                throw this.pendingErrors.shift();
            }
        });
    }
} // The message channel technique was discovered by Malte Ubl and was the
 // original foundation for this library.
 // http://www.nonblocking.io/2011/06/windownexttick.html
 // Safari 6.0.5 (at least) intermittently fails to create message ports on a
 // page's first load. Thankfully, this version of Safari supports
 // MutationObservers, so we don't need to fall back in that case.
 // function makeRequestCallFromMessageChannel(callback) {
 //     var channel = new MessageChannel();
 //     channel.port1.onmessage = callback;
 //     return function requestCall() {
 //         channel.port2.postMessage(0);
 //     };
 // }
 // For reasons explained above, we are also unable to use `setImmediate`
 // under any circumstances.
 // Even if we were, there is another bug in Internet Explorer 10.
 // It is not sufficient to assign `setImmediate` to `requestFlush` because
 // `setImmediate` must be called *by name* and therefore must be wrapped in a
 // closure.
 // Never forget.
 // function makeRequestCallFromSetImmediate(callback) {
 //     return function requestCall() {
 //         setImmediate(callback);
 //     };
 // }
 // Safari 6.0 has a problem where timers will get lost while the user is
 // scrolling. This problem does not impact ASAP because Safari 6.0 supports
 // mutation observers, so that implementation is used instead.
 // However, if we ever elect to use timers in Safari, the prevalent work-around
 // is to add a scroll event listener that calls for a flush.
 // `setTimeout` does not call the passed callback if the delay is less than
 // approximately 7 in web workers in Firefox 8 through 18, and sometimes not
 // even then.
 // This is for `asap.js` only.
 // Its name will be periodically randomized to break any code that depends on
 // // its existence.
 // rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer
 // ASAP was originally a nextTick shim included in Q. This was factored out
 // into this ASAP package. It was later adapted to RSVP which made further
 // amendments. These decisions, particularly to marginalize MessageChannel and
 // to capture the MutationObserver implementation in a closure, were integrated
 // back into ASAP proper.
 // https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js

//# sourceMappingURL=AsapQueue.js.map
;// ./node_modules/@react-dnd/asap/dist/RawTask.js
// `call`, just like a function.
class RawTask {
    call() {
        try {
            this.task && this.task();
        } catch (error) {
            this.onError(error);
        } finally{
            this.task = null;
            this.release(this);
        }
    }
    constructor(onError, release){
        this.onError = onError;
        this.release = release;
        this.task = null;
    }
}

//# sourceMappingURL=RawTask.js.map
;// ./node_modules/@react-dnd/asap/dist/TaskFactory.js

class TaskFactory {
    create(task) {
        const tasks = this.freeTasks;
        const t1 = tasks.length ? tasks.pop() : new RawTask(this.onError, (t)=>tasks[tasks.length] = t
        );
        t1.task = task;
        return t1;
    }
    constructor(onError){
        this.onError = onError;
        this.freeTasks = [];
    }
}

//# sourceMappingURL=TaskFactory.js.map
;// ./node_modules/@react-dnd/asap/dist/asap.js


const asapQueue = new AsapQueue();
const taskFactory = new TaskFactory(asapQueue.registerPendingError);
/**
 * Calls a task as soon as possible after returning, in its own event, with priority
 * over other events like animation, reflow, and repaint. An error thrown from an
 * event will not interrupt, nor even substantially slow down the processing of
 * other events, but will be rather postponed to a lower priority event.
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */ function asap(task) {
    asapQueue.enqueueTask(taskFactory.create(task));
}

//# sourceMappingURL=asap.js.map
;// ./node_modules/@react-dnd/asap/dist/types.js


//# sourceMappingURL=types.js.map
;// ./node_modules/@react-dnd/asap/dist/index.js





//# sourceMappingURL=index.js.map

/***/ }),

/***/ 79396:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   V: () => (/* binding */ invariant)
/* harmony export */ });
/* provided dependency */ var process = __webpack_require__(7293);
/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */ function invariant(condition, format, ...args) {
    if (isProduction()) {
        if (format === undefined) {
            throw new Error('invariant requires an error message argument');
        }
    }
    if (!condition) {
        let error;
        if (format === undefined) {
            error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
        } else {
            let argIndex = 0;
            error = new Error(format.replace(/%s/g, function() {
                return args[argIndex++];
            }));
            error.name = 'Invariant Violation';
        }
        error.framesToPop = 1 // we don't care about invariant's own frame
        ;
        throw error;
    }
}
function isProduction() {
    return typeof process !== 'undefined' && "development" === 'production';
}

//# sourceMappingURL=index.js.map

/***/ }),

/***/ 98413:
/***/ ((__unused_webpack_module, exports) => {

var __webpack_unused_export__;
/**
 * @license React
 * react-is.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


 true &&
  (function () {
    function typeOf(object) {
      if ("object" === typeof object && null !== object) {
        var $$typeof = object.$$typeof;
        switch ($$typeof) {
          case REACT_ELEMENT_TYPE:
            switch (((object = object.type), object)) {
              case REACT_FRAGMENT_TYPE:
              case REACT_PROFILER_TYPE:
              case REACT_STRICT_MODE_TYPE:
              case REACT_SUSPENSE_TYPE:
              case REACT_SUSPENSE_LIST_TYPE:
              case REACT_VIEW_TRANSITION_TYPE:
                return object;
              default:
                switch (((object = object && object.$$typeof), object)) {
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
    var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"),
      REACT_PORTAL_TYPE = Symbol.for("react.portal"),
      REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"),
      REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"),
      REACT_PROFILER_TYPE = Symbol.for("react.profiler"),
      REACT_CONSUMER_TYPE = Symbol.for("react.consumer"),
      REACT_CONTEXT_TYPE = Symbol.for("react.context"),
      REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"),
      REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"),
      REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"),
      REACT_MEMO_TYPE = Symbol.for("react.memo"),
      REACT_LAZY_TYPE = Symbol.for("react.lazy"),
      REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"),
      REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
    __webpack_unused_export__ = REACT_CONSUMER_TYPE;
    __webpack_unused_export__ = REACT_CONTEXT_TYPE;
    __webpack_unused_export__ = REACT_ELEMENT_TYPE;
    __webpack_unused_export__ = REACT_FORWARD_REF_TYPE;
    __webpack_unused_export__ = REACT_FRAGMENT_TYPE;
    __webpack_unused_export__ = REACT_LAZY_TYPE;
    __webpack_unused_export__ = REACT_MEMO_TYPE;
    __webpack_unused_export__ = REACT_PORTAL_TYPE;
    __webpack_unused_export__ = REACT_PROFILER_TYPE;
    __webpack_unused_export__ = REACT_STRICT_MODE_TYPE;
    __webpack_unused_export__ = REACT_SUSPENSE_TYPE;
    __webpack_unused_export__ = REACT_SUSPENSE_LIST_TYPE;
    __webpack_unused_export__ = function (object) {
      return typeOf(object) === REACT_CONSUMER_TYPE;
    };
    __webpack_unused_export__ = function (object) {
      return typeOf(object) === REACT_CONTEXT_TYPE;
    };
    __webpack_unused_export__ = function (object) {
      return (
        "object" === typeof object &&
        null !== object &&
        object.$$typeof === REACT_ELEMENT_TYPE
      );
    };
    __webpack_unused_export__ = function (object) {
      return typeOf(object) === REACT_FORWARD_REF_TYPE;
    };
    exports.isFragment = function (object) {
      return typeOf(object) === REACT_FRAGMENT_TYPE;
    };
    __webpack_unused_export__ = function (object) {
      return typeOf(object) === REACT_LAZY_TYPE;
    };
    __webpack_unused_export__ = function (object) {
      return typeOf(object) === REACT_MEMO_TYPE;
    };
    __webpack_unused_export__ = function (object) {
      return typeOf(object) === REACT_PORTAL_TYPE;
    };
    __webpack_unused_export__ = function (object) {
      return typeOf(object) === REACT_PROFILER_TYPE;
    };
    __webpack_unused_export__ = function (object) {
      return typeOf(object) === REACT_STRICT_MODE_TYPE;
    };
    __webpack_unused_export__ = function (object) {
      return typeOf(object) === REACT_SUSPENSE_TYPE;
    };
    __webpack_unused_export__ = function (object) {
      return typeOf(object) === REACT_SUSPENSE_LIST_TYPE;
    };
    __webpack_unused_export__ = function (type) {
      return "string" === typeof type ||
        "function" === typeof type ||
        type === REACT_FRAGMENT_TYPE ||
        type === REACT_PROFILER_TYPE ||
        type === REACT_STRICT_MODE_TYPE ||
        type === REACT_SUSPENSE_TYPE ||
        type === REACT_SUSPENSE_LIST_TYPE ||
        ("object" === typeof type &&
          null !== type &&
          (type.$$typeof === REACT_LAZY_TYPE ||
            type.$$typeof === REACT_MEMO_TYPE ||
            type.$$typeof === REACT_CONTEXT_TYPE ||
            type.$$typeof === REACT_CONSUMER_TYPE ||
            type.$$typeof === REACT_FORWARD_REF_TYPE ||
            type.$$typeof === REACT_CLIENT_REFERENCE ||
            void 0 !== type.getModuleId))
        ? !0
        : !1;
    };
    __webpack_unused_export__ = typeOf;
  })();


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi1hZGNiNDdhZi5iZTg1ZDdlMTZhZDQyMjExNDVhZC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBYTs7QUFFYixJQUFJLEtBQXFDLEVBQUU7QUFBQSxFQUUxQyxDQUFDO0FBQ0YsRUFBRSwyQ0FBeUQ7QUFDM0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05zQztBQUN0QztBQUNBO0FBQ0EsSUFBVyxtQkFBbUIsdUJBQWE7QUFDM0M7QUFDQSxDQUFDOztBQUVELHNDOzs7Ozs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsNkJBQTZCO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSx1QkFBdUI7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2dEO0FBQ0M7QUFDVDtBQUNLO0FBQzdDO0FBQ0E7QUFDQSxnQ0FBZ0MsY0FBSTtBQUNwQyxVQUFVLFlBQVk7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sbUJBQVM7QUFDZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCx5QkFBeUIsbUJBQUksQ0FBQyxVQUFVO0FBQ3hDO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsQ0FBQztBQUNEO0FBQ0E7QUFDQSxJQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIscUNBQXFCO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsTUFBTSxtQkFBbUIsTUFBTTtBQUNqRDs7QUFFQSx1Qzs7QUM3RndDO0FBQ3hDO0FBQ0E7QUFDQSxJQUFXLHlCQUF5QixjQUFJLDZCQUE2QixnQkFBZ0I7QUFDckYsSUFBSSxtQkFBUztBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsQ0FBQzs7QUFFRCw0Qzs7QUN0QmdDO0FBQ0M7QUFDSzs7QUFFdEMsaUM7O0FDSlc7O0FBRVgsaUM7Ozs7OztBQ0ZtRDtBQUNuRDtBQUNPLGtFQUFrRSxxQkFBZSxHQUFHLGVBQVM7O0FBRXBHLHFEOztBQ0pvQztBQUNVO0FBQzZCO0FBQzNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFXLFNBQVMseUJBQVk7QUFDaEMsc0NBQXNDLGtCQUFRO0FBQzlDO0FBQ0EsNEJBQTRCLHFCQUFXO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBLGFBQWEsZUFBSztBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSx5QkFBeUI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx3Qzs7QUNwQ2lEO0FBQzBCO0FBQ3BFO0FBQ1AseUNBQXlDLHlCQUFZO0FBQ3JELElBQUkseUJBQXlCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsNEM7O0FDckJ5RDtBQUNsRDtBQUNQLFdBQVcsZ0JBQWdCLCtCQUErQjtBQUMxRDtBQUNBO0FBQ0E7O0FBRUEsNkM7O0FDUGdDO0FBQ3pCO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxpQkFBTztBQUNsQjtBQUNBLEtBQUs7QUFDTDs7QUFFQSw4Qzs7QUNiZ0M7QUFDekI7QUFDUCxXQUFXLGlCQUFPO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUCxXQUFXLGlCQUFPO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHNDOztBQ2RpRDtBQUNqRDtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsbUNBQVM7QUFDakI7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxtQ0FBUztBQUNqQjtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpRDs7QUMzRmlEO0FBQ2pEO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsbUNBQVM7QUFDakI7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUQ7O0FDbEVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQ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SSx5QkFBZ0I7QUFDcEIsSUFBSSx5QkFBWTtBQUNoQixJQUFJLHlCQUFZO0FBQ2hCLElBQUkseUJBQWM7QUFDbEIsSUFBSSx5QkFBZ0I7QUFDcEIsSUFBSSx5QkFBa0I7QUFDdEIsSUFBSSx5QkFBZ0I7QUFDcEIsSUFBSSx5QkFBb0I7QUFDeEIsSUFBSSx5QkFBeUI7QUFDN0I7QUFDQTtBQUNBLElBQUkseUJBQXlCO0FBQzdCO0FBQ0E7QUFDQSxJQUFJLHlCQUFpQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlCQUFvQjtBQUN4QjtBQUNBO0FBQ0EsSUFBSSxrQkFBa0I7QUFDdEI7QUFDQTtBQUNBLElBQUkseUJBQWM7QUFDbEI7QUFDQTtBQUNBLElBQUkseUJBQWM7QUFDbEI7QUFDQTtBQUNBLElBQUkseUJBQWdCO0FBQ3BCO0FBQ0E7QUFDQSxJQUFJLHlCQUFrQjtBQUN0QjtBQUNBO0FBQ0EsSUFBSSx5QkFBb0I7QUFDeEI7QUFDQTtBQUNBLElBQUkseUJBQWtCO0FBQ3RCO0FBQ0E7QUFDQSxJQUFJLHlCQUFzQjtBQUMxQjtBQUNBO0FBQ0EsSUFBSSx5QkFBMEI7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLHlCQUFjO0FBQ2xCLEdBQUciLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1pcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9jb3JlL0RuZENvbnRleHQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kL2Rpc3QvY29yZS9EbmRQcm92aWRlci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9jb3JlL0RyYWdQcmV2aWV3SW1hZ2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kL2Rpc3QvY29yZS9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9ob29rcy90eXBlcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9ob29rcy91c2VJc29tb3JwaGljTGF5b3V0RWZmZWN0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC9kaXN0L2hvb2tzL3VzZUNvbGxlY3Rvci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9ob29rcy91c2VNb25pdG9yT3V0cHV0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC9kaXN0L2hvb2tzL3VzZUNvbGxlY3RlZFByb3BzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC9kaXN0L2hvb2tzL3VzZU9wdGlvbmFsRmFjdG9yeS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9ob29rcy91c2VEcmFnL2Nvbm5lY3RvcnMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kL2Rpc3QvaW50ZXJuYWxzL0RyYWdTb3VyY2VNb25pdG9ySW1wbC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9pbnRlcm5hbHMvRHJvcFRhcmdldE1vbml0b3JJbXBsLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC9kaXN0L2ludGVybmFscy9yZWdpc3RyYXRpb24uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWRuZC9zaGFsbG93ZXF1YWwvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9pbnRlcm5hbHMvaXNSZWYuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kL2Rpc3QvaW50ZXJuYWxzL3dyYXBDb25uZWN0b3JIb29rcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9pbnRlcm5hbHMvU291cmNlQ29ubmVjdG9yLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC9kaXN0L2ludGVybmFscy9UYXJnZXRDb25uZWN0b3IuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kL2Rpc3QvaW50ZXJuYWxzL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC9kaXN0L2hvb2tzL3VzZURyYWdEcm9wTWFuYWdlci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9ob29rcy91c2VEcmFnL3VzZURyYWdTb3VyY2VDb25uZWN0b3IuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kL2Rpc3QvaG9va3MvdXNlRHJhZy91c2VEcmFnU291cmNlTW9uaXRvci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9ob29rcy91c2VEcmFnL0RyYWdTb3VyY2VJbXBsLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC9kaXN0L2hvb2tzL3VzZURyYWcvdXNlRHJhZ1NvdXJjZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9ob29rcy91c2VEcmFnL3VzZURyYWdUeXBlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC9kaXN0L2hvb2tzL3VzZURyYWcvdXNlUmVnaXN0ZXJlZERyYWdTb3VyY2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kL2Rpc3QvaG9va3MvdXNlRHJhZy91c2VEcmFnLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC9kaXN0L2hvb2tzL3VzZURyYWcvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kL2Rpc3QvaG9va3MvdXNlRHJhZ0xheWVyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC9kaXN0L2hvb2tzL3VzZURyb3AvY29ubmVjdG9ycy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9ob29rcy91c2VEcm9wL3VzZURyb3BUYXJnZXRDb25uZWN0b3IuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kL2Rpc3QvaG9va3MvdXNlRHJvcC91c2VEcm9wVGFyZ2V0TW9uaXRvci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9ob29rcy91c2VEcm9wL3VzZUFjY2VwdC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9ob29rcy91c2VEcm9wL0Ryb3BUYXJnZXRJbXBsLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC9kaXN0L2hvb2tzL3VzZURyb3AvdXNlRHJvcFRhcmdldC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9ob29rcy91c2VEcm9wL3VzZVJlZ2lzdGVyZWREcm9wVGFyZ2V0LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC9kaXN0L2hvb2tzL3VzZURyb3AvdXNlRHJvcC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9ob29rcy91c2VEcm9wL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC9kaXN0L2hvb2tzL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC9kaXN0L3R5cGVzL2Nvbm5lY3RvcnMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kL2Rpc3QvdHlwZXMvbW9uaXRvcnMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kL2Rpc3QvdHlwZXMvb3B0aW9ucy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC90eXBlcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtZG5kL2FzYXAvZGlzdC9tYWtlUmVxdWVzdENhbGwuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWRuZC9hc2FwL2Rpc3QvQXNhcFF1ZXVlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1kbmQvYXNhcC9kaXN0L1Jhd1Rhc2suanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWRuZC9hc2FwL2Rpc3QvVGFza0ZhY3RvcnkuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWRuZC9hc2FwL2Rpc3QvYXNhcC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtZG5kL2FzYXAvZGlzdC90eXBlcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtZG5kL2FzYXAvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtZG5kL2ludmFyaWFudC9kaXN0L2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWlzL2Nqcy9yZWFjdC1pcy5kZXZlbG9wbWVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9janMvcmVhY3QtaXMucHJvZHVjdGlvbi5qcycpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC1pcy5kZXZlbG9wbWVudC5qcycpO1xufVxuIiwiaW1wb3J0IHsgY3JlYXRlQ29udGV4dCB9IGZyb20gJ3JlYWN0Jztcbi8qKlxuICogQ3JlYXRlIHRoZSBSZWFjdCBDb250ZXh0XG4gKi8gZXhwb3J0IGNvbnN0IERuZENvbnRleHQgPSBjcmVhdGVDb250ZXh0KHtcbiAgICBkcmFnRHJvcE1hbmFnZXI6IHVuZGVmaW5lZFxufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPURuZENvbnRleHQuanMubWFwIiwiZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKHNvdXJjZSwgZXhjbHVkZWQpIHtcbiAgICBpZiAoc291cmNlID09IG51bGwpIHJldHVybiB7fTtcbiAgICB2YXIgdGFyZ2V0ID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2Uoc291cmNlLCBleGNsdWRlZCk7XG4gICAgdmFyIGtleSwgaTtcbiAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykge1xuICAgICAgICB2YXIgc291cmNlU3ltYm9sS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoc291cmNlKTtcbiAgICAgICAgZm9yKGkgPSAwOyBpIDwgc291cmNlU3ltYm9sS2V5cy5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBrZXkgPSBzb3VyY2VTeW1ib2xLZXlzW2ldO1xuICAgICAgICAgICAgaWYgKGV4Y2x1ZGVkLmluZGV4T2Yoa2V5KSA+PSAwKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHNvdXJjZSwga2V5KSkgY29udGludWU7XG4gICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShzb3VyY2UsIGV4Y2x1ZGVkKSB7XG4gICAgaWYgKHNvdXJjZSA9PSBudWxsKSByZXR1cm4ge307XG4gICAgdmFyIHRhcmdldCA9IHt9O1xuICAgIHZhciBzb3VyY2VLZXlzID0gT2JqZWN0LmtleXMoc291cmNlKTtcbiAgICB2YXIga2V5LCBpO1xuICAgIGZvcihpID0gMDsgaSA8IHNvdXJjZUtleXMubGVuZ3RoOyBpKyspe1xuICAgICAgICBrZXkgPSBzb3VyY2VLZXlzW2ldO1xuICAgICAgICBpZiAoZXhjbHVkZWQuaW5kZXhPZihrZXkpID49IDApIGNvbnRpbnVlO1xuICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuaW1wb3J0IHsganN4IGFzIF9qc3ggfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIjtcbmltcG9ydCB7IGNyZWF0ZURyYWdEcm9wTWFuYWdlciB9IGZyb20gJ2RuZC1jb3JlJztcbmltcG9ydCB7IG1lbW8sIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IERuZENvbnRleHQgfSBmcm9tICcuL0RuZENvbnRleHQuanMnO1xubGV0IHJlZkNvdW50ID0gMDtcbmNvbnN0IElOU1RBTkNFX1NZTSA9IFN5bWJvbC5mb3IoJ19fUkVBQ1RfRE5EX0NPTlRFWFRfSU5TVEFOQ0VfXycpO1xudmFyIERuZFByb3ZpZGVyID0gLyojX19QVVJFX18qLyBtZW1vKGZ1bmN0aW9uIERuZFByb3ZpZGVyKF9wYXJhbSkge1xuICAgIHZhciB7IGNoaWxkcmVuICB9ID0gX3BhcmFtLCBwcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfcGFyYW0sIFtcbiAgICAgICAgXCJjaGlsZHJlblwiXG4gICAgXSk7XG4gICAgY29uc3QgW21hbmFnZXIsIGlzR2xvYmFsSW5zdGFuY2VdID0gZ2V0RG5kQ29udGV4dFZhbHVlKHByb3BzKSAvLyBtZW1vaXplZCBmcm9tIHByb3BzXG4gICAgO1xuICAgIC8qKlxuXHRcdCAqIElmIHRoZSBnbG9iYWwgY29udGV4dCB3YXMgdXNlZCB0byBzdG9yZSB0aGUgRE5EIGNvbnRleHRcblx0XHQgKiB0aGVuIHdoZXJlIHRoZXJlcyBubyBtb3JlIHJlZmVyZW5jZXMgdG8gaXQgd2Ugc2hvdWxkXG5cdFx0ICogY2xlYW4gaXQgdXAgdG8gYXZvaWQgbWVtb3J5IGxlYWtzXG5cdFx0ICovIHVzZUVmZmVjdCgoKT0+e1xuICAgICAgICBpZiAoaXNHbG9iYWxJbnN0YW5jZSkge1xuICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IGdldEdsb2JhbENvbnRleHQoKTtcbiAgICAgICAgICAgICsrcmVmQ291bnQ7XG4gICAgICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgICAgICBpZiAoLS1yZWZDb3VudCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0W0lOU1RBTkNFX1NZTV0gPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH0sIFtdKTtcbiAgICByZXR1cm4gLyojX19QVVJFX18qLyBfanN4KERuZENvbnRleHQuUHJvdmlkZXIsIHtcbiAgICAgICAgdmFsdWU6IG1hbmFnZXIsXG4gICAgICAgIGNoaWxkcmVuOiBjaGlsZHJlblxuICAgIH0pO1xufSk7XG4vKipcbiAqIEEgUmVhY3QgY29tcG9uZW50IHRoYXQgcHJvdmlkZXMgdGhlIFJlYWN0LURuRCBjb250ZXh0XG4gKi8gZXhwb3J0IHsgRG5kUHJvdmlkZXIsICB9O1xuZnVuY3Rpb24gZ2V0RG5kQ29udGV4dFZhbHVlKHByb3BzKSB7XG4gICAgaWYgKCdtYW5hZ2VyJyBpbiBwcm9wcykge1xuICAgICAgICBjb25zdCBtYW5hZ2VyID0ge1xuICAgICAgICAgICAgZHJhZ0Ryb3BNYW5hZ2VyOiBwcm9wcy5tYW5hZ2VyXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBtYW5hZ2VyLFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgXTtcbiAgICB9XG4gICAgY29uc3QgbWFuYWdlciA9IGNyZWF0ZVNpbmdsZXRvbkRuZENvbnRleHQocHJvcHMuYmFja2VuZCwgcHJvcHMuY29udGV4dCwgcHJvcHMub3B0aW9ucywgcHJvcHMuZGVidWdNb2RlKTtcbiAgICBjb25zdCBpc0dsb2JhbEluc3RhbmNlID0gIXByb3BzLmNvbnRleHQ7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgbWFuYWdlcixcbiAgICAgICAgaXNHbG9iYWxJbnN0YW5jZVxuICAgIF07XG59XG5mdW5jdGlvbiBjcmVhdGVTaW5nbGV0b25EbmRDb250ZXh0KGJhY2tlbmQsIGNvbnRleHQgPSBnZXRHbG9iYWxDb250ZXh0KCksIG9wdGlvbnMsIGRlYnVnTW9kZSkge1xuICAgIGNvbnN0IGN0eCA9IGNvbnRleHQ7XG4gICAgaWYgKCFjdHhbSU5TVEFOQ0VfU1lNXSkge1xuICAgICAgICBjdHhbSU5TVEFOQ0VfU1lNXSA9IHtcbiAgICAgICAgICAgIGRyYWdEcm9wTWFuYWdlcjogY3JlYXRlRHJhZ0Ryb3BNYW5hZ2VyKGJhY2tlbmQsIGNvbnRleHQsIG9wdGlvbnMsIGRlYnVnTW9kZSlcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGN0eFtJTlNUQU5DRV9TWU1dO1xufVxuZnVuY3Rpb24gZ2V0R2xvYmFsQ29udGV4dCgpIHtcbiAgICByZXR1cm4gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB3aW5kb3c7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPURuZFByb3ZpZGVyLmpzLm1hcCIsImltcG9ydCB7IG1lbW8sIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0Jztcbi8qKlxuICogQSB1dGlsaXR5IGZvciByZW5kZXJpbmcgYSBkcmFnIHByZXZpZXcgaW1hZ2VcbiAqLyBleHBvcnQgY29uc3QgRHJhZ1ByZXZpZXdJbWFnZSA9IG1lbW8oZnVuY3Rpb24gRHJhZ1ByZXZpZXdJbWFnZSh7IGNvbm5lY3QgLCBzcmMgIH0pIHtcbiAgICB1c2VFZmZlY3QoKCk9PntcbiAgICAgICAgaWYgKHR5cGVvZiBJbWFnZSA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcbiAgICAgICAgbGV0IGNvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1nLnNyYyA9IHNyYztcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpPT57XG4gICAgICAgICAgICBjb25uZWN0KGltZyk7XG4gICAgICAgICAgICBjb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgIGlmIChjb25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBjb25uZWN0KG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiBudWxsO1xufSk7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPURyYWdQcmV2aWV3SW1hZ2UuanMubWFwIiwiZXhwb3J0ICogZnJvbSAnLi9EbmRDb250ZXh0LmpzJztcbmV4cG9ydCAqIGZyb20gJy4vRG5kUHJvdmlkZXIuanMnO1xuZXhwb3J0ICogZnJvbSAnLi9EcmFnUHJldmlld0ltYWdlLmpzJztcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiZXhwb3J0IHsgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dHlwZXMuanMubWFwIiwiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VMYXlvdXRFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG4vLyBzdXBwcmVzcyB0aGUgdXNlTGF5b3V0RWZmZWN0IHdhcm5pbmcgb24gc2VydmVyIHNpZGUuXG5leHBvcnQgY29uc3QgdXNlSXNvbW9ycGhpY0xheW91dEVmZmVjdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gdXNlTGF5b3V0RWZmZWN0IDogdXNlRWZmZWN0O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VJc29tb3JwaGljTGF5b3V0RWZmZWN0LmpzLm1hcCIsImltcG9ydCBlcXVhbCBmcm9tICdmYXN0LWRlZXAtZXF1YWwnO1xuaW1wb3J0IHsgdXNlQ2FsbGJhY2ssIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlSXNvbW9ycGhpY0xheW91dEVmZmVjdCB9IGZyb20gJy4vdXNlSXNvbW9ycGhpY0xheW91dEVmZmVjdC5qcyc7XG4vKipcbiAqXG4gKiBAcGFyYW0gbW9uaXRvciBUaGUgbW9uaXRvciB0byBjb2xsZWN0IHN0YXRlIGZyb21cbiAqIEBwYXJhbSBjb2xsZWN0IFRoZSBjb2xsZWN0aW5nIGZ1bmN0aW9uXG4gKiBAcGFyYW0gb25VcGRhdGUgQSBtZXRob2QgdG8gaW52b2tlIHdoZW4gdXBkYXRlcyBvY2N1clxuICovIGV4cG9ydCBmdW5jdGlvbiB1c2VDb2xsZWN0b3IobW9uaXRvciwgY29sbGVjdCwgb25VcGRhdGUpIHtcbiAgICBjb25zdCBbY29sbGVjdGVkLCBzZXRDb2xsZWN0ZWRdID0gdXNlU3RhdGUoKCk9PmNvbGxlY3QobW9uaXRvcilcbiAgICApO1xuICAgIGNvbnN0IHVwZGF0ZUNvbGxlY3RlZCA9IHVzZUNhbGxiYWNrKCgpPT57XG4gICAgICAgIGNvbnN0IG5leHRWYWx1ZSA9IGNvbGxlY3QobW9uaXRvcik7XG4gICAgICAgIC8vIFRoaXMgbmVlZHMgdG8gYmUgYSBkZWVwLWVxdWFsaXR5IGNoZWNrIGJlY2F1c2Ugc29tZSBtb25pdG9yLWNvbGxlY3RlZCB2YWx1ZXNcbiAgICAgICAgLy8gaW5jbHVkZSBYWUNvb3JkIG9iamVjdHMgdGhhdCBtYXkgYmUgZXF1aXZhbGVudCwgYnV0IGRvIG5vdCBoYXZlIGluc3RhbmNlIGVxdWFsaXR5LlxuICAgICAgICBpZiAoIWVxdWFsKGNvbGxlY3RlZCwgbmV4dFZhbHVlKSkge1xuICAgICAgICAgICAgc2V0Q29sbGVjdGVkKG5leHRWYWx1ZSk7XG4gICAgICAgICAgICBpZiAob25VcGRhdGUpIHtcbiAgICAgICAgICAgICAgICBvblVwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSwgW1xuICAgICAgICBjb2xsZWN0ZWQsXG4gICAgICAgIG1vbml0b3IsXG4gICAgICAgIG9uVXBkYXRlXG4gICAgXSk7XG4gICAgLy8gdXBkYXRlIHRoZSBjb2xsZWN0ZWQgcHJvcGVydGllcyBhZnRlciByZWFjdCByZW5kZXJzLlxuICAgIC8vIE5vdGUgdGhhdCB0aGUgXCJEdXN0YmluIFN0cmVzcyBUZXN0XCIgZmFpbHMgaWYgdGhpcyBpcyBub3RcbiAgICAvLyBkb25lIHdoZW4gdGhlIGNvbXBvbmVudCB1cGRhdGVzXG4gICAgdXNlSXNvbW9ycGhpY0xheW91dEVmZmVjdCh1cGRhdGVDb2xsZWN0ZWQpO1xuICAgIHJldHVybiBbXG4gICAgICAgIGNvbGxlY3RlZCxcbiAgICAgICAgdXBkYXRlQ29sbGVjdGVkXG4gICAgXTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlQ29sbGVjdG9yLmpzLm1hcCIsImltcG9ydCB7IHVzZUNvbGxlY3RvciB9IGZyb20gJy4vdXNlQ29sbGVjdG9yLmpzJztcbmltcG9ydCB7IHVzZUlzb21vcnBoaWNMYXlvdXRFZmZlY3QgfSBmcm9tICcuL3VzZUlzb21vcnBoaWNMYXlvdXRFZmZlY3QuanMnO1xuZXhwb3J0IGZ1bmN0aW9uIHVzZU1vbml0b3JPdXRwdXQobW9uaXRvciwgY29sbGVjdCwgb25Db2xsZWN0KSB7XG4gICAgY29uc3QgW2NvbGxlY3RlZCwgdXBkYXRlQ29sbGVjdGVkXSA9IHVzZUNvbGxlY3Rvcihtb25pdG9yLCBjb2xsZWN0LCBvbkNvbGxlY3QpO1xuICAgIHVzZUlzb21vcnBoaWNMYXlvdXRFZmZlY3QoZnVuY3Rpb24gc3Vic2NyaWJlVG9Nb25pdG9yU3RhdGVDaGFuZ2UoKSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXJJZCA9IG1vbml0b3IuZ2V0SGFuZGxlcklkKCk7XG4gICAgICAgIGlmIChoYW5kbGVySWQgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtb25pdG9yLnN1YnNjcmliZVRvU3RhdGVDaGFuZ2UodXBkYXRlQ29sbGVjdGVkLCB7XG4gICAgICAgICAgICBoYW5kbGVySWRzOiBbXG4gICAgICAgICAgICAgICAgaGFuZGxlcklkXG4gICAgICAgICAgICBdXG4gICAgICAgIH0pO1xuICAgIH0sIFtcbiAgICAgICAgbW9uaXRvcixcbiAgICAgICAgdXBkYXRlQ29sbGVjdGVkXG4gICAgXSk7XG4gICAgcmV0dXJuIGNvbGxlY3RlZDtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlTW9uaXRvck91dHB1dC5qcy5tYXAiLCJpbXBvcnQgeyB1c2VNb25pdG9yT3V0cHV0IH0gZnJvbSAnLi91c2VNb25pdG9yT3V0cHV0LmpzJztcbmV4cG9ydCBmdW5jdGlvbiB1c2VDb2xsZWN0ZWRQcm9wcyhjb2xsZWN0b3IsIG1vbml0b3IsIGNvbm5lY3Rvcikge1xuICAgIHJldHVybiB1c2VNb25pdG9yT3V0cHV0KG1vbml0b3IsIGNvbGxlY3RvciB8fCAoKCk9Pih7fSlcbiAgICApLCAoKT0+Y29ubmVjdG9yLnJlY29ubmVjdCgpXG4gICAgKTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlQ29sbGVjdGVkUHJvcHMuanMubWFwIiwiaW1wb3J0IHsgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmV4cG9ydCBmdW5jdGlvbiB1c2VPcHRpb25hbEZhY3RvcnkoYXJnLCBkZXBzKSB7XG4gICAgY29uc3QgbWVtb0RlcHMgPSBbXG4gICAgICAgIC4uLmRlcHMgfHwgW11cbiAgICBdO1xuICAgIGlmIChkZXBzID09IG51bGwgJiYgdHlwZW9mIGFyZyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBtZW1vRGVwcy5wdXNoKGFyZyk7XG4gICAgfVxuICAgIHJldHVybiB1c2VNZW1vKCgpPT57XG4gICAgICAgIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nID8gYXJnKCkgOiBhcmc7XG4gICAgfSwgbWVtb0RlcHMpO1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VPcHRpb25hbEZhY3RvcnkuanMubWFwIiwiaW1wb3J0IHsgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmV4cG9ydCBmdW5jdGlvbiB1c2VDb25uZWN0RHJhZ1NvdXJjZShjb25uZWN0b3IpIHtcbiAgICByZXR1cm4gdXNlTWVtbygoKT0+Y29ubmVjdG9yLmhvb2tzLmRyYWdTb3VyY2UoKVxuICAgICwgW1xuICAgICAgICBjb25uZWN0b3JcbiAgICBdKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB1c2VDb25uZWN0RHJhZ1ByZXZpZXcoY29ubmVjdG9yKSB7XG4gICAgcmV0dXJuIHVzZU1lbW8oKCk9PmNvbm5lY3Rvci5ob29rcy5kcmFnUHJldmlldygpXG4gICAgLCBbXG4gICAgICAgIGNvbm5lY3RvclxuICAgIF0pO1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb25uZWN0b3JzLmpzLm1hcCIsImltcG9ydCB7IGludmFyaWFudCB9IGZyb20gJ0ByZWFjdC1kbmQvaW52YXJpYW50JztcbmxldCBpc0NhbGxpbmdDYW5EcmFnID0gZmFsc2U7XG5sZXQgaXNDYWxsaW5nSXNEcmFnZ2luZyA9IGZhbHNlO1xuZXhwb3J0IGNsYXNzIERyYWdTb3VyY2VNb25pdG9ySW1wbCB7XG4gICAgcmVjZWl2ZUhhbmRsZXJJZChzb3VyY2VJZCkge1xuICAgICAgICB0aGlzLnNvdXJjZUlkID0gc291cmNlSWQ7XG4gICAgfVxuICAgIGdldEhhbmRsZXJJZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc291cmNlSWQ7XG4gICAgfVxuICAgIGNhbkRyYWcoKSB7XG4gICAgICAgIGludmFyaWFudCghaXNDYWxsaW5nQ2FuRHJhZywgJ1lvdSBtYXkgbm90IGNhbGwgbW9uaXRvci5jYW5EcmFnKCkgaW5zaWRlIHlvdXIgY2FuRHJhZygpIGltcGxlbWVudGF0aW9uLiAnICsgJ1JlYWQgbW9yZTogaHR0cDovL3JlYWN0LWRuZC5naXRodWIuaW8vcmVhY3QtZG5kL2RvY3MvYXBpL2RyYWctc291cmNlLW1vbml0b3InKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlzQ2FsbGluZ0NhbkRyYWcgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxNb25pdG9yLmNhbkRyYWdTb3VyY2UodGhpcy5zb3VyY2VJZCk7XG4gICAgICAgIH0gZmluYWxseXtcbiAgICAgICAgICAgIGlzQ2FsbGluZ0NhbkRyYWcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpc0RyYWdnaW5nKCkge1xuICAgICAgICBpZiAoIXRoaXMuc291cmNlSWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpbnZhcmlhbnQoIWlzQ2FsbGluZ0lzRHJhZ2dpbmcsICdZb3UgbWF5IG5vdCBjYWxsIG1vbml0b3IuaXNEcmFnZ2luZygpIGluc2lkZSB5b3VyIGlzRHJhZ2dpbmcoKSBpbXBsZW1lbnRhdGlvbi4gJyArICdSZWFkIG1vcmU6IGh0dHA6Ly9yZWFjdC1kbmQuZ2l0aHViLmlvL3JlYWN0LWRuZC9kb2NzL2FwaS9kcmFnLXNvdXJjZS1tb25pdG9yJyk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpc0NhbGxpbmdJc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmludGVybmFsTW9uaXRvci5pc0RyYWdnaW5nU291cmNlKHRoaXMuc291cmNlSWQpO1xuICAgICAgICB9IGZpbmFsbHl7XG4gICAgICAgICAgICBpc0NhbGxpbmdJc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3Vic2NyaWJlVG9TdGF0ZUNoYW5nZShsaXN0ZW5lciwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3Iuc3Vic2NyaWJlVG9TdGF0ZUNoYW5nZShsaXN0ZW5lciwgb3B0aW9ucyk7XG4gICAgfVxuICAgIGlzRHJhZ2dpbmdTb3VyY2Uoc291cmNlSWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxNb25pdG9yLmlzRHJhZ2dpbmdTb3VyY2Uoc291cmNlSWQpO1xuICAgIH1cbiAgICBpc092ZXJUYXJnZXQodGFyZ2V0SWQsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxNb25pdG9yLmlzT3ZlclRhcmdldCh0YXJnZXRJZCwgb3B0aW9ucyk7XG4gICAgfVxuICAgIGdldFRhcmdldElkcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxNb25pdG9yLmdldFRhcmdldElkcygpO1xuICAgIH1cbiAgICBpc1NvdXJjZVB1YmxpYygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxNb25pdG9yLmlzU291cmNlUHVibGljKCk7XG4gICAgfVxuICAgIGdldFNvdXJjZUlkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuZ2V0U291cmNlSWQoKTtcbiAgICB9XG4gICAgc3Vic2NyaWJlVG9PZmZzZXRDaGFuZ2UobGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxNb25pdG9yLnN1YnNjcmliZVRvT2Zmc2V0Q2hhbmdlKGxpc3RlbmVyKTtcbiAgICB9XG4gICAgY2FuRHJhZ1NvdXJjZShzb3VyY2VJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuY2FuRHJhZ1NvdXJjZShzb3VyY2VJZCk7XG4gICAgfVxuICAgIGNhbkRyb3BPblRhcmdldCh0YXJnZXRJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuY2FuRHJvcE9uVGFyZ2V0KHRhcmdldElkKTtcbiAgICB9XG4gICAgZ2V0SXRlbVR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVybmFsTW9uaXRvci5nZXRJdGVtVHlwZSgpO1xuICAgIH1cbiAgICBnZXRJdGVtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuZ2V0SXRlbSgpO1xuICAgIH1cbiAgICBnZXREcm9wUmVzdWx0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuZ2V0RHJvcFJlc3VsdCgpO1xuICAgIH1cbiAgICBkaWREcm9wKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuZGlkRHJvcCgpO1xuICAgIH1cbiAgICBnZXRJbml0aWFsQ2xpZW50T2Zmc2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuZ2V0SW5pdGlhbENsaWVudE9mZnNldCgpO1xuICAgIH1cbiAgICBnZXRJbml0aWFsU291cmNlQ2xpZW50T2Zmc2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuZ2V0SW5pdGlhbFNvdXJjZUNsaWVudE9mZnNldCgpO1xuICAgIH1cbiAgICBnZXRTb3VyY2VDbGllbnRPZmZzZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVybmFsTW9uaXRvci5nZXRTb3VyY2VDbGllbnRPZmZzZXQoKTtcbiAgICB9XG4gICAgZ2V0Q2xpZW50T2Zmc2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuZ2V0Q2xpZW50T2Zmc2V0KCk7XG4gICAgfVxuICAgIGdldERpZmZlcmVuY2VGcm9tSW5pdGlhbE9mZnNldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxNb25pdG9yLmdldERpZmZlcmVuY2VGcm9tSW5pdGlhbE9mZnNldCgpO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihtYW5hZ2VyKXtcbiAgICAgICAgdGhpcy5zb3VyY2VJZCA9IG51bGw7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxNb25pdG9yID0gbWFuYWdlci5nZXRNb25pdG9yKCk7XG4gICAgfVxufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1EcmFnU291cmNlTW9uaXRvckltcGwuanMubWFwIiwiaW1wb3J0IHsgaW52YXJpYW50IH0gZnJvbSAnQHJlYWN0LWRuZC9pbnZhcmlhbnQnO1xubGV0IGlzQ2FsbGluZ0NhbkRyb3AgPSBmYWxzZTtcbmV4cG9ydCBjbGFzcyBEcm9wVGFyZ2V0TW9uaXRvckltcGwge1xuICAgIHJlY2VpdmVIYW5kbGVySWQodGFyZ2V0SWQpIHtcbiAgICAgICAgdGhpcy50YXJnZXRJZCA9IHRhcmdldElkO1xuICAgIH1cbiAgICBnZXRIYW5kbGVySWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRhcmdldElkO1xuICAgIH1cbiAgICBzdWJzY3JpYmVUb1N0YXRlQ2hhbmdlKGxpc3RlbmVyLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVybmFsTW9uaXRvci5zdWJzY3JpYmVUb1N0YXRlQ2hhbmdlKGxpc3RlbmVyLCBvcHRpb25zKTtcbiAgICB9XG4gICAgY2FuRHJvcCgpIHtcbiAgICAgICAgLy8gQ3V0IG91dCBlYXJseSBpZiB0aGUgdGFyZ2V0IGlkIGhhcyBub3QgYmVlbiBzZXQuIFRoaXMgc2hvdWxkIHByZXZlbnQgZXJyb3JzXG4gICAgICAgIC8vIHdoZXJlIHRoZSB1c2VyIGhhcyBhbiBvbGRlciB2ZXJzaW9uIG9mIGRuZC1jb3JlIGxpa2UgaW5cbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3JlYWN0LWRuZC9yZWFjdC1kbmQvaXNzdWVzLzEzMTBcbiAgICAgICAgaWYgKCF0aGlzLnRhcmdldElkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaW52YXJpYW50KCFpc0NhbGxpbmdDYW5Ecm9wLCAnWW91IG1heSBub3QgY2FsbCBtb25pdG9yLmNhbkRyb3AoKSBpbnNpZGUgeW91ciBjYW5Ecm9wKCkgaW1wbGVtZW50YXRpb24uICcgKyAnUmVhZCBtb3JlOiBodHRwOi8vcmVhY3QtZG5kLmdpdGh1Yi5pby9yZWFjdC1kbmQvZG9jcy9hcGkvZHJvcC10YXJnZXQtbW9uaXRvcicpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaXNDYWxsaW5nQ2FuRHJvcCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuY2FuRHJvcE9uVGFyZ2V0KHRoaXMudGFyZ2V0SWQpO1xuICAgICAgICB9IGZpbmFsbHl7XG4gICAgICAgICAgICBpc0NhbGxpbmdDYW5Ecm9wID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaXNPdmVyKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCF0aGlzLnRhcmdldElkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxNb25pdG9yLmlzT3ZlclRhcmdldCh0aGlzLnRhcmdldElkLCBvcHRpb25zKTtcbiAgICB9XG4gICAgZ2V0SXRlbVR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVybmFsTW9uaXRvci5nZXRJdGVtVHlwZSgpO1xuICAgIH1cbiAgICBnZXRJdGVtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuZ2V0SXRlbSgpO1xuICAgIH1cbiAgICBnZXREcm9wUmVzdWx0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuZ2V0RHJvcFJlc3VsdCgpO1xuICAgIH1cbiAgICBkaWREcm9wKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuZGlkRHJvcCgpO1xuICAgIH1cbiAgICBnZXRJbml0aWFsQ2xpZW50T2Zmc2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuZ2V0SW5pdGlhbENsaWVudE9mZnNldCgpO1xuICAgIH1cbiAgICBnZXRJbml0aWFsU291cmNlQ2xpZW50T2Zmc2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuZ2V0SW5pdGlhbFNvdXJjZUNsaWVudE9mZnNldCgpO1xuICAgIH1cbiAgICBnZXRTb3VyY2VDbGllbnRPZmZzZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludGVybmFsTW9uaXRvci5nZXRTb3VyY2VDbGllbnRPZmZzZXQoKTtcbiAgICB9XG4gICAgZ2V0Q2xpZW50T2Zmc2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbE1vbml0b3IuZ2V0Q2xpZW50T2Zmc2V0KCk7XG4gICAgfVxuICAgIGdldERpZmZlcmVuY2VGcm9tSW5pdGlhbE9mZnNldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxNb25pdG9yLmdldERpZmZlcmVuY2VGcm9tSW5pdGlhbE9mZnNldCgpO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihtYW5hZ2VyKXtcbiAgICAgICAgdGhpcy50YXJnZXRJZCA9IG51bGw7XG4gICAgICAgIHRoaXMuaW50ZXJuYWxNb25pdG9yID0gbWFuYWdlci5nZXRNb25pdG9yKCk7XG4gICAgfVxufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1Ecm9wVGFyZ2V0TW9uaXRvckltcGwuanMubWFwIiwiZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyVGFyZ2V0KHR5cGUsIHRhcmdldCwgbWFuYWdlcikge1xuICAgIGNvbnN0IHJlZ2lzdHJ5ID0gbWFuYWdlci5nZXRSZWdpc3RyeSgpO1xuICAgIGNvbnN0IHRhcmdldElkID0gcmVnaXN0cnkuYWRkVGFyZ2V0KHR5cGUsIHRhcmdldCk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgdGFyZ2V0SWQsXG4gICAgICAgICgpPT5yZWdpc3RyeS5yZW1vdmVUYXJnZXQodGFyZ2V0SWQpXG4gICAgXTtcbn1cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclNvdXJjZSh0eXBlLCBzb3VyY2UsIG1hbmFnZXIpIHtcbiAgICBjb25zdCByZWdpc3RyeSA9IG1hbmFnZXIuZ2V0UmVnaXN0cnkoKTtcbiAgICBjb25zdCBzb3VyY2VJZCA9IHJlZ2lzdHJ5LmFkZFNvdXJjZSh0eXBlLCBzb3VyY2UpO1xuICAgIHJldHVybiBbXG4gICAgICAgIHNvdXJjZUlkLFxuICAgICAgICAoKT0+cmVnaXN0cnkucmVtb3ZlU291cmNlKHNvdXJjZUlkKVxuICAgIF07XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlZ2lzdHJhdGlvbi5qcy5tYXAiLCJleHBvcnQgZnVuY3Rpb24gc2hhbGxvd0VxdWFsKG9iakEsIG9iakIsIGNvbXBhcmUsIGNvbXBhcmVDb250ZXh0KSB7XG4gICAgbGV0IGNvbXBhcmVSZXN1bHQgPSBjb21wYXJlID8gY29tcGFyZS5jYWxsKGNvbXBhcmVDb250ZXh0LCBvYmpBLCBvYmpCKSA6IHZvaWQgMDtcbiAgICBpZiAoY29tcGFyZVJlc3VsdCAhPT0gdm9pZCAwKSB7XG4gICAgICAgIHJldHVybiAhIWNvbXBhcmVSZXN1bHQ7XG4gICAgfVxuICAgIGlmIChvYmpBID09PSBvYmpCKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9iakEgIT09ICdvYmplY3QnIHx8ICFvYmpBIHx8IHR5cGVvZiBvYmpCICE9PSAnb2JqZWN0JyB8fCAhb2JqQikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGtleXNBID0gT2JqZWN0LmtleXMob2JqQSk7XG4gICAgY29uc3Qga2V5c0IgPSBPYmplY3Qua2V5cyhvYmpCKTtcbiAgICBpZiAoa2V5c0EubGVuZ3RoICE9PSBrZXlzQi5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBiSGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmJpbmQob2JqQik7XG4gICAgLy8gVGVzdCBmb3IgQSdzIGtleXMgZGlmZmVyZW50IGZyb20gQi5cbiAgICBmb3IobGV0IGlkeCA9IDA7IGlkeCA8IGtleXNBLmxlbmd0aDsgaWR4Kyspe1xuICAgICAgICBjb25zdCBrZXkgPSBrZXlzQVtpZHhdO1xuICAgICAgICBpZiAoIWJIYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWVBID0gb2JqQVtrZXldO1xuICAgICAgICBjb25zdCB2YWx1ZUIgPSBvYmpCW2tleV07XG4gICAgICAgIGNvbXBhcmVSZXN1bHQgPSBjb21wYXJlID8gY29tcGFyZS5jYWxsKGNvbXBhcmVDb250ZXh0LCB2YWx1ZUEsIHZhbHVlQiwga2V5KSA6IHZvaWQgMDtcbiAgICAgICAgaWYgKGNvbXBhcmVSZXN1bHQgPT09IGZhbHNlIHx8IGNvbXBhcmVSZXN1bHQgPT09IHZvaWQgMCAmJiB2YWx1ZUEgIT09IHZhbHVlQikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJleHBvcnQgZnVuY3Rpb24gaXNSZWYob2JqKSB7XG4gICAgcmV0dXJuKC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgICBvYmogIT09IG51bGwgJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgJ2N1cnJlbnQnKSk7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWlzUmVmLmpzLm1hcCIsImltcG9ydCB7IGludmFyaWFudCB9IGZyb20gJ0ByZWFjdC1kbmQvaW52YXJpYW50JztcbmltcG9ydCB7IGNsb25lRWxlbWVudCwgaXNWYWxpZEVsZW1lbnQgfSBmcm9tICdyZWFjdCc7XG5mdW5jdGlvbiB0aHJvd0lmQ29tcG9zaXRlQ29tcG9uZW50RWxlbWVudChlbGVtZW50KSB7XG4gICAgLy8gQ3VzdG9tIGNvbXBvbmVudHMgY2FuIG5vIGxvbmdlciBiZSB3cmFwcGVkIGRpcmVjdGx5IGluIFJlYWN0IERuRCAyLjBcbiAgICAvLyBzbyB0aGF0IHdlIGRvbid0IG5lZWQgdG8gZGVwZW5kIG9uIGZpbmRET01Ob2RlKCkgZnJvbSByZWFjdC1kb20uXG4gICAgaWYgKHR5cGVvZiBlbGVtZW50LnR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGlzcGxheU5hbWUgPSBlbGVtZW50LnR5cGUuZGlzcGxheU5hbWUgfHwgZWxlbWVudC50eXBlLm5hbWUgfHwgJ3RoZSBjb21wb25lbnQnO1xuICAgIHRocm93IG5ldyBFcnJvcignT25seSBuYXRpdmUgZWxlbWVudCBub2RlcyBjYW4gbm93IGJlIHBhc3NlZCB0byBSZWFjdCBEbkQgY29ubmVjdG9ycy4nICsgYFlvdSBjYW4gZWl0aGVyIHdyYXAgJHtkaXNwbGF5TmFtZX0gaW50byBhIDxkaXY+LCBvciB0dXJuIGl0IGludG8gYSBgICsgJ2RyYWcgc291cmNlIG9yIGEgZHJvcCB0YXJnZXQgaXRzZWxmLicpO1xufVxuZnVuY3Rpb24gd3JhcEhvb2tUb1JlY29nbml6ZUVsZW1lbnQoaG9vaykge1xuICAgIHJldHVybiAoZWxlbWVudE9yTm9kZSA9IG51bGwsIG9wdGlvbnMgPSBudWxsKT0+e1xuICAgICAgICAvLyBXaGVuIHBhc3NlZCBhIG5vZGUsIGNhbGwgdGhlIGhvb2sgc3RyYWlnaHQgYXdheS5cbiAgICAgICAgaWYgKCFpc1ZhbGlkRWxlbWVudChlbGVtZW50T3JOb2RlKSkge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IGVsZW1lbnRPck5vZGU7XG4gICAgICAgICAgICBob29rKG5vZGUsIG9wdGlvbnMpO1xuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSBub2RlIHNvIGl0IGNhbiBiZSBjaGFpbmVkIChlLmcuIHdoZW4gd2l0aGluIGNhbGxiYWNrIHJlZnNcbiAgICAgICAgICAgIC8vIDxkaXYgcmVmPXtub2RlID0+IGNvbm5lY3REcmFnU291cmNlKGNvbm5lY3REcm9wVGFyZ2V0KG5vZGUpKX0vPlxuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgcGFzc2VkIGEgUmVhY3RFbGVtZW50LCBjbG9uZSBpdCBhbmQgYXR0YWNoIHRoaXMgZnVuY3Rpb24gYXMgYSByZWYuXG4gICAgICAgIC8vIFRoaXMgaGVscHMgdXMgYWNoaWV2ZSBhIG5lYXQgQVBJIHdoZXJlIHVzZXIgZG9lc24ndCBldmVuIGtub3cgdGhhdCByZWZzXG4gICAgICAgIC8vIGFyZSBiZWluZyB1c2VkIHVuZGVyIHRoZSBob29kLlxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudE9yTm9kZTtcbiAgICAgICAgdGhyb3dJZkNvbXBvc2l0ZUNvbXBvbmVudEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIC8vIFdoZW4gbm8gb3B0aW9ucyBhcmUgcGFzc2VkLCB1c2UgdGhlIGhvb2sgZGlyZWN0bHlcbiAgICAgICAgY29uc3QgcmVmID0gb3B0aW9ucyA/IChub2RlKT0+aG9vayhub2RlLCBvcHRpb25zKVxuICAgICAgICAgOiBob29rO1xuICAgICAgICByZXR1cm4gY2xvbmVXaXRoUmVmKGVsZW1lbnQsIHJlZik7XG4gICAgfTtcbn1cbmV4cG9ydCBmdW5jdGlvbiB3cmFwQ29ubmVjdG9ySG9va3MoaG9va3MpIHtcbiAgICBjb25zdCB3cmFwcGVkSG9va3MgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhob29rcykuZm9yRWFjaCgoa2V5KT0+e1xuICAgICAgICBjb25zdCBob29rID0gaG9va3Nba2V5XTtcbiAgICAgICAgLy8gcmVmIG9iamVjdHMgc2hvdWxkIGJlIHBhc3NlZCBzdHJhaWdodCB0aHJvdWdoIHdpdGhvdXQgd3JhcHBpbmdcbiAgICAgICAgaWYgKGtleS5lbmRzV2l0aCgnUmVmJykpIHtcbiAgICAgICAgICAgIHdyYXBwZWRIb29rc1trZXldID0gaG9va3Nba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHdyYXBwZWRIb29rID0gd3JhcEhvb2tUb1JlY29nbml6ZUVsZW1lbnQoaG9vayk7XG4gICAgICAgICAgICB3cmFwcGVkSG9va3Nba2V5XSA9ICgpPT53cmFwcGVkSG9va1xuICAgICAgICAgICAgO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHdyYXBwZWRIb29rcztcbn1cbmZ1bmN0aW9uIHNldFJlZihyZWYsIG5vZGUpIHtcbiAgICBpZiAodHlwZW9mIHJlZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZWYobm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmVmLmN1cnJlbnQgPSBub2RlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNsb25lV2l0aFJlZihlbGVtZW50LCBuZXdSZWYpIHtcbiAgICBjb25zdCBwcmV2aW91c1JlZiA9IGVsZW1lbnQucmVmO1xuICAgIGludmFyaWFudCh0eXBlb2YgcHJldmlvdXNSZWYgIT09ICdzdHJpbmcnLCAnQ2Fubm90IGNvbm5lY3QgUmVhY3QgRG5EIHRvIGFuIGVsZW1lbnQgd2l0aCBhbiBleGlzdGluZyBzdHJpbmcgcmVmLiAnICsgJ1BsZWFzZSBjb252ZXJ0IGl0IHRvIHVzZSBhIGNhbGxiYWNrIHJlZiBpbnN0ZWFkLCBvciB3cmFwIGl0IGludG8gYSA8c3Bhbj4gb3IgPGRpdj4uICcgKyAnUmVhZCBtb3JlOiBodHRwczovL3JlYWN0anMub3JnL2RvY3MvcmVmcy1hbmQtdGhlLWRvbS5odG1sI2NhbGxiYWNrLXJlZnMnKTtcbiAgICBpZiAoIXByZXZpb3VzUmVmKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlcmUgaXMgbm8gcmVmIG9uIHRoZSBlbGVtZW50LCB1c2UgdGhlIG5ldyByZWYgZGlyZWN0bHlcbiAgICAgICAgcmV0dXJuIGNsb25lRWxlbWVudChlbGVtZW50LCB7XG4gICAgICAgICAgICByZWY6IG5ld1JlZlxuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY2xvbmVFbGVtZW50KGVsZW1lbnQsIHtcbiAgICAgICAgICAgIHJlZjogKG5vZGUpPT57XG4gICAgICAgICAgICAgICAgc2V0UmVmKHByZXZpb3VzUmVmLCBub2RlKTtcbiAgICAgICAgICAgICAgICBzZXRSZWYobmV3UmVmLCBub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD13cmFwQ29ubmVjdG9ySG9va3MuanMubWFwIiwiaW1wb3J0IHsgc2hhbGxvd0VxdWFsIH0gZnJvbSAnQHJlYWN0LWRuZC9zaGFsbG93ZXF1YWwnO1xuaW1wb3J0IHsgaXNSZWYgfSBmcm9tICcuL2lzUmVmLmpzJztcbmltcG9ydCB7IHdyYXBDb25uZWN0b3JIb29rcyB9IGZyb20gJy4vd3JhcENvbm5lY3Rvckhvb2tzLmpzJztcbmV4cG9ydCBjbGFzcyBTb3VyY2VDb25uZWN0b3Ige1xuICAgIHJlY2VpdmVIYW5kbGVySWQobmV3SGFuZGxlcklkKSB7XG4gICAgICAgIGlmICh0aGlzLmhhbmRsZXJJZCA9PT0gbmV3SGFuZGxlcklkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oYW5kbGVySWQgPSBuZXdIYW5kbGVySWQ7XG4gICAgICAgIHRoaXMucmVjb25uZWN0KCk7XG4gICAgfVxuICAgIGdldCBjb25uZWN0VGFyZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kcmFnU291cmNlO1xuICAgIH1cbiAgICBnZXQgZHJhZ1NvdXJjZU9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRyYWdTb3VyY2VPcHRpb25zSW50ZXJuYWw7XG4gICAgfVxuICAgIHNldCBkcmFnU291cmNlT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuZHJhZ1NvdXJjZU9wdGlvbnNJbnRlcm5hbCA9IG9wdGlvbnM7XG4gICAgfVxuICAgIGdldCBkcmFnUHJldmlld09wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRyYWdQcmV2aWV3T3B0aW9uc0ludGVybmFsO1xuICAgIH1cbiAgICBzZXQgZHJhZ1ByZXZpZXdPcHRpb25zKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5kcmFnUHJldmlld09wdGlvbnNJbnRlcm5hbCA9IG9wdGlvbnM7XG4gICAgfVxuICAgIHJlY29ubmVjdCgpIHtcbiAgICAgICAgY29uc3QgZGlkQ2hhbmdlID0gdGhpcy5yZWNvbm5lY3REcmFnU291cmNlKCk7XG4gICAgICAgIHRoaXMucmVjb25uZWN0RHJhZ1ByZXZpZXcoZGlkQ2hhbmdlKTtcbiAgICB9XG4gICAgcmVjb25uZWN0RHJhZ1NvdXJjZSgpIHtcbiAgICAgICAgY29uc3QgZHJhZ1NvdXJjZSA9IHRoaXMuZHJhZ1NvdXJjZTtcbiAgICAgICAgLy8gaWYgbm90aGluZyBoYXMgY2hhbmdlZCB0aGVuIGRvbid0IHJlc3Vic2NyaWJlXG4gICAgICAgIGNvbnN0IGRpZENoYW5nZSA9IHRoaXMuZGlkSGFuZGxlcklkQ2hhbmdlKCkgfHwgdGhpcy5kaWRDb25uZWN0ZWREcmFnU291cmNlQ2hhbmdlKCkgfHwgdGhpcy5kaWREcmFnU291cmNlT3B0aW9uc0NoYW5nZSgpO1xuICAgICAgICBpZiAoZGlkQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLmRpc2Nvbm5lY3REcmFnU291cmNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmhhbmRsZXJJZCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpZENoYW5nZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRyYWdTb3VyY2UpIHtcbiAgICAgICAgICAgIHRoaXMubGFzdENvbm5lY3RlZERyYWdTb3VyY2UgPSBkcmFnU291cmNlO1xuICAgICAgICAgICAgcmV0dXJuIGRpZENoYW5nZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGlkQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RDb25uZWN0ZWRIYW5kbGVySWQgPSB0aGlzLmhhbmRsZXJJZDtcbiAgICAgICAgICAgIHRoaXMubGFzdENvbm5lY3RlZERyYWdTb3VyY2UgPSBkcmFnU291cmNlO1xuICAgICAgICAgICAgdGhpcy5sYXN0Q29ubmVjdGVkRHJhZ1NvdXJjZU9wdGlvbnMgPSB0aGlzLmRyYWdTb3VyY2VPcHRpb25zO1xuICAgICAgICAgICAgdGhpcy5kcmFnU291cmNlVW5zdWJzY3JpYmUgPSB0aGlzLmJhY2tlbmQuY29ubmVjdERyYWdTb3VyY2UodGhpcy5oYW5kbGVySWQsIGRyYWdTb3VyY2UsIHRoaXMuZHJhZ1NvdXJjZU9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkaWRDaGFuZ2U7XG4gICAgfVxuICAgIHJlY29ubmVjdERyYWdQcmV2aWV3KGZvcmNlRGlkQ2hhbmdlID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3QgZHJhZ1ByZXZpZXcgPSB0aGlzLmRyYWdQcmV2aWV3O1xuICAgICAgICAvLyBpZiBub3RoaW5nIGhhcyBjaGFuZ2VkIHRoZW4gZG9uJ3QgcmVzdWJzY3JpYmVcbiAgICAgICAgY29uc3QgZGlkQ2hhbmdlID0gZm9yY2VEaWRDaGFuZ2UgfHwgdGhpcy5kaWRIYW5kbGVySWRDaGFuZ2UoKSB8fCB0aGlzLmRpZENvbm5lY3RlZERyYWdQcmV2aWV3Q2hhbmdlKCkgfHwgdGhpcy5kaWREcmFnUHJldmlld09wdGlvbnNDaGFuZ2UoKTtcbiAgICAgICAgaWYgKGRpZENoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5kaXNjb25uZWN0RHJhZ1ByZXZpZXcoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuaGFuZGxlcklkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkcmFnUHJldmlldykge1xuICAgICAgICAgICAgdGhpcy5sYXN0Q29ubmVjdGVkRHJhZ1ByZXZpZXcgPSBkcmFnUHJldmlldztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGlkQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RDb25uZWN0ZWRIYW5kbGVySWQgPSB0aGlzLmhhbmRsZXJJZDtcbiAgICAgICAgICAgIHRoaXMubGFzdENvbm5lY3RlZERyYWdQcmV2aWV3ID0gZHJhZ1ByZXZpZXc7XG4gICAgICAgICAgICB0aGlzLmxhc3RDb25uZWN0ZWREcmFnUHJldmlld09wdGlvbnMgPSB0aGlzLmRyYWdQcmV2aWV3T3B0aW9ucztcbiAgICAgICAgICAgIHRoaXMuZHJhZ1ByZXZpZXdVbnN1YnNjcmliZSA9IHRoaXMuYmFja2VuZC5jb25uZWN0RHJhZ1ByZXZpZXcodGhpcy5oYW5kbGVySWQsIGRyYWdQcmV2aWV3LCB0aGlzLmRyYWdQcmV2aWV3T3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZGlkSGFuZGxlcklkQ2hhbmdlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0Q29ubmVjdGVkSGFuZGxlcklkICE9PSB0aGlzLmhhbmRsZXJJZDtcbiAgICB9XG4gICAgZGlkQ29ubmVjdGVkRHJhZ1NvdXJjZUNoYW5nZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGFzdENvbm5lY3RlZERyYWdTb3VyY2UgIT09IHRoaXMuZHJhZ1NvdXJjZTtcbiAgICB9XG4gICAgZGlkQ29ubmVjdGVkRHJhZ1ByZXZpZXdDaGFuZ2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RDb25uZWN0ZWREcmFnUHJldmlldyAhPT0gdGhpcy5kcmFnUHJldmlldztcbiAgICB9XG4gICAgZGlkRHJhZ1NvdXJjZU9wdGlvbnNDaGFuZ2UoKSB7XG4gICAgICAgIHJldHVybiAhc2hhbGxvd0VxdWFsKHRoaXMubGFzdENvbm5lY3RlZERyYWdTb3VyY2VPcHRpb25zLCB0aGlzLmRyYWdTb3VyY2VPcHRpb25zKTtcbiAgICB9XG4gICAgZGlkRHJhZ1ByZXZpZXdPcHRpb25zQ2hhbmdlKCkge1xuICAgICAgICByZXR1cm4gIXNoYWxsb3dFcXVhbCh0aGlzLmxhc3RDb25uZWN0ZWREcmFnUHJldmlld09wdGlvbnMsIHRoaXMuZHJhZ1ByZXZpZXdPcHRpb25zKTtcbiAgICB9XG4gICAgZGlzY29ubmVjdERyYWdTb3VyY2UoKSB7XG4gICAgICAgIGlmICh0aGlzLmRyYWdTb3VyY2VVbnN1YnNjcmliZSkge1xuICAgICAgICAgICAgdGhpcy5kcmFnU291cmNlVW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIHRoaXMuZHJhZ1NvdXJjZVVuc3Vic2NyaWJlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRpc2Nvbm5lY3REcmFnUHJldmlldygpIHtcbiAgICAgICAgaWYgKHRoaXMuZHJhZ1ByZXZpZXdVbnN1YnNjcmliZSkge1xuICAgICAgICAgICAgdGhpcy5kcmFnUHJldmlld1Vuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICB0aGlzLmRyYWdQcmV2aWV3VW5zdWJzY3JpYmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLmRyYWdQcmV2aWV3Tm9kZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmRyYWdQcmV2aWV3UmVmID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgZHJhZ1NvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJhZ1NvdXJjZU5vZGUgfHwgdGhpcy5kcmFnU291cmNlUmVmICYmIHRoaXMuZHJhZ1NvdXJjZVJlZi5jdXJyZW50O1xuICAgIH1cbiAgICBnZXQgZHJhZ1ByZXZpZXcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRyYWdQcmV2aWV3Tm9kZSB8fCB0aGlzLmRyYWdQcmV2aWV3UmVmICYmIHRoaXMuZHJhZ1ByZXZpZXdSZWYuY3VycmVudDtcbiAgICB9XG4gICAgY2xlYXJEcmFnU291cmNlKCkge1xuICAgICAgICB0aGlzLmRyYWdTb3VyY2VOb2RlID0gbnVsbDtcbiAgICAgICAgdGhpcy5kcmFnU291cmNlUmVmID0gbnVsbDtcbiAgICB9XG4gICAgY2xlYXJEcmFnUHJldmlldygpIHtcbiAgICAgICAgdGhpcy5kcmFnUHJldmlld05vZGUgPSBudWxsO1xuICAgICAgICB0aGlzLmRyYWdQcmV2aWV3UmVmID0gbnVsbDtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoYmFja2VuZCl7XG4gICAgICAgIHRoaXMuaG9va3MgPSB3cmFwQ29ubmVjdG9ySG9va3Moe1xuICAgICAgICAgICAgZHJhZ1NvdXJjZTogKG5vZGUsIG9wdGlvbnMpPT57XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckRyYWdTb3VyY2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdTb3VyY2VPcHRpb25zID0gb3B0aW9ucyB8fCBudWxsO1xuICAgICAgICAgICAgICAgIGlmIChpc1JlZihub2RlKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdTb3VyY2VSZWYgPSBub2RlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ1NvdXJjZU5vZGUgPSBub2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnJlY29ubmVjdERyYWdTb3VyY2UoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkcmFnUHJldmlldzogKG5vZGUsIG9wdGlvbnMpPT57XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckRyYWdQcmV2aWV3KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnUHJldmlld09wdGlvbnMgPSBvcHRpb25zIHx8IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKGlzUmVmKG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ1ByZXZpZXdSZWYgPSBub2RlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ1ByZXZpZXdOb2RlID0gbm9kZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5yZWNvbm5lY3REcmFnUHJldmlldygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5oYW5kbGVySWQgPSBudWxsO1xuICAgICAgICAvLyBUaGUgZHJvcCB0YXJnZXQgbWF5IGVpdGhlciBiZSBhdHRhY2hlZCB2aWEgcmVmIG9yIGNvbm5lY3QgZnVuY3Rpb25cbiAgICAgICAgdGhpcy5kcmFnU291cmNlUmVmID0gbnVsbDtcbiAgICAgICAgdGhpcy5kcmFnU291cmNlT3B0aW9uc0ludGVybmFsID0gbnVsbDtcbiAgICAgICAgLy8gVGhlIGRyYWcgcHJldmlldyBtYXkgZWl0aGVyIGJlIGF0dGFjaGVkIHZpYSByZWYgb3IgY29ubmVjdCBmdW5jdGlvblxuICAgICAgICB0aGlzLmRyYWdQcmV2aWV3UmVmID0gbnVsbDtcbiAgICAgICAgdGhpcy5kcmFnUHJldmlld09wdGlvbnNJbnRlcm5hbCA9IG51bGw7XG4gICAgICAgIHRoaXMubGFzdENvbm5lY3RlZEhhbmRsZXJJZCA9IG51bGw7XG4gICAgICAgIHRoaXMubGFzdENvbm5lY3RlZERyYWdTb3VyY2UgPSBudWxsO1xuICAgICAgICB0aGlzLmxhc3RDb25uZWN0ZWREcmFnU291cmNlT3B0aW9ucyA9IG51bGw7XG4gICAgICAgIHRoaXMubGFzdENvbm5lY3RlZERyYWdQcmV2aWV3ID0gbnVsbDtcbiAgICAgICAgdGhpcy5sYXN0Q29ubmVjdGVkRHJhZ1ByZXZpZXdPcHRpb25zID0gbnVsbDtcbiAgICAgICAgdGhpcy5iYWNrZW5kID0gYmFja2VuZDtcbiAgICB9XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVNvdXJjZUNvbm5lY3Rvci5qcy5tYXAiLCJpbXBvcnQgeyBzaGFsbG93RXF1YWwgfSBmcm9tICdAcmVhY3QtZG5kL3NoYWxsb3dlcXVhbCc7XG5pbXBvcnQgeyBpc1JlZiB9IGZyb20gJy4vaXNSZWYuanMnO1xuaW1wb3J0IHsgd3JhcENvbm5lY3Rvckhvb2tzIH0gZnJvbSAnLi93cmFwQ29ubmVjdG9ySG9va3MuanMnO1xuZXhwb3J0IGNsYXNzIFRhcmdldENvbm5lY3RvciB7XG4gICAgZ2V0IGNvbm5lY3RUYXJnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRyb3BUYXJnZXQ7XG4gICAgfVxuICAgIHJlY29ubmVjdCgpIHtcbiAgICAgICAgLy8gaWYgbm90aGluZyBoYXMgY2hhbmdlZCB0aGVuIGRvbid0IHJlc3Vic2NyaWJlXG4gICAgICAgIGNvbnN0IGRpZENoYW5nZSA9IHRoaXMuZGlkSGFuZGxlcklkQ2hhbmdlKCkgfHwgdGhpcy5kaWREcm9wVGFyZ2V0Q2hhbmdlKCkgfHwgdGhpcy5kaWRPcHRpb25zQ2hhbmdlKCk7XG4gICAgICAgIGlmIChkaWRDaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzY29ubmVjdERyb3BUYXJnZXQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkcm9wVGFyZ2V0ID0gdGhpcy5kcm9wVGFyZ2V0O1xuICAgICAgICBpZiAoIXRoaXMuaGFuZGxlcklkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkcm9wVGFyZ2V0KSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RDb25uZWN0ZWREcm9wVGFyZ2V0ID0gZHJvcFRhcmdldDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGlkQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RDb25uZWN0ZWRIYW5kbGVySWQgPSB0aGlzLmhhbmRsZXJJZDtcbiAgICAgICAgICAgIHRoaXMubGFzdENvbm5lY3RlZERyb3BUYXJnZXQgPSBkcm9wVGFyZ2V0O1xuICAgICAgICAgICAgdGhpcy5sYXN0Q29ubmVjdGVkRHJvcFRhcmdldE9wdGlvbnMgPSB0aGlzLmRyb3BUYXJnZXRPcHRpb25zO1xuICAgICAgICAgICAgdGhpcy51bnN1YnNjcmliZURyb3BUYXJnZXQgPSB0aGlzLmJhY2tlbmQuY29ubmVjdERyb3BUYXJnZXQodGhpcy5oYW5kbGVySWQsIGRyb3BUYXJnZXQsIHRoaXMuZHJvcFRhcmdldE9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlY2VpdmVIYW5kbGVySWQobmV3SGFuZGxlcklkKSB7XG4gICAgICAgIGlmIChuZXdIYW5kbGVySWQgPT09IHRoaXMuaGFuZGxlcklkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oYW5kbGVySWQgPSBuZXdIYW5kbGVySWQ7XG4gICAgICAgIHRoaXMucmVjb25uZWN0KCk7XG4gICAgfVxuICAgIGdldCBkcm9wVGFyZ2V0T3B0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZHJvcFRhcmdldE9wdGlvbnNJbnRlcm5hbDtcbiAgICB9XG4gICAgc2V0IGRyb3BUYXJnZXRPcHRpb25zKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5kcm9wVGFyZ2V0T3B0aW9uc0ludGVybmFsID0gb3B0aW9ucztcbiAgICB9XG4gICAgZGlkSGFuZGxlcklkQ2hhbmdlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0Q29ubmVjdGVkSGFuZGxlcklkICE9PSB0aGlzLmhhbmRsZXJJZDtcbiAgICB9XG4gICAgZGlkRHJvcFRhcmdldENoYW5nZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGFzdENvbm5lY3RlZERyb3BUYXJnZXQgIT09IHRoaXMuZHJvcFRhcmdldDtcbiAgICB9XG4gICAgZGlkT3B0aW9uc0NoYW5nZSgpIHtcbiAgICAgICAgcmV0dXJuICFzaGFsbG93RXF1YWwodGhpcy5sYXN0Q29ubmVjdGVkRHJvcFRhcmdldE9wdGlvbnMsIHRoaXMuZHJvcFRhcmdldE9wdGlvbnMpO1xuICAgIH1cbiAgICBkaXNjb25uZWN0RHJvcFRhcmdldCgpIHtcbiAgICAgICAgaWYgKHRoaXMudW5zdWJzY3JpYmVEcm9wVGFyZ2V0KSB7XG4gICAgICAgICAgICB0aGlzLnVuc3Vic2NyaWJlRHJvcFRhcmdldCgpO1xuICAgICAgICAgICAgdGhpcy51bnN1YnNjcmliZURyb3BUYXJnZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGRyb3BUYXJnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRyb3BUYXJnZXROb2RlIHx8IHRoaXMuZHJvcFRhcmdldFJlZiAmJiB0aGlzLmRyb3BUYXJnZXRSZWYuY3VycmVudDtcbiAgICB9XG4gICAgY2xlYXJEcm9wVGFyZ2V0KCkge1xuICAgICAgICB0aGlzLmRyb3BUYXJnZXRSZWYgPSBudWxsO1xuICAgICAgICB0aGlzLmRyb3BUYXJnZXROb2RlID0gbnVsbDtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoYmFja2VuZCl7XG4gICAgICAgIHRoaXMuaG9va3MgPSB3cmFwQ29ubmVjdG9ySG9va3Moe1xuICAgICAgICAgICAgZHJvcFRhcmdldDogKG5vZGUsIG9wdGlvbnMpPT57XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckRyb3BUYXJnZXQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyb3BUYXJnZXRPcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgICAgICAgICBpZiAoaXNSZWYobm9kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcm9wVGFyZ2V0UmVmID0gbm9kZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyb3BUYXJnZXROb2RlID0gbm9kZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5yZWNvbm5lY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuaGFuZGxlcklkID0gbnVsbDtcbiAgICAgICAgLy8gVGhlIGRyb3AgdGFyZ2V0IG1heSBlaXRoZXIgYmUgYXR0YWNoZWQgdmlhIHJlZiBvciBjb25uZWN0IGZ1bmN0aW9uXG4gICAgICAgIHRoaXMuZHJvcFRhcmdldFJlZiA9IG51bGw7XG4gICAgICAgIHRoaXMuZHJvcFRhcmdldE9wdGlvbnNJbnRlcm5hbCA9IG51bGw7XG4gICAgICAgIHRoaXMubGFzdENvbm5lY3RlZEhhbmRsZXJJZCA9IG51bGw7XG4gICAgICAgIHRoaXMubGFzdENvbm5lY3RlZERyb3BUYXJnZXQgPSBudWxsO1xuICAgICAgICB0aGlzLmxhc3RDb25uZWN0ZWREcm9wVGFyZ2V0T3B0aW9ucyA9IG51bGw7XG4gICAgICAgIHRoaXMuYmFja2VuZCA9IGJhY2tlbmQ7XG4gICAgfVxufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1UYXJnZXRDb25uZWN0b3IuanMubWFwIiwiZXhwb3J0ICogZnJvbSAnLi9EcmFnU291cmNlTW9uaXRvckltcGwuanMnO1xuZXhwb3J0ICogZnJvbSAnLi9Ecm9wVGFyZ2V0TW9uaXRvckltcGwuanMnO1xuZXhwb3J0ICogZnJvbSAnLi9yZWdpc3RyYXRpb24uanMnO1xuZXhwb3J0ICogZnJvbSAnLi9Tb3VyY2VDb25uZWN0b3IuanMnO1xuZXhwb3J0ICogZnJvbSAnLi9UYXJnZXRDb25uZWN0b3IuanMnO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJpbXBvcnQgeyBpbnZhcmlhbnQgfSBmcm9tICdAcmVhY3QtZG5kL2ludmFyaWFudCc7XG5pbXBvcnQgeyB1c2VDb250ZXh0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRG5kQ29udGV4dCB9IGZyb20gJy4uL2NvcmUvaW5kZXguanMnO1xuLyoqXG4gKiBBIGhvb2sgdG8gcmV0cmlldmUgdGhlIERyYWdEcm9wTWFuYWdlciBmcm9tIENvbnRleHRcbiAqLyBleHBvcnQgZnVuY3Rpb24gdXNlRHJhZ0Ryb3BNYW5hZ2VyKCkge1xuICAgIGNvbnN0IHsgZHJhZ0Ryb3BNYW5hZ2VyICB9ID0gdXNlQ29udGV4dChEbmRDb250ZXh0KTtcbiAgICBpbnZhcmlhbnQoZHJhZ0Ryb3BNYW5hZ2VyICE9IG51bGwsICdFeHBlY3RlZCBkcmFnIGRyb3AgY29udGV4dCcpO1xuICAgIHJldHVybiBkcmFnRHJvcE1hbmFnZXI7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVzZURyYWdEcm9wTWFuYWdlci5qcy5tYXAiLCJpbXBvcnQgeyB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgU291cmNlQ29ubmVjdG9yIH0gZnJvbSAnLi4vLi4vaW50ZXJuYWxzL2luZGV4LmpzJztcbmltcG9ydCB7IHVzZURyYWdEcm9wTWFuYWdlciB9IGZyb20gJy4uL3VzZURyYWdEcm9wTWFuYWdlci5qcyc7XG5pbXBvcnQgeyB1c2VJc29tb3JwaGljTGF5b3V0RWZmZWN0IH0gZnJvbSAnLi4vdXNlSXNvbW9ycGhpY0xheW91dEVmZmVjdC5qcyc7XG5leHBvcnQgZnVuY3Rpb24gdXNlRHJhZ1NvdXJjZUNvbm5lY3RvcihkcmFnU291cmNlT3B0aW9ucywgZHJhZ1ByZXZpZXdPcHRpb25zKSB7XG4gICAgY29uc3QgbWFuYWdlciA9IHVzZURyYWdEcm9wTWFuYWdlcigpO1xuICAgIGNvbnN0IGNvbm5lY3RvciA9IHVzZU1lbW8oKCk9Pm5ldyBTb3VyY2VDb25uZWN0b3IobWFuYWdlci5nZXRCYWNrZW5kKCkpXG4gICAgLCBbXG4gICAgICAgIG1hbmFnZXJcbiAgICBdKTtcbiAgICB1c2VJc29tb3JwaGljTGF5b3V0RWZmZWN0KCgpPT57XG4gICAgICAgIGNvbm5lY3Rvci5kcmFnU291cmNlT3B0aW9ucyA9IGRyYWdTb3VyY2VPcHRpb25zIHx8IG51bGw7XG4gICAgICAgIGNvbm5lY3Rvci5yZWNvbm5lY3QoKTtcbiAgICAgICAgcmV0dXJuICgpPT5jb25uZWN0b3IuZGlzY29ubmVjdERyYWdTb3VyY2UoKVxuICAgICAgICA7XG4gICAgfSwgW1xuICAgICAgICBjb25uZWN0b3IsXG4gICAgICAgIGRyYWdTb3VyY2VPcHRpb25zXG4gICAgXSk7XG4gICAgdXNlSXNvbW9ycGhpY0xheW91dEVmZmVjdCgoKT0+e1xuICAgICAgICBjb25uZWN0b3IuZHJhZ1ByZXZpZXdPcHRpb25zID0gZHJhZ1ByZXZpZXdPcHRpb25zIHx8IG51bGw7XG4gICAgICAgIGNvbm5lY3Rvci5yZWNvbm5lY3QoKTtcbiAgICAgICAgcmV0dXJuICgpPT5jb25uZWN0b3IuZGlzY29ubmVjdERyYWdQcmV2aWV3KClcbiAgICAgICAgO1xuICAgIH0sIFtcbiAgICAgICAgY29ubmVjdG9yLFxuICAgICAgICBkcmFnUHJldmlld09wdGlvbnNcbiAgICBdKTtcbiAgICByZXR1cm4gY29ubmVjdG9yO1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VEcmFnU291cmNlQ29ubmVjdG9yLmpzLm1hcCIsImltcG9ydCB7IHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEcmFnU291cmNlTW9uaXRvckltcGwgfSBmcm9tICcuLi8uLi9pbnRlcm5hbHMvaW5kZXguanMnO1xuaW1wb3J0IHsgdXNlRHJhZ0Ryb3BNYW5hZ2VyIH0gZnJvbSAnLi4vdXNlRHJhZ0Ryb3BNYW5hZ2VyLmpzJztcbmV4cG9ydCBmdW5jdGlvbiB1c2VEcmFnU291cmNlTW9uaXRvcigpIHtcbiAgICBjb25zdCBtYW5hZ2VyID0gdXNlRHJhZ0Ryb3BNYW5hZ2VyKCk7XG4gICAgcmV0dXJuIHVzZU1lbW8oKCk9Pm5ldyBEcmFnU291cmNlTW9uaXRvckltcGwobWFuYWdlcilcbiAgICAsIFtcbiAgICAgICAgbWFuYWdlclxuICAgIF0pO1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VEcmFnU291cmNlTW9uaXRvci5qcy5tYXAiLCJleHBvcnQgY2xhc3MgRHJhZ1NvdXJjZUltcGwge1xuICAgIGJlZ2luRHJhZygpIHtcbiAgICAgICAgY29uc3Qgc3BlYyA9IHRoaXMuc3BlYztcbiAgICAgICAgY29uc3QgbW9uaXRvciA9IHRoaXMubW9uaXRvcjtcbiAgICAgICAgbGV0IHJlc3VsdCA9IG51bGw7XG4gICAgICAgIGlmICh0eXBlb2Ygc3BlYy5pdGVtID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcmVzdWx0ID0gc3BlYy5pdGVtO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzcGVjLml0ZW0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHNwZWMuaXRlbShtb25pdG9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQgIT09IG51bGwgJiYgcmVzdWx0ICE9PSB2b2lkIDAgPyByZXN1bHQgOiBudWxsO1xuICAgIH1cbiAgICBjYW5EcmFnKCkge1xuICAgICAgICBjb25zdCBzcGVjID0gdGhpcy5zcGVjO1xuICAgICAgICBjb25zdCBtb25pdG9yID0gdGhpcy5tb25pdG9yO1xuICAgICAgICBpZiAodHlwZW9mIHNwZWMuY2FuRHJhZyA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICByZXR1cm4gc3BlYy5jYW5EcmFnO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzcGVjLmNhbkRyYWcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBzcGVjLmNhbkRyYWcobW9uaXRvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpc0RyYWdnaW5nKGdsb2JhbE1vbml0b3IsIHRhcmdldCkge1xuICAgICAgICBjb25zdCBzcGVjID0gdGhpcy5zcGVjO1xuICAgICAgICBjb25zdCBtb25pdG9yID0gdGhpcy5tb25pdG9yO1xuICAgICAgICBjb25zdCB7IGlzRHJhZ2dpbmcgIH0gPSBzcGVjO1xuICAgICAgICByZXR1cm4gaXNEcmFnZ2luZyA/IGlzRHJhZ2dpbmcobW9uaXRvcikgOiB0YXJnZXQgPT09IGdsb2JhbE1vbml0b3IuZ2V0U291cmNlSWQoKTtcbiAgICB9XG4gICAgZW5kRHJhZygpIHtcbiAgICAgICAgY29uc3Qgc3BlYyA9IHRoaXMuc3BlYztcbiAgICAgICAgY29uc3QgbW9uaXRvciA9IHRoaXMubW9uaXRvcjtcbiAgICAgICAgY29uc3QgY29ubmVjdG9yID0gdGhpcy5jb25uZWN0b3I7XG4gICAgICAgIGNvbnN0IHsgZW5kICB9ID0gc3BlYztcbiAgICAgICAgaWYgKGVuZCkge1xuICAgICAgICAgICAgZW5kKG1vbml0b3IuZ2V0SXRlbSgpLCBtb25pdG9yKTtcbiAgICAgICAgfVxuICAgICAgICBjb25uZWN0b3IucmVjb25uZWN0KCk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHNwZWMsIG1vbml0b3IsIGNvbm5lY3Rvcil7XG4gICAgICAgIHRoaXMuc3BlYyA9IHNwZWM7XG4gICAgICAgIHRoaXMubW9uaXRvciA9IG1vbml0b3I7XG4gICAgICAgIHRoaXMuY29ubmVjdG9yID0gY29ubmVjdG9yO1xuICAgIH1cbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RHJhZ1NvdXJjZUltcGwuanMubWFwIiwiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgRHJhZ1NvdXJjZUltcGwgfSBmcm9tICcuL0RyYWdTb3VyY2VJbXBsLmpzJztcbmV4cG9ydCBmdW5jdGlvbiB1c2VEcmFnU291cmNlKHNwZWMsIG1vbml0b3IsIGNvbm5lY3Rvcikge1xuICAgIGNvbnN0IGhhbmRsZXIgPSB1c2VNZW1vKCgpPT5uZXcgRHJhZ1NvdXJjZUltcGwoc3BlYywgbW9uaXRvciwgY29ubmVjdG9yKVxuICAgICwgW1xuICAgICAgICBtb25pdG9yLFxuICAgICAgICBjb25uZWN0b3JcbiAgICBdKTtcbiAgICB1c2VFZmZlY3QoKCk9PntcbiAgICAgICAgaGFuZGxlci5zcGVjID0gc3BlYztcbiAgICB9LCBbXG4gICAgICAgIHNwZWNcbiAgICBdKTtcbiAgICByZXR1cm4gaGFuZGxlcjtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlRHJhZ1NvdXJjZS5qcy5tYXAiLCJpbXBvcnQgeyBpbnZhcmlhbnQgfSBmcm9tICdAcmVhY3QtZG5kL2ludmFyaWFudCc7XG5pbXBvcnQgeyB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuZXhwb3J0IGZ1bmN0aW9uIHVzZURyYWdUeXBlKHNwZWMpIHtcbiAgICByZXR1cm4gdXNlTWVtbygoKT0+e1xuICAgICAgICBjb25zdCByZXN1bHQgPSBzcGVjLnR5cGU7XG4gICAgICAgIGludmFyaWFudChyZXN1bHQgIT0gbnVsbCwgJ3NwZWMudHlwZSBtdXN0IGJlIGRlZmluZWQnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbXG4gICAgICAgIHNwZWNcbiAgICBdKTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlRHJhZ1R5cGUuanMubWFwIiwiaW1wb3J0IHsgcmVnaXN0ZXJTb3VyY2UgfSBmcm9tICcuLi8uLi9pbnRlcm5hbHMvaW5kZXguanMnO1xuaW1wb3J0IHsgdXNlRHJhZ0Ryb3BNYW5hZ2VyIH0gZnJvbSAnLi4vdXNlRHJhZ0Ryb3BNYW5hZ2VyLmpzJztcbmltcG9ydCB7IHVzZUlzb21vcnBoaWNMYXlvdXRFZmZlY3QgfSBmcm9tICcuLi91c2VJc29tb3JwaGljTGF5b3V0RWZmZWN0LmpzJztcbmltcG9ydCB7IHVzZURyYWdTb3VyY2UgfSBmcm9tICcuL3VzZURyYWdTb3VyY2UuanMnO1xuaW1wb3J0IHsgdXNlRHJhZ1R5cGUgfSBmcm9tICcuL3VzZURyYWdUeXBlLmpzJztcbmV4cG9ydCBmdW5jdGlvbiB1c2VSZWdpc3RlcmVkRHJhZ1NvdXJjZShzcGVjLCBtb25pdG9yLCBjb25uZWN0b3IpIHtcbiAgICBjb25zdCBtYW5hZ2VyID0gdXNlRHJhZ0Ryb3BNYW5hZ2VyKCk7XG4gICAgY29uc3QgaGFuZGxlciA9IHVzZURyYWdTb3VyY2Uoc3BlYywgbW9uaXRvciwgY29ubmVjdG9yKTtcbiAgICBjb25zdCBpdGVtVHlwZSA9IHVzZURyYWdUeXBlKHNwZWMpO1xuICAgIHVzZUlzb21vcnBoaWNMYXlvdXRFZmZlY3QoZnVuY3Rpb24gcmVnaXN0ZXJEcmFnU291cmNlKCkge1xuICAgICAgICBpZiAoaXRlbVR5cGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3QgW2hhbmRsZXJJZCwgdW5yZWdpc3Rlcl0gPSByZWdpc3RlclNvdXJjZShpdGVtVHlwZSwgaGFuZGxlciwgbWFuYWdlcik7XG4gICAgICAgICAgICBtb25pdG9yLnJlY2VpdmVIYW5kbGVySWQoaGFuZGxlcklkKTtcbiAgICAgICAgICAgIGNvbm5lY3Rvci5yZWNlaXZlSGFuZGxlcklkKGhhbmRsZXJJZCk7XG4gICAgICAgICAgICByZXR1cm4gdW5yZWdpc3RlcjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfSwgW1xuICAgICAgICBtYW5hZ2VyLFxuICAgICAgICBtb25pdG9yLFxuICAgICAgICBjb25uZWN0b3IsXG4gICAgICAgIGhhbmRsZXIsXG4gICAgICAgIGl0ZW1UeXBlXG4gICAgXSk7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVzZVJlZ2lzdGVyZWREcmFnU291cmNlLmpzLm1hcCIsImltcG9ydCB7IGludmFyaWFudCB9IGZyb20gJ0ByZWFjdC1kbmQvaW52YXJpYW50JztcbmltcG9ydCB7IHVzZUNvbGxlY3RlZFByb3BzIH0gZnJvbSAnLi4vdXNlQ29sbGVjdGVkUHJvcHMuanMnO1xuaW1wb3J0IHsgdXNlT3B0aW9uYWxGYWN0b3J5IH0gZnJvbSAnLi4vdXNlT3B0aW9uYWxGYWN0b3J5LmpzJztcbmltcG9ydCB7IHVzZUNvbm5lY3REcmFnUHJldmlldywgdXNlQ29ubmVjdERyYWdTb3VyY2UgfSBmcm9tICcuL2Nvbm5lY3RvcnMuanMnO1xuaW1wb3J0IHsgdXNlRHJhZ1NvdXJjZUNvbm5lY3RvciB9IGZyb20gJy4vdXNlRHJhZ1NvdXJjZUNvbm5lY3Rvci5qcyc7XG5pbXBvcnQgeyB1c2VEcmFnU291cmNlTW9uaXRvciB9IGZyb20gJy4vdXNlRHJhZ1NvdXJjZU1vbml0b3IuanMnO1xuaW1wb3J0IHsgdXNlUmVnaXN0ZXJlZERyYWdTb3VyY2UgfSBmcm9tICcuL3VzZVJlZ2lzdGVyZWREcmFnU291cmNlLmpzJztcbi8qKlxuICogdXNlRHJhZ1NvdXJjZSBob29rXG4gKiBAcGFyYW0gc291cmNlU3BlYyBUaGUgZHJhZyBzb3VyY2Ugc3BlY2lmaWNhdGlvbiAob2JqZWN0IG9yIGZ1bmN0aW9uLCBmdW5jdGlvbiBwcmVmZXJyZWQpXG4gKiBAcGFyYW0gZGVwcyBUaGUgbWVtb2l6YXRpb24gZGVwcyBhcnJheSB0byB1c2Ugd2hlbiBldmFsdWF0aW5nIHNwZWMgY2hhbmdlc1xuICovIGV4cG9ydCBmdW5jdGlvbiB1c2VEcmFnKHNwZWNBcmcsIGRlcHMpIHtcbiAgICBjb25zdCBzcGVjID0gdXNlT3B0aW9uYWxGYWN0b3J5KHNwZWNBcmcsIGRlcHMpO1xuICAgIGludmFyaWFudCghc3BlYy5iZWdpbiwgYHVzZURyYWc6OnNwZWMuYmVnaW4gd2FzIGRlcHJlY2F0ZWQgaW4gdjE0LiBSZXBsYWNlIHNwZWMuYmVnaW4oKSB3aXRoIHNwZWMuaXRlbSgpLiAoc2VlIG1vcmUgaGVyZSAtIGh0dHBzOi8vcmVhY3QtZG5kLmdpdGh1Yi5pby9yZWFjdC1kbmQvZG9jcy9hcGkvdXNlLWRyYWcpYCk7XG4gICAgY29uc3QgbW9uaXRvciA9IHVzZURyYWdTb3VyY2VNb25pdG9yKCk7XG4gICAgY29uc3QgY29ubmVjdG9yID0gdXNlRHJhZ1NvdXJjZUNvbm5lY3RvcihzcGVjLm9wdGlvbnMsIHNwZWMucHJldmlld09wdGlvbnMpO1xuICAgIHVzZVJlZ2lzdGVyZWREcmFnU291cmNlKHNwZWMsIG1vbml0b3IsIGNvbm5lY3Rvcik7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgdXNlQ29sbGVjdGVkUHJvcHMoc3BlYy5jb2xsZWN0LCBtb25pdG9yLCBjb25uZWN0b3IpLFxuICAgICAgICB1c2VDb25uZWN0RHJhZ1NvdXJjZShjb25uZWN0b3IpLFxuICAgICAgICB1c2VDb25uZWN0RHJhZ1ByZXZpZXcoY29ubmVjdG9yKSwgXG4gICAgXTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlRHJhZy5qcy5tYXAiLCJleHBvcnQgKiBmcm9tICcuL3VzZURyYWcuanMnO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJpbXBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VDb2xsZWN0b3IgfSBmcm9tICcuL3VzZUNvbGxlY3Rvci5qcyc7XG5pbXBvcnQgeyB1c2VEcmFnRHJvcE1hbmFnZXIgfSBmcm9tICcuL3VzZURyYWdEcm9wTWFuYWdlci5qcyc7XG4vKipcbiAqIHVzZURyYWdMYXllciBIb29rXG4gKiBAcGFyYW0gY29sbGVjdG9yIFRoZSBwcm9wZXJ0eSBjb2xsZWN0b3JcbiAqLyBleHBvcnQgZnVuY3Rpb24gdXNlRHJhZ0xheWVyKGNvbGxlY3QpIHtcbiAgICBjb25zdCBkcmFnRHJvcE1hbmFnZXIgPSB1c2VEcmFnRHJvcE1hbmFnZXIoKTtcbiAgICBjb25zdCBtb25pdG9yID0gZHJhZ0Ryb3BNYW5hZ2VyLmdldE1vbml0b3IoKTtcbiAgICBjb25zdCBbY29sbGVjdGVkLCB1cGRhdGVDb2xsZWN0ZWRdID0gdXNlQ29sbGVjdG9yKG1vbml0b3IsIGNvbGxlY3QpO1xuICAgIHVzZUVmZmVjdCgoKT0+bW9uaXRvci5zdWJzY3JpYmVUb09mZnNldENoYW5nZSh1cGRhdGVDb2xsZWN0ZWQpXG4gICAgKTtcbiAgICB1c2VFZmZlY3QoKCk9Pm1vbml0b3Iuc3Vic2NyaWJlVG9TdGF0ZUNoYW5nZSh1cGRhdGVDb2xsZWN0ZWQpXG4gICAgKTtcbiAgICByZXR1cm4gY29sbGVjdGVkO1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VEcmFnTGF5ZXIuanMubWFwIiwiaW1wb3J0IHsgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmV4cG9ydCBmdW5jdGlvbiB1c2VDb25uZWN0RHJvcFRhcmdldChjb25uZWN0b3IpIHtcbiAgICByZXR1cm4gdXNlTWVtbygoKT0+Y29ubmVjdG9yLmhvb2tzLmRyb3BUYXJnZXQoKVxuICAgICwgW1xuICAgICAgICBjb25uZWN0b3JcbiAgICBdKTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29ubmVjdG9ycy5qcy5tYXAiLCJpbXBvcnQgeyB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgVGFyZ2V0Q29ubmVjdG9yIH0gZnJvbSAnLi4vLi4vaW50ZXJuYWxzL2luZGV4LmpzJztcbmltcG9ydCB7IHVzZURyYWdEcm9wTWFuYWdlciB9IGZyb20gJy4uL3VzZURyYWdEcm9wTWFuYWdlci5qcyc7XG5pbXBvcnQgeyB1c2VJc29tb3JwaGljTGF5b3V0RWZmZWN0IH0gZnJvbSAnLi4vdXNlSXNvbW9ycGhpY0xheW91dEVmZmVjdC5qcyc7XG5leHBvcnQgZnVuY3Rpb24gdXNlRHJvcFRhcmdldENvbm5lY3RvcihvcHRpb25zKSB7XG4gICAgY29uc3QgbWFuYWdlciA9IHVzZURyYWdEcm9wTWFuYWdlcigpO1xuICAgIGNvbnN0IGNvbm5lY3RvciA9IHVzZU1lbW8oKCk9Pm5ldyBUYXJnZXRDb25uZWN0b3IobWFuYWdlci5nZXRCYWNrZW5kKCkpXG4gICAgLCBbXG4gICAgICAgIG1hbmFnZXJcbiAgICBdKTtcbiAgICB1c2VJc29tb3JwaGljTGF5b3V0RWZmZWN0KCgpPT57XG4gICAgICAgIGNvbm5lY3Rvci5kcm9wVGFyZ2V0T3B0aW9ucyA9IG9wdGlvbnMgfHwgbnVsbDtcbiAgICAgICAgY29ubmVjdG9yLnJlY29ubmVjdCgpO1xuICAgICAgICByZXR1cm4gKCk9PmNvbm5lY3Rvci5kaXNjb25uZWN0RHJvcFRhcmdldCgpXG4gICAgICAgIDtcbiAgICB9LCBbXG4gICAgICAgIG9wdGlvbnNcbiAgICBdKTtcbiAgICByZXR1cm4gY29ubmVjdG9yO1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VEcm9wVGFyZ2V0Q29ubmVjdG9yLmpzLm1hcCIsImltcG9ydCB7IHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEcm9wVGFyZ2V0TW9uaXRvckltcGwgfSBmcm9tICcuLi8uLi9pbnRlcm5hbHMvaW5kZXguanMnO1xuaW1wb3J0IHsgdXNlRHJhZ0Ryb3BNYW5hZ2VyIH0gZnJvbSAnLi4vdXNlRHJhZ0Ryb3BNYW5hZ2VyLmpzJztcbmV4cG9ydCBmdW5jdGlvbiB1c2VEcm9wVGFyZ2V0TW9uaXRvcigpIHtcbiAgICBjb25zdCBtYW5hZ2VyID0gdXNlRHJhZ0Ryb3BNYW5hZ2VyKCk7XG4gICAgcmV0dXJuIHVzZU1lbW8oKCk9Pm5ldyBEcm9wVGFyZ2V0TW9uaXRvckltcGwobWFuYWdlcilcbiAgICAsIFtcbiAgICAgICAgbWFuYWdlclxuICAgIF0pO1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VEcm9wVGFyZ2V0TW9uaXRvci5qcy5tYXAiLCJpbXBvcnQgeyBpbnZhcmlhbnQgfSBmcm9tICdAcmVhY3QtZG5kL2ludmFyaWFudCc7XG5pbXBvcnQgeyB1c2VNZW1vIH0gZnJvbSAncmVhY3QnO1xuLyoqXG4gKiBJbnRlcm5hbCB1dGlsaXR5IGhvb2sgdG8gZ2V0IGFuIGFycmF5LXZlcnNpb24gb2Ygc3BlYy5hY2NlcHQuXG4gKiBUaGUgbWFpbiB1dGlsaXR5IGhlcmUgaXMgdGhhdCB3ZSBhcmVuJ3QgY3JlYXRpbmcgYSBuZXcgYXJyYXkgb24gZXZlcnkgcmVuZGVyIGlmIGEgbm9uLWFycmF5IHNwZWMuYWNjZXB0IGlzIHBhc3NlZCBpbi5cbiAqIEBwYXJhbSBzcGVjXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIHVzZUFjY2VwdChzcGVjKSB7XG4gICAgY29uc3QgeyBhY2NlcHQgIH0gPSBzcGVjO1xuICAgIHJldHVybiB1c2VNZW1vKCgpPT57XG4gICAgICAgIGludmFyaWFudChzcGVjLmFjY2VwdCAhPSBudWxsLCAnYWNjZXB0IG11c3QgYmUgZGVmaW5lZCcpO1xuICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhY2NlcHQpID8gYWNjZXB0IDogW1xuICAgICAgICAgICAgYWNjZXB0XG4gICAgICAgIF07XG4gICAgfSwgW1xuICAgICAgICBhY2NlcHRcbiAgICBdKTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlQWNjZXB0LmpzLm1hcCIsImV4cG9ydCBjbGFzcyBEcm9wVGFyZ2V0SW1wbCB7XG4gICAgY2FuRHJvcCgpIHtcbiAgICAgICAgY29uc3Qgc3BlYyA9IHRoaXMuc3BlYztcbiAgICAgICAgY29uc3QgbW9uaXRvciA9IHRoaXMubW9uaXRvcjtcbiAgICAgICAgcmV0dXJuIHNwZWMuY2FuRHJvcCA/IHNwZWMuY2FuRHJvcChtb25pdG9yLmdldEl0ZW0oKSwgbW9uaXRvcikgOiB0cnVlO1xuICAgIH1cbiAgICBob3ZlcigpIHtcbiAgICAgICAgY29uc3Qgc3BlYyA9IHRoaXMuc3BlYztcbiAgICAgICAgY29uc3QgbW9uaXRvciA9IHRoaXMubW9uaXRvcjtcbiAgICAgICAgaWYgKHNwZWMuaG92ZXIpIHtcbiAgICAgICAgICAgIHNwZWMuaG92ZXIobW9uaXRvci5nZXRJdGVtKCksIG1vbml0b3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRyb3AoKSB7XG4gICAgICAgIGNvbnN0IHNwZWMgPSB0aGlzLnNwZWM7XG4gICAgICAgIGNvbnN0IG1vbml0b3IgPSB0aGlzLm1vbml0b3I7XG4gICAgICAgIGlmIChzcGVjLmRyb3ApIHtcbiAgICAgICAgICAgIHJldHVybiBzcGVjLmRyb3AobW9uaXRvci5nZXRJdGVtKCksIG1vbml0b3IpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3RydWN0b3Ioc3BlYywgbW9uaXRvcil7XG4gICAgICAgIHRoaXMuc3BlYyA9IHNwZWM7XG4gICAgICAgIHRoaXMubW9uaXRvciA9IG1vbml0b3I7XG4gICAgfVxufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1Ecm9wVGFyZ2V0SW1wbC5qcy5tYXAiLCJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8gfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBEcm9wVGFyZ2V0SW1wbCB9IGZyb20gJy4vRHJvcFRhcmdldEltcGwuanMnO1xuZXhwb3J0IGZ1bmN0aW9uIHVzZURyb3BUYXJnZXQoc3BlYywgbW9uaXRvcikge1xuICAgIGNvbnN0IGRyb3BUYXJnZXQgPSB1c2VNZW1vKCgpPT5uZXcgRHJvcFRhcmdldEltcGwoc3BlYywgbW9uaXRvcilcbiAgICAsIFtcbiAgICAgICAgbW9uaXRvclxuICAgIF0pO1xuICAgIHVzZUVmZmVjdCgoKT0+e1xuICAgICAgICBkcm9wVGFyZ2V0LnNwZWMgPSBzcGVjO1xuICAgIH0sIFtcbiAgICAgICAgc3BlY1xuICAgIF0pO1xuICAgIHJldHVybiBkcm9wVGFyZ2V0O1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VEcm9wVGFyZ2V0LmpzLm1hcCIsImltcG9ydCB7IHJlZ2lzdGVyVGFyZ2V0IH0gZnJvbSAnLi4vLi4vaW50ZXJuYWxzL2luZGV4LmpzJztcbmltcG9ydCB7IHVzZURyYWdEcm9wTWFuYWdlciB9IGZyb20gJy4uL3VzZURyYWdEcm9wTWFuYWdlci5qcyc7XG5pbXBvcnQgeyB1c2VJc29tb3JwaGljTGF5b3V0RWZmZWN0IH0gZnJvbSAnLi4vdXNlSXNvbW9ycGhpY0xheW91dEVmZmVjdC5qcyc7XG5pbXBvcnQgeyB1c2VBY2NlcHQgfSBmcm9tICcuL3VzZUFjY2VwdC5qcyc7XG5pbXBvcnQgeyB1c2VEcm9wVGFyZ2V0IH0gZnJvbSAnLi91c2VEcm9wVGFyZ2V0LmpzJztcbmV4cG9ydCBmdW5jdGlvbiB1c2VSZWdpc3RlcmVkRHJvcFRhcmdldChzcGVjLCBtb25pdG9yLCBjb25uZWN0b3IpIHtcbiAgICBjb25zdCBtYW5hZ2VyID0gdXNlRHJhZ0Ryb3BNYW5hZ2VyKCk7XG4gICAgY29uc3QgZHJvcFRhcmdldCA9IHVzZURyb3BUYXJnZXQoc3BlYywgbW9uaXRvcik7XG4gICAgY29uc3QgYWNjZXB0ID0gdXNlQWNjZXB0KHNwZWMpO1xuICAgIHVzZUlzb21vcnBoaWNMYXlvdXRFZmZlY3QoZnVuY3Rpb24gcmVnaXN0ZXJEcm9wVGFyZ2V0KCkge1xuICAgICAgICBjb25zdCBbaGFuZGxlcklkLCB1bnJlZ2lzdGVyXSA9IHJlZ2lzdGVyVGFyZ2V0KGFjY2VwdCwgZHJvcFRhcmdldCwgbWFuYWdlcik7XG4gICAgICAgIG1vbml0b3IucmVjZWl2ZUhhbmRsZXJJZChoYW5kbGVySWQpO1xuICAgICAgICBjb25uZWN0b3IucmVjZWl2ZUhhbmRsZXJJZChoYW5kbGVySWQpO1xuICAgICAgICByZXR1cm4gdW5yZWdpc3RlcjtcbiAgICB9LCBbXG4gICAgICAgIG1hbmFnZXIsXG4gICAgICAgIG1vbml0b3IsXG4gICAgICAgIGRyb3BUYXJnZXQsXG4gICAgICAgIGNvbm5lY3RvcixcbiAgICAgICAgYWNjZXB0Lm1hcCgoYSk9PmEudG9TdHJpbmcoKVxuICAgICAgICApLmpvaW4oJ3wnKSwgXG4gICAgXSk7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVzZVJlZ2lzdGVyZWREcm9wVGFyZ2V0LmpzLm1hcCIsImltcG9ydCB7IHVzZUNvbGxlY3RlZFByb3BzIH0gZnJvbSAnLi4vdXNlQ29sbGVjdGVkUHJvcHMuanMnO1xuaW1wb3J0IHsgdXNlT3B0aW9uYWxGYWN0b3J5IH0gZnJvbSAnLi4vdXNlT3B0aW9uYWxGYWN0b3J5LmpzJztcbmltcG9ydCB7IHVzZUNvbm5lY3REcm9wVGFyZ2V0IH0gZnJvbSAnLi9jb25uZWN0b3JzLmpzJztcbmltcG9ydCB7IHVzZURyb3BUYXJnZXRDb25uZWN0b3IgfSBmcm9tICcuL3VzZURyb3BUYXJnZXRDb25uZWN0b3IuanMnO1xuaW1wb3J0IHsgdXNlRHJvcFRhcmdldE1vbml0b3IgfSBmcm9tICcuL3VzZURyb3BUYXJnZXRNb25pdG9yLmpzJztcbmltcG9ydCB7IHVzZVJlZ2lzdGVyZWREcm9wVGFyZ2V0IH0gZnJvbSAnLi91c2VSZWdpc3RlcmVkRHJvcFRhcmdldC5qcyc7XG4vKipcbiAqIHVzZURyb3BUYXJnZXQgSG9va1xuICogQHBhcmFtIHNwZWMgVGhlIGRyb3AgdGFyZ2V0IHNwZWNpZmljYXRpb24gKG9iamVjdCBvciBmdW5jdGlvbiwgZnVuY3Rpb24gcHJlZmVycmVkKVxuICogQHBhcmFtIGRlcHMgVGhlIG1lbW9pemF0aW9uIGRlcHMgYXJyYXkgdG8gdXNlIHdoZW4gZXZhbHVhdGluZyBzcGVjIGNoYW5nZXNcbiAqLyBleHBvcnQgZnVuY3Rpb24gdXNlRHJvcChzcGVjQXJnLCBkZXBzKSB7XG4gICAgY29uc3Qgc3BlYyA9IHVzZU9wdGlvbmFsRmFjdG9yeShzcGVjQXJnLCBkZXBzKTtcbiAgICBjb25zdCBtb25pdG9yID0gdXNlRHJvcFRhcmdldE1vbml0b3IoKTtcbiAgICBjb25zdCBjb25uZWN0b3IgPSB1c2VEcm9wVGFyZ2V0Q29ubmVjdG9yKHNwZWMub3B0aW9ucyk7XG4gICAgdXNlUmVnaXN0ZXJlZERyb3BUYXJnZXQoc3BlYywgbW9uaXRvciwgY29ubmVjdG9yKTtcbiAgICByZXR1cm4gW1xuICAgICAgICB1c2VDb2xsZWN0ZWRQcm9wcyhzcGVjLmNvbGxlY3QsIG1vbml0b3IsIGNvbm5lY3RvciksXG4gICAgICAgIHVzZUNvbm5lY3REcm9wVGFyZ2V0KGNvbm5lY3RvciksIFxuICAgIF07XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVzZURyb3AuanMubWFwIiwiZXhwb3J0ICogZnJvbSAnLi91c2VEcm9wLmpzJztcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiZXhwb3J0ICogZnJvbSAnLi90eXBlcy5qcyc7XG5leHBvcnQgKiBmcm9tICcuL3VzZURyYWcvaW5kZXguanMnO1xuZXhwb3J0ICogZnJvbSAnLi91c2VEcmFnRHJvcE1hbmFnZXIuanMnO1xuZXhwb3J0ICogZnJvbSAnLi91c2VEcmFnTGF5ZXIuanMnO1xuZXhwb3J0ICogZnJvbSAnLi91c2VEcm9wL2luZGV4LmpzJztcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiZXhwb3J0IHsgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29ubmVjdG9ycy5qcy5tYXAiLCJleHBvcnQgeyB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1tb25pdG9ycy5qcy5tYXAiLCJleHBvcnQgeyB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1vcHRpb25zLmpzLm1hcCIsImV4cG9ydCAqIGZyb20gJy4vY29ubmVjdG9ycy5qcyc7XG5leHBvcnQgKiBmcm9tICcuL21vbml0b3JzLmpzJztcbmV4cG9ydCAqIGZyb20gJy4vb3B0aW9ucy5qcyc7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsImV4cG9ydCAqIGZyb20gJy4vY29yZS9pbmRleC5qcyc7XG5leHBvcnQgKiBmcm9tICcuL2hvb2tzL2luZGV4LmpzJztcbmV4cG9ydCAqIGZyb20gJy4vdHlwZXMvaW5kZXguanMnO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCIvLyBTYWZhcmkgNiBhbmQgNi4xIGZvciBkZXNrdG9wLCBpUGFkLCBhbmQgaVBob25lIGFyZSB0aGUgb25seSBicm93c2VycyB0aGF0XG4vLyBoYXZlIFdlYktpdE11dGF0aW9uT2JzZXJ2ZXIgYnV0IG5vdCB1bi1wcmVmaXhlZCBNdXRhdGlvbk9ic2VydmVyLlxuLy8gTXVzdCB1c2UgYGdsb2JhbGAgb3IgYHNlbGZgIGluc3RlYWQgb2YgYHdpbmRvd2AgdG8gd29yayBpbiBib3RoIGZyYW1lcyBhbmQgd2ViXG4vLyB3b3JrZXJzLiBgZ2xvYmFsYCBpcyBhIHByb3Zpc2lvbiBvZiBCcm93c2VyaWZ5LCBNciwgTXJzLCBvciBNb3AuXG4vKiBnbG9iYWxzIHNlbGYgKi8gY29uc3Qgc2NvcGUgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHNlbGY7XG5jb25zdCBCcm93c2VyTXV0YXRpb25PYnNlcnZlciA9IHNjb3BlLk11dGF0aW9uT2JzZXJ2ZXIgfHwgc2NvcGUuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcbmV4cG9ydCBmdW5jdGlvbiBtYWtlUmVxdWVzdENhbGxGcm9tVGltZXIoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gcmVxdWVzdENhbGwoKSB7XG4gICAgICAgIC8vIFdlIGRpc3BhdGNoIGEgdGltZW91dCB3aXRoIGEgc3BlY2lmaWVkIGRlbGF5IG9mIDAgZm9yIGVuZ2luZXMgdGhhdFxuICAgICAgICAvLyBjYW4gcmVsaWFibHkgYWNjb21tb2RhdGUgdGhhdCByZXF1ZXN0LiBUaGlzIHdpbGwgdXN1YWxseSBiZSBzbmFwcGVkXG4gICAgICAgIC8vIHRvIGEgNCBtaWxpc2Vjb25kIGRlbGF5LCBidXQgb25jZSB3ZSdyZSBmbHVzaGluZywgdGhlcmUncyBubyBkZWxheVxuICAgICAgICAvLyBiZXR3ZWVuIGV2ZW50cy5cbiAgICAgICAgY29uc3QgdGltZW91dEhhbmRsZSA9IHNldFRpbWVvdXQoaGFuZGxlVGltZXIsIDApO1xuICAgICAgICAvLyBIb3dldmVyLCBzaW5jZSB0aGlzIHRpbWVyIGdldHMgZnJlcXVlbnRseSBkcm9wcGVkIGluIEZpcmVmb3hcbiAgICAgICAgLy8gd29ya2Vycywgd2UgZW5saXN0IGFuIGludGVydmFsIGhhbmRsZSB0aGF0IHdpbGwgdHJ5IHRvIGZpcmVcbiAgICAgICAgLy8gYW4gZXZlbnQgMjAgdGltZXMgcGVyIHNlY29uZCB1bnRpbCBpdCBzdWNjZWVkcy5cbiAgICAgICAgY29uc3QgaW50ZXJ2YWxIYW5kbGUgPSBzZXRJbnRlcnZhbChoYW5kbGVUaW1lciwgNTApO1xuICAgICAgICBmdW5jdGlvbiBoYW5kbGVUaW1lcigpIHtcbiAgICAgICAgICAgIC8vIFdoaWNoZXZlciB0aW1lciBzdWNjZWVkcyB3aWxsIGNhbmNlbCBib3RoIHRpbWVycyBhbmRcbiAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIGNhbGxiYWNrLlxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRIYW5kbGUpO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbEhhbmRsZSk7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbi8vIFRvIHJlcXVlc3QgYSBoaWdoIHByaW9yaXR5IGV2ZW50LCB3ZSBpbmR1Y2UgYSBtdXRhdGlvbiBvYnNlcnZlciBieSB0b2dnbGluZ1xuLy8gdGhlIHRleHQgb2YgYSB0ZXh0IG5vZGUgYmV0d2VlbiBcIjFcIiBhbmQgXCItMVwiLlxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VSZXF1ZXN0Q2FsbEZyb21NdXRhdGlvbk9ic2VydmVyKGNhbGxiYWNrKSB7XG4gICAgbGV0IHRvZ2dsZSA9IDE7XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIoY2FsbGJhY2spO1xuICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShub2RlLCB7XG4gICAgICAgIGNoYXJhY3RlckRhdGE6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gZnVuY3Rpb24gcmVxdWVzdENhbGwoKSB7XG4gICAgICAgIHRvZ2dsZSA9IC10b2dnbGU7XG4gICAgICAgIG5vZGUuZGF0YSA9IHRvZ2dsZTtcbiAgICB9O1xufVxuZXhwb3J0IGNvbnN0IG1ha2VSZXF1ZXN0Q2FsbCA9IHR5cGVvZiBCcm93c2VyTXV0YXRpb25PYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJyA/IC8vIHJlbGlhYmx5IGV2ZXJ5d2hlcmUgdGhleSBhcmUgaW1wbGVtZW50ZWQuXG4vLyBUaGV5IGFyZSBpbXBsZW1lbnRlZCBpbiBhbGwgbW9kZXJuIGJyb3dzZXJzLlxuLy9cbi8vIC0gQW5kcm9pZCA0LTQuM1xuLy8gLSBDaHJvbWUgMjYtMzRcbi8vIC0gRmlyZWZveCAxNC0yOVxuLy8gLSBJbnRlcm5ldCBFeHBsb3JlciAxMVxuLy8gLSBpUGFkIFNhZmFyaSA2LTcuMVxuLy8gLSBpUGhvbmUgU2FmYXJpIDctNy4xXG4vLyAtIFNhZmFyaSA2LTdcbm1ha2VSZXF1ZXN0Q2FsbEZyb21NdXRhdGlvbk9ic2VydmVyIDogLy8gdGFzayBxdWV1ZSwgYXJlIGltcGxlbWVudGVkIGluIEludGVybmV0IEV4cGxvcmVyIDEwLCBTYWZhcmkgNS4wLTEsIGFuZCBPcGVyYVxuLy8gMTEtMTIsIGFuZCBpbiB3ZWIgd29ya2VycyBpbiBtYW55IGVuZ2luZXMuXG4vLyBBbHRob3VnaCBtZXNzYWdlIGNoYW5uZWxzIHlpZWxkIHRvIGFueSBxdWV1ZWQgcmVuZGVyaW5nIGFuZCBJTyB0YXNrcywgdGhleVxuLy8gd291bGQgYmUgYmV0dGVyIHRoYW4gaW1wb3NpbmcgdGhlIDRtcyBkZWxheSBvZiB0aW1lcnMuXG4vLyBIb3dldmVyLCB0aGV5IGRvIG5vdCB3b3JrIHJlbGlhYmx5IGluIEludGVybmV0IEV4cGxvcmVyIG9yIFNhZmFyaS5cbi8vIEludGVybmV0IEV4cGxvcmVyIDEwIGlzIHRoZSBvbmx5IGJyb3dzZXIgdGhhdCBoYXMgc2V0SW1tZWRpYXRlIGJ1dCBkb2VzXG4vLyBub3QgaGF2ZSBNdXRhdGlvbk9ic2VydmVycy5cbi8vIEFsdGhvdWdoIHNldEltbWVkaWF0ZSB5aWVsZHMgdG8gdGhlIGJyb3dzZXIncyByZW5kZXJlciwgaXQgd291bGQgYmVcbi8vIHByZWZlcnJhYmxlIHRvIGZhbGxpbmcgYmFjayB0byBzZXRUaW1lb3V0IHNpbmNlIGl0IGRvZXMgbm90IGhhdmVcbi8vIHRoZSBtaW5pbXVtIDRtcyBwZW5hbHR5LlxuLy8gVW5mb3J0dW5hdGVseSB0aGVyZSBhcHBlYXJzIHRvIGJlIGEgYnVnIGluIEludGVybmV0IEV4cGxvcmVyIDEwIE1vYmlsZSAoYW5kXG4vLyBEZXNrdG9wIHRvIGEgbGVzc2VyIGV4dGVudCkgdGhhdCByZW5kZXJzIGJvdGggc2V0SW1tZWRpYXRlIGFuZFxuLy8gTWVzc2FnZUNoYW5uZWwgdXNlbGVzcyBmb3IgdGhlIHB1cnBvc2VzIG9mIEFTQVAuXG4vLyBodHRwczovL2dpdGh1Yi5jb20va3Jpc2tvd2FsL3EvaXNzdWVzLzM5NlxuLy8gVGltZXJzIGFyZSBpbXBsZW1lbnRlZCB1bml2ZXJzYWxseS5cbi8vIFdlIGZhbGwgYmFjayB0byB0aW1lcnMgaW4gd29ya2VycyBpbiBtb3N0IGVuZ2luZXMsIGFuZCBpbiBmb3JlZ3JvdW5kXG4vLyBjb250ZXh0cyBpbiB0aGUgZm9sbG93aW5nIGJyb3dzZXJzLlxuLy8gSG93ZXZlciwgbm90ZSB0aGF0IGV2ZW4gdGhpcyBzaW1wbGUgY2FzZSByZXF1aXJlcyBudWFuY2VzIHRvIG9wZXJhdGUgaW4gYVxuLy8gYnJvYWQgc3BlY3RydW0gb2YgYnJvd3NlcnMuXG4vL1xuLy8gLSBGaXJlZm94IDMtMTNcbi8vIC0gSW50ZXJuZXQgRXhwbG9yZXIgNi05XG4vLyAtIGlQYWQgU2FmYXJpIDQuM1xuLy8gLSBMeW54IDIuOC43XG5tYWtlUmVxdWVzdENhbGxGcm9tVGltZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1ha2VSZXF1ZXN0Q2FsbC5qcy5tYXAiLCIvKiBlc2xpbnQtZGlzYWJsZSBuby1yZXN0cmljdGVkLWdsb2JhbHMsIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudCwgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uICovIGltcG9ydCB7IG1ha2VSZXF1ZXN0Q2FsbCwgbWFrZVJlcXVlc3RDYWxsRnJvbVRpbWVyIH0gZnJvbSAnLi9tYWtlUmVxdWVzdENhbGwuanMnO1xuZXhwb3J0IGNsYXNzIEFzYXBRdWV1ZSB7XG4gICAgLy8gVXNlIHRoZSBmYXN0ZXN0IG1lYW5zIHBvc3NpYmxlIHRvIGV4ZWN1dGUgYSB0YXNrIGluIGl0cyBvd24gdHVybiwgd2l0aFxuICAgIC8vIHByaW9yaXR5IG92ZXIgb3RoZXIgZXZlbnRzIGluY2x1ZGluZyBJTywgYW5pbWF0aW9uLCByZWZsb3csIGFuZCByZWRyYXdcbiAgICAvLyBldmVudHMgaW4gYnJvd3NlcnMuXG4gICAgLy9cbiAgICAvLyBBbiBleGNlcHRpb24gdGhyb3duIGJ5IGEgdGFzayB3aWxsIHBlcm1hbmVudGx5IGludGVycnVwdCB0aGUgcHJvY2Vzc2luZyBvZlxuICAgIC8vIHN1YnNlcXVlbnQgdGFza3MuIFRoZSBoaWdoZXIgbGV2ZWwgYGFzYXBgIGZ1bmN0aW9uIGVuc3VyZXMgdGhhdCBpZiBhblxuICAgIC8vIGV4Y2VwdGlvbiBpcyB0aHJvd24gYnkgYSB0YXNrLCB0aGF0IHRoZSB0YXNrIHF1ZXVlIHdpbGwgY29udGludWUgZmx1c2hpbmcgYXNcbiAgICAvLyBzb29uIGFzIHBvc3NpYmxlLCBidXQgaWYgeW91IHVzZSBgcmF3QXNhcGAgZGlyZWN0bHksIHlvdSBhcmUgcmVzcG9uc2libGUgdG9cbiAgICAvLyBlaXRoZXIgZW5zdXJlIHRoYXQgbm8gZXhjZXB0aW9ucyBhcmUgdGhyb3duIGZyb20geW91ciB0YXNrLCBvciB0byBtYW51YWxseVxuICAgIC8vIGNhbGwgYHJhd0FzYXAucmVxdWVzdEZsdXNoYCBpZiBhbiBleGNlcHRpb24gaXMgdGhyb3duLlxuICAgIGVucXVldWVUYXNrKHRhc2spIHtcbiAgICAgICAgY29uc3QgeyBxdWV1ZTogcSAsIHJlcXVlc3RGbHVzaCAgfSA9IHRoaXM7XG4gICAgICAgIGlmICghcS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlcXVlc3RGbHVzaCgpO1xuICAgICAgICAgICAgdGhpcy5mbHVzaGluZyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gRXF1aXZhbGVudCB0byBwdXNoLCBidXQgYXZvaWRzIGEgZnVuY3Rpb24gY2FsbC5cbiAgICAgICAgcVtxLmxlbmd0aF0gPSB0YXNrO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgICAgIC8vIFdlIHF1ZXVlIGVycm9ycyB0byBlbnN1cmUgdGhleSBhcmUgdGhyb3duIGluIHJpZ2h0IG9yZGVyIChGSUZPKS5cbiAgICAgICAgLy8gQXJyYXktYXMtcXVldWUgaXMgZ29vZCBlbm91Z2ggaGVyZSwgc2luY2Ugd2UgYXJlIGp1c3QgZGVhbGluZyB3aXRoIGV4Y2VwdGlvbnMuXG4gICAgICAgIHRoaXMucGVuZGluZ0Vycm9ycyA9IFtdO1xuICAgICAgICAvLyBPbmNlIGEgZmx1c2ggaGFzIGJlZW4gcmVxdWVzdGVkLCBubyBmdXJ0aGVyIGNhbGxzIHRvIGByZXF1ZXN0Rmx1c2hgIGFyZVxuICAgICAgICAvLyBuZWNlc3NhcnkgdW50aWwgdGhlIG5leHQgYGZsdXNoYCBjb21wbGV0ZXMuXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy5mbHVzaGluZyA9IGZhbHNlO1xuICAgICAgICAvLyBUaGUgcG9zaXRpb24gb2YgdGhlIG5leHQgdGFzayB0byBleGVjdXRlIGluIHRoZSB0YXNrIHF1ZXVlLiBUaGlzIGlzXG4gICAgICAgIC8vIHByZXNlcnZlZCBiZXR3ZWVuIGNhbGxzIHRvIGBmbHVzaGAgc28gdGhhdCBpdCBjYW4gYmUgcmVzdW1lZCBpZlxuICAgICAgICAvLyBhIHRhc2sgdGhyb3dzIGFuIGV4Y2VwdGlvbi5cbiAgICAgICAgdGhpcy5pbmRleCA9IDA7XG4gICAgICAgIC8vIElmIGEgdGFzayBzY2hlZHVsZXMgYWRkaXRpb25hbCB0YXNrcyByZWN1cnNpdmVseSwgdGhlIHRhc2sgcXVldWUgY2FuIGdyb3dcbiAgICAgICAgLy8gdW5ib3VuZGVkLiBUbyBwcmV2ZW50IG1lbW9yeSBleGhhdXN0aW9uLCB0aGUgdGFzayBxdWV1ZSB3aWxsIHBlcmlvZGljYWxseVxuICAgICAgICAvLyB0cnVuY2F0ZSBhbHJlYWR5LWNvbXBsZXRlZCB0YXNrcy5cbiAgICAgICAgdGhpcy5jYXBhY2l0eSA9IDEwMjQ7XG4gICAgICAgIC8vIFRoZSBmbHVzaCBmdW5jdGlvbiBwcm9jZXNzZXMgYWxsIHRhc2tzIHRoYXQgaGF2ZSBiZWVuIHNjaGVkdWxlZCB3aXRoXG4gICAgICAgIC8vIGByYXdBc2FwYCB1bmxlc3MgYW5kIHVudGlsIG9uZSBvZiB0aG9zZSB0YXNrcyB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuICAgICAgICAvLyBJZiBhIHRhc2sgdGhyb3dzIGFuIGV4Y2VwdGlvbiwgYGZsdXNoYCBlbnN1cmVzIHRoYXQgaXRzIHN0YXRlIHdpbGwgcmVtYWluXG4gICAgICAgIC8vIGNvbnNpc3RlbnQgYW5kIHdpbGwgcmVzdW1lIHdoZXJlIGl0IGxlZnQgb2ZmIHdoZW4gY2FsbGVkIGFnYWluLlxuICAgICAgICAvLyBIb3dldmVyLCBgZmx1c2hgIGRvZXMgbm90IG1ha2UgYW55IGFycmFuZ2VtZW50cyB0byBiZSBjYWxsZWQgYWdhaW4gaWYgYW5cbiAgICAgICAgLy8gZXhjZXB0aW9uIGlzIHRocm93bi5cbiAgICAgICAgdGhpcy5mbHVzaCA9ICgpPT57XG4gICAgICAgICAgICBjb25zdCB7IHF1ZXVlOiBxICB9ID0gdGhpcztcbiAgICAgICAgICAgIHdoaWxlKHRoaXMuaW5kZXggPCBxLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gdGhpcy5pbmRleDtcbiAgICAgICAgICAgICAgICAvLyBBZHZhbmNlIHRoZSBpbmRleCBiZWZvcmUgY2FsbGluZyB0aGUgdGFzay4gVGhpcyBlbnN1cmVzIHRoYXQgd2Ugd2lsbFxuICAgICAgICAgICAgICAgIC8vIGJlZ2luIGZsdXNoaW5nIG9uIHRoZSBuZXh0IHRhc2sgdGhlIHRhc2sgdGhyb3dzIGFuIGVycm9yLlxuICAgICAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgICAgICAgICBxW2N1cnJlbnRJbmRleF0uY2FsbCgpO1xuICAgICAgICAgICAgICAgIC8vIFByZXZlbnQgbGVha2luZyBtZW1vcnkgZm9yIGxvbmcgY2hhaW5zIG9mIHJlY3Vyc2l2ZSBjYWxscyB0byBgYXNhcGAuXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgY2FsbCBgYXNhcGAgd2l0aGluIHRhc2tzIHNjaGVkdWxlZCBieSBgYXNhcGAsIHRoZSBxdWV1ZSB3aWxsXG4gICAgICAgICAgICAgICAgLy8gZ3JvdywgYnV0IHRvIGF2b2lkIGFuIE8obikgd2FsayBmb3IgZXZlcnkgdGFzayB3ZSBleGVjdXRlLCB3ZSBkb24ndFxuICAgICAgICAgICAgICAgIC8vIHNoaWZ0IHRhc2tzIG9mZiB0aGUgcXVldWUgYWZ0ZXIgdGhleSBoYXZlIGJlZW4gZXhlY3V0ZWQuXG4gICAgICAgICAgICAgICAgLy8gSW5zdGVhZCwgd2UgcGVyaW9kaWNhbGx5IHNoaWZ0IDEwMjQgdGFza3Mgb2ZmIHRoZSBxdWV1ZS5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRleCA+IHRoaXMuY2FwYWNpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTWFudWFsbHkgc2hpZnQgYWxsIHZhbHVlcyBzdGFydGluZyBhdCB0aGUgaW5kZXggYmFjayB0byB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gYmVnaW5uaW5nIG9mIHRoZSBxdWV1ZS5cbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBzY2FuID0gMCwgbmV3TGVuZ3RoID0gcS5sZW5ndGggLSB0aGlzLmluZGV4OyBzY2FuIDwgbmV3TGVuZ3RoOyBzY2FuKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgcVtzY2FuXSA9IHFbc2NhbiArIHRoaXMuaW5kZXhdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHEubGVuZ3RoIC09IHRoaXMuaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5kZXggPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHEubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSAwO1xuICAgICAgICAgICAgdGhpcy5mbHVzaGluZyA9IGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICAvLyBJbiBhIHdlYiBicm93c2VyLCBleGNlcHRpb25zIGFyZSBub3QgZmF0YWwuIEhvd2V2ZXIsIHRvIGF2b2lkXG4gICAgICAgIC8vIHNsb3dpbmcgZG93biB0aGUgcXVldWUgb2YgcGVuZGluZyB0YXNrcywgd2UgcmV0aHJvdyB0aGUgZXJyb3IgaW4gYVxuICAgICAgICAvLyBsb3dlciBwcmlvcml0eSB0dXJuLlxuICAgICAgICB0aGlzLnJlZ2lzdGVyUGVuZGluZ0Vycm9yID0gKGVycik9PntcbiAgICAgICAgICAgIHRoaXMucGVuZGluZ0Vycm9ycy5wdXNoKGVycik7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RFcnJvclRocm93KCk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIGByZXF1ZXN0Rmx1c2hgIHJlcXVlc3RzIHRoYXQgdGhlIGhpZ2ggcHJpb3JpdHkgZXZlbnQgcXVldWUgYmUgZmx1c2hlZCBhc1xuICAgICAgICAvLyBzb29uIGFzIHBvc3NpYmxlLlxuICAgICAgICAvLyBUaGlzIGlzIHVzZWZ1bCB0byBwcmV2ZW50IGFuIGVycm9yIHRocm93biBpbiBhIHRhc2sgZnJvbSBzdGFsbGluZyB0aGUgZXZlbnRcbiAgICAgICAgLy8gcXVldWUgaWYgdGhlIGV4Y2VwdGlvbiBoYW5kbGVkIGJ5IE5vZGUuanPigJlzXG4gICAgICAgIC8vIGBwcm9jZXNzLm9uKFwidW5jYXVnaHRFeGNlcHRpb25cIilgIG9yIGJ5IGEgZG9tYWluLlxuICAgICAgICAvLyBgcmVxdWVzdEZsdXNoYCBpcyBpbXBsZW1lbnRlZCB1c2luZyBhIHN0cmF0ZWd5IGJhc2VkIG9uIGRhdGEgY29sbGVjdGVkIGZyb21cbiAgICAgICAgLy8gZXZlcnkgYXZhaWxhYmxlIFNhdWNlTGFicyBTZWxlbml1bSB3ZWIgZHJpdmVyIHdvcmtlciBhdCB0aW1lIG9mIHdyaXRpbmcuXG4gICAgICAgIC8vIGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL3NwcmVhZHNoZWV0cy9kLzFtRy01VVlHdXA1cXhHZEVNV2toUDZCV0N6MDUzTlViMkUxUW9VVFUxNnVBL2VkaXQjZ2lkPTc4MzcyNDU5M1xuICAgICAgICB0aGlzLnJlcXVlc3RGbHVzaCA9IG1ha2VSZXF1ZXN0Q2FsbCh0aGlzLmZsdXNoKTtcbiAgICAgICAgdGhpcy5yZXF1ZXN0RXJyb3JUaHJvdyA9IG1ha2VSZXF1ZXN0Q2FsbEZyb21UaW1lcigoKT0+e1xuICAgICAgICAgICAgLy8gVGhyb3cgZmlyc3QgZXJyb3JcbiAgICAgICAgICAgIGlmICh0aGlzLnBlbmRpbmdFcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgdGhpcy5wZW5kaW5nRXJyb3JzLnNoaWZ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0gLy8gVGhlIG1lc3NhZ2UgY2hhbm5lbCB0ZWNobmlxdWUgd2FzIGRpc2NvdmVyZWQgYnkgTWFsdGUgVWJsIGFuZCB3YXMgdGhlXG4gLy8gb3JpZ2luYWwgZm91bmRhdGlvbiBmb3IgdGhpcyBsaWJyYXJ5LlxuIC8vIGh0dHA6Ly93d3cubm9uYmxvY2tpbmcuaW8vMjAxMS8wNi93aW5kb3duZXh0dGljay5odG1sXG4gLy8gU2FmYXJpIDYuMC41IChhdCBsZWFzdCkgaW50ZXJtaXR0ZW50bHkgZmFpbHMgdG8gY3JlYXRlIG1lc3NhZ2UgcG9ydHMgb24gYVxuIC8vIHBhZ2UncyBmaXJzdCBsb2FkLiBUaGFua2Z1bGx5LCB0aGlzIHZlcnNpb24gb2YgU2FmYXJpIHN1cHBvcnRzXG4gLy8gTXV0YXRpb25PYnNlcnZlcnMsIHNvIHdlIGRvbid0IG5lZWQgdG8gZmFsbCBiYWNrIGluIHRoYXQgY2FzZS5cbiAvLyBmdW5jdGlvbiBtYWtlUmVxdWVzdENhbGxGcm9tTWVzc2FnZUNoYW5uZWwoY2FsbGJhY2spIHtcbiAvLyAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAvLyAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBjYWxsYmFjaztcbiAvLyAgICAgcmV0dXJuIGZ1bmN0aW9uIHJlcXVlc3RDYWxsKCkge1xuIC8vICAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAvLyAgICAgfTtcbiAvLyB9XG4gLy8gRm9yIHJlYXNvbnMgZXhwbGFpbmVkIGFib3ZlLCB3ZSBhcmUgYWxzbyB1bmFibGUgdG8gdXNlIGBzZXRJbW1lZGlhdGVgXG4gLy8gdW5kZXIgYW55IGNpcmN1bXN0YW5jZXMuXG4gLy8gRXZlbiBpZiB3ZSB3ZXJlLCB0aGVyZSBpcyBhbm90aGVyIGJ1ZyBpbiBJbnRlcm5ldCBFeHBsb3JlciAxMC5cbiAvLyBJdCBpcyBub3Qgc3VmZmljaWVudCB0byBhc3NpZ24gYHNldEltbWVkaWF0ZWAgdG8gYHJlcXVlc3RGbHVzaGAgYmVjYXVzZVxuIC8vIGBzZXRJbW1lZGlhdGVgIG11c3QgYmUgY2FsbGVkICpieSBuYW1lKiBhbmQgdGhlcmVmb3JlIG11c3QgYmUgd3JhcHBlZCBpbiBhXG4gLy8gY2xvc3VyZS5cbiAvLyBOZXZlciBmb3JnZXQuXG4gLy8gZnVuY3Rpb24gbWFrZVJlcXVlc3RDYWxsRnJvbVNldEltbWVkaWF0ZShjYWxsYmFjaykge1xuIC8vICAgICByZXR1cm4gZnVuY3Rpb24gcmVxdWVzdENhbGwoKSB7XG4gLy8gICAgICAgICBzZXRJbW1lZGlhdGUoY2FsbGJhY2spO1xuIC8vICAgICB9O1xuIC8vIH1cbiAvLyBTYWZhcmkgNi4wIGhhcyBhIHByb2JsZW0gd2hlcmUgdGltZXJzIHdpbGwgZ2V0IGxvc3Qgd2hpbGUgdGhlIHVzZXIgaXNcbiAvLyBzY3JvbGxpbmcuIFRoaXMgcHJvYmxlbSBkb2VzIG5vdCBpbXBhY3QgQVNBUCBiZWNhdXNlIFNhZmFyaSA2LjAgc3VwcG9ydHNcbiAvLyBtdXRhdGlvbiBvYnNlcnZlcnMsIHNvIHRoYXQgaW1wbGVtZW50YXRpb24gaXMgdXNlZCBpbnN0ZWFkLlxuIC8vIEhvd2V2ZXIsIGlmIHdlIGV2ZXIgZWxlY3QgdG8gdXNlIHRpbWVycyBpbiBTYWZhcmksIHRoZSBwcmV2YWxlbnQgd29yay1hcm91bmRcbiAvLyBpcyB0byBhZGQgYSBzY3JvbGwgZXZlbnQgbGlzdGVuZXIgdGhhdCBjYWxscyBmb3IgYSBmbHVzaC5cbiAvLyBgc2V0VGltZW91dGAgZG9lcyBub3QgY2FsbCB0aGUgcGFzc2VkIGNhbGxiYWNrIGlmIHRoZSBkZWxheSBpcyBsZXNzIHRoYW5cbiAvLyBhcHByb3hpbWF0ZWx5IDcgaW4gd2ViIHdvcmtlcnMgaW4gRmlyZWZveCA4IHRocm91Z2ggMTgsIGFuZCBzb21ldGltZXMgbm90XG4gLy8gZXZlbiB0aGVuLlxuIC8vIFRoaXMgaXMgZm9yIGBhc2FwLmpzYCBvbmx5LlxuIC8vIEl0cyBuYW1lIHdpbGwgYmUgcGVyaW9kaWNhbGx5IHJhbmRvbWl6ZWQgdG8gYnJlYWsgYW55IGNvZGUgdGhhdCBkZXBlbmRzIG9uXG4gLy8gLy8gaXRzIGV4aXN0ZW5jZS5cbiAvLyByYXdBc2FwLm1ha2VSZXF1ZXN0Q2FsbEZyb21UaW1lciA9IG1ha2VSZXF1ZXN0Q2FsbEZyb21UaW1lclxuIC8vIEFTQVAgd2FzIG9yaWdpbmFsbHkgYSBuZXh0VGljayBzaGltIGluY2x1ZGVkIGluIFEuIFRoaXMgd2FzIGZhY3RvcmVkIG91dFxuIC8vIGludG8gdGhpcyBBU0FQIHBhY2thZ2UuIEl0IHdhcyBsYXRlciBhZGFwdGVkIHRvIFJTVlAgd2hpY2ggbWFkZSBmdXJ0aGVyXG4gLy8gYW1lbmRtZW50cy4gVGhlc2UgZGVjaXNpb25zLCBwYXJ0aWN1bGFybHkgdG8gbWFyZ2luYWxpemUgTWVzc2FnZUNoYW5uZWwgYW5kXG4gLy8gdG8gY2FwdHVyZSB0aGUgTXV0YXRpb25PYnNlcnZlciBpbXBsZW1lbnRhdGlvbiBpbiBhIGNsb3N1cmUsIHdlcmUgaW50ZWdyYXRlZFxuIC8vIGJhY2sgaW50byBBU0FQIHByb3Blci5cbiAvLyBodHRwczovL2dpdGh1Yi5jb20vdGlsZGVpby9yc3ZwLmpzL2Jsb2IvY2RkZjcyMzI1NDZhOWNmODU4NTI0Yjc1Y2RlNmY5ZWRmNzI2MjBhNy9saWIvcnN2cC9hc2FwLmpzXG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUFzYXBRdWV1ZS5qcy5tYXAiLCIvLyBgY2FsbGAsIGp1c3QgbGlrZSBhIGZ1bmN0aW9uLlxuZXhwb3J0IGNsYXNzIFJhd1Rhc2sge1xuICAgIGNhbGwoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnRhc2sgJiYgdGhpcy50YXNrKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLm9uRXJyb3IoZXJyb3IpO1xuICAgICAgICB9IGZpbmFsbHl7XG4gICAgICAgICAgICB0aGlzLnRhc2sgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZWxlYXNlKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKG9uRXJyb3IsIHJlbGVhc2Upe1xuICAgICAgICB0aGlzLm9uRXJyb3IgPSBvbkVycm9yO1xuICAgICAgICB0aGlzLnJlbGVhc2UgPSByZWxlYXNlO1xuICAgICAgICB0aGlzLnRhc2sgPSBudWxsO1xuICAgIH1cbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UmF3VGFzay5qcy5tYXAiLCJpbXBvcnQgeyBSYXdUYXNrIH0gZnJvbSAnLi9SYXdUYXNrLmpzJztcbmV4cG9ydCBjbGFzcyBUYXNrRmFjdG9yeSB7XG4gICAgY3JlYXRlKHRhc2spIHtcbiAgICAgICAgY29uc3QgdGFza3MgPSB0aGlzLmZyZWVUYXNrcztcbiAgICAgICAgY29uc3QgdDEgPSB0YXNrcy5sZW5ndGggPyB0YXNrcy5wb3AoKSA6IG5ldyBSYXdUYXNrKHRoaXMub25FcnJvciwgKHQpPT50YXNrc1t0YXNrcy5sZW5ndGhdID0gdFxuICAgICAgICApO1xuICAgICAgICB0MS50YXNrID0gdGFzaztcbiAgICAgICAgcmV0dXJuIHQxO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihvbkVycm9yKXtcbiAgICAgICAgdGhpcy5vbkVycm9yID0gb25FcnJvcjtcbiAgICAgICAgdGhpcy5mcmVlVGFza3MgPSBbXTtcbiAgICB9XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVRhc2tGYWN0b3J5LmpzLm1hcCIsImltcG9ydCB7IEFzYXBRdWV1ZSB9IGZyb20gJy4vQXNhcFF1ZXVlLmpzJztcbmltcG9ydCB7IFRhc2tGYWN0b3J5IH0gZnJvbSAnLi9UYXNrRmFjdG9yeS5qcyc7XG5jb25zdCBhc2FwUXVldWUgPSBuZXcgQXNhcFF1ZXVlKCk7XG5jb25zdCB0YXNrRmFjdG9yeSA9IG5ldyBUYXNrRmFjdG9yeShhc2FwUXVldWUucmVnaXN0ZXJQZW5kaW5nRXJyb3IpO1xuLyoqXG4gKiBDYWxscyBhIHRhc2sgYXMgc29vbiBhcyBwb3NzaWJsZSBhZnRlciByZXR1cm5pbmcsIGluIGl0cyBvd24gZXZlbnQsIHdpdGggcHJpb3JpdHlcbiAqIG92ZXIgb3RoZXIgZXZlbnRzIGxpa2UgYW5pbWF0aW9uLCByZWZsb3csIGFuZCByZXBhaW50LiBBbiBlcnJvciB0aHJvd24gZnJvbSBhblxuICogZXZlbnQgd2lsbCBub3QgaW50ZXJydXB0LCBub3IgZXZlbiBzdWJzdGFudGlhbGx5IHNsb3cgZG93biB0aGUgcHJvY2Vzc2luZyBvZlxuICogb3RoZXIgZXZlbnRzLCBidXQgd2lsbCBiZSByYXRoZXIgcG9zdHBvbmVkIHRvIGEgbG93ZXIgcHJpb3JpdHkgZXZlbnQuXG4gKiBAcGFyYW0ge3tjYWxsfX0gdGFzayBBIGNhbGxhYmxlIG9iamVjdCwgdHlwaWNhbGx5IGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBub1xuICogYXJndW1lbnRzLlxuICovIGV4cG9ydCBmdW5jdGlvbiBhc2FwKHRhc2spIHtcbiAgICBhc2FwUXVldWUuZW5xdWV1ZVRhc2sodGFza0ZhY3RvcnkuY3JlYXRlKHRhc2spKTtcbn1cblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXNhcC5qcy5tYXAiLCJleHBvcnQgeyB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD10eXBlcy5qcy5tYXAiLCJleHBvcnQgKiBmcm9tICcuL2FzYXAuanMnO1xuZXhwb3J0ICogZnJvbSAnLi9Bc2FwUXVldWUuanMnO1xuZXhwb3J0ICogZnJvbSAnLi9UYXNrRmFjdG9yeS5qcyc7XG5leHBvcnQgKiBmcm9tICcuL3R5cGVzLmpzJztcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiLyoqXG4gKiBVc2UgaW52YXJpYW50KCkgdG8gYXNzZXJ0IHN0YXRlIHdoaWNoIHlvdXIgcHJvZ3JhbSBhc3N1bWVzIHRvIGJlIHRydWUuXG4gKlxuICogUHJvdmlkZSBzcHJpbnRmLXN0eWxlIGZvcm1hdCAob25seSAlcyBpcyBzdXBwb3J0ZWQpIGFuZCBhcmd1bWVudHNcbiAqIHRvIHByb3ZpZGUgaW5mb3JtYXRpb24gYWJvdXQgd2hhdCBicm9rZSBhbmQgd2hhdCB5b3Ugd2VyZVxuICogZXhwZWN0aW5nLlxuICpcbiAqIFRoZSBpbnZhcmlhbnQgbWVzc2FnZSB3aWxsIGJlIHN0cmlwcGVkIGluIHByb2R1Y3Rpb24sIGJ1dCB0aGUgaW52YXJpYW50XG4gKiB3aWxsIHJlbWFpbiB0byBlbnN1cmUgbG9naWMgZG9lcyBub3QgZGlmZmVyIGluIHByb2R1Y3Rpb24uXG4gKi8gZXhwb3J0IGZ1bmN0aW9uIGludmFyaWFudChjb25kaXRpb24sIGZvcm1hdCwgLi4uYXJncykge1xuICAgIGlmIChpc1Byb2R1Y3Rpb24oKSkge1xuICAgICAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YXJpYW50IHJlcXVpcmVzIGFuIGVycm9yIG1lc3NhZ2UgYXJndW1lbnQnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgICBsZXQgZXJyb3I7XG4gICAgICAgIGlmIChmb3JtYXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoJ01pbmlmaWVkIGV4Y2VwdGlvbiBvY2N1cnJlZDsgdXNlIHRoZSBub24tbWluaWZpZWQgZGV2IGVudmlyb25tZW50ICcgKyAnZm9yIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2UgYW5kIGFkZGl0aW9uYWwgaGVscGZ1bCB3YXJuaW5ncy4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBhcmdJbmRleCA9IDA7XG4gICAgICAgICAgICBlcnJvciA9IG5ldyBFcnJvcihmb3JtYXQucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZ3NbYXJnSW5kZXgrK107XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBlcnJvci5uYW1lID0gJ0ludmFyaWFudCBWaW9sYXRpb24nO1xuICAgICAgICB9XG4gICAgICAgIGVycm9yLmZyYW1lc1RvUG9wID0gMSAvLyB3ZSBkb24ndCBjYXJlIGFib3V0IGludmFyaWFudCdzIG93biBmcmFtZVxuICAgICAgICA7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGlzUHJvZHVjdGlvbigpIHtcbiAgICByZXR1cm4gdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MuZW52WydOT0RFX0VOViddID09PSAncHJvZHVjdGlvbic7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsIi8qKlxuICogQGxpY2Vuc2UgUmVhY3RcbiAqIHJlYWN0LWlzLmRldmVsb3BtZW50LmpzXG4gKlxuICogQ29weXJpZ2h0IChjKSBNZXRhIFBsYXRmb3JtcywgSW5jLiBhbmQgYWZmaWxpYXRlcy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblwicHJvZHVjdGlvblwiICE9PSBwcm9jZXNzLmVudi5OT0RFX0VOViAmJlxuICAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIHR5cGVPZihvYmplY3QpIHtcbiAgICAgIGlmIChcIm9iamVjdFwiID09PSB0eXBlb2Ygb2JqZWN0ICYmIG51bGwgIT09IG9iamVjdCkge1xuICAgICAgICB2YXIgJCR0eXBlb2YgPSBvYmplY3QuJCR0eXBlb2Y7XG4gICAgICAgIHN3aXRjaCAoJCR0eXBlb2YpIHtcbiAgICAgICAgICBjYXNlIFJFQUNUX0VMRU1FTlRfVFlQRTpcbiAgICAgICAgICAgIHN3aXRjaCAoKChvYmplY3QgPSBvYmplY3QudHlwZSksIG9iamVjdCkpIHtcbiAgICAgICAgICAgICAgY2FzZSBSRUFDVF9GUkFHTUVOVF9UWVBFOlxuICAgICAgICAgICAgICBjYXNlIFJFQUNUX1BST0ZJTEVSX1RZUEU6XG4gICAgICAgICAgICAgIGNhc2UgUkVBQ1RfU1RSSUNUX01PREVfVFlQRTpcbiAgICAgICAgICAgICAgY2FzZSBSRUFDVF9TVVNQRU5TRV9UWVBFOlxuICAgICAgICAgICAgICBjYXNlIFJFQUNUX1NVU1BFTlNFX0xJU1RfVFlQRTpcbiAgICAgICAgICAgICAgY2FzZSBSRUFDVF9WSUVXX1RSQU5TSVRJT05fVFlQRTpcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHN3aXRjaCAoKChvYmplY3QgPSBvYmplY3QgJiYgb2JqZWN0LiQkdHlwZW9mKSwgb2JqZWN0KSkge1xuICAgICAgICAgICAgICAgICAgY2FzZSBSRUFDVF9DT05URVhUX1RZUEU6XG4gICAgICAgICAgICAgICAgICBjYXNlIFJFQUNUX0ZPUldBUkRfUkVGX1RZUEU6XG4gICAgICAgICAgICAgICAgICBjYXNlIFJFQUNUX0xBWllfVFlQRTpcbiAgICAgICAgICAgICAgICAgIGNhc2UgUkVBQ1RfTUVNT19UWVBFOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgICAgICAgICAgICAgY2FzZSBSRUFDVF9DT05TVU1FUl9UWVBFOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQkdHlwZW9mO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIFJFQUNUX1BPUlRBTF9UWVBFOlxuICAgICAgICAgICAgcmV0dXJuICQkdHlwZW9mO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBSRUFDVF9FTEVNRU5UX1RZUEUgPSBTeW1ib2wuZm9yKFwicmVhY3QudHJhbnNpdGlvbmFsLmVsZW1lbnRcIiksXG4gICAgICBSRUFDVF9QT1JUQUxfVFlQRSA9IFN5bWJvbC5mb3IoXCJyZWFjdC5wb3J0YWxcIiksXG4gICAgICBSRUFDVF9GUkFHTUVOVF9UWVBFID0gU3ltYm9sLmZvcihcInJlYWN0LmZyYWdtZW50XCIpLFxuICAgICAgUkVBQ1RfU1RSSUNUX01PREVfVFlQRSA9IFN5bWJvbC5mb3IoXCJyZWFjdC5zdHJpY3RfbW9kZVwiKSxcbiAgICAgIFJFQUNUX1BST0ZJTEVSX1RZUEUgPSBTeW1ib2wuZm9yKFwicmVhY3QucHJvZmlsZXJcIiksXG4gICAgICBSRUFDVF9DT05TVU1FUl9UWVBFID0gU3ltYm9sLmZvcihcInJlYWN0LmNvbnN1bWVyXCIpLFxuICAgICAgUkVBQ1RfQ09OVEVYVF9UWVBFID0gU3ltYm9sLmZvcihcInJlYWN0LmNvbnRleHRcIiksXG4gICAgICBSRUFDVF9GT1JXQVJEX1JFRl9UWVBFID0gU3ltYm9sLmZvcihcInJlYWN0LmZvcndhcmRfcmVmXCIpLFxuICAgICAgUkVBQ1RfU1VTUEVOU0VfVFlQRSA9IFN5bWJvbC5mb3IoXCJyZWFjdC5zdXNwZW5zZVwiKSxcbiAgICAgIFJFQUNUX1NVU1BFTlNFX0xJU1RfVFlQRSA9IFN5bWJvbC5mb3IoXCJyZWFjdC5zdXNwZW5zZV9saXN0XCIpLFxuICAgICAgUkVBQ1RfTUVNT19UWVBFID0gU3ltYm9sLmZvcihcInJlYWN0Lm1lbW9cIiksXG4gICAgICBSRUFDVF9MQVpZX1RZUEUgPSBTeW1ib2wuZm9yKFwicmVhY3QubGF6eVwiKSxcbiAgICAgIFJFQUNUX1ZJRVdfVFJBTlNJVElPTl9UWVBFID0gU3ltYm9sLmZvcihcInJlYWN0LnZpZXdfdHJhbnNpdGlvblwiKSxcbiAgICAgIFJFQUNUX0NMSUVOVF9SRUZFUkVOQ0UgPSBTeW1ib2wuZm9yKFwicmVhY3QuY2xpZW50LnJlZmVyZW5jZVwiKTtcbiAgICBleHBvcnRzLkNvbnRleHRDb25zdW1lciA9IFJFQUNUX0NPTlNVTUVSX1RZUEU7XG4gICAgZXhwb3J0cy5Db250ZXh0UHJvdmlkZXIgPSBSRUFDVF9DT05URVhUX1RZUEU7XG4gICAgZXhwb3J0cy5FbGVtZW50ID0gUkVBQ1RfRUxFTUVOVF9UWVBFO1xuICAgIGV4cG9ydHMuRm9yd2FyZFJlZiA9IFJFQUNUX0ZPUldBUkRfUkVGX1RZUEU7XG4gICAgZXhwb3J0cy5GcmFnbWVudCA9IFJFQUNUX0ZSQUdNRU5UX1RZUEU7XG4gICAgZXhwb3J0cy5MYXp5ID0gUkVBQ1RfTEFaWV9UWVBFO1xuICAgIGV4cG9ydHMuTWVtbyA9IFJFQUNUX01FTU9fVFlQRTtcbiAgICBleHBvcnRzLlBvcnRhbCA9IFJFQUNUX1BPUlRBTF9UWVBFO1xuICAgIGV4cG9ydHMuUHJvZmlsZXIgPSBSRUFDVF9QUk9GSUxFUl9UWVBFO1xuICAgIGV4cG9ydHMuU3RyaWN0TW9kZSA9IFJFQUNUX1NUUklDVF9NT0RFX1RZUEU7XG4gICAgZXhwb3J0cy5TdXNwZW5zZSA9IFJFQUNUX1NVU1BFTlNFX1RZUEU7XG4gICAgZXhwb3J0cy5TdXNwZW5zZUxpc3QgPSBSRUFDVF9TVVNQRU5TRV9MSVNUX1RZUEU7XG4gICAgZXhwb3J0cy5pc0NvbnRleHRDb25zdW1lciA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgIHJldHVybiB0eXBlT2Yob2JqZWN0KSA9PT0gUkVBQ1RfQ09OU1VNRVJfVFlQRTtcbiAgICB9O1xuICAgIGV4cG9ydHMuaXNDb250ZXh0UHJvdmlkZXIgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgICByZXR1cm4gdHlwZU9mKG9iamVjdCkgPT09IFJFQUNUX0NPTlRFWFRfVFlQRTtcbiAgICB9O1xuICAgIGV4cG9ydHMuaXNFbGVtZW50ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgXCJvYmplY3RcIiA9PT0gdHlwZW9mIG9iamVjdCAmJlxuICAgICAgICBudWxsICE9PSBvYmplY3QgJiZcbiAgICAgICAgb2JqZWN0LiQkdHlwZW9mID09PSBSRUFDVF9FTEVNRU5UX1RZUEVcbiAgICAgICk7XG4gICAgfTtcbiAgICBleHBvcnRzLmlzRm9yd2FyZFJlZiA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgIHJldHVybiB0eXBlT2Yob2JqZWN0KSA9PT0gUkVBQ1RfRk9SV0FSRF9SRUZfVFlQRTtcbiAgICB9O1xuICAgIGV4cG9ydHMuaXNGcmFnbWVudCA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgIHJldHVybiB0eXBlT2Yob2JqZWN0KSA9PT0gUkVBQ1RfRlJBR01FTlRfVFlQRTtcbiAgICB9O1xuICAgIGV4cG9ydHMuaXNMYXp5ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgICAgcmV0dXJuIHR5cGVPZihvYmplY3QpID09PSBSRUFDVF9MQVpZX1RZUEU7XG4gICAgfTtcbiAgICBleHBvcnRzLmlzTWVtbyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgIHJldHVybiB0eXBlT2Yob2JqZWN0KSA9PT0gUkVBQ1RfTUVNT19UWVBFO1xuICAgIH07XG4gICAgZXhwb3J0cy5pc1BvcnRhbCA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgIHJldHVybiB0eXBlT2Yob2JqZWN0KSA9PT0gUkVBQ1RfUE9SVEFMX1RZUEU7XG4gICAgfTtcbiAgICBleHBvcnRzLmlzUHJvZmlsZXIgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgICByZXR1cm4gdHlwZU9mKG9iamVjdCkgPT09IFJFQUNUX1BST0ZJTEVSX1RZUEU7XG4gICAgfTtcbiAgICBleHBvcnRzLmlzU3RyaWN0TW9kZSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgIHJldHVybiB0eXBlT2Yob2JqZWN0KSA9PT0gUkVBQ1RfU1RSSUNUX01PREVfVFlQRTtcbiAgICB9O1xuICAgIGV4cG9ydHMuaXNTdXNwZW5zZSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgIHJldHVybiB0eXBlT2Yob2JqZWN0KSA9PT0gUkVBQ1RfU1VTUEVOU0VfVFlQRTtcbiAgICB9O1xuICAgIGV4cG9ydHMuaXNTdXNwZW5zZUxpc3QgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgICByZXR1cm4gdHlwZU9mKG9iamVjdCkgPT09IFJFQUNUX1NVU1BFTlNFX0xJU1RfVFlQRTtcbiAgICB9O1xuICAgIGV4cG9ydHMuaXNWYWxpZEVsZW1lbnRUeXBlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgIHJldHVybiBcInN0cmluZ1wiID09PSB0eXBlb2YgdHlwZSB8fFxuICAgICAgICBcImZ1bmN0aW9uXCIgPT09IHR5cGVvZiB0eXBlIHx8XG4gICAgICAgIHR5cGUgPT09IFJFQUNUX0ZSQUdNRU5UX1RZUEUgfHxcbiAgICAgICAgdHlwZSA9PT0gUkVBQ1RfUFJPRklMRVJfVFlQRSB8fFxuICAgICAgICB0eXBlID09PSBSRUFDVF9TVFJJQ1RfTU9ERV9UWVBFIHx8XG4gICAgICAgIHR5cGUgPT09IFJFQUNUX1NVU1BFTlNFX1RZUEUgfHxcbiAgICAgICAgdHlwZSA9PT0gUkVBQ1RfU1VTUEVOU0VfTElTVF9UWVBFIHx8XG4gICAgICAgIChcIm9iamVjdFwiID09PSB0eXBlb2YgdHlwZSAmJlxuICAgICAgICAgIG51bGwgIT09IHR5cGUgJiZcbiAgICAgICAgICAodHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfTEFaWV9UWVBFIHx8XG4gICAgICAgICAgICB0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9NRU1PX1RZUEUgfHxcbiAgICAgICAgICAgIHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX0NPTlRFWFRfVFlQRSB8fFxuICAgICAgICAgICAgdHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfQ09OU1VNRVJfVFlQRSB8fFxuICAgICAgICAgICAgdHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfRk9SV0FSRF9SRUZfVFlQRSB8fFxuICAgICAgICAgICAgdHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfQ0xJRU5UX1JFRkVSRU5DRSB8fFxuICAgICAgICAgICAgdm9pZCAwICE9PSB0eXBlLmdldE1vZHVsZUlkKSlcbiAgICAgICAgPyAhMFxuICAgICAgICA6ICExO1xuICAgIH07XG4gICAgZXhwb3J0cy50eXBlT2YgPSB0eXBlT2Y7XG4gIH0pKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=