"use strict";
(global["webpackChunkguiv2"] = global["webpackChunkguiv2"] || []).push([[3396],{

/***/ 11386:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  f: () => (/* binding */ getTicks)
});

// EXTERNAL MODULE: ./node_modules/recharts/es6/util/DataUtils.js
var DataUtils = __webpack_require__(59744);
// EXTERNAL MODULE: ./node_modules/recharts/es6/util/DOMUtils.js
var DOMUtils = __webpack_require__(81636);
// EXTERNAL MODULE: ./node_modules/recharts/es6/util/Global.js
var Global = __webpack_require__(59938);
// EXTERNAL MODULE: ./node_modules/recharts/es6/util/TickUtils.js
var TickUtils = __webpack_require__(80771);
// EXTERNAL MODULE: ./node_modules/recharts/es6/util/getEveryNthWithCondition.js
var getEveryNthWithCondition = __webpack_require__(17561);
;// ./node_modules/recharts/es6/cartesian/getEquidistantTicks.js


function getEquidistantTicks(sign, boundaries, getTickSize, ticks, minTickGap) {
  // If the ticks are readonly, then the slice might not be necessary
  var result = (ticks || []).slice();
  var {
    start: initialStart,
    end
  } = boundaries;
  var index = 0;
  // Premature optimisation idea 1: Estimate a lower bound, and start from there.
  // For now, start from every tick
  var stepsize = 1;
  var start = initialStart;
  var _loop = function _loop() {
      // Given stepsize, evaluate whether every stepsize-th tick can be shown.
      // If it can not, then increase the stepsize by 1, and try again.

      var entry = ticks === null || ticks === void 0 ? void 0 : ticks[index];

      // Break condition - If we have evaluated all the ticks, then we are done.
      if (entry === undefined) {
        return {
          v: (0,getEveryNthWithCondition/* getEveryNthWithCondition */.B)(ticks, stepsize)
        };
      }

      // Check if the element collides with the next element
      var i = index;
      var size;
      var getSize = () => {
        if (size === undefined) {
          size = getTickSize(entry, i);
        }
        return size;
      };
      var tickCoord = entry.coordinate;
      // We will always show the first tick.
      var isShow = index === 0 || (0,TickUtils/* isVisible */.zN)(sign, tickCoord, getSize, start, end);
      if (!isShow) {
        // Start all over with a larger stepsize
        index = 0;
        start = initialStart;
        stepsize += 1;
      }
      if (isShow) {
        // If it can be shown, update the start
        start = tickCoord + sign * (getSize() / 2 + minTickGap);
        index += stepsize;
      }
    },
    _ret;
  while (stepsize <= result.length) {
    _ret = _loop();
    if (_ret) return _ret.v;
  }
  return [];
}
;// ./node_modules/recharts/es6/cartesian/getTicks.js
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }





function getTicksEnd(sign, boundaries, getTickSize, ticks, minTickGap) {
  var result = (ticks || []).slice();
  var len = result.length;
  var {
    start
  } = boundaries;
  var {
    end
  } = boundaries;
  var _loop = function _loop(i) {
    var entry = result[i];
    var size;
    var getSize = () => {
      if (size === undefined) {
        size = getTickSize(entry, i);
      }
      return size;
    };
    if (i === len - 1) {
      var gap = sign * (entry.coordinate + sign * getSize() / 2 - end);
      result[i] = entry = _objectSpread(_objectSpread({}, entry), {}, {
        tickCoord: gap > 0 ? entry.coordinate - gap * sign : entry.coordinate
      });
    } else {
      result[i] = entry = _objectSpread(_objectSpread({}, entry), {}, {
        tickCoord: entry.coordinate
      });
    }
    var isShow = (0,TickUtils/* isVisible */.zN)(sign, entry.tickCoord, getSize, start, end);
    if (isShow) {
      end = entry.tickCoord - sign * (getSize() / 2 + minTickGap);
      result[i] = _objectSpread(_objectSpread({}, entry), {}, {
        isShow: true
      });
    }
  };
  for (var i = len - 1; i >= 0; i--) {
    _loop(i);
  }
  return result;
}
function getTicksStart(sign, boundaries, getTickSize, ticks, minTickGap, preserveEnd) {
  // This method is mutating the array so clone is indeed necessary here
  var result = (ticks || []).slice();
  var len = result.length;
  var {
    start,
    end
  } = boundaries;
  if (preserveEnd) {
    // Try to guarantee the tail to be displayed
    var tail = ticks[len - 1];
    var tailSize = getTickSize(tail, len - 1);
    var tailGap = sign * (tail.coordinate + sign * tailSize / 2 - end);
    result[len - 1] = tail = _objectSpread(_objectSpread({}, tail), {}, {
      tickCoord: tailGap > 0 ? tail.coordinate - tailGap * sign : tail.coordinate
    });
    var isTailShow = (0,TickUtils/* isVisible */.zN)(sign, tail.tickCoord, () => tailSize, start, end);
    if (isTailShow) {
      end = tail.tickCoord - sign * (tailSize / 2 + minTickGap);
      result[len - 1] = _objectSpread(_objectSpread({}, tail), {}, {
        isShow: true
      });
    }
  }
  var count = preserveEnd ? len - 1 : len;
  var _loop2 = function _loop2(i) {
    var entry = result[i];
    var size;
    var getSize = () => {
      if (size === undefined) {
        size = getTickSize(entry, i);
      }
      return size;
    };
    if (i === 0) {
      var gap = sign * (entry.coordinate - sign * getSize() / 2 - start);
      result[i] = entry = _objectSpread(_objectSpread({}, entry), {}, {
        tickCoord: gap < 0 ? entry.coordinate - gap * sign : entry.coordinate
      });
    } else {
      result[i] = entry = _objectSpread(_objectSpread({}, entry), {}, {
        tickCoord: entry.coordinate
      });
    }
    var isShow = (0,TickUtils/* isVisible */.zN)(sign, entry.tickCoord, getSize, start, end);
    if (isShow) {
      start = entry.tickCoord + sign * (getSize() / 2 + minTickGap);
      result[i] = _objectSpread(_objectSpread({}, entry), {}, {
        isShow: true
      });
    }
  };
  for (var i = 0; i < count; i++) {
    _loop2(i);
  }
  return result;
}
function getTicks(props, fontSize, letterSpacing) {
  var {
    tick,
    ticks,
    viewBox,
    minTickGap,
    orientation,
    interval,
    tickFormatter,
    unit,
    angle
  } = props;
  if (!ticks || !ticks.length || !tick) {
    return [];
  }
  if ((0,DataUtils/* isNumber */.Et)(interval) || Global/* Global */.m.isSsr) {
    var _getNumberIntervalTic;
    return (_getNumberIntervalTic = (0,TickUtils/* getNumberIntervalTicks */.pB)(ticks, (0,DataUtils/* isNumber */.Et)(interval) ? interval : 0)) !== null && _getNumberIntervalTic !== void 0 ? _getNumberIntervalTic : [];
  }
  var candidates = [];
  var sizeKey = orientation === 'top' || orientation === 'bottom' ? 'width' : 'height';
  var unitSize = unit && sizeKey === 'width' ? (0,DOMUtils/* getStringSize */.Pu)(unit, {
    fontSize,
    letterSpacing
  }) : {
    width: 0,
    height: 0
  };
  var getTickSize = (content, index) => {
    var value = typeof tickFormatter === 'function' ? tickFormatter(content.value, index) : content.value;
    // Recharts only supports angles when sizeKey === 'width'
    return sizeKey === 'width' ? (0,TickUtils/* getAngledTickWidth */.HX)((0,DOMUtils/* getStringSize */.Pu)(value, {
      fontSize,
      letterSpacing
    }), unitSize, angle) : (0,DOMUtils/* getStringSize */.Pu)(value, {
      fontSize,
      letterSpacing
    })[sizeKey];
  };
  var sign = ticks.length >= 2 ? (0,DataUtils/* mathSign */.sA)(ticks[1].coordinate - ticks[0].coordinate) : 1;
  var boundaries = (0,TickUtils/* getTickBoundaries */.y)(viewBox, sign, sizeKey);
  if (interval === 'equidistantPreserveStart') {
    return getEquidistantTicks(sign, boundaries, getTickSize, ticks, minTickGap);
  }
  if (interval === 'preserveStart' || interval === 'preserveStartEnd') {
    candidates = getTicksStart(sign, boundaries, getTickSize, ticks, minTickGap, interval === 'preserveStartEnd');
  } else {
    candidates = getTicksEnd(sign, boundaries, getTickSize, ticks, minTickGap);
  }
  return candidates.filter(entry => entry.isShow);
}

/***/ }),

/***/ 14799:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   J: () => (/* binding */ computeScatterPoints)
/* harmony export */ });
/* unused harmony export Scatter */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(86069);
/* harmony import */ var _component_LabelList__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5614);
/* harmony import */ var _util_ReactUtils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(94501);
/* harmony import */ var _util_Global__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(59938);
/* harmony import */ var _ZAxis__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(51658);
/* harmony import */ var _shape_Curve__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(45249);
/* harmony import */ var _component_Cell__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(72050);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(59744);
/* harmony import */ var _util_ChartUtils__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(33964);
/* harmony import */ var _util_types__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(98940);
/* harmony import */ var _util_ScatterUtils__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(33298);
/* harmony import */ var _context_tooltipContext__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(58008);
/* harmony import */ var _state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(59482);
/* harmony import */ var _context_ErrorBarContext__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(5298);
/* harmony import */ var _GraphicalItemClipPath__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(31754);
/* harmony import */ var _state_selectors_scatterSelectors__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(39375);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(49082);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(12070);
/* harmony import */ var _state_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(33032);
/* harmony import */ var _state_SetLegendPayload__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(19797);
/* harmony import */ var _util_Constants__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(4364);
/* harmony import */ var _util_useAnimationId__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(8107);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(77404);
/* harmony import */ var _context_RegisterGraphicalItemId__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(84044);
/* harmony import */ var _state_SetGraphicalItem__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(42678);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(55448);
/* harmony import */ var _animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(31528);
/* harmony import */ var _context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(19287);
var _excluded = ["onMouseEnter", "onClick", "onMouseLeave"],
  _excluded2 = ["id"],
  _excluded3 = ["animationBegin", "animationDuration", "animationEasing", "hide", "isAnimationActive", "legendType", "lineJointType", "lineType", "shape", "xAxisId", "yAxisId", "zAxisId"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
































/**
 * Internal props, combination of external props + defaultProps + private Recharts state
 */

/**
 * External props, intended for end users to fill in
 */

/**
 * Because of naming conflict, we are forced to ignore certain (valid) SVG attributes.
 */

var computeLegendPayloadFromScatterProps = props => {
  var {
    dataKey,
    name,
    fill,
    legendType,
    hide
  } = props;
  return [{
    inactive: hide,
    dataKey,
    type: legendType,
    color: fill,
    value: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_10__/* .getTooltipNameProp */ .uM)(name, dataKey),
    payload: props
  }];
};
function ScatterLine(_ref) {
  var {
    points,
    props
  } = _ref;
  var {
    line,
    lineType,
    lineJointType
  } = props;
  if (!line) {
    return null;
  }
  var scatterProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_27__/* .svgPropertiesNoEvents */ .uZ)(props);
  var customLineProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_27__/* .svgPropertiesNoEventsFromUnknown */ .ic)(line);
  var linePoints, lineItem;
  if (lineType === 'joint') {
    linePoints = points.map(entry => ({
      x: entry.cx,
      y: entry.cy
    }));
  } else if (lineType === 'fitting') {
    var {
      xmin,
      xmax,
      a,
      b
    } = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_9__/* .getLinearRegression */ .jG)(points);
    var linearExp = x => a * x + b;
    linePoints = [{
      x: xmin,
      y: linearExp(xmin)
    }, {
      x: xmax,
      y: linearExp(xmax)
    }];
  }
  var lineProps = _objectSpread(_objectSpread(_objectSpread({}, scatterProps), {}, {
    // @ts-expect-error customLineProps is contributing unknown props
    fill: 'none',
    // @ts-expect-error customLineProps is contributing unknown props
    stroke: scatterProps && scatterProps.fill
  }, customLineProps), {}, {
    points: linePoints
  });
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(line)) {
    lineItem = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(line, lineProps);
  } else if (typeof line === 'function') {
    lineItem = line(lineProps);
  } else {
    lineItem = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Curve__WEBPACK_IMPORTED_MODULE_7__/* .Curve */ .I, _extends({}, lineProps, {
      type: lineJointType
    }));
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_2__/* .Layer */ .W, {
    className: "recharts-scatter-line",
    key: "recharts-scatter-line"
  }, lineItem);
}
function ScatterLabelListProvider(_ref2) {
  var {
    showLabels,
    points,
    children
  } = _ref2;
  var chartViewBox = (0,_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_29__/* .useViewBox */ .sk)();
  var labelListEntries = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    return points === null || points === void 0 ? void 0 : points.map(point => {
      var viewBox = {
        /*
         * Scatter label uses x and y as the reference point for the label,
         * not cx and cy.
         */
        x: point.x,
        /*
         * Scatter label uses x and y as the reference point for the label,
         * not cx and cy.
         */
        y: point.y,
        width: point.width,
        height: point.height
      };
      return _objectSpread(_objectSpread({}, viewBox), {}, {
        /*
         * Here we put undefined because Scatter shows two values usually, one for X and one for Y.
         * LabelList will see this undefined and will use its own `dataKey` prop to determine which value to show,
         * using the payload below.
         */
        value: undefined,
        payload: point.payload,
        viewBox,
        parentViewBox: chartViewBox,
        fill: undefined
      });
    });
  }, [chartViewBox, points]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_3__/* .CartesianLabelListContextProvider */ .h8, {
    value: showLabels ? labelListEntries : null
  }, children);
}
function ScatterSymbols(props) {
  var {
    points,
    allOtherScatterProps
  } = props;
  var {
    shape,
    activeShape,
    dataKey
  } = allOtherScatterProps;
  var activeIndex = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_18__/* .useAppSelector */ .G)(_state_selectors_tooltipSelectors__WEBPACK_IMPORTED_MODULE_20__/* .selectActiveTooltipIndex */ .A2);
  var {
      onMouseEnter: onMouseEnterFromProps,
      onClick: onItemClickFromProps,
      onMouseLeave: onMouseLeaveFromProps
    } = allOtherScatterProps,
    restOfAllOtherProps = _objectWithoutProperties(allOtherScatterProps, _excluded);
  var onMouseEnterFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_13__/* .useMouseEnterItemDispatch */ .Cj)(onMouseEnterFromProps, allOtherScatterProps.dataKey);
  var onMouseLeaveFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_13__/* .useMouseLeaveItemDispatch */ .Pg)(onMouseLeaveFromProps);
  var onClickFromContext = (0,_context_tooltipContext__WEBPACK_IMPORTED_MODULE_13__/* .useMouseClickItemDispatch */ .Ub)(onItemClickFromProps, allOtherScatterProps.dataKey);
  if (points == null) {
    return null;
  }
  var {
      id
    } = allOtherScatterProps,
    allOtherPropsWithoutId = _objectWithoutProperties(allOtherScatterProps, _excluded2);
  var baseProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_27__/* .svgPropertiesNoEvents */ .uZ)(allOtherPropsWithoutId);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ScatterLine, {
    points: points,
    props: allOtherPropsWithoutId
  }), points.map((entry, i) => {
    var isActive = activeShape && activeIndex === String(i);
    var option = isActive ? activeShape : shape;
    var symbolProps = _objectSpread(_objectSpread(_objectSpread({
      key: "symbol-".concat(i)
    }, baseProps), entry), {}, {
      [_util_Constants__WEBPACK_IMPORTED_MODULE_22__/* .DATA_ITEM_INDEX_ATTRIBUTE_NAME */ .F0]: i,
      [_util_Constants__WEBPACK_IMPORTED_MODULE_22__/* .DATA_ITEM_DATAKEY_ATTRIBUTE_NAME */ .um]: String(dataKey)
    });
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_2__/* .Layer */ .W
    // eslint-disable-next-line react/no-array-index-key
    , _extends({
      key: "symbol-".concat(entry === null || entry === void 0 ? void 0 : entry.cx, "-").concat(entry === null || entry === void 0 ? void 0 : entry.cy, "-").concat(entry === null || entry === void 0 ? void 0 : entry.size, "-").concat(i),
      className: "recharts-scatter-symbol"
    }, (0,_util_types__WEBPACK_IMPORTED_MODULE_11__/* .adaptEventsOfChild */ .X)(restOfAllOtherProps, entry, i), {
      // @ts-expect-error the types need a bit of attention
      onMouseEnter: onMouseEnterFromContext(entry, i)
      // @ts-expect-error the types need a bit of attention
      ,
      onMouseLeave: onMouseLeaveFromContext(entry, i)
      // @ts-expect-error the types need a bit of attention
      ,
      onClick: onClickFromContext(entry, i)
    }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_util_ScatterUtils__WEBPACK_IMPORTED_MODULE_12__/* .ScatterSymbol */ .N, _extends({
      option: option,
      isActive: isActive
    }, symbolProps)));
  }));
}
function SymbolsWithAnimation(_ref3) {
  var {
    previousPointsRef,
    props
  } = _ref3;
  var {
    points,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing
  } = props;
  var prevPoints = previousPointsRef.current;
  var animationId = (0,_util_useAnimationId__WEBPACK_IMPORTED_MODULE_23__/* .useAnimationId */ .n)(props, 'recharts-scatter-');
  var [isAnimating, setIsAnimating] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  var handleAnimationEnd = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    // Scatter doesn't have onAnimationEnd prop, and if we want to add it we do it here
    // if (typeof onAnimationEnd === 'function') {
    //   onAnimationEnd();
    // }
    setIsAnimating(false);
  }, []);
  var handleAnimationStart = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    // Scatter doesn't have onAnimationStart prop, and if we want to add it we do it here
    // if (typeof onAnimationStart === 'function') {
    //   onAnimationStart();
    // }
    setIsAnimating(true);
  }, []);
  var showLabels = !isAnimating;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ScatterLabelListProvider, {
    showLabels: showLabels,
    points: points
  }, props.children, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_28__/* .JavascriptAnimate */ .J, {
    animationId: animationId,
    begin: animationBegin,
    duration: animationDuration,
    isActive: isAnimationActive,
    easing: animationEasing,
    onAnimationEnd: handleAnimationEnd,
    onAnimationStart: handleAnimationStart,
    key: animationId
  }, t => {
    var stepData = t === 1 ? points : points === null || points === void 0 ? void 0 : points.map((entry, index) => {
      var prev = prevPoints && prevPoints[index];
      if (prev) {
        var interpolatorCx = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_9__/* .interpolateNumber */ .Dj)(prev.cx, entry.cx);
        var interpolatorCy = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_9__/* .interpolateNumber */ .Dj)(prev.cy, entry.cy);
        var interpolatorSize = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_9__/* .interpolateNumber */ .Dj)(prev.size, entry.size);
        return _objectSpread(_objectSpread({}, entry), {}, {
          cx: interpolatorCx(t),
          cy: interpolatorCy(t),
          size: interpolatorSize(t)
        });
      }
      var interpolator = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_9__/* .interpolateNumber */ .Dj)(0, entry.size);
      return _objectSpread(_objectSpread({}, entry), {}, {
        size: interpolator(t)
      });
    });
    if (t > 0) {
      // eslint-disable-next-line no-param-reassign
      previousPointsRef.current = stepData;
    }
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_2__/* .Layer */ .W, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ScatterSymbols, {
      points: stepData,
      allOtherScatterProps: props,
      showLabels: showLabels
    }));
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_3__/* .LabelListFromLabelProp */ .qY, {
    label: props.label
  }));
}
function getTooltipEntrySettings(props) {
  var {
    dataKey,
    points,
    stroke,
    strokeWidth,
    fill,
    name,
    hide,
    tooltipType
  } = props;
  return {
    dataDefinedOnItem: points === null || points === void 0 ? void 0 : points.map(p => p.tooltipPayload),
    positions: points === null || points === void 0 ? void 0 : points.map(p => p.tooltipPosition),
    settings: {
      stroke,
      strokeWidth,
      fill,
      nameKey: undefined,
      dataKey,
      name: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_10__/* .getTooltipNameProp */ .uM)(name, dataKey),
      hide,
      type: tooltipType,
      color: fill,
      unit: '' // why doesn't Scatter support unit?
    }
  };
}
function computeScatterPoints(_ref4) {
  var {
    displayedData,
    xAxis,
    yAxis,
    zAxis,
    scatterSettings,
    xAxisTicks,
    yAxisTicks,
    cells
  } = _ref4;
  var xAxisDataKey = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_9__/* .isNullish */ .uy)(xAxis.dataKey) ? scatterSettings.dataKey : xAxis.dataKey;
  var yAxisDataKey = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_9__/* .isNullish */ .uy)(yAxis.dataKey) ? scatterSettings.dataKey : yAxis.dataKey;
  var zAxisDataKey = zAxis && zAxis.dataKey;
  var defaultRangeZ = zAxis ? zAxis.range : _ZAxis__WEBPACK_IMPORTED_MODULE_6__/* .ZAxis */ .K.defaultProps.range;
  var defaultZ = defaultRangeZ && defaultRangeZ[0];
  var xBandSize = xAxis.scale.bandwidth ? xAxis.scale.bandwidth() : 0;
  var yBandSize = yAxis.scale.bandwidth ? yAxis.scale.bandwidth() : 0;
  return displayedData.map((entry, index) => {
    var x = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_10__/* .getValueByDataKey */ .kr)(entry, xAxisDataKey);
    var y = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_10__/* .getValueByDataKey */ .kr)(entry, yAxisDataKey);
    var z = !(0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_9__/* .isNullish */ .uy)(zAxisDataKey) && (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_10__/* .getValueByDataKey */ .kr)(entry, zAxisDataKey) || '-';
    var tooltipPayload = [{
      // @ts-expect-error name prop should not have dataKey in it
      name: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_9__/* .isNullish */ .uy)(xAxis.dataKey) ? scatterSettings.name : xAxis.name || xAxis.dataKey,
      unit: xAxis.unit || '',
      // @ts-expect-error getValueByDataKey does not validate the output type
      value: x,
      payload: entry,
      dataKey: xAxisDataKey,
      type: scatterSettings.tooltipType
    }, {
      // @ts-expect-error name prop should not have dataKey in it
      name: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_9__/* .isNullish */ .uy)(yAxis.dataKey) ? scatterSettings.name : yAxis.name || yAxis.dataKey,
      unit: yAxis.unit || '',
      // @ts-expect-error getValueByDataKey does not validate the output type
      value: y,
      payload: entry,
      dataKey: yAxisDataKey,
      type: scatterSettings.tooltipType
    }];
    if (z !== '-') {
      tooltipPayload.push({
        // @ts-expect-error name prop should not have dataKey in it
        name: zAxis.name || zAxis.dataKey,
        unit: zAxis.unit || '',
        // @ts-expect-error getValueByDataKey does not validate the output type
        value: z,
        payload: entry,
        dataKey: zAxisDataKey,
        type: scatterSettings.tooltipType
      });
    }
    var cx = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_10__/* .getCateCoordinateOfLine */ .nb)({
      axis: xAxis,
      ticks: xAxisTicks,
      bandSize: xBandSize,
      entry,
      index,
      dataKey: xAxisDataKey
    });
    var cy = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_10__/* .getCateCoordinateOfLine */ .nb)({
      axis: yAxis,
      ticks: yAxisTicks,
      bandSize: yBandSize,
      entry,
      index,
      dataKey: yAxisDataKey
    });
    var size = z !== '-' ? zAxis.scale(z) : defaultZ;
    var radius = Math.sqrt(Math.max(size, 0) / Math.PI);
    return _objectSpread(_objectSpread({}, entry), {}, {
      cx,
      cy,
      x: cx - radius,
      y: cy - radius,
      width: 2 * radius,
      height: 2 * radius,
      size,
      node: {
        x,
        y,
        z
      },
      tooltipPayload,
      tooltipPosition: {
        x: cx,
        y: cy
      },
      payload: entry
    }, cells && cells[index] && cells[index].props);
  });
}
var errorBarDataPointFormatter = (dataPoint, dataKey, direction) => {
  return {
    x: dataPoint.cx,
    y: dataPoint.cy,
    value: direction === 'x' ? +dataPoint.node.x : +dataPoint.node.y,
    // @ts-expect-error getValueByDataKey does not validate the output type
    errorVal: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_10__/* .getValueByDataKey */ .kr)(dataPoint, dataKey)
  };
};
function ScatterWithId(props) {
  var {
    hide,
    points,
    className,
    needClip,
    xAxisId,
    yAxisId,
    id
  } = props;
  var previousPointsRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  if (hide) {
    return null;
  }
  var layerClass = (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-scatter', className);
  var clipPathId = id;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_2__/* .Layer */ .W, {
    className: layerClass,
    clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : null,
    id: id
  }, needClip && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("defs", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_GraphicalItemClipPath__WEBPACK_IMPORTED_MODULE_16__/* .GraphicalItemClipPath */ .Q, {
    clipPathId: clipPathId,
    xAxisId: xAxisId,
    yAxisId: yAxisId
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_ErrorBarContext__WEBPACK_IMPORTED_MODULE_15__/* .SetErrorBarContext */ .zk, {
    xAxisId: xAxisId,
    yAxisId: yAxisId,
    data: points,
    dataPointFormatter: errorBarDataPointFormatter,
    errorBarOffset: 0
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_2__/* .Layer */ .W, {
    key: "recharts-scatter-symbols"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(SymbolsWithAnimation, {
    props: props,
    previousPointsRef: previousPointsRef
  }))));
}
var defaultScatterProps = {
  xAxisId: 0,
  yAxisId: 0,
  zAxisId: 0,
  legendType: 'circle',
  lineType: 'joint',
  lineJointType: 'linear',
  data: [],
  shape: 'circle',
  hide: false,
  isAnimationActive: !_util_Global__WEBPACK_IMPORTED_MODULE_5__/* .Global */ .m.isSsr,
  animationBegin: 0,
  animationDuration: 400,
  animationEasing: 'linear'
};
function ScatterImpl(props) {
  var _resolveDefaultProps = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_24__/* .resolveDefaultProps */ .e)(props, defaultScatterProps),
    {
      animationBegin,
      animationDuration,
      animationEasing,
      hide,
      isAnimationActive,
      legendType,
      lineJointType,
      lineType,
      shape,
      xAxisId,
      yAxisId,
      zAxisId
    } = _resolveDefaultProps,
    everythingElse = _objectWithoutProperties(_resolveDefaultProps, _excluded3);
  var {
    needClip
  } = (0,_GraphicalItemClipPath__WEBPACK_IMPORTED_MODULE_16__/* .useNeedsClip */ .l)(xAxisId, yAxisId);
  var cells = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_util_ReactUtils__WEBPACK_IMPORTED_MODULE_4__/* .findAllByType */ .aS)(props.children, _component_Cell__WEBPACK_IMPORTED_MODULE_8__/* .Cell */ .f), [props.children]);
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_19__/* .useIsPanorama */ .r)();
  var points = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_18__/* .useAppSelector */ .G)(state => {
    return (0,_state_selectors_scatterSelectors__WEBPACK_IMPORTED_MODULE_17__/* .selectScatterPoints */ .W)(state, xAxisId, yAxisId, zAxisId, props.id, cells, isPanorama);
  });
  if (needClip == null) {
    return null;
  }
  if (points == null) {
    return null;
  }
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_14__/* .SetTooltipEntrySettings */ .r, {
    fn: getTooltipEntrySettings,
    args: _objectSpread(_objectSpread({}, props), {}, {
      points
    })
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ScatterWithId, _extends({}, everythingElse, {
    xAxisId: xAxisId,
    yAxisId: yAxisId,
    zAxisId: zAxisId,
    lineType: lineType,
    lineJointType: lineJointType,
    legendType: legendType,
    shape: shape,
    hide: hide,
    isAnimationActive: isAnimationActive,
    animationBegin: animationBegin,
    animationDuration: animationDuration,
    animationEasing: animationEasing,
    points: points,
    needClip: needClip
  })));
}
function ScatterFn(outsideProps) {
  var props = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_24__/* .resolveDefaultProps */ .e)(outsideProps, defaultScatterProps);
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_19__/* .useIsPanorama */ .r)();
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_RegisterGraphicalItemId__WEBPACK_IMPORTED_MODULE_25__/* .RegisterGraphicalItemId */ .x, {
    id: props.id,
    type: "scatter"
  }, id => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetLegendPayload__WEBPACK_IMPORTED_MODULE_21__/* .SetLegendPayload */ .A, {
    legendPayload: computeLegendPayloadFromScatterProps(props)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetGraphicalItem__WEBPACK_IMPORTED_MODULE_26__/* .SetCartesianGraphicalItem */ .p, {
    type: "scatter",
    id: id,
    data: props.data,
    xAxisId: props.xAxisId,
    yAxisId: props.yAxisId,
    zAxisId: props.zAxisId,
    dataKey: props.dataKey,
    hide: props.hide,
    name: props.name,
    tooltipType: props.tooltipType,
    isPanorama: isPanorama
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ScatterImpl, _extends({}, props, {
    id: id
  }))));
}
var Scatter = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.memo(ScatterFn);
Scatter.displayName = 'Scatter';

/***/ }),

/***/ 23495:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   h: () => (/* binding */ YAxis)
/* harmony export */ });
/* unused harmony export yAxisDefaultProps */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _CartesianAxis__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(99582);
/* harmony import */ var _state_cartesianAxisSlice__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(94115);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(49082);
/* harmony import */ var _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(11114);
/* harmony import */ var _state_selectors_selectChartOffsetInternal__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(36189);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(12070);
/* harmony import */ var _component_Label__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(91706);
/* harmony import */ var _util_ShallowEqual__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(23521);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(77404);
var _excluded = ["dangerouslySetInnerHTML", "ticks"],
  _excluded2 = ["id"],
  _excluded3 = ["domain"],
  _excluded4 = ["domain"];
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }












function SetYAxisSettings(settings) {
  var dispatch = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_4__/* .useAppDispatch */ .j)();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    dispatch((0,_state_cartesianAxisSlice__WEBPACK_IMPORTED_MODULE_3__/* .addYAxis */ .cU)(settings));
    return () => {
      dispatch((0,_state_cartesianAxisSlice__WEBPACK_IMPORTED_MODULE_3__/* .removeYAxis */ .fR)(settings));
    };
  }, [settings, dispatch]);
  return null;
}
var YAxisImpl = props => {
  var {
    yAxisId,
    className,
    width,
    label
  } = props;
  var cartesianAxisRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  var labelRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  var viewBox = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_4__/* .useAppSelector */ .G)(_state_selectors_selectChartOffsetInternal__WEBPACK_IMPORTED_MODULE_6__/* .selectAxisViewBox */ .c2);
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_7__/* .useIsPanorama */ .r)();
  var dispatch = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_4__/* .useAppDispatch */ .j)();
  var axisType = 'yAxis';
  var scale = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_4__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .selectAxisScale */ .iV)(state, axisType, yAxisId, isPanorama));
  var axisSize = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_4__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .selectYAxisSize */ .wP)(state, yAxisId));
  var position = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_4__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .selectYAxisPosition */ .KR)(state, yAxisId));
  var cartesianTickItems = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_4__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .selectTicksOfAxis */ .Zi)(state, axisType, yAxisId, isPanorama));
  /*
   * Here we select settings from the store and prefer to use them instead of the actual props
   * so that the chart is consistent. If we used the props directly, some components will use axis settings
   * from state and some from props and because there is a render step between these two, they might be showing different things.
   * https://github.com/recharts/recharts/issues/6257
   */
  var synchronizedSettings = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_4__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .selectYAxisSettingsNoDefaults */ .hc)(state, yAxisId));
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    // No dynamic width calculation is done when width !== 'auto'
    // or when a function/react element is used for label
    if (width !== 'auto' || !axisSize || (0,_component_Label__WEBPACK_IMPORTED_MODULE_8__/* .isLabelContentAFunction */ .ZY)(label) || /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.isValidElement)(label) || synchronizedSettings == null) {
      return;
    }
    var axisComponent = cartesianAxisRef.current;
    if (!axisComponent) {
      return;
    }
    var updatedYAxisWidth = axisComponent.getCalculatedWidth();

    // if the width has changed, dispatch an action to update the width
    if (Math.round(axisSize.width) !== Math.round(updatedYAxisWidth)) {
      dispatch((0,_state_cartesianAxisSlice__WEBPACK_IMPORTED_MODULE_3__/* .updateYAxisWidth */ .QG)({
        id: yAxisId,
        width: updatedYAxisWidth
      }));
    }
  }, [
  // The dependency on cartesianAxisRef.current is not needed because useLayoutEffect will run after every render.
  // The ref will be populated by then.
  // To re-run this effect when ticks change, we can depend on the ticks array from the store.
  cartesianTickItems, axisSize, dispatch, label, yAxisId, width, synchronizedSettings]);
  if (axisSize == null || position == null || synchronizedSettings == null) {
    return null;
  }
  var {
      dangerouslySetInnerHTML,
      ticks
    } = props,
    allOtherProps = _objectWithoutProperties(props, _excluded);
  var {
      id
    } = synchronizedSettings,
    restSynchronizedSettings = _objectWithoutProperties(synchronizedSettings, _excluded2);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_CartesianAxis__WEBPACK_IMPORTED_MODULE_2__/* .CartesianAxis */ .u, _extends({}, allOtherProps, restSynchronizedSettings, {
    ref: cartesianAxisRef,
    labelRef: labelRef,
    scale: scale,
    x: position.x,
    y: position.y,
    tickTextProps: width === 'auto' ? {
      width: undefined
    } : {
      width
    },
    width: axisSize.width,
    height: axisSize.height,
    className: (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)("recharts-".concat(axisType, " ").concat(axisType), className),
    viewBox: viewBox,
    ticks: cartesianTickItems
  }));
};
var yAxisDefaultProps = {
  allowDataOverflow: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitYAxis */ .cd.allowDataOverflow,
  allowDecimals: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitYAxis */ .cd.allowDecimals,
  allowDuplicatedCategory: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitYAxis */ .cd.allowDuplicatedCategory,
  hide: false,
  mirror: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitYAxis */ .cd.mirror,
  orientation: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitYAxis */ .cd.orientation,
  padding: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitYAxis */ .cd.padding,
  reversed: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitYAxis */ .cd.reversed,
  scale: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitYAxis */ .cd.scale,
  tickCount: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitYAxis */ .cd.tickCount,
  type: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitYAxis */ .cd.type,
  width: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitYAxis */ .cd.width,
  yAxisId: 0
};
var YAxisSettingsDispatcher = outsideProps => {
  var _props$interval, _props$includeHidden, _props$angle, _props$minTickGap, _props$tick;
  var props = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_10__/* .resolveDefaultProps */ .e)(outsideProps, yAxisDefaultProps);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(SetYAxisSettings, {
    interval: (_props$interval = props.interval) !== null && _props$interval !== void 0 ? _props$interval : 'preserveEnd',
    id: props.yAxisId,
    scale: props.scale,
    type: props.type,
    domain: props.domain,
    allowDataOverflow: props.allowDataOverflow,
    dataKey: props.dataKey,
    allowDuplicatedCategory: props.allowDuplicatedCategory,
    allowDecimals: props.allowDecimals,
    tickCount: props.tickCount,
    padding: props.padding,
    includeHidden: (_props$includeHidden = props.includeHidden) !== null && _props$includeHidden !== void 0 ? _props$includeHidden : false,
    reversed: props.reversed,
    ticks: props.ticks,
    width: props.width,
    orientation: props.orientation,
    mirror: props.mirror,
    hide: props.hide,
    unit: props.unit,
    name: props.name,
    angle: (_props$angle = props.angle) !== null && _props$angle !== void 0 ? _props$angle : 0,
    minTickGap: (_props$minTickGap = props.minTickGap) !== null && _props$minTickGap !== void 0 ? _props$minTickGap : 5,
    tick: (_props$tick = props.tick) !== null && _props$tick !== void 0 ? _props$tick : true,
    tickFormatter: props.tickFormatter
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(YAxisImpl, props));
};
var YAxisMemoComparator = (prevProps, nextProps) => {
  var {
      domain: prevDomain
    } = prevProps,
    prevRest = _objectWithoutProperties(prevProps, _excluded3);
  var {
      domain: nextDomain
    } = nextProps,
    nextRest = _objectWithoutProperties(nextProps, _excluded4);
  if (!(0,_util_ShallowEqual__WEBPACK_IMPORTED_MODULE_9__/* .shallowEqual */ .b)(prevRest, nextRest)) {
    return false;
  }
  if (Array.isArray(prevDomain) && prevDomain.length === 2 && Array.isArray(nextDomain) && nextDomain.length === 2) {
    return prevDomain[0] === nextDomain[0] && prevDomain[1] === nextDomain[1];
  }
  return (0,_util_ShallowEqual__WEBPACK_IMPORTED_MODULE_9__/* .shallowEqual */ .b)({
    domain: prevDomain
  }, {
    domain: nextDomain
  });
};
var YAxis = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.memo(YAxisSettingsDispatcher, YAxisMemoComparator);
YAxis.displayName = 'YAxis';

/***/ }),

/***/ 45373:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony export ReferenceDot */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(86069);
/* harmony import */ var _shape_Dot__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(66613);
/* harmony import */ var _component_Label__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(91706);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(59744);
/* harmony import */ var _util_CartesianUtils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(15894);
/* harmony import */ var _state_referenceElementsSlice__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(26314);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(49082);
/* harmony import */ var _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(11114);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(12070);
/* harmony import */ var _container_ClipPathProvider__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(84518);
/* harmony import */ var _util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(80196);
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }














var useCoordinate = (x, y, xAxisId, yAxisId, ifOverflow) => {
  var isX = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .isNumOrStr */ .vh)(x);
  var isY = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .isNumOrStr */ .vh)(y);
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_10__/* .useIsPanorama */ .r)();
  var xAxisScale = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_8__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_9__/* .selectAxisScale */ .iV)(state, 'xAxis', xAxisId, isPanorama));
  var yAxisScale = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_8__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_9__/* .selectAxisScale */ .iV)(state, 'yAxis', yAxisId, isPanorama));
  if (!isX || !isY || xAxisScale == null || yAxisScale == null) {
    return null;
  }
  var scales = (0,_util_CartesianUtils__WEBPACK_IMPORTED_MODULE_6__/* .createLabeledScales */ .P2)({
    x: xAxisScale,
    y: yAxisScale
  });
  var result = scales.apply({
    x,
    y
  }, {
    bandAware: true
  });
  if (ifOverflow === 'discard' && !scales.isInRange(result)) {
    return null;
  }
  return result;
};
function ReportReferenceDot(props) {
  var dispatch = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_8__/* .useAppDispatch */ .j)();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    dispatch((0,_state_referenceElementsSlice__WEBPACK_IMPORTED_MODULE_7__/* .addDot */ .$6)(props));
    return () => {
      dispatch((0,_state_referenceElementsSlice__WEBPACK_IMPORTED_MODULE_7__/* .removeDot */ .sP)(props));
    };
  });
  return null;
}
var renderDot = (option, props) => {
  var dot;
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(option)) {
    // @ts-expect-error element cloning is not typed
    dot = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(option, props);
  } else if (typeof option === 'function') {
    dot = option(props);
  } else {
    dot = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Dot__WEBPACK_IMPORTED_MODULE_3__/* .Dot */ .c, _extends({}, props, {
      cx: props.cx,
      cy: props.cy,
      className: "recharts-reference-dot-dot"
    }));
  }
  return dot;
};
function ReferenceDotImpl(props) {
  var {
    x,
    y,
    r
  } = props;
  var clipPathId = (0,_container_ClipPathProvider__WEBPACK_IMPORTED_MODULE_11__/* .useClipPathId */ .Y)();
  var coordinate = useCoordinate(x, y, props.xAxisId, props.yAxisId, props.ifOverflow);
  if (!coordinate) {
    return null;
  }
  var {
    x: cx,
    y: cy
  } = coordinate;
  var {
    shape,
    className,
    ifOverflow
  } = props;
  var clipPath = ifOverflow === 'hidden' ? "url(#".concat(clipPathId, ")") : undefined;
  var dotProps = _objectSpread(_objectSpread({
    clipPath
  }, (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_12__/* .svgPropertiesAndEvents */ .a)(props)), {}, {
    cx,
    cy
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_2__/* .Layer */ .W, {
    className: (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-reference-dot', className)
  }, renderDot(shape, dotProps), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_Label__WEBPACK_IMPORTED_MODULE_4__/* .CartesianLabelContextProvider */ .zJ, {
    x: cx - r,
    y: cy - r,
    width: 2 * r,
    height: 2 * r
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_Label__WEBPACK_IMPORTED_MODULE_4__/* .CartesianLabelFromLabelProp */ ._I, {
    label: props.label
  }), props.children));
}
function ReferenceDotSettingsDispatcher(props) {
  var {
    x,
    y,
    r,
    ifOverflow,
    yAxisId,
    xAxisId
  } = props;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ReportReferenceDot, {
    y: y,
    x: x,
    r: r,
    yAxisId: yAxisId,
    xAxisId: xAxisId,
    ifOverflow: ifOverflow
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ReferenceDotImpl, props));
}

// eslint-disable-next-line react/prefer-stateless-function
class ReferenceDot extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
  render() {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ReferenceDotSettingsDispatcher, this.props);
  }
}
_defineProperty(ReferenceDot, "displayName", 'ReferenceDot');
_defineProperty(ReferenceDot, "defaultProps", {
  ifOverflow: 'discard',
  xAxisId: 0,
  yAxisId: 0,
  r: 10,
  fill: '#fff',
  stroke: '#ccc',
  fillOpacity: 1,
  strokeWidth: 1
});

/***/ }),

/***/ 51658:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   K: () => (/* binding */ ZAxis)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var _state_cartesianAxisSlice__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(94115);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(49082);
/* harmony import */ var _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(11114);
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }





function SetZAxisSettings(settings) {
  var dispatch = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_2__/* .useAppDispatch */ .j)();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    dispatch((0,_state_cartesianAxisSlice__WEBPACK_IMPORTED_MODULE_1__/* .addZAxis */ .D4)(settings));
    return () => {
      dispatch((0,_state_cartesianAxisSlice__WEBPACK_IMPORTED_MODULE_1__/* .removeZAxis */ .Gc)(settings));
    };
  }, [settings, dispatch]);
  return null;
}
// eslint-disable-next-line react/prefer-stateless-function
class ZAxis extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
  render() {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(SetZAxisSettings, {
      domain: this.props.domain,
      id: this.props.zAxisId,
      dataKey: this.props.dataKey,
      name: this.props.name,
      unit: this.props.unit,
      range: this.props.range,
      scale: this.props.scale,
      type: this.props.type,
      allowDuplicatedCategory: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_3__/* .implicitZAxis */ .N8.allowDuplicatedCategory,
      allowDataOverflow: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_3__/* .implicitZAxis */ .N8.allowDataOverflow,
      reversed: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_3__/* .implicitZAxis */ .N8.reversed,
      includeHidden: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_3__/* .implicitZAxis */ .N8.includeHidden
    });
  }
}
_defineProperty(ZAxis, "displayName", 'ZAxis');
_defineProperty(ZAxis, "defaultProps", {
  zAxisId: 0,
  range: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_3__/* .implicitZAxis */ .N8.range,
  scale: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_3__/* .implicitZAxis */ .N8.scale,
  type: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_3__/* .implicitZAxis */ .N8.type
});

/***/ }),

/***/ 57158:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony exports getEndPoints, ReferenceLine */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(86069);
/* harmony import */ var _component_Label__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(91706);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(59744);
/* harmony import */ var _util_CartesianUtils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(15894);
/* harmony import */ var _context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(19287);
/* harmony import */ var _state_referenceElementsSlice__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(26314);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(49082);
/* harmony import */ var _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(11114);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(12070);
/* harmony import */ var _container_ClipPathProvider__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(84518);
/* harmony import */ var _util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(80196);
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * @fileOverview Reference Line
 */















/**
 * This excludes `viewBox` prop from svg for two reasons:
 * 1. The components wants viewBox of object type, and svg wants string
 *    - so there's a conflict, and the component will throw if it gets string
 * 2. Internally the component calls `svgPropertiesNoEvents` which filters the viewBox away anyway
 */

var renderLine = (option, props) => {
  var line;
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(option)) {
    // @ts-expect-error element cloning is not typed
    line = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(option, props);
  } else if (typeof option === 'function') {
    line = option(props);
  } else {
    line = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("line", _extends({}, props, {
      className: "recharts-reference-line-line"
    }));
  }
  return line;
};
// TODO: ScaleHelper
var getEndPoints = (scales, isFixedX, isFixedY, isSegment, viewBox, position, xAxisOrientation, yAxisOrientation, props) => {
  var {
    x,
    y,
    width,
    height
  } = viewBox;
  if (isFixedY) {
    var {
      y: yCoord
    } = props;
    var coord = scales.y.apply(yCoord, {
      position
    });
    // don't render the line if the scale can't compute a result that makes sense
    if ((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_4__/* .isNan */ .M8)(coord)) return null;
    if (props.ifOverflow === 'discard' && !scales.y.isInRange(coord)) {
      return null;
    }
    var points = [{
      x: x + width,
      y: coord
    }, {
      x,
      y: coord
    }];
    return yAxisOrientation === 'left' ? points.reverse() : points;
  }
  if (isFixedX) {
    var {
      x: xCoord
    } = props;
    var _coord = scales.x.apply(xCoord, {
      position
    });
    // don't render the line if the scale can't compute a result that makes sense
    if ((0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_4__/* .isNan */ .M8)(_coord)) return null;
    if (props.ifOverflow === 'discard' && !scales.x.isInRange(_coord)) {
      return null;
    }
    var _points = [{
      x: _coord,
      y: y + height
    }, {
      x: _coord,
      y
    }];
    return xAxisOrientation === 'top' ? _points.reverse() : _points;
  }
  if (isSegment) {
    var {
      segment
    } = props;
    var _points2 = segment.map(p => scales.apply(p, {
      position
    }));
    if (props.ifOverflow === 'discard' && _points2.some(p => !scales.isInRange(p))) {
      return null;
    }
    return _points2;
  }
  return null;
};
function ReportReferenceLine(props) {
  var dispatch = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_8__/* .useAppDispatch */ .j)();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    dispatch((0,_state_referenceElementsSlice__WEBPACK_IMPORTED_MODULE_7__/* .addLine */ .cG)(props));
    return () => {
      dispatch((0,_state_referenceElementsSlice__WEBPACK_IMPORTED_MODULE_7__/* .removeLine */ .hj)(props));
    };
  });
  return null;
}
function ReferenceLineImpl(props) {
  var {
    x: fixedX,
    y: fixedY,
    segment,
    xAxisId,
    yAxisId,
    shape,
    className,
    ifOverflow
  } = props;
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_10__/* .useIsPanorama */ .r)();
  var clipPathId = (0,_container_ClipPathProvider__WEBPACK_IMPORTED_MODULE_11__/* .useClipPathId */ .Y)();
  var xAxis = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_8__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_9__/* .selectXAxisSettings */ .Rl)(state, xAxisId));
  var yAxis = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_8__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_9__/* .selectYAxisSettings */ .sf)(state, yAxisId));
  var xAxisScale = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_8__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_9__/* .selectAxisScale */ .iV)(state, 'xAxis', xAxisId, isPanorama));
  var yAxisScale = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_8__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_9__/* .selectAxisScale */ .iV)(state, 'yAxis', yAxisId, isPanorama));
  var viewBox = (0,_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_6__/* .useViewBox */ .sk)();
  var isFixedX = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_4__/* .isNumOrStr */ .vh)(fixedX);
  var isFixedY = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_4__/* .isNumOrStr */ .vh)(fixedY);
  if (!clipPathId || !viewBox || xAxis == null || yAxis == null || xAxisScale == null || yAxisScale == null) {
    return null;
  }
  var scales = (0,_util_CartesianUtils__WEBPACK_IMPORTED_MODULE_5__/* .createLabeledScales */ .P2)({
    x: xAxisScale,
    y: yAxisScale
  });
  var isSegment = segment && segment.length === 2;
  var endPoints = getEndPoints(scales, isFixedX, isFixedY, isSegment, viewBox, props.position, xAxis.orientation, yAxis.orientation, props);
  if (!endPoints) {
    return null;
  }
  var [{
    x: x1,
    y: y1
  }, {
    x: x2,
    y: y2
  }] = endPoints;
  var clipPath = ifOverflow === 'hidden' ? "url(#".concat(clipPathId, ")") : undefined;
  var lineProps = _objectSpread(_objectSpread({
    clipPath
  }, (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_12__/* .svgPropertiesAndEvents */ .a)(props)), {}, {
    x1,
    y1,
    x2,
    y2
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_2__/* .Layer */ .W, {
    className: (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-reference-line', className)
  }, renderLine(shape, lineProps), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_Label__WEBPACK_IMPORTED_MODULE_3__/* .CartesianLabelContextProvider */ .zJ, (0,_util_CartesianUtils__WEBPACK_IMPORTED_MODULE_5__/* .rectWithCoords */ .vh)({
    x1,
    y1,
    x2,
    y2
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_Label__WEBPACK_IMPORTED_MODULE_3__/* .CartesianLabelFromLabelProp */ ._I, {
    label: props.label
  }), props.children));
}
function ReferenceLineSettingsDispatcher(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ReportReferenceLine, {
    yAxisId: props.yAxisId,
    xAxisId: props.xAxisId,
    ifOverflow: props.ifOverflow,
    x: props.x,
    y: props.y
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ReferenceLineImpl, props));
}

// eslint-disable-next-line react/prefer-stateless-function
class ReferenceLine extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
  render() {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ReferenceLineSettingsDispatcher, this.props);
  }
}
_defineProperty(ReferenceLine, "displayName", 'ReferenceLine');
_defineProperty(ReferenceLine, "defaultProps", {
  ifOverflow: 'discard',
  xAxisId: 0,
  yAxisId: 0,
  fill: 'none',
  stroke: '#ccc',
  fillOpacity: 1,
  strokeWidth: 1,
  position: 'middle'
});

/***/ }),

/***/ 77984:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   W: () => (/* binding */ XAxis)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _CartesianAxis__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(99582);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(49082);
/* harmony import */ var _state_cartesianAxisSlice__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(94115);
/* harmony import */ var _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(11114);
/* harmony import */ var _state_selectors_selectChartOffsetInternal__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(36189);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(12070);
/* harmony import */ var _util_ShallowEqual__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(23521);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(77404);
var _excluded = ["dangerouslySetInnerHTML", "ticks"],
  _excluded2 = ["id"],
  _excluded3 = ["domain"],
  _excluded4 = ["domain"];
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
/**
 * @fileOverview X Axis
 */











function SetXAxisSettings(settings) {
  var dispatch = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_3__/* .useAppDispatch */ .j)();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect)(() => {
    dispatch((0,_state_cartesianAxisSlice__WEBPACK_IMPORTED_MODULE_4__/* .addXAxis */ .Vi)(settings));
    return () => {
      dispatch((0,_state_cartesianAxisSlice__WEBPACK_IMPORTED_MODULE_4__/* .removeXAxis */ .MC)(settings));
    };
  }, [settings, dispatch]);
  return null;
}
var XAxisImpl = props => {
  var {
    xAxisId,
    className
  } = props;
  var viewBox = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_3__/* .useAppSelector */ .G)(_state_selectors_selectChartOffsetInternal__WEBPACK_IMPORTED_MODULE_6__/* .selectAxisViewBox */ .c2);
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_7__/* .useIsPanorama */ .r)();
  var axisType = 'xAxis';
  var scale = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_3__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .selectAxisScale */ .iV)(state, axisType, xAxisId, isPanorama));
  var cartesianTickItems = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_3__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .selectTicksOfAxis */ .Zi)(state, axisType, xAxisId, isPanorama));
  var axisSize = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_3__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .selectXAxisSize */ .Lw)(state, xAxisId));
  var position = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_3__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .selectXAxisPosition */ .L$)(state, xAxisId));
  /*
   * Here we select settings from the store and prefer to use them instead of the actual props
   * so that the chart is consistent. If we used the props directly, some components will use axis settings
   * from state and some from props and because there is a render step between these two, they might be showing different things.
   * https://github.com/recharts/recharts/issues/6257
   */
  var synchronizedSettings = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_3__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .selectXAxisSettingsNoDefaults */ .y7)(state, xAxisId));
  if (axisSize == null || position == null || synchronizedSettings == null) {
    return null;
  }
  var {
      dangerouslySetInnerHTML,
      ticks
    } = props,
    allOtherProps = _objectWithoutProperties(props, _excluded);
  var {
      id
    } = synchronizedSettings,
    restSynchronizedSettings = _objectWithoutProperties(synchronizedSettings, _excluded2);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_CartesianAxis__WEBPACK_IMPORTED_MODULE_2__/* .CartesianAxis */ .u, _extends({}, allOtherProps, restSynchronizedSettings, {
    scale: scale,
    x: position.x,
    y: position.y,
    width: axisSize.width,
    height: axisSize.height,
    className: (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)("recharts-".concat(axisType, " ").concat(axisType), className),
    viewBox: viewBox,
    ticks: cartesianTickItems
  }));
};
var xAxisDefaultProps = {
  allowDataOverflow: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitXAxis */ .PU.allowDataOverflow,
  allowDecimals: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitXAxis */ .PU.allowDecimals,
  allowDuplicatedCategory: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitXAxis */ .PU.allowDuplicatedCategory,
  height: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitXAxis */ .PU.height,
  hide: false,
  mirror: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitXAxis */ .PU.mirror,
  orientation: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitXAxis */ .PU.orientation,
  padding: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitXAxis */ .PU.padding,
  reversed: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitXAxis */ .PU.reversed,
  scale: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitXAxis */ .PU.scale,
  tickCount: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitXAxis */ .PU.tickCount,
  type: _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_5__/* .implicitXAxis */ .PU.type,
  xAxisId: 0
};
var XAxisSettingsDispatcher = outsideProps => {
  var _props$interval, _props$includeHidden, _props$angle, _props$minTickGap, _props$tick;
  var props = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_9__/* .resolveDefaultProps */ .e)(outsideProps, xAxisDefaultProps);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(SetXAxisSettings, {
    interval: (_props$interval = props.interval) !== null && _props$interval !== void 0 ? _props$interval : 'preserveEnd',
    id: props.xAxisId,
    scale: props.scale,
    type: props.type,
    padding: props.padding,
    allowDataOverflow: props.allowDataOverflow,
    domain: props.domain,
    dataKey: props.dataKey,
    allowDuplicatedCategory: props.allowDuplicatedCategory,
    allowDecimals: props.allowDecimals,
    tickCount: props.tickCount,
    includeHidden: (_props$includeHidden = props.includeHidden) !== null && _props$includeHidden !== void 0 ? _props$includeHidden : false,
    reversed: props.reversed,
    ticks: props.ticks,
    height: props.height,
    orientation: props.orientation,
    mirror: props.mirror,
    hide: props.hide,
    unit: props.unit,
    name: props.name,
    angle: (_props$angle = props.angle) !== null && _props$angle !== void 0 ? _props$angle : 0,
    minTickGap: (_props$minTickGap = props.minTickGap) !== null && _props$minTickGap !== void 0 ? _props$minTickGap : 5,
    tick: (_props$tick = props.tick) !== null && _props$tick !== void 0 ? _props$tick : true,
    tickFormatter: props.tickFormatter
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(XAxisImpl, props));
};
var XAxisMemoComparator = (prevProps, nextProps) => {
  var {
      domain: prevDomain
    } = prevProps,
    prevRest = _objectWithoutProperties(prevProps, _excluded3);
  var {
      domain: nextDomain
    } = nextProps,
    nextRest = _objectWithoutProperties(nextProps, _excluded4);
  if (!(0,_util_ShallowEqual__WEBPACK_IMPORTED_MODULE_8__/* .shallowEqual */ .b)(prevRest, nextRest)) {
    return false;
  }
  if (Array.isArray(prevDomain) && prevDomain.length === 2 && Array.isArray(nextDomain) && nextDomain.length === 2) {
    return prevDomain[0] === nextDomain[0] && prevDomain[1] === nextDomain[1];
  }
  return (0,_util_ShallowEqual__WEBPACK_IMPORTED_MODULE_8__/* .shallowEqual */ .b)({
    domain: prevDomain
  }, {
    domain: nextDomain
  });
};
var XAxis = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.memo(XAxisSettingsDispatcher, XAxisMemoComparator);
XAxis.displayName = 'XAxis';

/***/ }),

/***/ 86279:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   N: () => (/* binding */ Line),
/* harmony export */   l: () => (/* binding */ computeLinePoints)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _shape_Curve__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(45249);
/* harmony import */ var _shape_Dot__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(66613);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(86069);
/* harmony import */ var _component_LabelList__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(5614);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(59744);
/* harmony import */ var _util_ReactUtils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(94501);
/* harmony import */ var _util_Global__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(59938);
/* harmony import */ var _util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(33964);
/* harmony import */ var _component_ActivePoints__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(85695);
/* harmony import */ var _state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(59482);
/* harmony import */ var _context_ErrorBarContext__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(5298);
/* harmony import */ var _GraphicalItemClipPath__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(31754);
/* harmony import */ var _context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(19287);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(12070);
/* harmony import */ var _state_selectors_lineSelectors__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(44747);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(49082);
/* harmony import */ var _state_SetLegendPayload__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(19797);
/* harmony import */ var _util_useAnimationId__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(8107);
/* harmony import */ var _util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(77404);
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(33092);
/* harmony import */ var _context_RegisterGraphicalItemId__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(84044);
/* harmony import */ var _state_SetGraphicalItem__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(42678);
/* harmony import */ var _util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(55448);
/* harmony import */ var _animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(31528);
/* harmony import */ var _util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(80196);
/* harmony import */ var _util_getRadiusAndStrokeWidthFromDot__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(99989);
var _excluded = ["id"],
  _excluded2 = ["type", "layout", "connectNulls", "needClip"],
  _excluded3 = ["activeDot", "animateNewValues", "animationBegin", "animationDuration", "animationEasing", "connectNulls", "dot", "hide", "isAnimationActive", "label", "legendType", "xAxisId", "yAxisId", "id"];
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }






























/**
 * Internal props, combination of external props + defaultProps + private Recharts state
 */

/**
 * External props, intended for end users to fill in
 */

/**
 * Because of naming conflict, we are forced to ignore certain (valid) SVG attributes.
 */

var computeLegendPayloadFromAreaData = props => {
  var {
    dataKey,
    name,
    stroke,
    legendType,
    hide
  } = props;
  return [{
    inactive: hide,
    dataKey,
    type: legendType,
    color: stroke,
    value: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getTooltipNameProp */ .uM)(name, dataKey),
    payload: props
  }];
};
function getTooltipEntrySettings(props) {
  var {
    dataKey,
    data,
    stroke,
    strokeWidth,
    fill,
    name,
    hide,
    unit
  } = props;
  return {
    dataDefinedOnItem: data,
    positions: undefined,
    settings: {
      stroke,
      strokeWidth,
      fill,
      dataKey,
      nameKey: undefined,
      name: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getTooltipNameProp */ .uM)(name, dataKey),
      hide,
      type: props.tooltipType,
      color: props.stroke,
      unit
    }
  };
}
var generateSimpleStrokeDasharray = (totalLength, length) => {
  return "".concat(length, "px ").concat(totalLength - length, "px");
};
function repeat(lines, count) {
  var linesUnit = lines.length % 2 !== 0 ? [...lines, 0] : lines;
  var result = [];
  for (var i = 0; i < count; ++i) {
    result = [...result, ...linesUnit];
  }
  return result;
}
var getStrokeDasharray = (length, totalLength, lines) => {
  var lineLength = lines.reduce((pre, next) => pre + next);

  // if lineLength is 0 return the default when no strokeDasharray is provided
  if (!lineLength) {
    return generateSimpleStrokeDasharray(totalLength, length);
  }
  var count = Math.floor(length / lineLength);
  var remainLength = length % lineLength;
  var restLength = totalLength - length;
  var remainLines = [];
  for (var i = 0, sum = 0; i < lines.length; sum += lines[i], ++i) {
    if (sum + lines[i] > remainLength) {
      remainLines = [...lines.slice(0, i), remainLength - sum];
      break;
    }
  }
  var emptyLines = remainLines.length % 2 === 0 ? [0, restLength] : [restLength];
  return [...repeat(lines, count), ...remainLines, ...emptyLines].map(line => "".concat(line, "px")).join(', ');
};
function renderDotItem(option, props) {
  var dotItem;
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(option)) {
    // @ts-expect-error when cloning, the event handler types do not match
    dotItem = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(option, props);
  } else if (typeof option === 'function') {
    dotItem = option(props);
  } else {
    var className = (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-line-dot', typeof option !== 'boolean' ? option.className : '');
    dotItem = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Dot__WEBPACK_IMPORTED_MODULE_3__/* .Dot */ .c, _extends({}, props, {
      className: className
    }));
  }
  return dotItem;
}
function shouldRenderDots(points, dot) {
  if (points == null) {
    return false;
  }
  if (dot) {
    return true;
  }
  return points.length === 1;
}
function Dots(_ref) {
  var {
    clipPathId,
    points,
    props
  } = _ref;
  var {
    dot,
    dataKey,
    needClip
  } = props;
  if (!shouldRenderDots(points, dot)) {
    return null;
  }

  /*
   * Exclude ID from the props passed to the Dots component
   * because then the ID would be applied to multiple dots, and it would no longer be unique.
   */
  var {
      id
    } = props,
    propsWithoutId = _objectWithoutProperties(props, _excluded);
  var clipDot = (0,_util_ReactUtils__WEBPACK_IMPORTED_MODULE_7__/* .isClipDot */ .y$)(dot);
  var lineProps = (0,_util_svgPropertiesNoEvents__WEBPACK_IMPORTED_MODULE_24__/* .svgPropertiesNoEvents */ .uZ)(propsWithoutId);
  var customDotProps = (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_26__/* .svgPropertiesAndEventsFromUnknown */ .y)(dot);
  var dots = points.map((entry, i) => {
    var dotProps = _objectSpread(_objectSpread(_objectSpread({
      key: "dot-".concat(i),
      r: 3
    }, lineProps), customDotProps), {}, {
      index: i,
      cx: entry.x,
      cy: entry.y,
      dataKey,
      value: entry.value,
      payload: entry.payload,
      // @ts-expect-error we're passing extra property 'points' that the props are not expecting
      points
    });
    return renderDotItem(dot, dotProps);
  });
  var dotsProps = {
    clipPath: needClip ? "url(#clipPath-".concat(clipDot ? '' : 'dots-').concat(clipPathId, ")") : undefined
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_4__/* .Layer */ .W, _extends({
    className: "recharts-line-dots",
    key: "dots"
  }, dotsProps), dots);
}
function LineLabelListProvider(_ref2) {
  var {
    showLabels,
    children,
    points
  } = _ref2;
  var labelListEntries = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    return points === null || points === void 0 ? void 0 : points.map(point => {
      var viewBox = {
        x: point.x,
        y: point.y,
        width: 0,
        height: 0
      };
      return _objectSpread(_objectSpread({}, viewBox), {}, {
        value: point.value,
        payload: point.payload,
        viewBox,
        /*
         * Line is not passing parentViewBox to the LabelList so the labels can escape - looks like a bug, should we pass parentViewBox?
         * Or should this just be the root chart viewBox?
         */
        parentViewBox: undefined,
        fill: undefined
      });
    });
  }, [points]);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_5__/* .CartesianLabelListContextProvider */ .h8, {
    value: showLabels ? labelListEntries : null
  }, children);
}
function StaticCurve(_ref3) {
  var {
    clipPathId,
    pathRef,
    points,
    strokeDasharray,
    props
  } = _ref3;
  var {
      type,
      layout,
      connectNulls,
      needClip
    } = props,
    others = _objectWithoutProperties(props, _excluded2);
  var curveProps = _objectSpread(_objectSpread({}, (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_26__/* .svgPropertiesAndEvents */ .a)(others)), {}, {
    fill: 'none',
    className: 'recharts-line-curve',
    clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : undefined,
    points,
    type,
    layout,
    connectNulls,
    strokeDasharray: strokeDasharray !== null && strokeDasharray !== void 0 ? strokeDasharray : props.strokeDasharray
  });
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (points === null || points === void 0 ? void 0 : points.length) > 1 && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Curve__WEBPACK_IMPORTED_MODULE_2__/* .Curve */ .I, _extends({}, curveProps, {
    pathRef: pathRef
  })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(Dots, {
    points: points,
    clipPathId: clipPathId,
    props: props
  }));
}
function getTotalLength(mainCurve) {
  try {
    return mainCurve && mainCurve.getTotalLength && mainCurve.getTotalLength() || 0;
  } catch (_unused) {
    return 0;
  }
}
function CurveWithAnimation(_ref4) {
  var {
    clipPathId,
    props,
    pathRef,
    previousPointsRef,
    longestAnimatedLengthRef
  } = _ref4;
  var {
    points,
    strokeDasharray,
    isAnimationActive,
    animationBegin,
    animationDuration,
    animationEasing,
    animateNewValues,
    width,
    height,
    onAnimationEnd,
    onAnimationStart
  } = props;
  var prevPoints = previousPointsRef.current;
  var animationId = (0,_util_useAnimationId__WEBPACK_IMPORTED_MODULE_19__/* .useAnimationId */ .n)(props, 'recharts-line-');
  var [isAnimating, setIsAnimating] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  var showLabels = !isAnimating;
  var handleAnimationEnd = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (typeof onAnimationEnd === 'function') {
      onAnimationEnd();
    }
    setIsAnimating(false);
  }, [onAnimationEnd]);
  var handleAnimationStart = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (typeof onAnimationStart === 'function') {
      onAnimationStart();
    }
    setIsAnimating(true);
  }, [onAnimationStart]);
  var totalLength = getTotalLength(pathRef.current);
  /*
   * Here we want to detect if the length animation has been interrupted.
   * For that we keep a reference to the furthest length that has been animated.
   *
   * And then, to keep things smooth, we add to it the current length that is being animated right now.
   *
   * If we did Math.max then it makes the length animation "pause" but we want to keep it smooth
   * so in case we have some "leftover" length from the previous animation we add it to the current length.
   *
   * This is not perfect because the animation changes speed due to easing. The default easing is 'ease' which is not linear
   * and makes it stand out. But it's good enough I suppose.
   * If we want to fix it then we need to keep track of multiple animations and their easing and timings.
   *
   * If you want to see this in action, try to change the dataKey of the line chart while the initial animation is running.
   * The Line begins with zero length and slowly grows to the full length. While this growth is in progress,
   * change the dataKey and the Line will continue growing from where it has grown so far.
   */
  var startingPoint = longestAnimatedLengthRef.current;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(LineLabelListProvider, {
    points: points,
    showLabels: showLabels
  }, props.children, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_animation_JavascriptAnimate__WEBPACK_IMPORTED_MODULE_25__/* .JavascriptAnimate */ .J, {
    animationId: animationId,
    begin: animationBegin,
    duration: animationDuration,
    isActive: isAnimationActive,
    easing: animationEasing,
    onAnimationEnd: handleAnimationEnd,
    onAnimationStart: handleAnimationStart,
    key: animationId
  }, t => {
    var lengthInterpolated = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_6__/* .interpolate */ .GW)(startingPoint, totalLength + startingPoint, t);
    var curLength = Math.min(lengthInterpolated, totalLength);
    var currentStrokeDasharray;
    if (isAnimationActive) {
      if (strokeDasharray) {
        var lines = "".concat(strokeDasharray).split(/[,\s]+/gim).map(num => parseFloat(num));
        currentStrokeDasharray = getStrokeDasharray(curLength, totalLength, lines);
      } else {
        currentStrokeDasharray = generateSimpleStrokeDasharray(totalLength, curLength);
      }
    } else {
      currentStrokeDasharray = strokeDasharray == null ? undefined : String(strokeDasharray);
    }
    if (prevPoints) {
      var prevPointsDiffFactor = prevPoints.length / points.length;
      var stepData = t === 1 ? points : points.map((entry, index) => {
        var prevPointIndex = Math.floor(index * prevPointsDiffFactor);
        if (prevPoints[prevPointIndex]) {
          var prev = prevPoints[prevPointIndex];
          return _objectSpread(_objectSpread({}, entry), {}, {
            x: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_6__/* .interpolate */ .GW)(prev.x, entry.x, t),
            y: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_6__/* .interpolate */ .GW)(prev.y, entry.y, t)
          });
        }

        // magic number of faking previous x and y location
        if (animateNewValues) {
          return _objectSpread(_objectSpread({}, entry), {}, {
            x: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_6__/* .interpolate */ .GW)(width * 2, entry.x, t),
            y: (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_6__/* .interpolate */ .GW)(height / 2, entry.y, t)
          });
        }
        return _objectSpread(_objectSpread({}, entry), {}, {
          x: entry.x,
          y: entry.y
        });
      });
      // eslint-disable-next-line no-param-reassign
      previousPointsRef.current = stepData;
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(StaticCurve, {
        props: props,
        points: stepData,
        clipPathId: clipPathId,
        pathRef: pathRef,
        strokeDasharray: currentStrokeDasharray
      });
    }

    /*
     * Here it is important to wait a little bit with updating the previousPointsRef
     * before the animation has a time to initialize.
     * If we set the previous pointsRef immediately, we set it before the Legend height it calculated
     * and before pathRef is set.
     * If that happens, the Line will re-render again after Legend had reported its height
     * which will start a new animation with the previous points as the starting point
     * which gives the effect of the Line animating slightly upwards (where the animation distance equals the Legend height).
     * Waiting for t > 0 is indirect but good enough to ensure that the Legend height is calculated and animation works properly.
     *
     * Total length similarly is calculated from the pathRef. We should not update the previousPointsRef
     * before the pathRef is set, otherwise we will have a wrong total length.
     */
    if (t > 0 && totalLength > 0) {
      // eslint-disable-next-line no-param-reassign
      previousPointsRef.current = points;
      /*
       * totalLength is set from a ref and is not updated in the first tick of the animation.
       * It defaults to zero which is exactly what we want here because we want to grow from zero,
       * however the same happens when the data change.
       *
       * In that case we want to remember the previous length and continue from there, and only animate the shape.
       *
       * Therefore the totalLength > 0 check.
       *
       * The Animate is about to fire handleAnimationStart which will update the state
       * and cause a re-render and read a new proper totalLength which will be used in the next tick
       * and update the longestAnimatedLengthRef.
       */
      // eslint-disable-next-line no-param-reassign
      longestAnimatedLengthRef.current = curLength;
    }
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(StaticCurve, {
      props: props,
      points: points,
      clipPathId: clipPathId,
      pathRef: pathRef,
      strokeDasharray: currentStrokeDasharray
    });
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_LabelList__WEBPACK_IMPORTED_MODULE_5__/* .LabelListFromLabelProp */ .qY, {
    label: props.label
  }));
}
function RenderCurve(_ref5) {
  var {
    clipPathId,
    props
  } = _ref5;
  var previousPointsRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  var longestAnimatedLengthRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(0);
  var pathRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(CurveWithAnimation, {
    props: props,
    clipPathId: clipPathId,
    previousPointsRef: previousPointsRef,
    longestAnimatedLengthRef: longestAnimatedLengthRef,
    pathRef: pathRef
  });
}
var errorBarDataPointFormatter = (dataPoint, dataKey) => {
  return {
    x: dataPoint.x,
    y: dataPoint.y,
    value: dataPoint.value,
    // @ts-expect-error getValueByDataKey does not validate the output type
    errorVal: (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getValueByDataKey */ .kr)(dataPoint.payload, dataKey)
  };
};

// eslint-disable-next-line react/prefer-stateless-function
class LineWithState extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
  render() {
    var {
      hide,
      dot,
      points,
      className,
      xAxisId,
      yAxisId,
      top,
      left,
      width,
      height,
      id,
      needClip
    } = this.props;
    if (hide) {
      return null;
    }
    var layerClass = (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-line', className);
    var clipPathId = id;
    var {
      r,
      strokeWidth
    } = (0,_util_getRadiusAndStrokeWidthFromDot__WEBPACK_IMPORTED_MODULE_27__/* .getRadiusAndStrokeWidthFromDot */ .x)(dot);
    var clipDot = (0,_util_ReactUtils__WEBPACK_IMPORTED_MODULE_7__/* .isClipDot */ .y$)(dot);
    var dotSize = r * 2 + strokeWidth;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_4__/* .Layer */ .W, {
      className: layerClass
    }, needClip && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("defs", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_GraphicalItemClipPath__WEBPACK_IMPORTED_MODULE_13__/* .GraphicalItemClipPath */ .Q, {
      clipPathId: clipPathId,
      xAxisId: xAxisId,
      yAxisId: yAxisId
    }), !clipDot && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("clipPath", {
      id: "clipPath-dots-".concat(clipPathId)
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement("rect", {
      x: left - dotSize / 2,
      y: top - dotSize / 2,
      width: width + dotSize,
      height: height + dotSize
    }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_ErrorBarContext__WEBPACK_IMPORTED_MODULE_12__/* .SetErrorBarContext */ .zk, {
      xAxisId: xAxisId,
      yAxisId: yAxisId,
      data: points,
      dataPointFormatter: errorBarDataPointFormatter,
      errorBarOffset: 0
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(RenderCurve, {
      props: this.props,
      clipPathId: clipPathId
    }))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_ActivePoints__WEBPACK_IMPORTED_MODULE_10__/* .ActivePoints */ .W, {
      activeDot: this.props.activeDot,
      points: points,
      mainColor: this.props.stroke,
      itemDataKey: this.props.dataKey
    }));
  }
}
var defaultLineProps = {
  activeDot: true,
  animateNewValues: true,
  animationBegin: 0,
  animationDuration: 1500,
  animationEasing: 'ease',
  connectNulls: false,
  dot: true,
  fill: '#fff',
  hide: false,
  isAnimationActive: !_util_Global__WEBPACK_IMPORTED_MODULE_8__/* .Global */ .m.isSsr,
  label: false,
  legendType: 'line',
  stroke: '#3182bd',
  strokeWidth: 1,
  xAxisId: 0,
  yAxisId: 0
};
function LineImpl(props) {
  var _resolveDefaultProps = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_20__/* .resolveDefaultProps */ .e)(props, defaultLineProps),
    {
      activeDot,
      animateNewValues,
      animationBegin,
      animationDuration,
      animationEasing,
      connectNulls,
      dot,
      hide,
      isAnimationActive,
      label,
      legendType,
      xAxisId,
      yAxisId,
      id
    } = _resolveDefaultProps,
    everythingElse = _objectWithoutProperties(_resolveDefaultProps, _excluded3);
  var {
    needClip
  } = (0,_GraphicalItemClipPath__WEBPACK_IMPORTED_MODULE_13__/* .useNeedsClip */ .l)(xAxisId, yAxisId);
  var plotArea = (0,_hooks__WEBPACK_IMPORTED_MODULE_21__/* .usePlotArea */ .oM)();
  var layout = (0,_context_chartLayoutContext__WEBPACK_IMPORTED_MODULE_14__/* .useChartLayout */ .WX)();
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_15__/* .useIsPanorama */ .r)();
  var points = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_17__/* .useAppSelector */ .G)(state => (0,_state_selectors_lineSelectors__WEBPACK_IMPORTED_MODULE_16__/* .selectLinePoints */ .I)(state, xAxisId, yAxisId, isPanorama, id));
  if (layout !== 'horizontal' && layout !== 'vertical' || points == null || plotArea == null) {
    // Cannot render Line in an unsupported layout
    return null;
  }
  var {
    height,
    width,
    x: left,
    y: top
  } = plotArea;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(LineWithState, _extends({}, everythingElse, {
    id: id,
    connectNulls: connectNulls,
    dot: dot,
    activeDot: activeDot,
    animateNewValues: animateNewValues,
    animationBegin: animationBegin,
    animationDuration: animationDuration,
    animationEasing: animationEasing,
    isAnimationActive: isAnimationActive,
    hide: hide,
    label: label,
    legendType: legendType,
    xAxisId: xAxisId,
    yAxisId: yAxisId,
    points: points,
    layout: layout,
    height: height,
    width: width,
    left: left,
    top: top,
    needClip: needClip
  }));
}
function computeLinePoints(_ref6) {
  var {
    layout,
    xAxis,
    yAxis,
    xAxisTicks,
    yAxisTicks,
    dataKey,
    bandSize,
    displayedData
  } = _ref6;
  return displayedData.map((entry, index) => {
    // @ts-expect-error getValueByDataKey does not validate the output type
    var value = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getValueByDataKey */ .kr)(entry, dataKey);
    if (layout === 'horizontal') {
      var _x = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getCateCoordinateOfLine */ .nb)({
        axis: xAxis,
        ticks: xAxisTicks,
        bandSize,
        entry,
        index
      });
      var _y = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_6__/* .isNullish */ .uy)(value) ? null : yAxis.scale(value);
      return {
        x: _x,
        y: _y,
        value,
        payload: entry
      };
    }
    var x = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_6__/* .isNullish */ .uy)(value) ? null : xAxis.scale(value);
    var y = (0,_util_ChartUtils__WEBPACK_IMPORTED_MODULE_9__/* .getCateCoordinateOfLine */ .nb)({
      axis: yAxis,
      ticks: yAxisTicks,
      bandSize,
      entry,
      index
    });
    if (x == null || y == null) {
      return null;
    }
    return {
      x,
      y,
      value,
      payload: entry
    };
  }).filter(Boolean);
}
function LineFn(outsideProps) {
  var props = (0,_util_resolveDefaultProps__WEBPACK_IMPORTED_MODULE_20__/* .resolveDefaultProps */ .e)(outsideProps, defaultLineProps);
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_15__/* .useIsPanorama */ .r)();
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_context_RegisterGraphicalItemId__WEBPACK_IMPORTED_MODULE_22__/* .RegisterGraphicalItemId */ .x, {
    id: props.id,
    type: "line"
  }, id => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetLegendPayload__WEBPACK_IMPORTED_MODULE_18__/* .SetLegendPayload */ .A, {
    legendPayload: computeLegendPayloadFromAreaData(props)
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetTooltipEntrySettings__WEBPACK_IMPORTED_MODULE_11__/* .SetTooltipEntrySettings */ .r, {
    fn: getTooltipEntrySettings,
    args: props
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_state_SetGraphicalItem__WEBPACK_IMPORTED_MODULE_23__/* .SetCartesianGraphicalItem */ .p, {
    type: "line",
    id: id,
    data: props.data,
    xAxisId: props.xAxisId,
    yAxisId: props.yAxisId,
    zAxisId: 0,
    dataKey: props.dataKey,
    hide: props.hide,
    isPanorama: isPanorama
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(LineImpl, _extends({}, props, {
    id: id
  }))));
}
var Line = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.memo(LineFn);
Line.displayName = 'Line';

/***/ }),

/***/ 88621:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* unused harmony export ReferenceArea */
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96540);
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(34164);
/* harmony import */ var _container_Layer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(86069);
/* harmony import */ var _component_Label__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(91706);
/* harmony import */ var _util_CartesianUtils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(15894);
/* harmony import */ var _util_DataUtils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(59744);
/* harmony import */ var _shape_Rectangle__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(34723);
/* harmony import */ var _state_referenceElementsSlice__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(26314);
/* harmony import */ var _state_hooks__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(49082);
/* harmony import */ var _state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(11114);
/* harmony import */ var _context_PanoramaContext__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(12070);
/* harmony import */ var _container_ClipPathProvider__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(84518);
/* harmony import */ var _util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(80196);
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }














var getRect = (hasX1, hasX2, hasY1, hasY2, xAxisScale, yAxisScale, props) => {
  var {
    x1: xValue1,
    x2: xValue2,
    y1: yValue1,
    y2: yValue2
  } = props;
  if (xAxisScale == null || yAxisScale == null) {
    return null;
  }
  var scales = (0,_util_CartesianUtils__WEBPACK_IMPORTED_MODULE_4__/* .createLabeledScales */ .P2)({
    x: xAxisScale,
    y: yAxisScale
  });
  var p1 = {
    x: hasX1 ? scales.x.apply(xValue1, {
      position: 'start'
    }) : scales.x.rangeMin,
    y: hasY1 ? scales.y.apply(yValue1, {
      position: 'start'
    }) : scales.y.rangeMin
  };
  var p2 = {
    x: hasX2 ? scales.x.apply(xValue2, {
      position: 'end'
    }) : scales.x.rangeMax,
    y: hasY2 ? scales.y.apply(yValue2, {
      position: 'end'
    }) : scales.y.rangeMax
  };
  if (props.ifOverflow === 'discard' && (!scales.isInRange(p1) || !scales.isInRange(p2))) {
    return null;
  }
  return (0,_util_CartesianUtils__WEBPACK_IMPORTED_MODULE_4__/* .rectWithPoints */ .sl)(p1, p2);
};
var renderRect = (option, props) => {
  var rect;
  if (/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.isValidElement(option)) {
    // @ts-expect-error element cloning is not typed
    rect = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.cloneElement(option, props);
  } else if (typeof option === 'function') {
    rect = option(props);
  } else {
    rect = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_shape_Rectangle__WEBPACK_IMPORTED_MODULE_6__/* .Rectangle */ .M, _extends({}, props, {
      className: "recharts-reference-area-rect"
    }));
  }
  return rect;
};
function ReportReferenceArea(props) {
  var dispatch = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_8__/* .useAppDispatch */ .j)();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    dispatch((0,_state_referenceElementsSlice__WEBPACK_IMPORTED_MODULE_7__/* .addArea */ .Xn)(props));
    return () => {
      dispatch((0,_state_referenceElementsSlice__WEBPACK_IMPORTED_MODULE_7__/* .removeArea */ .A$)(props));
    };
  });
  return null;
}
function ReferenceAreaImpl(props) {
  var {
    x1,
    x2,
    y1,
    y2,
    className,
    shape,
    xAxisId,
    yAxisId
  } = props;
  var clipPathId = (0,_container_ClipPathProvider__WEBPACK_IMPORTED_MODULE_11__/* .useClipPathId */ .Y)();
  var isPanorama = (0,_context_PanoramaContext__WEBPACK_IMPORTED_MODULE_10__/* .useIsPanorama */ .r)();
  var xAxisScale = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_8__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_9__/* .selectAxisScale */ .iV)(state, 'xAxis', xAxisId, isPanorama));
  var yAxisScale = (0,_state_hooks__WEBPACK_IMPORTED_MODULE_8__/* .useAppSelector */ .G)(state => (0,_state_selectors_axisSelectors__WEBPACK_IMPORTED_MODULE_9__/* .selectAxisScale */ .iV)(state, 'yAxis', yAxisId, isPanorama));
  if (xAxisScale == null || !yAxisScale == null) {
    return null;
  }
  var hasX1 = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .isNumOrStr */ .vh)(x1);
  var hasX2 = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .isNumOrStr */ .vh)(x2);
  var hasY1 = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .isNumOrStr */ .vh)(y1);
  var hasY2 = (0,_util_DataUtils__WEBPACK_IMPORTED_MODULE_5__/* .isNumOrStr */ .vh)(y2);
  if (!hasX1 && !hasX2 && !hasY1 && !hasY2 && !shape) {
    return null;
  }
  var rect = getRect(hasX1, hasX2, hasY1, hasY2, xAxisScale, yAxisScale, props);
  if (!rect && !shape) {
    return null;
  }
  var isOverflowHidden = props.ifOverflow === 'hidden';
  var clipPath = isOverflowHidden ? "url(#".concat(clipPathId, ")") : undefined;
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_container_Layer__WEBPACK_IMPORTED_MODULE_2__/* .Layer */ .W, {
    className: (0,clsx__WEBPACK_IMPORTED_MODULE_1__/* .clsx */ .$)('recharts-reference-area', className)
  }, renderRect(shape, _objectSpread(_objectSpread({
    clipPath
  }, (0,_util_svgPropertiesAndEvents__WEBPACK_IMPORTED_MODULE_12__/* .svgPropertiesAndEvents */ .a)(props)), rect)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_Label__WEBPACK_IMPORTED_MODULE_3__/* .CartesianLabelContextProvider */ .zJ, rect, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(_component_Label__WEBPACK_IMPORTED_MODULE_3__/* .CartesianLabelFromLabelProp */ ._I, {
    label: props.label
  }), props.children));
}
function ReferenceAreaSettingsDispatcher(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ReportReferenceArea, {
    yAxisId: props.yAxisId,
    xAxisId: props.xAxisId,
    ifOverflow: props.ifOverflow,
    x1: props.x1,
    x2: props.x2,
    y1: props.y1,
    y2: props.y2
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ReferenceAreaImpl, props));
}

// eslint-disable-next-line react/prefer-stateless-function
class ReferenceArea extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
  render() {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0__.createElement(ReferenceAreaSettingsDispatcher, this.props);
  }
}
_defineProperty(ReferenceArea, "displayName", 'ReferenceArea');
_defineProperty(ReferenceArea, "defaultProps", {
  ifOverflow: 'discard',
  xAxisId: 0,
  yAxisId: 0,
  r: 10,
  fill: '#ccc',
  fillOpacity: 0.5,
  stroke: 'none',
  strokeWidth: 1
});

/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVuZG9yLWNvbW1vbi0zOThlZjIyNS5jMTFlNjc0ZDA1ZjhlYzI4M2VkYS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUE4QztBQUM4QjtBQUNyRTtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLDREQUF3QjtBQUNyQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsK0JBQVM7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDOztBQ3pEQSx5QkFBeUIsd0JBQXdCLG9DQUFvQyx5Q0FBeUMsa0NBQWtDLDBEQUEwRCwwQkFBMEI7QUFDcFAsNEJBQTRCLGdCQUFnQixzQkFBc0IsT0FBTyxrREFBa0Qsc0RBQXNELDhCQUE4QixtSkFBbUoscUVBQXFFLEtBQUs7QUFDNWEsb0NBQW9DLG9FQUFvRSwwREFBMEQ7QUFDbEssNkJBQTZCLG1DQUFtQztBQUNoRSw4QkFBOEIsMENBQTBDLCtCQUErQixvQkFBb0IsbUNBQW1DLG9DQUFvQyx1RUFBdUU7QUFDbE47QUFDTjtBQUNUO0FBQ3FFO0FBQ2pEO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0RBQXdELFlBQVk7QUFDcEU7QUFDQSxPQUFPO0FBQ1AsTUFBTTtBQUNOLHdEQUF3RCxZQUFZO0FBQ3BFO0FBQ0EsT0FBTztBQUNQO0FBQ0EsaUJBQWlCLCtCQUFTO0FBQzFCO0FBQ0E7QUFDQSxnREFBZ0QsWUFBWTtBQUM1RDtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0Esd0JBQXdCLFFBQVE7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkRBQTJELFdBQVc7QUFDdEU7QUFDQSxLQUFLO0FBQ0wscUJBQXFCLCtCQUFTO0FBQzlCO0FBQ0E7QUFDQSxzREFBc0QsV0FBVztBQUNqRTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0RBQXdELFlBQVk7QUFDcEU7QUFDQSxPQUFPO0FBQ1AsTUFBTTtBQUNOLHdEQUF3RCxZQUFZO0FBQ3BFO0FBQ0EsT0FBTztBQUNQO0FBQ0EsaUJBQWlCLCtCQUFTO0FBQzFCO0FBQ0E7QUFDQSxnREFBZ0QsWUFBWTtBQUM1RDtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0Esa0JBQWtCLFdBQVc7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBLE1BQU0sOEJBQVEsY0FBYyxvQkFBTTtBQUNsQztBQUNBLG9DQUFvQyw0Q0FBc0IsUUFBUSw4QkFBUTtBQUMxRTtBQUNBO0FBQ0E7QUFDQSwrQ0FBK0Msa0NBQWE7QUFDNUQ7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUMsd0NBQWtCLENBQUMsa0NBQWE7QUFDakU7QUFDQTtBQUNBLEtBQUssc0JBQXNCLGtDQUFhO0FBQ3hDO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxpQ0FBaUMsOEJBQVE7QUFDekMsbUJBQW1CLHNDQUFpQjtBQUNwQztBQUNBLFdBQVcsbUJBQW1CO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlKQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsMEJBQTBCLG1EQUFtRCxvQ0FBb0MseUNBQXlDLFlBQVksY0FBYyx3Q0FBd0MscURBQXFEO0FBQzNULCtDQUErQywwQkFBMEIsWUFBWSx1QkFBdUIsOEJBQThCLG1DQUFtQyxlQUFlO0FBQzVMLHNCQUFzQix3RUFBd0UsZ0JBQWdCLHNCQUFzQixPQUFPLHNCQUFzQixvQkFBb0IsZ0RBQWdELFdBQVc7QUFDaFAseUJBQXlCLHdCQUF3QixvQ0FBb0MseUNBQXlDLGtDQUFrQywwREFBMEQsMEJBQTBCO0FBQ3BQLDRCQUE0QixnQkFBZ0Isc0JBQXNCLE9BQU8sa0RBQWtELHNEQUFzRCw4QkFBOEIsbUpBQW1KLHFFQUFxRSxLQUFLO0FBQzVhLG9DQUFvQyxvRUFBb0UsMERBQTBEO0FBQ2xLLDZCQUE2QixtQ0FBbUM7QUFDaEUsOEJBQThCLDBDQUEwQywrQkFBK0Isb0JBQW9CLG1DQUFtQyxvQ0FBb0MsdUVBQXVFO0FBQzFPO0FBQ2dDO0FBQ25DO0FBQ2U7QUFDd0Q7QUFDaEQ7QUFDWDtBQUNSO0FBQ087QUFDRTtBQUM2QztBQUNjO0FBQ2pEO0FBQ0U7QUFDdUU7QUFDakQ7QUFDWDtBQUNjO0FBQ0o7QUFDMUI7QUFDVztBQUNvQjtBQUNsQjtBQUN3QztBQUM3QztBQUNVO0FBQ1c7QUFDUDtBQUNrQztBQUNyQztBQUNSOztBQUUzRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVywrRUFBa0I7QUFDN0I7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsNkZBQXFCO0FBQzFDLHdCQUF3Qix3R0FBZ0M7QUFDeEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sRUFBRSw4RUFBbUI7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLDhEQUE4RCxtQkFBbUI7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHLHNCQUFzQjtBQUN6QjtBQUNBLEdBQUc7QUFDSCxtQkFBbUIsaURBQW9CO0FBQ3ZDLDRCQUE0QiwrQ0FBa0I7QUFDOUMsSUFBSTtBQUNKO0FBQ0EsSUFBSTtBQUNKLDRCQUE0QixnREFBbUIsQ0FBQyx3REFBSyxhQUFhO0FBQ2xFO0FBQ0EsS0FBSztBQUNMO0FBQ0Esc0JBQXNCLGdEQUFtQixDQUFDLDREQUFLO0FBQy9DO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLHFCQUFxQixrRkFBVTtBQUMvQix5QkFBeUIsOENBQU87QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLGNBQWM7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMLEdBQUc7QUFDSCxzQkFBc0IsZ0RBQW1CLENBQUMsNkZBQWlDO0FBQzNFO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0osb0JBQW9CLHNFQUFjLENBQUMsa0dBQXdCO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsZ0NBQWdDLDZGQUF5QjtBQUN6RCxnQ0FBZ0MsNkZBQXlCO0FBQ3pELDJCQUEyQiw2RkFBeUI7QUFDcEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLGtCQUFrQiw2RkFBcUI7QUFDdkMsc0JBQXNCLGdEQUFtQixDQUFDLDJDQUFjLHFCQUFxQixnREFBbUI7QUFDaEc7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUssd0JBQXdCO0FBQzdCLE9BQU8sc0ZBQThCO0FBQ3JDLE9BQU8sd0ZBQWdDO0FBQ3ZDLEtBQUs7QUFDTCx3QkFBd0IsZ0RBQW1CLENBQUMsNERBQUs7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLLEVBQUUseUVBQWtCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLLGdCQUFnQixnREFBbUIsQ0FBQyx1RUFBYTtBQUN0RDtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLG9CQUFvQiw4RUFBYztBQUNsQyxzQ0FBc0MsK0NBQVE7QUFDOUMsMkJBQTJCLGtEQUFXO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsNkJBQTZCLGtEQUFXO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxzQkFBc0IsZ0RBQW1CO0FBQ3pDO0FBQ0E7QUFDQSxHQUFHLCtCQUErQixnREFBbUIsQ0FBQyxxRkFBaUI7QUFDdkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsNEVBQWlCO0FBQzlDLDZCQUE2Qiw0RUFBaUI7QUFDOUMsK0JBQStCLDRFQUFpQjtBQUNoRCw2Q0FBNkMsWUFBWTtBQUN6RDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSx5QkFBeUIsNEVBQWlCO0FBQzFDLDJDQUEyQyxZQUFZO0FBQ3ZEO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnREFBbUIsQ0FBQyw0REFBSyxxQkFBcUIsZ0RBQW1CO0FBQ3pGO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHLGdCQUFnQixnREFBbUIsQ0FBQyxrRkFBc0I7QUFDN0Q7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLCtFQUFrQjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLHFCQUFxQixvRUFBUztBQUM5QixxQkFBcUIsb0VBQVM7QUFDOUI7QUFDQSw0Q0FBNEMsa0RBQUs7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLDhFQUFpQjtBQUM3QixZQUFZLDhFQUFpQjtBQUM3QixhQUFhLG9FQUFTLGtCQUFrQiw4RUFBaUI7QUFDekQ7QUFDQTtBQUNBLFlBQVksb0VBQVM7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsWUFBWSxvRUFBUztBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQSxhQUFhLG9GQUF1QjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsYUFBYSxvRkFBdUI7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSx5Q0FBeUMsWUFBWTtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsOEVBQWlCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0osMEJBQTBCLDZDQUFNO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixtREFBSTtBQUN2QjtBQUNBLHNCQUFzQixnREFBbUIsQ0FBQyw0REFBSztBQUMvQztBQUNBO0FBQ0E7QUFDQSxHQUFHLDJCQUEyQixnREFBbUIsNEJBQTRCLGdEQUFtQixDQUFDLG1GQUFxQjtBQUN0SDtBQUNBO0FBQ0E7QUFDQSxHQUFHLGlCQUFpQixnREFBbUIsQ0FBQyxtRkFBa0I7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUcsZUFBZSxnREFBbUIsQ0FBQyw0REFBSztBQUMzQztBQUNBLEdBQUcsZUFBZSxnREFBbUI7QUFDckM7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLHlEQUFNO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsd0ZBQW1CO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLElBQUksRUFBRSw4RUFBWTtBQUNsQixjQUFjLDhDQUFPLE9BQU8seUVBQWEsaUJBQWlCLDBEQUFJO0FBQzlELG1CQUFtQixpRkFBYTtBQUNoQyxlQUFlLHNFQUFjO0FBQzdCLFdBQVcsZ0dBQW1CO0FBQzlCLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsZ0RBQW1CLENBQUMsMkNBQWMscUJBQXFCLGdEQUFtQixDQUFDLDZGQUF1QjtBQUN4SDtBQUNBLHdDQUF3QyxZQUFZO0FBQ3BEO0FBQ0EsS0FBSztBQUNMLEdBQUcsZ0JBQWdCLGdEQUFtQiwyQkFBMkI7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsY0FBYyx3RkFBbUI7QUFDakMsbUJBQW1CLGlGQUFhO0FBQ2hDLHNCQUFzQixnREFBbUIsQ0FBQywrRkFBdUI7QUFDakU7QUFDQTtBQUNBLEdBQUcscUJBQXFCLGdEQUFtQixDQUFDLDJDQUFjLHFCQUFxQixnREFBbUIsQ0FBQywrRUFBZ0I7QUFDbkg7QUFDQSxHQUFHLGdCQUFnQixnREFBbUIsQ0FBQyx3RkFBeUI7QUFDaEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUcsZ0JBQWdCLGdEQUFtQix5QkFBeUI7QUFDL0Q7QUFDQSxHQUFHO0FBQ0g7QUFDTywyQkFBMkIsdUNBQVU7QUFDNUMsZ0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNyakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLHdFQUF3RSxnQkFBZ0Isc0JBQXNCLE9BQU8sc0JBQXNCLG9CQUFvQixnREFBZ0QsV0FBVztBQUNoUCwwQ0FBMEMsMEJBQTBCLG1EQUFtRCxvQ0FBb0MseUNBQXlDLFlBQVksY0FBYyx3Q0FBd0MscURBQXFEO0FBQzNULCtDQUErQywwQkFBMEIsWUFBWSx1QkFBdUIsOEJBQThCLG1DQUFtQyxlQUFlO0FBQzdKO0FBQ2lDO0FBQ3BDO0FBQ29CO0FBQ3NDO0FBQ3RCO0FBQzBHO0FBQ3pGO0FBQ3RCO0FBQ0U7QUFDVDtBQUNjO0FBQ2xFO0FBQ0EsaUJBQWlCLHFFQUFjO0FBQy9CLEVBQUUsc0RBQWU7QUFDakIsYUFBYSw2RUFBUTtBQUNyQjtBQUNBLGVBQWUsZ0ZBQVc7QUFDMUI7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSix5QkFBeUIsNkNBQU07QUFDL0IsaUJBQWlCLDZDQUFNO0FBQ3ZCLGdCQUFnQixxRUFBYyxDQUFDLG1HQUFpQjtBQUNoRCxtQkFBbUIsZ0ZBQWE7QUFDaEMsaUJBQWlCLHFFQUFjO0FBQy9CO0FBQ0EsY0FBYyxxRUFBYyxVQUFVLHlGQUFlO0FBQ3JELGlCQUFpQixxRUFBYyxVQUFVLHlGQUFlO0FBQ3hELGlCQUFpQixxRUFBYyxVQUFVLDZGQUFtQjtBQUM1RCwyQkFBMkIscUVBQWMsVUFBVSwyRkFBaUI7QUFDcEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLHFFQUFjLFVBQVUsdUdBQTZCO0FBQ2xGLEVBQUUsc0RBQWU7QUFDakI7QUFDQTtBQUNBLHlDQUF5QyxtRkFBdUIsd0JBQXdCLHFEQUFjO0FBQ3RHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxlQUFlLHFGQUFnQjtBQUMvQjtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLHNCQUFzQixnREFBbUIsQ0FBQyxrRUFBYSxhQUFhO0FBQ3BFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxlQUFlLG1EQUFJO0FBQ25CO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDTztBQUNQLHFCQUFxQixtRkFBYTtBQUNsQyxpQkFBaUIsbUZBQWE7QUFDOUIsMkJBQTJCLG1GQUFhO0FBQ3hDO0FBQ0EsVUFBVSxtRkFBYTtBQUN2QixlQUFlLG1GQUFhO0FBQzVCLFdBQVcsbUZBQWE7QUFDeEIsWUFBWSxtRkFBYTtBQUN6QixTQUFTLG1GQUFhO0FBQ3RCLGFBQWEsbUZBQWE7QUFDMUIsUUFBUSxtRkFBYTtBQUNyQixTQUFTLG1GQUFhO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyx3RkFBbUI7QUFDakMsc0JBQXNCLGdEQUFtQixDQUFDLDJDQUFjLHFCQUFxQixnREFBbUI7QUFDaEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRyxnQkFBZ0IsZ0RBQW1CO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE9BQU8seUVBQVk7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMseUVBQVk7QUFDckI7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7QUFDTyx5QkFBeUIsdUNBQVU7QUFDMUMsNEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlLQSx5QkFBeUIsd0JBQXdCLG9DQUFvQyx5Q0FBeUMsa0NBQWtDLDBEQUEwRCwwQkFBMEI7QUFDcFAsNEJBQTRCLGdCQUFnQixzQkFBc0IsT0FBTyxrREFBa0Qsc0RBQXNELDhCQUE4QixtSkFBbUoscUVBQXFFLEtBQUs7QUFDNWEsb0NBQW9DLG9FQUFvRSwwREFBMEQ7QUFDbEssNkJBQTZCLG1DQUFtQztBQUNoRSw4QkFBOEIsMENBQTBDLCtCQUErQixvQkFBb0IsbUNBQW1DLG9DQUFvQyx1RUFBdUU7QUFDelEsc0JBQXNCLHdFQUF3RSxnQkFBZ0Isc0JBQXNCLE9BQU8sc0JBQXNCLG9CQUFvQixnREFBZ0QsV0FBVztBQUNqTjtBQUNjO0FBQ2pCO0FBQ2U7QUFDUjtBQUM2RDtBQUNqRDtBQUNjO0FBQ087QUFDSjtBQUNHO0FBQ1I7QUFDRztBQUNVO0FBQ3hFO0FBQ0EsWUFBWSxxRUFBVTtBQUN0QixZQUFZLHFFQUFVO0FBQ3RCLG1CQUFtQixpRkFBYTtBQUNoQyxtQkFBbUIscUVBQWMsVUFBVSx5RkFBZTtBQUMxRCxtQkFBbUIscUVBQWMsVUFBVSx5RkFBZTtBQUMxRDtBQUNBO0FBQ0E7QUFDQSxlQUFlLG1GQUFtQjtBQUNsQztBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIscUVBQWM7QUFDL0IsRUFBRSxnREFBUztBQUNYLGFBQWEsK0VBQU07QUFDbkI7QUFDQSxlQUFlLGtGQUFTO0FBQ3hCO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLGlEQUFvQjtBQUN2QztBQUNBLHVCQUF1QiwrQ0FBa0I7QUFDekMsSUFBSTtBQUNKO0FBQ0EsSUFBSTtBQUNKLHVCQUF1QixnREFBbUIsQ0FBQyxvREFBRyxhQUFhO0FBQzNEO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLG1CQUFtQixvRkFBYTtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxHQUFHLEVBQUUsOEZBQXNCLFlBQVk7QUFDdkM7QUFDQTtBQUNBLEdBQUc7QUFDSCxzQkFBc0IsZ0RBQW1CLENBQUMsNERBQUs7QUFDL0MsZUFBZSxtREFBSTtBQUNuQixHQUFHLDJDQUEyQyxnREFBbUIsQ0FBQyxxRkFBNkI7QUFDL0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHLGVBQWUsZ0RBQW1CLENBQUMsbUZBQTJCO0FBQ2pFO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSixzQkFBc0IsZ0RBQW1CLENBQUMsMkNBQWMscUJBQXFCLGdEQUFtQjtBQUNoRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHLGdCQUFnQixnREFBbUI7QUFDdEM7O0FBRUE7QUFDTywyQkFBMkIsNENBQVM7QUFDM0M7QUFDQSx3QkFBd0IsZ0RBQW1CO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsRTs7Ozs7Ozs7Ozs7Ozs7QUMvSUQsb0NBQW9DLG9FQUFvRSwwREFBMEQ7QUFDbEssNkJBQTZCLG1DQUFtQztBQUNoRSw4QkFBOEIsMENBQTBDLCtCQUErQixvQkFBb0IsbUNBQW1DLG9DQUFvQyx1RUFBdUU7QUFDMU87QUFDYztBQUN1QjtBQUNwQjtBQUNpQjtBQUNqRTtBQUNBLGlCQUFpQixxRUFBYztBQUMvQixFQUFFLGdEQUFTO0FBQ1gsYUFBYSw2RUFBUTtBQUNyQjtBQUNBLGVBQWUsZ0ZBQVc7QUFDMUI7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ08sb0JBQW9CLDRDQUFTO0FBQ3BDO0FBQ0Esd0JBQXdCLGdEQUFtQjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLG1GQUFhO0FBQzVDLHlCQUF5QixtRkFBYTtBQUN0QyxnQkFBZ0IsbUZBQWE7QUFDN0IscUJBQXFCLG1GQUFhO0FBQ2xDLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUyxtRkFBYTtBQUN0QixTQUFTLG1GQUFhO0FBQ3RCLFFBQVEsbUZBQWE7QUFDckIsQ0FBQyxFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzQ0QseUJBQXlCLHdCQUF3QixvQ0FBb0MseUNBQXlDLGtDQUFrQywwREFBMEQsMEJBQTBCO0FBQ3BQLDRCQUE0QixnQkFBZ0Isc0JBQXNCLE9BQU8sa0RBQWtELHNEQUFzRCw4QkFBOEIsbUpBQW1KLHFFQUFxRSxLQUFLO0FBQzVhLG9DQUFvQyxvRUFBb0UsMERBQTBEO0FBQ2xLLDZCQUE2QixtQ0FBbUM7QUFDaEUsOEJBQThCLDBDQUEwQywrQkFBK0Isb0JBQW9CLG1DQUFtQyxvQ0FBb0MsdUVBQXVFO0FBQ3pRLHNCQUFzQix3RUFBd0UsZ0JBQWdCLHNCQUFzQixPQUFPLHNCQUFzQixvQkFBb0IsZ0RBQWdELFdBQVc7QUFDaFA7QUFDQTtBQUNBO0FBQytCO0FBQ2M7QUFDakI7QUFDZTtBQUNxRDtBQUMxQztBQUN1QjtBQUNsQjtBQUNXO0FBQ047QUFDNkM7QUFDbEQ7QUFDRztBQUNVOztBQUV4RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG1CQUFtQixpREFBb0I7QUFDdkM7QUFDQSx3QkFBd0IsK0NBQWtCO0FBQzFDLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSix3QkFBd0IsZ0RBQW1CLG9CQUFvQjtBQUMvRDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLFFBQVEsZ0VBQUs7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxRQUFRLGdFQUFLO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIscUVBQWM7QUFDL0IsRUFBRSxnREFBUztBQUNYLGFBQWEsZ0ZBQU87QUFDcEI7QUFDQSxlQUFlLG1GQUFVO0FBQ3pCO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSixtQkFBbUIsaUZBQWE7QUFDaEMsbUJBQW1CLG9GQUFhO0FBQ2hDLGNBQWMscUVBQWMsVUFBVSw2RkFBbUI7QUFDekQsY0FBYyxxRUFBYyxVQUFVLDZGQUFtQjtBQUN6RCxtQkFBbUIscUVBQWMsVUFBVSx5RkFBZTtBQUMxRCxtQkFBbUIscUVBQWMsVUFBVSx5RkFBZTtBQUMxRCxnQkFBZ0IsaUZBQVU7QUFDMUIsaUJBQWlCLHFFQUFVO0FBQzNCLGlCQUFpQixxRUFBVTtBQUMzQjtBQUNBO0FBQ0E7QUFDQSxlQUFlLG1GQUFtQjtBQUNsQztBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHLEVBQUUsOEZBQXNCLFlBQVk7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsc0JBQXNCLGdEQUFtQixDQUFDLDREQUFLO0FBQy9DLGVBQWUsbURBQUk7QUFDbkIsR0FBRyw2Q0FBNkMsZ0RBQW1CLENBQUMscUZBQTZCLEVBQUUsOEVBQWM7QUFDakg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHLGdCQUFnQixnREFBbUIsQ0FBQyxtRkFBMkI7QUFDbEU7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLHNCQUFzQixnREFBbUIsQ0FBQywyQ0FBYyxxQkFBcUIsZ0RBQW1CO0FBQ2hHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHLGdCQUFnQixnREFBbUI7QUFDdEM7O0FBRUE7QUFDTyw0QkFBNEIsNENBQVM7QUFDNUM7QUFDQSx3QkFBd0IsZ0RBQW1CO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1TUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0Isd0VBQXdFLGdCQUFnQixzQkFBc0IsT0FBTyxzQkFBc0Isb0JBQW9CLGdEQUFnRCxXQUFXO0FBQ2hQLDBDQUEwQywwQkFBMEIsbURBQW1ELG9DQUFvQyx5Q0FBeUMsWUFBWSxjQUFjLHdDQUF3QyxxREFBcUQ7QUFDM1QsK0NBQStDLDBCQUEwQixZQUFZLHVCQUF1Qiw4QkFBOEIsbUNBQW1DLGVBQWU7QUFDNUw7QUFDQTtBQUNBO0FBQytCO0FBQ1M7QUFDWjtBQUNvQjtBQUNnQjtBQUNJO0FBQ3NHO0FBQ3pGO0FBQ3RCO0FBQ1A7QUFDYztBQUNsRTtBQUNBLGlCQUFpQixxRUFBYztBQUMvQixFQUFFLHNEQUFlO0FBQ2pCLGFBQWEsNkVBQVE7QUFDckI7QUFDQSxlQUFlLGdGQUFXO0FBQzFCO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSixnQkFBZ0IscUVBQWMsQ0FBQyxtR0FBaUI7QUFDaEQsbUJBQW1CLGdGQUFhO0FBQ2hDO0FBQ0EsY0FBYyxxRUFBYyxVQUFVLHlGQUFlO0FBQ3JELDJCQUEyQixxRUFBYyxVQUFVLDJGQUFpQjtBQUNwRSxpQkFBaUIscUVBQWMsVUFBVSx5RkFBZTtBQUN4RCxpQkFBaUIscUVBQWMsVUFBVSw2RkFBbUI7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLHFFQUFjLFVBQVUsdUdBQTZCO0FBQ2xGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxzQkFBc0IsZ0RBQW1CLENBQUMsa0VBQWEsYUFBYTtBQUNwRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxtREFBSTtBQUNuQjtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxxQkFBcUIsbUZBQWE7QUFDbEMsaUJBQWlCLG1GQUFhO0FBQzlCLDJCQUEyQixtRkFBYTtBQUN4QyxVQUFVLG1GQUFhO0FBQ3ZCO0FBQ0EsVUFBVSxtRkFBYTtBQUN2QixlQUFlLG1GQUFhO0FBQzVCLFdBQVcsbUZBQWE7QUFDeEIsWUFBWSxtRkFBYTtBQUN6QixTQUFTLG1GQUFhO0FBQ3RCLGFBQWEsbUZBQWE7QUFDMUIsUUFBUSxtRkFBYTtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsdUZBQW1CO0FBQ2pDLHNCQUFzQixnREFBbUIsQ0FBQywyQ0FBYyxxQkFBcUIsZ0RBQW1CO0FBQ2hHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUcsZ0JBQWdCLGdEQUFtQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxPQUFPLHlFQUFZO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLHlFQUFZO0FBQ3JCO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIO0FBQ08seUJBQXlCLHVDQUFVO0FBQzFDLDRCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1SUE7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLHdCQUF3QixvQ0FBb0MseUNBQXlDLGtDQUFrQywwREFBMEQsMEJBQTBCO0FBQ3BQLDRCQUE0QixnQkFBZ0Isc0JBQXNCLE9BQU8sa0RBQWtELHNEQUFzRCw4QkFBOEIsbUpBQW1KLHFFQUFxRSxLQUFLO0FBQzVhLG9DQUFvQyxvRUFBb0UsMERBQTBEO0FBQ2xLLDZCQUE2QixtQ0FBbUM7QUFDaEUsOEJBQThCLDBDQUEwQywrQkFBK0Isb0JBQW9CLG1DQUFtQyxvQ0FBb0MsdUVBQXVFO0FBQ3pRLDBDQUEwQywwQkFBMEIsbURBQW1ELG9DQUFvQyx5Q0FBeUMsWUFBWSxjQUFjLHdDQUF3QyxxREFBcUQ7QUFDM1QsK0NBQStDLDBCQUEwQixZQUFZLHVCQUF1Qiw4QkFBOEIsbUNBQW1DLGVBQWU7QUFDNUwsc0JBQXNCLHdFQUF3RSxnQkFBZ0Isc0JBQXNCLE9BQU8sc0JBQXNCLG9CQUFvQixnREFBZ0QsV0FBVztBQUNqTjtBQUMyQztBQUM5QztBQUNXO0FBQ0o7QUFDUTtBQUN3RDtBQUN4QztBQUNaO0FBQ1A7QUFDNEQ7QUFDM0M7QUFDa0I7QUFDWDtBQUNjO0FBQ2Y7QUFDSjtBQUNTO0FBQ3BCO0FBQ2E7QUFDTDtBQUNVO0FBQzNCO0FBQ3NDO0FBQ1A7QUFDQTtBQUNIO0FBQ3dDO0FBQ25COztBQUV4RjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyw4RUFBa0I7QUFDN0I7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLDhFQUFrQjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixXQUFXO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLGtCQUFrQjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixpREFBb0I7QUFDdkM7QUFDQSwyQkFBMkIsK0NBQWtCO0FBQzdDLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSixvQkFBb0IsbURBQUk7QUFDeEIsMkJBQTJCLGdEQUFtQixDQUFDLG9EQUFHLGFBQWE7QUFDL0Q7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsZ0JBQWdCLHFFQUFTO0FBQ3pCLGtCQUFrQiw2RkFBcUI7QUFDdkMsdUJBQXVCLHlHQUFpQztBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUssaUNBQWlDO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLGdEQUFtQixDQUFDLDREQUFLO0FBQy9DO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLHlCQUF5Qiw4Q0FBTztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxjQUFjO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0wsR0FBRztBQUNILHNCQUFzQixnREFBbUIsQ0FBQyw2RkFBaUM7QUFDM0U7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsaURBQWlELEVBQUUsOEZBQXNCLGFBQWE7QUFDdEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxzQkFBc0IsZ0RBQW1CLENBQUMsMkNBQWMsNEZBQTRGLGdEQUFtQixDQUFDLHdEQUFLLGFBQWE7QUFDMUw7QUFDQSxHQUFHLGlCQUFpQixnREFBbUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBLG9CQUFvQiw4RUFBYztBQUNsQyxzQ0FBc0MsK0NBQVE7QUFDOUM7QUFDQSwyQkFBMkIsa0RBQVc7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsNkJBQTZCLGtEQUFXO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLGdEQUFtQjtBQUN6QztBQUNBO0FBQ0EsR0FBRywrQkFBK0IsZ0RBQW1CLENBQUMscUZBQWlCO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0gsNkJBQTZCLHNFQUFXO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQ0FBK0MsWUFBWTtBQUMzRCxlQUFlLHNFQUFXO0FBQzFCLGVBQWUsc0VBQVc7QUFDMUIsV0FBVztBQUNYOztBQUVBO0FBQ0E7QUFDQSwrQ0FBK0MsWUFBWTtBQUMzRCxlQUFlLHNFQUFXO0FBQzFCLGVBQWUsc0VBQVc7QUFDMUIsV0FBVztBQUNYO0FBQ0EsNkNBQTZDLFlBQVk7QUFDekQ7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTtBQUNBLDBCQUEwQixnREFBbUI7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdEQUFtQjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUcsZ0JBQWdCLGdEQUFtQixDQUFDLGtGQUFzQjtBQUM3RDtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLDBCQUEwQiw2Q0FBTTtBQUNoQyxpQ0FBaUMsNkNBQU07QUFDdkMsZ0JBQWdCLDZDQUFNO0FBQ3RCLHNCQUFzQixnREFBbUI7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsNkVBQWlCO0FBQy9CO0FBQ0E7O0FBRUE7QUFDQSw0QkFBNEIsNENBQVM7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsbURBQUk7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNLEVBQUUsOEdBQThCO0FBQ3RDLGtCQUFrQixxRUFBUztBQUMzQjtBQUNBLHdCQUF3QixnREFBbUIsQ0FBQywyQ0FBYyxxQkFBcUIsZ0RBQW1CLENBQUMsNERBQUs7QUFDeEc7QUFDQSxLQUFLLDJCQUEyQixnREFBbUIsNEJBQTRCLGdEQUFtQixDQUFDLG1GQUFxQjtBQUN4SDtBQUNBO0FBQ0E7QUFDQSxLQUFLLDRCQUE0QixnREFBbUI7QUFDcEQ7QUFDQSxLQUFLLGVBQWUsZ0RBQW1CO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxrQkFBa0IsZ0RBQW1CLENBQUMsbUZBQWtCO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLLGVBQWUsZ0RBQW1CO0FBQ3ZDO0FBQ0E7QUFDQSxLQUFLLGtCQUFrQixnREFBbUIsQ0FBQywyRUFBWTtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IseURBQU07QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2Qix3RkFBbUI7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLElBQUksRUFBRSw4RUFBWTtBQUNsQixpQkFBaUIsOERBQVc7QUFDNUIsZUFBZSxzRkFBYztBQUM3QixtQkFBbUIsaUZBQWE7QUFDaEMsZUFBZSxzRUFBYyxVQUFVLDBGQUFnQjtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0osc0JBQXNCLGdEQUFtQiwyQkFBMkI7QUFDcEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLGdCQUFnQiw2RUFBaUI7QUFDakM7QUFDQSxlQUFlLG1GQUF1QjtBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLGVBQWUsb0VBQVM7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLG9FQUFTO0FBQ3JCLFlBQVksbUZBQXVCO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxjQUFjLHdGQUFtQjtBQUNqQyxtQkFBbUIsaUZBQWE7QUFDaEMsc0JBQXNCLGdEQUFtQixDQUFDLCtGQUF1QjtBQUNqRTtBQUNBO0FBQ0EsR0FBRyxxQkFBcUIsZ0RBQW1CLENBQUMsMkNBQWMscUJBQXFCLGdEQUFtQixDQUFDLCtFQUFnQjtBQUNuSDtBQUNBLEdBQUcsZ0JBQWdCLGdEQUFtQixDQUFDLDZGQUF1QjtBQUM5RDtBQUNBO0FBQ0EsR0FBRyxnQkFBZ0IsZ0RBQW1CLENBQUMsd0ZBQXlCO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUcsZ0JBQWdCLGdEQUFtQixzQkFBc0I7QUFDNUQ7QUFDQSxHQUFHO0FBQ0g7QUFDTyx3QkFBd0IsdUNBQVU7QUFDekMsMEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQy9wQkEseUJBQXlCLHdCQUF3QixvQ0FBb0MseUNBQXlDLGtDQUFrQywwREFBMEQsMEJBQTBCO0FBQ3BQLDRCQUE0QixnQkFBZ0Isc0JBQXNCLE9BQU8sa0RBQWtELHNEQUFzRCw4QkFBOEIsbUpBQW1KLHFFQUFxRSxLQUFLO0FBQzVhLG9DQUFvQyxvRUFBb0UsMERBQTBEO0FBQ2xLLDZCQUE2QixtQ0FBbUM7QUFDaEUsOEJBQThCLDBDQUEwQywrQkFBK0Isb0JBQW9CLG1DQUFtQyxvQ0FBb0MsdUVBQXVFO0FBQ3pRLHNCQUFzQix3RUFBd0UsZ0JBQWdCLHNCQUFzQixPQUFPLHNCQUFzQixvQkFBb0IsZ0RBQWdELFdBQVc7QUFDak47QUFDYztBQUNqQjtBQUNlO0FBQ3FEO0FBQ25CO0FBQzlCO0FBQ0E7QUFDdUI7QUFDTjtBQUNHO0FBQ1I7QUFDRztBQUNVO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQSxlQUFlLG1GQUFtQjtBQUNsQztBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLDhFQUFjO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixpREFBb0I7QUFDdkM7QUFDQSx3QkFBd0IsK0NBQWtCO0FBQzFDLElBQUk7QUFDSjtBQUNBLElBQUk7QUFDSix3QkFBd0IsZ0RBQW1CLENBQUMsZ0VBQVMsYUFBYTtBQUNsRTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixxRUFBYztBQUMvQixFQUFFLGdEQUFTO0FBQ1gsYUFBYSxnRkFBTztBQUNwQjtBQUNBLGVBQWUsbUZBQVU7QUFDekI7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKLG1CQUFtQixvRkFBYTtBQUNoQyxtQkFBbUIsaUZBQWE7QUFDaEMsbUJBQW1CLHFFQUFjLFVBQVUseUZBQWU7QUFDMUQsbUJBQW1CLHFFQUFjLFVBQVUseUZBQWU7QUFDMUQ7QUFDQTtBQUNBO0FBQ0EsY0FBYyxxRUFBVTtBQUN4QixjQUFjLHFFQUFVO0FBQ3hCLGNBQWMscUVBQVU7QUFDeEIsY0FBYyxxRUFBVTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsZ0RBQW1CLENBQUMsNERBQUs7QUFDL0MsZUFBZSxtREFBSTtBQUNuQixHQUFHO0FBQ0g7QUFDQSxHQUFHLEVBQUUsOEZBQXNCLCtCQUErQixnREFBbUIsQ0FBQyxxRkFBNkIscUJBQXFCLGdEQUFtQixDQUFDLG1GQUEyQjtBQUMvSztBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0Esc0JBQXNCLGdEQUFtQixDQUFDLDJDQUFjLHFCQUFxQixnREFBbUI7QUFDaEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHLGdCQUFnQixnREFBbUI7QUFDdEM7O0FBRUE7QUFDTyw0QkFBNEIsNENBQVM7QUFDNUM7QUFDQSx3QkFBd0IsZ0RBQW1CO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsRSIsInNvdXJjZXMiOlsid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jYXJ0ZXNpYW4vZ2V0RXF1aWRpc3RhbnRUaWNrcy5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvY2FydGVzaWFuL2dldFRpY2tzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jYXJ0ZXNpYW4vU2NhdHRlci5qcyIsIndlYnBhY2s6Ly9ndWl2Mi8uL25vZGVfbW9kdWxlcy9yZWNoYXJ0cy9lczYvY2FydGVzaWFuL1lBeGlzLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jYXJ0ZXNpYW4vUmVmZXJlbmNlRG90LmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jYXJ0ZXNpYW4vWkF4aXMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L2NhcnRlc2lhbi9SZWZlcmVuY2VMaW5lLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jYXJ0ZXNpYW4vWEF4aXMuanMiLCJ3ZWJwYWNrOi8vZ3VpdjIvLi9ub2RlX21vZHVsZXMvcmVjaGFydHMvZXM2L2NhcnRlc2lhbi9MaW5lLmpzIiwid2VicGFjazovL2d1aXYyLy4vbm9kZV9tb2R1bGVzL3JlY2hhcnRzL2VzNi9jYXJ0ZXNpYW4vUmVmZXJlbmNlQXJlYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc1Zpc2libGUgfSBmcm9tICcuLi91dGlsL1RpY2tVdGlscyc7XG5pbXBvcnQgeyBnZXRFdmVyeU50aFdpdGhDb25kaXRpb24gfSBmcm9tICcuLi91dGlsL2dldEV2ZXJ5TnRoV2l0aENvbmRpdGlvbic7XG5leHBvcnQgZnVuY3Rpb24gZ2V0RXF1aWRpc3RhbnRUaWNrcyhzaWduLCBib3VuZGFyaWVzLCBnZXRUaWNrU2l6ZSwgdGlja3MsIG1pblRpY2tHYXApIHtcbiAgLy8gSWYgdGhlIHRpY2tzIGFyZSByZWFkb25seSwgdGhlbiB0aGUgc2xpY2UgbWlnaHQgbm90IGJlIG5lY2Vzc2FyeVxuICB2YXIgcmVzdWx0ID0gKHRpY2tzIHx8IFtdKS5zbGljZSgpO1xuICB2YXIge1xuICAgIHN0YXJ0OiBpbml0aWFsU3RhcnQsXG4gICAgZW5kXG4gIH0gPSBib3VuZGFyaWVzO1xuICB2YXIgaW5kZXggPSAwO1xuICAvLyBQcmVtYXR1cmUgb3B0aW1pc2F0aW9uIGlkZWEgMTogRXN0aW1hdGUgYSBsb3dlciBib3VuZCwgYW5kIHN0YXJ0IGZyb20gdGhlcmUuXG4gIC8vIEZvciBub3csIHN0YXJ0IGZyb20gZXZlcnkgdGlja1xuICB2YXIgc3RlcHNpemUgPSAxO1xuICB2YXIgc3RhcnQgPSBpbml0aWFsU3RhcnQ7XG4gIHZhciBfbG9vcCA9IGZ1bmN0aW9uIF9sb29wKCkge1xuICAgICAgLy8gR2l2ZW4gc3RlcHNpemUsIGV2YWx1YXRlIHdoZXRoZXIgZXZlcnkgc3RlcHNpemUtdGggdGljayBjYW4gYmUgc2hvd24uXG4gICAgICAvLyBJZiBpdCBjYW4gbm90LCB0aGVuIGluY3JlYXNlIHRoZSBzdGVwc2l6ZSBieSAxLCBhbmQgdHJ5IGFnYWluLlxuXG4gICAgICB2YXIgZW50cnkgPSB0aWNrcyA9PT0gbnVsbCB8fCB0aWNrcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogdGlja3NbaW5kZXhdO1xuXG4gICAgICAvLyBCcmVhayBjb25kaXRpb24gLSBJZiB3ZSBoYXZlIGV2YWx1YXRlZCBhbGwgdGhlIHRpY2tzLCB0aGVuIHdlIGFyZSBkb25lLlxuICAgICAgaWYgKGVudHJ5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB2OiBnZXRFdmVyeU50aFdpdGhDb25kaXRpb24odGlja3MsIHN0ZXBzaXplKVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiB0aGUgZWxlbWVudCBjb2xsaWRlcyB3aXRoIHRoZSBuZXh0IGVsZW1lbnRcbiAgICAgIHZhciBpID0gaW5kZXg7XG4gICAgICB2YXIgc2l6ZTtcbiAgICAgIHZhciBnZXRTaXplID0gKCkgPT4ge1xuICAgICAgICBpZiAoc2l6ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgc2l6ZSA9IGdldFRpY2tTaXplKGVudHJ5LCBpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2l6ZTtcbiAgICAgIH07XG4gICAgICB2YXIgdGlja0Nvb3JkID0gZW50cnkuY29vcmRpbmF0ZTtcbiAgICAgIC8vIFdlIHdpbGwgYWx3YXlzIHNob3cgdGhlIGZpcnN0IHRpY2suXG4gICAgICB2YXIgaXNTaG93ID0gaW5kZXggPT09IDAgfHwgaXNWaXNpYmxlKHNpZ24sIHRpY2tDb29yZCwgZ2V0U2l6ZSwgc3RhcnQsIGVuZCk7XG4gICAgICBpZiAoIWlzU2hvdykge1xuICAgICAgICAvLyBTdGFydCBhbGwgb3ZlciB3aXRoIGEgbGFyZ2VyIHN0ZXBzaXplXG4gICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgc3RhcnQgPSBpbml0aWFsU3RhcnQ7XG4gICAgICAgIHN0ZXBzaXplICs9IDE7XG4gICAgICB9XG4gICAgICBpZiAoaXNTaG93KSB7XG4gICAgICAgIC8vIElmIGl0IGNhbiBiZSBzaG93biwgdXBkYXRlIHRoZSBzdGFydFxuICAgICAgICBzdGFydCA9IHRpY2tDb29yZCArIHNpZ24gKiAoZ2V0U2l6ZSgpIC8gMiArIG1pblRpY2tHYXApO1xuICAgICAgICBpbmRleCArPSBzdGVwc2l6ZTtcbiAgICAgIH1cbiAgICB9LFxuICAgIF9yZXQ7XG4gIHdoaWxlIChzdGVwc2l6ZSA8PSByZXN1bHQubGVuZ3RoKSB7XG4gICAgX3JldCA9IF9sb29wKCk7XG4gICAgaWYgKF9yZXQpIHJldHVybiBfcmV0LnY7XG4gIH1cbiAgcmV0dXJuIFtdO1xufSIsImZ1bmN0aW9uIG93bktleXMoZSwgcikgeyB2YXIgdCA9IE9iamVjdC5rZXlzKGUpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IHIgJiYgKG8gPSBvLmZpbHRlcihmdW5jdGlvbiAocikgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCByKS5lbnVtZXJhYmxlOyB9KSksIHQucHVzaC5hcHBseSh0LCBvKTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZChlKSB7IGZvciAodmFyIHIgPSAxOyByIDwgYXJndW1lbnRzLmxlbmd0aDsgcisrKSB7IHZhciB0ID0gbnVsbCAhPSBhcmd1bWVudHNbcl0gPyBhcmd1bWVudHNbcl0gOiB7fTsgciAlIDIgPyBvd25LZXlzKE9iamVjdCh0KSwgITApLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgX2RlZmluZVByb3BlcnR5KGUsIHIsIHRbcl0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModCkpIDogb3duS2V5cyhPYmplY3QodCkpLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCwgcikpOyB9KTsgfSByZXR1cm4gZTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGUsIHIsIHQpIHsgcmV0dXJuIChyID0gX3RvUHJvcGVydHlLZXkocikpIGluIGUgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgeyB2YWx1ZTogdCwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSA6IGVbcl0gPSB0LCBlOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleSh0KSB7IHZhciBpID0gX3RvUHJpbWl0aXZlKHQsIFwic3RyaW5nXCIpOyByZXR1cm4gXCJzeW1ib2xcIiA9PSB0eXBlb2YgaSA/IGkgOiBpICsgXCJcIjsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKHQsIHIpIHsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIHQgfHwgIXQpIHJldHVybiB0OyB2YXIgZSA9IHRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHZvaWQgMCAhPT0gZSkgeyB2YXIgaSA9IGUuY2FsbCh0LCByIHx8IFwiZGVmYXVsdFwiKTsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIGkpIHJldHVybiBpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChcInN0cmluZ1wiID09PSByID8gU3RyaW5nIDogTnVtYmVyKSh0KTsgfVxuaW1wb3J0IHsgbWF0aFNpZ24sIGlzTnVtYmVyIH0gZnJvbSAnLi4vdXRpbC9EYXRhVXRpbHMnO1xuaW1wb3J0IHsgZ2V0U3RyaW5nU2l6ZSB9IGZyb20gJy4uL3V0aWwvRE9NVXRpbHMnO1xuaW1wb3J0IHsgR2xvYmFsIH0gZnJvbSAnLi4vdXRpbC9HbG9iYWwnO1xuaW1wb3J0IHsgaXNWaXNpYmxlLCBnZXRUaWNrQm91bmRhcmllcywgZ2V0TnVtYmVySW50ZXJ2YWxUaWNrcywgZ2V0QW5nbGVkVGlja1dpZHRoIH0gZnJvbSAnLi4vdXRpbC9UaWNrVXRpbHMnO1xuaW1wb3J0IHsgZ2V0RXF1aWRpc3RhbnRUaWNrcyB9IGZyb20gJy4vZ2V0RXF1aWRpc3RhbnRUaWNrcyc7XG5mdW5jdGlvbiBnZXRUaWNrc0VuZChzaWduLCBib3VuZGFyaWVzLCBnZXRUaWNrU2l6ZSwgdGlja3MsIG1pblRpY2tHYXApIHtcbiAgdmFyIHJlc3VsdCA9ICh0aWNrcyB8fCBbXSkuc2xpY2UoKTtcbiAgdmFyIGxlbiA9IHJlc3VsdC5sZW5ndGg7XG4gIHZhciB7XG4gICAgc3RhcnRcbiAgfSA9IGJvdW5kYXJpZXM7XG4gIHZhciB7XG4gICAgZW5kXG4gIH0gPSBib3VuZGFyaWVzO1xuICB2YXIgX2xvb3AgPSBmdW5jdGlvbiBfbG9vcChpKSB7XG4gICAgdmFyIGVudHJ5ID0gcmVzdWx0W2ldO1xuICAgIHZhciBzaXplO1xuICAgIHZhciBnZXRTaXplID0gKCkgPT4ge1xuICAgICAgaWYgKHNpemUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzaXplID0gZ2V0VGlja1NpemUoZW50cnksIGkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNpemU7XG4gICAgfTtcbiAgICBpZiAoaSA9PT0gbGVuIC0gMSkge1xuICAgICAgdmFyIGdhcCA9IHNpZ24gKiAoZW50cnkuY29vcmRpbmF0ZSArIHNpZ24gKiBnZXRTaXplKCkgLyAyIC0gZW5kKTtcbiAgICAgIHJlc3VsdFtpXSA9IGVudHJ5ID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBlbnRyeSksIHt9LCB7XG4gICAgICAgIHRpY2tDb29yZDogZ2FwID4gMCA/IGVudHJ5LmNvb3JkaW5hdGUgLSBnYXAgKiBzaWduIDogZW50cnkuY29vcmRpbmF0ZVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtpXSA9IGVudHJ5ID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBlbnRyeSksIHt9LCB7XG4gICAgICAgIHRpY2tDb29yZDogZW50cnkuY29vcmRpbmF0ZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHZhciBpc1Nob3cgPSBpc1Zpc2libGUoc2lnbiwgZW50cnkudGlja0Nvb3JkLCBnZXRTaXplLCBzdGFydCwgZW5kKTtcbiAgICBpZiAoaXNTaG93KSB7XG4gICAgICBlbmQgPSBlbnRyeS50aWNrQ29vcmQgLSBzaWduICogKGdldFNpemUoKSAvIDIgKyBtaW5UaWNrR2FwKTtcbiAgICAgIHJlc3VsdFtpXSA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgZW50cnkpLCB7fSwge1xuICAgICAgICBpc1Nob3c6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgZm9yICh2YXIgaSA9IGxlbiAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgX2xvb3AoaSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGdldFRpY2tzU3RhcnQoc2lnbiwgYm91bmRhcmllcywgZ2V0VGlja1NpemUsIHRpY2tzLCBtaW5UaWNrR2FwLCBwcmVzZXJ2ZUVuZCkge1xuICAvLyBUaGlzIG1ldGhvZCBpcyBtdXRhdGluZyB0aGUgYXJyYXkgc28gY2xvbmUgaXMgaW5kZWVkIG5lY2Vzc2FyeSBoZXJlXG4gIHZhciByZXN1bHQgPSAodGlja3MgfHwgW10pLnNsaWNlKCk7XG4gIHZhciBsZW4gPSByZXN1bHQubGVuZ3RoO1xuICB2YXIge1xuICAgIHN0YXJ0LFxuICAgIGVuZFxuICB9ID0gYm91bmRhcmllcztcbiAgaWYgKHByZXNlcnZlRW5kKSB7XG4gICAgLy8gVHJ5IHRvIGd1YXJhbnRlZSB0aGUgdGFpbCB0byBiZSBkaXNwbGF5ZWRcbiAgICB2YXIgdGFpbCA9IHRpY2tzW2xlbiAtIDFdO1xuICAgIHZhciB0YWlsU2l6ZSA9IGdldFRpY2tTaXplKHRhaWwsIGxlbiAtIDEpO1xuICAgIHZhciB0YWlsR2FwID0gc2lnbiAqICh0YWlsLmNvb3JkaW5hdGUgKyBzaWduICogdGFpbFNpemUgLyAyIC0gZW5kKTtcbiAgICByZXN1bHRbbGVuIC0gMV0gPSB0YWlsID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCB0YWlsKSwge30sIHtcbiAgICAgIHRpY2tDb29yZDogdGFpbEdhcCA+IDAgPyB0YWlsLmNvb3JkaW5hdGUgLSB0YWlsR2FwICogc2lnbiA6IHRhaWwuY29vcmRpbmF0ZVxuICAgIH0pO1xuICAgIHZhciBpc1RhaWxTaG93ID0gaXNWaXNpYmxlKHNpZ24sIHRhaWwudGlja0Nvb3JkLCAoKSA9PiB0YWlsU2l6ZSwgc3RhcnQsIGVuZCk7XG4gICAgaWYgKGlzVGFpbFNob3cpIHtcbiAgICAgIGVuZCA9IHRhaWwudGlja0Nvb3JkIC0gc2lnbiAqICh0YWlsU2l6ZSAvIDIgKyBtaW5UaWNrR2FwKTtcbiAgICAgIHJlc3VsdFtsZW4gLSAxXSA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgdGFpbCksIHt9LCB7XG4gICAgICAgIGlzU2hvdzogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIHZhciBjb3VudCA9IHByZXNlcnZlRW5kID8gbGVuIC0gMSA6IGxlbjtcbiAgdmFyIF9sb29wMiA9IGZ1bmN0aW9uIF9sb29wMihpKSB7XG4gICAgdmFyIGVudHJ5ID0gcmVzdWx0W2ldO1xuICAgIHZhciBzaXplO1xuICAgIHZhciBnZXRTaXplID0gKCkgPT4ge1xuICAgICAgaWYgKHNpemUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzaXplID0gZ2V0VGlja1NpemUoZW50cnksIGkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNpemU7XG4gICAgfTtcbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgdmFyIGdhcCA9IHNpZ24gKiAoZW50cnkuY29vcmRpbmF0ZSAtIHNpZ24gKiBnZXRTaXplKCkgLyAyIC0gc3RhcnQpO1xuICAgICAgcmVzdWx0W2ldID0gZW50cnkgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5KSwge30sIHtcbiAgICAgICAgdGlja0Nvb3JkOiBnYXAgPCAwID8gZW50cnkuY29vcmRpbmF0ZSAtIGdhcCAqIHNpZ24gOiBlbnRyeS5jb29yZGluYXRlXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0W2ldID0gZW50cnkgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5KSwge30sIHtcbiAgICAgICAgdGlja0Nvb3JkOiBlbnRyeS5jb29yZGluYXRlXG4gICAgICB9KTtcbiAgICB9XG4gICAgdmFyIGlzU2hvdyA9IGlzVmlzaWJsZShzaWduLCBlbnRyeS50aWNrQ29vcmQsIGdldFNpemUsIHN0YXJ0LCBlbmQpO1xuICAgIGlmIChpc1Nob3cpIHtcbiAgICAgIHN0YXJ0ID0gZW50cnkudGlja0Nvb3JkICsgc2lnbiAqIChnZXRTaXplKCkgLyAyICsgbWluVGlja0dhcCk7XG4gICAgICByZXN1bHRbaV0gPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5KSwge30sIHtcbiAgICAgICAgaXNTaG93OiB0cnVlXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgIF9sb29wMihpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFRpY2tzKHByb3BzLCBmb250U2l6ZSwgbGV0dGVyU3BhY2luZykge1xuICB2YXIge1xuICAgIHRpY2ssXG4gICAgdGlja3MsXG4gICAgdmlld0JveCxcbiAgICBtaW5UaWNrR2FwLFxuICAgIG9yaWVudGF0aW9uLFxuICAgIGludGVydmFsLFxuICAgIHRpY2tGb3JtYXR0ZXIsXG4gICAgdW5pdCxcbiAgICBhbmdsZVxuICB9ID0gcHJvcHM7XG4gIGlmICghdGlja3MgfHwgIXRpY2tzLmxlbmd0aCB8fCAhdGljaykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBpZiAoaXNOdW1iZXIoaW50ZXJ2YWwpIHx8IEdsb2JhbC5pc1Nzcikge1xuICAgIHZhciBfZ2V0TnVtYmVySW50ZXJ2YWxUaWM7XG4gICAgcmV0dXJuIChfZ2V0TnVtYmVySW50ZXJ2YWxUaWMgPSBnZXROdW1iZXJJbnRlcnZhbFRpY2tzKHRpY2tzLCBpc051bWJlcihpbnRlcnZhbCkgPyBpbnRlcnZhbCA6IDApKSAhPT0gbnVsbCAmJiBfZ2V0TnVtYmVySW50ZXJ2YWxUaWMgIT09IHZvaWQgMCA/IF9nZXROdW1iZXJJbnRlcnZhbFRpYyA6IFtdO1xuICB9XG4gIHZhciBjYW5kaWRhdGVzID0gW107XG4gIHZhciBzaXplS2V5ID0gb3JpZW50YXRpb24gPT09ICd0b3AnIHx8IG9yaWVudGF0aW9uID09PSAnYm90dG9tJyA/ICd3aWR0aCcgOiAnaGVpZ2h0JztcbiAgdmFyIHVuaXRTaXplID0gdW5pdCAmJiBzaXplS2V5ID09PSAnd2lkdGgnID8gZ2V0U3RyaW5nU2l6ZSh1bml0LCB7XG4gICAgZm9udFNpemUsXG4gICAgbGV0dGVyU3BhY2luZ1xuICB9KSA6IHtcbiAgICB3aWR0aDogMCxcbiAgICBoZWlnaHQ6IDBcbiAgfTtcbiAgdmFyIGdldFRpY2tTaXplID0gKGNvbnRlbnQsIGluZGV4KSA9PiB7XG4gICAgdmFyIHZhbHVlID0gdHlwZW9mIHRpY2tGb3JtYXR0ZXIgPT09ICdmdW5jdGlvbicgPyB0aWNrRm9ybWF0dGVyKGNvbnRlbnQudmFsdWUsIGluZGV4KSA6IGNvbnRlbnQudmFsdWU7XG4gICAgLy8gUmVjaGFydHMgb25seSBzdXBwb3J0cyBhbmdsZXMgd2hlbiBzaXplS2V5ID09PSAnd2lkdGgnXG4gICAgcmV0dXJuIHNpemVLZXkgPT09ICd3aWR0aCcgPyBnZXRBbmdsZWRUaWNrV2lkdGgoZ2V0U3RyaW5nU2l6ZSh2YWx1ZSwge1xuICAgICAgZm9udFNpemUsXG4gICAgICBsZXR0ZXJTcGFjaW5nXG4gICAgfSksIHVuaXRTaXplLCBhbmdsZSkgOiBnZXRTdHJpbmdTaXplKHZhbHVlLCB7XG4gICAgICBmb250U2l6ZSxcbiAgICAgIGxldHRlclNwYWNpbmdcbiAgICB9KVtzaXplS2V5XTtcbiAgfTtcbiAgdmFyIHNpZ24gPSB0aWNrcy5sZW5ndGggPj0gMiA/IG1hdGhTaWduKHRpY2tzWzFdLmNvb3JkaW5hdGUgLSB0aWNrc1swXS5jb29yZGluYXRlKSA6IDE7XG4gIHZhciBib3VuZGFyaWVzID0gZ2V0VGlja0JvdW5kYXJpZXModmlld0JveCwgc2lnbiwgc2l6ZUtleSk7XG4gIGlmIChpbnRlcnZhbCA9PT0gJ2VxdWlkaXN0YW50UHJlc2VydmVTdGFydCcpIHtcbiAgICByZXR1cm4gZ2V0RXF1aWRpc3RhbnRUaWNrcyhzaWduLCBib3VuZGFyaWVzLCBnZXRUaWNrU2l6ZSwgdGlja3MsIG1pblRpY2tHYXApO1xuICB9XG4gIGlmIChpbnRlcnZhbCA9PT0gJ3ByZXNlcnZlU3RhcnQnIHx8IGludGVydmFsID09PSAncHJlc2VydmVTdGFydEVuZCcpIHtcbiAgICBjYW5kaWRhdGVzID0gZ2V0VGlja3NTdGFydChzaWduLCBib3VuZGFyaWVzLCBnZXRUaWNrU2l6ZSwgdGlja3MsIG1pblRpY2tHYXAsIGludGVydmFsID09PSAncHJlc2VydmVTdGFydEVuZCcpO1xuICB9IGVsc2Uge1xuICAgIGNhbmRpZGF0ZXMgPSBnZXRUaWNrc0VuZChzaWduLCBib3VuZGFyaWVzLCBnZXRUaWNrU2l6ZSwgdGlja3MsIG1pblRpY2tHYXApO1xuICB9XG4gIHJldHVybiBjYW5kaWRhdGVzLmZpbHRlcihlbnRyeSA9PiBlbnRyeS5pc1Nob3cpO1xufSIsInZhciBfZXhjbHVkZWQgPSBbXCJvbk1vdXNlRW50ZXJcIiwgXCJvbkNsaWNrXCIsIFwib25Nb3VzZUxlYXZlXCJdLFxuICBfZXhjbHVkZWQyID0gW1wiaWRcIl0sXG4gIF9leGNsdWRlZDMgPSBbXCJhbmltYXRpb25CZWdpblwiLCBcImFuaW1hdGlvbkR1cmF0aW9uXCIsIFwiYW5pbWF0aW9uRWFzaW5nXCIsIFwiaGlkZVwiLCBcImlzQW5pbWF0aW9uQWN0aXZlXCIsIFwibGVnZW5kVHlwZVwiLCBcImxpbmVKb2ludFR5cGVcIiwgXCJsaW5lVHlwZVwiLCBcInNoYXBlXCIsIFwieEF4aXNJZFwiLCBcInlBeGlzSWRcIiwgXCJ6QXhpc0lkXCJdO1xuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKGUsIHQpIHsgaWYgKG51bGwgPT0gZSkgcmV0dXJuIHt9OyB2YXIgbywgciwgaSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKGUsIHQpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IGZvciAociA9IDA7IHIgPCBuLmxlbmd0aDsgcisrKSBvID0gbltyXSwgLTEgPT09IHQuaW5kZXhPZihvKSAmJiB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGUsIG8pICYmIChpW29dID0gZVtvXSk7IH0gcmV0dXJuIGk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHIsIGUpIHsgaWYgKG51bGwgPT0gcikgcmV0dXJuIHt9OyB2YXIgdCA9IHt9OyBmb3IgKHZhciBuIGluIHIpIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHIsIG4pKSB7IGlmICgtMSAhPT0gZS5pbmRleE9mKG4pKSBjb250aW51ZTsgdFtuXSA9IHJbbl07IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9leHRlbmRzKCkgeyByZXR1cm4gX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAobikgeyBmb3IgKHZhciBlID0gMTsgZSA8IGFyZ3VtZW50cy5sZW5ndGg7IGUrKykgeyB2YXIgdCA9IGFyZ3VtZW50c1tlXTsgZm9yICh2YXIgciBpbiB0KSAoe30pLmhhc093blByb3BlcnR5LmNhbGwodCwgcikgJiYgKG5bcl0gPSB0W3JdKTsgfSByZXR1cm4gbjsgfSwgX2V4dGVuZHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuZnVuY3Rpb24gb3duS2V5cyhlLCByKSB7IHZhciB0ID0gT2JqZWN0LmtleXMoZSk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBvID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhlKTsgciAmJiAobyA9IG8uZmlsdGVyKGZ1bmN0aW9uIChyKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGUsIHIpLmVudW1lcmFibGU7IH0pKSwgdC5wdXNoLmFwcGx5KHQsIG8pOyB9IHJldHVybiB0OyB9XG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKGUpIHsgZm9yICh2YXIgciA9IDE7IHIgPCBhcmd1bWVudHMubGVuZ3RoOyByKyspIHsgdmFyIHQgPSBudWxsICE9IGFyZ3VtZW50c1tyXSA/IGFyZ3VtZW50c1tyXSA6IHt9OyByICUgMiA/IG93bktleXMoT2JqZWN0KHQpLCAhMCkuZm9yRWFjaChmdW5jdGlvbiAocikgeyBfZGVmaW5lUHJvcGVydHkoZSwgciwgdFtyXSk7IH0pIDogT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhlLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyh0KSkgOiBvd25LZXlzKE9iamVjdCh0KSkuZm9yRWFjaChmdW5jdGlvbiAocikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0LCByKSk7IH0pOyB9IHJldHVybiBlOyB9XG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkoZSwgciwgdCkgeyByZXR1cm4gKHIgPSBfdG9Qcm9wZXJ0eUtleShyKSkgaW4gZSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCB7IHZhbHVlOiB0LCBlbnVtZXJhYmxlOiAhMCwgY29uZmlndXJhYmxlOiAhMCwgd3JpdGFibGU6ICEwIH0pIDogZVtyXSA9IHQsIGU7IH1cbmZ1bmN0aW9uIF90b1Byb3BlcnR5S2V5KHQpIHsgdmFyIGkgPSBfdG9QcmltaXRpdmUodCwgXCJzdHJpbmdcIik7IHJldHVybiBcInN5bWJvbFwiID09IHR5cGVvZiBpID8gaSA6IGkgKyBcIlwiOyB9XG5mdW5jdGlvbiBfdG9QcmltaXRpdmUodCwgcikgeyBpZiAoXCJvYmplY3RcIiAhPSB0eXBlb2YgdCB8fCAhdCkgcmV0dXJuIHQ7IHZhciBlID0gdFtTeW1ib2wudG9QcmltaXRpdmVdOyBpZiAodm9pZCAwICE9PSBlKSB7IHZhciBpID0gZS5jYWxsKHQsIHIgfHwgXCJkZWZhdWx0XCIpOyBpZiAoXCJvYmplY3RcIiAhPSB0eXBlb2YgaSkgcmV0dXJuIGk7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJAQHRvUHJpbWl0aXZlIG11c3QgcmV0dXJuIGEgcHJpbWl0aXZlIHZhbHVlLlwiKTsgfSByZXR1cm4gKFwic3RyaW5nXCIgPT09IHIgPyBTdHJpbmcgOiBOdW1iZXIpKHQpOyB9XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VDYWxsYmFjaywgdXNlTWVtbywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IExheWVyIH0gZnJvbSAnLi4vY29udGFpbmVyL0xheWVyJztcbmltcG9ydCB7IENhcnRlc2lhbkxhYmVsTGlzdENvbnRleHRQcm92aWRlciwgTGFiZWxMaXN0RnJvbUxhYmVsUHJvcCB9IGZyb20gJy4uL2NvbXBvbmVudC9MYWJlbExpc3QnO1xuaW1wb3J0IHsgZmluZEFsbEJ5VHlwZSB9IGZyb20gJy4uL3V0aWwvUmVhY3RVdGlscyc7XG5pbXBvcnQgeyBHbG9iYWwgfSBmcm9tICcuLi91dGlsL0dsb2JhbCc7XG5pbXBvcnQgeyBaQXhpcyB9IGZyb20gJy4vWkF4aXMnO1xuaW1wb3J0IHsgQ3VydmUgfSBmcm9tICcuLi9zaGFwZS9DdXJ2ZSc7XG5pbXBvcnQgeyBDZWxsIH0gZnJvbSAnLi4vY29tcG9uZW50L0NlbGwnO1xuaW1wb3J0IHsgZ2V0TGluZWFyUmVncmVzc2lvbiwgaW50ZXJwb2xhdGVOdW1iZXIsIGlzTnVsbGlzaCB9IGZyb20gJy4uL3V0aWwvRGF0YVV0aWxzJztcbmltcG9ydCB7IGdldENhdGVDb29yZGluYXRlT2ZMaW5lLCBnZXRUb29sdGlwTmFtZVByb3AsIGdldFZhbHVlQnlEYXRhS2V5IH0gZnJvbSAnLi4vdXRpbC9DaGFydFV0aWxzJztcbmltcG9ydCB7IGFkYXB0RXZlbnRzT2ZDaGlsZCB9IGZyb20gJy4uL3V0aWwvdHlwZXMnO1xuaW1wb3J0IHsgU2NhdHRlclN5bWJvbCB9IGZyb20gJy4uL3V0aWwvU2NhdHRlclV0aWxzJztcbmltcG9ydCB7IHVzZU1vdXNlQ2xpY2tJdGVtRGlzcGF0Y2gsIHVzZU1vdXNlRW50ZXJJdGVtRGlzcGF0Y2gsIHVzZU1vdXNlTGVhdmVJdGVtRGlzcGF0Y2ggfSBmcm9tICcuLi9jb250ZXh0L3Rvb2x0aXBDb250ZXh0JztcbmltcG9ydCB7IFNldFRvb2x0aXBFbnRyeVNldHRpbmdzIH0gZnJvbSAnLi4vc3RhdGUvU2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MnO1xuaW1wb3J0IHsgU2V0RXJyb3JCYXJDb250ZXh0IH0gZnJvbSAnLi4vY29udGV4dC9FcnJvckJhckNvbnRleHQnO1xuaW1wb3J0IHsgR3JhcGhpY2FsSXRlbUNsaXBQYXRoLCB1c2VOZWVkc0NsaXAgfSBmcm9tICcuL0dyYXBoaWNhbEl0ZW1DbGlwUGF0aCc7XG5pbXBvcnQgeyBzZWxlY3RTY2F0dGVyUG9pbnRzIH0gZnJvbSAnLi4vc3RhdGUvc2VsZWN0b3JzL3NjYXR0ZXJTZWxlY3RvcnMnO1xuaW1wb3J0IHsgdXNlQXBwU2VsZWN0b3IgfSBmcm9tICcuLi9zdGF0ZS9ob29rcyc7XG5pbXBvcnQgeyB1c2VJc1Bhbm9yYW1hIH0gZnJvbSAnLi4vY29udGV4dC9QYW5vcmFtYUNvbnRleHQnO1xuaW1wb3J0IHsgc2VsZWN0QWN0aXZlVG9vbHRpcEluZGV4IH0gZnJvbSAnLi4vc3RhdGUvc2VsZWN0b3JzL3Rvb2x0aXBTZWxlY3RvcnMnO1xuaW1wb3J0IHsgU2V0TGVnZW5kUGF5bG9hZCB9IGZyb20gJy4uL3N0YXRlL1NldExlZ2VuZFBheWxvYWQnO1xuaW1wb3J0IHsgREFUQV9JVEVNX0RBVEFLRVlfQVRUUklCVVRFX05BTUUsIERBVEFfSVRFTV9JTkRFWF9BVFRSSUJVVEVfTkFNRSB9IGZyb20gJy4uL3V0aWwvQ29uc3RhbnRzJztcbmltcG9ydCB7IHVzZUFuaW1hdGlvbklkIH0gZnJvbSAnLi4vdXRpbC91c2VBbmltYXRpb25JZCc7XG5pbXBvcnQgeyByZXNvbHZlRGVmYXVsdFByb3BzIH0gZnJvbSAnLi4vdXRpbC9yZXNvbHZlRGVmYXVsdFByb3BzJztcbmltcG9ydCB7IFJlZ2lzdGVyR3JhcGhpY2FsSXRlbUlkIH0gZnJvbSAnLi4vY29udGV4dC9SZWdpc3RlckdyYXBoaWNhbEl0ZW1JZCc7XG5pbXBvcnQgeyBTZXRDYXJ0ZXNpYW5HcmFwaGljYWxJdGVtIH0gZnJvbSAnLi4vc3RhdGUvU2V0R3JhcGhpY2FsSXRlbSc7XG5pbXBvcnQgeyBzdmdQcm9wZXJ0aWVzTm9FdmVudHMsIHN2Z1Byb3BlcnRpZXNOb0V2ZW50c0Zyb21Vbmtub3duIH0gZnJvbSAnLi4vdXRpbC9zdmdQcm9wZXJ0aWVzTm9FdmVudHMnO1xuaW1wb3J0IHsgSmF2YXNjcmlwdEFuaW1hdGUgfSBmcm9tICcuLi9hbmltYXRpb24vSmF2YXNjcmlwdEFuaW1hdGUnO1xuaW1wb3J0IHsgdXNlVmlld0JveCB9IGZyb20gJy4uL2NvbnRleHQvY2hhcnRMYXlvdXRDb250ZXh0JztcblxuLyoqXG4gKiBJbnRlcm5hbCBwcm9wcywgY29tYmluYXRpb24gb2YgZXh0ZXJuYWwgcHJvcHMgKyBkZWZhdWx0UHJvcHMgKyBwcml2YXRlIFJlY2hhcnRzIHN0YXRlXG4gKi9cblxuLyoqXG4gKiBFeHRlcm5hbCBwcm9wcywgaW50ZW5kZWQgZm9yIGVuZCB1c2VycyB0byBmaWxsIGluXG4gKi9cblxuLyoqXG4gKiBCZWNhdXNlIG9mIG5hbWluZyBjb25mbGljdCwgd2UgYXJlIGZvcmNlZCB0byBpZ25vcmUgY2VydGFpbiAodmFsaWQpIFNWRyBhdHRyaWJ1dGVzLlxuICovXG5cbnZhciBjb21wdXRlTGVnZW5kUGF5bG9hZEZyb21TY2F0dGVyUHJvcHMgPSBwcm9wcyA9PiB7XG4gIHZhciB7XG4gICAgZGF0YUtleSxcbiAgICBuYW1lLFxuICAgIGZpbGwsXG4gICAgbGVnZW5kVHlwZSxcbiAgICBoaWRlXG4gIH0gPSBwcm9wcztcbiAgcmV0dXJuIFt7XG4gICAgaW5hY3RpdmU6IGhpZGUsXG4gICAgZGF0YUtleSxcbiAgICB0eXBlOiBsZWdlbmRUeXBlLFxuICAgIGNvbG9yOiBmaWxsLFxuICAgIHZhbHVlOiBnZXRUb29sdGlwTmFtZVByb3AobmFtZSwgZGF0YUtleSksXG4gICAgcGF5bG9hZDogcHJvcHNcbiAgfV07XG59O1xuZnVuY3Rpb24gU2NhdHRlckxpbmUoX3JlZikge1xuICB2YXIge1xuICAgIHBvaW50cyxcbiAgICBwcm9wc1xuICB9ID0gX3JlZjtcbiAgdmFyIHtcbiAgICBsaW5lLFxuICAgIGxpbmVUeXBlLFxuICAgIGxpbmVKb2ludFR5cGVcbiAgfSA9IHByb3BzO1xuICBpZiAoIWxpbmUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgc2NhdHRlclByb3BzID0gc3ZnUHJvcGVydGllc05vRXZlbnRzKHByb3BzKTtcbiAgdmFyIGN1c3RvbUxpbmVQcm9wcyA9IHN2Z1Byb3BlcnRpZXNOb0V2ZW50c0Zyb21Vbmtub3duKGxpbmUpO1xuICB2YXIgbGluZVBvaW50cywgbGluZUl0ZW07XG4gIGlmIChsaW5lVHlwZSA9PT0gJ2pvaW50Jykge1xuICAgIGxpbmVQb2ludHMgPSBwb2ludHMubWFwKGVudHJ5ID0+ICh7XG4gICAgICB4OiBlbnRyeS5jeCxcbiAgICAgIHk6IGVudHJ5LmN5XG4gICAgfSkpO1xuICB9IGVsc2UgaWYgKGxpbmVUeXBlID09PSAnZml0dGluZycpIHtcbiAgICB2YXIge1xuICAgICAgeG1pbixcbiAgICAgIHhtYXgsXG4gICAgICBhLFxuICAgICAgYlxuICAgIH0gPSBnZXRMaW5lYXJSZWdyZXNzaW9uKHBvaW50cyk7XG4gICAgdmFyIGxpbmVhckV4cCA9IHggPT4gYSAqIHggKyBiO1xuICAgIGxpbmVQb2ludHMgPSBbe1xuICAgICAgeDogeG1pbixcbiAgICAgIHk6IGxpbmVhckV4cCh4bWluKVxuICAgIH0sIHtcbiAgICAgIHg6IHhtYXgsXG4gICAgICB5OiBsaW5lYXJFeHAoeG1heClcbiAgICB9XTtcbiAgfVxuICB2YXIgbGluZVByb3BzID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHNjYXR0ZXJQcm9wcyksIHt9LCB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjdXN0b21MaW5lUHJvcHMgaXMgY29udHJpYnV0aW5nIHVua25vd24gcHJvcHNcbiAgICBmaWxsOiAnbm9uZScsXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjdXN0b21MaW5lUHJvcHMgaXMgY29udHJpYnV0aW5nIHVua25vd24gcHJvcHNcbiAgICBzdHJva2U6IHNjYXR0ZXJQcm9wcyAmJiBzY2F0dGVyUHJvcHMuZmlsbFxuICB9LCBjdXN0b21MaW5lUHJvcHMpLCB7fSwge1xuICAgIHBvaW50czogbGluZVBvaW50c1xuICB9KTtcbiAgaWYgKC8qI19fUFVSRV9fKi9SZWFjdC5pc1ZhbGlkRWxlbWVudChsaW5lKSkge1xuICAgIGxpbmVJdGVtID0gLyojX19QVVJFX18qL1JlYWN0LmNsb25lRWxlbWVudChsaW5lLCBsaW5lUHJvcHMpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBsaW5lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgbGluZUl0ZW0gPSBsaW5lKGxpbmVQcm9wcyk7XG4gIH0gZWxzZSB7XG4gICAgbGluZUl0ZW0gPSAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChDdXJ2ZSwgX2V4dGVuZHMoe30sIGxpbmVQcm9wcywge1xuICAgICAgdHlwZTogbGluZUpvaW50VHlwZVxuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIHtcbiAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtc2NhdHRlci1saW5lXCIsXG4gICAga2V5OiBcInJlY2hhcnRzLXNjYXR0ZXItbGluZVwiXG4gIH0sIGxpbmVJdGVtKTtcbn1cbmZ1bmN0aW9uIFNjYXR0ZXJMYWJlbExpc3RQcm92aWRlcihfcmVmMikge1xuICB2YXIge1xuICAgIHNob3dMYWJlbHMsXG4gICAgcG9pbnRzLFxuICAgIGNoaWxkcmVuXG4gIH0gPSBfcmVmMjtcbiAgdmFyIGNoYXJ0Vmlld0JveCA9IHVzZVZpZXdCb3goKTtcbiAgdmFyIGxhYmVsTGlzdEVudHJpZXMgPSB1c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4gcG9pbnRzID09PSBudWxsIHx8IHBvaW50cyA9PT0gdm9pZCAwID8gdm9pZCAwIDogcG9pbnRzLm1hcChwb2ludCA9PiB7XG4gICAgICB2YXIgdmlld0JveCA9IHtcbiAgICAgICAgLypcbiAgICAgICAgICogU2NhdHRlciBsYWJlbCB1c2VzIHggYW5kIHkgYXMgdGhlIHJlZmVyZW5jZSBwb2ludCBmb3IgdGhlIGxhYmVsLFxuICAgICAgICAgKiBub3QgY3ggYW5kIGN5LlxuICAgICAgICAgKi9cbiAgICAgICAgeDogcG9pbnQueCxcbiAgICAgICAgLypcbiAgICAgICAgICogU2NhdHRlciBsYWJlbCB1c2VzIHggYW5kIHkgYXMgdGhlIHJlZmVyZW5jZSBwb2ludCBmb3IgdGhlIGxhYmVsLFxuICAgICAgICAgKiBub3QgY3ggYW5kIGN5LlxuICAgICAgICAgKi9cbiAgICAgICAgeTogcG9pbnQueSxcbiAgICAgICAgd2lkdGg6IHBvaW50LndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHBvaW50LmhlaWdodFxuICAgICAgfTtcbiAgICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHZpZXdCb3gpLCB7fSwge1xuICAgICAgICAvKlxuICAgICAgICAgKiBIZXJlIHdlIHB1dCB1bmRlZmluZWQgYmVjYXVzZSBTY2F0dGVyIHNob3dzIHR3byB2YWx1ZXMgdXN1YWxseSwgb25lIGZvciBYIGFuZCBvbmUgZm9yIFkuXG4gICAgICAgICAqIExhYmVsTGlzdCB3aWxsIHNlZSB0aGlzIHVuZGVmaW5lZCBhbmQgd2lsbCB1c2UgaXRzIG93biBgZGF0YUtleWAgcHJvcCB0byBkZXRlcm1pbmUgd2hpY2ggdmFsdWUgdG8gc2hvdyxcbiAgICAgICAgICogdXNpbmcgdGhlIHBheWxvYWQgYmVsb3cuXG4gICAgICAgICAqL1xuICAgICAgICB2YWx1ZTogdW5kZWZpbmVkLFxuICAgICAgICBwYXlsb2FkOiBwb2ludC5wYXlsb2FkLFxuICAgICAgICB2aWV3Qm94LFxuICAgICAgICBwYXJlbnRWaWV3Qm94OiBjaGFydFZpZXdCb3gsXG4gICAgICAgIGZpbGw6IHVuZGVmaW5lZFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sIFtjaGFydFZpZXdCb3gsIHBvaW50c10pO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ2FydGVzaWFuTGFiZWxMaXN0Q29udGV4dFByb3ZpZGVyLCB7XG4gICAgdmFsdWU6IHNob3dMYWJlbHMgPyBsYWJlbExpc3RFbnRyaWVzIDogbnVsbFxuICB9LCBjaGlsZHJlbik7XG59XG5mdW5jdGlvbiBTY2F0dGVyU3ltYm9scyhwcm9wcykge1xuICB2YXIge1xuICAgIHBvaW50cyxcbiAgICBhbGxPdGhlclNjYXR0ZXJQcm9wc1xuICB9ID0gcHJvcHM7XG4gIHZhciB7XG4gICAgc2hhcGUsXG4gICAgYWN0aXZlU2hhcGUsXG4gICAgZGF0YUtleVxuICB9ID0gYWxsT3RoZXJTY2F0dGVyUHJvcHM7XG4gIHZhciBhY3RpdmVJbmRleCA9IHVzZUFwcFNlbGVjdG9yKHNlbGVjdEFjdGl2ZVRvb2x0aXBJbmRleCk7XG4gIHZhciB7XG4gICAgICBvbk1vdXNlRW50ZXI6IG9uTW91c2VFbnRlckZyb21Qcm9wcyxcbiAgICAgIG9uQ2xpY2s6IG9uSXRlbUNsaWNrRnJvbVByb3BzLFxuICAgICAgb25Nb3VzZUxlYXZlOiBvbk1vdXNlTGVhdmVGcm9tUHJvcHNcbiAgICB9ID0gYWxsT3RoZXJTY2F0dGVyUHJvcHMsXG4gICAgcmVzdE9mQWxsT3RoZXJQcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhhbGxPdGhlclNjYXR0ZXJQcm9wcywgX2V4Y2x1ZGVkKTtcbiAgdmFyIG9uTW91c2VFbnRlckZyb21Db250ZXh0ID0gdXNlTW91c2VFbnRlckl0ZW1EaXNwYXRjaChvbk1vdXNlRW50ZXJGcm9tUHJvcHMsIGFsbE90aGVyU2NhdHRlclByb3BzLmRhdGFLZXkpO1xuICB2YXIgb25Nb3VzZUxlYXZlRnJvbUNvbnRleHQgPSB1c2VNb3VzZUxlYXZlSXRlbURpc3BhdGNoKG9uTW91c2VMZWF2ZUZyb21Qcm9wcyk7XG4gIHZhciBvbkNsaWNrRnJvbUNvbnRleHQgPSB1c2VNb3VzZUNsaWNrSXRlbURpc3BhdGNoKG9uSXRlbUNsaWNrRnJvbVByb3BzLCBhbGxPdGhlclNjYXR0ZXJQcm9wcy5kYXRhS2V5KTtcbiAgaWYgKHBvaW50cyA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIHtcbiAgICAgIGlkXG4gICAgfSA9IGFsbE90aGVyU2NhdHRlclByb3BzLFxuICAgIGFsbE90aGVyUHJvcHNXaXRob3V0SWQgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoYWxsT3RoZXJTY2F0dGVyUHJvcHMsIF9leGNsdWRlZDIpO1xuICB2YXIgYmFzZVByb3BzID0gc3ZnUHJvcGVydGllc05vRXZlbnRzKGFsbE90aGVyUHJvcHNXaXRob3V0SWQpO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNjYXR0ZXJMaW5lLCB7XG4gICAgcG9pbnRzOiBwb2ludHMsXG4gICAgcHJvcHM6IGFsbE90aGVyUHJvcHNXaXRob3V0SWRcbiAgfSksIHBvaW50cy5tYXAoKGVudHJ5LCBpKSA9PiB7XG4gICAgdmFyIGlzQWN0aXZlID0gYWN0aXZlU2hhcGUgJiYgYWN0aXZlSW5kZXggPT09IFN0cmluZyhpKTtcbiAgICB2YXIgb3B0aW9uID0gaXNBY3RpdmUgPyBhY3RpdmVTaGFwZSA6IHNoYXBlO1xuICAgIHZhciBzeW1ib2xQcm9wcyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHtcbiAgICAgIGtleTogXCJzeW1ib2wtXCIuY29uY2F0KGkpXG4gICAgfSwgYmFzZVByb3BzKSwgZW50cnkpLCB7fSwge1xuICAgICAgW0RBVEFfSVRFTV9JTkRFWF9BVFRSSUJVVEVfTkFNRV06IGksXG4gICAgICBbREFUQV9JVEVNX0RBVEFLRVlfQVRUUklCVVRFX05BTUVdOiBTdHJpbmcoZGF0YUtleSlcbiAgICB9KTtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3Qvbm8tYXJyYXktaW5kZXgta2V5XG4gICAgLCBfZXh0ZW5kcyh7XG4gICAgICBrZXk6IFwic3ltYm9sLVwiLmNvbmNhdChlbnRyeSA9PT0gbnVsbCB8fCBlbnRyeSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZW50cnkuY3gsIFwiLVwiKS5jb25jYXQoZW50cnkgPT09IG51bGwgfHwgZW50cnkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGVudHJ5LmN5LCBcIi1cIikuY29uY2F0KGVudHJ5ID09PSBudWxsIHx8IGVudHJ5ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBlbnRyeS5zaXplLCBcIi1cIikuY29uY2F0KGkpLFxuICAgICAgY2xhc3NOYW1lOiBcInJlY2hhcnRzLXNjYXR0ZXItc3ltYm9sXCJcbiAgICB9LCBhZGFwdEV2ZW50c09mQ2hpbGQocmVzdE9mQWxsT3RoZXJQcm9wcywgZW50cnksIGkpLCB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRoZSB0eXBlcyBuZWVkIGEgYml0IG9mIGF0dGVudGlvblxuICAgICAgb25Nb3VzZUVudGVyOiBvbk1vdXNlRW50ZXJGcm9tQ29udGV4dChlbnRyeSwgaSlcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdGhlIHR5cGVzIG5lZWQgYSBiaXQgb2YgYXR0ZW50aW9uXG4gICAgICAsXG4gICAgICBvbk1vdXNlTGVhdmU6IG9uTW91c2VMZWF2ZUZyb21Db250ZXh0KGVudHJ5LCBpKVxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0aGUgdHlwZXMgbmVlZCBhIGJpdCBvZiBhdHRlbnRpb25cbiAgICAgICxcbiAgICAgIG9uQ2xpY2s6IG9uQ2xpY2tGcm9tQ29udGV4dChlbnRyeSwgaSlcbiAgICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2NhdHRlclN5bWJvbCwgX2V4dGVuZHMoe1xuICAgICAgb3B0aW9uOiBvcHRpb24sXG4gICAgICBpc0FjdGl2ZTogaXNBY3RpdmVcbiAgICB9LCBzeW1ib2xQcm9wcykpKTtcbiAgfSkpO1xufVxuZnVuY3Rpb24gU3ltYm9sc1dpdGhBbmltYXRpb24oX3JlZjMpIHtcbiAgdmFyIHtcbiAgICBwcmV2aW91c1BvaW50c1JlZixcbiAgICBwcm9wc1xuICB9ID0gX3JlZjM7XG4gIHZhciB7XG4gICAgcG9pbnRzLFxuICAgIGlzQW5pbWF0aW9uQWN0aXZlLFxuICAgIGFuaW1hdGlvbkJlZ2luLFxuICAgIGFuaW1hdGlvbkR1cmF0aW9uLFxuICAgIGFuaW1hdGlvbkVhc2luZ1xuICB9ID0gcHJvcHM7XG4gIHZhciBwcmV2UG9pbnRzID0gcHJldmlvdXNQb2ludHNSZWYuY3VycmVudDtcbiAgdmFyIGFuaW1hdGlvbklkID0gdXNlQW5pbWF0aW9uSWQocHJvcHMsICdyZWNoYXJ0cy1zY2F0dGVyLScpO1xuICB2YXIgW2lzQW5pbWF0aW5nLCBzZXRJc0FuaW1hdGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIHZhciBoYW5kbGVBbmltYXRpb25FbmQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgLy8gU2NhdHRlciBkb2Vzbid0IGhhdmUgb25BbmltYXRpb25FbmQgcHJvcCwgYW5kIGlmIHdlIHdhbnQgdG8gYWRkIGl0IHdlIGRvIGl0IGhlcmVcbiAgICAvLyBpZiAodHlwZW9mIG9uQW5pbWF0aW9uRW5kID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gICBvbkFuaW1hdGlvbkVuZCgpO1xuICAgIC8vIH1cbiAgICBzZXRJc0FuaW1hdGluZyhmYWxzZSk7XG4gIH0sIFtdKTtcbiAgdmFyIGhhbmRsZUFuaW1hdGlvblN0YXJ0ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIC8vIFNjYXR0ZXIgZG9lc24ndCBoYXZlIG9uQW5pbWF0aW9uU3RhcnQgcHJvcCwgYW5kIGlmIHdlIHdhbnQgdG8gYWRkIGl0IHdlIGRvIGl0IGhlcmVcbiAgICAvLyBpZiAodHlwZW9mIG9uQW5pbWF0aW9uU3RhcnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyAgIG9uQW5pbWF0aW9uU3RhcnQoKTtcbiAgICAvLyB9XG4gICAgc2V0SXNBbmltYXRpbmcodHJ1ZSk7XG4gIH0sIFtdKTtcbiAgdmFyIHNob3dMYWJlbHMgPSAhaXNBbmltYXRpbmc7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTY2F0dGVyTGFiZWxMaXN0UHJvdmlkZXIsIHtcbiAgICBzaG93TGFiZWxzOiBzaG93TGFiZWxzLFxuICAgIHBvaW50czogcG9pbnRzXG4gIH0sIHByb3BzLmNoaWxkcmVuLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChKYXZhc2NyaXB0QW5pbWF0ZSwge1xuICAgIGFuaW1hdGlvbklkOiBhbmltYXRpb25JZCxcbiAgICBiZWdpbjogYW5pbWF0aW9uQmVnaW4sXG4gICAgZHVyYXRpb246IGFuaW1hdGlvbkR1cmF0aW9uLFxuICAgIGlzQWN0aXZlOiBpc0FuaW1hdGlvbkFjdGl2ZSxcbiAgICBlYXNpbmc6IGFuaW1hdGlvbkVhc2luZyxcbiAgICBvbkFuaW1hdGlvbkVuZDogaGFuZGxlQW5pbWF0aW9uRW5kLFxuICAgIG9uQW5pbWF0aW9uU3RhcnQ6IGhhbmRsZUFuaW1hdGlvblN0YXJ0LFxuICAgIGtleTogYW5pbWF0aW9uSWRcbiAgfSwgdCA9PiB7XG4gICAgdmFyIHN0ZXBEYXRhID0gdCA9PT0gMSA/IHBvaW50cyA6IHBvaW50cyA9PT0gbnVsbCB8fCBwb2ludHMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHBvaW50cy5tYXAoKGVudHJ5LCBpbmRleCkgPT4ge1xuICAgICAgdmFyIHByZXYgPSBwcmV2UG9pbnRzICYmIHByZXZQb2ludHNbaW5kZXhdO1xuICAgICAgaWYgKHByZXYpIHtcbiAgICAgICAgdmFyIGludGVycG9sYXRvckN4ID0gaW50ZXJwb2xhdGVOdW1iZXIocHJldi5jeCwgZW50cnkuY3gpO1xuICAgICAgICB2YXIgaW50ZXJwb2xhdG9yQ3kgPSBpbnRlcnBvbGF0ZU51bWJlcihwcmV2LmN5LCBlbnRyeS5jeSk7XG4gICAgICAgIHZhciBpbnRlcnBvbGF0b3JTaXplID0gaW50ZXJwb2xhdGVOdW1iZXIocHJldi5zaXplLCBlbnRyeS5zaXplKTtcbiAgICAgICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgZW50cnkpLCB7fSwge1xuICAgICAgICAgIGN4OiBpbnRlcnBvbGF0b3JDeCh0KSxcbiAgICAgICAgICBjeTogaW50ZXJwb2xhdG9yQ3kodCksXG4gICAgICAgICAgc2l6ZTogaW50ZXJwb2xhdG9yU2l6ZSh0KVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHZhciBpbnRlcnBvbGF0b3IgPSBpbnRlcnBvbGF0ZU51bWJlcigwLCBlbnRyeS5zaXplKTtcbiAgICAgIHJldHVybiBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGVudHJ5KSwge30sIHtcbiAgICAgICAgc2l6ZTogaW50ZXJwb2xhdG9yKHQpXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpZiAodCA+IDApIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgcHJldmlvdXNQb2ludHNSZWYuY3VycmVudCA9IHN0ZXBEYXRhO1xuICAgIH1cbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNjYXR0ZXJTeW1ib2xzLCB7XG4gICAgICBwb2ludHM6IHN0ZXBEYXRhLFxuICAgICAgYWxsT3RoZXJTY2F0dGVyUHJvcHM6IHByb3BzLFxuICAgICAgc2hvd0xhYmVsczogc2hvd0xhYmVsc1xuICAgIH0pKTtcbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExhYmVsTGlzdEZyb21MYWJlbFByb3AsIHtcbiAgICBsYWJlbDogcHJvcHMubGFiZWxcbiAgfSkpO1xufVxuZnVuY3Rpb24gZ2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MocHJvcHMpIHtcbiAgdmFyIHtcbiAgICBkYXRhS2V5LFxuICAgIHBvaW50cyxcbiAgICBzdHJva2UsXG4gICAgc3Ryb2tlV2lkdGgsXG4gICAgZmlsbCxcbiAgICBuYW1lLFxuICAgIGhpZGUsXG4gICAgdG9vbHRpcFR5cGVcbiAgfSA9IHByb3BzO1xuICByZXR1cm4ge1xuICAgIGRhdGFEZWZpbmVkT25JdGVtOiBwb2ludHMgPT09IG51bGwgfHwgcG9pbnRzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwb2ludHMubWFwKHAgPT4gcC50b29sdGlwUGF5bG9hZCksXG4gICAgcG9zaXRpb25zOiBwb2ludHMgPT09IG51bGwgfHwgcG9pbnRzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwb2ludHMubWFwKHAgPT4gcC50b29sdGlwUG9zaXRpb24pLFxuICAgIHNldHRpbmdzOiB7XG4gICAgICBzdHJva2UsXG4gICAgICBzdHJva2VXaWR0aCxcbiAgICAgIGZpbGwsXG4gICAgICBuYW1lS2V5OiB1bmRlZmluZWQsXG4gICAgICBkYXRhS2V5LFxuICAgICAgbmFtZTogZ2V0VG9vbHRpcE5hbWVQcm9wKG5hbWUsIGRhdGFLZXkpLFxuICAgICAgaGlkZSxcbiAgICAgIHR5cGU6IHRvb2x0aXBUeXBlLFxuICAgICAgY29sb3I6IGZpbGwsXG4gICAgICB1bml0OiAnJyAvLyB3aHkgZG9lc24ndCBTY2F0dGVyIHN1cHBvcnQgdW5pdD9cbiAgICB9XG4gIH07XG59XG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZVNjYXR0ZXJQb2ludHMoX3JlZjQpIHtcbiAgdmFyIHtcbiAgICBkaXNwbGF5ZWREYXRhLFxuICAgIHhBeGlzLFxuICAgIHlBeGlzLFxuICAgIHpBeGlzLFxuICAgIHNjYXR0ZXJTZXR0aW5ncyxcbiAgICB4QXhpc1RpY2tzLFxuICAgIHlBeGlzVGlja3MsXG4gICAgY2VsbHNcbiAgfSA9IF9yZWY0O1xuICB2YXIgeEF4aXNEYXRhS2V5ID0gaXNOdWxsaXNoKHhBeGlzLmRhdGFLZXkpID8gc2NhdHRlclNldHRpbmdzLmRhdGFLZXkgOiB4QXhpcy5kYXRhS2V5O1xuICB2YXIgeUF4aXNEYXRhS2V5ID0gaXNOdWxsaXNoKHlBeGlzLmRhdGFLZXkpID8gc2NhdHRlclNldHRpbmdzLmRhdGFLZXkgOiB5QXhpcy5kYXRhS2V5O1xuICB2YXIgekF4aXNEYXRhS2V5ID0gekF4aXMgJiYgekF4aXMuZGF0YUtleTtcbiAgdmFyIGRlZmF1bHRSYW5nZVogPSB6QXhpcyA/IHpBeGlzLnJhbmdlIDogWkF4aXMuZGVmYXVsdFByb3BzLnJhbmdlO1xuICB2YXIgZGVmYXVsdFogPSBkZWZhdWx0UmFuZ2VaICYmIGRlZmF1bHRSYW5nZVpbMF07XG4gIHZhciB4QmFuZFNpemUgPSB4QXhpcy5zY2FsZS5iYW5kd2lkdGggPyB4QXhpcy5zY2FsZS5iYW5kd2lkdGgoKSA6IDA7XG4gIHZhciB5QmFuZFNpemUgPSB5QXhpcy5zY2FsZS5iYW5kd2lkdGggPyB5QXhpcy5zY2FsZS5iYW5kd2lkdGgoKSA6IDA7XG4gIHJldHVybiBkaXNwbGF5ZWREYXRhLm1hcCgoZW50cnksIGluZGV4KSA9PiB7XG4gICAgdmFyIHggPSBnZXRWYWx1ZUJ5RGF0YUtleShlbnRyeSwgeEF4aXNEYXRhS2V5KTtcbiAgICB2YXIgeSA9IGdldFZhbHVlQnlEYXRhS2V5KGVudHJ5LCB5QXhpc0RhdGFLZXkpO1xuICAgIHZhciB6ID0gIWlzTnVsbGlzaCh6QXhpc0RhdGFLZXkpICYmIGdldFZhbHVlQnlEYXRhS2V5KGVudHJ5LCB6QXhpc0RhdGFLZXkpIHx8ICctJztcbiAgICB2YXIgdG9vbHRpcFBheWxvYWQgPSBbe1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBuYW1lIHByb3Agc2hvdWxkIG5vdCBoYXZlIGRhdGFLZXkgaW4gaXRcbiAgICAgIG5hbWU6IGlzTnVsbGlzaCh4QXhpcy5kYXRhS2V5KSA/IHNjYXR0ZXJTZXR0aW5ncy5uYW1lIDogeEF4aXMubmFtZSB8fCB4QXhpcy5kYXRhS2V5LFxuICAgICAgdW5pdDogeEF4aXMudW5pdCB8fCAnJyxcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgZ2V0VmFsdWVCeURhdGFLZXkgZG9lcyBub3QgdmFsaWRhdGUgdGhlIG91dHB1dCB0eXBlXG4gICAgICB2YWx1ZTogeCxcbiAgICAgIHBheWxvYWQ6IGVudHJ5LFxuICAgICAgZGF0YUtleTogeEF4aXNEYXRhS2V5LFxuICAgICAgdHlwZTogc2NhdHRlclNldHRpbmdzLnRvb2x0aXBUeXBlXG4gICAgfSwge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBuYW1lIHByb3Agc2hvdWxkIG5vdCBoYXZlIGRhdGFLZXkgaW4gaXRcbiAgICAgIG5hbWU6IGlzTnVsbGlzaCh5QXhpcy5kYXRhS2V5KSA/IHNjYXR0ZXJTZXR0aW5ncy5uYW1lIDogeUF4aXMubmFtZSB8fCB5QXhpcy5kYXRhS2V5LFxuICAgICAgdW5pdDogeUF4aXMudW5pdCB8fCAnJyxcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgZ2V0VmFsdWVCeURhdGFLZXkgZG9lcyBub3QgdmFsaWRhdGUgdGhlIG91dHB1dCB0eXBlXG4gICAgICB2YWx1ZTogeSxcbiAgICAgIHBheWxvYWQ6IGVudHJ5LFxuICAgICAgZGF0YUtleTogeUF4aXNEYXRhS2V5LFxuICAgICAgdHlwZTogc2NhdHRlclNldHRpbmdzLnRvb2x0aXBUeXBlXG4gICAgfV07XG4gICAgaWYgKHogIT09ICctJykge1xuICAgICAgdG9vbHRpcFBheWxvYWQucHVzaCh7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgbmFtZSBwcm9wIHNob3VsZCBub3QgaGF2ZSBkYXRhS2V5IGluIGl0XG4gICAgICAgIG5hbWU6IHpBeGlzLm5hbWUgfHwgekF4aXMuZGF0YUtleSxcbiAgICAgICAgdW5pdDogekF4aXMudW5pdCB8fCAnJyxcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBnZXRWYWx1ZUJ5RGF0YUtleSBkb2VzIG5vdCB2YWxpZGF0ZSB0aGUgb3V0cHV0IHR5cGVcbiAgICAgICAgdmFsdWU6IHosXG4gICAgICAgIHBheWxvYWQ6IGVudHJ5LFxuICAgICAgICBkYXRhS2V5OiB6QXhpc0RhdGFLZXksXG4gICAgICAgIHR5cGU6IHNjYXR0ZXJTZXR0aW5ncy50b29sdGlwVHlwZVxuICAgICAgfSk7XG4gICAgfVxuICAgIHZhciBjeCA9IGdldENhdGVDb29yZGluYXRlT2ZMaW5lKHtcbiAgICAgIGF4aXM6IHhBeGlzLFxuICAgICAgdGlja3M6IHhBeGlzVGlja3MsXG4gICAgICBiYW5kU2l6ZTogeEJhbmRTaXplLFxuICAgICAgZW50cnksXG4gICAgICBpbmRleCxcbiAgICAgIGRhdGFLZXk6IHhBeGlzRGF0YUtleVxuICAgIH0pO1xuICAgIHZhciBjeSA9IGdldENhdGVDb29yZGluYXRlT2ZMaW5lKHtcbiAgICAgIGF4aXM6IHlBeGlzLFxuICAgICAgdGlja3M6IHlBeGlzVGlja3MsXG4gICAgICBiYW5kU2l6ZTogeUJhbmRTaXplLFxuICAgICAgZW50cnksXG4gICAgICBpbmRleCxcbiAgICAgIGRhdGFLZXk6IHlBeGlzRGF0YUtleVxuICAgIH0pO1xuICAgIHZhciBzaXplID0geiAhPT0gJy0nID8gekF4aXMuc2NhbGUoeikgOiBkZWZhdWx0WjtcbiAgICB2YXIgcmFkaXVzID0gTWF0aC5zcXJ0KE1hdGgubWF4KHNpemUsIDApIC8gTWF0aC5QSSk7XG4gICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgZW50cnkpLCB7fSwge1xuICAgICAgY3gsXG4gICAgICBjeSxcbiAgICAgIHg6IGN4IC0gcmFkaXVzLFxuICAgICAgeTogY3kgLSByYWRpdXMsXG4gICAgICB3aWR0aDogMiAqIHJhZGl1cyxcbiAgICAgIGhlaWdodDogMiAqIHJhZGl1cyxcbiAgICAgIHNpemUsXG4gICAgICBub2RlOiB7XG4gICAgICAgIHgsXG4gICAgICAgIHksXG4gICAgICAgIHpcbiAgICAgIH0sXG4gICAgICB0b29sdGlwUGF5bG9hZCxcbiAgICAgIHRvb2x0aXBQb3NpdGlvbjoge1xuICAgICAgICB4OiBjeCxcbiAgICAgICAgeTogY3lcbiAgICAgIH0sXG4gICAgICBwYXlsb2FkOiBlbnRyeVxuICAgIH0sIGNlbGxzICYmIGNlbGxzW2luZGV4XSAmJiBjZWxsc1tpbmRleF0ucHJvcHMpO1xuICB9KTtcbn1cbnZhciBlcnJvckJhckRhdGFQb2ludEZvcm1hdHRlciA9IChkYXRhUG9pbnQsIGRhdGFLZXksIGRpcmVjdGlvbikgPT4ge1xuICByZXR1cm4ge1xuICAgIHg6IGRhdGFQb2ludC5jeCxcbiAgICB5OiBkYXRhUG9pbnQuY3ksXG4gICAgdmFsdWU6IGRpcmVjdGlvbiA9PT0gJ3gnID8gK2RhdGFQb2ludC5ub2RlLnggOiArZGF0YVBvaW50Lm5vZGUueSxcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGdldFZhbHVlQnlEYXRhS2V5IGRvZXMgbm90IHZhbGlkYXRlIHRoZSBvdXRwdXQgdHlwZVxuICAgIGVycm9yVmFsOiBnZXRWYWx1ZUJ5RGF0YUtleShkYXRhUG9pbnQsIGRhdGFLZXkpXG4gIH07XG59O1xuZnVuY3Rpb24gU2NhdHRlcldpdGhJZChwcm9wcykge1xuICB2YXIge1xuICAgIGhpZGUsXG4gICAgcG9pbnRzLFxuICAgIGNsYXNzTmFtZSxcbiAgICBuZWVkQ2xpcCxcbiAgICB4QXhpc0lkLFxuICAgIHlBeGlzSWQsXG4gICAgaWRcbiAgfSA9IHByb3BzO1xuICB2YXIgcHJldmlvdXNQb2ludHNSZWYgPSB1c2VSZWYobnVsbCk7XG4gIGlmIChoaWRlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGxheWVyQ2xhc3MgPSBjbHN4KCdyZWNoYXJ0cy1zY2F0dGVyJywgY2xhc3NOYW1lKTtcbiAgdmFyIGNsaXBQYXRoSWQgPSBpZDtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCB7XG4gICAgY2xhc3NOYW1lOiBsYXllckNsYXNzLFxuICAgIGNsaXBQYXRoOiBuZWVkQ2xpcCA/IFwidXJsKCNjbGlwUGF0aC1cIi5jb25jYXQoY2xpcFBhdGhJZCwgXCIpXCIpIDogbnVsbCxcbiAgICBpZDogaWRcbiAgfSwgbmVlZENsaXAgJiYgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJkZWZzXCIsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEdyYXBoaWNhbEl0ZW1DbGlwUGF0aCwge1xuICAgIGNsaXBQYXRoSWQ6IGNsaXBQYXRoSWQsXG4gICAgeEF4aXNJZDogeEF4aXNJZCxcbiAgICB5QXhpc0lkOiB5QXhpc0lkXG4gIH0pKSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0RXJyb3JCYXJDb250ZXh0LCB7XG4gICAgeEF4aXNJZDogeEF4aXNJZCxcbiAgICB5QXhpc0lkOiB5QXhpc0lkLFxuICAgIGRhdGE6IHBvaW50cyxcbiAgICBkYXRhUG9pbnRGb3JtYXR0ZXI6IGVycm9yQmFyRGF0YVBvaW50Rm9ybWF0dGVyLFxuICAgIGVycm9yQmFyT2Zmc2V0OiAwXG4gIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCB7XG4gICAga2V5OiBcInJlY2hhcnRzLXNjYXR0ZXItc3ltYm9sc1wiXG4gIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFN5bWJvbHNXaXRoQW5pbWF0aW9uLCB7XG4gICAgcHJvcHM6IHByb3BzLFxuICAgIHByZXZpb3VzUG9pbnRzUmVmOiBwcmV2aW91c1BvaW50c1JlZlxuICB9KSkpKTtcbn1cbnZhciBkZWZhdWx0U2NhdHRlclByb3BzID0ge1xuICB4QXhpc0lkOiAwLFxuICB5QXhpc0lkOiAwLFxuICB6QXhpc0lkOiAwLFxuICBsZWdlbmRUeXBlOiAnY2lyY2xlJyxcbiAgbGluZVR5cGU6ICdqb2ludCcsXG4gIGxpbmVKb2ludFR5cGU6ICdsaW5lYXInLFxuICBkYXRhOiBbXSxcbiAgc2hhcGU6ICdjaXJjbGUnLFxuICBoaWRlOiBmYWxzZSxcbiAgaXNBbmltYXRpb25BY3RpdmU6ICFHbG9iYWwuaXNTc3IsXG4gIGFuaW1hdGlvbkJlZ2luOiAwLFxuICBhbmltYXRpb25EdXJhdGlvbjogNDAwLFxuICBhbmltYXRpb25FYXNpbmc6ICdsaW5lYXInXG59O1xuZnVuY3Rpb24gU2NhdHRlckltcGwocHJvcHMpIHtcbiAgdmFyIF9yZXNvbHZlRGVmYXVsdFByb3BzID0gcmVzb2x2ZURlZmF1bHRQcm9wcyhwcm9wcywgZGVmYXVsdFNjYXR0ZXJQcm9wcyksXG4gICAge1xuICAgICAgYW5pbWF0aW9uQmVnaW4sXG4gICAgICBhbmltYXRpb25EdXJhdGlvbixcbiAgICAgIGFuaW1hdGlvbkVhc2luZyxcbiAgICAgIGhpZGUsXG4gICAgICBpc0FuaW1hdGlvbkFjdGl2ZSxcbiAgICAgIGxlZ2VuZFR5cGUsXG4gICAgICBsaW5lSm9pbnRUeXBlLFxuICAgICAgbGluZVR5cGUsXG4gICAgICBzaGFwZSxcbiAgICAgIHhBeGlzSWQsXG4gICAgICB5QXhpc0lkLFxuICAgICAgekF4aXNJZFxuICAgIH0gPSBfcmVzb2x2ZURlZmF1bHRQcm9wcyxcbiAgICBldmVyeXRoaW5nRWxzZSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfcmVzb2x2ZURlZmF1bHRQcm9wcywgX2V4Y2x1ZGVkMyk7XG4gIHZhciB7XG4gICAgbmVlZENsaXBcbiAgfSA9IHVzZU5lZWRzQ2xpcCh4QXhpc0lkLCB5QXhpc0lkKTtcbiAgdmFyIGNlbGxzID0gdXNlTWVtbygoKSA9PiBmaW5kQWxsQnlUeXBlKHByb3BzLmNoaWxkcmVuLCBDZWxsKSwgW3Byb3BzLmNoaWxkcmVuXSk7XG4gIHZhciBpc1Bhbm9yYW1hID0gdXNlSXNQYW5vcmFtYSgpO1xuICB2YXIgcG9pbnRzID0gdXNlQXBwU2VsZWN0b3Ioc3RhdGUgPT4ge1xuICAgIHJldHVybiBzZWxlY3RTY2F0dGVyUG9pbnRzKHN0YXRlLCB4QXhpc0lkLCB5QXhpc0lkLCB6QXhpc0lkLCBwcm9wcy5pZCwgY2VsbHMsIGlzUGFub3JhbWEpO1xuICB9KTtcbiAgaWYgKG5lZWRDbGlwID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAocG9pbnRzID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNldFRvb2x0aXBFbnRyeVNldHRpbmdzLCB7XG4gICAgZm46IGdldFRvb2x0aXBFbnRyeVNldHRpbmdzLFxuICAgIGFyZ3M6IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgcHJvcHMpLCB7fSwge1xuICAgICAgcG9pbnRzXG4gICAgfSlcbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNjYXR0ZXJXaXRoSWQsIF9leHRlbmRzKHt9LCBldmVyeXRoaW5nRWxzZSwge1xuICAgIHhBeGlzSWQ6IHhBeGlzSWQsXG4gICAgeUF4aXNJZDogeUF4aXNJZCxcbiAgICB6QXhpc0lkOiB6QXhpc0lkLFxuICAgIGxpbmVUeXBlOiBsaW5lVHlwZSxcbiAgICBsaW5lSm9pbnRUeXBlOiBsaW5lSm9pbnRUeXBlLFxuICAgIGxlZ2VuZFR5cGU6IGxlZ2VuZFR5cGUsXG4gICAgc2hhcGU6IHNoYXBlLFxuICAgIGhpZGU6IGhpZGUsXG4gICAgaXNBbmltYXRpb25BY3RpdmU6IGlzQW5pbWF0aW9uQWN0aXZlLFxuICAgIGFuaW1hdGlvbkJlZ2luOiBhbmltYXRpb25CZWdpbixcbiAgICBhbmltYXRpb25EdXJhdGlvbjogYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgYW5pbWF0aW9uRWFzaW5nOiBhbmltYXRpb25FYXNpbmcsXG4gICAgcG9pbnRzOiBwb2ludHMsXG4gICAgbmVlZENsaXA6IG5lZWRDbGlwXG4gIH0pKSk7XG59XG5mdW5jdGlvbiBTY2F0dGVyRm4ob3V0c2lkZVByb3BzKSB7XG4gIHZhciBwcm9wcyA9IHJlc29sdmVEZWZhdWx0UHJvcHMob3V0c2lkZVByb3BzLCBkZWZhdWx0U2NhdHRlclByb3BzKTtcbiAgdmFyIGlzUGFub3JhbWEgPSB1c2VJc1Bhbm9yYW1hKCk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWdpc3RlckdyYXBoaWNhbEl0ZW1JZCwge1xuICAgIGlkOiBwcm9wcy5pZCxcbiAgICB0eXBlOiBcInNjYXR0ZXJcIlxuICB9LCBpZCA9PiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0TGVnZW5kUGF5bG9hZCwge1xuICAgIGxlZ2VuZFBheWxvYWQ6IGNvbXB1dGVMZWdlbmRQYXlsb2FkRnJvbVNjYXR0ZXJQcm9wcyhwcm9wcylcbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNldENhcnRlc2lhbkdyYXBoaWNhbEl0ZW0sIHtcbiAgICB0eXBlOiBcInNjYXR0ZXJcIixcbiAgICBpZDogaWQsXG4gICAgZGF0YTogcHJvcHMuZGF0YSxcbiAgICB4QXhpc0lkOiBwcm9wcy54QXhpc0lkLFxuICAgIHlBeGlzSWQ6IHByb3BzLnlBeGlzSWQsXG4gICAgekF4aXNJZDogcHJvcHMuekF4aXNJZCxcbiAgICBkYXRhS2V5OiBwcm9wcy5kYXRhS2V5LFxuICAgIGhpZGU6IHByb3BzLmhpZGUsXG4gICAgbmFtZTogcHJvcHMubmFtZSxcbiAgICB0b29sdGlwVHlwZTogcHJvcHMudG9vbHRpcFR5cGUsXG4gICAgaXNQYW5vcmFtYTogaXNQYW5vcmFtYVxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2NhdHRlckltcGwsIF9leHRlbmRzKHt9LCBwcm9wcywge1xuICAgIGlkOiBpZFxuICB9KSkpKTtcbn1cbmV4cG9ydCB2YXIgU2NhdHRlciA9IC8qI19fUFVSRV9fKi9SZWFjdC5tZW1vKFNjYXR0ZXJGbik7XG5TY2F0dGVyLmRpc3BsYXlOYW1lID0gJ1NjYXR0ZXInOyIsInZhciBfZXhjbHVkZWQgPSBbXCJkYW5nZXJvdXNseVNldElubmVySFRNTFwiLCBcInRpY2tzXCJdLFxuICBfZXhjbHVkZWQyID0gW1wiaWRcIl0sXG4gIF9leGNsdWRlZDMgPSBbXCJkb21haW5cIl0sXG4gIF9leGNsdWRlZDQgPSBbXCJkb21haW5cIl07XG5mdW5jdGlvbiBfZXh0ZW5kcygpIHsgcmV0dXJuIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiA/IE9iamVjdC5hc3NpZ24uYmluZCgpIDogZnVuY3Rpb24gKG4pIHsgZm9yICh2YXIgZSA9IDE7IGUgPCBhcmd1bWVudHMubGVuZ3RoOyBlKyspIHsgdmFyIHQgPSBhcmd1bWVudHNbZV07IGZvciAodmFyIHIgaW4gdCkgKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIHIpICYmIChuW3JdID0gdFtyXSk7IH0gcmV0dXJuIG47IH0sIF9leHRlbmRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhlLCB0KSB7IGlmIChudWxsID09IGUpIHJldHVybiB7fTsgdmFyIG8sIHIsIGkgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShlLCB0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG4gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyBmb3IgKHIgPSAwOyByIDwgbi5sZW5ndGg7IHIrKykgbyA9IG5bcl0sIC0xID09PSB0LmluZGV4T2YobykgJiYge30ucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChlLCBvKSAmJiAoaVtvXSA9IGVbb10pOyB9IHJldHVybiBpOyB9XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShyLCBlKSB7IGlmIChudWxsID09IHIpIHJldHVybiB7fTsgdmFyIHQgPSB7fTsgZm9yICh2YXIgbiBpbiByKSBpZiAoe30uaGFzT3duUHJvcGVydHkuY2FsbChyLCBuKSkgeyBpZiAoLTEgIT09IGUuaW5kZXhPZihuKSkgY29udGludWU7IHRbbl0gPSByW25dOyB9IHJldHVybiB0OyB9XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBpc1ZhbGlkRWxlbWVudCwgdXNlTGF5b3V0RWZmZWN0LCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBDYXJ0ZXNpYW5BeGlzIH0gZnJvbSAnLi9DYXJ0ZXNpYW5BeGlzJztcbmltcG9ydCB7IGFkZFlBeGlzLCByZW1vdmVZQXhpcywgdXBkYXRlWUF4aXNXaWR0aCB9IGZyb20gJy4uL3N0YXRlL2NhcnRlc2lhbkF4aXNTbGljZSc7XG5pbXBvcnQgeyB1c2VBcHBEaXNwYXRjaCwgdXNlQXBwU2VsZWN0b3IgfSBmcm9tICcuLi9zdGF0ZS9ob29rcyc7XG5pbXBvcnQgeyBpbXBsaWNpdFlBeGlzLCBzZWxlY3RBeGlzU2NhbGUsIHNlbGVjdFRpY2tzT2ZBeGlzLCBzZWxlY3RZQXhpc1Bvc2l0aW9uLCBzZWxlY3RZQXhpc1NldHRpbmdzTm9EZWZhdWx0cywgc2VsZWN0WUF4aXNTaXplIH0gZnJvbSAnLi4vc3RhdGUvc2VsZWN0b3JzL2F4aXNTZWxlY3RvcnMnO1xuaW1wb3J0IHsgc2VsZWN0QXhpc1ZpZXdCb3ggfSBmcm9tICcuLi9zdGF0ZS9zZWxlY3RvcnMvc2VsZWN0Q2hhcnRPZmZzZXRJbnRlcm5hbCc7XG5pbXBvcnQgeyB1c2VJc1Bhbm9yYW1hIH0gZnJvbSAnLi4vY29udGV4dC9QYW5vcmFtYUNvbnRleHQnO1xuaW1wb3J0IHsgaXNMYWJlbENvbnRlbnRBRnVuY3Rpb24gfSBmcm9tICcuLi9jb21wb25lbnQvTGFiZWwnO1xuaW1wb3J0IHsgc2hhbGxvd0VxdWFsIH0gZnJvbSAnLi4vdXRpbC9TaGFsbG93RXF1YWwnO1xuaW1wb3J0IHsgcmVzb2x2ZURlZmF1bHRQcm9wcyB9IGZyb20gJy4uL3V0aWwvcmVzb2x2ZURlZmF1bHRQcm9wcyc7XG5mdW5jdGlvbiBTZXRZQXhpc1NldHRpbmdzKHNldHRpbmdzKSB7XG4gIHZhciBkaXNwYXRjaCA9IHVzZUFwcERpc3BhdGNoKCk7XG4gIHVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgZGlzcGF0Y2goYWRkWUF4aXMoc2V0dGluZ3MpKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZGlzcGF0Y2gocmVtb3ZlWUF4aXMoc2V0dGluZ3MpKTtcbiAgICB9O1xuICB9LCBbc2V0dGluZ3MsIGRpc3BhdGNoXSk7XG4gIHJldHVybiBudWxsO1xufVxudmFyIFlBeGlzSW1wbCA9IHByb3BzID0+IHtcbiAgdmFyIHtcbiAgICB5QXhpc0lkLFxuICAgIGNsYXNzTmFtZSxcbiAgICB3aWR0aCxcbiAgICBsYWJlbFxuICB9ID0gcHJvcHM7XG4gIHZhciBjYXJ0ZXNpYW5BeGlzUmVmID0gdXNlUmVmKG51bGwpO1xuICB2YXIgbGFiZWxSZWYgPSB1c2VSZWYobnVsbCk7XG4gIHZhciB2aWV3Qm94ID0gdXNlQXBwU2VsZWN0b3Ioc2VsZWN0QXhpc1ZpZXdCb3gpO1xuICB2YXIgaXNQYW5vcmFtYSA9IHVzZUlzUGFub3JhbWEoKTtcbiAgdmFyIGRpc3BhdGNoID0gdXNlQXBwRGlzcGF0Y2goKTtcbiAgdmFyIGF4aXNUeXBlID0gJ3lBeGlzJztcbiAgdmFyIHNjYWxlID0gdXNlQXBwU2VsZWN0b3Ioc3RhdGUgPT4gc2VsZWN0QXhpc1NjYWxlKHN0YXRlLCBheGlzVHlwZSwgeUF4aXNJZCwgaXNQYW5vcmFtYSkpO1xuICB2YXIgYXhpc1NpemUgPSB1c2VBcHBTZWxlY3RvcihzdGF0ZSA9PiBzZWxlY3RZQXhpc1NpemUoc3RhdGUsIHlBeGlzSWQpKTtcbiAgdmFyIHBvc2l0aW9uID0gdXNlQXBwU2VsZWN0b3Ioc3RhdGUgPT4gc2VsZWN0WUF4aXNQb3NpdGlvbihzdGF0ZSwgeUF4aXNJZCkpO1xuICB2YXIgY2FydGVzaWFuVGlja0l0ZW1zID0gdXNlQXBwU2VsZWN0b3Ioc3RhdGUgPT4gc2VsZWN0VGlja3NPZkF4aXMoc3RhdGUsIGF4aXNUeXBlLCB5QXhpc0lkLCBpc1Bhbm9yYW1hKSk7XG4gIC8qXG4gICAqIEhlcmUgd2Ugc2VsZWN0IHNldHRpbmdzIGZyb20gdGhlIHN0b3JlIGFuZCBwcmVmZXIgdG8gdXNlIHRoZW0gaW5zdGVhZCBvZiB0aGUgYWN0dWFsIHByb3BzXG4gICAqIHNvIHRoYXQgdGhlIGNoYXJ0IGlzIGNvbnNpc3RlbnQuIElmIHdlIHVzZWQgdGhlIHByb3BzIGRpcmVjdGx5LCBzb21lIGNvbXBvbmVudHMgd2lsbCB1c2UgYXhpcyBzZXR0aW5nc1xuICAgKiBmcm9tIHN0YXRlIGFuZCBzb21lIGZyb20gcHJvcHMgYW5kIGJlY2F1c2UgdGhlcmUgaXMgYSByZW5kZXIgc3RlcCBiZXR3ZWVuIHRoZXNlIHR3bywgdGhleSBtaWdodCBiZSBzaG93aW5nIGRpZmZlcmVudCB0aGluZ3MuXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9yZWNoYXJ0cy9yZWNoYXJ0cy9pc3N1ZXMvNjI1N1xuICAgKi9cbiAgdmFyIHN5bmNocm9uaXplZFNldHRpbmdzID0gdXNlQXBwU2VsZWN0b3Ioc3RhdGUgPT4gc2VsZWN0WUF4aXNTZXR0aW5nc05vRGVmYXVsdHMoc3RhdGUsIHlBeGlzSWQpKTtcbiAgdXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICAvLyBObyBkeW5hbWljIHdpZHRoIGNhbGN1bGF0aW9uIGlzIGRvbmUgd2hlbiB3aWR0aCAhPT0gJ2F1dG8nXG4gICAgLy8gb3Igd2hlbiBhIGZ1bmN0aW9uL3JlYWN0IGVsZW1lbnQgaXMgdXNlZCBmb3IgbGFiZWxcbiAgICBpZiAod2lkdGggIT09ICdhdXRvJyB8fCAhYXhpc1NpemUgfHwgaXNMYWJlbENvbnRlbnRBRnVuY3Rpb24obGFiZWwpIHx8IC8qI19fUFVSRV9fKi9pc1ZhbGlkRWxlbWVudChsYWJlbCkgfHwgc3luY2hyb25pemVkU2V0dGluZ3MgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgYXhpc0NvbXBvbmVudCA9IGNhcnRlc2lhbkF4aXNSZWYuY3VycmVudDtcbiAgICBpZiAoIWF4aXNDb21wb25lbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHVwZGF0ZWRZQXhpc1dpZHRoID0gYXhpc0NvbXBvbmVudC5nZXRDYWxjdWxhdGVkV2lkdGgoKTtcblxuICAgIC8vIGlmIHRoZSB3aWR0aCBoYXMgY2hhbmdlZCwgZGlzcGF0Y2ggYW4gYWN0aW9uIHRvIHVwZGF0ZSB0aGUgd2lkdGhcbiAgICBpZiAoTWF0aC5yb3VuZChheGlzU2l6ZS53aWR0aCkgIT09IE1hdGgucm91bmQodXBkYXRlZFlBeGlzV2lkdGgpKSB7XG4gICAgICBkaXNwYXRjaCh1cGRhdGVZQXhpc1dpZHRoKHtcbiAgICAgICAgaWQ6IHlBeGlzSWQsXG4gICAgICAgIHdpZHRoOiB1cGRhdGVkWUF4aXNXaWR0aFxuICAgICAgfSkpO1xuICAgIH1cbiAgfSwgW1xuICAvLyBUaGUgZGVwZW5kZW5jeSBvbiBjYXJ0ZXNpYW5BeGlzUmVmLmN1cnJlbnQgaXMgbm90IG5lZWRlZCBiZWNhdXNlIHVzZUxheW91dEVmZmVjdCB3aWxsIHJ1biBhZnRlciBldmVyeSByZW5kZXIuXG4gIC8vIFRoZSByZWYgd2lsbCBiZSBwb3B1bGF0ZWQgYnkgdGhlbi5cbiAgLy8gVG8gcmUtcnVuIHRoaXMgZWZmZWN0IHdoZW4gdGlja3MgY2hhbmdlLCB3ZSBjYW4gZGVwZW5kIG9uIHRoZSB0aWNrcyBhcnJheSBmcm9tIHRoZSBzdG9yZS5cbiAgY2FydGVzaWFuVGlja0l0ZW1zLCBheGlzU2l6ZSwgZGlzcGF0Y2gsIGxhYmVsLCB5QXhpc0lkLCB3aWR0aCwgc3luY2hyb25pemVkU2V0dGluZ3NdKTtcbiAgaWYgKGF4aXNTaXplID09IG51bGwgfHwgcG9zaXRpb24gPT0gbnVsbCB8fCBzeW5jaHJvbml6ZWRTZXR0aW5ncyA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIHtcbiAgICAgIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MLFxuICAgICAgdGlja3NcbiAgICB9ID0gcHJvcHMsXG4gICAgYWxsT3RoZXJQcm9wcyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhwcm9wcywgX2V4Y2x1ZGVkKTtcbiAgdmFyIHtcbiAgICAgIGlkXG4gICAgfSA9IHN5bmNocm9uaXplZFNldHRpbmdzLFxuICAgIHJlc3RTeW5jaHJvbml6ZWRTZXR0aW5ncyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhzeW5jaHJvbml6ZWRTZXR0aW5ncywgX2V4Y2x1ZGVkMik7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChDYXJ0ZXNpYW5BeGlzLCBfZXh0ZW5kcyh7fSwgYWxsT3RoZXJQcm9wcywgcmVzdFN5bmNocm9uaXplZFNldHRpbmdzLCB7XG4gICAgcmVmOiBjYXJ0ZXNpYW5BeGlzUmVmLFxuICAgIGxhYmVsUmVmOiBsYWJlbFJlZixcbiAgICBzY2FsZTogc2NhbGUsXG4gICAgeDogcG9zaXRpb24ueCxcbiAgICB5OiBwb3NpdGlvbi55LFxuICAgIHRpY2tUZXh0UHJvcHM6IHdpZHRoID09PSAnYXV0bycgPyB7XG4gICAgICB3aWR0aDogdW5kZWZpbmVkXG4gICAgfSA6IHtcbiAgICAgIHdpZHRoXG4gICAgfSxcbiAgICB3aWR0aDogYXhpc1NpemUud2lkdGgsXG4gICAgaGVpZ2h0OiBheGlzU2l6ZS5oZWlnaHQsXG4gICAgY2xhc3NOYW1lOiBjbHN4KFwicmVjaGFydHMtXCIuY29uY2F0KGF4aXNUeXBlLCBcIiBcIikuY29uY2F0KGF4aXNUeXBlKSwgY2xhc3NOYW1lKSxcbiAgICB2aWV3Qm94OiB2aWV3Qm94LFxuICAgIHRpY2tzOiBjYXJ0ZXNpYW5UaWNrSXRlbXNcbiAgfSkpO1xufTtcbmV4cG9ydCB2YXIgeUF4aXNEZWZhdWx0UHJvcHMgPSB7XG4gIGFsbG93RGF0YU92ZXJmbG93OiBpbXBsaWNpdFlBeGlzLmFsbG93RGF0YU92ZXJmbG93LFxuICBhbGxvd0RlY2ltYWxzOiBpbXBsaWNpdFlBeGlzLmFsbG93RGVjaW1hbHMsXG4gIGFsbG93RHVwbGljYXRlZENhdGVnb3J5OiBpbXBsaWNpdFlBeGlzLmFsbG93RHVwbGljYXRlZENhdGVnb3J5LFxuICBoaWRlOiBmYWxzZSxcbiAgbWlycm9yOiBpbXBsaWNpdFlBeGlzLm1pcnJvcixcbiAgb3JpZW50YXRpb246IGltcGxpY2l0WUF4aXMub3JpZW50YXRpb24sXG4gIHBhZGRpbmc6IGltcGxpY2l0WUF4aXMucGFkZGluZyxcbiAgcmV2ZXJzZWQ6IGltcGxpY2l0WUF4aXMucmV2ZXJzZWQsXG4gIHNjYWxlOiBpbXBsaWNpdFlBeGlzLnNjYWxlLFxuICB0aWNrQ291bnQ6IGltcGxpY2l0WUF4aXMudGlja0NvdW50LFxuICB0eXBlOiBpbXBsaWNpdFlBeGlzLnR5cGUsXG4gIHdpZHRoOiBpbXBsaWNpdFlBeGlzLndpZHRoLFxuICB5QXhpc0lkOiAwXG59O1xudmFyIFlBeGlzU2V0dGluZ3NEaXNwYXRjaGVyID0gb3V0c2lkZVByb3BzID0+IHtcbiAgdmFyIF9wcm9wcyRpbnRlcnZhbCwgX3Byb3BzJGluY2x1ZGVIaWRkZW4sIF9wcm9wcyRhbmdsZSwgX3Byb3BzJG1pblRpY2tHYXAsIF9wcm9wcyR0aWNrO1xuICB2YXIgcHJvcHMgPSByZXNvbHZlRGVmYXVsdFByb3BzKG91dHNpZGVQcm9wcywgeUF4aXNEZWZhdWx0UHJvcHMpO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNldFlBeGlzU2V0dGluZ3MsIHtcbiAgICBpbnRlcnZhbDogKF9wcm9wcyRpbnRlcnZhbCA9IHByb3BzLmludGVydmFsKSAhPT0gbnVsbCAmJiBfcHJvcHMkaW50ZXJ2YWwgIT09IHZvaWQgMCA/IF9wcm9wcyRpbnRlcnZhbCA6ICdwcmVzZXJ2ZUVuZCcsXG4gICAgaWQ6IHByb3BzLnlBeGlzSWQsXG4gICAgc2NhbGU6IHByb3BzLnNjYWxlLFxuICAgIHR5cGU6IHByb3BzLnR5cGUsXG4gICAgZG9tYWluOiBwcm9wcy5kb21haW4sXG4gICAgYWxsb3dEYXRhT3ZlcmZsb3c6IHByb3BzLmFsbG93RGF0YU92ZXJmbG93LFxuICAgIGRhdGFLZXk6IHByb3BzLmRhdGFLZXksXG4gICAgYWxsb3dEdXBsaWNhdGVkQ2F0ZWdvcnk6IHByb3BzLmFsbG93RHVwbGljYXRlZENhdGVnb3J5LFxuICAgIGFsbG93RGVjaW1hbHM6IHByb3BzLmFsbG93RGVjaW1hbHMsXG4gICAgdGlja0NvdW50OiBwcm9wcy50aWNrQ291bnQsXG4gICAgcGFkZGluZzogcHJvcHMucGFkZGluZyxcbiAgICBpbmNsdWRlSGlkZGVuOiAoX3Byb3BzJGluY2x1ZGVIaWRkZW4gPSBwcm9wcy5pbmNsdWRlSGlkZGVuKSAhPT0gbnVsbCAmJiBfcHJvcHMkaW5jbHVkZUhpZGRlbiAhPT0gdm9pZCAwID8gX3Byb3BzJGluY2x1ZGVIaWRkZW4gOiBmYWxzZSxcbiAgICByZXZlcnNlZDogcHJvcHMucmV2ZXJzZWQsXG4gICAgdGlja3M6IHByb3BzLnRpY2tzLFxuICAgIHdpZHRoOiBwcm9wcy53aWR0aCxcbiAgICBvcmllbnRhdGlvbjogcHJvcHMub3JpZW50YXRpb24sXG4gICAgbWlycm9yOiBwcm9wcy5taXJyb3IsXG4gICAgaGlkZTogcHJvcHMuaGlkZSxcbiAgICB1bml0OiBwcm9wcy51bml0LFxuICAgIG5hbWU6IHByb3BzLm5hbWUsXG4gICAgYW5nbGU6IChfcHJvcHMkYW5nbGUgPSBwcm9wcy5hbmdsZSkgIT09IG51bGwgJiYgX3Byb3BzJGFuZ2xlICE9PSB2b2lkIDAgPyBfcHJvcHMkYW5nbGUgOiAwLFxuICAgIG1pblRpY2tHYXA6IChfcHJvcHMkbWluVGlja0dhcCA9IHByb3BzLm1pblRpY2tHYXApICE9PSBudWxsICYmIF9wcm9wcyRtaW5UaWNrR2FwICE9PSB2b2lkIDAgPyBfcHJvcHMkbWluVGlja0dhcCA6IDUsXG4gICAgdGljazogKF9wcm9wcyR0aWNrID0gcHJvcHMudGljaykgIT09IG51bGwgJiYgX3Byb3BzJHRpY2sgIT09IHZvaWQgMCA/IF9wcm9wcyR0aWNrIDogdHJ1ZSxcbiAgICB0aWNrRm9ybWF0dGVyOiBwcm9wcy50aWNrRm9ybWF0dGVyXG4gIH0pLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChZQXhpc0ltcGwsIHByb3BzKSk7XG59O1xudmFyIFlBeGlzTWVtb0NvbXBhcmF0b3IgPSAocHJldlByb3BzLCBuZXh0UHJvcHMpID0+IHtcbiAgdmFyIHtcbiAgICAgIGRvbWFpbjogcHJldkRvbWFpblxuICAgIH0gPSBwcmV2UHJvcHMsXG4gICAgcHJldlJlc3QgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMocHJldlByb3BzLCBfZXhjbHVkZWQzKTtcbiAgdmFyIHtcbiAgICAgIGRvbWFpbjogbmV4dERvbWFpblxuICAgIH0gPSBuZXh0UHJvcHMsXG4gICAgbmV4dFJlc3QgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMobmV4dFByb3BzLCBfZXhjbHVkZWQ0KTtcbiAgaWYgKCFzaGFsbG93RXF1YWwocHJldlJlc3QsIG5leHRSZXN0KSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShwcmV2RG9tYWluKSAmJiBwcmV2RG9tYWluLmxlbmd0aCA9PT0gMiAmJiBBcnJheS5pc0FycmF5KG5leHREb21haW4pICYmIG5leHREb21haW4ubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIHByZXZEb21haW5bMF0gPT09IG5leHREb21haW5bMF0gJiYgcHJldkRvbWFpblsxXSA9PT0gbmV4dERvbWFpblsxXTtcbiAgfVxuICByZXR1cm4gc2hhbGxvd0VxdWFsKHtcbiAgICBkb21haW46IHByZXZEb21haW5cbiAgfSwge1xuICAgIGRvbWFpbjogbmV4dERvbWFpblxuICB9KTtcbn07XG5leHBvcnQgdmFyIFlBeGlzID0gLyojX19QVVJFX18qL1JlYWN0Lm1lbW8oWUF4aXNTZXR0aW5nc0Rpc3BhdGNoZXIsIFlBeGlzTWVtb0NvbXBhcmF0b3IpO1xuWUF4aXMuZGlzcGxheU5hbWUgPSAnWUF4aXMnOyIsImZ1bmN0aW9uIG93bktleXMoZSwgcikgeyB2YXIgdCA9IE9iamVjdC5rZXlzKGUpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IHIgJiYgKG8gPSBvLmZpbHRlcihmdW5jdGlvbiAocikgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCByKS5lbnVtZXJhYmxlOyB9KSksIHQucHVzaC5hcHBseSh0LCBvKTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZChlKSB7IGZvciAodmFyIHIgPSAxOyByIDwgYXJndW1lbnRzLmxlbmd0aDsgcisrKSB7IHZhciB0ID0gbnVsbCAhPSBhcmd1bWVudHNbcl0gPyBhcmd1bWVudHNbcl0gOiB7fTsgciAlIDIgPyBvd25LZXlzKE9iamVjdCh0KSwgITApLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgX2RlZmluZVByb3BlcnR5KGUsIHIsIHRbcl0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModCkpIDogb3duS2V5cyhPYmplY3QodCkpLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCwgcikpOyB9KTsgfSByZXR1cm4gZTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGUsIHIsIHQpIHsgcmV0dXJuIChyID0gX3RvUHJvcGVydHlLZXkocikpIGluIGUgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgeyB2YWx1ZTogdCwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSA6IGVbcl0gPSB0LCBlOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleSh0KSB7IHZhciBpID0gX3RvUHJpbWl0aXZlKHQsIFwic3RyaW5nXCIpOyByZXR1cm4gXCJzeW1ib2xcIiA9PSB0eXBlb2YgaSA/IGkgOiBpICsgXCJcIjsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKHQsIHIpIHsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIHQgfHwgIXQpIHJldHVybiB0OyB2YXIgZSA9IHRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHZvaWQgMCAhPT0gZSkgeyB2YXIgaSA9IGUuY2FsbCh0LCByIHx8IFwiZGVmYXVsdFwiKTsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIGkpIHJldHVybiBpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChcInN0cmluZ1wiID09PSByID8gU3RyaW5nIDogTnVtYmVyKSh0KTsgfVxuZnVuY3Rpb24gX2V4dGVuZHMoKSB7IHJldHVybiBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gPyBPYmplY3QuYXNzaWduLmJpbmQoKSA6IGZ1bmN0aW9uIChuKSB7IGZvciAodmFyIGUgPSAxOyBlIDwgYXJndW1lbnRzLmxlbmd0aDsgZSsrKSB7IHZhciB0ID0gYXJndW1lbnRzW2VdOyBmb3IgKHZhciByIGluIHQpICh7fSkuaGFzT3duUHJvcGVydHkuY2FsbCh0LCByKSAmJiAobltyXSA9IHRbcl0pOyB9IHJldHVybiBuOyB9LCBfZXh0ZW5kcy5hcHBseShudWxsLCBhcmd1bWVudHMpOyB9XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBDb21wb25lbnQsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IExheWVyIH0gZnJvbSAnLi4vY29udGFpbmVyL0xheWVyJztcbmltcG9ydCB7IERvdCB9IGZyb20gJy4uL3NoYXBlL0RvdCc7XG5pbXBvcnQgeyBDYXJ0ZXNpYW5MYWJlbENvbnRleHRQcm92aWRlciwgQ2FydGVzaWFuTGFiZWxGcm9tTGFiZWxQcm9wIH0gZnJvbSAnLi4vY29tcG9uZW50L0xhYmVsJztcbmltcG9ydCB7IGlzTnVtT3JTdHIgfSBmcm9tICcuLi91dGlsL0RhdGFVdGlscyc7XG5pbXBvcnQgeyBjcmVhdGVMYWJlbGVkU2NhbGVzIH0gZnJvbSAnLi4vdXRpbC9DYXJ0ZXNpYW5VdGlscyc7XG5pbXBvcnQgeyBhZGREb3QsIHJlbW92ZURvdCB9IGZyb20gJy4uL3N0YXRlL3JlZmVyZW5jZUVsZW1lbnRzU2xpY2UnO1xuaW1wb3J0IHsgdXNlQXBwRGlzcGF0Y2gsIHVzZUFwcFNlbGVjdG9yIH0gZnJvbSAnLi4vc3RhdGUvaG9va3MnO1xuaW1wb3J0IHsgc2VsZWN0QXhpc1NjYWxlIH0gZnJvbSAnLi4vc3RhdGUvc2VsZWN0b3JzL2F4aXNTZWxlY3RvcnMnO1xuaW1wb3J0IHsgdXNlSXNQYW5vcmFtYSB9IGZyb20gJy4uL2NvbnRleHQvUGFub3JhbWFDb250ZXh0JztcbmltcG9ydCB7IHVzZUNsaXBQYXRoSWQgfSBmcm9tICcuLi9jb250YWluZXIvQ2xpcFBhdGhQcm92aWRlcic7XG5pbXBvcnQgeyBzdmdQcm9wZXJ0aWVzQW5kRXZlbnRzIH0gZnJvbSAnLi4vdXRpbC9zdmdQcm9wZXJ0aWVzQW5kRXZlbnRzJztcbnZhciB1c2VDb29yZGluYXRlID0gKHgsIHksIHhBeGlzSWQsIHlBeGlzSWQsIGlmT3ZlcmZsb3cpID0+IHtcbiAgdmFyIGlzWCA9IGlzTnVtT3JTdHIoeCk7XG4gIHZhciBpc1kgPSBpc051bU9yU3RyKHkpO1xuICB2YXIgaXNQYW5vcmFtYSA9IHVzZUlzUGFub3JhbWEoKTtcbiAgdmFyIHhBeGlzU2NhbGUgPSB1c2VBcHBTZWxlY3RvcihzdGF0ZSA9PiBzZWxlY3RBeGlzU2NhbGUoc3RhdGUsICd4QXhpcycsIHhBeGlzSWQsIGlzUGFub3JhbWEpKTtcbiAgdmFyIHlBeGlzU2NhbGUgPSB1c2VBcHBTZWxlY3RvcihzdGF0ZSA9PiBzZWxlY3RBeGlzU2NhbGUoc3RhdGUsICd5QXhpcycsIHlBeGlzSWQsIGlzUGFub3JhbWEpKTtcbiAgaWYgKCFpc1ggfHwgIWlzWSB8fCB4QXhpc1NjYWxlID09IG51bGwgfHwgeUF4aXNTY2FsZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIHNjYWxlcyA9IGNyZWF0ZUxhYmVsZWRTY2FsZXMoe1xuICAgIHg6IHhBeGlzU2NhbGUsXG4gICAgeTogeUF4aXNTY2FsZVxuICB9KTtcbiAgdmFyIHJlc3VsdCA9IHNjYWxlcy5hcHBseSh7XG4gICAgeCxcbiAgICB5XG4gIH0sIHtcbiAgICBiYW5kQXdhcmU6IHRydWVcbiAgfSk7XG4gIGlmIChpZk92ZXJmbG93ID09PSAnZGlzY2FyZCcgJiYgIXNjYWxlcy5pc0luUmFuZ2UocmVzdWx0KSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuZnVuY3Rpb24gUmVwb3J0UmVmZXJlbmNlRG90KHByb3BzKSB7XG4gIHZhciBkaXNwYXRjaCA9IHVzZUFwcERpc3BhdGNoKCk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgZGlzcGF0Y2goYWRkRG90KHByb3BzKSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRpc3BhdGNoKHJlbW92ZURvdChwcm9wcykpO1xuICAgIH07XG4gIH0pO1xuICByZXR1cm4gbnVsbDtcbn1cbnZhciByZW5kZXJEb3QgPSAob3B0aW9uLCBwcm9wcykgPT4ge1xuICB2YXIgZG90O1xuICBpZiAoLyojX19QVVJFX18qL1JlYWN0LmlzVmFsaWRFbGVtZW50KG9wdGlvbikpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGVsZW1lbnQgY2xvbmluZyBpcyBub3QgdHlwZWRcbiAgICBkb3QgPSAvKiNfX1BVUkVfXyovUmVhY3QuY2xvbmVFbGVtZW50KG9wdGlvbiwgcHJvcHMpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICBkb3QgPSBvcHRpb24ocHJvcHMpO1xuICB9IGVsc2Uge1xuICAgIGRvdCA9IC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KERvdCwgX2V4dGVuZHMoe30sIHByb3BzLCB7XG4gICAgICBjeDogcHJvcHMuY3gsXG4gICAgICBjeTogcHJvcHMuY3ksXG4gICAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtcmVmZXJlbmNlLWRvdC1kb3RcIlxuICAgIH0pKTtcbiAgfVxuICByZXR1cm4gZG90O1xufTtcbmZ1bmN0aW9uIFJlZmVyZW5jZURvdEltcGwocHJvcHMpIHtcbiAgdmFyIHtcbiAgICB4LFxuICAgIHksXG4gICAgclxuICB9ID0gcHJvcHM7XG4gIHZhciBjbGlwUGF0aElkID0gdXNlQ2xpcFBhdGhJZCgpO1xuICB2YXIgY29vcmRpbmF0ZSA9IHVzZUNvb3JkaW5hdGUoeCwgeSwgcHJvcHMueEF4aXNJZCwgcHJvcHMueUF4aXNJZCwgcHJvcHMuaWZPdmVyZmxvdyk7XG4gIGlmICghY29vcmRpbmF0ZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciB7XG4gICAgeDogY3gsXG4gICAgeTogY3lcbiAgfSA9IGNvb3JkaW5hdGU7XG4gIHZhciB7XG4gICAgc2hhcGUsXG4gICAgY2xhc3NOYW1lLFxuICAgIGlmT3ZlcmZsb3dcbiAgfSA9IHByb3BzO1xuICB2YXIgY2xpcFBhdGggPSBpZk92ZXJmbG93ID09PSAnaGlkZGVuJyA/IFwidXJsKCNcIi5jb25jYXQoY2xpcFBhdGhJZCwgXCIpXCIpIDogdW5kZWZpbmVkO1xuICB2YXIgZG90UHJvcHMgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe1xuICAgIGNsaXBQYXRoXG4gIH0sIHN2Z1Byb3BlcnRpZXNBbmRFdmVudHMocHJvcHMpKSwge30sIHtcbiAgICBjeCxcbiAgICBjeVxuICB9KTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCB7XG4gICAgY2xhc3NOYW1lOiBjbHN4KCdyZWNoYXJ0cy1yZWZlcmVuY2UtZG90JywgY2xhc3NOYW1lKVxuICB9LCByZW5kZXJEb3Qoc2hhcGUsIGRvdFByb3BzKSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ2FydGVzaWFuTGFiZWxDb250ZXh0UHJvdmlkZXIsIHtcbiAgICB4OiBjeCAtIHIsXG4gICAgeTogY3kgLSByLFxuICAgIHdpZHRoOiAyICogcixcbiAgICBoZWlnaHQ6IDIgKiByXG4gIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KENhcnRlc2lhbkxhYmVsRnJvbUxhYmVsUHJvcCwge1xuICAgIGxhYmVsOiBwcm9wcy5sYWJlbFxuICB9KSwgcHJvcHMuY2hpbGRyZW4pKTtcbn1cbmZ1bmN0aW9uIFJlZmVyZW5jZURvdFNldHRpbmdzRGlzcGF0Y2hlcihwcm9wcykge1xuICB2YXIge1xuICAgIHgsXG4gICAgeSxcbiAgICByLFxuICAgIGlmT3ZlcmZsb3csXG4gICAgeUF4aXNJZCxcbiAgICB4QXhpc0lkXG4gIH0gPSBwcm9wcztcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlYWN0LkZyYWdtZW50LCBudWxsLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZXBvcnRSZWZlcmVuY2VEb3QsIHtcbiAgICB5OiB5LFxuICAgIHg6IHgsXG4gICAgcjogcixcbiAgICB5QXhpc0lkOiB5QXhpc0lkLFxuICAgIHhBeGlzSWQ6IHhBeGlzSWQsXG4gICAgaWZPdmVyZmxvdzogaWZPdmVyZmxvd1xuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVmZXJlbmNlRG90SW1wbCwgcHJvcHMpKTtcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlYWN0L3ByZWZlci1zdGF0ZWxlc3MtZnVuY3Rpb25cbmV4cG9ydCBjbGFzcyBSZWZlcmVuY2VEb3QgZXh0ZW5kcyBDb21wb25lbnQge1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlZmVyZW5jZURvdFNldHRpbmdzRGlzcGF0Y2hlciwgdGhpcy5wcm9wcyk7XG4gIH1cbn1cbl9kZWZpbmVQcm9wZXJ0eShSZWZlcmVuY2VEb3QsIFwiZGlzcGxheU5hbWVcIiwgJ1JlZmVyZW5jZURvdCcpO1xuX2RlZmluZVByb3BlcnR5KFJlZmVyZW5jZURvdCwgXCJkZWZhdWx0UHJvcHNcIiwge1xuICBpZk92ZXJmbG93OiAnZGlzY2FyZCcsXG4gIHhBeGlzSWQ6IDAsXG4gIHlBeGlzSWQ6IDAsXG4gIHI6IDEwLFxuICBmaWxsOiAnI2ZmZicsXG4gIHN0cm9rZTogJyNjY2MnLFxuICBmaWxsT3BhY2l0eTogMSxcbiAgc3Ryb2tlV2lkdGg6IDFcbn0pOyIsImZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IENvbXBvbmVudCwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgYWRkWkF4aXMsIHJlbW92ZVpBeGlzIH0gZnJvbSAnLi4vc3RhdGUvY2FydGVzaWFuQXhpc1NsaWNlJztcbmltcG9ydCB7IHVzZUFwcERpc3BhdGNoIH0gZnJvbSAnLi4vc3RhdGUvaG9va3MnO1xuaW1wb3J0IHsgaW1wbGljaXRaQXhpcyB9IGZyb20gJy4uL3N0YXRlL3NlbGVjdG9ycy9heGlzU2VsZWN0b3JzJztcbmZ1bmN0aW9uIFNldFpBeGlzU2V0dGluZ3Moc2V0dGluZ3MpIHtcbiAgdmFyIGRpc3BhdGNoID0gdXNlQXBwRGlzcGF0Y2goKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBkaXNwYXRjaChhZGRaQXhpcyhzZXR0aW5ncykpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkaXNwYXRjaChyZW1vdmVaQXhpcyhzZXR0aW5ncykpO1xuICAgIH07XG4gIH0sIFtzZXR0aW5ncywgZGlzcGF0Y2hdKTtcbiAgcmV0dXJuIG51bGw7XG59XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QvcHJlZmVyLXN0YXRlbGVzcy1mdW5jdGlvblxuZXhwb3J0IGNsYXNzIFpBeGlzIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTZXRaQXhpc1NldHRpbmdzLCB7XG4gICAgICBkb21haW46IHRoaXMucHJvcHMuZG9tYWluLFxuICAgICAgaWQ6IHRoaXMucHJvcHMuekF4aXNJZCxcbiAgICAgIGRhdGFLZXk6IHRoaXMucHJvcHMuZGF0YUtleSxcbiAgICAgIG5hbWU6IHRoaXMucHJvcHMubmFtZSxcbiAgICAgIHVuaXQ6IHRoaXMucHJvcHMudW5pdCxcbiAgICAgIHJhbmdlOiB0aGlzLnByb3BzLnJhbmdlLFxuICAgICAgc2NhbGU6IHRoaXMucHJvcHMuc2NhbGUsXG4gICAgICB0eXBlOiB0aGlzLnByb3BzLnR5cGUsXG4gICAgICBhbGxvd0R1cGxpY2F0ZWRDYXRlZ29yeTogaW1wbGljaXRaQXhpcy5hbGxvd0R1cGxpY2F0ZWRDYXRlZ29yeSxcbiAgICAgIGFsbG93RGF0YU92ZXJmbG93OiBpbXBsaWNpdFpBeGlzLmFsbG93RGF0YU92ZXJmbG93LFxuICAgICAgcmV2ZXJzZWQ6IGltcGxpY2l0WkF4aXMucmV2ZXJzZWQsXG4gICAgICBpbmNsdWRlSGlkZGVuOiBpbXBsaWNpdFpBeGlzLmluY2x1ZGVIaWRkZW5cbiAgICB9KTtcbiAgfVxufVxuX2RlZmluZVByb3BlcnR5KFpBeGlzLCBcImRpc3BsYXlOYW1lXCIsICdaQXhpcycpO1xuX2RlZmluZVByb3BlcnR5KFpBeGlzLCBcImRlZmF1bHRQcm9wc1wiLCB7XG4gIHpBeGlzSWQ6IDAsXG4gIHJhbmdlOiBpbXBsaWNpdFpBeGlzLnJhbmdlLFxuICBzY2FsZTogaW1wbGljaXRaQXhpcy5zY2FsZSxcbiAgdHlwZTogaW1wbGljaXRaQXhpcy50eXBlXG59KTsiLCJmdW5jdGlvbiBvd25LZXlzKGUsIHIpIHsgdmFyIHQgPSBPYmplY3Qua2V5cyhlKTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyByICYmIChvID0gby5maWx0ZXIoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgcikuZW51bWVyYWJsZTsgfSkpLCB0LnB1c2guYXBwbHkodCwgbyk7IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQoZSkgeyBmb3IgKHZhciByID0gMTsgciA8IGFyZ3VtZW50cy5sZW5ndGg7IHIrKykgeyB2YXIgdCA9IG51bGwgIT0gYXJndW1lbnRzW3JdID8gYXJndW1lbnRzW3JdIDoge307IHIgJSAyID8gb3duS2V5cyhPYmplY3QodCksICEwKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0W3JdKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHQpKSA6IG93bktleXMoT2JqZWN0KHQpKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsIHIpKTsgfSk7IH0gcmV0dXJuIGU7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbmZ1bmN0aW9uIF9leHRlbmRzKCkgeyByZXR1cm4gX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAobikgeyBmb3IgKHZhciBlID0gMTsgZSA8IGFyZ3VtZW50cy5sZW5ndGg7IGUrKykgeyB2YXIgdCA9IGFyZ3VtZW50c1tlXTsgZm9yICh2YXIgciBpbiB0KSAoe30pLmhhc093blByb3BlcnR5LmNhbGwodCwgcikgJiYgKG5bcl0gPSB0W3JdKTsgfSByZXR1cm4gbjsgfSwgX2V4dGVuZHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuLyoqXG4gKiBAZmlsZU92ZXJ2aWV3IFJlZmVyZW5jZSBMaW5lXG4gKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IENvbXBvbmVudCwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgTGF5ZXIgfSBmcm9tICcuLi9jb250YWluZXIvTGF5ZXInO1xuaW1wb3J0IHsgQ2FydGVzaWFuTGFiZWxDb250ZXh0UHJvdmlkZXIsIENhcnRlc2lhbkxhYmVsRnJvbUxhYmVsUHJvcCB9IGZyb20gJy4uL2NvbXBvbmVudC9MYWJlbCc7XG5pbXBvcnQgeyBpc05hbiwgaXNOdW1PclN0ciB9IGZyb20gJy4uL3V0aWwvRGF0YVV0aWxzJztcbmltcG9ydCB7IGNyZWF0ZUxhYmVsZWRTY2FsZXMsIHJlY3RXaXRoQ29vcmRzIH0gZnJvbSAnLi4vdXRpbC9DYXJ0ZXNpYW5VdGlscyc7XG5pbXBvcnQgeyB1c2VWaWV3Qm94IH0gZnJvbSAnLi4vY29udGV4dC9jaGFydExheW91dENvbnRleHQnO1xuaW1wb3J0IHsgYWRkTGluZSwgcmVtb3ZlTGluZSB9IGZyb20gJy4uL3N0YXRlL3JlZmVyZW5jZUVsZW1lbnRzU2xpY2UnO1xuaW1wb3J0IHsgdXNlQXBwRGlzcGF0Y2gsIHVzZUFwcFNlbGVjdG9yIH0gZnJvbSAnLi4vc3RhdGUvaG9va3MnO1xuaW1wb3J0IHsgc2VsZWN0QXhpc1NjYWxlLCBzZWxlY3RYQXhpc1NldHRpbmdzLCBzZWxlY3RZQXhpc1NldHRpbmdzIH0gZnJvbSAnLi4vc3RhdGUvc2VsZWN0b3JzL2F4aXNTZWxlY3RvcnMnO1xuaW1wb3J0IHsgdXNlSXNQYW5vcmFtYSB9IGZyb20gJy4uL2NvbnRleHQvUGFub3JhbWFDb250ZXh0JztcbmltcG9ydCB7IHVzZUNsaXBQYXRoSWQgfSBmcm9tICcuLi9jb250YWluZXIvQ2xpcFBhdGhQcm92aWRlcic7XG5pbXBvcnQgeyBzdmdQcm9wZXJ0aWVzQW5kRXZlbnRzIH0gZnJvbSAnLi4vdXRpbC9zdmdQcm9wZXJ0aWVzQW5kRXZlbnRzJztcblxuLyoqXG4gKiBUaGlzIGV4Y2x1ZGVzIGB2aWV3Qm94YCBwcm9wIGZyb20gc3ZnIGZvciB0d28gcmVhc29uczpcbiAqIDEuIFRoZSBjb21wb25lbnRzIHdhbnRzIHZpZXdCb3ggb2Ygb2JqZWN0IHR5cGUsIGFuZCBzdmcgd2FudHMgc3RyaW5nXG4gKiAgICAtIHNvIHRoZXJlJ3MgYSBjb25mbGljdCwgYW5kIHRoZSBjb21wb25lbnQgd2lsbCB0aHJvdyBpZiBpdCBnZXRzIHN0cmluZ1xuICogMi4gSW50ZXJuYWxseSB0aGUgY29tcG9uZW50IGNhbGxzIGBzdmdQcm9wZXJ0aWVzTm9FdmVudHNgIHdoaWNoIGZpbHRlcnMgdGhlIHZpZXdCb3ggYXdheSBhbnl3YXlcbiAqL1xuXG52YXIgcmVuZGVyTGluZSA9IChvcHRpb24sIHByb3BzKSA9PiB7XG4gIHZhciBsaW5lO1xuICBpZiAoLyojX19QVVJFX18qL1JlYWN0LmlzVmFsaWRFbGVtZW50KG9wdGlvbikpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGVsZW1lbnQgY2xvbmluZyBpcyBub3QgdHlwZWRcbiAgICBsaW5lID0gLyojX19QVVJFX18qL1JlYWN0LmNsb25lRWxlbWVudChvcHRpb24sIHByb3BzKTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgbGluZSA9IG9wdGlvbihwcm9wcyk7XG4gIH0gZWxzZSB7XG4gICAgbGluZSA9IC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwibGluZVwiLCBfZXh0ZW5kcyh7fSwgcHJvcHMsIHtcbiAgICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1yZWZlcmVuY2UtbGluZS1saW5lXCJcbiAgICB9KSk7XG4gIH1cbiAgcmV0dXJuIGxpbmU7XG59O1xuLy8gVE9ETzogU2NhbGVIZWxwZXJcbmV4cG9ydCB2YXIgZ2V0RW5kUG9pbnRzID0gKHNjYWxlcywgaXNGaXhlZFgsIGlzRml4ZWRZLCBpc1NlZ21lbnQsIHZpZXdCb3gsIHBvc2l0aW9uLCB4QXhpc09yaWVudGF0aW9uLCB5QXhpc09yaWVudGF0aW9uLCBwcm9wcykgPT4ge1xuICB2YXIge1xuICAgIHgsXG4gICAgeSxcbiAgICB3aWR0aCxcbiAgICBoZWlnaHRcbiAgfSA9IHZpZXdCb3g7XG4gIGlmIChpc0ZpeGVkWSkge1xuICAgIHZhciB7XG4gICAgICB5OiB5Q29vcmRcbiAgICB9ID0gcHJvcHM7XG4gICAgdmFyIGNvb3JkID0gc2NhbGVzLnkuYXBwbHkoeUNvb3JkLCB7XG4gICAgICBwb3NpdGlvblxuICAgIH0pO1xuICAgIC8vIGRvbid0IHJlbmRlciB0aGUgbGluZSBpZiB0aGUgc2NhbGUgY2FuJ3QgY29tcHV0ZSBhIHJlc3VsdCB0aGF0IG1ha2VzIHNlbnNlXG4gICAgaWYgKGlzTmFuKGNvb3JkKSkgcmV0dXJuIG51bGw7XG4gICAgaWYgKHByb3BzLmlmT3ZlcmZsb3cgPT09ICdkaXNjYXJkJyAmJiAhc2NhbGVzLnkuaXNJblJhbmdlKGNvb3JkKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhciBwb2ludHMgPSBbe1xuICAgICAgeDogeCArIHdpZHRoLFxuICAgICAgeTogY29vcmRcbiAgICB9LCB7XG4gICAgICB4LFxuICAgICAgeTogY29vcmRcbiAgICB9XTtcbiAgICByZXR1cm4geUF4aXNPcmllbnRhdGlvbiA9PT0gJ2xlZnQnID8gcG9pbnRzLnJldmVyc2UoKSA6IHBvaW50cztcbiAgfVxuICBpZiAoaXNGaXhlZFgpIHtcbiAgICB2YXIge1xuICAgICAgeDogeENvb3JkXG4gICAgfSA9IHByb3BzO1xuICAgIHZhciBfY29vcmQgPSBzY2FsZXMueC5hcHBseSh4Q29vcmQsIHtcbiAgICAgIHBvc2l0aW9uXG4gICAgfSk7XG4gICAgLy8gZG9uJ3QgcmVuZGVyIHRoZSBsaW5lIGlmIHRoZSBzY2FsZSBjYW4ndCBjb21wdXRlIGEgcmVzdWx0IHRoYXQgbWFrZXMgc2Vuc2VcbiAgICBpZiAoaXNOYW4oX2Nvb3JkKSkgcmV0dXJuIG51bGw7XG4gICAgaWYgKHByb3BzLmlmT3ZlcmZsb3cgPT09ICdkaXNjYXJkJyAmJiAhc2NhbGVzLnguaXNJblJhbmdlKF9jb29yZCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgX3BvaW50cyA9IFt7XG4gICAgICB4OiBfY29vcmQsXG4gICAgICB5OiB5ICsgaGVpZ2h0XG4gICAgfSwge1xuICAgICAgeDogX2Nvb3JkLFxuICAgICAgeVxuICAgIH1dO1xuICAgIHJldHVybiB4QXhpc09yaWVudGF0aW9uID09PSAndG9wJyA/IF9wb2ludHMucmV2ZXJzZSgpIDogX3BvaW50cztcbiAgfVxuICBpZiAoaXNTZWdtZW50KSB7XG4gICAgdmFyIHtcbiAgICAgIHNlZ21lbnRcbiAgICB9ID0gcHJvcHM7XG4gICAgdmFyIF9wb2ludHMyID0gc2VnbWVudC5tYXAocCA9PiBzY2FsZXMuYXBwbHkocCwge1xuICAgICAgcG9zaXRpb25cbiAgICB9KSk7XG4gICAgaWYgKHByb3BzLmlmT3ZlcmZsb3cgPT09ICdkaXNjYXJkJyAmJiBfcG9pbnRzMi5zb21lKHAgPT4gIXNjYWxlcy5pc0luUmFuZ2UocCkpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIF9wb2ludHMyO1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcbmZ1bmN0aW9uIFJlcG9ydFJlZmVyZW5jZUxpbmUocHJvcHMpIHtcbiAgdmFyIGRpc3BhdGNoID0gdXNlQXBwRGlzcGF0Y2goKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBkaXNwYXRjaChhZGRMaW5lKHByb3BzKSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRpc3BhdGNoKHJlbW92ZUxpbmUocHJvcHMpKTtcbiAgICB9O1xuICB9KTtcbiAgcmV0dXJuIG51bGw7XG59XG5mdW5jdGlvbiBSZWZlcmVuY2VMaW5lSW1wbChwcm9wcykge1xuICB2YXIge1xuICAgIHg6IGZpeGVkWCxcbiAgICB5OiBmaXhlZFksXG4gICAgc2VnbWVudCxcbiAgICB4QXhpc0lkLFxuICAgIHlBeGlzSWQsXG4gICAgc2hhcGUsXG4gICAgY2xhc3NOYW1lLFxuICAgIGlmT3ZlcmZsb3dcbiAgfSA9IHByb3BzO1xuICB2YXIgaXNQYW5vcmFtYSA9IHVzZUlzUGFub3JhbWEoKTtcbiAgdmFyIGNsaXBQYXRoSWQgPSB1c2VDbGlwUGF0aElkKCk7XG4gIHZhciB4QXhpcyA9IHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdFhBeGlzU2V0dGluZ3Moc3RhdGUsIHhBeGlzSWQpKTtcbiAgdmFyIHlBeGlzID0gdXNlQXBwU2VsZWN0b3Ioc3RhdGUgPT4gc2VsZWN0WUF4aXNTZXR0aW5ncyhzdGF0ZSwgeUF4aXNJZCkpO1xuICB2YXIgeEF4aXNTY2FsZSA9IHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdEF4aXNTY2FsZShzdGF0ZSwgJ3hBeGlzJywgeEF4aXNJZCwgaXNQYW5vcmFtYSkpO1xuICB2YXIgeUF4aXNTY2FsZSA9IHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdEF4aXNTY2FsZShzdGF0ZSwgJ3lBeGlzJywgeUF4aXNJZCwgaXNQYW5vcmFtYSkpO1xuICB2YXIgdmlld0JveCA9IHVzZVZpZXdCb3goKTtcbiAgdmFyIGlzRml4ZWRYID0gaXNOdW1PclN0cihmaXhlZFgpO1xuICB2YXIgaXNGaXhlZFkgPSBpc051bU9yU3RyKGZpeGVkWSk7XG4gIGlmICghY2xpcFBhdGhJZCB8fCAhdmlld0JveCB8fCB4QXhpcyA9PSBudWxsIHx8IHlBeGlzID09IG51bGwgfHwgeEF4aXNTY2FsZSA9PSBudWxsIHx8IHlBeGlzU2NhbGUgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBzY2FsZXMgPSBjcmVhdGVMYWJlbGVkU2NhbGVzKHtcbiAgICB4OiB4QXhpc1NjYWxlLFxuICAgIHk6IHlBeGlzU2NhbGVcbiAgfSk7XG4gIHZhciBpc1NlZ21lbnQgPSBzZWdtZW50ICYmIHNlZ21lbnQubGVuZ3RoID09PSAyO1xuICB2YXIgZW5kUG9pbnRzID0gZ2V0RW5kUG9pbnRzKHNjYWxlcywgaXNGaXhlZFgsIGlzRml4ZWRZLCBpc1NlZ21lbnQsIHZpZXdCb3gsIHByb3BzLnBvc2l0aW9uLCB4QXhpcy5vcmllbnRhdGlvbiwgeUF4aXMub3JpZW50YXRpb24sIHByb3BzKTtcbiAgaWYgKCFlbmRQb2ludHMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgW3tcbiAgICB4OiB4MSxcbiAgICB5OiB5MVxuICB9LCB7XG4gICAgeDogeDIsXG4gICAgeTogeTJcbiAgfV0gPSBlbmRQb2ludHM7XG4gIHZhciBjbGlwUGF0aCA9IGlmT3ZlcmZsb3cgPT09ICdoaWRkZW4nID8gXCJ1cmwoI1wiLmNvbmNhdChjbGlwUGF0aElkLCBcIilcIikgOiB1bmRlZmluZWQ7XG4gIHZhciBsaW5lUHJvcHMgPSBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe1xuICAgIGNsaXBQYXRoXG4gIH0sIHN2Z1Byb3BlcnRpZXNBbmRFdmVudHMocHJvcHMpKSwge30sIHtcbiAgICB4MSxcbiAgICB5MSxcbiAgICB4MixcbiAgICB5MlxuICB9KTtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCB7XG4gICAgY2xhc3NOYW1lOiBjbHN4KCdyZWNoYXJ0cy1yZWZlcmVuY2UtbGluZScsIGNsYXNzTmFtZSlcbiAgfSwgcmVuZGVyTGluZShzaGFwZSwgbGluZVByb3BzKSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ2FydGVzaWFuTGFiZWxDb250ZXh0UHJvdmlkZXIsIHJlY3RXaXRoQ29vcmRzKHtcbiAgICB4MSxcbiAgICB5MSxcbiAgICB4MixcbiAgICB5MlxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ2FydGVzaWFuTGFiZWxGcm9tTGFiZWxQcm9wLCB7XG4gICAgbGFiZWw6IHByb3BzLmxhYmVsXG4gIH0pLCBwcm9wcy5jaGlsZHJlbikpO1xufVxuZnVuY3Rpb24gUmVmZXJlbmNlTGluZVNldHRpbmdzRGlzcGF0Y2hlcihwcm9wcykge1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlcG9ydFJlZmVyZW5jZUxpbmUsIHtcbiAgICB5QXhpc0lkOiBwcm9wcy55QXhpc0lkLFxuICAgIHhBeGlzSWQ6IHByb3BzLnhBeGlzSWQsXG4gICAgaWZPdmVyZmxvdzogcHJvcHMuaWZPdmVyZmxvdyxcbiAgICB4OiBwcm9wcy54LFxuICAgIHk6IHByb3BzLnlcbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlZmVyZW5jZUxpbmVJbXBsLCBwcm9wcykpO1xufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QvcHJlZmVyLXN0YXRlbGVzcy1mdW5jdGlvblxuZXhwb3J0IGNsYXNzIFJlZmVyZW5jZUxpbmUgZXh0ZW5kcyBDb21wb25lbnQge1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlZmVyZW5jZUxpbmVTZXR0aW5nc0Rpc3BhdGNoZXIsIHRoaXMucHJvcHMpO1xuICB9XG59XG5fZGVmaW5lUHJvcGVydHkoUmVmZXJlbmNlTGluZSwgXCJkaXNwbGF5TmFtZVwiLCAnUmVmZXJlbmNlTGluZScpO1xuX2RlZmluZVByb3BlcnR5KFJlZmVyZW5jZUxpbmUsIFwiZGVmYXVsdFByb3BzXCIsIHtcbiAgaWZPdmVyZmxvdzogJ2Rpc2NhcmQnLFxuICB4QXhpc0lkOiAwLFxuICB5QXhpc0lkOiAwLFxuICBmaWxsOiAnbm9uZScsXG4gIHN0cm9rZTogJyNjY2MnLFxuICBmaWxsT3BhY2l0eTogMSxcbiAgc3Ryb2tlV2lkdGg6IDEsXG4gIHBvc2l0aW9uOiAnbWlkZGxlJ1xufSk7IiwidmFyIF9leGNsdWRlZCA9IFtcImRhbmdlcm91c2x5U2V0SW5uZXJIVE1MXCIsIFwidGlja3NcIl0sXG4gIF9leGNsdWRlZDIgPSBbXCJpZFwiXSxcbiAgX2V4Y2x1ZGVkMyA9IFtcImRvbWFpblwiXSxcbiAgX2V4Y2x1ZGVkNCA9IFtcImRvbWFpblwiXTtcbmZ1bmN0aW9uIF9leHRlbmRzKCkgeyByZXR1cm4gX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduID8gT2JqZWN0LmFzc2lnbi5iaW5kKCkgOiBmdW5jdGlvbiAobikgeyBmb3IgKHZhciBlID0gMTsgZSA8IGFyZ3VtZW50cy5sZW5ndGg7IGUrKykgeyB2YXIgdCA9IGFyZ3VtZW50c1tlXTsgZm9yICh2YXIgciBpbiB0KSAoe30pLmhhc093blByb3BlcnR5LmNhbGwodCwgcikgJiYgKG5bcl0gPSB0W3JdKTsgfSByZXR1cm4gbjsgfSwgX2V4dGVuZHMuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuZnVuY3Rpb24gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKGUsIHQpIHsgaWYgKG51bGwgPT0gZSkgcmV0dXJuIHt9OyB2YXIgbywgciwgaSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKGUsIHQpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IGZvciAociA9IDA7IHIgPCBuLmxlbmd0aDsgcisrKSBvID0gbltyXSwgLTEgPT09IHQuaW5kZXhPZihvKSAmJiB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKGUsIG8pICYmIChpW29dID0gZVtvXSk7IH0gcmV0dXJuIGk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHIsIGUpIHsgaWYgKG51bGwgPT0gcikgcmV0dXJuIHt9OyB2YXIgdCA9IHt9OyBmb3IgKHZhciBuIGluIHIpIGlmICh7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHIsIG4pKSB7IGlmICgtMSAhPT0gZS5pbmRleE9mKG4pKSBjb250aW51ZTsgdFtuXSA9IHJbbl07IH0gcmV0dXJuIHQ7IH1cbi8qKlxuICogQGZpbGVPdmVydmlldyBYIEF4aXNcbiAqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgdXNlTGF5b3V0RWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY2xzeCB9IGZyb20gJ2Nsc3gnO1xuaW1wb3J0IHsgQ2FydGVzaWFuQXhpcyB9IGZyb20gJy4vQ2FydGVzaWFuQXhpcyc7XG5pbXBvcnQgeyB1c2VBcHBEaXNwYXRjaCwgdXNlQXBwU2VsZWN0b3IgfSBmcm9tICcuLi9zdGF0ZS9ob29rcyc7XG5pbXBvcnQgeyBhZGRYQXhpcywgcmVtb3ZlWEF4aXMgfSBmcm9tICcuLi9zdGF0ZS9jYXJ0ZXNpYW5BeGlzU2xpY2UnO1xuaW1wb3J0IHsgaW1wbGljaXRYQXhpcywgc2VsZWN0QXhpc1NjYWxlLCBzZWxlY3RUaWNrc09mQXhpcywgc2VsZWN0WEF4aXNQb3NpdGlvbiwgc2VsZWN0WEF4aXNTZXR0aW5nc05vRGVmYXVsdHMsIHNlbGVjdFhBeGlzU2l6ZSB9IGZyb20gJy4uL3N0YXRlL3NlbGVjdG9ycy9heGlzU2VsZWN0b3JzJztcbmltcG9ydCB7IHNlbGVjdEF4aXNWaWV3Qm94IH0gZnJvbSAnLi4vc3RhdGUvc2VsZWN0b3JzL3NlbGVjdENoYXJ0T2Zmc2V0SW50ZXJuYWwnO1xuaW1wb3J0IHsgdXNlSXNQYW5vcmFtYSB9IGZyb20gJy4uL2NvbnRleHQvUGFub3JhbWFDb250ZXh0JztcbmltcG9ydCB7IHNoYWxsb3dFcXVhbCB9IGZyb20gJy4uL3V0aWwvU2hhbGxvd0VxdWFsJztcbmltcG9ydCB7IHJlc29sdmVEZWZhdWx0UHJvcHMgfSBmcm9tICcuLi91dGlsL3Jlc29sdmVEZWZhdWx0UHJvcHMnO1xuZnVuY3Rpb24gU2V0WEF4aXNTZXR0aW5ncyhzZXR0aW5ncykge1xuICB2YXIgZGlzcGF0Y2ggPSB1c2VBcHBEaXNwYXRjaCgpO1xuICB1c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGRpc3BhdGNoKGFkZFhBeGlzKHNldHRpbmdzKSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRpc3BhdGNoKHJlbW92ZVhBeGlzKHNldHRpbmdzKSk7XG4gICAgfTtcbiAgfSwgW3NldHRpbmdzLCBkaXNwYXRjaF0pO1xuICByZXR1cm4gbnVsbDtcbn1cbnZhciBYQXhpc0ltcGwgPSBwcm9wcyA9PiB7XG4gIHZhciB7XG4gICAgeEF4aXNJZCxcbiAgICBjbGFzc05hbWVcbiAgfSA9IHByb3BzO1xuICB2YXIgdmlld0JveCA9IHVzZUFwcFNlbGVjdG9yKHNlbGVjdEF4aXNWaWV3Qm94KTtcbiAgdmFyIGlzUGFub3JhbWEgPSB1c2VJc1Bhbm9yYW1hKCk7XG4gIHZhciBheGlzVHlwZSA9ICd4QXhpcyc7XG4gIHZhciBzY2FsZSA9IHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdEF4aXNTY2FsZShzdGF0ZSwgYXhpc1R5cGUsIHhBeGlzSWQsIGlzUGFub3JhbWEpKTtcbiAgdmFyIGNhcnRlc2lhblRpY2tJdGVtcyA9IHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdFRpY2tzT2ZBeGlzKHN0YXRlLCBheGlzVHlwZSwgeEF4aXNJZCwgaXNQYW5vcmFtYSkpO1xuICB2YXIgYXhpc1NpemUgPSB1c2VBcHBTZWxlY3RvcihzdGF0ZSA9PiBzZWxlY3RYQXhpc1NpemUoc3RhdGUsIHhBeGlzSWQpKTtcbiAgdmFyIHBvc2l0aW9uID0gdXNlQXBwU2VsZWN0b3Ioc3RhdGUgPT4gc2VsZWN0WEF4aXNQb3NpdGlvbihzdGF0ZSwgeEF4aXNJZCkpO1xuICAvKlxuICAgKiBIZXJlIHdlIHNlbGVjdCBzZXR0aW5ncyBmcm9tIHRoZSBzdG9yZSBhbmQgcHJlZmVyIHRvIHVzZSB0aGVtIGluc3RlYWQgb2YgdGhlIGFjdHVhbCBwcm9wc1xuICAgKiBzbyB0aGF0IHRoZSBjaGFydCBpcyBjb25zaXN0ZW50LiBJZiB3ZSB1c2VkIHRoZSBwcm9wcyBkaXJlY3RseSwgc29tZSBjb21wb25lbnRzIHdpbGwgdXNlIGF4aXMgc2V0dGluZ3NcbiAgICogZnJvbSBzdGF0ZSBhbmQgc29tZSBmcm9tIHByb3BzIGFuZCBiZWNhdXNlIHRoZXJlIGlzIGEgcmVuZGVyIHN0ZXAgYmV0d2VlbiB0aGVzZSB0d28sIHRoZXkgbWlnaHQgYmUgc2hvd2luZyBkaWZmZXJlbnQgdGhpbmdzLlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vcmVjaGFydHMvcmVjaGFydHMvaXNzdWVzLzYyNTdcbiAgICovXG4gIHZhciBzeW5jaHJvbml6ZWRTZXR0aW5ncyA9IHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdFhBeGlzU2V0dGluZ3NOb0RlZmF1bHRzKHN0YXRlLCB4QXhpc0lkKSk7XG4gIGlmIChheGlzU2l6ZSA9PSBudWxsIHx8IHBvc2l0aW9uID09IG51bGwgfHwgc3luY2hyb25pemVkU2V0dGluZ3MgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciB7XG4gICAgICBkYW5nZXJvdXNseVNldElubmVySFRNTCxcbiAgICAgIHRpY2tzXG4gICAgfSA9IHByb3BzLFxuICAgIGFsbE90aGVyUHJvcHMgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMocHJvcHMsIF9leGNsdWRlZCk7XG4gIHZhciB7XG4gICAgICBpZFxuICAgIH0gPSBzeW5jaHJvbml6ZWRTZXR0aW5ncyxcbiAgICByZXN0U3luY2hyb25pemVkU2V0dGluZ3MgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoc3luY2hyb25pemVkU2V0dGluZ3MsIF9leGNsdWRlZDIpO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ2FydGVzaWFuQXhpcywgX2V4dGVuZHMoe30sIGFsbE90aGVyUHJvcHMsIHJlc3RTeW5jaHJvbml6ZWRTZXR0aW5ncywge1xuICAgIHNjYWxlOiBzY2FsZSxcbiAgICB4OiBwb3NpdGlvbi54LFxuICAgIHk6IHBvc2l0aW9uLnksXG4gICAgd2lkdGg6IGF4aXNTaXplLndpZHRoLFxuICAgIGhlaWdodDogYXhpc1NpemUuaGVpZ2h0LFxuICAgIGNsYXNzTmFtZTogY2xzeChcInJlY2hhcnRzLVwiLmNvbmNhdChheGlzVHlwZSwgXCIgXCIpLmNvbmNhdChheGlzVHlwZSksIGNsYXNzTmFtZSksXG4gICAgdmlld0JveDogdmlld0JveCxcbiAgICB0aWNrczogY2FydGVzaWFuVGlja0l0ZW1zXG4gIH0pKTtcbn07XG52YXIgeEF4aXNEZWZhdWx0UHJvcHMgPSB7XG4gIGFsbG93RGF0YU92ZXJmbG93OiBpbXBsaWNpdFhBeGlzLmFsbG93RGF0YU92ZXJmbG93LFxuICBhbGxvd0RlY2ltYWxzOiBpbXBsaWNpdFhBeGlzLmFsbG93RGVjaW1hbHMsXG4gIGFsbG93RHVwbGljYXRlZENhdGVnb3J5OiBpbXBsaWNpdFhBeGlzLmFsbG93RHVwbGljYXRlZENhdGVnb3J5LFxuICBoZWlnaHQ6IGltcGxpY2l0WEF4aXMuaGVpZ2h0LFxuICBoaWRlOiBmYWxzZSxcbiAgbWlycm9yOiBpbXBsaWNpdFhBeGlzLm1pcnJvcixcbiAgb3JpZW50YXRpb246IGltcGxpY2l0WEF4aXMub3JpZW50YXRpb24sXG4gIHBhZGRpbmc6IGltcGxpY2l0WEF4aXMucGFkZGluZyxcbiAgcmV2ZXJzZWQ6IGltcGxpY2l0WEF4aXMucmV2ZXJzZWQsXG4gIHNjYWxlOiBpbXBsaWNpdFhBeGlzLnNjYWxlLFxuICB0aWNrQ291bnQ6IGltcGxpY2l0WEF4aXMudGlja0NvdW50LFxuICB0eXBlOiBpbXBsaWNpdFhBeGlzLnR5cGUsXG4gIHhBeGlzSWQ6IDBcbn07XG52YXIgWEF4aXNTZXR0aW5nc0Rpc3BhdGNoZXIgPSBvdXRzaWRlUHJvcHMgPT4ge1xuICB2YXIgX3Byb3BzJGludGVydmFsLCBfcHJvcHMkaW5jbHVkZUhpZGRlbiwgX3Byb3BzJGFuZ2xlLCBfcHJvcHMkbWluVGlja0dhcCwgX3Byb3BzJHRpY2s7XG4gIHZhciBwcm9wcyA9IHJlc29sdmVEZWZhdWx0UHJvcHMob3V0c2lkZVByb3BzLCB4QXhpc0RlZmF1bHRQcm9wcyk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0WEF4aXNTZXR0aW5ncywge1xuICAgIGludGVydmFsOiAoX3Byb3BzJGludGVydmFsID0gcHJvcHMuaW50ZXJ2YWwpICE9PSBudWxsICYmIF9wcm9wcyRpbnRlcnZhbCAhPT0gdm9pZCAwID8gX3Byb3BzJGludGVydmFsIDogJ3ByZXNlcnZlRW5kJyxcbiAgICBpZDogcHJvcHMueEF4aXNJZCxcbiAgICBzY2FsZTogcHJvcHMuc2NhbGUsXG4gICAgdHlwZTogcHJvcHMudHlwZSxcbiAgICBwYWRkaW5nOiBwcm9wcy5wYWRkaW5nLFxuICAgIGFsbG93RGF0YU92ZXJmbG93OiBwcm9wcy5hbGxvd0RhdGFPdmVyZmxvdyxcbiAgICBkb21haW46IHByb3BzLmRvbWFpbixcbiAgICBkYXRhS2V5OiBwcm9wcy5kYXRhS2V5LFxuICAgIGFsbG93RHVwbGljYXRlZENhdGVnb3J5OiBwcm9wcy5hbGxvd0R1cGxpY2F0ZWRDYXRlZ29yeSxcbiAgICBhbGxvd0RlY2ltYWxzOiBwcm9wcy5hbGxvd0RlY2ltYWxzLFxuICAgIHRpY2tDb3VudDogcHJvcHMudGlja0NvdW50LFxuICAgIGluY2x1ZGVIaWRkZW46IChfcHJvcHMkaW5jbHVkZUhpZGRlbiA9IHByb3BzLmluY2x1ZGVIaWRkZW4pICE9PSBudWxsICYmIF9wcm9wcyRpbmNsdWRlSGlkZGVuICE9PSB2b2lkIDAgPyBfcHJvcHMkaW5jbHVkZUhpZGRlbiA6IGZhbHNlLFxuICAgIHJldmVyc2VkOiBwcm9wcy5yZXZlcnNlZCxcbiAgICB0aWNrczogcHJvcHMudGlja3MsXG4gICAgaGVpZ2h0OiBwcm9wcy5oZWlnaHQsXG4gICAgb3JpZW50YXRpb246IHByb3BzLm9yaWVudGF0aW9uLFxuICAgIG1pcnJvcjogcHJvcHMubWlycm9yLFxuICAgIGhpZGU6IHByb3BzLmhpZGUsXG4gICAgdW5pdDogcHJvcHMudW5pdCxcbiAgICBuYW1lOiBwcm9wcy5uYW1lLFxuICAgIGFuZ2xlOiAoX3Byb3BzJGFuZ2xlID0gcHJvcHMuYW5nbGUpICE9PSBudWxsICYmIF9wcm9wcyRhbmdsZSAhPT0gdm9pZCAwID8gX3Byb3BzJGFuZ2xlIDogMCxcbiAgICBtaW5UaWNrR2FwOiAoX3Byb3BzJG1pblRpY2tHYXAgPSBwcm9wcy5taW5UaWNrR2FwKSAhPT0gbnVsbCAmJiBfcHJvcHMkbWluVGlja0dhcCAhPT0gdm9pZCAwID8gX3Byb3BzJG1pblRpY2tHYXAgOiA1LFxuICAgIHRpY2s6IChfcHJvcHMkdGljayA9IHByb3BzLnRpY2spICE9PSBudWxsICYmIF9wcm9wcyR0aWNrICE9PSB2b2lkIDAgPyBfcHJvcHMkdGljayA6IHRydWUsXG4gICAgdGlja0Zvcm1hdHRlcjogcHJvcHMudGlja0Zvcm1hdHRlclxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoWEF4aXNJbXBsLCBwcm9wcykpO1xufTtcbnZhciBYQXhpc01lbW9Db21wYXJhdG9yID0gKHByZXZQcm9wcywgbmV4dFByb3BzKSA9PiB7XG4gIHZhciB7XG4gICAgICBkb21haW46IHByZXZEb21haW5cbiAgICB9ID0gcHJldlByb3BzLFxuICAgIHByZXZSZXN0ID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKHByZXZQcm9wcywgX2V4Y2x1ZGVkMyk7XG4gIHZhciB7XG4gICAgICBkb21haW46IG5leHREb21haW5cbiAgICB9ID0gbmV4dFByb3BzLFxuICAgIG5leHRSZXN0ID0gX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzKG5leHRQcm9wcywgX2V4Y2x1ZGVkNCk7XG4gIGlmICghc2hhbGxvd0VxdWFsKHByZXZSZXN0LCBuZXh0UmVzdCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkocHJldkRvbWFpbikgJiYgcHJldkRvbWFpbi5sZW5ndGggPT09IDIgJiYgQXJyYXkuaXNBcnJheShuZXh0RG9tYWluKSAmJiBuZXh0RG9tYWluLmxlbmd0aCA9PT0gMikge1xuICAgIHJldHVybiBwcmV2RG9tYWluWzBdID09PSBuZXh0RG9tYWluWzBdICYmIHByZXZEb21haW5bMV0gPT09IG5leHREb21haW5bMV07XG4gIH1cbiAgcmV0dXJuIHNoYWxsb3dFcXVhbCh7XG4gICAgZG9tYWluOiBwcmV2RG9tYWluXG4gIH0sIHtcbiAgICBkb21haW46IG5leHREb21haW5cbiAgfSk7XG59O1xuZXhwb3J0IHZhciBYQXhpcyA9IC8qI19fUFVSRV9fKi9SZWFjdC5tZW1vKFhBeGlzU2V0dGluZ3NEaXNwYXRjaGVyLCBYQXhpc01lbW9Db21wYXJhdG9yKTtcblhBeGlzLmRpc3BsYXlOYW1lID0gJ1hBeGlzJzsiLCJ2YXIgX2V4Y2x1ZGVkID0gW1wiaWRcIl0sXG4gIF9leGNsdWRlZDIgPSBbXCJ0eXBlXCIsIFwibGF5b3V0XCIsIFwiY29ubmVjdE51bGxzXCIsIFwibmVlZENsaXBcIl0sXG4gIF9leGNsdWRlZDMgPSBbXCJhY3RpdmVEb3RcIiwgXCJhbmltYXRlTmV3VmFsdWVzXCIsIFwiYW5pbWF0aW9uQmVnaW5cIiwgXCJhbmltYXRpb25EdXJhdGlvblwiLCBcImFuaW1hdGlvbkVhc2luZ1wiLCBcImNvbm5lY3ROdWxsc1wiLCBcImRvdFwiLCBcImhpZGVcIiwgXCJpc0FuaW1hdGlvbkFjdGl2ZVwiLCBcImxhYmVsXCIsIFwibGVnZW5kVHlwZVwiLCBcInhBeGlzSWRcIiwgXCJ5QXhpc0lkXCIsIFwiaWRcIl07XG5mdW5jdGlvbiBvd25LZXlzKGUsIHIpIHsgdmFyIHQgPSBPYmplY3Qua2V5cyhlKTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyByICYmIChvID0gby5maWx0ZXIoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgcikuZW51bWVyYWJsZTsgfSkpLCB0LnB1c2guYXBwbHkodCwgbyk7IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQoZSkgeyBmb3IgKHZhciByID0gMTsgciA8IGFyZ3VtZW50cy5sZW5ndGg7IHIrKykgeyB2YXIgdCA9IG51bGwgIT0gYXJndW1lbnRzW3JdID8gYXJndW1lbnRzW3JdIDoge307IHIgJSAyID8gb3duS2V5cyhPYmplY3QodCksICEwKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0W3JdKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHQpKSA6IG93bktleXMoT2JqZWN0KHQpKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsIHIpKTsgfSk7IH0gcmV0dXJuIGU7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0KSB7IHJldHVybiAociA9IF90b1Byb3BlcnR5S2V5KHIpKSBpbiBlID8gT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIHsgdmFsdWU6IHQsIGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAgfSkgOiBlW3JdID0gdCwgZTsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkodCkgeyB2YXIgaSA9IF90b1ByaW1pdGl2ZSh0LCBcInN0cmluZ1wiKTsgcmV0dXJuIFwic3ltYm9sXCIgPT0gdHlwZW9mIGkgPyBpIDogaSArIFwiXCI7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZSh0LCByKSB7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiB0IHx8ICF0KSByZXR1cm4gdDsgdmFyIGUgPSB0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmICh2b2lkIDAgIT09IGUpIHsgdmFyIGkgPSBlLmNhbGwodCwgciB8fCBcImRlZmF1bHRcIik7IGlmIChcIm9iamVjdFwiICE9IHR5cGVvZiBpKSByZXR1cm4gaTsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoXCJzdHJpbmdcIiA9PT0gciA/IFN0cmluZyA6IE51bWJlcikodCk7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhlLCB0KSB7IGlmIChudWxsID09IGUpIHJldHVybiB7fTsgdmFyIG8sIHIsIGkgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShlLCB0KTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG4gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyBmb3IgKHIgPSAwOyByIDwgbi5sZW5ndGg7IHIrKykgbyA9IG5bcl0sIC0xID09PSB0LmluZGV4T2YobykgJiYge30ucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChlLCBvKSAmJiAoaVtvXSA9IGVbb10pOyB9IHJldHVybiBpOyB9XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXNMb29zZShyLCBlKSB7IGlmIChudWxsID09IHIpIHJldHVybiB7fTsgdmFyIHQgPSB7fTsgZm9yICh2YXIgbiBpbiByKSBpZiAoe30uaGFzT3duUHJvcGVydHkuY2FsbChyLCBuKSkgeyBpZiAoLTEgIT09IGUuaW5kZXhPZihuKSkgY29udGludWU7IHRbbl0gPSByW25dOyB9IHJldHVybiB0OyB9XG5mdW5jdGlvbiBfZXh0ZW5kcygpIHsgcmV0dXJuIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiA/IE9iamVjdC5hc3NpZ24uYmluZCgpIDogZnVuY3Rpb24gKG4pIHsgZm9yICh2YXIgZSA9IDE7IGUgPCBhcmd1bWVudHMubGVuZ3RoOyBlKyspIHsgdmFyIHQgPSBhcmd1bWVudHNbZV07IGZvciAodmFyIHIgaW4gdCkgKHt9KS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHQsIHIpICYmIChuW3JdID0gdFtyXSk7IH0gcmV0dXJuIG47IH0sIF9leHRlbmRzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7IH1cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IENvbXBvbmVudCwgdXNlQ2FsbGJhY2ssIHVzZU1lbW8sIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjbHN4IH0gZnJvbSAnY2xzeCc7XG5pbXBvcnQgeyBDdXJ2ZSB9IGZyb20gJy4uL3NoYXBlL0N1cnZlJztcbmltcG9ydCB7IERvdCB9IGZyb20gJy4uL3NoYXBlL0RvdCc7XG5pbXBvcnQgeyBMYXllciB9IGZyb20gJy4uL2NvbnRhaW5lci9MYXllcic7XG5pbXBvcnQgeyBDYXJ0ZXNpYW5MYWJlbExpc3RDb250ZXh0UHJvdmlkZXIsIExhYmVsTGlzdEZyb21MYWJlbFByb3AgfSBmcm9tICcuLi9jb21wb25lbnQvTGFiZWxMaXN0JztcbmltcG9ydCB7IGludGVycG9sYXRlLCBpc051bGxpc2ggfSBmcm9tICcuLi91dGlsL0RhdGFVdGlscyc7XG5pbXBvcnQgeyBpc0NsaXBEb3QgfSBmcm9tICcuLi91dGlsL1JlYWN0VXRpbHMnO1xuaW1wb3J0IHsgR2xvYmFsIH0gZnJvbSAnLi4vdXRpbC9HbG9iYWwnO1xuaW1wb3J0IHsgZ2V0Q2F0ZUNvb3JkaW5hdGVPZkxpbmUsIGdldFRvb2x0aXBOYW1lUHJvcCwgZ2V0VmFsdWVCeURhdGFLZXkgfSBmcm9tICcuLi91dGlsL0NoYXJ0VXRpbHMnO1xuaW1wb3J0IHsgQWN0aXZlUG9pbnRzIH0gZnJvbSAnLi4vY29tcG9uZW50L0FjdGl2ZVBvaW50cyc7XG5pbXBvcnQgeyBTZXRUb29sdGlwRW50cnlTZXR0aW5ncyB9IGZyb20gJy4uL3N0YXRlL1NldFRvb2x0aXBFbnRyeVNldHRpbmdzJztcbmltcG9ydCB7IFNldEVycm9yQmFyQ29udGV4dCB9IGZyb20gJy4uL2NvbnRleHQvRXJyb3JCYXJDb250ZXh0JztcbmltcG9ydCB7IEdyYXBoaWNhbEl0ZW1DbGlwUGF0aCwgdXNlTmVlZHNDbGlwIH0gZnJvbSAnLi9HcmFwaGljYWxJdGVtQ2xpcFBhdGgnO1xuaW1wb3J0IHsgdXNlQ2hhcnRMYXlvdXQgfSBmcm9tICcuLi9jb250ZXh0L2NoYXJ0TGF5b3V0Q29udGV4dCc7XG5pbXBvcnQgeyB1c2VJc1Bhbm9yYW1hIH0gZnJvbSAnLi4vY29udGV4dC9QYW5vcmFtYUNvbnRleHQnO1xuaW1wb3J0IHsgc2VsZWN0TGluZVBvaW50cyB9IGZyb20gJy4uL3N0YXRlL3NlbGVjdG9ycy9saW5lU2VsZWN0b3JzJztcbmltcG9ydCB7IHVzZUFwcFNlbGVjdG9yIH0gZnJvbSAnLi4vc3RhdGUvaG9va3MnO1xuaW1wb3J0IHsgU2V0TGVnZW5kUGF5bG9hZCB9IGZyb20gJy4uL3N0YXRlL1NldExlZ2VuZFBheWxvYWQnO1xuaW1wb3J0IHsgdXNlQW5pbWF0aW9uSWQgfSBmcm9tICcuLi91dGlsL3VzZUFuaW1hdGlvbklkJztcbmltcG9ydCB7IHJlc29sdmVEZWZhdWx0UHJvcHMgfSBmcm9tICcuLi91dGlsL3Jlc29sdmVEZWZhdWx0UHJvcHMnO1xuaW1wb3J0IHsgdXNlUGxvdEFyZWEgfSBmcm9tICcuLi9ob29rcyc7XG5pbXBvcnQgeyBSZWdpc3RlckdyYXBoaWNhbEl0ZW1JZCB9IGZyb20gJy4uL2NvbnRleHQvUmVnaXN0ZXJHcmFwaGljYWxJdGVtSWQnO1xuaW1wb3J0IHsgU2V0Q2FydGVzaWFuR3JhcGhpY2FsSXRlbSB9IGZyb20gJy4uL3N0YXRlL1NldEdyYXBoaWNhbEl0ZW0nO1xuaW1wb3J0IHsgc3ZnUHJvcGVydGllc05vRXZlbnRzIH0gZnJvbSAnLi4vdXRpbC9zdmdQcm9wZXJ0aWVzTm9FdmVudHMnO1xuaW1wb3J0IHsgSmF2YXNjcmlwdEFuaW1hdGUgfSBmcm9tICcuLi9hbmltYXRpb24vSmF2YXNjcmlwdEFuaW1hdGUnO1xuaW1wb3J0IHsgc3ZnUHJvcGVydGllc0FuZEV2ZW50cywgc3ZnUHJvcGVydGllc0FuZEV2ZW50c0Zyb21Vbmtub3duIH0gZnJvbSAnLi4vdXRpbC9zdmdQcm9wZXJ0aWVzQW5kRXZlbnRzJztcbmltcG9ydCB7IGdldFJhZGl1c0FuZFN0cm9rZVdpZHRoRnJvbURvdCB9IGZyb20gJy4uL3V0aWwvZ2V0UmFkaXVzQW5kU3Ryb2tlV2lkdGhGcm9tRG90JztcblxuLyoqXG4gKiBJbnRlcm5hbCBwcm9wcywgY29tYmluYXRpb24gb2YgZXh0ZXJuYWwgcHJvcHMgKyBkZWZhdWx0UHJvcHMgKyBwcml2YXRlIFJlY2hhcnRzIHN0YXRlXG4gKi9cblxuLyoqXG4gKiBFeHRlcm5hbCBwcm9wcywgaW50ZW5kZWQgZm9yIGVuZCB1c2VycyB0byBmaWxsIGluXG4gKi9cblxuLyoqXG4gKiBCZWNhdXNlIG9mIG5hbWluZyBjb25mbGljdCwgd2UgYXJlIGZvcmNlZCB0byBpZ25vcmUgY2VydGFpbiAodmFsaWQpIFNWRyBhdHRyaWJ1dGVzLlxuICovXG5cbnZhciBjb21wdXRlTGVnZW5kUGF5bG9hZEZyb21BcmVhRGF0YSA9IHByb3BzID0+IHtcbiAgdmFyIHtcbiAgICBkYXRhS2V5LFxuICAgIG5hbWUsXG4gICAgc3Ryb2tlLFxuICAgIGxlZ2VuZFR5cGUsXG4gICAgaGlkZVxuICB9ID0gcHJvcHM7XG4gIHJldHVybiBbe1xuICAgIGluYWN0aXZlOiBoaWRlLFxuICAgIGRhdGFLZXksXG4gICAgdHlwZTogbGVnZW5kVHlwZSxcbiAgICBjb2xvcjogc3Ryb2tlLFxuICAgIHZhbHVlOiBnZXRUb29sdGlwTmFtZVByb3AobmFtZSwgZGF0YUtleSksXG4gICAgcGF5bG9hZDogcHJvcHNcbiAgfV07XG59O1xuZnVuY3Rpb24gZ2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MocHJvcHMpIHtcbiAgdmFyIHtcbiAgICBkYXRhS2V5LFxuICAgIGRhdGEsXG4gICAgc3Ryb2tlLFxuICAgIHN0cm9rZVdpZHRoLFxuICAgIGZpbGwsXG4gICAgbmFtZSxcbiAgICBoaWRlLFxuICAgIHVuaXRcbiAgfSA9IHByb3BzO1xuICByZXR1cm4ge1xuICAgIGRhdGFEZWZpbmVkT25JdGVtOiBkYXRhLFxuICAgIHBvc2l0aW9uczogdW5kZWZpbmVkLFxuICAgIHNldHRpbmdzOiB7XG4gICAgICBzdHJva2UsXG4gICAgICBzdHJva2VXaWR0aCxcbiAgICAgIGZpbGwsXG4gICAgICBkYXRhS2V5LFxuICAgICAgbmFtZUtleTogdW5kZWZpbmVkLFxuICAgICAgbmFtZTogZ2V0VG9vbHRpcE5hbWVQcm9wKG5hbWUsIGRhdGFLZXkpLFxuICAgICAgaGlkZSxcbiAgICAgIHR5cGU6IHByb3BzLnRvb2x0aXBUeXBlLFxuICAgICAgY29sb3I6IHByb3BzLnN0cm9rZSxcbiAgICAgIHVuaXRcbiAgICB9XG4gIH07XG59XG52YXIgZ2VuZXJhdGVTaW1wbGVTdHJva2VEYXNoYXJyYXkgPSAodG90YWxMZW5ndGgsIGxlbmd0aCkgPT4ge1xuICByZXR1cm4gXCJcIi5jb25jYXQobGVuZ3RoLCBcInB4IFwiKS5jb25jYXQodG90YWxMZW5ndGggLSBsZW5ndGgsIFwicHhcIik7XG59O1xuZnVuY3Rpb24gcmVwZWF0KGxpbmVzLCBjb3VudCkge1xuICB2YXIgbGluZXNVbml0ID0gbGluZXMubGVuZ3RoICUgMiAhPT0gMCA/IFsuLi5saW5lcywgMF0gOiBsaW5lcztcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyArK2kpIHtcbiAgICByZXN1bHQgPSBbLi4ucmVzdWx0LCAuLi5saW5lc1VuaXRdO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG52YXIgZ2V0U3Ryb2tlRGFzaGFycmF5ID0gKGxlbmd0aCwgdG90YWxMZW5ndGgsIGxpbmVzKSA9PiB7XG4gIHZhciBsaW5lTGVuZ3RoID0gbGluZXMucmVkdWNlKChwcmUsIG5leHQpID0+IHByZSArIG5leHQpO1xuXG4gIC8vIGlmIGxpbmVMZW5ndGggaXMgMCByZXR1cm4gdGhlIGRlZmF1bHQgd2hlbiBubyBzdHJva2VEYXNoYXJyYXkgaXMgcHJvdmlkZWRcbiAgaWYgKCFsaW5lTGVuZ3RoKSB7XG4gICAgcmV0dXJuIGdlbmVyYXRlU2ltcGxlU3Ryb2tlRGFzaGFycmF5KHRvdGFsTGVuZ3RoLCBsZW5ndGgpO1xuICB9XG4gIHZhciBjb3VudCA9IE1hdGguZmxvb3IobGVuZ3RoIC8gbGluZUxlbmd0aCk7XG4gIHZhciByZW1haW5MZW5ndGggPSBsZW5ndGggJSBsaW5lTGVuZ3RoO1xuICB2YXIgcmVzdExlbmd0aCA9IHRvdGFsTGVuZ3RoIC0gbGVuZ3RoO1xuICB2YXIgcmVtYWluTGluZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIHN1bSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IHN1bSArPSBsaW5lc1tpXSwgKytpKSB7XG4gICAgaWYgKHN1bSArIGxpbmVzW2ldID4gcmVtYWluTGVuZ3RoKSB7XG4gICAgICByZW1haW5MaW5lcyA9IFsuLi5saW5lcy5zbGljZSgwLCBpKSwgcmVtYWluTGVuZ3RoIC0gc3VtXTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICB2YXIgZW1wdHlMaW5lcyA9IHJlbWFpbkxpbmVzLmxlbmd0aCAlIDIgPT09IDAgPyBbMCwgcmVzdExlbmd0aF0gOiBbcmVzdExlbmd0aF07XG4gIHJldHVybiBbLi4ucmVwZWF0KGxpbmVzLCBjb3VudCksIC4uLnJlbWFpbkxpbmVzLCAuLi5lbXB0eUxpbmVzXS5tYXAobGluZSA9PiBcIlwiLmNvbmNhdChsaW5lLCBcInB4XCIpKS5qb2luKCcsICcpO1xufTtcbmZ1bmN0aW9uIHJlbmRlckRvdEl0ZW0ob3B0aW9uLCBwcm9wcykge1xuICB2YXIgZG90SXRlbTtcbiAgaWYgKC8qI19fUFVSRV9fKi9SZWFjdC5pc1ZhbGlkRWxlbWVudChvcHRpb24pKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB3aGVuIGNsb25pbmcsIHRoZSBldmVudCBoYW5kbGVyIHR5cGVzIGRvIG5vdCBtYXRjaFxuICAgIGRvdEl0ZW0gPSAvKiNfX1BVUkVfXyovUmVhY3QuY2xvbmVFbGVtZW50KG9wdGlvbiwgcHJvcHMpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICBkb3RJdGVtID0gb3B0aW9uKHByb3BzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgY2xhc3NOYW1lID0gY2xzeCgncmVjaGFydHMtbGluZS1kb3QnLCB0eXBlb2Ygb3B0aW9uICE9PSAnYm9vbGVhbicgPyBvcHRpb24uY2xhc3NOYW1lIDogJycpO1xuICAgIGRvdEl0ZW0gPSAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChEb3QsIF9leHRlbmRzKHt9LCBwcm9wcywge1xuICAgICAgY2xhc3NOYW1lOiBjbGFzc05hbWVcbiAgICB9KSk7XG4gIH1cbiAgcmV0dXJuIGRvdEl0ZW07XG59XG5mdW5jdGlvbiBzaG91bGRSZW5kZXJEb3RzKHBvaW50cywgZG90KSB7XG4gIGlmIChwb2ludHMgPT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoZG90KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIHBvaW50cy5sZW5ndGggPT09IDE7XG59XG5mdW5jdGlvbiBEb3RzKF9yZWYpIHtcbiAgdmFyIHtcbiAgICBjbGlwUGF0aElkLFxuICAgIHBvaW50cyxcbiAgICBwcm9wc1xuICB9ID0gX3JlZjtcbiAgdmFyIHtcbiAgICBkb3QsXG4gICAgZGF0YUtleSxcbiAgICBuZWVkQ2xpcFxuICB9ID0gcHJvcHM7XG4gIGlmICghc2hvdWxkUmVuZGVyRG90cyhwb2ludHMsIGRvdCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qXG4gICAqIEV4Y2x1ZGUgSUQgZnJvbSB0aGUgcHJvcHMgcGFzc2VkIHRvIHRoZSBEb3RzIGNvbXBvbmVudFxuICAgKiBiZWNhdXNlIHRoZW4gdGhlIElEIHdvdWxkIGJlIGFwcGxpZWQgdG8gbXVsdGlwbGUgZG90cywgYW5kIGl0IHdvdWxkIG5vIGxvbmdlciBiZSB1bmlxdWUuXG4gICAqL1xuICB2YXIge1xuICAgICAgaWRcbiAgICB9ID0gcHJvcHMsXG4gICAgcHJvcHNXaXRob3V0SWQgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMocHJvcHMsIF9leGNsdWRlZCk7XG4gIHZhciBjbGlwRG90ID0gaXNDbGlwRG90KGRvdCk7XG4gIHZhciBsaW5lUHJvcHMgPSBzdmdQcm9wZXJ0aWVzTm9FdmVudHMocHJvcHNXaXRob3V0SWQpO1xuICB2YXIgY3VzdG9tRG90UHJvcHMgPSBzdmdQcm9wZXJ0aWVzQW5kRXZlbnRzRnJvbVVua25vd24oZG90KTtcbiAgdmFyIGRvdHMgPSBwb2ludHMubWFwKChlbnRyeSwgaSkgPT4ge1xuICAgIHZhciBkb3RQcm9wcyA9IF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHtcbiAgICAgIGtleTogXCJkb3QtXCIuY29uY2F0KGkpLFxuICAgICAgcjogM1xuICAgIH0sIGxpbmVQcm9wcyksIGN1c3RvbURvdFByb3BzKSwge30sIHtcbiAgICAgIGluZGV4OiBpLFxuICAgICAgY3g6IGVudHJ5LngsXG4gICAgICBjeTogZW50cnkueSxcbiAgICAgIGRhdGFLZXksXG4gICAgICB2YWx1ZTogZW50cnkudmFsdWUsXG4gICAgICBwYXlsb2FkOiBlbnRyeS5wYXlsb2FkLFxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB3ZSdyZSBwYXNzaW5nIGV4dHJhIHByb3BlcnR5ICdwb2ludHMnIHRoYXQgdGhlIHByb3BzIGFyZSBub3QgZXhwZWN0aW5nXG4gICAgICBwb2ludHNcbiAgICB9KTtcbiAgICByZXR1cm4gcmVuZGVyRG90SXRlbShkb3QsIGRvdFByb3BzKTtcbiAgfSk7XG4gIHZhciBkb3RzUHJvcHMgPSB7XG4gICAgY2xpcFBhdGg6IG5lZWRDbGlwID8gXCJ1cmwoI2NsaXBQYXRoLVwiLmNvbmNhdChjbGlwRG90ID8gJycgOiAnZG90cy0nKS5jb25jYXQoY2xpcFBhdGhJZCwgXCIpXCIpIDogdW5kZWZpbmVkXG4gIH07XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMYXllciwgX2V4dGVuZHMoe1xuICAgIGNsYXNzTmFtZTogXCJyZWNoYXJ0cy1saW5lLWRvdHNcIixcbiAgICBrZXk6IFwiZG90c1wiXG4gIH0sIGRvdHNQcm9wcyksIGRvdHMpO1xufVxuZnVuY3Rpb24gTGluZUxhYmVsTGlzdFByb3ZpZGVyKF9yZWYyKSB7XG4gIHZhciB7XG4gICAgc2hvd0xhYmVscyxcbiAgICBjaGlsZHJlbixcbiAgICBwb2ludHNcbiAgfSA9IF9yZWYyO1xuICB2YXIgbGFiZWxMaXN0RW50cmllcyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiBwb2ludHMgPT09IG51bGwgfHwgcG9pbnRzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwb2ludHMubWFwKHBvaW50ID0+IHtcbiAgICAgIHZhciB2aWV3Qm94ID0ge1xuICAgICAgICB4OiBwb2ludC54LFxuICAgICAgICB5OiBwb2ludC55LFxuICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgaGVpZ2h0OiAwXG4gICAgICB9O1xuICAgICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgdmlld0JveCksIHt9LCB7XG4gICAgICAgIHZhbHVlOiBwb2ludC52YWx1ZSxcbiAgICAgICAgcGF5bG9hZDogcG9pbnQucGF5bG9hZCxcbiAgICAgICAgdmlld0JveCxcbiAgICAgICAgLypcbiAgICAgICAgICogTGluZSBpcyBub3QgcGFzc2luZyBwYXJlbnRWaWV3Qm94IHRvIHRoZSBMYWJlbExpc3Qgc28gdGhlIGxhYmVscyBjYW4gZXNjYXBlIC0gbG9va3MgbGlrZSBhIGJ1Zywgc2hvdWxkIHdlIHBhc3MgcGFyZW50Vmlld0JveD9cbiAgICAgICAgICogT3Igc2hvdWxkIHRoaXMganVzdCBiZSB0aGUgcm9vdCBjaGFydCB2aWV3Qm94P1xuICAgICAgICAgKi9cbiAgICAgICAgcGFyZW50Vmlld0JveDogdW5kZWZpbmVkLFxuICAgICAgICBmaWxsOiB1bmRlZmluZWRcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LCBbcG9pbnRzXSk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChDYXJ0ZXNpYW5MYWJlbExpc3RDb250ZXh0UHJvdmlkZXIsIHtcbiAgICB2YWx1ZTogc2hvd0xhYmVscyA/IGxhYmVsTGlzdEVudHJpZXMgOiBudWxsXG4gIH0sIGNoaWxkcmVuKTtcbn1cbmZ1bmN0aW9uIFN0YXRpY0N1cnZlKF9yZWYzKSB7XG4gIHZhciB7XG4gICAgY2xpcFBhdGhJZCxcbiAgICBwYXRoUmVmLFxuICAgIHBvaW50cyxcbiAgICBzdHJva2VEYXNoYXJyYXksXG4gICAgcHJvcHNcbiAgfSA9IF9yZWYzO1xuICB2YXIge1xuICAgICAgdHlwZSxcbiAgICAgIGxheW91dCxcbiAgICAgIGNvbm5lY3ROdWxscyxcbiAgICAgIG5lZWRDbGlwXG4gICAgfSA9IHByb3BzLFxuICAgIG90aGVycyA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhwcm9wcywgX2V4Y2x1ZGVkMik7XG4gIHZhciBjdXJ2ZVByb3BzID0gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBzdmdQcm9wZXJ0aWVzQW5kRXZlbnRzKG90aGVycykpLCB7fSwge1xuICAgIGZpbGw6ICdub25lJyxcbiAgICBjbGFzc05hbWU6ICdyZWNoYXJ0cy1saW5lLWN1cnZlJyxcbiAgICBjbGlwUGF0aDogbmVlZENsaXAgPyBcInVybCgjY2xpcFBhdGgtXCIuY29uY2F0KGNsaXBQYXRoSWQsIFwiKVwiKSA6IHVuZGVmaW5lZCxcbiAgICBwb2ludHMsXG4gICAgdHlwZSxcbiAgICBsYXlvdXQsXG4gICAgY29ubmVjdE51bGxzLFxuICAgIHN0cm9rZURhc2hhcnJheTogc3Ryb2tlRGFzaGFycmF5ICE9PSBudWxsICYmIHN0cm9rZURhc2hhcnJheSAhPT0gdm9pZCAwID8gc3Ryb2tlRGFzaGFycmF5IDogcHJvcHMuc3Ryb2tlRGFzaGFycmF5XG4gIH0pO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIChwb2ludHMgPT09IG51bGwgfHwgcG9pbnRzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBwb2ludHMubGVuZ3RoKSA+IDEgJiYgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ3VydmUsIF9leHRlbmRzKHt9LCBjdXJ2ZVByb3BzLCB7XG4gICAgcGF0aFJlZjogcGF0aFJlZlxuICB9KSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KERvdHMsIHtcbiAgICBwb2ludHM6IHBvaW50cyxcbiAgICBjbGlwUGF0aElkOiBjbGlwUGF0aElkLFxuICAgIHByb3BzOiBwcm9wc1xuICB9KSk7XG59XG5mdW5jdGlvbiBnZXRUb3RhbExlbmd0aChtYWluQ3VydmUpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gbWFpbkN1cnZlICYmIG1haW5DdXJ2ZS5nZXRUb3RhbExlbmd0aCAmJiBtYWluQ3VydmUuZ2V0VG90YWxMZW5ndGgoKSB8fCAwO1xuICB9IGNhdGNoIChfdW51c2VkKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cbmZ1bmN0aW9uIEN1cnZlV2l0aEFuaW1hdGlvbihfcmVmNCkge1xuICB2YXIge1xuICAgIGNsaXBQYXRoSWQsXG4gICAgcHJvcHMsXG4gICAgcGF0aFJlZixcbiAgICBwcmV2aW91c1BvaW50c1JlZixcbiAgICBsb25nZXN0QW5pbWF0ZWRMZW5ndGhSZWZcbiAgfSA9IF9yZWY0O1xuICB2YXIge1xuICAgIHBvaW50cyxcbiAgICBzdHJva2VEYXNoYXJyYXksXG4gICAgaXNBbmltYXRpb25BY3RpdmUsXG4gICAgYW5pbWF0aW9uQmVnaW4sXG4gICAgYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgYW5pbWF0aW9uRWFzaW5nLFxuICAgIGFuaW1hdGVOZXdWYWx1ZXMsXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIG9uQW5pbWF0aW9uRW5kLFxuICAgIG9uQW5pbWF0aW9uU3RhcnRcbiAgfSA9IHByb3BzO1xuICB2YXIgcHJldlBvaW50cyA9IHByZXZpb3VzUG9pbnRzUmVmLmN1cnJlbnQ7XG4gIHZhciBhbmltYXRpb25JZCA9IHVzZUFuaW1hdGlvbklkKHByb3BzLCAncmVjaGFydHMtbGluZS0nKTtcbiAgdmFyIFtpc0FuaW1hdGluZywgc2V0SXNBbmltYXRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICB2YXIgc2hvd0xhYmVscyA9ICFpc0FuaW1hdGluZztcbiAgdmFyIGhhbmRsZUFuaW1hdGlvbkVuZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAodHlwZW9mIG9uQW5pbWF0aW9uRW5kID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvbkFuaW1hdGlvbkVuZCgpO1xuICAgIH1cbiAgICBzZXRJc0FuaW1hdGluZyhmYWxzZSk7XG4gIH0sIFtvbkFuaW1hdGlvbkVuZF0pO1xuICB2YXIgaGFuZGxlQW5pbWF0aW9uU3RhcnQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBvbkFuaW1hdGlvblN0YXJ0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvbkFuaW1hdGlvblN0YXJ0KCk7XG4gICAgfVxuICAgIHNldElzQW5pbWF0aW5nKHRydWUpO1xuICB9LCBbb25BbmltYXRpb25TdGFydF0pO1xuICB2YXIgdG90YWxMZW5ndGggPSBnZXRUb3RhbExlbmd0aChwYXRoUmVmLmN1cnJlbnQpO1xuICAvKlxuICAgKiBIZXJlIHdlIHdhbnQgdG8gZGV0ZWN0IGlmIHRoZSBsZW5ndGggYW5pbWF0aW9uIGhhcyBiZWVuIGludGVycnVwdGVkLlxuICAgKiBGb3IgdGhhdCB3ZSBrZWVwIGEgcmVmZXJlbmNlIHRvIHRoZSBmdXJ0aGVzdCBsZW5ndGggdGhhdCBoYXMgYmVlbiBhbmltYXRlZC5cbiAgICpcbiAgICogQW5kIHRoZW4sIHRvIGtlZXAgdGhpbmdzIHNtb290aCwgd2UgYWRkIHRvIGl0IHRoZSBjdXJyZW50IGxlbmd0aCB0aGF0IGlzIGJlaW5nIGFuaW1hdGVkIHJpZ2h0IG5vdy5cbiAgICpcbiAgICogSWYgd2UgZGlkIE1hdGgubWF4IHRoZW4gaXQgbWFrZXMgdGhlIGxlbmd0aCBhbmltYXRpb24gXCJwYXVzZVwiIGJ1dCB3ZSB3YW50IHRvIGtlZXAgaXQgc21vb3RoXG4gICAqIHNvIGluIGNhc2Ugd2UgaGF2ZSBzb21lIFwibGVmdG92ZXJcIiBsZW5ndGggZnJvbSB0aGUgcHJldmlvdXMgYW5pbWF0aW9uIHdlIGFkZCBpdCB0byB0aGUgY3VycmVudCBsZW5ndGguXG4gICAqXG4gICAqIFRoaXMgaXMgbm90IHBlcmZlY3QgYmVjYXVzZSB0aGUgYW5pbWF0aW9uIGNoYW5nZXMgc3BlZWQgZHVlIHRvIGVhc2luZy4gVGhlIGRlZmF1bHQgZWFzaW5nIGlzICdlYXNlJyB3aGljaCBpcyBub3QgbGluZWFyXG4gICAqIGFuZCBtYWtlcyBpdCBzdGFuZCBvdXQuIEJ1dCBpdCdzIGdvb2QgZW5vdWdoIEkgc3VwcG9zZS5cbiAgICogSWYgd2Ugd2FudCB0byBmaXggaXQgdGhlbiB3ZSBuZWVkIHRvIGtlZXAgdHJhY2sgb2YgbXVsdGlwbGUgYW5pbWF0aW9ucyBhbmQgdGhlaXIgZWFzaW5nIGFuZCB0aW1pbmdzLlxuICAgKlxuICAgKiBJZiB5b3Ugd2FudCB0byBzZWUgdGhpcyBpbiBhY3Rpb24sIHRyeSB0byBjaGFuZ2UgdGhlIGRhdGFLZXkgb2YgdGhlIGxpbmUgY2hhcnQgd2hpbGUgdGhlIGluaXRpYWwgYW5pbWF0aW9uIGlzIHJ1bm5pbmcuXG4gICAqIFRoZSBMaW5lIGJlZ2lucyB3aXRoIHplcm8gbGVuZ3RoIGFuZCBzbG93bHkgZ3Jvd3MgdG8gdGhlIGZ1bGwgbGVuZ3RoLiBXaGlsZSB0aGlzIGdyb3d0aCBpcyBpbiBwcm9ncmVzcyxcbiAgICogY2hhbmdlIHRoZSBkYXRhS2V5IGFuZCB0aGUgTGluZSB3aWxsIGNvbnRpbnVlIGdyb3dpbmcgZnJvbSB3aGVyZSBpdCBoYXMgZ3Jvd24gc28gZmFyLlxuICAgKi9cbiAgdmFyIHN0YXJ0aW5nUG9pbnQgPSBsb25nZXN0QW5pbWF0ZWRMZW5ndGhSZWYuY3VycmVudDtcbiAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExpbmVMYWJlbExpc3RQcm92aWRlciwge1xuICAgIHBvaW50czogcG9pbnRzLFxuICAgIHNob3dMYWJlbHM6IHNob3dMYWJlbHNcbiAgfSwgcHJvcHMuY2hpbGRyZW4sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEphdmFzY3JpcHRBbmltYXRlLCB7XG4gICAgYW5pbWF0aW9uSWQ6IGFuaW1hdGlvbklkLFxuICAgIGJlZ2luOiBhbmltYXRpb25CZWdpbixcbiAgICBkdXJhdGlvbjogYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgaXNBY3RpdmU6IGlzQW5pbWF0aW9uQWN0aXZlLFxuICAgIGVhc2luZzogYW5pbWF0aW9uRWFzaW5nLFxuICAgIG9uQW5pbWF0aW9uRW5kOiBoYW5kbGVBbmltYXRpb25FbmQsXG4gICAgb25BbmltYXRpb25TdGFydDogaGFuZGxlQW5pbWF0aW9uU3RhcnQsXG4gICAga2V5OiBhbmltYXRpb25JZFxuICB9LCB0ID0+IHtcbiAgICB2YXIgbGVuZ3RoSW50ZXJwb2xhdGVkID0gaW50ZXJwb2xhdGUoc3RhcnRpbmdQb2ludCwgdG90YWxMZW5ndGggKyBzdGFydGluZ1BvaW50LCB0KTtcbiAgICB2YXIgY3VyTGVuZ3RoID0gTWF0aC5taW4obGVuZ3RoSW50ZXJwb2xhdGVkLCB0b3RhbExlbmd0aCk7XG4gICAgdmFyIGN1cnJlbnRTdHJva2VEYXNoYXJyYXk7XG4gICAgaWYgKGlzQW5pbWF0aW9uQWN0aXZlKSB7XG4gICAgICBpZiAoc3Ryb2tlRGFzaGFycmF5KSB7XG4gICAgICAgIHZhciBsaW5lcyA9IFwiXCIuY29uY2F0KHN0cm9rZURhc2hhcnJheSkuc3BsaXQoL1ssXFxzXSsvZ2ltKS5tYXAobnVtID0+IHBhcnNlRmxvYXQobnVtKSk7XG4gICAgICAgIGN1cnJlbnRTdHJva2VEYXNoYXJyYXkgPSBnZXRTdHJva2VEYXNoYXJyYXkoY3VyTGVuZ3RoLCB0b3RhbExlbmd0aCwgbGluZXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudFN0cm9rZURhc2hhcnJheSA9IGdlbmVyYXRlU2ltcGxlU3Ryb2tlRGFzaGFycmF5KHRvdGFsTGVuZ3RoLCBjdXJMZW5ndGgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50U3Ryb2tlRGFzaGFycmF5ID0gc3Ryb2tlRGFzaGFycmF5ID09IG51bGwgPyB1bmRlZmluZWQgOiBTdHJpbmcoc3Ryb2tlRGFzaGFycmF5KTtcbiAgICB9XG4gICAgaWYgKHByZXZQb2ludHMpIHtcbiAgICAgIHZhciBwcmV2UG9pbnRzRGlmZkZhY3RvciA9IHByZXZQb2ludHMubGVuZ3RoIC8gcG9pbnRzLmxlbmd0aDtcbiAgICAgIHZhciBzdGVwRGF0YSA9IHQgPT09IDEgPyBwb2ludHMgOiBwb2ludHMubWFwKChlbnRyeSwgaW5kZXgpID0+IHtcbiAgICAgICAgdmFyIHByZXZQb2ludEluZGV4ID0gTWF0aC5mbG9vcihpbmRleCAqIHByZXZQb2ludHNEaWZmRmFjdG9yKTtcbiAgICAgICAgaWYgKHByZXZQb2ludHNbcHJldlBvaW50SW5kZXhdKSB7XG4gICAgICAgICAgdmFyIHByZXYgPSBwcmV2UG9pbnRzW3ByZXZQb2ludEluZGV4XTtcbiAgICAgICAgICByZXR1cm4gX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCBlbnRyeSksIHt9LCB7XG4gICAgICAgICAgICB4OiBpbnRlcnBvbGF0ZShwcmV2LngsIGVudHJ5LngsIHQpLFxuICAgICAgICAgICAgeTogaW50ZXJwb2xhdGUocHJldi55LCBlbnRyeS55LCB0KVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWFnaWMgbnVtYmVyIG9mIGZha2luZyBwcmV2aW91cyB4IGFuZCB5IGxvY2F0aW9uXG4gICAgICAgIGlmIChhbmltYXRlTmV3VmFsdWVzKSB7XG4gICAgICAgICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgZW50cnkpLCB7fSwge1xuICAgICAgICAgICAgeDogaW50ZXJwb2xhdGUod2lkdGggKiAyLCBlbnRyeS54LCB0KSxcbiAgICAgICAgICAgIHk6IGludGVycG9sYXRlKGhlaWdodCAvIDIsIGVudHJ5LnksIHQpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7fSwgZW50cnkpLCB7fSwge1xuICAgICAgICAgIHg6IGVudHJ5LngsXG4gICAgICAgICAgeTogZW50cnkueVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICBwcmV2aW91c1BvaW50c1JlZi5jdXJyZW50ID0gc3RlcERhdGE7XG4gICAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU3RhdGljQ3VydmUsIHtcbiAgICAgICAgcHJvcHM6IHByb3BzLFxuICAgICAgICBwb2ludHM6IHN0ZXBEYXRhLFxuICAgICAgICBjbGlwUGF0aElkOiBjbGlwUGF0aElkLFxuICAgICAgICBwYXRoUmVmOiBwYXRoUmVmLFxuICAgICAgICBzdHJva2VEYXNoYXJyYXk6IGN1cnJlbnRTdHJva2VEYXNoYXJyYXlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogSGVyZSBpdCBpcyBpbXBvcnRhbnQgdG8gd2FpdCBhIGxpdHRsZSBiaXQgd2l0aCB1cGRhdGluZyB0aGUgcHJldmlvdXNQb2ludHNSZWZcbiAgICAgKiBiZWZvcmUgdGhlIGFuaW1hdGlvbiBoYXMgYSB0aW1lIHRvIGluaXRpYWxpemUuXG4gICAgICogSWYgd2Ugc2V0IHRoZSBwcmV2aW91cyBwb2ludHNSZWYgaW1tZWRpYXRlbHksIHdlIHNldCBpdCBiZWZvcmUgdGhlIExlZ2VuZCBoZWlnaHQgaXQgY2FsY3VsYXRlZFxuICAgICAqIGFuZCBiZWZvcmUgcGF0aFJlZiBpcyBzZXQuXG4gICAgICogSWYgdGhhdCBoYXBwZW5zLCB0aGUgTGluZSB3aWxsIHJlLXJlbmRlciBhZ2FpbiBhZnRlciBMZWdlbmQgaGFkIHJlcG9ydGVkIGl0cyBoZWlnaHRcbiAgICAgKiB3aGljaCB3aWxsIHN0YXJ0IGEgbmV3IGFuaW1hdGlvbiB3aXRoIHRoZSBwcmV2aW91cyBwb2ludHMgYXMgdGhlIHN0YXJ0aW5nIHBvaW50XG4gICAgICogd2hpY2ggZ2l2ZXMgdGhlIGVmZmVjdCBvZiB0aGUgTGluZSBhbmltYXRpbmcgc2xpZ2h0bHkgdXB3YXJkcyAod2hlcmUgdGhlIGFuaW1hdGlvbiBkaXN0YW5jZSBlcXVhbHMgdGhlIExlZ2VuZCBoZWlnaHQpLlxuICAgICAqIFdhaXRpbmcgZm9yIHQgPiAwIGlzIGluZGlyZWN0IGJ1dCBnb29kIGVub3VnaCB0byBlbnN1cmUgdGhhdCB0aGUgTGVnZW5kIGhlaWdodCBpcyBjYWxjdWxhdGVkIGFuZCBhbmltYXRpb24gd29ya3MgcHJvcGVybHkuXG4gICAgICpcbiAgICAgKiBUb3RhbCBsZW5ndGggc2ltaWxhcmx5IGlzIGNhbGN1bGF0ZWQgZnJvbSB0aGUgcGF0aFJlZi4gV2Ugc2hvdWxkIG5vdCB1cGRhdGUgdGhlIHByZXZpb3VzUG9pbnRzUmVmXG4gICAgICogYmVmb3JlIHRoZSBwYXRoUmVmIGlzIHNldCwgb3RoZXJ3aXNlIHdlIHdpbGwgaGF2ZSBhIHdyb25nIHRvdGFsIGxlbmd0aC5cbiAgICAgKi9cbiAgICBpZiAodCA+IDAgJiYgdG90YWxMZW5ndGggPiAwKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICAgIHByZXZpb3VzUG9pbnRzUmVmLmN1cnJlbnQgPSBwb2ludHM7XG4gICAgICAvKlxuICAgICAgICogdG90YWxMZW5ndGggaXMgc2V0IGZyb20gYSByZWYgYW5kIGlzIG5vdCB1cGRhdGVkIGluIHRoZSBmaXJzdCB0aWNrIG9mIHRoZSBhbmltYXRpb24uXG4gICAgICAgKiBJdCBkZWZhdWx0cyB0byB6ZXJvIHdoaWNoIGlzIGV4YWN0bHkgd2hhdCB3ZSB3YW50IGhlcmUgYmVjYXVzZSB3ZSB3YW50IHRvIGdyb3cgZnJvbSB6ZXJvLFxuICAgICAgICogaG93ZXZlciB0aGUgc2FtZSBoYXBwZW5zIHdoZW4gdGhlIGRhdGEgY2hhbmdlLlxuICAgICAgICpcbiAgICAgICAqIEluIHRoYXQgY2FzZSB3ZSB3YW50IHRvIHJlbWVtYmVyIHRoZSBwcmV2aW91cyBsZW5ndGggYW5kIGNvbnRpbnVlIGZyb20gdGhlcmUsIGFuZCBvbmx5IGFuaW1hdGUgdGhlIHNoYXBlLlxuICAgICAgICpcbiAgICAgICAqIFRoZXJlZm9yZSB0aGUgdG90YWxMZW5ndGggPiAwIGNoZWNrLlxuICAgICAgICpcbiAgICAgICAqIFRoZSBBbmltYXRlIGlzIGFib3V0IHRvIGZpcmUgaGFuZGxlQW5pbWF0aW9uU3RhcnQgd2hpY2ggd2lsbCB1cGRhdGUgdGhlIHN0YXRlXG4gICAgICAgKiBhbmQgY2F1c2UgYSByZS1yZW5kZXIgYW5kIHJlYWQgYSBuZXcgcHJvcGVyIHRvdGFsTGVuZ3RoIHdoaWNoIHdpbGwgYmUgdXNlZCBpbiB0aGUgbmV4dCB0aWNrXG4gICAgICAgKiBhbmQgdXBkYXRlIHRoZSBsb25nZXN0QW5pbWF0ZWRMZW5ndGhSZWYuXG4gICAgICAgKi9cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgbG9uZ2VzdEFuaW1hdGVkTGVuZ3RoUmVmLmN1cnJlbnQgPSBjdXJMZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTdGF0aWNDdXJ2ZSwge1xuICAgICAgcHJvcHM6IHByb3BzLFxuICAgICAgcG9pbnRzOiBwb2ludHMsXG4gICAgICBjbGlwUGF0aElkOiBjbGlwUGF0aElkLFxuICAgICAgcGF0aFJlZjogcGF0aFJlZixcbiAgICAgIHN0cm9rZURhc2hhcnJheTogY3VycmVudFN0cm9rZURhc2hhcnJheVxuICAgIH0pO1xuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGFiZWxMaXN0RnJvbUxhYmVsUHJvcCwge1xuICAgIGxhYmVsOiBwcm9wcy5sYWJlbFxuICB9KSk7XG59XG5mdW5jdGlvbiBSZW5kZXJDdXJ2ZShfcmVmNSkge1xuICB2YXIge1xuICAgIGNsaXBQYXRoSWQsXG4gICAgcHJvcHNcbiAgfSA9IF9yZWY1O1xuICB2YXIgcHJldmlvdXNQb2ludHNSZWYgPSB1c2VSZWYobnVsbCk7XG4gIHZhciBsb25nZXN0QW5pbWF0ZWRMZW5ndGhSZWYgPSB1c2VSZWYoMCk7XG4gIHZhciBwYXRoUmVmID0gdXNlUmVmKG51bGwpO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ3VydmVXaXRoQW5pbWF0aW9uLCB7XG4gICAgcHJvcHM6IHByb3BzLFxuICAgIGNsaXBQYXRoSWQ6IGNsaXBQYXRoSWQsXG4gICAgcHJldmlvdXNQb2ludHNSZWY6IHByZXZpb3VzUG9pbnRzUmVmLFxuICAgIGxvbmdlc3RBbmltYXRlZExlbmd0aFJlZjogbG9uZ2VzdEFuaW1hdGVkTGVuZ3RoUmVmLFxuICAgIHBhdGhSZWY6IHBhdGhSZWZcbiAgfSk7XG59XG52YXIgZXJyb3JCYXJEYXRhUG9pbnRGb3JtYXR0ZXIgPSAoZGF0YVBvaW50LCBkYXRhS2V5KSA9PiB7XG4gIHJldHVybiB7XG4gICAgeDogZGF0YVBvaW50LngsXG4gICAgeTogZGF0YVBvaW50LnksXG4gICAgdmFsdWU6IGRhdGFQb2ludC52YWx1ZSxcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGdldFZhbHVlQnlEYXRhS2V5IGRvZXMgbm90IHZhbGlkYXRlIHRoZSBvdXRwdXQgdHlwZVxuICAgIGVycm9yVmFsOiBnZXRWYWx1ZUJ5RGF0YUtleShkYXRhUG9pbnQucGF5bG9hZCwgZGF0YUtleSlcbiAgfTtcbn07XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSByZWFjdC9wcmVmZXItc3RhdGVsZXNzLWZ1bmN0aW9uXG5jbGFzcyBMaW5lV2l0aFN0YXRlIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgcmVuZGVyKCkge1xuICAgIHZhciB7XG4gICAgICBoaWRlLFxuICAgICAgZG90LFxuICAgICAgcG9pbnRzLFxuICAgICAgY2xhc3NOYW1lLFxuICAgICAgeEF4aXNJZCxcbiAgICAgIHlBeGlzSWQsXG4gICAgICB0b3AsXG4gICAgICBsZWZ0LFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBpZCxcbiAgICAgIG5lZWRDbGlwXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKGhpZGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB2YXIgbGF5ZXJDbGFzcyA9IGNsc3goJ3JlY2hhcnRzLWxpbmUnLCBjbGFzc05hbWUpO1xuICAgIHZhciBjbGlwUGF0aElkID0gaWQ7XG4gICAgdmFyIHtcbiAgICAgIHIsXG4gICAgICBzdHJva2VXaWR0aFxuICAgIH0gPSBnZXRSYWRpdXNBbmRTdHJva2VXaWR0aEZyb21Eb3QoZG90KTtcbiAgICB2YXIgY2xpcERvdCA9IGlzQ2xpcERvdChkb3QpO1xuICAgIHZhciBkb3RTaXplID0gciAqIDIgKyBzdHJva2VXaWR0aDtcbiAgICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KExheWVyLCB7XG4gICAgICBjbGFzc05hbWU6IGxheWVyQ2xhc3NcbiAgICB9LCBuZWVkQ2xpcCAmJiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChcImRlZnNcIiwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoR3JhcGhpY2FsSXRlbUNsaXBQYXRoLCB7XG4gICAgICBjbGlwUGF0aElkOiBjbGlwUGF0aElkLFxuICAgICAgeEF4aXNJZDogeEF4aXNJZCxcbiAgICAgIHlBeGlzSWQ6IHlBeGlzSWRcbiAgICB9KSwgIWNsaXBEb3QgJiYgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoXCJjbGlwUGF0aFwiLCB7XG4gICAgICBpZDogXCJjbGlwUGF0aC1kb3RzLVwiLmNvbmNhdChjbGlwUGF0aElkKVxuICAgIH0sIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFwicmVjdFwiLCB7XG4gICAgICB4OiBsZWZ0IC0gZG90U2l6ZSAvIDIsXG4gICAgICB5OiB0b3AgLSBkb3RTaXplIC8gMixcbiAgICAgIHdpZHRoOiB3aWR0aCArIGRvdFNpemUsXG4gICAgICBoZWlnaHQ6IGhlaWdodCArIGRvdFNpemVcbiAgICB9KSkpLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChTZXRFcnJvckJhckNvbnRleHQsIHtcbiAgICAgIHhBeGlzSWQ6IHhBeGlzSWQsXG4gICAgICB5QXhpc0lkOiB5QXhpc0lkLFxuICAgICAgZGF0YTogcG9pbnRzLFxuICAgICAgZGF0YVBvaW50Rm9ybWF0dGVyOiBlcnJvckJhckRhdGFQb2ludEZvcm1hdHRlcixcbiAgICAgIGVycm9yQmFyT2Zmc2V0OiAwXG4gICAgfSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVuZGVyQ3VydmUsIHtcbiAgICAgIHByb3BzOiB0aGlzLnByb3BzLFxuICAgICAgY2xpcFBhdGhJZDogY2xpcFBhdGhJZFxuICAgIH0pKSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KEFjdGl2ZVBvaW50cywge1xuICAgICAgYWN0aXZlRG90OiB0aGlzLnByb3BzLmFjdGl2ZURvdCxcbiAgICAgIHBvaW50czogcG9pbnRzLFxuICAgICAgbWFpbkNvbG9yOiB0aGlzLnByb3BzLnN0cm9rZSxcbiAgICAgIGl0ZW1EYXRhS2V5OiB0aGlzLnByb3BzLmRhdGFLZXlcbiAgICB9KSk7XG4gIH1cbn1cbnZhciBkZWZhdWx0TGluZVByb3BzID0ge1xuICBhY3RpdmVEb3Q6IHRydWUsXG4gIGFuaW1hdGVOZXdWYWx1ZXM6IHRydWUsXG4gIGFuaW1hdGlvbkJlZ2luOiAwLFxuICBhbmltYXRpb25EdXJhdGlvbjogMTUwMCxcbiAgYW5pbWF0aW9uRWFzaW5nOiAnZWFzZScsXG4gIGNvbm5lY3ROdWxsczogZmFsc2UsXG4gIGRvdDogdHJ1ZSxcbiAgZmlsbDogJyNmZmYnLFxuICBoaWRlOiBmYWxzZSxcbiAgaXNBbmltYXRpb25BY3RpdmU6ICFHbG9iYWwuaXNTc3IsXG4gIGxhYmVsOiBmYWxzZSxcbiAgbGVnZW5kVHlwZTogJ2xpbmUnLFxuICBzdHJva2U6ICcjMzE4MmJkJyxcbiAgc3Ryb2tlV2lkdGg6IDEsXG4gIHhBeGlzSWQ6IDAsXG4gIHlBeGlzSWQ6IDBcbn07XG5mdW5jdGlvbiBMaW5lSW1wbChwcm9wcykge1xuICB2YXIgX3Jlc29sdmVEZWZhdWx0UHJvcHMgPSByZXNvbHZlRGVmYXVsdFByb3BzKHByb3BzLCBkZWZhdWx0TGluZVByb3BzKSxcbiAgICB7XG4gICAgICBhY3RpdmVEb3QsXG4gICAgICBhbmltYXRlTmV3VmFsdWVzLFxuICAgICAgYW5pbWF0aW9uQmVnaW4sXG4gICAgICBhbmltYXRpb25EdXJhdGlvbixcbiAgICAgIGFuaW1hdGlvbkVhc2luZyxcbiAgICAgIGNvbm5lY3ROdWxscyxcbiAgICAgIGRvdCxcbiAgICAgIGhpZGUsXG4gICAgICBpc0FuaW1hdGlvbkFjdGl2ZSxcbiAgICAgIGxhYmVsLFxuICAgICAgbGVnZW5kVHlwZSxcbiAgICAgIHhBeGlzSWQsXG4gICAgICB5QXhpc0lkLFxuICAgICAgaWRcbiAgICB9ID0gX3Jlc29sdmVEZWZhdWx0UHJvcHMsXG4gICAgZXZlcnl0aGluZ0Vsc2UgPSBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoX3Jlc29sdmVEZWZhdWx0UHJvcHMsIF9leGNsdWRlZDMpO1xuICB2YXIge1xuICAgIG5lZWRDbGlwXG4gIH0gPSB1c2VOZWVkc0NsaXAoeEF4aXNJZCwgeUF4aXNJZCk7XG4gIHZhciBwbG90QXJlYSA9IHVzZVBsb3RBcmVhKCk7XG4gIHZhciBsYXlvdXQgPSB1c2VDaGFydExheW91dCgpO1xuICB2YXIgaXNQYW5vcmFtYSA9IHVzZUlzUGFub3JhbWEoKTtcbiAgdmFyIHBvaW50cyA9IHVzZUFwcFNlbGVjdG9yKHN0YXRlID0+IHNlbGVjdExpbmVQb2ludHMoc3RhdGUsIHhBeGlzSWQsIHlBeGlzSWQsIGlzUGFub3JhbWEsIGlkKSk7XG4gIGlmIChsYXlvdXQgIT09ICdob3Jpem9udGFsJyAmJiBsYXlvdXQgIT09ICd2ZXJ0aWNhbCcgfHwgcG9pbnRzID09IG51bGwgfHwgcGxvdEFyZWEgPT0gbnVsbCkge1xuICAgIC8vIENhbm5vdCByZW5kZXIgTGluZSBpbiBhbiB1bnN1cHBvcnRlZCBsYXlvdXRcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIge1xuICAgIGhlaWdodCxcbiAgICB3aWR0aCxcbiAgICB4OiBsZWZ0LFxuICAgIHk6IHRvcFxuICB9ID0gcGxvdEFyZWE7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChMaW5lV2l0aFN0YXRlLCBfZXh0ZW5kcyh7fSwgZXZlcnl0aGluZ0Vsc2UsIHtcbiAgICBpZDogaWQsXG4gICAgY29ubmVjdE51bGxzOiBjb25uZWN0TnVsbHMsXG4gICAgZG90OiBkb3QsXG4gICAgYWN0aXZlRG90OiBhY3RpdmVEb3QsXG4gICAgYW5pbWF0ZU5ld1ZhbHVlczogYW5pbWF0ZU5ld1ZhbHVlcyxcbiAgICBhbmltYXRpb25CZWdpbjogYW5pbWF0aW9uQmVnaW4sXG4gICAgYW5pbWF0aW9uRHVyYXRpb246IGFuaW1hdGlvbkR1cmF0aW9uLFxuICAgIGFuaW1hdGlvbkVhc2luZzogYW5pbWF0aW9uRWFzaW5nLFxuICAgIGlzQW5pbWF0aW9uQWN0aXZlOiBpc0FuaW1hdGlvbkFjdGl2ZSxcbiAgICBoaWRlOiBoaWRlLFxuICAgIGxhYmVsOiBsYWJlbCxcbiAgICBsZWdlbmRUeXBlOiBsZWdlbmRUeXBlLFxuICAgIHhBeGlzSWQ6IHhBeGlzSWQsXG4gICAgeUF4aXNJZDogeUF4aXNJZCxcbiAgICBwb2ludHM6IHBvaW50cyxcbiAgICBsYXlvdXQ6IGxheW91dCxcbiAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICB3aWR0aDogd2lkdGgsXG4gICAgbGVmdDogbGVmdCxcbiAgICB0b3A6IHRvcCxcbiAgICBuZWVkQ2xpcDogbmVlZENsaXBcbiAgfSkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVMaW5lUG9pbnRzKF9yZWY2KSB7XG4gIHZhciB7XG4gICAgbGF5b3V0LFxuICAgIHhBeGlzLFxuICAgIHlBeGlzLFxuICAgIHhBeGlzVGlja3MsXG4gICAgeUF4aXNUaWNrcyxcbiAgICBkYXRhS2V5LFxuICAgIGJhbmRTaXplLFxuICAgIGRpc3BsYXllZERhdGFcbiAgfSA9IF9yZWY2O1xuICByZXR1cm4gZGlzcGxheWVkRGF0YS5tYXAoKGVudHJ5LCBpbmRleCkgPT4ge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgZ2V0VmFsdWVCeURhdGFLZXkgZG9lcyBub3QgdmFsaWRhdGUgdGhlIG91dHB1dCB0eXBlXG4gICAgdmFyIHZhbHVlID0gZ2V0VmFsdWVCeURhdGFLZXkoZW50cnksIGRhdGFLZXkpO1xuICAgIGlmIChsYXlvdXQgPT09ICdob3Jpem9udGFsJykge1xuICAgICAgdmFyIF94ID0gZ2V0Q2F0ZUNvb3JkaW5hdGVPZkxpbmUoe1xuICAgICAgICBheGlzOiB4QXhpcyxcbiAgICAgICAgdGlja3M6IHhBeGlzVGlja3MsXG4gICAgICAgIGJhbmRTaXplLFxuICAgICAgICBlbnRyeSxcbiAgICAgICAgaW5kZXhcbiAgICAgIH0pO1xuICAgICAgdmFyIF95ID0gaXNOdWxsaXNoKHZhbHVlKSA/IG51bGwgOiB5QXhpcy5zY2FsZSh2YWx1ZSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiBfeCxcbiAgICAgICAgeTogX3ksXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBwYXlsb2FkOiBlbnRyeVxuICAgICAgfTtcbiAgICB9XG4gICAgdmFyIHggPSBpc051bGxpc2godmFsdWUpID8gbnVsbCA6IHhBeGlzLnNjYWxlKHZhbHVlKTtcbiAgICB2YXIgeSA9IGdldENhdGVDb29yZGluYXRlT2ZMaW5lKHtcbiAgICAgIGF4aXM6IHlBeGlzLFxuICAgICAgdGlja3M6IHlBeGlzVGlja3MsXG4gICAgICBiYW5kU2l6ZSxcbiAgICAgIGVudHJ5LFxuICAgICAgaW5kZXhcbiAgICB9KTtcbiAgICBpZiAoeCA9PSBudWxsIHx8IHkgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICB4LFxuICAgICAgeSxcbiAgICAgIHZhbHVlLFxuICAgICAgcGF5bG9hZDogZW50cnlcbiAgICB9O1xuICB9KS5maWx0ZXIoQm9vbGVhbik7XG59XG5mdW5jdGlvbiBMaW5lRm4ob3V0c2lkZVByb3BzKSB7XG4gIHZhciBwcm9wcyA9IHJlc29sdmVEZWZhdWx0UHJvcHMob3V0c2lkZVByb3BzLCBkZWZhdWx0TGluZVByb3BzKTtcbiAgdmFyIGlzUGFub3JhbWEgPSB1c2VJc1Bhbm9yYW1hKCk7XG4gIHJldHVybiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWdpc3RlckdyYXBoaWNhbEl0ZW1JZCwge1xuICAgIGlkOiBwcm9wcy5pZCxcbiAgICB0eXBlOiBcImxpbmVcIlxuICB9LCBpZCA9PiAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChSZWFjdC5GcmFnbWVudCwgbnVsbCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0TGVnZW5kUGF5bG9hZCwge1xuICAgIGxlZ2VuZFBheWxvYWQ6IGNvbXB1dGVMZWdlbmRQYXlsb2FkRnJvbUFyZWFEYXRhKHByb3BzKVxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoU2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MsIHtcbiAgICBmbjogZ2V0VG9vbHRpcEVudHJ5U2V0dGluZ3MsXG4gICAgYXJnczogcHJvcHNcbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFNldENhcnRlc2lhbkdyYXBoaWNhbEl0ZW0sIHtcbiAgICB0eXBlOiBcImxpbmVcIixcbiAgICBpZDogaWQsXG4gICAgZGF0YTogcHJvcHMuZGF0YSxcbiAgICB4QXhpc0lkOiBwcm9wcy54QXhpc0lkLFxuICAgIHlBeGlzSWQ6IHByb3BzLnlBeGlzSWQsXG4gICAgekF4aXNJZDogMCxcbiAgICBkYXRhS2V5OiBwcm9wcy5kYXRhS2V5LFxuICAgIGhpZGU6IHByb3BzLmhpZGUsXG4gICAgaXNQYW5vcmFtYTogaXNQYW5vcmFtYVxuICB9KSwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGluZUltcGwsIF9leHRlbmRzKHt9LCBwcm9wcywge1xuICAgIGlkOiBpZFxuICB9KSkpKTtcbn1cbmV4cG9ydCB2YXIgTGluZSA9IC8qI19fUFVSRV9fKi9SZWFjdC5tZW1vKExpbmVGbik7XG5MaW5lLmRpc3BsYXlOYW1lID0gJ0xpbmUnOyIsImZ1bmN0aW9uIG93bktleXMoZSwgcikgeyB2YXIgdCA9IE9iamVjdC5rZXlzKGUpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZSk7IHIgJiYgKG8gPSBvLmZpbHRlcihmdW5jdGlvbiAocikgeyByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihlLCByKS5lbnVtZXJhYmxlOyB9KSksIHQucHVzaC5hcHBseSh0LCBvKTsgfSByZXR1cm4gdDsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZChlKSB7IGZvciAodmFyIHIgPSAxOyByIDwgYXJndW1lbnRzLmxlbmd0aDsgcisrKSB7IHZhciB0ID0gbnVsbCAhPSBhcmd1bWVudHNbcl0gPyBhcmd1bWVudHNbcl0gOiB7fTsgciAlIDIgPyBvd25LZXlzKE9iamVjdCh0KSwgITApLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgX2RlZmluZVByb3BlcnR5KGUsIHIsIHRbcl0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoZSwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnModCkpIDogb3duS2V5cyhPYmplY3QodCkpLmZvckVhY2goZnVuY3Rpb24gKHIpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsIHIsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodCwgcikpOyB9KTsgfSByZXR1cm4gZTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KGUsIHIsIHQpIHsgcmV0dXJuIChyID0gX3RvUHJvcGVydHlLZXkocikpIGluIGUgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkoZSwgciwgeyB2YWx1ZTogdCwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSA6IGVbcl0gPSB0LCBlOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleSh0KSB7IHZhciBpID0gX3RvUHJpbWl0aXZlKHQsIFwic3RyaW5nXCIpOyByZXR1cm4gXCJzeW1ib2xcIiA9PSB0eXBlb2YgaSA/IGkgOiBpICsgXCJcIjsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKHQsIHIpIHsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIHQgfHwgIXQpIHJldHVybiB0OyB2YXIgZSA9IHRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHZvaWQgMCAhPT0gZSkgeyB2YXIgaSA9IGUuY2FsbCh0LCByIHx8IFwiZGVmYXVsdFwiKTsgaWYgKFwib2JqZWN0XCIgIT0gdHlwZW9mIGkpIHJldHVybiBpOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChcInN0cmluZ1wiID09PSByID8gU3RyaW5nIDogTnVtYmVyKSh0KTsgfVxuZnVuY3Rpb24gX2V4dGVuZHMoKSB7IHJldHVybiBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gPyBPYmplY3QuYXNzaWduLmJpbmQoKSA6IGZ1bmN0aW9uIChuKSB7IGZvciAodmFyIGUgPSAxOyBlIDwgYXJndW1lbnRzLmxlbmd0aDsgZSsrKSB7IHZhciB0ID0gYXJndW1lbnRzW2VdOyBmb3IgKHZhciByIGluIHQpICh7fSkuaGFzT3duUHJvcGVydHkuY2FsbCh0LCByKSAmJiAobltyXSA9IHRbcl0pOyB9IHJldHVybiBuOyB9LCBfZXh0ZW5kcy5hcHBseShudWxsLCBhcmd1bWVudHMpOyB9XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBDb21wb25lbnQsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNsc3ggfSBmcm9tICdjbHN4JztcbmltcG9ydCB7IExheWVyIH0gZnJvbSAnLi4vY29udGFpbmVyL0xheWVyJztcbmltcG9ydCB7IENhcnRlc2lhbkxhYmVsQ29udGV4dFByb3ZpZGVyLCBDYXJ0ZXNpYW5MYWJlbEZyb21MYWJlbFByb3AgfSBmcm9tICcuLi9jb21wb25lbnQvTGFiZWwnO1xuaW1wb3J0IHsgY3JlYXRlTGFiZWxlZFNjYWxlcywgcmVjdFdpdGhQb2ludHMgfSBmcm9tICcuLi91dGlsL0NhcnRlc2lhblV0aWxzJztcbmltcG9ydCB7IGlzTnVtT3JTdHIgfSBmcm9tICcuLi91dGlsL0RhdGFVdGlscyc7XG5pbXBvcnQgeyBSZWN0YW5nbGUgfSBmcm9tICcuLi9zaGFwZS9SZWN0YW5nbGUnO1xuaW1wb3J0IHsgYWRkQXJlYSwgcmVtb3ZlQXJlYSB9IGZyb20gJy4uL3N0YXRlL3JlZmVyZW5jZUVsZW1lbnRzU2xpY2UnO1xuaW1wb3J0IHsgdXNlQXBwRGlzcGF0Y2gsIHVzZUFwcFNlbGVjdG9yIH0gZnJvbSAnLi4vc3RhdGUvaG9va3MnO1xuaW1wb3J0IHsgc2VsZWN0QXhpc1NjYWxlIH0gZnJvbSAnLi4vc3RhdGUvc2VsZWN0b3JzL2F4aXNTZWxlY3RvcnMnO1xuaW1wb3J0IHsgdXNlSXNQYW5vcmFtYSB9IGZyb20gJy4uL2NvbnRleHQvUGFub3JhbWFDb250ZXh0JztcbmltcG9ydCB7IHVzZUNsaXBQYXRoSWQgfSBmcm9tICcuLi9jb250YWluZXIvQ2xpcFBhdGhQcm92aWRlcic7XG5pbXBvcnQgeyBzdmdQcm9wZXJ0aWVzQW5kRXZlbnRzIH0gZnJvbSAnLi4vdXRpbC9zdmdQcm9wZXJ0aWVzQW5kRXZlbnRzJztcbnZhciBnZXRSZWN0ID0gKGhhc1gxLCBoYXNYMiwgaGFzWTEsIGhhc1kyLCB4QXhpc1NjYWxlLCB5QXhpc1NjYWxlLCBwcm9wcykgPT4ge1xuICB2YXIge1xuICAgIHgxOiB4VmFsdWUxLFxuICAgIHgyOiB4VmFsdWUyLFxuICAgIHkxOiB5VmFsdWUxLFxuICAgIHkyOiB5VmFsdWUyXG4gIH0gPSBwcm9wcztcbiAgaWYgKHhBeGlzU2NhbGUgPT0gbnVsbCB8fCB5QXhpc1NjYWxlID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2YXIgc2NhbGVzID0gY3JlYXRlTGFiZWxlZFNjYWxlcyh7XG4gICAgeDogeEF4aXNTY2FsZSxcbiAgICB5OiB5QXhpc1NjYWxlXG4gIH0pO1xuICB2YXIgcDEgPSB7XG4gICAgeDogaGFzWDEgPyBzY2FsZXMueC5hcHBseSh4VmFsdWUxLCB7XG4gICAgICBwb3NpdGlvbjogJ3N0YXJ0J1xuICAgIH0pIDogc2NhbGVzLngucmFuZ2VNaW4sXG4gICAgeTogaGFzWTEgPyBzY2FsZXMueS5hcHBseSh5VmFsdWUxLCB7XG4gICAgICBwb3NpdGlvbjogJ3N0YXJ0J1xuICAgIH0pIDogc2NhbGVzLnkucmFuZ2VNaW5cbiAgfTtcbiAgdmFyIHAyID0ge1xuICAgIHg6IGhhc1gyID8gc2NhbGVzLnguYXBwbHkoeFZhbHVlMiwge1xuICAgICAgcG9zaXRpb246ICdlbmQnXG4gICAgfSkgOiBzY2FsZXMueC5yYW5nZU1heCxcbiAgICB5OiBoYXNZMiA/IHNjYWxlcy55LmFwcGx5KHlWYWx1ZTIsIHtcbiAgICAgIHBvc2l0aW9uOiAnZW5kJ1xuICAgIH0pIDogc2NhbGVzLnkucmFuZ2VNYXhcbiAgfTtcbiAgaWYgKHByb3BzLmlmT3ZlcmZsb3cgPT09ICdkaXNjYXJkJyAmJiAoIXNjYWxlcy5pc0luUmFuZ2UocDEpIHx8ICFzY2FsZXMuaXNJblJhbmdlKHAyKSkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gcmVjdFdpdGhQb2ludHMocDEsIHAyKTtcbn07XG52YXIgcmVuZGVyUmVjdCA9IChvcHRpb24sIHByb3BzKSA9PiB7XG4gIHZhciByZWN0O1xuICBpZiAoLyojX19QVVJFX18qL1JlYWN0LmlzVmFsaWRFbGVtZW50KG9wdGlvbikpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGVsZW1lbnQgY2xvbmluZyBpcyBub3QgdHlwZWRcbiAgICByZWN0ID0gLyojX19QVVJFX18qL1JlYWN0LmNsb25lRWxlbWVudChvcHRpb24sIHByb3BzKTtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmVjdCA9IG9wdGlvbihwcm9wcyk7XG4gIH0gZWxzZSB7XG4gICAgcmVjdCA9IC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlY3RhbmdsZSwgX2V4dGVuZHMoe30sIHByb3BzLCB7XG4gICAgICBjbGFzc05hbWU6IFwicmVjaGFydHMtcmVmZXJlbmNlLWFyZWEtcmVjdFwiXG4gICAgfSkpO1xuICB9XG4gIHJldHVybiByZWN0O1xufTtcbmZ1bmN0aW9uIFJlcG9ydFJlZmVyZW5jZUFyZWEocHJvcHMpIHtcbiAgdmFyIGRpc3BhdGNoID0gdXNlQXBwRGlzcGF0Y2goKTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBkaXNwYXRjaChhZGRBcmVhKHByb3BzKSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRpc3BhdGNoKHJlbW92ZUFyZWEocHJvcHMpKTtcbiAgICB9O1xuICB9KTtcbiAgcmV0dXJuIG51bGw7XG59XG5mdW5jdGlvbiBSZWZlcmVuY2VBcmVhSW1wbChwcm9wcykge1xuICB2YXIge1xuICAgIHgxLFxuICAgIHgyLFxuICAgIHkxLFxuICAgIHkyLFxuICAgIGNsYXNzTmFtZSxcbiAgICBzaGFwZSxcbiAgICB4QXhpc0lkLFxuICAgIHlBeGlzSWRcbiAgfSA9IHByb3BzO1xuICB2YXIgY2xpcFBhdGhJZCA9IHVzZUNsaXBQYXRoSWQoKTtcbiAgdmFyIGlzUGFub3JhbWEgPSB1c2VJc1Bhbm9yYW1hKCk7XG4gIHZhciB4QXhpc1NjYWxlID0gdXNlQXBwU2VsZWN0b3Ioc3RhdGUgPT4gc2VsZWN0QXhpc1NjYWxlKHN0YXRlLCAneEF4aXMnLCB4QXhpc0lkLCBpc1Bhbm9yYW1hKSk7XG4gIHZhciB5QXhpc1NjYWxlID0gdXNlQXBwU2VsZWN0b3Ioc3RhdGUgPT4gc2VsZWN0QXhpc1NjYWxlKHN0YXRlLCAneUF4aXMnLCB5QXhpc0lkLCBpc1Bhbm9yYW1hKSk7XG4gIGlmICh4QXhpc1NjYWxlID09IG51bGwgfHwgIXlBeGlzU2NhbGUgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciBoYXNYMSA9IGlzTnVtT3JTdHIoeDEpO1xuICB2YXIgaGFzWDIgPSBpc051bU9yU3RyKHgyKTtcbiAgdmFyIGhhc1kxID0gaXNOdW1PclN0cih5MSk7XG4gIHZhciBoYXNZMiA9IGlzTnVtT3JTdHIoeTIpO1xuICBpZiAoIWhhc1gxICYmICFoYXNYMiAmJiAhaGFzWTEgJiYgIWhhc1kyICYmICFzaGFwZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZhciByZWN0ID0gZ2V0UmVjdChoYXNYMSwgaGFzWDIsIGhhc1kxLCBoYXNZMiwgeEF4aXNTY2FsZSwgeUF4aXNTY2FsZSwgcHJvcHMpO1xuICBpZiAoIXJlY3QgJiYgIXNoYXBlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmFyIGlzT3ZlcmZsb3dIaWRkZW4gPSBwcm9wcy5pZk92ZXJmbG93ID09PSAnaGlkZGVuJztcbiAgdmFyIGNsaXBQYXRoID0gaXNPdmVyZmxvd0hpZGRlbiA/IFwidXJsKCNcIi5jb25jYXQoY2xpcFBhdGhJZCwgXCIpXCIpIDogdW5kZWZpbmVkO1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoTGF5ZXIsIHtcbiAgICBjbGFzc05hbWU6IGNsc3goJ3JlY2hhcnRzLXJlZmVyZW5jZS1hcmVhJywgY2xhc3NOYW1lKVxuICB9LCByZW5kZXJSZWN0KHNoYXBlLCBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe1xuICAgIGNsaXBQYXRoXG4gIH0sIHN2Z1Byb3BlcnRpZXNBbmRFdmVudHMocHJvcHMpKSwgcmVjdCkpLCAvKiNfX1BVUkVfXyovUmVhY3QuY3JlYXRlRWxlbWVudChDYXJ0ZXNpYW5MYWJlbENvbnRleHRQcm92aWRlciwgcmVjdCwgLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoQ2FydGVzaWFuTGFiZWxGcm9tTGFiZWxQcm9wLCB7XG4gICAgbGFiZWw6IHByb3BzLmxhYmVsXG4gIH0pLCBwcm9wcy5jaGlsZHJlbikpO1xufVxuZnVuY3Rpb24gUmVmZXJlbmNlQXJlYVNldHRpbmdzRGlzcGF0Y2hlcihwcm9wcykge1xuICByZXR1cm4gLyojX19QVVJFX18qL1JlYWN0LmNyZWF0ZUVsZW1lbnQoUmVhY3QuRnJhZ21lbnQsIG51bGwsIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlcG9ydFJlZmVyZW5jZUFyZWEsIHtcbiAgICB5QXhpc0lkOiBwcm9wcy55QXhpc0lkLFxuICAgIHhBeGlzSWQ6IHByb3BzLnhBeGlzSWQsXG4gICAgaWZPdmVyZmxvdzogcHJvcHMuaWZPdmVyZmxvdyxcbiAgICB4MTogcHJvcHMueDEsXG4gICAgeDI6IHByb3BzLngyLFxuICAgIHkxOiBwcm9wcy55MSxcbiAgICB5MjogcHJvcHMueTJcbiAgfSksIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlZmVyZW5jZUFyZWFJbXBsLCBwcm9wcykpO1xufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QvcHJlZmVyLXN0YXRlbGVzcy1mdW5jdGlvblxuZXhwb3J0IGNsYXNzIFJlZmVyZW5jZUFyZWEgZXh0ZW5kcyBDb21wb25lbnQge1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIC8qI19fUFVSRV9fKi9SZWFjdC5jcmVhdGVFbGVtZW50KFJlZmVyZW5jZUFyZWFTZXR0aW5nc0Rpc3BhdGNoZXIsIHRoaXMucHJvcHMpO1xuICB9XG59XG5fZGVmaW5lUHJvcGVydHkoUmVmZXJlbmNlQXJlYSwgXCJkaXNwbGF5TmFtZVwiLCAnUmVmZXJlbmNlQXJlYScpO1xuX2RlZmluZVByb3BlcnR5KFJlZmVyZW5jZUFyZWEsIFwiZGVmYXVsdFByb3BzXCIsIHtcbiAgaWZPdmVyZmxvdzogJ2Rpc2NhcmQnLFxuICB4QXhpc0lkOiAwLFxuICB5QXhpc0lkOiAwLFxuICByOiAxMCxcbiAgZmlsbDogJyNjY2MnLFxuICBmaWxsT3BhY2l0eTogMC41LFxuICBzdHJva2U6ICdub25lJyxcbiAgc3Ryb2tlV2lkdGg6IDFcbn0pOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==