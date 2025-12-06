"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[7390],{

/***/ 6634:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   R: () => (/* binding */ warn)
/* harmony export */ });
/* eslint no-console: 0 */
var isDev = "development" !== 'production';
var warn = function warn(condition, format) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }
  if (isDev && typeof console !== 'undefined' && console.warn) {
    if (format === undefined) {
      console.warn('LogUtils requires an error message argument');
    }
    if (!condition) {
      if (format === undefined) {
        console.warn('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
      } else {
        var argIndex = 0;
        console.warn(format.replace(/%s/g, () => args[argIndex++]));
      }
    }
  }
};

/***/ }),

/***/ 14040:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   IZ: () => (/* binding */ polarToCartesian),
/* harmony export */   Kg: () => (/* binding */ RADIAN),
/* harmony export */   Zk: () => (/* binding */ getTickClassName),
/* harmony export */   lY: () => (/* binding */ getMaxRadius),
/* harmony export */   yy: () => (/* binding */ inRangeOfSector),
/* harmony export */   zh: () => (/* binding */ degreeToRadian)
/* harmony export */ });
/* unused harmony exports radianToDegree, distanceBetweenPoints, getAngleOfPoint, formatAngleOfSector */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

var RADIAN = Math.PI / 180;
var degreeToRadian = angle => angle * Math.PI / 180;
var radianToDegree = angleInRadian => angleInRadian * 180 / Math.PI;
var polarToCartesian = (cx, cy, radius, angle) => ({
  x: cx + Math.cos(-RADIAN * angle) * radius,
  y: cy + Math.sin(-RADIAN * angle) * radius
});
var getMaxRadius = function getMaxRadius(width, height) {
  var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    brushBottom: 0
  };
  return Math.min(Math.abs(width - (offset.left || 0) - (offset.right || 0)), Math.abs(height - (offset.top || 0) - (offset.bottom || 0))) / 2;
};
var distanceBetweenPoints = (point, anotherPoint) => {
  var {
    x: x1,
    y: y1
  } = point;
  var {
    x: x2,
    y: y2
  } = anotherPoint;
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
};
var getAngleOfPoint = (_ref, _ref2) => {
  var {
    x,
    y
  } = _ref;
  var {
    cx,
    cy
  } = _ref2;
  var radius = distanceBetweenPoints({
    x,
    y
  }, {
    x: cx,
    y: cy
  });
  if (radius <= 0) {
    return {
      radius,
      angle: 0
    };
  }
  var cos = (x - cx) / radius;
  var angleInRadian = Math.acos(cos);
  if (y > cy) {
    angleInRadian = 2 * Math.PI - angleInRadian;
  }
  return {
    radius,
    angle: radianToDegree(angleInRadian),
    angleInRadian
  };
};
var formatAngleOfSector = _ref3 => {
  var {
    startAngle,
    endAngle
  } = _ref3;
  var startCnt = Math.floor(startAngle / 360);
  var endCnt = Math.floor(endAngle / 360);
  var min = Math.min(startCnt, endCnt);
  return {
    startAngle: startAngle - min * 360,
    endAngle: endAngle - min * 360
  };
};
var reverseFormatAngleOfSector = (angle, _ref4) => {
  var {
    startAngle,
    endAngle
  } = _ref4;
  var startCnt = Math.floor(startAngle / 360);
  var endCnt = Math.floor(endAngle / 360);
  var min = Math.min(startCnt, endCnt);
  return angle + min * 360;
};
var inRangeOfSector = (_ref5, viewBox) => {
  var {
    x,
    y
  } = _ref5;
  var {
    radius,
    angle
  } = getAngleOfPoint({
    x,
    y
  }, viewBox);
  var {
    innerRadius,
    outerRadius
  } = viewBox;
  if (radius < innerRadius || radius > outerRadius) {
    return null;
  }
  if (radius === 0) {
    return null;
  }
  var {
    startAngle,
    endAngle
  } = formatAngleOfSector(viewBox);
  var formatAngle = angle;
  var inRange;
  if (startAngle <= endAngle) {
    while (formatAngle > endAngle) {
      formatAngle -= 360;
    }
    while (formatAngle < startAngle) {
      formatAngle += 360;
    }
    inRange = formatAngle >= startAngle && formatAngle <= endAngle;
  } else {
    while (formatAngle > startAngle) {
      formatAngle -= 360;
    }
    while (formatAngle < endAngle) {
      formatAngle += 360;
    }
    inRange = formatAngle >= endAngle && formatAngle <= startAngle;
  }
  if (inRange) {
    return _objectSpread(_objectSpread({}, viewBox), {}, {
      radius,
      angle: reverseFormatAngleOfSector(formatAngle, viewBox)
    });
  }
  return null;
};
var getTickClassName = tick => ! /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(tick) && typeof tick !== 'function' && typeof tick !== 'boolean' && tick != null ? tick.className : '';

/***/ }),

/***/ 17561:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   B: () => (/* binding */ getEveryNthWithCondition)
/* harmony export */ });
/**
 * Given an array and a number N, return a new array which contains every nTh
 * element of the input array. For n below 1, an empty array is returned.
 * If isValid is provided, all candidates must suffice the condition, else undefined is returned.
 * @param {T[]} array An input array.
 * @param {integer} n A number
 * @param {Function} isValid A function to evaluate a candidate form the array
 * @returns {T[]} The result array of the same type as the input array.
 */
function getEveryNthWithCondition(array, n, isValid) {
  if (n < 1) {
    return [];
  }
  if (n === 1 && isValid === undefined) {
    return array;
  }
  var result = [];
  for (var i = 0; i < array.length; i += n) {
    if (isValid === undefined || isValid(array[i]) === true) {
      result.push(array[i]);
    } else {
      return undefined;
    }
  }
  return result;
}

/***/ }),

/***/ 23521:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   b: () => (/* binding */ shallowEqual)
/* harmony export */ });
function shallowEqual(a, b) {
  /* eslint-disable no-restricted-syntax */
  for (var key in a) {
    if ({}.hasOwnProperty.call(a, key) && (!{}.hasOwnProperty.call(b, key) || a[key] !== b[key])) {
      return false;
    }
  }
  for (var _key in b) {
    if ({}.hasOwnProperty.call(b, _key) && !{}.hasOwnProperty.call(a, _key)) {
      return false;
    }
  }
  return true;
}

/***/ }),

/***/ 28129:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   q: () => (/* binding */ isEventKey)
/* harmony export */ });
var EventKeys = ['dangerouslySetInnerHTML', 'onCopy', 'onCopyCapture', 'onCut', 'onCutCapture', 'onPaste', 'onPasteCapture', 'onCompositionEnd', 'onCompositionEndCapture', 'onCompositionStart', 'onCompositionStartCapture', 'onCompositionUpdate', 'onCompositionUpdateCapture', 'onFocus', 'onFocusCapture', 'onBlur', 'onBlurCapture', 'onChange', 'onChangeCapture', 'onBeforeInput', 'onBeforeInputCapture', 'onInput', 'onInputCapture', 'onReset', 'onResetCapture', 'onSubmit', 'onSubmitCapture', 'onInvalid', 'onInvalidCapture', 'onLoad', 'onLoadCapture', 'onError', 'onErrorCapture', 'onKeyDown', 'onKeyDownCapture', 'onKeyPress', 'onKeyPressCapture', 'onKeyUp', 'onKeyUpCapture', 'onAbort', 'onAbortCapture', 'onCanPlay', 'onCanPlayCapture', 'onCanPlayThrough', 'onCanPlayThroughCapture', 'onDurationChange', 'onDurationChangeCapture', 'onEmptied', 'onEmptiedCapture', 'onEncrypted', 'onEncryptedCapture', 'onEnded', 'onEndedCapture', 'onLoadedData', 'onLoadedDataCapture', 'onLoadedMetadata', 'onLoadedMetadataCapture', 'onLoadStart', 'onLoadStartCapture', 'onPause', 'onPauseCapture', 'onPlay', 'onPlayCapture', 'onPlaying', 'onPlayingCapture', 'onProgress', 'onProgressCapture', 'onRateChange', 'onRateChangeCapture', 'onSeeked', 'onSeekedCapture', 'onSeeking', 'onSeekingCapture', 'onStalled', 'onStalledCapture', 'onSuspend', 'onSuspendCapture', 'onTimeUpdate', 'onTimeUpdateCapture', 'onVolumeChange', 'onVolumeChangeCapture', 'onWaiting', 'onWaitingCapture', 'onAuxClick', 'onAuxClickCapture', 'onClick', 'onClickCapture', 'onContextMenu', 'onContextMenuCapture', 'onDoubleClick', 'onDoubleClickCapture', 'onDrag', 'onDragCapture', 'onDragEnd', 'onDragEndCapture', 'onDragEnter', 'onDragEnterCapture', 'onDragExit', 'onDragExitCapture', 'onDragLeave', 'onDragLeaveCapture', 'onDragOver', 'onDragOverCapture', 'onDragStart', 'onDragStartCapture', 'onDrop', 'onDropCapture', 'onMouseDown', 'onMouseDownCapture', 'onMouseEnter', 'onMouseLeave', 'onMouseMove', 'onMouseMoveCapture', 'onMouseOut', 'onMouseOutCapture', 'onMouseOver', 'onMouseOverCapture', 'onMouseUp', 'onMouseUpCapture', 'onSelect', 'onSelectCapture', 'onTouchCancel', 'onTouchCancelCapture', 'onTouchEnd', 'onTouchEndCapture', 'onTouchMove', 'onTouchMoveCapture', 'onTouchStart', 'onTouchStartCapture', 'onPointerDown', 'onPointerDownCapture', 'onPointerMove', 'onPointerMoveCapture', 'onPointerUp', 'onPointerUpCapture', 'onPointerCancel', 'onPointerCancelCapture', 'onPointerEnter', 'onPointerEnterCapture', 'onPointerLeave', 'onPointerLeaveCapture', 'onPointerOver', 'onPointerOverCapture', 'onPointerOut', 'onPointerOutCapture', 'onGotPointerCapture', 'onGotPointerCaptureCapture', 'onLostPointerCapture', 'onLostPointerCaptureCapture', 'onScroll', 'onScrollCapture', 'onWheel', 'onWheelCapture', 'onAnimationStart', 'onAnimationStartCapture', 'onAnimationEnd', 'onAnimationEndCapture', 'onAnimationIteration', 'onAnimationIterationCapture', 'onTransitionEnd', 'onTransitionEndCapture'];
function isEventKey(key) {
  if (typeof key !== 'string') {
    return false;
  }
  var allowedEventKeys = EventKeys;
  return allowedEventKeys.includes(key);
}

/***/ }),

/***/ 33298:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   N: () => (/* binding */ ScatterSymbol)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _shape_Symbols__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(65787);
/* harmony import */ var _ActiveShapeUtils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(80489);
var _excluded = ["option", "isActive"];
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }



function ScatterSymbol(_ref) {
  var {
      option,
      isActive
    } = _ref,
    props = _objectWithoutProperties(_ref, _excluded);
  if (typeof option === 'string') {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_ActiveShapeUtils__WEBPACK_IMPORTED_MODULE_2__/* .Shape */ .y, _extends({
      option: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Symbols__WEBPACK_IMPORTED_MODULE_1__/* .Symbols */ .i, _extends({
        type: option
      }, props)),
      isActive: isActive,
      shapeType: "symbols"
    }, props));
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_ActiveShapeUtils__WEBPACK_IMPORTED_MODULE_2__/* .Shape */ .y, _extends({
    option: option,
    isActive: isActive,
    shapeType: "symbols"
  }, props));
}

/***/ }),

/***/ 41389:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   K: () => (/* binding */ getCursorPoints)
/* harmony export */ });
/* harmony import */ var _PolarUtils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14040);
/* harmony import */ var _getRadialCursorPoints__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(68334);


function getCursorPoints(layout, activeCoordinate, offset) {
  var x1, y1, x2, y2;
  if (layout === 'horizontal') {
    x1 = activeCoordinate.x;
    x2 = x1;
    y1 = offset.top;
    y2 = offset.top + offset.height;
  } else if (layout === 'vertical') {
    y1 = activeCoordinate.y;
    y2 = y1;
    x1 = offset.left;
    x2 = offset.left + offset.width;
  } else if (activeCoordinate.cx != null && activeCoordinate.cy != null) {
    if (layout === 'centric') {
      var {
        cx,
        cy,
        innerRadius,
        outerRadius,
        angle
      } = activeCoordinate;
      var innerPoint = (0,_PolarUtils__WEBPACK_IMPORTED_MODULE_0__/* .polarToCartesian */ .IZ)(cx, cy, innerRadius, angle);
      var outerPoint = (0,_PolarUtils__WEBPACK_IMPORTED_MODULE_0__/* .polarToCartesian */ .IZ)(cx, cy, outerRadius, angle);
      x1 = innerPoint.x;
      y1 = innerPoint.y;
      x2 = outerPoint.x;
      y2 = outerPoint.y;
    } else {
      // @ts-expect-error TODO the state is marked as containing Coordinate but actually in polar charts it contains PolarCoordinate, we should keep the polar state separate
      return (0,_getRadialCursorPoints__WEBPACK_IMPORTED_MODULE_1__/* .getRadialCursorPoints */ .H)(activeCoordinate);
    }
  }
  return [{
    x: x1,
    y: y1
  }, {
    x: x2,
    y: y2
  }];
}

/***/ }),

/***/ 47767:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   q: () => (/* binding */ LRUCache)
/* harmony export */ });
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Simple LRU (Least Recently Used) cache implementation
 */
class LRUCache {
  constructor(maxSize) {
    _defineProperty(this, "cache", new Map());
    this.maxSize = maxSize;
  }
  get(key) {
    var value = this.cache.get(key);
    if (value !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      var firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  clear() {
    this.cache.clear();
  }
  size() {
    return this.cache.size;
  }
}

/***/ }),

/***/ 53820:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Di: () => (/* binding */ parseCornerRadius),
/* harmony export */   l: () => (/* binding */ RadialBarSector)
/* harmony export */ });
/* unused harmony export typeGuardSectorProps */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _ActiveShapeUtils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(80489);
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


function parseCornerRadius(cornerRadius) {
  if (typeof cornerRadius === 'string') {
    return parseInt(cornerRadius, 10);
  }
  return cornerRadius;
}

// Sector props is expecting cx, cy as numbers.
// When props are being spread in from a user defined component in RadialBar,
// the prop types of an SVGElement have these typed as string | number.
// This function will return the passed in props along with cx, cy as numbers.
function typeGuardSectorProps(option, props) {
  var cxValue = "".concat(props.cx || option.cx);
  var cx = Number(cxValue);
  var cyValue = "".concat(props.cy || option.cy);
  var cy = Number(cyValue);
  return _objectSpread(_objectSpread(_objectSpread({}, props), option), {}, {
    cx,
    cy
  });
}
function RadialBarSector(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_ActiveShapeUtils__WEBPACK_IMPORTED_MODULE_1__/* .Shape */ .y, _extends({
    shapeType: "sector",
    propTransformer: typeGuardSectorProps
  }, props));
}

/***/ }),

/***/ 57794:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   z: () => (/* binding */ getCalculatedYAxisWidth)
/* harmony export */ });
/**
 * Calculates the width of the Y-axis based on the tick labels and the axis label.
 * @param params - The parameters object.
 * @param [params.ticks] - An array-like object of tick elements, each with a `getBoundingClientRect` method.
 * @param [params.label] - The axis label element, with a `getBoundingClientRect` method.
 * @param [params.labelGapWithTick=5] - The gap between the label and the tick.
 * @param [params.tickSize=0] - The length of the tick line.
 * @param [params.tickMargin=0] - The margin between the tick line and the tick text.
 * @returns The calculated width of the Y-axis.
 */
var getCalculatedYAxisWidth = _ref => {
  var {
    ticks,
    label,
    labelGapWithTick = 5,
    // Default gap between label and tick
    tickSize = 0,
    tickMargin = 0
  } = _ref;
  // find the max width of the tick labels
  var maxTickWidth = 0;
  if (ticks) {
    Array.from(ticks).forEach(tickNode => {
      if (tickNode) {
        var bbox = tickNode.getBoundingClientRect();
        if (bbox.width > maxTickWidth) {
          maxTickWidth = bbox.width;
        }
      }
    });

    // calculate width of the axis label
    var labelWidth = label ? label.getBoundingClientRect().width : 0;
    var tickWidth = tickSize + tickMargin;

    // calculate the updated width of the y-axis
    var updatedYAxisWidth = maxTickWidth + tickWidth + labelWidth + (label ? labelGapWithTick : 0);
    return Math.round(updatedYAxisWidth);
  }
  return 0;
};

/***/ }),

/***/ 59938:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   m: () => (/* binding */ Global)
/* harmony export */ });
var parseIsSsrByDefault = () => !(typeof window !== 'undefined' && window.document && Boolean(window.document.createElement) && window.setTimeout);
var Global = {
  devToolsEnabled: false,
  isSsr: parseIsSsrByDefault()
};

/***/ }),

/***/ 68334:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   H: () => (/* binding */ getRadialCursorPoints)
/* harmony export */ });
/* harmony import */ var _PolarUtils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14040);

/**
 * Only applicable for radial layouts
 * @param {Object} activeCoordinate ChartCoordinate
 * @returns {Object} RadialCursorPoints
 */
function getRadialCursorPoints(activeCoordinate) {
  var {
    cx,
    cy,
    radius,
    startAngle,
    endAngle
  } = activeCoordinate;
  var startPoint = (0,_PolarUtils__WEBPACK_IMPORTED_MODULE_0__/* .polarToCartesian */ .IZ)(cx, cy, radius, startAngle);
  var endPoint = (0,_PolarUtils__WEBPACK_IMPORTED_MODULE_0__/* .polarToCartesian */ .IZ)(cx, cy, radius, endAngle);
  return {
    points: [startPoint, endPoint],
    cx,
    cy,
    radius,
    startAngle,
    endAngle
  };
}

/***/ }),

/***/ 74613:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   C: () => (/* binding */ getCursorRectangle)
/* harmony export */ });
function getCursorRectangle(layout, activeCoordinate, offset, tooltipAxisBandSize) {
  var halfSize = tooltipAxisBandSize / 2;
  return {
    stroke: 'none',
    fill: '#ccc',
    x: layout === 'horizontal' ? activeCoordinate.x - halfSize : offset.left + 0.5,
    y: layout === 'horizontal' ? offset.top + 0.5 : activeCoordinate.y - halfSize,
    width: layout === 'horizontal' ? tooltipAxisBandSize : offset.width - 1,
    height: layout === 'horizontal' ? offset.height - 1 : tooltipAxisBandSize
  };
}

/***/ }),

/***/ 79195:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   v: () => (/* binding */ getSliced)
/* harmony export */ });
function getSliced(arr, startIndex, endIndex) {
  if (!Array.isArray(arr)) {
    return arr;
  }
  if (arr && startIndex + endIndex !== 0) {
    return arr.slice(startIndex, endIndex + 1);
  }
  return arr;
}

/***/ }),

/***/ 80771:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HX: () => (/* binding */ getAngledTickWidth),
/* harmony export */   pB: () => (/* binding */ getNumberIntervalTicks),
/* harmony export */   y: () => (/* binding */ getTickBoundaries),
/* harmony export */   zN: () => (/* binding */ isVisible)
/* harmony export */ });
/* harmony import */ var _CartesianUtils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(15894);
/* harmony import */ var _getEveryNthWithCondition__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(17561);


function getAngledTickWidth(contentSize, unitSize, angle) {
  var size = {
    width: contentSize.width + unitSize.width,
    height: contentSize.height + unitSize.height
  };
  return (0,_CartesianUtils__WEBPACK_IMPORTED_MODULE_0__/* .getAngledRectangleWidth */ .bx)(size, angle);
}
function getTickBoundaries(viewBox, sign, sizeKey) {
  var isWidth = sizeKey === 'width';
  var {
    x,
    y,
    width,
    height
  } = viewBox;
  if (sign === 1) {
    return {
      start: isWidth ? x : y,
      end: isWidth ? x + width : y + height
    };
  }
  return {
    start: isWidth ? x + width : y + height,
    end: isWidth ? x : y
  };
}
function isVisible(sign, tickPosition, getSize, start, end) {
  /* Since getSize() is expensive (it reads the ticks' size from the DOM), we do this check first to avoid calculating
   * the tick's size. */
  if (sign * tickPosition < sign * start || sign * tickPosition > sign * end) {
    return false;
  }
  var size = getSize();
  return sign * (tickPosition - sign * size / 2 - start) >= 0 && sign * (tickPosition + sign * size / 2 - end) <= 0;
}
function getNumberIntervalTicks(ticks, interval) {
  return (0,_getEveryNthWithCondition__WEBPACK_IMPORTED_MODULE_1__/* .getEveryNthWithCondition */ .B)(ticks, interval + 1);
}

/***/ }),

/***/ 90013:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   l: () => (/* binding */ reduceCSSCalc)
/* harmony export */ });
/* unused harmony export safeEvaluateExpression */
/* harmony import */ var _DataUtils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(59744);

var MULTIPLY_OR_DIVIDE_REGEX = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([*/])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/;
var ADD_OR_SUBTRACT_REGEX = /(-?\d+(?:\.\d+)?[a-zA-Z%]*)([+-])(-?\d+(?:\.\d+)?[a-zA-Z%]*)/;
var CSS_LENGTH_UNIT_REGEX = /^px|cm|vh|vw|em|rem|%|mm|in|pt|pc|ex|ch|vmin|vmax|Q$/;
var NUM_SPLIT_REGEX = /(-?\d+(?:\.\d+)?)([a-zA-Z%]+)?/;
var CONVERSION_RATES = {
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  pt: 96 / 72,
  pc: 96 / 6,
  in: 96,
  Q: 96 / (2.54 * 40),
  px: 1
};
var FIXED_CSS_LENGTH_UNITS = Object.keys(CONVERSION_RATES);
var STR_NAN = 'NaN';
function convertToPx(value, unit) {
  return value * CONVERSION_RATES[unit];
}
class DecimalCSS {
  static parse(str) {
    var _NUM_SPLIT_REGEX$exec;
    var [, numStr, unit] = (_NUM_SPLIT_REGEX$exec = NUM_SPLIT_REGEX.exec(str)) !== null && _NUM_SPLIT_REGEX$exec !== void 0 ? _NUM_SPLIT_REGEX$exec : [];
    return new DecimalCSS(parseFloat(numStr), unit !== null && unit !== void 0 ? unit : '');
  }
  constructor(num, unit) {
    this.num = num;
    this.unit = unit;
    this.num = num;
    this.unit = unit;
    if ((0,_DataUtils__WEBPACK_IMPORTED_MODULE_0__/* .isNan */ .M8)(num)) {
      this.unit = '';
    }
    if (unit !== '' && !CSS_LENGTH_UNIT_REGEX.test(unit)) {
      this.num = NaN;
      this.unit = '';
    }
    if (FIXED_CSS_LENGTH_UNITS.includes(unit)) {
      this.num = convertToPx(num, unit);
      this.unit = 'px';
    }
  }
  add(other) {
    if (this.unit !== other.unit) {
      return new DecimalCSS(NaN, '');
    }
    return new DecimalCSS(this.num + other.num, this.unit);
  }
  subtract(other) {
    if (this.unit !== other.unit) {
      return new DecimalCSS(NaN, '');
    }
    return new DecimalCSS(this.num - other.num, this.unit);
  }
  multiply(other) {
    if (this.unit !== '' && other.unit !== '' && this.unit !== other.unit) {
      return new DecimalCSS(NaN, '');
    }
    return new DecimalCSS(this.num * other.num, this.unit || other.unit);
  }
  divide(other) {
    if (this.unit !== '' && other.unit !== '' && this.unit !== other.unit) {
      return new DecimalCSS(NaN, '');
    }
    return new DecimalCSS(this.num / other.num, this.unit || other.unit);
  }
  toString() {
    return "".concat(this.num).concat(this.unit);
  }
  isNaN() {
    return (0,_DataUtils__WEBPACK_IMPORTED_MODULE_0__/* .isNan */ .M8)(this.num);
  }
}
function calculateArithmetic(expr) {
  if (expr.includes(STR_NAN)) {
    return STR_NAN;
  }
  var newExpr = expr;
  while (newExpr.includes('*') || newExpr.includes('/')) {
    var _MULTIPLY_OR_DIVIDE_R;
    var [, leftOperand, operator, rightOperand] = (_MULTIPLY_OR_DIVIDE_R = MULTIPLY_OR_DIVIDE_REGEX.exec(newExpr)) !== null && _MULTIPLY_OR_DIVIDE_R !== void 0 ? _MULTIPLY_OR_DIVIDE_R : [];
    var lTs = DecimalCSS.parse(leftOperand !== null && leftOperand !== void 0 ? leftOperand : '');
    var rTs = DecimalCSS.parse(rightOperand !== null && rightOperand !== void 0 ? rightOperand : '');
    var result = operator === '*' ? lTs.multiply(rTs) : lTs.divide(rTs);
    if (result.isNaN()) {
      return STR_NAN;
    }
    newExpr = newExpr.replace(MULTIPLY_OR_DIVIDE_REGEX, result.toString());
  }
  while (newExpr.includes('+') || /.-\d+(?:\.\d+)?/.test(newExpr)) {
    var _ADD_OR_SUBTRACT_REGE;
    var [, _leftOperand, _operator, _rightOperand] = (_ADD_OR_SUBTRACT_REGE = ADD_OR_SUBTRACT_REGEX.exec(newExpr)) !== null && _ADD_OR_SUBTRACT_REGE !== void 0 ? _ADD_OR_SUBTRACT_REGE : [];
    var _lTs = DecimalCSS.parse(_leftOperand !== null && _leftOperand !== void 0 ? _leftOperand : '');
    var _rTs = DecimalCSS.parse(_rightOperand !== null && _rightOperand !== void 0 ? _rightOperand : '');
    var _result = _operator === '+' ? _lTs.add(_rTs) : _lTs.subtract(_rTs);
    if (_result.isNaN()) {
      return STR_NAN;
    }
    newExpr = newExpr.replace(ADD_OR_SUBTRACT_REGEX, _result.toString());
  }
  return newExpr;
}
var PARENTHESES_REGEX = /\(([^()]*)\)/;
function calculateParentheses(expr) {
  var newExpr = expr;
  var match;
  // eslint-disable-next-line no-cond-assign
  while ((match = PARENTHESES_REGEX.exec(newExpr)) != null) {
    var [, parentheticalExpression] = match;
    newExpr = newExpr.replace(PARENTHESES_REGEX, calculateArithmetic(parentheticalExpression));
  }
  return newExpr;
}
function evaluateExpression(expression) {
  var newExpr = expression.replace(/\s+/g, '');
  newExpr = calculateParentheses(newExpr);
  newExpr = calculateArithmetic(newExpr);
  return newExpr;
}
function safeEvaluateExpression(expression) {
  try {
    return evaluateExpression(expression);
  } catch (_unused) {
    return STR_NAN;
  }
}
function reduceCSSCalc(expression) {
  var result = safeEvaluateExpression(expression.slice(5, -1));
  if (result === STR_NAN) {
    return '';
  }
  return result;
}

/***/ }),

/***/ 91640:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   t: () => (/* binding */ FunnelTrapezoid)
/* harmony export */ });
/* unused harmony export typeGuardTrapezoidProps */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _ActiveShapeUtils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(80489);
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }



// Trapezoid props is expecting x, y, height as numbers.
// When props are being spread in from a user defined component in Funnel,
// the prop types of an SVGElement have these typed as string | number.
// This function will return the passed in props along with x, y, height as numbers.
function typeGuardTrapezoidProps(option, props) {
  var xValue = "".concat(props.x || option.x);
  var x = parseInt(xValue, 10);
  var yValue = "".concat(props.y || option.y);
  var y = parseInt(yValue, 10);
  var heightValue = "".concat((props === null || props === void 0 ? void 0 : props.height) || (option === null || option === void 0 ? void 0 : option.height));
  var height = parseInt(heightValue, 10);
  return _objectSpread(_objectSpread(_objectSpread({}, props), (0,_ActiveShapeUtils__WEBPACK_IMPORTED_MODULE_1__/* .getPropsFromShapeOption */ .R)(option)), {}, {
    height,
    x,
    y
  });
}
function FunnelTrapezoid(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_ActiveShapeUtils__WEBPACK_IMPORTED_MODULE_1__/* .Shape */ .y, _extends({
    shapeType: "trapezoid",
    propTransformer: typeGuardTrapezoidProps
  }, props));
}

/***/ }),

/***/ 94501:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   aS: () => (/* binding */ findAllByType),
/* harmony export */   y$: () => (/* binding */ isClipDot)
/* harmony export */ });
/* unused harmony exports SCALE_TYPES, getDisplayName, toArray */
/* harmony import */ var es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(80305);
/* harmony import */ var es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var react_is__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(44363);
/* harmony import */ var _DataUtils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(59744);




var SCALE_TYPES = (/* unused pure expression or super */ null && (['auto', 'linear', 'pow', 'sqrt', 'log', 'identity', 'time', 'band', 'point', 'ordinal', 'quantile', 'quantize', 'utc', 'sequential', 'threshold']));

/**
 * @deprecated instead find another approach that does not depend on displayName.
 * Get the display name of a component
 * @param  {Object} Comp Specified Component
 * @return {String}      Display name of Component
 */
var getDisplayName = Comp => {
  if (typeof Comp === 'string') {
    return Comp;
  }
  if (!Comp) {
    return '';
  }
  return Comp.displayName || Comp.name || 'Component';
};

// `toArray` gets called multiple times during the render
// so we can memoize last invocation (since reference to `children` is the same)
var lastChildren = null;
var lastResult = null;

/**
 * @deprecated instead find another approach that does not require reading React Elements from DOM.
 *
 * @param children do not use
 * @return deprecated do not use
 */
var toArray = children => {
  if (children === lastChildren && Array.isArray(lastResult)) {
    return lastResult;
  }
  var result = [];
  react__WEBPACK_IMPORTED_MODULE_1__.Children.forEach(children, child => {
    if ((0,_DataUtils__WEBPACK_IMPORTED_MODULE_3__/* .isNullish */ .uy)(child)) return;
    if ((0,react_is__WEBPACK_IMPORTED_MODULE_2__.isFragment)(child)) {
      result = result.concat(toArray(child.props.children));
    } else {
      // @ts-expect-error this could still be Iterable<ReactNode> and TS does not like that
      result.push(child);
    }
  });
  lastResult = result;
  lastChildren = children;
  return result;
};

/**
 * @deprecated instead find another approach that does not require reading React Elements from DOM.
 *
 * Find and return all matched children by type.
 * `type` must be a React.ComponentType
 *
 * @param children do not use
 * @param type do not use
 * @return deprecated do not use
 */
function findAllByType(children, type) {
  var result = [];
  var types = [];
  if (Array.isArray(type)) {
    types = type.map(t => getDisplayName(t));
  } else {
    types = [getDisplayName(type)];
  }
  toArray(children).forEach(child => {
    var childType = es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_0___default()(child, 'type.displayName') || es_toolkit_compat_get__WEBPACK_IMPORTED_MODULE_0___default()(child, 'type.name');
    // ts-expect-error toArray and lodash.get are not compatible. Let's get rid of the whole findAllByType function
    if (types.indexOf(childType) !== -1) {
      result.push(child);
    }
  });
  return result;
}
var isClipDot = dot => {
  if (dot && typeof dot === 'object' && 'clipDot' in dot) {
    return Boolean(dot.clipDot);
  }
  return true;
};

/***/ }),

/***/ 99516:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   w: () => (/* binding */ getChartPointer)
/* harmony export */ });
/**
 * Computes the chart coordinates from the mouse event.
 *
 * The coordinates are relative to the top-left corner of the chart,
 * where the top-left corner of the chart is (0, 0).
 * Moving right, the x-coordinate increases, and moving down, the y-coordinate increases.
 *
 * The coordinates are rounded to the nearest integer and are including a CSS transform scale.
 * So a chart that's scaled will return the same coordinates as a chart that's not scaled.
 *
 * @param event The mouse event from React event handlers
 * @return chartPointer The chart coordinates relative to the top-left corner of the chart
 */
var getChartPointer = event => {
  var rect = event.currentTarget.getBoundingClientRect();
  var scaleX = rect.width / event.currentTarget.offsetWidth;
  var scaleY = rect.height / event.currentTarget.offsetHeight;
  return {
    /*
     * Here it's important to use:
     * - event.clientX and event.clientY to get the mouse position relative to the viewport, including scroll.
     * - pageX and pageY are not used because they are relative to the whole document, and ignore scroll.
     * - rect.left and rect.top are used to get the position of the chart relative to the viewport.
     * - offsetX and offsetY are not used because they are relative to the offset parent
     *  which may or may not be the same as the clientX and clientY, depending on the position of the chart in the DOM
     *  and surrounding element styles. CSS position: relative, absolute, fixed, will change the offset parent.
     * - scaleX and scaleY are necessary for when the chart element is scaled using CSS `transform: scale(N)`.
     */
    chartX: Math.round((event.clientX - rect.left) / scaleX),
    chartY: Math.round((event.clientY - rect.top) / scaleY)
  };
};

/***/ }),

/***/ 99989:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   x: () => (/* binding */ getRadiusAndStrokeWidthFromDot)
/* harmony export */ });
/* harmony import */ var _svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(55448);

function getRadiusAndStrokeWidthFromDot(dot) {
  var props = (0,_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_0__/* .svgPropertiesNoEventsFromUnknown */ .ic)(dot);
  var defaultR = 3;
  var defaultStrokeWidth = 2;
  if (props != null) {
    var {
      r,
      strokeWidth
    } = props;
    var realR = Number(r);
    var realStrokeWidth = Number(strokeWidth);
    if (Number.isNaN(realR) || realR < 0) {
      realR = defaultR;
    }
    if (Number.isNaN(realStrokeWidth) || realStrokeWidth < 0) {
      realStrokeWidth = defaultStrokeWidth;
    }
    return {
      r: realR,
      strokeWidth: realStrokeWidth
    };
  }
  return {
    r: defaultR,
    strokeWidth: defaultStrokeWidth
  };
}

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi02YTA5MjQ4OC41OWU0NWY1YzE1ZTZjYTU1ODVjNi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBLFlBQVksYUFBb0I7QUFDekI7QUFDUCx5RkFBeUYsYUFBYTtBQUN0RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbURBQW1EO0FBQ25ELFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNuQkEseUJBQXlCLHdCQUF3QixvQ0FBb0MseUNBQXlDLGtDQUFrQywwREFBMEQsMEJBQTBCO0FBQ3BQLDRCQUE0QixnQkFBZ0Isc0JBQXNCLE9BQU8sa0RBQWtELHNEQUFzRCw4QkFBOEIsbUpBQW1KLHFFQUFxRSxLQUFLO0FBQzVhLG9DQUFvQyxvRUFBb0UsMERBQTBEO0FBQ2xLLDZCQUE2QixtQ0FBbUM7QUFDaEUsOEJBQThCLDBDQUEwQywrQkFBK0Isb0JBQW9CLG1DQUFtQyxvQ0FBb0MsdUVBQXVFO0FBQ2xPO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ1A7QUFDQTtBQUNBLENBQUM7QUFDTTtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxjQUFjO0FBQ3ZEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ08sOENBQThDLHFEQUFjLHdHOzs7Ozs7Ozs7O0FDakpuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsS0FBSztBQUNoQixXQUFXLFNBQVM7QUFDcEIsV0FBVyxVQUFVO0FBQ3JCLGFBQWEsS0FBSztBQUNsQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0Isa0JBQWtCO0FBQ3BDO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQSxDOzs7Ozs7Ozs7O0FDekJPO0FBQ1A7QUFDQTtBQUNBLFVBQVUsb0NBQW9DO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVSxvQ0FBb0M7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDOzs7Ozs7Ozs7O0FDYkE7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDOzs7Ozs7Ozs7Ozs7O0FDUEE7QUFDQSxzQkFBc0Isd0VBQXdFLGdCQUFnQixzQkFBc0IsT0FBTyxzQkFBc0Isb0JBQW9CLGdEQUFnRCxXQUFXO0FBQ2hQLDBDQUEwQywwQkFBMEIsbURBQW1ELG9DQUFvQyx5Q0FBeUMsWUFBWSxjQUFjLHdDQUF3QyxxREFBcUQ7QUFDM1QsK0NBQStDLDBCQUEwQixZQUFZLHVCQUF1Qiw4QkFBOEIsbUNBQW1DLGVBQWU7QUFDN0o7QUFDWTtBQUNBO0FBQ3BDO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSx3QkFBd0IsZ0RBQW1CLENBQUMsNkRBQUs7QUFDakQsMkJBQTJCLGdEQUFtQixDQUFDLDREQUFPO0FBQ3REO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxzQkFBc0IsZ0RBQW1CLENBQUMsNkRBQUs7QUFDL0M7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNILEM7Ozs7Ozs7Ozs7OztBQzNCaUQ7QUFDZTtBQUN6RDtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUix1QkFBdUIsdUVBQWdCO0FBQ3ZDLHVCQUF1Qix1RUFBZ0I7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxhQUFhLHNGQUFxQjtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsQzs7Ozs7Ozs7OztBQ3pDQSxvQ0FBb0Msb0VBQW9FLDBEQUEwRDtBQUNsSyw2QkFBNkIsbUNBQW1DO0FBQ2hFLDhCQUE4QiwwQ0FBMEMsK0JBQStCLG9CQUFvQixtQ0FBbUMsb0NBQW9DLHVFQUF1RTtBQUN6UTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQzs7Ozs7Ozs7Ozs7Ozs7QUNsQ0Esc0JBQXNCLHdFQUF3RSxnQkFBZ0Isc0JBQXNCLE9BQU8sc0JBQXNCLG9CQUFvQixnREFBZ0QsV0FBVztBQUNoUCx5QkFBeUIsd0JBQXdCLG9DQUFvQyx5Q0FBeUMsa0NBQWtDLDBEQUEwRCwwQkFBMEI7QUFDcFAsNEJBQTRCLGdCQUFnQixzQkFBc0IsT0FBTyxrREFBa0Qsc0RBQXNELDhCQUE4QixtSkFBbUoscUVBQXFFLEtBQUs7QUFDNWEsb0NBQW9DLG9FQUFvRSwwREFBMEQ7QUFDbEssNkJBQTZCLG1DQUFtQztBQUNoRSw4QkFBOEIsMENBQTBDLCtCQUErQixvQkFBb0IsbUNBQW1DLG9DQUFvQyx1RUFBdUU7QUFDMU87QUFDWTtBQUNwQztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscURBQXFELHFCQUFxQjtBQUMxRTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ087QUFDUCxzQkFBc0IsZ0RBQW1CLENBQUMsNkRBQUs7QUFDL0M7QUFDQTtBQUNBLEdBQUc7QUFDSCxDOzs7Ozs7Ozs7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFOzs7Ozs7Ozs7O0FDeENBO0FBQ087QUFDUDtBQUNBO0FBQ0EsRTs7Ozs7Ozs7Ozs7QUNKaUQ7QUFDakQ7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixhQUFhLFFBQVE7QUFDckI7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSixtQkFBbUIsdUVBQWdCO0FBQ25DLGlCQUFpQix1RUFBZ0I7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEM7Ozs7Ozs7Ozs7QUN4Qk87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDOzs7Ozs7Ozs7O0FDVk87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEM7Ozs7Ozs7Ozs7Ozs7OztBQ1IyRDtBQUNXO0FBQy9EO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLGtGQUF1QjtBQUNoQztBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQLFNBQVMsNEZBQXdCO0FBQ2pDLEM7Ozs7Ozs7Ozs7OztBQ3ZDb0M7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsMkRBQUs7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLDJEQUFLO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDOzs7Ozs7Ozs7Ozs7O0FDcElBLHNCQUFzQix3RUFBd0UsZ0JBQWdCLHNCQUFzQixPQUFPLHNCQUFzQixvQkFBb0IsZ0RBQWdELFdBQVc7QUFDaFAseUJBQXlCLHdCQUF3QixvQ0FBb0MseUNBQXlDLGtDQUFrQywwREFBMEQsMEJBQTBCO0FBQ3BQLDRCQUE0QixnQkFBZ0Isc0JBQXNCLE9BQU8sa0RBQWtELHNEQUFzRCw4QkFBOEIsbUpBQW1KLHFFQUFxRSxLQUFLO0FBQzVhLG9DQUFvQyxvRUFBb0UsMERBQTBEO0FBQ2xLLDZCQUE2QixtQ0FBbUM7QUFDaEUsOEJBQThCLDBDQUEwQywrQkFBK0Isb0JBQW9CLG1DQUFtQyxvQ0FBb0MsdUVBQXVFO0FBQzFPO0FBQ3FDOztBQUVwRTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscURBQXFELFVBQVUsbUZBQXVCLGFBQWE7QUFDbkc7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ087QUFDUCxzQkFBc0IsZ0RBQW1CLENBQUMsNkRBQUs7QUFDL0M7QUFDQTtBQUNBLEdBQUc7QUFDSCxDOzs7Ozs7Ozs7Ozs7Ozs7OztBQy9Cd0M7QUFDUDtBQUNLO0FBQ0U7QUFDakMsa0JBQWtCLGtNQUFrSjs7QUFFM0s7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksYUFBYTtBQUN6QjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSwyQ0FBUTtBQUNWLFFBQVEsK0RBQVM7QUFDakIsUUFBUSxvREFBVTtBQUNsQjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiw0REFBRywrQkFBK0IsNERBQUc7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFOzs7Ozs7Ozs7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRTs7Ozs7Ozs7Ozs7QUMvQjJFO0FBQ3BFO0FBQ1AsY0FBYyxrR0FBZ0M7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3V0aWwvTG9nVXRpbHMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3V0aWwvUG9sYXJVdGlscy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvdXRpbC9nZXRFdmVyeU50aFdpdGhDb25kaXRpb24uanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3V0aWwvU2hhbGxvd0VxdWFsLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi91dGlsL2V4Y2x1ZGVFdmVudFByb3BzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi91dGlsL1NjYXR0ZXJVdGlscy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvdXRpbC9jdXJzb3IvZ2V0Q3Vyc29yUG9pbnRzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi91dGlsL0xSVUNhY2hlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi91dGlsL1JhZGlhbEJhclV0aWxzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi91dGlsL1lBeGlzVXRpbHMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3V0aWwvR2xvYmFsLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi91dGlsL2N1cnNvci9nZXRSYWRpYWxDdXJzb3JQb2ludHMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3V0aWwvY3Vyc29yL2dldEN1cnNvclJlY3RhbmdsZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvdXRpbC9nZXRTbGljZWQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3V0aWwvVGlja1V0aWxzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi91dGlsL1JlZHVjZUNTU0NhbGMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3V0aWwvRnVubmVsVXRpbHMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3V0aWwvUmVhY3RVdGlscy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvdXRpbC9nZXRDaGFydFBvaW50ZXIuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3V0aWwvZ2V0UmFkaXVzQW5kU3Ryb2tlV2lkdGhGcm9tRG90LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludCBuby1jb25zb2xlOiAwICovXG52YXIgaXNEZXYgPSBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nO1xuZXhwb3J0IHZhciB3YXJuID0gZnVuY3Rpb24gd2Fybihjb25kaXRpb24sIGZvcm1hdCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuID4gMiA/IF9sZW4gLSAyIDogMCksIF9rZXkgPSAyOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgYXJnc1tfa2V5IC0gMl0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cbiAgaWYgKGlzRGV2ICYmIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlLndhcm4pIHtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnNvbGUud2FybignTG9nVXRpbHMgcmVxdWlyZXMgYW4gZXJyb3IgbWVzc2FnZSBhcmd1bWVudCcpO1xuICAgIH1cbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignTWluaWZpZWQgZXhjZXB0aW9uIG9jY3VycmVkOyB1c2UgdGhlIG5vbi1taW5pZmllZCBkZXYgZW52aXJvbm1lbnQgJyArICdmb3IgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZSBhbmQgYWRkaXRpb25hbCBoZWxwZnVsIHdhcm5pbmdzLicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGFyZ0luZGV4ID0gMDtcbiAgICAgICAgY29uc29sZS53YXJuKGZvcm1hdC5yZXBsYWNlKC8lcy9nLCAoKSA9PiBhcmdzW2FyZ0luZGV4KytdKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59OyIsImZ1bmN0aW9uIG93bktleXMoZSwgcikgeyB2YXIgdCA9IE9iamVjdC5rZXlzKGUpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IHIgJiYgKG8gPSBvLmZpbHRlcihmdW5jdGlvbiAocikgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCByKS5lbnVtZXJhYmxlOyB9KSksIHQucHVzaC5hcHBseSh0LCBvKTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZChlKSB7IGZvciAodmFyIHIgPSAxOyByIDwgYXJndW1lbnRzLmxlbmd0aDsgcisrKSB7IHZhciB0ID0gbnVsbCAhPSBhcmd1bWVudHNbcl0gPyBhcmd1bWVudHNbcl0gOiB7fTsgciAlIDIgPyBvd25LZXlzKE9iamVjdCh0KSwgITApLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgX2RlZmluZVByb3BlcnR5KGUsIHIsIHRbcl0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModCkpIDogb3duS2V5cyhPYmplY3QodCkpLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCwgcikpOyB9KTsgfSByZXR1cm4gZTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGUsIHIsIHQpIHsgcmV0dXJuIChyID0gX3RvUHJvcGVydHlLZXkocikpIGluIGUgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgeyB2YWx1ZTogdCwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSA6IGVbcl0gPSB0LCBlOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleSh0KSB7IHZhciBpID0gX3RvUHJpbWl0aXZlKHQsIFwic3RyaW5nXCIpOyByZXR1cm4gXCJzeW1ib2xcIiA9PSB0eXBlb2YgaSA/IGkgOiBpICsgXCJcIjsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKHQsIHIpIHsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIHQgfHwgIXQpIHJldHVybiB0OyB2YXIgZSA9IHRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHZvaWQgMCAhPT0gZSkgeyB2YXIgaSA9IGUuY2FsbCh0LCByIHx8IFwiZGVmYXVsdFwiKTsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIGkpIHJldHVybiBpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChcInN0cmluZ1wiID09PSByID8gU3RyaW5nIDogTnVtYmVyKSh0KTsgfVxuaW1wb3J0IHsgaXNWYWxpZEVsZW1lbnQgfSBmcm9tICdyZWFjdCc7XG5leHBvcnQgdmFyIFJBRElBTiA9IE1hdGguUEkgLyAxODA7XG5leHBvcnQgdmFyIGRlZ3JlZVRvUmFkaWFuID0gYW5nbGUgPT4gYW5nbGUgKiBNYXRoLlBJIC8gMTgwO1xuZXhwb3J0IHZhciByYWRpYW5Ub0RlZ3JlZSA9IGFuZ2xlSW5SYWRpYW4gPT4gYW5nbGVJblJhZGlhbiAqIDE4MCAvIE1hdGguUEk7XG5leHBvcnQgdmFyIHBvbGFyVG9DYXJ0ZXNpYW4gPSAoY3gsIGN5LCByYWRpdXMsIGFuZ2xlKSA9PiAoe1xuICB4OiBjeCArIE1hdGguY29zKC1SQURJQU4gKiBhbmdsZSkgKiByYWRpdXMsXG4gIHk6IGN5ICsgTWF0aC5zaW4oLVJBRElBTiAqIGFuZ2xlKSAqIHJhZGl1c1xufSk7XG5leHBvcnQgdmFyIGdldE1heFJhZGl1cyA9IGZ1bmN0aW9uIGdldE1heFJhZGl1cyh3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciBvZmZzZXQgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHtcbiAgICB0b3A6IDAsXG4gICAgcmlnaHQ6IDAsXG4gICAgYm90dG9tOiAwLFxuICAgIGxlZnQ6IDAsXG4gICAgd2lkdGg6IDAsXG4gICAgaGVpZ2h0OiAwLFxuICAgIGJydXNoQm90dG9tOiAwXG4gIH07XG4gIHJldHVybiBNYXRoLm1pbihNYXRoLmFicyh3aWR0aCAtIChvZmZzZXQubGVmdCB8fCAwKSAtIChvZmZzZXQucmlnaHQgfHwgMCkpLCBNYXRoLmFicyhoZWlnaHQgLSAob2Zmc2V0LnRvcCB8fCAwKSAtIChvZmZzZXQuYm90dG9tIHx8IDApKSkgLyAyO1xufTtcbmV4cG9ydCB2YXIgZGlzdGFuY2VCZXR3ZWVuUG9pbnRzID0gKHBvaW50LCBhbm90aGVyUG9pbnQpID0+IHtcbiAgdmFyIHtcbiAgICB4OiB4MSxcbiAgICB5OiB5MVxuICB9ID0gcG9pbnQ7XG4gIHZhciB7XG4gICAgeDogeDIsXG4gICAgeTogeTJcbiAgfSA9IGFub3RoZXJQb2ludDtcbiAgcmV0dXJuIE1hdGguc3FydCgoeDEgLSB4MikgKiogMiArICh5MSAtIHkyKSAqKiAyKTtcbn07XG5leHBvcnQgdmFyIGdldEFuZ2xlT2ZQb2ludCA9IChfcmVmLCBfcmVmMikgPT4ge1xuICB2YXIge1xuICAgIHgsXG4gICAgeVxuICB9ID0gX3JlZjtcbiAgdmFyIHtcbiAgICBjeCxcbiAgICBjeVxuICB9ID0gX3JlZjI7XG4gIHZhciByYWRpdXMgPSBkaXN0YW5jZUJldHdlZW5Qb2ludHMoe1xuICAgIHgsXG4gICAgeVxuICB9LCB7XG4gICAgeDogY3gsXG4gICAgeTogY3lcbiAgfSk7XG4gIGlmIChyYWRpdXMgPD0gMCkge1xuICAgIHJldHVybiB7XG4gICAgICByYWRpdXMsXG4gICAgICBhbmdsZTogMFxuICAgIH07XG4gIH1cbiAgdmFyIGNvcyA9ICh4IC0gY3gpIC8gcmFkaXVzO1xuICB2YXIgYW5nbGVJblJhZGlhbiA9IE1hdGguYWNvcyhjb3MpO1xuICBpZiAoeSA+IGN5KSB7XG4gICAgYW5nbGVJblJhZGlhbiA9IDIgKiBNYXRoLlBJIC0gYW5nbGVJblJhZGlhbjtcbiAgfVxuICByZXR1cm4ge1xuICAgIHJhZGl1cyxcbiAgICBhbmdsZTogcmFkaWFuVG9EZWdyZWUoYW5nbGVJblJhZGlhbiksXG4gICAgYW5nbGVJblJhZGlhblxuICB9O1xufTtcbmV4cG9ydCB2YXIgZm9ybWF0QW5nbGVPZlNlY3RvciA9IF9yZWYzID0+IHtcbiAgdmFyIHtcbiAgICBzdGFydEFuZ2xlLFxuICAgIGVuZEFuZ2xlXG4gIH0gPSBfcmVmMztcbiAgdmFyIHN0YXJ0Q250ID0gTWF0aC5mbG9vcihzdGFydEFuZ2xlIC8gMzYwKTtcbiAgdmFyIGVuZENudCA9IE1hdGguZmxvb3IoZW5kQW5nbGUgLyAzNjApO1xuICB2YXIgbWluID0gTWF0aC5taW4oc3RhcnRDbnQsIGVuZENudCk7XG4gIHJldHVybiB7XG4gICAgc3RhcnRBbmdsZTogc3RhcnRBbmdsZSAtIG1pbiAqIDM2MCxcbiAgICBlbmRBbmdsZTogZW5kQW5nbGUgLSBtaW4gKiAzNjBcbiAgfTtcbn07XG52YXIgcmV2ZXJzZUZvcm1hdEFuZ2xlT2ZTZWN0b3IgPSAoYW5nbGUsIF9yZWY0KSA9PiB7XG4gIHZhciB7XG4gICAgc3RhcnRBbmdsZSxcbiAgICBlbmRBbmdsZVxuICB9ID0gX3JlZjQ7XG4gIHZhciBzdGFydENudCA9IE1hdGguZmxvb3Ioc3RhcnRBbmdsZSAvIDM2MCk7XG4gIHZhciBlbmRDbnQgPSBNYXRoLmZsb29yKGVuZEFuZ2xlIC8gMzYwKTtcbiAgdmFyIG1pbiA9IE1hdGgubWluKHN0YXJ0Q250LCBlbmRDbnQpO1xuICByZXR1cm4gYW5nbGUgKyBtaW4gKiAzNjA7XG59O1xuZXhwb3J0IHZhciBpblJhbmdlT2ZTZWN0b3IgPSAoX3JlZjUsIHZpZXdCb3gpID0+IHtcbiAgdmFyIHtcbiAgICB4LFxuICAgIHlcbiAgfSA9IF9yZWY1O1xuICB2YXIge1xuICAgIHJhZGl1cyxcbiAgICBhbmdsZVxuICB9ID0gZ2V0QW5nbGVPZlBvaW50KHtcbiAgICB4LFxuICAgIHlcbiAgfSwgdmlld0JveCk7XG4gIHZhciB7XG4gICAgaW5uZXJSYWRpdXMsXG4gICAgb3V0ZXJSYWRpdXNcbiAgfSA9IHZpZXdCb3g7XG4gIGlmIChyYWRpdXMgPCBpbm5lclJhZGl1cyB8fCByYWRpdXMgPiBvdXRlclJhZGl1cykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChyYWRpdXMgPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIge1xuICAgIHN0YXJ0QW5nbGUsXG4gICAgZW5kQW5nbGVcbiAgfSA9IGZvcm1hdEFuZ2xlT2ZTZWN0b3Iodmlld0JveCk7XG4gIHZhciBmb3JtYXRBbmdsZSA9IGFuZ2xlO1xuICB2YXIgaW5SYW5nZTtcbiAgaWYgKHN0YXJ0QW5nbGUgPD0gZW5kQW5nbGUpIHtcbiAgICB3aGlsZSAoZm9ybWF0QW5nbGUgPiBlbmRBbmdsZSkge1xuICAgICAgZm9ybWF0QW5nbGUgLT0gMzYwO1xuICAgIH1cbiAgICB3aGlsZSAoZm9ybWF0QW5nbGUgPCBzdGFydEFuZ2xlKSB7XG4gICAgICBmb3JtYXRBbmdsZSArPSAzNjA7XG4gICAgfVxuICAgIGluUmFuZ2UgPSBmb3JtYXRBbmdsZSA+PSBzdGFydEFuZ2xlICYmIGZvcm1hdEFuZ2xlIDw9IGVuZEFuZ2xlO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChmb3JtYXRBbmdsZSA+IHN0YXJ0QW5nbGUpIHtcbiAgICAgIGZvcm1hdEFuZ2xlIC09IDM2MDtcbiAgICB9XG4gICAgd2hpbGUgKGZvcm1hdEFuZ2xlIDwgZW5kQW5nbGUpIHtcbiAgICAgIGZvcm1hdEFuZ2xlICs9IDM2MDtcbiAgICB9XG4gICAgaW5SYW5nZSA9IGZvcm1hdEFuZ2xlID49IGVuZEFuZ2xlICYmIGZvcm1hdEFuZ2xlIDw9IHN0YXJ0QW5nbGU7XG4gIH1cbiAgaWYgKGluUmFuZ2UpIHtcbiAgICByZXR1cm4gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCB2aWV3Qm94KSwge30sIHtcbiAgICAgIHJhZGl1cyxcbiAgICAgIGFuZ2xlOiByZXZlcnNlRm9ybWF0QW5nbGVPZlNlY3Rvcihmb3JtYXRBbmdsZSwgdmlld0JveClcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5leHBvcnQgdmFyIGdldFRpY2tDbGFzc05hbWUgPSB0aWNrID0+ICEgLyojX19QVVJFX18qL2lzVmFsaWRFbGVtZW50KHRpY2spICYmIHR5cGVvZiB0aWNrICE9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB0aWNrICE9PSAnYm9vbGVhbicgJiYgdGljayAhPSBudWxsID8gdGljay5jbGFzc05hbWUgOiAnJzsiLCIvKipcbiAqIEdpdmVuIGFuIGFycmF5IGFuZCBhIG51bWJlciBOLCByZXR1cm4gYSBuZXcgYXJyYXkgd2hpY2ggY29udGFpbnMgZXZlcnkgblRoXG4gKiBlbGVtZW50IG9mIHRoZSBpbnB1dCBhcnJheS4gRm9yIG4gYmVsb3cgMSwgYW4gZW1wdHkgYXJyYXkgaXMgcmV0dXJuZWQuXG4gKiBJZiBpc1ZhbGlkIGlzIHByb3ZpZGVkLCBhbGwgY2FuZGlkYXRlcyBtdXN0IHN1ZmZpY2UgdGhlIGNvbmRpdGlvbiwgZWxzZSB1bmRlZmluZWQgaXMgcmV0dXJuZWQuXG4gKiBAcGFyYW0ge1RbXX0gYXJyYXkgQW4gaW5wdXQgYXJyYXkuXG4gKiBAcGFyYW0ge2ludGVnZXJ9IG4gQSBudW1iZXJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGlzVmFsaWQgQSBmdW5jdGlvbiB0byBldmFsdWF0ZSBhIGNhbmRpZGF0ZSBmb3JtIHRoZSBhcnJheVxuICogQHJldHVybnMge1RbXX0gVGhlIHJlc3VsdCBhcnJheSBvZiB0aGUgc2FtZSB0eXBlIGFzIHRoZSBpbnB1dCBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEV2ZXJ5TnRoV2l0aENvbmRpdGlvbihhcnJheSwgbiwgaXNWYWxpZCkge1xuICBpZiAobiA8IDEpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgaWYgKG4gPT09IDEgJiYgaXNWYWxpZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGFycmF5O1xuICB9XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkgKz0gbikge1xuICAgIGlmIChpc1ZhbGlkID09PSB1bmRlZmluZWQgfHwgaXNWYWxpZChhcnJheVtpXSkgPT09IHRydWUpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGFycmF5W2ldKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn0iLCJleHBvcnQgZnVuY3Rpb24gc2hhbGxvd0VxdWFsKGEsIGIpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tcmVzdHJpY3RlZC1zeW50YXggKi9cbiAgZm9yICh2YXIga2V5IGluIGEpIHtcbiAgICBpZiAoe30uaGFzT3duUHJvcGVydHkuY2FsbChhLCBrZXkpICYmICghe30uaGFzT3duUHJvcGVydHkuY2FsbChiLCBrZXkpIHx8IGFba2V5XSAhPT0gYltrZXldKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmb3IgKHZhciBfa2V5IGluIGIpIHtcbiAgICBpZiAoe30uaGFzT3duUHJvcGVydHkuY2FsbChiLCBfa2V5KSAmJiAhe30uaGFzT3duUHJvcGVydHkuY2FsbChhLCBfa2V5KSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn0iLCJ2YXIgRXZlbnRLZXlzID0gWydkYW5nZXJvdXNseVNldElubmVySFRNTCcsICdvbkNvcHknLCAnb25Db3B5Q2FwdHVyZScsICdvbkN1dCcsICdvbkN1dENhcHR1cmUnLCAnb25QYXN0ZScsICdvblBhc3RlQ2FwdHVyZScsICdvbkNvbXBvc2l0aW9uRW5kJywgJ29uQ29tcG9zaXRpb25FbmRDYXB0dXJlJywgJ29uQ29tcG9zaXRpb25TdGFydCcsICdvbkNvbXBvc2l0aW9uU3RhcnRDYXB0dXJlJywgJ29uQ29tcG9zaXRpb25VcGRhdGUnLCAnb25Db21wb3NpdGlvblVwZGF0ZUNhcHR1cmUnLCAnb25Gb2N1cycsICdvbkZvY3VzQ2FwdHVyZScsICdvbkJsdXInLCAnb25CbHVyQ2FwdHVyZScsICdvbkNoYW5nZScsICdvbkNoYW5nZUNhcHR1cmUnLCAnb25CZWZvcmVJbnB1dCcsICdvbkJlZm9yZUlucHV0Q2FwdHVyZScsICdvbklucHV0JywgJ29uSW5wdXRDYXB0dXJlJywgJ29uUmVzZXQnLCAnb25SZXNldENhcHR1cmUnLCAnb25TdWJtaXQnLCAnb25TdWJtaXRDYXB0dXJlJywgJ29uSW52YWxpZCcsICdvbkludmFsaWRDYXB0dXJlJywgJ29uTG9hZCcsICdvbkxvYWRDYXB0dXJlJywgJ29uRXJyb3InLCAnb25FcnJvckNhcHR1cmUnLCAnb25LZXlEb3duJywgJ29uS2V5RG93bkNhcHR1cmUnLCAnb25LZXlQcmVzcycsICdvbktleVByZXNzQ2FwdHVyZScsICdvbktleVVwJywgJ29uS2V5VXBDYXB0dXJlJywgJ29uQWJvcnQnLCAnb25BYm9ydENhcHR1cmUnLCAnb25DYW5QbGF5JywgJ29uQ2FuUGxheUNhcHR1cmUnLCAnb25DYW5QbGF5VGhyb3VnaCcsICdvbkNhblBsYXlUaHJvdWdoQ2FwdHVyZScsICdvbkR1cmF0aW9uQ2hhbmdlJywgJ29uRHVyYXRpb25DaGFuZ2VDYXB0dXJlJywgJ29uRW1wdGllZCcsICdvbkVtcHRpZWRDYXB0dXJlJywgJ29uRW5jcnlwdGVkJywgJ29uRW5jcnlwdGVkQ2FwdHVyZScsICdvbkVuZGVkJywgJ29uRW5kZWRDYXB0dXJlJywgJ29uTG9hZGVkRGF0YScsICdvbkxvYWRlZERhdGFDYXB0dXJlJywgJ29uTG9hZGVkTWV0YWRhdGEnLCAnb25Mb2FkZWRNZXRhZGF0YUNhcHR1cmUnLCAnb25Mb2FkU3RhcnQnLCAnb25Mb2FkU3RhcnRDYXB0dXJlJywgJ29uUGF1c2UnLCAnb25QYXVzZUNhcHR1cmUnLCAnb25QbGF5JywgJ29uUGxheUNhcHR1cmUnLCAnb25QbGF5aW5nJywgJ29uUGxheWluZ0NhcHR1cmUnLCAnb25Qcm9ncmVzcycsICdvblByb2dyZXNzQ2FwdHVyZScsICdvblJhdGVDaGFuZ2UnLCAnb25SYXRlQ2hhbmdlQ2FwdHVyZScsICdvblNlZWtlZCcsICdvblNlZWtlZENhcHR1cmUnLCAnb25TZWVraW5nJywgJ29uU2Vla2luZ0NhcHR1cmUnLCAnb25TdGFsbGVkJywgJ29uU3RhbGxlZENhcHR1cmUnLCAnb25TdXNwZW5kJywgJ29uU3VzcGVuZENhcHR1cmUnLCAnb25UaW1lVXBkYXRlJywgJ29uVGltZVVwZGF0ZUNhcHR1cmUnLCAnb25Wb2x1bWVDaGFuZ2UnLCAnb25Wb2x1bWVDaGFuZ2VDYXB0dXJlJywgJ29uV2FpdGluZycsICdvbldhaXRpbmdDYXB0dXJlJywgJ29uQXV4Q2xpY2snLCAnb25BdXhDbGlja0NhcHR1cmUnLCAnb25DbGljaycsICdvbkNsaWNrQ2FwdHVyZScsICdvbkNvbnRleHRNZW51JywgJ29uQ29udGV4dE1lbnVDYXB0dXJlJywgJ29uRG91YmxlQ2xpY2snLCAnb25Eb3VibGVDbGlja0NhcHR1cmUnLCAnb25EcmFnJywgJ29uRHJhZ0NhcHR1cmUnLCAnb25EcmFnRW5kJywgJ29uRHJhZ0VuZENhcHR1cmUnLCAnb25EcmFnRW50ZXInLCAnb25EcmFnRW50ZXJDYXB0dXJlJywgJ29uRHJhZ0V4aXQnLCAnb25EcmFnRXhpdENhcHR1cmUnLCAnb25EcmFnTGVhdmUnLCAnb25EcmFnTGVhdmVDYXB0dXJlJywgJ29uRHJhZ092ZXInLCAnb25EcmFnT3ZlckNhcHR1cmUnLCAnb25EcmFnU3RhcnQnLCAnb25EcmFnU3RhcnRDYXB0dXJlJywgJ29uRHJvcCcsICdvbkRyb3BDYXB0dXJlJywgJ29uTW91c2VEb3duJywgJ29uTW91c2VEb3duQ2FwdHVyZScsICdvbk1vdXNlRW50ZXInLCAnb25Nb3VzZUxlYXZlJywgJ29uTW91c2VNb3ZlJywgJ29uTW91c2VNb3ZlQ2FwdHVyZScsICdvbk1vdXNlT3V0JywgJ29uTW91c2VPdXRDYXB0dXJlJywgJ29uTW91c2VPdmVyJywgJ29uTW91c2VPdmVyQ2FwdHVyZScsICdvbk1vdXNlVXAnLCAnb25Nb3VzZVVwQ2FwdHVyZScsICdvblNlbGVjdCcsICdvblNlbGVjdENhcHR1cmUnLCAnb25Ub3VjaENhbmNlbCcsICdvblRvdWNoQ2FuY2VsQ2FwdHVyZScsICdvblRvdWNoRW5kJywgJ29uVG91Y2hFbmRDYXB0dXJlJywgJ29uVG91Y2hNb3ZlJywgJ29uVG91Y2hNb3ZlQ2FwdHVyZScsICdvblRvdWNoU3RhcnQnLCAnb25Ub3VjaFN0YXJ0Q2FwdHVyZScsICdvblBvaW50ZXJEb3duJywgJ29uUG9pbnRlckRvd25DYXB0dXJlJywgJ29uUG9pbnRlck1vdmUnLCAnb25Qb2ludGVyTW92ZUNhcHR1cmUnLCAnb25Qb2ludGVyVXAnLCAnb25Qb2ludGVyVXBDYXB0dXJlJywgJ29uUG9pbnRlckNhbmNlbCcsICdvblBvaW50ZXJDYW5jZWxDYXB0dXJlJywgJ29uUG9pbnRlckVudGVyJywgJ29uUG9pbnRlckVudGVyQ2FwdHVyZScsICdvblBvaW50ZXJMZWF2ZScsICdvblBvaW50ZXJMZWF2ZUNhcHR1cmUnLCAnb25Qb2ludGVyT3ZlcicsICdvblBvaW50ZXJPdmVyQ2FwdHVyZScsICdvblBvaW50ZXJPdXQnLCAnb25Qb2ludGVyT3V0Q2FwdHVyZScsICdvbkdvdFBvaW50ZXJDYXB0dXJlJywgJ29uR290UG9pbnRlckNhcHR1cmVDYXB0dXJlJywgJ29uTG9zdFBvaW50ZXJDYXB0dXJlJywgJ29uTG9zdFBvaW50ZXJDYXB0dXJlQ2FwdHVyZScsICdvblNjcm9sbCcsICdvblNjcm9sbENhcHR1cmUnLCAnb25XaGVlbCcsICdvbldoZWVsQ2FwdHVyZScsICdvbkFuaW1hdGlvblN0YXJ0JywgJ29uQW5pbWF0aW9uU3RhcnRDYXB0dXJlJywgJ29uQW5pbWF0aW9uRW5kJywgJ29uQW5pbWF0aW9uRW5kQ2FwdHVyZScsICdvbkFuaW1hdGlvbkl0ZXJhdGlvbicsICdvbkFuaW1hdGlvbkl0ZXJhdGlvbkNhcHR1cmUnLCAnb25UcmFuc2l0aW9uRW5kJywgJ29uVHJhbnNpdGlvbkVuZENhcHR1cmUnXTtcbmV4cG9ydCBmdW5jdGlvbiBpc0V2ZW50S2V5KGtleSkge1xuICBpZiAodHlwZW9mIGtleSAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGFsbG93ZWRFdmVudEtleXMgPSBFdmVudEtleXM7XG4gIHJldHVybiBhbGxvd2VkRXZlbnRLZXlzLmluY2x1ZGVzKGtleSk7XG59IiwidmFyIF9leGNsdWRlZCA9IFtcIm9wdGlvblwiLCBcImlzQWN0aXZlXCJdO1xuZnVuY3Rpb24gX2V4dGVuZHMoKSB7IHJldHVybiBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gPyBPYmplY3QuYXNzaWduLmJpbmQoKSA6IGZ1bmN0aW9uIChuKSB7IGZvciAodmFyIGUgPSAxOyBlIDwgYXJndW1lbnRzLmxlbmd0aDsgZSsrKSB7IHZhciB0ID0gYXJndW1lbnRzW2VdOyBmb3IgKHZhciByIGluIHQpICh7fSkuaGFzT3duUHJvcGVydHkuY2FsbCh0LCByKSAmJiAobltyXSA9IHRbcl0pOyB9IHJldHVybiBuOyB9LCBfZXh0ZW5kcy5hcHBseShudWxsLCBhcmd1bWVudHMpOyB9XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoZSwgdCkgeyBpZiAobnVsbCA9PSBlKSByZXR1cm4ge307IHZhciBvLCByLCBpID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2UoZSwgdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBuID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhlKTsgZm9yIChyID0gMDsgciA8IG4ubGVuZ3RoOyByKyspIG8gPSBuW3JdLCAtMSA9PT0gdC5pbmRleE9mKG8pICYmIHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoZSwgbykgJiYgKGlbb10gPSBlW29dKTsgfSByZXR1cm4gaTsgfVxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2UociwgZSkgeyBpZiAobnVsbCA9PSByKSByZXR1cm4ge307IHZhciB0ID0ge307IGZvciAodmFyIG4gaW4gcikgaWYgKHt9Lmhhc093blByb3BlcnR5LmNhbGwociwgbikpIHsgaWYgKC0xICE9PSBlLmluZGV4T2YobikpIGNvbnRpbnVlOyB0W25dID0gcltuXTsgfSByZXR1cm4gdDsgfVxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgU3ltYm9scyB9IGZyb20gJy4uL3NoYXBlL1N5bWJvbHMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuL0FjdGl2ZVNoYXBlVXRpbHMnO1xuZXhwb3J0IGZ1bmN0aW9uIFNjYXR0ZXJTeW1ib2woX3JlZikge1xuICB2YXIge1xuICAgICAgb3B0aW9uLFxuICAgICAgaXNBY3RpdmVcbiAgICB9ID0gX3JlZixcbiAgICBwcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfcmVmLCBfZXhjbHVkZWQpO1xuICBpZiAodHlwZW9mIG9wdGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2hhcGUsIF9leHRlbmRzKHtcbiAgICAgIG9wdGlvbjogLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU3ltYm9scywgX2V4dGVuZHMoe1xuICAgICAgICB0eXBlOiBvcHRpb25cbiAgICAgIH0sIHByb3BzKSksXG4gICAgICBpc0FjdGl2ZTogaXNBY3RpdmUsXG4gICAgICBzaGFwZVR5cGU6IFwic3ltYm9sc1wiXG4gICAgfSwgcHJvcHMpKTtcbiAgfVxuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2hhcGUsIF9leHRlbmRzKHtcbiAgICBvcHRpb246IG9wdGlvbixcbiAgICBpc0FjdGl2ZTogaXNBY3RpdmUsXG4gICAgc2hhcGVUeXBlOiBcInN5bWJvbHNcIlxuICB9LCBwcm9wcykpO1xufSIsImltcG9ydCB7IHBvbGFyVG9DYXJ0ZXNpYW4gfSBmcm9tICcuLi9Qb2xhclV0aWxzJztcbmltcG9ydCB7IGdldFJhZGlhbEN1cnNvclBvaW50cyB9IGZyb20gJy4vZ2V0UmFkaWFsQ3Vyc29yUG9pbnRzJztcbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJzb3JQb2ludHMobGF5b3V0LCBhY3RpdmVDb29yZGluYXRlLCBvZmZzZXQpIHtcbiAgdmFyIHgxLCB5MSwgeDIsIHkyO1xuICBpZiAobGF5b3V0ID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICB4MSA9IGFjdGl2ZUNvb3JkaW5hdGUueDtcbiAgICB4MiA9IHgxO1xuICAgIHkxID0gb2Zmc2V0LnRvcDtcbiAgICB5MiA9IG9mZnNldC50b3AgKyBvZmZzZXQuaGVpZ2h0O1xuICB9IGVsc2UgaWYgKGxheW91dCA9PT0gJ3ZlcnRpY2FsJykge1xuICAgIHkxID0gYWN0aXZlQ29vcmRpbmF0ZS55O1xuICAgIHkyID0geTE7XG4gICAgeDEgPSBvZmZzZXQubGVmdDtcbiAgICB4MiA9IG9mZnNldC5sZWZ0ICsgb2Zmc2V0LndpZHRoO1xuICB9IGVsc2UgaWYgKGFjdGl2ZUNvb3JkaW5hdGUuY3ggIT0gbnVsbCAmJiBhY3RpdmVDb29yZGluYXRlLmN5ICE9IG51bGwpIHtcbiAgICBpZiAobGF5b3V0ID09PSAnY2VudHJpYycpIHtcbiAgICAgIHZhciB7XG4gICAgICAgIGN4LFxuICAgICAgICBjeSxcbiAgICAgICAgaW5uZXJSYWRpdXMsXG4gICAgICAgIG91dGVyUmFkaXVzLFxuICAgICAgICBhbmdsZVxuICAgICAgfSA9IGFjdGl2ZUNvb3JkaW5hdGU7XG4gICAgICB2YXIgaW5uZXJQb2ludCA9IHBvbGFyVG9DYXJ0ZXNpYW4oY3gsIGN5LCBpbm5lclJhZGl1cywgYW5nbGUpO1xuICAgICAgdmFyIG91dGVyUG9pbnQgPSBwb2xhclRvQ2FydGVzaWFuKGN4LCBjeSwgb3V0ZXJSYWRpdXMsIGFuZ2xlKTtcbiAgICAgIHgxID0gaW5uZXJQb2ludC54O1xuICAgICAgeTEgPSBpbm5lclBvaW50Lnk7XG4gICAgICB4MiA9IG91dGVyUG9pbnQueDtcbiAgICAgIHkyID0gb3V0ZXJQb2ludC55O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE8gdGhlIHN0YXRlIGlzIG1hcmtlZCBhcyBjb250YWluaW5nIENvb3JkaW5hdGUgYnV0IGFjdHVhbGx5IGluIHBvbGFyIGNoYXJ0cyBpdCBjb250YWlucyBQb2xhckNvb3JkaW5hdGUsIHdlIHNob3VsZCBrZWVwIHRoZSBwb2xhciBzdGF0ZSBzZXBhcmF0ZVxuICAgICAgcmV0dXJuIGdldFJhZGlhbEN1cnNvclBvaW50cyhhY3RpdmVDb29yZGluYXRlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIFt7XG4gICAgeDogeDEsXG4gICAgeTogeTFcbiAgfSwge1xuICAgIHg6IHgyLFxuICAgIHk6IHkyXG4gIH1dO1xufSIsImZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbi8qKlxuICogU2ltcGxlIExSVSAoTGVhc3QgUmVjZW50bHkgVXNlZCkgY2FjaGUgaW1wbGVtZW50YXRpb25cbiAqL1xuZXhwb3J0IGNsYXNzIExSVUNhY2hlIHtcbiAgY29uc3RydWN0b3IobWF4U2l6ZSkge1xuICAgIF9kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcImNhY2hlXCIsIG5ldyBNYXAoKSk7XG4gICAgdGhpcy5tYXhTaXplID0gbWF4U2l6ZTtcbiAgfVxuICBnZXQoa2V5KSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5jYWNoZS5nZXQoa2V5KTtcbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5jYWNoZS5kZWxldGUoa2V5KTtcbiAgICAgIHRoaXMuY2FjaGUuc2V0KGtleSwgdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICBpZiAodGhpcy5jYWNoZS5oYXMoa2V5KSkge1xuICAgICAgdGhpcy5jYWNoZS5kZWxldGUoa2V5KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuY2FjaGUuc2l6ZSA+PSB0aGlzLm1heFNpemUpIHtcbiAgICAgIHZhciBmaXJzdEtleSA9IHRoaXMuY2FjaGUua2V5cygpLm5leHQoKS52YWx1ZTtcbiAgICAgIHRoaXMuY2FjaGUuZGVsZXRlKGZpcnN0S2V5KTtcbiAgICB9XG4gICAgdGhpcy5jYWNoZS5zZXQoa2V5LCB2YWx1ZSk7XG4gIH1cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5jYWNoZS5jbGVhcigpO1xuICB9XG4gIHNpemUoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGUuc2l6ZTtcbiAgfVxufSIsImZ1bmN0aW9uIF9leHRlbmRzKCkgeyByZXR1cm4gX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAobikgeyBmb3IgKHZhciBlID0gMTsgZSA8IGFyZ3VtZW50cy5sZW5ndGg7IGUrKykgeyB2YXIgdCA9IGFyZ3VtZW50c1tlXTsgZm9yICh2YXIgciBpbiB0KSAoe30pLmhhc093blByb3BlcnR5LmNhbGwodCwgcikgJiYgKG5bcl0gPSB0W3JdKTsgfSByZXR1cm4gbjsgfSwgX2V4dGVuZHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuZnVuY3Rpb24gb3duS2V5cyhlLCByKSB7IHZhciB0ID0gT2JqZWN0LmtleXMoZSk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBvID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhlKTsgciAmJiAobyA9IG8uZmlsdGVyKGZ1bmN0aW9uIChyKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGUsIHIpLmVudW1lcmFibGU7IH0pKSwgdC5wdXNoLmFwcGx5KHQsIG8pOyB9IHJldHVybiB0OyB9XG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKGUpIHsgZm9yICh2YXIgciA9IDE7IHIgPCBhcmd1bWVudHMubGVuZ3RoOyByKyspIHsgdmFyIHQgPSBudWxsICE9IGFyZ3VtZW50c1tyXSA/IGFyZ3VtZW50c1tyXSA6IHt9OyByICUgMiA/IG93bktleXMoT2JqZWN0KHQpLCAhMCkuZm9yRWFjaChmdW5jdGlvbiAocikgeyBfZGVmaW5lUHJvcGVydHkoZSwgciwgdFtyXSk7IH0pIDogT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhlLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0KSkgOiBvd25LZXlzKE9iamVjdCh0KSkuZm9yRWFjaChmdW5jdGlvbiAocikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0LCByKSk7IH0pOyB9IHJldHVybiBlOyB9XG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkoZSwgciwgdCkgeyByZXR1cm4gKHIgPSBfdG9Qcm9wZXJ0eUtleShyKSkgaW4gZSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCB7IHZhbHVlOiB0LCBlbnVtZXJhYmxlOiAhMCwgY29uZmlndXJhYmxlOiAhMCwgd3JpdGFibGU6ICEwIH0pIDogZVtyXSA9IHQsIGU7IH1cbmZ1bmN0aW9uIF90b1Byb3BlcnR5S2V5KHQpIHsgdmFyIGkgPSBfdG9QcmltaXRpdmUodCwgXCJzdHJpbmdcIik7IHJldHVybiBcInN5bWJvbFwiID09IHR5cGVvZiBpID8gaSA6IGkgKyBcIlwiOyB9XG5mdW5jdGlvbiBfdG9QcmltaXRpdmUodCwgcikgeyBpZiAoXCJvYmplY3RcIiAhPSB0eXBlb2YgdCB8fCAhdCkgcmV0dXJuIHQ7IHZhciBlID0gdFtTeW1ib2wudG9QcmltaXRpdmVdOyBpZiAodm9pZCAwICE9PSBlKSB7IHZhciBpID0gZS5jYWxsKHQsIHIgfHwgXCJkZWZhdWx0XCIpOyBpZiAoXCJvYmplY3RcIiAhPSB0eXBlb2YgaSkgcmV0dXJuIGk7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJAQHRvUHJpbWl0aXZlIG11c3QgcmV0dXJuIGEgcHJpbWl0aXZlIHZhbHVlLlwiKTsgfSByZXR1cm4gKFwic3RyaW5nXCIgPT09IHIgPyBTdHJpbmcgOiBOdW1iZXIpKHQpOyB9XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4vQWN0aXZlU2hhcGVVdGlscyc7XG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb3JuZXJSYWRpdXMoY29ybmVyUmFkaXVzKSB7XG4gIGlmICh0eXBlb2YgY29ybmVyUmFkaXVzID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBwYXJzZUludChjb3JuZXJSYWRpdXMsIDEwKTtcbiAgfVxuICByZXR1cm4gY29ybmVyUmFkaXVzO1xufVxuXG4vLyBTZWN0b3IgcHJvcHMgaXMgZXhwZWN0aW5nIGN4LCBjeSBhcyBudW1iZXJzLlxuLy8gV2hlbiBwcm9wcyBhcmUgYmVpbmcgc3ByZWFkIGluIGZyb20gYSB1c2VyIGRlZmluZWQgY29tcG9uZW50IGluIFJhZGlhbEJhcixcbi8vIHRoZSBwcm9wIHR5cGVzIG9mIGFuIFNWR0VsZW1lbnQgaGF2ZSB0aGVzZSB0eXBlZCBhcyBzdHJpbmcgfCBudW1iZXIuXG4vLyBUaGlzIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIHRoZSBwYXNzZWQgaW4gcHJvcHMgYWxvbmcgd2l0aCBjeCwgY3kgYXMgbnVtYmVycy5cbmV4cG9ydCBmdW5jdGlvbiB0eXBlR3VhcmRTZWN0b3JQcm9wcyhvcHRpb24sIHByb3BzKSB7XG4gIHZhciBjeFZhbHVlID0gXCJcIi5jb25jYXQocHJvcHMuY3ggfHwgb3B0aW9uLmN4KTtcbiAgdmFyIGN4ID0gTnVtYmVyKGN4VmFsdWUpO1xuICB2YXIgY3lWYWx1ZSA9IFwiXCIuY29uY2F0KHByb3BzLmN5IHx8IG9wdGlvbi5jeSk7XG4gIHZhciBjeSA9IE51bWJlcihjeVZhbHVlKTtcbiAgcmV0dXJuIF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBwcm9wcyksIG9wdGlvbiksIHt9LCB7XG4gICAgY3gsXG4gICAgY3lcbiAgfSk7XG59XG5leHBvcnQgZnVuY3Rpb24gUmFkaWFsQmFyU2VjdG9yKHByb3BzKSB7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTaGFwZSwgX2V4dGVuZHMoe1xuICAgIHNoYXBlVHlwZTogXCJzZWN0b3JcIixcbiAgICBwcm9wVHJhbnNmb3JtZXI6IHR5cGVHdWFyZFNlY3RvclByb3BzXG4gIH0sIHByb3BzKSk7XG59IiwiLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSB3aWR0aCBvZiB0aGUgWS1heGlzIGJhc2VkIG9uIHRoZSB0aWNrIGxhYmVscyBhbmQgdGhlIGF4aXMgbGFiZWwuXG4gKiBAcGFyYW0gcGFyYW1zIC0gVGhlIHBhcmFtZXRlcnMgb2JqZWN0LlxuICogQHBhcmFtIFtwYXJhbXMudGlja3NdIC0gQW4gYXJyYXktbGlrZSBvYmplY3Qgb2YgdGljayBlbGVtZW50cywgZWFjaCB3aXRoIGEgYGdldEJvdW5kaW5nQ2xpZW50UmVjdGAgbWV0aG9kLlxuICogQHBhcmFtIFtwYXJhbXMubGFiZWxdIC0gVGhlIGF4aXMgbGFiZWwgZWxlbWVudCwgd2l0aCBhIGBnZXRCb3VuZGluZ0NsaWVudFJlY3RgIG1ldGhvZC5cbiAqIEBwYXJhbSBbcGFyYW1zLmxhYmVsR2FwV2l0aFRpY2s9NV0gLSBUaGUgZ2FwIGJldHdlZW4gdGhlIGxhYmVsIGFuZCB0aGUgdGljay5cbiAqIEBwYXJhbSBbcGFyYW1zLnRpY2tTaXplPTBdIC0gVGhlIGxlbmd0aCBvZiB0aGUgdGljayBsaW5lLlxuICogQHBhcmFtIFtwYXJhbXMudGlja01hcmdpbj0wXSAtIFRoZSBtYXJnaW4gYmV0d2VlbiB0aGUgdGljayBsaW5lIGFuZCB0aGUgdGljayB0ZXh0LlxuICogQHJldHVybnMgVGhlIGNhbGN1bGF0ZWQgd2lkdGggb2YgdGhlIFktYXhpcy5cbiAqL1xuZXhwb3J0IHZhciBnZXRDYWxjdWxhdGVkWUF4aXNXaWR0aCA9IF9yZWYgPT4ge1xuICB2YXIge1xuICAgIHRpY2tzLFxuICAgIGxhYmVsLFxuICAgIGxhYmVsR2FwV2l0aFRpY2sgPSA1LFxuICAgIC8vIERlZmF1bHQgZ2FwIGJldHdlZW4gbGFiZWwgYW5kIHRpY2tcbiAgICB0aWNrU2l6ZSA9IDAsXG4gICAgdGlja01hcmdpbiA9IDBcbiAgfSA9IF9yZWY7XG4gIC8vIGZpbmQgdGhlIG1heCB3aWR0aCBvZiB0aGUgdGljayBsYWJlbHNcbiAgdmFyIG1heFRpY2tXaWR0aCA9IDA7XG4gIGlmICh0aWNrcykge1xuICAgIEFycmF5LmZyb20odGlja3MpLmZvckVhY2godGlja05vZGUgPT4ge1xuICAgICAgaWYgKHRpY2tOb2RlKSB7XG4gICAgICAgIHZhciBiYm94ID0gdGlja05vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGlmIChiYm94LndpZHRoID4gbWF4VGlja1dpZHRoKSB7XG4gICAgICAgICAgbWF4VGlja1dpZHRoID0gYmJveC53aWR0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gY2FsY3VsYXRlIHdpZHRoIG9mIHRoZSBheGlzIGxhYmVsXG4gICAgdmFyIGxhYmVsV2lkdGggPSBsYWJlbCA/IGxhYmVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoIDogMDtcbiAgICB2YXIgdGlja1dpZHRoID0gdGlja1NpemUgKyB0aWNrTWFyZ2luO1xuXG4gICAgLy8gY2FsY3VsYXRlIHRoZSB1cGRhdGVkIHdpZHRoIG9mIHRoZSB5LWF4aXNcbiAgICB2YXIgdXBkYXRlZFlBeGlzV2lkdGggPSBtYXhUaWNrV2lkdGggKyB0aWNrV2lkdGggKyBsYWJlbFdpZHRoICsgKGxhYmVsID8gbGFiZWxHYXBXaXRoVGljayA6IDApO1xuICAgIHJldHVybiBNYXRoLnJvdW5kKHVwZGF0ZWRZQXhpc1dpZHRoKTtcbiAgfVxuICByZXR1cm4gMDtcbn07IiwidmFyIHBhcnNlSXNTc3JCeURlZmF1bHQgPSAoKSA9PiAhKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5kb2N1bWVudCAmJiBCb29sZWFuKHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KSAmJiB3aW5kb3cuc2V0VGltZW91dCk7XG5leHBvcnQgdmFyIEdsb2JhbCA9IHtcbiAgZGV2VG9vbHNFbmFibGVkOiBmYWxzZSxcbiAgaXNTc3I6IHBhcnNlSXNTc3JCeURlZmF1bHQoKVxufTsiLCJpbXBvcnQgeyBwb2xhclRvQ2FydGVzaWFuIH0gZnJvbSAnLi4vUG9sYXJVdGlscyc7XG4vKipcbiAqIE9ubHkgYXBwbGljYWJsZSBmb3IgcmFkaWFsIGxheW91dHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBhY3RpdmVDb29yZGluYXRlIENoYXJ0Q29vcmRpbmF0ZVxuICogQHJldHVybnMge09iamVjdH0gUmFkaWFsQ3Vyc29yUG9pbnRzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSYWRpYWxDdXJzb3JQb2ludHMoYWN0aXZlQ29vcmRpbmF0ZSkge1xuICB2YXIge1xuICAgIGN4LFxuICAgIGN5LFxuICAgIHJhZGl1cyxcbiAgICBzdGFydEFuZ2xlLFxuICAgIGVuZEFuZ2xlXG4gIH0gPSBhY3RpdmVDb29yZGluYXRlO1xuICB2YXIgc3RhcnRQb2ludCA9IHBvbGFyVG9DYXJ0ZXNpYW4oY3gsIGN5LCByYWRpdXMsIHN0YXJ0QW5nbGUpO1xuICB2YXIgZW5kUG9pbnQgPSBwb2xhclRvQ2FydGVzaWFuKGN4LCBjeSwgcmFkaXVzLCBlbmRBbmdsZSk7XG4gIHJldHVybiB7XG4gICAgcG9pbnRzOiBbc3RhcnRQb2ludCwgZW5kUG9pbnRdLFxuICAgIGN4LFxuICAgIGN5LFxuICAgIHJhZGl1cyxcbiAgICBzdGFydEFuZ2xlLFxuICAgIGVuZEFuZ2xlXG4gIH07XG59IiwiZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnNvclJlY3RhbmdsZShsYXlvdXQsIGFjdGl2ZUNvb3JkaW5hdGUsIG9mZnNldCwgdG9vbHRpcEF4aXNCYW5kU2l6ZSkge1xuICB2YXIgaGFsZlNpemUgPSB0b29sdGlwQXhpc0JhbmRTaXplIC8gMjtcbiAgcmV0dXJuIHtcbiAgICBzdHJva2U6ICdub25lJyxcbiAgICBmaWxsOiAnI2NjYycsXG4gICAgeDogbGF5b3V0ID09PSAnaG9yaXpvbnRhbCcgPyBhY3RpdmVDb29yZGluYXRlLnggLSBoYWxmU2l6ZSA6IG9mZnNldC5sZWZ0ICsgMC41LFxuICAgIHk6IGxheW91dCA9PT0gJ2hvcml6b250YWwnID8gb2Zmc2V0LnRvcCArIDAuNSA6IGFjdGl2ZUNvb3JkaW5hdGUueSAtIGhhbGZTaXplLFxuICAgIHdpZHRoOiBsYXlvdXQgPT09ICdob3Jpem9udGFsJyA/IHRvb2x0aXBBeGlzQmFuZFNpemUgOiBvZmZzZXQud2lkdGggLSAxLFxuICAgIGhlaWdodDogbGF5b3V0ID09PSAnaG9yaXpvbnRhbCcgPyBvZmZzZXQuaGVpZ2h0IC0gMSA6IHRvb2x0aXBBeGlzQmFuZFNpemVcbiAgfTtcbn0iLCJleHBvcnQgZnVuY3Rpb24gZ2V0U2xpY2VkKGFyciwgc3RhcnRJbmRleCwgZW5kSW5kZXgpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICByZXR1cm4gYXJyO1xuICB9XG4gIGlmIChhcnIgJiYgc3RhcnRJbmRleCArIGVuZEluZGV4ICE9PSAwKSB7XG4gICAgcmV0dXJuIGFyci5zbGljZShzdGFydEluZGV4LCBlbmRJbmRleCArIDEpO1xuICB9XG4gIHJldHVybiBhcnI7XG59IiwiaW1wb3J0IHsgZ2V0QW5nbGVkUmVjdGFuZ2xlV2lkdGggfSBmcm9tICcuL0NhcnRlc2lhblV0aWxzJztcbmltcG9ydCB7IGdldEV2ZXJ5TnRoV2l0aENvbmRpdGlvbiB9IGZyb20gJy4vZ2V0RXZlcnlOdGhXaXRoQ29uZGl0aW9uJztcbmV4cG9ydCBmdW5jdGlvbiBnZXRBbmdsZWRUaWNrV2lkdGgoY29udGVudFNpemUsIHVuaXRTaXplLCBhbmdsZSkge1xuICB2YXIgc2l6ZSA9IHtcbiAgICB3aWR0aDogY29udGVudFNpemUud2lkdGggKyB1bml0U2l6ZS53aWR0aCxcbiAgICBoZWlnaHQ6IGNvbnRlbnRTaXplLmhlaWdodCArIHVuaXRTaXplLmhlaWdodFxuICB9O1xuICByZXR1cm4gZ2V0QW5nbGVkUmVjdGFuZ2xlV2lkdGgoc2l6ZSwgYW5nbGUpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFRpY2tCb3VuZGFyaWVzKHZpZXdCb3gsIHNpZ24sIHNpemVLZXkpIHtcbiAgdmFyIGlzV2lkdGggPSBzaXplS2V5ID09PSAnd2lkdGgnO1xuICB2YXIge1xuICAgIHgsXG4gICAgeSxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHRcbiAgfSA9IHZpZXdCb3g7XG4gIGlmIChzaWduID09PSAxKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0OiBpc1dpZHRoID8geCA6IHksXG4gICAgICBlbmQ6IGlzV2lkdGggPyB4ICsgd2lkdGggOiB5ICsgaGVpZ2h0XG4gICAgfTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHN0YXJ0OiBpc1dpZHRoID8geCArIHdpZHRoIDogeSArIGhlaWdodCxcbiAgICBlbmQ6IGlzV2lkdGggPyB4IDogeVxuICB9O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzVmlzaWJsZShzaWduLCB0aWNrUG9zaXRpb24sIGdldFNpemUsIHN0YXJ0LCBlbmQpIHtcbiAgLyogU2luY2UgZ2V0U2l6ZSgpIGlzIGV4cGVuc2l2ZSAoaXQgcmVhZHMgdGhlIHRpY2tzJyBzaXplIGZyb20gdGhlIERPTSksIHdlIGRvIHRoaXMgY2hlY2sgZmlyc3QgdG8gYXZvaWQgY2FsY3VsYXRpbmdcbiAgICogdGhlIHRpY2sncyBzaXplLiAqL1xuICBpZiAoc2lnbiAqIHRpY2tQb3NpdGlvbiA8IHNpZ24gKiBzdGFydCB8fCBzaWduICogdGlja1Bvc2l0aW9uID4gc2lnbiAqIGVuZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgc2l6ZSA9IGdldFNpemUoKTtcbiAgcmV0dXJuIHNpZ24gKiAodGlja1Bvc2l0aW9uIC0gc2lnbiAqIHNpemUgLyAyIC0gc3RhcnQpID49IDAgJiYgc2lnbiAqICh0aWNrUG9zaXRpb24gKyBzaWduICogc2l6ZSAvIDIgLSBlbmQpIDw9IDA7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0TnVtYmVySW50ZXJ2YWxUaWNrcyh0aWNrcywgaW50ZXJ2YWwpIHtcbiAgcmV0dXJuIGdldEV2ZXJ5TnRoV2l0aENvbmRpdGlvbih0aWNrcywgaW50ZXJ2YWwgKyAxKTtcbn0iLCJpbXBvcnQgeyBpc05hbiB9IGZyb20gJy4vRGF0YVV0aWxzJztcbnZhciBNVUxUSVBMWV9PUl9ESVZJREVfUkVHRVggPSAvKC0/XFxkKyg/OlxcLlxcZCspP1thLXpBLVolXSopKFsqL10pKC0/XFxkKyg/OlxcLlxcZCspP1thLXpBLVolXSopLztcbnZhciBBRERfT1JfU1VCVFJBQ1RfUkVHRVggPSAvKC0/XFxkKyg/OlxcLlxcZCspP1thLXpBLVolXSopKFsrLV0pKC0/XFxkKyg/OlxcLlxcZCspP1thLXpBLVolXSopLztcbnZhciBDU1NfTEVOR1RIX1VOSVRfUkVHRVggPSAvXnB4fGNtfHZofHZ3fGVtfHJlbXwlfG1tfGlufHB0fHBjfGV4fGNofHZtaW58dm1heHxRJC87XG52YXIgTlVNX1NQTElUX1JFR0VYID0gLygtP1xcZCsoPzpcXC5cXGQrKT8pKFthLXpBLVolXSspPy87XG52YXIgQ09OVkVSU0lPTl9SQVRFUyA9IHtcbiAgY206IDk2IC8gMi41NCxcbiAgbW06IDk2IC8gMjUuNCxcbiAgcHQ6IDk2IC8gNzIsXG4gIHBjOiA5NiAvIDYsXG4gIGluOiA5NixcbiAgUTogOTYgLyAoMi41NCAqIDQwKSxcbiAgcHg6IDFcbn07XG52YXIgRklYRURfQ1NTX0xFTkdUSF9VTklUUyA9IE9iamVjdC5rZXlzKENPTlZFUlNJT05fUkFURVMpO1xudmFyIFNUUl9OQU4gPSAnTmFOJztcbmZ1bmN0aW9uIGNvbnZlcnRUb1B4KHZhbHVlLCB1bml0KSB7XG4gIHJldHVybiB2YWx1ZSAqIENPTlZFUlNJT05fUkFURVNbdW5pdF07XG59XG5jbGFzcyBEZWNpbWFsQ1NTIHtcbiAgc3RhdGljIHBhcnNlKHN0cikge1xuICAgIHZhciBfTlVNX1NQTElUX1JFR0VYJGV4ZWM7XG4gICAgdmFyIFssIG51bVN0ciwgdW5pdF0gPSAoX05VTV9TUExJVF9SRUdFWCRleGVjID0gTlVNX1NQTElUX1JFR0VYLmV4ZWMoc3RyKSkgIT09IG51bGwgJiYgX05VTV9TUExJVF9SRUdFWCRleGVjICE9PSB2b2lkIDAgPyBfTlVNX1NQTElUX1JFR0VYJGV4ZWMgOiBbXTtcbiAgICByZXR1cm4gbmV3IERlY2ltYWxDU1MocGFyc2VGbG9hdChudW1TdHIpLCB1bml0ICE9PSBudWxsICYmIHVuaXQgIT09IHZvaWQgMCA/IHVuaXQgOiAnJyk7XG4gIH1cbiAgY29uc3RydWN0b3IobnVtLCB1bml0KSB7XG4gICAgdGhpcy5udW0gPSBudW07XG4gICAgdGhpcy51bml0ID0gdW5pdDtcbiAgICB0aGlzLm51bSA9IG51bTtcbiAgICB0aGlzLnVuaXQgPSB1bml0O1xuICAgIGlmIChpc05hbihudW0pKSB7XG4gICAgICB0aGlzLnVuaXQgPSAnJztcbiAgICB9XG4gICAgaWYgKHVuaXQgIT09ICcnICYmICFDU1NfTEVOR1RIX1VOSVRfUkVHRVgudGVzdCh1bml0KSkge1xuICAgICAgdGhpcy5udW0gPSBOYU47XG4gICAgICB0aGlzLnVuaXQgPSAnJztcbiAgICB9XG4gICAgaWYgKEZJWEVEX0NTU19MRU5HVEhfVU5JVFMuaW5jbHVkZXModW5pdCkpIHtcbiAgICAgIHRoaXMubnVtID0gY29udmVydFRvUHgobnVtLCB1bml0KTtcbiAgICAgIHRoaXMudW5pdCA9ICdweCc7XG4gICAgfVxuICB9XG4gIGFkZChvdGhlcikge1xuICAgIGlmICh0aGlzLnVuaXQgIT09IG90aGVyLnVuaXQpIHtcbiAgICAgIHJldHVybiBuZXcgRGVjaW1hbENTUyhOYU4sICcnKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEZWNpbWFsQ1NTKHRoaXMubnVtICsgb3RoZXIubnVtLCB0aGlzLnVuaXQpO1xuICB9XG4gIHN1YnRyYWN0KG90aGVyKSB7XG4gICAgaWYgKHRoaXMudW5pdCAhPT0gb3RoZXIudW5pdCkge1xuICAgICAgcmV0dXJuIG5ldyBEZWNpbWFsQ1NTKE5hTiwgJycpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERlY2ltYWxDU1ModGhpcy5udW0gLSBvdGhlci5udW0sIHRoaXMudW5pdCk7XG4gIH1cbiAgbXVsdGlwbHkob3RoZXIpIHtcbiAgICBpZiAodGhpcy51bml0ICE9PSAnJyAmJiBvdGhlci51bml0ICE9PSAnJyAmJiB0aGlzLnVuaXQgIT09IG90aGVyLnVuaXQpIHtcbiAgICAgIHJldHVybiBuZXcgRGVjaW1hbENTUyhOYU4sICcnKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEZWNpbWFsQ1NTKHRoaXMubnVtICogb3RoZXIubnVtLCB0aGlzLnVuaXQgfHwgb3RoZXIudW5pdCk7XG4gIH1cbiAgZGl2aWRlKG90aGVyKSB7XG4gICAgaWYgKHRoaXMudW5pdCAhPT0gJycgJiYgb3RoZXIudW5pdCAhPT0gJycgJiYgdGhpcy51bml0ICE9PSBvdGhlci51bml0KSB7XG4gICAgICByZXR1cm4gbmV3IERlY2ltYWxDU1MoTmFOLCAnJyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGVjaW1hbENTUyh0aGlzLm51bSAvIG90aGVyLm51bSwgdGhpcy51bml0IHx8IG90aGVyLnVuaXQpO1xuICB9XG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBcIlwiLmNvbmNhdCh0aGlzLm51bSkuY29uY2F0KHRoaXMudW5pdCk7XG4gIH1cbiAgaXNOYU4oKSB7XG4gICAgcmV0dXJuIGlzTmFuKHRoaXMubnVtKTtcbiAgfVxufVxuZnVuY3Rpb24gY2FsY3VsYXRlQXJpdGhtZXRpYyhleHByKSB7XG4gIGlmIChleHByLmluY2x1ZGVzKFNUUl9OQU4pKSB7XG4gICAgcmV0dXJuIFNUUl9OQU47XG4gIH1cbiAgdmFyIG5ld0V4cHIgPSBleHByO1xuICB3aGlsZSAobmV3RXhwci5pbmNsdWRlcygnKicpIHx8IG5ld0V4cHIuaW5jbHVkZXMoJy8nKSkge1xuICAgIHZhciBfTVVMVElQTFlfT1JfRElWSURFX1I7XG4gICAgdmFyIFssIGxlZnRPcGVyYW5kLCBvcGVyYXRvciwgcmlnaHRPcGVyYW5kXSA9IChfTVVMVElQTFlfT1JfRElWSURFX1IgPSBNVUxUSVBMWV9PUl9ESVZJREVfUkVHRVguZXhlYyhuZXdFeHByKSkgIT09IG51bGwgJiYgX01VTFRJUExZX09SX0RJVklERV9SICE9PSB2b2lkIDAgPyBfTVVMVElQTFlfT1JfRElWSURFX1IgOiBbXTtcbiAgICB2YXIgbFRzID0gRGVjaW1hbENTUy5wYXJzZShsZWZ0T3BlcmFuZCAhPT0gbnVsbCAmJiBsZWZ0T3BlcmFuZCAhPT0gdm9pZCAwID8gbGVmdE9wZXJhbmQgOiAnJyk7XG4gICAgdmFyIHJUcyA9IERlY2ltYWxDU1MucGFyc2UocmlnaHRPcGVyYW5kICE9PSBudWxsICYmIHJpZ2h0T3BlcmFuZCAhPT0gdm9pZCAwID8gcmlnaHRPcGVyYW5kIDogJycpO1xuICAgIHZhciByZXN1bHQgPSBvcGVyYXRvciA9PT0gJyonID8gbFRzLm11bHRpcGx5KHJUcykgOiBsVHMuZGl2aWRlKHJUcyk7XG4gICAgaWYgKHJlc3VsdC5pc05hTigpKSB7XG4gICAgICByZXR1cm4gU1RSX05BTjtcbiAgICB9XG4gICAgbmV3RXhwciA9IG5ld0V4cHIucmVwbGFjZShNVUxUSVBMWV9PUl9ESVZJREVfUkVHRVgsIHJlc3VsdC50b1N0cmluZygpKTtcbiAgfVxuICB3aGlsZSAobmV3RXhwci5pbmNsdWRlcygnKycpIHx8IC8uLVxcZCsoPzpcXC5cXGQrKT8vLnRlc3QobmV3RXhwcikpIHtcbiAgICB2YXIgX0FERF9PUl9TVUJUUkFDVF9SRUdFO1xuICAgIHZhciBbLCBfbGVmdE9wZXJhbmQsIF9vcGVyYXRvciwgX3JpZ2h0T3BlcmFuZF0gPSAoX0FERF9PUl9TVUJUUkFDVF9SRUdFID0gQUREX09SX1NVQlRSQUNUX1JFR0VYLmV4ZWMobmV3RXhwcikpICE9PSBudWxsICYmIF9BRERfT1JfU1VCVFJBQ1RfUkVHRSAhPT0gdm9pZCAwID8gX0FERF9PUl9TVUJUUkFDVF9SRUdFIDogW107XG4gICAgdmFyIF9sVHMgPSBEZWNpbWFsQ1NTLnBhcnNlKF9sZWZ0T3BlcmFuZCAhPT0gbnVsbCAmJiBfbGVmdE9wZXJhbmQgIT09IHZvaWQgMCA/IF9sZWZ0T3BlcmFuZCA6ICcnKTtcbiAgICB2YXIgX3JUcyA9IERlY2ltYWxDU1MucGFyc2UoX3JpZ2h0T3BlcmFuZCAhPT0gbnVsbCAmJiBfcmlnaHRPcGVyYW5kICE9PSB2b2lkIDAgPyBfcmlnaHRPcGVyYW5kIDogJycpO1xuICAgIHZhciBfcmVzdWx0ID0gX29wZXJhdG9yID09PSAnKycgPyBfbFRzLmFkZChfclRzKSA6IF9sVHMuc3VidHJhY3QoX3JUcyk7XG4gICAgaWYgKF9yZXN1bHQuaXNOYU4oKSkge1xuICAgICAgcmV0dXJuIFNUUl9OQU47XG4gICAgfVxuICAgIG5ld0V4cHIgPSBuZXdFeHByLnJlcGxhY2UoQUREX09SX1NVQlRSQUNUX1JFR0VYLCBfcmVzdWx0LnRvU3RyaW5nKCkpO1xuICB9XG4gIHJldHVybiBuZXdFeHByO1xufVxudmFyIFBBUkVOVEhFU0VTX1JFR0VYID0gL1xcKChbXigpXSopXFwpLztcbmZ1bmN0aW9uIGNhbGN1bGF0ZVBhcmVudGhlc2VzKGV4cHIpIHtcbiAgdmFyIG5ld0V4cHIgPSBleHByO1xuICB2YXIgbWF0Y2g7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25kLWFzc2lnblxuICB3aGlsZSAoKG1hdGNoID0gUEFSRU5USEVTRVNfUkVHRVguZXhlYyhuZXdFeHByKSkgIT0gbnVsbCkge1xuICAgIHZhciBbLCBwYXJlbnRoZXRpY2FsRXhwcmVzc2lvbl0gPSBtYXRjaDtcbiAgICBuZXdFeHByID0gbmV3RXhwci5yZXBsYWNlKFBBUkVOVEhFU0VTX1JFR0VYLCBjYWxjdWxhdGVBcml0aG1ldGljKHBhcmVudGhldGljYWxFeHByZXNzaW9uKSk7XG4gIH1cbiAgcmV0dXJuIG5ld0V4cHI7XG59XG5mdW5jdGlvbiBldmFsdWF0ZUV4cHJlc3Npb24oZXhwcmVzc2lvbikge1xuICB2YXIgbmV3RXhwciA9IGV4cHJlc3Npb24ucmVwbGFjZSgvXFxzKy9nLCAnJyk7XG4gIG5ld0V4cHIgPSBjYWxjdWxhdGVQYXJlbnRoZXNlcyhuZXdFeHByKTtcbiAgbmV3RXhwciA9IGNhbGN1bGF0ZUFyaXRobWV0aWMobmV3RXhwcik7XG4gIHJldHVybiBuZXdFeHByO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHNhZmVFdmFsdWF0ZUV4cHJlc3Npb24oZXhwcmVzc2lvbikge1xuICB0cnkge1xuICAgIHJldHVybiBldmFsdWF0ZUV4cHJlc3Npb24oZXhwcmVzc2lvbik7XG4gIH0gY2F0Y2ggKF91bnVzZWQpIHtcbiAgICByZXR1cm4gU1RSX05BTjtcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIHJlZHVjZUNTU0NhbGMoZXhwcmVzc2lvbikge1xuICB2YXIgcmVzdWx0ID0gc2FmZUV2YWx1YXRlRXhwcmVzc2lvbihleHByZXNzaW9uLnNsaWNlKDUsIC0xKSk7XG4gIGlmIChyZXN1bHQgPT09IFNUUl9OQU4pIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn0iLCJmdW5jdGlvbiBfZXh0ZW5kcygpIHsgcmV0dXJuIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiA/IE9iamVjdC5hc3NpZ24uYmluZCgpIDogZnVuY3Rpb24gKG4pIHsgZm9yICh2YXIgZSA9IDE7IGUgPCBhcmd1bWVudHMubGVuZ3RoOyBlKyspIHsgdmFyIHQgPSBhcmd1bWVudHNbZV07IGZvciAodmFyIHIgaW4gdCkgKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIHIpICYmIChuW3JdID0gdFtyXSk7IH0gcmV0dXJuIG47IH0sIF9leHRlbmRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH1cbmZ1bmN0aW9uIG93bktleXMoZSwgcikgeyB2YXIgdCA9IE9iamVjdC5rZXlzKGUpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IHIgJiYgKG8gPSBvLmZpbHRlcihmdW5jdGlvbiAocikgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCByKS5lbnVtZXJhYmxlOyB9KSksIHQucHVzaC5hcHBseSh0LCBvKTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZChlKSB7IGZvciAodmFyIHIgPSAxOyByIDwgYXJndW1lbnRzLmxlbmd0aDsgcisrKSB7IHZhciB0ID0gbnVsbCAhPSBhcmd1bWVudHNbcl0gPyBhcmd1bWVudHNbcl0gOiB7fTsgciAlIDIgPyBvd25LZXlzKE9iamVjdCh0KSwgITApLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgX2RlZmluZVByb3BlcnR5KGUsIHIsIHRbcl0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModCkpIDogb3duS2V5cyhPYmplY3QodCkpLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCwgcikpOyB9KTsgfSByZXR1cm4gZTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGUsIHIsIHQpIHsgcmV0dXJuIChyID0gX3RvUHJvcGVydHlLZXkocikpIGluIGUgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgeyB2YWx1ZTogdCwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSA6IGVbcl0gPSB0LCBlOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleSh0KSB7IHZhciBpID0gX3RvUHJpbWl0aXZlKHQsIFwic3RyaW5nXCIpOyByZXR1cm4gXCJzeW1ib2xcIiA9PSB0eXBlb2YgaSA/IGkgOiBpICsgXCJcIjsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKHQsIHIpIHsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIHQgfHwgIXQpIHJldHVybiB0OyB2YXIgZSA9IHRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHZvaWQgMCAhPT0gZSkgeyB2YXIgaSA9IGUuY2FsbCh0LCByIHx8IFwiZGVmYXVsdFwiKTsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIGkpIHJldHVybiBpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChcInN0cmluZ1wiID09PSByID8gU3RyaW5nIDogTnVtYmVyKSh0KTsgfVxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgU2hhcGUsIGdldFByb3BzRnJvbVNoYXBlT3B0aW9uIH0gZnJvbSAnLi9BY3RpdmVTaGFwZVV0aWxzJztcblxuLy8gVHJhcGV6b2lkIHByb3BzIGlzIGV4cGVjdGluZyB4LCB5LCBoZWlnaHQgYXMgbnVtYmVycy5cbi8vIFdoZW4gcHJvcHMgYXJlIGJlaW5nIHNwcmVhZCBpbiBmcm9tIGEgdXNlciBkZWZpbmVkIGNvbXBvbmVudCBpbiBGdW5uZWwsXG4vLyB0aGUgcHJvcCB0eXBlcyBvZiBhbiBTVkdFbGVtZW50IGhhdmUgdGhlc2UgdHlwZWQgYXMgc3RyaW5nIHwgbnVtYmVyLlxuLy8gVGhpcyBmdW5jdGlvbiB3aWxsIHJldHVybiB0aGUgcGFzc2VkIGluIHByb3BzIGFsb25nIHdpdGggeCwgeSwgaGVpZ2h0IGFzIG51bWJlcnMuXG5leHBvcnQgZnVuY3Rpb24gdHlwZUd1YXJkVHJhcGV6b2lkUHJvcHMob3B0aW9uLCBwcm9wcykge1xuICB2YXIgeFZhbHVlID0gXCJcIi5jb25jYXQocHJvcHMueCB8fCBvcHRpb24ueCk7XG4gIHZhciB4ID0gcGFyc2VJbnQoeFZhbHVlLCAxMCk7XG4gIHZhciB5VmFsdWUgPSBcIlwiLmNvbmNhdChwcm9wcy55IHx8IG9wdGlvbi55KTtcbiAgdmFyIHkgPSBwYXJzZUludCh5VmFsdWUsIDEwKTtcbiAgdmFyIGhlaWdodFZhbHVlID0gXCJcIi5jb25jYXQoKHByb3BzID09PSBudWxsIHx8IHByb3BzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwcm9wcy5oZWlnaHQpIHx8IChvcHRpb24gPT09IG51bGwgfHwgb3B0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb24uaGVpZ2h0KSk7XG4gIHZhciBoZWlnaHQgPSBwYXJzZUludChoZWlnaHRWYWx1ZSwgMTApO1xuICByZXR1cm4gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHByb3BzKSwgZ2V0UHJvcHNGcm9tU2hhcGVPcHRpb24ob3B0aW9uKSksIHt9LCB7XG4gICAgaGVpZ2h0LFxuICAgIHgsXG4gICAgeVxuICB9KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBGdW5uZWxUcmFwZXpvaWQocHJvcHMpIHtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNoYXBlLCBfZXh0ZW5kcyh7XG4gICAgc2hhcGVUeXBlOiBcInRyYXBlem9pZFwiLFxuICAgIHByb3BUcmFuc2Zvcm1lcjogdHlwZUd1YXJkVHJhcGV6b2lkUHJvcHNcbiAgfSwgcHJvcHMpKTtcbn0iLCJpbXBvcnQgZ2V0IGZyb20gJ2VzLXRvb2xraXQvY29tcGF0L2dldCc7XG5pbXBvcnQgeyBDaGlsZHJlbiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGlzRnJhZ21lbnQgfSBmcm9tICdyZWFjdC1pcyc7XG5pbXBvcnQgeyBpc051bGxpc2ggfSBmcm9tICcuL0RhdGFVdGlscyc7XG5leHBvcnQgdmFyIFNDQUxFX1RZUEVTID0gWydhdXRvJywgJ2xpbmVhcicsICdwb3cnLCAnc3FydCcsICdsb2cnLCAnaWRlbnRpdHknLCAndGltZScsICdiYW5kJywgJ3BvaW50JywgJ29yZGluYWwnLCAncXVhbnRpbGUnLCAncXVhbnRpemUnLCAndXRjJywgJ3NlcXVlbnRpYWwnLCAndGhyZXNob2xkJ107XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgaW5zdGVhZCBmaW5kIGFub3RoZXIgYXBwcm9hY2ggdGhhdCBkb2VzIG5vdCBkZXBlbmQgb24gZGlzcGxheU5hbWUuXG4gKiBHZXQgdGhlIGRpc3BsYXkgbmFtZSBvZiBhIGNvbXBvbmVudFxuICogQHBhcmFtICB7T2JqZWN0fSBDb21wIFNwZWNpZmllZCBDb21wb25lbnRcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgICBEaXNwbGF5IG5hbWUgb2YgQ29tcG9uZW50XG4gKi9cbmV4cG9ydCB2YXIgZ2V0RGlzcGxheU5hbWUgPSBDb21wID0+IHtcbiAgaWYgKHR5cGVvZiBDb21wID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBDb21wO1xuICB9XG4gIGlmICghQ29tcCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuICByZXR1cm4gQ29tcC5kaXNwbGF5TmFtZSB8fCBDb21wLm5hbWUgfHwgJ0NvbXBvbmVudCc7XG59O1xuXG4vLyBgdG9BcnJheWAgZ2V0cyBjYWxsZWQgbXVsdGlwbGUgdGltZXMgZHVyaW5nIHRoZSByZW5kZXJcbi8vIHNvIHdlIGNhbiBtZW1vaXplIGxhc3QgaW52b2NhdGlvbiAoc2luY2UgcmVmZXJlbmNlIHRvIGBjaGlsZHJlbmAgaXMgdGhlIHNhbWUpXG52YXIgbGFzdENoaWxkcmVuID0gbnVsbDtcbnZhciBsYXN0UmVzdWx0ID0gbnVsbDtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZCBpbnN0ZWFkIGZpbmQgYW5vdGhlciBhcHByb2FjaCB0aGF0IGRvZXMgbm90IHJlcXVpcmUgcmVhZGluZyBSZWFjdCBFbGVtZW50cyBmcm9tIERPTS5cbiAqXG4gKiBAcGFyYW0gY2hpbGRyZW4gZG8gbm90IHVzZVxuICogQHJldHVybiBkZXByZWNhdGVkIGRvIG5vdCB1c2VcbiAqL1xuZXhwb3J0IHZhciB0b0FycmF5ID0gY2hpbGRyZW4gPT4ge1xuICBpZiAoY2hpbGRyZW4gPT09IGxhc3RDaGlsZHJlbiAmJiBBcnJheS5pc0FycmF5KGxhc3RSZXN1bHQpKSB7XG4gICAgcmV0dXJuIGxhc3RSZXN1bHQ7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBDaGlsZHJlbi5mb3JFYWNoKGNoaWxkcmVuLCBjaGlsZCA9PiB7XG4gICAgaWYgKGlzTnVsbGlzaChjaGlsZCkpIHJldHVybjtcbiAgICBpZiAoaXNGcmFnbWVudChjaGlsZCkpIHtcbiAgICAgIHJlc3VsdCA9IHJlc3VsdC5jb25jYXQodG9BcnJheShjaGlsZC5wcm9wcy5jaGlsZHJlbikpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRoaXMgY291bGQgc3RpbGwgYmUgSXRlcmFibGU8UmVhY3ROb2RlPiBhbmQgVFMgZG9lcyBub3QgbGlrZSB0aGF0XG4gICAgICByZXN1bHQucHVzaChjaGlsZCk7XG4gICAgfVxuICB9KTtcbiAgbGFzdFJlc3VsdCA9IHJlc3VsdDtcbiAgbGFzdENoaWxkcmVuID0gY2hpbGRyZW47XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEBkZXByZWNhdGVkIGluc3RlYWQgZmluZCBhbm90aGVyIGFwcHJvYWNoIHRoYXQgZG9lcyBub3QgcmVxdWlyZSByZWFkaW5nIFJlYWN0IEVsZW1lbnRzIGZyb20gRE9NLlxuICpcbiAqIEZpbmQgYW5kIHJldHVybiBhbGwgbWF0Y2hlZCBjaGlsZHJlbiBieSB0eXBlLlxuICogYHR5cGVgIG11c3QgYmUgYSBSZWFjdC5Db21wb25lbnRUeXBlXG4gKlxuICogQHBhcmFtIGNoaWxkcmVuIGRvIG5vdCB1c2VcbiAqIEBwYXJhbSB0eXBlIGRvIG5vdCB1c2VcbiAqIEByZXR1cm4gZGVwcmVjYXRlZCBkbyBub3QgdXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kQWxsQnlUeXBlKGNoaWxkcmVuLCB0eXBlKSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIHR5cGVzID0gW107XG4gIGlmIChBcnJheS5pc0FycmF5KHR5cGUpKSB7XG4gICAgdHlwZXMgPSB0eXBlLm1hcCh0ID0+IGdldERpc3BsYXlOYW1lKHQpKTtcbiAgfSBlbHNlIHtcbiAgICB0eXBlcyA9IFtnZXREaXNwbGF5TmFtZSh0eXBlKV07XG4gIH1cbiAgdG9BcnJheShjaGlsZHJlbikuZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgdmFyIGNoaWxkVHlwZSA9IGdldChjaGlsZCwgJ3R5cGUuZGlzcGxheU5hbWUnKSB8fCBnZXQoY2hpbGQsICd0eXBlLm5hbWUnKTtcbiAgICAvLyB0cy1leHBlY3QtZXJyb3IgdG9BcnJheSBhbmQgbG9kYXNoLmdldCBhcmUgbm90IGNvbXBhdGlibGUuIExldCdzIGdldCByaWQgb2YgdGhlIHdob2xlIGZpbmRBbGxCeVR5cGUgZnVuY3Rpb25cbiAgICBpZiAodHlwZXMuaW5kZXhPZihjaGlsZFR5cGUpICE9PSAtMSkge1xuICAgICAgcmVzdWx0LnB1c2goY2hpbGQpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5leHBvcnQgdmFyIGlzQ2xpcERvdCA9IGRvdCA9PiB7XG4gIGlmIChkb3QgJiYgdHlwZW9mIGRvdCA9PT0gJ29iamVjdCcgJiYgJ2NsaXBEb3QnIGluIGRvdCkge1xuICAgIHJldHVybiBCb29sZWFuKGRvdC5jbGlwRG90KTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07IiwiLyoqXG4gKiBDb21wdXRlcyB0aGUgY2hhcnQgY29vcmRpbmF0ZXMgZnJvbSB0aGUgbW91c2UgZXZlbnQuXG4gKlxuICogVGhlIGNvb3JkaW5hdGVzIGFyZSByZWxhdGl2ZSB0byB0aGUgdG9wLWxlZnQgY29ybmVyIG9mIHRoZSBjaGFydCxcbiAqIHdoZXJlIHRoZSB0b3AtbGVmdCBjb3JuZXIgb2YgdGhlIGNoYXJ0IGlzICgwLCAwKS5cbiAqIE1vdmluZyByaWdodCwgdGhlIHgtY29vcmRpbmF0ZSBpbmNyZWFzZXMsIGFuZCBtb3ZpbmcgZG93biwgdGhlIHktY29vcmRpbmF0ZSBpbmNyZWFzZXMuXG4gKlxuICogVGhlIGNvb3JkaW5hdGVzIGFyZSByb3VuZGVkIHRvIHRoZSBuZWFyZXN0IGludGVnZXIgYW5kIGFyZSBpbmNsdWRpbmcgYSBDU1MgdHJhbnNmb3JtIHNjYWxlLlxuICogU28gYSBjaGFydCB0aGF0J3Mgc2NhbGVkIHdpbGwgcmV0dXJuIHRoZSBzYW1lIGNvb3JkaW5hdGVzIGFzIGEgY2hhcnQgdGhhdCdzIG5vdCBzY2FsZWQuXG4gKlxuICogQHBhcmFtIGV2ZW50IFRoZSBtb3VzZSBldmVudCBmcm9tIFJlYWN0IGV2ZW50IGhhbmRsZXJzXG4gKiBAcmV0dXJuIGNoYXJ0UG9pbnRlciBUaGUgY2hhcnQgY29vcmRpbmF0ZXMgcmVsYXRpdmUgdG8gdGhlIHRvcC1sZWZ0IGNvcm5lciBvZiB0aGUgY2hhcnRcbiAqL1xuZXhwb3J0IHZhciBnZXRDaGFydFBvaW50ZXIgPSBldmVudCA9PiB7XG4gIHZhciByZWN0ID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIHNjYWxlWCA9IHJlY3Qud2lkdGggLyBldmVudC5jdXJyZW50VGFyZ2V0Lm9mZnNldFdpZHRoO1xuICB2YXIgc2NhbGVZID0gcmVjdC5oZWlnaHQgLyBldmVudC5jdXJyZW50VGFyZ2V0Lm9mZnNldEhlaWdodDtcbiAgcmV0dXJuIHtcbiAgICAvKlxuICAgICAqIEhlcmUgaXQncyBpbXBvcnRhbnQgdG8gdXNlOlxuICAgICAqIC0gZXZlbnQuY2xpZW50WCBhbmQgZXZlbnQuY2xpZW50WSB0byBnZXQgdGhlIG1vdXNlIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHRoZSB2aWV3cG9ydCwgaW5jbHVkaW5nIHNjcm9sbC5cbiAgICAgKiAtIHBhZ2VYIGFuZCBwYWdlWSBhcmUgbm90IHVzZWQgYmVjYXVzZSB0aGV5IGFyZSByZWxhdGl2ZSB0byB0aGUgd2hvbGUgZG9jdW1lbnQsIGFuZCBpZ25vcmUgc2Nyb2xsLlxuICAgICAqIC0gcmVjdC5sZWZ0IGFuZCByZWN0LnRvcCBhcmUgdXNlZCB0byBnZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBjaGFydCByZWxhdGl2ZSB0byB0aGUgdmlld3BvcnQuXG4gICAgICogLSBvZmZzZXRYIGFuZCBvZmZzZXRZIGFyZSBub3QgdXNlZCBiZWNhdXNlIHRoZXkgYXJlIHJlbGF0aXZlIHRvIHRoZSBvZmZzZXQgcGFyZW50XG4gICAgICogIHdoaWNoIG1heSBvciBtYXkgbm90IGJlIHRoZSBzYW1lIGFzIHRoZSBjbGllbnRYIGFuZCBjbGllbnRZLCBkZXBlbmRpbmcgb24gdGhlIHBvc2l0aW9uIG9mIHRoZSBjaGFydCBpbiB0aGUgRE9NXG4gICAgICogIGFuZCBzdXJyb3VuZGluZyBlbGVtZW50IHN0eWxlcy4gQ1NTIHBvc2l0aW9uOiByZWxhdGl2ZSwgYWJzb2x1dGUsIGZpeGVkLCB3aWxsIGNoYW5nZSB0aGUgb2Zmc2V0IHBhcmVudC5cbiAgICAgKiAtIHNjYWxlWCBhbmQgc2NhbGVZIGFyZSBuZWNlc3NhcnkgZm9yIHdoZW4gdGhlIGNoYXJ0IGVsZW1lbnQgaXMgc2NhbGVkIHVzaW5nIENTUyBgdHJhbnNmb3JtOiBzY2FsZShOKWAuXG4gICAgICovXG4gICAgY2hhcnRYOiBNYXRoLnJvdW5kKChldmVudC5jbGllbnRYIC0gcmVjdC5sZWZ0KSAvIHNjYWxlWCksXG4gICAgY2hhcnRZOiBNYXRoLnJvdW5kKChldmVudC5jbGllbnRZIC0gcmVjdC50b3ApIC8gc2NhbGVZKVxuICB9O1xufTsiLCJpbXBvcnQgeyBzdmdQcm9wZXJ0aWVzTm9FdmVudHNGcm9tVW5rbm93biB9IGZyb20gJy4vc3ZnUHJvcGVydGllc05vRXZlbnRzJztcbmV4cG9ydCBmdW5jdGlvbiBnZXRSYWRpdXNBbmRTdHJva2VXaWR0aEZyb21Eb3QoZG90KSB7XG4gIHZhciBwcm9wcyA9IHN2Z1Byb3BlcnRpZXNOb0V2ZW50c0Zyb21Vbmtub3duKGRvdCk7XG4gIHZhciBkZWZhdWx0UiA9IDM7XG4gIHZhciBkZWZhdWx0U3Ryb2tlV2lkdGggPSAyO1xuICBpZiAocHJvcHMgIT0gbnVsbCkge1xuICAgIHZhciB7XG4gICAgICByLFxuICAgICAgc3Ryb2tlV2lkdGhcbiAgICB9ID0gcHJvcHM7XG4gICAgdmFyIHJlYWxSID0gTnVtYmVyKHIpO1xuICAgIHZhciByZWFsU3Ryb2tlV2lkdGggPSBOdW1iZXIoc3Ryb2tlV2lkdGgpO1xuICAgIGlmIChOdW1iZXIuaXNOYU4ocmVhbFIpIHx8IHJlYWxSIDwgMCkge1xuICAgICAgcmVhbFIgPSBkZWZhdWx0UjtcbiAgICB9XG4gICAgaWYgKE51bWJlci5pc05hTihyZWFsU3Ryb2tlV2lkdGgpIHx8IHJlYWxTdHJva2VXaWR0aCA8IDApIHtcbiAgICAgIHJlYWxTdHJva2VXaWR0aCA9IGRlZmF1bHRTdHJva2VXaWR0aDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHI6IHJlYWxSLFxuICAgICAgc3Ryb2tlV2lkdGg6IHJlYWxTdHJva2VXaWR0aFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHtcbiAgICByOiBkZWZhdWx0UixcbiAgICBzdHJva2VXaWR0aDogZGVmYXVsdFN0cm9rZVdpZHRoXG4gIH07XG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9