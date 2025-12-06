"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[2135],{

/***/ 2613:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   s: () => (/* binding */ ReportMainChartProps)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12070);
/* harmony import */ var _layoutSlice__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(66426);
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(49082);





/**
 * "Main" props are props that are only accepted on the main chart,
 * as opposed to the small panorama chart inside a Brush.
 */

function ReportMainChartProps(_ref) {
  var {
    layout,
    margin
  } = _ref;
  var dispatch = (0,_hooks__WEBPACK_IMPORTED_MODULE_3__/* .useAppDispatch */ .j)();

  /*
   * Skip dispatching properties in panorama chart for two reasons:
   * 1. The root chart should be deciding on these properties, and
   * 2. Brush reads these properties from redux store, and so they must remain stable
   *      to avoid circular dependency and infinite re-rendering.
   */
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_1__/* .useIsPanorama */ .r)();
  /*
   * useEffect here is required to avoid the "Cannot update a component while rendering a different component" error.
   * https://github.com/facebook/react/issues/18178
   *
   * Reported in https://github.com/recharts/recharts/issues/5514
   */
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!isPanorama) {
      dispatch((0,_layoutSlice__WEBPACK_IMPORTED_MODULE_2__/* .setLayout */ .JK)(layout));
      dispatch((0,_layoutSlice__WEBPACK_IMPORTED_MODULE_2__/* .setMargin */ .B_)(margin));
    }
  }, [dispatch, isPanorama, layout, margin]);
  return null;
}

/***/ }),

/***/ 2658:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A3: () => (/* binding */ setBrushSettings),
/* harmony export */   rT: () => (/* binding */ brushReducer)
/* harmony export */ });
/* unused harmony export brushSlice */
/* harmony import */ var _reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4768);


/**
 * From all Brush properties, only height has a default value and will always be defined.
 * Other properties are nullable and will be computed from offsets and margins if they are not set.
 */

var initialState = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  padding: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
};
var brushSlice = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .createSlice */ .Z0)({
  name: 'brush',
  initialState,
  reducers: {
    setBrushSettings(_state, action) {
      if (action.payload == null) {
        return initialState;
      }
      return action.payload;
    }
  }
});
var {
  setBrushSettings
} = brushSlice.actions;
var brushReducer = brushSlice.reducer;

/***/ }),

/***/ 11970:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   J: () => (/* binding */ RechartsStoreProvider)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(43660);
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(43416);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(12070);
/* harmony import */ var _RechartsReduxContext__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(92649);






function RechartsStoreProvider(_ref) {
  var {
    preloadedState,
    children,
    reduxStoreName
  } = _ref;
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_3__/* .useIsPanorama */ .r)();
  /*
   * Why the ref? Redux official documentation recommends to use store as a singleton,
   * and reuse that everywhere: https://redux-toolkit.js.org/api/configureStore#basic-example
   *
   * Which is correct! Except that is considering deploying Redux in an app.
   * Recharts as a library supports multiple charts on the same page.
   * And each of these charts needs its own store independent of others!
   *
   * The alternative is to have everything in the store keyed by the chart id.
   * Which would make working with everything a little bit more painful because we need the chart id everywhere.
   */
  var storeRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);

  /*
   * Panorama means that this chart is not its own chart, it's only a "preview"
   * being rendered as a child of Brush.
   * In such case, it should not have a store on its own - it should implicitly inherit
   * whatever data is in the "parent" or "root" chart.
   * Which here is represented by not having a Provider at all. All selectors will use the root store by default.
   */
  if (isPanorama) {
    return children;
  }
  if (storeRef.current == null) {
    storeRef.current = (0,_store__WEBPACK_IMPORTED_MODULE_2__/* .createRechartsStore */ .E)(preloadedState, reduxStoreName);
  }

  // ts-expect-error React-Redux types demand that the context internal value is not null, but we have that as default.
  var nonNullContext = _RechartsReduxContext__WEBPACK_IMPORTED_MODULE_4__/* .RechartsReduxContext */ .E;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react_redux__WEBPACK_IMPORTED_MODULE_1__/* .Provider */ .Kq, {
    context: nonNullContext,
    store: storeRef.current
  }, children);
}

/***/ }),

/***/ 15036:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   P: () => (/* binding */ ReportPolarOptions)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(49082);
/* harmony import */ var _polarOptionsSlice__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(19794);



function ReportPolarOptions(props) {
  var dispatch = (0,_hooks__WEBPACK_IMPORTED_MODULE_1__/* .useAppDispatch */ .j)();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    dispatch((0,_polarOptionsSlice__WEBPACK_IMPORTED_MODULE_2__/* .updatePolarOptions */ .U)(props));
  }, [dispatch, props]);
  return null;
}

/***/ }),

/***/ 19797:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (/* binding */ SetLegendPayload),
/* harmony export */   _: () => (/* binding */ SetPolarLegendPayload)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12070);
/* harmony import */ var _context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(19287);
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(49082);
/* harmony import */ var _legendSlice__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(91283);





var noop = () => {};
function SetLegendPayload(_ref) {
  var {
    legendPayload
  } = _ref;
  var dispatch = (0,_hooks__WEBPACK_IMPORTED_MODULE_3__/* .useAppDispatch */ .j)();
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_1__/* .useIsPanorama */ .r)();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    if (isPanorama) {
      return noop;
    }
    dispatch((0,_legendSlice__WEBPACK_IMPORTED_MODULE_4__/* .addLegendPayload */ .Lx)(legendPayload));
    return () => {
      dispatch((0,_legendSlice__WEBPACK_IMPORTED_MODULE_4__/* .removeLegendPayload */ .u3)(legendPayload));
    };
  }, [dispatch, isPanorama, legendPayload]);
  return null;
}
function SetPolarLegendPayload(_ref2) {
  var {
    legendPayload
  } = _ref2;
  var dispatch = (0,_hooks__WEBPACK_IMPORTED_MODULE_3__/* .useAppDispatch */ .j)();
  var layout = (0,_hooks__WEBPACK_IMPORTED_MODULE_3__/* .useAppSelector */ .G)(_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_2__/* .selectChartLayout */ .fz);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    if (layout !== 'centric' && layout !== 'radial') {
      return noop;
    }
    dispatch((0,_legendSlice__WEBPACK_IMPORTED_MODULE_4__/* .addLegendPayload */ .Lx)(legendPayload));
    return () => {
      dispatch((0,_legendSlice__WEBPACK_IMPORTED_MODULE_4__/* .removeLegendPayload */ .u3)(legendPayload));
    };
  }, [dispatch, layout, legendPayload]);
  return null;
}

/***/ }),

/***/ 20852:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   t: () => (/* binding */ Polygon)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(80196);
var _excluded = ["points", "className", "baseLinePoints", "connectNulls"];
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
/**
 * @fileOverview Polygon
 */



var isValidatePoint = point => {
  return point && point.x === +point.x && point.y === +point.y;
};
var getParsedPoints = function getParsedPoints() {
  var points = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var segmentPoints = [[]];
  points.forEach(entry => {
    if (isValidatePoint(entry)) {
      segmentPoints[segmentPoints.length - 1].push(entry);
    } else if (segmentPoints[segmentPoints.length - 1].length > 0) {
      // add another path
      segmentPoints.push([]);
    }
  });
  if (isValidatePoint(points[0])) {
    segmentPoints[segmentPoints.length - 1].push(points[0]);
  }
  if (segmentPoints[segmentPoints.length - 1].length <= 0) {
    segmentPoints = segmentPoints.slice(0, -1);
  }
  return segmentPoints;
};
var getSinglePolygonPath = (points, connectNulls) => {
  var segmentPoints = getParsedPoints(points);
  if (connectNulls) {
    segmentPoints = [segmentPoints.reduce((res, segPoints) => {
      return [...res, ...segPoints];
    }, [])];
  }
  var polygonPath = segmentPoints.map(segPoints => {
    return segPoints.reduce((path, point, index) => {
      return "".concat(path).concat(index === 0 ? 'M' : 'L').concat(point.x, ",").concat(point.y);
    }, '');
  }).join('');
  return segmentPoints.length === 1 ? "".concat(polygonPath, "Z") : polygonPath;
};
var getRanglePath = (points, baseLinePoints, connectNulls) => {
  var outerPath = getSinglePolygonPath(points, connectNulls);
  return "".concat(outerPath.slice(-1) === 'Z' ? outerPath.slice(0, -1) : outerPath, "L").concat(getSinglePolygonPath(Array.from(baseLinePoints).reverse(), connectNulls).slice(1));
};
var Polygon = props => {
  var {
      points,
      className,
      baseLinePoints,
      connectNulls
    } = props,
    others = _objectWithoutProperties(props, _excluded);
  if (!points || !points.length) {
    return null;
  }
  var layerClass = (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-polygon', className);
  if (baseLinePoints && baseLinePoints.length) {
    var hasStroke = others.stroke && others.stroke !== 'none';
    var rangePath = getRanglePath(points, baseLinePoints, connectNulls);
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", {
      className: layerClass
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", _extends({}, (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_2__/* .svgPropertiesAndEvents */ .a)(others), {
      fill: rangePath.slice(-1) === 'Z' ? others.fill : 'none',
      stroke: "none",
      d: rangePath
    })), hasStroke ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", _extends({}, (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_2__/* .svgPropertiesAndEvents */ .a)(others), {
      fill: "none",
      d: getSinglePolygonPath(points, connectNulls)
    })) : null, hasStroke ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", _extends({}, (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_2__/* .svgPropertiesAndEvents */ .a)(others), {
      fill: "none",
      d: getSinglePolygonPath(baseLinePoints, connectNulls)
    })) : null);
  }
  var singlePath = getSinglePolygonPath(points, connectNulls);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", _extends({}, (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_2__/* .svgPropertiesAndEvents */ .a)(others), {
    fill: singlePath.slice(-1) === 'Z' ? others.fill : 'none',
    className: layerClass,
    d: singlePath
  }));
};

/***/ }),

/***/ 32117:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   I: () => (/* binding */ removeErrorBar),
/* harmony export */   Qk: () => (/* binding */ errorBarReducer),
/* harmony export */   UL: () => (/* binding */ replaceErrorBar),
/* harmony export */   h7: () => (/* binding */ addErrorBar)
/* harmony export */ });
/* harmony import */ var _reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4768);


/**
 * ErrorBars have lot more settings but all the others are scoped to the component itself.
 * Only some of them required to be reported to the global store because XAxis and YAxis need to know
 * if the error bar is contributing to extending the axis domain.
 */

var initialState = {};
var errorBarSlice = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .createSlice */ .Z0)({
  name: 'errorBars',
  initialState,
  reducers: {
    addErrorBar: (state, action) => {
      var {
        itemId,
        errorBar
      } = action.payload;
      if (!state[itemId]) {
        state[itemId] = [];
      }
      state[itemId].push(errorBar);
    },
    replaceErrorBar: (state, action) => {
      var {
        itemId,
        prev,
        next
      } = action.payload;
      if (state[itemId]) {
        state[itemId] = state[itemId].map(e => e.dataKey === prev.dataKey && e.direction === prev.direction ? next : e);
      }
    },
    removeErrorBar: (state, action) => {
      var {
        itemId,
        errorBar
      } = action.payload;
      if (state[itemId]) {
        state[itemId] = state[itemId].filter(e => e.dataKey !== errorBar.dataKey || e.direction !== errorBar.direction);
      }
    }
  }
});
var {
  addErrorBar,
  replaceErrorBar,
  removeErrorBar
} = errorBarSlice.actions;
var errorBarReducer = errorBarSlice.reducer;

/***/ }),

/***/ 34723:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   M: () => (/* binding */ Rectangle)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(77404);
/* harmony import */ var _animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(31528);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(59744);
/* harmony import */ var _util_useAnimationId__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8107);
/* harmony import */ var _animation_util__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(23929);
/* harmony import */ var _util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(80196);
var _excluded = ["radius"],
  _excluded2 = ["radius"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
/**
 * @fileOverview Rectangle
 */









var getRectanglePath = (x, y, width, height, radius) => {
  var maxRadius = Math.min(Math.abs(width) / 2, Math.abs(height) / 2);
  var ySign = height >= 0 ? 1 : -1;
  var xSign = width >= 0 ? 1 : -1;
  var clockWise = height >= 0 && width >= 0 || height < 0 && width < 0 ? 1 : 0;
  var path;
  if (maxRadius > 0 && radius instanceof Array) {
    var newRadius = [0, 0, 0, 0];
    for (var i = 0, len = 4; i < len; i++) {
      newRadius[i] = radius[i] > maxRadius ? maxRadius : radius[i];
    }
    path = "M".concat(x, ",").concat(y + ySign * newRadius[0]);
    if (newRadius[0] > 0) {
      path += "A ".concat(newRadius[0], ",").concat(newRadius[0], ",0,0,").concat(clockWise, ",").concat(x + xSign * newRadius[0], ",").concat(y);
    }
    path += "L ".concat(x + width - xSign * newRadius[1], ",").concat(y);
    if (newRadius[1] > 0) {
      path += "A ".concat(newRadius[1], ",").concat(newRadius[1], ",0,0,").concat(clockWise, ",\n        ").concat(x + width, ",").concat(y + ySign * newRadius[1]);
    }
    path += "L ".concat(x + width, ",").concat(y + height - ySign * newRadius[2]);
    if (newRadius[2] > 0) {
      path += "A ".concat(newRadius[2], ",").concat(newRadius[2], ",0,0,").concat(clockWise, ",\n        ").concat(x + width - xSign * newRadius[2], ",").concat(y + height);
    }
    path += "L ".concat(x + xSign * newRadius[3], ",").concat(y + height);
    if (newRadius[3] > 0) {
      path += "A ".concat(newRadius[3], ",").concat(newRadius[3], ",0,0,").concat(clockWise, ",\n        ").concat(x, ",").concat(y + height - ySign * newRadius[3]);
    }
    path += 'Z';
  } else if (maxRadius > 0 && radius === +radius && radius > 0) {
    var _newRadius = Math.min(maxRadius, radius);
    path = "M ".concat(x, ",").concat(y + ySign * _newRadius, "\n            A ").concat(_newRadius, ",").concat(_newRadius, ",0,0,").concat(clockWise, ",").concat(x + xSign * _newRadius, ",").concat(y, "\n            L ").concat(x + width - xSign * _newRadius, ",").concat(y, "\n            A ").concat(_newRadius, ",").concat(_newRadius, ",0,0,").concat(clockWise, ",").concat(x + width, ",").concat(y + ySign * _newRadius, "\n            L ").concat(x + width, ",").concat(y + height - ySign * _newRadius, "\n            A ").concat(_newRadius, ",").concat(_newRadius, ",0,0,").concat(clockWise, ",").concat(x + width - xSign * _newRadius, ",").concat(y + height, "\n            L ").concat(x + xSign * _newRadius, ",").concat(y + height, "\n            A ").concat(_newRadius, ",").concat(_newRadius, ",0,0,").concat(clockWise, ",").concat(x, ",").concat(y + height - ySign * _newRadius, " Z");
  } else {
    path = "M ".concat(x, ",").concat(y, " h ").concat(width, " v ").concat(height, " h ").concat(-width, " Z");
  }
  return path;
};
var defaultProps = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  // The radius of border
  // The radius of four corners when radius is a number
  // The radius of left-top, right-top, right-bottom, left-bottom when radius is an array
  radius: 0,
  isAnimationActive: false,
  isUpdateAnimationActive: false,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease'
};
var Rectangle = rectangleProps => {
  var props = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_2__/* .resolveDefaultProps */ .e)(rectangleProps, defaultProps);
  var pathRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  var [totalLength, setTotalLength] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(-1);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (pathRef.current && pathRef.current.getTotalLength) {
      try {
        var pathTotalLength = pathRef.current.getTotalLength();
        if (pathTotalLength) {
          setTotalLength(pathTotalLength);
        }
      } catch (_unused) {
        // calculate total length error
      }
    }
  }, []);
  var {
    x,
    y,
    width,
    height,
    radius,
    className
  } = props;
  var {
    animationEasing,
    animationDuration,
    animationBegin,
    isAnimationActive,
    isUpdateAnimationActive
  } = props;
  var prevWidthRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(width);
  var prevHeightRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(height);
  var prevXRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(x);
  var prevYRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(y);
  var animationIdInput = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    x,
    y,
    width,
    height,
    radius
  }), [x, y, width, height, radius]);
  var animationId = (0,_util_useAnimationId__WEBPACK_IMPORTED_MODULE_5__/* .useAnimationId */ .n)(animationIdInput, 'rectangle-');
  if (x !== +x || y !== +y || width !== +width || height !== +height || width === 0 || height === 0) {
    return null;
  }
  var layerClass = (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-rectangle', className);
  if (!isUpdateAnimationActive) {
    var _svgPropertiesAndEven = (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_7__/* .svgPropertiesAndEvents */ .a)(props),
      {
        radius: _
      } = _svgPropertiesAndEven,
      otherPathProps = _objectWithoutProperties(_svgPropertiesAndEven, _excluded);
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", _extends({}, otherPathProps, {
      radius: typeof radius === 'number' ? radius : undefined,
      className: layerClass,
      d: getRectanglePath(x, y, width, height, radius)
    }));
  }
  var prevWidth = prevWidthRef.current;
  var prevHeight = prevHeightRef.current;
  var prevX = prevXRef.current;
  var prevY = prevYRef.current;
  var from = "0px ".concat(totalLength === -1 ? 1 : totalLength, "px");
  var to = "".concat(totalLength, "px 0px");
  var transition = (0,_animation_util__WEBPACK_IMPORTED_MODULE_6__/* .getTransitionVal */ .dl)(['strokeDasharray'], animationDuration, typeof animationEasing === 'string' ? animationEasing : undefined);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_3__/* .JavascriptAnimate */ .J, {
    animationId: animationId,
    key: animationId,
    canBegin: totalLength > 0,
    duration: animationDuration,
    easing: animationEasing,
    isActive: isUpdateAnimationActive,
    begin: animationBegin
  }, t => {
    var currWidth = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_4__/* .interpolate */ .GW)(prevWidth, width, t);
    var currHeight = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_4__/* .interpolate */ .GW)(prevHeight, height, t);
    var currX = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_4__/* .interpolate */ .GW)(prevX, x, t);
    var currY = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_4__/* .interpolate */ .GW)(prevY, y, t);
    if (pathRef.current) {
      prevWidthRef.current = currWidth;
      prevHeightRef.current = currHeight;
      prevXRef.current = currX;
      prevYRef.current = currY;
    }
    var animationStyle;
    if (!isAnimationActive) {
      animationStyle = {
        strokeDasharray: to
      };
    } else if (t > 0) {
      animationStyle = {
        transition,
        strokeDasharray: to
      };
    } else {
      animationStyle = {
        strokeDasharray: from
      };
    }
    var _svgPropertiesAndEven2 = (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_7__/* .svgPropertiesAndEvents */ .a)(props),
      {
        radius: _
      } = _svgPropertiesAndEven2,
      otherPathProps = _objectWithoutProperties(_svgPropertiesAndEven2, _excluded2);
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", _extends({}, otherPathProps, {
      radius: typeof radius === 'number' ? radius : undefined,
      className: layerClass,
      d: getRectanglePath(currX, currY, currWidth, currHeight, radius),
      ref: pathRef,
      style: _objectSpread(_objectSpread({}, animationStyle), props.style)
    }));
  });
};

/***/ }),

/***/ 35862:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   F: () => (/* binding */ Cross)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(59744);
/* harmony import */ var _util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(80196);
var _excluded = ["x", "y", "top", "left", "width", "height", "className"];
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
/**
 * @fileOverview Cross
 */




var getPath = (x, y, width, height, top, left) => {
  return "M".concat(x, ",").concat(top, "v").concat(height, "M").concat(left, ",").concat(y, "h").concat(width);
};
var Cross = _ref => {
  var {
      x = 0,
      y = 0,
      top = 0,
      left = 0,
      width = 0,
      height = 0,
      className
    } = _ref,
    rest = _objectWithoutProperties(_ref, _excluded);
  var props = _objectSpread({
    x,
    y,
    top,
    left,
    width,
    height
  }, rest);
  if (!(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_2__/* .isNumber */ .Et)(x) || !(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_2__/* .isNumber */ .Et)(y) || !(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_2__/* .isNumber */ .Et)(width) || !(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_2__/* .isNumber */ .Et)(height) || !(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_2__/* .isNumber */ .Et)(top) || !(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_2__/* .isNumber */ .Et)(left)) {
    return null;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", _extends({}, (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_3__/* .svgPropertiesAndEvents */ .a)(props), {
    className: (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-cross', className),
    d: getPath(x, y, width, height, top, left)
  }));
};

/***/ }),

/***/ 42678:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   p: () => (/* binding */ SetCartesianGraphicalItem),
/* harmony export */   v: () => (/* binding */ SetPolarGraphicalItem)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(49082);
/* harmony import */ var _graphicalItemsSlice__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(92617);



function SetCartesianGraphicalItem(props) {
  var dispatch = (0,_hooks__WEBPACK_IMPORTED_MODULE_1__/* .useAppDispatch */ .j)();
  var prevPropsRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    if (prevPropsRef.current === null) {
      dispatch((0,_graphicalItemsSlice__WEBPACK_IMPORTED_MODULE_2__/* .addCartesianGraphicalItem */ .g5)(props));
    } else if (prevPropsRef.current !== props) {
      dispatch((0,_graphicalItemsSlice__WEBPACK_IMPORTED_MODULE_2__/* .replaceCartesianGraphicalItem */ .ZF)({
        prev: prevPropsRef.current,
        next: props
      }));
    }
    prevPropsRef.current = props;
  }, [dispatch, props]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    return () => {
      if (prevPropsRef.current) {
        dispatch((0,_graphicalItemsSlice__WEBPACK_IMPORTED_MODULE_2__/* .removeCartesianGraphicalItem */ .Vi)(prevPropsRef.current));
        /*
         * Here we have to reset the ref to null because in StrictMode, the effect will run twice,
         * but it will keep the same ref value from the first render.
         *
         * In browser, React will clear the ref after the first effect cleanup,
         * so that wouldn't be an issue.
         *
         * In StrictMode, however, the ref is kept,
         * and in the hook above the code checks for `prevPropsRef.current === null`
         * which would be false so it would not dispatch the `addCartesianGraphicalItem` action again.
         *
         * https://github.com/recharts/recharts/issues/6022
         */
        prevPropsRef.current = null;
      }
    };
  }, [dispatch]);
  return null;
}
function SetPolarGraphicalItem(props) {
  var dispatch = (0,_hooks__WEBPACK_IMPORTED_MODULE_1__/* .useAppDispatch */ .j)();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    dispatch((0,_graphicalItemsSlice__WEBPACK_IMPORTED_MODULE_2__/* .addPolarGraphicalItem */ .As)(props));
    return () => {
      dispatch((0,_graphicalItemsSlice__WEBPACK_IMPORTED_MODULE_2__/* .removePolarGraphicalItem */ .TK)(props));
    };
  }, [dispatch, props]);
  return null;
}

/***/ }),

/***/ 45249:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   I: () => (/* binding */ Curve)
/* harmony export */ });
/* unused harmony export getPath */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4058);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var _util_types__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(98940);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(59744);
/* harmony import */ var _util_isWellBehavedNumber__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8813);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(55448);
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @fileOverview Curve
 */







var CURVE_FACTORIES = {
  curveBasisClosed: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .curveBasisClosed */ .Yu,
  curveBasisOpen: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .curveBasisOpen */ .IA,
  curveBasis: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .curveBasis */ .qr,
  curveBumpX: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .curveBumpX */ .Wi,
  curveBumpY: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .curveBumpY */ .PG,
  curveLinearClosed: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .curveLinearClosed */ .Lx,
  curveLinear: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .curveLinear */ .lU,
  curveMonotoneX: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .curveMonotoneX */ .nV,
  curveMonotoneY: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .curveMonotoneY */ .ux,
  curveNatural: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .curveNatural */ .Xf,
  curveStep: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .curveStep */ .GZ,
  curveStepAfter: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .curveStepAfter */ .UP,
  curveStepBefore: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .curveStepBefore */ .dy
};

/**
 * @deprecated use {@link Coordinate} instead
 * Duplicated with `Coordinate` in `util/types.ts`
 */

/**
 * @deprecated use {@link NullableCoordinate} instead
 * Duplicated with `NullableCoordinate` in `util/types.ts`
 */

var defined = p => (0,_util_isWellBehavedNumber__WEBPACK_IMPORTED_MODULE_5__/* .isWellBehavedNumber */ .H)(p.x) && (0,_util_isWellBehavedNumber__WEBPACK_IMPORTED_MODULE_5__/* .isWellBehavedNumber */ .H)(p.y);
var getX = p => p.x;
var getY = p => p.y;
var getCurveFactory = (type, layout) => {
  if (typeof type === 'function') {
    return type;
  }
  var name = "curve".concat((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_4__/* .upperFirst */ .Zb)(type));
  if ((name === 'curveMonotone' || name === 'curveBump') && layout) {
    return CURVE_FACTORIES["".concat(name).concat(layout === 'vertical' ? 'Y' : 'X')];
  }
  return CURVE_FACTORIES[name] || victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .curveLinear */ .lU;
};
/**
 * Calculate the path of curve. Returns null if points is an empty array.
 * @return path or null
 */
var getPath = _ref => {
  var {
    type = 'linear',
    points = [],
    baseLine,
    layout,
    connectNulls = false
  } = _ref;
  var curveFactory = getCurveFactory(type, layout);
  var formatPoints = connectNulls ? points.filter(defined) : points;
  var lineFunction;
  if (Array.isArray(baseLine)) {
    var formatBaseLine = connectNulls ? baseLine.filter(base => defined(base)) : baseLine;
    var areaPoints = formatPoints.map((entry, index) => _objectSpread(_objectSpread({}, entry), {}, {
      base: formatBaseLine[index]
    }));
    if (layout === 'vertical') {
      lineFunction = (0,victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .area */ .Wc)().y(getY).x1(getX).x0(d => d.base.x);
    } else {
      lineFunction = (0,victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .area */ .Wc)().x(getX).y1(getY).y0(d => d.base.y);
    }
    lineFunction.defined(defined).curve(curveFactory);
    return lineFunction(areaPoints);
  }
  if (layout === 'vertical' && (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_4__/* .isNumber */ .Et)(baseLine)) {
    lineFunction = (0,victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .area */ .Wc)().y(getY).x1(getX).x0(baseLine);
  } else if ((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_4__/* .isNumber */ .Et)(baseLine)) {
    lineFunction = (0,victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .area */ .Wc)().x(getX).y1(getY).y0(baseLine);
  } else {
    lineFunction = (0,victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .line */ .n8)().x(getX).y(getY);
  }
  lineFunction.defined(defined).curve(curveFactory);
  return lineFunction(formatPoints);
};
var Curve = props => {
  var {
    className,
    points,
    path,
    pathRef
  } = props;
  if ((!points || !points.length) && !path) {
    return null;
  }
  var realPath = points && points.length ? getPath(props) : path;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", _extends({}, (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_6__/* .svgPropertiesNoEvents */ .uZ)(props), (0,_util_types__WEBPACK_IMPORTED_MODULE_3__/* .adaptEventHandlers */ ._)(props), {
    className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('recharts-curve', className),
    d: realPath === null ? undefined : realPath,
    ref: pathRef
  }));
};

/***/ }),

/***/ 46446:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LV: () => (/* binding */ chartDataReducer),
/* harmony export */   M: () => (/* binding */ setDataStartEndIndexes),
/* harmony export */   Ut: () => (/* binding */ setComputedData),
/* harmony export */   hq: () => (/* binding */ setChartData)
/* harmony export */ });
/* unused harmony export initialChartDataState */
/* harmony import */ var _reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4768);


/**
 * This is the data that's coming through main chart `data` prop
 * Recharts is very flexible in what it accepts so the type is very flexible too.
 * This will typically be an object, and various components will provide various `dataKey`
 * that dictates how to pull data from that object.
 *
 * TL;DR: before dataKey
 */

/**
 * So this is the same unknown type as ChartData but this is after the dataKey has been applied.
 * We still don't know what the type is - that depends on what exactly it was before the dataKey application,
 * and the dataKey can return whatever anyway - but let's keep it separate as a form of documentation.
 *
 * TL;DR: ChartData after dataKey.
 */

var initialChartDataState = {
  chartData: undefined,
  computedData: undefined,
  dataStartIndex: 0,
  dataEndIndex: 0
};
var chartDataSlice = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .createSlice */ .Z0)({
  name: 'chartData',
  initialState: initialChartDataState,
  reducers: {
    setChartData(state, action) {
      state.chartData = action.payload;
      if (action.payload == null) {
        state.dataStartIndex = 0;
        state.dataEndIndex = 0;
        return;
      }
      if (action.payload.length > 0 && state.dataEndIndex !== action.payload.length - 1) {
        state.dataEndIndex = action.payload.length - 1;
      }
    },
    setComputedData(state, action) {
      state.computedData = action.payload;
    },
    setDataStartEndIndexes(state, action) {
      var {
        startIndex,
        endIndex
      } = action.payload;
      if (startIndex != null) {
        state.dataStartIndex = startIndex;
      }
      if (endIndex != null) {
        state.dataEndIndex = endIndex;
      }
    }
  }
});
var {
  setChartData,
  setDataStartEndIndexes,
  setComputedData
} = chartDataSlice.actions;
var chartDataReducer = chartDataSlice.reducer;

/***/ }),

/***/ 49082:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   G: () => (/* binding */ useAppSelector),
/* harmony export */   j: () => (/* binding */ useAppDispatch)
/* harmony export */ });
/* harmony import */ var use_sync_external_store_shim_with_selector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(69242);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96540);
/* harmony import */ var _RechartsReduxContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(92649);



var noopDispatch = a => a;
var useAppDispatch = () => {
  var context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(_RechartsReduxContext__WEBPACK_IMPORTED_MODULE_2__/* .RechartsReduxContext */ .E);
  if (context) {
    return context.store.dispatch;
  }
  return noopDispatch;
};
var noop = () => {};
var addNestedSubNoop = () => noop;
var refEquality = (a, b) => a === b;

/**
 * This is a recharts variant of `useSelector` from 'react-redux' package.
 *
 * The difference is that react-redux version will throw an Error when used outside of Redux context.
 *
 * This, recharts version, will return undefined instead.
 *
 * This is because we want to allow using our components outside the Chart wrapper,
 * and have people provide all props explicitly.
 *
 * If however they use the component inside a chart wrapper then those props become optional,
 * and we read them from Redux state instead.
 *
 * @param selector for pulling things out of Redux store; will not be called if the store is not accessible
 * @return whatever the selector returned; or undefined when outside of Redux store
 */
function useAppSelector(selector) {
  var context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(_RechartsReduxContext__WEBPACK_IMPORTED_MODULE_2__/* .RechartsReduxContext */ .E);
  return (0,use_sync_external_store_shim_with_selector__WEBPACK_IMPORTED_MODULE_0__.useSyncExternalStoreWithSelector)(context ? context.subscription.addNestedSub : addNestedSubNoop, context ? context.store.getState : noop, context ? context.store.getState : noop, context ? selector : noop, refEquality);
}

/***/ }),

/***/ 58522:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   h: () => (/* binding */ Sector)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _util_PolarUtils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(14040);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(59744);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(77404);
/* harmony import */ var _util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(80196);
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }






var getDeltaAngle = (startAngle, endAngle) => {
  var sign = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_3__/* .mathSign */ .sA)(endAngle - startAngle);
  var deltaAngle = Math.min(Math.abs(endAngle - startAngle), 359.999);
  return sign * deltaAngle;
};
var getTangentCircle = _ref => {
  var {
    cx,
    cy,
    radius,
    angle,
    sign,
    isExternal,
    cornerRadius,
    cornerIsExternal
  } = _ref;
  var centerRadius = cornerRadius * (isExternal ? 1 : -1) + radius;
  var theta = Math.asin(cornerRadius / centerRadius) / _util_PolarUtils__WEBPACK_IMPORTED_MODULE_2__/* .RADIAN */ .Kg;
  var centerAngle = cornerIsExternal ? angle : angle + sign * theta;
  var center = (0,_util_PolarUtils__WEBPACK_IMPORTED_MODULE_2__/* .polarToCartesian */ .IZ)(cx, cy, centerRadius, centerAngle);
  // The coordinate of point which is tangent to the circle
  var circleTangency = (0,_util_PolarUtils__WEBPACK_IMPORTED_MODULE_2__/* .polarToCartesian */ .IZ)(cx, cy, radius, centerAngle);
  // The coordinate of point which is tangent to the radius line
  var lineTangencyAngle = cornerIsExternal ? angle - sign * theta : angle;
  var lineTangency = (0,_util_PolarUtils__WEBPACK_IMPORTED_MODULE_2__/* .polarToCartesian */ .IZ)(cx, cy, centerRadius * Math.cos(theta * _util_PolarUtils__WEBPACK_IMPORTED_MODULE_2__/* .RADIAN */ .Kg), lineTangencyAngle);
  return {
    center,
    circleTangency,
    lineTangency,
    theta
  };
};
var getSectorPath = _ref2 => {
  var {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle
  } = _ref2;
  var angle = getDeltaAngle(startAngle, endAngle);

  // When the angle of sector equals to 360, star point and end point coincide
  var tempEndAngle = startAngle + angle;
  var outerStartPoint = (0,_util_PolarUtils__WEBPACK_IMPORTED_MODULE_2__/* .polarToCartesian */ .IZ)(cx, cy, outerRadius, startAngle);
  var outerEndPoint = (0,_util_PolarUtils__WEBPACK_IMPORTED_MODULE_2__/* .polarToCartesian */ .IZ)(cx, cy, outerRadius, tempEndAngle);
  var path = "M ".concat(outerStartPoint.x, ",").concat(outerStartPoint.y, "\n    A ").concat(outerRadius, ",").concat(outerRadius, ",0,\n    ").concat(+(Math.abs(angle) > 180), ",").concat(+(startAngle > tempEndAngle), ",\n    ").concat(outerEndPoint.x, ",").concat(outerEndPoint.y, "\n  ");
  if (innerRadius > 0) {
    var innerStartPoint = (0,_util_PolarUtils__WEBPACK_IMPORTED_MODULE_2__/* .polarToCartesian */ .IZ)(cx, cy, innerRadius, startAngle);
    var innerEndPoint = (0,_util_PolarUtils__WEBPACK_IMPORTED_MODULE_2__/* .polarToCartesian */ .IZ)(cx, cy, innerRadius, tempEndAngle);
    path += "L ".concat(innerEndPoint.x, ",").concat(innerEndPoint.y, "\n            A ").concat(innerRadius, ",").concat(innerRadius, ",0,\n            ").concat(+(Math.abs(angle) > 180), ",").concat(+(startAngle <= tempEndAngle), ",\n            ").concat(innerStartPoint.x, ",").concat(innerStartPoint.y, " Z");
  } else {
    path += "L ".concat(cx, ",").concat(cy, " Z");
  }
  return path;
};
var getSectorWithCorner = _ref3 => {
  var {
    cx,
    cy,
    innerRadius,
    outerRadius,
    cornerRadius,
    forceCornerRadius,
    cornerIsExternal,
    startAngle,
    endAngle
  } = _ref3;
  var sign = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_3__/* .mathSign */ .sA)(endAngle - startAngle);
  var {
    circleTangency: soct,
    lineTangency: solt,
    theta: sot
  } = getTangentCircle({
    cx,
    cy,
    radius: outerRadius,
    angle: startAngle,
    sign,
    cornerRadius,
    cornerIsExternal
  });
  var {
    circleTangency: eoct,
    lineTangency: eolt,
    theta: eot
  } = getTangentCircle({
    cx,
    cy,
    radius: outerRadius,
    angle: endAngle,
    sign: -sign,
    cornerRadius,
    cornerIsExternal
  });
  var outerArcAngle = cornerIsExternal ? Math.abs(startAngle - endAngle) : Math.abs(startAngle - endAngle) - sot - eot;
  if (outerArcAngle < 0) {
    if (forceCornerRadius) {
      return "M ".concat(solt.x, ",").concat(solt.y, "\n        a").concat(cornerRadius, ",").concat(cornerRadius, ",0,0,1,").concat(cornerRadius * 2, ",0\n        a").concat(cornerRadius, ",").concat(cornerRadius, ",0,0,1,").concat(-cornerRadius * 2, ",0\n      ");
    }
    return getSectorPath({
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle
    });
  }
  var path = "M ".concat(solt.x, ",").concat(solt.y, "\n    A").concat(cornerRadius, ",").concat(cornerRadius, ",0,0,").concat(+(sign < 0), ",").concat(soct.x, ",").concat(soct.y, "\n    A").concat(outerRadius, ",").concat(outerRadius, ",0,").concat(+(outerArcAngle > 180), ",").concat(+(sign < 0), ",").concat(eoct.x, ",").concat(eoct.y, "\n    A").concat(cornerRadius, ",").concat(cornerRadius, ",0,0,").concat(+(sign < 0), ",").concat(eolt.x, ",").concat(eolt.y, "\n  ");
  if (innerRadius > 0) {
    var {
      circleTangency: sict,
      lineTangency: silt,
      theta: sit
    } = getTangentCircle({
      cx,
      cy,
      radius: innerRadius,
      angle: startAngle,
      sign,
      isExternal: true,
      cornerRadius,
      cornerIsExternal
    });
    var {
      circleTangency: eict,
      lineTangency: eilt,
      theta: eit
    } = getTangentCircle({
      cx,
      cy,
      radius: innerRadius,
      angle: endAngle,
      sign: -sign,
      isExternal: true,
      cornerRadius,
      cornerIsExternal
    });
    var innerArcAngle = cornerIsExternal ? Math.abs(startAngle - endAngle) : Math.abs(startAngle - endAngle) - sit - eit;
    if (innerArcAngle < 0 && cornerRadius === 0) {
      return "".concat(path, "L").concat(cx, ",").concat(cy, "Z");
    }
    path += "L".concat(eilt.x, ",").concat(eilt.y, "\n      A").concat(cornerRadius, ",").concat(cornerRadius, ",0,0,").concat(+(sign < 0), ",").concat(eict.x, ",").concat(eict.y, "\n      A").concat(innerRadius, ",").concat(innerRadius, ",0,").concat(+(innerArcAngle > 180), ",").concat(+(sign > 0), ",").concat(sict.x, ",").concat(sict.y, "\n      A").concat(cornerRadius, ",").concat(cornerRadius, ",0,0,").concat(+(sign < 0), ",").concat(silt.x, ",").concat(silt.y, "Z");
  } else {
    path += "L".concat(cx, ",").concat(cy, "Z");
  }
  return path;
};

/**
 * SVG cx, cy are `string | number | undefined`, but internally we use `number` so let's
 * override the types here.
 */

var defaultProps = {
  cx: 0,
  cy: 0,
  innerRadius: 0,
  outerRadius: 0,
  startAngle: 0,
  endAngle: 0,
  cornerRadius: 0,
  forceCornerRadius: false,
  cornerIsExternal: false
};
var Sector = sectorProps => {
  var props = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_4__/* .resolveDefaultProps */ .e)(sectorProps, defaultProps);
  var {
    cx,
    cy,
    innerRadius,
    outerRadius,
    cornerRadius,
    forceCornerRadius,
    cornerIsExternal,
    startAngle,
    endAngle,
    className
  } = props;
  if (outerRadius < innerRadius || startAngle === endAngle) {
    return null;
  }
  var layerClass = (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-sector', className);
  var deltaRadius = outerRadius - innerRadius;
  var cr = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_3__/* .getPercentValue */ .F4)(cornerRadius, deltaRadius, 0, true);
  var path;
  if (cr > 0 && Math.abs(startAngle - endAngle) < 360) {
    path = getSectorWithCorner({
      cx,
      cy,
      innerRadius,
      outerRadius,
      cornerRadius: Math.min(cr, deltaRadius / 2),
      forceCornerRadius,
      cornerIsExternal,
      startAngle,
      endAngle
    });
  } else {
    path = getSectorPath({
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle
    });
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", _extends({}, (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_5__/* .svgPropertiesAndEvents */ .a)(props), {
    className: layerClass,
    d: path
  }));
};

/***/ }),

/***/ 59482:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   r: () => (/* binding */ SetTooltipEntrySettings)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(49082);
/* harmony import */ var _tooltipSlice__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(74531);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(12070);




function SetTooltipEntrySettings(_ref) {
  var {
    fn,
    args
  } = _ref;
  var dispatch = (0,_hooks__WEBPACK_IMPORTED_MODULE_1__/* .useAppDispatch */ .j)();
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_3__/* .useIsPanorama */ .r)();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    if (isPanorama) {
      // Panorama graphical items should never contribute to Tooltip payload.
      return undefined;
    }
    var tooltipEntrySettings = fn(args);
    dispatch((0,_tooltipSlice__WEBPACK_IMPORTED_MODULE_2__/* .addTooltipEntrySettings */ .Ix)(tooltipEntrySettings));
    return () => {
      dispatch((0,_tooltipSlice__WEBPACK_IMPORTED_MODULE_2__/* .removeTooltipEntrySettings */ .XB)(tooltipEntrySettings));
    };
  }, [fn, args, dispatch, isPanorama]);
  return null;
}

/***/ }),

/***/ 65787:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   i: () => (/* binding */ Symbols)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4058);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(34164);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(59744);
/* harmony import */ var _util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(80196);
var _excluded = ["type", "size", "sizeType"];
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }





var symbolFactories = {
  symbolCircle: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .symbolCircle */ .hK,
  symbolCross: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .symbolCross */ .BV,
  symbolDiamond: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .symbolDiamond */ .j,
  symbolSquare: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .symbolSquare */ .yD,
  symbolStar: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .symbolStar */ .N8,
  symbolTriangle: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .symbolTriangle */ .ZK,
  symbolWye: victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .symbolWye */ .IJ
};
var RADIAN = Math.PI / 180;
var getSymbolFactory = type => {
  var name = "symbol".concat((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_3__/* .upperFirst */ .Zb)(type));
  return symbolFactories[name] || victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .symbolCircle */ .hK;
};
var calculateAreaSize = (size, sizeType, type) => {
  if (sizeType === 'area') {
    return size;
  }
  switch (type) {
    case 'cross':
      return 5 * size * size / 9;
    case 'diamond':
      return 0.5 * size * size / Math.sqrt(3);
    case 'square':
      return size * size;
    case 'star':
      {
        var angle = 18 * RADIAN;
        return 1.25 * size * size * (Math.tan(angle) - Math.tan(angle * 2) * Math.tan(angle) ** 2);
      }
    case 'triangle':
      return Math.sqrt(3) * size * size / 4;
    case 'wye':
      return (21 - 10 * Math.sqrt(3)) * size * size / 8;
    default:
      return Math.PI * size * size / 4;
  }
};
var registerSymbol = (key, factory) => {
  symbolFactories["symbol".concat((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_3__/* .upperFirst */ .Zb)(key))] = factory;
};
var Symbols = _ref => {
  var {
      type = 'circle',
      size = 64,
      sizeType = 'area'
    } = _ref,
    rest = _objectWithoutProperties(_ref, _excluded);
  var props = _objectSpread(_objectSpread({}, rest), {}, {
    type,
    size,
    sizeType
  });
  var realType = 'circle';
  if (typeof type === 'string') {
    /*
     * Our type guard is not as strong as it could be (i.e. non-existent),
     * and so despite the typescript type saying that `type` is a `SymbolType`,
     * we can get numbers or really anything, so let's have a runtime check here to fix the exception.
     *
     * https://github.com/recharts/recharts/issues/6197
     */
    realType = type;
  }

  /**
   * Calculate the path of curve
   * @return {String} path
   */
  var getPath = () => {
    var symbolFactory = getSymbolFactory(realType);
    var symbol = (0,victory_vendor_d3_shape__WEBPACK_IMPORTED_MODULE_1__/* .symbol */ .HR)().type(symbolFactory).size(calculateAreaSize(size, sizeType, realType));
    var s = symbol();
    if (s === null) {
      return undefined;
    }
    return s;
  };
  var {
    className,
    cx,
    cy
  } = props;
  var filteredProps = (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_4__/* .svgPropertiesAndEvents */ .a)(props);
  if (cx === +cx && cy === +cy && size === +size) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", _extends({}, filteredProps, {
      className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__/* .clsx */ .$)('recharts-symbols', className),
      transform: "translate(".concat(cx, ", ").concat(cy, ")"),
      d: getPath()
    }));
  }
  return null;
};
Symbols.registerSymbol = registerSymbol;

/***/ }),

/***/ 66426:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   B_: () => (/* binding */ setMargin),
/* harmony export */   JK: () => (/* binding */ setLayout),
/* harmony export */   Vp: () => (/* binding */ chartLayoutReducer),
/* harmony export */   gX: () => (/* binding */ setChartSize),
/* harmony export */   hF: () => (/* binding */ setScale)
/* harmony export */ });
/* harmony import */ var _reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4768);

var initialState = {
  layoutType: 'horizontal',
  width: 0,
  height: 0,
  margin: {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5
  },
  scale: 1
};
var chartLayoutSlice = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .createSlice */ .Z0)({
  name: 'chartLayout',
  initialState,
  reducers: {
    setLayout(state, action) {
      state.layoutType = action.payload;
    },
    setChartSize(state, action) {
      state.width = action.payload.width;
      state.height = action.payload.height;
    },
    setMargin(state, action) {
      var _action$payload$top, _action$payload$right, _action$payload$botto, _action$payload$left;
      state.margin.top = (_action$payload$top = action.payload.top) !== null && _action$payload$top !== void 0 ? _action$payload$top : 0;
      state.margin.right = (_action$payload$right = action.payload.right) !== null && _action$payload$right !== void 0 ? _action$payload$right : 0;
      state.margin.bottom = (_action$payload$botto = action.payload.bottom) !== null && _action$payload$botto !== void 0 ? _action$payload$botto : 0;
      state.margin.left = (_action$payload$left = action.payload.left) !== null && _action$payload$left !== void 0 ? _action$payload$left : 0;
    },
    setScale(state, action) {
      state.scale = action.payload;
    }
  }
});
var {
  setMargin,
  setLayout,
  setChartSize,
  setScale
} = chartLayoutSlice.actions;
var chartLayoutReducer = chartLayoutSlice.reducer;

/***/ }),

/***/ 66613:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   c: () => (/* binding */ Dot)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _util_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(98940);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(55448);
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * @fileOverview Dot
 */




var Dot = props => {
  var {
    cx,
    cy,
    r,
    className
  } = props;
  var layerClass = (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-dot', className);
  if (cx === +cx && cy === +cy && r === +r) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("circle", _extends({}, (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_3__/* .svgPropertiesNoEvents */ .uZ)(props), (0,_util_types__WEBPACK_IMPORTED_MODULE_2__/* .adaptEventHandlers */ ._)(props), {
      className: layerClass,
      cx: cx,
      cy: cy,
      r: r
    }));
  }
  return null;
};

/***/ }),

/***/ 69264:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   p: () => (/* binding */ ReportChartProps)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _rootPropsSlice__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(92476);
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(49082);



function ReportChartProps(props) {
  var dispatch = (0,_hooks__WEBPACK_IMPORTED_MODULE_2__/* .useAppDispatch */ .j)();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    dispatch((0,_rootPropsSlice__WEBPACK_IMPORTED_MODULE_1__/* .updateOptions */ .mZ)(props));
  }, [dispatch, props]);
  return null;
}

/***/ }),

/***/ 73102:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   x: () => (/* binding */ externalEventsMiddleware),
/* harmony export */   y: () => (/* binding */ externalEventAction)
/* harmony export */ });
/* harmony import */ var _reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4768);
/* harmony import */ var _selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(33032);


var externalEventAction = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .createAction */ .VP)('externalEvent');
var externalEventsMiddleware = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .createListenerMiddleware */ .Nc)();
externalEventsMiddleware.startListening({
  actionCreator: externalEventAction,
  effect: (action, listenerApi) => {
    if (action.payload.handler == null) {
      return;
    }
    var state = listenerApi.getState();
    var nextState = {
      activeCoordinate: (0,_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_1__/* .selectActiveTooltipCoordinate */ .eE)(state),
      activeDataKey: (0,_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_1__/* .selectActiveTooltipDataKey */ .Xb)(state),
      activeIndex: (0,_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_1__/* .selectActiveTooltipIndex */ .A2)(state),
      activeLabel: (0,_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_1__/* .selectActiveLabel */ .BZ)(state),
      activeTooltipIndex: (0,_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_1__/* .selectActiveTooltipIndex */ .A2)(state),
      isTooltipActive: (0,_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_1__/* .selectIsTooltipActive */ .yn)(state)
    };
    action.payload.handler(nextState, action.payload.reactEvent);
  }
});

/***/ }),

/***/ 77232:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $7: () => (/* binding */ keyboardEventsMiddleware),
/* harmony export */   Ru: () => (/* binding */ focusAction),
/* harmony export */   uZ: () => (/* binding */ keyDownAction)
/* harmony export */ });
/* harmony import */ var _reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4768);
/* harmony import */ var _tooltipSlice__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(74531);
/* harmony import */ var _selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(33032);
/* harmony import */ var _selectors_selectors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(87997);
/* harmony import */ var _selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(11114);
/* harmony import */ var _selectors_combiners_combineActiveTooltipIndex__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(74544);






var keyDownAction = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .createAction */ .VP)('keyDown');
var focusAction = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .createAction */ .VP)('focus');
var keyboardEventsMiddleware = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .createListenerMiddleware */ .Nc)();
keyboardEventsMiddleware.startListening({
  actionCreator: keyDownAction,
  effect: (action, listenerApi) => {
    var state = listenerApi.getState();
    var accessibilityLayerIsActive = state.rootProps.accessibilityLayer !== false;
    if (!accessibilityLayerIsActive) {
      return;
    }
    var {
      keyboardInteraction
    } = state.tooltip;
    var key = action.payload;
    if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'Enter') {
      return;
    }

    // TODO this is lacking index for charts that do not support numeric indexes
    var currentIndex = Number((0,_selectors_combiners_combineActiveTooltipIndex__WEBPACK_IMPORTED_MODULE_5__/* .combineActiveTooltipIndex */ .P)(keyboardInteraction, (0,_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_2__/* .selectTooltipDisplayedData */ .n4)(state)));
    var tooltipTicks = (0,_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_2__/* .selectTooltipAxisTicks */ .R4)(state);
    if (key === 'Enter') {
      var _coordinate = (0,_selectors_selectors__WEBPACK_IMPORTED_MODULE_3__/* .selectCoordinateForDefaultIndex */ .pg)(state, 'axis', 'hover', String(keyboardInteraction.index));
      listenerApi.dispatch((0,_tooltipSlice__WEBPACK_IMPORTED_MODULE_1__/* .setKeyboardInteraction */ .o4)({
        active: !keyboardInteraction.active,
        activeIndex: keyboardInteraction.index,
        activeDataKey: keyboardInteraction.dataKey,
        activeCoordinate: _coordinate
      }));
      return;
    }
    var direction = (0,_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_4__/* .selectChartDirection */ ._y)(state);
    var directionMultiplier = direction === 'left-to-right' ? 1 : -1;
    var movement = key === 'ArrowRight' ? 1 : -1;
    var nextIndex = currentIndex + movement * directionMultiplier;
    if (tooltipTicks == null || nextIndex >= tooltipTicks.length || nextIndex < 0) {
      return;
    }
    var coordinate = (0,_selectors_selectors__WEBPACK_IMPORTED_MODULE_3__/* .selectCoordinateForDefaultIndex */ .pg)(state, 'axis', 'hover', String(nextIndex));
    listenerApi.dispatch((0,_tooltipSlice__WEBPACK_IMPORTED_MODULE_1__/* .setKeyboardInteraction */ .o4)({
      active: true,
      activeIndex: nextIndex.toString(),
      activeDataKey: undefined,
      activeCoordinate: coordinate
    }));
  }
});
keyboardEventsMiddleware.startListening({
  actionCreator: focusAction,
  effect: (_action, listenerApi) => {
    var state = listenerApi.getState();
    var accessibilityLayerIsActive = state.rootProps.accessibilityLayer !== false;
    if (!accessibilityLayerIsActive) {
      return;
    }
    var {
      keyboardInteraction
    } = state.tooltip;
    if (keyboardInteraction.active) {
      return;
    }
    if (keyboardInteraction.index == null) {
      var nextIndex = '0';
      var coordinate = (0,_selectors_selectors__WEBPACK_IMPORTED_MODULE_3__/* .selectCoordinateForDefaultIndex */ .pg)(state, 'axis', 'hover', String(nextIndex));
      listenerApi.dispatch((0,_tooltipSlice__WEBPACK_IMPORTED_MODULE_1__/* .setKeyboardInteraction */ .o4)({
        activeDataKey: undefined,
        active: true,
        activeIndex: nextIndex,
        activeCoordinate: coordinate
      }));
    }
  }
});

/***/ }),

/***/ 88982:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   j: () => (/* binding */ Trapezoid)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(77404);
/* harmony import */ var _animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(31528);
/* harmony import */ var _util_useAnimationId__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(8107);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(59744);
/* harmony import */ var _animation_util__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(23929);
/* harmony import */ var _util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(80196);
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * @fileOverview Rectangle
 */









var getTrapezoidPath = (x, y, upperWidth, lowerWidth, height) => {
  var widthGap = upperWidth - lowerWidth;
  var path;
  path = "M ".concat(x, ",").concat(y);
  path += "L ".concat(x + upperWidth, ",").concat(y);
  path += "L ".concat(x + upperWidth - widthGap / 2, ",").concat(y + height);
  path += "L ".concat(x + upperWidth - widthGap / 2 - lowerWidth, ",").concat(y + height);
  path += "L ".concat(x, ",").concat(y, " Z");
  return path;
};
var defaultProps = {
  x: 0,
  y: 0,
  upperWidth: 0,
  lowerWidth: 0,
  height: 0,
  isUpdateAnimationActive: false,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease'
};
var Trapezoid = outsideProps => {
  var trapezoidProps = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_2__/* .resolveDefaultProps */ .e)(outsideProps, defaultProps);
  var {
    x,
    y,
    upperWidth,
    lowerWidth,
    height,
    className
  } = trapezoidProps;
  var {
    animationEasing,
    animationDuration,
    animationBegin,
    isUpdateAnimationActive
  } = trapezoidProps;
  var pathRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  var [totalLength, setTotalLength] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(-1);
  var prevUpperWidthRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(upperWidth);
  var prevLowerWidthRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(lowerWidth);
  var prevHeightRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(height);
  var prevXRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(x);
  var prevYRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(y);
  var animationId = (0,_util_useAnimationId__WEBPACK_IMPORTED_MODULE_4__/* .useAnimationId */ .n)(outsideProps, 'trapezoid-');
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (pathRef.current && pathRef.current.getTotalLength) {
      try {
        var pathTotalLength = pathRef.current.getTotalLength();
        if (pathTotalLength) {
          setTotalLength(pathTotalLength);
        }
      } catch (_unused) {
        // calculate total length error
      }
    }
  }, []);
  if (x !== +x || y !== +y || upperWidth !== +upperWidth || lowerWidth !== +lowerWidth || height !== +height || upperWidth === 0 && lowerWidth === 0 || height === 0) {
    return null;
  }
  var layerClass = (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-trapezoid', className);
  if (!isUpdateAnimationActive) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("g", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", _extends({}, (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_7__/* .svgPropertiesAndEvents */ .a)(trapezoidProps), {
      className: layerClass,
      d: getTrapezoidPath(x, y, upperWidth, lowerWidth, height)
    })));
  }
  var prevUpperWidth = prevUpperWidthRef.current;
  var prevLowerWidth = prevLowerWidthRef.current;
  var prevHeight = prevHeightRef.current;
  var prevX = prevXRef.current;
  var prevY = prevYRef.current;
  var from = "0px ".concat(totalLength === -1 ? 1 : totalLength, "px");
  var to = "".concat(totalLength, "px 0px");
  var transition = (0,_animation_util__WEBPACK_IMPORTED_MODULE_6__/* .getTransitionVal */ .dl)(['strokeDasharray'], animationDuration, animationEasing);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_3__/* .JavascriptAnimate */ .J, {
    animationId: animationId,
    key: animationId,
    canBegin: totalLength > 0,
    duration: animationDuration,
    easing: animationEasing,
    isActive: isUpdateAnimationActive,
    begin: animationBegin
  }, t => {
    var currUpperWidth = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .interpolate */ .GW)(prevUpperWidth, upperWidth, t);
    var currLowerWidth = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .interpolate */ .GW)(prevLowerWidth, lowerWidth, t);
    var currHeight = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .interpolate */ .GW)(prevHeight, height, t);
    var currX = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .interpolate */ .GW)(prevX, x, t);
    var currY = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .interpolate */ .GW)(prevY, y, t);
    if (pathRef.current) {
      prevUpperWidthRef.current = currUpperWidth;
      prevLowerWidthRef.current = currLowerWidth;
      prevHeightRef.current = currHeight;
      prevXRef.current = currX;
      prevYRef.current = currY;
    }
    var animationStyle = t > 0 ? {
      transition,
      strokeDasharray: to
    } : {
      strokeDasharray: from
    };
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("path", _extends({}, (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_7__/* .svgPropertiesAndEvents */ .a)(trapezoidProps), {
      className: layerClass,
      d: getTrapezoidPath(currX, currY, currUpperWidth, currLowerWidth, currHeight),
      ref: pathRef,
      style: _objectSpread(_objectSpread({}, animationStyle), trapezoidProps.style)
    }));
  });
};

/***/ }),

/***/ 91283:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CU: () => (/* binding */ legendReducer),
/* harmony export */   Lx: () => (/* binding */ addLegendPayload),
/* harmony export */   h1: () => (/* binding */ setLegendSettings),
/* harmony export */   hx: () => (/* binding */ setLegendSize),
/* harmony export */   u3: () => (/* binding */ removeLegendPayload)
/* harmony export */ });
/* harmony import */ var _reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4768);
/* harmony import */ var immer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1932);



/**
 * The properties inside this state update independently of each other and quite often.
 * When selecting, never select the whole state because you are going to get
 * unnecessary re-renders. Select only the properties you need.
 *
 * This is why this state type is not exported - don't use it directly.
 */

var initialState = {
  settings: {
    layout: 'horizontal',
    align: 'center',
    verticalAlign: 'middle',
    itemSorter: 'value'
  },
  size: {
    width: 0,
    height: 0
  },
  payload: []
};
var legendSlice = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .createSlice */ .Z0)({
  name: 'legend',
  initialState,
  reducers: {
    setLegendSize(state, action) {
      state.size.width = action.payload.width;
      state.size.height = action.payload.height;
    },
    setLegendSettings(state, action) {
      state.settings.align = action.payload.align;
      state.settings.layout = action.payload.layout;
      state.settings.verticalAlign = action.payload.verticalAlign;
      state.settings.itemSorter = action.payload.itemSorter;
    },
    addLegendPayload: {
      reducer(state, action) {
        state.payload.push((0,immer__WEBPACK_IMPORTED_MODULE_1__/* .castDraft */ .h4)(action.payload));
      },
      prepare: (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .prepareAutoBatched */ .aA)()
    },
    removeLegendPayload: {
      reducer(state, action) {
        var index = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .current */ .ss)(state).payload.indexOf((0,immer__WEBPACK_IMPORTED_MODULE_1__/* .castDraft */ .h4)(action.payload));
        if (index > -1) {
          state.payload.splice(index, 1);
        }
      },
      prepare: (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .prepareAutoBatched */ .aA)()
    }
  }
});
var {
  setLegendSize,
  setLegendSettings,
  addLegendPayload,
  removeLegendPayload
} = legendSlice.actions;
var legendReducer = legendSlice.reducer;

/***/ }),

/***/ 92617:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   As: () => (/* binding */ addPolarGraphicalItem),
/* harmony export */   TK: () => (/* binding */ removePolarGraphicalItem),
/* harmony export */   Vi: () => (/* binding */ removeCartesianGraphicalItem),
/* harmony export */   ZF: () => (/* binding */ replaceCartesianGraphicalItem),
/* harmony export */   g5: () => (/* binding */ addCartesianGraphicalItem),
/* harmony export */   iZ: () => (/* binding */ graphicalItemsReducer)
/* harmony export */ });
/* harmony import */ var _reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4768);
/* harmony import */ var immer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1932);



/**
 * Unique ID of the graphical item.
 * This is used to identify the graphical item in the state and in the React tree.
 * This is required for every graphical item - it's either provided by the user or generated automatically.
 */

var initialState = {
  cartesianItems: [],
  polarItems: []
};
var graphicalItemsSlice = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .createSlice */ .Z0)({
  name: 'graphicalItems',
  initialState,
  reducers: {
    addCartesianGraphicalItem: {
      reducer(state, action) {
        state.cartesianItems.push((0,immer__WEBPACK_IMPORTED_MODULE_1__/* .castDraft */ .h4)(action.payload));
      },
      prepare: (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .prepareAutoBatched */ .aA)()
    },
    replaceCartesianGraphicalItem: {
      reducer(state, action) {
        var {
          prev,
          next
        } = action.payload;
        var index = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .current */ .ss)(state).cartesianItems.indexOf((0,immer__WEBPACK_IMPORTED_MODULE_1__/* .castDraft */ .h4)(prev));
        if (index > -1) {
          state.cartesianItems[index] = (0,immer__WEBPACK_IMPORTED_MODULE_1__/* .castDraft */ .h4)(next);
        }
      },
      prepare: (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .prepareAutoBatched */ .aA)()
    },
    removeCartesianGraphicalItem: {
      reducer(state, action) {
        var index = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .current */ .ss)(state).cartesianItems.indexOf((0,immer__WEBPACK_IMPORTED_MODULE_1__/* .castDraft */ .h4)(action.payload));
        if (index > -1) {
          state.cartesianItems.splice(index, 1);
        }
      },
      prepare: (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .prepareAutoBatched */ .aA)()
    },
    addPolarGraphicalItem: {
      reducer(state, action) {
        state.polarItems.push((0,immer__WEBPACK_IMPORTED_MODULE_1__/* .castDraft */ .h4)(action.payload));
      },
      prepare: (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .prepareAutoBatched */ .aA)()
    },
    removePolarGraphicalItem: {
      reducer(state, action) {
        var index = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .current */ .ss)(state).polarItems.indexOf((0,immer__WEBPACK_IMPORTED_MODULE_1__/* .castDraft */ .h4)(action.payload));
        if (index > -1) {
          state.polarItems.splice(index, 1);
        }
      },
      prepare: (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .prepareAutoBatched */ .aA)()
    }
  }
});
var {
  addCartesianGraphicalItem,
  replaceCartesianGraphicalItem,
  removeCartesianGraphicalItem,
  addPolarGraphicalItem,
  removePolarGraphicalItem
} = graphicalItemsSlice.actions;
var graphicalItemsReducer = graphicalItemsSlice.reducer;

/***/ }),

/***/ 92649:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   E: () => (/* binding */ RechartsReduxContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);


/*
 * This is a copy of the React-Redux context type, but with our own store type.
 * We could import directly from react-redux like this:
 * import { ReactReduxContextValue } from 'react-redux/src/components/Context';
 * but that makes typescript angry with some errors I am not sure how to resolve
 * so copy it is.
 */

/**
 * We need to use our own independent Redux context because we need to avoid interfering with other people's Redux stores
 * in case they decide to install and use Recharts in another Redux app which is likely to happen.
 *
 * https://react-redux.js.org/using-react-redux/accessing-store#providing-custom-context
 */
var RechartsReduxContext = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(null);

/***/ }),

/***/ 94115:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CA: () => (/* binding */ cartesianAxisReducer),
/* harmony export */   D4: () => (/* binding */ addZAxis),
/* harmony export */   Gc: () => (/* binding */ removeZAxis),
/* harmony export */   MC: () => (/* binding */ removeXAxis),
/* harmony export */   QG: () => (/* binding */ updateYAxisWidth),
/* harmony export */   Vi: () => (/* binding */ addXAxis),
/* harmony export */   cU: () => (/* binding */ addYAxis),
/* harmony export */   fR: () => (/* binding */ removeYAxis)
/* harmony export */ });
/* unused harmony export defaultAxisId */
/* harmony import */ var _reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4768);
/* harmony import */ var immer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1932);
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


var defaultAxisId = 0;

/**
 * Properties shared in X, Y, and Z axes
 */

/**
 * These are the external props, visible for users as they set them using our public API.
 * There is all sorts of internal computed things based on these, but they will come through selectors.
 *
 * Properties shared between X and Y axes
 */

/**
 * Z axis is special because it's never displayed. It controls the size of Scatter dots,
 * but it never displays ticks anywhere.
 */

var initialState = {
  xAxis: {},
  yAxis: {},
  zAxis: {}
};

/**
 * This is the slice where each individual Axis element pushes its own configuration.
 * Prefer to use this one instead of axisSlice.
 */
var cartesianAxisSlice = (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .createSlice */ .Z0)({
  name: 'cartesianAxis',
  initialState,
  reducers: {
    addXAxis: {
      reducer(state, action) {
        state.xAxis[action.payload.id] = (0,immer__WEBPACK_IMPORTED_MODULE_1__/* .castDraft */ .h4)(action.payload);
      },
      prepare: (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .prepareAutoBatched */ .aA)()
    },
    removeXAxis: {
      reducer(state, action) {
        delete state.xAxis[action.payload.id];
      },
      prepare: (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .prepareAutoBatched */ .aA)()
    },
    addYAxis: {
      reducer(state, action) {
        state.yAxis[action.payload.id] = (0,immer__WEBPACK_IMPORTED_MODULE_1__/* .castDraft */ .h4)(action.payload);
      },
      prepare: (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .prepareAutoBatched */ .aA)()
    },
    removeYAxis: {
      reducer(state, action) {
        delete state.yAxis[action.payload.id];
      },
      prepare: (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .prepareAutoBatched */ .aA)()
    },
    addZAxis: {
      reducer(state, action) {
        state.zAxis[action.payload.id] = (0,immer__WEBPACK_IMPORTED_MODULE_1__/* .castDraft */ .h4)(action.payload);
      },
      prepare: (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .prepareAutoBatched */ .aA)()
    },
    removeZAxis: {
      reducer(state, action) {
        delete state.zAxis[action.payload.id];
      },
      prepare: (0,_reduxjs_toolkit__WEBPACK_IMPORTED_MODULE_0__/* .prepareAutoBatched */ .aA)()
    },
    updateYAxisWidth(state, action) {
      var {
        id,
        width
      } = action.payload;
      var axis = state.yAxis[id];
      if (axis) {
        var history = axis.widthHistory || [];
        // An oscillation is detected when the new width is the same as the width before the last one.
        // This is a simple A -> B -> A pattern. If the next width is B, and the difference is less than 1 pixel, we ignore it.
        if (history.length === 3 && history[0] === history[2] && width === history[1] && width !== axis.width && Math.abs(width - history[0]) <= 1) {
          return;
        }
        var newHistory = [...history, width].slice(-3);
        state.yAxis[id] = _objectSpread(_objectSpread({}, state.yAxis[id]), {}, {
          width,
          widthHistory: newHistory
        });
      }
    }
  }
});
var {
  addXAxis,
  removeXAxis,
  addYAxis,
  removeYAxis,
  addZAxis,
  removeZAxis,
  updateYAxisWidth
} = cartesianAxisSlice.actions;
var cartesianAxisReducer = cartesianAxisSlice.reducer;

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi0zNWQzZjQwZC45MzY1MWVlMzJmMDEzMGFkZDBmNC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQWtDO0FBQ3lCO0FBQ047QUFDWjs7QUFFekM7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0osaUJBQWlCLCtEQUFjOztBQUUvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsZ0ZBQWE7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxnREFBUztBQUNYO0FBQ0EsZUFBZSxpRUFBUztBQUN4QixlQUFlLGlFQUFTO0FBQ3hCO0FBQ0EsR0FBRztBQUNIO0FBQ0EsQzs7Ozs7Ozs7Ozs7OztBQ3JDK0M7O0FBRS9DO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLGlCQUFpQix1RUFBVztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDTTtBQUNQO0FBQ0EsRUFBRTtBQUNLLHNDOzs7Ozs7Ozs7Ozs7Ozs7QUNsQ3dCO0FBQ0E7QUFDUTtBQUNPO0FBQ2E7QUFDRztBQUN2RDtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLG1CQUFtQixnRkFBYTtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLDZDQUFNOztBQUV2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLG9FQUFtQjtBQUMxQzs7QUFFQTtBQUNBLHVCQUF1QixnRkFBb0I7QUFDM0Msc0JBQXNCLGdEQUFtQixDQUFDLDJEQUFRO0FBQ2xEO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsQzs7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LG9FQUFvRSwwREFBMEQ7QUFDbEssNkJBQTZCLG1DQUFtQztBQUNoRSw4QkFBOEIsMENBQTBDLCtCQUErQixvQkFBb0IsbUNBQW1DLG9DQUFvQyx1RUFBdUU7QUFDdE07QUFDakM7QUFDM0I7O0FBRVA7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFdBQVc7QUFDWCxXQUFXO0FBQ1g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5Qix1RUFBVztBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLDBEQUFTO0FBQ2xELE9BQU87QUFDUCxlQUFlLDhFQUFrQjtBQUNqQyxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLGVBQWUsOEVBQWtCO0FBQ2pDLEtBQUs7QUFDTDtBQUNBO0FBQ0EseUNBQXlDLDBEQUFTO0FBQ2xELE9BQU87QUFDUCxlQUFlLDhFQUFrQjtBQUNqQyxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLGVBQWUsOEVBQWtCO0FBQ2pDLEtBQUs7QUFDTDtBQUNBO0FBQ0EseUNBQXlDLDBEQUFTO0FBQ2xELE9BQU87QUFDUCxlQUFlLDhFQUFrQjtBQUNqQyxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLGVBQWUsOEVBQWtCO0FBQ2pDLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3REFBd0Qsc0JBQXNCO0FBQzlFO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNNO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0ssc0QiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvc3RhdGUvUmVwb3J0TWFpbkNoYXJ0UHJvcHMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3N0YXRlL2JydXNoU2xpY2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3N0YXRlL1JlY2hhcnRzU3RvcmVQcm92aWRlci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvc3RhdGUvUmVwb3J0UG9sYXJPcHRpb25zLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9zdGF0ZS9TZXRMZWdlbmRQYXlsb2FkLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9zaGFwZS9Qb2x5Z29uLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9zdGF0ZS9lcnJvckJhclNsaWNlLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9zaGFwZS9SZWN0YW5nbGUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3NoYXBlL0Nyb3NzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9zdGF0ZS9TZXRHcmFwaGljYWxJdGVtLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9zaGFwZS9DdXJ2ZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvc3RhdGUvY2hhcnREYXRhU2xpY2UuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3N0YXRlL2hvb2tzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9zaGFwZS9TZWN0b3IuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3N0YXRlL1NldFRvb2x0aXBFbnRyeVNldHRpbmdzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9zaGFwZS9TeW1ib2xzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9zdGF0ZS9sYXlvdXRTbGljZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvc2hhcGUvRG90LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9zdGF0ZS9SZXBvcnRDaGFydFByb3BzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9zdGF0ZS9leHRlcm5hbEV2ZW50c01pZGRsZXdhcmUuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3N0YXRlL2tleWJvYXJkRXZlbnRzTWlkZGxld2FyZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvc2hhcGUvVHJhcGV6b2lkLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9zdGF0ZS9sZWdlbmRTbGljZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvc3RhdGUvZ3JhcGhpY2FsSXRlbXNTbGljZS5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvc3RhdGUvUmVjaGFydHNSZWR1eENvbnRleHQuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L3N0YXRlL2NhcnRlc2lhbkF4aXNTbGljZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VJc1Bhbm9yYW1hIH0gZnJvbSAnLi4vY29udGV4dC9QYW5vcmFtYUNvbnRleHQnO1xuaW1wb3J0IHsgc2V0TGF5b3V0LCBzZXRNYXJnaW4gfSBmcm9tICcuL2xheW91dFNsaWNlJztcbmltcG9ydCB7IHVzZUFwcERpc3BhdGNoIH0gZnJvbSAnLi9ob29rcyc7XG5cbi8qKlxuICogXCJNYWluXCIgcHJvcHMgYXJlIHByb3BzIHRoYXQgYXJlIG9ubHkgYWNjZXB0ZWQgb24gdGhlIG1haW4gY2hhcnQsXG4gKiBhcyBvcHBvc2VkIHRvIHRoZSBzbWFsbCBwYW5vcmFtYSBjaGFydCBpbnNpZGUgYSBCcnVzaC5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gUmVwb3J0TWFpbkNoYXJ0UHJvcHMoX3JlZikge1xuICB2YXIge1xuICAgIGxheW91dCxcbiAgICBtYXJnaW5cbiAgfSA9IF9yZWY7XG4gIHZhciBkaXNwYXRjaCA9IHVzZUFwcERpc3BhdGNoKCk7XG5cbiAgLypcbiAgICogU2tpcCBkaXNwYXRjaGluZyBwcm9wZXJ0aWVzIGluIHBhbm9yYW1hIGNoYXJ0IGZvciB0d28gcmVhc29uczpcbiAgICogMS4gVGhlIHJvb3QgY2hhcnQgc2hvdWxkIGJlIGRlY2lkaW5nIG9uIHRoZXNlIHByb3BlcnRpZXMsIGFuZFxuICAgKiAyLiBCcnVzaCByZWFkcyB0aGVzZSBwcm9wZXJ0aWVzIGZyb20gcmVkdXggc3RvcmUsIGFuZCBzbyB0aGV5IG11c3QgcmVtYWluIHN0YWJsZVxuICAgKiAgICAgIHRvIGF2b2lkIGNpcmN1bGFyIGRlcGVuZGVuY3kgYW5kIGluZmluaXRlIHJlLXJlbmRlcmluZy5cbiAgICovXG4gIHZhciBpc1Bhbm9yYW1hID0gdXNlSXNQYW5vcmFtYSgpO1xuICAvKlxuICAgKiB1c2VFZmZlY3QgaGVyZSBpcyByZXF1aXJlZCB0byBhdm9pZCB0aGUgXCJDYW5ub3QgdXBkYXRlIGEgY29tcG9uZW50IHdoaWxlIHJlbmRlcmluZyBhIGRpZmZlcmVudCBjb21wb25lbnRcIiBlcnJvci5cbiAgICogaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2lzc3Vlcy8xODE3OFxuICAgKlxuICAgKiBSZXBvcnRlZCBpbiBodHRwczovL2dpdGh1Yi5jb20vcmVjaGFydHMvcmVjaGFydHMvaXNzdWVzLzU1MTRcbiAgICovXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFpc1Bhbm9yYW1hKSB7XG4gICAgICBkaXNwYXRjaChzZXRMYXlvdXQobGF5b3V0KSk7XG4gICAgICBkaXNwYXRjaChzZXRNYXJnaW4obWFyZ2luKSk7XG4gICAgfVxuICB9LCBbZGlzcGF0Y2gsIGlzUGFub3JhbWEsIGxheW91dCwgbWFyZ2luXSk7XG4gIHJldHVybiBudWxsO1xufSIsImltcG9ydCB7IGNyZWF0ZVNsaWNlIH0gZnJvbSAnQHJlZHV4anMvdG9vbGtpdCc7XG5cbi8qKlxuICogRnJvbSBhbGwgQnJ1c2ggcHJvcGVydGllcywgb25seSBoZWlnaHQgaGFzIGEgZGVmYXVsdCB2YWx1ZSBhbmQgd2lsbCBhbHdheXMgYmUgZGVmaW5lZC5cbiAqIE90aGVyIHByb3BlcnRpZXMgYXJlIG51bGxhYmxlIGFuZCB3aWxsIGJlIGNvbXB1dGVkIGZyb20gb2Zmc2V0cyBhbmQgbWFyZ2lucyBpZiB0aGV5IGFyZSBub3Qgc2V0LlxuICovXG5cbnZhciBpbml0aWFsU3RhdGUgPSB7XG4gIHg6IDAsXG4gIHk6IDAsXG4gIHdpZHRoOiAwLFxuICBoZWlnaHQ6IDAsXG4gIHBhZGRpbmc6IHtcbiAgICB0b3A6IDAsXG4gICAgcmlnaHQ6IDAsXG4gICAgYm90dG9tOiAwLFxuICAgIGxlZnQ6IDBcbiAgfVxufTtcbmV4cG9ydCB2YXIgYnJ1c2hTbGljZSA9IGNyZWF0ZVNsaWNlKHtcbiAgbmFtZTogJ2JydXNoJyxcbiAgaW5pdGlhbFN0YXRlLFxuICByZWR1Y2Vyczoge1xuICAgIHNldEJydXNoU2V0dGluZ3MoX3N0YXRlLCBhY3Rpb24pIHtcbiAgICAgIGlmIChhY3Rpb24ucGF5bG9hZCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBpbml0aWFsU3RhdGU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYWN0aW9uLnBheWxvYWQ7XG4gICAgfVxuICB9XG59KTtcbmV4cG9ydCB2YXIge1xuICBzZXRCcnVzaFNldHRpbmdzXG59ID0gYnJ1c2hTbGljZS5hY3Rpb25zO1xuZXhwb3J0IHZhciBicnVzaFJlZHVjZXIgPSBicnVzaFNsaWNlLnJlZHVjZXI7IiwiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgUHJvdmlkZXIgfSBmcm9tICdyZWFjdC1yZWR1eCc7XG5pbXBvcnQgeyBjcmVhdGVSZWNoYXJ0c1N0b3JlIH0gZnJvbSAnLi9zdG9yZSc7XG5pbXBvcnQgeyB1c2VJc1Bhbm9yYW1hIH0gZnJvbSAnLi4vY29udGV4dC9QYW5vcmFtYUNvbnRleHQnO1xuaW1wb3J0IHsgUmVjaGFydHNSZWR1eENvbnRleHQgfSBmcm9tICcuL1JlY2hhcnRzUmVkdXhDb250ZXh0JztcbmV4cG9ydCBmdW5jdGlvbiBSZWNoYXJ0c1N0b3JlUHJvdmlkZXIoX3JlZikge1xuICB2YXIge1xuICAgIHByZWxvYWRlZFN0YXRlLFxuICAgIGNoaWxkcmVuLFxuICAgIHJlZHV4U3RvcmVOYW1lXG4gIH0gPSBfcmVmO1xuICB2YXIgaXNQYW5vcmFtYSA9IHVzZUlzUGFub3JhbWEoKTtcbiAgLypcbiAgICogV2h5IHRoZSByZWY/IFJlZHV4IG9mZmljaWFsIGRvY3VtZW50YXRpb24gcmVjb21tZW5kcyB0byB1c2Ugc3RvcmUgYXMgYSBzaW5nbGV0b24sXG4gICAqIGFuZCByZXVzZSB0aGF0IGV2ZXJ5d2hlcmU6IGh0dHBzOi8vcmVkdXgtdG9vbGtpdC5qcy5vcmcvYXBpL2NvbmZpZ3VyZVN0b3JlI2Jhc2ljLWV4YW1wbGVcbiAgICpcbiAgICogV2hpY2ggaXMgY29ycmVjdCEgRXhjZXB0IHRoYXQgaXMgY29uc2lkZXJpbmcgZGVwbG95aW5nIFJlZHV4IGluIGFuIGFwcC5cbiAgICogUmVjaGFydHMgYXMgYSBsaWJyYXJ5IHN1cHBvcnRzIG11bHRpcGxlIGNoYXJ0cyBvbiB0aGUgc2FtZSBwYWdlLlxuICAgKiBBbmQgZWFjaCBvZiB0aGVzZSBjaGFydHMgbmVlZHMgaXRzIG93biBzdG9yZSBpbmRlcGVuZGVudCBvZiBvdGhlcnMhXG4gICAqXG4gICAqIFRoZSBhbHRlcm5hdGl2ZSBpcyB0byBoYXZlIGV2ZXJ5dGhpbmcgaW4gdGhlIHN0b3JlIGtleWVkIGJ5IHRoZSBjaGFydCBpZC5cbiAgICogV2hpY2ggd291bGQgbWFrZSB3b3JraW5nIHdpdGggZXZlcnl0aGluZyBhIGxpdHRsZSBiaXQgbW9yZSBwYWluZnVsIGJlY2F1c2Ugd2UgbmVlZCB0aGUgY2hhcnQgaWQgZXZlcnl3aGVyZS5cbiAgICovXG4gIHZhciBzdG9yZVJlZiA9IHVzZVJlZihudWxsKTtcblxuICAvKlxuICAgKiBQYW5vcmFtYSBtZWFucyB0aGF0IHRoaXMgY2hhcnQgaXMgbm90IGl0cyBvd24gY2hhcnQsIGl0J3Mgb25seSBhIFwicHJldmlld1wiXG4gICAqIGJlaW5nIHJlbmRlcmVkIGFzIGEgY2hpbGQgb2YgQnJ1c2guXG4gICAqIEluIHN1Y2ggY2FzZSwgaXQgc2hvdWxkIG5vdCBoYXZlIGEgc3RvcmUgb24gaXRzIG93biAtIGl0IHNob3VsZCBpbXBsaWNpdGx5IGluaGVyaXRcbiAgICogd2hhdGV2ZXIgZGF0YSBpcyBpbiB0aGUgXCJwYXJlbnRcIiBvciBcInJvb3RcIiBjaGFydC5cbiAgICogV2hpY2ggaGVyZSBpcyByZXByZXNlbnRlZCBieSBub3QgaGF2aW5nIGEgUHJvdmlkZXIgYXQgYWxsLiBBbGwgc2VsZWN0b3JzIHdpbGwgdXNlIHRoZSByb290IHN0b3JlIGJ5IGRlZmF1bHQuXG4gICAqL1xuICBpZiAoaXNQYW5vcmFtYSkge1xuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfVxuICBpZiAoc3RvcmVSZWYuY3VycmVudCA9PSBudWxsKSB7XG4gICAgc3RvcmVSZWYuY3VycmVudCA9IGNyZWF0ZVJlY2hhcnRzU3RvcmUocHJlbG9hZGVkU3RhdGUsIHJlZHV4U3RvcmVOYW1lKTtcbiAgfVxuXG4gIC8vIHRzLWV4cGVjdC1lcnJvciBSZWFjdC1SZWR1eCB0eXBlcyBkZW1hbmQgdGhhdCB0aGUgY29udGV4dCBpbnRlcm5hbCB2YWx1ZSBpcyBub3QgbnVsbCwgYnV0IHdlIGhhdmUgdGhhdCBhcyBkZWZhdWx0LlxuICB2YXIgbm9uTnVsbENvbnRleHQgPSBSZWNoYXJ0c1JlZHV4Q29udGV4dDtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFByb3ZpZGVyLCB7XG4gICAgY29udGV4dDogbm9uTnVsbENvbnRleHQsXG4gICAgc3RvcmU6IHN0b3JlUmVmLmN1cnJlbnRcbiAgfSwgY2hpbGRyZW4pO1xufSIsImltcG9ydCB7IHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHVzZUFwcERpc3BhdGNoIH0gZnJvbSAnLi9ob29rcyc7XG5pbXBvcnQgeyB1cGRhdGVQb2xhck9wdGlvbnMgfSBmcm9tICcuL3BvbGFyT3B0aW9uc1NsaWNlJztcbmV4cG9ydCBmdW5jdGlvbiBSZXBvcnRQb2xhck9wdGlvbnMocHJvcHMpIHtcbiAgdmFyIGRpc3BhdGNoID0gdXNlQXBwRGlzcGF0Y2goKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBkaXNwYXRjaCh1cGRhdGVQb2xhck9wdGlvbnMocHJvcHMpKTtcbiAgfSwgW2Rpc3BhdGNoLCBwcm9wc10pO1xuICByZXR1cm4gbnVsbDtcbn0iLCJpbXBvcnQgeyB1c2VMYXlvdXRFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VJc1Bhbm9yYW1hIH0gZnJvbSAnLi4vY29udGV4dC9QYW5vcmFtYUNvbnRleHQnO1xuaW1wb3J0IHsgc2VsZWN0Q2hhcnRMYXlvdXQgfSBmcm9tICcuLi9jb250ZXh0L2NoYXJ0TGF5b3V0Q29udGV4dCc7XG5pbXBvcnQgeyB1c2VBcHBEaXNwYXRjaCwgdXNlQXBwU2VsZWN0b3IgfSBmcm9tICcuL2hvb2tzJztcbmltcG9ydCB7IGFkZExlZ2VuZFBheWxvYWQsIHJlbW92ZUxlZ2VuZFBheWxvYWQgfSBmcm9tICcuL2xlZ2VuZFNsaWNlJztcbnZhciBub29wID0gKCkgPT4ge307XG5leHBvcnQgZnVuY3Rpb24gU2V0TGVnZW5kUGF5bG9hZChfcmVmKSB7XG4gIHZhciB7XG4gICAgbGVnZW5kUGF5bG9hZFxuICB9ID0gX3JlZjtcbiAgdmFyIGRpc3BhdGNoID0gdXNlQXBwRGlzcGF0Y2goKTtcbiAgdmFyIGlzUGFub3JhbWEgPSB1c2VJc1Bhbm9yYW1hKCk7XG4gIHVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzUGFub3JhbWEpIHtcbiAgICAgIHJldHVybiBub29wO1xuICAgIH1cbiAgICBkaXNwYXRjaChhZGRMZWdlbmRQYXlsb2FkKGxlZ2VuZFBheWxvYWQpKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZGlzcGF0Y2gocmVtb3ZlTGVnZW5kUGF5bG9hZChsZWdlbmRQYXlsb2FkKSk7XG4gICAgfTtcbiAgfSwgW2Rpc3BhdGNoLCBpc1Bhbm9yYW1hLCBsZWdlbmRQYXlsb2FkXSk7XG4gIHJldHVybiBudWxsO1xufVxuZXhwb3J0IGZ1bmN0aW9uIFNldFBvbGFyTGVnZW5kUGF5bG9hZChfcmVmMikge1xuICB2YXIge1xuICAgIGxlZ2VuZFBheWxvYWRcbiAgfSA9IF9yZWYyO1xuICB2YXIgZGlzcGF0Y2ggPSB1c2VBcHBEaXNwYXRjaCgpO1xuICB2YXIgbGF5b3V0ID0gdXNlQXBwU2VsZWN0b3Ioc2VsZWN0Q2hhcnRMYXlvdXQpO1xuICB1c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChsYXlvdXQgIT09ICdjZW50cmljJyAmJiBsYXlvdXQgIT09ICdyYWRpYWwnKSB7XG4gICAgICByZXR1cm4gbm9vcDtcbiAgICB9XG4gICAgZGlzcGF0Y2goYWRkTGVnZW5kUGF5bG9hZChsZWdlbmRQYXlsb2FkKSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRpc3BhdGNoKHJlbW92ZUxlZ2VuZFBheWxvYWQobGVnZW5kUGF5bG9hZCkpO1xuICAgIH07XG4gIH0sIFtkaXNwYXRjaCwgbGF5b3V0LCBsZWdlbmRQYXlsb2FkXSk7XG4gIHJldHVybiBudWxsO1xufSIsInZhciBfZXhjbHVkZWQgPSBbXCJwb2ludHNcIiwgXCJjbGFzc05hbWVcIiwgXCJiYXNlTGluZVBvaW50c1wiLCBcImNvbm5lY3ROdWxsc1wiXTtcbmZ1bmN0aW9uIF9leHRlbmRzKCkgeyByZXR1cm4gX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAobikgeyBmb3IgKHZhciBlID0gMTsgZSA8IGFyZ3VtZW50cy5sZW5ndGg7IGUrKykgeyB2YXIgdCA9IGFyZ3VtZW50c1tlXTsgZm9yICh2YXIgciBpbiB0KSAoe30pLmhhc093blByb3BlcnR5LmNhbGwodCwgcikgJiYgKG5bcl0gPSB0W3JdKTsgfSByZXR1cm4gbjsgfSwgX2V4dGVuZHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKGUsIHQpIHsgaWYgKG51bGwgPT0gZSkgcmV0dXJuIHt9OyB2YXIgbywgciwgaSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKGUsIHQpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IGZvciAociA9IDA7IHIgPCBuLmxlbmd0aDsgcisrKSBvID0gbltyXSwgLTEgPT09IHQuaW5kZXhPZihvKSAmJiB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGUsIG8pICYmIChpW29dID0gZVtvXSk7IH0gcmV0dXJuIGk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHIsIGUpIHsgaWYgKG51bGwgPT0gcikgcmV0dXJuIHt9OyB2YXIgdCA9IHt9OyBmb3IgKHZhciBuIGluIHIpIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHIsIG4pKSB7IGlmICgtMSAhPT0gZS5pbmRleE9mKG4pKSBjb250aW51ZTsgdFtuXSA9IHJbbl07IH0gcmV0dXJuIHQ7IH1cbi8qKlxuICogQGZpbGVPdmVydmlldyBQb2x5Z29uXG4gKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IHN2Z1Byb3BlcnRpZXNBbmRFdmVudHMgfSBmcm9tICcuLi91dGlsL3N2Z1Byb3BlcnRpZXNBbmRFdmVudHMnO1xudmFyIGlzVmFsaWRhdGVQb2ludCA9IHBvaW50ID0+IHtcbiAgcmV0dXJuIHBvaW50ICYmIHBvaW50LnggPT09ICtwb2ludC54ICYmIHBvaW50LnkgPT09ICtwb2ludC55O1xufTtcbnZhciBnZXRQYXJzZWRQb2ludHMgPSBmdW5jdGlvbiBnZXRQYXJzZWRQb2ludHMoKSB7XG4gIHZhciBwb2ludHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IFtdO1xuICB2YXIgc2VnbWVudFBvaW50cyA9IFtbXV07XG4gIHBvaW50cy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICBpZiAoaXNWYWxpZGF0ZVBvaW50KGVudHJ5KSkge1xuICAgICAgc2VnbWVudFBvaW50c1tzZWdtZW50UG9pbnRzLmxlbmd0aCAtIDFdLnB1c2goZW50cnkpO1xuICAgIH0gZWxzZSBpZiAoc2VnbWVudFBvaW50c1tzZWdtZW50UG9pbnRzLmxlbmd0aCAtIDFdLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIGFkZCBhbm90aGVyIHBhdGhcbiAgICAgIHNlZ21lbnRQb2ludHMucHVzaChbXSk7XG4gICAgfVxuICB9KTtcbiAgaWYgKGlzVmFsaWRhdGVQb2ludChwb2ludHNbMF0pKSB7XG4gICAgc2VnbWVudFBvaW50c1tzZWdtZW50UG9pbnRzLmxlbmd0aCAtIDFdLnB1c2gocG9pbnRzWzBdKTtcbiAgfVxuICBpZiAoc2VnbWVudFBvaW50c1tzZWdtZW50UG9pbnRzLmxlbmd0aCAtIDFdLmxlbmd0aCA8PSAwKSB7XG4gICAgc2VnbWVudFBvaW50cyA9IHNlZ21lbnRQb2ludHMuc2xpY2UoMCwgLTEpO1xuICB9XG4gIHJldHVybiBzZWdtZW50UG9pbnRzO1xufTtcbnZhciBnZXRTaW5nbGVQb2x5Z29uUGF0aCA9IChwb2ludHMsIGNvbm5lY3ROdWxscykgPT4ge1xuICB2YXIgc2VnbWVudFBvaW50cyA9IGdldFBhcnNlZFBvaW50cyhwb2ludHMpO1xuICBpZiAoY29ubmVjdE51bGxzKSB7XG4gICAgc2VnbWVudFBvaW50cyA9IFtzZWdtZW50UG9pbnRzLnJlZHVjZSgocmVzLCBzZWdQb2ludHMpID0+IHtcbiAgICAgIHJldHVybiBbLi4ucmVzLCAuLi5zZWdQb2ludHNdO1xuICAgIH0sIFtdKV07XG4gIH1cbiAgdmFyIHBvbHlnb25QYXRoID0gc2VnbWVudFBvaW50cy5tYXAoc2VnUG9pbnRzID0+IHtcbiAgICByZXR1cm4gc2VnUG9pbnRzLnJlZHVjZSgocGF0aCwgcG9pbnQsIGluZGV4KSA9PiB7XG4gICAgICByZXR1cm4gXCJcIi5jb25jYXQocGF0aCkuY29uY2F0KGluZGV4ID09PSAwID8gJ00nIDogJ0wnKS5jb25jYXQocG9pbnQueCwgXCIsXCIpLmNvbmNhdChwb2ludC55KTtcbiAgICB9LCAnJyk7XG4gIH0pLmpvaW4oJycpO1xuICByZXR1cm4gc2VnbWVudFBvaW50cy5sZW5ndGggPT09IDEgPyBcIlwiLmNvbmNhdChwb2x5Z29uUGF0aCwgXCJaXCIpIDogcG9seWdvblBhdGg7XG59O1xudmFyIGdldFJhbmdsZVBhdGggPSAocG9pbnRzLCBiYXNlTGluZVBvaW50cywgY29ubmVjdE51bGxzKSA9PiB7XG4gIHZhciBvdXRlclBhdGggPSBnZXRTaW5nbGVQb2x5Z29uUGF0aChwb2ludHMsIGNvbm5lY3ROdWxscyk7XG4gIHJldHVybiBcIlwiLmNvbmNhdChvdXRlclBhdGguc2xpY2UoLTEpID09PSAnWicgPyBvdXRlclBhdGguc2xpY2UoMCwgLTEpIDogb3V0ZXJQYXRoLCBcIkxcIikuY29uY2F0KGdldFNpbmdsZVBvbHlnb25QYXRoKEFycmF5LmZyb20oYmFzZUxpbmVQb2ludHMpLnJldmVyc2UoKSwgY29ubmVjdE51bGxzKS5zbGljZSgxKSk7XG59O1xuZXhwb3J0IHZhciBQb2x5Z29uID0gcHJvcHMgPT4ge1xuICB2YXIge1xuICAgICAgcG9pbnRzLFxuICAgICAgY2xhc3NOYW1lLFxuICAgICAgYmFzZUxpbmVQb2ludHMsXG4gICAgICBjb25uZWN0TnVsbHNcbiAgICB9ID0gcHJvcHMsXG4gICAgb3RoZXJzID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKHByb3BzLCBfZXhjbHVkZWQpO1xuICBpZiAoIXBvaW50cyB8fCAhcG9pbnRzLmxlbmd0aCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBsYXllckNsYXNzID0gY2xzeCgncmVjaGFydHMtcG9seWdvbicsIGNsYXNzTmFtZSk7XG4gIGlmIChiYXNlTGluZVBvaW50cyAmJiBiYXNlTGluZVBvaW50cy5sZW5ndGgpIHtcbiAgICB2YXIgaGFzU3Ryb2tlID0gb3RoZXJzLnN0cm9rZSAmJiBvdGhlcnMuc3Ryb2tlICE9PSAnbm9uZSc7XG4gICAgdmFyIHJhbmdlUGF0aCA9IGdldFJhbmdsZVBhdGgocG9pbnRzLCBiYXNlTGluZVBvaW50cywgY29ubmVjdE51bGxzKTtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJnXCIsIHtcbiAgICAgIGNsYXNzTmFtZTogbGF5ZXJDbGFzc1xuICAgIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwicGF0aFwiLCBfZXh0ZW5kcyh7fSwgc3ZnUHJvcGVydGllc0FuZEV2ZW50cyhvdGhlcnMpLCB7XG4gICAgICBmaWxsOiByYW5nZVBhdGguc2xpY2UoLTEpID09PSAnWicgPyBvdGhlcnMuZmlsbCA6ICdub25lJyxcbiAgICAgIHN0cm9rZTogXCJub25lXCIsXG4gICAgICBkOiByYW5nZVBhdGhcbiAgICB9KSksIGhhc1N0cm9rZSA/IC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwicGF0aFwiLCBfZXh0ZW5kcyh7fSwgc3ZnUHJvcGVydGllc0FuZEV2ZW50cyhvdGhlcnMpLCB7XG4gICAgICBmaWxsOiBcIm5vbmVcIixcbiAgICAgIGQ6IGdldFNpbmdsZVBvbHlnb25QYXRoKHBvaW50cywgY29ubmVjdE51bGxzKVxuICAgIH0pKSA6IG51bGwsIGhhc1N0cm9rZSA/IC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwicGF0aFwiLCBfZXh0ZW5kcyh7fSwgc3ZnUHJvcGVydGllc0FuZEV2ZW50cyhvdGhlcnMpLCB7XG4gICAgICBmaWxsOiBcIm5vbmVcIixcbiAgICAgIGQ6IGdldFNpbmdsZVBvbHlnb25QYXRoKGJhc2VMaW5lUG9pbnRzLCBjb25uZWN0TnVsbHMpXG4gICAgfSkpIDogbnVsbCk7XG4gIH1cbiAgdmFyIHNpbmdsZVBhdGggPSBnZXRTaW5nbGVQb2x5Z29uUGF0aChwb2ludHMsIGNvbm5lY3ROdWxscyk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcInBhdGhcIiwgX2V4dGVuZHMoe30sIHN2Z1Byb3BlcnRpZXNBbmRFdmVudHMob3RoZXJzKSwge1xuICAgIGZpbGw6IHNpbmdsZVBhdGguc2xpY2UoLTEpID09PSAnWicgPyBvdGhlcnMuZmlsbCA6ICdub25lJyxcbiAgICBjbGFzc05hbWU6IGxheWVyQ2xhc3MsXG4gICAgZDogc2luZ2xlUGF0aFxuICB9KSk7XG59OyIsImltcG9ydCB7IGNyZWF0ZVNsaWNlIH0gZnJvbSAnQHJlZHV4anMvdG9vbGtpdCc7XG5cbi8qKlxuICogRXJyb3JCYXJzIGhhdmUgbG90IG1vcmUgc2V0dGluZ3MgYnV0IGFsbCB0aGUgb3RoZXJzIGFyZSBzY29wZWQgdG8gdGhlIGNvbXBvbmVudCBpdHNlbGYuXG4gKiBPbmx5IHNvbWUgb2YgdGhlbSByZXF1aXJlZCB0byBiZSByZXBvcnRlZCB0byB0aGUgZ2xvYmFsIHN0b3JlIGJlY2F1c2UgWEF4aXMgYW5kIFlBeGlzIG5lZWQgdG8ga25vd1xuICogaWYgdGhlIGVycm9yIGJhciBpcyBjb250cmlidXRpbmcgdG8gZXh0ZW5kaW5nIHRoZSBheGlzIGRvbWFpbi5cbiAqL1xuXG52YXIgaW5pdGlhbFN0YXRlID0ge307XG52YXIgZXJyb3JCYXJTbGljZSA9IGNyZWF0ZVNsaWNlKHtcbiAgbmFtZTogJ2Vycm9yQmFycycsXG4gIGluaXRpYWxTdGF0ZSxcbiAgcmVkdWNlcnM6IHtcbiAgICBhZGRFcnJvckJhcjogKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgICAgIHZhciB7XG4gICAgICAgIGl0ZW1JZCxcbiAgICAgICAgZXJyb3JCYXJcbiAgICAgIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIGlmICghc3RhdGVbaXRlbUlkXSkge1xuICAgICAgICBzdGF0ZVtpdGVtSWRdID0gW107XG4gICAgICB9XG4gICAgICBzdGF0ZVtpdGVtSWRdLnB1c2goZXJyb3JCYXIpO1xuICAgIH0sXG4gICAgcmVwbGFjZUVycm9yQmFyOiAoc3RhdGUsIGFjdGlvbikgPT4ge1xuICAgICAgdmFyIHtcbiAgICAgICAgaXRlbUlkLFxuICAgICAgICBwcmV2LFxuICAgICAgICBuZXh0XG4gICAgICB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICBpZiAoc3RhdGVbaXRlbUlkXSkge1xuICAgICAgICBzdGF0ZVtpdGVtSWRdID0gc3RhdGVbaXRlbUlkXS5tYXAoZSA9PiBlLmRhdGFLZXkgPT09IHByZXYuZGF0YUtleSAmJiBlLmRpcmVjdGlvbiA9PT0gcHJldi5kaXJlY3Rpb24gPyBuZXh0IDogZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZW1vdmVFcnJvckJhcjogKHN0YXRlLCBhY3Rpb24pID0+IHtcbiAgICAgIHZhciB7XG4gICAgICAgIGl0ZW1JZCxcbiAgICAgICAgZXJyb3JCYXJcbiAgICAgIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIGlmIChzdGF0ZVtpdGVtSWRdKSB7XG4gICAgICAgIHN0YXRlW2l0ZW1JZF0gPSBzdGF0ZVtpdGVtSWRdLmZpbHRlcihlID0+IGUuZGF0YUtleSAhPT0gZXJyb3JCYXIuZGF0YUtleSB8fCBlLmRpcmVjdGlvbiAhPT0gZXJyb3JCYXIuZGlyZWN0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pO1xuZXhwb3J0IHZhciB7XG4gIGFkZEVycm9yQmFyLFxuICByZXBsYWNlRXJyb3JCYXIsXG4gIHJlbW92ZUVycm9yQmFyXG59ID0gZXJyb3JCYXJTbGljZS5hY3Rpb25zO1xuZXhwb3J0IHZhciBlcnJvckJhclJlZHVjZXIgPSBlcnJvckJhclNsaWNlLnJlZHVjZXI7IiwidmFyIF9leGNsdWRlZCA9IFtcInJhZGl1c1wiXSxcbiAgX2V4Y2x1ZGVkMiA9IFtcInJhZGl1c1wiXTtcbmZ1bmN0aW9uIG93bktleXMoZSwgcikgeyB2YXIgdCA9IE9iamVjdC5rZXlzKGUpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IHIgJiYgKG8gPSBvLmZpbHRlcihmdW5jdGlvbiAocikgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCByKS5lbnVtZXJhYmxlOyB9KSksIHQucHVzaC5hcHBseSh0LCBvKTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZChlKSB7IGZvciAodmFyIHIgPSAxOyByIDwgYXJndW1lbnRzLmxlbmd0aDsgcisrKSB7IHZhciB0ID0gbnVsbCAhPSBhcmd1bWVudHNbcl0gPyBhcmd1bWVudHNbcl0gOiB7fTsgciAlIDIgPyBvd25LZXlzKE9iamVjdCh0KSwgITApLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgX2RlZmluZVByb3BlcnR5KGUsIHIsIHRbcl0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModCkpIDogb3duS2V5cyhPYmplY3QodCkpLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCwgcikpOyB9KTsgfSByZXR1cm4gZTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGUsIHIsIHQpIHsgcmV0dXJuIChyID0gX3RvUHJvcGVydHlLZXkocikpIGluIGUgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgeyB2YWx1ZTogdCwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSA6IGVbcl0gPSB0LCBlOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleSh0KSB7IHZhciBpID0gX3RvUHJpbWl0aXZlKHQsIFwic3RyaW5nXCIpOyByZXR1cm4gXCJzeW1ib2xcIiA9PSB0eXBlb2YgaSA/IGkgOiBpICsgXCJcIjsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKHQsIHIpIHsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIHQgfHwgIXQpIHJldHVybiB0OyB2YXIgZSA9IHRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHZvaWQgMCAhPT0gZSkgeyB2YXIgaSA9IGUuY2FsbCh0LCByIHx8IFwiZGVmYXVsdFwiKTsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIGkpIHJldHVybiBpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChcInN0cmluZ1wiID09PSByID8gU3RyaW5nIDogTnVtYmVyKSh0KTsgfVxuZnVuY3Rpb24gX2V4dGVuZHMoKSB7IHJldHVybiBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gPyBPYmplY3QuYXNzaWduLmJpbmQoKSA6IGZ1bmN0aW9uIChuKSB7IGZvciAodmFyIGUgPSAxOyBlIDwgYXJndW1lbnRzLmxlbmd0aDsgZSsrKSB7IHZhciB0ID0gYXJndW1lbnRzW2VdOyBmb3IgKHZhciByIGluIHQpICh7fSkuaGFzT3duUHJvcGVydHkuY2FsbCh0LCByKSAmJiAobltyXSA9IHRbcl0pOyB9IHJldHVybiBuOyB9LCBfZXh0ZW5kcy5hcHBseShudWxsLCBhcmd1bWVudHMpOyB9XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoZSwgdCkgeyBpZiAobnVsbCA9PSBlKSByZXR1cm4ge307IHZhciBvLCByLCBpID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2UoZSwgdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBuID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhlKTsgZm9yIChyID0gMDsgciA8IG4ubGVuZ3RoOyByKyspIG8gPSBuW3JdLCAtMSA9PT0gdC5pbmRleE9mKG8pICYmIHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoZSwgbykgJiYgKGlbb10gPSBlW29dKTsgfSByZXR1cm4gaTsgfVxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2UociwgZSkgeyBpZiAobnVsbCA9PSByKSByZXR1cm4ge307IHZhciB0ID0ge307IGZvciAodmFyIG4gaW4gcikgaWYgKHt9Lmhhc093blByb3BlcnR5LmNhbGwociwgbikpIHsgaWYgKC0xICE9PSBlLmluZGV4T2YobikpIGNvbnRpbnVlOyB0W25dID0gcltuXTsgfSByZXR1cm4gdDsgfVxuLyoqXG4gKiBAZmlsZU92ZXJ2aWV3IFJlY3RhbmdsZVxuICovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyByZXNvbHZlRGVmYXVsdFByb3BzIH0gZnJvbSAnLi4vdXRpbC9yZXNvbHZlRGVmYXVsdFByb3BzJztcbmltcG9ydCB7IEphdmFzY3JpcHRBbmltYXRlIH0gZnJvbSAnLi4vYW5pbWF0aW9uL0phdmFzY3JpcHRBbmltYXRlJztcbmltcG9ydCB7IGludGVycG9sYXRlIH0gZnJvbSAnLi4vdXRpbC9EYXRhVXRpbHMnO1xuaW1wb3J0IHsgdXNlQW5pbWF0aW9uSWQgfSBmcm9tICcuLi91dGlsL3VzZUFuaW1hdGlvbklkJztcbmltcG9ydCB7IGdldFRyYW5zaXRpb25WYWwgfSBmcm9tICcuLi9hbmltYXRpb24vdXRpbCc7XG5pbXBvcnQgeyBzdmdQcm9wZXJ0aWVzQW5kRXZlbnRzIH0gZnJvbSAnLi4vdXRpbC9zdmdQcm9wZXJ0aWVzQW5kRXZlbnRzJztcbnZhciBnZXRSZWN0YW5nbGVQYXRoID0gKHgsIHksIHdpZHRoLCBoZWlnaHQsIHJhZGl1cykgPT4ge1xuICB2YXIgbWF4UmFkaXVzID0gTWF0aC5taW4oTWF0aC5hYnMod2lkdGgpIC8gMiwgTWF0aC5hYnMoaGVpZ2h0KSAvIDIpO1xuICB2YXIgeVNpZ24gPSBoZWlnaHQgPj0gMCA/IDEgOiAtMTtcbiAgdmFyIHhTaWduID0gd2lkdGggPj0gMCA/IDEgOiAtMTtcbiAgdmFyIGNsb2NrV2lzZSA9IGhlaWdodCA+PSAwICYmIHdpZHRoID49IDAgfHwgaGVpZ2h0IDwgMCAmJiB3aWR0aCA8IDAgPyAxIDogMDtcbiAgdmFyIHBhdGg7XG4gIGlmIChtYXhSYWRpdXMgPiAwICYmIHJhZGl1cyBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgdmFyIG5ld1JhZGl1cyA9IFswLCAwLCAwLCAwXTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gNDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBuZXdSYWRpdXNbaV0gPSByYWRpdXNbaV0gPiBtYXhSYWRpdXMgPyBtYXhSYWRpdXMgOiByYWRpdXNbaV07XG4gICAgfVxuICAgIHBhdGggPSBcIk1cIi5jb25jYXQoeCwgXCIsXCIpLmNvbmNhdCh5ICsgeVNpZ24gKiBuZXdSYWRpdXNbMF0pO1xuICAgIGlmIChuZXdSYWRpdXNbMF0gPiAwKSB7XG4gICAgICBwYXRoICs9IFwiQSBcIi5jb25jYXQobmV3UmFkaXVzWzBdLCBcIixcIikuY29uY2F0KG5ld1JhZGl1c1swXSwgXCIsMCwwLFwiKS5jb25jYXQoY2xvY2tXaXNlLCBcIixcIikuY29uY2F0KHggKyB4U2lnbiAqIG5ld1JhZGl1c1swXSwgXCIsXCIpLmNvbmNhdCh5KTtcbiAgICB9XG4gICAgcGF0aCArPSBcIkwgXCIuY29uY2F0KHggKyB3aWR0aCAtIHhTaWduICogbmV3UmFkaXVzWzFdLCBcIixcIikuY29uY2F0KHkpO1xuICAgIGlmIChuZXdSYWRpdXNbMV0gPiAwKSB7XG4gICAgICBwYXRoICs9IFwiQSBcIi5jb25jYXQobmV3UmFkaXVzWzFdLCBcIixcIikuY29uY2F0KG5ld1JhZGl1c1sxXSwgXCIsMCwwLFwiKS5jb25jYXQoY2xvY2tXaXNlLCBcIixcXG4gICAgICAgIFwiKS5jb25jYXQoeCArIHdpZHRoLCBcIixcIikuY29uY2F0KHkgKyB5U2lnbiAqIG5ld1JhZGl1c1sxXSk7XG4gICAgfVxuICAgIHBhdGggKz0gXCJMIFwiLmNvbmNhdCh4ICsgd2lkdGgsIFwiLFwiKS5jb25jYXQoeSArIGhlaWdodCAtIHlTaWduICogbmV3UmFkaXVzWzJdKTtcbiAgICBpZiAobmV3UmFkaXVzWzJdID4gMCkge1xuICAgICAgcGF0aCArPSBcIkEgXCIuY29uY2F0KG5ld1JhZGl1c1syXSwgXCIsXCIpLmNvbmNhdChuZXdSYWRpdXNbMl0sIFwiLDAsMCxcIikuY29uY2F0KGNsb2NrV2lzZSwgXCIsXFxuICAgICAgICBcIikuY29uY2F0KHggKyB3aWR0aCAtIHhTaWduICogbmV3UmFkaXVzWzJdLCBcIixcIikuY29uY2F0KHkgKyBoZWlnaHQpO1xuICAgIH1cbiAgICBwYXRoICs9IFwiTCBcIi5jb25jYXQoeCArIHhTaWduICogbmV3UmFkaXVzWzNdLCBcIixcIikuY29uY2F0KHkgKyBoZWlnaHQpO1xuICAgIGlmIChuZXdSYWRpdXNbM10gPiAwKSB7XG4gICAgICBwYXRoICs9IFwiQSBcIi5jb25jYXQobmV3UmFkaXVzWzNdLCBcIixcIikuY29uY2F0KG5ld1JhZGl1c1szXSwgXCIsMCwwLFwiKS5jb25jYXQoY2xvY2tXaXNlLCBcIixcXG4gICAgICAgIFwiKS5jb25jYXQoeCwgXCIsXCIpLmNvbmNhdCh5ICsgaGVpZ2h0IC0geVNpZ24gKiBuZXdSYWRpdXNbM10pO1xuICAgIH1cbiAgICBwYXRoICs9ICdaJztcbiAgfSBlbHNlIGlmIChtYXhSYWRpdXMgPiAwICYmIHJhZGl1cyA9PT0gK3JhZGl1cyAmJiByYWRpdXMgPiAwKSB7XG4gICAgdmFyIF9uZXdSYWRpdXMgPSBNYXRoLm1pbihtYXhSYWRpdXMsIHJhZGl1cyk7XG4gICAgcGF0aCA9IFwiTSBcIi5jb25jYXQoeCwgXCIsXCIpLmNvbmNhdCh5ICsgeVNpZ24gKiBfbmV3UmFkaXVzLCBcIlxcbiAgICAgICAgICAgIEEgXCIpLmNvbmNhdChfbmV3UmFkaXVzLCBcIixcIikuY29uY2F0KF9uZXdSYWRpdXMsIFwiLDAsMCxcIikuY29uY2F0KGNsb2NrV2lzZSwgXCIsXCIpLmNvbmNhdCh4ICsgeFNpZ24gKiBfbmV3UmFkaXVzLCBcIixcIikuY29uY2F0KHksIFwiXFxuICAgICAgICAgICAgTCBcIikuY29uY2F0KHggKyB3aWR0aCAtIHhTaWduICogX25ld1JhZGl1cywgXCIsXCIpLmNvbmNhdCh5LCBcIlxcbiAgICAgICAgICAgIEEgXCIpLmNvbmNhdChfbmV3UmFkaXVzLCBcIixcIikuY29uY2F0KF9uZXdSYWRpdXMsIFwiLDAsMCxcIikuY29uY2F0KGNsb2NrV2lzZSwgXCIsXCIpLmNvbmNhdCh4ICsgd2lkdGgsIFwiLFwiKS5jb25jYXQoeSArIHlTaWduICogX25ld1JhZGl1cywgXCJcXG4gICAgICAgICAgICBMIFwiKS5jb25jYXQoeCArIHdpZHRoLCBcIixcIikuY29uY2F0KHkgKyBoZWlnaHQgLSB5U2lnbiAqIF9uZXdSYWRpdXMsIFwiXFxuICAgICAgICAgICAgQSBcIikuY29uY2F0KF9uZXdSYWRpdXMsIFwiLFwiKS5jb25jYXQoX25ld1JhZGl1cywgXCIsMCwwLFwiKS5jb25jYXQoY2xvY2tXaXNlLCBcIixcIikuY29uY2F0KHggKyB3aWR0aCAtIHhTaWduICogX25ld1JhZGl1cywgXCIsXCIpLmNvbmNhdCh5ICsgaGVpZ2h0LCBcIlxcbiAgICAgICAgICAgIEwgXCIpLmNvbmNhdCh4ICsgeFNpZ24gKiBfbmV3UmFkaXVzLCBcIixcIikuY29uY2F0KHkgKyBoZWlnaHQsIFwiXFxuICAgICAgICAgICAgQSBcIikuY29uY2F0KF9uZXdSYWRpdXMsIFwiLFwiKS5jb25jYXQoX25ld1JhZGl1cywgXCIsMCwwLFwiKS5jb25jYXQoY2xvY2tXaXNlLCBcIixcIikuY29uY2F0KHgsIFwiLFwiKS5jb25jYXQoeSArIGhlaWdodCAtIHlTaWduICogX25ld1JhZGl1cywgXCIgWlwiKTtcbiAgfSBlbHNlIHtcbiAgICBwYXRoID0gXCJNIFwiLmNvbmNhdCh4LCBcIixcIikuY29uY2F0KHksIFwiIGggXCIpLmNvbmNhdCh3aWR0aCwgXCIgdiBcIikuY29uY2F0KGhlaWdodCwgXCIgaCBcIikuY29uY2F0KC13aWR0aCwgXCIgWlwiKTtcbiAgfVxuICByZXR1cm4gcGF0aDtcbn07XG52YXIgZGVmYXVsdFByb3BzID0ge1xuICB4OiAwLFxuICB5OiAwLFxuICB3aWR0aDogMCxcbiAgaGVpZ2h0OiAwLFxuICAvLyBUaGUgcmFkaXVzIG9mIGJvcmRlclxuICAvLyBUaGUgcmFkaXVzIG9mIGZvdXIgY29ybmVycyB3aGVuIHJhZGl1cyBpcyBhIG51bWJlclxuICAvLyBUaGUgcmFkaXVzIG9mIGxlZnQtdG9wLCByaWdodC10b3AsIHJpZ2h0LWJvdHRvbSwgbGVmdC1ib3R0b20gd2hlbiByYWRpdXMgaXMgYW4gYXJyYXlcbiAgcmFkaXVzOiAwLFxuICBpc0FuaW1hdGlvbkFjdGl2ZTogZmFsc2UsXG4gIGlzVXBkYXRlQW5pbWF0aW9uQWN0aXZlOiBmYWxzZSxcbiAgYW5pbWF0aW9uQmVnaW46IDAsXG4gIGFuaW1hdGlvbkR1cmF0aW9uOiAxNTAwLFxuICBhbmltYXRpb25FYXNpbmc6ICdlYXNlJ1xufTtcbmV4cG9ydCB2YXIgUmVjdGFuZ2xlID0gcmVjdGFuZ2xlUHJvcHMgPT4ge1xuICB2YXIgcHJvcHMgPSByZXNvbHZlRGVmYXVsdFByb3BzKHJlY3RhbmdsZVByb3BzLCBkZWZhdWx0UHJvcHMpO1xuICB2YXIgcGF0aFJlZiA9IHVzZVJlZihudWxsKTtcbiAgdmFyIFt0b3RhbExlbmd0aCwgc2V0VG90YWxMZW5ndGhdID0gdXNlU3RhdGUoLTEpO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwYXRoUmVmLmN1cnJlbnQgJiYgcGF0aFJlZi5jdXJyZW50LmdldFRvdGFsTGVuZ3RoKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgcGF0aFRvdGFsTGVuZ3RoID0gcGF0aFJlZi5jdXJyZW50LmdldFRvdGFsTGVuZ3RoKCk7XG4gICAgICAgIGlmIChwYXRoVG90YWxMZW5ndGgpIHtcbiAgICAgICAgICBzZXRUb3RhbExlbmd0aChwYXRoVG90YWxMZW5ndGgpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChfdW51c2VkKSB7XG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0b3RhbCBsZW5ndGggZXJyb3JcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtdKTtcbiAgdmFyIHtcbiAgICB4LFxuICAgIHksXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIHJhZGl1cyxcbiAgICBjbGFzc05hbWVcbiAgfSA9IHByb3BzO1xuICB2YXIge1xuICAgIGFuaW1hdGlvbkVhc2luZyxcbiAgICBhbmltYXRpb25EdXJhdGlvbixcbiAgICBhbmltYXRpb25CZWdpbixcbiAgICBpc0FuaW1hdGlvbkFjdGl2ZSxcbiAgICBpc1VwZGF0ZUFuaW1hdGlvbkFjdGl2ZVxuICB9ID0gcHJvcHM7XG4gIHZhciBwcmV2V2lkdGhSZWYgPSB1c2VSZWYod2lkdGgpO1xuICB2YXIgcHJldkhlaWdodFJlZiA9IHVzZVJlZihoZWlnaHQpO1xuICB2YXIgcHJldlhSZWYgPSB1c2VSZWYoeCk7XG4gIHZhciBwcmV2WVJlZiA9IHVzZVJlZih5KTtcbiAgdmFyIGFuaW1hdGlvbklkSW5wdXQgPSB1c2VNZW1vKCgpID0+ICh7XG4gICAgeCxcbiAgICB5LFxuICAgIHdpZHRoLFxuICAgIGhlaWdodCxcbiAgICByYWRpdXNcbiAgfSksIFt4LCB5LCB3aWR0aCwgaGVpZ2h0LCByYWRpdXNdKTtcbiAgdmFyIGFuaW1hdGlvbklkID0gdXNlQW5pbWF0aW9uSWQoYW5pbWF0aW9uSWRJbnB1dCwgJ3JlY3RhbmdsZS0nKTtcbiAgaWYgKHggIT09ICt4IHx8IHkgIT09ICt5IHx8IHdpZHRoICE9PSArd2lkdGggfHwgaGVpZ2h0ICE9PSAraGVpZ2h0IHx8IHdpZHRoID09PSAwIHx8IGhlaWdodCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBsYXllckNsYXNzID0gY2xzeCgncmVjaGFydHMtcmVjdGFuZ2xlJywgY2xhc3NOYW1lKTtcbiAgaWYgKCFpc1VwZGF0ZUFuaW1hdGlvbkFjdGl2ZSkge1xuICAgIHZhciBfc3ZnUHJvcGVydGllc0FuZEV2ZW4gPSBzdmdQcm9wZXJ0aWVzQW5kRXZlbnRzKHByb3BzKSxcbiAgICAgIHtcbiAgICAgICAgcmFkaXVzOiBfXG4gICAgICB9ID0gX3N2Z1Byb3BlcnRpZXNBbmRFdmVuLFxuICAgICAgb3RoZXJQYXRoUHJvcHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoX3N2Z1Byb3BlcnRpZXNBbmRFdmVuLCBfZXhjbHVkZWQpO1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcInBhdGhcIiwgX2V4dGVuZHMoe30sIG90aGVyUGF0aFByb3BzLCB7XG4gICAgICByYWRpdXM6IHR5cGVvZiByYWRpdXMgPT09ICdudW1iZXInID8gcmFkaXVzIDogdW5kZWZpbmVkLFxuICAgICAgY2xhc3NOYW1lOiBsYXllckNsYXNzLFxuICAgICAgZDogZ2V0UmVjdGFuZ2xlUGF0aCh4LCB5LCB3aWR0aCwgaGVpZ2h0LCByYWRpdXMpXG4gICAgfSkpO1xuICB9XG4gIHZhciBwcmV2V2lkdGggPSBwcmV2V2lkdGhSZWYuY3VycmVudDtcbiAgdmFyIHByZXZIZWlnaHQgPSBwcmV2SGVpZ2h0UmVmLmN1cnJlbnQ7XG4gIHZhciBwcmV2WCA9IHByZXZYUmVmLmN1cnJlbnQ7XG4gIHZhciBwcmV2WSA9IHByZXZZUmVmLmN1cnJlbnQ7XG4gIHZhciBmcm9tID0gXCIwcHggXCIuY29uY2F0KHRvdGFsTGVuZ3RoID09PSAtMSA/IDEgOiB0b3RhbExlbmd0aCwgXCJweFwiKTtcbiAgdmFyIHRvID0gXCJcIi5jb25jYXQodG90YWxMZW5ndGgsIFwicHggMHB4XCIpO1xuICB2YXIgdHJhbnNpdGlvbiA9IGdldFRyYW5zaXRpb25WYWwoWydzdHJva2VEYXNoYXJyYXknXSwgYW5pbWF0aW9uRHVyYXRpb24sIHR5cGVvZiBhbmltYXRpb25FYXNpbmcgPT09ICdzdHJpbmcnID8gYW5pbWF0aW9uRWFzaW5nIDogdW5kZWZpbmVkKTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEphdmFzY3JpcHRBbmltYXRlLCB7XG4gICAgYW5pbWF0aW9uSWQ6IGFuaW1hdGlvbklkLFxuICAgIGtleTogYW5pbWF0aW9uSWQsXG4gICAgY2FuQmVnaW46IHRvdGFsTGVuZ3RoID4gMCxcbiAgICBkdXJhdGlvbjogYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgZWFzaW5nOiBhbmltYXRpb25FYXNpbmcsXG4gICAgaXNBY3RpdmU6IGlzVXBkYXRlQW5pbWF0aW9uQWN0aXZlLFxuICAgIGJlZ2luOiBhbmltYXRpb25CZWdpblxuICB9LCB0ID0+IHtcbiAgICB2YXIgY3VycldpZHRoID0gaW50ZXJwb2xhdGUocHJldldpZHRoLCB3aWR0aCwgdCk7XG4gICAgdmFyIGN1cnJIZWlnaHQgPSBpbnRlcnBvbGF0ZShwcmV2SGVpZ2h0LCBoZWlnaHQsIHQpO1xuICAgIHZhciBjdXJyWCA9IGludGVycG9sYXRlKHByZXZYLCB4LCB0KTtcbiAgICB2YXIgY3VyclkgPSBpbnRlcnBvbGF0ZShwcmV2WSwgeSwgdCk7XG4gICAgaWYgKHBhdGhSZWYuY3VycmVudCkge1xuICAgICAgcHJldldpZHRoUmVmLmN1cnJlbnQgPSBjdXJyV2lkdGg7XG4gICAgICBwcmV2SGVpZ2h0UmVmLmN1cnJlbnQgPSBjdXJySGVpZ2h0O1xuICAgICAgcHJldlhSZWYuY3VycmVudCA9IGN1cnJYO1xuICAgICAgcHJldllSZWYuY3VycmVudCA9IGN1cnJZO1xuICAgIH1cbiAgICB2YXIgYW5pbWF0aW9uU3R5bGU7XG4gICAgaWYgKCFpc0FuaW1hdGlvbkFjdGl2ZSkge1xuICAgICAgYW5pbWF0aW9uU3R5bGUgPSB7XG4gICAgICAgIHN0cm9rZURhc2hhcnJheTogdG9cbiAgICAgIH07XG4gICAgfSBlbHNlIGlmICh0ID4gMCkge1xuICAgICAgYW5pbWF0aW9uU3R5bGUgPSB7XG4gICAgICAgIHRyYW5zaXRpb24sXG4gICAgICAgIHN0cm9rZURhc2hhcnJheTogdG9cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGFuaW1hdGlvblN0eWxlID0ge1xuICAgICAgICBzdHJva2VEYXNoYXJyYXk6IGZyb21cbiAgICAgIH07XG4gICAgfVxuICAgIHZhciBfc3ZnUHJvcGVydGllc0FuZEV2ZW4yID0gc3ZnUHJvcGVydGllc0FuZEV2ZW50cyhwcm9wcyksXG4gICAgICB7XG4gICAgICAgIHJhZGl1czogX1xuICAgICAgfSA9IF9zdmdQcm9wZXJ0aWVzQW5kRXZlbjIsXG4gICAgICBvdGhlclBhdGhQcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfc3ZnUHJvcGVydGllc0FuZEV2ZW4yLCBfZXhjbHVkZWQyKTtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJwYXRoXCIsIF9leHRlbmRzKHt9LCBvdGhlclBhdGhQcm9wcywge1xuICAgICAgcmFkaXVzOiB0eXBlb2YgcmFkaXVzID09PSAnbnVtYmVyJyA/IHJhZGl1cyA6IHVuZGVmaW5lZCxcbiAgICAgIGNsYXNzTmFtZTogbGF5ZXJDbGFzcyxcbiAgICAgIGQ6IGdldFJlY3RhbmdsZVBhdGgoY3VyclgsIGN1cnJZLCBjdXJyV2lkdGgsIGN1cnJIZWlnaHQsIHJhZGl1cyksXG4gICAgICByZWY6IHBhdGhSZWYsXG4gICAgICBzdHlsZTogX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBhbmltYXRpb25TdHlsZSksIHByb3BzLnN0eWxlKVxuICAgIH0pKTtcbiAgfSk7XG59OyIsInZhciBfZXhjbHVkZWQgPSBbXCJ4XCIsIFwieVwiLCBcInRvcFwiLCBcImxlZnRcIiwgXCJ3aWR0aFwiLCBcImhlaWdodFwiLCBcImNsYXNzTmFtZVwiXTtcbmZ1bmN0aW9uIF9leHRlbmRzKCkgeyByZXR1cm4gX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAobikgeyBmb3IgKHZhciBlID0gMTsgZSA8IGFyZ3VtZW50cy5sZW5ndGg7IGUrKykgeyB2YXIgdCA9IGFyZ3VtZW50c1tlXTsgZm9yICh2YXIgciBpbiB0KSAoe30pLmhhc093blByb3BlcnR5LmNhbGwodCwgcikgJiYgKG5bcl0gPSB0W3JdKTsgfSByZXR1cm4gbjsgfSwgX2V4dGVuZHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuZnVuY3Rpb24gb3duS2V5cyhlLCByKSB7IHZhciB0ID0gT2JqZWN0LmtleXMoZSk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBvID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhlKTsgciAmJiAobyA9IG8uZmlsdGVyKGZ1bmN0aW9uIChyKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGUsIHIpLmVudW1lcmFibGU7IH0pKSwgdC5wdXNoLmFwcGx5KHQsIG8pOyB9IHJldHVybiB0OyB9XG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKGUpIHsgZm9yICh2YXIgciA9IDE7IHIgPCBhcmd1bWVudHMubGVuZ3RoOyByKyspIHsgdmFyIHQgPSBudWxsICE9IGFyZ3VtZW50c1tyXSA/IGFyZ3VtZW50c1tyXSA6IHt9OyByICUgMiA/IG93bktleXMoT2JqZWN0KHQpLCAhMCkuZm9yRWFjaChmdW5jdGlvbiAocikgeyBfZGVmaW5lUHJvcGVydHkoZSwgciwgdFtyXSk7IH0pIDogT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhlLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0KSkgOiBvd25LZXlzKE9iamVjdCh0KSkuZm9yRWFjaChmdW5jdGlvbiAocikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0LCByKSk7IH0pOyB9IHJldHVybiBlOyB9XG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkoZSwgciwgdCkgeyByZXR1cm4gKHIgPSBfdG9Qcm9wZXJ0eUtleShyKSkgaW4gZSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCB7IHZhbHVlOiB0LCBlbnVtZXJhYmxlOiAhMCwgY29uZmlndXJhYmxlOiAhMCwgd3JpdGFibGU6ICEwIH0pIDogZVtyXSA9IHQsIGU7IH1cbmZ1bmN0aW9uIF90b1Byb3BlcnR5S2V5KHQpIHsgdmFyIGkgPSBfdG9QcmltaXRpdmUodCwgXCJzdHJpbmdcIik7IHJldHVybiBcInN5bWJvbFwiID09IHR5cGVvZiBpID8gaSA6IGkgKyBcIlwiOyB9XG5mdW5jdGlvbiBfdG9QcmltaXRpdmUodCwgcikgeyBpZiAoXCJvYmplY3RcIiAhPSB0eXBlb2YgdCB8fCAhdCkgcmV0dXJuIHQ7IHZhciBlID0gdFtTeW1ib2wudG9QcmltaXRpdmVdOyBpZiAodm9pZCAwICE9PSBlKSB7IHZhciBpID0gZS5jYWxsKHQsIHIgfHwgXCJkZWZhdWx0XCIpOyBpZiAoXCJvYmplY3RcIiAhPSB0eXBlb2YgaSkgcmV0dXJuIGk7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJAQHRvUHJpbWl0aXZlIG11c3QgcmV0dXJuIGEgcHJpbWl0aXZlIHZhbHVlLlwiKTsgfSByZXR1cm4gKFwic3RyaW5nXCIgPT09IHIgPyBTdHJpbmcgOiBOdW1iZXIpKHQpOyB9XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoZSwgdCkgeyBpZiAobnVsbCA9PSBlKSByZXR1cm4ge307IHZhciBvLCByLCBpID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2UoZSwgdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBuID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhlKTsgZm9yIChyID0gMDsgciA8IG4ubGVuZ3RoOyByKyspIG8gPSBuW3JdLCAtMSA9PT0gdC5pbmRleE9mKG8pICYmIHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoZSwgbykgJiYgKGlbb10gPSBlW29dKTsgfSByZXR1cm4gaTsgfVxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzTG9vc2UociwgZSkgeyBpZiAobnVsbCA9PSByKSByZXR1cm4ge307IHZhciB0ID0ge307IGZvciAodmFyIG4gaW4gcikgaWYgKHt9Lmhhc093blByb3BlcnR5LmNhbGwociwgbikpIHsgaWYgKC0xICE9PSBlLmluZGV4T2YobikpIGNvbnRpbnVlOyB0W25dID0gcltuXTsgfSByZXR1cm4gdDsgfVxuLyoqXG4gKiBAZmlsZU92ZXJ2aWV3IENyb3NzXG4gKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IGlzTnVtYmVyIH0gZnJvbSAnLi4vdXRpbC9EYXRhVXRpbHMnO1xuaW1wb3J0IHsgc3ZnUHJvcGVydGllc0FuZEV2ZW50cyB9IGZyb20gJy4uL3V0aWwvc3ZnUHJvcGVydGllc0FuZEV2ZW50cyc7XG52YXIgZ2V0UGF0aCA9ICh4LCB5LCB3aWR0aCwgaGVpZ2h0LCB0b3AsIGxlZnQpID0+IHtcbiAgcmV0dXJuIFwiTVwiLmNvbmNhdCh4LCBcIixcIikuY29uY2F0KHRvcCwgXCJ2XCIpLmNvbmNhdChoZWlnaHQsIFwiTVwiKS5jb25jYXQobGVmdCwgXCIsXCIpLmNvbmNhdCh5LCBcImhcIikuY29uY2F0KHdpZHRoKTtcbn07XG5leHBvcnQgdmFyIENyb3NzID0gX3JlZiA9PiB7XG4gIHZhciB7XG4gICAgICB4ID0gMCxcbiAgICAgIHkgPSAwLFxuICAgICAgdG9wID0gMCxcbiAgICAgIGxlZnQgPSAwLFxuICAgICAgd2lkdGggPSAwLFxuICAgICAgaGVpZ2h0ID0gMCxcbiAgICAgIGNsYXNzTmFtZVxuICAgIH0gPSBfcmVmLFxuICAgIHJlc3QgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoX3JlZiwgX2V4Y2x1ZGVkKTtcbiAgdmFyIHByb3BzID0gX29iamVjdFNwcmVhZCh7XG4gICAgeCxcbiAgICB5LFxuICAgIHRvcCxcbiAgICBsZWZ0LFxuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9LCByZXN0KTtcbiAgaWYgKCFpc051bWJlcih4KSB8fCAhaXNOdW1iZXIoeSkgfHwgIWlzTnVtYmVyKHdpZHRoKSB8fCAhaXNOdW1iZXIoaGVpZ2h0KSB8fCAhaXNOdW1iZXIodG9wKSB8fCAhaXNOdW1iZXIobGVmdCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJwYXRoXCIsIF9leHRlbmRzKHt9LCBzdmdQcm9wZXJ0aWVzQW5kRXZlbnRzKHByb3BzKSwge1xuICAgIGNsYXNzTmFtZTogY2xzeCgncmVjaGFydHMtY3Jvc3MnLCBjbGFzc05hbWUpLFxuICAgIGQ6IGdldFBhdGgoeCwgeSwgd2lkdGgsIGhlaWdodCwgdG9wLCBsZWZ0KVxuICB9KSk7XG59OyIsImltcG9ydCB7IHVzZUxheW91dEVmZmVjdCwgdXNlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlQXBwRGlzcGF0Y2ggfSBmcm9tICcuL2hvb2tzJztcbmltcG9ydCB7IGFkZENhcnRlc2lhbkdyYXBoaWNhbEl0ZW0sIGFkZFBvbGFyR3JhcGhpY2FsSXRlbSwgcmVtb3ZlQ2FydGVzaWFuR3JhcGhpY2FsSXRlbSwgcmVtb3ZlUG9sYXJHcmFwaGljYWxJdGVtLCByZXBsYWNlQ2FydGVzaWFuR3JhcGhpY2FsSXRlbSB9IGZyb20gJy4vZ3JhcGhpY2FsSXRlbXNTbGljZSc7XG5leHBvcnQgZnVuY3Rpb24gU2V0Q2FydGVzaWFuR3JhcGhpY2FsSXRlbShwcm9wcykge1xuICB2YXIgZGlzcGF0Y2ggPSB1c2VBcHBEaXNwYXRjaCgpO1xuICB2YXIgcHJldlByb3BzUmVmID0gdXNlUmVmKG51bGwpO1xuICB1c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwcmV2UHJvcHNSZWYuY3VycmVudCA9PT0gbnVsbCkge1xuICAgICAgZGlzcGF0Y2goYWRkQ2FydGVzaWFuR3JhcGhpY2FsSXRlbShwcm9wcykpO1xuICAgIH0gZWxzZSBpZiAocHJldlByb3BzUmVmLmN1cnJlbnQgIT09IHByb3BzKSB7XG4gICAgICBkaXNwYXRjaChyZXBsYWNlQ2FydGVzaWFuR3JhcGhpY2FsSXRlbSh7XG4gICAgICAgIHByZXY6IHByZXZQcm9wc1JlZi5jdXJyZW50LFxuICAgICAgICBuZXh0OiBwcm9wc1xuICAgICAgfSkpO1xuICAgIH1cbiAgICBwcmV2UHJvcHNSZWYuY3VycmVudCA9IHByb3BzO1xuICB9LCBbZGlzcGF0Y2gsIHByb3BzXSk7XG4gIHVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChwcmV2UHJvcHNSZWYuY3VycmVudCkge1xuICAgICAgICBkaXNwYXRjaChyZW1vdmVDYXJ0ZXNpYW5HcmFwaGljYWxJdGVtKHByZXZQcm9wc1JlZi5jdXJyZW50KSk7XG4gICAgICAgIC8qXG4gICAgICAgICAqIEhlcmUgd2UgaGF2ZSB0byByZXNldCB0aGUgcmVmIHRvIG51bGwgYmVjYXVzZSBpbiBTdHJpY3RNb2RlLCB0aGUgZWZmZWN0IHdpbGwgcnVuIHR3aWNlLFxuICAgICAgICAgKiBidXQgaXQgd2lsbCBrZWVwIHRoZSBzYW1lIHJlZiB2YWx1ZSBmcm9tIHRoZSBmaXJzdCByZW5kZXIuXG4gICAgICAgICAqXG4gICAgICAgICAqIEluIGJyb3dzZXIsIFJlYWN0IHdpbGwgY2xlYXIgdGhlIHJlZiBhZnRlciB0aGUgZmlyc3QgZWZmZWN0IGNsZWFudXAsXG4gICAgICAgICAqIHNvIHRoYXQgd291bGRuJ3QgYmUgYW4gaXNzdWUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEluIFN0cmljdE1vZGUsIGhvd2V2ZXIsIHRoZSByZWYgaXMga2VwdCxcbiAgICAgICAgICogYW5kIGluIHRoZSBob29rIGFib3ZlIHRoZSBjb2RlIGNoZWNrcyBmb3IgYHByZXZQcm9wc1JlZi5jdXJyZW50ID09PSBudWxsYFxuICAgICAgICAgKiB3aGljaCB3b3VsZCBiZSBmYWxzZSBzbyBpdCB3b3VsZCBub3QgZGlzcGF0Y2ggdGhlIGBhZGRDYXJ0ZXNpYW5HcmFwaGljYWxJdGVtYCBhY3Rpb24gYWdhaW4uXG4gICAgICAgICAqXG4gICAgICAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9yZWNoYXJ0cy9yZWNoYXJ0cy9pc3N1ZXMvNjAyMlxuICAgICAgICAgKi9cbiAgICAgICAgcHJldlByb3BzUmVmLmN1cnJlbnQgPSBudWxsO1xuICAgICAgfVxuICAgIH07XG4gIH0sIFtkaXNwYXRjaF0pO1xuICByZXR1cm4gbnVsbDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBTZXRQb2xhckdyYXBoaWNhbEl0ZW0ocHJvcHMpIHtcbiAgdmFyIGRpc3BhdGNoID0gdXNlQXBwRGlzcGF0Y2goKTtcbiAgdXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBkaXNwYXRjaChhZGRQb2xhckdyYXBoaWNhbEl0ZW0ocHJvcHMpKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZGlzcGF0Y2gocmVtb3ZlUG9sYXJHcmFwaGljYWxJdGVtKHByb3BzKSk7XG4gICAgfTtcbiAgfSwgW2Rpc3BhdGNoLCBwcm9wc10pO1xuICByZXR1cm4gbnVsbDtcbn0iLCJmdW5jdGlvbiBfZXh0ZW5kcygpIHsgcmV0dXJuIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiA/IE9iamVjdC5hc3NpZ24uYmluZCgpIDogZnVuY3Rpb24gKG4pIHsgZm9yICh2YXIgZSA9IDE7IGUgPCBhcmd1bWVudHMubGVuZ3RoOyBlKyspIHsgdmFyIHQgPSBhcmd1bWVudHNbZV07IGZvciAodmFyIHIgaW4gdCkgKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIHIpICYmIChuW3JdID0gdFtyXSk7IH0gcmV0dXJuIG47IH0sIF9leHRlbmRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH1cbmZ1bmN0aW9uIG93bktleXMoZSwgcikgeyB2YXIgdCA9IE9iamVjdC5rZXlzKGUpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IHIgJiYgKG8gPSBvLmZpbHRlcihmdW5jdGlvbiAocikgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCByKS5lbnVtZXJhYmxlOyB9KSksIHQucHVzaC5hcHBseSh0LCBvKTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZChlKSB7IGZvciAodmFyIHIgPSAxOyByIDwgYXJndW1lbnRzLmxlbmd0aDsgcisrKSB7IHZhciB0ID0gbnVsbCAhPSBhcmd1bWVudHNbcl0gPyBhcmd1bWVudHNbcl0gOiB7fTsgciAlIDIgPyBvd25LZXlzKE9iamVjdCh0KSwgITApLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgX2RlZmluZVByb3BlcnR5KGUsIHIsIHRbcl0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModCkpIDogb3duS2V5cyhPYmplY3QodCkpLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCwgcikpOyB9KTsgfSByZXR1cm4gZTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGUsIHIsIHQpIHsgcmV0dXJuIChyID0gX3RvUHJvcGVydHlLZXkocikpIGluIGUgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgeyB2YWx1ZTogdCwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSA6IGVbcl0gPSB0LCBlOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleSh0KSB7IHZhciBpID0gX3RvUHJpbWl0aXZlKHQsIFwic3RyaW5nXCIpOyByZXR1cm4gXCJzeW1ib2xcIiA9PSB0eXBlb2YgaSA/IGkgOiBpICsgXCJcIjsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKHQsIHIpIHsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIHQgfHwgIXQpIHJldHVybiB0OyB2YXIgZSA9IHRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHZvaWQgMCAhPT0gZSkgeyB2YXIgaSA9IGUuY2FsbCh0LCByIHx8IFwiZGVmYXVsdFwiKTsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIGkpIHJldHVybiBpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChcInN0cmluZ1wiID09PSByID8gU3RyaW5nIDogTnVtYmVyKSh0KTsgfVxuLyoqXG4gKiBAZmlsZU92ZXJ2aWV3IEN1cnZlXG4gKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGxpbmUgYXMgc2hhcGVMaW5lLCBhcmVhIGFzIHNoYXBlQXJlYSwgY3VydmVCYXNpc0Nsb3NlZCwgY3VydmVCYXNpc09wZW4sIGN1cnZlQmFzaXMsIGN1cnZlQnVtcFgsIGN1cnZlQnVtcFksIGN1cnZlTGluZWFyQ2xvc2VkLCBjdXJ2ZUxpbmVhciwgY3VydmVNb25vdG9uZVgsIGN1cnZlTW9ub3RvbmVZLCBjdXJ2ZU5hdHVyYWwsIGN1cnZlU3RlcCwgY3VydmVTdGVwQWZ0ZXIsIGN1cnZlU3RlcEJlZm9yZSB9IGZyb20gJ3ZpY3RvcnktdmVuZG9yL2QzLXNoYXBlJztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IGFkYXB0RXZlbnRIYW5kbGVycyB9IGZyb20gJy4uL3V0aWwvdHlwZXMnO1xuaW1wb3J0IHsgaXNOdW1iZXIsIHVwcGVyRmlyc3QgfSBmcm9tICcuLi91dGlsL0RhdGFVdGlscyc7XG5pbXBvcnQgeyBpc1dlbGxCZWhhdmVkTnVtYmVyIH0gZnJvbSAnLi4vdXRpbC9pc1dlbGxCZWhhdmVkTnVtYmVyJztcbmltcG9ydCB7IHN2Z1Byb3BlcnRpZXNOb0V2ZW50cyB9IGZyb20gJy4uL3V0aWwvc3ZnUHJvcGVydGllc05vRXZlbnRzJztcbnZhciBDVVJWRV9GQUNUT1JJRVMgPSB7XG4gIGN1cnZlQmFzaXNDbG9zZWQsXG4gIGN1cnZlQmFzaXNPcGVuLFxuICBjdXJ2ZUJhc2lzLFxuICBjdXJ2ZUJ1bXBYLFxuICBjdXJ2ZUJ1bXBZLFxuICBjdXJ2ZUxpbmVhckNsb3NlZCxcbiAgY3VydmVMaW5lYXIsXG4gIGN1cnZlTW9ub3RvbmVYLFxuICBjdXJ2ZU1vbm90b25lWSxcbiAgY3VydmVOYXR1cmFsLFxuICBjdXJ2ZVN0ZXAsXG4gIGN1cnZlU3RlcEFmdGVyLFxuICBjdXJ2ZVN0ZXBCZWZvcmVcbn07XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgdXNlIHtAbGluayBDb29yZGluYXRlfSBpbnN0ZWFkXG4gKiBEdXBsaWNhdGVkIHdpdGggYENvb3JkaW5hdGVgIGluIGB1dGlsL3R5cGVzLnRzYFxuICovXG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgdXNlIHtAbGluayBOdWxsYWJsZUNvb3JkaW5hdGV9IGluc3RlYWRcbiAqIER1cGxpY2F0ZWQgd2l0aCBgTnVsbGFibGVDb29yZGluYXRlYCBpbiBgdXRpbC90eXBlcy50c2BcbiAqL1xuXG52YXIgZGVmaW5lZCA9IHAgPT4gaXNXZWxsQmVoYXZlZE51bWJlcihwLngpICYmIGlzV2VsbEJlaGF2ZWROdW1iZXIocC55KTtcbnZhciBnZXRYID0gcCA9PiBwLng7XG52YXIgZ2V0WSA9IHAgPT4gcC55O1xudmFyIGdldEN1cnZlRmFjdG9yeSA9ICh0eXBlLCBsYXlvdXQpID0+IHtcbiAgaWYgKHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH1cbiAgdmFyIG5hbWUgPSBcImN1cnZlXCIuY29uY2F0KHVwcGVyRmlyc3QodHlwZSkpO1xuICBpZiAoKG5hbWUgPT09ICdjdXJ2ZU1vbm90b25lJyB8fCBuYW1lID09PSAnY3VydmVCdW1wJykgJiYgbGF5b3V0KSB7XG4gICAgcmV0dXJuIENVUlZFX0ZBQ1RPUklFU1tcIlwiLmNvbmNhdChuYW1lKS5jb25jYXQobGF5b3V0ID09PSAndmVydGljYWwnID8gJ1knIDogJ1gnKV07XG4gIH1cbiAgcmV0dXJuIENVUlZFX0ZBQ1RPUklFU1tuYW1lXSB8fCBjdXJ2ZUxpbmVhcjtcbn07XG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgcGF0aCBvZiBjdXJ2ZS4gUmV0dXJucyBudWxsIGlmIHBvaW50cyBpcyBhbiBlbXB0eSBhcnJheS5cbiAqIEByZXR1cm4gcGF0aCBvciBudWxsXG4gKi9cbmV4cG9ydCB2YXIgZ2V0UGF0aCA9IF9yZWYgPT4ge1xuICB2YXIge1xuICAgIHR5cGUgPSAnbGluZWFyJyxcbiAgICBwb2ludHMgPSBbXSxcbiAgICBiYXNlTGluZSxcbiAgICBsYXlvdXQsXG4gICAgY29ubmVjdE51bGxzID0gZmFsc2VcbiAgfSA9IF9yZWY7XG4gIHZhciBjdXJ2ZUZhY3RvcnkgPSBnZXRDdXJ2ZUZhY3RvcnkodHlwZSwgbGF5b3V0KTtcbiAgdmFyIGZvcm1hdFBvaW50cyA9IGNvbm5lY3ROdWxscyA/IHBvaW50cy5maWx0ZXIoZGVmaW5lZCkgOiBwb2ludHM7XG4gIHZhciBsaW5lRnVuY3Rpb247XG4gIGlmIChBcnJheS5pc0FycmF5KGJhc2VMaW5lKSkge1xuICAgIHZhciBmb3JtYXRCYXNlTGluZSA9IGNvbm5lY3ROdWxscyA/IGJhc2VMaW5lLmZpbHRlcihiYXNlID0+IGRlZmluZWQoYmFzZSkpIDogYmFzZUxpbmU7XG4gICAgdmFyIGFyZWFQb2ludHMgPSBmb3JtYXRQb2ludHMubWFwKChlbnRyeSwgaW5kZXgpID0+IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgZW50cnkpLCB7fSwge1xuICAgICAgYmFzZTogZm9ybWF0QmFzZUxpbmVbaW5kZXhdXG4gICAgfSkpO1xuICAgIGlmIChsYXlvdXQgPT09ICd2ZXJ0aWNhbCcpIHtcbiAgICAgIGxpbmVGdW5jdGlvbiA9IHNoYXBlQXJlYSgpLnkoZ2V0WSkueDEoZ2V0WCkueDAoZCA9PiBkLmJhc2UueCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpbmVGdW5jdGlvbiA9IHNoYXBlQXJlYSgpLngoZ2V0WCkueTEoZ2V0WSkueTAoZCA9PiBkLmJhc2UueSk7XG4gICAgfVxuICAgIGxpbmVGdW5jdGlvbi5kZWZpbmVkKGRlZmluZWQpLmN1cnZlKGN1cnZlRmFjdG9yeSk7XG4gICAgcmV0dXJuIGxpbmVGdW5jdGlvbihhcmVhUG9pbnRzKTtcbiAgfVxuICBpZiAobGF5b3V0ID09PSAndmVydGljYWwnICYmIGlzTnVtYmVyKGJhc2VMaW5lKSkge1xuICAgIGxpbmVGdW5jdGlvbiA9IHNoYXBlQXJlYSgpLnkoZ2V0WSkueDEoZ2V0WCkueDAoYmFzZUxpbmUpO1xuICB9IGVsc2UgaWYgKGlzTnVtYmVyKGJhc2VMaW5lKSkge1xuICAgIGxpbmVGdW5jdGlvbiA9IHNoYXBlQXJlYSgpLngoZ2V0WCkueTEoZ2V0WSkueTAoYmFzZUxpbmUpO1xuICB9IGVsc2Uge1xuICAgIGxpbmVGdW5jdGlvbiA9IHNoYXBlTGluZSgpLngoZ2V0WCkueShnZXRZKTtcbiAgfVxuICBsaW5lRnVuY3Rpb24uZGVmaW5lZChkZWZpbmVkKS5jdXJ2ZShjdXJ2ZUZhY3RvcnkpO1xuICByZXR1cm4gbGluZUZ1bmN0aW9uKGZvcm1hdFBvaW50cyk7XG59O1xuZXhwb3J0IHZhciBDdXJ2ZSA9IHByb3BzID0+IHtcbiAgdmFyIHtcbiAgICBjbGFzc05hbWUsXG4gICAgcG9pbnRzLFxuICAgIHBhdGgsXG4gICAgcGF0aFJlZlxuICB9ID0gcHJvcHM7XG4gIGlmICgoIXBvaW50cyB8fCAhcG9pbnRzLmxlbmd0aCkgJiYgIXBhdGgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgcmVhbFBhdGggPSBwb2ludHMgJiYgcG9pbnRzLmxlbmd0aCA/IGdldFBhdGgocHJvcHMpIDogcGF0aDtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwicGF0aFwiLCBfZXh0ZW5kcyh7fSwgc3ZnUHJvcGVydGllc05vRXZlbnRzKHByb3BzKSwgYWRhcHRFdmVudEhhbmRsZXJzKHByb3BzKSwge1xuICAgIGNsYXNzTmFtZTogY2xzeCgncmVjaGFydHMtY3VydmUnLCBjbGFzc05hbWUpLFxuICAgIGQ6IHJlYWxQYXRoID09PSBudWxsID8gdW5kZWZpbmVkIDogcmVhbFBhdGgsXG4gICAgcmVmOiBwYXRoUmVmXG4gIH0pKTtcbn07IiwiaW1wb3J0IHsgY3JlYXRlU2xpY2UgfSBmcm9tICdAcmVkdXhqcy90b29sa2l0JztcblxuLyoqXG4gKiBUaGlzIGlzIHRoZSBkYXRhIHRoYXQncyBjb21pbmcgdGhyb3VnaCBtYWluIGNoYXJ0IGBkYXRhYCBwcm9wXG4gKiBSZWNoYXJ0cyBpcyB2ZXJ5IGZsZXhpYmxlIGluIHdoYXQgaXQgYWNjZXB0cyBzbyB0aGUgdHlwZSBpcyB2ZXJ5IGZsZXhpYmxlIHRvby5cbiAqIFRoaXMgd2lsbCB0eXBpY2FsbHkgYmUgYW4gb2JqZWN0LCBhbmQgdmFyaW91cyBjb21wb25lbnRzIHdpbGwgcHJvdmlkZSB2YXJpb3VzIGBkYXRhS2V5YFxuICogdGhhdCBkaWN0YXRlcyBob3cgdG8gcHVsbCBkYXRhIGZyb20gdGhhdCBvYmplY3QuXG4gKlxuICogVEw7RFI6IGJlZm9yZSBkYXRhS2V5XG4gKi9cblxuLyoqXG4gKiBTbyB0aGlzIGlzIHRoZSBzYW1lIHVua25vd24gdHlwZSBhcyBDaGFydERhdGEgYnV0IHRoaXMgaXMgYWZ0ZXIgdGhlIGRhdGFLZXkgaGFzIGJlZW4gYXBwbGllZC5cbiAqIFdlIHN0aWxsIGRvbid0IGtub3cgd2hhdCB0aGUgdHlwZSBpcyAtIHRoYXQgZGVwZW5kcyBvbiB3aGF0IGV4YWN0bHkgaXQgd2FzIGJlZm9yZSB0aGUgZGF0YUtleSBhcHBsaWNhdGlvbixcbiAqIGFuZCB0aGUgZGF0YUtleSBjYW4gcmV0dXJuIHdoYXRldmVyIGFueXdheSAtIGJ1dCBsZXQncyBrZWVwIGl0IHNlcGFyYXRlIGFzIGEgZm9ybSBvZiBkb2N1bWVudGF0aW9uLlxuICpcbiAqIFRMO0RSOiBDaGFydERhdGEgYWZ0ZXIgZGF0YUtleS5cbiAqL1xuXG5leHBvcnQgdmFyIGluaXRpYWxDaGFydERhdGFTdGF0ZSA9IHtcbiAgY2hhcnREYXRhOiB1bmRlZmluZWQsXG4gIGNvbXB1dGVkRGF0YTogdW5kZWZpbmVkLFxuICBkYXRhU3RhcnRJbmRleDogMCxcbiAgZGF0YUVuZEluZGV4OiAwXG59O1xudmFyIGNoYXJ0RGF0YVNsaWNlID0gY3JlYXRlU2xpY2Uoe1xuICBuYW1lOiAnY2hhcnREYXRhJyxcbiAgaW5pdGlhbFN0YXRlOiBpbml0aWFsQ2hhcnREYXRhU3RhdGUsXG4gIHJlZHVjZXJzOiB7XG4gICAgc2V0Q2hhcnREYXRhKHN0YXRlLCBhY3Rpb24pIHtcbiAgICAgIHN0YXRlLmNoYXJ0RGF0YSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgICAgaWYgKGFjdGlvbi5wYXlsb2FkID09IG51bGwpIHtcbiAgICAgICAgc3RhdGUuZGF0YVN0YXJ0SW5kZXggPSAwO1xuICAgICAgICBzdGF0ZS5kYXRhRW5kSW5kZXggPSAwO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoYWN0aW9uLnBheWxvYWQubGVuZ3RoID4gMCAmJiBzdGF0ZS5kYXRhRW5kSW5kZXggIT09IGFjdGlvbi5wYXlsb2FkLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgc3RhdGUuZGF0YUVuZEluZGV4ID0gYWN0aW9uLnBheWxvYWQubGVuZ3RoIC0gMTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNldENvbXB1dGVkRGF0YShzdGF0ZSwgYWN0aW9uKSB7XG4gICAgICBzdGF0ZS5jb21wdXRlZERhdGEgPSBhY3Rpb24ucGF5bG9hZDtcbiAgICB9LFxuICAgIHNldERhdGFTdGFydEVuZEluZGV4ZXMoc3RhdGUsIGFjdGlvbikge1xuICAgICAgdmFyIHtcbiAgICAgICAgc3RhcnRJbmRleCxcbiAgICAgICAgZW5kSW5kZXhcbiAgICAgIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIGlmIChzdGFydEluZGV4ICE9IG51bGwpIHtcbiAgICAgICAgc3RhdGUuZGF0YVN0YXJ0SW5kZXggPSBzdGFydEluZGV4O1xuICAgICAgfVxuICAgICAgaWYgKGVuZEluZGV4ICE9IG51bGwpIHtcbiAgICAgICAgc3RhdGUuZGF0YUVuZEluZGV4ID0gZW5kSW5kZXg7XG4gICAgICB9XG4gICAgfVxuICB9XG59KTtcbmV4cG9ydCB2YXIge1xuICBzZXRDaGFydERhdGEsXG4gIHNldERhdGFTdGFydEVuZEluZGV4ZXMsXG4gIHNldENvbXB1dGVkRGF0YVxufSA9IGNoYXJ0RGF0YVNsaWNlLmFjdGlvbnM7XG5leHBvcnQgdmFyIGNoYXJ0RGF0YVJlZHVjZXIgPSBjaGFydERhdGFTbGljZS5yZWR1Y2VyOyIsImltcG9ydCB7IHVzZVN5bmNFeHRlcm5hbFN0b3JlV2l0aFNlbGVjdG9yIH0gZnJvbSAndXNlLXN5bmMtZXh0ZXJuYWwtc3RvcmUvc2hpbS93aXRoLXNlbGVjdG9yJztcbmltcG9ydCB7IHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBSZWNoYXJ0c1JlZHV4Q29udGV4dCB9IGZyb20gJy4vUmVjaGFydHNSZWR1eENvbnRleHQnO1xudmFyIG5vb3BEaXNwYXRjaCA9IGEgPT4gYTtcbmV4cG9ydCB2YXIgdXNlQXBwRGlzcGF0Y2ggPSAoKSA9PiB7XG4gIHZhciBjb250ZXh0ID0gdXNlQ29udGV4dChSZWNoYXJ0c1JlZHV4Q29udGV4dCk7XG4gIGlmIChjb250ZXh0KSB7XG4gICAgcmV0dXJuIGNvbnRleHQuc3RvcmUuZGlzcGF0Y2g7XG4gIH1cbiAgcmV0dXJuIG5vb3BEaXNwYXRjaDtcbn07XG52YXIgbm9vcCA9ICgpID0+IHt9O1xudmFyIGFkZE5lc3RlZFN1Yk5vb3AgPSAoKSA9PiBub29wO1xudmFyIHJlZkVxdWFsaXR5ID0gKGEsIGIpID0+IGEgPT09IGI7XG5cbi8qKlxuICogVGhpcyBpcyBhIHJlY2hhcnRzIHZhcmlhbnQgb2YgYHVzZVNlbGVjdG9yYCBmcm9tICdyZWFjdC1yZWR1eCcgcGFja2FnZS5cbiAqXG4gKiBUaGUgZGlmZmVyZW5jZSBpcyB0aGF0IHJlYWN0LXJlZHV4IHZlcnNpb24gd2lsbCB0aHJvdyBhbiBFcnJvciB3aGVuIHVzZWQgb3V0c2lkZSBvZiBSZWR1eCBjb250ZXh0LlxuICpcbiAqIFRoaXMsIHJlY2hhcnRzIHZlcnNpb24sIHdpbGwgcmV0dXJuIHVuZGVmaW5lZCBpbnN0ZWFkLlxuICpcbiAqIFRoaXMgaXMgYmVjYXVzZSB3ZSB3YW50IHRvIGFsbG93IHVzaW5nIG91ciBjb21wb25lbnRzIG91dHNpZGUgdGhlIENoYXJ0IHdyYXBwZXIsXG4gKiBhbmQgaGF2ZSBwZW9wbGUgcHJvdmlkZSBhbGwgcHJvcHMgZXhwbGljaXRseS5cbiAqXG4gKiBJZiBob3dldmVyIHRoZXkgdXNlIHRoZSBjb21wb25lbnQgaW5zaWRlIGEgY2hhcnQgd3JhcHBlciB0aGVuIHRob3NlIHByb3BzIGJlY29tZSBvcHRpb25hbCxcbiAqIGFuZCB3ZSByZWFkIHRoZW0gZnJvbSBSZWR1eCBzdGF0ZSBpbnN0ZWFkLlxuICpcbiAqIEBwYXJhbSBzZWxlY3RvciBmb3IgcHVsbGluZyB0aGluZ3Mgb3V0IG9mIFJlZHV4IHN0b3JlOyB3aWxsIG5vdCBiZSBjYWxsZWQgaWYgdGhlIHN0b3JlIGlzIG5vdCBhY2Nlc3NpYmxlXG4gKiBAcmV0dXJuIHdoYXRldmVyIHRoZSBzZWxlY3RvciByZXR1cm5lZDsgb3IgdW5kZWZpbmVkIHdoZW4gb3V0c2lkZSBvZiBSZWR1eCBzdG9yZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlQXBwU2VsZWN0b3Ioc2VsZWN0b3IpIHtcbiAgdmFyIGNvbnRleHQgPSB1c2VDb250ZXh0KFJlY2hhcnRzUmVkdXhDb250ZXh0KTtcbiAgcmV0dXJuIHVzZVN5bmNFeHRlcm5hbFN0b3JlV2l0aFNlbGVjdG9yKGNvbnRleHQgPyBjb250ZXh0LnN1YnNjcmlwdGlvbi5hZGROZXN0ZWRTdWIgOiBhZGROZXN0ZWRTdWJOb29wLCBjb250ZXh0ID8gY29udGV4dC5zdG9yZS5nZXRTdGF0ZSA6IG5vb3AsIGNvbnRleHQgPyBjb250ZXh0LnN0b3JlLmdldFN0YXRlIDogbm9vcCwgY29udGV4dCA/IHNlbGVjdG9yIDogbm9vcCwgcmVmRXF1YWxpdHkpO1xufSIsImZ1bmN0aW9uIF9leHRlbmRzKCkgeyByZXR1cm4gX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAobikgeyBmb3IgKHZhciBlID0gMTsgZSA8IGFyZ3VtZW50cy5sZW5ndGg7IGUrKykgeyB2YXIgdCA9IGFyZ3VtZW50c1tlXTsgZm9yICh2YXIgciBpbiB0KSAoe30pLmhhc093blByb3BlcnR5LmNhbGwodCwgcikgJiYgKG5bcl0gPSB0W3JdKTsgfSByZXR1cm4gbjsgfSwgX2V4dGVuZHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgcG9sYXJUb0NhcnRlc2lhbiwgUkFESUFOIH0gZnJvbSAnLi4vdXRpbC9Qb2xhclV0aWxzJztcbmltcG9ydCB7IGdldFBlcmNlbnRWYWx1ZSwgbWF0aFNpZ24gfSBmcm9tICcuLi91dGlsL0RhdGFVdGlscyc7XG5pbXBvcnQgeyByZXNvbHZlRGVmYXVsdFByb3BzIH0gZnJvbSAnLi4vdXRpbC9yZXNvbHZlRGVmYXVsdFByb3BzJztcbmltcG9ydCB7IHN2Z1Byb3BlcnRpZXNBbmRFdmVudHMgfSBmcm9tICcuLi91dGlsL3N2Z1Byb3BlcnRpZXNBbmRFdmVudHMnO1xudmFyIGdldERlbHRhQW5nbGUgPSAoc3RhcnRBbmdsZSwgZW5kQW5nbGUpID0+IHtcbiAgdmFyIHNpZ24gPSBtYXRoU2lnbihlbmRBbmdsZSAtIHN0YXJ0QW5nbGUpO1xuICB2YXIgZGVsdGFBbmdsZSA9IE1hdGgubWluKE1hdGguYWJzKGVuZEFuZ2xlIC0gc3RhcnRBbmdsZSksIDM1OS45OTkpO1xuICByZXR1cm4gc2lnbiAqIGRlbHRhQW5nbGU7XG59O1xudmFyIGdldFRhbmdlbnRDaXJjbGUgPSBfcmVmID0+IHtcbiAgdmFyIHtcbiAgICBjeCxcbiAgICBjeSxcbiAgICByYWRpdXMsXG4gICAgYW5nbGUsXG4gICAgc2lnbixcbiAgICBpc0V4dGVybmFsLFxuICAgIGNvcm5lclJhZGl1cyxcbiAgICBjb3JuZXJJc0V4dGVybmFsXG4gIH0gPSBfcmVmO1xuICB2YXIgY2VudGVyUmFkaXVzID0gY29ybmVyUmFkaXVzICogKGlzRXh0ZXJuYWwgPyAxIDogLTEpICsgcmFkaXVzO1xuICB2YXIgdGhldGEgPSBNYXRoLmFzaW4oY29ybmVyUmFkaXVzIC8gY2VudGVyUmFkaXVzKSAvIFJBRElBTjtcbiAgdmFyIGNlbnRlckFuZ2xlID0gY29ybmVySXNFeHRlcm5hbCA/IGFuZ2xlIDogYW5nbGUgKyBzaWduICogdGhldGE7XG4gIHZhciBjZW50ZXIgPSBwb2xhclRvQ2FydGVzaWFuKGN4LCBjeSwgY2VudGVyUmFkaXVzLCBjZW50ZXJBbmdsZSk7XG4gIC8vIFRoZSBjb29yZGluYXRlIG9mIHBvaW50IHdoaWNoIGlzIHRhbmdlbnQgdG8gdGhlIGNpcmNsZVxuICB2YXIgY2lyY2xlVGFuZ2VuY3kgPSBwb2xhclRvQ2FydGVzaWFuKGN4LCBjeSwgcmFkaXVzLCBjZW50ZXJBbmdsZSk7XG4gIC8vIFRoZSBjb29yZGluYXRlIG9mIHBvaW50IHdoaWNoIGlzIHRhbmdlbnQgdG8gdGhlIHJhZGl1cyBsaW5lXG4gIHZhciBsaW5lVGFuZ2VuY3lBbmdsZSA9IGNvcm5lcklzRXh0ZXJuYWwgPyBhbmdsZSAtIHNpZ24gKiB0aGV0YSA6IGFuZ2xlO1xuICB2YXIgbGluZVRhbmdlbmN5ID0gcG9sYXJUb0NhcnRlc2lhbihjeCwgY3ksIGNlbnRlclJhZGl1cyAqIE1hdGguY29zKHRoZXRhICogUkFESUFOKSwgbGluZVRhbmdlbmN5QW5nbGUpO1xuICByZXR1cm4ge1xuICAgIGNlbnRlcixcbiAgICBjaXJjbGVUYW5nZW5jeSxcbiAgICBsaW5lVGFuZ2VuY3ksXG4gICAgdGhldGFcbiAgfTtcbn07XG52YXIgZ2V0U2VjdG9yUGF0aCA9IF9yZWYyID0+IHtcbiAgdmFyIHtcbiAgICBjeCxcbiAgICBjeSxcbiAgICBpbm5lclJhZGl1cyxcbiAgICBvdXRlclJhZGl1cyxcbiAgICBzdGFydEFuZ2xlLFxuICAgIGVuZEFuZ2xlXG4gIH0gPSBfcmVmMjtcbiAgdmFyIGFuZ2xlID0gZ2V0RGVsdGFBbmdsZShzdGFydEFuZ2xlLCBlbmRBbmdsZSk7XG5cbiAgLy8gV2hlbiB0aGUgYW5nbGUgb2Ygc2VjdG9yIGVxdWFscyB0byAzNjAsIHN0YXIgcG9pbnQgYW5kIGVuZCBwb2ludCBjb2luY2lkZVxuICB2YXIgdGVtcEVuZEFuZ2xlID0gc3RhcnRBbmdsZSArIGFuZ2xlO1xuICB2YXIgb3V0ZXJTdGFydFBvaW50ID0gcG9sYXJUb0NhcnRlc2lhbihjeCwgY3ksIG91dGVyUmFkaXVzLCBzdGFydEFuZ2xlKTtcbiAgdmFyIG91dGVyRW5kUG9pbnQgPSBwb2xhclRvQ2FydGVzaWFuKGN4LCBjeSwgb3V0ZXJSYWRpdXMsIHRlbXBFbmRBbmdsZSk7XG4gIHZhciBwYXRoID0gXCJNIFwiLmNvbmNhdChvdXRlclN0YXJ0UG9pbnQueCwgXCIsXCIpLmNvbmNhdChvdXRlclN0YXJ0UG9pbnQueSwgXCJcXG4gICAgQSBcIikuY29uY2F0KG91dGVyUmFkaXVzLCBcIixcIikuY29uY2F0KG91dGVyUmFkaXVzLCBcIiwwLFxcbiAgICBcIikuY29uY2F0KCsoTWF0aC5hYnMoYW5nbGUpID4gMTgwKSwgXCIsXCIpLmNvbmNhdCgrKHN0YXJ0QW5nbGUgPiB0ZW1wRW5kQW5nbGUpLCBcIixcXG4gICAgXCIpLmNvbmNhdChvdXRlckVuZFBvaW50LngsIFwiLFwiKS5jb25jYXQob3V0ZXJFbmRQb2ludC55LCBcIlxcbiAgXCIpO1xuICBpZiAoaW5uZXJSYWRpdXMgPiAwKSB7XG4gICAgdmFyIGlubmVyU3RhcnRQb2ludCA9IHBvbGFyVG9DYXJ0ZXNpYW4oY3gsIGN5LCBpbm5lclJhZGl1cywgc3RhcnRBbmdsZSk7XG4gICAgdmFyIGlubmVyRW5kUG9pbnQgPSBwb2xhclRvQ2FydGVzaWFuKGN4LCBjeSwgaW5uZXJSYWRpdXMsIHRlbXBFbmRBbmdsZSk7XG4gICAgcGF0aCArPSBcIkwgXCIuY29uY2F0KGlubmVyRW5kUG9pbnQueCwgXCIsXCIpLmNvbmNhdChpbm5lckVuZFBvaW50LnksIFwiXFxuICAgICAgICAgICAgQSBcIikuY29uY2F0KGlubmVyUmFkaXVzLCBcIixcIikuY29uY2F0KGlubmVyUmFkaXVzLCBcIiwwLFxcbiAgICAgICAgICAgIFwiKS5jb25jYXQoKyhNYXRoLmFicyhhbmdsZSkgPiAxODApLCBcIixcIikuY29uY2F0KCsoc3RhcnRBbmdsZSA8PSB0ZW1wRW5kQW5nbGUpLCBcIixcXG4gICAgICAgICAgICBcIikuY29uY2F0KGlubmVyU3RhcnRQb2ludC54LCBcIixcIikuY29uY2F0KGlubmVyU3RhcnRQb2ludC55LCBcIiBaXCIpO1xuICB9IGVsc2Uge1xuICAgIHBhdGggKz0gXCJMIFwiLmNvbmNhdChjeCwgXCIsXCIpLmNvbmNhdChjeSwgXCIgWlwiKTtcbiAgfVxuICByZXR1cm4gcGF0aDtcbn07XG52YXIgZ2V0U2VjdG9yV2l0aENvcm5lciA9IF9yZWYzID0+IHtcbiAgdmFyIHtcbiAgICBjeCxcbiAgICBjeSxcbiAgICBpbm5lclJhZGl1cyxcbiAgICBvdXRlclJhZGl1cyxcbiAgICBjb3JuZXJSYWRpdXMsXG4gICAgZm9yY2VDb3JuZXJSYWRpdXMsXG4gICAgY29ybmVySXNFeHRlcm5hbCxcbiAgICBzdGFydEFuZ2xlLFxuICAgIGVuZEFuZ2xlXG4gIH0gPSBfcmVmMztcbiAgdmFyIHNpZ24gPSBtYXRoU2lnbihlbmRBbmdsZSAtIHN0YXJ0QW5nbGUpO1xuICB2YXIge1xuICAgIGNpcmNsZVRhbmdlbmN5OiBzb2N0LFxuICAgIGxpbmVUYW5nZW5jeTogc29sdCxcbiAgICB0aGV0YTogc290XG4gIH0gPSBnZXRUYW5nZW50Q2lyY2xlKHtcbiAgICBjeCxcbiAgICBjeSxcbiAgICByYWRpdXM6IG91dGVyUmFkaXVzLFxuICAgIGFuZ2xlOiBzdGFydEFuZ2xlLFxuICAgIHNpZ24sXG4gICAgY29ybmVyUmFkaXVzLFxuICAgIGNvcm5lcklzRXh0ZXJuYWxcbiAgfSk7XG4gIHZhciB7XG4gICAgY2lyY2xlVGFuZ2VuY3k6IGVvY3QsXG4gICAgbGluZVRhbmdlbmN5OiBlb2x0LFxuICAgIHRoZXRhOiBlb3RcbiAgfSA9IGdldFRhbmdlbnRDaXJjbGUoe1xuICAgIGN4LFxuICAgIGN5LFxuICAgIHJhZGl1czogb3V0ZXJSYWRpdXMsXG4gICAgYW5nbGU6IGVuZEFuZ2xlLFxuICAgIHNpZ246IC1zaWduLFxuICAgIGNvcm5lclJhZGl1cyxcbiAgICBjb3JuZXJJc0V4dGVybmFsXG4gIH0pO1xuICB2YXIgb3V0ZXJBcmNBbmdsZSA9IGNvcm5lcklzRXh0ZXJuYWwgPyBNYXRoLmFicyhzdGFydEFuZ2xlIC0gZW5kQW5nbGUpIDogTWF0aC5hYnMoc3RhcnRBbmdsZSAtIGVuZEFuZ2xlKSAtIHNvdCAtIGVvdDtcbiAgaWYgKG91dGVyQXJjQW5nbGUgPCAwKSB7XG4gICAgaWYgKGZvcmNlQ29ybmVyUmFkaXVzKSB7XG4gICAgICByZXR1cm4gXCJNIFwiLmNvbmNhdChzb2x0LngsIFwiLFwiKS5jb25jYXQoc29sdC55LCBcIlxcbiAgICAgICAgYVwiKS5jb25jYXQoY29ybmVyUmFkaXVzLCBcIixcIikuY29uY2F0KGNvcm5lclJhZGl1cywgXCIsMCwwLDEsXCIpLmNvbmNhdChjb3JuZXJSYWRpdXMgKiAyLCBcIiwwXFxuICAgICAgICBhXCIpLmNvbmNhdChjb3JuZXJSYWRpdXMsIFwiLFwiKS5jb25jYXQoY29ybmVyUmFkaXVzLCBcIiwwLDAsMSxcIikuY29uY2F0KC1jb3JuZXJSYWRpdXMgKiAyLCBcIiwwXFxuICAgICAgXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZ2V0U2VjdG9yUGF0aCh7XG4gICAgICBjeCxcbiAgICAgIGN5LFxuICAgICAgaW5uZXJSYWRpdXMsXG4gICAgICBvdXRlclJhZGl1cyxcbiAgICAgIHN0YXJ0QW5nbGUsXG4gICAgICBlbmRBbmdsZVxuICAgIH0pO1xuICB9XG4gIHZhciBwYXRoID0gXCJNIFwiLmNvbmNhdChzb2x0LngsIFwiLFwiKS5jb25jYXQoc29sdC55LCBcIlxcbiAgICBBXCIpLmNvbmNhdChjb3JuZXJSYWRpdXMsIFwiLFwiKS5jb25jYXQoY29ybmVyUmFkaXVzLCBcIiwwLDAsXCIpLmNvbmNhdCgrKHNpZ24gPCAwKSwgXCIsXCIpLmNvbmNhdChzb2N0LngsIFwiLFwiKS5jb25jYXQoc29jdC55LCBcIlxcbiAgICBBXCIpLmNvbmNhdChvdXRlclJhZGl1cywgXCIsXCIpLmNvbmNhdChvdXRlclJhZGl1cywgXCIsMCxcIikuY29uY2F0KCsob3V0ZXJBcmNBbmdsZSA+IDE4MCksIFwiLFwiKS5jb25jYXQoKyhzaWduIDwgMCksIFwiLFwiKS5jb25jYXQoZW9jdC54LCBcIixcIikuY29uY2F0KGVvY3QueSwgXCJcXG4gICAgQVwiKS5jb25jYXQoY29ybmVyUmFkaXVzLCBcIixcIikuY29uY2F0KGNvcm5lclJhZGl1cywgXCIsMCwwLFwiKS5jb25jYXQoKyhzaWduIDwgMCksIFwiLFwiKS5jb25jYXQoZW9sdC54LCBcIixcIikuY29uY2F0KGVvbHQueSwgXCJcXG4gIFwiKTtcbiAgaWYgKGlubmVyUmFkaXVzID4gMCkge1xuICAgIHZhciB7XG4gICAgICBjaXJjbGVUYW5nZW5jeTogc2ljdCxcbiAgICAgIGxpbmVUYW5nZW5jeTogc2lsdCxcbiAgICAgIHRoZXRhOiBzaXRcbiAgICB9ID0gZ2V0VGFuZ2VudENpcmNsZSh7XG4gICAgICBjeCxcbiAgICAgIGN5LFxuICAgICAgcmFkaXVzOiBpbm5lclJhZGl1cyxcbiAgICAgIGFuZ2xlOiBzdGFydEFuZ2xlLFxuICAgICAgc2lnbixcbiAgICAgIGlzRXh0ZXJuYWw6IHRydWUsXG4gICAgICBjb3JuZXJSYWRpdXMsXG4gICAgICBjb3JuZXJJc0V4dGVybmFsXG4gICAgfSk7XG4gICAgdmFyIHtcbiAgICAgIGNpcmNsZVRhbmdlbmN5OiBlaWN0LFxuICAgICAgbGluZVRhbmdlbmN5OiBlaWx0LFxuICAgICAgdGhldGE6IGVpdFxuICAgIH0gPSBnZXRUYW5nZW50Q2lyY2xlKHtcbiAgICAgIGN4LFxuICAgICAgY3ksXG4gICAgICByYWRpdXM6IGlubmVyUmFkaXVzLFxuICAgICAgYW5nbGU6IGVuZEFuZ2xlLFxuICAgICAgc2lnbjogLXNpZ24sXG4gICAgICBpc0V4dGVybmFsOiB0cnVlLFxuICAgICAgY29ybmVyUmFkaXVzLFxuICAgICAgY29ybmVySXNFeHRlcm5hbFxuICAgIH0pO1xuICAgIHZhciBpbm5lckFyY0FuZ2xlID0gY29ybmVySXNFeHRlcm5hbCA/IE1hdGguYWJzKHN0YXJ0QW5nbGUgLSBlbmRBbmdsZSkgOiBNYXRoLmFicyhzdGFydEFuZ2xlIC0gZW5kQW5nbGUpIC0gc2l0IC0gZWl0O1xuICAgIGlmIChpbm5lckFyY0FuZ2xlIDwgMCAmJiBjb3JuZXJSYWRpdXMgPT09IDApIHtcbiAgICAgIHJldHVybiBcIlwiLmNvbmNhdChwYXRoLCBcIkxcIikuY29uY2F0KGN4LCBcIixcIikuY29uY2F0KGN5LCBcIlpcIik7XG4gICAgfVxuICAgIHBhdGggKz0gXCJMXCIuY29uY2F0KGVpbHQueCwgXCIsXCIpLmNvbmNhdChlaWx0LnksIFwiXFxuICAgICAgQVwiKS5jb25jYXQoY29ybmVyUmFkaXVzLCBcIixcIikuY29uY2F0KGNvcm5lclJhZGl1cywgXCIsMCwwLFwiKS5jb25jYXQoKyhzaWduIDwgMCksIFwiLFwiKS5jb25jYXQoZWljdC54LCBcIixcIikuY29uY2F0KGVpY3QueSwgXCJcXG4gICAgICBBXCIpLmNvbmNhdChpbm5lclJhZGl1cywgXCIsXCIpLmNvbmNhdChpbm5lclJhZGl1cywgXCIsMCxcIikuY29uY2F0KCsoaW5uZXJBcmNBbmdsZSA+IDE4MCksIFwiLFwiKS5jb25jYXQoKyhzaWduID4gMCksIFwiLFwiKS5jb25jYXQoc2ljdC54LCBcIixcIikuY29uY2F0KHNpY3QueSwgXCJcXG4gICAgICBBXCIpLmNvbmNhdChjb3JuZXJSYWRpdXMsIFwiLFwiKS5jb25jYXQoY29ybmVyUmFkaXVzLCBcIiwwLDAsXCIpLmNvbmNhdCgrKHNpZ24gPCAwKSwgXCIsXCIpLmNvbmNhdChzaWx0LngsIFwiLFwiKS5jb25jYXQoc2lsdC55LCBcIlpcIik7XG4gIH0gZWxzZSB7XG4gICAgcGF0aCArPSBcIkxcIi5jb25jYXQoY3gsIFwiLFwiKS5jb25jYXQoY3ksIFwiWlwiKTtcbiAgfVxuICByZXR1cm4gcGF0aDtcbn07XG5cbi8qKlxuICogU1ZHIGN4LCBjeSBhcmUgYHN0cmluZyB8IG51bWJlciB8IHVuZGVmaW5lZGAsIGJ1dCBpbnRlcm5hbGx5IHdlIHVzZSBgbnVtYmVyYCBzbyBsZXQnc1xuICogb3ZlcnJpZGUgdGhlIHR5cGVzIGhlcmUuXG4gKi9cblxudmFyIGRlZmF1bHRQcm9wcyA9IHtcbiAgY3g6IDAsXG4gIGN5OiAwLFxuICBpbm5lclJhZGl1czogMCxcbiAgb3V0ZXJSYWRpdXM6IDAsXG4gIHN0YXJ0QW5nbGU6IDAsXG4gIGVuZEFuZ2xlOiAwLFxuICBjb3JuZXJSYWRpdXM6IDAsXG4gIGZvcmNlQ29ybmVyUmFkaXVzOiBmYWxzZSxcbiAgY29ybmVySXNFeHRlcm5hbDogZmFsc2Vcbn07XG5leHBvcnQgdmFyIFNlY3RvciA9IHNlY3RvclByb3BzID0+IHtcbiAgdmFyIHByb3BzID0gcmVzb2x2ZURlZmF1bHRQcm9wcyhzZWN0b3JQcm9wcywgZGVmYXVsdFByb3BzKTtcbiAgdmFyIHtcbiAgICBjeCxcbiAgICBjeSxcbiAgICBpbm5lclJhZGl1cyxcbiAgICBvdXRlclJhZGl1cyxcbiAgICBjb3JuZXJSYWRpdXMsXG4gICAgZm9yY2VDb3JuZXJSYWRpdXMsXG4gICAgY29ybmVySXNFeHRlcm5hbCxcbiAgICBzdGFydEFuZ2xlLFxuICAgIGVuZEFuZ2xlLFxuICAgIGNsYXNzTmFtZVxuICB9ID0gcHJvcHM7XG4gIGlmIChvdXRlclJhZGl1cyA8IGlubmVyUmFkaXVzIHx8IHN0YXJ0QW5nbGUgPT09IGVuZEFuZ2xlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGxheWVyQ2xhc3MgPSBjbHN4KCdyZWNoYXJ0cy1zZWN0b3InLCBjbGFzc05hbWUpO1xuICB2YXIgZGVsdGFSYWRpdXMgPSBvdXRlclJhZGl1cyAtIGlubmVyUmFkaXVzO1xuICB2YXIgY3IgPSBnZXRQZXJjZW50VmFsdWUoY29ybmVyUmFkaXVzLCBkZWx0YVJhZGl1cywgMCwgdHJ1ZSk7XG4gIHZhciBwYXRoO1xuICBpZiAoY3IgPiAwICYmIE1hdGguYWJzKHN0YXJ0QW5nbGUgLSBlbmRBbmdsZSkgPCAzNjApIHtcbiAgICBwYXRoID0gZ2V0U2VjdG9yV2l0aENvcm5lcih7XG4gICAgICBjeCxcbiAgICAgIGN5LFxuICAgICAgaW5uZXJSYWRpdXMsXG4gICAgICBvdXRlclJhZGl1cyxcbiAgICAgIGNvcm5lclJhZGl1czogTWF0aC5taW4oY3IsIGRlbHRhUmFkaXVzIC8gMiksXG4gICAgICBmb3JjZUNvcm5lclJhZGl1cyxcbiAgICAgIGNvcm5lcklzRXh0ZXJuYWwsXG4gICAgICBzdGFydEFuZ2xlLFxuICAgICAgZW5kQW5nbGVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBwYXRoID0gZ2V0U2VjdG9yUGF0aCh7XG4gICAgICBjeCxcbiAgICAgIGN5LFxuICAgICAgaW5uZXJSYWRpdXMsXG4gICAgICBvdXRlclJhZGl1cyxcbiAgICAgIHN0YXJ0QW5nbGUsXG4gICAgICBlbmRBbmdsZVxuICAgIH0pO1xuICB9XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcInBhdGhcIiwgX2V4dGVuZHMoe30sIHN2Z1Byb3BlcnRpZXNBbmRFdmVudHMocHJvcHMpLCB7XG4gICAgY2xhc3NOYW1lOiBsYXllckNsYXNzLFxuICAgIGQ6IHBhdGhcbiAgfSkpO1xufTsiLCJpbXBvcnQgeyB1c2VMYXlvdXRFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VBcHBEaXNwYXRjaCB9IGZyb20gJy4vaG9va3MnO1xuaW1wb3J0IHsgYWRkVG9vbHRpcEVudHJ5U2V0dGluZ3MsIHJlbW92ZVRvb2x0aXBFbnRyeVNldHRpbmdzIH0gZnJvbSAnLi90b29sdGlwU2xpY2UnO1xuaW1wb3J0IHsgdXNlSXNQYW5vcmFtYSB9IGZyb20gJy4uL2NvbnRleHQvUGFub3JhbWFDb250ZXh0JztcbmV4cG9ydCBmdW5jdGlvbiBTZXRUb29sdGlwRW50cnlTZXR0aW5ncyhfcmVmKSB7XG4gIHZhciB7XG4gICAgZm4sXG4gICAgYXJnc1xuICB9ID0gX3JlZjtcbiAgdmFyIGRpc3BhdGNoID0gdXNlQXBwRGlzcGF0Y2goKTtcbiAgdmFyIGlzUGFub3JhbWEgPSB1c2VJc1Bhbm9yYW1hKCk7XG4gIHVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlzUGFub3JhbWEpIHtcbiAgICAgIC8vIFBhbm9yYW1hIGdyYXBoaWNhbCBpdGVtcyBzaG91bGQgbmV2ZXIgY29udHJpYnV0ZSB0byBUb29sdGlwIHBheWxvYWQuXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB2YXIgdG9vbHRpcEVudHJ5U2V0dGluZ3MgPSBmbihhcmdzKTtcbiAgICBkaXNwYXRjaChhZGRUb29sdGlwRW50cnlTZXR0aW5ncyh0b29sdGlwRW50cnlTZXR0aW5ncykpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkaXNwYXRjaChyZW1vdmVUb29sdGlwRW50cnlTZXR0aW5ncyh0b29sdGlwRW50cnlTZXR0aW5ncykpO1xuICAgIH07XG4gIH0sIFtmbiwgYXJncywgZGlzcGF0Y2gsIGlzUGFub3JhbWFdKTtcbiAgcmV0dXJuIG51bGw7XG59IiwidmFyIF9leGNsdWRlZCA9IFtcInR5cGVcIiwgXCJzaXplXCIsIFwic2l6ZVR5cGVcIl07XG5mdW5jdGlvbiBfZXh0ZW5kcygpIHsgcmV0dXJuIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiA/IE9iamVjdC5hc3NpZ24uYmluZCgpIDogZnVuY3Rpb24gKG4pIHsgZm9yICh2YXIgZSA9IDE7IGUgPCBhcmd1bWVudHMubGVuZ3RoOyBlKyspIHsgdmFyIHQgPSBhcmd1bWVudHNbZV07IGZvciAodmFyIHIgaW4gdCkgKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIHIpICYmIChuW3JdID0gdFtyXSk7IH0gcmV0dXJuIG47IH0sIF9leHRlbmRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH1cbmZ1bmN0aW9uIG93bktleXMoZSwgcikgeyB2YXIgdCA9IE9iamVjdC5rZXlzKGUpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IHIgJiYgKG8gPSBvLmZpbHRlcihmdW5jdGlvbiAocikgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCByKS5lbnVtZXJhYmxlOyB9KSksIHQucHVzaC5hcHBseSh0LCBvKTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZChlKSB7IGZvciAodmFyIHIgPSAxOyByIDwgYXJndW1lbnRzLmxlbmd0aDsgcisrKSB7IHZhciB0ID0gbnVsbCAhPSBhcmd1bWVudHNbcl0gPyBhcmd1bWVudHNbcl0gOiB7fTsgciAlIDIgPyBvd25LZXlzKE9iamVjdCh0KSwgITApLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgX2RlZmluZVByb3BlcnR5KGUsIHIsIHRbcl0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModCkpIDogb3duS2V5cyhPYmplY3QodCkpLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCwgcikpOyB9KTsgfSByZXR1cm4gZTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGUsIHIsIHQpIHsgcmV0dXJuIChyID0gX3RvUHJvcGVydHlLZXkocikpIGluIGUgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgeyB2YWx1ZTogdCwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSA6IGVbcl0gPSB0LCBlOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleSh0KSB7IHZhciBpID0gX3RvUHJpbWl0aXZlKHQsIFwic3RyaW5nXCIpOyByZXR1cm4gXCJzeW1ib2xcIiA9PSB0eXBlb2YgaSA/IGkgOiBpICsgXCJcIjsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKHQsIHIpIHsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIHQgfHwgIXQpIHJldHVybiB0OyB2YXIgZSA9IHRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHZvaWQgMCAhPT0gZSkgeyB2YXIgaSA9IGUuY2FsbCh0LCByIHx8IFwiZGVmYXVsdFwiKTsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIGkpIHJldHVybiBpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChcInN0cmluZ1wiID09PSByID8gU3RyaW5nIDogTnVtYmVyKSh0KTsgfVxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKGUsIHQpIHsgaWYgKG51bGwgPT0gZSkgcmV0dXJuIHt9OyB2YXIgbywgciwgaSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKGUsIHQpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IGZvciAociA9IDA7IHIgPCBuLmxlbmd0aDsgcisrKSBvID0gbltyXSwgLTEgPT09IHQuaW5kZXhPZihvKSAmJiB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGUsIG8pICYmIChpW29dID0gZVtvXSk7IH0gcmV0dXJuIGk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHIsIGUpIHsgaWYgKG51bGwgPT0gcikgcmV0dXJuIHt9OyB2YXIgdCA9IHt9OyBmb3IgKHZhciBuIGluIHIpIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHIsIG4pKSB7IGlmICgtMSAhPT0gZS5pbmRleE9mKG4pKSBjb250aW51ZTsgdFtuXSA9IHJbbl07IH0gcmV0dXJuIHQ7IH1cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHN5bWJvbCBhcyBzaGFwZVN5bWJvbCwgc3ltYm9sQ2lyY2xlLCBzeW1ib2xDcm9zcywgc3ltYm9sRGlhbW9uZCwgc3ltYm9sU3F1YXJlLCBzeW1ib2xTdGFyLCBzeW1ib2xUcmlhbmdsZSwgc3ltYm9sV3llIH0gZnJvbSAndmljdG9yeS12ZW5kb3IvZDMtc2hhcGUnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgdXBwZXJGaXJzdCB9IGZyb20gJy4uL3V0aWwvRGF0YVV0aWxzJztcbmltcG9ydCB7IHN2Z1Byb3BlcnRpZXNBbmRFdmVudHMgfSBmcm9tICcuLi91dGlsL3N2Z1Byb3BlcnRpZXNBbmRFdmVudHMnO1xudmFyIHN5bWJvbEZhY3RvcmllcyA9IHtcbiAgc3ltYm9sQ2lyY2xlLFxuICBzeW1ib2xDcm9zcyxcbiAgc3ltYm9sRGlhbW9uZCxcbiAgc3ltYm9sU3F1YXJlLFxuICBzeW1ib2xTdGFyLFxuICBzeW1ib2xUcmlhbmdsZSxcbiAgc3ltYm9sV3llXG59O1xudmFyIFJBRElBTiA9IE1hdGguUEkgLyAxODA7XG52YXIgZ2V0U3ltYm9sRmFjdG9yeSA9IHR5cGUgPT4ge1xuICB2YXIgbmFtZSA9IFwic3ltYm9sXCIuY29uY2F0KHVwcGVyRmlyc3QodHlwZSkpO1xuICByZXR1cm4gc3ltYm9sRmFjdG9yaWVzW25hbWVdIHx8IHN5bWJvbENpcmNsZTtcbn07XG52YXIgY2FsY3VsYXRlQXJlYVNpemUgPSAoc2l6ZSwgc2l6ZVR5cGUsIHR5cGUpID0+IHtcbiAgaWYgKHNpemVUeXBlID09PSAnYXJlYScpIHtcbiAgICByZXR1cm4gc2l6ZTtcbiAgfVxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdjcm9zcyc6XG4gICAgICByZXR1cm4gNSAqIHNpemUgKiBzaXplIC8gOTtcbiAgICBjYXNlICdkaWFtb25kJzpcbiAgICAgIHJldHVybiAwLjUgKiBzaXplICogc2l6ZSAvIE1hdGguc3FydCgzKTtcbiAgICBjYXNlICdzcXVhcmUnOlxuICAgICAgcmV0dXJuIHNpemUgKiBzaXplO1xuICAgIGNhc2UgJ3N0YXInOlxuICAgICAge1xuICAgICAgICB2YXIgYW5nbGUgPSAxOCAqIFJBRElBTjtcbiAgICAgICAgcmV0dXJuIDEuMjUgKiBzaXplICogc2l6ZSAqIChNYXRoLnRhbihhbmdsZSkgLSBNYXRoLnRhbihhbmdsZSAqIDIpICogTWF0aC50YW4oYW5nbGUpICoqIDIpO1xuICAgICAgfVxuICAgIGNhc2UgJ3RyaWFuZ2xlJzpcbiAgICAgIHJldHVybiBNYXRoLnNxcnQoMykgKiBzaXplICogc2l6ZSAvIDQ7XG4gICAgY2FzZSAnd3llJzpcbiAgICAgIHJldHVybiAoMjEgLSAxMCAqIE1hdGguc3FydCgzKSkgKiBzaXplICogc2l6ZSAvIDg7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBNYXRoLlBJICogc2l6ZSAqIHNpemUgLyA0O1xuICB9XG59O1xudmFyIHJlZ2lzdGVyU3ltYm9sID0gKGtleSwgZmFjdG9yeSkgPT4ge1xuICBzeW1ib2xGYWN0b3JpZXNbXCJzeW1ib2xcIi5jb25jYXQodXBwZXJGaXJzdChrZXkpKV0gPSBmYWN0b3J5O1xufTtcbmV4cG9ydCB2YXIgU3ltYm9scyA9IF9yZWYgPT4ge1xuICB2YXIge1xuICAgICAgdHlwZSA9ICdjaXJjbGUnLFxuICAgICAgc2l6ZSA9IDY0LFxuICAgICAgc2l6ZVR5cGUgPSAnYXJlYSdcbiAgICB9ID0gX3JlZixcbiAgICByZXN0ID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKF9yZWYsIF9leGNsdWRlZCk7XG4gIHZhciBwcm9wcyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgcmVzdCksIHt9LCB7XG4gICAgdHlwZSxcbiAgICBzaXplLFxuICAgIHNpemVUeXBlXG4gIH0pO1xuICB2YXIgcmVhbFR5cGUgPSAnY2lyY2xlJztcbiAgaWYgKHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIC8qXG4gICAgICogT3VyIHR5cGUgZ3VhcmQgaXMgbm90IGFzIHN0cm9uZyBhcyBpdCBjb3VsZCBiZSAoaS5lLiBub24tZXhpc3RlbnQpLFxuICAgICAqIGFuZCBzbyBkZXNwaXRlIHRoZSB0eXBlc2NyaXB0IHR5cGUgc2F5aW5nIHRoYXQgYHR5cGVgIGlzIGEgYFN5bWJvbFR5cGVgLFxuICAgICAqIHdlIGNhbiBnZXQgbnVtYmVycyBvciByZWFsbHkgYW55dGhpbmcsIHNvIGxldCdzIGhhdmUgYSBydW50aW1lIGNoZWNrIGhlcmUgdG8gZml4IHRoZSBleGNlcHRpb24uXG4gICAgICpcbiAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vcmVjaGFydHMvcmVjaGFydHMvaXNzdWVzLzYxOTdcbiAgICAgKi9cbiAgICByZWFsVHlwZSA9IHR5cGU7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlIHRoZSBwYXRoIG9mIGN1cnZlXG4gICAqIEByZXR1cm4ge1N0cmluZ30gcGF0aFxuICAgKi9cbiAgdmFyIGdldFBhdGggPSAoKSA9PiB7XG4gICAgdmFyIHN5bWJvbEZhY3RvcnkgPSBnZXRTeW1ib2xGYWN0b3J5KHJlYWxUeXBlKTtcbiAgICB2YXIgc3ltYm9sID0gc2hhcGVTeW1ib2woKS50eXBlKHN5bWJvbEZhY3RvcnkpLnNpemUoY2FsY3VsYXRlQXJlYVNpemUoc2l6ZSwgc2l6ZVR5cGUsIHJlYWxUeXBlKSk7XG4gICAgdmFyIHMgPSBzeW1ib2woKTtcbiAgICBpZiAocyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIHM7XG4gIH07XG4gIHZhciB7XG4gICAgY2xhc3NOYW1lLFxuICAgIGN4LFxuICAgIGN5XG4gIH0gPSBwcm9wcztcbiAgdmFyIGZpbHRlcmVkUHJvcHMgPSBzdmdQcm9wZXJ0aWVzQW5kRXZlbnRzKHByb3BzKTtcbiAgaWYgKGN4ID09PSArY3ggJiYgY3kgPT09ICtjeSAmJiBzaXplID09PSArc2l6ZSkge1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcInBhdGhcIiwgX2V4dGVuZHMoe30sIGZpbHRlcmVkUHJvcHMsIHtcbiAgICAgIGNsYXNzTmFtZTogY2xzeCgncmVjaGFydHMtc3ltYm9scycsIGNsYXNzTmFtZSksXG4gICAgICB0cmFuc2Zvcm06IFwidHJhbnNsYXRlKFwiLmNvbmNhdChjeCwgXCIsIFwiKS5jb25jYXQoY3ksIFwiKVwiKSxcbiAgICAgIGQ6IGdldFBhdGgoKVxuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5TeW1ib2xzLnJlZ2lzdGVyU3ltYm9sID0gcmVnaXN0ZXJTeW1ib2w7IiwiaW1wb3J0IHsgY3JlYXRlU2xpY2UgfSBmcm9tICdAcmVkdXhqcy90b29sa2l0JztcbnZhciBpbml0aWFsU3RhdGUgPSB7XG4gIGxheW91dFR5cGU6ICdob3Jpem9udGFsJyxcbiAgd2lkdGg6IDAsXG4gIGhlaWdodDogMCxcbiAgbWFyZ2luOiB7XG4gICAgdG9wOiA1LFxuICAgIHJpZ2h0OiA1LFxuICAgIGJvdHRvbTogNSxcbiAgICBsZWZ0OiA1XG4gIH0sXG4gIHNjYWxlOiAxXG59O1xudmFyIGNoYXJ0TGF5b3V0U2xpY2UgPSBjcmVhdGVTbGljZSh7XG4gIG5hbWU6ICdjaGFydExheW91dCcsXG4gIGluaXRpYWxTdGF0ZSxcbiAgcmVkdWNlcnM6IHtcbiAgICBzZXRMYXlvdXQoc3RhdGUsIGFjdGlvbikge1xuICAgICAgc3RhdGUubGF5b3V0VHlwZSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgIH0sXG4gICAgc2V0Q2hhcnRTaXplKHN0YXRlLCBhY3Rpb24pIHtcbiAgICAgIHN0YXRlLndpZHRoID0gYWN0aW9uLnBheWxvYWQud2lkdGg7XG4gICAgICBzdGF0ZS5oZWlnaHQgPSBhY3Rpb24ucGF5bG9hZC5oZWlnaHQ7XG4gICAgfSxcbiAgICBzZXRNYXJnaW4oc3RhdGUsIGFjdGlvbikge1xuICAgICAgdmFyIF9hY3Rpb24kcGF5bG9hZCR0b3AsIF9hY3Rpb24kcGF5bG9hZCRyaWdodCwgX2FjdGlvbiRwYXlsb2FkJGJvdHRvLCBfYWN0aW9uJHBheWxvYWQkbGVmdDtcbiAgICAgIHN0YXRlLm1hcmdpbi50b3AgPSAoX2FjdGlvbiRwYXlsb2FkJHRvcCA9IGFjdGlvbi5wYXlsb2FkLnRvcCkgIT09IG51bGwgJiYgX2FjdGlvbiRwYXlsb2FkJHRvcCAhPT0gdm9pZCAwID8gX2FjdGlvbiRwYXlsb2FkJHRvcCA6IDA7XG4gICAgICBzdGF0ZS5tYXJnaW4ucmlnaHQgPSAoX2FjdGlvbiRwYXlsb2FkJHJpZ2h0ID0gYWN0aW9uLnBheWxvYWQucmlnaHQpICE9PSBudWxsICYmIF9hY3Rpb24kcGF5bG9hZCRyaWdodCAhPT0gdm9pZCAwID8gX2FjdGlvbiRwYXlsb2FkJHJpZ2h0IDogMDtcbiAgICAgIHN0YXRlLm1hcmdpbi5ib3R0b20gPSAoX2FjdGlvbiRwYXlsb2FkJGJvdHRvID0gYWN0aW9uLnBheWxvYWQuYm90dG9tKSAhPT0gbnVsbCAmJiBfYWN0aW9uJHBheWxvYWQkYm90dG8gIT09IHZvaWQgMCA/IF9hY3Rpb24kcGF5bG9hZCRib3R0byA6IDA7XG4gICAgICBzdGF0ZS5tYXJnaW4ubGVmdCA9IChfYWN0aW9uJHBheWxvYWQkbGVmdCA9IGFjdGlvbi5wYXlsb2FkLmxlZnQpICE9PSBudWxsICYmIF9hY3Rpb24kcGF5bG9hZCRsZWZ0ICE9PSB2b2lkIDAgPyBfYWN0aW9uJHBheWxvYWQkbGVmdCA6IDA7XG4gICAgfSxcbiAgICBzZXRTY2FsZShzdGF0ZSwgYWN0aW9uKSB7XG4gICAgICBzdGF0ZS5zY2FsZSA9IGFjdGlvbi5wYXlsb2FkO1xuICAgIH1cbiAgfVxufSk7XG5leHBvcnQgdmFyIHtcbiAgc2V0TWFyZ2luLFxuICBzZXRMYXlvdXQsXG4gIHNldENoYXJ0U2l6ZSxcbiAgc2V0U2NhbGVcbn0gPSBjaGFydExheW91dFNsaWNlLmFjdGlvbnM7XG5leHBvcnQgdmFyIGNoYXJ0TGF5b3V0UmVkdWNlciA9IGNoYXJ0TGF5b3V0U2xpY2UucmVkdWNlcjsiLCJmdW5jdGlvbiBfZXh0ZW5kcygpIHsgcmV0dXJuIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiA/IE9iamVjdC5hc3NpZ24uYmluZCgpIDogZnVuY3Rpb24gKG4pIHsgZm9yICh2YXIgZSA9IDE7IGUgPCBhcmd1bWVudHMubGVuZ3RoOyBlKyspIHsgdmFyIHQgPSBhcmd1bWVudHNbZV07IGZvciAodmFyIHIgaW4gdCkgKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIHIpICYmIChuW3JdID0gdFtyXSk7IH0gcmV0dXJuIG47IH0sIF9leHRlbmRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH1cbi8qKlxuICogQGZpbGVPdmVydmlldyBEb3RcbiAqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgYWRhcHRFdmVudEhhbmRsZXJzIH0gZnJvbSAnLi4vdXRpbC90eXBlcyc7XG5pbXBvcnQgeyBzdmdQcm9wZXJ0aWVzTm9FdmVudHMgfSBmcm9tICcuLi91dGlsL3N2Z1Byb3BlcnRpZXNOb0V2ZW50cyc7XG5leHBvcnQgdmFyIERvdCA9IHByb3BzID0+IHtcbiAgdmFyIHtcbiAgICBjeCxcbiAgICBjeSxcbiAgICByLFxuICAgIGNsYXNzTmFtZVxuICB9ID0gcHJvcHM7XG4gIHZhciBsYXllckNsYXNzID0gY2xzeCgncmVjaGFydHMtZG90JywgY2xhc3NOYW1lKTtcbiAgaWYgKGN4ID09PSArY3ggJiYgY3kgPT09ICtjeSAmJiByID09PSArcikge1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcImNpcmNsZVwiLCBfZXh0ZW5kcyh7fSwgc3ZnUHJvcGVydGllc05vRXZlbnRzKHByb3BzKSwgYWRhcHRFdmVudEhhbmRsZXJzKHByb3BzKSwge1xuICAgICAgY2xhc3NOYW1lOiBsYXllckNsYXNzLFxuICAgICAgY3g6IGN4LFxuICAgICAgY3k6IGN5LFxuICAgICAgcjogclxuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07IiwiaW1wb3J0IHsgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXBkYXRlT3B0aW9ucyB9IGZyb20gJy4vcm9vdFByb3BzU2xpY2UnO1xuaW1wb3J0IHsgdXNlQXBwRGlzcGF0Y2ggfSBmcm9tICcuL2hvb2tzJztcbmV4cG9ydCBmdW5jdGlvbiBSZXBvcnRDaGFydFByb3BzKHByb3BzKSB7XG4gIHZhciBkaXNwYXRjaCA9IHVzZUFwcERpc3BhdGNoKCk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgZGlzcGF0Y2godXBkYXRlT3B0aW9ucyhwcm9wcykpO1xuICB9LCBbZGlzcGF0Y2gsIHByb3BzXSk7XG4gIHJldHVybiBudWxsO1xufSIsImltcG9ydCB7IGNyZWF0ZUFjdGlvbiwgY3JlYXRlTGlzdGVuZXJNaWRkbGV3YXJlIH0gZnJvbSAnQHJlZHV4anMvdG9vbGtpdCc7XG5pbXBvcnQgeyBzZWxlY3RBY3RpdmVMYWJlbCwgc2VsZWN0QWN0aXZlVG9vbHRpcENvb3JkaW5hdGUsIHNlbGVjdEFjdGl2ZVRvb2x0aXBEYXRhS2V5LCBzZWxlY3RBY3RpdmVUb29sdGlwSW5kZXgsIHNlbGVjdElzVG9vbHRpcEFjdGl2ZSB9IGZyb20gJy4vc2VsZWN0b3JzL3Rvb2x0aXBTZWxlY3RvcnMnO1xuZXhwb3J0IHZhciBleHRlcm5hbEV2ZW50QWN0aW9uID0gY3JlYXRlQWN0aW9uKCdleHRlcm5hbEV2ZW50Jyk7XG5leHBvcnQgdmFyIGV4dGVybmFsRXZlbnRzTWlkZGxld2FyZSA9IGNyZWF0ZUxpc3RlbmVyTWlkZGxld2FyZSgpO1xuZXh0ZXJuYWxFdmVudHNNaWRkbGV3YXJlLnN0YXJ0TGlzdGVuaW5nKHtcbiAgYWN0aW9uQ3JlYXRvcjogZXh0ZXJuYWxFdmVudEFjdGlvbixcbiAgZWZmZWN0OiAoYWN0aW9uLCBsaXN0ZW5lckFwaSkgPT4ge1xuICAgIGlmIChhY3Rpb24ucGF5bG9hZC5oYW5kbGVyID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHN0YXRlID0gbGlzdGVuZXJBcGkuZ2V0U3RhdGUoKTtcbiAgICB2YXIgbmV4dFN0YXRlID0ge1xuICAgICAgYWN0aXZlQ29vcmRpbmF0ZTogc2VsZWN0QWN0aXZlVG9vbHRpcENvb3JkaW5hdGUoc3RhdGUpLFxuICAgICAgYWN0aXZlRGF0YUtleTogc2VsZWN0QWN0aXZlVG9vbHRpcERhdGFLZXkoc3RhdGUpLFxuICAgICAgYWN0aXZlSW5kZXg6IHNlbGVjdEFjdGl2ZVRvb2x0aXBJbmRleChzdGF0ZSksXG4gICAgICBhY3RpdmVMYWJlbDogc2VsZWN0QWN0aXZlTGFiZWwoc3RhdGUpLFxuICAgICAgYWN0aXZlVG9vbHRpcEluZGV4OiBzZWxlY3RBY3RpdmVUb29sdGlwSW5kZXgoc3RhdGUpLFxuICAgICAgaXNUb29sdGlwQWN0aXZlOiBzZWxlY3RJc1Rvb2x0aXBBY3RpdmUoc3RhdGUpXG4gICAgfTtcbiAgICBhY3Rpb24ucGF5bG9hZC5oYW5kbGVyKG5leHRTdGF0ZSwgYWN0aW9uLnBheWxvYWQucmVhY3RFdmVudCk7XG4gIH1cbn0pOyIsImltcG9ydCB7IGNyZWF0ZUFjdGlvbiwgY3JlYXRlTGlzdGVuZXJNaWRkbGV3YXJlIH0gZnJvbSAnQHJlZHV4anMvdG9vbGtpdCc7XG5pbXBvcnQgeyBzZXRLZXlib2FyZEludGVyYWN0aW9uIH0gZnJvbSAnLi90b29sdGlwU2xpY2UnO1xuaW1wb3J0IHsgc2VsZWN0VG9vbHRpcEF4aXNUaWNrcywgc2VsZWN0VG9vbHRpcERpc3BsYXllZERhdGEgfSBmcm9tICcuL3NlbGVjdG9ycy90b29sdGlwU2VsZWN0b3JzJztcbmltcG9ydCB7IHNlbGVjdENvb3JkaW5hdGVGb3JEZWZhdWx0SW5kZXggfSBmcm9tICcuL3NlbGVjdG9ycy9zZWxlY3RvcnMnO1xuaW1wb3J0IHsgc2VsZWN0Q2hhcnREaXJlY3Rpb24gfSBmcm9tICcuL3NlbGVjdG9ycy9heGlzU2VsZWN0b3JzJztcbmltcG9ydCB7IGNvbWJpbmVBY3RpdmVUb29sdGlwSW5kZXggfSBmcm9tICcuL3NlbGVjdG9ycy9jb21iaW5lcnMvY29tYmluZUFjdGl2ZVRvb2x0aXBJbmRleCc7XG5leHBvcnQgdmFyIGtleURvd25BY3Rpb24gPSBjcmVhdGVBY3Rpb24oJ2tleURvd24nKTtcbmV4cG9ydCB2YXIgZm9jdXNBY3Rpb24gPSBjcmVhdGVBY3Rpb24oJ2ZvY3VzJyk7XG5leHBvcnQgdmFyIGtleWJvYXJkRXZlbnRzTWlkZGxld2FyZSA9IGNyZWF0ZUxpc3RlbmVyTWlkZGxld2FyZSgpO1xua2V5Ym9hcmRFdmVudHNNaWRkbGV3YXJlLnN0YXJ0TGlzdGVuaW5nKHtcbiAgYWN0aW9uQ3JlYXRvcjoga2V5RG93bkFjdGlvbixcbiAgZWZmZWN0OiAoYWN0aW9uLCBsaXN0ZW5lckFwaSkgPT4ge1xuICAgIHZhciBzdGF0ZSA9IGxpc3RlbmVyQXBpLmdldFN0YXRlKCk7XG4gICAgdmFyIGFjY2Vzc2liaWxpdHlMYXllcklzQWN0aXZlID0gc3RhdGUucm9vdFByb3BzLmFjY2Vzc2liaWxpdHlMYXllciAhPT0gZmFsc2U7XG4gICAgaWYgKCFhY2Nlc3NpYmlsaXR5TGF5ZXJJc0FjdGl2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIge1xuICAgICAga2V5Ym9hcmRJbnRlcmFjdGlvblxuICAgIH0gPSBzdGF0ZS50b29sdGlwO1xuICAgIHZhciBrZXkgPSBhY3Rpb24ucGF5bG9hZDtcbiAgICBpZiAoa2V5ICE9PSAnQXJyb3dSaWdodCcgJiYga2V5ICE9PSAnQXJyb3dMZWZ0JyAmJiBrZXkgIT09ICdFbnRlcicpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBUT0RPIHRoaXMgaXMgbGFja2luZyBpbmRleCBmb3IgY2hhcnRzIHRoYXQgZG8gbm90IHN1cHBvcnQgbnVtZXJpYyBpbmRleGVzXG4gICAgdmFyIGN1cnJlbnRJbmRleCA9IE51bWJlcihjb21iaW5lQWN0aXZlVG9vbHRpcEluZGV4KGtleWJvYXJkSW50ZXJhY3Rpb24sIHNlbGVjdFRvb2x0aXBEaXNwbGF5ZWREYXRhKHN0YXRlKSkpO1xuICAgIHZhciB0b29sdGlwVGlja3MgPSBzZWxlY3RUb29sdGlwQXhpc1RpY2tzKHN0YXRlKTtcbiAgICBpZiAoa2V5ID09PSAnRW50ZXInKSB7XG4gICAgICB2YXIgX2Nvb3JkaW5hdGUgPSBzZWxlY3RDb29yZGluYXRlRm9yRGVmYXVsdEluZGV4KHN0YXRlLCAnYXhpcycsICdob3ZlcicsIFN0cmluZyhrZXlib2FyZEludGVyYWN0aW9uLmluZGV4KSk7XG4gICAgICBsaXN0ZW5lckFwaS5kaXNwYXRjaChzZXRLZXlib2FyZEludGVyYWN0aW9uKHtcbiAgICAgICAgYWN0aXZlOiAha2V5Ym9hcmRJbnRlcmFjdGlvbi5hY3RpdmUsXG4gICAgICAgIGFjdGl2ZUluZGV4OiBrZXlib2FyZEludGVyYWN0aW9uLmluZGV4LFxuICAgICAgICBhY3RpdmVEYXRhS2V5OiBrZXlib2FyZEludGVyYWN0aW9uLmRhdGFLZXksXG4gICAgICAgIGFjdGl2ZUNvb3JkaW5hdGU6IF9jb29yZGluYXRlXG4gICAgICB9KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBkaXJlY3Rpb24gPSBzZWxlY3RDaGFydERpcmVjdGlvbihzdGF0ZSk7XG4gICAgdmFyIGRpcmVjdGlvbk11bHRpcGxpZXIgPSBkaXJlY3Rpb24gPT09ICdsZWZ0LXRvLXJpZ2h0JyA/IDEgOiAtMTtcbiAgICB2YXIgbW92ZW1lbnQgPSBrZXkgPT09ICdBcnJvd1JpZ2h0JyA/IDEgOiAtMTtcbiAgICB2YXIgbmV4dEluZGV4ID0gY3VycmVudEluZGV4ICsgbW92ZW1lbnQgKiBkaXJlY3Rpb25NdWx0aXBsaWVyO1xuICAgIGlmICh0b29sdGlwVGlja3MgPT0gbnVsbCB8fCBuZXh0SW5kZXggPj0gdG9vbHRpcFRpY2tzLmxlbmd0aCB8fCBuZXh0SW5kZXggPCAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBjb29yZGluYXRlID0gc2VsZWN0Q29vcmRpbmF0ZUZvckRlZmF1bHRJbmRleChzdGF0ZSwgJ2F4aXMnLCAnaG92ZXInLCBTdHJpbmcobmV4dEluZGV4KSk7XG4gICAgbGlzdGVuZXJBcGkuZGlzcGF0Y2goc2V0S2V5Ym9hcmRJbnRlcmFjdGlvbih7XG4gICAgICBhY3RpdmU6IHRydWUsXG4gICAgICBhY3RpdmVJbmRleDogbmV4dEluZGV4LnRvU3RyaW5nKCksXG4gICAgICBhY3RpdmVEYXRhS2V5OiB1bmRlZmluZWQsXG4gICAgICBhY3RpdmVDb29yZGluYXRlOiBjb29yZGluYXRlXG4gICAgfSkpO1xuICB9XG59KTtcbmtleWJvYXJkRXZlbnRzTWlkZGxld2FyZS5zdGFydExpc3RlbmluZyh7XG4gIGFjdGlvbkNyZWF0b3I6IGZvY3VzQWN0aW9uLFxuICBlZmZlY3Q6IChfYWN0aW9uLCBsaXN0ZW5lckFwaSkgPT4ge1xuICAgIHZhciBzdGF0ZSA9IGxpc3RlbmVyQXBpLmdldFN0YXRlKCk7XG4gICAgdmFyIGFjY2Vzc2liaWxpdHlMYXllcklzQWN0aXZlID0gc3RhdGUucm9vdFByb3BzLmFjY2Vzc2liaWxpdHlMYXllciAhPT0gZmFsc2U7XG4gICAgaWYgKCFhY2Nlc3NpYmlsaXR5TGF5ZXJJc0FjdGl2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIge1xuICAgICAga2V5Ym9hcmRJbnRlcmFjdGlvblxuICAgIH0gPSBzdGF0ZS50b29sdGlwO1xuICAgIGlmIChrZXlib2FyZEludGVyYWN0aW9uLmFjdGl2ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoa2V5Ym9hcmRJbnRlcmFjdGlvbi5pbmRleCA9PSBudWxsKSB7XG4gICAgICB2YXIgbmV4dEluZGV4ID0gJzAnO1xuICAgICAgdmFyIGNvb3JkaW5hdGUgPSBzZWxlY3RDb29yZGluYXRlRm9yRGVmYXVsdEluZGV4KHN0YXRlLCAnYXhpcycsICdob3ZlcicsIFN0cmluZyhuZXh0SW5kZXgpKTtcbiAgICAgIGxpc3RlbmVyQXBpLmRpc3BhdGNoKHNldEtleWJvYXJkSW50ZXJhY3Rpb24oe1xuICAgICAgICBhY3RpdmVEYXRhS2V5OiB1bmRlZmluZWQsXG4gICAgICAgIGFjdGl2ZTogdHJ1ZSxcbiAgICAgICAgYWN0aXZlSW5kZXg6IG5leHRJbmRleCxcbiAgICAgICAgYWN0aXZlQ29vcmRpbmF0ZTogY29vcmRpbmF0ZVxuICAgICAgfSkpO1xuICAgIH1cbiAgfVxufSk7IiwiZnVuY3Rpb24gb3duS2V5cyhlLCByKSB7IHZhciB0ID0gT2JqZWN0LmtleXMoZSk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBvID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhlKTsgciAmJiAobyA9IG8uZmlsdGVyKGZ1bmN0aW9uIChyKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGUsIHIpLmVudW1lcmFibGU7IH0pKSwgdC5wdXNoLmFwcGx5KHQsIG8pOyB9IHJldHVybiB0OyB9XG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKGUpIHsgZm9yICh2YXIgciA9IDE7IHIgPCBhcmd1bWVudHMubGVuZ3RoOyByKyspIHsgdmFyIHQgPSBudWxsICE9IGFyZ3VtZW50c1tyXSA/IGFyZ3VtZW50c1tyXSA6IHt9OyByICUgMiA/IG93bktleXMoT2JqZWN0KHQpLCAhMCkuZm9yRWFjaChmdW5jdGlvbiAocikgeyBfZGVmaW5lUHJvcGVydHkoZSwgciwgdFtyXSk7IH0pIDogT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhlLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0KSkgOiBvd25LZXlzKE9iamVjdCh0KSkuZm9yRWFjaChmdW5jdGlvbiAocikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0LCByKSk7IH0pOyB9IHJldHVybiBlOyB9XG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkoZSwgciwgdCkgeyByZXR1cm4gKHIgPSBfdG9Qcm9wZXJ0eUtleShyKSkgaW4gZSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCB7IHZhbHVlOiB0LCBlbnVtZXJhYmxlOiAhMCwgY29uZmlndXJhYmxlOiAhMCwgd3JpdGFibGU6ICEwIH0pIDogZVtyXSA9IHQsIGU7IH1cbmZ1bmN0aW9uIF90b1Byb3BlcnR5S2V5KHQpIHsgdmFyIGkgPSBfdG9QcmltaXRpdmUodCwgXCJzdHJpbmdcIik7IHJldHVybiBcInN5bWJvbFwiID09IHR5cGVvZiBpID8gaSA6IGkgKyBcIlwiOyB9XG5mdW5jdGlvbiBfdG9QcmltaXRpdmUodCwgcikgeyBpZiAoXCJvYmplY3RcIiAhPSB0eXBlb2YgdCB8fCAhdCkgcmV0dXJuIHQ7IHZhciBlID0gdFtTeW1ib2wudG9QcmltaXRpdmVdOyBpZiAodm9pZCAwICE9PSBlKSB7IHZhciBpID0gZS5jYWxsKHQsIHIgfHwgXCJkZWZhdWx0XCIpOyBpZiAoXCJvYmplY3RcIiAhPSB0eXBlb2YgaSkgcmV0dXJuIGk7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJAQHRvUHJpbWl0aXZlIG11c3QgcmV0dXJuIGEgcHJpbWl0aXZlIHZhbHVlLlwiKTsgfSByZXR1cm4gKFwic3RyaW5nXCIgPT09IHIgPyBTdHJpbmcgOiBOdW1iZXIpKHQpOyB9XG5mdW5jdGlvbiBfZXh0ZW5kcygpIHsgcmV0dXJuIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiA/IE9iamVjdC5hc3NpZ24uYmluZCgpIDogZnVuY3Rpb24gKG4pIHsgZm9yICh2YXIgZSA9IDE7IGUgPCBhcmd1bWVudHMubGVuZ3RoOyBlKyspIHsgdmFyIHQgPSBhcmd1bWVudHNbZV07IGZvciAodmFyIHIgaW4gdCkgKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIHIpICYmIChuW3JdID0gdFtyXSk7IH0gcmV0dXJuIG47IH0sIF9leHRlbmRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH1cbi8qKlxuICogQGZpbGVPdmVydmlldyBSZWN0YW5nbGVcbiAqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgcmVzb2x2ZURlZmF1bHRQcm9wcyB9IGZyb20gJy4uL3V0aWwvcmVzb2x2ZURlZmF1bHRQcm9wcyc7XG5pbXBvcnQgeyBKYXZhc2NyaXB0QW5pbWF0ZSB9IGZyb20gJy4uL2FuaW1hdGlvbi9KYXZhc2NyaXB0QW5pbWF0ZSc7XG5pbXBvcnQgeyB1c2VBbmltYXRpb25JZCB9IGZyb20gJy4uL3V0aWwvdXNlQW5pbWF0aW9uSWQnO1xuaW1wb3J0IHsgaW50ZXJwb2xhdGUgfSBmcm9tICcuLi91dGlsL0RhdGFVdGlscyc7XG5pbXBvcnQgeyBnZXRUcmFuc2l0aW9uVmFsIH0gZnJvbSAnLi4vYW5pbWF0aW9uL3V0aWwnO1xuaW1wb3J0IHsgc3ZnUHJvcGVydGllc0FuZEV2ZW50cyB9IGZyb20gJy4uL3V0aWwvc3ZnUHJvcGVydGllc0FuZEV2ZW50cyc7XG52YXIgZ2V0VHJhcGV6b2lkUGF0aCA9ICh4LCB5LCB1cHBlcldpZHRoLCBsb3dlcldpZHRoLCBoZWlnaHQpID0+IHtcbiAgdmFyIHdpZHRoR2FwID0gdXBwZXJXaWR0aCAtIGxvd2VyV2lkdGg7XG4gIHZhciBwYXRoO1xuICBwYXRoID0gXCJNIFwiLmNvbmNhdCh4LCBcIixcIikuY29uY2F0KHkpO1xuICBwYXRoICs9IFwiTCBcIi5jb25jYXQoeCArIHVwcGVyV2lkdGgsIFwiLFwiKS5jb25jYXQoeSk7XG4gIHBhdGggKz0gXCJMIFwiLmNvbmNhdCh4ICsgdXBwZXJXaWR0aCAtIHdpZHRoR2FwIC8gMiwgXCIsXCIpLmNvbmNhdCh5ICsgaGVpZ2h0KTtcbiAgcGF0aCArPSBcIkwgXCIuY29uY2F0KHggKyB1cHBlcldpZHRoIC0gd2lkdGhHYXAgLyAyIC0gbG93ZXJXaWR0aCwgXCIsXCIpLmNvbmNhdCh5ICsgaGVpZ2h0KTtcbiAgcGF0aCArPSBcIkwgXCIuY29uY2F0KHgsIFwiLFwiKS5jb25jYXQoeSwgXCIgWlwiKTtcbiAgcmV0dXJuIHBhdGg7XG59O1xudmFyIGRlZmF1bHRQcm9wcyA9IHtcbiAgeDogMCxcbiAgeTogMCxcbiAgdXBwZXJXaWR0aDogMCxcbiAgbG93ZXJXaWR0aDogMCxcbiAgaGVpZ2h0OiAwLFxuICBpc1VwZGF0ZUFuaW1hdGlvbkFjdGl2ZTogZmFsc2UsXG4gIGFuaW1hdGlvbkJlZ2luOiAwLFxuICBhbmltYXRpb25EdXJhdGlvbjogMTUwMCxcbiAgYW5pbWF0aW9uRWFzaW5nOiAnZWFzZSdcbn07XG5leHBvcnQgdmFyIFRyYXBlem9pZCA9IG91dHNpZGVQcm9wcyA9PiB7XG4gIHZhciB0cmFwZXpvaWRQcm9wcyA9IHJlc29sdmVEZWZhdWx0UHJvcHMob3V0c2lkZVByb3BzLCBkZWZhdWx0UHJvcHMpO1xuICB2YXIge1xuICAgIHgsXG4gICAgeSxcbiAgICB1cHBlcldpZHRoLFxuICAgIGxvd2VyV2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIGNsYXNzTmFtZVxuICB9ID0gdHJhcGV6b2lkUHJvcHM7XG4gIHZhciB7XG4gICAgYW5pbWF0aW9uRWFzaW5nLFxuICAgIGFuaW1hdGlvbkR1cmF0aW9uLFxuICAgIGFuaW1hdGlvbkJlZ2luLFxuICAgIGlzVXBkYXRlQW5pbWF0aW9uQWN0aXZlXG4gIH0gPSB0cmFwZXpvaWRQcm9wcztcbiAgdmFyIHBhdGhSZWYgPSB1c2VSZWYobnVsbCk7XG4gIHZhciBbdG90YWxMZW5ndGgsIHNldFRvdGFsTGVuZ3RoXSA9IHVzZVN0YXRlKC0xKTtcbiAgdmFyIHByZXZVcHBlcldpZHRoUmVmID0gdXNlUmVmKHVwcGVyV2lkdGgpO1xuICB2YXIgcHJldkxvd2VyV2lkdGhSZWYgPSB1c2VSZWYobG93ZXJXaWR0aCk7XG4gIHZhciBwcmV2SGVpZ2h0UmVmID0gdXNlUmVmKGhlaWdodCk7XG4gIHZhciBwcmV2WFJlZiA9IHVzZVJlZih4KTtcbiAgdmFyIHByZXZZUmVmID0gdXNlUmVmKHkpO1xuICB2YXIgYW5pbWF0aW9uSWQgPSB1c2VBbmltYXRpb25JZChvdXRzaWRlUHJvcHMsICd0cmFwZXpvaWQtJyk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHBhdGhSZWYuY3VycmVudCAmJiBwYXRoUmVmLmN1cnJlbnQuZ2V0VG90YWxMZW5ndGgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBwYXRoVG90YWxMZW5ndGggPSBwYXRoUmVmLmN1cnJlbnQuZ2V0VG90YWxMZW5ndGgoKTtcbiAgICAgICAgaWYgKHBhdGhUb3RhbExlbmd0aCkge1xuICAgICAgICAgIHNldFRvdGFsTGVuZ3RoKHBhdGhUb3RhbExlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKF91bnVzZWQpIHtcbiAgICAgICAgLy8gY2FsY3VsYXRlIHRvdGFsIGxlbmd0aCBlcnJvclxuICAgICAgfVxuICAgIH1cbiAgfSwgW10pO1xuICBpZiAoeCAhPT0gK3ggfHwgeSAhPT0gK3kgfHwgdXBwZXJXaWR0aCAhPT0gK3VwcGVyV2lkdGggfHwgbG93ZXJXaWR0aCAhPT0gK2xvd2VyV2lkdGggfHwgaGVpZ2h0ICE9PSAraGVpZ2h0IHx8IHVwcGVyV2lkdGggPT09IDAgJiYgbG93ZXJXaWR0aCA9PT0gMCB8fCBoZWlnaHQgPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgbGF5ZXJDbGFzcyA9IGNsc3goJ3JlY2hhcnRzLXRyYXBlem9pZCcsIGNsYXNzTmFtZSk7XG4gIGlmICghaXNVcGRhdGVBbmltYXRpb25BY3RpdmUpIHtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJnXCIsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwicGF0aFwiLCBfZXh0ZW5kcyh7fSwgc3ZnUHJvcGVydGllc0FuZEV2ZW50cyh0cmFwZXpvaWRQcm9wcyksIHtcbiAgICAgIGNsYXNzTmFtZTogbGF5ZXJDbGFzcyxcbiAgICAgIGQ6IGdldFRyYXBlem9pZFBhdGgoeCwgeSwgdXBwZXJXaWR0aCwgbG93ZXJXaWR0aCwgaGVpZ2h0KVxuICAgIH0pKSk7XG4gIH1cbiAgdmFyIHByZXZVcHBlcldpZHRoID0gcHJldlVwcGVyV2lkdGhSZWYuY3VycmVudDtcbiAgdmFyIHByZXZMb3dlcldpZHRoID0gcHJldkxvd2VyV2lkdGhSZWYuY3VycmVudDtcbiAgdmFyIHByZXZIZWlnaHQgPSBwcmV2SGVpZ2h0UmVmLmN1cnJlbnQ7XG4gIHZhciBwcmV2WCA9IHByZXZYUmVmLmN1cnJlbnQ7XG4gIHZhciBwcmV2WSA9IHByZXZZUmVmLmN1cnJlbnQ7XG4gIHZhciBmcm9tID0gXCIwcHggXCIuY29uY2F0KHRvdGFsTGVuZ3RoID09PSAtMSA/IDEgOiB0b3RhbExlbmd0aCwgXCJweFwiKTtcbiAgdmFyIHRvID0gXCJcIi5jb25jYXQodG90YWxMZW5ndGgsIFwicHggMHB4XCIpO1xuICB2YXIgdHJhbnNpdGlvbiA9IGdldFRyYW5zaXRpb25WYWwoWydzdHJva2VEYXNoYXJyYXknXSwgYW5pbWF0aW9uRHVyYXRpb24sIGFuaW1hdGlvbkVhc2luZyk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChKYXZhc2NyaXB0QW5pbWF0ZSwge1xuICAgIGFuaW1hdGlvbklkOiBhbmltYXRpb25JZCxcbiAgICBrZXk6IGFuaW1hdGlvbklkLFxuICAgIGNhbkJlZ2luOiB0b3RhbExlbmd0aCA+IDAsXG4gICAgZHVyYXRpb246IGFuaW1hdGlvbkR1cmF0aW9uLFxuICAgIGVhc2luZzogYW5pbWF0aW9uRWFzaW5nLFxuICAgIGlzQWN0aXZlOiBpc1VwZGF0ZUFuaW1hdGlvbkFjdGl2ZSxcbiAgICBiZWdpbjogYW5pbWF0aW9uQmVnaW5cbiAgfSwgdCA9PiB7XG4gICAgdmFyIGN1cnJVcHBlcldpZHRoID0gaW50ZXJwb2xhdGUocHJldlVwcGVyV2lkdGgsIHVwcGVyV2lkdGgsIHQpO1xuICAgIHZhciBjdXJyTG93ZXJXaWR0aCA9IGludGVycG9sYXRlKHByZXZMb3dlcldpZHRoLCBsb3dlcldpZHRoLCB0KTtcbiAgICB2YXIgY3VyckhlaWdodCA9IGludGVycG9sYXRlKHByZXZIZWlnaHQsIGhlaWdodCwgdCk7XG4gICAgdmFyIGN1cnJYID0gaW50ZXJwb2xhdGUocHJldlgsIHgsIHQpO1xuICAgIHZhciBjdXJyWSA9IGludGVycG9sYXRlKHByZXZZLCB5LCB0KTtcbiAgICBpZiAocGF0aFJlZi5jdXJyZW50KSB7XG4gICAgICBwcmV2VXBwZXJXaWR0aFJlZi5jdXJyZW50ID0gY3VyclVwcGVyV2lkdGg7XG4gICAgICBwcmV2TG93ZXJXaWR0aFJlZi5jdXJyZW50ID0gY3Vyckxvd2VyV2lkdGg7XG4gICAgICBwcmV2SGVpZ2h0UmVmLmN1cnJlbnQgPSBjdXJySGVpZ2h0O1xuICAgICAgcHJldlhSZWYuY3VycmVudCA9IGN1cnJYO1xuICAgICAgcHJldllSZWYuY3VycmVudCA9IGN1cnJZO1xuICAgIH1cbiAgICB2YXIgYW5pbWF0aW9uU3R5bGUgPSB0ID4gMCA/IHtcbiAgICAgIHRyYW5zaXRpb24sXG4gICAgICBzdHJva2VEYXNoYXJyYXk6IHRvXG4gICAgfSA6IHtcbiAgICAgIHN0cm9rZURhc2hhcnJheTogZnJvbVxuICAgIH07XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwicGF0aFwiLCBfZXh0ZW5kcyh7fSwgc3ZnUHJvcGVydGllc0FuZEV2ZW50cyh0cmFwZXpvaWRQcm9wcyksIHtcbiAgICAgIGNsYXNzTmFtZTogbGF5ZXJDbGFzcyxcbiAgICAgIGQ6IGdldFRyYXBlem9pZFBhdGgoY3VyclgsIGN1cnJZLCBjdXJyVXBwZXJXaWR0aCwgY3Vyckxvd2VyV2lkdGgsIGN1cnJIZWlnaHQpLFxuICAgICAgcmVmOiBwYXRoUmVmLFxuICAgICAgc3R5bGU6IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgYW5pbWF0aW9uU3R5bGUpLCB0cmFwZXpvaWRQcm9wcy5zdHlsZSlcbiAgICB9KSk7XG4gIH0pO1xufTsiLCJpbXBvcnQgeyBjcmVhdGVTbGljZSwgY3VycmVudCwgcHJlcGFyZUF1dG9CYXRjaGVkIH0gZnJvbSAnQHJlZHV4anMvdG9vbGtpdCc7XG5pbXBvcnQgeyBjYXN0RHJhZnQgfSBmcm9tICdpbW1lcic7XG5cbi8qKlxuICogVGhlIHByb3BlcnRpZXMgaW5zaWRlIHRoaXMgc3RhdGUgdXBkYXRlIGluZGVwZW5kZW50bHkgb2YgZWFjaCBvdGhlciBhbmQgcXVpdGUgb2Z0ZW4uXG4gKiBXaGVuIHNlbGVjdGluZywgbmV2ZXIgc2VsZWN0IHRoZSB3aG9sZSBzdGF0ZSBiZWNhdXNlIHlvdSBhcmUgZ29pbmcgdG8gZ2V0XG4gKiB1bm5lY2Vzc2FyeSByZS1yZW5kZXJzLiBTZWxlY3Qgb25seSB0aGUgcHJvcGVydGllcyB5b3UgbmVlZC5cbiAqXG4gKiBUaGlzIGlzIHdoeSB0aGlzIHN0YXRlIHR5cGUgaXMgbm90IGV4cG9ydGVkIC0gZG9uJ3QgdXNlIGl0IGRpcmVjdGx5LlxuICovXG5cbnZhciBpbml0aWFsU3RhdGUgPSB7XG4gIHNldHRpbmdzOiB7XG4gICAgbGF5b3V0OiAnaG9yaXpvbnRhbCcsXG4gICAgYWxpZ246ICdjZW50ZXInLFxuICAgIHZlcnRpY2FsQWxpZ246ICdtaWRkbGUnLFxuICAgIGl0ZW1Tb3J0ZXI6ICd2YWx1ZSdcbiAgfSxcbiAgc2l6ZToge1xuICAgIHdpZHRoOiAwLFxuICAgIGhlaWdodDogMFxuICB9LFxuICBwYXlsb2FkOiBbXVxufTtcbnZhciBsZWdlbmRTbGljZSA9IGNyZWF0ZVNsaWNlKHtcbiAgbmFtZTogJ2xlZ2VuZCcsXG4gIGluaXRpYWxTdGF0ZSxcbiAgcmVkdWNlcnM6IHtcbiAgICBzZXRMZWdlbmRTaXplKHN0YXRlLCBhY3Rpb24pIHtcbiAgICAgIHN0YXRlLnNpemUud2lkdGggPSBhY3Rpb24ucGF5bG9hZC53aWR0aDtcbiAgICAgIHN0YXRlLnNpemUuaGVpZ2h0ID0gYWN0aW9uLnBheWxvYWQuaGVpZ2h0O1xuICAgIH0sXG4gICAgc2V0TGVnZW5kU2V0dGluZ3Moc3RhdGUsIGFjdGlvbikge1xuICAgICAgc3RhdGUuc2V0dGluZ3MuYWxpZ24gPSBhY3Rpb24ucGF5bG9hZC5hbGlnbjtcbiAgICAgIHN0YXRlLnNldHRpbmdzLmxheW91dCA9IGFjdGlvbi5wYXlsb2FkLmxheW91dDtcbiAgICAgIHN0YXRlLnNldHRpbmdzLnZlcnRpY2FsQWxpZ24gPSBhY3Rpb24ucGF5bG9hZC52ZXJ0aWNhbEFsaWduO1xuICAgICAgc3RhdGUuc2V0dGluZ3MuaXRlbVNvcnRlciA9IGFjdGlvbi5wYXlsb2FkLml0ZW1Tb3J0ZXI7XG4gICAgfSxcbiAgICBhZGRMZWdlbmRQYXlsb2FkOiB7XG4gICAgICByZWR1Y2VyKHN0YXRlLCBhY3Rpb24pIHtcbiAgICAgICAgc3RhdGUucGF5bG9hZC5wdXNoKGNhc3REcmFmdChhY3Rpb24ucGF5bG9hZCkpO1xuICAgICAgfSxcbiAgICAgIHByZXBhcmU6IHByZXBhcmVBdXRvQmF0Y2hlZCgpXG4gICAgfSxcbiAgICByZW1vdmVMZWdlbmRQYXlsb2FkOiB7XG4gICAgICByZWR1Y2VyKHN0YXRlLCBhY3Rpb24pIHtcbiAgICAgICAgdmFyIGluZGV4ID0gY3VycmVudChzdGF0ZSkucGF5bG9hZC5pbmRleE9mKGNhc3REcmFmdChhY3Rpb24ucGF5bG9hZCkpO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgIHN0YXRlLnBheWxvYWQuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHByZXBhcmU6IHByZXBhcmVBdXRvQmF0Y2hlZCgpXG4gICAgfVxuICB9XG59KTtcbmV4cG9ydCB2YXIge1xuICBzZXRMZWdlbmRTaXplLFxuICBzZXRMZWdlbmRTZXR0aW5ncyxcbiAgYWRkTGVnZW5kUGF5bG9hZCxcbiAgcmVtb3ZlTGVnZW5kUGF5bG9hZFxufSA9IGxlZ2VuZFNsaWNlLmFjdGlvbnM7XG5leHBvcnQgdmFyIGxlZ2VuZFJlZHVjZXIgPSBsZWdlbmRTbGljZS5yZWR1Y2VyOyIsImltcG9ydCB7IGNyZWF0ZVNsaWNlLCBjdXJyZW50LCBwcmVwYXJlQXV0b0JhdGNoZWQgfSBmcm9tICdAcmVkdXhqcy90b29sa2l0JztcbmltcG9ydCB7IGNhc3REcmFmdCB9IGZyb20gJ2ltbWVyJztcblxuLyoqXG4gKiBVbmlxdWUgSUQgb2YgdGhlIGdyYXBoaWNhbCBpdGVtLlxuICogVGhpcyBpcyB1c2VkIHRvIGlkZW50aWZ5IHRoZSBncmFwaGljYWwgaXRlbSBpbiB0aGUgc3RhdGUgYW5kIGluIHRoZSBSZWFjdCB0cmVlLlxuICogVGhpcyBpcyByZXF1aXJlZCBmb3IgZXZlcnkgZ3JhcGhpY2FsIGl0ZW0gLSBpdCdzIGVpdGhlciBwcm92aWRlZCBieSB0aGUgdXNlciBvciBnZW5lcmF0ZWQgYXV0b21hdGljYWxseS5cbiAqL1xuXG52YXIgaW5pdGlhbFN0YXRlID0ge1xuICBjYXJ0ZXNpYW5JdGVtczogW10sXG4gIHBvbGFySXRlbXM6IFtdXG59O1xudmFyIGdyYXBoaWNhbEl0ZW1zU2xpY2UgPSBjcmVhdGVTbGljZSh7XG4gIG5hbWU6ICdncmFwaGljYWxJdGVtcycsXG4gIGluaXRpYWxTdGF0ZSxcbiAgcmVkdWNlcnM6IHtcbiAgICBhZGRDYXJ0ZXNpYW5HcmFwaGljYWxJdGVtOiB7XG4gICAgICByZWR1Y2VyKHN0YXRlLCBhY3Rpb24pIHtcbiAgICAgICAgc3RhdGUuY2FydGVzaWFuSXRlbXMucHVzaChjYXN0RHJhZnQoYWN0aW9uLnBheWxvYWQpKTtcbiAgICAgIH0sXG4gICAgICBwcmVwYXJlOiBwcmVwYXJlQXV0b0JhdGNoZWQoKVxuICAgIH0sXG4gICAgcmVwbGFjZUNhcnRlc2lhbkdyYXBoaWNhbEl0ZW06IHtcbiAgICAgIHJlZHVjZXIoc3RhdGUsIGFjdGlvbikge1xuICAgICAgICB2YXIge1xuICAgICAgICAgIHByZXYsXG4gICAgICAgICAgbmV4dFxuICAgICAgICB9ID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICAgIHZhciBpbmRleCA9IGN1cnJlbnQoc3RhdGUpLmNhcnRlc2lhbkl0ZW1zLmluZGV4T2YoY2FzdERyYWZ0KHByZXYpKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICBzdGF0ZS5jYXJ0ZXNpYW5JdGVtc1tpbmRleF0gPSBjYXN0RHJhZnQobmV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBwcmVwYXJlOiBwcmVwYXJlQXV0b0JhdGNoZWQoKVxuICAgIH0sXG4gICAgcmVtb3ZlQ2FydGVzaWFuR3JhcGhpY2FsSXRlbToge1xuICAgICAgcmVkdWNlcihzdGF0ZSwgYWN0aW9uKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGN1cnJlbnQoc3RhdGUpLmNhcnRlc2lhbkl0ZW1zLmluZGV4T2YoY2FzdERyYWZ0KGFjdGlvbi5wYXlsb2FkKSk7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgc3RhdGUuY2FydGVzaWFuSXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHByZXBhcmU6IHByZXBhcmVBdXRvQmF0Y2hlZCgpXG4gICAgfSxcbiAgICBhZGRQb2xhckdyYXBoaWNhbEl0ZW06IHtcbiAgICAgIHJlZHVjZXIoc3RhdGUsIGFjdGlvbikge1xuICAgICAgICBzdGF0ZS5wb2xhckl0ZW1zLnB1c2goY2FzdERyYWZ0KGFjdGlvbi5wYXlsb2FkKSk7XG4gICAgICB9LFxuICAgICAgcHJlcGFyZTogcHJlcGFyZUF1dG9CYXRjaGVkKClcbiAgICB9LFxuICAgIHJlbW92ZVBvbGFyR3JhcGhpY2FsSXRlbToge1xuICAgICAgcmVkdWNlcihzdGF0ZSwgYWN0aW9uKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGN1cnJlbnQoc3RhdGUpLnBvbGFySXRlbXMuaW5kZXhPZihjYXN0RHJhZnQoYWN0aW9uLnBheWxvYWQpKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICBzdGF0ZS5wb2xhckl0ZW1zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBwcmVwYXJlOiBwcmVwYXJlQXV0b0JhdGNoZWQoKVxuICAgIH1cbiAgfVxufSk7XG5leHBvcnQgdmFyIHtcbiAgYWRkQ2FydGVzaWFuR3JhcGhpY2FsSXRlbSxcbiAgcmVwbGFjZUNhcnRlc2lhbkdyYXBoaWNhbEl0ZW0sXG4gIHJlbW92ZUNhcnRlc2lhbkdyYXBoaWNhbEl0ZW0sXG4gIGFkZFBvbGFyR3JhcGhpY2FsSXRlbSxcbiAgcmVtb3ZlUG9sYXJHcmFwaGljYWxJdGVtXG59ID0gZ3JhcGhpY2FsSXRlbXNTbGljZS5hY3Rpb25zO1xuZXhwb3J0IHZhciBncmFwaGljYWxJdGVtc1JlZHVjZXIgPSBncmFwaGljYWxJdGVtc1NsaWNlLnJlZHVjZXI7IiwiaW1wb3J0IHsgY3JlYXRlQ29udGV4dCB9IGZyb20gJ3JlYWN0JztcblxuLypcbiAqIFRoaXMgaXMgYSBjb3B5IG9mIHRoZSBSZWFjdC1SZWR1eCBjb250ZXh0IHR5cGUsIGJ1dCB3aXRoIG91ciBvd24gc3RvcmUgdHlwZS5cbiAqIFdlIGNvdWxkIGltcG9ydCBkaXJlY3RseSBmcm9tIHJlYWN0LXJlZHV4IGxpa2UgdGhpczpcbiAqIGltcG9ydCB7IFJlYWN0UmVkdXhDb250ZXh0VmFsdWUgfSBmcm9tICdyZWFjdC1yZWR1eC9zcmMvY29tcG9uZW50cy9Db250ZXh0JztcbiAqIGJ1dCB0aGF0IG1ha2VzIHR5cGVzY3JpcHQgYW5ncnkgd2l0aCBzb21lIGVycm9ycyBJIGFtIG5vdCBzdXJlIGhvdyB0byByZXNvbHZlXG4gKiBzbyBjb3B5IGl0IGlzLlxuICovXG5cbi8qKlxuICogV2UgbmVlZCB0byB1c2Ugb3VyIG93biBpbmRlcGVuZGVudCBSZWR1eCBjb250ZXh0IGJlY2F1c2Ugd2UgbmVlZCB0byBhdm9pZCBpbnRlcmZlcmluZyB3aXRoIG90aGVyIHBlb3BsZSdzIFJlZHV4IHN0b3Jlc1xuICogaW4gY2FzZSB0aGV5IGRlY2lkZSB0byBpbnN0YWxsIGFuZCB1c2UgUmVjaGFydHMgaW4gYW5vdGhlciBSZWR1eCBhcHAgd2hpY2ggaXMgbGlrZWx5IHRvIGhhcHBlbi5cbiAqXG4gKiBodHRwczovL3JlYWN0LXJlZHV4LmpzLm9yZy91c2luZy1yZWFjdC1yZWR1eC9hY2Nlc3Npbmctc3RvcmUjcHJvdmlkaW5nLWN1c3RvbS1jb250ZXh0XG4gKi9cbmV4cG9ydCB2YXIgUmVjaGFydHNSZWR1eENvbnRleHQgPSAvKiNfX1BVUkVfXyovY3JlYXRlQ29udGV4dChudWxsKTsiLCJmdW5jdGlvbiBvd25LZXlzKGUsIHIpIHsgdmFyIHQgPSBPYmplY3Qua2V5cyhlKTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyByICYmIChvID0gby5maWx0ZXIoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgcikuZW51bWVyYWJsZTsgfSkpLCB0LnB1c2guYXBwbHkodCwgbyk7IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQoZSkgeyBmb3IgKHZhciByID0gMTsgciA8IGFyZ3VtZW50cy5sZW5ndGg7IHIrKykgeyB2YXIgdCA9IG51bGwgIT0gYXJndW1lbnRzW3JdID8gYXJndW1lbnRzW3JdIDoge307IHIgJSAyID8gb3duS2V5cyhPYmplY3QodCksICEwKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0W3JdKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHQpKSA6IG93bktleXMoT2JqZWN0KHQpKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsIHIpKTsgfSk7IH0gcmV0dXJuIGU7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbmltcG9ydCB7IGNyZWF0ZVNsaWNlLCBwcmVwYXJlQXV0b0JhdGNoZWQgfSBmcm9tICdAcmVkdXhqcy90b29sa2l0JztcbmltcG9ydCB7IGNhc3REcmFmdCB9IGZyb20gJ2ltbWVyJztcbmV4cG9ydCB2YXIgZGVmYXVsdEF4aXNJZCA9IDA7XG5cbi8qKlxuICogUHJvcGVydGllcyBzaGFyZWQgaW4gWCwgWSwgYW5kIFogYXhlc1xuICovXG5cbi8qKlxuICogVGhlc2UgYXJlIHRoZSBleHRlcm5hbCBwcm9wcywgdmlzaWJsZSBmb3IgdXNlcnMgYXMgdGhleSBzZXQgdGhlbSB1c2luZyBvdXIgcHVibGljIEFQSS5cbiAqIFRoZXJlIGlzIGFsbCBzb3J0cyBvZiBpbnRlcm5hbCBjb21wdXRlZCB0aGluZ3MgYmFzZWQgb24gdGhlc2UsIGJ1dCB0aGV5IHdpbGwgY29tZSB0aHJvdWdoIHNlbGVjdG9ycy5cbiAqXG4gKiBQcm9wZXJ0aWVzIHNoYXJlZCBiZXR3ZWVuIFggYW5kIFkgYXhlc1xuICovXG5cbi8qKlxuICogWiBheGlzIGlzIHNwZWNpYWwgYmVjYXVzZSBpdCdzIG5ldmVyIGRpc3BsYXllZC4gSXQgY29udHJvbHMgdGhlIHNpemUgb2YgU2NhdHRlciBkb3RzLFxuICogYnV0IGl0IG5ldmVyIGRpc3BsYXlzIHRpY2tzIGFueXdoZXJlLlxuICovXG5cbnZhciBpbml0aWFsU3RhdGUgPSB7XG4gIHhBeGlzOiB7fSxcbiAgeUF4aXM6IHt9LFxuICB6QXhpczoge31cbn07XG5cbi8qKlxuICogVGhpcyBpcyB0aGUgc2xpY2Ugd2hlcmUgZWFjaCBpbmRpdmlkdWFsIEF4aXMgZWxlbWVudCBwdXNoZXMgaXRzIG93biBjb25maWd1cmF0aW9uLlxuICogUHJlZmVyIHRvIHVzZSB0aGlzIG9uZSBpbnN0ZWFkIG9mIGF4aXNTbGljZS5cbiAqL1xudmFyIGNhcnRlc2lhbkF4aXNTbGljZSA9IGNyZWF0ZVNsaWNlKHtcbiAgbmFtZTogJ2NhcnRlc2lhbkF4aXMnLFxuICBpbml0aWFsU3RhdGUsXG4gIHJlZHVjZXJzOiB7XG4gICAgYWRkWEF4aXM6IHtcbiAgICAgIHJlZHVjZXIoc3RhdGUsIGFjdGlvbikge1xuICAgICAgICBzdGF0ZS54QXhpc1thY3Rpb24ucGF5bG9hZC5pZF0gPSBjYXN0RHJhZnQoYWN0aW9uLnBheWxvYWQpO1xuICAgICAgfSxcbiAgICAgIHByZXBhcmU6IHByZXBhcmVBdXRvQmF0Y2hlZCgpXG4gICAgfSxcbiAgICByZW1vdmVYQXhpczoge1xuICAgICAgcmVkdWNlcihzdGF0ZSwgYWN0aW9uKSB7XG4gICAgICAgIGRlbGV0ZSBzdGF0ZS54QXhpc1thY3Rpb24ucGF5bG9hZC5pZF07XG4gICAgICB9LFxuICAgICAgcHJlcGFyZTogcHJlcGFyZUF1dG9CYXRjaGVkKClcbiAgICB9LFxuICAgIGFkZFlBeGlzOiB7XG4gICAgICByZWR1Y2VyKHN0YXRlLCBhY3Rpb24pIHtcbiAgICAgICAgc3RhdGUueUF4aXNbYWN0aW9uLnBheWxvYWQuaWRdID0gY2FzdERyYWZ0KGFjdGlvbi5wYXlsb2FkKTtcbiAgICAgIH0sXG4gICAgICBwcmVwYXJlOiBwcmVwYXJlQXV0b0JhdGNoZWQoKVxuICAgIH0sXG4gICAgcmVtb3ZlWUF4aXM6IHtcbiAgICAgIHJlZHVjZXIoc3RhdGUsIGFjdGlvbikge1xuICAgICAgICBkZWxldGUgc3RhdGUueUF4aXNbYWN0aW9uLnBheWxvYWQuaWRdO1xuICAgICAgfSxcbiAgICAgIHByZXBhcmU6IHByZXBhcmVBdXRvQmF0Y2hlZCgpXG4gICAgfSxcbiAgICBhZGRaQXhpczoge1xuICAgICAgcmVkdWNlcihzdGF0ZSwgYWN0aW9uKSB7XG4gICAgICAgIHN0YXRlLnpBeGlzW2FjdGlvbi5wYXlsb2FkLmlkXSA9IGNhc3REcmFmdChhY3Rpb24ucGF5bG9hZCk7XG4gICAgICB9LFxuICAgICAgcHJlcGFyZTogcHJlcGFyZUF1dG9CYXRjaGVkKClcbiAgICB9LFxuICAgIHJlbW92ZVpBeGlzOiB7XG4gICAgICByZWR1Y2VyKHN0YXRlLCBhY3Rpb24pIHtcbiAgICAgICAgZGVsZXRlIHN0YXRlLnpBeGlzW2FjdGlvbi5wYXlsb2FkLmlkXTtcbiAgICAgIH0sXG4gICAgICBwcmVwYXJlOiBwcmVwYXJlQXV0b0JhdGNoZWQoKVxuICAgIH0sXG4gICAgdXBkYXRlWUF4aXNXaWR0aChzdGF0ZSwgYWN0aW9uKSB7XG4gICAgICB2YXIge1xuICAgICAgICBpZCxcbiAgICAgICAgd2lkdGhcbiAgICAgIH0gPSBhY3Rpb24ucGF5bG9hZDtcbiAgICAgIHZhciBheGlzID0gc3RhdGUueUF4aXNbaWRdO1xuICAgICAgaWYgKGF4aXMpIHtcbiAgICAgICAgdmFyIGhpc3RvcnkgPSBheGlzLndpZHRoSGlzdG9yeSB8fCBbXTtcbiAgICAgICAgLy8gQW4gb3NjaWxsYXRpb24gaXMgZGV0ZWN0ZWQgd2hlbiB0aGUgbmV3IHdpZHRoIGlzIHRoZSBzYW1lIGFzIHRoZSB3aWR0aCBiZWZvcmUgdGhlIGxhc3Qgb25lLlxuICAgICAgICAvLyBUaGlzIGlzIGEgc2ltcGxlIEEgLT4gQiAtPiBBIHBhdHRlcm4uIElmIHRoZSBuZXh0IHdpZHRoIGlzIEIsIGFuZCB0aGUgZGlmZmVyZW5jZSBpcyBsZXNzIHRoYW4gMSBwaXhlbCwgd2UgaWdub3JlIGl0LlxuICAgICAgICBpZiAoaGlzdG9yeS5sZW5ndGggPT09IDMgJiYgaGlzdG9yeVswXSA9PT0gaGlzdG9yeVsyXSAmJiB3aWR0aCA9PT0gaGlzdG9yeVsxXSAmJiB3aWR0aCAhPT0gYXhpcy53aWR0aCAmJiBNYXRoLmFicyh3aWR0aCAtIGhpc3RvcnlbMF0pIDw9IDEpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5ld0hpc3RvcnkgPSBbLi4uaGlzdG9yeSwgd2lkdGhdLnNsaWNlKC0zKTtcbiAgICAgICAgc3RhdGUueUF4aXNbaWRdID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBzdGF0ZS55QXhpc1tpZF0pLCB7fSwge1xuICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgIHdpZHRoSGlzdG9yeTogbmV3SGlzdG9yeVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pO1xuZXhwb3J0IHZhciB7XG4gIGFkZFhBeGlzLFxuICByZW1vdmVYQXhpcyxcbiAgYWRkWUF4aXMsXG4gIHJlbW92ZVlBeGlzLFxuICBhZGRaQXhpcyxcbiAgcmVtb3ZlWkF4aXMsXG4gIHVwZGF0ZVlBeGlzV2lkdGhcbn0gPSBjYXJ0ZXNpYW5BeGlzU2xpY2UuYWN0aW9ucztcbmV4cG9ydCB2YXIgY2FydGVzaWFuQXhpc1JlZHVjZXIgPSBjYXJ0ZXNpYW5BeGlzU2xpY2UucmVkdWNlcjsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=