"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3191],{

/***/ 33631:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  t2: () => (/* binding */ HTML5Backend)
});

// UNUSED EXPORTS: NativeTypes, getEmptyImage

// NAMESPACE OBJECT: ./node_modules/react-dnd-html5-backend/dist/NativeTypes.js
var NativeTypes_namespaceObject = {};
__webpack_require__.r(NativeTypes_namespaceObject);
__webpack_require__.d(NativeTypes_namespaceObject, {
  FILE: () => (FILE),
  HTML: () => (HTML),
  TEXT: () => (TEXT),
  URL: () => (URL)
});

;// ./node_modules/react-dnd-html5-backend/dist/utils/js_utils.js
// cheap lodash replacements
function memoize(fn) {
    let result = null;
    const memoized = ()=>{
        if (result == null) {
            result = fn();
        }
        return result;
    };
    return memoized;
}
/**
 * drop-in replacement for _.without
 */ function without(items, item) {
    return items.filter((i)=>i !== item
    );
}
function union(itemsA, itemsB) {
    const set = new Set();
    const insertItem = (item)=>set.add(item)
    ;
    itemsA.forEach(insertItem);
    itemsB.forEach(insertItem);
    const result = [];
    set.forEach((key)=>result.push(key)
    );
    return result;
}

//# sourceMappingURL=js_utils.js.map
;// ./node_modules/react-dnd-html5-backend/dist/EnterLeaveCounter.js

class EnterLeaveCounter {
    enter(enteringNode) {
        const previousLength = this.entered.length;
        const isNodeEntered = (node)=>this.isNodeInDocument(node) && (!node.contains || node.contains(enteringNode))
        ;
        this.entered = union(this.entered.filter(isNodeEntered), [
            enteringNode
        ]);
        return previousLength === 0 && this.entered.length > 0;
    }
    leave(leavingNode) {
        const previousLength = this.entered.length;
        this.entered = without(this.entered.filter(this.isNodeInDocument), leavingNode);
        return previousLength > 0 && this.entered.length === 0;
    }
    reset() {
        this.entered = [];
    }
    constructor(isNodeInDocument){
        this.entered = [];
        this.isNodeInDocument = isNodeInDocument;
    }
}

//# sourceMappingURL=EnterLeaveCounter.js.map
;// ./node_modules/react-dnd-html5-backend/dist/NativeDragSources/NativeDragSource.js
class NativeDragSource {
    initializeExposedProperties() {
        Object.keys(this.config.exposeProperties).forEach((property)=>{
            Object.defineProperty(this.item, property, {
                configurable: true,
                enumerable: true,
                get () {
                    // eslint-disable-next-line no-console
                    console.warn(`Browser doesn't allow reading "${property}" until the drop event.`);
                    return null;
                }
            });
        });
    }
    loadDataTransfer(dataTransfer) {
        if (dataTransfer) {
            const newProperties = {};
            Object.keys(this.config.exposeProperties).forEach((property)=>{
                const propertyFn = this.config.exposeProperties[property];
                if (propertyFn != null) {
                    newProperties[property] = {
                        value: propertyFn(dataTransfer, this.config.matchesTypes),
                        configurable: true,
                        enumerable: true
                    };
                }
            });
            Object.defineProperties(this.item, newProperties);
        }
    }
    canDrag() {
        return true;
    }
    beginDrag() {
        return this.item;
    }
    isDragging(monitor, handle) {
        return handle === monitor.getSourceId();
    }
    endDrag() {
    // empty
    }
    constructor(config){
        this.config = config;
        this.item = {};
        this.initializeExposedProperties();
    }
}

//# sourceMappingURL=NativeDragSource.js.map
;// ./node_modules/react-dnd-html5-backend/dist/NativeTypes.js
const FILE = '__NATIVE_FILE__';
const URL = '__NATIVE_URL__';
const TEXT = '__NATIVE_TEXT__';
const HTML = '__NATIVE_HTML__';

//# sourceMappingURL=NativeTypes.js.map
;// ./node_modules/react-dnd-html5-backend/dist/NativeDragSources/getDataFromDataTransfer.js
function getDataFromDataTransfer(dataTransfer, typesToTry, defaultValue) {
    const result = typesToTry.reduce((resultSoFar, typeToTry)=>resultSoFar || dataTransfer.getData(typeToTry)
    , '');
    return result != null ? result : defaultValue;
}

//# sourceMappingURL=getDataFromDataTransfer.js.map
;// ./node_modules/react-dnd-html5-backend/dist/NativeDragSources/nativeTypesConfig.js


const nativeTypesConfig = {
    [FILE]: {
        exposeProperties: {
            files: (dataTransfer)=>Array.prototype.slice.call(dataTransfer.files)
            ,
            items: (dataTransfer)=>dataTransfer.items
            ,
            dataTransfer: (dataTransfer)=>dataTransfer
        },
        matchesTypes: [
            'Files'
        ]
    },
    [HTML]: {
        exposeProperties: {
            html: (dataTransfer, matchesTypes)=>getDataFromDataTransfer(dataTransfer, matchesTypes, '')
            ,
            dataTransfer: (dataTransfer)=>dataTransfer
        },
        matchesTypes: [
            'Html',
            'text/html'
        ]
    },
    [URL]: {
        exposeProperties: {
            urls: (dataTransfer, matchesTypes)=>getDataFromDataTransfer(dataTransfer, matchesTypes, '').split('\n')
            ,
            dataTransfer: (dataTransfer)=>dataTransfer
        },
        matchesTypes: [
            'Url',
            'text/uri-list'
        ]
    },
    [TEXT]: {
        exposeProperties: {
            text: (dataTransfer, matchesTypes)=>getDataFromDataTransfer(dataTransfer, matchesTypes, '')
            ,
            dataTransfer: (dataTransfer)=>dataTransfer
        },
        matchesTypes: [
            'Text',
            'text/plain'
        ]
    }
};

//# sourceMappingURL=nativeTypesConfig.js.map
;// ./node_modules/react-dnd-html5-backend/dist/NativeDragSources/index.js


function createNativeDragSource(type, dataTransfer) {
    const config = nativeTypesConfig[type];
    if (!config) {
        throw new Error(`native type ${type} has no configuration`);
    }
    const result = new NativeDragSource(config);
    result.loadDataTransfer(dataTransfer);
    return result;
}
function matchNativeItemType(dataTransfer) {
    if (!dataTransfer) {
        return null;
    }
    const dataTransferTypes = Array.prototype.slice.call(dataTransfer.types || []);
    return Object.keys(nativeTypesConfig).filter((nativeItemType)=>{
        const typeConfig = nativeTypesConfig[nativeItemType];
        if (!(typeConfig === null || typeConfig === void 0 ? void 0 : typeConfig.matchesTypes)) {
            return false;
        }
        return typeConfig.matchesTypes.some((t)=>dataTransferTypes.indexOf(t) > -1
        );
    })[0] || null;
}

//# sourceMappingURL=index.js.map
;// ./node_modules/react-dnd-html5-backend/dist/BrowserDetector.js

const isFirefox = memoize(()=>/firefox/i.test(navigator.userAgent)
);
const isSafari = memoize(()=>Boolean(window.safari)
);

//# sourceMappingURL=BrowserDetector.js.map
;// ./node_modules/react-dnd-html5-backend/dist/MonotonicInterpolant.js
class MonotonicInterpolant {
    interpolate(x) {
        const { xs , ys , c1s , c2s , c3s  } = this;
        // The rightmost point in the dataset should give an exact result
        let i = xs.length - 1;
        if (x === xs[i]) {
            return ys[i];
        }
        // Search for the interval x is in, returning the corresponding y if x is one of the original xs
        let low = 0;
        let high = c3s.length - 1;
        let mid;
        while(low <= high){
            mid = Math.floor(0.5 * (low + high));
            const xHere = xs[mid];
            if (xHere < x) {
                low = mid + 1;
            } else if (xHere > x) {
                high = mid - 1;
            } else {
                return ys[mid];
            }
        }
        i = Math.max(0, high);
        // Interpolate
        const diff = x - xs[i];
        const diffSq = diff * diff;
        return ys[i] + c1s[i] * diff + c2s[i] * diffSq + c3s[i] * diff * diffSq;
    }
    constructor(xs, ys){
        const { length  } = xs;
        // Rearrange xs and ys so that xs is sorted
        const indexes = [];
        for(let i = 0; i < length; i++){
            indexes.push(i);
        }
        indexes.sort((a, b)=>xs[a] < xs[b] ? -1 : 1
        );
        // Get consecutive differences and slopes
        const dys = [];
        const dxs = [];
        const ms = [];
        let dx;
        let dy;
        for(let i1 = 0; i1 < length - 1; i1++){
            dx = xs[i1 + 1] - xs[i1];
            dy = ys[i1 + 1] - ys[i1];
            dxs.push(dx);
            dys.push(dy);
            ms.push(dy / dx);
        }
        // Get degree-1 coefficients
        const c1s = [
            ms[0]
        ];
        for(let i2 = 0; i2 < dxs.length - 1; i2++){
            const m2 = ms[i2];
            const mNext = ms[i2 + 1];
            if (m2 * mNext <= 0) {
                c1s.push(0);
            } else {
                dx = dxs[i2];
                const dxNext = dxs[i2 + 1];
                const common = dx + dxNext;
                c1s.push(3 * common / ((common + dxNext) / m2 + (common + dx) / mNext));
            }
        }
        c1s.push(ms[ms.length - 1]);
        // Get degree-2 and degree-3 coefficients
        const c2s = [];
        const c3s = [];
        let m;
        for(let i3 = 0; i3 < c1s.length - 1; i3++){
            m = ms[i3];
            const c1 = c1s[i3];
            const invDx = 1 / dxs[i3];
            const common = c1 + c1s[i3 + 1] - m - m;
            c2s.push((m - c1 - common) * invDx);
            c3s.push(common * invDx * invDx);
        }
        this.xs = xs;
        this.ys = ys;
        this.c1s = c1s;
        this.c2s = c2s;
        this.c3s = c3s;
    }
}

//# sourceMappingURL=MonotonicInterpolant.js.map
;// ./node_modules/react-dnd-html5-backend/dist/OffsetUtils.js


const ELEMENT_NODE = 1;
function getNodeClientOffset(node) {
    const el = node.nodeType === ELEMENT_NODE ? node : node.parentElement;
    if (!el) {
        return null;
    }
    const { top , left  } = el.getBoundingClientRect();
    return {
        x: left,
        y: top
    };
}
function getEventClientOffset(e) {
    return {
        x: e.clientX,
        y: e.clientY
    };
}
function isImageNode(node) {
    var ref;
    return node.nodeName === 'IMG' && (isFirefox() || !((ref = document.documentElement) === null || ref === void 0 ? void 0 : ref.contains(node)));
}
function getDragPreviewSize(isImage, dragPreview, sourceWidth, sourceHeight) {
    let dragPreviewWidth = isImage ? dragPreview.width : sourceWidth;
    let dragPreviewHeight = isImage ? dragPreview.height : sourceHeight;
    // Work around @2x coordinate discrepancies in browsers
    if (isSafari() && isImage) {
        dragPreviewHeight /= window.devicePixelRatio;
        dragPreviewWidth /= window.devicePixelRatio;
    }
    return {
        dragPreviewWidth,
        dragPreviewHeight
    };
}
function getDragPreviewOffset(sourceNode, dragPreview, clientOffset, anchorPoint, offsetPoint) {
    // The browsers will use the image intrinsic size under different conditions.
    // Firefox only cares if it's an image, but WebKit also wants it to be detached.
    const isImage = isImageNode(dragPreview);
    const dragPreviewNode = isImage ? sourceNode : dragPreview;
    const dragPreviewNodeOffsetFromClient = getNodeClientOffset(dragPreviewNode);
    const offsetFromDragPreview = {
        x: clientOffset.x - dragPreviewNodeOffsetFromClient.x,
        y: clientOffset.y - dragPreviewNodeOffsetFromClient.y
    };
    const { offsetWidth: sourceWidth , offsetHeight: sourceHeight  } = sourceNode;
    const { anchorX , anchorY  } = anchorPoint;
    const { dragPreviewWidth , dragPreviewHeight  } = getDragPreviewSize(isImage, dragPreview, sourceWidth, sourceHeight);
    const calculateYOffset = ()=>{
        const interpolantY = new MonotonicInterpolant([
            0,
            0.5,
            1
        ], [
            // Dock to the top
            offsetFromDragPreview.y,
            // Align at the center
            (offsetFromDragPreview.y / sourceHeight) * dragPreviewHeight,
            // Dock to the bottom
            offsetFromDragPreview.y + dragPreviewHeight - sourceHeight, 
        ]);
        let y = interpolantY.interpolate(anchorY);
        // Work around Safari 8 positioning bug
        if (isSafari() && isImage) {
            // We'll have to wait for @3x to see if this is entirely correct
            y += (window.devicePixelRatio - 1) * dragPreviewHeight;
        }
        return y;
    };
    const calculateXOffset = ()=>{
        // Interpolate coordinates depending on anchor point
        // If you know a simpler way to do this, let me know
        const interpolantX = new MonotonicInterpolant([
            0,
            0.5,
            1
        ], [
            // Dock to the left
            offsetFromDragPreview.x,
            // Align at the center
            (offsetFromDragPreview.x / sourceWidth) * dragPreviewWidth,
            // Dock to the right
            offsetFromDragPreview.x + dragPreviewWidth - sourceWidth, 
        ]);
        return interpolantX.interpolate(anchorX);
    };
    // Force offsets if specified in the options.
    const { offsetX , offsetY  } = offsetPoint;
    const isManualOffsetX = offsetX === 0 || offsetX;
    const isManualOffsetY = offsetY === 0 || offsetY;
    return {
        x: isManualOffsetX ? offsetX : calculateXOffset(),
        y: isManualOffsetY ? offsetY : calculateYOffset()
    };
}

//# sourceMappingURL=OffsetUtils.js.map
;// ./node_modules/react-dnd-html5-backend/dist/OptionsReader.js
class OptionsReader {
    get window() {
        if (this.globalContext) {
            return this.globalContext;
        } else if (typeof window !== 'undefined') {
            return window;
        }
        return undefined;
    }
    get document() {
        var ref;
        if ((ref = this.globalContext) === null || ref === void 0 ? void 0 : ref.document) {
            return this.globalContext.document;
        } else if (this.window) {
            return this.window.document;
        } else {
            return undefined;
        }
    }
    get rootElement() {
        var ref;
        return ((ref = this.optionsArgs) === null || ref === void 0 ? void 0 : ref.rootElement) || this.window;
    }
    constructor(globalContext, options){
        this.ownerDocument = null;
        this.globalContext = globalContext;
        this.optionsArgs = options;
    }
}

//# sourceMappingURL=OptionsReader.js.map
;// ./node_modules/react-dnd-html5-backend/dist/HTML5BackendImpl.js
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectSpread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _defineProperty(target, key, source[key]);
        });
    }
    return target;
}





class HTML5BackendImpl {
    /**
	 * Generate profiling statistics for the HTML5Backend.
	 */ profile() {
        var ref, ref1;
        return {
            sourcePreviewNodes: this.sourcePreviewNodes.size,
            sourcePreviewNodeOptions: this.sourcePreviewNodeOptions.size,
            sourceNodeOptions: this.sourceNodeOptions.size,
            sourceNodes: this.sourceNodes.size,
            dragStartSourceIds: ((ref = this.dragStartSourceIds) === null || ref === void 0 ? void 0 : ref.length) || 0,
            dropTargetIds: this.dropTargetIds.length,
            dragEnterTargetIds: this.dragEnterTargetIds.length,
            dragOverTargetIds: ((ref1 = this.dragOverTargetIds) === null || ref1 === void 0 ? void 0 : ref1.length) || 0
        };
    }
    // public for test
    get window() {
        return this.options.window;
    }
    get document() {
        return this.options.document;
    }
    /**
	 * Get the root element to use for event subscriptions
	 */ get rootElement() {
        return this.options.rootElement;
    }
    setup() {
        const root = this.rootElement;
        if (root === undefined) {
            return;
        }
        if (root.__isReactDndBackendSetUp) {
            throw new Error('Cannot have two HTML5 backends at the same time.');
        }
        root.__isReactDndBackendSetUp = true;
        this.addEventListeners(root);
    }
    teardown() {
        const root = this.rootElement;
        if (root === undefined) {
            return;
        }
        root.__isReactDndBackendSetUp = false;
        this.removeEventListeners(this.rootElement);
        this.clearCurrentDragSourceNode();
        if (this.asyncEndDragFrameId) {
            var ref;
            (ref = this.window) === null || ref === void 0 ? void 0 : ref.cancelAnimationFrame(this.asyncEndDragFrameId);
        }
    }
    connectDragPreview(sourceId, node, options) {
        this.sourcePreviewNodeOptions.set(sourceId, options);
        this.sourcePreviewNodes.set(sourceId, node);
        return ()=>{
            this.sourcePreviewNodes.delete(sourceId);
            this.sourcePreviewNodeOptions.delete(sourceId);
        };
    }
    connectDragSource(sourceId, node, options) {
        this.sourceNodes.set(sourceId, node);
        this.sourceNodeOptions.set(sourceId, options);
        const handleDragStart = (e)=>this.handleDragStart(e, sourceId)
        ;
        const handleSelectStart = (e)=>this.handleSelectStart(e)
        ;
        node.setAttribute('draggable', 'true');
        node.addEventListener('dragstart', handleDragStart);
        node.addEventListener('selectstart', handleSelectStart);
        return ()=>{
            this.sourceNodes.delete(sourceId);
            this.sourceNodeOptions.delete(sourceId);
            node.removeEventListener('dragstart', handleDragStart);
            node.removeEventListener('selectstart', handleSelectStart);
            node.setAttribute('draggable', 'false');
        };
    }
    connectDropTarget(targetId, node) {
        const handleDragEnter = (e)=>this.handleDragEnter(e, targetId)
        ;
        const handleDragOver = (e)=>this.handleDragOver(e, targetId)
        ;
        const handleDrop = (e)=>this.handleDrop(e, targetId)
        ;
        node.addEventListener('dragenter', handleDragEnter);
        node.addEventListener('dragover', handleDragOver);
        node.addEventListener('drop', handleDrop);
        return ()=>{
            node.removeEventListener('dragenter', handleDragEnter);
            node.removeEventListener('dragover', handleDragOver);
            node.removeEventListener('drop', handleDrop);
        };
    }
    addEventListeners(target) {
        // SSR Fix (https://github.com/react-dnd/react-dnd/pull/813
        if (!target.addEventListener) {
            return;
        }
        target.addEventListener('dragstart', this.handleTopDragStart);
        target.addEventListener('dragstart', this.handleTopDragStartCapture, true);
        target.addEventListener('dragend', this.handleTopDragEndCapture, true);
        target.addEventListener('dragenter', this.handleTopDragEnter);
        target.addEventListener('dragenter', this.handleTopDragEnterCapture, true);
        target.addEventListener('dragleave', this.handleTopDragLeaveCapture, true);
        target.addEventListener('dragover', this.handleTopDragOver);
        target.addEventListener('dragover', this.handleTopDragOverCapture, true);
        target.addEventListener('drop', this.handleTopDrop);
        target.addEventListener('drop', this.handleTopDropCapture, true);
    }
    removeEventListeners(target) {
        // SSR Fix (https://github.com/react-dnd/react-dnd/pull/813
        if (!target.removeEventListener) {
            return;
        }
        target.removeEventListener('dragstart', this.handleTopDragStart);
        target.removeEventListener('dragstart', this.handleTopDragStartCapture, true);
        target.removeEventListener('dragend', this.handleTopDragEndCapture, true);
        target.removeEventListener('dragenter', this.handleTopDragEnter);
        target.removeEventListener('dragenter', this.handleTopDragEnterCapture, true);
        target.removeEventListener('dragleave', this.handleTopDragLeaveCapture, true);
        target.removeEventListener('dragover', this.handleTopDragOver);
        target.removeEventListener('dragover', this.handleTopDragOverCapture, true);
        target.removeEventListener('drop', this.handleTopDrop);
        target.removeEventListener('drop', this.handleTopDropCapture, true);
    }
    getCurrentSourceNodeOptions() {
        const sourceId = this.monitor.getSourceId();
        const sourceNodeOptions = this.sourceNodeOptions.get(sourceId);
        return _objectSpread({
            dropEffect: this.altKeyPressed ? 'copy' : 'move'
        }, sourceNodeOptions || {});
    }
    getCurrentDropEffect() {
        if (this.isDraggingNativeItem()) {
            // It makes more sense to default to 'copy' for native resources
            return 'copy';
        }
        return this.getCurrentSourceNodeOptions().dropEffect;
    }
    getCurrentSourcePreviewNodeOptions() {
        const sourceId = this.monitor.getSourceId();
        const sourcePreviewNodeOptions = this.sourcePreviewNodeOptions.get(sourceId);
        return _objectSpread({
            anchorX: 0.5,
            anchorY: 0.5,
            captureDraggingState: false
        }, sourcePreviewNodeOptions || {});
    }
    isDraggingNativeItem() {
        const itemType = this.monitor.getItemType();
        return Object.keys(NativeTypes_namespaceObject).some((key)=>NativeTypes_namespaceObject[key] === itemType
        );
    }
    beginDragNativeItem(type, dataTransfer) {
        this.clearCurrentDragSourceNode();
        this.currentNativeSource = createNativeDragSource(type, dataTransfer);
        this.currentNativeHandle = this.registry.addSource(type, this.currentNativeSource);
        this.actions.beginDrag([
            this.currentNativeHandle
        ]);
    }
    setCurrentDragSourceNode(node) {
        this.clearCurrentDragSourceNode();
        this.currentDragSourceNode = node;
        // A timeout of > 0 is necessary to resolve Firefox issue referenced
        // See:
        //   * https://github.com/react-dnd/react-dnd/pull/928
        //   * https://github.com/react-dnd/react-dnd/issues/869
        const MOUSE_MOVE_TIMEOUT = 1000;
        // Receiving a mouse event in the middle of a dragging operation
        // means it has ended and the drag source node disappeared from DOM,
        // so the browser didn't dispatch the dragend event.
        //
        // We need to wait before we start listening for mousemove events.
        // This is needed because the drag preview needs to be drawn or else it fires an 'mousemove' event
        // immediately in some browsers.
        //
        // See:
        //   * https://github.com/react-dnd/react-dnd/pull/928
        //   * https://github.com/react-dnd/react-dnd/issues/869
        //
        this.mouseMoveTimeoutTimer = setTimeout(()=>{
            var ref;
            return (ref = this.rootElement) === null || ref === void 0 ? void 0 : ref.addEventListener('mousemove', this.endDragIfSourceWasRemovedFromDOM, true);
        }, MOUSE_MOVE_TIMEOUT);
    }
    clearCurrentDragSourceNode() {
        if (this.currentDragSourceNode) {
            this.currentDragSourceNode = null;
            if (this.rootElement) {
                var ref;
                (ref = this.window) === null || ref === void 0 ? void 0 : ref.clearTimeout(this.mouseMoveTimeoutTimer || undefined);
                this.rootElement.removeEventListener('mousemove', this.endDragIfSourceWasRemovedFromDOM, true);
            }
            this.mouseMoveTimeoutTimer = null;
            return true;
        }
        return false;
    }
    handleDragStart(e, sourceId) {
        if (e.defaultPrevented) {
            return;
        }
        if (!this.dragStartSourceIds) {
            this.dragStartSourceIds = [];
        }
        this.dragStartSourceIds.unshift(sourceId);
    }
    handleDragEnter(_e, targetId) {
        this.dragEnterTargetIds.unshift(targetId);
    }
    handleDragOver(_e, targetId) {
        if (this.dragOverTargetIds === null) {
            this.dragOverTargetIds = [];
        }
        this.dragOverTargetIds.unshift(targetId);
    }
    handleDrop(_e, targetId) {
        this.dropTargetIds.unshift(targetId);
    }
    constructor(manager, globalContext, options){
        this.sourcePreviewNodes = new Map();
        this.sourcePreviewNodeOptions = new Map();
        this.sourceNodes = new Map();
        this.sourceNodeOptions = new Map();
        this.dragStartSourceIds = null;
        this.dropTargetIds = [];
        this.dragEnterTargetIds = [];
        this.currentNativeSource = null;
        this.currentNativeHandle = null;
        this.currentDragSourceNode = null;
        this.altKeyPressed = false;
        this.mouseMoveTimeoutTimer = null;
        this.asyncEndDragFrameId = null;
        this.dragOverTargetIds = null;
        this.lastClientOffset = null;
        this.hoverRafId = null;
        this.getSourceClientOffset = (sourceId)=>{
            const source = this.sourceNodes.get(sourceId);
            return source && getNodeClientOffset(source) || null;
        };
        this.endDragNativeItem = ()=>{
            if (!this.isDraggingNativeItem()) {
                return;
            }
            this.actions.endDrag();
            if (this.currentNativeHandle) {
                this.registry.removeSource(this.currentNativeHandle);
            }
            this.currentNativeHandle = null;
            this.currentNativeSource = null;
        };
        this.isNodeInDocument = (node)=>{
            // Check the node either in the main document or in the current context
            return Boolean(node && this.document && this.document.body && this.document.body.contains(node));
        };
        this.endDragIfSourceWasRemovedFromDOM = ()=>{
            const node = this.currentDragSourceNode;
            if (node == null || this.isNodeInDocument(node)) {
                return;
            }
            if (this.clearCurrentDragSourceNode() && this.monitor.isDragging()) {
                this.actions.endDrag();
            }
            this.cancelHover();
        };
        this.scheduleHover = (dragOverTargetIds)=>{
            if (this.hoverRafId === null && typeof requestAnimationFrame !== 'undefined') {
                this.hoverRafId = requestAnimationFrame(()=>{
                    if (this.monitor.isDragging()) {
                        this.actions.hover(dragOverTargetIds || [], {
                            clientOffset: this.lastClientOffset
                        });
                    }
                    this.hoverRafId = null;
                });
            }
        };
        this.cancelHover = ()=>{
            if (this.hoverRafId !== null && typeof cancelAnimationFrame !== 'undefined') {
                cancelAnimationFrame(this.hoverRafId);
                this.hoverRafId = null;
            }
        };
        this.handleTopDragStartCapture = ()=>{
            this.clearCurrentDragSourceNode();
            this.dragStartSourceIds = [];
        };
        this.handleTopDragStart = (e)=>{
            if (e.defaultPrevented) {
                return;
            }
            const { dragStartSourceIds  } = this;
            this.dragStartSourceIds = null;
            const clientOffset = getEventClientOffset(e);
            // Avoid crashing if we missed a drop event or our previous drag died
            if (this.monitor.isDragging()) {
                this.actions.endDrag();
                this.cancelHover();
            }
            // Don't publish the source just yet (see why below)
            this.actions.beginDrag(dragStartSourceIds || [], {
                publishSource: false,
                getSourceClientOffset: this.getSourceClientOffset,
                clientOffset
            });
            const { dataTransfer  } = e;
            const nativeType = matchNativeItemType(dataTransfer);
            if (this.monitor.isDragging()) {
                if (dataTransfer && typeof dataTransfer.setDragImage === 'function') {
                    // Use custom drag image if user specifies it.
                    // If child drag source refuses drag but parent agrees,
                    // use parent's node as drag image. Neither works in IE though.
                    const sourceId = this.monitor.getSourceId();
                    const sourceNode = this.sourceNodes.get(sourceId);
                    const dragPreview = this.sourcePreviewNodes.get(sourceId) || sourceNode;
                    if (dragPreview) {
                        const { anchorX , anchorY , offsetX , offsetY  } = this.getCurrentSourcePreviewNodeOptions();
                        const anchorPoint = {
                            anchorX,
                            anchorY
                        };
                        const offsetPoint = {
                            offsetX,
                            offsetY
                        };
                        const dragPreviewOffset = getDragPreviewOffset(sourceNode, dragPreview, clientOffset, anchorPoint, offsetPoint);
                        dataTransfer.setDragImage(dragPreview, dragPreviewOffset.x, dragPreviewOffset.y);
                    }
                }
                try {
                    // Firefox won't drag without setting data
                    dataTransfer === null || dataTransfer === void 0 ? void 0 : dataTransfer.setData('application/json', {});
                } catch (err) {
                // IE doesn't support MIME types in setData
                }
                // Store drag source node so we can check whether
                // it is removed from DOM and trigger endDrag manually.
                this.setCurrentDragSourceNode(e.target);
                // Now we are ready to publish the drag source.. or are we not?
                const { captureDraggingState  } = this.getCurrentSourcePreviewNodeOptions();
                if (!captureDraggingState) {
                    // Usually we want to publish it in the next tick so that browser
                    // is able to screenshot the current (not yet dragging) state.
                    //
                    // It also neatly avoids a situation where render() returns null
                    // in the same tick for the source element, and browser freaks out.
                    setTimeout(()=>this.actions.publishDragSource()
                    , 0);
                } else {
                    // In some cases the user may want to override this behavior, e.g.
                    // to work around IE not supporting custom drag previews.
                    //
                    // When using a custom drag layer, the only way to prevent
                    // the default drag preview from drawing in IE is to screenshot
                    // the dragging state in which the node itself has zero opacity
                    // and height. In this case, though, returning null from render()
                    // will abruptly end the dragging, which is not obvious.
                    //
                    // This is the reason such behavior is strictly opt-in.
                    this.actions.publishDragSource();
                }
            } else if (nativeType) {
                // A native item (such as URL) dragged from inside the document
                this.beginDragNativeItem(nativeType);
            } else if (dataTransfer && !dataTransfer.types && (e.target && !e.target.hasAttribute || !e.target.hasAttribute('draggable'))) {
                // Looks like a Safari bug: dataTransfer.types is null, but there was no draggable.
                // Just let it drag. It's a native type (URL or text) and will be picked up in
                // dragenter handler.
                return;
            } else {
                // If by this time no drag source reacted, tell browser not to drag.
                e.preventDefault();
            }
        };
        this.handleTopDragEndCapture = ()=>{
            if (this.clearCurrentDragSourceNode() && this.monitor.isDragging()) {
                // Firefox can dispatch this event in an infinite loop
                // if dragend handler does something like showing an alert.
                // Only proceed if we have not handled it already.
                this.actions.endDrag();
            }
            this.cancelHover();
        };
        this.handleTopDragEnterCapture = (e)=>{
            this.dragEnterTargetIds = [];
            if (this.isDraggingNativeItem()) {
                var ref;
                (ref = this.currentNativeSource) === null || ref === void 0 ? void 0 : ref.loadDataTransfer(e.dataTransfer);
            }
            const isFirstEnter = this.enterLeaveCounter.enter(e.target);
            if (!isFirstEnter || this.monitor.isDragging()) {
                return;
            }
            const { dataTransfer  } = e;
            const nativeType = matchNativeItemType(dataTransfer);
            if (nativeType) {
                // A native item (such as file or URL) dragged from outside the document
                this.beginDragNativeItem(nativeType, dataTransfer);
            }
        };
        this.handleTopDragEnter = (e)=>{
            const { dragEnterTargetIds  } = this;
            this.dragEnterTargetIds = [];
            if (!this.monitor.isDragging()) {
                // This is probably a native item type we don't understand.
                return;
            }
            this.altKeyPressed = e.altKey;
            // If the target changes position as the result of `dragenter`, `dragover` might still
            // get dispatched despite target being no longer there. The easy solution is to check
            // whether there actually is a target before firing `hover`.
            if (dragEnterTargetIds.length > 0) {
                this.actions.hover(dragEnterTargetIds, {
                    clientOffset: getEventClientOffset(e)
                });
            }
            const canDrop = dragEnterTargetIds.some((targetId)=>this.monitor.canDropOnTarget(targetId)
            );
            if (canDrop) {
                // IE requires this to fire dragover events
                e.preventDefault();
                if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = this.getCurrentDropEffect();
                }
            }
        };
        this.handleTopDragOverCapture = (e)=>{
            this.dragOverTargetIds = [];
            if (this.isDraggingNativeItem()) {
                var ref;
                (ref = this.currentNativeSource) === null || ref === void 0 ? void 0 : ref.loadDataTransfer(e.dataTransfer);
            }
        };
        this.handleTopDragOver = (e)=>{
            const { dragOverTargetIds  } = this;
            this.dragOverTargetIds = [];
            if (!this.monitor.isDragging()) {
                // This is probably a native item type we don't understand.
                // Prevent default "drop and blow away the whole document" action.
                e.preventDefault();
                if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = 'none';
                }
                return;
            }
            this.altKeyPressed = e.altKey;
            this.lastClientOffset = getEventClientOffset(e);
            this.scheduleHover(dragOverTargetIds);
            const canDrop = (dragOverTargetIds || []).some((targetId)=>this.monitor.canDropOnTarget(targetId)
            );
            if (canDrop) {
                // Show user-specified drop effect.
                e.preventDefault();
                if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = this.getCurrentDropEffect();
                }
            } else if (this.isDraggingNativeItem()) {
                // Don't show a nice cursor but still prevent default
                // "drop and blow away the whole document" action.
                e.preventDefault();
            } else {
                e.preventDefault();
                if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = 'none';
                }
            }
        };
        this.handleTopDragLeaveCapture = (e)=>{
            if (this.isDraggingNativeItem()) {
                e.preventDefault();
            }
            const isLastLeave = this.enterLeaveCounter.leave(e.target);
            if (!isLastLeave) {
                return;
            }
            if (this.isDraggingNativeItem()) {
                setTimeout(()=>this.endDragNativeItem()
                , 0);
            }
            this.cancelHover();
        };
        this.handleTopDropCapture = (e)=>{
            this.dropTargetIds = [];
            if (this.isDraggingNativeItem()) {
                var ref;
                e.preventDefault();
                (ref = this.currentNativeSource) === null || ref === void 0 ? void 0 : ref.loadDataTransfer(e.dataTransfer);
            } else if (matchNativeItemType(e.dataTransfer)) {
                // Dragging some elements, like <a> and <img> may still behave like a native drag event,
                // even if the current drag event matches a user-defined type.
                // Stop the default behavior when we're not expecting a native item to be dropped.
                e.preventDefault();
            }
            this.enterLeaveCounter.reset();
        };
        this.handleTopDrop = (e)=>{
            const { dropTargetIds  } = this;
            this.dropTargetIds = [];
            this.actions.hover(dropTargetIds, {
                clientOffset: getEventClientOffset(e)
            });
            this.actions.drop({
                dropEffect: this.getCurrentDropEffect()
            });
            if (this.isDraggingNativeItem()) {
                this.endDragNativeItem();
            } else if (this.monitor.isDragging()) {
                this.actions.endDrag();
            }
            this.cancelHover();
        };
        this.handleSelectStart = (e)=>{
            const target = e.target;
            // Only IE requires us to explicitly say
            // we want drag drop operation to start
            if (typeof target.dragDrop !== 'function') {
                return;
            }
            // Inputs and textareas should be selectable
            if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return;
            }
            // For other targets, ask IE
            // to enable drag and drop
            e.preventDefault();
            target.dragDrop();
        };
        this.options = new OptionsReader(globalContext, options);
        this.actions = manager.getActions();
        this.monitor = manager.getMonitor();
        this.registry = manager.getRegistry();
        this.enterLeaveCounter = new EnterLeaveCounter(this.isNodeInDocument);
    }
}

//# sourceMappingURL=HTML5BackendImpl.js.map
;// ./node_modules/react-dnd-html5-backend/dist/getEmptyImage.js
let emptyImage;
function getEmptyImage() {
    if (!emptyImage) {
        emptyImage = new Image();
        emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    }
    return emptyImage;
}

//# sourceMappingURL=getEmptyImage.js.map
;// ./node_modules/react-dnd-html5-backend/dist/index.js




const HTML5Backend = function createBackend(manager, context, options) {
    return new HTML5BackendImpl(manager, context, options);
};

//# sourceMappingURL=index.js.map

/***/ }),

/***/ 44380:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {

/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(85072);
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(97825);
/* harmony import */ var _style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(77659);
/* harmony import */ var _style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(55056);
/* harmony import */ var _style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(10540);
/* harmony import */ var _style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(41113);
/* harmony import */ var _style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _css_loader_dist_cjs_js_postcss_loader_dist_cjs_js_ReactContexify_min_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(80197);

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_css_loader_dist_cjs_js_postcss_loader_dist_cjs_js_ReactContexify_min_css__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A, options);




       /* unused harmony default export */ var __WEBPACK_DEFAULT_EXPORT__ = (_css_loader_dist_cjs_js_postcss_loader_dist_cjs_js_ReactContexify_min_css__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A && _css_loader_dist_cjs_js_postcss_loader_dist_cjs_js_ReactContexify_min_css__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A.locals ? _css_loader_dist_cjs_js_postcss_loader_dist_cjs_js_ReactContexify_min_css__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A.locals : undefined);


/***/ }),

/***/ 51128:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  q7: () => (/* binding */ pt),
  W1: () => (/* binding */ it),
  EF: () => (/* binding */ Fe)
});

// UNUSED EXPORTS: RightSlot, Separator, Submenu, contextMenu

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./node_modules/react-contexify/node_modules/clsx/dist/clsx.m.js
function r(e){var t,f,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(f=r(e[t]))&&(n&&(n+=" "),n+=f);else for(t in e)e[t]&&(n&&(n+=" "),n+=t);return n}function clsx(){for(var e,t,f=0,n="";f<arguments.length;)(e=arguments[f++])&&(t=r(e))&&(n&&(n+=" "),n+=t);return n}/* harmony default export */ const clsx_m = (clsx);
// EXTERNAL MODULE: ./node_modules/react-dom/index.js
var react_dom = __webpack_require__(40961);
;// ./node_modules/react-contexify/dist/index.mjs




var Y=(0,react.createContext)({}),F=()=>(0,react.useContext)(Y),$=t=>react.createElement(Y.Provider,{...t});function le(){let t=new Map;return {on(e,r){return t.has(e)?t.get(e).add(r):t.set(e,new Set([r])),this},off(e,r){return t.has(e)&&t.get(e).delete(r),this},emit(e,r){return t.has(e)&&t.get(e).forEach(f=>{f(r);}),this}}}var R=le();var B=()=>(0,react.useRef)(new Map).current;var z=()=>{},U=["resize","contextmenu","click","scroll","blur"];var A={show({event:t,id:e,props:r,position:f}){t.preventDefault&&t.preventDefault(),R.emit(0).emit(e,{event:t.nativeEvent||t,props:r,position:f});},hideAll(){R.emit(0);}};function Fe(t){return {show(e){A.show({...t,...e});},hideAll(){A.hideAll();}}}function G(){let t=new Map,e,r,f,s,i=!1;function P(n){s=Array.from(n.values()),e=-1,f=!0;}function v(){s[e].node.focus();}let x=()=>e>=0&&s[e].isSubmenu,w=()=>Array.from(s[e].submenuRefTracker.values());function m(){return e===-1?(b(),!1):!0}function b(){e+1<s.length?e++:e+1===s.length&&(e=0),i&&a(),v();}function E(){e===-1||e===0?e=s.length-1:e-1<s.length&&e--,i&&a(),v();}function T(){if(m()&&x()){let n=w(),{node:c,setSubmenuPosition:h}=s[e];return t.set(c,{isRoot:f,focusedIndex:e,parentNode:r||c,items:s}),h(),c.classList.add("contexify_submenu-isOpen"),r=c,n.length>0?(e=0,s=n):i=!0,f=!1,v(),!0}return !1}function a(){if(m()&&!f){let n=t.get(r);r.classList.remove("contexify_submenu-isOpen"),s=n.items,r=n.parentNode,n.isRoot&&(f=!0,t.clear()),i||(e=n.focusedIndex,v());}}function y(n){function c(h){for(let o of h)o.isSubmenu&&o.submenuRefTracker&&c(Array.from(o.submenuRefTracker.values())),o.keyMatcher&&o.keyMatcher(n);}c(s);}return {init:P,moveDown:b,moveUp:E,openSubmenu:T,closeSubmenu:a,matchKeys:y}}function I(t){return typeof t=="function"}function V(t){return typeof t=="string"}function _(t,e){return react.Children.map(react.Children.toArray(t).filter(Boolean),r=>(0,react.cloneElement)(r,e))}function J(t){let e={x:t.clientX,y:t.clientY},r=t.changedTouches;return r&&(e.x=r[0].clientX,e.y=r[0].clientY),(!e.x||e.x<0)&&(e.x=0),(!e.y||e.y<0)&&(e.y=0),e}function k(t,e){return I(t)?t(e):t}function be(t,e){return {...t,...I(e)?e(t):e}}var it=({id:t,theme:e,style:r,className:f,children:s,animation:i="fade",preventDefaultOnKeydown:P=!0,disableBoundariesCheck:v=!1,onVisibilityChange:x,...w})=>{let[m,b]=(0,react.useReducer)(be,{x:0,y:0,visible:!1,triggerEvent:{},propsFromTrigger:null,willLeave:!1}),E=(0,react.useRef)(null),T=B(),[a]=(0,react.useState)(()=>G()),y=(0,react.useRef)(),n=(0,react.useRef)();(0,react.useEffect)(()=>(R.on(t,h).on(0,o),()=>{R.off(t,h).off(0,o);}),[t,i,v]),(0,react.useEffect)(()=>{m.visible?a.init(T):T.clear();},[m.visible,a,T]);function c(u,p){if(E.current&&!v){let{innerWidth:d,innerHeight:C}=window,{offsetWidth:K,offsetHeight:O}=E.current;u+K>d&&(u-=u+K-d),p+O>C&&(p-=p+O-C);}return {x:u,y:p}}(0,react.useEffect)(()=>{m.visible&&b(c(m.x,m.y));},[m.visible]),(0,react.useEffect)(()=>{function u(d){P&&d.preventDefault();}function p(d){switch(d.key){case"Enter":case" ":a.openSubmenu()||o();break;case"Escape":o();break;case"ArrowUp":u(d),a.moveUp();break;case"ArrowDown":u(d),a.moveDown();break;case"ArrowRight":u(d),a.openSubmenu();break;case"ArrowLeft":u(d),a.closeSubmenu();break;default:a.matchKeys(d);break}}if(m.visible){window.addEventListener("keydown",p);for(let d of U)window.addEventListener(d,o);}return ()=>{window.removeEventListener("keydown",p);for(let d of U)window.removeEventListener(d,o);}},[m.visible,a,P]);function h({event:u,props:p,position:d}){u.stopPropagation();let C=d||J(u),{x:K,y:O}=c(C.x,C.y);(0,react_dom.flushSync)(()=>{b({visible:!0,willLeave:!1,x:K,y:O,triggerEvent:u,propsFromTrigger:p});}),clearTimeout(n.current),!y.current&&I(x)&&(x(!0),y.current=!0);}function o(u){u!=null&&(u.button===2||u.ctrlKey)&&u.type!=="contextmenu"||(i&&(V(i)||"exit"in i&&i.exit)?b(p=>({willLeave:p.visible})):b(p=>({visible:p.visible?!1:p.visible})),n.current=setTimeout(()=>{I(x)&&x(!1),y.current=!1;}));}function M(){m.willLeave&&m.visible&&(0,react_dom.flushSync)(()=>b({visible:!1,willLeave:!1}));}function S(){return V(i)?clsx_m({[`${"contexify_willEnter-"}${i}`]:g&&!D,[`${"contexify_willLeave-"}${i} ${"contexify_willLeave-"}'disabled'`]:g&&D}):i&&"enter"in i&&"exit"in i?clsx_m({[`${"contexify_willEnter-"}${i.enter}`]:i.enter&&g&&!D,[`${"contexify_willLeave-"}${i.exit} ${"contexify_willLeave-"}'disabled'`]:i.exit&&g&&D}):null}let{visible:g,triggerEvent:l,propsFromTrigger:L,x:oe,y:ie,willLeave:D}=m,ae=clsx_m("contexify",f,{[`${"contexify_theme-"}${e}`]:e},S());return react.createElement($,{value:T},g&&react.createElement("div",{...w,className:ae,onAnimationEnd:M,style:{...r,left:oe,top:ie,opacity:1},ref:E,role:"menu"},_(s,{propsFromTrigger:L,triggerEvent:l})))};var pt=({id:t,children:e,className:r,style:f,triggerEvent:s,data:i,propsFromTrigger:P,keyMatcher:v,onClick:x=z,disabled:w=!1,hidden:m=!1,closeOnClick:b=!0,handlerEvent:E="onClick",...T})=>{let a=(0,react.useRef)(),y=F(),n={id:t,data:i,triggerEvent:s,props:P},c=k(w,n),h=k(m,n);function o(l){n.event=l,l.stopPropagation(),c||(b?M():x(n));}function M(){let l=a.current;l.focus(),l.addEventListener("animationend",()=>setTimeout(A.hideAll),{once:!0}),l.classList.add("contexify_item-feedback"),x(n);}function S(l){l&&!c&&(a.current=l,y.set(l,{node:l,isSubmenu:!1,keyMatcher:!c&&I(v)&&(L=>{v(L)&&(L.stopPropagation(),L.preventDefault(),n.event=L,M());})}));}function g(l){(l.key==="Enter"||l.key===" ")&&(l.stopPropagation(),n.event=l,M());}return h?null:react.createElement("div",{...T,[E]:o,className:clsx_m("contexify_item",r,{[`${"contexify_item-disabled"}`]:c}),style:f,onKeyDown:g,ref:S,tabIndex:-1,role:"menuitem","aria-disabled":c},react.createElement("div",{className:"contexify_itemContent"},e))};var Et=({triggerEvent:t,data:e,propsFromTrigger:r,hidden:f=!1})=>k(f,{data:e,triggerEvent:t,props:r})?null:H.createElement("div",{className:"contexify_separator"});var re=()=>H.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},H.createElement("polyline",{points:"9 18 15 12 9 6"}));var ne=({className:t,...e})=>H.createElement("div",{className:X("contexify_rightSlot",t),...e});var Kt=({arrow:t,children:e,disabled:r=!1,hidden:f=!1,label:s,className:i,triggerEvent:P,propsFromTrigger:v,style:x,...w})=>{let m=F(),b=B(),E=useRef(null),T={triggerEvent:P,props:v},a=k(r,T),y=k(f,T);function n(){let o=E.current;if(o){let M=`${"contexify_submenu"}-bottom`,S=`${"contexify_submenu"}-right`;o.classList.remove(M,S);let g=o.getBoundingClientRect();g.right>window.innerWidth&&o.classList.add(S),g.bottom>window.innerHeight&&o.classList.add(M);}}function c(o){o&&!a&&m.set(o,{node:o,isSubmenu:!0,submenuRefTracker:b,setSubmenuPosition:n});}if(y)return null;let h=X("contexify_item",i,{[`${"contexify_item-disabled"}`]:a});return H.createElement($,{value:b},H.createElement("div",{...w,className:h,ref:c,tabIndex:-1,role:"menuitem","aria-haspopup":!0,"aria-disabled":a,onMouseEnter:n,onTouchStart:n},H.createElement("div",{className:"contexify_itemContent",onClick:o=>o.stopPropagation()},s,H.createElement(ne,null,t||H.createElement(re,null))),H.createElement("div",{className:`${"contexify"} ${"contexify_submenu"}`,ref:E,style:x},_(e,{propsFromTrigger:v,triggerEvent:P}))))};


//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.mjs.map

/***/ }),

/***/ 64057:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  bq: () => (/* reexport */ $d4ee10de306f2510$export$cd4e5573fbe2b576),
  wt: () => (/* reexport */ $d4ee10de306f2510$export$e58f029f0fbfdb29),
  TW: () => (/* reexport */ $431fbd86ca7dc216$export$b204af158042fbac),
  mD: () => (/* reexport */ domHelpers_$431fbd86ca7dc216$export$f21a1ffae260145a),
  Lz: () => (/* reexport */ platform_$c87311424ea30a05$export$9ac100e40613ea10),
  YF: () => (/* reexport */ $6a7db85432448f7f$export$60278871457622de),
  sD: () => (/* reexport */ DOMFunctions_$d4ee10de306f2510$export$4282f70798064fe0),
  Jt: () => (/* reexport */ useEffectEvent_$8ae05eaa5c114e9c$export$7f54fc3180508a52),
  A5: () => (/* reexport */ $03deb23ff14920c4$export$4eaf04e54aa8eed6),
  Nf: () => (/* reexport */ useLayoutEffect_$f0a04ccd8dbdd83b$export$e5c5a5f917a5871c)
});

// UNUSED EXPORTS: CLEAR_FOCUS_EVENT, FOCUS_EVENT, RouterProvider, ShadowTreeWalker, UNSTABLE_useLoadMoreSentinel, chain, clamp, createShadowTreeWalker, filterDOMProps, focusWithoutScrolling, getOffset, getScrollParent, getScrollParents, getSyntheticLinkProps, handleLinkClick, inertValue, isAndroid, isAppleDevice, isChrome, isCtrlKeyPressed, isFirefox, isFocusable, isIOS, isIPad, isIPhone, isScrollable, isShadowRoot, isTabbable, isVirtualPointerEvent, isWebKit, mergeIds, mergeProps, mergeRefs, openLink, runAfterTransition, scrollIntoView, scrollIntoViewport, shouldClientNavigate, snapValueToStep, useDeepMemo, useDescription, useDrag1D, useEnterAnimation, useEvent, useExitAnimation, useFormReset, useId, useLabels, useLinkProps, useLoadMore, useLoadMoreSentinel, useObjectRef, useResizeObserver, useRouter, useSlotId, useSyncRef, useSyntheticLinkProps, useUpdateEffect, useUpdateLayoutEffect, useValueEffect, useViewportSize, willOpenKeyboard

// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(96540);
;// ./node_modules/@react-aria/utils/dist/useLayoutEffect.mjs


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
const useLayoutEffect_$f0a04ccd8dbdd83b$export$e5c5a5f917a5871c = typeof document !== 'undefined' ? (0, react).useLayoutEffect : ()=>{};



//# sourceMappingURL=useLayoutEffect.module.js.map

;// ./node_modules/@react-aria/utils/dist/useEffectEvent.mjs



/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 

var $8ae05eaa5c114e9c$var$_React_useInsertionEffect;
// Use the earliest effect type possible. useInsertionEffect runs during the mutation phase,
// before all layout effects, but is available only in React 18 and later.
const $8ae05eaa5c114e9c$var$useEarlyEffect = ($8ae05eaa5c114e9c$var$_React_useInsertionEffect = (0, react)['useInsertionEffect']) !== null && $8ae05eaa5c114e9c$var$_React_useInsertionEffect !== void 0 ? $8ae05eaa5c114e9c$var$_React_useInsertionEffect : (0, useLayoutEffect_$f0a04ccd8dbdd83b$export$e5c5a5f917a5871c);
function useEffectEvent_$8ae05eaa5c114e9c$export$7f54fc3180508a52(fn) {
    const ref = (0, react.useRef)(null);
    $8ae05eaa5c114e9c$var$useEarlyEffect(()=>{
        ref.current = fn;
    }, [
        fn
    ]);
    // @ts-ignore
    return (0, react.useCallback)((...args)=>{
        const f = ref.current;
        return f === null || f === void 0 ? void 0 : f(...args);
    }, []);
}



//# sourceMappingURL=useEffectEvent.module.js.map

;// ./node_modules/@react-aria/utils/dist/useValueEffect.mjs




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

function useValueEffect_$1dbecbe27a04f9af$export$14d238f342723f25(defaultValue) {
    let [value, setValue] = (0, $fCAlL$useState)(defaultValue);
    let effect = (0, $fCAlL$useRef)(null);
    // Store the function in a ref so we can always access the current version
    // which has the proper `value` in scope.
    let nextRef = (0, $8ae05eaa5c114e9c$export$7f54fc3180508a52)(()=>{
        if (!effect.current) return;
        // Run the generator to the next yield.
        let newValue = effect.current.next();
        // If the generator is done, reset the effect.
        if (newValue.done) {
            effect.current = null;
            return;
        }
        // If the value is the same as the current value,
        // then continue to the next yield. Otherwise,
        // set the value in state and wait for the next layout effect.
        if (value === newValue.value) nextRef();
        else setValue(newValue.value);
    });
    (0, $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c)(()=>{
        // If there is an effect currently running, continue to the next yield.
        if (effect.current) nextRef();
    });
    let queue = (0, $8ae05eaa5c114e9c$export$7f54fc3180508a52)((fn)=>{
        effect.current = fn(value);
        nextRef();
    });
    return [
        value,
        queue
    ];
}



//# sourceMappingURL=useValueEffect.module.js.map

// EXTERNAL MODULE: ./node_modules/@react-aria/ssr/dist/import.mjs + 1 modules
var dist_import = __webpack_require__(27575);
;// ./node_modules/@react-aria/utils/dist/useId.mjs





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



// copied from SSRProvider.tsx to reduce exports, if needed again, consider sharing
let $bdb11010cef70236$var$canUseDOM = Boolean(typeof window !== 'undefined' && window.document && window.document.createElement);
let $bdb11010cef70236$export$d41a04c74483c6ef = new Map();
// This allows us to clean up the idsUpdaterMap when the id is no longer used.
// Map is a strong reference, so unused ids wouldn't be cleaned up otherwise.
// This can happen in suspended components where mount/unmount is not called.
let $bdb11010cef70236$var$registry;
if (typeof FinalizationRegistry !== 'undefined') $bdb11010cef70236$var$registry = new FinalizationRegistry((heldValue)=>{
    $bdb11010cef70236$export$d41a04c74483c6ef.delete(heldValue);
});
function useId_$bdb11010cef70236$export$f680877a34711e37(defaultId) {
    let [value, setValue] = (0, $eKkEp$useState)(defaultId);
    let nextId = (0, $eKkEp$useRef)(null);
    let res = (0, $eKkEp$useSSRSafeId)(value);
    let cleanupRef = (0, $eKkEp$useRef)(null);
    if ($bdb11010cef70236$var$registry) $bdb11010cef70236$var$registry.register(cleanupRef, res);
    if ($bdb11010cef70236$var$canUseDOM) {
        const cacheIdRef = $bdb11010cef70236$export$d41a04c74483c6ef.get(res);
        if (cacheIdRef && !cacheIdRef.includes(nextId)) cacheIdRef.push(nextId);
        else $bdb11010cef70236$export$d41a04c74483c6ef.set(res, [
            nextId
        ]);
    }
    (0, $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c)(()=>{
        let r = res;
        return ()=>{
            // In Suspense, the cleanup function may be not called
            // when it is though, also remove it from the finalization registry.
            if ($bdb11010cef70236$var$registry) $bdb11010cef70236$var$registry.unregister(cleanupRef);
            $bdb11010cef70236$export$d41a04c74483c6ef.delete(r);
        };
    }, [
        res
    ]);
    // This cannot cause an infinite loop because the ref is always cleaned up.
    // eslint-disable-next-line
    (0, $eKkEp$useEffect)(()=>{
        let newId = nextId.current;
        if (newId) setValue(newId);
        return ()=>{
            if (newId) nextId.current = null;
        };
    });
    return res;
}
function useId_$bdb11010cef70236$export$cd8c9cb68f842629(idA, idB) {
    if (idA === idB) return idA;
    let setIdsA = $bdb11010cef70236$export$d41a04c74483c6ef.get(idA);
    if (setIdsA) {
        setIdsA.forEach((ref)=>ref.current = idB);
        return idB;
    }
    let setIdsB = $bdb11010cef70236$export$d41a04c74483c6ef.get(idB);
    if (setIdsB) {
        setIdsB.forEach((ref)=>ref.current = idA);
        return idA;
    }
    return idB;
}
function $bdb11010cef70236$export$b4cc09c592e8fdb8(depArray = []) {
    let id = useId_$bdb11010cef70236$export$f680877a34711e37();
    let [resolvedId, setResolvedId] = (0, $1dbecbe27a04f9af$export$14d238f342723f25)(id);
    let updateId = (0, $eKkEp$useCallback)(()=>{
        setResolvedId(function*() {
            yield id;
            yield document.getElementById(id) ? id : undefined;
        });
    }, [
        id,
        setResolvedId
    ]);
    (0, $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c)(updateId, [
        id,
        updateId,
        ...depArray
    ]);
    return resolvedId;
}



//# sourceMappingURL=useId.module.js.map

;// ./node_modules/@react-aria/utils/dist/chain.mjs
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
 */ /**
 * Calls all functions in the order they were chained with the same arguments.
 */ function chain_$ff5963eb1fccf552$export$e08e3b67e392101e(...callbacks) {
    return (...args)=>{
        for (let callback of callbacks)if (typeof callback === 'function') callback(...args);
    };
}



//# sourceMappingURL=chain.module.js.map

;// ./node_modules/@react-aria/utils/dist/domHelpers.mjs
const $431fbd86ca7dc216$export$b204af158042fbac = (el)=>{
    var _el_ownerDocument;
    return (_el_ownerDocument = el === null || el === void 0 ? void 0 : el.ownerDocument) !== null && _el_ownerDocument !== void 0 ? _el_ownerDocument : document;
};
const domHelpers_$431fbd86ca7dc216$export$f21a1ffae260145a = (el)=>{
    if (el && 'window' in el && el.window === el) return el;
    const doc = $431fbd86ca7dc216$export$b204af158042fbac(el);
    return doc.defaultView || window;
};
/**
 * Type guard that checks if a value is a Node. Verifies the presence and type of the nodeType property.
 */ function $431fbd86ca7dc216$var$isNode(value) {
    return value !== null && typeof value === 'object' && 'nodeType' in value && typeof value.nodeType === 'number';
}
function $431fbd86ca7dc216$export$af51f0f06c0f328a(node) {
    return $431fbd86ca7dc216$var$isNode(node) && node.nodeType === Node.DOCUMENT_FRAGMENT_NODE && 'host' in node;
}



//# sourceMappingURL=domHelpers.module.js.map

// EXTERNAL MODULE: ./node_modules/@react-stately/flags/dist/import.mjs
var flags_dist_import = __webpack_require__(93399);
;// ./node_modules/@react-aria/utils/dist/DOMFunctions.mjs



// Source: https://github.com/microsoft/tabster/blob/a89fc5d7e332d48f68d03b1ca6e344489d1c3898/src/Shadowdomize/DOMFunctions.ts#L16


function DOMFunctions_$d4ee10de306f2510$export$4282f70798064fe0(node, otherNode) {
    if (!(0, flags_dist_import/* shadowDOM */.Nf)()) return otherNode && node ? node.contains(otherNode) : false;
    if (!node || !otherNode) return false;
    let currentNode = otherNode;
    while(currentNode !== null){
        if (currentNode === node) return true;
        if (currentNode.tagName === 'SLOT' && currentNode.assignedSlot) // Element is slotted
        currentNode = currentNode.assignedSlot.parentNode;
        else if ((0, $431fbd86ca7dc216$export$af51f0f06c0f328a)(currentNode)) // Element is in shadow root
        currentNode = currentNode.host;
        else currentNode = currentNode.parentNode;
    }
    return false;
}
const $d4ee10de306f2510$export$cd4e5573fbe2b576 = (doc = document)=>{
    var _activeElement_shadowRoot;
    if (!(0, flags_dist_import/* shadowDOM */.Nf)()) return doc.activeElement;
    let activeElement = doc.activeElement;
    while(activeElement && 'shadowRoot' in activeElement && ((_activeElement_shadowRoot = activeElement.shadowRoot) === null || _activeElement_shadowRoot === void 0 ? void 0 : _activeElement_shadowRoot.activeElement))activeElement = activeElement.shadowRoot.activeElement;
    return activeElement;
};
function $d4ee10de306f2510$export$e58f029f0fbfdb29(event) {
    if ((0, flags_dist_import/* shadowDOM */.Nf)() && event.target.shadowRoot) {
        if (event.composedPath) return event.composedPath()[0];
    }
    return event.target;
}



//# sourceMappingURL=DOMFunctions.module.js.map

;// ./node_modules/@react-aria/utils/dist/ShadowTreeWalker.mjs



// https://github.com/microsoft/tabster/blob/a89fc5d7e332d48f68d03b1ca6e344489d1c3898/src/Shadowdomize/ShadowTreeWalker.ts


class $dfc540311bf7f109$export$63eb3ababa9c55c4 {
    get currentNode() {
        return this._currentNode;
    }
    set currentNode(node) {
        if (!(0, $d4ee10de306f2510$export$4282f70798064fe0)(this.root, node)) throw new Error('Cannot set currentNode to a node that is not contained by the root node.');
        const walkers = [];
        let curNode = node;
        let currentWalkerCurrentNode = node;
        this._currentNode = node;
        while(curNode && curNode !== this.root)if (curNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            const shadowRoot = curNode;
            const walker = this._doc.createTreeWalker(shadowRoot, this.whatToShow, {
                acceptNode: this._acceptNode
            });
            walkers.push(walker);
            walker.currentNode = currentWalkerCurrentNode;
            this._currentSetFor.add(walker);
            curNode = currentWalkerCurrentNode = shadowRoot.host;
        } else curNode = curNode.parentNode;
        const walker = this._doc.createTreeWalker(this.root, this.whatToShow, {
            acceptNode: this._acceptNode
        });
        walkers.push(walker);
        walker.currentNode = currentWalkerCurrentNode;
        this._currentSetFor.add(walker);
        this._walkerStack = walkers;
    }
    get doc() {
        return this._doc;
    }
    firstChild() {
        let currentNode = this.currentNode;
        let newNode = this.nextNode();
        if (!(0, $d4ee10de306f2510$export$4282f70798064fe0)(currentNode, newNode)) {
            this.currentNode = currentNode;
            return null;
        }
        if (newNode) this.currentNode = newNode;
        return newNode;
    }
    lastChild() {
        let walker = this._walkerStack[0];
        let newNode = walker.lastChild();
        if (newNode) this.currentNode = newNode;
        return newNode;
    }
    nextNode() {
        const nextNode = this._walkerStack[0].nextNode();
        if (nextNode) {
            const shadowRoot = nextNode.shadowRoot;
            if (shadowRoot) {
                var _this_filter;
                let nodeResult;
                if (typeof this.filter === 'function') nodeResult = this.filter(nextNode);
                else if ((_this_filter = this.filter) === null || _this_filter === void 0 ? void 0 : _this_filter.acceptNode) nodeResult = this.filter.acceptNode(nextNode);
                if (nodeResult === NodeFilter.FILTER_ACCEPT) {
                    this.currentNode = nextNode;
                    return nextNode;
                }
                // _acceptNode should have added new walker for this shadow,
                // go in recursively.
                let newNode = this.nextNode();
                if (newNode) this.currentNode = newNode;
                return newNode;
            }
            if (nextNode) this.currentNode = nextNode;
            return nextNode;
        } else {
            if (this._walkerStack.length > 1) {
                this._walkerStack.shift();
                let newNode = this.nextNode();
                if (newNode) this.currentNode = newNode;
                return newNode;
            } else return null;
        }
    }
    previousNode() {
        const currentWalker = this._walkerStack[0];
        if (currentWalker.currentNode === currentWalker.root) {
            if (this._currentSetFor.has(currentWalker)) {
                this._currentSetFor.delete(currentWalker);
                if (this._walkerStack.length > 1) {
                    this._walkerStack.shift();
                    let newNode = this.previousNode();
                    if (newNode) this.currentNode = newNode;
                    return newNode;
                } else return null;
            }
            return null;
        }
        const previousNode = currentWalker.previousNode();
        if (previousNode) {
            const shadowRoot = previousNode.shadowRoot;
            if (shadowRoot) {
                var _this_filter;
                let nodeResult;
                if (typeof this.filter === 'function') nodeResult = this.filter(previousNode);
                else if ((_this_filter = this.filter) === null || _this_filter === void 0 ? void 0 : _this_filter.acceptNode) nodeResult = this.filter.acceptNode(previousNode);
                if (nodeResult === NodeFilter.FILTER_ACCEPT) {
                    if (previousNode) this.currentNode = previousNode;
                    return previousNode;
                }
                // _acceptNode should have added new walker for this shadow,
                // go in recursively.
                let newNode = this.lastChild();
                if (newNode) this.currentNode = newNode;
                return newNode;
            }
            if (previousNode) this.currentNode = previousNode;
            return previousNode;
        } else {
            if (this._walkerStack.length > 1) {
                this._walkerStack.shift();
                let newNode = this.previousNode();
                if (newNode) this.currentNode = newNode;
                return newNode;
            } else return null;
        }
    }
    /**
     * @deprecated
     */ nextSibling() {
        // if (__DEV__) {
        //     throw new Error("Method not implemented.");
        // }
        return null;
    }
    /**
     * @deprecated
     */ previousSibling() {
        // if (__DEV__) {
        //     throw new Error("Method not implemented.");
        // }
        return null;
    }
    /**
     * @deprecated
     */ parentNode() {
        // if (__DEV__) {
        //     throw new Error("Method not implemented.");
        // }
        return null;
    }
    constructor(doc, root, whatToShow, filter){
        this._walkerStack = [];
        this._currentSetFor = new Set();
        this._acceptNode = (node)=>{
            if (node.nodeType === Node.ELEMENT_NODE) {
                const shadowRoot = node.shadowRoot;
                if (shadowRoot) {
                    const walker = this._doc.createTreeWalker(shadowRoot, this.whatToShow, {
                        acceptNode: this._acceptNode
                    });
                    this._walkerStack.unshift(walker);
                    return NodeFilter.FILTER_ACCEPT;
                } else {
                    var _this_filter;
                    if (typeof this.filter === 'function') return this.filter(node);
                    else if ((_this_filter = this.filter) === null || _this_filter === void 0 ? void 0 : _this_filter.acceptNode) return this.filter.acceptNode(node);
                    else if (this.filter === null) return NodeFilter.FILTER_ACCEPT;
                }
            }
            return NodeFilter.FILTER_SKIP;
        };
        this._doc = doc;
        this.root = root;
        this.filter = filter !== null && filter !== void 0 ? filter : null;
        this.whatToShow = whatToShow !== null && whatToShow !== void 0 ? whatToShow : NodeFilter.SHOW_ALL;
        this._currentNode = root;
        this._walkerStack.unshift(doc.createTreeWalker(root, whatToShow, this._acceptNode));
        const shadowRoot = root.shadowRoot;
        if (shadowRoot) {
            const walker = this._doc.createTreeWalker(shadowRoot, this.whatToShow, {
                acceptNode: this._acceptNode
            });
            this._walkerStack.unshift(walker);
        }
    }
}
function $dfc540311bf7f109$export$4d0f8be8b12a7ef6(doc, root, whatToShow, filter) {
    if ((0, $bJKXg$shadowDOM)()) return new $dfc540311bf7f109$export$63eb3ababa9c55c4(doc, root, whatToShow, filter);
    return doc.createTreeWalker(root, whatToShow, filter);
}



//# sourceMappingURL=ShadowTreeWalker.module.js.map

// EXTERNAL MODULE: ./node_modules/clsx/dist/clsx.mjs
var clsx = __webpack_require__(34164);
;// ./node_modules/@react-aria/utils/dist/mergeProps.mjs




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


function $3ef42575df84b30b$export$9d1611c77c2fe928(...args) {
    // Start with a base clone of the first argument. This is a lot faster than starting
    // with an empty object and adding properties as we go.
    let result = {
        ...args[0]
    };
    for(let i = 1; i < args.length; i++){
        let props = args[i];
        for(let key in props){
            let a = result[key];
            let b = props[key];
            // Chain events
            if (typeof a === 'function' && typeof b === 'function' && // This is a lot faster than a regex.
            key[0] === 'o' && key[1] === 'n' && key.charCodeAt(2) >= /* 'A' */ 65 && key.charCodeAt(2) <= /* 'Z' */ 90) result[key] = (0, $ff5963eb1fccf552$export$e08e3b67e392101e)(a, b);
            else if ((key === 'className' || key === 'UNSAFE_className') && typeof a === 'string' && typeof b === 'string') result[key] = (0, $7jXr9$clsx)(a, b);
            else if (key === 'id' && a && b) result.id = (0, $bdb11010cef70236$export$cd8c9cb68f842629)(a, b);
            else result[key] = b !== undefined ? b : a;
        }
    }
    return result;
}



//# sourceMappingURL=mergeProps.module.js.map

;// ./node_modules/@react-aria/utils/dist/mergeRefs.mjs
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
 */ function $5dc95899b306f630$export$c9058316764c140e(...refs) {
    if (refs.length === 1 && refs[0]) return refs[0];
    return (value)=>{
        let hasCleanup = false;
        const cleanups = refs.map((ref)=>{
            const cleanup = $5dc95899b306f630$var$setRef(ref, value);
            hasCleanup || (hasCleanup = typeof cleanup == 'function');
            return cleanup;
        });
        if (hasCleanup) return ()=>{
            cleanups.forEach((cleanup, i)=>{
                if (typeof cleanup === 'function') cleanup();
                else $5dc95899b306f630$var$setRef(refs[i], null);
            });
        };
    };
}
function $5dc95899b306f630$var$setRef(ref, value) {
    if (typeof ref === 'function') return ref(value);
    else if (ref != null) ref.current = value;
}



//# sourceMappingURL=mergeRefs.module.js.map

;// ./node_modules/@react-aria/utils/dist/filterDOMProps.mjs
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
 */ const $65484d02dcb7eb3e$var$DOMPropNames = new Set([
    'id'
]);
const $65484d02dcb7eb3e$var$labelablePropNames = new Set([
    'aria-label',
    'aria-labelledby',
    'aria-describedby',
    'aria-details'
]);
// See LinkDOMProps in dom.d.ts.
const $65484d02dcb7eb3e$var$linkPropNames = new Set([
    'href',
    'hrefLang',
    'target',
    'rel',
    'download',
    'ping',
    'referrerPolicy'
]);
const $65484d02dcb7eb3e$var$globalAttrs = new Set([
    'dir',
    'lang',
    'hidden',
    'inert',
    'translate'
]);
const $65484d02dcb7eb3e$var$globalEvents = new Set([
    'onClick',
    'onAuxClick',
    'onContextMenu',
    'onDoubleClick',
    'onMouseDown',
    'onMouseEnter',
    'onMouseLeave',
    'onMouseMove',
    'onMouseOut',
    'onMouseOver',
    'onMouseUp',
    'onTouchCancel',
    'onTouchEnd',
    'onTouchMove',
    'onTouchStart',
    'onPointerDown',
    'onPointerMove',
    'onPointerUp',
    'onPointerCancel',
    'onPointerEnter',
    'onPointerLeave',
    'onPointerOver',
    'onPointerOut',
    'onGotPointerCapture',
    'onLostPointerCapture',
    'onScroll',
    'onWheel',
    'onAnimationStart',
    'onAnimationEnd',
    'onAnimationIteration',
    'onTransitionCancel',
    'onTransitionEnd',
    'onTransitionRun',
    'onTransitionStart'
]);
const $65484d02dcb7eb3e$var$propRe = /^(data-.*)$/;
function $65484d02dcb7eb3e$export$457c3d6518dd4c6f(props, opts = {}) {
    let { labelable: labelable, isLink: isLink, global: global, events: events = global, propNames: propNames } = opts;
    let filteredProps = {};
    for(const prop in props)if (Object.prototype.hasOwnProperty.call(props, prop) && ($65484d02dcb7eb3e$var$DOMPropNames.has(prop) || labelable && $65484d02dcb7eb3e$var$labelablePropNames.has(prop) || isLink && $65484d02dcb7eb3e$var$linkPropNames.has(prop) || global && $65484d02dcb7eb3e$var$globalAttrs.has(prop) || events && $65484d02dcb7eb3e$var$globalEvents.has(prop) || prop.endsWith('Capture') && $65484d02dcb7eb3e$var$globalEvents.has(prop.slice(0, -7)) || (propNames === null || propNames === void 0 ? void 0 : propNames.has(prop)) || $65484d02dcb7eb3e$var$propRe.test(prop))) filteredProps[prop] = props[prop];
    return filteredProps;
}



//# sourceMappingURL=filterDOMProps.module.js.map

;// ./node_modules/@react-aria/utils/dist/focusWithoutScrolling.mjs
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
 */ function $7215afc6de606d6b$export$de79e2c695e052f3(element) {
    if ($7215afc6de606d6b$var$supportsPreventScroll()) element.focus({
        preventScroll: true
    });
    else {
        let scrollableElements = $7215afc6de606d6b$var$getScrollableElements(element);
        element.focus();
        $7215afc6de606d6b$var$restoreScrollPosition(scrollableElements);
    }
}
let $7215afc6de606d6b$var$supportsPreventScrollCached = null;
function $7215afc6de606d6b$var$supportsPreventScroll() {
    if ($7215afc6de606d6b$var$supportsPreventScrollCached == null) {
        $7215afc6de606d6b$var$supportsPreventScrollCached = false;
        try {
            let focusElem = document.createElement('div');
            focusElem.focus({
                get preventScroll () {
                    $7215afc6de606d6b$var$supportsPreventScrollCached = true;
                    return true;
                }
            });
        } catch  {
        // Ignore
        }
    }
    return $7215afc6de606d6b$var$supportsPreventScrollCached;
}
function $7215afc6de606d6b$var$getScrollableElements(element) {
    let parent = element.parentNode;
    let scrollableElements = [];
    let rootScrollingElement = document.scrollingElement || document.documentElement;
    while(parent instanceof HTMLElement && parent !== rootScrollingElement){
        if (parent.offsetHeight < parent.scrollHeight || parent.offsetWidth < parent.scrollWidth) scrollableElements.push({
            element: parent,
            scrollTop: parent.scrollTop,
            scrollLeft: parent.scrollLeft
        });
        parent = parent.parentNode;
    }
    if (rootScrollingElement instanceof HTMLElement) scrollableElements.push({
        element: rootScrollingElement,
        scrollTop: rootScrollingElement.scrollTop,
        scrollLeft: rootScrollingElement.scrollLeft
    });
    return scrollableElements;
}
function $7215afc6de606d6b$var$restoreScrollPosition(scrollableElements) {
    for (let { element: element, scrollTop: scrollTop, scrollLeft: scrollLeft } of scrollableElements){
        element.scrollTop = scrollTop;
        element.scrollLeft = scrollLeft;
    }
}



//# sourceMappingURL=focusWithoutScrolling.module.js.map

;// ./node_modules/@react-aria/utils/dist/getOffset.mjs
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
 */ function getOffset_$ab71dadb03a6fb2e$export$622cea445a1c5b7d(element, reverse, orientation = 'horizontal') {
    let rect = element.getBoundingClientRect();
    if (reverse) return orientation === 'horizontal' ? rect.right : rect.bottom;
    return orientation === 'horizontal' ? rect.left : rect.top;
}



//# sourceMappingURL=getOffset.module.js.map

;// ./node_modules/@react-aria/utils/dist/platform.mjs
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
 */ function $c87311424ea30a05$var$testUserAgent(re) {
    var _window_navigator_userAgentData;
    if (typeof window === 'undefined' || window.navigator == null) return false;
    let brands = (_window_navigator_userAgentData = window.navigator['userAgentData']) === null || _window_navigator_userAgentData === void 0 ? void 0 : _window_navigator_userAgentData.brands;
    return Array.isArray(brands) && brands.some((brand)=>re.test(brand.brand)) || re.test(window.navigator.userAgent);
}
function $c87311424ea30a05$var$testPlatform(re) {
    var _window_navigator_userAgentData;
    return typeof window !== 'undefined' && window.navigator != null ? re.test(((_window_navigator_userAgentData = window.navigator['userAgentData']) === null || _window_navigator_userAgentData === void 0 ? void 0 : _window_navigator_userAgentData.platform) || window.navigator.platform) : false;
}
function $c87311424ea30a05$var$cached(fn) {
    if (false) // removed by dead control flow
{}
    let res = null;
    return ()=>{
        if (res == null) res = fn();
        return res;
    };
}
const platform_$c87311424ea30a05$export$9ac100e40613ea10 = $c87311424ea30a05$var$cached(function() {
    return $c87311424ea30a05$var$testPlatform(/^Mac/i);
});
const $c87311424ea30a05$export$186c6964ca17d99 = $c87311424ea30a05$var$cached(function() {
    return $c87311424ea30a05$var$testPlatform(/^iPhone/i);
});
const $c87311424ea30a05$export$7bef049ce92e4224 = $c87311424ea30a05$var$cached(function() {
    return $c87311424ea30a05$var$testPlatform(/^iPad/i) || // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
    platform_$c87311424ea30a05$export$9ac100e40613ea10() && navigator.maxTouchPoints > 1;
});
const $c87311424ea30a05$export$fedb369cb70207f1 = $c87311424ea30a05$var$cached(function() {
    return $c87311424ea30a05$export$186c6964ca17d99() || $c87311424ea30a05$export$7bef049ce92e4224();
});
const $c87311424ea30a05$export$e1865c3bedcd822b = $c87311424ea30a05$var$cached(function() {
    return platform_$c87311424ea30a05$export$9ac100e40613ea10() || $c87311424ea30a05$export$fedb369cb70207f1();
});
const $c87311424ea30a05$export$78551043582a6a98 = $c87311424ea30a05$var$cached(function() {
    return $c87311424ea30a05$var$testUserAgent(/AppleWebKit/i) && !platform_$c87311424ea30a05$export$6446a186d09e379e();
});
const platform_$c87311424ea30a05$export$6446a186d09e379e = $c87311424ea30a05$var$cached(function() {
    return $c87311424ea30a05$var$testUserAgent(/Chrome/i);
});
const platform_$c87311424ea30a05$export$a11b0059900ceec8 = $c87311424ea30a05$var$cached(function() {
    return $c87311424ea30a05$var$testUserAgent(/Android/i);
});
const $c87311424ea30a05$export$b7d78993b74f766d = $c87311424ea30a05$var$cached(function() {
    return $c87311424ea30a05$var$testUserAgent(/Firefox/i);
});



//# sourceMappingURL=platform.module.js.map

;// ./node_modules/@react-aria/utils/dist/openLink.mjs




/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 


const $ea8dcbcb9ea1b556$var$RouterContext = /*#__PURE__*/ (0, react.createContext)({
    isNative: true,
    open: $ea8dcbcb9ea1b556$var$openSyntheticLink,
    useHref: (href)=>href
});
function $ea8dcbcb9ea1b556$export$323e4fc2fa4753fb(props) {
    let { children: children, navigate: navigate, useHref: useHref } = props;
    let ctx = (0, $g3jFn$useMemo)(()=>({
            isNative: false,
            open: (target, modifiers, href, routerOptions)=>{
                $ea8dcbcb9ea1b556$var$getSyntheticLink(target, (link)=>{
                    if ($ea8dcbcb9ea1b556$export$efa8c9099e530235(link, modifiers)) navigate(href, routerOptions);
                    else $ea8dcbcb9ea1b556$export$95185d699e05d4d7(link, modifiers);
                });
            },
            useHref: useHref || ((href)=>href)
        }), [
        navigate,
        useHref
    ]);
    return /*#__PURE__*/ (0, $g3jFn$react).createElement($ea8dcbcb9ea1b556$var$RouterContext.Provider, {
        value: ctx
    }, children);
}
function $ea8dcbcb9ea1b556$export$9a302a45f65d0572() {
    return (0, $g3jFn$useContext)($ea8dcbcb9ea1b556$var$RouterContext);
}
function $ea8dcbcb9ea1b556$export$efa8c9099e530235(link, modifiers) {
    // Use getAttribute here instead of link.target. Firefox will default link.target to "_parent" when inside an iframe.
    let target = link.getAttribute('target');
    return (!target || target === '_self') && link.origin === location.origin && !link.hasAttribute('download') && !modifiers.metaKey && // open in new tab (mac)
    !modifiers.ctrlKey && // open in new tab (windows)
    !modifiers.altKey && // download
    !modifiers.shiftKey;
}
function $ea8dcbcb9ea1b556$export$95185d699e05d4d7(target, modifiers, setOpening = true) {
    var _window_event_type, _window_event;
    let { metaKey: metaKey, ctrlKey: ctrlKey, altKey: altKey, shiftKey: shiftKey } = modifiers;
    // Firefox does not recognize keyboard events as a user action by default, and the popup blocker
    // will prevent links with target="_blank" from opening. However, it does allow the event if the
    // Command/Control key is held, which opens the link in a background tab. This seems like the best we can do.
    // See https://bugzilla.mozilla.org/show_bug.cgi?id=257870 and https://bugzilla.mozilla.org/show_bug.cgi?id=746640.
    if ((0, $c87311424ea30a05$export$b7d78993b74f766d)() && ((_window_event = window.event) === null || _window_event === void 0 ? void 0 : (_window_event_type = _window_event.type) === null || _window_event_type === void 0 ? void 0 : _window_event_type.startsWith('key')) && target.target === '_blank') {
        if ((0, platform_$c87311424ea30a05$export$9ac100e40613ea10)()) metaKey = true;
        else ctrlKey = true;
    }
    // WebKit does not support firing click events with modifier keys, but does support keyboard events.
    // https://github.com/WebKit/WebKit/blob/c03d0ac6e6db178f90923a0a63080b5ca210d25f/Source/WebCore/html/HTMLAnchorElement.cpp#L184
    let event = (0, $c87311424ea30a05$export$78551043582a6a98)() && (0, platform_$c87311424ea30a05$export$9ac100e40613ea10)() && !(0, $c87311424ea30a05$export$7bef049ce92e4224)() && "development" !== 'test' ? new KeyboardEvent('keydown', {
        keyIdentifier: 'Enter',
        metaKey: metaKey,
        ctrlKey: ctrlKey,
        altKey: altKey,
        shiftKey: shiftKey
    }) : new MouseEvent('click', {
        metaKey: metaKey,
        ctrlKey: ctrlKey,
        altKey: altKey,
        shiftKey: shiftKey,
        bubbles: true,
        cancelable: true
    });
    $ea8dcbcb9ea1b556$export$95185d699e05d4d7.isOpening = setOpening;
    (0, $7215afc6de606d6b$export$de79e2c695e052f3)(target);
    target.dispatchEvent(event);
    $ea8dcbcb9ea1b556$export$95185d699e05d4d7.isOpening = false;
}
// https://github.com/parcel-bundler/parcel/issues/8724
$ea8dcbcb9ea1b556$export$95185d699e05d4d7.isOpening = false;
function $ea8dcbcb9ea1b556$var$getSyntheticLink(target, open) {
    if (target instanceof HTMLAnchorElement) open(target);
    else if (target.hasAttribute('data-href')) {
        let link = document.createElement('a');
        link.href = target.getAttribute('data-href');
        if (target.hasAttribute('data-target')) link.target = target.getAttribute('data-target');
        if (target.hasAttribute('data-rel')) link.rel = target.getAttribute('data-rel');
        if (target.hasAttribute('data-download')) link.download = target.getAttribute('data-download');
        if (target.hasAttribute('data-ping')) link.ping = target.getAttribute('data-ping');
        if (target.hasAttribute('data-referrer-policy')) link.referrerPolicy = target.getAttribute('data-referrer-policy');
        target.appendChild(link);
        open(link);
        target.removeChild(link);
    }
}
function $ea8dcbcb9ea1b556$var$openSyntheticLink(target, modifiers) {
    $ea8dcbcb9ea1b556$var$getSyntheticLink(target, (link)=>$ea8dcbcb9ea1b556$export$95185d699e05d4d7(link, modifiers));
}
function $ea8dcbcb9ea1b556$export$bdc77b0c0a3a85d6(props) {
    let router = $ea8dcbcb9ea1b556$export$9a302a45f65d0572();
    var _props_href;
    const href = router.useHref((_props_href = props.href) !== null && _props_href !== void 0 ? _props_href : '');
    return {
        'data-href': props.href ? href : undefined,
        'data-target': props.target,
        'data-rel': props.rel,
        'data-download': props.download,
        'data-ping': props.ping,
        'data-referrer-policy': props.referrerPolicy
    };
}
function $ea8dcbcb9ea1b556$export$51437d503373d223(props) {
    return {
        'data-href': props.href,
        'data-target': props.target,
        'data-rel': props.rel,
        'data-download': props.download,
        'data-ping': props.ping,
        'data-referrer-policy': props.referrerPolicy
    };
}
function $ea8dcbcb9ea1b556$export$7e924b3091a3bd18(props) {
    let router = $ea8dcbcb9ea1b556$export$9a302a45f65d0572();
    var _props_href;
    const href = router.useHref((_props_href = props === null || props === void 0 ? void 0 : props.href) !== null && _props_href !== void 0 ? _props_href : '');
    return {
        href: (props === null || props === void 0 ? void 0 : props.href) ? href : undefined,
        target: props === null || props === void 0 ? void 0 : props.target,
        rel: props === null || props === void 0 ? void 0 : props.rel,
        download: props === null || props === void 0 ? void 0 : props.download,
        ping: props === null || props === void 0 ? void 0 : props.ping,
        referrerPolicy: props === null || props === void 0 ? void 0 : props.referrerPolicy
    };
}
function $ea8dcbcb9ea1b556$export$13aea1a3cb5e3f1f(e, router, href, routerOptions) {
    // If a custom router is provided, prevent default and forward if this link should client navigate.
    if (!router.isNative && e.currentTarget instanceof HTMLAnchorElement && e.currentTarget.href && // If props are applied to a router Link component, it may have already prevented default.
    !e.isDefaultPrevented() && $ea8dcbcb9ea1b556$export$efa8c9099e530235(e.currentTarget, e) && href) {
        e.preventDefault();
        router.open(e.currentTarget, e, href, routerOptions);
    }
}



//# sourceMappingURL=openLink.module.js.map

;// ./node_modules/@react-aria/utils/dist/runAfterTransition.mjs
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
 */ // We store a global list of elements that are currently transitioning,
// mapped to a set of CSS properties that are transitioning for that element.
// This is necessary rather than a simple count of transitions because of browser
// bugs, e.g. Chrome sometimes fires both transitionend and transitioncancel rather
// than one or the other. So we need to track what's actually transitioning so that
// we can ignore these duplicate events.
let $bbed8b41f857bcc0$var$transitionsByElement = new Map();
// A list of callbacks to call once there are no transitioning elements.
let $bbed8b41f857bcc0$var$transitionCallbacks = new Set();
function $bbed8b41f857bcc0$var$setupGlobalEvents() {
    if (typeof window === 'undefined') return;
    function isTransitionEvent(event) {
        return 'propertyName' in event;
    }
    let onTransitionStart = (e)=>{
        if (!isTransitionEvent(e) || !e.target) return;
        // Add the transitioning property to the list for this element.
        let transitions = $bbed8b41f857bcc0$var$transitionsByElement.get(e.target);
        if (!transitions) {
            transitions = new Set();
            $bbed8b41f857bcc0$var$transitionsByElement.set(e.target, transitions);
            // The transitioncancel event must be registered on the element itself, rather than as a global
            // event. This enables us to handle when the node is deleted from the document while it is transitioning.
            // In that case, the cancel event would have nowhere to bubble to so we need to handle it directly.
            e.target.addEventListener('transitioncancel', onTransitionEnd, {
                once: true
            });
        }
        transitions.add(e.propertyName);
    };
    let onTransitionEnd = (e)=>{
        if (!isTransitionEvent(e) || !e.target) return;
        // Remove property from list of transitioning properties.
        let properties = $bbed8b41f857bcc0$var$transitionsByElement.get(e.target);
        if (!properties) return;
        properties.delete(e.propertyName);
        // If empty, remove transitioncancel event, and remove the element from the list of transitioning elements.
        if (properties.size === 0) {
            e.target.removeEventListener('transitioncancel', onTransitionEnd);
            $bbed8b41f857bcc0$var$transitionsByElement.delete(e.target);
        }
        // If no transitioning elements, call all of the queued callbacks.
        if ($bbed8b41f857bcc0$var$transitionsByElement.size === 0) {
            for (let cb of $bbed8b41f857bcc0$var$transitionCallbacks)cb();
            $bbed8b41f857bcc0$var$transitionCallbacks.clear();
        }
    };
    document.body.addEventListener('transitionrun', onTransitionStart);
    document.body.addEventListener('transitionend', onTransitionEnd);
}
if (typeof document !== 'undefined') {
    if (document.readyState !== 'loading') $bbed8b41f857bcc0$var$setupGlobalEvents();
    else document.addEventListener('DOMContentLoaded', $bbed8b41f857bcc0$var$setupGlobalEvents);
}
/**
 * Cleans up any elements that are no longer in the document.
 * This is necessary because we can't rely on transitionend events to fire
 * for elements that are removed from the document while transitioning.
 */ function $bbed8b41f857bcc0$var$cleanupDetachedElements() {
    for (const [eventTarget] of $bbed8b41f857bcc0$var$transitionsByElement)// Similar to `eventTarget instanceof Element && !eventTarget.isConnected`, but avoids
    // the explicit instanceof check, since it may be different in different contexts.
    if ('isConnected' in eventTarget && !eventTarget.isConnected) $bbed8b41f857bcc0$var$transitionsByElement.delete(eventTarget);
}
function $bbed8b41f857bcc0$export$24490316f764c430(fn) {
    // Wait one frame to see if an animation starts, e.g. a transition on mount.
    requestAnimationFrame(()=>{
        $bbed8b41f857bcc0$var$cleanupDetachedElements();
        // If no transitions are running, call the function immediately.
        // Otherwise, add it to a list of callbacks to run at the end of the animation.
        if ($bbed8b41f857bcc0$var$transitionsByElement.size === 0) fn();
        else $bbed8b41f857bcc0$var$transitionCallbacks.add(fn);
    });
}



//# sourceMappingURL=runAfterTransition.module.js.map

;// ./node_modules/@react-aria/utils/dist/useDrag1D.mjs



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
 */ /* eslint-disable rulesdir/pure-render */ 

// Keep track of elements that we are currently handling dragging for via useDrag1D.
// If there's an ancestor and a descendant both using useDrag1D(), and the user starts
// dragging the descendant, we don't want useDrag1D events to fire for the ancestor.
const $9cc09df9fd7676be$var$draggingElements = (/* unused pure expression or super */ null && ([]));
function $9cc09df9fd7676be$export$7bbed75feba39706(props) {
    console.warn('useDrag1D is deprecated, please use `useMove` instead https://react-spectrum.adobe.com/react-aria/useMove.html');
    let { containerRef: containerRef, reverse: reverse, orientation: orientation, onHover: onHover, onDrag: onDrag, onPositionChange: onPositionChange, onIncrement: onIncrement, onDecrement: onDecrement, onIncrementToMax: onIncrementToMax, onDecrementToMin: onDecrementToMin, onCollapseToggle: onCollapseToggle } = props;
    let getPosition = (e)=>orientation === 'horizontal' ? e.clientX : e.clientY;
    let getNextOffset = (e)=>{
        let containerOffset = (0, $ab71dadb03a6fb2e$export$622cea445a1c5b7d)(containerRef.current, reverse, orientation);
        let mouseOffset = getPosition(e);
        let nextOffset = reverse ? containerOffset - mouseOffset : mouseOffset - containerOffset;
        return nextOffset;
    };
    let dragging = (0, $1rnCS$useRef)(false);
    let prevPosition = (0, $1rnCS$useRef)(0);
    // Keep track of the current handlers in a ref so that the events can access them.
    let handlers = (0, $1rnCS$useRef)({
        onPositionChange: onPositionChange,
        onDrag: onDrag
    });
    handlers.current.onDrag = onDrag;
    handlers.current.onPositionChange = onPositionChange;
    let onMouseDragged = (e)=>{
        e.preventDefault();
        let nextOffset = getNextOffset(e);
        if (!dragging.current) {
            dragging.current = true;
            if (handlers.current.onDrag) handlers.current.onDrag(true);
            if (handlers.current.onPositionChange) handlers.current.onPositionChange(nextOffset);
        }
        if (prevPosition.current === nextOffset) return;
        prevPosition.current = nextOffset;
        if (onPositionChange) onPositionChange(nextOffset);
    };
    let onMouseUp = (e)=>{
        const target = e.target;
        dragging.current = false;
        let nextOffset = getNextOffset(e);
        if (handlers.current.onDrag) handlers.current.onDrag(false);
        if (handlers.current.onPositionChange) handlers.current.onPositionChange(nextOffset);
        $9cc09df9fd7676be$var$draggingElements.splice($9cc09df9fd7676be$var$draggingElements.indexOf(target), 1);
        window.removeEventListener('mouseup', onMouseUp, false);
        window.removeEventListener('mousemove', onMouseDragged, false);
    };
    let onMouseDown = (e)=>{
        const target = e.currentTarget;
        // If we're already handling dragging on a descendant with useDrag1D, then
        // we don't want to handle the drag motion on this target as well.
        if ($9cc09df9fd7676be$var$draggingElements.some((elt)=>target.contains(elt))) return;
        $9cc09df9fd7676be$var$draggingElements.push(target);
        window.addEventListener('mousemove', onMouseDragged, false);
        window.addEventListener('mouseup', onMouseUp, false);
    };
    let onMouseEnter = ()=>{
        if (onHover) onHover(true);
    };
    let onMouseOut = ()=>{
        if (onHover) onHover(false);
    };
    let onKeyDown = (e)=>{
        switch(e.key){
            case 'Left':
            case 'ArrowLeft':
                if (orientation === 'horizontal') {
                    e.preventDefault();
                    if (onDecrement && !reverse) onDecrement();
                    else if (onIncrement && reverse) onIncrement();
                }
                break;
            case 'Up':
            case 'ArrowUp':
                if (orientation === 'vertical') {
                    e.preventDefault();
                    if (onDecrement && !reverse) onDecrement();
                    else if (onIncrement && reverse) onIncrement();
                }
                break;
            case 'Right':
            case 'ArrowRight':
                if (orientation === 'horizontal') {
                    e.preventDefault();
                    if (onIncrement && !reverse) onIncrement();
                    else if (onDecrement && reverse) onDecrement();
                }
                break;
            case 'Down':
            case 'ArrowDown':
                if (orientation === 'vertical') {
                    e.preventDefault();
                    if (onIncrement && !reverse) onIncrement();
                    else if (onDecrement && reverse) onDecrement();
                }
                break;
            case 'Home':
                e.preventDefault();
                if (onDecrementToMin) onDecrementToMin();
                break;
            case 'End':
                e.preventDefault();
                if (onIncrementToMax) onIncrementToMax();
                break;
            case 'Enter':
                e.preventDefault();
                if (onCollapseToggle) onCollapseToggle();
                break;
        }
    };
    return {
        onMouseDown: onMouseDown,
        onMouseEnter: onMouseEnter,
        onMouseOut: onMouseOut,
        onKeyDown: onKeyDown
    };
}



//# sourceMappingURL=useDrag1D.module.js.map

;// ./node_modules/@react-aria/utils/dist/useGlobalListeners.mjs


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
function $03deb23ff14920c4$export$4eaf04e54aa8eed6() {
    let globalListeners = (0, react.useRef)(new Map());
    let addGlobalListener = (0, react.useCallback)((eventTarget, type, listener, options)=>{
        // Make sure we remove the listener after it is called with the `once` option.
        let fn = (options === null || options === void 0 ? void 0 : options.once) ? (...args)=>{
            globalListeners.current.delete(listener);
            listener(...args);
        } : listener;
        globalListeners.current.set(listener, {
            type: type,
            eventTarget: eventTarget,
            fn: fn,
            options: options
        });
        eventTarget.addEventListener(type, fn, options);
    }, []);
    let removeGlobalListener = (0, react.useCallback)((eventTarget, type, listener, options)=>{
        var _globalListeners_current_get;
        let fn = ((_globalListeners_current_get = globalListeners.current.get(listener)) === null || _globalListeners_current_get === void 0 ? void 0 : _globalListeners_current_get.fn) || listener;
        eventTarget.removeEventListener(type, fn, options);
        globalListeners.current.delete(listener);
    }, []);
    let removeAllGlobalListeners = (0, react.useCallback)(()=>{
        globalListeners.current.forEach((value, key)=>{
            removeGlobalListener(value.eventTarget, value.type, key, value.options);
        });
    }, [
        removeGlobalListener
    ]);
    (0, react.useEffect)(()=>{
        return removeAllGlobalListeners;
    }, [
        removeAllGlobalListeners
    ]);
    return {
        addGlobalListener: addGlobalListener,
        removeGlobalListener: removeGlobalListener,
        removeAllGlobalListeners: removeAllGlobalListeners
    };
}



//# sourceMappingURL=useGlobalListeners.module.js.map

;// ./node_modules/@react-aria/utils/dist/useLabels.mjs


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
function $313b98861ee5dd6c$export$d6875122194c7b44(props, defaultLabel) {
    let { id: id, 'aria-label': label, 'aria-labelledby': labelledBy } = props;
    // If there is both an aria-label and aria-labelledby,
    // combine them by pointing to the element itself.
    id = (0, $bdb11010cef70236$export$f680877a34711e37)(id);
    if (labelledBy && label) {
        let ids = new Set([
            id,
            ...labelledBy.trim().split(/\s+/)
        ]);
        labelledBy = [
            ...ids
        ].join(' ');
    } else if (labelledBy) labelledBy = labelledBy.trim().split(/\s+/).join(' ');
    // If no labels are provided, use the default
    if (!label && !labelledBy && defaultLabel) label = defaultLabel;
    return {
        id: id,
        'aria-label': label,
        'aria-labelledby': labelledBy
    };
}



//# sourceMappingURL=useLabels.module.js.map

;// ./node_modules/@react-aria/utils/dist/useObjectRef.mjs


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
function $df56164dff5785e2$export$4338b53315abf666(ref) {
    const objRef = (0, $gbmns$useRef)(null);
    const cleanupRef = (0, $gbmns$useRef)(undefined);
    const refEffect = (0, $gbmns$useCallback)((instance)=>{
        if (typeof ref === 'function') {
            const refCallback = ref;
            const refCleanup = refCallback(instance);
            return ()=>{
                if (typeof refCleanup === 'function') refCleanup();
                else refCallback(null);
            };
        } else if (ref) {
            ref.current = instance;
            return ()=>{
                ref.current = null;
            };
        }
    }, [
        ref
    ]);
    return (0, $gbmns$useMemo)(()=>({
            get current () {
                return objRef.current;
            },
            set current (value){
                objRef.current = value;
                if (cleanupRef.current) {
                    cleanupRef.current();
                    cleanupRef.current = undefined;
                }
                if (value != null) cleanupRef.current = refEffect(value);
            }
        }), [
        refEffect
    ]);
}



//# sourceMappingURL=useObjectRef.module.js.map

;// ./node_modules/@react-aria/utils/dist/useUpdateEffect.mjs


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
function $4f58c5f72bcf79f7$export$496315a1608d9602(effect, dependencies) {
    const isInitialMount = (0, $9vW05$useRef)(true);
    const lastDeps = (0, $9vW05$useRef)(null);
    (0, $9vW05$useEffect)(()=>{
        isInitialMount.current = true;
        return ()=>{
            isInitialMount.current = false;
        };
    }, []);
    (0, $9vW05$useEffect)(()=>{
        let prevDeps = lastDeps.current;
        if (isInitialMount.current) isInitialMount.current = false;
        else if (!prevDeps || dependencies.some((dep, i)=>!Object.is(dep, prevDeps[i]))) effect();
        lastDeps.current = dependencies;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
}



//# sourceMappingURL=useUpdateEffect.module.js.map

;// ./node_modules/@react-aria/utils/dist/useUpdateLayoutEffect.mjs



/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 

function $ca9b37712f007381$export$72ef708ab07251f1(effect, dependencies) {
    const isInitialMount = (0, $azsE2$useRef)(true);
    const lastDeps = (0, $azsE2$useRef)(null);
    (0, $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c)(()=>{
        isInitialMount.current = true;
        return ()=>{
            isInitialMount.current = false;
        };
    }, []);
    (0, $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c)(()=>{
        if (isInitialMount.current) isInitialMount.current = false;
        else if (!lastDeps.current || dependencies.some((dep, i)=>!Object.is(dep, lastDeps[i]))) effect();
        lastDeps.current = dependencies;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
}



//# sourceMappingURL=useUpdateLayoutEffect.module.js.map

;// ./node_modules/@react-aria/utils/dist/useResizeObserver.mjs



function $9daab02d461809db$var$hasResizeObserver() {
    return typeof window.ResizeObserver !== 'undefined';
}
function $9daab02d461809db$export$683480f191c0e3ea(options) {
    const { ref: ref, box: box, onResize: onResize } = options;
    (0, $Vsl8o$useEffect)(()=>{
        let element = ref === null || ref === void 0 ? void 0 : ref.current;
        if (!element) return;
        if (!$9daab02d461809db$var$hasResizeObserver()) {
            window.addEventListener('resize', onResize, false);
            return ()=>{
                window.removeEventListener('resize', onResize, false);
            };
        } else {
            const resizeObserverInstance = new window.ResizeObserver((entries)=>{
                if (!entries.length) return;
                onResize();
            });
            resizeObserverInstance.observe(element, {
                box: box
            });
            return ()=>{
                if (element) resizeObserverInstance.unobserve(element);
            };
        }
    }, [
        onResize,
        ref,
        box
    ]);
}



//# sourceMappingURL=useResizeObserver.module.js.map

;// ./node_modules/@react-aria/utils/dist/useSyncRef.mjs


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
function $e7801be82b4b2a53$export$4debdb1a3f0fa79e(context, ref) {
    (0, $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c)(()=>{
        if (context && context.ref && ref) {
            context.ref.current = ref.current;
            return ()=>{
                if (context.ref) context.ref.current = null;
            };
        }
    });
}



//# sourceMappingURL=useSyncRef.module.js.map

;// ./node_modules/@react-aria/utils/dist/isScrollable.mjs
/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ function isScrollable_$cc38e7bd3fc7b213$export$2bb74740c4e19def(node, checkForOverflow) {
    if (!node) return false;
    let style = window.getComputedStyle(node);
    let isScrollable = /(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY);
    if (isScrollable && checkForOverflow) isScrollable = node.scrollHeight !== node.clientHeight || node.scrollWidth !== node.clientWidth;
    return isScrollable;
}



//# sourceMappingURL=isScrollable.module.js.map

;// ./node_modules/@react-aria/utils/dist/getScrollParent.mjs


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
function getScrollParent_$62d8ded9296f3872$export$cfa2225e87938781(node, checkForOverflow) {
    let scrollableNode = node;
    if ((0, $cc38e7bd3fc7b213$export$2bb74740c4e19def)(scrollableNode, checkForOverflow)) scrollableNode = scrollableNode.parentElement;
    while(scrollableNode && !(0, $cc38e7bd3fc7b213$export$2bb74740c4e19def)(scrollableNode, checkForOverflow))scrollableNode = scrollableNode.parentElement;
    return scrollableNode || document.scrollingElement || document.documentElement;
}



//# sourceMappingURL=getScrollParent.module.js.map

;// ./node_modules/@react-aria/utils/dist/getScrollParents.mjs


/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 
function getScrollParents_$a40c673dc9f6d9c7$export$94ed1c92c7beeb22(node, checkForOverflow) {
    const scrollParents = [];
    while(node && node !== document.documentElement){
        if ((0, $cc38e7bd3fc7b213$export$2bb74740c4e19def)(node, checkForOverflow)) scrollParents.push(node);
        node = node.parentElement;
    }
    return scrollParents;
}



//# sourceMappingURL=getScrollParents.module.js.map

;// ./node_modules/@react-aria/utils/dist/keyboard.mjs


/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 
function $21f1aa98acb08317$export$16792effe837dba3(e) {
    if ((0, $c87311424ea30a05$export$9ac100e40613ea10)()) return e.metaKey;
    return e.ctrlKey;
}
// HTML input types that do not cause the software keyboard to appear.
const $21f1aa98acb08317$var$nonTextInputTypes = new Set([
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
function keyboard_$21f1aa98acb08317$export$c57958e35f31ed73(target) {
    return target instanceof HTMLInputElement && !$21f1aa98acb08317$var$nonTextInputTypes.has(target.type) || target instanceof HTMLTextAreaElement || target instanceof HTMLElement && target.isContentEditable;
}



//# sourceMappingURL=keyboard.module.js.map

;// ./node_modules/@react-aria/utils/dist/useViewportSize.mjs




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


let $5df64b3807dc15ee$var$visualViewport = typeof document !== 'undefined' && window.visualViewport;
function $5df64b3807dc15ee$export$d699905dd57c73ca() {
    let isSSR = (0, $fuDHA$useIsSSR)();
    let [size, setSize] = (0, $fuDHA$useState)(()=>isSSR ? {
            width: 0,
            height: 0
        } : $5df64b3807dc15ee$var$getViewportSize());
    (0, $fuDHA$useEffect)(()=>{
        // Use visualViewport api to track available height even on iOS virtual keyboard opening
        let onResize = ()=>{
            // Ignore updates when zoomed.
            if ($5df64b3807dc15ee$var$visualViewport && $5df64b3807dc15ee$var$visualViewport.scale > 1) return;
            setSize((size)=>{
                let newSize = $5df64b3807dc15ee$var$getViewportSize();
                if (newSize.width === size.width && newSize.height === size.height) return size;
                return newSize;
            });
        };
        // When closing the keyboard, iOS does not fire the visual viewport resize event until the animation is complete.
        // We can anticipate this and resize early by handling the blur event and using the layout size.
        let frame;
        let onBlur = (e)=>{
            if ($5df64b3807dc15ee$var$visualViewport && $5df64b3807dc15ee$var$visualViewport.scale > 1) return;
            if ((0, $21f1aa98acb08317$export$c57958e35f31ed73)(e.target)) // Wait one frame to see if a new element gets focused.
            frame = requestAnimationFrame(()=>{
                if (!document.activeElement || !(0, $21f1aa98acb08317$export$c57958e35f31ed73)(document.activeElement)) setSize((size)=>{
                    let newSize = {
                        width: window.innerWidth,
                        height: window.innerHeight
                    };
                    if (newSize.width === size.width && newSize.height === size.height) return size;
                    return newSize;
                });
            });
        };
        window.addEventListener('blur', onBlur, true);
        if (!$5df64b3807dc15ee$var$visualViewport) window.addEventListener('resize', onResize);
        else $5df64b3807dc15ee$var$visualViewport.addEventListener('resize', onResize);
        return ()=>{
            cancelAnimationFrame(frame);
            window.removeEventListener('blur', onBlur, true);
            if (!$5df64b3807dc15ee$var$visualViewport) window.removeEventListener('resize', onResize);
            else $5df64b3807dc15ee$var$visualViewport.removeEventListener('resize', onResize);
        };
    }, []);
    return size;
}
function $5df64b3807dc15ee$var$getViewportSize() {
    return {
        // Multiply by the visualViewport scale to get the "natural" size, unaffected by pinch zooming.
        width: $5df64b3807dc15ee$var$visualViewport ? $5df64b3807dc15ee$var$visualViewport.width * $5df64b3807dc15ee$var$visualViewport.scale : window.innerWidth,
        height: $5df64b3807dc15ee$var$visualViewport ? $5df64b3807dc15ee$var$visualViewport.height * $5df64b3807dc15ee$var$visualViewport.scale : window.innerHeight
    };
}



//# sourceMappingURL=useViewportSize.module.js.map

;// ./node_modules/@react-aria/utils/dist/useDescription.mjs



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

let $ef06256079686ba0$var$descriptionId = 0;
const $ef06256079686ba0$var$descriptionNodes = new Map();
function $ef06256079686ba0$export$f8aeda7b10753fa1(description) {
    let [id, setId] = (0, $hQ5Hp$useState)();
    (0, $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c)(()=>{
        if (!description) return;
        let desc = $ef06256079686ba0$var$descriptionNodes.get(description);
        if (!desc) {
            let id = `react-aria-description-${$ef06256079686ba0$var$descriptionId++}`;
            setId(id);
            let node = document.createElement('div');
            node.id = id;
            node.style.display = 'none';
            node.textContent = description;
            document.body.appendChild(node);
            desc = {
                refCount: 0,
                element: node
            };
            $ef06256079686ba0$var$descriptionNodes.set(description, desc);
        } else setId(desc.element.id);
        desc.refCount++;
        return ()=>{
            if (desc && --desc.refCount === 0) {
                desc.element.remove();
                $ef06256079686ba0$var$descriptionNodes.delete(description);
            }
        };
    }, [
        description
    ]);
    return {
        'aria-describedby': description ? id : undefined
    };
}



//# sourceMappingURL=useDescription.module.js.map

;// ./node_modules/@react-aria/utils/dist/useEvent.mjs



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

function useEvent_$e9faafb641e167db$export$90fc3a17d93f704c(ref, event, handler, options) {
    let handleEvent = (0, $8ae05eaa5c114e9c$export$7f54fc3180508a52)(handler);
    let isDisabled = handler == null;
    (0, $ceQd6$useEffect)(()=>{
        if (isDisabled || !ref.current) return;
        let element = ref.current;
        element.addEventListener(event, handleEvent, options);
        return ()=>{
            element.removeEventListener(event, handleEvent, options);
        };
    }, [
        ref,
        event,
        options,
        isDisabled,
        handleEvent
    ]);
}



//# sourceMappingURL=useEvent.module.js.map

;// ./node_modules/@react-aria/utils/dist/scrollIntoView.mjs



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

function $2f04cbc44ee30ce0$export$53a0910f038337bd(scrollView, element) {
    let offsetX = $2f04cbc44ee30ce0$var$relativeOffset(scrollView, element, 'left');
    let offsetY = $2f04cbc44ee30ce0$var$relativeOffset(scrollView, element, 'top');
    let width = element.offsetWidth;
    let height = element.offsetHeight;
    let x = scrollView.scrollLeft;
    let y = scrollView.scrollTop;
    // Account for top/left border offsetting the scroll top/Left + scroll padding
    let { borderTopWidth: borderTopWidth, borderLeftWidth: borderLeftWidth, scrollPaddingTop: scrollPaddingTop, scrollPaddingRight: scrollPaddingRight, scrollPaddingBottom: scrollPaddingBottom, scrollPaddingLeft: scrollPaddingLeft } = getComputedStyle(scrollView);
    // Account for scroll margin of the element
    let { scrollMarginTop: scrollMarginTop, scrollMarginRight: scrollMarginRight, scrollMarginBottom: scrollMarginBottom, scrollMarginLeft: scrollMarginLeft } = getComputedStyle(element);
    let borderAdjustedX = x + parseInt(borderLeftWidth, 10);
    let borderAdjustedY = y + parseInt(borderTopWidth, 10);
    // Ignore end/bottom border via clientHeight/Width instead of offsetHeight/Width
    let maxX = borderAdjustedX + scrollView.clientWidth;
    let maxY = borderAdjustedY + scrollView.clientHeight;
    // Get scroll padding / margin values as pixels - defaults to 0 if no scroll padding / margin
    // is used.
    let scrollPaddingTopNumber = parseInt(scrollPaddingTop, 10) || 0;
    let scrollPaddingBottomNumber = parseInt(scrollPaddingBottom, 10) || 0;
    let scrollPaddingRightNumber = parseInt(scrollPaddingRight, 10) || 0;
    let scrollPaddingLeftNumber = parseInt(scrollPaddingLeft, 10) || 0;
    let scrollMarginTopNumber = parseInt(scrollMarginTop, 10) || 0;
    let scrollMarginBottomNumber = parseInt(scrollMarginBottom, 10) || 0;
    let scrollMarginRightNumber = parseInt(scrollMarginRight, 10) || 0;
    let scrollMarginLeftNumber = parseInt(scrollMarginLeft, 10) || 0;
    let targetLeft = offsetX - scrollMarginLeftNumber;
    let targetRight = offsetX + width + scrollMarginRightNumber;
    let targetTop = offsetY - scrollMarginTopNumber;
    let targetBottom = offsetY + height + scrollMarginBottomNumber;
    let scrollPortLeft = x + parseInt(borderLeftWidth, 10) + scrollPaddingLeftNumber;
    let scrollPortRight = maxX - scrollPaddingRightNumber;
    let scrollPortTop = y + parseInt(borderTopWidth, 10) + scrollPaddingTopNumber;
    let scrollPortBottom = maxY - scrollPaddingBottomNumber;
    if (targetLeft > scrollPortLeft || targetRight < scrollPortRight) {
        if (targetLeft <= x + scrollPaddingLeftNumber) x = targetLeft - parseInt(borderLeftWidth, 10) - scrollPaddingLeftNumber;
        else if (targetRight > maxX - scrollPaddingRightNumber) x += targetRight - maxX + scrollPaddingRightNumber;
    }
    if (targetTop > scrollPortTop || targetBottom < scrollPortBottom) {
        if (targetTop <= borderAdjustedY + scrollPaddingTopNumber) y = targetTop - parseInt(borderTopWidth, 10) - scrollPaddingTopNumber;
        else if (targetBottom > maxY - scrollPaddingBottomNumber) y += targetBottom - maxY + scrollPaddingBottomNumber;
    }
    if (false) // removed by dead control flow
{}
    scrollView.scrollTo({
        left: x,
        top: y
    });
}
/**
 * Computes the offset left or top from child to ancestor by accumulating
 * offsetLeft or offsetTop through intervening offsetParents.
 */ function $2f04cbc44ee30ce0$var$relativeOffset(ancestor, child, axis) {
    const prop = axis === 'left' ? 'offsetLeft' : 'offsetTop';
    let sum = 0;
    while(child.offsetParent){
        sum += child[prop];
        if (child.offsetParent === ancestor) break;
        else if (child.offsetParent.contains(ancestor)) {
            // If the ancestor is not `position:relative`, then we stop at
            // _its_ offset parent, and we subtract off _its_ offset, so that
            // we end up with the proper offset from child to ancestor.
            sum -= ancestor[prop];
            break;
        }
        child = child.offsetParent;
    }
    return sum;
}
function $2f04cbc44ee30ce0$export$c826860796309d1b(targetElement, opts) {
    if (targetElement && document.contains(targetElement)) {
        let root = document.scrollingElement || document.documentElement;
        let isScrollPrevented = window.getComputedStyle(root).overflow === 'hidden';
        // If scrolling is not currently prevented then we aren't in a overlay nor is a overlay open, just use element.scrollIntoView to bring the element into view
        // Also ignore in chrome because of this bug: https://issues.chromium.org/issues/40074749
        if (!isScrollPrevented && !(0, $c87311424ea30a05$export$6446a186d09e379e)()) {
            var // use scrollIntoView({block: 'nearest'}) instead of .focus to check if the element is fully in view or not since .focus()
            // won't cause a scroll if the element is already focused and doesn't behave consistently when an element is partially out of view horizontally vs vertically
            _targetElement_scrollIntoView;
            let { left: originalLeft, top: originalTop } = targetElement.getBoundingClientRect();
            targetElement === null || targetElement === void 0 ? void 0 : (_targetElement_scrollIntoView = targetElement.scrollIntoView) === null || _targetElement_scrollIntoView === void 0 ? void 0 : _targetElement_scrollIntoView.call(targetElement, {
                block: 'nearest'
            });
            let { left: newLeft, top: newTop } = targetElement.getBoundingClientRect();
            // Account for sub pixel differences from rounding
            if (Math.abs(originalLeft - newLeft) > 1 || Math.abs(originalTop - newTop) > 1) {
                var _opts_containingElement_scrollIntoView, _opts_containingElement, _targetElement_scrollIntoView1;
                opts === null || opts === void 0 ? void 0 : (_opts_containingElement = opts.containingElement) === null || _opts_containingElement === void 0 ? void 0 : (_opts_containingElement_scrollIntoView = _opts_containingElement.scrollIntoView) === null || _opts_containingElement_scrollIntoView === void 0 ? void 0 : _opts_containingElement_scrollIntoView.call(_opts_containingElement, {
                    block: 'center',
                    inline: 'center'
                });
                (_targetElement_scrollIntoView1 = targetElement.scrollIntoView) === null || _targetElement_scrollIntoView1 === void 0 ? void 0 : _targetElement_scrollIntoView1.call(targetElement, {
                    block: 'nearest'
                });
            }
        } else {
            let scrollParents = (0, $a40c673dc9f6d9c7$export$94ed1c92c7beeb22)(targetElement);
            // If scrolling is prevented, we don't want to scroll the body since it might move the overlay partially offscreen and the user can't scroll it back into view.
            for (let scrollParent of scrollParents)$2f04cbc44ee30ce0$export$53a0910f038337bd(scrollParent, targetElement);
        }
    }
}



//# sourceMappingURL=scrollIntoView.module.js.map

;// ./node_modules/@react-aria/utils/dist/isVirtualEvent.mjs


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
function $6a7db85432448f7f$export$60278871457622de(event) {
    // JAWS/NVDA with Firefox.
    if (event.pointerType === '' && event.isTrusted) return true;
    // Android TalkBack's detail value varies depending on the event listener providing the event so we have specific logic here instead
    // If pointerType is defined, event is from a click listener. For events from mousedown listener, detail === 0 is a sufficient check
    // to detect TalkBack virtual clicks.
    if ((0, platform_$c87311424ea30a05$export$a11b0059900ceec8)() && event.pointerType) return event.type === 'click' && event.buttons === 1;
    return event.detail === 0 && !event.pointerType;
}
function $6a7db85432448f7f$export$29bf1b5f2c56cf63(event) {
    // If the pointer size is zero, then we assume it's from a screen reader.
    // Android TalkBack double tap will sometimes return a event with width and height of 1
    // and pointerType === 'mouse' so we need to check for a specific combination of event attributes.
    // Cannot use "event.pressure === 0" as the sole check due to Safari pointer events always returning pressure === 0
    // instead of .5, see https://bugs.webkit.org/show_bug.cgi?id=206216. event.pointerType === 'mouse' is to distingush
    // Talkback double tap from Windows Firefox touch screen press
    return !(0, $c87311424ea30a05$export$a11b0059900ceec8)() && event.width === 0 && event.height === 0 || event.width === 1 && event.height === 1 && event.pressure === 0 && event.detail === 0 && event.pointerType === 'mouse';
}



//# sourceMappingURL=isVirtualEvent.module.js.map

;// ./node_modules/@react-aria/utils/dist/useDeepMemo.mjs


/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ /* eslint-disable rulesdir/pure-render */ 
function $5a387cc49350e6db$export$722debc0e56fea39(value, isEqual) {
    // Using a ref during render is ok here because it's only an optimization – both values are equivalent.
    // If a render is thrown away, it'll still work the same no matter if the next render is the same or not.
    let lastValue = (0, $jtQ6z$useRef)(null);
    if (value && lastValue.current && isEqual(value, lastValue.current)) value = lastValue.current;
    lastValue.current = value;
    return value;
}



//# sourceMappingURL=useDeepMemo.module.js.map

;// ./node_modules/@react-aria/utils/dist/useFormReset.mjs



/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 

function $99facab73266f662$export$5add1d006293d136(ref, initialValue, onReset) {
    let handleReset = (0, $8ae05eaa5c114e9c$export$7f54fc3180508a52)(()=>{
        if (onReset) onReset(initialValue);
    });
    (0, $8rM3G$useEffect)(()=>{
        var _ref_current;
        let form = ref === null || ref === void 0 ? void 0 : (_ref_current = ref.current) === null || _ref_current === void 0 ? void 0 : _ref_current.form;
        form === null || form === void 0 ? void 0 : form.addEventListener('reset', handleReset);
        return ()=>{
            form === null || form === void 0 ? void 0 : form.removeEventListener('reset', handleReset);
        };
    }, [
        ref,
        handleReset
    ]);
}



//# sourceMappingURL=useFormReset.module.js.map

;// ./node_modules/@react-aria/utils/dist/useLoadMore.mjs




/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 


function $26f7f3da73fcd9d6$export$7717c92ee915373e(props, ref) {
    let { isLoading: isLoading, onLoadMore: onLoadMore, scrollOffset: scrollOffset = 1, items: items } = props;
    // Handle scrolling, and call onLoadMore when nearing the bottom.
    let isLoadingRef = (0, $hDRkU$useRef)(isLoading);
    let prevProps = (0, $hDRkU$useRef)(props);
    let onScroll = (0, $hDRkU$useCallback)(()=>{
        if (ref.current && !isLoadingRef.current && onLoadMore) {
            let shouldLoadMore = ref.current.scrollHeight - ref.current.scrollTop - ref.current.clientHeight < ref.current.clientHeight * scrollOffset;
            if (shouldLoadMore) {
                isLoadingRef.current = true;
                onLoadMore();
            }
        }
    }, [
        onLoadMore,
        ref,
        scrollOffset
    ]);
    let lastItems = (0, $hDRkU$useRef)(items);
    (0, $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c)(()=>{
        // Only update isLoadingRef if props object actually changed,
        // not if a local state change occurred.
        if (props !== prevProps.current) {
            isLoadingRef.current = isLoading;
            prevProps.current = props;
        }
        // TODO: Eventually this hook will move back into RAC during which we will accept the collection as a option to this hook.
        // We will only load more if the collection has changed after the last load to prevent multiple onLoadMore from being called
        // while the data from the last onLoadMore is being processed by RAC collection.
        let shouldLoadMore = (ref === null || ref === void 0 ? void 0 : ref.current) && !isLoadingRef.current && onLoadMore && (!items || items !== lastItems.current) && ref.current.clientHeight === ref.current.scrollHeight;
        if (shouldLoadMore) {
            isLoadingRef.current = true;
            onLoadMore === null || onLoadMore === void 0 ? void 0 : onLoadMore();
        }
        lastItems.current = items;
    }, [
        isLoading,
        onLoadMore,
        props,
        ref,
        items
    ]);
    // TODO: maybe this should still just return scroll props?
    // Test against case where the ref isn't defined when this is called
    // Think this was a problem when trying to attach to the scrollable body of the table in OnLoadMoreTableBodyScroll
    (0, $e9faafb641e167db$export$90fc3a17d93f704c)(ref, 'scroll', onScroll);
}



//# sourceMappingURL=useLoadMore.module.js.map

;// ./node_modules/@react-aria/utils/dist/useLoadMoreSentinel.mjs





/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 



function $a5fa973c1850dd36$export$ccaea96c28e8b9e7(props, ref) {
    let { collection: collection, onLoadMore: onLoadMore, scrollOffset: scrollOffset = 1 } = props;
    let sentinelObserver = (0, $7FoZl$useRef)(null);
    let triggerLoadMore = (0, $8ae05eaa5c114e9c$export$7f54fc3180508a52)((entries)=>{
        // Use "isIntersecting" over an equality check of 0 since it seems like there is cases where
        // a intersection ratio of 0 can be reported when isIntersecting is actually true
        for (let entry of entries)// Note that this will be called if the collection changes, even if onLoadMore was already called and is being processed.
        // Up to user discretion as to how to handle these multiple onLoadMore calls
        if (entry.isIntersecting && onLoadMore) onLoadMore();
    });
    (0, $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c)(()=>{
        if (ref.current) {
            // Tear down and set up a new IntersectionObserver when the collection changes so that we can properly trigger additional loadMores if there is room for more items
            // Need to do this tear down and set up since using a large rootMargin will mean the observer's callback isn't called even when scrolling the item into view beause its visibility hasn't actually changed
            // https://codesandbox.io/p/sandbox/magical-swanson-dhgp89?file=%2Fsrc%2FApp.js%3A21%2C21
            sentinelObserver.current = new IntersectionObserver(triggerLoadMore, {
                root: (0, $62d8ded9296f3872$export$cfa2225e87938781)(ref === null || ref === void 0 ? void 0 : ref.current),
                rootMargin: `0px ${100 * scrollOffset}% ${100 * scrollOffset}% ${100 * scrollOffset}%`
            });
            sentinelObserver.current.observe(ref.current);
        }
        return ()=>{
            if (sentinelObserver.current) sentinelObserver.current.disconnect();
        };
    }, [
        collection,
        triggerLoadMore,
        ref,
        scrollOffset
    ]);
}



//# sourceMappingURL=useLoadMoreSentinel.module.js.map

;// ./node_modules/@react-aria/utils/dist/inertValue.mjs



function $cdc5a6778b766db2$export$a9d04c5684123369(value) {
    const pieces = (0, $iulvE$version).split('.');
    const major = parseInt(pieces[0], 10);
    if (major >= 19) return value;
    // compatibility with React < 19
    return value ? 'true' : undefined;
}



//# sourceMappingURL=inertValue.module.js.map

;// ./node_modules/@react-aria/utils/dist/constants.mjs
/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ // Custom event names for updating the autocomplete's aria-activedecendant.
const $5671b20cf9b562b2$export$447a38995de2c711 = 'react-aria-clear-focus';
const $5671b20cf9b562b2$export$831c820ad60f9d12 = 'react-aria-focus';



//# sourceMappingURL=constants.module.js.map

// EXTERNAL MODULE: ./node_modules/react-dom/index.js
var react_dom = __webpack_require__(40961);
;// ./node_modules/@react-aria/utils/dist/animation.mjs




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


function $d3f049242431219c$export$6d3443f2c48bfc20(ref, isReady = true) {
    let [isEntering, setEntering] = (0, $jJMAe$useState)(true);
    let isAnimationReady = isEntering && isReady;
    // There are two cases for entry animations:
    // 1. CSS @keyframes. The `animation` property is set during the isEntering state, and it is removed after the animation finishes.
    // 2. CSS transitions. The initial styles are applied during the isEntering state, and removed immediately, causing the transition to occur.
    //
    // In the second case, cancel any transitions that were triggered prior to the isEntering = false state (when the transition is supposed to start).
    // This can happen when isReady starts as false (e.g. popovers prior to placement calculation).
    (0, $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c)(()=>{
        if (isAnimationReady && ref.current && 'getAnimations' in ref.current) {
            for (let animation of ref.current.getAnimations())if (animation instanceof CSSTransition) animation.cancel();
        }
    }, [
        ref,
        isAnimationReady
    ]);
    $d3f049242431219c$var$useAnimation(ref, isAnimationReady, (0, $jJMAe$useCallback)(()=>setEntering(false), []));
    return isAnimationReady;
}
function $d3f049242431219c$export$45fda7c47f93fd48(ref, isOpen) {
    let [exitState, setExitState] = (0, $jJMAe$useState)(isOpen ? 'open' : 'closed');
    switch(exitState){
        case 'open':
            // If isOpen becomes false, set the state to exiting.
            if (!isOpen) setExitState('exiting');
            break;
        case 'closed':
        case 'exiting':
            // If we are exiting and isOpen becomes true, the animation was interrupted.
            // Reset the state to open.
            if (isOpen) setExitState('open');
            break;
    }
    let isExiting = exitState === 'exiting';
    $d3f049242431219c$var$useAnimation(ref, isExiting, (0, $jJMAe$useCallback)(()=>{
        // Set the state to closed, which will cause the element to be unmounted.
        setExitState((state)=>state === 'exiting' ? 'closed' : state);
    }, []));
    return isExiting;
}
function $d3f049242431219c$var$useAnimation(ref, isActive, onEnd) {
    (0, $f0a04ccd8dbdd83b$export$e5c5a5f917a5871c)(()=>{
        if (isActive && ref.current) {
            if (!('getAnimations' in ref.current)) {
                // JSDOM
                onEnd();
                return;
            }
            let animations = ref.current.getAnimations();
            if (animations.length === 0) {
                onEnd();
                return;
            }
            let canceled = false;
            Promise.all(animations.map((a)=>a.finished)).then(()=>{
                if (!canceled) (0, $jJMAe$flushSync)(()=>{
                    onEnd();
                });
            }).catch(()=>{});
            return ()=>{
                canceled = true;
            };
        }
    }, [
        ref,
        isActive,
        onEnd
    ]);
}



//# sourceMappingURL=animation.module.js.map

;// ./node_modules/@react-aria/utils/dist/isElementVisible.mjs


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
const $7d2416ea0959daaa$var$supportsCheckVisibility = typeof Element !== 'undefined' && 'checkVisibility' in Element.prototype;
function $7d2416ea0959daaa$var$isStyleVisible(element) {
    const windowObject = (0, $431fbd86ca7dc216$export$f21a1ffae260145a)(element);
    if (!(element instanceof windowObject.HTMLElement) && !(element instanceof windowObject.SVGElement)) return false;
    let { display: display, visibility: visibility } = element.style;
    let isVisible = display !== 'none' && visibility !== 'hidden' && visibility !== 'collapse';
    if (isVisible) {
        const { getComputedStyle: getComputedStyle } = element.ownerDocument.defaultView;
        let { display: computedDisplay, visibility: computedVisibility } = getComputedStyle(element);
        isVisible = computedDisplay !== 'none' && computedVisibility !== 'hidden' && computedVisibility !== 'collapse';
    }
    return isVisible;
}
function $7d2416ea0959daaa$var$isAttributeVisible(element, childElement) {
    return !element.hasAttribute('hidden') && // Ignore HiddenSelect when tree walking.
    !element.hasAttribute('data-react-aria-prevent-focus') && (element.nodeName === 'DETAILS' && childElement && childElement.nodeName !== 'SUMMARY' ? element.hasAttribute('open') : true);
}
function isElementVisible_$7d2416ea0959daaa$export$e989c0fffaa6b27a(element, childElement) {
    if ($7d2416ea0959daaa$var$supportsCheckVisibility) return element.checkVisibility({
        visibilityProperty: true
    }) && !element.closest('[data-react-aria-prevent-focus]');
    return element.nodeName !== '#comment' && $7d2416ea0959daaa$var$isStyleVisible(element) && $7d2416ea0959daaa$var$isAttributeVisible(element, childElement) && (!element.parentElement || isElementVisible_$7d2416ea0959daaa$export$e989c0fffaa6b27a(element.parentElement, element));
}



//# sourceMappingURL=isElementVisible.module.js.map

;// ./node_modules/@react-aria/utils/dist/isFocusable.mjs


/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 
const $b4b717babfbb907b$var$focusableElements = [
    'input:not([disabled]):not([type=hidden])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'a[href]',
    'area[href]',
    'summary',
    'iframe',
    'object',
    'embed',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable^="false"])',
    'permission'
];
const $b4b717babfbb907b$var$FOCUSABLE_ELEMENT_SELECTOR = $b4b717babfbb907b$var$focusableElements.join(':not([hidden]),') + ',[tabindex]:not([disabled]):not([hidden])';
$b4b717babfbb907b$var$focusableElements.push('[tabindex]:not([tabindex="-1"]):not([disabled])');
const $b4b717babfbb907b$var$TABBABLE_ELEMENT_SELECTOR = $b4b717babfbb907b$var$focusableElements.join(':not([hidden]):not([tabindex="-1"]),');
function $b4b717babfbb907b$export$4c063cf1350e6fed(element) {
    return element.matches($b4b717babfbb907b$var$FOCUSABLE_ELEMENT_SELECTOR) && (0, $7d2416ea0959daaa$export$e989c0fffaa6b27a)(element) && !$b4b717babfbb907b$var$isInert(element);
}
function $b4b717babfbb907b$export$bebd5a1431fec25d(element) {
    return element.matches($b4b717babfbb907b$var$TABBABLE_ELEMENT_SELECTOR) && (0, $7d2416ea0959daaa$export$e989c0fffaa6b27a)(element) && !$b4b717babfbb907b$var$isInert(element);
}
function $b4b717babfbb907b$var$isInert(element) {
    let node = element;
    while(node != null){
        if (node instanceof node.ownerDocument.defaultView.HTMLElement && node.inert) return true;
        node = node.parentElement;
    }
    return false;
}



//# sourceMappingURL=isFocusable.module.js.map

// EXTERNAL MODULE: ./node_modules/@react-stately/utils/dist/import.mjs + 2 modules
var utils_dist_import = __webpack_require__(43270);
;// ./node_modules/@react-aria/utils/dist/import.mjs











































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

/***/ 80197:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(71354);
/* harmony import */ var _css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(76314);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `:root{--contexify-zIndex:666;--contexify-menu-minWidth:220px;--contexify-menu-padding:6px;--contexify-menu-radius:6px;--contexify-menu-bgColor:#fff;--contexify-menu-shadow:1px 2px 2px rgba(0,0,0,.1),2px 4px 4px rgba(0,0,0,.1),3px 6px 6px rgba(0,0,0,.1);--contexify-menu-negatePadding:var(--contexify-menu-padding);--contexify-separator-color:rgba(0,0,0,.2);--contexify-separator-margin:5px;--contexify-itemContent-padding:6px;--contexify-activeItem-radius:4px;--contexify-item-color:#333;--contexify-activeItem-color:#fff;--contexify-activeItem-bgColor:#3498db;--contexify-rightSlot-color:#6f6e77;--contexify-activeRightSlot-color:#fff;--contexify-arrow-color:#6f6e77;--contexify-activeArrow-color:#fff}@keyframes contexify_feedback{0%{opacity:.4}to{opacity:1}}.contexify{position:fixed;opacity:0;-webkit-user-select:none;-moz-user-select:none;user-select:none;background-color:var(--contexify-menu-bgColor);box-sizing:border-box;box-shadow:var(--contexify-menu-shadow);border-radius:var(--contexify-menu-radius);padding:var(--contexify-menu-padding);min-width:var(--contexify-menu-minWidth);z-index:var(--contexify-zIndex)}.contexify_submenu-isOpen,.contexify_submenu-isOpen>.contexify_itemContent{color:var(--contexify-activeItem-color);background-color:var(--contexify-activeItem-bgColor);border-radius:var(--contexify-activeItem-radius)}.contexify_submenu-isOpen>.contexify_itemContent .contexify_rightSlot{color:var(--contexify-activeArrow-color)}.contexify_submenu-isOpen>.contexify_submenu{pointer-events:auto;opacity:1}.contexify .contexify_submenu{position:absolute;pointer-events:none;transition:opacity .265s;top:calc(-1 * var(--contexify-menu-negatePadding));left:100%}.contexify .contexify_submenu-bottom{bottom:calc(-1 * var(--contexify-menu-negatePadding));top:unset}.contexify .contexify_submenu-right{right:100%;left:unset}.contexify_rightSlot{margin-left:auto;display:flex;color:var(--contexify-rightSlot-color)}.contexify_separator{height:1px;cursor:default;margin:var(--contexify-separator-margin);background-color:var(--contexify-separator-color)}.contexify_willLeave-disabled{pointer-events:none}.contexify_item{cursor:pointer;position:relative}.contexify_item:focus{outline:0}.contexify_item:focus .contexify_rightSlot,.contexify_item:not(.contexify_item-disabled):hover>.contexify_itemContent .contexify_rightSlot{color:var(--contexify-activeRightSlot-color)}.contexify_item:not(.contexify_item-disabled)[aria-haspopup]>.contexify_itemContent .contexify_rightSlot{color:var(--contexify-arrow-color)}.contexify_item:not(.contexify_item-disabled)[aria-haspopup].contexify_submenu-isOpen>.contexify_itemContent .contexify_rightSlot,.contexify_item:not(.contexify_item-disabled)[aria-haspopup]:hover>.contexify_itemContent .contexify_rightSlot,.contexify_item[aria-haspopup]:focus>.contexify_itemContent .contexify_rightSlot{color:var(--contexify-activeArrow-color)}.contexify_item:not(.contexify_item-disabled):focus>.contexify_itemContent,.contexify_item:not(.contexify_item-disabled):hover>.contexify_itemContent{color:var(--contexify-activeItem-color);background-color:var(--contexify-activeItem-bgColor);border-radius:var(--contexify-activeItem-radius)}.contexify_item:not(.contexify_item-disabled):hover>.contexify_submenu{pointer-events:auto;opacity:1}.contexify_item-disabled{cursor:default;opacity:.5}.contexify_itemContent{padding:var(--contexify-itemContent-padding);display:flex;align-items:center;white-space:nowrap;color:var(--contexify-item-color);position:relative}.contexify_item-feedback{animation:contexify_feedback .12s both}.contexify_theme-dark{--contexify-menu-bgColor:rgba(40,40,40,.98);--contexify-separator-color:#4c4c4c;--contexify-item-color:#fff}.contexify_theme-light{--contexify-separator-color:#eee;--contexify-item-color:#666;--contexify-activeItem-color:#3498db;--contexify-activeItem-bgColor:#e0eefd;--contexify-activeRightSlot-color:#3498db;--contexify-active-arrow-color:#3498db}@keyframes contexify_scaleIn{0%{opacity:0;transform:scale3d(.3,.3,.3)}to{opacity:1}}@keyframes contexify_scaleOut{0%{opacity:1}to{opacity:0;transform:scale3d(.3,.3,.3)}}.contexify_willEnter-scale{transform-origin:top left;animation:contexify_scaleIn .3s}.contexify_willLeave-scale{transform-origin:top left;animation:contexify_scaleOut .3s}@keyframes contexify_fadeIn{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes contexify_fadeOut{0%{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(10px)}}.contexify_willEnter-fade{animation:contexify_fadeIn .3s ease}.contexify_willLeave-fade{animation:contexify_fadeOut .3s ease}@keyframes contexify_flipInX{0%{transform:perspective(800px) rotateX(45deg)}to{transform:perspective(800px)}}@keyframes contexify_flipOutX{0%{transform:perspective(800px)}to{transform:perspective(800px) rotateX(45deg);opacity:0}}.contexify_willEnter-flip{animation:contexify_flipInX .3s}.contexify_willEnter-flip,.contexify_willLeave-flip{backface-visibility:visible!important;transform-origin:top center}.contexify_willLeave-flip{animation:contexify_flipOutX .3s}@keyframes contexify_slideIn{0%{opacity:0;transform:scaleY(.3)}to{opacity:1}}@keyframes contexify_slideOut{0%{opacity:1}to{opacity:0;transform:scaleY(.3)}}.contexify_willEnter-slide{transform-origin:top center;animation:contexify_slideIn .3s}.contexify_willLeave-slide{transform-origin:top center;animation:contexify_slideOut .3s}`, "",{"version":3,"sources":["webpack://./node_modules/react-contexify/dist/ReactContexify.min.css"],"names":[],"mappings":"AAAA,MAAM,sBAAsB,CAAC,+BAA+B,CAAC,4BAA4B,CAAC,2BAA2B,CAAC,6BAA6B,CAAC,wGAAwG,CAAC,4DAA4D,CAAC,0CAA0C,CAAC,gCAAgC,CAAC,mCAAmC,CAAC,iCAAiC,CAAC,2BAA2B,CAAC,iCAAiC,CAAC,sCAAsC,CAAC,mCAAmC,CAAC,sCAAsC,CAAC,+BAA+B,CAAC,kCAAkC,CAAC,8BAA8B,GAAG,UAAU,CAAC,GAAG,SAAS,CAAC,CAAC,WAAW,cAAc,CAAC,SAAS,CAAC,wBAAwB,CAAC,qBAAqB,CAAsB,gBAAgB,CAAC,8CAA8C,CAAC,qBAAqB,CAAC,uCAAuC,CAAC,0CAA0C,CAAC,qCAAqC,CAAC,wCAAwC,CAAC,+BAA+B,CAAC,2EAA2E,uCAAuC,CAAC,oDAAoD,CAAC,gDAAgD,CAAC,sEAAsE,wCAAwC,CAAC,6CAA6C,mBAAmB,CAAC,SAAS,CAAC,8BAA8B,iBAAiB,CAAC,mBAAmB,CAAC,wBAAwB,CAAC,kDAAkD,CAAC,SAAS,CAAC,qCAAqC,qDAAqD,CAAC,SAAS,CAAC,oCAAoC,UAAU,CAAC,UAAU,CAAC,qBAAqB,gBAAgB,CAAqB,YAAY,CAAC,sCAAsC,CAAC,qBAAqB,UAAU,CAAC,cAAc,CAAC,wCAAwC,CAAC,iDAAiD,CAAC,8BAA8B,mBAAmB,CAAC,gBAAgB,cAAc,CAAC,iBAAiB,CAAC,sBAAsB,SAAS,CAAC,2IAA2I,4CAA4C,CAAC,yGAAyG,kCAAkC,CAAC,kUAAkU,wCAAwC,CAAC,sJAAsJ,uCAAuC,CAAC,oDAAoD,CAAC,gDAAgD,CAAC,uEAAuE,mBAAmB,CAAC,SAAS,CAAC,yBAAyB,cAAc,CAAC,UAAU,CAAC,uBAAuB,4CAA4C,CAAqB,YAAY,CAAuB,kBAAkB,CAAC,kBAAkB,CAAC,iCAAiC,CAAC,iBAAiB,CAAC,yBAAyB,sCAAsC,CAAC,sBAAsB,2CAA2C,CAAC,mCAAmC,CAAC,2BAA2B,CAAC,uBAAuB,gCAAgC,CAAC,2BAA2B,CAAC,oCAAoC,CAAC,sCAAsC,CAAC,yCAAyC,CAAC,sCAAsC,CAAC,6BAA6B,GAAG,SAAS,CAAC,2BAA2B,CAAC,GAAG,SAAS,CAAC,CAAC,8BAA8B,GAAG,SAAS,CAAC,GAAG,SAAS,CAAC,2BAA2B,CAAC,CAAC,2BAA2B,yBAAyB,CAAC,+BAA+B,CAAC,2BAA2B,yBAAyB,CAAC,gCAAgC,CAAC,4BAA4B,GAAG,SAAS,CAAC,0BAA0B,CAAC,GAAG,SAAS,CAAC,uBAAuB,CAAC,CAAC,6BAA6B,GAAG,SAAS,CAAC,uBAAuB,CAAC,GAAG,SAAS,CAAC,0BAA0B,CAAC,CAAC,0BAA0B,mCAAmC,CAAC,0BAA0B,oCAAoC,CAAC,6BAA6B,GAAG,2CAA2C,CAAC,GAAG,4BAA4B,CAAC,CAAC,8BAA8B,GAAG,4BAA4B,CAAC,GAAG,2CAA2C,CAAC,SAAS,CAAC,CAAC,0BAA0B,+BAA+B,CAAC,oDAAkG,qCAAqC,CAAC,2BAA2B,CAAC,0BAA0B,gCAAgC,CAAC,6BAA6B,GAAG,SAAS,CAAC,oBAAoB,CAAC,GAAG,SAAS,CAAC,CAAC,8BAA8B,GAAG,SAAS,CAAC,GAAG,SAAS,CAAC,oBAAoB,CAAC,CAAC,2BAA2B,2BAA2B,CAAC,+BAA+B,CAAC,2BAA2B,2BAA2B,CAAC,gCAAgC","sourcesContent":[":root{--contexify-zIndex:666;--contexify-menu-minWidth:220px;--contexify-menu-padding:6px;--contexify-menu-radius:6px;--contexify-menu-bgColor:#fff;--contexify-menu-shadow:1px 2px 2px rgba(0,0,0,.1),2px 4px 4px rgba(0,0,0,.1),3px 6px 6px rgba(0,0,0,.1);--contexify-menu-negatePadding:var(--contexify-menu-padding);--contexify-separator-color:rgba(0,0,0,.2);--contexify-separator-margin:5px;--contexify-itemContent-padding:6px;--contexify-activeItem-radius:4px;--contexify-item-color:#333;--contexify-activeItem-color:#fff;--contexify-activeItem-bgColor:#3498db;--contexify-rightSlot-color:#6f6e77;--contexify-activeRightSlot-color:#fff;--contexify-arrow-color:#6f6e77;--contexify-activeArrow-color:#fff}@keyframes contexify_feedback{0%{opacity:.4}to{opacity:1}}.contexify{position:fixed;opacity:0;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;background-color:var(--contexify-menu-bgColor);box-sizing:border-box;box-shadow:var(--contexify-menu-shadow);border-radius:var(--contexify-menu-radius);padding:var(--contexify-menu-padding);min-width:var(--contexify-menu-minWidth);z-index:var(--contexify-zIndex)}.contexify_submenu-isOpen,.contexify_submenu-isOpen>.contexify_itemContent{color:var(--contexify-activeItem-color);background-color:var(--contexify-activeItem-bgColor);border-radius:var(--contexify-activeItem-radius)}.contexify_submenu-isOpen>.contexify_itemContent .contexify_rightSlot{color:var(--contexify-activeArrow-color)}.contexify_submenu-isOpen>.contexify_submenu{pointer-events:auto;opacity:1}.contexify .contexify_submenu{position:absolute;pointer-events:none;transition:opacity .265s;top:calc(-1 * var(--contexify-menu-negatePadding));left:100%}.contexify .contexify_submenu-bottom{bottom:calc(-1 * var(--contexify-menu-negatePadding));top:unset}.contexify .contexify_submenu-right{right:100%;left:unset}.contexify_rightSlot{margin-left:auto;display:-ms-flexbox;display:flex;color:var(--contexify-rightSlot-color)}.contexify_separator{height:1px;cursor:default;margin:var(--contexify-separator-margin);background-color:var(--contexify-separator-color)}.contexify_willLeave-disabled{pointer-events:none}.contexify_item{cursor:pointer;position:relative}.contexify_item:focus{outline:0}.contexify_item:focus .contexify_rightSlot,.contexify_item:not(.contexify_item-disabled):hover>.contexify_itemContent .contexify_rightSlot{color:var(--contexify-activeRightSlot-color)}.contexify_item:not(.contexify_item-disabled)[aria-haspopup]>.contexify_itemContent .contexify_rightSlot{color:var(--contexify-arrow-color)}.contexify_item:not(.contexify_item-disabled)[aria-haspopup].contexify_submenu-isOpen>.contexify_itemContent .contexify_rightSlot,.contexify_item:not(.contexify_item-disabled)[aria-haspopup]:hover>.contexify_itemContent .contexify_rightSlot,.contexify_item[aria-haspopup]:focus>.contexify_itemContent .contexify_rightSlot{color:var(--contexify-activeArrow-color)}.contexify_item:not(.contexify_item-disabled):focus>.contexify_itemContent,.contexify_item:not(.contexify_item-disabled):hover>.contexify_itemContent{color:var(--contexify-activeItem-color);background-color:var(--contexify-activeItem-bgColor);border-radius:var(--contexify-activeItem-radius)}.contexify_item:not(.contexify_item-disabled):hover>.contexify_submenu{pointer-events:auto;opacity:1}.contexify_item-disabled{cursor:default;opacity:.5}.contexify_itemContent{padding:var(--contexify-itemContent-padding);display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;white-space:nowrap;color:var(--contexify-item-color);position:relative}.contexify_item-feedback{animation:contexify_feedback .12s both}.contexify_theme-dark{--contexify-menu-bgColor:rgba(40,40,40,.98);--contexify-separator-color:#4c4c4c;--contexify-item-color:#fff}.contexify_theme-light{--contexify-separator-color:#eee;--contexify-item-color:#666;--contexify-activeItem-color:#3498db;--contexify-activeItem-bgColor:#e0eefd;--contexify-activeRightSlot-color:#3498db;--contexify-active-arrow-color:#3498db}@keyframes contexify_scaleIn{0%{opacity:0;transform:scale3d(.3,.3,.3)}to{opacity:1}}@keyframes contexify_scaleOut{0%{opacity:1}to{opacity:0;transform:scale3d(.3,.3,.3)}}.contexify_willEnter-scale{transform-origin:top left;animation:contexify_scaleIn .3s}.contexify_willLeave-scale{transform-origin:top left;animation:contexify_scaleOut .3s}@keyframes contexify_fadeIn{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes contexify_fadeOut{0%{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(10px)}}.contexify_willEnter-fade{animation:contexify_fadeIn .3s ease}.contexify_willLeave-fade{animation:contexify_fadeOut .3s ease}@keyframes contexify_flipInX{0%{transform:perspective(800px) rotateX(45deg)}to{transform:perspective(800px)}}@keyframes contexify_flipOutX{0%{transform:perspective(800px)}to{transform:perspective(800px) rotateX(45deg);opacity:0}}.contexify_willEnter-flip{animation:contexify_flipInX .3s}.contexify_willEnter-flip,.contexify_willLeave-flip{-webkit-backface-visibility:visible!important;backface-visibility:visible!important;transform-origin:top center}.contexify_willLeave-flip{animation:contexify_flipOutX .3s}@keyframes contexify_slideIn{0%{opacity:0;transform:scaleY(.3)}to{opacity:1}}@keyframes contexify_slideOut{0%{opacity:1}to{opacity:0;transform:scaleY(.3)}}.contexify_willEnter-slide{transform-origin:top center;animation:contexify_slideIn .3s}.contexify_willLeave-slide{transform-origin:top center;animation:contexify_slideOut .3s}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi1mNDZkYzNkYy45MzBkZTgwOWM2ZThhNzkzMjE4Zi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxvQzs7QUM3QnFEO0FBQzlDO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsS0FBSztBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsT0FBTztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2Qzs7QUN6Qk87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1FQUFtRSxTQUFTO0FBQzVFO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw0Qzs7QUNqRE87QUFDQTtBQUNBO0FBQ0E7O0FBRVAsdUM7O0FDTE87QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxtRDs7QUNOaUQ7QUFDc0I7QUFDaEU7QUFDUCxLQUFLLElBQWdCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsS0FBSyxJQUFnQjtBQUNyQjtBQUNBLGdEQUFnRCx1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Q1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEseUM7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHNCQUFzQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDMkQ7QUFDZ0M7QUFDM0M7QUFDbUQ7QUFDaEQ7QUFDNUM7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMseUJBQXlCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsZ0NBQWdDO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQiwyQkFBVyxjQUFjLDJCQUFXO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLHNCQUFzQjtBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsbUJBQW1CO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixzQkFBc0I7QUFDMUM7QUFDQSxpQ0FBaUMsb0JBQW9CO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLG9CQUFvQixnQkFBZ0I7QUFDcEMsK0JBQStCLG1CQUFtQjtBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MseUNBQXlDO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrREFBa0Qsb0JBQW9CO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwySEFBMkg7QUFDM0gsa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix3QkFBd0I7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGdCQUFnQjtBQUNwQywrQkFBK0IsbUJBQW1CO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixzQkFBc0I7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyxvQkFBb0I7QUFDdEQsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLHFCQUFxQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLG9CQUFvQjtBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLFNBQVMsbUJBQW1CO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsaUJBQWlCO0FBQ3JDO0FBQ0E7QUFDQSw4QkFBOEIsb0JBQW9CO0FBQ2xELGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQixhQUFhO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxpQkFBaUI7QUFDdEQ7QUFDQTs7QUFFQSw0Qzs7QUMxakJBO0FBQ087QUFDUDtBQUNBO0FBQ0EseUNBQXlDO0FBQ3pDO0FBQ0E7QUFDQTs7QUFFQSx5Qzs7QUNUeUQ7QUFDUjtBQUNFO0FBQ1o7QUFDaEM7QUFDUCxlQUFlLGdCQUFnQjtBQUMvQjs7QUFFQSxpQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDUEEsTUFBcUY7QUFDckYsTUFBMkU7QUFDM0UsTUFBa0Y7QUFDbEYsTUFBcUc7QUFDckcsTUFBOEY7QUFDOUYsTUFBOEY7QUFDOUYsTUFBdUk7QUFDdkk7QUFDQTs7QUFFQTs7QUFFQSw0QkFBNEIsd0ZBQW1CO0FBQy9DLHdCQUF3QixxR0FBYTs7QUFFckMsdUJBQXVCLDBGQUFhO0FBQ3BDO0FBQ0EsaUJBQWlCLGtGQUFNO0FBQ3ZCLDZCQUE2Qix5RkFBa0I7O0FBRS9DLGFBQWEsNkZBQUcsQ0FBQywwSEFBTzs7OztBQUlpRjtBQUN6RyxPQUFPLHNFQUFlLDBIQUFPLElBQUksMEhBQU8sVUFBVSwwSEFBTyxtQkFBbUIsRUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMUI3RSxjQUFjLGFBQWEsK0NBQStDLHVEQUF1RCxXQUFXLDBDQUEwQyx5Q0FBeUMsU0FBZ0IsZ0JBQWdCLHFCQUFxQixtQkFBbUIsa0RBQWtELFNBQVMsNkNBQWUsSUFBSSxFOzs7O0FDQS9QO0FBQ2pHO0FBQ2lCOztBQUV0QyxNQUFNLHVCQUFhLEdBQUcsUUFBUSxvQkFBVSxTQUFTLG1CQUFlLGFBQWEsS0FBSyxFQUFFLGNBQWMsY0FBYyxRQUFRLFFBQVEsMkRBQTJELFVBQVUseUNBQXlDLFdBQVcsc0NBQXNDLE1BQU0sU0FBUyxXQUFXLFVBQVUsZ0JBQU0sa0JBQWtCLFlBQVksb0RBQW9ELE9BQU8sTUFBTSxnQ0FBZ0MsRUFBRSx1REFBdUQsMENBQTBDLEdBQUcsV0FBVyxhQUFhLGVBQWUsUUFBUSxRQUFRLFFBQVEsVUFBVSxHQUFHLFdBQVcsZUFBZSxhQUFhLDJCQUEyQixjQUFjLG9DQUFvQyxhQUFhLG1CQUFtQixpRkFBaUYsYUFBYSwwQkFBMEIsYUFBYSxtREFBbUQsYUFBYSx5REFBeUQsYUFBYSxhQUFhLFdBQVcsNEJBQTRCLE1BQU0sZ0JBQWdCLGdEQUFnRCw0RkFBNEYsVUFBVSxhQUFhLFlBQVksZUFBZSwrSEFBK0gsY0FBYyxjQUFjLDRIQUE0SCxNQUFNLFFBQVEscUVBQXFFLGNBQWMsNEJBQTRCLGNBQWMsMEJBQTBCLGdCQUFnQixPQUFPLGNBQVEsS0FBSyxjQUFRLCtCQUErQixzQkFBWSxPQUFPLGNBQWMsT0FBTyx3QkFBd0Isb0JBQW9CLDhGQUE4RixnQkFBZ0IsbUJBQW1CLGlCQUFpQixRQUFRLHFCQUFxQixTQUFTLGtKQUFrSixJQUFJLFNBQVMsb0JBQVUsS0FBSyxrQ0FBa0Msb0NBQW9DLElBQUksZ0JBQU0saUJBQWlCLGtCQUFRLFlBQVksZ0JBQU0sS0FBSyxnQkFBTSxHQUFHLG1CQUFTLDZCQUE2QixxQkFBcUIsV0FBVyxtQkFBUyxNQUFNLCtCQUErQixrQkFBa0IsZ0JBQWdCLGtCQUFrQixJQUFJLDJCQUEyQixTQUFTLDZCQUE2QixXQUFXLHFDQUFxQyxRQUFRLFNBQVMsbUJBQVMsTUFBTSwwQkFBMEIsY0FBYyxtQkFBUyxNQUFNLGNBQWMsdUJBQXVCLGNBQWMsY0FBYyx5Q0FBeUMsTUFBTSxpQkFBaUIsTUFBTSw4QkFBOEIsTUFBTSxrQ0FBa0MsTUFBTSxzQ0FBc0MsTUFBTSxzQ0FBc0MsTUFBTSx1QkFBdUIsT0FBTyxjQUFjLHFDQUFxQyw2Q0FBNkMsWUFBWSx3Q0FBd0MsaURBQWlELGtCQUFrQixZQUFZLDJCQUEyQixFQUFFLG9CQUFvQixlQUFlLFFBQVEsWUFBWSx1QkFBUyxNQUFNLEdBQUcsa0VBQWtFLEdBQUcsa0VBQWtFLGNBQWMsa0dBQWtHLG9CQUFvQixVQUFVLCtCQUErQiw2QkFBNkIsMEJBQTBCLElBQUksYUFBYSx3QkFBd0IsdUJBQVMsUUFBUSx3QkFBd0IsSUFBSSxhQUFhLFlBQVksTUFBQyxFQUFFLElBQUksdUJBQXVCLEVBQUUsRUFBRSxhQUFhLHVCQUF1QixFQUFFLEdBQUcsRUFBRSx1QkFBdUIsa0JBQWtCLDZCQUE2QixNQUFDLEVBQUUsSUFBSSx1QkFBdUIsRUFBRSxRQUFRLHNCQUFzQix1QkFBdUIsRUFBRSxRQUFRLEVBQUUsdUJBQXVCLDBCQUEwQixPQUFPLElBQUksa0VBQWtFLE1BQU0sTUFBQyxnQkFBZ0IsSUFBSSxtQkFBbUIsRUFBRSxFQUFFLEtBQUssTUFBTSxPQUFPLG1CQUFlLElBQUksUUFBUSxJQUFJLG1CQUFlLFFBQVEsMENBQTBDLDhCQUE4QixtQkFBbUIsTUFBTSxrQ0FBa0MsS0FBSyxTQUFTLGdMQUFnTCxJQUFJLE1BQU0sZ0JBQU0sWUFBWSxtQ0FBbUMsbUJBQW1CLGNBQWMsK0NBQStDLGFBQWEsZ0JBQWdCLHVFQUF1RSxRQUFRLG1EQUFtRCxjQUFjLDZCQUE2Qiw4Q0FBOEMsOERBQThELEVBQUUsSUFBSSxjQUFjLHFFQUFxRSxjQUFjLG1CQUFlLFFBQVEscUJBQXFCLE1BQUMscUJBQXFCLElBQUksMEJBQTBCLEtBQUssMEVBQTBFLENBQUMsbUJBQWUsUUFBUSxrQ0FBa0MsTUFBTSxTQUFTLHFEQUFxRCxRQUFRLDhCQUE4Qiw4QkFBOEIsZ0NBQWdDLEVBQUUsa0NBQWtDLDZLQUE2Syw2QkFBNkIsd0JBQXdCLEdBQUcsU0FBUyxpQkFBaUIsMEJBQTBCLDBDQUEwQyxFQUFFLFNBQVMsZ0hBQWdILElBQUksa0NBQWtDLHVCQUF1QixtQkFBbUIsYUFBYSxnQkFBZ0IsTUFBTSxTQUFTLG9CQUFvQixjQUFjLG9CQUFvQixRQUFRLHdCQUF3QixnQ0FBZ0MsZ0dBQWdHLGNBQWMsZ0JBQWdCLDZEQUE2RCxHQUFHLGlCQUFpQiw0QkFBNEIsSUFBSSwwQkFBMEIsS0FBSyxFQUFFLDBCQUEwQixRQUFRLHdCQUF3QixzSEFBc0gsd0JBQXdCLGlFQUFpRSxnRkFBZ0YsYUFBYSxhQUFhLEVBQUUsb0JBQW9CLGdCQUFnQixNQUFNLGtDQUFrQzs7QUFFLzFOO0FBQzNIO0FBQ0Esa0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1JpQzs7QUFFakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0seURBQXlDLHlDQUF5QyxLQUFZOzs7QUFHOUI7QUFDdEU7OztBQ2pCbUc7QUFDSjs7QUFFL0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxvR0FBb0csS0FBWSx3SkFBd0oseURBQXlDO0FBQ2pULFNBQVMsd0RBQXlDO0FBQ2xELG9CQUFvQixZQUFhO0FBQ2pDO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsZUFBZSxpQkFBa0I7QUFDakM7QUFDQTtBQUNBLEtBQUs7QUFDTDs7O0FBR3FFO0FBQ3JFOzs7QUNuQ2lHO0FBQ0U7QUFDeEI7O0FBRTNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUyx3REFBeUM7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR3FFO0FBQ3JFOzs7OztBQ3BEbUc7QUFDRjtBQUM0QztBQUN6RTs7QUFFcEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCxTQUFTLCtDQUF5QztBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxTQUFTLCtDQUF5QztBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSwrQ0FBeUM7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUd1TztBQUN2Tzs7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsK0NBQXlDO0FBQ3REO0FBQ0E7QUFDQTtBQUNBOzs7QUFHNEQ7QUFDNUQ7OztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sb0RBQXlDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRytMO0FBQy9MOzs7OztBQ3BCMkY7QUFDeEI7O0FBRW5FOzs7QUFHQSxTQUFTLHNEQUF5QztBQUNsRCxhQUFhLG1DQUFnQjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIseUNBQXlDO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxtQ0FBZ0I7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksbUNBQWdCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBOzs7QUFHK0w7QUFDL0w7OztBQ3BDNkY7QUFDMUI7O0FBRW5FOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUc0STtBQUM1STs7Ozs7QUNqTStFO0FBQ0c7QUFDbkQ7O0FBRS9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixpQkFBaUI7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR2lFO0FBQ2pFOzs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHZ0U7QUFDaEU7OztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1FQUFtRTtBQUNuRSxVQUFVLHNHQUFzRztBQUNoSDtBQUNBO0FBQ0E7QUFDQTs7O0FBR3FFO0FBQ3JFOzs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0Es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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOzs7QUFHeUU7QUFDekU7OztBQ3RGdUY7QUFDekM7O0FBRTlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsK0NBQStDLGtEQUFFO0FBQ2pEO0FBQ0E7QUFDQSxVQUFVLCtTQUErUztBQUN6VDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR2dFO0FBQ2hFOzs7QUNySWdIOztBQUVoSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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LGtVQUFrVSx5Q0FBeUMsc0pBQXNKLHdDQUF3QyxxREFBcUQsaURBQWlELHVFQUF1RSxvQkFBb0IsVUFBVSx5QkFBeUIsZUFBZSxXQUFXLHVCQUF1Qiw2Q0FBNkMsb0JBQW9CLGFBQWEsc0JBQXNCLG1CQUFtQixtQkFBbUIsa0NBQWtDLGtCQUFrQix5QkFBeUIsdUNBQXVDLHNCQUFzQiw0Q0FBNEMsb0NBQW9DLDRCQUE0Qix1QkFBdUIsaUNBQWlDLDRCQUE0QixxQ0FBcUMsdUNBQXVDLDBDQUEwQyx1Q0FBdUMsNkJBQTZCLEdBQUcsVUFBVSw0QkFBNEIsR0FBRyxXQUFXLDhCQUE4QixHQUFHLFVBQVUsR0FBRyxVQUFVLDZCQUE2QiwyQkFBMkIsMEJBQTBCLGdDQUFnQywyQkFBMkIsMEJBQTBCLGlDQUFpQyw0QkFBNEIsR0FBRyxVQUFVLDJCQUEyQixHQUFHLFVBQVUseUJBQXlCLDZCQUE2QixHQUFHLFVBQVUsd0JBQXdCLEdBQUcsVUFBVSw0QkFBNEIsMEJBQTBCLG9DQUFvQywwQkFBMEIscUNBQXFDLDZCQUE2QixHQUFHLDRDQUE0QyxHQUFHLDhCQUE4Qiw4QkFBOEIsR0FBRyw2QkFBNkIsR0FBRyw0Q0FBNEMsV0FBVywwQkFBMEIsZ0NBQWdDLG9EQUFvRCw4Q0FBOEMsc0NBQXNDLDRCQUE0QiwwQkFBMEIsaUNBQWlDLDZCQUE2QixHQUFHLFVBQVUscUJBQXFCLEdBQUcsV0FBVyw4QkFBOEIsR0FBRyxVQUFVLEdBQUcsVUFBVSxzQkFBc0IsMkJBQTJCLDRCQUE0QixnQ0FBZ0MsMkJBQTJCLDRCQUE0QixpQ0FBaUMsbUJBQW1CO0FBQzNyWjtBQUNBLGlFQUFlLHVCQUF1QixFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kLWh0bWw1LWJhY2tlbmQvZGlzdC91dGlscy9qc191dGlscy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQtaHRtbDUtYmFja2VuZC9kaXN0L0VudGVyTGVhdmVDb3VudGVyLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC1odG1sNS1iYWNrZW5kL2Rpc3QvTmF0aXZlRHJhZ1NvdXJjZXMvTmF0aXZlRHJhZ1NvdXJjZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQtaHRtbDUtYmFja2VuZC9kaXN0L05hdGl2ZVR5cGVzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC1odG1sNS1iYWNrZW5kL2Rpc3QvTmF0aXZlRHJhZ1NvdXJjZXMvZ2V0RGF0YUZyb21EYXRhVHJhbnNmZXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kLWh0bWw1LWJhY2tlbmQvZGlzdC9OYXRpdmVEcmFnU291cmNlcy9uYXRpdmVUeXBlc0NvbmZpZy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQtaHRtbDUtYmFja2VuZC9kaXN0L05hdGl2ZURyYWdTb3VyY2VzL2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC1odG1sNS1iYWNrZW5kL2Rpc3QvQnJvd3NlckRldGVjdG9yLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC1odG1sNS1iYWNrZW5kL2Rpc3QvTW9ub3RvbmljSW50ZXJwb2xhbnQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kLWh0bWw1LWJhY2tlbmQvZGlzdC9PZmZzZXRVdGlscy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQtaHRtbDUtYmFja2VuZC9kaXN0L09wdGlvbnNSZWFkZXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtZG5kLWh0bWw1LWJhY2tlbmQvZGlzdC9IVE1MNUJhY2tlbmRJbXBsLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWRuZC1odG1sNS1iYWNrZW5kL2Rpc3QvZ2V0RW1wdHlJbWFnZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1kbmQtaHRtbDUtYmFja2VuZC9kaXN0L2luZGV4LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlYWN0LWNvbnRleGlmeS9kaXN0L1JlYWN0Q29udGV4aWZ5Lm1pbi5jc3M/MWVhNCIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWFjdC1jb250ZXhpZnkvbm9kZV9tb2R1bGVzL2Nsc3gvZGlzdC9jbHN4Lm0uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtY29udGV4aWZ5L2Rpc3QvaW5kZXgubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL3V0aWxzL2Rpc3QvdXNlTGF5b3V0RWZmZWN0Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L3VzZUVmZmVjdEV2ZW50Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L3VzZVZhbHVlRWZmZWN0Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L3VzZUlkLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L2NoYWluLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L2RvbUhlbHBlcnMubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL3V0aWxzL2Rpc3QvRE9NRnVuY3Rpb25zLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L1NoYWRvd1RyZWVXYWxrZXIubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL3V0aWxzL2Rpc3QvbWVyZ2VQcm9wcy5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvdXRpbHMvZGlzdC9tZXJnZVJlZnMubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL3V0aWxzL2Rpc3QvZmlsdGVyRE9NUHJvcHMubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL3V0aWxzL2Rpc3QvZm9jdXNXaXRob3V0U2Nyb2xsaW5nLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L2dldE9mZnNldC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvdXRpbHMvZGlzdC9wbGF0Zm9ybS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvdXRpbHMvZGlzdC9vcGVuTGluay5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvdXRpbHMvZGlzdC9ydW5BZnRlclRyYW5zaXRpb24ubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL3V0aWxzL2Rpc3QvdXNlRHJhZzFELm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L3VzZUdsb2JhbExpc3RlbmVycy5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvdXRpbHMvZGlzdC91c2VMYWJlbHMubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL3V0aWxzL2Rpc3QvdXNlT2JqZWN0UmVmLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L3VzZVVwZGF0ZUVmZmVjdC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvdXRpbHMvZGlzdC91c2VVcGRhdGVMYXlvdXRFZmZlY3QubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL3V0aWxzL2Rpc3QvdXNlUmVzaXplT2JzZXJ2ZXIubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL3V0aWxzL2Rpc3QvdXNlU3luY1JlZi5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvdXRpbHMvZGlzdC9pc1Njcm9sbGFibGUubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL3V0aWxzL2Rpc3QvZ2V0U2Nyb2xsUGFyZW50Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L2dldFNjcm9sbFBhcmVudHMubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL3V0aWxzL2Rpc3Qva2V5Ym9hcmQubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL3V0aWxzL2Rpc3QvdXNlVmlld3BvcnRTaXplLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L3VzZURlc2NyaXB0aW9uLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L3VzZUV2ZW50Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L3Njcm9sbEludG9WaWV3Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L2lzVmlydHVhbEV2ZW50Lm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L3VzZURlZXBNZW1vLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L3VzZUZvcm1SZXNldC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvdXRpbHMvZGlzdC91c2VMb2FkTW9yZS5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvdXRpbHMvZGlzdC91c2VMb2FkTW9yZVNlbnRpbmVsLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L2luZXJ0VmFsdWUubWpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL0ByZWFjdC1hcmlhL3V0aWxzL2Rpc3QvY29uc3RhbnRzLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L2FuaW1hdGlvbi5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvQHJlYWN0LWFyaWEvdXRpbHMvZGlzdC9pc0VsZW1lbnRWaXNpYmxlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L2lzRm9jdXNhYmxlLm1qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9AcmVhY3QtYXJpYS91dGlscy9kaXN0L2ltcG9ydC5tanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVhY3QtY29udGV4aWZ5L2Rpc3QvUmVhY3RDb250ZXhpZnkubWluLmNzcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBjaGVhcCBsb2Rhc2ggcmVwbGFjZW1lbnRzXG5leHBvcnQgZnVuY3Rpb24gbWVtb2l6ZShmbikge1xuICAgIGxldCByZXN1bHQgPSBudWxsO1xuICAgIGNvbnN0IG1lbW9pemVkID0gKCk9PntcbiAgICAgICAgaWYgKHJlc3VsdCA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBmbigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICByZXR1cm4gbWVtb2l6ZWQ7XG59XG4vKipcbiAqIGRyb3AtaW4gcmVwbGFjZW1lbnQgZm9yIF8ud2l0aG91dFxuICovIGV4cG9ydCBmdW5jdGlvbiB3aXRob3V0KGl0ZW1zLCBpdGVtKSB7XG4gICAgcmV0dXJuIGl0ZW1zLmZpbHRlcigoaSk9PmkgIT09IGl0ZW1cbiAgICApO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHVuaW9uKGl0ZW1zQSwgaXRlbXNCKSB7XG4gICAgY29uc3Qgc2V0ID0gbmV3IFNldCgpO1xuICAgIGNvbnN0IGluc2VydEl0ZW0gPSAoaXRlbSk9PnNldC5hZGQoaXRlbSlcbiAgICA7XG4gICAgaXRlbXNBLmZvckVhY2goaW5zZXJ0SXRlbSk7XG4gICAgaXRlbXNCLmZvckVhY2goaW5zZXJ0SXRlbSk7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgc2V0LmZvckVhY2goKGtleSk9PnJlc3VsdC5wdXNoKGtleSlcbiAgICApO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWpzX3V0aWxzLmpzLm1hcCIsImltcG9ydCB7IHVuaW9uLCB3aXRob3V0IH0gZnJvbSAnLi91dGlscy9qc191dGlscy5qcyc7XG5leHBvcnQgY2xhc3MgRW50ZXJMZWF2ZUNvdW50ZXIge1xuICAgIGVudGVyKGVudGVyaW5nTm9kZSkge1xuICAgICAgICBjb25zdCBwcmV2aW91c0xlbmd0aCA9IHRoaXMuZW50ZXJlZC5sZW5ndGg7XG4gICAgICAgIGNvbnN0IGlzTm9kZUVudGVyZWQgPSAobm9kZSk9PnRoaXMuaXNOb2RlSW5Eb2N1bWVudChub2RlKSAmJiAoIW5vZGUuY29udGFpbnMgfHwgbm9kZS5jb250YWlucyhlbnRlcmluZ05vZGUpKVxuICAgICAgICA7XG4gICAgICAgIHRoaXMuZW50ZXJlZCA9IHVuaW9uKHRoaXMuZW50ZXJlZC5maWx0ZXIoaXNOb2RlRW50ZXJlZCksIFtcbiAgICAgICAgICAgIGVudGVyaW5nTm9kZVxuICAgICAgICBdKTtcbiAgICAgICAgcmV0dXJuIHByZXZpb3VzTGVuZ3RoID09PSAwICYmIHRoaXMuZW50ZXJlZC5sZW5ndGggPiAwO1xuICAgIH1cbiAgICBsZWF2ZShsZWF2aW5nTm9kZSkge1xuICAgICAgICBjb25zdCBwcmV2aW91c0xlbmd0aCA9IHRoaXMuZW50ZXJlZC5sZW5ndGg7XG4gICAgICAgIHRoaXMuZW50ZXJlZCA9IHdpdGhvdXQodGhpcy5lbnRlcmVkLmZpbHRlcih0aGlzLmlzTm9kZUluRG9jdW1lbnQpLCBsZWF2aW5nTm9kZSk7XG4gICAgICAgIHJldHVybiBwcmV2aW91c0xlbmd0aCA+IDAgJiYgdGhpcy5lbnRlcmVkLmxlbmd0aCA9PT0gMDtcbiAgICB9XG4gICAgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMuZW50ZXJlZCA9IFtdO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcihpc05vZGVJbkRvY3VtZW50KXtcbiAgICAgICAgdGhpcy5lbnRlcmVkID0gW107XG4gICAgICAgIHRoaXMuaXNOb2RlSW5Eb2N1bWVudCA9IGlzTm9kZUluRG9jdW1lbnQ7XG4gICAgfVxufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1FbnRlckxlYXZlQ291bnRlci5qcy5tYXAiLCJleHBvcnQgY2xhc3MgTmF0aXZlRHJhZ1NvdXJjZSB7XG4gICAgaW5pdGlhbGl6ZUV4cG9zZWRQcm9wZXJ0aWVzKCkge1xuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLmNvbmZpZy5leHBvc2VQcm9wZXJ0aWVzKS5mb3JFYWNoKChwcm9wZXJ0eSk9PntcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLml0ZW0sIHByb3BlcnR5LCB7XG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZ2V0ICgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKGBCcm93c2VyIGRvZXNuJ3QgYWxsb3cgcmVhZGluZyBcIiR7cHJvcGVydHl9XCIgdW50aWwgdGhlIGRyb3AgZXZlbnQuYCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgbG9hZERhdGFUcmFuc2ZlcihkYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgaWYgKGRhdGFUcmFuc2Zlcikge1xuICAgICAgICAgICAgY29uc3QgbmV3UHJvcGVydGllcyA9IHt9O1xuICAgICAgICAgICAgT2JqZWN0LmtleXModGhpcy5jb25maWcuZXhwb3NlUHJvcGVydGllcykuZm9yRWFjaCgocHJvcGVydHkpPT57XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvcGVydHlGbiA9IHRoaXMuY29uZmlnLmV4cG9zZVByb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgICAgICAgICAgIGlmIChwcm9wZXJ0eUZuICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3UHJvcGVydGllc1twcm9wZXJ0eV0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcGVydHlGbihkYXRhVHJhbnNmZXIsIHRoaXMuY29uZmlnLm1hdGNoZXNUeXBlcyksXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLml0ZW0sIG5ld1Byb3BlcnRpZXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhbkRyYWcoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBiZWdpbkRyYWcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLml0ZW07XG4gICAgfVxuICAgIGlzRHJhZ2dpbmcobW9uaXRvciwgaGFuZGxlKSB7XG4gICAgICAgIHJldHVybiBoYW5kbGUgPT09IG1vbml0b3IuZ2V0U291cmNlSWQoKTtcbiAgICB9XG4gICAgZW5kRHJhZygpIHtcbiAgICAvLyBlbXB0eVxuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpe1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5pdGVtID0ge307XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZUV4cG9zZWRQcm9wZXJ0aWVzKCk7XG4gICAgfVxufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1OYXRpdmVEcmFnU291cmNlLmpzLm1hcCIsImV4cG9ydCBjb25zdCBGSUxFID0gJ19fTkFUSVZFX0ZJTEVfXyc7XG5leHBvcnQgY29uc3QgVVJMID0gJ19fTkFUSVZFX1VSTF9fJztcbmV4cG9ydCBjb25zdCBURVhUID0gJ19fTkFUSVZFX1RFWFRfXyc7XG5leHBvcnQgY29uc3QgSFRNTCA9ICdfX05BVElWRV9IVE1MX18nO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1OYXRpdmVUeXBlcy5qcy5tYXAiLCJleHBvcnQgZnVuY3Rpb24gZ2V0RGF0YUZyb21EYXRhVHJhbnNmZXIoZGF0YVRyYW5zZmVyLCB0eXBlc1RvVHJ5LCBkZWZhdWx0VmFsdWUpIHtcbiAgICBjb25zdCByZXN1bHQgPSB0eXBlc1RvVHJ5LnJlZHVjZSgocmVzdWx0U29GYXIsIHR5cGVUb1RyeSk9PnJlc3VsdFNvRmFyIHx8IGRhdGFUcmFuc2Zlci5nZXREYXRhKHR5cGVUb1RyeSlcbiAgICAsICcnKTtcbiAgICByZXR1cm4gcmVzdWx0ICE9IG51bGwgPyByZXN1bHQgOiBkZWZhdWx0VmFsdWU7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdldERhdGFGcm9tRGF0YVRyYW5zZmVyLmpzLm1hcCIsImltcG9ydCAqIGFzIE5hdGl2ZVR5cGVzIGZyb20gJy4uL05hdGl2ZVR5cGVzLmpzJztcbmltcG9ydCB7IGdldERhdGFGcm9tRGF0YVRyYW5zZmVyIH0gZnJvbSAnLi9nZXREYXRhRnJvbURhdGFUcmFuc2Zlci5qcyc7XG5leHBvcnQgY29uc3QgbmF0aXZlVHlwZXNDb25maWcgPSB7XG4gICAgW05hdGl2ZVR5cGVzLkZJTEVdOiB7XG4gICAgICAgIGV4cG9zZVByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIGZpbGVzOiAoZGF0YVRyYW5zZmVyKT0+QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZGF0YVRyYW5zZmVyLmZpbGVzKVxuICAgICAgICAgICAgLFxuICAgICAgICAgICAgaXRlbXM6IChkYXRhVHJhbnNmZXIpPT5kYXRhVHJhbnNmZXIuaXRlbXNcbiAgICAgICAgICAgICxcbiAgICAgICAgICAgIGRhdGFUcmFuc2ZlcjogKGRhdGFUcmFuc2Zlcik9PmRhdGFUcmFuc2ZlclxuICAgICAgICB9LFxuICAgICAgICBtYXRjaGVzVHlwZXM6IFtcbiAgICAgICAgICAgICdGaWxlcydcbiAgICAgICAgXVxuICAgIH0sXG4gICAgW05hdGl2ZVR5cGVzLkhUTUxdOiB7XG4gICAgICAgIGV4cG9zZVByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIGh0bWw6IChkYXRhVHJhbnNmZXIsIG1hdGNoZXNUeXBlcyk9PmdldERhdGFGcm9tRGF0YVRyYW5zZmVyKGRhdGFUcmFuc2ZlciwgbWF0Y2hlc1R5cGVzLCAnJylcbiAgICAgICAgICAgICxcbiAgICAgICAgICAgIGRhdGFUcmFuc2ZlcjogKGRhdGFUcmFuc2Zlcik9PmRhdGFUcmFuc2ZlclxuICAgICAgICB9LFxuICAgICAgICBtYXRjaGVzVHlwZXM6IFtcbiAgICAgICAgICAgICdIdG1sJyxcbiAgICAgICAgICAgICd0ZXh0L2h0bWwnXG4gICAgICAgIF1cbiAgICB9LFxuICAgIFtOYXRpdmVUeXBlcy5VUkxdOiB7XG4gICAgICAgIGV4cG9zZVByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIHVybHM6IChkYXRhVHJhbnNmZXIsIG1hdGNoZXNUeXBlcyk9PmdldERhdGFGcm9tRGF0YVRyYW5zZmVyKGRhdGFUcmFuc2ZlciwgbWF0Y2hlc1R5cGVzLCAnJykuc3BsaXQoJ1xcbicpXG4gICAgICAgICAgICAsXG4gICAgICAgICAgICBkYXRhVHJhbnNmZXI6IChkYXRhVHJhbnNmZXIpPT5kYXRhVHJhbnNmZXJcbiAgICAgICAgfSxcbiAgICAgICAgbWF0Y2hlc1R5cGVzOiBbXG4gICAgICAgICAgICAnVXJsJyxcbiAgICAgICAgICAgICd0ZXh0L3VyaS1saXN0J1xuICAgICAgICBdXG4gICAgfSxcbiAgICBbTmF0aXZlVHlwZXMuVEVYVF06IHtcbiAgICAgICAgZXhwb3NlUHJvcGVydGllczoge1xuICAgICAgICAgICAgdGV4dDogKGRhdGFUcmFuc2ZlciwgbWF0Y2hlc1R5cGVzKT0+Z2V0RGF0YUZyb21EYXRhVHJhbnNmZXIoZGF0YVRyYW5zZmVyLCBtYXRjaGVzVHlwZXMsICcnKVxuICAgICAgICAgICAgLFxuICAgICAgICAgICAgZGF0YVRyYW5zZmVyOiAoZGF0YVRyYW5zZmVyKT0+ZGF0YVRyYW5zZmVyXG4gICAgICAgIH0sXG4gICAgICAgIG1hdGNoZXNUeXBlczogW1xuICAgICAgICAgICAgJ1RleHQnLFxuICAgICAgICAgICAgJ3RleHQvcGxhaW4nXG4gICAgICAgIF1cbiAgICB9XG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1uYXRpdmVUeXBlc0NvbmZpZy5qcy5tYXAiLCJpbXBvcnQgeyBOYXRpdmVEcmFnU291cmNlIH0gZnJvbSAnLi9OYXRpdmVEcmFnU291cmNlLmpzJztcbmltcG9ydCB7IG5hdGl2ZVR5cGVzQ29uZmlnIH0gZnJvbSAnLi9uYXRpdmVUeXBlc0NvbmZpZy5qcyc7XG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTmF0aXZlRHJhZ1NvdXJjZSh0eXBlLCBkYXRhVHJhbnNmZXIpIHtcbiAgICBjb25zdCBjb25maWcgPSBuYXRpdmVUeXBlc0NvbmZpZ1t0eXBlXTtcbiAgICBpZiAoIWNvbmZpZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYG5hdGl2ZSB0eXBlICR7dHlwZX0gaGFzIG5vIGNvbmZpZ3VyYXRpb25gKTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IE5hdGl2ZURyYWdTb3VyY2UoY29uZmlnKTtcbiAgICByZXN1bHQubG9hZERhdGFUcmFuc2ZlcihkYXRhVHJhbnNmZXIpO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5leHBvcnQgZnVuY3Rpb24gbWF0Y2hOYXRpdmVJdGVtVHlwZShkYXRhVHJhbnNmZXIpIHtcbiAgICBpZiAoIWRhdGFUcmFuc2Zlcikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgZGF0YVRyYW5zZmVyVHlwZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChkYXRhVHJhbnNmZXIudHlwZXMgfHwgW10pO1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhuYXRpdmVUeXBlc0NvbmZpZykuZmlsdGVyKChuYXRpdmVJdGVtVHlwZSk9PntcbiAgICAgICAgY29uc3QgdHlwZUNvbmZpZyA9IG5hdGl2ZVR5cGVzQ29uZmlnW25hdGl2ZUl0ZW1UeXBlXTtcbiAgICAgICAgaWYgKCEodHlwZUNvbmZpZyA9PT0gbnVsbCB8fCB0eXBlQ29uZmlnID09PSB2b2lkIDAgPyB2b2lkIDAgOiB0eXBlQ29uZmlnLm1hdGNoZXNUeXBlcykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHlwZUNvbmZpZy5tYXRjaGVzVHlwZXMuc29tZSgodCk9PmRhdGFUcmFuc2ZlclR5cGVzLmluZGV4T2YodCkgPiAtMVxuICAgICAgICApO1xuICAgIH0pWzBdIHx8IG51bGw7XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsImltcG9ydCB7IG1lbW9pemUgfSBmcm9tICcuL3V0aWxzL2pzX3V0aWxzLmpzJztcbmV4cG9ydCBjb25zdCBpc0ZpcmVmb3ggPSBtZW1vaXplKCgpPT4vZmlyZWZveC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudClcbik7XG5leHBvcnQgY29uc3QgaXNTYWZhcmkgPSBtZW1vaXplKCgpPT5Cb29sZWFuKHdpbmRvdy5zYWZhcmkpXG4pO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1Ccm93c2VyRGV0ZWN0b3IuanMubWFwIiwiZXhwb3J0IGNsYXNzIE1vbm90b25pY0ludGVycG9sYW50IHtcbiAgICBpbnRlcnBvbGF0ZSh4KSB7XG4gICAgICAgIGNvbnN0IHsgeHMgLCB5cyAsIGMxcyAsIGMycyAsIGMzcyAgfSA9IHRoaXM7XG4gICAgICAgIC8vIFRoZSByaWdodG1vc3QgcG9pbnQgaW4gdGhlIGRhdGFzZXQgc2hvdWxkIGdpdmUgYW4gZXhhY3QgcmVzdWx0XG4gICAgICAgIGxldCBpID0geHMubGVuZ3RoIC0gMTtcbiAgICAgICAgaWYgKHggPT09IHhzW2ldKSB7XG4gICAgICAgICAgICByZXR1cm4geXNbaV07XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2VhcmNoIGZvciB0aGUgaW50ZXJ2YWwgeCBpcyBpbiwgcmV0dXJuaW5nIHRoZSBjb3JyZXNwb25kaW5nIHkgaWYgeCBpcyBvbmUgb2YgdGhlIG9yaWdpbmFsIHhzXG4gICAgICAgIGxldCBsb3cgPSAwO1xuICAgICAgICBsZXQgaGlnaCA9IGMzcy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgbWlkO1xuICAgICAgICB3aGlsZShsb3cgPD0gaGlnaCl7XG4gICAgICAgICAgICBtaWQgPSBNYXRoLmZsb29yKDAuNSAqIChsb3cgKyBoaWdoKSk7XG4gICAgICAgICAgICBjb25zdCB4SGVyZSA9IHhzW21pZF07XG4gICAgICAgICAgICBpZiAoeEhlcmUgPCB4KSB7XG4gICAgICAgICAgICAgICAgbG93ID0gbWlkICsgMTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoeEhlcmUgPiB4KSB7XG4gICAgICAgICAgICAgICAgaGlnaCA9IG1pZCAtIDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB5c1ttaWRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGkgPSBNYXRoLm1heCgwLCBoaWdoKTtcbiAgICAgICAgLy8gSW50ZXJwb2xhdGVcbiAgICAgICAgY29uc3QgZGlmZiA9IHggLSB4c1tpXTtcbiAgICAgICAgY29uc3QgZGlmZlNxID0gZGlmZiAqIGRpZmY7XG4gICAgICAgIHJldHVybiB5c1tpXSArIGMxc1tpXSAqIGRpZmYgKyBjMnNbaV0gKiBkaWZmU3EgKyBjM3NbaV0gKiBkaWZmICogZGlmZlNxO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcih4cywgeXMpe1xuICAgICAgICBjb25zdCB7IGxlbmd0aCAgfSA9IHhzO1xuICAgICAgICAvLyBSZWFycmFuZ2UgeHMgYW5kIHlzIHNvIHRoYXQgeHMgaXMgc29ydGVkXG4gICAgICAgIGNvbnN0IGluZGV4ZXMgPSBbXTtcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGluZGV4ZXMucHVzaChpKTtcbiAgICAgICAgfVxuICAgICAgICBpbmRleGVzLnNvcnQoKGEsIGIpPT54c1thXSA8IHhzW2JdID8gLTEgOiAxXG4gICAgICAgICk7XG4gICAgICAgIC8vIEdldCBjb25zZWN1dGl2ZSBkaWZmZXJlbmNlcyBhbmQgc2xvcGVzXG4gICAgICAgIGNvbnN0IGR5cyA9IFtdO1xuICAgICAgICBjb25zdCBkeHMgPSBbXTtcbiAgICAgICAgY29uc3QgbXMgPSBbXTtcbiAgICAgICAgbGV0IGR4O1xuICAgICAgICBsZXQgZHk7XG4gICAgICAgIGZvcihsZXQgaTEgPSAwOyBpMSA8IGxlbmd0aCAtIDE7IGkxKyspe1xuICAgICAgICAgICAgZHggPSB4c1tpMSArIDFdIC0geHNbaTFdO1xuICAgICAgICAgICAgZHkgPSB5c1tpMSArIDFdIC0geXNbaTFdO1xuICAgICAgICAgICAgZHhzLnB1c2goZHgpO1xuICAgICAgICAgICAgZHlzLnB1c2goZHkpO1xuICAgICAgICAgICAgbXMucHVzaChkeSAvIGR4KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBHZXQgZGVncmVlLTEgY29lZmZpY2llbnRzXG4gICAgICAgIGNvbnN0IGMxcyA9IFtcbiAgICAgICAgICAgIG1zWzBdXG4gICAgICAgIF07XG4gICAgICAgIGZvcihsZXQgaTIgPSAwOyBpMiA8IGR4cy5sZW5ndGggLSAxOyBpMisrKXtcbiAgICAgICAgICAgIGNvbnN0IG0yID0gbXNbaTJdO1xuICAgICAgICAgICAgY29uc3QgbU5leHQgPSBtc1tpMiArIDFdO1xuICAgICAgICAgICAgaWYgKG0yICogbU5leHQgPD0gMCkge1xuICAgICAgICAgICAgICAgIGMxcy5wdXNoKDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkeCA9IGR4c1tpMl07XG4gICAgICAgICAgICAgICAgY29uc3QgZHhOZXh0ID0gZHhzW2kyICsgMV07XG4gICAgICAgICAgICAgICAgY29uc3QgY29tbW9uID0gZHggKyBkeE5leHQ7XG4gICAgICAgICAgICAgICAgYzFzLnB1c2goMyAqIGNvbW1vbiAvICgoY29tbW9uICsgZHhOZXh0KSAvIG0yICsgKGNvbW1vbiArIGR4KSAvIG1OZXh0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYzFzLnB1c2gobXNbbXMubGVuZ3RoIC0gMV0pO1xuICAgICAgICAvLyBHZXQgZGVncmVlLTIgYW5kIGRlZ3JlZS0zIGNvZWZmaWNpZW50c1xuICAgICAgICBjb25zdCBjMnMgPSBbXTtcbiAgICAgICAgY29uc3QgYzNzID0gW107XG4gICAgICAgIGxldCBtO1xuICAgICAgICBmb3IobGV0IGkzID0gMDsgaTMgPCBjMXMubGVuZ3RoIC0gMTsgaTMrKyl7XG4gICAgICAgICAgICBtID0gbXNbaTNdO1xuICAgICAgICAgICAgY29uc3QgYzEgPSBjMXNbaTNdO1xuICAgICAgICAgICAgY29uc3QgaW52RHggPSAxIC8gZHhzW2kzXTtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1vbiA9IGMxICsgYzFzW2kzICsgMV0gLSBtIC0gbTtcbiAgICAgICAgICAgIGMycy5wdXNoKChtIC0gYzEgLSBjb21tb24pICogaW52RHgpO1xuICAgICAgICAgICAgYzNzLnB1c2goY29tbW9uICogaW52RHggKiBpbnZEeCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy54cyA9IHhzO1xuICAgICAgICB0aGlzLnlzID0geXM7XG4gICAgICAgIHRoaXMuYzFzID0gYzFzO1xuICAgICAgICB0aGlzLmMycyA9IGMycztcbiAgICAgICAgdGhpcy5jM3MgPSBjM3M7XG4gICAgfVxufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1Nb25vdG9uaWNJbnRlcnBvbGFudC5qcy5tYXAiLCJpbXBvcnQgeyBpc0ZpcmVmb3gsIGlzU2FmYXJpIH0gZnJvbSAnLi9Ccm93c2VyRGV0ZWN0b3IuanMnO1xuaW1wb3J0IHsgTW9ub3RvbmljSW50ZXJwb2xhbnQgfSBmcm9tICcuL01vbm90b25pY0ludGVycG9sYW50LmpzJztcbmNvbnN0IEVMRU1FTlRfTk9ERSA9IDE7XG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm9kZUNsaWVudE9mZnNldChub2RlKSB7XG4gICAgY29uc3QgZWwgPSBub2RlLm5vZGVUeXBlID09PSBFTEVNRU5UX05PREUgPyBub2RlIDogbm9kZS5wYXJlbnRFbGVtZW50O1xuICAgIGlmICghZWwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHsgdG9wICwgbGVmdCAgfSA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IGxlZnQsXG4gICAgICAgIHk6IHRvcFxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0RXZlbnRDbGllbnRPZmZzZXQoZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IGUuY2xpZW50WCxcbiAgICAgICAgeTogZS5jbGllbnRZXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGlzSW1hZ2VOb2RlKG5vZGUpIHtcbiAgICB2YXIgcmVmO1xuICAgIHJldHVybiBub2RlLm5vZGVOYW1lID09PSAnSU1HJyAmJiAoaXNGaXJlZm94KCkgfHwgISgocmVmID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KSA9PT0gbnVsbCB8fCByZWYgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHJlZi5jb250YWlucyhub2RlKSkpO1xufVxuZnVuY3Rpb24gZ2V0RHJhZ1ByZXZpZXdTaXplKGlzSW1hZ2UsIGRyYWdQcmV2aWV3LCBzb3VyY2VXaWR0aCwgc291cmNlSGVpZ2h0KSB7XG4gICAgbGV0IGRyYWdQcmV2aWV3V2lkdGggPSBpc0ltYWdlID8gZHJhZ1ByZXZpZXcud2lkdGggOiBzb3VyY2VXaWR0aDtcbiAgICBsZXQgZHJhZ1ByZXZpZXdIZWlnaHQgPSBpc0ltYWdlID8gZHJhZ1ByZXZpZXcuaGVpZ2h0IDogc291cmNlSGVpZ2h0O1xuICAgIC8vIFdvcmsgYXJvdW5kIEAyeCBjb29yZGluYXRlIGRpc2NyZXBhbmNpZXMgaW4gYnJvd3NlcnNcbiAgICBpZiAoaXNTYWZhcmkoKSAmJiBpc0ltYWdlKSB7XG4gICAgICAgIGRyYWdQcmV2aWV3SGVpZ2h0IC89IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICBkcmFnUHJldmlld1dpZHRoIC89IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBkcmFnUHJldmlld1dpZHRoLFxuICAgICAgICBkcmFnUHJldmlld0hlaWdodFxuICAgIH07XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0RHJhZ1ByZXZpZXdPZmZzZXQoc291cmNlTm9kZSwgZHJhZ1ByZXZpZXcsIGNsaWVudE9mZnNldCwgYW5jaG9yUG9pbnQsIG9mZnNldFBvaW50KSB7XG4gICAgLy8gVGhlIGJyb3dzZXJzIHdpbGwgdXNlIHRoZSBpbWFnZSBpbnRyaW5zaWMgc2l6ZSB1bmRlciBkaWZmZXJlbnQgY29uZGl0aW9ucy5cbiAgICAvLyBGaXJlZm94IG9ubHkgY2FyZXMgaWYgaXQncyBhbiBpbWFnZSwgYnV0IFdlYktpdCBhbHNvIHdhbnRzIGl0IHRvIGJlIGRldGFjaGVkLlxuICAgIGNvbnN0IGlzSW1hZ2UgPSBpc0ltYWdlTm9kZShkcmFnUHJldmlldyk7XG4gICAgY29uc3QgZHJhZ1ByZXZpZXdOb2RlID0gaXNJbWFnZSA/IHNvdXJjZU5vZGUgOiBkcmFnUHJldmlldztcbiAgICBjb25zdCBkcmFnUHJldmlld05vZGVPZmZzZXRGcm9tQ2xpZW50ID0gZ2V0Tm9kZUNsaWVudE9mZnNldChkcmFnUHJldmlld05vZGUpO1xuICAgIGNvbnN0IG9mZnNldEZyb21EcmFnUHJldmlldyA9IHtcbiAgICAgICAgeDogY2xpZW50T2Zmc2V0LnggLSBkcmFnUHJldmlld05vZGVPZmZzZXRGcm9tQ2xpZW50LngsXG4gICAgICAgIHk6IGNsaWVudE9mZnNldC55IC0gZHJhZ1ByZXZpZXdOb2RlT2Zmc2V0RnJvbUNsaWVudC55XG4gICAgfTtcbiAgICBjb25zdCB7IG9mZnNldFdpZHRoOiBzb3VyY2VXaWR0aCAsIG9mZnNldEhlaWdodDogc291cmNlSGVpZ2h0ICB9ID0gc291cmNlTm9kZTtcbiAgICBjb25zdCB7IGFuY2hvclggLCBhbmNob3JZICB9ID0gYW5jaG9yUG9pbnQ7XG4gICAgY29uc3QgeyBkcmFnUHJldmlld1dpZHRoICwgZHJhZ1ByZXZpZXdIZWlnaHQgIH0gPSBnZXREcmFnUHJldmlld1NpemUoaXNJbWFnZSwgZHJhZ1ByZXZpZXcsIHNvdXJjZVdpZHRoLCBzb3VyY2VIZWlnaHQpO1xuICAgIGNvbnN0IGNhbGN1bGF0ZVlPZmZzZXQgPSAoKT0+e1xuICAgICAgICBjb25zdCBpbnRlcnBvbGFudFkgPSBuZXcgTW9ub3RvbmljSW50ZXJwb2xhbnQoW1xuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDFcbiAgICAgICAgXSwgW1xuICAgICAgICAgICAgLy8gRG9jayB0byB0aGUgdG9wXG4gICAgICAgICAgICBvZmZzZXRGcm9tRHJhZ1ByZXZpZXcueSxcbiAgICAgICAgICAgIC8vIEFsaWduIGF0IHRoZSBjZW50ZXJcbiAgICAgICAgICAgIChvZmZzZXRGcm9tRHJhZ1ByZXZpZXcueSAvIHNvdXJjZUhlaWdodCkgKiBkcmFnUHJldmlld0hlaWdodCxcbiAgICAgICAgICAgIC8vIERvY2sgdG8gdGhlIGJvdHRvbVxuICAgICAgICAgICAgb2Zmc2V0RnJvbURyYWdQcmV2aWV3LnkgKyBkcmFnUHJldmlld0hlaWdodCAtIHNvdXJjZUhlaWdodCwgXG4gICAgICAgIF0pO1xuICAgICAgICBsZXQgeSA9IGludGVycG9sYW50WS5pbnRlcnBvbGF0ZShhbmNob3JZKTtcbiAgICAgICAgLy8gV29yayBhcm91bmQgU2FmYXJpIDggcG9zaXRpb25pbmcgYnVnXG4gICAgICAgIGlmIChpc1NhZmFyaSgpICYmIGlzSW1hZ2UpIHtcbiAgICAgICAgICAgIC8vIFdlJ2xsIGhhdmUgdG8gd2FpdCBmb3IgQDN4IHRvIHNlZSBpZiB0aGlzIGlzIGVudGlyZWx5IGNvcnJlY3RcbiAgICAgICAgICAgIHkgKz0gKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIC0gMSkgKiBkcmFnUHJldmlld0hlaWdodDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geTtcbiAgICB9O1xuICAgIGNvbnN0IGNhbGN1bGF0ZVhPZmZzZXQgPSAoKT0+e1xuICAgICAgICAvLyBJbnRlcnBvbGF0ZSBjb29yZGluYXRlcyBkZXBlbmRpbmcgb24gYW5jaG9yIHBvaW50XG4gICAgICAgIC8vIElmIHlvdSBrbm93IGEgc2ltcGxlciB3YXkgdG8gZG8gdGhpcywgbGV0IG1lIGtub3dcbiAgICAgICAgY29uc3QgaW50ZXJwb2xhbnRYID0gbmV3IE1vbm90b25pY0ludGVycG9sYW50KFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAxXG4gICAgICAgIF0sIFtcbiAgICAgICAgICAgIC8vIERvY2sgdG8gdGhlIGxlZnRcbiAgICAgICAgICAgIG9mZnNldEZyb21EcmFnUHJldmlldy54LFxuICAgICAgICAgICAgLy8gQWxpZ24gYXQgdGhlIGNlbnRlclxuICAgICAgICAgICAgKG9mZnNldEZyb21EcmFnUHJldmlldy54IC8gc291cmNlV2lkdGgpICogZHJhZ1ByZXZpZXdXaWR0aCxcbiAgICAgICAgICAgIC8vIERvY2sgdG8gdGhlIHJpZ2h0XG4gICAgICAgICAgICBvZmZzZXRGcm9tRHJhZ1ByZXZpZXcueCArIGRyYWdQcmV2aWV3V2lkdGggLSBzb3VyY2VXaWR0aCwgXG4gICAgICAgIF0pO1xuICAgICAgICByZXR1cm4gaW50ZXJwb2xhbnRYLmludGVycG9sYXRlKGFuY2hvclgpO1xuICAgIH07XG4gICAgLy8gRm9yY2Ugb2Zmc2V0cyBpZiBzcGVjaWZpZWQgaW4gdGhlIG9wdGlvbnMuXG4gICAgY29uc3QgeyBvZmZzZXRYICwgb2Zmc2V0WSAgfSA9IG9mZnNldFBvaW50O1xuICAgIGNvbnN0IGlzTWFudWFsT2Zmc2V0WCA9IG9mZnNldFggPT09IDAgfHwgb2Zmc2V0WDtcbiAgICBjb25zdCBpc01hbnVhbE9mZnNldFkgPSBvZmZzZXRZID09PSAwIHx8IG9mZnNldFk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogaXNNYW51YWxPZmZzZXRYID8gb2Zmc2V0WCA6IGNhbGN1bGF0ZVhPZmZzZXQoKSxcbiAgICAgICAgeTogaXNNYW51YWxPZmZzZXRZID8gb2Zmc2V0WSA6IGNhbGN1bGF0ZVlPZmZzZXQoKVxuICAgIH07XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU9mZnNldFV0aWxzLmpzLm1hcCIsImV4cG9ydCBjbGFzcyBPcHRpb25zUmVhZGVyIHtcbiAgICBnZXQgd2luZG93KCkge1xuICAgICAgICBpZiAodGhpcy5nbG9iYWxDb250ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nbG9iYWxDb250ZXh0O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gd2luZG93O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGdldCBkb2N1bWVudCgpIHtcbiAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgaWYgKChyZWYgPSB0aGlzLmdsb2JhbENvbnRleHQpID09PSBudWxsIHx8IHJlZiA9PT0gdm9pZCAwID8gdm9pZCAwIDogcmVmLmRvY3VtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nbG9iYWxDb250ZXh0LmRvY3VtZW50O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMud2luZG93KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy53aW5kb3cuZG9jdW1lbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCByb290RWxlbWVudCgpIHtcbiAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgcmV0dXJuICgocmVmID0gdGhpcy5vcHRpb25zQXJncykgPT09IG51bGwgfHwgcmVmID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZWYucm9vdEVsZW1lbnQpIHx8IHRoaXMud2luZG93O1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihnbG9iYWxDb250ZXh0LCBvcHRpb25zKXtcbiAgICAgICAgdGhpcy5vd25lckRvY3VtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5nbG9iYWxDb250ZXh0ID0gZ2xvYmFsQ29udGV4dDtcbiAgICAgICAgdGhpcy5vcHRpb25zQXJncyA9IG9wdGlvbnM7XG4gICAgfVxufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1PcHRpb25zUmVhZGVyLmpzLm1hcCIsImZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHtcbiAgICBpZiAoa2V5IGluIG9iaikge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBvYmpba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xufVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHtcbiAgICBmb3IodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307XG4gICAgICAgIHZhciBvd25LZXlzID0gT2JqZWN0LmtleXMoc291cmNlKTtcbiAgICAgICAgaWYgKHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBvd25LZXlzID0gb3duS2V5cy5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzb3VyY2UpLmZpbHRlcihmdW5jdGlvbihzeW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIHN5bSkuZW51bWVyYWJsZTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuICAgICAgICBvd25LZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBfZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5pbXBvcnQgeyBFbnRlckxlYXZlQ291bnRlciB9IGZyb20gJy4vRW50ZXJMZWF2ZUNvdW50ZXIuanMnO1xuaW1wb3J0IHsgY3JlYXRlTmF0aXZlRHJhZ1NvdXJjZSwgbWF0Y2hOYXRpdmVJdGVtVHlwZSB9IGZyb20gJy4vTmF0aXZlRHJhZ1NvdXJjZXMvaW5kZXguanMnO1xuaW1wb3J0ICogYXMgTmF0aXZlVHlwZXMgZnJvbSAnLi9OYXRpdmVUeXBlcy5qcyc7XG5pbXBvcnQgeyBnZXREcmFnUHJldmlld09mZnNldCwgZ2V0RXZlbnRDbGllbnRPZmZzZXQsIGdldE5vZGVDbGllbnRPZmZzZXQgfSBmcm9tICcuL09mZnNldFV0aWxzLmpzJztcbmltcG9ydCB7IE9wdGlvbnNSZWFkZXIgfSBmcm9tICcuL09wdGlvbnNSZWFkZXIuanMnO1xuZXhwb3J0IGNsYXNzIEhUTUw1QmFja2VuZEltcGwge1xuICAgIC8qKlxuXHQgKiBHZW5lcmF0ZSBwcm9maWxpbmcgc3RhdGlzdGljcyBmb3IgdGhlIEhUTUw1QmFja2VuZC5cblx0ICovIHByb2ZpbGUoKSB7XG4gICAgICAgIHZhciByZWYsIHJlZjE7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzb3VyY2VQcmV2aWV3Tm9kZXM6IHRoaXMuc291cmNlUHJldmlld05vZGVzLnNpemUsXG4gICAgICAgICAgICBzb3VyY2VQcmV2aWV3Tm9kZU9wdGlvbnM6IHRoaXMuc291cmNlUHJldmlld05vZGVPcHRpb25zLnNpemUsXG4gICAgICAgICAgICBzb3VyY2VOb2RlT3B0aW9uczogdGhpcy5zb3VyY2VOb2RlT3B0aW9ucy5zaXplLFxuICAgICAgICAgICAgc291cmNlTm9kZXM6IHRoaXMuc291cmNlTm9kZXMuc2l6ZSxcbiAgICAgICAgICAgIGRyYWdTdGFydFNvdXJjZUlkczogKChyZWYgPSB0aGlzLmRyYWdTdGFydFNvdXJjZUlkcykgPT09IG51bGwgfHwgcmVmID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZWYubGVuZ3RoKSB8fCAwLFxuICAgICAgICAgICAgZHJvcFRhcmdldElkczogdGhpcy5kcm9wVGFyZ2V0SWRzLmxlbmd0aCxcbiAgICAgICAgICAgIGRyYWdFbnRlclRhcmdldElkczogdGhpcy5kcmFnRW50ZXJUYXJnZXRJZHMubGVuZ3RoLFxuICAgICAgICAgICAgZHJhZ092ZXJUYXJnZXRJZHM6ICgocmVmMSA9IHRoaXMuZHJhZ092ZXJUYXJnZXRJZHMpID09PSBudWxsIHx8IHJlZjEgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHJlZjEubGVuZ3RoKSB8fCAwXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIHB1YmxpYyBmb3IgdGVzdFxuICAgIGdldCB3aW5kb3coKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMud2luZG93O1xuICAgIH1cbiAgICBnZXQgZG9jdW1lbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuZG9jdW1lbnQ7XG4gICAgfVxuICAgIC8qKlxuXHQgKiBHZXQgdGhlIHJvb3QgZWxlbWVudCB0byB1c2UgZm9yIGV2ZW50IHN1YnNjcmlwdGlvbnNcblx0ICovIGdldCByb290RWxlbWVudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5yb290RWxlbWVudDtcbiAgICB9XG4gICAgc2V0dXAoKSB7XG4gICAgICAgIGNvbnN0IHJvb3QgPSB0aGlzLnJvb3RFbGVtZW50O1xuICAgICAgICBpZiAocm9vdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJvb3QuX19pc1JlYWN0RG5kQmFja2VuZFNldFVwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBoYXZlIHR3byBIVE1MNSBiYWNrZW5kcyBhdCB0aGUgc2FtZSB0aW1lLicpO1xuICAgICAgICB9XG4gICAgICAgIHJvb3QuX19pc1JlYWN0RG5kQmFja2VuZFNldFVwID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVycyhyb290KTtcbiAgICB9XG4gICAgdGVhcmRvd24oKSB7XG4gICAgICAgIGNvbnN0IHJvb3QgPSB0aGlzLnJvb3RFbGVtZW50O1xuICAgICAgICBpZiAocm9vdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcm9vdC5fX2lzUmVhY3REbmRCYWNrZW5kU2V0VXAgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVycyh0aGlzLnJvb3RFbGVtZW50KTtcbiAgICAgICAgdGhpcy5jbGVhckN1cnJlbnREcmFnU291cmNlTm9kZSgpO1xuICAgICAgICBpZiAodGhpcy5hc3luY0VuZERyYWdGcmFtZUlkKSB7XG4gICAgICAgICAgICB2YXIgcmVmO1xuICAgICAgICAgICAgKHJlZiA9IHRoaXMud2luZG93KSA9PT0gbnVsbCB8fCByZWYgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHJlZi5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmFzeW5jRW5kRHJhZ0ZyYW1lSWQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbm5lY3REcmFnUHJldmlldyhzb3VyY2VJZCwgbm9kZSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLnNvdXJjZVByZXZpZXdOb2RlT3B0aW9ucy5zZXQoc291cmNlSWQsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLnNvdXJjZVByZXZpZXdOb2Rlcy5zZXQoc291cmNlSWQsIG5vZGUpO1xuICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgIHRoaXMuc291cmNlUHJldmlld05vZGVzLmRlbGV0ZShzb3VyY2VJZCk7XG4gICAgICAgICAgICB0aGlzLnNvdXJjZVByZXZpZXdOb2RlT3B0aW9ucy5kZWxldGUoc291cmNlSWQpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBjb25uZWN0RHJhZ1NvdXJjZShzb3VyY2VJZCwgbm9kZSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLnNvdXJjZU5vZGVzLnNldChzb3VyY2VJZCwgbm9kZSk7XG4gICAgICAgIHRoaXMuc291cmNlTm9kZU9wdGlvbnMuc2V0KHNvdXJjZUlkLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgaGFuZGxlRHJhZ1N0YXJ0ID0gKGUpPT50aGlzLmhhbmRsZURyYWdTdGFydChlLCBzb3VyY2VJZClcbiAgICAgICAgO1xuICAgICAgICBjb25zdCBoYW5kbGVTZWxlY3RTdGFydCA9IChlKT0+dGhpcy5oYW5kbGVTZWxlY3RTdGFydChlKVxuICAgICAgICA7XG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCAndHJ1ZScpO1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIGhhbmRsZURyYWdTdGFydCk7XG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignc2VsZWN0c3RhcnQnLCBoYW5kbGVTZWxlY3RTdGFydCk7XG4gICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgdGhpcy5zb3VyY2VOb2Rlcy5kZWxldGUoc291cmNlSWQpO1xuICAgICAgICAgICAgdGhpcy5zb3VyY2VOb2RlT3B0aW9ucy5kZWxldGUoc291cmNlSWQpO1xuICAgICAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCBoYW5kbGVEcmFnU3RhcnQpO1xuICAgICAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdzZWxlY3RzdGFydCcsIGhhbmRsZVNlbGVjdFN0YXJ0KTtcbiAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKCdkcmFnZ2FibGUnLCAnZmFsc2UnKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY29ubmVjdERyb3BUYXJnZXQodGFyZ2V0SWQsIG5vZGUpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlRHJhZ0VudGVyID0gKGUpPT50aGlzLmhhbmRsZURyYWdFbnRlcihlLCB0YXJnZXRJZClcbiAgICAgICAgO1xuICAgICAgICBjb25zdCBoYW5kbGVEcmFnT3ZlciA9IChlKT0+dGhpcy5oYW5kbGVEcmFnT3ZlcihlLCB0YXJnZXRJZClcbiAgICAgICAgO1xuICAgICAgICBjb25zdCBoYW5kbGVEcm9wID0gKGUpPT50aGlzLmhhbmRsZURyb3AoZSwgdGFyZ2V0SWQpXG4gICAgICAgIDtcbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCBoYW5kbGVEcmFnRW50ZXIpO1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgaGFuZGxlRHJhZ092ZXIpO1xuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCBoYW5kbGVEcm9wKTtcbiAgICAgICAgcmV0dXJuICgpPT57XG4gICAgICAgICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIGhhbmRsZURyYWdFbnRlcik7XG4gICAgICAgICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgaGFuZGxlRHJhZ092ZXIpO1xuICAgICAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgaGFuZGxlRHJvcCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGFkZEV2ZW50TGlzdGVuZXJzKHRhcmdldCkge1xuICAgICAgICAvLyBTU1IgRml4IChodHRwczovL2dpdGh1Yi5jb20vcmVhY3QtZG5kL3JlYWN0LWRuZC9wdWxsLzgxM1xuICAgICAgICBpZiAoIXRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuaGFuZGxlVG9wRHJhZ1N0YXJ0KTtcbiAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuaGFuZGxlVG9wRHJhZ1N0YXJ0Q2FwdHVyZSwgdHJ1ZSk7XG4gICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW5kJywgdGhpcy5oYW5kbGVUb3BEcmFnRW5kQ2FwdHVyZSwgdHJ1ZSk7XG4gICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCB0aGlzLmhhbmRsZVRvcERyYWdFbnRlcik7XG4gICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW50ZXInLCB0aGlzLmhhbmRsZVRvcERyYWdFbnRlckNhcHR1cmUsIHRydWUpO1xuICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2xlYXZlJywgdGhpcy5oYW5kbGVUb3BEcmFnTGVhdmVDYXB0dXJlLCB0cnVlKTtcbiAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5oYW5kbGVUb3BEcmFnT3Zlcik7XG4gICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuaGFuZGxlVG9wRHJhZ092ZXJDYXB0dXJlLCB0cnVlKTtcbiAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmhhbmRsZVRvcERyb3ApO1xuICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuaGFuZGxlVG9wRHJvcENhcHR1cmUsIHRydWUpO1xuICAgIH1cbiAgICByZW1vdmVFdmVudExpc3RlbmVycyh0YXJnZXQpIHtcbiAgICAgICAgLy8gU1NSIEZpeCAoaHR0cHM6Ly9naXRodWIuY29tL3JlYWN0LWRuZC9yZWFjdC1kbmQvcHVsbC84MTNcbiAgICAgICAgaWYgKCF0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCB0aGlzLmhhbmRsZVRvcERyYWdTdGFydCk7XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCB0aGlzLmhhbmRsZVRvcERyYWdTdGFydENhcHR1cmUsIHRydWUpO1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIHRoaXMuaGFuZGxlVG9wRHJhZ0VuZENhcHR1cmUsIHRydWUpO1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ2VudGVyJywgdGhpcy5oYW5kbGVUb3BEcmFnRW50ZXIpO1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ2VudGVyJywgdGhpcy5oYW5kbGVUb3BEcmFnRW50ZXJDYXB0dXJlLCB0cnVlKTtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIHRoaXMuaGFuZGxlVG9wRHJhZ0xlYXZlQ2FwdHVyZSwgdHJ1ZSk7XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuaGFuZGxlVG9wRHJhZ092ZXIpO1xuICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLmhhbmRsZVRvcERyYWdPdmVyQ2FwdHVyZSwgdHJ1ZSk7XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5oYW5kbGVUb3BEcm9wKTtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLmhhbmRsZVRvcERyb3BDYXB0dXJlLCB0cnVlKTtcbiAgICB9XG4gICAgZ2V0Q3VycmVudFNvdXJjZU5vZGVPcHRpb25zKCkge1xuICAgICAgICBjb25zdCBzb3VyY2VJZCA9IHRoaXMubW9uaXRvci5nZXRTb3VyY2VJZCgpO1xuICAgICAgICBjb25zdCBzb3VyY2VOb2RlT3B0aW9ucyA9IHRoaXMuc291cmNlTm9kZU9wdGlvbnMuZ2V0KHNvdXJjZUlkKTtcbiAgICAgICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe1xuICAgICAgICAgICAgZHJvcEVmZmVjdDogdGhpcy5hbHRLZXlQcmVzc2VkID8gJ2NvcHknIDogJ21vdmUnXG4gICAgICAgIH0sIHNvdXJjZU5vZGVPcHRpb25zIHx8IHt9KTtcbiAgICB9XG4gICAgZ2V0Q3VycmVudERyb3BFZmZlY3QoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzRHJhZ2dpbmdOYXRpdmVJdGVtKCkpIHtcbiAgICAgICAgICAgIC8vIEl0IG1ha2VzIG1vcmUgc2Vuc2UgdG8gZGVmYXVsdCB0byAnY29weScgZm9yIG5hdGl2ZSByZXNvdXJjZXNcbiAgICAgICAgICAgIHJldHVybiAnY29weSc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFNvdXJjZU5vZGVPcHRpb25zKCkuZHJvcEVmZmVjdDtcbiAgICB9XG4gICAgZ2V0Q3VycmVudFNvdXJjZVByZXZpZXdOb2RlT3B0aW9ucygpIHtcbiAgICAgICAgY29uc3Qgc291cmNlSWQgPSB0aGlzLm1vbml0b3IuZ2V0U291cmNlSWQoKTtcbiAgICAgICAgY29uc3Qgc291cmNlUHJldmlld05vZGVPcHRpb25zID0gdGhpcy5zb3VyY2VQcmV2aWV3Tm9kZU9wdGlvbnMuZ2V0KHNvdXJjZUlkKTtcbiAgICAgICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoe1xuICAgICAgICAgICAgYW5jaG9yWDogMC41LFxuICAgICAgICAgICAgYW5jaG9yWTogMC41LFxuICAgICAgICAgICAgY2FwdHVyZURyYWdnaW5nU3RhdGU6IGZhbHNlXG4gICAgICAgIH0sIHNvdXJjZVByZXZpZXdOb2RlT3B0aW9ucyB8fCB7fSk7XG4gICAgfVxuICAgIGlzRHJhZ2dpbmdOYXRpdmVJdGVtKCkge1xuICAgICAgICBjb25zdCBpdGVtVHlwZSA9IHRoaXMubW9uaXRvci5nZXRJdGVtVHlwZSgpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoTmF0aXZlVHlwZXMpLnNvbWUoKGtleSk9Pk5hdGl2ZVR5cGVzW2tleV0gPT09IGl0ZW1UeXBlXG4gICAgICAgICk7XG4gICAgfVxuICAgIGJlZ2luRHJhZ05hdGl2ZUl0ZW0odHlwZSwgZGF0YVRyYW5zZmVyKSB7XG4gICAgICAgIHRoaXMuY2xlYXJDdXJyZW50RHJhZ1NvdXJjZU5vZGUoKTtcbiAgICAgICAgdGhpcy5jdXJyZW50TmF0aXZlU291cmNlID0gY3JlYXRlTmF0aXZlRHJhZ1NvdXJjZSh0eXBlLCBkYXRhVHJhbnNmZXIpO1xuICAgICAgICB0aGlzLmN1cnJlbnROYXRpdmVIYW5kbGUgPSB0aGlzLnJlZ2lzdHJ5LmFkZFNvdXJjZSh0eXBlLCB0aGlzLmN1cnJlbnROYXRpdmVTb3VyY2UpO1xuICAgICAgICB0aGlzLmFjdGlvbnMuYmVnaW5EcmFnKFtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE5hdGl2ZUhhbmRsZVxuICAgICAgICBdKTtcbiAgICB9XG4gICAgc2V0Q3VycmVudERyYWdTb3VyY2VOb2RlKG5vZGUpIHtcbiAgICAgICAgdGhpcy5jbGVhckN1cnJlbnREcmFnU291cmNlTm9kZSgpO1xuICAgICAgICB0aGlzLmN1cnJlbnREcmFnU291cmNlTm9kZSA9IG5vZGU7XG4gICAgICAgIC8vIEEgdGltZW91dCBvZiA+IDAgaXMgbmVjZXNzYXJ5IHRvIHJlc29sdmUgRmlyZWZveCBpc3N1ZSByZWZlcmVuY2VkXG4gICAgICAgIC8vIFNlZTpcbiAgICAgICAgLy8gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9yZWFjdC1kbmQvcmVhY3QtZG5kL3B1bGwvOTI4XG4gICAgICAgIC8vICAgKiBodHRwczovL2dpdGh1Yi5jb20vcmVhY3QtZG5kL3JlYWN0LWRuZC9pc3N1ZXMvODY5XG4gICAgICAgIGNvbnN0IE1PVVNFX01PVkVfVElNRU9VVCA9IDEwMDA7XG4gICAgICAgIC8vIFJlY2VpdmluZyBhIG1vdXNlIGV2ZW50IGluIHRoZSBtaWRkbGUgb2YgYSBkcmFnZ2luZyBvcGVyYXRpb25cbiAgICAgICAgLy8gbWVhbnMgaXQgaGFzIGVuZGVkIGFuZCB0aGUgZHJhZyBzb3VyY2Ugbm9kZSBkaXNhcHBlYXJlZCBmcm9tIERPTSxcbiAgICAgICAgLy8gc28gdGhlIGJyb3dzZXIgZGlkbid0IGRpc3BhdGNoIHRoZSBkcmFnZW5kIGV2ZW50LlxuICAgICAgICAvL1xuICAgICAgICAvLyBXZSBuZWVkIHRvIHdhaXQgYmVmb3JlIHdlIHN0YXJ0IGxpc3RlbmluZyBmb3IgbW91c2Vtb3ZlIGV2ZW50cy5cbiAgICAgICAgLy8gVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSB0aGUgZHJhZyBwcmV2aWV3IG5lZWRzIHRvIGJlIGRyYXduIG9yIGVsc2UgaXQgZmlyZXMgYW4gJ21vdXNlbW92ZScgZXZlbnRcbiAgICAgICAgLy8gaW1tZWRpYXRlbHkgaW4gc29tZSBicm93c2Vycy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gU2VlOlxuICAgICAgICAvLyAgICogaHR0cHM6Ly9naXRodWIuY29tL3JlYWN0LWRuZC9yZWFjdC1kbmQvcHVsbC85MjhcbiAgICAgICAgLy8gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9yZWFjdC1kbmQvcmVhY3QtZG5kL2lzc3Vlcy84NjlcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5tb3VzZU1vdmVUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpPT57XG4gICAgICAgICAgICB2YXIgcmVmO1xuICAgICAgICAgICAgcmV0dXJuIChyZWYgPSB0aGlzLnJvb3RFbGVtZW50KSA9PT0gbnVsbCB8fCByZWYgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHJlZi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLmVuZERyYWdJZlNvdXJjZVdhc1JlbW92ZWRGcm9tRE9NLCB0cnVlKTtcbiAgICAgICAgfSwgTU9VU0VfTU9WRV9USU1FT1VUKTtcbiAgICB9XG4gICAgY2xlYXJDdXJyZW50RHJhZ1NvdXJjZU5vZGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnREcmFnU291cmNlTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50RHJhZ1NvdXJjZU5vZGUgPSBudWxsO1xuICAgICAgICAgICAgaWYgKHRoaXMucm9vdEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVmO1xuICAgICAgICAgICAgICAgIChyZWYgPSB0aGlzLndpbmRvdykgPT09IG51bGwgfHwgcmVmID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZWYuY2xlYXJUaW1lb3V0KHRoaXMubW91c2VNb3ZlVGltZW91dFRpbWVyIHx8IHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yb290RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLmVuZERyYWdJZlNvdXJjZVdhc1JlbW92ZWRGcm9tRE9NLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubW91c2VNb3ZlVGltZW91dFRpbWVyID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaGFuZGxlRHJhZ1N0YXJ0KGUsIHNvdXJjZUlkKSB7XG4gICAgICAgIGlmIChlLmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuZHJhZ1N0YXJ0U291cmNlSWRzKSB7XG4gICAgICAgICAgICB0aGlzLmRyYWdTdGFydFNvdXJjZUlkcyA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZHJhZ1N0YXJ0U291cmNlSWRzLnVuc2hpZnQoc291cmNlSWQpO1xuICAgIH1cbiAgICBoYW5kbGVEcmFnRW50ZXIoX2UsIHRhcmdldElkKSB7XG4gICAgICAgIHRoaXMuZHJhZ0VudGVyVGFyZ2V0SWRzLnVuc2hpZnQodGFyZ2V0SWQpO1xuICAgIH1cbiAgICBoYW5kbGVEcmFnT3ZlcihfZSwgdGFyZ2V0SWQpIHtcbiAgICAgICAgaWYgKHRoaXMuZHJhZ092ZXJUYXJnZXRJZHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZHJhZ092ZXJUYXJnZXRJZHMgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRyYWdPdmVyVGFyZ2V0SWRzLnVuc2hpZnQodGFyZ2V0SWQpO1xuICAgIH1cbiAgICBoYW5kbGVEcm9wKF9lLCB0YXJnZXRJZCkge1xuICAgICAgICB0aGlzLmRyb3BUYXJnZXRJZHMudW5zaGlmdCh0YXJnZXRJZCk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKG1hbmFnZXIsIGdsb2JhbENvbnRleHQsIG9wdGlvbnMpe1xuICAgICAgICB0aGlzLnNvdXJjZVByZXZpZXdOb2RlcyA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5zb3VyY2VQcmV2aWV3Tm9kZU9wdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuc291cmNlTm9kZXMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuc291cmNlTm9kZU9wdGlvbnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuZHJhZ1N0YXJ0U291cmNlSWRzID0gbnVsbDtcbiAgICAgICAgdGhpcy5kcm9wVGFyZ2V0SWRzID0gW107XG4gICAgICAgIHRoaXMuZHJhZ0VudGVyVGFyZ2V0SWRzID0gW107XG4gICAgICAgIHRoaXMuY3VycmVudE5hdGl2ZVNvdXJjZSA9IG51bGw7XG4gICAgICAgIHRoaXMuY3VycmVudE5hdGl2ZUhhbmRsZSA9IG51bGw7XG4gICAgICAgIHRoaXMuY3VycmVudERyYWdTb3VyY2VOb2RlID0gbnVsbDtcbiAgICAgICAgdGhpcy5hbHRLZXlQcmVzc2VkID0gZmFsc2U7XG4gICAgICAgIHRoaXMubW91c2VNb3ZlVGltZW91dFRpbWVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5hc3luY0VuZERyYWdGcmFtZUlkID0gbnVsbDtcbiAgICAgICAgdGhpcy5kcmFnT3ZlclRhcmdldElkcyA9IG51bGw7XG4gICAgICAgIHRoaXMubGFzdENsaWVudE9mZnNldCA9IG51bGw7XG4gICAgICAgIHRoaXMuaG92ZXJSYWZJZCA9IG51bGw7XG4gICAgICAgIHRoaXMuZ2V0U291cmNlQ2xpZW50T2Zmc2V0ID0gKHNvdXJjZUlkKT0+e1xuICAgICAgICAgICAgY29uc3Qgc291cmNlID0gdGhpcy5zb3VyY2VOb2Rlcy5nZXQoc291cmNlSWQpO1xuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZSAmJiBnZXROb2RlQ2xpZW50T2Zmc2V0KHNvdXJjZSkgfHwgbnVsbDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5lbmREcmFnTmF0aXZlSXRlbSA9ICgpPT57XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNEcmFnZ2luZ05hdGl2ZUl0ZW0oKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYWN0aW9ucy5lbmREcmFnKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50TmF0aXZlSGFuZGxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RyeS5yZW1vdmVTb3VyY2UodGhpcy5jdXJyZW50TmF0aXZlSGFuZGxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3VycmVudE5hdGl2ZUhhbmRsZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnROYXRpdmVTb3VyY2UgPSBudWxsO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmlzTm9kZUluRG9jdW1lbnQgPSAobm9kZSk9PntcbiAgICAgICAgICAgIC8vIENoZWNrIHRoZSBub2RlIGVpdGhlciBpbiB0aGUgbWFpbiBkb2N1bWVudCBvciBpbiB0aGUgY3VycmVudCBjb250ZXh0XG4gICAgICAgICAgICByZXR1cm4gQm9vbGVhbihub2RlICYmIHRoaXMuZG9jdW1lbnQgJiYgdGhpcy5kb2N1bWVudC5ib2R5ICYmIHRoaXMuZG9jdW1lbnQuYm9keS5jb250YWlucyhub2RlKSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZW5kRHJhZ0lmU291cmNlV2FzUmVtb3ZlZEZyb21ET00gPSAoKT0+e1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuY3VycmVudERyYWdTb3VyY2VOb2RlO1xuICAgICAgICAgICAgaWYgKG5vZGUgPT0gbnVsbCB8fCB0aGlzLmlzTm9kZUluRG9jdW1lbnQobm9kZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5jbGVhckN1cnJlbnREcmFnU291cmNlTm9kZSgpICYmIHRoaXMubW9uaXRvci5pc0RyYWdnaW5nKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGlvbnMuZW5kRHJhZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jYW5jZWxIb3ZlcigpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNjaGVkdWxlSG92ZXIgPSAoZHJhZ092ZXJUYXJnZXRJZHMpPT57XG4gICAgICAgICAgICBpZiAodGhpcy5ob3ZlclJhZklkID09PSBudWxsICYmIHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ob3ZlclJhZklkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpPT57XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vbml0b3IuaXNEcmFnZ2luZygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGlvbnMuaG92ZXIoZHJhZ092ZXJUYXJnZXRJZHMgfHwgW10sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGllbnRPZmZzZXQ6IHRoaXMubGFzdENsaWVudE9mZnNldFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3ZlclJhZklkID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jYW5jZWxIb3ZlciA9ICgpPT57XG4gICAgICAgICAgICBpZiAodGhpcy5ob3ZlclJhZklkICE9PSBudWxsICYmIHR5cGVvZiBjYW5jZWxBbmltYXRpb25GcmFtZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmhvdmVyUmFmSWQpO1xuICAgICAgICAgICAgICAgIHRoaXMuaG92ZXJSYWZJZCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlVG9wRHJhZ1N0YXJ0Q2FwdHVyZSA9ICgpPT57XG4gICAgICAgICAgICB0aGlzLmNsZWFyQ3VycmVudERyYWdTb3VyY2VOb2RlKCk7XG4gICAgICAgICAgICB0aGlzLmRyYWdTdGFydFNvdXJjZUlkcyA9IFtdO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZVRvcERyYWdTdGFydCA9IChlKT0+e1xuICAgICAgICAgICAgaWYgKGUuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHsgZHJhZ1N0YXJ0U291cmNlSWRzICB9ID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuZHJhZ1N0YXJ0U291cmNlSWRzID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGNsaWVudE9mZnNldCA9IGdldEV2ZW50Q2xpZW50T2Zmc2V0KGUpO1xuICAgICAgICAgICAgLy8gQXZvaWQgY3Jhc2hpbmcgaWYgd2UgbWlzc2VkIGEgZHJvcCBldmVudCBvciBvdXIgcHJldmlvdXMgZHJhZyBkaWVkXG4gICAgICAgICAgICBpZiAodGhpcy5tb25pdG9yLmlzRHJhZ2dpbmcoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW9ucy5lbmREcmFnKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW5jZWxIb3ZlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRG9uJ3QgcHVibGlzaCB0aGUgc291cmNlIGp1c3QgeWV0IChzZWUgd2h5IGJlbG93KVxuICAgICAgICAgICAgdGhpcy5hY3Rpb25zLmJlZ2luRHJhZyhkcmFnU3RhcnRTb3VyY2VJZHMgfHwgW10sIHtcbiAgICAgICAgICAgICAgICBwdWJsaXNoU291cmNlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBnZXRTb3VyY2VDbGllbnRPZmZzZXQ6IHRoaXMuZ2V0U291cmNlQ2xpZW50T2Zmc2V0LFxuICAgICAgICAgICAgICAgIGNsaWVudE9mZnNldFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCB7IGRhdGFUcmFuc2ZlciAgfSA9IGU7XG4gICAgICAgICAgICBjb25zdCBuYXRpdmVUeXBlID0gbWF0Y2hOYXRpdmVJdGVtVHlwZShkYXRhVHJhbnNmZXIpO1xuICAgICAgICAgICAgaWYgKHRoaXMubW9uaXRvci5pc0RyYWdnaW5nKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YVRyYW5zZmVyICYmIHR5cGVvZiBkYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZSBjdXN0b20gZHJhZyBpbWFnZSBpZiB1c2VyIHNwZWNpZmllcyBpdC5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgY2hpbGQgZHJhZyBzb3VyY2UgcmVmdXNlcyBkcmFnIGJ1dCBwYXJlbnQgYWdyZWVzLFxuICAgICAgICAgICAgICAgICAgICAvLyB1c2UgcGFyZW50J3Mgbm9kZSBhcyBkcmFnIGltYWdlLiBOZWl0aGVyIHdvcmtzIGluIElFIHRob3VnaC5cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc291cmNlSWQgPSB0aGlzLm1vbml0b3IuZ2V0U291cmNlSWQoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc291cmNlTm9kZSA9IHRoaXMuc291cmNlTm9kZXMuZ2V0KHNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZHJhZ1ByZXZpZXcgPSB0aGlzLnNvdXJjZVByZXZpZXdOb2Rlcy5nZXQoc291cmNlSWQpIHx8IHNvdXJjZU5vZGU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkcmFnUHJldmlldykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBhbmNob3JYICwgYW5jaG9yWSAsIG9mZnNldFggLCBvZmZzZXRZICB9ID0gdGhpcy5nZXRDdXJyZW50U291cmNlUHJldmlld05vZGVPcHRpb25zKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhbmNob3JQb2ludCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmNob3JYLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuY2hvcllcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvZmZzZXRQb2ludCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXRYLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldFlcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkcmFnUHJldmlld09mZnNldCA9IGdldERyYWdQcmV2aWV3T2Zmc2V0KHNvdXJjZU5vZGUsIGRyYWdQcmV2aWV3LCBjbGllbnRPZmZzZXQsIGFuY2hvclBvaW50LCBvZmZzZXRQb2ludCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhVHJhbnNmZXIuc2V0RHJhZ0ltYWdlKGRyYWdQcmV2aWV3LCBkcmFnUHJldmlld09mZnNldC54LCBkcmFnUHJldmlld09mZnNldC55KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAvLyBGaXJlZm94IHdvbid0IGRyYWcgd2l0aG91dCBzZXR0aW5nIGRhdGFcbiAgICAgICAgICAgICAgICAgICAgZGF0YVRyYW5zZmVyID09PSBudWxsIHx8IGRhdGFUcmFuc2ZlciA9PT0gdm9pZCAwID8gdm9pZCAwIDogZGF0YVRyYW5zZmVyLnNldERhdGEoJ2FwcGxpY2F0aW9uL2pzb24nLCB7fSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgLy8gSUUgZG9lc24ndCBzdXBwb3J0IE1JTUUgdHlwZXMgaW4gc2V0RGF0YVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBTdG9yZSBkcmFnIHNvdXJjZSBub2RlIHNvIHdlIGNhbiBjaGVjayB3aGV0aGVyXG4gICAgICAgICAgICAgICAgLy8gaXQgaXMgcmVtb3ZlZCBmcm9tIERPTSBhbmQgdHJpZ2dlciBlbmREcmFnIG1hbnVhbGx5LlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0Q3VycmVudERyYWdTb3VyY2VOb2RlKGUudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAvLyBOb3cgd2UgYXJlIHJlYWR5IHRvIHB1Ymxpc2ggdGhlIGRyYWcgc291cmNlLi4gb3IgYXJlIHdlIG5vdD9cbiAgICAgICAgICAgICAgICBjb25zdCB7IGNhcHR1cmVEcmFnZ2luZ1N0YXRlICB9ID0gdGhpcy5nZXRDdXJyZW50U291cmNlUHJldmlld05vZGVPcHRpb25zKCk7XG4gICAgICAgICAgICAgICAgaWYgKCFjYXB0dXJlRHJhZ2dpbmdTdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBVc3VhbGx5IHdlIHdhbnQgdG8gcHVibGlzaCBpdCBpbiB0aGUgbmV4dCB0aWNrIHNvIHRoYXQgYnJvd3NlclxuICAgICAgICAgICAgICAgICAgICAvLyBpcyBhYmxlIHRvIHNjcmVlbnNob3QgdGhlIGN1cnJlbnQgKG5vdCB5ZXQgZHJhZ2dpbmcpIHN0YXRlLlxuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyBJdCBhbHNvIG5lYXRseSBhdm9pZHMgYSBzaXR1YXRpb24gd2hlcmUgcmVuZGVyKCkgcmV0dXJucyBudWxsXG4gICAgICAgICAgICAgICAgICAgIC8vIGluIHRoZSBzYW1lIHRpY2sgZm9yIHRoZSBzb3VyY2UgZWxlbWVudCwgYW5kIGJyb3dzZXIgZnJlYWtzIG91dC5cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+dGhpcy5hY3Rpb25zLnB1Ymxpc2hEcmFnU291cmNlKClcbiAgICAgICAgICAgICAgICAgICAgLCAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBJbiBzb21lIGNhc2VzIHRoZSB1c2VyIG1heSB3YW50IHRvIG92ZXJyaWRlIHRoaXMgYmVoYXZpb3IsIGUuZy5cbiAgICAgICAgICAgICAgICAgICAgLy8gdG8gd29yayBhcm91bmQgSUUgbm90IHN1cHBvcnRpbmcgY3VzdG9tIGRyYWcgcHJldmlld3MuXG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIC8vIFdoZW4gdXNpbmcgYSBjdXN0b20gZHJhZyBsYXllciwgdGhlIG9ubHkgd2F5IHRvIHByZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGRlZmF1bHQgZHJhZyBwcmV2aWV3IGZyb20gZHJhd2luZyBpbiBJRSBpcyB0byBzY3JlZW5zaG90XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSBkcmFnZ2luZyBzdGF0ZSBpbiB3aGljaCB0aGUgbm9kZSBpdHNlbGYgaGFzIHplcm8gb3BhY2l0eVxuICAgICAgICAgICAgICAgICAgICAvLyBhbmQgaGVpZ2h0LiBJbiB0aGlzIGNhc2UsIHRob3VnaCwgcmV0dXJuaW5nIG51bGwgZnJvbSByZW5kZXIoKVxuICAgICAgICAgICAgICAgICAgICAvLyB3aWxsIGFicnVwdGx5IGVuZCB0aGUgZHJhZ2dpbmcsIHdoaWNoIGlzIG5vdCBvYnZpb3VzLlxuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSByZWFzb24gc3VjaCBiZWhhdmlvciBpcyBzdHJpY3RseSBvcHQtaW4uXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aW9ucy5wdWJsaXNoRHJhZ1NvdXJjZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmF0aXZlVHlwZSkge1xuICAgICAgICAgICAgICAgIC8vIEEgbmF0aXZlIGl0ZW0gKHN1Y2ggYXMgVVJMKSBkcmFnZ2VkIGZyb20gaW5zaWRlIHRoZSBkb2N1bWVudFxuICAgICAgICAgICAgICAgIHRoaXMuYmVnaW5EcmFnTmF0aXZlSXRlbShuYXRpdmVUeXBlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YVRyYW5zZmVyICYmICFkYXRhVHJhbnNmZXIudHlwZXMgJiYgKGUudGFyZ2V0ICYmICFlLnRhcmdldC5oYXNBdHRyaWJ1dGUgfHwgIWUudGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZHJhZ2dhYmxlJykpKSB7XG4gICAgICAgICAgICAgICAgLy8gTG9va3MgbGlrZSBhIFNhZmFyaSBidWc6IGRhdGFUcmFuc2Zlci50eXBlcyBpcyBudWxsLCBidXQgdGhlcmUgd2FzIG5vIGRyYWdnYWJsZS5cbiAgICAgICAgICAgICAgICAvLyBKdXN0IGxldCBpdCBkcmFnLiBJdCdzIGEgbmF0aXZlIHR5cGUgKFVSTCBvciB0ZXh0KSBhbmQgd2lsbCBiZSBwaWNrZWQgdXAgaW5cbiAgICAgICAgICAgICAgICAvLyBkcmFnZW50ZXIgaGFuZGxlci5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIElmIGJ5IHRoaXMgdGltZSBubyBkcmFnIHNvdXJjZSByZWFjdGVkLCB0ZWxsIGJyb3dzZXIgbm90IHRvIGRyYWcuXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZVRvcERyYWdFbmRDYXB0dXJlID0gKCk9PntcbiAgICAgICAgICAgIGlmICh0aGlzLmNsZWFyQ3VycmVudERyYWdTb3VyY2VOb2RlKCkgJiYgdGhpcy5tb25pdG9yLmlzRHJhZ2dpbmcoKSkge1xuICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggY2FuIGRpc3BhdGNoIHRoaXMgZXZlbnQgaW4gYW4gaW5maW5pdGUgbG9vcFxuICAgICAgICAgICAgICAgIC8vIGlmIGRyYWdlbmQgaGFuZGxlciBkb2VzIHNvbWV0aGluZyBsaWtlIHNob3dpbmcgYW4gYWxlcnQuXG4gICAgICAgICAgICAgICAgLy8gT25seSBwcm9jZWVkIGlmIHdlIGhhdmUgbm90IGhhbmRsZWQgaXQgYWxyZWFkeS5cbiAgICAgICAgICAgICAgICB0aGlzLmFjdGlvbnMuZW5kRHJhZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jYW5jZWxIb3ZlcigpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZVRvcERyYWdFbnRlckNhcHR1cmUgPSAoZSk9PntcbiAgICAgICAgICAgIHRoaXMuZHJhZ0VudGVyVGFyZ2V0SWRzID0gW107XG4gICAgICAgICAgICBpZiAodGhpcy5pc0RyYWdnaW5nTmF0aXZlSXRlbSgpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgICAgICAgICAocmVmID0gdGhpcy5jdXJyZW50TmF0aXZlU291cmNlKSA9PT0gbnVsbCB8fCByZWYgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHJlZi5sb2FkRGF0YVRyYW5zZmVyKGUuZGF0YVRyYW5zZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGlzRmlyc3RFbnRlciA9IHRoaXMuZW50ZXJMZWF2ZUNvdW50ZXIuZW50ZXIoZS50YXJnZXQpO1xuICAgICAgICAgICAgaWYgKCFpc0ZpcnN0RW50ZXIgfHwgdGhpcy5tb25pdG9yLmlzRHJhZ2dpbmcoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHsgZGF0YVRyYW5zZmVyICB9ID0gZTtcbiAgICAgICAgICAgIGNvbnN0IG5hdGl2ZVR5cGUgPSBtYXRjaE5hdGl2ZUl0ZW1UeXBlKGRhdGFUcmFuc2Zlcik7XG4gICAgICAgICAgICBpZiAobmF0aXZlVHlwZSkge1xuICAgICAgICAgICAgICAgIC8vIEEgbmF0aXZlIGl0ZW0gKHN1Y2ggYXMgZmlsZSBvciBVUkwpIGRyYWdnZWQgZnJvbSBvdXRzaWRlIHRoZSBkb2N1bWVudFxuICAgICAgICAgICAgICAgIHRoaXMuYmVnaW5EcmFnTmF0aXZlSXRlbShuYXRpdmVUeXBlLCBkYXRhVHJhbnNmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZVRvcERyYWdFbnRlciA9IChlKT0+e1xuICAgICAgICAgICAgY29uc3QgeyBkcmFnRW50ZXJUYXJnZXRJZHMgIH0gPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5kcmFnRW50ZXJUYXJnZXRJZHMgPSBbXTtcbiAgICAgICAgICAgIGlmICghdGhpcy5tb25pdG9yLmlzRHJhZ2dpbmcoKSkge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgcHJvYmFibHkgYSBuYXRpdmUgaXRlbSB0eXBlIHdlIGRvbid0IHVuZGVyc3RhbmQuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5hbHRLZXlQcmVzc2VkID0gZS5hbHRLZXk7XG4gICAgICAgICAgICAvLyBJZiB0aGUgdGFyZ2V0IGNoYW5nZXMgcG9zaXRpb24gYXMgdGhlIHJlc3VsdCBvZiBgZHJhZ2VudGVyYCwgYGRyYWdvdmVyYCBtaWdodCBzdGlsbFxuICAgICAgICAgICAgLy8gZ2V0IGRpc3BhdGNoZWQgZGVzcGl0ZSB0YXJnZXQgYmVpbmcgbm8gbG9uZ2VyIHRoZXJlLiBUaGUgZWFzeSBzb2x1dGlvbiBpcyB0byBjaGVja1xuICAgICAgICAgICAgLy8gd2hldGhlciB0aGVyZSBhY3R1YWxseSBpcyBhIHRhcmdldCBiZWZvcmUgZmlyaW5nIGBob3ZlcmAuXG4gICAgICAgICAgICBpZiAoZHJhZ0VudGVyVGFyZ2V0SWRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGlvbnMuaG92ZXIoZHJhZ0VudGVyVGFyZ2V0SWRzLCB7XG4gICAgICAgICAgICAgICAgICAgIGNsaWVudE9mZnNldDogZ2V0RXZlbnRDbGllbnRPZmZzZXQoZSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNhbkRyb3AgPSBkcmFnRW50ZXJUYXJnZXRJZHMuc29tZSgodGFyZ2V0SWQpPT50aGlzLm1vbml0b3IuY2FuRHJvcE9uVGFyZ2V0KHRhcmdldElkKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChjYW5Ecm9wKSB7XG4gICAgICAgICAgICAgICAgLy8gSUUgcmVxdWlyZXMgdGhpcyB0byBmaXJlIGRyYWdvdmVyIGV2ZW50c1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBpZiAoZS5kYXRhVHJhbnNmZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9IHRoaXMuZ2V0Q3VycmVudERyb3BFZmZlY3QoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlVG9wRHJhZ092ZXJDYXB0dXJlID0gKGUpPT57XG4gICAgICAgICAgICB0aGlzLmRyYWdPdmVyVGFyZ2V0SWRzID0gW107XG4gICAgICAgICAgICBpZiAodGhpcy5pc0RyYWdnaW5nTmF0aXZlSXRlbSgpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgICAgICAgICAocmVmID0gdGhpcy5jdXJyZW50TmF0aXZlU291cmNlKSA9PT0gbnVsbCB8fCByZWYgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHJlZi5sb2FkRGF0YVRyYW5zZmVyKGUuZGF0YVRyYW5zZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVUb3BEcmFnT3ZlciA9IChlKT0+e1xuICAgICAgICAgICAgY29uc3QgeyBkcmFnT3ZlclRhcmdldElkcyAgfSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmRyYWdPdmVyVGFyZ2V0SWRzID0gW107XG4gICAgICAgICAgICBpZiAoIXRoaXMubW9uaXRvci5pc0RyYWdnaW5nKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHByb2JhYmx5IGEgbmF0aXZlIGl0ZW0gdHlwZSB3ZSBkb24ndCB1bmRlcnN0YW5kLlxuICAgICAgICAgICAgICAgIC8vIFByZXZlbnQgZGVmYXVsdCBcImRyb3AgYW5kIGJsb3cgYXdheSB0aGUgd2hvbGUgZG9jdW1lbnRcIiBhY3Rpb24uXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGlmIChlLmRhdGFUcmFuc2Zlcikge1xuICAgICAgICAgICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmFsdEtleVByZXNzZWQgPSBlLmFsdEtleTtcbiAgICAgICAgICAgIHRoaXMubGFzdENsaWVudE9mZnNldCA9IGdldEV2ZW50Q2xpZW50T2Zmc2V0KGUpO1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZUhvdmVyKGRyYWdPdmVyVGFyZ2V0SWRzKTtcbiAgICAgICAgICAgIGNvbnN0IGNhbkRyb3AgPSAoZHJhZ092ZXJUYXJnZXRJZHMgfHwgW10pLnNvbWUoKHRhcmdldElkKT0+dGhpcy5tb25pdG9yLmNhbkRyb3BPblRhcmdldCh0YXJnZXRJZClcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoY2FuRHJvcCkge1xuICAgICAgICAgICAgICAgIC8vIFNob3cgdXNlci1zcGVjaWZpZWQgZHJvcCBlZmZlY3QuXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGlmIChlLmRhdGFUcmFuc2Zlcikge1xuICAgICAgICAgICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gdGhpcy5nZXRDdXJyZW50RHJvcEVmZmVjdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pc0RyYWdnaW5nTmF0aXZlSXRlbSgpKSB7XG4gICAgICAgICAgICAgICAgLy8gRG9uJ3Qgc2hvdyBhIG5pY2UgY3Vyc29yIGJ1dCBzdGlsbCBwcmV2ZW50IGRlZmF1bHRcbiAgICAgICAgICAgICAgICAvLyBcImRyb3AgYW5kIGJsb3cgYXdheSB0aGUgd2hvbGUgZG9jdW1lbnRcIiBhY3Rpb24uXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGUuZGF0YVRyYW5zZmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGUuZGF0YVRyYW5zZmVyLmRyb3BFZmZlY3QgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZVRvcERyYWdMZWF2ZUNhcHR1cmUgPSAoZSk9PntcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRHJhZ2dpbmdOYXRpdmVJdGVtKCkpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBpc0xhc3RMZWF2ZSA9IHRoaXMuZW50ZXJMZWF2ZUNvdW50ZXIubGVhdmUoZS50YXJnZXQpO1xuICAgICAgICAgICAgaWYgKCFpc0xhc3RMZWF2ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmlzRHJhZ2dpbmdOYXRpdmVJdGVtKCkpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT50aGlzLmVuZERyYWdOYXRpdmVJdGVtKClcbiAgICAgICAgICAgICAgICAsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jYW5jZWxIb3ZlcigpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZVRvcERyb3BDYXB0dXJlID0gKGUpPT57XG4gICAgICAgICAgICB0aGlzLmRyb3BUYXJnZXRJZHMgPSBbXTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRHJhZ2dpbmdOYXRpdmVJdGVtKCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVmO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAocmVmID0gdGhpcy5jdXJyZW50TmF0aXZlU291cmNlKSA9PT0gbnVsbCB8fCByZWYgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHJlZi5sb2FkRGF0YVRyYW5zZmVyKGUuZGF0YVRyYW5zZmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWF0Y2hOYXRpdmVJdGVtVHlwZShlLmRhdGFUcmFuc2ZlcikpIHtcbiAgICAgICAgICAgICAgICAvLyBEcmFnZ2luZyBzb21lIGVsZW1lbnRzLCBsaWtlIDxhPiBhbmQgPGltZz4gbWF5IHN0aWxsIGJlaGF2ZSBsaWtlIGEgbmF0aXZlIGRyYWcgZXZlbnQsXG4gICAgICAgICAgICAgICAgLy8gZXZlbiBpZiB0aGUgY3VycmVudCBkcmFnIGV2ZW50IG1hdGNoZXMgYSB1c2VyLWRlZmluZWQgdHlwZS5cbiAgICAgICAgICAgICAgICAvLyBTdG9wIHRoZSBkZWZhdWx0IGJlaGF2aW9yIHdoZW4gd2UncmUgbm90IGV4cGVjdGluZyBhIG5hdGl2ZSBpdGVtIHRvIGJlIGRyb3BwZWQuXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5lbnRlckxlYXZlQ291bnRlci5yZXNldCgpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZVRvcERyb3AgPSAoZSk9PntcbiAgICAgICAgICAgIGNvbnN0IHsgZHJvcFRhcmdldElkcyAgfSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmRyb3BUYXJnZXRJZHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuYWN0aW9ucy5ob3Zlcihkcm9wVGFyZ2V0SWRzLCB7XG4gICAgICAgICAgICAgICAgY2xpZW50T2Zmc2V0OiBnZXRFdmVudENsaWVudE9mZnNldChlKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmFjdGlvbnMuZHJvcCh7XG4gICAgICAgICAgICAgICAgZHJvcEVmZmVjdDogdGhpcy5nZXRDdXJyZW50RHJvcEVmZmVjdCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRHJhZ2dpbmdOYXRpdmVJdGVtKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVuZERyYWdOYXRpdmVJdGVtKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMubW9uaXRvci5pc0RyYWdnaW5nKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGlvbnMuZW5kRHJhZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jYW5jZWxIb3ZlcigpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZVNlbGVjdFN0YXJ0ID0gKGUpPT57XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICAgICAgICAgIC8vIE9ubHkgSUUgcmVxdWlyZXMgdXMgdG8gZXhwbGljaXRseSBzYXlcbiAgICAgICAgICAgIC8vIHdlIHdhbnQgZHJhZyBkcm9wIG9wZXJhdGlvbiB0byBzdGFydFxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXQuZHJhZ0Ryb3AgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJbnB1dHMgYW5kIHRleHRhcmVhcyBzaG91bGQgYmUgc2VsZWN0YWJsZVxuICAgICAgICAgICAgaWYgKHRhcmdldC50YWdOYW1lID09PSAnSU5QVVQnIHx8IHRhcmdldC50YWdOYW1lID09PSAnU0VMRUNUJyB8fCB0YXJnZXQudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJyB8fCB0YXJnZXQuaXNDb250ZW50RWRpdGFibGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBGb3Igb3RoZXIgdGFyZ2V0cywgYXNrIElFXG4gICAgICAgICAgICAvLyB0byBlbmFibGUgZHJhZyBhbmQgZHJvcFxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGFyZ2V0LmRyYWdEcm9wKCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG5ldyBPcHRpb25zUmVhZGVyKGdsb2JhbENvbnRleHQsIG9wdGlvbnMpO1xuICAgICAgICB0aGlzLmFjdGlvbnMgPSBtYW5hZ2VyLmdldEFjdGlvbnMoKTtcbiAgICAgICAgdGhpcy5tb25pdG9yID0gbWFuYWdlci5nZXRNb25pdG9yKCk7XG4gICAgICAgIHRoaXMucmVnaXN0cnkgPSBtYW5hZ2VyLmdldFJlZ2lzdHJ5KCk7XG4gICAgICAgIHRoaXMuZW50ZXJMZWF2ZUNvdW50ZXIgPSBuZXcgRW50ZXJMZWF2ZUNvdW50ZXIodGhpcy5pc05vZGVJbkRvY3VtZW50KTtcbiAgICB9XG59XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUhUTUw1QmFja2VuZEltcGwuanMubWFwIiwibGV0IGVtcHR5SW1hZ2U7XG5leHBvcnQgZnVuY3Rpb24gZ2V0RW1wdHlJbWFnZSgpIHtcbiAgICBpZiAoIWVtcHR5SW1hZ2UpIHtcbiAgICAgICAgZW1wdHlJbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBlbXB0eUltYWdlLnNyYyA9ICdkYXRhOmltYWdlL2dpZjtiYXNlNjQsUjBsR09EbGhBUUFCQUFBQUFDSDVCQUVLQUFFQUxBQUFBQUFCQUFFQUFBSUNUQUVBT3c9PSc7XG4gICAgfVxuICAgIHJldHVybiBlbXB0eUltYWdlO1xufVxuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZXRFbXB0eUltYWdlLmpzLm1hcCIsImltcG9ydCB7IEhUTUw1QmFja2VuZEltcGwgfSBmcm9tICcuL0hUTUw1QmFja2VuZEltcGwuanMnO1xuaW1wb3J0ICogYXMgX05hdGl2ZVR5cGVzIGZyb20gJy4vTmF0aXZlVHlwZXMuanMnO1xuZXhwb3J0IHsgZ2V0RW1wdHlJbWFnZSB9IGZyb20gJy4vZ2V0RW1wdHlJbWFnZS5qcyc7XG5leHBvcnQgeyBfTmF0aXZlVHlwZXMgYXMgTmF0aXZlVHlwZXMgfTtcbmV4cG9ydCBjb25zdCBIVE1MNUJhY2tlbmQgPSBmdW5jdGlvbiBjcmVhdGVCYWNrZW5kKG1hbmFnZXIsIGNvbnRleHQsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IEhUTUw1QmFja2VuZEltcGwobWFuYWdlciwgY29udGV4dCwgb3B0aW9ucyk7XG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi8uLi9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uLy4uL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi8uLi9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uLy4uL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uLy4uL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vLi4vcG9zdGNzcy1sb2FkZXIvZGlzdC9janMuanMhLi9SZWFjdENvbnRleGlmeS5taW4uY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vLi4vY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi8uLi9wb3N0Y3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL1JlYWN0Q29udGV4aWZ5Lm1pbi5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJmdW5jdGlvbiByKGUpe3ZhciB0LGYsbj1cIlwiO2lmKFwic3RyaW5nXCI9PXR5cGVvZiBlfHxcIm51bWJlclwiPT10eXBlb2YgZSluKz1lO2Vsc2UgaWYoXCJvYmplY3RcIj09dHlwZW9mIGUpaWYoQXJyYXkuaXNBcnJheShlKSlmb3IodD0wO3Q8ZS5sZW5ndGg7dCsrKWVbdF0mJihmPXIoZVt0XSkpJiYobiYmKG4rPVwiIFwiKSxuKz1mKTtlbHNlIGZvcih0IGluIGUpZVt0XSYmKG4mJihuKz1cIiBcIiksbis9dCk7cmV0dXJuIG59ZXhwb3J0IGZ1bmN0aW9uIGNsc3goKXtmb3IodmFyIGUsdCxmPTAsbj1cIlwiO2Y8YXJndW1lbnRzLmxlbmd0aDspKGU9YXJndW1lbnRzW2YrK10pJiYodD1yKGUpKSYmKG4mJihuKz1cIiBcIiksbis9dCk7cmV0dXJuIG59ZXhwb3J0IGRlZmF1bHQgY2xzeDsiLCJpbXBvcnQgSCwgeyBjcmVhdGVDb250ZXh0LCB1c2VSZWR1Y2VyLCB1c2VSZWYsIHVzZVN0YXRlLCB1c2VFZmZlY3QsIHVzZUNvbnRleHQsIENoaWxkcmVuLCBjbG9uZUVsZW1lbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgWCBmcm9tICdjbHN4JztcbmltcG9ydCB7IGZsdXNoU3luYyB9IGZyb20gJ3JlYWN0LWRvbSc7XG5cbnZhciBZPWNyZWF0ZUNvbnRleHQoe30pLEY9KCk9PnVzZUNvbnRleHQoWSksJD10PT5ILmNyZWF0ZUVsZW1lbnQoWS5Qcm92aWRlcix7Li4udH0pO2Z1bmN0aW9uIGxlKCl7bGV0IHQ9bmV3IE1hcDtyZXR1cm4ge29uKGUscil7cmV0dXJuIHQuaGFzKGUpP3QuZ2V0KGUpLmFkZChyKTp0LnNldChlLG5ldyBTZXQoW3JdKSksdGhpc30sb2ZmKGUscil7cmV0dXJuIHQuaGFzKGUpJiZ0LmdldChlKS5kZWxldGUociksdGhpc30sZW1pdChlLHIpe3JldHVybiB0LmhhcyhlKSYmdC5nZXQoZSkuZm9yRWFjaChmPT57ZihyKTt9KSx0aGlzfX19dmFyIFI9bGUoKTt2YXIgQj0oKT0+dXNlUmVmKG5ldyBNYXApLmN1cnJlbnQ7dmFyIHo9KCk9Pnt9LFU9W1wicmVzaXplXCIsXCJjb250ZXh0bWVudVwiLFwiY2xpY2tcIixcInNjcm9sbFwiLFwiYmx1clwiXTt2YXIgQT17c2hvdyh7ZXZlbnQ6dCxpZDplLHByb3BzOnIscG9zaXRpb246Zn0pe3QucHJldmVudERlZmF1bHQmJnQucHJldmVudERlZmF1bHQoKSxSLmVtaXQoMCkuZW1pdChlLHtldmVudDp0Lm5hdGl2ZUV2ZW50fHx0LHByb3BzOnIscG9zaXRpb246Zn0pO30saGlkZUFsbCgpe1IuZW1pdCgwKTt9fTtmdW5jdGlvbiBGZSh0KXtyZXR1cm4ge3Nob3coZSl7QS5zaG93KHsuLi50LC4uLmV9KTt9LGhpZGVBbGwoKXtBLmhpZGVBbGwoKTt9fX1mdW5jdGlvbiBHKCl7bGV0IHQ9bmV3IE1hcCxlLHIsZixzLGk9ITE7ZnVuY3Rpb24gUChuKXtzPUFycmF5LmZyb20obi52YWx1ZXMoKSksZT0tMSxmPSEwO31mdW5jdGlvbiB2KCl7c1tlXS5ub2RlLmZvY3VzKCk7fWxldCB4PSgpPT5lPj0wJiZzW2VdLmlzU3VibWVudSx3PSgpPT5BcnJheS5mcm9tKHNbZV0uc3VibWVudVJlZlRyYWNrZXIudmFsdWVzKCkpO2Z1bmN0aW9uIG0oKXtyZXR1cm4gZT09PS0xPyhiKCksITEpOiEwfWZ1bmN0aW9uIGIoKXtlKzE8cy5sZW5ndGg/ZSsrOmUrMT09PXMubGVuZ3RoJiYoZT0wKSxpJiZhKCksdigpO31mdW5jdGlvbiBFKCl7ZT09PS0xfHxlPT09MD9lPXMubGVuZ3RoLTE6ZS0xPHMubGVuZ3RoJiZlLS0saSYmYSgpLHYoKTt9ZnVuY3Rpb24gVCgpe2lmKG0oKSYmeCgpKXtsZXQgbj13KCkse25vZGU6YyxzZXRTdWJtZW51UG9zaXRpb246aH09c1tlXTtyZXR1cm4gdC5zZXQoYyx7aXNSb290OmYsZm9jdXNlZEluZGV4OmUscGFyZW50Tm9kZTpyfHxjLGl0ZW1zOnN9KSxoKCksYy5jbGFzc0xpc3QuYWRkKFwiY29udGV4aWZ5X3N1Ym1lbnUtaXNPcGVuXCIpLHI9YyxuLmxlbmd0aD4wPyhlPTAscz1uKTppPSEwLGY9ITEsdigpLCEwfXJldHVybiAhMX1mdW5jdGlvbiBhKCl7aWYobSgpJiYhZil7bGV0IG49dC5nZXQocik7ci5jbGFzc0xpc3QucmVtb3ZlKFwiY29udGV4aWZ5X3N1Ym1lbnUtaXNPcGVuXCIpLHM9bi5pdGVtcyxyPW4ucGFyZW50Tm9kZSxuLmlzUm9vdCYmKGY9ITAsdC5jbGVhcigpKSxpfHwoZT1uLmZvY3VzZWRJbmRleCx2KCkpO319ZnVuY3Rpb24geShuKXtmdW5jdGlvbiBjKGgpe2ZvcihsZXQgbyBvZiBoKW8uaXNTdWJtZW51JiZvLnN1Ym1lbnVSZWZUcmFja2VyJiZjKEFycmF5LmZyb20oby5zdWJtZW51UmVmVHJhY2tlci52YWx1ZXMoKSkpLG8ua2V5TWF0Y2hlciYmby5rZXlNYXRjaGVyKG4pO31jKHMpO31yZXR1cm4ge2luaXQ6UCxtb3ZlRG93bjpiLG1vdmVVcDpFLG9wZW5TdWJtZW51OlQsY2xvc2VTdWJtZW51OmEsbWF0Y2hLZXlzOnl9fWZ1bmN0aW9uIEkodCl7cmV0dXJuIHR5cGVvZiB0PT1cImZ1bmN0aW9uXCJ9ZnVuY3Rpb24gVih0KXtyZXR1cm4gdHlwZW9mIHQ9PVwic3RyaW5nXCJ9ZnVuY3Rpb24gXyh0LGUpe3JldHVybiBDaGlsZHJlbi5tYXAoQ2hpbGRyZW4udG9BcnJheSh0KS5maWx0ZXIoQm9vbGVhbikscj0+Y2xvbmVFbGVtZW50KHIsZSkpfWZ1bmN0aW9uIEoodCl7bGV0IGU9e3g6dC5jbGllbnRYLHk6dC5jbGllbnRZfSxyPXQuY2hhbmdlZFRvdWNoZXM7cmV0dXJuIHImJihlLng9clswXS5jbGllbnRYLGUueT1yWzBdLmNsaWVudFkpLCghZS54fHxlLng8MCkmJihlLng9MCksKCFlLnl8fGUueTwwKSYmKGUueT0wKSxlfWZ1bmN0aW9uIGsodCxlKXtyZXR1cm4gSSh0KT90KGUpOnR9ZnVuY3Rpb24gYmUodCxlKXtyZXR1cm4gey4uLnQsLi4uSShlKT9lKHQpOmV9fXZhciBpdD0oe2lkOnQsdGhlbWU6ZSxzdHlsZTpyLGNsYXNzTmFtZTpmLGNoaWxkcmVuOnMsYW5pbWF0aW9uOmk9XCJmYWRlXCIscHJldmVudERlZmF1bHRPbktleWRvd246UD0hMCxkaXNhYmxlQm91bmRhcmllc0NoZWNrOnY9ITEsb25WaXNpYmlsaXR5Q2hhbmdlOngsLi4ud30pPT57bGV0W20sYl09dXNlUmVkdWNlcihiZSx7eDowLHk6MCx2aXNpYmxlOiExLHRyaWdnZXJFdmVudDp7fSxwcm9wc0Zyb21UcmlnZ2VyOm51bGwsd2lsbExlYXZlOiExfSksRT11c2VSZWYobnVsbCksVD1CKCksW2FdPXVzZVN0YXRlKCgpPT5HKCkpLHk9dXNlUmVmKCksbj11c2VSZWYoKTt1c2VFZmZlY3QoKCk9PihSLm9uKHQsaCkub24oMCxvKSwoKT0+e1Iub2ZmKHQsaCkub2ZmKDAsbyk7fSksW3QsaSx2XSksdXNlRWZmZWN0KCgpPT57bS52aXNpYmxlP2EuaW5pdChUKTpULmNsZWFyKCk7fSxbbS52aXNpYmxlLGEsVF0pO2Z1bmN0aW9uIGModSxwKXtpZihFLmN1cnJlbnQmJiF2KXtsZXR7aW5uZXJXaWR0aDpkLGlubmVySGVpZ2h0OkN9PXdpbmRvdyx7b2Zmc2V0V2lkdGg6SyxvZmZzZXRIZWlnaHQ6T309RS5jdXJyZW50O3UrSz5kJiYodS09dStLLWQpLHArTz5DJiYocC09cCtPLUMpO31yZXR1cm4ge3g6dSx5OnB9fXVzZUVmZmVjdCgoKT0+e20udmlzaWJsZSYmYihjKG0ueCxtLnkpKTt9LFttLnZpc2libGVdKSx1c2VFZmZlY3QoKCk9PntmdW5jdGlvbiB1KGQpe1AmJmQucHJldmVudERlZmF1bHQoKTt9ZnVuY3Rpb24gcChkKXtzd2l0Y2goZC5rZXkpe2Nhc2VcIkVudGVyXCI6Y2FzZVwiIFwiOmEub3BlblN1Ym1lbnUoKXx8bygpO2JyZWFrO2Nhc2VcIkVzY2FwZVwiOm8oKTticmVhaztjYXNlXCJBcnJvd1VwXCI6dShkKSxhLm1vdmVVcCgpO2JyZWFrO2Nhc2VcIkFycm93RG93blwiOnUoZCksYS5tb3ZlRG93bigpO2JyZWFrO2Nhc2VcIkFycm93UmlnaHRcIjp1KGQpLGEub3BlblN1Ym1lbnUoKTticmVhaztjYXNlXCJBcnJvd0xlZnRcIjp1KGQpLGEuY2xvc2VTdWJtZW51KCk7YnJlYWs7ZGVmYXVsdDphLm1hdGNoS2V5cyhkKTticmVha319aWYobS52aXNpYmxlKXt3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIixwKTtmb3IobGV0IGQgb2YgVSl3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihkLG8pO31yZXR1cm4gKCk9Pnt3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIixwKTtmb3IobGV0IGQgb2YgVSl3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihkLG8pO319LFttLnZpc2libGUsYSxQXSk7ZnVuY3Rpb24gaCh7ZXZlbnQ6dSxwcm9wczpwLHBvc2l0aW9uOmR9KXt1LnN0b3BQcm9wYWdhdGlvbigpO2xldCBDPWR8fEoodSkse3g6Syx5Ok99PWMoQy54LEMueSk7Zmx1c2hTeW5jKCgpPT57Yih7dmlzaWJsZTohMCx3aWxsTGVhdmU6ITEseDpLLHk6Tyx0cmlnZ2VyRXZlbnQ6dSxwcm9wc0Zyb21UcmlnZ2VyOnB9KTt9KSxjbGVhclRpbWVvdXQobi5jdXJyZW50KSwheS5jdXJyZW50JiZJKHgpJiYoeCghMCkseS5jdXJyZW50PSEwKTt9ZnVuY3Rpb24gbyh1KXt1IT1udWxsJiYodS5idXR0b249PT0yfHx1LmN0cmxLZXkpJiZ1LnR5cGUhPT1cImNvbnRleHRtZW51XCJ8fChpJiYoVihpKXx8XCJleGl0XCJpbiBpJiZpLmV4aXQpP2IocD0+KHt3aWxsTGVhdmU6cC52aXNpYmxlfSkpOmIocD0+KHt2aXNpYmxlOnAudmlzaWJsZT8hMTpwLnZpc2libGV9KSksbi5jdXJyZW50PXNldFRpbWVvdXQoKCk9PntJKHgpJiZ4KCExKSx5LmN1cnJlbnQ9ITE7fSkpO31mdW5jdGlvbiBNKCl7bS53aWxsTGVhdmUmJm0udmlzaWJsZSYmZmx1c2hTeW5jKCgpPT5iKHt2aXNpYmxlOiExLHdpbGxMZWF2ZTohMX0pKTt9ZnVuY3Rpb24gUygpe3JldHVybiBWKGkpP1goe1tgJHtcImNvbnRleGlmeV93aWxsRW50ZXItXCJ9JHtpfWBdOmcmJiFELFtgJHtcImNvbnRleGlmeV93aWxsTGVhdmUtXCJ9JHtpfSAke1wiY29udGV4aWZ5X3dpbGxMZWF2ZS1cIn0nZGlzYWJsZWQnYF06ZyYmRH0pOmkmJlwiZW50ZXJcImluIGkmJlwiZXhpdFwiaW4gaT9YKHtbYCR7XCJjb250ZXhpZnlfd2lsbEVudGVyLVwifSR7aS5lbnRlcn1gXTppLmVudGVyJiZnJiYhRCxbYCR7XCJjb250ZXhpZnlfd2lsbExlYXZlLVwifSR7aS5leGl0fSAke1wiY29udGV4aWZ5X3dpbGxMZWF2ZS1cIn0nZGlzYWJsZWQnYF06aS5leGl0JiZnJiZEfSk6bnVsbH1sZXR7dmlzaWJsZTpnLHRyaWdnZXJFdmVudDpsLHByb3BzRnJvbVRyaWdnZXI6TCx4Om9lLHk6aWUsd2lsbExlYXZlOkR9PW0sYWU9WChcImNvbnRleGlmeVwiLGYse1tgJHtcImNvbnRleGlmeV90aGVtZS1cIn0ke2V9YF06ZX0sUygpKTtyZXR1cm4gSC5jcmVhdGVFbGVtZW50KCQse3ZhbHVlOlR9LGcmJkguY3JlYXRlRWxlbWVudChcImRpdlwiLHsuLi53LGNsYXNzTmFtZTphZSxvbkFuaW1hdGlvbkVuZDpNLHN0eWxlOnsuLi5yLGxlZnQ6b2UsdG9wOmllLG9wYWNpdHk6MX0scmVmOkUscm9sZTpcIm1lbnVcIn0sXyhzLHtwcm9wc0Zyb21UcmlnZ2VyOkwsdHJpZ2dlckV2ZW50Omx9KSkpfTt2YXIgcHQ9KHtpZDp0LGNoaWxkcmVuOmUsY2xhc3NOYW1lOnIsc3R5bGU6Zix0cmlnZ2VyRXZlbnQ6cyxkYXRhOmkscHJvcHNGcm9tVHJpZ2dlcjpQLGtleU1hdGNoZXI6dixvbkNsaWNrOng9eixkaXNhYmxlZDp3PSExLGhpZGRlbjptPSExLGNsb3NlT25DbGljazpiPSEwLGhhbmRsZXJFdmVudDpFPVwib25DbGlja1wiLC4uLlR9KT0+e2xldCBhPXVzZVJlZigpLHk9RigpLG49e2lkOnQsZGF0YTppLHRyaWdnZXJFdmVudDpzLHByb3BzOlB9LGM9ayh3LG4pLGg9ayhtLG4pO2Z1bmN0aW9uIG8obCl7bi5ldmVudD1sLGwuc3RvcFByb3BhZ2F0aW9uKCksY3x8KGI/TSgpOngobikpO31mdW5jdGlvbiBNKCl7bGV0IGw9YS5jdXJyZW50O2wuZm9jdXMoKSxsLmFkZEV2ZW50TGlzdGVuZXIoXCJhbmltYXRpb25lbmRcIiwoKT0+c2V0VGltZW91dChBLmhpZGVBbGwpLHtvbmNlOiEwfSksbC5jbGFzc0xpc3QuYWRkKFwiY29udGV4aWZ5X2l0ZW0tZmVlZGJhY2tcIikseChuKTt9ZnVuY3Rpb24gUyhsKXtsJiYhYyYmKGEuY3VycmVudD1sLHkuc2V0KGwse25vZGU6bCxpc1N1Ym1lbnU6ITEsa2V5TWF0Y2hlcjohYyYmSSh2KSYmKEw9Pnt2KEwpJiYoTC5zdG9wUHJvcGFnYXRpb24oKSxMLnByZXZlbnREZWZhdWx0KCksbi5ldmVudD1MLE0oKSk7fSl9KSk7fWZ1bmN0aW9uIGcobCl7KGwua2V5PT09XCJFbnRlclwifHxsLmtleT09PVwiIFwiKSYmKGwuc3RvcFByb3BhZ2F0aW9uKCksbi5ldmVudD1sLE0oKSk7fXJldHVybiBoP251bGw6SC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsey4uLlQsW0VdOm8sY2xhc3NOYW1lOlgoXCJjb250ZXhpZnlfaXRlbVwiLHIse1tgJHtcImNvbnRleGlmeV9pdGVtLWRpc2FibGVkXCJ9YF06Y30pLHN0eWxlOmYsb25LZXlEb3duOmcscmVmOlMsdGFiSW5kZXg6LTEscm9sZTpcIm1lbnVpdGVtXCIsXCJhcmlhLWRpc2FibGVkXCI6Y30sSC5jcmVhdGVFbGVtZW50KFwiZGl2XCIse2NsYXNzTmFtZTpcImNvbnRleGlmeV9pdGVtQ29udGVudFwifSxlKSl9O3ZhciBFdD0oe3RyaWdnZXJFdmVudDp0LGRhdGE6ZSxwcm9wc0Zyb21UcmlnZ2VyOnIsaGlkZGVuOmY9ITF9KT0+ayhmLHtkYXRhOmUsdHJpZ2dlckV2ZW50OnQscHJvcHM6cn0pP251bGw6SC5jcmVhdGVFbGVtZW50KFwiZGl2XCIse2NsYXNzTmFtZTpcImNvbnRleGlmeV9zZXBhcmF0b3JcIn0pO3ZhciByZT0oKT0+SC5jcmVhdGVFbGVtZW50KFwic3ZnXCIse3htbG5zOlwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIix3aWR0aDpcIjE4XCIsaGVpZ2h0OlwiMThcIix2aWV3Qm94OlwiMCAwIDI0IDI0XCIsZmlsbDpcIm5vbmVcIixzdHJva2U6XCJjdXJyZW50Q29sb3JcIixzdHJva2VXaWR0aDpcIjJcIixzdHJva2VMaW5lY2FwOlwicm91bmRcIixzdHJva2VMaW5lam9pbjpcInJvdW5kXCJ9LEguY3JlYXRlRWxlbWVudChcInBvbHlsaW5lXCIse3BvaW50czpcIjkgMTggMTUgMTIgOSA2XCJ9KSk7dmFyIG5lPSh7Y2xhc3NOYW1lOnQsLi4uZX0pPT5ILmNyZWF0ZUVsZW1lbnQoXCJkaXZcIix7Y2xhc3NOYW1lOlgoXCJjb250ZXhpZnlfcmlnaHRTbG90XCIsdCksLi4uZX0pO3ZhciBLdD0oe2Fycm93OnQsY2hpbGRyZW46ZSxkaXNhYmxlZDpyPSExLGhpZGRlbjpmPSExLGxhYmVsOnMsY2xhc3NOYW1lOmksdHJpZ2dlckV2ZW50OlAscHJvcHNGcm9tVHJpZ2dlcjp2LHN0eWxlOngsLi4ud30pPT57bGV0IG09RigpLGI9QigpLEU9dXNlUmVmKG51bGwpLFQ9e3RyaWdnZXJFdmVudDpQLHByb3BzOnZ9LGE9ayhyLFQpLHk9ayhmLFQpO2Z1bmN0aW9uIG4oKXtsZXQgbz1FLmN1cnJlbnQ7aWYobyl7bGV0IE09YCR7XCJjb250ZXhpZnlfc3VibWVudVwifS1ib3R0b21gLFM9YCR7XCJjb250ZXhpZnlfc3VibWVudVwifS1yaWdodGA7by5jbGFzc0xpc3QucmVtb3ZlKE0sUyk7bGV0IGc9by5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtnLnJpZ2h0PndpbmRvdy5pbm5lcldpZHRoJiZvLmNsYXNzTGlzdC5hZGQoUyksZy5ib3R0b20+d2luZG93LmlubmVySGVpZ2h0JiZvLmNsYXNzTGlzdC5hZGQoTSk7fX1mdW5jdGlvbiBjKG8pe28mJiFhJiZtLnNldChvLHtub2RlOm8saXNTdWJtZW51OiEwLHN1Ym1lbnVSZWZUcmFja2VyOmIsc2V0U3VibWVudVBvc2l0aW9uOm59KTt9aWYoeSlyZXR1cm4gbnVsbDtsZXQgaD1YKFwiY29udGV4aWZ5X2l0ZW1cIixpLHtbYCR7XCJjb250ZXhpZnlfaXRlbS1kaXNhYmxlZFwifWBdOmF9KTtyZXR1cm4gSC5jcmVhdGVFbGVtZW50KCQse3ZhbHVlOmJ9LEguY3JlYXRlRWxlbWVudChcImRpdlwiLHsuLi53LGNsYXNzTmFtZTpoLHJlZjpjLHRhYkluZGV4Oi0xLHJvbGU6XCJtZW51aXRlbVwiLFwiYXJpYS1oYXNwb3B1cFwiOiEwLFwiYXJpYS1kaXNhYmxlZFwiOmEsb25Nb3VzZUVudGVyOm4sb25Ub3VjaFN0YXJ0Om59LEguY3JlYXRlRWxlbWVudChcImRpdlwiLHtjbGFzc05hbWU6XCJjb250ZXhpZnlfaXRlbUNvbnRlbnRcIixvbkNsaWNrOm89Pm8uc3RvcFByb3BhZ2F0aW9uKCl9LHMsSC5jcmVhdGVFbGVtZW50KG5lLG51bGwsdHx8SC5jcmVhdGVFbGVtZW50KHJlLG51bGwpKSksSC5jcmVhdGVFbGVtZW50KFwiZGl2XCIse2NsYXNzTmFtZTpgJHtcImNvbnRleGlmeVwifSAke1wiY29udGV4aWZ5X3N1Ym1lbnVcIn1gLHJlZjpFLHN0eWxlOnh9LF8oZSx7cHJvcHNGcm9tVHJpZ2dlcjp2LHRyaWdnZXJFdmVudDpQfSkpKSl9O1xuXG5leHBvcnQgeyBwdCBhcyBJdGVtLCBpdCBhcyBNZW51LCBuZSBhcyBSaWdodFNsb3QsIEV0IGFzIFNlcGFyYXRvciwgS3QgYXMgU3VibWVudSwgQSBhcyBjb250ZXh0TWVudSwgRmUgYXMgdXNlQ29udGV4dE1lbnUgfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW91dC5qcy5tYXBcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4Lm1qcy5tYXAiLCJpbXBvcnQgJEhnQU5kJHJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMjAgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gXG5jb25zdCAkZjBhMDRjY2Q4ZGJkZDgzYiRleHBvcnQkZTVjNWE1ZjkxN2E1ODcxYyA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgPyAoMCwgJEhnQU5kJHJlYWN0KS51c2VMYXlvdXRFZmZlY3QgOiAoKT0+e307XG5cblxuZXhwb3J0IHskZjBhMDRjY2Q4ZGJkZDgzYiRleHBvcnQkZTVjNWE1ZjkxN2E1ODcxYyBhcyB1c2VMYXlvdXRFZmZlY3R9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlTGF5b3V0RWZmZWN0Lm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7dXNlTGF5b3V0RWZmZWN0IGFzICRmMGEwNGNjZDhkYmRkODNiJGV4cG9ydCRlNWM1YTVmOTE3YTU4NzFjfSBmcm9tIFwiLi91c2VMYXlvdXRFZmZlY3QubWpzXCI7XG5pbXBvcnQgJGxtYVlyJHJlYWN0LCB7dXNlUmVmIGFzICRsbWFZciR1c2VSZWYsIHVzZUNhbGxiYWNrIGFzICRsbWFZciR1c2VDYWxsYmFja30gZnJvbSBcInJlYWN0XCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMyBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcblxudmFyICQ4YWUwNWVhYTVjMTE0ZTljJHZhciRfUmVhY3RfdXNlSW5zZXJ0aW9uRWZmZWN0O1xuLy8gVXNlIHRoZSBlYXJsaWVzdCBlZmZlY3QgdHlwZSBwb3NzaWJsZS4gdXNlSW5zZXJ0aW9uRWZmZWN0IHJ1bnMgZHVyaW5nIHRoZSBtdXRhdGlvbiBwaGFzZSxcbi8vIGJlZm9yZSBhbGwgbGF5b3V0IGVmZmVjdHMsIGJ1dCBpcyBhdmFpbGFibGUgb25seSBpbiBSZWFjdCAxOCBhbmQgbGF0ZXIuXG5jb25zdCAkOGFlMDVlYWE1YzExNGU5YyR2YXIkdXNlRWFybHlFZmZlY3QgPSAoJDhhZTA1ZWFhNWMxMTRlOWMkdmFyJF9SZWFjdF91c2VJbnNlcnRpb25FZmZlY3QgPSAoMCwgJGxtYVlyJHJlYWN0KVsndXNlSW5zZXJ0aW9uRWZmZWN0J10pICE9PSBudWxsICYmICQ4YWUwNWVhYTVjMTE0ZTljJHZhciRfUmVhY3RfdXNlSW5zZXJ0aW9uRWZmZWN0ICE9PSB2b2lkIDAgPyAkOGFlMDVlYWE1YzExNGU5YyR2YXIkX1JlYWN0X3VzZUluc2VydGlvbkVmZmVjdCA6ICgwLCAkZjBhMDRjY2Q4ZGJkZDgzYiRleHBvcnQkZTVjNWE1ZjkxN2E1ODcxYyk7XG5mdW5jdGlvbiAkOGFlMDVlYWE1YzExNGU5YyRleHBvcnQkN2Y1NGZjMzE4MDUwOGE1Mihmbikge1xuICAgIGNvbnN0IHJlZiA9ICgwLCAkbG1hWXIkdXNlUmVmKShudWxsKTtcbiAgICAkOGFlMDVlYWE1YzExNGU5YyR2YXIkdXNlRWFybHlFZmZlY3QoKCk9PntcbiAgICAgICAgcmVmLmN1cnJlbnQgPSBmbjtcbiAgICB9LCBbXG4gICAgICAgIGZuXG4gICAgXSk7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHJldHVybiAoMCwgJGxtYVlyJHVzZUNhbGxiYWNrKSgoLi4uYXJncyk9PntcbiAgICAgICAgY29uc3QgZiA9IHJlZi5jdXJyZW50O1xuICAgICAgICByZXR1cm4gZiA9PT0gbnVsbCB8fCBmID09PSB2b2lkIDAgPyB2b2lkIDAgOiBmKC4uLmFyZ3MpO1xuICAgIH0sIFtdKTtcbn1cblxuXG5leHBvcnQgeyQ4YWUwNWVhYTVjMTE0ZTljJGV4cG9ydCQ3ZjU0ZmMzMTgwNTA4YTUyIGFzIHVzZUVmZmVjdEV2ZW50fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVzZUVmZmVjdEV2ZW50Lm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7dXNlRWZmZWN0RXZlbnQgYXMgJDhhZTA1ZWFhNWMxMTRlOWMkZXhwb3J0JDdmNTRmYzMxODA1MDhhNTJ9IGZyb20gXCIuL3VzZUVmZmVjdEV2ZW50Lm1qc1wiO1xuaW1wb3J0IHt1c2VMYXlvdXRFZmZlY3QgYXMgJGYwYTA0Y2NkOGRiZGQ4M2IkZXhwb3J0JGU1YzVhNWY5MTdhNTg3MWN9IGZyb20gXCIuL3VzZUxheW91dEVmZmVjdC5tanNcIjtcbmltcG9ydCB7dXNlU3RhdGUgYXMgJGZDQWxMJHVzZVN0YXRlLCB1c2VSZWYgYXMgJGZDQWxMJHVzZVJlZn0gZnJvbSBcInJlYWN0XCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcblxuZnVuY3Rpb24gJDFkYmVjYmUyN2EwNGY5YWYkZXhwb3J0JDE0ZDIzOGYzNDI3MjNmMjUoZGVmYXVsdFZhbHVlKSB7XG4gICAgbGV0IFt2YWx1ZSwgc2V0VmFsdWVdID0gKDAsICRmQ0FsTCR1c2VTdGF0ZSkoZGVmYXVsdFZhbHVlKTtcbiAgICBsZXQgZWZmZWN0ID0gKDAsICRmQ0FsTCR1c2VSZWYpKG51bGwpO1xuICAgIC8vIFN0b3JlIHRoZSBmdW5jdGlvbiBpbiBhIHJlZiBzbyB3ZSBjYW4gYWx3YXlzIGFjY2VzcyB0aGUgY3VycmVudCB2ZXJzaW9uXG4gICAgLy8gd2hpY2ggaGFzIHRoZSBwcm9wZXIgYHZhbHVlYCBpbiBzY29wZS5cbiAgICBsZXQgbmV4dFJlZiA9ICgwLCAkOGFlMDVlYWE1YzExNGU5YyRleHBvcnQkN2Y1NGZjMzE4MDUwOGE1MikoKCk9PntcbiAgICAgICAgaWYgKCFlZmZlY3QuY3VycmVudCkgcmV0dXJuO1xuICAgICAgICAvLyBSdW4gdGhlIGdlbmVyYXRvciB0byB0aGUgbmV4dCB5aWVsZC5cbiAgICAgICAgbGV0IG5ld1ZhbHVlID0gZWZmZWN0LmN1cnJlbnQubmV4dCgpO1xuICAgICAgICAvLyBJZiB0aGUgZ2VuZXJhdG9yIGlzIGRvbmUsIHJlc2V0IHRoZSBlZmZlY3QuXG4gICAgICAgIGlmIChuZXdWYWx1ZS5kb25lKSB7XG4gICAgICAgICAgICBlZmZlY3QuY3VycmVudCA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgdGhlIHZhbHVlIGlzIHRoZSBzYW1lIGFzIHRoZSBjdXJyZW50IHZhbHVlLFxuICAgICAgICAvLyB0aGVuIGNvbnRpbnVlIHRvIHRoZSBuZXh0IHlpZWxkLiBPdGhlcndpc2UsXG4gICAgICAgIC8vIHNldCB0aGUgdmFsdWUgaW4gc3RhdGUgYW5kIHdhaXQgZm9yIHRoZSBuZXh0IGxheW91dCBlZmZlY3QuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbmV3VmFsdWUudmFsdWUpIG5leHRSZWYoKTtcbiAgICAgICAgZWxzZSBzZXRWYWx1ZShuZXdWYWx1ZS52YWx1ZSk7XG4gICAgfSk7XG4gICAgKDAsICRmMGEwNGNjZDhkYmRkODNiJGV4cG9ydCRlNWM1YTVmOTE3YTU4NzFjKSgoKT0+e1xuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhbiBlZmZlY3QgY3VycmVudGx5IHJ1bm5pbmcsIGNvbnRpbnVlIHRvIHRoZSBuZXh0IHlpZWxkLlxuICAgICAgICBpZiAoZWZmZWN0LmN1cnJlbnQpIG5leHRSZWYoKTtcbiAgICB9KTtcbiAgICBsZXQgcXVldWUgPSAoMCwgJDhhZTA1ZWFhNWMxMTRlOWMkZXhwb3J0JDdmNTRmYzMxODA1MDhhNTIpKChmbik9PntcbiAgICAgICAgZWZmZWN0LmN1cnJlbnQgPSBmbih2YWx1ZSk7XG4gICAgICAgIG5leHRSZWYoKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW1xuICAgICAgICB2YWx1ZSxcbiAgICAgICAgcXVldWVcbiAgICBdO1xufVxuXG5cbmV4cG9ydCB7JDFkYmVjYmUyN2EwNGY5YWYkZXhwb3J0JDE0ZDIzOGYzNDI3MjNmMjUgYXMgdXNlVmFsdWVFZmZlY3R9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlVmFsdWVFZmZlY3QubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHt1c2VMYXlvdXRFZmZlY3QgYXMgJGYwYTA0Y2NkOGRiZGQ4M2IkZXhwb3J0JGU1YzVhNWY5MTdhNTg3MWN9IGZyb20gXCIuL3VzZUxheW91dEVmZmVjdC5tanNcIjtcbmltcG9ydCB7dXNlVmFsdWVFZmZlY3QgYXMgJDFkYmVjYmUyN2EwNGY5YWYkZXhwb3J0JDE0ZDIzOGYzNDI3MjNmMjV9IGZyb20gXCIuL3VzZVZhbHVlRWZmZWN0Lm1qc1wiO1xuaW1wb3J0IHt1c2VTdGF0ZSBhcyAkZUtrRXAkdXNlU3RhdGUsIHVzZVJlZiBhcyAkZUtrRXAkdXNlUmVmLCB1c2VFZmZlY3QgYXMgJGVLa0VwJHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2sgYXMgJGVLa0VwJHVzZUNhbGxiYWNrfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7dXNlU1NSU2FmZUlkIGFzICRlS2tFcCR1c2VTU1JTYWZlSWR9IGZyb20gXCJAcmVhY3QtYXJpYS9zc3JcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuXG5cblxuLy8gY29waWVkIGZyb20gU1NSUHJvdmlkZXIudHN4IHRvIHJlZHVjZSBleHBvcnRzLCBpZiBuZWVkZWQgYWdhaW4sIGNvbnNpZGVyIHNoYXJpbmdcbmxldCAkYmRiMTEwMTBjZWY3MDIzNiR2YXIkY2FuVXNlRE9NID0gQm9vbGVhbih0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuZG9jdW1lbnQgJiYgd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xubGV0ICRiZGIxMTAxMGNlZjcwMjM2JGV4cG9ydCRkNDFhMDRjNzQ0ODNjNmVmID0gbmV3IE1hcCgpO1xuLy8gVGhpcyBhbGxvd3MgdXMgdG8gY2xlYW4gdXAgdGhlIGlkc1VwZGF0ZXJNYXAgd2hlbiB0aGUgaWQgaXMgbm8gbG9uZ2VyIHVzZWQuXG4vLyBNYXAgaXMgYSBzdHJvbmcgcmVmZXJlbmNlLCBzbyB1bnVzZWQgaWRzIHdvdWxkbid0IGJlIGNsZWFuZWQgdXAgb3RoZXJ3aXNlLlxuLy8gVGhpcyBjYW4gaGFwcGVuIGluIHN1c3BlbmRlZCBjb21wb25lbnRzIHdoZXJlIG1vdW50L3VubW91bnQgaXMgbm90IGNhbGxlZC5cbmxldCAkYmRiMTEwMTBjZWY3MDIzNiR2YXIkcmVnaXN0cnk7XG5pZiAodHlwZW9mIEZpbmFsaXphdGlvblJlZ2lzdHJ5ICE9PSAndW5kZWZpbmVkJykgJGJkYjExMDEwY2VmNzAyMzYkdmFyJHJlZ2lzdHJ5ID0gbmV3IEZpbmFsaXphdGlvblJlZ2lzdHJ5KChoZWxkVmFsdWUpPT57XG4gICAgJGJkYjExMDEwY2VmNzAyMzYkZXhwb3J0JGQ0MWEwNGM3NDQ4M2M2ZWYuZGVsZXRlKGhlbGRWYWx1ZSk7XG59KTtcbmZ1bmN0aW9uICRiZGIxMTAxMGNlZjcwMjM2JGV4cG9ydCRmNjgwODc3YTM0NzExZTM3KGRlZmF1bHRJZCkge1xuICAgIGxldCBbdmFsdWUsIHNldFZhbHVlXSA9ICgwLCAkZUtrRXAkdXNlU3RhdGUpKGRlZmF1bHRJZCk7XG4gICAgbGV0IG5leHRJZCA9ICgwLCAkZUtrRXAkdXNlUmVmKShudWxsKTtcbiAgICBsZXQgcmVzID0gKDAsICRlS2tFcCR1c2VTU1JTYWZlSWQpKHZhbHVlKTtcbiAgICBsZXQgY2xlYW51cFJlZiA9ICgwLCAkZUtrRXAkdXNlUmVmKShudWxsKTtcbiAgICBpZiAoJGJkYjExMDEwY2VmNzAyMzYkdmFyJHJlZ2lzdHJ5KSAkYmRiMTEwMTBjZWY3MDIzNiR2YXIkcmVnaXN0cnkucmVnaXN0ZXIoY2xlYW51cFJlZiwgcmVzKTtcbiAgICBpZiAoJGJkYjExMDEwY2VmNzAyMzYkdmFyJGNhblVzZURPTSkge1xuICAgICAgICBjb25zdCBjYWNoZUlkUmVmID0gJGJkYjExMDEwY2VmNzAyMzYkZXhwb3J0JGQ0MWEwNGM3NDQ4M2M2ZWYuZ2V0KHJlcyk7XG4gICAgICAgIGlmIChjYWNoZUlkUmVmICYmICFjYWNoZUlkUmVmLmluY2x1ZGVzKG5leHRJZCkpIGNhY2hlSWRSZWYucHVzaChuZXh0SWQpO1xuICAgICAgICBlbHNlICRiZGIxMTAxMGNlZjcwMjM2JGV4cG9ydCRkNDFhMDRjNzQ0ODNjNmVmLnNldChyZXMsIFtcbiAgICAgICAgICAgIG5leHRJZFxuICAgICAgICBdKTtcbiAgICB9XG4gICAgKDAsICRmMGEwNGNjZDhkYmRkODNiJGV4cG9ydCRlNWM1YTVmOTE3YTU4NzFjKSgoKT0+e1xuICAgICAgICBsZXQgciA9IHJlcztcbiAgICAgICAgcmV0dXJuICgpPT57XG4gICAgICAgICAgICAvLyBJbiBTdXNwZW5zZSwgdGhlIGNsZWFudXAgZnVuY3Rpb24gbWF5IGJlIG5vdCBjYWxsZWRcbiAgICAgICAgICAgIC8vIHdoZW4gaXQgaXMgdGhvdWdoLCBhbHNvIHJlbW92ZSBpdCBmcm9tIHRoZSBmaW5hbGl6YXRpb24gcmVnaXN0cnkuXG4gICAgICAgICAgICBpZiAoJGJkYjExMDEwY2VmNzAyMzYkdmFyJHJlZ2lzdHJ5KSAkYmRiMTEwMTBjZWY3MDIzNiR2YXIkcmVnaXN0cnkudW5yZWdpc3RlcihjbGVhbnVwUmVmKTtcbiAgICAgICAgICAgICRiZGIxMTAxMGNlZjcwMjM2JGV4cG9ydCRkNDFhMDRjNzQ0ODNjNmVmLmRlbGV0ZShyKTtcbiAgICAgICAgfTtcbiAgICB9LCBbXG4gICAgICAgIHJlc1xuICAgIF0pO1xuICAgIC8vIFRoaXMgY2Fubm90IGNhdXNlIGFuIGluZmluaXRlIGxvb3AgYmVjYXVzZSB0aGUgcmVmIGlzIGFsd2F5cyBjbGVhbmVkIHVwLlxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgICgwLCAkZUtrRXAkdXNlRWZmZWN0KSgoKT0+e1xuICAgICAgICBsZXQgbmV3SWQgPSBuZXh0SWQuY3VycmVudDtcbiAgICAgICAgaWYgKG5ld0lkKSBzZXRWYWx1ZShuZXdJZCk7XG4gICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgaWYgKG5ld0lkKSBuZXh0SWQuY3VycmVudCA9IG51bGw7XG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcztcbn1cbmZ1bmN0aW9uICRiZGIxMTAxMGNlZjcwMjM2JGV4cG9ydCRjZDhjOWNiNjhmODQyNjI5KGlkQSwgaWRCKSB7XG4gICAgaWYgKGlkQSA9PT0gaWRCKSByZXR1cm4gaWRBO1xuICAgIGxldCBzZXRJZHNBID0gJGJkYjExMDEwY2VmNzAyMzYkZXhwb3J0JGQ0MWEwNGM3NDQ4M2M2ZWYuZ2V0KGlkQSk7XG4gICAgaWYgKHNldElkc0EpIHtcbiAgICAgICAgc2V0SWRzQS5mb3JFYWNoKChyZWYpPT5yZWYuY3VycmVudCA9IGlkQik7XG4gICAgICAgIHJldHVybiBpZEI7XG4gICAgfVxuICAgIGxldCBzZXRJZHNCID0gJGJkYjExMDEwY2VmNzAyMzYkZXhwb3J0JGQ0MWEwNGM3NDQ4M2M2ZWYuZ2V0KGlkQik7XG4gICAgaWYgKHNldElkc0IpIHtcbiAgICAgICAgc2V0SWRzQi5mb3JFYWNoKChyZWYpPT5yZWYuY3VycmVudCA9IGlkQSk7XG4gICAgICAgIHJldHVybiBpZEE7XG4gICAgfVxuICAgIHJldHVybiBpZEI7XG59XG5mdW5jdGlvbiAkYmRiMTEwMTBjZWY3MDIzNiRleHBvcnQkYjRjYzA5YzU5MmU4ZmRiOChkZXBBcnJheSA9IFtdKSB7XG4gICAgbGV0IGlkID0gJGJkYjExMDEwY2VmNzAyMzYkZXhwb3J0JGY2ODA4NzdhMzQ3MTFlMzcoKTtcbiAgICBsZXQgW3Jlc29sdmVkSWQsIHNldFJlc29sdmVkSWRdID0gKDAsICQxZGJlY2JlMjdhMDRmOWFmJGV4cG9ydCQxNGQyMzhmMzQyNzIzZjI1KShpZCk7XG4gICAgbGV0IHVwZGF0ZUlkID0gKDAsICRlS2tFcCR1c2VDYWxsYmFjaykoKCk9PntcbiAgICAgICAgc2V0UmVzb2x2ZWRJZChmdW5jdGlvbiooKSB7XG4gICAgICAgICAgICB5aWVsZCBpZDtcbiAgICAgICAgICAgIHlpZWxkIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSA/IGlkIDogdW5kZWZpbmVkO1xuICAgICAgICB9KTtcbiAgICB9LCBbXG4gICAgICAgIGlkLFxuICAgICAgICBzZXRSZXNvbHZlZElkXG4gICAgXSk7XG4gICAgKDAsICRmMGEwNGNjZDhkYmRkODNiJGV4cG9ydCRlNWM1YTVmOTE3YTU4NzFjKSh1cGRhdGVJZCwgW1xuICAgICAgICBpZCxcbiAgICAgICAgdXBkYXRlSWQsXG4gICAgICAgIC4uLmRlcEFycmF5XG4gICAgXSk7XG4gICAgcmV0dXJuIHJlc29sdmVkSWQ7XG59XG5cblxuZXhwb3J0IHskYmRiMTEwMTBjZWY3MDIzNiRleHBvcnQkZDQxYTA0Yzc0NDgzYzZlZiBhcyBpZHNVcGRhdGVyTWFwLCAkYmRiMTEwMTBjZWY3MDIzNiRleHBvcnQkZjY4MDg3N2EzNDcxMWUzNyBhcyB1c2VJZCwgJGJkYjExMDEwY2VmNzAyMzYkZXhwb3J0JGNkOGM5Y2I2OGY4NDI2MjkgYXMgbWVyZ2VJZHMsICRiZGIxMTAxMGNlZjcwMjM2JGV4cG9ydCRiNGNjMDljNTkyZThmZGI4IGFzIHVzZVNsb3RJZH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VJZC5tb2R1bGUuanMubWFwXG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjAgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gLyoqXG4gKiBDYWxscyBhbGwgZnVuY3Rpb25zIGluIHRoZSBvcmRlciB0aGV5IHdlcmUgY2hhaW5lZCB3aXRoIHRoZSBzYW1lIGFyZ3VtZW50cy5cbiAqLyBmdW5jdGlvbiAkZmY1OTYzZWIxZmNjZjU1MiRleHBvcnQkZTA4ZTNiNjdlMzkyMTAxZSguLi5jYWxsYmFja3MpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpPT57XG4gICAgICAgIGZvciAobGV0IGNhbGxiYWNrIG9mIGNhbGxiYWNrcylpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjayguLi5hcmdzKTtcbiAgICB9O1xufVxuXG5cbmV4cG9ydCB7JGZmNTk2M2ViMWZjY2Y1NTIkZXhwb3J0JGUwOGUzYjY3ZTM5MjEwMWUgYXMgY2hhaW59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y2hhaW4ubW9kdWxlLmpzLm1hcFxuIiwiY29uc3QgJDQzMWZiZDg2Y2E3ZGMyMTYkZXhwb3J0JGIyMDRhZjE1ODA0MmZiYWMgPSAoZWwpPT57XG4gICAgdmFyIF9lbF9vd25lckRvY3VtZW50O1xuICAgIHJldHVybiAoX2VsX293bmVyRG9jdW1lbnQgPSBlbCA9PT0gbnVsbCB8fCBlbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogZWwub3duZXJEb2N1bWVudCkgIT09IG51bGwgJiYgX2VsX293bmVyRG9jdW1lbnQgIT09IHZvaWQgMCA/IF9lbF9vd25lckRvY3VtZW50IDogZG9jdW1lbnQ7XG59O1xuY29uc3QgJDQzMWZiZDg2Y2E3ZGMyMTYkZXhwb3J0JGYyMWExZmZhZTI2MDE0NWEgPSAoZWwpPT57XG4gICAgaWYgKGVsICYmICd3aW5kb3cnIGluIGVsICYmIGVsLndpbmRvdyA9PT0gZWwpIHJldHVybiBlbDtcbiAgICBjb25zdCBkb2MgPSAkNDMxZmJkODZjYTdkYzIxNiRleHBvcnQkYjIwNGFmMTU4MDQyZmJhYyhlbCk7XG4gICAgcmV0dXJuIGRvYy5kZWZhdWx0VmlldyB8fCB3aW5kb3c7XG59O1xuLyoqXG4gKiBUeXBlIGd1YXJkIHRoYXQgY2hlY2tzIGlmIGEgdmFsdWUgaXMgYSBOb2RlLiBWZXJpZmllcyB0aGUgcHJlc2VuY2UgYW5kIHR5cGUgb2YgdGhlIG5vZGVUeXBlIHByb3BlcnR5LlxuICovIGZ1bmN0aW9uICQ0MzFmYmQ4NmNhN2RjMjE2JHZhciRpc05vZGUodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiAnbm9kZVR5cGUnIGluIHZhbHVlICYmIHR5cGVvZiB2YWx1ZS5ub2RlVHlwZSA9PT0gJ251bWJlcic7XG59XG5mdW5jdGlvbiAkNDMxZmJkODZjYTdkYzIxNiRleHBvcnQkYWY1MWYwZjA2YzBmMzI4YShub2RlKSB7XG4gICAgcmV0dXJuICQ0MzFmYmQ4NmNhN2RjMjE2JHZhciRpc05vZGUobm9kZSkgJiYgbm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5ET0NVTUVOVF9GUkFHTUVOVF9OT0RFICYmICdob3N0JyBpbiBub2RlO1xufVxuXG5cbmV4cG9ydCB7JDQzMWZiZDg2Y2E3ZGMyMTYkZXhwb3J0JGIyMDRhZjE1ODA0MmZiYWMgYXMgZ2V0T3duZXJEb2N1bWVudCwgJDQzMWZiZDg2Y2E3ZGMyMTYkZXhwb3J0JGYyMWExZmZhZTI2MDE0NWEgYXMgZ2V0T3duZXJXaW5kb3csICQ0MzFmYmQ4NmNhN2RjMjE2JGV4cG9ydCRhZjUxZjBmMDZjMGYzMjhhIGFzIGlzU2hhZG93Um9vdH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kb21IZWxwZXJzLm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7aXNTaGFkb3dSb290IGFzICQ0MzFmYmQ4NmNhN2RjMjE2JGV4cG9ydCRhZjUxZjBmMDZjMGYzMjhhfSBmcm9tIFwiLi9kb21IZWxwZXJzLm1qc1wiO1xuaW1wb3J0IHtzaGFkb3dET00gYXMgJGxjU3U1JHNoYWRvd0RPTX0gZnJvbSBcIkByZWFjdC1zdGF0ZWx5L2ZsYWdzXCI7XG5cbi8vIFNvdXJjZTogaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC90YWJzdGVyL2Jsb2IvYTg5ZmM1ZDdlMzMyZDQ4ZjY4ZDAzYjFjYTZlMzQ0NDg5ZDFjMzg5OC9zcmMvU2hhZG93ZG9taXplL0RPTUZ1bmN0aW9ucy50cyNMMTZcblxuXG5mdW5jdGlvbiAkZDRlZTEwZGUzMDZmMjUxMCRleHBvcnQkNDI4MmY3MDc5ODA2NGZlMChub2RlLCBvdGhlck5vZGUpIHtcbiAgICBpZiAoISgwLCAkbGNTdTUkc2hhZG93RE9NKSgpKSByZXR1cm4gb3RoZXJOb2RlICYmIG5vZGUgPyBub2RlLmNvbnRhaW5zKG90aGVyTm9kZSkgOiBmYWxzZTtcbiAgICBpZiAoIW5vZGUgfHwgIW90aGVyTm9kZSkgcmV0dXJuIGZhbHNlO1xuICAgIGxldCBjdXJyZW50Tm9kZSA9IG90aGVyTm9kZTtcbiAgICB3aGlsZShjdXJyZW50Tm9kZSAhPT0gbnVsbCl7XG4gICAgICAgIGlmIChjdXJyZW50Tm9kZSA9PT0gbm9kZSkgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmIChjdXJyZW50Tm9kZS50YWdOYW1lID09PSAnU0xPVCcgJiYgY3VycmVudE5vZGUuYXNzaWduZWRTbG90KSAvLyBFbGVtZW50IGlzIHNsb3R0ZWRcbiAgICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5hc3NpZ25lZFNsb3QucGFyZW50Tm9kZTtcbiAgICAgICAgZWxzZSBpZiAoKDAsICQ0MzFmYmQ4NmNhN2RjMjE2JGV4cG9ydCRhZjUxZjBmMDZjMGYzMjhhKShjdXJyZW50Tm9kZSkpIC8vIEVsZW1lbnQgaXMgaW4gc2hhZG93IHJvb3RcbiAgICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5ob3N0O1xuICAgICAgICBlbHNlIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUucGFyZW50Tm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuY29uc3QgJGQ0ZWUxMGRlMzA2ZjI1MTAkZXhwb3J0JGNkNGU1NTczZmJlMmI1NzYgPSAoZG9jID0gZG9jdW1lbnQpPT57XG4gICAgdmFyIF9hY3RpdmVFbGVtZW50X3NoYWRvd1Jvb3Q7XG4gICAgaWYgKCEoMCwgJGxjU3U1JHNoYWRvd0RPTSkoKSkgcmV0dXJuIGRvYy5hY3RpdmVFbGVtZW50O1xuICAgIGxldCBhY3RpdmVFbGVtZW50ID0gZG9jLmFjdGl2ZUVsZW1lbnQ7XG4gICAgd2hpbGUoYWN0aXZlRWxlbWVudCAmJiAnc2hhZG93Um9vdCcgaW4gYWN0aXZlRWxlbWVudCAmJiAoKF9hY3RpdmVFbGVtZW50X3NoYWRvd1Jvb3QgPSBhY3RpdmVFbGVtZW50LnNoYWRvd1Jvb3QpID09PSBudWxsIHx8IF9hY3RpdmVFbGVtZW50X3NoYWRvd1Jvb3QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hY3RpdmVFbGVtZW50X3NoYWRvd1Jvb3QuYWN0aXZlRWxlbWVudCkpYWN0aXZlRWxlbWVudCA9IGFjdGl2ZUVsZW1lbnQuc2hhZG93Um9vdC5hY3RpdmVFbGVtZW50O1xuICAgIHJldHVybiBhY3RpdmVFbGVtZW50O1xufTtcbmZ1bmN0aW9uICRkNGVlMTBkZTMwNmYyNTEwJGV4cG9ydCRlNThmMDI5ZjBmYmZkYjI5KGV2ZW50KSB7XG4gICAgaWYgKCgwLCAkbGNTdTUkc2hhZG93RE9NKSgpICYmIGV2ZW50LnRhcmdldC5zaGFkb3dSb290KSB7XG4gICAgICAgIGlmIChldmVudC5jb21wb3NlZFBhdGgpIHJldHVybiBldmVudC5jb21wb3NlZFBhdGgoKVswXTtcbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50LnRhcmdldDtcbn1cblxuXG5leHBvcnQgeyRkNGVlMTBkZTMwNmYyNTEwJGV4cG9ydCQ0MjgyZjcwNzk4MDY0ZmUwIGFzIG5vZGVDb250YWlucywgJGQ0ZWUxMGRlMzA2ZjI1MTAkZXhwb3J0JGNkNGU1NTczZmJlMmI1NzYgYXMgZ2V0QWN0aXZlRWxlbWVudCwgJGQ0ZWUxMGRlMzA2ZjI1MTAkZXhwb3J0JGU1OGYwMjlmMGZiZmRiMjkgYXMgZ2V0RXZlbnRUYXJnZXR9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RE9NRnVuY3Rpb25zLm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7bm9kZUNvbnRhaW5zIGFzICRkNGVlMTBkZTMwNmYyNTEwJGV4cG9ydCQ0MjgyZjcwNzk4MDY0ZmUwfSBmcm9tIFwiLi9ET01GdW5jdGlvbnMubWpzXCI7XG5pbXBvcnQge3NoYWRvd0RPTSBhcyAkYkpLWGckc2hhZG93RE9NfSBmcm9tIFwiQHJlYWN0LXN0YXRlbHkvZmxhZ3NcIjtcblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC90YWJzdGVyL2Jsb2IvYTg5ZmM1ZDdlMzMyZDQ4ZjY4ZDAzYjFjYTZlMzQ0NDg5ZDFjMzg5OC9zcmMvU2hhZG93ZG9taXplL1NoYWRvd1RyZWVXYWxrZXIudHNcblxuXG5jbGFzcyAkZGZjNTQwMzExYmY3ZjEwOSRleHBvcnQkNjNlYjNhYmFiYTljNTVjNCB7XG4gICAgZ2V0IGN1cnJlbnROb2RlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudE5vZGU7XG4gICAgfVxuICAgIHNldCBjdXJyZW50Tm9kZShub2RlKSB7XG4gICAgICAgIGlmICghKDAsICRkNGVlMTBkZTMwNmYyNTEwJGV4cG9ydCQ0MjgyZjcwNzk4MDY0ZmUwKSh0aGlzLnJvb3QsIG5vZGUpKSB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBzZXQgY3VycmVudE5vZGUgdG8gYSBub2RlIHRoYXQgaXMgbm90IGNvbnRhaW5lZCBieSB0aGUgcm9vdCBub2RlLicpO1xuICAgICAgICBjb25zdCB3YWxrZXJzID0gW107XG4gICAgICAgIGxldCBjdXJOb2RlID0gbm9kZTtcbiAgICAgICAgbGV0IGN1cnJlbnRXYWxrZXJDdXJyZW50Tm9kZSA9IG5vZGU7XG4gICAgICAgIHRoaXMuX2N1cnJlbnROb2RlID0gbm9kZTtcbiAgICAgICAgd2hpbGUoY3VyTm9kZSAmJiBjdXJOb2RlICE9PSB0aGlzLnJvb3QpaWYgKGN1ck5vZGUubm9kZVR5cGUgPT09IE5vZGUuRE9DVU1FTlRfRlJBR01FTlRfTk9ERSkge1xuICAgICAgICAgICAgY29uc3Qgc2hhZG93Um9vdCA9IGN1ck5vZGU7XG4gICAgICAgICAgICBjb25zdCB3YWxrZXIgPSB0aGlzLl9kb2MuY3JlYXRlVHJlZVdhbGtlcihzaGFkb3dSb290LCB0aGlzLndoYXRUb1Nob3csIHtcbiAgICAgICAgICAgICAgICBhY2NlcHROb2RlOiB0aGlzLl9hY2NlcHROb2RlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHdhbGtlcnMucHVzaCh3YWxrZXIpO1xuICAgICAgICAgICAgd2Fsa2VyLmN1cnJlbnROb2RlID0gY3VycmVudFdhbGtlckN1cnJlbnROb2RlO1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFNldEZvci5hZGQod2Fsa2VyKTtcbiAgICAgICAgICAgIGN1ck5vZGUgPSBjdXJyZW50V2Fsa2VyQ3VycmVudE5vZGUgPSBzaGFkb3dSb290Lmhvc3Q7XG4gICAgICAgIH0gZWxzZSBjdXJOb2RlID0gY3VyTm9kZS5wYXJlbnROb2RlO1xuICAgICAgICBjb25zdCB3YWxrZXIgPSB0aGlzLl9kb2MuY3JlYXRlVHJlZVdhbGtlcih0aGlzLnJvb3QsIHRoaXMud2hhdFRvU2hvdywge1xuICAgICAgICAgICAgYWNjZXB0Tm9kZTogdGhpcy5fYWNjZXB0Tm9kZVxuICAgICAgICB9KTtcbiAgICAgICAgd2Fsa2Vycy5wdXNoKHdhbGtlcik7XG4gICAgICAgIHdhbGtlci5jdXJyZW50Tm9kZSA9IGN1cnJlbnRXYWxrZXJDdXJyZW50Tm9kZTtcbiAgICAgICAgdGhpcy5fY3VycmVudFNldEZvci5hZGQod2Fsa2VyKTtcbiAgICAgICAgdGhpcy5fd2Fsa2VyU3RhY2sgPSB3YWxrZXJzO1xuICAgIH1cbiAgICBnZXQgZG9jKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZG9jO1xuICAgIH1cbiAgICBmaXJzdENoaWxkKCkge1xuICAgICAgICBsZXQgY3VycmVudE5vZGUgPSB0aGlzLmN1cnJlbnROb2RlO1xuICAgICAgICBsZXQgbmV3Tm9kZSA9IHRoaXMubmV4dE5vZGUoKTtcbiAgICAgICAgaWYgKCEoMCwgJGQ0ZWUxMGRlMzA2ZjI1MTAkZXhwb3J0JDQyODJmNzA3OTgwNjRmZTApKGN1cnJlbnROb2RlLCBuZXdOb2RlKSkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5ld05vZGUpIHRoaXMuY3VycmVudE5vZGUgPSBuZXdOb2RlO1xuICAgICAgICByZXR1cm4gbmV3Tm9kZTtcbiAgICB9XG4gICAgbGFzdENoaWxkKCkge1xuICAgICAgICBsZXQgd2Fsa2VyID0gdGhpcy5fd2Fsa2VyU3RhY2tbMF07XG4gICAgICAgIGxldCBuZXdOb2RlID0gd2Fsa2VyLmxhc3RDaGlsZCgpO1xuICAgICAgICBpZiAobmV3Tm9kZSkgdGhpcy5jdXJyZW50Tm9kZSA9IG5ld05vZGU7XG4gICAgICAgIHJldHVybiBuZXdOb2RlO1xuICAgIH1cbiAgICBuZXh0Tm9kZSgpIHtcbiAgICAgICAgY29uc3QgbmV4dE5vZGUgPSB0aGlzLl93YWxrZXJTdGFja1swXS5uZXh0Tm9kZSgpO1xuICAgICAgICBpZiAobmV4dE5vZGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHNoYWRvd1Jvb3QgPSBuZXh0Tm9kZS5zaGFkb3dSb290O1xuICAgICAgICAgICAgaWYgKHNoYWRvd1Jvb3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXNfZmlsdGVyO1xuICAgICAgICAgICAgICAgIGxldCBub2RlUmVzdWx0O1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5maWx0ZXIgPT09ICdmdW5jdGlvbicpIG5vZGVSZXN1bHQgPSB0aGlzLmZpbHRlcihuZXh0Tm9kZSk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoKF90aGlzX2ZpbHRlciA9IHRoaXMuZmlsdGVyKSA9PT0gbnVsbCB8fCBfdGhpc19maWx0ZXIgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF90aGlzX2ZpbHRlci5hY2NlcHROb2RlKSBub2RlUmVzdWx0ID0gdGhpcy5maWx0ZXIuYWNjZXB0Tm9kZShuZXh0Tm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGVSZXN1bHQgPT09IE5vZGVGaWx0ZXIuRklMVEVSX0FDQ0VQVCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnROb2RlID0gbmV4dE5vZGU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXh0Tm9kZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gX2FjY2VwdE5vZGUgc2hvdWxkIGhhdmUgYWRkZWQgbmV3IHdhbGtlciBmb3IgdGhpcyBzaGFkb3csXG4gICAgICAgICAgICAgICAgLy8gZ28gaW4gcmVjdXJzaXZlbHkuXG4gICAgICAgICAgICAgICAgbGV0IG5ld05vZGUgPSB0aGlzLm5leHROb2RlKCk7XG4gICAgICAgICAgICAgICAgaWYgKG5ld05vZGUpIHRoaXMuY3VycmVudE5vZGUgPSBuZXdOb2RlO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXdOb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5leHROb2RlKSB0aGlzLmN1cnJlbnROb2RlID0gbmV4dE5vZGU7XG4gICAgICAgICAgICByZXR1cm4gbmV4dE5vZGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fd2Fsa2VyU3RhY2subGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3dhbGtlclN0YWNrLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgbGV0IG5ld05vZGUgPSB0aGlzLm5leHROb2RlKCk7XG4gICAgICAgICAgICAgICAgaWYgKG5ld05vZGUpIHRoaXMuY3VycmVudE5vZGUgPSBuZXdOb2RlO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXdOb2RlO1xuICAgICAgICAgICAgfSBlbHNlIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByZXZpb3VzTm9kZSgpIHtcbiAgICAgICAgY29uc3QgY3VycmVudFdhbGtlciA9IHRoaXMuX3dhbGtlclN0YWNrWzBdO1xuICAgICAgICBpZiAoY3VycmVudFdhbGtlci5jdXJyZW50Tm9kZSA9PT0gY3VycmVudFdhbGtlci5yb290KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY3VycmVudFNldEZvci5oYXMoY3VycmVudFdhbGtlcikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJyZW50U2V0Rm9yLmRlbGV0ZShjdXJyZW50V2Fsa2VyKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fd2Fsa2VyU3RhY2subGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl93YWxrZXJTdGFjay5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3Tm9kZSA9IHRoaXMucHJldmlvdXNOb2RlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdOb2RlKSB0aGlzLmN1cnJlbnROb2RlID0gbmV3Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld05vZGU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJldmlvdXNOb2RlID0gY3VycmVudFdhbGtlci5wcmV2aW91c05vZGUoKTtcbiAgICAgICAgaWYgKHByZXZpb3VzTm9kZSkge1xuICAgICAgICAgICAgY29uc3Qgc2hhZG93Um9vdCA9IHByZXZpb3VzTm9kZS5zaGFkb3dSb290O1xuICAgICAgICAgICAgaWYgKHNoYWRvd1Jvb3QpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXNfZmlsdGVyO1xuICAgICAgICAgICAgICAgIGxldCBub2RlUmVzdWx0O1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5maWx0ZXIgPT09ICdmdW5jdGlvbicpIG5vZGVSZXN1bHQgPSB0aGlzLmZpbHRlcihwcmV2aW91c05vZGUpO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKChfdGhpc19maWx0ZXIgPSB0aGlzLmZpbHRlcikgPT09IG51bGwgfHwgX3RoaXNfZmlsdGVyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfdGhpc19maWx0ZXIuYWNjZXB0Tm9kZSkgbm9kZVJlc3VsdCA9IHRoaXMuZmlsdGVyLmFjY2VwdE5vZGUocHJldmlvdXNOb2RlKTtcbiAgICAgICAgICAgICAgICBpZiAobm9kZVJlc3VsdCA9PT0gTm9kZUZpbHRlci5GSUxURVJfQUNDRVBUKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2aW91c05vZGUpIHRoaXMuY3VycmVudE5vZGUgPSBwcmV2aW91c05vZGU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmV2aW91c05vZGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIF9hY2NlcHROb2RlIHNob3VsZCBoYXZlIGFkZGVkIG5ldyB3YWxrZXIgZm9yIHRoaXMgc2hhZG93LFxuICAgICAgICAgICAgICAgIC8vIGdvIGluIHJlY3Vyc2l2ZWx5LlxuICAgICAgICAgICAgICAgIGxldCBuZXdOb2RlID0gdGhpcy5sYXN0Q2hpbGQoKTtcbiAgICAgICAgICAgICAgICBpZiAobmV3Tm9kZSkgdGhpcy5jdXJyZW50Tm9kZSA9IG5ld05vZGU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ld05vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHJldmlvdXNOb2RlKSB0aGlzLmN1cnJlbnROb2RlID0gcHJldmlvdXNOb2RlO1xuICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzTm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl93YWxrZXJTdGFjay5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fd2Fsa2VyU3RhY2suc2hpZnQoKTtcbiAgICAgICAgICAgICAgICBsZXQgbmV3Tm9kZSA9IHRoaXMucHJldmlvdXNOb2RlKCk7XG4gICAgICAgICAgICAgICAgaWYgKG5ld05vZGUpIHRoaXMuY3VycmVudE5vZGUgPSBuZXdOb2RlO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXdOb2RlO1xuICAgICAgICAgICAgfSBlbHNlIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICovIG5leHRTaWJsaW5nKCkge1xuICAgICAgICAvLyBpZiAoX19ERVZfXykge1xuICAgICAgICAvLyAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgICAgIC8vIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICovIHByZXZpb3VzU2libGluZygpIHtcbiAgICAgICAgLy8gaWYgKF9fREVWX18pIHtcbiAgICAgICAgLy8gICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgICAgICAvLyB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqLyBwYXJlbnROb2RlKCkge1xuICAgICAgICAvLyBpZiAoX19ERVZfXykge1xuICAgICAgICAvLyAgICAgdGhyb3cgbmV3IEVycm9yKFwiTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gICAgICAgIC8vIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGRvYywgcm9vdCwgd2hhdFRvU2hvdywgZmlsdGVyKXtcbiAgICAgICAgdGhpcy5fd2Fsa2VyU3RhY2sgPSBbXTtcbiAgICAgICAgdGhpcy5fY3VycmVudFNldEZvciA9IG5ldyBTZXQoKTtcbiAgICAgICAgdGhpcy5fYWNjZXB0Tm9kZSA9IChub2RlKT0+e1xuICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2hhZG93Um9vdCA9IG5vZGUuc2hhZG93Um9vdDtcbiAgICAgICAgICAgICAgICBpZiAoc2hhZG93Um9vdCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB3YWxrZXIgPSB0aGlzLl9kb2MuY3JlYXRlVHJlZVdhbGtlcihzaGFkb3dSb290LCB0aGlzLndoYXRUb1Nob3csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY2VwdE5vZGU6IHRoaXMuX2FjY2VwdE5vZGVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3dhbGtlclN0YWNrLnVuc2hpZnQod2Fsa2VyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE5vZGVGaWx0ZXIuRklMVEVSX0FDQ0VQVDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgX3RoaXNfZmlsdGVyO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuZmlsdGVyID09PSAnZnVuY3Rpb24nKSByZXR1cm4gdGhpcy5maWx0ZXIobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKChfdGhpc19maWx0ZXIgPSB0aGlzLmZpbHRlcikgPT09IG51bGwgfHwgX3RoaXNfZmlsdGVyID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfdGhpc19maWx0ZXIuYWNjZXB0Tm9kZSkgcmV0dXJuIHRoaXMuZmlsdGVyLmFjY2VwdE5vZGUobm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZmlsdGVyID09PSBudWxsKSByZXR1cm4gTm9kZUZpbHRlci5GSUxURVJfQUNDRVBUO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBOb2RlRmlsdGVyLkZJTFRFUl9TS0lQO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9kb2MgPSBkb2M7XG4gICAgICAgIHRoaXMucm9vdCA9IHJvb3Q7XG4gICAgICAgIHRoaXMuZmlsdGVyID0gZmlsdGVyICE9PSBudWxsICYmIGZpbHRlciAhPT0gdm9pZCAwID8gZmlsdGVyIDogbnVsbDtcbiAgICAgICAgdGhpcy53aGF0VG9TaG93ID0gd2hhdFRvU2hvdyAhPT0gbnVsbCAmJiB3aGF0VG9TaG93ICE9PSB2b2lkIDAgPyB3aGF0VG9TaG93IDogTm9kZUZpbHRlci5TSE9XX0FMTDtcbiAgICAgICAgdGhpcy5fY3VycmVudE5vZGUgPSByb290O1xuICAgICAgICB0aGlzLl93YWxrZXJTdGFjay51bnNoaWZ0KGRvYy5jcmVhdGVUcmVlV2Fsa2VyKHJvb3QsIHdoYXRUb1Nob3csIHRoaXMuX2FjY2VwdE5vZGUpKTtcbiAgICAgICAgY29uc3Qgc2hhZG93Um9vdCA9IHJvb3Quc2hhZG93Um9vdDtcbiAgICAgICAgaWYgKHNoYWRvd1Jvb3QpIHtcbiAgICAgICAgICAgIGNvbnN0IHdhbGtlciA9IHRoaXMuX2RvYy5jcmVhdGVUcmVlV2Fsa2VyKHNoYWRvd1Jvb3QsIHRoaXMud2hhdFRvU2hvdywge1xuICAgICAgICAgICAgICAgIGFjY2VwdE5vZGU6IHRoaXMuX2FjY2VwdE5vZGVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fd2Fsa2VyU3RhY2sudW5zaGlmdCh3YWxrZXIpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gJGRmYzU0MDMxMWJmN2YxMDkkZXhwb3J0JDRkMGY4YmU4YjEyYTdlZjYoZG9jLCByb290LCB3aGF0VG9TaG93LCBmaWx0ZXIpIHtcbiAgICBpZiAoKDAsICRiSktYZyRzaGFkb3dET00pKCkpIHJldHVybiBuZXcgJGRmYzU0MDMxMWJmN2YxMDkkZXhwb3J0JDYzZWIzYWJhYmE5YzU1YzQoZG9jLCByb290LCB3aGF0VG9TaG93LCBmaWx0ZXIpO1xuICAgIHJldHVybiBkb2MuY3JlYXRlVHJlZVdhbGtlcihyb290LCB3aGF0VG9TaG93LCBmaWx0ZXIpO1xufVxuXG5cbmV4cG9ydCB7JGRmYzU0MDMxMWJmN2YxMDkkZXhwb3J0JDYzZWIzYWJhYmE5YzU1YzQgYXMgU2hhZG93VHJlZVdhbGtlciwgJGRmYzU0MDMxMWJmN2YxMDkkZXhwb3J0JDRkMGY4YmU4YjEyYTdlZjYgYXMgY3JlYXRlU2hhZG93VHJlZVdhbGtlcn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1TaGFkb3dUcmVlV2Fsa2VyLm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7Y2hhaW4gYXMgJGZmNTk2M2ViMWZjY2Y1NTIkZXhwb3J0JGUwOGUzYjY3ZTM5MjEwMWV9IGZyb20gXCIuL2NoYWluLm1qc1wiO1xuaW1wb3J0IHttZXJnZUlkcyBhcyAkYmRiMTEwMTBjZWY3MDIzNiRleHBvcnQkY2Q4YzljYjY4Zjg0MjYyOX0gZnJvbSBcIi4vdXNlSWQubWpzXCI7XG5pbXBvcnQgJDdqWHI5JGNsc3ggZnJvbSBcImNsc3hcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuXG5cbmZ1bmN0aW9uICQzZWY0MjU3NWRmODRiMzBiJGV4cG9ydCQ5ZDE2MTFjNzdjMmZlOTI4KC4uLmFyZ3MpIHtcbiAgICAvLyBTdGFydCB3aXRoIGEgYmFzZSBjbG9uZSBvZiB0aGUgZmlyc3QgYXJndW1lbnQuIFRoaXMgaXMgYSBsb3QgZmFzdGVyIHRoYW4gc3RhcnRpbmdcbiAgICAvLyB3aXRoIGFuIGVtcHR5IG9iamVjdCBhbmQgYWRkaW5nIHByb3BlcnRpZXMgYXMgd2UgZ28uXG4gICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgLi4uYXJnc1swXVxuICAgIH07XG4gICAgZm9yKGxldCBpID0gMTsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspe1xuICAgICAgICBsZXQgcHJvcHMgPSBhcmdzW2ldO1xuICAgICAgICBmb3IobGV0IGtleSBpbiBwcm9wcyl7XG4gICAgICAgICAgICBsZXQgYSA9IHJlc3VsdFtrZXldO1xuICAgICAgICAgICAgbGV0IGIgPSBwcm9wc1trZXldO1xuICAgICAgICAgICAgLy8gQ2hhaW4gZXZlbnRzXG4gICAgICAgICAgICBpZiAodHlwZW9mIGEgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGIgPT09ICdmdW5jdGlvbicgJiYgLy8gVGhpcyBpcyBhIGxvdCBmYXN0ZXIgdGhhbiBhIHJlZ2V4LlxuICAgICAgICAgICAga2V5WzBdID09PSAnbycgJiYga2V5WzFdID09PSAnbicgJiYga2V5LmNoYXJDb2RlQXQoMikgPj0gLyogJ0EnICovIDY1ICYmIGtleS5jaGFyQ29kZUF0KDIpIDw9IC8qICdaJyAqLyA5MCkgcmVzdWx0W2tleV0gPSAoMCwgJGZmNTk2M2ViMWZjY2Y1NTIkZXhwb3J0JGUwOGUzYjY3ZTM5MjEwMWUpKGEsIGIpO1xuICAgICAgICAgICAgZWxzZSBpZiAoKGtleSA9PT0gJ2NsYXNzTmFtZScgfHwga2V5ID09PSAnVU5TQUZFX2NsYXNzTmFtZScpICYmIHR5cGVvZiBhID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgYiA9PT0gJ3N0cmluZycpIHJlc3VsdFtrZXldID0gKDAsICQ3alhyOSRjbHN4KShhLCBiKTtcbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PT0gJ2lkJyAmJiBhICYmIGIpIHJlc3VsdC5pZCA9ICgwLCAkYmRiMTEwMTBjZWY3MDIzNiRleHBvcnQkY2Q4YzljYjY4Zjg0MjYyOSkoYSwgYik7XG4gICAgICAgICAgICBlbHNlIHJlc3VsdFtrZXldID0gYiAhPT0gdW5kZWZpbmVkID8gYiA6IGE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuXG5leHBvcnQgeyQzZWY0MjU3NWRmODRiMzBiJGV4cG9ydCQ5ZDE2MTFjNzdjMmZlOTI4IGFzIG1lcmdlUHJvcHN9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWVyZ2VQcm9wcy5tb2R1bGUuanMubWFwXG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjAgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gZnVuY3Rpb24gJDVkYzk1ODk5YjMwNmY2MzAkZXhwb3J0JGM5MDU4MzE2NzY0YzE0MGUoLi4ucmVmcykge1xuICAgIGlmIChyZWZzLmxlbmd0aCA9PT0gMSAmJiByZWZzWzBdKSByZXR1cm4gcmVmc1swXTtcbiAgICByZXR1cm4gKHZhbHVlKT0+e1xuICAgICAgICBsZXQgaGFzQ2xlYW51cCA9IGZhbHNlO1xuICAgICAgICBjb25zdCBjbGVhbnVwcyA9IHJlZnMubWFwKChyZWYpPT57XG4gICAgICAgICAgICBjb25zdCBjbGVhbnVwID0gJDVkYzk1ODk5YjMwNmY2MzAkdmFyJHNldFJlZihyZWYsIHZhbHVlKTtcbiAgICAgICAgICAgIGhhc0NsZWFudXAgfHwgKGhhc0NsZWFudXAgPSB0eXBlb2YgY2xlYW51cCA9PSAnZnVuY3Rpb24nKTtcbiAgICAgICAgICAgIHJldHVybiBjbGVhbnVwO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGhhc0NsZWFudXApIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgY2xlYW51cHMuZm9yRWFjaCgoY2xlYW51cCwgaSk9PntcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNsZWFudXAgPT09ICdmdW5jdGlvbicpIGNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICBlbHNlICQ1ZGM5NTg5OWIzMDZmNjMwJHZhciRzZXRSZWYocmVmc1tpXSwgbnVsbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9O1xufVxuZnVuY3Rpb24gJDVkYzk1ODk5YjMwNmY2MzAkdmFyJHNldFJlZihyZWYsIHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiByZWYgPT09ICdmdW5jdGlvbicpIHJldHVybiByZWYodmFsdWUpO1xuICAgIGVsc2UgaWYgKHJlZiAhPSBudWxsKSByZWYuY3VycmVudCA9IHZhbHVlO1xufVxuXG5cbmV4cG9ydCB7JDVkYzk1ODk5YjMwNmY2MzAkZXhwb3J0JGM5MDU4MzE2NzY0YzE0MGUgYXMgbWVyZ2VSZWZzfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1lcmdlUmVmcy5tb2R1bGUuanMubWFwXG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjAgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gY29uc3QgJDY1NDg0ZDAyZGNiN2ViM2UkdmFyJERPTVByb3BOYW1lcyA9IG5ldyBTZXQoW1xuICAgICdpZCdcbl0pO1xuY29uc3QgJDY1NDg0ZDAyZGNiN2ViM2UkdmFyJGxhYmVsYWJsZVByb3BOYW1lcyA9IG5ldyBTZXQoW1xuICAgICdhcmlhLWxhYmVsJyxcbiAgICAnYXJpYS1sYWJlbGxlZGJ5JyxcbiAgICAnYXJpYS1kZXNjcmliZWRieScsXG4gICAgJ2FyaWEtZGV0YWlscydcbl0pO1xuLy8gU2VlIExpbmtET01Qcm9wcyBpbiBkb20uZC50cy5cbmNvbnN0ICQ2NTQ4NGQwMmRjYjdlYjNlJHZhciRsaW5rUHJvcE5hbWVzID0gbmV3IFNldChbXG4gICAgJ2hyZWYnLFxuICAgICdocmVmTGFuZycsXG4gICAgJ3RhcmdldCcsXG4gICAgJ3JlbCcsXG4gICAgJ2Rvd25sb2FkJyxcbiAgICAncGluZycsXG4gICAgJ3JlZmVycmVyUG9saWN5J1xuXSk7XG5jb25zdCAkNjU0ODRkMDJkY2I3ZWIzZSR2YXIkZ2xvYmFsQXR0cnMgPSBuZXcgU2V0KFtcbiAgICAnZGlyJyxcbiAgICAnbGFuZycsXG4gICAgJ2hpZGRlbicsXG4gICAgJ2luZXJ0JyxcbiAgICAndHJhbnNsYXRlJ1xuXSk7XG5jb25zdCAkNjU0ODRkMDJkY2I3ZWIzZSR2YXIkZ2xvYmFsRXZlbnRzID0gbmV3IFNldChbXG4gICAgJ29uQ2xpY2snLFxuICAgICdvbkF1eENsaWNrJyxcbiAgICAnb25Db250ZXh0TWVudScsXG4gICAgJ29uRG91YmxlQ2xpY2snLFxuICAgICdvbk1vdXNlRG93bicsXG4gICAgJ29uTW91c2VFbnRlcicsXG4gICAgJ29uTW91c2VMZWF2ZScsXG4gICAgJ29uTW91c2VNb3ZlJyxcbiAgICAnb25Nb3VzZU91dCcsXG4gICAgJ29uTW91c2VPdmVyJyxcbiAgICAnb25Nb3VzZVVwJyxcbiAgICAnb25Ub3VjaENhbmNlbCcsXG4gICAgJ29uVG91Y2hFbmQnLFxuICAgICdvblRvdWNoTW92ZScsXG4gICAgJ29uVG91Y2hTdGFydCcsXG4gICAgJ29uUG9pbnRlckRvd24nLFxuICAgICdvblBvaW50ZXJNb3ZlJyxcbiAgICAnb25Qb2ludGVyVXAnLFxuICAgICdvblBvaW50ZXJDYW5jZWwnLFxuICAgICdvblBvaW50ZXJFbnRlcicsXG4gICAgJ29uUG9pbnRlckxlYXZlJyxcbiAgICAnb25Qb2ludGVyT3ZlcicsXG4gICAgJ29uUG9pbnRlck91dCcsXG4gICAgJ29uR290UG9pbnRlckNhcHR1cmUnLFxuICAgICdvbkxvc3RQb2ludGVyQ2FwdHVyZScsXG4gICAgJ29uU2Nyb2xsJyxcbiAgICAnb25XaGVlbCcsXG4gICAgJ29uQW5pbWF0aW9uU3RhcnQnLFxuICAgICdvbkFuaW1hdGlvbkVuZCcsXG4gICAgJ29uQW5pbWF0aW9uSXRlcmF0aW9uJyxcbiAgICAnb25UcmFuc2l0aW9uQ2FuY2VsJyxcbiAgICAnb25UcmFuc2l0aW9uRW5kJyxcbiAgICAnb25UcmFuc2l0aW9uUnVuJyxcbiAgICAnb25UcmFuc2l0aW9uU3RhcnQnXG5dKTtcbmNvbnN0ICQ2NTQ4NGQwMmRjYjdlYjNlJHZhciRwcm9wUmUgPSAvXihkYXRhLS4qKSQvO1xuZnVuY3Rpb24gJDY1NDg0ZDAyZGNiN2ViM2UkZXhwb3J0JDQ1N2MzZDY1MThkZDRjNmYocHJvcHMsIG9wdHMgPSB7fSkge1xuICAgIGxldCB7IGxhYmVsYWJsZTogbGFiZWxhYmxlLCBpc0xpbms6IGlzTGluaywgZ2xvYmFsOiBnbG9iYWwsIGV2ZW50czogZXZlbnRzID0gZ2xvYmFsLCBwcm9wTmFtZXM6IHByb3BOYW1lcyB9ID0gb3B0cztcbiAgICBsZXQgZmlsdGVyZWRQcm9wcyA9IHt9O1xuICAgIGZvcihjb25zdCBwcm9wIGluIHByb3BzKWlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocHJvcHMsIHByb3ApICYmICgkNjU0ODRkMDJkY2I3ZWIzZSR2YXIkRE9NUHJvcE5hbWVzLmhhcyhwcm9wKSB8fCBsYWJlbGFibGUgJiYgJDY1NDg0ZDAyZGNiN2ViM2UkdmFyJGxhYmVsYWJsZVByb3BOYW1lcy5oYXMocHJvcCkgfHwgaXNMaW5rICYmICQ2NTQ4NGQwMmRjYjdlYjNlJHZhciRsaW5rUHJvcE5hbWVzLmhhcyhwcm9wKSB8fCBnbG9iYWwgJiYgJDY1NDg0ZDAyZGNiN2ViM2UkdmFyJGdsb2JhbEF0dHJzLmhhcyhwcm9wKSB8fCBldmVudHMgJiYgJDY1NDg0ZDAyZGNiN2ViM2UkdmFyJGdsb2JhbEV2ZW50cy5oYXMocHJvcCkgfHwgcHJvcC5lbmRzV2l0aCgnQ2FwdHVyZScpICYmICQ2NTQ4NGQwMmRjYjdlYjNlJHZhciRnbG9iYWxFdmVudHMuaGFzKHByb3Auc2xpY2UoMCwgLTcpKSB8fCAocHJvcE5hbWVzID09PSBudWxsIHx8IHByb3BOYW1lcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogcHJvcE5hbWVzLmhhcyhwcm9wKSkgfHwgJDY1NDg0ZDAyZGNiN2ViM2UkdmFyJHByb3BSZS50ZXN0KHByb3ApKSkgZmlsdGVyZWRQcm9wc1twcm9wXSA9IHByb3BzW3Byb3BdO1xuICAgIHJldHVybiBmaWx0ZXJlZFByb3BzO1xufVxuXG5cbmV4cG9ydCB7JDY1NDg0ZDAyZGNiN2ViM2UkZXhwb3J0JDQ1N2MzZDY1MThkZDRjNmYgYXMgZmlsdGVyRE9NUHJvcHN9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZmlsdGVyRE9NUHJvcHMubW9kdWxlLmpzLm1hcFxuIiwiLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIGZ1bmN0aW9uICQ3MjE1YWZjNmRlNjA2ZDZiJGV4cG9ydCRkZTc5ZTJjNjk1ZTA1MmYzKGVsZW1lbnQpIHtcbiAgICBpZiAoJDcyMTVhZmM2ZGU2MDZkNmIkdmFyJHN1cHBvcnRzUHJldmVudFNjcm9sbCgpKSBlbGVtZW50LmZvY3VzKHtcbiAgICAgICAgcHJldmVudFNjcm9sbDogdHJ1ZVxuICAgIH0pO1xuICAgIGVsc2Uge1xuICAgICAgICBsZXQgc2Nyb2xsYWJsZUVsZW1lbnRzID0gJDcyMTVhZmM2ZGU2MDZkNmIkdmFyJGdldFNjcm9sbGFibGVFbGVtZW50cyhlbGVtZW50KTtcbiAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgICAkNzIxNWFmYzZkZTYwNmQ2YiR2YXIkcmVzdG9yZVNjcm9sbFBvc2l0aW9uKHNjcm9sbGFibGVFbGVtZW50cyk7XG4gICAgfVxufVxubGV0ICQ3MjE1YWZjNmRlNjA2ZDZiJHZhciRzdXBwb3J0c1ByZXZlbnRTY3JvbGxDYWNoZWQgPSBudWxsO1xuZnVuY3Rpb24gJDcyMTVhZmM2ZGU2MDZkNmIkdmFyJHN1cHBvcnRzUHJldmVudFNjcm9sbCgpIHtcbiAgICBpZiAoJDcyMTVhZmM2ZGU2MDZkNmIkdmFyJHN1cHBvcnRzUHJldmVudFNjcm9sbENhY2hlZCA9PSBudWxsKSB7XG4gICAgICAgICQ3MjE1YWZjNmRlNjA2ZDZiJHZhciRzdXBwb3J0c1ByZXZlbnRTY3JvbGxDYWNoZWQgPSBmYWxzZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBmb2N1c0VsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGZvY3VzRWxlbS5mb2N1cyh7XG4gICAgICAgICAgICAgICAgZ2V0IHByZXZlbnRTY3JvbGwgKCkge1xuICAgICAgICAgICAgICAgICAgICAkNzIxNWFmYzZkZTYwNmQ2YiR2YXIkc3VwcG9ydHNQcmV2ZW50U2Nyb2xsQ2FjaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggIHtcbiAgICAgICAgLy8gSWdub3JlXG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICQ3MjE1YWZjNmRlNjA2ZDZiJHZhciRzdXBwb3J0c1ByZXZlbnRTY3JvbGxDYWNoZWQ7XG59XG5mdW5jdGlvbiAkNzIxNWFmYzZkZTYwNmQ2YiR2YXIkZ2V0U2Nyb2xsYWJsZUVsZW1lbnRzKGVsZW1lbnQpIHtcbiAgICBsZXQgcGFyZW50ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuICAgIGxldCBzY3JvbGxhYmxlRWxlbWVudHMgPSBbXTtcbiAgICBsZXQgcm9vdFNjcm9sbGluZ0VsZW1lbnQgPSBkb2N1bWVudC5zY3JvbGxpbmdFbGVtZW50IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICB3aGlsZShwYXJlbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiBwYXJlbnQgIT09IHJvb3RTY3JvbGxpbmdFbGVtZW50KXtcbiAgICAgICAgaWYgKHBhcmVudC5vZmZzZXRIZWlnaHQgPCBwYXJlbnQuc2Nyb2xsSGVpZ2h0IHx8IHBhcmVudC5vZmZzZXRXaWR0aCA8IHBhcmVudC5zY3JvbGxXaWR0aCkgc2Nyb2xsYWJsZUVsZW1lbnRzLnB1c2goe1xuICAgICAgICAgICAgZWxlbWVudDogcGFyZW50LFxuICAgICAgICAgICAgc2Nyb2xsVG9wOiBwYXJlbnQuc2Nyb2xsVG9wLFxuICAgICAgICAgICAgc2Nyb2xsTGVmdDogcGFyZW50LnNjcm9sbExlZnRcbiAgICAgICAgfSk7XG4gICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlO1xuICAgIH1cbiAgICBpZiAocm9vdFNjcm9sbGluZ0VsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkgc2Nyb2xsYWJsZUVsZW1lbnRzLnB1c2goe1xuICAgICAgICBlbGVtZW50OiByb290U2Nyb2xsaW5nRWxlbWVudCxcbiAgICAgICAgc2Nyb2xsVG9wOiByb290U2Nyb2xsaW5nRWxlbWVudC5zY3JvbGxUb3AsXG4gICAgICAgIHNjcm9sbExlZnQ6IHJvb3RTY3JvbGxpbmdFbGVtZW50LnNjcm9sbExlZnRcbiAgICB9KTtcbiAgICByZXR1cm4gc2Nyb2xsYWJsZUVsZW1lbnRzO1xufVxuZnVuY3Rpb24gJDcyMTVhZmM2ZGU2MDZkNmIkdmFyJHJlc3RvcmVTY3JvbGxQb3NpdGlvbihzY3JvbGxhYmxlRWxlbWVudHMpIHtcbiAgICBmb3IgKGxldCB7IGVsZW1lbnQ6IGVsZW1lbnQsIHNjcm9sbFRvcDogc2Nyb2xsVG9wLCBzY3JvbGxMZWZ0OiBzY3JvbGxMZWZ0IH0gb2Ygc2Nyb2xsYWJsZUVsZW1lbnRzKXtcbiAgICAgICAgZWxlbWVudC5zY3JvbGxUb3AgPSBzY3JvbGxUb3A7XG4gICAgICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCA9IHNjcm9sbExlZnQ7XG4gICAgfVxufVxuXG5cbmV4cG9ydCB7JDcyMTVhZmM2ZGU2MDZkNmIkZXhwb3J0JGRlNzllMmM2OTVlMDUyZjMgYXMgZm9jdXNXaXRob3V0U2Nyb2xsaW5nfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWZvY3VzV2l0aG91dFNjcm9sbGluZy5tb2R1bGUuanMubWFwXG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjAgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gZnVuY3Rpb24gJGFiNzFkYWRiMDNhNmZiMmUkZXhwb3J0JDYyMmNlYTQ0NWExYzViN2QoZWxlbWVudCwgcmV2ZXJzZSwgb3JpZW50YXRpb24gPSAnaG9yaXpvbnRhbCcpIHtcbiAgICBsZXQgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgaWYgKHJldmVyc2UpIHJldHVybiBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gcmVjdC5yaWdodCA6IHJlY3QuYm90dG9tO1xuICAgIHJldHVybiBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gcmVjdC5sZWZ0IDogcmVjdC50b3A7XG59XG5cblxuZXhwb3J0IHskYWI3MWRhZGIwM2E2ZmIyZSRleHBvcnQkNjIyY2VhNDQ1YTFjNWI3ZCBhcyBnZXRPZmZzZXR9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2V0T2Zmc2V0Lm1vZHVsZS5qcy5tYXBcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBmdW5jdGlvbiAkYzg3MzExNDI0ZWEzMGEwNSR2YXIkdGVzdFVzZXJBZ2VudChyZSkge1xuICAgIHZhciBfd2luZG93X25hdmlnYXRvcl91c2VyQWdlbnREYXRhO1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCB3aW5kb3cubmF2aWdhdG9yID09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICBsZXQgYnJhbmRzID0gKF93aW5kb3dfbmF2aWdhdG9yX3VzZXJBZ2VudERhdGEgPSB3aW5kb3cubmF2aWdhdG9yWyd1c2VyQWdlbnREYXRhJ10pID09PSBudWxsIHx8IF93aW5kb3dfbmF2aWdhdG9yX3VzZXJBZ2VudERhdGEgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF93aW5kb3dfbmF2aWdhdG9yX3VzZXJBZ2VudERhdGEuYnJhbmRzO1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KGJyYW5kcykgJiYgYnJhbmRzLnNvbWUoKGJyYW5kKT0+cmUudGVzdChicmFuZC5icmFuZCkpIHx8IHJlLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpO1xufVxuZnVuY3Rpb24gJGM4NzMxMTQyNGVhMzBhMDUkdmFyJHRlc3RQbGF0Zm9ybShyZSkge1xuICAgIHZhciBfd2luZG93X25hdmlnYXRvcl91c2VyQWdlbnREYXRhO1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubmF2aWdhdG9yICE9IG51bGwgPyByZS50ZXN0KCgoX3dpbmRvd19uYXZpZ2F0b3JfdXNlckFnZW50RGF0YSA9IHdpbmRvdy5uYXZpZ2F0b3JbJ3VzZXJBZ2VudERhdGEnXSkgPT09IG51bGwgfHwgX3dpbmRvd19uYXZpZ2F0b3JfdXNlckFnZW50RGF0YSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX3dpbmRvd19uYXZpZ2F0b3JfdXNlckFnZW50RGF0YS5wbGF0Zm9ybSkgfHwgd2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybSkgOiBmYWxzZTtcbn1cbmZ1bmN0aW9uICRjODczMTE0MjRlYTMwYTA1JHZhciRjYWNoZWQoZm4pIHtcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICd0ZXN0JykgcmV0dXJuIGZuO1xuICAgIGxldCByZXMgPSBudWxsO1xuICAgIHJldHVybiAoKT0+e1xuICAgICAgICBpZiAocmVzID09IG51bGwpIHJlcyA9IGZuKCk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbn1cbmNvbnN0ICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCQ5YWMxMDBlNDA2MTNlYTEwID0gJGM4NzMxMTQyNGVhMzBhMDUkdmFyJGNhY2hlZChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJGM4NzMxMTQyNGVhMzBhMDUkdmFyJHRlc3RQbGF0Zm9ybSgvXk1hYy9pKTtcbn0pO1xuY29uc3QgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JDE4NmM2OTY0Y2ExN2Q5OSA9ICRjODczMTE0MjRlYTMwYTA1JHZhciRjYWNoZWQoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRjODczMTE0MjRlYTMwYTA1JHZhciR0ZXN0UGxhdGZvcm0oL15pUGhvbmUvaSk7XG59KTtcbmNvbnN0ICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCQ3YmVmMDQ5Y2U5MmU0MjI0ID0gJGM4NzMxMTQyNGVhMzBhMDUkdmFyJGNhY2hlZChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJGM4NzMxMTQyNGVhMzBhMDUkdmFyJHRlc3RQbGF0Zm9ybSgvXmlQYWQvaSkgfHwgLy8gaVBhZE9TIDEzIGxpZXMgYW5kIHNheXMgaXQncyBhIE1hYywgYnV0IHdlIGNhbiBkaXN0aW5ndWlzaCBieSBkZXRlY3RpbmcgdG91Y2ggc3VwcG9ydC5cbiAgICAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkOWFjMTAwZTQwNjEzZWExMCgpICYmIG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyA+IDE7XG59KTtcbmNvbnN0ICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCRmZWRiMzY5Y2I3MDIwN2YxID0gJGM4NzMxMTQyNGVhMzBhMDUkdmFyJGNhY2hlZChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JDE4NmM2OTY0Y2ExN2Q5OSgpIHx8ICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCQ3YmVmMDQ5Y2U5MmU0MjI0KCk7XG59KTtcbmNvbnN0ICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCRlMTg2NWMzYmVkY2Q4MjJiID0gJGM4NzMxMTQyNGVhMzBhMDUkdmFyJGNhY2hlZChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JDlhYzEwMGU0MDYxM2VhMTAoKSB8fCAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkZmVkYjM2OWNiNzAyMDdmMSgpO1xufSk7XG5jb25zdCAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkNzg1NTEwNDM1ODJhNmE5OCA9ICRjODczMTE0MjRlYTMwYTA1JHZhciRjYWNoZWQoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRjODczMTE0MjRlYTMwYTA1JHZhciR0ZXN0VXNlckFnZW50KC9BcHBsZVdlYktpdC9pKSAmJiAhJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JDY0NDZhMTg2ZDA5ZTM3OWUoKTtcbn0pO1xuY29uc3QgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JDY0NDZhMTg2ZDA5ZTM3OWUgPSAkYzg3MzExNDI0ZWEzMGEwNSR2YXIkY2FjaGVkKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkYzg3MzExNDI0ZWEzMGEwNSR2YXIkdGVzdFVzZXJBZ2VudCgvQ2hyb21lL2kpO1xufSk7XG5jb25zdCAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkYTExYjAwNTk5MDBjZWVjOCA9ICRjODczMTE0MjRlYTMwYTA1JHZhciRjYWNoZWQoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRjODczMTE0MjRlYTMwYTA1JHZhciR0ZXN0VXNlckFnZW50KC9BbmRyb2lkL2kpO1xufSk7XG5jb25zdCAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkYjdkNzg5OTNiNzRmNzY2ZCA9ICRjODczMTE0MjRlYTMwYTA1JHZhciRjYWNoZWQoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRjODczMTE0MjRlYTMwYTA1JHZhciR0ZXN0VXNlckFnZW50KC9GaXJlZm94L2kpO1xufSk7XG5cblxuZXhwb3J0IHskYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkOWFjMTAwZTQwNjEzZWExMCBhcyBpc01hYywgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JDE4NmM2OTY0Y2ExN2Q5OSBhcyBpc0lQaG9uZSwgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JDdiZWYwNDljZTkyZTQyMjQgYXMgaXNJUGFkLCAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkZmVkYjM2OWNiNzAyMDdmMSBhcyBpc0lPUywgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JGUxODY1YzNiZWRjZDgyMmIgYXMgaXNBcHBsZURldmljZSwgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JDc4NTUxMDQzNTgyYTZhOTggYXMgaXNXZWJLaXQsICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCQ2NDQ2YTE4NmQwOWUzNzllIGFzIGlzQ2hyb21lLCAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkYTExYjAwNTk5MDBjZWVjOCBhcyBpc0FuZHJvaWQsICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCRiN2Q3ODk5M2I3NGY3NjZkIGFzIGlzRmlyZWZveH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wbGF0Zm9ybS5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge2ZvY3VzV2l0aG91dFNjcm9sbGluZyBhcyAkNzIxNWFmYzZkZTYwNmQ2YiRleHBvcnQkZGU3OWUyYzY5NWUwNTJmM30gZnJvbSBcIi4vZm9jdXNXaXRob3V0U2Nyb2xsaW5nLm1qc1wiO1xuaW1wb3J0IHtpc01hYyBhcyAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkOWFjMTAwZTQwNjEzZWExMCwgaXNXZWJLaXQgYXMgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JDc4NTUxMDQzNTgyYTZhOTgsIGlzRmlyZWZveCBhcyAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkYjdkNzg5OTNiNzRmNzY2ZCwgaXNJUGFkIGFzICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCQ3YmVmMDQ5Y2U5MmU0MjI0fSBmcm9tIFwiLi9wbGF0Zm9ybS5tanNcIjtcbmltcG9ydCAkZzNqRm4kcmVhY3QsIHtjcmVhdGVDb250ZXh0IGFzICRnM2pGbiRjcmVhdGVDb250ZXh0LCB1c2VNZW1vIGFzICRnM2pGbiR1c2VNZW1vLCB1c2VDb250ZXh0IGFzICRnM2pGbiR1c2VDb250ZXh0fSBmcm9tIFwicmVhY3RcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIzIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuXG5cbmNvbnN0ICRlYThkY2JjYjllYTFiNTU2JHZhciRSb3V0ZXJDb250ZXh0ID0gLyojX19QVVJFX18qLyAoMCwgJGczakZuJGNyZWF0ZUNvbnRleHQpKHtcbiAgICBpc05hdGl2ZTogdHJ1ZSxcbiAgICBvcGVuOiAkZWE4ZGNiY2I5ZWExYjU1NiR2YXIkb3BlblN5bnRoZXRpY0xpbmssXG4gICAgdXNlSHJlZjogKGhyZWYpPT5ocmVmXG59KTtcbmZ1bmN0aW9uICRlYThkY2JjYjllYTFiNTU2JGV4cG9ydCQzMjNlNGZjMmZhNDc1M2ZiKHByb3BzKSB7XG4gICAgbGV0IHsgY2hpbGRyZW46IGNoaWxkcmVuLCBuYXZpZ2F0ZTogbmF2aWdhdGUsIHVzZUhyZWY6IHVzZUhyZWYgfSA9IHByb3BzO1xuICAgIGxldCBjdHggPSAoMCwgJGczakZuJHVzZU1lbW8pKCgpPT4oe1xuICAgICAgICAgICAgaXNOYXRpdmU6IGZhbHNlLFxuICAgICAgICAgICAgb3BlbjogKHRhcmdldCwgbW9kaWZpZXJzLCBocmVmLCByb3V0ZXJPcHRpb25zKT0+e1xuICAgICAgICAgICAgICAgICRlYThkY2JjYjllYTFiNTU2JHZhciRnZXRTeW50aGV0aWNMaW5rKHRhcmdldCwgKGxpbmspPT57XG4gICAgICAgICAgICAgICAgICAgIGlmICgkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkZWZhOGM5MDk5ZTUzMDIzNShsaW5rLCBtb2RpZmllcnMpKSBuYXZpZ2F0ZShocmVmLCByb3V0ZXJPcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSAkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkOTUxODVkNjk5ZTA1ZDRkNyhsaW5rLCBtb2RpZmllcnMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHVzZUhyZWY6IHVzZUhyZWYgfHwgKChocmVmKT0+aHJlZilcbiAgICAgICAgfSksIFtcbiAgICAgICAgbmF2aWdhdGUsXG4gICAgICAgIHVzZUhyZWZcbiAgICBdKTtcbiAgICByZXR1cm4gLyojX19QVVJFX18qLyAoMCwgJGczakZuJHJlYWN0KS5jcmVhdGVFbGVtZW50KCRlYThkY2JjYjllYTFiNTU2JHZhciRSb3V0ZXJDb250ZXh0LlByb3ZpZGVyLCB7XG4gICAgICAgIHZhbHVlOiBjdHhcbiAgICB9LCBjaGlsZHJlbik7XG59XG5mdW5jdGlvbiAkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkOWEzMDJhNDVmNjVkMDU3MigpIHtcbiAgICByZXR1cm4gKDAsICRnM2pGbiR1c2VDb250ZXh0KSgkZWE4ZGNiY2I5ZWExYjU1NiR2YXIkUm91dGVyQ29udGV4dCk7XG59XG5mdW5jdGlvbiAkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkZWZhOGM5MDk5ZTUzMDIzNShsaW5rLCBtb2RpZmllcnMpIHtcbiAgICAvLyBVc2UgZ2V0QXR0cmlidXRlIGhlcmUgaW5zdGVhZCBvZiBsaW5rLnRhcmdldC4gRmlyZWZveCB3aWxsIGRlZmF1bHQgbGluay50YXJnZXQgdG8gXCJfcGFyZW50XCIgd2hlbiBpbnNpZGUgYW4gaWZyYW1lLlxuICAgIGxldCB0YXJnZXQgPSBsaW5rLmdldEF0dHJpYnV0ZSgndGFyZ2V0Jyk7XG4gICAgcmV0dXJuICghdGFyZ2V0IHx8IHRhcmdldCA9PT0gJ19zZWxmJykgJiYgbGluay5vcmlnaW4gPT09IGxvY2F0aW9uLm9yaWdpbiAmJiAhbGluay5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgJiYgIW1vZGlmaWVycy5tZXRhS2V5ICYmIC8vIG9wZW4gaW4gbmV3IHRhYiAobWFjKVxuICAgICFtb2RpZmllcnMuY3RybEtleSAmJiAvLyBvcGVuIGluIG5ldyB0YWIgKHdpbmRvd3MpXG4gICAgIW1vZGlmaWVycy5hbHRLZXkgJiYgLy8gZG93bmxvYWRcbiAgICAhbW9kaWZpZXJzLnNoaWZ0S2V5O1xufVxuZnVuY3Rpb24gJGVhOGRjYmNiOWVhMWI1NTYkZXhwb3J0JDk1MTg1ZDY5OWUwNWQ0ZDcodGFyZ2V0LCBtb2RpZmllcnMsIHNldE9wZW5pbmcgPSB0cnVlKSB7XG4gICAgdmFyIF93aW5kb3dfZXZlbnRfdHlwZSwgX3dpbmRvd19ldmVudDtcbiAgICBsZXQgeyBtZXRhS2V5OiBtZXRhS2V5LCBjdHJsS2V5OiBjdHJsS2V5LCBhbHRLZXk6IGFsdEtleSwgc2hpZnRLZXk6IHNoaWZ0S2V5IH0gPSBtb2RpZmllcnM7XG4gICAgLy8gRmlyZWZveCBkb2VzIG5vdCByZWNvZ25pemUga2V5Ym9hcmQgZXZlbnRzIGFzIGEgdXNlciBhY3Rpb24gYnkgZGVmYXVsdCwgYW5kIHRoZSBwb3B1cCBibG9ja2VyXG4gICAgLy8gd2lsbCBwcmV2ZW50IGxpbmtzIHdpdGggdGFyZ2V0PVwiX2JsYW5rXCIgZnJvbSBvcGVuaW5nLiBIb3dldmVyLCBpdCBkb2VzIGFsbG93IHRoZSBldmVudCBpZiB0aGVcbiAgICAvLyBDb21tYW5kL0NvbnRyb2wga2V5IGlzIGhlbGQsIHdoaWNoIG9wZW5zIHRoZSBsaW5rIGluIGEgYmFja2dyb3VuZCB0YWIuIFRoaXMgc2VlbXMgbGlrZSB0aGUgYmVzdCB3ZSBjYW4gZG8uXG4gICAgLy8gU2VlIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTI1Nzg3MCBhbmQgaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NzQ2NjQwLlxuICAgIGlmICgoMCwgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JGI3ZDc4OTkzYjc0Zjc2NmQpKCkgJiYgKChfd2luZG93X2V2ZW50ID0gd2luZG93LmV2ZW50KSA9PT0gbnVsbCB8fCBfd2luZG93X2V2ZW50ID09PSB2b2lkIDAgPyB2b2lkIDAgOiAoX3dpbmRvd19ldmVudF90eXBlID0gX3dpbmRvd19ldmVudC50eXBlKSA9PT0gbnVsbCB8fCBfd2luZG93X2V2ZW50X3R5cGUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF93aW5kb3dfZXZlbnRfdHlwZS5zdGFydHNXaXRoKCdrZXknKSkgJiYgdGFyZ2V0LnRhcmdldCA9PT0gJ19ibGFuaycpIHtcbiAgICAgICAgaWYgKCgwLCAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkOWFjMTAwZTQwNjEzZWExMCkoKSkgbWV0YUtleSA9IHRydWU7XG4gICAgICAgIGVsc2UgY3RybEtleSA9IHRydWU7XG4gICAgfVxuICAgIC8vIFdlYktpdCBkb2VzIG5vdCBzdXBwb3J0IGZpcmluZyBjbGljayBldmVudHMgd2l0aCBtb2RpZmllciBrZXlzLCBidXQgZG9lcyBzdXBwb3J0IGtleWJvYXJkIGV2ZW50cy5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vV2ViS2l0L1dlYktpdC9ibG9iL2MwM2QwYWM2ZTZkYjE3OGY5MDkyM2EwYTYzMDgwYjVjYTIxMGQyNWYvU291cmNlL1dlYkNvcmUvaHRtbC9IVE1MQW5jaG9yRWxlbWVudC5jcHAjTDE4NFxuICAgIGxldCBldmVudCA9ICgwLCAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkNzg1NTEwNDM1ODJhNmE5OCkoKSAmJiAoMCwgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JDlhYzEwMGU0MDYxM2VhMTApKCkgJiYgISgwLCAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkN2JlZjA0OWNlOTJlNDIyNCkoKSAmJiBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Rlc3QnID8gbmV3IEtleWJvYXJkRXZlbnQoJ2tleWRvd24nLCB7XG4gICAgICAgIGtleUlkZW50aWZpZXI6ICdFbnRlcicsXG4gICAgICAgIG1ldGFLZXk6IG1ldGFLZXksXG4gICAgICAgIGN0cmxLZXk6IGN0cmxLZXksXG4gICAgICAgIGFsdEtleTogYWx0S2V5LFxuICAgICAgICBzaGlmdEtleTogc2hpZnRLZXlcbiAgICB9KSA6IG5ldyBNb3VzZUV2ZW50KCdjbGljaycsIHtcbiAgICAgICAgbWV0YUtleTogbWV0YUtleSxcbiAgICAgICAgY3RybEtleTogY3RybEtleSxcbiAgICAgICAgYWx0S2V5OiBhbHRLZXksXG4gICAgICAgIHNoaWZ0S2V5OiBzaGlmdEtleSxcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgICRlYThkY2JjYjllYTFiNTU2JGV4cG9ydCQ5NTE4NWQ2OTllMDVkNGQ3LmlzT3BlbmluZyA9IHNldE9wZW5pbmc7XG4gICAgKDAsICQ3MjE1YWZjNmRlNjA2ZDZiJGV4cG9ydCRkZTc5ZTJjNjk1ZTA1MmYzKSh0YXJnZXQpO1xuICAgIHRhcmdldC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkOTUxODVkNjk5ZTA1ZDRkNy5pc09wZW5pbmcgPSBmYWxzZTtcbn1cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9wYXJjZWwtYnVuZGxlci9wYXJjZWwvaXNzdWVzLzg3MjRcbiRlYThkY2JjYjllYTFiNTU2JGV4cG9ydCQ5NTE4NWQ2OTllMDVkNGQ3LmlzT3BlbmluZyA9IGZhbHNlO1xuZnVuY3Rpb24gJGVhOGRjYmNiOWVhMWI1NTYkdmFyJGdldFN5bnRoZXRpY0xpbmsodGFyZ2V0LCBvcGVuKSB7XG4gICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxBbmNob3JFbGVtZW50KSBvcGVuKHRhcmdldCk7XG4gICAgZWxzZSBpZiAodGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1ocmVmJykpIHtcbiAgICAgICAgbGV0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGxpbmsuaHJlZiA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaHJlZicpO1xuICAgICAgICBpZiAodGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS10YXJnZXQnKSkgbGluay50YXJnZXQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXRhcmdldCcpO1xuICAgICAgICBpZiAodGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1yZWwnKSkgbGluay5yZWwgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXJlbCcpO1xuICAgICAgICBpZiAodGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1kb3dubG9hZCcpKSBsaW5rLmRvd25sb2FkID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1kb3dubG9hZCcpO1xuICAgICAgICBpZiAodGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1waW5nJykpIGxpbmsucGluZyA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcGluZycpO1xuICAgICAgICBpZiAodGFyZ2V0Lmhhc0F0dHJpYnV0ZSgnZGF0YS1yZWZlcnJlci1wb2xpY3knKSkgbGluay5yZWZlcnJlclBvbGljeSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcmVmZXJyZXItcG9saWN5Jyk7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgb3BlbihsaW5rKTtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUNoaWxkKGxpbmspO1xuICAgIH1cbn1cbmZ1bmN0aW9uICRlYThkY2JjYjllYTFiNTU2JHZhciRvcGVuU3ludGhldGljTGluayh0YXJnZXQsIG1vZGlmaWVycykge1xuICAgICRlYThkY2JjYjllYTFiNTU2JHZhciRnZXRTeW50aGV0aWNMaW5rKHRhcmdldCwgKGxpbmspPT4kZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkOTUxODVkNjk5ZTA1ZDRkNyhsaW5rLCBtb2RpZmllcnMpKTtcbn1cbmZ1bmN0aW9uICRlYThkY2JjYjllYTFiNTU2JGV4cG9ydCRiZGM3N2IwYzBhM2E4NWQ2KHByb3BzKSB7XG4gICAgbGV0IHJvdXRlciA9ICRlYThkY2JjYjllYTFiNTU2JGV4cG9ydCQ5YTMwMmE0NWY2NWQwNTcyKCk7XG4gICAgdmFyIF9wcm9wc19ocmVmO1xuICAgIGNvbnN0IGhyZWYgPSByb3V0ZXIudXNlSHJlZigoX3Byb3BzX2hyZWYgPSBwcm9wcy5ocmVmKSAhPT0gbnVsbCAmJiBfcHJvcHNfaHJlZiAhPT0gdm9pZCAwID8gX3Byb3BzX2hyZWYgOiAnJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgJ2RhdGEtaHJlZic6IHByb3BzLmhyZWYgPyBocmVmIDogdW5kZWZpbmVkLFxuICAgICAgICAnZGF0YS10YXJnZXQnOiBwcm9wcy50YXJnZXQsXG4gICAgICAgICdkYXRhLXJlbCc6IHByb3BzLnJlbCxcbiAgICAgICAgJ2RhdGEtZG93bmxvYWQnOiBwcm9wcy5kb3dubG9hZCxcbiAgICAgICAgJ2RhdGEtcGluZyc6IHByb3BzLnBpbmcsXG4gICAgICAgICdkYXRhLXJlZmVycmVyLXBvbGljeSc6IHByb3BzLnJlZmVycmVyUG9saWN5XG4gICAgfTtcbn1cbmZ1bmN0aW9uICRlYThkY2JjYjllYTFiNTU2JGV4cG9ydCQ1MTQzN2Q1MDMzNzNkMjIzKHByb3BzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgJ2RhdGEtaHJlZic6IHByb3BzLmhyZWYsXG4gICAgICAgICdkYXRhLXRhcmdldCc6IHByb3BzLnRhcmdldCxcbiAgICAgICAgJ2RhdGEtcmVsJzogcHJvcHMucmVsLFxuICAgICAgICAnZGF0YS1kb3dubG9hZCc6IHByb3BzLmRvd25sb2FkLFxuICAgICAgICAnZGF0YS1waW5nJzogcHJvcHMucGluZyxcbiAgICAgICAgJ2RhdGEtcmVmZXJyZXItcG9saWN5JzogcHJvcHMucmVmZXJyZXJQb2xpY3lcbiAgICB9O1xufVxuZnVuY3Rpb24gJGVhOGRjYmNiOWVhMWI1NTYkZXhwb3J0JDdlOTI0YjMwOTFhM2JkMTgocHJvcHMpIHtcbiAgICBsZXQgcm91dGVyID0gJGVhOGRjYmNiOWVhMWI1NTYkZXhwb3J0JDlhMzAyYTQ1ZjY1ZDA1NzIoKTtcbiAgICB2YXIgX3Byb3BzX2hyZWY7XG4gICAgY29uc3QgaHJlZiA9IHJvdXRlci51c2VIcmVmKChfcHJvcHNfaHJlZiA9IHByb3BzID09PSBudWxsIHx8IHByb3BzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwcm9wcy5ocmVmKSAhPT0gbnVsbCAmJiBfcHJvcHNfaHJlZiAhPT0gdm9pZCAwID8gX3Byb3BzX2hyZWYgOiAnJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaHJlZjogKHByb3BzID09PSBudWxsIHx8IHByb3BzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwcm9wcy5ocmVmKSA/IGhyZWYgOiB1bmRlZmluZWQsXG4gICAgICAgIHRhcmdldDogcHJvcHMgPT09IG51bGwgfHwgcHJvcHMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHByb3BzLnRhcmdldCxcbiAgICAgICAgcmVsOiBwcm9wcyA9PT0gbnVsbCB8fCBwcm9wcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogcHJvcHMucmVsLFxuICAgICAgICBkb3dubG9hZDogcHJvcHMgPT09IG51bGwgfHwgcHJvcHMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHByb3BzLmRvd25sb2FkLFxuICAgICAgICBwaW5nOiBwcm9wcyA9PT0gbnVsbCB8fCBwcm9wcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogcHJvcHMucGluZyxcbiAgICAgICAgcmVmZXJyZXJQb2xpY3k6IHByb3BzID09PSBudWxsIHx8IHByb3BzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwcm9wcy5yZWZlcnJlclBvbGljeVxuICAgIH07XG59XG5mdW5jdGlvbiAkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkMTNhZWExYTNjYjVlM2YxZihlLCByb3V0ZXIsIGhyZWYsIHJvdXRlck9wdGlvbnMpIHtcbiAgICAvLyBJZiBhIGN1c3RvbSByb3V0ZXIgaXMgcHJvdmlkZWQsIHByZXZlbnQgZGVmYXVsdCBhbmQgZm9yd2FyZCBpZiB0aGlzIGxpbmsgc2hvdWxkIGNsaWVudCBuYXZpZ2F0ZS5cbiAgICBpZiAoIXJvdXRlci5pc05hdGl2ZSAmJiBlLmN1cnJlbnRUYXJnZXQgaW5zdGFuY2VvZiBIVE1MQW5jaG9yRWxlbWVudCAmJiBlLmN1cnJlbnRUYXJnZXQuaHJlZiAmJiAvLyBJZiBwcm9wcyBhcmUgYXBwbGllZCB0byBhIHJvdXRlciBMaW5rIGNvbXBvbmVudCwgaXQgbWF5IGhhdmUgYWxyZWFkeSBwcmV2ZW50ZWQgZGVmYXVsdC5cbiAgICAhZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSAmJiAkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkZWZhOGM5MDk5ZTUzMDIzNShlLmN1cnJlbnRUYXJnZXQsIGUpICYmIGhyZWYpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICByb3V0ZXIub3BlbihlLmN1cnJlbnRUYXJnZXQsIGUsIGhyZWYsIHJvdXRlck9wdGlvbnMpO1xuICAgIH1cbn1cblxuXG5leHBvcnQgeyRlYThkY2JjYjllYTFiNTU2JGV4cG9ydCQzMjNlNGZjMmZhNDc1M2ZiIGFzIFJvdXRlclByb3ZpZGVyLCAkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkZWZhOGM5MDk5ZTUzMDIzNSBhcyBzaG91bGRDbGllbnROYXZpZ2F0ZSwgJGVhOGRjYmNiOWVhMWI1NTYkZXhwb3J0JDk1MTg1ZDY5OWUwNWQ0ZDcgYXMgb3BlbkxpbmssICRlYThkY2JjYjllYTFiNTU2JGV4cG9ydCQ5YTMwMmE0NWY2NWQwNTcyIGFzIHVzZVJvdXRlciwgJGVhOGRjYmNiOWVhMWI1NTYkZXhwb3J0JGJkYzc3YjBjMGEzYTg1ZDYgYXMgdXNlU3ludGhldGljTGlua1Byb3BzLCAkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkNTE0MzdkNTAzMzczZDIyMyBhcyBnZXRTeW50aGV0aWNMaW5rUHJvcHMsICRlYThkY2JjYjllYTFiNTU2JGV4cG9ydCQ3ZTkyNGIzMDkxYTNiZDE4IGFzIHVzZUxpbmtQcm9wcywgJGVhOGRjYmNiOWVhMWI1NTYkZXhwb3J0JDEzYWVhMWEzY2I1ZTNmMWYgYXMgaGFuZGxlTGlua0NsaWNrfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW9wZW5MaW5rLm1vZHVsZS5qcy5tYXBcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyAvLyBXZSBzdG9yZSBhIGdsb2JhbCBsaXN0IG9mIGVsZW1lbnRzIHRoYXQgYXJlIGN1cnJlbnRseSB0cmFuc2l0aW9uaW5nLFxuLy8gbWFwcGVkIHRvIGEgc2V0IG9mIENTUyBwcm9wZXJ0aWVzIHRoYXQgYXJlIHRyYW5zaXRpb25pbmcgZm9yIHRoYXQgZWxlbWVudC5cbi8vIFRoaXMgaXMgbmVjZXNzYXJ5IHJhdGhlciB0aGFuIGEgc2ltcGxlIGNvdW50IG9mIHRyYW5zaXRpb25zIGJlY2F1c2Ugb2YgYnJvd3NlclxuLy8gYnVncywgZS5nLiBDaHJvbWUgc29tZXRpbWVzIGZpcmVzIGJvdGggdHJhbnNpdGlvbmVuZCBhbmQgdHJhbnNpdGlvbmNhbmNlbCByYXRoZXJcbi8vIHRoYW4gb25lIG9yIHRoZSBvdGhlci4gU28gd2UgbmVlZCB0byB0cmFjayB3aGF0J3MgYWN0dWFsbHkgdHJhbnNpdGlvbmluZyBzbyB0aGF0XG4vLyB3ZSBjYW4gaWdub3JlIHRoZXNlIGR1cGxpY2F0ZSBldmVudHMuXG5sZXQgJGJiZWQ4YjQxZjg1N2JjYzAkdmFyJHRyYW5zaXRpb25zQnlFbGVtZW50ID0gbmV3IE1hcCgpO1xuLy8gQSBsaXN0IG9mIGNhbGxiYWNrcyB0byBjYWxsIG9uY2UgdGhlcmUgYXJlIG5vIHRyYW5zaXRpb25pbmcgZWxlbWVudHMuXG5sZXQgJGJiZWQ4YjQxZjg1N2JjYzAkdmFyJHRyYW5zaXRpb25DYWxsYmFja3MgPSBuZXcgU2V0KCk7XG5mdW5jdGlvbiAkYmJlZDhiNDFmODU3YmNjMCR2YXIkc2V0dXBHbG9iYWxFdmVudHMoKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XG4gICAgZnVuY3Rpb24gaXNUcmFuc2l0aW9uRXZlbnQoZXZlbnQpIHtcbiAgICAgICAgcmV0dXJuICdwcm9wZXJ0eU5hbWUnIGluIGV2ZW50O1xuICAgIH1cbiAgICBsZXQgb25UcmFuc2l0aW9uU3RhcnQgPSAoZSk9PntcbiAgICAgICAgaWYgKCFpc1RyYW5zaXRpb25FdmVudChlKSB8fCAhZS50YXJnZXQpIHJldHVybjtcbiAgICAgICAgLy8gQWRkIHRoZSB0cmFuc2l0aW9uaW5nIHByb3BlcnR5IHRvIHRoZSBsaXN0IGZvciB0aGlzIGVsZW1lbnQuXG4gICAgICAgIGxldCB0cmFuc2l0aW9ucyA9ICRiYmVkOGI0MWY4NTdiY2MwJHZhciR0cmFuc2l0aW9uc0J5RWxlbWVudC5nZXQoZS50YXJnZXQpO1xuICAgICAgICBpZiAoIXRyYW5zaXRpb25zKSB7XG4gICAgICAgICAgICB0cmFuc2l0aW9ucyA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgICRiYmVkOGI0MWY4NTdiY2MwJHZhciR0cmFuc2l0aW9uc0J5RWxlbWVudC5zZXQoZS50YXJnZXQsIHRyYW5zaXRpb25zKTtcbiAgICAgICAgICAgIC8vIFRoZSB0cmFuc2l0aW9uY2FuY2VsIGV2ZW50IG11c3QgYmUgcmVnaXN0ZXJlZCBvbiB0aGUgZWxlbWVudCBpdHNlbGYsIHJhdGhlciB0aGFuIGFzIGEgZ2xvYmFsXG4gICAgICAgICAgICAvLyBldmVudC4gVGhpcyBlbmFibGVzIHVzIHRvIGhhbmRsZSB3aGVuIHRoZSBub2RlIGlzIGRlbGV0ZWQgZnJvbSB0aGUgZG9jdW1lbnQgd2hpbGUgaXQgaXMgdHJhbnNpdGlvbmluZy5cbiAgICAgICAgICAgIC8vIEluIHRoYXQgY2FzZSwgdGhlIGNhbmNlbCBldmVudCB3b3VsZCBoYXZlIG5vd2hlcmUgdG8gYnViYmxlIHRvIHNvIHdlIG5lZWQgdG8gaGFuZGxlIGl0IGRpcmVjdGx5LlxuICAgICAgICAgICAgZS50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmNhbmNlbCcsIG9uVHJhbnNpdGlvbkVuZCwge1xuICAgICAgICAgICAgICAgIG9uY2U6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zaXRpb25zLmFkZChlLnByb3BlcnR5TmFtZSk7XG4gICAgfTtcbiAgICBsZXQgb25UcmFuc2l0aW9uRW5kID0gKGUpPT57XG4gICAgICAgIGlmICghaXNUcmFuc2l0aW9uRXZlbnQoZSkgfHwgIWUudGFyZ2V0KSByZXR1cm47XG4gICAgICAgIC8vIFJlbW92ZSBwcm9wZXJ0eSBmcm9tIGxpc3Qgb2YgdHJhbnNpdGlvbmluZyBwcm9wZXJ0aWVzLlxuICAgICAgICBsZXQgcHJvcGVydGllcyA9ICRiYmVkOGI0MWY4NTdiY2MwJHZhciR0cmFuc2l0aW9uc0J5RWxlbWVudC5nZXQoZS50YXJnZXQpO1xuICAgICAgICBpZiAoIXByb3BlcnRpZXMpIHJldHVybjtcbiAgICAgICAgcHJvcGVydGllcy5kZWxldGUoZS5wcm9wZXJ0eU5hbWUpO1xuICAgICAgICAvLyBJZiBlbXB0eSwgcmVtb3ZlIHRyYW5zaXRpb25jYW5jZWwgZXZlbnQsIGFuZCByZW1vdmUgdGhlIGVsZW1lbnQgZnJvbSB0aGUgbGlzdCBvZiB0cmFuc2l0aW9uaW5nIGVsZW1lbnRzLlxuICAgICAgICBpZiAocHJvcGVydGllcy5zaXplID09PSAwKSB7XG4gICAgICAgICAgICBlLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uY2FuY2VsJywgb25UcmFuc2l0aW9uRW5kKTtcbiAgICAgICAgICAgICRiYmVkOGI0MWY4NTdiY2MwJHZhciR0cmFuc2l0aW9uc0J5RWxlbWVudC5kZWxldGUoZS50YXJnZXQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIG5vIHRyYW5zaXRpb25pbmcgZWxlbWVudHMsIGNhbGwgYWxsIG9mIHRoZSBxdWV1ZWQgY2FsbGJhY2tzLlxuICAgICAgICBpZiAoJGJiZWQ4YjQxZjg1N2JjYzAkdmFyJHRyYW5zaXRpb25zQnlFbGVtZW50LnNpemUgPT09IDApIHtcbiAgICAgICAgICAgIGZvciAobGV0IGNiIG9mICRiYmVkOGI0MWY4NTdiY2MwJHZhciR0cmFuc2l0aW9uQ2FsbGJhY2tzKWNiKCk7XG4gICAgICAgICAgICAkYmJlZDhiNDFmODU3YmNjMCR2YXIkdHJhbnNpdGlvbkNhbGxiYWNrcy5jbGVhcigpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25ydW4nLCBvblRyYW5zaXRpb25TdGFydCk7XG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgb25UcmFuc2l0aW9uRW5kKTtcbn1cbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgIT09ICdsb2FkaW5nJykgJGJiZWQ4YjQxZjg1N2JjYzAkdmFyJHNldHVwR2xvYmFsRXZlbnRzKCk7XG4gICAgZWxzZSBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgJGJiZWQ4YjQxZjg1N2JjYzAkdmFyJHNldHVwR2xvYmFsRXZlbnRzKTtcbn1cbi8qKlxuICogQ2xlYW5zIHVwIGFueSBlbGVtZW50cyB0aGF0IGFyZSBubyBsb25nZXIgaW4gdGhlIGRvY3VtZW50LlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB3ZSBjYW4ndCByZWx5IG9uIHRyYW5zaXRpb25lbmQgZXZlbnRzIHRvIGZpcmVcbiAqIGZvciBlbGVtZW50cyB0aGF0IGFyZSByZW1vdmVkIGZyb20gdGhlIGRvY3VtZW50IHdoaWxlIHRyYW5zaXRpb25pbmcuXG4gKi8gZnVuY3Rpb24gJGJiZWQ4YjQxZjg1N2JjYzAkdmFyJGNsZWFudXBEZXRhY2hlZEVsZW1lbnRzKCkge1xuICAgIGZvciAoY29uc3QgW2V2ZW50VGFyZ2V0XSBvZiAkYmJlZDhiNDFmODU3YmNjMCR2YXIkdHJhbnNpdGlvbnNCeUVsZW1lbnQpLy8gU2ltaWxhciB0byBgZXZlbnRUYXJnZXQgaW5zdGFuY2VvZiBFbGVtZW50ICYmICFldmVudFRhcmdldC5pc0Nvbm5lY3RlZGAsIGJ1dCBhdm9pZHNcbiAgICAvLyB0aGUgZXhwbGljaXQgaW5zdGFuY2VvZiBjaGVjaywgc2luY2UgaXQgbWF5IGJlIGRpZmZlcmVudCBpbiBkaWZmZXJlbnQgY29udGV4dHMuXG4gICAgaWYgKCdpc0Nvbm5lY3RlZCcgaW4gZXZlbnRUYXJnZXQgJiYgIWV2ZW50VGFyZ2V0LmlzQ29ubmVjdGVkKSAkYmJlZDhiNDFmODU3YmNjMCR2YXIkdHJhbnNpdGlvbnNCeUVsZW1lbnQuZGVsZXRlKGV2ZW50VGFyZ2V0KTtcbn1cbmZ1bmN0aW9uICRiYmVkOGI0MWY4NTdiY2MwJGV4cG9ydCQyNDQ5MDMxNmY3NjRjNDMwKGZuKSB7XG4gICAgLy8gV2FpdCBvbmUgZnJhbWUgdG8gc2VlIGlmIGFuIGFuaW1hdGlvbiBzdGFydHMsIGUuZy4gYSB0cmFuc2l0aW9uIG9uIG1vdW50LlxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKT0+e1xuICAgICAgICAkYmJlZDhiNDFmODU3YmNjMCR2YXIkY2xlYW51cERldGFjaGVkRWxlbWVudHMoKTtcbiAgICAgICAgLy8gSWYgbm8gdHJhbnNpdGlvbnMgYXJlIHJ1bm5pbmcsIGNhbGwgdGhlIGZ1bmN0aW9uIGltbWVkaWF0ZWx5LlxuICAgICAgICAvLyBPdGhlcndpc2UsIGFkZCBpdCB0byBhIGxpc3Qgb2YgY2FsbGJhY2tzIHRvIHJ1biBhdCB0aGUgZW5kIG9mIHRoZSBhbmltYXRpb24uXG4gICAgICAgIGlmICgkYmJlZDhiNDFmODU3YmNjMCR2YXIkdHJhbnNpdGlvbnNCeUVsZW1lbnQuc2l6ZSA9PT0gMCkgZm4oKTtcbiAgICAgICAgZWxzZSAkYmJlZDhiNDFmODU3YmNjMCR2YXIkdHJhbnNpdGlvbkNhbGxiYWNrcy5hZGQoZm4pO1xuICAgIH0pO1xufVxuXG5cbmV4cG9ydCB7JGJiZWQ4YjQxZjg1N2JjYzAkZXhwb3J0JDI0NDkwMzE2Zjc2NGM0MzAgYXMgcnVuQWZ0ZXJUcmFuc2l0aW9ufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJ1bkFmdGVyVHJhbnNpdGlvbi5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge2dldE9mZnNldCBhcyAkYWI3MWRhZGIwM2E2ZmIyZSRleHBvcnQkNjIyY2VhNDQ1YTFjNWI3ZH0gZnJvbSBcIi4vZ2V0T2Zmc2V0Lm1qc1wiO1xuaW1wb3J0IHt1c2VSZWYgYXMgJDFybkNTJHVzZVJlZn0gZnJvbSBcInJlYWN0XCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyAvKiBlc2xpbnQtZGlzYWJsZSBydWxlc2Rpci9wdXJlLXJlbmRlciAqLyBcblxuLy8gS2VlcCB0cmFjayBvZiBlbGVtZW50cyB0aGF0IHdlIGFyZSBjdXJyZW50bHkgaGFuZGxpbmcgZHJhZ2dpbmcgZm9yIHZpYSB1c2VEcmFnMUQuXG4vLyBJZiB0aGVyZSdzIGFuIGFuY2VzdG9yIGFuZCBhIGRlc2NlbmRhbnQgYm90aCB1c2luZyB1c2VEcmFnMUQoKSwgYW5kIHRoZSB1c2VyIHN0YXJ0c1xuLy8gZHJhZ2dpbmcgdGhlIGRlc2NlbmRhbnQsIHdlIGRvbid0IHdhbnQgdXNlRHJhZzFEIGV2ZW50cyB0byBmaXJlIGZvciB0aGUgYW5jZXN0b3IuXG5jb25zdCAkOWNjMDlkZjlmZDc2NzZiZSR2YXIkZHJhZ2dpbmdFbGVtZW50cyA9IFtdO1xuZnVuY3Rpb24gJDljYzA5ZGY5ZmQ3Njc2YmUkZXhwb3J0JDdiYmVkNzVmZWJhMzk3MDYocHJvcHMpIHtcbiAgICBjb25zb2xlLndhcm4oJ3VzZURyYWcxRCBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIGB1c2VNb3ZlYCBpbnN0ZWFkIGh0dHBzOi8vcmVhY3Qtc3BlY3RydW0uYWRvYmUuY29tL3JlYWN0LWFyaWEvdXNlTW92ZS5odG1sJyk7XG4gICAgbGV0IHsgY29udGFpbmVyUmVmOiBjb250YWluZXJSZWYsIHJldmVyc2U6IHJldmVyc2UsIG9yaWVudGF0aW9uOiBvcmllbnRhdGlvbiwgb25Ib3Zlcjogb25Ib3Zlciwgb25EcmFnOiBvbkRyYWcsIG9uUG9zaXRpb25DaGFuZ2U6IG9uUG9zaXRpb25DaGFuZ2UsIG9uSW5jcmVtZW50OiBvbkluY3JlbWVudCwgb25EZWNyZW1lbnQ6IG9uRGVjcmVtZW50LCBvbkluY3JlbWVudFRvTWF4OiBvbkluY3JlbWVudFRvTWF4LCBvbkRlY3JlbWVudFRvTWluOiBvbkRlY3JlbWVudFRvTWluLCBvbkNvbGxhcHNlVG9nZ2xlOiBvbkNvbGxhcHNlVG9nZ2xlIH0gPSBwcm9wcztcbiAgICBsZXQgZ2V0UG9zaXRpb24gPSAoZSk9Pm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgPyBlLmNsaWVudFggOiBlLmNsaWVudFk7XG4gICAgbGV0IGdldE5leHRPZmZzZXQgPSAoZSk9PntcbiAgICAgICAgbGV0IGNvbnRhaW5lck9mZnNldCA9ICgwLCAkYWI3MWRhZGIwM2E2ZmIyZSRleHBvcnQkNjIyY2VhNDQ1YTFjNWI3ZCkoY29udGFpbmVyUmVmLmN1cnJlbnQsIHJldmVyc2UsIG9yaWVudGF0aW9uKTtcbiAgICAgICAgbGV0IG1vdXNlT2Zmc2V0ID0gZ2V0UG9zaXRpb24oZSk7XG4gICAgICAgIGxldCBuZXh0T2Zmc2V0ID0gcmV2ZXJzZSA/IGNvbnRhaW5lck9mZnNldCAtIG1vdXNlT2Zmc2V0IDogbW91c2VPZmZzZXQgLSBjb250YWluZXJPZmZzZXQ7XG4gICAgICAgIHJldHVybiBuZXh0T2Zmc2V0O1xuICAgIH07XG4gICAgbGV0IGRyYWdnaW5nID0gKDAsICQxcm5DUyR1c2VSZWYpKGZhbHNlKTtcbiAgICBsZXQgcHJldlBvc2l0aW9uID0gKDAsICQxcm5DUyR1c2VSZWYpKDApO1xuICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGN1cnJlbnQgaGFuZGxlcnMgaW4gYSByZWYgc28gdGhhdCB0aGUgZXZlbnRzIGNhbiBhY2Nlc3MgdGhlbS5cbiAgICBsZXQgaGFuZGxlcnMgPSAoMCwgJDFybkNTJHVzZVJlZikoe1xuICAgICAgICBvblBvc2l0aW9uQ2hhbmdlOiBvblBvc2l0aW9uQ2hhbmdlLFxuICAgICAgICBvbkRyYWc6IG9uRHJhZ1xuICAgIH0pO1xuICAgIGhhbmRsZXJzLmN1cnJlbnQub25EcmFnID0gb25EcmFnO1xuICAgIGhhbmRsZXJzLmN1cnJlbnQub25Qb3NpdGlvbkNoYW5nZSA9IG9uUG9zaXRpb25DaGFuZ2U7XG4gICAgbGV0IG9uTW91c2VEcmFnZ2VkID0gKGUpPT57XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbGV0IG5leHRPZmZzZXQgPSBnZXROZXh0T2Zmc2V0KGUpO1xuICAgICAgICBpZiAoIWRyYWdnaW5nLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGRyYWdnaW5nLmN1cnJlbnQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGhhbmRsZXJzLmN1cnJlbnQub25EcmFnKSBoYW5kbGVycy5jdXJyZW50Lm9uRHJhZyh0cnVlKTtcbiAgICAgICAgICAgIGlmIChoYW5kbGVycy5jdXJyZW50Lm9uUG9zaXRpb25DaGFuZ2UpIGhhbmRsZXJzLmN1cnJlbnQub25Qb3NpdGlvbkNoYW5nZShuZXh0T2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJldlBvc2l0aW9uLmN1cnJlbnQgPT09IG5leHRPZmZzZXQpIHJldHVybjtcbiAgICAgICAgcHJldlBvc2l0aW9uLmN1cnJlbnQgPSBuZXh0T2Zmc2V0O1xuICAgICAgICBpZiAob25Qb3NpdGlvbkNoYW5nZSkgb25Qb3NpdGlvbkNoYW5nZShuZXh0T2Zmc2V0KTtcbiAgICB9O1xuICAgIGxldCBvbk1vdXNlVXAgPSAoZSk9PntcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgIGRyYWdnaW5nLmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgbGV0IG5leHRPZmZzZXQgPSBnZXROZXh0T2Zmc2V0KGUpO1xuICAgICAgICBpZiAoaGFuZGxlcnMuY3VycmVudC5vbkRyYWcpIGhhbmRsZXJzLmN1cnJlbnQub25EcmFnKGZhbHNlKTtcbiAgICAgICAgaWYgKGhhbmRsZXJzLmN1cnJlbnQub25Qb3NpdGlvbkNoYW5nZSkgaGFuZGxlcnMuY3VycmVudC5vblBvc2l0aW9uQ2hhbmdlKG5leHRPZmZzZXQpO1xuICAgICAgICAkOWNjMDlkZjlmZDc2NzZiZSR2YXIkZHJhZ2dpbmdFbGVtZW50cy5zcGxpY2UoJDljYzA5ZGY5ZmQ3Njc2YmUkdmFyJGRyYWdnaW5nRWxlbWVudHMuaW5kZXhPZih0YXJnZXQpLCAxKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBvbk1vdXNlVXAsIGZhbHNlKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VEcmFnZ2VkLCBmYWxzZSk7XG4gICAgfTtcbiAgICBsZXQgb25Nb3VzZURvd24gPSAoZSk9PntcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZS5jdXJyZW50VGFyZ2V0O1xuICAgICAgICAvLyBJZiB3ZSdyZSBhbHJlYWR5IGhhbmRsaW5nIGRyYWdnaW5nIG9uIGEgZGVzY2VuZGFudCB3aXRoIHVzZURyYWcxRCwgdGhlblxuICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGhhbmRsZSB0aGUgZHJhZyBtb3Rpb24gb24gdGhpcyB0YXJnZXQgYXMgd2VsbC5cbiAgICAgICAgaWYgKCQ5Y2MwOWRmOWZkNzY3NmJlJHZhciRkcmFnZ2luZ0VsZW1lbnRzLnNvbWUoKGVsdCk9PnRhcmdldC5jb250YWlucyhlbHQpKSkgcmV0dXJuO1xuICAgICAgICAkOWNjMDlkZjlmZDc2NzZiZSR2YXIkZHJhZ2dpbmdFbGVtZW50cy5wdXNoKHRhcmdldCk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBvbk1vdXNlRHJhZ2dlZCwgZmFsc2UpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCwgZmFsc2UpO1xuICAgIH07XG4gICAgbGV0IG9uTW91c2VFbnRlciA9ICgpPT57XG4gICAgICAgIGlmIChvbkhvdmVyKSBvbkhvdmVyKHRydWUpO1xuICAgIH07XG4gICAgbGV0IG9uTW91c2VPdXQgPSAoKT0+e1xuICAgICAgICBpZiAob25Ib3Zlcikgb25Ib3ZlcihmYWxzZSk7XG4gICAgfTtcbiAgICBsZXQgb25LZXlEb3duID0gKGUpPT57XG4gICAgICAgIHN3aXRjaChlLmtleSl7XG4gICAgICAgICAgICBjYXNlICdMZWZ0JzpcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob25EZWNyZW1lbnQgJiYgIXJldmVyc2UpIG9uRGVjcmVtZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9uSW5jcmVtZW50ICYmIHJldmVyc2UpIG9uSW5jcmVtZW50KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnVXAnOlxuICAgICAgICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAndmVydGljYWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9uRGVjcmVtZW50ICYmICFyZXZlcnNlKSBvbkRlY3JlbWVudCgpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChvbkluY3JlbWVudCAmJiByZXZlcnNlKSBvbkluY3JlbWVudCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1JpZ2h0JzpcbiAgICAgICAgICAgIGNhc2UgJ0Fycm93UmlnaHQnOlxuICAgICAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9uSW5jcmVtZW50ICYmICFyZXZlcnNlKSBvbkluY3JlbWVudCgpO1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChvbkRlY3JlbWVudCAmJiByZXZlcnNlKSBvbkRlY3JlbWVudCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0Rvd24nOlxuICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob25JbmNyZW1lbnQgJiYgIXJldmVyc2UpIG9uSW5jcmVtZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9uRGVjcmVtZW50ICYmIHJldmVyc2UpIG9uRGVjcmVtZW50KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnSG9tZSc6XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGlmIChvbkRlY3JlbWVudFRvTWluKSBvbkRlY3JlbWVudFRvTWluKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdFbmQnOlxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBpZiAob25JbmNyZW1lbnRUb01heCkgb25JbmNyZW1lbnRUb01heCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnRW50ZXInOlxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBpZiAob25Db2xsYXBzZVRvZ2dsZSkgb25Db2xsYXBzZVRvZ2dsZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgICBvbk1vdXNlRG93bjogb25Nb3VzZURvd24sXG4gICAgICAgIG9uTW91c2VFbnRlcjogb25Nb3VzZUVudGVyLFxuICAgICAgICBvbk1vdXNlT3V0OiBvbk1vdXNlT3V0LFxuICAgICAgICBvbktleURvd246IG9uS2V5RG93blxuICAgIH07XG59XG5cblxuZXhwb3J0IHskOWNjMDlkZjlmZDc2NzZiZSRleHBvcnQkN2JiZWQ3NWZlYmEzOTcwNiBhcyB1c2VEcmFnMUR9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlRHJhZzFELm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7dXNlUmVmIGFzICRsUEF3dCR1c2VSZWYsIHVzZUNhbGxiYWNrIGFzICRsUEF3dCR1c2VDYWxsYmFjaywgdXNlRWZmZWN0IGFzICRsUEF3dCR1c2VFZmZlY3R9IGZyb20gXCJyZWFjdFwiO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMjAgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gXG5mdW5jdGlvbiAkMDNkZWIyM2ZmMTQ5MjBjNCRleHBvcnQkNGVhZjA0ZTU0YWE4ZWVkNigpIHtcbiAgICBsZXQgZ2xvYmFsTGlzdGVuZXJzID0gKDAsICRsUEF3dCR1c2VSZWYpKG5ldyBNYXAoKSk7XG4gICAgbGV0IGFkZEdsb2JhbExpc3RlbmVyID0gKDAsICRsUEF3dCR1c2VDYWxsYmFjaykoKGV2ZW50VGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgb3B0aW9ucyk9PntcbiAgICAgICAgLy8gTWFrZSBzdXJlIHdlIHJlbW92ZSB0aGUgbGlzdGVuZXIgYWZ0ZXIgaXQgaXMgY2FsbGVkIHdpdGggdGhlIGBvbmNlYCBvcHRpb24uXG4gICAgICAgIGxldCBmbiA9IChvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMub25jZSkgPyAoLi4uYXJncyk9PntcbiAgICAgICAgICAgIGdsb2JhbExpc3RlbmVycy5jdXJyZW50LmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgICAgICAgICBsaXN0ZW5lciguLi5hcmdzKTtcbiAgICAgICAgfSA6IGxpc3RlbmVyO1xuICAgICAgICBnbG9iYWxMaXN0ZW5lcnMuY3VycmVudC5zZXQobGlzdGVuZXIsIHtcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICBldmVudFRhcmdldDogZXZlbnRUYXJnZXQsXG4gICAgICAgICAgICBmbjogZm4sXG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgIH0pO1xuICAgICAgICBldmVudFRhcmdldC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBvcHRpb25zKTtcbiAgICB9LCBbXSk7XG4gICAgbGV0IHJlbW92ZUdsb2JhbExpc3RlbmVyID0gKDAsICRsUEF3dCR1c2VDYWxsYmFjaykoKGV2ZW50VGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgb3B0aW9ucyk9PntcbiAgICAgICAgdmFyIF9nbG9iYWxMaXN0ZW5lcnNfY3VycmVudF9nZXQ7XG4gICAgICAgIGxldCBmbiA9ICgoX2dsb2JhbExpc3RlbmVyc19jdXJyZW50X2dldCA9IGdsb2JhbExpc3RlbmVycy5jdXJyZW50LmdldChsaXN0ZW5lcikpID09PSBudWxsIHx8IF9nbG9iYWxMaXN0ZW5lcnNfY3VycmVudF9nZXQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9nbG9iYWxMaXN0ZW5lcnNfY3VycmVudF9nZXQuZm4pIHx8IGxpc3RlbmVyO1xuICAgICAgICBldmVudFRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBvcHRpb25zKTtcbiAgICAgICAgZ2xvYmFsTGlzdGVuZXJzLmN1cnJlbnQuZGVsZXRlKGxpc3RlbmVyKTtcbiAgICB9LCBbXSk7XG4gICAgbGV0IHJlbW92ZUFsbEdsb2JhbExpc3RlbmVycyA9ICgwLCAkbFBBd3QkdXNlQ2FsbGJhY2spKCgpPT57XG4gICAgICAgIGdsb2JhbExpc3RlbmVycy5jdXJyZW50LmZvckVhY2goKHZhbHVlLCBrZXkpPT57XG4gICAgICAgICAgICByZW1vdmVHbG9iYWxMaXN0ZW5lcih2YWx1ZS5ldmVudFRhcmdldCwgdmFsdWUudHlwZSwga2V5LCB2YWx1ZS5vcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfSwgW1xuICAgICAgICByZW1vdmVHbG9iYWxMaXN0ZW5lclxuICAgIF0pO1xuICAgICgwLCAkbFBBd3QkdXNlRWZmZWN0KSgoKT0+e1xuICAgICAgICByZXR1cm4gcmVtb3ZlQWxsR2xvYmFsTGlzdGVuZXJzO1xuICAgIH0sIFtcbiAgICAgICAgcmVtb3ZlQWxsR2xvYmFsTGlzdGVuZXJzXG4gICAgXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWRkR2xvYmFsTGlzdGVuZXI6IGFkZEdsb2JhbExpc3RlbmVyLFxuICAgICAgICByZW1vdmVHbG9iYWxMaXN0ZW5lcjogcmVtb3ZlR2xvYmFsTGlzdGVuZXIsXG4gICAgICAgIHJlbW92ZUFsbEdsb2JhbExpc3RlbmVyczogcmVtb3ZlQWxsR2xvYmFsTGlzdGVuZXJzXG4gICAgfTtcbn1cblxuXG5leHBvcnQgeyQwM2RlYjIzZmYxNDkyMGM0JGV4cG9ydCQ0ZWFmMDRlNTRhYThlZWQ2IGFzIHVzZUdsb2JhbExpc3RlbmVyc307XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VHbG9iYWxMaXN0ZW5lcnMubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHt1c2VJZCBhcyAkYmRiMTEwMTBjZWY3MDIzNiRleHBvcnQkZjY4MDg3N2EzNDcxMWUzN30gZnJvbSBcIi4vdXNlSWQubWpzXCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcbmZ1bmN0aW9uICQzMTNiOTg4NjFlZTVkZDZjJGV4cG9ydCRkNjg3NTEyMjE5NGM3YjQ0KHByb3BzLCBkZWZhdWx0TGFiZWwpIHtcbiAgICBsZXQgeyBpZDogaWQsICdhcmlhLWxhYmVsJzogbGFiZWwsICdhcmlhLWxhYmVsbGVkYnknOiBsYWJlbGxlZEJ5IH0gPSBwcm9wcztcbiAgICAvLyBJZiB0aGVyZSBpcyBib3RoIGFuIGFyaWEtbGFiZWwgYW5kIGFyaWEtbGFiZWxsZWRieSxcbiAgICAvLyBjb21iaW5lIHRoZW0gYnkgcG9pbnRpbmcgdG8gdGhlIGVsZW1lbnQgaXRzZWxmLlxuICAgIGlkID0gKDAsICRiZGIxMTAxMGNlZjcwMjM2JGV4cG9ydCRmNjgwODc3YTM0NzExZTM3KShpZCk7XG4gICAgaWYgKGxhYmVsbGVkQnkgJiYgbGFiZWwpIHtcbiAgICAgICAgbGV0IGlkcyA9IG5ldyBTZXQoW1xuICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAuLi5sYWJlbGxlZEJ5LnRyaW0oKS5zcGxpdCgvXFxzKy8pXG4gICAgICAgIF0pO1xuICAgICAgICBsYWJlbGxlZEJ5ID0gW1xuICAgICAgICAgICAgLi4uaWRzXG4gICAgICAgIF0uam9pbignICcpO1xuICAgIH0gZWxzZSBpZiAobGFiZWxsZWRCeSkgbGFiZWxsZWRCeSA9IGxhYmVsbGVkQnkudHJpbSgpLnNwbGl0KC9cXHMrLykuam9pbignICcpO1xuICAgIC8vIElmIG5vIGxhYmVscyBhcmUgcHJvdmlkZWQsIHVzZSB0aGUgZGVmYXVsdFxuICAgIGlmICghbGFiZWwgJiYgIWxhYmVsbGVkQnkgJiYgZGVmYXVsdExhYmVsKSBsYWJlbCA9IGRlZmF1bHRMYWJlbDtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogaWQsXG4gICAgICAgICdhcmlhLWxhYmVsJzogbGFiZWwsXG4gICAgICAgICdhcmlhLWxhYmVsbGVkYnknOiBsYWJlbGxlZEJ5XG4gICAgfTtcbn1cblxuXG5leHBvcnQgeyQzMTNiOTg4NjFlZTVkZDZjJGV4cG9ydCRkNjg3NTEyMjE5NGM3YjQ0IGFzIHVzZUxhYmVsc307XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VMYWJlbHMubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHt1c2VSZWYgYXMgJGdibW5zJHVzZVJlZiwgdXNlQ2FsbGJhY2sgYXMgJGdibW5zJHVzZUNhbGxiYWNrLCB1c2VNZW1vIGFzICRnYm1ucyR1c2VNZW1vfSBmcm9tIFwicmVhY3RcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIxIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuZnVuY3Rpb24gJGRmNTYxNjRkZmY1Nzg1ZTIkZXhwb3J0JDQzMzhiNTMzMTVhYmY2NjYocmVmKSB7XG4gICAgY29uc3Qgb2JqUmVmID0gKDAsICRnYm1ucyR1c2VSZWYpKG51bGwpO1xuICAgIGNvbnN0IGNsZWFudXBSZWYgPSAoMCwgJGdibW5zJHVzZVJlZikodW5kZWZpbmVkKTtcbiAgICBjb25zdCByZWZFZmZlY3QgPSAoMCwgJGdibW5zJHVzZUNhbGxiYWNrKSgoaW5zdGFuY2UpPT57XG4gICAgICAgIGlmICh0eXBlb2YgcmVmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjb25zdCByZWZDYWxsYmFjayA9IHJlZjtcbiAgICAgICAgICAgIGNvbnN0IHJlZkNsZWFudXAgPSByZWZDYWxsYmFjayhpbnN0YW5jZSk7XG4gICAgICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlZkNsZWFudXAgPT09ICdmdW5jdGlvbicpIHJlZkNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICBlbHNlIHJlZkNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChyZWYpIHtcbiAgICAgICAgICAgIHJlZi5jdXJyZW50ID0gaW5zdGFuY2U7XG4gICAgICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgICAgICByZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSwgW1xuICAgICAgICByZWZcbiAgICBdKTtcbiAgICByZXR1cm4gKDAsICRnYm1ucyR1c2VNZW1vKSgoKT0+KHtcbiAgICAgICAgICAgIGdldCBjdXJyZW50ICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqUmVmLmN1cnJlbnQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0IGN1cnJlbnQgKHZhbHVlKXtcbiAgICAgICAgICAgICAgICBvYmpSZWYuY3VycmVudCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIGlmIChjbGVhbnVwUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYW51cFJlZi5jdXJyZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFudXBSZWYuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIGNsZWFudXBSZWYuY3VycmVudCA9IHJlZkVmZmVjdCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLCBbXG4gICAgICAgIHJlZkVmZmVjdFxuICAgIF0pO1xufVxuXG5cbmV4cG9ydCB7JGRmNTYxNjRkZmY1Nzg1ZTIkZXhwb3J0JDQzMzhiNTMzMTVhYmY2NjYgYXMgdXNlT2JqZWN0UmVmfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVzZU9iamVjdFJlZi5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge3VzZVJlZiBhcyAkOXZXMDUkdXNlUmVmLCB1c2VFZmZlY3QgYXMgJDl2VzA1JHVzZUVmZmVjdH0gZnJvbSBcInJlYWN0XCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcbmZ1bmN0aW9uICQ0ZjU4YzVmNzJiY2Y3OWY3JGV4cG9ydCQ0OTYzMTVhMTYwOGQ5NjAyKGVmZmVjdCwgZGVwZW5kZW5jaWVzKSB7XG4gICAgY29uc3QgaXNJbml0aWFsTW91bnQgPSAoMCwgJDl2VzA1JHVzZVJlZikodHJ1ZSk7XG4gICAgY29uc3QgbGFzdERlcHMgPSAoMCwgJDl2VzA1JHVzZVJlZikobnVsbCk7XG4gICAgKDAsICQ5dlcwNSR1c2VFZmZlY3QpKCgpPT57XG4gICAgICAgIGlzSW5pdGlhbE1vdW50LmN1cnJlbnQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgIGlzSW5pdGlhbE1vdW50LmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgfTtcbiAgICB9LCBbXSk7XG4gICAgKDAsICQ5dlcwNSR1c2VFZmZlY3QpKCgpPT57XG4gICAgICAgIGxldCBwcmV2RGVwcyA9IGxhc3REZXBzLmN1cnJlbnQ7XG4gICAgICAgIGlmIChpc0luaXRpYWxNb3VudC5jdXJyZW50KSBpc0luaXRpYWxNb3VudC5jdXJyZW50ID0gZmFsc2U7XG4gICAgICAgIGVsc2UgaWYgKCFwcmV2RGVwcyB8fCBkZXBlbmRlbmNpZXMuc29tZSgoZGVwLCBpKT0+IU9iamVjdC5pcyhkZXAsIHByZXZEZXBzW2ldKSkpIGVmZmVjdCgpO1xuICAgICAgICBsYXN0RGVwcy5jdXJyZW50ID0gZGVwZW5kZW5jaWVzO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgICB9LCBkZXBlbmRlbmNpZXMpO1xufVxuXG5cbmV4cG9ydCB7JDRmNThjNWY3MmJjZjc5ZjckZXhwb3J0JDQ5NjMxNWExNjA4ZDk2MDIgYXMgdXNlVXBkYXRlRWZmZWN0fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVzZVVwZGF0ZUVmZmVjdC5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge3VzZUxheW91dEVmZmVjdCBhcyAkZjBhMDRjY2Q4ZGJkZDgzYiRleHBvcnQkZTVjNWE1ZjkxN2E1ODcxY30gZnJvbSBcIi4vdXNlTGF5b3V0RWZmZWN0Lm1qc1wiO1xuaW1wb3J0IHt1c2VSZWYgYXMgJGF6c0UyJHVzZVJlZn0gZnJvbSBcInJlYWN0XCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyNCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcblxuZnVuY3Rpb24gJGNhOWIzNzcxMmYwMDczODEkZXhwb3J0JDcyZWY3MDhhYjA3MjUxZjEoZWZmZWN0LCBkZXBlbmRlbmNpZXMpIHtcbiAgICBjb25zdCBpc0luaXRpYWxNb3VudCA9ICgwLCAkYXpzRTIkdXNlUmVmKSh0cnVlKTtcbiAgICBjb25zdCBsYXN0RGVwcyA9ICgwLCAkYXpzRTIkdXNlUmVmKShudWxsKTtcbiAgICAoMCwgJGYwYTA0Y2NkOGRiZGQ4M2IkZXhwb3J0JGU1YzVhNWY5MTdhNTg3MWMpKCgpPT57XG4gICAgICAgIGlzSW5pdGlhbE1vdW50LmN1cnJlbnQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgIGlzSW5pdGlhbE1vdW50LmN1cnJlbnQgPSBmYWxzZTtcbiAgICAgICAgfTtcbiAgICB9LCBbXSk7XG4gICAgKDAsICRmMGEwNGNjZDhkYmRkODNiJGV4cG9ydCRlNWM1YTVmOTE3YTU4NzFjKSgoKT0+e1xuICAgICAgICBpZiAoaXNJbml0aWFsTW91bnQuY3VycmVudCkgaXNJbml0aWFsTW91bnQuY3VycmVudCA9IGZhbHNlO1xuICAgICAgICBlbHNlIGlmICghbGFzdERlcHMuY3VycmVudCB8fCBkZXBlbmRlbmNpZXMuc29tZSgoZGVwLCBpKT0+IU9iamVjdC5pcyhkZXAsIGxhc3REZXBzW2ldKSkpIGVmZmVjdCgpO1xuICAgICAgICBsYXN0RGVwcy5jdXJyZW50ID0gZGVwZW5kZW5jaWVzO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcbiAgICB9LCBkZXBlbmRlbmNpZXMpO1xufVxuXG5cbmV4cG9ydCB7JGNhOWIzNzcxMmYwMDczODEkZXhwb3J0JDcyZWY3MDhhYjA3MjUxZjEgYXMgdXNlVXBkYXRlTGF5b3V0RWZmZWN0fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVzZVVwZGF0ZUxheW91dEVmZmVjdC5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge3VzZUVmZmVjdCBhcyAkVnNsOG8kdXNlRWZmZWN0fSBmcm9tIFwicmVhY3RcIjtcblxuXG5mdW5jdGlvbiAkOWRhYWIwMmQ0NjE4MDlkYiR2YXIkaGFzUmVzaXplT2JzZXJ2ZXIoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cuUmVzaXplT2JzZXJ2ZXIgIT09ICd1bmRlZmluZWQnO1xufVxuZnVuY3Rpb24gJDlkYWFiMDJkNDYxODA5ZGIkZXhwb3J0JDY4MzQ4MGYxOTFjMGUzZWEob3B0aW9ucykge1xuICAgIGNvbnN0IHsgcmVmOiByZWYsIGJveDogYm94LCBvblJlc2l6ZTogb25SZXNpemUgfSA9IG9wdGlvbnM7XG4gICAgKDAsICRWc2w4byR1c2VFZmZlY3QpKCgpPT57XG4gICAgICAgIGxldCBlbGVtZW50ID0gcmVmID09PSBudWxsIHx8IHJlZiA9PT0gdm9pZCAwID8gdm9pZCAwIDogcmVmLmN1cnJlbnQ7XG4gICAgICAgIGlmICghZWxlbWVudCkgcmV0dXJuO1xuICAgICAgICBpZiAoISQ5ZGFhYjAyZDQ2MTgwOWRiJHZhciRoYXNSZXNpemVPYnNlcnZlcigpKSB7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgb25SZXNpemUsIGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBvblJlc2l6ZSwgZmFsc2UpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJlc2l6ZU9ic2VydmVySW5zdGFuY2UgPSBuZXcgd2luZG93LlJlc2l6ZU9ic2VydmVyKChlbnRyaWVzKT0+e1xuICAgICAgICAgICAgICAgIGlmICghZW50cmllcy5sZW5ndGgpIHJldHVybjtcbiAgICAgICAgICAgICAgICBvblJlc2l6ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXNpemVPYnNlcnZlckluc3RhbmNlLm9ic2VydmUoZWxlbWVudCwge1xuICAgICAgICAgICAgICAgIGJveDogYm94XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50KSByZXNpemVPYnNlcnZlckluc3RhbmNlLnVub2JzZXJ2ZShlbGVtZW50KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LCBbXG4gICAgICAgIG9uUmVzaXplLFxuICAgICAgICByZWYsXG4gICAgICAgIGJveFxuICAgIF0pO1xufVxuXG5cbmV4cG9ydCB7JDlkYWFiMDJkNDYxODA5ZGIkZXhwb3J0JDY4MzQ4MGYxOTFjMGUzZWEgYXMgdXNlUmVzaXplT2JzZXJ2ZXJ9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlUmVzaXplT2JzZXJ2ZXIubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHt1c2VMYXlvdXRFZmZlY3QgYXMgJGYwYTA0Y2NkOGRiZGQ4M2IkZXhwb3J0JGU1YzVhNWY5MTdhNTg3MWN9IGZyb20gXCIuL3VzZUxheW91dEVmZmVjdC5tanNcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuZnVuY3Rpb24gJGU3ODAxYmU4MmI0YjJhNTMkZXhwb3J0JDRkZWJkYjFhM2YwZmE3OWUoY29udGV4dCwgcmVmKSB7XG4gICAgKDAsICRmMGEwNGNjZDhkYmRkODNiJGV4cG9ydCRlNWM1YTVmOTE3YTU4NzFjKSgoKT0+e1xuICAgICAgICBpZiAoY29udGV4dCAmJiBjb250ZXh0LnJlZiAmJiByZWYpIHtcbiAgICAgICAgICAgIGNvbnRleHQucmVmLmN1cnJlbnQgPSByZWYuY3VycmVudDtcbiAgICAgICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgICAgIGlmIChjb250ZXh0LnJlZikgY29udGV4dC5yZWYuY3VycmVudCA9IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cblxuZXhwb3J0IHskZTc4MDFiZTgyYjRiMmE1MyRleHBvcnQkNGRlYmRiMWEzZjBmYTc5ZSBhcyB1c2VTeW5jUmVmfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVzZVN5bmNSZWYubW9kdWxlLmpzLm1hcFxuIiwiLypcbiAqIENvcHlyaWdodCAyMDI0IEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIGZ1bmN0aW9uICRjYzM4ZTdiZDNmYzdiMjEzJGV4cG9ydCQyYmI3NDc0MGM0ZTE5ZGVmKG5vZGUsIGNoZWNrRm9yT3ZlcmZsb3cpIHtcbiAgICBpZiAoIW5vZGUpIHJldHVybiBmYWxzZTtcbiAgICBsZXQgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBsZXQgaXNTY3JvbGxhYmxlID0gLyhhdXRvfHNjcm9sbCkvLnRlc3Qoc3R5bGUub3ZlcmZsb3cgKyBzdHlsZS5vdmVyZmxvd1ggKyBzdHlsZS5vdmVyZmxvd1kpO1xuICAgIGlmIChpc1Njcm9sbGFibGUgJiYgY2hlY2tGb3JPdmVyZmxvdykgaXNTY3JvbGxhYmxlID0gbm9kZS5zY3JvbGxIZWlnaHQgIT09IG5vZGUuY2xpZW50SGVpZ2h0IHx8IG5vZGUuc2Nyb2xsV2lkdGggIT09IG5vZGUuY2xpZW50V2lkdGg7XG4gICAgcmV0dXJuIGlzU2Nyb2xsYWJsZTtcbn1cblxuXG5leHBvcnQgeyRjYzM4ZTdiZDNmYzdiMjEzJGV4cG9ydCQyYmI3NDc0MGM0ZTE5ZGVmIGFzIGlzU2Nyb2xsYWJsZX07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pc1Njcm9sbGFibGUubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHtpc1Njcm9sbGFibGUgYXMgJGNjMzhlN2JkM2ZjN2IyMTMkZXhwb3J0JDJiYjc0NzQwYzRlMTlkZWZ9IGZyb20gXCIuL2lzU2Nyb2xsYWJsZS5tanNcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuZnVuY3Rpb24gJDYyZDhkZWQ5Mjk2ZjM4NzIkZXhwb3J0JGNmYTIyMjVlODc5Mzg3ODEobm9kZSwgY2hlY2tGb3JPdmVyZmxvdykge1xuICAgIGxldCBzY3JvbGxhYmxlTm9kZSA9IG5vZGU7XG4gICAgaWYgKCgwLCAkY2MzOGU3YmQzZmM3YjIxMyRleHBvcnQkMmJiNzQ3NDBjNGUxOWRlZikoc2Nyb2xsYWJsZU5vZGUsIGNoZWNrRm9yT3ZlcmZsb3cpKSBzY3JvbGxhYmxlTm9kZSA9IHNjcm9sbGFibGVOb2RlLnBhcmVudEVsZW1lbnQ7XG4gICAgd2hpbGUoc2Nyb2xsYWJsZU5vZGUgJiYgISgwLCAkY2MzOGU3YmQzZmM3YjIxMyRleHBvcnQkMmJiNzQ3NDBjNGUxOWRlZikoc2Nyb2xsYWJsZU5vZGUsIGNoZWNrRm9yT3ZlcmZsb3cpKXNjcm9sbGFibGVOb2RlID0gc2Nyb2xsYWJsZU5vZGUucGFyZW50RWxlbWVudDtcbiAgICByZXR1cm4gc2Nyb2xsYWJsZU5vZGUgfHwgZG9jdW1lbnQuc2Nyb2xsaW5nRWxlbWVudCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG59XG5cblxuZXhwb3J0IHskNjJkOGRlZDkyOTZmMzg3MiRleHBvcnQkY2ZhMjIyNWU4NzkzODc4MSBhcyBnZXRTY3JvbGxQYXJlbnR9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2V0U2Nyb2xsUGFyZW50Lm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7aXNTY3JvbGxhYmxlIGFzICRjYzM4ZTdiZDNmYzdiMjEzJGV4cG9ydCQyYmI3NDc0MGM0ZTE5ZGVmfSBmcm9tIFwiLi9pc1Njcm9sbGFibGUubWpzXCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyNCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcbmZ1bmN0aW9uICRhNDBjNjczZGM5ZjZkOWM3JGV4cG9ydCQ5NGVkMWM5MmM3YmVlYjIyKG5vZGUsIGNoZWNrRm9yT3ZlcmZsb3cpIHtcbiAgICBjb25zdCBzY3JvbGxQYXJlbnRzID0gW107XG4gICAgd2hpbGUobm9kZSAmJiBub2RlICE9PSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpe1xuICAgICAgICBpZiAoKDAsICRjYzM4ZTdiZDNmYzdiMjEzJGV4cG9ydCQyYmI3NDc0MGM0ZTE5ZGVmKShub2RlLCBjaGVja0Zvck92ZXJmbG93KSkgc2Nyb2xsUGFyZW50cy5wdXNoKG5vZGUpO1xuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50O1xuICAgIH1cbiAgICByZXR1cm4gc2Nyb2xsUGFyZW50cztcbn1cblxuXG5leHBvcnQgeyRhNDBjNjczZGM5ZjZkOWM3JGV4cG9ydCQ5NGVkMWM5MmM3YmVlYjIyIGFzIGdldFNjcm9sbFBhcmVudHN9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2V0U2Nyb2xsUGFyZW50cy5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge2lzTWFjIGFzICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCQ5YWMxMDBlNDA2MTNlYTEwfSBmcm9tIFwiLi9wbGF0Zm9ybS5tanNcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDI0IEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuZnVuY3Rpb24gJDIxZjFhYTk4YWNiMDgzMTckZXhwb3J0JDE2NzkyZWZmZTgzN2RiYTMoZSkge1xuICAgIGlmICgoMCwgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JDlhYzEwMGU0MDYxM2VhMTApKCkpIHJldHVybiBlLm1ldGFLZXk7XG4gICAgcmV0dXJuIGUuY3RybEtleTtcbn1cbi8vIEhUTUwgaW5wdXQgdHlwZXMgdGhhdCBkbyBub3QgY2F1c2UgdGhlIHNvZnR3YXJlIGtleWJvYXJkIHRvIGFwcGVhci5cbmNvbnN0ICQyMWYxYWE5OGFjYjA4MzE3JHZhciRub25UZXh0SW5wdXRUeXBlcyA9IG5ldyBTZXQoW1xuICAgICdjaGVja2JveCcsXG4gICAgJ3JhZGlvJyxcbiAgICAncmFuZ2UnLFxuICAgICdjb2xvcicsXG4gICAgJ2ZpbGUnLFxuICAgICdpbWFnZScsXG4gICAgJ2J1dHRvbicsXG4gICAgJ3N1Ym1pdCcsXG4gICAgJ3Jlc2V0J1xuXSk7XG5mdW5jdGlvbiAkMjFmMWFhOThhY2IwODMxNyRleHBvcnQkYzU3OTU4ZTM1ZjMxZWQ3Myh0YXJnZXQpIHtcbiAgICByZXR1cm4gdGFyZ2V0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCAmJiAhJDIxZjFhYTk4YWNiMDgzMTckdmFyJG5vblRleHRJbnB1dFR5cGVzLmhhcyh0YXJnZXQudHlwZSkgfHwgdGFyZ2V0IGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCB8fCB0YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJiB0YXJnZXQuaXNDb250ZW50RWRpdGFibGU7XG59XG5cblxuZXhwb3J0IHskMjFmMWFhOThhY2IwODMxNyRleHBvcnQkMTY3OTJlZmZlODM3ZGJhMyBhcyBpc0N0cmxLZXlQcmVzc2VkLCAkMjFmMWFhOThhY2IwODMxNyRleHBvcnQkYzU3OTU4ZTM1ZjMxZWQ3MyBhcyB3aWxsT3BlbktleWJvYXJkfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWtleWJvYXJkLm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7d2lsbE9wZW5LZXlib2FyZCBhcyAkMjFmMWFhOThhY2IwODMxNyRleHBvcnQkYzU3OTU4ZTM1ZjMxZWQ3M30gZnJvbSBcIi4va2V5Ym9hcmQubWpzXCI7XG5pbXBvcnQge3VzZVN0YXRlIGFzICRmdURIQSR1c2VTdGF0ZSwgdXNlRWZmZWN0IGFzICRmdURIQSR1c2VFZmZlY3R9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHt1c2VJc1NTUiBhcyAkZnVESEEkdXNlSXNTU1J9IGZyb20gXCJAcmVhY3QtYXJpYS9zc3JcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuXG5cbmxldCAkNWRmNjRiMzgwN2RjMTVlZSR2YXIkdmlzdWFsVmlld3BvcnQgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy52aXN1YWxWaWV3cG9ydDtcbmZ1bmN0aW9uICQ1ZGY2NGIzODA3ZGMxNWVlJGV4cG9ydCRkNjk5OTA1ZGQ1N2M3M2NhKCkge1xuICAgIGxldCBpc1NTUiA9ICgwLCAkZnVESEEkdXNlSXNTU1IpKCk7XG4gICAgbGV0IFtzaXplLCBzZXRTaXplXSA9ICgwLCAkZnVESEEkdXNlU3RhdGUpKCgpPT5pc1NTUiA/IHtcbiAgICAgICAgICAgIHdpZHRoOiAwLFxuICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgIH0gOiAkNWRmNjRiMzgwN2RjMTVlZSR2YXIkZ2V0Vmlld3BvcnRTaXplKCkpO1xuICAgICgwLCAkZnVESEEkdXNlRWZmZWN0KSgoKT0+e1xuICAgICAgICAvLyBVc2UgdmlzdWFsVmlld3BvcnQgYXBpIHRvIHRyYWNrIGF2YWlsYWJsZSBoZWlnaHQgZXZlbiBvbiBpT1MgdmlydHVhbCBrZXlib2FyZCBvcGVuaW5nXG4gICAgICAgIGxldCBvblJlc2l6ZSA9ICgpPT57XG4gICAgICAgICAgICAvLyBJZ25vcmUgdXBkYXRlcyB3aGVuIHpvb21lZC5cbiAgICAgICAgICAgIGlmICgkNWRmNjRiMzgwN2RjMTVlZSR2YXIkdmlzdWFsVmlld3BvcnQgJiYgJDVkZjY0YjM4MDdkYzE1ZWUkdmFyJHZpc3VhbFZpZXdwb3J0LnNjYWxlID4gMSkgcmV0dXJuO1xuICAgICAgICAgICAgc2V0U2l6ZSgoc2l6ZSk9PntcbiAgICAgICAgICAgICAgICBsZXQgbmV3U2l6ZSA9ICQ1ZGY2NGIzODA3ZGMxNWVlJHZhciRnZXRWaWV3cG9ydFNpemUoKTtcbiAgICAgICAgICAgICAgICBpZiAobmV3U2l6ZS53aWR0aCA9PT0gc2l6ZS53aWR0aCAmJiBuZXdTaXplLmhlaWdodCA9PT0gc2l6ZS5oZWlnaHQpIHJldHVybiBzaXplO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXdTaXplO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIFdoZW4gY2xvc2luZyB0aGUga2V5Ym9hcmQsIGlPUyBkb2VzIG5vdCBmaXJlIHRoZSB2aXN1YWwgdmlld3BvcnQgcmVzaXplIGV2ZW50IHVudGlsIHRoZSBhbmltYXRpb24gaXMgY29tcGxldGUuXG4gICAgICAgIC8vIFdlIGNhbiBhbnRpY2lwYXRlIHRoaXMgYW5kIHJlc2l6ZSBlYXJseSBieSBoYW5kbGluZyB0aGUgYmx1ciBldmVudCBhbmQgdXNpbmcgdGhlIGxheW91dCBzaXplLlxuICAgICAgICBsZXQgZnJhbWU7XG4gICAgICAgIGxldCBvbkJsdXIgPSAoZSk9PntcbiAgICAgICAgICAgIGlmICgkNWRmNjRiMzgwN2RjMTVlZSR2YXIkdmlzdWFsVmlld3BvcnQgJiYgJDVkZjY0YjM4MDdkYzE1ZWUkdmFyJHZpc3VhbFZpZXdwb3J0LnNjYWxlID4gMSkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKCgwLCAkMjFmMWFhOThhY2IwODMxNyRleHBvcnQkYzU3OTU4ZTM1ZjMxZWQ3MykoZS50YXJnZXQpKSAvLyBXYWl0IG9uZSBmcmFtZSB0byBzZWUgaWYgYSBuZXcgZWxlbWVudCBnZXRzIGZvY3VzZWQuXG4gICAgICAgICAgICBmcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKT0+e1xuICAgICAgICAgICAgICAgIGlmICghZG9jdW1lbnQuYWN0aXZlRWxlbWVudCB8fCAhKDAsICQyMWYxYWE5OGFjYjA4MzE3JGV4cG9ydCRjNTc5NThlMzVmMzFlZDczKShkb2N1bWVudC5hY3RpdmVFbGVtZW50KSkgc2V0U2l6ZSgoc2l6ZSk9PntcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1NpemUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV3U2l6ZS53aWR0aCA9PT0gc2l6ZS53aWR0aCAmJiBuZXdTaXplLmhlaWdodCA9PT0gc2l6ZS5oZWlnaHQpIHJldHVybiBzaXplO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3U2l6ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsIG9uQmx1ciwgdHJ1ZSk7XG4gICAgICAgIGlmICghJDVkZjY0YjM4MDdkYzE1ZWUkdmFyJHZpc3VhbFZpZXdwb3J0KSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgb25SZXNpemUpO1xuICAgICAgICBlbHNlICQ1ZGY2NGIzODA3ZGMxNWVlJHZhciR2aXN1YWxWaWV3cG9ydC5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBvblJlc2l6ZSk7XG4gICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JsdXInLCBvbkJsdXIsIHRydWUpO1xuICAgICAgICAgICAgaWYgKCEkNWRmNjRiMzgwN2RjMTVlZSR2YXIkdmlzdWFsVmlld3BvcnQpIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBvblJlc2l6ZSk7XG4gICAgICAgICAgICBlbHNlICQ1ZGY2NGIzODA3ZGMxNWVlJHZhciR2aXN1YWxWaWV3cG9ydC5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBvblJlc2l6ZSk7XG4gICAgICAgIH07XG4gICAgfSwgW10pO1xuICAgIHJldHVybiBzaXplO1xufVxuZnVuY3Rpb24gJDVkZjY0YjM4MDdkYzE1ZWUkdmFyJGdldFZpZXdwb3J0U2l6ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAvLyBNdWx0aXBseSBieSB0aGUgdmlzdWFsVmlld3BvcnQgc2NhbGUgdG8gZ2V0IHRoZSBcIm5hdHVyYWxcIiBzaXplLCB1bmFmZmVjdGVkIGJ5IHBpbmNoIHpvb21pbmcuXG4gICAgICAgIHdpZHRoOiAkNWRmNjRiMzgwN2RjMTVlZSR2YXIkdmlzdWFsVmlld3BvcnQgPyAkNWRmNjRiMzgwN2RjMTVlZSR2YXIkdmlzdWFsVmlld3BvcnQud2lkdGggKiAkNWRmNjRiMzgwN2RjMTVlZSR2YXIkdmlzdWFsVmlld3BvcnQuc2NhbGUgOiB3aW5kb3cuaW5uZXJXaWR0aCxcbiAgICAgICAgaGVpZ2h0OiAkNWRmNjRiMzgwN2RjMTVlZSR2YXIkdmlzdWFsVmlld3BvcnQgPyAkNWRmNjRiMzgwN2RjMTVlZSR2YXIkdmlzdWFsVmlld3BvcnQuaGVpZ2h0ICogJDVkZjY0YjM4MDdkYzE1ZWUkdmFyJHZpc3VhbFZpZXdwb3J0LnNjYWxlIDogd2luZG93LmlubmVySGVpZ2h0XG4gICAgfTtcbn1cblxuXG5leHBvcnQgeyQ1ZGY2NGIzODA3ZGMxNWVlJGV4cG9ydCRkNjk5OTA1ZGQ1N2M3M2NhIGFzIHVzZVZpZXdwb3J0U2l6ZX07XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VWaWV3cG9ydFNpemUubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHt1c2VMYXlvdXRFZmZlY3QgYXMgJGYwYTA0Y2NkOGRiZGQ4M2IkZXhwb3J0JGU1YzVhNWY5MTdhNTg3MWN9IGZyb20gXCIuL3VzZUxheW91dEVmZmVjdC5tanNcIjtcbmltcG9ydCB7dXNlU3RhdGUgYXMgJGhRNUhwJHVzZVN0YXRlfSBmcm9tIFwicmVhY3RcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuXG5sZXQgJGVmMDYyNTYwNzk2ODZiYTAkdmFyJGRlc2NyaXB0aW9uSWQgPSAwO1xuY29uc3QgJGVmMDYyNTYwNzk2ODZiYTAkdmFyJGRlc2NyaXB0aW9uTm9kZXMgPSBuZXcgTWFwKCk7XG5mdW5jdGlvbiAkZWYwNjI1NjA3OTY4NmJhMCRleHBvcnQkZjhhZWRhN2IxMDc1M2ZhMShkZXNjcmlwdGlvbikge1xuICAgIGxldCBbaWQsIHNldElkXSA9ICgwLCAkaFE1SHAkdXNlU3RhdGUpKCk7XG4gICAgKDAsICRmMGEwNGNjZDhkYmRkODNiJGV4cG9ydCRlNWM1YTVmOTE3YTU4NzFjKSgoKT0+e1xuICAgICAgICBpZiAoIWRlc2NyaXB0aW9uKSByZXR1cm47XG4gICAgICAgIGxldCBkZXNjID0gJGVmMDYyNTYwNzk2ODZiYTAkdmFyJGRlc2NyaXB0aW9uTm9kZXMuZ2V0KGRlc2NyaXB0aW9uKTtcbiAgICAgICAgaWYgKCFkZXNjKSB7XG4gICAgICAgICAgICBsZXQgaWQgPSBgcmVhY3QtYXJpYS1kZXNjcmlwdGlvbi0keyRlZjA2MjU2MDc5Njg2YmEwJHZhciRkZXNjcmlwdGlvbklkKyt9YDtcbiAgICAgICAgICAgIHNldElkKGlkKTtcbiAgICAgICAgICAgIGxldCBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBub2RlLmlkID0gaWQ7XG4gICAgICAgICAgICBub2RlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICBub2RlLnRleHRDb250ZW50ID0gZGVzY3JpcHRpb247XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICAgICAgZGVzYyA9IHtcbiAgICAgICAgICAgICAgICByZWZDb3VudDogMCxcbiAgICAgICAgICAgICAgICBlbGVtZW50OiBub2RlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJGVmMDYyNTYwNzk2ODZiYTAkdmFyJGRlc2NyaXB0aW9uTm9kZXMuc2V0KGRlc2NyaXB0aW9uLCBkZXNjKTtcbiAgICAgICAgfSBlbHNlIHNldElkKGRlc2MuZWxlbWVudC5pZCk7XG4gICAgICAgIGRlc2MucmVmQ291bnQrKztcbiAgICAgICAgcmV0dXJuICgpPT57XG4gICAgICAgICAgICBpZiAoZGVzYyAmJiAtLWRlc2MucmVmQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICBkZXNjLmVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgJGVmMDYyNTYwNzk2ODZiYTAkdmFyJGRlc2NyaXB0aW9uTm9kZXMuZGVsZXRlKGRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9LCBbXG4gICAgICAgIGRlc2NyaXB0aW9uXG4gICAgXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgJ2FyaWEtZGVzY3JpYmVkYnknOiBkZXNjcmlwdGlvbiA/IGlkIDogdW5kZWZpbmVkXG4gICAgfTtcbn1cblxuXG5leHBvcnQgeyRlZjA2MjU2MDc5Njg2YmEwJGV4cG9ydCRmOGFlZGE3YjEwNzUzZmExIGFzIHVzZURlc2NyaXB0aW9ufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVzZURlc2NyaXB0aW9uLm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7dXNlRWZmZWN0RXZlbnQgYXMgJDhhZTA1ZWFhNWMxMTRlOWMkZXhwb3J0JDdmNTRmYzMxODA1MDhhNTJ9IGZyb20gXCIuL3VzZUVmZmVjdEV2ZW50Lm1qc1wiO1xuaW1wb3J0IHt1c2VFZmZlY3QgYXMgJGNlUWQ2JHVzZUVmZmVjdH0gZnJvbSBcInJlYWN0XCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMSBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcblxuZnVuY3Rpb24gJGU5ZmFhZmI2NDFlMTY3ZGIkZXhwb3J0JDkwZmMzYTE3ZDkzZjcwNGMocmVmLCBldmVudCwgaGFuZGxlciwgb3B0aW9ucykge1xuICAgIGxldCBoYW5kbGVFdmVudCA9ICgwLCAkOGFlMDVlYWE1YzExNGU5YyRleHBvcnQkN2Y1NGZjMzE4MDUwOGE1MikoaGFuZGxlcik7XG4gICAgbGV0IGlzRGlzYWJsZWQgPSBoYW5kbGVyID09IG51bGw7XG4gICAgKDAsICRjZVFkNiR1c2VFZmZlY3QpKCgpPT57XG4gICAgICAgIGlmIChpc0Rpc2FibGVkIHx8ICFyZWYuY3VycmVudCkgcmV0dXJuO1xuICAgICAgICBsZXQgZWxlbWVudCA9IHJlZi5jdXJyZW50O1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZUV2ZW50LCBvcHRpb25zKTtcbiAgICAgICAgcmV0dXJuICgpPT57XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZUV2ZW50LCBvcHRpb25zKTtcbiAgICAgICAgfTtcbiAgICB9LCBbXG4gICAgICAgIHJlZixcbiAgICAgICAgZXZlbnQsXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIGlzRGlzYWJsZWQsXG4gICAgICAgIGhhbmRsZUV2ZW50XG4gICAgXSk7XG59XG5cblxuZXhwb3J0IHskZTlmYWFmYjY0MWUxNjdkYiRleHBvcnQkOTBmYzNhMTdkOTNmNzA0YyBhcyB1c2VFdmVudH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VFdmVudC5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge2dldFNjcm9sbFBhcmVudHMgYXMgJGE0MGM2NzNkYzlmNmQ5YzckZXhwb3J0JDk0ZWQxYzkyYzdiZWViMjJ9IGZyb20gXCIuL2dldFNjcm9sbFBhcmVudHMubWpzXCI7XG5pbXBvcnQge2lzQ2hyb21lIGFzICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCQ2NDQ2YTE4NmQwOWUzNzllfSBmcm9tIFwiLi9wbGF0Zm9ybS5tanNcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIwIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuXG5mdW5jdGlvbiAkMmYwNGNiYzQ0ZWUzMGNlMCRleHBvcnQkNTNhMDkxMGYwMzgzMzdiZChzY3JvbGxWaWV3LCBlbGVtZW50KSB7XG4gICAgbGV0IG9mZnNldFggPSAkMmYwNGNiYzQ0ZWUzMGNlMCR2YXIkcmVsYXRpdmVPZmZzZXQoc2Nyb2xsVmlldywgZWxlbWVudCwgJ2xlZnQnKTtcbiAgICBsZXQgb2Zmc2V0WSA9ICQyZjA0Y2JjNDRlZTMwY2UwJHZhciRyZWxhdGl2ZU9mZnNldChzY3JvbGxWaWV3LCBlbGVtZW50LCAndG9wJyk7XG4gICAgbGV0IHdpZHRoID0gZWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICBsZXQgaGVpZ2h0ID0gZWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgbGV0IHggPSBzY3JvbGxWaWV3LnNjcm9sbExlZnQ7XG4gICAgbGV0IHkgPSBzY3JvbGxWaWV3LnNjcm9sbFRvcDtcbiAgICAvLyBBY2NvdW50IGZvciB0b3AvbGVmdCBib3JkZXIgb2Zmc2V0dGluZyB0aGUgc2Nyb2xsIHRvcC9MZWZ0ICsgc2Nyb2xsIHBhZGRpbmdcbiAgICBsZXQgeyBib3JkZXJUb3BXaWR0aDogYm9yZGVyVG9wV2lkdGgsIGJvcmRlckxlZnRXaWR0aDogYm9yZGVyTGVmdFdpZHRoLCBzY3JvbGxQYWRkaW5nVG9wOiBzY3JvbGxQYWRkaW5nVG9wLCBzY3JvbGxQYWRkaW5nUmlnaHQ6IHNjcm9sbFBhZGRpbmdSaWdodCwgc2Nyb2xsUGFkZGluZ0JvdHRvbTogc2Nyb2xsUGFkZGluZ0JvdHRvbSwgc2Nyb2xsUGFkZGluZ0xlZnQ6IHNjcm9sbFBhZGRpbmdMZWZ0IH0gPSBnZXRDb21wdXRlZFN0eWxlKHNjcm9sbFZpZXcpO1xuICAgIC8vIEFjY291bnQgZm9yIHNjcm9sbCBtYXJnaW4gb2YgdGhlIGVsZW1lbnRcbiAgICBsZXQgeyBzY3JvbGxNYXJnaW5Ub3A6IHNjcm9sbE1hcmdpblRvcCwgc2Nyb2xsTWFyZ2luUmlnaHQ6IHNjcm9sbE1hcmdpblJpZ2h0LCBzY3JvbGxNYXJnaW5Cb3R0b206IHNjcm9sbE1hcmdpbkJvdHRvbSwgc2Nyb2xsTWFyZ2luTGVmdDogc2Nyb2xsTWFyZ2luTGVmdCB9ID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcbiAgICBsZXQgYm9yZGVyQWRqdXN0ZWRYID0geCArIHBhcnNlSW50KGJvcmRlckxlZnRXaWR0aCwgMTApO1xuICAgIGxldCBib3JkZXJBZGp1c3RlZFkgPSB5ICsgcGFyc2VJbnQoYm9yZGVyVG9wV2lkdGgsIDEwKTtcbiAgICAvLyBJZ25vcmUgZW5kL2JvdHRvbSBib3JkZXIgdmlhIGNsaWVudEhlaWdodC9XaWR0aCBpbnN0ZWFkIG9mIG9mZnNldEhlaWdodC9XaWR0aFxuICAgIGxldCBtYXhYID0gYm9yZGVyQWRqdXN0ZWRYICsgc2Nyb2xsVmlldy5jbGllbnRXaWR0aDtcbiAgICBsZXQgbWF4WSA9IGJvcmRlckFkanVzdGVkWSArIHNjcm9sbFZpZXcuY2xpZW50SGVpZ2h0O1xuICAgIC8vIEdldCBzY3JvbGwgcGFkZGluZyAvIG1hcmdpbiB2YWx1ZXMgYXMgcGl4ZWxzIC0gZGVmYXVsdHMgdG8gMCBpZiBubyBzY3JvbGwgcGFkZGluZyAvIG1hcmdpblxuICAgIC8vIGlzIHVzZWQuXG4gICAgbGV0IHNjcm9sbFBhZGRpbmdUb3BOdW1iZXIgPSBwYXJzZUludChzY3JvbGxQYWRkaW5nVG9wLCAxMCkgfHwgMDtcbiAgICBsZXQgc2Nyb2xsUGFkZGluZ0JvdHRvbU51bWJlciA9IHBhcnNlSW50KHNjcm9sbFBhZGRpbmdCb3R0b20sIDEwKSB8fCAwO1xuICAgIGxldCBzY3JvbGxQYWRkaW5nUmlnaHROdW1iZXIgPSBwYXJzZUludChzY3JvbGxQYWRkaW5nUmlnaHQsIDEwKSB8fCAwO1xuICAgIGxldCBzY3JvbGxQYWRkaW5nTGVmdE51bWJlciA9IHBhcnNlSW50KHNjcm9sbFBhZGRpbmdMZWZ0LCAxMCkgfHwgMDtcbiAgICBsZXQgc2Nyb2xsTWFyZ2luVG9wTnVtYmVyID0gcGFyc2VJbnQoc2Nyb2xsTWFyZ2luVG9wLCAxMCkgfHwgMDtcbiAgICBsZXQgc2Nyb2xsTWFyZ2luQm90dG9tTnVtYmVyID0gcGFyc2VJbnQoc2Nyb2xsTWFyZ2luQm90dG9tLCAxMCkgfHwgMDtcbiAgICBsZXQgc2Nyb2xsTWFyZ2luUmlnaHROdW1iZXIgPSBwYXJzZUludChzY3JvbGxNYXJnaW5SaWdodCwgMTApIHx8IDA7XG4gICAgbGV0IHNjcm9sbE1hcmdpbkxlZnROdW1iZXIgPSBwYXJzZUludChzY3JvbGxNYXJnaW5MZWZ0LCAxMCkgfHwgMDtcbiAgICBsZXQgdGFyZ2V0TGVmdCA9IG9mZnNldFggLSBzY3JvbGxNYXJnaW5MZWZ0TnVtYmVyO1xuICAgIGxldCB0YXJnZXRSaWdodCA9IG9mZnNldFggKyB3aWR0aCArIHNjcm9sbE1hcmdpblJpZ2h0TnVtYmVyO1xuICAgIGxldCB0YXJnZXRUb3AgPSBvZmZzZXRZIC0gc2Nyb2xsTWFyZ2luVG9wTnVtYmVyO1xuICAgIGxldCB0YXJnZXRCb3R0b20gPSBvZmZzZXRZICsgaGVpZ2h0ICsgc2Nyb2xsTWFyZ2luQm90dG9tTnVtYmVyO1xuICAgIGxldCBzY3JvbGxQb3J0TGVmdCA9IHggKyBwYXJzZUludChib3JkZXJMZWZ0V2lkdGgsIDEwKSArIHNjcm9sbFBhZGRpbmdMZWZ0TnVtYmVyO1xuICAgIGxldCBzY3JvbGxQb3J0UmlnaHQgPSBtYXhYIC0gc2Nyb2xsUGFkZGluZ1JpZ2h0TnVtYmVyO1xuICAgIGxldCBzY3JvbGxQb3J0VG9wID0geSArIHBhcnNlSW50KGJvcmRlclRvcFdpZHRoLCAxMCkgKyBzY3JvbGxQYWRkaW5nVG9wTnVtYmVyO1xuICAgIGxldCBzY3JvbGxQb3J0Qm90dG9tID0gbWF4WSAtIHNjcm9sbFBhZGRpbmdCb3R0b21OdW1iZXI7XG4gICAgaWYgKHRhcmdldExlZnQgPiBzY3JvbGxQb3J0TGVmdCB8fCB0YXJnZXRSaWdodCA8IHNjcm9sbFBvcnRSaWdodCkge1xuICAgICAgICBpZiAodGFyZ2V0TGVmdCA8PSB4ICsgc2Nyb2xsUGFkZGluZ0xlZnROdW1iZXIpIHggPSB0YXJnZXRMZWZ0IC0gcGFyc2VJbnQoYm9yZGVyTGVmdFdpZHRoLCAxMCkgLSBzY3JvbGxQYWRkaW5nTGVmdE51bWJlcjtcbiAgICAgICAgZWxzZSBpZiAodGFyZ2V0UmlnaHQgPiBtYXhYIC0gc2Nyb2xsUGFkZGluZ1JpZ2h0TnVtYmVyKSB4ICs9IHRhcmdldFJpZ2h0IC0gbWF4WCArIHNjcm9sbFBhZGRpbmdSaWdodE51bWJlcjtcbiAgICB9XG4gICAgaWYgKHRhcmdldFRvcCA+IHNjcm9sbFBvcnRUb3AgfHwgdGFyZ2V0Qm90dG9tIDwgc2Nyb2xsUG9ydEJvdHRvbSkge1xuICAgICAgICBpZiAodGFyZ2V0VG9wIDw9IGJvcmRlckFkanVzdGVkWSArIHNjcm9sbFBhZGRpbmdUb3BOdW1iZXIpIHkgPSB0YXJnZXRUb3AgLSBwYXJzZUludChib3JkZXJUb3BXaWR0aCwgMTApIC0gc2Nyb2xsUGFkZGluZ1RvcE51bWJlcjtcbiAgICAgICAgZWxzZSBpZiAodGFyZ2V0Qm90dG9tID4gbWF4WSAtIHNjcm9sbFBhZGRpbmdCb3R0b21OdW1iZXIpIHkgKz0gdGFyZ2V0Qm90dG9tIC0gbWF4WSArIHNjcm9sbFBhZGRpbmdCb3R0b21OdW1iZXI7XG4gICAgfVxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Rlc3QnKSB7XG4gICAgICAgIHNjcm9sbFZpZXcuc2Nyb2xsTGVmdCA9IHg7XG4gICAgICAgIHNjcm9sbFZpZXcuc2Nyb2xsVG9wID0geTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzY3JvbGxWaWV3LnNjcm9sbFRvKHtcbiAgICAgICAgbGVmdDogeCxcbiAgICAgICAgdG9wOiB5XG4gICAgfSk7XG59XG4vKipcbiAqIENvbXB1dGVzIHRoZSBvZmZzZXQgbGVmdCBvciB0b3AgZnJvbSBjaGlsZCB0byBhbmNlc3RvciBieSBhY2N1bXVsYXRpbmdcbiAqIG9mZnNldExlZnQgb3Igb2Zmc2V0VG9wIHRocm91Z2ggaW50ZXJ2ZW5pbmcgb2Zmc2V0UGFyZW50cy5cbiAqLyBmdW5jdGlvbiAkMmYwNGNiYzQ0ZWUzMGNlMCR2YXIkcmVsYXRpdmVPZmZzZXQoYW5jZXN0b3IsIGNoaWxkLCBheGlzKSB7XG4gICAgY29uc3QgcHJvcCA9IGF4aXMgPT09ICdsZWZ0JyA/ICdvZmZzZXRMZWZ0JyA6ICdvZmZzZXRUb3AnO1xuICAgIGxldCBzdW0gPSAwO1xuICAgIHdoaWxlKGNoaWxkLm9mZnNldFBhcmVudCl7XG4gICAgICAgIHN1bSArPSBjaGlsZFtwcm9wXTtcbiAgICAgICAgaWYgKGNoaWxkLm9mZnNldFBhcmVudCA9PT0gYW5jZXN0b3IpIGJyZWFrO1xuICAgICAgICBlbHNlIGlmIChjaGlsZC5vZmZzZXRQYXJlbnQuY29udGFpbnMoYW5jZXN0b3IpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgYW5jZXN0b3IgaXMgbm90IGBwb3NpdGlvbjpyZWxhdGl2ZWAsIHRoZW4gd2Ugc3RvcCBhdFxuICAgICAgICAgICAgLy8gX2l0c18gb2Zmc2V0IHBhcmVudCwgYW5kIHdlIHN1YnRyYWN0IG9mZiBfaXRzXyBvZmZzZXQsIHNvIHRoYXRcbiAgICAgICAgICAgIC8vIHdlIGVuZCB1cCB3aXRoIHRoZSBwcm9wZXIgb2Zmc2V0IGZyb20gY2hpbGQgdG8gYW5jZXN0b3IuXG4gICAgICAgICAgICBzdW0gLT0gYW5jZXN0b3JbcHJvcF07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjaGlsZCA9IGNoaWxkLm9mZnNldFBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIHN1bTtcbn1cbmZ1bmN0aW9uICQyZjA0Y2JjNDRlZTMwY2UwJGV4cG9ydCRjODI2ODYwNzk2MzA5ZDFiKHRhcmdldEVsZW1lbnQsIG9wdHMpIHtcbiAgICBpZiAodGFyZ2V0RWxlbWVudCAmJiBkb2N1bWVudC5jb250YWlucyh0YXJnZXRFbGVtZW50KSkge1xuICAgICAgICBsZXQgcm9vdCA9IGRvY3VtZW50LnNjcm9sbGluZ0VsZW1lbnQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgICBsZXQgaXNTY3JvbGxQcmV2ZW50ZWQgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShyb290KS5vdmVyZmxvdyA9PT0gJ2hpZGRlbic7XG4gICAgICAgIC8vIElmIHNjcm9sbGluZyBpcyBub3QgY3VycmVudGx5IHByZXZlbnRlZCB0aGVuIHdlIGFyZW4ndCBpbiBhIG92ZXJsYXkgbm9yIGlzIGEgb3ZlcmxheSBvcGVuLCBqdXN0IHVzZSBlbGVtZW50LnNjcm9sbEludG9WaWV3IHRvIGJyaW5nIHRoZSBlbGVtZW50IGludG8gdmlld1xuICAgICAgICAvLyBBbHNvIGlnbm9yZSBpbiBjaHJvbWUgYmVjYXVzZSBvZiB0aGlzIGJ1ZzogaHR0cHM6Ly9pc3N1ZXMuY2hyb21pdW0ub3JnL2lzc3Vlcy80MDA3NDc0OVxuICAgICAgICBpZiAoIWlzU2Nyb2xsUHJldmVudGVkICYmICEoMCwgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JDY0NDZhMTg2ZDA5ZTM3OWUpKCkpIHtcbiAgICAgICAgICAgIHZhciAvLyB1c2Ugc2Nyb2xsSW50b1ZpZXcoe2Jsb2NrOiAnbmVhcmVzdCd9KSBpbnN0ZWFkIG9mIC5mb2N1cyB0byBjaGVjayBpZiB0aGUgZWxlbWVudCBpcyBmdWxseSBpbiB2aWV3IG9yIG5vdCBzaW5jZSAuZm9jdXMoKVxuICAgICAgICAgICAgLy8gd29uJ3QgY2F1c2UgYSBzY3JvbGwgaWYgdGhlIGVsZW1lbnQgaXMgYWxyZWFkeSBmb2N1c2VkIGFuZCBkb2Vzbid0IGJlaGF2ZSBjb25zaXN0ZW50bHkgd2hlbiBhbiBlbGVtZW50IGlzIHBhcnRpYWxseSBvdXQgb2YgdmlldyBob3Jpem9udGFsbHkgdnMgdmVydGljYWxseVxuICAgICAgICAgICAgX3RhcmdldEVsZW1lbnRfc2Nyb2xsSW50b1ZpZXc7XG4gICAgICAgICAgICBsZXQgeyBsZWZ0OiBvcmlnaW5hbExlZnQsIHRvcDogb3JpZ2luYWxUb3AgfSA9IHRhcmdldEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICB0YXJnZXRFbGVtZW50ID09PSBudWxsIHx8IHRhcmdldEVsZW1lbnQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IChfdGFyZ2V0RWxlbWVudF9zY3JvbGxJbnRvVmlldyA9IHRhcmdldEVsZW1lbnQuc2Nyb2xsSW50b1ZpZXcpID09PSBudWxsIHx8IF90YXJnZXRFbGVtZW50X3Njcm9sbEludG9WaWV3ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfdGFyZ2V0RWxlbWVudF9zY3JvbGxJbnRvVmlldy5jYWxsKHRhcmdldEVsZW1lbnQsIHtcbiAgICAgICAgICAgICAgICBibG9jazogJ25lYXJlc3QnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCB7IGxlZnQ6IG5ld0xlZnQsIHRvcDogbmV3VG9wIH0gPSB0YXJnZXRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgLy8gQWNjb3VudCBmb3Igc3ViIHBpeGVsIGRpZmZlcmVuY2VzIGZyb20gcm91bmRpbmdcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhvcmlnaW5hbExlZnQgLSBuZXdMZWZ0KSA+IDEgfHwgTWF0aC5hYnMob3JpZ2luYWxUb3AgLSBuZXdUb3ApID4gMSkge1xuICAgICAgICAgICAgICAgIHZhciBfb3B0c19jb250YWluaW5nRWxlbWVudF9zY3JvbGxJbnRvVmlldywgX29wdHNfY29udGFpbmluZ0VsZW1lbnQsIF90YXJnZXRFbGVtZW50X3Njcm9sbEludG9WaWV3MTtcbiAgICAgICAgICAgICAgICBvcHRzID09PSBudWxsIHx8IG9wdHMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IChfb3B0c19jb250YWluaW5nRWxlbWVudCA9IG9wdHMuY29udGFpbmluZ0VsZW1lbnQpID09PSBudWxsIHx8IF9vcHRzX2NvbnRhaW5pbmdFbGVtZW50ID09PSB2b2lkIDAgPyB2b2lkIDAgOiAoX29wdHNfY29udGFpbmluZ0VsZW1lbnRfc2Nyb2xsSW50b1ZpZXcgPSBfb3B0c19jb250YWluaW5nRWxlbWVudC5zY3JvbGxJbnRvVmlldykgPT09IG51bGwgfHwgX29wdHNfY29udGFpbmluZ0VsZW1lbnRfc2Nyb2xsSW50b1ZpZXcgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9vcHRzX2NvbnRhaW5pbmdFbGVtZW50X3Njcm9sbEludG9WaWV3LmNhbGwoX29wdHNfY29udGFpbmluZ0VsZW1lbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2s6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgICAgICBpbmxpbmU6ICdjZW50ZXInXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgKF90YXJnZXRFbGVtZW50X3Njcm9sbEludG9WaWV3MSA9IHRhcmdldEVsZW1lbnQuc2Nyb2xsSW50b1ZpZXcpID09PSBudWxsIHx8IF90YXJnZXRFbGVtZW50X3Njcm9sbEludG9WaWV3MSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX3RhcmdldEVsZW1lbnRfc2Nyb2xsSW50b1ZpZXcxLmNhbGwodGFyZ2V0RWxlbWVudCwge1xuICAgICAgICAgICAgICAgICAgICBibG9jazogJ25lYXJlc3QnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgc2Nyb2xsUGFyZW50cyA9ICgwLCAkYTQwYzY3M2RjOWY2ZDljNyRleHBvcnQkOTRlZDFjOTJjN2JlZWIyMikodGFyZ2V0RWxlbWVudCk7XG4gICAgICAgICAgICAvLyBJZiBzY3JvbGxpbmcgaXMgcHJldmVudGVkLCB3ZSBkb24ndCB3YW50IHRvIHNjcm9sbCB0aGUgYm9keSBzaW5jZSBpdCBtaWdodCBtb3ZlIHRoZSBvdmVybGF5IHBhcnRpYWxseSBvZmZzY3JlZW4gYW5kIHRoZSB1c2VyIGNhbid0IHNjcm9sbCBpdCBiYWNrIGludG8gdmlldy5cbiAgICAgICAgICAgIGZvciAobGV0IHNjcm9sbFBhcmVudCBvZiBzY3JvbGxQYXJlbnRzKSQyZjA0Y2JjNDRlZTMwY2UwJGV4cG9ydCQ1M2EwOTEwZjAzODMzN2JkKHNjcm9sbFBhcmVudCwgdGFyZ2V0RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuZXhwb3J0IHskMmYwNGNiYzQ0ZWUzMGNlMCRleHBvcnQkNTNhMDkxMGYwMzgzMzdiZCBhcyBzY3JvbGxJbnRvVmlldywgJDJmMDRjYmM0NGVlMzBjZTAkZXhwb3J0JGM4MjY4NjA3OTYzMDlkMWIgYXMgc2Nyb2xsSW50b1ZpZXdwb3J0fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNjcm9sbEludG9WaWV3Lm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7aXNBbmRyb2lkIGFzICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCRhMTFiMDA1OTkwMGNlZWM4fSBmcm9tIFwiLi9wbGF0Zm9ybS5tanNcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIyIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuZnVuY3Rpb24gJDZhN2RiODU0MzI0NDhmN2YkZXhwb3J0JDYwMjc4ODcxNDU3NjIyZGUoZXZlbnQpIHtcbiAgICAvLyBKQVdTL05WREEgd2l0aCBGaXJlZm94LlxuICAgIGlmIChldmVudC5wb2ludGVyVHlwZSA9PT0gJycgJiYgZXZlbnQuaXNUcnVzdGVkKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBBbmRyb2lkIFRhbGtCYWNrJ3MgZGV0YWlsIHZhbHVlIHZhcmllcyBkZXBlbmRpbmcgb24gdGhlIGV2ZW50IGxpc3RlbmVyIHByb3ZpZGluZyB0aGUgZXZlbnQgc28gd2UgaGF2ZSBzcGVjaWZpYyBsb2dpYyBoZXJlIGluc3RlYWRcbiAgICAvLyBJZiBwb2ludGVyVHlwZSBpcyBkZWZpbmVkLCBldmVudCBpcyBmcm9tIGEgY2xpY2sgbGlzdGVuZXIuIEZvciBldmVudHMgZnJvbSBtb3VzZWRvd24gbGlzdGVuZXIsIGRldGFpbCA9PT0gMCBpcyBhIHN1ZmZpY2llbnQgY2hlY2tcbiAgICAvLyB0byBkZXRlY3QgVGFsa0JhY2sgdmlydHVhbCBjbGlja3MuXG4gICAgaWYgKCgwLCAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkYTExYjAwNTk5MDBjZWVjOCkoKSAmJiBldmVudC5wb2ludGVyVHlwZSkgcmV0dXJuIGV2ZW50LnR5cGUgPT09ICdjbGljaycgJiYgZXZlbnQuYnV0dG9ucyA9PT0gMTtcbiAgICByZXR1cm4gZXZlbnQuZGV0YWlsID09PSAwICYmICFldmVudC5wb2ludGVyVHlwZTtcbn1cbmZ1bmN0aW9uICQ2YTdkYjg1NDMyNDQ4ZjdmJGV4cG9ydCQyOWJmMWI1ZjJjNTZjZjYzKGV2ZW50KSB7XG4gICAgLy8gSWYgdGhlIHBvaW50ZXIgc2l6ZSBpcyB6ZXJvLCB0aGVuIHdlIGFzc3VtZSBpdCdzIGZyb20gYSBzY3JlZW4gcmVhZGVyLlxuICAgIC8vIEFuZHJvaWQgVGFsa0JhY2sgZG91YmxlIHRhcCB3aWxsIHNvbWV0aW1lcyByZXR1cm4gYSBldmVudCB3aXRoIHdpZHRoIGFuZCBoZWlnaHQgb2YgMVxuICAgIC8vIGFuZCBwb2ludGVyVHlwZSA9PT0gJ21vdXNlJyBzbyB3ZSBuZWVkIHRvIGNoZWNrIGZvciBhIHNwZWNpZmljIGNvbWJpbmF0aW9uIG9mIGV2ZW50IGF0dHJpYnV0ZXMuXG4gICAgLy8gQ2Fubm90IHVzZSBcImV2ZW50LnByZXNzdXJlID09PSAwXCIgYXMgdGhlIHNvbGUgY2hlY2sgZHVlIHRvIFNhZmFyaSBwb2ludGVyIGV2ZW50cyBhbHdheXMgcmV0dXJuaW5nIHByZXNzdXJlID09PSAwXG4gICAgLy8gaW5zdGVhZCBvZiAuNSwgc2VlIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0yMDYyMTYuIGV2ZW50LnBvaW50ZXJUeXBlID09PSAnbW91c2UnIGlzIHRvIGRpc3Rpbmd1c2hcbiAgICAvLyBUYWxrYmFjayBkb3VibGUgdGFwIGZyb20gV2luZG93cyBGaXJlZm94IHRvdWNoIHNjcmVlbiBwcmVzc1xuICAgIHJldHVybiAhKDAsICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCRhMTFiMDA1OTkwMGNlZWM4KSgpICYmIGV2ZW50LndpZHRoID09PSAwICYmIGV2ZW50LmhlaWdodCA9PT0gMCB8fCBldmVudC53aWR0aCA9PT0gMSAmJiBldmVudC5oZWlnaHQgPT09IDEgJiYgZXZlbnQucHJlc3N1cmUgPT09IDAgJiYgZXZlbnQuZGV0YWlsID09PSAwICYmIGV2ZW50LnBvaW50ZXJUeXBlID09PSAnbW91c2UnO1xufVxuXG5cbmV4cG9ydCB7JDZhN2RiODU0MzI0NDhmN2YkZXhwb3J0JDYwMjc4ODcxNDU3NjIyZGUgYXMgaXNWaXJ0dWFsQ2xpY2ssICQ2YTdkYjg1NDMyNDQ4ZjdmJGV4cG9ydCQyOWJmMWI1ZjJjNTZjZjYzIGFzIGlzVmlydHVhbFBvaW50ZXJFdmVudH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pc1ZpcnR1YWxFdmVudC5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge3VzZVJlZiBhcyAkanRRNnokdXNlUmVmfSBmcm9tIFwicmVhY3RcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIzIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIC8qIGVzbGludC1kaXNhYmxlIHJ1bGVzZGlyL3B1cmUtcmVuZGVyICovIFxuZnVuY3Rpb24gJDVhMzg3Y2M0OTM1MGU2ZGIkZXhwb3J0JDcyMmRlYmMwZTU2ZmVhMzkodmFsdWUsIGlzRXF1YWwpIHtcbiAgICAvLyBVc2luZyBhIHJlZiBkdXJpbmcgcmVuZGVyIGlzIG9rIGhlcmUgYmVjYXVzZSBpdCdzIG9ubHkgYW4gb3B0aW1pemF0aW9uIOKAkyBib3RoIHZhbHVlcyBhcmUgZXF1aXZhbGVudC5cbiAgICAvLyBJZiBhIHJlbmRlciBpcyB0aHJvd24gYXdheSwgaXQnbGwgc3RpbGwgd29yayB0aGUgc2FtZSBubyBtYXR0ZXIgaWYgdGhlIG5leHQgcmVuZGVyIGlzIHRoZSBzYW1lIG9yIG5vdC5cbiAgICBsZXQgbGFzdFZhbHVlID0gKDAsICRqdFE2eiR1c2VSZWYpKG51bGwpO1xuICAgIGlmICh2YWx1ZSAmJiBsYXN0VmFsdWUuY3VycmVudCAmJiBpc0VxdWFsKHZhbHVlLCBsYXN0VmFsdWUuY3VycmVudCkpIHZhbHVlID0gbGFzdFZhbHVlLmN1cnJlbnQ7XG4gICAgbGFzdFZhbHVlLmN1cnJlbnQgPSB2YWx1ZTtcbiAgICByZXR1cm4gdmFsdWU7XG59XG5cblxuZXhwb3J0IHskNWEzODdjYzQ5MzUwZTZkYiRleHBvcnQkNzIyZGViYzBlNTZmZWEzOSBhcyB1c2VEZWVwTWVtb307XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VEZWVwTWVtby5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge3VzZUVmZmVjdEV2ZW50IGFzICQ4YWUwNWVhYTVjMTE0ZTljJGV4cG9ydCQ3ZjU0ZmMzMTgwNTA4YTUyfSBmcm9tIFwiLi91c2VFZmZlY3RFdmVudC5tanNcIjtcbmltcG9ydCB7dXNlRWZmZWN0IGFzICQ4ck0zRyR1c2VFZmZlY3R9IGZyb20gXCJyZWFjdFwiO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMjMgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gXG5cbmZ1bmN0aW9uICQ5OWZhY2FiNzMyNjZmNjYyJGV4cG9ydCQ1YWRkMWQwMDYyOTNkMTM2KHJlZiwgaW5pdGlhbFZhbHVlLCBvblJlc2V0KSB7XG4gICAgbGV0IGhhbmRsZVJlc2V0ID0gKDAsICQ4YWUwNWVhYTVjMTE0ZTljJGV4cG9ydCQ3ZjU0ZmMzMTgwNTA4YTUyKSgoKT0+e1xuICAgICAgICBpZiAob25SZXNldCkgb25SZXNldChpbml0aWFsVmFsdWUpO1xuICAgIH0pO1xuICAgICgwLCAkOHJNM0ckdXNlRWZmZWN0KSgoKT0+e1xuICAgICAgICB2YXIgX3JlZl9jdXJyZW50O1xuICAgICAgICBsZXQgZm9ybSA9IHJlZiA9PT0gbnVsbCB8fCByZWYgPT09IHZvaWQgMCA/IHZvaWQgMCA6IChfcmVmX2N1cnJlbnQgPSByZWYuY3VycmVudCkgPT09IG51bGwgfHwgX3JlZl9jdXJyZW50ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfcmVmX2N1cnJlbnQuZm9ybTtcbiAgICAgICAgZm9ybSA9PT0gbnVsbCB8fCBmb3JtID09PSB2b2lkIDAgPyB2b2lkIDAgOiBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2V0JywgaGFuZGxlUmVzZXQpO1xuICAgICAgICByZXR1cm4gKCk9PntcbiAgICAgICAgICAgIGZvcm0gPT09IG51bGwgfHwgZm9ybSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZm9ybS5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNldCcsIGhhbmRsZVJlc2V0KTtcbiAgICAgICAgfTtcbiAgICB9LCBbXG4gICAgICAgIHJlZixcbiAgICAgICAgaGFuZGxlUmVzZXRcbiAgICBdKTtcbn1cblxuXG5leHBvcnQgeyQ5OWZhY2FiNzMyNjZmNjYyJGV4cG9ydCQ1YWRkMWQwMDYyOTNkMTM2IGFzIHVzZUZvcm1SZXNldH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VGb3JtUmVzZXQubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHt1c2VFdmVudCBhcyAkZTlmYWFmYjY0MWUxNjdkYiRleHBvcnQkOTBmYzNhMTdkOTNmNzA0Y30gZnJvbSBcIi4vdXNlRXZlbnQubWpzXCI7XG5pbXBvcnQge3VzZUxheW91dEVmZmVjdCBhcyAkZjBhMDRjY2Q4ZGJkZDgzYiRleHBvcnQkZTVjNWE1ZjkxN2E1ODcxY30gZnJvbSBcIi4vdXNlTGF5b3V0RWZmZWN0Lm1qc1wiO1xuaW1wb3J0IHt1c2VSZWYgYXMgJGhEUmtVJHVzZVJlZiwgdXNlQ2FsbGJhY2sgYXMgJGhEUmtVJHVzZUNhbGxiYWNrfSBmcm9tIFwicmVhY3RcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDI0IEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuXG5cbmZ1bmN0aW9uICQyNmY3ZjNkYTczZmNkOWQ2JGV4cG9ydCQ3NzE3YzkyZWU5MTUzNzNlKHByb3BzLCByZWYpIHtcbiAgICBsZXQgeyBpc0xvYWRpbmc6IGlzTG9hZGluZywgb25Mb2FkTW9yZTogb25Mb2FkTW9yZSwgc2Nyb2xsT2Zmc2V0OiBzY3JvbGxPZmZzZXQgPSAxLCBpdGVtczogaXRlbXMgfSA9IHByb3BzO1xuICAgIC8vIEhhbmRsZSBzY3JvbGxpbmcsIGFuZCBjYWxsIG9uTG9hZE1vcmUgd2hlbiBuZWFyaW5nIHRoZSBib3R0b20uXG4gICAgbGV0IGlzTG9hZGluZ1JlZiA9ICgwLCAkaERSa1UkdXNlUmVmKShpc0xvYWRpbmcpO1xuICAgIGxldCBwcmV2UHJvcHMgPSAoMCwgJGhEUmtVJHVzZVJlZikocHJvcHMpO1xuICAgIGxldCBvblNjcm9sbCA9ICgwLCAkaERSa1UkdXNlQ2FsbGJhY2spKCgpPT57XG4gICAgICAgIGlmIChyZWYuY3VycmVudCAmJiAhaXNMb2FkaW5nUmVmLmN1cnJlbnQgJiYgb25Mb2FkTW9yZSkge1xuICAgICAgICAgICAgbGV0IHNob3VsZExvYWRNb3JlID0gcmVmLmN1cnJlbnQuc2Nyb2xsSGVpZ2h0IC0gcmVmLmN1cnJlbnQuc2Nyb2xsVG9wIC0gcmVmLmN1cnJlbnQuY2xpZW50SGVpZ2h0IDwgcmVmLmN1cnJlbnQuY2xpZW50SGVpZ2h0ICogc2Nyb2xsT2Zmc2V0O1xuICAgICAgICAgICAgaWYgKHNob3VsZExvYWRNb3JlKSB7XG4gICAgICAgICAgICAgICAgaXNMb2FkaW5nUmVmLmN1cnJlbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIG9uTG9hZE1vcmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIFtcbiAgICAgICAgb25Mb2FkTW9yZSxcbiAgICAgICAgcmVmLFxuICAgICAgICBzY3JvbGxPZmZzZXRcbiAgICBdKTtcbiAgICBsZXQgbGFzdEl0ZW1zID0gKDAsICRoRFJrVSR1c2VSZWYpKGl0ZW1zKTtcbiAgICAoMCwgJGYwYTA0Y2NkOGRiZGQ4M2IkZXhwb3J0JGU1YzVhNWY5MTdhNTg3MWMpKCgpPT57XG4gICAgICAgIC8vIE9ubHkgdXBkYXRlIGlzTG9hZGluZ1JlZiBpZiBwcm9wcyBvYmplY3QgYWN0dWFsbHkgY2hhbmdlZCxcbiAgICAgICAgLy8gbm90IGlmIGEgbG9jYWwgc3RhdGUgY2hhbmdlIG9jY3VycmVkLlxuICAgICAgICBpZiAocHJvcHMgIT09IHByZXZQcm9wcy5jdXJyZW50KSB7XG4gICAgICAgICAgICBpc0xvYWRpbmdSZWYuY3VycmVudCA9IGlzTG9hZGluZztcbiAgICAgICAgICAgIHByZXZQcm9wcy5jdXJyZW50ID0gcHJvcHM7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzogRXZlbnR1YWxseSB0aGlzIGhvb2sgd2lsbCBtb3ZlIGJhY2sgaW50byBSQUMgZHVyaW5nIHdoaWNoIHdlIHdpbGwgYWNjZXB0IHRoZSBjb2xsZWN0aW9uIGFzIGEgb3B0aW9uIHRvIHRoaXMgaG9vay5cbiAgICAgICAgLy8gV2Ugd2lsbCBvbmx5IGxvYWQgbW9yZSBpZiB0aGUgY29sbGVjdGlvbiBoYXMgY2hhbmdlZCBhZnRlciB0aGUgbGFzdCBsb2FkIHRvIHByZXZlbnQgbXVsdGlwbGUgb25Mb2FkTW9yZSBmcm9tIGJlaW5nIGNhbGxlZFxuICAgICAgICAvLyB3aGlsZSB0aGUgZGF0YSBmcm9tIHRoZSBsYXN0IG9uTG9hZE1vcmUgaXMgYmVpbmcgcHJvY2Vzc2VkIGJ5IFJBQyBjb2xsZWN0aW9uLlxuICAgICAgICBsZXQgc2hvdWxkTG9hZE1vcmUgPSAocmVmID09PSBudWxsIHx8IHJlZiA9PT0gdm9pZCAwID8gdm9pZCAwIDogcmVmLmN1cnJlbnQpICYmICFpc0xvYWRpbmdSZWYuY3VycmVudCAmJiBvbkxvYWRNb3JlICYmICghaXRlbXMgfHwgaXRlbXMgIT09IGxhc3RJdGVtcy5jdXJyZW50KSAmJiByZWYuY3VycmVudC5jbGllbnRIZWlnaHQgPT09IHJlZi5jdXJyZW50LnNjcm9sbEhlaWdodDtcbiAgICAgICAgaWYgKHNob3VsZExvYWRNb3JlKSB7XG4gICAgICAgICAgICBpc0xvYWRpbmdSZWYuY3VycmVudCA9IHRydWU7XG4gICAgICAgICAgICBvbkxvYWRNb3JlID09PSBudWxsIHx8IG9uTG9hZE1vcmUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9uTG9hZE1vcmUoKTtcbiAgICAgICAgfVxuICAgICAgICBsYXN0SXRlbXMuY3VycmVudCA9IGl0ZW1zO1xuICAgIH0sIFtcbiAgICAgICAgaXNMb2FkaW5nLFxuICAgICAgICBvbkxvYWRNb3JlLFxuICAgICAgICBwcm9wcyxcbiAgICAgICAgcmVmLFxuICAgICAgICBpdGVtc1xuICAgIF0pO1xuICAgIC8vIFRPRE86IG1heWJlIHRoaXMgc2hvdWxkIHN0aWxsIGp1c3QgcmV0dXJuIHNjcm9sbCBwcm9wcz9cbiAgICAvLyBUZXN0IGFnYWluc3QgY2FzZSB3aGVyZSB0aGUgcmVmIGlzbid0IGRlZmluZWQgd2hlbiB0aGlzIGlzIGNhbGxlZFxuICAgIC8vIFRoaW5rIHRoaXMgd2FzIGEgcHJvYmxlbSB3aGVuIHRyeWluZyB0byBhdHRhY2ggdG8gdGhlIHNjcm9sbGFibGUgYm9keSBvZiB0aGUgdGFibGUgaW4gT25Mb2FkTW9yZVRhYmxlQm9keVNjcm9sbFxuICAgICgwLCAkZTlmYWFmYjY0MWUxNjdkYiRleHBvcnQkOTBmYzNhMTdkOTNmNzA0YykocmVmLCAnc2Nyb2xsJywgb25TY3JvbGwpO1xufVxuXG5cbmV4cG9ydCB7JDI2ZjdmM2RhNzNmY2Q5ZDYkZXhwb3J0JDc3MTdjOTJlZTkxNTM3M2UgYXMgdXNlTG9hZE1vcmV9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXNlTG9hZE1vcmUubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHtnZXRTY3JvbGxQYXJlbnQgYXMgJDYyZDhkZWQ5Mjk2ZjM4NzIkZXhwb3J0JGNmYTIyMjVlODc5Mzg3ODF9IGZyb20gXCIuL2dldFNjcm9sbFBhcmVudC5tanNcIjtcbmltcG9ydCB7dXNlRWZmZWN0RXZlbnQgYXMgJDhhZTA1ZWFhNWMxMTRlOWMkZXhwb3J0JDdmNTRmYzMxODA1MDhhNTJ9IGZyb20gXCIuL3VzZUVmZmVjdEV2ZW50Lm1qc1wiO1xuaW1wb3J0IHt1c2VMYXlvdXRFZmZlY3QgYXMgJGYwYTA0Y2NkOGRiZGQ4M2IkZXhwb3J0JGU1YzVhNWY5MTdhNTg3MWN9IGZyb20gXCIuL3VzZUxheW91dEVmZmVjdC5tanNcIjtcbmltcG9ydCB7dXNlUmVmIGFzICQ3Rm9abCR1c2VSZWZ9IGZyb20gXCJyZWFjdFwiO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMjQgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gXG5cblxuXG5mdW5jdGlvbiAkYTVmYTk3M2MxODUwZGQzNiRleHBvcnQkY2NhZWE5NmMyOGU4YjllNyhwcm9wcywgcmVmKSB7XG4gICAgbGV0IHsgY29sbGVjdGlvbjogY29sbGVjdGlvbiwgb25Mb2FkTW9yZTogb25Mb2FkTW9yZSwgc2Nyb2xsT2Zmc2V0OiBzY3JvbGxPZmZzZXQgPSAxIH0gPSBwcm9wcztcbiAgICBsZXQgc2VudGluZWxPYnNlcnZlciA9ICgwLCAkN0ZvWmwkdXNlUmVmKShudWxsKTtcbiAgICBsZXQgdHJpZ2dlckxvYWRNb3JlID0gKDAsICQ4YWUwNWVhYTVjMTE0ZTljJGV4cG9ydCQ3ZjU0ZmMzMTgwNTA4YTUyKSgoZW50cmllcyk9PntcbiAgICAgICAgLy8gVXNlIFwiaXNJbnRlcnNlY3RpbmdcIiBvdmVyIGFuIGVxdWFsaXR5IGNoZWNrIG9mIDAgc2luY2UgaXQgc2VlbXMgbGlrZSB0aGVyZSBpcyBjYXNlcyB3aGVyZVxuICAgICAgICAvLyBhIGludGVyc2VjdGlvbiByYXRpbyBvZiAwIGNhbiBiZSByZXBvcnRlZCB3aGVuIGlzSW50ZXJzZWN0aW5nIGlzIGFjdHVhbGx5IHRydWVcbiAgICAgICAgZm9yIChsZXQgZW50cnkgb2YgZW50cmllcykvLyBOb3RlIHRoYXQgdGhpcyB3aWxsIGJlIGNhbGxlZCBpZiB0aGUgY29sbGVjdGlvbiBjaGFuZ2VzLCBldmVuIGlmIG9uTG9hZE1vcmUgd2FzIGFscmVhZHkgY2FsbGVkIGFuZCBpcyBiZWluZyBwcm9jZXNzZWQuXG4gICAgICAgIC8vIFVwIHRvIHVzZXIgZGlzY3JldGlvbiBhcyB0byBob3cgdG8gaGFuZGxlIHRoZXNlIG11bHRpcGxlIG9uTG9hZE1vcmUgY2FsbHNcbiAgICAgICAgaWYgKGVudHJ5LmlzSW50ZXJzZWN0aW5nICYmIG9uTG9hZE1vcmUpIG9uTG9hZE1vcmUoKTtcbiAgICB9KTtcbiAgICAoMCwgJGYwYTA0Y2NkOGRiZGQ4M2IkZXhwb3J0JGU1YzVhNWY5MTdhNTg3MWMpKCgpPT57XG4gICAgICAgIGlmIChyZWYuY3VycmVudCkge1xuICAgICAgICAgICAgLy8gVGVhciBkb3duIGFuZCBzZXQgdXAgYSBuZXcgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgd2hlbiB0aGUgY29sbGVjdGlvbiBjaGFuZ2VzIHNvIHRoYXQgd2UgY2FuIHByb3Blcmx5IHRyaWdnZXIgYWRkaXRpb25hbCBsb2FkTW9yZXMgaWYgdGhlcmUgaXMgcm9vbSBmb3IgbW9yZSBpdGVtc1xuICAgICAgICAgICAgLy8gTmVlZCB0byBkbyB0aGlzIHRlYXIgZG93biBhbmQgc2V0IHVwIHNpbmNlIHVzaW5nIGEgbGFyZ2Ugcm9vdE1hcmdpbiB3aWxsIG1lYW4gdGhlIG9ic2VydmVyJ3MgY2FsbGJhY2sgaXNuJ3QgY2FsbGVkIGV2ZW4gd2hlbiBzY3JvbGxpbmcgdGhlIGl0ZW0gaW50byB2aWV3IGJlYXVzZSBpdHMgdmlzaWJpbGl0eSBoYXNuJ3QgYWN0dWFsbHkgY2hhbmdlZFxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9jb2Rlc2FuZGJveC5pby9wL3NhbmRib3gvbWFnaWNhbC1zd2Fuc29uLWRoZ3A4OT9maWxlPSUyRnNyYyUyRkFwcC5qcyUzQTIxJTJDMjFcbiAgICAgICAgICAgIHNlbnRpbmVsT2JzZXJ2ZXIuY3VycmVudCA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcih0cmlnZ2VyTG9hZE1vcmUsIHtcbiAgICAgICAgICAgICAgICByb290OiAoMCwgJDYyZDhkZWQ5Mjk2ZjM4NzIkZXhwb3J0JGNmYTIyMjVlODc5Mzg3ODEpKHJlZiA9PT0gbnVsbCB8fCByZWYgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHJlZi5jdXJyZW50KSxcbiAgICAgICAgICAgICAgICByb290TWFyZ2luOiBgMHB4ICR7MTAwICogc2Nyb2xsT2Zmc2V0fSUgJHsxMDAgKiBzY3JvbGxPZmZzZXR9JSAkezEwMCAqIHNjcm9sbE9mZnNldH0lYFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZW50aW5lbE9ic2VydmVyLmN1cnJlbnQub2JzZXJ2ZShyZWYuY3VycmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICgpPT57XG4gICAgICAgICAgICBpZiAoc2VudGluZWxPYnNlcnZlci5jdXJyZW50KSBzZW50aW5lbE9ic2VydmVyLmN1cnJlbnQuZGlzY29ubmVjdCgpO1xuICAgICAgICB9O1xuICAgIH0sIFtcbiAgICAgICAgY29sbGVjdGlvbixcbiAgICAgICAgdHJpZ2dlckxvYWRNb3JlLFxuICAgICAgICByZWYsXG4gICAgICAgIHNjcm9sbE9mZnNldFxuICAgIF0pO1xufVxuXG5cbmV4cG9ydCB7JGE1ZmE5NzNjMTg1MGRkMzYkZXhwb3J0JGNjYWVhOTZjMjhlOGI5ZTcgYXMgdXNlTG9hZE1vcmVTZW50aW5lbH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD11c2VMb2FkTW9yZVNlbnRpbmVsLm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydCB7dmVyc2lvbiBhcyAkaXVsdkUkdmVyc2lvbn0gZnJvbSBcInJlYWN0XCI7XG5cblxuZnVuY3Rpb24gJGNkYzVhNjc3OGI3NjZkYjIkZXhwb3J0JGE5ZDA0YzU2ODQxMjMzNjkodmFsdWUpIHtcbiAgICBjb25zdCBwaWVjZXMgPSAoMCwgJGl1bHZFJHZlcnNpb24pLnNwbGl0KCcuJyk7XG4gICAgY29uc3QgbWFqb3IgPSBwYXJzZUludChwaWVjZXNbMF0sIDEwKTtcbiAgICBpZiAobWFqb3IgPj0gMTkpIHJldHVybiB2YWx1ZTtcbiAgICAvLyBjb21wYXRpYmlsaXR5IHdpdGggUmVhY3QgPCAxOVxuICAgIHJldHVybiB2YWx1ZSA/ICd0cnVlJyA6IHVuZGVmaW5lZDtcbn1cblxuXG5leHBvcnQgeyRjZGM1YTY3NzhiNzY2ZGIyJGV4cG9ydCRhOWQwNGM1Njg0MTIzMzY5IGFzIGluZXJ0VmFsdWV9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5lcnRWYWx1ZS5tb2R1bGUuanMubWFwXG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMjQgQWRvYmUuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBUaGlzIGZpbGUgaXMgbGljZW5zZWQgdG8geW91IHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weVxuICogb2YgdGhlIExpY2Vuc2UgYXQgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZCB1bmRlclxuICogdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgUkVQUkVTRU5UQVRJT05TXG4gKiBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2VcbiAqIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi8gLy8gQ3VzdG9tIGV2ZW50IG5hbWVzIGZvciB1cGRhdGluZyB0aGUgYXV0b2NvbXBsZXRlJ3MgYXJpYS1hY3RpdmVkZWNlbmRhbnQuXG5jb25zdCAkNTY3MWIyMGNmOWI1NjJiMiRleHBvcnQkNDQ3YTM4OTk1ZGUyYzcxMSA9ICdyZWFjdC1hcmlhLWNsZWFyLWZvY3VzJztcbmNvbnN0ICQ1NjcxYjIwY2Y5YjU2MmIyJGV4cG9ydCQ4MzFjODIwYWQ2MGY5ZDEyID0gJ3JlYWN0LWFyaWEtZm9jdXMnO1xuXG5cbmV4cG9ydCB7JDU2NzFiMjBjZjliNTYyYjIkZXhwb3J0JDQ0N2EzODk5NWRlMmM3MTEgYXMgQ0xFQVJfRk9DVVNfRVZFTlQsICQ1NjcxYjIwY2Y5YjU2MmIyJGV4cG9ydCQ4MzFjODIwYWQ2MGY5ZDEyIGFzIEZPQ1VTX0VWRU5UfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbnN0YW50cy5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge3VzZUxheW91dEVmZmVjdCBhcyAkZjBhMDRjY2Q4ZGJkZDgzYiRleHBvcnQkZTVjNWE1ZjkxN2E1ODcxY30gZnJvbSBcIi4vdXNlTGF5b3V0RWZmZWN0Lm1qc1wiO1xuaW1wb3J0IHtmbHVzaFN5bmMgYXMgJGpKTUFlJGZsdXNoU3luY30gZnJvbSBcInJlYWN0LWRvbVwiO1xuaW1wb3J0IHt1c2VTdGF0ZSBhcyAkakpNQWUkdXNlU3RhdGUsIHVzZUNhbGxiYWNrIGFzICRqSk1BZSR1c2VDYWxsYmFja30gZnJvbSBcInJlYWN0XCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcblxuXG5mdW5jdGlvbiAkZDNmMDQ5MjQyNDMxMjE5YyRleHBvcnQkNmQzNDQzZjJjNDhiZmMyMChyZWYsIGlzUmVhZHkgPSB0cnVlKSB7XG4gICAgbGV0IFtpc0VudGVyaW5nLCBzZXRFbnRlcmluZ10gPSAoMCwgJGpKTUFlJHVzZVN0YXRlKSh0cnVlKTtcbiAgICBsZXQgaXNBbmltYXRpb25SZWFkeSA9IGlzRW50ZXJpbmcgJiYgaXNSZWFkeTtcbiAgICAvLyBUaGVyZSBhcmUgdHdvIGNhc2VzIGZvciBlbnRyeSBhbmltYXRpb25zOlxuICAgIC8vIDEuIENTUyBAa2V5ZnJhbWVzLiBUaGUgYGFuaW1hdGlvbmAgcHJvcGVydHkgaXMgc2V0IGR1cmluZyB0aGUgaXNFbnRlcmluZyBzdGF0ZSwgYW5kIGl0IGlzIHJlbW92ZWQgYWZ0ZXIgdGhlIGFuaW1hdGlvbiBmaW5pc2hlcy5cbiAgICAvLyAyLiBDU1MgdHJhbnNpdGlvbnMuIFRoZSBpbml0aWFsIHN0eWxlcyBhcmUgYXBwbGllZCBkdXJpbmcgdGhlIGlzRW50ZXJpbmcgc3RhdGUsIGFuZCByZW1vdmVkIGltbWVkaWF0ZWx5LCBjYXVzaW5nIHRoZSB0cmFuc2l0aW9uIHRvIG9jY3VyLlxuICAgIC8vXG4gICAgLy8gSW4gdGhlIHNlY29uZCBjYXNlLCBjYW5jZWwgYW55IHRyYW5zaXRpb25zIHRoYXQgd2VyZSB0cmlnZ2VyZWQgcHJpb3IgdG8gdGhlIGlzRW50ZXJpbmcgPSBmYWxzZSBzdGF0ZSAod2hlbiB0aGUgdHJhbnNpdGlvbiBpcyBzdXBwb3NlZCB0byBzdGFydCkuXG4gICAgLy8gVGhpcyBjYW4gaGFwcGVuIHdoZW4gaXNSZWFkeSBzdGFydHMgYXMgZmFsc2UgKGUuZy4gcG9wb3ZlcnMgcHJpb3IgdG8gcGxhY2VtZW50IGNhbGN1bGF0aW9uKS5cbiAgICAoMCwgJGYwYTA0Y2NkOGRiZGQ4M2IkZXhwb3J0JGU1YzVhNWY5MTdhNTg3MWMpKCgpPT57XG4gICAgICAgIGlmIChpc0FuaW1hdGlvblJlYWR5ICYmIHJlZi5jdXJyZW50ICYmICdnZXRBbmltYXRpb25zJyBpbiByZWYuY3VycmVudCkge1xuICAgICAgICAgICAgZm9yIChsZXQgYW5pbWF0aW9uIG9mIHJlZi5jdXJyZW50LmdldEFuaW1hdGlvbnMoKSlpZiAoYW5pbWF0aW9uIGluc3RhbmNlb2YgQ1NTVHJhbnNpdGlvbikgYW5pbWF0aW9uLmNhbmNlbCgpO1xuICAgICAgICB9XG4gICAgfSwgW1xuICAgICAgICByZWYsXG4gICAgICAgIGlzQW5pbWF0aW9uUmVhZHlcbiAgICBdKTtcbiAgICAkZDNmMDQ5MjQyNDMxMjE5YyR2YXIkdXNlQW5pbWF0aW9uKHJlZiwgaXNBbmltYXRpb25SZWFkeSwgKDAsICRqSk1BZSR1c2VDYWxsYmFjaykoKCk9PnNldEVudGVyaW5nKGZhbHNlKSwgW10pKTtcbiAgICByZXR1cm4gaXNBbmltYXRpb25SZWFkeTtcbn1cbmZ1bmN0aW9uICRkM2YwNDkyNDI0MzEyMTljJGV4cG9ydCQ0NWZkYTdjNDdmOTNmZDQ4KHJlZiwgaXNPcGVuKSB7XG4gICAgbGV0IFtleGl0U3RhdGUsIHNldEV4aXRTdGF0ZV0gPSAoMCwgJGpKTUFlJHVzZVN0YXRlKShpc09wZW4gPyAnb3BlbicgOiAnY2xvc2VkJyk7XG4gICAgc3dpdGNoKGV4aXRTdGF0ZSl7XG4gICAgICAgIGNhc2UgJ29wZW4nOlxuICAgICAgICAgICAgLy8gSWYgaXNPcGVuIGJlY29tZXMgZmFsc2UsIHNldCB0aGUgc3RhdGUgdG8gZXhpdGluZy5cbiAgICAgICAgICAgIGlmICghaXNPcGVuKSBzZXRFeGl0U3RhdGUoJ2V4aXRpbmcnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjbG9zZWQnOlxuICAgICAgICBjYXNlICdleGl0aW5nJzpcbiAgICAgICAgICAgIC8vIElmIHdlIGFyZSBleGl0aW5nIGFuZCBpc09wZW4gYmVjb21lcyB0cnVlLCB0aGUgYW5pbWF0aW9uIHdhcyBpbnRlcnJ1cHRlZC5cbiAgICAgICAgICAgIC8vIFJlc2V0IHRoZSBzdGF0ZSB0byBvcGVuLlxuICAgICAgICAgICAgaWYgKGlzT3Blbikgc2V0RXhpdFN0YXRlKCdvcGVuJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgbGV0IGlzRXhpdGluZyA9IGV4aXRTdGF0ZSA9PT0gJ2V4aXRpbmcnO1xuICAgICRkM2YwNDkyNDI0MzEyMTljJHZhciR1c2VBbmltYXRpb24ocmVmLCBpc0V4aXRpbmcsICgwLCAkakpNQWUkdXNlQ2FsbGJhY2spKCgpPT57XG4gICAgICAgIC8vIFNldCB0aGUgc3RhdGUgdG8gY2xvc2VkLCB3aGljaCB3aWxsIGNhdXNlIHRoZSBlbGVtZW50IHRvIGJlIHVubW91bnRlZC5cbiAgICAgICAgc2V0RXhpdFN0YXRlKChzdGF0ZSk9PnN0YXRlID09PSAnZXhpdGluZycgPyAnY2xvc2VkJyA6IHN0YXRlKTtcbiAgICB9LCBbXSkpO1xuICAgIHJldHVybiBpc0V4aXRpbmc7XG59XG5mdW5jdGlvbiAkZDNmMDQ5MjQyNDMxMjE5YyR2YXIkdXNlQW5pbWF0aW9uKHJlZiwgaXNBY3RpdmUsIG9uRW5kKSB7XG4gICAgKDAsICRmMGEwNGNjZDhkYmRkODNiJGV4cG9ydCRlNWM1YTVmOTE3YTU4NzFjKSgoKT0+e1xuICAgICAgICBpZiAoaXNBY3RpdmUgJiYgcmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIGlmICghKCdnZXRBbmltYXRpb25zJyBpbiByZWYuY3VycmVudCkpIHtcbiAgICAgICAgICAgICAgICAvLyBKU0RPTVxuICAgICAgICAgICAgICAgIG9uRW5kKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGFuaW1hdGlvbnMgPSByZWYuY3VycmVudC5nZXRBbmltYXRpb25zKCk7XG4gICAgICAgICAgICBpZiAoYW5pbWF0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBvbkVuZCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBjYW5jZWxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgUHJvbWlzZS5hbGwoYW5pbWF0aW9ucy5tYXAoKGEpPT5hLmZpbmlzaGVkKSkudGhlbigoKT0+e1xuICAgICAgICAgICAgICAgIGlmICghY2FuY2VsZWQpICgwLCAkakpNQWUkZmx1c2hTeW5jKSgoKT0+e1xuICAgICAgICAgICAgICAgICAgICBvbkVuZCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKCk9Pnt9KTtcbiAgICAgICAgICAgIHJldHVybiAoKT0+e1xuICAgICAgICAgICAgICAgIGNhbmNlbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9LCBbXG4gICAgICAgIHJlZixcbiAgICAgICAgaXNBY3RpdmUsXG4gICAgICAgIG9uRW5kXG4gICAgXSk7XG59XG5cblxuZXhwb3J0IHskZDNmMDQ5MjQyNDMxMjE5YyRleHBvcnQkNmQzNDQzZjJjNDhiZmMyMCBhcyB1c2VFbnRlckFuaW1hdGlvbiwgJGQzZjA0OTI0MjQzMTIxOWMkZXhwb3J0JDQ1ZmRhN2M0N2Y5M2ZkNDggYXMgdXNlRXhpdEFuaW1hdGlvbn07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hbmltYXRpb24ubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0IHtnZXRPd25lcldpbmRvdyBhcyAkNDMxZmJkODZjYTdkYzIxNiRleHBvcnQkZjIxYTFmZmFlMjYwMTQ1YX0gZnJvbSBcIi4vZG9tSGVscGVycy5tanNcIjtcblxuLypcbiAqIENvcHlyaWdodCAyMDIxIEFkb2JlLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogVGhpcyBmaWxlIGlzIGxpY2Vuc2VkIHRvIHlvdSB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHlcbiAqIG9mIHRoZSBMaWNlbnNlIGF0IGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmUgZGlzdHJpYnV0ZWQgdW5kZXJcbiAqIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SIFJFUFJFU0VOVEFUSU9OU1xuICogT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlXG4gKiBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovIFxuY29uc3QgJDdkMjQxNmVhMDk1OWRhYWEkdmFyJHN1cHBvcnRzQ2hlY2tWaXNpYmlsaXR5ID0gdHlwZW9mIEVsZW1lbnQgIT09ICd1bmRlZmluZWQnICYmICdjaGVja1Zpc2liaWxpdHknIGluIEVsZW1lbnQucHJvdG90eXBlO1xuZnVuY3Rpb24gJDdkMjQxNmVhMDk1OWRhYWEkdmFyJGlzU3R5bGVWaXNpYmxlKGVsZW1lbnQpIHtcbiAgICBjb25zdCB3aW5kb3dPYmplY3QgPSAoMCwgJDQzMWZiZDg2Y2E3ZGMyMTYkZXhwb3J0JGYyMWExZmZhZTI2MDE0NWEpKGVsZW1lbnQpO1xuICAgIGlmICghKGVsZW1lbnQgaW5zdGFuY2VvZiB3aW5kb3dPYmplY3QuSFRNTEVsZW1lbnQpICYmICEoZWxlbWVudCBpbnN0YW5jZW9mIHdpbmRvd09iamVjdC5TVkdFbGVtZW50KSkgcmV0dXJuIGZhbHNlO1xuICAgIGxldCB7IGRpc3BsYXk6IGRpc3BsYXksIHZpc2liaWxpdHk6IHZpc2liaWxpdHkgfSA9IGVsZW1lbnQuc3R5bGU7XG4gICAgbGV0IGlzVmlzaWJsZSA9IGRpc3BsYXkgIT09ICdub25lJyAmJiB2aXNpYmlsaXR5ICE9PSAnaGlkZGVuJyAmJiB2aXNpYmlsaXR5ICE9PSAnY29sbGFwc2UnO1xuICAgIGlmIChpc1Zpc2libGUpIHtcbiAgICAgICAgY29uc3QgeyBnZXRDb21wdXRlZFN0eWxlOiBnZXRDb21wdXRlZFN0eWxlIH0gPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXc7XG4gICAgICAgIGxldCB7IGRpc3BsYXk6IGNvbXB1dGVkRGlzcGxheSwgdmlzaWJpbGl0eTogY29tcHV0ZWRWaXNpYmlsaXR5IH0gPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpO1xuICAgICAgICBpc1Zpc2libGUgPSBjb21wdXRlZERpc3BsYXkgIT09ICdub25lJyAmJiBjb21wdXRlZFZpc2liaWxpdHkgIT09ICdoaWRkZW4nICYmIGNvbXB1dGVkVmlzaWJpbGl0eSAhPT0gJ2NvbGxhcHNlJztcbiAgICB9XG4gICAgcmV0dXJuIGlzVmlzaWJsZTtcbn1cbmZ1bmN0aW9uICQ3ZDI0MTZlYTA5NTlkYWFhJHZhciRpc0F0dHJpYnV0ZVZpc2libGUoZWxlbWVudCwgY2hpbGRFbGVtZW50KSB7XG4gICAgcmV0dXJuICFlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnaGlkZGVuJykgJiYgLy8gSWdub3JlIEhpZGRlblNlbGVjdCB3aGVuIHRyZWUgd2Fsa2luZy5cbiAgICAhZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2RhdGEtcmVhY3QtYXJpYS1wcmV2ZW50LWZvY3VzJykgJiYgKGVsZW1lbnQubm9kZU5hbWUgPT09ICdERVRBSUxTJyAmJiBjaGlsZEVsZW1lbnQgJiYgY2hpbGRFbGVtZW50Lm5vZGVOYW1lICE9PSAnU1VNTUFSWScgPyBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnb3BlbicpIDogdHJ1ZSk7XG59XG5mdW5jdGlvbiAkN2QyNDE2ZWEwOTU5ZGFhYSRleHBvcnQkZTk4OWMwZmZmYWE2YjI3YShlbGVtZW50LCBjaGlsZEVsZW1lbnQpIHtcbiAgICBpZiAoJDdkMjQxNmVhMDk1OWRhYWEkdmFyJHN1cHBvcnRzQ2hlY2tWaXNpYmlsaXR5KSByZXR1cm4gZWxlbWVudC5jaGVja1Zpc2liaWxpdHkoe1xuICAgICAgICB2aXNpYmlsaXR5UHJvcGVydHk6IHRydWVcbiAgICB9KSAmJiAhZWxlbWVudC5jbG9zZXN0KCdbZGF0YS1yZWFjdC1hcmlhLXByZXZlbnQtZm9jdXNdJyk7XG4gICAgcmV0dXJuIGVsZW1lbnQubm9kZU5hbWUgIT09ICcjY29tbWVudCcgJiYgJDdkMjQxNmVhMDk1OWRhYWEkdmFyJGlzU3R5bGVWaXNpYmxlKGVsZW1lbnQpICYmICQ3ZDI0MTZlYTA5NTlkYWFhJHZhciRpc0F0dHJpYnV0ZVZpc2libGUoZWxlbWVudCwgY2hpbGRFbGVtZW50KSAmJiAoIWVsZW1lbnQucGFyZW50RWxlbWVudCB8fCAkN2QyNDE2ZWEwOTU5ZGFhYSRleHBvcnQkZTk4OWMwZmZmYWE2YjI3YShlbGVtZW50LnBhcmVudEVsZW1lbnQsIGVsZW1lbnQpKTtcbn1cblxuXG5leHBvcnQgeyQ3ZDI0MTZlYTA5NTlkYWFhJGV4cG9ydCRlOTg5YzBmZmZhYTZiMjdhIGFzIGlzRWxlbWVudFZpc2libGV9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXNFbGVtZW50VmlzaWJsZS5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge2lzRWxlbWVudFZpc2libGUgYXMgJDdkMjQxNmVhMDk1OWRhYWEkZXhwb3J0JGU5ODljMGZmZmFhNmIyN2F9IGZyb20gXCIuL2lzRWxlbWVudFZpc2libGUubWpzXCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyNSBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcbmNvbnN0ICRiNGI3MTdiYWJmYmI5MDdiJHZhciRmb2N1c2FibGVFbGVtZW50cyA9IFtcbiAgICAnaW5wdXQ6bm90KFtkaXNhYmxlZF0pOm5vdChbdHlwZT1oaWRkZW5dKScsXG4gICAgJ3NlbGVjdDpub3QoW2Rpc2FibGVkXSknLFxuICAgICd0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSknLFxuICAgICdidXR0b246bm90KFtkaXNhYmxlZF0pJyxcbiAgICAnYVtocmVmXScsXG4gICAgJ2FyZWFbaHJlZl0nLFxuICAgICdzdW1tYXJ5JyxcbiAgICAnaWZyYW1lJyxcbiAgICAnb2JqZWN0JyxcbiAgICAnZW1iZWQnLFxuICAgICdhdWRpb1tjb250cm9sc10nLFxuICAgICd2aWRlb1tjb250cm9sc10nLFxuICAgICdbY29udGVudGVkaXRhYmxlXTpub3QoW2NvbnRlbnRlZGl0YWJsZV49XCJmYWxzZVwiXSknLFxuICAgICdwZXJtaXNzaW9uJ1xuXTtcbmNvbnN0ICRiNGI3MTdiYWJmYmI5MDdiJHZhciRGT0NVU0FCTEVfRUxFTUVOVF9TRUxFQ1RPUiA9ICRiNGI3MTdiYWJmYmI5MDdiJHZhciRmb2N1c2FibGVFbGVtZW50cy5qb2luKCc6bm90KFtoaWRkZW5dKSwnKSArICcsW3RhYmluZGV4XTpub3QoW2Rpc2FibGVkXSk6bm90KFtoaWRkZW5dKSc7XG4kYjRiNzE3YmFiZmJiOTA3YiR2YXIkZm9jdXNhYmxlRWxlbWVudHMucHVzaCgnW3RhYmluZGV4XTpub3QoW3RhYmluZGV4PVwiLTFcIl0pOm5vdChbZGlzYWJsZWRdKScpO1xuY29uc3QgJGI0YjcxN2JhYmZiYjkwN2IkdmFyJFRBQkJBQkxFX0VMRU1FTlRfU0VMRUNUT1IgPSAkYjRiNzE3YmFiZmJiOTA3YiR2YXIkZm9jdXNhYmxlRWxlbWVudHMuam9pbignOm5vdChbaGlkZGVuXSk6bm90KFt0YWJpbmRleD1cIi0xXCJdKSwnKTtcbmZ1bmN0aW9uICRiNGI3MTdiYWJmYmI5MDdiJGV4cG9ydCQ0YzA2M2NmMTM1MGU2ZmVkKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5tYXRjaGVzKCRiNGI3MTdiYWJmYmI5MDdiJHZhciRGT0NVU0FCTEVfRUxFTUVOVF9TRUxFQ1RPUikgJiYgKDAsICQ3ZDI0MTZlYTA5NTlkYWFhJGV4cG9ydCRlOTg5YzBmZmZhYTZiMjdhKShlbGVtZW50KSAmJiAhJGI0YjcxN2JhYmZiYjkwN2IkdmFyJGlzSW5lcnQoZWxlbWVudCk7XG59XG5mdW5jdGlvbiAkYjRiNzE3YmFiZmJiOTA3YiRleHBvcnQkYmViZDVhMTQzMWZlYzI1ZChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQubWF0Y2hlcygkYjRiNzE3YmFiZmJiOTA3YiR2YXIkVEFCQkFCTEVfRUxFTUVOVF9TRUxFQ1RPUikgJiYgKDAsICQ3ZDI0MTZlYTA5NTlkYWFhJGV4cG9ydCRlOTg5YzBmZmZhYTZiMjdhKShlbGVtZW50KSAmJiAhJGI0YjcxN2JhYmZiYjkwN2IkdmFyJGlzSW5lcnQoZWxlbWVudCk7XG59XG5mdW5jdGlvbiAkYjRiNzE3YmFiZmJiOTA3YiR2YXIkaXNJbmVydChlbGVtZW50KSB7XG4gICAgbGV0IG5vZGUgPSBlbGVtZW50O1xuICAgIHdoaWxlKG5vZGUgIT0gbnVsbCl7XG4gICAgICAgIGlmIChub2RlIGluc3RhbmNlb2Ygbm9kZS5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3LkhUTUxFbGVtZW50ICYmIG5vZGUuaW5lcnQpIHJldHVybiB0cnVlO1xuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50O1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IHskYjRiNzE3YmFiZmJiOTA3YiRleHBvcnQkNGMwNjNjZjEzNTBlNmZlZCBhcyBpc0ZvY3VzYWJsZSwgJGI0YjcxN2JhYmZiYjkwN2IkZXhwb3J0JGJlYmQ1YTE0MzFmZWMyNWQgYXMgaXNUYWJiYWJsZX07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pc0ZvY3VzYWJsZS5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnQge21lcmdlSWRzIGFzICRiZGIxMTAxMGNlZjcwMjM2JGV4cG9ydCRjZDhjOWNiNjhmODQyNjI5LCB1c2VJZCBhcyAkYmRiMTEwMTBjZWY3MDIzNiRleHBvcnQkZjY4MDg3N2EzNDcxMWUzNywgdXNlU2xvdElkIGFzICRiZGIxMTAxMGNlZjcwMjM2JGV4cG9ydCRiNGNjMDljNTkyZThmZGI4fSBmcm9tIFwiLi91c2VJZC5tanNcIjtcbmltcG9ydCB7Y2hhaW4gYXMgJGZmNTk2M2ViMWZjY2Y1NTIkZXhwb3J0JGUwOGUzYjY3ZTM5MjEwMWV9IGZyb20gXCIuL2NoYWluLm1qc1wiO1xuaW1wb3J0IHtjcmVhdGVTaGFkb3dUcmVlV2Fsa2VyIGFzICRkZmM1NDAzMTFiZjdmMTA5JGV4cG9ydCQ0ZDBmOGJlOGIxMmE3ZWY2LCBTaGFkb3dUcmVlV2Fsa2VyIGFzICRkZmM1NDAzMTFiZjdmMTA5JGV4cG9ydCQ2M2ViM2FiYWJhOWM1NWM0fSBmcm9tIFwiLi9TaGFkb3dUcmVlV2Fsa2VyLm1qc1wiO1xuaW1wb3J0IHtnZXRBY3RpdmVFbGVtZW50IGFzICRkNGVlMTBkZTMwNmYyNTEwJGV4cG9ydCRjZDRlNTU3M2ZiZTJiNTc2LCBnZXRFdmVudFRhcmdldCBhcyAkZDRlZTEwZGUzMDZmMjUxMCRleHBvcnQkZTU4ZjAyOWYwZmJmZGIyOSwgbm9kZUNvbnRhaW5zIGFzICRkNGVlMTBkZTMwNmYyNTEwJGV4cG9ydCQ0MjgyZjcwNzk4MDY0ZmUwfSBmcm9tIFwiLi9ET01GdW5jdGlvbnMubWpzXCI7XG5pbXBvcnQge2dldE93bmVyRG9jdW1lbnQgYXMgJDQzMWZiZDg2Y2E3ZGMyMTYkZXhwb3J0JGIyMDRhZjE1ODA0MmZiYWMsIGdldE93bmVyV2luZG93IGFzICQ0MzFmYmQ4NmNhN2RjMjE2JGV4cG9ydCRmMjFhMWZmYWUyNjAxNDVhLCBpc1NoYWRvd1Jvb3QgYXMgJDQzMWZiZDg2Y2E3ZGMyMTYkZXhwb3J0JGFmNTFmMGYwNmMwZjMyOGF9IGZyb20gXCIuL2RvbUhlbHBlcnMubWpzXCI7XG5pbXBvcnQge21lcmdlUHJvcHMgYXMgJDNlZjQyNTc1ZGY4NGIzMGIkZXhwb3J0JDlkMTYxMWM3N2MyZmU5Mjh9IGZyb20gXCIuL21lcmdlUHJvcHMubWpzXCI7XG5pbXBvcnQge21lcmdlUmVmcyBhcyAkNWRjOTU4OTliMzA2ZjYzMCRleHBvcnQkYzkwNTgzMTY3NjRjMTQwZX0gZnJvbSBcIi4vbWVyZ2VSZWZzLm1qc1wiO1xuaW1wb3J0IHtmaWx0ZXJET01Qcm9wcyBhcyAkNjU0ODRkMDJkY2I3ZWIzZSRleHBvcnQkNDU3YzNkNjUxOGRkNGM2Zn0gZnJvbSBcIi4vZmlsdGVyRE9NUHJvcHMubWpzXCI7XG5pbXBvcnQge2ZvY3VzV2l0aG91dFNjcm9sbGluZyBhcyAkNzIxNWFmYzZkZTYwNmQ2YiRleHBvcnQkZGU3OWUyYzY5NWUwNTJmM30gZnJvbSBcIi4vZm9jdXNXaXRob3V0U2Nyb2xsaW5nLm1qc1wiO1xuaW1wb3J0IHtnZXRPZmZzZXQgYXMgJGFiNzFkYWRiMDNhNmZiMmUkZXhwb3J0JDYyMmNlYTQ0NWExYzViN2R9IGZyb20gXCIuL2dldE9mZnNldC5tanNcIjtcbmltcG9ydCB7Z2V0U3ludGhldGljTGlua1Byb3BzIGFzICRlYThkY2JjYjllYTFiNTU2JGV4cG9ydCQ1MTQzN2Q1MDMzNzNkMjIzLCBoYW5kbGVMaW5rQ2xpY2sgYXMgJGVhOGRjYmNiOWVhMWI1NTYkZXhwb3J0JDEzYWVhMWEzY2I1ZTNmMWYsIG9wZW5MaW5rIGFzICRlYThkY2JjYjllYTFiNTU2JGV4cG9ydCQ5NTE4NWQ2OTllMDVkNGQ3LCBSb3V0ZXJQcm92aWRlciBhcyAkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkMzIzZTRmYzJmYTQ3NTNmYiwgc2hvdWxkQ2xpZW50TmF2aWdhdGUgYXMgJGVhOGRjYmNiOWVhMWI1NTYkZXhwb3J0JGVmYThjOTA5OWU1MzAyMzUsIHVzZUxpbmtQcm9wcyBhcyAkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkN2U5MjRiMzA5MWEzYmQxOCwgdXNlUm91dGVyIGFzICRlYThkY2JjYjllYTFiNTU2JGV4cG9ydCQ5YTMwMmE0NWY2NWQwNTcyLCB1c2VTeW50aGV0aWNMaW5rUHJvcHMgYXMgJGVhOGRjYmNiOWVhMWI1NTYkZXhwb3J0JGJkYzc3YjBjMGEzYTg1ZDZ9IGZyb20gXCIuL29wZW5MaW5rLm1qc1wiO1xuaW1wb3J0IHtydW5BZnRlclRyYW5zaXRpb24gYXMgJGJiZWQ4YjQxZjg1N2JjYzAkZXhwb3J0JDI0NDkwMzE2Zjc2NGM0MzB9IGZyb20gXCIuL3J1bkFmdGVyVHJhbnNpdGlvbi5tanNcIjtcbmltcG9ydCB7dXNlRHJhZzFEIGFzICQ5Y2MwOWRmOWZkNzY3NmJlJGV4cG9ydCQ3YmJlZDc1ZmViYTM5NzA2fSBmcm9tIFwiLi91c2VEcmFnMUQubWpzXCI7XG5pbXBvcnQge3VzZUdsb2JhbExpc3RlbmVycyBhcyAkMDNkZWIyM2ZmMTQ5MjBjNCRleHBvcnQkNGVhZjA0ZTU0YWE4ZWVkNn0gZnJvbSBcIi4vdXNlR2xvYmFsTGlzdGVuZXJzLm1qc1wiO1xuaW1wb3J0IHt1c2VMYWJlbHMgYXMgJDMxM2I5ODg2MWVlNWRkNmMkZXhwb3J0JGQ2ODc1MTIyMTk0YzdiNDR9IGZyb20gXCIuL3VzZUxhYmVscy5tanNcIjtcbmltcG9ydCB7dXNlT2JqZWN0UmVmIGFzICRkZjU2MTY0ZGZmNTc4NWUyJGV4cG9ydCQ0MzM4YjUzMzE1YWJmNjY2fSBmcm9tIFwiLi91c2VPYmplY3RSZWYubWpzXCI7XG5pbXBvcnQge3VzZVVwZGF0ZUVmZmVjdCBhcyAkNGY1OGM1ZjcyYmNmNzlmNyRleHBvcnQkNDk2MzE1YTE2MDhkOTYwMn0gZnJvbSBcIi4vdXNlVXBkYXRlRWZmZWN0Lm1qc1wiO1xuaW1wb3J0IHt1c2VVcGRhdGVMYXlvdXRFZmZlY3QgYXMgJGNhOWIzNzcxMmYwMDczODEkZXhwb3J0JDcyZWY3MDhhYjA3MjUxZjF9IGZyb20gXCIuL3VzZVVwZGF0ZUxheW91dEVmZmVjdC5tanNcIjtcbmltcG9ydCB7dXNlTGF5b3V0RWZmZWN0IGFzICRmMGEwNGNjZDhkYmRkODNiJGV4cG9ydCRlNWM1YTVmOTE3YTU4NzFjfSBmcm9tIFwiLi91c2VMYXlvdXRFZmZlY3QubWpzXCI7XG5pbXBvcnQge3VzZVJlc2l6ZU9ic2VydmVyIGFzICQ5ZGFhYjAyZDQ2MTgwOWRiJGV4cG9ydCQ2ODM0ODBmMTkxYzBlM2VhfSBmcm9tIFwiLi91c2VSZXNpemVPYnNlcnZlci5tanNcIjtcbmltcG9ydCB7dXNlU3luY1JlZiBhcyAkZTc4MDFiZTgyYjRiMmE1MyRleHBvcnQkNGRlYmRiMWEzZjBmYTc5ZX0gZnJvbSBcIi4vdXNlU3luY1JlZi5tanNcIjtcbmltcG9ydCB7Z2V0U2Nyb2xsUGFyZW50IGFzICQ2MmQ4ZGVkOTI5NmYzODcyJGV4cG9ydCRjZmEyMjI1ZTg3OTM4NzgxfSBmcm9tIFwiLi9nZXRTY3JvbGxQYXJlbnQubWpzXCI7XG5pbXBvcnQge2dldFNjcm9sbFBhcmVudHMgYXMgJGE0MGM2NzNkYzlmNmQ5YzckZXhwb3J0JDk0ZWQxYzkyYzdiZWViMjJ9IGZyb20gXCIuL2dldFNjcm9sbFBhcmVudHMubWpzXCI7XG5pbXBvcnQge2lzU2Nyb2xsYWJsZSBhcyAkY2MzOGU3YmQzZmM3YjIxMyRleHBvcnQkMmJiNzQ3NDBjNGUxOWRlZn0gZnJvbSBcIi4vaXNTY3JvbGxhYmxlLm1qc1wiO1xuaW1wb3J0IHt1c2VWaWV3cG9ydFNpemUgYXMgJDVkZjY0YjM4MDdkYzE1ZWUkZXhwb3J0JGQ2OTk5MDVkZDU3YzczY2F9IGZyb20gXCIuL3VzZVZpZXdwb3J0U2l6ZS5tanNcIjtcbmltcG9ydCB7dXNlRGVzY3JpcHRpb24gYXMgJGVmMDYyNTYwNzk2ODZiYTAkZXhwb3J0JGY4YWVkYTdiMTA3NTNmYTF9IGZyb20gXCIuL3VzZURlc2NyaXB0aW9uLm1qc1wiO1xuaW1wb3J0IHtpc0FuZHJvaWQgYXMgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JGExMWIwMDU5OTAwY2VlYzgsIGlzQXBwbGVEZXZpY2UgYXMgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JGUxODY1YzNiZWRjZDgyMmIsIGlzQ2hyb21lIGFzICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCQ2NDQ2YTE4NmQwOWUzNzllLCBpc0ZpcmVmb3ggYXMgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JGI3ZDc4OTkzYjc0Zjc2NmQsIGlzSU9TIGFzICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCRmZWRiMzY5Y2I3MDIwN2YxLCBpc0lQYWQgYXMgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JDdiZWYwNDljZTkyZTQyMjQsIGlzSVBob25lIGFzICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCQxODZjNjk2NGNhMTdkOTksIGlzTWFjIGFzICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCQ5YWMxMDBlNDA2MTNlYTEwLCBpc1dlYktpdCBhcyAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkNzg1NTEwNDM1ODJhNmE5OH0gZnJvbSBcIi4vcGxhdGZvcm0ubWpzXCI7XG5pbXBvcnQge3VzZUV2ZW50IGFzICRlOWZhYWZiNjQxZTE2N2RiJGV4cG9ydCQ5MGZjM2ExN2Q5M2Y3MDRjfSBmcm9tIFwiLi91c2VFdmVudC5tanNcIjtcbmltcG9ydCB7dXNlVmFsdWVFZmZlY3QgYXMgJDFkYmVjYmUyN2EwNGY5YWYkZXhwb3J0JDE0ZDIzOGYzNDI3MjNmMjV9IGZyb20gXCIuL3VzZVZhbHVlRWZmZWN0Lm1qc1wiO1xuaW1wb3J0IHtzY3JvbGxJbnRvVmlldyBhcyAkMmYwNGNiYzQ0ZWUzMGNlMCRleHBvcnQkNTNhMDkxMGYwMzgzMzdiZCwgc2Nyb2xsSW50b1ZpZXdwb3J0IGFzICQyZjA0Y2JjNDRlZTMwY2UwJGV4cG9ydCRjODI2ODYwNzk2MzA5ZDFifSBmcm9tIFwiLi9zY3JvbGxJbnRvVmlldy5tanNcIjtcbmltcG9ydCB7aXNWaXJ0dWFsQ2xpY2sgYXMgJDZhN2RiODU0MzI0NDhmN2YkZXhwb3J0JDYwMjc4ODcxNDU3NjIyZGUsIGlzVmlydHVhbFBvaW50ZXJFdmVudCBhcyAkNmE3ZGI4NTQzMjQ0OGY3ZiRleHBvcnQkMjliZjFiNWYyYzU2Y2Y2M30gZnJvbSBcIi4vaXNWaXJ0dWFsRXZlbnQubWpzXCI7XG5pbXBvcnQge3VzZUVmZmVjdEV2ZW50IGFzICQ4YWUwNWVhYTVjMTE0ZTljJGV4cG9ydCQ3ZjU0ZmMzMTgwNTA4YTUyfSBmcm9tIFwiLi91c2VFZmZlY3RFdmVudC5tanNcIjtcbmltcG9ydCB7dXNlRGVlcE1lbW8gYXMgJDVhMzg3Y2M0OTM1MGU2ZGIkZXhwb3J0JDcyMmRlYmMwZTU2ZmVhMzl9IGZyb20gXCIuL3VzZURlZXBNZW1vLm1qc1wiO1xuaW1wb3J0IHt1c2VGb3JtUmVzZXQgYXMgJDk5ZmFjYWI3MzI2NmY2NjIkZXhwb3J0JDVhZGQxZDAwNjI5M2QxMzZ9IGZyb20gXCIuL3VzZUZvcm1SZXNldC5tanNcIjtcbmltcG9ydCB7dXNlTG9hZE1vcmUgYXMgJDI2ZjdmM2RhNzNmY2Q5ZDYkZXhwb3J0JDc3MTdjOTJlZTkxNTM3M2V9IGZyb20gXCIuL3VzZUxvYWRNb3JlLm1qc1wiO1xuaW1wb3J0IHt1c2VMb2FkTW9yZVNlbnRpbmVsIGFzICRhNWZhOTczYzE4NTBkZDM2JGV4cG9ydCRjY2FlYTk2YzI4ZThiOWU3fSBmcm9tIFwiLi91c2VMb2FkTW9yZVNlbnRpbmVsLm1qc1wiO1xuaW1wb3J0IHtpbmVydFZhbHVlIGFzICRjZGM1YTY3NzhiNzY2ZGIyJGV4cG9ydCRhOWQwNGM1Njg0MTIzMzY5fSBmcm9tIFwiLi9pbmVydFZhbHVlLm1qc1wiO1xuaW1wb3J0IHtDTEVBUl9GT0NVU19FVkVOVCBhcyAkNTY3MWIyMGNmOWI1NjJiMiRleHBvcnQkNDQ3YTM4OTk1ZGUyYzcxMSwgRk9DVVNfRVZFTlQgYXMgJDU2NzFiMjBjZjliNTYyYjIkZXhwb3J0JDgzMWM4MjBhZDYwZjlkMTJ9IGZyb20gXCIuL2NvbnN0YW50cy5tanNcIjtcbmltcG9ydCB7aXNDdHJsS2V5UHJlc3NlZCBhcyAkMjFmMWFhOThhY2IwODMxNyRleHBvcnQkMTY3OTJlZmZlODM3ZGJhMywgd2lsbE9wZW5LZXlib2FyZCBhcyAkMjFmMWFhOThhY2IwODMxNyRleHBvcnQkYzU3OTU4ZTM1ZjMxZWQ3M30gZnJvbSBcIi4va2V5Ym9hcmQubWpzXCI7XG5pbXBvcnQge3VzZUVudGVyQW5pbWF0aW9uIGFzICRkM2YwNDkyNDI0MzEyMTljJGV4cG9ydCQ2ZDM0NDNmMmM0OGJmYzIwLCB1c2VFeGl0QW5pbWF0aW9uIGFzICRkM2YwNDkyNDI0MzEyMTljJGV4cG9ydCQ0NWZkYTdjNDdmOTNmZDQ4fSBmcm9tIFwiLi9hbmltYXRpb24ubWpzXCI7XG5pbXBvcnQge2lzRm9jdXNhYmxlIGFzICRiNGI3MTdiYWJmYmI5MDdiJGV4cG9ydCQ0YzA2M2NmMTM1MGU2ZmVkLCBpc1RhYmJhYmxlIGFzICRiNGI3MTdiYWJmYmI5MDdiJGV4cG9ydCRiZWJkNWExNDMxZmVjMjVkfSBmcm9tIFwiLi9pc0ZvY3VzYWJsZS5tanNcIjtcbmltcG9ydCB7Y2xhbXAgYXMgJDQ1MDc0NjFhMWI4NzAxMjMkcmVfZXhwb3J0JGNsYW1wLCBzbmFwVmFsdWVUb1N0ZXAgYXMgJDQ1MDc0NjFhMWI4NzAxMjMkcmVfZXhwb3J0JHNuYXBWYWx1ZVRvU3RlcH0gZnJvbSBcIkByZWFjdC1zdGF0ZWx5L3V0aWxzXCI7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBBZG9iZS4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgZmlsZSBpcyBsaWNlbnNlZCB0byB5b3UgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5XG4gKiBvZiB0aGUgTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkIHVuZGVyXG4gKiB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBSRVBSRVNFTlRBVElPTlNcbiAqIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZVxuICogZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqLyBcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuZXhwb3J0IHskYmRiMTEwMTBjZWY3MDIzNiRleHBvcnQkZjY4MDg3N2EzNDcxMWUzNyBhcyB1c2VJZCwgJGJkYjExMDEwY2VmNzAyMzYkZXhwb3J0JGNkOGM5Y2I2OGY4NDI2MjkgYXMgbWVyZ2VJZHMsICRiZGIxMTAxMGNlZjcwMjM2JGV4cG9ydCRiNGNjMDljNTkyZThmZGI4IGFzIHVzZVNsb3RJZCwgJGZmNTk2M2ViMWZjY2Y1NTIkZXhwb3J0JGUwOGUzYjY3ZTM5MjEwMWUgYXMgY2hhaW4sICRkZmM1NDAzMTFiZjdmMTA5JGV4cG9ydCQ0ZDBmOGJlOGIxMmE3ZWY2IGFzIGNyZWF0ZVNoYWRvd1RyZWVXYWxrZXIsICRkZmM1NDAzMTFiZjdmMTA5JGV4cG9ydCQ2M2ViM2FiYWJhOWM1NWM0IGFzIFNoYWRvd1RyZWVXYWxrZXIsICRkNGVlMTBkZTMwNmYyNTEwJGV4cG9ydCRjZDRlNTU3M2ZiZTJiNTc2IGFzIGdldEFjdGl2ZUVsZW1lbnQsICRkNGVlMTBkZTMwNmYyNTEwJGV4cG9ydCRlNThmMDI5ZjBmYmZkYjI5IGFzIGdldEV2ZW50VGFyZ2V0LCAkZDRlZTEwZGUzMDZmMjUxMCRleHBvcnQkNDI4MmY3MDc5ODA2NGZlMCBhcyBub2RlQ29udGFpbnMsICQ0MzFmYmQ4NmNhN2RjMjE2JGV4cG9ydCRiMjA0YWYxNTgwNDJmYmFjIGFzIGdldE93bmVyRG9jdW1lbnQsICQ0MzFmYmQ4NmNhN2RjMjE2JGV4cG9ydCRmMjFhMWZmYWUyNjAxNDVhIGFzIGdldE93bmVyV2luZG93LCAkNDMxZmJkODZjYTdkYzIxNiRleHBvcnQkYWY1MWYwZjA2YzBmMzI4YSBhcyBpc1NoYWRvd1Jvb3QsICQzZWY0MjU3NWRmODRiMzBiJGV4cG9ydCQ5ZDE2MTFjNzdjMmZlOTI4IGFzIG1lcmdlUHJvcHMsICQ1ZGM5NTg5OWIzMDZmNjMwJGV4cG9ydCRjOTA1ODMxNjc2NGMxNDBlIGFzIG1lcmdlUmVmcywgJDY1NDg0ZDAyZGNiN2ViM2UkZXhwb3J0JDQ1N2MzZDY1MThkZDRjNmYgYXMgZmlsdGVyRE9NUHJvcHMsICQ3MjE1YWZjNmRlNjA2ZDZiJGV4cG9ydCRkZTc5ZTJjNjk1ZTA1MmYzIGFzIGZvY3VzV2l0aG91dFNjcm9sbGluZywgJGFiNzFkYWRiMDNhNmZiMmUkZXhwb3J0JDYyMmNlYTQ0NWExYzViN2QgYXMgZ2V0T2Zmc2V0LCAkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkOTUxODVkNjk5ZTA1ZDRkNyBhcyBvcGVuTGluaywgJGVhOGRjYmNiOWVhMWI1NTYkZXhwb3J0JDUxNDM3ZDUwMzM3M2QyMjMgYXMgZ2V0U3ludGhldGljTGlua1Byb3BzLCAkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkYmRjNzdiMGMwYTNhODVkNiBhcyB1c2VTeW50aGV0aWNMaW5rUHJvcHMsICRlYThkY2JjYjllYTFiNTU2JGV4cG9ydCQzMjNlNGZjMmZhNDc1M2ZiIGFzIFJvdXRlclByb3ZpZGVyLCAkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkZWZhOGM5MDk5ZTUzMDIzNSBhcyBzaG91bGRDbGllbnROYXZpZ2F0ZSwgJGVhOGRjYmNiOWVhMWI1NTYkZXhwb3J0JDlhMzAyYTQ1ZjY1ZDA1NzIgYXMgdXNlUm91dGVyLCAkZWE4ZGNiY2I5ZWExYjU1NiRleHBvcnQkN2U5MjRiMzA5MWEzYmQxOCBhcyB1c2VMaW5rUHJvcHMsICRlYThkY2JjYjllYTFiNTU2JGV4cG9ydCQxM2FlYTFhM2NiNWUzZjFmIGFzIGhhbmRsZUxpbmtDbGljaywgJGJiZWQ4YjQxZjg1N2JjYzAkZXhwb3J0JDI0NDkwMzE2Zjc2NGM0MzAgYXMgcnVuQWZ0ZXJUcmFuc2l0aW9uLCAkOWNjMDlkZjlmZDc2NzZiZSRleHBvcnQkN2JiZWQ3NWZlYmEzOTcwNiBhcyB1c2VEcmFnMUQsICQwM2RlYjIzZmYxNDkyMGM0JGV4cG9ydCQ0ZWFmMDRlNTRhYThlZWQ2IGFzIHVzZUdsb2JhbExpc3RlbmVycywgJDMxM2I5ODg2MWVlNWRkNmMkZXhwb3J0JGQ2ODc1MTIyMTk0YzdiNDQgYXMgdXNlTGFiZWxzLCAkZGY1NjE2NGRmZjU3ODVlMiRleHBvcnQkNDMzOGI1MzMxNWFiZjY2NiBhcyB1c2VPYmplY3RSZWYsICQ0ZjU4YzVmNzJiY2Y3OWY3JGV4cG9ydCQ0OTYzMTVhMTYwOGQ5NjAyIGFzIHVzZVVwZGF0ZUVmZmVjdCwgJGNhOWIzNzcxMmYwMDczODEkZXhwb3J0JDcyZWY3MDhhYjA3MjUxZjEgYXMgdXNlVXBkYXRlTGF5b3V0RWZmZWN0LCAkZjBhMDRjY2Q4ZGJkZDgzYiRleHBvcnQkZTVjNWE1ZjkxN2E1ODcxYyBhcyB1c2VMYXlvdXRFZmZlY3QsICQ5ZGFhYjAyZDQ2MTgwOWRiJGV4cG9ydCQ2ODM0ODBmMTkxYzBlM2VhIGFzIHVzZVJlc2l6ZU9ic2VydmVyLCAkZTc4MDFiZTgyYjRiMmE1MyRleHBvcnQkNGRlYmRiMWEzZjBmYTc5ZSBhcyB1c2VTeW5jUmVmLCAkNjJkOGRlZDkyOTZmMzg3MiRleHBvcnQkY2ZhMjIyNWU4NzkzODc4MSBhcyBnZXRTY3JvbGxQYXJlbnQsICRhNDBjNjczZGM5ZjZkOWM3JGV4cG9ydCQ5NGVkMWM5MmM3YmVlYjIyIGFzIGdldFNjcm9sbFBhcmVudHMsICRjYzM4ZTdiZDNmYzdiMjEzJGV4cG9ydCQyYmI3NDc0MGM0ZTE5ZGVmIGFzIGlzU2Nyb2xsYWJsZSwgJDVkZjY0YjM4MDdkYzE1ZWUkZXhwb3J0JGQ2OTk5MDVkZDU3YzczY2EgYXMgdXNlVmlld3BvcnRTaXplLCAkZWYwNjI1NjA3OTY4NmJhMCRleHBvcnQkZjhhZWRhN2IxMDc1M2ZhMSBhcyB1c2VEZXNjcmlwdGlvbiwgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JDlhYzEwMGU0MDYxM2VhMTAgYXMgaXNNYWMsICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCQxODZjNjk2NGNhMTdkOTkgYXMgaXNJUGhvbmUsICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCQ3YmVmMDQ5Y2U5MmU0MjI0IGFzIGlzSVBhZCwgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JGZlZGIzNjljYjcwMjA3ZjEgYXMgaXNJT1MsICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCRlMTg2NWMzYmVkY2Q4MjJiIGFzIGlzQXBwbGVEZXZpY2UsICRjODczMTE0MjRlYTMwYTA1JGV4cG9ydCQ3ODU1MTA0MzU4MmE2YTk4IGFzIGlzV2ViS2l0LCAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkNjQ0NmExODZkMDllMzc5ZSBhcyBpc0Nocm9tZSwgJGM4NzMxMTQyNGVhMzBhMDUkZXhwb3J0JGExMWIwMDU5OTAwY2VlYzggYXMgaXNBbmRyb2lkLCAkYzg3MzExNDI0ZWEzMGEwNSRleHBvcnQkYjdkNzg5OTNiNzRmNzY2ZCBhcyBpc0ZpcmVmb3gsICRlOWZhYWZiNjQxZTE2N2RiJGV4cG9ydCQ5MGZjM2ExN2Q5M2Y3MDRjIGFzIHVzZUV2ZW50LCAkMWRiZWNiZTI3YTA0ZjlhZiRleHBvcnQkMTRkMjM4ZjM0MjcyM2YyNSBhcyB1c2VWYWx1ZUVmZmVjdCwgJDJmMDRjYmM0NGVlMzBjZTAkZXhwb3J0JDUzYTA5MTBmMDM4MzM3YmQgYXMgc2Nyb2xsSW50b1ZpZXcsICQyZjA0Y2JjNDRlZTMwY2UwJGV4cG9ydCRjODI2ODYwNzk2MzA5ZDFiIGFzIHNjcm9sbEludG9WaWV3cG9ydCwgJDQ1MDc0NjFhMWI4NzAxMjMkcmVfZXhwb3J0JGNsYW1wIGFzIGNsYW1wLCAkNDUwNzQ2MWExYjg3MDEyMyRyZV9leHBvcnQkc25hcFZhbHVlVG9TdGVwIGFzIHNuYXBWYWx1ZVRvU3RlcCwgJDZhN2RiODU0MzI0NDhmN2YkZXhwb3J0JDYwMjc4ODcxNDU3NjIyZGUgYXMgaXNWaXJ0dWFsQ2xpY2ssICQ2YTdkYjg1NDMyNDQ4ZjdmJGV4cG9ydCQyOWJmMWI1ZjJjNTZjZjYzIGFzIGlzVmlydHVhbFBvaW50ZXJFdmVudCwgJDhhZTA1ZWFhNWMxMTRlOWMkZXhwb3J0JDdmNTRmYzMxODA1MDhhNTIgYXMgdXNlRWZmZWN0RXZlbnQsICQ1YTM4N2NjNDkzNTBlNmRiJGV4cG9ydCQ3MjJkZWJjMGU1NmZlYTM5IGFzIHVzZURlZXBNZW1vLCAkOTlmYWNhYjczMjY2ZjY2MiRleHBvcnQkNWFkZDFkMDA2MjkzZDEzNiBhcyB1c2VGb3JtUmVzZXQsICQyNmY3ZjNkYTczZmNkOWQ2JGV4cG9ydCQ3NzE3YzkyZWU5MTUzNzNlIGFzIHVzZUxvYWRNb3JlLCAkYTVmYTk3M2MxODUwZGQzNiRleHBvcnQkY2NhZWE5NmMyOGU4YjllNyBhcyB1c2VMb2FkTW9yZVNlbnRpbmVsLCAkYTVmYTk3M2MxODUwZGQzNiRleHBvcnQkY2NhZWE5NmMyOGU4YjllNyBhcyBVTlNUQUJMRV91c2VMb2FkTW9yZVNlbnRpbmVsLCAkY2RjNWE2Nzc4Yjc2NmRiMiRleHBvcnQkYTlkMDRjNTY4NDEyMzM2OSBhcyBpbmVydFZhbHVlLCAkNTY3MWIyMGNmOWI1NjJiMiRleHBvcnQkNDQ3YTM4OTk1ZGUyYzcxMSBhcyBDTEVBUl9GT0NVU19FVkVOVCwgJDU2NzFiMjBjZjliNTYyYjIkZXhwb3J0JDgzMWM4MjBhZDYwZjlkMTIgYXMgRk9DVVNfRVZFTlQsICQyMWYxYWE5OGFjYjA4MzE3JGV4cG9ydCQxNjc5MmVmZmU4MzdkYmEzIGFzIGlzQ3RybEtleVByZXNzZWQsICQyMWYxYWE5OGFjYjA4MzE3JGV4cG9ydCRjNTc5NThlMzVmMzFlZDczIGFzIHdpbGxPcGVuS2V5Ym9hcmQsICRkM2YwNDkyNDI0MzEyMTljJGV4cG9ydCQ2ZDM0NDNmMmM0OGJmYzIwIGFzIHVzZUVudGVyQW5pbWF0aW9uLCAkZDNmMDQ5MjQyNDMxMjE5YyRleHBvcnQkNDVmZGE3YzQ3ZjkzZmQ0OCBhcyB1c2VFeGl0QW5pbWF0aW9uLCAkYjRiNzE3YmFiZmJiOTA3YiRleHBvcnQkNGMwNjNjZjEzNTBlNmZlZCBhcyBpc0ZvY3VzYWJsZSwgJGI0YjcxN2JhYmZiYjkwN2IkZXhwb3J0JGJlYmQ1YTE0MzFmZWMyNWQgYXMgaXNUYWJiYWJsZX07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1tb2R1bGUuanMubWFwXG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgYDpyb290ey0tY29udGV4aWZ5LXpJbmRleDo2NjY7LS1jb250ZXhpZnktbWVudS1taW5XaWR0aDoyMjBweDstLWNvbnRleGlmeS1tZW51LXBhZGRpbmc6NnB4Oy0tY29udGV4aWZ5LW1lbnUtcmFkaXVzOjZweDstLWNvbnRleGlmeS1tZW51LWJnQ29sb3I6I2ZmZjstLWNvbnRleGlmeS1tZW51LXNoYWRvdzoxcHggMnB4IDJweCByZ2JhKDAsMCwwLC4xKSwycHggNHB4IDRweCByZ2JhKDAsMCwwLC4xKSwzcHggNnB4IDZweCByZ2JhKDAsMCwwLC4xKTstLWNvbnRleGlmeS1tZW51LW5lZ2F0ZVBhZGRpbmc6dmFyKC0tY29udGV4aWZ5LW1lbnUtcGFkZGluZyk7LS1jb250ZXhpZnktc2VwYXJhdG9yLWNvbG9yOnJnYmEoMCwwLDAsLjIpOy0tY29udGV4aWZ5LXNlcGFyYXRvci1tYXJnaW46NXB4Oy0tY29udGV4aWZ5LWl0ZW1Db250ZW50LXBhZGRpbmc6NnB4Oy0tY29udGV4aWZ5LWFjdGl2ZUl0ZW0tcmFkaXVzOjRweDstLWNvbnRleGlmeS1pdGVtLWNvbG9yOiMzMzM7LS1jb250ZXhpZnktYWN0aXZlSXRlbS1jb2xvcjojZmZmOy0tY29udGV4aWZ5LWFjdGl2ZUl0ZW0tYmdDb2xvcjojMzQ5OGRiOy0tY29udGV4aWZ5LXJpZ2h0U2xvdC1jb2xvcjojNmY2ZTc3Oy0tY29udGV4aWZ5LWFjdGl2ZVJpZ2h0U2xvdC1jb2xvcjojZmZmOy0tY29udGV4aWZ5LWFycm93LWNvbG9yOiM2ZjZlNzc7LS1jb250ZXhpZnktYWN0aXZlQXJyb3ctY29sb3I6I2ZmZn1Aa2V5ZnJhbWVzIGNvbnRleGlmeV9mZWVkYmFja3swJXtvcGFjaXR5Oi40fXRve29wYWNpdHk6MX19LmNvbnRleGlmeXtwb3NpdGlvbjpmaXhlZDtvcGFjaXR5OjA7LXdlYmtpdC11c2VyLXNlbGVjdDpub25lOy1tb3otdXNlci1zZWxlY3Q6bm9uZTt1c2VyLXNlbGVjdDpub25lO2JhY2tncm91bmQtY29sb3I6dmFyKC0tY29udGV4aWZ5LW1lbnUtYmdDb2xvcik7Ym94LXNpemluZzpib3JkZXItYm94O2JveC1zaGFkb3c6dmFyKC0tY29udGV4aWZ5LW1lbnUtc2hhZG93KTtib3JkZXItcmFkaXVzOnZhcigtLWNvbnRleGlmeS1tZW51LXJhZGl1cyk7cGFkZGluZzp2YXIoLS1jb250ZXhpZnktbWVudS1wYWRkaW5nKTttaW4td2lkdGg6dmFyKC0tY29udGV4aWZ5LW1lbnUtbWluV2lkdGgpO3otaW5kZXg6dmFyKC0tY29udGV4aWZ5LXpJbmRleCl9LmNvbnRleGlmeV9zdWJtZW51LWlzT3BlbiwuY29udGV4aWZ5X3N1Ym1lbnUtaXNPcGVuPi5jb250ZXhpZnlfaXRlbUNvbnRlbnR7Y29sb3I6dmFyKC0tY29udGV4aWZ5LWFjdGl2ZUl0ZW0tY29sb3IpO2JhY2tncm91bmQtY29sb3I6dmFyKC0tY29udGV4aWZ5LWFjdGl2ZUl0ZW0tYmdDb2xvcik7Ym9yZGVyLXJhZGl1czp2YXIoLS1jb250ZXhpZnktYWN0aXZlSXRlbS1yYWRpdXMpfS5jb250ZXhpZnlfc3VibWVudS1pc09wZW4+LmNvbnRleGlmeV9pdGVtQ29udGVudCAuY29udGV4aWZ5X3JpZ2h0U2xvdHtjb2xvcjp2YXIoLS1jb250ZXhpZnktYWN0aXZlQXJyb3ctY29sb3IpfS5jb250ZXhpZnlfc3VibWVudS1pc09wZW4+LmNvbnRleGlmeV9zdWJtZW51e3BvaW50ZXItZXZlbnRzOmF1dG87b3BhY2l0eToxfS5jb250ZXhpZnkgLmNvbnRleGlmeV9zdWJtZW51e3Bvc2l0aW9uOmFic29sdXRlO3BvaW50ZXItZXZlbnRzOm5vbmU7dHJhbnNpdGlvbjpvcGFjaXR5IC4yNjVzO3RvcDpjYWxjKC0xICogdmFyKC0tY29udGV4aWZ5LW1lbnUtbmVnYXRlUGFkZGluZykpO2xlZnQ6MTAwJX0uY29udGV4aWZ5IC5jb250ZXhpZnlfc3VibWVudS1ib3R0b217Ym90dG9tOmNhbGMoLTEgKiB2YXIoLS1jb250ZXhpZnktbWVudS1uZWdhdGVQYWRkaW5nKSk7dG9wOnVuc2V0fS5jb250ZXhpZnkgLmNvbnRleGlmeV9zdWJtZW51LXJpZ2h0e3JpZ2h0OjEwMCU7bGVmdDp1bnNldH0uY29udGV4aWZ5X3JpZ2h0U2xvdHttYXJnaW4tbGVmdDphdXRvO2Rpc3BsYXk6ZmxleDtjb2xvcjp2YXIoLS1jb250ZXhpZnktcmlnaHRTbG90LWNvbG9yKX0uY29udGV4aWZ5X3NlcGFyYXRvcntoZWlnaHQ6MXB4O2N1cnNvcjpkZWZhdWx0O21hcmdpbjp2YXIoLS1jb250ZXhpZnktc2VwYXJhdG9yLW1hcmdpbik7YmFja2dyb3VuZC1jb2xvcjp2YXIoLS1jb250ZXhpZnktc2VwYXJhdG9yLWNvbG9yKX0uY29udGV4aWZ5X3dpbGxMZWF2ZS1kaXNhYmxlZHtwb2ludGVyLWV2ZW50czpub25lfS5jb250ZXhpZnlfaXRlbXtjdXJzb3I6cG9pbnRlcjtwb3NpdGlvbjpyZWxhdGl2ZX0uY29udGV4aWZ5X2l0ZW06Zm9jdXN7b3V0bGluZTowfS5jb250ZXhpZnlfaXRlbTpmb2N1cyAuY29udGV4aWZ5X3JpZ2h0U2xvdCwuY29udGV4aWZ5X2l0ZW06bm90KC5jb250ZXhpZnlfaXRlbS1kaXNhYmxlZCk6aG92ZXI+LmNvbnRleGlmeV9pdGVtQ29udGVudCAuY29udGV4aWZ5X3JpZ2h0U2xvdHtjb2xvcjp2YXIoLS1jb250ZXhpZnktYWN0aXZlUmlnaHRTbG90LWNvbG9yKX0uY29udGV4aWZ5X2l0ZW06bm90KC5jb250ZXhpZnlfaXRlbS1kaXNhYmxlZClbYXJpYS1oYXNwb3B1cF0+LmNvbnRleGlmeV9pdGVtQ29udGVudCAuY29udGV4aWZ5X3JpZ2h0U2xvdHtjb2xvcjp2YXIoLS1jb250ZXhpZnktYXJyb3ctY29sb3IpfS5jb250ZXhpZnlfaXRlbTpub3QoLmNvbnRleGlmeV9pdGVtLWRpc2FibGVkKVthcmlhLWhhc3BvcHVwXS5jb250ZXhpZnlfc3VibWVudS1pc09wZW4+LmNvbnRleGlmeV9pdGVtQ29udGVudCAuY29udGV4aWZ5X3JpZ2h0U2xvdCwuY29udGV4aWZ5X2l0ZW06bm90KC5jb250ZXhpZnlfaXRlbS1kaXNhYmxlZClbYXJpYS1oYXNwb3B1cF06aG92ZXI+LmNvbnRleGlmeV9pdGVtQ29udGVudCAuY29udGV4aWZ5X3JpZ2h0U2xvdCwuY29udGV4aWZ5X2l0ZW1bYXJpYS1oYXNwb3B1cF06Zm9jdXM+LmNvbnRleGlmeV9pdGVtQ29udGVudCAuY29udGV4aWZ5X3JpZ2h0U2xvdHtjb2xvcjp2YXIoLS1jb250ZXhpZnktYWN0aXZlQXJyb3ctY29sb3IpfS5jb250ZXhpZnlfaXRlbTpub3QoLmNvbnRleGlmeV9pdGVtLWRpc2FibGVkKTpmb2N1cz4uY29udGV4aWZ5X2l0ZW1Db250ZW50LC5jb250ZXhpZnlfaXRlbTpub3QoLmNvbnRleGlmeV9pdGVtLWRpc2FibGVkKTpob3Zlcj4uY29udGV4aWZ5X2l0ZW1Db250ZW50e2NvbG9yOnZhcigtLWNvbnRleGlmeS1hY3RpdmVJdGVtLWNvbG9yKTtiYWNrZ3JvdW5kLWNvbG9yOnZhcigtLWNvbnRleGlmeS1hY3RpdmVJdGVtLWJnQ29sb3IpO2JvcmRlci1yYWRpdXM6dmFyKC0tY29udGV4aWZ5LWFjdGl2ZUl0ZW0tcmFkaXVzKX0uY29udGV4aWZ5X2l0ZW06bm90KC5jb250ZXhpZnlfaXRlbS1kaXNhYmxlZCk6aG92ZXI+LmNvbnRleGlmeV9zdWJtZW51e3BvaW50ZXItZXZlbnRzOmF1dG87b3BhY2l0eToxfS5jb250ZXhpZnlfaXRlbS1kaXNhYmxlZHtjdXJzb3I6ZGVmYXVsdDtvcGFjaXR5Oi41fS5jb250ZXhpZnlfaXRlbUNvbnRlbnR7cGFkZGluZzp2YXIoLS1jb250ZXhpZnktaXRlbUNvbnRlbnQtcGFkZGluZyk7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjt3aGl0ZS1zcGFjZTpub3dyYXA7Y29sb3I6dmFyKC0tY29udGV4aWZ5LWl0ZW0tY29sb3IpO3Bvc2l0aW9uOnJlbGF0aXZlfS5jb250ZXhpZnlfaXRlbS1mZWVkYmFja3thbmltYXRpb246Y29udGV4aWZ5X2ZlZWRiYWNrIC4xMnMgYm90aH0uY29udGV4aWZ5X3RoZW1lLWRhcmt7LS1jb250ZXhpZnktbWVudS1iZ0NvbG9yOnJnYmEoNDAsNDAsNDAsLjk4KTstLWNvbnRleGlmeS1zZXBhcmF0b3ItY29sb3I6IzRjNGM0YzstLWNvbnRleGlmeS1pdGVtLWNvbG9yOiNmZmZ9LmNvbnRleGlmeV90aGVtZS1saWdodHstLWNvbnRleGlmeS1zZXBhcmF0b3ItY29sb3I6I2VlZTstLWNvbnRleGlmeS1pdGVtLWNvbG9yOiM2NjY7LS1jb250ZXhpZnktYWN0aXZlSXRlbS1jb2xvcjojMzQ5OGRiOy0tY29udGV4aWZ5LWFjdGl2ZUl0ZW0tYmdDb2xvcjojZTBlZWZkOy0tY29udGV4aWZ5LWFjdGl2ZVJpZ2h0U2xvdC1jb2xvcjojMzQ5OGRiOy0tY29udGV4aWZ5LWFjdGl2ZS1hcnJvdy1jb2xvcjojMzQ5OGRifUBrZXlmcmFtZXMgY29udGV4aWZ5X3NjYWxlSW57MCV7b3BhY2l0eTowO3RyYW5zZm9ybTpzY2FsZTNkKC4zLC4zLC4zKX10b3tvcGFjaXR5OjF9fUBrZXlmcmFtZXMgY29udGV4aWZ5X3NjYWxlT3V0ezAle29wYWNpdHk6MX10b3tvcGFjaXR5OjA7dHJhbnNmb3JtOnNjYWxlM2QoLjMsLjMsLjMpfX0uY29udGV4aWZ5X3dpbGxFbnRlci1zY2FsZXt0cmFuc2Zvcm0tb3JpZ2luOnRvcCBsZWZ0O2FuaW1hdGlvbjpjb250ZXhpZnlfc2NhbGVJbiAuM3N9LmNvbnRleGlmeV93aWxsTGVhdmUtc2NhbGV7dHJhbnNmb3JtLW9yaWdpbjp0b3AgbGVmdDthbmltYXRpb246Y29udGV4aWZ5X3NjYWxlT3V0IC4zc31Aa2V5ZnJhbWVzIGNvbnRleGlmeV9mYWRlSW57MCV7b3BhY2l0eTowO3RyYW5zZm9ybTp0cmFuc2xhdGVZKDEwcHgpfXRve29wYWNpdHk6MTt0cmFuc2Zvcm06dHJhbnNsYXRlWSgwKX19QGtleWZyYW1lcyBjb250ZXhpZnlfZmFkZU91dHswJXtvcGFjaXR5OjE7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMCl9dG97b3BhY2l0eTowO3RyYW5zZm9ybTp0cmFuc2xhdGVZKDEwcHgpfX0uY29udGV4aWZ5X3dpbGxFbnRlci1mYWRle2FuaW1hdGlvbjpjb250ZXhpZnlfZmFkZUluIC4zcyBlYXNlfS5jb250ZXhpZnlfd2lsbExlYXZlLWZhZGV7YW5pbWF0aW9uOmNvbnRleGlmeV9mYWRlT3V0IC4zcyBlYXNlfUBrZXlmcmFtZXMgY29udGV4aWZ5X2ZsaXBJblh7MCV7dHJhbnNmb3JtOnBlcnNwZWN0aXZlKDgwMHB4KSByb3RhdGVYKDQ1ZGVnKX10b3t0cmFuc2Zvcm06cGVyc3BlY3RpdmUoODAwcHgpfX1Aa2V5ZnJhbWVzIGNvbnRleGlmeV9mbGlwT3V0WHswJXt0cmFuc2Zvcm06cGVyc3BlY3RpdmUoODAwcHgpfXRve3RyYW5zZm9ybTpwZXJzcGVjdGl2ZSg4MDBweCkgcm90YXRlWCg0NWRlZyk7b3BhY2l0eTowfX0uY29udGV4aWZ5X3dpbGxFbnRlci1mbGlwe2FuaW1hdGlvbjpjb250ZXhpZnlfZmxpcEluWCAuM3N9LmNvbnRleGlmeV93aWxsRW50ZXItZmxpcCwuY29udGV4aWZ5X3dpbGxMZWF2ZS1mbGlwe2JhY2tmYWNlLXZpc2liaWxpdHk6dmlzaWJsZSFpbXBvcnRhbnQ7dHJhbnNmb3JtLW9yaWdpbjp0b3AgY2VudGVyfS5jb250ZXhpZnlfd2lsbExlYXZlLWZsaXB7YW5pbWF0aW9uOmNvbnRleGlmeV9mbGlwT3V0WCAuM3N9QGtleWZyYW1lcyBjb250ZXhpZnlfc2xpZGVJbnswJXtvcGFjaXR5OjA7dHJhbnNmb3JtOnNjYWxlWSguMyl9dG97b3BhY2l0eToxfX1Aa2V5ZnJhbWVzIGNvbnRleGlmeV9zbGlkZU91dHswJXtvcGFjaXR5OjF9dG97b3BhY2l0eTowO3RyYW5zZm9ybTpzY2FsZVkoLjMpfX0uY29udGV4aWZ5X3dpbGxFbnRlci1zbGlkZXt0cmFuc2Zvcm0tb3JpZ2luOnRvcCBjZW50ZXI7YW5pbWF0aW9uOmNvbnRleGlmeV9zbGlkZUluIC4zc30uY29udGV4aWZ5X3dpbGxMZWF2ZS1zbGlkZXt0cmFuc2Zvcm0tb3JpZ2luOnRvcCBjZW50ZXI7YW5pbWF0aW9uOmNvbnRleGlmeV9zbGlkZU91dCAuM3N9YCwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9ub2RlX21vZHVsZXMvcmVhY3QtY29udGV4aWZ5L2Rpc3QvUmVhY3RDb250ZXhpZnkubWluLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQSxNQUFNLHNCQUFzQixDQUFDLCtCQUErQixDQUFDLDRCQUE0QixDQUFDLDJCQUEyQixDQUFDLDZCQUE2QixDQUFDLHdHQUF3RyxDQUFDLDREQUE0RCxDQUFDLDBDQUEwQyxDQUFDLGdDQUFnQyxDQUFDLG1DQUFtQyxDQUFDLGlDQUFpQyxDQUFDLDJCQUEyQixDQUFDLGlDQUFpQyxDQUFDLHNDQUFzQyxDQUFDLG1DQUFtQyxDQUFDLHNDQUFzQyxDQUFDLCtCQUErQixDQUFDLGtDQUFrQyxDQUFDLDhCQUE4QixHQUFHLFVBQVUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLFdBQVcsY0FBYyxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxxQkFBcUIsQ0FBc0IsZ0JBQWdCLENBQUMsOENBQThDLENBQUMscUJBQXFCLENBQUMsdUNBQXVDLENBQUMsMENBQTBDLENBQUMscUNBQXFDLENBQUMsd0NBQXdDLENBQUMsK0JBQStCLENBQUMsMkVBQTJFLHVDQUF1QyxDQUFDLG9EQUFvRCxDQUFDLGdEQUFnRCxDQUFDLHNFQUFzRSx3Q0FBd0MsQ0FBQyw2Q0FBNkMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLDhCQUE4QixpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyx3QkFBd0IsQ0FBQyxrREFBa0QsQ0FBQyxTQUFTLENBQUMscUNBQXFDLHFEQUFxRCxDQUFDLFNBQVMsQ0FBQyxvQ0FBb0MsVUFBVSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsZ0JBQWdCLENBQXFCLFlBQVksQ0FBQyxzQ0FBc0MsQ0FBQyxxQkFBcUIsVUFBVSxDQUFDLGNBQWMsQ0FBQyx3Q0FBd0MsQ0FBQyxpREFBaUQsQ0FBQyw4QkFBOEIsbUJBQW1CLENBQUMsZ0JBQWdCLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxzQkFBc0IsU0FBUyxDQUFDLDJJQUEySSw0Q0FBNEMsQ0FBQyx5R0FBeUcsa0NBQWtDLENBQUMsa1VBQWtVLHdDQUF3QyxDQUFDLHNKQUFzSix1Q0FBdUMsQ0FBQyxvREFBb0QsQ0FBQyxnREFBZ0QsQ0FBQyx1RUFBdUUsbUJBQW1CLENBQUMsU0FBUyxDQUFDLHlCQUF5QixjQUFjLENBQUMsVUFBVSxDQUFDLHVCQUF1Qiw0Q0FBNEMsQ0FBcUIsWUFBWSxDQUF1QixrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxpQ0FBaUMsQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBeUIsc0NBQXNDLENBQUMsc0JBQXNCLDJDQUEyQyxDQUFDLG1DQUFtQyxDQUFDLDJCQUEyQixDQUFDLHVCQUF1QixnQ0FBZ0MsQ0FBQywyQkFBMkIsQ0FBQyxvQ0FBb0MsQ0FBQyxzQ0FBc0MsQ0FBQyx5Q0FBeUMsQ0FBQyxzQ0FBc0MsQ0FBQyw2QkFBNkIsR0FBRyxTQUFTLENBQUMsMkJBQTJCLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyw4QkFBOEIsR0FBRyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUMsMkJBQTJCLENBQUMsQ0FBQywyQkFBMkIseUJBQXlCLENBQUMsK0JBQStCLENBQUMsMkJBQTJCLHlCQUF5QixDQUFDLGdDQUFnQyxDQUFDLDRCQUE0QixHQUFHLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLDZCQUE2QixHQUFHLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLDBCQUEwQixtQ0FBbUMsQ0FBQywwQkFBMEIsb0NBQW9DLENBQUMsNkJBQTZCLEdBQUcsMkNBQTJDLENBQUMsR0FBRyw0QkFBNEIsQ0FBQyxDQUFDLDhCQUE4QixHQUFHLDRCQUE0QixDQUFDLEdBQUcsMkNBQTJDLENBQUMsU0FBUyxDQUFDLENBQUMsMEJBQTBCLCtCQUErQixDQUFDLG9EQUFrRyxxQ0FBcUMsQ0FBQywyQkFBMkIsQ0FBQywwQkFBMEIsZ0NBQWdDLENBQUMsNkJBQTZCLEdBQUcsU0FBUyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsOEJBQThCLEdBQUcsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLG9CQUFvQixDQUFDLENBQUMsMkJBQTJCLDJCQUEyQixDQUFDLCtCQUErQixDQUFDLDJCQUEyQiwyQkFBMkIsQ0FBQyxnQ0FBZ0NcIixcInNvdXJjZXNDb250ZW50XCI6W1wiOnJvb3R7LS1jb250ZXhpZnktekluZGV4OjY2NjstLWNvbnRleGlmeS1tZW51LW1pbldpZHRoOjIyMHB4Oy0tY29udGV4aWZ5LW1lbnUtcGFkZGluZzo2cHg7LS1jb250ZXhpZnktbWVudS1yYWRpdXM6NnB4Oy0tY29udGV4aWZ5LW1lbnUtYmdDb2xvcjojZmZmOy0tY29udGV4aWZ5LW1lbnUtc2hhZG93OjFweCAycHggMnB4IHJnYmEoMCwwLDAsLjEpLDJweCA0cHggNHB4IHJnYmEoMCwwLDAsLjEpLDNweCA2cHggNnB4IHJnYmEoMCwwLDAsLjEpOy0tY29udGV4aWZ5LW1lbnUtbmVnYXRlUGFkZGluZzp2YXIoLS1jb250ZXhpZnktbWVudS1wYWRkaW5nKTstLWNvbnRleGlmeS1zZXBhcmF0b3ItY29sb3I6cmdiYSgwLDAsMCwuMik7LS1jb250ZXhpZnktc2VwYXJhdG9yLW1hcmdpbjo1cHg7LS1jb250ZXhpZnktaXRlbUNvbnRlbnQtcGFkZGluZzo2cHg7LS1jb250ZXhpZnktYWN0aXZlSXRlbS1yYWRpdXM6NHB4Oy0tY29udGV4aWZ5LWl0ZW0tY29sb3I6IzMzMzstLWNvbnRleGlmeS1hY3RpdmVJdGVtLWNvbG9yOiNmZmY7LS1jb250ZXhpZnktYWN0aXZlSXRlbS1iZ0NvbG9yOiMzNDk4ZGI7LS1jb250ZXhpZnktcmlnaHRTbG90LWNvbG9yOiM2ZjZlNzc7LS1jb250ZXhpZnktYWN0aXZlUmlnaHRTbG90LWNvbG9yOiNmZmY7LS1jb250ZXhpZnktYXJyb3ctY29sb3I6IzZmNmU3NzstLWNvbnRleGlmeS1hY3RpdmVBcnJvdy1jb2xvcjojZmZmfUBrZXlmcmFtZXMgY29udGV4aWZ5X2ZlZWRiYWNrezAle29wYWNpdHk6LjR9dG97b3BhY2l0eToxfX0uY29udGV4aWZ5e3Bvc2l0aW9uOmZpeGVkO29wYWNpdHk6MDstd2Via2l0LXVzZXItc2VsZWN0Om5vbmU7LW1vei11c2VyLXNlbGVjdDpub25lOy1tcy11c2VyLXNlbGVjdDpub25lO3VzZXItc2VsZWN0Om5vbmU7YmFja2dyb3VuZC1jb2xvcjp2YXIoLS1jb250ZXhpZnktbWVudS1iZ0NvbG9yKTtib3gtc2l6aW5nOmJvcmRlci1ib3g7Ym94LXNoYWRvdzp2YXIoLS1jb250ZXhpZnktbWVudS1zaGFkb3cpO2JvcmRlci1yYWRpdXM6dmFyKC0tY29udGV4aWZ5LW1lbnUtcmFkaXVzKTtwYWRkaW5nOnZhcigtLWNvbnRleGlmeS1tZW51LXBhZGRpbmcpO21pbi13aWR0aDp2YXIoLS1jb250ZXhpZnktbWVudS1taW5XaWR0aCk7ei1pbmRleDp2YXIoLS1jb250ZXhpZnktekluZGV4KX0uY29udGV4aWZ5X3N1Ym1lbnUtaXNPcGVuLC5jb250ZXhpZnlfc3VibWVudS1pc09wZW4+LmNvbnRleGlmeV9pdGVtQ29udGVudHtjb2xvcjp2YXIoLS1jb250ZXhpZnktYWN0aXZlSXRlbS1jb2xvcik7YmFja2dyb3VuZC1jb2xvcjp2YXIoLS1jb250ZXhpZnktYWN0aXZlSXRlbS1iZ0NvbG9yKTtib3JkZXItcmFkaXVzOnZhcigtLWNvbnRleGlmeS1hY3RpdmVJdGVtLXJhZGl1cyl9LmNvbnRleGlmeV9zdWJtZW51LWlzT3Blbj4uY29udGV4aWZ5X2l0ZW1Db250ZW50IC5jb250ZXhpZnlfcmlnaHRTbG90e2NvbG9yOnZhcigtLWNvbnRleGlmeS1hY3RpdmVBcnJvdy1jb2xvcil9LmNvbnRleGlmeV9zdWJtZW51LWlzT3Blbj4uY29udGV4aWZ5X3N1Ym1lbnV7cG9pbnRlci1ldmVudHM6YXV0bztvcGFjaXR5OjF9LmNvbnRleGlmeSAuY29udGV4aWZ5X3N1Ym1lbnV7cG9zaXRpb246YWJzb2x1dGU7cG9pbnRlci1ldmVudHM6bm9uZTt0cmFuc2l0aW9uOm9wYWNpdHkgLjI2NXM7dG9wOmNhbGMoLTEgKiB2YXIoLS1jb250ZXhpZnktbWVudS1uZWdhdGVQYWRkaW5nKSk7bGVmdDoxMDAlfS5jb250ZXhpZnkgLmNvbnRleGlmeV9zdWJtZW51LWJvdHRvbXtib3R0b206Y2FsYygtMSAqIHZhcigtLWNvbnRleGlmeS1tZW51LW5lZ2F0ZVBhZGRpbmcpKTt0b3A6dW5zZXR9LmNvbnRleGlmeSAuY29udGV4aWZ5X3N1Ym1lbnUtcmlnaHR7cmlnaHQ6MTAwJTtsZWZ0OnVuc2V0fS5jb250ZXhpZnlfcmlnaHRTbG90e21hcmdpbi1sZWZ0OmF1dG87ZGlzcGxheTotbXMtZmxleGJveDtkaXNwbGF5OmZsZXg7Y29sb3I6dmFyKC0tY29udGV4aWZ5LXJpZ2h0U2xvdC1jb2xvcil9LmNvbnRleGlmeV9zZXBhcmF0b3J7aGVpZ2h0OjFweDtjdXJzb3I6ZGVmYXVsdDttYXJnaW46dmFyKC0tY29udGV4aWZ5LXNlcGFyYXRvci1tYXJnaW4pO2JhY2tncm91bmQtY29sb3I6dmFyKC0tY29udGV4aWZ5LXNlcGFyYXRvci1jb2xvcil9LmNvbnRleGlmeV93aWxsTGVhdmUtZGlzYWJsZWR7cG9pbnRlci1ldmVudHM6bm9uZX0uY29udGV4aWZ5X2l0ZW17Y3Vyc29yOnBvaW50ZXI7cG9zaXRpb246cmVsYXRpdmV9LmNvbnRleGlmeV9pdGVtOmZvY3Vze291dGxpbmU6MH0uY29udGV4aWZ5X2l0ZW06Zm9jdXMgLmNvbnRleGlmeV9yaWdodFNsb3QsLmNvbnRleGlmeV9pdGVtOm5vdCguY29udGV4aWZ5X2l0ZW0tZGlzYWJsZWQpOmhvdmVyPi5jb250ZXhpZnlfaXRlbUNvbnRlbnQgLmNvbnRleGlmeV9yaWdodFNsb3R7Y29sb3I6dmFyKC0tY29udGV4aWZ5LWFjdGl2ZVJpZ2h0U2xvdC1jb2xvcil9LmNvbnRleGlmeV9pdGVtOm5vdCguY29udGV4aWZ5X2l0ZW0tZGlzYWJsZWQpW2FyaWEtaGFzcG9wdXBdPi5jb250ZXhpZnlfaXRlbUNvbnRlbnQgLmNvbnRleGlmeV9yaWdodFNsb3R7Y29sb3I6dmFyKC0tY29udGV4aWZ5LWFycm93LWNvbG9yKX0uY29udGV4aWZ5X2l0ZW06bm90KC5jb250ZXhpZnlfaXRlbS1kaXNhYmxlZClbYXJpYS1oYXNwb3B1cF0uY29udGV4aWZ5X3N1Ym1lbnUtaXNPcGVuPi5jb250ZXhpZnlfaXRlbUNvbnRlbnQgLmNvbnRleGlmeV9yaWdodFNsb3QsLmNvbnRleGlmeV9pdGVtOm5vdCguY29udGV4aWZ5X2l0ZW0tZGlzYWJsZWQpW2FyaWEtaGFzcG9wdXBdOmhvdmVyPi5jb250ZXhpZnlfaXRlbUNvbnRlbnQgLmNvbnRleGlmeV9yaWdodFNsb3QsLmNvbnRleGlmeV9pdGVtW2FyaWEtaGFzcG9wdXBdOmZvY3VzPi5jb250ZXhpZnlfaXRlbUNvbnRlbnQgLmNvbnRleGlmeV9yaWdodFNsb3R7Y29sb3I6dmFyKC0tY29udGV4aWZ5LWFjdGl2ZUFycm93LWNvbG9yKX0uY29udGV4aWZ5X2l0ZW06bm90KC5jb250ZXhpZnlfaXRlbS1kaXNhYmxlZCk6Zm9jdXM+LmNvbnRleGlmeV9pdGVtQ29udGVudCwuY29udGV4aWZ5X2l0ZW06bm90KC5jb250ZXhpZnlfaXRlbS1kaXNhYmxlZCk6aG92ZXI+LmNvbnRleGlmeV9pdGVtQ29udGVudHtjb2xvcjp2YXIoLS1jb250ZXhpZnktYWN0aXZlSXRlbS1jb2xvcik7YmFja2dyb3VuZC1jb2xvcjp2YXIoLS1jb250ZXhpZnktYWN0aXZlSXRlbS1iZ0NvbG9yKTtib3JkZXItcmFkaXVzOnZhcigtLWNvbnRleGlmeS1hY3RpdmVJdGVtLXJhZGl1cyl9LmNvbnRleGlmeV9pdGVtOm5vdCguY29udGV4aWZ5X2l0ZW0tZGlzYWJsZWQpOmhvdmVyPi5jb250ZXhpZnlfc3VibWVudXtwb2ludGVyLWV2ZW50czphdXRvO29wYWNpdHk6MX0uY29udGV4aWZ5X2l0ZW0tZGlzYWJsZWR7Y3Vyc29yOmRlZmF1bHQ7b3BhY2l0eTouNX0uY29udGV4aWZ5X2l0ZW1Db250ZW50e3BhZGRpbmc6dmFyKC0tY29udGV4aWZ5LWl0ZW1Db250ZW50LXBhZGRpbmcpO2Rpc3BsYXk6LW1zLWZsZXhib3g7ZGlzcGxheTpmbGV4Oy1tcy1mbGV4LWFsaWduOmNlbnRlcjthbGlnbi1pdGVtczpjZW50ZXI7d2hpdGUtc3BhY2U6bm93cmFwO2NvbG9yOnZhcigtLWNvbnRleGlmeS1pdGVtLWNvbG9yKTtwb3NpdGlvbjpyZWxhdGl2ZX0uY29udGV4aWZ5X2l0ZW0tZmVlZGJhY2t7YW5pbWF0aW9uOmNvbnRleGlmeV9mZWVkYmFjayAuMTJzIGJvdGh9LmNvbnRleGlmeV90aGVtZS1kYXJrey0tY29udGV4aWZ5LW1lbnUtYmdDb2xvcjpyZ2JhKDQwLDQwLDQwLC45OCk7LS1jb250ZXhpZnktc2VwYXJhdG9yLWNvbG9yOiM0YzRjNGM7LS1jb250ZXhpZnktaXRlbS1jb2xvcjojZmZmfS5jb250ZXhpZnlfdGhlbWUtbGlnaHR7LS1jb250ZXhpZnktc2VwYXJhdG9yLWNvbG9yOiNlZWU7LS1jb250ZXhpZnktaXRlbS1jb2xvcjojNjY2Oy0tY29udGV4aWZ5LWFjdGl2ZUl0ZW0tY29sb3I6IzM0OThkYjstLWNvbnRleGlmeS1hY3RpdmVJdGVtLWJnQ29sb3I6I2UwZWVmZDstLWNvbnRleGlmeS1hY3RpdmVSaWdodFNsb3QtY29sb3I6IzM0OThkYjstLWNvbnRleGlmeS1hY3RpdmUtYXJyb3ctY29sb3I6IzM0OThkYn1Aa2V5ZnJhbWVzIGNvbnRleGlmeV9zY2FsZUluezAle29wYWNpdHk6MDt0cmFuc2Zvcm06c2NhbGUzZCguMywuMywuMyl9dG97b3BhY2l0eToxfX1Aa2V5ZnJhbWVzIGNvbnRleGlmeV9zY2FsZU91dHswJXtvcGFjaXR5OjF9dG97b3BhY2l0eTowO3RyYW5zZm9ybTpzY2FsZTNkKC4zLC4zLC4zKX19LmNvbnRleGlmeV93aWxsRW50ZXItc2NhbGV7dHJhbnNmb3JtLW9yaWdpbjp0b3AgbGVmdDthbmltYXRpb246Y29udGV4aWZ5X3NjYWxlSW4gLjNzfS5jb250ZXhpZnlfd2lsbExlYXZlLXNjYWxle3RyYW5zZm9ybS1vcmlnaW46dG9wIGxlZnQ7YW5pbWF0aW9uOmNvbnRleGlmeV9zY2FsZU91dCAuM3N9QGtleWZyYW1lcyBjb250ZXhpZnlfZmFkZUluezAle29wYWNpdHk6MDt0cmFuc2Zvcm06dHJhbnNsYXRlWSgxMHB4KX10b3tvcGFjaXR5OjE7dHJhbnNmb3JtOnRyYW5zbGF0ZVkoMCl9fUBrZXlmcmFtZXMgY29udGV4aWZ5X2ZhZGVPdXR7MCV7b3BhY2l0eToxO3RyYW5zZm9ybTp0cmFuc2xhdGVZKDApfXRve29wYWNpdHk6MDt0cmFuc2Zvcm06dHJhbnNsYXRlWSgxMHB4KX19LmNvbnRleGlmeV93aWxsRW50ZXItZmFkZXthbmltYXRpb246Y29udGV4aWZ5X2ZhZGVJbiAuM3MgZWFzZX0uY29udGV4aWZ5X3dpbGxMZWF2ZS1mYWRle2FuaW1hdGlvbjpjb250ZXhpZnlfZmFkZU91dCAuM3MgZWFzZX1Aa2V5ZnJhbWVzIGNvbnRleGlmeV9mbGlwSW5YezAle3RyYW5zZm9ybTpwZXJzcGVjdGl2ZSg4MDBweCkgcm90YXRlWCg0NWRlZyl9dG97dHJhbnNmb3JtOnBlcnNwZWN0aXZlKDgwMHB4KX19QGtleWZyYW1lcyBjb250ZXhpZnlfZmxpcE91dFh7MCV7dHJhbnNmb3JtOnBlcnNwZWN0aXZlKDgwMHB4KX10b3t0cmFuc2Zvcm06cGVyc3BlY3RpdmUoODAwcHgpIHJvdGF0ZVgoNDVkZWcpO29wYWNpdHk6MH19LmNvbnRleGlmeV93aWxsRW50ZXItZmxpcHthbmltYXRpb246Y29udGV4aWZ5X2ZsaXBJblggLjNzfS5jb250ZXhpZnlfd2lsbEVudGVyLWZsaXAsLmNvbnRleGlmeV93aWxsTGVhdmUtZmxpcHstd2Via2l0LWJhY2tmYWNlLXZpc2liaWxpdHk6dmlzaWJsZSFpbXBvcnRhbnQ7YmFja2ZhY2UtdmlzaWJpbGl0eTp2aXNpYmxlIWltcG9ydGFudDt0cmFuc2Zvcm0tb3JpZ2luOnRvcCBjZW50ZXJ9LmNvbnRleGlmeV93aWxsTGVhdmUtZmxpcHthbmltYXRpb246Y29udGV4aWZ5X2ZsaXBPdXRYIC4zc31Aa2V5ZnJhbWVzIGNvbnRleGlmeV9zbGlkZUluezAle29wYWNpdHk6MDt0cmFuc2Zvcm06c2NhbGVZKC4zKX10b3tvcGFjaXR5OjF9fUBrZXlmcmFtZXMgY29udGV4aWZ5X3NsaWRlT3V0ezAle29wYWNpdHk6MX10b3tvcGFjaXR5OjA7dHJhbnNmb3JtOnNjYWxlWSguMyl9fS5jb250ZXhpZnlfd2lsbEVudGVyLXNsaWRle3RyYW5zZm9ybS1vcmlnaW46dG9wIGNlbnRlcjthbmltYXRpb246Y29udGV4aWZ5X3NsaWRlSW4gLjNzfS5jb250ZXhpZnlfd2lsbExlYXZlLXNsaWRle3RyYW5zZm9ybS1vcmlnaW46dG9wIGNlbnRlcjthbmltYXRpb246Y29udGV4aWZ5X3NsaWRlT3V0IC4zc31cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9